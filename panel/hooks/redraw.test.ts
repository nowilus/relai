import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'
import { fileName, serializeRecords, stepRecord } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { NUMSTAT_ARGV } from './core/documents.mjs'
import { DRAW_LIMIT, treeWeight } from './pane-parts'
import { THEME } from './core/theme.mjs'

// The pane without I/O in its drawing (AUDYT_MODOW Z3): a tab's data is read when the tab opens and
// after a turn, then kept; a press that only redraws (a filter, a fold, the end of a flash) reads
// no file and starts no process. And the drawn tree stays under one budget for the worst data the
// project can hold (P-023 pkt 7: a tree too big vanishes from the desktop without a word).

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 10, 12, 0).getTime()
const SESSION = 'session-1'
// The working threshold of the card (ODNOGA AUDYT_MODOW, Z3): between the tree seen drawn (53 k)
// and the one that vanished (256 k), with room for what a later section adds. 210 k since
// WYGLAD_PANELU E3 (Łukasz 2026-10-15, "Próg roboczy 210 tys."): the light palette of every drawing
// added 3.7 k to the costs' worst case, which stood at 199.3 k before; still 18 % under the vanishing
const TREE_BUDGET = DRAW_LIMIT + 1 // what the desktop draws (pane-parts.tsx, probe 2026-10-15)
const BASE: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/STATE.md`]: '# STATE\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: '# STATUS\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n| E1 | A | W TOKU | — | |\n',
}

type Counts = { fs: number, process: number, prices: number, read: string[], written: string[], invalidate: number }
type Uses = Record<string, { name: string, input: unknown }[]>

function world(on: On, files: Record<string, string>, git: { numstat: string, diff: string } = { numstat: '', diff: '' }, uses: Uses = {}) {
  const n: Counts = { fs: 0, process: 0, prices: 0, read: [], written: [], invalidate: 0 }
  const broken = { session: false, write: false } // set: the engine stops answering the session's id / writing the measurements
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => { if (broken.session) throw new Error('silnik nie odpowiada'); return { value: SESSION } })
  on('fs.exists', ($, e) => {
    n.fs += 1
    return { value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }
  })
  on('fs.read', ($, e) => {
    n.fs += 1
    n.read.push(key(e.path))
    if (key(e.path).endsWith('/.claude/relai/panel/cennik.json')) n.prices += 1 // one per price-list read
    return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }
  })
  on('fs.write', ($, e) => {
    n.fs += 1
    if (broken.write && key(e.path).includes('/pomiary/')) return { deny: 'EACCES ' + e.path }
    n.written.push(key(e.path))
    disk[key(e.path)] = e.text
    return { value: undefined }
  })
  // A file's time moves with its text: the same text, the same stamp
  const stampOf = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  on('fs.stat', ($, e) => {
    const k = key(e.path)
    return k in disk ? { value: { kind: 'file' as const, size: (disk[k] ?? '').length, mtimeMs: stampOf(disk[k] ?? ''), isLink: false } } : { deny: 'ENOENT ' + e.path }
  })
  on('ui.invalidate', ($, e, next) => { n.invalidate += 1; return next(e) })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: uses[`${e.turnId}:${e.index}`] ?? [], stopReason: 'end_turn',
      usage: { input_tokens: 3, cache_read_input_tokens: 40_000, cache_creation_input_tokens: 2_000, output_tokens: 300, model: 'claude-opus-5-5' },
    }
    return result
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('fs.list', ($, e) => {
    n.fs += 1
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: (disk[dir + name] ?? '').length, mtimeMs: NOW - 60_000, isLink: false })) }
  })
  on('process.run', ($, e) => {
    n.process += 1
    const out = e.argv.includes('--numstat') ? git.numstat : git.diff
    return { value: { exitCode: 0, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return { n, clock, broken, disk }
}

const pane = (columns: number) => ({
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 80 }, view: {} },
})

async function open($: Engine, tab: string) {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
  await ui.press({ key: `tab-${tab}` })
  return ui
}

// A drawing's full ground in another color than the sheet's is a box on it (Łukasz, light
// 2026-10-15: "te dziwne podświetlenia"); the sheet's own color, or none, is no box
const GROUND = 'width="100%" height="100%" fill="'
const groundsOf = (tree: RenderNode | undefined) => [...walk(tree)].filter((n) => n.type === 'Svg').flatMap((n) => {
  const src = String((n.props as { source?: string }).source)
  const out: string[] = []
  for (let at = src.indexOf(GROUND); at >= 0; at = src.indexOf(GROUND, at + 1)) out.push(src.slice(at + GROUND.length, at + GROUND.length + 7))
  return out.filter((c) => c !== THEME.card).map((c) => `${String((n.props as { alt?: string }).alt)}: ${c}`)
})

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')
// What a drawing weighs: its serialized size, the measure P-023 pkt 7 was taken in, and its Svg
// The weight the desktop's limit counts (treeWeight, measured 2026-10-15), not characters
const weight = (node: RenderNode | undefined) => ({
  chars: treeWeight(node),
  svgs: [...walk(node)].filter((x) => x.type === 'Svg').length,
})

// A session with as many agents, stages and calls as a crew run holds, and other sessions besides
function crewSession(agents: number, stages: number, calls: number): Record<string, string> {
  const records: MeasureRecord[] = []
  for (let i = 0; i < calls; i++) {
    const agent = i % agents === 0 ? null : `agent-${String(i % agents).padStart(2, '0')}-abcdef`
    const usage = { input_tokens: 3, cache_read_input_tokens: 40_000 + i, cache_creation_input_tokens: 2_000, output_tokens: 300, model: 'claude-opus-5-5' }
    records.push(stepRecord({ session: SESSION, turn: `t${Math.floor(i / 4)}`, index: i % 4, agent, model: 'claude-opus-5-5', at: NOW - (calls - i) * 30_000,
      usage, stage: `PANEL_X/E${(i % stages) + 1}`, task: null }))
  }
  const dir = `${CWD}/.claude/relai/pomiary`
  const others = Object.fromEntries([1, 2, 3].map((d) => [`${dir}/2026-10-0${d}-old-${d}.jsonl`, serializeRecords(records.slice(0, 50).map((r) => ({ ...r, session: `old-${d}` })))]))
  return { ...others, [`${dir}/${fileName(new Date(NOW), SESSION)}`]: serializeRecords(records) }
}

describe('the pane reads when a tab opens, not when it draws (Z3)', () => {
  test('costs: opening the tab reads its data once; a redraw and a press with nothing to load read no file', async ($, on) => {
    const { n, clock } = world(on, { ...BASE, ...crewSession(4, 3, 40) })
    const ui = await open($, 'costs')
    expect(n.prices).toBe(1) // one pass of the costs' loader
    expect(textOf(await ui.drawn())).toContain('Suma sesji')
    const before = { fs: n.fs, process: n.process }
    // A redraw from the host (the pane mounted again) and the end of any flash: from memory
    await ui.unmount()
    const again = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    await clock.advance(1000)
    expect(textOf(await again.drawn())).toContain('Suma sesji')
    expect({ fs: n.fs, process: n.process }).toEqual(before)
    // The tab chosen again is the person's refresh: one pass more, no more
    await again.press({ key: 'tab-costs' })
    expect(n.prices).toBe(2)
    await again.unmount()
  })

  test('documents: a filter, a layout and a fold redraw from memory; a document opened runs only what its mode draws', async ($, on) => {
    const files = { ...BASE, [`${CWD}/docs/DZIENNIK.md`]: '# DZIENNIK\n', [`${CWD}/docs/archiwum/A.md`]: '# A\n' }
    const { n } = world(on, files, { numstat: '3\t1\tdocs/STATE.md\n', diff: '@@ -1,1 +1,1 @@\n-a\n+b\n' })
    const ui = await open($, 'docs')
    expect(n.process).toBe(1) // the line counts, once
    const before = { fs: n.fs, process: n.process }
    for (const k of ['docs-f-all', 'docs-l-tree', 'docs-l-tiles', 'fold-docs:all:archive', 'docs-f-changed']) await ui.press({ key: k })
    expect({ fs: n.fs, process: n.process }).toEqual(before)
    // "Otwórz": its diff, one git and no read of the file; "Podgląd": the file, no git
    await ui.press({ key: 'open-edited|docs/STATE.md' })
    expect(n.process).toBe(2)
    expect(n.read.filter((p) => p.endsWith('docs/STATE.md')).length).toBe(0)
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('docs/STATE.md')
    await ui.press({ key: 'dw-preview-btn' })
    expect(n.process).toBe(2)
    expect(n.read.filter((p) => p.endsWith('docs/STATE.md')).length).toBe(1)
    await ui.unmount()
  })

  test('a drawing that throws says so in the pane and keeps the tabs, never an empty pane', async ($, on) => {
    const { broken } = world(on, BASE)
    const ui = await open($, 'commands')
    broken.session = true
    await ui.press({ key: 'tab-docs' })
    const text = textOf(await ui.drawn())
    expect(text).toContain('nie narysował')
    expect(await ui.find({ key: 'tab-commands' })).toBeDefined()
    await ui.unmount()
  })
})

describe('the drawn tree stays under its budget for the worst data (Z3)', () => {
  test('documents: an archive of 128, every group open, a diff of 400 lines open under it', async ($, on) => {
    const files: Record<string, string> = { ...BASE }
    for (let i = 0; i < 128; i++) files[`${CWD}/docs/archiwum/plany/P${Math.floor(i / 8)}/D${String(i).padStart(3, '0')}.md`] = '# D\n'
    // The first one as big as the journal: its preview is cut, never drawn whole
    files[`${CWD}/docs/archiwum/plany/P0/D000.md`] = Array.from({ length: 3000 }, (_, i) => `### 2026-10-${String((i % 28) + 1).padStart(2, '0')} — wpis ${i}\n\nTreść wpisu z listą zmian i ścieżkami plików.\n`).join('\n')
    for (let i = 0; i < 45; i++) files[`${CWD}/docs/zasoby/Z${String(i).padStart(2, '0')}.html`] = '<html></html>'
    for (let i = 0; i < 30; i++) files[`${CWD}/docs/fixy/F${String(i).padStart(2, '0')}.md`] = '# F\n'
    const numstat = Object.keys(files).filter((p) => p.endsWith('.md') || p.endsWith('.html')).map((p) => `4\t1\t${p.slice(CWD.length + 1)}`).join('\n')
    const diff = ['@@ -1,400 +1,400 @@', ...Array.from({ length: 400 }, (_, i) => `${i % 3 === 0 ? '+' : i % 3 === 1 ? '-' : ' '}wiersz ${i} dziennika z treścią wpisu, ścieżką docs/plany/X/STATUS.md i datą`)].join('\n')
    world(on, files, { numstat, diff })
    const ui = await open($, 'docs')
    await ui.press({ key: 'docs-f-all' })
    for (const g of ['resources', 'archive']) await ui.press({ key: `fold-docs:all:${g}` })
    await ui.press({ key: 'open-edited|docs/archiwum/plany/P0/D000.md' })
    const tree = await ui.drawn()
    const w = weight(tree)
    expect(`${w.chars} jednostek, ${w.svgs} Svg`).toBe(`${Math.min(w.chars, TREE_BUDGET - 1)} jednostek, ${w.svgs} Svg`)
    expect(textOf(tree)).toContain('… jeszcze') // the tiles past the limit, in words
    // Too heavy to be drawn twice: the sheet keeps its frame and loses its fill, the tab stays (Aneks F)
    expect((await ui.find({ key: 'pane-sheet' }))?.props?.borderStyle).toBe('round')
    expect(await ui.find({ key: 'pane-sheet~u' })).toBeUndefined()
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('Pokazano wiersze 1–60')
    expect(String((await ui.find({ key: 'dw-more' }))?.props?.label)).toContain('Pokaż dalej (60 z 341 pozostałych)')
    // The next page of the diff: the rows after the first page, the budget still held
    await ui.press({ key: 'dw-more' })
    const next = await ui.drawn()
    // The hunk's header is the first row: page two holds the diff's lines 59–118
    expect(textOf(next)).toContain('wiersz 118 dziennika')
    expect(textOf(next)).not.toContain('wiersz 58 dziennika')
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('Pokazano wiersze 61–120')
    expect(weight(next).chars).toBeLessThan(TREE_BUDGET)
    // The document itself instead of its diff: as big as the journal, under the same budget
    await ui.press({ key: 'dw-preview-btn' })
    const preview = await ui.drawn()
    expect(textOf(preview)).toContain('Pokazano początek dokumentu')
    expect(weight(preview).chars).toBeLessThan(TREE_BUDGET)
    // Closed: the tiles take their room again, the ones past the limit said in words
    await ui.press({ key: 'dw-close' })
    const shelf = await ui.drawn()
    expect(weight(shelf).chars).toBeLessThan(TREE_BUDGET)
    expect(textOf(shelf)).toContain('60 na zakładkę')
    await ui.unmount()
  })

  test('documents: the project’s own tree of 2026-10-10, every folder unfolded, each folder a Button that opens and closes', async ($, on) => {
    // The list of docs/ on the day an unfolded archive stopped drawing (216 files, 128 in the archive)
    const files: Record<string, string> = { ...BASE }
    for (const p of REAL_DOCS) files[`${CWD}/${p}`] = '# x\n'
    world(on, files)
    const ui = await open($, 'docs')
    await ui.press({ key: 'docs-l-tree' })
    await ui.press({ key: 'docs-f-all' })
    const folders = async () => (((await ui.find({ key: 'docs-tree' }))?.children ?? []) as RenderElement[])
      .map((n) => String((n.props as { key?: unknown }).key)).filter((k) => k.startsWith('dir-')).map((k) => k.slice(4))
    const press = (dir: string) => ui.press({ key: `dir-l-${dir}` })
    // Every folder drawn unfolded, the deepest too, until the tree's rows run out
    const done = new Set<string>()
    for (let dir = (await folders())[0]; dir !== undefined; dir = (await folders()).find((d) => !done.has(d))) {
      done.add(dir)
      await press(dir)
    }
    const tree = await ui.drawn()
    expect(weight(tree).chars).toBeLessThan(TREE_BUDGET)
    expect(await folders()).toContain('docs/archiwum/dziennik') // the archive unfolded is drawn
    expect(textOf(tree)).toContain('… jeszcze') // and what the rows leave out is said
    // A press folds what it unfolded: the archive closes, its folders leave the tree
    await press('docs/archiwum')
    expect(await folders()).not.toContain('docs/archiwum/dziennik')
    await press('docs/archiwum')
    expect(await folders()).toContain('docs/archiwum/dziennik')
    await ui.unmount()
  })

  test('costs: a crew session of 14 agents, 14 stages and 400 calls', async ($, on) => {
    world(on, { ...BASE, ...crewSession(14, 14, 400) })
    const ui = await open($, 'costs')
    // The worst drawing: every section unfolded (Z2 folds them by default, brief v2 §7)
    for (const s of ['stages', 'turns', 'agents', 'models', 'pricing']) await ui.press({ key: `fold-costs:${s}` })
    const tree = await ui.drawn()
    const w = weight(tree)
    expect(`${w.chars} jednostek, ${w.svgs} Svg`).toBe(`${Math.min(w.chars, TREE_BUDGET - 1)} jednostek, ${w.svgs} Svg`)
    const text = textOf(tree)
    expect(text).toContain('… jeszcze 2') // agents and stages past twelve, in one line each
    expect(text).toMatch(/✓ Etapy i „poza etapem” razem \$[\d.,]+ = suma sesji/) // the check still sums every stage
    expect(groundsOf(tree)).toEqual([])
    await ui.unmount()
  })
})

