import { describe, expect, test } from 'claude-code/testing'
import { BAR_BREAK, BAR_LINE_MAX, handoffEconomics, type HandoffInput } from './economics'

// Every expected figure below is worked out by hand in the comments, never by the module's helpers.
// Rates (USD per million tokens), Opus 5.5 on the 1-hour TTL: read 0.2, write 2 × input 4 = 8, output 20.
// S = 30k tokens, mean output 2,000 tokens per message → output part of every message = 2,000 × 20 / 1e6 = $0.04.
// Start-layer write = 30,000 × 8 / 1e6 = $0.24. A message after the handoff = 30,000 × 0.2 / 1e6 + 0.04 = $0.046.
// The handoff costs over staying: one message here (warm) + the start-layer write; a cold cache's
// rewrite is paid on either path and moves nothing (KOMUNIKAT_ZWROTU).

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

// Old wording the bar must never carry again (KOMUNIKAT_ZWROTU): checked on every bar below
const banned = (bar: string | null) => {
  for (const word of ['zwróci', 'zwrot', 'tur', 'warstw', '$']) expect((bar ?? '').includes(word)).toBe(false)
}

describe('handoff economics: one trigger, reckoned honestly', () => {
  test('warm cache, small context (100k): does not pay off, no event', async () => {
    // here = 100,000 × 0.2 / 1e6 + 0.04 = 0.02 + 0.04 = $0.06
    // saving per message = (100,000 − 30,000) × 0.2 / 1e6 = $0.014
    // N = ceil((0.06 + 0.24) / 0.014) = ceil(21.43) = 22 > 20 (the default threshold) → stay
    const v = handoffEconomics(base)
    expect(v.kind).toBe('stay')
    if (v.kind !== 'stay') return
    expect(v.turns).toBe(22)
    near(v.costs.here, 0.06)
    near(v.costs.startWrite, 0.24)
    near(v.costs.after, 0.046)
    expect(v.bar).toBeNull()
    expect(v.report).toContain('Werdykt: zostań — nie opłaca się, przekazanie odrobiłoby się dopiero po 22 wiadomościach.')
  })

  test('warm cache at 800k, no measured limit pace: the event, the comparison as a ratio, the missing pace in words', async () => {
    // here = 800,000 × 0.2 / 1e6 + 0.04 = 0.16 + 0.04 = $0.20
    // saving per message = (800,000 − 30,000) × 0.2 / 1e6 = $0.154
    // N = ceil((0.20 + 0.24) / 0.154) = ceil(2.857) = 3 ≤ 20 → hand off
    // ratio here / after = 0.20 / 0.046 = 4.35 → "4,3×"
    const v = handoffEconomics({ ...base, ctx: 800_000 })
    expect(v.kind).toBe('handoff')
    if (v.kind !== 'handoff') return
    expect(v.turns).toBe(3)
    near(v.costs.here, 0.2)
    expect(v.limit).toBeNull()
    expect(v.bar).toBe('przejdź do nowej sesji · tu wiadomość 4,3× droższa\nprzekazanie odrobisz po 3 wiadomościach')
    banned(v.bar)
    expect(v.report).toContain('Werdykt: przekaż — przekazanie odrobione po 3 wiadomościach.')
    expect(v.report).toContain('Limit 5 h: brak pomiaru tempa')
  })

  test('a cold cache no longer opens the event: the rewrite is paid on either path', async () => {
    // Cold 200k: rewrite = 200,000 × (8 − 0.2) / 1e6 = $1.56, paid by the next message here or by the handoff message
    // here (warm part) = 200,000 × 0.2 / 1e6 + 0.04 = $0.08; handoff message = 0.08 + 1.56 = $1.64
    // N = ceil((0.08 + 0.24) / 0.034) = ceil(9.41) = 10 — with threshold 5 a stay (the old rule opened the
    // event at 56), with the default 20 a handoff whose bar is the warm one word for word
    const cold = handoffEconomics({ ...base, ctx: 200_000, cache: 'cold', threshold: 5 })
    const warm = handoffEconomics({ ...base, ctx: 200_000, cache: 'warm', threshold: 5 })
    expect(cold.kind).toBe('stay')
    if (cold.kind !== 'stay' || warm.kind !== 'stay') throw new Error('expected stay on both')
    expect(cold.turns).toBe(10)
    expect(warm.turns).toBe(cold.turns)
    near(cold.costs.rewrite, 1.56)
    near(cold.costs.handoff, 1.64)
    near(warm.costs.rewrite, 0)
    expect(cold.bar).toBeNull()
    expect(cold.report).toContain('Cache zimny: ponowny zapis 200k po $8/M ≈ $1.56 płacisz raz w obu drogach')
    expect(warm.report).not.toContain('Cache zimny')
    const coldBar = handoffEconomics({ ...base, ctx: 200_000, cache: 'cold' }).bar
    expect(coldBar).not.toBeNull()
    expect(coldBar).toBe(handoffEconomics({ ...base, ctx: 200_000, cache: 'warm' }).bar)
  })

  test('the screenshot of 2026-10-14 (497k, cold, no limit pace): the figure and the advice agree', async () => {
    // Inputs reconstructed from the bar "≈ $4.01 → $0.06/turę, 66 turns": output 1,750 × 20 / 1e6 = $0.035, S = 120k.
    // here = 497,000 × 0.2 / 1e6 + 0.035 = $0.1344; start write = 120,000 × 8 / 1e6 = $0.96
    // saving = 377,000 × 0.2 / 1e6 = $0.0754; N = ceil(1.0944 / 0.0754) = ceil(14.51) = 15
    // after = 120,000 × 0.2 / 1e6 + 0.035 = $0.059; ratio = 0.1344 / 0.059 = 2.28 → "2,3×"
    const shot = { ...base, ctx: 497_000, start: 120_000, meanOutput: 1_750, cache: 'cold' as const }
    const old = handoffEconomics({ ...shot, threshold: 5 })
    expect(old.kind === 'stay' && old.turns).toBe(15)
    expect(old.bar).toBeNull()
    const v = handoffEconomics(shot) // the default threshold 20
    expect(v.kind === 'handoff' && v.turns).toBe(15)
    expect(v.bar).toBe('przejdź do nowej sesji · tu wiadomość 2,3× droższa\nprzekazanie odrobisz po 15 wiadomościach')
  })
})

