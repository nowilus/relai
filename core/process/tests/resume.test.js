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
    assert.deepEqual(wzn.plikWznowienia(p.root), { rel: '.claude/relai/wznowienie/sklep.md', data: '2026-10-11 14:05' });
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
