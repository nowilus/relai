'use strict';
// RelAI core / narzedzie: wywolania sieciowe w kodzie pluginow (odnoga AUDYT_SKILLI, S7).
//
// Po co: „Agent Skills — overview” (sekcja o bezpieczenstwie, odczyt 2026-10-11) kaze szukac
// w przyjmowanym kodzie nieoczekiwanych wywolan sieciowych. RelAI obiecuje jeden ruch sieciowy
// (strona cennika po „Tak”) — ta kontrola pilnuje, zeby drugi nie pojawil sie po cichu, takze
// w kodzie przyjetym z zewnatrz (SPEC_PRZYJECIE_KODU.md). Czysta logika; walidator decyduje
// o kodzie wyjscia. Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');

// Kod wykonywany pluginow. Testy, typy i dokumenty nie wchodza: test wola siec atrapa, a typy
// opisuja API, ktorego nikt w nich nie wywoluje.
const KATALOGI = ['core', 'adapters', 'hooks', 'panel', 'progress', 'cache-keeper'];
const ROZSZERZENIA = /\.(c?js|mjs|ts|tsx)$/;
const POMIJANE = /(^|\/)(node_modules|tests?|types|work)(\/|$)|\.test\.|\.d\.ts$/;

const WZORCE = [
  /\brequire\(\s*['"](?:node:)?(?:http|https|net|tls|dgram|http2)['"]\s*\)/,
  /\bfrom\s+['"](?:node:)?(?:http|https|net|tls|dgram|http2)['"]/,
  /\bimport\(\s*['"](?:node:)?(?:http|https|net|tls|dgram|http2)['"]\s*\)/,
  /\bfetch\s*\(/,
  /\$\.http\b/,
  /\bXMLHttpRequest\b|\bWebSocket\s*\(/,
];

// Linia komentarza (//, /*, * w JSDoc) nie jest wywolaniem: opis „fetch(” w komentarzu to nie ruch.
const KOMENTARZ = /^\s*(\/\/|\/\*|\*)/;

function wywolania(tekst) {
  const wynik = [];
  String(tekst).replace(/\r\n/g, '\n').split('\n').forEach((l, i) => {
    if (KOMENTARZ.test(l)) return;
    const w = WZORCE.find((re) => re.test(l));
    if (w) wynik.push({ linia: i + 1, fragment: (l.match(w) || [''])[0] });
  });
  return wynik;
}

function pliki(root) {
  const zebrane = [];
  const idz = (rel) => {
    let wpisy = [];
    try { wpisy = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch (_) { return; }
    for (const w of wpisy) {
      const r = rel ? rel + '/' + w.name : w.name;
      if (POMIJANE.test(r)) continue;
      if (w.isDirectory()) idz(r);
      else if (ROZSZERZENIA.test(w.name)) zebrane.push(r);
    }
  };
  for (const k of KATALOGI) idz(k);
  return zebrane;
}

// Lista dozwolonych: { plik, poCo }. Plik spoza listy z wywolaniem = blad; pozycja listy bez
// wywolania w pliku = blad (lista ma byc prawda o dzisiejszym kodzie, nie archiwum).
function sprawdz(root, dozwolone) {
  const bledy = [];
  const trafione = new Set();
  let plikow = 0;
  for (const rel of pliki(root)) {
    plikow++;
    let txt = '';
    try { txt = fs.readFileSync(path.join(root, rel), 'utf8'); } catch (_) { continue; }
    const w = wywolania(txt);
    if (!w.length) continue;
    if (dozwolone.some((d) => d.plik === rel)) { trafione.add(rel); continue; }
    for (const x of w) bledy.push(rel + ':' + x.linia + ' wywolanie sieciowe "' + x.fragment + '" poza lista dozwolonych (SPEC_PRZYJECIE_KODU.md)');
  }
  for (const d of dozwolone) {
    if (!trafione.has(d.plik)) bledy.push(d.plik + ': pozycja listy dozwolonych nie ma juz wywolania sieciowego — usun ja z listy');
  }
  return { bledy, plikow, dozwolonych: trafione.size };
}

module.exports = { wywolania, pliki, sprawdz };
