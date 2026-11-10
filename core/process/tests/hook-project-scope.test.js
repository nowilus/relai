'use strict';

// K-C6 (plan OPTYMALIZACJA_PO_AUDYCIE, E4): hooki ostrzegawcze i skaner sekretow nie pracuja
// na plikach spoza katalogu projektu (skrypt w %TEMP%, inny dysk), a werdykt skanera nie nazywa
// pliku "sledzonym", gdy git tego nie potwierdzil. Kazdy przypadek "cisza" ma w tym samym
// tescie kontrole pozytywna (zasada 3). Sekret skladany w czasie dzialania (konwencje, sekcja 6).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS = path.join(ROOT, 'adapters', 'claude-code', 'hooks');
const NAZWA = ['DB', 'PASSWORD'].join('_');
const WARTOSC = ['m7Q', '9rV', '2zL', '8pN'].join('');

function fikstura(t, ustawienia) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c6-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const projekt = path.join(baza, 'projekt');
  const obcy = path.join(baza, 'obcy');
  const home = path.join(baza, 'home');
  for (const d of [path.join(projekt, 'docs'), obcy, home]) fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(projekt, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n\n' +
    '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n' + (ustawienia || ''));
  return { projekt, obcy, home };
}

function zapisz(plik, tresc) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, tresc);
  return plik;
}

function hook(f, nazwa, zdarzenie, toolInput) {
  const r = spawnSync(process.execPath, [path.join(HOOKS, nazwa + '.js')], {
    cwd: f.projekt,
    input: JSON.stringify({
      hook_event_name: zdarzenie, cwd: f.projekt, tool_name: 'Write', tool_input: toolInput,
    }),
    encoding: 'utf8',
    env: { ...process.env, HOME: f.home, USERPROFILE: f.home },
  });
  assert.equal(r.status, 0, nazwa + ' konczy sie kodem 0');
  if (!r.stdout.trim()) return null;
  return JSON.parse(r.stdout).hookSpecificOutput;
}

function kontekst(f, nazwa, plik) {
  const out = hook(f, nazwa, 'PostToolUse', { file_path: plik });
  return out ? out.additionalContext : '';
}

test('console-log-warn: a file outside the project gets no warning, the same file inside does', (t) => {
  const f = fikstura(t);
  const tresc = 'console.log(1);\n';
  assert.equal(kontekst(f, 'console-log-warn', zapisz(path.join(f.obcy, 'skrypt.js'), tresc)), '');
  assert.match(kontekst(f, 'console-log-warn', zapisz(path.join(f.projekt, 'skrypt.js'), tresc)), /console-log-warn/);
});

test('design-quality-check: outside file skipped, inside file warned', (t) => {
  const f = fikstura(t);
  zapisz(path.join(f.projekt, 'docs', 'DESIGN.md'), '# DESIGN\n\n## Kolory\n\ngranat\n');
  const tresc = 'body { color: navy; }\n';
  assert.equal(kontekst(f, 'design-quality-check', zapisz(path.join(f.obcy, 'styl.css'), tresc)), '');
  assert.match(kontekst(f, 'design-quality-check', zapisz(path.join(f.projekt, 'styl.css'), tresc)), /docs\/DESIGN\.md/);
});

test('quality-gate: outside file skipped, inside file warned', (t) => {
  const f = fikstura(t);
  zapisz(path.join(f.projekt, 'tsconfig.json'), '{}');
  zapisz(path.join(f.projekt, 'node_modules', 'typescript', 'lib', 'tsc.js'),
    "process.stdout.write('a.ts(1,1): error TS2322: x\\n'); process.exit(1);\n");
  const tresc = 'const a: number = 1;\n';
  assert.equal(kontekst(f, 'quality-gate', zapisz(path.join(f.obcy, 'a.ts'), tresc)), '');
  assert.match(kontekst(f, 'quality-gate', zapisz(path.join(f.projekt, 'a.ts'), tresc)), /tsc --noEmit: 1/);
});

test('profile-rules: a file on another drive is skipped, inside file warned',
  { skip: process.platform !== 'win32' }, (t) => {
    const f = fikstura(t, '| 2026-11-09 | Profil projektu | app |\n');
    // Plik na innym dysku nie musi istniec — hook czyta tylko sciezke.
    const innyDysk = ['Z:', 'relai-nie-istnieje', 'src', 'a.js'].join(path.sep);
    assert.equal(kontekst(f, 'profile-rules', innyDysk), '');
    assert.match(kontekst(f, 'profile-rules', zapisz(path.join(f.projekt, 'src', 'a.js'), 'x\n')), /pierwszy kod/);
    assert.equal(kontekst(f, 'profile-rules', zapisz(path.join(f.obcy, 'src', 'a.js'), 'x\n')), '');
  });

function werdykt(f, plik) {
  return hook(f, 'secret-scanner', 'PreToolUse', {
    file_path: plik, content: NAZWA + ' = "' + WARTOSC + '"\n',
  });
}

test('secret-scanner: a file outside the project directory passes, inside it is denied', (t) => {
  const f = fikstura(t);
  assert.equal(werdykt(f, path.join(f.obcy, 'cfg.txt')), null);
  const w = werdykt(f, path.join(f.projekt, 'cfg.txt'));
  assert.ok(w, 'skaner odpowiada dla pliku w projekcie');
  assert.equal(w.permissionDecision, 'deny');
});

test('secret-scanner: the verdict does not call the file tracked unless git said so', (t) => {
  const f = fikstura(t);
  const plik = path.join(f.projekt, 'cfg.txt');
  const bezGita = werdykt(f, plik);
  assert.ok(bezGita, 'skaner odpowiada w projekcie bez gita');
  assert.equal(bezGita.permissionDecision, 'deny');
  assert.doesNotMatch(bezGita.permissionDecisionReason, /sledzon/);
  assert.match(bezGita.permissionDecisionReason, /bez repozytorium gita/);

  const init = spawnSync('git', ['init', '-q'], { cwd: f.projekt });
  assert.equal(init.status, 0, 'git init w fiksturze (git w PATH)');
  const zGitem = werdykt(f, plik);
  assert.ok(zGitem, 'skaner odpowiada w repozytorium');
  assert.match(zGitem.permissionDecisionReason, /ktorego git nie ignoruje/);

  fs.writeFileSync(path.join(f.projekt, '.gitignore'), 'cfg.txt\n');
  assert.equal(werdykt(f, plik), null);
});
