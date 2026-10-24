import { expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'

type Engine = Parameters<TestBody>[0]

const run = ($: Engine, command: string, args = '') =>
  $.command.run({ command, args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } }).then((r) => JSON.stringify(r))

function world(on: On) {
  mock.clock(on, { now: 1_000_000 })
  mock.store(on)
}

test('/cache shows the status and keeps a changed setting', async ($, on) => {
  world(on)
  const status = await run($, 'cache')
  expect(status).toContain('okno cache 60 min')
  expect(status).toContain('założone')

  expect(await run($, 'cache', 'prog 200k')).toContain('od 200k')
  expect(await run($, 'cache')).toContain('od 200k')
})

test('/cache explains a wrong value instead of saving it', async ($, on) => {
  world(on)
  const answer = await run($, 'cache', 'ttl 7')
  expect(answer).toContain('ttl przyjmuje 5, 60 albo auto')
  expect(await run($, 'cache')).toContain('okno cache 60 min')
})

test('/handoff dalej without a ready handoff says so', async ($, on) => {
  world(on)
  expect(await run($, 'handoff', 'dalej')).toContain('Brak gotowego przekazania')
})

test('the band yields to the engine before the first request, on terminal and desktop', async ($, on) => {
  world(on)
  // The engine's own band beneath the plugin: the mod must pass to it
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'relai-cache-keeper',
      surface,
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 120, scroll: { offset: 0, bodyRows: 9 }, view: {} },
    })
    expect(await ui.find({ key: 'handoff' })).toBeUndefined()
    expect(await ui.find({ key: 'engine' })).toBeDefined()
    await ui.unmount()
  }
})

test('/keepwarm refuses when there is no cache to keep yet', async ($, on) => {
  world(on)
  expect(await run($, 'keepwarm')).toContain('Nie ma jeszcze czego podtrzymywać')
})

test('the band draws above the bands beneath it instead of hiding them, on terminal and desktop', async ($, on) => {
  mock.clock(on, { now: 10_000_000 })
  mock.store(on, { 'snap:s1': { id: 's1', lastActivity: 10_000_000 - 60_000, savedAt: 10_000_000 - 60_000, ctx: 200_000, handoff: { phase: 'idle', notTurn: '', relai: false, body: '', path: '' } } })
  mock.env(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', () => ({ value: false }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'beneath', children: [Text({ children: ['beneath'] })] })
  })
  await $.session.start({ cwd: 'C:/proj', surface: 'terminal', isInteractive: true })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'relai-cache-keeper',
      surface,
      component: 'AbovePrompt',
      props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 140, scroll: { offset: 0, bodyRows: 9 }, view: {} },
    })
    // Z1: calm draws no button, so the card itself stands for the band (brief v2 §1)
    expect(await ui.find({ key: 'relai-cache-card' })).toBeDefined()
    expect(await ui.find({ key: 'beneath' })).toBeDefined()
    await ui.unmount()
  }
})


// LIMIT_CHECKPOINT E1 and Aneks B: `/cache limit-warn [N]` (5 h) and `/cache limit-warn-week [N]`
// — the number now or on a card, then the scope on a card: "Ta sesja" / "Ten projekt" (RelAI only)
// / "Wszystkie projekty" / "Nie zapisuj". Nothing is written before the scope; Esc writes nothing.
const SESSION_FILE = 'C:/proj/.claude/relai/limit/s1.json'
const PROJECT_FILE = 'C:/proj/docs/USTAWIENIA.md'
const GLOBAL_FILE = 'C:/home/.claude/relai/USTAWIENIA.md'
const DISMISS = new Error('dismissed') // Esc on the dialog rejects the ask

type Asked = { question: string, header: string, options: string[] }

type Options = { broken?: string[], clearAfter?: string } // reads that fail; a card header after which a /clear changes the id

