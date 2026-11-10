'use strict';

// K-C4 (plan OPTYMALIZACJA_PO_AUDYCIE, E4): awaria hooka Claude Code zostawia jedna linie
// ASCII "[RelAI <hook>] blad: <nazwa>" na stderr; guardy (secret-scanner, config-protection)
// przy bledzie wewnetrznym pytaja (ask); awaria jednego raportu startu nie kasuje bloku
// [RelAI session-context]. Kazdy przypadek "ciszy" ma kontrole pozytywna (zasady 3 i 5).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS = path.join(ROOT, 'adapters', 'claude-code', 'hooks');
const ZEPSUTE = '{nie json';

function baza(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c4-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const home = path.join(dir, 'home');
  fs.mkdirSync(home, { recursive: true });
  return { dir, home };
}

function projekt(b, marker) {
  const root = path.join(b.dir, marker ? 'projekt' : 'zwykly');
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  if (marker) {
    fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
      '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  }
  return root;
}

function uruchom(plik, wejscie, cwd, home) {
  const r = spawnSync(process.execPath, [plik], {
    cwd,
    input: wejscie,
    encoding: 'utf8',
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function decyzja(stdout) {
  assert.notEqual(stdout.trim(), '', 'hook odpowiada decyzja, nie cisza');
  return JSON.parse(stdout).hookSpecificOutput;
}

// Atrapa pluginu: katalog z kopia hooka i (opcjonalnie) modulami rdzenia jako re-eksport.
function atrapa(b, hook, moduly) {
  const korzen = path.join(b.dir, 'plugin-' + hook);
  const hooki = path.join(korzen, 'adapters', 'claude-code', 'hooks');
  fs.mkdirSync(hooki, { recursive: true });
  fs.copyFileSync(path.join(HOOKS, hook + '.js'), path.join(hooki, hook + '.js'));
  for (const [nazwa, tresc] of Object.entries(moduly || {})) {
    const cel = path.join(korzen, 'core', 'process', nazwa);
    fs.mkdirSync(path.dirname(cel), { recursive: true });
    fs.writeFileSync(cel, tresc);
  }
  return path.join(hooki, hook + '.js');
}

function reeksport(nazwa) {
  return 'module.exports = require(' + JSON.stringify(path.join(ROOT, 'core', 'process', nazwa)) + ');\n';
}

for (const hook of ['secret-scanner', 'config-protection']) {
  test(hook + ': malformed stdin asks and leaves one trace line', (t) => {
    const b = baza(t);
    const root = projekt(b, true);
    const r = uruchom(path.join(HOOKS, hook + '.js'), ZEPSUTE, root, b.home);
    assert.equal(r.status, 0);
    const out = decyzja(r.stdout);
    assert.equal(out.permissionDecision, 'ask');
    assert.match(out.permissionDecisionReason, /blad wewnetrzny/);
    assert.equal(r.stderr.trim(), '[RelAI ' + hook + '] blad: SyntaxError');

    // Kontrola: poprawny payload w folderze bez markera daje cisze, takze z BOM na poczatku.
    const zwykly = projekt(b, false);
    const payload = JSON.stringify({
      hook_event_name: 'PreToolUse', cwd: zwykly, tool_name: 'Write',
      tool_input: { file_path: path.join(zwykly, 'a.txt'), content: 'zwykly tekst' },
    });
    for (const wejscie of [payload, String.fromCharCode(0xfeff) + payload]) {
      const c = uruchom(path.join(HOOKS, hook + '.js'), wejscie, zwykly, b.home);
      assert.equal(c.status, 0);
      assert.equal(c.stdout, '');
      assert.equal(c.stderr, '');
    }
  });
}

test('guards without the core ask and name MODULE_NOT_FOUND', (t) => {
  const b = baza(t);
  const zwykly = projekt(b, false);
  for (const hook of ['secret-scanner', 'config-protection']) {
    const plik = atrapa(b, hook);
    const payload = JSON.stringify({
      hook_event_name: 'PreToolUse', cwd: zwykly, tool_name: 'Write',
      tool_input: { file_path: path.join(zwykly, 'a.txt'), content: 'x' },
    });
    const r = uruchom(plik, payload, zwykly, b.home);
    assert.equal(r.status, 0, hook);
    assert.equal(decyzja(r.stdout).permissionDecision, 'ask', hook);
    assert.equal(r.stderr.trim(), '[RelAI ' + hook + '] blad: MODULE_NOT_FOUND', hook);
  }
});

test('session-context: one failing report keeps the block, the ritual line and the other reports', (t) => {
  const b = baza(t);
  const root = projekt(b, true);
  const sesje = ['test-c4-awaria', 'test-c4-kontrola'];
  t.after(() => {
    for (const id of sesje) fs.rmSync(path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id), { force: true });
  });
  const sygnaly = path.join(ROOT, 'core', 'process', 'session-signals.js');
  const wspolne = { 'prompt-mode.js': reeksport('prompt-mode.js'), 'resume.js': reeksport('resume.js') };

  const zepsuta = atrapa(b, 'session-context', {
    ...wspolne,
    'session-signals.js': 'const real = require(' + JSON.stringify(sygnaly) + ');\n' +
      "module.exports = { ...real, stateDrift() { throw new TypeError('test'); } };\n",
  });
  const r = uruchom(zepsuta, JSON.stringify({
    hook_event_name: 'SessionStart', cwd: root, session_id: sesje[0],
  }), root, b.home);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\[RelAI session-context\]/);
  assert.match(r.stdout, /wykonaj rytual startu sesji/);
  assert.ok(r.stdout.includes('Siatka "rozjazd stanu" nie zadzialala (blad: TypeError)'));
  assert.equal(r.stderr.trim(), '[RelAI session-context] blad: TypeError');

  // Kontrola pozytywna: ta sama atrapa z czystym re-eksportem.
  fs.writeFileSync(path.join(path.dirname(path.dirname(path.dirname(path.dirname(zepsuta)))),
    'core', 'process', 'session-signals.js'), reeksport('session-signals.js'));
  const c = uruchom(zepsuta, JSON.stringify({
    hook_event_name: 'SessionStart', cwd: root, session_id: sesje[1],
  }), root, b.home);
  assert.equal(c.status, 0);
  assert.match(c.stdout, /wykonaj rytual startu sesji/);
  assert.doesNotMatch(c.stdout, /nie zadzialala/);
  assert.equal(c.stderr, '');
});

test('non-guard hooks: malformed stdin gives exit 0, empty stdout and one trace line', (t) => {
  const b = baza(t);
  const root = projekt(b, true);
  const nazwy = ['session-context', 'prompt-mode', 'humanize-continuous', 'session-title',
    'lockfile-scan', 'quality-gate', 'console-log-warn', 'design-quality-check', 'profile-rules',
    'journal-signature', 'doc-sync-reminder', 'auto-format'];
  for (const nazwa of nazwy) {
    const r = uruchom(path.join(HOOKS, nazwa + '.js'), ZEPSUTE, root, b.home);
    assert.equal(r.status, 0, nazwa);
    assert.equal(r.stdout, '', nazwa);
    assert.equal(r.stderr.trim(), '[RelAI ' + nazwa + '] blad: SyntaxError', nazwa);
  }
});

test('skill relai-core names the failed-net line as the second exception', () => {
  for (const adapter of ['claude-code', 'codex']) {
    const tekst = fs.readFileSync(path.join(ROOT, 'adapters', adapter, 'skills', 'relai-core', 'SKILL.md'), 'utf8')
      .replace(/\r\n/g, '\n');
    assert.ok(tekst.includes('nie zadzialala” → porównujesz sam tylko tę siatkę'), adapter);
    assert.ok(tekst.includes('nie ma\n  w ogóle'), adapter + ': kontrola pozytywna');
  }
});
