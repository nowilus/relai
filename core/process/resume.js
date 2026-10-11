'use strict';
// Plik wznowienia pracy (LIMIT_CHECKPOINT E3): .claude/relai/wznowienie/<slug-projektu>.md.
// Pisze go model w procedurze "zapisz prace" (relai-core/limit-checkpoint.md, SPEC_WZNOWIENIE.md);
// tutaj zostaje rozpoznanie dla hooka startu: czy plik jest i z kiedy. Plik jest per projekt,
// nie per sesja (L7 planu), wiec zdanie pada na starcie kazdej nowej sesji, dopoki plik istnieje.
//
// Ten sam slug liczy cache-keeper/hooks/limit.ts (resumeSlug) — parytet pilnuje test.

const childProcess = require('child_process');
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

// Hash HEAD z linii "Zapisano: … · HEAD: <hash>" (SPEC_WZNOWIENIE.md). Tylko male litery
// szesnastkowe, 4–40 znakow: wartosc idzie do argumentu gita, wiec nic innego nie przechodzi.
const HASH = /^[0-9a-f]{4,40}$/;

function hashZapisu(txt) {
  const m = /^Zapisano:.*·\s*HEAD:\s*(\S+)/m.exec(txt);
  const h = m ? m[1].replace(/[`*]/g, '') : '';
  return HASH.test(h) ? h : null;
}

// Ile commitow doszlo od hasha z pliku (L5 planu), tablica argumentow, bez powloki:
// `git rev-parse --verify --quiet <hash>^{commit}` rozroznia hash nieznany w repozytorium (kod 1
// → 'nieznany') od braku gita, repozytorium albo przekroczonego czasu (→ null, zdanie bez liczby);
// dopiero znany hash idzie do `git rev-list --count <hash>..HEAD`.
const GIT_TIMEOUT_MS = 2000;
const gitOpts = (root) => ({ cwd: root, encoding: 'utf8', timeout: GIT_TIMEOUT_MS, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
function commitowOdZapisu(root, hash) {
  if (!HASH.test(String(hash || ''))) return null;
  try {
    childProcess.execFileSync('git', ['rev-parse', '--verify', '--quiet', hash + '^{commit}'], gitOpts(root));
  } catch (e) {
    return e && e.status === 1 ? 'nieznany' : null;
  }
  try {
    const n = Number(String(childProcess.execFileSync('git', ['rev-list', '--count', hash + '..HEAD'], gitOpts(root))).trim());
    return Number.isInteger(n) && n >= 0 ? n : null;
  } catch (_) {
    return null;
  }
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
  const head = hashZapisu(txt);
  return { rel, data: dataZapisu(txt, plik), head, commitow: head ? commitowOdZapisu(root, head) : null };
}

// "doszedl 1 commit", "doszly 3 commity", "doszlo 5 commitow" (ASCII: komunikaty hookow)
const polskaLiczba = (n) => {
  const d = n % 100;
  if (n === 1) return 'doszedl 1 commit';
  return n % 10 >= 2 && n % 10 <= 4 && (d < 12 || d > 14) ? 'doszly ' + n + ' commity' : 'doszlo ' + n + ' commitow';
};

// Zdanie o commitach od zapisu: 0, N albo hash nieznany; bez hasha w pliku albo bez mozliwosci
// sprawdzenia (brak gita, czas) — nic, zeby nie twierdzic czegos, czego nie sprawdzono.
function zdanieCommitow(stan) {
  if (!stan.head || stan.commitow === null || stan.commitow === undefined) return '';
  if (stan.commitow === 'nieznany') {
    return ' Hash HEAD zapisu ' + stan.head + ' jest nieznany w tym repozytorium: lista "Co dalej" moze byc nieaktualna - powiedz to, zanim zaproponujesz krok.';
  }
  if (stan.commitow === 0) return ' Od zapisu nie doszedl zaden commit (HEAD zapisu ' + stan.head + ').';
  return ' Od zapisu ' + polskaLiczba(stan.commitow) + ' (HEAD zapisu ' + stan.head + '): lista "Co dalej" moze byc nieaktualna - powiedz to, zanim zaproponujesz krok.';
}

function wznowienieReport(stan) {
  if (!stan) return [];
  return ['Plik wznowienia pracy: ' + stan.rel + ' (zapisany ' + stan.data + ').' + zdanieCommitow(stan) +
    ' Na "kontynuujemy prace" przeczytaj go jako pierwsze zrodlo "gdzie jestesmy" i zaproponuj pierwszy krok ' +
    'z jego listy "Co dalej"; kasujesz go tylko z linia zgody z karty "Wznow prace" albo na prosbe czlowieka.'];
}

module.exports = { KATALOG, slugProjektu, sciezkaWznowienia, hashZapisu, commitowOdZapisu, plikWznowienia, wznowienieReport };
