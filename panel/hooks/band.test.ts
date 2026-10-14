import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { CHIP_KEY, KEY } from './core/theme.mjs'

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

type Calls = { commands: { command: string, args: string }[], prompts: string[], opens: string[], processes: string[][] }

function world(on: On, files: Record<string, string> = FILES, beneath = 'engine'): Calls {
  const calls: Calls = { commands: [], prompts: [], opens: [], processes: [] }
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: new Date(2026, 9, 10, 12, 0).getTime() })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', () => ({ value: [] }))
  on('command.list', () => ({ value: FORMS.map((f) => ({ name: 'relai:' + f.command, description: 'opis', source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 3.5 } } }))
  on('command.run', ($, e) => { calls.commands.push({ command: e.command, args: e.args }); return { text: 'ok' } })
  on('prompt.submit', ($, e) => { calls.prompts.push(e.text); return { text: e.text } })
  on('ui.open', ($, e) => { calls.opens.push(e.id); return { value: { isPlaced: true as const } } })
  // NOWA_SESJA: a Windows host without the app's start_session; what the new-session step runs
  on('env.get', ($, e) => ({ value: e.name === 'OS' ? 'Windows_NT' : undefined }))
  on('tool.list', () => ({ value: [] }))
  on('process.run', ($, e) => { calls.processes.push([...e.argv]); return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never } })
  // The engine's own band beneath the plugin: what it draws must stay
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: beneath, children: [Text({ children: [beneath] })] })
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

