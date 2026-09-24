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

test('validator rejects a version drift in the README banner or in STATE "Gdzie jesteśmy"', (t) => {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e1-version-'));
  t.after(() => fs.rmSync(copy, { recursive: true, force: true }));
  fs.cpSync(ROOT, copy, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) && !source.endsWith(`${path.sep}.git`) && !source.includes(`${path.sep}work${path.sep}`) });
  const run = () => spawnSync(process.execPath, [path.join(copy, 'core', 'tools', 'validate-adapters.js')], {
    cwd: copy,
    encoding: 'utf8',
    windowsHide: true,
  });

  const readme = path.join(copy, 'README.md');
  const readmeTxt = fs.readFileSync(readme, 'utf8');
  fs.writeFileSync(readme, readmeTxt.replace(/<em>Wersja \d+\.\d+\.\d+/, '<em>Wersja 9.9.9'));
  let result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /README\.md = 9\.9\.9/);
  fs.writeFileSync(readme, readmeTxt);

  const state = path.join(copy, 'docs', 'STATE.md');
  const stateTxt = fs.readFileSync(state, 'utf8');
  fs.writeFileSync(state, stateTxt.replace(/(## Gdzie jesteśmy[\s\S]*?)\b\d+\.\d+\.\d+\b/, '$19.9.8'));
  result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /docs\/STATE\.md = 9\.9\.8/);

  // Brak banera to blad, nie cisza (kontrola, ktora nie znalazla, czego pilnuje, nie sprawdza).
  fs.writeFileSync(readme, readmeTxt.replace(/<em>Wersja \d+\.\d+\.\d+/, '<em>Wydanie'));
  result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /README\.md: nie znaleziono numeru wersji/);
});
