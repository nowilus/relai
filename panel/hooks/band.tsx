// relai-panel: the plan bar above the prompt (BAND, E9) in the shared grid of the RelAI bars.
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10):
// register.tsx resolves the element table and passes the plan and the session's cost.

import type { Elements, RenderChildren } from 'claude-code'
import type { PlanState } from './core/plan-state.mjs'
import { clip, usd } from './fmt'
import { BAND, BAR } from './core/theme.mjs'

// Every surface's table carries Box and Text, which is all a bar draws with
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

// The plan bar: the plan and its stage with the stage's status, the stage's name and the session's
// cost; on the right how many stages are closed. No plan, or one that cannot be read, in words.
export function band(el: AnyTable, isGui: boolean, columns: number, p: PlanState, costUsd: number | null) {
  const { Box, Text } = el
  const cost = <Box key="cost"><Text color={BAR.muted} wrap="truncate">{`sesja ≈ ${usd(costUsd)} wg cennika API`}</Text></Box>
  if (p.kind !== 'ok') {
    const words = p.kind === 'none' ? 'brak aktywnego planu' : `plan nieznany: ${p.reason}`
    return barCard(el, isGui, columns, 'relai-band-frame', BAND.panel, [<Box key="plan"><Text bold color={BAR.text} wrap="truncate">{words}</Text></Box>, cost], null)
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
  return barCard(el, isGui, columns, 'relai-band-frame', BAND.panel, middle, [`${p.closed}/${p.stages}`, 'etapów'])
}
