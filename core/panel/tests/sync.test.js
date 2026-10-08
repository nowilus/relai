'use strict';

// Kopia rdzenia panelu w pluginie relai-panel jest zgodna ze zrodlem (plan PANEL_CLAUDE, E1).
// Druga strona kontroli: rozjazd podlozony w katalogu tymczasowym musi zostac zgloszony.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TOOL = path.join(ROOT, 'core', 'tools', 'sync-panel-core.js');

test('panel/hooks/core matches core/panel', () => {
  const r = require(TOOL).check();
  assert.deepEqual(r.problems, []);
  assert.ok(r.files >= 2, 'files: ' + r.files);
});

test('a changed copy, a missing copy and an orphan copy are reported (planted defect)', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-panel-sync-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'core', 'tools'), { recursive: true });
  fs.mkdirSync(path.join(root, 'core', 'panel'), { recursive: true });
  fs.mkdirSync(path.join(root, 'panel', 'hooks', 'core'), { recursive: true });
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  fs.writeFileSync(path.join(root, 'core', 'panel', 'a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(root, 'core', 'panel', 'b.mjs'), 'export const b = 1;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'a.mjs'), 'export const a = 2;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'old.mjs'), 'export const old = 1;\n');
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');

  const bad = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /a\.mjs rozni sie/);
  assert.match(bad.stderr, /brak kopii panel\/hooks\/core\/b\.mjs/);
  assert.match(bad.stderr, /old\.mjs nie ma zrodla/);

  // CRLF in the copy alone is not a difference
  fs.unlinkSync(path.join(root, 'panel', 'hooks', 'core', 'old.mjs'));
  const fixed = spawnSync(process.execPath, [tool], { encoding: 'utf8' });
  assert.equal(fixed.status, 0, fixed.stderr);
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'a.mjs'), 'export const a = 1;\r\n');
  assert.equal(spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' }).status, 0);
});
