// relai-panel: what the pane's tabs draw from, read through PaneIo (./pane-io.ts) and shaped here;
// moved out of register.tsx in Z6 (AUDYT_MODOW) without a change of behavior. No `$` here
// (P-023 pkt 10): every read goes through a closure register.tsx made.

import { FORMS, resolveName } from './core/commands.mjs'
import { parseSheet } from './core/phrases.mjs'
import { aggregate, plural, projectSummary, requestSeries, turnSeries } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { PRICE_FILE, cacheEffect, listFor, modelCosts, newest, parsePriceFile, priceAt, priceLists, staleDays, staleWarning, unpricedModels } from './core/pricing.mjs'
import type { Version } from './core/pricing.mjs'
import { KINDS, diffArgv, diffView, previewOf } from './core/documents.mjs'
import { stageCosts, taskCosts } from './core/attribution.mjs'
import { MERGE_FILE, crewRun, flowMap, parseMerges } from './core/flow.mjs'
import type { Merges } from './core/flow.mjs'
import { daysBetween, listDate, projectVersion } from './core/decisions.mjs'
import type { Fact } from './core/decisions.mjs'
import { crewProgress, pick as pickProgress, promptLink, stageProgress } from './core/progress.mjs'
import type { CostData, DocsData, MapData, NowData, OpenDoc, PaneData, Prices } from './data'
import { CREW_DIR, MEASURE_DIR, localDay, readRel } from './pane-io'
import type { PaneIo } from './pane-io'

// The session's commands and the project's cheat sheet (register.tsx reads both, loadData)
export function paneData(list: readonly { name: string, description?: string }[], text: string | null): PaneData {
  const names: Record<string, string | null> = {}
  const descriptions: Record<string, string> = {}
  for (const f of FORMS) {
    const name = resolveName(f.command, list)
    names[f.command] = name
    descriptions[f.command] = list.find((c) => c.name === name)?.description ?? ''
  }
  return { names, descriptions, hasRelai: Object.values(names).some((n) => n !== null), sheet: parseSheet(text) }
}

// ---------- the price list (E6, Aneks D) ----------
// PRICING from the code, with the versions saved in the project's .claude/relai/panel/cennik.json
// laid over it; each record priced by the version in force when it was measured (R6). Read when a
// tab draws: a save from the card shows at once.

export async function loadPrices(io: PaneIo): Promise<Prices> {
  const file = parsePriceFile(await readRel(io, PRICE_FILE))
  const lists = priceLists(file.versions)
  const top = newest(lists)
  const days = staleDays(await readRel(io, 'docs/USTAWIENIA.md'))
  return { lists, error: file.error, date: top.date, source: top.source, saved: file.versions.length, warning: staleWarning(top.date, localDay(await io.now()), days) }
}

const priceWith = (lists: Version[]) => (r: MeasureRecord) => priceAt(r, lists)

// What the costs tab draws: this session from the collector's own records, the project from
// every session file in the measurements folder (this one's from memory, the rest read back)
export async function costData(io: PaneIo): Promise<CostData> {
  const { current, others: read } = await io.records()
  const prices = await loadPrices(io)
  const price = priceWith(prices.lists)
  const now = new Date(await io.now())
  const isToday = (at: number) => { const d = new Date(at); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate() }
  return {
    report: aggregate(current.records, price),
    records: current.records,
    series: turnSeries(current.records, price),
    calls: requestSeries(current.records, price),
    effect: cacheEffect(current.records, (r) => listFor(r, prices.lists)),
    project: projectSummary([current.records, ...read], price, isToday),
    file: `${MEASURE_DIR}/${current.name}`,
    stages: stageCosts(current.records, price, await readMerges(io)),
    prices,
    unpriced: unpricedModels([current.records, ...read].flat(), prices.lists),
    models: modelCosts([current.records, ...read].flat(), prices.lists),
    writeError: io.writeError(),
  }
}

// What the price-list card asks about: the models measured without a price
export async function pricingState(io: PaneIo) {
  const prices = await loadPrices(io)
  const { current, others } = await io.records()
  const all = [current.records, ...others].flat()
  return { prices, unpriced: unpricedModels(all, prices.lists), measured: [...new Set(all.map((r) => r.model).filter((m): m is string => m !== null))] }
}

// ---------- the map (E4) ----------
// Plans from docs/plany/ and docs/archiwum/plany/, crew runs from .claude/relai/work/CREW/, the
// person's merges from the panel's own file; the cost of each stage over every measured session
// of the project. All of it read when the map draws: the files change while the work goes on.

const PLAN_DIRS = [['docs/plany', 'open'], ['docs/archiwum/plany', 'archive']] as const

export async function readMerges(io: PaneIo): Promise<Merges> {
  return parseMerges(await readRel(io, MERGE_FILE))
}

