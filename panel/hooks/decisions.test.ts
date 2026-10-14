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

type Calls = { commands: { command: string, args: string }[], prompts: string[], writes: Record<string, string>, processes: string[][], copies: string[],
  mcp: { server: string, tool: string, args: Record<string, unknown> }[], advance: (ms: number) => Promise<unknown> }
// The host as the new-session step sees it (NOWA_SESJA): the OS variable, uname, the session's tools
type Host = { os?: string, uname?: string, tools?: string[], fail?: boolean }

function world(on: On, files: Record<string, string>, model = 'claude-opus-5-5', host: Host = { os: 'Windows_NT' }): Calls {
  const calls: Calls = { commands: [], prompts: [], writes: {}, processes: [], copies: [], mcp: [], advance: async () => undefined }
  const disk: Record<string, string> = { ...files }
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: new Date(2026, 9, 9, 12, 0).getTime() })
  calls.advance = (ms) => clock.advance(ms)
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
  on('process.run', ($, e) => {
    if (e.argv[0] === 'uname') return { value: { exitCode: host.uname ? 0 : 127, stdout: (host.uname ?? '') + '\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }
    calls.processes.push([...e.argv])
    const isLink = String(e.argv.at(-1)).startsWith('claude://')
    return { value: { exitCode: isLink && host.fail ? 1 : 0, stdout: REPORT, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }
  })
  on('env.get', ($, e) => ({ value: e.name === 'OS' ? host.os : undefined }))
  on('tool.list', () => ({ value: (host.tools ?? []).map((name) => ({ name, description: '', mcp: name.startsWith('mcp__') })) }))
  on('mcp.call', ($, e) => {
    calls.mcp.push({ server: e.server, tool: e.tool, args: e.args })
    return { value: { content: [{ type: 'text', text: host.fail ? 'The user declined.' : 'started' }], isError: host.fail === true } as never }
  })
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
    await ui.select({ key: 'f-chat', value: 'fresh' })
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

  // SPLIT_VIEW: the footer line is withdrawn — no session's work goes to .claude/relai/stopka/ any more
  test('the footer words are gone: reading the work writes no file', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'tab-map' })
    expect(Object.keys(calls.writes)).toEqual([])
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
    const ownWrites = () => Object.keys(calls.writes)
    expect(ownWrites()).toEqual([])
    expect(calls.prompts).toEqual([])
    await ui.press({ key: 'confirm-yes' })
    expect(ownWrites()).toEqual([`${RUN_DIR}/zadania.json`])
    expect(JSON.parse(calls.writes[`${RUN_DIR}/zadania.json`] ?? '[]')[1].role).toBe('reviewer')
    expect(calls.prompts[0]).toContain(`przebieg ${RUN}`)
    await ui.unmount()
  })

  // ---------- NOWA_SESJA: the stage in a new desktop session ----------

  const CONSENT = `${CWD}/.claude/relai/zgoda-etapu/PANEL_X-E2.json`
  const HANDOFF = `${CWD}/.claude/relai/fokus/przekazanie.json`
  const chatOptions = async (ui: Awaited<ReturnType<typeof open>>) => {
    const select = await ui.find({ key: 'form' })
    const found = [] as string[]
    const visit = (n: RenderNode) => {
      if (typeof n === 'string') return
      if (n.type === 'Select' && (n.props as { label?: string }).label === 'Czat: ') {
        const p = n.props as { value: string, options: { value: string }[] }
        found.push(`${p.value}|${p.options.map((o) => o.value).join(',')}`)
      }
      for (const k of (n as { children?: RenderNode[] }).children ?? []) visit(k)
    }
    if (select) visit(select as unknown as RenderNode)
    return found
  }

  for (const surface of ['desktop', 'terminal'] as const) test(`the chat choice (${surface}): a new session first and the default on the desktop; elsewhere the two of before`, async ($, on) => {
    world(on, FILES)
    const ui = await open($, surface)
    await ui.press({ key: 'cmd-relai-stage' })
    expect(await chatOptions(ui)).toEqual([surface === 'desktop' ? 'new|new,fresh,current' : 'fresh|fresh,current'])
    await ui.unmount()
  })

  test('new session (N1): "Tak" opens the deep link without a shell and sends nothing to this chat', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    const card = await ui.find({ key: 'confirm-card' })
    expect(card?.text).toContain('komenda czeka w polu, Enter tam; ta rozmowa zostaje; zgoda ważna 10 min')
    expect(calls.processes).toEqual([]) // positive control: nothing opened before "Tak"
    expect(calls.writes[CONSENT]).toBeUndefined()
    await ui.press({ key: 'confirm-yes' })
    expect(sent(calls)).toEqual([]) // no /clear, no command in the window of "Tak"
    expect(calls.prompts).toEqual([])
    expect(calls.processes.length).toBe(1)
    const [exe, handler, url] = calls.processes[0] ?? []
    expect([exe, handler]).toEqual(['rundll32', 'url.dll,FileProtocolHandler'])
    const u = new URL(String(url))
    expect(`${u.protocol}//${u.host}${u.pathname}`).toBe('claude://code/new')
    expect(u.searchParams.get('folder')).toBe(CWD)
    expect(u.searchParams.get('q')).toBe('/relai:relai-stage PANEL_X E2')
    const consent = JSON.parse(calls.writes[CONSENT] ?? '{}')
    expect(consent).toMatchObject({ topic: 'PANEL_X', stage: 'E2', cwd: CWD })
    expect(String(consent.card)).toMatch(/^karta-[a-z0-9]+-[a-z0-9]+$/)
    expect(JSON.parse(calls.writes[HANDOFF] ?? '{}')).toMatchObject({ focus: { kind: 'plan', plan: 'PANEL_X', stage: 'E2' }, from: ['session-1'], cwd: CWD })
    expect((await ui.find({ key: 'sent' }))?.text).toContain('Otwarto nową sesję z /relai:relai-stage PANEL_X E2 — naciśnij w niej Enter')
    await ui.unmount()
  })

  for (const [name, host, argv0] of [
    ['Windows', { os: 'Windows_NT' }, ['rundll32', 'url.dll,FileProtocolHandler']],
    ['macOS', { uname: 'Darwin' }, ['open']],
    ['Linux', { uname: 'Linux' }, ['xdg-open']],
  ] as const) test(`new session on ${name}: the system's own URL handler, the link one argument`, async ($, on) => {
    const calls = world(on, FILES, 'claude-opus-5-5', host)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    await ui.press({ key: 'confirm-yes' })
    expect(calls.processes.map((a) => a.slice(0, -1))).toEqual([[...argv0]])
    expect(calls.processes[0]?.at(-1)).toMatch(/^claude:\/\/code\/new\?folder=C%3A%2Fproj&q=%2Frelai%3Arelai-stage%20PANEL_X%20E2$/)
    await ui.unmount()
  })

  test('new session on a system it cannot tell: no link, the failure said with the way out', async ($, on) => {
    const calls = world(on, FILES, 'claude-opus-5-5', {})
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    await ui.press({ key: 'confirm-yes' })
    expect(calls.processes).toEqual([])
    expect((await ui.find({ key: 'sent' }))?.text).toContain('nie rozpoznano systemu')
    await ui.unmount()
  })

  test('N3: with the app\'s start_session the card calls it and opens no link; the card says the app asks', async ($, on) => {
    const calls = world(on, FILES, 'claude-opus-5-5', { os: 'Windows_NT', tools: ['Read', 'mcp__ccd_session__start_session'] })
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    expect((await ui.find({ key: 'confirm-card' }))?.text).toContain('aplikacja pokaże swoją kartę zgody')
    await ui.press({ key: 'confirm-yes' })
    expect(calls.processes).toEqual([])
    expect(calls.mcp.map((c) => `${c.server}/${c.tool}`)).toEqual(['ccd_session/start_session'])
    expect(calls.mcp[0]?.args).toMatchObject({ initiation: 'user_asked', prompt: '/relai:relai-stage PANEL_X E2', context: 'fresh', use_worktree: false })
    expect(String(calls.mcp[0]?.args.background).length).toBeGreaterThanOrEqual(80)
    expect(calls.writes[CONSENT]).toBeDefined()
    expect((await ui.find({ key: 'sent' }))?.text).toContain('potwierdź na jej karcie')
    await ui.unmount()
  })

  test('N3: without start_session the same card opens the link and calls no tool', async ($, on) => {
    const calls = world(on, FILES, 'claude-opus-5-5', { os: 'Windows_NT', tools: ['Read', 'mcp__ccd_session__spawn_task'] })
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    await ui.press({ key: 'confirm-yes' })
    expect(calls.mcp).toEqual([])
    expect(calls.processes.length).toBe(1)
    await ui.unmount()
  })

  // N2: the command typed in the new session passes its hook (P-022), which gives it back the
  // card's consent only from a file for exactly this stage, this folder, fresh and unused
  const NOW = new Date(2026, 9, 9, 12, 0).getTime()
  const consentAt = (at: number, cwd = CWD, card = 'karta-z-pliku-01', stage = 'E2') => JSON.stringify({ card, topic: 'PANEL_X', stage, cwd, at }) + '\n'
  // What the person's Enter in the new session sends (origin composer, P-022 pkt 1)
  const typed = ($: Engine, args: string, origin: Record<string, unknown> = { kind: 'composer' }) => $.command.run({ command: 'relai:relai-stage', args, origin } as never)

  test('N2: a fresh consent file gives the typed command its token once; the second time it is gone', async ($, on) => {
    const calls = world(on, { ...FILES, [CONSENT]: consentAt(NOW - 60_000, 'C:\\proj') })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await typed($, 'PANEL_X E2')
    await typed($, 'PANEL_X E2')
    expect(calls.commands).toEqual([
      { command: 'relai:relai-stage', args: 'PANEL_X E2 --zgoda-panelu karta-z-pliku-01' },
      { command: 'relai:relai-stage', args: 'PANEL_X E2' },
    ])
    expect(JSON.parse(calls.writes[CONSENT] ?? '{}').usedAt).toBe(NOW)
  })

  for (const [why, file] of [
    ['older than ten minutes', consentAt(NOW - 10 * 60_000 - 1)],
    ['from another folder', consentAt(NOW - 60_000, 'D:/inny')],
    ['already used', consentAt(NOW - 60_000).replace('}', ',"usedAt":1}')],
    ['for another stage', consentAt(NOW - 60_000, CWD, 'karta-z-pliku-01', 'E3')],
  ] as const) test(`N2: a consent file ${why} is no consent`, async ($, on) => {
    const calls = world(on, { ...FILES, [CONSENT]: file })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await typed($, 'PANEL_X E2')
    expect(calls.commands).toEqual([{ command: 'relai:relai-stage', args: 'PANEL_X E2' }])
    expect(calls.writes[CONSENT]).toBeUndefined()
  })

  for (const origin of [{ kind: 'bridge' }, { kind: 'sdk' }, { kind: 'plugin', name: 'inny' }]) test(`N2: a valid file serves only the person's Enter, never origin ${origin.kind}`, async ($, on) => {
    const calls = world(on, { ...FILES, [CONSENT]: consentAt(NOW - 60_000) })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await typed($, 'PANEL_X E2', origin)
    expect(calls.commands).toEqual([{ command: 'relai:relai-stage', args: 'PANEL_X E2' }])
    expect(calls.writes[CONSENT]).toBeUndefined()
    await typed($, 'PANEL_X E2') // positive control on the same file: the person's Enter takes it
    expect(calls.commands.at(-1)?.args).toBe('PANEL_X E2 --zgoda-panelu karta-z-pliku-01')
  })

  test('N2: a forged token typed with a valid file is replaced by the file\'s, never kept beside it', async ($, on) => {
    const calls = world(on, { ...FILES, [CONSENT]: consentAt(NOW - 60_000) })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await typed($, 'PANEL_X E2 --zgoda-panelu karta-podrobiona-01')
    expect(calls.commands).toEqual([{ command: 'relai:relai-stage', args: 'PANEL_X E2 --zgoda-panelu karta-z-pliku-01' }])
  })

  // Live 2026-10-12: the app types the link's "/" as U+FF0F, so Enter sends text, not a command
  const linked = ($: Engine, text: string, origin: Record<string, unknown> = { kind: 'composer' }) =>
    $.prompt.submit({ text, origin } as never).then((r) => JSON.stringify(r), (err) => String(err))

  test('N2, the shape measured live: the text the link typed runs the stage as the panel\'s send with the file\'s consent', async ($, on) => {
    const calls = world(on, { ...FILES, [CONSENT]: consentAt(NOW - 60_000) })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    expect(await linked($, '／relai:relai-stage PANEL_X E2')).toContain('z karty panelu')
    await calls.advance(10)
    expect(sent(calls)).toEqual([{ command: 'relai:relai-stage', args: 'PANEL_X E2 --zgoda-panelu karta-z-pliku-01' }])
    expect(calls.prompts).toEqual([]) // the text never reached the model
    expect(JSON.parse(calls.writes[CONSENT] ?? '{}').usedAt).toBe(NOW)
  })

  for (const [what, files, origin] of [
    ['without a consent file', FILES, { kind: 'composer' }],
    ['from the bridge', { ...FILES, [CONSENT]: consentAt(NOW - 60_000) }, { kind: 'bridge' }],
  ] as const) test(`N2: the text the link typed ${what} goes on as typed, and the procedure asks`, async ($, on) => {
    const calls = world(on, files)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await linked($, '／relai-stage PANEL_X E2', origin)
    await calls.advance(10)
    expect(sent(calls)).toEqual([])
    expect(calls.prompts).toEqual(['／relai-stage PANEL_X E2'])
  })

  test('N1→N2 end to end: the file the card writes is the one the typed command reads, with the card\'s id', async ($, on) => {
    const calls = world(on, FILES)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    await ui.press({ key: 'confirm-yes' })
    const card = String(JSON.parse(calls.writes[CONSENT] ?? '{}').card)
    await typed($, 'PANEL_X E2')
    expect(sent(calls)).toEqual([{ command: 'relai:relai-stage', args: `PANEL_X E2 --zgoda-panelu ${card}` }])
    await ui.unmount()
  })

  for (const [what, host] of [
    ['the link handler fails', { os: 'Windows_NT', fail: true }],
    ['the app declines start_session', { os: 'Windows_NT', tools: ['mcp__ccd_session__start_session'], fail: true }],
  ] as const) test(`N1: when ${what}, the consent is spent at once and nothing is said as opened`, async ($, on) => {
    const calls = world(on, FILES, 'claude-opus-5-5', host)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.press({ key: 'prepare' })
    await ui.press({ key: 'confirm-yes' })
    expect(JSON.parse(calls.writes[CONSENT] ?? '{}').usedAt).toBe(NOW)
    const line = (await ui.find({ key: 'sent' }))?.text ?? ''
    expect(line).toContain('Nie wysłano')
    expect(line).not.toContain('Otwarto')
    await typed($, 'PANEL_X E2')
    expect(sent(calls).at(-1)?.args).toBe('PANEL_X E2')
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
