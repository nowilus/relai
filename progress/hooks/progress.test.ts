import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND as LOOK, BAR, THEME } from './core/theme.mjs'
import { agentCost } from './core/agents.mjs'
import { parseRecords } from './core/measure.mjs'
import { parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import { usd } from './fmt'
import { calmLine } from './segments'
import type { Item } from './core/progress.mjs'

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
const AGENT2 = 'b7e01f22c9d4a8e13'
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
  let spawns = 0
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: spawns++ === 0 ? AGENT : AGENT2 }))
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

async function spawn2($: Engine) {
  await $.agent.spawn({ subagentType: 'Explore', description: 'Druga sonda', prompt: 'y' } as never).catch(() => undefined)
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

  // Brief v2 (STYL_PASKOW_CLAUDE.md, 3 and 5): a soft background, the label column, the segments
  // across the middle and `a/b` + unit on the right; the stage's name stands in the plan bar
  // (brief 2), so this bar no longer repeats it, and no percent with hundredths
  test('shows the stage as a bar of segments, one per box in its own state, and `a/b punktów` on the right, on both surfaces', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const card = await ui.find({ key: 'relai-progress-card' })
      const props = card?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string }
      expect(props.backgroundColor).toBe(LOOK.progress.bg)
      expect(props.borderStyle).toBe(surface === 'desktop' ? 'round' : undefined)
      if (surface === 'desktop') expect(props.borderColor).toBe(LOOK.progress.bg) // corners only, no colored frame
      expect((await ui.find({ key: 'label' }))?.text).toBe(LOOK.progress.label)
      expect((await ui.find({ key: 'label' }))?.props.width).toBe(BAR.labelColumn)
      expect(await ui.find({ key: 'title' })).toBeUndefined()
      expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
      expect(textOf(await ui.drawn())).not.toContain('%')
      expect(await segmentStates($, ui, surface, 4)).toEqual(['done', 'done', 'pending', 'pending'])
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('a box ticked by hand in the prompt file moves the count and its own segment at the next tick (positive control)', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    await start($)
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('3/4 punktów')
    expect(await segmentStates($, ui, 'desktop', 4)).toEqual(['done', 'done', 'done', 'pending'])
    await ui.unmount()
  })

  // Brief v2, 3: a small line under the segments in the same Svg — calm `następny: …` in BAR.muted,
  // a hovered segment's `<mark> i/N · <name>` in BAR.text; the segments never hide under it
  test('under the segments a constant small line: the next item in calm, the hovered item\'s mark, place and name', async ($, on) => {
    world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const svgs = [...walkNodes(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg')
    expect(svgs.length).toBe(1)
    const props = ((svgs[0] as { props?: Record<string, unknown> }).props ?? {})
    expect(props.isInteractive).toBe(true)
    expect(props.height).toBe(26) // segments 8 px + gap 4 px + line 14 px
    const source = String(props.source ?? '')
    expect(source).toMatch(/^<svg [^>]*width="100%"[^>]*height="26"/) // a width in the markup (P-020, 7)
    expect(source).toContain('font-size:11.5px')
    // calm: one line in the muted color
    expect(source).toContain(`<text class="d" x="0" y="23" fill="${BAR.muted}">następny: trzy</text>`)
    // hover: one line per segment in the text color, hidden until its own segment is hovered
    expect(source).toContain(`<text class="t t0" x="0" y="23" fill="${BAR.text}">✓ 1/4 · jeden</text>`)
    expect(source).toContain(`<text class="t t3" x="0" y="23" fill="${BAR.text}">○ 4/4 · cztery</text>`)
    expect(source).toContain('.b0:hover~.t0')
    // what hover hides is the calm line alone, never a segment
    const hidden = [...source.matchAll(/([^{}]+)\{display:none\}/g)].map((m) => m[1] ?? '')
    expect(hidden.join(',').split(',').map((s) => s.trim()).filter((s) => s !== '.t' && !s.endsWith('~.d'))).toEqual([])
    await ui.unmount()

    // the terminal draws the calm line as text under the segments
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await term.find({ key: 'line' }))?.text).toBe('następny: trzy')
    await term.unmount()
  })

  test('the figure is `a/b` and its unit for every count: one box is "punktu", a crew\'s tasks are "zadań"', async ($, on) => {
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: '- [ ] jedyny\n' })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('0/1 punktu')
    await ui.unmount()
  })

  // Brief v2, 1: "punkt właśnie odhaczony" opens a second row under this bar alone, for 10 s
  test('a box just ticked opens a second row `✓ i/N · name` for 10 s, then the row is gone', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect(await ui.find({ key: 'ticked' })).toBeUndefined() // boxes ticked before the session are no news
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000) // the tick at 10 s reads the file
    expect((await ui.find({ key: 'ticked' }))?.text).toBe('✓ 3/4 · trzy')
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await term.find({ key: 'ticked' }))?.text).toBe('✓ 3/4 · trzy')
    await term.unmount()
    await clock.advance(8_000) // 19 s: still within its 10 s
    expect(await ui.find({ key: 'ticked' })).toBeDefined()
    await clock.advance(2_000) // 21 s: past them
    expect(await ui.find({ key: 'ticked' })).toBeUndefined()
    expect(await ui.find({ key: 'figure' })).toBeDefined() // the bar itself stays
    await ui.unmount()
  })

  test('in calm the bar holds no button at all, with relai-panel running and with agents', async ($, on) => {
    world(on, FILES)
    on('command.list', () => ({ value: [{ name: 'relai-panel', description: 'Panel RelAI', source: 'plugin' as const }] }))
    await start($)
    await spawn($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect(await ui.find({ key: 'figure' })).toBeDefined() // the bar is there at all
      expect(await ui.findAll({ type: 'Button' })).toEqual([])
      await ui.unmount()
    }
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

  // The run's name is no longer a row of its own (one row in calm, brief v2): its unit says
  // "zadań", and the Svg's description and the agents pane name the run
  test('a live /relai-crew run wins over the stage', async ($, on) => {
    world(on, {
      ...FILES,
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/zadania.json`]: JSON.stringify([{ id: 'a' }, { id: 'b' }]),
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/manifest.json`]: JSON.stringify({ updatedAt: '2026-10-09T11:30:00Z', tasks: [{ id: 'a', status: 'done' }] }),
    })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('1/2 zadań')
    expect(await ui.find({ key: 'seg-a' })).toBeDefined()
    expect(await ui.find({ key: 'seg-b' })).toBeDefined()
    await ui.unmount()
    const desk = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const svg = [...walkNodes(await desk.drawn())].find((x) => typeof x !== 'string' && x.type === 'Svg')
    expect(String(((svg as { props?: { alt?: string } } | undefined)?.props ?? {}).alt)).toContain('załoga 2026-10-09_110000')
    await desk.unmount()
  })

  test('a session whose shell stands in a subfolder still finds the project root (E9, P-021)', async ($, on) => {
    world(on, FILES, `${CWD}/.claude/relai/work/PANEL_CLAUDE/E9`)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
    await ui.unmount()
  })

  test('boxes ticked out of order light exactly their own segments, and the count follows the same list (brief, 6)', async ($, on) => {
    const prompt = Array.from({ length: 10 }, (_, i) => `- [${[2, 5, 9].includes(i + 1) ? 'x' : ' '}] Punkt ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const states = await segmentStates($, ui, 'desktop', 10)
    expect(states.flatMap((s, i) => (s === 'done' ? [i + 1] : []))).toEqual([2, 5, 9])
    expect((await ui.find({ key: 'figure' }))?.text).toBe('3/10 punktów')
    await ui.unmount()
  })

  test('every box keeps its segment, forty included; the terminal wraps them rather than drop any', async ($, on) => {
    const prompt = Array.from({ length: 40 }, (_, i) => `- [ ] Zadanie numer ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    const desk = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND(140) })
    expect((await segmentStates($, desk, 'desktop', 40)).length).toBe(40)
    expect((await desk.find({ key: 'figure' }))?.text).toBe('0/40 punktów')
    await desk.unmount()
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND(40) })
    expect(await term.find({ key: 'seg-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#40' })).toBeDefined()
    await term.unmount()
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

  test('nothing is wider than 40 columns, with and without agents, with a box just ticked', async ($, on) => {
    const long = 'Bardzo długa nazwa punktu, który właśnie został odhaczony w prompcie etapu i nie mieści się w czterdziestu kolumnach'
    const { disk, clock } = world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: PROMPT.replace('trzy', long) })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND(40) })
    const card = await ui.find({ key: 'relai-progress-card' })
    expect(card).toBeDefined()
    expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
    await ui.unmount()
    await spawn($)
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', `- [x] ${long}`)
    await clock.advance(11_000)
    for (const surface of ['terminal', 'desktop'] as const) {
      const narrow = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(40) })
      expect(await narrow.find({ key: 'agents-chip' })).toBeDefined()
      expect(await narrow.find({ key: 'ticked' })).toBeDefined()
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
    // Brief v2, 3: a chip `● N agentów · $x` beside the segments instead of the "Agenci" button,
    // its cost the pane's own sum (computed by hand below: $0.03)
    for (const surface of ['terminal', 'desktop'] as const) {
      const band = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect((await band.find({ key: 'agents-chip' }))?.text).toBe('● 1 agent · $0.03')
      expect(await band.find({ key: 'agents-btn' })).toBeUndefined()
      await band.unmount()
    }
    await spawn2($)
    const two = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    // The second one has no records yet: the sum is partial and says so
    expect((await two.find({ key: 'agents-chip' }))?.text).toBe('● 2 agentów · ≥ $0.03')
    await two.unmount()

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
    await $.turn.complete({ answer: 'raport', durationMs: 5000, isAborted: false, turnId: 'tb', agentId: AGENT2, reason: 'answer' } as never)
    // None runs any more: the chip keeps the count and the cost, its mark says they finished
    const ended = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ended.find({ key: 'agents-chip' }))?.text).toBe('✓ 2 agentów · ≥ $0.03')
    await ended.unmount()
  })

  // Measured in Chromium (2026-10-10): beside 14 segments in 40 columns the Svg is ~70 px wide and
  // its line ran out of it; the chip goes on a row of its own instead, the segments keep the width
  test('the chip stands beside the segments when both fit, on a row of its own under them when not', async ($, on) => {
    const prompt = Array.from({ length: 14 }, (_, i) => `- [ ] Punkt ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    await spawn($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const wide = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(140) })
      expect(await wide.find({ key: 'agents-chip' })).toBeDefined()
      expect(await wide.find({ key: 'chip-row' })).toBeUndefined()
      await wide.unmount()
      const narrow = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(40) })
      expect((await narrow.find({ key: 'chip-row' }))?.text).toContain('1 agent')
      expect(minWidth(await narrow.drawn())).toBeLessThanOrEqual(40)
      await narrow.unmount()
    }
  })

  test('no agents chip in a session without subagents', async ($, on) => {
    world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect(await ui.find({ key: 'figure' })).toBeDefined()
    expect(await ui.find({ key: 'agents-chip' })).toBeUndefined()
    await ui.unmount()
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

  // AUDYT_MODOW Z5 (CODE-01, CODE-11): the agents pane prices with the project's saved price list,
  // the same way the Costs tab of relai-panel does (priceAt over priceLists of cennik.json)
  test('an agent on a model only cennik.json prices costs what the Costs tab counts for it, with the list\'s date in the caption', async ($, on) => {
    // Rates per million tokens; the file's own cache rates, so no multiplier is involved
    const PRICES = JSON.stringify({ v: 1, versions: [{
      date: '2026-10-09', source: 'test', from: NOW - 60_000,
      models: { 'claude-sonnet-5-5': { input: 3, output: 15, read: 0.3, write5m: 3.75, write1h: 6 } },
    }] })
    const sonnet = (index: number) => rec(AGENT, index, 200_000, 20_000).replace('claude-opus-5-5', 'claude-sonnet-5-5')
    const measured = [sonnet(0), sonnet(1)].join('\n') + '\n'
    const { n } = world(on, { ...FILES, [MEASURE]: measured, [`${CWD}/.claude/relai/panel/cennik.json`]: PRICES })
    await start($)
    await spawn($)
    // What the Costs tab computes for the same records (panel/hooks/register.tsx, priceWith)
    const lists = priceLists(parsePriceFile(PRICES).versions)
    const expected = agentCost(parseRecords(measured).records, AGENT, (r) => priceAt(r, lists))
    // By hand, a subagent's write lives 5 minutes: input 400 000 x $3 + read 20 000 x $0.3
    // + write 4 000 x $3.75 + output 40 000 x $15 = 1 200 000 + 6 000 + 15 000 + 600 000
    // = 1 821 000 per million = $1.821 → "$1.82"
    expect(Math.abs((expected?.usd ?? 0) - 1.821)).toBeLessThan(1e-9)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...PANE() })
      const card = (await ui.find({ key: `agent-${AGENT}` }))?.text ?? ''
      expect(card).toContain(usd(expected?.usd ?? null))
      expect(card).toContain('$1.82')
      expect(card).not.toContain('brak ceny')
      expect(textOf(await ui.drawn())).toContain('cennik z 2026-10-09')
      await ui.unmount()
    }
    // A redraw does not read the price file again: its stamp has not moved
    const reads = n.read
    const again = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    expect(((await again.find({ key: `agent-${AGENT}` }))?.text ?? '')).toContain('$1.82')
    expect(n.read).toBe(reads)
    await again.unmount()
  })

  test('with cennik.json saved, a model in neither list stays "brak ceny dla …"', async ($, on) => {
    const PRICES = JSON.stringify({ v: 1, versions: [{
      date: '2026-10-09', source: 'test', from: NOW - 60_000,
      models: { 'claude-sonnet-5-5': { input: 3, output: 15 } },
    }] })
    const unknown = (index: number) => rec(AGENT, index, 100, 50).replace('claude-opus-5-5', 'claude-nowy-9-9')
    world(on, { ...FILES, [MEASURE]: [unknown(0), unknown(1)].join('\n') + '\n', [`${CWD}/.claude/relai/panel/cennik.json`]: PRICES })
    await start($)
    await spawn($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const card = (await ui.find({ key: `agent-${AGENT}` }))?.text ?? ''
    expect(card).toContain('brak ceny dla')
    expect(card).not.toContain('$')
    await ui.unmount()
  })

  test('an unreadable cennik.json prices with the built-in list and says the error in words', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n', [`${CWD}/.claude/relai/panel/cennik.json`]: '{ to nie json' })
    await start($)
    await spawn($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const text = textOf(await ui.drawn())
    expect(text).toContain('.claude/relai/panel/cennik.json nie jest JSON-em')
    expect(text).toContain('cennik z 2026-10-08')
    // opus 5.5 is in the built-in list: 100 x 4 + 10 000 x 0.2 + 2 000 x 5 + 50 x 20 = 13 400 per million
    expect(((await ui.find({ key: `agent-${AGENT}` }))?.text ?? '')).toContain('$0.01')
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
    expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
    const before = { read: n.read, lists }
    await clock.advance(5 * 60_000)
    expect(n.read - before.read).toBe(0)
    await ui.unmount()
    // The bar no longer asks the session's commands at all: the "Panel RelAI" button that needed
    // them left it (brief v2, 3), so neither the ticks nor a drawing call $.command.list()
    const again = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect(await again.find({ key: 'figure' })).toBeDefined()
    expect(lists).toBe(0)
    // Positive control on the same instrument: a box ticked by hand is read at the next tick
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000)
    expect(n.read - before.read).toBeGreaterThan(0)
    expect((await again.find({ key: 'figure' }))?.text).toBe('3/4 punktów')
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
    expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
    await clock.settle()
    expect((await ui.find({ key: 'figure' }))?.text).toBe('3/4 punktów')
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
    expect((await ui.find({ key: 'figure' }))?.text).toBe('1/2 zadań')
    await clock.advance(20 * 60_000)
    expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
    await ui.unmount()
  })
})

describe('the line under the segments says the item in progress and the next one (brief v2, 3)', () => {
  const item = (status: Item['status'], name: string): Item => ({ id: name, label: name, name, status })
  test('an item in progress leads; without one, only the next; with none left, words', () => {
    expect(calmLine([item('done', 'a'), item('running', 'b'), item('pending', 'c')])).toBe('w toku: b · następny: c')
    expect(calmLine([item('done', 'a'), item('pending', 'c'), item('pending', 'd')])).toBe('następny: c')
    expect(calmLine([item('done', 'a'), item('running', 'b')])).toBe('w toku: b')
    expect(calmLine([item('done', 'a')])).toBe('wszystkie punkty odhaczone')
  })
})
