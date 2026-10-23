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
import type { Progress } from './core/progress.mjs'
import { retone } from './skin'
import { ancestors, planState } from './core/plan-state.mjs'
import { agentCost, counts, describeTool, finished, spawned, stepped, toolStep, upgraded } from './core/agents.mjs'
import type { AgentRun } from './core/agents.mjs'
import { isFileOf, parseRecords } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { PRICE_FILE, newest, parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import type { Version } from './core/pricing.mjs'
import { BAND, BAR, BAR_LOOK, THEME } from './core/theme.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { clip, duration, join, tokens, usd } from './fmt'
import { barCard, barRule } from './bar-card'
import { stepRows } from './steps'
import { branchProgress, cardPathOf, countedOf, executorTool, focusPath, isBranchProgress, parseFocus, statusPathOf, workOf } from './focus'

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
// The list of steps (WYGLAD_PANELU E2): expanded or not, and its done ones unfolded — for the
// session, collapsed by default (plan, risk 4)
const isListOpen = atom({ plugin: 'relai-progress', key: 'isListOpen' } as const, false)
const isListDoneShown = atom({ plugin: 'relai-progress', key: 'isListDoneShown' } as const, false)
// The box that just turned done: its row flashes once and its mark fills (plan, section 5). In
// $.state with its time, so a reload keeps it and it ends by the clock even without its timer.
type Fresh = { id: string, at: number }
const fresh = atom({ plugin: 'relai-progress', key: 'fresh' } as const, null as Fresh | null)
const FLASH_MS = 1_400

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
  let activeStatus: string | null = null
  const active = await planState(claude, async (rel) => { activeStatus = await text(join(cwd, rel)); return activeStatus })
  // The session's focus (AUDYT_MODOW Z12): relai-panel writes it, this bar counts its work — a
  // thread's packets, the stage its prompt named, else the active plan's stage as before
  const id = await $.session.id().catch(() => '')
  readFor = id
  const focus = id ? parseFocus(await text(join(cwd, focusPath(id)))) : null
  const focusText = focus?.kind === 'branch' ? await text(join(cwd, cardPathOf(focus.card)))
    : focus?.kind === 'plan' ? await text(join(cwd, statusPathOf(focus.plan))) : null
  const work = workOf({ focus, active, activeTool: executorTool(activeStatus), focusText })
  const crew = await readCrew($, text)
  if (focus?.kind === 'branch' && !work.isAsking) {
    const own = branchProgress(focusText) ?? { kind: 'stage' as const, title: work.label, done: 0, total: 0, percent: null, items: [], words: 'karta bez paczek do odhaczenia' }
    watched = [...new Set(paths)]
    return pick(crew, own)
  }
  const plan = work.plan
  let promptText: string | null = null
  let link: string | null = null
  if (plan.kind === 'ok' && plan.stage) {
    const statusMd = focus?.kind === 'plan' ? focusText : activeStatus
    link = statusMd === null ? null : promptLink(statusMd, plan.stage.id, plan.statusPath)
    promptText = link === null ? null : await text(join(cwd, link))
  }
  watched = [...new Set(paths)]
  return pick(crew, stageProgress(countedOf(focus, plan), promptText, link ?? 'prompt'))
}

// Reads the files again when one moved (or always, when forced); writes the value only when it
// changed, so an idle tick redraws nothing
// A crew run is live for a window of time (crewProgress): shown, it is read again every
// CREW_RECHECK_MS even when no file moved, so a run that died leaves the bar
const CREW_RECHECK_MS = 5 * 60_000
let crewReadAt = 0

// The last box of the new list that was not done in the old one and is now; null when none (or
// when the list is another one: other ids)
function freshOf(was: Progress | null, now: Progress, at: number): Fresh | null {
  if (was === null) return null
  const before = new Map(was.items.map((it) => [it.id, it.status]))
  for (let i = now.items.length - 1; i >= 0; i--) {
    const it = now.items[i]
    const old = it ? before.get(it.id) : undefined
    if (it && it.status === 'done' && old !== undefined && old !== 'done') return { id: it.id, at }
  }
  return null
}

// Clears the fresh box past its flash: called by the timer set when it appeared and by every tick
// (a reload drops the timer, never the state)
async function expireFresh($: $T, clockNow: number) {
  const f = await read($, fresh)
  if (f !== null && clockNow - f.at >= FLASH_MS) await update($, fresh, () => null)
}

// The session the last read was for (Z12): after /clear the id changes with no session.start and
// the focus file is another one, so the first tick of the new session reads anew
let readFor = ''

