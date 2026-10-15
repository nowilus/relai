// relai-panel: the pane in both appearances of the app (plan WYGLAD_PANELU, E3, Aneks E; P-044).
//
// A mod cannot read the app's appearance (P-042), so nothing here chooses a palette. Two passes over
// the drawn tree do the work in one place: `retone` turns the pane's raw "Warsztat" colors in texts
// and frames into theme keys, which the desktop paints itself, and gives every drawing both
// palettes (`twoTone`). The sheet under a tab is the sandwich of P-044: a hidden copy of the tab in
// flow sizes it, a drawing in both palettes covers it, the tab itself is drawn over that.

import type { RenderChildren, RenderNode } from 'claude-code'
import { EDGE_OF, FILL_OF, HOVER_FILL, TONE_OF, twoTone } from './core/theme.mjs'

type Node = RenderNode & { type: string, props: Record<string, unknown>, children?: RenderChildren[] }

// The hidden copy of a sandwich ends its keys with this: two elements never share a key (the
// engine refuses two Buttons keyed alike) and a test reading the tab skips the copy by it
export const HIDDEN = '~u'

const isNode = (n: unknown): n is Node => typeof n === 'object' && n !== null && 'type' in n

// A drawing in the hidden copy keeps only its outer tag: the same size, none of the weight (a
// Kalam heading carries its font; the copy is never seen)
const hollow = (svg: string) => { const end = svg.indexOf('>') + 1; return end > 0 ? svg.slice(0, end).replace(/\/>$/, '>') + '</svg>' : svg }

// What only paints and never takes room: the hidden copy goes without it (Aneks F: every tab is
// filled, so the copy is drawn under every tab and its weight counts against P-023 pkt 7)
const PAINT = ['color', 'hover', 'borderColor', 'backgroundColor', 'dimColor'] as const
const unpainted = (p: Record<string, unknown>) => {
  const out = { ...p }
  for (const k of PAINT) delete out[k]
  return out
}

/** The same tree, every key ending in `suffix`; its drawings hollow, its paints gone. */
export function rekey(node: RenderChildren, suffix: string): RenderChildren {
  if (Array.isArray(node)) return node.map((n) => rekey(n, suffix))
  if (!isNode(node)) return node
  const own = unpainted(node.props ?? {})
  const base = node.type === 'Svg' && typeof own.source === 'string' ? { ...own, source: hollow(own.source), alt: '·' } : own
  const props = typeof base?.key === 'string' ? { ...base, key: base.key + suffix } : base
  const children = Array.isArray(node.children) ? node.children.map((c) => rekey(c, suffix)) : node.children
  // The copy is never seen: no hover on it either, also where the engine's h() keeps it (on the node)
  const { hover: _unseen, ...rest } = node as RenderNode & { hover?: unknown }
  return { ...rest, props, ...(children ? { children } : {}) } as RenderNode
}

const keyOf = (map: Readonly<Record<string, string | null>>, c: unknown) =>
  typeof c === 'string' && c.toLowerCase() in map ? map[c.toLowerCase()] : c

// A Box's paints: the frame in its key, the fill gone (the sheet shows through) or in its key
function boxPaints(p: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...p }
  if ('borderColor' in p) out.borderColor = keyOf(EDGE_OF, p.borderColor)
  if ('backgroundColor' in p) {
    const fill = keyOf(FILL_OF, p.backgroundColor)
    if (fill === null || fill === undefined) delete out.backgroundColor
    else out.backgroundColor = fill
  }
  if (p.hover && typeof p.hover === 'object') out.hover = hoverPaints(p.hover)
  return out
}

// Under the pointer: the frame in its key, the fill one that follows the app
function hoverPaints(hover: object): Record<string, unknown> {
  const h = { ...(hover as Record<string, unknown>) }
  if ('borderColor' in h) h.borderColor = keyOf(EDGE_OF, h.borderColor)
  if ('backgroundColor' in h) h.backgroundColor = HOVER_FILL
  return h
}

/** The tree in theme keys and two-tone drawings. */
export function retone(node: RenderChildren): RenderChildren {
  if (Array.isArray(node)) return node.map(retone)
  if (!isNode(node)) return node
  const p = node.props ?? {}
  const props = node.type === 'Text' && 'color' in p ? { ...p, color: keyOf(TONE_OF, p.color) }
    : node.type === 'Box' ? boxPaints(p)
    : node.type === 'Svg' && typeof p.source === 'string' ? { ...p, source: twoTone(p.source) }
    : p
  const children = Array.isArray(node.children) ? node.children.map(retone) : node.children
  // The engine's h() keeps `hover` on the node, not in props (tree dumped live 2026-10-15)
  const own = (node as { hover?: unknown }).hover
  const hover = own && typeof own === 'object' ? { hover: hoverPaints(own) } : {}
  return { ...node, props, ...hover, ...(children ? { children } : {}) } as RenderNode
}

/** The children of a drawn tree without the hidden copies of its sandwiches. */
export function visible(node: RenderChildren): RenderChildren {
  if (Array.isArray(node)) return node.filter((n) => !(isNode(n) && String(n.props?.key ?? '').endsWith(HIDDEN))).map(visible)
  if (!isNode(node)) return node
  const children = Array.isArray(node.children) ? visible(node.children) as RenderChildren[] : node.children
  return { ...node, ...(children ? { children } : {}) } as RenderNode
}
