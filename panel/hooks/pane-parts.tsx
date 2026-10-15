// relai-panel: the parts every tab of the pane draws with — Kalam headings, icons, the surface's
// own buttons with their flash, sections, cards, the well of the exact text, the confirmation card
// and the tabs, and the figures, bars and legends the costs and the map share (E8, E3, E5).
//
// Split out of register.tsx in E7 without a change of behavior: the same elements, the same keys.
// No `$` here (P-023 pkt 10: the engine refuses a module that hands `$` to a function from another
// file): register.tsx resolves the element table and passes it with ready callbacks.

import type { Elements, RenderChildren } from 'claude-code'
import { pct, tokens, usd } from './fmt'
import { COST_COLORS, HEADINGS, NAMES, RULE, SHEET, SHEET_DRAW, THEME, glyph, iconName, sheetEndSvg, sheetMiddleSvg, sheetTopSvg } from './core/theme.mjs'
import { HIDDEN, rekey } from './skin'
import { HEADING_ART } from './core/headings.mjs'
import { ICONS } from './core/icons.mjs'
import { plural } from './core/measure.mjs'
import type { Group } from './core/measure.mjs'
import { blocks, figureArt, stackBar } from './core/charts.mjs'
import { shown } from './core/decisions.mjs'
import type { Card, Fact } from './core/decisions.mjs'
import type { PanelView } from '../types'

// The pane's tables: every surface but mobile (the pane answers mobile in one sentence)
export type Table = Elements['terminal'] | Elements['desktop'] | Elements['vscode']
export type SvgTag = Elements['desktop']['Svg']

// What a tab is drawn with: the table, Svg on a desktop only, the pane's width, the control that
// flashes now and the last sent line, the one call a press makes on every control, and the folds
// kept in $.state (`unfolded`) with the press that turns one (AUDYT_MODOW Z14: the folded sections)
export type Ctx = {
  el: Table, Svg: SvgTag | null, isGui: boolean, width: number, flashed: string, last: string, flash: (key: string) => void
  isUnfolded: (key: string, byDefault: boolean) => boolean
  fold: (key: string, byDefault: boolean) => void
}

// The pane width (bodyColumns) below which a row's control goes under its words: the narrowest
// width at which every row of every tab still holds its icon, its longest word and its button side
// by side (narrow.test.ts measures both layouts around it)
export const STACK_BELOW = 48
// What the desktop draws of a pane's tree, measured (probe relai-szata-sonda 0.9.x, 2026-10-15; P-023
// pkt 7): not characters — 250 k in ~100 rows drew — but elements: 1 260 drew, 1 344 vanished without
// a word, and a drawing weighs more (400 rows with 150 Svg vanished; 726 elements with 121 Svg too).
// The weight: every element 1, a drawing with markup SVG_WEIGHT more (a hollow one, the sheet's copy,
// counts as an element). A tree past DRAW_LIMIT loses the sheet's fill, never the tab.
export const DRAW_LIMIT = 1_200
const SVG_WEIGHT = 4
const HOLLOW_MOST = 200 // characters: a drawing this short is a hollow outline (skin.ts)
export function treeWeight(node: unknown): number {
  if (Array.isArray(node)) return node.reduce((sum: number, n) => sum + treeWeight(n), 0)
  if (!node || typeof node !== 'object' || !('type' in node)) return 0
  const n = node as { type: string, props?: { source?: unknown }, children?: unknown[] }
  const own = n.type === 'Svg' && String(n.props?.source ?? '').length > HOLLOW_MOST ? 1 + SVG_WEIGHT : 1
  return own + treeWeight(n.children ?? [])
}
// The column of a folded row's Kalam heading, in cells: the widest heading ("Wywołania w czasie") fits
const FOLD_HEAD = 28

// The Select of a choice cannot hold an empty value: '' travels as this one
export const NONE = '_'

