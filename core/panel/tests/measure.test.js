'use strict';

// Pomiar wywolan modelu w panelu RelAI (plan PANEL_CLAUDE, E3): rekord, klucz bez podwojnego
// liczenia, odczyt pliku sesji, agregacja po sesji / agencie / modelu, braki slowami.
// Liczby z sondy relai-probe-e3 (2026-10-08, Claude Code 2.1.293), nie wymyslone.

const assert = require('node:assert/strict');
const test = require('node:test');

const m = require('../measure.mjs');
const p = require('../pricing.mjs');

const price = (r) => p.priceRecord(r);
const usage = (input, read, write, output, model = 'claude-opus-5-5') => ({
  input_tokens: input, cache_read_input_tokens: read, cache_creation_input_tokens: write, output_tokens: output, model,
});

// Sesja b5d50f8d z sondy: tura po /clear i tura po wznowieniu (5 krokow); /cost czlowieka: $0.57
const SESSION = 'b5d50f8d';
const STEPS = [
  ['ad1e1446', 0, usage(2, 15010, 52957, 663)],
  ['16710b5a', 0, usage(2, 67967, 1477, 161)],
  ['16710b5a', 1, usage(2, 69444, 412, 219)],
  ['16710b5a', 2, usage(2, 69856, 1211, 650)],
  ['16710b5a', 3, usage(2, 71067, 948, 158)],
  ['16710b5a', 4, usage(2, 72015, 279, 183)],
].map(([turn, index, u], i) => m.stepRecord({ session: SESSION, turn, index, agent: null, model: 'claude-opus-5-5', at: 1000 + i, usage: u }));

test('a step record carries the four categories, the model that answered and no content', () => {
  const r = m.stepRecord({ session: 's', turn: 't', index: 3, agent: 'a1', model: 'claude-opus-5-5[1m]', at: 7, usage: usage(1, 2, 3, 4, 'claude-opus-5-5') });
  assert.deepEqual(Object.keys(r).sort(), [...m.RECORD_FIELDS].sort(), 'the record holds exactly the schema fields');
  assert.equal(r.tool, 'claude-code');
  assert.equal(r.model, 'claude-opus-5-5', 'the model the API reports wins over the one the request named');
  assert.deepEqual([r.input, r.cacheRead, r.cacheWrite, r.output], [1, 2, 3, 4]);
  assert.equal(r.agent, 'a1');
  assert.equal(r.missing, null);
  for (const forbidden of ['answer', 'text', 'prompt', 'messages', 'toolUses']) assert.ok(!(forbidden in r), forbidden + ' must not be recorded');
});

test('a record carries the stage in progress and the crew task it belongs to, null when none (E4)', () => {
  const r = m.stepRecord({ session: 's', turn: 't', index: 0, agent: 'a1', model: 'claude-opus-5-5', at: 1, usage: usage(1, 2, 3, 4), stage: 'PANEL_CLAUDE/E4', task: '2026-10-09_120000/t2' });
  assert.equal(r.stage, 'PANEL_CLAUDE/E4');
  assert.equal(r.task, '2026-10-09_120000/t2');
  const bare = m.stepRecord({ session: 's', turn: 't', index: 1, agent: null, model: 'claude-opus-5-5', at: 1, usage: usage(1, 2, 3, 4) });
  assert.ok('stage' in bare && 'task' in bare, 'a new record always says it was tagged');
  assert.equal(bare.stage, null);
  assert.equal(bare.task, null);
  const c = m.compactRecord({ session: 's', agent: null, model: 'claude-opus-5-5', at: 5, usage: usage(1, 2, 3, 4), stage: 'PANEL_CLAUDE/E4' });
  assert.equal(c.stage, 'PANEL_CLAUDE/E4');
  // A record written before E4 has neither field and still reads back as a record
  const old = JSON.parse(JSON.stringify(bare));
  delete old.stage;
  delete old.task;
  const back = m.parseRecords(JSON.stringify(old));
  assert.equal(back.records.length, 1);
  assert.equal(back.rejected, 0);
  assert.ok(!('stage' in back.records[0]), 'an old record is not given a stage it never had');
});

test('a step without usage is recorded as missing, in words, never as zero', () => {
  const r = m.stepRecord({ session: 's', turn: 't', index: 0, agent: null, model: 'claude-opus-5-5', at: 1, usage: null });
  assert.equal(r.input, null);
  assert.equal(r.output, null);
  assert.match(r.missing, /bez usage/);
});

