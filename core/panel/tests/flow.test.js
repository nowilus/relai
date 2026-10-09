'use strict';

// Mapa przeplywu panelu RelAI (plan PANEL_CLAUDE, E4): plany, etapy, odnogi, przebiegi zalogi
// z zaleznosciami i rownolegloscia. Material: prawdziwe pliki STATUS.md z repo (archiwum i plany
// otwarte) oraz podlozone przebiegi /relai-crew (w repo zadnego nie ma).

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const f = require('../flow.mjs');
const crew = require('../../process/crew.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const E2E = 'docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md';

// The criterion of the plan: seven stages, each with the status its row carries
function assertEndToEnd(node) {
  assert.equal(node.stages.length, 7, 'seven stages');
  assert.deepEqual(node.stages.map((s) => s.id), ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']);
  for (const s of node.stages) assert.equal(s.status, 'ZREALIZOWANY', `${s.id} is ZREALIZOWANY in STATUS.md`);
}

test('the plan criterion: PROWADZENIE_END_TO_END maps to 7 stages with the statuses of its STATUS.md', () => {
  const text = read(E2E);
  const node = f.planNode('PROWADZENIE_END_TO_END', 'archive', text);
  assertEndToEnd(node);
  assert.equal(node.planStatus, 'ZREALIZOWANY');
  assert.equal(node.closedOn, '2026-09-24');
  // Each stage keeps the date of its status cell: the map tells "never measured" from "untagged"
  assert.deepEqual([...new Set(node.stages.map((s) => s.date))], ['2026-09-24']);
  const open = f.planNode('X', 'open', '[PLAN.html](PLAN.html) · **W TOKU**\n\n| Etap | Nazwa | Status |\n|---|---|---|\n| E1 | A | W TOKU |\n');
  assert.equal(open.stages[0].date, null, 'a stage without a date in its cell has none');
  // Instrument: the rows the table carries, counted without the model
  const rows = text.split(/\r?\n/).filter((l) => /^\|\s*E\d+\s*\|/.test(l));
  assert.equal(rows.length, node.stages.length, 'no stage row was dropped');
});

test('mutation control: one status changed in a copy makes the criterion fail', () => {
  const text = read(E2E).replace(/^(\| E3 \|[^|]*\|) ZREALIZOWANY 2026-09-24 /m, '$1 W TOKU ');
  assert.notEqual(text, read(E2E), 'the copy really differs');
  const node = f.planNode('PROWADZENIE_END_TO_END', 'archive', text);
  assert.equal(node.stages.find((s) => s.id === 'E3').status, 'W TOKU');
  assert.throws(() => assertEndToEnd(node), /E3/);
});

test('every STATUS.md in the repo maps to stages; none of its stage rows is dropped', () => {
  const dirs = [['docs/plany', 'open'], ['docs/archiwum/plany', 'archive']];
  let plans = 0;
  for (const [dir, place] of dirs) {
    for (const name of fs.readdirSync(path.join(ROOT, dir))) {
      const rel = `${dir}/${name}/STATUS.md`;
      if (!fs.existsSync(path.join(ROOT, rel))) continue;
      const text = read(rel);
      const node = f.planNode(name, place, text);
      const rows = text.split(/\r?\n/).filter((l) => /^\|\s*\**E\d+/.test(l));
      assert.ok(node.stages.length > 0, `${name}: stages found`);
      assert.equal(node.stages.length, rows.length, `${name}: ${rows.length} rows, ${node.stages.length} stages`);
      assert.notEqual(node.planStatus, null, `${name}: plan status recognised`);
      plans += 1;
    }
  }
  assert.ok(plans >= 11, `all plans read (${plans})`);
});

test('branches in both shapes the repo holds: a wrapped list and a table, the source stage kept', () => {
  // A list with "etap-źródło:" wrapped over lines (HIGIENA_DOKUMENTOW)
  const hig = f.parseBranches(read('docs/archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md'));
  assert.deepEqual(hig.map((b) => b.name), ['BLOKADA_ROTACJI', 'REJESTR_ARTEFAKTOW']);
  assert.deepEqual(hig.map((b) => b.source), ['E1', 'E1']);
  assert.deepEqual(hig.map((b) => b.status), ['PRZENIESIONA', 'ZAMKNIĘTA']);
  // A table (PIERWSI_UZYTKOWNICY): the source of OPIS_REPO is a stage of another plan
  const pu = f.parseBranches(read('docs/archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md'));
  assert.deepEqual(pu.map((b) => [b.name, b.source, b.status]), [['HOOKI_KORZEN', 'E1', 'ZAMKNIĘTA'], ['OPIS_REPO', null, 'PRZENIESIONA']]);
  assert.match(pu[1].sourceWords, /ROZWOJ_PO_WYDANIU/);
  // A list with "źródło:" (ROZWOJ_PO_WYDANIU): every bullet of the section is a branch
  const text = read('docs/archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md');
  const rz = f.parseBranches(text);
  const section = text.split(/\r?\n## /).find((s) => s.startsWith('Odnogi'));
  const bullets = section.split(/\r?\n/).filter((l) => l.startsWith('- **')).length;
  assert.equal(rz.length, bullets, 'no bullet of the section rejected');
  assert.ok(rz.every((b) => b.source !== null || b.sourceWords !== ''), 'each branch has its source');
  // Two real variants of that file: "zrodlo:" without diacritics, and ANULOWANA outside the list
  const guard = rz.find((b) => b.name === 'GUARD_PO_SCIEZCE');
  assert.match(guard.sourceWords, /^E10 planu BUDOWA_RELAI/);
  assert.equal(guard.source, null, 'a stage of another plan is not a stage of this one');
  const pomiar = rz.find((b) => b.name === 'POMIAR_ODNOG');
  assert.equal(pomiar.status, null, 'ANULOWANA is not on the closed list');
  assert.match(pomiar.statusWords, /^ANULOWANA 2026-09-01/, 'its words stay on the map');
  // No section, no branches
  assert.deepEqual(f.parseBranches(read(E2E)), []);
});

test('a branch with a status outside the closed list says so in words, never a guess', () => {
  const md = '# S\n\n## Odnogi\n\n- **X** — coś · źródło: E2 · [karta](odnogi/X/ODNOGA.md) · **W ZAWIESZENIU**\n\n## Dalej\n';
  const [b] = f.parseBranches(md);
  assert.equal(b.status, null);
  assert.equal(b.source, 'E2');
});

// A run with an explicit dependency, a file conflict and two tasks free to run together
const TASKS = [
  { id: 't1', title: 'Rdzeń mapy', files: ['core/panel/flow.mjs'], dependsOn: [] },
  { id: 't2', title: 'Testy rdzenia', files: ['core/panel/tests/flow.test.js'], dependsOn: [] },
  { id: 't3', title: 'Panel', files: ['panel/hooks/register.tsx'], dependsOn: ['t1'] },
  { id: 't4', title: 'Druga zmiana rdzenia', files: ['./core/panel/FLOW.mjs'], dependsOn: [] },
];

test('waves follow crew.js exactly: dependencies, file conflicts, parallel tasks', () => {
  const ours = f.crewWaves(TASKS);
  const theirs = crew.planWaves(TASKS);
  assert.deepEqual(ours.waves, theirs.waves);
  assert.deepEqual(ours.conflicts.map((c) => [c.first, c.second]), theirs.conflicts.map((c) => [c.first, c.second]));
  assert.deepEqual(ours.waves, [['t1', 't2'], ['t3', 't4']]);
  const cycle = [{ id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }];
  assert.match(f.crewWaves(cycle).error, /cykl/);
  assert.match(crew.planWaves(cycle).error, /cykl/);
});

test('a crew run on the map: waves, dependencies in words, status per task from the manifest', () => {
  const manifest = { runId: 'R', tasks: [{ id: 't1', status: 'done' }, { id: 't2', status: 'running' }, { id: 't3', status: 'failed' }] };
  const run = f.crewRun('R', JSON.stringify(TASKS), JSON.stringify(manifest));
  assert.equal(run.error, '');
  assert.deepEqual(run.waves.map((w) => w.tasks.map((t) => t.id)), [['t1', 't2'], ['t3', 't4']]);
  assert.deepEqual(run.waves.map((w) => w.isParallel), [true, true]);
  const t3 = run.waves[1].tasks.find((t) => t.id === 't3');
  assert.deepEqual(t3.deps, ['t1']);
  assert.equal(t3.status, 'failed');
  const t4 = run.waves[1].tasks.find((t) => t.id === 't4');
  assert.deepEqual(t4.deps, ['t1'], 'the file conflict is a dependency too');
  assert.equal(t4.status, 'pending');
  assert.equal(run.waves[0].tasks[1].status, 'running');
  // Broken files: said in words, no tasks invented
  assert.match(f.crewRun('R', '{', null).error, /zadania\.json/);
  assert.match(f.crewRun('R', null, null).error, /zadania\.json/);
});

test('merging tasks is a view: the run files stay as they were, the original tasks stay readable', () => {
  const tasksText = JSON.stringify(TASKS);
  const manifestText = JSON.stringify({ tasks: [{ id: 't1', status: 'done' }, { id: 't2', status: 'done' }] });
  const before = [tasksText, manifestText];
  let merges = f.parseMerges(null);
  merges = f.mergeTasks(merges, 'R', ['t1', 't2'], 'Rdzeń z testami');
  merges = f.assignStage(merges, merges.groups[0].id, 'PANEL_CLAUDE/E4');
  const run = f.crewRun('R', tasksText, manifestText, merges);
  const group = run.waves[0].tasks;
  assert.equal(group.length, 1, 'two tasks of one wave show as one');
  assert.equal(group[0].name, 'Rdzeń z testami');
  assert.deepEqual(group[0].members.map((t) => t.id), ['t1', 't2'], 'the originals stay under the merged task');
  assert.equal(group[0].status, 'done');
  assert.equal(group[0].stage, 'PANEL_CLAUDE/E4');
  assert.deepEqual([tasksText, manifestText], before, 'negative proof: the run files are untouched');
  // A merge file round-trips and a split gives the tasks back
  const back = f.parseMerges(f.serializeMerges(merges));
  assert.deepEqual(back, merges);
  const split = f.splitGroup(back, back.groups[0].id);
  assert.equal(split.groups.length, 0);
  assert.equal(f.crewRun('R', tasksText, manifestText, split).waves[0].tasks.length, 2);
  // Merging fewer than two tasks, or a task of another group, changes nothing
  assert.deepEqual(f.mergeTasks(merges, 'R', ['t3'], 'x'), merges);
  assert.deepEqual(f.mergeTasks(merges, 'R', ['t1', 't3'], 'x'), merges);
});

test('picked on the map: a merged task and a task merge into one; picked tasks take a stage', () => {
  let m = f.mergeTasks(f.parseMerges(null), 'R', ['t1', 't2'], 'Rdzeń');
  m = f.mergePicked(m, 'R', ['g1', 't3']);
  assert.deepEqual(m.groups.map((g) => [g.tasks, g.name]), [[['t1', 't2', 't3'], null]], 'the old group is folded into the new one');
  assert.deepEqual(f.mergePicked(m, 'R', ['t4']), m, 'one task alone is not a merge');
  // A stage for a group and for a lone task; "no stage" takes it back without leaving a stray group
  let s = f.assignPicked(m, 'R', [m.groups[0].id, 't4'], 'P/E4');
  assert.deepEqual(s.groups.map((g) => [g.tasks, g.stage]), [[['t1', 't2', 't3'], 'P/E4'], [['t4'], 'P/E4']]);
  s = f.assignPicked(s, 'R', ['t4'], null);
  assert.deepEqual(s.groups.map((g) => g.tasks), [['t1', 't2', 't3']], 'a group of one without a stage is gone');
  assert.deepEqual(f.assignPicked(f.parseMerges(null), 'R', ['t9'], null).groups, [], 'no stage on a lone task adds nothing');
});

test('a broken merge file is read as empty and counted, never trusted', () => {
  const m = f.parseMerges('{nie json');
  assert.deepEqual(m.groups, []);
  assert.equal(m.rejected, 1);
  const half = f.parseMerges(JSON.stringify({ v: 1, groups: [{ id: 'g1', run: 'R', tasks: ['a', 'b'], name: 'ok', stage: null }, { id: 'g2', run: 'R', tasks: 'a' }] }));
  assert.equal(half.groups.length, 1);
  assert.equal(half.rejected, 1);
});

test('the map: the active plan first, open plans next, the archive newest first', () => {
  const plan = (name, status) => `# STATUS\n\n[PLAN.html](PLAN.html) · **${status}** · x\n\n| Etap | Nazwa | Status | Prompt |\n|---|---|---|---|\n| E1 | A | ZREALIZOWANY 2026-09-01 | — |\n`;
  const map = f.flowMap('B', [
    { name: 'A', place: 'archive', statusMd: plan('A', 'ZREALIZOWANY 2026-09-01') },
    { name: 'C', place: 'archive', statusMd: plan('C', 'ZREALIZOWANY 2026-09-20') },
    { name: 'D', place: 'open', statusMd: plan('D', 'DO AKCEPTACJI') },
    { name: 'B', place: 'open', statusMd: plan('B', 'ZAAKCEPTOWANY 2026-10-08') },
  ]);
  assert.deepEqual(map.map((p) => [p.name, p.place]), [['B', 'active'], ['D', 'open'], ['C', 'archive'], ['A', 'archive']]);
});

test('a stage tag reads "PLAN/EN" back; anything else is not a stage', () => {
  assert.deepEqual(f.splitStage('PANEL_CLAUDE/E4'), { plan: 'PANEL_CLAUDE', stage: 'E4' });
  assert.equal(f.splitStage('PANEL_CLAUDE'), null);
  assert.equal(f.splitStage(null), null);
});
