import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAR, CHIP } from './relai/theme.mjs'

type Engine = Parameters<TestBody>[0]

// The handoff reckoning wired into the keeper (AUDYT_MODOW Z9): the cache bar's second row
// appears only when a fresh session pays off, `Zostań` hides it until the context grows by a
// fifth, `/cache zwrot N` moves the threshold, and `/cache` shows the whole reckoning — or says
// which number is missing.
//
// Every figure is worked out by hand in the comments. Opus 5.5 on the built-in list, TTL 60 min
// assumed: read 4 × 0.05 = $0.2/M, write 4 × 2 = $8/M, output $20/M. Each turn below is one main
// step writing 2,000 output tokens: the output part of a turn = 2,000 × 20 / 1e6 = $0.04.
// S = 30k: the start-layer write = 30,000 × 8 / 1e6 = $0.24; a turn after = 30,000 × 0.2 / 1e6
// + 0.04 = $0.046 → "$0.05/turę".

const NOW = Date.UTC(2026, 9, 10, 12) // the measured date reads 2026-10-10 in any time zone
const MIN = 60_000
const ROOT = 'C:/proj'
const MEASURED = { [`start:${ROOT}`]: { tokens: 30_000, date: '2026-10-09' } }

const BAND = {
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} },
}

type Limit = { kind: string, percentUsed: number }
type World = { ctx: number, limits: Limit[], turns: number, store: Map<string, unknown> }

function world(on: On, options: { store?: Record<string, unknown>, turns?: number, disk?: Record<string, string> } = {}) {
  const w: World = { ctx: 0, limits: [], turns: options.turns ?? 5, store: new Map(Object.entries(options.store ?? {})) }
  const clock = mock.clock(on, { now: NOW })
  on('store.get', ($, e) => ({ value: w.store.get(e.key) as never }))
  on('store.set', ($, e) => { w.store.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { w.store.delete(e.key); return { value: undefined } })
  mock.env(on, {})
  const disk = options.disk ?? {}
  const key = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: ROOT }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: w.turns }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: w.ctx } as never, rateLimits: w.limits, cost: { usd: 1 } } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  // One main step reading the whole context from the cache and writing 2,000 output tokens
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 2_000, cache_read_input_tokens: w.ctx - 10, cache_creation_input_tokens: 0, model: 'claude-opus-5-5' },
    }
    return result
  })
  return { w, clock }
}

let turnNo = 0
async function turn($: Engine, w: World, ctx: number, fiveHour?: number) {
  w.ctx = ctx
  if (fiveHour !== undefined) w.limits = [{ kind: 'five_hour', percentUsed: fiveHour }]
  const id = 't' + ++turnNo
  const s = $.turn.step({ turnId: id, index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: id, reason: 'answer' } as never)
}

const start = ($: Engine) => $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })

const cache = ($: Engine, args = '') =>
  $.command.run({ command: 'cache', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } }).then((r) => JSON.stringify(r))

const mount = ($: Engine, surface: 'terminal' | 'desktop' = 'desktop') => $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND })

