// relai-progress: the segments of the bar above the prompt and the small line under them, in one
// Svg (AUDYT_MODOW Z1, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md, 3). No `$` here (P-023
// pkt 10): register.tsx passes the items and the colors.
//
// Geometry, brief v2: segments 8 px, a gap of 4 px, a line of 14 px (font 11.5 px) — 26 px. The
// line holds the calm words (`w toku: … · następny: …`) in the muted color; hovering a segment
// swaps them for that item's `<mark> i/N · <name>` in the text color. Hover hides the calm line
// alone: the segments never vanish under the hint. Drawn with isInteractive, where :hover and ~
// work (P-020 pkt 8); the markup carries its width (P-020 pkt 7). SVG text does not wrap, so each
// line is clipped to the characters the caller's slot holds.

//
// WYGLAD_PANELU E1 (accepted 2026-10-14): the marks are painted by class from the inks of
// core/panel/theme.mjs — dark by default, light under `prefers-color-scheme` (P-042) — with no
// background of their own, and with more air: 4 px above the segments and 9 px between them and the
// line (Łukasz, round 1: "za małe odstępy między tymi liniami"), 36 px in all.

import type { Item } from './core/progress.mjs'
import { INK, inkCss } from './core/theme.mjs'

export const LINE = Object.freeze({ top: 4, bar: 8, gap: 9, line: 15, font: 11.5, share: 0.94, baseline: 32 })
export const SEGMENTS_HEIGHT = LINE.top + LINE.bar + LINE.gap + LINE.line

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function clipTo(text: string, max: number): string {
  return text.length > max ? text.slice(0, Math.max(0, max - 1)) + '…' : text
}

// What the line says while nothing is hovered: the item in progress, if any, and the next one
export function calmLine(items: readonly Item[]): string {
  const running = items.find((it) => it.status === 'running')
  const next = items.find((it) => it.status === 'pending')
  const parts = [running ? `w toku: ${running.name}` : '', next ? `następny: ${next.name}` : ''].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'wszystkie punkty odhaczone'
}

// A segment's hover words: its mark, its place among all, its full name
export function itemLine(mark: string, index: number, total: number, name: string): string {
  return `${mark} ${index}/${total} · ${name}`
}

// `ink` names the segment's color in core/panel/theme.mjs INK (SEGMENT_INK by the item's state)
export type Segment = { ink: string, hover: string }
export type SegmentLook = { calm: string, chars: number }

// The Svg markup, or null for no segments (the caller says so in words)
export function segmentArt(segs: readonly Segment[], o: SegmentLook): string | null {
  if (segs.length === 0) return null
  const slot = 100 / segs.length
  const max = Math.max(12, o.chars)
  const target = LINE.top + LINE.bar + LINE.gap // the whole height above the line answers the pointer
  const line = (cls: string, ink: string, text: string) =>
    `<text class="${cls} f-${ink}" x="0" y="${LINE.baseline}">${esc(clipTo(text, max))}</text>`
  const bars = segs.map((s, i) => `<svg class="b b${i}" x="${(i * slot).toFixed(3)}%" y="0" width="${(slot * LINE.share).toFixed(3)}%" height="${target}" overflow="visible">`
    + `<rect width="100%" height="${target}" fill="transparent"/>`
    + `<rect class="c f-${s.ink}" y="${LINE.top}" width="100%" height="${LINE.bar}" rx="2" ry="2"/></svg>`)
  const tips = segs.map((s, i) => line(`t t${i}`, 'text', s.hover))
  const css = `text{font-family:'Segoe UI',system-ui,sans-serif;font-size:${LINE.font}px}.t{display:none}`
    + inkCss()
    + `.b:hover .c{filter:brightness(1.3);stroke:${INK.dark.text};stroke-width:1}@media (prefers-color-scheme: light){.b:hover .c{stroke:${INK.light.text}}}`
    + segs.map((_, i) => `.b${i}:hover~.t${i}`).join(',') + '{display:inline}'
    + segs.map((_, i) => `.b${i}:hover~.d`).join(',') + '{display:none}'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${SEGMENTS_HEIGHT}">`
    + `<style>${css}</style>`
    + `${bars.join('')}${line('d', 'muted', o.calm)}${tips.join('')}</svg>`
}
