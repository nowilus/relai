// RelAI core / panel: cache-timer — the prompt-cache timer of the RelAI panel, pure logic.
//
// Carried over from the private mod cache-keeper-pl (hooks/core.ts, 2026-10-08), minus
// keep-warm and the cold-send guard: those stay in that mod (plan PANEL_CLAUDE, non-goals).
// No engine API here, no Node API either: the same file runs under `node --test` and inside
// the Claude Code hooks environment, which loads every file as an ES module and refuses
// imports from outside the plugin's folder. That is why this file is ESM (`.mjs`) while the
// rest of core/ is CommonJS, and why panel/hooks/core/ carries a byte-identical copy written
// by core/tools/sync-panel-core.js. This file is the only source; never edit the copy.
//
// What the timer can and cannot say: it counts down from the last request that read or wrote
// the cache. The end of the countdown is a forecast from the TTL, never a proof that the
// cache is gone; the TTL is "assumed" until a request has measured it.

export const MIN = 60_000;

/** Minutes before the end of the window at which the panel warns, descending. */
export const DEFAULT_WARN_MIN = Object.freeze([10, 5]);

/** TTL used while nothing has been measured (the subscription default, 2026-08-20 record). */
export const ASSUMED_TTL_MIN = 60;

/** Below this many prompt tokens a request says nothing about the cache. */
export const SMALL_REQUEST_TOKENS = 30_000;

/** An idle gap longer than this tells the 5-minute TTL from the 1-hour one. */
export const LONG_GAP_MS = 5.5 * MIN;

/** One rewrite after a long gap proves nothing; this many in a row measure the 5-minute TTL. */
export const SHORT_TTL_REWRITES = 2;

/**
 * @typedef {{
 *   input_tokens?: number,
 *   output_tokens?: number,
 *   cache_read_input_tokens?: number,
 *   cache_creation_input_tokens?: number
 * }} Usage
 * @typedef {'unknown' | 'warm' | 'cooling' | 'cold'} CacheKind
 * @typedef {{ kind: 'compacted' | 'rewrite' | 'hit' | 'small', ttlMeasured?: 5 | 60 }} StepVerdict
 * @typedef {{ ttlMeasured: 0 | 5 | 60, shortTtlRewrites: number }} TtlState
 */

/** @type {TtlState} */
export const UNMEASURED = Object.freeze({ ttlMeasured: 0, shortTtlRewrites: 0 });

/**
 * Every prompt token of one request: uncached, read from the cache, written to it.
 * @param {Usage | undefined} u
 * @returns {number}
 */
export function totalInput(u) {
  if (!u) return 0;
  return (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
}

/**
 * The window in force and whether it is a measurement or an assumption.
 * @param {TtlState} ttl
 * @returns {{ ttlMin: number, isAssumed: boolean }}
 */
export function effectiveTtl(ttl) {
  return ttl.ttlMeasured ? { ttlMin: ttl.ttlMeasured, isAssumed: false } : { ttlMin: ASSUMED_TTL_MIN, isAssumed: true };
}

/**
 * Milliseconds left in the window; null before the first request of the session.
 * @param {number} lastActivity
 * @param {number} ttlMin
 * @param {number} now
 * @returns {number | null}
 */
export function msLeft(lastActivity, ttlMin, now) {
  return lastActivity ? ttlMin * MIN - (now - lastActivity) : null;
}

/**
 * unknown (no request yet) / warm / cooling (inside the first warning threshold) / cold.
 * @param {number} lastActivity
 * @param {number} ttlMin
 * @param {number} now
 * @param {readonly number[]} [warnMin]
 * @returns {{ kind: CacheKind, left: number }}
 */
export function cacheState(lastActivity, ttlMin, now, warnMin = DEFAULT_WARN_MIN) {
  const left = msLeft(lastActivity, ttlMin, now);
  if (left === null) return { kind: 'unknown', left: 0 };
  if (left <= 0) return { kind: 'cold', left };
  if (left <= Math.max(0, ...warnMin) * MIN) return { kind: 'cooling', left };
  return { kind: 'warm', left };
}

/**
 * The smallest threshold already crossed and not yet announced, or null.
 * @param {number} left
 * @param {readonly number[]} warnMin
 * @param {readonly number[]} announced
 * @returns {number | null}
 */
export function dueWarning(left, warnMin, announced) {
  const crossed = warnMin.filter((m) => left > 0 && left <= m * MIN && !announced.includes(m));
  return crossed.length ? Math.min(...crossed) : null;
}

/**
 * One main-loop request: did it read the cache or write it again? gap = idle time before it.
 * @param {Usage} u
 * @param {number} gap
 * @param {boolean} hadActivity
 * @param {boolean} afterCompact
 * @param {number} ttlKnown
 * @returns {StepVerdict}
 */
export function judgeStep(u, gap, hadActivity, afterCompact, ttlKnown) {
  const total = totalInput(u);
  if (afterCompact) return { kind: 'compacted' };
  if (!hadActivity || total <= SMALL_REQUEST_TOKENS) return { kind: 'small' };
  const written = u.cache_creation_input_tokens || 0;
  if (written / total > 0.5) {
    // A rewrite after 5-60 idle minutes points at the 5-minute TTL
    const isShortGap = gap > LONG_GAP_MS && gap < ttlKnown * MIN;
    return isShortGap ? { kind: 'rewrite', ttlMeasured: 5 } : { kind: 'rewrite' };
  }
  // A hit after more than 5 idle minutes proves the 1-hour TTL
  const read = (u.cache_read_input_tokens || 0) / total;
  return gap > LONG_GAP_MS && read > 0.8 ? { kind: 'hit', ttlMeasured: 60 } : { kind: 'hit' };
}

/**
 * The TTL after one verdict: 60 on the first long-gap hit, 5 only after
 * SHORT_TTL_REWRITES long-gap rewrites in a row. Returns a new object.
 * @param {TtlState} ttl
 * @param {StepVerdict} verdict
 * @returns {TtlState}
 */
export function applyVerdict(ttl, verdict) {
  if (verdict.ttlMeasured === 60) return { ttlMeasured: 60, shortTtlRewrites: 0 };
  if (verdict.ttlMeasured === 5) {
    const seen = ttl.shortTtlRewrites + 1;
    return { ttlMeasured: seen >= SHORT_TTL_REWRITES ? 5 : ttl.ttlMeasured, shortTtlRewrites: seen };
  }
  return ttl;
}
