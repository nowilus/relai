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

// LIMIT_CHECKPOINT E1: `/cache limit-warn N` — a whole number 1–99 saved in the store and in this
// session's threshold file, which outranks the project's row; anything else refused in Polish
function project(on: On, files: Record<string, string>) {
  mock.clock(on, { now: Date.UTC(2026, 9, 11, 10) })
  const kept = new Map<string, unknown>()
  on('store.get', ($, e) => ({ value: kept.get(e.key) as never }))
  on('store.set', ($, e) => { kept.set(e.key, e.value); return { value: undefined } })
  mock.env(on, { USERPROFILE: 'C:/home' })
  const disk: Record<string, string> = { 'C:/proj/docs/USTAWIENIA.md': 'Wersja RelAI: 2.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n', ...files }
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: 'C:/proj' }))
  on('session.id', () => ({ value: 's1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('session.turns', () => ({ value: 3 }))
  // Paths in the system's form (P-017): compared with forward slashes
  const key = (p: string) => p.split(String.fromCharCode(92)).join('/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  return { kept, disk }
}

test('/cache limit-warn refuses 101, abc and 0 in Polish and keeps the default', async ($, on) => {
  const { kept, disk } = project(on, {})
  await $.session.start({ cwd: 'C:/proj', surface: 'terminal', isInteractive: true })
  expect(await run($, 'cache')).toContain('Próg limitu: 90 % (domyślny)')
  for (const bad of ['101', 'abc', '0']) {
    const answer = await run($, 'cache', `limit-warn ${bad}`)
    expect(answer).toContain('limit-warn: liczba całkowita od 1 do 99')
    expect(answer).toContain('Próg limitu: 90 % (domyślny)')
  }
  expect(kept.get('settings')).toBeUndefined()
  expect(Object.keys(disk).some((p) => p.includes('/limit/'))).toBe(false)
})

test('/cache limit-warn 85 saves 85 and this session\'s file, which wins over the project row', async ($, on) => {
  const { kept, disk } = project(on, { 'C:/proj/docs/USTAWIENIA.md': 'Wersja RelAI: 2.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-10-11 | Próg limitu | 95 |\n' })
  await $.session.start({ cwd: 'C:/proj', surface: 'terminal', isInteractive: true })
  expect(await run($, 'cache')).toContain('Próg limitu: 95 % (projekt)')
  expect(await run($, 'cache', 'limit-warn 85')).toContain('Próg limitu: 85 % (sesja)')
  expect((kept.get('settings') as { limitWarn: number, maxLimitPercent: number }).limitWarn).toBe(85)
  expect((kept.get('settings') as { maxLimitPercent: number }).maxLimitPercent).toBe(90)
  expect(JSON.parse(disk['C:/proj/.claude/relai/limit/s1.json'] ?? '{}')).toEqual({ prog: 85, data: '2026-10-11', zrodlo: 'sesja' })
  expect(await run($, 'cache')).toContain('Próg limitu: 85 % (sesja)')
})
