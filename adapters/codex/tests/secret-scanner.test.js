'use strict';

// Hook secret-scanner in Codex (plan OPTYMALIZACJA_PO_AUDYCIE, card K-D9). The .env* escape hatch
// applies only when git cannot answer, as in the Claude Code adapter. The test runs the hook as a
// process without CLAUDECODE: under Claude Code that variable silences this copy on purpose (P-013).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(ROOT, 'adapters', 'codex', 'hooks', 'secret-scanner.js');
const secret = () => ['PASS', 'WORD'].join('') + '=' + ['m7Q', '9rV', '2zL', '8pN'].join('') + '\n';

function hookEnv() {
  const env = { ...process.env, CLAUDE_PLUGIN_ROOT: ROOT };
  for (const key of Object.keys(env)) if (/^(CLAUDECODE|GIT_)/i.test(key)) delete env[key];
  return env;
}

function project(t, { git }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-k-d9-codex-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n');
  if (git) {
    assert.equal(spawnSync('git', ['init', '--quiet'], { cwd: dir, env: hookEnv() }).status, 0);
    fs.writeFileSync(path.join(dir, '.gitignore'), '.env\n');
  }
  return dir;
}

function write(dir, file, env = hookEnv()) {
  const payload = JSON.stringify({ cwd: dir, hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: path.join(dir, file), content: secret() } });
  const r = spawnSync(process.execPath, [HOOK], { input: payload, encoding: 'utf8', env, timeout: 30000 });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

test('tracked .env.example with a secret is denied in a git repository', (t) => {
  assert.match(write(project(t, { git: true }), '.env.example'), /"permissionDecision":"deny"/);
});

test('ignored .env stays writable in a git repository', (t) => {
  assert.equal(write(project(t, { git: true }), '.env'), '');
});

test('.env.local outside a git repository keeps the escape hatch', (t) => {
  assert.equal(write(project(t, { git: false }), '.env.local'), '');
});

test('control: an ordinary file outside git is still denied', (t) => {
  assert.match(write(project(t, { git: false }), 'config.txt'), /"permissionDecision":"deny"/);
});
