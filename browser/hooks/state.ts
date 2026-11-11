// relai-browser: the session's decisions — pure, no $. Whether a picture may be shrunk now, from
// the twin, the project's consent, whether a person sits at the session, and the system's tool.

import { CONSENT_ROW } from './core/savings-gates.mjs'

export type Gate = {
  isTwinActive: boolean
  /** RelAI project root holding docs/USTAWIENIA.md with the marker, or null. */
  projectRoot: string | null
  consent: 'yes' | 'no' | null
  /** A person typed in the composer in this session (probe E1: origin.kind 'composer'). */
  hasHuman: boolean
  hasTool: boolean
}

export type Decision = { kind: 'shrink' } | { kind: 'ask' } | { kind: 'idle', why: string }

/** What to do with a picture now. The twin wins, then the project, then consent, then the tool. */
export function decide(g: Gate): Decision {
  if (g.isTwinActive) return { kind: 'idle', why: 'sleeps: the BenAI efficient-browser-use mod is on' }
  if (!g.projectRoot) return { kind: 'idle', why: `passive: no RelAI project here (row '${CONSENT_ROW}' lives in docs/USTAWIENIA.md)` }
  if (g.consent === 'no') return { kind: 'idle', why: `passive: the project said no (row '${CONSENT_ROW}')` }
  if (g.consent === null) return g.hasHuman ? { kind: 'ask' } : { kind: 'idle', why: 'passive: no answer yet and no person in this session' }
  if (!g.hasTool) return { kind: 'idle', why: 'passive: no picture tool on this system (Windows PowerShell or macOS sips)' }
  return { kind: 'shrink' }
}

/** The consent card (rule 15: one question per project, plain words). */
export const CONSENT_QUESTION = 'RelAI token-saving mods: may they work in this project? relai-browser shrinks pictures before Claude reads them; later mods may send content to a helper model (only after the secret scanner).'
export const CONSENT_YES_LABEL = 'Yes, in this project'
export const CONSENT_NO_LABEL = 'No'

/** Parsed /relai-browser arguments. */
export type Command =
  | { kind: 'full' }
  | { kind: 'scale', value: number }
  | { kind: 'min', value: number }
  | { kind: 'pane' }
  | { kind: 'describe', model: string | null }
  | { kind: 'shrink' }
  | { kind: 'status' }
  | { kind: 'bad', text: string }

export function parseCommand(args: string): Command {
  const [word, arg] = String(args || '').trim().split(/\s+/)
  if (!word) return { kind: 'status' }
  if (word === 'full') return { kind: 'full' }
  if (word === 'pane') return { kind: 'pane' }
  if (word === 'shrink') return { kind: 'shrink' }
  if (word === 'describe') {
    if (arg && !/^[A-Za-z0-9.\-]{1,64}$/.test(arg)) return { kind: 'bad', text: '/relai-browser describe takes a model id, e.g. claude-haiku-5-5' }
    return { kind: 'describe', model: arg || null }
  }
  if (word === 'scale' || word === 'min') {
    const v = arg ? Number(arg.replace(',', '.')) : Number.NaN
    if (!Number.isFinite(v)) return { kind: 'bad', text: `/relai-browser ${word} needs a number` }
    return word === 'scale' ? { kind: 'scale', value: v } : { kind: 'min', value: v }
  }
  return { kind: 'bad', text: 'Type /relai-browser full, describe, shrink, scale 0.5, min 512 or pane.' }
}