describe('the cache bar second row: a fresh session pays off (Z9)', () => {
  // Before Z9: /cache had no reckoning ("Werdykt" absent) — the test failed on its last line
  // Z1 (brief v2): calm has no button at all — Przekaż lives only in a second row, /handoff always
  test('below the threshold: no second row, no button in calm, /cache says stay', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    // 100k warm: here = 100,000 × 0.2 / 1e6 + 0.04 = $0.06; saving = 70,000 × 0.2 / 1e6 = $0.014
    // N = ceil((0.06 + 0.24) / 0.014) = ceil(21.43) = 22 > 5 → stay
    await turn($, w, 100_000)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await mount($, surface)
      expect(await ui.find({ key: 'cache-event' })).toBeUndefined()
      expect(await ui.findAll({ type: 'Button' })).toEqual([])
      await ui.unmount()
    }
    expect(await cache($)).toContain('Werdykt: zostań — nie opłaca się, nowa sesja zwróciłaby się dopiero po 22 turach.')
  })

  // Before Z9: no "cache-event" row — failed at its first find
  test('above the threshold: the row with the verdict words, the measured 5-hour pace and the one Przekaż', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    // Turn one sets the 5-hour base (10 %); turn two moves it to 10.8 %: one measured turn,
    // 0.8 % on an 800k context → after = 0.8 / 800,000 × 30,000 = 0.03 %
    await turn($, w, 800_000, 10)
    await turn($, w, 800_000, 10.8)
    // 800k warm: here = 0.16 + 0.04 = $0.20; saving = 770,000 × 0.2 / 1e6 = $0.154
    // N = ceil((0.20 + 0.24) / 0.154) = ceil(2.857) = 3 ≤ 5 → hand off
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await mount($, surface)
      const row = await ui.find({ key: 'cache-event' })
      expect(row?.text).toContain('nowa sesja zwróci się po 3 turach · ≈ $0.20 → $0.05/turę · 0,80 % → 0,03 % limitu 5 h')
      expect(row?.text).toContain('Przekaż')
      expect(row?.text).toContain('Zostań')
      // The handoff button moved into the row: hotkey h once in the whole band
      const buttons = await ui.findAll({ type: 'Button' })
      expect(buttons.filter((b) => b.props.hotkey === 'h').length).toBe(1)
      expect(buttons.map((b) => b.props.label)).toEqual(['Przekaż', 'Zostań'])
      await ui.unmount()
    }
  })

  // Aneks Z11 (brief v3 §10.5): information, not an alarm — before it the chip was CHIP.warn, one Text
  test('the event chip is CHIP.info: its lead bold in the text color, the rest muted', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    await turn($, w, 800_000) // N = 3, the row shows
    const ui = await mount($)
    const nodes: RenderNode[] = []
    const walk = (node: RenderNode) => {
      if (typeof node === 'string') return
      nodes.push(node)
      for (const k of (node as { children?: RenderNode[] }).children ?? []) walk(k)
    }
    walk(await ui.drawn())
    const props = (node: RenderNode) => ((node as { props?: Record<string, unknown> }).props ?? {})
    const chip = nodes.find((x) => typeof x !== 'string' && x.type === 'Box' && props(x).backgroundColor === CHIP.info.bg)
    expect(chip).toBeDefined()
    const texts = ((chip as { children?: RenderNode[] }).children ?? []).map((t) => [
      ((t as { children?: RenderNode[] }).children ?? []).join(''), props(t).bold ?? false, props(t).color,
    ])
    expect(texts).toEqual([
      ['nowa sesja zwróci się po 3 turach', true, BAR.text],
      [' · ≈ $0.20 → $0.05/turę', false, BAR.muted],
    ])
    await ui.unmount()
  })

  // Before Z9: no "cache-event" row — failed at its find
  test('a cold cache with ctx > 2·S: the row even though the payback is long', async ($, on) => {
    const { w, clock } = world(on, { store: MEASURED })
    await start($)
    await turn($, w, 200_000)
    await clock.advance(61 * MIN) // the tick sees the cache go cold and reckons again
    // Cold: here = 200,000 × 8 / 1e6 + 0.04 = $1.64; saving = 170,000 × 0.2 / 1e6 = $0.034
    // N = ceil((1.64 + 0.24) / 0.034) = ceil(55.29) = 56 > 5, but cold and 200k > 2 × 30k → row
    const ui = await mount($)
    expect((await ui.find({ key: 'cache-event' }))?.text).toContain('cache zimny · nowa sesja zwróci się po 56 turach · ≈ $1.64 → $0.05/turę')
    await ui.unmount()
  })

  // Before Z9: no "stay" button to press — failed at the press
  test('Zostań hides the row until the context grows by 20 %', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    await turn($, w, 800_000) // N = 3, the row shows
    const ui = await mount($)
    expect(await ui.find({ key: 'cache-event' })).toBeDefined()
    await ui.press({ key: 'stay' })
    expect(await ui.find({ key: 'cache-event' })).toBeUndefined()
    expect(await ui.findAll({ type: 'Button' })).toEqual([])
    // 900k: still N = ceil((0.18 + 0.04 + 0.24) / 0.174) = ceil(2.64) = 3, but 900k < 1.2 × 800k = 960k
    await turn($, w, 900_000)
    expect(await ui.find({ key: 'cache-event' })).toBeUndefined()
    // 960k = 1.2 × 800k: here = 0.192 + 0.04 = $0.232 → "$0.23"; saving = 930,000 × 0.2 / 1e6 = $0.186
    // N = ceil((0.232 + 0.24) / 0.186) = ceil(2.54) = 3 → the row is back
    await turn($, w, 960_000)
    expect((await ui.find({ key: 'cache-event' }))?.text).toContain('nowa sesja zwróci się po 3 turach · ≈ $0.23 → $0.05/turę')
    await ui.unmount()
  })

  // Before Z9: "nieznane ustawienie: zwrot" — failed at the first expectation
  test('/cache zwrot 2 moves the threshold: 800k (N = 3) stays; a wrong value is explained', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    await turn($, w, 800_000)
    const answer = await cache($, 'zwrot 2')
    expect(answer).toContain('N = 3 (próg 2)')
    expect(answer).toContain('Werdykt: zostań')
    expect(answer).toContain('zwrot 2')
    const ui = await mount($)
    expect(await ui.find({ key: 'cache-event' })).toBeUndefined()
    await ui.unmount()
    expect(await cache($, 'zwrot 51')).toContain('zwrot: liczba tur od 1 do 50')
    expect(await cache($)).toContain('N = 3 (próg 2)')
    expect(w.store.get('settings')).toMatchObject({ paybackTurns: 2 })
  })
})

