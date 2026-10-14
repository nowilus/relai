// relai-cache-keeper: watches this session's prompt cache, keeps a big cache warm on request,
// asks before a cold send of a big context, and hands work off to a fresh chat
// (natively through the project documents in a RelAI project).
//
// Why: every request re-reads the whole context. From the cache that costs a fraction of
// input; once the cache expires (1 hour idle on a subscription, 5 minutes on the default
// API TTL) the next message writes the whole context again at 1.25x-2x input.

import type { EngineInterface, Register } from 'claude-code'
import { DEFAULT_SETTINGS, MAX_PAYBACK_TURNS, MIN, RELAI_MARKER, applySetting, cacheState, dueWarning, judgeStep, mergeSettings, msLeft, pingDue, pingMissed, type Settings } from './core'
import { basename, clip, clock, fileStamp, limitsText, minutes, tokens, usd } from './fmt'
import { barCard } from './bar-card'
import { BAND, BAR, CHIP } from './relai/theme.mjs'
import { batteryRows, cacheMeasure, contextMeasure, glyphColor, limitMeasure, measureGlyph, resetMeasure, type Limit, type Measure } from './rings'
import { ancestors, parseStatus } from './relai/plan-state.mjs'
import { PLAIN_HANDOFF_PROMPT, RELAI_CONTINUE, RELAI_HANDOFF_PROMPT, continuePrompt, plainBody, relaiDiscardPrompt, relaiDone, relaiFreshPrompt, relaiResumePrompt, relaiSavePrompt, saveDone } from './handoff'
import { PRICE_FILE } from './relai/pricing.mjs'
import { BUILT_IN, priceSource, pricesFrom, ratesFor, requestCost, rewriteCost, totalInput, type Prices, type Usage } from './pricing'
import { handoffEconomics, limitPace, type BarSegment, type CacheTemp, type HandoffInput, type HandoffVerdict, type LimitTurn } from './economics'
import { RITUAL_FILES, activePlanStatus, dateText, estimatedLayer, measuredLayer, startKey, type MeasuredStart } from './start-layer'
import {
  CARD_OPTIONS, DEFAULTS, GO_ON, MUTE, NO_SCOPE, SAVE, SCOPE_OPTIONS, THRESHOLD_CHOICES, THRESHOLD_HEADER, WINDOW_NAME, WINDOW_OF, cardDue, focusDocPath, focusFilePath, focusRef,
  focusStatus, isWorkGoing, limitWarnWindow, nextSessionThreshold, rememberThreshold, resumeDue, resumePath, saveRowText, thresholdAnswer, thresholdText,
  thresholdsOf, type CardInput, type LimitIO, type LimitWindow, type SavePhase, type Thresholds,
} from './limit'

type $T = EngineInterface

const TICK_MS = 30_000
const STORE_SETTINGS = 'settings'
const FIVE_HOUR = 'five_hour'
const SEVEN_DAY = 'seven_day'
const KEEP_TURNS = 5 // the mean output and the 5-hour pace come from this many recent main turns
// "Zostań" holds until the context grows by a fifth: ctx · 5 ≥ dismissed · 6, in integers
const STAY_GROWTH = { num: 6, den: 5 }

type Session = {
  id: string
  cwd: string
  model: string
  isRelai: boolean
  lastActivity: number // last main-loop request or ping that touched the cache
  ctx: number
  ctxWindow: number // the model's context window, tokens; 0 = not reported yet
  ttlMeasured: 0 | 5 | 60
  costUsd: number | null
  rateLimits: Limit[]
  working: boolean
  turnId: string
  keepWarm: boolean
  keepWarmUntil: number
  pings: number
  pingUsd: number
  rewrites: number
  rewriteUsd: number
  announcedFor: number // lastActivity the warnings below belong to
  announced: number[]
  justCompacted: boolean
  shortTtlRewrites: number // rewrites that look like a 5-minute TTL; one alone proves nothing
  // The handoff reckoning (Z9), kept here so a hot reload restores it with the snapshot (P-023 pkt 6)
  start: number // S, tokens of the project's start layer; 0 = unknown
  startSource: string // where S came from, in words
  startPending: boolean // a fresh conversation: its first main turn measures S
  turnOut: number // output tokens of the running main turn's steps
  outputs: number[] // output tokens of the last main turns
  limitBase: number // the 5-hour window's percentUsed at the previous main turn; -1 = none yet
  limitTurns: LimitTurn[] // the 5-hour pace of the last main turns
  stayCtx: number // "Zostań" pressed at this context; 0 = not dismissed
  // The limit card (LIMIT_CHECKPOINT E2), here so a hot reload keeps it with the snapshot
  limitAsked: { five: number, week: number } // per window, the threshold the last card came at; 0 = none yet
  limitMuted: boolean // "Nie pytaj w tej sesji"
  limitFirstDone: boolean // the first card's threshold and scope questions were asked
}

type Handoff = { phase: 'idle' | 'running' | 'ready' | 'continuing'; notTurn: string; relai: boolean; body: string; path: string }

const FRESH: Session = {
  id: '', cwd: '', model: '', isRelai: false, lastActivity: 0, ctx: 0, ctxWindow: 0, ttlMeasured: 0, costUsd: null, rateLimits: [],
  working: false, turnId: '', keepWarm: false, keepWarmUntil: 0, pings: 0, pingUsd: 0, rewrites: 0, rewriteUsd: 0,
  announcedFor: 0, announced: [], justCompacted: false, shortTtlRewrites: 0,
  start: 0, startSource: '', startPending: false, turnOut: 0, outputs: [], limitBase: -1, limitTurns: [], stayCtx: 0,
  limitAsked: { five: 0, week: 0 }, limitMuted: false, limitFirstDone: false,
}
const IDLE: Handoff = { phase: 'idle', notTurn: '', relai: false, body: '', path: '' }

// The save from the limit card (LIMIT_CHECKPOINT E3). Kept per project in the store, not in the
// conversation's snapshot: "czeka" outlives a reload and a /clear (plan, section 8).
// sessionId and startedAt belong to "running": only the conversation that asked takes the answer.
type Save = { phase: SavePhase; notTurn: string; relai: boolean; resetAt: number | null; path: string; sessionId: string; startedAt: number }
const NO_SAVE: Save = { phase: 'idle', notTurn: '', relai: false, resetAt: null, path: '', sessionId: '', startedAt: 0 }
const SAVE_PHASES: readonly SavePhase[] = ['idle', 'running', 'czeka', 'przerwany', 'resuming']
const SAVE_STALE_MS = 30 * MIN // a save still "running" this long after it was sent lost its turn

// Module state is replaced, never mutated in place; a hot reload restores it from the store
let S: Session = FRESH
let H: Handoff = IDLE
let V: Save = NO_SAVE
let settings: Settings = DEFAULT_SETTINGS
let home = ''
let names = { cache: 'cache', keepwarm: 'keepwarm', handoff: 'handoff' }
let pinging = false // one fork at a time, however long it takes
let skipPingUntil = 0 // after a reload the turn state is unknown for one tick
let prices: Prices = BUILT_IN // the core's list laid over by the project's cennik.json (Z5)
// The limit batteries warn from here, each window from its own (LIMIT_CHECKPOINT E1, Aneks C)
let thresholds: Thresholds = { five: { value: DEFAULTS.five, source: 'domyślny' }, week: { value: DEFAULTS.week, source: 'domyślny' } }
let hasResumeFile = false // the save's resume file (or, outside RelAI, its handoff file) is still there (E4)

const set = (patch: Partial<Session>) => { S = { ...S, ...patch } }
const rewriteAt = (tokens: number) => rewriteCost(tokens, S.model, ttl(), prices)
const setH = (patch: Partial<Handoff>) => { H = { ...H, ...patch } }
const ttl = () => settings.ttlMin || S.ttlMeasured || 60
const ttlAssumed = () => !settings.ttlMin && !S.ttlMeasured
const snapKey = () => 'snap:' + S.id
const state = (now: number) => cacheState(S.lastActivity, ttl(), now, S.keepWarm, settings.warnMin)
const later = ($: $T, fn: () => Promise<unknown>) => $.clock.after(50, () => { fn().catch(() => {}) })

// Saved when the state changed (AUDYT_MODOW Z4), not at every tick; and at least once within
// SNAP_FRESH_MS, so restoreSnap's two-hour guard keeps accepting the snapshot of an idle session
const SNAP_FRESH_MS = 60 * MIN
let savedSnap = ''
let savedAt = 0

async function saveSnap($: $T, now: number) {
  if (!S.id) return
  const snap = { ...S, handoff: H.phase === 'continuing' ? IDLE : H }
  const text = JSON.stringify([snapKey(), snap])
  if (text === savedSnap && now - savedAt < SNAP_FRESH_MS) return
  await $.store.set(snapKey(), { ...snap, savedAt: now })
  savedSnap = text
  savedAt = now
}

