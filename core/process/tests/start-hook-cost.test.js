'use strict';

// Koszt hooka startu — etap E7 planu OPTYMALIZACJA_PO_AUDYCIE.
// K-C1: skan artefaktow czyta kazdy plik testowy najwyzej raz, pozycje z katalogu tymczasowego
// omijaja bramki dokumentow i testow, znacznik "ustawienia podane" lezy poza prefiksem relai-.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const wa = require('../work-artifacts.js');
const core = require('../session-signals.js');
const skrotStartu = require('../start-digest.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(ROOT, 'adapters', 'claude-code', 'hooks', 'session-context.js');

// Licznik odczytow: podmienia fs.readFileSync i liczy po path.resolve; zwraca funkcje przywracajaca.
function licznikOdczytow() {
  const oryginal = fs.readFileSync;
  const liczby = new Map();
  fs.readFileSync = function (p, ...reszta) {
    if (typeof p === 'string') {
      const k = path.resolve(p);
      liczby.set(k, (liczby.get(k) || 0) + 1);
    }
    return oryginal.call(fs, p, ...reszta);
  };
  return { liczby, przywroc: () => { fs.readFileSync = oryginal; } };
}

function zapisz(p, tresc) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, tresc);
}

// Fikstura hooka: projekt, katalog domowy i katalog tymczasowy obok siebie (L-0312), nie w projekcie.
function srodowisko() {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-'));
  const projekt = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  const tmp = path.join(baza, 'tmp');
  zapisz(path.join(projekt, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n' +
    '| 2026-08-07 | Jezyk projektu | polski |\n');
  zapisz(path.join(projekt, 'CLAUDE.md'), '# Fikstura\n');
  zapisz(path.join(home, '.claude', 'relai', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-08-07 | Jezyk pracy | polski |\n');
  fs.mkdirSync(tmp, { recursive: true });
  const env = { ...process.env, HOME: home, USERPROFILE: home, TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  return { baza, projekt, home, tmp, env };
}

function hook(payload, env) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify(payload), encoding: 'utf8', env, timeout: 60000,
  });
  return r.stdout || '';
}

test('work artifact scan reads each test file at most once (C1)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-skan-'));
  const licznik = licznikOdczytow();
  try {
    for (const temat of ['TEMAT_A', 'TEMAT_B', 'TEMAT_C']) {
      zapisz(path.join(dir, '.claude', 'relai', 'work', temat, 'E1', 'wynik.txt'), 'x\n');
    }
    const testy = ['a', 'b', 'c', 'd'].map((n) => path.join(dir, 'tests', n + '.test.js'));
    for (const t of testy) zapisz(t, '// test fikstury\n');

    wa.artefaktyRobocze(dir, { zrodla: ['work'] });

    let razem = 0;
    for (const t of testy) {
      const n = licznik.liczby.get(path.resolve(t)) || 0;
      assert.ok(n <= 1, path.basename(t) + ' przeczytany ' + n + ' razy');
      razem += n;
    }
    assert.ok(razem <= 4, 'razem ' + razem + ' odczytow plikow testowych');
  } finally {
    licznik.przywroc();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a temp item is not protected by project documents or tests (C1)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-temp-'));
  try {
    zapisz(path.join(dir, 'CLAUDE.md'), '# Fikstura\n\nC:/fikcja/Temp/relai-probka oraz relai-probka/\n');
    zapisz(path.join(dir, 'tests', 'x.test.js'), "// C:/fikcja/Temp/relai-probka\n");
    const kontekst = wa.kontekstBramki(dir, { sledzone: null, markery: [] });

    const temp = { wzgledna: 'C:/fikcja/Temp/relai-probka', zrodlo: 'temp', sciezka: path.join(dir, 'nie-ma'), bajty: 1 };
    assert.equal(wa.bramka(temp, kontekst), null);

    // Kontrola pozytywna w tym samym przebiegu: pozycja projektu z ta sama nazwa jest opisana.
    const repo = { wzgledna: 'relai-probka', zrodlo: 'repo', sciezka: path.join(dir, 'nie-ma'), bajty: 1 };
    const wynik = wa.bramka(repo, kontekst);
    assert.ok(wynik, 'pozycja repo bez ochrony');
    assert.equal(wynik.powod, 'opisane');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the settings marker lives outside the relai- prefix and old markers are removed (C1)', () => {
  const s = srodowisko();
  try {
    fs.writeFileSync(path.join(s.tmp, 'relai-ustawienia-podane-stary'), '');

    const start = hook({ hook_event_name: 'SessionStart', source: 'startup', cwd: s.projekt, session_id: 'k-c1' }, s.env);
    assert.match(start, /Ustawienia globalne uzytkownika/);
    assert.ok(fs.existsSync(path.join(s.tmp, 'znaczniki-relai', 'ustawienia-podane-k-c1')), 'brak znacznika w znaczniki-relai');
    const stare = fs.readdirSync(s.tmp).filter((n) => n.startsWith('relai-ustawienia-podane-'));
    assert.deepEqual(stare, []);

    const skill = hook({
      hook_event_name: 'PostToolUse', tool_name: 'Skill', tool_input: { skill: 'relai:relai-core' },
      cwd: s.projekt, session_id: 'k-c1',
    }, s.env);
    assert.doesNotMatch(skill, /Ustawienia globalne uzytkownika/);
  } finally {
    fs.rmSync(s.baza, { recursive: true, force: true });
  }
});

