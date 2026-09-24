'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const crew = require('../crew.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-crew-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

// Podstawiony wykonawca: zapisuje wywolania i odpowiada wedlug tabeli (L-0032).
function stubExec(tabela) {
  const wywolania = [];
  const exec = (cmd, args, opcje) => {
    wywolania.push({ cmd, args, opcje });
    const klucz = path.basename(cmd).replace(/\.(cmd|exe)$/i, '') + ' ' + args.slice(0, 2).join(' ');
    const odp = Object.entries(tabela).find(([k]) => klucz.startsWith(k));
    return odp ? Object.assign({ status: 0, stdout: '', stderr: '', error: '' }, odp[1]) : { status: 1, stdout: '', stderr: 'not found', error: 'ENOENT' };
  };
  exec.wywolania = wywolania;
  return exec;
}

test('planWaves serializes tasks that touch the same file and parallelizes the rest', () => {
  const p = crew.planWaves([
    { id: 'a', files: ['src/x.js'] },
    { id: 'b', files: ['src/y.js'] },
    { id: 'c', files: ['SRC/X.JS'] },
  ]);
  assert.equal(p.error, '');
  assert.deepEqual(p.waves, [['a', 'b'], ['c']]);
  assert.deepEqual(p.conflicts, [{ first: 'a', second: 'c', files: ['src/x.js'] }]);
});

test('planWaves honours explicit dependencies and rejects cycles and duplicate ids', () => {
  const ok = crew.planWaves([{ id: 'a', dependsOn: ['b'] }, { id: 'b' }]);
  assert.deepEqual(ok.waves, [['b'], ['a']]);
  const cykl = crew.planWaves([{ id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }]);
  assert.match(cykl.error, /cykl/);
  const dup = crew.planWaves([{ id: 'a' }, { id: 'a' }]);
  assert.match(dup.error, /powtorzone/);
  assert.match(crew.planWaves([]).error, /brak/);
});

test('buildCommand gives read-only flags without --write and never a bypass flag', () => {
  for (const runtime of Object.keys(crew.NARZEDZIA)) {
    for (const write of [false, true]) {
      const k = crew.buildCommand(runtime, { cwd: 'C:/proj', write, model: 'm1', prompt: 'x', promptFile: 'p.md', cli: runtime });
      assert.doesNotThrow(() => crew.sprawdzFlagi(k), runtime + ' write=' + write);
      const linia = k.args.join(' ');
      if (runtime === 'claude-code') assert.match(linia, write ? /acceptEdits/ : /--permission-mode plan/);
      if (runtime === 'codex') assert.match(linia, write ? /workspace-write/ : /read-only --ephemeral/);
      if (runtime === 'cursor') assert.match(linia, write ? /(^| )-f( |$)/ : /--mode ask/);
      assert.match(linia, /m1/);
    }
  }
  assert.throws(() => crew.sprawdzFlagi({ cmd: 'x', args: ['--dangerously-skip-permissions'] }), /zakazana flaga/);
  assert.throws(() => crew.buildCommand('vim', {}), /nieznane narzedzie/);
});

test('buildReviewCommand uses codex review for Codex and a read-only run elsewhere', () => {
  const c = crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex', model: 'gpt-x' });
  assert.equal(c.args[0], 'review');
  assert.ok(c.args.includes('--uncommitted'));
  const b = crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex', base: 'main' });
  assert.ok(b.args.includes('--base') && b.args.includes('main'));
  const cl = crew.buildReviewCommand('claude-code', { cwd: '/p', cli: 'claude', write: true });
  assert.match(cl.args.join(' '), /--permission-mode plan/);
});

