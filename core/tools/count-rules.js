#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: liczba pozycji sekcji "Zasady aktywne" w docs/LEKCJE.md (AUDYT_SKILLI S4).
//
// Po co: limit 15 pozycji (SPEC_LEKCJE.md) ma jeden adres egzekwowania — krok 1 rytualu
// zamkniecia sesji — i ma byc policzony komenda, nie okiem. Do 2.9.0 komenda byla jednolinijkowcem
// `node -e` z wyrazeniem regularnym w tresci skilla; tu jest plikiem (L-0116: regex w pliku).
//
//   node .claude/relai/tools/count-rules.js [docs/LEKCJE.md] [--limit 15]
//
// Wypisuje jedna linie: "zasady aktywne: N / limit L" i — tylko ponad limitem — "PONAD LIMITEM".
// Kod wyjscia: 0 = policzone (takze ponad limitem — to informacja, nie awaria), 2 = brak pliku
// albo sekcji. Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');

const LIMIT = 15;

function policz(tekst) {
  const sekcje = String(tekst).replace(/\r\n/g, '\n').split(/^## /m);
  const sekcja = sekcje.find((s) => /^(Zasady aktywne|Active rules)\b/.test(s));
  if (sekcja === undefined) return null;
  return (sekcja.match(/^\d+\.\s/gm) || []).length;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--limit');
  const limit = i >= 0 ? Number(argv[i + 1]) : LIMIT;
  const plik = argv.find((a, k) => !a.startsWith('--') && (i < 0 || k !== i + 1)) || 'docs/LEKCJE.md';
  let tekst;
  try { tekst = fs.readFileSync(plik, 'utf8'); } catch (e) {
    process.stdout.write('RelAI count-rules: brak pliku ' + plik + '\n');
    process.exit(2);
  }
  const n = policz(tekst);
  if (n === null) {
    process.stdout.write('RelAI count-rules: ' + plik + ' nie ma sekcji "## Zasady aktywne"\n');
    process.exit(2);
  }
  process.stdout.write('zasady aktywne: ' + n + ' / limit ' + limit + (n > limit ? ' — PONAD LIMITEM' : '') + '\n');
  process.exit(0);
}

module.exports = { policz, LIMIT };
