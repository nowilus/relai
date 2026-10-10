import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

type Engine = Parameters<TestBody>[0]

// The keeper's hooks on a counted mock `$` (AUDYT_MODOW Z7): keep-warm pings just before the TTL
// and stops on the 5-hour limit threshold and on a ping that wrote instead of read; the handoff
// goes /handoff → its prompt → a turn ending with the RelAI marker → ready → /handoff dalej runs
// /clear and then sends the continue prompt. (/clear through session.end: correctness.test.ts.)
// Every count has its positive control in this file.

const NOW = 1_000_000
const MIN = 60_000
const TICK = 30_000
const ROOT = 'C:/proj'
const DONE = 'PRZEKAZANIE GOTOWE' // the marker the RelAI handoff prompt asks for
const STAY = 'Zostań w tym czacie'

type Limit = { kind: string, percentUsed: number }
type Usage = { input_tokens: number, output_tokens: number, cache_read_input_tokens: number, cache_creation_input_tokens: number }
type World = {
  limits: Limit[], forks: number[], pings: Usage[], toasts: string[], log: string[], asked: string[], answer: string,
}

const READ: Usage = { input_tokens: 10, output_tokens: 2, cache_read_input_tokens: 183_000, cache_creation_input_tokens: 0 }
const WROTE: Usage = { input_tokens: 10, output_tokens: 2, cache_read_input_tokens: 1_000, cache_creation_input_tokens: 182_000 }

function world(on: On, options: { relai?: boolean } = {}) {
  const w: World = { limits: [], forks: [], pings: [], toasts: [], log: [], asked: [], answer: STAY }
  const clock = mock.clock(on, { now: NOW })
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { kept.delete(e.key); return { value: undefined } })
  mock.env(on, {})
  const disk: Record<string, string> = options.relai ? { [`${ROOT}/docs/USTAWIENIA.md`]: '| Wersja RelAI | 2.8.0 |' } : {}
  const key = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: ROOT }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 183_010 } as never, rateLimits: w.limits, cost: { usd: 1 } } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.toast', ($, e) => { w.toasts.push(e.text); return { value: undefined } as never })
  // The keep-warm ping: a fork of the conversation, counted with the time it went out
  on('model.fork', async () => {
    w.forks.push(clock.now())
    const usage = w.pings.shift() ?? READ
    return { value: { isAnswered: true, text: 'ok', usage: { ...usage, model: 'claude-opus-5-5' } } as never }
  })
  // What the keeper sends to the chat, in order: a command it runs, a prompt it submits
  on('command.run', ($, e) => { w.log.push('/' + e.command); return { text: 'ok' } })
  on('prompt.submit', ($, e) => { w.log.push(e.text); return { text: e.text } })
  // $.ui.ask is a tool call of AskUserQuestion
  on('tool.call', ($, e) => {
    const questions = (e as unknown as { questions: { question: string }[] }).questions
    w.asked.push(questions[0]?.question ?? '')
    return { result: { questions, answers: { [questions[0]?.question ?? '']: w.answer } } } as never
  })
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
  return { w, clock }
}

async function turn($: Engine, id: string, answer = 'ok') {
  const s = $.turn.step({ turnId: id, index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer, durationMs: 5000, isAborted: false, turnId: id, reason: 'answer' } as never)
}

const run = ($: Engine, command: string, args = '') =>
  $.command.run({ command, args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } }).then((r) => JSON.stringify(r))

// A session with one big request at NOW and keep-warm switched on right after it
async function kept($: Engine, setting = '') {
  await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
  if (setting) expect(await run($, 'cache', setting)).not.toContain('procent 1–100')
  await turn($, 't1')
  expect(await run($, 'keepwarm')).toContain('Podtrzymuję cache')
}

