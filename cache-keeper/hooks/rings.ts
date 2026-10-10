// The cache bar's four rings (AUDYT_MODOW Z1, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md §4):
// cache, 5 h, week and context, each with a two-line caption. Pure: no `$` here (P-023 pkt 10),
// so the band in register.tsx and the tests reach the same words.
//
// A ring's fill comes from the very numbers its caption shows (the minutes left, the rounded
// percent), so the band's stamp — these words — decides every redraw (Z4).

import { BAR, RING, cacheColor, usageColor } from './relai/theme.mjs'
import { clock, minutes, tokens } from './fmt'

export type RingName = 'cache' | 'five' | 'week' | 'ctx'
// fill 0..1 of the ring drawn; 0 or null draws the bare track (an empty ring, never a seeming zero)
export type Ring = { name: RingName, fill: number | null, color: string, a: string, b: string }
export type Limit = { kind: string, percentUsed: number, resetsAt?: string }
export type CacheLook = { kind: string, left: number, ttlMin: number, isAssumed: boolean, rewrite: string, keptUntil: number }

export const MISSING = 'brak danych'
const MIN = 60_000
const DAY = 24 * 60 * MIN

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const two = (n: number) => String(n).padStart(2, '0')

// The time left as the figure on the right shows it: seconds in the last minute, else minutes
function leftText(left: number, tilde: string): { text: string, ms: number } {
  if (left < MIN) {
    const s = Math.max(1, Math.round(left / 1000))
    return { text: `${tilde}${s} s`, ms: s * 1000 }
  }
  const m = Math.round(left / MIN)
  return { text: `${tilde}${m} min`, ms: m * MIN }
}

