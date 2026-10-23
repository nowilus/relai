import { describe, expect, test } from 'claude-code/testing'
import type { TestBody } from 'claude-code/testing'
import { DRAW_LIMIT, treeWeight } from './cockpit'
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
}

const key = (path: string) => path.replace(/\\/g, '/')
const USER_FILE = key(`${HOME}/.claude/settings.json`)

// The CLI: 'ok' writes the user file as claude plugin enable/disable does, 'fail' exits 1, 'hang' runs past the limit
function engine(on: On, mode: 'ok' | 'fail' | 'hang', extra: Record<string, unknown[]> = {}): Fake {
  const installs = { ...INSTALLS, ...extra }
  const userEnabled = { ...USER_ENABLED, ...Object.fromEntries(Object.keys(extra).map((id) => [id, true])) }
  const fake: Fake = {
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
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: `ENOENT ${e.path}` }))
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
    if (argv[5] === 'user' && id) {
      const s = JSON.parse((disk[USER_FILE] ?? '').replace(/^\ufeff/, '')) as { enabledPlugins: Record<string, unknown> }
      disk[USER_FILE] = JSON.stringify({ ...s, enabledPlugins: { ...s.enabledPlugins, [id]: verb === 'enable' } })
    }
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('command.register', () => ({ value: { command: 'relai-mods' } }))
  on('command.list', () => ({ value: [] }))
  on('command.run', () => ({ text: "/reload-plugins isn't available over a remote connection in this session" }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.panes', () => ({ value: [] }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('clock.now', () => ({ value: 0 }))
  return fake
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
    expect((await ui.find({ type: 'Text', text: /^Przełącznik: / }))?.text).toBe('Przełącznik: Zmieni się C:/Users/Ktos/.claude/settings.json.')
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
    await ui.press({ key: `flip-row-${FILETREE}` })
    expect(fake.calls).toHaveLength(1)
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
