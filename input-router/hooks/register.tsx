// relai-input-router 0.1.0 — large files and reader outputs are read by a helper model first;
// Claude gets its notes and a path to the full text (plan MODY_OSZCZEDZANIA, E3; spec, section 1).
// This module holds only $ and on (rule 13); the logic lives in route.ts, notes.ts, gate.ts and
// the core copies in ./core (sync-panel-core.js). E4: MCP connector results (connectors.ts) and
// the hand-off pane.

import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'
import type { RouterHandoff } from '../types'
import { consentRow, guardHelper, hasMarker, isHumanOrigin, isTwinActive, readConsent, settingsCandidates, withConsentRow } from './core/savings-gates.mjs'
import { scanText } from './core/secret-scan.mjs'
import { createQueue, ledgerFile } from './core/savings-ledger.mjs'
import { BIG_FILE_BYTES, MIN_TOKENS, PDF_MIN_PAGES, PDF_MS, PIECES_SHARE, TOTAL_CHARS, addCovered, bashRoute, chunksOf, fileArgsOf, fileGuard, isPdf, isRanged, lineCount, normPath, pagesSpan, pdfinfoArgv, pdfinfoPages, pdftextPages, pdftotextArgv, readRoute, textTokens } from './route'
import type { Chunk, Route } from './route'
import { asBlocks, connectorChunks, connectorRoute, localResult, textOfBlocks } from './connectors'
import { SHOWN_LINES, WIDE_COLUMNS, cardsOf, headOf, listsOf, notesOfFile, summaryOf } from './pane'
import type { Lists } from './pane'
import { COPIES_DIR, addUsage, cacheKey, copyName, findCopy, hash, helperRequest, isBareYes, notesPrompt, notesRecord, notesResult, parseCommand, piecesContext, readSettings } from './notes'
import type { HelperUsage } from './notes'
import { CONSENT_NO_LABEL, CONSENT_QUESTION, CONSENT_YES_LABEL, decide } from './gate'
import type { Gate } from './gate'

const MOD = 'relai-input-router'
const STORE_KEY = 'settings'
const PANE = 'relai-input-router'
const handoffs = atom({ plugin: 'relai-input-router', key: 'handoffs' } as const, [] as RouterHandoff[], { shape: 'handoffs-2' })
const idle = atom({ plugin: 'relai-input-router', key: 'idle' } as const, '', { shape: 'idle-1' })
const shown = atom({ plugin: 'relai-input-router', key: 'shown' } as const, { at: '', what: '' }, { shape: 'shown-1' })

// Session facts, set at session.start; a reload runs it again
let cwd = ''
let claudeDir = ''
let session = 'unknown'
let isWindows = false
let gate: Gate = { isTwinActive: false, projectRoot: null, consent: null, hasHuman: false, isFileOn: true }
let isFullNext = false
let toldIdle = ''
let lastAsk = ''
let lastFailure = ''
let covered = new Map<string, number>()
let queue: ReturnType<typeof createQueue> | null = null
let prices: Lists = listsOf(null)
/** Names of the enabled plugins (`enabledPlugins` keys before '@'): their servers are untouched (spec "mods"). */
let pluginNames: string[] = []

const enabledNames = (texts: readonly (string | null)[]): string[] => texts.flatMap((t) => {
  try { return Object.keys(JSON.parse(String(t))?.enabledPlugins ?? {}).map((k) => k.split('@')[0]) } catch { return [] }
})

async function readOr($: any, path: string): Promise<string | null> {
  try { return await $.fs.read(path) } catch { return null }
}

/** ~/.claude: the user folder is not given to mods, so it comes from a process's environment. */
async function findClaudeDir($: any): Promise<string> {
  const argv = isWindows ? ['cmd.exe', '/d', '/c', 'echo %USERPROFILE%'] : ['/bin/sh', '-c', 'printf %s "$HOME"']
  try {
    const r = await $.process.run(argv, { timeoutMs: 5000 })
    const home = String(r.stdout || '').trim()
    return home ? `${home.replace(/[\\/]+$/, '').replace(/\\/g, '/')}/.claude` : ''
  } catch { return '' }
}