test('composePrompt carries the role preamble, the task and the scope; unknown role throws', () => {
  const p = crew.composePrompt('coder', 'Add a flag', { files: ['a.js'], cwd: '/p', runId: 'r1', taskId: 't1' });
  assert.match(p, /role of CODER/);
  assert.match(p, /Files in scope: a\.js/);
  assert.match(p, /## Task\n\nAdd a flag/);
  assert.throws(() => crew.composePrompt('wizard', 'x'), /nieznana rola/);
});

test('detect reports full mode when a second tool is logged in and basic otherwise', () => {
  const pelny = stubExec({
    'claude --version': { stdout: '2.1.0 (Claude Code)' },
    'claude auth status': { stdout: '{"loggedIn":true,"authMethod":"claude.ai"}' },
    'codex --version': { stdout: 'codex-cli 0.153.4' },
    'codex login status': { stdout: 'Logged in using ChatGPT' },
    'codex features list': { stdout: 'hooks  stable  true\nmulti_agent  stable  true\n' },
    'agent --version': { stdout: '2026.09.02' },
    'agent status': { stdout: 'Logged in as x' },
  });
  const d = crew.detect({ exec: pelny, env: { CLAUDECODE: '1' } });
  assert.equal(d.host, 'claude-code');
  assert.equal(d.mode, 'full');
  assert.deepEqual(d.remote, ['codex', 'cursor']);
  assert.equal(d.runtimes.codex.native.subagents, true);

  const sam = stubExec({
    'claude --version': { stdout: '2.1.0' },
    'claude auth status': { stdout: '{"loggedIn":true}' },
    'codex --version': { stdout: 'codex-cli 0.153.4' },
    'codex login status': { status: 1, stderr: 'Not logged in' },
  });
  const b = crew.detect({ exec: sam, env: { CLAUDECODE: '1' } });
  assert.equal(b.mode, 'basic');
  assert.equal(b.runtimes.codex.available, true);
  assert.equal(b.runtimes.codex.loggedIn, false);
  assert.equal(b.runtimes.cursor.available, false);
  assert.equal(crew.gospodarz({}), 'unknown');
  assert.equal(crew.gospodarz({ CODEX_THREAD_ID: 'x' }), 'codex');
});

test('run writes the prompt, output and manifest, and refuses --write for the reviewer role', (t) => {
  const cwd = fixture(t);
  const exec = stubExec({ 'codex exec': { stdout: '## Report\nchanged a.js' } });
  const r = crew.run(cwd, { runtime: 'codex', role: 'coder', prompt: 'Do X', files: ['a.js'], runId: 'r1', taskId: 'T1', exec, cli: 'codex', model: 'gpt-x' });
  assert.equal(r.ok, true);
  assert.equal(r.status, 'done');
  assert.equal(r.write, true);
  assert.match(fs.readFileSync(r.files.prompt, 'utf8'), /role of CODER[\s\S]*Do X/);
  assert.equal(fs.readFileSync(r.files.out, 'utf8'), '## Report\nchanged a.js');
  const m = JSON.parse(fs.readFileSync(path.join(cwd, ...crew.KATALOG_WORK, 'r1', 'manifest.json'), 'utf8'));
  assert.equal(m.tasks.length, 1);
  assert.equal(m.tasks[0].status, 'done');
  assert.ok(m.tasks[0].command.includes('workspace-write'));
  assert.equal(exec.wywolania[0].opcje.stdin.includes('Do X'), true);

  assert.throws(() => crew.run(cwd, { runtime: 'codex', role: 'reviewer', write: true, prompt: 'x', exec }), /tylko-do-odczytu/);
  assert.throws(() => crew.run(cwd, { runtime: 'vim', prompt: 'x', exec }), /nieznane narzedzie/);

  const zly = stubExec({ 'agent -p': { status: 3, stderr: 'boom' } });
  const f = crew.run(cwd, { runtime: 'cursor', role: 'tester', prompt: 'T', runId: 'r1', taskId: 'T2', exec: zly, cli: 'agent' });
  assert.equal(f.ok, false);
  assert.equal(f.status, 'failed');
  assert.match(zly.wywolania[0].opcje.stdin, /role of TESTER[\s\S]*## Task\n\nT\n/);
  const s = crew.status(cwd, 'r1');
  assert.equal(s[0].tasks.length, 2);
  assert.match(crew.statusReport(s).join('\n'), /T2 @cursor\/tester.*failed \(exit 3\) write/);
  assert.match(crew.statusReport([]).join('\n'), /Brak przebiegow/);
});

test('review parses the verdict from the reviewer output', (t) => {
  const cwd = fixture(t);
  const exec = stubExec({ 'claude -p': { stdout: 'Findings: none\n## Verdict\nAPPROVE — clean' } });
  const r = crew.review(cwd, { runtime: 'claude-code', runId: 'r2', exec, cli: 'claude' });
  assert.equal(r.verdict, 'APPROVE');
  assert.equal(r.write, false);
  assert.match(exec.wywolania[0].args.join(' '), /--permission-mode plan/);
  assert.match(exec.wywolania[0].opcje.stdin, /uncommitted changes/);
});

test('CLI usage and plan file round-trip', (t) => {
  const cwd = fixture(t);
  const plik = path.join(cwd, 'zadania.json');
  fs.writeFileSync(plik, JSON.stringify([{ id: 'a', files: ['x'] }, { id: 'b', files: ['x'] }]));
  const out = [];
  const orig = process.stdout.write;
  process.stdout.write = (s) => { out.push(String(s)); return true; };
  try {
    assert.equal(crew.main(['plan', plik]), 0);
    assert.equal(crew.main([]), 0);
    assert.equal(crew.main(['plan']), 2);
    assert.equal(crew.main(['prompt', '--role', 'tester', '--files', 'a.js']), 0);
    assert.equal(crew.main(['prompt']), 2);
  } finally { process.stdout.write = orig; }
  assert.match(out[0], /Fala 1 \(pojedyncze\): a[\s\S]*Fala 2 \(pojedyncze\): b/);
  assert.match(out[1], /Uzycie/);
  assert.match(out[2], /role of TESTER[\s\S]*Files in scope: a\.js/);
});

// --- meldunek bez dowodu (E7 PROWADZENIE_END_TO_END, O06 + O07) ----------------
// Tura zakonczona samym tekstem to raport, nie dowod ukonczenia [A-O55]. Orkiestrator
// wysyla najwyzej dwie automatyczne kontynuacje; trzeci meldunek bez dowodu idzie do czlowieka.

const MELDUNEK_Z_DOWODEM = [
  'Done.', '', '## Report', '',
  '- [x] add discount rule — `src/cart.js`',
  '- [x] test for empty cart — `test/cart.test.js`',
  'Files changed: src/cart.js, test/cart.test.js',
  'Verification: `npm test` -> 12/12 passed, exit 0',
].join('\n');

test('ocenMeldunek accepts a report with a command and its result and no open items', () => {
  const o = crew.ocenMeldunek(MELDUNEK_Z_DOWODEM);
  assert.equal(o.kompletny, true, JSON.stringify(o));
  assert.deepEqual(o.braki, []);
});

test('ocenMeldunek names what is missing: section, command with result, open items', () => {
  assert.deepEqual(crew.ocenMeldunek('I changed the cart logic and it should work now.').braki, ['report']);
  const bezWyniku = crew.ocenMeldunek('## Report\n\nFiles changed: src/cart.js\nNext I will run the tests.');
  assert.equal(bezWyniku.kompletny, false);
  assert.ok(bezWyniku.braki.includes('proof'));
  const otwarte = crew.ocenMeldunek(MELDUNEK_Z_DOWODEM.replace('- [x] test for empty cart', '- [ ] test for empty cart'));
  assert.equal(otwarte.kompletny, false);
  assert.deepEqual(otwarte.otwarte, ['test for empty cart — `test/cart.test.js`']);
  // Punkt otwarty z nazwanym blokerem nie jest meldunkiem bez dowodu — idzie do czlowieka jako blokada.
  const zBlokerem = crew.ocenMeldunek(MELDUNEK_Z_DOWODEM.replace('- [x] test for empty cart', '- [ ] test for empty cart (blocked: no test runner in repo)'));
  assert.equal(zBlokerem.kompletny, true);
  assert.deepEqual(zBlokerem.zablokowane, ['test for empty cart (blocked: no test runner in repo) — `test/cart.test.js`']);
});

test('kontynuacja sends two continuations, then hands the task to the human', () => {
  const zly = crew.ocenMeldunek('## Report\n\n- [ ] migrate endpoint B\nFiles changed: api.js');
  const r0 = crew.kontynuacja(zly, 0);
  assert.equal(r0.akcja, 'kontynuuj');
  assert.match(r0.wiadomosc, /migrate endpoint B/);
  assert.match(r0.wiadomosc, /blocked/);
  assert.equal(crew.kontynuacja(zly, 1).akcja, 'kontynuuj');
  assert.equal(crew.kontynuacja(zly, 2).akcja, 'czlowiek');
  assert.equal(crew.KONTYNUACJE_MAX, 2);
  assert.equal(crew.kontynuacja(crew.ocenMeldunek(MELDUNEK_Z_DOWODEM), 0).akcja, 'przyjmij');
});

test('autonomous roles carry the task-list rule and the early-stop paragraph; the reviewer does not', () => {
  for (const rola of ['coder', 'tester']) {
    const p = crew.composePrompt(rola, 'Add a rule.', { done: '`npm test` passes' });
    assert.match(p, /## Done when\n\n`npm test` passes/);
    assert.match(p, /- \[ \]/, rola + ': lista zadan w formie checklisty');
    assert.match(p, /announc/i, rola + ': akapit o zatrzymaniach');
  }
  const r = crew.composePrompt('reviewer', 'Review.', {});
  assert.doesNotMatch(r, /announc/i);
});

test('CLI check prints the decision and exits 0 only when the report is accepted', (t) => {
  const root = fixture(t);
  const plik = path.join(root, 'out.md');
  fs.writeFileSync(plik, 'All good, I will now run the tests.');
  const zapis = [];
  const stary = process.stdout.write;
  process.stdout.write = (s) => { zapis.push(String(s)); return true; };
  let k0; let k2;
  try {
    k0 = crew.main(['check', '--report', plik]);
    k2 = crew.main(['check', '--report', plik, '--continuations', '2']);
  } finally { process.stdout.write = stary; }
  assert.equal(k0, 1);
  assert.equal(k2, 1);
  assert.match(zapis[0], /DECYZJA: kontynuuj/);
  assert.match(zapis[1], /DECYZJA: czlowiek/);
  fs.writeFileSync(plik, MELDUNEK_Z_DOWODEM);
  process.stdout.write = (s) => { zapis.push(String(s)); return true; };
  let k; try { k = crew.main(['check', '--report', plik]); } finally { process.stdout.write = stary; }
  assert.equal(k, 0);
  assert.match(zapis[2], /DECYZJA: przyjmij/);
});

test('Claude Code crew agents carry the same unattended-run paragraph as the crew.js preambles', () => {
  const agenci = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'agents');
  for (const plik of ['relai-coder.md', 'relai-tester.md']) {
    const tresc = fs.readFileSync(path.join(agenci, plik), 'utf8').replace(/\r\n/g, '\n');
    assert.ok(tresc.includes(crew.AUTONOMIA.join('\n')), plik + ': akapit rozjechany z crew.js');
  }
  const recenzent = fs.readFileSync(path.join(agenci, 'relai-reviewer.md'), 'utf8');
  assert.doesNotMatch(recenzent, /You run unattended/);
});

// Przeglad E7 (code-reviewer): falszywe przyjecie i punkty otwarte nad sekcja raportu.
test('ocenMeldunek rejects a file name plus "looks ok" and needs command and result on one line', () => {
  const pozor = crew.ocenMeldunek('## Report\n\nFiles changed: `src/cart.js`\nLooks ok to me, no issues found.');
  assert.equal(pozor.kompletny, false);
  assert.deepEqual(pozor.braki, ['proof']);
  const rozdzielone = crew.ocenMeldunek('## Report\n\nI ran `npm test`.\nEverything passed.');
  assert.equal(rozdzielone.kompletny, false, 'polecenie i wynik w osobnych liniach to nie dowod');
  for (const linia of ['Verified: `npm test` → 3 pass, 0 fail.', 'Command: `pytest -q` - 8 passed in 0.4s',
    '`go test ./...` -> ok, exit 0', 'Ran `cargo test`: 12/12']) {
    assert.equal(crew.ocenMeldunek('## Report\n\n' + linia).kompletny, true, linia);
  }
});

test('ocenMeldunek sees open checklist items written above the Report heading', () => {
  const o = crew.ocenMeldunek('- [x] task A\n- [ ] task B\n\n## Report\n\nVerification: `npm test` -> 5/5 passed, exit 0');
  assert.equal(o.kompletny, false);
  assert.deepEqual(o.otwarte, ['task B']);
});
