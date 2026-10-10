// relai-panel: what the panel reads through, moved out of register.tsx in Z6 (AUDYT_MODOW) without
// a change of behavior. PaneIo is a set of plain closures over `$` that register.tsx makes (ioOf):
// the functions here and in tab-data.ts call them and never receive `$` itself (P-023 pkt 10).
// The session, the project root and the active plan's reads live here; the tabs' data in tab-data.ts.

import { ancestors, planState } from './core/plan-state.mjs'
import type { PlanState } from './core/plan-state.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { join } from './fmt'

export type Session = {
  id: string
  cwd: string
  isRelai: boolean
  plan: PlanState
  costUsd: number | null
  startedAt: number // when the session began, as the engine counts it ($.session.usage)
  loadedAt: number // when this module began collecting in it (a reload starts over)
}

export const FRESH: Session = { id: '', cwd: '', isRelai: false, plan: { kind: 'none' }, costUsd: null, startedAt: 0, loadedAt: 0 }

// The collector's file of one session (register.tsx, "the collector")
export type Ledger = { session: string, path: string, name: string, records: MeasureRecord[], bad: string[] }

export const MEASURE_DIR = '.claude/relai/pomiary'
export const CREW_DIR = '.claude/relai/work/CREW'

export type PaneIo = {
  session: () => Session // as it stands at the moment of the call
  read: (path: string) => Promise<string | null> // null when the file is not there
  stamp: (paths: readonly string[]) => Promise<string | null>
  folders: (rel: string) => Promise<string[]>
  records: () => Promise<{ current: Ledger, others: MeasureRecord[][] }>
  git: (argv: readonly string[]) => Promise<{ text: string, error: string }>
  now: () => Promise<number>
  writeError: () => string
}

// A file of the project, by its path from the root
export const readRel = (io: PaneIo, rel: string) => io.read(join(io.session().cwd, rel))

export const localDay = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

const RELAI_MARKER = /Wersja RelAI|RelAI version/

// The project root: the nearest folder, from the session's cwd upwards, whose docs/USTAWIENIA.md
// carries the RelAI marker. The cwd follows every cd the model's shell makes (E9, P-021), so a
// mod that looked in the cwd alone went silent the moment the shell left the project's root.
export async function relaiRoot(io: PaneIo, cwd: string): Promise<string | null> {
  for (const dir of ancestors(cwd)) {
    const text = await io.read(join(dir, 'docs/USTAWIENIA.md'))
    if (text !== null && RELAI_MARKER.test(text)) return dir
  }
  return null
}

// The plan from CLAUDE.md and the plan's STATUS.md, read again only when one of them moved (Z4):
// each model request asks their times, not their text
let planWatch: { paths: string[], stamp: string | null } = { paths: [], stamp: null }

// A new session watches from nothing
export function forgetPlan() { planWatch = { paths: [], stamp: null } }

export async function readPlan(io: PaneIo, isForced = false): Promise<PlanState> {
  // The times are taken before the read: a file that moves during it is read again next time
  const before = planWatch.paths.length ? await io.stamp(planWatch.paths) : null
  if (!isForced && before !== null && before === planWatch.stamp) return io.session().plan
  const paths: string[] = []
  const text = (path: string) => { paths.push(path); return io.read(path) }
  const claude = await text(join(io.session().cwd, 'CLAUDE.md'))
  const plan = await planState(claude, (rel) => text(join(io.session().cwd, rel)))
  const isSame = paths.length === planWatch.paths.length && paths.every((p, i) => p === planWatch.paths[i])
  planWatch = { paths, stamp: isSame ? before : await io.stamp(paths) }
  return plan
}
