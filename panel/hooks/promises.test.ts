import { describe, expect, mock, test, type Plugin, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'

// Promises the pane keeps per act (AUDYT_MODOW Z7): a keystroke in a field costs no file and no
// process and at most one drawing; a send and the end of its flash read no file; the map tab runs
// its loader once and a fold inside it reads nothing. Counted on the nouns beneath the plugin, as
// redraw.test.ts counts them; every count has its positive control in the same file.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const NOW = new Date(2026, 9, 10, 12, 0).getTime()
const RUN = '2026-10-10_110000'
const RUN_DIR = `${CWD}/.claude/relai/work/CREW/${RUN}`
const TASKS = `${RUN_DIR}/zadania.json`
const PROBE_VAR = 'RELAI_DRAW_PROBE'

const STATUS = [
  '# STATUS — plan PANEL_X', '',
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-08** · model: Opus', '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |', '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-08 | — | |',
  '| E2 | Mapa | W TOKU | — | |', '',
].join('\n')
const KOMENDY = [
  '## Komendy', '', '| Komenda | Co robi | Kiedy użyć |', '|---|---|---|',
  '| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP | przed większą zmianą |', '',
  '## Frazy, które działają', '', '| Powiesz | Co się stanie |', '|---|---|',
  '| „kontynuujemy pracę" | RelAI odtwarza kontekst |', '| „sprawdź status" | krótki raport |', '',
].join('\n')
const FILES: Record<string, string> = {
  [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 2.7.1\n',
  [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: [PANEL_X](docs/plany/PANEL_X/STATUS.md) — w toku.\n',
  [`${CWD}/docs/plany/PANEL_X/STATUS.md`]: STATUS,
  [`${CWD}/docs/KOMENDY.md`]: KOMENDY,
  [TASKS]: JSON.stringify([{ id: 't1', title: 'Rdzeń', files: ['a.mjs'], dependsOn: [] }]),
  [`${RUN_DIR}/manifest.json`]: JSON.stringify({ runId: RUN, tasks: [{ id: 't1', status: 'running' }] }),
}

// The drawings, counted from outside: an inline plugin in the outermost tier wraps the pane's
// drawing and asks one variable per pass, which the test's own hook beneath counts. It reaches
// none of the panel's internals (register.tsx is being split as this file is written).
const PROBE: Plugin = {
  name: 'relai-draw-probe',
  tier: 'prepend',
  register(on) {
    on('ui.render', { component: 'Pane', requestId: 'relai-panel' }, async ($, e, next) => {
      await $.env.get('RELAI_DRAW_PROBE').catch(() => undefined)
      return next(e)
    })
  },
}

type Counts = { fs: number, process: number, draws: number, read: string[], commands: string[] }

function world(on: On) {
  const n: Counts = { fs: 0, process: 0, draws: 0, read: [], commands: [] }
  const disk: Record<string, string> = { ...FILES }
  const key = (path: string) => path.replace(/\\/g, '/')
  const clock = mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('env.get', ($, e) => { if (e.name === PROBE_VAR) n.draws += 1; return { value: undefined } })
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'session-1' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('fs.exists', ($, e) => {
    n.fs += 1
    return { value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }
  })
  on('fs.read', ($, e) => {
    n.fs += 1
    n.read.push(key(e.path))
    return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }
  })
  on('fs.write', ($, e) => { n.fs += 1; disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.stat', ($, e) => {
    n.fs += 1
    const k = key(e.path)
    return k in disk ? { value: { kind: 'file' as const, size: (disk[k] ?? '').length, mtimeMs: 1, isLink: false } } : { deny: 'ENOENT ' + e.path }
  })
  on('fs.list', ($, e) => {
    n.fs += 1
    const dir = key(e.path ?? '') + '/'
    const names = new Map<string, 'file' | 'dir'>()
    for (const p of Object.keys(disk).filter((x) => x.startsWith(dir))) {
      const rest = p.slice(dir.length)
      const cut = rest.indexOf('/')
      names.set(cut < 0 ? rest : rest.slice(0, cut), cut < 0 ? 'file' : 'dir')
    }
    return { value: [...names].map(([name, kind]) => ({ name, kind, size: 1, mtimeMs: NOW, isLink: false })) }
  })
  on('process.run', () => {
    n.process += 1
    return { value: { exitCode: 0, stdout: '', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } as never }
  })
  on('command.list', () => ({ value: [{ name: 'relai:relai-backup', description: 'backup', source: 'plugin' as const }] }))
  on('command.run', ($, e) => { n.commands.push(e.command); return { text: 'ok' } })
  on('prompt.submit', ($, e) => ({ text: e.text }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 1 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return { n, clock }
}

const PANE = {
  component: 'Pane' as const, requestId: 'relai-panel',
  props: { title: 'RelAI', isFocused: true, bodyColumns: 100, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 80 }, view: {} },
}

async function open($: Engine) {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
  return $.ui.mount({ plugin: 'relai-panel', surface: 'desktop', ...PANE })
}

type Ui = Awaited<ReturnType<typeof open>>

// Types `word` one character at a time, as a person does: a `change` per keystroke, each read
// back before the next so a drawing the keystroke asked for is counted against it
async function typeInto(ui: Ui, n: Counts, field: string, word: string) {
  const perKey: number[] = []
  for (let i = 1; i <= word.length; i++) {
    const before = n.draws
    await ui.input({ key: field, text: word.slice(0, i), kind: 'change' })
    await ui.drawn()
    perKey.push(n.draws - before)
  }
  return perKey
}

describe('a keystroke in a field costs no file, no process and at most one drawing (Z7)', () => {
  test('a form field: six characters into /relai-backup\'s folder, read from memory', { plugins: [PROBE] }, async ($, on) => {
    const { n } = world(on)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-backup' })
    expect(await ui.find({ key: 'f-path' })).toBeDefined()
    const before = { fs: n.fs, process: n.process, draws: n.draws }
    const perKey = await typeInto(ui, n, 'f-path', 'D:/bak')
    expect({ fs: n.fs - before.fs, process: n.process - before.process }).toEqual({ fs: 0, process: 0 })
    expect(perKey.filter((d) => d > 1)).toEqual([])
    // Positive control on both counters: the typed text is drawn (the drawing counter moved) and
    // the tab chosen again, the person's refresh, reads the project (the file counter moves)
    expect(n.draws - before.draws).toBeGreaterThan(0)
    expect((await ui.find({ key: 'f-path' }))?.props.value).toBe('D:/bak')
    const fsBefore = n.fs
    await ui.press({ key: 'tab-commands' })
    expect(n.fs - fsBefore).toBeGreaterThan(0)
    await ui.unmount()
  })

  test('the Pomoc search: six characters narrow the sheet from memory', { plugins: [PROBE] }, async ($, on) => {
    const { n } = world(on)
    const ui = await open($)
    await ui.press({ key: 'tab-help' })
    expect(await ui.find({ key: 'phrase-0' })).toBeDefined()
    const before = { fs: n.fs, process: n.process, draws: n.draws }
    const perKey = await typeInto(ui, n, 'search', 'status')
    expect({ fs: n.fs - before.fs, process: n.process - before.process }).toEqual({ fs: 0, process: 0 })
    expect(perKey.filter((d) => d > 1)).toEqual([])
    // Positive control: the search did narrow what is drawn, through drawings counted here
    expect(n.draws - before.draws).toBeGreaterThan(0)
    expect(await ui.find({ key: 'phrase-0' })).toBeUndefined()
    expect((await ui.find({ key: 'phrase-1' }))?.text).toContain('sprawdź status')
    await ui.unmount()
  })
})

describe('a send and the end of its flash read no file (Z7)', () => {
  test('"Wyślij do czatu" on /relai-backup: the command goes out, the 900 ms flash ends, no file read', { plugins: [PROBE] }, async ($, on) => {
    const { n, clock } = world(on)
    const ui = await open($)
    await ui.press({ key: 'cmd-relai-backup' })
    const before = { reads: n.read.length, draws: n.draws }
    await ui.press({ key: 'send' })
    expect(n.commands).toContain('relai:relai-backup')
    expect((await ui.find({ key: 'send' }))?.props.label).toBe('✓ Wysłano')
    await clock.advance(1_000) // past FLASH_MS: the label is back
    expect((await ui.find({ key: 'send' }))?.props.label).not.toBe('✓ Wysłano')
    expect(n.read.slice(before.reads)).toEqual([])
    // Positive control: the flash was drawn and undrawn (the drawing counter moved twice at least),
    // and the same read counter moves on the tab chosen again
    expect(n.draws - before.draws).toBeGreaterThanOrEqual(2)
    await ui.press({ key: 'tab-commands' })
    expect(n.read.length - before.reads).toBeGreaterThan(0)
    await ui.unmount()
  })
})

describe('the map tab loads once and folds from memory (Z7)', () => {
  test('opened once: one pass of its loader; a fold of a stage and of a plan reads nothing; chosen again: one pass more', { plugins: [PROBE] }, async ($, on) => {
    const { n } = world(on)
    const ui = await open($)
    // A pass of the map's loader reads a crew run's task list once ("Teraz" on the commands tab
    // read it as well when the pane opened: counted from here)
    const opened = n.read.filter((p) => p === TASKS).length
    const passes = () => n.read.filter((p) => p === TASKS).length - opened
    await ui.press({ key: 'tab-map' })
    expect(passes()).toBe(1)
    await ui.press({ key: 'fold-map:active' }) // folded by default since Z14
    const before = { fs: n.fs, process: n.process, draws: n.draws }
    await ui.press({ key: 'fold-stage:PANEL_X/E2' })
    await ui.press({ key: 'fold-plan:PANEL_X' })
    await ui.drawn()
    expect({ fs: n.fs - before.fs, process: n.process - before.process }).toEqual({ fs: 0, process: 0 })
    expect(passes()).toBe(1)
    expect(n.draws - before.draws).toBeGreaterThan(0) // the folds were drawn
    // Positive control: the tab chosen again is the person's refresh, one pass more
    await ui.press({ key: 'tab-map' })
    expect(passes()).toBe(2)
    expect(n.fs - before.fs).toBeGreaterThan(0)
    await ui.unmount()
  })
})
