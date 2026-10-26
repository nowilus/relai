import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND, BAR, BATTERY, CHIP_KEY } from './relai/theme.mjs'
import { batteryRows, cacheMeasure, compactThreshold, contextRow, limitMeasure } from './rings'
import type { ThresholdSource } from './limit'

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
// A fill is drawn by its ink class (WYGLAD_PANELU E1, P-042); the tests keep naming the state by
// its color of the motif, so the ink maps back to it
const COLOR_OF_INK: Record<string, string> = { done: SAGE, running: MUSTARD, failed: CLAY }

const BAND_AT = (bodyColumns = 140) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

type Limit = { kind: string, percentUsed: number, resetsAt?: string }
// compact: the engine's auto-compact threshold in tokens; null = auto-compact off; absent = no breakdown
type World = { ctx: number, window: number | undefined, limits: Limit[], cost: number | undefined, compact?: number | null, asked: string[] }

function world(on: On, options: { store?: Record<string, unknown>, ctx?: number, window?: number, limits?: Limit[], cost?: number, compact?: number | null, env?: Record<string, string> } = {}) {
  const w: World = { ctx: options.ctx ?? 200_000, window: options.window, limits: options.limits ?? [], cost: options.cost, compact: options.compact, asked: [] }
  const clock = mock.clock(on, { now: NOW })
  const kept = new Map<string, unknown>(Object.entries(options.store ?? {}))
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { kept.delete(e.key); return { value: undefined } })
  mock.env(on, options.env ?? {})
  on('fs.exists', () => ({ value: false }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 5 }))
  on('session.usage', ($, e) => {
    const detail = (e as { breakdown?: string } | undefined)?.breakdown
    if (detail) w.asked.push(detail)
    const breakdown = detail && w.compact !== undefined
      ? { breakdown: { categories: [], totalTokens: w.ctx, isAutoCompactEnabled: w.compact !== null, ...(w.compact ? { autoCompactThreshold: w.compact } : {}) } }
      : {}
    return { value: {
      startedAt: NOW,
      context: (w.window ? { tokens: w.ctx, window: w.window, ...breakdown } : { tokens: w.ctx }) as never,
      rateLimits: w.limits as never,
      ...(w.cost === undefined ? {} : { cost: { usd: w.cost } }),
    } }
  })
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

