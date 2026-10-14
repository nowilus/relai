import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND as THEME } from './relai/theme.mjs'

type Engine = Parameters<TestBody>[0]

// The keeper's card above the prompt (plan PANEL_CLAUDE, E9, Aneks C): labelled, framed in its own
// color, never instead of what the plugins beneath draw, and never wider than 40 columns.

const BAND = (bodyColumns: number) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

function world(on: On, beneath = 'engine') {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: 'claude-opus-5-5' },
    }
    return result
  })
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: beneath, children: [Text({ children: [beneath] })] })
  })
}

async function mainStep($: Engine) {
  const s = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The narrowest the tree can be drawn, in columns (panel/hooks/theme.test.ts, the same instrument)
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : minWidth(textOf(node))
  if (node.type !== 'Box') return 0
  const kids = ((node as { children?: RenderNode[] }).children ?? []).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(minWidth)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, kids.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return inner + padX + (p.borderStyle ? 2 : 0)
}

describe('the cache card above the prompt', () => {
  // STYL_PASKOW_CLAUDE.md (Aneks Z11) and WYGLAD_PANELU E1 (variant 3b): no surface, no frame, a rule
  // above the card on the desktop; the session's cost on the right
  test('after a request: a labelled bar under its rule, the session cost on the right, the engine kept beneath', async ($, on) => {
    world(on)
    await mainStep($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(140) })
      const card = await ui.find({ key: 'relai-cache-card' })
      const props = card?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string }
      expect(props.backgroundColor).toBeUndefined()
      expect(props.borderStyle).toBeUndefined()
      // The bottom bar: only the engine beneath, so no rule under it (Łukasz, 2026-10-14)
      expect(await ui.find({ key: 'rule' })).toBeUndefined()
      expect((await ui.find({ key: 'label' }))?.text).toBe(THEME.cache.label)
      // Aneks Z11: the batteries in the middle, the session's cost on the right (none known here), no button in calm
      expect(await ui.find({ key: 'cache-batteries' })).toBeDefined()
      expect((await ui.find({ key: 'figure' }))?.text).toBe('brak danych kosztu')
      expect(await ui.findAll({ type: 'Button' })).toEqual([])
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  // Brief v2 §9: calm, cooling (its second row with two buttons), kept and cold, each at 40 columns
  test('nothing is wider than 40 columns, in calm and with each second row', async ($, on) => {
    const clock = mock.clock(on, { now: 1_000_000 })
    mock.store(on)
    on('ui.toast', () => ({ value: undefined }) as never)
    on('turn.step', async function* ($, e) {
      const result: TurnStepResult = {
        turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: 'claude-opus-5-5' },
      }
      return result
    })
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
      const { Box, Text } = $.ui.resolve(e)
      return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
    })
    await mainStep($)
    const check = async (row: string | null) => {
      for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(40) })
        expect(await ui.find({ key: 'relai-cache-card' })).toBeDefined()
        if (row) expect(await ui.find({ key: row })).toBeDefined()
        expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
        await ui.unmount()
      }
    }
    await check(null)
    await clock.advance(51 * 60_000)
    await check('cache-cooling')
    await $.command.run({ command: 'keepwarm', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 40 } })
    await check('cache-kept')
    await $.command.run({ command: 'keepwarm', args: 'off', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 40 } })
    await clock.advance(20 * 60_000)
    await check(null)
  })
})

// WYGLAD_PANELU E1 (Aneks B, P-042): the bar follows the app's appearance by itself — Box and Text
// in theme keys only, the Svg marks with a dark and a light palette — and fits a narrow split pane
describe('the bar in the tool\'s own colors (WYGLAD_PANELU E1)', () => {
  const HEX = /^#[0-9a-f]{3,8}$/i
  const kidsOf = (n: RenderNode): RenderNode[] => (typeof n === 'string' ? [] : (n as { children?: RenderNode[] }).children ?? [])
  const propsOf = (n: RenderNode): Record<string, unknown> => (typeof n === 'string' ? {} : (n as { props?: Record<string, unknown> }).props ?? {})
  // Every raw color a Box or a Text paints with; an Svg's markup is its own (its marks switch by CSS)
  const rawColors = (n: RenderNode): string[] => {
    if (typeof n === 'string') return []
    const own = n.type === 'Svg' ? [] : ['color', 'backgroundColor', 'borderColor'].map((k) => String(propsOf(n)[k] ?? '')).filter((v) => HEX.test(v))
    return [...own, ...kidsOf(n).flatMap(rawColors)]
  }
  const svgSources = (n: RenderNode): string[] => (typeof n === 'string' ? []
    : [...(n.type === 'Svg' ? [String(propsOf(n).source ?? '')] : []), ...kidsOf(n).flatMap(svgSources)])

  test('no raw color on a Box or a Text, every Svg with both palettes', async ($, on) => {
    world(on)
    await mainStep($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(140) })
      const drawn = await ui.drawn()
      expect(rawColors(drawn)).toEqual([])
      const sources = svgSources(drawn)
      if (surface === 'desktop') {
        expect(sources.length).toBeGreaterThan(0) // at least the card's own drawing
        for (const s of sources) expect(s).toContain('@media (prefers-color-scheme: light)')
      } else expect(sources).toEqual([])
      await ui.unmount()
    }
  })

  test('fits a narrow split pane, half a window and a full one (40, 70, 140 columns)', async ($, on) => {
    world(on)
    await mainStep($)
    for (const columns of [40, 70, 140]) {
      for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(columns) })
        expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(columns)
        await ui.unmount()
      }
    }
  })
})
