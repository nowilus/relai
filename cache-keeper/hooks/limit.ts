// The plan-limit thresholds (LIMIT_CHECKPOINT E1, two of them since Aneks C): from what percent
// used a limit battery warns and the card after a turn asks — the 5-hour window (90 by default,
// the main use) and the week (98: it matters only near the end). Each is read in the order of the
// optimizer's consent (core/process/prompt-mode.js): this session's file → its row in the project's
// docs/USTAWIENIA.md → the same row in ~/.claude/relai/USTAWIENIA.md → its default. A value outside
// 1–99, or no number at all, is skipped and the next level decides. The plugin's old `limitWarn`
// setting is gone (Aneks B; never released). The reading lives in the panel core's
// limit-threshold.mjs (one reader for this mod and relai-panel); this file writes the files and
// holds the card and the save. core/process/threshold.js reads the same files the same way for the
// relai plugin's hooks; a parity test holds the two together.
//
// No `$`: the files come through `io`, so tests pass a fake and Node can load this file as is
// (core/process/tests/threshold.test.js); its one import is the synced core copy.

import {
  DEFAULTS, DEFAULT_THRESHOLD, DEFAULT_WEEK_THRESHOLD, ROW_LABEL, SESSION_DIR, SESSION_KEY, SOURCE_WORDS, WINDOWS, findRow, globalPath, isThreshold,
  projectPath, rowValue, sessionObject, sessionPath, sessionValue, thresholdOf, thresholdsOf,
} from './relai/limit-threshold.mjs'

export {
  DEFAULTS, DEFAULT_THRESHOLD, DEFAULT_WEEK_THRESHOLD, SESSION_DIR, SOURCE_WORDS, WINDOWS, globalPath, isThreshold, projectPath, rowValue, sessionPath,
  sessionValue, thresholdOf, thresholdsOf,
}

// The shapes of the core's JSDoc, spelled out for TypeScript
export type LimitWindow = 'five' | 'week'
export type ThresholdSource = 'sesja' | 'projekt' | 'globalnie' | 'domyślny'
export type Threshold = { value: number, source: ThresholdSource }
export type Thresholds = Readonly<Record<LimitWindow, Threshold>>
export type Where = { root: string, home: string, sessionId: string }

export type Scope = 'sesja' | 'projekt' | 'globalnie'
// read: the text, or null when the file is missing or unreadable
export type LimitIO = { read: (path: string) => Promise<string | null>, write: (path: string, text: string) => Promise<void> }

const TABLE_HEAD = /^\|\s*Data\s*\|\s*Czego dotyczy\s*\|/i
const slash = (p: string) => p.replace(/\\/g, '/')

const row = (value: number, today: string, window: LimitWindow) => `| ${today} | ${ROW_LABEL[window]} | ${value} |`
const GLOBAL_HEAD = '# USTAWIENIA — preferencje globalne\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'

// The settings text with the window's threshold row set: the existing row rewritten in place, else
// a new row after the last row of the first settings table; null when there is no table to write into
export function withRow(text: string, value: number, today: string, window: LimitWindow = 'five'): string | null {
  const lines = text.split('\n')
  const found = findRow(lines, window)
  if (found) return [...lines.slice(0, found.line), row(value, today, window), ...lines.slice(found.line + 1)].join('\n')
  const head = lines.findIndex((l) => TABLE_HEAD.test(l))
  if (head < 0) return null
  let last = head
  while (last + 1 < lines.length && (lines[last + 1] ?? '').trim().startsWith('|')) last++
  return [...lines.slice(0, last + 1), row(value, today, window), ...lines.slice(last + 1)].join('\n')
}

// Saves a chosen threshold of one window in one scope; the session file keeps the other window's
// value. Returns the path written, or an error in Polish.
export async function rememberThreshold(io: LimitIO, where: Where, value: number, scope: Scope, today: string, window: LimitWindow = 'five'): Promise<{ path?: string, error?: string }> {
  if (!isThreshold(value)) return { error: 'próg limitu: liczba całkowita od 1 do 99' }
  if (scope === 'sesja') {
    const file = sessionPath(where.root, where.sessionId)
    if (!file) return { error: 'próg limitu: nieznany identyfikator sesji, nie zapisuję pliku sesji' }
    const kept = sessionObject(await io.read(file)) ?? {}
    await io.write(file, JSON.stringify({ ...kept, [SESSION_KEY[window]]: value, data: today, zrodlo: 'sesja' }) + '\n')
    return { path: file }
  }
  const file = scope === 'projekt' ? projectPath(where.root) : globalPath(where.home)
  const text = await io.read(file)
  const next = text === null ? (scope === 'globalnie' ? GLOBAL_HEAD + row(value, today, window) + '\n' : null) : withRow(text, value, today, window)
  if (next === null) return { error: `próg limitu: brak tabeli ustawień w ${file}` }
  await io.write(file, next)
  return { path: file }
}

export const WINDOW_NAME: Readonly<Record<LimitWindow, string>> = { five: '5 h', week: 'tydzień' }

