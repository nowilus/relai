'use strict';

// Cennik panelu RelAI (plan PANEL_CLAUDE, E3): datowany, ze zrodlem; rekord wyceniany modelem,
// ktory odpowiedzial; brak ceny slowami, nigdy zerem.

const assert = require('node:assert/strict');
const test = require('node:test');

const p = require('../pricing.mjs');

const rec = (over) => ({
  v: 1, tool: 'claude-code', session: 's', turn: 't', index: 0, agent: null, kind: 'step', model: 'claude-opus-5-5', at: 0,
  input: 0, cacheRead: 0, cacheWrite: 0, output: 0, missing: null, ...over,
});

test('the price list is dated and names its source', () => {
  assert.match(p.PRICING.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(p.PRICING.source.length > 10);
  assert.deepEqual(p.PRICING.models['claude-opus-5-5'], { input: 4, output: 20 }, 'plan PANEL_CLAUDE, sekcja 5, FAKT 2026-10-08');
  assert.equal(p.PRICING.readMult, 0.05);
  assert.deepEqual({ ...p.PRICING.writeMult }, { '1h': 2, '5m': 1.25 });
});

test('the four categories at their own rates; the cache write by the loop that made it', () => {
  const one = 1_000_000;
  const usd = (over) => p.priceRecord(rec(over)).usd.toFixed(6);
  assert.equal(usd({ input: one }), '4.000000');
  assert.equal(usd({ output: one }), '20.000000');
  assert.equal(usd({ cacheRead: one }), '0.200000');
  assert.equal(usd({ cacheWrite: one }), '8.000000', 'main loop: 1-hour cache, x2');
  assert.equal(usd({ cacheWrite: one, agent: 'a1' }), '5.000000', 'subagent: 5-minute cache, x1.25 (sonda E3)');
  assert.equal(usd({ cacheWrite: one, kind: 'compact' }), '5.000000', 'compaction: 5-minute cache too (sonda E3)');
});

test('the model is matched without a context-window suffix', () => {
  assert.equal(p.priceRecord(rec({ model: 'claude-opus-5-5[1m]', output: 1_000_000 })).usd.toFixed(6), '20.000000');
  assert.equal(p.modelPrice('claude-opus-5-5', p.PRICING).input, 4);
});

test('no price: words naming the model; no measurement: words, never zero', () => {
  const x = p.priceRecord(rec({ model: 'claude-haiku-4-5-20251001', output: 5 }));
  assert.equal(x.usd, null);
  assert.equal(x.missing, 'brak ceny dla claude-haiku-4-5-20251001');
  const y = p.priceRecord(rec({ model: null, output: 5 }));
  assert.equal(y.missing, 'brak ceny dla nieznanego modelu');
  const z = p.priceRecord(rec({ input: null, cacheRead: null, cacheWrite: null, output: null, missing: 'odpowiedź bez usage' }));
  assert.equal(z.usd, null);
  assert.equal(z.missing, 'odpowiedź bez usage');
});
