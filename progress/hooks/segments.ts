// relai-progress: what the progress bar draws in Svg — the thin line of segments above the one line,
// and the small marks of the list of steps (plan WYGLAD_PANELU, E2: look A "kółka", round 2; the
// light appearance tuned "J3 miękki", round 3). No `$` here (P-023 pkt 10): register.tsx passes the
// items. Every Svg carries both palettes (stepCss: dark by default, light under
// `prefers-color-scheme`, P-042). SVG text does not wrap, so no words are drawn here: the names stand
// in Box/Text, which the engine lays out (plan, variant D rejected).

import type { Item } from './core/progress.mjs'
import { stepCss } from './core/theme.mjs'

// The overview line: segments 4 px high with 3 px of air above and below (the mock-up's hairline)
export const OVERVIEW_HEIGHT = 10
export const MARK_PX = 16

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// The item the work stands on: a failed one first (the more important news), then one marked
// running (a crew's task), else the first not done; -1 when every item is done
export function currentOf(items: readonly Item[]): number {
  const failed = items.findIndex((it) => it.status === 'failed')
  if (failed >= 0) return failed
  const running = items.findIndex((it) => it.status === 'running')
  return running >= 0 ? running : items.findIndex((it) => it.status !== 'done')
}

// A segment's ink: done, failed, running (its own state, or the current item), the rest the track
function inkOf(it: Item, i: number, cur: number): string {
  if (it.status === 'done') return 'done'
  if (it.status === 'failed') return 'failed'
  return it.status === 'running' || i === cur ? 'running' : 'track'
}

// The sums of the expanded line: "3 zrobionych · 1 w toku · 2 czekają"; parts with zero left out
// but the done ones (review of E2: several tasks may run, several may fail)
export function sumWords(items: readonly Item[]): string {
  const cur = currentOf(items)
  const done = items.filter((it) => it.status === 'done').length
  const failed = items.filter((it) => it.status === 'failed').length
  const running = items.filter((it, i) => it.status === 'running' || (i === cur && it.status !== 'failed' && it.status !== 'done')).length
  const waiting = items.length - done - failed - running
  return [`${done} zrobionych`, running ? `${running} w toku` : '', failed ? `${failed} z błędem` : '',
    waiting ? `${waiting} ${waiting === 1 ? 'czeka' : 'czekają'}` : ''].filter(Boolean).join(' · ')
}

// The order the segments stand in: the done items first, then the rest, each in the file's order —
// the bar grows from the left even when boxes are ticked out of order (Łukasz, round 4: "czy to nie
// powinno być tak sekwencyjnie, po kolei?"). Indices into `items`.
export function doneFirst(items: readonly Item[]): number[] {
  const all = items.map((_, i) => i)
  return [...all.filter((i) => items[i]?.status === 'done'), ...all.filter((i) => items[i]?.status !== 'done')]
}

