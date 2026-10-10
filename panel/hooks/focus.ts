// What this session works on (AUDYT_MODOW Z12, Aneks A): a plan and its stage, a thread card and
// its packet, or outside any plan. CLAUDE.md names one active plan for every session and every
// tool; a session that runs a thread while the plan goes on in Codex must not draw, count or price
// its work under that plan. The focus belongs to the session: one file a session, under its id,
// which relai-panel writes and relai-progress reads — the same file in both plugins (parity test).
//
// No `$` here (P-023 pkt 10): pure functions over texts the plugins read.

import type { PlanState, Stage } from './core/plan-state.mjs'
import { parseStatus } from './core/plan-state.mjs'
import type { Item, Progress } from './core/progress.mjs'
import { percent } from './core/progress.mjs'

export const FOCUS_DIR = '.claude/relai/fokus'

export type FocusSource = 'auto' | 'manual'
export type Focus =
  | { kind: 'plan', plan: string, stage: string, source: FocusSource, at: number }
  | { kind: 'branch', card: string, source: FocusSource, at: number }
  | { kind: 'outside', source: FocusSource, at: number }
export type FocusTarget =
  | { kind: 'plan', plan: string, stage: string }
  | { kind: 'branch', card: string }

export function focusPath(sessionId: string): string {
  return `${FOCUS_DIR}/${sessionId.replace(/[^\w.-]/g, '_')}.json`
}

export function statusPathOf(plan: string): string {
  return `docs/plany/${plan}/STATUS.md`
}

export function cardPathOf(card: string): string {
  return `docs/fixy/${card}/ODNOGA.md`
}

// The work a prompt starts: the first stage prompt or thread card its text names. Only these three
// shapes count (Aneks A, risk "automat przypisze sesję do złego fokusu"); a path written with
// backslashes counts the same.
const PROMPT_PATTERNS: [RegExp, (m: RegExpExecArray) => FocusTarget][] = [
  [/docs[\\/]plany[\\/]([A-Za-z0-9_-]+)[\\/]PROMPT_ETAP_(\d+)\.md/, (m) => ({ kind: 'plan', plan: m[1] ?? '', stage: `E${m[2] ?? ''}` })],
  [/docs[\\/]fixy[\\/]([A-Za-z0-9_-]+)[\\/](?:PROMPT_ODNOGA|ODNOGA)\.md/, (m) => ({ kind: 'branch', card: m[1] ?? '' })],
]

export function focusOfPrompt(text: string): FocusTarget | null {
  let best: { index: number, target: FocusTarget } | null = null
  for (const [pattern, make] of PROMPT_PATTERNS) {
    const m = pattern.exec(String(text ?? ''))
    if (m && (best === null || m.index < best.index)) best = { index: m.index, target: make(m) }
  }
  return best ? best.target : null
}

export function serializeFocus(f: Focus): string {
  return JSON.stringify(f) + '\n'
}

// A file that does not parse, or names no known kind, is no focus: the session reads as one
// without (Aneks A, edge case "plik fokusu uszkodzony")
export function parseFocus(text: string | null): Focus | null {
  if (text === null) return null
  try {
    const v = JSON.parse(text) as Record<string, unknown>
    const source: FocusSource = v.source === 'manual' ? 'manual' : 'auto'
    const at = typeof v.at === 'number' ? v.at : 0
    if (v.kind === 'plan' && typeof v.plan === 'string' && typeof v.stage === 'string' && v.plan && /^E\d+$/.test(v.stage)) return { kind: 'plan', plan: v.plan, stage: v.stage, source, at }
    if (v.kind === 'branch' && typeof v.card === 'string' && v.card) return { kind: 'branch', card: v.card, source, at }
    if (v.kind === 'outside') return { kind: 'outside', source, at }
    return null
  } catch {
    return null
  }
}

export function isSameWork(a: Focus | FocusTarget | null, b: Focus | FocusTarget | null): boolean {
  if (a === null || b === null) return a === b
  if (a.kind !== b.kind) return false
  if (a.kind === 'plan' && b.kind === 'plan') return a.plan === b.plan && a.stage === b.stage
  if (a.kind === 'branch' && b.kind === 'branch') return a.card === b.card
  return true
}

// ---------- a thread card ----------

export type Packet = { id: string, name: string, isDone: boolean }

