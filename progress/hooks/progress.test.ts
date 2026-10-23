import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND as LOOK, BAR, KEY, THEME } from './core/theme.mjs'
import { agentCost } from './core/agents.mjs'
import { parseRecords } from './core/measure.mjs'
import { parsePriceFile, priceAt, priceLists } from './core/pricing.mjs'
import { usd } from './fmt'
import { WINDOW, currentOf, sumWords, windowRows } from './segments'
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

function world(on: On, files: Record<string, string>, here = CWD, ids = { session: SESSION }, beneath = 'engine') {
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const n = { read: 0, stat: 0 } // what the idle ticks cost (AUDYT_MODOW Z4)
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: here }))
  on('session.id', () => ({ value: ids.session }))
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
    return Box({ key: beneath, children: [Text({ children: [beneath] })] })
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

// The state of each segment as drawn: on the desktop from the ink class of each segment in the Svg
// source, in the terminal from the theme key of each segment's text (WYGLAD_PANELU E1)
type Mounted = Awaited<ReturnType<Engine['ui']['mount']>>
const STATE_OF = new Map([['done', 'done'], ['track', 'pending'], ['running', 'running'], ['failed', 'failed'],
  [KEY.done, 'done'], [KEY.muted, 'pending'], [KEY.running, 'running'], [KEY.failed, 'failed']])
// The segments are the Svg of rects painted by ink class (WYGLAD_PANELU E2); the marks of the list
// are Svg of 16 px, the rule above the card (variant 3b) an image of a gradient
const isMarks = (x: RenderNode) => typeof x !== 'string'
  && String((x as { props?: { source?: string } }).props?.source ?? '').includes('<rect class="f-')
