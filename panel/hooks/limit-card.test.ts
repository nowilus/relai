import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'
import { BAND, BAR } from './core/theme.mjs'
import { presetsFor, rulerColor, rulerSvg, usedWords } from './limit-ruler'

// The plan-limit thresholds on the Koszty tab (LIMIT_CHECKPOINT E4, Aneks B; the ruler and the
// value buttons of Aneks E, Łukasz's choice 2026-10-11): a row per window — its name and where the
// threshold came from, a ruler of what is used now with the threshold as a notch, and buttons of
// values. A value runs relai-cache-keeper's /cache limit-warn[-week] N (the keeper asks the scope);
// "Inna…" runs it without a number (the keeper asks the number, then the scope).

type Engine = Parameters<TestBody>[0]
type Limit = { kind: string, percentUsed: number }

const CWD = 'C:/proj'
const HOME = 'C:/home'
const NOW = new Date(2026, 9, 11, 12, 0).getTime()
const SETTINGS = `${CWD}/docs/USTAWIENIA.md`
const SESSION = `${CWD}/.claude/relai/limit/session-1.json`
const settings = (...rows: string[]) => ['# USTAWIENIA', '', 'Wersja RelAI: 2.8.0', '', '| Data | Czego dotyczy | Decyzja |', '|---|---|---|', ...rows, ''].join('\n')
const SAGE = BAR.segment.done
const CLAY = BAND.cache.color

