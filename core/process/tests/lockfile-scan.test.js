'use strict';

// Hook lockfile-scan (plan BEZPIECZENSTWO, E2): wolany procesem z JSON-em na stdin, tak jak
// wola go Claude Code. Logike niesie skill trivy-scan (eksport run); test sprawdza bramke
// projektu RelAI i trybu goscia, warunki ciszy i — gdy Trivy jest na maszynie — notke na
// fixturze skilla. Kazdy przypadek ciszy przy pliku blokady ma obok kontrole pozytywna
// na tej samej fixturze (zasada 5).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ADAPTER = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code');
const HOOK = path.join(ADAPTER, 'hooks', 'lockfile-scan.js');
const LOGIKA = path.join(ADAPTER, 'skills', 'trivy-scan', 'scripts', 'lockfile-hook.mjs');
const FIXTURA = path.join(ADAPTER, 'skills', 'trivy-scan', 'evals', 'scan-reports-fix-plan', 'files');

// Folder w katalogu tymczasowym: opcjonalnie fixtura skilla, marker RelAI, marker goscia.
function folder(t, { fixtura = false, relai = true, gosc = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-lockfile-scan-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  if (fixtura) fs.cpSync(FIXTURA, dir, { recursive: true });
  if (relai) {
    fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.2.0\n');
  }
  if (gosc) {
    fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.claude', 'relai.json'), '{"mode":"guest"}');
  }
  return dir;
}

function uruchom(skrypt, wejscie) {
  const r = spawnSync(process.execPath, [skrypt], { input: wejscie, encoding: 'utf8', timeout: 120000 });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

const zdarzenie = (cwd, narzedzie, tool_input) => JSON.stringify({
  hook_event_name: 'PostToolUse', cwd, tool_name: narzedzie, tool_input,
});
const zapisBlokady = (dir) => zdarzenie(dir, 'Write', { file_path: path.join(dir, 'package-lock.json') });

// Notka przy pliku blokady albo skip, gdy Trivy lub jego bazy nie ma na tej maszynie.
function oczekujNotki(t, wyjscie) {
  assert.notEqual(wyjscie, '', 'hook przy pliku blokady musi sie odezwac (notka albo brak Trivy)');
  const kontekst = JSON.parse(wyjscie).hookSpecificOutput.additionalContext;
  if (/no quick scan ran/.test(kontekst)) {
    t.skip('Trivy albo jego baza niedostepne na tej maszynie: ' + kontekst);
    return;
  }
  assert.match(kontekst, /^\[trivy-scan\] /);
  assert.match(kontekst, /HIGH 16/);
}

test('Edit pliku spoza listy plikow blokady: cisza, kod 0', (t) => {
  const dir = folder(t);
  assert.equal(uruchom(HOOK, zdarzenie(dir, 'Edit', { file_path: path.join(dir, 'README.md') })), '');
});

test('Bash bez komendy instalacji: cisza', (t) => {
  const dir = folder(t);
  assert.equal(uruchom(HOOK, zdarzenie(dir, 'Bash', { command: 'ls -la && git status' })), '');
});

test('bledny JSON na stdin: cisza, kod 0', () => {
  assert.equal(uruchom(HOOK, 'to nie jest JSON {'), '');
});

test('Write package-lock.json w projekcie RelAI z fixtura skilla: notka [trivy-scan] z HIGH 16', (t) => {
  const dir = folder(t, { fixtura: true });
  oczekujNotki(t, uruchom(HOOK, zapisBlokady(dir)));
});

test('ta sama fixtura poza projektem RelAI: cisza (konwencja hook-guard)', (t) => {
  const dir = folder(t, { fixtura: true, relai: false });
  assert.equal(uruchom(HOOK, zapisBlokady(dir)), '');
});

test('ta sama fixtura w trybie goscia: cisza', (t) => {
  const dir = folder(t, { fixtura: true, gosc: true });
  assert.equal(uruchom(HOOK, zapisBlokady(dir)), '');
});

test('lockfile-hook.mjs uruchomiony wprost (wpis reczny, diagnostyka) dalej czyta stdin sam', (t) => {
  const dir = folder(t, { fixtura: true, relai: false });
  oczekujNotki(t, uruchom(LOGIKA, zapisBlokady(dir)));
});
