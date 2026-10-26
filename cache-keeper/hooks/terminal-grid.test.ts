import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAR } from './relai/theme.mjs'
import { TERM, termColumns, limitMeasure } from './rings'

type Engine = Parameters<TestBody>[0]

// The cache bar in the terminal as a grid (plan ZGLOSZENIA E3, GitHub #2, variant A): a glyph, the
// label and the value per measure in columns counted from the window's width, at most three, and
// no line b — the reset hour, "zużyte", the TTL and the threshold live in /cache. The desktop's Svg
// is untouched: its tree is the one HEAD drew before E3.

const NOW = Date.UTC(2026, 9, 10, 12)
const MIN = 60_000
const iso = (ts: number) => new Date(ts).toISOString()
const WIDTHS = [31, 75, 94, 120] as const

type Limit = { kind: string, percentUsed: number, resetsAt?: string }
const LIMITS: Limit[] = [
  { kind: 'five_hour', percentUsed: 64, resetsAt: iso(NOW + 72 * MIN) },
  { kind: 'seven_day', percentUsed: 41, resetsAt: iso(NOW + 30 * 60 * MIN) },
]

function world(on: On, cost: number | undefined) {
  mock.clock(on, { now: NOW })
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { kept.delete(e.key); return { value: undefined } })
  mock.env(on, {})
  on('fs.exists', () => ({ value: false }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 5 }))
  on('session.usage', () => ({ value: {
    startedAt: NOW,
    context: { tokens: 323_000, window: 1_000_000 } as never,
    rateLimits: LIMITS as never,
    ...(cost === undefined ? {} : { cost: { usd: cost } }),
  } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.status', () => ({ value: undefined }) as never)
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 500, cache_read_input_tokens: 322_990, cache_creation_input_tokens: 0, model: 'claude-opus-5-5' },
    }
    return result
  })
}

async function ready($: Engine) {
  await $.session.start({ cwd: 'C:/proj', surface: 'terminal', isInteractive: true })
  const s = $.turn.step({ turnId: 'r1', index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: 'r1', reason: 'answer' } as never)
}

const mount = ($: Engine, surface: 'terminal' | 'desktop', bodyColumns: number) => $.ui.mount({
  plugin: 'relai-cache-keeper', surface,
  component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

const kidsOf = (n: RenderNode): RenderNode[] => (typeof n === 'string' ? [] : (n as { children?: RenderNode[] }).children ?? [])
const propsOf = (n: RenderNode): Record<string, unknown> => (typeof n === 'string' ? {} : (n as { props?: Record<string, unknown> }).props ?? {})
const textOf = (n: RenderNode): string => (typeof n === 'string' ? n : kidsOf(n).map(textOf).join(''))
const cells = (s: string) => [...s].length
function* walk(n: RenderNode): Generator<RenderNode> {
  if (typeof n === 'string') return
  yield n
  for (const k of kidsOf(n)) yield* walk(k)
}

// The width a node takes drawn on one line with nothing wrapped, in cells: a fixed `width` is its
// width, a row the sum of its children and gaps, a column the widest child. A row of the bar wider
// than the window shows here as a number above bodyColumns.
function natural(n: RenderNode): number {
  if (typeof n === 'string') return cells(n)
  const p = propsOf(n)
  if (n.type === 'Text') return cells(textOf(n))
  if (n.type === 'Button') return cells(String(p.label ?? '')) + 4
  if (n.type !== 'Box') return 0
  const kids = kidsOf(n).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(natural)
  // A Box without flexDirection is a row, as in Ink
  const inner = p.flexDirection !== 'column'
    ? widths.reduce((a, b) => a + b, 0) + Number(p.columnGap ?? p.gap ?? 0) * Math.max(0, kids.length - 1)
    : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? 0) + Number(p.paddingRight ?? p.paddingX ?? 0)
  if (typeof p.width === 'number') return p.width
  return Math.max(inner + padX, typeof p.minWidth === 'number' ? p.minWidth : 0)
}

// The narrowest the tree can be drawn with every wrap taken, in cells: a wrapping row is its widest
// child, a Text its longest word — except inside a Box that never shrinks (the value), which keeps
// its words whole. Above bodyColumns, something is cut however the engine wraps.
function narrowest(n: RenderNode, whole = false): number {
  if (typeof n === 'string') return whole ? cells(n) : Math.max(0, ...n.split(/\s+/).map(cells))
  const p = propsOf(n)
  if (n.type === 'Text') return narrowest(textOf(n), whole)
  if (n.type === 'Button') return cells(String(p.label ?? '')) + 4
  if (n.type !== 'Box') return 0
  const keep = whole || p.flexShrink === 0
  const kids = kidsOf(n).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map((k) => narrowest(k, keep))
  const inner = p.flexDirection !== 'column' && p.flexWrap !== 'wrap'
    ? widths.reduce((a, b) => a + b, 0) + Number(p.columnGap ?? p.gap ?? 0) * Math.max(0, kids.length - 1)
    : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? 0) + Number(p.paddingRight ?? p.paddingX ?? 0)
  return Math.max(inner + padX, typeof p.width === 'number' ? p.width : 0, typeof p.minWidth === 'number' ? p.minWidth : 0)
}

