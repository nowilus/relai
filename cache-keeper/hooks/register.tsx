// relai-cache-keeper: watches this session's prompt cache, keeps a big cache warm on request,
// asks before a cold send of a big context, and hands work off to a fresh chat
// (natively through the project documents in a RelAI project).
//
// Why: every request re-reads the whole context. From the cache that costs a fraction of
// input; once the cache expires (1 hour idle on a subscription, 5 minutes on the default
// API TTL) the next message writes the whole context again at 1.25x-2x input.

import type { EngineInterface, Register } from 'claude-code'
import { DEFAULT_SETTINGS, MIN, RELAI_MARKER, applySetting, cacheState, dueWarning, judgeStep, mergeSettings, msLeft, pingDue, pingMissed, type Settings } from './core'
import { basename, clip, clock, fileStamp, limitsText, minutes, tokens, usd } from './fmt'
import { BAND, BAR } from './relai/theme.mjs'
import { ancestors } from './relai/plan-state.mjs'
import { PLAIN_HANDOFF_PROMPT, RELAI_CONTINUE, RELAI_HANDOFF_PROMPT, continuePrompt, plainBody, relaiDone, relaiFreshPrompt } from './handoff'
import { PRICE_FILE } from './relai/pricing.mjs'
import { BUILT_IN, priceSource, pricesFrom, requestCost, rewriteCost, totalInput, type Prices, type Usage } from './pricing'

type $T = EngineInterface
type Limit = { kind: string; percentUsed: number }

const TICK_MS = 30_000
const STORE_SETTINGS = 'settings'

type Session = {
  id: string
  cwd: string
  model: string
  isRelai: boolean
  lastActivity: number // last main-loop request or ping that touched the cache
  ctx: number
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
}

type Handoff = { phase: 'idle' | 'running' | 'ready' | 'continuing'; notTurn: string; relai: boolean; body: string; path: string }

const FRESH: Session = {
  id: '', cwd: '', model: '', isRelai: false, lastActivity: 0, ctx: 0, ttlMeasured: 0, costUsd: null, rateLimits: [],
  working: false, turnId: '', keepWarm: false, keepWarmUntil: 0, pings: 0, pingUsd: 0, rewrites: 0, rewriteUsd: 0,
  announcedFor: 0, announced: [], justCompacted: false, shortTtlRewrites: 0,
}
const IDLE: Handoff = { phase: 'idle', notTurn: '', relai: false, body: '', path: '' }

// Module state is replaced, never mutated in place; a hot reload restores it from the store
let S: Session = FRESH
let H: Handoff = IDLE
let settings: Settings = DEFAULT_SETTINGS
let home = ''
let names = { cache: 'cache', keepwarm: 'keepwarm', handoff: 'handoff' }
let pinging = false // one fork at a time, however long it takes
let skipPingUntil = 0 // after a reload the turn state is unknown for one tick
let prices: Prices = BUILT_IN // the core's list laid over by the project's cennik.json (Z5)

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

// A /clear ends the conversation the state measured; the process goes on under a new id and no
// session.start fires (P-020 point 4). FRESH under that id, keeping what belongs to the process;
// a handoff clearing on purpose goes on. A kept cache stops: it belonged to the old conversation.
function resetSession($: $T, id: string) {
  stopKeepWarm($, 'nowa rozmowa')
  S = { ...FRESH, id, cwd: S.cwd, model: S.model, isRelai: S.isRelai, rateLimits: S.rateLimits }
  if (H.phase !== 'continuing') H = IDLE
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
  resetSession($, id)
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

// The words the band shows: the state, the figure on the right, the context, the rewrite, the
// limits, the session's cost, the pings of a kept cache and the handoff's phase. The tick redraws
// only when they changed (Z4) — the countdown's minute, a cost or a limit that session.measure
// moved — never the same words again.
let drawnStamp = ''
const bandStamp = (now: number) => {
  const st = state(now)
  return JSON.stringify([st.kind, cacheFigure(st, ttlAssumed() ? '~' : ''), tokens(S.ctx), S.ctx >= settings.bigTokens, usd(rewriteAt(S.ctx)),
    limitsText(S.rateLimits), usd(S.costUsd), S.pings, usd(S.pingUsd), H.phase])
}

async function tick($: $T) {
  await followSession($)
  const now = await $.clock.now()
  await keepWarmStep($, now)
  warnStep($, now)
  await saveSnap($, now)
  const stamp = bandStamp(now)
  if (stamp === drawnStamp) return
  drawnStamp = stamp
  $.ui.invalidate('ui.render')
}

// ---------- handoff ----------

async function startHandoff($: $T) {
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
    const path = `${home || '.'}/.claude/mods-data/relai-cache-keeper/handoffs/${fileStamp(now)}-${basename(S.cwd).replace(/[^A-Za-z0-9-]+/g, '-')}.md`.replace(/\\/g, '/')
    const saved = await $.fs.write(path, body + '\n').then(() => path, () => '')
    setH({ phase: 'ready', body, path: saved })
  }
  $.ui.invalidate('ui.render')
  $.clock.after(300, () => { offerContinue($).catch(() => {}) })
}

