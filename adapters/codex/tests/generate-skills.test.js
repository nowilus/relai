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

test('copies every reference file of the core skills next to SKILL.md', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const source = path.join(__dirname, '..', '..', 'claude-code', 'skills');

  for (const name of ['relai-core', 'relai-planning']) {
    const expected = fs.readdirSync(path.join(source, name)).filter((file) => file.endsWith('.md')).sort();
    assert.ok(expected.length > 1, name + ' should ship reference files next to SKILL.md');
    assert.deepEqual(fs.readdirSync(path.join(output, name)).sort(), expected);
    for (const file of expected) {
      const want = fs.readFileSync(path.join(source, name, file), 'utf8').replace(/\r\n/g, '\n');
      assert.equal(fs.readFileSync(path.join(output, name, file), 'utf8'), want);
    }
  }
});

test('detects drift and orphans among the reference files of a core skill', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const drifted = path.join(output, 'relai-core', 'session-close.md');
  const orphan = path.join(output, 'relai-planning', 'removed-procedure.md');
  fs.appendFileSync(drifted, '\nlocal drift\n');
  fs.writeFileSync(orphan, 'left behind by an older release\n');

  assert.deepEqual(generator.verify({ output }).sort(), [drifted, orphan].sort());
  generator.generate({ output });
  assert.deepEqual(generator.verify({ output }), []);
  assert.equal(fs.existsSync(orphan), false);
});

// AUDYT_SKILLI S6: $ARGUMENTS is substituted only by Claude Code; in Codex it would stay a dead
// symbol. Commands with disable-model-invocation get the Codex equivalent in agents/openai.yaml.
const EXPLICIT_ONLY = ['relai-adopt', 'relai-backup', 'relai-clean', 'relai-crew', 'relai-update'];

test('replaces $ARGUMENTS with a sentence about the argument from the invoking message', (t) => {
  const output = fixture(t);
  const { files } = generator.generate({ output });
  const skills = files.filter((file) => file.endsWith('SKILL.md'));
  for (const file of skills) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /\$ARGUMENTS/, file);
  assert.match(fs.readFileSync(path.join(output, 'relai-audit', 'SKILL.md'), 'utf8'),
    /Argument \(opcjonalny\): tekst podany przez użytkownika po nazwie skilla/);
});

test('marks commands with side effects as explicit-only in agents/openai.yaml', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const names = fs.readdirSync(output).filter((name) => fs.existsSync(path.join(output, name, 'agents', 'openai.yaml')));
  assert.deepEqual(names.sort(), EXPLICIT_ONLY);
  for (const name of names) {
    assert.match(fs.readFileSync(path.join(output, name, 'agents', 'openai.yaml'), 'utf8'),
      /^policy:\n {2}allow_implicit_invocation: false\n$/m);
  }
});

test('detects an orphaned agents/openai.yaml in a command skill', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const orphan = path.join(output, 'relai-audit', 'agents', 'openai.yaml');
  fs.mkdirSync(path.dirname(orphan), { recursive: true });
  fs.writeFileSync(orphan, 'policy:\n  allow_implicit_invocation: false\n');

  assert.deepEqual(generator.verify({ output }), [orphan]);
  generator.generate({ output });
  assert.equal(fs.existsSync(orphan), false);
});

test('detects and removes a skill directory left after a command was renamed', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const stale = path.join(output, 'relai-old-name', 'SKILL.md');
  const policy = path.join(output, 'relai-old-name', 'agents', 'openai.yaml');
  fs.mkdirSync(path.dirname(policy), { recursive: true });
  fs.writeFileSync(stale, '---\nname: relai-old-name\n---\n');
  fs.writeFileSync(policy, 'policy:\n  allow_implicit_invocation: false\n');

  assert.deepEqual(generator.verify({ output }).sort(), [policy, stale].sort());
  generator.generate({ output });
  assert.equal(fs.existsSync(path.join(output, 'relai-old-name')), false);
});

test('detects a generated skill that no longer matches its Claude Code source', (t) => {
  const output = fixture(t);
  generator.generate({ output });
  const stage = path.join(output, 'relai-stage', 'SKILL.md');
  fs.appendFileSync(stage, '\nlocal drift\n');

  assert.deepEqual(generator.verify({ output }), [path.join(output, 'relai-stage', 'SKILL.md')]);
});
