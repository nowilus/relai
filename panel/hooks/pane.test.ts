import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'
import { FORMS } from './core/commands.mjs'

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const SETTINGS_RELAI = '# USTAWIENIA\n\nWersja RelAI: 2.7.1 · zainicjowano: 2026-08-07\n'
const CLAUDE = '# CLAUDE\n\nAktywny plan: brak\n'
// A cut of docs/KOMENDY.md in its real shape: both tables, an example in parentheses, CRLF
const KOMENDY = [
  '# KOMENDY — RelAI',
  '',
  '## Komendy',
  '',
  '| Komenda | Co robi | Kiedy użyć |',
  '|---|---|---|',
  '| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP | przed większą zmianą |',
  '| `/relai-tour` | oprowadza po projekcie | gdy wracasz po przerwie |',
  '',
  '## Frazy, które działają',
  '',
  '| Powiesz | Co się stanie |',
  '|---|---|',
  '| „kontynuujemy pracę" / „let\'s continue" | RelAI odtwarza kontekst |',
  '| „sprawdź status" / „status check" | krótki raport |',
  '| „coś nie działa — …" (np. „coś nie działa — npm test pada") | odtwarza błąd komendą |',
  '',
  '## Czego RelAI pilnuje bez proszenia',
].join('\r\n')

const RELAI_FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: SETTINGS_RELAI,
  [`${CWD}/CLAUDE.md`]: CLAUDE,
  [`${CWD}/docs/KOMENDY.md`]: KOMENDY,
}

const RELAI_COMMANDS = FORMS.map((f) => 'relai:' + f.command)

const PANE = {
  component: 'Pane' as const,
  requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
}

type Calls = { commands: { command: string, args: string }[], prompts: string[], opened: string[] }

