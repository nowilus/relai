import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

type Engine = Parameters<TestBody>[0]

// The keeper's tick without empty redraws (AUDYT_MODOW Z4): the band above the prompt is drawn
// again only when its words change — the minute of the countdown, the state — and the snapshot
// is saved only when the state changed, never every 30 s for nothing.

const NOW = 1_000_000
const MIN = 60_000

const BAND = (bodyColumns: number) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

function world(on: On) {
  const n = { invalidate: 0, store: 0 }
  const clock = mock.clock(on, { now: NOW })
  // The plugin's store in memory, counted: mock.store would answer the same nouns uncounted
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { n.store += 1; kept.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { kept.delete(e.key); return { value: undefined } })
  on('ui.invalidate', ($, e, next) => { n.invalidate += 1; return next(e) })
  mock.env(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 183_210 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('fs.exists', () => ({ value: false }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: 'claude-opus-5-5' },
    }
    return result
  })
  return { n, clock }
}

async function mainTurn($: Engine) {
  const s = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: 't1', reason: 'answer' } as never)
}

describe('the cache keeper idles quietly (Z4)', () => {
  test('five idle minutes: one redraw per minute the countdown shows, no snapshot saved', async ($, on) => {
    const { n, clock } = world(on)
    await $.session.start({ cwd: 'C:/proj', surface: 'desktop', isInteractive: true })
    await mainTurn($)
    const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface: 'desktop', ...BAND(140) })
    // The batteries' drawing (Aneks Z11): the cache time stands there, the figure on the right is the cost
    const drawing = async () => (await ui.findAll({ type: 'Svg' })).map((s) => String((s.props as { source?: string }).source ?? '')).join('')
    expect(await drawing()).toContain('>~60 min<')
    const before = { ...n }
    await clock.advance(5 * MIN)
    // ~60 → ~55: the cache battery's value turned five times, the band was drawn five times, nothing was saved
    expect(await drawing()).toContain('>~55 min<')
    expect(n.invalidate - before.invalidate).toBe(5)
    expect(n.store - before.store).toBe(0)
    await ui.unmount()
  })

  test('the last minute counts seconds: each tick that changes them redraws; a cold cache redraws once a minute, when its age moves', async ($, on) => {
    const { n, clock } = world(on)
    await $.session.start({ cwd: 'C:/proj', surface: 'desktop', isInteractive: true })
    await mainTurn($)
    await clock.advance(59 * MIN)
    const before = n.invalidate
    await clock.advance(MIN) // 30 s left, then the end: two ticks, two changes
    expect(n.invalidate - before).toBe(2)
    const cold = n.invalidate
    // "zimny · od N min" moves once a minute (rounded: at 0:30, 1:30, …), the state does not
    await clock.advance(30 * MIN)
    expect(n.invalidate - cold).toBe(30)
    // Saved only on a change: the turn, then the warnings at 10 and 5 minutes left (the state
    // remembers them); 90 idle minutes of ticks besides saved nothing
    expect(n.store).toBe(3)
  })
})