// The stage card, prepared in the pane exactly as a person does (E5): nothing is sent by it.
// The chat as picked in the form: /clear by default here (the bar's tests of E5), a new session
// in the tests of NOWA_SESJA
async function prepareStage($: Engine, chat: 'fresh' | 'new' = 'fresh') {
  await $.command.run({ command: 'relai-panel' })
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane })
  await ui.press({ key: 'cmd-relai-stage' })
  await ui.select({ key: 'f-chat', value: chat })
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

  test('the stage name truncates before the figure column; status in the running key, title in the text key', async ($, on) => {
    world(on)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    const row = await ui.find({ key: 'plan' })
    const texts = ((row as { children?: RenderNode[] } | undefined)?.children ?? []) as { type: string, props: Record<string, unknown> }[]
    const [title, status, name] = texts
    expect(title?.props.color).toBe(KEY.text)
    expect(title?.props.bold).toBe(true)
    expect(status?.props.color).toBe(KEY.running)
    expect(status?.props.bold).toBe(true)
    expect(name?.props.color).toBe(KEY.muted)
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
      // WYGLAD_PANELU E1: the chip is its words in the state's theme key, no surface of its own
      expect((chip?.props as { backgroundColor?: string } | undefined)?.backgroundColor).toBeUndefined()
      expect(JSON.stringify(chip)).toContain(`"color":"${CHIP_KEY.warn}"`)
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

  test('"Tak" on the bar with a new session goes the pane\'s way: the link opened, nothing sent to this chat', async ($, on) => {
    const calls = world(on)
    await start($)
    const paneUi = await prepareStage($, 'new')
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    expect(calls.processes).toEqual([]) // positive control: nothing opened before "Tak"
    await ui.press({ key: 'band-yes' })
    expect(sent(calls)).toEqual([])
    expect(calls.processes.map((a) => a.slice(0, 2))).toEqual([['rundll32', 'url.dll,FileProtocolHandler']])
    expect(new URL(String(calls.processes[0]?.[2])).searchParams.get('q')).toBe('/relai:relai-stage PANEL_X E2')
    expect(await ui.find({ key: 'band-confirm' })).toBeUndefined()
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

// AUDYT_MODOW Z13 (Aneks B, decided 2026-10-11: always the button): a session with no work chosen
// while the active plan runs in another tool gets a second row on the plan bar — the sentence on an
// info chip and a native "Wybierz pracę…" that opens the pane on "Teraz" with the choice unfolded.
// The row goes when the work is chosen; a card waiting for "Tak" keeps the one second row.
const IN_CODEX = STATUS.replace('model wykonawczy: Opus, w Claude Code', 'model wykonawczy etapów: **gpt-6.1-sol w Codeksie**')
const ASKING: Record<string, string> = { ...FILES, [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: IN_CODEX }
const FOCUS_FILE = `${CWD}/.claude/relai/fokus/session-1.json`

type Writes = { unfolded: Record<string, boolean>[], view: string[] }

// What the panel wrote to $.state, recorded on its way to the store (registered before world)
function stateWrites(on: On): Writes {
  const w: Writes = { unfolded: [], view: [] }
  on('state.set', ($, e, next) => {
    const x = e as { plugin?: string, key?: string, value?: unknown }
    if (x.plugin === 'relai-panel' && x.key === 'unfolded') w.unfolded.push(x.value as Record<string, boolean>)
    if (x.plugin === 'relai-panel' && x.key === 'view') w.view.push(String(x.value))
    return next(e)
  })
  return w
}

describe('the plan bar, the session\'s work not chosen (Z13)', () => {
  test('a second row: the sentence on an info chip and "Wybierz pracę…"; the first row stays one line', async ($, on) => {
    world(on, ASKING)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar() })
      const row = await ui.find({ key: 'band-focus' })
      expect(row?.text).toContain('ta sesja: praca nie wybrana')
      expect(row?.text).not.toContain('Zmień')
      const chip = await ui.find({ key: 'band-focus-chip' })
      expect((chip?.props as { backgroundColor?: string } | undefined)?.backgroundColor).toBeUndefined()
      expect(JSON.stringify(chip)).toContain(`"color":"${CHIP_KEY.info}"`)
      const pick = await ui.find({ key: 'band-pick' })
      expect(pick?.type).toBe('Button')
      expect(pick?.text).toBe('Wybierz pracę…')
      expect((pick?.props as { variant?: string } | undefined)?.variant).toBe('primary') // every bar button is primary (WYGLAD_PANELU E1)
      expect((row?.props as { flexWrap?: string, marginTop?: number } | undefined)?.flexWrap).toBe('wrap')
      expect((row?.props as { marginTop?: number } | undefined)?.marginTop).toBe(surface === 'desktop' ? 1 : undefined)
      const first = await ui.find({ key: 'plan' })
      expect(first?.text).toContain('aktywny plan: PANEL_X (Codex)')
      expect(first?.text).not.toContain('Wybierz')
      expect((first?.props as { flexWrap?: string } | undefined)?.flexWrap).toBeUndefined()
      await ui.unmount()
    }
  })

  test('"Wybierz pracę…" opens the pane once, on "Teraz" with the choice unfolded', async ($, on) => {
    const writes = stateWrites(on)
    const calls = world(on, ASKING)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    expect(calls.opens).toEqual([]) // positive control: nothing opened before the press
    await ui.press({ key: 'band-pick' })
    expect(calls.opens).toEqual(['relai-panel'])
    expect(writes.unfolded.at(-1)?.['now:focus']).toBe(true)
    expect(writes.view.at(-1)).toBe('commands')
    const paneUi = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane })
    expect(await paneUi.find({ key: 'now-focus-list' })).toBeDefined()
    expect(sent(calls)).toEqual([]) // it opens the pane and chooses nothing by itself
    await paneUi.unmount()
    await ui.unmount()
  })

  test('the work chosen in the pane: the bar is back to one row, no button', async ($, on) => {
    world(on, ASKING)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    await ui.press({ key: 'band-pick' })
    const paneUi = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane })
    await paneUi.press({ key: 'focus-plan:PANEL_X:E2' })
    await paneUi.unmount()
    await ui.unmount()
    const again = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...bar() })
    expect(await again.find({ key: 'band-focus' })).toBeUndefined()
    expect((await again.find({ key: 'plan' }))?.text).toContain('PANEL_X · E2')
    expect(JSON.stringify(await again.drawn())).not.toContain('"Button"')
    await again.unmount()
  })

  test('a focus set from the start: no button, no second row', async ($, on) => {
    const focus = JSON.stringify({ kind: 'plan', plan: 'PANEL_X', stage: 'E2', source: 'manual', at: 1 })
    world(on, { ...ASKING, [FOCUS_FILE]: focus })
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar() })
      expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_X · E2')
      expect(await ui.find({ key: 'band-focus' })).toBeUndefined()
      expect(await ui.find({ key: 'band-pick' })).toBeUndefined()
      await ui.unmount()
    }
  })

  test('a card waiting while the work is not chosen: one second row, the card\'s', async ($, on) => {
    world(on, ASKING)
    await start($)
    await prepareStage($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar() })
      expect(await ui.find({ key: 'band-confirm' })).toBeDefined()
      expect(await ui.find({ key: 'band-focus' })).toBeUndefined()
      expect(await ui.find({ key: 'band-pick' })).toBeUndefined()
      // The sentence is not lost while the card holds the row: the first row says it
      expect((await ui.find({ key: 'plan' }))?.text).toContain('ta sesja: praca nie wybrana')
      await ui.unmount()
    }
  })

  test('nothing is wider than 40 columns with the work not chosen, on terminal and desktop', async ($, on) => {
    world(on, ASKING)
    await start($)
    const widths: string[] = []
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar(40) })
      expect(await ui.find({ key: 'band-pick' })).toBeDefined() // the instrument measures the new row
      widths.push(`${surface} asking: ${minWidth(await ui.drawn())}`)
      await ui.unmount()
    }
    expect(widths.length).toBe(2)
    expect(widths.filter((w) => Number(w.split(': ')[1]) > 40)).toEqual([])
  })
})