async function loadGate($: any): Promise<void> {
  let projectRoot: string | null = null
  let consent: Gate['consent'] = null
  for (const c of settingsCandidates(cwd)) {
    const text = await readOr($, c.file)
    if (text !== null && hasMarker(text)) { projectRoot = c.root; consent = readConsent(text); break }
  }
  const settings = [
    claudeDir ? await readOr($, `${claudeDir}/settings.json`) : null,
    projectRoot ? await readOr($, `${projectRoot}/.claude/settings.json`) : null,
    projectRoot ? await readOr($, `${projectRoot}/.claude/settings.local.json`) : null,
  ]
  const switches = claudeDir ? await readOr($, `${claudeDir}/mods/switches.json`) : null
  const s = readSettings(await $.store.get(STORE_KEY))
  gate = { ...gate, projectRoot, consent, isTwinActive: isTwinActive(MOD, settings, switches), isFileOn: s.file }
  prices = listsOf(projectRoot ? await readOr($, `${projectRoot}/.claude/relai/panel/cennik.json`) : null)
  pluginNames = enabledNames(settings)
}

async function tellIdleOnce($: any, why: string): Promise<void> {
  await update($, idle, () => why)
  if (toldIdle === why) return
  toldIdle = why
  $.ui.toast(`relai-input-router ${why}`)
}

async function askConsent($: any): Promise<void> {
  if (!gate.projectRoot) return
  let answer = ''
  try { answer = await $.ui.ask(CONSENT_QUESTION, { header: 'RelAI', options: [CONSENT_YES_LABEL, CONSENT_NO_LABEL] }) } catch { return }
  const isYes = answer === CONSENT_YES_LABEL
  if (!isYes && answer !== CONSENT_NO_LABEL) return
  const file = `${gate.projectRoot}/docs/USTAWIENIA.md`
  const text = await readOr($, file)
  if (text === null) return
  // another session may have answered meanwhile: its row stands
  if (readConsent(text) !== null) { gate = { ...gate, consent: readConsent(text) }; return }
  await $.fs.write(file, withConsentRow(text, consentRow(new Date().toISOString().slice(0, 10), isYes)))
  gate = { ...gate, consent: isYes ? 'yes' : 'no' }
}

/** Whether notes may be written now; asks for consent once, says why not once. Connectors have their own switch, checked before. */
async function mayHandOff($: any, isConnector = false): Promise<boolean> {
  const g = () => (isConnector ? { ...gate, isFileOn: true } : gate)
  let d = decide(g())
  if (d.kind === 'ask') { await askConsent($); d = decide(g()) }
  if (d.kind === 'idle') { await tellIdleOnce($, d.why); return false }
  await update($, idle, () => '')
  return true
}

type Row = Omit<RouterHandoff, 'at' | 'copy' | 'notes'> & Partial<Pick<RouterHandoff, 'at' | 'copy' | 'notes'>>
async function remember($: any, row: Row): Promise<void> {
  const full: RouterHandoff = { at: new Date().toISOString(), copy: '', notes: '', ...row }
  await update($, handoffs, (list) => [...list, full].slice(-50))
}

async function writeRecord($: any, rec: Record<string, unknown>): Promise<void> {
  if (!claudeDir) return
  const ts = new Date().toISOString()
  if (!queue) queue = createQueue({ read: (p: string) => $.fs.read(p), write: (p: string, t: string) => $.fs.write(p, t) }, ledgerFile(claudeDir, ts, session))
  try {
    await queue.push({ ts, session, mod: MOD, ...rec })
  } catch (err) {
    $.ui.log(`relai-input-router: ledger write failed: ${String(err)}`)
  }
}

/** A failure goes where a person or Claude sees it (L-0321): the stats and a file. */
async function fail($: any, why: string): Promise<void> {
  lastFailure = `${new Date().toISOString()} ${why}`
  $.ui.log(`relai-input-router: ${why}`)
  if (claudeDir) { try { await $.fs.write(`${claudeDir}/${COPIES_DIR}/ostatni-blad.txt`, `${lastFailure}\n`) } catch { /* the log line stays */ } }
}