describe('keep-warm pings just before the TTL and stops when it should (Z7)', () => {
  test('a 60-minute TTL: no ping through minute 51:30, one at 52:00, the next 52 minutes after it', async ($, on) => {
    const { w, clock } = world(on)
    await kept($)
    await clock.advance(52 * MIN - TICK) // the last tick before the ping is due
    expect(w.forks).toEqual([])
    // Positive control: the very next tick pings, 8 minutes before the cache would lapse
    await clock.advance(TICK)
    expect(w.forks.map((t) => (t - NOW) / MIN)).toEqual([52])
    await clock.advance(52 * MIN)
    expect(w.forks.map((t) => (t - NOW) / MIN)).toEqual([52, 104])
    expect(w.toasts.filter((t) => t.includes('Podtrzymanie wyłączone'))).toEqual([])
  })

  for (const c of [
    { setting: '', used: 89, forks: 1 }, // under the default 90 %: the positive control
    { setting: '', used: 90, forks: 0 },
    { setting: 'limit 80', used: 85, forks: 0 },
  ]) {
    test(`the 5-hour limit at ${c.used} % with maxLimitPercent ${c.setting ? 80 : 90}: ${c.forks ? 'the ping goes' : 'no ping, keep-warm off, a toast says why'}`, async ($, on) => {
      const { w, clock } = world(on)
      await kept($, c.setting)
      // The plan's use grew while the session idled: the keeper reads it fresh before paying
      w.limits = [{ kind: 'five_hour', percentUsed: c.used }]
      await clock.advance(52 * MIN)
      expect(w.forks.length).toBe(c.forks)
      const stopped = w.toasts.filter((t) => t.includes('Podtrzymanie wyłączone'))
      if (c.forks) expect(stopped).toEqual([])
      else expect(stopped.join('\n')).toContain(`≥ ${c.setting ? 80 : 90}%`)
      // Off for good: an hour more brings no ping
      await clock.advance(60 * MIN)
      expect(w.forks.length).toBe(c.forks ? 2 : 0)
    })
  }

  test('a ping that wrote instead of read stops keep-warm: no further ping', async ($, on) => {
    const { w, clock } = world(on)
    w.pings = [READ, WROTE]
    await kept($)
    await clock.advance(52 * MIN)
    expect(w.forks.length).toBe(1) // positive control: a reading ping keeps it on
    expect(w.toasts.filter((t) => t.includes('Podtrzymanie wyłączone'))).toEqual([])
    await clock.advance(52 * MIN)
    expect(w.forks.length).toBe(2)
    expect(w.toasts.filter((t) => t.includes('Podtrzymanie wyłączone')).join('\n')).toContain('zamiast odczytać cache')
    await clock.advance(120 * MIN)
    expect(w.forks.length).toBe(2)
  })
})

describe('the RelAI handoff end to end (Z7)', () => {
  test('/handoff sends its prompt; a turn ending with the marker makes it ready; /handoff dalej runs /clear, then sends "kontynuujemy pracę"', async ($, on) => {
    const { w, clock } = world(on, { relai: true })
    await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
    await turn($, 't1')
    expect(await run($, 'handoff')).toContain('Przekazanie RelAI')
    await clock.advance(100)
    expect(w.log.length).toBe(1)
    expect(w.log[0]).toContain(`napisz w osobnej linii dokładnie: ${DONE}`)
    // The handoff's own turn ends with the marker: ready, and the keeper asks once (answered "stay")
    await turn($, 't2', `Zsynchronizowano docs/STATE.md i DZIENNIK.\n${DONE}`)
    await clock.advance(500)
    expect(w.asked.length).toBe(1)
    expect(w.log.length).toBe(1) // nothing cleared or sent on "stay"
    const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface: 'desktop', component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
    expect((await ui.find({ key: 'cache-ready' }))?.text).toContain('przekazanie gotowe')
    await ui.unmount()
    // /handoff dalej: first the /clear, then the RelAI phrase as the fresh chat's first message
    expect(await run($, 'handoff', 'dalej')).toContain('Czyszczę czat')
    await clock.advance(100)
    expect(w.log.slice(1)).toEqual(['/clear', 'kontynuujemy pracę'])
  })

  test('without the marker the handoff is not ready: /handoff dalej clears nothing and sends nothing', async ($, on) => {
    const { w, clock } = world(on, { relai: true })
    await $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
    await turn($, 't1')
    await run($, 'handoff')
    await clock.advance(100)
    await turn($, 't2', 'Zsynchronizowano część dokumentów.')
    await clock.advance(500)
    expect(w.asked).toEqual([])
    expect(w.toasts.join('\n')).toContain('nie potwierdziła zakończenia')
    expect(await run($, 'handoff', 'dalej')).toContain('Brak gotowego przekazania')
    await clock.advance(100)
    expect(w.log.filter((x) => x === '/clear' || x === 'kontynuujemy pracę')).toEqual([])
  })
})
