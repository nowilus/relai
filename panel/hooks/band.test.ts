import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { BAND, BAR, CHIP } from './core/theme.mjs'

// The plan bar of brief v2 (docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md §1–§2, AUDYT_MODOW Z1):
// one calm row, and a second row only while a confirmation card waits for "Tak". The bar shows
// the pane's own card (R4, D-35): its "Tak" and "Nie" go the same way as the pane's, so the proof
// is the effect — what reached the engine stubs beneath the plugin.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const STAGE_NAME = 'Decyzje z karty potwierdzenia nad promptem i w panelu bocznym'
const STATUS = [
  '# STATUS — plan PANEL_X', '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-08** · model wykonawczy: Opus, w Claude Code', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  `| E2 | ${STAGE_NAME} | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |`,
  '| E3 | Koszty | OCZEKUJE | — | |',
].join('\n')
const PROMPT = ['# PROMPT_ETAP_2', '', '## Zakres etapu', '', '**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_X/E2/`.**', '',
  '## Weryfikacja', '', '- [ ] a', '- [ ] b', '', '## Na koniec', '', '- [ ] nie liczy się'].join('\n')

const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1 · zainicjowano: 2026-08-07\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/PANEL_X/PROMPT_ETAP_2.md`]: PROMPT,
}

type Calls = { commands: { command: string, args: string }[], prompts: string[] }

function world(on: On): Calls {
  const calls: Calls = { commands: [], prompts: [] }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: new Date(2026, 9, 10, 12, 0).getTime() })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in FILES }))
  on('fs.read', ($, e) => (key(e.path) in FILES ? { value: FILES[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.list', () => ({ value: [] }))
  on('command.list', () => ({ value: FORMS.map((f) => ({ name: 'relai:' + f.command, description: 'opis', source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 3.5 } } }))
  on('command.run', ($, e) => { calls.commands.push({ command: e.command, args: e.args }); return { text: 'ok' } })
  on('prompt.submit', ($, e) => { calls.prompts.push(e.text); return { text: e.text } })
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  // The engine's own band beneath the plugin: what it draws must stay
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  return calls
}

const bar = (bodyColumns = 140) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})
const pane = {
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 60 }, view: {} },
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

// The stage card, prepared in the pane exactly as a person does (E5): nothing is sent by it
async function prepareStage($: Engine) {
  await $.command.run({ command: 'relai-panel' })
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane })
  await ui.press({ key: 'cmd-relai-stage' })
  await ui.press({ key: 'prepare' })
  return ui
}

const sent = (calls: Calls) => calls.commands.filter((c) => c.command !== 'relai-panel')

const textOf = (node: RenderNode | undefined): string => !node ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

// The narrowest the tree can be drawn, in columns — the instrument of theme.test.ts, verbatim
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

describe('the plan bar, calm', () => {
  test('one row: the plan and stage, its status, the stage name; on the right the stages closed', async ($, on) => {
    world(on)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar() })
      const row = await ui.find({ key: 'plan' })
      expect(row?.text).toContain('PANEL_X · E2')
      expect(row?.text).toContain('GOTOWY DO STARTU')
      expect(row?.text).toContain(STAGE_NAME)
      const props = row?.props as { flexDirection?: string, flexWrap?: string } | undefined
      expect(props?.flexDirection).toBe('row')
      expect(props?.flexWrap).toBeUndefined() // one row: the name truncates, nothing wraps under it
      expect(await ui.find({ key: 'detail' })).toBeUndefined()
      expect(await ui.find({ key: 'band-confirm' })).toBeUndefined() // calm: no second row
      expect((await ui.find({ key: 'figure' }))?.text).toBe('1/3 etapów')
      expect((await ui.find({ key: 'label' }))?.text).toBe('plan')
      expect(textOf(await ui.find({ key: 'relai-band-frame' }))).not.toContain('$3.50')
      expect(JSON.stringify(await ui.drawn())).not.toContain('"Button"') // no button at rest
      await ui.unmount()
    }
  })

  test('the stage name truncates before the figure column; status in the plan color, title in the bar text', async ($, on) => {
    world(on)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    const row = await ui.find({ key: 'plan' })
    const texts = ((row as { children?: RenderNode[] } | undefined)?.children ?? []) as { type: string, props: Record<string, unknown> }[]
    const [title, status, name] = texts
    expect(title?.props.color).toBe(BAR.text)
    expect(title?.props.bold).toBe(true)
    expect(status?.props.color).toBe(BAND.panel.color)
    expect(status?.props.bold).toBe(true)
    expect(name?.props.color).toBe(BAR.muted)
    expect(String(name?.props.wrap)).toMatch(/^truncate/)
    await ui.unmount()
  })
})

describe('the plan bar, a card waiting for "Tak"', () => {
  test('the second row shows the card while it waits and sends nothing by itself', async ($, on) => {
    const calls = world(on)
    await start($)
    await prepareStage($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar() })
      const row = await ui.find({ key: 'band-confirm' })
      expect(row?.text).toContain('Start etapu E2')
      expect(row?.text).toContain('nic nie idzie do czatu bez „Tak”')
      expect((await ui.find({ key: 'band-yes' }))?.text).toBe('Tak')
      expect(((await ui.find({ key: 'band-yes' }))?.props as { variant?: string } | undefined)?.variant).toBe('primary')
      expect((await ui.find({ key: 'band-no' }))?.text).toBe('Nie')
      const chip = await ui.find({ key: 'band-chip' })
      expect((chip?.props as { backgroundColor?: string } | undefined)?.backgroundColor).toBe(CHIP.warn.bg)
      // The native Button is taller than a line (P-021 pkt 6): the row keeps off the first one on the desktop
      expect((row?.props as { marginTop?: number } | undefined)?.marginTop).toBe(surface === 'desktop' ? 1 : undefined)
      expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_X · E2') // the calm row stays
      await ui.unmount()
    }
    expect(sent(calls)).toEqual([])
  })

  test('"Nie" on the bar sends nothing and the row is gone, in the pane too', async ($, on) => {
    const calls = world(on)
    await start($)
    const paneUi = await prepareStage($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    expect(await ui.find({ key: 'band-confirm' })).toBeDefined() // positive control
    await ui.press({ key: 'band-no' })
    expect(await ui.find({ key: 'band-confirm' })).toBeUndefined()
    expect(await paneUi.find({ key: 'confirm-card' })).toBeUndefined()
    expect(sent(calls)).toEqual([])
    expect(calls.prompts).toEqual([])
    await ui.unmount()
    await paneUi.unmount()
  })

  test('"Tak" on the bar runs the card\'s steps as the pane does: /clear, then the stage with its consent', async ($, on) => {
    const calls = world(on)
    await start($)
    const paneUi = await prepareStage($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...bar() })
    expect(sent(calls)).toEqual([]) // positive control of the order below: nothing before "Tak"
    await ui.press({ key: 'band-yes' })
    const out = sent(calls)
    expect(out.map((c) => c.command)).toEqual(['clear', 'relai:relai-stage'])
    expect(out[1]?.args).toMatch(/^PANEL_X E2 --zgoda-panelu karta-[a-z0-9]+-[a-z0-9]+$/)
    expect(await ui.find({ key: 'band-confirm' })).toBeUndefined()
    expect(await paneUi.find({ key: 'confirm-card' })).toBeUndefined()
    await ui.unmount()
    await paneUi.unmount()
  })

  test('a card kept in $.state from before a reload: "Tak" on the bar finds the command\'s name with the pane never opened', async ($, on) => {
    let injected: unknown = {
      id: 'karta-po-przeladowaniu', title: 'Przegląd projektu', facts: [], question: 'Uruchomić?', second: null,
      actions: [{ kind: 'command', command: 'relai-audit', args: '' }], state: 'open', fetch: null,
    }
    const isConfirm = (e: unknown) => (e as { plugin?: string }).plugin === 'relai-panel' && (e as { key?: string }).key === 'confirm'
    on('state.get', ($, e, next) => (isConfirm(e) && injected !== undefined ? { value: { value: injected, version: 1 } } as never : next(e)))
    on('state.set', ($, e, next) => { if (isConfirm(e)) injected = undefined; return next(e) })
    const calls = world(on)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    expect((await ui.find({ key: 'band-confirm' }))?.text).toContain('Przegląd projektu')
    await ui.press({ key: 'band-yes' })
    expect(sent(calls)).toEqual([{ command: 'relai:relai-audit', args: '' }])
    await ui.unmount()
  })

  test('nothing is wider than 40 columns, calm and with the card waiting, on terminal and desktop', async ($, on) => {
    world(on)
    await start($)
    const widths: string[] = []
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar(40) })
      widths.push(`${surface} calm: ${minWidth(await ui.drawn())}`)
      await ui.unmount()
    }
    const paneUi = await prepareStage($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar(40) })
      expect(await ui.find({ key: 'band-confirm' })).toBeDefined()
      widths.push(`${surface} card: ${minWidth(await ui.drawn())}`)
      await ui.unmount()
    }
    await paneUi.unmount()
    expect(widths.length).toBe(4)
    expect(widths.filter((w) => Number(w.split(': ')[1]) > 40)).toEqual([])
  })
})
