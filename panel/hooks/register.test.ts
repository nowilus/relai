import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = 10_000_000
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

function world(on: On, files: Record<string, string>, commands: string[] = [], store: Record<string, unknown> = {}, here = CWD) {
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, store)
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: here }))
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

  // Brief v2 §2 (AUDYT_MODOW Z1): one row, the label without "RelAI ·", the session's cost gone
  // from this bar (it stands once, in the cache bar)
  test('shows its label, the active plan, its stage and no cost in a RelAI project, on terminal and desktop', async ($, on) => {
    world(on, RELAI_FILES)
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...BAND() })
      const plan = await ui.find({ key: 'plan' })
      expect(plan?.text).toContain('PANEL_CLAUDE · E1')
      expect(plan?.text).toContain('W TOKU')
      expect((await ui.find({ key: 'figure' }))?.text).toContain('0/2')
      expect((await ui.find({ key: 'figure' }))?.text).toContain('etapów')
      expect((await ui.find({ key: 'label' }))?.text).toBe('plan')
      expect(await ui.find({ key: 'cost' })).toBeUndefined()
      expect((await ui.find({ key: 'relai-band-frame' }))?.text).not.toContain('$1.25')
      expect((await ui.find({ key: 'relai-band-frame' }))?.text).not.toContain('sesja')
      expect(await ui.find({ key: 'engine' })).toBeDefined()
      await ui.unmount()
    }
  })

  // Aneks C (2026-10-09): the prompt-cache timer is relai-cache-keeper's alone; the band draws none,
  // with or without the keeper in the session (its own tests hold the countdown)
  test('draws no cache timer, with or without the cache keeper in the session', async ($, on) => {
    world(on, RELAI_FILES, ['cache', 'keepwarm', 'handoff'])
    await start($)
    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...BAND() })
      expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_CLAUDE') // the band is there at all
      expect(await ui.find({ key: 'timer' })).toBeUndefined()
      expect(JSON.stringify(await ui.drawn())).not.toContain('cache ')
      await ui.unmount()
    }
  })

  // STYL_PASKOW_CLAUDE.md (2026-10-09): on a narrow bar the label goes on top, nothing is dropped
  test('says "brak aktywnego planu" when CLAUDE.md has none; a narrow bar puts its label on top', async ($, on) => {
    world(on, { ...RELAI_FILES, [`${CWD}/CLAUDE.md`]: 'Aktywny plan: brak\n' })
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND(80) })
    expect((await ui.find({ key: 'plan' }))?.text).toContain('brak aktywnego planu')
    expect((await ui.find({ key: 'head' }))?.text).toBe('plan')
    expect(await ui.find({ key: 'cost' })).toBeUndefined()
    await ui.unmount()
  })

  test('a session whose shell stands in a subfolder still finds the project root (E9, P-021)', async ($, on) => {
    world(on, RELAI_FILES, [], {}, `${CWD}/docs/plany`)
    await start($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...BAND() })
    expect((await ui.find({ key: 'plan' }))?.text).toContain('PANEL_CLAUDE')
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
})