// In the order of use (brief v2 §6.1): the cheat sheet and the phrases are one tab, "Pomoc"
export const TABS = [['commands', 'Komendy'], ['costs', 'Koszty'], ['docs', 'Dokumenty'], ['map', 'Mapa'], ['help', 'Pomoc']] as const

// The tab kept in $.state: a value from before Z2 ('sheet', 'phrases') opens "Pomoc"
export function tabOf(v: string): PanelView {
  return TABS.some(([t]) => t === v) ? v as PanelView : v === 'sheet' || v === 'phrases' ? 'help' : 'commands'
}

// The sent line (UX-16): a success or a cancel says what happened and goes after a while; anything
// else is a failure, which starts with what to do and keeps the engine's words after it
const DONE = /^(Wysłano|Zapisano)/
const NOTE = /^Anulowano/
export const isPassing = (text: string) => DONE.test(text) || NOTE.test(text)
export function failure(todo: string, what: string, err?: unknown): string {
  const why = err === undefined ? '' : `: ${err instanceof Error ? err.message : String(err)}`
  return `${todo} ${what}${why}`
}

// The four categories of a request, in the costs' colors
export const CATS = [
  ['input', 'wejście', COST_COLORS.input], ['cacheRead', 'odczyt cache', COST_COLORS.cacheRead],
  ['cacheWrite', 'zapis cache', COST_COLORS.cacheWrite], ['output', 'wyjście', COST_COLORS.output],
] as const

