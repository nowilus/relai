import { describe, expect, test } from 'claude-code/testing'
import { DEFAULT_THRESHOLD, rememberThreshold, rowValue, sessionPath, sessionValue, thresholdOf, withRow, type LimitIO } from './limit'

// The plan-limit threshold, LIMIT_CHECKPOINT E1: this session's file → the project's row → the
// global row → the plugin's setting → 90. A fake disk stands for $.fs; paths use `/`.

const ROOT = 'C:/proj'
const HOME = 'C:/home'
const WHERE = { root: ROOT, home: HOME, sessionId: 's1' }
const SESSION = `${ROOT}/.claude/relai/limit/s1.json`
const PROJECT = `${ROOT}/docs/USTAWIENIA.md`
const GLOBAL = `${HOME}/.claude/relai/USTAWIENIA.md`

const table = (...rows: string[]) => ['# USTAWIENIA', '', '| Data | Czego dotyczy | Decyzja |', '|---|---|---|', '| 2026-08-07 | Język projektu | polski |', ...rows, '', '## Ustawienia wycofane', ''].join('\n')
const sessionFile = (prog: unknown) => JSON.stringify({ prog, data: '2026-10-11', zrodlo: 'sesja' })

function disk(files: Record<string, string>): LimitIO & { files: Record<string, string>, reads: string[] } {
  const kept: Record<string, string> = { ...files }
  const reads: string[] = []
  return {
    files: kept,
    reads,
    read: async (path) => { reads.push(path); return kept[path] ?? null },
    write: async (path, text) => { kept[path] = text },
  }
}

describe('threshold order', () => {
  const all = { [SESSION]: sessionFile(85), [PROJECT]: table('| 2026-10-11 | Próg limitu | 95 |'), [GLOBAL]: table('| 2026-10-11 | Próg limitu | 80 |') }

  test('the session file wins over the project and the global row', async () => {
    expect(await thresholdOf(disk(all), WHERE, 70)).toEqual({ value: 85, source: 'sesja' })
  })

  test('without the session file the project decides, without its row the global one', async () => {
    const { [SESSION]: _s, ...noSession } = all
    expect(await thresholdOf(disk(noSession), WHERE, 70)).toEqual({ value: 95, source: 'projekt' })
    const { [PROJECT]: _p, ...globalOnly } = noSession
    expect(await thresholdOf(disk(globalOnly), WHERE, 70)).toEqual({ value: 80, source: 'globalnie' })
  })

  test('with no file the setting decides; the setting unchanged is the default 90', async () => {
    expect(await thresholdOf(disk({}), WHERE, 70)).toEqual({ value: 70, source: 'ustawienie' })
    expect(await thresholdOf(disk({}), WHERE, 90)).toEqual({ value: DEFAULT_THRESHOLD, source: 'domyślny' })
    expect(await thresholdOf(disk({}), WHERE)).toEqual({ value: 90, source: 'domyślny' })
  })
})

describe('threshold values', () => {
  test('a value outside 1–99 or no number is skipped and the next level decides', async () => {
    const files = { [SESSION]: sessionFile(150), [PROJECT]: table('| 2026-10-11 | Próg limitu | abc |'), [GLOBAL]: table('| 2026-10-11 | Próg limitu | 0 |') }
    expect(await thresholdOf(disk(files), WHERE, 90)).toEqual({ value: 90, source: 'domyślny' })
    expect(sessionValue('{nie json')).toBe(null)
    expect(sessionValue(sessionFile('85'))).toBe(null)
    expect(sessionValue(sessionFile(85.5))).toBe(null)
    expect(rowValue(table('| 2026-10-11 | Próg limitu | 100 |'))).toBe(null)
  })

  test('a percent sign and words after · are read past; a withdrawn row never decides', async () => {
    expect(rowValue(table('| 2026-10-11 | Próg limitu | 85 % · ostrzeżenie o pracy |'))).toBe(85)
    expect(rowValue(table('| 2026-10-11 | **Próg limitu** | **95** |'))).toBe(95)
    expect(rowValue(table() + '| 2026-09-01 | Próg limitu | 70 |\n')).toBe(null)
    expect(rowValue('| Data | Czego dotyczy | Decyzja |\n| 2026-10-11 | Próg limitu dla API | 85 |')).toBe(null)
  })

  test('another session\'s file is ignored', async () => {
    const io = disk({ [`${ROOT}/.claude/relai/limit/s2.json`]: sessionFile(60) })
    expect(await thresholdOf(io, WHERE, 90)).toEqual({ value: 90, source: 'domyślny' })
  })

  test('a session id that could leave the folder builds no path and reads no session file', async () => {
    expect(sessionPath(ROOT, '../etc')).toBe(null)
    expect(sessionPath(ROOT, 'a/b')).toBe(null)
    expect(sessionPath(ROOT, '')).toBe(null)
    const io = disk({})
    await thresholdOf(io, { ...WHERE, sessionId: '../../x' }, 90)
    expect(io.reads.some((p) => p.includes('..'))).toBe(false)
    expect(io.reads).toEqual([PROJECT, GLOBAL])
  })
})

describe('remembering the threshold', () => {
  test('the session scope writes this session\'s file, which then wins', async () => {
    const io = disk({ [PROJECT]: table('| 2026-10-11 | Próg limitu | 95 |') })
    expect(await rememberThreshold(io, WHERE, 85, 'sesja', '2026-10-11')).toEqual({ path: SESSION })
    expect(JSON.parse(io.files[SESSION] ?? '')).toEqual({ prog: 85, data: '2026-10-11', zrodlo: 'sesja' })
    expect(await thresholdOf(io, WHERE, 90)).toEqual({ value: 85, source: 'sesja' })
  })

  test('the project scope rewrites its row in place or adds one to the table, dated today', async () => {
    const io = disk({ [PROJECT]: table() })
    await rememberThreshold(io, WHERE, 95, 'projekt', '2026-10-11')
    const added = io.files[PROJECT] ?? ''
    expect(added).toContain('| 2026-08-07 | Język projektu | polski |\n| 2026-10-11 | Próg limitu | 95 |\n\n## Ustawienia wycofane')
    await rememberThreshold(io, WHERE, 85, 'projekt', '2026-10-12')
    const rewritten = io.files[PROJECT] ?? ''
    expect(rewritten.match(/Próg limitu/g)?.length).toBe(1)
    expect(rewritten).toContain('| 2026-10-12 | Próg limitu | 85 |')
    expect(await thresholdOf(io, WHERE, 90)).toEqual({ value: 85, source: 'projekt' })
  })

  test('the global scope creates the user\'s settings file when it is missing; no table, no write', async () => {
    const io = disk({})
    expect(await rememberThreshold(io, WHERE, 80, 'globalnie', '2026-10-11')).toEqual({ path: GLOBAL })
    expect(rowValue(io.files[GLOBAL] ?? '')).toBe(80)
    expect((await rememberThreshold(io, WHERE, 80, 'projekt', '2026-10-11')).error).toContain('brak tabeli')
    expect(withRow('# bez tabeli\n', 80, '2026-10-11')).toBe(null)
  })

  test('a value outside 1–99 is refused before anything is written', async () => {
    const io = disk({})
    for (const bad of [0, 100, 85.5, Number.NaN]) {
      expect((await rememberThreshold(io, WHERE, bad, 'sesja', '2026-10-11')).error).toContain('od 1 do 99')
    }
    expect(Object.keys(io.files)).toEqual([])
  })
})
