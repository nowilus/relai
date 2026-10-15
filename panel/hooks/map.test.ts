import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'
import { serializeRecords, stepRecord } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { priceRecord } from './core/pricing.mjs'
import { HEADING_ART } from './core/headings.mjs'
import { RULE, THEME } from './core/theme.mjs'
import { visible } from './skin'
import { DRAW_LIMIT, isDrawable, treeWeight } from './pane-parts'
import { usd } from './fmt'

// The map tab of the RelAI panel (plan PANEL_CLAUDE, E4): plans, stages, branches, crew runs with
// their waves; the cost of each stage from the collector's tag; merging crew tasks as a view, in
// the panel's own file; the collector tagging the stage in progress and the crew task.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 9, 12, 0).getTime()
const DIR = `${CWD}/.claude/relai/pomiary`
const FILE = `${DIR}/2026-10-09-session-1.jsonl`
const RUN = '2026-10-09_120000'
const RUN_DIR = `${CWD}/.claude/relai/work/CREW/${RUN}`
const MERGES = `${CWD}/.claude/relai/panel/scalenia.json`

const ACTIVE = [
  '# STATUS — plan PANEL_X', '',
  '[PLAN.html](PLAN.html) · utworzony 2026-10-08 · **ZAAKCEPTOWANY 2026-10-08** · model: Opus', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-08 | — | |',
  '| E2 | Mapa przepływu | W TOKU | — | |',
  '| E3 | Wydanie | OCZEKUJE | — | |', '',
  '## Odnogi', '',
  '- **BOCZNY_WATEK** — rzecz spoza zakresu · źródło: E2 · [karta](odnogi/BOCZNY_WATEK/ODNOGA.md) · **OTWARTA**', '',
  '## Dziennik wdrożenia', '',
].join('\n')

// The archived plan of the criterion, its stage rows as the repo holds them (seven, all closed)
const E2E = [
  '# STATUS — plan PROWADZENIE_END_TO_END', '',
  'Plan: [PLAN.html](PLAN.html) · Status: **ZREALIZOWANY 2026-09-24** (7/7 etapów)', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  ...['Szybkie poprawki i wydanie 2.3.1', 'Lżejszy start sesji', 'Skille w progresywnym ujawnianiu', 'Zasady skrojone pod model', 'Pierwsze 30 minut', 'Krańce drogi', 'Jakość pracy solo i załogi']
    .map((name, i) => `| E${i + 1} | ${name} | ZREALIZOWANY 2026-09-24 | [PROMPT_ETAP_${i + 1}.md](PROMPT_ETAP_${i + 1}.md) | |`),
].join('\n')

const TASKS = JSON.stringify([
  { id: 't1', title: 'Rdzeń mapy', files: ['core/panel/flow.mjs'], dependsOn: [] },
  { id: 't2', title: 'Testy rdzenia', files: ['core/panel/tests/flow.test.js'], dependsOn: [] },
  { id: 't3', title: 'Panel', files: ['panel/hooks/register.tsx'], dependsOn: ['t1'] },
])
const MANIFEST = JSON.stringify({ runId: RUN, tasks: [{ id: 't1', status: 'done' }, { id: 't2', status: 'running' }] })

// A record of a session before E4: neither stage nor task
const OLD = JSON.stringify({ v: 1, tool: 'claude-code', session: 'old', turn: 'o1', index: 0, agent: null, kind: 'step', model: 'claude-opus-5-5', at: NOW - 86_400_000, input: 2, cacheRead: 100000, cacheWrite: 2000, output: 900, missing: null }) + '\n'

const BASE: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: ACTIVE,
  [`${CWD}/docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md`]: E2E,
  [`${RUN_DIR}/zadania.json`]: TASKS,
  [`${RUN_DIR}/manifest.json`]: MANIFEST,
  [`${DIR}/2026-10-08-old.jsonl`]: OLD,
}

type Usage = { input_tokens: number, cache_read_input_tokens: number, cache_creation_input_tokens: number, output_tokens: number }
const U = (read: number, write: number, output: number): Usage => ({ input_tokens: 2, cache_read_input_tokens: read, cache_creation_input_tokens: write, output_tokens: output })

