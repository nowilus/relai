import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'
import { FORMS } from './core/commands.mjs'
import { CLEAN_ARGV } from './core/decisions.mjs'

// Decisions in the RelAI panel (plan PANEL_CLAUDE, E5): the confirmation card (R4), the stage
// started from the pane with its consent (D-35), the fresh chat (/clear only after "Tak"), the
// crew edited before the start, the clean list with nothing picked. Proof by effect: what reached
// the engine stubs beneath the plugin (commands, prompts, writes, processes).

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const RUN = '2026-10-09_130000'
const RUN_DIR = `${CWD}/.claude/relai/work/CREW/${RUN}`
const STATUS = [
  '# STATUS — plan PANEL_X', '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-08** · model wykonawczy: Opus, w Claude Code', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Decyzje | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
].join('\n')
const PROMPT = ['# PROMPT_ETAP_2', '', '## Zakres etapu', '', '**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_X/E2/`.**', '',
  '## Weryfikacja', '', '- [ ] a', '- [ ] b', '- [ ] c', '', '## Na koniec', '', '- [ ] nie liczy się'].join('\n')
const REPORT = JSON.stringify({
  grupy: [
    { id: 'work:E1', nazwa: 'etap zamkniety E1', bajty: 1048576, pytanie: 'q', pozycje: [{}] },
    { id: 'temp:relai', nazwa: 'temp', bajty: 2097152, pytanie: 'q', pozycje: [{}, {}] },
  ],
  chronione: [{ wzgledna: '.claude/relai/work/PANEL_X/E2', chronione: { powod: 'etap trwa' } }],
})
const TASKS = JSON.stringify([
  { id: 'a', title: 'Kod', files: ['src/a.js'], dependsOn: [], role: 'coder', runtime: 'claude-code', model: '' },
  { id: 'b', title: 'Testy', files: ['test/a.test.js'], dependsOn: ['a'], role: 'tester', runtime: 'claude-code', model: '' },
])

