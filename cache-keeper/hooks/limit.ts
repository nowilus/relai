// The plan-limit threshold (LIMIT_CHECKPOINT E1): from what percent used a limit battery warns.
// Read in the order of the optimizer's consent (core/process/prompt-mode.js): this session's file
// → the `Próg limitu` row of the project's docs/USTAWIENIA.md → the same row in
// ~/.claude/relai/USTAWIENIA.md → the plugin's `limitWarn` setting → 90. A value outside 1–99, or
// no number at all, is skipped and the next level decides. core/process/threshold.js reads the same
// files the same way for the relai plugin's hooks; a parity test holds the two together.
//
// No imports and no `$`: the files come through `io`, so tests pass a fake and Node can load this
// file as is (core/process/tests/threshold.test.js).

export const DEFAULT_THRESHOLD = 90
export const SESSION_DIR = '.claude/relai/limit'

export type ThresholdSource = 'sesja' | 'projekt' | 'globalnie' | 'ustawienie' | 'domyślny'
export type Threshold = { value: number, source: ThresholdSource }
export type Scope = 'sesja' | 'projekt' | 'globalnie'
// read: the text, or null when the file is missing or unreadable
export type LimitIO = { read: (path: string) => Promise<string | null>, write: (path: string, text: string) => Promise<void> }
export type Where = { root: string, home: string, sessionId: string }

// The session id becomes a path: anything outside [A-Za-z0-9_-] means no session file
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/
// The whole "Czego dotyczy" cell, a closed list of names (L-0025): "Próg limitu dla API" is not it
const ROW_NAME = /^(?:Próg limitu|Prog limitu|Limit threshold)$/i
// The value cell starts with a whole number; a percent sign and words after `·` are for people
const ROW_VALUE = /^(\d{1,3})\s*%?(?=\s|·|$)/
// Rows under this heading are withdrawn and never decide
const WITHDRAWN = /^#+\s.*(?:wycofane|withdrawn)/i
const TABLE_HEAD = /^\|\s*Data\s*\|\s*Czego dotyczy\s*\|/i

export const isThreshold = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 99

const slash = (p: string) => p.replace(/\\/g, '/')

export function sessionPath(root: string, sessionId: string): string | null {
  if (!SESSION_ID.test(String(sessionId || ''))) return null
  return slash(`${root || '.'}/${SESSION_DIR}/${sessionId}.json`)
}

export const projectPath = (root: string) => slash(`${root || '.'}/docs/USTAWIENIA.md`)
export const globalPath = (home: string) => slash(`${home || '.'}/.claude/relai/USTAWIENIA.md`)

// A session file's threshold, or null: not JSON, no `prog`, or one outside 1–99
export function sessionValue(text: string | null): number | null {
  if (!text) return null
  try {
    const j = JSON.parse(text)
    return j && typeof j === 'object' && isThreshold(j.prog) ? j.prog : null
  } catch {
    return null
  }
}

type Row = { line: number, value: number | null }

// The first `Próg limitu` row above the withdrawn section, with its value or null
function findRow(lines: readonly string[]): Row | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (WITHDRAWN.test(line)) return null
    if (!line.trim().startsWith('|')) continue
    const cells = line.split('|').map((c) => c.trim())
    if (cells.length < 5) continue
    if (!ROW_NAME.test((cells[2] ?? '').replace(/\*\*/g, '').trim())) continue
    const m = (cells[3] ?? '').replace(/\*\*/g, '').trim().match(ROW_VALUE)
    const n = m ? Number(m[1]) : NaN
    return { line: i, value: isThreshold(n) ? n : null }
  }
  return null
}

// A settings file's threshold, or null: no row, or a value that is no number in 1–99
export function rowValue(text: string | null): number | null {
  return text ? findRow(text.split('\n'))?.value ?? null : null
}

// The threshold and where it came from; `setting` is the plugin's limitWarn, if it has one
export async function thresholdOf(io: LimitIO, where: Where, setting?: number): Promise<Threshold> {
  const file = sessionPath(where.root, where.sessionId)
  const fromSession = file ? sessionValue(await io.read(file)) : null
  if (fromSession !== null) return { value: fromSession, source: 'sesja' }
  const fromProject = rowValue(await io.read(projectPath(where.root)))
  if (fromProject !== null) return { value: fromProject, source: 'projekt' }
  const fromGlobal = rowValue(await io.read(globalPath(where.home)))
  if (fromGlobal !== null) return { value: fromGlobal, source: 'globalnie' }
  if (isThreshold(setting) && setting !== DEFAULT_THRESHOLD) return { value: setting, source: 'ustawienie' }
  return { value: DEFAULT_THRESHOLD, source: 'domyślny' }
}

const row = (value: number, today: string) => `| ${today} | Próg limitu | ${value} |`
const GLOBAL_HEAD = '# USTAWIENIA — preferencje globalne\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'

// The settings text with the threshold row set: the existing row rewritten in place, else a new
// row after the last row of the first settings table; null when there is no table to write into
export function withRow(text: string, value: number, today: string): string | null {
  const lines = text.split('\n')
  const found = findRow(lines)
  if (found) return [...lines.slice(0, found.line), row(value, today), ...lines.slice(found.line + 1)].join('\n')
  const head = lines.findIndex((l) => TABLE_HEAD.test(l))
  if (head < 0) return null
  let last = head
  while (last + 1 < lines.length && (lines[last + 1] ?? '').trim().startsWith('|')) last++
  return [...lines.slice(0, last + 1), row(value, today), ...lines.slice(last + 1)].join('\n')
}

// Saves a chosen threshold in one scope. Returns the path written, or an error in Polish.
export async function rememberThreshold(io: LimitIO, where: Where, value: number, scope: Scope, today: string): Promise<{ path?: string, error?: string }> {
  if (!isThreshold(value)) return { error: 'próg limitu: liczba całkowita od 1 do 99' }
  if (scope === 'sesja') {
    const file = sessionPath(where.root, where.sessionId)
    if (!file) return { error: 'próg limitu: nieznany identyfikator sesji, nie zapisuję pliku sesji' }
    await io.write(file, JSON.stringify({ prog: value, data: today, zrodlo: 'sesja' }) + '\n')
    return { path: file }
  }
  const file = scope === 'projekt' ? projectPath(where.root) : globalPath(where.home)
  const text = await io.read(file)
  const next = text === null ? (scope === 'globalnie' ? GLOBAL_HEAD + row(value, today) + '\n' : null) : withRow(text, value, today)
  if (next === null) return { error: `próg limitu: brak tabeli ustawień w ${file}` }
  await io.write(file, next)
  return { path: file }
}

// "85 % (sesja)" — the status line's words
export const thresholdText = (t: Threshold) => `${t.value} % (${t.source})`
