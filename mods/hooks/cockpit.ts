// relai-mods: the cockpit's own logic — pure, no $ (P-017). Plan RELAI_MODS, E3: the filters and
// the search, the count of changes waiting for a reload, the queue of CLI calls, the locks, and what
// a switch runs and changes. register.tsx draws it; inventory.ts reads the disk.

import { joinPath, toggleArgv } from './inventory'
import type { Item, PluginItem, PluginState } from './inventory'

export type Filter = 'all' | 'mod' | 'plugin' | 'hook' | 'off'

/** The filters in the order the pane draws them, with their words (mockup C). */
export const FILTERS: ReadonlyArray<readonly [Filter, string]> = [
  ['all', 'Wszystko'], ['mod', 'Mody'], ['plugin', 'Pluginy'], ['hook', 'Hooki'], ['off', 'Wyłączone'],
]

export const isFilter = (v: string): v is Filter => FILTERS.some(([f]) => f === v)

/**
 * One row's address in the tree and in $.state: unique across the list. A plugin's is its install
 * (id, scope, project), never its kind, which comes from files that may change between a draw and a
 * press; a hook's carries its matcher, as one script may run under two.
 */
export function itemKey(i: Item): string {
  return i.kind === 'hook' ? `hook-${i.event}-${i.matcher}-${i.script}-${i.command}` : `plugin-${i.id}-${i.scope}-${i.projectPath}`
}

/** A plugin reads as on only with true in its scope's file; no key reads as off (E1, P-052). */
export const isOn = (p: Pick<PluginItem, 'state'>): boolean => p.state === 'on'

const nameOf = (id: string) => id.split('@')[0] ?? id

// Every text a person may look for: id, name, description, events; a hook's event, script, command
function haystack(i: Item): string {
  const parts = i.kind === 'hook'
    ? [i.event, i.script, i.command, i.matcher]
    : [i.id, nameOf(i.id), i.description, ...i.events]
  return parts.join(' ').toLowerCase()
}

/** Whether a row stands under the filter and matches the search (case-insensitive, trimmed). */
export function matches(i: Item, filter: Filter, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q && !haystack(i).includes(q)) return false
  if (filter === 'all') return true
  if (filter === 'off') return i.kind !== 'hook' && !isOn(i)
  return i.kind === filter
}

export function visible(items: Item[], filter: Filter, query: string): Item[] {
  return items.filter((i) => matches(i, filter, query))
}

// ---------- changes waiting for a reload ----------

/** What this chat loaded: plugin row key → on. */
export type Loaded = Record<string, boolean>

/**
 * The loaded state: the disk as it stood when this chat loaded its plugins — at session.start, and at
 * the plugin.register a /reload-plugins raises for the other mods (register.tsx). Not the engine's merge
 * of $.settings.read(): it follows a CLI write within seconds, no reload needed (live, E3). A plugin
 * of another project never loads in this chat: it has no loaded state and adds nothing to N. Nor
 * does a locked row: no press of the cockpit changes it.
 */
export function snapshotOf(items: Item[], cwd: string): Loaded {
  const out: Loaded = {}
  for (const i of items) {
    if (i.kind === 'hook' || lockOf(i) || (isProjectScope(i) && !isInside(cwd, i.projectPath))) continue
    out[itemKey(i)] = isOn(i)
  }
  return out
}

/**
 * N of the bar: the plugins whose state on disk differs from what this chat loaded — not the
 * presses (plan, section 8). A plugin installed after the snapshot is not counted: there is no
 * loaded state to differ from.
 */
export function pendingCount(items: Item[], loaded: Loaded): number {
  return items.filter((i) => i.kind !== 'hook' && itemKey(i) in loaded && loaded[itemKey(i)] !== isOn(i)).length
}

export function pendingText(n: number): string {
  if (n === 1) return '1 zmiana czeka na przeładowanie'
  const d = n % 10
  const t = n % 100
  return `${n} ${d >= 2 && d <= 4 && (t < 12 || t > 14) ? 'zmiany czekają' : 'zmian czeka'} na przeładowanie`
}

// ---------- locks ----------

export const LOCK_WORD = {
  hook: 'tylko podgląd',
  self: 'ten kokpit',
  policy: 'zarządzane przez politykę',
} as const

/** Why a row has a lock instead of a switch; '' when it has a switch. No CLI call behind a lock. */
export function lockOf(i: Item): string {
  if (i.kind === 'hook') return LOCK_WORD.hook
  if (i.isSelf) return LOCK_WORD.self
  if (i.isPolicy) return LOCK_WORD.policy
  if (i.overriddenBy) return `nadpisane w ${i.overriddenBy}`
  return ''
}

