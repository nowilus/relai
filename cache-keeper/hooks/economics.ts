// Pure logic: continue here or hand off to a fresh session (AUDYT_MODOW Z9). No `$`, no I/O;
// the caller passes every number, prices included, so tests reach it directly.

import { tokens, usd } from './fmt'

export const DEFAULT_PAYBACK_TURNS = 5
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
  threshold?: number // payback in at most this many turns opens the event
}

export type MissingField = 'ctx' | 'start' | 'cache' | 'read' | 'write' | 'output' | 'meanOutput'

export type LimitPace = { now: number; after: number; turns: number }

export type Costs = { here: number; handoff: number; startWrite: number; after: number }

export type HandoffVerdict =
  | { kind: 'missing'; missing: MissingField[]; bar: null; report: string }
  | { kind: 'never'; costs: Costs; limit: LimitPace | null; bar: null; report: string }
  | { kind: 'stay'; turns: number; costs: Costs; limit: LimitPace | null; bar: null; report: string }
  | { kind: 'handoff'; turns: number; reason: 'payback' | 'cold'; costs: Costs; limit: LimitPace | null; bar: string; report: string }

const MISSING_LABEL: Record<MissingField, string> = {
  ctx: 'rozmiaru kontekstu',
  start: 'rozmiaru warstwy startu',
  cache: 'stanu cache (ciepły czy zimny)',
  read: 'stawki odczytu cache',
  write: 'stawki zapisu cache',
  output: 'stawki wyjścia',
  meanOutput: 'średniego wyjścia tury',
}

const usable = (n: number | null, positive: boolean): n is number =>
  n !== null && Number.isFinite(n) && (positive ? n > 0 : n >= 0)

// Two decimals, Polish comma (house rule for percents)
export const pct = (n: number): string => n.toFixed(2).replace('.', ',') + ' %'
const rate = (n: number): string => `$${n}/M`
// As `usd`, but sub-dime sums keep a third decimal, so the payback division reads true
const money = (n: number): string => (n > 0 && n < 0.1 ? '$' + n.toFixed(3) : usd(n))
const turnsWord = (n: number): string => (n === 1 ? 'po 1 turze' : `po ${n} turach`)

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

  // Warm: the turn reads ctx from the cache; cold: it writes ctx again
  const here = (ctx * (cold ? write : read)) / M + outputCost
  const costs: Costs = { here, handoff: here, startWrite: (S * write) / M, after: (S * read) / M + outputCost }
  const limit = limitPace(input.limitTurns, S)
  const saving = ((ctx - S) * read) / M
  const lines = reckoning(input, costs, limit)

  if (saving <= 0) {
    const why = ctx <= S ? `kontekst (${tokens(ctx)}) nie jest większy od warstwy startu (${tokens(S)})` : 'odczyt cache nic nie kosztuje'
    return { kind: 'never', costs, limit, bar: null, report: [...lines, `Werdykt: zostań — nowa sesja się nie zwróci, bo ${why}.`].join('\n') }
  }

  // The card's formula: (handoff turn + S·write) / ((ctx − S)·read), rounded up; the epsilon absorbs float noise
  const turns = Math.max(1, Math.ceil((costs.handoff + costs.startWrite) / saving - 1e-9))
  const payback = turns <= threshold
  const coldBig = cold && ctx > 2 * S
  const formula = `Zwrot: (${money(costs.handoff)} + ${money(costs.startWrite)}) / ${money(saving)} oszczędności na turze → N = ${turns} (próg ${threshold}).`
  if (!payback && !coldBig) {
    return { kind: 'stay', turns, costs, limit, bar: null, report: [...lines, formula, `Werdykt: zostań — nie opłaca się, nowa sesja zwróciłaby się dopiero ${turnsWord(turns)}.`].join('\n') }
  }
  const reason = payback ? 'payback' : 'cold'
  const why = payback ? `zwrot w ≤ ${threshold} turach` : `cache zimny i kontekst > 2× warstwa startu`
  return {
    kind: 'handoff', turns, reason, costs, limit,
    bar: barText(turns, costs, limit, reason),
    report: [...lines, formula, `Werdykt: przekaż — ${why}; nowa sesja zwróci się ${turnsWord(turns)}.`].join('\n'),
  }
}

// The cache bar's second row
function barText(turns: number, c: Costs, limit: LimitPace | null, reason: 'payback' | 'cold'): string {
  const parts = [`nowa sesja zwróci się ${turnsWord(turns)}`, `≈ ${usd(c.here)} → ${usd(c.after)}/turę`]
  if (limit) parts.push(`${pct(limit.now)} → ${pct(limit.after)} limitu 5 h`)
  return (reason === 'cold' ? 'cache zimny · ' : '') + parts.join(' · ')
}

// The `/cache` reckoning with its assumptions, one line each
function reckoning(i: HandoffInput, c: Costs, limit: LimitPace | null): string[] {
  const ctx = i.ctx as number
  const S = i.start as number
  const { read, write, output } = i.rates as { read: number; write: number; output: number }
  const turn = i.cache === 'cold' ? `ponowny zapis ${tokens(ctx)} po ${rate(write)}` : `odczyt ${tokens(ctx)} z cache po ${rate(read)}`
  const out = `wyjście ${tokens(i.meanOutput as number)} po ${rate(output)}`
  return [
    'Kontynuować czy nowa sesja',
    `Następna tura tu: ≈ ${usd(c.here)} (${turn} + ${out}).`,
    `Po przekazaniu: tura przekazania ≈ ${usd(c.handoff)} + zapis warstwy startu ${tokens(S)} po ${rate(write)} ≈ ${usd(c.startWrite)}, potem ≈ ${usd(c.after)}/turę.`,
    limit
      ? `Limit 5 h: ${pct(limit.now)}/turę teraz → ${pct(limit.after)} po (średnia z ${limit.turns} tur).`
      : 'Limit 5 h: brak pomiaru tempa — żadna tura sesji nie ma zmierzonej różnicy.',
    `Założenia: TTL ${i.ttlMin} min ${i.ttlMeasured ? 'zmierzony' : 'założony'}; warstwa startu ${tokens(S)} (${i.startSource}); stawki to ekwiwalent cennika API, nie rachunek.`,
  ]
}
