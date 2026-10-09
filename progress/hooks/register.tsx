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
import { hoverSegments, segmentText } from './core/charts.mjs'
import type { Progress } from './core/progress.mjs'
import { ancestors, planState } from './core/plan-state.mjs'
import { agentCost, agentsLabel, counts, finished, spawned, stepped } from './core/agents.mjs'
import type { AgentRun } from './core/agents.mjs'
import { isFileOf, parseRecords } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { PRICING, priceRecord } from './core/pricing.mjs'
import { BAND, BAR, THEME } from './core/theme.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { clip, duration, join, tokens, usd } from './fmt'

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

// The newest /relai-crew run (run ids sort by time), if any is live
async function readCrew($: $T): Promise<Progress | null> {
  const dir = join(cwd, CREW_DIR)
  if (!(await $.fs.exists(dir).catch(() => false))) return null
  const runs = (await $.fs.list(dir).catch(() => [])).filter((x) => x.kind === 'dir').map((x) => x.name).sort()
  const run = runs[runs.length - 1]
  if (!run) return null
  const [tasks, manifest] = await Promise.all([readText($, join(dir, `${run}/zadania.json`)), readText($, join(dir, `${run}/manifest.json`))])
  return crewProgress(run, tasks, manifest, await $.clock.now())
}

async function readProgress($: $T): Promise<Progress> {
  const claude = await readText($, join(cwd, 'CLAUDE.md'))
  const plan = await planState(claude, (rel) => readText($, join(cwd, rel)))
  let promptText: string | null = null
  let link: string | null = null
  if (plan.kind === 'ok' && plan.stage) {
    const statusMd = await readText($, join(cwd, plan.statusPath))
    link = statusMd === null ? null : promptLink(statusMd, plan.stage.id, plan.statusPath)
    promptText = link === null ? null : await readText($, join(cwd, link))
  }
  return pick(await readCrew($), stageProgress(plan, promptText, link ?? 'prompt'))
}

// Reads the files again; writes the value only when it changed, so an idle tick redraws nothing
async function refresh($: $T) {
  if (!isRelai) return
  const now = await readProgress($)
  const was = await read($, progress)
  if (JSON.stringify(was) !== JSON.stringify(now)) await update($, progress, () => now)
}

// This session's records of relai-panel's collector; [] when it does not measure this session
async function sessionRecords($: $T): Promise<MeasureRecord[] | null> {
  const dir = join(cwd, MEASURE_DIR)
  if (!(await $.fs.exists(dir).catch(() => false))) return null
  const session = await $.session.id().catch(() => '')
  const file = (await $.fs.list(dir).catch(() => [])).find((x) => x.kind === 'file' && isFileOf(x.name, session))
  if (!file) return null
  return parseRecords(await readText($, join(dir, file.name))).records
}

async function togglePane($: $T): Promise<string> {
  if ((await $.ui.panes()).some((p) => p.id === PANE_ID)) {
    await $.ui.close({ id: PANE_ID })
    return 'Panel agentów zamknięty.'
  }
  const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })
  return opened.isPlaced ? 'Panel agentów otwarty.' : `Panel agentów czeka na miejsce: ${opened.reason}`
}

type Look = { label: string, color: string, bg: string }
type Resolved = Parameters<$T['ui']['resolve']>[0]
type Children = Parameters<ReturnType<$T['ui']['resolve']>['Box']>[0]['children']

// The progress bar (calibration 2026-10-09, "Pola i segmenty"): the label and the stage on the
// first row; below, one bar cut into a segment per item, each in the color of its own state, and
// the count with the percent at its end. A soft background of its own, no colored frame (BAND,
// BAR; docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md). The desktop draws the segments in Svg —
// a Box is a whole text row high — and the terminal as cells of text.
const CELL_PX = 8 // a desktop cell, about (savvy-progress reckons the same)
const TEXT_PX = 6.8 // the mean advance of a 12 px Segoe UI character, about
const PANEL_BUTTON_CELLS = 16 // "Panel RelAI" as a native button, and a gap

