import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { THEME } from './core/theme.mjs'
import { visible } from './skin'
import { stepRecord, serializeRecords, fileName } from './core/measure.mjs'
import { pct } from './fmt'

// The side pane after brief v2 (AUDYT_MODOW Z2, docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md
// §6, §7): the header with the tabs in one row, the "Teraz" bar with one main action, the
// commands as two cards and thirteen one-line rows with the form under its row, the costs with
// folded sections, and a `sent` line that does not outlive what it says.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 10, 12, 0).getTime()
const STATUS = [
  '# STATUS — plan PANEL_X', '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-08** · model wykonawczy: Opus, w Claude Code', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Decyzje | W TOKU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
].join('\n')
const PROMPT = ['# PROMPT_ETAP_2', '', '## Weryfikacja', '', '- [x] Rdzeń planu', '- [ ] Sonda mostka w gospodarzu', '- [ ] Testy'].join('\n')
const KOMENDY = [
  '## Komendy', '', '| Komenda | Co robi | Kiedy użyć |', '|---|---|---|',
  '| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP | przed większą zmianą |',
  '| `/relai-tour` | oprowadza po projekcie | gdy wracasz po przerwie |', '',
  '## Frazy, które działają', '', '| Powiesz | Co się stanie |', '|---|---|',
  '| „kontynuujemy pracę" | RelAI odtwarza kontekst |', '| „sprawdź status" | krótki raport |', '',
].join('\n')
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/PANEL_X/PROMPT_ETAP_2.md`]: PROMPT,
  [`${CWD}/docs/KOMENDY.md`]: KOMENDY,
}
// /relai-adopt is not in this session: its row is dimmed
const COMMANDS = FORMS.map((f) => 'relai:' + f.command).filter((c) => c !== 'relai:relai-adopt')

type Calls = { commands: { command: string, args: string }[], reads: string[] }

function world(on: On, files: Record<string, string> = FILES, failing = '') {
  const calls: Calls = { commands: [], reads: [] }
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => { calls.reads.push(key(e.path)); return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path } })
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.stat', ($, e) => (key(e.path) in disk ? { value: { kind: 'file' as const, size: (disk[key(e.path)] ?? '').length, mtimeMs: 1, isLink: false } } : { deny: 'ENOENT ' + e.path }))
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: 1, mtimeMs: NOW, isLink: false })) }
  })
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }))
  on('command.list', () => ({ value: COMMANDS.map((name) => ({ name, description: `opis ${name}`, source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('command.run', ($, e) => {
    if (failing && e.command === failing) throw new Error('surowy błąd silnika')
    calls.commands.push({ command: e.command, args: e.args })
    return { text: 'ok' }
  })
  on('prompt.submit', ($, e) => ({ text: e.text }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return { calls, clock, disk }
}

const pane = (columns: number) => ({
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 60 }, view: {} },
})

async function open($: Engine, surface: 'terminal' | 'desktop' = 'desktop', columns = 100) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'relai-panel' })
  return $.ui.mount({ plugin: 'relai-panel', surface, ...pane(columns) })
}

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const kids = (node: RenderNode | undefined): RenderNode[] => (node && typeof node !== 'string' ? (node as { children?: RenderNode[] }).children ?? [] : [])
const props = (node: RenderNode | undefined) => ((node && typeof node !== 'string' ? node.props : {}) ?? {}) as Record<string, unknown>
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node : kids(node).map(textOf).join('')

// The width instrument of theme.test.ts (E8), verbatim
function minWidth(node: RenderNode): number {
  if (typeof node === 'string') return Math.max(0, ...node.split(/\s+/).map((w) => w.length))
  const p = (node.props ?? {}) as Record<string, unknown>
  if (node.type === 'Button') return String(p.label ?? '').length + 4
  if (node.type === 'Text') return p.wrap && String(p.wrap).startsWith('truncate') ? 1 : minWidth(textOf(node))
  if (node.type !== 'Box') return 0
  const ks = kids(node).filter((k) => typeof k !== 'string' || k.trim())
  const widths = ks.map(minWidth)
  const isRow = p.flexDirection === 'row' && p.flexWrap !== 'wrap'
  const gap = Number(p.columnGap ?? p.gap ?? 0)
  const inner = isRow ? widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, ks.length - 1) : Math.max(0, ...widths)
  const padX = Number(p.paddingLeft ?? p.paddingX ?? p.padding ?? 0) + Number(p.paddingRight ?? p.paddingX ?? p.padding ?? 0)
  return inner + padX + (p.borderStyle ? 2 : 0)
}

// The height instrument, desktop pixels: a line of text 20 px (a cell, so a gap or a padding of
// one is 20 px too), a native Button 28 px (taller than a line, P-021 pkt 6), an Svg its own
// height, a border 2 px a side. A row as tall as its tallest child (the pane is wide enough for
// one line), a column the sum of its children and gaps. No live screenshot: an estimate the
// layout is held to, so a change that adds a line to every row fails here first.
const PX = { line: 20, button: 28, border: 2 }
function height(node: RenderNode): number {
  if (typeof node === 'string') return 0
  const p = props(node)
  if (node.type === 'Text') return PX.line
  if (node.type === 'Button' || node.type === 'Input' || node.type === 'Select') return PX.button
  if (node.type === 'Svg') return Number(p.height ?? 0)
  if (node.type !== 'Box') return 0
  // A box placed absolute takes no room: the sheet's drawings and its top copy (P-044); the hidden
  // copy in flow is what sizes the sheet, as on the desktop
  const hs = kids(node).filter((k) => typeof k !== 'string' && props(k).position !== 'absolute').map(height)
  const isRow = p.flexDirection === 'row'
  const gap = Number(p.rowGap ?? p.gap ?? 0) * PX.line
  const inner = isRow ? Math.max(0, ...hs) : hs.reduce((a, b) => a + b, 0) + gap * Math.max(0, hs.length - 1)
  const padY = (Number(p.paddingTop ?? p.paddingY ?? p.padding ?? 0) + Number(p.paddingBottom ?? p.paddingY ?? p.padding ?? 0)) * PX.line
  return inner + padY + (p.borderStyle ? 2 * PX.border : 0) + Number(p.marginTop ?? 0) * PX.line
}

const FEATURED_V2 = ['relai-stage', 'relai-prompt']
const ROWS = FORMS.map((f) => f.command).filter((c) => !FEATURED_V2.includes(c))

describe('the header and the "Teraz" bar (brief v2 §6.1–6.2)', () => {
  test('one row: the Kalam title and the five tabs in the order of use; no sentence about 14 commands', async ($, on) => {
    world(on)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await open($, surface)
      const head = await ui.find({ key: 'pane-head' })
      expect(props(head).flexDirection).toBe('row')
      const tabs = [...walk(head)].filter((n) => n.type === 'Button').map((n) => String(props(n).label ?? textOf(n)))
      expect(tabs).toEqual(['Komendy', 'Koszty', 'Dokumenty', 'Mapa', 'Pomoc'])
      if (surface === 'desktop') expect([...walk(head)].some((n) => n.type === 'Svg' && props(n).alt === 'Panel RelAI')).toBe(true)
      else expect(textOf(head)).toContain('Panel RelAI')
      expect(textOf(await ui.drawn())).not.toContain('komend RelAI')
      expect(await ui.find({ key: 'tab-sheet' })).toBeUndefined()
      expect(await ui.find({ key: 'tab-phrases' })).toBeUndefined()
      await ui.unmount()
    }
  })

  test('"Teraz": plan and stage, status, segments, 1/3 and the next item from the stage prompt; one primary action', async ($, on) => {
    world(on)
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await open($, surface)
      const now = await ui.find({ key: 'now' })
      // WYGLAD_PANELU E3 (variant 3): on a desktop the first section of the sheet, no card of its
      // own; the terminal keeps its framed card in the key of the motif's mustard
      expect(props(now).borderColor).toBe(surface === 'desktop' ? undefined : 'warning')
      expect(props(now).backgroundColor).toBeUndefined()
      const text = textOf(now)
      expect(text).toContain('PANEL_X · E2')
      expect(text).toContain('W TOKU')
      expect(text).toContain('1/3')
      expect(text).toContain('następny: Sonda mostka w gospodarzu')
      // Only what this plugin knows: the cache and the agents are other mods' to say
      expect(text).not.toMatch(/cache|agent/)
      const segs = await ui.find({ key: 'now-segs' })
      if (surface === 'desktop') expect([...walk(segs)].filter((n) => n.type === 'Svg').length).toBe(1)
      else expect(textOf(segs)).toMatch(/^█+/)
      const buttons = [...walk(now)].filter((n) => n.type === 'Button')
      // One main action; "Zmień" (Z12) is the focus row's own, secondary
      // E3 (live 2026-10-15): on a desktop "Start etapu…" stands on the row of the next item, "Zmień" on the session's row under it
      const order = surface === 'desktop' ? [['Start etapu…', 'primary'], ['Zmień', 'secondary']] : [['Zmień', 'secondary'], ['Start etapu…', 'primary']]
      expect(buttons.map((b) => [props(b).label ?? textOf(b), props(b).variant])).toEqual(order)
      if (surface === 'desktop') {
        // WYGLAD_PANELU E5 (T1): rows a row of air apart; the title row holds no button; "Start
        // etapu…" stands on the words' row, which names one item (Aneks G: „nawalone opisu”)
        expect(props(now).gap).toBe(1)
        expect([...walk(await ui.find({ key: 'now-head' }))].filter((n) => n.type === 'Button')).toEqual([])
        const l2 = await ui.find({ key: 'now-l2' })
        expect([...walk(l2)].filter((n) => n.type === 'Button').map((b) => props(b).label ?? textOf(b))).toEqual(['Start etapu…'])
        expect(textOf(l2)).not.toContain('w toku:')
        // One line, cut with "…" in a box of zero basis (P-043 pkt 6); the whole point on hover
        const words = await ui.find({ key: 'now-words' })
        expect([props(words).width, props(words).flexGrow]).toEqual([0, 1])
        expect(props([...walk(words)].find((n) => n.type === 'Text')).wrap).toBe('truncate')
        expect(props([...walk(segs)].find((n) => n.type === 'Svg')).isInteractive).toBe(true)
      }
      await ui.unmount()
    }
  })

  test('"Start etapu…" opens the stage card in the bar\'s place; "Nie" brings the bar back, nothing sent', async ($, on) => {
    const { calls } = world(on)
    const ui = await open($)
    await ui.press({ key: 'now-start' })
    expect(await ui.find({ key: 'now' })).toBeUndefined()
    expect(textOf(await ui.find({ key: 'confirm-card' }))).toContain('Start etapu')
    await ui.press({ key: 'confirm-no' })
    expect(await ui.find({ key: 'confirm-card' })).toBeUndefined()
    expect(await ui.find({ key: 'now' })).toBeDefined()
    expect(calls.commands.filter((c) => c.command !== 'relai-panel')).toEqual([])
    await ui.unmount()
  })

  test('"Teraz" is read when the tab opens, not when it draws: opening a form reads no file', async ($, on) => {
    const { calls } = world(on)
    const ui = await open($)
    const prompt = () => calls.reads.filter((p) => p.endsWith('PROMPT_ETAP_2.md')).length
    expect(prompt()).toBe(1)
    await ui.press({ key: 'cmd-relai-tour' })
    await ui.press({ key: 'cmd-relai-tour' })
    expect(prompt()).toBe(1)
    await ui.press({ key: 'tab-commands' }) // the tab chosen again is the person's refresh
    expect(prompt()).toBe(2)
    await ui.unmount()
  })

  test('no active plan: "Teraz" says so in words and offers no action but the focus', async ($, on) => {
    world(on, { ...FILES, [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n' })
    const ui = await open($)
    const now = await ui.find({ key: 'now' })
    expect(textOf(now)).toContain('brak aktywnego planu')
    expect([...walk(now)].filter((n) => n.type === 'Button').map((b) => props(b).label)).toEqual(['Zmień'])
    await ui.unmount()
  })
})

// AUDYT_MODOW Z13: "Wybierz pracę…" on the plan bar opens the pane with the focus choice unfolded
describe('"Teraz" opened from the plan bar (Z13)', () => {
  const inCodex = { ...FILES, [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: STATUS.replace('model wykonawczy: Opus, w Claude Code', 'model wykonawczy etapów: **gpt-6.1-sol w Codeksie**'), [`${CWD}/docs/plany/KOD_X/STATUS.md`]: STATUS.replace(/PANEL_X/g, 'KOD_X') }
  const band = { component: 'AbovePrompt' as const, props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } }

  test('the choice shows without a press on "Zmień", whose button says "Zwiń"', async ($, on) => {
    world(on, inCodex)
    // The engine's own band beneath the plugin
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
      const { Box, Text } = $.ui.resolve(e)
      return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
    })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const bar = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...band })
    await bar.press({ key: 'band-pick' })
    await bar.unmount()
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...pane(100) })
    const keys = [...walk(await ui.find({ key: 'now-focus-list' }))].filter((n) => n.type === 'Button').map((b) => String(props(b).key ?? ''))
    expect(keys).toEqual(['focus-plan:KOD_X:E2', 'focus-outside'])
    expect(props(await ui.find({ key: 'now-focus-change' })).label).toBe('Zwiń')
    expect(props(await ui.find({ key: 'tab-commands' })).variant).toBe('primary')
    await ui.unmount()
  })
})

// 2026-10-25 (Łukasz, live): "Polecane teraz" offered the stage of PANEL_CODEX, a plan run in
// Codex. The card offers a stage of a plan run in Claude Code, or says why there is none here.
describe('"Etap planu" in "Polecane teraz" when the active plan runs in another tool', () => {
  const codexStatus = STATUS.replace('model wykonawczy: Opus, w Claude Code', 'model wykonawczy etapów: **gpt-6.1-sol w Codeksie**')
  const codexOnly = { ...FILES, [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: codexStatus }
  const withClaudePlan = { ...codexOnly, [`${CWD}/docs/plany/KOD_X/STATUS.md`]: STATUS.replace(/PANEL_X/g, 'KOD_X') }
  const hintOf = async (files: Record<string, string>, $: Engine, on: On) => {
    const { calls } = world(on, files)
    const ui = await open($)
    // The hint's own key does not survive the card's wrapping: it is the text between the stage
    // card's purpose and the next recommended card
    const featured = textOf(await ui.find({ key: 'featured' }))
    const hint = featured.split('Uruchom następny etap aktywnego planu')[1]?.split('Optymalizator promptu')[0] ?? `brak karty: ${featured}`
    return { calls, ui, hint }
  }

  test('the active plan in Claude Code: the card names its stage, as before', async ($, on) => {
    const { ui, hint } = await hintOf(FILES, $, on)
    expect(hint).toBe('PANEL_X · E2 Decyzje')
    await ui.unmount()
  })

  test('the active plan in Codex, no plan run here: the card says so and names no stage of it', async ($, on) => {
    const { ui, hint } = await hintOf(codexOnly, $, on)
    expect(hint).toBe('aktywny plan PANEL_X prowadzony w Codex — tu brak planu do uruchomienia')
    expect(hint).not.toContain('E2')
    await ui.unmount()
  })

  test('the active plan in Codex, a plan run here: the card names that plan, and "Przygotuj start" reads it', async ($, on) => {
    const { calls, ui, hint } = await hintOf(withClaudePlan, $, on)
    expect(hint).toBe('KOD_X · E2 Decyzje')
    await ui.press({ key: 'cmd-relai-stage' })
    const before = calls.reads.length
    await ui.press({ key: 'prepare' })
    const read = calls.reads.slice(before)
    expect(read).toContain(`${CWD}/docs/plany/KOD_X/STATUS.md`)
    expect(read).not.toContain(`${CWD}/docs/plany/PANEL_X/STATUS.md`)
    await ui.unmount()
  })
})

describe('the commands tab (brief v2 §6.3–6.5, P1)', () => {
  test('two recommended cards with 44 px icons; fourteen rows of one line: 24 px icon, name, command, purpose, "Otwórz"', async ($, on) => {
    world(on)
    const ui = await open($)
    for (const c of FEATURED_V2) {
      const card = await ui.find({ key: `row-${c}` })
      expect([...walk(card)].find((n) => n.type === 'Svg')?.props?.width).toBe(44)
      expect(textOf(card)).toContain('/' + c)
    }
    expect(await ui.find({ key: 'row-relai-tour' })).toBeDefined() // the tour went down to the rows
    expect(ROWS.length).toBe(14) // 16 commands since BEZPIECZENSTWO E1 (relai-security), two of them cards
    for (const c of ROWS) {
      const row = await ui.find({ key: `row-${c}` })
      expect([...walk(row)].find((n) => n.type === 'Svg')?.props?.width).toBe(24)
      // One wrapping row: name, command and purpose as three pieces a cell apart, each wrapping
      // in a narrow pane, never cut (PANEL_WASKI: a space opening a piece does not break)
      const text = await ui.find({ key: `text-${c}` })
      expect(props(text).flexDirection).toBe('row')
      expect(props(text).flexWrap).toBe('wrap')
      const pieces = kids(text)
      expect(pieces.map((n) => (n as RenderElement).type)).toEqual(['Text', 'Text', 'Text'])
      expect(pieces.every((n) => props(n).wrap === undefined && !textOf(n).startsWith(' '))).toBe(true)
      const named = [...walk(row)].filter((n) => n.type === 'Text' && textOf(n).trim() === '/' + c)
      expect(named.length === 1 && props(named[0]).color === 'inactive').toBe(true) // THEME.body in its key (E3)
      expect(props(await ui.find({ key: `cmd-${c}` })).label).toBe(c === 'relai-adopt' ? '—' : 'Otwórz')
    }
    expect(textOf(await ui.find({ key: 'head-relai-stage' }))).toBe('Etap planu/relai-stage') // two pieces, a cell apart
    await ui.unmount()
  })

  test('a command missing in the session: the row dimmed, its button "—"', async ($, on) => {
    world(on)
    const ui = await open($)
    // PANEL_WASKI: a row has no frame of its own on a desktop (the group is the card), so the
    // missing command is dimmed by its words
    const isDim = (node: RenderNode | undefined) => [...walk(node)].some((n) => n.type === 'Text' && props(n).dimColor === true)
    const row = await ui.find({ key: 'row-relai-adopt' })
    expect(isDim(row)).toBe(true)
    expect(textOf(row)).toContain('niedostępna w tej sesji')
    expect(props(await ui.find({ key: 'cmd-relai-adopt' })).label).toBe('—')
    expect(isDim(await ui.find({ key: 'row-relai-backup' }))).toBe(false)
    await ui.unmount()
  })

  test('the form opens under its row; the row stays and its button says "Zamknij"', async ($, on) => {
    world(on)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-tour' })
    const card = await ui.find({ key: 'card-relai-tour' })
    const order = kids(card).map((k) => String(props(k).key))
    expect(order).toEqual(['row-relai-tour', 'form'])
    expect(props(await ui.find({ key: 'form' })).backgroundColor).toBeUndefined() // the sheet shows through (E3)
    expect(props(await ui.find({ key: 'form' })).borderColor).toBe('claude')
    expect(props(await ui.find({ key: 'cmd-relai-tour' })).label).toBe('Zamknij')
    await ui.press({ key: 'cmd-relai-tour' })
    expect(await ui.find({ key: 'form' })).toBeUndefined()
    expect(props(await ui.find({ key: 'cmd-relai-tour' })).label).toBe('Otwórz')
    await ui.unmount()
  })

  test('the 16 commands, "Teraz" and the header fit 1213 px of a desktop', async ($, on) => {
    world(on)
    const ui = await open($)
    const tree = await ui.drawn() // the sheet's hidden copy in flow sizes it (E3, P-044)
    const px = height(tree as RenderNode)
    // HUMANIZACJA E4: "Polecane teraz" spaced like the groups (no gaps) pays for the 15th row.
    // PANEL_WASKI (Łukasz, live 2026-10-14, 94 columns: "nie ma żadnych marginesów pomiędzy
    // przyciskami"): a cell between the rows of a group card, 11 gaps of 20 px; 900 px became 1061.
    // WYGLAD_PANELU E3: the sheet's frame (variant 3, accepted 2026-10-15) adds its two lines: 1065;
    // its margin inside, a line above and under the tab (Łukasz 2026-10-15: "brakuje w ogóle jakichś
    // paddingów w środku"), two more: 1101. WYGLAD_PANELU E5 (Łukasz 2026-10-15: „nie ma żadnych
    // marginów odpowiednich spacingów […] pomiędzy tym paskiem a jakimś tytułem”): "Teraz" in four
    // rows a row of air apart and the bar's drawing with its band for the hover card — 84 px: 1185.
    // BEZPIECZENSTWO E1 added the 16th command (/relai-security): one row and its gap, 28 px: 1213.
    expect(`${px} px`).toBe(`${Math.min(px, 1213)} px`)
    expect(props(await ui.find({ key: 'featured' })).gap).toBeUndefined()
    for (const c of ROWS) expect(height((await ui.find({ key: `row-${c}` })) as RenderNode)).toBeLessThanOrEqual(PX.button + 2 * PX.border)
    await ui.unmount()
  })

  test('the height instrument catches a row of two lines (planted defect)', () => {
    const planted = { type: 'Box', props: { flexDirection: 'row', borderStyle: 'round' }, children: [
      { type: 'Box', props: { flexDirection: 'column' }, children: [{ type: 'Text', props: {}, children: ['a'] }, { type: 'Text', props: {}, children: ['b'] }] },
      { type: 'Button', props: { label: 'Otwórz' }, children: [] },
    ] } as unknown as RenderNode
    expect(height(planted)).toBeGreaterThan(PX.button + 2 * PX.border)
  })
})

// A session with three calls and a subagent: something in every section of the costs
function measured(): Record<string, string> {
  const usage = { input_tokens: 3, cache_read_input_tokens: 40_000, cache_creation_input_tokens: 2_000, output_tokens: 300, model: 'claude-opus-5-5' }
  const records = [0, 1, 2].map((i) => stepRecord({ session: 'session-1', turn: `t${i}`, index: 0, agent: i === 2 ? 'agent-1' : null, model: 'claude-opus-5-5', at: NOW - (3 - i) * 60_000, usage, stage: 'PANEL_X/E2', task: null }))
  return { [`${CWD}/.claude/relai/pomiary/${fileName(new Date(NOW), 'session-1')}`]: serializeRecords(records) }
}

describe('the costs tab (brief v2 §7, P3)', () => {
  const SECTIONS = ['stages', 'turns', 'agents', 'models', 'pricing'] as const
  const CONTENT: Record<string, string> = { stages: 'cost-stages', turns: 'cost-turns', agents: 'cost-agents-0', models: 'cost-models-0', pricing: 'cost-pricing' }

  test('percents without hundredths; the five sections folded with a summary each, unfolded in $.state', async ($, on) => {
    world(on, { ...FILES, ...measured() })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await open($, surface)
      await ui.press({ key: 'tab-costs' })
      // The figure: Kalam on a desktop (its alt), text on the terminal
      const cache = await ui.find({ key: 'cost-cache' })
      const figure = surface === 'desktop' ? String([...walk(cache)].find((n) => n.type === 'Svg')?.props?.alt ?? '') : textOf(cache)
      expect(figure).toMatch(/^\d{1,3} %/)
      expect(textOf(await ui.drawn())).not.toMatch(/\d\.\d\d ?%/)
      for (const s of SECTIONS) {
        const row = await ui.find({ key: `costs-${s}-row` })
        expect(props(row).backgroundColor).toBeUndefined() // on the frame of the tab (E3)
        expect(props(row).borderColor).toBe('subtle')
        expect(textOf(await ui.find({ key: `costs-${s}-sum` })).length).toBeGreaterThan(3)
        expect(props(await ui.find({ key: `fold-costs:${s}` })).label).toBe('▸ Rozwiń')
        expect(await ui.find({ key: CONTENT[s]! })).toBeUndefined()
        if (surface === 'desktop') expect([...walk(row)].some((n) => n.type === 'Svg')).toBe(true) // the Kalam heading
      }
      expect(textOf(await ui.find({ key: 'costs-turns-sum' }))).toContain('3 wywołania w 3 turach')
      expect(textOf(await ui.find({ key: 'costs-agents-sum' }))).toMatch(/\d+ %/)
      await ui.press({ key: 'fold-costs:agents' })
      expect(props(await ui.find({ key: 'fold-costs:agents' })).label).toBe('▾ Zwiń')
      expect(textOf(await ui.find({ key: 'cost-agents-0' }))).toMatch(/\d{1,3} % sesji/)
      await ui.unmount()
      // Kept by the host: the pane mounted again shows it unfolded
      const again = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(100) })
      expect(await again.find({ key: 'cost-agents-0' })).toBeDefined()
      await again.press({ key: 'fold-costs:agents' })
      expect(await again.find({ key: 'cost-agents-0' })).toBeUndefined()
      await again.press({ key: 'tab-commands' })
      await again.unmount()
    }
  })

  test('a whole percent: 95.5 reads 96 %, a share short of the whole never 100 %, above nothing never 0 %', () => {
    expect([pct(955, 1000), pct(996, 1000), pct(1000, 1000), pct(1, 1000), pct(0, 1000), pct(5, 0)]).toEqual(['96 %', '99 %', '100 %', '<1 %', '0 %', '0 %'])
  })

  test('nothing on the costs tab is wider than 40 columns, folded or unfolded', async ($, on) => {
    world(on, { ...FILES, ...measured() })
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await open($, surface, 40)
      await ui.press({ key: 'tab-costs' })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      for (const s of SECTIONS) await ui.press({ key: `fold-costs:${s}` })
      expect(minWidth(await ui.drawn())).toBeLessThanOrEqual(40)
      for (const s of SECTIONS) await ui.press({ key: `fold-costs:${s}` })
      await ui.press({ key: 'tab-commands' })
      await ui.unmount()
    }
  })
})

describe('the sent line (UX-16)', () => {
  test('a success goes after 10 s; a newer one is not cleared by the older timer', async ($, on) => {
    const { clock } = world(on)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-tour' })
    await ui.press({ key: 'send' })
    expect(textOf(await ui.find({ key: 'sent' }))).toContain('Wysłano do czatu: /relai:relai-tour')
    await clock.advance(6_000)
    await ui.press({ key: 'send' }) // the same words again, six seconds later
    await clock.advance(5_000) // the first one's ten seconds are over
    expect(await ui.find({ key: 'sent' })).toBeDefined()
    await clock.advance(5_000)
    expect(await ui.find({ key: 'sent' })).toBeUndefined()
    await ui.unmount()
  })

  test('an error stays, starts with what to do and never shows the engine\'s words alone', async ($, on) => {
    const { clock } = world(on, FILES, 'relai:relai-tour')
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-tour' })
    await ui.press({ key: 'send' })
    await clock.advance(30_000)
    const said = textOf(await ui.find({ key: 'sent' }))
    // The engine's own words stay, after what failed (the test engine answers a hook that threw
    // with "no implementation for command.run")
    const raw = said.match(/Nie wysłano \/relai:relai-tour: (.+)$/)?.[1] ?? ''
    expect(raw).toContain('command.run')
    const first = said.replace(/^✗ /, '').split(/(?<=\.) /)[0] ?? ''
    expect(first).toMatch(/^(Spróbuj|Sprawdź|Popraw|Zaznacz|Wpisz)/)
    expect(first).not.toContain(raw)
    await ui.unmount()
  })

  test('cleared on a tab change and on opening or closing a form', async ($, on) => {
    world(on)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-tour' })
    await ui.press({ key: 'send' })
    await ui.press({ key: 'cmd-relai-backup' }) // another form: the tour's line is not its own
    expect(await ui.find({ key: 'sent' })).toBeUndefined()
    await ui.press({ key: 'send' })
    expect(await ui.find({ key: 'sent' })).toBeDefined()
    await ui.press({ key: 'cmd-relai-backup' }) // closed
    expect(await ui.find({ key: 'sent' })).toBeUndefined()
    await ui.press({ key: 'cmd-relai-backup' })
    await ui.press({ key: 'send' })
    await ui.press({ key: 'tab-help' })
    expect(await ui.find({ key: 'sent' })).toBeUndefined()
    await ui.unmount()
  })
})

describe('Pomoc: the cheat sheet and the phrases in one tab', () => {
  test('a search narrows commands (aliases and what they do) and phrases; a phrase is sent by a click', async ($, on) => {
    world(on)
    const ui = await open($)
    await ui.press({ key: 'tab-help' })
    // The sheet folded by default (Łukasz 2026-10-15: "Zwinięta domyślnie"), one press unfolds it
    expect(await ui.find({ key: 'sheet-relai-backup' })).toBeUndefined()
    await ui.press({ key: 'fold-help:sheet' })
    expect(textOf(await ui.find({ key: 'sheet-relai-backup' }))).toContain('pakuje cały projekt')
    expect(await ui.find({ key: 'phrase-1' })).toBeDefined()
    await ui.input({ key: 'search', text: 'status' })
    expect(await ui.find({ key: 'sheet-relai-backup' })).toBeUndefined()
    expect(await ui.find({ key: 'phrase-0' })).toBeUndefined()
    expect((await ui.find({ key: 'phrase-1' }))?.text).toContain('sprawdź status')
    await ui.unmount()
  })

  test('nothing is wider than 40 columns: the header, "Teraz", a form under its row, Pomoc', async ($, on) => {
    world(on)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await open($, surface, 40)
      const widths: string[] = []
      const measure = async (where: string) => { widths.push(`${surface} ${where}: ${minWidth(await ui.drawn())}`) }
      expect(await ui.find({ key: 'now' })).toBeDefined()
      await measure('commands')
      await ui.press({ key: 'cmd-relai-stage' })
      await measure('stage form')
      await ui.press({ key: 'cmd-relai-stage' })
      await ui.press({ key: 'now-start' })
      expect(await ui.find({ key: 'confirm-card' })).toBeDefined()
      await measure('card in the bar\'s place')
      await ui.press({ key: 'confirm-no' })
      await ui.press({ key: 'tab-help' })
      await measure('help')
      await ui.press({ key: 'tab-commands' })
      await ui.unmount()
      expect(widths.filter((w) => Number(w.split(': ')[1]) > 40)).toEqual([])
      expect(widths.length).toBe(4)
    }
  })
})
