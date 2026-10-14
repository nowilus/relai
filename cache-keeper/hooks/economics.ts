// Pure logic: continue here or hand off to a fresh session (AUDYT_MODOW Z9, KOMUNIKAT_ZWROTU).
// No `$`, no I/O; the caller passes every number, prices included, so tests reach it directly.
//
// One trigger: the handoff's own cost (its message + writing the start layer) is earned back by the
// cheaper messages after it within `threshold` messages. A cold cache rewrites the context once on
// either path (the next message here, or the handoff message), so it moves no verdict.

import { tokens, usd } from './fmt'

export const DEFAULT_PAYBACK_TURNS = 20
const M = 1e6 // rates are USD per million tokens
const LIMIT_WINDOW = 5 // the 5-hour limit pace is the mean of this many recent turns

export type CacheTemp = 'warm' | 'cold' | 'unknown'

// USD per million tokens; `write` is the cache-write rate of the TTL in force
export type Rates = { read: number | null; write: number | null; output: number | null }

// One measured turn: the 5-hour limit `percentUsed` delta and the tokens that turn processed
export type LimitTurn = { percent: number; tokens: number }

export type HandoffInput = {
  ctx: number | null // context tokens now
  start: number | null // S: tokens of the project's start layer
  startSource: string // where S came from, said in the `/cache` reckoning
  cache: CacheTemp
  ttlMin: number
  ttlMeasured: boolean
  rates: Rates
  meanOutput: number | null // the session's mean output tokens per turn
  limitTurns: readonly LimitTurn[] | null
  threshold?: number // the handoff earned back within at most this many messages opens the event
}

export type MissingField = 'ctx' | 'start' | 'cache' | 'read' | 'write' | 'output' | 'meanOutput'

export type LimitPace = { now: number; after: number; turns: number }

// The same costs in percent of the 5-hour limit: `perUsd` percent per dollar, measured
export type LimitShare = { here: number; after: number; handoff: number; perUsd: number; turns: number }

// here: a message here on a warm cache; rewrite: the cold cache's one-off rewrite (0 when warm),
// paid on either path; handoff: the handoff message as billed; startWrite: the start layer's
// write; after: a message after the handoff; extra: what handing off costs over staying
export type Costs = { here: number; rewrite: number; handoff: number; startWrite: number; after: number; extra: number }

export type HandoffVerdict =
  | { kind: 'missing'; missing: MissingField[]; bar: null; report: string }
  | { kind: 'never'; costs: Costs; limit: LimitShare | null; bar: null; report: string }
  | { kind: 'stay'; turns: number; costs: Costs; limit: LimitShare | null; bar: null; report: string }
  | { kind: 'handoff'; turns: number; costs: Costs; limit: LimitShare | null; bar: string; lines: BarSegment[][]; report: string }

const MISSING_LABEL: Record<MissingField, string> = {
  ctx: 'rozmiaru kontekstu',
  start: 'rozmiaru warstwy startu',
  cache: 'stanu cache (ciepły czy zimny)',
  read: 'stawki odczytu cache',
  write: 'stawki zapisu cache',
  output: 'stawki wyjścia',
  meanOutput: 'średniego wyjścia wiadomości',
}

const usable = (n: number | null, positive: boolean): n is number =>
  n !== null && Number.isFinite(n) && (positive ? n > 0 : n >= 0)

// Two decimals, Polish comma (house rule for percents)
export const pct = (n: number): string => n.toFixed(2).replace('.', ',') + ' %'
const rate = (n: number): string => `$${n}/M`
// As `usd`, but sub-dime sums keep a third decimal, so the division reads true
const money = (n: number): string => (n > 0 && n < 0.1 ? '$' + n.toFixed(3) : usd(n))
const messagesWord = (n: number): string => (n === 1 ? 'po 1 wiadomości' : `po ${n} wiadomościach`)
const decimal = (n: number): string => n.toFixed(1).replace('.', ',')
const times = (n: number): string => decimal(n) + '×'

