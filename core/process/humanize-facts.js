#!/usr/bin/env node
'use strict';
// RelAI rdzen: humanize-facts — straznik faktow humanizacji (E1 planu HUMANIZACJA, ryzyko H1).
//
// Porownuje oryginal z wersja po humanizacji i mowi, co by zginelo albo doszlo: bloki kodu,
// fragmenty w backtickach, adresy URL i cele linkow, sciezki, daty, liczby. Rozstrzygniecie b10:
// roznica w ktorymkolwiek zbiorze = wersja poprawiona przegrywa, wygrywa oryginal.
//
// Straznik ma byc OSTROZNY, nie sprytny: "3" i "trzy" to roznica, "1 300" i "1300" tez. Lepiej
// pokazac czlowiekowi falszywy alarm niz przepuscic zgubiona liczbe.
//
// Samowystarczalny (bez require na inne pliki rdzenia): kopia trafia do .claude/relai/tools/
// projektu ta sama droga co clean-work.js, bo sesja nie widzi katalogu pluginu (L-0012).
//
// CLI:  node humanize-facts.js <oryginal> <wersja>   — dwa pliki; jeden z nich moze byc "-" (stdin)
//       node humanize-facts.js --stdin               — stdin: oryginal, linia SEPARATOR, wersja
//       -> JSON { zgubione: [...], dopisane: [...] } na stdout
//       kod wyjscia 0 = bez roznic, 1 = roznica, 2 = blad wywolania albo odczytu
//
// Stdin istnieje dlatego, ze komenda nie moze pisac plikow tymczasowych: zapis do .claude/
// harness traktuje jako wrazliwy (zmierzone 2026-10-14 w sesji `claude -p` — zapis odrzucony),
// a w sesji interaktywnej kazdy taki zapis pytalby o zgode. Tekst idzie heredokiem w cudzyslowie,
// wiec powloka nie interpretuje w nim ani `$`, ani backslasha.

const fs = require('fs');

const MIESIACE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września',
  'wrzesnia', 'października', 'pazdziernika', 'listopada', 'grudnia',
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień',
  'październik', 'listopad', 'grudzień',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december',
].join('|');

const ROZSZERZENIA = 'md|mdx|js|mjs|cjs|ts|tsx|jsx|json|jsonl|html|htm|css|svg|png|jpg|jpeg|gif|webp|mp4|mp3|wav|pdf|zip|txt|ini|cfg|conf|toml|yml|yaml|xml|csv|ps1|sh|bat|cmd|py|go|rs|java|kt|swift|rb|php|sql|lock|log|env|woff2';

