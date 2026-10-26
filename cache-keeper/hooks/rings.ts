// The cache bar's five batteries (AUDYT_MODOW Z11, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md
// §10): cache, limit 5 h, reset za, limit tygodnia, kontekst. On the bar a label and a value; the
// full words — line a and line b — in a card shown while the pointer is on the battery's icon.
// Pure: no `$` here (P-023 pkt 10), so the band in register.tsx and the tests reach the same words.
//
// Like a phone's battery, a battery shows what is LEFT (1 % used → 99 % full), while the value
// beside it says what the app counts (the percent used, the tokens used); the card says both.
// A fill comes from the very numbers the words show (the minutes left, the rounded percent), so
// the band's stamp — these words — decides every redraw (Z4).

import { BAND, BAR, BATTERY, KEY, RING, inkCss, inkOf, leftColor } from './relai/theme.mjs'
import { clock, minutes, tokens } from './fmt'
import { DEFAULT_THRESHOLD, SOURCE_WORDS, type ThresholdSource } from './limit'

export type MeasureName = 'cache' | 'five' | 'reset' | 'week' | 'ctx'
// fill 0..1 of the battery drawn, the share left; null draws a bare outline (never a seeming zero).
// note: a small second line under the label (Aneks D), only on a limit battery that is not calm
export type Measure = { name: MeasureName, fill: number | null, color: string, label: string, value: string, a: string, b: string, note?: string }
export type Limit = { kind: string, percentUsed: number, resetsAt?: string }
export type CacheLook = { kind: string, left: number, ttlMin: number, isAssumed: boolean, rewrite: string, keptUntil: number }

export const MISSING = 'brak danych'
const MIN = 60_000
const DAY = 24 * 60 * MIN
const FIVE_HOURS = 5 * 60 * MIN

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const two = (n: number) => String(n).padStart(2, '0')
const missing = (name: MeasureName, label: string, a: string): Measure => ({ name, fill: null, color: RING.track, label, value: MISSING, a, b: MISSING })

// The time left as the bar shows it: seconds in the last minute, else minutes
function leftText(left: number, tilde: string): { text: string, ms: number } {
  if (left < MIN) {
    const s = Math.max(1, Math.round(left / 1000))
    return { text: `${tilde}${s} s`, ms: s * 1000 }
  }
  const m = Math.round(left / MIN)
  return { text: `${tilde}${m} min`, ms: m * MIN }
}

// Cache: the time left of the TTL, emptying. The state's word stands inline only when it is news
// (stygnie, zimny, podtrzymany); cold is always clay. The card names the TTL, or the rewrite.
export function cacheMeasure(c: CacheLook): Measure {
  if (c.kind === 'unknown') return missing('cache', 'cache', 'cache')
  if (c.kind === 'cold') return { name: 'cache', fill: 0, color: leftColor(0, true), label: 'cache', value: 'zimny', a: `Zimny · od ${minutes(-c.left)}`, b: `zapis ≈ ${c.rewrite}` }
  const shown = leftText(Math.max(0, c.left), c.isAssumed ? '~' : '')
  const percent = (shown.ms / (c.ttlMin * MIN)) * 100
  const b = `TTL ${c.ttlMin} min${c.isAssumed ? ' założony' : ''}`
  const look = { name: 'cache' as const, fill: clamp(percent / 100), color: leftColor(percent), label: 'cache', b }
  if (c.kind === 'kept') return { ...look, value: `podtrzymany do ${clock(c.keptUntil)}`, a: `Podtrzymany · do ${clock(c.keptUntil)}` }
  if (c.kind === 'cooling') return { ...look, value: `stygnie ${shown.text}`, a: `Stygnie · ${shown.text}` }
  return { ...look, value: shown.text, a: `Ciepły · ${shown.text}` }
}

// When a window resets, in local time: today the hour, tomorrow "jutro", later the date
export function resetText(iso: string | undefined, now: number): string {
  const at = iso ? Date.parse(iso) : NaN
  if (!Number.isFinite(at)) return 'reset nieznany'
  const midnight = (ts: number) => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
  const days = Math.round((midnight(at) - midnight(now)) / DAY)
  if (days <= 0) return `reset ${clock(at)}`
  if (days === 1) return `reset jutro ${clock(at)}`
  const d = new Date(at)
  return `reset ${d.getDate()}.${two(d.getMonth() + 1)} ${clock(at)}`
}

