// relai-mods: what is installed on this machine and what fires in it, read from disk — pure logic,
// no $ (the engine follows $ only inside the hooks module, P-017). Plan RELAI_MODS, E2: one list of
// mods, plugins and the user's own hooks, assembled from four sources (plan section 5, Annex A):
// installed_plugins.json, the settings file of each install's scope, the plugin's folder, and the
// hooks of ~/.claude/settings.json. The functions take file texts and folder listings; register.tsx
// reads the disk. Paths come in with `\` or `/` and leave with `/`.

export type PluginState = 'on' | 'off' | 'none'
export type Scope = 'user' | 'project' | 'local' | string

/** One install from installed_plugins.json. */
export type Install = {
  id: string
  scope: Scope
  version: string
  /** The project folder of a `local` or `project` install; '' for `user`. */
  projectPath: string
  installPath: string
}

export type DirEntry = { name: string, kind: 'file' | 'dir' | 'other' }

/** Where a plugin keeps its parts: manifest paths win over the default folders (prompt E2). */
export type Sources = {
  /** Hooks files to read, relative to the install; the root hooks/hooks.json always among them (P-013). */
  hookFiles: string[]
  skills: string[]
  commands: string[]
  agents: string[]
  mcpFiles: string[]
  /** Hooks written inline in plugin.json (an object, as caveman does). */
  inlineEvents: string[]
  /** MCP servers written inline in plugin.json. */
  inlineMcp: number
}

/** What register.tsx read for one install: texts by relative path, listings by relative folder. */
export type PluginFiles = {
  /** installPath exists on disk. */
  exists: boolean
  manifest: string | null
  texts: Record<string, string | null>
  lists: Record<string, DirEntry[] | null>
}

export type Counts = { skills: number, agents: number, commands: number, mcp: number }

export type PluginItem = Install & {
  kind: 'mod' | 'plugin'
  state: PluginState
  /** The settings file the state comes from (the install's scope). */
  stateFile: string
  description: string
  events: string[]
  /** null when the files are not on disk: the pane shows "—". */
  counts: Counts | null
  /** Notes for the details: no files, files that would not parse, no key in enabledPlugins. */
  notes: string[]
  /** For E3: managed by policy — a lock, never a switch. */
  isPolicy: boolean
  /** For E3: a higher layer forces another value; the file that does. '' for none. */
  overriddenBy: string
  /** For E3: the cockpit itself has no switch. */
  isSelf: boolean
}

export type HookItem = {
  kind: 'hook'
  event: string
  matcher: string
  /** The command cut to HOOK_COMMAND_MAX characters. */
  command: string
  /** The script the command runs, by file name; '' when none is recognised. */
  script: string
}

export type Item = PluginItem | HookItem

export type Inventory = {
  items: Item[]
  plugins: number
  enabled: number
  hooks: number
  /** Why the plugin list is empty or partial; '' when all read well. */
  problem: string
}

export const INSTALLED_FILE = 'installed_plugins.json'
export const SELF_NAME = 'relai-mods'
export const HOOK_COMMAND_MAX = 120 // SZACUNEK from the plan, section 8
export const NO_KEY_NOTE = 'brak wpisu w enabledPlugins'
export const NO_FILES_NOTE = 'brak plików na dysku'

export type CliResult = { exitCode: number | null, stdout: string, stderr: string }

const asObject = (v: unknown): Record<string, unknown> =>
  (v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {})

const asText = (v: unknown): string => (typeof v === 'string' ? v : '')

const isObject = (v: unknown): boolean => v !== null && typeof v === 'object' && !Array.isArray(v)

/** JSON of a file the CLI or a person wrote; a BOM is dropped (L-0041). undefined when it will not parse. */
export function tryJson(text: string): unknown {
  try {
    return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text)
  } catch {
    return undefined
  }
}

/** Anything unreadable or missing is an empty object. */
export function parseJson(text: string | null): Record<string, unknown> {
  return text ? asObject(tryJson(text)) : {}
}

/** Joins path parts with `/`, whatever slashes they came with; `./` and edge slashes dropped. */
export function joinPath(...parts: string[]): string {
  return parts
    .map((p, i) => {
      const s = p.replace(/\\/g, '/').replace(/^\.\//, '')
      return i === 0 ? s.replace(/\/+$/, '') : s.replace(/^\/+|\/+$/g, '')
    })
    .filter(Boolean)
    .join('/')
}

const lastPart = (path: string): string => path.replace(/\\/g, '/').replace(/\/+$/, '').split('/').pop() ?? ''

/** `enabledPlugins` of a settings file's text: id → true/false, other values left out. */
export function enabledOf(settingsText: string | null): Record<string, boolean> {
  const raw = asObject(parseJson(settingsText).enabledPlugins)
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'boolean')) as Record<string, boolean>
}

