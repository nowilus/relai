// relai-model-router: the session's decision — pure, no $. Whether a subagent's task may go to the
// judge now, from the twin, the project's consent, whether a person sits at the session and the
// mod's own switch (plan MODY_OSZCZEDZANIA, E5; spec, section 7; Annex A). As in relai-input-router.

import { CONSENT_ROW } from './core/savings-gates.mjs'

export type Gate = {
  isTwinActive: boolean
  /** RelAI project root holding docs/USTAWIENIA.md with the marker, or null. */
  projectRoot: string | null
  consent: 'yes' | 'no' | null
  /** A person typed in the composer or ran a command in this session (probe E1: origin.kind 'composer'). */
  hasHuman: boolean
  /** The pane's switch (or /relai-model-router off). */
  isOn: boolean
}

export type Decision = { kind: 'route' } | { kind: 'ask' } | { kind: 'idle', why: string }

/** The twin wins, then the project, then consent, then the switch. */
export function decide(g: Gate): Decision {
  if (g.isTwinActive) return { kind: 'idle', why: 'sleeps: the BenAI model-router mod is on' }
  if (!g.projectRoot) return { kind: 'idle', why: `passive: no RelAI project here (row '${CONSENT_ROW}' lives in docs/USTAWIENIA.md)` }
  if (g.consent === 'no') return { kind: 'idle', why: `passive: the project said no (row '${CONSENT_ROW}')` }
  if (g.consent === null) return g.hasHuman ? { kind: 'ask' } : { kind: 'idle', why: 'passive: no answer yet and no person in this session' }
  if (!g.isOn) return { kind: 'idle', why: 'off (pane switch or /relai-model-router on)' }
  return { kind: 'route' }
}

/** The consent card (rule 15: one question per project, plain words). */
export const CONSENT_QUESTION = 'RelAI token-saving mods: may they work in this project? relai-model-router sends each subagent task to a helper model (after the secret scanner), which picks the cheapest model that will do it well.'
export const CONSENT_YES_LABEL = 'Yes, in this project'
export const CONSENT_NO_LABEL = 'No'
