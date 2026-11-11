import { describe, expect, test } from 'claude-code/testing'
import { CHUNK_CHARS, LINE_CHARS, MIN_TOKENS, TOTAL_CHARS, bashRoute, chunksOf, fileGuard, lineCount, normPath, pagesSpan, pdfinfoPages, pdftextPages, pdftotextArgv, readRoute, segmentsOf, tokensOf } from './route'
import { cacheKey, copyName, cutMiddle, expiredCopies, findCopy, isBareYes, notesRecord, parseCommand, readSettings } from './notes'

// The pure parts of relai-input-router (plan MODY_OSZCZEDZANIA, E3; spec, section 1).

const ROOT = 'C:/proj'

describe('route: guarded files', () => {
  test('RelAI process files and instruction files are guarded; an ordinary file is not', () => {
    for (const p of ['C:/proj/docs/DZIENNIK.md', 'C:/x/docs/plany/T/PROMPT_ETAP_2.md', 'C:/x/STATUS.md', 'C:/x/PLAN.html', 'C:/x/.claude/relai/a.txt', 'C:/x/SPEC_DZIENNIK.md', 'C:/x/CLAUDE.md', 'C:/x/AGENTS.md', 'C:/x/skills/a/b.md', 'C:/x/.claude/settings.local.json']) {
      expect(fileGuard(p, ROOT)).toBe('process or instruction file')
    }
    expect(fileGuard('C:/proj/docs/notes.txt', ROOT)).toBe(null) // only Markdown under docs/
    expect(fileGuard('C:/proj/src/app.log', ROOT)).toBe(null)
  })

  test('secret files by name', () => {
    for (const p of ['C:/x/.env', 'C:/x/.env.production', 'C:/x/cert.pem', 'C:/x/.ssh/id_ed25519']) expect(fileGuard(p, null)).toBe('secret file')
    expect(fileGuard('C:/x/environment.md', null)).toBe(null)
  })

  test('paths are made absolute and plain before any decision', () => {
    expect(normPath('logs\\..\\docs\\DZIENNIK.md', 'C:\\proj')).toBe('C:/proj/docs/DZIENNIK.md')
    expect(normPath('/home/u/./a/../b.txt', '/x')).toBe('/home/u/b.txt')
    expect(fileGuard(normPath('src/../docs/DZIENNIK.md', ROOT), ROOT)).toBe('process or instruction file')
  })
})

describe('route: Read', () => {
  const big = { lines: 400, tokens: MIN_TOKENS * 5 }
  test('whole file: notes from MIN_TOKENS on, not below', () => {
    expect(readRoute({}, big, big, 0).kind).toBe('notes')
    expect(readRoute({}, big, { lines: 50, tokens: MIN_TOKENS - 1 }, 0).kind).toBe('pass')
  })
  test('a range under 100 lines and under 2000 tokens passes, also past half the file', () => {
    expect(readRoute({ offset: 1, limit: 99 }, { lines: 99, tokens: 1999 }, big, 0).kind).toBe('pass')
    expect(readRoute({ offset: 300, limit: 99 }, { lines: 99, tokens: 1999 }, big, 390).kind).toBe('pass')
  })
  test('a range of 100 lines passes before half the file and gets notes after it', () => {
    expect(readRoute({ offset: 1, limit: 100 }, { lines: 100, tokens: 1500 }, big, 100).kind).toBe('pass')
    expect(readRoute({ offset: 1, limit: 100 }, { lines: 100, tokens: 1500 }, big, 201).kind).toBe('notes')
  })
  test('tokens count as characters / 4, rounded up', () => {
    expect(tokensOf(8000)).toBe(2000)
    expect(tokensOf(8001)).toBe(2001)
  })
})

