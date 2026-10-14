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
function windowText(n: number): string {
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

// The measures left to right in as few rows as `maxPx` takes — one row at a usual width
function pack(measures: readonly Measure[], maxPx: number): Placed[][] {
  const rows: Placed[][] = []
  let row: Placed[] = []
  let x = 0
  for (const m of measures) {
    const w = measureWidth(m)
    if (row.length && x + BATTERY.itemGap + w > maxPx) {
      rows.push(row)
      row = []
      x = 0
    }
    if (row.length) x += BATTERY.itemGap
    row.push({ x, m })
    x += w
  }
  if (row.length) rows.push(row)
  return rows
}

// A measure's card: lines a and b on a capsule, to the right of the icon, or to its left when the
// right would run past the column; when neither fits, the side with more room — never over the
// icon, which holds the pointer, so the card does not flicker (P-024 pkt 5). The width keeps the
// slack of the calibrated probe: a separator's worth that covers the wider bold line a.
function card(p: Placed, i: number, maxPx: number): string {
  const C = BATTERY.card
  const w = `${p.m.a}  ·  ${p.m.b}`.length * C.char + 2 * C.pad
  const right = p.x + BATTERY.icon.w + C.gap
  const left = p.x - C.gap - w
  const x = right + w <= maxPx || (left < 0 && maxPx - right >= p.x - C.gap) ? right : left
  const y = (BATTERY.height - C.h) / 2
  return `<g class="t t${i}"><rect class="f-card" x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${C.h}" rx="${C.h / 2}"/>`
    + `<text x="${round(x + C.pad)}" y="${round(y + 15)}" font-size="${C.font}"><tspan class="a f-text" font-weight="600">${esc(p.m.a)}</tspan>`
    + `<tspan class="b f-muted" dx="${C.lineGap}">${esc(p.m.b)}</tspan></text></g>`
}

// The rows of batteries, each one Svg of width="100%" — laid out from the column's left edge,
// where a fixed width is centred in the interactive frame (P-024 pkt 1) — with no background of
// their own: the frame shows the band through (measured 2026-10-14, WYGLAD_PANELU E1; P-018 pkt 2
// held a white frame under the 2.1.293 band). Each icon is the hover target of its card; the cards
// come after every measure, so a card paints over its neighbours.
export function batteryRows(measures: readonly Measure[], maxPx: number): { svg: string, alt: string, height: number }[] {
  return pack(measures, maxPx).map((placed) => {
    const height = placed.some((p) => p.m.note) ? NOTE.rowHeight : BATTERY.height
    const drawn = placed.map((p, i) => {
      const tx = p.x + BATTERY.icon.w + BATTERY.icon.gap
      return `<g class="i i${i} b-${p.m.name}"><rect x="${round(p.x - 3)}" y="0" width="${BATTERY.icon.w + 6}" height="${height}" fill="transparent"/>${batteryIcon(p.x, BATTERY.icon.y, p.m)}</g>`
        + `<text class="w" x="${round(tx)}" y="${BATTERY.textY}" font-size="${BATTERY.font}"><tspan class="l f-muted">${esc(p.m.label)}</tspan>`
        + `<tspan class="v f-text" dx="${BATTERY.spanGap}" font-weight="600">${esc(p.m.value)}</tspan></text>`
        + (p.m.note ? `<text class="n f-muted" x="${round(tx)}" y="${NOTE.y}" font-size="${NOTE.font}">${esc(p.m.note)}</text>` : '')
    })
    const css = `text{font-family:system-ui,'Segoe UI',sans-serif}.t{display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}${inkCss()}`
      + placed.map((_, i) => `.i${i}:hover~.t${i}{display:inline}`).join('')
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}"><style>${css}</style>`
        + `${drawn.join('')}${placed.map((p, i) => card(p, i, maxPx)).join('')}</svg>`,
      alt: placed.map((p) => `${p.m.a}, ${p.m.b}${p.m.note ? `, ${p.m.note}` : ''}`).join('; '),
      height,
    }
  })
}
