// Hypothetical Claude API prices, USD per million tokens, from the core's list (AUDYT_MODOW Z5):
// the plugin's copy of core/panel/pricing.mjs (PRICING) laid over by the project's saved
// versions in .claude/relai/panel/cennik.json, so the bar's "zapis ≈ $" and the panel's Costs tab
// price with the same rates. Outside a RelAI project, or without the file, PRICING alone prices.
// A model without a price is null ("cena nieznana"), never zero and never guessed from a similar
// name. On a subscription these figures are an API-equivalent estimate, never a bill.

import { PRICING, modelPrice, newest, parsePriceFile, priceLists } from './relai/pricing.mjs'

type PriceList = typeof PRICING
type ModelPrice = NonNullable<ReturnType<typeof modelPrice>>

// The list the keeper prices with now: the newest rates of each model, the core's multipliers,
// the date and source of the newest version, and the file's error in words ('' when none)
export type Prices = { list: PriceList, date: string, source: string, error: string }

export type Rates = { input: number, read: number, write: number, output: number }

export type Usage = {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
}

const PER_MILLION = 1e6

// The price file's text (null: no file) as the list the keeper prices with
export function pricesFrom(text: string | null): Prices {
  const { versions, error } = parsePriceFile(text)
  const top = newest(priceLists(versions))
  return { list: { ...PRICING, models: top.models }, date: top.date, source: top.source, error }
}

export const BUILT_IN: Prices = pricesFrom(null)

// The words /cache shows: the list's date and source, and why the file was not used
export function priceSource(prices: Prices): string {
  const tail = prices.error ? ` (${prices.error} — liczę wbudowanym cennikiem)` : ''
  return `cennik z ${prices.date}, ${prices.source}${tail}`
}

// "claude-opus-5-5[1m]", "Claude-Opus-5-5-20261001", "opus-5-5" → "claude-opus-5-5"
export function normalizeModel(model: string | undefined): string {
  const bare = String(model || '').toLowerCase().trim().replace(/\[.*?\]/g, '').replace(/-\d{8}$/, '')
  return bare && !bare.startsWith('claude-') ? 'claude-' + bare : bare
}

export function totalInput(u: Usage | undefined): number {
  if (!u) return 0
  return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
}

// USD per million tokens a request of this prompt length pays on this TTL, by the core's rules:
// the "over" tier past its boundary, the model's own cache rates or the list's multipliers
export function ratesFor(model: string | undefined, ttlMin: number, promptTokens: number, prices: Prices = BUILT_IN): Rates | null {
  const id = normalizeModel(model)
  const price: ModelPrice | null = id ? modelPrice(id, prices.list) : null
  if (!price) return null
  const tier = price.over && promptTokens > price.over.above ? price.over : price
  const ttl = ttlMin >= 60 ? '1h' : '5m'
  const write = ttl === '1h' ? tier.write1h : tier.write5m
  return {
    input: tier.input,
    read: tier.read ?? tier.input * prices.list.readMult,
    write: write ?? tier.input * prices.list.writeMult[ttl],
    output: tier.output,
  }
}

export function requestCost(u: Usage | undefined, model: string | undefined, ttlMin: number, prices: Prices = BUILT_IN): number | null {
  if (!u) return 0
  const k = ratesFor(model, ttlMin, totalInput(u), prices)
  if (!k) return null
  return (
    ((u.input_tokens || 0) * k.input +
      (u.cache_read_input_tokens || 0) * k.read +
      (u.cache_creation_input_tokens || 0) * k.write +
      (u.output_tokens || 0) * k.output) /
    PER_MILLION
  )
}

export function rewriteCost(tokens: number, model: string | undefined, ttlMin: number, prices: Prices = BUILT_IN): number | null {
  const k = ratesFor(model, ttlMin, tokens, prices)
  return k ? (tokens * k.write) / PER_MILLION : null
}

export function readCost(tokens: number, model: string | undefined, prices: Prices = BUILT_IN): number | null {
  const k = ratesFor(model, 60, tokens, prices)
  return k ? (tokens * k.read) / PER_MILLION : null
}
