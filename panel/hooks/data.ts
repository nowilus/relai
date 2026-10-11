// relai-panel: the shapes of what the pane's tabs draw from. register.tsx reads them from the
// project and the session (everything that takes `$` stays there, P-023 pkt 10); the pane-*.tsx
// files draw them. Types, and the one sum the map's data and its drawing share (sumCost, Z14).

import type { MeasureRecord, Report, TurnCost } from './core/measure.mjs'
import type { FocusTarget, Packet, Work } from './focus'
import type { cacheEffect, modelCosts } from './core/pricing.mjs'
import type { Version } from './core/pricing.mjs'
import type { projectSummary, requestSeries } from './core/measure.mjs'
import type { StageCosts, taskCosts } from './core/attribution.mjs'
import type { CrewRun, Merges, PlanNode } from './core/flow.mjs'
import type { DiffView, Doc, Group as DocGroup, TreeNode, previewOf } from './core/documents.mjs'
import type { Sheet } from './core/phrases.mjs'
import type { PlanState, Stage } from './core/plan-state.mjs'
import type { Progress } from './core/progress.mjs'

export type ProjectSum = ReturnType<typeof projectSummary>
export type CallCost = ReturnType<typeof requestSeries>[number]
export type Unpriced = { model: string, records: number }

export type Prices = { lists: Version[], error: string, date: string, source: string, saved: number, warning: string }

export type CostData = { report: Report, records: MeasureRecord[], series: TurnCost[], calls: CallCost[], effect: ReturnType<typeof cacheEffect>, project: ProjectSum, file: string, stages: StageCosts, prices: Prices, unpriced: Unpriced[], models: ReturnType<typeof modelCosts>, writeError: string }

// "Ta sesja" on top of the map (AUDYT_MODOW Z14, Aneks B): the session's work as the bars draw it
// (Z12) — a thread with its packets, a stage of a plan, outside any plan, or the choice still to
// make — and what the measurements tagged with that work cost, summed as the map sums a stage
export type MapCost = { usd: number | null, isPartial: boolean, records: number }
// A plan whose STATUS.md cannot be read is said in words (reason), never a card that vanishes
export type MapSession =
  | { kind: 'branch', card: string, status: string | null, packets: Packet[], now: Packet | null, cost: MapCost }
  | { kind: 'plan', plan: string, stage: Stage | null, cost: MapCost }
  | { kind: 'outside', cost: MapCost }
  | { kind: 'asking' }
  | { kind: 'unknown', reason: string }

// The cost of a set of rows, as the map sums a plan's stages: a price missing in one makes it
// partial, no price at all is null; an empty set counts 0 records ("bez pomiaru")
export function sumCost(list: readonly MapCost[]): MapCost {
  return {
    usd: list.some((c) => c.usd !== null) ? list.reduce((s, c) => s + (c.usd ?? 0), 0) : null,
    isPartial: list.some((c) => c.isPartial),
    records: list.reduce((s, c) => s + c.records, 0),
  }
}

// untaggedSince: the local day ("YYYY-MM-DD") of the first measurement without a stage tag, if any
// session: null when the session has no work to show (no focus and no active plan)
export type MapData = { nodes: PlanNode[], runs: CrewRun[], merges: Merges, cost: StageCosts, tasks: ReturnType<typeof taskCosts>, active: string | null, untaggedSince: string | null, prices: Prices, session: MapSession | null }

// The session's commands and the project's cheat sheet: read once per /relai-panel and after a reload
export type PaneData = {
  names: Record<string, string | null> // command -> the name the session runs it by
  descriptions: Record<string, string>
  hasRelai: boolean
  sheet: Sheet
}

export type OpenDoc ={ group: string, doc: Doc, diff: DiffView | null, diffError: string, preview: ReturnType<typeof previewOf> | null }
export type DocsData = { changed: Doc[], edited: Doc[], groups: DocGroup[], tree: TreeNode, now: number, gitError: string, open: OpenDoc | null }

// "Teraz" (brief v2 §6.2, AUDYT_MODOW Z2): the active plan and what the progress bar reads from the
// same files — a live crew run, else the stage prompt's boxes (./core/progress.mjs, this plugin's copy)
// The work of the session (Z12) and what "Zmień" offers: the active plan's open stages, the open
// thread cards, outside any plan
export type FocusChoice = { key: string, label: string, target: FocusTarget | 'outside' }
export type NowData = { plan: PlanState, progress: Progress, work: Work, choices: FocusChoice[] }
