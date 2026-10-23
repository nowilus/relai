import { describe, expect, test } from 'claude-code/testing'
import {
  NO_FILES_NOTE, NO_KEY_NOTE, buildInventory, foldersOf, filesOf, headerOf, joinPath, parseInstalls,
  plural, pluginPart, scriptOf, shorten, sourcesOf, summaryOf, userHooks,
} from './inventory'
import type { DirEntry, InventoryInput, PluginFiles, PluginItem } from './inventory'

// Fixtures in the shape of Łukasz's disk on 2026-10-23 (E2): 14 installs, 13 user and one local of
// another project with no key in enabledPlugins; 7 hook commands in 5 events; Windows paths
const HOME = 'C:\\Users\\Ktos'
const CACHE = `${HOME}\\.claude\\plugins\\cache`
const PARKLY = `${HOME}\\Desktop\\Parkly`
const CWD = 'C:/Users/Ktos/Desktop/RelAI'

const USER_IDS = [
  'caveman@caveman', 'ecc@ecc', 'andrej-karpathy-skills@karpathy-skills', 'i-have-adhd@i-have-adhd',
  'codex@openai-codex', 'typesafe@typesafe-ai', 'relai@relai', 'filetree@claude-code-filetree',
  'relai-panel@relai', 'relai-progress@relai', 'relai-cache-keeper@relai', 'nateherk-design@nateherk',
  'humanizer@humanizer',
]
const pathOf = (id: string) => `${CACHE}\\${id.split('@')[1]}\\${id.split('@')[0]}\\1.0.0`

const INSTALLED = JSON.stringify({
  version: 2,
  plugins: {
    ...Object.fromEntries(USER_IDS.map((id) => [id, [{ scope: 'user', installPath: pathOf(id), version: '1.0.0' }]])),
    'security-guidance@claude-plugins-official': [{ scope: 'local', projectPath: PARKLY, installPath: pathOf('security-guidance@claude-plugins-official'), version: '2.0.0' }],
  },
})

const cmd = (script: string) => ({ type: 'command', command: `"C:\\Program Files\\nodejs\\node.exe" "C:\\Users\\Ktos\\.claude\\hooks\\${script}"` })
const USER_SETTINGS = '\ufeff' + JSON.stringify({
  enabledPlugins: { ...Object.fromEntries(USER_IDS.map((id) => [id, true])), 'filetree@claude-code-filetree': false, odd: 'yes' },
  hooks: {
    SessionStart: [{ hooks: [cmd('caveman-activate.js')] }],
    UserPromptSubmit: [{ hooks: [cmd('caveman-mode-tracker.js'), cmd('shadow-prompt.js')] }],
    Stop: [{ hooks: [{ type: 'command', command: 'powershell -NoProfile -File "C:\\Users\\Ktos\\.claude\\hooks\\sync.ps1" -Reason stop' }, cmd('shadow-stop.js')] }],
    SessionEnd: [{ hooks: [{ type: 'command', command: 'powershell -File "C:\\Users\\Ktos\\.claude\\hooks\\sync.ps1" -Reason session-end' }] }],
    PostToolUse: [{ matcher: 'Edit|Write|MultiEdit|Bash', hooks: [{ type: 'command', command: 'node "C:/Users/Ktos/.claude/skills/trivy-scan/scripts/lockfile-hook.mjs"' }] }],
  },
})

const files = (n: number, ext = '.md'): DirEntry[] => Array.from({ length: n }, (_, i) => ({ name: `f${i}${ext}`, kind: 'file' as const }))
const dirs = (n: number): DirEntry[] => Array.from({ length: n }, (_, i) => ({ name: `d${i}`, kind: 'dir' as const }))
const plain = (description: string): PluginFiles => ({ exists: true, manifest: JSON.stringify({ description }), texts: {}, lists: {} })
const MOD_HOOKS = JSON.stringify({ modules: ['./register.tsx'] })

