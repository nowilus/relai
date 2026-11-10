#!/usr/bin/env node
'use strict';
// RelAI core / guardrail: instalator gitowego pre-commita ze skanem sekretow.
//
// Instalacja jest JAWNA CZYNNOSCIA CZLOWIEKA — RelAI nie podklada hookow gita samo,
// bo .git/hooks/ jest przestrzenia uzytkownika, nie narzedzia. Cofniecie to jedno
// polecenie z flaga --uninstall.
//
//   node core/guardrails/install-precommit.js [<katalog-repo>]
//   node core/guardrails/install-precommit.js [<katalog-repo>] --uninstall
//
// Bez argumentu katalogu bierzemy biezacy katalog roboczy.
//
// Do katalogu hookow gita (wspolnego dla worktree) trafiaja TRZY pliki:
//   pre-commit             — shim powlokowy, jedyne, co wola git,
//   relai-pre-commit.cjs   — logika hooka (kopia core/guardrails/pre-commit.js),
//   relai-secret-scan.cjs  — kopia skanera (core/guardrails/secret-scan.js).
//
// Rozszerzenie .cjs i shim to od 1.9.2 warunek dzialania, nie estetyka: o systemie modulow
// rozstrzyga najblizszy package.json w gore drzewa, a dla .git/hooks/ jest nim package.json
// PROJEKTU. Do 1.9.1 logika ladowala sie jako bezrozszerzeniowy pre-commit i plik .js, wiec
// w projekcie z "type": "module" Node parsowal ja jako ESM i przewracal sie na pierwszym
// require — hook fails-closed, czyli projekt tracil mozliwosc commitowania czegokolwiek.
//
// Kopia zamiast odwolania do katalogu pluginu jest swiadoma: hook ma dzialac takze wtedy, gdy
// plugin zostanie zaktualizowany, przeniesiony albo odinstalowany. Cena: po zmianie regul skanu
// instalacje trzeba powtorzyc — instalator mowi o tym przy nadpisaniu.
//
// Instalacja konczy sie TESTEM DYMNYM zainstalowanego hooka. Kopiowanie plikow nie jest
// dowodem, ze hook dziala; dowodem jest "git hook run pre-commit" — kod 0 przy pustym indeksie
// i kod 1 przy probce z sekretem. Test, ktory nie przeszedl, cofa instalacje do stanu sprzed
// niej i konczy sie bledem.
//
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const NAGLOWEK_RELAI = 'RelAI core / guardrail: git pre-commit ze skanem sekretow.';

// Shim zapisujemy z koncami linii LF nawet na Windows: sh nie strawi CRLF w linii shebang.
const SHIM = [
  '#!/bin/sh',
  '# ' + NAGLOWEK_RELAI,
  '# Ten plik jest wylacznie przelacznikiem — cala logika stoi w relai-pre-commit.cjs.',
  '# Rozszerzenie .cjs wygrywa z kazda wartoscia "type" w package.json projektu.',
  'exec node "$(dirname "$0")/relai-pre-commit.cjs" "$@"',
  '',
].join('\n');