function world(on: On, files: Record<string, string>, options: { refused?: string[], limits?: Limit[] } = {}) {
  const disk: Record<string, string> = { [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n', ...files }
  const commands: string[] = []
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  mock.env(on, { USERPROFILE: HOME })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.stat', ($, e) => (key(e.path) in disk ? { value: { kind: 'file' as const, size: (disk[key(e.path)] ?? '').length, mtimeMs: 0, isLink: false } } : { deny: 'ENOENT ' + e.path }))
  on('fs.list', () => ({ value: [] }))
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: (options.limits ?? []) as never, cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  // Beneath the panel: relai-cache-keeper's command (or a refusal when the name is not there)
  on('command.run', ($, e) => {
    if ((options.refused ?? []).includes(e.command)) throw new Error(`unknown command /${e.command}`)
    commands.push(`/${e.command} ${e.args ?? ''}`.trim())
    return { text: '' }
  })
  return { disk, commands, clock }
}

const pane = {
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
}

async function costs($: Engine, surface: 'terminal' | 'desktop' = 'terminal') {
  await $.session.start({ cwd: CWD, surface, isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane })
  await ui.press({ key: 'tab-costs' })
  return ui
}

const words = (n: RenderNode | undefined): string[] => (n === undefined ? [] : typeof n === 'string' ? [n] : ((n as { children?: RenderNode[] }).children ?? []).flatMap(words))
const propsOf = (n: RenderNode | undefined) => ((n as { props?: Record<string, unknown> } | undefined)?.props ?? {})
// The value buttons of a window, in order, and which one is lit (a native Button: its label is a prop)
async function buttons(ui: Awaited<ReturnType<typeof costs>>, w: 'five' | 'week') {
  const row = await ui.find({ key: `cost-limit-${w}` })
  const found: { label: string, variant: string }[] = []
  const walk = (n: RenderNode) => {
    if (typeof n === 'string') return
    if (n.type === 'Button') found.push({ label: String(propsOf(n).label), variant: String(propsOf(n).variant ?? '') })
    for (const k of (n as { children?: RenderNode[] }).children ?? []) walk(k)
  }
  if (row) walk(row)
  return found
}

describe('the limit card on the Koszty tab (Aneks E: a ruler and value buttons)', () => {
  test('each window: its name, the source, what is used and the room to the threshold; defaults 90 and 98', async ($, on) => {
    world(on, { [SETTINGS]: settings() }, { limits: [{ kind: 'five_hour', percentUsed: 23 }, { kind: 'seven_day', percentUsed: 6 }] })
    const ui = await costs($)
    const five = words(await ui.find({ key: 'cost-limit-five' })).join(' ')
    expect(five).toContain('limit 5 h')
    expect(five).toContain('próg: domyślny')
    expect(five).toContain('zużyte 23 % · do progu 67 pkt')
    expect(words(await ui.find({ key: 'cost-limit-week' })).join(' ')).toContain('zużyte 6 % · do progu 92 pkt')
    await ui.unmount()
  })

  test('the value buttons: the window\'s choices, the current one lit, an own value added in order, then "Inna…"', async ($, on) => {
    world(on, { [SETTINGS]: settings('| 2026-10-11 | Próg limitu tygodnia | 97 |') })
    const ui = await costs($)
    expect(await buttons(ui, 'five')).toEqual([
      { label: '85 %', variant: 'secondary' }, { label: '90 %', variant: 'primary' }, { label: '95 %', variant: 'secondary' }, { label: 'Inna…', variant: 'secondary' },
    ])
    expect((await buttons(ui, 'week')).map((b) => `${b.label}:${b.variant}`)).toEqual(['95 %:secondary', '97 %:primary', '98 %:secondary', '99 %:secondary', 'Inna…:secondary'])
    expect(words(await ui.find({ key: 'cost-limit-week' })).join(' ')).toContain('próg: ten projekt')
    // No "Zmień" any more: the values are the change
    expect((await ui.findAll({ type: 'Button' })).some((b) => b.props.label === 'Zmień')).toBe(false)
    await ui.unmount()
  })

  test('each level is named: the session file, the project row', async ($, on) => {
    world(on, {
      [SETTINGS]: settings('| 2026-10-11 | Próg limitu tygodnia | 95 |'),
      [SESSION]: JSON.stringify({ prog: 85 }),
      [`${HOME}/.claude/relai/USTAWIENIA.md`]: settings('| 2026-10-11 | Próg limitu | 80 |'),
    })
    const ui = await costs($, 'desktop')
    expect(words(await ui.find({ key: 'cost-limit-five' })).join(' ')).toContain('próg: ta sesja')
    expect((await buttons(ui, 'five')).find((b) => b.variant === 'primary')?.label).toBe('85 %')
    expect(words(await ui.find({ key: 'cost-limit-week' })).join(' ')).toContain('próg: ten projekt')
    await ui.unmount()
  })

  test('a value runs the keeper\'s command with the number; "Inna…" without; the new value shows once its file moved', async ($, on) => {
    const { disk, commands, clock } = world(on, { [SETTINGS]: settings() })
    const ui = await costs($)
    await ui.press({ key: 'limit-set-five-95' })
    await clock.advance(100)
    await ui.press({ key: 'limit-change-week' })
    await clock.advance(100)
    expect(commands).toEqual(['/cache limit-warn 95', '/cache limit-warn-week'])
    // The keeper's scope card answered "Ten projekt": its row lands in the project's settings
    disk[SETTINGS] = settings('| 2026-10-11 | Próg limitu tygodnia | 99 |')
    await clock.advance(2500)
    await ui.unmount()
    const again = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...pane })
    await again.press({ key: 'tab-costs' }).catch(() => undefined)
    expect((await buttons(again, 'week')).find((b) => b.variant === 'primary')?.label).toBe('99 %')
    await again.unmount()
  })

  test('the keeper under its prefixed name: a value tries /cache, then /ckp-cache', async ($, on) => {
    const { commands, clock } = world(on, { [SETTINGS]: settings() }, { refused: ['cache'] })
    const ui = await costs($)
    await ui.press({ key: 'limit-set-five-85' })
    await clock.advance(100)
    expect(commands).toEqual(['/ckp-cache limit-warn 85'])
    await ui.unmount()
  })

  test('on the desktop the ruler is an Svg: the fill to the used share in the battery colour, the notch at the threshold', async ($, on) => {
    world(on, { [SETTINGS]: settings() }, { limits: [{ kind: 'five_hour', percentUsed: 95 }, { kind: 'seven_day', percentUsed: 6 }] })
    const ui = await costs($, 'desktop')
    // An Svg's key is not findable: the ruler is the Svg inside the window's gauge
    const ruler = async (w: string) => {
      const found: RenderNode[] = []
      const walk = (n: RenderNode | undefined) => {
        if (n === undefined || typeof n === 'string') return
        if (n.type === 'Svg') found.push(n)
        for (const k of (n as { children?: RenderNode[] }).children ?? []) walk(k)
      }
      walk(await ui.find({ key: `cost-limit-${w}-gauge` }))
      expect(found.length).toBe(1)
      return propsOf(found[0])
    }
    const five = await ruler('five')
    expect(five.isInteractive).toBe(true)
    expect(String(five.source)).toContain(`width="95%"`)
    expect(String(five.source)).toContain(`fill="${CLAY}"`)
    expect(String(five.source)).toContain('próg 90 %')
    expect(String(five.alt)).toContain('zużyte 95 % · ponad progiem')
    const week = await ruler('week')
    expect(String(week.source)).toContain(`fill="${SAGE}"`)
    expect(String(week.source)).toContain('x="98%"')
    await ui.unmount()
  })

  test('no limit data: the ruler says so, never a seeming zero', async ($, on) => {
    world(on, { [SETTINGS]: settings() })
    const ui = await costs($)
    expect(words(await ui.find({ key: 'cost-limit-five' })).join(' ')).toContain('brak danych o zużyciu')
    expect(words(await ui.find({ key: 'cost-limit-five' })).join(' ')).not.toContain('zużyte 0 %')
    await ui.unmount()
  })
})

