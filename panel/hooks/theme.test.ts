import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { NAMES, THEME } from './core/theme.mjs'

// The RelAI motif of the pane (plan PANEL_CLAUDE, E8): icons for the 14 commands on a desktop,
// text in the same colors on the terminal, and nothing wider than the pane.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const LONG = 'bardzo-długie-słowo-bez-spacji-które-nie-zawinie-się-nigdy-w-żadnym-panelu'
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n',
  [`${CWD}/docs/KOMENDY.md`]: [
    '## Komendy', '', '| Komenda | Co robi | Kiedy użyć |', '|---|---|---|',
    '| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP | przed większą zmianą |', '',
    '## Frazy, które działają', '', '| Powiesz | Co się stanie |', '|---|---|',
    '| „sprawdź status" | krótki raport o stanie projektu, planach, ryzykach i zaległościach dokumentacyjnych |', '',
  ].join('\n'),
}

function pane(columns: number) {
  return {
    component: 'Pane' as const, requestId: 'relai-panel',
    props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
  }
}

function world(on: On) {
  const clock = mock.clock(on, { now: 1_000_000 })
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
  return clock
}

async function open($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
}

// Every element of a drawn tree, depth first
function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  const kids = (node as { children?: RenderNode[] }).children ?? []
  for (const k of kids) yield* walk(k)
}

const textOf = (node: RenderNode): string => typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The narrowest the tree can be drawn, in columns: a Button keeps its whole label ("[ label ]"),
// a Text its longest word unless it truncates, a row the sum of its children and gaps, a
// column the widest child; padding and a border add to both sides. Above the pane = overflow.
export function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : minWidth(textOf(node))
  if (node.type !== 'Box') return 0 // Svg, Input, Select: the surface sizes them to the slot
  const kids = ((node as { children?: RenderNode[] }).children ?? []).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(minWidth)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, kids.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return inner + padX + (p.borderStyle ? 2 : 0)
}

describe('the RelAI motif of the pane', () => {
  test('a desktop draws an icon for each of the 14 commands; the terminal draws none and keeps the cards', async ($, on) => {
    world(on)
    await open($)
    const desk = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    const svgs = [...walk(await desk.drawn())].filter((n) => n.type === 'Svg')
    const icons = svgs.filter((n) => Object.values(NAMES).some(([name]) => (n.props as { alt?: string }).alt === name))
    expect(icons.length).toBe(FORMS.length)
    expect(svgs.some((n) => (n.props as { alt?: string }).alt === 'Panel RelAI')).toBe(true) // the Kalam hero
    await desk.unmount()

    const term = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...pane(100) })
    const tree = [...walk(await term.drawn())]
    expect(tree.filter((n) => n.type === 'Svg')).toEqual([])
    for (const f of FORMS) expect(await term.find({ key: `cmd-${f.command}` })).toBeDefined()
    expect(textOf(await term.drawn())).toContain('Polecane teraz') // the heading as text
    await term.unmount()
  })

  test('nothing is wider than a 40-column pane, on every tab and with a form open', async ($, on) => {
    world(on)
    await open($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(40) })
      const widths: string[] = []
      const measure = async (where: string) => { widths.push(`${surface} ${where}: ${minWidth(await ui.drawn())}`) }
      await measure('commands')
      for (const f of FORMS) {
        await ui.press({ key: `cmd-${f.command}` })
        await measure(f.command)
        await ui.press({ key: `cmd-${f.command}` })
      }
      await ui.press({ key: 'tab-sheet' })
      await measure('sheet')
      await ui.press({ key: 'tab-phrases' })
      await measure('phrases')
      await ui.press({ key: 'tab-commands' })
      await ui.unmount()
      expect(widths.filter((w) => Number(w.split(': ')[1]) > 40)).toEqual([])
      expect(widths.length).toBe(FORMS.length + 3)
    }
  })

  test('a press answers: the card flashes and the send says so, then both return', async ($, on) => {
    const clock = world(on)
    await open($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    const border = async () => ((await ui.find({ key: 'form' }))?.props as { borderColor?: string } | undefined)?.borderColor
    await ui.press({ key: 'cmd-relai-tour' })
    expect(await border()).toBe(THEME.accent) // the card's own flash is on its row, not on the form
    await ui.press({ key: 'send' })
    expect((await ui.find({ key: 'send' }))?.text).toBe('✓ Wysłano')
    expect(await border()).toBe(THEME.pressed)
    await clock.advance(1000)
    expect((await ui.find({ key: 'send' }))?.text).toBe('Wyślij do czatu')
    expect(await border()).toBe(THEME.accent)
    await ui.unmount()
  })

  test('the width check catches a label that cannot fit (planted defect)', () => {
    const row = { type: 'Box', props: { key: 'r', flexDirection: 'row', gap: 1 }, children: [
      { type: 'Text', props: {}, children: ['ikona'] },
      { type: 'Button', props: { key: 'b', label: LONG }, children: [] },
    ] } as unknown as RenderNode
    expect(minWidth(row)).toBeGreaterThan(40)
    const truncated = { type: 'Text', props: { wrap: 'truncate' }, children: [LONG] } as unknown as RenderNode
    expect(minWidth(truncated)).toBe(1)
  })
})