// A plan limit: the value is the percent used, the battery what is left of it. From the threshold
// up (limit.ts, LIMIT_CHECKPOINT E1) the fill is clay whatever is left; a missing figure stays bare.
// A battery that is not calm (mustard or clay) says under its label from which threshold, and whose
// (Aneks D: "próg 90 % · ta sesja"); a calm one says nothing there.
export function limitMeasure(name: 'five' | 'week', label: string, window: string, limit: Limit | undefined, now: number, threshold: number = DEFAULT_THRESHOLD, source: ThresholdSource = 'domyślny'): Measure {
  if (!limit || !Number.isFinite(limit.percentUsed)) return missing(name, label, label)
  const used = Math.round(limit.percentUsed)
  const left = Math.max(0, 100 - used)
  const color = used >= threshold ? BAND.cache.color : leftColor(left)
  return {
    name, fill: clamp(left / 100), color, label, value: `${used} %`,
    a: `${used} % · ${window}`, b: `zużyte ${used} % · zostało ${left} % · ${resetText(limit.resetsAt, now)} · próg ${threshold} %`,
    ...(color === BAR.segment.done ? {} : { note: `próg ${threshold} % · ${SOURCE_WORDS[source]}` }),
  }
}

// A span of time as the brief writes it: "12 min", "1 h 06 min"
function span(ms: number): string {
  const m = Math.max(1, Math.round(ms / MIN))
  return m >= 60 ? `${Math.floor(m / 60)} h ${two(m % 60)} min` : `${m} min`
}

// The time to the 5-hour window's reset, draining over the window; always sage — a reset coming
// is no alarm. No reset time, or one already past: an empty battery, never "0 min".
export function resetMeasure(limit: Limit | undefined, now: number): Measure {
  const at = limit?.resetsAt ? Date.parse(limit.resetsAt) : NaN
  if (!Number.isFinite(at) || at <= now) return missing('reset', 'reset za', 'Reset limitu 5 h')
  const left = span(at - now)
  return { name: 'reset', fill: clamp((at - now) / FIVE_HOURS), color: BAR.segment.done, label: 'reset za', value: left, a: `Reset limitu 5 h za ${left}`, b: resetText(limit?.resetsAt, now) }
}

// A window in round units as the brief writes it: 1M, 200k
export function windowText(n: number): string {
  if (n >= 1e6 && n % 1e6 === 0) return `${n / 1e6}M`
  if (n >= 1e3 && n % 1e3 === 0) return `${n / 1e3}k`
  return tokens(n)
}

// The context: the value is the tokens used, the battery the share of the window still free
export function contextMeasure(used: number, window: number): Measure {
  if (!(used > 0)) return missing('ctx', 'kontekst', 'kontekst')
  const value = tokens(used)
  const a = `${value} · kontekst`
  if (!(window > 0)) return { name: 'ctx', fill: null, color: RING.track, label: 'kontekst', value, a, b: MISSING }
  const free = Math.max(0, 100 - Math.round((used / window) * 100))
  return { name: 'ctx', fill: clamp(free / 100), color: leftColor(free), label: 'kontekst', value, a, b: `zużyte ${value} z ${windowText(window)} · wolne ${free} %` }
}

// ---------- the terminal ----------

// ◔ ◑ ◕ ● by the share left; ○ for an empty battery
export function measureGlyph(fill: number | null): string {
  if (!fill || fill <= 0) return '○'
  if (fill < 0.375) return '◔'
  if (fill < 0.625) return '◑'
  if (fill < 0.875) return '◕'
  return '●'
}

// The glyph's color as a theme key (WYGLAD_PANELU E1): the state's key; an empty battery's track
// would vanish on the bar, so it takes the muted key
const GLYPH_KEY: Readonly<Record<string, string>> = { done: KEY.done, running: KEY.running, failed: KEY.failed, track: KEY.muted, muted: KEY.muted }
export const glyphColor = (m: Measure): string => GLYPH_KEY[inkOf(m.color)] ?? KEY.muted

