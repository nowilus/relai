'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { install, uninstall } = require('../install.js');

function fixture(t, files = {}) {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-install-'));
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(project, name), content);
  t.after(() => fs.rmSync(project, { recursive: true, force: true }));
  return project;
}

for (const files of [{}, { 'AGENTS.md': 'agent rules\n' }, { 'CLAUDE.md': 'claude rules\n' },
  { 'AGENTS.md': 'agent rules\n', 'CLAUDE.md': 'claude rules\n' }]) {
  test('install preserves existing guidance: ' + (Object.keys(files).join('+') || 'empty'), (t) => {
    const project = fixture(t, files);
    assert.equal(install(project), 0);
    assert.match(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'), /RelAI project router/);
    assert.match(fs.readFileSync(path.join(project, 'CLAUDE.md'), 'utf8'), /Read AGENTS\.md/);
    for (const [name, content] of Object.entries(files)) {
      assert.equal(fs.readFileSync(path.join(project, '.agents', 'relai', 'original-' + name.toLowerCase()), 'utf8'), content);
    }
    assert.equal(fs.existsSync(path.join(project, 'docs')), false);
    assert.equal(install(project), 0);
    assert.equal(uninstall(project), 0);
    for (const [name, content] of Object.entries(files)) assert.equal(fs.readFileSync(path.join(project, name), 'utf8'), content);
    for (const name of ['AGENTS.md', 'CLAUDE.md']) if (!(name in files)) assert.equal(fs.existsSync(path.join(project, name)), false);
  });
}

test('uninstall keeps a user-modified router and leaves unrelated files alone', (t) => {
  const project = fixture(t, { 'note.txt': 'owned by user\n' });
  assert.equal(install(project), 0);
  fs.appendFileSync(path.join(project, 'AGENTS.md'), 'user change\n');
  assert.equal(uninstall(project), 1);
  assert.match(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'), /user change/);
  assert.equal(fs.readFileSync(path.join(project, 'note.txt'), 'utf8'), 'owned by user\n');
});