function missingFields(i: HandoffInput): MissingField[] {
  const out: MissingField[] = []
  if (!usable(i.ctx, true)) out.push('ctx')
  if (!usable(i.start, true)) out.push('start')
  if (i.cache === 'unknown') out.push('cache')
  if (!usable(i.rates.read, false)) out.push('read')
  if (!usable(i.rates.write, false)) out.push('write')
  if (!usable(i.rates.output, false)) out.push('output')
  if (!usable(i.meanOutput, false)) out.push('meanOutput')
  return out
}

// Mean percent of the last turns; after the handoff the same percent per token, applied to S
export function limitPace(turns: readonly LimitTurn[] | null, start: number): LimitPace | null {
  const last = (turns || []).filter((t) => Number.isFinite(t.percent) && t.tokens > 0).slice(-LIMIT_WINDOW)
  if (!last.length) return null
  const percent = last.reduce((s, t) => s + t.percent, 0)
  const tokenSum = last.reduce((s, t) => s + t.tokens, 0)
  return { now: percent / last.length, after: (percent / tokenSum) * start, turns: last.length }
}

// The measured pace per token, applied to ctx, is a message here; the dollar costs scaled by the
// same factor give the rest, so a percent never disagrees with the verdict reckoned in dollars
function limitShare(turns: readonly LimitTurn[] | null, ctx: number, c: Costs): LimitShare | null {
  const pace = limitPace(turns, ctx)
  if (!pace || !(pace.after > 0) || !(c.here > 0)) return null
  const perUsd = pace.after / c.here
  return { here: pace.after, after: c.after * perUsd, handoff: c.extra * perUsd, perUsd, turns: pace.turns }
}

export function handoffEconomics(input: HandoffInput): HandoffVerdict {
  const missing = missingFields(input)
  if (missing.length) {
    const words = missing.map((f) => MISSING_LABEL[f]).join(', ')
    return { kind: 'missing', missing, bar: null, report: `Nie liczę, czy nowa sesja się opłaca: brak ${words}.` }
  }
  // missingFields() proved every number usable
  const ctx = input.ctx as number
  const S = input.start as number
  const read = input.rates.read as number
  const write = input.rates.write as number
  const outputCost = ((input.meanOutput as number) * (input.rates.output as number)) / M
  const threshold = input.threshold ?? DEFAULT_PAYBACK_TURNS
  const cold = input.cache === 'cold'

  const here = (ctx * read) / M + outputCost
  const rewrite = cold ? (ctx * Math.max(0, write - read)) / M : 0
  const startWrite = (S * write) / M
  const costs: Costs = { here, rewrite, handoff: here + rewrite, startWrite, after: (S * read) / M + outputCost, extra: here + startWrite }
  const limit = limitShare(input.limitTurns, ctx, costs)
  const saving = ((ctx - S) * read) / M
  const lines = reckoning(input, costs, limit)

  if (saving <= 0) {
    const why = ctx <= S ? `kontekst (${tokens(ctx)}) nie jest większy od warstwy startu (${tokens(S)})` : 'odczyt cache nic nie kosztuje'
    return { kind: 'never', costs, limit, bar: null, report: [...lines, `Werdykt: zostań — nowa sesja się nie opłaci, bo ${why}.`].join('\n') }
  }

  // (handoff message + S·write) / ((ctx − S)·read), rounded up; the epsilon absorbs float noise
  const turns = Math.max(1, Math.ceil(costs.extra / saving - 1e-9))
  const formula = `Opłacalność: (${money(here)} + ${money(startWrite)}) / ${money(saving)} oszczędności na wiadomości → przekazanie odrobione ${messagesWord(turns)} (próg ${threshold}).`
  if (turns > threshold) {
    return { kind: 'stay', turns, costs, limit, bar: null, report: [...lines, formula, `Werdykt: zostań — nie opłaca się, przekazanie odrobiłoby się dopiero ${messagesWord(turns)}.`].join('\n') }
  }
  return {
    kind: 'handoff', turns, costs, limit,
    bar: barText(ctx, S, turns, costs, limit),
    lines: barLines(ctx, S, turns, costs, limit),
    report: [...lines, formula, `Werdykt: przekaż — przekazanie odrobione ${messagesWord(turns)}.`].join('\n'),
  }
}

