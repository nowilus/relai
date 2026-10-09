// relai-panel: the RelAI band above the prompt. Active plan and stage from CLAUDE.md and the
// plan's STATUS.md and the session's hypothetical API cost, in one card of the RelAI cards above
// the prompt (BAND, E9). The /relai-panel
// command opens a side pane with the forms of the 14 RelAI commands, the cheat sheet and the
// session phrases, drawn in the RelAI motif (E8): cards with the command icons, Kalam headings,
// three recommended commands on top. A desktop draws the SVG; the terminal gets the same cards
// as text, in the same colors.
//
// The mod draws and calls; the core counts (plan PANEL_CLAUDE, section 5). Everything the band
// reckons with lives in ./core/*.mjs: a byte-identical copy of core/panel/ written by
// core/tools/sync-panel-core.js, because the engine refuses imports from outside the plugin.
//
// Silent outside a RelAI project. Never calls a model, never adds to the system prompt (R7),
// never reaches the network. The prompt-cache timer is relai-cache-keeper's alone (E9, Aneks C):
// the band no longer draws one, so the same countdown never shows twice above the prompt.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'
import { ancestors, planState } from './core/plan-state.mjs'
import type { PlanState } from './core/plan-state.mjs'
import { clip, join, pct, tokens, usd } from './fmt'
import type { PanelView } from '../types'
import { FORMS, buildCommand, formOf, isShown, resolveName, valueOf } from './core/commands.mjs'
import type { Field, Form } from './core/commands.mjs'
import { buildPhrase, parseSheet, searchSheet } from './core/phrases.mjs'
import type { Phrase, Sheet } from './core/phrases.mjs'
import { BAND, BAR, COST_COLORS, FEATURED, FLOW, GROUPS, NAMES, THEME, glyph, iconName } from './core/theme.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { ICONS } from './core/icons.mjs'
import { aggregate, compactRecord, fileName, gapsInWords, isFileOf, mergeRecords, parseRecords, plural, projectSummary, requestSeries, serializeRecords, stepRecord, turnSeries } from './core/measure.mjs'
import type { Group, MeasureRecord, Report, TurnCost } from './core/measure.mjs'
import { PRICING, cacheEffect, priceRecord } from './core/pricing.mjs'
import { blocks, bucketRanges, figureArt, hoverColumns, hoverHeight, hoverSegments, niceStep, segmentText, spark, stackBar } from './core/charts.mjs'
import { crewTag, stageCosts, stageTag, taskCosts } from './core/attribution.mjs'
import type { StageCosts } from './core/attribution.mjs'
import { MERGE_FILE, assignPicked, crewRun, flowMap, mergePicked, parseMerges, serializeMerges, splitGroup, splitStage } from './core/flow.mjs'
import type { Branch, CrewRun, MapStage, MapTask, Merges, PlanNode } from './core/flow.mjs'
import { CLEAN_ARGV, ROLES, RUNTIMES, answer, cleanCard, cleanChoices, commandCard, copyText, crewCard, crewDraft, crewTasksPath, daysBetween, hasConsent, listDate, projectVersion, setTask, shown, togglePick, stageCard, stageToStart, stepsToRun, stripConsent } from './core/decisions.mjs'
import { promptLink } from './core/progress.mjs'
import type { Action, Card, CardResult, CleanChoices, CrewDraft, Fact } from './core/decisions.mjs'

type $T = EngineInterface

const MIN = 60_000
const RELAI_MARKER = /Wersja RelAI|RelAI version/
const LATE_MS = 2 * MIN // a collector that began this much after the session missed part of it

type Session = {
  id: string
  cwd: string
  isRelai: boolean
  plan: PlanState
  costUsd: number | null
  startedAt: number // when the session began, as the engine counts it ($.session.usage)
  loadedAt: number // when this module began collecting in it (a reload starts over)
}

const FRESH: Session = { id: '', cwd: '', isRelai: false, plan: { kind: 'none' }, costUsd: null, startedAt: 0, loadedAt: 0 }

// Replaced, never mutated in place; a reload starts it over and session.start sets it again
let S: Session = FRESH

const set = (patch: Partial<Session>) => { S = { ...S, ...patch } }

