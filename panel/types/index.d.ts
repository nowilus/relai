// relai-panel: the values its pane draws from, held by the host in $.state for the session.

/** Which tab of the pane shows: the command forms, the cheat sheet, the session phrases, the costs, the map. */
export type PanelView = 'commands' | 'sheet' | 'phrases' | 'costs' | 'map'

declare module 'claude-code' {
  interface PluginState {
    'relai-panel': {
      view: PanelView
      /** The command whose form is open, without slash or plugin prefix; '' for none. */
      selected: string
      /** Form values keyed "<command>:<field>". */
      values: Record<string, string>
      /** The cheat sheet's search text. */
      query: string
      /** What the person typed into a phrase template, keyed by the phrase. */
      fills: Record<string, string>
      /** The last thing the pane sent, or why it could not: shown under the forms. */
      sent: string
      /** The control pressed in the last moment (FLASH_MS): its card flashes; '' for none. */
      pressed: string
      /** Each subagent's crew task, "run/task", keyed by agent id (E4: the collector's tag). */
      agentTasks: Record<string, string>
      /** What the map shows unfolded: "plan:<name>" and "stage:<plan>/<EN>"; a plan absent from it
       * takes its default (the active plan open, the rest folded). */
      unfolded: Record<string, boolean>
      /** The crew tasks picked on the map to merge or to give a stage, "<run>/<task or group>". */
      picks: string[]
    }
  }
}
