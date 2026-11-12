// relai-model-router: the crew card — pure, no $ (plan MODY_OSZCZEDZANIA, E6; spec, section 5,
// row `/relai-crew`: one card before the crew starts, a table task / your model / suggestion /
// reason, a pick per row or "accept all"). The /relai-crew orchestrator sends its task list to the
// tool crew_models; the judge reads each task (secret scanner first, register.tsx); the person
// picks in the pane and closes the card. Each task then carries a mark in its prompt: the spawn of
// a member decided here runs on the card's model with no second card (register.tsx, agent.spawn).

import { TASK_CHARS, cutMiddle } from './judge'
import type { Alias, Pref, Tier, Tiers } from './judge'

export const CREW_TOOL = 'crew_models'
/** At most this many tasks on one card, and this many judge calls at once. */
export const CREW_MAX_TASKS = 12
/** DESIGN.md 6 (P-043): under this many columns the crew pane puts each button under its words. */
export const STACK_BELOW = 48
export const CREW_JUDGES_AT_ONCE = 3
const ID_RE = /^[A-Za-z0-9._-]{1,40}$/

export const CREW_DESCRIPTION = [
  'RelAI Model Router for /relai-crew: call once, after the wave plan and before any member starts, with every task the crew will run in Claude Code.',
  'A cheap judge reads each task and suggests the cheapest model tier that will do it well; the person sees one card with the table and picks per row or accepts all.',
  'Input: tasks [{ id, title, task, model }] — model is the one from the crew interview (an alias), left out when none was chosen.',
  'Returns, per task, the model to pass to Agent and a mark: put the mark as the first line of that member\'s prompt, so its spawn runs on the chosen model with no second card.',
  'Returns asleep with a reason when the router does not run: then keep the interview\'s models.',
].join(' ')

export const CREW_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      maxItems: CREW_MAX_TASKS,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'the task id from zadania.json' },
          title: { type: 'string', description: 'one line: what the member does' },
          task: { type: 'string', description: 'the task text the member gets (scope, files, done criterion)' },
          model: { type: 'string', description: 'the model from the crew interview (alias), if any' },
        },
        required: ['id', 'title'],
      },
    },
  },
  required: ['tasks'],
} as const

export type CrewTask = { id: string, title: string, task: string, model: string | null }

/** The orchestrator's input as tasks, or why it is not one (the tool then answers with the reason). */
export function crewTasksOf(input: unknown): { ok: true, tasks: CrewTask[] } | { ok: false, why: string } {
  const list = (input as { tasks?: unknown } | null)?.tasks
  if (!Array.isArray(list) || list.length === 0) return { ok: false, why: 'tasks must be a non-empty list' }
  if (list.length > CREW_MAX_TASKS) return { ok: false, why: `at most ${CREW_MAX_TASKS} tasks on one card` }
  const seen = new Set<string>()
  const tasks: CrewTask[] = []
  for (const t of list) {
    const o = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>
    const id = String(o.id ?? '')
    if (!ID_RE.test(id)) return { ok: false, why: `task id "${id.slice(0, 40)}" must be letters, digits, dot, dash or underscore` }
    if (seen.has(id)) return { ok: false, why: `task id "${id}" repeats` }
    seen.add(id)
    const title = String(o.title ?? '').trim()
    if (!title) return { ok: false, why: `task ${id} has no title` }
    const model = typeof o.model === 'string' && o.model.trim() ? o.model.trim() : null
    // the task is cut as the judge reads it: the scanner never walks an unbounded text inside the hook's budget (review E6)
    tasks.push({ id, title: cutMiddle(title, 200), task: cutMiddle(String(o.task ?? ''), TASK_CHARS), model })
  }
  return { ok: true, tasks }
}

/** One row of the card. pick: the model the member runs on (null: the model it was given, unchanged). */
export type CrewRow = {
  id: string
  title: string
  /** The model someone chose (interview, or the subagent default), as an alias; null outside the list. */
  mine: Alias | null
  /** The interview's model exactly as given (`opus[1m]`, a full id, a model outside the list), or null: what "unchanged" passes on. */
  given: string | null
  isExplicit: boolean
  suggestion: Alias | null
  rule: string
  outcome: 'judged' | 'secret' | 'failed' | 'outside'
  pick: Alias | null
}

/** The model a task runs on before the router: the interview's, else the subagent default, else the session's. */
export function baseOf(task: CrewTask, subagentDefault: string | null, sessionModel: string | null): { from: string, isExplicit: boolean } {
  if (task.model) return { from: task.model, isExplicit: true }
  return { from: subagentDefault ?? sessionModel ?? '', isExplicit: subagentDefault !== null }
}

export type CrewJudged =
  | { kind: 'outside' }
  | { kind: 'secret', label: string }
  | { kind: 'failed', why: string }
  | { kind: 'judged', tier: Tier, rule: string }

