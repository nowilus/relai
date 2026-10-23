// relai-mods: the plugins installed for this machine, read from disk — pure logic, no $ (the
// engine follows $ only inside the hooks module). Spike build of plan RELAI_MODS, E1: the bare
// list from installed_plugins.json and the argv of one switch; the four sources are E2.

export type PluginState = 'on' | 'off' | 'none'

export type PluginRow = {
  id: string
  scope: string
  version: string
  /** The project folder of a `local` or `project` install; '' for `user`. */
  projectPath: string
  /** What `enabledPlugins` of ~/.claude/settings.json holds for it: true, false, or no key. */
  state: PluginState
}

export type CliResult = { exitCode: number | null, stdout: string, stderr: string }

const asObject = (v: unknown): Record<string, unknown> =>
  (v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {})

const asText = (v: unknown): string => (typeof v === 'string' ? v : '')

// A file the CLI writes may carry a BOM (L-0041); anything unreadable is an empty object
export function parseJson(text: string | null): Record<string, unknown> {
  if (!text) return {}
  try {
    return asObject(JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text))
  } catch {
    return {}
  }
}

/** `enabledPlugins` of a settings file's text: id → true/false, other values left out. */
export function enabledOf(settingsText: string | null): Record<string, boolean> {
  const raw = asObject(parseJson(settingsText).enabledPlugins)
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === 'boolean')) as Record<string, boolean>
}

/** One row per install of installed_plugins.json (version 2: id → list of installs), sorted by id. */
export function parseInstalled(installedText: string | null, enabled: Record<string, boolean>): PluginRow[] {
  const plugins = asObject(parseJson(installedText).plugins)
  const rows: PluginRow[] = []
  for (const [id, list] of Object.entries(plugins)) {
    for (const entry of Array.isArray(list) ? list : []) {
      const e = asObject(entry)
      const on = enabled[id]
      rows.push({
        id,
        scope: asText(e.scope) || 'user',
        version: asText(e.version),
        projectPath: asText(e.projectPath),
        state: on === true ? 'on' : on === false ? 'off' : 'none',
      })
    }
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id) || a.scope.localeCompare(b.scope))
}

/** The CLI call that flips a row: disable when it is on, enable otherwise (no key counts as off). */
export function toggleArgv(cli: string, row: Pick<PluginRow, 'id' | 'scope' | 'state'>): string[] {
  return [cli, 'plugin', row.state === 'on' ? 'disable' : 'enable', row.id, '--scope', row.scope]
}

/** A failed call in one line: the exit code and the first non-empty line the CLI wrote. */
export function cliError(r: CliResult): string {
  const line = (r.stderr || r.stdout).split(/\r?\n/).map((s) => s.trim()).find(Boolean) ?? 'bez komunikatu'
  return `Błąd CLI (kod ${r.exitCode ?? 'brak'}): ${line}`
}

export const STATE_WORD: Record<PluginState, string> = { on: 'włączony', off: 'wyłączony', none: 'brak wpisu' }

/** The block `claude plugin list` prints for one id, its lines joined; '' when the list has none. */
export function listBlock(listText: string, id: string): string {
  const lines = listText.split(/\r?\n/)
  const at = lines.findIndex((l) => l.includes(id))
  if (at < 0) return ''
  const block = [lines[at].trim()]
  for (const l of lines.slice(at + 1)) {
    if (!l.trim() || l.includes('❯')) break
    block.push(l.trim())
  }
  return block.join(' | ')
}

export function median(values: number[]): number | null {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2)
}
