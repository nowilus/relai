// Hypothetical Claude API prices, USD per million tokens.
// Source: platform.claude.com/docs/en/about-claude/pricing, read 2026-10-08.
// A cache write costs 1.25x input on the 5-minute TTL and 2x input on the 1-hour TTL.
// On a subscription these figures are an API-equivalent estimate, never a bill.

export const PRICE_SOURCE = 'platform.claude.com/docs/en/about-claude/pricing, odczyt 2026-10-08'

export type Price = { id: string; input: number; output: number; read: number }

type Row = { input: number; output: number; read: number; longAbove?: number; long?: Omit<Row, 'longAbove' | 'long'> }

const TABLE: Record<string, Row> = {
  'fable-5-1': { input: 10, output: 50, read: 0.25 },
  'mythos-5-1': { input: 10, output: 50, read: 0.25 },
  'fable-5': { input: 10, output: 50, read: 1 },
  'mythos-5': { input: 10, output: 50, read: 1 },
  'opus-5-5': { input: 4, output: 20, read: 0.2 },
  'opus-5': { input: 5, output: 25, read: 0.5 },
  'opus-4-8': { input: 5, output: 25, read: 0.5 },
  'opus-4-7': { input: 5, output: 25, read: 0.5 },
  'opus-4-6': { input: 5, output: 25, read: 0.5 },
  'opus-4-5': { input: 5, output: 25, read: 0.5 },
  'sonnet-5-5': { input: 2, output: 10, read: 0.1 },
  'sonnet-5': { input: 2, output: 10, read: 0.2 },
  'sonnet-4-6': { input: 3, output: 15, read: 0.3 },
  'sonnet-4-5': { input: 3, output: 15, read: 0.3 },
  'haiku-5-5': { input: 0.1, output: 0.5, read: 0.01, longAbove: 100_000, long: { input: 0.5, output: 2.5, read: 0.05 } },
  'haiku-4-5': { input: 1, output: 5, read: 0.1 },
}

// Longest first, so 'opus-5' never swallows 'opus-5-5'
const KEYS = Object.keys(TABLE).sort((a, b) => b.length - a.length)

export type Usage = {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
}

export function normalizeModel(model: string | undefined): string {
  return String(model || '')
    .toLowerCase()
    .replace(/^claude-/, '')
    .replace(/\[.*?\]/g, '')
    .replace(/-\d{8}$/, '')
    .trim()
}

// Unknown model: null. A missing price is never guessed and never zero.
export function priceFor(model: string | undefined, promptTokens = 0): Price | null {
  const id = normalizeModel(model)
  const key = KEYS.find((k) => id === k || id.startsWith(k + '-') || id.startsWith(k))
  const row = key ? TABLE[key] : undefined
  if (!key || !row) return null
  const base = row.long && row.longAbove && promptTokens > row.longAbove ? row.long : row
  return { id: key, input: base.input, output: base.output, read: base.read }
}

export function totalInput(u: Usage | undefined): number {
  if (!u) return 0
  return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
}

function writeRate(p: Price, ttlMin: number): number {
  return p.input * (ttlMin >= 60 ? 2 : 1.25)
}

export function requestCost(u: Usage | undefined, model: string | undefined, ttlMin: number): number | null {
  if (!u) return 0
  const p = priceFor(model, totalInput(u))
  if (!p) return null
  return (
    ((u.input_tokens || 0) * p.input +
      (u.cache_read_input_tokens || 0) * p.read +
      (u.cache_creation_input_tokens || 0) * writeRate(p, ttlMin) +
      (u.output_tokens || 0) * p.output) /
    1e6
  )
}

export function rewriteCost(tokens: number, model: string | undefined, ttlMin: number): number | null {
  const p = priceFor(model, tokens)
  return p ? (tokens * writeRate(p, ttlMin)) / 1e6 : null
}

export function readCost(tokens: number, model: string | undefined): number | null {
  const p = priceFor(model, tokens)
  return p ? (tokens * p.read) / 1e6 : null
}