/** A file's text: whole up to BIG_FILE_BYTES, else its head and tail by a process (spec). */
async function fileText($: any, path: string, size: number): Promise<string | null> {
  if (size <= BIG_FILE_BYTES) return readOr($, path)
  const n = String(TOTAL_CHARS / 2)
  const argv = isWindows
    ? ['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', "[Console]::OutputEncoding=[Text.Encoding]::UTF8; $f=[IO.File]::OpenRead($env:RELAI_P); $n=[int]$env:RELAI_N; $b=New-Object byte[] $n; $r=$f.Read($b,0,$n); [Console]::Out.Write([Text.Encoding]::UTF8.GetString($b,0,$r)); [Console]::Out.Write(\"`n[... middle of a large file left out ...]`n\"); $f.Seek(-$n,'End')|Out-Null; $r=$f.Read($b,0,$n); [Console]::Out.Write([Text.Encoding]::UTF8.GetString($b,0,$r)); $f.Close()"]
    : ['/bin/sh', '-c', 'head -c "$RELAI_N" "$RELAI_P"; printf "\\n[... middle of a large file left out ...]\\n"; tail -c "$RELAI_N" "$RELAI_P"']
  try {
    const r = await $.process.run(argv, { env: { RELAI_P: path, RELAI_N: n }, timeoutMs: 60000 })
    return r.exitCode === 0 ? String(r.stdout || '') : null
  } catch { return null }
}

type Notes = { notes: string, usage: HelperUsage | null, model: string }

/** Every chunk through the helper; any chunk failing fails the hand-off (Claude then gets the plain result). */
async function helperNotes($: any, what: string, args: string, text: string, firstLine: number, model: string, isConnector: boolean): Promise<Notes> {
  const chunks: Chunk[] = isConnector ? connectorChunks(text) : chunksOf(text, firstLine)
  let usage: HelperUsage | null = null
  const parts: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    const prompt = notesPrompt({ what, ask: lastAsk, args, chunk: chunks[i], index: i, count: chunks.length })
    let r: any = await $.model.complete(helperRequest(model, prompt))
    usage = addUsage(usage, model, r?.usage)
    if (!r?.isAnswered && r?.reason === 'api-error') {
      r = await $.model.complete(helperRequest(model, prompt, true))
      usage = addUsage(usage, model, r?.usage)
    }
    if (!r?.isAnswered) throw new Error(`helper gave no notes: ${String(r?.reason ?? 'no result')}${r?.error ? ` (${r.error})` : ''}`)
    parts.push(chunks.length > 1 ? `--- part ${i + 1} of ${chunks.length}, lines ${chunks[i].firstLine}-${chunks[i].lastLine} ---\n${String(r.text).trim()}` : String(r.text).trim())
  }
  return { notes: parts.join('\n\n'), usage, model }
}

/** `fullAt`: where the whole text already lies (a file too large to copy whole: the file itself, review E3, HIGH). */
/** `copyText`: the whole result when the helper reads less of it (a connector's trimmed JSON); the copy and "before" count it. */
type HandOff = { toolUseId: string, tool: string, path: string, keyPath: string, mtimeMs: number, size: number, text: string, firstLine: number, what: string, isRange: boolean, why: string, args: string, fullAt?: string, isConnector?: boolean, copyText?: string }

/** The full-content path a saved notes result names (its "Full content:" line), or ''. */
const copyOf = (result: string): string => /^Full content: (.+)$/m.exec(result)?.[1] ?? ''