/** The row for one task. A row starts on the model someone chose: nothing changes without a pick. */
export function rowOf(task: CrewTask, mine: Alias | null, isExplicit: boolean, j: CrewJudged, tiers: Tiers): CrewRow {
  const base = { id: task.id, title: task.title, mine, given: task.model, isExplicit, pick: null }
  if (j.kind === 'outside' || mine === null) return { ...base, suggestion: null, rule: 'model outside the RelAI list: not judged', outcome: 'outside' }
  // the secret may sit in the title too: the title is never kept, drawn or asked about (review E6)
  if (j.kind === 'secret') return { ...base, title: '(held back by the secret scanner)', suggestion: null, rule: `secret scanner (${j.label}): not sent to the judge`, outcome: 'secret' }
  if (j.kind === 'failed') return { ...base, suggestion: null, rule: `judge failed: ${j.why}`, outcome: 'failed' }
  const suggestion = tiers.alias[j.tier]
  // No model of anyone's choosing: the judge's tier is pinned, as for a single spawn (E5)
  return { ...base, suggestion, rule: j.rule, outcome: 'judged', pick: isExplicit ? null : suggestion }
}

/** Rows where the judge suggests another model than the one someone chose: only these need a person. */
export const differs = (r: CrewRow): boolean => r.isExplicit && r.outcome === 'judged' && r.suggestion !== null && r.suggestion !== r.mine

/**
 * What the card does with the rows (spec, section 5; Annex B): nothing differs → quiet; the
 * session's answer "always mine/suggestion/session" → applied with no card; no person → the
 * suggestion applies; otherwise the person is asked.
 */
export function crewAction(rows: readonly CrewRow[], o: { pref: Pref, hasHuman: boolean }): 'quiet' | 'ask' | 'apply' | 'keep' | 'session' {
  if (!rows.some(differs)) return 'quiet'
  if (o.pref === 'mine') return 'keep'
  if (o.pref === 'suggestion') return 'apply'
  if (o.pref === 'session') return 'session'
  return o.hasHuman ? 'ask' : 'apply'
}

/** A row's pick toggles between the chosen model and the suggestion (the pane's button). */
export function togglePick(rows: readonly CrewRow[], id: string): CrewRow[] {
  return rows.map((r) => (r.id === id && differs(r) ? { ...r, pick: r.pick === r.suggestion ? null : r.suggestion } : r))
}

/** "Accept all": every differing row runs on its suggestion. */
export const acceptAll = (rows: readonly CrewRow[]): CrewRow[] => rows.map((r) => (differs(r) ? { ...r, pick: r.suggestion } : r))
/** "Mine for all": every row someone chose keeps that model. */
export const mineAll = (rows: readonly CrewRow[]): CrewRow[] => rows.map((r) => (differs(r) ? { ...r, pick: null } : r))
/** The session's model on every differing row (Annex B: always the session's model). */
export const sessionAll = (rows: readonly CrewRow[], session: Alias | null): CrewRow[] => rows.map((r) => (differs(r) && session ? { ...r, pick: session } : r))

/** The card's buttons: with the pane, start with its picks; without it, one decision for all. */
export const CREW_HEADER = 'Crew models'
export const CREW_START = 'Start with the picks above'
export const CREW_ACCEPT = 'Accept all suggestions'
export const CREW_MINE = 'Mine for all'
export const crewOptions = (isPane: boolean): string[] => (isPane ? [CREW_START, CREW_ACCEPT, CREW_MINE] : [CREW_ACCEPT, CREW_MINE])

/** The rows after the card's answer. Anything else (free text, a dismissed card) keeps every chosen model. */
export function crewAnswerOf(label: string, rows: readonly CrewRow[], isPane: boolean): { rows: CrewRow[], word: string } {
  if (label === CREW_ACCEPT) return { rows: acceptAll(rows), word: 'accept all' }
  if (label === CREW_START && isPane) return { rows: [...rows], word: 'picks per row' }
  if (label === CREW_MINE) return { rows: mineAll(rows), word: 'mine for all' }
  // anything else keeps every chosen model; picks made in the pane are named as dropped, never lost silently (review E6)
  const dropped = rows.filter((r) => differs(r) && r.pick !== null).map((r) => r.id)
  return { rows: mineAll(rows), word: dropped.length ? `no answer: mine kept, pane picks dropped (${dropped.join(', ')})` : 'no answer: mine kept' }
}

const nameOf = (a: Alias | null): string => a ?? 'default'

/** The card's question; without the pane the table goes into it (one line per task). */
export function crewQuestion(rows: readonly CrewRow[], isPane: boolean): string {
  const n = rows.filter(differs).length
  if (isPane) return `The judge suggests another model for ${n} of ${rows.length} crew tasks — the table is in the pane "RelAI crew models", one button per row. Start the crew?`
  const lines = rows.map((r) => `${r.id}: ${cutMiddle(r.title, 50)} — yours ${nameOf(r.mine)}${differs(r) ? `, suggestion ${r.suggestion}` : ''}`)
  return `Crew models (the judge suggests another model for ${n} of ${rows.length} tasks):\n${lines.join('\n')}\nWhich models should the crew run on?`
}

