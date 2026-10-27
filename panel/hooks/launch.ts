// relai-panel: a stage started in a new desktop session (odnoga NOWA_SESJA, N1 and N3). After "Tak"
// the card opens a new session of the Claude app in this project with the stage command ready:
//  - by the app's own start_session when the app offers it (a feature flag, absent on 2026-10-11):
//    the app shows its own consent card and starts the session with the command;
//  - else by the deep link claude://code/new?folder=<cwd>&q=<command>: the app opens the session with
//    the command typed, not sent — the person presses Enter there (measured 2026-10-11).
// The window where "Tak" was pressed keeps its conversation; nothing is sent in the person's name.
//
// No `$` here (P-023 pkt 10): pure functions; register.tsx runs the process or the tool.

import { samePath } from './core/decisions.mjs'
import { titleOf } from './core/session-title.mjs'
import { FOCUS_DIR, parseFocus } from './focus'
import type { FocusTarget } from './focus'

export type Platform = 'win32' | 'darwin' | 'linux'

// The chat a stage starts in: a new desktop session, this one after /clear, or this one as it is
export type ChatMode = 'new' | 'fresh' | 'current'

// The choice the form shows: a new session only where the app draws the pane (the deep link opens
// the desktop app; a terminal or VS Code session would land elsewhere), and the default there
export function chatOf(kept: string, canNew: boolean): ChatMode {
  if (kept === 'fresh' || kept === 'current') return kept
  return canNew ? 'new' : 'fresh'
}

export const START_SERVER = 'ccd_session'
export const START_TOOL = 'start_session'
export const START_TOOL_NAME = `mcp__${START_SERVER}__${START_TOOL}`

// The app's own limit on q is ~14 000 characters (docs); the stage command is far below it
const MAX_Q = 14_000

// The deep link of a new session in `cwd` with `text` typed in its prompt box
export function deepLink(cwd: string, text: string): string {
  if (text.length > MAX_Q) throw new Error(`komenda dłuższa niż ${MAX_Q} znaków`)
  return `claude://code/new?folder=${encodeURIComponent(cwd)}&q=${encodeURIComponent(text)}`
}

// The system from what the engine can tell without a shell: Windows sets OS=Windows_NT in every
// process; elsewhere `uname -s` answers (null when it could not run)
export function platformOf(osEnv: string | undefined, uname: string | null): Platform | null {
  if (osEnv === 'Windows_NT') return 'win32'
  const u = String(uname ?? '').trim()
  if (u === 'Darwin') return 'darwin'
  if (u === 'Linux') return 'linux'
  return null
}

// The argv that hands a URL to the system's own handler, no shell in between: the URL is one
// argument whatever it holds (& and spaces included)
export function openArgv(platform: Platform, url: string): string[] {
  if (platform === 'win32') return ['rundll32', 'url.dll,FileProtocolHandler', url]
  if (platform === 'darwin') return ['open', url]
  return ['xdg-open', url]
}

// Does the session offer the app's start_session? Read from the tool list at session.start
export function hasStartSession(names: readonly string[]): boolean {
  return names.includes(START_TOOL_NAME)
}

// A refusal of $.mcp.call by the auto mode classifier, not by the person (live 2026-10-27, TargiKielce):
// in an auto mode session the engine throws "<plugin>: $.mcp.call(…) refused: The server-side auto mode
// classifier gave no verdict …" — a press asks the app for nothing in words, so the classifier finds no
// request. The person's "no" on the app's card is a result with isError, never this. Closed list of one
// wording (rule 7), the classifier's reason itself — the engine's prefix differs ("refused: " live,
// none in plugin test): any other refusal stays a refusal
const CLASSIFIER_REFUSAL = /\bThe server-side auto mode classifier gave no verdict\b/

export function isClassifierRefusal(message: string): boolean {
  return CLASSIFIER_REFUSAL.test(String(message))
}

