'use strict';

// K-C10 (plan OPTYMALIZACJA_PO_AUDYCIE, E4): CLAUDE.md zapisany z koncami CRLF a sekcja
// niemutowalna. old_string i content od modelu maja LF; hook porownywal je z surowym
// tekstem pliku. Kazdy przypadek "cisza" ma w tym samym tescie kontrole pozytywna (zasada 3).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(ROOT, 'adapters', 'claude-code', 'hooks', 'config-protection.js');

const LINIE = [
  '# Projekt',
  '## Stan',
  'opis',
  '## Implementation guidelines (sekcja niemutowalna)',
  '- **Think before coding**: nie zakladaj.',
  '- **Simplicity first**: najprostsze rozwiazanie.',
];

function projekt(t) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c10-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  // CRLF jawnie w lancuchu — test nie liczy na core.autocrlf.
  fs.writeFileSync(path.join(root, 'CLAUDE.md'), LINIE.join('\r\n') + '\r\n');
  return { root, home };
}

function decyzja(p, toolName, toolInput) {
  const r = spawnSync(process.execPath, [HOOK], {
    cwd: p.root,
    input: JSON.stringify({
      hook_event_name: 'PreToolUse',
      cwd: p.root,
      tool_name: toolName,
      tool_input: { file_path: path.join(p.root, 'CLAUDE.md'), ...toolInput },
    }),
    encoding: 'utf8',
    env: { ...process.env, HOME: p.home, USERPROFILE: p.home },
  });
  assert.equal(r.status, 0, 'hook konczy sie kodem 0');
  if (!r.stdout.trim()) return 'cisza';
  return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision;
}

test('CRLF CLAUDE.md: a two-line LF old_string inside the immutable section asks', (t) => {
  const p = projekt(t);
  // Kontrola pozytywna: jedna linia listy i te same dwie linie z CRLF.
  assert.equal(decyzja(p, 'Edit', { old_string: LINIE[4], new_string: 'x' }), 'ask');
  assert.equal(decyzja(p, 'Edit', { old_string: LINIE[4] + '\r\n' + LINIE[5], new_string: 'x' }), 'ask');
  // Wlasciwy przypadek: dwie linie z LF, jak wysyla je model.
  assert.equal(decyzja(p, 'Edit', { old_string: LINIE[4] + '\n' + LINIE[5], new_string: 'x' }), 'ask');
});

test('CRLF CLAUDE.md: an LF Write with the section unchanged stays silent', (t) => {
  const p = projekt(t);
  const zmieniony = LINIE.map((l) => (l === 'opis' ? 'opis 2' : l));
  assert.equal(decyzja(p, 'Write', { content: zmieniony.join('\n') + '\n' }), 'cisza');
  // Kontrola pozytywna: usuniecie linii z sekcji pyta.
  const bezLinii = zmieniony.filter((l) => !l.includes('Simplicity first'));
  assert.equal(decyzja(p, 'Write', { content: bezLinii.join('\n') + '\n' }), 'ask');
});

test('CRLF CLAUDE.md: a two-line edit outside the section stays silent', (t) => {
  const p = projekt(t);
  assert.equal(decyzja(p, 'Edit', { old_string: '## Stan\nopis', new_string: '## Stan\nopis 2' }), 'cisza');
  // Kontrola pozytywna w tym samym przebiegu: edycja w sekcji pyta.
  assert.equal(decyzja(p, 'Edit', { old_string: LINIE[5], new_string: 'x' }), 'ask');
});