async function offerContinue($: $T) {
  const answer = await $.ui.ask('Przekazanie gotowe. Wyczyścić ten czat i kontynuować w świeżym kontekście?', ['Wyczyść i kontynuuj', 'Zostań w tym czacie']).catch(() => '')
  if (answer === 'Wyczyść i kontynuuj') await clearAndContinue($)
}

async function clearAndContinue($: $T, text?: string) {
  const first = text ?? (H.relai ? RELAI_CONTINUE : continuePrompt(H.body, H.path))
  if (S.working) {
    $.ui.toast('Claude jeszcze pracuje — wyczyść i kontynuuj po zakończeniu tury.', { timeoutMs: 8000 })
    return
  }
  setH({ phase: 'continuing' })
  $.ui.invalidate('ui.render')
  try {
    await $.command.run({ command: 'clear', args: '' })
  } catch (err) {
    setH({ phase: text ? 'idle' : 'ready' })
    $.ui.toast('Nie udało się uruchomić /clear: ' + clip(String((err as Error)?.message || err), 100), { timeoutMs: 10_000 })
    return
  }
  H = IDLE
  try {
    await $.prompt.submit({ text: first, asUser: true })
  } catch {
    const filled = await $.prompt.fill({ text: first }).then((r) => !!r.isFilled, () => false)
    $.ui.toast(filled ? 'Czat wyczyszczony. Pierwszy prompt czeka w polu — naciśnij Enter.' : 'Czat wyczyszczony, ale pierwszego promptu nie udało się wysłać.', { timeoutMs: 10_000 })
  }
  $.ui.invalidate('ui.render')
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
  lines.push(`Sesja ≈ ${usd(S.costUsd)} (hipotetycznie wg cennika API). Ponowne zapisy cache: ${S.rewrites} (${usd(S.rewriteUsd)}).`)
  lines.push(`Strażnik: ${settings.guard ? 'on' : 'off'} od ${tokens(settings.bigTokens)}. Alerty: ${settings.alerts ? 'on' : 'off'} od ${tokens(settings.alertTokens)}, progi ${settings.warnMin.join(' i ')} min. Projekt RelAI: ${S.isRelai ? 'tak' : 'nie'}.`)
  lines.push(`Ustawienia: /${names.cache} ttl 5|60|auto · straznik on|off · prog 150k · alerty on|off · progi 10,5 · godziny 4 · limit 90`)
  lines.push(`Cennik: ${priceSource(prices)}. Koniec odliczania nie dowodzi utraty cache — to prognoza z TTL.`)
  return lines.join('\n')
}

// ---------- the band above the prompt ----------

type Resolved = Parameters<$T['ui']['resolve']>[0]
type Children = Parameters<ReturnType<$T['ui']['resolve']>['Box']>[0]['children']
type Look = { label: string, color: string, bg: string }

