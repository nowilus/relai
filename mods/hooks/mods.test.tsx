import { describe, expect, mock, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'
import { DRAW_LIMIT, REFRESH_MS, treeWeight } from './cockpit'
import { cliError, enabledOf, toggleArgv } from './inventory'

type On = Parameters<TestBody>[1]

const HOME = 'C:\\Users\\Ktos'
const CWD = 'C:/proj'
const PARKLY = 'C:\\Users\\Ktos\\Desktop\\Parkly'

// Six installs: a disabled mod, another project's local plugin with no key, the cockpit itself,
// a plugin under policy, one overridden by this project's local file, and relai
const INSTALLS: Record<string, unknown[]> = {
  'filetree@claude-code-filetree': [{ scope: 'user', version: '0.2.24', installPath: 'C:\\x\\filetree' }],
  'security-guidance@claude-plugins-official': [{ scope: 'local', projectPath: PARKLY, version: '2.0.0', installPath: 'C:\\x\\sg' }],
  'relai@relai': [{ scope: 'user', version: '3.2.0', installPath: 'C:\\x\\relai' }],
  'relai-mods@relai': [{ scope: 'user', version: '0.0.1', installPath: 'C:\\x\\mods' }],
  'pol@corp': [{ scope: 'user', version: '1.0.0', installPath: 'C:\\x\\pol' }],
  'over@x': [{ scope: 'user', version: '1.0.0', installPath: 'C:\\x\\over' }],
}
const USER_ENABLED = { 'filetree@claude-code-filetree': false, 'relai@relai': true, 'relai-mods@relai': true, 'pol@corp': true, 'over@x': true, odd: 'yes' }
const settingsText = (enabled: Record<string, unknown>) => '\ufeff' + JSON.stringify({
  enabledPlugins: enabled,
  hooks: { Stop: [{ hooks: [{ type: 'command', command: 'node "C:\\h\\stop-me.js"' }] }] },
})

const FILETREE = 'plugin-filetree@claude-code-filetree-user-'
const SECURITY = 'plugin-security-guidance@claude-plugins-official-local-C:\\Users\\Ktos\\Desktop\\Parkly'
const SELF = 'plugin-relai-mods@relai-user-'
const POLICY = 'plugin-pol@corp-user-'
const OVER = 'plugin-over@x-user-'

describe('switch', () => {
  test('enabledPlugins keeps booleans only, a BOM is dropped', () => {
    expect(enabledOf(settingsText(USER_ENABLED))).toEqual({ 'filetree@claude-code-filetree': false, 'relai@relai': true, 'relai-mods@relai': true, 'pol@corp': true, 'over@x': true })
    expect(enabledOf('[')).toEqual({})
  })

  test('the switch flips: on disables, off and no key enable, scope kept', () => {
    expect(toggleArgv('claude', { id: 'a@b', scope: 'user', state: 'on' })).toEqual(['claude', 'plugin', 'disable', 'a@b', '--scope', 'user'])
    expect(toggleArgv('claude', { id: 'a@b', scope: 'local', state: 'none' })).toEqual(['claude', 'plugin', 'enable', 'a@b', '--scope', 'local'])
  })

  test('an error is the exit code and the first non-empty line', () => {
    expect(cliError({ exitCode: 1, stdout: '', stderr: '\n  ✘ Plugin "x" not found\nmore' })).toBe('Błąd CLI (kod 1): ✘ Plugin "x" not found')
    expect(cliError({ exitCode: null, stdout: '', stderr: '' })).toBe('Błąd CLI (kod brak): bez komunikatu')
  })
})

const PANE = {
  plugin: 'relai-mods',
  component: 'Pane',
  requestId: 'relai-mods',
  props: { title: 'RelAI Mods', isFocused: false, bodyColumns: 140, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} },
} as const

type Call = { argv: string[], cwd?: string }
type Fake = {
  calls: Call[]
  disk: Record<string, string>
  /** Whether the pane is open, as ui.open and ui.close leave it and ui.panes answers. */
  isOpen: boolean
}