const ITEM_WORD: Record<string, string> = { done: 'ukończone', pending: 'oczekuje', running: 'w toku', failed: 'błąd albo timeout', unknown: 'stan nieznany' }

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
    await refresh($)
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

  // A box ticked by an edit shows at once, not at the next tick
  on('tool.call', { tool: EDIT_TOOLS }, async ($, e, next) => {
    const r = await next(e)
    if (isRelai) await refresh($).catch(() => undefined)
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
    await update($, agents, (list) => [...stepped(list, id, usage)])
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!isRelai) return r
    const id = e.agentId
    if (id) {
      const at = await $.clock.now()
      await update($, agents, (list) => [...finished(list, id, e.reason, at)])
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
    const records = await sessionRecords($)
    const now = await $.clock.now()
    const { running, finished: done } = counts(list)
    const cost = (a: AgentRun) => (records === null ? null : agentCost(records, a.id, priceRecord))
    const costs = list.map(cost)
    const known = costs.filter((c) => c !== null && c.usd !== null).map((c) => c?.usd ?? 0)
    const total = known.length ? known.reduce((s, x) => s + x, 0) : null
    const isPartial = costs.some((c) => c === null || c.isPartial)

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
    const about = `${running} działa, ${done} zakończonych · koszt ${sum} — z pomiarów relai-panel, cennik z ${PRICING.date}.`
      + (records === null ? ' Brak pliku pomiarów tej sesji: relai-panel jej nie mierzy.' : '')
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
    const { Box, Text, Button } = ui
    const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in ui ? ui.Svg : null
    const isGui = e.surface !== 'terminal'
    const list = await read($, agents)
    const { running } = counts(list)
    // The side pane of RelAI is relai-panel's: its command opens it, when that plugin runs here
    const hasPanel = (await $.command.list().catch(() => [])).some((c) => c.name === 'relai-panel')
    const openPanel = hasPanel
      ? <Button key="open-panel" label="Panel RelAI" variant="secondary" onPress={() => { $.command.run({ command: 'relai-panel', args: '' }).catch(() => undefined) }} />
      : null
    const colors = p.items.map((it) => BAR.segment[it.status])
    const count = p.percent === null ? p.words : `${p.done} z ${p.total} · ${p.percent.toFixed(2)}%`
    const cells = Math.max(6, e.props.bodyColumns - 2 - (isGui ? 2 : 0))
    // Hovering a segment shows its item; with none hovered, the next item to tick (calibration 2026-10-09)
    const upcoming = p.items.find((it) => it.status !== 'done')
    const idle = upcoming ? [`Następny: ${upcoming.label} · najedź na segment, żeby zobaczyć inny punkt`, upcoming.name] : ['Wszystkie punkty odhaczone', '']
    const art = Svg ? hoverSegments(p.items.map((it, i) => ({
      color: BAR.segment[it.status],
      head: `${BAR.tile[it.status].mark} ${i + 1}/${p.items.length} · ${ITEM_WORD[it.status] ?? it.status} — ${it.label}`,
      detail: it.name,
    })), { background: BAND.progress.bg, text: BAR.text, muted: BAR.muted, idle, chars: Math.floor(((cells - (hasPanel ? PANEL_BUTTON_CELLS : 0)) * CELL_PX) / TEXT_PX) }) : null
    const text = segmentText(colors, cells)
    const bar = colors.length === 0 ? null
      : Svg && art !== null
        ? <Svg key="segments" isInteractive source={art.svg} alt={`${count}: ${p.items.map((it) => `${BAR.tile[it.status].mark} ${it.name}`).join(', ')}`} height={art.height} />
        : <Box key="segments" flexDirection="row" flexWrap="wrap" columnGap={text.gap}>
            {text.runs.map((r, i) => <Box key={`seg-${p.items[i]?.id ?? i}`}><Text color={r.color}>{r.text}</Text></Box>)}
          </Box>
    const controls = [
      ...(list.length ? [<Button key="agents-btn" label={agentsLabel(list)} variant="secondary" onPress={() => { togglePane($).catch(() => undefined) }} />] : []),
    ]
    const frame = isGui ? { borderStyle: 'round' as const, borderColor: BAND.progress.bg } : {}
    const ours = (
      <Box key="relai-progress-card" flexDirection="column" backgroundColor={BAND.progress.bg} paddingX={1} {...frame}>
        {/* A native button is taller than a line: a row of margin keeps "Agenci" off the bar (calibration 2026-10-09) */}
        <Box key="head" flexDirection="row" flexWrap="wrap" justifyContent="space-between" alignItems="center" columnGap={2} {...(isGui ? { marginBottom: 1 } : {})}>
          <Box key="title-row" flexDirection="row" flexWrap="wrap" columnGap={2} flexShrink={1}>
            <Box key="label"><Text bold color={BAND.progress.color}>{BAND.progress.label}</Text></Box>
            <Box key="title"><Text bold color={BAR.text} wrap="truncate">{clip(p.title, 80)}</Text></Box>
          </Box>
          <Box key="controls" flexDirection="row" alignItems="center" columnGap={2} flexShrink={0}>
            {controls}
            {openPanel && !(isGui && Svg && art !== null) ? openPanel : null}
            <Box key="words"><Text color={BAR.muted}>{count}</Text></Box>
          </Box>
        </Box>
        <Box key="track" flexDirection="column">
          {bar ? <Box key="bar" flexDirection="column">{bar}</Box> : null}
          {/* On the desktop the button sits in the bottom-right corner over the bar's info lines,
              not on a row of its own (calibration 2026-10-09); the lines are cut short of it */}
          {openPanel && isGui && Svg && art !== null ? <Box key="foot" position="absolute" right={0} bottom={0}>{openPanel}</Box> : null}
        </Box>
      </Box>
    )
    if (!below) return ours
    return <Box key="relai-progress" flexDirection="column" gap={e.surface === 'terminal' ? 0 : 1}>{[ours, below]}</Box>
  })
}
