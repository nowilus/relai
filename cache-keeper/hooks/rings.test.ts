import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND, BAR, CHIP, RING } from './relai/theme.mjs'

type Engine = Parameters<TestBody>[0]
type Mounted = Awaited<ReturnType<Engine['ui']['mount']>>

// The cache bar after brief v2 (AUDYT_MODOW Z1, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md §1, §4):
// in calm one row of four rings — cache, 5 h, week, context — each with a two-line caption, the
// session's cost once, zero buttons; a second row only while its reason lasts, one at a time.
//
// Opus 5.5 on the built-in list, TTL 60 min assumed: a cache write is $8/M, so 200k → $1.60.

const NOW = Date.UTC(2026, 9, 10, 12)
const MIN = 60_000
const SAGE = BAR.segment.done
const MUSTARD = BAND.panel.color
const CLAY = BAND.cache.color

const BAND_AT = (bodyColumns = 140) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

type Limit = { kind: string, percentUsed: number, resetsAt?: string }
type World = { ctx: number, window: number | undefined, limits: Limit[], cost: number | undefined }

function world(on: On, options: { store?: Record<string, unknown>, ctx?: number, window?: number, limits?: Limit[], cost?: number } = {}) {
  const w: World = { ctx: options.ctx ?? 200_000, window: options.window, limits: options.limits ?? [], cost: options.cost }
  const clock = mock.clock(on, { now: NOW })
  const kept = new Map<string, unknown>(Object.entries(options.store ?? {}))
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
  on('session.usage', () => ({
    value: {
      startedAt: NOW,
      context: (w.window ? { tokens: w.ctx, window: w.window } : { tokens: w.ctx }) as never,
      rateLimits: w.limits as never,
      ...(w.cost === undefined ? {} : { cost: { usd: w.cost } }),
    },
  }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.toast', () => ({ value: undefined }) as never)
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 500, cache_read_input_tokens: w.ctx - 10, cache_creation_input_tokens: 0, model: 'claude-opus-5-5' },
    }
    return result
  })
  return { w, clock }
}

let turnNo = 0
async function turn($: Engine) {
  const id = 'r' + ++turnNo
  const s = $.turn.step({ turnId: id, index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: id, reason: 'answer' } as never)
}

const start = ($: Engine) => $.session.start({ cwd: 'C:/proj', surface: 'desktop', isInteractive: true })
const mount = ($: Engine, surface: 'terminal' | 'desktop' = 'desktop', columns = 140) => $.ui.mount({ plugin: 'relai-cache-keeper', surface, ...BAND_AT(columns) })

const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