describe('the ruler alone', () => {
  test('the words: room to the threshold, past it, no data', () => {
    expect(usedWords(23, 90)).toBe('zużyte 23 % · do progu 67 pkt')
    expect(usedWords(90, 90)).toBe('zużyte 90 % · ponad progiem')
    expect(usedWords(null, 90)).toBe('brak danych o zużyciu')
  })

  test('the colour follows the battery: sage, mustard at 30 % left, clay from the threshold or at 10 % left', () => {
    expect(rulerColor(23, 98)).toBe(SAGE)
    expect(rulerColor(75, 98)).toBe(BAND.panel.color)
    expect(rulerColor(91, 98)).toBe(CLAY)
    expect(rulerColor(14, 1)).toBe(CLAY)
  })

  test('the presets: the window\'s own, an own value in order, never twice', () => {
    expect(presetsFor('five', 90)).toEqual([85, 90, 95])
    expect(presetsFor('five', 98)).toEqual([85, 90, 95, 98])
    expect(presetsFor('five', 1)).toEqual([1, 85, 90, 95])
    expect(presetsFor('week', 98)).toEqual([95, 98, 99])
  })

  test('the threshold label leans away from the edge it is near', () => {
    expect(rulerSvg(23, 98)).toMatch(/<text[^>]*x="98%"[^>]*text-anchor="end"[^>]*>próg 98 %<\/text>/)
    expect(rulerSvg(23, 5)).toMatch(/<text[^>]*x="5%"[^>]*text-anchor="start"[^>]*>próg 5 %<\/text>/)
    expect(rulerSvg(null, 90)).not.toContain('class="fill"')
  })
})

// The pane's narrowest width, minWidth props counted (the costs test's instrument does not count them)
function minCols(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(' ').map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  const own = Number(p.minWidth ?? 0)
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Svg') return own
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : Math.max(0, ...words(node).join(' ').split(' ').map((w) => w.length))
  if (node.type !== 'Box') return 0
  const kids = ((node as { children?: RenderNode[] }).children ?? []).filter((k) => typeof k !== 'string' || k.trim())
  const widths = kids.map(minCols)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, kids.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return Math.max(own, inner + padX + (p.borderStyle ? 2 : 0))
}

describe('the limit card in a narrow pane', () => {
  test('the card fits a 40-column pane on terminal and desktop (minWidth counted)', async ($, on) => {
    world(on, { [SETTINGS]: settings('| 2026-10-11 | Próg limitu tygodnia | 97 |') }, { limits: [{ kind: 'five_hour', percentUsed: 23 }] })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await costs($, surface)
      const card = await ui.find({ key: 'cost-limit' })
      expect(card).toBeDefined()
      expect(minCols(card as RenderNode)).toBeLessThanOrEqual(40)
      await ui.unmount()
    }
  })

  test('the instrument catches a row that cannot wrap (positive control on a planted defect)', () => {
    const planted = { type: 'Box', props: { flexDirection: 'row', columnGap: 2 }, children: [
      { type: 'Box', props: { minWidth: 16 }, children: [] }, { type: 'Box', props: { minWidth: 9 }, children: [] }, { type: 'Button', props: { label: 'Zmień' }, children: [] },
    ] } as unknown as RenderNode
    expect(minCols(planted)).toBeGreaterThan(30)
  })
})
