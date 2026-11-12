// relai-model-router: the values the mod keeps in $.state for the session (stats, the pane and
// the session's answer to the explicit-model card). The validator reads this contract on its own.

/** One judged subagent spawn, newest last. */
export type RouteChoice = {
  /** When (ISO); also the pane's key. */
  at: string
  /** The Agent call's short description. */
  description: string
  /** The model before (alias) and what the subagent runs on now (alias). */
  from: string
  to: string
  /** changed | kept | failed | secret */
  outcome: string
  /** How it was decided: judge, card, session preference, no person, or why it failed. */
  why: string
  /** Whether the caller named the model (the card protects it). */
  isExplicit: boolean
  /** The judge's tokens (0 when it was not called) and its time in ms. */
  judgeIn: number
  judgeOut: number
  ms: number
}

declare module 'claude-code' {
  interface PluginState {
    'relai-model-router': {
      /** The spawns judged in this session, the last 50. */
      choices: RouteChoice[]
      /** Why the mod does not route now ('' when it does): sleeping twin, no consent, no person, off. */
      idle: string
      /** The session's answer to the card: 'ask' each time, always 'suggestion', always 'mine', always 'session' (Annex B). */
      pref: string
    }
  }
}