// "85 % (ta sesja)" — the status line's and the toast's words
export const thresholdText = (t: Threshold) => `${t.value} % (${SOURCE_WORDS[t.source]})`

// `/cache limit-warn [N]` sets the 5-hour threshold, `/cache limit-warn-week [N]` the week's;
// Polish keys too. Without N the cards ask for the number first (the panel's "Zmień" sends that).
export const LIMIT_WARN_KEYS: Readonly<Record<LimitWindow, readonly string[]>> = {
  five: ['limit-warn', 'prog-limitu', 'próg-limitu'],
  week: ['limit-warn-week', 'limit-warn-tydzien', 'limit-warn-tydzień', 'prog-tygodnia', 'próg-tygodnia'],
}

export function limitWarnWindow(key: string): LimitWindow | null {
  const k = String(key || '').toLowerCase()
  return WINDOWS.find((w) => LIMIT_WARN_KEYS[w].includes(k)) ?? null
}

// The window's words in a sentence: "limitu 5 h", "limitu tygodnia"
export const WINDOW_OF: Readonly<Record<LimitWindow, string>> = { five: 'limitu 5 h', week: 'limitu tygodnia' }

// The threshold card's header: the engine cuts a header at 12 characters ("Próg limitu " was all
// that was left of "Próg limitu tygodnia" in plugin test, 2.1.295)
export const THRESHOLD_HEADER: Readonly<Record<LimitWindow, string>> = { five: 'Próg 5 h', week: 'Próg tydzień' }

// The threshold card's ready answers per window (the week's hold its default 98, Łukasz 2026-10-11)
export const THRESHOLD_CHOICES: Readonly<Record<LimitWindow, readonly string[]>> = { five: ['85 %', '90 %', '95 %'], week: ['95 %', '98 %', '99 %'] }

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
export const SCOPE_OPTIONS: readonly { label: string, scope: Scope }[] = [
  { label: 'Ta sesja', scope: 'sesja' },
  { label: 'Ten projekt', scope: 'projekt' },
  { label: 'Wszystkie projekty', scope: 'globalnie' },
]
export const NO_SCOPE = 'Nie zapisuj' // the scope card's way out: nothing is written (Aneks B)

export const nextSessionThreshold = (t: number): number => Math.min(MAX_THRESHOLD, t + THRESHOLD_STEP)

// The /cache words after both thresholds. A window at 99 asks no more (overLimits), so the line
// says its card is off instead of promising one (Łukasz 2026-10-24: "przy 99 nic nie przerwie")
export function thresholdTail(t: PerWindow): string {
  const off = WINDOWS.filter((w) => t[w] >= MAX_THRESHOLD)
  const battery = 'od niego bateria limitu ostrzega kolorem'
  if (off.length === WINDOWS.length) return `${battery}; karta po turze wyłączona (próg ${MAX_THRESHOLD} %).`
  if (!off.length) return `${battery}, a po turze przychodzi karta.`
  return `${battery}, a po turze przychodzi karta (${off.map((w) => WINDOW_NAME[w]).join(', ')}: karta wyłączona przy ${MAX_THRESHOLD} %).`
}

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
  if (!sessionPath(root, sessionId)) return null // the same id rule as the threshold's session file
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
export type PerWindow = Readonly<Record<LimitWindow, number>>
export type CardInput = {
  limits: readonly LimitRow[]
  thresholds: PerWindow // each window against its own threshold (Aneks C)
  asked: PerWindow // per window, the threshold the last card came at; 0 = none in this session
  isMuted: boolean
  isWorking: boolean
  perTurn: number | null // the 5-hour window's mean percent per main turn (economics.ts limitPace)
  now: number
  saveWords: string // what "Zapisz pracę teraz" runs, said on the card
}
// windows: those past their thresholds; resetAt: the reset of the window that blocks the work
export type Card = { over: LimitRow[], windows: LimitWindow[], resetAt: number | null, turnsLeft: number | null, question: string }

// The engine's window names; any other kind is no window of this card
export const KIND_WINDOW: Readonly<Record<string, LimitWindow>> = { five_hour: 'five', seven_day: 'week' }
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

const windowOf = (l: LimitRow): LimitWindow | null => KIND_WINDOW[l.kind] ?? null
const resetOf = (l: LimitRow | undefined): number | null => {
  const at = l?.resetsAt ? Date.parse(l.resetsAt) : NaN
  return Number.isFinite(at) ? at : null
}

// The windows past their own thresholds (strictly: "dalej" at 90 stays quiet through 95 % and asks
// at 96 %); a window at a threshold of 99 is past asking. Unknown kinds count for nothing.
export function overLimits(limits: readonly LimitRow[], thresholds: PerWindow): LimitRow[] {
  return limits.filter((l) => {
    const w = windowOf(l)
    return w !== null && thresholds[w] < MAX_THRESHOLD && Number.isFinite(l.percentUsed) && Math.round(l.percentUsed) > thresholds[w]
  })
}

