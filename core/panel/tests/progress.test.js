'use strict';

// Model postepu pracy dla paska relai-progress (plan PANEL_CLAUDE, E9, Aneks C).
// Zrodla wylacznie deterministyczne: pola wyboru promptu etapu, STATUS.md, przebieg /relai-crew.
// Kontrola pozytywna na realnym materiale: prompty etapow aktywnego planu tego repo.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const p = require('../progress.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const STATUS = [
  '[PLAN.html](PLAN.html) · **ZAAKCEPTOWANY 2026-10-02**',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-03 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Formularze | W TOKU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
  '| E3 | Raport | OCZEKUJE | — | |',
].join('\r\n');

const PROMPT = [
  '## Weryfikacja',
  '',
  '- [x] Testy repo zielone.',
  '- [X] Walidator zaliczony.',
  '- [ ] Pasek na zywo,',
  '      druga linia punktu.',
  '  - [ ] Zagniezdzony punkt tez sie liczy.',
  '',
  'Tekst `- [x]` w srodku zdania nie jest punktem.',
].join('\n');

test('checklist counts boxes at the start of a line, checked in either case, nothing else', () => {
  assert.deepEqual(p.checklist(PROMPT), { done: 2, total: 4 });
  assert.deepEqual(p.checklist(''), { done: 0, total: 0 });
  assert.deepEqual(p.checklist('- [x] jeden\r\n- [ ] dwa\r\n'), { done: 1, total: 2 });
});

test('percent has two decimals, is cut not rounded, and says 100 only when all are done', () => {
  assert.equal(p.percent(0, 4), 0);
  assert.equal(p.percent(1, 3), 33.33);
  assert.equal(p.percent(2, 3), 66.66);
  assert.equal(p.percent(9999, 10000), 99.99);
  assert.equal(p.percent(19999, 20000), 99.99); // rounding would say 100.00
  assert.equal(p.percent(4, 4), 100);
  assert.equal(p.percent(0, 0), null);
  assert.equal(p.percent(5, 4), 100); // more ticked than counted never passes 100
});

test('promptLink reads the stage row\'s Prompt cell, relative to STATUS.md', () => {
  assert.equal(p.promptLink(STATUS, 'E2', 'docs/plany/X/STATUS.md'), 'docs/plany/X/PROMPT_ETAP_2.md');
  assert.equal(p.promptLink(STATUS, 'E3', 'docs/plany/X/STATUS.md'), null);
  assert.equal(p.promptLink(STATUS, 'E9', 'docs/plany/X/STATUS.md'), null);
});

const plan = (stage) => ({ kind: 'ok', plan: 'PLATNOSCI', statusPath: 'docs/plany/PLATNOSCI/STATUS.md', planStatus: 'ZAAKCEPTOWANY', stage, stages: 3, closed: 1 });

test('stage in progress: counted from its prompt', () => {
  const r = p.stageProgress(plan({ id: 'E2', name: 'Formularze', status: 'W TOKU' }), PROMPT);
  assert.equal(r.kind, 'stage');
  assert.equal(r.title, 'E2 · Formularze');
  assert.deepEqual([r.done, r.total, r.percent], [2, 4, 50]);
  assert.equal(r.words, '2 z 4 punktów');
});

test('stage without a prompt or without boxes says so in words, never a percent', () => {
  const none = p.stageProgress(plan({ id: 'E2', name: 'Formularze', status: 'W TOKU' }), null);
  assert.equal(none.percent, null);
  assert.match(none.words, /brak promptu etapu/);
  const empty = p.stageProgress(plan({ id: 'E2', name: 'Formularze', status: 'W TOKU' }), '# prompt bez punktow\n');
  assert.equal(empty.percent, null);
  assert.match(empty.words, /bez punktów do odhaczenia/);
});

test('stage ready to start is 0 in words; no stage and no plan are no progress', () => {
  const ready = p.stageProgress(plan({ id: 'E3', name: 'Raport', status: 'GOTOWY DO STARTU' }), PROMPT);
  assert.equal(ready.percent, null);
  assert.match(ready.words, /gotowy do startu/);
  assert.equal(p.stageProgress(plan(null), null), null);
  assert.equal(p.stageProgress({ kind: 'none' }, null), null);
  assert.equal(p.stageProgress({ kind: 'unknown', reason: 'x' }, null), null);
});

const TASKS = JSON.stringify([{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }]);
const manifest = (updatedAt, statuses) => JSON.stringify({ runId: '2026-10-09_101500', updatedAt, tasks: statuses.map(([id, status]) => ({ id, status })) });
const NOW = Date.parse('2026-10-09T12:00:00Z');

test('crew run: done tasks over planned tasks; failed ones are closed but not done', () => {
  const r = p.crewProgress('2026-10-09_101500', TASKS, manifest('2026-10-09T11:00:00Z', [['a', 'done'], ['b', 'failed']]), NOW);
  assert.equal(r.kind, 'crew');
  assert.equal(r.title, 'załoga 2026-10-09_101500');
  assert.deepEqual([r.done, r.total, r.percent], [1, 3, 33.33]);
  assert.equal(r.words, '1 z 3 zadań, 1 nieudane');
});

test('crew run without a manifest yet is 0 of n; a broken file is no progress', () => {
  const r = p.crewProgress('r1', TASKS, null, NOW);
  assert.deepEqual([r.done, r.total, r.percent], [0, 3, 0]);
  assert.equal(p.crewProgress('r1', '{nie json', null, NOW), null);
  assert.equal(p.crewProgress('r1', JSON.stringify([]), null, NOW), null);
});

