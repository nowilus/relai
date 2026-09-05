'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const validator = path.join(ROOT, 'core', 'tools', 'validate-adapters.js');

test('validator rejects a manual duplicate of a core file on a repository copy', (t) => {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-validator-'));
  t.after(() => fs.rmSync(copy, { recursive: true, force: true }));
  fs.cpSync(ROOT, copy, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) && !source.endsWith(`${path.sep}.git`) });
  const duplicate = path.join(copy, 'adapters', 'codex', 'hooks', 'manual-core-copy.js');
  fs.copyFileSync(path.join(copy, 'core', 'process', 'session-signals.js'), duplicate);

  const result = spawnSync(process.execPath, [path.join(copy, 'core', 'tools', 'validate-adapters.js')], {
    cwd: copy,
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /manual-core-copy\.js/);
});