async function restoreSnap($: $T, now: number) {
  const snap = (await $.store.get(snapKey())) as (Session & { savedAt: number; handoff?: Handoff }) | undefined
  if (snap && snap.id === S.id && now - snap.savedAt < 2 * 60 * MIN) {
    const { savedAt: _saved, handoff, ...rest } = snap
    set({ ...rest, cwd: S.cwd, model: S.model || snap.model, isRelai: S.isRelai, working: false })
    H = handoff ?? IDLE
    skipPingUntil = now + TICK_MS
  }
}

// The project root: the nearest folder, from the session's cwd upwards, whose docs/USTAWIENIA.md
// carries the RelAI marker; the cwd follows every cd the model's shell makes (E9, P-021)
async function relaiRoot($: $T, cwd: string): Promise<string | null> {
  for (const dir of ancestors(cwd)) if (await detectRelai($, dir)) return dir
  return null
}

async function detectRelai($: $T, cwd: string): Promise<boolean> {
  const path = `${cwd}/docs/USTAWIENIA.md`.replace(/\\/g, '/')
  try {
    return (await $.fs.exists(path)) && RELAI_MARKER.test(await $.fs.read(path))
  } catch {
    return false
  }
}

// The project's saved price list (Z5), read from the project root at session.start and on /cache;
// outside a RelAI project, without the file or when it cannot be read: the built-in list
async function loadPrices($: $T) {
  if (!S.isRelai || !S.cwd) {
    prices = BUILT_IN
    return
  }
  const path = `${S.cwd}/${PRICE_FILE}`.replace(/\\/g, '/')
  const text = await $.fs.exists(path).then((isThere) => (isThere ? $.fs.read(path) : null)).catch(() => null)
  prices = pricesFrom(text)
}

// The threshold's files through the engine: a missing file reads as null; a file there that
// cannot be read rejects, so the caller keeps what it had instead of falling back to a default
// (an editor or a sync tool holding the file for a moment must not turn the battery's colour)
const limitIO = ($: $T): LimitIO => ({
  read: async (path) => ((await $.fs.exists(path)) ? String(await $.fs.read(path)) : null),
  write: (path, text) => $.fs.write(path, text),
})
const limitWhere = () => ({ root: S.cwd, home, sessionId: S.id })

// Read at session.start, on /cache, on session.measure and at every tick: a row edited by hand or
// a threshold the panel changed counts from the next tick on
async function loadThreshold($: $T) {
  thresholds = await thresholdsOf(limitIO($), limitWhere()).catch(() => thresholds)
}

// A /clear ends the conversation the state measured; the process goes on under a new id and no
// session.start fires (P-020 point 4). FRESH under that id, keeping what belongs to the process;
// a handoff clearing on purpose goes on. A kept cache stops: it belonged to the old conversation.
// The project's start layer stays; a /clear (isFresh) has an empty conversation, so its first
// main turn measures S again (Z9); a /resume does not.
function resetSession($: $T, id: string, isFresh: boolean) {
  stopKeepWarm($, 'nowa rozmowa')
  S = { ...FRESH, id, cwd: S.cwd, model: S.model, isRelai: S.isRelai, rateLimits: S.rateLimits, ctxWindow: S.ctxWindow, start: S.start, startSource: S.startSource, startPending: isFresh }
  if (H.phase !== 'continuing') H = IDLE
  // A save still running belonged to the ended conversation: its answer will not come
  if (V.phase === 'running') later($, () => keepSave($, { ...V, phase: 'przerwany' }))
  verdict = null
  $.ui.invalidate('ui.render')
}

// The guard where the state is used: an id that changed under the keeper (a /clear session.end
// did not report, a /resume) resets it before anything reads the old conversation's figures
async function followSession($: $T) {
  const id = await $.session.id().catch(() => '')
  if (!id || id === S.id) return
  if (!S.id) {
    set({ id })
    return
  }
  resetSession($, id, false)
  await loadThreshold($) // the threshold file is per session: the old one's raised value goes with it
}

// ---------- the handoff reckoning (Z9) ----------

// S for this project: what a fresh session's first turn measured (the store, per project root),
// else in a RelAI project the ritual files' bytes ÷ 4; read once at session.start
async function loadStartLayer($: $T) {
  const saved = (await $.store.get(startKey(S.cwd)).catch(() => undefined)) as MeasuredStart | undefined
  if (saved && Number(saved.tokens) > 0) {
    const layer = measuredLayer(saved)
    return set({ start: layer.tokens, startSource: layer.source })
  }
  if (!S.isRelai || !S.cwd) return set({ start: 0, startSource: '' })
  const read = async (rel: string) => {
    const path = `${S.cwd}/${rel}`.replace(/\\/g, '/')
    return $.fs.exists(path).then((isThere) => (isThere ? $.fs.read(path) : null)).catch(() => null)
  }
  const files: { path: string; text: string | null }[] = []
  for (const path of RITUAL_FILES) files.push({ path, text: await read(path) })
  const plan = activePlanStatus(files[0]?.text ?? '')
  if (plan) files.push({ path: plan, text: await read(plan) })
  const layer = estimatedLayer(files)
  set(layer ? { start: layer.tokens, startSource: layer.source } : { start: 0, startSource: '' })
}

// The first main turn of a fresh conversation (for a RelAI project: the start ritual) is S
async function measureStart($: $T, now: number, isAnswer: boolean) {
  if (!S.startPending) return
  set({ startPending: false })
  if (!isAnswer || !(S.ctx > 0)) return
  const measured: MeasuredStart = { tokens: S.ctx, date: dateText(now) }
  await $.store.set(startKey(S.cwd), measured).catch(() => {})
  const layer = measuredLayer(measured)
  set({ start: layer.tokens, startSource: layer.source })
}

// A main turn ended: its output, and the 5-hour window's move since the previous one against
// this turn's context (so the forecast after a handoff is the pace × S / ctx); a reset window
// (a negative move) only sets the new base
function recordTurn() {
  if (S.turnOut <= 0) return
  const outputs = [...S.outputs, S.turnOut].slice(-KEEP_TURNS)
  const five = S.rateLimits.find((l) => l.kind === FIVE_HOUR)
  if (!five) return set({ outputs, turnOut: 0 })
  const move = five.percentUsed - S.limitBase
  const limitTurns = S.limitBase >= 0 && move >= 0 && S.ctx > 0 ? [...S.limitTurns, { percent: move, tokens: S.ctx }].slice(-KEEP_TURNS) : S.limitTurns
  set({ outputs, turnOut: 0, limitTurns, limitBase: five.percentUsed })
}

const cacheTemp = (kind: string): CacheTemp => (kind === 'unknown' ? 'unknown' : kind === 'cold' ? 'cold' : 'warm')

function economicsInput(now: number): HandoffInput {
  const k = ratesFor(S.model, ttl(), S.ctx, prices)
  return {
    ctx: S.ctx > 0 ? S.ctx : null,
    start: S.start > 0 ? S.start : null,
    startSource: S.startSource,
    cache: cacheTemp(state(now).kind),
    ttlMin: ttl(),
    ttlMeasured: !settings.ttlMin && S.ttlMeasured !== 0,
    rates: { read: k?.read ?? null, write: k?.write ?? null, output: k?.output ?? null },
    meanOutput: S.outputs.length ? S.outputs.reduce((a, b) => a + b, 0) / S.outputs.length : null,
    limitTurns: S.limitTurns,
    threshold: settings.paybackTurns,
  }
}

// Reckoned on a main turn's end, on session.measure, on /cache and when the tick sees the cache
// state change; a cheap pure call
let verdict: HandoffVerdict | null = null
let reckonedKind = ''
function reckon(now: number): HandoffVerdict {
  verdict = handoffEconomics(economicsInput(now))
  reckonedKind = state(now).kind
  return verdict
}

// The cache bar's second row, '' when none: a handoff pays off, none is under way, and "Zostań"
// was not pressed at about this context (it holds until ctx grows 20 %; a cold cache moves no
// verdict since KOMUNIKAT_ZWROTU, so it no longer brings the row back)
function eventText(now: number): string {
  const v = verdict ?? reckon(now)
  if (v.kind !== 'handoff' || H.phase !== 'idle') return ''
  const isDismissed = S.stayCtx > 0 && S.ctx * STAY_GROWTH.den < S.stayCtx * STAY_GROWTH.num
  return isDismissed ? '' : v.bar
}

async function registerCommand($: $T, name: string, description: string, argumentHint: string): Promise<string> {
  for (const candidate of [name, 'ckp-' + name]) {
    try {
      await $.command.register({ name: candidate, description, argumentHint })
      return candidate
    } catch {
      // taken by another plugin: try the prefixed name
    }
  }
  return name
}

