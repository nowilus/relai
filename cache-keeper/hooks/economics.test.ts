import { describe, expect, test } from 'claude-code/testing'
import { handoffEconomics, type HandoffInput } from './economics'

// Every expected figure below is worked out by hand in the comments, never by the module's helpers.
// Rates (USD per million tokens), Opus 5.5 on the 1-hour TTL: read 0.2, write 2 × input 4 = 8, output 20.
// S = 30k tokens, mean output 2,000 tokens per turn → output part of every turn = 2,000 × 20 / 1e6 = $0.04.
// Start-layer write = 30,000 × 8 / 1e6 = $0.24. A turn after the handoff = 30,000 × 0.2 / 1e6 + 0.04 = $0.046.

const near = (a: number, b: number) => expect(Math.abs(a - b) < 1e-9).toBe(true)

const base: HandoffInput = {
  ctx: 100_000,
  start: 30_000,
  startSource: 'raport hooka startu',
  cache: 'warm',
  ttlMin: 60,
  ttlMeasured: true,
  rates: { read: 0.2, write: 8, output: 20 },
  meanOutput: 2_000,
  limitTurns: null,
}

describe('handoff economics: the three cases of the card', () => {
  test('warm cache, small context (100k): does not pay off, no event', async () => {
    // here = 100,000 × 0.2 / 1e6 + 0.04 = 0.02 + 0.04 = $0.06; handoff turn = $0.06
    // saving per turn = (100,000 − 30,000) × 0.2 / 1e6 = $0.014
    // N = ceil((0.06 + 0.24) / 0.014) = ceil(21.43) = 22 > 5, cache warm → stay
    const v = handoffEconomics(base)
    expect(v.kind).toBe('stay')
    if (v.kind !== 'stay') return
    expect(v.turns).toBe(22)
    near(v.costs.here, 0.06)
    near(v.costs.startWrite, 0.24)
    near(v.costs.after, 0.046)
    expect(v.bar).toBeNull()
    expect(v.report).toContain('nie opłaca się')
    expect(v.report).toContain('po 22 turach')
  })

  test('warm cache at 800k: pays off within 5 turns, event with the bar text', async () => {
    // here = 800,000 × 0.2 / 1e6 + 0.04 = 0.16 + 0.04 = $0.20
    // saving per turn = (800,000 − 30,000) × 0.2 / 1e6 = $0.154
    // N = ceil((0.20 + 0.24) / 0.154) = ceil(2.857) = 3 ≤ 5 → hand off
    const v = handoffEconomics({ ...base, ctx: 800_000 })
    expect(v.kind).toBe('handoff')
    if (v.kind !== 'handoff') return
    expect(v.turns).toBe(3)
    expect(v.reason).toBe('payback')
    near(v.costs.here, 0.2)
    expect(v.bar).toBe('nowa sesja zwróci się po 3 turach · ≈ $0.20 → $0.05/turę')
    expect(v.report).toContain('Werdykt: przekaż')
  })

  test('cold cache with ctx > 2·S: event even though the payback is long', async () => {
    // here = 200,000 × 8 / 1e6 + 0.04 = 1.60 + 0.04 = $1.64 (the whole context is written again)
    // saving per turn = (200,000 − 30,000) × 0.2 / 1e6 = $0.034
    // N = ceil((1.64 + 0.24) / 0.034) = ceil(55.29) = 56 > 5, but cold and 200k > 2 × 30k = 60k → hand off
    const v = handoffEconomics({ ...base, ctx: 200_000, cache: 'cold' })
    expect(v.kind).toBe('handoff')
    if (v.kind !== 'handoff') return
    expect(v.turns).toBe(56)
    expect(v.reason).toBe('cold')
    near(v.costs.here, 1.64)
    expect(v.bar).toBe('cache zimny · nowa sesja zwróci się po 56 turach · ≈ $1.64 → $0.05/turę')
    expect(v.report).toContain('ponowny zapis 200k po $8/M')
  })
})

