'use strict';

// Przypisanie pomiarow do etapu i zadania (plan PANEL_CLAUDE, E4; regula z 2026-10-09: znacznik
// zapisany przez kolektor w chwili pomiaru). Kazdy rekord trafia do dokladnie jednej pozycji:
// etap, "poza etapem" albo "sprzed znacznika" — suma pozycji rowna sie sumie sesji co do centa.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const a = require('../attribution.mjs');
const m = require('../measure.mjs');
const p = require('../pricing.mjs');
const f = require('../flow.mjs');

const price = (r) => p.priceRecord(r);
const U = (read, write, output, model = 'claude-opus-5-5') => ({ input_tokens: 2, cache_read_input_tokens: read, cache_creation_input_tokens: write, output_tokens: output, model });
let at = 0;
const rec = (stage, task, u = U(100000, 2000, 900), agent = null) =>
  m.stepRecord({ session: 's1', turn: 't' + at, index: 0, agent, model: 'claude-opus-5-5', at: ++at, usage: u, stage, task });
const old = (u = U(50000, 1000, 400)) => {
  const r = rec(null, null, u);
  delete r.stage;
  delete r.task;
  return r;
};
const cents = (n) => Math.round(n * 100);

test('the stage tag: the stage in progress of the active plan, null otherwise', () => {
  const plan = (status) => ({ kind: 'ok', plan: 'PANEL_CLAUDE', statusPath: 'x', planStatus: 'ZAAKCEPTOWANY', stage: { id: 'E4', name: 'Mapa', status }, stages: 9, closed: 5 });
  assert.equal(a.stageTag(plan('W TOKU')), 'PANEL_CLAUDE/E4');
  assert.equal(a.stageTag(plan('GOTOWY DO STARTU')), null, 'a stage ready to start is not being worked on');
  assert.equal(a.stageTag({ kind: 'none' }), null);
  assert.equal(a.stageTag({ ...plan('W TOKU'), stage: null }), null);
});

test('the crew tag: the line crew.js writes under a task prompt, read back; "-" is none', () => {
  const crew = require('../../process/crew.js');
  const prompt = crew.composePrompt('coder', 'Zrób mapę', { cwd: 'C:/p', runId: '2026-10-09_120000', taskId: 't2' });
  assert.equal(a.crewTag(prompt), '2026-10-09_120000/t2', 'positive control on the real composer');
  assert.equal(a.crewTag(crew.composePrompt('coder', 'x', { cwd: 'C:/p' })), null);
  assert.equal(a.crewTag('RelAI crew run: R, task: T\r\n'), 'R/T', 'a CRLF line still reads');
  assert.equal(a.crewTag('Cytuję: "RelAI crew run: R, task: T" w zdaniu'), null, 'a quote inside a sentence is not the line');
  assert.equal(a.crewTag(''), null);
});

test('each record lands in exactly one row; stages + outside + untagged = the session, to the cent', () => {
  const records = [rec('P/E4', null), rec('P/E4', null), rec('P/E3', null), rec(null, null), old(), old()];
  const cost = a.stageCosts(records, price);
  const total = m.aggregate(records, price).total;
  assert.deepEqual(cost.rows.map((r) => [r.tag, r.group.records]), [['P/E3', 1], ['P/E4', 2]]);
  assert.equal(cost.outside.group.records, 1);
  assert.match(cost.outside.words, /poza etapem/);
  assert.equal(cost.untagged.group.records, 2);
  assert.match(cost.untagged.words, /sprzed znacznika/);
  const sum = cost.rows.reduce((s, r) => s + r.group.usd, 0) + cost.outside.group.usd + cost.untagged.group.usd;
  assert.equal(cents(sum), cents(total.usd));
  assert.equal(cost.isWhole, true);
  // Control: a record planted in the session but not in the rows breaks the equality
  const planted = { ...cost, rows: cost.rows.slice(1) };
  assert.equal(a.isWhole(planted, total), false);
});

test('a record without a price is counted and named, never priced as zero and never moved', () => {
  const records = [rec('P/E4', null), rec('P/E4', null, U(1000, 10, 10, 'claude-sonnet-5-5'))];
  const cost = a.stageCosts(records, price);
  const row = cost.rows[0];
  assert.equal(row.group.records, 2);
  assert.equal(row.group.isPartial, true);
  assert.equal(cents(row.group.usd), cents(price(records[0]).usd));
  assert.equal(cost.outside.group.records, 0, 'it does not go to the nearest row');
});

test('a crew task given a stage on the map counts there; the rows still add up', () => {
  let merges = f.parseMerges(null);
  merges = f.assignTask(merges, 'R', 't1', 'P/E2');
  const records = [rec(null, 'R/t1'), rec('P/E4', 'R/t1'), rec('P/E4', 'R/t2'), rec(null, null)];
  const cost = a.stageCosts(records, price, merges);
  assert.deepEqual(cost.rows.map((r) => [r.tag, r.group.records]), [['P/E2', 2], ['P/E4', 1]]);
  assert.equal(cost.outside.group.records, 1);
  assert.equal(cost.isWhole, true);
});

test('task costs: per task, merged tasks as one, records without a task apart', () => {
  let merges = f.parseMerges(null);
  merges = f.mergeTasks(merges, 'R', ['t1', 't2'], 'Rdzeń z testami');
  const records = [rec(null, 'R/t1'), rec(null, 'R/t2'), rec(null, 'R/t3'), rec('P/E4', null)];
  const tasks = a.taskCosts(records, price, merges);
  assert.deepEqual(tasks.map((t) => [t.run, t.id, t.group.records]), [['R', 'g1', 2], ['R', 't3', 1]]);
  assert.equal(tasks[0].label, 'Rdzeń z testami');
});

test('the real E9 session file: every record untagged, the sum unchanged by the split', () => {
  const dir = path.resolve(__dirname, '..', '..', '..', '.claude', 'relai', 'pomiary');
  const name = fs.existsSync(dir) ? fs.readdirSync(dir).find((n) => n.includes('3dcd2194')) : undefined;
  if (!name) return; // the measurements are local (outside git): nothing to read on another machine
  const { records } = m.parseRecords(fs.readFileSync(path.join(dir, name), 'utf8'));
  assert.ok(records.length > 100, `material present (${records.length} records)`);
  const cost = a.stageCosts(records, price);
  assert.equal(cost.untagged.group.records, records.length);
  assert.equal(cost.isWhole, true);
});
