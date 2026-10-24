'use strict';

// Hook lockfile-scan in Codex (plan BEZPIECZENSTWO, E5). The payload below is the one Codex
// 0.155.1 sent to a probe hook on 2026-10-24: PostToolUse after Bash with tool_input.command.
// The host gate case runs on the same fixture as the positive case, so silence there means the
// gate, not a missing scan.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(ROOT, 'adapters', 'codex', 'hooks', 'lockfile-scan.js');
const FIXTURE = path.join(ROOT, 'adapters', 'claude-code', 'skills', 'trivy-scan', 'evals', 'scan-reports-fix-plan', 'files');

function project(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e5-codex-lockfile-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(FIXTURE, dir, { recursive: true });
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.2.0\n');
  return dir;
}

function run(dir, env) {
  const payload = JSON.stringify({
    session_id: 's', turn_id: 't', transcript_path: '', cwd: dir, hook_event_name: 'PostToolUse',
    model: 'gpt-5.6-luna', permission_mode: 'default', tool_name: 'Bash',
    tool_input: { command: 'npm install' }, tool_response: '', tool_use_id: 'u',
  });
  const r = spawnSync(process.execPath, [HOOK], { input: payload, encoding: 'utf8', env, timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

function envWithout(name) {
  const env = { ...process.env };
  delete env[name];
  return env;
}

test('root hooks.json runs the Codex lockfile hook after Bash', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8'));
  const entries = cfg.hooks.PostToolUse || [];
  assert.equal(entries.length, 1);
  assert.equal(entries[0].matcher, 'Bash');
  assert.match(entries[0].hooks[0].command, /adapters\/codex\/hooks\/lockfile-scan\.js/);
});

test('Codex Bash payload with npm install: note [trivy-scan] (or skip without Trivy)', (t) => {
  const out = run(project(t), envWithout('CLAUDECODE'));
  assert.notEqual(out, '', 'the hook must speak after npm install in a RelAI project');
  const context = JSON.parse(out).hookSpecificOutput.additionalContext;
  if (/no quick scan ran/.test(context)) { t.skip('Trivy or its database missing: ' + context); return; }
  assert.match(context, /^\[trivy-scan\] /);
  assert.match(context, /HIGH 16/);
});

test('same payload under Claude Code (CLAUDECODE set): silence, the plugin hook runs there', (t) => {
  assert.equal(run(project(t), { ...envWithout('CLAUDECODE'), CLAUDECODE: '1' }), '');
});