// ---------- keep-warm ----------

// Refuses a cache already past its TTL: a ping there rewrites the whole context
function startKeepWarm($: $T, now: number, hours: number): string {
  const left = msLeft(S.lastActivity, ttl(), now)
  if (left === null) return 'Nie ma jeszcze czego podtrzymywać — w tej sesji nie było zapytania.'
  if (left <= 0) return `Cache prawdopodobnie już wygasł (${minutes(-left)} temu) — ping zapisałby cały kontekst ponownie. Nie włączam.`
  set({ keepWarm: true, keepWarmUntil: now + hours * 60 * MIN })
  const assumed = ttlAssumed() ? ' Uwaga: TTL 60 min jest założony, nie zmierzony — przy krótszym TTL ping przyjdzie za późno (/cache ttl 5).' : ''
  const text = `Podtrzymuję cache do ${clock(S.keepWarmUntil)}. Ping odczyta cache tuż przed wygaśnięciem.${assumed}`
  $.ui.toast(text, { timeoutMs: assumed ? 15_000 : 8000 })
  return text
}

function stopKeepWarm($: $T, why: string) {
  if (!S.keepWarm) return
  set({ keepWarm: false })
  $.ui.toast(`Podtrzymanie wyłączone (${why}). Pingi: ${S.pings}, ${usd(S.pingUsd)}.`, { timeoutMs: 10_000 })
}

async function keepWarmStep($: $T, now: number) {
  if (!S.keepWarm) return
  if (now >= S.keepWarmUntil) return stopKeepWarm($, 'minął limit czasu')
  const top = S.rateLimits.find((l) => l.percentUsed >= settings.maxLimitPercent)
  if (top) return stopKeepWarm($, `limit planu ${limitsText([top])} ≥ ${settings.maxLimitPercent}%`)
  if (pinging || S.working || now < skipPingUntil || !pingDue(now, S.lastActivity, ttl())) return
  pinging = true
  try {
    // Limits may have moved while the session idled: read them fresh before paying for a ping
    const usage = await $.session.usage().catch(() => null)
    if (usage?.rateLimits?.length) set({ rateLimits: usage.rateLimits })
    const fresh = S.rateLimits.find((l) => l.percentUsed >= settings.maxLimitPercent)
    if (fresh) return stopKeepWarm($, `limit planu ${limitsText([fresh])} ≥ ${settings.maxLimitPercent}%`)
    const reply = await $.model.fork({ prompt: 'relai-cache-keeper keep-alive ping. Reply with only: ok' }).catch(() => null)
    if (!reply || !reply.isAnswered || !reply.usage) return stopKeepWarm($, 'ping bez odpowiedzi, cache mógł już wygasnąć')
    const u = reply.usage as Usage
    set({ pings: S.pings + 1, pingUsd: S.pingUsd + (requestCost(u, S.model, ttl(), prices) ?? 0) })
    if (pingMissed(u)) return stopKeepWarm($, `ping zapisał ${tokens(u.cache_creation_input_tokens || 0)} tokenów zamiast odczytać cache`)
    set({ lastActivity: await $.clock.now() })
  } finally {
    pinging = false
  }
}

// ---------- warnings ----------

function warnStep($: $T, now: number) {
  if (!settings.alerts || S.keepWarm || S.ctx < settings.alertTokens) return
  const left = msLeft(S.lastActivity, ttl(), now)
  if (left === null) return
  const announced = S.announcedFor === S.lastActivity ? S.announced : []
  const due = dueWarning(left, settings.warnMin, announced)
  if (due === null) return
  set({ announcedFor: S.lastActivity, announced: [...announced, ...settings.warnMin.filter((m) => m >= due)] })
  const assumed = ttlAssumed() ? ' (TTL założony, nie zmierzony)' : ''
  $.ui.toast(
    `Cache ${tokens(S.ctx)} tokenów wygaśnie za ~${minutes(left)}${assumed}. Ponowny zapis ≈ ${usd(rewriteAt(S.ctx))}. /${names.keepwarm} albo przycisk „Podtrzymaj” na pasku podtrzyma go.`,
    { timeoutMs: 15_000 },
  )
}

// The words the band shows are its stamp (bandView: the five batteries' words and fills, the
// session's cost on the right, the one second row). The tick redraws only when they
// changed (Z4) — the countdown's minute, a cost or a limit that session.measure moved — never the
// same words again.
let drawnStamp = ''
const bandStamp = (now: number) => JSON.stringify(bandView(now))

// ---------- the footer line, withdrawn (SPLIT_VIEW) ----------
// 0.7.0–0.8.0 set a status line in every split panel while the app drew the bars only in the
// first one (P-040). Every panel draws the bars now (measured 2026-10-14), so the line is gone; a
// line set by an older version outlives a reload (P-040 point 6), so it is cleared once.
let statusCleared = false
function clearOldStatus($: $T) {
  if (statusCleared) return
  statusCleared = true
  $.ui.status(undefined)
}

async function tick($: $T) {
  await followSession($)
  const now = await $.clock.now()
  await keepWarmStep($, now)
  warnStep($, now)
  await loadThreshold($)
  await checkResumeFile($)
  if (state(now).kind !== reckonedKind) reckon(now)
  await saveSnap($, now)
  clearOldStatus($)
  const stamp = bandStamp(now)
  if (stamp === drawnStamp) return
  drawnStamp = stamp
  $.ui.invalidate('ui.render')
}

// ---------- handoff ----------

async function startHandoff($: $T) {
  if (V.phase === 'running') {
    $.ui.toast('Trwa zapis pracy — przekazanie po jego zakończeniu.')
    return
  }
  if (H.phase !== 'idle') {
    $.ui.toast(H.phase === 'ready' ? `Przekazanie gotowe: /${names.handoff} dalej albo klawisz c na pasku.` : 'Przekazanie już trwa.')
    return
  }
  H = { ...IDLE, phase: 'running', relai: S.isRelai, notTurn: S.working ? S.turnId : '' }
  $.ui.invalidate('ui.render')
  $.ui.toast(S.isRelai ? 'Przekazanie RelAI: synchronizacja dokumentów projektu, potem świeży czat.' : 'Przekazanie: Claude spisze stan sesji, potem świeży czat.')
  try {
    await $.prompt.submit({ text: H.relai ? RELAI_HANDOFF_PROMPT : PLAIN_HANDOFF_PROMPT, asUser: true })
  } catch (err) {
    H = IDLE
    $.ui.invalidate('ui.render')
    $.ui.toast('Nie udało się wysłać promptu przekazania: ' + clip(String((err as Error)?.message || err), 100), { timeoutMs: 10_000 })
  }
}

async function captureHandoff($: $T, answer: string, now: number) {
  if (H.relai) {
    if (!relaiDone(answer)) {
      H = IDLE
      $.ui.toast('Synchronizacja dokumentów nie potwierdziła zakończenia — czat zostaje bez zmian.', { timeoutMs: 10_000 })
      return
    }
    setH({ phase: 'ready' })
  } else {
    const body = plainBody(answer)
    if (!body) {
      H = IDLE
      $.ui.toast('Tura zakończyła się bez przekazania — nic nie zapisano.', { timeoutMs: 10_000 })
      return
    }
    const saved = await writeHandoff($, body, now)
    setH({ phase: 'ready', body, path: saved })
  }
  $.ui.invalidate('ui.render')
  $.clock.after(300, () => { offerContinue($).catch(() => {}) })
}

// The general handoff's file; its name comes from the clock and the folder, never from the answer.
// '' when it could not be written.
async function writeHandoff($: $T, body: string, now: number): Promise<string> {
  const path = `${home || '.'}/.claude/mods-data/relai-cache-keeper/handoffs/${fileStamp(now)}-${basename(S.cwd).replace(/[^A-Za-z0-9-]+/g, '-')}.md`.replace(/\\/g, '/')
  return $.fs.write(path, body + '\n').then(() => path, () => '')
}

async function offerContinue($: $T) {
  const answer = await $.ui.ask('Przekazanie gotowe. Wyczyścić ten czat i kontynuować w świeżym kontekście?', ['Wyczyść i kontynuuj', 'Zostań w tym czacie']).catch(() => '')
  if (answer === 'Wyczyść i kontynuuj') await clearAndContinue($)
}

