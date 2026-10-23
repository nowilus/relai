// relai-progress: the RelAI Agents pane (odnoga AGENTS_KRABY, P4, 2026-10-23).
//
// Inspired by Helper Desk by Ben AI (benai-mods, no license; nothing copied, review in
// docs/DZIENNIK.md 2026-10-23): one live card per subagent with its character, what it does now,
// its last steps and a moving bar, the cards in groups, tiles above them. What differs: each agent
// is a role — its own animal dressed for the job, its colour on one piece, a name from the role's
// pool (core/mascots.mjs); the cost comes from relai-panel's measurements and the project's price
// list, never counted here; the progress of the stage stays in the bar above the prompt.
//
// No `$` here (P-023 pkt 10): register.tsx passes the element table, the values and what a press
// does. Text that may be cut stands in a Box with a zero basis (width 0 + flexGrow), so a long task
// never widens the card past the pane (P-043). Colours of texts and frames are THEME colours; the
// retone pass turns them into theme keys. The agent's own colour lives only in the drawings.

import type { Elements, RenderChildren } from 'claude-code'
import type { AgentRun, ToolStep } from './core/agents.mjs'
import { TOOL_KIND_WORD } from './core/agents.mjs'
import { AGENT_HUES, MASCOT, ROLES, STILL_FRAME, cardBarSvg, mascotGlyph, mascotSvg } from './core/mascots.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { THEME } from './core/theme.mjs'
import { clip, duration, tokens, usd } from './fmt'

type AnyTable = Elements[keyof Elements]
type Cost = { usd: number | null, isPartial: boolean, records: number } | null
export type GroupKey = 'running' | 'done' | 'broken'

export type AgentsPane = {
  list: readonly AgentRun[]
  now: number
  columns: number
  cost: (a: AgentRun) => Cost
  sum: string // the agents' cost in words: "$0.42", "$0.42 (suma częściowa)", "brak pomiaru"
  about: string // where the cost comes from, the price list's date, what is missing
  folded: readonly GroupKey[]
  openSteps: readonly string[] // ids of the agents whose every step is shown
  onFold: (g: GroupKey) => void
  onSteps: (id: string) => void
}

/** How many cards a group draws; the rest is one line (DESIGN.md 9: lists with a limit). */
export const GROUP_LIMIT = 12
/** Columns the character takes beside a card's text. */
const PET_COLUMNS = 10
/** The terminal glyph's columns. */
const GLYPH_COLUMNS = MASCOT.terminalWidth + 1
/** Steps under the live line while the full list is closed. */
const HISTORY = 3

const STATUS_WORD: Record<AgentRun['status'], string> = { running: '● działa', done: '✓ zakończony', stopped: '■ przerwany', failed: '✗ błąd' }
const STATUS_COLOR: Record<AgentRun['status'], string> = { running: THEME.mark, done: THEME.ok, stopped: THEME.body, failed: THEME.accentText }
const GROUP_WORD: Record<GroupKey, string> = { running: 'Działają', done: 'Zakończeni', broken: 'Przerwani' }

const groupOf = (a: AgentRun): GroupKey => (a.status === 'running' ? 'running' : a.status === 'done' ? 'done' : 'broken')
const stepsWord = (n: number) => `${n} ${n === 1 ? 'krok' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'kroki' : 'kroków'}`

/** The time the session's agents have run: from the first start to now, or to the last end. */
export function agentsTime(list: readonly AgentRun[], now: number): string | null {
  if (!list.length) return null
  const start = Math.min(...list.map((a) => a.at))
  const isRunning = list.some((a) => a.status === 'running')
  const end = isRunning ? now : Math.max(...list.map((a) => a.endedAt ?? a.at))
  return duration(end - start)
}

/** What the card says the agent does: the live step while it runs, the outcome once it stopped. */
export function leadOf(a: AgentRun): string {
  const last = a.tools[a.tools.length - 1]
  if (a.status === 'running') return `Krok ${a.calls} · ${last?.live ?? 'zaczyna'}`
  if (a.status === 'done') return `Skończył · ${stepsWord(a.calls)}`
  if (a.status === 'stopped') return `Przerwany · ${stepsWord(a.calls)}`
  return `Błąd przed końcem · ${stepsWord(a.calls)}`
}

