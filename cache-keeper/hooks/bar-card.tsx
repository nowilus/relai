// The shared grid of the RelAI bars above the prompt (BAND, BAR; docs/zasoby/PANEL_RELAI/
// STYL_PASKOW_CLAUDE.md §5): the plan bar (relai-panel), the progress bar (relai-progress) and
// the cache bar (relai-cache-keeper) draw their card with this one function.
//
// One file, three copies byte for byte (AUDYT_MODOW Z6): a plugin imports only from its own folder
// (P-017 pkt 1), and core/panel/tests/mods-parity.test.js fails when a copy drifts. No `$` here
// (P-023 pkt 10): the caller passes the element table it resolved. No theme import either — the
// theme's copy is ./core/theme.mjs in two plugins and ./relai/theme.mjs in the third — so the
// caller passes BAR too.

import type { Elements, RenderChildren } from 'claude-code'

// Every surface's table carries Box and Text, which is all the card draws with
type AnyTable = Elements[keyof Elements]

// What the card takes of BAR (core/panel/theme.mjs)
export type Grid = { labelColumn: number, figureColumn: number, narrow: number, text: string, muted: string }

// A bar's own label and colors (BAND.panel, BAND.progress, BAND.cache)
export type Look = { label: string, color: string, bg: string }

// The figure on the right edge: the value in bold, then its unit
export type Figure = readonly [string, string]

// The label column, the middle, the figure on the right edge; a soft background of the bar's own,
// no colored frame. Box has no corner radius (2.1.293): on the desktop a border in the
// background's own color only rounds the corners; the terminal draws none, each of its rows
// counts. Below grid.narrow columns the label and the figure go on top. `align` sets where the
// label and the figure stand beside a middle of more than one row: the plan and cache bars keep
// them centred, the progress bar at the top. No Box here has a `width` around anything that may
// hold `next(e)` (P-017 pkt 2): only the label column is fixed, and it holds the label alone.
// Keys sit on Box: the engine keeps a Box's key and drops a Text's (P-017 pkt 4).
export function barCard(el: AnyTable, grid: Grid, isGui: boolean, columns: number, key: string, look: Look, middle: RenderChildren, figure: Figure | null, align: 'center' | 'flex-start' = 'center') {
  const { Box, Text } = el
  const frame = isGui ? { borderStyle: 'round' as const, borderColor: look.bg } : {}
  const label = <Text bold color={look.color}>{look.label}</Text>
  const figureText = figure ? [<Text key="value" bold color={grid.text}>{figure[0]}</Text>, <Text key="unit" color={grid.muted}>{' ' + figure[1]}</Text>] : []
  if (columns < grid.narrow) {
    return (
      <Box key={key} flexDirection="column" backgroundColor={look.bg} paddingX={1} {...frame}>
        <Box key="head" flexDirection="row" flexWrap="wrap" justifyContent="space-between" columnGap={2}>
          <Box key="label">{label}</Box>
          {figure ? <Box key="figure" flexDirection="row">{figureText}</Box> : null}
        </Box>
        <Box key="middle" flexDirection="column">{middle}</Box>
      </Box>
    )
  }
  return (
    <Box key={key} flexDirection="row" alignItems={align} columnGap={2} backgroundColor={look.bg} paddingX={1} {...frame}>
      <Box key="label" width={grid.labelColumn} flexShrink={0}>{label}</Box>
      <Box key="middle" flexDirection="column" flexGrow={1} flexShrink={1}>{middle}</Box>
      <Box key="figure" minWidth={grid.figureColumn} flexShrink={0} flexDirection="row" justifyContent="flex-end">{figureText}</Box>
    </Box>
  )
}
