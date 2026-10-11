import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode, TurnStepResult } from 'claude-code'
import { BAND } from './relai/theme.mjs'
import { cardDue, focusFilePath, focusRef, focusStatus, isWorkGoing, nextSessionThreshold, resumePath, saveRowText, thresholdAnswer, type CardInput } from './limit'
import { SAVE_CONSENT, SAVE_DONE, relaiSavePrompt, saveDone } from './handoff'

type Engine = Parameters<TestBody>[0]

// The limit card after a turn (LIMIT_CHECKPOINT E2): past the threshold and while work goes on
// (the focus's stage or thread in progress, or uncommitted changes), one card per threshold after
// a main turn's end; "Pracuję dalej" raises this session's threshold by 5 points, up to 99; "Nie
// pytaj w tej sesji" silences it; no limits, no work, a subagent's turn: silence. Every silence
// has its positive control in the same test.

const NOW = Date.UTC(2026, 9, 11, 12)
const MIN = 60_000
const ROOT = 'C:/proj'
const SESSION = `${ROOT}/.claude/relai/limit/s1.json`
const FOCUS = `${ROOT}/.claude/relai/fokus/s1.json`
const STATUS = `${ROOT}/docs/plany/PLAN_X/STATUS.md`
const SETTINGS = `${ROOT}/docs/USTAWIENIA.md`
const CLAY = BAND.cache.color
const CARD = 'Limit planu'

type Limit = { kind: string, percentUsed: number, resetsAt?: string }
type Answer = string | Error
type World = {
  limits: Limit[], git: string | Error | null, gitCalls: { argv: readonly string[], timeoutMs?: number }[],
  asked: string[], toasts: string[], sent: string[], disk: Record<string, string>,
  card: Answer, threshold: Answer, scope: Answer, id: string,
}

const DISMISS = new Error('dismissed') // Esc on the dialog rejects the ask
const settingsFile = '# USTAWIENIA\n\nWersja RelAI: 2.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-08-07 | Język projektu | polski |\n'
const statusFile = (e2: string) => `# STATUS\n\nPlan: [PLAN.html](PLAN.html) · Status planu: **ZAAKCEPTOWANY**\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n| E1 | Jeden | ZREALIZOWANY 2026-10-10 | — | — |\n| E2 | Dwa | ${e2} | — | — |\n`
const focusFile = (stage: string) => JSON.stringify({ kind: 'plan', plan: 'PLAN_X', stage, source: 'auto', at: NOW })
const five = (percentUsed: number, resetIn = 60 * MIN): Limit => ({ kind: 'five_hour', percentUsed, resetsAt: new Date(NOW + resetIn).toISOString() })

function world(on: On, options: { git?: string | Error | null, focus?: string, relai?: boolean } = {}) {
  const w: World = {
    limits: [], git: options.git ?? '', gitCalls: [], asked: [], toasts: [], sent: [],
    disk: { ...(options.relai === false ? {} : { [SETTINGS]: settingsFile }), [STATUS]: statusFile('W TOKU'), ...(options.focus ? { [FOCUS]: options.focus } : {}) },
    card: DISMISS, threshold: DISMISS, scope: DISMISS, id: 's1',
  }
  const clock = mock.clock(on, { now: NOW })
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  on('store.delete', ($, e) => { kept.delete(e.key); return { value: undefined } })
  mock.env(on, {})
  // Paths in the system's form (P-017): compared with forward slashes
  const key = (p: string) => p.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in w.disk }))
  on('fs.read', ($, e) => (key(e.path) in w.disk ? { value: w.disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { w.disk[key(e.path)] = e.text; return { value: undefined } })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  on('session.cwd', () => ({ value: ROOT }))
  on('session.id', () => ({ value: w.id }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 5 }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 183_010 } as never, rateLimits: w.limits as never, cost: { usd: 1 } } }))
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('session.measure', ($, e) => ({ changed: e.changed }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.toast', ($, e) => { w.toasts.push(e.text); return { value: undefined } as never })
  on('prompt.submit', ($, e) => { w.sent.push(e.text); return { text: e.text } })
  on('process.run', ($, e) => {
    w.gitCalls.push({ argv: e.argv, timeoutMs: e.init?.timeoutMs })
    if (w.git instanceof Error) throw w.git
    return { value: w.git === null ? { exitCode: 128, stdout: '', stderr: 'not a git repository' } : { exitCode: 0, stdout: w.git, stderr: '' } } as never
  })
  // $.ui.ask is a tool call of AskUserQuestion: the answer by the question it asks
  on('tool.call', ($, e) => {
    const questions = (e as unknown as { questions: { question: string }[] }).questions
    const q = questions[0]?.question ?? ''
    w.asked.push(q)
    const answer = q.startsWith(CARD) ? w.card : q.startsWith('Pierwsza karta') ? w.threshold : w.scope
    if (answer instanceof Error) throw answer
    return { result: { questions, answers: { [q]: answer } } } as never
  })
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  on('turn.step', async function* ($, e) {
    const result: TurnStepResult = {
      turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 200, cache_read_input_tokens: 180_000, cache_creation_input_tokens: 3_000, model: 'claude-opus-5-5' },
    }
    return result
  })
  return { w, clock }
}

