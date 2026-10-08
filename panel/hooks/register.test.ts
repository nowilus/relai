import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = 10_000_000
const MIN = 60_000
const SETTINGS_RELAI = '# USTAWIENIA\n\nWersja RelAI: 2.7.1 · zainicjowano: 2026-08-07\n'
const CLAUDE = '# CLAUDE\n\nAktywny plan: [PANEL_CLAUDE](docs/plany/PANEL_CLAUDE/STATUS.md) — panel\n'
const STATUS = [
  '# STATUS — plan PANEL_CLAUDE',
  '',
  '[PLAN.html](PLAN.html) · utworzony 2026-10-08 · **ZAAKCEPTOWANY 2026-10-08** · model wykonawczy: Opus',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E1 | Szkielet relai-panel i pasek RelAI | W TOKU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Panel boczny | OCZEKUJE | — | |',
].join('\r\n')

const RELAI_FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: SETTINGS_RELAI,
  [`${CWD}/CLAUDE.md`]: CLAUDE,
  [`${CWD}/docs/plany/PANEL_CLAUDE/STATUS.md`]: STATUS,
}

const BAND = (bodyColumns = 140) => ({
  component: 'AbovePrompt' as const,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
})

function world(on: On, files: Record<string, string>, commands: string[] = [], store: Record<string, unknown> = {}) {
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, store)
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  // The engine hands $.fs paths on in the OS's own form (C:\proj\... on Windows)
  const key = (path: string) => path.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in files }))
  on('fs.read', ($, e) => (key(e.path) in files ? { value: files[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('command.list', () => ({ value: commands.map((name) => ({ name, description: name, source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 120_000 } as never, rateLimits: [], cost: { usd: 1.25 } } }))
  // The engine's own band beneath the plugin: what it draws must stay
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    return Box({ key: 'engine', children: [Text({ children: ['engine'] })] })
  })
  return clock
}

async function start($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
}

describe('the RelAI band', () => {
  test('stays silent outside a RelAI project, on terminal and desktop', async ($, on) => {
    world(on, { [`${CWD}/docs/USTAWIENIA.md`]: '# ustawienia innego projektu\n' })
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...BAND() })
      expect(await ui.find({ key: 'plan' })).toBeUndefined()
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('shows the active plan, its stage, the timer and the cost in a RelAI project, on terminal and desktop', async ($, on) => {
    world(on, RELAI_FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...BAND() })
      const plan = await ui.find({ key: 'plan' })
      expect(plan?.text).toContain('PANEL_CLAUDE')
      expect(plan?.text).toContain('E1 W TOKU')
      expect(plan?.text).toContain('0/2')
      expect((await ui.find({ key: 'timer' }))?.text).toContain('cache nieznany')
      expect((await ui.find({ key: 'cost' }))?.text).toContain('$1.25')
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  test('hides its own timer when cache-keeper-pl runs in the session', async ($, on) => {
    world(on, RELAI_FILES, ['cache', 'keepwarm', 'handoff'])
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...BAND() })
      expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_CLAUDE')
      expect(await ui.find({ key: 'timer' })).toBeUndefined()
      await ui.unmount()
    }
  })

  test('hides its own timer for the prefixed ckp-cache command too', async ($, on) => {
    world(on, RELAI_FILES, ['ckp-cache'])
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_CLAUDE') // the band is there at all
    expect(await ui.find({ key: 'timer' })).toBeUndefined()
    await ui.unmount()
  })

  test('says "brak aktywnego planu" when CLAUDE.md has none and drops the cost on a narrow band', async ($, on) => {
    world(on, { ...RELAI_FILES, [`${CWD}/CLAUDE.md`]: 'Aktywny plan: brak\n' })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND(80) })
    expect((await ui.find({ key: 'plan' }))?.text).toContain('brak aktywnego planu')
    expect(await ui.find({ key: 'cost' })).toBeUndefined()
    expect(await ui.find({ key: 'timer' })).toBeDefined()
    await ui.unmount()
  })

  test('an unreadable STATUS.md reads as an unknown plan, not a failure', async ($, on) => {
    const { [`${CWD}/docs/plany/PANEL_CLAUDE/STATUS.md`]: _gone, ...rest } = RELAI_FILES
    world(on, rest)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'plan' }))?.text).toContain('plan nieznany')
    await ui.unmount()
  })

  test('the timer survives a reload through $.store: warm, then cooling at the 10-minute threshold', async ($, on) => {
    const snap = { id: 'session-1', lastActivity: NOW - 20 * MIN, ttl: { ttlMeasured: 0, shortTtlRewrites: 0 }, ctx: 120_000, costUsd: 2, announcedFor: 0, announced: [], savedAt: NOW - 20 * MIN }
    const clock = world(on, RELAI_FILES, [], { 'snap:session-1': snap })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...BAND() })
    expect((await ui.find({ key: 'timer' }))?.text).toContain('cache ciepły ~40 min')
    await ui.unmount()
    await clock.advance(31 * MIN)
    const later = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...BAND() })
    expect((await later.find({ key: 'timer' }))?.text).toContain('cache stygnie ~9 min')
    await later.unmount()
  })

  test('a snapshot of another session is not restored', async ($, on) => {
    const snap = { id: 'other', lastActivity: NOW - MIN, ttl: { ttlMeasured: 0, shortTtlRewrites: 0 }, ctx: 1, costUsd: 0, announcedFor: 0, announced: [], savedAt: NOW - MIN }
    world(on, RELAI_FILES, [], { 'snap:session-1': snap })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'timer' }))?.text).toContain('cache nieznany')
    await ui.unmount()
  })
})
