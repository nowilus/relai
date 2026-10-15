// relai-panel: the drawing of the "Teraz" section's progress (WYGLAD_PANELU E5, Aneks G). Łukasz
// after 3.2.0: "nie da się najeżdżać na te paski, wszystko się ze sobą zlewa" — measured: done and
// running had 1.06 : 1 between them (one lightness, two hues), a waiting segment 1.42 : 1 to the
// dark sheet, and in the light appearance no segment reached 3 : 1. Three fills that all stand
// 3 : 1 apart and from a white sheet do not exist, so each mark stands 3 : 1 from the sheet and
// the states differ by shape: done a full segment, running half filled in its outline, waiting
// the outline alone, failed full in clay (variant T1, chosen 2026-10-15).
//
// Hovering a segment lights its outline and shows the app's own tooltip with the whole point — the
// state's word and sign, its number and its name — from the segment's <title>. A capsule of our own
// was tried first: cut to one line it said less than the tooltip beside it, wrapped it made the band
// under the bar grow at rest (Łukasz, live 2026-10-15: „Moze nie ma sensu pokazywac dwoch dymkow
// […] dajmy po prostu ten natywny z caloscia i tyle, nie komplikujemy”). Pure: no `$` (P-023
// pkt 10); both palettes in the drawing's CSS (P-042).

import type { Item } from './core/progress.mjs'

// The marks' palette, dark then light; every mark and the hover outline ≥ 3 : 1 to its sheet (now.test.ts)
export const NOW_INK = Object.freeze({
  dark: Object.freeze({ done: '#4ca129', running: '#ce932a', failed: '#db8080', edge: '#8f8b82', text: '#f0efec' }),
  light: Object.freeze({ done: '#4d9c45', running: '#a8731a', failed: '#c0504d', edge: '#8a8070', text: '#0b0b0b' }),
})

// The geometry in CSS px: the bar's top air, its height, the air under it, the slot a segment takes
export const NOW_GEO = Object.freeze({ top: 4, bar: 8, air: 16, share: 0.92 })

// The sign and the word of a state, as on the progress list (DESIGN §5: word and sign, never color alone)
export const STATE_WORD: Readonly<Record<string, string>> = { done: '✓ zrobiony', running: '● w toku', pending: '○ czeka', failed: '! nie przeszedł', unknown: '? nieznany' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const pc = (n: number) => `${n.toFixed(3)}%`

function css(): string {
  const rules = (p: Readonly<Record<string, string>>) => `.fd{fill:${p.done}}.fr{fill:${p.running}}.ff{fill:${p.failed}}`
    + `.sr{stroke:${p.running}}.se{stroke:${p.edge}}.b:hover .c{stroke:${p.text}}`
  return '.o{x:0.75px;width:calc(100% - 1.5px)}.b:hover .c{stroke-width:2px}'
    + rules(NOW_INK.dark) + `@media (prefers-color-scheme: light){${rules(NOW_INK.light)}}`
}

// One mark in its slot: the shape tells the state
function mark(status: string): string {
  const { top, bar } = NOW_GEO
  const full = (cls: string) => `<rect class="c ${cls}" y="${top}" width="100%" height="${bar}" rx="2"/>`
  const outline = (cls: string) => `<rect class="c o ${cls}" y="${top + 0.75}" height="${bar - 1.5}" rx="2" fill="none" stroke-width="1.5"/>`
  if (status === 'done') return full('fd')
  if (status === 'failed') return full('ff')
  if (status === 'running') return outline('sr') + `<rect class="fr" y="${top}" width="50%" height="${bar}" rx="2"/>`
  return outline('se')
}

export type NowArt = { svg: string, height: number, alt: string }

export const itemWords = (it: Item, i: number): string => `${STATE_WORD[it.status] ?? STATE_WORD.unknown} · ${i + 1}. ${it.name}`

// The items as marks in one row; each segment carries its whole point in a <title>, which the app
// shows as its own tooltip on hover. The drawing is the bar and the air under it, nothing more.
export function nowArt(items: readonly Item[]): NowArt | null {
  if (!items.length) return null
  const g = NOW_GEO
  const slot = 100 / items.length
  const height = g.top + g.bar + g.air
  const marks = items.map((it, i) => `<svg class="b b${i}" x="${pc(i * slot)}" y="0" width="${pc(slot * g.share)}" height="${height}" overflow="visible">`
    + `<title>${esc(itemWords(it, i))}</title><rect width="100%" height="${g.top + g.bar + 4}" fill="transparent"/>${mark(it.status)}</svg>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${height}"><style>${css()}</style>${marks.join('')}</svg>`
  return { svg, height, alt: items.map(itemWords).join('; ') }
}