// What register.tsx would have read for each install, keyed by its installPath in joinPath form
function folderFiles(): Record<string, PluginFiles> {
  const out: Record<string, PluginFiles> = Object.fromEntries([...USER_IDS, 'security-guidance@claude-plugins-official'].map((id) => [joinPath(pathOf(id)), plain(id)]))
  out[joinPath(pathOf('ecc@ecc'))] = {
    exists: true,
    manifest: JSON.stringify({ description: 'ecc', mcpServers: {}, skills: ['./skills/'], commands: ['./commands/'] }),
    texts: {
      'hooks/hooks.json': JSON.stringify({ hooks: { PreToolUse: [], PreCompact: [], SessionStart: [], PostToolUse: [], PostToolUseFailure: [], Stop: [], SessionEnd: [] } }),
      '.mcp.json': JSON.stringify({ mcpServers: { 'chrome-devtools': {} } }),
    },
    lists: { skills: dirs(292), commands: files(94), agents: files(68) },
  }
  // relai: every part through a manifest path, agents as single files, the root hooks/hooks.json too (P-013)
  out[joinPath(pathOf('relai@relai'))] = {
    exists: true,
    manifest: JSON.stringify({
      description: 'relai',
      skills: ['./adapters/claude-code/skills/'],
      commands: ['./adapters/claude-code/commands/'],
      hooks: './adapters/claude-code/hooks/hooks.json',
      agents: ['./adapters/claude-code/agents/relai-coder.md', './adapters/claude-code/agents/relai-tester.md'],
    }),
    texts: {
      'adapters/claude-code/hooks/hooks.json': JSON.stringify({ hooks: { SessionStart: [], PreToolUse: [], SessionEnd: [] } }),
      'hooks/hooks.json': JSON.stringify({ hooks: { SessionStart: [], PreToolUse: [], SessionEnd: [] } }),
    },
    lists: { 'adapters/claude-code/skills': dirs(2), 'adapters/claude-code/commands': files(15), skills: dirs(40), commands: files(40) },
  }
  for (const id of ['filetree@claude-code-filetree', 'relai-panel@relai', 'relai-progress@relai', 'relai-cache-keeper@relai']) {
    out[joinPath(pathOf(id))] = { exists: true, manifest: JSON.stringify({ description: id }), texts: { 'hooks/hooks.json': MOD_HOOKS }, lists: {} }
  }
  // caveman: hooks inline in plugin.json, no hooks/hooks.json
  out[joinPath(pathOf('caveman@caveman'))] = { exists: true, manifest: JSON.stringify({ description: 'caveman', hooks: { SessionStart: [], UserPromptSubmit: [] } }), texts: {}, lists: { skills: dirs(5) } }
  return out
}

function input(over: Partial<InventoryInput> = {}): InventoryInput {
  return {
    home: HOME,
    cwd: CWD,
    installedText: INSTALLED,
    settings: { [joinPath(HOME, '.claude/settings.json')]: USER_SETTINGS },
    policy: {},
    files: folderFiles(),
    ...over,
  }
}

const plugin = (items: ReturnType<typeof buildInventory>['items'], id: string) =>
  items.find((i): i is PluginItem => i.kind !== 'hook' && i.id === id)