async function readText($: $T, path: string): Promise<string | null> {
  try {
    return (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    return null
  }
}

// The project root: the nearest folder, from the session's cwd upwards, whose docs/USTAWIENIA.md
// carries the RelAI marker. The cwd follows every cd the model's shell makes (E9, P-021), so a
// mod that looked in the cwd alone went silent the moment the shell left the project's root.
async function relaiRoot($: $T, cwd: string): Promise<string | null> {
  for (const dir of ancestors(cwd)) {
    const text = await readText($, join(dir, 'docs/USTAWIENIA.md'))
    if (text !== null && RELAI_MARKER.test(text)) return dir
  }
  return null
}

async function readPlan($: $T): Promise<PlanState> {
  const claude = await readText($, join(S.cwd, 'CLAUDE.md'))
  return planState(claude, (rel) => readText($, join(S.cwd, rel)))
}

// Refresh what the band reads from the project and the session after each turn
async function refresh($: $T) {
  const [plan, usage] = await Promise.all([readPlan($), $.session.usage().catch(() => null)])
  set({
    plan,
    costUsd: usage?.cost ? usage.cost.usd : S.costUsd,
    startedAt: usage?.startedAt || S.startedAt,
  })
}

// ---------- the collector ----------
// Every model request of a RelAI session, main loop and subagents (turn.step) and each
// compaction's own request (session.compact, which no step carries: relai-probe-e3, 2026-10-08),
// goes to .claude/relai/pomiary/<date>-<session>.jsonl, a file per session (plan, section 8).
// $.fs has no append: the session's records are held here and the file is written whole, by
// one writer, in order. The session id is asked at each write: /clear changes it within the
// process and raises no session.start (probe). A reload or a resume reads the file back first.

const MEASURE_DIR = '.claude/relai/pomiary'

type Ledger = { session: string, path: string, name: string, records: MeasureRecord[], bad: string[] }

let ledger: Ledger | null = null // replaced, never mutated in place
let writes: Promise<void> = Promise.resolve()
let lastModel: string | null = null // the main loop's, which a compaction runs on
// The crew task the main loop works on: set by a prompt carrying crew.js's line (a crew task run
// as its own session), cleared by the next prompt without it (E4)
let mainTask: string | null = null

// Each subagent's crew task, from the line under its prompt (agent.spawn): kept by the host in
// $.state, so a reload mid-run does not lose which agent works on which task (plan, section 8)
const agentTasks = atom({ plugin: 'relai-panel', key: 'agentTasks' } as const, {} as Record<string, string>)

async function ledgerFor($: $T, session: string): Promise<Ledger> {
  if (ledger && ledger.session === session) return ledger
  const dir = join(S.cwd, MEASURE_DIR)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  const found = entries.find((x) => x.kind === 'file' && isFileOf(x.name, session))
  const name = found ? found.name : fileName(new Date(await $.clock.now()), session)
  const read = found ? parseRecords(await readText($, join(dir, name))) : { records: [], bad: [] }
  ledger = { session, path: join(dir, name), name, records: read.records, bad: read.bad }
  return ledger
}

function collect($: $T, make: (session: string) => MeasureRecord): Promise<void> {
  writes = writes.then(async () => {
    const session = await $.session.id()
    const current = await ledgerFor($, session)
    const records = mergeRecords(current.records, [make(session)])
    if (records.length === current.records.length) return
    ledger = { ...current, records }
    await $.fs.write(current.path, serializeRecords(records, current.bad))
  }).catch(() => undefined)
  return writes
}

type ProjectSum = ReturnType<typeof projectSummary>
type CallCost = ReturnType<typeof requestSeries>[number]
type CostData = { report: Report, records: MeasureRecord[], series: TurnCost[], calls: CallCost[], effect: ReturnType<typeof cacheEffect>, project: ProjectSum, file: string, stages: StageCosts }

const price = (r: MeasureRecord) => priceRecord(r)

// This session's records from the collector's memory, every other session's read back from its file
async function projectRecords($: $T): Promise<{ current: Ledger, others: MeasureRecord[][] }> {
  await writes
  const current = await ledgerFor($, await $.session.id().catch(() => S.id))
  const dir = join(S.cwd, MEASURE_DIR)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  const others = entries.filter((x) => x.kind === 'file' && x.name.endsWith('.jsonl') && x.name !== current.name)
  return { current, others: await Promise.all(others.map(async (x) => parseRecords(await readText($, join(dir, x.name))).records)) }
}

// What the costs tab draws: this session from the collector's own records, the project from
// every session file in the measurements folder (this one's from memory, the rest read back)
async function costData($: $T): Promise<CostData> {
  const { current, others: read } = await projectRecords($)
  const now = new Date(await $.clock.now())
  const isToday = (at: number) => { const d = new Date(at); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate() }
  return {
    report: aggregate(current.records, price),
    records: current.records,
    series: turnSeries(current.records, price),
    calls: requestSeries(current.records, price),
    effect: cacheEffect(current.records),
    project: projectSummary([current.records, ...read], price, isToday),
    file: `${MEASURE_DIR}/${current.name}`,
    stages: stageCosts(current.records, price, await readMerges($)),
  }
}

// ---------- the map (E4) ----------
// Plans from docs/plany/ and docs/archiwum/plany/, crew runs from .claude/relai/work/CREW/, the
// person's merges from the panel's own file; the cost of each stage over every measured session
// of the project. All of it read when the map draws: the files change while the work goes on.

const PLAN_DIRS = [['docs/plany', 'open'], ['docs/archiwum/plany', 'archive']] as const
const CREW_DIR = '.claude/relai/work/CREW'

// untaggedSince: the local day ("YYYY-MM-DD") of the first measurement without a stage tag, if any
type MapData = { nodes: PlanNode[], runs: CrewRun[], merges: Merges, cost: StageCosts, tasks: ReturnType<typeof taskCosts>, active: string | null, untaggedSince: string | null }

const localDay = (at: number) => { const d = new Date(at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

async function folders($: $T, rel: string): Promise<string[]> {
  const dir = join(S.cwd, rel)
  const entries = (await $.fs.exists(dir).catch(() => false)) ? await $.fs.list(dir).catch(() => []) : []
  return entries.filter((x) => x.kind === 'dir').map((x) => x.name).sort()
}

async function readMerges($: $T): Promise<Merges> {
  return parseMerges(await readText($, join(S.cwd, MERGE_FILE)))
}

// The panel's own file; the files of a crew run are never written (decision of 2026-10-09)
async function saveMerges($: $T, m: Merges) {
  await $.fs.write(join(S.cwd, MERGE_FILE), serializeMerges(m))
  $.ui.invalidate('ui.render')
}

async function mapData($: $T): Promise<MapData> {
  const plans = (await Promise.all(PLAN_DIRS.map(async ([dir, place]) => Promise.all((await folders($, dir)).map(async (name) => {
    const statusMd = await readText($, join(S.cwd, `${dir}/${name}/STATUS.md`))
    return statusMd === null ? null : { name, place, statusMd }
  }))))).flat().filter((p): p is { name: string, place: 'open' | 'archive', statusMd: string } => p !== null)
  const active = S.plan.kind === 'ok' ? S.plan.plan : null
  const merges = await readMerges($)
  const runs = await Promise.all((await folders($, CREW_DIR)).map(async (run) => crewRun(run,
    await readText($, join(S.cwd, `${CREW_DIR}/${run}/zadania.json`)), await readText($, join(S.cwd, `${CREW_DIR}/${run}/manifest.json`)), merges)))
  const { current, others } = await projectRecords($)
  const all = [current.records, ...others].flat()
  const untagged = all.filter((r) => !('stage' in r)).map((r) => r.at)
  const untaggedSince = untagged.length ? localDay(Math.min(...untagged)) : null
  return { nodes: flowMap(active, plans), runs: runs.reverse(), merges, cost: stageCosts(all, price, merges), tasks: taskCosts(all, price, merges), active, untaggedSince }
}

// ---------- the band ----------
// Keys sit on Box: the engine keeps a Box's key and drops a Text's (seen in plugin test, 2.1.293)

type Look = { label: string, color: string, bg: string }
type Resolved = Parameters<$T['ui']['resolve']>[0]

// The shared grid of the RelAI bars above the prompt (BAND, BAR; docs/zasoby/PANEL_RELAI/
// STYL_PASKOW_CLAUDE.md): the label column, the content, the figure on the right edge; a soft
// background of the bar's own, no colored frame. Box has no corner radius (2.1.293): on the
// desktop a border in the background's own color only rounds the corners; the terminal draws
// none, each of its rows counts. Below BAR.narrow columns the label and the figure go on top.
function barCard($: $T, e: Resolved, columns: number, key: string, look: Look, middle: RenderChildren, figure: readonly [string, string] | null) {
  const { Box, Text } = $.ui.resolve(e)
  const isGui = e.surface !== 'terminal'
  const frame = isGui ? { borderStyle: 'round' as const, borderColor: look.bg } : {}
  const label = <Text bold color={look.color}>{look.label}</Text>
  if (columns < BAR.narrow) {
    return (
      <Box key={key} flexDirection="column" backgroundColor={look.bg} paddingX={1} {...frame}>
        <Box key="head" flexDirection="row" flexWrap="wrap" justifyContent="space-between" columnGap={2}>
          <Box key="label">{label}</Box>
          {figure ? <Box key="figure"><Text bold color={BAR.text}>{figure[0]}</Text><Text color={BAR.muted}>{' ' + figure[1]}</Text></Box> : null}
        </Box>
        <Box key="middle" flexDirection="column">{middle}</Box>
      </Box>
    )
  }
  return (
    <Box key={key} flexDirection="row" alignItems="center" columnGap={2} backgroundColor={look.bg} paddingX={1} {...frame}>
      <Box key="label" width={BAR.labelColumn} flexShrink={0}>{label}</Box>
      <Box key="middle" flexDirection="column" flexGrow={1} flexShrink={1}>{middle}</Box>
      <Box key="figure" minWidth={BAR.figureColumn} flexShrink={0} flexDirection="row" justifyContent="flex-end">
        {figure ? [<Text key="value" bold color={BAR.text}>{figure[0]}</Text>, <Text key="unit" color={BAR.muted}>{' ' + figure[1]}</Text>] : []}
      </Box>
    </Box>
  )
}

// The plan bar: the plan and its stage with the stage's status, the stage's name and the session's
// cost; on the right how many stages are closed. No plan, or one that cannot be read, in words.
function band($: $T, e: Resolved, columns: number) {
  const { Box, Text } = $.ui.resolve(e)
  const p = S.plan
  const cost = <Box key="cost"><Text color={BAR.muted} wrap="truncate">{`sesja ≈ ${usd(S.costUsd)} wg cennika API`}</Text></Box>
  if (p.kind !== 'ok') {
    const words = p.kind === 'none' ? 'brak aktywnego planu' : `plan nieznany: ${p.reason}`
    return barCard($, e, columns, 'relai-band-frame', BAND.panel, [<Box key="plan"><Text bold color={BAR.text} wrap="truncate">{words}</Text></Box>, cost], null)
  }
  const title = p.stage ? `${p.plan} · ${p.stage.id}` : p.plan
  const status = p.stage ? p.stage.status : (p.planStatus ?? 'status nieznany')
  const middle = [
    <Box key="plan" flexDirection="row" flexWrap="wrap" columnGap={2}>
      <Text bold color={BAR.text}>{title}</Text>
      <Text bold color={BAND.panel.color}>{status}</Text>
    </Box>,
    <Box key="detail" flexDirection="row" flexWrap="wrap" columnGap={3}>
      {p.stage ? [<Text key="stage" color={BAR.muted} wrap="truncate">{clip(p.stage.name, 60)}</Text>] : []}
      {cost}
    </Box>,
  ]
  return barCard($, e, columns, 'relai-band-frame', BAND.panel, middle, [`${p.closed}/${p.stages}`, 'etapów'])
}

// ---------- the pane ----------
// The forms and the sheet are reckoned in ./core (commands.mjs, phrases.mjs); this file draws and
// calls. Nothing reaches the chat but on a press of "Wyślij" or of a phrase: a command through
// $.command.run, a phrase through $.prompt.submit as the person's own words (plan, section 5).
// Without the relai plugin in the session the pane says so and sends nothing (plan, section 8).
// One file with the hooks: the engine follows $ only into functions declared in this same file.

const PANE_ID = 'relai-panel'
const PANE_TITLE = 'RelAI'

const view = atom({ plugin: 'relai-panel', key: 'view' } as const, 'commands' as PanelView)
const selected = atom({ plugin: 'relai-panel', key: 'selected' } as const, '')
const values = atom({ plugin: 'relai-panel', key: 'values' } as const, {} as Record<string, string>)
const query = atom({ plugin: 'relai-panel', key: 'query' } as const, '')
const fills = atom({ plugin: 'relai-panel', key: 'fills' } as const, {} as Record<string, string>)
const sent = atom({ plugin: 'relai-panel', key: 'sent' } as const, '')
const pressed = atom({ plugin: 'relai-panel', key: 'pressed' } as const, '')
const unfolded = atom({ plugin: 'relai-panel', key: 'unfolded' } as const, {} as Record<string, boolean>)
const picks = atom({ plugin: 'relai-panel', key: 'picks' } as const, [] as string[])
// Decisions (E5): the card waiting for "tak", the chat a stage starts in, the clean list, crew drafts
const confirm = atom({ plugin: 'relai-panel', key: 'confirm' } as const, null as Card | null)
const freshChat = atom({ plugin: 'relai-panel', key: 'freshChat' } as const, true)
const cleanList = atom({ plugin: 'relai-panel', key: 'cleanList' } as const, null as CleanChoices | null)
const drafts = atom({ plugin: 'relai-panel', key: 'drafts' } as const, {} as Record<string, CrewDraft>)

// How long a press answers: the card of the pressed control flashes, a send says "Wysłano"
const FLASH_MS = 900

function flash($: $T, key: string) {
  void update($, pressed, () => key)
  $.clock.after(FLASH_MS, () => { void update($, pressed, (k) => (k === key ? '' : k)) })
}

// The Select of a choice cannot hold an empty value: '' travels as this one
const NONE = '_'
const NO_RELAI = 'Plugin relai nie jest zainstalowany w tej sesji — panel pokazuje formularze, ale niczego nie wyśle.'
const NOT_RELAI = 'Ten folder nie jest projektem RelAI, więc panel nie ma czego pokazać — napisz „zacznijmy projekt”, żeby go zainicjować.'

type PaneData = {
  names: Record<string, string | null> // command -> the name the session runs it by
  descriptions: Record<string, string>
  hasRelai: boolean
  sheet: Sheet
}

// Read once per /relai-panel and after a reload: commands and KOMENDY.md change rarely mid-session
let data: PaneData | null = null

async function loadData($: $T, cwd: string): Promise<PaneData> {
  const list = await $.command.list().catch(() => [])
  const names: Record<string, string | null> = {}
  const descriptions: Record<string, string> = {}
  for (const f of FORMS) {
    const name = resolveName(f.command, list)
    names[f.command] = name
    descriptions[f.command] = list.find((c) => c.name === name)?.description ?? ''
  }
  let text: string | null = null
  try {
    const path = join(cwd, 'docs/KOMENDY.md')
    text = (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    text = null
  }
  data = { names, descriptions, hasRelai: Object.values(names).some((n) => n !== null), sheet: parseSheet(text) }
  return data
}

const fieldKey = (command: string, key: string) => `${command}:${key}`

function formValues(all: Record<string, string>, form: Form): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of form.fields) {
    const v = all[fieldKey(form.command, f.key)]
    if (v !== undefined) out[f.key] = v
  }
  return out
}

// What the recommended stage card says under its purpose: the plan and stage the band shows
function stageHint(plan: PlanState): string {
  if (plan.kind !== 'ok') return ''
  return plan.stage ? `${plan.plan} · ${plan.stage.id} ${plan.stage.name}` : `${plan.plan} · wszystkie etapy zamknięte`
}

async function sendCommand($: $T, name: string, args: string, text: string) {
  try {
    await $.command.run({ command: name, args })
    await update($, sent, () => `Wysłano do czatu: ${text}`)
  } catch (err) {
    await update($, sent, () => `Nie wysłano ${text}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

async function sendPhrase($: $T, text: string) {
  try {
    await $.prompt.submit({ text, asUser: true })
    await update($, sent, () => `Wysłano do czatu: ${text}`)
  } catch (err) {
    await update($, sent, () => `Nie wysłano „${text}”: ${err instanceof Error ? err.message : String(err)}`)
  }
}

// ---------- decisions (E5) ----------
// R4: nothing that changes state leaves the pane before "tak" on a card. The core builds the card
// and answers what may run (stepsToRun: nothing unless confirmed); the mod only draws and runs it.

async function cardId($: $T): Promise<string> {
  return `karta-${(await $.clock.now()).toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

async function offer($: $T, r: CardResult) {
  if (r.kind === 'blocked') {
    await update($, sent, () => `Nie przygotowano karty: ${r.reason}`)
    return
  }
  await update($, sent, () => '')
  await update($, confirm, () => r.card)
}

// One step of a confirmed card; a command goes by the name the session knows it under
async function runStep($: $T, a: Action, names: Record<string, string | null>) {
  if (a.kind === 'clear') return $.command.run({ command: 'clear' })
  if (a.kind === 'command') return $.command.run({ command: names[a.command] ?? a.command, args: a.args })
  if (a.kind === 'write') return $.fs.write(join(S.cwd, a.path), a.text)
  return $.prompt.submit({ text: a.text, asUser: true })
}

// The answer to the card: "nie" sends nothing; "tak" moves to the second step or runs the steps
// in order and stops at the first that fails, saying which
async function decide($: $T, card: Card, said: 'tak' | 'nie', names: Record<string, string | null>) {
  const next = answer(card, said)
  if (next.state === 'cancelled') {
    await update($, confirm, () => null)
    await update($, sent, () => `Anulowano: ${card.title} — nic nie wysłano`)
    return
  }
  if (next.state !== 'confirmed') {
    await update($, confirm, () => next)
    return
  }
  await update($, confirm, () => null)
  for (const a of stepsToRun(next)) {
    try {
      await runStep($, a, names)
    } catch (err) {
      await update($, sent, () => `Nie wysłano (${card.title}, krok ${a.kind}): ${err instanceof Error ? err.message : String(err)}`)
      return
    }
  }
  await update($, sent, () => `Wysłano do czatu: ${card.title}`)
}

// The stage card from the plan the form names, else the active one
async function prepareStage($: $T, topic: string, stage: string, isFresh: boolean) {
  const statusPath = topic ? `docs/plany/${topic}/STATUS.md` : S.plan.kind === 'ok' ? S.plan.statusPath : null
  if (statusPath === null) return offer($, { kind: 'blocked', reason: 'brak aktywnego planu — wpisz TEMAT planu' })
  const statusMd = await readText($, join(S.cwd, statusPath))
  if (statusMd === null) return offer($, { kind: 'blocked', reason: `nie można odczytać ${statusPath}` })
  const id = stageToStart(statusMd, stage || null)
  const link = id ? promptLink(statusMd, id, statusPath) : null
  const promptText = link ? await readText($, join(S.cwd, link)) : null
  const sessionModel = await $.session.model().catch(() => null)
  return offer($, stageCard({ id: await cardId($), statusMd, statusPath, promptText, stage: stage || null, sessionModel, isFresh }))
}

// The clean report through the one fixed argv (CLEAN_ARGV); nothing from a form enters it
async function loadClean($: $T) {
  try {
    const r = await $.process.run([...CLEAN_ARGV], { cwd: S.cwd, timeoutMs: 120_000 })
    const list = cleanChoices(r.exitCode === 0 ? r.stdout : null)
    await update($, cleanList, () => list)
    await update($, sent, () => (list.error ? `Nie wczytano listy: ${list.error}${r.stderr ? ' — ' + r.stderr.slice(0, 120) : ''}` : ''))
  } catch (err) {
    await update($, sent, () => `Nie wczytano listy: ${err instanceof Error ? err.message : String(err)}`)
  }
}

// What /relai-update and /relai-models show before the card: the state from the project's files
async function commandFacts($: $T, command: 'relai-update' | 'relai-models'): Promise<Fact[]> {
  if (command === 'relai-update') {
    const v = projectVersion(await readText($, join(S.cwd, 'docs/USTAWIENIA.md')))
    return [{ label: 'Projekt', value: v ? `RelAI ${v} (docs/USTAWIENIA.md)` : 'wersji nie odczytano z docs/USTAWIENIA.md', ...(v ? {} : { tone: 'warn' as const }) }]
  }
  const date = listDate(await readText($, join(S.cwd, '.claude/relai/MODELE-claude-code.md')))
  const age = daysBetween(date, localDay(await $.clock.now()))
  return [{ label: 'Lista modeli', value: date ? `z ${date}${age !== null ? ` · ${age} ${plural(age, 'dzień', 'dni', 'dni')} temu` : ''}` : 'brak listy .claude/relai/MODELE-claude-code.md', ...(date ? {} : { tone: 'warn' as const }) }]
}

// A crew run's draft: editable only while the run has no manifest.json (E5, 1c)
async function editCrew($: $T, run: string) {
  const dir = join(S.cwd, `${CREW_DIR}/${run}`)
  const draft = crewDraft(run, await readText($, join(S.cwd, crewTasksPath(run))), await readText($, join(dir, 'manifest.json')))
  if (!draft.isEditable) return update($, sent, () => `Skład przebiegu ${run} bez edycji: ${draft.reason}`)
  await update($, sent, () => '')
  return update($, drafts, (m) => ({ ...m, [run]: draft }))
}

// ---------- hooks ----------

export const register: Register = (on) => {
  // D-35 (E5): a consent token reaches /relai-stage only in the pane's own send, which this hook
  // never sees (2.1.293, P-022). Typed text and other plugins' sends lose it here.
  on('command.run', async ($, e, next) => {
    if (e.command.endsWith('relai-stage') && hasConsent(e.args)) return next({ ...e, args: stripConsent(e.args) })
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    const here = await $.session.cwd()
    const root = await relaiRoot($, here)
    const isRelai = root !== null
    const cwd = root ?? here
    S = { ...FRESH, id: await $.session.id(), cwd, isRelai, loadedAt: await $.clock.now() }
    // Registered everywhere, so outside RelAI the command can say so in one sentence (plan, section 8)
    await $.command.register({ name: 'relai-panel', description: 'Panel RelAI: formularze komend, ściąga i frazy sesji' }).catch(() => undefined)
    if (!isRelai) return next(e)
    await refresh($)
    return next(e)
  })

  // The pane opens only from the command, the person's own act: it seats at any width and never
  // pops up by itself in a narrow terminal (plan, section 8)
  on('command.run', { command: 'relai-panel' }, async ($) => {
    // Typed right after a reload, before session.start has found the root: look once more first
    if (!S.isRelai) {
      const root = await relaiRoot($, await $.session.cwd())
      if (root !== null) set({ isRelai: true, cwd: root })
    }
    if (!S.isRelai) return { text: NOT_RELAI }
    await loadData($, S.cwd)
    const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
    return { text: opened.isPlaced ? 'Panel RelAI otwarty.' : `Panel RelAI czeka na miejsce: ${opened.reason}` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const { isRelai, cwd } = S
    if (e.surface === 'mobile') {
      const { Text } = $.ui.resolve(e)
      return <Text>Formularze RelAI wymagają terminala albo aplikacji desktopowej.</Text>
    }
    const el = $.ui.resolve(e)
    const { Box, Text, Button, Input, Select } = el
    // A desktop draws SVG: icons and Kalam headings. The terminal gets text in the same colors.
    // Decided by the surface, not by `'Svg' in el`: the terminal's table carries the key at run
    // time and drops what it draws (2.1.293, measured by theme.test.ts in E8).
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null
    const isGui = Svg !== null
    if (!isRelai) return <Box key="not-relai"><Text>{NOT_RELAI}</Text></Box>
    const d = data ?? (await loadData($, cwd))
    const width = Math.max(30, e.props.bodyColumns)
    const [tab, picked, all, q, filled, last, flashed, folds, chosen, pending, isFresh, clean, crewDrafts] = await Promise.all([
      read($, view), read($, selected), read($, values), read($, query), read($, fills), read($, sent), read($, pressed), read($, unfolded), read($, picks),
      read($, confirm), read($, freshChat), read($, cleanList), read($, drafts),
    ])
    const pick = (c: string) => { void update($, selected, (s) => (s === c ? '' : c)) }

    // ---------- the pane's parts: one look for every tab and every later section ----------
    const heading = (key: string, color: string = THEME.mark) => {
      const art = HEADING_ART[key]
      if (Svg && art) return <Svg key={`h-${key}`} source={art.svg} alt={art.text} width={art.width} height={art.height} />
      return <Text bold color={color}>{art?.text ?? key}</Text>
    }
    const icon = (c: string, px: number) => {
      const source = ICONS[iconName(c)]
      if (Svg && source) return <Svg key={`icon-${c}`} source={source} alt={NAMES[c]?.[0] ?? c} width={px} height={px} />
      return <Text color={THEME.accent}>●</Text>
    }
    const mark = (name: string, color: string, px: number, alt: string) => {
      const source = glyph(name, color, px)
      if (Svg && source) return <Svg key={`g-${name}-${px}`} source={source} alt={alt} width={px} height={px} />
      return <Text color={color}>●</Text>
    }
    // Every control is the surface's own button (calibration 2026-10-08): a `plain` button in a
    // painted box inverts under the pointer and that cannot be turned off, so the brand stays in
    // the cards and the press answers by itself: the control's card flashes and, where a press
    // sends something, the label says so for FLASH_MS.
    const isFlash = (key: string) => flashed === key
    const btn = (key: string, label: string, kind: 'primary' | 'secondary', onPress: () => void, doneLabel?: string) => (
      <Button key={key} variant={kind} onPress={() => { onPress(); flash($, key) }}>
        {doneLabel && isFlash(key) ? doneLabel : label}
      </Button>
    )
    const flashBorder = (key: string, rest: string) => (isFlash(key) ? THEME.pressed : rest)
    // A section: Kalam heading, one line saying what it is for, then its cards
    const section = (key: string, head: string, about: string, items: RenderChildren[]) => (
      <Box key={key} flexDirection="column" gap={isGui ? 1 : 0}>
        {heading(head)}
        {about ? [<Text key={`${key}-about`} color={THEME.body}>{about}</Text>] : []}
        {items}
      </Box>
    )
    // A card: rounded and filled on a desktop; on the terminal only the selected one is framed
    const frame = (isOn: boolean) => (isGui || isOn ? { borderStyle: 'round' } : {})
    // The exact text that goes to the chat, in a well of its own
    const well = (key: string, text: string, isOk: boolean) => (
      <Box key={key} paddingX={1} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
        <Text color={isOk ? THEME.title : THEME.accentText}>{isOk ? [<Text key={`${key}-l`} color={THEME.mark} bold>{'Do czatu pójdzie: '}</Text>, text] : text}</Text>
      </Box>
    )
    const sentLine = last
      ? <Box key="sent"><Text color={last.startsWith('Wysłano') ? THEME.ok : THEME.accentText}>{(last.startsWith('Wysłano') ? '✓ ' : '✗ ') + last}</Text></Box>
      : null

    // ---------- the confirmation card (E5, R4) ----------
    // Above every tab while it waits: what will happen, in rows of facts, the question, "Tak" and
    // "Nie". A warning row reads in the accent color; nothing goes out before "Tak".
    const factRow = (key: string, f: Fact) => (
      // Wraps: a long value (a working folder's path) drops under its label in a narrow pane
      <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={1}>
        <Box key={`${key}-l`} flexShrink={0} width={16}><Text bold color={THEME.mark}>{f.label}</Text></Box>
        <Box key={`${key}-v`} flexGrow={1} flexShrink={1}><Text color={f.tone === 'warn' ? THEME.accentText : f.tone === 'ok' ? THEME.ok : THEME.title}>{(f.tone === 'warn' ? '⚠ ' : '') + f.value}</Text></Box>
      </Box>
    )
    const confirmCard = (c: Card) => {
      const step = shown(c)
      return section('confirm', 'confirm', c.state === 'second' ? 'Drugi krok — zapis dopiero po tym potwierdzeniu.' : 'Nic nie pójdzie do czatu bez „Tak”.', [
        <Box key="confirm-card" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          borderStyle="round" borderColor={flashBorder('confirm-yes', THEME.accent)} backgroundColor={THEME.cardOn}>
          <Text bold color={THEME.accentText} wrap="truncate">{c.title}</Text>
          <Box key="confirm-facts" flexDirection="column">{step.facts.map((f, i) => factRow(`confirm-f-${i}`, f))}</Box>
          <Text bold color={THEME.title}>{step.question}</Text>
          <Box key="confirm-act" flexDirection="row" flexWrap="wrap" gap={1}>
            {btn('confirm-yes', 'Tak', 'primary', () => { void decide($, c, 'tak', d.names) })}
            {btn('confirm-no', 'Nie', 'secondary', () => { void decide($, c, 'nie', d.names) })}
          </Box>
        </Box>,
      ])
    }

    const TABS = [['commands', 'Komendy'], ['map', 'Mapa'], ['sheet', 'Ściąga'], ['phrases', 'Frazy'], ['costs', 'Koszty']] as const
    const tabs = (
      <Box key="tabs" flexDirection="row" flexWrap="wrap" gap={1}>
        {TABS.map(([v, label]) => btn(`tab-${v}`, label, v === tab ? 'primary' : 'secondary', () => { void update($, view, () => v) }))}
      </Box>
    )

    // ---------- commands ----------
    const fieldEl = (form: Form, f: Field, current: Record<string, string>) => {
      const k = fieldKey(form.command, f.key)
      if (f.kind === 'choice') {
        return (
          <Select key={`f-${f.key}`} label={f.label + ': '} value={valueOf(f, current) || NONE}
            options={f.options.map((o) => ({ value: o.value || NONE, label: o.label }))}
            onSelect={(v) => { void update($, values, (m) => ({ ...m, [k]: v === NONE ? '' : v })) }} />
        )
      }
      return (
        <Input key={`f-${f.key}`} label={f.label + ': '} value={current[f.key] ?? ''}
          placeholder={f.kind === 'path' ? 'ścieżka' : f.patternHint ?? ''}
          onInput={(v) => { void update($, values, (m) => ({ ...m, [k]: v })) }}
          onSubmit={(v) => { void update($, values, (m) => ({ ...m, [k]: v })) }} />
      )
    }

    // The open form of a card: options, the exact text, then "Wyślij" only when it can go out
    const drawer = (form: Form) => {
      const current = formValues(all, form)
      const name = d.names[form.command] ?? null
      const built = buildCommand(form, current, name ?? form.command)
      const fields = form.fields.filter((f) => isShown(f, current)).map((f) => fieldEl(form, f, current))
      const canSend = built.isOk && name !== null
      const c = form.command
      // E5: these commands start work or change the project, so the drawer prepares a card
      // instead of sending; /relai-clean keeps its report send and gains the list of groups
      const isStage = c === 'relai-stage'
      const isCarded = isStage || c === 'relai-update' || c === 'relai-models'
      const copyWhat = isStage && !current.topic && !current.stage && S.plan.kind === 'ok' && S.plan.stage ? copyText(S.plan.statusPath, S.plan.stage.id) : built.text
      const actions = isStage
        ? [btn('prepare', 'Przygotuj start', 'primary', () => { void prepareStage($, current.topic ?? '', current.stage ?? '', isFresh) }),
            btn('copy', 'Kopiuj prompt', 'secondary', () => { void $.ui.copy({ text: copyWhat, surface: e.surface }).then(() => update($, sent, () => `Wysłano do schowka: ${copyWhat}`)) }, '✓ Skopiowano')]
        : isCarded
          ? [btn('prepare', 'Przygotuj', 'primary', () => { void commandFacts($, c as 'relai-update' | 'relai-models').then(async (facts) => offer($, commandCard(await cardId($), c as 'relai-update' | 'relai-models', facts))) })]
          : [btn('send', 'Wyślij do czatu', 'primary', () => { void sendCommand($, name ?? c, built.args, built.text) }, '✓ Wysłano')]
      return (
        <Box key="form" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          borderStyle="round" borderColor={flashBorder(isCarded ? 'prepare' : 'send', THEME.accent)} backgroundColor={THEME.cardOn}>
          {heading(`name-${c}`, THEME.accentText)}
          {fields.length ? fields : [<Text key="no-options" color={THEME.body}>{isCarded ? 'Ta komenda nie ma opcji — przygotuj kartę i potwierdź.' : 'Ta komenda nie ma opcji — wystarczy ją wysłać.'}</Text>]}
          {isStage ? [<Select key="f-chat" label="Czat: " value={isFresh ? 'fresh' : 'current'}
            options={[{ value: 'fresh', label: 'świeży — /clear po „Tak”, potem etap' }, { value: 'current', label: 'bieżący — etap w tej rozmowie' }]}
            onSelect={(v) => { void update($, freshChat, () => v === 'fresh') }} />] : []}
          <Box key="preview" flexDirection="column">{well('preview-well', isCarded ? `${built.text} — po „Tak” na karcie` : built.text, true)}</Box>
          {built.errors.length ? [<Box key="errors"><Text color={THEME.accentText}>{'⚠ ' + built.errors.join(' · ')}</Text></Box>] : []}
          {canSend
            ? <Box key="actions" flexDirection="row" flexWrap="wrap" gap={1}>
                {actions}
                {btn('close', 'Zamknij', 'secondary', () => pick(c))}
              </Box>
            : <Box key="no-send"><Text color={THEME.body}>{name === null ? 'Komenda niedostępna w tej sesji — nic nie zostanie wysłane.' : 'Popraw opcje, żeby wysłać.'}</Text></Box>}
          {c === 'relai-clean' && name !== null ? [cleanBlock()] : []}
          {sentLine ? [sentLine] : []}
        </Box>
      )
    }

    // /relai-clean's groups: loaded through the one fixed process, none picked at the start, the
    // protected ones apart with their reason; "Przygotuj sprzątanie" makes the card
    const cleanBlock = () => {
      if (clean === null) {
        return (
          <Box key="clean" flexDirection="column" gap={isGui ? 1 : 0}>
            <Text color={THEME.body}>Lista grup do wyboru: raport narzędzia sprzątania, bez kasowania.</Text>
            <Box key="clean-load" flexDirection="row">{btn('clean-load', 'Wczytaj listę', 'secondary', () => { void loadClean($) })}</Box>
          </Box>
        )
      }
      const nPicked = clean.groups.filter((g) => g.isPicked).length
      return (
        <Box key="clean" flexDirection="column" gap={isGui ? 1 : 0}>
          <Text bold color={THEME.title}>{clean.groups.length ? `Grupy do wyboru · zaznaczone ${nPicked} z ${clean.groups.length}` : 'Raport pusty — nie ma czego sprzątać.'}</Text>
          {clean.groups.map((g) => (
            <Box key={`clean-${g.id}`} flexDirection="row" alignItems="center" columnGap={1} paddingX={1}
              {...frame(g.isPicked)} borderColor={flashBorder(`clean-pick-${g.id}`, g.isPicked ? THEME.accent : THEME.line)} backgroundColor={g.isPicked ? THEME.cardOn : THEME.card}>
              <Text bold color={g.isPicked ? THEME.accentText : THEME.body}>{g.isPicked ? '☒' : '☐'}</Text>
              <Box key={`clean-t-${g.id}`} flexDirection="column" flexGrow={1} flexShrink={1}>
                <Text color={THEME.title} wrap="truncate">{g.name}</Text>
                <Text color={THEME.body} wrap="truncate">{`${g.count} poz. · ${(g.bytes / 1048576).toFixed(2).replace('.', ',')} MB`}</Text>
              </Box>
              {btn(`clean-pick-${g.id}`, g.isPicked ? 'Odznacz' : 'Zaznacz', g.isPicked ? 'primary' : 'secondary', () => { void update($, cleanList, (l) => (l ? togglePick(l, g.id) : l)) })}
            </Box>
          ))}
          {clean.kept.length ? [<Text key="clean-kept-h" bold color={THEME.mark}>Chronione — poza wyborem</Text>,
            ...clean.kept.map((k, i) => <Text key={`clean-kept-${i}`} color={THEME.body} wrap="truncate">{`🔒 ${k.path} · ${k.reason}`}</Text>)] : []}
          <Box key="clean-act" flexDirection="row" flexWrap="wrap" gap={1}>
            {nPicked ? btn('clean-prepare', 'Przygotuj sprzątanie', 'primary', () => { void cardId($).then((id) => offer($, cleanCard(id, clean))) }) : []}
            {btn('clean-reload', 'Wczytaj ponownie', 'secondary', () => { void loadClean($) })}
          </Box>
        </Box>
      )
    }

    const card = (c: string, isFeatured: boolean) => {
      const name = d.names[c] ?? null
      const isOn = c === picked
      const [title, purpose] = NAMES[c] ?? [c, '']
      const hint = isFeatured && c === 'relai-stage' ? stageHint(S.plan) : ''
      const border = isOn ? THEME.accent : name === null ? THEME.lineOff : isFeatured ? THEME.mark : THEME.line
      const form = isOn ? formOf(c) : undefined
      return (
        <Box key={`card-${c}`} flexDirection="column">
          <Box key={`row-${c}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
            paddingX={isFeatured && isGui ? 2 : 1} paddingY={isGui ? 1 : 0} {...frame(isOn)} borderColor={flashBorder(`cmd-${c}`, border)}
            backgroundColor={isOn ? THEME.cardOn : isFeatured ? THEME.cardFeatured : THEME.card} hover={{ borderColor: THEME.accent }}>
            {icon(c, isFeatured ? 48 : 36)}
            <Box key={`text-${c}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={isFeatured ? THEME.mark : THEME.title} wrap="truncate">{title}</Text>
              <Text color={THEME.body} wrap="truncate">{name === null ? 'niedostępna w tej sesji' : purpose}</Text>
              {hint ? [<Text key={`hint-${c}`} color={THEME.accentText} wrap="truncate">{hint}</Text>] : []}
            </Box>
            {btn(`cmd-${c}`, '/' + c, isOn || isFeatured ? 'primary' : 'secondary', () => pick(c))}
          </Box>
          {form ? [drawer(form)] : []}
        </Box>
      )
    }

    const commandsView = () => [
      section('featured', 'featured', '', FEATURED.map((c) => card(c, true))),
      ...GROUPS.map((g) => section(`group-${g.id}`, `group-${g.id}`, '', g.commands.map((c) => card(c, false)))),
    ]

    // ---------- cheat sheet ----------
    const sheetView = () => {
      if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
      const hit = searchSheet(d.sheet, q)
      const commands = hit.commands.map((r) => (
        <Box key={`sheet-${r.command}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
          paddingX={1} paddingY={isGui ? 1 : 0} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card} hover={{ borderColor: THEME.accent }}>
          {icon(r.command, 32)}
          <Box key={`sheet-text-${r.command}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.title}>{r.forms.join(' · ')}</Text>
            <Text color={THEME.body}>{clip(r.what, width * 2)}</Text>
          </Box>
          {btn(`open-${r.command}`, 'Formularz', 'secondary',
            () => { void update($, selected, () => r.command).then(() => update($, view, () => 'commands' as const)) })}
        </Box>
      ))
      const phrases = hit.phrases.map((p, i) => (
        <Box key={`sheet-ph-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}
          paddingX={1} paddingY={isGui ? 1 : 0} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
          {mark('phrases', THEME.mark, 28, 'fraza')}
          <Box key={`sheet-ph-text-${i}`} flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.mark}>{p.phrases.map((x) => `„${x}”`).join(' / ')}</Text>
            <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
          </Box>
        </Box>
      ))
      const none = hit.commands.length + hit.phrases.length === 0 ? [<Box key="sheet-none"><Text color={THEME.body}>Nic nie pasuje.</Text></Box>] : []
      return [
        section('sheet', 'sheet', 'Komendy i frazy z docs/KOMENDY.md — wpisz słowo, żeby zawęzić.', [
          <Input key="search" label="Szukaj: " value={q} placeholder="np. backup"
            onInput={(v) => { void update($, query, () => v) }} onSubmit={(v) => { void update($, query, () => v) }} />,
          ...commands, ...phrases, ...none,
        ]),
      ]
    }

    // ---------- phrases ----------
    // One click: the phrase is the button; its effect under it, the bubble on the left
    const readyCard = (p: Phrase, i: number) => {
      const canSend = buildPhrase(p, '').isOk && d.hasRelai
      return (
        <Box key={`ph-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)} backgroundColor={THEME.card} hover={{ borderColor: THEME.accent }}>
          {mark('phrases', THEME.mark, 32, 'fraza')}
          <Box key={`ph-body-${i}`} flexDirection="column" gap={isGui ? 1 : 0} flexGrow={1} flexShrink={1} alignItems="flex-start">
            {canSend
              ? btn(`phrase-${i}`, p.phrase, 'primary', () => { void sendPhrase($, p.phrase) }, '✓ ' + p.phrase)
              : <Text key={`phrase-text-${i}`} bold color={THEME.title}>{`„${p.phrase}”`}</Text>}
            <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
          </Box>
        </Box>
      )
    }
    // To complete: the same order as a command form — what it does, the field, the exact text, send
    const fillCard = (p: Phrase, i: number) => {
      const built = buildPhrase(p, filled[p.phrase] ?? '')
      const canSend = built.isOk && d.hasRelai
      return (
        <Box key={`ph-${i}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame(false)} borderColor={flashBorder(`phrase-${i}`, THEME.line)} backgroundColor={THEME.card}>
          <Box key={`ph-head-${i}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1}>
            {mark('fill', THEME.accentText, 32, 'fraza do uzupełnienia')}
            <Box key={`ph-title-${i}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={THEME.title}>{`„${p.phrase}”`}</Text>
              <Text color={THEME.body}>{clip(p.effect, width * 2)}</Text>
            </Box>
          </Box>
          <Input key={`fill-${i}`} label="Uzupełnij: " value={filled[p.phrase] ?? ''} placeholder="w miejsce „…”"
            onInput={(v) => { void update($, fills, (m) => ({ ...m, [p.phrase]: v })) }}
            onSubmit={(v) => { void update($, fills, (m) => ({ ...m, [p.phrase]: v })) }} />
          <Box key={`ph-prev-${i}`} flexDirection="column">{well(`ph-well-${i}`, built.isOk ? built.text : (built.error ?? ''), built.isOk)}</Box>
          {canSend ? [<Box key={`ph-act-${i}`} flexDirection="row">{btn(`phrase-${i}`, 'Wyślij do czatu', 'primary', () => { void sendPhrase($, built.text) }, '✓ Wysłano')}</Box>] : []}
        </Box>
      )
    }
    const phrasesView = () => {
      if (d.sheet.reason) return [<Box key="sheet-reason"><Text color={THEME.body}>{d.sheet.reason}</Text></Box>]
      const indexed = d.sheet.phrases.map((p, i) => [p, i] as const)
      const ready = indexed.filter(([p]) => !p.isTemplate).map(([p, i]) => readyCard(p, i))
      const toFill = indexed.filter(([p]) => p.isTemplate).map(([p, i]) => fillCard(p, i))
      return [
        heading('phrases'),
        ...(ready.length ? [section('phrases-ready', 'phrases-ready', 'Kliknij frazę — pójdzie do czatu tak, jakbyś ją napisał.', ready)] : []),
        ...(toFill.length ? [section('phrases-fill', 'phrases-fill', 'Wpisz brakującą część, sprawdź podgląd i wyślij.', toFill)] : []),
      ]
    }

    // ---------- costs ----------
    // The session's measured requests, priced: a hypothetical API cost, never the subscription's
    // bill (plan, section 3). A gap is said in words and the sum called partial, never a zero.
    // Drawings are geometry only (charts.mjs); every word stands in a box the surface lays out.
    // Kept short (calibration 2026-10-08): figures first, one line of words where one is needed,
    // the details of each call in the tooltips of the columns.
    const CATS = [
      ['input', 'wejście', COST_COLORS.input], ['cacheRead', 'odczyt cache', COST_COLORS.cacheRead],
      ['cacheWrite', 'zapis cache', COST_COLORS.cacheWrite], ['output', 'wyjście', COST_COLORS.output],
    ] as const
    const barCols = Math.max(10, Math.min(width - 6, 60))
    const figure = (key: string, text: string, size: number, color: string) => {
      const art = Svg ? figureArt(text, size, color) : null
      if (Svg && art) return <Svg key={key} source={art.svg} alt={text} width={art.width} height={art.height} />
      return <Text key={key} bold color={color}>{text}</Text>
    }
    // A bar says in its alt what it draws: each slice's share, in words
    const shares = (slices: { value: number, label: string }[]) => {
      const sum = slices.reduce((s, x) => s + x.value, 0)
      return slices.map((s) => `${s.label} ${pct(s.value, sum)}`).join(', ')
    }
    const bar = (key: string, slices: { value: number, color: string, label: string }[], height: number) => {
      if (Svg) return <Svg key={key} source={stackBar(slices, THEME.lineOff, height)} alt={'udział: ' + shares(slices)} height={height} />
      const runs = blocks(slices, barCols)
      return <Box key={key} flexDirection="row">{runs.length ? runs.map((r, i) => <Text key={`${key}-${i}`} color={r.color}>{r.text}</Text>) : [<Text key={`${key}-0`} color={THEME.lineOff}>{'░'.repeat(barCols)}</Text>]}</Box>
    }
    const costBox = (key: string, items: RenderChildren[], isMain = false, grow = false) => (
      <Box key={key} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        {...(grow ? { flexGrow: 1 } : {})}
        {...frame(isMain)} borderColor={isMain ? THEME.mark : THEME.line} backgroundColor={isMain ? THEME.cardFeatured : THEME.card}>
        {items}
      </Box>
    )
    const line = (key: string, text: string, color: string = THEME.body, bold = false) => <Text key={key} color={color} bold={bold}>{text}</Text>
    const clock = (at: number) => { const d = new Date(at); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
    const day = (at: number) => { const d = new Date(at); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}` }
    const money = (n: number | null) => (n === null ? 'brak ceny' : usd(n))
    const nCalls = (n: number) => `${n} ${plural(n, 'wywołanie', 'wywołania', 'wywołań')}`
    const nTurns = (n: number) => `${n} ${plural(n, 'tura', 'tury', 'tur')}`
    const who = (c: { agent: string | null, kind?: string }) => (c.kind === 'compact' ? 'kompakcja' : c.agent === null ? 'wątek główny' : `subagent ${c.agent.slice(0, 8)}`)

    // The sum: the figure, what it counts, its four categories as one bar and a one-row legend
    // The four categories of a group: a dot in its color, the name, tokens and dollars
    const legend = (key: string, g: Group) => (
      <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={2}>
        {CATS.map(([k, label, color]) => (
          <Box key={`${key}-${k}`} flexDirection="row" columnGap={1}>
            <Text color={color}>●</Text>
            <Text color={THEME.title}>{label}</Text>
            <Text color={THEME.body}>{`${tokens(g[k])} · ${usd(g.parts[k])}`}</Text>
          </Box>
        ))}
      </Box>
    )

    // The sum: the figure, what it counts, its four categories as one bar and the legend
    const totalCard = (rep: Report, turnCount: number) => {
      const g = rep.total
      return costBox('cost-total', [
        <Box key="cost-total-head" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          {figure('cost-total-fig', money(g.usd), 34, THEME.mark)}
          <Box key="cost-total-cap" flexDirection="column">
            {line('cost-total-t', `Suma sesji · ${nCalls(g.records)} · ${nTurns(turnCount)}`, THEME.title, true)}
            {line('cost-total-s', g.isPartial ? 'suma częściowa — braki na dole' : 'hipotetyczny koszt w cenach API, nie rachunek abonamentu', g.isPartial ? THEME.accentText : THEME.body)}
          </Box>
        </Box>,
        bar('cost-total-bar', CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 10),
        legend('legend', g),
      ], true)
    }

    // Three tiles in a row (stacked when the pane is narrow): the figure, what it is, one sentence
    const tile = (key: string, fig: string, color: string, label: string, note: string, noteColor: string = THEME.body) => (
      <Box key={key} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        width="30%" flexGrow={1} minWidth={26} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
        <Box key={`${key}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={1}>
          {figure(`${key}-fig`, fig, 24, color)}
          {line(`${key}-l`, label, THEME.title, true)}
        </Box>
        {line(`${key}-n`, note, noteColor)}
      </Box>
    )
    const engineTile = (rep: Report, since: number | null) => {
      const engine = S.costUsd
      if (engine === null) return tile('cost-engine', '~', THEME.title, 'licznik Claude Code', 'Ta sesja nie ma licznika kosztu — zostaje pomiar kolektora.')
      if (rep.records === 0) return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', 'Cała sesja (jak /cost). Kolektor jeszcze nic nie zmierzył — kwota bez rozbicia.', THEME.accentText)
      const measured = rep.total.usd ?? 0
      const rest = Math.max(0, engine - measured)
      if (rest < Math.max(0.01, engine * 0.01)) return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', 'Cała sesja (jak /cost) — zgodna z pomiarem kolektora.', THEME.ok)
      // Late only when the collector really began after the session (a mod loaded mid-session):
      // a collector there from the start explains the rest by requests outside the conversation
      const isLate = S.startedAt > 0 && S.loadedAt - S.startedAt > LATE_MS && (since ?? S.loadedAt) - S.startedAt > LATE_MS
      return tile('cost-engine', usd(engine), THEME.title, 'licznik Claude Code', isLate
        ? `Cała sesja (jak /cost). Kolektor działa od ${clock(since ?? S.loadedAt)}; ${usd(rest)} to tury sprzed tej chwili — bez rozbicia.`
        : `Cała sesja (jak /cost). ${usd(rest)} to wywołania poza rozmową (tytuł sesji, inne pluginy) — bez rozbicia.`)
    }
    const cacheTile = (fx: ReturnType<typeof cacheEffect>) =>
      tile('cost-cache', pct(fx.fromCache, 1), COST_COLORS.cacheRead, 'wejścia z cache',
        `Zapłacone ${usd(fx.paidUsd)} zamiast ${usd(fx.noCacheUsd)} bez cache — oszczędność ${usd(Math.max(0, fx.noCacheUsd - fx.paidUsd))}.`)
    const projectTile = (p: ProjectSum) => p.sessions === 0
      ? tile('cost-project', '~', THEME.title, 'cały projekt', 'Brak pomiarów w tym projekcie.')
      : tile('cost-project', money(p.usd), THEME.title, 'cały projekt',
        `${p.sessions} ${plural(p.sessions, 'sesja', 'sesje', 'sesji')} z pomiarem${p.since ? ` od ${day(p.since)}` : ''}; dziś ${money(p.todayUsd)}.`)

    // One column per model request, the scale in grid lines, a card of the call under the pointer
    const callsSection = (series: TurnCost[], calls: CallCost[]) => {
      const values = calls.map((c) => c.usd)
      const top = values.reduce<number>((best, v, i) => ((v ?? -1) > (values[best] ?? -1) ? i : best), 0)
      const peak = calls[top]
      // Past MAX_COLUMNS calls, neighbours share a column: its card sums them and says how many
      const ranges = bucketRanges(calls.length)
      const perColumn = ranges.length ? Math.max(...ranges.map(([a, b]) => b - a + 1)) : 1
      const points = ranges.map(([a, b]) => {
        const group = calls.slice(a, b + 1)
        const priced = group.filter((c) => c.usd !== null)
        const sum = (k: 'input' | 'cacheRead' | 'cacheWrite' | 'output') => group.reduce((s, c) => s + (c[k] ?? 0), 0)
        const sumUsd = (k: 'input' | 'cacheRead' | 'cacheWrite' | 'output') => group.reduce((s, c) => s + (c.parts ? c.parts[k] : 0), 0)
        const value = priced.length ? priced.reduce((s, c) => s + (c.usd ?? 0), 0) : null
        const first = group[0]!
        const last = group[group.length - 1]!
        return {
          value,
          head: group.length === 1 ? `${clock(first.at)} · ${who(first)}`
            : `${clock(first.at) === clock(last.at) ? clock(first.at) : `${clock(first.at)}–${clock(last.at)}`} · ${nCalls(group.length)}`,
          figure: money(value) + (priced.length < group.length && value !== null ? ' (częściowo)' : ''),
          rows: CATS.map(([k, label, color]) => ({ color, label, value: `${tokens(sum(k))} · ${priced.length ? usd(sumUsd(k)) : '—'}` })),
        }
      })
      const columnTop = points.reduce<number>((best, p, i) => ((p.value ?? -1) > (points[best]?.value ?? -1) ? i : best), 0)
      const step = niceStep(Math.max(0, ...points.map((p) => p.value ?? 0)))
      const chart = (
        <Box key="cost-turns-chart" flexDirection="column">
          {Svg
            ? <Svg key="cost-turns-svg" isInteractive height={hoverHeight(120)} alt={`${nCalls(calls.length)} w czasie; najwyższe ${peak ? money(peak.usd) : 'brak'}`}
                source={hoverColumns(points, { color: COST_COLORS.cacheWrite, markColor: THEME.mark, track: THEME.lineOff, grid: THEME.line, background: THEME.card, card: THEME.cardOn, line: THEME.line, text: THEME.title, muted: THEME.body, mark: columnTop, height: 120, step })} />
            : <Text key="cost-turns-spark" color={THEME.mark}>{spark(values.slice(-barCols))}</Text>}
          {Svg || !calls.length ? [] : [<Text key="cost-turns-axis" color={THEME.body}>{`${clock((calls[Math.max(0, calls.length - barCols)] ?? calls[0])!.at)} → ${clock(calls[calls.length - 1]!.at)} · najwyższy słupek ${money(peak?.usd ?? null)}`}</Text>]}
        </Box>
      )
      return section('costs-turns', 'costs-turns', '', [costBox('cost-turns', [
        chart,
        line('cost-turns-peak', peak
          ? `Najwyższe ${money(peak.usd)} o ${clock(peak.at)} (${who(peak)})${Svg ? ' · najedź na słupek po szczegóły' : ''}`
          : 'Brak wywołań.'),
        line('cost-turns-last', `${nCalls(calls.length)} w ${series.length} ${plural(series.length, 'turze', 'turach', 'turach')}${Svg && perColumn > 1 ? ` · jeden słupek to do ${perColumn} kolejnych wywołań` : ''}.`),
      ])])
    }

    // Agents or models: a smaller card each, the same set as the sum — figure, share, bar, legend
    const groupCards = (key: string, groups: Group[], total: number) => groups.map((g, i) => costBox(`${key}-${i}`, [
      <Box key={`${key}-${i}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
        {figure(`${key}-${i}-fig`, money(g.usd), 22, g.isPartial ? THEME.accentText : THEME.mark)}
        {line(`${key}-${i}-l`, g.label, THEME.title, true)}
        {line(`${key}-${i}-v`, `${pct(g.usd ?? 0, total)} sesji · ${nCalls(g.records)}${g.isPartial ? ' · częściowo' : ''}`)}
      </Box>,
      bar(`${key}-${i}-bar`, CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 6),
      legend(`${key}-${i}-legend`, g),
    ]))

    // The session by stage (E4): each row a figure, its share and its calls; the check that the rows
    // make the session to the cent stands under them in words, with its sign
    const stagesSection = (sc: StageCosts) => {
      const total = sc.total.usd ?? 0
      const rows = [
        ...sc.rows.map((r) => ({ key: r.tag, label: r.tag.replace('/', ' · '), g: r.group })),
        ...[sc.outside, sc.untagged].filter((b) => b.group.records > 0).map((b, i) => ({ key: `outside-${i}`, label: b.words, g: b.group })),
      ]
      const sum = rows.reduce((s, r) => s + (r.g.usd ?? 0), 0)
      return section('costs-stages', 'costs-stages', '', [costBox('cost-stages', [
        ...rows.map((r) => (
          <Box key={`cs-${r.key}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
            {figure(`cs-fig-${r.key}`, money(r.g.usd), 20, r.g.isPartial ? THEME.accentText : THEME.mark)}
            {line(`cs-l-${r.key}`, r.label, THEME.title, true)}
            {line(`cs-v-${r.key}`, `${pct(r.g.usd ?? 0, total)} sesji · ${nCalls(r.g.records)}${r.g.isPartial ? ' · częściowo' : ''}`)}
          </Box>
        )),
        line('cost-stages-check', sc.isWhole
          ? `✓ Etapy i „poza etapem” razem ${usd(sum)} = suma sesji ${usd(total)}`
          : `✗ Etapy i „poza etapem” razem ${usd(sum)} ≠ suma sesji ${usd(total)} — błąd przypisania`, sc.isWhole ? THEME.ok : THEME.accentText),
      ])])
    }

    const costsView = (cd: CostData) => {
      const { report: rep, series, calls, effect, project } = cd
      const gaps = gapsInWords(rep)
      const total = rep.total.usd ?? 0
      const since = rep.records ? Math.min(...cd.records.map((r) => r.at)) : null
      return [
        section('costs', 'costs', '', [
          ...(rep.records ? [totalCard(rep, series.length)] : []),
          <Box key="cost-tiles" flexDirection="row" flexWrap="wrap" gap={1}>
            {[engineTile(rep, since), ...(rep.records ? [cacheTile(effect)] : []), projectTile(project)]}
          </Box>,
        ]),
        ...(rep.records ? [
          stagesSection(cd.stages),
          callsSection(series, calls),
          section('costs-agents', 'costs-agents', '', groupCards('cost-agents', rep.byAgent, total)),
          section('costs-models', 'costs-models', '', groupCards('cost-models', rep.byModel, total)),
        ] : []),
        <Box key="cost-notes" flexDirection="column">
          {gaps.map((w, i) => <Box key={`gap-${i}`}><Text color={THEME.accentText}>{'⚠ ' + w}</Text></Box>)}
          <Box key="cost-foot"><Text dimColor>{`Ceny API z ${PRICING.date}.`}</Text></Box>
        </Box>,
      ]
    }

    // ---------- map (E4) ----------
    // The parts of every tab, nothing new: Kalam headings, rounded cards, the surface's own
    // buttons, figures in Kalam. A state reads in its sign and its word (FLOW), a stage's segment
    // in the colors of the progress bar above the prompt (BAR), a cost as in the costs tab.
    type Cost = { usd: number | null, isPartial: boolean, records: number }
    const isUnfolded = (key: string, byDefault: boolean) => folds[key] ?? byDefault
    const fold = (key: string, byDefault: boolean) => { void update($, unfolded, (m) => ({ ...m, [key]: !(m[key] ?? byDefault) })) }
    const stageLook = (status: string) => (FLOW.stage as Record<string, { mark: string, color: string, item: string }>)[status] ?? FLOW.unknown
    // No record is "bez pomiaru"; records without a price are "brak ceny" (L-0147): two words
    // A stage worked on before E4 was measured, only without a tag: "sprzed znacznika", its cost in
    // the "Poza etapem" section (calibration 2026-10-09); a stage nothing measured: "bez pomiaru"
    const costFig = (key: string, c: Cost | undefined, size: number, empty = 'bez pomiaru') => (c === undefined || c.records === 0
      ? <Text key={key} color={THEME.body}>{empty}</Text>
      : figure(key, money(c.usd), size, c.isPartial ? THEME.accentText : THEME.mark))
    // Only a stage closed on or after the first day of untagged measurements, or in progress: a stage
    // closed before the collector existed was never measured (live, 2026-10-09: PROWADZENIE_END_TO_END)
    const isPreTag = (md: MapData, s: MapStage) => md.untaggedSince !== null
      && (s.status === 'W TOKU' || (['ZREALIZOWANY', 'POMINIĘTY'].includes(s.status) && s.date !== null && s.date >= md.untaggedSince))
    const sumCost = (list: Cost[]): Cost | undefined => (list.length === 0 ? undefined : {
      usd: list.some((c) => c.usd !== null) ? list.reduce((s, c) => s + (c.usd ?? 0), 0) : null,
      isPartial: list.some((c) => c.isPartial), records: list.reduce((s, c) => s + c.records, 0),
    })
    const nTasks = (n: number) => `${n} ${plural(n, 'zadanie', 'zadania', 'zadań')}`

    // The stages of a plan as one bar of segments; hovering one shows its id, status and name
    const strip = (key: string, node: PlanNode, bg: string) => {
      const looks = node.stages.map((s) => stageLook(s.status))
      const colors = looks.map((l) => BAR.segment[l.item as keyof typeof BAR.segment])
      if (!colors.length) return null
      const now = node.stages.find((s) => s.status === 'W TOKU') ?? node.stages.find((s) => s.status === 'GOTOWY DO STARTU')
      const n = node.stages.length
      const idle = [now ? `Teraz: ${now.id} · ${now.name}` : `${n} ${plural(n, 'etap', 'etapy', 'etapów')}`, 'najedź na segment, żeby zobaczyć etap']
      const art = Svg ? hoverSegments(node.stages.map((s, i) => ({ color: colors[i] ?? BAR.segment.unknown, head: `${looks[i]?.mark ?? '?'} ${s.id} · ${s.status}`, detail: s.name })),
        { background: bg, text: THEME.title, muted: THEME.body, idle, chars: Math.floor(((width - 8) * 8) / 6.8) }) : null
      if (Svg && art) return <Svg key={key} isInteractive source={art.svg} alt={node.stages.map((s, i) => `${looks[i]?.mark ?? '?'} ${s.id} ${s.status}`).join(', ')} height={art.height} />
      const t = segmentText(colors, Math.max(6, width - 8))
      return (
        <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={t.gap}>
          {t.runs.map((r, i) => <Box key={`${key}-${i}`}><Text color={r.color}>{r.text}</Text></Box>)}
        </Box>
      )
    }

    const branchLine = (key: string, b: Branch) => {
      const look = b.status ? FLOW.branch[b.status as keyof typeof FLOW.branch] : FLOW.unknown
      const words = b.statusWords ? clip(b.statusWords, 48) + (b.status ? '' : ' (status spoza listy)') : 'bez statusu'
      return (
        <Box key={key} flexDirection="column">
          <Text bold color={look.color} wrap="truncate">{`${look.mark} ${b.name} · ${words}`}</Text>
          {b.about ? [<Text key={`${key}-a`} color={THEME.body}>{clip(b.about, width * 2)}</Text>] : []}
        </Box>
      )
    }

    // A stage: its sign, id and name, what hangs on it, its cost; unfolded, where the cost went
    const stageRow = (md: MapData, node: PlanNode, s: MapStage) => {
      const tag = `${node.name}/${s.id}`
      const key = 'stage:' + tag
      const look = stageLook(s.status)
      const isNow = s.status === 'W TOKU'
      const isOpen = isUnfolded(key, false)
      const g = md.cost.rows.find((r) => r.tag === tag)?.group
      const branches = node.branches.filter((b) => b.source === s.id)
      const tasks = md.runs.flatMap((r) => r.waves.flatMap((w) => w.tasks.filter((t) => t.stage === tag).map((t) => ({ run: r.run, t }))))
      const facts = [s.status.toLowerCase(), branches.length ? `${branches.length} ${plural(branches.length, 'odnoga', 'odnogi', 'odnóg')}` : '', tasks.length ? `${nTasks(tasks.length)} załogi` : ''].filter(Boolean).join(' · ')
      const more = isOpen ? costBox(`st-more-${tag}`, [
        ...(g ? [
          line(`st-c-${tag}`, `Koszt etapu · ${nCalls(g.records)}${g.isPartial ? ' · częściowo — część wywołań bez ceny' : ''}`, THEME.title, true),
          bar(`st-bar-${tag}`, CATS.map(([k, label, color]) => ({ value: g.parts[k], color, label })), 6),
          legend(`st-leg-${tag}`, g),
        ] : [line(`st-c-${tag}`, isPreTag(md, s)
          ? `Sprzed znacznika: etap z okresu, gdy kolektor mierzył bez etapu w rekordzie (od ${md.untaggedSince ?? ''}) — jego wywołania, jeśli były mierzone, są w sekcji „Poza etapem”, bez rozbicia na etapy.`
          : 'Bez pomiaru: kolektor nie zapisał żadnego wywołania z tym etapem.')]),
        ...(branches.length ? [line(`st-b-${tag}`, 'Odnogi z tego etapu', THEME.mark, true), ...branches.map((b) => branchLine(`st-b-${tag}-${b.name}`, b))] : []),
        ...(tasks.length ? [line(`st-t-${tag}`, 'Zadania załogi przypisane do etapu', THEME.mark, true),
          ...tasks.map(({ run, t }) => line(`st-t-${tag}-${run}-${t.id}`, `${FLOW.task[t.status].mark} ${t.name} · przebieg ${run}`, FLOW.task[t.status].color))] : []),
      ]) : null
      return (
        <Box key={`st-${tag}`} flexDirection="column">
          <Box key={`st-row-${tag}`} flexDirection="row" alignItems="center" gap={isGui ? 2 : 1} paddingX={1}
            {...frame(isNow || isOpen)} borderColor={flashBorder(`fold-${key}`, isNow ? THEME.accent : THEME.line)}
            backgroundColor={isNow ? THEME.cardOn : THEME.card} hover={{ borderColor: THEME.accent }}>
            <Text bold color={look.color}>{look.mark}</Text>
            <Box key={`st-text-${tag}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={THEME.title} wrap="truncate">{`${s.id} · ${s.name}`}</Text>
              <Text color={look.color} wrap="truncate">{facts}</Text>
            </Box>
            {/* The cost never shrinks: the name truncates first (terminal, 2026-10-09: "$4.5" over "4") */}
            <Box key={`st-fig-${tag}`} flexShrink={0}>{costFig(`st-cost-${tag}`, g, 20, isPreTag(md, s) ? 'sprzed znacznika' : 'bez pomiaru')}</Box>
            {btn(`fold-${key}`, isOpen ? 'Zwiń' : 'Szczegóły', 'secondary', () => fold(key, false))}
          </Box>
          {more ? [more] : []}
        </Box>
      )
    }

    // A plan: name, status, how many stages are closed, its cost; the bar of its stages; unfolded,
    // a row per stage and the branches that came from no stage of it
    const planCard = (md: MapData, node: PlanNode) => {
      const isMain = node.place === 'active'
      const key = 'plan:' + node.name
      const isOpen = isUnfolded(key, isMain)
      const closed = node.stages.filter((s) => s.status === 'ZREALIZOWANY' || s.status === 'POMINIĘTY').length
      const c = sumCost(md.cost.rows.filter((r) => splitStage(r.tag)?.plan === node.name).map((r) => r.group))
      const bg = isMain ? THEME.cardFeatured : THEME.card
      const loose = node.branches.filter((b) => !node.stages.some((s) => s.id === b.source))
      const status = [node.planStatus ?? 'status nieznany', node.closedOn ?? ''].filter(Boolean).join(' ')
      return (
        <Box key={`plan-${node.name}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame(isMain)} borderColor={flashBorder(`fold-${key}`, isMain ? THEME.mark : THEME.line)} backgroundColor={bg}>
          <Box key={`plan-head-${node.name}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
            <Box key={`plan-name-${node.name}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={isMain ? THEME.mark : THEME.title} wrap="truncate">{node.name}</Text>
              <Text color={THEME.body} wrap="truncate">{`${status} · zamknięte ${closed} z ${node.stages.length} etapów`}</Text>
            </Box>
            {c ? costFig(`plan-cost-${node.name}`, c, isMain ? 26 : 20) : []}
            {btn(`fold-${key}`, isOpen ? 'Zwiń' : 'Rozwiń', isMain ? 'primary' : 'secondary', () => fold(key, isMain))}
          </Box>
          {strip(`strip-${node.name}`, node, bg)}
          {isOpen ? [
            ...node.stages.map((s) => stageRow(md, node, s)),
            ...(loose.length ? [<Box key={`loose-${node.name}`} flexDirection="column">
              {line(`loose-h-${node.name}`, 'Odnogi spoza etapów tego planu', THEME.mark, true)}
              {loose.map((b) => branchLine(`loose-${node.name}-${b.name}`, b))}
            </Box>] : []),
          ] : []}
        </Box>
      )
    }

    // A crew task: its sign, name, id and state, what it waits for, its stage and cost; a merged
    // task lists the tasks it holds, each still readable
    const taskChip = (md: MapData, run: CrewRun, t: MapTask) => {
      const id = `${run.run}/${t.id}`
      const look = FLOW.task[t.status]
      const isPicked = chosen.includes(id)
      const cost = md.tasks.find((x) => x.run === run.run && x.id === t.id)?.group
      const stage = splitStage(t.stage)
      const facts = [`${t.id} · ${look.word}`, t.deps.length ? `po: ${t.deps.join(', ')}` : '', stage ? `etap ${stage.stage}` : ''].filter(Boolean).join(' · ')
      return (
        <Box key={`task-${id}`} flexDirection="column" width="48%" flexGrow={1} minWidth={26} paddingX={1}
          {...frame(isGui || isPicked)} borderColor={flashBorder(`pick-${id}`, isPicked ? THEME.accent : THEME.line)} backgroundColor={isPicked ? THEME.cardOn : THEME.card}>
          <Box key={`task-head-${id}`} flexDirection="row" alignItems="center" columnGap={1}>
            <Text bold color={look.color}>{look.mark}</Text>
            <Box key={`task-text-${id}`} flexDirection="column" flexGrow={1} flexShrink={1}>
              <Text bold color={THEME.title} wrap="truncate">{t.name}</Text>
              <Text color={THEME.body} wrap="truncate">{facts}</Text>
            </Box>
            {cost ? costFig(`task-cost-${id}`, cost, 18) : []}
          </Box>
          {t.members.length > 1 ? t.members.map((x) => <Text key={`task-m-${id}-${x.id}`} color={FLOW.task[x.status].color} wrap="truncate">{`  ↳ ${x.id} · ${x.name} ${FLOW.task[x.status].mark}`}</Text>) : []}
          <Box key={`task-act-${id}`} flexDirection="row" flexWrap="wrap" gap={1}>
            {btn(`pick-${id}`, isPicked ? 'Odznacz' : 'Zaznacz', isPicked ? 'primary' : 'secondary', () => { void update($, picks, (p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])) })}
            {t.isGroup ? btn(`split-${id}`, t.members.length > 1 ? 'Rozdziel' : 'Usuń przypisanie', 'secondary', () => { void saveMerges($, splitGroup(md.merges, t.id)) }) : []}
          </Box>
        </Box>
      )
    }

    // What the person can do with the tasks picked in a run: merge them, give them a stage
    const runActions = (md: MapData, run: CrewRun) => {
      const mine = chosen.filter((p) => p.startsWith(run.run + '/')).map((p) => p.slice(run.run.length + 1))
      if (!mine.length) return null
      const active = md.nodes.find((n) => n.place === 'active')
      const clear = () => update($, picks, (p) => p.filter((x) => !x.startsWith(run.run + '/')))
      const apply = (m: Merges) => { void saveMerges($, m).then(clear) }
      return (
        <Box key={`run-act-${run.run}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1} borderStyle="round" borderColor={THEME.accent} backgroundColor={THEME.cardOn}>
          <Text bold color={THEME.title} wrap="truncate">{`Zaznaczone: ${mine.join(', ')}`}</Text>
          <Box key={`run-btn-${run.run}`} flexDirection="row" flexWrap="wrap" gap={1}>
            {mine.length >= 2 ? btn(`merge-${run.run}`, 'Scal zaznaczone', 'primary', () => apply(mergePicked(md.merges, run.run, mine)), '✓ Scalono') : []}
            {btn(`unpick-${run.run}`, 'Wyczyść', 'secondary', () => { void clear() })}
          </Box>
          {active ? [<Select key={`assign-${run.run}`} label="Przypisz do etapu: " value={NONE}
            options={[{ value: NONE, label: '— wybierz —' }, { value: '-', label: 'bez etapu' }, ...active.stages.map((s) => ({ value: `${active.name}/${s.id}`, label: `${s.id} · ${clip(s.name, 40)}` }))]}
            onSelect={(v) => { if (v !== NONE) apply(assignPicked(md.merges, run.run, mine, v === '-' ? null : v)) }} />] : []}
          <Text color={THEME.body}>Scalenie i przypisanie zapisują się w pliku panelu; pliki przebiegu zostają nietknięte.</Text>
        </Box>
      )
    }

    const runCard = (md: MapData, run: CrewRun) => {
      const count = run.waves.reduce((s, w) => s + w.tasks.reduce((n, t) => n + Math.max(1, t.members.length), 0), 0)
      return costBox(`run-${run.run}`, [
        <Box key={`run-head-${run.run}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          <Text bold color={THEME.title}>{`Przebieg ${run.run}`}</Text>
          <Text color={run.error ? THEME.accentText : THEME.body}>{run.error || `${nTasks(count)} · ${run.waves.length} ${plural(run.waves.length, 'fala', 'fale', 'fal')}`}</Text>
        </Box>,
        ...run.waves.map((w) => (
          <Box key={`wave-${run.run}-${w.n}`} flexDirection="column">
            <Text bold color={THEME.mark}>{`Fala ${w.n} · ${w.isParallel ? 'równolegle' : 'pojedynczo'}`}</Text>
            <Box key={`wave-tasks-${run.run}-${w.n}`} flexDirection="row" flexWrap="wrap" gap={1}>{w.tasks.map((t) => taskChip(md, run, t))}</Box>
          </Box>
        )),
        ...(run.conflicts.length ? [line(`run-conf-${run.run}`, `Wspólne pliki: ${run.conflicts.map((c) => `${c.second} czeka na ${c.first}`).join('; ')}`)] : []),
        ...[runActions(md, run)].filter((x) => x !== null),
        crewEditor(run.run),
      ])
    }

    // The crew before "zaczynamy" (E5, 1c): role, tool and model of each task, from closed lists;
    // the waves follow the draft. Only a run without manifest.json opens; "Zatwierdź" makes the card
    const crewEditor = (run: string) => {
      const draft = crewDrafts[run]
      if (!draft) return <Box key={`crew-edit-${run}`} flexDirection="row">{btn(`crew-open-${run}`, 'Edytuj skład', 'secondary', () => { void editCrew($, run) })}</Box>
      const change = (id: string, key: 'role' | 'runtime' | 'model', v: string) => {
        const r = setTask(draft, id, key, v)
        if (r.error) { void update($, sent, () => `Nie zmieniono ${id}: ${r.error}`); return }
        void update($, drafts, (m) => ({ ...m, [run]: r.draft }))
      }
      return (
        <Box key={`crew-edit-${run}`} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1} borderStyle="round" borderColor={THEME.accent} backgroundColor={THEME.cardOn}>
          <Text bold color={THEME.title}>{`Skład przed startem · ${nTasks(draft.tasks.length)}`}</Text>
          {draft.tasks.map((t) => (
            <Box key={`crew-t-${run}-${t.id}`} flexDirection="column">
              <Text bold color={THEME.mark} wrap="truncate">{`${t.id} · ${t.title || 'bez tytułu'}`}</Text>
              <Select key={`crew-role-${run}-${t.id}`} label="rola: " value={t.role || NONE}
                options={[...(t.role ? [] : [{ value: NONE, label: '— wybierz —' }]), ...ROLES.map((x) => ({ value: x, label: x }))]}
                onSelect={(v) => { if (v !== NONE) change(t.id, 'role', v) }} />
              <Select key={`crew-rt-${run}-${t.id}`} label="narzędzie: " value={t.runtime || NONE}
                options={[...(t.runtime ? [] : [{ value: NONE, label: '— wybierz —' }]), ...RUNTIMES.map((x) => ({ value: x, label: x }))]}
                onSelect={(v) => { if (v !== NONE) change(t.id, 'runtime', v) }} />
              <Input key={`crew-model-${run}-${t.id}`} label="model: " value={t.model} placeholder="np. opus, puste = domyślny"
                onSubmit={(v) => change(t.id, 'model', v.trim())} />
            </Box>
          ))}
          <Box key={`crew-act-${run}`} flexDirection="row" flexWrap="wrap" gap={1}>
            {btn(`crew-ok-${run}`, 'Zatwierdź skład', 'primary', () => { void cardId($).then((id) => offer($, crewCard(id, draft))) })}
            {btn(`crew-drop-${run}`, 'Porzuć zmiany', 'secondary', () => { void update($, drafts, (m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== run))) })}
          </Box>
          <Text color={THEME.body}>Plik zadania.json zapisze się dopiero po „Tak” na karcie.</Text>
        </Box>
      )
    }

    const mapView = (md: MapData) => {
      const active = md.nodes.filter((n) => n.place === 'active')
      const others = md.nodes.filter((n) => n.place === 'open')
      const archive = md.nodes.filter((n) => n.place === 'archive')
      const outside = [md.cost.outside, md.cost.untagged].filter((b) => b.group.records > 0)
      return [
        section('map', 'map', `Plany, etapy i odnogi z plików STATUS.md; koszt etapu ze wszystkich zmierzonych sesji projektu (${nCalls(md.cost.total.records)}).`,
          active.length ? active.map((n) => planCard(md, n)) : [costBox('map-none', [line('map-none-t', 'Brak aktywnego planu — linia „Aktywny plan” w CLAUDE.md mówi „brak” albo jej nie ma.')])]),
        ...(others.length ? [section('map-open', 'map-open', '', others.map((n) => planCard(md, n)))] : []),
        section('map-crew', 'map-crew', md.runs.length ? 'Fale i zależności z zadania.json, stan z manifest.json. Zaznacz zadania, żeby je scalić albo przypisać do etapu.' : '',
          md.runs.length ? md.runs.map((r) => runCard(md, r)) : [costBox('crew-none', [line('crew-none-t', 'Brak przebiegów /relai-crew w tym projekcie — pojawią się tu z .claude/relai/work/CREW/.')])]),
        ...(outside.length ? [section('map-outside', 'map-outside', 'Każde wywołanie policzone; żadne nie trafia po cichu do najbliższego etapu.', outside.map((b, i) => costBox(`out-${i}`, [
          <Box key={`out-row-${i}`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
            {costFig(`out-fig-${i}`, b.group, 22)}
            <Box key={`out-text-${i}`} flexDirection="column" flexShrink={1}>
              {line(`out-t-${i}`, b.words, THEME.title, true)}
              {line(`out-n-${i}`, `${nCalls(b.group.records)} · wszystkie sesje projektu`)}
            </Box>
          </Box>,
        ])))] : []),
        ...(archive.length ? [section('map-archive', 'map-archive', `${archive.length} ${plural(archive.length, 'plan zamknięty', 'plany zamknięte', 'planów zamkniętych')}, ostatnio zamknięty na górze.`, archive.map((n) => planCard(md, n)))] : []),
        <Box key="map-foot"><Text dimColor>{`Ceny API z ${PRICING.date}. Pomiary sprzed E4 nie mają znacznika etapu.`}</Text></Box>,
      ]
    }

    const costs = tab === 'costs' ? await costData($) : null
    const map = tab === 'map' ? await mapData($) : null
    const body = tab === 'commands' ? commandsView() : tab === 'sheet' ? sheetView() : costs ? costsView(costs) : map ? mapView(map) : phrasesView()
    const isSentInDrawer = tab === 'commands' && picked !== '' && formOf(picked) !== undefined
    return (
      <Box key="relai-pane" flexDirection="column" gap={1} paddingX={isGui ? 1 : 0}>
        <Box key="hero" flexDirection="column">
          {heading('hero', THEME.accent)}
          <Text dimColor>{`${FORMS.length} komend RelAI · kliknij komendę, żeby otworzyć jej formularz`}</Text>
        </Box>
        {tabs}
        {d.hasRelai ? [] : [<Box key="no-relai"><Text color={THEME.mark}>{NO_RELAI}</Text></Box>]}
        {pending ? [confirmCard(pending)] : []}
        <Box key="body" flexDirection="column" gap={isGui ? 2 : 1}>{body}</Box>
        {sentLine && !isSentInDrawer ? [sentLine] : []}
      </Box>
    )
  })

  // Each request, main loop and subagents, to the collector, tagged with the stage in progress and
  // the crew task (E4). The plan is read again at each request: a stage turns W TOKU mid-turn, and
  // the request that follows already belongs to it.
  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    if (!S.isRelai) return result
    const at = await $.clock.now()
    // No response at all (stopReason null): no request reached the API, nothing to measure.
    // A response without usage is a measurement missing, recorded as such.
    if (result && (result.usage || result.stopReason !== null)) {
      const usage = result.usage
      if (!e.agentId) lastModel = usage ? usage.model : e.model
      const plan = await readPlan($)
      set({ plan })
      const stage = stageTag(plan)
      const task = e.agentId ? ((await read($, agentTasks))[e.agentId] ?? null) : mainTask
      void collect($, (session) => stepRecord({ session, turn: e.turnId, index: e.index, agent: e.agentId ?? null, model: e.model, at, usage, stage, task }))
    }
    return result
  })

  // A subagent started for a crew task: its id joined to the task named under its prompt
  on('agent.spawn', async ($, e, next) => {
    const r = await next(e)
    const task = S.isRelai ? crewTag(e.prompt) : null
    if (task && r && r.agentId) {
      const id = r.agentId
      await update($, agentTasks, (m) => ({ ...m, [id]: task }))
    }
    return r
  })

  on('prompt.submit', async ($, e, next) => {
    if (S.isRelai) mainTask = crewTag(e.text)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai || e.agentId) return r
    await refresh($)
    $.ui.invalidate('ui.render')
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai) return r
    // Usage is absent when no request was made (a reused summary, a hook's own): nothing to measure
    const usage = r && 'usage' in r ? r.usage : undefined
    if (usage) {
      const at = await $.clock.now()
      const stage = stageTag(S.plan)
      void collect($, (session) => compactRecord({ session, agent: e.agentId ?? null, model: lastModel, at, usage, stage, task: e.agentId ? null : mainTask }))
    }
    return r
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    if (S.isRelai) {
      if (e.cost) set({ costUsd: e.cost.usd })
    }
    return next(e)
  })

  // One band instance for every plugin: draw ours above whatever the plugins beneath draw
  // (the other RelAI cards among them), never instead of it
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!S.isRelai || e.props.hasSurvey) return next(e)
    const below = await next(e)
    const ours = band($, e, e.props.bodyColumns)
    if (!below) return ours
    const { Box } = $.ui.resolve(e)
    // No width here: the engine refuses its own node under a Box with "width" and draws its own
    // instead, which drops every band (live, desktop, 2.1.293; plugin test does not see it)
    return <Box key="relai-panel" flexDirection="column" gap={e.surface === 'terminal' ? 0 : 1}>{[ours, below]}</Box>
  })
}
