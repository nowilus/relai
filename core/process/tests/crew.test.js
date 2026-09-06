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