export function agentsPane(el: AnyTable, isGui: boolean, p: AgentsPane): RenderChildren {
  const { Box, Text, Button } = el
  const Svg = isGui && 'Svg' in el ? el.Svg : null
  const frame = isGui ? { borderStyle: 'round' as const } : {}
  const textColumns = Math.max(16, p.columns - (isGui ? 6 : 4) - (Svg ? PET_COLUMNS : GLYPH_COLUMNS))
  // About 7 CSS pixels a column on the desktop; the Box holds the drawing to its width
  const barPx = Math.max(60, Math.min(640, textColumns * 7))

  const cut = (key: string, color: string, words: string, o: { isBold?: boolean, grow?: number } = {}) =>
    <Box key={key} flexGrow={o.grow ?? 1} flexShrink={1} width={0}><Text bold={o.isBold === true} color={color} wrap="truncate">{words}</Text></Box>

  const heading = (() => {
    const art = HEADING_ART.agents
    if (Svg && art) return <Svg key="h-agents" source={art.svg} alt={art.text} width={art.width} height={art.height} />
    return <Text key="h-agents" bold color={THEME.mark}>{art?.text ?? 'Agenci sesji'}</Text>
  })()

  // Tiles: only figures the measurements and the list hold, never a guessed one
  const time = agentsTime(p.list, p.now)
  const tiles = [
    { key: 'cost', label: 'Koszt agentów', value: p.sum },
    { key: 'context', label: 'Kontekst agentów (suma)', value: tokens(p.list.reduce((s, a) => s + a.context, 0)) },
    ...(time ? [{ key: 'time', label: 'Czas pracy', value: time }] : []),
  ]
  const tileRow = p.list.length
    ? <Box key="tiles" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={isGui ? 1 : 0}>
        {tiles.map((t) => (
          <Box key={`tile-${t.key}`} flexDirection="column" flexGrow={1} flexShrink={1} minWidth={18} paddingX={1} {...frame} borderColor={THEME.line}>
            <Text key="label" color={THEME.body} wrap="truncate">{t.label}</Text>
            <Text key="value" bold color={THEME.title} wrap="truncate">{t.value}</Text>
          </Box>
        ))}
      </Box>
    : null

  const pet = (a: AgentRun) => {
    const hue = AGENT_HUES[a.hue % AGENT_HUES.length]
    const role = ROLES[a.role] ?? ROLES.worker
    if (Svg) {
      const isWalking = a.status === 'running'
      const still = a.status === 'done' ? STILL_FRAME.done : STILL_FRAME.failed
      // Two agents in step would look like one animation: each starts at its own place in the round
      const phase = (a.at % 997) / 997
      return <Box key="pet" width={PET_COLUMNS} flexShrink={0}>
        <Svg source={mascotSvg(a.role, a.hue, { isWalking, phase, still })} alt={`${a.name}, ${role.animal} — ${role.role}, kolor ${hue?.name ?? ''}`} width={MASCOT.width} height={MASCOT.height} />
      </Box>
    }
    const [top, bottom] = mascotGlyph(0)
    return <Box key="pet" width={GLYPH_COLUMNS} flexShrink={0} flexDirection="column">
      <Text key="g1" color={hue?.color}>{top}</Text>
      <Text key="g2" color={hue?.color}>{bottom}</Text>
    </Box>
  }

  const money = (a: AgentRun, c: Cost) => {
    if (c === null) return 'brak pomiaru'
    if (c.usd === null) return `brak ceny dla ${a.model}`
    return `${usd(c.usd)}${c.isPartial ? ' (suma częściowa)' : ''}`
  }

  const stepRow = (a: AgentRun, s: ToolStep, i: number) => (
    <Box key={`s-${i}`} flexDirection="row" columnGap={1}>
      <Box key="kind" width={11} flexShrink={0}><Text color={THEME.mark} wrap="truncate">{TOOL_KIND_WORD[s.kind] ?? s.kind}</Text></Box>
      {cut('label', THEME.title, s.label, { grow: 2 })}
      {s.dim ? cut('dim', THEME.body, s.dim) : null}
    </Box>
  )

  const bar = (a: AgentRun) => {
    if (Svg) {
      return <Box key="bar" flexDirection="column">
        <Svg source={cardBarSvg(a.status, a.hue, barPx, a.id)} alt={STATUS_WORD[a.status]} width={barPx} height={10} />
      </Box>
    }
    const n = Math.max(6, Math.min(40, textColumns - 2))
    const full = a.status !== 'running'
    return <Text key="bar" color={full ? STATUS_COLOR[a.status] : THEME.mark}>{full ? '█'.repeat(n) : `${'▓'.repeat(Math.ceil(n / 4))}${'░'.repeat(n - Math.ceil(n / 4))}`}</Text>
  }

  const card = (a: AgentRun) => {
    const c = p.cost(a)
    const role = ROLES[a.role] ?? ROLES.worker
    const isOpen = p.openSteps.includes(a.id)
    const isRunning = a.status === 'running'
    const time = duration((a.endedAt ?? p.now) - a.at)
    const history = (isRunning ? a.tools.slice(0, -1) : a.tools).slice(-HISTORY)
    const older = a.calls - a.tools.length
    return (
      <Box key={`agent-${a.id}`} flexDirection="row" columnGap={1} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        {...frame} borderColor={isRunning ? THEME.mark : THEME.line}>
        {pet(a)}
        <Box key="text" flexDirection="column" flexGrow={1} flexShrink={1} width={0}>
          <Box key="head" flexDirection="row" columnGap={1}>
            {cut('who', THEME.title, `${a.name} · ${role.role}`, { isBold: true })}
            <Box key="state" flexShrink={0}><Text bold color={STATUS_COLOR[a.status]}>{STATUS_WORD[a.status]}</Text></Box>
          </Box>
          <Text key="task" color={THEME.title} wrap="wrap">{clip(a.description || a.type, 120)}</Text>
          <Text key="meta" color={THEME.body} wrap="wrap">{`${a.type} · ${a.model} · ${a.steps} wyw. · kontekst ${tokens(a.context)} · ${time}`}</Text>
          <Box key="lead" flexDirection="row" columnGap={1}>
            {cut('lead', isRunning ? THEME.mark : STATUS_COLOR[a.status], leadOf(a), { isBold: isRunning })}
            <Box key="cost" flexShrink={0}><Text color={c !== null && c.usd !== null ? THEME.title : THEME.accentText}>{`koszt ${money(a, c)}`}</Text></Box>
          </Box>
          {!isOpen && history.length
            ? <Box key="history" flexDirection="column">{history.map((s, i) => <Box key={`h-${i}`} flexDirection="row">{cut('t', THEME.body, `  ${s.live}`)}</Box>)}</Box>
            : null}
          {bar(a)}
          {a.calls
            ? <Box key="steps-btn" flexDirection="row"><Button key={`steps-${a.id}`} variant="secondary" label={isOpen ? '▾ Zwiń kroki' : `▸ Wszystkie kroki · ${a.calls}`} onPress={() => p.onSteps(a.id)} /></Box>
            : null}
          {isOpen
            ? <Box key="steps" flexDirection="column">
                {older > 0 ? <Text key="older" color={THEME.body}>{`${older} starszych kroków nie zachowano`}</Text> : null}
                {a.tools.map((s, i) => stepRow(a, s, i))}
              </Box>
            : null}
        </Box>
      </Box>
    )
  }

  const group = (g: GroupKey) => {
    const members = p.list.filter((a) => groupOf(a) === g).reverse()
    if (!members.length) return null
    const isFolded = p.folded.includes(g)
    const shown = members.slice(0, GROUP_LIMIT)
    return (
      <Box key={`group-${g}`} flexDirection="column" gap={isGui ? 1 : 0}>
        <Box key="head" flexDirection="row"><Button key={`fold-${g}`} variant="secondary" label={`${isFolded ? '▸' : '▾'} ${GROUP_WORD[g]} · ${members.length}`} onPress={() => p.onFold(g)} /></Box>
        {isFolded ? null : shown.map(card)}
        {!isFolded && members.length > shown.length ? <Text key="more" color={THEME.body}>{`… jeszcze ${members.length - shown.length} starszych`}</Text> : null}
      </Box>
    )
  }

  const count = p.list.length
  const running = p.list.filter((a) => a.status === 'running').length
  const headline = count
    ? `${count} ${count === 1 ? 'agent' : 'agentów'} w tej sesji · ${running} działa, ${count - running} zakończonych`
    : 'Ta sesja nie uruchomiła jeszcze żadnego subagenta.'
  return (
    <Box key="relai-agents" flexDirection="column" gap={isGui ? 2 : 1}>
      <Box key="top" flexDirection="column" gap={isGui ? 1 : 0}>
        {heading}
        <Text key="headline" bold color={running ? THEME.mark : THEME.title} wrap="wrap">{headline}</Text>
        <Text key="about" color={THEME.body} wrap="wrap">{p.about}</Text>
      </Box>
      {tileRow}
      {group('running')}
      {group('done')}
      {group('broken')}
    </Box>
  )
}
