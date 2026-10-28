// relai-progress: the progress bar as a list of steps (plan WYGLAD_PANELU, E2; mock-up
// MAKIETA_PASEK_POSTEPU.html; look accepted with Łukasz in rounds 1–3, the words in the journal).
//
// Collapsed: the thin line of segments, under it one line — the spinner, the item in progress, the
// next one on a wide screen, "● N agentów", the button "Rozwiń" (on the desktop both buttons are
// ghosts with air above them, short below SHORT_BELOW columns). Expanded: the line says the sums
// and "Zwiń"; under it the window of at most six rows (segments.ts windowRows) — the fold of the done
// ones as text, the one just ticked (it flashes once and its mark fills), the current one, three
// next ones, "+N czekają". A row says its state right after its name (round 3).
//
// No `$` here (P-023 pkt 10): register.tsx passes the element table, the values and what a press
// does. A text cut with an ellipsis stands in a Box with a zero basis (width 0 + flexGrow): the
// desktop lays out as CSS and a long name would otherwise widen the column past the card (P-043).

import type { Elements, RenderChildren } from 'claude-code'
import type { Item, Progress } from './core/progress.mjs'
import { BAR, KEY } from './core/theme.mjs'
import { segmentText } from './core/charts.mjs'
import { MARK_PX, OVERVIEW_HEIGHT, currentOf, doneFirst, markArt, overviewArt, sumWords, windowRows } from './segments'
import type { MarkKind, Row } from './segments'

type AnyTable = Elements[keyof Elements]

export const FLASH_KEY = 'diffAddedDimmed' // a soft green in both appearances: the row just ticked
export const WIDE = 110 // from this many columns the collapsed line also says the next item
// Below this many columns the line's buttons speak short on the desktop — the chip its sign and
// count, the toggle its word without the chevron — so the item's name keeps its room (PRZYCISKI_
// POSTEPU, Łukasz's pick "B" of 2026-10-28; DESIGN.md §6 names the same width STACK_BELOW)
export const SHORT_BELOW = 48
// The air between the segments and the line on the desktop: a step name, so the terminal draws none
const LINE_AIR = 'xs'
const COLUMN_GAP = 2
const WORD: Record<string, string> = { done: 'zrobione', pending: 'czeka', running: 'w toku', failed: 'błąd', unknown: 'stan nieznany' }
const GLYPH: Record<MarkKind, string> = { done: BAR.tile.done.mark, pending: BAR.tile.pending.mark, running: BAR.tile.running.mark, failed: BAR.tile.failed.mark, 'fold-open': '▾', 'fold-closed': '▸' }
// The terminal's segments in theme keys (WYGLAD_PANELU E1): a waiting one in the muted key
const SEGMENT_KEY: Record<string, string> = { done: KEY.done, pending: KEY.muted, running: KEY.running, failed: KEY.failed, unknown: KEY.muted }

export type Steps = {
  progress: Progress
  isOpen: boolean
  isDoneShown: boolean
  freshId: string | null // the item ticked within the flash, else null
  agents: { count: number, isRunning: boolean } | null
  isWorking: boolean // the model works now: the current item's mark spins only then
  columns: number
  cells: number // the middle column's width in cells: the terminal's segments fill it
  onToggle: () => void
  onFold: () => void
  onAgents: () => void // opens or closes the RelAI Agents pane
}

// The agents chip: how many subagents the session ran, ● while one runs and ✓ once none does; the
// cost is in /relai-agents (plan, section 5)
export function chipWords(a: { count: number, isRunning: boolean }): string {
  return `${chipShort(a)} ${a.count === 1 ? 'agent' : 'agentów'}`
}

// The chip in a narrow line: its sign and the count alone
export function chipShort(a: { count: number, isRunning: boolean }): string {
  return `${a.isRunning ? BAR.tile.running.mark : BAR.tile.done.mark} ${a.count}`
}

