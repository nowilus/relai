// K-E6: skraca komorke "Co sie zmienilo" rejestru artefaktow do wpisu biezacej wersji.
// Uzycie: node skroc-rejestr.js <wejscie ARTEFAKTY.md> <wyjscie> <nazwa pliku archiwum>
// Niczego nie zmienia poza komorka "Co sie zmienilo" w wierszach tabel z ta kolumna.
'use strict';
const fs = require('fs');

const [, , wejscie, wyjscie, archiwum] = process.argv;
if (!wejscie || !wyjscie || !archiwum) {
  process.stderr.write('Uzycie: node skroc-rejestr.js <wejscie> <wyjscie> <nazwa pliku archiwum>\n');
  process.exit(2);
}

const NAGLOWEK = /^(Co się zmieniło|What changed)$/i;
// Poczatek wpisu kolejnej (starszej) wersji: data, spacja, "(wersja N".
const NASTEPNY_WPIS = /\s+\d{4}-\d{2}-\d{2} \((?:wersja|version) \d+/;
const ODSYLACZ = ' Starsze wersje: [' + archiwum + '](archiwum/artefakty/' + archiwum + ').';

const tekst = fs.readFileSync(wejscie, 'utf8');
const crlf = tekst.includes('\r\n');
const linie = tekst.replace(/\r\n/g, '\n').split('\n');

let kolumna = -1;
let skrocone = 0;
let wierszy = 0;
const wynik = linie.map((linia) => {
  if (!linia.trim().startsWith('|')) { kolumna = -1; return linia; }
  // Podzial po "|" z pominieciem "\|" — tak samo jak release-checks.js.
  const czesci = linia.split(/(?<!\\)\|/);
  const komorki = czesci.map((c) => c.trim());
  const i = komorki.findIndex((c) => NAGLOWEK.test(c));
  if (i > 0) { kolumna = i; return linia; }
  if (kolumna < 0 || /^\|\s*-/.test(linia)) return linia;
  wierszy += 1;
  const komorka = czesci[kolumna];
  if (komorka === undefined) return linia;
  const tresc = komorka.trim();
  const m = NASTEPNY_WPIS.exec(tresc);
  // Pierwszy wpis zaczyna sie na pozycji 0, wiec trafienie na pozycji > 0 to poczatek starszego.
  if (!m || m.index === 0) return linia;
  czesci[kolumna] = ' ' + tresc.slice(0, m.index).trimEnd() + ODSYLACZ + ' ';
  skrocone += 1;
  return czesci.join('|');
});

let out = wynik.join('\n');
if (crlf) out = out.replace(/\n/g, '\r\n');
fs.writeFileSync(wyjscie, out);
process.stdout.write('wierszy tabel z kolumna: ' + wierszy + ', skroconych: ' + skrocone +
  ', bajty przed: ' + Buffer.byteLength(tekst) + ', po: ' + Buffer.byteLength(out) + '\n');