describe('route: Bash', () => {
  const large = { tokens: MIN_TOKENS, isError: false }
  test('segments: quotes kept, separators split, env assignments and .exe dropped', () => {
    expect(segmentsOf('FOO=1 cat "a b.txt" | sort && head.exe -n 5 x; tail y').map((s) => s.program)).toEqual(['cat', 'sort', 'head', 'tail'])
    expect(segmentsOf('cat "x | y"')[0].args).toEqual(['x | y'])
  })
  test('readers and helpers with a reader → notes; anything else passes', () => {
    expect(bashRoute('cat build.log | sort', large, ROOT, ROOT).kind).toBe('notes')
    for (const c of ['git log', 'npm test', 'grep x a.log', 'ls -la', 'find . -name x', 'cat a | grep x', 'sort a.txt', 'node build.js']) expect(bashRoute(c, large, ROOT, ROOT).kind).toBe('pass')
  })
  test('errors, small outputs and guarded files pass whole', () => {
    expect(bashRoute('cat a.log', { tokens: MIN_TOKENS, isError: true }, ROOT, ROOT).why).toBe('error output')
    expect(bashRoute('cat a.log', { tokens: MIN_TOKENS - 1, isError: false }, ROOT, ROOT).kind).toBe('pass')
    expect(bashRoute('cat docs/DZIENNIK.md', large, ROOT, ROOT).why).toBe('process or instruction file')
    expect(bashRoute('head -n 400 C:/proj/docs/plany/X/PROMPT_ETAP_1.md', large, ROOT, ROOT).kind).toBe('pass')
    expect(bashRoute('cat .env', large, ROOT, ROOT).why).toBe('secret file')
  })
  test('an output the engine saved to a file passes (live E3: Claude sees a 2 KB preview anyway)', () => {
    expect(bashRoute('cat build.log', { ...large, isPersisted: true }, ROOT, ROOT).why).toBe('output saved to a file by the engine')
    expect(bashRoute('cat build.log', { ...large, isPersisted: false }, ROOT, ROOT).kind).toBe('notes')
  })
  test('fail closed: an argument the shell may change passes the call whole (review E3)', () => {
    for (const c of ['cat <CLAUDE.md', 'cat CLAUDE.md)', 'cat $(echo CLAUDE.md)', 'cat CLAUDE\\.md', 'cat docs/S*', 'cat .e*', 'cat .claude/relai/*', 'gc -Path:CLAUDE.md', 'cat --file=CLAUDE.md', 'cat a.log > out.txt', 'cat a.log 2>/dev/null', 'cat "a b.log"']) {
      expect(bashRoute(c, large, ROOT, ROOT).kind).toBe('pass')
    }
    // control on the same shape: a plain large read with flags still gets notes
    expect(bashRoute('head -n 400 build.log', large, ROOT, ROOT).kind).toBe('notes')
    expect(bashRoute('Get-Content -Path build.log', large, ROOT, ROOT).kind).toBe('notes')
  })
  test('Windows aliases of a guarded file are guarded (review E3)', () => {
    for (const p of ['CLAUDE.md.', 'CLAUDE.md ', 'CLAUDE.md::$DATA']) expect(fileGuard(normPath(p, ROOT), ROOT)).toBe('process or instruction file')
    expect(fileGuard('C:/proj/docs/PLANY~1/PROMPT~1.MD', null)).toBe('short file name')
    expect(normPath('..', ROOT)).toBe('C:/')
  })
})

describe('route: chunks', () => {
  test('numbered lines from the first line given; long lines cut', () => {
    const c = chunksOf('a\nb\n', 10)
    expect(c).toEqual([{ text: '10\ta\n11\tb', firstLine: 10, lastLine: 11 }])
    expect(chunksOf('x'.repeat(LINE_CHARS + 5))[0].text).toContain('[line cut]')
  })
  test('chunks of at most CHUNK_CHARS; over TOTAL_CHARS head and tail with a gap line', () => {
    const line = 'y'.repeat(999)
    const text = Array.from({ length: 1500 }, () => line).join('\n')
    const c = chunksOf(text)
    expect(c.every((x) => x.text.length <= CHUNK_CHARS)).toBe(true)
    const all = c.map((x) => x.text).join('\n')
    expect(all.length).toBeLessThanOrEqual(TOTAL_CHARS + 200)
    expect(all).toContain('left out: the text is over')
    expect(c[0].firstLine).toBe(1)
    expect(c[c.length - 1].lastLine).toBe(1500)
  })
  test('line count as a file counts it', () => {
    expect(lineCount('')).toBe(0)
    expect(lineCount('a\nb\n')).toBe(2)
    expect(lineCount('a\nb')).toBe(2)
  })
})