// The rows of the middle column of the bar, top to bottom
export function stepRows(el: AnyTable, isGui: boolean, s: Steps): RenderChildren[] {
  const { Box, Text, Button } = el
  const Svg = isGui && 'Svg' in el ? el.Svg : null
  const items: readonly Item[] = s.progress.items
  const done = items.filter((it) => it.status === 'done').length
  const cur = currentOf(items)

  const mark = (kind: MarkKind, key: string, o: { isFresh?: boolean, title?: string } = {}) => {
    if (Svg) {
      const isSpinning = kind === 'running' && s.isWorking
      const isLive = isSpinning || o.isFresh === true || Boolean(o.title)
      return <Box key={key} flexShrink={0} width={2}>
        <Svg source={markArt(kind, { ...o, isSpinning })} alt={o.title || WORD[kind] || kind} width={MARK_PX} height={MARK_PX} {...(isLive ? { isInteractive: true } : {})} />
      </Box>
    }
    const color = kind === 'done' ? KEY.done : kind === 'running' ? KEY.running : kind === 'failed' ? KEY.failed : KEY.muted
    return <Box key={key} flexShrink={0} width={2}><Text bold color={color}>{GLYPH[kind]}</Text></Box>
  }
  const cut = (key: string, grow: number, color: string, words: string, isBold = false) =>
    <Box key={key} flexGrow={grow} flexShrink={1} width={0}><Text bold={isBold} color={color} wrap="truncate">{words}</Text></Box>
  // The bar's buttons on the desktop are ghosts (PRZYCISKI_POSTEPU, 2026-10-28): a filled one stood
  // over the segments and squeezed the item's name; the terminal keeps its own look
  const look = (variant: 'primary' | 'secondary') => (isGui ? { plain: true as const } : { variant })
  const isShort = isGui && s.columns < SHORT_BELOW
  // Under the label of a narrow card the first row gets air too, or the button touches the label
  const firstAir = isGui && s.columns < BAR.narrow ? LINE_AIR : 0
  // The agents chip is a button: it opens and closes the RelAI Agents pane (AGENTS_KRABY P5); it
  // speaks short only beside the item's name, alone it keeps its words
  const chipOf = (isInLine: boolean) => s.agents
    ? <Box key="agents-chip" flexShrink={0}><Button key="agents-open" {...look('secondary')} label={isInLine && isShort ? chipShort(s.agents) : chipWords(s.agents)} onPress={s.onAgents} /></Box>
    : null
  const chip = chipOf(false)

  // Work outside a plan with agents: the line is the agents button alone, nothing to say of progress
  if (s.progress.kind === 'free' && chip) {
    return [<Box key="first" flexDirection="row" alignItems="center" columnGap={COLUMN_GAP} marginTop={firstAir}>{chip}</Box>]
  }

  // No list to show: no items (the words say why), or every item done — one line, no button
  if (items.length === 0 || cur < 0) {
    const words = items.length === 0 ? s.progress.words : 'wszystkie punkty odhaczone'
    // words alone need no air under the label: only a button stands too close to it
    return [<Box key="first" flexDirection="row" alignItems="center" columnGap={COLUMN_GAP} marginTop={chip ? firstAir : 0}>
      {cut('words', 1, KEY.muted, words)}
      {chip}
    </Box>]
  }

  const rows: RenderChildren[] = []
  const art = Svg ? overviewArt(items, s.freshId) : null
  if (Svg && art !== null) {
    const alt = `${s.progress.title}: ${items.map((it) => `${BAR.tile[it.status].mark} ${it.name}`).join(', ')}`
    // The Svg alone in a column of its own (P-021 pkt 3)
    rows.push(<Box key="segments" flexDirection="column"><Svg isInteractive source={art} alt={alt} height={OVERVIEW_HEIGHT} /></Box>)
  } else {
    // the done ones first, as on the desktop; the item in progress in the running key, as its amber segment
    const order = doneFirst(items)
    const text = segmentText(order.map((n) => {
      const it = items[n] as Item
      return n === cur && it.status !== 'failed' ? KEY.running : SEGMENT_KEY[it.status] ?? KEY.muted
    }), s.cells)
    rows.push(<Box key="segments" flexDirection="row" flexWrap="wrap" columnGap={text.gap}>
      {text.runs.map((r, i) => <Box key={`seg-${items[order[i] ?? i]?.id ?? i}`}><Text color={r.color}>{r.text}</Text></Box>)}
    </Box>)
  }

  // The one line
  const it = items[cur] as Item
  const isFailed = it.status === 'failed'
  const nextIt = items.find((x, i) => i > cur && x.status !== 'done')
  const words = s.isOpen
    ? [cut('sum', 1, KEY.muted, sumWords(items))]
    : [
        cut('now', 3, isFailed ? KEY.failed : KEY.text, isFailed ? `błąd: ${it.name}` : it.name, true),
        nextIt && s.columns >= WIDE ? cut('next', 2, KEY.muted, `następny: ${nextIt.name}`) : null,
      ]
  const isLineFresh = !s.isOpen && s.freshId !== null
  // A wide desktop line says the toggle with its chevron; a narrow one, and the terminal, the word
  const chevron = isGui && !isShort ? (s.isOpen ? ' ▴' : ' ▾') : ''
  rows.push(<Box key="line" flexDirection="row" alignItems="center" columnGap={1} marginTop={isGui ? LINE_AIR : 0} {...(isLineFresh ? { backgroundColor: FLASH_KEY } : {})}>
    {s.isOpen ? null : mark(isFailed ? 'failed' : 'running', 'now-mark', { title: it.name })}
    {words}
    {chipOf(true)}
    <Box key="toggle" flexShrink={0}><Button key="toggle-btn" {...look('primary')} label={(s.isOpen ? 'Zwiń' : 'Rozwiń') + chevron} onPress={s.onToggle} /></Box>
  </Box>)

  if (s.isOpen) {
    const rowEl = (r: Row): RenderChildren => {
      if (r.kind === 'fold') {
        return <Box key="fold" flexDirection="row" alignItems="center" columnGap={1}>
          {mark(r.isOpen ? 'fold-open' : 'fold-closed', 'fold-mark')}
          <Box key="fold-btn" flexShrink={0}>
            <Button key="fold-press" plain label={r.isOpen ? 'Zwiń zrobione' : `${r.done} zrobionych`} onPress={s.onFold} />
          </Box>
        </Box>
      }
      if (r.kind === 'more') {
        return <Box key="more" flexDirection="row" columnGap={1}>
          {mark('pending', 'more-mark')}
          <Box key="more-text" flexGrow={1} width={0}><Text italic color={KEY.muted}>{`+${r.count} czekają`}</Text></Box>
        </Box>
      }
      const x = r.item
      const kind: MarkKind = x.status === 'failed' ? 'failed' : x.status === 'running' || r.isCurrent ? 'running' : x.status === 'done' ? 'done' : 'pending'
      const meta = kind === 'running' || kind === 'failed' ? WORD[kind] ?? '' : r.isFresh ? 'przed chwilą' : ''
      const metaColor = kind === 'failed' ? KEY.failed : kind === 'running' ? KEY.running : KEY.muted
      const nameColor = r.isCurrent ? KEY.text : KEY.muted
      return <Box key={`row-${x.id}`} flexDirection="row" alignItems="flex-start" columnGap={1} {...(r.isFresh ? { backgroundColor: FLASH_KEY } : {})}>
        {mark(kind, `mark-${x.id}`, { isFresh: r.isFresh })}
        <Box key="name" flexGrow={1} flexShrink={1} width={0}>
          {meta
            ? <Text bold={r.isCurrent} color={nameColor} wrap="wrap">{x.name}<Text bold={false} color={metaColor}>{`  ·  ${meta}`}</Text></Text>
            : <Text bold={r.isCurrent} color={nameColor} wrap="wrap">{x.name}</Text>}
        </Box>
      </Box>
    }
    rows.push(<Box key="list" flexDirection="column" marginTop={isGui ? 1 : 0}>{windowRows(items, s.isDoneShown, s.freshId).map(rowEl)}</Box>)
  }
  return rows
}