const key = (path: string) => path.replace(/\\/g, '/')
const USER_FILE = key(`${HOME}/.claude/settings.json`)

/** A file that is there but will not read: fs.exists says yes, fs.read refuses. */
const UNREADABLE = 'fixture: unreadable'

const ok = (stderr = '') => ({ value: { exitCode: stderr ? 1 : 0, stdout: '', stderr, isStdoutTruncated: false, isStderrTruncated: false } })

// `--scope local` as the real CLI 2.1.304 does it (measured in E2, P-058 pt 5): it writes the
// folder's settings.local.json, and refuses with exit 1 when the value in force there — local,
// without it the user's — already is the asked one (L-0288)
function localCall(disk: Record<string, string>, cwd: string, verb: string, id: string) {
  const file = `${key(cwd)}/.claude/settings.local.json`
  const local = enabledOf(disk[file] ?? null)
  const want = verb === 'enable'
  if ((local[id] ?? enabledOf(disk[USER_FILE] ?? null)[id] ?? false) === want) return ok(`Plugin "${id}" is already ${verb}d at local scope`)
  const s = JSON.parse(disk[file] ?? '{}') as Record<string, unknown>
  disk[file] = JSON.stringify({ ...s, enabledPlugins: { ...local, [id]: want } })
  return ok()
}

