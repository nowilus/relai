import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'
import { RECORD_FIELDS } from './core/measure.mjs'
import { BAND, THEME } from './core/theme.mjs'

// The collector and the cost report of the RelAI panel (plan PANEL_CLAUDE, E3): every request of
// the main loop and of subagents and each compaction to a file per session; sums without
// counting twice; a gap in words; the band framed apart from the other mods above the prompt.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 8, 21, 0).getTime()
const DIR = `${CWD}/.claude/relai/pomiary`
const FILE = `${DIR}/2026-10-08-session-1.jsonl`
const ANSWER_TEXT = 'TREŚĆ-ODPOWIEDZI-MODELU'
const BASE: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n',
}

type Usage = { input_tokens: number, cache_read_input_tokens: number, cache_creation_input_tokens: number, output_tokens: number }
const U = (input: number, read: number, write: number, output: number): Usage =>
  ({ input_tokens: input, cache_read_input_tokens: read, cache_creation_input_tokens: write, output_tokens: output })

// The answers beneath the plugin, by "turn:index:agent"; null usage = a response without one
type Answers = Record<string, Usage | null>

function world(on: On, files: Record<string, string>, answers: Answers = {}, ledgerUsd = 0, startedAt = NOW, beneath = 'engine') {
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = Object.keys(disk).filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/'))
    return { value: names.map((p) => ({ name: p.slice(dir.length), kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: ledgerUsd } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('turn.step', async function* ($, e) {
    const usage = answers[`${e.turnId}:${e.index}:${e.agentId ?? 'main'}`]
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: ANSWER_TEXT, toolUses: [], stopReason: 'end_turn',
      usage: usage ? { ...usage, model: 'claude-opus-5-5' } : null,
    }
    return result
  })
  on('session.compact', () => ({ messages: [{ role: 'user' as const, text: 'streszczenie', toolUses: [] }], usage: U(2677, 73700, 103, 1208) }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: beneath, children: [Text({ children: [beneath] })] })
  })
  return disk
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

async function step($: Engine, turnId: string, index: number, agentId?: string) {
  const s = $.turn.step({ turnId, index, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

// The report waits for the collector's queued writes: drawing it is the way to let them settle
async function settle($: Engine) {
  await $.command.run({ command: 'relai-panel' } as never)
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...pane(100) })
  await ui.press({ key: 'tab-costs' }).catch(() => undefined)
  await ui.unmount()
}

// Brief v2 §7 (AUDYT_MODOW Z2): the sections under the tiles are folded by default and the fold is
// kept in $.state. The report's tests read every section, as before Z2: each folded one is
// unfolded (a press only where the button still says "Rozwiń", so a second mount keeps them open)
type Mounted = { find: (q: { key: string }) => Promise<RenderNode | undefined>, press: (q: { key: string }) => Promise<unknown> }
async function unfoldAll(ui: Mounted) {
  for (const s of ['stages', 'turns', 'agents', 'models', 'pricing']) {
    const b = await ui.find({ key: `fold-costs:${s}` })
    if (b && typeof b !== 'string' && String((b.props as { label?: string }).label).startsWith('▸')) await ui.press({ key: `fold-costs:${s}` })
  }
}

const lines = (text: string | undefined) => String(text ?? '').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>)

function pane(columns: number) {
  return {
    component: 'Pane' as const, requestId: 'relai-panel',
    props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
  }
}

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The width instrument of theme.test.ts (E8), the same rules: a Button keeps its label, a Text
// its longest word unless it truncates, a row sums its children, padding and border add.
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

describe('the measurement collector', () => {
  test('writes a record for the main loop, a subagent and a compaction to the session file, with no content', async ($, on) => {
    const disk = world(on, BASE, { 't1:0:main': U(2, 15010, 54925, 276), 'c6:0:agent-1': U(2, 0, 24131, 321) })
    await start($)
    await step($, 't1', 0)
    await step($, 'c6', 0, 'agent-1')
    await $.session.compact({ trigger: 'manual', messages: [{ role: 'user', text: 'rozmowa', toolUses: [] }] })
    await settle($)
    const recs = lines(disk[FILE])
    expect(recs.map((r) => [r.kind, r.agent, r.cacheWrite])).toEqual([['step', null, 54925], ['step', 'agent-1', 24131], ['compact', null, 103]])
    expect(Object.keys(recs[0] ?? {}).sort()).toEqual([...RECORD_FIELDS].sort())
    expect(disk[FILE]?.includes(ANSWER_TEXT)).toBe(false)
  })

  test('the same request seen twice is one record; a reload reads the file back before writing', async ($, on) => {
    const old = JSON.stringify({ v: 1, tool: 'claude-code', session: 'session-1', turn: 't0', index: 0, agent: null, kind: 'step', model: 'claude-opus-5-5', at: 1, input: 1, cacheRead: 1, cacheWrite: 1, output: 1, missing: null })
    const disk = world(on, { ...BASE, [`${DIR}/2026-10-07-session-1.jsonl`]: old + '\n' }, { 't1:0:main': U(1, 2, 3, 4) })
    await start($)
    await step($, 't1', 0)
    await step($, 't1', 0)
    await step($, 't0', 0) // the request already in the file
    await settle($)
    const recs = lines(disk[`${DIR}/2026-10-07-session-1.jsonl`])
    expect(recs.map((r) => r.turn)).toEqual(['t0', 't1'])
    expect(disk[FILE]).toBeUndefined() // the session keeps its first file, whatever the date
  })

  test('writes nothing outside a RelAI project', async ($, on) => {
    const disk = world(on, { [`${CWD}/docs/USTAWIENIA.md`]: '# inny projekt\n' }, { 't1:0:main': U(1, 2, 3, 4) })
    await start($)
    await step($, 't1', 0)
    await settle($)
    expect(Object.keys(disk).filter((p) => p.startsWith(DIR))).toEqual([])
  })
})

describe('the cost report', () => {
  async function costs($: Engine, surface: 'terminal' | 'desktop', columns = 100) {
    await $.command.run({ command: 'relai-panel' } as never)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(columns) })
    await ui.press({ key: 'tab-costs' })
    await unfoldAll(ui)
    return ui
  }

  test('sums the session, per agent and per model, in the motif on a desktop and as text on the terminal', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663), 'c6:0:agent-1': U(2, 0, 24131, 321) })
    await start($)
    await step($, 't1', 0)
    await step($, 'c6', 0, 'agent-1')
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await costs($, surface)
      const totalNode = await ui.find({ key: 'cost-total' })
      const total = textOf(totalNode)
      expect(total).toContain('Suma sesji')
      // 0.439926 + 0.127083: the subagent's write at x1.25; a desktop draws it in Kalam
      const figure = [...walk(totalNode)].find((n) => (n.props as { alt?: string }).alt === '$0.57')
      if (surface === 'desktop') expect(figure?.type).toBe('Svg')
      else expect(total).toContain('$0.57')
      expect(textOf(await ui.find({ key: 'legend-cacheWrite' }))).toContain('77.1k · $')
      expect(await ui.find({ key: 'cost-agents-1-legend-output' })).toBeDefined() // the same legend on an agent
      expect(await ui.find({ key: 'cost-agents-0' })).toBeDefined()
      expect(textOf(await ui.find({ key: 'cost-agents-1' }))).toContain('subagent agent-1')
      expect(textOf(await ui.find({ key: 'cost-models-0' }))).toContain('claude-opus-5-5')
      const svgs = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg')
      if (surface === 'desktop') expect(svgs.some((n) => (n.props as { alt?: string }).alt === 'Koszty sesji')).toBe(true)
      else expect(svgs).toEqual([])
      if (surface === 'terminal') expect(textOf(await ui.drawn())).toContain('Koszty sesji')
      await ui.unmount()
    }
  })

  test('a request without usage is said in words and the sum is called partial', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663), 't1:1:main': null })
    await start($)
    await step($, 't1', 0)
    await step($, 't1', 1)
    const ui = await costs($, 'terminal')
    expect(textOf(await ui.find({ key: 'cost-total' }))).toContain('suma częściowa')
    expect(textOf(await ui.find({ key: 'gap-0' }))).toContain('1 wywołanie bez pomiaru')
    await ui.unmount()
  })

  test('no measurement yet is "brak pomiarów", not $0, while the engine ledger is named', async ($, on) => {
    world(on, BASE, {}, 8.08)
    await start($)
    const ui = await costs($, 'desktop')
    expect(await ui.find({ key: 'cost-total' })).toBeUndefined()
    expect(textOf(await ui.find({ key: 'gap-0' }))).toContain('brak pomiarów')
    expect(textOf(await ui.drawn())).not.toContain('$0')
    expect(textOf(await ui.find({ key: 'cost-engine' }))).toContain('jeszcze nic nie zmierzył')
    expect(textOf(await ui.find({ key: 'cost-project' }))).toContain('Brak pomiarów')
    await ui.unmount()
  })

  test('the engine ledger beside the collector: the unmeasured rest in words; the cache and the turns', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663), 'c6:0:agent-1': U(2, 0, 24131, 321), 't2:0:main': U(2, 70000, 500, 100) }, 8.08)
    await start($)
    await step($, 't1', 0)
    await step($, 'c6', 0, 'agent-1')
    await step($, 't2', 0)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await costs($, surface)
      const engine = textOf(await ui.find({ key: 'cost-engine' }))
      expect(engine).toContain('Cała sesja (jak /cost)')
      // the collector began with the session: the rest is outside the conversation, not "earlier"
      expect(engine).toMatch(/\$7\.\d\d to wywołania poza rozmową \(tytuł sesji, inne pluginy\) — bez rozbicia/)
      expect(engine).not.toContain('sprzed')
      const cache = textOf(await ui.find({ key: 'cost-cache' }))
      expect(cache).toMatch(/Zapłacone \$\d\.\d\d zamiast \$\d\.\d\d bez cache — oszczędność \$/)
      // Whole percents since brief v2 §7 ("96 %"); a share short of the whole never reads 100 %
      // (calibration 2026-10-08, held by fmt.pct and its test in pane-v2.test.ts)
      if (surface === 'terminal') expect(cache).toMatch(/^(\d{1,3}|<1) %wejścia z cache/)
      expect(textOf(await ui.find({ key: 'cost-agents-0' }))).toMatch(/(\d{1,3}|<1) % sesji/)
      const turns = textOf(await ui.find({ key: 'cost-turns' }))
      expect(turns).toContain('Najwyższe $')
      expect(turns).toContain('3 wywołania w 3 turach')
      if (surface === 'desktop') {
        expect(turns).toContain('najedź na słupek')
        const svg = [...walk(await ui.find({ key: 'cost-turns-chart' }))].find((n) => n.type === 'Svg')?.props as { source?: string, isInteractive?: boolean } | undefined
        expect(svg?.isInteractive).toBe(true)
        expect((svg?.source?.match(/class="t t\d+"/g) ?? []).length).toBe(3) // a card per call
        expect((svg?.source?.match(/<circle /g) ?? []).length).toBe(12) // the legend's dots on each
        expect(svg?.source).toContain('wątek główny')
        expect(svg?.source).toContain('odczyt cache')
      }
      const chart = (await ui.find({ key: 'cost-turns-chart' })) as { children?: RenderNode[] } | undefined
      const drawn = (chart?.children ?? [])[0] as RenderElement | undefined
      expect(drawn?.type).toBe(surface === 'desktop' ? 'Svg' : 'Text')
      if (surface === 'terminal') {
        expect(textOf(drawn)).toMatch(/^[▁▂▃▄▅▆▇█]{3}$/)
        expect(textOf(chart as RenderNode)).toMatch(/\d\d:\d\d → \d\d:\d\d · najwyższy słupek \$/)
      } else {
        const svg = (drawn?.props as { source?: string } | undefined)?.source ?? ''
        // the Y axis values in the gutter, right-aligned, outside the plot; no X axis
        expect(svg).toMatch(/<text class="a" x="44"[^>]*text-anchor="end"[^>]*>\$0\.\d+<\/text>/)
        expect(svg.slice(svg.indexOf('<svg class="p"'))).not.toContain('class="a"')
        expect(svg).not.toMatch(/x="[\d.]+%"[^>]*>\d\d:\d\d</)
      }
      await ui.unmount()
    }
  })

  test('a collector loaded in the middle of a session says the rest is from before it began', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663) }, 8.08, NOW - 30 * 60_000)
    await start($)
    await step($, 't1', 0)
    const ui = await costs($, 'terminal')
    const engine = textOf(await ui.find({ key: 'cost-engine' }))
    expect(engine).toMatch(/Kolektor działa od 21:00; \$7\.\d\d to tury sprzed tej chwili — bez rozbicia/)
    expect(engine).not.toContain('poza rozmową')
    await ui.unmount()
  })

  test('a ledger within a cent or a percent of the measurement reads as agreeing', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663) }, 0.4400)
    await start($)
    await step($, 't1', 0)
    const ui = await costs($, 'terminal')
    expect(textOf(await ui.find({ key: 'cost-engine' }))).toContain('zgodna z pomiarem kolektora')
    await ui.unmount()
  })

  // Live on the desktop (2026-10-08) every chart drawn without a width in its markup was empty,
  // while the mount saw an Svg element all the same: the drawing is held to its markup here.
  test('every drawing on a desktop has a width in its markup and says what it shows', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663), 'c6:0:agent-1': U(2, 0, 24131, 321) }, 8.08)
    await start($)
    await step($, 't1', 0)
    await step($, 'c6', 0, 'agent-1')
    const ui = await costs($, 'desktop')
    const svgs = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg').map((n) => n.props as { source?: string, alt?: string, width?: number })
    const bars = svgs.filter((s) => /preserveAspectRatio="none"/.test(s.source ?? ''))
    expect(bars.length).toBeGreaterThanOrEqual(4) // the total, 2 agents, 1 model
    const unsized = svgs.filter((s) => s.width === undefined && !/^<svg[^>]* width="(\d+|100%)"/.test(s.source ?? ''))
    expect(unsized.map((s) => s.alt)).toEqual([])
    expect(svgs.filter((s) => !s.alt || !s.alt.trim()).length).toBe(0)
    await ui.unmount()
  })

  test('the markup check catches a drawing without a width (planted defect)', () => {
    const planted = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 8" preserveAspectRatio="none" height="8"></svg>'
    expect(/^<svg[^>]* width="\d+"/.test(planted)).toBe(false)
  })

  test('the project sums every session file of the folder, this one included', async ($, on) => {
    const other = [1, 2].map((i) => JSON.stringify({ v: 1, tool: 'claude-code', session: 'old', turn: 'o' + i, index: 0, agent: null, kind: 'step', model: 'claude-opus-5-5', at: NOW - 86_400_000, input: 0, cacheRead: 0, cacheWrite: 0, output: 50_000, missing: null })).join('\n') + '\n'
    world(on, { ...BASE, [`${DIR}/2026-10-07-old.jsonl`]: other }, { 't1:0:main': U(0, 0, 0, 50_000) })
    await start($)
    await step($, 't1', 0)
    const ui = await costs($, 'terminal')
    const project = textOf(await ui.find({ key: 'cost-project' }))
    expect(project).toContain('$3.00') // three answers of 50k output tokens at $20 per million
    expect(project).toContain('2 sesje z pomiarem od 07.10')
    expect(project).toContain('dziś $1.00.')
    await ui.unmount()
  })

  test('nothing on the costs tab is wider than a 40-column pane', async ($, on) => {
    world(on, BASE, { 't1:0:main': U(2, 15010, 52957, 663), 'c6:0:agent-1': U(2, 0, 24131, 321), 't1:1:main': null })
    await start($)
    await step($, 't1', 0)
    await step($, 'c6', 0, 'agent-1')
    await step($, 't1', 1)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await costs($, surface, 40)
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.unmount()
    }
  })
})