// Cache: the time left of the TTL, emptying; sage, mustard at 35 % left or less, clay at 15 % or
// less and when cold (the theme's cacheColor). Line 2 names the TTL, or a cold cache's rewrite.
export function cacheRing(c: CacheLook): Ring {
  const ttlLine = `TTL ${c.ttlMin} min${c.isAssumed ? ' założony' : ''}`
  if (c.kind === 'unknown') return { name: 'cache', fill: null, color: RING.track, a: 'cache', b: MISSING }
  if (c.kind === 'cold') return { name: 'cache', fill: 0, color: cacheColor(0, true), a: `Zimny · od ${minutes(-c.left)}`, b: `zapis ≈ ${c.rewrite}` }
  const shown = leftText(c.left, c.isAssumed ? '~' : '')
  const percent = (shown.ms / (c.ttlMin * MIN)) * 100
  const word = c.kind === 'kept' ? `Podtrzymany · do ${clock(c.keptUntil)}` : `${c.kind === 'cooling' ? 'Stygnie' : 'Ciepły'} · ${shown.text}`
  return { name: 'cache', fill: clamp(percent / 100), color: cacheColor(percent), a: word, b: ttlLine }
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

// A plan limit: the percent used, filling; the color by the theme's thresholds (70, 90)
export function limitRing(name: 'five' | 'week', label: string, limit: Limit | undefined, now: number): Ring {
  if (!limit || !Number.isFinite(limit.percentUsed)) return { name, fill: null, color: RING.track, a: label, b: MISSING }
  const shown = Math.round(limit.percentUsed)
  return { name, fill: clamp(shown / 100), color: usageColor(shown), a: `${shown} % · ${label}`, b: resetText(limit.resetsAt, now) }
}

// A window in round units as the brief writes it: 1M, 200k
function windowText(n: number): string {
  if (n >= 1e6 && n % 1e6 === 0) return `${n / 1e6}M`
  if (n >= 1e3 && n % 1e3 === 0) return `${n / 1e3}k`
  return tokens(n)
}

// The context: its tokens of the model's window
export function contextRing(used: number, window: number): Ring {
  if (!(used > 0)) return { name: 'ctx', fill: null, color: RING.track, a: 'kontekst', b: MISSING }
  const a = `${tokens(used)} · kontekst`
  if (!(window > 0)) return { name: 'ctx', fill: null, color: RING.track, a, b: MISSING }
  const percent = Math.round((used / window) * 100)
  return { name: 'ctx', fill: clamp(percent / 100), color: usageColor(percent), a, b: `z ${windowText(window)} · ${percent} %` }
}

// ---------- the terminal ----------

// ◔ ◑ ◕ ● by the fill; ○ for an empty ring
export function ringGlyph(fill: number | null): string {
  if (!fill || fill <= 0) return '○'
  if (fill < 0.375) return '◔'
  if (fill < 0.625) return '◑'
  if (fill < 0.875) return '◕'
  return '●'
}

// The glyph's color: an empty ring's track would vanish on the bar, so it takes the muted text
export const glyphColor = (r: Ring): string => (r.color === RING.track ? BAR.muted : r.color)

// ---------- the desktop: Svg rows ----------

// Pixels of the drawing; the caption's advance is a generous mean of 11 px Segoe UI (no layout
// engine in SVG: the estimate errs wide, so a caption never runs into the next ring)
export const RINGS_HEIGHT = 26
const CAPTION = { font: 11, char: 6.3, gap: 6, line1: 11, line2: 23 }
const COST = { font: 12, char: 6.9, baseline: 17 }
const ITEM_GAP = 18

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Item = { width: number, draw: (x: number) => string, alt: string }

function ringItem(r: Ring): Item {
  const d = RING.diameter
  const width = d + CAPTION.gap + Math.max(r.a.length, r.b.length) * CAPTION.char
  return {
    width,
    alt: `${r.a}, ${r.b}`,
    draw: (x) => {
      const cx = x + d / 2
      const cy = RINGS_HEIGHT / 2
      // the radius leaves room for the hover stroke inside the ring's box
      const radius = (d - RING.hoverStroke) / 2
      const round = (n: number) => n.toFixed(2)
      const c = 2 * Math.PI * radius
      const fill = r.fill && r.fill > 0
        ? `<circle class="f" cx="${round(cx)}" cy="${cy}" r="${radius}" fill="none" stroke="${r.color}" stroke-width="${RING.stroke}" stroke-linecap="round" stroke-dasharray="${round(c)} ${round(c)}" stroke-dashoffset="${round(c * (1 - r.fill))}" transform="rotate(-90 ${round(cx)} ${cy})"/>`
        : ''
      const tx = round(x + d + CAPTION.gap)
      return `<g class="r r-${r.name}"><rect x="${round(x)}" y="0" width="${round(width)}" height="${RINGS_HEIGHT}" fill="transparent"/>`
        + `<circle class="k" cx="${round(cx)}" cy="${cy}" r="${radius}" fill="none" stroke="${RING.track}" stroke-width="${RING.stroke}"/>${fill}`
        + `<text class="a" x="${tx}" y="${CAPTION.line1}">${esc(r.a)}</text><text class="b" x="${tx}" y="${CAPTION.line2}">${esc(r.b)}</text></g>`
    },
  }
}

function costItem(text: string): Item {
  return { width: text.length * COST.char, alt: text, draw: (x) => `<text class="s" x="${x.toFixed(2)}" y="${COST.baseline}">${esc(text)}</text>` }
}

// The rings left to right and the session's cost after them, packed into as few rows as the slot
// of `maxPx` takes — one row at a usual width; each row one Svg with its width in the markup
// (P-020 pkt 7), drawn with isInteractive so CSS :hover thickens a ring (P-020 pkt 8) and painted
// with the bar's background (an interactive frame is white otherwise, P-018 pkt 2)
export function ringRows(rings: readonly Ring[], cost: string, maxPx: number, background: string): { svg: string, alt: string }[] {
  const items = [...rings.map(ringItem), costItem(cost)]
  const rows: Item[][] = []
  let row: Item[] = []
  let width = 0
  for (const item of items) {
    const need = (row.length ? ITEM_GAP : 0) + item.width
    if (row.length && width + need > maxPx) {
      rows.push(row)
      row = []
      width = 0
    }
    width += (row.length ? ITEM_GAP : 0) + item.width
    row.push(item)
  }
  if (row.length) rows.push(row)
  const css = `text{font-family:'Segoe UI',system-ui,sans-serif;font-size:${CAPTION.font}px}.a{fill:${BAR.text}}.b{fill:${BAR.muted}}`
    + `.s{fill:${BAR.muted};font-size:${COST.font}px}.r:hover .k{stroke-width:${RING.hoverStroke}}.r:hover .f{stroke-width:${RING.hoverStroke}}`
  return rows.map((items) => {
    let x = 0
    const parts = items.map((item, i) => {
      if (i) x += ITEM_GAP
      const drawn = item.draw(x)
      x += item.width
      return drawn
    })
    const w = Math.ceil(x)
    return {
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${RINGS_HEIGHT}" viewBox="0 0 ${w} ${RINGS_HEIGHT}">`
        + `<style>${css}</style><rect width="100%" height="100%" fill="${background}"/>${parts.join('')}</svg>`,
      alt: items.map((item) => item.alt).join('; '),
    }
  })
}
