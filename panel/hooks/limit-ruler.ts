// The ruler of a plan limit on the Koszty tab (LIMIT_CHECKPOINT E4, Aneks E; Łukasz's choice
// 2026-10-11, W1 with the value buttons of W3): 0–100 %, filled to what is used now in the cache
// bar's battery colour, the threshold as a notch with its label, the room left in words beneath.
// Pure: no `$` here (P-023 pkt 10), so the tab and the tests reach the same drawing.

import { BAND, THEME, leftColor } from './core/theme.mjs'

export type LimitWindow = 'five' | 'week'

// The value buttons of each window: the keeper's own choices (Aneks B), an own value added
const PRESETS: Readonly<Record<LimitWindow, readonly number[]>> = { five: [85, 90, 95], week: [95, 98, 99] }

export const presetsFor = (window: LimitWindow, current: number): number[] =>
  [...new Set([...PRESETS[window], current])].sort((a, b) => a - b)

// The cache bar's rule (core theme): clay from the threshold; below it by what is left
export const rulerColor = (used: number, threshold: number): string =>
  used >= threshold ? BAND.cache.color : leftColor(100 - used)

export function usedWords(used: number | null, threshold: number): string {
  if (used === null) return 'brak danych o zużyciu'
  return used >= threshold ? `zużyte ${used} % · ponad progiem` : `zużyte ${used} % · do progu ${threshold - used} pkt`
}

// Measured in Chromium (12 px system-ui): a line box reaches 12.8 px above its baseline and 3.2 px
// below it, so the label's baseline is 13 and the words' 42 in a 46 px drawing, the words 1 px in
export const RULER_HEIGHT = 46
const FONT = 12
const TRACK_Y = 18
const NOTCH = { y: 15, h: 14 }

// One interactive Svg of width="100%" (the frame P-024 pkt 1 knows; text keeps its shape, which a
// stretched viewBox would not). The label stands on the side of the notch with more room.
export function rulerSvg(used: number | null, threshold: number): string {
  const lean = threshold >= 50 ? 'text-anchor="end" dx="-6"' : 'text-anchor="start" dx="6"'
  const fill = used === null ? '' : `<rect class="fill" x="0" y="${TRACK_Y}" width="${Math.max(0, Math.min(100, used))}%" height="8" rx="4" fill="${rulerColor(used, threshold)}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${RULER_HEIGHT}"><style>text{font-family:system-ui,'Segoe UI',sans-serif}</style>`
    + `<rect x="0" y="${TRACK_Y}" width="100%" height="8" rx="4" fill="${THEME.lineOff}"/>${fill}`
    + `<rect x="${threshold}%" y="${NOTCH.y}" width="2" height="${NOTCH.h}" rx="1" transform="translate(-1 0)" fill="${THEME.title}"/>`
    + `<text x="${threshold}%" y="13" ${lean} font-size="${FONT}" font-weight="600" fill="${THEME.title}">próg ${threshold} %</text>`
    + `<text x="1" y="${RULER_HEIGHT - 4}" font-size="${FONT}" fill="${THEME.body}">${usedWords(used, threshold)}</text></svg>`
}
