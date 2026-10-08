'use strict';

// Timer cache panelu RelAI (plan PANEL_CLAUDE, E1). Rdzen jest ESM (.mjs), bo silnik modow nie
// laduje CommonJS; test wczytuje go przez require(esm) z Node 22.12+ / 24.

const assert = require('node:assert/strict');
const test = require('node:test');

const t = require('../cache-timer.mjs');

const MIN = t.MIN;
const T0 = 1_000_000;

test('cache state: unknown before any request, warm, cooling at the first threshold, cold after the TTL', () => {
  assert.equal(t.cacheState(0, 60, T0).kind, 'unknown');
  assert.equal(t.cacheState(T0, 60, T0 + 30 * MIN).kind, 'warm');
  assert.equal(t.cacheState(T0, 60, T0 + 50 * MIN + 1).kind, 'cooling');
  assert.equal(t.cacheState(T0, 60, T0 + 50 * MIN - 1).kind, 'warm');
  assert.equal(t.cacheState(T0, 60, T0 + 60 * MIN).kind, 'cold');
  assert.equal(t.cacheState(T0, 5, T0 + 1 * MIN).kind, 'cooling', 'a 5-minute window is inside the 10-minute threshold at once');
});

test('warnings: once per threshold, the 5-minute one after the 10-minute one, none after expiry', () => {
  assert.equal(t.dueWarning(9 * MIN, [10, 5], []), 10);
  assert.equal(t.dueWarning(9 * MIN, [10, 5], [10]), null);
  assert.equal(t.dueWarning(4 * MIN, [10, 5], [10]), 5);
  assert.equal(t.dueWarning(4 * MIN, [10, 5], []), 5, 'both crossed at once: the nearer one is announced');
  assert.equal(t.dueWarning(-1, [10, 5], []), null);
  assert.deepEqual([...t.DEFAULT_WARN_MIN], [10, 5]);
});

test('request verdict: compacted, small, rewrite, hit', () => {
  const big = { cache_read_input_tokens: 190_000, input_tokens: 100, cache_creation_input_tokens: 2_000 };
  assert.equal(t.judgeStep(big, 0, true, true, 60).kind, 'compacted');
  assert.equal(t.judgeStep(big, 0, false, false, 60).kind, 'small', 'first request of a session proves nothing');
  assert.equal(t.judgeStep({ input_tokens: 20_000 }, 0, true, false, 60).kind, 'small');
  assert.deepEqual(t.judgeStep(big, 1 * MIN, true, false, 60), { kind: 'hit' });
  const rewrite = { cache_creation_input_tokens: 180_000, input_tokens: 10 };
  assert.deepEqual(t.judgeStep(rewrite, 1 * MIN, true, false, 60), { kind: 'rewrite' });
});

test('TTL measurement: 60 from one hit after a long gap; 5 only after two long-gap rewrites', () => {
  const hit = t.judgeStep({ cache_read_input_tokens: 190_000, input_tokens: 100 }, 6 * MIN, true, false, 60);
  assert.deepEqual(hit, { kind: 'hit', ttlMeasured: 60 });
  assert.deepEqual(t.applyVerdict(t.UNMEASURED, hit), { ttlMeasured: 60, shortTtlRewrites: 0 });

  const rewrite = t.judgeStep({ cache_creation_input_tokens: 180_000, input_tokens: 10 }, 10 * MIN, true, false, 60);
  assert.deepEqual(rewrite, { kind: 'rewrite', ttlMeasured: 5 });
  const once = t.applyVerdict(t.UNMEASURED, rewrite);
  assert.deepEqual(once, { ttlMeasured: 0, shortTtlRewrites: 1 }, 'one rewrite alone proves nothing');
  const twice = t.applyVerdict(once, rewrite);
  assert.deepEqual(twice, { ttlMeasured: 5, shortTtlRewrites: 2 });
  assert.deepEqual(t.applyVerdict(twice, hit), { ttlMeasured: 60, shortTtlRewrites: 0 }, 'a later hit after a long gap wins');

  // A rewrite after a gap longer than the known TTL is an ordinary expiry, not a 5-minute measurement
  assert.deepEqual(t.judgeStep({ cache_creation_input_tokens: 180_000 }, 70 * MIN, true, false, 60), { kind: 'rewrite' });
  // A verdict without measurement returns the very same state (nothing to merge)
  assert.equal(t.applyVerdict(once, { kind: 'small' }), once);
});

test('effective TTL is marked as assumed until measured', () => {
  assert.deepEqual(t.effectiveTtl(t.UNMEASURED), { ttlMin: 60, isAssumed: true });
  assert.deepEqual(t.effectiveTtl({ ttlMeasured: 5, shortTtlRewrites: 2 }), { ttlMin: 5, isAssumed: false });
});

test('totalInput adds the three prompt categories and ignores output', () => {
  assert.equal(t.totalInput(undefined), 0);
  assert.equal(t.totalInput({ input_tokens: 1, cache_read_input_tokens: 10, cache_creation_input_tokens: 100, output_tokens: 1000 }), 111);
});

test('exported constants are frozen (nobody mutates the shared defaults)', () => {
  assert.ok(Object.isFrozen(t.DEFAULT_WARN_MIN));
  assert.ok(Object.isFrozen(t.UNMEASURED));
});
