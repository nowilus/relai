// relai-panel: the "Teraz" bar on top of the commands tab (brief v2 §6.2, AUDYT_MODOW Z2, P1).
// Row one: the plan and its stage, the status, the progress segments and `done/total`; row two:
// the next item. On the right one main action, "Start etapu…", which prepares the stage card in
// place (register.tsx draws the card instead of the bar while it waits). Only what this plugin
// reads from its own files: the cache and the agents are the other mods' to say, so they are left
// out rather than guessed. No `$` here (P-023 pkt 10).

import { BAND, BAR, THEME } from './core/theme.mjs'
import { segmentText, segments } from './core/charts.mjs'
import type { Item } from './core/progress.mjs'
import type { FocusChoice, NowData } from './data'
import type { FocusTarget } from './focus'
import type { Ctx, Parts } from './pane-parts'

const SEG_PX = 8 // the segments' height on a desktop, as in the progress bar (brief v2 §3)
const SEG_CELLS = 24 // the most cells the terminal's segments take

// The words of row two: the item in progress and the next one, as under the progress bar
function nextWords(items: readonly Item[]): string {
  const running = items.find((it) => it.status === 'running')
  const next = items.find((it) => it.status === 'pending')
  const parts = [running ? `w toku: ${running.name}` : '', next ? `następny: ${next.name}` : ''].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'wszystkie punkty odhaczone'
}

// The session's work and how to change it (Z12): the row says what the bars and the costs count this
// session under and where that came from; "Zmień" lists the choices, a press sets it by hand
export type FocusUi = { isOpen: boolean, toggle: () => void, choose: (t: FocusTarget | 'outside') => void }

function focusRow(c: Ctx, p: Parts, n: NowData, f: FocusUi) {
  const { Box, Text } = c.el
  const w = n.work
  const how = w.focus ? (w.focus.source === 'manual' ? 'wybrane ręcznie' : 'rozpoznane z promptu')
    : w.isAsking ? 'aktywny plan idzie w innym narzędziu' : 'aktywny plan'
  const choices = f.isOpen ? [
    <Box key="now-focus-list" flexDirection="row" flexWrap="wrap" gap={1}>
      {n.choices.map((ch: FocusChoice) => p.btn(`focus-${ch.key}`, ch.label, 'secondary', () => f.choose(ch.target)))}
    </Box>,
  ] : []
  return [
    <Box key="now-focus" flexDirection="row" alignItems="center" columnGap={2}>
      <Box key="now-focus-words" flexGrow={1} flexShrink={1}>
        <Text color={w.isAsking ? THEME.accentText : THEME.body}>{`Ta sesja: ${w.label} — ${how}${w.mention ? ' · ' + w.mention : ''}`}</Text>
      </Box>
      {p.btn('now-focus-change', f.isOpen ? 'Zwiń' : 'Zmień', 'secondary', f.toggle)}
    </Box>,
    ...choices,
  ]
}

export function nowBar(c: Ctx, p: Parts, n: NowData, start: (() => void) | null, f: FocusUi) {
  const { el, Svg, isGui, width } = c
  const { Box, Text } = el
  const plan = n.plan
  const pr = n.progress
  const title = plan.kind !== 'ok' ? '' : plan.stage ? `${plan.plan} · ${plan.stage.id}` : plan.plan
  const status = plan.kind !== 'ok' ? '' : plan.stage ? plan.stage.status : (plan.planStatus ?? '')
  const words = plan.kind === 'none' ? (n.work.focus?.kind === 'outside' || n.work.isAsking ? 'ta sesja nie liczy się do żadnego planu' : 'brak aktywnego planu')
    : plan.kind !== 'ok' ? `plan nieznany: ${plan.reason}`
      : pr.items.length ? `${pr.kind === 'crew' ? pr.title + ' · ' : ''}${nextWords(pr.items)}` : pr.words
  const colors = pr.items.map((it) => BAR.segment[it.status] ?? BAR.segment.unknown)
  const art = Svg && colors.length ? segments(colors, SEG_PX) : null
  const cells = Math.max(6, Math.min(SEG_CELLS, width - 30))
  const runs = colors.length ? segmentText(colors, cells) : null
  const segs = art && Svg
    ? [<Box key="now-segs" flexGrow={1} flexShrink={1} minWidth={8}><Svg key="now-segs-svg" source={art} alt={pr.words} height={SEG_PX} /></Box>]
    : runs ? [<Box key="now-segs" flexDirection="row" columnGap={runs.gap}>{runs.runs.map((r, i) => <Text key={`now-seg-${i}`} color={r.color}>{r.text}</Text>)}</Box>] : []
  // "Start etapu…" takes no flash: the card replaces the bar at once, a flash would draw twice unseen (Z3)
  return (
    <Box key="now" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2} paddingX={isGui ? 2 : 1}
      borderStyle="round" borderColor={THEME.mark} backgroundColor={THEME.cardFeatured}>
      <Box key="now-text" flexDirection="column" flexGrow={1} flexShrink={1}>
        {title ? [
          <Box key="now-l1" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
            <Text bold color={THEME.title}>{title}</Text>
            {status ? [<Text key="now-status" bold color={BAND.panel.color}>{status}</Text>] : []}
            {segs}
            {pr.total ? [<Text key="now-figure" bold color={BAND.progress.color}>{`${pr.done}/${pr.total}`}</Text>] : []}
          </Box>,
        ] : []}
        <Box key="now-l2"><Text color={THEME.body}>{words}</Text></Box>
        {focusRow(c, p, n, f)}
      </Box>
      {start ? [<Box key="now-act" flexShrink={0}>{p.btn('now-start', 'Start etapu…', 'primary', start)}</Box>] : []}
    </Box>
  )
}