/** Notes for Claude in place of `o.text`, or null when it must reach Claude whole. */
async function handOff($: any, o: HandOff): Promise<string | null> {
  if (!claudeDir) { await fail($, 'no ~/.claude folder found; nothing handed off'); return null }
  const dir = `${claudeDir}/${COPIES_DIR}`
  const ts = new Date().toISOString()
  const key = cacheKey({ path: o.keyPath, mtimeMs: o.mtimeMs, size: o.size, ask: lastAsk })
  const whole = o.copyText ?? o.text
  const row = { tool: o.tool, path: o.path, before: textTokens(whole), at: ts, copy: '', notes: '' }
  // Memory: the same file, unchanged, for the same ask — no helper call
  let names: string[] = []
  try { names = ((await $.fs.list(`${dir}/notatki`)) as any[]).map((x) => String(x?.name ?? x)) } catch { names = [] }
  const hit = findCopy(names, key)
  if (hit) {
    const saved = await readOr($, `${dir}/notatki/${hit}`)
    let result = ''
    try { result = String(JSON.parse(String(saved)).result || '') } catch { result = '' }
    if (result) {
      await writeRecord($, notesRecord({ toolUseId: o.toolUseId, tool: o.tool, path: o.path, beforeText: whole, afterText: result, usage: null, ms: 0, fromMemory: true, why: o.why }))
      await remember($, { ...row, after: textTokens(result), outcome: 'memory', model: '', copy: copyOf(result), notes: `${dir}/notatki/${hit}` })
      return result
    }
  }
  const s = readSettings(await $.store.get(STORE_KEY))
  const started = Date.now()
  let guard: { sent: boolean, label?: string, result?: Notes }
  try {
    guard = await guardHelper(`${lastAsk}\n${o.args}\n${o.text}`, (t: string) => scanText(t), () => helperNotes($, o.what, o.args, o.text, o.firstLine, s.model, Boolean(o.isConnector)))
  } catch (err) {
    await fail($, `${o.path}: ${String(err)}`)
    await remember($, { ...row, after: row.before, outcome: 'failed', model: s.model })
    return null
  }
  if (!guard.sent || !guard.result) {
    await remember($, { ...row, after: row.before, outcome: 'secret', model: '' })
    $.ui.log(`relai-input-router: secret scanner (${guard.label}) — ${o.path} reaches Claude whole`)
    return null
  }
  const n = guard.result
  const copyPath = o.fullAt ?? `${dir}/pelne/${copyName(ts, hash(o.keyPath) + hash(whole), 'txt')}`
  if (!o.fullAt) { try { await $.fs.write(copyPath, whole) } catch (err) { await fail($, `copy not written: ${String(err)}`); return null } }
  const result = notesResult({ what: o.what, path: o.path, model: n.usage?.model || n.model, lines: lineCount(o.text), tokens: textTokens(o.text), notes: n.notes, copyPath, isRange: o.isRange, isPartial: Boolean(o.fullAt), ...(o.isConnector ? { readFrom: copyPath } : {}) })
  const notesFile = `${dir}/notatki/${copyName(ts, key, 'json')}`
  let saved = notesFile
  try { await $.fs.write(notesFile, JSON.stringify({ ts, path: o.path, result })) } catch { saved = '' /* no memory this time */ }
  await writeRecord($, notesRecord({ toolUseId: o.toolUseId, tool: o.tool, path: o.path, beforeText: whole, afterText: result, usage: n.usage, ms: Date.now() - started, fromMemory: false, why: o.why }))
  await remember($, { ...row, after: textTokens(result), outcome: 'notes', model: n.usage?.model || n.model, copy: copyPath, notes: saved, helperIn: n.usage?.in ?? 0, helperOut: n.usage?.out ?? 0 })
  return result
}

/** The tool's own text of what it returned: a Read record's content, Bash's stdout, else core's text. */
function shownText(ran: any): string {
  const r = ran?.result
  if (r && typeof r === 'object' && r.file && typeof r.file.content === 'string') return r.file.content
  if (r && typeof r === 'object' && typeof r.stdout === 'string') return r.stdout
  return typeof ran?.text === 'string' ? ran.text : ''
}

/** The Read result with the notes in place of the content; core maps it for Claude (no ref: a hook's own result). */
function readWithNotes(ran: any, filePath: string, text: string): any {
  const r = ran?.result
  const n = lineCount(text)
  if (!ran?.isError && r && typeof r === 'object' && r.file && typeof r.file.content === 'string') {
    return { result: { ...r, file: { ...r.file, content: text, numLines: n, startLine: 1, totalLines: n } } }
  }
  return { result: { type: 'text', file: { filePath, content: text, numLines: n, startLine: 1, totalLines: n } } }
}