// The shared grid of the RelAI bars above the prompt (BAND, BAR; docs/zasoby/PANEL_RELAI/
// STYL_PASKOW_CLAUDE.md), the same as relai-panel's and relai-progress's: the label column, the
// content, the figure on the right edge; a soft background, no colored frame. Box has no corner
// radius (2.1.293): on the desktop a border in the background's own color only rounds the
// corners; the terminal draws none. Below BAR.narrow columns the label and the figure go on top.
function barCard($: $T, e: Resolved, columns: number, key: string, look: Look, middle: Children, figure: readonly [string, string] | null) {
  const { Box, Text } = $.ui.resolve(e)
  const isGui = e.surface !== 'terminal'
  const frame = isGui ? { borderStyle: 'round' as const, borderColor: look.bg } : {}
  const label = <Text bold color={look.color}>{look.label}</Text>
  if (columns < BAR.narrow) {
    return (
      <Box key={key} flexDirection="column" backgroundColor={look.bg} paddingX={1} {...frame}>
        <Box key="head" flexDirection="row" flexWrap="wrap" justifyContent="space-between" columnGap={2}>
          <Box key="label">{label}</Box>
          {figure ? <Box key="figure"><Text bold color={BAR.text}>{figure[0]}</Text><Text color={BAR.muted}>{' ' + figure[1]}</Text></Box> : null}
        </Box>
        <Box key="middle" flexDirection="column">{middle}</Box>
      </Box>
    )
  }
  return (
    <Box key={key} flexDirection="row" alignItems="center" columnGap={2} backgroundColor={look.bg} paddingX={1} {...frame}>
      <Box key="label" width={BAR.labelColumn} flexShrink={0}>{label}</Box>
      <Box key="middle" flexDirection="column" flexGrow={1} flexShrink={1}>{middle}</Box>
      <Box key="figure" minWidth={BAR.figureColumn} flexShrink={0} flexDirection="row" justifyContent="flex-end">
        {figure ? [<Text key="value" bold color={BAR.text}>{figure[0]}</Text>, <Text key="unit" color={BAR.muted}>{' ' + figure[1]}</Text>] : []}
      </Box>
    </Box>
  )
}

// The figure on the right: the time the cache has left, in its real unit; never a seeming zero
function cacheFigure(st: { kind: string, left: number }, tilde: string): readonly [string, string] {
  if (st.kind === 'unknown') return ['brak danych', 'czasu cache']
  if (st.kind === 'kept') return [clock(S.keepWarmUntil), 'koniec podtrzymania']
  if (st.kind === 'cold') return ['zimny', `od ${minutes(-st.left)}`]
  if (st.left < MIN) return [`${tilde}${Math.max(1, Math.round(st.left / 1000))}`, 's do końca']
  return [`${tilde}${Math.round(st.left / MIN)}`, 'min do końca']
}

function band($: $T, e: Resolved, columns: number, now: number) {
  const { Box, Text, Button } = $.ui.resolve(e)
  const st = state(now)
  const big = S.ctx >= settings.bigTokens
  const tilde = ttlAssumed() ? '~' : ''
  const head =
    st.kind === 'kept' ? <Text key="state" bold color={BAND.progress.color}>{`◆ Podtrzymywany · ${S.pings} pingów ${usd(S.pingUsd)}`}</Text>
    : st.kind === 'warm' ? <Text key="state" bold color={BAND.progress.color}>Cache ciepły</Text>
    : st.kind === 'cooling' ? <Text key="state" bold color={BAND.panel.color}>Cache stygnie</Text>
    : st.kind === 'cold' ? <Text key="state" bold color={big ? BAND.cache.color : BAR.muted}>Cache zimny</Text>
    : <Text key="state" color={BAR.muted}>Cache nieznany</Text>
  const rewrite = usd(rewriteAt(S.ctx))
  const meta = [
    st.kind === 'cold' && big
      ? <Text key="ctx" color={BAND.cache.color}>{`${tokens(S.ctx)} · następne wysłanie zapisze ponownie ≈ ${rewrite}`}</Text>
      : <Text key="ctx" color={BAR.muted}>{`${tokens(S.ctx)} · zapis ≈ ${rewrite}`}</Text>,
  ]
  if (S.rateLimits.length) {
    const top = Math.max(...S.rateLimits.map((l) => l.percentUsed || 0))
    meta.push(<Text key="limits" color={top >= 95 ? BAND.cache.color : top >= 80 ? BAND.panel.color : BAR.muted}>{limitsText(S.rateLimits)}</Text>)
  }
  meta.push(<Text key="session" color={BAR.muted}>{`sesja ≈ ${usd(S.costUsd)}`}</Text>)
  // Native buttons side by side (no plain: on a painted background it inverts under the cursor,
  // P-018). No digit hotkey: a bare digit in an empty composer would press it (Z5); letters stay
  const actions = []
  if (st.kind === 'cooling' || (st.kind === 'warm' && big)) {
    actions.push(<Button key="keepwarm" label="Podtrzymaj" variant="secondary" onPress={async () => {
      const text = startKeepWarm($, await $.clock.now(), settings.keepWarmHours)
      if (!S.keepWarm) $.ui.toast(text, { timeoutMs: 10_000 })
      $.ui.invalidate('ui.render')
    }} />)
  } else if (st.kind === 'kept') {
    actions.push(<Button key="keepwarm" label="Zatrzymaj" variant="secondary" onPress={() => { stopKeepWarm($, 'wyłączone ręcznie'); $.ui.invalidate('ui.render') }} />)
  }
  if (H.phase === 'ready') actions.push(<Button key="continue" label="Wyczyść i kontynuuj" hotkey="c" variant="secondary" onPress={() => clearAndContinue($)} />)
  const label = H.phase === 'running' ? 'Przekazanie trwa' : H.phase === 'continuing' ? 'Czyszczę' : S.isRelai ? 'Przekaż (RelAI)' : 'Przekaż'
  actions.push(<Button key="handoff" label={label} hotkey="h" variant="secondary" dimColor={H.phase !== 'idle'} onPress={() => startHandoff($)} />)
  const middle = [
    <Box key="cache-state" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={3}>
      <Box key="state">{head}</Box>
      <Box key="cache-actions" flexDirection="row" flexWrap="wrap" columnGap={2}>{actions}</Box>
    </Box>,
    // A line apart from the state and its buttons on the desktop (calibration 2026-10-09)
    <Box key="cache-meta" flexDirection="row" flexWrap="wrap" columnGap={3} marginTop={e.surface === 'terminal' ? 0 : 1}>{meta}</Box>,
  ]
  return barCard($, e, columns, 'relai-cache-card', BAND.cache, middle, cacheFigure(st, tilde))
}