// True when the chat was cleared and the first prompt went (or waits in the composer)
async function clearAndContinue($: $T, text?: string): Promise<boolean> {
  const first = text ?? (H.relai ? RELAI_CONTINUE : continuePrompt(H.body, H.path))
  if (S.working) {
    $.ui.toast('Claude jeszcze pracuje — wyczyść i kontynuuj po zakończeniu tury.', { timeoutMs: 8000 })
    return false
  }
  setH({ phase: 'continuing' })
  $.ui.invalidate('ui.render')
  try {
    await $.command.run({ command: 'clear', args: '' })
  } catch (err) {
    setH({ phase: text ? 'idle' : 'ready' })
    $.ui.toast('Nie udało się uruchomić /clear: ' + clip(String((err as Error)?.message || err), 100), { timeoutMs: 10_000 })
    return false
  }
  H = IDLE
  let isSent = true
  try {
    await $.prompt.submit({ text: first, asUser: true })
  } catch {
    isSent = await $.prompt.fill({ text: first }).then((r) => !!r.isFilled, () => false)
    $.ui.toast(isSent ? 'Czat wyczyszczony. Pierwszy prompt czeka w polu — naciśnij Enter.' : 'Czat wyczyszczony, ale pierwszego promptu nie udało się wysłać.', { timeoutMs: 10_000 })
  }
  $.ui.invalidate('ui.render')
  return isSent
}

// ---------- the save (LIMIT_CHECKPOINT E3) ----------

const saveKey = () => 'save:' + S.cwd

async function keepSave($: $T, next: Save) {
  V = next
  if (V.phase !== 'czeka') hasResumeFile = false // only a waiting save offers the resume
  await $.store.set(saveKey(), V).catch(() => {})
  $.ui.invalidate('ui.render')
}

// A stored save of an unknown shape is no save. A "running" one that another conversation sent,
// or that waited past SAVE_STALE_MS, lost its turn: it reads as cut short, never as running forever.
async function loadSave($: $T, now: number) {
  const v = (await $.store.get(saveKey()).catch(() => undefined)) as Save | undefined
  V = v && SAVE_PHASES.includes(v.phase) ? { ...NO_SAVE, ...v } : NO_SAVE
  if (V.phase === 'running' && (V.sessionId !== S.id || now - V.startedAt > SAVE_STALE_MS)) await keepSave($, { ...V, phase: 'przerwany' })
  // A resume whose turn this process never saw end (a reload, a crash): back to waiting, the file decides
  if (V.phase === 'resuming' && now - V.startedAt > SAVE_STALE_MS) await keepSave($, { ...V, phase: 'czeka' })
}

// In a RelAI project the phrase of relai-core's limit-checkpoint.md with the card's consent to a
// local commit; elsewhere (or a folder name that gives no resume path) the general handoff
async function startSave($: $T, resetAt: number | null) {
  if (V.phase === 'running' || H.phase !== 'idle') {
    $.ui.toast(V.phase === 'running' ? 'Zapis pracy już trwa.' : 'Najpierw zakończ przekazanie — zapis pracy poczeka.')
    return
  }
  const before = V
  const path = S.isRelai ? resumePath(S.cwd) : null
  await keepSave($, { ...NO_SAVE, phase: 'running', relai: path !== null, resetAt, notTurn: S.working ? S.turnId : '', sessionId: S.id, startedAt: await $.clock.now() })
  $.ui.toast(path ? 'Zapis pracy: testy, commit lokalny, dokumenty i plik wznowienia.' : 'Zapis pracy: Claude spisze przekazanie sesji do pliku.')
  try {
    await $.prompt.submit({ text: path ? relaiSavePrompt(path) : PLAIN_HANDOFF_PROMPT, asUser: true })
  } catch (err) {
    await keepSave($, before)
    $.ui.toast('Nie udało się wysłać prośby o zapis pracy: ' + clip(String((err as Error)?.message || err), 100), { timeoutMs: 10_000 })
  }
}

// The save's turn ended: its marker (RelAI) or a handoff body (elsewhere) means "czeka";
// anything else, a cut-off turn among them, means "przerwany"
async function captureSave($: $T, answer: string, now: number) {
  if (V.relai) {
    const isDone = saveDone(answer)
    await keepSave($, { ...V, phase: isDone ? 'czeka' : 'przerwany' })
    await checkResumeFile($)
    if (!isDone) $.ui.toast('Zapis pracy nie potwierdził zakończenia — sprawdź commit i dokumenty.', { timeoutMs: 10_000 })
    return
  }
  const body = plainBody(answer)
  const path = body ? await writeHandoff($, body, now) : ''
  await keepSave($, { ...V, phase: path ? 'czeka' : 'przerwany', path })
  await checkResumeFile($)
  if (!path) $.ui.toast('Tura zakończyła się bez przekazania — zapis niepełny.', { timeoutMs: 10_000 })
}

// ---------- the resume (LIMIT_CHECKPOINT E4) ----------

// The file "Wznów pracę" resumes from: in RelAI the project's resume file, elsewhere the handoff
// file the save wrote. Paths come from the folder's slug or the clock, never from an answer.
const resumeFile = (): string | null => {
  if (!V.relai) return V.path || null
  const rel = resumePath(S.cwd)
  return rel ? `${S.cwd}/${rel}`.replace(/\\/g, '/') : null
}

// An error keeps what the bar shows: the next tick asks again. The file is the save: once it is
// gone (resumed by hand and deleted, deleted on request, never written) nothing waits any more.
async function checkResumeFile($: $T) {
  const file = V.phase === 'czeka' ? resumeFile() : null
  const isThere = file ? await $.fs.exists(file).catch(() => null) : false
  if (isThere === null) return
  if (file && !isThere) return keepSave($, NO_SAVE)
  if (isThere !== hasResumeFile) {
    hasResumeFile = isThere
    $.ui.invalidate('ui.render')
  }
}

// "Wznów pracę": a card, then a fresh chat that starts from the resume file. In RelAI the phrase
// carries the card's consent to delete the file once the work is resumed; elsewhere the handoff's
// text goes as the first prompt. The phase ends when that turn does.
// One resume card at a time: a second press while it waits opens nothing
let resumeAsking = false
// After the card: nothing else may have started meanwhile (a handoff, a turn, another conversation)
const canAct = (id: string) => S.id === id && V.phase === 'czeka' && H.phase === 'idle' && !S.working

async function resumeWork($: $T) {
  if (V.phase !== 'czeka' || resumeAsking) return
  resumeAsking = true
  try {
    await resumeAfterCard($)
  } finally {
    resumeAsking = false
  }
}

async function resumeAfterCard($: $T) {
  const file = resumeFile()
  const rel = V.relai ? resumePath(S.cwd) : null
  if (!file || (V.relai && !rel)) return
  const id = S.id
  const question = V.relai
    ? `Wznowić pracę? Wyczyszczę ten czat i wyślę „${RELAI_CONTINUE} — plik wznowienia: ${rel}”. Claude zacznie od listy „Co dalej”, a po wznowieniu skasuje plik.`
    : `Wznowić pracę? Wyczyszczę ten czat i wyślę przekazanie zapisane w ${file}.`
  const answer = await $.ui.ask(question, { header: 'Wznów pracę', options: ['Wznów', 'Nie teraz'] }).catch(() => '')
  if (answer !== 'Wznów') return
  if (!canAct(id)) {
    $.ui.toast('W międzyczasie coś się zaczęło — wznów pracę, gdy czat będzie wolny.', { timeoutMs: 8000 })
    return
  }
  const text = V.relai && rel ? relaiResumePrompt(rel) : await $.fs.read(file).then((body) => continuePrompt(String(body), file), () => '')
  if (!text) {
    $.ui.toast(`Nie udało się przeczytać ${file} — nic nie wysłano.`, { timeoutMs: 10_000 })
    return
  }
  const before = V
  await keepSave($, { ...V, phase: 'resuming', sessionId: '', startedAt: await $.clock.now() })
  if (!(await clearAndContinue($, text))) return keepSave($, before)
  // The resume belongs to the fresh conversation: only its turns end it, not another window's
  await keepSave($, { ...V, sessionId: await $.session.id().catch(() => '') })
}

// "Odrzuć": the saved work is not resumed. A mod cannot delete a file, so in RelAI Claude is asked
// to (Łukasz 2026-10-11); the handoff file outside RelAI stays in the keeper's archive.
async function discardSave($: $T) {
  if (V.phase !== 'czeka' || resumeAsking) return
  resumeAsking = true
  try {
    await discardAfterCard($)
  } finally {
    resumeAsking = false
  }
}