describe('the band among the other mods above the prompt', () => {
  // WYGLAD_PANELU E1 (variant 3b, accepted 2026-10-14; was a soft background of its own): no
  // surface and no frame, every color a theme key; on the desktop a fading hairline between two
  // RelAI bars, none above the engine's own row (Łukasz, 2026-10-14)
  test('a RelAI bar beneath: a rule between them on the desktop, none in the terminal', async ($, on) => {
    world(on, BASE, {}, 0, NOW, 'relai-cache-card')
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
      const rule = await ui.find({ key: 'rule' })
      if (surface === 'desktop') expect(JSON.stringify(rule)).toContain('prefers-color-scheme: light')
      else expect(rule).toBeUndefined() // the terminal's rows count: no rule there
      expect(await ui.find({ key: 'relai-cache-card' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('only the engine beneath: no rule under the bar, no surface or frame', async ($, on) => {
    world(on, BASE)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
      const frame = await ui.find({ key: 'relai-band-frame' })
      const props = frame?.props as { borderStyle?: string, borderColor?: string, backgroundColor?: string } | undefined
      expect(props?.backgroundColor).toBeUndefined()
      expect(props?.borderStyle).toBeUndefined()
      expect(await ui.find({ key: 'rule' })).toBeUndefined()
      expect(textOf(frame)).toMatch(/^plan/) // the label, without "RelAI ·" since brief v2
      expect(textOf(frame)).not.toContain('engine') // the mods beneath stay outside the frame
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('is never wider than 40 columns, on terminal and desktop', async ($, on) => {
    world(on, BASE)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 40, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
      const frame = await ui.find({ key: 'relai-band-frame' })
      expect(frame).toBeDefined()
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.unmount()
    }
  })
})
