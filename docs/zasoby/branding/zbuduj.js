// Osadza fonty Kalam i Hanken Grotesk w plikach SVG identyfikacji RelAI.
//
// Dlaczego skrypt, a nie „wklej base64": podzbiory krojów to ~145 KB po zakodowaniu.
// Model języka tego nie przepisze — musi to zrobić proces (ta sama zasada co
// w templates/HTML_PLAN/zbuduj.js).
//
// Uruchomienie (Node 14+, zero zależności):
//   node zbuduj.js                      — buduje wszystkie pliki z ./zrodla do ./
//   node zbuduj.js banner.svg           — buduje jeden plik
//
// Skrypt czyta źródło ze `zrodla/<nazwa>`, podmienia znacznik /*{{FONTY}}*/ na reguły
// @font-face z data: URI i zapisuje wynik obok tego skryptu. Powtórne uruchomienie
// nadpisuje wynik z tego samego źródła, więc jest bezpieczne.
//
// Fonty osadzamy, bo GitHub renderuje SVG w README jako <img>: zewnętrzny font się
// nie wczyta, a bez osadzenia identyfikacja wyglądałaby inaczej na każdej maszynie.
// Stos zapasowy w atrybutach font-family zostaje mimo to — na wypadek przeglądarki,
// która blokuje data: URI w fontach.

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
// Kalam wyłącznie w wadze 700: identyfikacja używa odręcznego kroju tylko na nagłówkach,
// a każdy dołożony podzbiór to ~45 KB w każdym pliku SVG.
const KROJE = [
  ['Kalam', '700', 'woff2', 'kalam-700-latin.woff2', 'kalam-700-latin-ext.woff2'],
  ['Hanken Grotesk', '100 900', 'woff2-variations', 'hanken-grotesk-latin.woff2', 'hanken-grotesk-latin-ext.woff2'],
];

const KATALOG_FONTOW = path.resolve(__dirname, '..', 'fonts');

function regula(rodzina, waga, format, plik, zakres) {
  const dane = fs.readFileSync(path.join(KATALOG_FONTOW, plik)).toString('base64');
  return "@font-face{font-family:'" + rodzina + "';font-style:normal;font-weight:" + waga + ";" +
    "font-display:block;src:url(data:font/woff2;base64," + dane + ") format('" + format + "');" +
    "unicode-range:" + zakres + ";}";
}

function blokFontow() {
  const reguly = [];
  for (const [rodzina, waga, format, latin, latinExt] of KROJE) {
    reguly.push(regula(rodzina, waga, format, latin, ZAKRES_LATIN));
    reguly.push(regula(rodzina, waga, format, latinExt, ZAKRES_LATIN_EXT));
  }
  return reguly.join('');
}

function main() {
  const zrodla = path.join(__dirname, 'zrodla');
  if (!fs.existsSync(zrodla)) {
    process.stderr.write('Brak katalogu zrodla/ obok skryptu.\n');
    process.exit(2);
  }
  if (!fs.existsSync(KATALOG_FONTOW)) {
    process.stderr.write('Brak katalogu z fontami: ' + KATALOG_FONTOW + '\n');
    process.exit(2);
  }

  const wybrany = process.argv[2];
  const pliki = wybrany ? [wybrany] : fs.readdirSync(zrodla).filter((n) => n.endsWith('.svg'));
  if (!pliki.length) {
    process.stderr.write('Brak plikow .svg w zrodla/.\n');
    process.exit(2);
  }

  const fonty = blokFontow();
  for (const nazwa of pliki) {
    const wejscie = path.join(zrodla, nazwa);
    if (!fs.existsSync(wejscie)) {
      process.stderr.write('Nie ma takiego zrodla: ' + wejscie + '\n');
      process.exit(2);
    }
    const txt = fs.readFileSync(wejscie, 'utf8');
    const wyjscie = path.join(__dirname, nazwa);
    if (txt.indexOf('/*{{FONTY}}*/') === -1) {
      fs.writeFileSync(wyjscie, txt);
      process.stdout.write(nazwa + ' — bez znacznika fontow, skopiowane bez zmian\n');
      continue;
    }
    fs.writeFileSync(wyjscie, txt.replace('/*{{FONTY}}*/', fonty));
    const kb = Math.round(fs.statSync(wyjscie).size / 1024);
    process.stdout.write(nazwa + ' — zbudowane, ' + kb + ' KB\n');
  }
}

main();
