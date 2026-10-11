import { describe, expect, test } from 'claude-code/testing'
import { DEFAULT_SETTINGS, MIN, applySetting, cacheState, dueWarning, judgeStep, parseTokens, pingDue, pingMissed } from './core'
import { relaiDone, relaiFreshPrompt, plainBody, RELAI_DONE } from './handoff'
import { ratesFor, rewriteCost, requestCost } from './pricing'

describe('cache state', () => {
  test('unknown before any request, warm, cooling at the first threshold, cold after the TTL', async () => {
    const t0 = 1_000_000
    expect(cacheState(0, 60, t0, false, [10, 5]).kind).toBe('unknown')
    expect(cacheState(t0, 60, t0 + 30 * MIN, false, [10, 5]).kind).toBe('warm')
    expect(cacheState(t0, 60, t0 + 51 * MIN, false, [10, 5]).kind).toBe('cooling')
    expect(cacheState(t0, 60, t0 + 61 * MIN, false, [10, 5]).kind).toBe('cold')
    expect(cacheState(t0, 60, t0 + 61 * MIN, true, [10, 5]).kind).toBe('kept')
  })

  test('warnings fire once per threshold, the 5-minute one after the 10-minute one', async () => {
    expect(dueWarning(9 * MIN, [10, 5], [])).toBe(10)
    expect(dueWarning(9 * MIN, [10, 5], [10])).toBe(null)
    expect(dueWarning(4 * MIN, [10, 5], [10])).toBe(5)
    expect(dueWarning(-1, [10, 5], [])).toBe(null)
  })
})

describe('keep-warm', () => {
  test('pings 8 minutes before a 1-hour TTL and 90 seconds before a 5-minute one', async () => {
    expect(pingDue(52 * MIN + 1, 1, 60)).toBe(true)
    expect(pingDue(50 * MIN, 1, 60)).toBe(false)
    expect(pingDue(3.6 * MIN, 1, 5)).toBe(true)
    expect(pingDue(10 * MIN, 0, 60)).toBe(false)
  })

  test('a ping that writes instead of reading counts as a miss', async () => {
    expect(pingMissed({ cache_read_input_tokens: 200_000, cache_creation_input_tokens: 500 })).toBe(false)
    expect(pingMissed({ cache_read_input_tokens: 0, cache_creation_input_tokens: 200_000 })).toBe(true)
  })
})

describe('request verdicts', () => {
  test('a big rewrite after 10 idle minutes measures the 5-minute TTL', async () => {
    const v = judgeStep({ cache_creation_input_tokens: 180_000, cache_read_input_tokens: 0, input_tokens: 10 }, 10 * MIN, true, false, 60)
    expect(v.kind).toBe('rewrite')
    expect(v.ttlMeasured).toBe(5)
  })

  test('a hit after 20 idle minutes proves the 1-hour TTL', async () => {
    const v = judgeStep({ cache_read_input_tokens: 180_000, cache_creation_input_tokens: 2000, input_tokens: 10 }, 20 * MIN, true, false, 60)
    expect(v).toEqual({ kind: 'hit', ttlMeasured: 60 })
  })

  test('the first request after a compaction is expected to write', async () => {
    expect(judgeStep({ cache_creation_input_tokens: 90_000 }, 0, true, true, 60).kind).toBe('compacted')
  })
})

describe('pricing', () => {
  test('Opus 5.5 rewrite on the 1-hour TTL costs 2x input; unknown model has no price', async () => {
    expect(ratesFor('claude-opus-5-5[1m]', 60, 0)?.input).toBe(4)
    expect(rewriteCost(1_000_000, 'claude-opus-5-5', 60)).toBe(8)
    expect(rewriteCost(1_000_000, 'claude-opus-5-5', 5)).toBe(5)
    expect(rewriteCost(1000, 'gpt-6-sol', 60)).toBe(null)
  })

  // Sonnet and Haiku rates come from the project's price file now: pricing.test.ts
  test('Opus 5.5 reads at 0.05x input from the built-in list', async () => {
    expect(requestCost({ cache_read_input_tokens: 1_000_000 }, 'claude-opus-5-5', 60)).toBe(0.2)
  })
})

describe('settings', () => {
  test('Polish keys change a copy and leave the original alone', async () => {
    const r = applySetting(DEFAULT_SETTINGS, 'prog', '200k')
    expect(r.settings.bigTokens).toBe(200_000)
    expect(DEFAULT_SETTINGS.bigTokens).toBe(150_000)
    expect(applySetting(DEFAULT_SETTINGS, 'progi', '15, 5').settings.warnMin).toEqual([15, 5])
    expect(applySetting(DEFAULT_SETTINGS, 'straznik', 'off').settings.guard).toBe(false)
    expect(applySetting(DEFAULT_SETTINGS, 'ttl', '7').error).toBeDefined()
    expect(parseTokens('1,5m')).toBe(1_500_000)
  })

  test('limit-warn takes a whole number 1–99, explains anything else in Polish, and leaves the keep-warm stop alone', async () => {
    expect(DEFAULT_SETTINGS.limitWarn).toBe(90)
    for (const bad of ['101', 'abc', '0', '85.5', '-5', '']) {
      const r = applySetting(DEFAULT_SETTINGS, 'limit-warn', bad)
      expect(r.error).toBe('limit-warn: liczba całkowita od 1 do 99, np. 85, 90 albo 95')
      expect(r.settings).toBe(DEFAULT_SETTINGS)
    }
    const r = applySetting(DEFAULT_SETTINGS, 'limit-warn', '85')
    expect(r.settings.limitWarn).toBe(85)
    expect(r.settings.maxLimitPercent).toBe(90)
    expect(applySetting(DEFAULT_SETTINGS, 'próg-limitu', '95').settings.limitWarn).toBe(95)
    expect(applySetting(DEFAULT_SETTINGS, 'limit', '80').settings.limitWarn).toBe(90)
  })
})

describe('handoff', () => {
  test('RelAI handoff is done only on the marker; the plain one needs its heading and length', async () => {
    expect(relaiDone(`Zaktualizowano STATE.\n${RELAI_DONE}`)).toBe(true)
    expect(relaiDone('Zaktualizowano STATE.')).toBe(false)
    expect(plainBody('za krótko')).toBe('')
    const body = '# Przekazanie sesji\n' + 'x'.repeat(250)
    expect(plainBody('Wstęp.\n' + body)).toBe(body)
    expect(relaiFreshPrompt('dodaj testy')).toBe('kontynuujemy pracę\n\nPotem: dodaj testy')
  })
})