// The batteries' Svgs: interactive ones; the rule above the card (variant 3b) is an image
async function svgs(ui: Mounted) {
  return [...walk(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg' && Boolean(propsOf(x).isInteractive)).map(propsOf)
}
// The full words stand in an icon's <title>, shown by the app only on hover (E5): what the person
// sees without pointing is the drawing without its titles
const atRest = (source: string) => source.replace(/<title>[^<]*<\/title>/g, '')

// What the person sees: every Text's words and every Svg's drawing at rest (never its alt)
async function visible(ui: Mounted): Promise<string> {
  const drawn = await ui.drawn()
  const texts = [...walk(drawn)].filter((x) => typeof x !== 'string' && x.type === 'Text').map(textOf)
  const sources = (await svgs(ui)).map((p) => atRest(String(p.source ?? '')))
  return [...texts, ...sources].join('\n')
}

type BatteryView = { name: string, share: number | null, color: string | null, label: string, value: string, a: string, b: string, icon: number }

// The batteries as drawn on the desktop, in order: each icon a <g class="i iN b-<name>"> with the
// full words in its <title> (line a, a newline, line b — the app's own tooltip, E5), its hover
// target, the fill of class f 18 px × the share left; then its words (label, value)
async function batteriesOf(ui: Mounted): Promise<BatteryView[]> {
  const out: BatteryView[] = []
  for (const p of await svgs(ui)) {
    const source = String(p.source ?? '')
    for (const m of source.matchAll(/<g class="i i(\d+) b-(\w+)"><title>([^<]*)<\/title><rect x="(-?[\d.]+)"[^>]*\/>(.*?)<\/g><text class="w"[^>]*><tspan[^>]*>([^<]*)<\/tspan><tspan[^>]*>([^<]*)<\/tspan><\/text>/g)) {
      const fill = (m[5] ?? '').match(/<rect class="f f-([a-z]+)"[^>]*width="([\d.]+)"/)
      const [a = '', b = ''] = (m[3] ?? '').split('\n')
      out.push({
        name: m[2] ?? '', icon: Number(m[4]) + 3, share: fill ? Number(fill[2]) / 18 : null, color: fill ? COLOR_OF_INK[fill[1] ?? ''] ?? null : null,
        label: m[6] ?? '', value: m[7] ?? '', a, b,
      })
    }
  }
  return out
}
type ContextView = { value: string, textX: number, barW: number, share: number, color: string | null, height: number, notch: number | null, title: string | null }
// The context's own row (WYGLAD_PANELU E5, K1): the bar from the left edge, then label and value
async function contextOf(ui: Mounted): Promise<ContextView | null> {
  const p = (await svgs(ui)).find((x) => String(x.source ?? '').includes('class="k f-track"'))
  if (!p) return null
  const s = String(p.source ?? '')
  const bar = s.match(/<rect class="k f-track" x="0" y="[\d.]+" width="([\d.]+)"/)
  const fill = s.match(/<rect class="u f-([a-z]+)" x="0" y="[\d.]+" width="([\d.]+)"/)
  const text = s.match(/<text class="w" x="([\d.]+)"[^>]*><tspan class="l f-muted">kontekst<\/tspan><tspan class="v f-text"[^>]*>([^<]*)<\/tspan>/)
  // Aneks H: the auto-compact threshold as a notch (its centre on the bar) and its words in a <title>
  const notch = s.match(/<rect class="n f-text" x="([\d.]+)" y="[\d.]+" width="2"/)
  const title = s.match(/<title>([^<]*)<\/title>/)
  return {
    value: text?.[2] ?? '', textX: Number(text?.[1]), barW: Number(bar?.[1]), share: Number(fill?.[2]) / Number(bar?.[1]), color: COLOR_OF_INK[fill?.[1] ?? ''] ?? null, height: Number(p.height),
    notch: notch ? Number(notch[1]) + 1 : null, title: title?.[1] ?? null,
  }
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
  test('cache, limit 5 h, reset za, limit tygodnia: label and value on the bar, the full words in each card; one fluid Svg of 24 px; the context in its own row (E5)', async ($, on) => {
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
    expect(list.length).toBe(2) // the batteries, then the context's row (WYGLAD_PANELU E5, K1)
    expect((await contextOf(ui))?.value).toBe('323k / 1M · 32 %')
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
      ['week', 'limit tygodnia', '41 %'],
    ])
    expect(b.map((x) => [x.a, x.b])).toEqual([
      ['Ciepły · ~60 min', 'TTL 60 min założony'],
      ['64 % · 5 h', `zużyte 64 % · zostało 36 % · reset ${hhmm(fiveReset)} · próg 90 %`],
      ['Reset limitu 5 h za 1 h 06 min', `reset ${hhmm(fiveReset)}`],
      ['41 % · tydzień', `zużyte 41 % · zostało 59 % · reset jutro ${hhmm(weekReset)} · próg 98 %`],
    ])
    // The label muted, the value bold in the text ink, 14.5 px; both palettes in the CSS (P-042)
    expect(source).toContain('<tspan class="l f-muted">limit 5 h</tspan>')
    expect(source).toContain('<tspan class="v f-text" dx="7" font-weight="600">64 %</tspan>')
    expect(source).toContain('@media (prefers-color-scheme: light)')
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

  // E5, live 2026-10-15: our own cards were cut at the edges, flickered and grew the rows; Łukasz:
  // „dajmy po prostu ten natywny z caloscia i tyle” (on "Teraz"), then „to samo zrobmy z bateriami”
  test('each icon carries its full words in the app\'s own tooltip (<title>): no card of our own, no hover rule, the row 24 px', async ($, on) => {
    world(on, {
      ctx: 323_000, window: 1_000_000, cost: 14.93,
      limits: [{ kind: 'five_hour', percentUsed: 64, resetsAt: iso(NOW + FIVE_LEFT) }, { kind: 'seven_day', percentUsed: 41, resetsAt: iso(NOW + DAY) }],
    })
    await start($)
    await turn($)
    for (const columns of [200, 160, 130]) {
      const ui = await mount($, 'desktop', columns)
      const rows = (await svgs(ui)).filter((p) => String(p.source ?? '').includes('<g class="i '))
      for (const p of rows) {
        const source = String(p.source ?? '')
        const n = [...source.matchAll(/<g class="i i\d+ /g)].length
        expect([...source.matchAll(/<g class="i i\d+ [^"]*"><title>[^<]+\n[^<]+<\/title>/g)].length).toBe(n)
        expect(source).not.toContain(':hover')
        expect(source).not.toContain('class="t ')
        expect(source).toMatch(/^<svg [^>]*width="100%" height="24">/)
      }
      const b = await batteriesOf(ui)
      expect(b.length).toBe(4) // the context stands in its own row (E5, K1)
      for (const x of b) expect(x.a.length > 0 && x.b.length > 0).toBe(true)
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

  // WYGLAD_PANELU E5 (K1): the context's row says "used / window · %" without a hover; its bar fills
  // with the share used, coloured by what is left (the batteries' one rule)
  for (const [ctx, used, color] of [[323_000, 32, SAGE], [720_000, 72, MUSTARD], [950_000, 95, CLAY]] as const) {
    test(`the context at ${ctx / 1000}k of 1M: "${ctx / 1000}k / 1M · ${used} %", the bar ${used} % filled`, async ($, on) => {
      world(on, { ctx, window: 1_000_000 })
      await start($)
      await turn($)
      const ui = await mount($)
      const c = await contextOf(ui)
      expect(c?.value).toBe(`${ctx / 1000}k / 1M · ${used} %`)
      expect(Math.round((c?.share ?? 0) * 100)).toBe(used)
      expect(c?.color).toBe(color)
      expect(byName(await batteriesOf(ui)).ctx).toBeUndefined()
      expect(await visible(ui)).toContain(`${ctx / 1000}k / 1M · ${used} %`) // at rest, no hover
      await ui.unmount()
    })
  }

  test('the window comes from the session: 150k of 200k and 150k of 1M draw two different rows', async ($, on) => {
    const { w } = world(on, { ctx: 150_000, window: 200_000 })
    await start($)
    await turn($)
    let ui = await mount($)
    expect((await contextOf(ui))?.value).toBe('150k / 200k · 75 %')
    await ui.unmount()
    w.window = 1_000_000
    await turn($)
    ui = await mount($)
    expect((await contextOf(ui))?.value).toBe('150k / 1M · 15 %')
    await ui.unmount()
  })

  // Aneks H (Łukasz 2026-10-15): „zmienialo kolor z zielonego na zolty a potem czerwony jak sie
  // zbliza kontekst do tego limitu”, „oznaczony prog auto compactu tak jak […] limit 90% w zakladce
  // koszty”; chosen: a notch and the colour, the row 24 px. The threshold is the engine's (it holds
  // CLAUDE_AUTOCOMPACT_PCT_OVERRIDE and the app's setting); the colour by the way left to it.
  for (const [ctx, color, word] of [[323_000, SAGE, 'sage'], [500_000, MUSTARD, 'mustard'], [600_000, CLAY, 'clay'], [700_000, CLAY, 'clay past it']] as const) {
    test(`auto-compact at 650k of 1M, the context at ${ctx / 1000}k: the bar ${word}, a notch at 65 %, its words in the tooltip, the row 24 px`, async ($, on) => {
      const { w } = world(on, { ctx, window: 1_000_000, compact: 650_000 })
      await start($)
      await turn($)
      const ui = await mount($, 'desktop', 160)
      const c = await contextOf(ui)
      expect(c?.color).toBe(color)
      expect(Math.abs((c?.notch ?? 0) - (c?.barW ?? 0) * 0.65)).toBeLessThan(0.02)
      expect(c?.title).toBe('auto-compact przy 650k · 65 %')
      expect(c?.height).toBe(24)
      expect(c?.value).toBe(`${ctx / 1000}k / 1M · ${Math.round(ctx / 10_000)} %`) // the words stay used / window
      expect(await visible(ui)).not.toContain('auto-compact') // no words over the notch at rest
      expect(w.asked.every((d) => d === 'summary')).toBe(true) // estimated locally: no token-count requests
      expect(w.asked.length).toBeGreaterThan(0)
      await ui.unmount()
    })
  }

  test('the instrument tells the threshold from the window: 500k of 1M is sage without one and mustard with auto-compact at 650k (planted case)', async ($, on) => {
    const { w } = world(on, { ctx: 500_000, window: 1_000_000 })
    await start($)
    await turn($)
    let ui = await mount($)
    expect((await contextOf(ui))?.color).toBe(SAGE)
    await ui.unmount()
    w.compact = 650_000
    await turn($)
    ui = await mount($)
    expect((await contextOf(ui))?.color).toBe(MUSTARD)
    await ui.unmount()
  })

  test('auto-compact off or no threshold: the bar by the window as before, no notch, no tooltip', async ($, on) => {
    const { w } = world(on, { ctx: 720_000, window: 1_000_000, compact: null })
    await start($)
    await turn($)
    let ui = await mount($)
    let c = await contextOf(ui)
    expect(c?.color).toBe(MUSTARD)
    expect(c?.notch).toBeNull()
    expect(c?.title).toBeNull()
    await ui.unmount()
    w.compact = undefined
    await turn($)
    ui = await mount($)
    c = await contextOf(ui)
    expect(c?.color).toBe(MUSTARD)
    expect(c?.notch).toBeNull()
    await ui.unmount()
  })

  // Live 2026-10-15: the notch stood at 967k though Łukasz sets CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=65
  // („mam w systemie ustawione na 65%, wiec przy 650k powinno mi to sie compactowac”). In 2.1.295
  // the breakdown's threshold is the effective window less 13k and leaves the override out, while
  // compaction takes min(floor(window × pct), window − 13k); the bar takes what compaction takes.
  test('the env override moves the notch where compaction runs: 967k from the engine and 65 % make 637k', async ($, on) => {
    world(on, { ctx: 500_000, window: 1_000_000, compact: 967_000, env: { CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: '65' } })
    await start($)
    await turn($)
    const ui = await mount($, 'desktop', 160)
    const c = await contextOf(ui)
    expect(c?.title).toBe('auto-compact przy 637k · 64 %')
    expect(Math.abs((c?.notch ?? 0) - (c?.barW ?? 0) * 0.637)).toBeLessThan(0.02)
    expect(c?.color).toBe(MUSTARD) // 137k of 637k left: 22 %
    await ui.unmount()
  })

  test('the override as compaction reads it: a number in (0, 100], never above the engine\'s own threshold', () => {
    expect(compactThreshold(967_000, '65')).toBe(637_000)
    expect(compactThreshold(967_000, undefined)).toBe(967_000)
    expect(compactThreshold(967_000, '100')).toBe(967_000)
    expect(compactThreshold(967_000, 'abc')).toBe(967_000)
    expect(compactThreshold(967_000, '0')).toBe(967_000)
    expect(compactThreshold(967_000, '150')).toBe(967_000)
    expect(compactThreshold(0, '65')).toBe(0) // auto-compact off: no threshold at all
    expect(compactThreshold(187_000, '50')).toBe(100_000) // a 200k model: 200k − 13k out, 50 % of the effective 200k
  })

  test('one column: the notch stands on the bar under the words, at 65 % of it', () => {
    const row = contextRow(323_000, 1_000_000, 1, 300, 650_000)
    const bar = Number(row?.svg.match(/<rect class="k f-track" x="0" y="[\d.]+" width="([\d.]+)"/)?.[1])
    const notch = Number(row?.svg.match(/<rect class="n f-text" x="([\d.]+)"/)?.[1]) + 1
    expect(row?.height).toBe(46)
    expect(Math.abs(notch - bar * 0.65)).toBeLessThan(0.02)
  })

  test('no window reported: no row, the context stays a battery in the grid', async ($, on) => {
    world(on, { ctx: 150_000 })
    await start($)
    await turn($)
    const ui = await mount($)
    expect(await contextOf(ui)).toBeNull()
    expect(byName(await batteriesOf(ui)).ctx?.value).toBe('150k')
    await ui.unmount()
  })

  // Łukasz 2026-10-15: „siatka na całą szerokość”; limit tygodnia under limit 5 h was „zupełnie
  // rozjechany”; the context „od pierwszej baterii do końcowej baterii”, its words not past them
  for (const columns of [200, 130, 100, 70]) {
    test(`the grid at ${columns} columns: every row's batteries in the columns of the first; the context's words in the last column`, async ($, on) => {
      world(on, {
        ctx: 323_000, window: 1_000_000,
        limits: [{ kind: 'five_hour', percentUsed: 64, resetsAt: iso(NOW + FIVE_LEFT) }, { kind: 'seven_day', percentUsed: 41, resetsAt: iso(NOW + DAY) }],
      })
      await start($)
      await turn($)
      const ui = await mount($, 'desktop', columns)
      const rows = (await svgs(ui)).filter((p) => String(p.source ?? '').includes('<g class="i '))
      const xs = rows.map((p) => [...String(p.source ?? '').matchAll(/<g class="i i\d+ b-\w+"><title>[^<]*<\/title><rect x="(-?[\d.]+)"/g)].map((m) => Number(m[1])))
      const first = xs[0] ?? []
      for (const row of xs.slice(1)) row.forEach((x, i) => expect(x).toBe(first[i] ?? NaN))
      const c = await contextOf(ui)
      const cols = first.length
      if (cols > 1) {
        expect(c?.height).toBe(24)
        const lastX = (first[cols - 1] ?? 0) + 3 // the hover target starts 3 px left of the icon
        expect(c?.textX).toBeLessThanOrEqual(lastX + 0.01)
        expect((c?.textX ?? 0) + 'kontekst 323k / 1M · 32 %'.length * 7.9).toBeLessThanOrEqual(lastX + (first[1] ?? 0) - (first[0] ?? 0))
        expect(c?.barW).toBeGreaterThan(0)
        expect((c?.barW ?? 0) + 14).toBeLessThanOrEqual((c?.textX ?? 0) + 0.01)
      } else {
        expect(c?.height).toBe(46)
      }
      await ui.unmount()
    })
  }

  // Live 2026-10-15: wrapped cards made the rows grow at rest — „popsułeś wygląd […] nie wprowadzaj
  // regresji”. The words never change the row: at any width it is 24 px, the tooltip holds them whole.
  test('the words never grow the row: at 1 200 px and at 280 px the row is 24 px; the tooltip holds line a and line b whole', () => {
    const week = limitMeasure('week', 'limit tygodnia', 'tydzień', { kind: 'seven_day', percentUsed: 41, resetsAt: new Date(NOW + DAY).toISOString() }, NOW, 98)
    const cache = cacheMeasure({ kind: 'warm', left: 50 * MIN, ttlMin: 60, isAssumed: true, rewrite: '$1.00', keptUntil: 0 })
    for (const px of [1200, 280]) {
      for (const row of batteryRows([cache, week], px)) {
        expect(row.height).toBe(24)
        expect(row.svg).toMatch(/^<svg [^>]*height="24">/)
        expect(row.svg).not.toContain('dy=')
      }
    }
    const svg = batteryRows([week], 280)[0]?.svg ?? ''
    expect(svg).toContain(`<title>${week.a}\n${week.b}</title>`)
    expect(svg).not.toContain('…')
  })

  test('the grid instrument fails the flow of 3.2.0: limit tygodnia wrapped under cache at another x (planted case)', () => {
    const first = [0, 210, 420]
    const flowed = [0, 233]
    expect(flowed.every((x, i) => x === first[i])).toBe(false)
  })

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

  // ZGLOSZENIA E3 (#2): line b left the terminal — the grid and its widths in terminal-grid.test.ts
  test('the terminal: per measure a glyph of what is left, label and value, no line b', async ($, on) => {
    world(on, { ctx: 500_000, window: 1_000_000, cost: 1.5, limits: [{ kind: 'five_hour', percentUsed: 11 }, { kind: 'seven_day', percentUsed: 80 }] })
    await start($)
    await turn($)
    const ui = await mount($, 'terminal')
    expect(await svgs(ui)).toEqual([])
    const line = async (key: string) => (await ui.find({ key }))?.text ?? ''
    expect(await line('m-cache')).toMatch(/^●\s*cache\s*~60 min$/)
    expect(await line('m-five')).toMatch(/^●\s*limit 5 h\s*11 %$/)
    expect(await line('m-reset')).toMatch(/^○\s*reset za\s*brak danych$/)
    expect(await line('m-week')).toMatch(/^◔\s*limit tygodnia\s*80 %$/)
    expect(await line('m-ctx')).toMatch(/^◑\s*kontekst\s*500k$/)
    expect((await ui.find({ key: 'figure' }))?.text).toContain('$1.50')
    await ui.unmount()
  })
})

describe('the cache bar second row: one at a time, only while its reason lasts (brief v2 §1)', () => {
  test('cooling: the chip with the rewrite, Podtrzymaj (p) and Nowa sesja (h), both with a badge; kept: the pings and Zatrzymaj; cold: none', async ($, on) => {
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
      expect(buttons.map((b) => b.props.label)).toEqual(['Podtrzymaj', 'Nowa sesja'])
      expect(buttons.map((b) => b.props.hotkey ?? null)).toEqual(['p', 'h'])
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
    expect(buttons.map((b) => [b.props.label, b.props.variant ?? (b.props.plain ? 'plain' : null), b.props.hotkey ?? null])).toEqual([
      ['Wyczyść i kontynuuj', 'primary', 'c'], ['Zostań', 'primary', 'z'],
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

  test('every chip is drawn in its theme key, with no surface (WYGLAD_PANELU E1)', async ($, on) => {
    const { clock } = world(on, { window: 1_000_000 })
    await start($)
    await turn($)
    await clock.advance(51 * MIN)
    const ui = await mount($)
    const chip = await ui.find({ key: 'chip' })
    expect((chip?.props as { backgroundColor?: string }).backgroundColor).toBeUndefined()
    expect(JSON.stringify(chip)).toContain(`"color":"${CHIP_KEY.warn}"`)
    await ui.unmount()
  })
})

// LIMIT_CHECKPOINT E1: from the threshold up a limit battery is clay, whatever is left of it
describe('the limit battery from the threshold up', () => {
  const five = (percentUsed: number) => limitMeasure('five', 'limit 5 h', '5 h', { kind: 'five_hour', percentUsed }, NOW, 80)

  test('below the threshold the usual colour by what is left; at and above it clay', async () => {
    expect(five(50).color).toBe(SAGE)
    expect(five(75).color).toBe(MUSTARD) // 25 % left: the usual mustard, still below 80
    expect(five(79.4).color).toBe(MUSTARD) // rounds to 79
    expect(five(80).color).toBe(CLAY) // 20 % left would be mustard without the threshold
    expect(five(79.6).color).toBe(CLAY) // rounds to 80, the number the bar shows
    expect(five(85).color).toBe(CLAY)
  })

  test('a low threshold turns a nearly full battery clay; line b names the threshold', async () => {
    const m = limitMeasure('week', 'limit tygodnia', 'tydzień', { kind: 'seven_day', percentUsed: 3 }, NOW, 1)
    expect(m.color).toBe(CLAY)
    expect(m.fill).toBe(0.97)
    expect(m.b).toMatch(/· próg 1 %$/)
    expect(limitMeasure('week', 'limit tygodnia', 'tydzień', { kind: 'seven_day', percentUsed: 3 }, NOW).b).toMatch(/· próg 90 %$/)
  })

  test('no limit data: a bare battery, never the warning colour, whatever the threshold', async () => {
    // The same threshold with data warns at once: the threshold is live, the bare battery is not
    expect(limitMeasure('five', 'limit 5 h', '5 h', { kind: 'five_hour', percentUsed: 2 }, NOW, 1).color).toBe(CLAY)
    for (const limit of [undefined, { kind: 'five_hour', percentUsed: Number.NaN }]) {
      const m = limitMeasure('five', 'limit 5 h', '5 h', limit, NOW, 1)
      expect(m.color).not.toBe(CLAY)
      expect(m.fill).toBe(null)
      expect(m.value).toBe('brak danych')
    }
  })
})

// LIMIT_CHECKPOINT Aneks D: a limit battery that is not calm (mustard or clay) says under its label
// from which threshold and whose: "próg 90 % · ta sesja". Calm or without data it says nothing.
describe('Aneks D: the threshold and its source under a limit battery that is not calm', () => {
  const at = (percentUsed: number, threshold = 90, source?: ThresholdSource) =>
    limitMeasure('five', 'limit 5 h', '5 h', { kind: 'five_hour', percentUsed }, NOW, threshold, source)

  test('calm: no note; mustard and clay: the threshold and its source; no data: none', () => {
    expect(at(50).color).toBe(SAGE)
    expect(at(50).note).toBeUndefined()
    expect(at(78).color).toBe(MUSTARD)
    expect(at(78).note).toBe('próg 90 % · domyślny')
    expect(at(92, 90, 'sesja').color).toBe(CLAY)
    expect(at(92, 90, 'sesja').note).toBe('próg 90 % · ta sesja')
    expect(at(14, 1, 'sesja').note).toBe('próg 1 % · ta sesja')
    expect(at(92, 85, 'projekt').note).toBe('próg 85 % · ten projekt')
    expect(at(92, 95, 'globalnie').note).toBe('próg 95 % · wszystkie projekty')
    const week = limitMeasure('week', 'limit tygodnia', 'tydzień', { kind: 'seven_day', percentUsed: 93 }, NOW, 98)
    expect(week.color).toBe(CLAY) // 7 % left: clay before its threshold, and the note says which one
    expect(week.note).toBe('próg 98 % · domyślny')
    expect(limitMeasure('five', 'limit 5 h', '5 h', undefined, NOW, 1, 'sesja').note).toBeUndefined()
  })

  test('the row grows to 36 px only with a note; the note stands under the label, 11 px, muted', () => {
    const calm = batteryRows([at(50)], 1200)[0]
    expect(calm?.height).toBe(24)
    expect(calm?.svg).toMatch(/^<svg [^>]*height="24">/)
    expect(calm?.svg).not.toContain('class="n"')
    const row = batteryRows([at(92, 90, 'sesja')], 1200)[0]
    expect(row?.height).toBe(36)
    expect(row?.svg).toMatch(/^<svg [^>]*height="36">/)
    const label = row?.svg.match(/<text class="w" x="([\d.]+)"/)?.[1]
    expect(row?.svg).toContain(`<text class="n f-muted" x="${label}" y="32" font-size="11">próg 90 % · ta sesja</text>`)
  })

  test('a note wider than its words widens the grid\'s column: at 400 px the next measure goes to the next row', () => {
    expect(batteryRows([at(55), at(50)], 400).length).toBe(1)
    expect(batteryRows([at(92, 95, 'globalnie'), at(50)], 400).length).toBe(2)
  })

  test('on the bar: clay at 95 % brings the note and a 36 px row; calm at 50 % neither', async ($, on) => {
    const { w } = world(on, { limits: [{ kind: 'five_hour', percentUsed: 95, resetsAt: iso(NOW + FIVE_LEFT) }] })
    await start($)
    await turn($)
    let ui = await mount($)
    expect((await svgs(ui))[0]?.height).toBe(36)
    expect(await visible(ui)).toContain('próg 90 % · domyślny')
    await ui.unmount()
    w.limits = [{ kind: 'five_hour', percentUsed: 50, resetsAt: iso(NOW + FIVE_LEFT) }]
    await turn($)
    ui = await mount($)
    expect((await svgs(ui))[0]?.height).toBe(24)
    expect(await visible(ui)).not.toContain('próg 90 % ·')
    await ui.unmount()
  })
})
