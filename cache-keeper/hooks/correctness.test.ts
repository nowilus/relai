import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

type Engine = Parameters<TestBody>[0]

// The keeper's correctness (AUDYT_MODOW Z5): a /clear starts from a fresh state, a dismissed
// question and a failed compaction send nothing, no band button answers a bare digit, and the
// rates come from the project's saved price list.

const NOW = 1_000_000
const MIN = 60_000
const ASK = { send: 'Wyślij mimo to', compact: 'Najpierw compact, potem wyślij', cancel: 'Anuluj' }

const BAND = {
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} },
}

// A price file with one model the built-in list does not know (a made-up name: no table has it)
const PRICE_FILE = JSON.stringify({
  v: 1,
  versions: [{
    date: '2026-10-09', source: 'strona cennika Anthropic (platform.claude.com), odczyt 2026-10-09', from: NOW - 10 * MIN,
    models: { 'claude-sonnet-6': { input: 3, output: 15, read: 0.3, write5m: 3.75, write1h: 6 } },
  }],
})

type World = { id: string, model: string, asked: string[], sent: string[], toasts: string[], store: Map<string, unknown> }

function world(on: On, options: { answer?: string | Error, compact?: 'skip' | 'reject', relai?: boolean, model?: string } = {}) {
  const w: World = { id: 's1', model: options.model ?? 'claude-opus-5-5', asked: [], sent: [], toasts: [], store: new Map() }
  const clock = mock.clock(on, { now: NOW })
  on('store.get', ($, e) => ({ value: w.store.get(e.key) as never }))
  on('store.set', ($, e) => { w.store.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { w.store.delete(e.key); return { value: undefined } })
  mock.env(on, {})
  // Paths in the system's form (P-017): compared with forward slashes
  const disk: Record<string, string> = options.relai
    ? { 'C:/proj/docs/USTAWIENIA.md': '| Wersja RelAI | 2.8.0 |', 'C:/proj/.claude/relai/panel/cennik.json': PRICE_FILE }
    : {}
  const key = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: w.id }))
  on('session.model', () => ({ value: w.model }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 183_010 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.toast', ($, e) => { w.toasts.push(e.text); return { value: undefined } as never })
  on('prompt.submit', ($, e) => { w.sent.push(e.text); return { text: e.text } })
  // $.ui.ask is a tool call of AskUserQuestion; Esc dismisses it, which rejects the ask
  on('tool.call', ($, e) => {
    const questions = (e as unknown as { questions: { question: string }[] }).questions
    w.asked.push(questions[0]?.question ?? '')
    const answer = options.answer ?? ASK.cancel
    if (answer instanceof Error) throw answer
    return { result: { questions, answers: { [questions[0]?.question ?? '']: answer } } } as never
  })
  on('session.compact', () => {
    if (options.compact === 'reject') throw new Error('a turn is running')
    if (options.compact === 'skip') return { skip: 'a hook vetoed it' }
    return { messages: [{ role: 'user' as const, text: 'streszczenie', toolUses: [] }] }
  })
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: w.model },
    }
    return result
  })
  return { w, clock }
}

async function bigTurn($: Engine, model = 'claude-opus-5-5') {
  await $.session.start({ cwd: 'C:/proj', surface: 'desktop', isInteractive: true })
  const s = $.turn.step({ turnId: 't1', index: 0, model, messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: 't1', reason: 'answer' } as never)
}

const typed = ($: Engine, text: string) =>
  $.prompt.submit({ text, wait: false, origin: { kind: 'composer' } } as never) as Promise<{ text?: string, drop?: string }>

const cache = ($: Engine) =>
  $.command.run({ command: 'cache', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } }).then((r) => JSON.stringify(r))

describe('/clear starts the keeper afresh (Z5)', () => {
  test('session.end with reason clear: the band yields, the old snapshot is gone, the first message is not questioned', async ($, on) => {
    const { w, clock } = world(on)
    await bigTurn($)
    await clock.advance(61 * MIN) // a cold 183k context: the guard would ask
    expect(w.store.has('snap:s1')).toBe(true)
    w.id = 's2'
    await $.session.end({ reason: 'clear', sessionId: 's1', resume: {} } as never)
    expect(w.store.has('snap:s1')).toBe(false)
    const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface: 'desktop', ...BAND })
    expect(await ui.find({ key: 'relai-cache-card' })).toBeUndefined()
    expect(await ui.find({ key: 'engine' })).toBeDefined()
    await ui.unmount()
    expect((await typed($, 'nowe zadanie')).drop).toBeUndefined()
    expect(w.asked).toEqual([])
    expect(w.sent).toEqual(['nowe zadanie'])
    expect(await cache($)).toContain('kontekst 0 tokenów')
  })

  test('a session id that changed without session.end (a /resume) resets the state before the guard reads it', async ($, on) => {
    const { w, clock } = world(on)
    await bigTurn($)
    await clock.advance(61 * MIN)
    w.id = 's2'
    expect((await typed($, 'inna rozmowa')).drop).toBeUndefined()
    expect(w.asked).toEqual([])
    expect(w.sent).toEqual(['inna rozmowa'])
  })
})