// The packets of a card: every "Zn:" box of its "Weryfikacja", in the order they stand there (the
// order the thread runs them); a packet is done when each of its boxes is ticked. Its name is the
// first "**Zn · name**" of the card. A card without such boxes has no packets.
export function cardPackets(cardMd: string): Packet[] {
  const text = String(cardMd ?? '')
  const order: string[] = []
  const open = new Map<string, boolean>()
  for (const m of text.matchAll(/^\s*- \[([ xX])\]\s+(Z\d+)\b/gm)) {
    const id = m[2] ?? ''
    if (!open.has(id)) { order.push(id); open.set(id, false) }
    if (m[1] === ' ') open.set(id, true)
  }
  return order.map((id) => {
    const named = new RegExp(`\\*\\*${id}\\s*·\\s*([^*\\n]+?)\\*\\*`).exec(text)
    return { id, name: named ? (named[1] ?? '').trim() : '', isDone: !open.get(id) }
  })
}

// "Status: **OTWARTA**" on the card's head; null when the card says none
export function cardStatus(cardMd: string): string | null {
  const m = /Status:\s*\*\*([^*]+)\*\*/.exec(String(cardMd ?? ''))
  return m ? (m[1] ?? '').trim() : null
}

export function isCardOpen(cardMd: string): boolean {
  const s = cardStatus(cardMd)
  return s !== null && /^OTWARTA/.test(s)
}

// The packet in progress: the thread moves forward, so the first open one after the last closed
// one; packets left open before it wait for a check (a screenshot), not for work. With none
// closed, or none open after the last closed one, the first open one.
export function packetNow(packets: readonly Packet[]): Packet | null {
  let last = -1
  packets.forEach((p, i) => { if (p.isDone) last = i })
  return packets.slice(last + 1).find((p) => !p.isDone) ?? packets.find((p) => !p.isDone) ?? null
}

// The card drawn as the plan bar draws a plan: its packet now as the stage, the packets as stages
export function branchState(card: string, cardMd: string | null): PlanState {
  const statusPath = cardPathOf(card)
  if (cardMd === null) return { kind: 'unknown', reason: `nie można odczytać ${statusPath}` }
  const packets = cardPackets(cardMd)
  const now = packetNow(packets)
  const stage: Stage | null = now ? { id: now.id, name: now.name, status: 'W TOKU' } : null
  return { kind: 'ok', plan: card, statusPath, planStatus: cardStatus(cardMd), stage, stages: packets.length, closed: packets.filter((p) => p.isDone).length }
}

// The progress bar of a thread: its packets as segments, the one in progress first open one, the
// next under it; null for a card without packets (the bar then names the card alone)
export function branchProgress(cardMd: string | null): Progress | null {
  if (cardMd === null) return null
  const packets = cardPackets(cardMd)
  if (packets.length === 0) return null
  const now = packetNow(packets)
  const items: Item[] = packets.map((p) => ({ id: p.id, label: p.id, name: p.name ? `${p.id} · ${p.name}` : p.id,
    status: p.isDone ? 'done' : p === now ? 'running' : 'pending' }))
  const done = packets.filter((p) => p.isDone).length
  const total = packets.length
  const title = now ? `${now.id}${now.name ? ' · ' + now.name : ''}` : 'wszystkie paczki zamknięte'
  return { kind: 'stage', title, done, total, percent: percent(done, total), items, words: `${done} z ${total} paczek` }
}

// A thread's progress counts packets: the core's Progress has no kind for it, so its words say it
// (branchProgress ends them with " paczek"), and the bar names its unit from them
export function isBranchProgress(p: Progress): boolean {
  return p.kind === 'stage' && / paczek$/.test(p.words)
}

// ---------- a plan the session runs ----------

// The stage the session's prompt named, whatever STATUS.md says of it yet: a stage prompt run
// before its row turns W TOKU is that stage's work
export function focusPlanState(plan: string, stageId: string, statusMd: string | null): PlanState {
  const statusPath = statusPathOf(plan)
  if (statusMd === null) return { kind: 'unknown', reason: `nie można odczytać ${statusPath}` }
  const { planStatus, stages } = parseStatus(statusMd)
  const stage = stages.find((s) => s.id === stageId) ?? { id: stageId, name: '', status: 'W TOKU' }
  const closed = stages.filter((s) => s.status === 'ZREALIZOWANY' || s.status === 'POMINIĘTY').length
  return { kind: 'ok', plan, statusPath, planStatus, stage, stages: stages.length, closed }
}

