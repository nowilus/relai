// relai-panel: the RelAI band above the prompt. Active plan and stage from CLAUDE.md and the
// plan's STATUS.md, a prompt-cache timer, the session's hypothetical API cost.
//
// The mod draws and calls; the core counts (plan PANEL_CLAUDE, section 5). Everything the band
// reckons with lives in ./core/*.mjs: a byte-identical copy of core/panel/ written by
// core/tools/sync-panel-core.js, because the engine refuses imports from outside the plugin.
//
// Silent outside a RelAI project. Never calls a model, never adds to the system prompt (R7),
// never reaches the network. When cache-keeper-pl runs in the session it owns the countdown,
// so the band hides its own timer (plan, section 8).

import type { EngineInterface, Register } from 'claude-code'
import { DEFAULT_WARN_MIN, MIN, UNMEASURED, applyVerdict, cacheState, dueWarning, effectiveTtl, judgeStep, msLeft, totalInput } from './core/cache-timer.mjs'
import type { TtlState, Usage } from './core/cache-timer.mjs'
import { planState } from './core/plan-state.mjs'
import type { PlanState } from './core/plan-state.mjs'
import { clip, join, minutes, tokens, usd } from './fmt'

type $T = EngineInterface

const TICK_MS = 30_000
const RELAI_MARKER = /Wersja RelAI|RelAI version/
const KEEPER_COMMANDS = ['cache', 'ckp-cache']
const WARN_MIN_TOKENS = 50_000 // below this a cache rewrite costs too little to interrupt anyone
const SNAP_MAX_AGE = 2 * 60 * MIN
const NARROW_COLUMNS = 100

type Session = {
  id: string
  cwd: string
  isRelai: boolean
  plan: PlanState
  hasKeeper: boolean
  lastActivity: number // last main-loop request that read or wrote the cache
  ttl: TtlState
  ctx: number
  costUsd: number | null
  justCompacted: boolean
  announcedFor: number // the lastActivity the announced warnings belong to
  announced: number[]
}

// The timer part is what survives a hot reload and a resume, through $.store
type Snap = Pick<Session, 'id' | 'lastActivity' | 'ttl' | 'ctx' | 'costUsd' | 'announcedFor' | 'announced'> & { savedAt: number }

const FRESH: Session = {
  id: '', cwd: '', isRelai: false, plan: { kind: 'none' }, hasKeeper: false, lastActivity: 0, ttl: UNMEASURED,
  ctx: 0, costUsd: null, justCompacted: false, announcedFor: 0, announced: [],
}

// Replaced, never mutated in place; a reload starts it over and session.start restores it
let S: Session = FRESH
let ticking = false

const set = (patch: Partial<Session>) => { S = { ...S, ...patch } }
const snapKey = () => 'snap:' + S.id

async function readText($: $T, path: string): Promise<string | null> {
  try {
    return (await $.fs.exists(path)) ? await $.fs.read(path) : null
  } catch {
    return null
  }
}

async function detectRelai($: $T, cwd: string): Promise<boolean> {
  const text = await readText($, join(cwd, 'docs/USTAWIENIA.md'))
  return text !== null && RELAI_MARKER.test(text)
}

async function readPlan($: $T): Promise<PlanState> {
  const claude = await readText($, join(S.cwd, 'CLAUDE.md'))
  return planState(claude, (rel) => readText($, join(S.cwd, rel)))
}

async function detectKeeper($: $T): Promise<boolean> {
  const list = await $.command.list().catch(() => [])
  return list.some((c) => KEEPER_COMMANDS.includes(c.name))
}

async function saveSnap($: $T, now: number) {
  if (!S.id) return
  const snap: Snap = { id: S.id, lastActivity: S.lastActivity, ttl: S.ttl, ctx: S.ctx, costUsd: S.costUsd, announcedFor: S.announcedFor, announced: S.announced, savedAt: now }
  await $.store.set(snapKey(), snap).catch(() => undefined)
}

async function restoreSnap($: $T, now: number) {
  const snap = (await $.store.get(snapKey()).catch(() => undefined)) as Snap | undefined
  if (!snap || snap.id !== S.id || now - snap.savedAt > SNAP_MAX_AGE) return
  const { savedAt: _saved, ...rest } = snap
  set(rest)
}

// Refresh what the band reads from the project and the session after each turn
async function refresh($: $T) {
  const [plan, hasKeeper, usage] = await Promise.all([readPlan($), detectKeeper($), $.session.usage().catch(() => null)])
  set({
    plan,
    hasKeeper,
    ctx: usage?.context?.tokens || S.ctx,
    costUsd: usage?.cost ? usage.cost.usd : S.costUsd,
  })
}

function warnStep($: $T, now: number) {
  if (S.hasKeeper || S.ctx < WARN_MIN_TOKENS) return
  const { ttlMin, isAssumed } = effectiveTtl(S.ttl)
  const left = msLeft(S.lastActivity, ttlMin, now)
  if (left === null) return
  const announced = S.announcedFor === S.lastActivity ? S.announced : []
  const due = dueWarning(left, DEFAULT_WARN_MIN, announced)
  if (due === null) return
  set({ announcedFor: S.lastActivity, announced: [...announced, ...DEFAULT_WARN_MIN.filter((m) => m >= due)] })
  $.ui.toast(`RelAI: cache ${tokens(S.ctx)} tokenów wygaśnie za ~${minutes(left)}${isAssumed ? ' (TTL założony, nie zmierzony)' : ''}. Koniec odliczania to prognoza, nie dowód utraty cache.`, { timeoutMs: 15_000 })
}