// The terminal's grid (ZGLOSZENIA E3, #2, variant A, Łukasz 2026-10-26): a glyph, the label and the
// value per measure, no line b — the reset and the threshold are in /cache. Columns of one width:
// the widest "glyph label value" and the gap, as many as fit the middle's cells, at most three.
// Counted in terminal cells, never in pixels (P-024); a glyph ◔ ◑ ◕ ● ○ is East Asian "ambiguous"
// and takes one cell in conhost (measured at 80 and 120 columns, 2026-10-26) — a terminal set to
// wide ambiguous glyphs draws it in two. A cell wider than the middle: one column,
// whose label wraps under the glyph while the value keeps its width.
export const TERM = Object.freeze({ gap: 2, maxCols: 3 })

const cells = (s: string) => [...s].length
export const termCellWidth = (m: Measure): number => cells(measureGlyph(m.fill)) + 1 + cells(m.label) + 1 + cells(m.value)

export function termColumns(measures: readonly Measure[], middle: number): { cols: number, width: number } {
  const width = Math.max(0, ...measures.map(termCellWidth))
  const fit = Math.floor((middle + TERM.gap) / (width + TERM.gap))
  return { cols: Math.max(1, Math.min(TERM.maxCols, measures.length, fit)), width }
}

export function termRows(measures: readonly Measure[], middle: number): Measure[][] {
  const { cols } = termColumns(measures, middle)
  return measures.reduce<Measure[][]>((rows, m, i) => (i % cols ? [...rows.slice(0, -1), [...rows[rows.length - 1], m]] : [...rows, [m]]), [])
}

// ---------- the desktop: one interactive Svg per row ----------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const round = (n: number) => n.toFixed(2)

// The icon at (x, y): a body outlined in the muted ink, a nub, the fill inside in the state's ink
// (WYGLAD_PANELU E1: painted by class, two palettes switched by `prefers-color-scheme`, P-042)
function batteryIcon(x: number, y: number, m: Measure): string {
  const { w, h } = BATTERY.icon
  const body = w - 4
  const inner = m.fill === null ? 0 : (body - 4) * clamp(m.fill)
  return `<rect class="s-muted" x="${round(x + 0.75)}" y="${round(y + 0.75)}" width="${body}" height="${h - 1.5}" rx="3" fill="none" stroke-width="1.5"/>`
    + `<rect class="f-muted" x="${round(x + body + 1.5)}" y="${round(y + h / 2 - 2.5)}" width="2" height="5" rx="1"/>`
    + (inner > 0 ? `<rect class="f f-${inkOf(m.color)}" x="${round(x + 2.5)}" y="${round(y + 2.5)}" width="${round(inner)}" height="${h - 5}" rx="1.5"/>` : '')
}

// The note under a label (Aneks D): 11 px, a width per character that errs wide; a row with a note
// is this tall, a row without one keeps BATTERY.height
const NOTE = { font: 11, char: 5.3, y: 32, rowHeight: 36 } as const // char: 4.9 px measured in Chromium

const measureWidth = (m: Measure) => {
  const words = (m.label.length + m.value.length) * BATTERY.char + BATTERY.spanGap
  return BATTERY.icon.w + BATTERY.icon.gap + Math.max(words, (m.note?.length ?? 0) * NOTE.char)
}

type Placed = { x: number, m: Measure }

// The measures in a grid over the whole width (WYGLAD_PANELU E5, variant S2, Łukasz 2026-10-15:
// „siatka na całą szerokość”): as many equal columns as the widest measure and its gap allow, each
// column maxPx / cols wide; a measure that does not fit goes to the next row into the same columns,
// so every row's batteries stand under the row above (Aneks G: "limit tygodnia […] zupełnie rozjechany")
export function columnsOf(measures: readonly Measure[], maxPx: number): { cols: number, step: number } {
  const colW = Math.max(0, ...measures.map(measureWidth))
  const cols = Math.max(1, Math.min(Math.max(1, measures.length), Math.floor((maxPx + BATTERY.itemGap) / (colW + BATTERY.itemGap))))
  return { cols, step: maxPx / cols }
}

export function grid(measures: readonly Measure[], maxPx: number): Placed[][] {
  if (!measures.length) return []
  const { cols, step } = columnsOf(measures, maxPx)
  const rows: Placed[][] = []
  measures.forEach((m, i) => {
    const r = Math.floor(i / cols)
    rows[r] = [...(rows[r] ?? []), { x: (i % cols) * step, m }]
  })
  return rows
}

