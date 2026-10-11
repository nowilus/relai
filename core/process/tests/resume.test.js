'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const wzn = require('../resume.js');

// Plik wznowienia (LIMIT_CHECKPOINT E3): .claude/relai/wznowienie/<slug-projektu>.md, per projekt.
// Slug powstaje z nazwy katalogu projektu i nigdy nie wychodzi poza katalog wznowien.

const HOOK = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'hooks', 'session-context.js');
const USTAWIENIA = '# USTAWIENIA\n\nWersja RelAI: 2.8.0 · zainicjowano: 2026-08-07\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-08-07 | Język projektu | polski |\n';

function projekt(nazwa) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e3-wzn-'));
  const root = path.join(baza, nazwa);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'), USTAWIENIA);
  return { baza, root, home: path.join(baza, 'home') };
}

const sprzataj = (p) => fs.rmSync(p.baza, { recursive: true, force: true });

function hook(p) {
  fs.mkdirSync(p.home, { recursive: true });
  const env = { ...process.env, HOME: p.home, USERPROFILE: p.home };
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ hook_event_name: 'SessionStart', cwd: p.root, session_id: 'e3-test' }),
    encoding: 'utf8', env, timeout: 30000,
  });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

test('slug z nazwy katalogu: male litery, znaki spoza [a-z0-9_-] na myslnik', () => {
  assert.equal(wzn.slugProjektu('C:/Users/x/Desktop/RelAI'), 'relai');
  assert.equal(wzn.slugProjektu('/home/x/Moj Projekt.v2'), 'moj-projekt-v2');
  assert.equal(wzn.slugProjektu('C:\\Users\\x\\app_1'), 'app_1');
  assert.equal(wzn.sciezkaWznowienia('/p/RelAI'), '.claude/relai/wznowienie/relai.md');
});

test('slug, ktory moglby wyjsc z katalogu, nie sklada sciezki', () => {
  assert.equal(wzn.slugProjektu('../'), null);
  assert.equal(wzn.slugProjektu('/p/..'), null);
  assert.equal(wzn.slugProjektu(''), null);
  assert.equal(wzn.sciezkaWznowienia('/p/..'), null);
  for (const zly of ['../', '/p/..', '/', 'C:/']) {
    const s = wzn.slugProjektu(zly);
    assert.ok(s === null || /^[A-Za-z0-9_-]+$/.test(s), zly);
  }
});

test('plik wznowienia: brak pliku = null; plik z linia Zapisano = jego data', () => {
  const p = projekt('Sklep');
  try {
    assert.equal(wzn.plikWznowienia(p.root), null);
    const plik = path.join(p.root, '.claude', 'relai', 'wznowienie', 'sklep.md');
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.writeFileSync(plik, '# WZNOWIENIE — Sklep\n\nZapisano: 2026-10-11 14:05 · HEAD: abc1234\n');
    assert.deepEqual(wzn.plikWznowienia(p.root), { rel: '.claude/relai/wznowienie/sklep.md', data: '2026-10-11 14:05', head: 'abc1234', commitow: null });
  } finally {
    sprzataj(p);
  }
});

test('raport: jedno zdanie z nazwa pliku i data; brak pliku = zero znakow', () => {
  assert.deepEqual(wzn.wznowienieReport(null), []);
  const linie = wzn.wznowienieReport({ rel: '.claude/relai/wznowienie/sklep.md', data: '2026-10-11 14:05' });
  assert.equal(linie.length, 1);
  assert.match(linie[0], /\.claude\/relai\/wznowienie\/sklep\.md/);
  assert.match(linie[0], /2026-10-11 14:05/);
  assert.match(linie[0], /^[\x20-\x7E]+$/, 'komunikaty hookow sa ASCII');
});

test('hook startu: zdanie o pliku wznowienia przy jego obecnosci, cisza bez niego', () => {
  const p = projekt('Sklep');
  try {
    const bez = hook(p);
    assert.match(bez, /\[RelAI session-context\]/, 'kontrola pozytywna: hook przemowil w tym projekcie');
    assert.doesNotMatch(bez, /wznowienie\/sklep\.md/);
    const plik = path.join(p.root, '.claude', 'relai', 'wznowienie', 'sklep.md');
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.writeFileSync(plik, '# WZNOWIENIE — Sklep\n\nZapisano: 2026-10-11 14:05 · HEAD: abc1234\n');
    const z = hook(p);
    assert.match(z, /Plik wznowienia pracy: \.claude\/relai\/wznowienie\/sklep\.md \(zapisany 2026-10-11 14:05\)/);
  } finally {
    sprzataj(p);
  }
});

test('parytet z cache-keeper/hooks/limit.ts: ten sam slug i ta sama sciezka', async () => {
  const limit = await import(pathToFileURL(path.join(__dirname, '..', '..', '..', 'cache-keeper', 'hooks', 'limit.ts')).href);
  const katalogi = ['C:/Users/x/Desktop/RelAI', '/home/x/Moj Projekt.v2', 'C:\\Users\\x\\app_1', '../', '/p/..', '', 'C:/', 'C:\\', '/a/Łódź-2'];
  for (const k of katalogi) {
    assert.equal(limit.resumeSlug(k), wzn.slugProjektu(k), k);
    assert.equal(limit.resumePath(k), wzn.sciezkaWznowienia(k), k);
  }
});