async function routePdf($: any, e: any, ran: any, path: string, stat: any): Promise<any> {
  const span = pagesSpan(e.pages)
  let pages: number | null = null
  let whole: string | null = null
  try { const r = await $.process.run(pdfinfoArgv(path), { timeoutMs: PDF_MS }); if (r.exitCode === 0) pages = pdfinfoPages(r.stdout) } catch { pages = null }
  if (pages === null) {
    // FACT 2026-11-11: pdfinfo is missing on the native Windows PATH, pdftotext is there
    try { const r = await $.process.run(pdftotextArgv(path), { timeoutMs: PDF_MS }); if (r.exitCode === 0) { whole = String(r.stdout || ''); pages = pdftextPages(whole) } } catch { whole = null }
  }
  if (pages === null) { await remember($, { tool: 'Read', path, before: 0, after: 0, outcome: 'no-poppler', model: '' }); return ran }
  const count = span ? Math.min(span.last, pages) - span.first + 1 : pages
  if (count <= PDF_MIN_PAGES) return ran
  if (isFullNext) { isFullNext = false; await remember($, { tool: 'Read', path, before: 0, after: 0, outcome: 'full', model: '' }); return ran }
  if (!(await mayHandOff($))) return ran
  let text = span ? null : whole
  if (text === null) {
    try { const r = await $.process.run(pdftotextArgv(path, span?.first, span?.last), { timeoutMs: PDF_MS }); text = r.exitCode === 0 ? String(r.stdout || '') : null } catch { text = null }
  }
  if (!text || textTokens(text) < MIN_TOKENS) return ran
  const notes = await handOff($, { toolUseId: String(e.tool_use_id ?? ''), tool: 'Read', path, keyPath: `${path}#${span ? `${span.first}-${span.last}` : 'all'}`, mtimeMs: stat.mtimeMs, size: stat.size, text, firstLine: 1, what: `a PDF, ${count} of ${pages} pages, as text`, isRange: Boolean(span), why: 'PDF over 5 pages', args: JSON.stringify({ file_path: e.file_path, pages: e.pages ?? null }) })
  return notes ? readWithNotes(ran, path, notes) : ran
}

async function routeRead($: any, e: any, ran: any): Promise<any> {
  if (!e.file_path || !gate.isFileOn) return ran
  const path = normPath(e.file_path, cwd)
  if (fileGuard(path, gate.projectRoot)) return ran
  let stat: any = null
  try { stat = await $.fs.stat(path, { resolve: true }) } catch { stat = null }
  if (!stat || stat.kind !== 'file') return ran
  // A link to a guarded file is guarded too (review E3, MEDIUM): the real path decides as well
  if (stat.realPath && fileGuard(normPath(stat.realPath, cwd), gate.projectRoot)) return ran
  if (isPdf(path)) return routePdf($, e, ran, path, stat)
  // UTF-8 bytes are never fewer than characters: a file this small is under MIN_TOKENS
  if (stat.size < MIN_TOKENS * 4) return ran
  const input = { offset: e.offset ?? null, limit: e.limit ?? null }
  const ranged = isRanged(input)
  const piece = shownText(ran)
  const fileTextNow = !ranged || stat.size <= BIG_FILE_BYTES ? await fileText($, path, stat.size) : null
  const file = { lines: fileTextNow !== null ? lineCount(fileTextNow) : 0, tokens: fileTextNow !== null ? textTokens(fileTextNow) : Math.ceil(stat.size / 4) }
  const before = covered.get(path) ?? 0
  const route: Route = readRoute(input, { lines: lineCount(piece), tokens: textTokens(piece) }, file, before)
  if (route.kind === 'pass') {
    if (!ranged || ran?.isError) return ran
    const after = addCovered(before, lineCount(piece), file.lines)
    covered = new Map(covered).set(path, after)
    const crossed = file.lines > 0 && before / file.lines <= PIECES_SHARE && after / file.lines > PIECES_SHARE
    return crossed && !ran.isError ? { ...ran, context: [...(ran.context ?? []), piecesContext(path, Math.round((after / file.lines) * 100))] } : ran
  }
  if (isFullNext) { isFullNext = false; await remember($, { tool: 'Read', path, before: 0, after: 0, outcome: 'full', model: '' }); return ran }
  const text = ranged ? piece : fileTextNow
  if (!text || (ranged && ran?.isError)) return ran
  if (!(await mayHandOff($))) return ran
  const notes = await handOff($, { toolUseId: String(e.tool_use_id ?? ''), tool: 'Read', path, keyPath: ranged ? `${path}#${input.offset ?? 1}+${input.limit ?? ''}` : path, mtimeMs: stat.mtimeMs, size: stat.size, text, firstLine: ranged ? Number(input.offset ?? 1) : 1, what: ranged ? 'a range of a file' : stat.size > BIG_FILE_BYTES ? 'the head and the tail of a very large file' : 'a file', isRange: ranged, why: route.why, args: JSON.stringify({ file_path: e.file_path, offset: input.offset, limit: input.limit }), ...(!ranged && stat.size > BIG_FILE_BYTES ? { fullAt: path } : {}) })
  return notes ? readWithNotes(ran, path, notes) : ran
}

