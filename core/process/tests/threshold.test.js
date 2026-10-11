'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const prog = require('../threshold.js');

// Fixtury sa sledzone przez gita (L-0156): tests/fixtures/limit/<przypadek>/{proj,home}
// i expected.json z wynikiem kazdego przypadku dla obu okien (5 h i tydzien, Aneks C).
// Te same fixtury czyta limit.ts z cache-keepera (przez rdzen panelu
// limit-threshold.mjs) w tescie parytetu nizej.
const BAZA = path.join(__dirname, 'fixtures', 'limit');
const OCZEKIWANE = JSON.parse(fs.readFileSync(path.join(BAZA, 'expected.json'), 'utf8'));
const przypadek = (nazwa) => ({ cwd: path.join(BAZA, nazwa, 'proj'), home: path.join(BAZA, nazwa, 'home'), sesja: 's1' });

test('kazdy przypadek z fixtur daje oczekiwany prog i zrodlo w obu oknach', () => {
  const nazwy = Object.keys(OCZEKIWANE);
  assert.ok(nazwy.length >= 12, 'fixtury nie moga byc puste — zero przypadkow wygladaloby jak sukces');
  for (const nazwa of nazwy) {
    assert.deepEqual(prog.progLimitu(przypadek(nazwa)), OCZEKIWANE[nazwa].five, nazwa + ' / 5 h');
    assert.deepEqual(prog.progLimitu({ ...przypadek(nazwa), okno: 'five' }), OCZEKIWANE[nazwa].five, nazwa + ' / 5 h jawnie');
    assert.deepEqual(prog.progLimitu({ ...przypadek(nazwa), okno: 'week' }), OCZEKIWANE[nazwa].week, nazwa + ' / tydzien');
  }
});

test('kolejnosc: sesja 85 + projekt 95 + globalnie 80 → 85; bez sesji → 95; bez projektu → 80; nic → 90', () => {
  assert.deepEqual(prog.progLimitu(przypadek('wszystkie-trzy')), { value: 85, source: 'sesja' });
  assert.deepEqual(prog.progLimitu(przypadek('bez-sesji')), { value: 95, source: 'projekt' });
  assert.deepEqual(prog.progLimitu(przypadek('tylko-globalnie')), { value: 80, source: 'globalnie' });
  assert.deepEqual(prog.progLimitu(przypadek('nic')), { value: 90, source: 'domyślny' });
});

test('prog tygodnia z kazdego poziomu; domyslnie 98; wiersz tygodnia nie jest wierszem 5 h', () => {
  const tydzien = (nazwa) => prog.progLimitu({ ...przypadek(nazwa), okno: 'week' });
  assert.deepEqual(tydzien('tydzien-sesja'), { value: 97, source: 'sesja' });
  assert.deepEqual(tydzien('tydzien-projekt'), { value: 96, source: 'projekt' });
  assert.deepEqual(tydzien('tydzien-globalnie'), { value: 95, source: 'globalnie' });
  assert.deepEqual(tydzien('nic'), { value: 98, source: 'domyślny' });
  // Dowod negatywny: sam wiersz tygodnia (96) nie ustawia progu 5 h, a sam wiersz 5 h (95) tygodnia
  assert.deepEqual(prog.progLimitu(przypadek('tydzien-projekt')), { value: 92, source: 'projekt' });
  assert.deepEqual(tydzien('bez-sesji'), { value: 98, source: 'domyślny' });
  // Wiersz wycofany i nazwa podobna nie rozstrzygaja
  assert.deepEqual(tydzien('tydzien-wycofany'), { value: 98, source: 'domyślny' });
});

test('ustawienie wolajacego nie jest poziomem odczytu (Aneks B): opcja zapas nic nie zmienia', () => {
  assert.deepEqual(prog.progLimitu({ ...przypadek('nic'), zapas: 70 }), { value: 90, source: 'domyślny' });
});

test('nieznane okno to blad, nie cichy prog 5 h', () => {
  assert.throws(() => prog.progLimitu({ ...przypadek('nic'), okno: 'miesiac' }), /nieznane okno/);
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
  assert.equal(prog.zPlikuSesji('{"prog": 85, "progTydzien": 0}', 'week'), null);
  assert.equal(prog.zPlikuSesji('{"prog": 85, "progTydzien": 97}', 'week'), 97);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu | 85.5 |'), null);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu | 7 % · test |'), 7);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu tygodnia | 97 |'), null);
  assert.equal(prog.zWiersza('| 2026-10-11 | Próg limitu tygodnia | 97 |', 'week'), 97);
});

test('parytet z cache-keeper/hooks/limit.ts: te same fixtury, ten sam wynik w obu oknach', async () => {
  // Node 22.18+ laduje .ts bez kompilacji; limit.ts importuje tylko zsynchronizowana kopie rdzenia
  const { pathToFileURL } = require('node:url');
  const limit = await import(pathToFileURL(path.join(__dirname, '..', '..', '..', 'cache-keeper', 'hooks', 'limit.ts')).href);
  const io = {
    read: async (p) => { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; } },
    write: async () => { throw new Error('parytet tylko czyta'); },
  };
  let porownane = 0;
  for (const nazwa of Object.keys(OCZEKIWANE)) {
    const p = przypadek(nazwa);
    const where = { root: p.cwd, home: p.home, sessionId: p.sesja };
    const oba = await limit.thresholdsOf(io, where);
    for (const okno of ['five', 'week']) {
      assert.deepEqual(oba[okno], prog.progLimitu({ ...p, okno }), nazwa + ' / ' + okno);
      assert.deepEqual(oba[okno], OCZEKIWANE[nazwa][okno], nazwa + ' / ' + okno);
      assert.deepEqual(await limit.thresholdOf(io, where, okno), oba[okno], nazwa + ' / ' + okno + ' pojedynczo');
      porownane++;
    }
  }
  assert.equal(porownane, 2 * Object.keys(OCZEKIWANE).length);
  assert.equal(limit.DEFAULT_THRESHOLD, prog.DOMYSLNY);
  assert.deepEqual(limit.DEFAULTS, prog.DOMYSLNE);
});
