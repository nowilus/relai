// relai-progress: the agents pane in both appearances of the app (WYGLAD_PANELU E4, live 2026-10-15).
//
// The retone pass of relai-panel (panel/hooks/skin.ts, E3, Aneks E; P-044), verbatim: a mod cannot
// read the app's appearance (P-042), so the pane's raw "Warsztat" colors in texts and frames become
// theme keys the desktop paints itself, a Box fill goes (the pane's ground shows through) or becomes
// its key, and every drawing gets both palettes. The sandwich of relai-panel is not needed here.

import type { RenderChildren, RenderNode } from 'claude-code'
import { EDGE_OF, FILL_OF, HOVER_FILL, TONE_OF, twoTone } from './core/theme.mjs'

type Node = RenderNode & { type: string, props: Record<string, unknown>, children?: RenderChildren[] }

const isNode = (n: unknown): n is Node => typeof n === 'object' && n !== null && 'type' in n

const keyOf = (map: Readonly<Record<string, string | null>>, c: unknown) =>
  typeof c === 'string' && c.toLowerCase() in map ? map[c.toLowerCase()] : c

// A Box's paints: the frame in its key, the fill gone or in its key
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