function revParse(repo, args) {
  const r = spawnSync('git', ['rev-parse'].concat(args), { cwd: repo, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) return null;
  const wynik = String(r.stdout || '').trim();
  return wynik ? path.resolve(repo, wynik) : null;
}

// Dwa katalogi: ten, z ktorego git NAPRAWDE wola hooki (--git-path hooks: uwzglednia
// core.hooksPath i worktree), i domyslny <wspolny katalog gita>/hooks, w ktorym RelAI instaluje.
// Rozne = hooki obsluguje inne narzedzie (husky, lefthook, wlasny katalog) — instalacja do
// domyslnego katalogu bylaby martwa, a do cudzego nadpisywalaby jego pliki.
function katalogiHookow(repo) {
  const wspolny = revParse(repo, ['--git-common-dir']);
  const wolane = revParse(repo, ['--git-path', 'hooks']);
  if (!wspolny || !wolane) return null;
  return { domyslny: path.join(wspolny, 'hooks'), wolane };
}

// path.relative na win32 porownuje bez wielkosci liter — tak samo jak system plikow.
function tenSamKatalog(a, b) {
  return path.relative(a, b) === '';
}

function wymagaNode() {
  // Instalator sam dziala na Node, wiec Node jest. Sprawdzamy natomiast, czy `node`
  // jest w PATH — hook gita wola go po nazwie, nie po sciezce procesu instalatora.
  const r = spawnSync('node', ['--version'], { encoding: 'utf8', windowsHide: true });
  return r.status === 0;
}

function czytaj(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

// Stan sprzed instalacji dla kazdego pliku, ktory zamierzamy ruszyc: tresc albo null.
// Po nieudanym tescie dymnym wracamy dokladnie do tego stanu — takze wtedy, gdy instalacja
// byla aktualizacja dzialajacego hooka.
function zdejmijStan(sciezki) {
  const stan = new Map();
  for (const s of sciezki) stan.set(s, czytaj(s));
  return stan;
}

function przywrocStan(stan) {
  for (const [s, tresc] of stan) {
    try {
      if (tresc === null) fs.unlinkSync(s);
      else fs.writeFileSync(s, tresc);
    } catch (_) { /* nie ma czego przywracac */ }
  }
}

// Probka sekretu do testu dymnego, skladana w czasie dzialania: literal przypisania w tym pliku
// zatrzymalby jego zapis (hook secret-scanner) i jego commit (ten sam pre-commit).
function probkaSekretu() {
  return ['PASS', 'WORD'].join('') + '=' + ['rel', 'Ai7', 'Smk', '9Qv'].join('') + '\n';
}

function blad(nazwa, r, oczekiwany) {
  if (r.error) return { ok: false, opis: nazwa + ' — nie udalo sie uruchomic: ' + r.error.message };
  if (r.status === oczekiwany) return null;
  const stderr = String(r.stderr || '').trim();
  return { ok: false, opis: nazwa + ' — kod wyjscia ' + r.status + ' (oczekiwany ' + oczekiwany + ')' + (stderr ? '\n' + stderr : '') };
}

// Test dymny przez gita: "git hook run pre-commit" wola hook ta sama droga co "git commit"
// (ten sam katalog hookow, ta sama powloka), ale nie tworzy commita. Dwa przebiegi na wlasnym
// GIT_INDEX_FILE — prawdziwy indeks uzytkownika zostaje nietkniety:
//   1) pusty indeks -> kod 0 (hook nie blokuje czystego commita),
//   2) indeks z jednym plikiem-probka z sekretem -> kod 1 (hook naprawde skanuje).
// Probka trafia do bazy obiektow jako nieosiagalny blob; "git gc" usuwa go sam.
// Cudzy hook (zeShimem = false): git zawolalby cudzy plik, wiec sprawdzamy sama logike.
function testDymny(repo, celLogika, zeShimem) {
  const idx = path.join(os.tmpdir(), 'relai-precommit-smoke-' + process.pid + '-' + Date.now() + '.index');
  const env = Object.assign({}, process.env, { GIT_INDEX_FILE: idx });
  const opcje = { cwd: repo, env, encoding: 'utf8', windowsHide: true };
  try {
    if (!zeShimem) {
      return blad('logika hooka (node relai-pre-commit.cjs)', spawnSync('node', [celLogika], opcje), 0) || { ok: true };
    }
    const pusty = blad('git hook run pre-commit, pusty indeks', spawnSync('git', ['hook', 'run', 'pre-commit'], opcje), 0);
    if (pusty) return pusty;
    const blob = spawnSync('git', ['hash-object', '-w', '--stdin'], Object.assign({}, opcje, { input: probkaSekretu() }));
    const sha = String(blob.stdout || '').trim();
    if (blob.status !== 0 || !sha) return { ok: false, opis: 'git hash-object — nie udalo sie zapisac probki' };
    const dodaj = spawnSync('git', ['update-index', '--add', '--cacheinfo', '100644,' + sha + ',relai-smoke-probe.txt'], opcje);
    if (dodaj.status !== 0) return { ok: false, opis: 'git update-index — nie udalo sie dodac probki do indeksu testowego' };
    return blad('git hook run pre-commit, probka z sekretem', spawnSync('git', ['hook', 'run', 'pre-commit'], opcje), 1) || { ok: true };
  } finally {
    try { fs.unlinkSync(idx); } catch (_) { /* pusty przebieg go nie tworzy */ }
  }
}

function main() {
  const args = process.argv.slice(2);
  const odinstaluj = args.includes('--uninstall');
  const repo = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());

  const katalogi = katalogiHookow(repo);
  if (!katalogi) {
    process.stderr.write('RelAI: "' + repo + '" nie jest repozytorium gita. Nie ma gdzie zainstalowac pre-commita.\n');
    return 2;
  }

  const hooksDir = katalogi.domyslny;
  const celHook = path.join(hooksDir, 'pre-commit');
  const celLogika = path.join(hooksDir, 'relai-pre-commit.cjs');
  const celSkaner = path.join(hooksDir, 'relai-secret-scan.cjs');
  // Instalacje sprzed 1.9.2 kladly skaner pod nazwa .js. Zostawiony obok nowego zdazylby sie
  // rozjechac z rdzeniem po kolejnej aktualizacji, wiec schodzi razem z reszta.
  const celSkanerStary = path.join(hooksDir, 'relai-secret-scan.js');

  if (odinstaluj) {
    let usunieto = 0;
    let obcy = false;
    const tresc = czytaj(celHook);
    if (tresc !== null) {
      if (tresc.indexOf(NAGLOWEK_RELAI) === -1) {
        obcy = true;
        // Cudzy hook moze wolac nasze kopie. Odmowa musi nastapic PRZED usunieciem
        // ktoregokolwiek pliku; integracje usuwa wlasciciel hooka, nie instalator.
        const references = tresc.split(/\r?\n/).map((line, index) => (
          /relai-(?:pre-commit\.cjs|secret-scan\.(?:cjs|js))/i.test(line)
            ? '  linia ' + (index + 1) + ': ' + line
            : null
        )).filter(Boolean);
        if (references.length) {
          process.stderr.write(
            'RelAI: deinstalacja przerwana — cudzy hook nadal odwoluje sie do RelAI.\n' +
            'Nie usunieto zadnych plikow. Usun recznie ponizsze linie z "' + celHook + '":\n' +
            references.join('\n') + '\n' +
            'Nastepnie powtorz polecenie z --uninstall.\n'
          );
          return 1;
        }
      } else {
        try { fs.unlinkSync(celHook); usunieto++; } catch (_) { /* jw. */ }
      }
    }
    for (const s of [celLogika, celSkaner, celSkanerStary]) {
      try { fs.unlinkSync(s); usunieto++; } catch (_) { /* nie ma czego usuwac */ }
    }

    if (obcy) {
      process.stderr.write('RelAI: "' + celHook + '" nie pochodzi z RelAI — zostawiam go nietknietego.\n');
      return 1;
    }
    process.stdout.write(usunieto
      ? 'RelAI: pre-commit odinstalowany (' + usunieto + ' plikow usunietych z ' + hooksDir + ').\n'
      : 'RelAI: nie bylo czego odinstalowywac w ' + hooksDir + '.\n');
    return 0;
  }

  if (!wymagaNode()) {
    process.stderr.write(
      'RelAI: w PATH nie ma polecenia "node". Pre-commit ze skanem sekretow wymaga Node.js —\n' +
      'bez niego ten guardrail nie zadziala. Warstwa dokumentowo-procesowa RelAI dziala dalej\n' +
      'w calosci; sam skan sekretow przy commicie nie. Zainstaluj Node.js i powtorz to polecenie.\n'
    );
    return 2;
  }

  // core.hooksPath wskazuje inny katalog: git nigdy nie zawolalby hooka z hooksDir. Odmowa
  // przed zapisem czegokolwiek, z linia do wklejenia w hook narzedzia, ktore tym katalogiem rzadzi.
  if (!tenSamKatalog(katalogi.wolane, hooksDir)) {
    process.stderr.write(
      'RelAI: git wola hooki z "' + katalogi.wolane + '" (core.hooksPath), nie z "' + hooksDir + '".\n' +
      'Nie instaluje niczego: tym katalogiem zarzadza inne narzedzie (np. husky) i plik w ' + hooksDir + '\n' +
      'bylby martwy. Dopisz do hooka pre-commit w "' + katalogi.wolane + '" jedna linie:\n' +
      '  node "' + path.join(__dirname, 'pre-commit.js').split(path.sep).join('/') + '" || exit 1\n' +
      'albo usun core.hooksPath (git config --unset core.hooksPath) i powtorz instalacje.\n'
    );
    return 1;
  }

  const istniejacy = czytaj(celHook);
  const cudzyHook = istniejacy !== null && istniejacy.indexOf(NAGLOWEK_RELAI) === -1;
  const stan = zdejmijStan(cudzyHook
    ? [celLogika, celSkaner]
    : [celHook, celLogika, celSkaner, celSkanerStary]);

  try {
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.copyFileSync(path.join(__dirname, 'pre-commit.js'), celLogika);
    fs.copyFileSync(path.join(__dirname, 'secret-scan.js'), celSkaner);
    if (!cudzyHook) {
      fs.writeFileSync(celHook, SHIM);
      try { fs.chmodSync(celHook, 0o755); } catch (_) { /* Windows: bez znaczenia */ }
      try { fs.unlinkSync(celSkanerStary); } catch (_) { /* nie bylo starej kopii */ }
    }
  } catch (e) {
    przywrocStan(stan);
    process.stderr.write('RelAI: instalacja nie powiodla sie (' + e.message + '). Stan sprzed instalacji przywrocony.\n');
    return 2;
  }

  const test = testDymny(repo, celLogika, !cudzyHook);
  if (!test.ok) {
    przywrocStan(stan);
    process.stderr.write(
      'RelAI: instalacja COFNIETA — zainstalowany hook nie przeszedl testu dymnego.\n' +
      'Przy pustym indeksie ma konczyc sie kodem 0, a przy probce z sekretem kodem 1. Wynik:\n' +
      '  ' + test.opis.split('\n').join('\n  ') + '\n' +
      'W ' + hooksDir + ' jest znowu to, co przed instalacja. Zglos to razem z powyzszym\n' +
      'komunikatem — bez dzialajacego hooka commit z sekretem nie jest zatrzymywany.\n'
    );
    return 2;
  }

  if (cudzyHook) {
    // Pliki .cjs sa juz na miejscu i sa bezczynne, dopoki nikt ich nie zawola — dzieki temu
    // instrukcja ponizej jest prawdziwa od razu, bez drugiego uruchomienia instalatora.
    process.stderr.write(
      'RelAI: w "' + celHook + '" jest juz cudzy hook pre-commit. Nie nadpisuje go.\n' +
      'Logika RelAI jest natomiast obok (relai-pre-commit.cjs, relai-secret-scan.cjs) i przeszla\n' +
      'test dymny. Dopisz do swojego hooka jedna linie:\n' +
      '  node "$(dirname "$0")/relai-pre-commit.cjs" || exit 1\n' +
      'albo przenies swoj hook i powtorz instalacje.\n'
    );
    return 1;
  }

  process.stdout.write(
    (istniejacy !== null ? 'RelAI: pre-commit ZAKTUALIZOWANY w ' : 'RelAI: pre-commit zainstalowany w ') + hooksDir + '.\n' +
    'Test dymny zdany przez "git hook run pre-commit": pusty indeks -> kod 0, probka z sekretem -> kod 1.\n' +
    'Od teraz "git commit" z sekretem w plikach z indeksu konczy sie bledem i bez commita.\n' +
    'Cofniecie: node "' + path.join(__dirname, 'install-precommit.js') + '" "' + repo + '" --uninstall\n' +
    'Po zmianie regul skanu w rdzeniu powtorz instalacje — hook uzywa wlasnej kopii skanera.\n'
  );
  return 0;
}

process.exit(main());