async function discardAfterCard($: $T) {
  const rel = V.relai ? resumePath(S.cwd) : null
  const id = S.id
  // The request is one turn in this chat: after a long wait its cache is likely cold (said on the card)
  const question = rel
    ? `Odrzucić zapisaną pracę? Wyślę do tego czatu krótką prośbę o skasowanie ${rel} (jedna tura; po długiej przerwie cache może być zimny). Commity i dokumenty zostają, fraza wznowienia nie pójdzie.`
    : 'Odrzucić zapisaną pracę? Przekazanie zostaje w archiwum relai-cache-keeper, przycisk „Wznów pracę” zniknie.'
  const answer = await $.ui.ask(question, { header: 'Odrzuć', options: ['Odrzuć', 'Zostaw'] }).catch(() => '')
  if (answer !== 'Odrzuć') return
  if (!canAct(id)) {
    $.ui.toast('W międzyczasie coś się zaczęło — odrzuć, gdy czat będzie wolny.', { timeoutMs: 8000 })
    return
  }
  if (rel) {
    try {
      await $.prompt.submit({ text: relaiDiscardPrompt(rel), asUser: true })
    } catch (err) {
      $.ui.toast('Nie udało się wysłać prośby o skasowanie: ' + clip(String((err as Error)?.message || err), 100), { timeoutMs: 10_000 })
      return
    }
  }
  hasResumeFile = false
  await keepSave($, NO_SAVE)
}

// "Najpierw compact, potem wyślij" (Z5): a vetoed compaction resolves { skip }, a refused one
// rejects; either way sending would write the whole context again, so nothing is sent
async function compactThenSend($: $T, text: string) {
  const failed = await $.session.compact().then(
    (r) => ('skip' in r && r.skip ? r.skip : ''),
    (err) => String((err as Error)?.message || err) || 'błąd kompakcji',
  )
  if (failed) {
    $.ui.toast(`Kompakcja nie powiodła się (${clip(failed, 100)}) — nic nie wysłano.`, { timeoutMs: 10_000 })
    return
  }
  try {
    await $.prompt.submit({ text, asUser: true })
  } catch {
    const filled = await $.prompt.fill({ text }).then((r) => !!r.isFilled, () => false)
    $.ui.toast(filled ? 'Kompakcja gotowa. Wiadomość czeka w polu — naciśnij Enter.' : 'Kompakcja gotowa, ale wiadomości nie udało się wysłać.', { timeoutMs: 10_000 })
  }
}

// ---------- the limit card (LIMIT_CHECKPOINT E2) ----------

const GIT_TIMEOUT_MS = 3000 // a slow disk or a huge tree must not hold the card (plan, L8)
const GIT_STATUS: readonly string[] = ['git', '--no-optional-locks', 'status', '--short']
let carding = false // one card at a time, however long the person takes to answer

// The session's focus (written by relai-panel) points at a stage or thread in progress; a focus
// that cannot be read or parsed is no focus
async function focusGoing($: $T): Promise<boolean> {
  try {
    const file = focusFilePath(S.cwd, S.id)
    if (!file) return false
    const io = limitIO($)
    const ref = focusRef(await io.read(file))
    if (!ref) return false
    const status = focusStatus(ref, await io.read(focusDocPath(S.cwd, ref)), (md) => parseStatus(md).stages)
    return isWorkGoing(status, null)
  } catch {
    return false
  }
}

// `git status --short` by its argument vector, no shell, without the index lock (it must not collide
// with the person's own git); null when it fails, times out or is no repo
async function gitChanges($: $T): Promise<string | null> {
  try {
    const r = await $.process.run(GIT_STATUS, { ...(S.cwd ? { cwd: S.cwd } : {}), timeoutMs: GIT_TIMEOUT_MS })
    return r.exitCode === 0 ? r.stdout : null
  } catch {
    return null
  }
}

const workGoing = async ($: $T) => (await focusGoing($)) || isWorkGoing(null, await gitChanges($))

function cardInput(now: number, isWorking: boolean): CardInput {
  return {
    limits: S.rateLimits, thresholds: { five: thresholds.five.value, week: thresholds.week.value }, asked: S.limitAsked, isMuted: S.limitMuted, isWorking,
    perTurn: limitPace(S.limitTurns, S.ctx > 0 ? S.ctx : 1)?.now ?? null, now,
    saveWords: S.isRelai && resumePath(S.cwd)
      ? 'wyśle frazę „zapisz pracę”: testy, commit lokalny (zgoda z tej karty, bez pusha), dokumenty projektu i plik wznowienia'
      : 'spisze przekazanie sesji do pliku (projekt bez RelAI — wariant ogólny, jak /handoff)',
  }
}

// One window's threshold, then where to keep it (Aneks B): the first card of a session, and
// `/cache limit-warn[-week] [N]` — the panel's "Zmień" sends that command without N. Esc, a
// dismissed card, "Nie zapisuj" or a number outside 1–99 keep the threshold as it is.
// The answers belong to the conversation that asked: the place to write (this session's file
// among them) is taken before the first card, and an id that moved meanwhile drops the answer.
let choosing = false // one series of threshold cards at a time
async function chooseThreshold($: $T, window: LimitWindow, opts: { first?: boolean, value?: number, fromCard?: boolean } = {}) {
  if (choosing || (carding && !opts.fromCard)) {
    $.ui.toast('Karta limitu już czeka na odpowiedź — próg zmienisz po niej.', { timeoutMs: 8000 })
    return
  }
  choosing = true
  // The engine's id, asked again after each card: a /clear may come before the keeper hears of it
  const sessionNow = () => $.session.id().catch(() => '')
  const id = (await sessionNow()) || S.id
  const where = { ...limitWhere(), sessionId: id }
  try {
    await loadThreshold($)
    const current = thresholds[window]
    let value = opts.value ?? null
    if (value === null) {
      const lead = opts.first
        ? `Pierwsza karta limitu w tej sesji. Od ilu procent zużycia ${WINDOW_OF[window]} pytać o zapis pracy?`
        : `Od ilu procent zużycia ${WINDOW_OF[window]} bateria ma zmienić kolor, a po turze przyjść karta?`
      const typed = await $.ui.ask(`${lead} Teraz ${thresholdText(current)}; własną liczbę 1–99 wpisz w polu „Inne”.`,
        { header: THRESHOLD_HEADER[window], options: THRESHOLD_CHOICES[window] }).catch(() => '')
      if (!typed || (await sessionNow()) !== id) return
      value = thresholdAnswer(typed)
      if (value === null) {
        $.ui.toast(`Próg ${WINDOW_OF[window]}: liczba całkowita od 1 do 99 — zostaje ${current.value} %.`, { timeoutMs: 10_000 })
        return
      }
    }
    const scopes = SCOPE_OPTIONS.filter((s) => S.isRelai || s.scope !== 'projekt')
    const answer = await $.ui.ask(`Gdzie zapamiętać próg ${WINDOW_OF[window]} ${value} %?`,
      { header: 'Zasięg', options: [...scopes.map((s) => s.label), NO_SCOPE] }).catch(() => '')
    const scope = scopes.find((s) => s.label === answer)?.scope
    if (!scope || (await sessionNow()) !== id) return
    const today = dateText(await $.clock.now())
    const saved = await rememberThreshold(limitIO($), where, value, scope, today, window).catch(() => ({ error: 'próg limitu: zapis nie powiódł się' }))
    await loadThreshold($)
    $.ui.invalidate('ui.render')
    if (saved.error) return $.ui.toast(saved.error, { timeoutMs: 10_000 })
    const after = thresholds[window]
    // The session file outranks the project's and the global row: say when it still decides
    const held = after.value !== value ? ` Obowiązuje nadal ${thresholdText(after)} — ma pierwszeństwo.` : ''
    $.ui.toast(`Próg ${WINDOW_OF[window]}: ${value} % (${SCOPE_OPTIONS.find((s) => s.scope === scope)?.label.toLowerCase()}).${held}`, { timeoutMs: 8000 })
  } finally {
    choosing = false
  }
}

// After a main turn: past the threshold and with work going on, one card for this threshold.
// Cheap checks first; git runs only when a card would otherwise be due. An answer that comes
// after a /clear or /resume belongs to the conversation that asked, so it is dropped.
async function limitCheckpoint($: $T) {
  if (carding || choosing || H.phase !== 'idle' || V.phase === 'running' || V.phase === 'resuming') return
  carding = true // set before the first await: two turns ending close together bring one card
  const id = S.id
  const where = limitWhere()
  let isSaving = false
  let isDue = false // nothing due: no snapshot and no redraw (Z4, a quiet tick stays quiet)
  let resetAt: number | null = null
  try {
    await loadThreshold($)
    const due = cardDue(cardInput(await $.clock.now(), true))
    if (!due) return
    isDue = true
    if (!(await workGoing($))) return
    if (!S.limitFirstDone) {
      set({ limitFirstDone: true })
      // The first card asks for the threshold of the window it is about (the 5-hour one first)
      await chooseThreshold($, due.windows[0] ?? 'five', { first: true, fromCard: true })
      if (S.id !== id) return
    }
    const now = await $.clock.now()
    const card = cardDue(cardInput(now, true))
    if (!card || S.id !== id) return
    set({ limitAsked: { ...S.limitAsked, ...Object.fromEntries(card.windows.map((w) => [w, thresholds[w].value])) } })
    const answer = await $.ui.ask(card.question, { header: 'Limit planu', options: CARD_OPTIONS }).catch(() => '')
    if (S.id !== id) return
    if (answer === GO_ON) {
      // Each window past its threshold goes 5 points up in this session only (plan, section 8)
      let error = ''
      for (const w of card.windows) {
        const saved = await rememberThreshold(limitIO($), where, nextSessionThreshold(thresholds[w].value), 'sesja', dateText(now), w)
          .catch(() => ({ error: 'próg limitu: nie udało się zapisać pliku sesji' }))
        error ||= saved.error ?? ''
      }
      await loadThreshold($)
      const nextAt = card.windows.length > 1 ? card.windows.map((w) => `${WINDOW_NAME[w]} ${thresholds[w].value} %`).join(' · ') : `${thresholds[card.windows[0] ?? 'five'].value} %`
      $.ui.toast(error || `Pracujemy dalej. Następna karta po przekroczeniu ${nextAt}.`, { timeoutMs: 8000 })
    } else if (answer === SAVE) {
      isSaving = true
      resetAt = card.resetAt
    } else if (answer === MUTE) {
      set({ limitMuted: true })
    }
  } finally {
    carding = false
    if (isDue) {
      await saveSnap($, await $.clock.now())
      $.ui.invalidate('ui.render')
    }
  }
  if (isSaving) await startSave($, resetAt)
}

