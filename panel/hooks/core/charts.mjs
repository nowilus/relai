// RelAI core / panel: charts — the drawings of the cost report (plan PANEL_CLAUDE, E3).
//
// Geometry only: no word is placed by a coordinate here (L-0137, "layout bez rozjazdów"). Labels
// stand beside the drawings in the pane's own boxes, where the surface lays them out. The one
// text in an SVG is a figure in Kalam, whose width is summed from the font's own advances
// (NUMERALS, generated with the headings), never guessed.
// A desktop draws these as Svg; the terminal gets the same figures as blocks of text. Every
// drawing carries width="1000": an Svg element without a width takes the markup's own width
// (2.1.293 types), and markup without one drew nothing on the desktop (E3, live, 2026-10-08).
//
// ESM without engine or Node API, for the same reason as cache-timer.mjs; the plugin carries a
// byte-identical copy written by core/tools/sync-panel-core.js.

import { NUMERALS } from './headings.mjs';

/** @typedef {{ value: number, color: string }} Slice */

const esc = (/** @type {string} */ s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * A figure ("$0.42", "97%") in Kalam, sized from the font's advances; null when it holds a
 * character the cut font lacks — the caller draws plain text then.
 * @param {string} text
 * @param {number} size  font size in CSS pixels
 * @param {string} color
 * @returns {{ svg: string, width: number, height: number } | null}
 */
export function figureArt(text, size, color) {
  let em = 0;
  for (const ch of text) {
    const a = NUMERALS.advances[ch];
    if (a === undefined) return null;
    em += a;
  }
  const pad = Math.round(size * 0.12);
  const width = Math.ceil(em * size + 2 * pad + size * 0.1);
  const height = Math.round(size * 1.3);
  const base = Math.round(size * 1.0);
  const css = `@font-face{font-family:N;font-weight:${NUMERALS.weight};src:url(data:font/woff2;base64,${NUMERALS.font}) format('woff2')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`
    + `<style>${css}</style><text x="${pad}" y="${base}" font-family="N" font-weight="${NUMERALS.weight}" font-size="${size}" fill="${color}">${esc(text)}</text></svg>`;
  return { svg, width, height };
}

/**
 * One rounded bar split into slices by value, as wide as its slot (the viewBox stretches).
 * Slices of zero are left out; an all-zero bar is the empty track alone.
 * @param {readonly Slice[]} slices
 * @param {string} track  the color under the slices
 * @param {number} height  in CSS pixels
 */
export function stackBar(slices, track, height) {
  const W = 1000;
  const total = slices.reduce((s, x) => s + Math.max(0, x.value), 0);
  let x = 0;
  const rects = [];
  for (const s of slices) {
    if (!total || s.value <= 0) continue;
    const w = (s.value / total) * W;
    rects.push(`<rect x="${x.toFixed(2)}" y="0" width="${(w + 0.5).toFixed(2)}" height="${height}" fill="${s.color}"/>`);
    x += w;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}" preserveAspectRatio="none" width="${W}" height="${height}">`
    + `<defs><clipPath id="c"><rect width="${W}" height="${height}" rx="${height / 2}" ry="${height / 2}"/></clipPath></defs>`
    + `<g clip-path="url(#c)"><rect width="${W}" height="${height}" fill="${track}"/>${rects.join('')}</g></svg>`;
}

/**
 * Columns over time, one per value, the tallest the full height; null draws an empty slot.
 * The column at `mark` takes `markColor` (the most expensive turn).
 * @param {readonly (number | null)[]} values
 * @param {{ color: string, markColor: string, track: string, mark: number, height: number }} o
 */
export function columns(values, o) {
  const W = 1000;
  const n = Math.max(1, values.length);
  const step = W / n;
  const gap = Math.min(step * 0.28, 14);
  const max = Math.max(0, ...values.map((v) => v ?? 0));
  const bars = values.map((v, i) => {
    const x = i * step + gap / 2;
    const w = Math.max(1, step - gap);
    const h = v && max ? Math.max(2, (v / max) * (o.height - 2)) : 2;
    const fill = v === null ? o.track : i === o.mark ? o.markColor : o.color;
    return `<rect x="${x.toFixed(2)}" y="${(o.height - h).toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${Math.min(4, w / 3).toFixed(2)}" fill="${fill}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${o.height}" preserveAspectRatio="none" width="${W}" height="${o.height}">${bars.join('')}</svg>`;
}

/**
 * A round step for a scale over 0..max: 1, 2 or 5 times a power of ten, giving about `lines`
 * grid lines; 0 for an empty scale.
 * @param {number} max @param {number} [lines]
 */
export function niceStep(max, lines = 4) {
  if (!(max > 0)) return 0;
  const raw = max / lines;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * pow;
}

/**
 * @typedef {{ color: string, label: string, value: string }} TipRow
 * @typedef {{ value: number | null, head: string, figure: string, rows: readonly TipRow[] }} TipPoint
 */

/** A scale value in dollars, with as many decimals as the step needs ("$0.05", "$0.1" never). */
export function scaleLabel(/** @type {number} */ v, /** @type {number} */ step) {
  if (v === 0) return '$0';
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
  return '$' + v.toFixed(Math.max(decimals, step < 1 ? 2 : 0));
}

/** The tooltip card: fixed pixels, sized for the longest text it may hold (TIP_MAX_CHARS). */
export const TIP = Object.freeze({ width: 248, pad: 10, head: 16, figure: 22, row: 16, font: 12, figureFont: 18 });
/** The most characters a tooltip line holds ("22:54 · subagent a9f599bd", "odczyt cache" + "14.2M · $2.84"). */
export const TIP_MAX_CHARS = 26;

/** At most this many columns: past it, neighbouring calls share a column (readability, 2026-10-08). */
export const MAX_COLUMNS = 60;

/**
 * Consecutive ranges [first, last] covering 0..n-1 in at most `max` columns, as even as they
 * can be; one range per item when they fit.
 * @param {number} n @param {number} [max]
 * @returns {[number, number][]}
 */
export function bucketRanges(n, max = MAX_COLUMNS) {
  if (n <= 0) return [];
  const per = Math.ceil(n / max);
  /** @type {[number, number][]} */
  const out = [];
  for (let s = 0; s < n; s += per) out.push([s, Math.min(n - 1, s + per - 1)]);
  return out;
}

/** The Y axis: a gutter on the left for the dollar values, and a margin on the right, in pixels. */
export const AXIS = Object.freeze({ gutter: 52, right: 10, gap: 8, font: 11, bottom: 8 });

/**
 * The height of a hoverColumns drawing whose columns are `plot` pixels tall: room for a card over
 * them and for the half of the "$0" value that hangs under the base line (measured: 5 px).
 * @param {number} plot
 */
export function hoverHeight(plot) {
  return Math.max(plot, TIP.pad * 2 + TIP.head + TIP.figure + TIP.row * 4 + 8) + AXIS.bottom;
}

/** The share of its pitch a column fills, measured on the full width (the rest is the gap). */
const COLUMN_SHARE = 0.72;

/**
 * Columns to hover, for an Svg drawn with isInteractive (a frame of its own, the full width,
 * white unless painted: P-018). Nothing is stretched and nothing overlaps:
 * - the dollar values of the Y axis stand in a gutter of AXIS.gutter pixels on the left,
 *   right-aligned to it; the plot runs from there to AXIS.right pixels short of the edge;
 * - SVG attributes cannot say "100% - 62px" (Chromium keeps CSS width off a nested svg, seen
 *   2026-10-08), so each column is a nested drawing placed at p% of the width and shifted back
 *   by (gutter + right) * p pixels inside: together, gutter + p * (width - gutter - right);
 * - hovering a column lights it and shows its card — a head line, the figure, one row per
 *   category with its dot — pinned to the far upper corner of the plot (right for a column on
 *   the left half, left otherwise), so it stays inside at any plot at least TIP.width wide.
 * @param {readonly TipPoint[]} points
 * @param {{ color: string, markColor: string, track: string, grid: string, background: string, card: string, line: string, text: string, muted: string, mark: number, height: number, step: number }} o
 */
export function hoverColumns(points, o) {
  const A = AXIS;
  const n = Math.max(1, points.length);
  const slot = 100 / n;
  const values = points.map((p) => p.value);
  const max = Math.max(0, ...values.map((v) => v ?? 0));
  const top = o.step > 0 ? Math.max(max, Math.ceil(max / o.step) * o.step) : max;
  const T = TIP;
  const tipHeight = T.pad * 2 + T.head + T.figure + T.row * 4;
  const height = hoverHeight(o.height);
  const off = height - AXIS.bottom - o.height; // the columns stand at the bottom, the cards open over them
  const base = off + o.height;
  const y = (/** @type {number} */ v) => off + (top ? o.height - (v / top) * (o.height - 2) : o.height - 2);
  const levels = [0];
  for (let g = o.step; o.step > 0 && g <= top + 1e-12; g += o.step) levels.push(g);
  // the gutter: each level's value right-aligned to the gutter's edge, centred on its line
  const yLabels = levels.map((g) => `<text class="a" x="${A.gutter - A.gap}" y="${(g ? y(g) : base).toFixed(2)}" fill="${o.muted}" text-anchor="end" dominant-baseline="middle">${scaleLabel(g, o.step || 1)}</text>`);
  const grid = levels.filter((g) => g > 0).map((g) => `<line x1="${A.gutter}" x2="100%" y1="${y(g).toFixed(2)}" y2="${y(g).toFixed(2)}" stroke="${o.grid}" stroke-width="1"/>`);
  const axes = `<line x1="${A.gutter}" x2="100%" y1="${base}" y2="${base}" stroke="${o.muted}" stroke-width="1"/>`
    + `<line x1="${A.gutter + 0.5}" x2="${A.gutter + 0.5}" y1="${off}" y2="${base}" stroke="${o.muted}" stroke-width="1"/>`;
  // the right margin: the lines end AXIS.right short of the edge, under the background
  const margin = `<svg x="100%" y="0" overflow="visible"><rect x="${-A.right}" y="0" width="${A.right}" height="${height}" fill="${o.background}"/></svg>`;
  const bars = points.map((p, i) => {
    const v = p.value;
    const h = v && top ? Math.max(2, (v / top) * (o.height - 2)) : 2;
    const fill = v === null ? o.track : i === o.mark ? o.markColor : o.color;
    const shift = (A.gutter - (A.gutter + A.right) * (i * slot) / 100).toFixed(2);
    // the whole pitch answers the pointer, so a low column is as easy to hover as a tall one
    return `<svg class="b b${i}" x="${(i * slot).toFixed(3)}%" y="0" overflow="visible">`
      + `<rect x="${shift}" y="${off}" width="${slot.toFixed(3)}%" height="${o.height}" fill="transparent"/>`
      + `<rect class="c" x="${shift}" y="${(base - h).toFixed(2)}" width="${(slot * COLUMN_SHARE).toFixed(3)}%" height="${h.toFixed(2)}" rx="2" fill="${fill}"/></svg>`;
  });
  const tips = points.map((p, i) => {
    const isLeftHalf = (i + 0.5) * slot < 50;
    const pin = isLeftHalf ? `x="100%"` : `x="${A.gutter + 4}"`;
    const dx = isLeftHalf ? -(T.width + A.right + 4) : 0;
    const rows = p.rows.map((r, k) => {
      const ry = T.pad + T.head + T.figure + T.row * (k + 1) - 5;
      return `<circle cx="${T.pad + 4}" cy="${ry - 4}" r="4" fill="${r.color}"/>`
        + `<text x="${T.pad + 14}" y="${ry}" fill="${o.text}">${esc(r.label)}</text>`
        + `<text x="${T.width - T.pad}" y="${ry}" fill="${o.muted}" text-anchor="end">${esc(r.value)}</text>`;
    }).join('');
    return `<svg class="t t${i}" ${pin} y="2" overflow="visible"><g transform="translate(${dx} 0)">`
      + `<rect width="${T.width}" height="${tipHeight}" rx="10" fill="${o.card}" stroke="${o.line}"/>`
      + `<text x="${T.pad}" y="${T.pad + T.head - 4}" fill="${o.text}" font-weight="600">${esc(p.head)}</text>`
      + `<text x="${T.pad}" y="${T.pad + T.head + T.figure - 4}" fill="${o.markColor}" font-size="${T.figureFont}" font-weight="700">${esc(p.figure)}</text>`
      + `${rows}</g></svg>`;
  });
  const css = `text{font-family:'Segoe UI',system-ui,sans-serif;font-size:${T.font}px}.a{font-size:${A.font}px}.t{display:none}.b:hover .c{opacity:.65}`
    + points.map((_, i) => `.b${i}:hover~.t${i}`).join(',') + (points.length ? '{display:inline}' : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}">`
    + `<style>${css}</style><rect width="100%" height="100%" fill="${o.background}"/>`
    + `${yLabels.join('')}${grid.join('')}${axes}${margin}${bars.join('')}${tips.join('')}</svg>`;
}

/**
 * The terminal's bar: `cols` cells of █ split by value, each run in its slice's color; a value
 * that rounds to nothing keeps one cell when it is not zero, so no slice disappears.
 * @param {readonly Slice[]} slices
 * @param {number} cols
 * @returns {{ text: string, color: string }[]}
 */
export function blocks(slices, cols) {
  const live = slices.filter((s) => s.value > 0);
  const total = live.reduce((s, x) => s + x.value, 0);
  if (!total || cols < 1) return [];
  const cells = live.map((s) => Math.max(1, Math.round((s.value / total) * cols)));
  let over = cells.reduce((a, b) => a + b, 0) - cols;
  while (over > 0) {
    const i = cells.indexOf(Math.max(...cells));
    cells[i] = (cells[i] ?? 1) - 1;
    over -= 1;
  }
  return live.map((s, i) => ({ text: '█'.repeat(cells[i] ?? 0), color: s.color })).filter((r) => r.text);
}

const SPARK = '▁▂▃▄▅▆▇█';

/**
 * The terminal's columns: one character per value, ▁ to █ by height; a gap (null) is a space.
 * @param {readonly (number | null)[]} values
 */
export function spark(values) {
  const max = Math.max(0, ...values.map((v) => v ?? 0));
  return values.map((v) => (v === null ? ' ' : SPARK[max ? Math.min(7, Math.round((v / max) * 7)) : 0])).join('');
}