// The CLI: 'ok' writes the user file as claude plugin enable/disable does, 'fail' exits 1, 'hang' runs past the limit
function engine(on: On, mode: 'ok' | 'fail' | 'hang', extra: Record<string, unknown[]> = {}, sessionCwd = CWD): Fake {
  const installs = { ...INSTALLS, ...extra }
  const userEnabled = { ...USER_ENABLED, ...Object.fromEntries(Object.keys(extra).map((id) => [id, true])) }
  const fake: Fake = {
    isOpen: false,
    calls: [],
    disk: {
      [key(`${HOME}/.claude/plugins/installed_plugins.json`)]: JSON.stringify({ version: 2, plugins: installs }),
      [USER_FILE]: settingsText(userEnabled),
      'C:/proj/.claude/settings.local.json': JSON.stringify({ enabledPlugins: { 'over@x': false } }),
      'C:/x/filetree/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
      'C:/x/mods/hooks/hooks.json': JSON.stringify({ modules: ['./register.tsx'] }),
      'C:/x/relai/.claude-plugin/plugin.json': JSON.stringify({ description: 'relai', commands: ['./a/commands/'] }),
      'C:/x/relai/hooks/hooks.json': JSON.stringify({ hooks: { SessionStart: [], SessionEnd: [] } }),
      'C:/x/relai/a/commands/one.md': '#',
      'C:/x/relai/skills/core/SKILL.md': '#',
      'C:/x/pol/.claude-plugin/plugin.json': JSON.stringify({ description: 'pod polityką' }),
      'C:/x/over/.claude-plugin/plugin.json': JSON.stringify({ description: 'nadpisany' }),
    },
  }
  const { disk } = fake
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : '' }))
  on('settings.read', ($, e) => ({ value: e.source === 'policy' ? { enabledPlugins: { 'pol@corp': true } } : {} }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(`${key(e.path)}/`)) }))
  on('fs.read', ($, e) => (disk[key(e.path)] === UNREADABLE ? { deny: `EACCES ${e.path}` } : key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: `ENOENT ${e.path}` }))
  on('fs.list', ($, e) => {
    const dir = `${key(e.path)}/`
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return { value: names.map((n) => ({ name: n, kind: below.includes(n) ? 'file' as const : 'dir' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('process.run', ($, e) => {
    const argv = [...e.argv]
    if (argv[1] === '--version') return { value: { exitCode: 0, stdout: '2.1.304 (Claude Code)\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    const cwd = e.init?.cwd
    fake.calls.push(cwd ? { argv, cwd } : { argv })
    if (mode === 'hang') return { deny: 'timed out after 20000 ms' }
    if (mode === 'fail') return { value: { exitCode: 1, stdout: '', stderr: 'Error: plugin not found', isStdoutTruncated: false, isStderrTruncated: false } }
    const [, , verb, id] = argv
    if (argv[5] === 'local' && id && verb && cwd) return localCall(disk, cwd, verb, id)
    if (argv[5] === 'user' && id) {
      const s = JSON.parse((disk[USER_FILE] ?? '').replace(/^\ufeff/, '')) as { enabledPlugins: Record<string, unknown> }
      disk[USER_FILE] = JSON.stringify({ ...s, enabledPlugins: { ...s.enabledPlugins, [id]: verb === 'enable' } })
    }
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('command.register', () => ({ value: { command: 'relai-mods' } }))
  on('command.list', () => ({ value: [] }))
  on('command.run', () => ({ text: "/reload-plugins isn't available over a remote connection in this session" }))
  on('ui.open', () => { fake.isOpen = true; return { value: { isPlaced: true as const } } })
  on('ui.close', () => { fake.isOpen = false; return { value: undefined } })
  on('ui.panes', () => ({ value: fake.isOpen ? [{ id: 'relai-mods', title: 'RelAI Mods' }] as never : [] }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: sessionCwd }))
  // `.git` a folder when anything lies under it, a file when it is one
  on('fs.stat', ($, e) => {
    const p = key(e.path)
    if (Object.keys(disk).some((f) => f.startsWith(`${p}/`))) return { value: { kind: 'dir' as const, size: 0, mtimeMs: 0, isLink: false } }
    return p in disk ? { value: { kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false } } : { deny: `ENOENT ${e.path}` }
  })
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  return fake
}

// Another chat's switch: the user file written beneath this chat, with no state of the mod's changed
function writeElsewhere(fake: Fake, id: string, isOn: boolean): void {
  const s = JSON.parse((fake.disk[USER_FILE] ?? '').replace(/^\ufeff/, '')) as { enabledPlugins: Record<string, unknown> }
  fake.disk[USER_FILE] = JSON.stringify({ ...s, enabledPlugins: { ...s.enabledPlugins, [id]: isOn } })
}

type Node = { type?: string, props?: Record<string, unknown>, children?: unknown[] }

// Every element of a drawn tree, depth first
function walk(node: unknown, out: Node[] = []): Node[] {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out)); return out }
  if (!node || typeof node !== 'object') return out
  const n = node as Node
  out.push(n)
  walk(n.children ?? [], out)
  return out
}

const HEX = /#[0-9a-fA-F]{3,8}\b/

describe('cockpit', () => {
  test('lists every install with its header; Wyłączone shows the off mod and the plugin with no key', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Text', text: /włączone ·/ }))?.text).toBe('4/6 włączone · 1 hook własny')
    await ui.press({ key: 'filter-off' })
    expect(await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` })).toBeTruthy()
    expect(await ui.find({ type: 'Button', key: `flip-row-${SECURITY}` })).toBeTruthy()
    // positive control of the filter: the enabled relai stood in the list before, and is gone now
    expect(await ui.find({ type: 'Button', key: 'pick-plugin-relai@relai-user-' })).toBeFalsy()
    await ui.press({ key: 'filter-all' })
    expect(await ui.find({ type: 'Button', key: 'pick-plugin-relai@relai-user-' })).toBeTruthy()
    await ui.unmount()
  })

  test('the search narrows the list', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.input({ key: 'query', text: 'stop-me' })
    expect(await ui.findAll({ type: 'Button', text: /^[▸▾]$/ })).toHaveLength(1)
    expect(await ui.find({ type: 'Button', key: `pick-${FILETREE}` })).toBeFalsy()
    await ui.unmount()
  })

  test('there and back: the bar shows 1 change, then disappears; N is the disk against the loaded state', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls).toEqual([{ argv: ['claude', 'plugin', 'enable', 'filetree@claude-code-filetree', '--scope', 'user'] }])
    expect((await ui.find({ type: 'Text', text: /na przeładowanie/ }))?.text).toBe('⟳ 1 zmiana czeka na przeładowanie')
    expect((await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` }))?.text).toBe('Wyłącz')
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls[1]?.argv[2]).toBe('disable')
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.unmount()
  })

  test('Przeładuj asks for /reload-plugins; after it the engine has the disk and the bar is gone', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: `flip-row-${FILETREE}` })
    await ui.press({ key: 'reload' })
    expect((await ui.find({ type: 'Text', text: /Wpisz \/reload-plugins/ }))?.text).toBe('Wpisz /reload-plugins — aplikacja nie przeładowuje pluginów z panelu.')
    // positive control: a redraw alone keeps the bar
    await ui.press({ key: 'filter-mod' })
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeTruthy()
    // a new snapshot, as the typed /reload-plugins takes one at plugin.register of the other mods
    // (the test engine raises no plugin.register: that road is measured live, E3) — here by session.start
    expect(fake.calls).toHaveLength(1)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await ui.press({ key: 'filter-all' })
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.unmount()
  })

  test('a failed call: the exit code under the row and in the details, the switch back to the disk', async ($, on) => {
    const fake = engine(on, 'fail')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: `pick-${FILETREE}` })
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls).toHaveLength(1)
    expect(await ui.findAll({ type: 'Text', text: 'Błąd CLI (kod 1): Error: plugin not found' })).toHaveLength(2)
    expect((await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` }))?.text).toBe('Włącz')
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.unmount()
  })

  test('a call past the limit: an error without a code, nothing counted', async ($, on) => {
    engine(on, 'hang')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect((await ui.find({ type: 'Text', text: /^Błąd CLI \(bez kodu, limit 20 s\)/ }))?.text ?? '').toContain('timed out')
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.unmount()
  })

  test('policy, an override and the cockpit itself have a lock and no switch; the hook a preview', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    for (const k of [POLICY, OVER, SELF]) expect(await ui.find({ type: 'Button', key: `flip-row-${k}` })).toBeFalsy()
    // positive control: the plain mod beside them has its switch
    expect(await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: 'polityka' })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: 'nadpisane' })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: 'tylko podgląd' })).toBeTruthy()
    await ui.press({ key: `pick-${OVER}` })
    expect(await ui.find({ type: 'Text', text: 'nadpisane w C:/proj/.claude/settings.local.json' })).toBeTruthy()
    await ui.press({ key: `pick-${SELF}` })
    expect((await ui.find({ type: 'Text', text: /Wyłączysz go ręcznie/ }))?.text).toBe('Wyłączysz go ręcznie: claude plugin disable relai-mods@relai')
    expect(await ui.find({ type: 'Button', key: `flip-detail-${SELF}` })).toBeFalsy()
    expect(fake.calls).toEqual([])
    await ui.unmount()
  })

  test("another project's plugin: label with its folder, the CLI from its folder", async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect(await ui.find({ type: 'Text', text: /projekt Parkly/ })).toBeTruthy()
    await ui.press({ key: `flip-row-${SECURITY}` })
    expect(fake.calls).toEqual([{ argv: ['claude', 'plugin', 'enable', 'security-guidance@claude-plugins-official', '--scope', 'local'], cwd: 'C:/Users/Ktos/Desktop/Parkly' }])
    await ui.unmount()
  })

  test('the details show the CLI version (R1) and the file a switch changes', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: `pick-${FILETREE}` })
    expect((await ui.find({ type: 'Text', text: /^CLI: / }))?.text).toBe('CLI: claude z PATH · 2.1.304 (Claude Code)')
    // the desktop's path carries a place to break after each separator (E4); the words stay the same
    const said = (await ui.find({ type: 'Text', text: /^Przełącznik: / }))?.text ?? ''
    expect(said.split(String.fromCharCode(0x200b)).join('')).toBe('Przełącznik: Zmieni się C:/Users/Ktos/.claude/settings.json.')
    expect(said.split(String.fromCharCode(0x200b))).toHaveLength(5)
    await ui.unmount()
  })

  test('no hex color outside the markup of a Svg; the drawings carry their palettes (positive control)', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const nodes = walk(await ui.drawn())
    const svgs = nodes.filter((n) => n.type === 'Svg')
    expect(svgs.length).toBeGreaterThan(3)
    expect(svgs.every((n) => HEX.test(String(n.props?.source ?? '')) && String(n.props?.alt ?? '').length > 0)).toBe(true)
    const colored = nodes.filter((n) => n.type !== 'Svg').flatMap((n) => ['color', 'borderColor', 'backgroundColor'].map((p) => String(n.props?.[p] ?? '')))
    expect(colored.some((c) => c.length > 0)).toBe(true)
    expect(colored.filter((c) => HEX.test(c))).toEqual([])
    await ui.unmount()
  })

  test('100 plugins fit the budget: the rows give up their drawings, the details keep theirs (R7)', async ($, on) => {
    const many = Object.fromEntries(Array.from({ length: 100 }, (_, n) => [`fake-${n}@many`, [{ scope: 'user', version: '1.0.0', installPath: `C:\\x\\fake-${n}` }]]))
    engine(on, 'ok', many)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'pick-plugin-fake-7@many-user-' })
    const tree = await ui.drawn()
    expect(treeWeight(tree)).toBeLessThanOrEqual(DRAW_LIMIT)
    const switches = walk(tree).filter((n) => n.type === 'Svg' && String(n.props?.alt ?? '').startsWith('przełącznik'))
    expect(switches).toHaveLength(1) // the details' own
    expect((await ui.find({ type: 'Button', key: 'flip-row-plugin-fake-7@many-user-' }))?.text).toBe('●━━ Wyłącz')
    await ui.unmount()
  })

  test('six plugins draw a switch in every row that has one (control of the budget test)', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const switches = walk(await ui.drawn()).filter((n) => n.type === 'Svg' && String(n.props?.alt ?? '').startsWith('przełącznik'))
    expect(switches.length).toBeGreaterThan(2)
    await ui.unmount()
  })

  test('the groups stand under Kalam headings with their counts (E3 round 1: accordion with groups)', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    const headings = walk(await ui.drawn()).filter((n) => n.type === 'Svg' && ['Mody', 'Pluginy', 'Hooki'].includes(String(n.props?.alt ?? '')))
    expect(headings.map((n) => n.props?.alt)).toEqual(['Mody', 'Pluginy', 'Hooki'])
    expect(await ui.find({ type: 'Text', text: '1/2 włączone' })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: '3/4 włączone' })).toBeTruthy()
    expect(await ui.find({ type: 'Text', text: '1 · tylko podgląd' })).toBeTruthy()
    // a filter leaves out a group with no rows: Wyłączone holds no hook
    await ui.press({ key: 'filter-off' })
    expect(await ui.find({ type: 'Text', text: /tylko podgląd$/ })).toBeFalsy()
    await ui.unmount()
  })

  test('the details unfold under the picked row and fold on a second press', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect(await ui.find({ type: 'Text', text: /^Przełącznik: / })).toBeFalsy()
    await ui.press({ key: `pick-${FILETREE}` })
    expect(await ui.find({ type: 'Text', text: /^Przełącznik: / })).toBeTruthy()
    expect((await ui.find({ type: 'Button', key: `pick-${FILETREE}` }))?.text).toBe('▾')
    await ui.press({ key: `pick-${FILETREE}` })
    expect(await ui.find({ type: 'Text', text: /^Przełącznik: / })).toBeFalsy()
    await ui.unmount()
  })

  test('the filters carry their counts; the search has a visible label', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Button', key: 'filter-off' }))?.text).toBe('Wyłączone 2')
    expect((await ui.find({ type: 'Button', key: 'filter-all' }))?.text).toBe('● Wszystko 7')
    await ui.unmount()
  })

  test('the terminal draws the list with glyph switches and no drawings', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
    expect((await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` }))?.text).toBe('━━○ Włącz')
    const nodes = walk(await ui.drawn())
    expect(nodes.filter((n) => n.type === 'Svg')).toEqual([])
    // the glyph in the key of its state (E4): off muted, on green; the groups' words in mustard
    const glyphs = nodes.filter((n) => n.type === 'Text' && ['●━━', '━━○'].includes(String(n.children?.[0] ?? '')))
    expect([...new Set(glyphs.map((n) => `${String(n.children?.[0])} ${String(n.props?.color)}`))].sort()).toEqual(['━━○ inactive', '●━━ success'])
    const groups = nodes.filter((n) => n.type === 'Text' && ['Mody', 'Pluginy', 'Hooki'].includes(String(n.children?.[0] ?? '')))
    expect(groups.map((n) => String(n.props?.color))).toEqual(['warning', 'warning', 'warning'])
    expect(await ui.find({ type: 'Text', text: '[tylko podgląd]' })).toBeTruthy()
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls).toHaveLength(1)
    await ui.unmount()
  })

  test('a press carries the state it asked for: a row another chat already switched is skipped, no CLI call (E4)', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` }))?.text).toBe('Włącz')
    // the other chat turns filetree on between this draw and the press
    writeElsewhere(fake, 'filetree@claude-code-filetree', true)
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls).toEqual([])
    // positive control on the same row: drawn again, it reads "Wyłącz", and that press runs the CLI
    expect((await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` }))?.text).toBe('Wyłącz')
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls.map((c) => c.argv[2])).toEqual(['disable'])
    await ui.unmount()
  })

  test('an open pane reads the disk again every REFRESH_MS: another chat\'s switch shows as waiting, the timer stops with the pane (E4)', async ($, on) => {
    const fake = engine(on, 'ok')
    const clock = mock.clock(on)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.command.run({ command: 'relai-mods' })
    expect(fake.isOpen).toBe(true)
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await clock.settle()
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    writeElsewhere(fake, 'filetree@claude-code-filetree', true)
    // positive control: just short of the period the pane still shows the old disk
    await clock.advance(REFRESH_MS - 1)
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await clock.advance(1)
    expect((await ui.find({ type: 'Text', text: /na przeładowanie/ }))?.text).toBe('⟳ 1 zmiana czeka na przeładowanie')
    // back to the start in the other chat: the bar goes at the next refresh
    writeElsewhere(fake, 'filetree@claude-code-filetree', false)
    await clock.advance(REFRESH_MS)
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    // the pane closed: no refresh redraws it any more
    await $.command.run({ command: 'relai-mods' })
    expect(fake.isOpen).toBe(false)
    writeElsewhere(fake, 'filetree@claude-code-filetree', true)
    await clock.advance(REFRESH_MS * 3)
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy()
    await ui.unmount()
  })

  test('the mobile surface: the list as text, no switches', async ($, on) => {
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'mobile', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'mobile' })
    expect(await ui.findAll({ type: 'Button' })).toHaveLength(0)
    expect((await ui.find({ type: 'Text', text: /^mod filetree/ }))?.text).toBe('mod filetree@claude-code-filetree · wyłączony')
    await ui.unmount()
  })
})

