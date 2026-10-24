import { describe, expect, test } from 'claude-code/testing'
import { DEFAULT_THRESHOLD, rememberThreshold, rowValue, sessionPath, sessionValue, thresholdOf, thresholdTail, thresholdsOf, withRow, type LimitIO } from './limit'

// The plan-limit thresholds, LIMIT_CHECKPOINT E1 and Aneks C: per window, this session's file →
// the project's row → the global row → the window's default (90 for 5 h, 98 for the week); the
// plugin's old setting is no level (Aneks B). A fake disk stands for $.fs; paths use `/`.

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
    expect(await thresholdOf(disk(all), WHERE)).toEqual({ value: 85, source: 'sesja' })
  })

  test('without the session file the project decides, without its row the global one', async () => {
    const { [SESSION]: _s, ...noSession } = all
    expect(await thresholdOf(disk(noSession), WHERE)).toEqual({ value: 95, source: 'projekt' })
    const { [PROJECT]: _p, ...globalOnly } = noSession
    expect(await thresholdOf(disk(globalOnly), WHERE)).toEqual({ value: 80, source: 'globalnie' })
  })

  test('with no file each window has its default: 90 for 5 h, 98 for the week (Aneks C)', async () => {
    expect(await thresholdOf(disk({}), WHERE)).toEqual({ value: DEFAULT_THRESHOLD, source: 'domyślny' })
    expect(await thresholdsOf(disk({}), WHERE)).toEqual({ five: { value: 90, source: 'domyślny' }, week: { value: 98, source: 'domyślny' } })
  })
})

describe('the week threshold (Aneks C)', () => {
  test('from every level: the session key progTydzien, the project row, the global row', async () => {
    const week = (files: Record<string, string>) => thresholdOf(disk(files), WHERE, 'week')
    expect(await week({ [SESSION]: JSON.stringify({ prog: 85, progTydzien: 97 }), [PROJECT]: table('| 2026-10-11 | Próg limitu tygodnia | 95 |') })).toEqual({ value: 97, source: 'sesja' })
    expect(await week({ [PROJECT]: table('| 2026-10-11 | Próg limitu tygodnia | 95 |') })).toEqual({ value: 95, source: 'projekt' })
    expect(await week({ [GLOBAL]: table('| 2026-10-11 | Weekly limit threshold | 96 |') })).toEqual({ value: 96, source: 'globalnie' })
  })

  test('the two rows never stand for each other (negative proof both ways)', async () => {
    const both = await thresholdsOf(disk({ [PROJECT]: table('| 2026-10-11 | Próg limitu tygodnia | 95 |') }), WHERE)
    expect(both.five).toEqual({ value: 90, source: 'domyślny' })
    const fiveOnly = await thresholdsOf(disk({ [PROJECT]: table('| 2026-10-11 | Próg limitu | 85 |'), [SESSION]: sessionFile(80) }), WHERE)
    expect(fiveOnly.week).toEqual({ value: 98, source: 'domyślny' })
    expect(fiveOnly.five).toEqual({ value: 80, source: 'sesja' })
  })

  test('remembering the week keeps the session file\'s 5-hour value and the project\'s 5-hour row', async () => {
    const io = disk({ [SESSION]: sessionFile(95), [PROJECT]: table('| 2026-10-11 | Próg limitu | 85 |') })
    await rememberThreshold(io, WHERE, 99, 'sesja', '2026-10-12', 'week')
    expect(JSON.parse(io.files[SESSION] ?? '')).toEqual({ prog: 95, progTydzien: 99, data: '2026-10-12', zrodlo: 'sesja' })
    await rememberThreshold(io, WHERE, 96, 'projekt', '2026-10-12', 'week')
    expect(io.files[PROJECT]).toContain('| 2026-10-11 | Próg limitu | 85 |\n| 2026-10-12 | Próg limitu tygodnia | 96 |')
    expect(await thresholdsOf(io, WHERE)).toEqual({ five: { value: 95, source: 'sesja' }, week: { value: 99, source: 'sesja' } })
  })

  test('each file is read once for both windows', async () => {
    const io = disk({})
    await thresholdsOf(io, WHERE)
    expect(io.reads).toEqual([SESSION, PROJECT, GLOBAL])
  })
})

describe('the /cache words after the thresholds', () => {
  test('a card after a turn below 99; at 99 the line says that window\'s card is off', () => {
    expect(thresholdTail({ five: 90, week: 98 })).toBe('od niego bateria limitu ostrzega kolorem, a po turze przychodzi karta.')
    expect(thresholdTail({ five: 90, week: 99 })).toBe('od niego bateria limitu ostrzega kolorem, a po turze przychodzi karta (tydzień: karta wyłączona przy 99 %).')
    expect(thresholdTail({ five: 99, week: 98 })).toBe('od niego bateria limitu ostrzega kolorem, a po turze przychodzi karta (5 h: karta wyłączona przy 99 %).')
    expect(thresholdTail({ five: 99, week: 99 })).toBe('od niego bateria limitu ostrzega kolorem; karta po turze wyłączona (próg 99 %).')
  })
})

describe('threshold values', () => {
  test('a value outside 1–99 or no number is skipped and the next level decides', async () => {
    const files = { [SESSION]: sessionFile(150), [PROJECT]: table('| 2026-10-11 | Próg limitu | abc |'), [GLOBAL]: table('| 2026-10-11 | Próg limitu | 0 |') }
    expect(await thresholdOf(disk(files), WHERE)).toEqual({ value: 90, source: 'domyślny' })
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
    expect(await thresholdOf(io, WHERE)).toEqual({ value: 90, source: 'domyślny' })
  })

  test('a session id that could leave the folder builds no path and reads no session file', async () => {
    expect(sessionPath(ROOT, '../etc')).toBe(null)
    expect(sessionPath(ROOT, 'a/b')).toBe(null)
    expect(sessionPath(ROOT, '')).toBe(null)
    const io = disk({})
    await thresholdOf(io, { ...WHERE, sessionId: '../../x' })
    expect(io.reads.some((p) => p.includes('..'))).toBe(false)
    expect(io.reads).toEqual([PROJECT, GLOBAL])
  })
})

describe('remembering the threshold', () => {
  test('the session scope writes this session\'s file, which then wins', async () => {
    const io = disk({ [PROJECT]: table('| 2026-10-11 | Próg limitu | 95 |') })
    expect(await rememberThreshold(io, WHERE, 85, 'sesja', '2026-10-11')).toEqual({ path: SESSION })
    expect(JSON.parse(io.files[SESSION] ?? '')).toEqual({ prog: 85, data: '2026-10-11', zrodlo: 'sesja' })
    expect(await thresholdOf(io, WHERE)).toEqual({ value: 85, source: 'sesja' })
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
    expect(await thresholdOf(io, WHERE)).toEqual({ value: 85, source: 'projekt' })
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