test('the key is session + turn + index + agent: a duplicate does not count twice', () => {
  const once = m.mergeRecords([], STEPS);
  const twice = m.mergeRecords(once, [STEPS[2], { ...STEPS[4] }]);
  assert.equal(twice.length, STEPS.length);
  assert.deepEqual(m.aggregate(twice, price).total, m.aggregate(once, price).total, 'the planted duplicate changes no sum');
  // the same turn and index in a subagent is a different request
  const sub = { ...STEPS[0], agent: 'a5d9f2d9' };
  assert.equal(m.mergeRecords(once, [sub]).length, STEPS.length + 1);
  assert.notEqual(m.recordKey(sub), m.recordKey(STEPS[0]));
});

test('the session sums equal the engine ledger the person saw in /cost ($0.57)', () => {
  const rep = m.aggregate(STEPS, price);
  assert.deepEqual([rep.total.input, rep.total.cacheRead, rep.total.cacheWrite, rep.total.output], [12, 365359, 57284, 2034]);
  assert.equal(rep.total.usd.toFixed(4), '0.5721', 'ledger 0.5720718');
  assert.equal(rep.isPartial, false);
  assert.equal(rep.byModel.length, 1);
  assert.equal(rep.byAgent.length, 1);
  assert.equal(rep.byAgent[0].label, 'wątek główny');
});

// The ledger of b40cc142 also holds $0.000128 spent before its first step (its first
// session.measure), a request outside turn.step: the sums below are the ledger minus that.
test('a subagent and a compaction write the cache for 5 minutes: the session matches its ledger', () => {
  // Sesja b40cc142 z sondy, przed /compact: tura glowna (5 krokow), subagent (2), tura po powiadomieniu
  const main = [
    ['4ff16760', 0, usage(2, 15010, 54925, 276)], ['4ff16760', 1, usage(2, 69935, 527, 204)],
    ['4ff16760', 2, usage(2, 70462, 1196, 746)], ['4ff16760', 3, usage(2, 71658, 1085, 398)],
    ['4ff16760', 4, usage(2, 72743, 957, 103)], ['0c4f89b7', 0, usage(2, 73700, 785, 103)],
  ].map(([turn, index, u]) => m.stepRecord({ session: 'b40cc142', turn, index, agent: null, model: 'claude-opus-5-5', at: 1, usage: u }));
  const sub = [[0, usage(2, 0, 24131, 321)], [1, usage(2, 24131, 1933, 293)]]
    .map(([index, u]) => m.stepRecord({ session: 'b40cc142', turn: 'c62e5ee2', index, agent: 'a5d9f2d9', model: 'claude-opus-5-5', at: 2, usage: u }));
  const rep = m.aggregate([...main, ...sub], price);
  assert.equal(rep.total.usd.toFixed(4), '0.7346', 'ledger 0.7347200 - 0.0001282');
  assert.equal(rep.byAgent.length, 2);
  assert.equal(rep.byAgent.find((g) => g.label !== 'wątek główny').label, 'subagent a5d9f2d9');
  // the compaction's own request, outside turn.step, brings it to the ledger after /compact
  const compact = m.compactRecord({ session: 'b40cc142', agent: null, model: 'claude-opus-5-5', at: 3, usage: usage(2677, 73700, 103, 1208) });
  assert.equal(m.aggregate([...main, ...sub, compact], price).total.usd.toFixed(4), '0.7847', 'ledger 0.784843 - 0.0001282');
  assert.equal(compact.kind, 'compact');
});

test('a missing measurement and a model without a price make the sum partial and say why', () => {
  const gap = m.stepRecord({ session: SESSION, turn: 'x', index: 0, agent: null, model: 'claude-opus-5-5', at: 9, usage: null });
  const other = m.stepRecord({ session: SESSION, turn: 'y', index: 0, agent: null, model: 'gpt-6.1-sol', at: 9, usage: usage(10, 0, 0, 10, 'gpt-6.1-sol') });
  const rep = m.aggregate([...STEPS, gap, other], price);
  assert.equal(rep.isPartial, true);
  assert.equal(rep.unmeasured, 1);
  assert.deepEqual(rep.unpriced, ['gpt-6.1-sol']);
  assert.equal(rep.total.usd.toFixed(4), '0.5721', 'what has a price still counts');
  const words = m.gapsInWords(rep);
  assert.ok(words.some((w) => /1 wywołanie bez pomiaru/.test(w)), words.join(' | '));
  assert.ok(words.some((w) => /brak ceny dla gpt-6\.1-sol/.test(w)), words.join(' | '));
  assert.deepEqual(m.gapsInWords(m.aggregate(STEPS, price)), [], 'a complete session has nothing to excuse');
});

