import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'
import { NUMSTAT_ARGV, treeHref } from './core/documents.mjs'
import { DIFF as DIFF_LOOK } from './core/theme.mjs'

// The documents tab of the RelAI panel (plan PANEL_CLAUDE, E6, Aneks E): a shelf of tiles, the
// documents the turn's writing tools named first, line counts since the last commit, a chosen
// document's diff (the engine's Code, format "diff") or the document itself (Markdown). git runs
// only through the two closed argv of the core; proof by what reached the process stub.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 9, 12, 0).getTime()
const STATE = '# STATE\n\n## Gdzie jesteśmy\n\nE6 w toku.\n'
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/STATE.md`]: STATE,
  [`${CWD}/docs/DZIENNIK.md`]: '# DZIENNIK\n\n## Wpisy\n\n### 2026-10-09 — E6\n\nnowy wpis\n',
  [`${CWD}/docs/LEKCJE.md`]: '# LEKCJE\n\n## Zasady aktywne\n\n1. zasada\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: '# STATUS\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n| E1 | A | W TOKU | — | |\n',
  [`${CWD}/docs/plany/PANEL_X/PLAN.html`]: '<html>plan</html>',
  [`${CWD}/docs/archiwum/stare/STARE.md`]: '# stare',
  [`${CWD}/docs/zasoby/raport.pdf`]: '%PDF-1.7',
  [`${CWD}/docs/zasoby/font.woff2`]: 'wOF2',
  [`${CWD}/src/kod.ts`]: 'export {}',
}
const NUMSTAT = '12\t3\tdocs/STATE.md\n94\t2\tdocs/DZIENNIK.md\n'
const DIFF = ['diff --git a/docs/STATE.md b/docs/STATE.md', 'index 1..2 100644', '--- a/docs/STATE.md', '+++ b/docs/STATE.md',
  '@@ -1,3 +1,3 @@', ' # STATE', '-Stan: E5', '+Stan: E6', ''].join('\n')

type Calls = { argv: string[][] }
type Uses = Record<string, { name: string, input: unknown }[]>

function world(on: On, files: Record<string, string>, uses: Uses = {}, git: 'ok' | 'fail' = 'ok'): Calls {
  const calls: Calls = { argv: [] }
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
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: (disk[dir + name] ?? '').length, mtimeMs: NOW - 18 * 60_000, isLink: false })) }
  })
  on('process.run', ($, e) => {
    calls.argv.push([...e.argv])
    if (git === 'fail') return { value: { exitCode: 128, stdout: '', stderr: 'warning: x\nfatal: not a git repository', isStdoutTruncated: false, isStderrTruncated: false } as never }
    const out = e.argv.includes('--numstat') ? NUMSTAT : DIFF
    return { value: { exitCode: 0, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: uses[`${e.turnId}:${e.index}:${e.agentId ?? 'main'}`] ?? [], stopReason: 'end_turn', usage: null,
    }
    return result
  })
  return calls
}

const pane = (columns: number) => ({
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 80 }, view: {} },
})

async function open($: Engine, surface: 'terminal' | 'desktop' = 'desktop', columns = 100) {
  await $.command.run({ command: 'relai-panel' })
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(columns) })
  await ui.press({ key: 'tab-docs' })
  return ui
}

async function step($: Engine, turnId: string, index: number, agentId?: string) {
  const s = $.turn.step({ turnId, index, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) })
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
}

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')
const props = (n: RenderElement) => (n.props ?? {}) as Record<string, unknown>

// The width instrument of theme.test.ts (E8), plus a Markdown: its longest word, a link's label
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Markdown') return minWidth(String(p.text).replace(/\]\([^)]*\)/g, ']').replace(/[*[\]]/g, ''))
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

describe('the documents tab', () => {
  test('"Zmienione": the edited documents on top as tiles with type, size, edit and lines; the groups folded; git only through its argv', async ($, on) => {
    const calls = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    const ui = await open($)
    const top = textOf(await ui.find({ key: 'docs-turn' }))
    expect(top).toContain('Zmienione · 2')
    const state = textOf(await ui.find({ key: 'tile-edited|docs/STATE.md' }))
    expect(state).toContain('STATE.md')
    expect(state).toContain('dziś 11:42')
    expect(state).toContain('+12')
    expect(state).toContain('−3')
    expect(await ui.find({ key: 'tile-edited|docs/DZIENNIK.md' })).toBeDefined()
    expect(await ui.find({ key: 'tile-edited|CLAUDE.md' })).toBeUndefined() // not edited
    // Every group folded under them, each saying how many it holds and how many are edited
    expect(textOf(await ui.find({ key: 'docs:changed:core-head' }))).toContain('Rdzeń')
    expect(textOf(await ui.find({ key: 'docs:changed:core-head' }))).toContain('1 ze zmianami')
    expect(await ui.find({ key: 'tile-core|docs/STATE.md' })).toBeUndefined()
    expect(textOf(await ui.drawn())).not.toContain('kod.ts') // not a document
    expect(calls.argv).toEqual([[...NUMSTAT_ARGV]])
    // "Wszystkie": the groups open, the resources and the archive still folded
    await ui.press({ key: 'docs-f-all' })
    expect(await ui.find({ key: 'tile-core|docs/STATE.md' })).toBeDefined()
    expect(await ui.find({ key: 'tile-plan|docs/plany/PANEL_X/PLAN.html' })).toBeDefined()
    expect(await ui.find({ key: 'tile-archive|docs/archiwum/stare/STARE.md' })).toBeUndefined()
    await ui.press({ key: 'fold-docs:all:resources' })
    // A desktop draws each icon with its type in outlines, no text and no font inside it
    const icons = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg' && /\.(md|html|pdf)/.test(String(props(n).alt)))
    expect(icons.length).toBeGreaterThan(4)
    expect(icons.every((n) => !/<text|font-face/.test(String(props(n).source)))).toBe(true)
    const pdf = icons.find((n) => String(props(n).alt).startsWith('raport.pdf'))
    expect((String(props(pdf!).source).match(/<path transform=/g) ?? []).length).toBe(3) // P, D, F
    await ui.unmount()
  })

  test('the turn first among the edited: a writing tool, a subagent too; a shell write and the next turn are not', async ($, on) => {
    world(on, FILES, {
      't1:0:main': [{ name: 'Write', input: { file_path: 'C:\\proj\\docs\\STATE.md', content: 'x' } }],
      's1:0:agent-1': [{ name: 'Edit', input: { file_path: 'C:/proj/docs/LEKCJE.md' } }],
      't1:1:main': [{ name: 'Bash', input: { command: 'printf x >> docs/USTAWIENIA.md' } }],
    })
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    await step($, 't1', 0)
    await step($, 's1', 0, 'agent-1')
    await step($, 't1', 1)
    const ui = await open($)
    expect(textOf(await ui.find({ key: 'docs-turn' }))).toContain('Zmienione · 3 · 2 w tej turze')
    const order = ((await ui.find({ key: 'shelf-edited' }))?.children ?? []) as RenderElement[]
    // The turn first (with lines since the commit before without), then the rest of the edited
    expect(order.map((t) => String(props(t).key))).toEqual(['tile-edited|docs/STATE.md', 'tile-edited|docs/LEKCJE.md', 'tile-edited|docs/DZIENNIK.md'])
    expect(await ui.find({ key: 'tile-edited|docs/USTAWIENIA.md' })).toBeUndefined() // a shell write is not seen
    await ui.unmount()
    await step($, 't2', 0)
    const next = await open($)
    const top = textOf(await next.find({ key: 'docs-turn' }))
    expect(top).toContain('Zmienione · 2')
    expect(top).not.toContain('w tej turze ·')
    await next.unmount()
  })

  test('a document opens under where it was chosen: the diff row by row as code review, then the document', async ($, on) => {
    const calls = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    const ui = await open($)
    expect(await ui.find({ key: 'doc-window' })).toBeUndefined() // nothing until a document is chosen
    await ui.press({ key: 'open-edited|docs/STATE.md' })
    const win = await ui.find({ key: 'doc-window' })
    expect(textOf(win)).toContain('docs/STATE.md')
    expect(calls.argv[calls.argv.length - 1]).toEqual(['git', '-c', 'core.quotepath=false', 'diff', '--no-color', '--no-ext-diff', 'HEAD', '--', 'docs/STATE.md'])
    // Row by row as code review draws it: the hunk, a context row, the removed and the added line
    const rows = ((await ui.find({ key: 'dw-diff' }))?.children ?? []) as RenderElement[]
    expect(rows.map((r) => textOf(r))).toEqual(['@@ -1,3 +1,3 @@', '   1    1 # STATE', '   2     −Stan: E5', '        2+Stan: E6'])
    expect(props(rows[2]!).backgroundColor).toBe(DIFF_LOOK.delBg)
    expect(props(rows[3]!).backgroundColor).toBe(DIFF_LOOK.addBg)
    expect(props(rows[1]!).backgroundColor).toBeUndefined()
    await ui.press({ key: 'dw-preview-btn' })
    const md = [...walk(await ui.find({ key: 'doc-window' }))].find((n) => n.type === 'Markdown')
    expect(String(props(md!).text)).toBe(STATE)
    await ui.press({ key: 'dw-close' })
    expect(await ui.find({ key: 'doc-window' })).toBeUndefined()
    // Every process the tab ran was git through the core's argv: the line counts or one shelf document
    expect(calls.argv.every((a) => a[0] === 'git' && a[3] === 'diff')).toBe(true)
    expect(calls.argv.filter((a) => !a.includes('--numstat')).every((a) => a[a.length - 1] === 'docs/STATE.md')).toBe(true)
    await ui.unmount()
  })

  test('the tree as an explorer: names alone, folders by their own name, unfolded by a press on the name', async ($, on) => {
    world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await open($)
    await ui.press({ key: 'docs-l-tree' })
    // "Zmienione": the edited ones on top, each with its folder; the tree below folded
    const top = await ui.find({ key: 'top-docs/STATE.md' })
    expect(textOf(top)).toContain('docs')
    expect(textOf(top)).toContain('+12')
    const linkOf = async (key: string) => String(props([...walk(await ui.find({ key }))].filter((n) => n.type === 'Markdown').at(-1)!).text)
    expect(await linkOf('top-docs/STATE.md')).toBe(`**[STATE.md](${treeHref('doc', 'docs/STATE.md')})**`)
    const tree = async () => (((await ui.find({ key: 'docs-tree' }))?.children ?? []) as RenderElement[]).map((n) => String(props(n).key))
    expect(await tree()).toEqual(['dir-docs', 'row-CLAUDE.md'])
    // The folder: a chevron, its icon closed, its name alone, the edited count; a press opens it
    const folderSvg = async (dir: string) => [...walk(await ui.find({ key: `dir-${dir}` }))].find((n) => n.type === 'Svg')!
    expect(textOf(await ui.find({ key: 'dir-docs' }))).toBe('2')
    expect(await linkOf('dir-docs')).toBe(`**[docs](${treeHref('dir', 'docs')})**`)
    const shut = String(props(await folderSvg('docs')).source)
    await ui.press({ key: 'dir-l-docs', link: { href: treeHref('dir', 'docs') } })
    expect(String(props((await ui.find({ key: 'dir-cl-docs' }))!).text)).toBe(`[▾](${treeHref('dir', 'docs')})`)
    expect(String(props(await folderSvg('docs')).source)).not.toBe(shut)
    expect(String(props(await folderSvg('docs')).alt)).toBe('folder docs, otwarty')
    // Its subfolders first, then its documents, each by its own name and one level in
    expect(await tree()).toEqual(['dir-docs', 'dir-docs/archiwum', 'dir-docs/plany', 'dir-docs/zasoby',
      'row-docs/DZIENNIK.md', 'row-docs/LEKCJE.md', 'row-docs/STATE.md', 'row-docs/USTAWIENIA.md', 'row-CLAUDE.md'])
    expect(await linkOf('dir-docs/plany')).toBe(`[plany](${treeHref('dir', 'docs/plany')})`)
    expect(props((await ui.find({ key: 'row-docs/STATE.md' }))!).paddingLeft).toBe(4)
    expect(props((await ui.find({ key: 'dir-docs/plany' }))!).paddingLeft).toBe(2)
    // The chevron folds it as the name does: a row has no press of its own (2.1.293)
    await ui.press({ key: 'dir-cl-docs/plany', link: { href: treeHref('dir', 'docs/plany') } })
    expect(await tree()).toContain('dir-docs/plany/PANEL_X')
    await ui.press({ key: 'dir-cl-docs/plany', link: { href: treeHref('dir', 'docs/plany') } })
    expect(await tree()).not.toContain('dir-docs/plany/PANEL_X')
    // A document's name opens its window right under its row; a second press closes it
    await ui.press({ key: 'row-l-docs/STATE.md', link: { href: treeHref('doc', 'docs/STATE.md') } })
    const keys = await tree()
    expect(keys[keys.indexOf('row-docs/STATE.md') + 1]).toBe('doc-window')
    await ui.press({ key: 'row-l-docs/STATE.md', link: { href: treeHref('doc', 'docs/STATE.md') } })
    expect(await ui.find({ key: 'doc-window' })).toBeUndefined()
    // "Wszystkie": every folder folded too until pressed (calibration 2026-10-09)
    await ui.press({ key: 'docs-f-all' })
    expect(await tree()).toEqual(['dir-docs', 'row-CLAUDE.md'])
    await ui.unmount()
  })

  test('the tree is bounded: 40 documents a folder, then one line with how many are left', async ($, on) => {
    const many: Record<string, string> = { ...FILES }
    for (let i = 0; i < 55; i++) many[`${CWD}/docs/fixy/F${String(i).padStart(2, '0')}.md`] = '# F'
    world(on, many)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await open($)
    await ui.press({ key: 'docs-l-tree' })
    await ui.press({ key: 'docs-f-all' })
    await ui.press({ key: 'dir-l-docs', link: { href: treeHref('dir', 'docs') } })
    await ui.press({ key: 'dir-l-docs/fixy', link: { href: treeHref('dir', 'docs/fixy') } })
    const keys = (((await ui.find({ key: 'docs-tree' }))?.children ?? []) as RenderElement[]).map((n) => String(props(n).key))
    expect(keys.filter((k) => k.startsWith('row-docs/fixy/')).length).toBe(40)
    expect(textOf(await ui.find({ key: 'more-docs/fixy' }))).toContain('jeszcze 15 pozycji')
    await ui.unmount()
  })

  test('the tree’s icons: a file at tree size with its type, a folder with a dot where something is edited', async ($, on) => {
    world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await open($)
    await ui.press({ key: 'docs-l-tree' })
    await ui.press({ key: 'docs-f-all' })
    await ui.press({ key: 'dir-l-docs', link: { href: treeHref('dir', 'docs') } })
    const svg = async (key: string) => [...walk(await ui.find({ key }))].find((n) => n.type === 'Svg')!
    const pdfFolder = await svg('dir-docs/zasoby')
    expect(String(props(pdfFolder).source)).not.toContain('<circle') // nothing edited in it
    expect(String(props(await svg('dir-docs')).source)).toContain('<circle')
    expect([props(pdfFolder).width, props(pdfFolder).height]).toEqual([24, 20])
    const md = await svg('row-docs/STATE.md')
    expect([props(md).width, props(md).height]).toEqual([17, 20])
    expect((String(props(md).source).match(/<path transform=/g) ?? []).length).toBe(2) // M, D
    await ui.unmount()
  })

  test('an HTML page shows its source, a PDF is said in words; git failing is said and the shelf stays', async ($, on) => {
    world(on, FILES, {}, 'fail')
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    const ui = await open($)
    expect(textOf(await ui.drawn())).toContain('git zakończył się kodem 128: fatal: not a git repository')
    await ui.press({ key: 'docs-f-all' })
    expect(await ui.find({ key: 'tile-core|docs/STATE.md' })).toBeDefined()
    await ui.press({ key: 'open-plan|docs/plany/PANEL_X/PLAN.html' })
    await ui.press({ key: 'dw-preview-btn' })
    // A desktop draws links to https only (2.1.293): the HTML source stands in for the page
    const code = [...walk(await ui.find({ key: 'doc-window' }))].find((n) => n.type === 'Code')
    expect(String(props(code!).source)).toBe('<html>plan</html>')
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('otwórz docs/plany/PANEL_X/PLAN.html w przeglądarce')
    await ui.press({ key: 'fold-docs:all:resources' })
    await ui.press({ key: 'open-resources|docs/zasoby/raport.pdf' })
    expect(textOf(await ui.find({ key: 'doc-window' }))).toContain('Plik PDF — panel nie rysuje go w środku')
    await ui.unmount()
  })

  test('nothing is wider than a 40-column pane, tiles and tree, the window open; the terminal names the type', async ($, on) => {
    world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await open($, surface, 40)
      await ui.press({ key: 'docs-f-all' })
      await ui.press({ key: 'open-edited|docs/STATE.md' })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      await ui.press({ key: 'docs-l-tree' })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      if (surface === 'terminal') {
        expect([...walk(await ui.drawn())].some((n) => n.type === 'Svg')).toBe(false)
        expect(textOf(await ui.find({ key: 'top-docs/STATE.md' }))).toContain('[MD]')
      }
      await ui.press({ key: 'docs-l-tiles' })
      await ui.press({ key: 'dw-close' })
      await ui.unmount()
    }
  })
})
