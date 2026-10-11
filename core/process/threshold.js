'use strict';

// Prog limitu planu (LIMIT_CHECKPOINT E1) dla hookow pluginu relai: od ilu procent
// zuzycia limit 5 h albo tygodniowy ostrzega. Kolejnosc odczytu jak zgoda
// optymalizatora (prompt-mode.js): plik tej sesji .claude/relai/limit/<id>.json →
// wiersz `Próg limitu` w docs/USTAWIENIA.md → ten sam wiersz w
// ~/.claude/relai/USTAWIENIA.md → wartosc zapasowa wolajacego → 90.
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
const KATALOG_SESJI = '.claude/relai/limit';

// Identyfikator spoza [A-Za-z0-9_-] znaczy brak pliku: z niego skladana jest sciezka.
const ID_SESJI = /^[A-Za-z0-9_-]{1,128}$/;
// Cala komorka "Czego dotyczy", zamknieta lista brzmien (L-0025).
const NAZWA = /^(?:Próg limitu|Prog limitu|Limit threshold)$/i;
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

function zPlikuSesji(txt) {
  if (!txt) return null;
  try {
    const j = JSON.parse(txt);
    return j && typeof j === 'object' && jestProgiem(j.prog) ? j.prog : null;
  } catch (_) {
    return null;
  }
}

// Pierwszy wiersz `Próg limitu` nad sekcja wycofanych: liczba 1–99 albo null.
function zWiersza(txt) {
  for (const linia of String(txt || '').split('\n')) {
    if (WYCOFANE.test(linia)) return null;
    if (!linia.trim().startsWith('|')) continue;
    const cells = linia.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    if (!NAZWA.test(cells[2].replace(/\*\*/g, '').trim())) continue;
    const m = cells[3].replace(/\*\*/g, '').trim().match(WARTOSC);
    const n = m ? Number(m[1]) : NaN;
    return jestProgiem(n) ? n : null;
  }
  return null;
}

// { value, source } — source: 'sesja' | 'projekt' | 'globalnie' | 'ustawienie' | 'domyślny'.
// opcje: { cwd, home, sesja, zapas } — zapas to wartosc wolajacego (np. ustawienie pluginu).
function progLimitu(opcje) {
  const o = opcje || {};
  const plik = plikSesji(o.cwd, o.sesja);
  const sesja = plik ? zPlikuSesji(czytaj(plik)) : null;
  if (sesja !== null) return { value: sesja, source: 'sesja' };
  const projekt = zWiersza(czytaj(path.join(o.cwd || '.', 'docs', 'USTAWIENIA.md')));
  if (projekt !== null) return { value: projekt, source: 'projekt' };
  const globalnie = zWiersza(czytaj(path.join(o.home || '.', '.claude', 'relai', 'USTAWIENIA.md')));
  if (globalnie !== null) return { value: globalnie, source: 'globalnie' };
  if (jestProgiem(o.zapas) && o.zapas !== DOMYSLNY) return { value: o.zapas, source: 'ustawienie' };
  return { value: DOMYSLNY, source: 'domyślny' };
}

module.exports = { DOMYSLNY, jestProgiem, plikSesji, zPlikuSesji, zWiersza, progLimitu };