function* walk(node: RenderNode): Generator<RenderNode> {
  if (typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}

const propsOf = (node: RenderNode) => ((node as { props?: Record<string, unknown> }).props ?? {})

async function svgs(ui: Mounted) {
  return [...walk(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg').map(propsOf)
}

// What the person sees: every Text's words and every Svg's drawing (never its alt)
async function visible(ui: Mounted): Promise<string> {
  const drawn = await ui.drawn()
  const texts = [...walk(drawn)].filter((x) => typeof x !== 'string' && x.type === 'Text').map(textOf)
  const sources = (await svgs(ui)).map((p) => String(p.source ?? ''))
  return [...texts, ...sources].join('\n')
}

type RingView = { color: string | null, a: string, b: string }

// The rings as drawn on the desktop: each a <g class="r r-<name>"> with an optional fill circle
// (class f, its stroke the fill color) and two caption lines (class a, class b)
async function ringsOf(ui: Mounted): Promise<Record<string, RingView>> {
  const source = (await svgs(ui)).map((p) => String(p.source ?? '')).join('')
  const out: Record<string, RingView> = {}
  for (const m of source.matchAll(/<g class="r r-(\w+)">(.*?)<\/g>/g)) {
    const body = m[2] ?? ''
    out[m[1] ?? ''] = {
      color: body.match(/<circle class="f"[^>]*stroke="(#[0-9a-f]{6})"/)?.[1] ?? null,
      a: body.match(/<text class="a"[^>]*>([^<]*)<\/text>/)?.[1] ?? '',
      b: body.match(/<text class="b"[^>]*>([^<]*)<\/text>/)?.[1] ?? '',
    }
  }
  return out
}

const two = (n: number) => String(n).padStart(2, '0')
const hhmm = (ts: number) => `${two(new Date(ts).getHours())}:${two(new Date(ts).getMinutes())}`

const SECOND_ROWS = ['cache-ready', 'cache-running', 'cache-cooling', 'cache-event', 'cache-kept'] as const
async function secondRows(ui: Mounted): Promise<string[]> {
  const found: string[] = []
  for (const key of SECOND_ROWS) if (await ui.find({ key })) found.push(key)
  return found
}

const snap = (phase: string, lastActivity = NOW - MIN) => ({
  'snap:s1': {
    id: 's1', lastActivity, savedAt: NOW - MIN, ctx: 200_000, rateLimits: [], costUsd: 1.5,
    handoff: { phase, notTurn: '', relai: false, body: '# Przekazanie sesji\nstan', path: 'C:/x.md' },
  },
})

describe('the calm cache bar: four rings with two-line captions (brief v2 §4)', () => {
  test('cache, 5 h, week and context left to right, each caption as the brief table; one Svg row, width in the markup', async ($, on) => {
    const fiveReset = NOW + 60 * MIN
    const weekReset = NOW + 24 * 60 * MIN
    world(on, {
      ctx: 259_000, window: 1_000_000, cost: 1.5,
      limits: [
        { kind: 'five_hour', percentUsed: 11, resetsAt: new Date(fiveReset).toISOString() },
        { kind: 'seven_day', percentUsed: 23, resetsAt: new Date(weekReset).toISOString() },
      ],
    })
    await start($)
    await turn($)
    const ui = await mount($)
    const list = await svgs(ui)
    expect(list.length).toBe(1)
    const svg = list[0] ?? {}
    expect(svg.isInteractive).toBe(true)
    expect(svg.width).toBeUndefined() // the markup's own width (P-020 pkt 7)
    expect(String(svg.source)).toMatch(/^<svg [^>]*width="\d+(\.\d+)?" height="\d+"/)
    expect(Number(svg.height)).toBeGreaterThanOrEqual(22)
    expect(Number(svg.height)).toBeLessThanOrEqual(28)
    const source = String(svg.source)
    expect([...source.matchAll(/<g class="r r-(\w+)">/g)].map((m) => m[1])).toEqual(['cache', 'five', 'week', 'ctx'])
    const r = await ringsOf(ui)
    expect(r.cache).toEqual({ color: SAGE, a: 'Ciepły · ~60 min', b: 'TTL 60 min założony' })
    expect(r.five).toEqual({ color: SAGE, a: '11 % · 5 h', b: `reset ${hhmm(fiveReset)}` })
    expect(r.week).toEqual({ color: SAGE, a: '23 % · tydzień', b: `reset jutro ${hhmm(weekReset)}` })
    expect(r.ctx).toEqual({ color: SAGE, a: '259k · kontekst', b: 'z 1M · 26 %' })
    // The caption lines in their colors and about 11 px; rounded caps, the fill starting at the top
    expect(source).toMatch(new RegExp(`\\.a\\{[^}]*fill:${BAR.text}`))
    expect(source).toMatch(new RegExp(`\\.b\\{[^}]*fill:${BAR.muted}`))
    expect(source).toContain('font-size:11px')
    expect(source).toContain('stroke-linecap="round"')
    expect(source).toContain('rotate(-90')
    expect(source).toContain(`stroke="${RING.track}"`)
    await ui.unmount()
  })

  test('hover only thickens the ring: a :hover rule to the hover stroke, no tooltip, no overlay', async ($, on) => {
    world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    const ui = await mount($)
    const source = String((await svgs(ui))[0]?.source ?? '')
    expect(source).toContain(`.r:hover .f{stroke-width:${RING.hoverStroke}}`)
    expect(source).not.toContain('<title')
    expect(source).not.toContain('display:none')
    await ui.unmount()
  })

  for (const [percent, color] of [[69, SAGE], [70, MUSTARD], [89, MUSTARD], [90, CLAY]] as const) {
    test(`the 5 h ring at ${percent} % is ${color === SAGE ? 'sage' : color === MUSTARD ? 'mustard' : 'clay'}`, async ($, on) => {
      world(on, { window: 1_000_000, limits: [{ kind: 'five_hour', percentUsed: percent }] })
      await start($)
      await turn($)
      const ui = await mount($)
      const r = await ringsOf(ui)
      expect(r.five?.color).toBe(color)
      expect(r.five?.a).toBe(`${percent} % · 5 h`)
      await ui.unmount()
    })
  }

  // TTL 60 min: 22 min left is 36.7 % (sage), 21 min 35 % (mustard), 10 min 16.7 % (mustard), 9 min 15 % (clay)
  test('the cache ring empties with the TTL: mustard at 35 % left or less, clay at 15 % or less', async ($, on) => {
    const { clock } = world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    const at = async (minutes: number) => {
      await clock.advance(minutes * MIN)
      const ui = await mount($)
      const r = (await ringsOf(ui)).cache
      await ui.unmount()
      return r
    }
    expect((await at(38))?.color).toBe(SAGE)
    expect((await at(1))?.color).toBe(MUSTARD)
    expect((await at(11))?.color).toBe(MUSTARD)
    const nine = await at(1)
    expect(nine?.color).toBe(CLAY)
    expect(nine?.a).toBe('Stygnie · ~9 min')
    const cold = await at(21) // 12 min past the TTL: an empty ring, the rewrite on line 2
    expect(cold).toEqual({ color: null, a: 'Zimny · od 12 min', b: 'zapis ≈ $1.60' })
  })

  test('a missing number: an empty ring captioned "brak danych", never a seeming zero', async ($, on) => {
    world(on, { cost: 1.5 }) // no limits reported, no window known
    await start($)
    await turn($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await mount($, surface)
      if (surface === 'desktop') {
        const r = await ringsOf(ui)
        for (const name of ['five', 'week', 'ctx'] as const) {
          expect(r[name]?.color).toBeNull()
          expect(r[name]?.b).toBe('brak danych')
        }
        expect(r.five?.a).toBe('5 h')
        expect(r.week?.a).toBe('tydzień')
        expect(r.ctx?.a).toBe('200k · kontekst')
      } else {
        for (const key of ['ring-five', 'ring-week', 'ring-ctx']) {
          const text = (await ui.find({ key }))?.text ?? ''
          expect(text).toContain('○')
          expect(text).toContain('brak danych')
        }
      }
      expect(await visible(ui)).not.toMatch(/(^|[^\d])0 %/)
      await ui.unmount()
    }
  })

  test('the session cost exactly once above the prompt, in usd(); zero buttons in calm', async ($, on) => {
    world(on, { ctx: 400_000, window: 1_000_000, cost: 1.5, limits: [{ kind: 'five_hour', percentUsed: 11 }] })
    await start($)
    await turn($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await mount($, surface)
      const words = await visible(ui)
      expect(words.split('sesja ≈').length - 1).toBe(1)
      expect(words).toContain('sesja ≈ $1.50')
      expect(await ui.findAll({ type: 'Button' })).toEqual([])
      expect(await secondRows(ui)).toEqual([])
      const figure = (await ui.find({ key: 'figure' }))?.text ?? ''
      expect(figure).toContain('~60')
      expect(figure).toContain('min')
      expect(figure).not.toContain('do końca')
      await ui.unmount()
    }
  })

  test('the terminal: a glyph and the two caption lines as one line per ring', async ($, on) => {
    world(on, { ctx: 500_000, window: 1_000_000, limits: [{ kind: 'five_hour', percentUsed: 11 }, { kind: 'seven_day', percentUsed: 80 }] })
    await start($)
    await turn($)
    const ui = await mount($, 'terminal')
    expect(await svgs(ui)).toEqual([])
    const line = async (key: string) => (await ui.find({ key }))?.text ?? ''
    expect(await line('ring-cache')).toMatch(/^●.*Ciepły · ~60 min.*TTL 60 min założony/)
    expect(await line('ring-five')).toMatch(/^◔.*11 % · 5 h.*reset nieznany/)
    expect(await line('ring-week')).toMatch(/^◕.*80 % · tydzień/)
    expect(await line('ring-ctx')).toMatch(/^◑.*500k · kontekst.*z 1M · 50 %/)
    await ui.unmount()
  })
})

describe('the cache bar second row: one at a time, only while its reason lasts (brief v2 §1)', () => {
  test('cooling: the chip with the rewrite, Podtrzymaj (no hotkey) and Przekaż (h); kept: the pings and Zatrzymaj; cold: none', async ($, on) => {
    const { clock } = world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    await clock.advance(51 * MIN) // 9 min left: cooling
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await mount($, surface)
      expect(await secondRows(ui)).toEqual(['cache-cooling'])
      const row = await ui.find({ key: 'cache-cooling' })
      expect(row?.text).toContain('stygnie · ponowny zapis ≈ $1.60')
      const buttons = await ui.findAll({ type: 'Button' })
      expect(buttons.map((b) => b.props.label)).toEqual(['Podtrzymaj', 'Przekaż'])
      expect(buttons.map((b) => b.props.hotkey ?? null)).toEqual([null, 'h'])
      // The native Button is taller than a line: the row keeps one cell off the rings (P-021 pkt 6)
      expect((row?.props as { marginTop?: number }).marginTop ?? 0).toBe(surface === 'desktop' ? 1 : 0)
      await ui.unmount()
    }
    const ui = await mount($)
    await ui.press({ key: 'keepwarm' })
    expect(await secondRows(ui)).toEqual(['cache-kept'])
    expect((await ui.find({ key: 'cache-kept' }))?.text).toContain('0 pingów')
    expect((await ui.findAll({ type: 'Button' })).map((b) => b.props.label)).toEqual(['Zatrzymaj'])
    await ui.press({ key: 'stop' })
    expect(await secondRows(ui)).toEqual(['cache-cooling'])
    await clock.advance(10 * MIN) // past the TTL: cold, the reason gone
    expect(await secondRows(ui)).toEqual([])
    expect(await ui.findAll({ type: 'Button' })).toEqual([])
    await ui.unmount()
  })

  test('a ready handoff: the chip, Wyczyść i kontynuuj (primary, c) and Zostań; it outranks cooling; Zostań ends it', async ($, on) => {
    const { clock } = world(on, { store: snap('ready', NOW - 51 * MIN) }) // the cache cools as well
    await start($)
    await clock.advance(1000)
    const ui = await mount($)
    expect(await secondRows(ui)).toEqual(['cache-ready'])
    const row = await ui.find({ key: 'cache-ready' })
    expect(row?.text).toContain('przekazanie gotowe')
    const buttons = await ui.findAll({ type: 'Button' })
    expect(buttons.map((b) => [b.props.label, b.props.variant, b.props.hotkey ?? null])).toEqual([
      ['Wyczyść i kontynuuj', 'primary', 'c'], ['Zostań', 'secondary', null],
    ])
    await ui.press({ key: 'stay-ready' })
    expect(await secondRows(ui)).toEqual(['cache-cooling'])
    await ui.unmount()
  })

  test('a handoff under way: a chip that says so, no buttons, until it ends', async ($, on) => {
    world(on, { store: snap('running') })
    await start($)
    const ui = await mount($)
    expect(await secondRows(ui)).toEqual(['cache-running'])
    expect((await ui.find({ key: 'cache-running' }))?.text).toContain('przekazanie trwa')
    expect(await ui.findAll({ type: 'Button' })).toEqual([])
    await ui.unmount()
  })

  test('every chip is drawn in the CHIP colors', async ($, on) => {
    const { clock } = world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    await clock.advance(51 * MIN)
    const ui = await mount($)
    const chip = await ui.find({ key: 'chip' })
    expect((chip?.props as { backgroundColor?: string }).backgroundColor).toBe(CHIP.warn.bg)
    await ui.unmount()
  })
})
