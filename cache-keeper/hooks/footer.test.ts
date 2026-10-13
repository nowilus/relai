import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

type Engine = Parameters<TestBody>[0]

// The footer line (thread PASKI_W_STOPCE): in a split window only the first panel draws the bars
// (P-040), while a plugin's status line stands in every panel and in a pop-out (probe 2026-10-13).
// The footer shows one plugin's line, so the keeper carries it all: the session's work as
// relai-panel wrote it, then the cache, 5 h and week batteries' words.

const ROOT = 'C:/proj'
const NOW = Date.UTC(2026, 9, 13, 10, 0)
const MIN = 60_000
const SETTINGS = `${ROOT}/docs/USTAWIENIA.md`
const FOOTER = `${ROOT}/.claude/relai/stopka/s1.txt`
const settingsFile = '# USTAWIENIA\n\nWersja RelAI: 3.0.0\n'
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

describe('the footer line', () => {
  test('in a RelAI project: the work relai-panel wrote, then cache, 5 h, the week and the context', async ($, on) => {
    const { statuses } = world(on, { [SETTINGS]: settingsFile, [FOOTER]: 'PASKI_W_STOPCE (odnoga)\n' })
    await start($)
    await mainTurn($)
    await measure($, 7, 29)
    expect(statuses[statuses.length - 1]).toBe('PASKI_W_STOPCE (odnoga) · cache ~60 min · 5 h 7 % · tydz. 29 % · kontekst 183k')
  })

  test('outside a RelAI project: the cache part alone, no file of the panel read', async ($, on) => {
    const { statuses } = world(on, { [FOOTER]: 'NIE_TEN (odnoga)\n' })
    await start($)
    await mainTurn($)
    await measure($, 11, 30)
    expect(statuses[statuses.length - 1]).toBe('cache ~60 min · 5 h 11 % · tydz. 30 % · kontekst 183k')
  })

  test('before any request: the plan words alone, never a seeming cache figure', async ($, on) => {
    const { statuses } = world(on, { [SETTINGS]: settingsFile, [FOOTER]: 'PANEL_X · E2\n' })
    await start($)
    expect(statuses[statuses.length - 1]).toBe('PANEL_X · E2')
  })

  test('the same words are not sent again; the cache minute moving them is', async ($, on) => {
    const { statuses, clock } = world(on, { [SETTINGS]: settingsFile, [FOOTER]: 'PANEL_X · E2\n' })
    await start($)
    await mainTurn($)
    await measure($, 7, 29)
    const sent = statuses.length
    await measure($, 7, 29)
    expect(statuses.length).toBe(sent)
    await clock.advance(10 * MIN)
    expect(statuses[statuses.length - 1]).toBe('PANEL_X · E2 · cache ~50 min · 5 h 7 % · tydz. 29 % · kontekst 183k')
  })
})
