'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const generator = require('../generate-skills.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-generator-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('generates fourteen deterministic native skills from Claude Code commands', (t) => {
  const output = fixture(t);
  const first = generator.generate({ output });
  const snapshot = new Map(first.files.map((file) => [file, fs.readFileSync(file, 'utf8')]));
  const second = generator.generate({ output });

  assert.equal(first.commandSkills, 14);
  assert.equal(second.commandSkills, 14);
  assert.deepEqual(second.files, first.files);
  for (const [file, content] of snapshot) assert.equal(fs.readFileSync(file, 'utf8'), content);
  assert.match(snapshot.get(path.join(output, 'relai-stage', 'SKILL.md')), /^---\nname: relai-stage\ndescription: /);
  assert.match(snapshot.get(path.join(output, 'relai-core', 'SKILL.md')), /^---\nname: relai-core\n/);
  assert.match(snapshot.get(path.join(output, 'relai-planning', 'SKILL.md')), /^---\nname: relai-planning\n/);
});

test('detects a generated skill that no longer matches its Claude Code source', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const stage = path.join(output, 'relai-stage', 'SKILL.md');
  fs.appendFileSync(stage, '\nlocal drift\n');

  assert.deepEqual(generator.verify({ output }), [path.join(output, 'relai-stage', 'SKILL.md')]);
});