async function tick($: $T) {
  const now = await $.clock.now()
  warnStep($, now)
  $.ui.invalidate('ui.render')
}

// ---------- the band ----------
// Keys sit on Box: the engine keeps a Box's key and drops a Text's (seen in plugin test, 2.1.293)

function planText(isNarrow: boolean): string {
  const p = S.plan
  if (p.kind === 'none') return 'RelAI · brak aktywnego planu'
  if (p.kind === 'unknown') return `RelAI · plan nieznany: ${p.reason}`
  const progress = `${p.closed}/${p.stages}`
  if (!p.stage) return `RelAI · ${p.plan} · ${p.planStatus ?? 'status nieznany'} · ${progress}`
  const name = isNarrow ? '' : ` ${clip(p.stage.name, 40)}`
  return `RelAI · ${p.plan} · ${p.stage.id} ${p.stage.status}${name} · ${progress}`
}

function band($: $T, e: Parameters<$T['ui']['resolve']>[0], columns: number, now: number) {
  const { Box, Text } = $.ui.resolve(e)
  const isNarrow = columns < NARROW_COLUMNS
  const parts = [<Box key="plan"><Text bold>{planText(isNarrow)}</Text></Box>]
  if (!S.hasKeeper) {
    const { ttlMin, isAssumed } = effectiveTtl(S.ttl)
    const st = cacheState(S.lastActivity, ttlMin, now, DEFAULT_WARN_MIN)
    const tilde = isAssumed ? '~' : ''
    const timer =
      st.kind === 'warm' ? <Box key="timer"><Text color="green">{` │ ● cache ciepły ${tilde}${minutes(st.left)}`}</Text></Box>
      : st.kind === 'cooling' ? <Box key="timer"><Text color="yellow" bold>{` │ ◐ cache stygnie ${tilde}${minutes(st.left)}`}</Text></Box>
      : st.kind === 'cold' ? <Box key="timer"><Text dimColor>{` │ ○ cache prawdopodobnie zimny od ${tilde}${minutes(-st.left)}`}</Text></Box>
      : <Box key="timer"><Text dimColor>{' │ · cache nieznany'}</Text></Box>
    parts.push(timer)
  }
  if (!isNarrow) parts.push(<Box key="cost"><Text dimColor>{` │ sesja ≈ ${usd(S.costUsd)} wg cennika API`}</Text></Box>)
  return <Box key="relai-band" flexDirection="row" width="100%">{parts}</Box>
}

// ---------- hooks ----------

export const register: Register = (on) => {
  on('session.start', async ($, e, next) => {
    const cwd = await $.session.cwd()
    const isRelai = await detectRelai($, cwd)
    S = { ...FRESH, id: await $.session.id(), cwd, isRelai }
    if (!isRelai) return next(e)
    await restoreSnap($, await $.clock.now())
    await refresh($)
    if (!ticking) {
      ticking = true
      $.clock.every(TICK_MS, () => { tick($).catch(() => {}) })
    }
    return next(e)
  })

  // /clear, /resume and /branch start from an unknown cache under a new session id
  on('classic.SessionStart', { source: ['clear', 'resume', 'fork'] }, async ($, e, next) => {
    if (!S.isRelai) return next(e)
    const id = await $.session.id().catch(() => S.id)
    S = { ...FRESH, id, cwd: S.cwd, isRelai: true, plan: S.plan, hasKeeper: S.hasKeeper }
    $.ui.invalidate('ui.render')
    return next(e)
  }).catch(($, e, next) => next(e))

  on('session.end', async ($, e, next) => {
    if (S.isRelai && S.id) await $.store.delete(snapKey()).catch(() => undefined)
    return next(e)
  })

  // Each main-loop request: did it read the cache or write it again?
  on('turn.step', async function* ($, e, next) {
    const startedAt = await $.clock.now()
    const result = yield* next(e)
    if (!S.isRelai || e.agentId || !result || !result.usage) return result
    const now = await $.clock.now()
    const u = result.usage as Usage
    const gap = S.lastActivity ? startedAt - S.lastActivity : 0
    const verdict = judgeStep(u, gap, !!S.lastActivity, S.justCompacted, effectiveTtl(S.ttl).ttlMin)
    set({ ttl: applyVerdict(S.ttl, verdict), ctx: totalInput(u), lastActivity: now, justCompacted: false })
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!S.isRelai || e.agentId) return r
    await refresh($)
    await saveSnap($, await $.clock.now())
    $.ui.invalidate('ui.render')
    return r
  })

  on('session.compact', async ($, e, next) => {
    const r = await next(e)
    if (S.isRelai) set({ justCompacted: true })
    return r
  }).catch(($, e, next) => next(e))

  on('session.measure', async ($, e, next) => {
    if (S.isRelai) {
      if (e.context?.tokens) set({ ctx: e.context.tokens })
      if (e.cost) set({ costUsd: e.cost.usd })
    }
    return next(e)
  })

  // One band instance for every plugin: draw ours above whatever the plugins beneath draw
  // (cache-keeper-pl's band among them), never instead of it
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!S.isRelai || e.props.hasSurvey) return next(e)
    const below = await next(e)
    const ours = band($, e, e.props.bodyColumns, await $.clock.now())
    if (!below) return ours
    const { Box } = $.ui.resolve(e)
    // No width here: the engine refuses its own node under a Box with "width" and draws its own
    // instead, which drops every band (live, desktop, 2.1.293; plugin test does not see it)
    return <Box key="relai-panel" flexDirection="column">{[ours, below]}</Box>
  })
}