const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1 · zainicjowano: 2026-08-07\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/PANEL_X/PROMPT_ETAP_2.md`]: PROMPT,
  [`${CWD}/.claude/relai/MODELE-claude-code.md`]: '```\nlist-date: 2026-10-08\n```\n',
}

const COMMANDS = FORMS.map((f) => 'relai:' + f.command)

type Calls = { commands: { command: string, args: string }[], prompts: string[], writes: Record<string, string>, processes: string[][], copies: string[] }

function world(on: On, files: Record<string, string>, model = 'claude-opus-5-5'): Calls {
  const calls: Calls = { commands: [], prompts: [], writes: {}, processes: [], copies: [] }
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: new Date(2026, 9, 9, 12, 0).getTime() })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: model }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; calls.writes[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('command.list', () => ({ value: COMMANDS.map((name) => ({ name, description: `opis ${name}`, source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('command.run', ($, e) => { calls.commands.push({ command: e.command, args: e.args }); return { text: 'ok' } })
  on('prompt.submit', ($, e) => { calls.prompts.push(e.text); return { text: e.text } })
  on('process.run', ($, e) => { calls.processes.push([...e.argv]); return { value: { exitCode: 0, stdout: REPORT, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never } })
  on('ui.copy', ($, e) => { calls.copies.push(e.text); return { value: { isCopied: true } as never } })
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return calls
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

const sent = (calls: Calls) => calls.commands.filter((c) => c.command !== 'relai-panel')

const textOf = (node: RenderNode): string => typeof node === 'string' ? node
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

describe('decisions in the RelAI panel', () => {
  test('R4: preparing a stage shows the card and sends nothing; "Nie" sends nothing either', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    expect(await ui.find({ key: 'send' })).toBeUndefined()
    await ui.press({ key: 'prepare' })
    const card = await ui.find({ key: 'confirm-card' })
    expect(card?.text).toContain('Start etapu E2')
    expect(card?.text).toContain('E2 z E2 · Decyzje · GOTOWY DO STARTU')
    expect(card?.text).toContain('.claude/relai/work/PANEL_X/E2/')
    expect(card?.text).toContain('3 punkty')
    expect(card?.text).toContain('zgodny z planem (Opus)')
    expect(card?.text).toContain('Zaczynamy?')
    expect(sent(calls)).toEqual([])
    await ui.press({ key: 'confirm-no' })
    expect(await ui.find({ key: 'confirm-card' })).toBeUndefined()
    expect(sent(calls)).toEqual([])
    expect(calls.prompts).toEqual([])
    expect((await ui.find({ key: 'sent' }))?.text).toContain('nic nie wysłano')
    await ui.unmount()
  })

  test('fresh chat: "Tak" sends /clear and then the stage with the card\'s consent, in that order', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    expect(sent(calls)).toEqual([]) // positive control of the order below: nothing before "Tak"
    await ui.press({ key: 'confirm-yes' })
    const out = sent(calls)
    expect(out.map((c) => c.command)).toEqual(['clear', 'relai:relai-stage'])
    expect(out[1]?.args).toMatch(/^PANEL_X E2 --zgoda-panelu karta-[a-z0-9]+-[a-z0-9]+$/)
    expect(await ui.find({ key: 'confirm-card' })).toBeUndefined()
    await ui.unmount()
  })

  test('current chat: no /clear; a model other than the plan\'s is the card\'s first warning', async ($, on) => {
    const calls = world(on, FILES, 'claude-sonnet-5-5')
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.select({ key: 'f-chat', value: 'current' })
    await ui.press({ key: 'prepare' })
    const card = await ui.find({ key: 'confirm-card' })
    expect(card?.text).toContain('przełącz przed startem')
    expect(card?.text?.indexOf('przełącz')).toBeLessThan(card?.text?.indexOf('Plan') ?? 0)
    await ui.press({ key: 'confirm-yes' })
    expect(sent(calls).map((c) => c.command)).toEqual(['relai:relai-stage'])
    await ui.unmount()
  })

  test('"Kopiuj prompt" copies the stage command without any consent', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'copy' })
    expect(calls.copies).toEqual(['/relai-stage PANEL_X E2'])
    expect(sent(calls)).toEqual([])
    await ui.unmount()
  })

  test('a consent typed or sent by anyone but the pane is cut before /relai-stage runs (P-022)', async ($, on) => {
    const calls = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
    await $.command.run({ command: 'relai:relai-stage', args: 'PANEL_X E2 --zgoda-panelu karta-podrobiona-01' })
    await $.command.run({ command: 'relai:relai-stage', args: 'PANEL_X E2' })
    expect(calls.commands).toEqual([
      { command: 'relai:relai-stage', args: 'PANEL_X E2' },
      { command: 'relai:relai-stage', args: 'PANEL_X E2' }, // positive control: args without a token untouched
    ])
  })

  test('a card with a second step (Aneks D): one "Tak" sends nothing, the second runs it', async ($, on) => {
    // No E5 form makes such a card (E6 will): it stands in the engine's state until the pane writes
    let injected: unknown = {
      id: 'karta-cennik-01', title: 'Cennik', facts: [{ label: 'Opus 5.5', value: '5,00 → 6,00' }], question: 'Pobrać cennik?',
      second: { question: 'Zapisać nowy cennik?', facts: [] }, actions: [{ kind: 'submit', text: 'zapisz cennik' }], state: 'open',
    }
    const isConfirm = (e: unknown) => (e as { plugin?: string }).plugin === 'relai-panel' && (e as { key?: string }).key === 'confirm'
    on('state.get', ($, e, next) => (isConfirm(e) && injected !== undefined ? { value: { value: injected, version: 1 } } as never : next(e)))
    on('state.set', ($, e, next) => { if (isConfirm(e)) injected = undefined; return next(e) })
    const calls = world(on, FILES)
    const ui = await open($)
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('Pobrać cennik?')
    await ui.press({ key: 'confirm-yes' })
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('Zapisać nowy cennik?')
    expect(calls.prompts).toEqual([])
    await ui.press({ key: 'confirm-yes' })
    expect(calls.prompts).toEqual(['zapisz cennik'])
    await ui.unmount()
  })

  test('/relai-clean: the list comes from the one fixed process, nothing is picked at the start', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-clean' })
    await ui.press({ key: 'clean-load' })
    expect(calls.processes).toEqual([[...CLEAN_ARGV]])
    const list = await ui.find({ key: 'clean' })
    expect(list?.text).toContain('zaznaczone 0 z 2')
    expect(list?.text).toContain('etap trwa')
    expect(list?.text).not.toContain('☒')
    expect(await ui.find({ key: 'clean-prepare' })).toBeUndefined()
    await ui.press({ key: 'clean-pick-work:E1' })
    await ui.press({ key: 'clean-prepare' })
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('Skasować 1 grupę (1,00 MB)?')
    expect(sent(calls)).toEqual([])
    await ui.press({ key: 'confirm-yes' })
    const out = sent(calls)
    expect(out.map((c) => c.command)).toEqual(['relai:relai-clean'])
    expect(out[0]?.args).toContain('skasować grupy `work:E1`')
    expect(out[0]?.args).toContain('zostawić tym razem `temp:relai`')
    expect((await ui.find({ key: 'sent' }))?.text).toContain('Wysłano')
    expect(calls.processes.length).toBe(1) // the card ran no process of its own
    await ui.unmount()
  })

  test('/relai-models: the card says the list date and sends the command only after "Tak"', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-models' })
    await ui.press({ key: 'prepare' })
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('z 2026-10-08 · 1 dzień temu')
    expect(sent(calls)).toEqual([])
    await ui.press({ key: 'confirm-yes' })
    expect(sent(calls)).toEqual([{ command: 'relai:relai-models', args: '' }])
    await ui.unmount()
  })

  test('crew: edited before the start, written only after "Tak"; a started run stays untouched', async ($, on) => {
    const calls = world(on, { ...FILES, [`${RUN_DIR}/zadania.json`]: TASKS, [`${CWD}/.claude/relai/work/CREW/started/zadania.json`]: TASKS, [`${CWD}/.claude/relai/work/CREW/started/manifest.json`]: '{"tasks":[]}' })
    const ui = await open($)
    await ui.press({ key: 'tab-map' })
    await ui.press({ key: 'fold-map:crew' }) // folded by default since Z14
    await ui.press({ key: 'crew-open-started' })
    expect(await ui.find({ key: 'crew-ok-started' })).toBeUndefined()
    expect((await ui.find({ key: 'sent' }))?.text).toContain('przebieg wystartował')
    await ui.press({ key: `crew-open-${RUN}` })
    await ui.select({ key: `crew-role-${RUN}-b`, value: 'reviewer' })
    await ui.press({ key: `crew-ok-${RUN}` })
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('b @claude-code/reviewer')
    expect(calls.writes).toEqual({})
    expect(calls.prompts).toEqual([])
    await ui.press({ key: 'confirm-yes' })
    expect(Object.keys(calls.writes)).toEqual([`${RUN_DIR}/zadania.json`])
    expect(JSON.parse(calls.writes[`${RUN_DIR}/zadania.json`] ?? '[]')[1].role).toBe('reviewer')
    expect(calls.prompts[0]).toContain(`przebieg ${RUN}`)
    await ui.unmount()
  })

  for (const surface of ['terminal', 'desktop'] as const) test(`nothing is wider than a 40-column pane (${surface}): the card, the clean list, the crew editor`, async ($, on) => {
    world(on, { ...FILES, [`${RUN_DIR}/zadania.json`]: TASKS })
    {
      const ui = await open($, surface, 40)
      const widths: string[] = []
      const measure = async (where: string) => { widths.push(`${surface} ${where}: ${minWidth(await ui.drawn())}`) }
      await ui.press({ key: 'cmd-relai-clean' })
      await ui.press({ key: 'clean-load' })
      await ui.press({ key: 'clean-pick-work:E1' })
      await measure('clean list')
      await ui.press({ key: 'cmd-relai-stage' })
      await ui.press({ key: 'prepare' })
      expect(await ui.find({ key: 'confirm-card' })).toBeDefined() // the instrument measures a drawn card
      await measure('stage card')
      await ui.press({ key: 'confirm-no' })
      await ui.press({ key: 'tab-map' })
      await ui.press({ key: 'fold-map:crew' }) // folded by default since Z14
      await ui.press({ key: `crew-open-${RUN}` })
      expect(await ui.find({ key: `crew-ok-${RUN}` })).toBeDefined()
      await measure('crew editor')
      await ui.unmount()
      expect(widths.filter((w) => Number(w.split(': ')[1]) > 40)).toEqual([])
      expect(widths.length).toBe(3)
    }
  })

  test('the width check catches a fact that cannot fit (planted defect)', () => {
    const planted = { type: 'Box', props: { flexDirection: 'row' }, children: [
      { type: 'Box', props: {}, children: [{ type: 'Text', props: {}, children: ['Katalog'] }] },
      { type: 'Box', props: {}, children: [{ type: 'Text', props: {}, children: ['.claude/relai/work/BARDZO_DLUGI_TEMAT_PLANU/E12/'] }] },
    ] } as unknown as RenderNode
    expect(minWidth(planted)).toBeGreaterThan(40)
  })
})