// The rows of batteries, each one Svg of width="100%" — laid out from the column's left edge,
// where a fixed width is centred in the interactive frame (P-024 pkt 1) — with no background of
// their own: the frame shows the band through (measured 2026-10-14, WYGLAD_PANELU E1; P-018 pkt 2
// held a white frame under the 2.1.293 band).
//
// The full words of a measure — line a, then line b — stand in the <title> of its icon, which the
// app shows as its own tooltip (WYGLAD_PANELU E5, Łukasz 2026-10-15: „Moze to samo zrobmy z
// bateriami?” after the same choice for "Teraz"). It replaces the capsule of brief §10.3: drawn by
// us, the capsule was cut at the column's edge in the grid over the whole width, covered its icon
// and flickered when pushed inside, and grew its row when wrapped. The app's tooltip is never cut,
// never covers the icon and never changes the row, which keeps its height (24 px, 36 with a note).
export function batteryRows(measures: readonly Measure[], maxPx: number): { svg: string, alt: string, height: number }[] {
  return grid(measures, maxPx).map((placed) => {
    const height = placed.some((p) => p.m.note) ? NOTE.rowHeight : BATTERY.height
    const drawn = placed.map((p, i) => {
      const tx = p.x + BATTERY.icon.w + BATTERY.icon.gap
      return `<g class="i i${i} b-${p.m.name}"><title>${esc(p.m.a)}\n${esc(p.m.b)}</title><rect x="${round(p.x - 3)}" y="0" width="${BATTERY.icon.w + 6}" height="${height}" fill="transparent"/>${batteryIcon(p.x, BATTERY.icon.y, p.m)}</g>`
        + `<text class="w" x="${round(tx)}" y="${BATTERY.textY}" font-size="${BATTERY.font}"><tspan class="l f-muted">${esc(p.m.label)}</tspan>`
        + `<tspan class="v f-text" dx="${BATTERY.spanGap}" font-weight="600">${esc(p.m.value)}</tspan></text>`
        + (p.m.note ? `<text class="n f-muted" x="${round(tx)}" y="${NOTE.y}" font-size="${NOTE.font}">${esc(p.m.note)}</text>` : '')
    })
    const css = `text{font-family:system-ui,'Segoe UI',sans-serif}${inkCss()}`
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}"><style>${css}</style>${drawn.join('')}</svg>`,
      alt: placed.map((p) => `${p.m.a}, ${p.m.b}${p.m.note ? `, ${p.m.note}` : ''}`).join('; '),
      height,
    }
  })
}

// ---------- the context as its own row (WYGLAD_PANELU E5, variant K1) ----------

// The context: Łukasz 2026-10-15, „ten K1 z tym paskiem […] to może zostać”. The app's own bar no
// longer shows how full the context is (Aneks G), so the row says it without a hover: the label, a
// bar of the window used in the colour of what is left, and "used / window · %". The window comes
// from the session (`usage().context.window`, `session.measure`), never from a table of models.
// No window reported: null, and the context stays a battery in the grid. A row too narrow for the
// label, a bar of CTX.minBar and the words goes to two lines: the label and the words, then the bar.
export const CTX = Object.freeze({ bar: 8, gap: 14, twoLines: 46, notch: 3 })

// Where compaction runs, as Claude Code 2.1.295 reckons it (read in the app's binary 2026-10-15):
// the breakdown's `autoCompactThreshold` is the effective window less a 13k buffer and leaves
// CLAUDE_AUTOCOMPACT_PCT_OVERRIDE out, while compaction takes min(floor(effective × pct / 100),
// effective − 13k) for a pct in (0, 100]. Live: 967k on the bar, compaction at 637k with 65 %.
const COMPACT_BUFFER = 13_000
export function compactThreshold(engine: number, pctOverride: string | undefined): number {
  if (!(engine > 0)) return 0
  const pct = pctOverride === undefined ? NaN : parseFloat(pctOverride)
  if (!(pct > 0 && pct <= 100)) return engine
  return Math.min(Math.floor((engine + COMPACT_BUFFER) * (pct / 100)), engine)
}

