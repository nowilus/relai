import { describe, expect, test } from 'claude-code/testing'
import { basename, clip, clock, duration, fileStamp, join, limitsText, minutes, pct, tokens, usd } from './fmt'

// One fmt.ts for the three bars above the prompt (AUDYT_MODOW Z6): the same file, byte for byte,
// in relai-panel, relai-progress and relai-cache-keeper (core/panel/tests/mods-parity.test.js
// checks the copies). The expected strings are written out by hand, never produced by the helpers.

describe('usd: cents always, as brief v2 writes "sesja ≈ $11.73"', () => {
  test('an amount of ten dollars or more keeps its cents (it read "$12" in the cache bar)', () => {
    expect(usd(11.73)).toBe('$11.73')
    expect(usd(190)).toBe('$190.00')
    expect(usd(1.1)).toBe('$1.10')
  })
  test('zero, under a cent and no price', () => {
    expect(usd(0)).toBe('$0')
    expect(usd(0.004)).toBe('<$0.01')
    expect(usd(null)).toBe('cena nieznana')
  })
})

describe('tokens: one unit per size, no "1000k" at a boundary', () => {
  test('999 999 tokens read 1.0M, not 1000k (Z1 found it)', () => {
    expect(tokens(999_999)).toBe('1.0M')
    expect(tokens(999_499)).toBe('999k')
    expect(tokens(999_500)).toBe('1.0M')
  })
  test('99 950 tokens read 100k, not 100.0k; 999.6 reads 1.0k, not 1000', () => {
    expect(tokens(99_949)).toBe('99.9k')
    expect(tokens(99_950)).toBe('100k')
    expect(tokens(999.6)).toBe('1.0k')
    expect(tokens(999)).toBe('999')
  })
  test('the rest of the scale: one decimal below 100k and below 10M, whole above', () => {
    expect(tokens(0)).toBe('0')
    expect(tokens(2_000)).toBe('2.0k')
    expect(tokens(259_000)).toBe('259k')
    expect(tokens(1_500_000)).toBe('1.5M')
    expect(tokens(9_949_999)).toBe('9.9M')
    expect(tokens(9_950_000)).toBe('10M')
    expect(tokens(12_000_000)).toBe('12M')
  })
})

describe('the rest of the union, as each plugin had it', () => {
  test('pct: whole percents, never 100 short of the whole, never 0 above nothing (panel, Z2)', () => {
    expect(pct(96, 100)).toBe('96 %')
    expect(pct(999, 1000)).toBe('99 %')
    expect(pct(1, 1000)).toBe('<1 %')
    expect(pct(0, 0)).toBe('0 %')
  })
  test('limitsText: the limits of the cache bar in whole percents', () => {
    expect(limitsText([{ kind: 'five_hour', percentUsed: 41.6 }, { kind: 'seven_day', percentUsed: 7 }])).toBe('5 h 42% · tydzień 7%')
  })
  test('minutes, duration, clock and fileStamp', () => {
    expect(minutes(125 * 60_000)).toBe('2 h 05 min')
    expect(duration(185_000)).toBe('3 min 05 s')
    const at = new Date(2026, 9, 10, 9, 5).getTime()
    expect(clock(at)).toBe('09:05')
    expect(fileStamp(at)).toBe('2026-10-10-0905')
  })
  test('clip, join and basename', () => {
    expect(clip('ab  cd', 4)).toBe('ab …')
    expect(join('C:\\proj\\', 'docs/STATE.md')).toBe('C:/proj/docs/STATE.md')
    expect(basename('C:\\proj\\docs\\STATE.md')).toBe('STATE.md')
  })
})