/**
 * The installs of installed_plugins.json (version 2: id → list of installs), sorted by id.
 * No file: no installs and no problem. A file of a shape this code does not know: the problem
 * names the file, so the pane never shows an empty list for it (R5).
 */
export function parseInstalls(installedText: string | null): { installs: Install[], problem: string } {
  if (installedText === null) return { installs: [], problem: '' }
  const json = tryJson(installedText)
  if (json === undefined) return { installs: [], problem: `Nie da się odczytać ${INSTALLED_FILE}.` }
  const plugins = asObject(json).plugins
  if (!isObject(plugins)) return { installs: [], problem: `Nieznany kształt ${INSTALLED_FILE}: brak obiektu "plugins".` }
  const installs: Install[] = []
  let skipped = 0
  for (const [id, list] of Object.entries(plugins as Record<string, unknown>)) {
    if (!Array.isArray(list)) { skipped += 1; continue }
    for (const entry of list) {
      if (!isObject(entry)) { skipped += 1; continue }
      const e = entry as Record<string, unknown>
      installs.push({
        id,
        scope: asText(e.scope) || 'user',
        version: asText(e.version),
        projectPath: asText(e.projectPath),
        installPath: asText(e.installPath),
      })
    }
  }
  installs.sort((a, b) => a.id.localeCompare(b.id) || a.scope.localeCompare(b.scope))
  const problem = skipped ? `Nieznany kształt ${INSTALLED_FILE}: pominięto ${skipped} wpis(y).` : ''
  return { installs, problem }
}

/** The settings file that holds an install's switch: by scope, in the home or the project folder. */
export function stateFileOf(install: Pick<Install, 'scope' | 'projectPath'>, home: string): string {
  if (install.scope === 'project' && install.projectPath) return joinPath(install.projectPath, '.claude/settings.json')
  if (install.scope === 'local' && install.projectPath) return joinPath(install.projectPath, '.claude/settings.local.json')
  return joinPath(home, '.claude/settings.json')
}

/** The layers above an install's scope that may force another value (user < project < local). */
export function upperFilesOf(install: Pick<Install, 'scope' | 'projectPath'>, cwd: string): string[] {
  if (install.scope === 'local') return []
  const project = install.scope === 'project' ? install.projectPath : cwd
  if (!project) return []
  const local = joinPath(project, '.claude/settings.local.json')
  return install.scope === 'project' ? [local] : [joinPath(project, '.claude/settings.json'), local]
}

/** Every settings file the inventory reads: user, and each scope and layer of every install. */
export function settingsFilesOf(installs: Install[], home: string, cwd: string): string[] {
  const all = [joinPath(home, '.claude/settings.json')]
  for (const i of installs) all.push(stateFileOf(i, home), ...upperFilesOf(i, cwd))
  return [...new Set(all)]
}

