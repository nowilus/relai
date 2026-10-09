// relai-panel: the values its pane draws from, held by the host in $.state for the session.

// Shapes of core/panel/decisions.mjs, written out: the contract must be self-contained (no import)
export type PanelFact = { label: string, value: string, tone?: 'ok' | 'warn' }
export type PanelAction = { kind: 'clear' } | { kind: 'command', command: string, args: string } | { kind: 'submit', text: string }
  | { kind: 'write', path: string, text: string }
export type PanelCard = { id: string, title: string, facts: PanelFact[], question: string,
  second: { question: string, facts: PanelFact[] } | null, actions: PanelAction[], state: 'open' | 'second' | 'confirmed' | 'cancelled',
  /** E6: the page the first "Tak" reads to build the second step (only the Anthropic pricing page); null for any other card. */
  fetch: string | null }
export type PanelCleanChoices = { groups: { id: string, name: string, bytes: number, count: number, question: string, isPicked: boolean }[],
  kept: { path: string, reason: string }[], error: string }
export type PanelCrewDraft = { run: string, tasks: { id: string, title: string, files: string[], dependsOn: string[], role: string, runtime: string, model: string }[],
  isEditable: boolean, reason: string }

/** Which tab of the pane shows: the command forms, the cheat sheet, the session phrases, the costs, the map, the documents. */
export type PanelView = 'commands' | 'sheet' | 'phrases' | 'costs' | 'map' | 'docs'

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
      /** The confirmation card waiting for "Tak" / "Nie" (E5, R4); null when none. */
      confirm: PanelCard | null
      /** The chat a stage starts in from the pane: true = /clear after "Tak", then the stage. */
      freshChat: boolean
      /** /relai-clean's groups read from the clean report, with what the person picked; null until loaded. */
      cleanList: PanelCleanChoices | null
      /** Crew drafts being edited before the start, keyed by run. */
      drafts: Record<string, PanelCrewDraft>
      /** E6, Aneks D: models whose "bez ceny" reminder the person turned down, keyed by model, with
       * the date of the price list it was turned down under; a new list date shows it again. */
      muted: Record<string, string>
      /** E6, Aneks E: the document open under the shelf, "<group>|<path>" (the group it was opened
       * from, so its window stands under that group); '' for none. */
      docPick: string
      /** What the open document shows: its changes since the last commit, or the document itself. */
      docMode: 'diff' | 'preview'
      /** "changed": the edited documents on top and every group folded; "all": the groups open. */
      docFilter: 'changed' | 'all'
      /** The shelf as tiles in RelAI groups, or as a file tree by folder. */
      docLayout: 'tiles' | 'tree'
    }
  }
}
