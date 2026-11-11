import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On, RenderNode } from 'claude-code'
import { PRICE_FILE, PRICING, serializePriceFile } from './core/pricing.mjs'

// The "Oszczędności" tab (plan MODY_OSZCZEDZANIA, E2; R6): the ledger files under ~/.claude read
// together, the sum to the token in each filter, a duplicate across files counted once, a bad line
// and a LEFT OUT record said apart, every estimate labelled, and an empty ledger said in words.

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const HOME = 'C:/Users/T'
const DIR = `${HOME}/.claude/relai/oszczednosci/rejestr`
const NOW = new Date(2026, 10, 11, 12, 0).getTime()
const rec = (session: string, id: string, ts: string, before: number, after: number, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ ts, session, tool_use_id: id, mod: 'relai-browser', part: '0', tool: 'Read', action: 'shrink', before, after, measured: false, ...extra })
const FILE_A = [
  rec('sesja-a', 'a1', '2026-11-11T09:00:00.000Z', 649, 267),
  rec('sesja-a', 'a2', '2026-11-11T09:01:00.000Z', 1844, 692),
  '{"zla linia',
  rec('sesja-a', 'a3', '2026-11-11T09:02:00.000Z', 1844, 300, { action: 'describe', measured: true, helper: { model: 'claude-haiku-5-5', in: 2000, out: 350 } }),
  rec('sesja-a', 'a4', '2026-11-11T09:03:00.000Z', 600000, 300),
].join('\n') + '\n'
const FILE_B = [
  rec('sesja-b', 'b1', '2026-11-11T10:00:00.000Z', 640, 263),
  rec('sesja-a', 'a2', '2026-11-11T09:01:00.000Z', 1844, 692), // the same record in another file: once
].join('\n') + '\n'
const FILE_OLD = rec('sesja-b', 'b2', '2026-11-10T10:00:00.000Z', 800, 200) + '\n'
const HAIKU = { input: 0.1, output: 0.5 }

function world(on: On, ledger: Record<string, string>) {
  const disk: Record<string, string> = {
    [`${CWD}/docs/USTAWIENIA.md`]: '# USTAWIENIA\n\nWersja RelAI: 3.8.0\n',
    [`${CWD}/CLAUDE.md`]: '# CLAUDE\n\nAktywny plan: brak\n',
    [`${CWD}/${PRICE_FILE}`]: serializePriceFile([], { date: '2026-10-09', source: 'test', from: 0, models: { ...PRICING.models, 'claude-haiku-5-5': HAIKU } }),
    ...Object.fromEntries(Object.entries(ledger).map(([n, t]) => [`${DIR}/${n}`, t])),
  }
  const key = (path: string) => path.replace(/\\/g, '/')
  mock.clock(on, { now: NOW })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.cwd', () => ({ value: CWD }))
  on('session.id', () => ({ value: 'sesja-a' }))
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : undefined }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(key(e.path) + '/')) }))
  on('fs.read', ($, e) => (key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = Object.keys(disk).filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/'))
    return { value: names.map((p) => ({ name: p.slice(dir.length), kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('command.list', () => ({ value: [] }))
  on('session.usage', () => ({ value: { startedAt: NOW, context: { tokens: 1000 } as never, rateLimits: [], cost: { usd: 0 } } }))
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  return disk
}

function pane(columns: number) {
  return {
    component: 'Pane' as const, requestId: 'relai-panel',
    props: { title: 'RelAI', isFocused: true, bodyColumns: columns, placement: 'dock' as const, scroll: { offset: 0, bodyRows: 40 }, view: {} },
  }
}

const textOf = (node: RenderNode | undefined): string => node === undefined ? '' : typeof node === 'string' ? node
  : ((node as { children?: RenderNode[] }).children ?? []).map(textOf).join('')

async function savings($: Engine, surface: 'terminal' | 'desktop') {
  await $.session.start({ cwd: CWD, surface, isInteractive: true })
  await $.command.run({ command: 'relai-panel' } as never)
  const ui = await $.ui.mount({ plugin: 'relai-panel', surface, ...pane(100) })
  await ui.press({ key: 'tab-savings' })
  return ui
}

describe('the savings tab', () => {
  test('sums the ledger to the token in each filter, on a desktop and on the terminal', async ($, on) => {
    world(on, { '2026-11-11-sesja-a.jsonl': FILE_A, '2026-11-11-sesja-b.jsonl': FILE_B, '2026-11-10-sesja-b.jsonl': FILE_OLD })
    for (const surface of ['desktop', 'terminal'] as const) {
      const ui = await savings($, surface)
      // this chat: 382 + 1152 + 1544 = 3078; the a2 duplicate in the second file counted once
      let all = textOf(await ui.drawn())
      expect(all).toContain('3 rekordy w sumie, 3 078 tokenów mniej (szacunek) w tym czacie.')
      expect(all).toContain('LEFT OUT): 1 rekord, 599 700 tokenów — poza sumą.')
      expect(all).toContain('1 zła linia w rejestrze pominięte.')
      expect(all).toContain('szacowane')
      expect(all).toContain('SZACUNEK: 3 078 tokenów')
      expect(all).toContain('zmierzone')
      expect(all).toContain('2 000 tokenów wejścia i 350 tokenów wyjścia')
      await ui.press({ key: 'sv-f-today' })
      all = textOf(await ui.drawn())
      expect(all).toContain('4 rekordy w sumie, 3 455 tokenów mniej (szacunek) dziś')
      await ui.press({ key: 'sv-f-all' })
      all = textOf(await ui.drawn())
      expect(all).toContain('5 rekordów w sumie, 4 055 tokenów mniej (szacunek) w całym rejestrze')
      await ui.press({ key: 'sv-f-chat' })
      await ui.unmount()
    }
  })

  test('says an empty ledger in words, never a zero sum', async ($, on) => {
    world(on, {})
    const ui = await savings($, 'desktop')
    const all = textOf(await ui.drawn())
    expect(all).toContain('Rejestr jest pusty')
    expect(all).not.toContain('LEFT OUT')
  })
})
