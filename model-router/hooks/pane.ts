// relai-model-router: the pane's content — pure, no $ (plan MODY_OSZCZEDZANIA, E5; look per
// docs/zasoby/PANEL_RELAI/DESIGN.md: state as a word and a sign, never colour alone). register.tsx
// draws it: $ and on never pass through an import (P-017).

import { PRICING, parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import { JUDGE_ID } from './judge'
import type { Pref } from './judge'
import type { RouteChoice } from '../types'

/** Under this many columns the pane puts buttons under the words (as relai-input-router). */
export const WIDE_COLUMNS = 144

export type Lists = readonly any[]

export function listsOf(priceFileText: string | null): Lists {
  const f = parsePriceFile(priceFileText)
  return priceLists(f.error ? [] : f.versions)
}

/** The judge's cost of one choice in dollars, or null when it was not called or has no price. */
export function judgeUsd(c: Pick<RouteChoice, 'at' | 'judgeIn' | 'judgeOut'>, lists: Lists): number | null {
  if (c.judgeIn <= 0 && c.judgeOut <= 0) return null
  const p = priceAt({ model: JUDGE_ID, input: c.judgeIn, output: c.judgeOut, cacheRead: 0, cacheWrite: 0, missing: null, at: Date.parse(c.at) || 0 } as any, lists.length ? lists : [{ ...PRICING, from: 0 }])
  return p.usd
}

export const usd = (x: number): string => (x < 0.01 ? `$${x.toFixed(4)}` : `$${x.toFixed(2)}`)

export function stateOf(outcome: string): { sign: string, word: string, tone: 'ok' | 'quiet' | 'bad' } {
  if (outcome === 'changed') return { sign: '✓', word: 'model changed', tone: 'ok' }
  if (outcome === 'kept') return { sign: '·', word: 'model kept', tone: 'quiet' }
  if (outcome === 'secret') return { sign: '●', word: 'held back by the secret scanner — model kept', tone: 'quiet' }
  return { sign: '✗', word: 'judge failed — model kept', tone: 'bad' }
}

export const prefWord = (p: Pref): string => (p === 'mine' ? 'always yours' : p === 'suggestion' ? 'always the suggestion' : p === 'session' ? "always the session's model" : 'asks each time')

export type Card = { key: string, sign: string, word: string, tone: 'ok' | 'quiet' | 'bad', title: string, models: string, why: string, cost: string }

/** The newest `room` choices as cards, newest first. */
export function cardsOf(list: readonly RouteChoice[], lists: Lists, room: number): Card[] {
  // the key carries the index too: crew rows judged at once can share a millisecond (E6)
  return [...list].reverse().slice(0, Math.max(1, room)).map((c, i) => {
    const s = stateOf(c.outcome)
    const u = judgeUsd(c, lists)
    const cost = c.judgeIn + c.judgeOut > 0 ? `judge ${c.judgeIn} in / ${c.judgeOut} out${u === null ? '' : ` · ${usd(u)}`} · ${c.ms} ms` : ''
    return { key: `${c.at}~${i}`, ...s, title: c.description || '(no description)', models: `${c.from} → ${c.to}${c.isExplicit ? ' (named by the caller)' : ''}`, why: c.why, cost }
  })
}

/** One line over the session: how many judged, changed, the judge's cost. */
export function summaryOf(list: readonly RouteChoice[], lists: Lists): string {
  if (!list.length) return 'No subagents judged in this chat yet.'
  const changed = list.filter((c) => c.outcome === 'changed').length
  const total = list.reduce((n, c) => n + (judgeUsd(c, lists) ?? 0), 0)
  return `${list.length} subagents judged in this chat · ${changed} changed · judge cost ${usd(total)}`
}
