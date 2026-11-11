import { describe, expect, mock, test, type TestBody } from 'claude-code/testing'
import type { On } from 'claude-code'

// relai-input-router in the engine's test harness (plan MODY_OSZCZEDZANIA, E3). Negative proof
// (rule 3): RelAI process files, instruction files and a text with a key reach Claude whole with
// 0 helper calls; a large ordinary file means exactly 1 — the count is what a test with a stand-in
// engine proves; whether the engine takes the arguments is measured live (L-0321).

type Engine = Parameters<TestBody>[0]

const CWD = 'C:/proj'
const HOME = 'C:/Users/T'
const SETTINGS = '# USTAWIENIA\n\nWersja RelAI: 3.8.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-11-11 | Mody oszczędzania | zgoda — test |\n'
// A key assembled from pieces: the repository's own scanner refuses it written whole
const KEY = ['s', 'k-ant-api03-', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789'].join('')
const big = (tag: string, lines = 400) => Array.from({ length: lines }, (_, i) => `${tag} line ${i + 1}: lorem ipsum dolor sit amet, consectetur adipiscing elit.`).join('\n') + '\n'
const NOTES = 'L1-L400: a log of lorem lines; nothing failed.'

type World = { calls: { model: string, prompt: string }[], disk: Record<string, string>, logs: string[], runs: string[][], answer: () => unknown }

function world(on: On, files: Record<string, string>, opts: { consent?: boolean, twin?: boolean, pdf?: { info: string | null, text: string }, links?: Record<string, string> } = {}): World {
  const w: World = {
    calls: [], logs: [], runs: [],
    answer: () => ({ isAnswered: true, text: NOTES, usage: { input_tokens: 9000, output_tokens: 300, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } }),
    disk: {
      [`${CWD}/docs/USTAWIENIA.md`]: opts.consent === false ? SETTINGS.replace(/\| 2026-11-11 \| Mody.*\n/, '') : SETTINGS,
      ...(opts.twin ? { [`${HOME}/.claude/settings.json`]: JSON.stringify({ enabledPlugins: { 'input-router@token-saving-mods': true } }) } : {}),
      ...files,
    },
  }
  const key = (p: string) => p.replace(/\\/g, '/')
  mock.clock(on, { now: Date.UTC(2026, 10, 11, 12, 0) })
  mock.store(on, {})
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: 'sesja-ir' }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in w.disk }))
  on('fs.read', ($, e) => (key(e.path) in w.disk ? { value: w.disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }))
  on('fs.write', ($, e) => { w.disk[key(e.path)] = e.text; return { value: undefined } })
  on('fs.stat', ($, e) => {
    const p = key(e.path)
    if (!(p in w.disk)) return { deny: 'ENOENT ' + e.path }
    const real = opts.links?.[p]
    return { value: { kind: 'file' as const, size: (w.disk[p] ?? '').length, mtimeMs: 1000, isLink: Boolean(real), ...(real ? { realPath: real } : {}) } }
  })
  on('fs.list', ($, e) => {
    const dir = key(e.path ?? '') + '/'
    const names = Object.keys(w.disk).filter((p) => p.startsWith(dir) && !p.slice(dir.length).includes('/')).map((p) => p.slice(dir.length))
    return { value: names.map((name) => ({ name, kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('process.run', ($, e) => {
    const argv = (e as unknown as { argv: string[] }).argv
    w.runs.push(argv)
    if (argv[0] === 'cmd.exe') return { value: { exitCode: 0, stdout: HOME, stderr: '' } } as never
    if (argv[0] === 'powershell.exe') return { value: { exitCode: 0, stdout: big('head', 100) + '[... middle of a large file left out ...]\n' + big('tail', 100), stderr: '' } } as never
    if (argv[0] === 'pdfinfo') return (opts.pdf?.info ? { value: { exitCode: 0, stdout: opts.pdf.info, stderr: '' } } : { deny: 'ENOENT pdfinfo' }) as never
    if (argv[0] === 'pdftotext' && opts.pdf) return { value: { exitCode: 0, stdout: opts.pdf.text, stderr: '' } } as never
    return { deny: 'ENOENT ' + argv[0] } as never
  })
  on('command.register', () => ({ value: undefined }) as never)
  on('prompt.submit', ($, e) => ({ text: (e as unknown as { text: string }).text }) as never)
  on('model.complete', ($, e) => { w.calls.push({ model: e.model, prompt: e.prompt }); return { value: w.answer() } as never })
  on('ui.log', ($, e) => { w.logs.push(JSON.stringify(e)); return { value: undefined } as never })
  on('ui.toast', ($, e) => { w.logs.push('toast ' + JSON.stringify(e)); return { value: undefined } as never })
  on('tool.call', ($, e) => {
    const x = e as unknown as { tool: string, file_path?: string, command?: string }
    if (x.tool === 'Bash') {
      const m = /^cat (\S+)$/.exec(String(x.command))
      const out = m ? (w.disk[`${CWD}/${m[1]}`] ?? '') : big('git', 300)
      return { result: { stdout: out, stderr: '', interrupted: false }, text: out } as never
    }
    const whole = w.disk[key(String(x.file_path))] ?? ''
    const all = whole.split('\n')
    const r = e as unknown as { offset?: number, limit?: number }
    const from = (r.offset ?? 1) - 1
    const content = r.offset != null || r.limit != null ? all.slice(from, from + (r.limit ?? all.length)).join('\n') : whole
    const n = content.split('\n').length
    return { result: { type: 'text', file: { filePath: x.file_path, content, numLines: n, startLine: from + 1, totalLines: all.length } }, text: content } as never
  })
  return w
}

async function start($: Engine, human = true) {
  await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: false })
  if (human) await $.prompt.submit({ text: 'Find why the nightly job failed.', origin: { kind: 'composer' } } as never)
}
type Out = { result: { file?: { content: string }, stdout?: string } }
const readOf = async ($: Engine, file_path: string, more: Record<string, unknown> = {}): Promise<Out> =>
  await $.tool.call({ tool: 'Read', file_path, tool_use_id: 'toolu_' + file_path.length, ...more } as never) as unknown as Out
const contentOf = (out: Out) => String(out.result.file?.content ?? out.result.stdout ?? '')
const ledger = (w: World) => Object.entries(w.disk).filter(([p]) => p.includes('/oszczednosci/rejestr/')).map(([, t]) => t).join('')

describe('input-router: process and instruction files pass word for word (rule 3, hardest point)', () => {
  const guarded = [
    `${CWD}/docs/DZIENNIK.md`,
    `${CWD}/docs/plany/MODY_OSZCZEDZANIA/PROMPT_ETAP_3.md`,
    `${CWD}/docs/plany/X/STATUS.md`,
    `${CWD}/.claude/relai/tools/notes.md`,
    `${CWD}/CLAUDE.md`,
    `${CWD}/skills/relai-core/SKILL.md`,
    `${CWD}/.env.local`,
  ]
  for (const p of guarded) {
    test(`${p.slice(CWD.length + 1)}: 0 helper calls, the content unchanged`, async ($, on) => {
      const text = big('process')
      const w = world(on, { [p]: text })
      await start($)
      const out = await readOf($, p)
      expect(w.calls.length).toBe(0)
      expect(contentOf(out)).toBe(text)
      expect(ledger(w)).toBe('')
    })
  }

  test('a large ordinary file: exactly 1 helper call, notes with the RelAI header, a full copy and a measured record', async ($, on) => {
    const text = big('app')
    const w = world(on, { [`${CWD}/logs/app.log`]: text })
    await start($)
    const out = await readOf($, `${CWD}/logs/app.log`)
    expect(w.calls.length).toBe(1)
    expect(w.calls[0].model).toBe('claude-haiku-5-5')
    expect(w.calls[0].prompt).toContain('Find why the nightly job failed.')
    expect(w.calls[0].prompt).toContain('1\tapp line 1:')
    const c = contentOf(out)
    expect(c).toContain('[RelAI input-router] Notes on C:/proj/logs/app.log')
    expect(c).toContain(NOTES)
    const copy = /Full content: (\S+)/.exec(c)?.[1] ?? ''
    expect(copy).toContain(`${HOME}/.claude/relai/oszczednosci/input-router/pelne/2026-`)
    expect(w.disk[copy]).toBe(text)
    expect(ledger(w)).toContain('"mod":"relai-input-router"')
    expect(ledger(w)).toContain('"measured":true')
    expect(ledger(w)).toContain('"helper":{"model":"claude-haiku-5-5","in":9000,"out":300}')
  })

  test('the second read of the same file, unchanged, for the same ask: notes from memory, no helper call', async ($, on) => {
    const w = world(on, { [`${CWD}/logs/app.log`]: big('app') })
    await start($)
    const first = contentOf(await readOf($, `${CWD}/logs/app.log`))
    const second = contentOf(await readOf($, `${CWD}/logs/app.log`))
    expect(w.calls.length).toBe(1)
    expect(second).toBe(first)
    expect(ledger(w)).toContain('"action":"notes-memory"')
  })

  test('a small file passes: 0 calls', async ($, on) => {
    const w = world(on, { [`${CWD}/small.txt`]: 'one line\n' })
    await start($)
    expect(contentOf(await readOf($, `${CWD}/small.txt`))).toBe('one line\n')
    expect(w.calls.length).toBe(0)
  })
})

describe('input-router: the secret scanner before the helper', () => {
  test('a large file with a key: 0 helper calls, the content word for word', async ($, on) => {
    const text = big('cfg', 200) + `auth line: ${KEY}\n` + big('cfg', 200)
    const w = world(on, { [`${CWD}/config/dump.txt`]: text })
    await start($)
    const out = await readOf($, `${CWD}/config/dump.txt`)
    expect(w.calls.length).toBe(0)
    expect(contentOf(out)).toBe(text)
    expect(ledger(w)).toBe('')
  })

  test('the same file without the key: exactly 1 call', async ($, on) => {
    const w = world(on, { [`${CWD}/config/dump.txt`]: big('cfg', 200) + 'auth line: (none)\n' + big('cfg', 200) })
    await start($)
    await readOf($, `${CWD}/config/dump.txt`)
    expect(w.calls.length).toBe(1)
  })
})

describe('input-router: ranges, Bash, gates, failures', () => {
  test('a small range passes; once over half the file is read in pieces, a range of 100 lines gets notes', async ($, on) => {
    const w = world(on, { [`${CWD}/big.txt`]: big('r', 300) })
    await start($)
    await readOf($, `${CWD}/big.txt`, { offset: 1, limit: 90 })
    const second = await readOf($, `${CWD}/big.txt`, { offset: 91, limit: 90 })
    expect(w.calls.length).toBe(0)
    expect(JSON.stringify(second)).toContain('You have now read 60%')
    await readOf($, `${CWD}/big.txt`, { offset: 181, limit: 100 })
    expect(w.calls.length).toBe(1)
  })

  test('Bash: cat of a large log → 1 call; git output and cat of a process file → 0', async ($, on) => {
    const w = world(on, { [`${CWD}/build.log`]: big('b'), [`${CWD}/docs/DZIENNIK.md`]: big('d') })
    await start($)
    const catLog = await $.tool.call({ tool: 'Bash', command: 'cat build.log', tool_use_id: 'b1' } as never) as unknown as Out
    expect(w.calls.length).toBe(1)
    expect(contentOf(catLog)).toContain('[RelAI input-router] Notes on Bash: cat build.log')
    await $.tool.call({ tool: 'Bash', command: 'git log', tool_use_id: 'b2' } as never)
    const catDoc = await $.tool.call({ tool: 'Bash', command: 'cat docs/DZIENNIK.md', tool_use_id: 'b3' } as never) as unknown as Out
    expect(w.calls.length).toBe(1)
    expect(contentOf(catDoc)).toBe(big('d'))
  })

  test('the BenAI twin on: the mod sleeps, 0 calls, one message', async ($, on) => {
    const w = world(on, { [`${CWD}/a.log`]: big('a') }, { twin: true })
    await start($)
    await readOf($, `${CWD}/a.log`)
    await readOf($, `${CWD}/a.log`)
    expect(w.calls.length).toBe(0)
    expect(w.logs.filter((l) => l.startsWith('toast') && l.includes('BenAI input-router')).length).toBe(1)
  })

  test('no consent yet and no person in the session: passive, 0 calls', async ($, on) => {
    const w = world(on, { [`${CWD}/a.log`]: big('a') }, { consent: false })
    await start($, false)
    await readOf($, `${CWD}/a.log`)
    expect(w.calls.length).toBe(0)
  })

  test('the helper fails: Claude gets the plain content, the failure is written to a file', async ($, on) => {
    const text = big('f')
    const w = world(on, { [`${CWD}/f.log`]: text })
    w.answer = () => ({ isAnswered: false, reason: 'api-error', status: 529, error: 'overloaded', usage: { input_tokens: 0, output_tokens: 0 } })
    await start($)
    const out = await readOf($, `${CWD}/f.log`)
    expect(w.calls.length).toBe(2) // the retry with the alias
    expect(w.calls[1].model).toBe('haiku')
    expect(contentOf(out)).toBe(text)
    expect(w.disk[`${HOME}/.claude/relai/oszczednosci/input-router/ostatni-blad.txt`]).toContain('api-error')
  })

  test('/relai-input-router full lets the next large read through whole, once', async ($, on) => {
    const w = world(on, { [`${CWD}/a.log`]: big('a') })
    await start($)
    await $.command.run({ command: 'relai-input-router', args: 'full', origin: { kind: 'composer' } } as never)
    await readOf($, `${CWD}/a.log`)
    expect(w.calls.length).toBe(0)
    await readOf($, `${CWD}/a.log`)
    expect(w.calls.length).toBe(1)
  })

  test('a path with .. never names the copy: copies live under the mod folder only', async ($, on) => {
    const w = world(on, { [`${CWD}/logs/app.log`]: big('app') })
    await start($)
    await readOf($, `${CWD}/sub/../logs/app.log`)
    const written = Object.keys(w.disk).filter((p) => p.includes('/input-router/'))
    expect(written.length).toBeGreaterThan(0)
    expect(written.every((p) => p.startsWith(`${HOME}/.claude/relai/oszczednosci/input-router/`) && !p.includes('..'))).toBe(true)
  })
})

describe('input-router: fixes after the E3 review', () => {
  test('a link to a guarded file (real path CLAUDE.md): 0 calls, by Read and by cat', async ($, on) => {
    const text = big('link')
    const w = world(on, { [`${CWD}/notes.md`]: text, [`${CWD}/CLAUDE.md`]: text }, { links: { [`${CWD}/notes.md`]: `${CWD}/CLAUDE.md` } })
    await start($)
    expect(contentOf(await readOf($, `${CWD}/notes.md`))).toBe(text)
    const out = await $.tool.call({ tool: 'Bash', command: 'cat notes.md', tool_use_id: 'l1' } as never) as unknown as Out
    expect(contentOf(out)).toBe(text)
    expect(w.calls.length).toBe(0)
  })

  test('a file over 3.9 MB: the helper reads head and tail, the notes point at the file itself and say the middle was not read; no partial copy', async ($, on) => {
    const huge = 'z'.repeat(4_000_000)
    const w = world(on, { [`${CWD}/huge.log`]: huge })
    await start($)
    const c = contentOf(await readOf($, `${CWD}/huge.log`))
    expect(w.calls.length).toBe(1)
    expect(c).toContain(`Full content: ${CWD}/huge.log`)
    expect(c).toContain('the middle was not read')
    expect(Object.keys(w.disk).some((p) => p.includes('/input-router/pelne/'))).toBe(false)
  })
})

describe('input-router: PDF', () => {
  const pages = (n: number) => Array.from({ length: n }, (_, i) => big(`p${i + 1}`, 30)).join('\f') + '\f'

  test('no pdfinfo (FACT: native Windows PATH), pdftotext counts 8 pages → 1 call', async ($, on) => {
    const w = world(on, { [`${CWD}/doc.pdf`]: '%PDF-1.7 binary' }, { pdf: { info: null, text: pages(8) } })
    await start($)
    const out = await readOf($, `${CWD}/doc.pdf`)
    expect(w.calls.length).toBe(1)
    expect(contentOf(out)).toContain('a PDF, 8 of 8 pages')
  })

  test('3 pages pass to the Read tool: 0 calls', async ($, on) => {
    const w = world(on, { [`${CWD}/doc.pdf`]: '%PDF-1.7 binary' }, { pdf: { info: 'Pages:          3\n', text: pages(3) } })
    await start($)
    await readOf($, `${CWD}/doc.pdf`)
    expect(w.calls.length).toBe(0)
  })

  test('no Poppler at all: the plain Read', async ($, on) => {
    const w = world(on, { [`${CWD}/doc.pdf`]: '%PDF-1.7 binary' })
    await start($)
    expect(contentOf(await readOf($, `${CWD}/doc.pdf`))).toBe('%PDF-1.7 binary')
    expect(w.calls.length).toBe(0)
  })
})