// The reset the work waits for (Aneks C): the week's when the week is past its threshold (alone or
// with the 5-hour window — then the week blocks), else the 5-hour window's
export function blockingReset(over: readonly LimitRow[]): number | null {
  const week = over.find((l) => l.kind === 'seven_day')
  return resetOf(week ?? over.find((l) => l.kind === 'five_hour'))
}

// The card, or null: muted, no work, no window past its threshold, or every window past it already
// asked at its threshold. No limits at all (an API key, the first turn) is silence too.
export function cardDue(i: CardInput): Card | null {
  if (i.isMuted || !i.isWorking) return null
  const over = overLimits(i.limits, i.thresholds)
  const windows = over.map(windowOf).filter((w): w is LimitWindow => w !== null)
  if (!windows.some((w) => i.asked[w] !== i.thresholds[w])) return null
  const resetAt = blockingReset(over)
  const five = over.find((l) => l.kind === 'five_hour')
  const turnsLeft = five && i.perTurn !== null && i.perTurn > 0 ? Math.max(0, Math.floor((100 - five.percentUsed) / i.perTurn)) : null
  const named = (l: LimitRow) => `${WINDOW_NAME[windowOf(l) ?? 'five']} ${percentText(l.percentUsed)}`
  const parts = [over.length === 1
    ? `Limit planu ponad progiem ${i.thresholds[windows[0] ?? 'five']} %: ${named(over[0] as LimitRow)}.`
    : `Limit planu ponad progami: ${over.map((l) => `${named(l)} (próg ${i.thresholds[windowOf(l) ?? 'five']} %)`).join(' · ')}.`]
  if (resetAt === null) parts.push('Czas resetu nieznany.')
  else parts.push(over.length > 1 ? `Reset ${whenText(resetAt, i.now)} — blokuje limit tygodnia.` : `Reset ${whenText(resetAt, i.now)}.`)
  if (five) parts.push(turnsLeft === null ? 'Zapas tur: brak pomiaru tempa sesji.' : `Zapas: ok. ${turnsText(turnsLeft)} przy tempie tej sesji (SZACUNEK).`)
  if (turnsLeft !== null && turnsLeft < FEW_TURNS) parts.push(`Uwaga: mniej niż ${FEW_TURNS} tury — zapis może nie zdążyć.`)
  parts.push(`„${SAVE}” ${i.saveWords}.`, 'Pracować dalej czy zapisać pracę teraz?')
  return { over, windows, resetAt, turnsLeft, question: parts.join(' ') }
}

// ---------- the save (LIMIT_CHECKPOINT E3) ----------

// The resume file is per project (plan, L7): .claude/relai/wznowienie/<slug>.md. The slug is the
// project folder's name in lower case, every run outside [a-z0-9_-] one hyphen, edges trimmed;
// '.', '..' or nothing left → null, no path. core/process/resume.js holds the same rule (parity test).
export const RESUME_DIR = '.claude/relai/wznowienie'
const SLUG = /^[A-Za-z0-9_-]+$/

export function resumeSlug(root: string): string | null {
  const parts = String(root || '').replace(/\\/g, '/').split('/').filter(Boolean)
  const name = parts.length ? parts[parts.length - 1] ?? '' : ''
  if (name === '.' || name === '..') return null
  const slug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return SLUG.test(slug) ? slug : null
}

export function resumePath(root: string): string | null {
  const slug = resumeSlug(root)
  return slug ? `${RESUME_DIR}/${slug}.md` : null
}

// The save's phase: running while Claude saves; "czeka" once the answer ended with the marker
// (the work is saved, the limit's reset is awaited); "przerwany" when the turn ended without it;
// "resuming" from "Wznów pracę" until the resume turn ends (LIMIT_CHECKPOINT E4)
export type SavePhase = 'idle' | 'running' | 'czeka' | 'przerwany' | 'resuming'

// "Wznów pracę" stands on the bar once the blocking window has reset (or its reset is unknown) and
// the resume file is still there; before the reset, or with no file, the bar only waits (E4)
export function resumeDue(phase: SavePhase, resetAt: number | null, now: number, hasFile: boolean): boolean {
  return phase === 'czeka' && hasFile && (resetAt === null || now >= resetAt)
}

// The cache bar's second row for the save, null when it has none
export function saveRowText(phase: SavePhase, resetAt: number | null, now: number, hasFile = false): string | null {
  if (phase === 'running') return 'zapis pracy trwa'
  if (phase === 'przerwany') return 'zapis niepełny'
  if (phase === 'resuming') return 'wznawiam pracę'
  if (phase !== 'czeka') return null
  if (resumeDue(phase, resetAt, now, hasFile)) return resetAt === null ? 'zapis gotowy · reset nieznany' : 'limit odnowiony · praca czeka na wznowienie'
  return resetAt === null ? 'zapis gotowy · reset nieznany' : `zapis gotowy · reset ${whenText(resetAt, now)}`
}
