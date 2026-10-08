// relai-panel: the values its pane draws from, held by the host in $.state for the session.

/** Which tab of the pane shows: the command forms, the cheat sheet, the session phrases. */
export type PanelView = 'commands' | 'sheet' | 'phrases'

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
    }
  }
}