// A Box of fixed width whose content is wider: the grid's cell would cut its value
const cutCells = (root: RenderNode) => [...walk(root)].filter((n) => typeof n !== 'string' && n.type === 'Box'
  && typeof propsOf(n).width === 'number' && kidsOf(n).map(natural).reduce((a, b) => a + b, 0) + Number(propsOf(n).columnGap ?? 0) * Math.max(0, kidsOf(n).length - 1) > Number(propsOf(n).width))

// The key the engine keeps on a Box (P-017 pkt 4)
const keyOf = (n: RenderNode) => String((n as { key?: unknown }).key ?? (n as { props?: { key?: unknown } }).props?.key ?? '')
const gridRows = (root: RenderNode) => [...walk(root)].filter((n) => typeof n !== 'string' && n.type === 'Box' && /^cells-\d+$/.test(keyOf(n)))

// A copy of the tree with one cell of the grid swapped for a Box wider than the window
function withWideCell(root: RenderNode, columns: number): RenderNode {
  let done = false
  const swap = (n: RenderNode): RenderNode => {
    if (typeof n === 'string') return n
    if (!done && n.type === 'Box' && keyOf(n).startsWith('m-')) {
      done = true
      return { ...n, props: { ...propsOf(n), width: columns + 1 } } as RenderNode
    }
    return { ...n, children: kidsOf(n).map(swap) } as RenderNode
  }
  return swap(root)
}

// The words of line b, by the stem every form shares (L-0256): "zużyte", "zostało", "reset 20:10",
// "reset jutro 18:00", "TTL 60 min założony", "wolne 68 %", "próg 90 %"
const LINE_B = /zużyt|zostało|reset (jutro |\d)|TTL|wolne|próg/

// FNV-1a over the tree's JSON: a fingerprint short enough to stand in the test
function fingerprint(n: RenderNode): string {
  let h = 0x811c9dc5
  for (const ch of JSON.stringify(n)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0 }
  return h.toString(16).padStart(8, '0')
}