describe('handoff economics: edges', () => {
  test('each missing number gives the missing kind naming it, never a recommendation', async () => {
    const cases: [Partial<HandoffInput>, string, string][] = [
      [{ ctx: null }, 'ctx', 'rozmiaru kontekstu'],
      [{ start: null }, 'start', 'rozmiaru warstwy startu'],
      [{ cache: 'unknown' }, 'cache', 'stanu cache'],
      [{ rates: { read: null, write: 8, output: 20 } }, 'read', 'stawki odczytu cache'],
      [{ rates: { read: 0.2, write: null, output: 20 } }, 'write', 'stawki zapisu cache'],
      [{ rates: { read: 0.2, write: 8, output: null } }, 'output', 'stawki wyjścia'],
      [{ meanOutput: null }, 'meanOutput', 'średniego wyjścia tury'],
      [{ ctx: Number.NaN }, 'ctx', 'rozmiaru kontekstu'],
    ]
    for (const [patch, field, words] of cases) {
      const v = handoffEconomics({ ...base, ...patch })
      expect(v.kind).toBe('missing')
      if (v.kind !== 'missing') continue
      expect(v.missing).toEqual([field])
      expect(v.bar).toBeNull()
      expect(v.report).toContain(words)
      expect(v.report).not.toContain('Werdykt')
    }
    const both = handoffEconomics({ ...base, ctx: null, meanOutput: null })
    expect(both.kind === 'missing' && both.missing).toEqual(['ctx', 'meanOutput'])
  })

  test('ctx not larger than S never pays off, even on a cold cache', async () => {
    const v = handoffEconomics({ ...base, ctx: 30_000, cache: 'cold' })
    expect(v.kind).toBe('never')
    expect(v.bar).toBeNull()
    expect(v.report).toContain('nie jest większy od warstwy startu')
  })

  test('the threshold parameter moves the verdict', async () => {
    // 800k warm: N = 3 (case two) → stay with threshold 2
    expect(handoffEconomics({ ...base, ctx: 800_000, threshold: 2 }).kind).toBe('stay')
    // 100k warm: N = 22 (case one) → hand off with threshold 25, stay with 21
    expect(handoffEconomics({ ...base, threshold: 25 }).kind).toBe('handoff')
    expect(handoffEconomics({ ...base, threshold: 21 }).kind).toBe('stay')
  })

  test('the 5-hour limit: mean of the last 5 turns now, per-token pace applied to S after', async () => {
    // The first turn (5 %) falls outside the window of 5.
    // now = (0.7 + 0.9 + 0.8 + 0.8 + 0.8) / 5 = 4.0 / 5 = 0.80 %
    // after = 4.0 % / (5 × 800,000 tokens) × 30,000 = 0.03 %
    const limitTurns = [
      { percent: 5, tokens: 800_000 },
      { percent: 0.7, tokens: 800_000 },
      { percent: 0.9, tokens: 800_000 },
      { percent: 0.8, tokens: 800_000 },
      { percent: 0.8, tokens: 800_000 },
      { percent: 0.8, tokens: 800_000 },
    ]
    const v = handoffEconomics({ ...base, ctx: 800_000, limitTurns })
    expect(v.kind).toBe('handoff')
    if (v.kind !== 'handoff' || !v.limit) throw new Error('expected a limit pace')
    near(v.limit.now, 0.8)
    near(v.limit.after, 0.03)
    expect(v.limit.turns).toBe(5)
    expect(v.bar).toBe('nowa sesja zwróci się po 3 turach · ≈ $0.20 → $0.05/turę · 0,80 % → 0,03 % limitu 5 h')
    expect(v.report).toContain('0,80 %/turę teraz → 0,03 % po (średnia z 5 tur)')
  })

  test('the /cache reckoning states its assumptions and the missing limit in words', async () => {
    const v = handoffEconomics({ ...base, ttlMeasured: false, ttlMin: 5 })
    expect(v.report).toContain('TTL 5 min założony')
    expect(v.report).toContain('warstwa startu 30.0k (raport hooka startu)')
    expect(v.report).toContain('odczyt 100k z cache po $0.2/M')
    // (0.06 + 0.24) / 0.014 — the saving keeps its third decimal so the division can be checked by eye
    expect(v.report).toContain('Zwrot: ($0.060 + $0.24) / $0.014 oszczędności na turze → N = 22 (próg 5).')
    expect(v.report).toContain('Limit 5 h: brak pomiaru')
  })
})
