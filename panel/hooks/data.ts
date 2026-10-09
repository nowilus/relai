// relai-panel: the shapes of what the pane's tabs draw from. register.tsx reads them from the
// project and the session (everything that takes `$` stays there, P-023 pkt 10); the pane-*.tsx
// files draw them. Types only: nothing here runs.

import type { MeasureRecord, Report, TurnCost } from './core/measure.mjs'
import type { cacheEffect, modelCosts } from './core/pricing.mjs'
import type { Version } from './core/pricing.mjs'
import type { projectSummary, requestSeries } from './core/measure.mjs'
import type { StageCosts, taskCosts } from './core/attribution.mjs'
import type { CrewRun, Merges, PlanNode } from './core/flow.mjs'
import type { DiffView, Doc, Group as DocGroup, TreeNode, previewOf } from './core/documents.mjs'
import type { Sheet } from './core/phrases.mjs'

export type ProjectSum = ReturnType<typeof projectSummary>
export type CallCost = ReturnType<typeof requestSeries>[number]
export type Unpriced = { model: string, records: number }

export type Prices = { lists: Version[], error: string, date: string, source: string, saved: number, warning: string }

export type CostData = { report: Report, records: MeasureRecord[], series: TurnCost[], calls: CallCost[], effect: ReturnType<typeof cacheEffect>, project: ProjectSum, file: string, stages: StageCosts, prices: Prices, unpriced: Unpriced[], models: ReturnType<typeof modelCosts> }

// untaggedSince: the local day ("YYYY-MM-DD") of the first measurement without a stage tag, if any
export type MapData = { nodes: PlanNode[], runs: CrewRun[], merges: Merges, cost: StageCosts, tasks: ReturnType<typeof taskCosts>, active: string | null, untaggedSince: string | null, prices: Prices }

// The session's commands and the project's cheat sheet: read once per /relai-panel and after a reload
export type PaneData = {
  names: Record<string, string | null> // command -> the name the session runs it by
  descriptions: Record<string, string>
  hasRelai: boolean
  sheet: Sheet
}

export type OpenDoc ={ group: string, doc: Doc, diff: DiffView | null, diffError: string, preview: ReturnType<typeof previewOf> | null }
export type DocsData = { changed: Doc[], edited: Doc[], groups: DocGroup[], tree: TreeNode, now: number, gitError: string, open: OpenDoc | null }
