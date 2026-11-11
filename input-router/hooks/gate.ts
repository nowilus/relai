// relai-input-router: the session's decision — pure, no $. Whether a large read may go to the
// helper now, from the twin, the project's consent, whether a person sits at the session and the
// mod's own file switch (plan MODY_OSZCZEDZANIA, E3; spec, section 7; Annex A).

import { CONSENT_ROW } from './core/savings-gates.mjs'

export type Gate = {
  isTwinActive: boolean
  /** RelAI project root holding docs/USTAWIENIA.md with the marker, or null. */
  projectRoot: string | null
  consent: 'yes' | 'no' | null
  /** A person typed in the composer or ran a command in this session (probe E1: origin.kind 'composer'). */
  hasHuman: boolean
  /** `/relai-input-router off file` turns files off. */
  isFileOn: boolean
}

export type Decision = { kind: 'notes' } | { kind: 'ask' } | { kind: 'idle', why: string }

/** The twin wins, then the project, then consent, then the switch. */
export function decide(g: Gate): Decision {
  if (g.isTwinActive) return { kind: 'idle', why: 'sleeps: the BenAI input-router mod is on' }
  if (!g.projectRoot) return { kind: 'idle', why: `passive: no RelAI project here (row '${CONSENT_ROW}' lives in docs/USTAWIENIA.md)` }
  if (g.consent === 'no') return { kind: 'idle', why: `passive: the project said no (row '${CONSENT_ROW}')` }
  if (g.consent === null) return g.hasHuman ? { kind: 'ask' } : { kind: 'idle', why: 'passive: no answer yet and no person in this session' }
  if (!g.isFileOn) return { kind: 'idle', why: 'files off (/relai-input-router on file)' }
  return { kind: 'notes' }
}

/** The consent card (rule 15: one question per project, plain words). */
export const CONSENT_QUESTION = 'RelAI token-saving mods: may they work in this project? relai-input-router sends large files and outputs to a helper model (after the secret scanner) and gives Claude its notes with a path to the full text.'
export const CONSENT_YES_LABEL = 'Yes, in this project'
export const CONSENT_NO_LABEL = 'No'