async function routeBash($: any, e: any, ran: any): Promise<any> {
  const command = String(e.command ?? '')
  const r = ran?.result
  if (!command || !r || typeof r !== 'object' || typeof r.stdout !== 'string' || !gate.isFileOn) return ran
  const isError = Boolean(ran.isError || r.interrupted || String(r.stderr ?? '').trim())
  const route = bashRoute(command, { tokens: textTokens(r.stdout), isError, isPersisted: Boolean(r.persistedOutputPath) }, cwd, gate.projectRoot)
  if (route.kind === 'pass') return ran
  // A link named on the command line to a guarded file is guarded too (review E3, MEDIUM)
  for (const a of fileArgsOf(command)) {
    let real = ''
    try { real = String((await $.fs.stat(normPath(a, cwd), { resolve: true }))?.realPath ?? '') } catch { real = '' }
    if (real && fileGuard(normPath(real, cwd), gate.projectRoot)) return ran
  }
  if (isFullNext) { isFullNext = false; await remember($, { tool: 'Bash', path: command.slice(0, 120), before: 0, after: 0, outcome: 'full', model: '' }); return ran }
  if (!(await mayHandOff($))) return ran
  const label = `Bash: ${command.length > 120 ? command.slice(0, 117) + '...' : command}`
  const notes = await handOff($, { toolUseId: String(e.tool_use_id ?? ''), tool: 'Bash', path: label, keyPath: `bash:${cwd}|${command}|${hash(r.stdout)}`, mtimeMs: 0, size: r.stdout.length, text: r.stdout, firstLine: 1, what: 'the output of a shell command', isRange: false, why: route.why, args: JSON.stringify({ command }) })
  return notes ? { result: { ...r, stdout: notes, stderr: '' } } : ran
}

/** A connector's result (probe E4: `ran.result` is the block array): whole, trimmed here, or the helper's notes. */
async function routeMcp($: any, e: any, ran: any): Promise<any> {
  const tool = String(e.tool ?? '')
  const r = connectorRoute(tool, ran?.result, Boolean(ran?.isError), pluginNames)
  if (r.kind === 'pass') return ran
  if (!readSettings(await $.store.get(STORE_KEY)).connector) return ran
  const whole = textOfBlocks(ran.result) ?? ''
  const toolUseId = String(e.tool_use_id ?? '')
  if (isFullNext) { isFullNext = false; await remember($, { tool, path: tool, before: 0, after: 0, outcome: 'full', model: '' }); return ran }
  if (!(await mayHandOff($, true))) return ran
  const args = JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'tool' && k !== 'tool_use_id')))
  if (r.kind === 'local') {
    // Nothing leaves the machine here: no consent question would be needed, but the switch and the twin still decide (above)
    if (!claudeDir) { await fail($, 'no ~/.claude folder found; nothing handed off'); return ran }
    // A secret in the result: no copy on disk, the result whole (review E4, MEDIUM)
    // scanText answers a label on a hit and nothing otherwise (guardHelper reads it the same way)
    if (scanText(whole)) { await remember($, { tool, path: tool, before: textTokens(whole), after: textTokens(whole), outcome: 'secret', model: '' }); return ran }
    const ts = new Date().toISOString()
    const copyPath = `${claudeDir}/${COPIES_DIR}/pelne/${copyName(ts, hash(`mcp:${tool}|${args}`) + hash(whole), 'txt')}`
    try { await $.fs.write(copyPath, whole) } catch (err) { await fail($, `copy not written: ${String(err)}`); return ran }
    const before = textTokens(whole)
    const text = localResult({ tool, action: r.action, text: r.text, before, copyPath })
    await writeRecord($, { tool_use_id: toolUseId, part: '0', tool, action: r.action, before, after: textTokens(text), measured: false, detail: `${r.why}; ${tool}` })
    await remember($, { tool, path: tool, before, after: textTokens(text), outcome: r.action, model: '', at: ts, copy: copyPath })
    return { result: asBlocks(text) }
  }
  const notes = await handOff($, { toolUseId, tool, path: tool, keyPath: `mcp:${tool}|${hash(args)}|${hash(whole)}`, mtimeMs: 0, size: whole.length, text: r.text, firstLine: 1, what: `the result of the connector tool ${tool}`, isRange: false, why: r.why, args, isConnector: true, copyText: whole })
  return notes ? { result: asBlocks(notes) } : ran
}

