'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const prog = require('../threshold.js');

// Fixtury sa sledzone przez gita (L-0156): tests/fixtures/limit/<przypadek>/{proj,home}
// i expected.json z wynikiem kazdego przypadku. Te same fixtury czyta limit.ts
// z cache-keepera w tescie parytetu nizej.
const BAZA = path.join(__dirname, 'fixtures', 'limit');
const OCZEKIWANE = JSON.parse(fs.readFileSync(path.join(BAZA, 'expected.json'), 'utf8'));
const przypadek = (nazwa) => ({ cwd: path.join(BAZA, nazwa, 'proj'), home: path.join(BAZA, nazwa, 'home'), sesja: 's1' });

test('kazdy przypadek z fixtur daje oczekiwany prog i zrodlo', () => {
  const nazwy = Object.keys(OCZEKIWANE);
  assert.ok(nazwy.length >= 8, 'fixtury nie moga byc puste — zero przypadkow wygladaloby jak sukces');
  for (const nazwa of nazwy) {
    assert.deepEqual(prog.progLimitu(przypadek(nazwa)), OCZEKIWANE[nazwa], nazwa);
  }
});

test('kolejnosc: sesja 85 + projekt 95 + globalnie 80 → 85; bez sesji → 95; bez projektu → 80; nic → zapas albo 90', () => {
  assert.deepEqual(prog.progLimitu(przypadek('wszystkie-trzy')), { value: 85, source: 'sesja' });
  assert.deepEqual(prog.progLimitu(przypadek('bez-sesji')), { value: 95, source: 'projekt' });
  assert.deepEqual(prog.progLimitu(przypadek('tylko-globalnie')), { value: 80, source: 'globalnie' });
  assert.deepEqual(prog.progLimitu({ ...przypadek('nic'), zapas: 70 }), { value: 70, source: 'ustawienie' });
  assert.deepEqual(prog.progLimitu({ ...przypadek('nic'), zapas: 90 }), { value: 90, source: 'domyślny' });
});

test('identyfikator sesji, ktory moglby wyjsc z katalogu, nie sklada sciezki', () => {
  assert.equal(prog.plikSesji('/p', '../etc'), null);
  assert.equal(prog.plikSesji('/p', 'a/b'), null);
  assert.equal(prog.plikSesji('/p', ''), null);
  assert.deepEqual(prog.progLimitu({ ...przypadek('wszystkie-trzy'), sesja: '../s1' }), { value: 95, source: 'projekt' });
});

test('wartosci spoza 1–99 i nieliczby sa pomijane', () => {
  assert.equal(prog.zPlikuSesji('{"prog": 100}'), null);
  assert.equal(prog.zPlikuSesji('{"prog": "85"}'), null);
  assert.equal(prog.zPlikuSesji('nie json'), null);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu | 85.5 |'), null);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu | 7 % · test |'), 7);
});

test('parytet z cache-keeper/hooks/limit.ts: te same fixtury, ten sam wynik', async () => {
  // Node 22.18+ laduje .ts bez kompilacji; limit.ts nie ma importow, wiec wystarcza sam plik
  const { pathToFileURL } = require('node:url');
  const limit = await import(pathToFileURL(path.join(__dirname, '..', '..', '..', 'cache-keeper', 'hooks', 'limit.ts')).href);
  const io = {
    read: async (p) => { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; } },
    write: async () => { throw new Error('parytet tylko czyta'); },
  };
  for (const nazwa of Object.keys(OCZEKIWANE)) {
    const p = przypadek(nazwa);
    const zLimitTs = await limit.thresholdOf(io, { root: p.cwd, home: p.home, sessionId: p.sesja }, 90);
    assert.deepEqual(zLimitTs, prog.progLimitu({ ...p, zapas: 90 }), nazwa);
    assert.deepEqual(zLimitTs, OCZEKIWANE[nazwa], nazwa);
  }
  assert.equal(limit.DEFAULT_THRESHOLD, prog.DOMYSLNY);
});