describe('the terminal cache bar as a grid of columns (ZGLOSZENIA E3, #2)', () => {
  test('pure: the columns grow with the cells, never past three, one when a cell does not fit', () => {
    const m = limitMeasure('week', 'limit tygodnia', 'tydzień', { kind: 'seven_day', percentUsed: 41 }, NOW)
    const five = [m, m, m, m, m]
    const w = termColumns(five, 1000).width
    expect(w).toBe(cells('◕ limit tygodnia 41 %'))
    expect(termColumns(five, w - 1).cols).toBe(1)
    expect(termColumns(five, w).cols).toBe(1)
    expect(termColumns(five, 2 * w + TERM.gap).cols).toBe(2)
    expect(termColumns(five, 1000).cols).toBe(TERM.maxCols)
    expect(termColumns([m, m], 1000).cols).toBe(2)
  })

  for (const cost of [14.93, undefined]) {
    test(`no row wider than the window at ${WIDTHS.join(', ')} columns, the columns growing with it (cost ${cost ?? 'unknown'})`, async ($, on) => {
      world(on, cost)
      await ready($)
      const counts: number[] = []
      for (const columns of WIDTHS) {
        const ui = await mount($, 'terminal', columns)
        const drawn = await ui.drawn()
        expect(natural(drawn)).toBeLessThanOrEqual(columns)
        expect(cutCells(drawn)).toEqual([])
        // Positive control (L-0181): the same tree with one cell wider than the window is caught
        const wide = withWideCell(drawn, columns)
        expect(natural(wide)).toBeGreaterThan(columns)
        const rows = gridRows(drawn)
        expect(rows.length).toBeGreaterThan(0)
        const perRow = rows.map((r) => kidsOf(r).length)
        expect(Math.max(...perRow)).toBeLessThanOrEqual(TERM.maxCols)
        // Every measure drawn exactly once, in rows of the same columns
        expect(perRow.reduce((a, b) => a + b, 0)).toBe(5)
        expect(perRow.slice(0, -1).every((k) => k === perRow[0])).toBe(true)
        counts.push(perRow[0])
        await ui.unmount()
      }
      // The columns grow within each layout of the shared card (Łukasz 2026-10-26, „Rosną w obrębie
      // układu”): from BAR.narrow on the label and the figure stand beside the middle and take its
      // cells, so 94 columns hold fewer than 75 — 1 at 31, then 3; 2 at 94, then 3 at 120
      const narrow = counts.filter((_, i) => WIDTHS[i] < BAR.narrow)
      const wide = counts.filter((_, i) => WIDTHS[i] >= BAR.narrow)
      expect(narrow[0]).toBe(1)
      for (const part of [narrow, wide]) {
        expect(part.length).toBeGreaterThan(1)
        expect(part.every((c, i) => i === 0 || c >= part[i - 1])).toBe(true)
        expect(part[part.length - 1]).toBeGreaterThan(part[0])
      }
    })
  }

  // Plan ZGLOSZENIA, section 8: a terminal narrower than one cell — one measure a row, the label
  // wrapping, the value never cut. 31 columns still fit the widest cell, so 16 and 20 take the wrap.
  test('narrower than one cell (16, 20 columns): one measure a row, every value whole', async ($, on) => {
    world(on, undefined)
    await ready($)
    for (const columns of [16, 20]) {
      const ui = await mount($, 'terminal', columns)
      const drawn = await ui.drawn()
      expect(natural(drawn)).toBeGreaterThan(columns) // the wrap is really needed here
      expect(narrowest(drawn)).toBeLessThanOrEqual(columns)
      expect(gridRows(drawn).map((r) => kidsOf(r).length)).toEqual([1, 1, 1, 1, 1])
      const values = [...walk(drawn)].filter((n) => typeof n !== 'string' && n.type === 'Box' && keyOf(n) === 'value').map(textOf)
      expect(values).toEqual(['~60 min', '64 %', '1 h 12 min', '41 %', '323k'])
      // Positive control (L-0181): a value wider than the window, planted in the same tree, cannot
      // wrap inside its Box, and the instrument reports it
      const long = 'x'.repeat(columns + 3)
      let planted = false
      const plant = (n: RenderNode): RenderNode => {
        if (typeof n === 'string') return n
        if (!planted && keyOf(n) === 'value') { planted = true; return { ...n, children: [{ type: 'Text', props: {}, children: [long] }] } as RenderNode }
        return { ...n, children: kidsOf(n).map(plant) } as RenderNode
      }
      expect(narrowest(plant(drawn))).toBeGreaterThan(columns)
      await ui.unmount()
    }
  })

  test('the cut-cell instrument catches a fixed cell narrower than its words (positive control)', () => {
    const cell = { type: 'Box', props: { key: 'm-x', flexDirection: 'row', width: 5, columnGap: 1 }, children: [
      { type: 'Text', props: {}, children: ['●'] }, { type: 'Text', props: {}, children: ['limit 5 h 64 %'] },
    ] } as unknown as RenderNode
    expect(cutCells(cell)).toHaveLength(1)
    const roomy = { ...(cell as object), props: { key: 'm-x', flexDirection: 'row', width: 16, columnGap: 1 } } as unknown as RenderNode
    expect(cutCells(roomy)).toEqual([])
  })

  test('no line b in the terminal: no reset hour, "zużyte", TTL or "wolne"; the value always there', async ($, on) => {
    world(on, 14.93)
    await ready($)
    for (const columns of WIDTHS) {
      const ui = await mount($, 'terminal', columns)
      const words = textOf(await ui.drawn())
      expect(words).not.toMatch(LINE_B)
      for (const value of ['64 %', '41 %', '1 h 12 min', '323k']) expect(words).toContain(value)
      await ui.unmount()
    }
    // Positive control on the same session: the desktop's tooltips carry line b, and the pattern finds it
    const ui = await mount($, 'desktop', 140)
    const alts = [...walk(await ui.drawn())].map((n) => String(propsOf(n).alt ?? '')).join(' ')
    expect(alts).toMatch(LINE_B)
    for (const form of ['zużyte 64 %', 'reset 13:12', 'TTL 60 min', 'wolne 68 %']) expect(form).toMatch(LINE_B)
    await ui.unmount()
  })

  // The desktop tree as HEAD drew it before E3 (fingerprints counted by this very test on f07fc26
  // in a git worktree, 2026-10-26)
  test('the desktop is untouched: the same tree as before E3', async ($, on) => {
    world(on, 14.93)
    await ready($)
    const prints: string[] = []
    for (const columns of [75, 140]) {
      const ui = await mount($, 'desktop', columns)
      prints.push(fingerprint(await ui.drawn()))
      await ui.unmount()
    }
    expect(prints).toEqual(DESKTOP_BEFORE)
  })
})

const DESKTOP_BEFORE: string[] = ['b2293fa1', '705cb674']