// Kolejnosc ma znaczenie: kazdy rodzaj wycina swoje trafienia z tekstu, zanim przyjdzie nastepny.
// Inaczej data "2026-10-14" dalaby trzy liczby, a URL — sciezke.
const RODZAJE = [
  // Blok kodu takze wciety (w liscie); wartoscia jest znacznik jezyka i tresc bez obcinania wciec —
  // zmiana wciecia w kodzie tez jest zmiana kodu.
  { rodzaj: 'kod', wzorzec: /^[ \t]*(`{3,}|~{3,})([^\n]*)\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm, wartosc: (m) => (m[2].trim() + '\n' + m[3]).replace(/\s+$/, '') },
  { rodzaj: 'backtick', wzorzec: /`([^`\n]+)`/g, wartosc: (m) => m[1] },
  // URL z nawiasami w srodku (Foo_(bar)); niesparowany nawias zamykajacy na koncu nalezy do tekstu.
  { rodzaj: 'url', wzorzec: /\b(?:https?|ftp|file):\/\/[^\s<>"'„”»«\]]+/gi, wartosc: (m) => przytnijUrl(m[0]) },
  { rodzaj: 'link', wzorzec: /\]\(([^)\s]+)\)/g, wartosc: (m) => m[1] },
  {
    rodzaj: 'sciezka',
    // Sciezka: z poczatkiem (C:\, ./, ../, ~/, /), z co najmniej dwoma separatorami, katalog
    // z ukosnikiem na koncu albo ostatni czlon z rozszerzeniem z zamknietej listy.
    // "i/lub" i "3/5" nie sa sciezkami.
    wzorzec: new RegExp(
      '(?<![\\p{L}\\p{N}_])(?:' +
        '(?:[A-Za-z]:[\\\\/]|\\.{1,2}[\\\\/]|~[\\\\/]|[\\\\/](?=[\\p{L}\\p{N}_.]))[\\p{L}\\p{N}_.\\-\\\\/]*' +
        '|[\\p{L}\\p{N}_.\\-]+(?:[\\\\/][\\p{L}\\p{N}_.\\-]+){2,}[\\\\/]?' +
        '|[\\p{L}\\p{N}_.\\-]+(?:[\\\\/][\\p{L}\\p{N}_.\\-]+)*[\\\\/](?![\\p{L}\\p{N}_])' +
        '|(?:[\\p{L}\\p{N}_.\\-]+[\\\\/])*[\\p{L}\\p{N}_\\-]+\\.(?:' + ROZSZERZENIA + ')' +
      ')(?![\\p{L}\\p{N}_])',
      'giu'),
    wartosc: (m) => m[0].replace(/[.,;:]+$/, ''),
  },
  {
    rodzaj: 'data',
    wzorzec: new RegExp(
      '\\b\\d{4}-\\d{2}-\\d{2}\\b' +
      '|\\b\\d{1,2}\\.\\d{1,2}\\.\\d{4}\\b' +
      '|\\b\\d{1,2}\\s+(?:' + MIESIACE + ')(?:\\s+\\d{4})?(?![\\p{L}])',
      'giu'),
    wartosc: (m) => m[0].replace(/\s+/g, ' ').toLowerCase(),
  },
  {
    rodzaj: 'liczba',
    // Cale slowo z cyfra: identyfikator z przedrostkiem (E1, D-85, L-0012, v3, Python3, §8), skrot
    // commitu (9b1b899), liczba z przecinkiem albo kropka dziesietna, spacja tysiecy (1 300)
    // i procentem. Identyfikator to tez fakt: zgubione "D-85" jest tak samo zgubione jak "85".
    wzorzec: /(?<![\p{L}\p{N}_])(?:§\s?|[\p{L}_]+-?)?\d[\p{L}\p{N}_]*(?:[  ]\d{3}(?![\p{L}\p{N}_]))*(?:[.,:]\d[\p{L}\p{N}_]*)*(?:\s?%)?(?![\p{L}\p{N}_])/gu,
    wartosc: (m) => m[0].replace(/[  ]/g, ' '),
  },
];

/** Konczaca interpunkcja i niesparowane nawiasy zamykajace odcinane z konca adresu. */
function przytnijUrl(url) {
  let u = url.replace(/[.,;:!?]+$/, '');
  const ile = (z) => u.split(z).length - 1;
  while (u.endsWith(')') && ile(')') > ile('(')) u = u.slice(0, -1).replace(/[.,;:!?]+$/, '');
  return u;
}

/**
 * Fakty jednego tekstu: mapa rodzaj -> zbior wartosci.
 * @param {string} tekst
 * @returns {Map<string, Set<string>>}
 */
function extractFacts(tekst) {
  let reszta = String(tekst == null ? '' : tekst).replace(/\r\n?/g, '\n');
  const fakty = new Map();
  for (const { rodzaj, wzorzec, wartosc } of RODZAJE) {
    const zbior = new Set();
    wzorzec.lastIndex = 0;
    reszta = reszta.replace(wzorzec, (...args) => {
      // args: dopasowanie, grupy..., offset, caly tekst[, grupy nazwane]
      const grupy = args.slice(0, args.findIndex((a) => typeof a === 'number'));
      const v = wartosc(grupy);
      if (v) zbior.add(v);
      // Wyciete miejsce zastepuje spacja — sasiednie slowa nie sklejaja sie w nowy fakt.
      return ' ';
    });
    fakty.set(rodzaj, zbior);
  }
  return fakty;
}

/**
 * Porownanie oryginalu z wersja. Kolejnosc wpisow: wedlug rodzaju, potem wedlug pojawienia sie.
 * @param {string} oryginal
 * @param {string} wersja
 * @returns {{ zgubione: {rodzaj: string, wartosc: string}[], dopisane: {rodzaj: string, wartosc: string}[] }}
 */
function compareFacts(oryginal, wersja) {
  const a = extractFacts(oryginal);
  const b = extractFacts(wersja);
  const zgubione = [];
  const dopisane = [];
  for (const { rodzaj } of RODZAJE) {
    for (const v of a.get(rodzaj)) if (!b.get(rodzaj).has(v)) zgubione.push({ rodzaj, wartosc: v });
    for (const v of b.get(rodzaj)) if (!a.get(rodzaj).has(v)) dopisane.push({ rodzaj, wartosc: v });
  }
  return { zgubione, dopisane };
}

// Linia rozdzielajaca oryginal i wersje w trybie --stdin; porownanie po przycieciu spacji i \r.
const SEPARATOR = '=====RELAI-HUMANIZE-WERSJA=====';

/**
 * Dwa teksty z argumentow. `stdin` to funkcja czytajaca standardowe wejscie (wstrzykiwana w testach).
 * @returns {{ teksty?: string[], blad?: string }}
 */
function readInputs(argv, stdin) {
  const bezBom = (t) => t.replace(/^\uFEFF/, '');
  if (argv.length === 1 && argv[0] === '--stdin') {
    let wejscie;
    try {
      wejscie = stdin();
    } catch (e) {
      // Blad odczytu to kod 2, nie 1: inaczej wygladalby jak roznica faktow.
      return { blad: 'nie moge odczytac stdin: ' + e.message };
    }
    const linie = bezBom(wejscie).replace(/\r\n?/g, '\n').split('\n');
    const i = linie.findIndex((l) => l.trim() === SEPARATOR);
    if (i < 0) return { blad: 'brak linii ' + SEPARATOR + ' na stdin' };
    if (linie.findIndex((l, j) => j > i && l.trim() === SEPARATOR) > 0) return { blad: 'linia ' + SEPARATOR + ' wiecej niz raz' };
    return { teksty: [linie.slice(0, i).join('\n'), linie.slice(i + 1).join('\n')] };
  }
  if (argv.length !== 2 || (argv[0] === '-' && argv[1] === '-')) {
    return { blad: 'uzycie: node humanize-facts.js <oryginal> <wersja> (jeden moze byc "-") albo --stdin' };
  }
  try {
    return { teksty: argv.map((p) => bezBom(p === '-' ? stdin() : fs.readFileSync(p, 'utf8'))) };
  } catch (e) {
    return { blad: 'nie moge odczytac pliku: ' + e.message };
  }
}

function main(argv, stdin = () => fs.readFileSync(0, 'utf8')) {
  const { teksty, blad } = readInputs(argv, stdin);
  if (blad) {
    process.stderr.write(blad + '\n');
    return 2;
  }
  const wynik = compareFacts(teksty[0], teksty[1]);
  process.stdout.write(JSON.stringify(wynik, null, 2) + '\n');
  return wynik.zgubione.length || wynik.dopisane.length ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { extractFacts, compareFacts, readInputs, main, SEPARATOR };