function world(on: On, files: Record<string, string>, answers: Record<string, Usage> = {}) {
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
  // Folders too: the map lists the plans and the crew runs
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('agent.spawn', () => ({ model: 'claude-opus-5-5', agentId: 'agent-7' }))
  on('turn.step', async function* ($, e) {
    const usage = answers[`${e.turnId}:${e.agentId ?? 'main'}`] ?? U(100000, 2000, 900)
    const result: TurnStepResult = { turnId: e.turnId, index: e.index, answer: 'x', toolUses: [], stopReason: 'end_turn', usage: { ...usage, model: 'claude-opus-5-5' } }
    return result
  })
  return disk
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

async function step($: Engine, turnId: string, agentId?: string) {
  const s = $.turn.step({ turnId, index: 0, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _chunk of s) { /* the engine's */ }
  await s.result
}

function pane(columns: number) {
  return {
    component: 'Pane' as const, requestId: 'relai-panel',
    props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
  }
}

// A drawing's full ground in another color than the sheet's is a box on it (Łukasz, light
// 2026-10-15: "te dziwne podświetlenia"); the sheet's own color, or none, is no box
const GROUND = 'width="100%" height="100%" fill="'
const groundsOf = (tree: RenderNode | undefined) => [...walk(tree)].filter((n) => n.type === 'Svg').flatMap((n) => {
  const src = String((n.props as { source?: string }).source)
  const out: string[] = []
  for (let at = src.indexOf(GROUND); at >= 0; at = src.indexOf(GROUND, at + 1)) out.push(src.slice(at + GROUND.length, at + GROUND.length + 7))
  return out.filter((c) => c !== THEME.card && !c.startsWith('none')).map((c) => `${String((n.props as { alt?: string }).alt)}: ${c}`)
})

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The width instrument of costs.test.ts (E3), the same rules
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? textOf(node)).length + 4
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

async function openMap($: Engine, surface: 'terminal' | 'desktop', columns = 100) {
  await $.command.run({ command: 'relai-panel' } as never)
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(columns) })
  await ui.press({ key: 'tab-map' })
  return ui
}

// Z14: every section but "Ta sesja" is folded by default; a test that reads cards unfolds theirs
async function unfold(ui: Awaited<ReturnType<typeof openMap>>, ...ids: string[]) {
  for (const id of ids) await ui.press({ key: `fold-map:${id}` })
}

const lines = (text: string | undefined) => String(text ?? '').split('\n').filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>)

