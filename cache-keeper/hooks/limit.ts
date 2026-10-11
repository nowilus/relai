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

// ---------- the card after a turn (LIMIT_CHECKPOINT E2) ----------
// Past the threshold, while work goes on, a main turn's end asks once: work on, save the work, or
// stop asking in this session. "Work on" raises this session's threshold by 5 points, up to 99,
// where the card no longer comes (only the battery's colour stays).

export const MAX_THRESHOLD = 99
export const THRESHOLD_STEP = 5
export const FEW_TURNS = 3 // fewer turns left than this and the card warns the save may not finish
export const FOCUS_DIR = '.claude/relai/fokus'

export const GO_ON = 'Pracuję dalej'
export const SAVE = 'Zapisz pracę teraz'
export const MUTE = 'Nie pytaj w tej sesji'
export const CARD_OPTIONS: readonly string[] = [GO_ON, SAVE, MUTE]
export const THRESHOLD_OPTIONS: readonly string[] = ['85 %', '90 %', '95 %']
export const SCOPE_OPTIONS: readonly { label: string, scope: Scope }[] = [
  { label: 'Ta sesja', scope: 'sesja' },
  { label: 'Ten projekt', scope: 'projekt' },
  { label: 'Wszystkie projekty', scope: 'globalnie' },
]

export const nextSessionThreshold = (t: number): number => Math.min(MAX_THRESHOLD, t + THRESHOLD_STEP)

// A threshold typed or chosen on the card: "85", "85 %", "85%"; anything else, or outside 1–99, is null
export function thresholdAnswer(answer: string): number | null {
  const m = String(answer ?? '').trim().match(/^(\d{1,3})\s*%?$/)
  const n = m ? Number(m[1]) : NaN
  return isThreshold(n) ? n : null
}

// What the session works on, as relai-panel writes it (panel/hooks/focus.ts, parseFocus). Names
// go into paths, so only [A-Za-z0-9_-] passes: "../x" is no focus.
export type FocusRef = { kind: 'plan', plan: string, stage: string } | { kind: 'branch', card: string }
const NAME = /^[A-Za-z0-9_-]{1,64}$/

export function focusFilePath(root: string, sessionId: string): string | null {
  if (!SESSION_ID.test(String(sessionId || ''))) return null
  return slash(`${root || '.'}/${FOCUS_DIR}/${sessionId}.json`)
}

export function focusRef(text: string | null): FocusRef | null {
  if (!text) return null
  try {
    const v = JSON.parse(text) as Record<string, unknown>
    if (v.kind === 'plan' && typeof v.plan === 'string' && NAME.test(v.plan) && typeof v.stage === 'string' && /^E\d+$/.test(v.stage)) return { kind: 'plan', plan: v.plan, stage: v.stage }
    if (v.kind === 'branch' && typeof v.card === 'string' && NAME.test(v.card)) return { kind: 'branch', card: v.card }
    return null
  } catch {
    return null
  }
}

export const focusDocPath = (root: string, ref: FocusRef): string =>
  slash(`${root || '.'}/${ref.kind === 'plan' ? `docs/plany/${ref.plan}/STATUS.md` : `docs/fixy/${ref.card}/ODNOGA.md`}`)

export type StageRow = { id: string, status: string }

// The status the focus points at: its stage's row in STATUS.md (rows read by the caller's
// parseStatus), or the card's "Status: **…**"; null when the document says none
export function focusStatus(ref: FocusRef, docText: string | null, stagesOf: (md: string) => readonly StageRow[]): string | null {
  if (docText === null) return null
  if (ref.kind === 'plan') return stagesOf(docText).find((s) => s.id === ref.stage)?.status ?? null
  const m = /Status:\s*\*\*([^*]+)\*\*/.exec(docText)
  return m ? (m[1] ?? '').trim() : null
}

// Work goes on: the focus's stage or thread is in progress, or the tree has uncommitted changes.
// `gitOut` null is "do not know" (no git, an error, a timeout): then the focus alone decides.
export function isWorkGoing(status: string | null, gitOut: string | null): boolean {
  if (status !== null && /^(?:W TOKU|OTWARTA)/.test(status)) return true
  return gitOut !== null && gitOut.trim() !== ''
}

export type LimitRow = { kind: string, percentUsed: number, resetsAt?: string }
export type CardInput = {
  limits: readonly LimitRow[]
  threshold: number
  askedAt: number // the threshold the last card came at; 0 = none in this session
  isMuted: boolean
  isWorking: boolean
  perTurn: number | null // the 5-hour window's mean percent per main turn (economics.ts limitPace)
  now: number
  saveWords: string // what "Zapisz pracę teraz" runs, said on the card
}
export type Card = { over: LimitRow[], resetAt: number | null, turnsLeft: number | null, question: string }

const WINDOW: Record<string, string> = { five_hour: '5 h', seven_day: 'tydzień' }
// Two decimals, Polish comma (L-0145)
const percentText = (n: number) => n.toFixed(2).replace('.', ',') + ' %'
const two = (n: number) => String(n).padStart(2, '0')

function whenText(at: number, now: number): string {
  const d = new Date(at)
  const time = `${two(d.getHours())}:${two(d.getMinutes())}`
  return new Date(now).toDateString() === d.toDateString() ? time : `${d.getDate()}.${two(d.getMonth() + 1)} ${time}`
}

function turnsText(n: number): string {
  const tens = n % 100
  if (n === 1) return '1 tura'
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? `${n} tury` : `${n} tur`
}

// The card, or null: muted, no work, no limit past the threshold (strictly: "dalej" at 90 stays
// quiet through 95 % and asks at 96 %), already asked at this threshold, or a threshold of 99.
// No limits at all (an API key, the first turn) is silence too.
export function cardDue(i: CardInput): Card | null {
  if (i.isMuted || !i.isWorking || i.threshold >= MAX_THRESHOLD || i.askedAt === i.threshold) return null
  const over = i.limits.filter((l) => Number.isFinite(l.percentUsed) && Math.round(l.percentUsed) > i.threshold)
  if (!over.length) return null
  const resets = over.map((l) => (l.resetsAt ? Date.parse(l.resetsAt) : NaN)).filter(Number.isFinite)
  const resetAt = resets.length ? Math.max(...resets) : null
  const five = over.find((l) => l.kind === 'five_hour')
  const turnsLeft = five && i.perTurn !== null && i.perTurn > 0 ? Math.max(0, Math.floor((100 - five.percentUsed) / i.perTurn)) : null
  const parts = [`Limit planu ponad progiem ${i.threshold} %: ${over.map((l) => `${WINDOW[l.kind] ?? l.kind} ${percentText(l.percentUsed)}`).join(' · ')}.`]
  if (resetAt === null) parts.push('Czas resetu nieznany.')
  else parts.push(over.length > 1 ? `Reset ${whenText(resetAt, i.now)} — okno, które odnawia się później.` : `Reset ${whenText(resetAt, i.now)}.`)
  if (five) parts.push(turnsLeft === null ? 'Zapas tur: brak pomiaru tempa sesji.' : `Zapas: ok. ${turnsText(turnsLeft)} przy tempie tej sesji (SZACUNEK).`)
  if (turnsLeft !== null && turnsLeft < FEW_TURNS) parts.push(`Uwaga: mniej niż ${FEW_TURNS} tury — zapis może nie zdążyć.`)
  parts.push(`„${SAVE}” ${i.saveWords}.`, 'Pracować dalej czy zapisać pracę teraz?')
  return { over, resetAt, turnsLeft, question: parts.join(' ') }
}
