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
  assert.deepEqual(one[0], { ...SPAWN, status: 'running', endedAt: null, steps: 0, context: 0, role: 'analyst', name: 'Lis Leon', hue: 0, calls: 0, tools: [] });
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

// RelAI Agents (odnoga AGENTS_KRABY, P3): rola, imie i barwa agenta, kroki narzedzi

test('spawned gives each new agent its role, the first free name of the role and a colour no running agent wears', () => {
  let list = a.spawned([], { ...SPAWN, id: 'r1', type: 'code-reviewer', description: 'Review the diff' });
  list = a.spawned(list, { ...SPAWN, id: 'r2', type: 'code-reviewer', description: 'Review tests' });
  list = a.spawned(list, { ...SPAWN, id: 'd1', type: 'general-purpose', description: 'Napraw parser modelu' });
  assert.deepEqual(list.map((x) => [x.role, x.name, x.hue]), [['reviewer', 'Sowa Zofia', 0], ['reviewer', 'Sowa Sabina', 1], ['developer', 'Bóbr Bartek', 2]]);
  // r1 ends; the next agent may take its colour once the colours after the last one are taken
  const after = a.spawned(a.finished(list, 'r1', 'answer', 9), { ...SPAWN, id: 'w1', type: 'claude', description: 'cokolwiek' });
  assert.equal(after[3].hue, 3, 'the colour after the last one handed out');
  assert.equal(after[3].role, 'worker');
});

test('the same id spawned again keeps its role, name and colour', () => {
  const list = a.spawned([], { ...SPAWN, id: 'x', type: 'tdd-guide' });
  const again = a.spawned(list, { ...SPAWN, id: 'x', type: 'Explore', description: 'inny opis' });
  assert.deepEqual([again[0].role, again[0].name, again[0].hue], [list[0].role, list[0].name, list[0].hue]);
  assert.equal(again[0].description, 'inny opis');
});

test('a running colour is skipped: two agents at once never share one', () => {
  let list = [];
  for (let i = 0; i < 8; i++) list = a.spawned(list, { ...SPAWN, id: `h${i}` });
  assert.equal(new Set(list.map((x) => x.hue)).size, 8);
  list = a.finished(list, 'h3', 'answer', 9);
  list = a.spawned(list, { ...SPAWN, id: 'h8' });
  assert.equal(list[8].hue, 3, 'the only free colour');
});

test('upgraded fills a list kept before roles: role, name, colour, calls, tools', () => {
  const old = [{ id: 'o1', type: 'Plan', description: 'plan', model: 'm', at: 1, status: 'done', endedAt: 2, steps: 3, context: 4 },
    { id: 'o2', type: 'Plan', description: 'plan', model: 'm', at: 1, status: 'running', endedAt: null, steps: 0, context: 0 }];
  const up = a.upgraded(old);
  assert.deepEqual(up.map((x) => [x.role, x.name, x.hue, x.calls, x.tools.length]), [['architect', 'Słoń Stanisław', 0, 0, 0], ['architect', 'Słoń Sylwia', 1, 0, 0]]);
  assert.equal(up[0].steps, 3, 'what was there stays');
  assert.deepEqual(a.upgraded(up), up, 'an upgraded list comes back the same');
});

test('toolStep counts the call, keeps the newest MAX_TOOL_STEPS and wakes a finished agent', () => {
  let list = a.finished(a.spawned([], SPAWN), SPAWN.id, 'answer', 9);
  const step = { kind: 'read', label: 'a.md', dim: '', live: 'Czyta a.md' };
  list = a.toolStep(list, SPAWN.id, step);
  assert.deepEqual([list[0].calls, list[0].status, list[0].endedAt], [1, 'running', null]);
  for (let i = 0; i < a.MAX_TOOL_STEPS + 5; i++) list = a.toolStep(list, SPAWN.id, { ...step, label: `f${i}` });
  assert.equal(list[0].tools.length, a.MAX_TOOL_STEPS);
  assert.equal(list[0].calls, a.MAX_TOOL_STEPS + 6);
  assert.equal(list[0].tools.at(-1).label, `f${a.MAX_TOOL_STEPS + 4}`);
  assert.equal(a.toolStep(list, 'nieznany', step), list, 'an unknown id changes nothing');
});

test('describeTool says each call in Polish, with the folder relative to the project', () => {
  const root = 'C:/Users/L/RelAI';
  assert.deepEqual(a.describeTool('Read', { file_path: 'C:\\Users\\L\\RelAI\\core\\panel\\agents.mjs' }, root),
    { kind: 'read', label: 'agents.mjs', dim: 'core/panel', live: 'Czyta agents.mjs' });
  assert.deepEqual(a.describeTool('Edit', { file_path: 'c:/users/l/relai/CLAUDE.md' }, root),
    { kind: 'write', label: 'CLAUDE.md', dim: '', live: 'Edytuje CLAUDE.md' }, 'root itself shows no folder; case ignored');
  assert.equal(a.describeTool('Write', { file_path: '/tmp/x.txt' }, root).dim, '/tmp', 'outside the project: the folder as it is');
  assert.deepEqual(a.describeTool('Grep', { pattern: 'roleOf', path: 'C:/Users/L/RelAI/core' }, root),
    { kind: 'search', label: '„roleOf”', dim: 'core', live: 'Szuka „roleOf”' });
  assert.equal(a.describeTool('Bash', { command: 'npm test', description: 'Run tests' }).live, 'Uruchamia: Run tests');
  assert.equal(a.describeTool('Bash', { command: 'git   status\n --short' }).label, 'git status --short');
  assert.deepEqual(a.describeTool('mcp__github__get_file_contents', {}), { kind: 'connector', label: 'github · get file contents', dim: '', live: 'Konektor github · get file contents' });
  assert.equal(a.describeTool('WebFetch', { url: 'https://example.com/a' }).label, 'example.com');
  assert.equal(a.describeTool('WebFetch', { url: 'nie adres' }).label, 'strona');
  assert.equal(a.describeTool('Skill', { skill: 'trivy-scan' }).live, 'Używa skilla trivy-scan');
  assert.equal(a.describeTool('Agent', { description: 'Zbadaj panel' }).kind, 'agent');
  assert.deepEqual(a.describeTool('Read', {}), { kind: 'read', label: 'plik', dim: '', live: 'Czyta plik' }, 'missing arguments say less');
  assert.equal(a.describeTool('Zagadka', {}).live, 'Używa Zagadka');
  const long = a.describeTool('Bash', { description: 'x'.repeat(200) });
  assert.ok(long.label.length <= 80 && long.live.length <= 60 && long.live.endsWith('…'), 'labels are cut');
  for (const k of Object.keys(a.TOOL_KIND_WORD)) assert.ok(a.TOOL_KIND_WORD[k], k);
});
