import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode } from 'claude-code'
import { fileName, serializeRecords, stepRecord } from './core/measure.mjs'
import type { MeasureRecord } from './core/measure.mjs'
import { NUMSTAT_ARGV } from './core/documents.mjs'

// The pane without I/O in its drawing (AUDYT_MODOW Z3): a tab's data is read when the tab opens and
// after a turn, then kept; a press that only redraws (a filter, a fold, the end of a flash) reads
// no file and starts no process. And the drawn tree stays under one budget for the worst data the
// project can hold (P-023 pkt 7: a tree too big vanishes from the desktop without a word).

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 10, 12, 0).getTime()
const SESSION = 'session-1'
// The working threshold of the card (ODNOGA AUDYT_MODOW, Z3): between the tree seen drawn (53 k)
// and the one that vanished (256 k), with room for what a later section adds
const TREE_BUDGET = 200_000
const BASE: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/STATE.md`]: '# STATE\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: '# STATUS\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n| E1 | A | W TOKU | — | |\n',
}

type Counts = { fs: number, process: number, prices: number, read: string[] }

function world(on: On, files: Record<string, string>, git: { numstat: string, diff: string } = { numstat: '', diff: '' }) {
  const n: Counts = { fs: 0, process: 0, prices: 0, read: [] }
  const broken = { session: false } // set: the engine stops answering the session's id
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => { if (broken.session) throw new Error('silnik nie odpowiada'); return { value: SESSION } })
  on('fs.exists', ($, e) => {
    n.fs += 1
    if (key(e.path).endsWith('/.claude/relai/panel/cennik.json')) n.prices += 1 // one per price-list read
    return { value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }
  })
  on('fs.read', ($, e) => {
    n.fs += 1
    n.read.push(key(e.path))
    return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }
  })
  on('fs.write', ($, e) => { n.fs += 1; disk[key(e.path)] = e.text; return { value: undefined } })
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
  return { n, clock, broken }
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

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')
// What a drawing weighs: its serialized size, the measure P-023 pkt 7 was taken in, and its Svg
const weight = (node: RenderNode | undefined) => ({
  chars: JSON.stringify(node ?? null).length,
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
    expect(`${w.chars} znaków, ${w.svgs} Svg`).toBe(`${Math.min(w.chars, TREE_BUDGET - 1)} znaków, ${w.svgs} Svg`)
    expect(textOf(tree)).toContain('… jeszcze') // the tiles past the limit, in words
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('Pokazano wiersze 1–200')
    expect(String((await ui.find({ key: 'dw-more' }))?.props?.label)).toContain('Pokaż dalej (200 z 201 pozostałych)')
    // The next page of the diff: the rows after the first page, the budget still held
    await ui.press({ key: 'dw-more' })
    const next = await ui.drawn()
    // The hunk's header is the first row: page two holds the diff's lines 199–398
    expect(textOf(next)).toContain('wiersz 398 dziennika')
    expect(textOf(next)).not.toContain('wiersz 198 dziennika')
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('Pokazano wiersze 201–400')
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

  test('costs: a crew session of 14 agents, 14 stages and 400 calls', async ($, on) => {
    world(on, { ...BASE, ...crewSession(14, 14, 400) })
    const ui = await open($, 'costs')
    const tree = await ui.drawn()
    const w = weight(tree)
    expect(`${w.chars} znaków, ${w.svgs} Svg`).toBe(`${Math.min(w.chars, TREE_BUDGET - 1)} znaków, ${w.svgs} Svg`)
    const text = textOf(tree)
    expect(text).toContain('… jeszcze 2') // agents and stages past twelve, in one line each
    expect(text).toMatch(/✓ Etapy i „poza etapem” razem \$[\d.,]+ = suma sesji/) // the check still sums every stage
    await ui.unmount()
  })
})