describe('the cold-cache guard never sends by accident (Z5)', () => {
  test('a dismissed question (Esc) is "Anuluj": nothing sent', async ($, on) => {
    const { w, clock } = world(on, { answer: new Error('dismissed') })
    await bigTurn($)
    await clock.advance(61 * MIN)
    const r = await typed($, 'wiadomość')
    expect(w.asked.length).toBe(1)
    expect(r.drop).toBeDefined()
    expect(w.sent).toEqual([])
  })

  for (const failure of ['skip', 'reject'] as const) {
    test(`"Najpierw compact, potem wyślij" with a compaction that ${failure === 'skip' ? 'was vetoed' : 'threw'}: nothing sent, a toast says why`, async ($, on) => {
      const { w, clock } = world(on, { answer: ASK.compact, compact: failure })
      await bigTurn($)
      await clock.advance(61 * MIN)
      const r = await typed($, 'wiadomość')
      await clock.advance(1000) // the compaction runs after the hook (the engine refuses it inside)
      expect(r.drop).toBeDefined()
      expect(w.sent).toEqual([])
      expect(w.toasts.some((t) => t.includes('Kompakcja nie powiodła się') && t.includes('nic nie wysłano'))).toBe(true)
    })
  }

  // Control: it passed before Z5 too (the old code sent at once, the compaction's result unread)
  test('"Najpierw compact, potem wyślij" with a compaction that worked sends the message after it', async ($, on) => {
    const { w, clock } = world(on, { answer: ASK.compact })
    await bigTurn($)
    await clock.advance(61 * MIN)
    await typed($, 'wiadomość')
    await clock.advance(1000)
    expect(w.sent).toEqual(['wiadomość'])
    expect(w.toasts.filter((t) => t.includes('nie powiodła'))).toEqual([])
  })
})

describe('no band button answers a bare digit (Z5)', () => {
  test('cooling and kept: the keep-warm buttons carry no digit hotkey and no text promises one', async ($, on) => {
    const { w, clock } = world(on)
    await bigTurn($)
    await clock.advance(51 * MIN) // the 10-minute warning, the state cooling
    for (const step of ['cooling', 'kept'] as const) {
      if (step === 'kept') await $.command.run({ command: 'keepwarm', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
      for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND })
        const buttons = await ui.findAll({ type: 'Button' })
        expect(buttons.some((b) => b.props.label === (step === 'kept' ? 'Zatrzymaj' : 'Podtrzymaj'))).toBe(true)
        expect(buttons.filter((b) => /^\d$/.test(String(b.props.hotkey ?? ''))).map((b) => b.props.label)).toEqual([])
        await ui.unmount()
      }
    }
    expect(w.toasts.some((t) => t.includes('wygaśnie'))).toBe(true)
    expect(w.toasts.filter((t) => /klawisz \d/.test(t))).toEqual([])
  })
})

describe('the rates come from the project saved price list (Z5)', () => {
  test('a model only in cennik.json is priced at the file rate; /cache names the list date and source', async ($, on) => {
    const { clock } = world(on, { relai: true, model: 'claude-sonnet-6' })
    await bigTurn($, 'claude-sonnet-6')
    await clock.advance(61 * MIN)
    const status = await cache($)
    // 183 010 tokens written again at the file's 1-hour rate, $6 per million: $1.10
    expect(status).toContain('zapisze go ponownie za ≈ $1.10')
    expect(status).toContain('2026-10-09')
    expect(status).toContain('strona cennika Anthropic')
  })

  test('a model in neither the built-in list nor cennik.json has no price: "cena nieznana", never zero, never guessed', async ($, on) => {
    // Claude Haiku 4.5: priced by the keeper's own old table, absent from both lists here
    const { clock } = world(on, { relai: true, model: 'claude-haiku-4-5' })
    await bigTurn($, 'claude-haiku-4-5')
    await clock.advance(61 * MIN)
    expect(await cache($)).toContain('zapisze go ponownie za ≈ cena nieznana')
  })
})
