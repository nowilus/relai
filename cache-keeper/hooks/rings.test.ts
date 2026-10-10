import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND, BAR, BATTERY, CHIP } from './relai/theme.mjs'

type Engine = Parameters<TestBody>[0]
type Mounted = Awaited<ReturnType<Engine['ui']['mount']>>

// The cache bar after Aneks Z11 (AUDYT_MODOW, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md §1, §10):
// in calm one row of five batteries — cache, limit 5 h, reset za, limit tygodnia, kontekst — each
// a label and a value, the full words in a card on hover; the session's cost once, on the right;
// zero buttons; a second row only while its reason lasts, one at a time.
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
// A card is drawn in the same Svg as the batteries but hidden at rest (display:none): what the
// person sees without pointing is the drawing without its cards
const atRest = (source: string) => source.replace(/<g class="t t\d+">.*?<\/g>/g, '')

// What the person sees: every Text's words and every Svg's drawing at rest (never its alt)
async function visible(ui: Mounted): Promise<string> {
  const drawn = await ui.drawn()
  const texts = [...walk(drawn)].filter((x) => typeof x !== 'string' && x.type === 'Text').map(textOf)
  const sources = (await svgs(ui)).map((p) => atRest(String(p.source ?? '')))
  return [...texts, ...sources].join('\n')
}

type BatteryView = { name: string, share: number | null, color: string | null, label: string, value: string, a: string, b: string, icon: number, card: { x: number, w: number } }

// The batteries as drawn on the desktop, in order: each icon a <g class="i iN b-<name>"> (its hover
// target first, the fill of class f 18 px × the share left), then its words (label, value); each
// card a <g class="t tN"> after every measure, with lines a and b
async function batteriesOf(ui: Mounted): Promise<BatteryView[]> {
  const out: BatteryView[] = []
  for (const p of await svgs(ui)) {
    const source = String(p.source ?? '')
    const cards = new Map<string, { x: number, w: number, a: string, b: string }>()
    for (const m of source.matchAll(/<g class="t t(\d+)"><rect x="(-?[\d.]+)" y="[\d.]+" width="([\d.]+)"[^>]*\/><text[^>]*><tspan class="a"[^>]*>([^<]*)<\/tspan><tspan class="b"[^>]*>([^<]*)<\/tspan><\/text><\/g>/g)) {
      cards.set(m[1] ?? '', { x: Number(m[2]), w: Number(m[3]), a: m[4] ?? '', b: m[5] ?? '' })
    }
    for (const m of source.matchAll(/<g class="i i(\d+) b-(\w+)"><rect x="(-?[\d.]+)"[^>]*\/>(.*?)<\/g><text class="w"[^>]*><tspan[^>]*>([^<]*)<\/tspan><tspan[^>]*>([^<]*)<\/tspan><\/text>/g)) {
      const fill = (m[4] ?? '').match(/<rect class="f"[^>]*width="([\d.]+)"[^>]*fill="(#[0-9a-f]{6})"/)
      const card = cards.get(m[1] ?? '')
      out.push({
        name: m[2] ?? '', icon: Number(m[3]) + 3, share: fill ? Number(fill[1]) / 18 : null, color: fill?.[2] ?? null,
        label: m[5] ?? '', value: m[6] ?? '', a: card?.a ?? '', b: card?.b ?? '', card: { x: card?.x ?? NaN, w: card?.w ?? NaN },
      })
    }
  }
  return out
}
const byName = (list: BatteryView[]) => Object.fromEntries(list.map((x) => [x.name, x]))
// A share in whole percent: the drawing rounds the fill's width to 0.01 px
const pct = (share: number | null | undefined) => (share === null || share === undefined ? null : Math.round(share * 100))

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

const iso = (ts: number) => new Date(ts).toISOString()
const FIVE_LEFT = 66 * MIN // 1 h 06 min to the 5-hour reset
const DAY = 24 * 60 * MIN

