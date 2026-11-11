// relai-browser: the values its pane draws from, held by the host in $.state for the session.
// The validator reads this contract on its own, without the imports of the module.

/** One picture the mod handled in this session, newest last. */
export type BrowserShrink = {
  /** The tool that returned the picture. */
  tool: string
  /** Width and height before, in px. */
  w: number
  h: number
  /** Width and height after, in px; equal to before when the picture passed unchanged. */
  nw: number
  nh: number
  /** Estimated picture tokens before and after (ceil(w*h/750), longer side capped at 1568). */
  before: number
  after: number
  /** shrunk | same | full | webp | failed */
  outcome: string
}

declare module 'claude-code' {
  interface PluginState {
    'relai-browser': {
      /** The pictures handled in this session, the last 50. */
      shrinks: BrowserShrink[]
      /** Why the mod does not shrink now ('' when it does): sleeping twin, no consent, no person, no tool on this system. */
      idle: string
    }
  }
}