export function parts(c: Ctx) {
  const { el, Svg, isGui, width, flashed, last } = c
  const { Box, Text, Button } = el

  // ---------- the pane's parts: one look for every tab and every later section ----------
  // A heading in HEADINGS whose Kalam art is not generated yet reads as its words, never its key
  const heading = (key: string, color: string = THEME.mark) => {
    const art = HEADING_ART[key]
    if (Svg && art) return <Svg key={`h-${key}`} source={art.svg} alt={art.text} width={art.width} height={art.height} />
    return <Text bold color={color}>{art?.text ?? HEADINGS.find((h) => h.key === key)?.text ?? key}</Text>
  }
  // Icons, marks and buttons never shrink (PANEL_WASKI): in a row that runs out of room the
  // surface takes it from the text, which wraps, never from a control ("Otwórz" cut to "Otwó")
  const fixed = (child: RenderChildren) => <Box flexShrink={0}>{child}</Box>
  // A row's words and its control (PANEL_WASKI, live 2026-10-14): a desktop never narrows a text
  // below its longest word, and a row that wraps by itself puts the button under the text in one
  // row and beside it in the next. So the pane decides once, by its width: below STACK_BELOW every
  // control stands under its words, from it every control stands right of them.
  const isStacked = width < STACK_BELOW
  const textAndAct = (key: string, words: RenderChildren, act: RenderChildren) => (isStacked
    ? <Box key={key} flexDirection="column" alignItems="flex-start" flexGrow={1} flexShrink={1}>{words}{act}</Box>
    : <Box key={key} flexDirection="row" alignItems="center" columnGap={isGui ? 2 : 1} flexGrow={1} flexShrink={1}>{words}{act}</Box>)
  const icon = (cmd: string, px: number) => {
    const source = ICONS[iconName(cmd)]
    if (Svg && source) return fixed(<Svg key={`icon-${cmd}`} source={source} alt={NAMES[cmd]?.[0] ?? cmd} width={px} height={px} />)
    return fixed(<Text color={THEME.accent}>●</Text>)
  }
  const mark = (name: string, color: string, px: number, alt: string) => {
    const source = glyph(name, color, px)
    if (Svg && source) return fixed(<Svg key={`g-${name}-${px}`} source={source} alt={alt} width={px} height={px} />)
    return fixed(<Text color={color}>●</Text>)
  }
  // Every control is the surface's own button (calibration 2026-10-08): a `plain` button in a
  // painted box inverts under the pointer and that cannot be turned off, so the brand stays in
  // the cards and the press answers by itself: the control's card flashes and, where a press
  // sends something, the label says so for FLASH_MS. Only a control that shows the flash takes it
  // (a send with its done label, a card that prepares or confirms one): a tab, a fold or a switch
  // answers by its own change, and a flash there cost two more drawings (AUDYT_MODOW Z3).
  const isFlash = (key: string) => flashed === key
  const btn = (key: string, label: string, kind: 'primary' | 'secondary', onPress: () => void, doneLabel?: string, isFlashing = doneLabel !== undefined) => fixed(
    <Button key={key} variant={kind} onPress={() => { onPress(); if (isFlashing) c.flash(key) }}>
      {doneLabel && isFlash(key) ? doneLabel : label}
    </Button>,
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
  // A card's frame: on the terminal only the selected one is framed; on a desktop none (WYGLAD_PANELU
  // E3, variant 3, Aneks F: sections of one sheet, no cards — a frame stands only round a thing that
  // waits for the person's decision, and those boxes set their own; Łukasz 2026-10-15: "nadal mają
  // te takie dziwne jakieś bordery")
  const frame = (isOn: boolean) => (!isGui && isOn ? { borderStyle: 'round' } : {})
  // A section folded to one row (brief v2 §7): its Kalam heading, one line with its key number,
  // "▸ Rozwiń" / "▾ Zwiń"; unfolded, its content under the row. Folded by default and kept in
  // $.state as "<prefix>:<id>". Shared by the costs (Z2) and the map (AUDYT_MODOW Z14): a folded
  // section draws none of its content, which keeps the tree light (P-023 pkt 7).
  // `head` names the Kalam heading when it is not "<prefix>-<id>"; `isNaturallyOpen` unfolds it
  // until the person folds it (Pomoc: the sheet opens by itself while a search narrows it).
  const folded = (prefix: string, id: string, summary: string, content: () => RenderChildren[], isAlert = false, head = `${prefix}-${id}`, isNaturallyOpen = false) => {
    const isOpen = c.isUnfolded(`${prefix}:${id}`, isNaturallyOpen)
    const sum = <Box key={`${prefix}-${id}-sum`} flexShrink={1}><Text color={isAlert ? THEME.mark : THEME.body}>{summary}</Text></Box>
    const foldBtn = btn(`fold-${prefix}:${id}`, isOpen ? '▾ Zwiń' : '▸ Rozwiń', 'secondary', () => c.fold(`${prefix}:${id}`, isNaturallyOpen))
    return (
      <Box key={`${prefix}-${id}`} flexDirection="column" gap={isGui ? 1 : 0}>
        {/* The heading and the summary wrap on the left, the button keeps the right (PANEL_WASKI).
            In a narrow pane the heading and the button take the top line and the summary the whole
            width under them: a long word of it ("(platform.claude.com),") pushed the button past
            the card's edge (live 2026-10-14, 31 columns) */}
        <Box key={`${prefix}-${id}-row`} flexDirection={isStacked ? 'column' : 'row'} {...(isStacked ? {} : { alignItems: 'center' as const })} columnGap={2} paddingX={1}
          {...frame(false)} borderColor={isAlert ? THEME.accent : THEME.line} backgroundColor={THEME.card}>
          {isStacked
            ? [<Box key={`${prefix}-${id}-top`} flexDirection="row" alignItems="center" justifyContent="space-between" columnGap={2}>
                {/* In a Box the Kalam drawing is scaled to the room left by the button; standing
                    straight in the row it kept its width (live 2026-10-14: "Rozwiń" past the card) */}
                <Box key={`${prefix}-${id}-head`} flexShrink={1}>{heading(head)}</Box>
                {foldBtn}
              </Box>, sum]
            // The heading in a column of one width, so every summary of a tab starts at one edge
            // (review 2026-10-15: five summaries, five left edges)
            : [<Box key={`${prefix}-${id}-words`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2} flexGrow={1} flexShrink={1}>
                <Box key={`${prefix}-${id}-head`} width={FOLD_HEAD} flexShrink={0}>{heading(head)}</Box>
                {sum}
              </Box>, foldBtn]}
        </Box>
        {isOpen ? content() : []}
      </Box>
    )
  }
  // The exact text that goes to the chat, in a well of its own
  const well = (key: string, text: string, isOk: boolean) => (
    <Box key={key} paddingX={1} {...frame(false)} borderColor={THEME.line} backgroundColor={THEME.card}>
      <Text color={isOk ? THEME.title : THEME.accentText}>{isOk ? [<Text key={`${key}-l`} color={THEME.mark} bold>{'Do czatu pójdzie: '}</Text>, text] : text}</Text>
    </Box>
  )
  const sentLine = last
    ? <Box key="sent"><Text color={DONE.test(last) ? THEME.ok : NOTE.test(last) ? THEME.body : THEME.accentText}>{(DONE.test(last) ? '✓ ' : NOTE.test(last) ? '' : '✗ ') + last}</Text></Box>
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
  const confirmCard = (card: Card, decide: (said: 'tak' | 'nie') => void) => {
    const step = shown(card)
    return section('confirm', 'confirm', card.state === 'second' ? 'Drugi krok — zapis dopiero po tym potwierdzeniu.' : 'Nic nie pójdzie do czatu bez „Tak”.', [
      <Box key="confirm-card" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui && !isStacked ? 2 : 1} paddingY={isGui ? 1 : 0}
        borderStyle="round" borderColor={flashBorder('confirm-yes', THEME.accent)} backgroundColor={THEME.cardOn}>
        <Text bold color={THEME.accentText}>{card.title}</Text>
        <Box key="confirm-facts" flexDirection="column">{step.facts.map((f, i) => factRow(`confirm-f-${i}`, f))}</Box>
        <Text bold color={THEME.title}>{step.question}</Text>
        <Box key="confirm-act" flexDirection="row" flexWrap="wrap" gap={1}>
          {btn('confirm-yes', 'Tak', 'primary', () => decide('tak'), undefined, true)}
          {btn('confirm-no', 'Nie', 'secondary', () => decide('nie'))}
        </Box>
      </Box>,
    ])
  }

  const tabs = (tab: PanelView, choose: (v: PanelView) => void) => (
    <Box key="tabs" flexDirection="row" flexWrap="wrap" gap={1}>
      {TABS.map(([v, label]) => btn(`tab-${v}`, label, v === tab ? 'primary' : 'secondary', () => choose(v)))}
    </Box>
  )

  // ---------- figures, bars and cards of the costs and the map ----------
  // Drawings are geometry only (charts.mjs); every word stands in a box the surface lays out.
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
    <Box key={key} flexDirection="column" gap={isGui ? 1 : 0} paddingX={1}
      {...(grow ? { flexGrow: 1 } : {})}
      {...frame(isMain)} borderColor={isMain ? THEME.mark : THEME.line} backgroundColor={isMain ? THEME.cardFeatured : THEME.card}>
      {items}
    </Box>
  )
  const line = (key: string, text: string, color: string = THEME.body, bold = false) => <Text key={key} color={color} bold={bold}>{text}</Text>
  const money = (n: number | null) => (n === null ? 'brak ceny' : usd(n))
  const nCalls = (n: number) => `${n} ${plural(n, 'wywołanie', 'wywołania', 'wywołań')}`

  // The four categories of a group: a dot in its color, the name, tokens and dollars
  const legend = (key: string, g: Group) => (
    <Box key={key} flexDirection="row" flexWrap="wrap" columnGap={2}>
      {CATS.map(([k, label, color]) => (
        <Box key={`${key}-${k}`} flexDirection="row" columnGap={1} {...(isStacked ? { flexWrap: 'wrap' } : {})}>
          <Text color={color}>●</Text>
          <Text color={THEME.title}>{label}</Text>
          <Text color={THEME.body}>{`${tokens(g[k])} · ${usd(g.parts[k])}`}</Text>
        </Box>
      ))}
    </Box>
  )

  // ---------- the sheet under a tab (WYGLAD_PANELU E3, Aneks E–F; P-044) ----------
  // One "Warsztat" sheet under every tab that follows the app's appearance (Łukasz 2026-10-15: "zawsze
  // wypełnione"): the tab in flow, hidden under the drawings, sizes it; the two drawings — fill and
  // frame in one line, so no pixel between them — cover it; the tab itself is drawn over them. No Box
  // border: a border clipped the fill inside it and left a seam. Never nested: a sandwich in a
  // sandwich would draw its tab four times. The terminal has no Svg: the tab as it is.
  const sheet = (key: string, children: RenderChildren[], isFilled = true) => {
    // One margin inside the sheet for every tab (review 2026-10-15: "brakuje w ogóle jakichś
    // paddingów"); a narrow pane (stacked rows) keeps one cell a side, so 40 columns hold every row
    const inner = { flexDirection: 'column' as const, gap: 1, paddingX: isStacked ? 1 : 2, paddingY: 1 }
    if (!Svg) return <Box key={key} flexDirection="column" gap={isGui ? 1 : 0}>{children}</Box>
    // Too heavy to be drawn twice (register.tsx, DRAW_LIMIT): the frame alone, no fill
    if (!isFilled) return <Box key={key} borderStyle="round" borderColor={SHEET.frame} {...inner}>{children}</Box>
    return (
      <Box key={key} flexDirection="column" position="relative" overflow="hidden">
        <Box key={`${key}${HIDDEN}`} {...inner}>{rekey(children, HIDDEN)}</Box>
        {/* In a column, so the drawing takes the slot's width (in a row it kept ~375 px, probe 0.7.0) */}
        <Box key={`${key}-paper`} position="absolute" top={0} left={0} right={0} bottom={1} overflow="hidden" flexDirection="column">
          <Svg key={`${key}-paper-svg`} source={sheetTopSvg()} alt="kartka panelu RelAI" height={SHEET_DRAW.piece} />
          {Array.from({ length: SHEET_DRAW.middles }, (_, i) => <Svg key={`${key}-paper-svg-${i}`} source={sheetMiddleSvg()} alt="kartka panelu RelAI: ciąg dalszy" height={SHEET_DRAW.piece} />)}
        </Box>
        <Box key={`${key}-paper-end`} position="absolute" left={0} right={0} bottom={0} height={1} overflow="hidden" flexDirection="column" justifyContent="flex-end">
          <Svg key={`${key}-paper-end-svg`} source={sheetEndSvg()} alt="kartka panelu RelAI: dół" height={SHEET_DRAW.end} />
        </Box>
        <Box key={`${key}-top`} position="absolute" top={0} left={0} right={0} {...inner}>{children}</Box>
      </Box>
    )
  }

  // The rule between the sections of a sheet (variant 3, accepted 2026-10-15): the hairline fading
  // at both ends that stands between the bars above the prompt, in both palettes. None on a terminal.
  const rule = (key: string) => (Svg
    ? <Box key={key} flexDirection="column"><Svg key={`${key}-svg`} source={RULE.svg} alt={RULE.alt} height={RULE.height} /></Box>
    : null)
  // Sections one under another, a rule between each two (variant 3: "jedna kartka"); the rule's own
  // 22 px of air is the whole gap, so the commands still fit a desktop's height (pane-v2.test.ts)
  const ruled = (prefix: string, items: RenderChildren[]) => [
    <Box key={`${prefix}-ruled`} flexDirection="column">
      {items.flatMap((it, i) => (i === 0 ? [it] : [rule(`${prefix}-rule-${i}`), it])).filter((x) => x !== null)}
    </Box>,
  ]

  return { sheet, rule, ruled, heading, fixed, isStacked, textAndAct, icon, mark, isFlash, btn, flashBorder, section, frame, folded, well, sentLine, factRow, confirmCard, tabs, barCols, figure, bar, costBox, line, money, nCalls, legend }
}

export type Parts = ReturnType<typeof parts>