describe('the calm cache bar: five batteries, the session cost on the right (Aneks Z11, brief v3 §10)', () => {
  test('cache, limit 5 h, reset za, limit tygodnia, kontekst: label and value on the bar, the full words in each card; one fluid Svg of 24 px', async ($, on) => {
    const fiveReset = NOW + FIVE_LEFT
    const weekReset = NOW + DAY
    world(on, {
      ctx: 323_000, window: 1_000_000, cost: 14.93,
      limits: [{ kind: 'five_hour', percentUsed: 64, resetsAt: iso(fiveReset) }, { kind: 'seven_day', percentUsed: 41, resetsAt: iso(weekReset) }],
    })
    await start($)
    await turn($)
    const ui = await mount($, 'desktop', 200)
    const list = await svgs(ui)
    expect(list.length).toBe(1)
    const svg = list[0] ?? {}
    expect(svg.isInteractive).toBe(true)
    expect(svg.height).toBe(24)
    const source = String(svg.source)
    // width="100%": a fixed width is centred in the interactive frame (P-024 pkt 1)
    expect(source).toMatch(/^<svg [^>]*width="100%" height="24">/)
    expect(source).not.toContain('viewBox')
    const b = await batteriesOf(ui)
    expect(b.map((x) => [x.name, x.label, x.value])).toEqual([
      ['cache', 'cache', '~60 min'], ['five', 'limit 5 h', '64 %'], ['reset', 'reset za', '1 h 06 min'],
      ['week', 'limit tygodnia', '41 %'], ['ctx', 'kontekst', '323k'],
    ])
    expect(b.map((x) => [x.a, x.b])).toEqual([
      ['Ciepły · ~60 min', 'TTL 60 min założony'],
      ['64 % · 5 h', `zużyte 64 % · zostało 36 % · reset ${hhmm(fiveReset)}`],
      ['Reset limitu 5 h za 1 h 06 min', `reset ${hhmm(fiveReset)}`],
      ['41 % · tydzień', `zużyte 41 % · zostało 59 % · reset jutro ${hhmm(weekReset)}`],
      ['323k · kontekst', 'zużyte 323k z 1M · wolne 68 %'],
    ])
    // The label muted, the value bold in the text color, 14.5 px
    expect(source).toContain(`<tspan class="l" fill="${BAR.muted}">limit 5 h</tspan>`)
    expect(source).toContain(`<tspan class="v" dx="7" fill="${BAR.text}" font-weight="600">64 %</tspan>`)
    expect(source).toContain('font-size="14.5"')
    await ui.unmount()
  })

  test('at rest only label and value: no TTL, window, reset hour, used or left; the cache time and the session cost once each', async ($, on) => {
    world(on, {
      ctx: 323_000, window: 1_000_000, cost: 14.93,
      limits: [{ kind: 'five_hour', percentUsed: 64, resetsAt: iso(NOW + FIVE_LEFT) }, { kind: 'seven_day', percentUsed: 41, resetsAt: iso(NOW + DAY) }],
    })
    await start($)
    await turn($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await mount($, surface)
      const words = await visible(ui)
      if (surface === 'desktop') {
        for (const detail of ['TTL', 'z 1M', 'zużyte', 'zostało', 'Ciepły', 'Reset limitu']) expect(words).not.toContain(detail)
        expect(words).not.toMatch(/reset (jutro|\d)/)
      }
      expect(words.split('~60').length - 1).toBe(1)
      expect(words.split('$14.93').length - 1).toBe(1)
      const figure = (await ui.find({ key: 'figure' }))?.text ?? ''
      expect(figure).toContain('$14.93')
      expect(figure).toContain('sesja')
      expect(figure).not.toContain('min')
      expect(await ui.findAll({ type: 'Button' })).toEqual([])
      expect(await secondRows(ui)).toEqual([])
      await ui.unmount()
    }
  })

  test('each card opens on its own icon only: .iN:hover~.tN, hidden at rest, drawn after every measure, never over its icon', async ($, on) => {
    world(on, {
      ctx: 323_000, window: 1_000_000, cost: 14.93,
      limits: [{ kind: 'five_hour', percentUsed: 64, resetsAt: iso(NOW + FIVE_LEFT) }, { kind: 'seven_day', percentUsed: 41, resetsAt: iso(NOW + DAY) }],
    })
    await start($)
    await turn($)
    for (const columns of [200, 160, 130]) {
      const ui = await mount($, 'desktop', columns)
      for (const p of await svgs(ui)) {
        const source = String(p.source ?? '')
        const n = [...source.matchAll(/<g class="i i\d+ /g)].length
        expect(source).toContain('.t{display:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}')
        for (let i = 0; i < n; i++) expect(source).toContain(`.i${i}:hover~.t${i}{display:inline}`)
        expect(source.match(/:hover/g)?.length).toBe(n) // no other hover
        expect(source.lastIndexOf('<g class="i ')).toBeLessThan(source.indexOf('<g class="t '))
        expect(source).toContain(`fill="${BATTERY.card.bg}"`)
        expect(source).toMatch(/^<svg [^>]*width="100%" height="24">/)
      }
      const b = await batteriesOf(ui)
      expect(b.length).toBe(5)
      for (const x of b) expect(x.card.x >= x.icon + 26 || x.card.x + x.card.w <= x.icon).toBe(true)
      if (columns === 160) {
        // 127 cells × 8 px = 1016 px of column, five batteries in one row (~902 px); the context's
        // card would end at ~1175 px, so it opens on the left. At 9.8 px a cell (1245 px) it opened
        // on the right and the app clipped it (zrzut 2026-10-10)
        expect((await svgs(ui)).length).toBe(1)
        const { ctx } = byName(b)
        expect((ctx?.card.x ?? 0) + (ctx?.card.w ?? 0)).toBeLessThanOrEqual((ctx?.icon ?? 0) - 6)
      }
      if (columns === 130) {
        // 776 px of column: four batteries in the first row, the week's card would run past it on
        // the right, so it opens on the left; the context wraps to a second row
        expect((await svgs(ui)).length).toBe(2)
        const { cache, week } = byName(b)
        expect(cache?.card.x).toBeGreaterThanOrEqual((cache?.icon ?? 0) + 26)
        expect((week?.card.x ?? 0) + (week?.card.w ?? 0)).toBeLessThanOrEqual((week?.icon ?? 0) - 6)
      }
      await ui.unmount()
    }
  })

  for (const [used, share, color] of [[1, 0.99, SAGE], [64, 0.36, SAGE], [99, 0.01, CLAY], [71, 0.29, MUSTARD], [90, 0.1, CLAY]] as const) {
    test(`the limits at ${used} % used: the value "${used} %", the battery ${Math.round(share * 100)} % full, ${color === SAGE ? 'sage' : color === MUSTARD ? 'mustard' : 'clay'}`, async ($, on) => {
      world(on, { window: 1_000_000, limits: [{ kind: 'five_hour', percentUsed: used }, { kind: 'seven_day', percentUsed: used }] })
      await start($)
      await turn($)
      const ui = await mount($)
      const b = byName(await batteriesOf(ui))
      for (const name of ['five', 'week']) {
        expect(b[name]?.value).toBe(`${used} %`)
        expect(pct(b[name]?.share)).toBe(pct(share))
        expect(b[name]?.color).toBe(color)
      }
      await ui.unmount()
    })
  }

  for (const [ctx, share, color] of [[323_000, 0.68, SAGE], [720_000, 0.28, MUSTARD], [950_000, 0.05, CLAY]] as const) {
    test(`the context at ${ctx / 1000}k of 1M: the battery ${Math.round(share * 100)} % full`, async ($, on) => {
      world(on, { ctx, window: 1_000_000 })
      await start($)
      await turn($)
      const ui = await mount($)
      const c = byName(await batteriesOf(ui)).ctx
      expect(c?.value).toBe(`${ctx / 1000}k`)
      expect(pct(c?.share)).toBe(pct(share))
      expect(c?.color).toBe(color)
      await ui.unmount()
    })
  }

  test('reset za drains over the 5-hour window and stays sage at 5 % left, the limit beside it clay', async ($, on) => {
    world(on, { window: 1_000_000, limits: [{ kind: 'five_hour', percentUsed: 95, resetsAt: iso(NOW + 15 * MIN) }] })
    await start($)
    await turn($)
    const ui = await mount($)
    const b = byName(await batteriesOf(ui))
    expect(b.reset?.value).toBe('15 min')
    expect(pct(b.reset?.share)).toBe(5)
    expect(b.reset?.color).toBe(SAGE)
    expect(b.reset?.a).toBe('Reset limitu 5 h za 15 min')
    expect(b.five?.color).toBe(CLAY)
    await ui.unmount()
  })

  // TTL 60 min: 19 min left is 31.7 % (sage), 18 min 30 % (mustard), 7 min 11.7 % (mustard), 6 min 10 % (clay)
  test('the cache battery empties with the TTL: mustard at 30 % left or less, clay at 10 % or less; cold is an empty battery', async ($, on) => {
    const { clock } = world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    const at = async (minutes: number) => {
      await clock.advance(minutes * MIN)
      const ui = await mount($)
      const c = byName(await batteriesOf(ui)).cache
      await ui.unmount()
      return c
    }
    const nineteen = await at(41)
    expect([nineteen?.value, nineteen?.color]).toEqual(['~19 min', SAGE])
    expect(pct(nineteen?.share)).toBe(32) // 19 of 60 min
    expect((await at(1))?.color).toBe(MUSTARD)
    const seven = await at(11)
    expect([seven?.value, seven?.color, seven?.a]).toEqual(['stygnie ~7 min', MUSTARD, 'Stygnie · ~7 min'])
    expect((await at(1))?.color).toBe(CLAY)
    const cold = await at(18) // 12 min past the TTL: an empty battery, the rewrite in the card
    expect([cold?.value, cold?.share, cold?.a, cold?.b]).toEqual(['zimny', null, 'Zimny · od 12 min', 'zapis ≈ $1.60'])
  })

  test('a missing number: an empty battery, "brak danych" and a card that says so, never a seeming zero', async ($, on) => {
    world(on) // no limits reported, no window known, no cost
    await start($)
    await turn($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await mount($, surface)
      if (surface === 'desktop') {
        const b = byName(await batteriesOf(ui))
        for (const name of ['five', 'reset', 'week']) {
          expect(b[name]?.share).toBeNull()
          expect(b[name]?.value).toBe('brak danych')
          expect(b[name]?.b).toBe('brak danych')
        }
        expect([b.five?.a, b.reset?.a, b.week?.a]).toEqual(['limit 5 h', 'Reset limitu 5 h', 'limit tygodnia'])
        expect([b.ctx?.value, b.ctx?.share, b.ctx?.a, b.ctx?.b]).toEqual(['200k', null, '200k · kontekst', 'brak danych'])
      } else {
        for (const key of ['m-five', 'm-reset', 'm-week']) {
          const text = (await ui.find({ key }))?.text ?? ''
          expect(text).toContain('○')
          expect(text.split('brak danych').length - 1).toBe(1) // line b says no more than the value
        }
      }
      const figure = (await ui.find({ key: 'figure' }))?.text ?? ''
      expect(figure).toContain('brak danych')
      expect(figure).toContain('kosztu')
      expect(await visible(ui)).not.toMatch(/(^|[^\d])0 %/)
      await ui.unmount()
    }
  })

  test('the terminal: per measure a glyph of what is left, label and value, then line b muted', async ($, on) => {
    world(on, { ctx: 500_000, window: 1_000_000, cost: 1.5, limits: [{ kind: 'five_hour', percentUsed: 11 }, { kind: 'seven_day', percentUsed: 80 }] })
    await start($)
    await turn($)
    const ui = await mount($, 'terminal')
    expect(await svgs(ui)).toEqual([])
    const line = async (key: string) => (await ui.find({ key }))?.text ?? ''
    expect(await line('m-cache')).toMatch(/^●.*cache.*~60 min.*TTL 60 min założony/)
    expect(await line('m-five')).toMatch(/^●.*limit 5 h.*11 %.*zużyte 11 % · zostało 89 % · reset nieznany/)
    expect(await line('m-reset')).toMatch(/^○.*reset za.*brak danych/)
    expect(await line('m-week')).toMatch(/^◔.*limit tygodnia.*80 %.*zużyte 80 % · zostało 20 %/)
    expect(await line('m-ctx')).toMatch(/^◑.*kontekst.*500k.*zużyte 500k z 1M · wolne 50 %/)
    expect((await ui.find({ key: 'figure' }))?.text).toContain('$1.50')
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