/** The lock's word in a row, short; the details give the whole reason of lockOf. */
export function rowLockWord(i: Item): string {
  if (i.kind === 'hook') return LOCK_WORD.hook
  if (i.isSelf) return LOCK_WORD.self
  if (i.isPolicy) return 'polityka'
  return i.overriddenBy ? 'nadpisane' : ''
}

/** The command the person runs to turn the cockpit off; it never turns itself off (section 8). */
export const selfCommand = (id: string): string => `claude plugin disable ${id}`

// ---------- the switch ----------

// Windows paths: `\` or `/`, any case. The session may run in a subfolder of the project (L-0146)
const norm = (p: string) => joinPath(p).toLowerCase()
const isInside = (cwd: string, project: string) => norm(cwd) === norm(project) || norm(cwd).startsWith(`${norm(project)}/`)
const folderName = (path: string) => joinPath(path).split('/').pop() ?? path

const isProjectScope = (p: Pick<PluginItem, 'scope' | 'projectPath'>) =>
  (p.scope === 'project' || p.scope === 'local') && Boolean(p.projectPath)

/** The CLI call of a switch: a project's plugin runs from its own folder (Annex A pt 2). */
export function flipCall(cli: string, p: PluginItem): { argv: string[], cwd?: string } {
  const argv = toggleArgv(cli, p)
  return isProjectScope(p) ? { argv, cwd: joinPath(p.projectPath) } : { argv }
}

/** The row's project label: "projekt" for this folder, "projekt <folder>" for another, '' for none. */
export function projectLabel(p: Pick<PluginItem, 'scope' | 'projectPath'>, cwd: string): string {
  if (!isProjectScope(p)) return ''
  return isInside(cwd, p.projectPath) ? 'projekt' : `projekt ${folderName(p.projectPath)}`
}

/** What a switch changes, for the details: the file, and a warning for a file tracked in this repo (R9). */
export function changeText(p: PluginItem, cwd: string): string[] {
  if (!isProjectScope(p)) return [`Zmieni się ${p.stateFile}.`]
  if (!isInside(cwd, p.projectPath)) return [`Zmieni się plik w projekcie ${folderName(p.projectPath)}: ${p.stateFile}.`]
  return p.scope === 'project'
    ? [`Zmieni się ${p.stateFile}.`, 'To plik śledzony w repo tego projektu.']
    : [`Zmieni się ${p.stateFile}.`]
}

export const switchWord = (state: PluginState): string => (state === 'on' ? 'Wyłącz' : 'Włącz')

// ---------- the queue of CLI calls ----------

/** One CLI call at a time: the running row, then the rows waiting in press order. */
export type Queue = { running: string, waiting: string[] }

export const EMPTY_QUEUE: Queue = { running: '', waiting: [] }

/** A press joins the queue; a press on a row already running or waiting is ignored. */
export function enqueue(q: Queue, key: string): Queue {
  if (q.running === key || q.waiting.includes(key)) return q
  return { running: q.running, waiting: [...q.waiting, key] }
}

/** The next call: the first waiting row runs when none is running. */
export function startNext(q: Queue): { queue: Queue, key: string } {
  if (q.running || !q.waiting.length) return { queue: q, key: '' }
  const [key, ...rest] = q.waiting
  return { queue: { running: key ?? '', waiting: rest }, key: key ?? '' }
}

export function finish(q: Queue, key: string): Queue {
  return q.running === key ? { running: '', waiting: q.waiting } : q
}

export const isQueued = (q: Queue, key: string): boolean => q.running === key || q.waiting.includes(key)

// ---------- the budget of the tree (P-023 pkt 7) ----------

// The same weight as panel/hooks/pane-parts.tsx (the mod cannot import it, P-017): every element 1,
// a drawing with markup 4 more; past DRAW_LIMIT the desktop draws nothing (probe 2026-10-15)
export const DRAW_LIMIT = 1_200
const SVG_WEIGHT = 4
const HOLLOW_MOST = 200

export function treeWeight(node: unknown): number {
  if (Array.isArray(node)) return node.reduce((sum: number, n) => sum + treeWeight(n), 0)
  if (!node || typeof node !== 'object' || !('type' in node)) return 0
  const n = node as { type: string, props?: { source?: unknown }, children?: unknown[] }
  const own = n.type === 'Svg' && String(n.props?.source ?? '').length > HOLLOW_MOST ? 1 + SVG_WEIGHT : 1
  return own + treeWeight(n.children ?? [])
}

/** The terminal's switch glyph; on the desktop it stands in a row past the budget (R7). */
export const glyphOf = (state: PluginState): string => (state === 'on' ? '●━━' : '━━○')