// --- K-C3: jeden odczyt dokumentu na proces hooka startu ---------------------------------------

function projektStartu(dir) {
  zapisz(path.join(dir, 'CLAUDE.md'), '# Fikstura\n\n## Stan prac\n\nAktywny plan: brak\n');
  zapisz(path.join(dir, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n' +
    '| 2026-10-28 | Budżet startu sesji | włączony |\n' +
    '| 2026-08-12 | Rotacja dokumentów | włączona |\n' +
    '| 2026-09-01 | Przegląd spraw człowieka | włączony · 30 dni |\n' +
    '| 2026-09-03 | Artefakty robocze | włączone |\n');
  zapisz(path.join(dir, 'docs', 'STATE.md'), '# STATE\n\n## Gdzie jesteśmy\n\nFikstura.\n');
  zapisz(path.join(dir, 'docs', 'DZIENNIK.md'),
    '# DZIENNIK\n\n## Stan otwartych ryzyk\n\n| # | Ryzyko | Poziom | Status |\n|---|---|---|---|\n\n' +
    '## Czeka na człowieka\n\n- brak\n\n## Wpisy\n\n### 2026-11-10 — wpis fikstury\n\nAutor: Fikstura\n');
  zapisz(path.join(dir, 'docs', 'LEKCJE.md'), '# LEKCJE\n\n## Zasady aktywne\n\n- brak\n');
}

test('start sequence with read memory reads each start document once and builds the digest once (C3)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-start-'));
  const tmp = path.join(dir, '..', path.basename(dir) + '-tmp');
  fs.mkdirSync(tmp, { recursive: true });
  const env = { TEMP: process.env.TEMP, TMP: process.env.TMP, TMPDIR: process.env.TMPDIR };
  const oryginalSkrot = skrotStartu.startDigest;
  let budowy = 0;
  let licznik = null;
  try {
    projektStartu(dir);
    process.env.TEMP = tmp; process.env.TMP = tmp; process.env.TMPDIR = tmp;
    skrotStartu.startDigest = function (...a) { budowy += 1; return oryginalSkrot.apply(this, a); };
    licznik = licznikOdczytow();
    if (typeof core.pamiecOdczytow === 'function') core.pamiecOdczytow(true);

    const markerFile = core.relaiMarkerFile(dir, ['.claude/relai.json']);
    assert.ok(markerFile, 'fikstura bez markera');
    core.projectVersion(markerFile);
    core.promptGap(dir);
    core.stateDrift(dir);
    core.siatkaRytualu(dir);
    core.unknownAuthor(dir);
    core.startCost(dir, { markeryGoscia: ['.claude/relai.json'] });
    core.sprawyPrzeterminowane(dir, { markeryGoscia: ['.claude/relai.json'] });
    core.artefaktyRobocze(dir, { markeryGoscia: ['.claude/relai.json'] });
    core.wiekListyModeli(dir, { nazwa: 'MODELE-test.md' });

    licznik.przywroc();
    const odczyty = (rel) => licznik.liczby.get(path.resolve(dir, rel)) || 0;
    for (const rel of ['docs/DZIENNIK.md', 'docs/USTAWIENIA.md', 'CLAUDE.md']) {
      assert.ok(odczyty(rel) <= 1, rel + ' przeczytany ' + odczyty(rel) + ' razy');
    }
    assert.equal(budowy, 1, 'skrot startu zbudowany ' + budowy + ' razy');
    for (const a of ['claude-code', 'cursor', 'codex']) {
      const zrodlo = fs.readFileSync(path.join(ROOT, 'adapters', a, 'hooks', 'session-context.js'), 'utf8');
      assert.ok(zrodlo.includes('pamiecOdczytow(true)'), a + ': hook bez pamieci odczytow');
    }
  } finally {
    if (licznik) licznik.przywroc();
    if (typeof core.pamiecOdczytow === 'function') core.pamiecOdczytow(false);
    skrotStartu.startDigest = oryginalSkrot;
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('read memory is off by default and forgets on switch-off (C3)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-pamiec-'));
  try {
    assert.equal(typeof core.czytaj, 'function');
    const p = path.join(dir, 'plik.md');
    fs.writeFileSync(p, 'A');
    assert.equal(core.czytaj(p), 'A');
    fs.writeFileSync(p, 'B');
    assert.equal(core.czytaj(p), 'B');
    core.pamiecOdczytow(true);
    assert.equal(core.czytaj(p), 'B');
    fs.writeFileSync(p, 'C');
    assert.equal(core.czytaj(p), 'B');
    core.pamiecOdczytow(false);
    assert.equal(core.czytaj(p), 'C');
  } finally {
    if (typeof core.pamiecOdczytow === 'function') core.pamiecOdczytow(false);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// --- K-C2: prowizja tylko przy zmianie ----------------------------------------------------------

function licznikKopii() {
  const oryginal = fs.copyFileSync;
  const stan = { n: 0 };
  fs.copyFileSync = function (...a) { stan.n += 1; return oryginal.apply(fs, a); };
  return { stan, przywroc: () => { fs.copyFileSync = oryginal; } };
}

test('provisioning copies on the first start and nothing on an unchanged second start (C2)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-prow-'));
  let kopie = null;
  try {
    const pierwszy = core.provisionTemplates(dir);
    assert.ok(pierwszy >= 52, 'pierwsza kopia: ' + pierwszy);
    kopie = licznikKopii();
    const drugi = core.provisionTemplates(dir);
    kopie.przywroc();
    assert.equal(drugi, 0);
    assert.equal(kopie.stan.n, 0, 'copyFileSync przy drugim starcie: ' + kopie.stan.n);
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'relai', '.provisioned')));
  } finally {
    if (kopie) kopie.przywroc();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a missing or edited copy forces a copy (C2)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-prow-'));
  try {
    const relai = path.join(dir, '.claude', 'relai');
    assert.ok(core.provisionTemplates(dir) > 0);

    const spec = path.join(relai, 'templates', 'SPEC_ARCHIWUM.md');
    fs.rmSync(spec);
    assert.ok(core.provisionTemplates(dir) > 0, 'brak specyfikacji bez kopii');
    assert.ok(fs.existsSync(spec));

    const pakiet = path.join(relai, 'tools', 'package.json');
    fs.rmSync(pakiet);
    assert.ok(core.provisionTemplates(dir) > 0, 'brak package.json bez kopii');
    assert.ok(fs.existsSync(pakiet));

    const reguly = path.join(relai, 'humanize', 'REGULY.md');
    fs.writeFileSync(reguly, 'stara kopia\n');
    assert.ok(core.provisionTemplates(dir) > 0, 'edytowana kopia bez kopii');
    assert.notEqual(fs.readFileSync(reguly, 'utf8'), 'stara kopia\n');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a source edited without a version bump forces a copy (C2)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-prow-'));
  try {
    const coreTemplates = path.join(dir, 'zrodlo-templates');
    fs.cpSync(path.join(ROOT, 'core', 'templates'), coreTemplates, { recursive: true });
    const projekt = path.join(dir, 'projekt');
    fs.mkdirSync(projekt);

    assert.ok(core.provisionTemplates(projekt, { coreTemplates }) > 0);
    assert.equal(core.provisionTemplates(projekt, { coreTemplates }), 0);
    const czas = new Date(Date.now() + 5000);
    fs.utimesSync(path.join(coreTemplates, 'SPEC_ARCHIWUM.md'), czas, czas);
    assert.ok(core.provisionTemplates(projekt, { coreTemplates }) > 0, 'zmienione zrodlo bez kopii');
    assert.equal(core.provisionTemplates(projekt, { coreTemplates }), 0);
    assert.ok(core.provisionTemplates(projekt, { coreTemplates, wymus: true }) > 0, 'wymus bez kopii');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the session hook says "copied" only after a real copy and not after compaction (C2)', () => {
  const s = srodowisko();
  const ZDANIE = /Specyfikacje dokumentow RelAI sa skopiowane lokalnie/;
  try {
    const zdarzenie = (source, id) => hook({ hook_event_name: 'SessionStart', source, cwd: s.projekt, session_id: id }, s.env);

    zdarzenie('compact', 'k-c2-a');
    assert.ok(!fs.existsSync(path.join(s.projekt, '.claude', 'relai', 'templates')), 'kompakcja skopiowala');

    assert.match(zdarzenie('startup', 'k-c2-b'), ZDANIE);
    assert.doesNotMatch(zdarzenie('startup', 'k-c2-c'), ZDANIE);
    assert.doesNotMatch(zdarzenie('compact', 'k-c2-d'), ZDANIE);
  } finally {
    fs.rmSync(s.baza, { recursive: true, force: true });
  }
});