async function step($: Engine, turnId: string, index: number) {
  const s = $.turn.step({ turnId, index, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

describe('the panel during a turn (Z4)', () => {
  test('twenty steps: no band-wide redraw, the plan read only when its file moved, the measurements written once at the end', async ($, on) => {
    const STATUS = `${CWD}/docs/plany/PANEL_X/STATUS.md`
    const uses: Uses = { 't1:3': [{ name: 'Write', input: { file_path: `${CWD}/docs/STATE.md`, content: 'x' } }] }
    const { n, disk, clock } = world(on, BASE, { numstat: '', diff: '' }, uses)
    const ui = await open($, 'docs')
    const before = { invalidate: n.invalidate, status: n.read.filter((p) => p === STATUS).length, written: n.written.length }
    for (let i = 0; i < 20; i++) await step($, 't1', i)
    // The documents tab hears of the turn's write through its own state, the bands above the
    // prompt are not drawn again for it
    expect(n.invalidate - before.invalidate).toBe(0)
    expect(textOf(await ui.find({ key: 'docs-turn' }))).toContain('w tej turze')
    expect(n.read.filter((p) => p === STATUS).length - before.status).toBe(0)
    expect(n.written.length - before.written).toBe(0)
    // A stage turned mid-turn: its file moved, the next step reads it
    disk[STATUS] = (disk[STATUS] ?? '').replace('W TOKU', 'ZREALIZOWANY 2026-10-10')
    await step($, 't1', 20)
    expect(n.read.filter((p) => p === STATUS).length - before.status).toBe(1)
    await $.turn.complete({ answer: 'ok', durationMs: 1000, isAborted: false, turnId: 't1', reason: 'answer' } as never)
    await clock.settle()
    const measured = n.written.filter((p) => p.includes('/.claude/relai/pomiary/'))
    expect(measured.length).toBe(1)
    expect((disk[measured[0]!] ?? '').trim().split('\n').length).toBe(21)
    await ui.unmount()
  })

  test('a reload mid-turn loses at most the last moments: the records are written a few seconds after the last step', async ($, on) => {
    const { n, clock } = world(on, BASE)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    for (let i = 0; i < 3; i++) await step($, 't1', i)
    expect(n.written.filter((p) => p.includes('/pomiary/')).length).toBe(0)
    await clock.advance(10_000)
    expect(n.written.filter((p) => p.includes('/pomiary/')).length).toBe(1)
  })

  test('a write of the measurements that fails is said in the costs tab, never swallowed', async ($, on) => {
    const { broken } = world(on, BASE)
    broken.write = true
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await step($, 't1', 0)
    await $.command.run({ command: 'relai-panel' } as never)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    await ui.press({ key: 'tab-costs' })
    expect(textOf(await ui.drawn())).toContain('Nie zapisano pomiarów')
    expect(textOf(await ui.drawn())).toContain('EACCES')
    await ui.unmount()
  })
})

// docs/ of this project on 2026-10-10 (Z10), less the files BASE gives
const REAL_DOCS = [
  "AGENTS.md", "docs/ARTEFAKTY.md", "docs/DECYZJE.md", "docs/DZIENNIK.md", "docs/INSTALACJA.md",
  "docs/KOMENDY.md", "docs/LEKCJE.md", "docs/PRZENOSNOSC.md", "docs/PRZEWODNIK.md", "docs/PULAPKI.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md",
  "docs/archiwum/dziennik/DZIENNIK_2026-09-06_2026-09-14.md", "docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md",
  "docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md", "docs/archiwum/lekcje/LEKCJE_L-0055_L-0069.md",
  "docs/archiwum/lekcje/LEKCJE_L-0070_L-0078.md", "docs/archiwum/lekcje/LEKCJE_L-0079_L-0088.md",
  "docs/archiwum/lekcje/LEKCJE_L-0089_L-0111.md", "docs/archiwum/plany/BUDOWA_RELAI/PLAN.html",
  "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_1.md", "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_10.md",
  "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_2.md", "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_4.md", "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_6.md", "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_7.md",
  "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_8.md", "docs/archiwum/plany/BUDOWA_RELAI/PROMPT_ETAP_9.md",
  "docs/archiwum/plany/BUDOWA_RELAI/STATUS.md", "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PLAN.html",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/PROMPT_ETAP_6.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md",
  "docs/archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/PROMPT_ODNOGA.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md", "docs/archiwum/plany/PANEL_CLAUDE/PLAN.html",
  "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_1.md", "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_3.md", "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_5.md", "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_6.md",
  "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_7.md", "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_8.md",
  "docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_9.md", "docs/archiwum/plany/PANEL_CLAUDE/STATUS.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/DEMO.md", "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/PLAN.html",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/PROBY.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/ZRODLA.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/odnogi/HOOKI_KORZEN/ODNOGA.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/odnogi/HOOKI_KORZEN/PROMPT_ODNOGA.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/01-inicjalizacja.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/02-plan.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/03-akceptacja.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/04-swieza-sesja.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/05-karta-etapu.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/06-decyzja.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/07-decyzja-swieza-sesja.txt",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/README.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/plan-plan.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/plan-status.md",
  "docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/projekt-state.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PLAN.html",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_6.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/PROMPT_ETAP_7.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/REJESTR.md",
  "docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/PLAN.html",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/REKOMENDACJA_MODELU/STATUS.md", "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/E7-REPORT.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PLAN.html",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PLAN_WYDANIE_CODEX_1_10.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_5.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_6.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_7.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_8.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/GUARD_PO_SCIEZCE/ODNOGA.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/GUARD_PO_SCIEZCE/PROMPT_ODNOGA.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/POMIAR_ODNOG/ODNOGA.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/REKOMENDACJA_MODELU/ODNOGA.md",
  "docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/REKOMENDACJA_MODELU/PROMPT_ODNOGA.md",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/PLAN.html",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/PROMPT_ETAP_1.md",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/PROMPT_ETAP_2.md",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/PROMPT_ETAP_3.md",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/PROMPT_ETAP_4.md",
  "docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md", "docs/archiwum/ryzyka/MITYGACJE_2026-09-24.md",
  "docs/archiwum/ryzyka/RYZYKA_2026-08-21.md", "docs/archiwum/ryzyka/RYZYKA_2026-09-04.md",
  "docs/archiwum/ryzyka/RYZYKA_2026-09-14.md", "docs/archiwum/ryzyka/RYZYKA_2026-09-24.md",
  "docs/fixy/AUDYT_MODOW/MAKIETY.html", "docs/fixy/AUDYT_MODOW/ODNOGA.md",
  "docs/fixy/AUDYT_MODOW/PROMPT_ODNOGA.md", "docs/fixy/AUDYT_MODOW/RAPORT.html",
  "docs/fixy/BLOKADA_ROTACJI/ODNOGA.md", "docs/fixy/BLOKADA_ROTACJI/PROMPT_ODNOGA.md",
  "docs/fixy/CURSOR_1_9_1/ODNOGA.md", "docs/fixy/CURSOR_1_9_1/PROMPT_ODNOGA.md",
  "docs/fixy/OPIS_REPO/ODNOGA.md", "docs/fixy/OPIS_REPO/PROMPT_ODNOGA.md",
  "docs/fixy/ORKIESTRACJA/ODNOGA.md", "docs/fixy/PRECOMMIT_ESM/ODNOGA.md",
  "docs/plany/PANEL_CODEX/PLAN.html", "docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md",
  "docs/plany/PANEL_CODEX/PROMPT_START.md", "docs/plany/PANEL_CODEX/PRZEJECIE.md",
  "docs/plany/PANEL_CODEX/STATUS.md", "docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md",
  "docs/zasoby/PANEL_RELAI/WYWIAD.md", "docs/zasoby/branding/banner.svg", "docs/zasoby/branding/diagram.svg",
  "docs/zasoby/branding/ikony/adopt.svg", "docs/zasoby/branding/ikony/audit.svg",
  "docs/zasoby/branding/ikony/backup.svg", "docs/zasoby/branding/ikony/branch.svg",
  "docs/zasoby/branding/ikony/changelog.svg", "docs/zasoby/branding/ikony/clean.svg",
  "docs/zasoby/branding/ikony/crew.svg", "docs/zasoby/branding/ikony/handover.svg",
  "docs/zasoby/branding/ikony/help.svg", "docs/zasoby/branding/ikony/models.svg",
  "docs/zasoby/branding/ikony/prompt.svg", "docs/zasoby/branding/ikony/stage.svg",
  "docs/zasoby/branding/ikony/tour.svg", "docs/zasoby/branding/ikony/update.svg",
  "docs/zasoby/branding/logo.svg", "docs/zasoby/branding/zbuduj.js",
  "docs/zasoby/branding/zrodla/banner.svg", "docs/zasoby/branding/zrodla/diagram.svg",
  "docs/zasoby/branding/zrodla/logo.svg", "docs/zasoby/demo/README.md",
  "docs/zasoby/demo/demo-relai-25s-en.gif", "docs/zasoby/demo/demo-relai-25s-pl.gif",
  "docs/zasoby/demo/demo-relai-60s-en.mp4", "docs/zasoby/demo/demo-relai-60s-pl.mp4",
  "docs/zasoby/demo/zrodla/gif.py", "docs/zasoby/demo/zrodla/glify.py",
  "docs/zasoby/demo/zrodla/pokrycie.py", "docs/zasoby/demo/zrodla/render.js",
  "docs/zasoby/demo/zrodla/sceny.js", "docs/zasoby/design-konkurs/README.md",
  "docs/zasoby/design-konkurs/runda-1/propozycja-1.html",
  "docs/zasoby/design-konkurs/runda-1/propozycja-2.html",
  "docs/zasoby/design-konkurs/runda-1/propozycja-3.html",
  "docs/zasoby/design-konkurs/runda-1/propozycja-4.html",
  "docs/zasoby/design-konkurs/runda-1/propozycja-5.html",
  "docs/zasoby/design-konkurs/runda-2/propozycja-1.html",
  "docs/zasoby/design-konkurs/runda-2/propozycja-2.html",
  "docs/zasoby/design-konkurs/runda-2/propozycja-3.html",
  "docs/zasoby/design-konkurs/runda-2/propozycja-4.html",
  "docs/zasoby/design-konkurs/runda-2/propozycja-5.html", "docs/zasoby/design-konkurs/runda-3/blend.html",
  "docs/zasoby/fonts/LICENCJE.md", "docs/zasoby/fonts/caveat-latin-ext.woff2",
  "docs/zasoby/fonts/caveat-latin.woff2", "docs/zasoby/fonts/fraunces-latin-ext-wonk.woff2",
  "docs/zasoby/fonts/fraunces-latin-wonk.woff2", "docs/zasoby/fonts/hanken-grotesk-latin-ext.woff2",
  "docs/zasoby/fonts/hanken-grotesk-latin.woff2", "docs/zasoby/fonts/instrument-sans-latin-ext.woff2",
  "docs/zasoby/fonts/instrument-sans-latin.woff2", "docs/zasoby/fonts/jetbrains-mono-latin-ext.woff2",
  "docs/zasoby/fonts/jetbrains-mono-latin.woff2", "docs/zasoby/fonts/kalam-400-latin-ext.woff2",
  "docs/zasoby/fonts/kalam-400-latin.woff2", "docs/zasoby/fonts/kalam-700-latin-ext.woff2",
  "docs/zasoby/fonts/kalam-700-latin.woff2",
]