function project(on: On, files: Record<string, string>, answers: Record<string, string | Error> = {}, options: Options = {}) {
  const session = { id: 's1' }
  const clock = mock.clock(on, { now: Date.UTC(2026, 9, 11, 10) })
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  mock.env(on, { USERPROFILE: 'C:/home' })
  const disk: Record<string, string> = { [PROJECT_FILE]: 'Wersja RelAI: 2.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n', ...files }
  const asked: Asked[] = []
  const toasts: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: session.id }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 3 }))
  // Paths in the system's form (P-017): compared with forward slashes
  const key = (p: string) => p.split(String.fromCharCode(92)).join('/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk && !(options.broken ?? []).includes(key(e.path)) ? { value: disk[key(e.path)] ?? '' } : { deny: 'EBUSY ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('ui.toast', ($, e) => { toasts.push(e.text); return { value: undefined } as never })
  // $.ui.ask is a tool call of AskUserQuestion: the answer by the card's header
  on('tool.call', ($, e) => {
    const questions = (e as unknown as { questions: { question: string, header: string, options: { label: string }[] }[] }).questions
    const q = questions[0]
    asked.push({ question: q?.question ?? '', header: q?.header ?? '', options: (q?.options ?? []).map((o) => o.label) })
    const answer = answers[q?.header ?? ''] ?? DISMISS
    if (options.clearAfter === q?.header) session.id = 's2' // the person ran /clear while the card waited
    if (answer instanceof Error) throw answer
    return { result: { questions, answers: { [q?.question ?? '']: answer } } } as never
  })
  return { kept, disk, asked, toasts, clock, session, options }
}

const startIn = ($: Engine) => $.session.start({ cwd: 'C:/proj', surface: 'terminal', isInteractive: true })

test('/cache limit-warn refuses 101, abc and 0 in Polish, asks nothing and keeps the defaults', async ($, on) => {
  const { kept, disk, asked, clock } = project(on, {})
  await startIn($)
  expect(await run($, 'cache')).toContain('Próg limitu: 5 h 90 % (domyślny) · tydzień 98 % (domyślny)')
  for (const bad of ['101', 'abc', '0']) {
    const answer = await run($, 'cache', `limit-warn ${bad}`)
    expect(answer).toContain('limit-warn: liczba całkowita od 1 do 99, np. 85, 90, 95')
    expect(answer).toContain('Próg limitu: 5 h 90 % (domyślny)')
  }
  expect(await run($, 'cache', 'limit-warn-week 100')).toContain('limit-warn-week: liczba całkowita od 1 do 99, np. 95, 98, 99')
  await clock.advance(200)
  expect(asked).toEqual([])
  expect(kept.get('settings')).toBeUndefined()
  expect(Object.keys(disk).some((p) => p.includes('/limit/'))).toBe(false)
})

for (const [scope, file, check] of [
  ['Ta sesja', SESSION_FILE, (t: string) => expect(JSON.parse(t)).toEqual({ prog: 85, data: '2026-10-11', zrodlo: 'sesja' })],
  ['Ten projekt', PROJECT_FILE, (t: string) => expect(t).toContain('| 2026-10-11 | Próg limitu | 85 |')],
  ['Wszystkie projekty', GLOBAL_FILE, (t: string) => expect(t).toContain('| 2026-10-11 | Próg limitu | 85 |')],
] as const) {
  test(`/cache limit-warn 85, "${scope}": that scope's file holds 85; the scope card offers "Nie zapisuj"`, async ($, on) => {
    const w = project(on, {}, { 'Zasięg': scope })
    await startIn($)
    expect(await run($, 'cache', 'limit-warn 85')).toContain('Próg limitu 5 h 85 %: wybierz na karcie, gdzie go zapamiętać.')
    await w.clock.advance(200)
    expect(w.asked.length).toBe(1)
    expect(w.asked[0]?.question).toBe('Gdzie zapamiętać próg limitu 5 h 85 %?')
    expect(w.asked[0]?.options).toEqual(['Ta sesja', 'Ten projekt', 'Wszystkie projekty', 'Nie zapisuj'])
    check(w.disk[file] ?? '')
    expect(w.toasts.join('\n')).toContain(`Próg limitu 5 h: 85 % (${scope.toLowerCase()}).`)
    // The command never touches the plugin's settings (Aneks B)
    expect(w.kept.get('settings')).toBeUndefined()
  })
}

for (const answer of ['Nie zapisuj', DISMISS] as const) {
  test(`${answer instanceof Error ? 'Esc' : answer} on the scope card writes nothing (negative proof on all three files)`, async ($, on) => {
    const w = project(on, {}, { 'Zasięg': answer })
    const before = w.disk[PROJECT_FILE]
    await startIn($)
    await run($, 'cache', 'limit-warn 85')
    await w.clock.advance(200)
    expect(w.asked.length).toBe(1)
    expect(w.disk[SESSION_FILE]).toBeUndefined()
    expect(w.disk[GLOBAL_FILE]).toBeUndefined()
    expect(w.disk[PROJECT_FILE]).toBe(before)
    expect(await run($, 'cache')).toContain('Próg limitu: 5 h 90 % (domyślny)')
  })
}

