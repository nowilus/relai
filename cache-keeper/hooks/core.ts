// Pure logic: cache state, warnings, keep-warm decisions, settings. No `$` here, so tests reach it directly.

import { DEFAULT_PAYBACK_TURNS } from './economics'
import { totalInput, type Usage } from './pricing'

export const MIN = 60_000

export type Settings = {
  ttlMin: 0 | 5 | 60 // 0 = auto (measured, else 60)
  guard: boolean
  bigTokens: number // cold-send guard threshold
  alerts: boolean
  alertTokens: number // cooling toasts only for caches at least this big
  warnMin: number[] // minutes before expiry, descending
  keepWarmHours: number
  maxLimitPercent: number // keep-warm stops at this plan-limit usage
  paybackTurns: number // a fresh session paying off within this many turns opens the cache bar's event (Z9)
}

export const DEFAULT_SETTINGS: Settings = {
  ttlMin: 0,
  guard: true,
  bigTokens: 150_000,
  alerts: true,
  alertTokens: 50_000,
  warnMin: [10, 5],
  keepWarmHours: 4,
  maxLimitPercent: 90,
  paybackTurns: DEFAULT_PAYBACK_TURNS,
}

export const MAX_PAYBACK_TURNS = 50

export type CacheKind = 'unknown' | 'kept' | 'warm' | 'cooling' | 'cold'

export function msLeft(lastActivity: number, ttlMin: number, now: number): number | null {
  return lastActivity ? ttlMin * MIN - (now - lastActivity) : null
}

export function cacheState(
  lastActivity: number,
  ttlMin: number,
  now: number,
  keepWarm: boolean,
  warnMin: number[],
): { kind: CacheKind; left: number } {
  const left = msLeft(lastActivity, ttlMin, now)
  if (left === null) return { kind: 'unknown', left: 0 }
  if (keepWarm) return { kind: 'kept', left }
  if (left <= 0) return { kind: 'cold', left }
  if (left <= Math.max(0, ...warnMin) * MIN) return { kind: 'cooling', left }
  return { kind: 'warm', left }
}

// The smallest threshold already crossed and not yet announced, or null
export function dueWarning(left: number, warnMin: number[], announced: number[]): number | null {
  const crossed = warnMin.filter((m) => left > 0 && left <= m * MIN && !announced.includes(m))
  return crossed.length ? Math.min(...crossed) : null
}

// Ping a little before expiry: 8 min ahead on the 1-hour TTL, 90 s on the 5-minute one
export function pingDue(now: number, lastActivity: number, ttlMin: number): boolean {
  if (!lastActivity) return false
  const margin = ttlMin >= 60 ? 8 * MIN : 90_000
  return now - lastActivity >= ttlMin * MIN - margin
}

// A ping must read the cache. Writing more than a tenth of what it read means it missed.
export function pingMissed(u: Usage): boolean {
  return (u.cache_creation_input_tokens || 0) > 0.1 * Math.max(1, u.cache_read_input_tokens || 0)
}

export type StepVerdict = { kind: 'compacted' | 'rewrite' | 'hit' | 'small'; ttlMeasured?: 5 | 60 }

// One main-loop request: did it read the cache or rewrite it? gap = idle time before it.
export function judgeStep(u: Usage, gap: number, hadActivity: boolean, afterCompact: boolean, ttlKnown: number): StepVerdict {
  const total = totalInput(u)
  if (afterCompact) return { kind: 'compacted' }
  if (!hadActivity || total <= 30_000) return { kind: 'small' }
  const written = u.cache_creation_input_tokens || 0
  if (written / total > 0.5) {
    // A rewrite after 5-60 idle minutes means the 5-minute TTL
    const ttlMeasured = gap > 5.5 * MIN && gap < ttlKnown * MIN ? 5 : undefined
    return { kind: 'rewrite', ttlMeasured }
  }
  // A hit after more than 5 idle minutes proves the 1-hour TTL
  const read = (u.cache_read_input_tokens || 0) / total
  return { kind: 'hit', ttlMeasured: gap > 5.5 * MIN && read > 0.8 ? 60 : undefined }
}

export function parseTokens(text: string): number | null {
  const m = String(text || '').trim().toLowerCase().match(/^(\d+(?:[.,]\d+)?)\s*([km]?)$/)
  if (!m || !m[1]) return null
  const n = Number(m[1].replace(',', '.'))
  return Math.round(n * (m[2] === 'm' ? 1e6 : m[2] === 'k' ? 1e3 : 1))
}

const ON = ['on', 'tak', 'wl', 'wł']
const OFF = ['off', 'nie', 'wyl', 'wył']

function onOff(value: string): boolean | null {
  if (ON.includes(value)) return true
  if (OFF.includes(value)) return false
  return null
}

// `/cache <key> <value>`, Polish and English keys. Returns a new object, never mutates.
export function applySetting(s: Settings, rawKey: string, rawValue: string): { settings: Settings; error?: string } {
  const key = rawKey.toLowerCase()
  const value = String(rawValue || '').toLowerCase()
  const fail = (error: string) => ({ settings: s, error })
  if (key === 'ttl') {
    if (value === 'auto') return { settings: { ...s, ttlMin: 0 } }
    if (value === '5' || value === '60') return { settings: { ...s, ttlMin: Number(value) as 5 | 60 } }
    return fail('ttl przyjmuje 5, 60 albo auto')
  }
  if (key === 'straznik' || key === 'strażnik' || key === 'guard') {
    const v = onOff(value)
    return v === null ? fail('strażnik: on albo off') : { settings: { ...s, guard: v } }
  }
  if (key === 'alerty' || key === 'alerts') {
    const v = onOff(value)
    return v === null ? fail('alerty: on albo off') : { settings: { ...s, alerts: v } }
  }
  if (key === 'prog' || key === 'próg' || key === 'big') {
    const n = parseTokens(value)
    return n ? { settings: { ...s, bigTokens: n } } : fail('próg: liczba tokenów, np. 150k')
  }
  if (key === 'progi' || key === 'warn') {
    const list = value.split(/[,\s]+/).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n < 60)
    return list.length ? { settings: { ...s, warnMin: [...new Set(list)].sort((a, b) => b - a) } } : fail('progi: minuty, np. 10,5')
  }
  if (key === 'godziny' || key === 'hours') {
    const n = Number(value)
    return n > 0 && n <= 12 ? { settings: { ...s, keepWarmHours: n } } : fail('godziny: od 1 do 12')
  }
  if (key === 'limit') {
    const n = Number(value)
    return n > 0 && n <= 100 ? { settings: { ...s, maxLimitPercent: n } } : fail('limit: procent 1–100')
  }
  if (key === 'zwrot' || key === 'payback') {
    const n = Number(value)
    return Number.isInteger(n) && n >= 1 && n <= MAX_PAYBACK_TURNS
      ? { settings: { ...s, paybackTurns: n } }
      : fail(`zwrot: liczba wiadomości od 1 do ${MAX_PAYBACK_TURNS}`)
  }
  return fail(`nieznane ustawienie: ${rawKey}`)
}

export function mergeSettings(saved: unknown): Settings {
  if (!saved || typeof saved !== 'object') return DEFAULT_SETTINGS
  return { ...DEFAULT_SETTINGS, ...(saved as Partial<Settings>) }
}

export const RELAI_MARKER = /Wersja RelAI|RelAI version/
