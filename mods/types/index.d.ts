// relai-mods: the values its pane draws from, held by the host in $.state for the session.
// The validator reads this contract on its own, without the imports of the module.

/** The last outcome shown under the list; '' for none. */
export type ModsNote = string

declare module 'claude-code' {
  interface PluginState {
    'relai-mods': {
      /** A CLI call or a probe is running: one at a time (plan RELAI_MODS, section 8). */
      busy: boolean
      /** The last outcome shown under the list: what the CLI did, its error, or why it could not run; '' for none. */
      note: ModsNote
    }
  }
}