describe('handoff economics: the 5-hour limit', () => {
  // The first turn (5 %) falls outside the window of 5.
  // pace = (0.7 + 0.9 + 0.8 + 0.8 + 0.8) % / (5 × 800,000 tokens) = 4.0 / 4,000,000 = 1e-6 % per token
  // here = 1e-6 × 800,000 = 0.80 %; per dollar = 0.80 / 0.20 = 4 %
  // after = 0.046 × 4 = 0.184 % → "0,18 %"; handoff = (0.20 + 0.24) × 4 = 1.76 %
  const limitTurns = [
    { percent: 5, tokens: 800_000 },
    { percent: 0.7, tokens: 800_000 },
    { percent: 0.9, tokens: 800_000 },
    { percent: 0.8, tokens: 800_000 },
    { percent: 0.8, tokens: 800_000 },
    { percent: 0.8, tokens: 800_000 },
  ]

  test('percent of the limit first, the handoff cost counted in', async () => {
    const v = handoffEconomics({ ...base, ctx: 800_000, limitTurns })
    expect(v.kind).toBe('handoff')
    if (v.kind !== 'handoff' || !v.limit) throw new Error('expected a limit share')
    near(v.limit.here, 0.8)
    near(v.limit.perUsd, 4)
    near(v.limit.after, 0.184)
    near(v.limit.handoff, 1.76)
    expect(v.limit.turns).toBe(5)
    expect(v.bar).toBe('przejdź do nowej sesji · tu wiadomość 0,80 %, tam 0,18 % limitu 5 h\nprzekazanie odrobisz po 3 wiadomościach')
    banned(v.bar)
    expect(v.report).toContain('Limit 5 h: wiadomość tu ≈ 0,80 %, po przekazaniu ≈ 0,18 %, przekazanie ≈ 1,76 % (4,00 % na $1, tempo z ostatnich 5 wiadomości).')
  })

  test('the figures never contradict the verdict: handoff ÷ saving in percent gives the same N', async () => {
    for (const ctx of [300_000, 500_000, 800_000, 1_000_000]) {
      for (const cache of ['warm', 'cold'] as const) {
        const v = handoffEconomics({ ...base, ctx, cache, limitTurns, threshold: 50 })
        if (v.kind !== 'handoff' || !v.limit) throw new Error(`expected a handoff with a limit at ${ctx}`)
        expect(Math.max(1, Math.ceil(v.limit.handoff / (v.limit.here - v.limit.after) - 1e-9))).toBe(v.turns)
        banned(v.bar)
      }
    }
  })
})

