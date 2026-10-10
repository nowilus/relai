// relai-panel: the plan bar above the prompt (BAND, E9) in the shared grid of the RelAI bars.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10):
// register.tsx resolves the element table and passes the plan and, while one waits, the
// confirmation card with the answer that runs it (AUDYT_MODOW Z1, brief v2).

import type { Elements, RenderChildren } from 'claude-code'
import type { PlanState } from './core/plan-state.mjs'
import type { Card } from './core/decisions.mjs'
import { BAND, BAR, CHIP } from './core/theme.mjs'

// Every surface's table carries Box, Text and Button, which is all a bar draws with
type AnyTable = Elements[keyof Elements]

// Keys sit on Box: the engine keeps a Box's key and drops a Text's (seen in plugin test, 2.1.293)

type Look = { label: string, color: string, bg: string }

// The shared grid of the RelAI bars above the prompt (BAND, BAR; docs/zasoby/PANEL_RELAI/
// STYL_PASKOW_CLAUDE.md): the label column, the content, the figure on the right edge; a soft
// background of the bar's own, no colored frame. Box has no corner radius (2.1.293): on the
// desktop a border in the background's own color only rounds the corners; the terminal draws
// none, each of its rows counts. Below BAR.narrow columns the label and the figure go on top.
function barCard(el: AnyTable, isGui: boolean, columns: number, key: string, look: Look, middle: RenderChildren, figure: readonly [string, string] | null) {
  const { Box, Text } = el
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

// The plan bar (brief v2 §2): one row — the plan and its stage, the stage's status, the stage's
// name truncated before the figure column — and on the right how many stages are closed. The
// session's cost is not here: it stands once, in the cache bar. No plan, or one that cannot be
// read, in words. A second row only while a confirmation card waits (brief v2 §1): the pane's own
// card (R4, D-35) — its title, "Tak", "Nie" — answered the same way as in the pane; it creates no
// consent of its own and goes when the card is answered.
export type Waiting = { card: Card, decide: (said: 'tak' | 'nie') => void }

export function band(el: AnyTable, isGui: boolean, columns: number, p: PlanState, waiting: Waiting | null = null) {
  const { Box, Text } = el
  const second = waiting ? [cardRow(el, isGui, waiting)] : []
  if (p.kind !== 'ok') {
    const words = p.kind === 'none' ? 'brak aktywnego planu' : `plan nieznany: ${p.reason}`
    return barCard(el, isGui, columns, 'relai-band-frame', BAND.panel, [<Box key="plan"><Text bold color={BAR.text} wrap="truncate">{words}</Text></Box>, ...second], null)
  }
  const title = p.stage ? `${p.plan} · ${p.stage.id}` : p.plan
  const status = p.stage ? p.stage.status : (p.planStatus ?? 'status nieznany')
  const middle = [
    <Box key="plan" flexDirection="row" columnGap={2}>
      <Text bold color={BAR.text}>{title}</Text>
      <Text bold color={BAND.panel.color}>{status}</Text>
      {p.stage ? [<Text key="stage" color={BAR.muted} wrap="truncate">{p.stage.name}</Text>] : []}
    </Box>,
    ...second,
  ]
  return barCard(el, isGui, columns, 'relai-band-frame', BAND.panel, middle, [`${p.closed}/${p.stages}`, 'etapów'])
}

// The card's row: a chip with its title, "Tak" (primary) and "Nie", the one sentence of R4. It
// wraps rather than overflow a narrow bar; the native Button is taller than a line of text, so on
// the desktop the row keeps one cell off the row above (P-021 pkt 6).
function cardRow(el: AnyTable, isGui: boolean, w: Waiting) {
  const { Box, Text, Button } = el
  const hint = w.card.state === 'second' ? 'drugi krok — nic nie idzie dalej bez „Tak”' : 'nic nie idzie do czatu bez „Tak”'
  return (
    <Box key="band-confirm" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2} {...(isGui ? { marginTop: 1 } : {})}>
      <Box key="band-chip" flexShrink={1} paddingX={1} backgroundColor={CHIP.warn.bg}>
        <Text color={CHIP.warn.color} wrap="truncate">{`Karta czeka: ${w.card.title}`}</Text>
      </Box>
      <Button key="band-yes" label="Tak" variant="primary" onPress={() => w.decide('tak')} />
      <Button key="band-no" label="Nie" variant="secondary" onPress={() => w.decide('nie')} />
      <Text color={BAR.muted} wrap="truncate">{hint}</Text>
    </Box>
  )
}