/** What an open card shows: the saved notes, or the full result's path and its first lines. */
async function openedText($: any, list: readonly RouterHandoff[], open: { at: string, what: string }): Promise<string> {
  const r = list.find((x) => x.at === open.at)
  if (!r) return ''
  if (open.what === 'notes') return headOf(notesOfFile(r.notes ? await readOr($, r.notes) : null) || 'The notes file is gone (retention or cleanup).', SHOWN_LINES)
  const full = r.copy ? await readOr($, r.copy) : null
  return full === null ? `The full result is gone: ${r.copy}` : `${r.copy}\n\n${headOf(full, SHOWN_LINES)}`
}

/** A card's button: open or close what it shows in place (notes or the head of the full result). */
async function toggleShown($: any, at: string, what: 'notes' | 'full'): Promise<void> {
  await update($, shown, (s) => (s.at === at && s.what === what ? { at: '', what: '' } : { at, what }))
}

async function setSwitch($: any, key: 'file' | 'connector', on: boolean): Promise<string> {
  const s = readSettings(await $.store.get(STORE_KEY))
  await $.store.set(STORE_KEY, { ...s, [key]: on })
  if (key === 'file') gate = { ...gate, isFileOn: on }
  $.ui.invalidate('ui.render')
  if (key === 'file') return on ? 'relai-input-router: large files and reader outputs go to the helper first.' : 'relai-input-router: files off; everything reaches Claude whole.'
  return on ? 'relai-input-router: large connector results are trimmed or go to the helper first.' : 'relai-input-router: connectors off; their results reach Claude whole.'
}

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    cwd = String(e.cwd || '').replace(/\\/g, '/')
    isWindows = /^[A-Za-z]:\//.test(cwd)
    claudeDir = await findClaudeDir($)
    try { session = await $.session.id() } catch { session = 'unknown' }
    queue = null
    covered = new Map()
    await loadGate($)
    await $.command.register({ name: 'relai-input-router', description: 'RelAI Input Router: stats; full lets the next large read through whole; off|on file, off|on connector; pane; model <id>' })
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    const origin = (e as any).origin
    if (isHumanOrigin(origin)) {
      gate = { ...gate, hasHuman: true }
      const text = String((e as any).text ?? '')
      if (!(e as any).isMeta && text.trim() && !isBareYes(text)) lastAsk = text
    }
    return next(e)
  })

  on('command.run', { command: 'relai-input-router' }, async ($, e) => {
    if (isHumanOrigin((e as any).origin)) gate = { ...gate, hasHuman: true }
    const c = parseCommand(e.args)
    const s = readSettings(await $.store.get(STORE_KEY))
    if (c.kind === 'bad') return { text: c.text }
    if (c.kind === 'full') { isFullNext = true; return { text: 'relai-input-router: the next large read goes through whole.' } }
    if (c.kind === 'file' || c.kind === 'connector') return { text: await setSwitch($, c.kind, c.on) }
    if (c.kind === 'pane') { await $.ui.open({ id: PANE, title: 'RelAI Input Router' }); return { text: 'relai-input-router: hand-off pane opened.' } }
    if (c.kind === 'model') {
      const next = readSettings({ ...s, model: c.model })
      await $.store.set(STORE_KEY, next)
      return { text: `relai-input-router: helper model ${next.model}.` }
    }
    const list = await read($, handoffs)
    const d = decide(gate)
    const state = d.kind === 'idle' ? d.why : d.kind === 'ask' ? 'asks at the next large read' : 'on'
    const done = list.filter((x) => ['notes', 'memory', 'trim', 'cut'].includes(x.outcome))
    const saved = done.reduce((n, x) => n + (x.before - x.after), 0)
    return { text: `relai-input-router: ${state}; files ${s.file ? 'on' : 'off'}, connectors ${s.connector ? 'on' : 'off'}; helper ${s.model}; ${done.length} hand-offs this chat (${list.filter((x) => x.outcome === 'memory').length} from memory, ${list.filter((x) => x.outcome === 'trim' || x.outcome === 'cut').length} trimmed here), ~${saved} tokens kept out of the chat; ${list.filter((x) => x.outcome === 'failed').length} failed, ${list.filter((x) => x.outcome === 'secret').length} held back by the secret scanner.${lastFailure ? ` Last failure: ${lastFailure}` : ''}` }
  })

  on('tool.call', { tool: ['Read', 'Bash'] }, async ($, e, next) => {
    const ran: any = await next(e)
    if (!ran || ran.deny) return ran
    try {
      if (e.tool === 'Read') return await routeRead($, e, ran)
      if (e.tool === 'Bash') return await routeBash($, e, ran)
    } catch (err) {
      await fail($, `${e.tool}: ${String(err)}`)
    }
    return ran
  })

  // Connectors (E4): every mcp__* tool; the untouched list and the size decide in connectors.ts
  // A matcher, not a wrapper: a hook on every tool sat over the Read hook and dropped its `context` (E4 test)
  on('tool.call', { tool: /^mcp__/ }, async ($, e, next) => {
    const tool = String((e as any).tool ?? '')
    const ran: any = await next(e)
    if (!ran || ran.deny) return ran
    try {
      return await routeMcp($, e, ran)
    } catch (err) {
      await fail($, `${tool}: ${String(err)}`)
      return ran
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const list = await read($, handoffs)
    const why = await read($, idle)
    const open = await read($, shown)
    const s = readSettings(await $.store.get(STORE_KEY))
    const isWide = (e.viewport?.columns ?? WIDE_COLUMNS) >= WIDE_COLUMNS
    const room = Math.max(1, Math.floor(((e.viewport?.rows ?? 24) - 8) / 4))
    const cards = cardsOf(list, prices, room)
    const openText = open.at ? await openedText($, list, open) : ''
    const btn = (key: string, label: string, onPress: () => void) => (
      <Box key={`${key}~b`} flexShrink={0}><Button key={key} label={label} variant="secondary" onPress={onPress} /></Box>
    )
    const switches = (
      <Box key="sw" flexDirection="row" flexWrap="wrap" columnGap={1} rowGap={1}>
        {btn('sw-full', isFullNext ? '● Next read whole' : 'Next read whole', () => { isFullNext = !isFullNext; $.ui.invalidate('ui.render') })}
        {btn('sw-file', s.file ? '● Files on' : 'Files off', () => { void setSwitch($, 'file', !s.file) })}
        {btn('sw-conn', s.connector ? '● Connectors on' : 'Connectors off', () => { void setSwitch($, 'connector', !s.connector) })}
      </Box>
    )
    return (
      <Box flexDirection="column" paddingX={1} rowGap={1}>
        <Box key="head" flexDirection="column">
          <Text color="text" bold>RelAI Input Router — hand-offs</Text>
          <Text color="inactive">{summaryOf(list, prices)}</Text>
          {why !== '' && <Text color="warning">● {why}</Text>}
        </Box>
        {switches}
        {cards.length === 0 && <Text key="none" color="inactive">No hand-offs yet: large files, reader outputs and connector results show here.</Text>}
        {cards.map((c) => {
          const at = c.key
          const words = (
            <Box key={`${c.key}~w`} flexDirection="column" flexGrow={1} width={0}>
              <Text color={c.tone === 'bad' ? 'error' : c.tone === 'ok' ? 'text' : 'inactive'}>{c.sign} {c.word} · {c.tool}</Text>
              {c.path !== '' && <Text color="inactive" wrap="truncate">{c.path}</Text>}
              {c.numbers !== '' && <Text color="inactive">{c.numbers}</Text>}
            </Box>
          )
          const acts = (
            <Box key={`${c.key}~a`} flexDirection="row" columnGap={1} flexShrink={0}>
              {c.notes !== '' && btn(`${c.key}~n`, open.at === at && open.what === 'notes' ? '▾ Notes' : 'Notes', () => { void toggleShown($, at, 'notes') })}
              {c.copy !== '' && btn(`${c.key}~f`, open.at === at && open.what === 'full' ? '▾ Full result' : 'Full result', () => { void toggleShown($, at, 'full') })}
            </Box>
          )
          return (
            <Box key={c.key} flexDirection="column">
              <Box key={`${c.key}~r`} flexDirection={isWide ? 'row' : 'column'} columnGap={2} rowGap={1}>
                {words}
                {acts}
              </Box>
              {open.at === at && openText !== '' && (
                <Box key={`${c.key}~o`} flexDirection="column" borderStyle="round" borderColor="subtle" paddingX={1}>
                  <Text color="text">{openText}</Text>
                  {open.what === 'full' && btn(`${c.key}~c`, 'Copy path', () => { void $.ui.copy({ text: c.copy, surface: e.surface }) })}
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    )
  })
}