describe('inventory — today\'s machine', () => {
  test('14 installs and 7 hook commands in 5 events; header from the data', () => {
    const inv = buildInventory(input())
    expect(inv.plugins).toBe(14)
    expect(inv.hooks).toBe(7)
    expect(inv.problem).toBe('')
    expect(new Set(inv.items.filter((i) => i.kind === 'hook').map((i) => (i.kind === 'hook' ? i.event : ''))).size).toBe(5)
    expect(headerOf(inv)).toBe('12/14 włączone · 7 hooków własnych')
  })

  test('4 mods by their hooks.json, filetree among them though off; the rest are plugins', () => {
    const inv = buildInventory(input())
    const mods = inv.items.filter((i): i is PluginItem => i.kind === 'mod').map((m) => m.id).sort()
    expect(mods).toEqual(['filetree@claude-code-filetree', 'relai-cache-keeper@relai', 'relai-panel@relai', 'relai-progress@relai'])
    expect(plugin(inv.items, 'filetree@claude-code-filetree')?.state).toBe('off')
    // control: a plugin with no modules stays a plugin
    expect(plugin(inv.items, 'humanizer@humanizer')?.kind).toBe('plugin')
  })

  test('ecc: 7 events and the counts of its folders; relai: counts from manifest paths only', () => {
    const inv = buildInventory(input())
    const ecc = plugin(inv.items, 'ecc@ecc')
    expect(ecc?.events.length).toBe(7)
    expect(ecc?.counts).toEqual({ skills: 292, agents: 68, commands: 94, mcp: 1 })
    const relai = plugin(inv.items, 'relai@relai')
    // the default skills/ and commands/ (40 each) lose to the manifest paths
    expect(relai?.counts).toEqual({ skills: 2, agents: 2, commands: 15, mcp: 0 })
    expect(relai?.events).toEqual(['SessionStart', 'PreToolUse', 'SessionEnd'])
    expect(summaryOf(relai as PluginItem)).toBe('2 skille · 2 agenci · 15 komend · 0 MCP · zdarzenia: SessionStart, PreToolUse, SessionEnd')
  })

  test('hooks written inline in plugin.json count as events (caveman)', () => {
    const caveman = plugin(buildInventory(input()).items, 'caveman@caveman')
    expect(caveman?.events).toEqual(['SessionStart', 'UserPromptSubmit'])
    expect(caveman?.kind).toBe('plugin')
  })
})

