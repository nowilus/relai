import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { DIFF, SHEET_DRAW, THEME } from './core/theme.mjs'
import { HIDDEN, rekey, retone, visible } from './skin'
import { treeWeight } from './pane-parts'

// WYGLAD_PANELU E3 (Aneks E, P-044): the pane follows the app's appearance by itself. Texts and
// frames in theme keys, every drawing in both palettes, a filled sheet under the light tabs and a
// frame alone around the heavy ones; on the terminal no sheet at all.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n',
  [`${CWD}/docs/KOMENDY.md`]: '## Komendy\n\n| Komenda | Co robi | Kiedy użyć |\n|---|---|---|\n| `/relai-backup` | pakuje projekt | przed zmianą |\n',
}
const RAW = new Set([...Object.values(THEME), ...Object.values(DIFF)])
const TABS = ['commands', 'costs', 'docs', 'map', 'help'] as const

function world(on: On) {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('fs.exists', ($, e) => ({ value: e.path.replace(/\\/g, '/') in FILES }))
  on('fs.read', ($, e) => ({ value: FILES[e.path.replace(/\\/g, '/')] ?? '' }))
  on('command.list', () => ({ value: FORMS.map((f) => ({ name: 'relai:' + f.command, description: 'opis', source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('command.run', () => ({ text: 'ok' }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
}

async function mount($: Engine, surface: 'desktop' | 'terminal') {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
  return $.ui.mount({ plugin: 'relai-panel', surface, component: 'Pane', requestId: 'relai-panel',
    props: { title: 'RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} } })
}

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const P = (n: RenderElement) => (n.props ?? {}) as Record<string, unknown>
const keyOf = (n: RenderElement) => String(P(n).key ?? '')

describe('the pane in both appearances of the app (WYGLAD_PANELU E3)', () => {
  test('on every tab no text, frame or fill keeps a raw color of the motif: keys only', async ($, on) => {
    world(on)
    const ui = await mount($, 'desktop')
    for (const tab of TABS) {
      await ui.press({ key: `tab-${tab}` })
      const raw = [...walk(await ui.drawn())].flatMap((n) => {
        const p = P(n)
        const hover = (p.hover ?? {}) as Record<string, unknown>
        return [p.color, p.borderColor, p.backgroundColor, hover.borderColor, hover.backgroundColor]
          .filter((c) => typeof c === 'string' && RAW.has(c)).map((c) => `${tab} ${n.type} ${keyOf(n)}: ${String(c)}`)
      })
      expect(raw).toEqual([])
    }
    await ui.unmount()
  })

  test('every drawing that holds a dark color of the motif carries the light one too', async ($, on) => {
    world(on)
    const ui = await mount($, 'desktop')
    for (const tab of TABS) {
      await ui.press({ key: `tab-${tab}` })
      const flat = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg').map((n) => ({ alt: String(P(n).alt), src: String(P(n).source) }))
        .filter((s) => [...RAW].some((c) => s.src.includes(`="${c}"`)) && !s.src.includes('prefers-color-scheme'))
      expect(flat.map((s) => `${tab}: ${s.alt}`)).toEqual([])
    }
    await ui.unmount()
  })

  test('every tab stands on a filled sheet, its frame in the drawing, the copy hidden once (Aneks F)', async ($, on) => {
    world(on)
    const ui = await mount($, 'desktop')
    for (const tab of TABS) {
      await ui.press({ key: `tab-${tab}` })
      const tree = [...walk(await ui.drawn())]
      const paper = tree.filter((n) => n.type === 'Svg' && String(P(n).alt).startsWith('kartka panelu RelAI'))
      const sheet = tree.find((n) => keyOf(n) === 'pane-sheet')
      // no Box border round the sheet: a border clipped the fill inside it (a seam, Łukasz 2026-10-15)
      expect(`${tab}: ${String(P(sheet!).borderStyle)}`).toBe(`${tab}: undefined`)
      expect(`${tab}: ${paper.length}`).toBe(`${tab}: ${2 + SHEET_DRAW.middles}`) // the top, the middles, the end
      expect(paper.every((n) => Number(P(n).height) <= 4096)).toBe(true) // the engine's most
      expect(paper.every((n) => String(P(n).source).includes('width="100%"'))).toBe(true)
      // never a sandwich in a sandwich: one hidden copy at most
      expect(`${tab}: ${tree.filter((n) => keyOf(n).endsWith(HIDDEN + HIDDEN)).length}`).toBe(`${tab}: 0`)
      expect(`${tab}: ${tree.filter((n) => keyOf(n) === `pane-sheet${HIDDEN}`).length}`).toBe(`${tab}: 1`)
      // no two elements share a key, hidden copy included
      const keys = tree.map(keyOf).filter(Boolean)
      expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([])
    }
    await ui.unmount()
  })

  // Aneks F (Łukasz 2026-10-15: "nadal mają te takie dziwne jakieś bordery"): inside the sheet no
  // card has a frame; only a thing that waits for a decision does — the open form is the control
  test('inside the sheet no card is framed; an open form is (Aneks F)', async ($, on) => {
    world(on)
    const ui = await mount($, 'desktop')
    const framed = async () => [...walk(await ui.drawn())].filter((n) => P(n).borderStyle !== undefined && keyOf(n) !== 'pane-sheet').map(keyOf)
    for (const tab of TABS) {
      await ui.press({ key: `tab-${tab}` })
      expect(`${tab}: ${(await framed()).join(', ')}`).toBe(`${tab}: `)
    }
    await ui.press({ key: 'tab-commands' })
    await ui.press({ key: 'cmd-relai-backup' })
    expect((await framed()).length).toBeGreaterThan(0)
    await ui.unmount()
  })

  test('the weight the desktop counts: an element 1, a drawing 5, a hollow one 1 (probe 2026-10-15)', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">' + '<rect/>'.repeat(40) + '</svg>'
    const tree = { type: 'Box', props: {}, children: [
      { type: 'Text', props: {}, children: ['x'] },
      { type: 'Svg', props: { source: svg, alt: 'a' } },
      { type: 'Svg', props: { source: '<svg width="24" height="24"></svg>', alt: '·' } },
    ] }
    expect(treeWeight(tree)).toBe(1 + 1 + 5 + 1)
  })

  // Łukasz, light 2026-10-15 (a plan unfolded on the map): "te dziwne podświetlenia" — a drawing
  // laid its own ground in a tint, a box on the sheet. Every fold of every tab unfolded (the
  // documents' icons aside): a drawing's full ground is the sheet's own color, or none
  test('unfolded, no drawing lays a ground of another color than the sheet', async ($, on) => {
    world(on)
    const ui = await mount($, 'desktop')
    const MARK = 'width="100%" height="100%" fill="'
    for (const tab of ['commands', 'costs', 'map', 'help'] as const) {
      await ui.press({ key: `tab-${tab}` })
      for (let round = 0; round < 4; round++) {
        const folds = [...walk(await ui.drawn())].filter((n) => n.type === 'Button' && keyOf(n).startsWith('fold-') && !keyOf(n).endsWith(HIDDEN)
          && /Rozwiń|Szczegóły/.test(JSON.stringify(n)))
        if (!folds.length) break
        for (const f of folds) await ui.press({ key: keyOf(f) })
      }
      const grounds = [...walk(await ui.drawn())].filter((n) => n.type === 'Svg').flatMap((n) => {
        const src = String(P(n).source)
        const out: string[] = []
        for (let at = src.indexOf(MARK); at >= 0; at = src.indexOf(MARK, at + 1)) out.push(src.slice(at + MARK.length, at + MARK.length + 7))
        return out.filter((c) => c !== THEME.card && c !== 'none"').map((c) => `${tab} ${String(P(n).alt)}: ${c}`)
      })
      expect(grounds).toEqual([])
    }
    await ui.unmount()
  })

  test('the terminal draws no sheet and no copy', async ($, on) => {
    world(on)
    const ui = await mount($, 'terminal')
    const tree = [...walk(await ui.drawn())]
    expect(tree.filter((n) => n.type === 'Svg')).toEqual([])
    expect(tree.filter((n) => keyOf(n).endsWith(HIDDEN))).toEqual([])
    await ui.unmount()
  })

  test('hover where the engine keeps it: on the node, not in props — keyed on the top, gone from the copy', () => {
    // The engine's h() lifts `hover` and `press` out of props onto the node (tree dumped live from the
    // desktop 2026-10-15: 40 rows hovered in the raw "#312c25", a dark bar on the light sheet)
    const built = (globalThis as { h?: (t: string, p: Record<string, unknown>) => unknown }).h
    const node = (built ? built('Box', { key: 'r', hover: { backgroundColor: THEME.cardOn } })
      : { type: 'Box', props: { key: 'r' }, hover: { backgroundColor: THEME.cardOn } }) as Record<string, unknown>
    if (built) expect((node.props as Record<string, unknown>).hover).toBeUndefined()
    expect(node.hover).toEqual({ backgroundColor: THEME.cardOn })
    const lit = retone(node as unknown as RenderNode) as unknown as Record<string, unknown>
    expect(lit.hover).toEqual({ backgroundColor: 'promptBorder' })
    const copy = rekey(node as unknown as RenderNode, HIDDEN) as unknown as Record<string, unknown>
    expect('hover' in copy).toBe(false)
  })

  test('the instruments: retone maps, rekey suffixes, visible drops the copy (planted cases)', () => {
    const tree = { type: 'Box', props: { key: 'a', borderColor: THEME.accent, backgroundColor: THEME.card, hover: { backgroundColor: THEME.cardOn } }, children: [
      { type: 'Text', props: { key: 'b', color: THEME.title }, children: ['x'] },
      { type: 'Svg', props: { key: 'c', alt: 'r', source: `<svg><rect fill="${THEME.card}"/></svg>` } },
    ] } as unknown as RenderNode
    const t = retone(tree) as unknown as { props: Record<string, unknown>, children: { props: Record<string, unknown> }[] }
    expect(t.props.borderColor).toBe('claude')
    expect('backgroundColor' in t.props).toBe(false)
    expect((t.props.hover as Record<string, unknown>).backgroundColor).toBe('promptBorder')
    expect(t.children[0]!.props.color).toBe('text')
    expect(String(t.children[1]!.props.source)).toContain('prefers-color-scheme')
    const copy = rekey(tree, HIDDEN) as unknown as { props: { key: string }, children: { props: { key: string, source?: string } }[] }
    expect(copy.props.key).toBe('a' + HIDDEN)
    expect(copy.children[1]!.props.source).toBe('<svg></svg>') // hollow: the weight is gone
    const both = { type: 'Box', props: { key: 'root' }, children: [copy, tree] } as unknown as RenderNode
    expect([...walk(visible(both) as RenderNode)].map(keyOf)).toEqual(['root', 'a', 'b', 'c'])
  })
})
