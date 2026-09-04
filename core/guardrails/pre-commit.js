#!/usr/bin/env node
'use strict';
// RelAI core / guardrail: git pre-commit ze skanem sekretow.
//
// Po co: hooki harnessu (Claude Code) stoja przy zapisie pliku przez agenta. Poza tym
// harnessem — w Cursorze, w Codeksie, w zwyklym edytorze, w skrypcie CI — tej sciany
// nie ma. Pre-commit mieszka w REPOZYTORIUM, wiec dziala niezaleznie od narzedzia
// i odzyskuje gwarancje D-42 tam, gdzie hookow nie ma (ryzyko P1 planu ROZWOJ_PO_WYDANIU).
//
// Skanujemy TRESC Z INDEKSU (git show :plik), a nie plik z dysku: commitowane jest to,
// co w indeksie, i tylko to ma znaczenie dla tego, co trafi do historii.
//
// Ten plik jest CommonJS i od 1.9.2 instaluje sie jako .git/hooks/relai-pre-commit.cjs,
// wolany przez shim powlokowy .git/hooks/pre-commit. Rozszerzenie .cjs jest tu warunkiem
// dzialania, nie ozdoba: o systemie modulow rozstrzyga najblizszy package.json w gore drzewa,
// a dla .git/hooks/ jest nim package.json PROJEKTU — w projekcie z "type": "module" plik .js
// (albo bezrozszerzeniowy) jest parsowany jako ESM i wywala sie na pierwszym require.
//
// Kod wyjscia: 0 = commit przechodzi, 1 = commit zatrzymany.
// Komunikaty celowo bez polskich znakow diakrytycznych (L-0016) — hook wypisuje je
// do konsoli gita, ktora na Windows bywa w codepage 852/1250.

const path = require('path');
const { spawnSync } = require('child_process');

// Skaner: najpierw kopia obok zainstalowanego hooka (.git/hooks/), potem plik rdzenia
// przy uruchomieniu wprost z repozytorium RelAI. Brak obu = brak gwarancji, wiec mowimy
// o tym glosno i zatrzymujemy commit — cicha degradacja bylaby gorsza niz halas.
// Kolejnosc: kopia .cjs z instalacji 1.9.2+, kopia .js ze starszych instalacji (hook sprzed
// aktualizacji nadal ma dzialac), plik rdzenia przy uruchomieniu wprost z repozytorium RelAI.
function wczytajSkaner() {
  const kandydaci = [
    path.join(__dirname, 'relai-secret-scan.cjs'),
    path.join(__dirname, 'relai-secret-scan.js'),
    path.join(__dirname, 'secret-scan.js'),
  ];
  for (const k of kandydaci) {
    try {
      return require(k);
    } catch (_) { /* nastepny kandydat */ }
  }
  return null;
}

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
}

function main() {
  const skaner = wczytajSkaner();
  if (!skaner || typeof skaner.scanText !== 'function') {
    process.stderr.write(
      'RelAI pre-commit: nie znalazlem skryptu skanu sekretow obok tego hooka.\n' +
      'Commit zatrzymany, bo bez skanu nie ma gwarancji. Zainstaluj hook ponownie:\n' +
      '  node <RelAI>/core/guardrails/install-precommit.js\n' +
      'albo usun go: node <RelAI>/core/guardrails/install-precommit.js --uninstall\n'
    );
    return 1;
  }

  const lista = git(['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z']);
  if (lista.status !== 0) {
    process.stderr.write('RelAI pre-commit: nie moge odczytac indeksu gita. Commit zatrzymany.\n');
    return 1;
  }
  const pliki = String(lista.stdout || '').split('\0').filter(Boolean);
  if (!pliki.length) return 0;

  const znaleziska = [];
  for (const plik of pliki) {
    const r = git(['show', ':' + plik]);
    if (r.status !== 0) continue; // np. plik usuniety w miedzyczasie
    const buf = r.stdout || '';
    if (buf.indexOf('\u0000') !== -1) continue; // binarny — nie skanujemy
    const werdykt = skaner.scanText(buf);
    if (werdykt) znaleziska.push({ plik, werdykt });
  }

  if (!znaleziska.length) return 0;

  const linie = znaleziska.map((z) => '  - ' + z.plik + '  (' + z.werdykt + ')');
  process.stderr.write(
    'RelAI pre-commit: commit ZATRZYMANY — w plikach z indeksu wyglada na to, ze jest sekret:\n' +
    linie.join('\n') + '\n\n' +
    'Wartosci nie zacytowano celowo. Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42);\n' +
    'do repozytorium moze trafic co najwyzej NAZWA zmiennej srodowiskowej.\n' +
    'Gdy to falszywy alarm, opisz go w docs/DECYZJE.md i uzyj "git commit --no-verify"\n' +
    'swiadomie, jako jednorazowego wyjatku.\n'
  );
  return 1;
}

process.exit(main());
