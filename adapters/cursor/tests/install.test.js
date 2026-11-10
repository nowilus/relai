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

// --- K-D5 (etap E06 planu OPTYMALIZACJA_PO_AUDYCIE) -----------------------------------------
// Manifest jest dana z dysku projektu: deinstalacja nie moze usunac niczego spoza .cursor/.
function deinstalacjaZManifestem(t, wpis) {
  const root = projekt(t);
  const dir = path.join(root, 'proj');
  fs.mkdirSync(path.join(dir, '.cursor', 'rules'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'docs'));
  const ofiaraPoza = path.join(root, 'ofiara.txt');
  const ofiaraWProjekcie = path.join(dir, 'docs', 'plan.md');
  const nasz = path.join(dir, '.cursor', 'rules', 'relai-core.mdc');
  for (const p of [ofiaraPoza, ofiaraWProjekcie, nasz]) fs.writeFileSync(p, 'x\n');
  const files = ['.cursor/rules/relai-core.mdc', typeof wpis === 'function' ? wpis(root, dir) : wpis];
  fs.writeFileSync(path.join(dir, '.cursor', 'relai-install.json'), JSON.stringify({ adapter: 'cursor', files }));
  const r = spawnSync(process.execPath, [INSTALL, dir, '--uninstall'], { encoding: 'utf8', timeout: 120000 });
  return { r, dir, ofiaraPoza, ofiaraWProjekcie, nasz };
}

const zle = [
  ['wyjscie przez ..', '../ofiara.txt'],
  ['wyjscie przez .. pod .cursor', '.cursor/../../ofiara.txt'],
  ['sciezka bezwzgledna', (root) => path.join(root, 'ofiara.txt').split(path.sep).join('/')],
  ['plik projektu spoza .cursor', 'docs/plan.md'],
  ['dowiazanie w .cursor wskazujace na zewnatrz', (root, dir) => {
    fs.symlinkSync(root, path.join(dir, '.cursor', 'link'), 'junction');
    return '.cursor/link/ofiara.txt';
  }],
];

for (const [opis, wpis] of zle) {
  test('deinstalacja odmawia, gdy manifest wskazuje plik poza .cursor/: ' + opis, (t) => {
    const { r, dir, ofiaraPoza, ofiaraWProjekcie, nasz } = deinstalacjaZManifestem(t, wpis);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stderr, /spoza \.cursor\//);
    for (const p of [ofiaraPoza, ofiaraWProjekcie, nasz]) assert.ok(fs.existsSync(p), p);
    assert.ok(fs.existsSync(path.join(dir, '.cursor', 'relai-install.json')), 'manifest zostaje');
  });
}

test('deinstalacja usuwa pozycje manifestu pod .cursor/ zapisane z ukosnikami', (t) => {
  const dir = projekt(t);
  uruchom(dir);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, '.cursor', 'relai-install.json'), 'utf8'));
  assert.ok(manifest.files.length > 0);
  assert.ok(manifest.files.every((rel) => rel.startsWith('.cursor/')), 'instalator zapisuje tylko .cursor/');
  uruchom(dir, '--uninstall');
  for (const rel of manifest.files) assert.equal(fs.existsSync(path.join(dir, ...rel.split('/'))), false, rel);
});