describe('the collector tags each record with where the work belonged (E4)', () => {
  test('the stage in progress of the active plan, and a subagent\'s crew task from its prompt', async ($, on) => {
    const disk = world(on, BASE)
    await start($)
    await step($, 'main-1')
    const spawned = await $.agent.spawn({ prompt: `Zrób rdzeń\nWorking directory: ${CWD}\nRelAI crew run: ${RUN}, task: t2\n`, description: 'zadanie t2' } as never)
    expect(spawned.agentId).toBe('agent-7')
    await step($, 'sub-1', 'agent-7')
    await openMap($, 'terminal')
    const recs = lines(disk[FILE])
    expect(recs.map((r) => [r.agent, r.stage, r.task])).toEqual([[null, 'PANEL_X/E2', null], ['agent-7', 'PANEL_X/E2', `${RUN}/t2`]])
  })

  test('no stage in progress: the record says null, never a guess', async ($, on) => {
    const disk = world(on, { ...BASE, [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: ACTIVE.replace('| W TOKU |', '| GOTOWY DO STARTU |') })
    await start($)
    await step($, 'main-1')
    await openMap($, 'terminal')
    expect(lines(disk[FILE]).map((r) => r.stage)).toEqual([null])
  })
})

describe('the map tab', () => {
  for (const surface of ['terminal', 'desktop'] as const) {
    test(`plans, stages with sign and cost, the archived plan's seven stages (${surface})`, async ($, on) => {
      world(on, BASE)
      await start($)
      await step($, 'main-1')
      const ui = await openMap($, surface)
      await unfold(ui, 'active', 'archive')
      const plan = textOf(await ui.find({ key: 'plan-PANEL_X' }))
      expect(plan).toContain('ZAAKCEPTOWANY 2026-10-08 · zamknięte 1 z 3 etapów')
      const now = textOf(await ui.find({ key: 'st-PANEL_X/E2' }))
      expect(now).toContain('●')
      expect(now).toContain('E2 · Mapa przepływu')
      // The cost: a Kalam figure on a desktop (its alt says the amount), text on the terminal
      const row = [...walk(await ui.find({ key: 'st-PANEL_X/E2' }))]
      const figureAlt = row.filter((n) => n.type === 'Svg').map((n) => String((n.props as { alt?: string }).alt ?? '')).join(' ')
      expect(surface === 'desktop' ? figureAlt : now).toMatch(/\$\d+\.\d\d/)
      expect(textOf(await ui.find({ key: 'st-PANEL_X/E3' }))).toContain('bez pomiaru')
      // Closed before the tag, with measurements of before E4 in the project: measured, untagged
      const e1 = textOf(await ui.find({ key: 'st-PANEL_X/E1' }))
      expect(e1).toContain('sprzed znacznika')
      expect(e1).not.toContain('bez pomiaru')
      // The criterion of the plan, on the panel: seven stages, each closed, after unfolding
      expect(textOf(await ui.find({ key: 'plan-PROWADZENIE_END_TO_END' }))).toContain('zamknięte 7 z 7 etapów')
      await ui.press({ key: 'fold-plan:PROWADZENIE_END_TO_END' })
      for (let i = 1; i <= 7; i++) {
        const row = textOf(await ui.find({ key: `st-PROWADZENIE_END_TO_END/E${i}` }))
        expect(row).toContain(`✓E${i} ·`)
        // Closed 2026-09-24, before the first measurement (2026-10-08): never measured, not untagged
        expect(row).toContain('bez pomiaru')
        expect(row).not.toContain('sprzed znacznika')
      }
      // The cost cell keeps its width; the name truncates first (terminal, live 2026-10-09)
      const cell = await ui.find({ key: 'st-fig-PANEL_X/E2' })
      expect((cell?.props as { flexShrink?: number } | undefined)?.flexShrink).toBe(0)
      // The bar of stages: an Svg to hover on a desktop, segments of text on the terminal
      const svgs = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg').map((n) => String((n.props as { alt?: string }).alt ?? ''))
      if (surface === 'desktop') expect(svgs.some((a) => a.includes('● E2 W TOKU'))).toBe(true)
      else {
        expect(svgs).toEqual([])
        expect(textOf(await ui.find({ key: 'strip-PANEL_X' }))).toContain('█')
        expect(textOf(await ui.drawn())).toContain('Mapa przepływu')
      }
    })
  }

  test('every fold of the map unfolded: no drawing lays a ground of its own (light 2026-10-15)', async ($, on) => {
    world(on, BASE)
    await start($)
    const ui = await openMap($, 'desktop')
    for (let round = 0; round < 4; round++) {
      const folds = [...walk(await ui.drawn())].filter((n) => n.type === 'Button' && String((n.props as { key?: string }).key ?? '').startsWith('fold-')
        && !String((n.props as { key?: string }).key).endsWith('~u') && /Rozwiń|Szczegóły/.test(JSON.stringify(n)))
      if (!folds.length) break
      for (const f of folds) await ui.press({ key: String((f.props as { key?: string }).key) })
    }
    const tree = await ui.drawn()
    expect([...walk(tree)].some((n) => n.type === 'Svg' && String((n.props as { alt?: string }).alt).includes('E1'))).toBe(true) // the strip drew
    expect(groundsOf(tree)).toEqual([])
    await ui.unmount()
  })

  test('a bar of segments lays no ground at all: in the frame alone it would stand out as a band (E4, live 2026-10-15)', async ($, on) => {
    // Live 2026-10-15 (WYGLAD_PANELU E4): a tab too heavy for the filled sheet stands in its frame on
    // the app's ground, and each bar's ground in the sheet's color stood out there as a lighter band
    world(on, BASE)
    await start($)
    const ui = await openMap($, 'desktop')
    await unfold(ui, 'active')
    const strips = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg' && String((n.props as { source?: string }).source).includes('class="b b0"'))
    expect(strips.length).toBeGreaterThan(0) // positive control: the active plan's bar drew
    const grounds = strips.flatMap((n) => { const src = String((n.props as { source?: string }).source); const at = src.indexOf(GROUND); return at < 0 ? [] : [src.slice(at + GROUND.length, at + GROUND.length + 4)] })
    expect(grounds.filter((g) => g !== 'none')).toEqual([])
    await ui.unmount()
  })

  test('a branch hangs on the stage it came from', async ($, on) => {
    world(on, BASE)
    await start($)
    const ui = await openMap($, 'terminal')
    await unfold(ui, 'active')
    expect(textOf(await ui.find({ key: 'st-PANEL_X/E2' }))).toContain('1 odnoga')
    await ui.press({ key: 'fold-stage:PANEL_X/E2' })
    const more = textOf(await ui.find({ key: 'st-more-PANEL_X/E2' }))
    expect(more).toContain('Odnogi z tego etapu')
    expect(more).toContain('↳ BOCZNY_WATEK · OTWARTA')
  })

  test('a crew run: waves, the parallel one said so, dependencies and states', async ($, on) => {
    world(on, BASE)
    await start($)
    const ui = await openMap($, 'terminal')
    await unfold(ui, 'crew')
    const run = textOf(await ui.find({ key: `run-${RUN}` }))
    expect(run).toContain('3 zadania · 2 fale')
    expect(run).toContain('Fala 1 · równolegle')
    expect(run).toContain('Fala 2 · pojedynczo')
    expect(textOf(await ui.find({ key: `task-${RUN}/t3` }))).toContain('t3 · czeka · po: t1')
    expect(textOf(await ui.find({ key: `task-${RUN}/t1` }))).toContain('✓')
  })

  test('merging is a view: the panel writes its own file, the run files stay as they were', async ($, on) => {
    const disk = world(on, BASE)
    await start($)
    const ui = await openMap($, 'terminal')
    await unfold(ui, 'crew')
    await ui.press({ key: `pick-${RUN}/t1` })
    await ui.press({ key: `pick-${RUN}/t2` })
    await ui.press({ key: `merge-${RUN}` })
    const saved = JSON.parse(disk[MERGES] ?? '{}') as { groups: { tasks: string[] }[] }
    expect(saved.groups.map((g) => g.tasks)).toEqual([['t1', 't2']])
    expect(disk[`${RUN_DIR}/zadania.json`]).toBe(TASKS)
    expect(disk[`${RUN_DIR}/manifest.json`]).toBe(MANIFEST)
    const merged = textOf(await ui.find({ key: `task-${RUN}/g1` }))
    expect(merged).toContain('Rdzeń mapy + Testy rdzenia')
    expect(merged).toContain('↳ t1 · Rdzeń mapy')
    expect(merged).toContain('↳ t2 · Testy rdzenia')
    // Given a stage on the map, the merged task says it; split, the tasks come back
    await ui.press({ key: `pick-${RUN}/g1` })
    await ui.select({ key: `assign-${RUN}`, value: 'PANEL_X/E2' })
    expect(textOf(await ui.find({ key: `task-${RUN}/g1` }))).toContain('etap E2')
    await ui.press({ key: `split-${RUN}/g1` })
    expect(JSON.parse(disk[MERGES] ?? '{}').groups).toEqual([])
    expect(textOf(await ui.find({ key: `task-${RUN}/t1` }))).toContain('Rdzeń mapy')
  })

  test('outside any stage in words; the costs tab adds the rows up to the session', async ($, on) => {
    world(on, BASE)
    await start($)
    await step($, 'main-1')
    const ui = await openMap($, 'terminal')
    await unfold(ui, 'outside')
    const out = textOf(await ui.find({ key: 'map-outside' }))
    expect(out).toContain('pomiary sprzed znacznika etapu')
    expect(out).toContain('1 wywołanie · wszystkie sesje projektu')
    await ui.press({ key: 'tab-costs' })
    await ui.press({ key: 'fold-costs:stages' }) // folded by default since brief v2 §7 (Z2)
    const check = textOf(await ui.find({ key: 'cost-stages' }))
    expect(check).toContain('PANEL_X · E2')
    expect(check).toContain('✓ Etapy i „poza etapem” razem $')
  })

  test('nothing overflows a pane of 40 columns', async ($, on) => {
    world(on, BASE)
    await start($)
    await step($, 'main-1')
    const ui = await openMap($, 'terminal', 40)
    await unfold(ui, 'active', 'crew', 'outside', 'archive')
    await ui.press({ key: 'fold-stage:PANEL_X/E2' })
    await ui.press({ key: `pick-${RUN}/t1` })
    const drawn = await ui.drawn()
    expect(drawn).toBeDefined()
    expect(minWidth(drawn as RenderNode)).toBeLessThanOrEqual(40)
  })
})

// AUDYT_MODOW Z14 (Aneks B): the map starts with the session's own work — a thread with its packets,
// a stage of a plan, outside any plan, or the choice still to make — and its cost; every other
// section is folded to one line with its number, as in the costs tab, and kept so in $.state.
const FOCUS = `${CWD}/.claude/relai/fokus/session-1.json`
const OTHER = `${DIR}/2026-10-09-other.jsonl`
const CARD_X = [
  '# ODNOGA — X', '', 'Plan: brak · Status: **OTWARTA** ·', '',
  '1. **Z1 · Pierwsza** — a', '2. **Z2 · Druga** — b', '3. **Z3 · Trzecia** — c', '4. **Z4 · Czwarta** — d', '',
  '## Weryfikacja', '', '- [x] Z1: a', '- [x] Z2: b', '- [ ] Z3: c', '- [ ] Z4: d',
].join('\n')
const PANEL_Y = ['# STATUS — plan PANEL_Y', '', '**ZAAKCEPTOWANY 2026-10-01**', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|', '| E1 | Jeden | OCZEKUJE | — | |'].join('\n')
const USE = { input_tokens: 3, cache_read_input_tokens: 40_000, cache_creation_input_tokens: 2_000, output_tokens: 300, model: 'claude-opus-5-5' }

// Records of another session of the project, one per stage given; undefined writes no tag at all
function tagged(stages: (string | null | undefined)[]): MeasureRecord[] {
  return stages.map((stage, i) => {
    const r = stepRecord({ session: 'other', turn: `o${i}`, index: 0, agent: null, model: 'claude-opus-5-5', at: NOW - (i + 1) * 1_000,
      usage: { ...USE, output_tokens: 300 + i }, stage: stage ?? null, task: null })
    if (stage !== undefined) return r
    const { stage: _dropped, ...untagged } = r
    return untagged as MeasureRecord
  })
}
// The cost the card must show, summed here record by record (the map sums through stageCosts)
const sumOf = (records: MeasureRecord[]) => records.reduce((s, r) => s + (priceRecord(r).usd ?? 0), 0)
const focusOn = (f: Record<string, string>) => ({ [FOCUS]: JSON.stringify({ ...f, source: 'manual', at: 1 }) })
const keyOf = (node: RenderNode | undefined) => (node && typeof node !== 'string' ? String((node.props as { key?: string } | undefined)?.key ?? '') : '')
// The tab's sections stand in one ruled column since WYGLAD_PANELU E3 (variant 3, Aneks F)
const firstOfBody = async (ui: Awaited<ReturnType<typeof openMap>>) => keyOf(((await ui.find({ key: 'map-ruled' })) as { children?: RenderNode[] } | undefined)?.children?.[0])

// What a drawing weighs (the instrument of redraw.test.ts, verbatim) and its budget there
const TREE_BUDGET = DRAW_LIMIT + 1 // what the desktop draws (pane-parts.tsx, probe 2026-10-15)
// The weight the desktop's limit counts (treeWeight, measured 2026-10-15), not characters
const weight = (node: RenderNode | undefined) => ({
  chars: treeWeight(node),
  svgs: [...walk(node)].filter((x) => x.type === 'Svg').length,
})

describe('the map tab, focused (Z14)', () => {
  test('a focus on a thread: "Ta sesja" first, the thread with its packets and its own cost', async ($, on) => {
    const records = tagged(['X/Z1', 'X/Z3', 'X/Z3', 'XY/Z1', 'PANEL_X/E2', 'X'])
    const own = records.filter((r) => r.stage === 'X' || String(r.stage).startsWith('X/'))
    expect(own.length).toBe(4) // positive control: XY/Z1 and PANEL_X/E2 are not the thread's
    world(on, { ...BASE, ...focusOn({ kind: 'branch', card: 'X' }), [`${CWD}/docs/fixy/X/ODNOGA.md`]: CARD_X, [OTHER]: serializeRecords(records) })
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await openMap($, surface)
      expect(await firstOfBody(ui)).toBe('map-session')
      const card = await ui.find({ key: 'map-session' })
      expect(textOf(card)).toContain('X (odnoga)')
      expect(textOf(card)).toContain('OTWARTA · zamknięte 2 z 4 paczek')
      expect(textOf(card)).toContain('w toku: Z3 · Trzecia')
      expect([...walk(card)].filter((n) => n.type === 'Button')).toEqual([]) // always unfolded
      const svgs = [...walk(card)].filter((n) => n.type === 'Svg').map((n) => String((n.props as { alt?: string }).alt ?? ''))
      if (surface === 'desktop') {
        expect(svgs).toContain(usd(sumOf(own))) // the cost in Kalam, its alt the amount
        expect(svgs.some((a) => a.includes('✓ Z1') && a.includes('● Z3') && a.includes('○ Z4'))).toBe(true) // the packets' bar
      } else expect(textOf(card)).toContain(usd(sumOf(own)))
      await ui.unmount()
    }
  })

  test('a focus on a stage of a plan: the stage and its own cost', async ($, on) => {
    const records = tagged(['PANEL_X/E2', 'PANEL_X/E2', 'PANEL_X/E1', 'X/Z1'])
    const own = records.filter((r) => r.stage === 'PANEL_X/E2')
    world(on, { ...BASE, ...focusOn({ kind: 'plan', plan: 'PANEL_X', stage: 'E2' }), [OTHER]: serializeRecords(records) })
    await start($)
    const ui = await openMap($, 'terminal')
    expect(await firstOfBody(ui)).toBe('map-session')
    const card = textOf(await ui.find({ key: 'map-session' }))
    expect(card).toContain('PANEL_X · E2')
    expect(card).toContain('W TOKU · Mapa przepływu')
    expect(card).toContain(usd(sumOf(own)))
    expect(card).not.toContain('E1 · Szkielet') // the plan's stages stay in its own card, folded below
  })

  test('no focus while the active plan runs in Codex: the card asks, pointing at "Wybierz pracę…"', async ($, on) => {
    world(on, { ...BASE, [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: ACTIVE.replace('model: Opus', 'model wykonawczy etapów: **gpt-6.1-sol w Codeksie**') })
    await start($)
    const ui = await openMap($, 'terminal')
    const card = textOf(await ui.find({ key: 'map-session' }))
    expect(card).toContain('Praca tej sesji nie wybrana — „Wybierz pracę…” na pasku plan albo „Zmień” w Teraz.')
    expect(card).not.toMatch(/\$\d/)
  })

  test('the five sections folded by default, a line with a number each; an unfolded one kept in $.state', async ($, on) => {
    const archived = tagged(['PROWADZENIE_END_TO_END/E3', 'PROWADZENIE_END_TO_END/E5'])
    world(on, { ...BASE, [`${CWD}/docs/plany/PANEL_Y/STATUS.md`]: PANEL_Y, [OTHER]: serializeRecords(archived) })
    await start($)
    const ui = await openMap($, 'desktop')
    const content: Record<string, string> = { active: 'plan-PANEL_X', open: 'plan-PANEL_Y', crew: `run-${RUN}`, outside: 'out-0', archive: 'plan-PROWADZENIE_END_TO_END' }
    for (const [id, inside] of Object.entries(content)) {
      expect((await ui.find({ key: `fold-map:${id}` }))?.text).toBe('▸ Rozwiń')
      expect(await ui.find({ key: inside })).toBeUndefined()
      expect([...walk(await ui.find({ key: `map-${id}-row` }))].some((n) => n.type === 'Svg')).toBe(true) // the Kalam heading
    }
    expect(textOf(await ui.find({ key: 'map-active-sum' }))).toContain('PANEL_X · W TOKU · zamknięte 1 z 3 etapów')
    expect(textOf(await ui.find({ key: 'map-open-sum' }))).toContain('1 plan')
    expect(textOf(await ui.find({ key: 'map-crew-sum' }))).toBe('1 przebieg')
    expect(textOf(await ui.find({ key: 'map-outside-sum' }))).toContain('1 wywołanie')
    expect(textOf(await ui.find({ key: 'map-archive-sum' }))).toBe(`1 plan zamknięty · ${usd(sumOf(archived))}`)
    await ui.press({ key: 'fold-map:archive' })
    expect((await ui.find({ key: 'fold-map:archive' }))?.text).toBe('▾ Zwiń')
    expect(await ui.find({ key: 'plan-PROWADZENIE_END_TO_END' })).toBeDefined()
    await ui.unmount()
    // Kept by the host: the pane mounted again shows it unfolded
    const again = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    expect(await again.find({ key: 'plan-PROWADZENIE_END_TO_END' })).toBeDefined()
    expect(await again.find({ key: 'plan-PANEL_X' })).toBeUndefined()
    await again.unmount()
  })

  test('weight: twelve archived plans of nine stages, three crew runs and 400 calls, folded', async ($, on) => {
    const archive = Object.fromEntries(Array.from({ length: 12 }, (_, p) => {
      const name = `A${String(p + 1).padStart(2, '0')}`
      const rows = Array.from({ length: 9 }, (_, i) => `| E${i + 1} | Etap numer ${i + 1} planu ${name} | ZREALIZOWANY 2026-09-${String(p + 10)} | — | |`)
      return [`${CWD}/docs/archiwum/plany/${name}/STATUS.md`, [`# STATUS — plan ${name}`, '', `Status: **ZREALIZOWANY 2026-09-${p + 10}**`, '',
        '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|', ...rows].join('\n')]
    }))
    const runs = Object.fromEntries(['2026-10-01_100000', '2026-10-02_100000', '2026-10-03_100000'].flatMap((run) => [
      [`${CWD}/.claude/relai/work/CREW/${run}/zadania.json`, TASKS], [`${CWD}/.claude/relai/work/CREW/${run}/manifest.json`, MANIFEST]]))
    const calls = tagged(Array.from({ length: 400 }, (_, i) => [`X/Z${(i % 4) + 1}`, `A${String((i % 12) + 1).padStart(2, '0')}/E${(i % 9) + 1}`, null, undefined][i % 4]))
    world(on, { ...BASE, ...archive, ...runs, ...focusOn({ kind: 'branch', card: 'X' }), [`${CWD}/docs/fixy/X/ODNOGA.md`]: CARD_X, [OTHER]: serializeRecords(calls) })
    await start($)
    const ui = await openMap($, 'desktop')
    const folded = weight(await ui.drawn())
    // The Svg of a folded map: the pane's title, the five headings, the packets' bar and the cost.
    // Measured 2026-10-11: 43 755 jednostek, 7 Svg — "Ta sesja" still a word, its Kalam art not
    // generated yet (+1 Svg once it is); under the 53 k the desktop was seen drawing (P-023 pkt 7)
    const headings = ['hero', 'map-session', 'map-active', 'map-crew', 'map-outside', 'map-archive'].filter((k) => k in HEADING_ART).length
    // WYGLAD_PANELU E3 (variant 3, Aneks F): a fading rule between each two of the six sections
    const rules = [...walk(visible(await ui.drawn()) as RenderNode)].filter((x) => x.type === 'Svg' && (x.props as { alt?: string }).alt === RULE.alt).length
    expect(rules).toBe(5)
    // Aneks F: every tab stands on the filled sheet — its drawings (top, middles, end) and the hidden
    // copy of the tab, whose drawings are hollow; the Svg the person sees are counted apart
    const seen = [...walk(visible(await ui.drawn()) as RenderNode)].filter((x) => x.type === 'Svg' && !String((x.props as { alt?: string }).alt).startsWith('kartka panelu')).length
    expect(seen).toBe(headings + 2 + rules)
    // under what the desktop draws, measured 2026-10-15 (DRAW_LIMIT; the 53 k of 2026-10-11 was only seen)
    expect(`${folded.chars} jednostek`).toBe(`${Math.min(folded.chars, DRAW_LIMIT)} jednostek`)
    await ui.press({ key: 'fold-map:archive' })
    const unfolded = weight(await ui.drawn())
    expect(unfolded.chars).toBeGreaterThan(folded.chars) // positive control: the archive drew
    expect(`${unfolded.chars} jednostek, ${unfolded.svgs} Svg`).toBe(`${Math.min(unfolded.chars, TREE_BUDGET - 1)} jednostek, ${unfolded.svgs} Svg`)
    await ui.unmount()
  })

  test('weight: every fold of the map unfolded, each archived plan and its stages too (E4, live 2026-10-15)', async ($, on) => {
    // Live 2026-10-15 (WYGLAD_PANELU E4): every "Rozwiń" pressed left the pane blank ("has not drawn"),
    // and the fold kept in $.state drew the same blank after every reload (P-023 pkt 7)
    const archive = Object.fromEntries(Array.from({ length: 12 }, (_, p) => {
      const name = `A${String(p + 1).padStart(2, '0')}`
      const rows = Array.from({ length: 9 }, (_, i) => `| E${i + 1} | Etap numer ${i + 1} planu ${name} | ZREALIZOWANY 2026-09-${String(p + 10)} | — | |`)
      return [`${CWD}/docs/archiwum/plany/${name}/STATUS.md`, [`# STATUS — plan ${name}`, '', `Status: **ZREALIZOWANY 2026-09-${p + 10}**`, '',
        '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|', ...rows].join('\n')]
    }))
    const calls = tagged(Array.from({ length: 400 }, (_, i) => `A${String((i % 12) + 1).padStart(2, '0')}/E${(i % 9) + 1}`))
    world(on, { ...BASE, ...archive, [OTHER]: serializeRecords(calls) })
    await start($)
    const ui = await openMap($, 'desktop')
    const label = (b: RenderElement) => JSON.stringify(b)
    let pressed = 0
    for (let round = 0; round < 80; round++) {
      const next = [...walk(visible(await ui.drawn()) as RenderNode)]
        .find((x) => x.type === 'Button' && keyOf(x as RenderNode).startsWith('fold-') && label(x).includes('Rozwiń'))
      if (!next) break
      await ui.press({ key: keyOf(next as RenderNode) })
      pressed++
    }
    expect(pressed).toBeGreaterThan(3) // positive control: sections and plans unfolded one by one
    const all = weight(await ui.drawn())
    expect(`${all.chars} jednostek`).toBe(`${Math.min(all.chars, TREE_BUDGET - 1)} jednostek`)
    expect(await ui.find({ key: 'pane-heavy' })).toBeDefined() // the weight that blanked the pane was reached
    // Never blank: the tabs and one way back, which folds everything and draws the map again
    expect(await ui.find({ key: 'tab-map' })).toBeDefined()
    await ui.press({ key: 'fold-all' })
    expect((await ui.find({ key: 'fold-map:archive' }))?.text).toBe('▸ Rozwiń')
    expect(weight(await ui.drawn()).chars).toBeLessThanOrEqual(DRAW_LIMIT)
    await ui.unmount()
  })
})

describe('what the desktop draws: weight and characters (E4, live 2026-10-15)', () => {
  const box = (key: string, children: unknown[] = []) => ({ type: 'Box', props: { key }, children })
  const svg = (key: string, chars: number) => ({ type: 'Svg', props: { key, alt: key, source: `<svg>${'x'.repeat(chars)}</svg>` }, children: [] })
  test('the map of 2026-10-15 in the frame alone: under the weight, over the characters — not drawable', () => {
    // As measured live: weight 1 045, 64 hover drawings with 250 k of markup, a blank pane
    const tree = box('pane', [...Array.from({ length: 64 }, (_, i) => svg(`s${i}`, 3_900)), ...Array.from({ length: 700 }, (_, i) => box(`b${i}`))])
    expect(treeWeight(tree)).toBeLessThanOrEqual(DRAW_LIMIT) // the weight alone let it through
    expect(isDrawable(tree)).toBe(false)
  })
  test('the probe that drew: 250 k characters in ~210 elements, and 1 260 light elements (P-023 pkt 7)', () => {
    expect(isDrawable(box('pane', Array.from({ length: 200 }, (_, i) => box(`b${i}`, ['y'.repeat(1_200)]))))).toBe(true)
    expect(isDrawable(box('pane', Array.from({ length: 1_150 }, (_, i) => box(`b${i}`, ['z'.repeat(100)]))))).toBe(true)
  })
})
