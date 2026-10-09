// relai-progress: the values its band and pane draw from, held by the host in $.state for the
// session, so a hot reload keeps the agents seen so far (the engine forgets a finished one).
// The shapes are core/panel/agents.mjs AgentRun and core/panel/progress.mjs Progress, spelled out:
// the validator reads this contract on its own, without the imports of the module.

export type AgentStatus = 'running' | 'done' | 'stopped' | 'failed'

export type AgentRunState = {
  id: string
  type: string
  description: string
  model: string
  at: number
  status: AgentStatus
  endedAt: number | null
  steps: number
  context: number
}

export type ItemState = {
  id: string
  label: string
  name: string
  status: 'done' | 'pending' | 'running' | 'failed' | 'unknown'
}

export type ProgressState = {
  kind: 'stage' | 'crew' | 'free'
  title: string
  done: number
  total: number
  percent: number | null
  words: string
  items: ItemState[]
}

declare module 'claude-code' {
  interface PluginState {
    'relai-progress': {
      /** The session's subagents, oldest first, finished ones kept (MAX_AGENTS). */
      agents: AgentRunState[]
      /** How far the work is; null outside a RelAI project. */
      progress: ProgressState | null
      /** The finished agents folded away in the pane. */
      isDoneCollapsed: boolean
    }
  }
}