// ---------- texts ----------

function statusText(now: number): string {
  const st = state(now)
  const lines = [
    `relai-cache-keeper: kontekst ${tokens(S.ctx)} tokenów, model ${S.model || 'nieznany'}, okno cache ${ttl()} min (${settings.ttlMin ? 'ustawione ręcznie' : S.ttlMeasured ? 'zmierzone' : 'założone — brak pomiaru'}).`,
  ]
  if (st.kind === 'unknown') lines.push('W tej sesji nie było jeszcze zapytania, stan cache nieznany.')
  if (st.kind === 'warm' || st.kind === 'cooling') lines.push(`Cache ciepły jeszcze ~${minutes(st.left)}.`)
  if (st.kind === 'cold') lines.push(`Cache prawdopodobnie zimny od ${minutes(-st.left)}. Następna wiadomość zapisze go ponownie za ≈ ${usd(rewriteAt(S.ctx))}.`)
  if (S.keepWarm) lines.push(`Podtrzymanie do ${clock(S.keepWarmUntil)}: ${S.pings} pingów, ${usd(S.pingUsd)}.`)
  if (S.rateLimits.length) lines.push(`Limity planu: ${limitsText(S.rateLimits)}.`)
  lines.push(`Próg limitu: 5 h ${thresholdText(thresholds.five)} · tydzień ${thresholdText(thresholds.week)} — od niego bateria limitu ostrzega kolorem, a po turze przychodzi karta.`)
  lines.push(`Sesja ≈ ${usd(S.costUsd)} (hipotetycznie wg cennika API). Ponowne zapisy cache: ${S.rewrites} (${usd(S.rewriteUsd)}).`)
  lines.push(`Strażnik: ${settings.guard ? 'on' : 'off'} od ${tokens(settings.bigTokens)}. Alerty: ${settings.alerts ? 'on' : 'off'} od ${tokens(settings.alertTokens)}, progi ${settings.warnMin.join(' i ')} min. Projekt RelAI: ${S.isRelai ? 'tak' : 'nie'}.`)
  lines.push(`Ustawienia: /${names.cache} ttl 5|60|auto · straznik on|off · prog 150k · alerty on|off · progi 10,5 · godziny 4 · limit 90 · limit-warn 85|90|95 · limit-warn-week 95|98|99 · zwrot ${settings.paybackTurns} (1–${MAX_PAYBACK_TURNS} wiadomości)`)
  lines.push(`Cennik: ${priceSource(prices)}. Koniec odliczania nie dowodzi utraty cache — to prognoza z TTL.`)
  lines.push('', reckon(now).report)
  return lines.join('\n')
}

// ---------- the band above the prompt ----------

type Resolved = Parameters<$T['ui']['resolve']>[0]

// The card itself — label column, middle, figure, soft background — is the shared grid of the
// three bars (bar-card.tsx, the same file in relai-panel and relai-progress, Z6).

// The figure on the right: the session's cost, the only place above the prompt it stands
// (Aneks Z11, brief v3 §10.5); never a seeming zero
const costFigure = (): readonly [string, string] => (S.costUsd === null ? ['brak danych', 'kosztu'] : [usd(S.costUsd), 'sesja'])

// The cache bar's second row (brief v2 §1): only while its reason lasts, one at a time. A handoff
// the person must answer first, then one under way; a cooling cache before the Z9 event (minutes
// decide whether "Podtrzymaj" still helps, and its row offers Nowa sesja too); a kept cache last.
type SecondKind = 'ready' | 'running' | 'saved' | 'resume' | 'broken' | 'cooling' | 'event' | 'kept'
// The Z9 event carries `lines`: two lines of segments,
// strong ones bold, the rest muted, with no chip background (calibration 2026-10-14)
type Second = { kind: SecondKind, text: string, lines?: BarSegment[][] }
const CHIP_OF: Record<SecondKind, { color: string, bg: string }> = {
  ready: CHIP.ok, running: CHIP.run, saved: CHIP.ok, resume: CHIP.ok, broken: CHIP.warn, cooling: CHIP.warn, event: CHIP.info, kept: CHIP.run,
}

// The event's two lines: "przejdź do nowej sesji — …" | "wiadomość … → … limitu 5 h · przekazanie …"
function eventRow(text: string): Second {
  return { kind: 'event', text, lines: verdict?.kind === 'handoff' ? verdict.lines : [[{ text, strong: true }]] }
}

const pingsText = (n: number) => {
  const tens = n % 100
  const word = n === 1 ? 'ping' : n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? 'pingi' : 'pingów'
  return `${n} ${word}`
}

function secondRow(now: number, kind: string): Second | null {
  if (H.phase === 'ready') return { kind: 'ready', text: 'przekazanie gotowe' }
  if (H.phase === 'running') return { kind: 'running', text: 'przekazanie trwa' }
  if (H.phase === 'continuing') return { kind: 'running', text: 'czyszczę czat i kontynuuję' }
  // The save (E3): under way, then waiting for the limit's reset, or cut short; after the reset,
  // with the resume file still there, "Wznów pracę" (E4)
  const save = saveRowText(V.phase, V.resetAt, now, hasResumeFile)
  if (save) {
    const kind: SecondKind = V.phase === 'running' || V.phase === 'resuming' ? 'running'
      : V.phase === 'przerwany' ? 'broken'
      : resumeDue(V.phase, V.resetAt, now, hasResumeFile) ? 'resume' : 'saved'
    return { kind, text: save }
  }
  if (kind === 'cooling') return { kind: 'cooling', text: `stygnie · ponowny zapis ≈ ${usd(rewriteAt(S.ctx))}` }
  const event = eventText(now)
  if (event) return eventRow(event)
  if (kind === 'kept') return { kind: 'kept', text: `podtrzymany do ${clock(S.keepWarmUntil)} · ${pingsText(S.pings)} · ${usd(S.pingUsd)}` }
  return null
}

// Everything the band draws, as data: the stamp of the tick (Z4) and the input of band()
function bandView(now: number) {
  const st = state(now)
  const isAssumed = ttlAssumed()
  const five: Limit | undefined = S.rateLimits.find((l) => l.kind === FIVE_HOUR)
  // The order and the words of brief v3 §10.4
  const measures: Measure[] = [
    cacheMeasure({ kind: st.kind, left: st.left, ttlMin: ttl(), isAssumed, rewrite: usd(rewriteAt(S.ctx)), keptUntil: S.keepWarmUntil }),
    limitMeasure('five', 'limit 5 h', '5 h', five, now, thresholds.five.value, thresholds.five.source),
    resetMeasure(five, now),
    limitMeasure('week', 'limit tygodnia', 'tydzień', S.rateLimits.find((l) => l.kind === SEVEN_DAY), now, thresholds.week.value, thresholds.week.source),
    contextMeasure(S.ctx, S.ctxWindow),
  ]
  return { measures, figure: costFigure(), second: secondRow(now, st.kind) }
}

// A desktop cell in CSS px, the unit the Svg draws in: 16 cells of label and gap are 157 px on a
// screenshot, which is ~1.2× the CSS px (the context's battery drawn at x = 766 stands 919 px into
// the column on the shot, 2026-10-10), so ~8.2 px; 9.8 counted the shot's pixels and let a row
// run past the column before it wrapped. 8 leaves a little room (P-024 pkt 3).
const CELL_PX = 8
const COLUMN_GAP = 2 // cells between the grid's columns (brief v2 §5)

