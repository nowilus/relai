import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'

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

  test('a branch hangs on the stage it came from', async ($, on) => {
    world(on, BASE)
    await start($)
    const ui = await openMap($, 'terminal')
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
    const out = textOf(await ui.find({ key: 'map-outside' }))
    expect(out).toContain('pomiary sprzed znacznika etapu')
    expect(out).toContain('1 wywołanie · wszystkie sesje projektu')
    await ui.press({ key: 'tab-costs' })
    const check = textOf(await ui.find({ key: 'cost-stages' }))
    expect(check).toContain('PANEL_X · E2')
    expect(check).toContain('✓ Etapy i „poza etapem” razem $')
  })

  test('nothing overflows a pane of 40 columns', async ($, on) => {
    world(on, BASE)
    await start($)
    await step($, 'main-1')
    const ui = await openMap($, 'terminal', 40)
    await ui.press({ key: 'fold-stage:PANEL_X/E2' })
    await ui.press({ key: `pick-${RUN}/t1` })
    const drawn = await ui.drawn()
    expect(drawn).toBeDefined()
    expect(minWidth(drawn as RenderNode)).toBeLessThanOrEqual(40)
  })
})