describe('handoff economics: the bar fits beside its buttons', () => {
  // Calibration 2026-10-14: a 140-character row pushed "Zostań" to a second line; two lines of at
  // most BAR_LINE_MAX characters keep both buttons beside the text (~7.6 px per character measured);
  // round 3 the same day: a narrow window squeezed even 90, so the words were cut to fit 70
  test('two lines, each within the limit, at the widest figures the rule can give', async () => {
    const heavy = Array(5).fill({ percent: 12.5, tokens: 999_000 })
    let checked = 0
    // The widest context window is 1M; 12.5 % of the 5-hour limit per message at 1M gives the widest
    // percents; a 10M context cannot occur
    for (const ctx of [120_000, 500_000, 999_000, 1_000_000]) {
      for (const start of [1_000, 30_000, 99_999]) {
        for (const limitTurns of [null, heavy]) {
          const v = handoffEconomics({ ...base, ctx, start, limitTurns, threshold: 50 })
          if (v.kind !== 'handoff') continue
          const lines = v.bar.split(BAR_BREAK)
          expect(lines.length).toBe(2)
          for (const line of lines) expect(line.length <= BAR_LINE_MAX).toBe(true)
          checked++
        }
      }
    }
    // Control: the loop really measured bars of both kinds, not an empty set
    expect(checked >= 8).toBe(true)
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
      [{ meanOutput: null }, 'meanOutput', 'średniego wyjścia wiadomości'],
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
    expect(v.report).toContain('nowa sesja się nie opłaci, bo kontekst (30.0k) nie jest większy od warstwy startu')
  })

  test('the threshold parameter moves the verdict', async () => {
    // 800k warm: N = 3 → stay with threshold 2
    expect(handoffEconomics({ ...base, ctx: 800_000, threshold: 2 }).kind).toBe('stay')
    // 100k warm: N = 22 → hand off with threshold 25, stay with 21
    expect(handoffEconomics({ ...base, threshold: 25 }).kind).toBe('handoff')
    expect(handoffEconomics({ ...base, threshold: 21 }).kind).toBe('stay')
  })

  test('the /cache reckoning states its assumptions in dollars', async () => {
    const v = handoffEconomics({ ...base, ttlMeasured: false, ttlMin: 5 })
    expect(v.report).toContain('TTL 5 min założony')
    expect(v.report).toContain('warstwa startu 30.0k (raport hooka startu)')
    expect(v.report).toContain('odczyt 100k z cache po $0.2/M')
    // (0.06 + 0.24) / 0.014 — the saving keeps its third decimal so the division can be checked by eye
    expect(v.report).toContain('Opłacalność: ($0.060 + $0.24) / $0.014 oszczędności na wiadomości → przekazanie odrobione po 22 wiadomościach (próg 20).')
    expect(v.report).toContain('Limit 5 h: brak pomiaru')
  })
})
