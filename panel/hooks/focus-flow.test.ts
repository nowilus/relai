import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderElement, RenderNode, TurnStepResult } from 'claude-code'

// The session's focus end to end (AUDYT_MODOW Z12, Aneks A): a prompt that names a thread card
// moves the plan bar, "Teraz" and the stage tag of the measurements to the thread; "Zmień" sets it
// by hand; a session with no focus while the active plan runs in Codex counts outside it.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 10, 12, 0).getTime()
const STATUS = [
  '# STATUS — plan PANEL_CODEX',
  '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-10** · model wykonawczy etapów: **gpt-6.1-sol w Codeksie**',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E1 | Przejęcie rdzenia | W TOKU | — | |',
].join('\n')
const CARD = [
  '# ODNOGA — mody', '', 'Plan: brak · Status: **OTWARTA** ·', '',
  '1. **Z3 · Panel bez I/O** — opis', '2. **Z4 · Paski** — opis', '', '## Weryfikacja', '',
  '- [x] Z3: liczniki', '- [ ] Z4: bezczynność',
].join('\n')
// Plans beside the active one (choice list, 2026-10-25): one run in Claude Code with a stage in
// progress, one closed, one waiting for acceptance — only the first is work a session can pick
const planIn = (name: string, head: string, rows: string[]) => [
  `# STATUS — plan ${name}`, '', `[PLAN.html](PLAN.html) · ${head} · model wykonawczy etapów: **Opus w Claude Code**`, '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|', ...rows,
].join('\n')
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.8.0\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_CODEX](docs/plany/PANEL_CODEX/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_CODEX/STATUS.md`]: STATUS,
  [`${CWD}/docs/plany/BEZPIECZENSTWO/STATUS.md`]: planIn('BEZPIECZENSTWO', '**ZAAKCEPTOWANY 2026-10-23**', ['| E5 | Codex i Cursor | ZREALIZOWANY 2026-10-24 | — | |', '| E6 | Wydanie 3.3.0 | W TOKU | — | |']),
  [`${CWD}/docs/plany/STARY/STATUS.md`]: planIn('STARY', '**ZREALIZOWANY 2026-09-01**', ['| E1 | Wszystko | ZREALIZOWANY 2026-09-01 | — | |']),
  [`${CWD}/docs/plany/NOWY/STATUS.md`]: planIn('NOWY', '**DO AKCEPTACJI**', ['| E1 | Początek | OCZEKUJE | — | |']),
  [`${CWD}/docs/fixy/AUDYT_MODOW/ODNOGA.md`]: CARD,
  [`${CWD}/docs/fixy/STARA/ODNOGA.md`]: '# ODNOGA\n\nStatus: **ZAMKNIĘTA**\n',
}

function world(on: On, files: Record<string, string>) {
  const disk: Record<string, string> = { ...files }
  const ids = { session: 'session-1' }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: ids.session }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  const stampOf = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  on('fs.stat', ($, e) => {
    const k = key(e.path)
    return k in disk ? { value: { kind: 'file' as const, size: (disk[k] ?? '').length, mtimeMs: stampOf(disk[k] ?? ''), isLink: false } } : { deny: 'ENOENT ' + e.path }
  })
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
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 3, cache_read_input_tokens: 40_000, cache_creation_input_tokens: 2_000, output_tokens: 300, model: 'claude-opus-5-5' },
    }
    return result
  })
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('prompt.submit', ($, e) => ({ text: e.text }) as never)
  on('session.end', () => ({ sessionId: ids.session }) as never)
  // The engine's own band beneath the plugin
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('process.run', () => ({ value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }))
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return { disk, ids }
}

const BAND = { component: 'AbovePrompt' as const, props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 160, scroll: { offset: 0, bodyRows: 9 }, view: {} } }
const PANE = { component: 'Pane' as const, requestId: 'relai-panel', props: { title: 'RelAI', isFocused: true, bodyColumns: 120, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 80 }, view: {} } }

function* walk(node: RenderNode | undefined): Generator<RenderElement> {
  if (!node || typeof node === 'string') return
  yield node
  for (const k of (node as { children?: RenderNode[] }).children ?? []) yield* walk(k)
}
const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

async function turn($: Engine, turnId: string) {
  const s = $.turn.step({ turnId, index: 0, model: 'claude-opus-5-5', messageCount: 1 })
  for await (const _chunk of s) { /* the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 1000, isAborted: false, turnId, reason: 'answer' } as never)
}

const stagesIn = (disk: Record<string, string>) => Object.entries(disk).filter(([p]) => p.includes('/.claude/relai/pomiary/'))
  .flatMap(([, text]) => text.split('\n').filter(Boolean).map((l) => (JSON.parse(l) as { stage?: string | null }).stage ?? null))

describe('the session focus, end to end (Z12)', () => {
  test('a prompt naming a thread card: the bar, the tag and "Teraz" follow the thread; the active plan is mentioned', async ($, on) => {
    const { disk } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.prompt.submit({ text: 'Wykonaj wątek z pliku docs/fixy/AUDYT_MODOW/PROMPT_ODNOGA.md' } as never)
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-1.json`] ?? '{}')).toMatchObject({ kind: 'branch', card: 'AUDYT_MODOW', source: 'auto' })
    await turn($, 't1')
    expect(stagesIn(disk)).toEqual(['AUDYT_MODOW/Z4'])
    const band = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...BAND })
    const plan = textOf(await band.find({ key: 'plan' }))
    expect(plan).toContain('AUDYT_MODOW · Z4')
    expect(plan).toContain('ODNOGA')
    expect(plan).toContain('aktywny plan: PANEL_CODEX (Codex)')
    expect(textOf(await band.find({ key: 'figure' }))).toContain('1/2')
    expect(textOf(await band.find({ key: 'figure' }))).toContain('paczek')
    await band.unmount()
    await $.command.run({ command: 'relai-panel' } as never)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...PANE })
    const now = textOf(await ui.find({ key: 'now' }))
    expect(now).toContain('Ta sesja: AUDYT_MODOW · Z4 (odnoga) — rozpoznane z promptu')
    expect(now).toContain('1/2')
    // A thread is not the active plan's work: no "Start etapu…" for it
    expect([...walk(await ui.find({ key: 'now' }))].filter((n) => n.type === 'Button').map((b) => (b.props as { label?: string }).label)).toEqual(['Zmień'])
    await ui.unmount()
  })

  test('"Zmień" lists each open plan run in Claude Code once, with its current stage, then outside; a hand-set focus outlives the next prompt', async ($, on) => {
    const { disk } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.command.run({ command: 'relai-panel' } as never)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...PANE })
    // No focus, the active plan runs in Codex: this session counts outside it and says so
    expect(textOf(await ui.find({ key: 'now' }))).toContain('Ta sesja: nie wybrano — aktywny plan idzie w innym narzędziu')
    await ui.press({ key: 'now-focus-change' })
    const buttons = [...walk(await ui.find({ key: 'now-focus-list' }))].filter((n) => n.type === 'Button').map((b) => b.props as { key?: string, label?: string })
    // Not PANEL_CODEX (its stages run in Codex), not STARY (closed), not NOWY (no stage to start),
    // not the open card AUDYT_MODOW (a thread is picked up from its prompt, not from this list)
    expect(buttons.map((b) => String(b.key))).toEqual(['focus-plan:BEZPIECZENSTWO:E6', 'focus-outside'])
    expect(buttons.map((b) => b.label)).toEqual(['BEZPIECZENSTWO · E6 Wydanie 3.3.0', 'poza planem'])
    await ui.press({ key: 'focus-outside' })
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-1.json`] ?? '{}')).toMatchObject({ kind: 'outside', source: 'manual' })
    expect(textOf(await ui.find({ key: 'now' }))).toContain('Ta sesja: poza planem — wybrane ręcznie')
    await $.prompt.submit({ text: 'uruchom docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md' } as never)
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-1.json`] ?? '{}')).toMatchObject({ kind: 'outside', source: 'manual' })
    await turn($, 't1')
    expect(stagesIn(disk)).toEqual([null])
    await ui.unmount()
  })

  test('no focus while the active plan runs in Codex: the bar asks, the measurements carry no stage', async ($, on) => {
    const { disk } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await turn($, 't1')
    expect(stagesIn(disk)).toEqual([null])
    const band = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...BAND })
    // Z13: the sentence stands on the chip of the bar's second row, beside "Wybierz pracę…"
    expect(textOf(await band.find({ key: 'relai-band-frame' }))).toContain('ta sesja: praca nie wybrana')
    await band.unmount()
  })

  test('/clear hands the focus to the session that follows', async ($, on) => {
    const { disk, ids } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.prompt.submit({ text: 'karta docs/fixy/AUDYT_MODOW/ODNOGA.md' } as never)
    await $.session.end({ reason: 'clear' } as never)
    ids.session = 'session-2'
    await $.prompt.submit({ text: 'kontynuujemy pracę' } as never)
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-2.json`] ?? '{}')).toMatchObject({ kind: 'branch', card: 'AUDYT_MODOW' })
    await turn($, 't2')
    expect(stagesIn(disk).at(-1)).toBe('AUDYT_MODOW/Z4')
  })

  // Review of Z12: the first turn after /clear may come from the plugin's own send (the stage card's
  // "clear" then /relai-stage), which raises no prompt.submit; the turn itself finds the new id
  test('/clear followed by a turn with no prompt: the turn adopts the new session and its handed focus', async ($, on) => {
    const { disk, ids } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.prompt.submit({ text: 'karta docs/fixy/AUDYT_MODOW/ODNOGA.md' } as never)
    await $.session.end({ reason: 'clear' } as never)
    ids.session = 'session-2'
    await turn($, 't2')
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-2.json`] ?? '{}')).toMatchObject({ kind: 'branch', card: 'AUDYT_MODOW' })
    expect(stagesIn(disk).at(-1)).toBe('AUDYT_MODOW/Z4')
  })

  test('the handed focus goes once, to the session that followed; a hand-set choice survives /clear and the next prompt', async ($, on) => {
    const { disk, ids } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.command.run({ command: 'relai-panel' } as never)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...PANE })
    await ui.press({ key: 'now-focus-change' })
    await ui.press({ key: 'focus-plan:BEZPIECZENSTWO:E6' })
    await ui.unmount()
    await $.session.end({ reason: 'clear' } as never)
    ids.session = 'session-2'
    await $.prompt.submit({ text: 'uruchom docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md' } as never)
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-2.json`] ?? '{}')).toMatchObject({ kind: 'plan', plan: 'BEZPIECZENSTWO', stage: 'E6', source: 'manual' })
    // A third session (resumed, not the one /clear began) gets nothing handed
    ids.session = 'session-3'
    await $.prompt.submit({ text: 'kontynuujemy pracę' } as never)
    expect(disk[`${CWD}/.claude/relai/fokus/session-3.json`]).toBeUndefined()
  })

  // NOWA_SESJA N2: a card that opened a new desktop session left the stage as the focus to hand
  // over; the new process reads it at its session.start — the first session starting in this
  // folder after the handoff takes it, once; the session that wrote it never does
  const HANDOFF = `${CWD}/.claude/relai/fokus/przekazanie.json`
  const handoff = (extra: Record<string, unknown> = {}) => JSON.stringify({ focus: { kind: 'plan', plan: 'PANEL_CODEX', stage: 'E1' }, from: 'session-1', cwd: 'C:\\proj', at: NOW - 60_000, ...extra }) + '\n'

  test('a handed focus goes to the first session that starts in this folder, once', async ($, on) => {
    const { disk, ids } = world(on, { ...FILES, [HANDOFF]: handoff() })
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true }) // the writer reloads: nothing taken
    expect(disk[`${CWD}/.claude/relai/fokus/session-1.json`]).toBeUndefined()
    ids.session = 'session-2'
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    expect(JSON.parse(disk[`${CWD}/.claude/relai/fokus/session-2.json`] ?? '{}')).toMatchObject({ kind: 'plan', plan: 'PANEL_CODEX', stage: 'E1', source: 'auto' })
    await turn($, 't1')
    expect(stagesIn(disk).at(-1)).toBe('PANEL_CODEX/E1')
    ids.session = 'session-3'
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    expect(disk[`${CWD}/.claude/relai/fokus/session-3.json`]).toBeUndefined()
  })

  for (const [why, file] of [
    ['older than ten minutes', handoff({ at: NOW - 10 * 60_000 - 1 })],
    ['from another folder', handoff({ cwd: 'D:/inny' })],
    // The writer after /clear: a new live id, the module's old one also listed (review, P-026 pkt 3)
    ['to the writer under its other id', handoff({ from: ['session-1', 'session-2'] })],
  ] as const) test(`a handoff ${why} gives no focus`, async ($, on) => {
    const { disk, ids } = world(on, { ...FILES, [HANDOFF]: file })
    ids.session = 'session-2'
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    expect(disk[`${CWD}/.claude/relai/fokus/session-2.json`]).toBeUndefined()
    expect(disk[HANDOFF]).toBe(file)
  })

  // Z12c: a session's history corrected in its file (the work it really was) is not written back
  // over by the records the panel still holds in memory
  test('a stage corrected in the measurement file stands through the next write', async ($, on) => {
    const { disk } = world(on, FILES)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await turn($, 't1')
    const file = Object.keys(disk).find((p) => p.includes('/.claude/relai/pomiary/'))!
    expect(stagesIn(disk)).toEqual([null])
    disk[file] = (disk[file] ?? '').replace('"stage":null', '"stage":"AUDYT_MODOW/Z3"')
    await $.prompt.submit({ text: 'karta docs/fixy/AUDYT_MODOW/ODNOGA.md' } as never)
    await turn($, 't2')
    expect(stagesIn(disk)).toEqual(['AUDYT_MODOW/Z3', 'AUDYT_MODOW/Z4'])
  })

  test('a focus on a card that was closed ends there: no packets, no tag, the bar asks', async ($, on) => {
    const closed = { ...FILES, [`${CWD}/docs/fixy/AUDYT_MODOW/ODNOGA.md`]: CARD.replace('**OTWARTA**', '**ZAMKNIĘTA**') }
    const { disk } = world(on, closed)
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    await $.prompt.submit({ text: 'karta docs/fixy/AUDYT_MODOW/ODNOGA.md' } as never)
    await turn($, 't1')
    expect(stagesIn(disk)).toEqual([null])
    const band = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...BAND })
    // Z13: the sentence stands on the chip of the bar's second row, beside "Wybierz pracę…"
    expect(textOf(await band.find({ key: 'relai-band-frame' }))).toContain('ta sesja: praca nie wybrana')
    await band.unmount()
  })
})
