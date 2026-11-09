'use strict';

// Instalator Cursora: wskaznik CLAUDE.md na AGENTS.md (commit 1db1bb6) i zachowanie
// istniejacych plikow wskazowek. Odpowiednik testu instalatora Codeksa; instalator Cursora
// jest skryptem CLI, wiec test uruchamia go procesem na katalogu tymczasowym.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const INSTALL = path.join(__dirname, '..', 'install.js');

function projekt(t, pliki = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-cursor-install-'));
  for (const [nazwa, tresc] of Object.entries(pliki)) fs.writeFileSync(path.join(dir, nazwa), tresc);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }));
  return dir;
}

function uruchom(dir, ...flagi) {
  const r = spawnSync(process.execPath, [INSTALL, dir, '--bez-skanu', ...flagi], { encoding: 'utf8', timeout: 120000 });
  assert.equal(r.status, 0, [r.error && String(r.error), r.stderr, r.stdout].filter(Boolean).join('\n'));
}

for (const pliki of [{}, { 'AGENTS.md': 'agent rules\n' }, { 'CLAUDE.md': 'claude rules\n' },
  { 'AGENTS.md': 'agent rules\n', 'CLAUDE.md': 'claude rules\n' }]) {
  test('instalacja zachowuje istniejace wskazowki: ' + (Object.keys(pliki).join('+') || 'pusty projekt'), (t) => {
    const dir = projekt(t, pliki);
    uruchom(dir);
    assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /RelAI project router/);
    const claude = fs.readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
    assert.ok(claude.startsWith('@AGENTS.md\n'), 'import AGENTS.md ma byc w pierwszej linii CLAUDE.md');
    for (const [nazwa, tresc] of Object.entries(pliki)) {
      assert.equal(fs.readFileSync(path.join(dir, '.cursor', 'relai-guidance', 'original-' + nazwa.toLowerCase()), 'utf8'), tresc);
    }
    uruchom(dir, '--uninstall');
    for (const [nazwa, tresc] of Object.entries(pliki)) assert.equal(fs.readFileSync(path.join(dir, nazwa), 'utf8'), tresc);
    for (const nazwa of ['AGENTS.md', 'CLAUDE.md']) if (!(nazwa in pliki)) assert.equal(fs.existsSync(path.join(dir, nazwa)), false);
  });
}
