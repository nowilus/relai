'use strict';

// K-D8 (plan OPTYMALIZACJA_PO_AUDYCIE, E5): secret-scanner blokuje polecenie Bash z sekretem
// w projekcie RelAI oraz edycje Edit/MultiEdit, po ktorej PLIK zawiera sekret, ktorego przed
// edycja nie zawieral. Kazdy przypadek "cisza" stoi w tym samym tescie co kontrola pozytywna
// (zasada 3). Wartosci skladane w czasie dzialania (konwencje, sekcja 6) — w tym pliku nie ma
// gotowego przypisania sekretu.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS = path.join(ROOT, 'adapters', 'claude-code', 'hooks');
const HOOK = path.join(HOOKS, 'secret-scanner.js');

const NAZWA = ['DB', 'PASSWORD'].join('_');
const NAZWA_T = ['GITHUB', 'TOKEN'].join('_');
const CZ1 = ['m7Q', '9'].join('');
const CZ2 = ['rV2', 'zL8pN'].join('');
const PELNA = CZ1 + CZ2;

function fikstura(t, opcje) {
  const o = opcje || {};
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-d8-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(root, { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  if (o.marker !== false) {
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
      '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  }
  if (o.gosc) {
    fs.mkdirSync(path.join(root, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(root, '.claude', 'relai.json'), '{"mode":"guest"}');
  }
  if (o.git) {
    const r = spawnSync('git', ['init', '-q'], { cwd: root, encoding: 'utf8' });
    assert.equal(r.status, 0, 'git init w fiksturze');
    fs.writeFileSync(path.join(root, '.gitignore'), 'lokalny.txt\n');
  }
  return { root, home };
}

function plik(f, nazwa, tresc) {
  const p = path.join(f.root, nazwa);
  fs.writeFileSync(p, tresc);
  return p;
}

// null = cisza; inaczej { decyzja, powod }.
function hook(f, tool, toolInput) {
  const r = spawnSync(process.execPath, [HOOK], {
    cwd: f.root,
    input: JSON.stringify({ hook_event_name: 'PreToolUse', cwd: f.root, tool_name: tool, tool_input: toolInput }),
    encoding: 'utf8',
    env: { ...process.env, HOME: f.home, USERPROFILE: f.home },
  });
  assert.equal(r.status, 0, 'hook konczy sie kodem 0');
  if (!r.stdout.trim()) return null;
  const out = JSON.parse(r.stdout).hookSpecificOutput;
  return { decyzja: out.permissionDecision, powod: out.permissionDecisionReason };
}

function bash(f, polecenie) {
  return hook(f, 'Bash', { command: polecenie });
}

test('secret-scanner: a secret in a Bash command is denied', (t) => {
  const f = fikstura(t);
  const w = bash(f, 'export ' + NAZWA_T + '=' + PELNA);
  assert.ok(w, 'polecenie export z sekretem dostaje werdykt');
  assert.equal(w.decyzja, 'deny');
  assert.match(w.powod, /w poleceniu powloki/);
  assert.match(w.powod, /Wartosc nie zostala zacytowana celowo/);
  assert.ok(!w.powod.includes(PELNA), 'wartosc nie trafia do komunikatu');

  const klucz = 'sk-' + ['abcd', 'EFGH', 'ijkl', 'MNOP', 'qrst'].join('');
  const curl = bash(f, 'curl -H "Authorization: Bearer ' + klucz + '" https://example.invalid');
  assert.ok(curl, 'curl z kluczem dostaje werdykt');
  assert.equal(curl.decyzja, 'deny');

  // Cisza: odczyt zmiennej, zwykly commit.
  assert.equal(bash(f, 'echo ' + NAZWA_T + '=$' + NAZWA_T), null);
  assert.equal(bash(f, 'git commit -m "fix: secret scan"'), null);

  // Cisza poza projektem RelAI i w trybie goscia — to samo polecenie z sekretem.
  const bez = fikstura(t, { marker: false });
  assert.equal(bash(bez, 'export ' + NAZWA_T + '=' + PELNA), null);
  const gosc = fikstura(t, { gosc: true });
  assert.equal(bash(gosc, 'export ' + NAZWA_T + '=' + PELNA), null);
});

test('hooks.json: secret-scanner is registered for Bash in PreToolUse', () => {
  const pre = JSON.parse(fs.readFileSync(path.join(HOOKS, 'hooks.json'), 'utf8')).hooks.PreToolUse;
  const grupa = pre.find((g) => new RegExp(g.matcher).test('Bash'));
  assert.ok(grupa, 'grupa PreToolUse pasujaca do Bash');
  assert.ok(grupa.hooks.some((h) => h.command.includes('secret-scanner.js')), 'secret-scanner w grupie Bash');
  const zapis = pre.find((g) => new RegExp(g.matcher).test('Write'));
  assert.ok(zapis, 'grupa PreToolUse dla Write');
  assert.ok(!new RegExp(zapis.matcher).test('Bash'), 'grupa Write nie pasuje do Bash');
});

test('secret-scanner: an Edit composing a secret with the file text is denied', (t) => {
  const f = fikstura(t, { git: true });
  const a = plik(f, 'a.txt', NAZWA + '=' + CZ1 + '\n');
  const w = hook(f, 'Edit', { file_path: a, old_string: CZ1, new_string: PELNA });
  assert.ok(w, 'edycja skladajaca sekret dostaje werdykt');
  assert.equal(w.decyzja, 'deny');
  assert.match(w.powod, /zlozone z tresci pliku/);

  // Plik mial juz sekret: edycja innego miejsca przechodzi.
  const b = plik(f, 'b.txt', NAZWA + '=' + PELNA + '\nopis\n');
  assert.equal(hook(f, 'Edit', { file_path: b, old_string: 'opis', new_string: 'opis 2' }), null);
  // Ten sam plik, ale new_string niesie drugi sekret — blokada jak dotad.
  const drugi = ['API', 'TOKEN'].join('_') + '=' + CZ2 + CZ1;
  const w2 = hook(f, 'Edit', { file_path: b, old_string: 'opis', new_string: drugi });
  assert.ok(w2, 'drugi sekret w new_string');
  assert.equal(w2.decyzja, 'deny');

  // Pliku nie ma; old_string nieobecny; new_string z wzorcami zamiany.
  assert.equal(hook(f, 'Edit', { file_path: path.join(f.root, 'brak.txt'), old_string: CZ1, new_string: PELNA }), null);
  assert.equal(hook(f, 'Edit', { file_path: a, old_string: 'nie-ma-mnie', new_string: PELNA }), null);
  assert.equal(hook(f, 'Edit', { file_path: a, old_string: CZ1, new_string: "$&$'$1" }), null);

  // Plik ignorowany przez gita, zlozony do sekretu — cisza.
  const lok = plik(f, 'lokalny.txt', NAZWA + '=' + CZ1 + '\n');
  assert.equal(hook(f, 'Edit', { file_path: lok, old_string: CZ1, new_string: PELNA }), null);
});

test('secret-scanner: MultiEdit and replace_all composing a secret are denied', (t) => {
  const f = fikstura(t, { git: true });
  const m = plik(f, 'm.txt', 'A\nB\n');
  const w = hook(f, 'MultiEdit', {
    file_path: m,
    edits: [{ old_string: 'A', new_string: NAZWA + '=' + CZ1 }, { old_string: CZ1, new_string: PELNA }],
  });
  assert.ok(w, 'MultiEdit skladajacy sekret dostaje werdykt');
  assert.equal(w.decyzja, 'deny');

  const r = plik(f, 'r.txt', NAZWA + '=' + CZ1 + 'ZZ\n');
  const w2 = hook(f, 'Edit', { file_path: r, old_string: 'ZZ', new_string: CZ2, replace_all: true });
  assert.ok(w2, 'replace_all skladajacy sekret dostaje werdykt');
  assert.equal(w2.decyzja, 'deny');
});

test('secret-scanner: a CRLF file with a two-line LF old_string is composed after normalization', (t) => {
  const f = fikstura(t, { git: true });
  const c = plik(f, 'c.txt', NAZWA + '=' + CZ1 + '\r\nend\r\n');
  const w = hook(f, 'Edit', { file_path: c, old_string: CZ1 + '\nend', new_string: PELNA + '\nend' });
  assert.ok(w, 'plik CRLF zlozony do sekretu dostaje werdykt');
  assert.equal(w.decyzja, 'deny');
});