/**
 * The run token of one crew card: the tool call's id (its last 10 letters and digits) plus the
 * call's number in the session, so two cards never share a token, also with no id (review E6).
 */
export function runTokenOf(toolUseId: string, n: number): string {
  const tail = String(toolUseId).replace(/[^A-Za-z0-9]/g, '').slice(-7)
  return `${tail || 'run'}${Math.max(0, Math.floor(n)).toString(36)}`.slice(-10)
}
export const markOf = (run: string, id: string): string => `[relai-crew ${run}/${id}]`
/** The mark is the prompt's first line, nothing else: a later prompt quoting a member's text is no member (review E6). */
const MARK_RE = /^\[relai-crew ([A-Za-z0-9]{1,10})\/([A-Za-z0-9._-]{1,40})\][ \t]*(?:\r?\n|$)/

/** The run and task a spawn's prompt names on its first line, or null (an ordinary spawn: the E5 path). */
export function markIn(prompt: string): { run: string, id: string } | null {
  const m = MARK_RE.exec(String(prompt || ''))
  return m ? { run: m[1], id: m[2] } : null
}

/**
 * One decided member: its mark, the model it runs on (null: as given, unchanged) and the model
 * the reply named for it — a spawn asking for any other model is not this member (review E6).
 */
export type CrewDecision = { run: string, id: string, model: Alias | null, replied: string | null, given: string | null, rowIndex: number }

/** The model the reply names for a row: the pick, else the interview's model exactly as given. */
export const repliedOf = (r: CrewRow): string | null => r.pick ?? r.given

export function decisionsOf(run: string, rows: readonly CrewRow[]): CrewDecision[] {
  return rows.map((r, i) => ({ run, id: r.id, model: r.pick, replied: repliedOf(r), given: r.given, rowIndex: i }))
}

/** The decision for a spawn's mark, or null. */
export function decisionFor(list: readonly CrewDecision[], mark: { run: string, id: string } | null): CrewDecision | null {
  if (!mark) return null
  return list.find((d) => d.run === mark.run && d.id === mark.id) ?? null
}

/**
 * Whether a marked spawn is the decided member: it asks for no model, the reply's model or the
 * interview's own. Any other model (a fixer, a bigger retry) is a new choice: the E5 path.
 */
export function isDecidedSpawn(d: CrewDecision, spawnModel: string | null | undefined): boolean {
  const m = typeof spawnModel === 'string' && spawnModel !== '' ? spawnModel : null
  return m === null || m === d.replied || m === d.given
}

/** Decisions kept across cards: whole runs, the newest `maxRuns` (a run never loses some of its members). */
export function keepRuns(prev: readonly CrewDecision[], run: string, next: readonly CrewDecision[], maxRuns: number): CrewDecision[] {
  const merged = [...prev.filter((d) => d.run !== run), ...next]
  const runs = [...new Set(merged.map((d) => d.run))]
  const kept = new Set(runs.slice(-Math.max(1, maxRuns)))
  return merged.filter((d) => kept.has(d.run))
}

/** The orchestrator's answer: per task the model for Agent (the interview's exactly as given when nothing changed) and the mark. */
export function crewReply(run: string, rows: readonly CrewRow[], how: string): string {
  return JSON.stringify({
    router: 'relai-model-router',
    how,
    tasks: rows.map((r) => ({ id: r.id, model: repliedOf(r), changed: r.pick !== null && r.pick !== r.mine, mark: markOf(run, r.id), why: r.rule })),
    use: 'Pass each model to Agent (null: leave the model out) and put each mark alone as the first line of that member\'s prompt, before any role preamble.',
  })
}

/** One row of the crew pane: state as a word and a sign (DESIGN.md, 5), a button only where a pick is the person's. */
export type CrewPaneRow = { key: string, sign: string, state: string, title: string, why: string, button: string | null }

export function crewPaneRows(rows: readonly CrewRow[]): CrewPaneRow[] {
  return rows.map((r) => {
    const base = { key: `crew-${r.id}`, title: `${r.id} · ${r.title}`, why: r.rule }
    if (!differs(r)) {
      const runs = r.pick ?? r.mine
      const word = r.outcome === 'judged' ? (r.pick && r.pick !== r.mine ? `judge's tier ${runs} (nobody chose a model)` : `${nameOf(runs)} — judge agrees`) : `${nameOf(runs)} kept`
      return { ...base, sign: r.outcome === 'secret' ? '●' : '·', state: word, button: null }
    }
    const isSuggestion = r.pick === r.suggestion
    return { ...base, sign: isSuggestion ? '✓' : '○', state: isSuggestion ? `suggestion ${r.suggestion} (yours ${r.mine})` : `yours ${r.mine} (suggestion ${r.suggestion})`, button: isSuggestion ? `Back to ${r.mine}` : `Use ${r.suggestion}` }
  })
}

/** Runs `fn` on every item, at most `limit` at once, keeping the order. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let next = 0
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker))
  return out
}
