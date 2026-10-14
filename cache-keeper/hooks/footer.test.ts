import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

type Engine = Parameters<TestBody>[0]

// The footer line, withdrawn (thread SPLIT_VIEW): 0.7.0–0.8.0 set a status line because a split
// window drew the bars only in the first panel (P-040). Every panel draws them now (measured
// 2026-10-14), so the keeper sets no line — it only clears the one an older version left, since a
// status line outlives a reload (P-040 point 6).

const ROOT = 'C:/proj'
const NOW = Date.UTC(2026, 9, 14, 10, 0)
const MIN = 60_000
const SETTINGS = `${ROOT}/docs/USTAWIENIA.md`
const settingsFile = '# USTAWIENIA\n\nWersja RelAI: 3.1.0\n'
const five = (percentUsed: number) => ({ kind: 'five_hour', percentUsed, resetsAt: new Date(NOW + 60 * MIN).toISOString() })
const week = (percentUsed: number) => ({ kind: 'seven_day', percentUsed, resetsAt: new Date(NOW + 3 * 24 * 60 * MIN).toISOString() })

function world(on: On, disk: Record<string, string>) {
  const statuses: (string | undefined)[] = []
  const clock = mock.clock(on, { now: NOW })
  mock.store(on)
  mock.env(on, {})
  const key = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: ROOT }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 5 }))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.status', ($, e) => { statuses.push(e.text); return { value: undefined } as never })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: 'claude-opus-5-5' },
    }
    return result
  })
  return { statuses, clock }
}

async function mainTurn($: Engine) {
  const s = $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: 't1', reason: 'answer' } as never)
}

const start = ($: Engine) => $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
const measure = ($: Engine, fivePct: number, weekPct: number) =>
  $.session.measure({ context: { tokens: 183_010 } as never, rateLimits: [five(fivePct), week(weekPct)] as never, changed: ['rateLimits'] })

describe('the footer line, withdrawn', () => {
  test('in a RelAI project: the old line is cleared once and no new one is set', async ($, on) => {
    const { statuses, clock } = world(on, { [SETTINGS]: settingsFile })
    await start($)
    await mainTurn($)
    await measure($, 7, 29)
    await clock.advance(10 * MIN)
    expect(statuses).toEqual([undefined])
  })

  test('outside a RelAI project: the same — one clear, never a cache line', async ($, on) => {
    const { statuses, clock } = world(on, {})
    await start($)
    await mainTurn($)
    await measure($, 11, 30)
    await clock.advance(10 * MIN)
    expect(statuses).toEqual([undefined])
  })
})