// The arguments of start_session (schema of the app 2.31226.1.0): started now at the person's
// "Tak", a fresh context, this project's folder as it is; background is required, 80+ characters.
// The title has the shape the plugin's hook gives a continued session (ZGLOSZENIA E4, #1)
export function startSessionArgs(topic: string, stage: string, text: string, name = ''): Record<string, unknown> {
  return {
    initiation: 'user_asked',
    title: titleOf({ kind: 'plan', plan: topic, stage, name }) ?? `Etap ${stage} planu ${topic}`,
    prompt: text,
    context: 'fresh',
    use_worktree: false,
    background: `Panel RelAI: człowiek potwierdził na karcie start etapu ${stage} planu ${topic} w nowej sesji. `
      + 'Zgoda z karty leży w pliku .claude/relai/zgoda-etapu/ i jest ważna 10 minut; komenda etapu jest w prompcie.',
  }
}

// ---------- the focus handed to the new session (N2) ----------
// /clear keeps the process, so its focus goes in module memory (register.tsx, `carried`); a new
// desktop session is another process, so the focus goes by one file the panel there reads at its
// session.start: valid ten minutes, in this folder, never to the session that wrote it, and once.
// Kept here, not in focus.ts, which relai-progress shares byte for byte (mods-parity test).

export const HANDOFF_PATH = `${FOCUS_DIR}/przekazanie.json`
export const HANDOFF_TTL_MS = 10 * 60_000

// from: every id the writing session goes by (its live id and its module's, which lags after /clear)
export function handoffFile(h: { focus: FocusTarget, from: readonly string[], cwd: string, at: number }): string {
  return JSON.stringify({ focus: h.focus, from: [...h.from], cwd: h.cwd, at: h.at }) + '\n'
}

// The focus a starting session takes from the file, or null
export function handoffOf(text: string | null, w: { now: number, cwd: string, session: string }): FocusTarget | null {
  if (text === null) return null
  try {
    const v = JSON.parse(text) as Record<string, unknown>
    const from = Array.isArray(v.from) ? v.from : [v.from]
    if (v.usedAt !== undefined || from.includes(w.session) || typeof v.cwd !== 'string' || samePath(v.cwd) !== samePath(w.cwd)) return null
    const age = w.now - (typeof v.at === 'number' ? v.at : Number.NaN)
    if (!(age >= 0 && age <= HANDOFF_TTL_MS)) return null
    const f = parseFocus(JSON.stringify({ ...(v.focus as object), source: 'auto', at: 0 }))
    if (f === null || f.kind === 'outside') return null
    return f.kind === 'plan' ? { kind: 'plan', plan: f.plan, stage: f.stage } : { kind: 'branch', card: f.card }
  } catch {
    return null
  }
}

// The file after its one use: the same handoff with the time it was taken
export function usedHandoff(text: string, at: number): string {
  return JSON.stringify({ ...(JSON.parse(text) as object), usedAt: at }) + '\n'
}

// ---------- the command the link typed (live, 2026-10-12) ----------
// The app turns the leading "/" of a deep link's prompt into the fullwidth solidus U+FF0F: the
// person's Enter then sends text, not a command, so no command.run hook sees it (measured: the
// new session's first message began with U+FF0F). The panel's prompt.submit hook recognises that
// text and runs the command itself, with the card's consent from the file.
const LINKED_STAGE = /^[/／](?:relai:)?relai-stage\s+([A-Za-z0-9_-]+)\s+(E\d+)\s*$/

// "TEMAT EN" when the prompt is the stage command a card's link typed (either slash), else null
export function linkedStage(text: string): string | null {
  const m = LINKED_STAGE.exec(String(text).trim())
  return m ? `${m[1]} ${m[2]}` : null
}

// What the panel says after the session opened (UX accepted 2026-10-12)
export function openedWords(text: string, via: 'link' | 'app'): string {
  return via === 'app'
    ? `Aplikacja otwiera nową sesję z ${text} — potwierdź na jej karcie.`
    : `Otwarto nową sesję z ${text} — naciśnij w niej Enter (zgoda ważna 10 min).`
}
