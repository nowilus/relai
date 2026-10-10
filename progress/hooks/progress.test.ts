import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND as LOOK, BAR, THEME } from './core/theme.mjs'

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = Date.parse('2026-10-09T12:00:00Z')
const SETTINGS = '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n'
const CLAUDE = '# CLAUDE\n\nAktywny plan: [PANEL_CLAUDE](docs/plany/PANEL_CLAUDE/STATUS.md) — panel\n'
const STATUS = [
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-08**',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E3 | Kolektor | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | |',
  '| E9 | Postęp pracy i agenci na żywo | W TOKU | [PROMPT_ETAP_9.md](PROMPT_ETAP_9.md) | |',
].join('\r\n')
const PROMPT = '## Weryfikacja\n\n- [x] jeden\n- [x] dwa\n- [ ] trzy\n- [ ] cztery\n'
const AGENT = 'a2cdd79804dae736c'
const SESSION = 'session-1'
const MEASURE = `${CWD}/.claude/relai/pomiary/2026-10-09-${SESSION}.jsonl`

const rec = (agent: string | null, index: number, input: number, output: number) => JSON.stringify({
  v: 1, tool: 'claude-code', session: SESSION, turn: agent ? 'ta' : 'tm', index, agent, kind: 'step', model: 'claude-opus-5-5', at: NOW,
  input, cacheRead: 10_000, cacheWrite: 2_000, output, missing: null,
})

