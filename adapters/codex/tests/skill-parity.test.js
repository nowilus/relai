'use strict';

// BEZPIECZENSTWO E5, risk 8: every bundled skill reaches Codex and Cursor with ALL its files —
// the same relative paths and the same sha256 as the Claude Code source — and a directory off the
// list reaches neither. The source walk below is independent of core/process/bundled-skills.js on
// purpose: a bug in the shared walker must not hide itself.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const generator = require('../generate-skills.js');
const { BUNDLED_SKILL_NAMES } = require('../../../core/process/bundled-skills.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const SOURCE = path.join(ROOT, 'adapters', 'claude-code', 'skills');
const CURSOR_INSTALL = path.join(ROOT, 'adapters', 'cursor', 'install.js');

function tmp(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function filesOf(dir, rel = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? rel + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      if (entry.name !== 'evals') out.push(...filesOf(path.join(dir, entry.name), relPath));
    } else out.push(relPath);
  }
  return out.sort();
}

function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }

// Differences between a copied skills tree and the source, one line per problem.
function parity(copyRoot, names = BUNDLED_SKILL_NAMES) {
  const problems = [];
  for (const name of names) {
    const want = filesOf(path.join(SOURCE, name));
    const got = filesOf(path.join(copyRoot, name));
    for (const f of want) {
      if (!got.includes(f)) problems.push('missing ' + name + '/' + f);
      else if (sha(path.join(SOURCE, name, f)) !== sha(path.join(copyRoot, name, f))) problems.push('sum ' + name + '/' + f);
    }
    for (const f of got) if (!want.includes(f)) problems.push('extra ' + name + '/' + f);
  }
  return problems;
}

test('the bundled list names the four skills that ship with the adapters', () => {
  assert.deepEqual(BUNDLED_SKILL_NAMES, ['relai-core', 'relai-planning', 'trivy-scan', 'security-audit']);
  for (const name of BUNDLED_SKILL_NAMES) assert.ok(fs.existsSync(path.join(SOURCE, name, 'SKILL.md')), name);
});

test('Codex: every bundled skill file is copied with subdirectories and the source sums', (t) => {
  const output = tmp(t, 'relai-e5-parity-codex-');
  generator.generate({ output });

  assert.deepEqual(parity(output), []);
  assert.ok(fs.existsSync(path.join(output, 'trivy-scan', 'scripts', 'scan.mjs')));
  assert.ok(fs.existsSync(path.join(output, 'trivy-scan', 'references', 'hook.md')));
  assert.ok(fs.existsSync(path.join(output, 'security-audit', 'validate-findings.cjs')));
  assert.ok(fs.existsSync(path.join(output, 'security-audit', 'LICENSE')));
  assert.equal(fs.existsSync(path.join(output, 'trivy-scan', 'evals')), false, 'evals/ is test material, not shipped');
});

test('Codex: a deleted executable in the copy breaks parity and verify()', (t) => {
  const output = tmp(t, 'relai-e5-parity-negative-');
  generator.generate({ output });
  const script = path.join(output, 'trivy-scan', 'scripts', 'scan.mjs');
  fs.unlinkSync(script);

  assert.deepEqual(parity(output), ['missing trivy-scan/scripts/scan.mjs']);
  assert.deepEqual(generator.verify({ output }), [script]);
  generator.generate({ output });
  assert.deepEqual(parity(output), []);
});

test('Codex: an orphan in a skill subdirectory is reported and removed', (t) => {
  const output = tmp(t, 'relai-e5-parity-orphan-');
  generator.generate({ output });
  const orphan = path.join(output, 'trivy-scan', 'scripts', 'removed-helper.mjs');
  fs.writeFileSync(orphan, 'export {};\n');

  assert.deepEqual(generator.verify({ output }), [orphan]);
  generator.generate({ output });
  assert.equal(fs.existsSync(orphan), false);
});

test('Codex: a skill directory off the bundled list is not copied', (t) => {
  const source = tmp(t, 'relai-e5-parity-source-');
  for (const name of BUNDLED_SKILL_NAMES) fs.cpSync(path.join(SOURCE, name), path.join(source, name), { recursive: true });
  fs.mkdirSync(path.join(source, 'stray-skill', 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(source, 'stray-skill', 'SKILL.md'), '---\nname: stray-skill\n---\n');
  fs.writeFileSync(path.join(source, 'stray-skill', 'scripts', 'run.mjs'), 'export {};\n');
  const output = tmp(t, 'relai-e5-parity-stray-');

  generator.generate({ output, skillsSource: source });

  assert.equal(fs.existsSync(path.join(output, 'stray-skill')), false);
  assert.deepEqual(generator.verify({ output, skillsSource: source }), []);
  assert.ok(fs.existsSync(path.join(output, 'trivy-scan', 'scripts', 'scan.mjs')), 'positive control: listed skill copied');
});

test('Cursor: install copies every bundled skill file with the source sums, uninstall removes them', (t) => {
  const project = tmp(t, 'relai-e5-parity-cursor-');
  const run = (...args) => spawnSync(process.execPath, [CURSOR_INSTALL, project, ...args], { encoding: 'utf8' });
  const skills = path.join(project, '.cursor', 'skills');

  assert.equal(run('--bez-skanu').status, 0);
  assert.deepEqual(parity(skills), []);
  assert.deepEqual(fs.readdirSync(skills).sort(), [...BUNDLED_SKILL_NAMES].sort());
  assert.ok(fs.existsSync(path.join(skills, 'trivy-scan', 'scripts', 'scan.mjs')));

  fs.unlinkSync(path.join(skills, 'security-audit', 'validate-findings.cjs'));
  assert.deepEqual(parity(skills), ['missing security-audit/validate-findings.cjs'], 'negative control');

  assert.equal(run('--uninstall').status, 0);
  assert.equal(fs.existsSync(skills), false, 'uninstall leaves no skill directory behind');
});