function world(on: On, files: Record<string, string>, commands: string[]): Calls {
  const calls: Calls = { commands: [], prompts: [], opened: [] }
  mock.clock(on, { now: 1_000_000 })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  const key = (path: string) => path.replace(/\\/g, '/')
  on('fs.exists', ($, e) => ({ value: key(e.path) in files }))
  on('fs.read', ($, e) => (key(e.path) in files ? { value: files[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('command.list', () => ({ value: commands.map((name) => ({ name, description: `opis ${name} — reszta opisu`, source: 'plugin' as const })) }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  // Beneath the plugin these stand for the engine: each records what reached it (proof by effect)
  on('command.run', ($, e) => { calls.commands.push({ command: e.command, args: e.args }); return { text: 'ok' } })
  on('prompt.submit', ($, e) => { calls.prompts.push(e.text); return { text: e.text } })
  on('ui.open', ($, e) => { calls.opened.push(e.id); return { value: { isPlaced: true as const } } })
  return calls
}

async function openPanel($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'terminal', isInteractive: true })
  return $.command.run({ command: 'relai-panel' })
}

const SURFACES = ['terminal', 'desktop'] as const

describe('the /relai-panel pane', () => {
  test('outside a RelAI project the command answers one sentence and opens nothing', async ($, on) => {
    const calls = world(on, { [`${CWD}/docs/USTAWIENIA.md`]: '# inny projekt\n' }, RELAI_COMMANDS)
    const r = await openPanel($)
    expect(r.text).toContain('nie jest projektem RelAI')
    expect(r.text).toContain('zacznijmy projekt')
    expect(calls.opened).toEqual([])
  })

  test('every one of the 14 commands has a form with a preview, on terminal and desktop', async ($, on) => {
    const calls = world(on, RELAI_FILES, RELAI_COMMANDS)
    const r = await openPanel($)
    expect(r.text).toContain('Panel RelAI otwarty')
    expect(calls.opened).toEqual(['relai-panel'])
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...PANE })
      let withForm = 0
      for (const f of FORMS) {
        await ui.press({ key: `cmd-${f.command}` })
        expect(await ui.find({ key: 'form' })).toBeDefined()
        const preview = await ui.find({ key: 'preview' })
        expect(preview?.text).toContain(`/relai:${f.command}`)
        if (preview) withForm += 1
        await ui.press({ key: `cmd-${f.command}` }) // closes it again
      }
      expect(withForm).toBe(FORMS.length)
      await ui.unmount()
    }
    expect(calls.commands.filter((c) => c.command !== 'relai-panel')).toEqual([])
  })

  test('relai-tour krotko: the preview shows the exact text and only "Wyślij" sends it', async ($, on) => {
    const calls = world(on, RELAI_FILES, RELAI_COMMANDS)
    await openPanel($)
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...PANE })
      await ui.press({ key: 'cmd-relai-tour' })
      await ui.select({ key: 'f-length', value: 'krotko' })
      expect((await ui.find({ key: 'preview' }))?.text).toContain('Do czatu pójdzie: /relai:relai-tour krotko')
      const before = calls.commands.filter((c) => c.command === 'relai:relai-tour').length
      expect(before).toBe(surface === 'terminal' ? 0 : 1) // nothing went out on filling the form
      await ui.press({ key: 'send' })
      expect(calls.commands.filter((c) => c.command === 'relai:relai-tour').at(-1)).toEqual({ command: 'relai:relai-tour', args: 'krotko' })
      expect((await ui.find({ key: 'sent' }))?.text).toContain('Wysłano do czatu: /relai:relai-tour krotko')
      await ui.select({ key: 'f-length', value: '_' }) // back to the full tour for the next surface
      await ui.press({ key: 'cmd-relai-tour' })
      await ui.unmount()
    }
  })

  test('an invalid value shows why and offers no "Wyślij"', async ($, on) => {
    const calls = world(on, RELAI_FILES, RELAI_COMMANDS)
    await openPanel($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...PANE })
    await ui.press({ key: 'cmd-relai-stage' })
    await ui.input({ key: 'f-stage', text: '5' })
    expect((await ui.find({ key: 'errors' }))?.text).toContain('E i numer')
    // E5: /relai-stage prepares a confirmation card instead of sending (D-35 moved to the pane)
    expect(await ui.find({ key: 'prepare' })).toBeUndefined()
    await ui.input({ key: 'f-stage', text: 'E3' })
    expect((await ui.find({ key: 'preview' }))?.text).toContain('/relai:relai-stage E3')
    expect(await ui.find({ key: 'prepare' })).toBeDefined()
    expect(await ui.find({ key: 'send' })).toBeUndefined()
    expect(calls.commands.filter((c) => c.command !== 'relai-panel')).toEqual([])
    await ui.unmount()
  })

  test('a phrase button sends that very phrase through prompt.submit; a template only completed', async ($, on) => {
    const calls = world(on, RELAI_FILES, RELAI_COMMANDS)
    await openPanel($)
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...PANE })
      await ui.press({ key: 'tab-phrases' })
      const status = await ui.find({ key: 'phrase-1' })
      expect(status?.text).toContain('sprawdź status')
      await ui.press({ key: 'phrase-1' })
      expect(calls.prompts.at(-1)).toBe('sprawdź status')
      expect(await ui.find({ key: 'phrase-2' })).toBeUndefined() // empty template: no send
      await ui.input({ key: 'fill-2', text: 'npm test pada' })
      expect((await ui.find({ key: 'ph-prev-2' }))?.text).toContain('coś nie działa — npm test pada')
      await ui.press({ key: 'phrase-2' })
      expect(calls.prompts.at(-1)).toBe('coś nie działa — npm test pada')
      await ui.input({ key: 'fill-2', text: '' })
      await ui.press({ key: 'tab-commands' })
      await ui.unmount()
    }
    expect(calls.prompts).toEqual(['sprawdź status', 'coś nie działa — npm test pada', 'sprawdź status', 'coś nie działa — npm test pada'])
  })

  test('the cheat sheet filters and opens a command form', async ($, on) => {
    world(on, RELAI_FILES, RELAI_COMMANDS)
    await openPanel($)
    const ui = await $.ui.mount({ plugin: 'relai-panel', surface: 'terminal', ...PANE })
    await ui.press({ key: 'tab-sheet' })
    expect(await ui.find({ key: 'sheet-relai-tour' })).toBeDefined()
    await ui.input({ key: 'search', text: 'zip' })
    expect(await ui.find({ key: 'sheet-relai-tour' })).toBeUndefined()
    expect(await ui.find({ key: 'sheet-relai-backup' })).toBeDefined()
    await ui.press({ key: 'open-relai-backup' })
    expect((await ui.find({ key: 'preview' }))?.text).toContain('/relai:relai-backup')
    await ui.unmount()
  })

  test('without the relai plugin the pane says so and sends nothing, command or phrase', async ($, on) => {
    const calls = world(on, RELAI_FILES, ['cache', 'relai-panel'])
    await openPanel($)
    for (const surface of SURFACES) {
      const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...PANE })
      expect((await ui.find({ key: 'no-relai' }))?.text).toContain('nie jest zainstalowany')
      await ui.press({ key: 'cmd-relai-tour' })
      expect((await ui.find({ key: 'preview' }))?.text).toContain('/relai-tour')
      expect(await ui.find({ key: 'send' })).toBeUndefined()
      await ui.press({ key: 'cmd-relai-tour' })
      await ui.press({ key: 'tab-phrases' })
      expect(await ui.find({ key: 'phrase-1' })).toBeUndefined()
      await ui.press({ key: 'tab-commands' })
      await ui.unmount()
    }
    expect(calls.commands.filter((c) => c.command !== 'relai-panel')).toEqual([])
    expect(calls.prompts).toEqual([])
  })
})