// LIMIT_CHECKPOINT E4 (L5 planu): zdanie hooka mowi, ile commitow doszlo od hasha z pliku
// wznowienia — 0, N albo hash nieznany. Prawdziwe repozytorium gita w katalogu tymczasowym.
function git(root, ...args) {
  const r = spawnSync('git', ['-c', 'user.name=relai-test', '-c', 'user.email=relai@test', '-c', 'commit.gpgsign=false', ...args], { cwd: root, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
}

function zapiszWznowienie(p, head) {
  const plik = path.join(p.root, '.claude', 'relai', 'wznowienie', 'sklep.md');
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, '# WZNOWIENIE — Sklep\n\nZapisano: 2026-10-11 14:05 · HEAD: ' + head + '\n');
}

test('hash z linii Zapisano: tylko szesnastkowy 4–40 znakow; reszta to brak hasha', () => {
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11 14:05 · HEAD: abc1234\n'), 'abc1234');
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11 · HEAD: `abc1234`\r\n'), 'abc1234');
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11 · HEAD: abc'), null);
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11 · HEAD: --output=x'), null);
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11 · HEAD: ABC1234'), null);
  assert.equal(wzn.hashZapisu('Zapisano: 2026-10-11'), null);
  assert.equal(wzn.commitowOdZapisu(os.tmpdir(), '--all'), null, 'wartosc spoza wzorca nie dochodzi do gita');
});

test('hook startu: od zapisu 0 commitow, potem 2, a hash nieznany mowi o nieaktualnej liscie', () => {
  const p = projekt('Sklep');
  try {
    git(p.root, 'init', '-q');
    git(p.root, 'add', '-A');
    git(p.root, 'commit', '-q', '-m', 'start');
    const head = git(p.root, 'rev-parse', '--short=7', 'HEAD');
    zapiszWznowienie(p, head);
    const zero = hook(p);
    assert.match(zero, new RegExp('Od zapisu nie doszedl zaden commit \\(HEAD zapisu ' + head + '\\)'));
    for (const n of [1, 2]) {
      fs.writeFileSync(path.join(p.root, 'plik' + n + '.txt'), String(n));
      git(p.root, 'add', 'plik' + n + '.txt');
      git(p.root, 'commit', '-q', '-m', 'krok ' + n);
    }
    const dwa = hook(p);
    assert.match(dwa, new RegExp('Od zapisu doszly 2 commity \\(HEAD zapisu ' + head + '\\): lista "Co dalej" moze byc nieaktualna'));
    assert.doesNotMatch(dwa, /nie doszedl zaden commit/);
    zapiszWznowienie(p, 'deadbeef');
    const obcy = hook(p);
    assert.match(obcy, /Hash HEAD zapisu deadbeef jest nieznany w tym repozytorium/);
    for (const tekst of [zero, dwa, obcy]) {
      const linia = tekst.split('\n').find((l) => l.startsWith('Plik wznowienia pracy:')) || '';
      assert.match(linia, /^[\x20-\x7E]+$/, 'komunikaty hookow sa ASCII');
    }
  } finally {
    sprzataj(p);
  }
});

test('liczba commitow po polsku: 1 commit, 3 commity, 5 commitow, 12 commitow, 22 commity', () => {
  const zdanie = (n) => wzn.wznowienieReport({ rel: 'x.md', data: 'd', head: 'abc1234', commitow: n })[0];
  assert.match(zdanie(1), /doszedl 1 commit \(/);
  assert.match(zdanie(3), /doszly 3 commity/);
  assert.match(zdanie(5), /doszlo 5 commitow/);
  assert.match(zdanie(12), /doszlo 12 commitow/);
  assert.match(zdanie(22), /doszly 22 commity/);
  // Bez hasha w pliku: zadnego zdania o commitach
  assert.doesNotMatch(wzn.wznowienieReport({ rel: 'x.md', data: 'd', head: null, commitow: null })[0], /commit|Hash/);
  // Hash jest, ale nie dalo sie sprawdzic (brak gita, czas): tez cisza, nie "hash nieznany"
  assert.doesNotMatch(wzn.wznowienieReport({ rel: 'x.md', data: 'd', head: 'abc1234', commitow: null })[0], /commit|Hash/);
  assert.match(wzn.wznowienieReport({ rel: 'x.md', data: 'd', head: 'abc1234', commitow: 'nieznany' })[0], /Hash HEAD zapisu abc1234 jest nieznany/);
  // Katalog bez repozytorium: null, nie 'nieznany'
  const bezGita = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e4-bezgita-'));
  try {
    assert.equal(wzn.commitowOdZapisu(bezGita, 'abc1234'), null);
  } finally {
    fs.rmSync(bezGita, { recursive: true, force: true });
  }
});