export async function mapData(io: PaneIo): Promise<MapData> {
  const plans = (await Promise.all(PLAN_DIRS.map(async ([dir, place]) => Promise.all((await io.folders(dir)).map(async (name) => {
    const statusMd = await readRel(io, `${dir}/${name}/STATUS.md`)
    return statusMd === null ? null : { name, place, statusMd }
  }))))).flat().filter((p): p is { name: string, place: 'open' | 'archive', statusMd: string } => p !== null)
  const plan = io.session().plan
  const active = plan.kind === 'ok' ? plan.plan : null
  const merges = await readMerges(io)
  const runs = await Promise.all((await io.folders(CREW_DIR)).map(async (run) => crewRun(run,
    await readRel(io, `${CREW_DIR}/${run}/zadania.json`), await readRel(io, `${CREW_DIR}/${run}/manifest.json`), merges)))
  const { current, others } = await io.records()
  const all = [current.records, ...others].flat()
  const untagged = all.filter((r) => !('stage' in r)).map((r) => r.at)
  const untaggedSince = untagged.length ? localDay(Math.min(...untagged)) : null
  const prices = await loadPrices(io)
  const price = priceWith(prices.lists)
  return { nodes: flowMap(active, plans), runs: runs.reverse(), merges, cost: stageCosts(all, price, merges), tasks: taskCosts(all, price, merges), active, untaggedSince, prices }
}

// ---------- documents (E6, Aneks E) ----------

export type Shelf = Omit<DocsData, 'now' | 'open'>

// The document open under the shelf: only what its mode draws — its diff (one git) or its text
// (one read), never both
export async function docOpen(io: PaneIo, s: Shelf, pick: string, mode: 'diff' | 'preview'): Promise<OpenDoc | null> {
  const [group = '', path = ''] = pick.split('|')
  const all = s.groups.flatMap((g) => g.docs)
  const doc = all.find((d) => d.path === path)
  if (!doc) return null
  if (mode === 'diff') {
    const argv = diffArgv(doc.path, all)
    const diff = argv ? await io.git(argv) : { text: '', error: 'ścieżka spoza listy dokumentów' }
    return { group, doc, diff: diff.error ? null : diffView(diff.text), diffError: diff.error, preview: null }
  }
  // A binary file (PDF) is neither read nor drawn: its window says so
  const text = KINDS[doc.ext]?.show === 'none' ? null : await readRel(io, doc.path)
  return { group, doc, diff: null, diffError: '', preview: text === null ? null : previewOf(doc.path, text) }
}

// ---------- the commands tab ----------

// What /relai-update and /relai-models show before the card: the state from the project's files
export async function commandFacts(io: PaneIo, command: 'relai-update' | 'relai-models'): Promise<Fact[]> {
  if (command === 'relai-update') {
    const v = projectVersion(await readRel(io, 'docs/USTAWIENIA.md'))
    return [{ label: 'Projekt', value: v ? `RelAI ${v} (docs/USTAWIENIA.md)` : 'wersji nie odczytano z docs/USTAWIENIA.md', ...(v ? {} : { tone: 'warn' as const }) }]
  }
  const date = listDate(await readRel(io, '.claude/relai/MODELE-claude-code.md'))
  const age = daysBetween(date, localDay(await io.now()))
  return [{ label: 'Lista modeli', value: date ? `z ${date}${age !== null ? ` · ${age} ${plural(age, 'dzień', 'dni', 'dni')} temu` : ''}` : 'brak listy .claude/relai/MODELE-claude-code.md', ...(date ? {} : { tone: 'warn' as const }) }]
}

// "Teraz" (brief v2 §6.2): the active plan and the progress from the files the progress bar reads —
// the newest live crew run, else the stage prompt's boxes — with this plugin's own copy of the core
// (./core/progress.mjs), no dependency on relai-progress. Read through remember (Z3), never per drawing.
export async function nowData(io: PaneIo): Promise<NowData> {
  const plan = io.session().plan
  let promptText: string | null = null
  let link: string | null = null
  if (plan.kind === 'ok' && plan.stage) {
    const statusMd = await readRel(io, plan.statusPath)
    link = statusMd === null ? null : promptLink(statusMd, plan.stage.id, plan.statusPath)
    promptText = link === null ? null : await readRel(io, link)
  }
  const run = (await io.folders(CREW_DIR)).at(-1)
  const crew = run ? crewProgress(run, await readRel(io, `${CREW_DIR}/${run}/zadania.json`),
    await readRel(io, `${CREW_DIR}/${run}/manifest.json`), await io.now()) : null
  return { plan, progress: pickProgress(crew, stageProgress(plan, promptText, link ?? 'prompt')) }
}
