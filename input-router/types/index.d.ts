// relai-input-router: the values the mod keeps in $.state for the session (stats and the hand-off pane).
// The validator reads this contract on its own, without the imports of the module.

/** One large read or connector result the mod handled in this session, newest last. */
export type RouterHandoff = {
  /** Read, Bash or the connector tool (mcp__<server>__<tool>). */
  tool: string
  /** The file read, "Bash: <command>", or the connector tool. */
  path: string
  /** Estimated tokens of the full text (characters / 4) and of what Claude got. */
  before: number
  after: number
  /** notes | memory | trim | cut | failed | secret | full | no-poppler */
  outcome: string
  /** The helper model that wrote the notes ('' when none did). */
  model: string
  /** When (ISO), the full-content copy and the saved notes ('' when none): the pane's buttons open them. */
  at: string
  copy: string
  notes: string
  /** Helper tokens of this hand-off (0 when no helper ran); the pane shows its cost. */
  helperIn?: number
  helperOut?: number
}

declare module 'claude-code' {
  interface PluginState {
    'relai-input-router': {
      /** The large reads handled in this session, the last 50. */
      handoffs: RouterHandoff[]
      /** Why the mod does not hand off now ('' when it does): sleeping twin, no consent, no person, files off. */
      idle: string
      /** The pane's open card (its `at`) and what it shows: '' none, 'notes' or 'full'. */
      shown: { at: string, what: string }
    }
  }
}