// The cache bar's second row, two lines split at BAR_BREAK: what to do and why, then what it gains
// with the handoff's own cost. Percent of the 5-hour limit first; with no measured pace the same
// comparison as ratios. Each line stays within BAR_LINE_MAX characters, so the row's buttons keep
// their place beside it. `barLines` are the same words as segments: register.tsx draws a strong one
// bold and the rest muted, with no background (the grammar of the batteries, calibration 2026-10-14).
export const BAR_BREAK = '\n'
export const BAR_LINE_MAX = 70
export type BarSegment = { text: string; strong: boolean }
const strong = (text: string): BarSegment => ({ text, strong: true })
const plain = (text: string): BarSegment => ({ text, strong: false })

function barLines(ctx: number, S: number, turns: number, c: Costs, limit: LimitShare | null): BarSegment[][] {
  // Calibration 2026-10-14, round 4: cost only, never token counts — "czyta 115k zamiast 325k" read
  // as "always go", while reading is cheap and the output costs the same in both sessions.
  // The second line carries the handoff's own cost; its split stays in `/cache`
  const why = limit
    ? [strong('przejdź do nowej sesji'), plain(' · tu wiadomość '), strong(pct(limit.here)), plain(', tam '), strong(pct(limit.after)), plain(' limitu 5 h')]
    : [strong('przejdź do nowej sesji'), plain(' · tu wiadomość '), strong(times(c.here / c.after)), plain(' droższa')]
  const back = [plain('przekazanie odrobisz po '), strong(String(turns)), plain(turns === 1 ? ' wiadomości' : ' wiadomościach')]
  return [why, back]
}

function barText(ctx: number, S: number, turns: number, c: Costs, limit: LimitShare | null): string {
  return barLines(ctx, S, turns, c, limit).map((line) => line.map((s) => s.text).join('')).join(BAR_BREAK)
}

// The `/cache` reckoning with its assumptions, one line each; dollars here, never on the bar
function reckoning(i: HandoffInput, c: Costs, limit: LimitShare | null): string[] {
  const ctx = i.ctx as number
  const S = i.start as number
  const { read, write, output } = i.rates as { read: number; write: number; output: number }
  const out = `wyjście ${tokens(i.meanOutput as number)} po ${rate(output)}`
  const lines = ['Kontynuować czy nowa sesja', `Wiadomość tu: ≈ ${usd(c.here)} (odczyt ${tokens(ctx)} z cache po ${rate(read)} + ${out}).`]
  if (c.rewrite > 0) {
    lines.push(`Cache zimny: ponowny zapis ${tokens(ctx)} po ${rate(write)} ≈ ${usd(c.rewrite)} płacisz raz w obu drogach — następną wiadomością tu albo wiadomością przekazania; werdyktu nie zmienia.`)
  }
  lines.push(
    `Po przekazaniu: wiadomość przekazania ≈ ${usd(c.handoff)} + zapis warstwy startu ${tokens(S)} po ${rate(write)} ≈ ${usd(c.startWrite)}, potem ≈ ${usd(c.after)} za wiadomość.`,
    limit
      ? `Limit 5 h: wiadomość tu ≈ ${pct(limit.here)}, po przekazaniu ≈ ${pct(limit.after)}, przekazanie ≈ ${pct(limit.handoff)} (${pct(limit.perUsd)} na $1, tempo z ostatnich ${limit.turns} wiadomości).`
      : 'Limit 5 h: brak pomiaru tempa — żadna wiadomość sesji nie ma zmierzonej różnicy.',
    `Założenia: TTL ${i.ttlMin} min ${i.ttlMeasured ? 'zmierzony' : 'założony'}; warstwa startu ${tokens(S)} (${i.startSource}); stawki to ekwiwalent cennika API, nie rachunek; limit liczony proporcjonalnie do tych stawek.`,
  )
  return lines
}