let turnNo = 0
// A main turn (or a subagent's, with agentId) ending, and the moment the card would follow it
async function turn($: Engine, clock: { advance: (ms: number) => Promise<void> }, agentId?: string) {
  const id = 'k' + ++turnNo
  const s = $.turn.step({ turnId: id, index: 0, model: 'claude-opus-5-5', messageCount: 1, ...(agentId ? { agentId } : {}) } as never)
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer: 'ok', durationMs: 5000, isAborted: false, turnId: id, reason: 'answer', ...(agentId ? { agentId } : {}) } as never)
  await clock.advance(500)
}

const start = ($: Engine) => $.session.start({ cwd: ROOT, surface: 'desktop', isInteractive: true })
const cards = (w: World) => w.asked.filter((q) => q.startsWith(CARD))

// The colour of the 5-hour battery as the desktop draws it
async function fiveColor($: Engine): Promise<string | null> {
  const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface: 'desktop', component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
  const walk = (n: RenderNode): string[] => (typeof n === 'string' ? [] : [String((n as { props?: { source?: unknown } }).props?.source ?? ''), ...((n as { children?: RenderNode[] }).children ?? []).flatMap(walk)])
  const source = walk(await ui.drawn()).join('')
  await ui.unmount()
  return source.match(/b-five">.*?<rect class="f"[^>]*fill="(#[0-9a-f]{6})"/)?.[1] ?? null
}

describe('when the card comes', () => {
  test('91 % with no focus and a clean tree: no card and the battery clay; uncommitted changes then bring one', async ($, on) => {
    const { w, clock } = world(on, { git: '' })
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await turn($, clock)
    expect(cards(w).length).toBe(0)
    expect(w.asked).toEqual([])
    expect(await fiveColor($)).toBe(CLAY)
    // Positive control in the same run: the same 91 % with a changed file asks
    w.git = ' M src/app.ts\n'
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('a stage in progress in the focus: one card at 91 %, not two after the next turn', async ($, on) => {
    const { w, clock } = world(on, { git: '', focus: focusFile('E2') })
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    expect(cards(w)[0]).toContain('progiem 90 %')
    expect(cards(w)[0]).toContain('5 h 91,00 %')
  })

  test('a focus on a stage that is not in progress does not count; git decides', async ($, on) => {
    const { w, clock } = world(on, { git: '', focus: focusFile('E1') })
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(0)
    w.disk[STATUS] = statusFile('W TOKU').replace('| E1 | Jeden | ZREALIZOWANY 2026-10-10 |', '| E1 | Jeden | W TOKU |')
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('uncommitted changes: one card at 91 %, not two', async ($, on) => {
    const { w, clock } = world(on, { git: '?? notes.md\n' })
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    expect(w.gitCalls[0]).toEqual({ argv: ['git', '--no-optional-locks', 'status', '--short'], timeoutMs: 3000 })
  })

  test('a thread card OTWARTA in the focus counts as work; a closed card does not', async ($, on) => {
    const CARD_MD = `${ROOT}/docs/fixy/NOWA_SESJA/ODNOGA.md`
    const { w, clock } = world(on, { git: '', focus: JSON.stringify({ kind: 'branch', card: 'NOWA_SESJA', source: 'auto', at: NOW }) })
    w.disk[CARD_MD] = '# ODNOGA\n\nStatus: **ZAMKNIĘTA 2026-10-10**\n'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(0)
    w.disk[CARD_MD] = '# ODNOGA\n\nStatus: **OTWARTA** od 2026-10-11\n'
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('no limits reported: silence; the first reading past the threshold asks', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    await start($)
    await turn($, clock)
    expect(w.asked).toEqual([])
    expect(w.gitCalls).toEqual([]) // nothing due: git is not even asked
    w.limits = [five(91)]
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('git fails (no repo, a timeout): the focus alone decides', async ($, on) => {
    const { w, clock } = world(on, { git: new Error('timeout') })
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(0)
    w.disk[FOCUS] = focusFile('E2')
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('both windows past the threshold: one card about both, with the later reset', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    const weekReset = NOW + 3 * 24 * 60 * MIN
    w.limits = [five(91, 30 * MIN), { kind: 'seven_day', percentUsed: 93, resetsAt: new Date(weekReset).toISOString() }]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    const q = cards(w)[0] ?? ''
    expect(q).toContain('5 h 91,00 % · tydzień 93,00 %')
    const d = new Date(weekReset)
    const two = (n: number) => String(n).padStart(2, '0')
    expect(q).toContain(`Reset ${d.getDate()}.${two(d.getMonth() + 1)} ${two(d.getHours())}:${two(d.getMinutes())} — okno, które odnawia się później.`)
  })

  test('past the threshold in the middle of a turn: the battery turns clay at once, the card waits for the turn to end', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.limits = [five(50)]
    await start($)
    await turn($, clock)
    expect(await fiveColor($)).not.toBe(CLAY) // positive control: 50 % is not clay
    await $.turn.start({ turnId: 'mid', text: 'x' })
    await $.session.measure({ context: { tokens: 183_010 } as never, rateLimits: [five(91)] as never, changed: ['rateLimits'] })
    await clock.advance(500)
    expect(await fiveColor($)).toBe(CLAY)
    expect(w.asked).toEqual([])
    w.limits = [five(91)]
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test("a subagent's turn brings no card; the main turn does", async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.limits = [five(91)]
    await start($)
    await turn($, clock, 'agent-1')
    expect(w.asked).toEqual([])
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })
})

describe('what the answers do', () => {
  test('"Pracuję dalej": the session file holds 95; quiet through 95 %, the next card at 96 %', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Pracuję dalej'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    expect(JSON.parse(w.disk[SESSION] ?? '{}').prog).toBe(95)
    for (const used of [92, 93, 94, 95]) {
      w.limits = [five(used)]
      await turn($, clock)
    }
    expect(cards(w).length).toBe(1)
    w.limits = [five(96)]
    await turn($, clock)
    expect(cards(w).length).toBe(2)
    expect(cards(w)[1]).toContain('progiem 95 %')
  })

  test('"Pracuję dalej" stops at 99, and at 99 the card does not come back', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.disk[SESSION] = JSON.stringify({ prog: 96, data: '2026-10-11', zrodlo: 'sesja' })
    w.card = 'Pracuję dalej'
    w.limits = [five(97)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    expect(JSON.parse(w.disk[SESSION] ?? '{}').prog).toBe(99)
    w.limits = [five(100)]
    await turn($, clock)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('"Nie pytaj w tej sesji" silences the card for the session, across a reload', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Nie pytaj w tej sesji'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w).length).toBe(1)
    w.limits = [five(97)]
    await turn($, clock)
    await start($) // a hot reload restores the snapshot
    await turn($, clock)
    expect(cards(w).length).toBe(1)
  })

  test('"Zapisz pracę teraz" in a RelAI project sends the save phrase with the card\'s consent and says so on the card (E3)', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(cards(w)[0]).toContain('wyśle frazę „zapisz pracę”')
    await clock.advance(100)
    expect(w.sent).toEqual([relaiSavePrompt('.claude/relai/wznowienie/proj.md')])
    expect(w.sent[0]).toContain(SAVE_CONSENT)
  })

  test('the first card saves the chosen threshold in the chosen scope, then asks against it', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.threshold = '85'
    w.scope = 'Ten projekt'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(w.asked[0]).toContain('Pierwsza karta limitu')
    expect(w.asked[1]).toBe('Gdzie zapamiętać próg 85 %?')
    expect(w.disk[SETTINGS]).toContain('| 2026-10-11 | Próg limitu | 85 |')
    expect(w.disk[SESSION]).toBeUndefined()
    expect(cards(w).length).toBe(1)
    expect(cards(w)[0]).toContain('progiem 85 %')
    // Only the first card asks for the threshold
    w.card = 'Pracuję dalej'
    w.limits = [five(96)]
    await turn($, clock)
    expect(w.asked.filter((q) => q.startsWith('Pierwsza karta')).length).toBe(1)
  })

  test('an own threshold outside 1–99 is refused before anything is written', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.threshold = '150'
    w.scope = 'Ta sesja'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    expect(w.asked.filter((q) => q.startsWith('Gdzie zapamiętać'))).toEqual([])
    expect(w.toasts.join('\n')).toContain('liczba całkowita od 1 do 99')
    expect(w.disk[SESSION]).toBeUndefined()
    expect(w.disk[SETTINGS]).not.toContain('Próg limitu')
    expect(cards(w).length).toBe(1)
  })
})

describe('the card logic alone', () => {
  const base: CardInput = { limits: [five(91)], threshold: 90, askedAt: 0, isMuted: false, isWorking: true, perTurn: 2, now: NOW, saveWords: 'x' }

  test('turns left from the session pace, marked SZACUNEK; a warning under 3 turns', () => {
    expect(cardDue(base)?.turnsLeft).toBe(4) // (100 − 91) / 2
    expect(cardDue(base)?.question).toContain('Zapas: ok. 4 tury przy tempie tej sesji (SZACUNEK).')
    expect(cardDue(base)?.question).not.toContain('Uwaga')
    const near = cardDue({ ...base, limits: [five(96)], threshold: 95 })
    expect(near?.turnsLeft).toBe(2)
    expect(near?.question).toContain('Uwaga: mniej niż 3 tury')
    expect(cardDue({ ...base, perTurn: null })?.question).toContain('brak pomiaru tempa')
  })

  test('the threshold is crossed strictly; the same threshold asks once', () => {
    expect(cardDue({ ...base, limits: [five(90)] })).toBe(null)
    expect(cardDue({ ...base, askedAt: 90 })).toBe(null)
    expect(cardDue({ ...base, isMuted: true })).toBe(null)
    expect(cardDue({ ...base, isWorking: false })).toBe(null)
    expect(cardDue({ ...base, limits: [] })).toBe(null)
    expect(cardDue(base)).not.toBe(null)
    expect([nextSessionThreshold(90), nextSessionThreshold(96), nextSessionThreshold(99)]).toEqual([95, 99, 99])
  })

  test('the focus and the session id never leave their folders', () => {
    expect(focusFilePath(ROOT, '../etc')).toBe(null)
    expect(focusFilePath(ROOT, 's1')).toBe(FOCUS)
    expect(focusRef(JSON.stringify({ kind: 'plan', plan: '../../x', stage: 'E1' }))).toBe(null)
    expect(focusRef(JSON.stringify({ kind: 'branch', card: '..' }))).toBe(null)
    expect(focusRef('{nie json')).toBe(null)
    expect(focusRef(JSON.stringify({ kind: 'branch', card: 'NOWA_SESJA' }))).toEqual({ kind: 'branch', card: 'NOWA_SESJA' })
  })

  test("the focus's status: its stage's row, the card's head, null without a document", () => {
    const rows = () => [{ id: 'E1', status: 'ZREALIZOWANY' }, { id: 'E2', status: 'W TOKU' }]
    expect(focusStatus({ kind: 'plan', plan: 'P', stage: 'E2' }, 'x', rows)).toBe('W TOKU')
    expect(focusStatus({ kind: 'plan', plan: 'P', stage: 'E9' }, 'x', rows)).toBe(null)
    expect(focusStatus({ kind: 'branch', card: 'C' }, 'Status: **OTWARTA** od 2026-10-11', rows)).toBe('OTWARTA')
    expect(focusStatus({ kind: 'branch', card: 'C' }, null, rows)).toBe(null)
  })

  test('work goes on: a stage or card in progress, or a non-empty git status; null git is "do not know"', () => {
    expect(isWorkGoing('W TOKU', null)).toBe(true)
    expect(isWorkGoing('OTWARTA', '')).toBe(true)
    expect(isWorkGoing('ZREALIZOWANY 2026-10-10', '')).toBe(false)
    expect(isWorkGoing(null, ' M a.ts\n')).toBe(true)
    expect(isWorkGoing(null, '  \n')).toBe(false)
    expect(isWorkGoing(null, null)).toBe(false)
    expect([thresholdAnswer('85'), thresholdAnswer('85 %'), thresholdAnswer('0'), thresholdAnswer('150'), thresholdAnswer('dużo')]).toEqual([85, 85, null, null, null])
  })
})

// The save (LIMIT_CHECKPOINT E3): "Zapisz pracę teraz" sends the save; the answer's own line
// ZAPIS GOTOWY puts the bar into "czeka" with the later window's reset, an answer without it into
// "przerwany". The phase is kept per project, so a reload and a /clear keep it.

const SAVED = `Testy zielone, commit lokalny abc1234, dokumenty i plik wznowienia gotowe.\n\n**${SAVE_DONE}**`
const PLAIN = '# Przekazanie sesji\n\n' + 'Cel: dokończyć koszyk. Zrobione: suma i rabaty. Stan: gałąź main, dwa pliki zmienione. Otwarte: zaokrąglenia. Następny krok: test sumy przy rabacie 100 %. '.repeat(2)

// A main turn with this answer: the save's own turn
async function answered($: Engine, clock: { advance: (ms: number) => Promise<void> }, answer: string) {
  const id = 'k' + ++turnNo
  await $.turn.start({ turnId: id } as never)
  const s = $.turn.step({ turnId: id, index: 0, model: 'claude-opus-5-5', messageCount: 1 } as never)
  for await (const _chunk of s) { /* the chunks are the engine's */ }
  await s.result
  await $.turn.complete({ answer, durationMs: 5000, isAborted: false, turnId: id, reason: 'answer' } as never)
  await clock.advance(500)
}

// The words the cache bar draws in its Text nodes, on the desktop
async function barWords($: Engine): Promise<string> {
  const ui = await $.ui.mount({ plugin: 'relai-cache-keeper', surface: 'desktop', component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} } })
  const words = (n: RenderNode): string[] => (typeof n === 'string' ? [n] : ((n as { children?: RenderNode[] }).children ?? []).flatMap(words))
  const text = words(await ui.drawn()).join(' ')
  await ui.unmount()
  return text
}

const hhmm = (at: number) => `${String(new Date(at).getHours()).padStart(2, '0')}:${String(new Date(at).getMinutes()).padStart(2, '0')}`

async function savedWorld($: Engine, on: On, answer: string, options: { relai?: boolean } = {}) {
  const { w, clock } = world(on, { git: ' M a.ts\n', ...options })
  w.card = 'Zapisz pracę teraz'
  w.limits = [five(91, 90 * MIN)]
  await start($)
  await turn($, clock)
  await clock.advance(100)
  await answered($, clock, answer)
  return { w, clock }
}

describe('the save (E3)', () => {
  test('an answer ending with ZAPIS GOTOWY: the bar says the save is ready and when the limit resets', async ($, on) => {
    await savedWorld($, on, SAVED)
    const words = await barWords($)
    expect(words).toContain(`zapis gotowy · reset ${hhmm(NOW + 90 * MIN)}`)
    expect(words).not.toContain('zapis niepełny')
  })

  test('an answer without the marker: the bar says the save is incomplete', async ($, on) => {
    await savedWorld($, on, 'Testy padły, przerwałem. Commit lokalny abc1234 zrobiony.')
    const words = await barWords($)
    expect(words).toContain('zapis niepełny')
    expect(words).not.toContain('zapis gotowy')
  })

  test('the phase outlives a reload and a /clear', async ($, on) => {
    const { w } = await savedWorld($, on, SAVED)
    await start($) // a hot reload
    expect(await barWords($)).toContain('zapis gotowy · reset')
    w.id = 's2'
    await $.session.end({ reason: 'clear', sessionId: 's1', resume: {} } as never)
    expect(await barWords($)).toContain('zapis gotowy · reset')
  })

  test('outside a RelAI project: the general handoff, said so on the card, saved to a file; then the bar waits', async ($, on) => {
    const { w } = await savedWorld($, on, PLAIN, { relai: false })
    expect(cards(w)[0]).toContain('projekt bez RelAI')
    expect(w.sent.length).toBe(1)
    expect(w.sent[0]).toContain('Przekazanie do świeżego czatu (relai-cache-keeper).')
    expect(w.sent[0]).not.toContain('zapisz pracę')
    expect(Object.keys(w.disk).some((k) => k.includes('/handoffs/') && k.endsWith('-proj.md'))).toBe(true)
    expect(await barWords($)).toContain('zapis gotowy · reset')
  })

  test('a reload while the save runs: the same conversation still takes the answer', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await clock.advance(100)
    await start($) // a hot reload in the middle of the save's turn
    expect(await barWords($)).toContain('zapis pracy trwa')
    await answered($, clock, SAVED)
    expect(await barWords($)).toContain('zapis gotowy · reset')
  })

  test('a running save another conversation finds, or a /clear under it, reads as cut short — never running forever', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await clock.advance(100)
    w.id = 's2'
    await start($) // a new conversation of the same project
    expect(await barWords($)).toContain('zapis niepełny')
    w.card = DISMISS // the new conversation's own card, dismissed
    await answered($, clock, SAVED) // its own turn is no answer to the other one's save
    expect(await barWords($)).toContain('zapis niepełny')
  })

  test('a /clear while the save runs: cut short', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await clock.advance(100)
    w.id = 's2'
    await $.session.end({ reason: 'clear', sessionId: 's1', resume: {} } as never)
    await clock.advance(100)
    expect(await barWords($)).toContain('zapis niepełny')
  })

  test('a handoff waits while the save runs', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await clock.advance(100)
    await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as never)
    await clock.advance(100)
    expect(w.sent.length).toBe(1)
    expect(w.toasts.some((t) => t.startsWith('Trwa zapis pracy'))).toBe(true)
  })

  test('while the save runs, the bar says it is under way', async ($, on) => {
    const { w, clock } = world(on, { git: ' M a.ts\n' })
    w.card = 'Zapisz pracę teraz'
    w.limits = [five(91)]
    await start($)
    await turn($, clock)
    await clock.advance(100)
    expect(w.sent.length).toBe(1)
    expect(await barWords($)).toContain('zapis pracy trwa')
  })
})