describe('inventory — edge cases (plan, section 8)', () => {
  test('no key in enabledPlugins: off, with a note; a plugin with a key has no such note', () => {
    const inv = buildInventory(input())
    const sg = plugin(inv.items, 'security-guidance@claude-plugins-official')
    expect(sg?.state).toBe('none')
    expect(sg?.notes).toContain(NO_KEY_NOTE)
    // the state file of a local install is in its own project, not in the home
    expect(sg?.stateFile).toBe('C:/Users/Ktos/Desktop/Parkly/.claude/settings.local.json')
    expect(sg?.projectPath).toBe(PARKLY)
    // control: the key in the project's file of the same install gives a state and no note
    const withKey = buildInventory(input({ settings: { ...input().settings, 'C:/Users/Ktos/Desktop/Parkly/.claude/settings.local.json': JSON.stringify({ enabledPlugins: { 'security-guidance@claude-plugins-official': true } }) } }))
    expect(plugin(withKey.items, 'security-guidance@claude-plugins-official')?.state).toBe('on')
    expect(plugin(withKey.items, 'security-guidance@claude-plugins-official')?.notes).toEqual([])
  })

  test('installPath not on disk: the row stays with id, scope and version, counts "—"', () => {
    const f = folderFiles()
    f[joinPath(pathOf('humanizer@humanizer'))] = { exists: false, manifest: null, texts: {}, lists: {} }
    const inv = buildInventory(input({ files: f }))
    const h = plugin(inv.items, 'humanizer@humanizer')
    expect([h?.scope, h?.version, h?.description, h?.counts]).toEqual(['user', '1.0.0', NO_FILES_NOTE, null])
    expect(summaryOf(h as PluginItem)).toBe('—')
    expect(inv.plugins).toBe(14)
    // control: a plugin with its files has counts
    expect(plugin(inv.items, 'ecc@ecc')?.counts).not.toBe(null)
  })

  test('only installPath counts: an older cached version beside it is never read', () => {
    const f = folderFiles()
    const older = joinPath(`${CACHE}\\ecc\\ecc\\0.9.0`)
    f[older] = { exists: true, manifest: JSON.stringify({ description: 'stara' }), texts: {}, lists: { skills: dirs(1) } }
    const ecc = plugin(buildInventory(input({ files: f })).items, 'ecc@ecc')
    expect(ecc?.description).toBe('ecc')
    expect(ecc?.counts?.skills).toBe(292)
  })

  test('policy: a lock for E3; a plugin outside the policy has none', () => {
    const inv = buildInventory(input({ policy: { 'ecc@ecc': true } }))
    expect(plugin(inv.items, 'ecc@ecc')?.isPolicy).toBe(true)
    expect(plugin(inv.items, 'relai@relai')?.isPolicy).toBe(false)
  })

  test('a higher layer forcing another value names its file; the same value names none', () => {
    const local = joinPath(CWD, '.claude/settings.local.json')
    const project = joinPath(CWD, '.claude/settings.json')
    const inv = buildInventory(input({
      settings: {
        ...input().settings,
        [project]: JSON.stringify({ enabledPlugins: { 'ecc@ecc': false, 'relai@relai': true } }),
        [local]: JSON.stringify({ enabledPlugins: { 'humanizer@humanizer': false } }),
      },
    }))
    expect(plugin(inv.items, 'ecc@ecc')?.overriddenBy).toBe(project)
    expect(plugin(inv.items, 'humanizer@humanizer')?.overriddenBy).toBe(local)
    expect(plugin(inv.items, 'relai@relai')?.overriddenBy).toBe('')
  })

  test('no installed_plugins.json: an empty state named, the hooks still there', () => {
    const inv = buildInventory(input({ installedText: null }))
    expect([inv.plugins, inv.hooks, inv.problem]).toEqual([0, 7, 'Brak zainstalowanych pluginów.'])
  })

  test('R5: an unknown shape of installed_plugins.json names the file, never an empty list', () => {
    expect(parseInstalls(JSON.stringify({ version: 3, installs: [] })).problem).toContain('installed_plugins.json')
    expect(parseInstalls('{nie json').problem).toBe('Nie da się odczytać installed_plugins.json.')
    expect(parseInstalls(JSON.stringify({ plugins: { 'a@b': 'zly', 'c@d': [{ scope: 'user' }] } })).problem).toContain('pominięto 1')
    // control: today's file has no problem
    expect(parseInstalls(INSTALLED).problem).toBe('')
  })

  test('an unreadable hooks.json or plugin.json is a note in its row; the rest of the list works', () => {
    const f = folderFiles()
    f[joinPath(pathOf('codex@openai-codex'))] = { exists: true, manifest: null, texts: { 'hooks/hooks.json': '{ "hooks": ' }, lists: {} }
    f[joinPath(pathOf('typesafe@typesafe-ai'))] = { exists: true, manifest: '{zly', texts: {}, lists: { skills: dirs(3) } }
    const inv = buildInventory(input({ files: f }))
    expect(plugin(inv.items, 'codex@openai-codex')?.notes).toEqual(['nie da się odczytać hooks/hooks.json'])
    expect(plugin(inv.items, 'typesafe@typesafe-ai')?.notes).toEqual(['nie da się odczytać .claude-plugin/plugin.json'])
    // a manifest that will not parse falls back to the default folders
    expect(plugin(inv.items, 'typesafe@typesafe-ai')?.counts?.skills).toBe(3)
    expect(inv.plugins).toBe(14)
    // control: a good hooks.json gives no note
    expect(plugin(inv.items, 'ecc@ecc')?.notes).toEqual([])
  })

  test('a mod switched off is still a mod, recognised by its hooks.json', () => {
    const part = pluginPart({ exists: true, manifest: null, texts: { 'hooks/hooks.json': MOD_HOOKS }, lists: {} })
    expect(part.kind).toBe('mod')
    // control: empty modules make no mod
    expect(pluginPart({ exists: true, manifest: null, texts: { 'hooks/hooks.json': JSON.stringify({ modules: [] }) }, lists: {} }).kind).toBe('plugin')
  })

  test('the cockpit itself carries "no switch"; another relai mod does not', () => {
    const extra = JSON.stringify({ version: 2, plugins: { ...JSON.parse(INSTALLED).plugins, 'relai-mods@relai': [{ scope: 'user', installPath: pathOf('relai-mods@relai'), version: '0.0.1' }] } })
    const inv = buildInventory(input({ installedText: extra }))
    expect(plugin(inv.items, 'relai-mods@relai')?.isSelf).toBe(true)
    expect(plugin(inv.items, 'relai-panel@relai')?.isSelf).toBe(false)
  })

  test('a long hook command is cut to 120 characters; its script is named by file', () => {
    const long = `node "C:\\Users\\Ktos\\x\\${'a'.repeat(150)}\\run-me.mjs" --flag`
    const [h] = userHooks(JSON.stringify({ hooks: { Stop: [{ matcher: 'x', hooks: [{ type: 'command', command: long }] }] } }))
    expect(h?.command.length).toBe(120)
    expect(h?.command.endsWith('…')).toBe(true)
    expect(h?.script).toBe('run-me.mjs')
    expect(h?.matcher).toBe('x')
    // control: a short command stays whole
    expect(shorten('node a.js')).toBe('node a.js')
  })
})