// The stage a stage prompt runs is counted as in progress, whatever its row says yet: the session
// runs it, its boxes are the progress (the plan bar still draws the row's own status)
export function countedOf(focus: Focus | null, plan: PlanState): PlanState {
  if (focus?.kind !== 'plan' || plan.kind !== 'ok' || !plan.stage) return plan
  return { ...plan, stage: { ...plan.stage, status: 'W TOKU' } }
}

// The tool a plan's stages run in, from its STATUS.md head ("model wykonawczy etapów: **gpt-6.1-sol
// w Codeksie**"): another tool than Claude Code, or null for Claude Code and for a plan that says none
export function executorTool(statusMd: string | null): string | null {
  const head = String(statusMd ?? '').split(/\r?\n/).find((l) => /model wykonawczy/i.test(l)) ?? ''
  if (/Codeks|Codex/i.test(head)) return 'Codex'
  if (/Cursor/i.test(head)) return 'Cursor'
  return null
}

// ---------- what the bars draw and the measurements say ----------

// The work of the session as the bars draw it: the plan state of its focus, the unit of its count,
// a quiet mention of the active plan when it is another one, the tag its measurements carry, and
// how the panel names it in "Teraz"
export type Work = {
  plan: PlanState
  unit: 'etapów' | 'paczek'
  mention: string | null
  tag: string | null
  label: string
  focus: Focus | null
  isAsking: boolean
}

export type WorkInput = {
  focus: Focus | null
  active: PlanState
  activeTool: string | null
  focusText: string | null
}

export function workOf(w: WorkInput): Work {
  const { focus, active, activeTool, focusText } = w
  const activeName = active.kind === 'ok' ? active.plan : null
  const mentionOf = (own: string | null) => (activeName && activeName !== own ? `aktywny plan: ${activeName}${activeTool ? ` (${activeTool})` : ''}` : null)
  const activeTag = active.kind === 'ok' && active.stage && active.stage.status === 'W TOKU' ? `${active.plan}/${active.stage.id}` : null
  if (focus?.kind === 'branch') {
    // A card closed, or gone (archived, moved): the focus ends there and the session asks again
    // (Aneks A, edge case "karta odnogi zamknięta albo przeniesiona do archiwum")
    if (focusText === null || !isCardOpen(focusText)) {
      const why = focusText === null ? 'nie ma karty' : 'zamknięta'
      return { plan: { kind: 'none' }, unit: 'paczek', mention: mentionOf(null), tag: null, label: `odnoga ${focus.card} ${why} — wybierz`, focus, isAsking: true }
    }
    const plan = branchState(focus.card, focusText)
    const tag = plan.kind === 'ok' && plan.stage ? `${focus.card}/${plan.stage.id}` : focus.card
    const label = plan.kind === 'ok' && plan.stage ? `${focus.card} · ${plan.stage.id} (odnoga)` : `${focus.card} (odnoga)`
    return { plan, unit: 'paczek', mention: mentionOf(focus.card), tag, label, focus, isAsking: false }
  }
  if (focus?.kind === 'plan') {
    const plan = focusPlanState(focus.plan, focus.stage, focusText)
    return { plan, unit: 'etapów', mention: mentionOf(focus.plan), tag: `${focus.plan}/${focus.stage}`, label: `${focus.plan} · ${focus.stage}`, focus, isAsking: false }
  }
  if (focus?.kind === 'outside') {
    return { plan: { kind: 'none' }, unit: 'etapów', mention: mentionOf(null), tag: null, label: 'poza planem', focus, isAsking: false }
  }
  // No focus: the active plan as before, unless its stages run in another tool — then this
  // session's work is outside it, and the panel asks what it is
  if (activeTool) {
    return { plan: { kind: 'none' }, unit: 'etapów', mention: mentionOf(null), tag: null, label: 'nie wybrano', focus: null, isAsking: true }
  }
  const label = active.kind === 'ok' ? `${active.plan}${active.stage ? ` · ${active.stage.id}` : ''}` : 'brak aktywnego planu'
  return { plan: active, unit: 'etapów', mention: null, tag: activeTag, label, focus: null, isAsking: false }
}
