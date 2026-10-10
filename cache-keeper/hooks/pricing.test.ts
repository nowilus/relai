import { describe, expect, test } from 'claude-code/testing'
import * as pricing from './pricing'
import { priceAt, parsePriceFile, priceLists } from './relai/pricing.mjs'

// The keeper prices with the core's list (AUDYT_MODOW Z5): the plugin's copy of
// core/panel/pricing.mjs laid over by the project's .claude/relai/panel/cennik.json, so the bar's
// "zapis ≈ $" and the panel's Costs tab never disagree. Namespace import: a missing export fails
// its own test, not the whole file.

const AT = 1_791_600_000_000
const FILE = JSON.stringify({
  v: 1,
  versions: [
    { date: '2026-10-01', source: 'odczyt pierwszy', from: AT - 2_000_000, models: { 'claude-sonnet-5-5': { input: 3, output: 15 } } },
    {
      date: '2026-10-09', source: 'strona cennika Anthropic (platform.claude.com), odczyt 2026-10-09', from: AT - 1_000_000,
      models: {
        'claude-sonnet-5-5': { input: 2, output: 10, read: 0.1, write5m: 2.5, write1h: 4 },
        'claude-haiku-5-5': { input: 0.1, output: 0.5, read: 0.01, write5m: 0.125, write1h: 0.2, over: { above: 100_000, input: 0.5, output: 2.5, read: 0.05, write5m: 0.625, write1h: 1 } },
      },
    },
  ],
})

type P = typeof pricing & Record<string, (...a: unknown[]) => unknown>
const api = pricing as P

describe('pricing from the core list and the project file', () => {
  test('the same main-loop request costs what priceAt in relai/pricing.mjs says', async () => {
    const prices = api.pricesFrom(FILE)
    const u = { input_tokens: 1_200, cache_read_input_tokens: 150_000, cache_creation_input_tokens: 4_000, output_tokens: 900 }
    const lists = priceLists(parsePriceFile(FILE).versions)
    for (const model of ['claude-sonnet-5-5', 'claude-opus-5-5', 'claude-haiku-5-5']) {
      const record = { v: 1 as const, tool: 'claude', session: 's1', turn: 't1', index: 0, agent: null, kind: 'step' as const, model, at: AT, input: 1_200, cacheRead: 150_000, cacheWrite: 4_000, output: 900, missing: null }
      const core = priceAt(record, lists).usd
      expect(core).not.toBeNull()
      expect(Math.abs(Number(api.requestCost(u, model, 60, prices)) - Number(core))).toBeLessThan(1e-12)
    }
  })

  test('a model known only from cennik.json takes the file rate; the newest version wins', async () => {
    const prices = api.pricesFrom(FILE)
    expect(api.ratesFor('claude-sonnet-5-5', 60, 1000, prices)).toEqual({ input: 2, read: 0.1, write: 4, output: 10 })
    expect(api.rewriteCost(1_000_000, 'claude-sonnet-5-5[1m]', 5, prices)).toBe(2.5)
    // Built in only: the model is unknown, the price is null
    expect(api.ratesFor('claude-sonnet-5-5', 60, 1000)).toBeNull()
    expect(api.rewriteCost(1_000_000, 'claude-sonnet-5-5', 60)).toBeNull()
  })

  test('the built-in list prices Opus 5.5 with its multipliers: read 0.05x, write 2x on 1 h and 1.25x on 5 min', async () => {
    expect(api.ratesFor('claude-opus-5-5', 60, 1000)).toEqual({ input: 4, read: 0.2, write: 8, output: 20 })
    expect(api.ratesFor('claude-opus-5-5-20261001', 5, 1000)).toEqual({ input: 4, read: 0.2, write: 5, output: 20 })
    expect(api.rewriteCost(1_000_000, 'claude-opus-5-5', 60)).toBe(8)
  })

  test('a prompt over the tier boundary pays the "over" rates (Haiku 5.5 above 100k)', async () => {
    const prices = api.pricesFrom(FILE)
    expect(api.ratesFor('claude-haiku-5-5', 60, 50_000, prices)).toEqual({ input: 0.1, read: 0.01, write: 0.2, output: 0.5 })
    expect(api.ratesFor('claude-haiku-5-5', 60, 150_000, prices)).toEqual({ input: 0.5, read: 0.05, write: 1, output: 2.5 })
  })

  test('a model in neither list: null everywhere, never zero, never a guess from a similar name', async () => {
    const prices = api.pricesFrom(FILE)
    expect(api.ratesFor('claude-haiku-4-5', 60, 1000, prices)).toBeNull()
    expect(api.ratesFor('claude-opus-5-5-preview', 60, 1000, prices)).toBeNull()
    expect(api.requestCost({ input_tokens: 10 }, 'gpt-6-sol', 60, prices)).toBeNull()
    expect(api.rewriteCost(1000, 'claude-haiku-4-5', 60, prices)).toBeNull()
  })

  test('the source words name the list date and source; a broken file says so and prices built in', async () => {
    expect(api.priceSource(api.pricesFrom(FILE))).toContain('2026-10-09')
    expect(api.priceSource(api.pricesFrom(FILE))).toContain('strona cennika Anthropic')
    const broken = api.pricesFrom('{ nie json')
    expect(api.priceSource(broken)).toContain('2026-10-08')
    expect(api.priceSource(broken)).toContain('nie jest JSON-em')
  })
})
