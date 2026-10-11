'use strict';
// Plik wznowienia pracy (LIMIT_CHECKPOINT E3): .claude/relai/wznowienie/<slug-projektu>.md.
// Pisze go model w procedurze "zapisz prace" (relai-core/limit-checkpoint.md, SPEC_WZNOWIENIE.md);
// tutaj zostaje rozpoznanie dla hooka startu: czy plik jest i z kiedy. Plik jest per projekt,
// nie per sesja (L7 planu), wiec zdanie pada na starcie kazdej nowej sesji, dopoki plik istnieje.
//
// Ten sam slug liczy cache-keeper/hooks/limit.ts (resumeSlug) — parytet pilnuje test.

const fs = require('fs');
const path = require('path');

const KATALOG = '.claude/relai/wznowienie';
const SLUG = /^[A-Za-z0-9_-]+$/;

// Nazwa katalogu projektu: male litery, kazdy ciag znakow spoza [a-z0-9_-] na jeden myslnik,
// myslniki z brzegow zdjete. Wynik spoza [A-Za-z0-9_-] albo pusty → null (zadnej sciezki).
function slugProjektu(root) {
  const czesci = String(root || '').replace(/\\/g, '/').split('/').filter(Boolean);
  const nazwa = czesci.length ? czesci[czesci.length - 1] : '';
  if (nazwa === '.' || nazwa === '..') return null;
  const slug = nazwa.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return SLUG.test(slug) ? slug : null;
}

function sciezkaWznowienia(root) {
  const slug = slugProjektu(root);
  return slug ? KATALOG + '/' + slug + '.md' : null;
}

// Data zapisu z linii "Zapisano: RRRR-MM-DD[ HH:MM]"; bez niej — dzien modyfikacji pliku
function dataZapisu(txt, plik) {
  const m = /^Zapisano:\s*(\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?)/m.exec(txt);
  if (m) return m[1];
  let d;
  try {
    d = fs.statSync(plik).mtime;
  } catch (_) {
    return 'data nieznana';
  }
  const dwa = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + dwa(d.getMonth() + 1) + '-' + dwa(d.getDate());
}

function plikWznowienia(root) {
  const rel = sciezkaWznowienia(root);
  if (!rel) return null;
  const plik = path.join(root, rel);
  let txt;
  try {
    txt = fs.readFileSync(plik, 'utf8');
  } catch (_) {
    return null;
  }
  return { rel, data: dataZapisu(txt, plik) };
}

function wznowienieReport(stan) {
  if (!stan) return [];
  return ['Plik wznowienia pracy: ' + stan.rel + ' (zapisany ' + stan.data + '). Na "kontynuujemy prace" ' +
    'przeczytaj go jako pierwsze zrodlo "gdzie jestesmy" i zaproponuj pierwszy krok z jego listy "Co dalej"; ' +
    'nie kasuj go sam.'];
}

module.exports = { KATALOG, slugProjektu, sciezkaWznowienia, plikWznowienia, wznowienieReport };