describe('the save alone', () => {
  test('the marker counts on a line of its own, bold or not; a mention inside a sentence does not', () => {
    expect(saveDone(`ok\n${SAVE_DONE}`)).toBe(true)
    expect(saveDone(`ok\n**${SAVE_DONE}**\n`)).toBe(true)
    expect(saveDone(`ok\r\n${SAVE_DONE}\r\n`)).toBe(true)
    expect(saveDone(`Na końcu napiszę ${SAVE_DONE}, gdy skończę.`)).toBe(false)
    expect(saveDone('')).toBe(false)
  })

  test('the save prompt: the phrase first, the consent, the resume file, the marker', () => {
    const text = relaiSavePrompt('.claude/relai/wznowienie/sklep.md')
    expect(text.startsWith('zapisz pracę')).toBe(true)
    expect(text).toContain(SAVE_CONSENT)
    expect(text).toContain('Plik wznowienia: .claude/relai/wznowienie/sklep.md')
    expect(text).toContain(`dokładnie: ${SAVE_DONE}`)
  })

  test('the resume path never leaves its folder; the row words per phase', () => {
    expect(resumePath('C:/proj')).toBe('.claude/relai/wznowienie/proj.md')
    expect(resumePath('C:/x/..')).toBe(null)
    expect(resumePath('../')).toBe(null)
    expect(saveRowText('idle', null, NOW)).toBe(null)
    expect(saveRowText('running', null, NOW)).toBe('zapis pracy trwa')
    expect(saveRowText('przerwany', null, NOW)).toBe('zapis niepełny')
    expect(saveRowText('czeka', null, NOW)).toBe('zapis gotowy · reset nieznany')
    expect(saveRowText('czeka', NOW + 30 * MIN, NOW)).toBe(`zapis gotowy · reset ${hhmm(NOW + 30 * MIN)}`)
  })
})