describe('route: PDF', () => {
  test('pages from pdfinfo, from form feeds, and the pages argument', () => {
    expect(pdfinfoPages('Title: x\nPages:          12\n')).toBe(12)
    expect(pdfinfoPages('nothing')).toBe(null)
    expect(pdftextPages('a\fb\fc\f')).toBe(3)
    expect(pdftextPages('a\fb')).toBe(2)
    expect(pagesSpan('3-7')).toEqual({ first: 3, last: 7 })
    expect(pagesSpan('4')).toEqual({ first: 4, last: 4 })
    expect(pagesSpan('7-3')).toBe(null)
    expect(pdftotextArgv('C:/a.pdf', 2, 4)).toEqual(['pdftotext', '-f', '2', '-l', '4', '-enc', 'UTF-8', 'C:/a.pdf', '-'])
  })
})

describe('notes: pure parts', () => {
  test('a bare yes keeps the earlier ask (closed list)', () => {
    for (const t of ['tak', 'Yes!', ' ok ', 'Kontynuuj.']) expect(isBareYes(t)).toBe(true)
    for (const t of ['tak, ale bez testów', 'yes please read the log']) expect(isBareYes(t)).toBe(false)
  })
  test('cut from the middle', () => {
    const t = cutMiddle('a'.repeat(50) + 'b'.repeat(50), 40)
    expect(t.length).toBeLessThanOrEqual(40)
    expect(t.startsWith('a')).toBe(true)
    expect(t.endsWith('b')).toBe(true)
  })
  test('the memory key changes with mtime, size or the ask; copies are named by day and hash only', () => {
    const k = cacheKey({ path: 'C:/a.log', mtimeMs: 1, size: 10, ask: 'x' })
    expect(cacheKey({ path: 'C:/a.log', mtimeMs: 2, size: 10, ask: 'x' })).not.toBe(k)
    expect(cacheKey({ path: 'C:/a.log', mtimeMs: 1, size: 11, ask: 'x' })).not.toBe(k)
    expect(cacheKey({ path: 'C:/a.log', mtimeMs: 1, size: 10, ask: 'y' })).not.toBe(k)
    expect(copyName('2026-11-11T10:00:00Z', '../../' + k + '/..', 'json')).toBe(`2026-11-11-${k}.json`)
    expect(findCopy([`2026-11-01-${k}.json`, `2026-11-11-${k}.json`, '2026-11-11-other.json'], k)).toBe(`2026-11-11-${k}.json`)
  })
  test('retention: copies older than 14 days are listed', () => {
    expect(expiredCopies(['2026-10-01-ab12.txt', '2026-11-10-ab12.json', 'notes.txt'], '2026-11-11T00:00:00Z')).toEqual(['2026-10-01-ab12.txt'])
  })
  test('ledger record: measured with the helper usage; from memory or without usage no saving is claimed', () => {
    const r = notesRecord({ toolUseId: 't', tool: 'Read', path: 'p', beforeText: 'x'.repeat(8000), afterText: 'y'.repeat(400), usage: { model: 'claude-haiku-5-5', in: 2100, out: 90 }, ms: 5, fromMemory: false, why: 'large file' })
    expect(r).toMatchObject({ before: 2000, after: 100, measured: true, helper: { model: 'claude-haiku-5-5', in: 2100, out: 90 }, action: 'notes' })
    const m = notesRecord({ toolUseId: 't', tool: 'Read', path: 'p', beforeText: 'x'.repeat(8000), afterText: 'y'.repeat(400), usage: null, ms: 0, fromMemory: true, why: 'w' })
    expect(m).toMatchObject({ action: 'notes-memory', measured: false })
    const u = notesRecord({ toolUseId: 't', tool: 'Read', path: 'p', beforeText: 'x'.repeat(8000), afterText: 'y'.repeat(400), usage: null, ms: 0, fromMemory: false, why: 'w' })
    expect(u.before).toBe(u.after)
  })
  test('command and settings', () => {
    expect(parseCommand('')).toEqual({ kind: 'stats' })
    expect(parseCommand('full')).toEqual({ kind: 'full' })
    expect(parseCommand('off file')).toEqual({ kind: 'file', on: false })
    expect(parseCommand('model claude-sonnet-5-5')).toEqual({ kind: 'model', model: 'claude-sonnet-5-5' })
    expect(parseCommand('off connector').kind).toBe('bad')
    expect(parseCommand('model x;rm').kind).toBe('bad')
    expect(readSettings(undefined)).toEqual({ file: true, model: 'claude-haiku-5-5' })
    expect(readSettings({ file: false, model: 'bad id!' })).toEqual({ file: false, model: 'claude-haiku-5-5' })
  })
})