test('a limitWarn left in the plugin store does not change the threshold read (negative proof, Aneks B)', async ($, on) => {
  const w = project(on, {})
  w.kept.set('settings', { limitWarn: 70 })
  await startIn($)
  expect(await run($, 'cache')).toContain('Próg limitu: 5 h 90 % (domyślny)')
  // Positive control in the same run: a project row does change it
  w.disk[PROJECT_FILE] += '| 2026-10-11 | Próg limitu | 70 |\n'
  expect(await run($, 'cache')).toContain('Próg limitu: 5 h 70 % (ten projekt)')
})

test('without a number (the panel\'s "Zmień"): the value card, then the scope card; the week has its own answers', async ($, on) => {
  const w = project(on, {}, { 'Próg tydzień': '99 %', 'Zasięg': 'Ten projekt' })
  await startIn($)
  expect(await run($, 'cache', 'limit-warn-week')).toContain('Próg limitu tygodnia: wybierz wartość i zasięg na kartach.')
  await w.clock.advance(200)
  expect(w.asked.map((a) => a.header)).toEqual(['Próg tydzień', 'Zasięg'])
  expect(w.asked[0]?.options).toEqual(['95 %', '98 %', '99 %'])
  expect(w.asked[0]?.question).toContain('Teraz 98 % (domyślny)')
  expect(w.disk[PROJECT_FILE]).toContain('| 2026-10-11 | Próg limitu tygodnia | 99 |')
  expect(w.disk[PROJECT_FILE]).not.toContain('| Próg limitu |')
  const status = await run($, 'cache')
  expect(status).toContain('Próg limitu: 5 h 90 % (domyślny) · tydzień 99 % (ten projekt)')
  // 99 asks no more (overLimits): the line says the week's card is off, the 5 hours' still comes
  expect(status).toContain('a po turze przychodzi karta (tydzień: karta wyłączona przy 99 %).')
})

test('a session file that outranks the chosen project row is said so in the toast', async ($, on) => {
  const w = project(on, { [SESSION_FILE]: JSON.stringify({ prog: 95 }) }, { 'Próg 5 h': '85 %', 'Zasięg': 'Ten projekt' })
  await startIn($)
  await run($, 'cache', 'limit-warn')
  await w.clock.advance(200)
  expect(w.asked[0]?.options).toEqual(['85 %', '90 %', '95 %'])
  expect(w.toasts.join('\n')).toContain('Obowiązuje nadal 95 % (ta sesja) — ma pierwszeństwo.')
})

test('an answer that comes after a /clear is dropped: nothing written, not even the new session file', async ($, on) => {
  const w = project(on, {}, { 'Próg 5 h': '85 %', 'Zasięg': 'Ta sesja' }, { clearAfter: 'Próg 5 h' })
  await startIn($)
  await run($, 'cache', 'limit-warn')
  await w.clock.advance(200)
  expect(w.asked.map((a) => a.header)).toEqual(['Próg 5 h'])
  expect(Object.keys(w.disk).some((p) => p.includes('/limit/'))).toBe(false)
  // Positive control in the same run: the same cards without the /clear write the file of s2
  w.options.clearAfter = undefined
  await run($, 'cache', 'limit-warn')
  await w.clock.advance(200)
  expect(JSON.parse(w.disk['C:/proj/.claude/relai/limit/s2.json'] ?? '{}').prog).toBe(85)
})

test('a threshold file that cannot be read for a moment keeps the threshold read before (no fall to the default)', async ($, on) => {
  const w = project(on, { [PROJECT_FILE]: 'Wersja RelAI: 2.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-10-11 | Próg limitu | 70 |\n' })
  await startIn($)
  expect(await run($, 'cache')).toContain('5 h 70 % (ten projekt)')
  w.options.broken = [PROJECT_FILE]
  expect(await run($, 'cache')).toContain('5 h 70 % (ten projekt)')
  // Positive control: the file read again, without the row, gives the default
  w.options.broken = []
  w.disk[PROJECT_FILE] = 'Wersja RelAI: 2.8.0\n'
  expect(await run($, 'cache')).toContain('5 h 90 % (domyślny)')
})
