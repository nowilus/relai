// relai-mods: the values its pane draws from, held by the host in $.state for the session.
// The validator reads this contract on its own, without the imports of the module.

/** The last outcome shown under the list; '' for none. */
export type ModsNote = string

/** One CLI call at a time: the running row's key, then the rows waiting in press order. */
export type ModsQueue = { running: string, waiting: string[] }

declare module 'claude-code' {
  interface PluginState {
    'relai-mods': {
      /** The last outcome shown under the list: what the CLI did, its error, or why it could not run; '' for none. */
      note: ModsNote
      /** The search typed in the cockpit; '' for none. */
      query: string
      /** The filter chosen: all, mod, plugin, hook or off. */
      filter: string
      /** The row whose details unfold under it, by its key; '' for none. */
      selected: string
      /** The CLI calls running and waiting (plan RELAI_MODS, section 8). */
      queue: ModsQueue
      /** The last failed call of a row, by its key: the exit code and the first line. */
      errors: Record<string, string>
      /** The version `claude --version` gave the mod, for the details (R1); '' until asked. */
      cli: string
      /** The disk as this chat loaded it, plugin row key → on: taken at session.start, which /reload-plugins raises again. */
      loaded: Record<string, boolean>
      /** The state a press asked for, by the row's key, true for on: the queue's call skips a row whose disk already holds it (E4). */
      wants: Record<string, boolean>
      /** Raised every few seconds while the pane is open, so its drawing reads the disk again (E4). */
      tick: number
      /** The card of the row "RelAI w tym projekcie" waiting for "Tak": 'on', 'off', or '' for none (ZASIEG_PLUGINU E3). */
      ask: string
    }
  }
}
