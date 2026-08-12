// Osadza fonty w gotowym pliku planu HTML.
//
// Dlaczego to jest skrypt, a nie instrukcja „wklej base64": podzbiory Kalam
// i Hanken Grotesk to ~145 KB po zakodowaniu. Model języka nie przepisze tego
// z pliku do pliku — musi to zrobić proces.
//
// Uruchomienie (Node 14+, zero zależności):
//   node zbuduj.js <plik-planu.html> [<katalog-z-fontami>]
//
// Domyślnie fonty bierze z katalogu ./fonty obok tego skryptu.
// Skrypt podmienia znacznik /*{{FONTY}}*/ na reguły @font-face z data: URI.
// Jest bezpieczny do powtórnego uruchomienia: brak znacznika = brak zmian.

const fs = require('fs');
const path = require('path');

const ZAKRES_LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,' +
  'U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const ZAKRES_LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,' +
  'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,' +
  'U+2C60-2C7F,U+A720-A7FF';

// rodzina, waga, format, plik latin, plik latin-ext
const KROJE = [
  ['Kalam', '400', 'woff2', 'kalam-400-latin.woff2', 'kalam-400-latin-ext.woff2'],
  ['Kalam', '700', 'woff2', 'kalam-700-latin.woff2', 'kalam-700-latin-ext.woff2'],
  ['Hanken Grotesk', '100 900', 'woff2-variations', 'hanken-grotesk-latin.woff2', 'hanken-grotesk-latin-ext.woff2'],
];

function regula(rodzina, waga, format, plik, zakres, katalog){
  const dane = fs.readFileSync(path.join(katalog, plik)).toString('base64');
  return "@font-face{font-family:'" + rodzina + "';font-style:normal;font-weight:" + waga + ";" +
         "font-display:swap;src:url(data:font/woff2;base64," + dane + ") format('" + format + "');" +
         "unicode-range:" + zakres + ";}";
}

function main(){
  const plik = process.argv[2];
  const katalog = process.argv[3] || path.join(__dirname, 'fonty');

  if (!plik){
    process.stderr.write('Uzycie: node zbuduj.js <plik-planu.html> [<katalog-z-fontami>]\n');
    process.exit(2);
  }
  if (!fs.existsSync(plik)){
    process.stderr.write('Nie ma takiego pliku: ' + plik + '\n');
    process.exit(2);
  }
  if (!fs.existsSync(katalog)){
    process.stderr.write('Nie ma katalogu z fontami: ' + katalog + '\n');
    process.exit(2);
  }

  let txt = fs.readFileSync(plik, 'utf8');
  if (txt.indexOf('/*{{FONTY}}*/') === -1){
    process.stdout.write('Znacznik /*{{FONTY}}*/ juz podmieniony — nic nie zmieniam.\n');
    process.exit(0);
  }

  const reguly = [];
  for (const [rodzina, waga, format, plikLat, plikExt] of KROJE){
    reguly.push(regula(rodzina, waga, format, plikLat, ZAKRES_LATIN, katalog));
    reguly.push(regula(rodzina, waga, format, plikExt, ZAKRES_LATIN_EXT, katalog));
  }

  txt = txt.replace('/*{{FONTY}}*/', reguly.join('\n'));

  // Symulator jest komponentem opcjonalnym: plan bez wyliczeń zostawia znacznik
  // nietknięty, a to znaczy „tego bloku tu nie ma". Usuwamy go po cichu, żeby
  // w gotowym pliku nie została ani linia martwego kodu, ani fałszywy błąd.
  const bezSymulatora = txt.indexOf('/*{{SKRYPT_SYMULATORA}}*/') !== -1;
  if (bezSymulatora) txt = txt.replace(/[ \t]*\/\*\{\{SKRYPT_SYMULATORA\}\}\*\/[ \t]*\r?\n?/, '');

  fs.writeFileSync(plik, txt);

  const kb = (Buffer.byteLength(txt) / 1024).toFixed(0);
  process.stdout.write('Osadzono ' + reguly.length + ' regul @font-face. Plik ma ' + kb + ' KB.\n');
  if (bezSymulatora){
    process.stdout.write('Plan bez symulatora — znacznik skryptu usuniety.\n');
  }

  const zostale = txt.match(/\{\{[A-Z_0-9]+\}\}/g);
  if (zostale){
    const unikalne = [...new Set(zostale)];
    process.stdout.write('UWAGA: w pliku zostaly niewypelnione znaczniki: ' + unikalne.join(' ') + '\n');
    process.exit(1);
  }
}

main();