// The Svg markup of the segments, or null for no items. Each segment names its item and its number
// in the file in a <title> (the tooltip of an interactive Svg, P-021 pkt 4); the one just ticked
// flashes once.
export function overviewArt(items: readonly Item[], freshId: string | null = null): string | null {
  if (items.length === 0) return null
  const cur = currentOf(items)
  const slot = 100 / items.length
  const bars = doneFirst(items).map((n, i) => {
    const it = items[n] as Item
    return `<rect class="f-${inkOf(it, n, cur)}" x="${(i * slot).toFixed(3)}%" y="3" width="${(slot * 0.96).toFixed(3)}%" height="4" rx="2">`
      + (it.id === freshId ? '<animate attributeName="opacity" values="0.2;1" dur="0.6s" fill="freeze"/>' : '')
      + `<title>${esc(`${n + 1}/${items.length} · ${it.name}`)}</title></rect>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${OVERVIEW_HEIGHT}">`
    + `<style>${stepCss()}rect:hover{filter:brightness(1.3)}</style>${bars.join('')}</svg>`
}

export type MarkKind = 'running' | 'done' | 'pending' | 'failed' | 'fold-closed' | 'fold-open'

const SPIN = '<animateTransform attributeName="transform" type="rotate" from="0 8 8" to="360 8 8" dur="1s" repeatCount="indefinite"/>'
const TICK = '<path d="M4.6 8.3 7 10.6 11.4 5.8" fill="none" class="s-card" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'

// A mark, 16 px: a spinning arc on its track (the current item), a filled circle with a tick that
// fills once when fresh, a dashed ring waiting, a circle with a bar for an error, a chevron for the
// fold of the done ones. `title` is the full name, the tooltip where the line cuts it.
// The current item's mark spins only while the model works (`isWorking` of the band); waiting for
// the person it stands still: an amber ring with a dot (Łukasz, round 4: "jak już wykona pracę, odda
// odpowiedź na czacie i czeka na kolejny prompt, no to wtedy się nie kręci").
export function markArt(kind: MarkKind, o: { isFresh?: boolean, title?: string, isSpinning?: boolean } = {}): string {
  const head = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_PX}" height="${MARK_PX}" viewBox="0 0 16 16"><style>${stepCss()}</style>`
    + (o.title ? `<title>${esc(o.title)}</title>` : '')
  const body = (() => {
    if (kind === 'running' && !o.isSpinning) return '<circle cx="8" cy="8" r="6" fill="none" class="s-running" stroke-width="2"/>'
      + '<circle cx="8" cy="8" r="2.2" class="f-running"/>'
    if (kind === 'running') return '<circle cx="8" cy="8" r="6" fill="none" class="sptrack s-track" stroke-width="2"/>'
      + `<path d="M8 2a6 6 0 0 1 6 6" fill="none" class="arc s-running" stroke-width="2" stroke-linecap="round">${SPIN}</path>`
    if (kind === 'done') return `<circle cx="8" cy="8" r="${o.isFresh ? 1 : 7}" class="f-done">`
      + (o.isFresh ? '<animate attributeName="r" from="1" to="7" dur="0.35s" fill="freeze"/>' : '') + `</circle>${TICK}`
    if (kind === 'failed') return '<circle cx="8" cy="8" r="7" class="f-failed"/><path d="M8 4.2v4.6M8 11.3v.2" class="s-card" stroke-width="1.9" stroke-linecap="round"/>'
    if (kind === 'pending') return '<circle cx="8" cy="8" r="6" fill="none" class="ring s-muted" stroke-width="1.5" stroke-dasharray="2.4 2" opacity="0.75"/>'
    return `<path d="${kind === 'fold-open' ? 'M5 6.5 8 9.5 11 6.5' : 'M6.5 5 9.5 8 6.5 11'}" fill="none" class="s-muted" stroke-width="1.6" stroke-linecap="round"/>`
  })()
  return `${head}${body}</svg>`
}

// The rows of the expanded list (plan, section 5 and risk 4)
export const WINDOW = 6 // never more rows
const NEXT = 3 // the next ones after the current item

export type Row =
  | { kind: 'fold', done: number, isOpen: boolean }
  | { kind: 'item', index: number, item: Item, isCurrent: boolean, isFresh: boolean }
  | { kind: 'more', count: number }

// The fold of the done ones, the one just ticked, the current one, three next ones, "+N czekają";
// unfolded, the last done ones take the next ones' place. [] when nothing is left to do.
export function windowRows(items: readonly Item[], isDoneShown: boolean, freshId: string | null): Row[] {
  const cur = currentOf(items)
  if (cur < 0) return []
  const doneIdx = items.map((it, i) => (it.status === 'done' ? i : -1)).filter((i) => i >= 0)
  const fresh = items.findIndex((it) => it.id === freshId && it.status === 'done')
  const rows: Row[] = []
  const item = (index: number, isCurrent = false): Row => ({ kind: 'item', index, item: items[index] as Item, isCurrent, isFresh: index === fresh })
  if (doneIdx.length) rows.push({ kind: 'fold', done: doneIdx.length, isOpen: isDoneShown })
  if (isDoneShown) doneIdx.slice(-(WINDOW - rows.length - 2)).forEach((i) => rows.push(item(i)))
  else if (fresh >= 0) rows.push(item(fresh))
  rows.push(item(cur, true))
  const after = items.map((it, i) => (i !== cur && it.status !== 'done' ? i : -1)).filter((i) => i >= 0)
  const room = WINDOW - rows.length
  const cap = Math.min(NEXT, room)
  const shown = after.length <= cap ? after : after.slice(0, Math.max(0, Math.min(cap, room - 1)))
  shown.forEach((i) => rows.push(item(i)))
  if (after.length > shown.length) rows.push({ kind: 'more', count: after.length - shown.length })
  return rows
}
