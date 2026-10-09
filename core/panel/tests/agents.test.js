'use strict';

// Lista agentow na zywo dla relai-progress (plan PANEL_CLAUDE, E9, Aneks C).
// Zdarzenia z sondy relai-probe-e9 (2026-10-09): agent.spawn -> agentId i model; turn.step
// z agentId; turn.complete z agentId i reason. $.agent.list() zapomina zakonczonych, wiec liste
// prowadzi rdzen. Koszt agenta wylacznie z rekordow kolektora E3 — bez drugiego liczenia.

const assert = require('node:assert/strict');
const test = require('node:test');

const a = require('../agents.mjs');
const { stepRecord } = require('../measure.mjs');
const { priceRecord } = require('../pricing.mjs');

const SPAWN = { id: 'a2cdd79804dae736c', type: 'Explore', description: 'Probe subagent lifecycle', model: 'claude-haiku-5-5', at: 1000 };

test('spawned adds a running agent; the same id again replaces it, the list keeps its order', () => {
  const one = a.spawned([], SPAWN);
  assert.equal(one.length, 1);
  assert.deepEqual(one[0], { ...SPAWN, status: 'running', endedAt: null, steps: 0, context: 0 });
  const two = a.spawned(one, { ...SPAWN, id: 'b', at: 2000 });
  const again = a.spawned(two, { ...SPAWN, description: 'nowy opis', at: 3000 });
  assert.deepEqual(again.map((x) => x.id), ['b', SPAWN.id]);
  assert.equal(again[1].description, 'nowy opis');
  assert.equal(one.length, 1, 'the input list is not changed');
});

test('the list keeps the newest MAX_AGENTS', () => {
  let list = [];
  for (let i = 0; i < a.MAX_AGENTS + 5; i++) list = a.spawned(list, { ...SPAWN, id: 'x' + i, at: i });
  assert.equal(list.length, a.MAX_AGENTS);
  assert.equal(list[0].id, 'x5');
});

test('stepped counts the step and the context of the last request; other agents untouched', () => {
  const list = a.spawned(a.spawned([], SPAWN), { ...SPAWN, id: 'b' });
  const after = a.stepped(list, SPAWN.id, { input_tokens: 10, cache_read_input_tokens: 2000, cache_creation_input_tokens: 300, output_tokens: 40, model: 'claude-haiku-5-5' });
  assert.equal(after[0].steps, 1);
  assert.equal(after[0].context, 2350);
  assert.deepEqual(after[1], list[1]);
  assert.equal(a.stepped(list, 'nieznany', {}), list, 'an unknown id changes nothing');
});

test('finished: answer is done, aborted is stopped, anything else failed; time kept', () => {
  const list = a.spawned([], SPAWN);
  assert.deepEqual([a.finished(list, SPAWN.id, 'answer', 5000)[0].status, a.finished(list, SPAWN.id, 'answer', 5000)[0].endedAt], ['done', 5000]);
  assert.equal(a.finished(list, SPAWN.id, 'aborted', 5000)[0].status, 'stopped');
  assert.equal(a.finished(list, SPAWN.id, 'error', 5000)[0].status, 'failed');
  assert.equal(a.finished(list, SPAWN.id, 'refusal', 5000)[0].status, 'failed');
});

const rec = (agent, index, usage, model = 'claude-opus-5-5') => stepRecord({ session: 's', turn: 't-' + (agent ?? 'main'), index, agent, model, at: index, usage: usage && { ...usage, model } });
const U = { input_tokens: 1000, cache_read_input_tokens: 20000, cache_creation_input_tokens: 5000, output_tokens: 800, model: 'claude-haiku-5-5' };

test('agentCost is the sum of the agent\'s own records, nothing of main or of other agents', () => {
  const records = [rec(SPAWN.id, 0, U), rec(SPAWN.id, 1, U), rec(null, 0, U), rec('b', 0, U)];
  const c = a.agentCost(records, SPAWN.id, priceRecord);
  const want = priceRecord(records[0]).usd + priceRecord(records[1]).usd;
  assert.ok(want > 0, 'opus has a price in the list (positive control)');
  assert.equal(c.records, 2);
  assert.equal(c.isPartial, false);
  assert.ok(Math.abs(c.usd - want) < 1e-12);
});

test('a record seen twice counts once (merged by key)', () => {
  const r = rec(SPAWN.id, 0, U);
  assert.equal(a.agentCost([r, r], SPAWN.id, priceRecord).records, 1);
});

test('no records is null (said in words by the caller), a record without usage is partial', () => {
  assert.equal(a.agentCost([rec(null, 0, U)], SPAWN.id, priceRecord), null);
  const c = a.agentCost([rec(SPAWN.id, 0, U), rec(SPAWN.id, 1, null)], SPAWN.id, priceRecord);
  assert.equal(c.isPartial, true);
  assert.equal(c.records, 2);
});

test('counts: running and finished', () => {
  const list = a.finished(a.spawned(a.spawned([], SPAWN), { ...SPAWN, id: 'b' }), 'b', 'answer', 9);
  assert.deepEqual(a.counts(list), { running: 1, finished: 1, done: 1, broken: 0 });
  assert.deepEqual(a.counts([]), { running: 0, finished: 0, done: 0, broken: 0 });
});

test('agentsLabel names each state with its mark, never running/all (calibration 2026-10-09)', () => {
  const two = a.spawned(a.spawned([], SPAWN), { ...SPAWN, id: 'b' });
  assert.equal(a.agentsLabel(two), 'Agenci ● 2 działa');
  const ended = a.finished(a.finished(two, SPAWN.id, 'answer', 9), 'b', 'answer', 9);
  assert.equal(a.agentsLabel(ended), 'Agenci ✓ 2');
  const mixed = a.finished(a.spawned(ended, { ...SPAWN, id: 'c' }), SPAWN.id, 'aborted', 9);
  assert.equal(a.agentsLabel(mixed), 'Agenci ● 1 działa · ✓ 1 · ✗ 1');
  assert.equal(a.agentsLabel([]), 'Agenci');
});

test('a model missing from the dated price list makes the agent partial, never zero (E6 refreshes the list)', () => {
  const c = a.agentCost([rec(SPAWN.id, 0, U, 'claude-haiku-5-5')], SPAWN.id, priceRecord);
  assert.equal(c.isPartial, true);
  assert.equal(c.usd, null);
});