async function refresh($: $T, isForced = false) {
  if (!isRelai) return
  if ((await $.session.id().catch(() => readFor)) !== readFor) isForced = true
  const clockNow = await $.clock.now()
  await expireFresh($, clockNow)
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
  const tick = isForced ? null : freshOf(was, now, clockNow)
  if (tick === null) return
  await update($, fresh, () => tick)
  $.clock.after(FLASH_MS, () => { $.clock.now().then((t) => expireFresh($, t)).catch(() => undefined) })
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

const COLUMN_GAP = 2 // cells between the grid's columns (brief, 5)
const MIN_SEGMENT_CELLS = 10 // the narrowest the terminal's segments are drawn

// The unit after `a/b`, one format for all the bars (brief, 3): 1 punktu, 14 punktów; a crew's tasks
// and a thread's packets (Z12): 1 paczki, 9 paczek
const unitOf = (p: Progress) => (p.kind === 'crew' ? (p.total === 1 ? 'zadania' : 'zadań')
  : isBranchProgress(p) ? (p.total === 1 ? 'paczki' : 'paczek') : (p.total === 1 ? 'punktu' : 'punktów'))

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
    // A list kept by 0.5.0 has no roles, names, colours or tool steps yet (AGENTS_KRABY P3)
    await update($, agents, (list) => upgraded(list))
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

  // A subagent's tool call: the card's live line and its list of steps (AGENTS_KRABY P3). Written
  // without waiting, so the call itself never waits on the pane; one unfiltered hook, as any tool
  on('tool.call', async ($, e, next) => {
    const id = e.agentId
    if (isRelai && id) {
      const step = describeTool(String(e.tool), e as unknown as Record<string, unknown>, cwd)
      update($, agents, (list) => [...toolStep(list, id, step)]).catch(() => undefined)
    }
    return next(e)
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
    // Both appearances of the app (WYGLAD_PANELU E4): texts and frames in theme keys, drawings two-tone
    return retone(
      <Box key="relai-agents" flexDirection="column" gap={isGui ? 2 : 1}>
        {tasks ? [tasks] : []}
        {section('summary', 'agents', about, agentItems)}
      </Box>,
    )
  })

  // One band instance for every plugin: our card above whatever the plugins beneath draw, never
  // instead of it; no width on the wrapper (the engine refuses its own node under one, P-017).
  // The middle is the list of steps (steps.tsx, WYGLAD_PANELU E2); the label and the figure stand
  // at its top, as the list grows under the line.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!isRelai || e.props.hasSurvey) return next(e)
    const p = await read($, progress)
    if (p === null) return next(e)
    const below = await next(e)
    const ui = $.ui.resolve(e)
    const { Box } = ui
    const isGui = e.surface !== 'terminal'
    const columns = e.props.bodyColumns
    const list = await read($, agents)
    const f = await read($, fresh)
    const clockNow = await $.clock.now()
    const figure: [string, string] | null = p.items.length ? [`${p.done}/${p.total}`, unitOf(p)] : null
    // The middle column's cells: the card's padding, then the label and figure columns with their
    // gaps when they stand beside it
    const cells = Math.max(MIN_SEGMENT_CELLS, columns - 2 - (columns < BAR.narrow ? 0 : BAR.labelColumn + BAR.figureColumn + 2 * COLUMN_GAP))
    const rows = stepRows(ui, isGui, {
      progress: p,
      isOpen: await read($, isListOpen),
      isDoneShown: await read($, isListDoneShown),
      // the flash only while its box is still done (unticked within it, or another list: none)
      freshId: f !== null && clockNow - f.at < FLASH_MS && p.items.some((it) => it.id === f.id && it.status === 'done') ? f.id : null,
      isWorking: e.props.isWorking,
      agents: list.length ? { count: list.length, isRunning: counts(list).running > 0 } : null,
      columns,
      cells,
      onToggle: () => { update($, isListOpen, (x) => !x).catch(() => undefined) },
      onFold: () => { update($, isListDoneShown, (x) => !x).catch(() => undefined) },
    })
    const ours = barCard(ui, BAR_LOOK, isGui, columns, 'relai-progress-card', BAND.progress, rows, figure, 'flex-start')
    if (!below) return ours
    // No gap: on the desktop the rule under the card brings the air (variant 3b)
    return <Box key="relai-progress" flexDirection="column">{[ours, barRule(ui, BAR_LOOK, isGui, below), below]}</Box>
  })
}
