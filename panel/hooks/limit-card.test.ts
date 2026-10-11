import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'

// The plan-limit thresholds on the Koszty tab (LIMIT_CHECKPOINT E4, Aneks B; Fable 5.1's proposal,
// accepted by Łukasz 2026-10-11): a row per window — the value and where it came from, as
// relai-cache-keeper reads it — and "Zmień", which runs the keeper's /cache limit-warn[-week]
// without a number: the keeper's cards ask the number and the scope and write the files.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const HOME = 'C:/home'
const NOW = new Date(2026, 9, 11, 12, 0).getTime()
const SETTINGS = `${CWD}/docs/USTAWIENIA.md`
const SESSION = `${CWD}/.claude/relai/limit/session-1.json`
const settings = (...rows: string[]) => ['# USTAWIENIA', '', 'Wersja RelAI: 2.8.0', '', '| Data | Czego dotyczy | Decyzja |', '|---|---|---|', ...rows, ''].join('\n')

function world(on: On, files: Record<string, string>, refused: string[] = []) {
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
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  // Beneath the panel: relai-cache-keeper's command (or a refusal when the name is not there)
  on('command.run', ($, e) => {
    if (refused.includes(e.command)) throw new Error(`unknown command /${e.command}`)
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

describe('the limit card on the Koszty tab', () => {
  test('both windows with value and source; defaults 90 and 98 when no file says otherwise', async ($, on) => {
    world(on, { [SETTINGS]: settings() })
    const ui = await costs($)
    expect(words(await ui.find({ key: 'cost-limit-five' })).join(' ')).toContain('limit 5 h od 90 % domyślny')
    expect(words(await ui.find({ key: 'cost-limit-week' })).join(' ')).toContain('limit tygodnia od 98 % domyślny')
    // "Zmień" is a native Button: its label is a prop, not a child
    const labels = (await ui.findAll({ type: 'Button' })).filter((b) => String(b.props.key ?? '').startsWith('limit-change') || b.props.label === 'Zmień').map((b) => b.props.label)
    expect(labels.filter((l) => l === 'Zmień').length).toBeGreaterThanOrEqual(2)
    await ui.unmount()
  })

  test('each level is named: the session file, the project row, the global row', async ($, on) => {
    world(on, {
      [SETTINGS]: settings('| 2026-10-11 | Próg limitu tygodnia | 95 |'),
      [SESSION]: JSON.stringify({ prog: 85 }),
      [`${HOME}/.claude/relai/USTAWIENIA.md`]: settings('| 2026-10-11 | Próg limitu | 80 |'),
    })
    const ui = await costs($, 'desktop')
    expect(words(await ui.find({ key: 'cost-limit-five' })).join(' ')).toContain('od 85 % ta sesja')
    expect(words(await ui.find({ key: 'cost-limit-week' })).join(' ')).toContain('od 95 % ten projekt')
    await ui.unmount()
  })

  test('"Zmień" runs the keeper\'s command without a number; the new value shows once its file moved', async ($, on) => {
    const { disk, commands, clock } = world(on, { [SETTINGS]: settings() })
    const ui = await costs($)
    await ui.press({ key: 'limit-change-week' })
    await clock.advance(100)
    expect(commands).toEqual(['/cache limit-warn-week'])
    // The keeper's scope card answered "Ten projekt": its row lands in the project's settings
    disk[SETTINGS] = settings('| 2026-10-11 | Próg limitu tygodnia | 99 |')
    await clock.advance(2500)
    await ui.unmount()
    const again = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...pane })
    await again.press({ key: 'tab-costs' }).catch(() => undefined)
    expect(words(await again.find({ key: 'cost-limit-week' })).join(' ')).toContain('od 99 % ten projekt')
    await again.unmount()
  })

  test('the keeper under its prefixed name: "Zmień" tries /cache, then /ckp-cache', async ($, on) => {
    const { commands, clock } = world(on, { [SETTINGS]: settings() }, ['cache'])
    const ui = await costs($)
    await ui.press({ key: 'limit-change-five' })
    await clock.advance(100)
    expect(commands).toEqual(['/ckp-cache limit-warn'])
    await ui.unmount()
  })
})

// The pane's narrowest width, minWidth props counted (the costs test's instrument does not count them)
function minCols(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(' ').map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  const own = Number(p.minWidth ?? 0)
  if (node.type === 'Button') return String(p.label ?? '').length + 4
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
    world(on, { [SETTINGS]: settings() })
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