describe('/cache shows the reckoning or what is missing (Z9)', () => {
  // Before Z9: no reckoning in /cache — failed at the first expectation
  test('the whole reckoning with its assumptions', async ($, on) => {
    const { w } = world(on, { store: MEASURED })
    await start($)
    await turn($, w, 100_000)
    const status = await cache($)
    expect(status).toContain('Kontynuować czy nowa sesja')
    expect(status).toContain('odczyt 100k z cache po $0.2/M + wyjście 2.0k po $20/M')
    // (0.06 + 0.24) / 0.014 → 22
    expect(status).toContain('Zwrot: ($0.060 + $0.24) / $0.014 oszczędności na turze → N = 22 (próg 5).')
    expect(status).toContain('TTL 60 min założony')
    expect(status).toContain('warstwa startu 30.0k (zmierzona po pierwszej turze sesji 2026-10-09)')
    expect(status).toContain('Limit 5 h: brak pomiaru')
  })

  // Before Z9: /cache said nothing of a start layer — failed at the first expectation
  test('no S outside a RelAI project: /cache names the missing number, no row even at 800k', async ($, on) => {
    const { w } = world(on)
    await start($)
    await turn($, w, 800_000)
    expect(await cache($)).toContain('Nie liczę, czy nowa sesja się opłaca: brak rozmiaru warstwy startu.')
    const ui = await mount($)
    expect(await ui.find({ key: 'cache-event' })).toBeUndefined()
    expect(await ui.findAll({ type: 'Button' })).toEqual([])
    await ui.unmount()
  })
})

describe('the start layer S: measured first, estimated as a fallback (Z9)', () => {
  // Before Z9: nothing stored — failed at the store expectation
  test('a fresh session measures S after its first main turn, per project, and only then', async ($, on) => {
    const { w } = world(on, { turns: 0 })
    await start($)
    await turn($, w, 42_000)
    expect(w.store.get(`start:${ROOT}`)).toEqual({ tokens: 42_000, date: '2026-10-10' })
    await turn($, w, 100_000) // not the first turn: S stays
    expect(w.store.get(`start:${ROOT}`)).toEqual({ tokens: 42_000, date: '2026-10-10' })
    expect(await cache($)).toContain('warstwa startu 42.0k (zmierzona po pierwszej turze sesji 2026-10-10)')
  })

  // Control: passed before Z9 too (nothing was ever stored)
  test('a resumed session (turns already in the transcript) measures nothing', async ($, on) => {
    const { w } = world(on, { turns: 3 })
    await start($)
    await turn($, w, 42_000)
    expect(w.store.has(`start:${ROOT}`)).toBe(false)
  })

  // Before Z9: no estimate in /cache — failed at the first expectation
  test('a RelAI project with nothing measured: the ritual files bytes ÷ 4, the journal capped at 12 KB', async ($, on) => {
    // CLAUDE.md 4,000 B (names the active plan) + STATE 2,000 + USTAWIENIA 1,000 + LEKCJE 1,500 × "ż"
    // = 3,000 B + DZIENNIK 20,000 → 12,288 + the plan's STATUS 1,712 = 24,000 B ÷ 4 = 6,000 tokens
    const disk = {
      [`${ROOT}/CLAUDE.md`]: 'Aktywny plan: [PLAN](docs/plany/PLAN/STATUS.md), w toku\n'.padEnd(4_000, 'x'),
      [`${ROOT}/docs/STATE.md`]: 'x'.repeat(2_000),
      [`${ROOT}/docs/USTAWIENIA.md`]: '| Wersja RelAI | 2.8.0 |\n'.padEnd(1_000, 'x'),
      [`${ROOT}/docs/LEKCJE.md`]: 'ż'.repeat(1_500),
      [`${ROOT}/docs/DZIENNIK.md`]: 'x'.repeat(20_000),
      [`${ROOT}/docs/plany/PLAN/STATUS.md`]: 'x'.repeat(1_712),
    }
    const { w } = world(on, { disk })
    await start($)
    await turn($, w, 100_000)
    const status = await cache($)
    expect(status).toContain('warstwa startu 6.0k (szacunek z plików rytuału startu: 24000 B ÷ 4, z dziennika pierwsze 12 KB)')
    // 100k warm against S = 6k: saving = 94,000 × 0.2 / 1e6 = $0.0188; start write = 6,000 × 8 / 1e6 = $0.048
    // N = ceil((0.06 + 0.048) / 0.0188) = ceil(5.74) = 6 > 5 → stay
    expect(status).toContain('N = 6 (próg 5)')
  })
})