// ---------- the row "RelAI w tym projekcie" (ZASIEG_PLUGINU E3) ----------

const LOCAL_FILE = 'C:/proj/.claude/settings.local.json'
const ADDONS: Record<string, unknown[]> = Object.fromEntries(['relai-panel', 'relai-progress', 'relai-cache-keeper'].map((n) => [`${n}@relai`, [{ scope: 'user', version: '1.0.0', installPath: `C:\\x\\${n}` }]]))
const SET = ['relai@relai', 'relai-panel@relai', 'relai-progress@relai', 'relai-cache-keeper@relai']
const localOf = (fake: Fake) => enabledOf(fake.disk[LOCAL_FILE] ?? null)

describe('the row "RelAI w tym projekcie"', () => {
  test('the home folder has no row; a project folder has it (plan, section 8)', async ($, on) => {
    engine(on, 'ok', {}, HOME)
    await $.session.start({ cwd: HOME, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect(await ui.find({ type: 'Button', key: 'scope-flip' })).toBeFalsy()
    expect(await ui.find({ type: 'Text', text: /RelAI w tym projekcie/ })).toBeFalsy()
    // positive control: the list itself is drawn in the home folder
    expect(await ui.find({ type: 'Button', key: `flip-row-${FILETREE}` })).toBeTruthy()
    await ui.unmount()
  })

  test('global true, no local key: Włącz, Tak — the CLI refuses and the pair disable → enable writes true for each of four (L-0288)', async ($, on) => {
    const fake = engine(on, 'ok', ADDONS)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Text', text: /^RelAI w tym projekcie/ }))?.text).toBe('RelAI w tym projekcie ● włączony z ustawień globalnych')
    await ui.press({ key: 'scope-flip' })
    await ui.press({ key: 'scope-yes' })
    expect(fake.calls.map((c) => c.argv.slice(2, 4).join(' '))).toEqual(SET.flatMap((id) => [`enable ${id}`, `disable ${id}`, `enable ${id}`]))
    expect(fake.calls.every((c) => c.cwd === 'C:/proj' && c.argv[5] === 'local')).toBe(true)
    expect(Object.fromEntries(SET.map((id) => [id, localOf(fake)[id]]))).toEqual(Object.fromEntries(SET.map((id) => [id, true])))
    expect(await ui.find({ type: 'Text', text: /na przeładowanie/ })).toBeFalsy() // nothing in force changed
    expect((await ui.find({ type: 'Text', text: /^RelAI w tym projekcie/ }))?.text).toBe('RelAI w tym projekcie ✓ włączony w tym projekcie')
    // no git: no .worktreeinclude
    expect('C:/proj/.worktreeinclude' in fake.disk).toBe(false)
    await ui.unmount()
  })

  test('Wyłącz, Tak: four false in the file, four changes wait for the reload', async ($, on) => {
    const fake = engine(on, 'ok', ADDONS)
    fake.disk[LOCAL_FILE] = JSON.stringify({ enabledPlugins: Object.fromEntries(SET.map((id) => [id, true])) })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Button', key: 'scope-flip' }))?.text).toBe('Wyłącz')
    await ui.press({ key: 'scope-flip' })
    expect((await ui.find({ type: 'Text', text: /RelAI w tym projekcie\?$/ }))?.text).toBe('Wyłączyć RelAI w tym projekcie?')
    await ui.press({ key: 'scope-yes' })
    expect(fake.calls.map((c) => c.argv[2])).toEqual(['disable', 'disable', 'disable', 'disable'])
    expect(SET.map((id) => localOf(fake)[id])).toEqual([false, false, false, false])
    expect((await ui.find({ type: 'Text', text: /na przeładowanie/ }))?.text).toBe('⟳ 4 zmiany czekają na przeładowanie')
    expect((await ui.find({ type: 'Text', text: /^RelAI w tym projekcie/ }))?.text).toBe('RelAI w tym projekcie ○ wyłączony')
    await ui.unmount()
  })

  test('local false reads off; Włącz only opens the card, Nie folds it with no call, Tak runs it', async ($, on) => {
    const fake = engine(on, 'ok')
    fake.disk[LOCAL_FILE] = JSON.stringify({ enabledPlugins: { 'over@x': false, 'relai@relai': false } })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Text', text: /^RelAI w tym projekcie/ }))?.text).toBe('RelAI w tym projekcie ○ wyłączony')
    await ui.press({ key: 'scope-flip' })
    expect(fake.calls).toEqual([])
    expect(await ui.find({ type: 'Text', text: /^Plik / })).toBeFalsy() // facts stand in two boxes, not one text
    expect((await ui.find({ type: 'Text', text: /^relai → true$/ }))?.text).toBe('relai → true')
    await ui.press({ key: 'scope-no' })
    expect(await ui.find({ type: 'Button', key: 'scope-yes' })).toBeFalsy()
    expect(fake.calls).toEqual([])
    await ui.press({ key: 'scope-flip' })
    await ui.press({ key: 'scope-yes' })
    expect(fake.calls).toEqual([{ argv: ['claude', 'plugin', 'enable', 'relai@relai', '--scope', 'local'], cwd: 'C:/proj' }])
    expect(localOf(fake)).toEqual({ 'over@x': false, 'relai@relai': true })
    await ui.unmount()
  })

  test('a plugin of the set not installed is skipped; relai-mods never runs, though installed', async ($, on) => {
    const fake = engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'scope-flip' })
    await ui.press({ key: 'scope-yes' })
    const ids = [...new Set(fake.calls.map((c) => c.argv[3]))]
    expect(ids).toEqual(['relai@relai'])
    expect(ids).not.toContain('relai-mods@relai')
    await ui.unmount()
  })

  test('a main repo (.git a folder) gets the line in .worktreeinclude, beside the lines it had', async ($, on) => {
    const fake = engine(on, 'ok')
    fake.disk['C:/proj/.git/HEAD'] = 'ref: refs/heads/main'
    fake.disk['C:/proj/.worktreeinclude'] = '.env\r\n'
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'scope-flip' })
    expect(await ui.find({ type: 'Text', text: /do \.worktreeinclude$/ })).toBeTruthy()
    await ui.press({ key: 'scope-yes' })
    expect(fake.disk['C:/proj/.worktreeinclude']).toBe('.env\r\n.claude/settings.local.json\r\n')
    await ui.unmount()
  })

  test('a .worktreeinclude that will not read is never replaced: the error says so, the file stays', async ($, on) => {
    const fake = engine(on, 'ok')
    fake.disk['C:/proj/.git/HEAD'] = 'ref: refs/heads/main'
    fake.disk['C:/proj/.worktreeinclude'] = UNREADABLE
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'scope-flip' })
    await ui.press({ key: 'scope-yes' })
    expect(fake.disk['C:/proj/.worktreeinclude']).toBe(UNREADABLE)
    expect((await ui.find({ type: 'Text', text: /nie dopisano linii/ }))?.text ?? '').toContain('EACCES')
    // the plugins were switched before the line: their part is done
    expect(localOf(fake)['relai@relai']).toBe(true)
    await ui.unmount()
  })

  test('a worktree (.git a file) gets no .worktreeinclude', async ($, on) => {
    const tree = engine(on, 'ok')
    tree.disk['C:/proj/.git'] = 'gitdir: C:/main/.git/worktrees/proj'
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui2 = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui2.press({ key: 'scope-flip' })
    await ui2.press({ key: 'scope-yes' })
    expect(localOf(tree)['relai@relai']).toBe(true)
    expect('C:/proj/.worktreeinclude' in tree.disk).toBe(false)
    await ui2.unmount()
  })

  test('a CLI error stays under the row, nothing written', async ($, on) => {
    const fake = engine(on, 'fail')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    await ui.press({ key: 'scope-flip' })
    await ui.press({ key: 'scope-yes' })
    expect(fake.calls).toHaveLength(1)
    expect((await ui.find({ type: 'Text', text: /^Błąd CLI/ }))?.text).toBe('Błąd CLI (kod 1): Error: plugin not found')
    expect(fake.disk[LOCAL_FILE]).toBe(JSON.stringify({ enabledPlugins: { 'over@x': false } }))
    await ui.unmount()
  })
})
