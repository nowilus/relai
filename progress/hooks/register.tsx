// relai-progress: how far the work of a RelAI session is, and its subagents, live
// (plan PANEL_CLAUDE, E9, Aneks C).
//
// Based on savvy-progress by johnnyvizz (github.com/johnnyvizz/claude-kit, MIT; the license is in
// LICENSE-savvy-progress next to this plugin's manifest): its band above the prompt and its agents
// pane following agent.spawn, the subagent's turn.step and its turn.complete. What differs: the
// progress comes from files alone — the boxes of the stage prompt, a /relai-crew run — never from
// a tool the model calls (decision of 2026-10-09, R7: nothing added to the prompt), and an agent's
// cost is read from relai-panel's measurements, never counted a second time.
// The reckoning lives in ./core (progress.mjs, agents.mjs, synced from core/panel/); this file
// draws and calls. One file with the hooks: the engine follows $ only into functions declared in
// this same file.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderChildren } from 'claude-code'
import { crewProgress, pick, promptLink, stageProgress } from './core/progress.mjs'
import { segmentText } from './core/charts.mjs'
import type { Progress } from './core/progress.mjs'
import { ancestors, planState } from './core/plan-state.mjs'
import { agentCost, counts, finished, spawned, stepped } from './core/agents.mjs'
import type { AgentRun } from './core/agents.mjs'
import { isFileOf, parseRecords } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { PRICE_FILE, newest, parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import type { Version } from './core/pricing.mjs'
import { BAND, BAR, THEME } from './core/theme.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { clip, duration, join, tokens, usd } from './fmt'
import { barCard } from './bar-card'
import { SEGMENTS_HEIGHT, calmLine, itemLine, segmentArt } from './segments'

type $T = EngineInterface

const RELAI_MARKER = /Wersja RelAI|RelAI version/
const MEASURE_DIR = '.claude/relai/pomiary'
const CREW_DIR = '.claude/relai/work/CREW'
const TICK_MS = 10_000 // a box ticked by hand in the prompt file shows within this
const EDIT_TOOLS = ['Edit', 'Write', 'NotebookEdit'] as const
const PANE_ID = 'relai-agents'
const PANE_TITLE = 'Postęp i agenci RelAI'

const agents = atom({ plugin: 'relai-progress', key: 'agents' } as const, [] as AgentRun[])
const progress = atom({ plugin: 'relai-progress', key: 'progress' } as const, null as Progress | null)
const isDoneCollapsed = atom({ plugin: 'relai-progress', key: 'isDoneCollapsed' } as const, false)
// The box that just turned done (brief v2, 1): in $.state, so a reload of the mod keeps it, and
// with its time, so it expires by the clock even when the timer that was to clear it is gone
type Ticked = { id: string, index: number, total: number, name: string, at: number }
const ticked = atom({ plugin: 'relai-progress', key: 'ticked' } as const, null as Ticked | null)
const TICKED_MS = 10_000

// The module's own; a reload starts them over and session.start sets them again
let cwd = ''
let isRelai = false
let ticking = false

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

// The files the last read went through, and their times then (AUDYT_MODOW Z4): a tick asks the
// times first and reads the files only when one moved, so an idle session reads nothing
let watched: string[] = []
let seen = ''

async function stampOf($: $T, paths: readonly string[]): Promise<string> {
  const marks = await Promise.all(paths.map((p) => $.fs.stat(p).then((s) => `${s.mtimeMs}:${s.size}`, () => '-')))
  return marks.join('|')
}

// The newest /relai-crew run (run ids sort by time), if any is live
async function readCrew($: $T, text: (path: string) => Promise<string | null>): Promise<Progress | null> {
  const dir = join(cwd, CREW_DIR)
  if (!(await $.fs.exists(dir).catch(() => false))) return null
  const runs = (await $.fs.list(dir).catch(() => [])).filter((x) => x.kind === 'dir').map((x) => x.name).sort()
  const run = runs[runs.length - 1]
  if (!run) return null
  const [tasks, manifest] = await Promise.all([text(join(dir, `${run}/zadania.json`)), text(join(dir, `${run}/manifest.json`))])
  return crewProgress(run, tasks, manifest, await $.clock.now())
}

async function readProgress($: $T): Promise<Progress> {
  // The crew folder itself is watched: a new run moves its time
  const paths: string[] = [join(cwd, CREW_DIR)]
  const text = (path: string) => { paths.push(path); return readText($, path) }
  const claude = await text(join(cwd, 'CLAUDE.md'))
  const plan = await planState(claude, (rel) => text(join(cwd, rel)))
  let promptText: string | null = null
  let link: string | null = null
  if (plan.kind === 'ok' && plan.stage) {
    const statusMd = await text(join(cwd, plan.statusPath))
    link = statusMd === null ? null : promptLink(statusMd, plan.stage.id, plan.statusPath)
    promptText = link === null ? null : await text(join(cwd, link))
  }
  const crew = await readCrew($, text)
  watched = [...new Set(paths)]
  return pick(crew, stageProgress(plan, promptText, link ?? 'prompt'))
}

// Reads the files again when one moved (or always, when forced); writes the value only when it
// changed, so an idle tick redraws nothing
// A crew run is live for a window of time (crewProgress): shown, it is read again every
// CREW_RECHECK_MS even when no file moved, so a run that died leaves the bar
const CREW_RECHECK_MS = 5 * 60_000
let crewReadAt = 0

// The last box of the new list that was not done in the old one and is now; null when none (or
// when the list is another one: other ids)
function justTicked(was: Progress | null, now: Progress, at: number): Ticked | null {
  if (was === null) return null
  const before = new Map(was.items.map((it) => [it.id, it.status]))
  for (let i = now.items.length - 1; i >= 0; i--) {
    const it = now.items[i]
    const old = it ? before.get(it.id) : undefined
    if (it && it.status === 'done' && old !== undefined && old !== 'done') return { id: it.id, index: i + 1, total: now.items.length, name: it.name, at }
  }
  return null
}

// Clears the ticked box past its time: called by the timer set when it appeared and by every tick
// (a reload drops the timer, never the state)
async function expireTicked($: $T, clockNow: number) {
  const t = await read($, ticked)
  if (t !== null && clockNow - t.at >= TICKED_MS) await update($, ticked, () => null)
}

async function refresh($: $T, isForced = false) {
  if (!isRelai) return
  const clockNow = await $.clock.now()
  await expireTicked($, clockNow)
  // The times are taken before the read: a file that moves during it is read again next time
  const before = watched.length ? await stampOf($, watched) : ''
  const isCrewDue = crewReadAt > 0 && clockNow - crewReadAt >= CREW_RECHECK_MS
  if (!isForced && !isCrewDue && watched.length && before === seen) return
  const old = watched
  const now = await readProgress($)
  seen = old.length === watched.length && old.every((p, i) => p === watched[i]) ? before : await stampOf($, watched)
  crewReadAt = now.kind === 'crew' ? clockNow : 0
  const was = await read($, progress)
  if (JSON.stringify(was) === JSON.stringify(now)) return
  await update($, progress, () => now)
  // The first read of a session is no news: boxes ticked before it are not "just ticked"
  const tick = isForced ? null : justTicked(was, now, clockNow)
  if (tick === null) return
  await update($, ticked, () => tick)
  $.clock.after(TICKED_MS, () => { $.clock.now().then((t) => expireTicked($, t)).catch(() => undefined) })
}

// This session's records of relai-panel's collector; [] when it does not measure this session
async function sessionRecords($: $T): Promise<MeasureRecord[] | null> {
  const dir = join(cwd, MEASURE_DIR)
  if (!(await $.fs.exists(dir).catch(() => false))) return null
  const session = await $.session.id().catch(() => '')
  const file = (await $.fs.list(dir).catch(() => [])).find((x) => x.kind === 'file' && isFileOf(x.name, session))
  if (!file) return null
  // Parsed again only when the file moved (Z4): the pane draws after each agent's step
  const key = `${file.name}|${file.size}|${file.mtimeMs}`
  if (parsed && parsed.key === key) return parsed.records
  const records = parseRecords(await readText($, join(dir, file.name))).records
  parsed = { key, records }
  return records
}
let parsed: { key: string, records: MeasureRecord[] } | null = null

// The project's price list, as relai-panel's Costs tab prices the same records (AUDYT_MODOW Z5):
// PRICING with the versions saved in cennik.json laid over it, each record by its own list (R6).
// Read again only when the file's time or size moved; a file that cannot be read prices with
// PRICING alone and its error goes to the pane in words.
type Prices = { lists: Version[], date: string, error: string }
let prices: { key: string, value: Prices } | null = null

async function loadPrices($: $T): Promise<Prices> {
  const path = join(cwd, PRICE_FILE)
  const stat = await $.fs.stat(path).catch(() => null)
  const key = stat === null ? `${path}|none` : `${path}|${stat.mtimeMs}|${stat.size}`
  if (prices && prices.key === key) return prices.value
  let text: string | null = null
  if (stat !== null) {
    try {
      text = await $.fs.read(path)
    } catch (err) {
      // Not remembered: a read that failed once is tried again at the next drawing
      const lists = priceLists([])
      return { lists, date: newest(lists).date, error: `${PRICE_FILE}: odczyt nieudany (${err instanceof Error ? err.message : String(err)})` }
    }
  }
  const file = parsePriceFile(text)
  const lists = priceLists(file.versions)
  const value = { lists, date: newest(lists).date, error: file.error }
  prices = { key, value }
  return value
}

// What the agents cost, as the pane sums them: each agent from the collector's records with its
// id, priced by the project's list; a sum missing an agent's records is partial
type AgentCosts = { cost: (a: AgentRun) => ReturnType<typeof agentCost>, total: number | null, isPartial: boolean, records: MeasureRecord[] | null, pricing: Prices }
async function agentCosts($: $T, list: readonly AgentRun[]): Promise<AgentCosts> {
  const records = await sessionRecords($)
  const pricing = await loadPrices($)
  const price = (r: MeasureRecord) => priceAt(r, pricing.lists)
  const cost = (a: AgentRun) => (records === null ? null : agentCost(records, a.id, price))
  const costs = list.map(cost)
  const known = costs.filter((c) => c !== null && c.usd !== null).map((c) => c?.usd ?? 0)
  const total = known.length ? known.reduce((s, x) => s + x, 0) : null
  return { cost, total, isPartial: costs.some((c) => c === null || c.isPartial), records, pricing }
}

async function togglePane($: $T): Promise<string> {
  if ((await $.ui.panes()).some((p) => p.id === PANE_ID)) {
    await $.ui.close({ id: PANE_ID })
    return 'Panel agentów zamknięty.'
  }
  const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
  return opened.isPlaced ? 'Panel agentów otwarty.' : `Panel agentów czeka na miejsce: ${opened.reason}`
}

// The progress bar (brief v2: docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md, 3 and 5) in the shared
// grid of the RelAI bars (bar-card.tsx, the same file in the three plugins, Z6): the label
// column, the middle, the figure `a/b` + unit on the right, label and figure at the top of the
// middle. The middle's first row holds the segments — one per item in the color of its state, Svg
// on the desktop with the small line under them in the same drawing, cells of text in the
// terminal with the line as text below — and beside them the agents chip; a second row only while
// a box has just been ticked. No button: the agents pane opens with /relai-agents.
const CELL_PX = 8 // a desktop cell, about (savvy-progress reckons the same)
const LINE_TEXT_PX = 6.6 // the mean advance of an 11.5 px Segoe UI character, about (6.8 at 12 px)
const COLUMN_GAP = 2 // cells between the grid's columns (brief, 5)
const MIN_SEGMENT_CELLS = 10 // below this the chip goes under the segments rather than beside

// The unit after `a/b`, one format for all the bars (brief, 3): 1 punktu, 14 punktów; a crew's tasks
const unitOf = (p: Progress) => (p.kind === 'crew' ? (p.total === 1 ? 'zadania' : 'zadań') : (p.total === 1 ? 'punktu' : 'punktów'))

// The agents chip beside the segments (brief, 3): how many subagents the session ran, ● while one
// runs and ✓ once none does, and what they cost by the pane's own sum ("≥" when it is partial)
function agentsChip(list: readonly AgentRun[], c: AgentCosts) {
  const { running } = counts(list)
  const money = c.total === null ? 'brak pomiaru' : `${c.isPartial ? '≥ ' : ''}${usd(c.total)}`
  const look = running ? { color: BAND.panel.color, bg: BAR.tile.running.bg } : { color: BAND.progress.color, bg: BAR.tile.done.bg }
  const mark = running ? BAR.tile.running.mark : BAR.tile.done.mark
  return { text: `${mark} ${list.length} ${list.length === 1 ? 'agent' : 'agentów'} · ${money}`, look }
}

const ITEM_WORD: Record<string, string> = { done: 'ukończone', pending: 'oczekuje', running: 'w toku', failed: 'błąd albo timeout', unknown: 'stan nieznany' }

// What the pane and the chip draw of an agent, as drawn: its context in the band's own words
const drawnOf = (a: AgentRun) => [a.id, a.status, a.steps, tokens(a.context), a.model, a.endedAt ?? null]

const STATUS_WORD: Record<AgentRun['status'], string> = { running: '● działa', done: '✓ zakończony', stopped: '■ przerwany', failed: '✗ błąd' }
const STATUS_COLOR: Record<AgentRun['status'], string> = { running: THEME.mark, done: THEME.ok, stopped: THEME.body, failed: THEME.accentText }

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const here = await $.session.cwd()
    const root = await relaiRoot($, here)
    isRelai = root !== null
    cwd = root ?? here
    // Registered everywhere, so outside RelAI the command can say so in one sentence
    await $.command.register({ name: 'relai-agents', description: 'Panel agentów RelAI: uruchomieni i zakończeni, model, kontekst i koszt' }).catch(() => undefined)
    if (!isRelai) return next(e)
    await refresh($, true)
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => { refresh($).catch(() => undefined) })
    }
    return next(e)
  })

  on('command.run', { command: 'relai-agents' }, async ($) => {
    // Typed right after a reload, before session.start has found the root: look once more first
    if (!isRelai) {
      const root = await relaiRoot($, await $.session.cwd())
      if (root !== null) {
        isRelai = true
        cwd = root
      }
    }
    if (!isRelai) return { text: 'Ten folder nie jest projektem RelAI, więc panel agentów nie ma czego pokazać.' }
    return { text: await togglePane($) }
  })

  // A box ticked by an edit shows at once, not at the next tick — after the tool's answer has gone
  // back, never holding it (Z4)
  on('tool.call', { tool: EDIT_TOOLS }, async ($, e, next) => {
    const r = await next(e)
    if (isRelai) $.clock.after(0, () => { refresh($).catch(() => undefined) })
    return r
  }).catch(($, e, next) => next(e))

  on('agent.spawn', async ($, e, next) => {
    const started = await next(e)
    if (!isRelai || started.deny !== undefined || !started.agentId) return started
    const id = started.agentId
    const at = await $.clock.now()
    await update($, agents, (list) => spawned(list, { id, type: e.subagentType, description: e.description, model: started.model, at }))
    return started
  }).catch(($, e, next) => next(e))

  on('turn.step', async function* ($, e, next) {
    const result = yield* next(e)
    const id = e.agentId
    if (!isRelai || !id || !result || !result.usage) return result
    const usage = result.usage
    // Written only when something drawn moved (Z4): the pane's and the chip's words, not each token
    const list = await read($, agents)
    const after = stepped(list, id, usage)
    if (JSON.stringify(after.map(drawnOf)) !== JSON.stringify(list.map(drawnOf))) await update($, agents, () => [...after])
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!isRelai) return r
    const id = e.agentId
    if (id) {
      const at = await $.clock.now()
      await update($, agents, (list) => [...finished(list, id, e.reason, at)])
      // relai-panel writes the agent's measurements when its turn ends: the pane reads them again
      $.clock.after(1_000, () => { $.ui.invalidate('ui.render') })
    } else {
      await refresh($)
    }
    return r
  })

  // The pane in relai-panel's motif (calibration 2026-10-09): a Kalam heading per section, one
  // line saying what it holds, then rounded cards in THEME colors; the terminal gets the same
  // text in the same colors, framed only where a frame carries meaning
  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {
    const el = $.ui.resolve(e)
    const { Box, Text, Button } = el
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null
    const isGui = e.surface !== 'terminal'
    const list = await read($, agents)
    const folded = await read($, isDoneCollapsed)
    const { cost, total, isPartial, records, pricing } = await agentCosts($, list)
    const now = await $.clock.now()
    const { running, finished: done } = counts(list)

    const heading = (key: string) => {
      const art = HEADING_ART[key]
      if (Svg && art) return <Svg key={`h-${key}`} source={art.svg} alt={art.text} width={art.width} height={art.height} />
      return <Text bold color={THEME.mark}>{art?.text ?? key}</Text>
    }
    const section = (key: string, head: string, about: string, items: RenderChildren[]) => (
      <Box key={key} flexDirection="column" gap={isGui ? 1 : 0}>
        {heading(head)}
        <Text key={`${key}-about`} color={THEME.body} wrap="wrap">{about}</Text>
        {items}
      </Box>
    )
    const frame = isGui ? { borderStyle: 'round' as const } : {}

    // Records there but no price for their model is not "no measurement" (live 2026-10-09)
    const money = (a: AgentRun, c: ReturnType<typeof cost>) => {
      if (c === null) return 'brak pomiaru'
      if (c.usd === null) return `brak ceny dla ${a.model}`
      return `${usd(c.usd)}${c.isPartial ? ' (suma częściowa)' : ''}`
    }
    const card = (a: AgentRun) => {
      const c = cost(a)
      const time = duration((a.endedAt ?? now) - a.at)
      return (
        <Box key={`agent-${a.id}`} flexDirection="row" alignItems="center" columnGap={2} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
          {...frame} borderColor={a.status === 'running' ? THEME.mark : THEME.line} backgroundColor={THEME.card}>
          <Box key="text" flexDirection="column" flexGrow={1} flexShrink={1}>
            <Box key="head" flexDirection="row" flexWrap="wrap" columnGap={1}>
              <Text bold color={STATUS_COLOR[a.status]}>{STATUS_WORD[a.status]}</Text>
              <Text bold color={THEME.title} wrap="truncate">{clip(a.description || a.type, 60)}</Text>
            </Box>
            <Text key="meta" color={THEME.body} wrap="wrap">{`${a.type} · ${a.model} · ${a.steps} wyw. · kontekst ${tokens(a.context)} · ${time}`}</Text>
          </Box>
          <Box key="cost" flexDirection="column" alignItems="flex-end" flexShrink={0}>
            <Text color={THEME.body}>koszt</Text>
            <Text bold color={c !== null && c.usd !== null ? THEME.title : THEME.accentText}>{money(a, c)}</Text>
          </Box>
        </Box>
      )
    }

    const p = await read($, progress)
    // Every item with its full name and its state: what a segment of the bar shows on hover. The
    // next item to tick stands out, as on the bar when nothing is hovered.
    const upcoming = p?.items.find((it) => it.status !== 'done')
    const taskRow = (it: Progress['items'][number]) => {
      const isNext = it === upcoming
      const color = it.status === 'done' ? THEME.ok : it.status === 'failed' ? THEME.accentText : isNext ? THEME.mark : THEME.body
      return (
        <Box key={`task-${it.id}`} flexDirection="row" columnGap={1} paddingX={1} {...(isNext && isGui ? { backgroundColor: THEME.cardOn } : {})}>
          <Box key="mark" flexShrink={0}><Text bold color={color}>{BAR.tile[it.status].mark}</Text></Box>
          <Box key="name" flexGrow={1} flexShrink={1}><Text color={it.status === 'done' || isNext ? THEME.title : THEME.body} wrap="wrap">{it.name}</Text></Box>
          <Box key="state" flexShrink={0}><Text color={color}>{isNext ? 'następny' : ITEM_WORD[it.status] ?? it.status}</Text></Box>
        </Box>
      )
    }
    const tasks = p && p.items.length
      ? section('tasks', 'progress', `${p.title} · ${p.words}`, [
          <Box key="tasks-card" flexDirection="column" gap={0} paddingY={isGui ? 1 : 0} {...frame} borderColor={THEME.line} backgroundColor={THEME.card}>
            {p.items.map(taskRow)}
          </Box>,
        ])
      : null

    const live = list.filter((a) => a.status === 'running').reverse()
    const ended = list.filter((a) => a.status !== 'running').reverse()
    const sum = total === null ? 'brak pomiaru' : `${usd(total)}${isPartial ? ' (suma częściowa)' : ''}`
    const agentItems: RenderChildren[] = list.length === 0
      ? [<Text key="empty" color={THEME.body}>Ta sesja nie uruchomiła jeszcze żadnego subagenta.</Text>]
      : [...live.map(card)]
    if (ended.length) {
      agentItems.push(<Box key="fold" flexDirection="row"><Button key="fold-btn" variant="secondary" label={`${folded ? '▸' : '▾'} Zakończeni · ${ended.length}`} onPress={() => update($, isDoneCollapsed, (x) => !x)} /></Box>)
      if (!folded) agentItems.push(...ended.map(card))
    }
    const about = `${running} działa, ${done} zakończonych · koszt ${sum} — z pomiarów relai-panel, cennik z ${pricing.date}.`
      + (records === null ? ' Brak pliku pomiarów tej sesji: relai-panel jej nie mierzy.' : '')
      + (pricing.error ? ` Cennik projektu pominięty — ${pricing.error}; liczę cennikiem wbudowanym.` : '')
    return (
      <Box key="relai-agents" flexDirection="column" gap={isGui ? 2 : 1}>
        {tasks ? [tasks] : []}
        {section('summary', 'agents', about, agentItems)}
      </Box>
    )
  })

  // One band instance for every plugin: our card above whatever the plugins beneath draw, never
  // instead of it; no width on the wrapper (the engine refuses its own node under one, P-017)
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isRelai || e.props.hasSurvey) return next(e)
    const p = await read($, progress)
    if (p === null) return next(e)
    const below = await next(e)
    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in ui ? ui.Svg : null
    const isGui = e.surface !== 'terminal'
    const columns = e.props.bodyColumns
    const isNarrow = columns < BAR.narrow
    const list = await read($, agents)
    const tick = await read($, ticked)
    const clockNow = await $.clock.now()
    const chip = list.length ? agentsChip(list, await agentCosts($, list)) : null
    const figure: [string, string] | null = p.items.length ? [`${p.done}/${p.total}`, unitOf(p)] : null

    // The middle column's cells: the card's padding and corners, then the label and figure columns
    // with their gaps when they stand beside it; the chip beside the segments takes its own
    const middle = Math.max(MIN_SEGMENT_CELLS, columns - 2 - (isGui ? 2 : 0) - (isNarrow ? 0 : BAR.labelColumn + BAR.figureColumn + 2 * COLUMN_GAP))
    const chipCells = chip ? chip.text.length + 2 + COLUMN_GAP : 0
    const isChipBeside = chip !== null && middle - chipCells >= Math.max(MIN_SEGMENT_CELLS, p.items.length)
    const cells = isChipBeside ? middle - chipCells : middle
    const calm = calmLine(p.items)
    const alt = `${p.title} · ${figure ? figure.join(' ') : p.words}: ${p.items.map((it) => `${BAR.tile[it.status].mark} ${it.name}`).join(', ')}`
    const art = Svg ? segmentArt(p.items.map((it, i) => ({
      color: BAR.segment[it.status],
      hover: itemLine(BAR.tile[it.status].mark, i + 1, p.items.length, it.name),
    })), { background: BAND.progress.bg, text: BAR.text, muted: BAR.muted, calm, chars: Math.floor((cells * CELL_PX) / LINE_TEXT_PX) }) : null

    const chipBox = chip
      ? <Box key="agents-chip" flexShrink={0} paddingX={1} backgroundColor={chip.look.bg}><Text color={chip.look.color}>{chip.text}</Text></Box>
      : null
    // Beside the segments when both fit, else on a row of its own under the line
    const beside = isChipBeside ? chipBox : null
    const rows: RenderChildren[] = []
    if (p.items.length === 0) {
      rows.push(<Box key="first" flexDirection="row" flexWrap="wrap" columnGap={COLUMN_GAP}>
        <Box key="words" flexShrink={1}><Text color={BAR.muted} wrap="truncate">{p.words}</Text></Box>
        {chipBox}
      </Box>)
    } else if (Svg && art !== null) {
      // The Svg alone in a column of its own, the chip beside it (P-021 pkt 3: an interactive Svg
      // in a row next to text shrinks to its frame's default width)
      rows.push(<Box key="first" flexDirection="row" alignItems="flex-start" columnGap={COLUMN_GAP}>
        <Box key="segments" flexDirection="column" flexGrow={1} flexShrink={1}>
          <Svg isInteractive source={art} alt={alt} height={SEGMENTS_HEIGHT} />
        </Box>
        {beside}
      </Box>)
    } else {
      const text = segmentText(p.items.map((it) => BAR.segment[it.status]), cells)
      rows.push(<Box key="first" flexDirection="row" columnGap={COLUMN_GAP}>
        <Box key="segments" flexDirection="row" flexWrap="wrap" flexShrink={1} columnGap={text.gap}>
          {text.runs.map((r, i) => <Box key={`seg-${p.items[i]?.id ?? i}`}><Text color={r.color}>{r.text}</Text></Box>)}
        </Box>
        {beside}
      </Box>)
      rows.push(<Box key="line"><Text color={BAR.muted} wrap="truncate">{calm}</Text></Box>)
    }
    if (p.items.length && chipBox && !isChipBeside) rows.push(<Box key="chip-row" flexDirection="row">{chipBox}</Box>)
    // The second row, only while its reason lasts: the box just ticked, for TICKED_MS
    if (tick !== null && clockNow - tick.at < TICKED_MS) {
      rows.push(<Box key="ticked-row" flexDirection="row">
        <Box key="ticked" flexShrink={1} paddingX={1} backgroundColor={BAR.tile.done.bg}>
          <Text color={BAND.progress.color} wrap="truncate">{itemLine(BAR.tile.done.mark, tick.index, tick.total, tick.name)}</Text>
        </Box>
      </Box>)
    }

    const ours = barCard(ui, BAR, isGui, columns, 'relai-progress-card', BAND.progress, rows, figure, 'flex-start')
    if (!below) return ours
    return <Box key="relai-progress" flexDirection="column" gap={e.surface === 'terminal' ? 0 : 1}>{[ours, below]}</Box>
  })
}
