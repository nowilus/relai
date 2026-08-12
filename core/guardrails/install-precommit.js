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
// Do .git/hooks/ trafiaja DWA pliki: sam hook (pre-commit) i kopia skanera
// (relai-secret-scan.js). Kopia zamiast odwolania do katalogu pluginu jest swiadoma:
// hook ma dzialac takze wtedy, gdy plugin zostanie zaktualizowany, przeniesiony albo
// odinstalowany. Cena: po zmianie regul skanu instalacje trzeba powtorzyc — instalator
// mowi o tym przy nadpisaniu.
//
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const NAGLOWEK_RELAI = 'RelAI core / guardrail: git pre-commit ze skanem sekretow.';

function katalogGita(repo) {
  const r = spawnSync('git', ['rev-parse', '--git-dir'], {
    cwd: repo, encoding: 'utf8', windowsHide: true,
  });
  if (r.status !== 0) return null;
  const g = String(r.stdout || '').trim();
  if (!g) return null;
  return path.resolve(repo, g);
}

function wymagaNode() {
  // Instalator sam dziala na Node, wiec Node jest. Sprawdzamy natomiast, czy `node`
  // jest w PATH — hook gita wola go po nazwie, nie po sciezce procesu instalatora.
  const r = spawnSync('node', ['--version'], { encoding: 'utf8', windowsHide: true });
  return r.status === 0;
}

function main() {
  const args = process.argv.slice(2);
  const odinstaluj = args.includes('--uninstall');
  const repo = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());

  const gitDir = katalogGita(repo);
  if (!gitDir) {
    process.stderr.write('RelAI: "' + repo + '" nie jest repozytorium gita. Nie ma gdzie zainstalowac pre-commita.\n');
    return 2;
  }

  const hooksDir = path.join(gitDir, 'hooks');
  const celHook = path.join(hooksDir, 'pre-commit');
  const celSkaner = path.join(hooksDir, 'relai-secret-scan.js');

  if (odinstaluj) {
    let usunieto = 0;
    let obcy = false;
    try {
      const tresc = fs.readFileSync(celHook, 'utf8');
      if (tresc.indexOf(NAGLOWEK_RELAI) === -1) {
        obcy = true;
      } else {
        fs.unlinkSync(celHook);
        usunieto++;
      }
    } catch (_) { /* nie ma czego usuwac */ }
    try { fs.unlinkSync(celSkaner); usunieto++; } catch (_) { /* jw. */ }

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

  let istniejacy = '';
  try { istniejacy = fs.readFileSync(celHook, 'utf8'); } catch (_) { /* brak */ }
  if (istniejacy && istniejacy.indexOf(NAGLOWEK_RELAI) === -1) {
    process.stderr.write(
      'RelAI: w "' + celHook + '" jest juz cudzy hook pre-commit. Nie nadpisuje go.\n' +
      'Dopisz do niego wywolanie: node "$(dirname "$0")/relai-secret-scan.js" — albo przenies\n' +
      'swoj hook i powtorz instalacje.\n'
    );
    return 1;
  }

  try {
    fs.mkdirSync(hooksDir, { recursive: true });
    fs.copyFileSync(path.join(__dirname, 'pre-commit.js'), celHook);
    fs.copyFileSync(path.join(__dirname, 'secret-scan.js'), celSkaner);
    try { fs.chmodSync(celHook, 0o755); } catch (_) { /* Windows: bez znaczenia */ }
  } catch (e) {
    process.stderr.write('RelAI: instalacja nie powiodla sie (' + e.message + ').\n');
    return 2;
  }

  process.stdout.write(
    (istniejacy ? 'RelAI: pre-commit ZAKTUALIZOWANY w ' : 'RelAI: pre-commit zainstalowany w ') + hooksDir + '.\n' +
    'Od teraz "git commit" z sekretem w plikach z indeksu konczy sie bledem i bez commita.\n' +
    'Cofniecie: node "' + path.join(__dirname, 'install-precommit.js') + '" "' + repo + '" --uninstall\n' +
    'Po zmianie regul skanu w rdzeniu powtorz instalacje — hook uzywa wlasnej kopii skanera.\n'
  );
  return 0;
}

process.exit(main());
