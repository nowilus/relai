// relai-input-router: the hand-off pane's content — pure, no $ (plan MODY_OSZCZEDZANIA, E4; spec,
// section 1, row "Panel"; look per docs/zasoby/PANEL_RELAI/DESIGN.md). register.tsx draws it: $
// and on never pass through an import (P-017).

import { PRICING, parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import type { RouterHandoff } from '../types'

/** Under this many columns the pane draws its narrow variant: buttons under the words (spec: 144). */
export const WIDE_COLUMNS = 144
/** Lines of notes or of the full result a card shows when opened. */
export const SHOWN_LINES = 40

export type Lists = readonly any[]

/** The price lists: the built-in one, then the project's price file when it reads (else the built-in alone). */
export function listsOf(priceFileText: string | null): Lists {
  const f = parsePriceFile(priceFileText)
  return priceLists(f.error ? [] : f.versions)
}

/** The helper's cost of one hand-off in dollars, or null when no helper ran or its model has no price. */
export function helperUsd(r: Pick<RouterHandoff, 'model' | 'at' | 'helperIn' | 'helperOut'>, lists: Lists): number | null {
  const inT = r.helperIn ?? 0
  const outT = r.helperOut ?? 0
  if (!r.model || (inT <= 0 && outT <= 0)) return null
  const p = priceAt({ model: r.model, input: inT, output: outT, cacheRead: 0, cacheWrite: 0, missing: null, at: Date.parse(r.at) || 0 } as any, lists.length ? lists : [{ ...PRICING, from: 0 }])
  return p.usd
}

export const usd = (x: number): string => (x < 0.01 ? `$${x.toFixed(4)}` : `$${x.toFixed(2)}`)

/** State as a word and a sign, never colour alone (DESIGN 5). */
export function stateOf(outcome: string): { sign: string, word: string, tone: 'ok' | 'quiet' | 'bad' } {
  if (outcome === 'notes') return { sign: '✓', word: 'notes', tone: 'ok' }
  if (outcome === 'memory') return { sign: '✓', word: 'notes from memory', tone: 'ok' }
  if (outcome === 'trim') return { sign: '✓', word: 'trimmed here', tone: 'ok' }
  if (outcome === 'cut') return { sign: '✓', word: 'cut here', tone: 'ok' }
  if (outcome === 'failed') return { sign: '✗', word: 'failed — Claude got the plain result', tone: 'bad' }
  if (outcome === 'secret') return { sign: '●', word: 'held back by the secret scanner — Claude got it whole', tone: 'quiet' }
  if (outcome === 'full') return { sign: '·', word: 'let through whole (full)', tone: 'quiet' }
  if (outcome === 'no-poppler') return { sign: '·', word: 'no Poppler — plain Read', tone: 'quiet' }
  return { sign: '·', word: outcome, tone: 'quiet' }
}

export type Card = {
  key: string
  sign: string
  word: string
  tone: 'ok' | 'quiet' | 'bad'
  tool: string
  /** The file, the command or the connector; '' when it is the tool itself. */
  path: string
  /** "~12 000 → ~800 tokens · Haiku $0.0040", or '' when nothing was handed off. */
  numbers: string
  notes: string
  copy: string
}

const n = (x: number): string => x.toLocaleString('en-US').replace(/,/g, ' ')

/** The cards, newest first, at most `room`. */
export function cardsOf(list: readonly RouterHandoff[], lists: Lists, room: number): Card[] {
  // Keyed by the hand-off's time, not its place: a new card does not remount the others (review E4)
  return [...list].reverse().slice(0, Math.max(1, room)).map((r) => {
    const s = stateOf(r.outcome)
    const cost = helperUsd(r, lists)
    const moved = r.before > 0 && r.after !== r.before
    const numbers = moved ? `~${n(r.before)} → ~${n(r.after)} tokens${cost !== null ? ` · ${modelWord(r.model)} ${usd(cost)}` : ''}` : ''
    return { key: r.at, ...s, tool: r.tool, path: r.path === r.tool ? '' : r.path, numbers, notes: r.notes, copy: r.copy }
  })
}

const modelWord = (m: string): string => (/haiku/i.test(m) ? 'Haiku' : m)

/** The pane's top line: hand-offs, tokens kept out of the chat, the helpers' cost. */
export function summaryOf(list: readonly RouterHandoff[], lists: Lists): string {
  const done = list.filter((x) => ['notes', 'memory', 'trim', 'cut'].includes(x.outcome))
  const saved = done.reduce((s, x) => s + (x.before - x.after), 0)
  const costs = list.map((x) => helperUsd(x, lists)).filter((x): x is number => x !== null)
  const cost = costs.reduce((s, x) => s + x, 0)
  return `${done.length} hand-offs · ~${n(saved)} tokens kept out of the chat${costs.length ? ` · helper ${usd(cost)}` : ''}`
}

/** The first lines of a text to show in a card. */
export function headOf(text: string, lines = SHOWN_LINES): string {
  const all = String(text || '').replace(/\r\n/g, '\n').split('\n')
  return all.length <= lines ? all.join('\n') : `${all.slice(0, lines).join('\n')}\n… ${all.length - lines} more lines in the file`
}

/** The notes text kept in a memory file ({ ts, path, result }), or ''. */
export function notesOfFile(text: string | null): string {
  try { return String(JSON.parse(String(text)).result || '') } catch { return '' }
}
