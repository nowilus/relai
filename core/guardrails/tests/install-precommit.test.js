'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const installer = path.resolve(__dirname, '../install-precommit.js');
const files = ['relai-pre-commit.cjs', 'relai-secret-scan.cjs', 'relai-secret-scan.js'];
const foreign = '#!/bin/sh\necho FOREIGN_HOOK_RAN >&2\n';

function fixture(t) {
  const tempRoot = fs.realpathSync(os.tmpdir());
  const repo = fs.mkdtempSync(path.join(tempRoot, 'relai-guardrails-test-'));
  t.after(() => {
    const resolved = fs.realpathSync(repo);
    assert.equal(path.dirname(resolved), tempRoot);
    assert.ok(path.basename(resolved).startsWith('relai-guardrails-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^GIT_/i.test(key)) delete env[key];
  }
  const emptyConfig = path.join(repo, 'empty.gitconfig');
  fs.writeFileSync(emptyConfig, '');
  Object.assign(env, { GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: emptyConfig });
  function run(command, args) {
    const result = spawnSync(command, args, { cwd: repo, env, encoding: 'utf8', windowsHide: true });
    if (result.error) throw result.error;
    return result;
  }
  function git(args) {
    return run('git', ['-c', 'core.hooksPath=.git/hooks', '-c', 'commit.gpgSign=false',
      '-c', 'user.name=RelAI regression', '-c', 'user.email=relai-regression@localhost', ...args]);
  }
  const init = git(['init', '--quiet']);
  assert.equal(init.status, 0, init.stderr);
  fs.writeFileSync(path.join(repo, 'package.json'), '{"type":"module"}\n');
  const hooks = path.join(repo, '.git/hooks');
  const hook = path.join(hooks, 'pre-commit');
  const install = (...args) => run(process.execPath, [installer, repo, ...args]);
  const read = (file) => fs.readFileSync(path.join(hooks, file));
  return { repo, hooks, hook, install, read, run, git };
}

function integrate(f) {
  fs.writeFileSync(f.hook, foreign, { mode: 0o755 });
  const installed = f.install();
  assert.equal(installed.status, 1, installed.stderr);
  assert.equal(f.read('pre-commit').toString(), foreign);
  const line = installed.stderr.split(/\r?\n/).find((value) => value.trim().startsWith('node '));
  assert.ok(line, installed.stderr);
  fs.appendFileSync(f.hook, line.trim() + '\n');
  return line.trim();
}

test('uninstall refuses integrated foreign hook before touching any file', (t) => {
  const f = fixture(t);
  const line = integrate(f);
  fs.writeFileSync(path.join(f.hooks, files[2]), '// old scanner fixture\n');
  const before = new Map(['pre-commit', ...files].map((file) => [file, f.read(file)]));
  const result = f.install('--uninstall');
  assert.equal(result.status, 1, result.stderr);
  assert.ok(result.stderr.includes(f.hook), result.stderr);
  assert.ok(result.stderr.includes('Usun recznie'), result.stderr);
  assert.ok(result.stderr.includes('linia 3: ' + line), result.stderr);
  assert.match(result.stderr, /--uninstall/);
  for (const [file, contents] of before) assert.deepEqual(f.read(file), contents);
  const hookRun = f.run(process.execPath, [path.join(f.hooks, files[0])]);
  assert.equal(hookRun.status, 0, hookRun.stderr);
});

test('uninstall reports each referenced RelAI file and the actual foreign lines', (t) => {
  const f = fixture(t);
  integrate(f);
  const lines = files.map((file) => 'node "./.git/hooks/' + file + '" || exit 1');
  const contents = foreign + lines.join('\r\n') + '\r\n';
  fs.writeFileSync(f.hook, contents);
  const result = f.install('--uninstall');
  assert.equal(result.status, 1);
  lines.forEach((line, index) => assert.ok(result.stderr.includes('linia ' + (index + 3) + ': ' + line), result.stderr));
  assert.equal(f.read('pre-commit').toString(), contents);
  assert.ok(fs.existsSync(path.join(f.hooks, files[0])));
  assert.ok(fs.existsSync(path.join(f.hooks, files[1])));
});

test('foreign hook without references survives cleanup of RelAI files', (t) => {
  const f = fixture(t);
  integrate(f);
  // Wlasciciel usuwa integracje; instalator nie edytuje cudzego pliku.
  fs.writeFileSync(f.hook, foreign);
  const result = f.install('--uninstall');
  assert.equal(result.status, 1); // Dotychczasowy status przy pozostawieniu cudzego hooka.
  assert.match(result.stderr, /nietknietego/);
  assert.equal(f.read('pre-commit').toString(), foreign);
  for (const file of files) assert.equal(fs.existsSync(path.join(f.hooks, file)), false);
});

test('owned hook and repeated uninstall retain their existing behavior', (t) => {
  const f = fixture(t);
  const installed = f.install();
  assert.equal(installed.status, 0, installed.stderr);
  fs.writeFileSync(path.join(f.hooks, files[2]), '// old scanner fixture\n');
  assert.equal(f.install('--uninstall').status, 0);
  for (const file of ['pre-commit', ...files]) assert.equal(fs.existsSync(path.join(f.hooks, file)), false);
  assert.equal(f.install('--uninstall').status, 0);
});

test('full cycle: foreign hook, recommended integration, uninstall, clean commit', (t) => {
  const f = fixture(t);
  integrate(f);
  const integrated = f.read('pre-commit');
  fs.writeFileSync(path.join(f.repo, 'clean.txt'), 'clean fixture\n');
  assert.equal(f.git(['add', 'clean.txt', 'package.json']).status, 0);
  assert.equal(f.install('--uninstall').status, 1);
  assert.deepEqual(f.read('pre-commit'), integrated);
  const before = f.git(['commit', '--quiet', '-m', 'Clean fixture with integration']);
  assert.equal(before.status, 0, before.stderr);
  assert.match(before.stderr, /FOREIGN_HOOK_RAN/, 'Git must actually execute the foreign hook: ' + before.stderr);
  fs.writeFileSync(f.hook, foreign);
  assert.equal(f.install('--uninstall').status, 1);
  for (const file of files) assert.equal(fs.existsSync(path.join(f.hooks, file)), false);
  const after = f.git(['commit', '--quiet', '--allow-empty', '-m', 'Clean fixture after uninstall']);
  assert.equal(after.status, 0, after.stderr);
  assert.match(after.stderr, /FOREIGN_HOOK_RAN/, after.stderr);
  assert.equal(f.read('pre-commit').toString(), foreign);
});
