import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, TurnStepResult } from 'claude-code'

// Promises the progress mod keeps per event (AUDYT_MODOW Z7): a subagent's step that changes
// nothing drawn writes no state, and the agents pane drawn again does not parse an unchanged
// measurement file. Counted on the nouns beneath the plugin (`state.set`, `fs.read`); each count
// has its positive control in the same test.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = Date.parse('2026-10-09T12:00:00Z')
const SESSION = 'session-1'
const AGENT = 'a2cdd79804dae736c'
const STRANGER = 'f00dfeedbeef12345' // a subagent this session never saw spawn (spawned before a reload)
const MEASURE = `${CWD}/.claude/relai/pomiary/2026-10-09-${SESSION}.jsonl`
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_CLAUDE](docs/plany/PANEL_CLAUDE/STATUS.md) — panel\n',
  [`${CWD}/docs/plany/PANEL_CLAUDE/STATUS.md`]: '| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n| E9 | Postęp | W TOKU | [PROMPT_ETAP_9.md](PROMPT_ETAP_9.md) | |\n',
  [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: '## Weryfikacja\n\n- [x] jeden\n- [ ] dwa\n',
}

const rec = (agent: string | null, index: number, input: number, output: number) => JSON.stringify({
  v: 1, tool: 'claude-code', session: SESSION, turn: agent ? 'ta' : 'tm', index, agent, kind: 'step', model: 'claude-opus-5-5', at: NOW,
  input, cacheRead: 10_000, cacheWrite: 2_000, output, missing: null,
})

const PANE = {
  component: 'Pane' as const, requestId: 'relai-agents',
  props: { title: 'Agenci RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
}

function world(on: On, files: Record<string, string>) {
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const n = { reads: [] as string[], agentsWrites: 0 }
  // A file's time and size move with its text, in fs.stat and fs.list alike, as on a disk
  const stampOf = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('state.set', ($, e, next) => {
    const ref = e as unknown as { plugin?: string, key?: string }
    if (ref.plugin === 'relai-progress' && ref.key === 'agents') n.agentsWrites += 1
    return next(e)
  })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: SESSION }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => { n.reads.push(key(e.path)); return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path } })
  on('fs.stat', ($, e) => {
    const k = key(e.path)
    if (k in disk) return { value: { kind: 'file' as const, size: (disk[k] ?? '').length, mtimeMs: stampOf(disk[k] ?? ''), isLink: false } }
    return { deny: 'ENOENT ' + e.path }
  })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return {
      value: names.map((name) => {
        const isFile = below.includes(name)
        const text = isFile ? disk[dir + name] ?? '' : ''
        return { name, kind: isFile ? 'file' as const : 'dir' as const, size: text.length, mtimeMs: stampOf(text), isLink: false }
      }),
    }
  })
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.panes', () => ({ value: [] }))
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: AGENT }))
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 50, cache_read_input_tokens: 20_000, cache_creation_input_tokens: 1_000, model: 'claude-opus-5-5' },
    }
    return result
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  return { disk, n }
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

async function step($: Engine, turnId: string, index: number, agentId?: string) {
  const s = $.turn.step({ turnId, index, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

describe('a step writes the agents only when something drawn moved (Z7)', () => {
  test('a stranger agent\'s steps and the main loop\'s write no state; the spawned agent\'s step writes once', async ($, on) => {
    const { n } = world(on, FILES)
    await start($)
    await $.agent.spawn({ subagentType: 'Explore', description: 'Sonda agenta', prompt: 'x' } as never)
    const spawned = n.agentsWrites
    expect(spawned).toBeGreaterThan(0) // the spawn itself is drawn: written
    // Nothing the chip or the pane draws moves: no write
    for (let i = 0; i < 5; i++) await step($, 'tx', i, STRANGER)
    for (let i = 0; i < 5; i++) await step($, 'tm', i)
    expect(n.agentsWrites - spawned).toBe(0)
    // Positive control: a step of the spawned agent moves its drawn count of calls, one write
    await step($, 'ta', 0, AGENT)
    expect(n.agentsWrites - spawned).toBe(1)
  })
})

describe('the agents pane parses the measurements only when the file moved (Z7)', () => {
  test('drawn again over an unchanged file: no read of it; the file grown: one read, the new cost drawn', async ($, on) => {
    const { disk, n } = world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    await start($)
    await $.agent.spawn({ subagentType: 'Explore', description: 'Sonda agenta', prompt: 'x' } as never)
    const measured = () => n.reads.filter((p) => p === MEASURE).length
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE })
    // opus 5.5: 100 x 4 + 10 000 x 0.2 + 2 000 x 5 + 50 x 20 = 13 400 per million = $0.01
    expect((await ui.find({ key: `agent-${AGENT}` }))?.text).toContain('$0.01')
    const before = measured()
    expect(before).toBeGreaterThan(0)
    for (let i = 0; i < 3; i++) {
      await ui.redraw()
      await ui.drawn()
    }
    expect(measured() - before).toBe(0)
    // Positive control: relai-panel appended the agent's next record; the next drawing reads it
    // again, once, and draws the larger cost (13 400 + 400 + 2 000 + 10 000 + 400 000 x 20 =
    // 8 025 800 per million = $8.03)
    disk[MEASURE] = (disk[MEASURE] ?? '') + rec(AGENT, 1, 100, 400_000) + '\n'
    await ui.redraw()
    expect((await ui.find({ key: `agent-${AGENT}` }))?.text).toContain('$8.03')
    expect(measured() - before).toBe(1)
    await ui.unmount()
  })
})
