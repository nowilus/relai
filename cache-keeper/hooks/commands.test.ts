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
