// relai-input-router: the values the mod keeps in $.state for the session (stats, later the pane).
// The validator reads this contract on its own, without the imports of the module.

/** One large read the mod handled in this session, newest last. */
export type RouterHandoff = {
  /** Read or Bash. */
  tool: string
  /** The file read, or "Bash: <command>". */
  path: string
  /** Estimated tokens of the full text (characters / 4) and of what Claude got. */
  before: number
  after: number
  /** notes | memory | failed | secret | full | no-poppler */
  outcome: string
  /** The helper model that wrote the notes ('' when none did). */
  model: string
}

declare module 'claude-code' {
  interface PluginState {
    'relai-input-router': {
      /** The large reads handled in this session, the last 50. */
      handoffs: RouterHandoff[]
      /** Why the mod does not hand off now ('' when it does): sleeping twin, no consent, no person, files off. */
      idle: string
    }
  }
}