// ---------- hooks ----------

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const now = await $.clock.now()
    home = (await $.env.get('USERPROFILE')) || (await $.env.get('HOME')) || ''
    const here = await $.session.cwd()
    const root = await relaiRoot($, here)
    S = { ...FRESH, id: await $.session.id(), cwd: root ?? here, model: await $.session.model(), isRelai: root !== null }
    settings = mergeSettings(await $.store.get(STORE_SETTINGS))
    await loadPrices($)
    await restoreSnap($, now)
    names = {
      cache: await registerCommand($, 'cache', 'Stan cache promptu i ustawienia relai-cache-keeper', '[ttl 5|60|auto] [straznik on|off] [prog 150k] [alerty on|off] [progi 10,5]'),
      keepwarm: await registerCommand($, 'keepwarm', 'Podtrzymuj cache tej sesji (domyślnie 4 h) albo /keepwarm off', '[godziny|off]'),
      handoff: await registerCommand($, 'handoff', 'Przekazanie do świeżego czatu (w projekcie RelAI przez dokumenty); /handoff dalej kończy', '[dalej]'),
    }
    $.clock.every(TICK_MS, () => { tick($).catch(() => {}) })
    return next(e)
  })

  // The ending conversation's snapshot goes; a /clear starts the keeper afresh (Z5). The new id
  // may not answer yet: then the next followSession adopts it without another reset
  on('session.end', async ($, e, next) => {
    const ending = e.sessionId || S.id
    if (ending) await $.store.delete('snap:' + ending).catch(() => {})
    if (e.reason === 'clear') {
      const id = await $.session.id().catch(() => '')
      resetSession($, id !== ending ? id : '')
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
    set({ ctx: totalInput(u), lastActivity: now, justCompacted: false })
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
        costUsd: usage.cost ? usage.cost.usd : S.costUsd,
        rateLimits: usage.rateLimits?.length ? usage.rateLimits : S.rateLimits,
      })
    }
    if (H.phase === 'running' && e.turnId !== H.notTurn) {
      await captureHandoff($, e.reason === 'answer' ? e.answer : '', now)
    }
    await saveSnap($, now)
    $.ui.invalidate('ui.render')
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    set({ justCompacted: true })
    return r
  })

  on('session.measure', async ($, e, next) => {
    if (e.context?.tokens) set({ ctx: e.context.tokens })
    if (e.cost) set({ costUsd: e.cost.usd })
    if (e.rateLimits?.length) set({ rateLimits: e.rateLimits })
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
    if (!key) return { text: statusText(now) }
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
    if (!S.lastActivity && !S.keepWarm && H.phase === 'idle') return next(e)
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