const asList = (v: unknown): string[] =>
  (typeof v === 'string' ? [v] : Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

const DEFAULT_HOOKS = 'hooks/hooks.json'

/** Where the plugin keeps its parts, from plugin.json; a manifest that will not parse gives the defaults. */
export function sourcesOf(manifestText: string | null): Sources {
  const m = parseJson(manifestText)
  const pick = (field: string, fallback: string) => (field in m ? asList(m[field]) : [fallback])
  const hooks = m.hooks
  const mcp = m.mcpServers
  return {
    hookFiles: [...new Set([DEFAULT_HOOKS, ...asList(hooks).map((p) => joinPath(p))])],
    skills: pick('skills', 'skills').map((p) => joinPath(p)),
    commands: pick('commands', 'commands').map((p) => joinPath(p)),
    agents: pick('agents', 'agents').map((p) => joinPath(p)),
    mcpFiles: ['.mcp.json', ...asList(mcp).map((p) => joinPath(p))],
    inlineEvents: isObject(hooks) ? Object.keys(hooks as Record<string, unknown>) : [],
    inlineMcp: isObject(mcp) ? Object.keys(mcp as Record<string, unknown>).length : 0,
  }
}

/** The folders register.tsx lists for a plugin: every path of skills, commands and agents. */
export function foldersOf(s: Sources): string[] {
  return [...new Set([...s.skills, ...s.commands, ...s.agents])].filter((p) => !p.endsWith('.md'))
}

/** The files register.tsx reads for a plugin besides plugin.json: hooks and MCP. */
export function filesOf(s: Sources): string[] {
  return [...new Set([...s.hookFiles, ...s.mcpFiles])]
}

const isMd = (name: string) => name.toLowerCase().endsWith('.md')

// A path in skills is a folder of skill folders, or one skill folder (it holds SKILL.md)
function countSkills(paths: string[], lists: PluginFiles['lists']): number {
  return paths.reduce((n, p) => {
    const list = lists[p]
    if (!list) return n
    return n + (list.some((e) => e.kind === 'file' && e.name === 'SKILL.md') ? 1 : list.filter((e) => e.kind === 'dir').length)
  }, 0)
}

// A path in commands or agents is a folder of .md files, or one .md file
function countMd(paths: string[], lists: PluginFiles['lists']): number {
  return paths.reduce((n, p) => (isMd(p) ? n + 1 : n + (lists[p] ?? []).filter((e) => e.kind === 'file' && isMd(e.name)).length), 0)
}

function countMcp(s: Sources, texts: PluginFiles['texts']): number {
  return s.mcpFiles.reduce((n, f) => {
    const t = texts[f]
    if (!t) return n
    const j = parseJson(t)
    return n + Object.keys(isObject(j.mcpServers) ? j.mcpServers as Record<string, unknown> : j).length
  }, s.inlineMcp)
}

/** The plugin's part read from its folder: kind, description, events, counts and notes. */
export function pluginPart(files: PluginFiles): Pick<PluginItem, 'kind' | 'description' | 'events' | 'counts' | 'notes'> {
  if (!files.exists) return { kind: 'plugin', description: NO_FILES_NOTE, events: [], counts: null, notes: [NO_FILES_NOTE] }
  const notes: string[] = []
  const manifestJson = files.manifest === null ? {} : tryJson(files.manifest)
  if (manifestJson === undefined) notes.push('nie da się odczytać .claude-plugin/plugin.json')
  const s = sourcesOf(manifestJson === undefined ? null : files.manifest)
  let isMod = false
  const events = new Set(s.inlineEvents)
  for (const f of s.hookFiles) {
    const t = files.texts[f]
    if (t === null || t === undefined) continue
    const j = tryJson(t)
    if (j === undefined) { notes.push(`nie da się odczytać ${f}`); continue }
    const o = asObject(j)
    if (Array.isArray(o.modules) && o.modules.length) isMod = true
    for (const ev of Object.keys(asObject(o.hooks))) events.add(ev)
  }
  return {
    kind: isMod ? 'mod' : 'plugin',
    description: asText(asObject(manifestJson).description),
    events: [...events],
    counts: {
      skills: countSkills(s.skills, files.lists),
      agents: countMd(s.agents, files.lists),
      commands: countMd(s.commands, files.lists),
      mcp: countMcp(s, files.texts),
    },
    notes,
  }
}

const stateOf = (v: boolean | undefined): PluginState => (v === true ? 'on' : v === false ? 'off' : 'none')

/** The script a hook command runs: the last path with a script extension, by file name. */
export function scriptOf(command: string): string {
  const found = command.match(/[^\s"']+\.(?:js|mjs|cjs|ts|ps1|sh|cmd|bat|py|rb)(?=["'\s]|$)/gi) ?? []
  return found.length ? lastPart(found[found.length - 1]) : ''
}

export function shorten(text: string, max = HOOK_COMMAND_MAX): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

/** The user's own hooks of ~/.claude/settings.json: one item per command, in the file's order. */
export function userHooks(settingsText: string | null): HookItem[] {
  const out: HookItem[] = []
  for (const [event, groups] of Object.entries(asObject(parseJson(settingsText).hooks))) {
    for (const g of Array.isArray(groups) ? groups : []) {
      const group = asObject(g)
      for (const h of Array.isArray(group.hooks) ? group.hooks : []) {
        const command = asText(asObject(h).command)
        if (!command) continue
        out.push({ kind: 'hook', event, matcher: asText(group.matcher), command: shorten(command), script: scriptOf(command) })
      }
    }
  }
  return out
}

export type InventoryInput = {
  home: string
  cwd: string
  installedText: string | null
  /** Settings texts by path (joinPath form); a missing file is null. */
  settings: Record<string, string | null>
  /** enabledPlugins of the policy layer ($.settings.read({ source: 'policy' })). */
  policy: Record<string, boolean>
  /** What was read for each install, by its installPath (joinPath form). */
  files: Record<string, PluginFiles>
}

const nameOf = (id: string) => id.split('@')[0] ?? id

/** One plugin item: the install, its state from its scope's file, its folder, its locks. */
export function pluginItem(install: Install, input: InventoryInput): PluginItem {
  const stateFile = stateFileOf(install, input.home)
  const value = enabledOf(input.settings[stateFile] ?? null)[install.id]
  const state = stateOf(value)
  const part = pluginPart(input.files[joinPath(install.installPath)] ?? { exists: false, manifest: null, texts: {}, lists: {} })
  const wanted = state === 'on'
  const overriddenBy = upperFilesOf(install, input.cwd).reverse()
    .find((f) => { const v = enabledOf(input.settings[f] ?? null)[install.id]; return v !== undefined && v !== wanted }) ?? ''
  return {
    ...install,
    ...part,
    state,
    stateFile,
    notes: state === 'none' ? [...part.notes, NO_KEY_NOTE] : part.notes,
    isPolicy: install.id in input.policy || install.scope === 'managed' || install.scope === 'policy',
    overriddenBy,
    isSelf: nameOf(install.id) === SELF_NAME,
  }
}

/** The whole list: plugins and mods by id, then the user's hooks. */
export function buildInventory(input: InventoryInput): Inventory {
  const { installs, problem } = parseInstalls(input.installedText)
  const plugins = installs.map((i) => pluginItem(i, input))
  const hooks = userHooks(input.settings[joinPath(input.home, '.claude/settings.json')] ?? null)
  return {
    items: [...plugins, ...hooks],
    plugins: plugins.length,
    enabled: plugins.filter((p) => p.state === 'on').length,
    hooks: hooks.length,
    problem: problem || (input.installedText === null ? 'Brak zainstalowanych pluginów.' : ''),
  }
}

// ---------- words for the pane ----------

/** Polish plural: 1 hook, 2–4 hooki, 5+ hooków (and 12–14 hooków). */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one
  const d = n % 10
  const t = n % 100
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many
}

/** The header: "12/14 włączone · 7 hooków własnych", from the data. */
export function headerOf(inv: Pick<Inventory, 'plugins' | 'enabled' | 'hooks'>): string {
  return `${inv.enabled}/${inv.plugins} włączone · ${inv.hooks} ${plural(inv.hooks, 'hook własny', 'hooki własne', 'hooków własnych')}`
}

// `none` reads as off: `claude plugin list` shows such a plugin as disabled (E1, P-052)
export const STATE_WORD: Record<PluginState, string> = { on: 'włączony', off: 'wyłączony', none: 'wyłączony' }

/** "1 zdarzenie", "2 zdarzenia", "5 zdarzeń": the count of a plugin's hook events. */
export function eventsWord(n: number): string {
  return `${n} ${plural(n, 'zdarzenie', 'zdarzenia', 'zdarzeń')}`
}

// A mod registers its commands and reacts to events in its hooks module, which no file count sees
export const MOD_MODULE_WORD = 'moduł hooków'

/** The short line under a plugin: its counts and events, or "—" without files. */
export function summaryOf(p: PluginItem): string {
  if (!p.counts) return '—'
  const c = p.counts
  const isMod = p.kind === 'mod'
  const parts = [
    `${c.skills} ${plural(c.skills, 'skill', 'skille', 'skilli')}`,
    `${c.agents} ${plural(c.agents, 'agent', 'agenci', 'agentów')}`,
    ...(isMod && c.commands === 0 ? [] : [`${c.commands} ${plural(c.commands, 'komenda', 'komendy', 'komend')}`]),
    `${c.mcp} MCP`,
  ]
  const events = p.events.length ? `zdarzenia: ${p.events.join(', ')}` : isMod ? MOD_MODULE_WORD : 'bez hooków'
  return [...parts, events].join(' · ')
}

// ---------- the switch (E1) ----------

/** The CLI call that flips a row: disable when it is on, enable otherwise (no key counts as off). */
export function toggleArgv(cli: string, row: Pick<Install, 'id' | 'scope'> & { state: PluginState }): string[] {
  return [cli, 'plugin', row.state === 'on' ? 'disable' : 'enable', row.id, '--scope', row.scope]
}

/** A failed call in one line: the exit code and the first non-empty line the CLI wrote. */
export function cliError(r: CliResult): string {
  const line = (r.stderr || r.stdout).split(/\r?\n/).map((s) => s.trim()).find(Boolean) ?? 'bez komunikatu'
  return `Błąd CLI (kod ${r.exitCode ?? 'brak'}): ${line}`
}