// WYGLAD_PANELU E1 (Aneks B, P-042): the bar follows the app's appearance by itself — Box and Text
// in theme keys only, the Svg marks with a dark and a light palette — and fits a narrow split pane
describe('the bar in the tool\'s own colors (WYGLAD_PANELU E1)', () => {
  const HEX = /^#[0-9a-f]{3,8}$/i
  const kidsOf = (n: RenderNode): RenderNode[] => (typeof n === 'string' ? [] : (n as { children?: RenderNode[] }).children ?? [])
  const propsOf = (n: RenderNode): Record<string, unknown> => (typeof n === 'string' ? {} : (n as { props?: Record<string, unknown> }).props ?? {})
  // Every raw color a Box or a Text paints with; an Svg's markup is its own (its marks switch by CSS)
  const rawColors = (n: RenderNode): string[] => {
    if (typeof n === 'string') return []
    const own = n.type === 'Svg' ? [] : ['color', 'backgroundColor', 'borderColor'].map((k) => String(propsOf(n)[k] ?? '')).filter((v) => HEX.test(v))
    return [...own, ...kidsOf(n).flatMap(rawColors)]
  }
  const svgSources = (n: RenderNode): string[] => (typeof n === 'string' ? []
    : [...(n.type === 'Svg' ? [String(propsOf(n).source ?? '')] : []), ...kidsOf(n).flatMap(svgSources)])

  test('no raw color on a Box or a Text, every Svg with both palettes', async ($, on) => {
    world(on, FILES, 'relai-cache-card') // a RelAI bar beneath, so the rule is drawn too
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar(140) })
      const drawn = await ui.drawn()
      expect(rawColors(drawn)).toEqual([])
      const sources = svgSources(drawn)
      if (surface === 'desktop') {
        expect(sources.length).toBeGreaterThan(0) // at least the rule under the card
        for (const s of sources) expect(s).toContain('@media (prefers-color-scheme: light)')
      } else expect(sources).toEqual([])
      await ui.unmount()
    }
  })

  test('fits a narrow split pane, half a window and a full one (40, 70, 140 columns)', async ($, on) => {
    world(on)
    await start($)
    for (const columns of [40, 70, 140]) {
      for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...bar(columns) })
        expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(columns)
        await ui.unmount()
      }
    }
  })
})
