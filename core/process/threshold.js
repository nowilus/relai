'use strict';

// Progi limitu planu (LIMIT_CHECKPOINT E1, dwa od Aneksu C) dla hookow pluginu relai:
// od ilu procent zuzycia ostrzega okno 5 h (domyslnie 90) i tydzien (domyslnie 98).
// Kazdy prog czytany w kolejnosci zgody optymalizatora (prompt-mode.js): plik tej
// sesji .claude/relai/limit/<id>.json (klucz `prog` albo `progTydzien`) → wiersz
// `Próg limitu` albo `Próg limitu tygodnia` w docs/USTAWIENIA.md → ten sam wiersz
// w ~/.claude/relai/USTAWIENIA.md → domyslny okna. Ustawienie pluginu nie jest
// poziomem odczytu (Aneks B).
//
// Blizniak cache-keeper/hooks/limit.ts (silnik modow, odczyt przez $.fs). Obie
// strony czytaja te same fixtury w tests/fixtures/limit/ i test parytetu pilnuje,
// zeby daly ten sam wynik. Zmieniasz jedna — zmieniasz obie.
//
// Bez zaleznosci, Node 14+. Przepiecie prompt-mode.js na te funkcje swiadomie
// odlozone (bramka E1, decyzja 2026-10-11: „tylko gotowa”).

const fs = require('fs');
const path = require('path');

const DOMYSLNY = 90;
const DOMYSLNE = { five: 90, week: 98 };
const KATALOG_SESJI = '.claude/relai/limit';

// Identyfikator spoza [A-Za-z0-9_-] znaczy brak pliku: z niego skladana jest sciezka.
const ID_SESJI = /^[A-Za-z0-9_-]{1,128}$/;
// Klucz pliku sesji dla okna.
const KLUCZ = { five: 'prog', week: 'progTydzien' };
// Cala komorka "Czego dotyczy", zamknieta lista brzmien na okno (L-0025): wiersz
// tygodnia nigdy nie jest czytany jako wiersz 5 h.
const NAZWY = {
  five: /^(?:Próg limitu|Prog limitu|Limit threshold)$/i,
  week: /^(?:Próg limitu tygodnia|Prog limitu tygodnia|Weekly limit threshold)$/i,
};
// Komorka wartosci zaczyna sie liczba calkowita; `%` i czlony po `·` sa dla czlowieka.
const WARTOSC = /^(\d{1,3})\s*%?(?=\s|·|$)/;
// Wiersze pod tym naglowkiem sa wycofane i nie rozstrzygaja.
const WYCOFANE = /^#+\s.*(?:wycofane|withdrawn)/i;

function jestProgiem(n) {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 99;
}

function czytaj(plik) {
  try {
    return fs.readFileSync(plik, 'utf8');
  } catch (_) {
    return null; // brak pliku albo nieczytelny — rozstrzyga nastepny poziom
  }
}

function plikSesji(cwd, sesja) {
  if (!ID_SESJI.test(String(sesja || ''))) return null;
  return path.join(cwd || '.', ...KATALOG_SESJI.split('/'), String(sesja) + '.json');
}

// Okno spoza listy to blad wolajacego, nie cichy prog 5 h.
function okno(nazwa) {
  const o = nazwa === undefined ? 'five' : nazwa;
  if (!Object.prototype.hasOwnProperty.call(DOMYSLNE, o)) throw new Error('prog limitu: nieznane okno ' + o);
  return o;
}

function zPlikuSesji(txt, nazwaOkna) {
  const klucz = KLUCZ[okno(nazwaOkna)];
  if (!txt) return null;
  try {
    const j = JSON.parse(txt);
    return j && typeof j === 'object' && jestProgiem(j[klucz]) ? j[klucz] : null;
  } catch (_) {
    return null;
  }
}

// Pierwszy wiersz okna nad sekcja wycofanych: liczba 1–99 albo null.
function zWiersza(txt, nazwaOkna) {
  const nazwa = NAZWY[okno(nazwaOkna)];
  for (const linia of String(txt || '').split('\n')) {
    if (WYCOFANE.test(linia)) return null;
    if (!linia.trim().startsWith('|')) continue;
    const cells = linia.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    if (!nazwa.test(cells[2].replace(/\*\*/g, '').trim())) continue;
    const m = cells[3].replace(/\*\*/g, '').trim().match(WARTOSC);
    const n = m ? Number(m[1]) : NaN;
    return jestProgiem(n) ? n : null;
  }
  return null;
}

// { value, source } — source: 'sesja' | 'projekt' | 'globalnie' | 'domyślny'.
// opcje: { cwd, home, sesja, okno } — okno: 'five' (domyslnie) albo 'week'.
function progLimitu(opcje) {
  const o = opcje || {};
  const w = okno(o.okno);
  const plik = plikSesji(o.cwd, o.sesja);
  const sesja = plik ? zPlikuSesji(czytaj(plik), w) : null;
  if (sesja !== null) return { value: sesja, source: 'sesja' };
  const projekt = zWiersza(czytaj(path.join(o.cwd || '.', 'docs', 'USTAWIENIA.md')), w);
  if (projekt !== null) return { value: projekt, source: 'projekt' };
  const globalnie = zWiersza(czytaj(path.join(o.home || '.', '.claude', 'relai', 'USTAWIENIA.md')), w);
  if (globalnie !== null) return { value: globalnie, source: 'globalnie' };
  return { value: DOMYSLNE[w], source: 'domyślny' };
}

module.exports = { DOMYSLNY, DOMYSLNE, jestProgiem, plikSesji, zPlikuSesji, zWiersza, progLimitu };