// The middle column's pixels: the card's padding and rounded corners, and beside it the label and
// figure columns with their gaps (below BAR.narrow they stand on top)
const middlePx = (columns: number) =>
  Math.max(10, columns - 2 - 2 - (columns < BAR.narrow ? 0 : BAR.labelColumn + BAR.figureColumn + 2 * COLUMN_GAP)) * CELL_PX

// The cache bar (Aneks Z11, brief v3 §10): in calm one row of five batteries, the session's cost
// on the right, zero buttons; a second row only while its reason lasts.
// Desktop: each Svg alone in its row (an interactive Svg beside text shrinks, P-021 pkt 3).
// Terminal: no card to hover, so line b stays — a glyph, label, value, line b muted, wrapping.
function band($: $T, e: Resolved, columns: number, now: number) {
  const el = $.ui.resolve(e)
  const { Box, Text } = el
  const Svg = (e.surface === 'desktop' || e.surface === 'vscode') && 'Svg' in el ? el.Svg : null
  const isGui = e.surface !== 'terminal'
  const v = bandView(now)
  const batteries = Svg
    ? (
      <Box key="cache-batteries" flexDirection="column">
        {batteryRows(v.measures, middlePx(columns), BAND.cache.bg).map((row, i) => (
          <Box key={`batteries-${i}`} flexDirection="column"><Svg isInteractive source={row.svg} alt={row.alt} height={row.height} /></Box>
        ))}
      </Box>
    )
    : (
      <Box key="cache-batteries" flexDirection="row" flexWrap="wrap" columnGap={3}>
        {v.measures.map((m) => (
          <Box key={`m-${m.name}`} flexDirection="row" flexWrap="wrap" columnGap={1}>
            <Text color={glyphColor(m)}>{measureGlyph(m.fill)}</Text>
            <Text color={BAR.muted}>{m.label}</Text>
            <Text bold color={BAR.text}>{m.value}</Text>
            {m.b === m.value ? null : <Text color={BAR.muted}>{m.b}</Text>}
          </Box>
        ))}
      </Box>
    )
  const middle = [batteries]
  if (v.second) {
    const look = CHIP_OF[v.second.kind]
    const lead = v.second.lines
      ? (
        <Box key="lines" flexShrink={1} flexDirection="column">
          {v.second.lines.map((line, i) => (
            <Box key={`line-${i}`} flexDirection="row" flexWrap="wrap">
              {line.map((seg, j) => <Text key={`s-${j}`} bold={seg.strong} color={seg.strong ? BAR.text : BAR.muted}>{seg.text}</Text>)}
            </Box>
          ))}
        </Box>
      )
      : <Box key="chip" flexShrink={1} paddingX={1} flexDirection="row" backgroundColor={look.bg}><Text key="text" color={look.color}>{v.second.text}</Text></Box>
    // The event never wraps its buttons under the text (calibration 2026-10-14, a narrow window):
    // the lines shrink and wrap in their own column, the buttons keep their width on the right
    const buttons = secondButtons($, e, v.second.kind)
    middle.push(
      <Box key={`cache-${v.second.kind}`} flexDirection="row" flexWrap={v.second.lines ? 'nowrap' : 'wrap'} alignItems="center" columnGap={2} {...(isGui ? { marginTop: 1 } : {})}>
        {v.second.lines
          ? [lead, <Box key="buttons" flexShrink={0} flexDirection="row" columnGap={2}>{buttons}</Box>]
          : [lead, ...buttons]}
      </Box>,
    )
  }
  return barCard(el, BAR, isGui, columns, 'relai-cache-card', BAND.cache, middle, v.figure)
}

// The buttons of a second row: native (a plain one inverts on a painted background, P-018); no
// digit hotkey (a bare digit typed into an empty composer pressed it, Z5); hotkey h at most once
function secondButtons($: $T, e: Resolved, kind: SecondKind) {
  const { Button } = $.ui.resolve(e)
  const handoff = <Button key="handoff" label="Nowa sesja" hotkey="h" variant="secondary" onPress={() => startHandoff($)} />
  if (kind === 'ready') {
    return [
      <Button key="continue" label="Wyczyść i kontynuuj" hotkey="c" variant="primary" onPress={() => clearAndContinue($)} />,
      <Button key="stay-ready" label="Zostań" variant="secondary" onPress={() => { H = IDLE; $.ui.invalidate('ui.render') }} />,
    ]
  }
  if (kind === 'cooling') {
    return [
      <Button key="keepwarm" label="Podtrzymaj" variant="secondary" onPress={async () => {
        const text = startKeepWarm($, await $.clock.now(), settings.keepWarmHours)
        if (!S.keepWarm) $.ui.toast(text, { timeoutMs: 10_000 })
        $.ui.invalidate('ui.render')
      }} />,
      handoff,
    ]
  }
  if (kind === 'event') {
    // "Zostań" dismisses the event for this context size (Z9)
    return [handoff, <Button key="stay" label="Zostań" variant="secondary" onPress={() => {
      set({ stayCtx: S.ctx })
      $.ui.invalidate('ui.render')
    }} />]
  }
  if (kind === 'kept') return [<Button key="stop" label="Zatrzymaj" variant="secondary" onPress={() => { stopKeepWarm($, 'wyłączone ręcznie'); $.ui.invalidate('ui.render') }} />]
  // After the limit's reset (E4): resume from the file, or let it go; each asks on a card first
  if (kind === 'resume') {
    return [
      <Button key="resume" label="Wznów pracę" variant="primary" onPress={() => resumeWork($)} />,
      <Button key="discard" label="Odrzuć" variant="secondary" onPress={() => discardSave($)} />,
    ]
  }
  // A save cut short stays until a new save or until it is closed here (E4)
  if (kind === 'broken') return [<Button key="close-broken" label="Zamknij" variant="secondary" onPress={() => keepSave($, NO_SAVE)} />]
  return []
}