function* walkNodes(node: RenderNode): Generator<RenderNode> {
  if (typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walkNodes(k)
}
async function segmentStates(_: Engine, ui: Mounted, surface: 'terminal' | 'desktop', n: number): Promise<string[]> {
  if (surface === 'desktop') {
    // A key does not survive on an Svg (as on a Text, P-017): the segments are the Svg of the card
    const svgs = [...walkNodes(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg' && isMarks(x))
    expect(svgs.length).toBe(1)
    const source = String(((svgs[0] as { props?: { source?: string } }).props ?? {}).source ?? '')
    const fills = [...source.matchAll(/<rect class="f-([a-z]+)"/g)].map((m) => m[1] ?? '')
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

  // Brief v2 (STYL_PASKOW_CLAUDE.md, 3 and 5), WYGLAD_PANELU E1: no surface, no frame, a rule above
  // on the desktop; the label column, the segments
  // across the middle and `a/b` + unit on the right; the stage's name stands in the plan bar
  // (brief 2), so this bar no longer repeats it, and no percent with hundredths
  test('shows the stage as a bar of segments, one per box in its own state, and `a/b punktów` on the right, on both surfaces', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const card = await ui.find({ key: 'relai-progress-card' })
      const props = card?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string }
      expect(props.backgroundColor).toBeUndefined()
      expect(props.borderStyle).toBeUndefined()
      expect(await ui.find({ key: 'rule' })).toBeUndefined() // only the engine beneath: no rule
      expect((await ui.find({ key: 'label' }))?.text).toBe(LOOK.progress.label)
      expect((await ui.find({ key: 'label' }))?.props.width).toBe(BAR.labelColumn)
      expect(await ui.find({ key: 'title' })).toBeUndefined()
      expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
      expect(textOf(await ui.drawn())).not.toContain('%')
      expect(await segmentStates($, ui, surface, 4)).toEqual(['done', 'done', 'running', 'pending'])
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  // AUDYT_MODOW Z12: the session runs a thread card (relai-panel wrote its focus): the bar counts
  // the card's packets, not the active plan's stage
  test('a session focused on a thread card counts its packets, "a/b paczek", the open one next', async ($, on) => {
    const card = ['# ODNOGA', '', 'Status: **OTWARTA**', '', '1. **Z3 · Panel** — x', '2. **Z4 · Paski** — x', '3. **Z5 · Poprawność** — x', '',
      '## Weryfikacja', '', '- [x] Z3: a', '- [ ] Z4: b', '- [x] Z4: c', '- [ ] Z5: d'].join('\n')
    world(on, { ...FILES, [`${CWD}/docs/fixy/AUDYT_MODOW/ODNOGA.md`]: card,
      [`${CWD}/.claude/relai/fokus/${SESSION}.json`]: JSON.stringify({ kind: 'branch', card: 'AUDYT_MODOW', source: 'auto', at: 1 }) })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('1/3 paczek')
    expect(await segmentStates($, ui, 'desktop', 3)).toEqual(['done', 'running', 'pending'])
    await ui.unmount()
    // The next packet under the segments: words on the terminal, Svg on the desktop
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect(textOf(await term.drawn())).toContain('Z4 · Paski')
    await term.unmount()
    // the same list of steps as a stage's (WYGLAD_PANELU E2): the open packet, then the next one
    const open = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    await open.press({ key: 'toggle-btn' })
    expect(textOf(await open.find({ key: 'list' }))).toContain('w toku')
    expect(textOf(await open.find({ key: 'list' }))).toContain('Z5 · Poprawność')
    await open.press({ key: 'toggle-btn' })
    await open.unmount()
  })

  // Review of Z12: /clear changes the session id with no session.start; the bar reads the new
  // session's focus at its next tick, not the old one's
  test('after /clear the bar follows the new session’s focus at the next tick', async ($, on) => {
    const card = ['# ODNOGA', '', 'Status: **OTWARTA**', '', '## Weryfikacja', '', '- [x] Z3: a', '- [ ] Z4: b'].join('\n')
    const ids = { session: SESSION }
    const { clock } = world(on, { ...FILES, [`${CWD}/docs/fixy/AUDYT_MODOW/ODNOGA.md`]: card,
      [`${CWD}/.claude/relai/fokus/${SESSION}.json`]: JSON.stringify({ kind: 'branch', card: 'AUDYT_MODOW', source: 'auto', at: 1 }) }, CWD, ids)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('1/2 paczek')
    ids.session = 'session-2' // no focus file: the active plan's stage again
    await clock.advance(11_000)
    expect((await ui.find({ key: 'figure' }))?.text).toBe('2/4 punktów')
    await ui.unmount()
  })

  test('a box ticked by hand in the prompt file moves the count and its own segment at the next tick (positive control)', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    await start($)
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(11_000)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('3/4 punktów')
    // the first box not done is the one in progress (WYGLAD_PANELU E2, the mock-up's amber segment)
    expect(await segmentStates($, ui, 'desktop', 4)).toEqual(['done', 'done', 'done', 'running'])
    await ui.unmount()
  })

  // WYGLAD_PANELU E2 (plan, section 5; look accepted in rounds 1–3): collapsed, a thin line of
  // segments and one line under it — the spinner, the item in progress, the next one on a wide
  // screen, the button "Rozwiń"; a long name is cut on a zero basis, never widening the column (P-043)
  test('collapsed: thin segments, then one line — the spinner, the item in progress, the next on a wide screen, "Rozwiń"', async ($, on) => {
    world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const svgs = [...walkNodes(await ui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg' && isMarks(x))
    expect(svgs.length).toBe(1)
    const props = ((svgs[0] as { props?: Record<string, unknown> }).props ?? {})
    expect(props.isInteractive).toBe(true) // the tooltips of the segments
    expect(props.height).toBe(10)
    const source = String(props.source ?? '')
    expect(source).toMatch(/^<svg [^>]*width="100%"[^>]*height="10"/) // a width in the markup (P-020, 7)
    expect(source).toContain('@media (prefers-color-scheme: light)') // two palettes (P-042)
    expect(source).toContain('.f-done{fill:#5aa851}') // the light tuning "J3 miękki" (round 3)
    expect(source).toContain('<title>1/4 · jeden</title>')
    expect(source).toContain('<title>4/4 · cztery</title>')
    expect(source).not.toContain('<text') // no words in Svg: they do not wrap (plan, variant D)
    const now = await ui.find({ key: 'now' })
    expect(now?.text).toBe('trzy')
    expect(now?.props.width).toBe(0)
    expect((await ui.find({ key: 'next' }))?.text).toBe('następny: cztery')
    // waiting for the person the mark stands still (round 4); its tooltip is the full name
    const markOf = async (u: typeof ui) => {
      const box = await u.find({ key: 'now-mark' })
      const svg = [...walkNodes(box as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Svg')
      return String((svg as { props?: { source?: string } } | undefined)?.props?.source)
    }
    expect(await markOf(ui)).toContain('<title>trzy</title>')
    expect(await markOf(ui)).not.toContain('animateTransform')
    await ui.redraw({ ...BAND().props, isWorking: true }) // the model works: the mark spins
    expect(await markOf(ui)).toContain('animateTransform')
    await ui.redraw({ ...BAND().props, isWorking: false })
    expect(await markOf(ui)).not.toContain('animateTransform')
    const buttons = await ui.findAll({ type: 'Button' })
    expect(buttons.map((b) => b.props.label)).toEqual(['Rozwiń'])
    expect(buttons[0]?.props.variant).toBe('primary')
    expect(await ui.find({ key: 'list' })).toBeUndefined()
    await ui.unmount()
    // half a window: the next one is not said
    const half = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND(100) })
    expect(await half.find({ key: 'next' })).toBeUndefined()
    expect((await half.find({ key: 'now' }))?.text).toBe('trzy')
    await half.unmount()
    // the terminal: the same line, the segments as cells, the spinner as a sign
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await term.find({ key: 'now' }))?.text).toBe('trzy')
    expect((await term.find({ key: 'now-mark' }))?.text).toBe(BAR.tile.running.mark)
    await term.unmount()
  })

  test('the figure is `a/b` and its unit for every count: one box is "punktu", a crew\'s tasks are "zadań"', async ($, on) => {
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: '- [ ] jedyny\n' })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'figure' }))?.text).toBe('0/1 punktu')
    await ui.unmount()
  })

  // WYGLAD_PANELU E2 (plan, section 5): a box ticked flashes once — the line of the collapsed bar,
  // the row of the open list with its mark filling — and no second row stands under the bar
  test('a box just ticked flashes once and its mark fills, with no second row; the flash is gone after 1.4 s', async ($, on) => {
    const { disk, clock } = world(on, FILES)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'line' }))?.props.backgroundColor).toBeUndefined() // ticked before the session: no news
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace('- [ ] trzy', '- [x] trzy')
    await clock.advance(10_500) // the tick at 10 s reads the file
    expect((await ui.find({ key: 'line' }))?.props.backgroundColor).toBe('diffAddedDimmed')
    expect((await ui.find({ key: 'now' }))?.text).toBe('cztery')
    expect(await ui.find({ key: 'ticked-row' })).toBeUndefined()
    await ui.press({ key: 'toggle-btn' })
    const row = await ui.find({ key: 'row-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#3' })
    expect(row?.props.backgroundColor).toBe('diffAddedDimmed')
    expect(row?.text).toContain('trzy  ·  przed chwilą')
    const mark = [...walkNodes(row as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Svg')
    expect(String((mark as { props?: { source?: string } } | undefined)?.props?.source)).toContain('<animate attributeName="r"')
    await clock.advance(1_500) // past the flash
    expect(await ui.find({ key: 'row-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#3' })).toBeUndefined()
    expect(textOf(await ui.drawn())).not.toContain('przed chwilą')
    expect((await ui.find({ key: 'figure' }))?.text).toBe('3/4 punktów')
    await ui.unmount()
  })

  // WYGLAD_PANELU E2: "Rozwiń" opens the window around the current item, the state stays for the
  // session (a redraw, another answer of the model, a new mount), "Zwiń" closes it; the done ones
  // fold away behind a text button (round 3: "zwijanie tekst"), a row's state stands by its name
  test('"Rozwiń" opens the list and it stays open across a redraw and the next answer; the done ones unfold by a text button', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      await ui.press({ key: 'toggle-btn' })
      expect(await ui.find({ key: 'list' })).toBeDefined()
      expect((await ui.find({ key: 'sum' }))?.text).toBe('2 zrobionych · 1 w toku · 1 czeka')
      expect((await ui.find({ key: 'row-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#3' }))?.text).toContain('trzy  ·  w toku')
      expect((await ui.findAll({ type: 'Button' })).map((b) => [b.props.label, b.props.plain ?? b.props.variant]))
        .toEqual([['Zwiń', 'primary'], ['2 zrobionych', true]])
      await ui.redraw()
      await $.turn.complete({ answer: 'odpowiedź', durationMs: 10, isAborted: false, turnId: 'tm', reason: 'answer' } as never)
      expect(await ui.find({ key: 'list' })).toBeDefined()
      await ui.unmount()
      const again = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect(await again.find({ key: 'list' })).toBeDefined()
      await again.press({ key: 'fold-press' })
      expect((await again.find({ key: 'row-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#1' }))?.text).toContain('jeden')
      await again.press({ key: 'fold-press' })
      await again.press({ key: 'toggle-btn' })
      expect(await again.find({ key: 'list' })).toBeUndefined()
      await again.unmount()
    }
  })

  // Plan, section 8: no list and no button when there is nothing left — every box ticked, or none
  // at all; a failed task is the news of the collapsed line; a long name is cut collapsed and
  // wrapped open
  test('edge cases: all ticked, a failed task, a long name', async ($, on) => {
    const long = 'Bardzo długa nazwa punktu, która nie mieści się w jednej linii paska nad promptem w wąskim panelu podziału okna aplikacji'
    const { disk, clock } = world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: PROMPT.replace('trzy', long) })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND(60) })
    const now = await ui.find({ key: 'now' })
    expect(now?.text).toBe(long)
    expect(now?.props.width).toBe(0)
    const cut = [...walkNodes(now as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Text')
    expect((cut as { props?: { wrap?: string } } | undefined)?.props?.wrap).toBe('truncate')
    await ui.press({ key: 'toggle-btn' })
    const row = await ui.find({ key: 'row-docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md#3' })
    const wrapped = [...walkNodes(row as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Text')
    expect((wrapped as { props?: { wrap?: string } } | undefined)?.props?.wrap).toBe('wrap')
    await ui.press({ key: 'toggle-btn' })
    disk[`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`] = PROMPT.replace(/- \[ \]/g, '- [x]')
    await clock.advance(10_500)
    expect((await ui.find({ key: 'words' }))?.text).toBe('wszystkie punkty odhaczone')
    expect(await ui.findAll({ type: 'Button' })).toEqual([])
    expect((await ui.find({ key: 'figure' }))?.text).toBe('4/4 punktów')
    await ui.unmount()
  })

  test('a failed crew task is the current item: "błąd" in the error key, in place of "w toku"', async ($, on) => {
    world(on, {
      ...FILES,
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/zadania.json`]: JSON.stringify([{ id: 'a', title: 'Pierwsze' }, { id: 'b', title: 'Drugie' }, { id: 'c', title: 'Trzecie' }]),
      [`${CWD}/.claude/relai/work/CREW/2026-10-09_110000/manifest.json`]: JSON.stringify({ updatedAt: '2026-10-09T11:30:00Z', tasks: [{ id: 'a', status: 'done' }, { id: 'b', status: 'failed' }] }),
    })
    await start($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const now = await ui.find({ key: 'now' })
      expect(now?.text).toBe('błąd: Drugie')
      const t = [...walkNodes(now as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Text')
      expect((t as { props?: { color?: string } } | undefined)?.props?.color).toBe(KEY.failed)
      await ui.press({ key: 'toggle-btn' })
      expect((await ui.find({ key: 'row-b' }))?.text).toContain('Drugie  ·  błąd')
      expect((await ui.find({ key: 'sum' }))?.text).toBe('1 zrobionych · 1 z błędem · 1 czeka')
      await ui.press({ key: 'toggle-btn' })
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
      expect(drawn.filter((x) => typeof x !== 'string' && x.type === 'Svg' && isMarks(x)).length).toBe(0)
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
    const svg = [...walkNodes(await desk.drawn())].find((x) => typeof x !== 'string' && x.type === 'Svg' && isMarks(x))
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

  // WYGLAD_PANELU E2, round 4 (Łukasz: "czy to nie powinno być tak sekwencyjnie, po kolei?"; choice
  // "Zrobione najpierw", replacing brief §6 "each segment its own box"): boxes ticked out of order
  // stand first, so the bar grows from the left; each segment's tooltip keeps its number in the file
  test('boxes ticked out of order stand first, the bar grows from the left, each tooltip keeps the box\'s number', async ($, on) => {
    const prompt = Array.from({ length: 10 }, (_, i) => `- [${[2, 5, 9].includes(i + 1) ? 'x' : ' '}] Punkt ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const states = await segmentStates($, ui, surface, 10)
      expect(states).toEqual(['done', 'done', 'done', 'running', 'pending', 'pending', 'pending', 'pending', 'pending', 'pending'])
      expect((await ui.find({ key: 'figure' }))?.text).toBe('3/10 punktów')
      expect((await ui.find({ key: 'now' }))?.text).toBe('Punkt 1')
      await ui.unmount()
    }
    const desk = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    const svg = [...walkNodes(await desk.drawn())].find((x) => typeof x !== 'string' && x.type === 'Svg' && isMarks(x))
    const titles = [...String((svg as { props?: { source?: string } } | undefined)?.props?.source).matchAll(/<title>(\d+)\/10/g)].map((m) => Number(m[1]))
    expect(titles).toEqual([2, 5, 9, 1, 3, 4, 6, 7, 8, 10])
    await desk.unmount()
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

  // WYGLAD_PANELU E1 (variant 3b): no gap on either surface — on the desktop the card's own rule
  // brings the air (22 px), the terminal's rows count
  test('no gap to the cards beneath: the rule above the card brings the air on the desktop', async ($, on) => {
    world(on, FILES)
    await start($)
    const gapOf = async (surface: 'terminal' | 'desktop') => {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      const wrap = await ui.find({ key: 'relai-progress' })
      await ui.unmount()
      return (wrap?.props as { gap?: number } | undefined)?.gap
    }
    expect(await gapOf('desktop')).toBeUndefined()
    expect(await gapOf('terminal')).toBeUndefined()
  })

  // The rule stands between two RelAI bars only, never above the engine's own row (2026-10-14)
  test('a RelAI bar beneath: a rule between them on the desktop, none in the terminal', async ($, on) => {
    world(on, FILES, CWD, { session: SESSION }, 'relai-cache-card')
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect(Boolean(await ui.find({ key: 'rule' }))).toBe(surface === 'desktop')
      expect(await ui.find({ key: 'relai-cache-card' })).toBeDefined()
      await ui.unmount()
    }
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
    await clock.advance(10_500) // the box just ticked: its row flashes in the open list
    for (const surface of ['terminal', 'desktop'] as const) {
      const narrow = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(40) })
      expect(await narrow.find({ key: 'agents-chip' })).toBeDefined()
      expect(minWidth(await narrow.drawn())).toBeLessThanOrEqual(40)
      await narrow.press({ key: 'toggle-btn' })
      expect(textOf(await narrow.find({ key: 'list' }))).toContain('przed chwilą')
      expect(minWidth(await narrow.drawn())).toBeLessThanOrEqual(40)
      await narrow.press({ key: 'toggle-btn' })
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
    // WYGLAD_PANELU E2 (plan, section 5): the chip `● N agentów` in the line, its cost gone to the
    // pane (/relai-agents), whose own sum is checked below ($0.03 by hand)
    for (const surface of ['terminal', 'desktop'] as const) {
      const band = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND() })
      expect((await band.find({ key: 'agents-chip' }))?.text).toBe('● 1 agent')
      expect(await band.find({ key: 'agents-btn' })).toBeUndefined()
      await band.unmount()
    }
    await spawn2($)
    const two = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await two.find({ key: 'agents-chip' }))?.text).toBe('● 2 agentów')
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
    // None runs any more: the chip keeps the count, its mark says they finished
    const ended = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...BAND() })
    expect((await ended.find({ key: 'agents-chip' }))?.text).toBe('✓ 2 agentów')
    await ended.unmount()
  })

  // WYGLAD_PANELU E2: the segments take a row of their own, so the short chip always fits in the
  // line beside the item in progress, which gives way (zero basis) — no row of its own any more
  test('the chip stands in the line, beside the item in progress and the button, in a full window and in 40 columns', async ($, on) => {
    const prompt = Array.from({ length: 14 }, (_, i) => `- [ ] Punkt ${i + 1}`).join('\n')
    world(on, { ...FILES, [`${CWD}/docs/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md`]: prompt })
    await start($)
    await spawn($)
    for (const surface of ['terminal', 'desktop'] as const) for (const cols of [140, 40]) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(cols) })
      expect(textOf(await ui.find({ key: 'line' }))).toContain('1 agent')
      expect(await ui.find({ key: 'chip-row' })).toBeUndefined()
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(cols)
      await ui.unmount()
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

  // AGENTS_KRABY P4: the pane is RelAI Agents — agents only; the stage's progress lives in the bar
  test('the pane speaks the RelAI motif: one heading, the agent as its role, no section of the stage', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    await start($)
    await spawn($)
    const term = await $.ui.mount({ plugin: 'relai-progress', surface: 'terminal', ...PANE() })
    const text = textOf(await term.drawn())
    expect(text).toContain('Agenci sesji')
    expect(text).toContain('Lis Leon · Analityk') // Explore is the analyst, the first name of its pool
    // Negative proof: the stage the bar shows (PANEL_CLAUDE E9) is nowhere in the pane
    expect(text).not.toContain('Postęp etapu')
    expect(text).not.toContain('punktów')
    expect(await term.find({ key: 'tasks-card' })).toBeUndefined()
    await term.unmount()
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const card = await gui.find({ key: `agent-${AGENT}` })
    expect(card?.props.backgroundColor).toBeUndefined() // no fill of its own since E4: the pane's ground shows through
    expect(card?.props.borderStyle).toBe('round')
    await gui.unmount()
  })

  test('the card draws the agent\'s character, what it does now, its last steps and all of them on a press', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    on('tool.call', { tool: ['Read', 'Grep'] }, () => ({ result: 'ok' }) as never)
    await start($)
    await spawn($)
    for (const [i, f] of ['a.md', 'b.md', 'c.md', 'd.md', 'e.md'].entries()) {
      await $.tool.call({ tool: i === 4 ? 'Grep' : 'Read', ...(i === 4 ? { pattern: 'roleOf' } : { file_path: `${CWD}/docs/${f}` }), agentId: AGENT } as never)
    }
    await new Promise((r) => setTimeout(r, 0))
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const svgs = [...walkNodes(await gui.drawn())].filter((x) => typeof x !== 'string' && x.type === 'Svg')
    const alts = svgs.map((x) => String(((x as { props?: { alt?: string } }).props ?? {}).alt ?? ''))
    expect(alts.every((a) => a.length > 0)).toBe(true) // every drawing has its alt (P-042)
    expect(alts).toContain('Lis Leon, lis — Analityk, kolor gliniany')
    const pet = svgs.find((x) => String(((x as { props?: { source?: string } }).props ?? {}).source ?? '').includes('mascot-f'))
    expect(pet).toBeDefined() // a running agent's character steps through its frames
    let card = textOf(await gui.find({ key: `agent-${AGENT}` }))
    expect(card).toContain('Krok 5 · Szuka „roleOf”')
    expect(card).toContain('Czyta d.md') // the three before the current one
    expect(card).not.toContain('Czyta a.md')
    const label = async (key: string) => String((await gui.find({ key }))?.props.label ?? '')
    expect(await label(`steps-${AGENT}`)).toBe('▸ Wszystkie kroki · 5')
    await gui.press({ key: `steps-${AGENT}` })
    card = textOf(await gui.find({ key: `agent-${AGENT}` }))
    expect(await label(`steps-${AGENT}`)).toBe('▾ Zwiń kroki')
    expect(card).toContain('a.md') // every step, its kind and its folder
    expect(card).toContain('odczyt')
    expect(card).toContain('docs')
    await gui.press({ key: `steps-${AGENT}` })
    expect(await label(`steps-${AGENT}`)).toBe('▸ Wszystkie kroki · 5')
    await gui.unmount()
  })

  test('agents stand in groups, each folds on a press; a finished one stands still', async ($, on) => {
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    await start($)
    await spawn($)
    await $.turn.complete({ answer: 'raport', durationMs: 5000, isAborted: false, turnId: 'ta', agentId: AGENT, reason: 'answer' } as never)
    await spawn2($)
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const label = async (key: string) => String((await gui.find({ key }))?.props.label ?? '')
    const drawn = textOf(await gui.drawn())
    expect(await label('fold-running')).toBe('▾ Działają · 1')
    expect(await label('fold-done')).toBe('▾ Zakończeni · 1')
    expect(drawn).toContain('Koszt agentów')
    expect(drawn).toContain('Czas pracy')
    const done = await gui.find({ key: `agent-${AGENT}` })
    const still = [...walkNodes(done as RenderNode)].find((x) => typeof x !== 'string' && x.type === 'Svg' && String((x.props as { source?: string }).source ?? '').includes('mascot-o'))
    expect(String((still as { props?: { source?: string } })?.props?.source ?? '')).not.toContain('animation')
    await gui.press({ key: 'fold-done' })
    expect(await gui.find({ key: `agent-${AGENT}` })).toBeUndefined()
    expect(await label('fold-done')).toBe('▸ Zakończeni · 1')
    await gui.press({ key: 'fold-done' })
    expect(await gui.find({ key: `agent-${AGENT}` })).toBeDefined()
    await gui.unmount()
  })

  test('the pane with a running and a finished agent fits a narrow split pane (40 columns) and a full one', async ($, on) => {
    world(on, FILES)
    await start($)
    await spawn($)
    await $.turn.complete({ answer: 'raport', durationMs: 5000, isAborted: false, turnId: 'ta', agentId: AGENT, reason: 'answer' } as never)
    await spawn2($)
    for (const surface of ['terminal', 'desktop'] as const) for (const cols of [40, 100]) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...PANE(cols) })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(cols)
      await ui.unmount()
    }
  })

  test('the pane follows the app\'s look: texts and frames in theme keys, no fill of its own (E4, live 2026-10-15)', async ($, on) => {
    // Live 2026-10-15 (WYGLAD_PANELU E4): in the light app the list of points stood on a dark card
    // with light words, the words under it light on white (DESIGN.md 2: tło w Box — brak albo klucz)
    world(on, { ...FILES, [MEASURE]: rec(AGENT, 0, 100, 50) + '\n' })
    await start($)
    await spawn($)
    const gui = await $.ui.mount({ plugin: 'relai-progress', surface: 'desktop', ...PANE() })
    const raw: string[] = []
    const walk = (n: unknown): void => {
      if (Array.isArray(n)) { n.forEach(walk); return }
      if (!n || typeof n !== 'object' || !('type' in n)) return
      const x = n as { type: string, props?: Record<string, unknown>, children?: unknown }
      const p = x.props ?? {}
      for (const k of ['color', 'backgroundColor', 'borderColor']) if (typeof p[k] === 'string' && String(p[k]).startsWith('#')) raw.push(`${x.type}.${k}=${String(p[k])}`)
      walk(x.children)
    }
    walk(await gui.drawn())
    expect(raw).toEqual([])
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

// WYGLAD_PANELU E2 (plan, section 5 and risk 4): the window of the expanded list
describe('the window of the list stands around the current item, six rows at most', () => {
  const item = (status: Item['status'], name: string): Item => ({ id: name, label: name, name, status })
  const list = (done: number, total: number) => Array.from({ length: total }, (_, i) => item(i < done ? 'done' : 'pending', `p${i + 1}`))
  const shape = (rows: ReturnType<typeof windowRows>) => rows.map((r) => (r.kind === 'item' ? `${r.isCurrent ? '*' : ''}${r.item.name}` : r.kind === 'more' ? `+${r.count}` : `fold${r.done}${r.isOpen ? '-open' : ''}`))
  test('the fold of the done ones, the current one, three next ones, "+N czekają"', () => {
    expect(shape(windowRows(list(5, 14), false, null))).toEqual(['fold5', '*p6', 'p7', 'p8', 'p9', '+5'])
    expect(shape(windowRows(list(0, 7), false, null))).toEqual(['*p1', 'p2', 'p3', 'p4', '+3'])
    expect(shape(windowRows(list(5, 7), false, null))).toEqual(['fold5', '*p6', 'p7'])
  })
  test('the one just ticked stands under the fold and the window still holds six rows', () => {
    expect(shape(windowRows(list(5, 14), false, 'p5'))).toEqual(['fold5', 'p5', '*p6', 'p7', 'p8', '+6'])
  })
  test('unfolded, the last done ones take the next ones\' place', () => {
    expect(shape(windowRows(list(5, 14), true, null))).toEqual(['fold5-open', 'p3', 'p4', 'p5', '*p6', '+8'])
  })
  test('every shape of the list keeps to six rows; nothing left to do is no window at all', () => {
    for (let total = 1; total <= 20; total++) for (let done = 0; done <= total; done++) for (const shown of [false, true]) {
      const rows = windowRows(list(done, total), shown, done > 0 ? `p${done}` : null)
      expect(rows.length <= WINDOW).toBe(true)
      if (done === total) expect(rows).toEqual([])
    }
  })
  test('a failed item is the current one, the more important news', () => {
    const items = [item('done', 'a'), item('pending', 'b'), item('failed', 'c'), item('pending', 'd')]
    expect(currentOf(items)).toBe(2)
  })
  // Review of E2: a crew's tasks may run side by side — each running one is counted, the first is current
  test('running tasks lead before pending ones and each is counted in the sums', () => {
    const items = [item('done', 'a'), item('pending', 'b'), item('running', 'c'), item('running', 'd'), item('pending', 'e'), item('pending', 'f')]
    expect(currentOf(items)).toBe(2)
    expect(sumWords(items)).toBe('1 zrobionych · 2 w toku · 3 czekają')
    expect(sumWords([item('done', 'a'), item('pending', 'b'), item('pending', 'c')])).toBe('1 zrobionych · 1 w toku · 1 czeka')
  })
})

// WYGLAD_PANELU E1 (Aneks B, P-042): the bar follows the app's appearance by itself — Box and Text
// in theme keys only, the Svg marks with a dark and a light palette — and fits a narrow split pane
describe('the bar in the tool\'s own colors (WYGLAD_PANELU E1)', () => {
  const HEX = /^#[0-9a-f]{3,8}$/i
  const kidsOf = (n: RenderNode): RenderNode[] => (typeof n === 'string' ? [] : (n as { children?: RenderNode[] }).children ?? [])
  const propsOf = (n: RenderNode): Record<string, unknown> => (typeof n === 'string' ? {} : (n as { props?: Record<string, unknown> }).props ?? {})
  // Every raw color a Box or a Text paints with; an Svg's markup is its own (its marks switch by CSS)
  const rawColors = (n: RenderNode): string[] => {
    if (typeof n === 'string') return []
    const own = n.type === 'Svg' ? [] : ['color', 'backgroundColor', 'borderColor'].map((k) => String(propsOf(n)[k] ?? '')).filter((v) => HEX.test(v))
    return [...own, ...kidsOf(n).flatMap(rawColors)]
  }
  const svgSources = (n: RenderNode): string[] => (typeof n === 'string' ? []
    : [...(n.type === 'Svg' ? [String(propsOf(n).source ?? '')] : []), ...kidsOf(n).flatMap(svgSources)])

  test('no raw color on a Box or a Text, every Svg with both palettes', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(140) })
      const drawn = await ui.drawn()
      expect(rawColors(drawn)).toEqual([])
      const sources = svgSources(drawn)
      if (surface === 'desktop') {
        expect(sources.length).toBeGreaterThan(0) // at least the card's own drawing
        for (const s of sources) expect(s).toContain('@media (prefers-color-scheme: light)')
      } else expect(sources).toEqual([])
      await ui.unmount()
    }
  })

  test('fits a narrow split pane, half a window and a full one (40, 70, 140 columns)', async ($, on) => {
    world(on, FILES)
    await start($)
    for (const columns of [40, 70, 140]) {
      for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'relai-progress', surface, ...BAND(columns) })
        expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(columns)
        await ui.unmount()
      }
    }
  })
})