test('the dollars split into the four categories add up to the total', () => {
  const rep = m.aggregate(STEPS, price);
  const parts = rep.total.parts;
  assert.equal((parts.input + parts.cacheRead + parts.cacheWrite + parts.output).toFixed(6), rep.total.usd.toFixed(6));
  assert.ok(parts.cacheWrite > parts.output, 'in this session the cache writes cost the most');
});

test('turns in the order they began, a subagent run apart, the gap of a turn named', () => {
  const sub = m.stepRecord({ session: SESSION, turn: 'c62e5ee2', index: 0, agent: 'a5d9f2d9', model: 'claude-opus-5-5', at: 1003, usage: usage(2, 0, 24131, 321) });
  const gap = m.stepRecord({ session: SESSION, turn: '16710b5a', index: 9, agent: null, model: 'claude-opus-5-5', at: 1009, usage: null });
  const series = m.turnSeries([...STEPS, sub, gap], price);
  assert.deepEqual(series.map((t) => [t.turn, t.agent, t.records]), [['ad1e1446', null, 1], ['16710b5a', null, 6], ['c62e5ee2', 'a5d9f2d9', 1]]);
  assert.equal(series[0].usd.toFixed(6), '0.439926');
  assert.equal(series[1].isPartial, true);
});

test('the project sums its sessions, today apart', () => {
  const other = STEPS.map((r) => ({ ...r, session: 'b40cc142', at: 5 }));
  const sum = m.projectSummary([STEPS, other, []], price, (at) => at >= 1000);
  assert.equal(sum.sessions, 2);
  assert.equal(sum.todaySessions, 1);
  assert.equal(sum.usd.toFixed(4), (2 * 0.5720718).toFixed(4));
  assert.equal(sum.todayUsd.toFixed(4), '0.5721');
  assert.equal(sum.since, 5);
});

test('the cache effect: the share served from the cache and the input without a cache', () => {
  const e = p.cacheEffect(STEPS);
  assert.equal(e.inputTokens, 12 + 365359 + 57284);
  assert.equal(e.fromCache.toFixed(3), (365359 / e.inputTokens).toFixed(3));
  assert.equal(e.noCacheUsd.toFixed(4), (e.inputTokens * 4 / 1e6).toFixed(4));
  assert.ok(e.paidUsd < e.noCacheUsd, 'the cache saved money here');
});

test('an empty session is "brak pomiarów", not $0', () => {
  const rep = m.aggregate([], price);
  assert.equal(rep.total.usd, null);
  assert.equal(rep.records, 0);
  assert.ok(m.gapsInWords(rep).some((w) => /brak pomiarów/.test(w)));
});

test('the session file: one JSON line per record, read back whole, broken lines counted, not silently dropped', () => {
  const text = m.serializeRecords(STEPS.slice(0, 3));
  assert.equal(text.split('\n').filter(Boolean).length, 3);
  const back = m.parseRecords(text.replace(/\n/g, '\r\n') + 'not json\n{"v":1}\n');
  assert.equal(back.records.length, 3, 'CRLF endings read the same (L-0033)');
  assert.deepEqual(back.records[1], STEPS[1]);
  assert.equal(back.rejected, 2, 'a broken line and a line that is not a record');
  assert.deepEqual(back.bad, ['not json', '{"v":1}']);
  const rewritten = m.parseRecords(m.serializeRecords(back.records, back.bad));
  assert.equal(rewritten.records.length, 3);
  assert.deepEqual(rewritten.bad, back.bad, 'a rewrite keeps the lines it could not read');
  assert.deepEqual(m.parseRecords('').records, []);
});

test('one file per session, the session id in its name; the name gives the session back', () => {
  assert.equal(m.fileName(new Date(2026, 9, 8, 23, 30), 'b5d50f8d-aa'), '2026-10-08-b5d50f8d-aa.jsonl', 'local date');
  assert.equal(m.fileName(new Date(2026, 0, 2), '../x'), '2026-01-02-x.jsonl', 'nothing but the id survives');
  assert.equal(m.isFileOf('2026-10-08-b5d50f8d-aa.jsonl', 'b5d50f8d-aa'), true);
  assert.equal(m.isFileOf('2026-10-08-b5d50f8d-aa.jsonl', 'aa'), false, 'a suffix of another id is not this session');
  assert.equal(m.isFileOf('2026-10-08-zzb5d50f8d-aa.jsonl', 'b5d50f8d-aa'), false);
});