// ---------- hooks ----------

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const now = await $.clock.now()
    home = (await $.env.get('USERPROFILE')) || (await $.env.get('HOME')) || ''
    const here = await $.session.cwd()
    const root = await relaiRoot($, here)
    // No user turn in the transcript yet: a fresh session, not a resume or a reload (Z9)
    const isFresh = (await $.session.turns().catch(() => 1)) === 0
    S = { ...FRESH, id: await $.session.id(), cwd: root ?? here, model: await $.session.model(), isRelai: root !== null, startPending: isFresh }
    settings = mergeSettings(await $.store.get(STORE_SETTINGS))
    await loadThreshold($)
    await loadPrices($)
    await restoreSnap($, now)
    await loadSave($, now)
    await checkResumeFile($)
    await loadStartLayer($)
    verdict = null
    names = {
      cache: await registerCommand($, 'cache', 'Stan cache promptu i ustawienia relai-cache-keeper', '[ttl 5|60|auto] [straznik on|off] [prog 150k] [alerty on|off] [progi 10,5] [limit-warn 90] [limit-warn-week 98] [zwrot 20]'),
      keepwarm: await registerCommand($, 'keepwarm', 'Podtrzymuj cache tej sesji (domyślnie 4 h) albo /keepwarm off', '[godziny|off]'),
      handoff: await registerCommand($, 'handoff', 'Przekazanie do świeżego czatu (w projekcie RelAI przez dokumenty); /handoff dalej kończy', '[dalej]'),
    }
    $.clock.every(TICK_MS, () => { tick($).catch(() => {}) })
    clearOldStatus($)
    return next(e)
  })

  // The ending conversation's snapshot goes; a /clear starts the keeper afresh (Z5). The new id
  // may not answer yet: then the next followSession adopts it without another reset
  on('session.end', async ($, e, next) => {
    const ending = e.sessionId || S.id
    if (ending) await $.store.delete('snap:' + ending).catch(() => {})
    if (e.reason === 'clear') {
      const id = await $.session.id().catch(() => '')
      resetSession($, id !== ending ? id : '', true)
    }
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await followSession($)
    const fromUser = e.origin.kind === 'composer' || e.origin.kind === 'bridge'
    // A new typed message makes a waiting handoff out of date
    if (fromUser && H.phase === 'ready' && !e.text.trim().startsWith('/')) {
      H = IDLE
      $.ui.invalidate('ui.render')
    }
    const now = await $.clock.now()
    const left = msLeft(S.lastActivity, ttl(), now)
    const isCold = left !== null && left <= 0 && !S.keepWarm
    if (!settings.guard || !fromUser || !isCold || S.ctx < settings.bigTokens || e.turnId || e.text.trim().startsWith('/')) return next(e)
    const cost = usd(rewriteAt(S.ctx))
    const fresh = 'Świeży czat RelAI (/clear + „kontynuujemy pracę”)'
    const compactFirst = 'Najpierw compact, potem wyślij'
    const options = ['Wyślij mimo to', compactFirst, ...(S.isRelai ? [fresh] : []), 'Anuluj']
    // A dismissed question (Esc) rejects the ask: it means "Anuluj", never a paid rewrite (Z5)
    const answer = await $.ui.ask(
      `Cache prawdopodobnie wygasł ${minutes(-(left ?? 0))} temu. Wysłanie zapisze ponownie ${tokens(S.ctx)} tokenów kontekstu (≈ ${cost} wg cennika API). Co zrobić?`,
      options,
    ).catch(() => 'Anuluj')
    if (answer === 'Wyślij mimo to') return next(e)
    if (answer === compactFirst) {
      // The engine refuses $.session.compact inside prompt.submit (it would wait on the turn this
      // hook holds; 2.1.295): the message waits, the compaction runs after, then it is sent
      later($, () => compactThenSend($, e.text))
      $.ui.toast('Najpierw kompakcja, potem wyślę tę wiadomość.', { timeoutMs: 8000 })
      return { drop: 'relai-cache-keeper: wiadomość wyślę po kompakcji' }
    }
    if (answer === fresh) {
      later($, () => clearAndContinue($, relaiFreshPrompt(e.text)))
      return { drop: 'relai-cache-keeper: świeży czat RelAI zamiast ponownego zapisu cache' }
    }
    $.ui.toast('Nie wysłano. Przekazanie do świeżego czatu omija ponowny zapis.', { timeoutMs: 8000 })
    return { drop: 'relai-cache-keeper: anulowano przed ponownym zapisem zimnego cache' }
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    set({ working: true, turnId: e.turnId || S.turnId })
    return next(e)
  })

  // Each main-loop request: did it read the cache or rewrite it?
  on('turn.step', async function* ($, e, next) {
    if (!e.agentId) await followSession($)
    const startedAt = await $.clock.now()
    const result = yield* next(e)
    if (e.agentId || !result || !result.usage) return result
    const now = await $.clock.now()
    const u = result.usage as Usage
    const gap = S.lastActivity ? startedAt - S.lastActivity : 0
    const verdict = judgeStep(u, gap, !!S.lastActivity, S.justCompacted, ttl())
    if (verdict.kind === 'rewrite') {
      set({ rewrites: S.rewrites + 1, rewriteUsd: S.rewriteUsd + (rewriteAt(u.cache_creation_input_tokens || 0) ?? 0) })
    }
    if (verdict.ttlMeasured === 60) set({ ttlMeasured: 60, shortTtlRewrites: 0 })
    if (verdict.ttlMeasured === 5) {
      const seen = S.shortTtlRewrites + 1
      set({ shortTtlRewrites: seen, ...(seen >= 2 ? { ttlMeasured: 5 as const } : {}) })
    }
    set({ ctx: totalInput(u), lastActivity: now, justCompacted: false, turnOut: S.turnOut + (u.output_tokens || 0) })
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (e.agentId) return r
    const now = await $.clock.now()
    set({ working: false })
    const usage = await $.session.usage().catch(() => null)
    if (usage) {
      set({
        ctx: usage.context?.tokens || S.ctx,
        ctxWindow: usage.context?.window || S.ctxWindow,
        costUsd: usage.cost ? usage.cost.usd : S.costUsd,
        rateLimits: usage.rateLimits?.length ? usage.rateLimits : S.rateLimits,
      })
    }
    recordTurn()
    await measureStart($, now, e.reason === 'answer')
    reckon(now)
    if (H.phase === 'running' && e.turnId !== H.notTurn) {
      await captureHandoff($, e.reason === 'answer' ? e.answer : '', now)
    }
    if (V.phase === 'running' && V.sessionId === S.id && e.turnId !== V.notTurn) {
      await captureSave($, e.reason === 'answer' ? e.answer : '', now)
    }
    // The resume's turn (E4): answered, the work is resumed and the bar lets go (Claude deletes the
    // file with the card's consent); cut off, the save waits again and the file decides
    // Only the conversation the resume went to ends it ('' = sent this moment, the id not yet known)
    if (V.phase === 'resuming' && (V.sessionId === '' || V.sessionId === S.id)) {
      const isResumed = e.reason === 'answer'
      hasResumeFile = false
      await keepSave($, isResumed ? NO_SAVE : { ...V, phase: 'czeka' })
      if (!isResumed) $.ui.toast('Wznowienie nie dokończyło tury — plik wznowienia zostaje, przycisk wróci.', { timeoutMs: 10_000 })
    }
    await saveSnap($, now)
    $.ui.invalidate('ui.render')
    // The limit card waits for the turn's end and never stops it (plan, section 8)
    $.clock.after(300, () => { limitCheckpoint($).catch(() => {}) })
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    set({ justCompacted: true })
    return r
  })

  on('session.measure', async ($, e, next) => {
    if (e.context?.tokens) set({ ctx: e.context.tokens })
    if (e.context?.window) set({ ctxWindow: e.context.window })
    if (e.cost) set({ costUsd: e.cost.usd })
    if (e.rateLimits?.length) set({ rateLimits: e.rateLimits })
    await loadThreshold($)
    const measured = await $.clock.now()
    reckon(measured)
    return next(e)
  })

  on('command.run', { command: ['handoff', 'ckp-handoff'] }, async ($, e) => {
    const arg = String(e.args || '').trim().toLowerCase()
    if (arg === 'dalej' || arg === 'continue') {
      if (H.phase !== 'ready') return { text: `Brak gotowego przekazania. Najpierw /${names.handoff}.` }
      later($, () => clearAndContinue($))
      return { text: 'Czyszczę czat i kontynuuję z przekazaniem.' }
    }
    later($, () => startHandoff($))
    return { text: S.isRelai ? 'Przekazanie RelAI: synchronizacja dokumentów, potem pytanie o świeży czat.' : 'Przekazanie: spisanie stanu sesji, potem pytanie o świeży czat.' }
  })

  on('command.run', { command: ['cache', 'ckp-cache'] }, async ($, e) => {
    const now = await $.clock.now()
    const [key, ...rest] = String(e.args || '').trim().split(/\s+/).filter(Boolean)
    await loadPrices($)
    await loadThreshold($)
    if (!key) return { text: statusText(now) }
    // A threshold (Aneks B): the number now or on a card, then the scope on a card; nothing is
    // written before the scope is chosen. The panel's "Zmień" sends this without a number.
    const window = limitWarnWindow(key)
    if (window) {
      const raw = rest.join(' ').trim()
      const value = raw ? thresholdAnswer(raw) : null
      if (raw && value === null) {
        return { text: `${key.toLowerCase()}: liczba całkowita od 1 do 99, np. ${THRESHOLD_CHOICES[window].map((c) => c.replace(' %', '')).join(', ')}\n\n${statusText(now)}` }
      }
      later($, () => chooseThreshold($, window, value === null ? {} : { value }))
      return { text: value === null ? `Próg ${WINDOW_OF[window]}: wybierz wartość i zasięg na kartach.` : `Próg ${WINDOW_OF[window]} ${value} %: wybierz na karcie, gdzie go zapamiętać.` }
    }
    const result = applySetting(settings, key, rest.join(' '))
    if (result.error) return { text: `${result.error}\n\n${statusText(now)}` }
    settings = result.settings
    await $.store.set(STORE_SETTINGS, settings)
    $.ui.invalidate('ui.render')
    return { text: statusText(now) }
  })

  on('command.run', { command: ['keepwarm', 'ckp-keepwarm'] }, async ($, e) => {
    const now = await $.clock.now()
    const arg = String(e.args || '').trim().toLowerCase()
    if (arg === 'off' || (arg === '' && S.keepWarm)) {
      stopKeepWarm($, 'wyłączone ręcznie')
      $.ui.invalidate('ui.render')
      return { text: 'Podtrzymanie wyłączone.' }
    }
    const hours = Number(arg) > 0 ? Math.min(12, Number(arg)) : settings.keepWarmHours
    const text = startKeepWarm($, now, hours)
    $.ui.invalidate('ui.render')
    return { text }
  })

  // One band instance for every plugin: draw ours above whatever the plugins beneath draw
  // (the RelAI panel's band among them), never instead of it
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    if (!S.lastActivity && !S.keepWarm && H.phase === 'idle' && V.phase === 'idle') return next(e)
    const below = await next(e)
    const now = await $.clock.now()
    drawnStamp = bandStamp(now)
    const ours = band($, e, e.props.bodyColumns, now)
    if (!below) return ours
    const { Box } = $.ui.resolve(e)
    // No width here: the engine refuses its own node under a Box with "width" and draws its own
    // instead, which drops every band (live, desktop, 2.1.293; plugin test does not see it)
    return <Box key="relai-cache-keeper" flexDirection="column" gap={e.surface === 'terminal' ? 0 : 1}>{[ours, below]}</Box>
  })
}
