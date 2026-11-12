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

/** One crew member decided on the crew card (E6): its run and task id (the mark in its prompt) and its model. */
export type CrewDecisionState = {
  /** The crew card's run token (from the tool call's id). */
  run: string
  /** The task id from /relai-crew's zadania.json. */
  id: string
  /** The model the member runs on (alias); null: the model it is given, unchanged. */
  model: string | null
  /** The model the reply named for this member; a spawn asking for another model is not this member. */
  replied: string | null
  /** The interview's model exactly as given, or null. */
  given: string | null
  /** The task's row on the card. */
  rowIndex: number
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
      /** The crew card's decisions, the last 50: a decided member spawns with no second card, also after a reload. */
      crew: CrewDecisionState[]
      /** Bumped on every change of the open crew card's rows, so the crew pane redraws. */
      crewTick: number
    }
  }
}