test('crew run all closed or older than the window is not shown', () => {
  assert.equal(p.crewProgress('r1', TASKS, manifest('2026-10-09T11:00:00Z', [['a', 'done'], ['b', 'done'], ['c', 'timeout']]), NOW), null);
  assert.equal(p.crewProgress('r1', TASKS, manifest('2026-10-08T11:00:00Z', [['a', 'done']]), NOW), null);
});

test('pick: a live crew run wins over the stage, the stage over nothing, nothing in words', () => {
  const crew = p.crewProgress('r1', TASKS, null, NOW);
  const stage = p.stageProgress(plan({ id: 'E2', name: 'Formularze', status: 'W TOKU' }), PROMPT);
  assert.equal(p.pick(crew, stage).kind, 'crew');
  assert.equal(p.pick(null, stage).kind, 'stage');
  const free = p.pick(null, null);
  assert.equal(free.kind, 'free');
  assert.equal(free.percent, null);
  assert.match(free.words, /poza planem/);
});

test('real material: every stage prompt of the active plan parses, and a box ticked by hand moves the percent', () => {
  const dir = path.join(ROOT, 'docs', 'plany', 'PANEL_CLAUDE');
  const prompts = fs.readdirSync(dir).filter((n) => /^PROMPT_ETAP_\d+\.md$/.test(n));
  assert.ok(prompts.length >= 5);
  for (const n of prompts) {
    const c = p.checklist(fs.readFileSync(path.join(dir, n), 'utf8'));
    assert.ok(c.total >= 5, n + ': ' + c.total + ' boxes');
  }
  // The base has one open box whatever state the real prompt is in: a closed stage ticks them all
  // (E9 since its commit), and a test that ticks "the first open box" of it tests nothing (E4)
  const real = fs.readFileSync(path.join(dir, 'PROMPT_ETAP_9.md'), 'utf8');
  const text = real.includes('- [ ]') ? real : real.replace('- [x]', '- [ ]');
  assert.ok(text.includes('- [ ]'), 'the base has a box to tick');
  const before = p.checklist(text);
  const ticked = p.checklist(text.replace('- [ ]', '- [x]'));
  assert.equal(ticked.done, before.done + 1);
  assert.equal(ticked.total, before.total);
});

test('items: one per box, in source order, each with its own state; done is counted from the same list', () => {
  const lines = Array.from({ length: 10 }, (_, i) => `- [${[2, 5, 9].includes(i + 1) ? 'x' : ' '}] Punkt ${i + 1}`);
  const list = p.checklistItems(lines.join('\n'), 'PROMPT_ETAP_9.md');
  assert.equal(list.length, 10);
  assert.deepEqual(list.filter((x) => x.status === 'done').map((x) => x.label), ['Punkt 2', 'Punkt 5', 'Punkt 9']);
  assert.equal(new Set(list.map((x) => x.id)).size, 10);
  assert.equal(list[1].id, 'PROMPT_ETAP_9.md#2', 'the id is source + position, not the state');
  const plan2 = { kind: 'ok', plan: 'X', statusPath: 's', planStatus: null, stage: { id: 'E2', name: 'N', status: 'W TOKU' }, stages: 1, closed: 0 };
  const r = p.stageProgress(plan2, lines.join('\n'));
  assert.deepEqual([r.done, r.total], [3, 10]);
  assert.deepEqual(r.items.filter((x) => x.status === 'done').map((x) => x.label), ['Punkt 2', 'Punkt 5', 'Punkt 9']);
});

test('shortLabel: markdown stripped, cut at the first clause, clipped with an ellipsis; the full name kept', () => {
  assert.equal(p.shortLabel('**Postęp na żywo:** w sesji desktopowej wykonującej punkty'), 'Postęp na żywo');
  assert.equal(p.shortLabel('`node core/tools/sync-panel-core.js --check` — zgodne.'), 'node core/tools/sy…');
  assert.equal(p.shortLabel('Testy repo — komenda ze „Stanu wyjściowego"'), 'Testy repo');
  assert.equal(p.shortLabel('Bezpieczeństwo: `grep -rnE`'), 'Bezpieczeństwo');
  assert.equal(p.shortLabel(''), '?');
  const [first] = p.checklistItems('- [ ] **Postęp na żywo:** w sesji desktopowej', 'P');
  assert.equal(first.name, 'Postęp na żywo: w sesji desktopowej');
});

test('crew items: done, failed and timeout as their own states, the rest pending', () => {
  const r = p.crewProgress('r1', JSON.stringify([{ id: 'a', title: 'Kod A' }, { id: 'b', title: 'Kod B' }, { id: 'c' }]),
    JSON.stringify({ updatedAt: '2026-10-09T11:00:00Z', tasks: [{ id: 'a', status: 'done' }, { id: 'b', status: 'timeout' }] }), Date.parse('2026-10-09T12:00:00Z'));
  assert.deepEqual(r.items.map((x) => [x.id, x.label, x.status]), [['a', 'Kod A', 'done'], ['b', 'Kod B', 'failed'], ['c', 'c', 'pending']]);
  assert.equal(r.done, 1);
});

test('no source: no items, never an empty list pretending 0%', () => {
  assert.deepEqual(p.pick(null, null).items, []);
  assert.equal(p.pick(null, null).percent, null);
});


test('an item\'s name takes its continuation lines, up to the next box or a blank line', () => {
  const text = '- [ ] **Agenci na żywo:** jeden subagent\n      pojawia się w panelu,\n      potem zakończony.\n- [x] Drugi\n\nAkapit, nie punkt.';
  const [a, b] = p.checklistItems(text, 'P');
  assert.equal(a.name, 'Agenci na żywo: jeden subagent pojawia się w panelu, potem zakończony.');
  assert.equal(a.label, 'Agenci na żywo');
  assert.equal(b.name, 'Drugi');
});
