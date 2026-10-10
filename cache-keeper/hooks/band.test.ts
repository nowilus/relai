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

function world(on: On) {
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
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
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
  // STYL_PASKOW_CLAUDE.md (2026-10-09): a soft background, no colored frame, the time left on the right
  test('after a request: a labelled bar on its own background, the time left on the right, the engine kept beneath', async ($, on) => {
    world(on)
    await mainStep($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(140) })
      const card = await ui.find({ key: 'relai-cache-card' })
      const props = card?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string }
      expect(props.backgroundColor).toBe('#2c2824')
      expect(props.borderStyle).toBe(surface === 'desktop' ? 'round' : undefined)
      if (surface === 'desktop') expect(props.borderColor).toBe('#2c2824') // corners only, no colored frame
      expect((await ui.find({ key: 'label' }))?.text).toBe(THEME.cache.label)
      expect((await ui.find({ key: 'state' }))?.text).toBe('Cache ciepły')
      expect((await ui.find({ key: 'figure' }))?.text).toContain('60')
      expect((await ui.find({ key: 'figure' }))?.text).toContain('min do końca')
      expect((await ui.find({ key: 'cache-actions' }))?.text).toContain('Przekaż')
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('nothing is wider than 40 columns', async ($, on) => {
    world(on)
    await mainStep($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND(40) })
      expect(await ui.find({ key: 'relai-cache-card' })).toBeDefined()
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.unmount()
    }
  })
})