describe('inventory — paths (R6)', () => {
  test('backslashes and forward slashes join the same way', () => {
    expect(joinPath('C:\\a\\b\\', './c/d/')).toBe('C:/a/b/c/d')
    expect(joinPath('C:/a/b', 'c\\d')).toBe('C:/a/b/c/d')
  })

  test('a local marketplace with no .claude in its path reads like any other', () => {
    const where = 'D:\\dev\\moj-market\\plugins\\lokalny'
    const text = JSON.stringify({ version: 2, plugins: { 'lokalny@moj-market': [{ scope: 'user', installPath: where, version: '0.1.0' }] } })
    const inv = buildInventory(input({
      installedText: text,
      settings: { [joinPath(HOME, '.claude/settings.json')]: JSON.stringify({ enabledPlugins: { 'lokalny@moj-market': true } }) },
      files: { 'D:/dev/moj-market/plugins/lokalny': { exists: true, manifest: JSON.stringify({ description: 'lokalny' }), texts: { 'hooks/hooks.json': MOD_HOOKS }, lists: {} } },
    }))
    const p = plugin(inv.items, 'lokalny@moj-market')
    expect([p?.kind, p?.state, p?.description]).toEqual(['mod', 'on', 'lokalny'])
  })

  test('the user state file comes from the home; a project install from its own folder', () => {
    const inv = buildInventory(input())
    expect(plugin(inv.items, 'ecc@ecc')?.stateFile).toBe('C:/Users/Ktos/.claude/settings.json')
  })
})

describe('inventory — what register.tsx reads', () => {
  test('sources: manifest paths over defaults, the root hooks.json always, .mcp.json always', () => {
    const s = sourcesOf(JSON.stringify({ skills: './s/', hooks: ['./h/a.json'], agents: ['./g/x.md'], mcpServers: './m.json' }))
    expect(s.skills).toEqual(['s'])
    expect(s.commands).toEqual(['commands'])
    expect(s.hookFiles).toEqual(['hooks/hooks.json', 'h/a.json'])
    expect(foldersOf(s)).toEqual(['s', 'commands'])
    expect(filesOf(s)).toEqual(['hooks/hooks.json', 'h/a.json', '.mcp.json', 'm.json'])
  })

  test('a skill path that is one skill counts 1; MCP from an inline object', () => {
    const part = pluginPart({ exists: true, manifest: JSON.stringify({ skills: ['./one/'], mcpServers: { a: {}, b: {} } }), texts: {}, lists: { one: [{ name: 'SKILL.md', kind: 'file' }, { name: 'refs', kind: 'dir' }] } })
    expect(part.counts).toEqual({ skills: 1, agents: 0, commands: 0, mcp: 2 })
  })

  test('scripts: the last script path, quoted or not; none for a bare command', () => {
    expect(scriptOf('"C:\\Program Files\\nodejs\\node.exe" "C:\\h\\caveman-activate.js"')).toBe('caveman-activate.js')
    expect(scriptOf('powershell -File "C:\\h\\sync.ps1" -Reason stop')).toBe('sync.ps1')
    expect(scriptOf('echo hi')).toBe('')
  })

  test('Polish plurals', () => {
    expect([1, 2, 5, 12, 22, 7].map((n) => plural(n, 'hook', 'hooki', 'hooków'))).toEqual(['hook', 'hooki', 'hooków', 'hooków', 'hooki', 'hooków'])
  })
})