const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: SETTINGS,
  [`${CWD}/CLAUDE.md`]: CLAUDE,
  [`${CWD}/docs/plany/PANEL_CLAUDE/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: PROMPT,
}

const BAND = (bodyColumns = 140) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})
const PANE = (bodyColumns = 100) => ({
  component: 'Pane' as const, requestId: 'relai-agents',
  props: { title: 'Agenci RelAI', isFocused: true, bodyColumns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
})

function world(on: On, files: Record<string, string>, here = CWD) {
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const n = { read: 0, stat: 0 } // what the idle ticks cost (AUDYT_MODOW Z4)
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: here }))
  on('session.id', () => ({ value: SESSION }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => { n.read += 1; return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path } })
  // A file's time moves with its text: the same text, the same stamp
  const stampOf = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  on('fs.stat', ($, e) => {
    n.stat += 1
    const k = key(e.path)
    if (k in disk) return { value: { kind: 'file' as const, size: (disk[k] ?? '').length, mtimeMs: stampOf(disk[k] ?? ''), isLink: false } }
    const below = Object.keys(disk).filter((p) => p.startsWith(k + '/'))
    if (below.length) return { value: { kind: 'dir' as const, size: 0, mtimeMs: stampOf(below.join('|')), isLink: false } }
    return { deny: 'ENOENT ' + e.path }
  })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return { value: names.map((n) => ({ name: n, kind: below.includes(n) ? 'file' as const : 'dir' as const, size: 1, mtimeMs: 0, isLink: false })) }
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
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  return { disk, clock, n }
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The narrowest the tree can be drawn, in columns (panel/hooks/theme.test.ts, the same instrument)
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : minWidth(textOf(node))
  if (node.type !== 'Box') return 0
  const kids = ((node as { children?: RenderNode[] }).children ?? []).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(minWidth)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, kids.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return inner + padX + (p.borderStyle ? 2 : 0)
}

// The state of each segment as drawn: on the desktop from the fills of the Svg source, in the
// terminal from the color of each segment's text; a color maps back through BAR.segment
type Mounted = Awaited<ReturnType<Engine['ui']['mount']>>
const STATE_OF = new Map(Object.entries(BAR.segment).reverse().map(([state, color]) => [color, state]))
function* walkNodes(node: RenderNode): Generator<RenderNode> {
  if (typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walkNodes(k)
}
async function segmentStates(_: Engine, ui: Mounted, surface: 'terminal' | 'desktop', n: number): Promise<string[]> {
  if (surface === 'desktop') {
    // A key does not survive on an Svg (as on a Text, P-017): the segments are the Svg of the card
    const svgs = [...walkNodes(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg')
    expect(svgs.length).toBe(1)
    const source = String(((svgs[0] as { props?: { source?: string } }).props ?? {}).source ?? '')
    const fills = [...source.matchAll(/<rect class="c" [^>]*fill="(#[0-9a-f]+)"/g)].map((m) => m[1] ?? '')
    expect(fills.length).toBe(n)
    return fills.map((f) => STATE_OF.get(f) ?? 'unknown?')
  }
  const texts = [...walkNodes(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Text' && /^█+$/.test(textOf(x)))
  expect(texts.length).toBe(n)
  return texts.map((t) => STATE_OF.get(String(((t as { props?: { color?: string } }).props ?? {}).color)) ?? 'unknown?')
}

async function spawn($: Engine) {
  await $.agent.spawn({ subagentType: 'Explore', description: 'Sonda agenta', prompt: 'x' } as never).catch(() => undefined)
}

async function agentStep($: Engine, index: number) {
  const s = $.turn.step({ turnId: 'ta', index, model: 'claude-opus-5-5', messageCount: 1, agentId: AGENT })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

describe('the progress card above the prompt', () => {
  test('stays silent outside a RelAI project and keeps what is beneath', async ($, on) => {
    world(on, { [`${CWD}/docs/USTAWIENIA.md`]: '# inny projekt\n' })
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect(await ui.find({ key: 'relai-progress-card' })).toBeUndefined()
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  // STYL_PASKOW_CLAUDE.md (2026-10-09): a soft background, the label column, a tile per box, the percent on the right
  // Calibration 2026-10-09 ("Pola i segmenty"): one bar cut into a segment per box, in the color of
  // its own state, the count and the percent at its end; a soft background, no colored frame
  test('shows the stage as a bar of segments, one per box in its own state, the count and percent at its end, on both surfaces', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const card = await ui.find({ key: 'relai-progress-card' })
      const props = card?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string }
      expect(props.backgroundColor).toBe(LOOK.progress.bg)
      expect(props.borderStyle).toBe(surface === 'desktop' ? 'round' : undefined)
      if (surface === 'desktop') expect(props.borderColor).toBe(LOOK.progress.bg) // corners only, no colored frame
      expect((await ui.find({ key: 'label' }))?.text).toBe('RelAI · postęp')
      expect((await ui.find({ key: 'title' }))?.text).toBe('E9 · Postęp pracy i agenci na żywo')
      expect((await ui.find({ key: 'words' }))?.text).toBe('2 z 4 · 50.00%')
      expect(await segmentStates($, ui, surface, 4)).toEqual(['done', 'done', 'pending', 'pending'])
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('a box ticked by hand in the prompt file moves the percent and its own segment at the next tick (positive control)', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    await start($)
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'words' }))?.text).toBe('3 z 4 · 75.00%')
    expect(await segmentStates($, ui, 'desktop', 4)).toEqual(['done', 'done', 'done', 'pending'])
    await ui.unmount()
  })

  test('without a source it says so in words and draws no bar', async ($, on) => {
    world(on, { ...FILES, [`${CWD}/CLAUDE.md`]: 'Aktywny plan: brak\n' })
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect((await ui.find({ key: 'words' }))?.text).toBe('praca poza planem — brak źródła postępu')
      const drawn = [...walkNodes(await ui.drawn())]
      expect(drawn.filter((x) => typeof x !== 'string' && x.type === 'Svg').length).toBe(0)
      expect(textOf(await ui.drawn())).not.toContain('█')
      await ui.unmount()
    }
  })

  test('a live /relai-crew run wins over the stage', async ($, on) => {
    world(on, {
      ...FILES,
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/zadania.json`]: JSON.stringify([{ id: 'a' }, { id: 'b' }]),
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/manifest.json`]: JSON.stringify({ updatedAt: '2026-10-09T11:30:00Z', tasks: [{ id: 'a', status: 'done' }] }),
    })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'title' }))?.text).toContain('załoga 2026-10-09_110000')
    expect((await ui.find({ key: 'words' }))?.text).toBe('1 z 2 · 50.00%')
    expect(await ui.find({ key: 'seg-a' })).toBeDefined()
    expect(await ui.find({ key: 'seg-b' })).toBeDefined()
    await ui.unmount()
  })

  test('a session whose shell stands in a subfolder still finds the project root (E9, P-021)', async ($, on) => {
    world(on, FILES, `${CWD}/.claude/relai/work/PANEL_CLAUDE/E9`)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'words' }))?.text).toBe('2 z 4 · 50.00%')
    await ui.unmount()
  })

  test('boxes ticked out of order light exactly their own segments, and the count follows the same list (brief, 6)', async ($, on) => {
    const prompt = Array.from({ length: 10 }, (_, i) => `- [${[2, 5, 9].includes(i + 1) ? 'x' : ' '}] Punkt ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const states = await segmentStates($, ui, 'desktop', 10)
    expect(states.flatMap((s, i) => (s === 'done' ? [i + 1] : []))).toEqual([2, 5, 9])
    expect((await ui.find({ key: 'words' }))?.text).toBe('3 z 10 · 30.00%')
    await ui.unmount()
  })

  test('every box keeps its segment, forty included; the terminal wraps them rather than drop any', async ($, on) => {
    const prompt = Array.from({ length: 40 }, (_, i) => `- [ ] Zadanie numer ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    const desk = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND(140) })
    expect((await segmentStates($, desk, 'desktop', 40)).length).toBe(40)
    expect((await desk.find({ key: 'words' }))?.text).toBe('0 z 40 · 0.00%')
    await desk.unmount()
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND(40) })
    expect(await term.find({ key: 'seg-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#40' })).toBeDefined()
    await term.unmount()
  })

  test('"Panel RelAI" in the bottom-right corner opens relai-panel\'s pane through its command, only when that plugin runs', async ($, on) => {
    world(on, FILES)
    const ran: string[] = []
    on('command.list', () => ({ value: [{ name: 'relai-panel', description: 'Panel RelAI', source: 'plugin' as const }] }))
    on('command.run', ($, e) => { ran.push(e.command); return { text: 'ok' } })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect(await ui.find({ key: 'open-panel' })).toBeDefined()
    await ui.press({ key: 'open-panel' })
    expect(ran).toEqual(['relai-panel'])
    await ui.unmount()
  })

  test('no "Panel RelAI" button when relai-panel does not run in the session', async ($, on) => {
    world(on, FILES)
    on('command.list', () => ({ value: [] }))
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect(await ui.find({ key: 'words' })).toBeDefined() // the bar is there at all
    expect(await ui.find({ key: 'open-panel' })).toBeUndefined()
    await ui.unmount()
  })

  test('a gap apart from the cards beneath on the desktop, none in the terminal (each row counts there)', async ($, on) => {
    world(on, FILES)
    await start($)
    const gapOf = async (surface: 'terminal' | 'desktop') => {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const wrap = await ui.find({ key: 'relai-progress' })
      await ui.unmount()
      return (wrap?.props as { gap?: number } | undefined)?.gap
    }
    expect(await gapOf('desktop')).toBe(1)
    expect(await gapOf('terminal')).toBe(0)
  })

  test('nothing is wider than 40 columns, with and without agents', async ($, on) => {
    world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND(40) })
    const card = await ui.find({ key: 'relai-progress-card' })
    expect(card).toBeDefined()
    await ui.unmount()
    await spawn($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const narrow = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(40) })
      const drawn = await narrow.drawn()
      expect(minWidth(drawn)).toBeLessThanOrEqual(40)
      await narrow.unmount()
      const pane = await $.ui.mount({ plugin: 'relai-progress', surface, ...PANE(40) })
      expect(minWidth(await pane.drawn())).toBeLessThanOrEqual(40)
      await pane.unmount()
    }
  })
})

describe('the agents pane', () => {
  test('an agent spawned shows as running, then finished, with its cost from the measurements', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: [rec(null, 0, 500, 300), rec(AGENT, 0, 100, 50), rec(AGENT, 1, 200, 80)].join('\n') + '\n' })
    await start($)
    await spawn($)
    await agentStep($, 0)
    const band = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    // States in words and marks, never "0/2" that reads as "none of two done" (calibration 2026-10-09)
    expect((await band.find({ key: 'agents-btn' }))?.props.label).toBe('Agenci ● 1 działa')
    await band.unmount()

    // A row of margin between the head with "Agenci" and the segments on a desktop: a native button
    // is taller than a line and touched the bar (calibration 2026-10-09); none on the terminal
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await gui.find({ key: 'head' }))?.props.marginBottom).toBe(1)
    await gui.unmount()
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await term.find({ key: 'head' }))?.props.marginBottom ?? 0).toBe(0)
    await term.unmount()

    const live = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const card = await live.find({ key: `agent-${AGENT}` })
    expect((card?.text ?? "")).toContain('● działa')
    expect((card?.text ?? "")).toContain('Sonda agenta')
    expect((card?.text ?? "")).toContain('claude-opus-5-5')
    // opus 5.5 at $4 / $20 per million, read x0.05, a subagent's write x1.25:
    // (100 + 200) * 4 + 2 * 10000 * 0.2 + 2 * 2000 * 5 + (50 + 80) * 20 = 1200 + 4000 + 20000 + 2600 = 27800 per million
    expect((card?.text ?? "")).toContain('$0.03')
    await live.unmount()

    await $.turn.complete({ answer: 'raport', durationMs: 5000, isAborted: false, turnId: 'ta', agentId: AGENT, reason: 'answer' } as never)
    const after = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const done = ((await after.find({ key: `agent-${AGENT}` }))?.text ?? "")
    expect(done).toContain('✓ zakończony')
    expect(done).toContain('$0.03')
    expect(textOf(await after.drawn())).toContain('1 zakończonych')
    await after.unmount()
    const ended = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ended.find({ key: 'agents-btn' }))?.props.label).toBe('Agenci ✓ 1')
    await ended.unmount()
  })

  test('no measurement file is "brak pomiaru", never $0', async ($, on) => {
    world(on, FILES)
    await start($)
    await spawn($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const text = textOf(await ui.drawn())
    expect(text).toContain('brak pomiaru')
    expect(text).toContain('relai-panel jej nie mierzy')
    expect(text).not.toContain('$0')
    await ui.unmount()
  })

  test('an agent on a model outside the price list is "brak ceny", not "brak pomiaru" (live 2026-10-09)', async ($, on) => {
    const sonnet = (index: number) => rec(AGENT, index, 100, 50).replace('claude-opus-5-5', 'claude-sonnet-5-5')
    world(on, { ...FILES, [MEASURE]: [sonnet(0), sonnet(1)].join('\n') + '\n' })
    await start($)
    await spawn($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const card = (await ui.find({ key: `agent-${AGENT}` }))?.text ?? ''
    expect(card).toContain('brak ceny')
    expect(card).not.toContain('brak pomiaru')
    expect(card).not.toContain('$0')
    await ui.unmount()
  })

  test('the pane speaks the RelAI motif: a heading per section, the cards in the theme of relai-panel', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    await start($)
    await spawn($)
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const text = textOf(await term.drawn())
    expect(text).toContain('Postęp etapu')
    expect(text).toContain('Agenci sesji')
    await term.unmount()
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const card = await gui.find({ key: `agent-${AGENT}` })
    expect(card?.props.backgroundColor).toBe(THEME.card)
    expect(card?.props.borderStyle).toBe('round')
    expect(await gui.find({ key: 'tasks-card' })).toBeDefined()
    await gui.unmount()
  })
})

describe('the progress mod idles quietly (AUDYT_MODOW Z4)', () => {
  test('five idle minutes: the ticks look at the files\' times and read nothing; a changed file is read at the next tick', async ($, on) => {
    const { disk, clock, n } = world(on, FILES)
    let lists = 0
    on('command.list', () => { lists += 1; return { value: [{ name: 'relai-panel', description: 'Panel RelAI', source: 'plugin' as const }] } })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'words' }))?.text).toBe('2 z 4 · 50.00%')
    const before = { read: n.read, lists }
    await clock.advance(5 * 60_000)
    expect(n.read - before.read).toBe(0)
    // Drawing the bar again asks nothing of the session's commands (asked at the start and once
    // a moment later, PANEL_CHECK_MS, outside any drawing)
    expect(lists - before.lists).toBe(1)
    await ui.unmount()
    const again = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect(await again.find({ key: 'open-panel' })).toBeDefined()
    expect(lists - before.lists).toBe(1)
    // Positive control on the same instrument: a box ticked by hand is read at the next tick
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000)
    expect(n.read - before.read).toBeGreaterThan(0)
    expect((await again.find({ key: 'words' }))?.text).toBe('3 z 4 · 75.00%')
    await again.unmount()
  })

  test('an edit does not wait for the progress: the tool returns first, the bar follows', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    on('tool.call', { tool: 'Edit' }, () => ({ result: 'ok' }) as never)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await $.tool.call({ tool: 'Edit', file_path: `${CWD}/x.md`, old_string: 'a', new_string: 'b' } as never)
    // The tool's answer came back before the progress was read: the bar still shows the old count
    expect((await ui.find({ key: 'words' }))?.text).toBe('2 z 4 · 50.00%')
    await clock.settle()
    expect((await ui.find({ key: 'words' }))?.text).toBe('3 z 4 · 75.00%')
    await ui.unmount()
  })
})

describe('a crew run that went quiet leaves the bar (AUDYT_MODOW Z4, review)', () => {
  test('no file moves, yet past its window the run is read again and the stage returns', async ($, on) => {
    const updated = new Date(NOW - (12 * 60 - 10) * 60_000).toISOString() // ten minutes before the window closes
    const { clock } = world(on, {
      ...FILES,
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_000000/zadania.json`]: JSON.stringify([{ id: 'a' }, { id: 'b' }]),
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_000000/manifest.json`]: JSON.stringify({ updatedAt: updated, tasks: [{ id: 'a', status: 'done' }] }),
    })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'title' }))?.text).toContain('załoga')
    await clock.advance(20 * 60_000)
    expect((await ui.find({ key: 'words' }))?.text).toBe('2 z 4 · 50.00%')
    await ui.unmount()
  })
})