// Łukasz 2026-10-15: „na całą szerokość […] od pierwszej baterii do końcowej baterii”; then the
// words anchored at the right edge: „wystaje mi / 1M · 32 % poza […] zgrabniej wyrownac”; then:
// „po lewej stronie jest ikona, a po drugiej jest napis i procenty […] ten kontekst powinien być
// pomiędzy tym paskiem, a tym fizyczną liczbą tokenów”. So the row speaks the batteries' grammar —
// the mark, the muted label, the bold value — on their grid (columnsOf): the bar runs from the
// first column to the last one, where "kontekst 320k / 1M · 32 %" starts with that column's
// battery, moved left only as far as its words need to end inside the column. One column: the
// label and the value on a line, the bar under them, as wide as the column.
//
// Aneks H (Łukasz 2026-10-15): „zmienialo kolor z zielonego na zolty a potem czerwony jak sie
// zbliza kontekst do tego limitu”, the threshold marked „tak jak […] limit 90% w zakladce koszty”.
// With the engine's auto-compact threshold (`compactAt`, tokens) the bar is coloured by the way
// left to it — the batteries' rule, clay from the threshold on — and a notch as on the Koszty
// ruler stands at it; its words go to the app's tooltip, never over the notch, so the row keeps
// its 24 px. No threshold (auto-compact off, not reported): the bar by the window, no notch.
export function contextRow(used: number, window: number, cols: number, step: number, compactAt = 0): { svg: string, alt: string, height: number, words: string } | null {
  if (!(used > 0) || !(window > 0)) return null
  const share = Math.min(1, used / window)
  const pct = Math.round(share * 100)
  const value = `${tokens(used)} / ${windowText(window)} · ${pct} %`
  const at = compactAt > 0 && compactAt <= window ? compactAt : 0
  const toCompact = at ? Math.max(0, Math.round(((at - used) / at) * 100)) : 0
  const ink = inkOf(leftColor(at ? toCompact : Math.max(0, 100 - pct)))
  const wordsW = ('kontekst'.length + value.length) * BATTERY.char + BATTERY.spanGap
  const isOneLine = cols > 1
  const right = cols * step - BATTERY.itemGap
  const textX = isOneLine ? Math.min((cols - 1) * step, right - wordsW) : 0
  const barW = isOneLine ? Math.max(CTX.bar, textX - CTX.gap) : Math.max(CTX.bar, step - BATTERY.itemGap)
  const barY = isOneLine ? (BATTERY.height - CTX.bar) / 2 : BATTERY.height + 6
  const height = isOneLine ? BATTERY.height : CTX.twoLines
  const css = `text{font-family:system-ui,'Segoe UI',sans-serif}${inkCss()}`
  const bar = `<rect class="k f-track" x="0" y="${round(barY)}" width="${round(barW)}" height="${CTX.bar}" rx="${CTX.bar / 2}"/>`
    + `<rect class="u f-${ink}" x="0" y="${round(barY)}" width="${round(Math.max(CTX.bar, barW * share))}" height="${CTX.bar}" rx="${CTX.bar / 2}"/>`
  const compactWords = at ? `auto-compact przy ${tokens(at)} · ${Math.round((at / window) * 100)} %` : ''
  // The notch as on the Koszty ruler: 2 px wide, 3 px over the bar on each side, in the text's ink
  const notch = at ? `<rect class="n f-text" x="${round(barW * (at / window) - 1)}" y="${round(barY - CTX.notch)}" width="2" height="${CTX.bar + 2 * CTX.notch}" rx="1"/>` : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}"><style>${css}</style>`
    + (at ? `<g class="c"><title>${esc(compactWords)}</title>${bar}${notch}</g>` : bar)
    + `<text class="w" x="${round(textX)}" y="${BATTERY.textY}" font-size="${BATTERY.font}"><tspan class="l f-muted">kontekst</tspan>`
    + `<tspan class="v f-text" dx="${BATTERY.spanGap}" font-weight="600">${esc(value)}</tspan></text></svg>`
  return { svg, alt: `kontekst: zużyte ${tokens(used)} z ${windowText(window)} · ${pct} %${at ? ` · ${compactWords}` : ''}`, height, words: `kontekst ${value}` }
}
