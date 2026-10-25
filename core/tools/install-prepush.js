#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: instalator hooka git pre-push - bramki tagow wydan (PIPELINE_WYDAN, E3).
//
// Instalacja jest JAWNA CZYNNOSCIA CZLOWIEKA (zmiana konfiguracji maszyny, po "tak") - .git/hooks/
// nie jest sledzony, wiec swiezy klon i inna maszyna bramki nie maja; raport release-check.js
// ma na to kontrole "pre-push" (ryzyko S4 planu).
//
//   node core/tools/install-prepush.js [<katalog-repo>]
//   node core/tools/install-prepush.js [<katalog-repo>] --uninstall
//
// Do .git/hooks/ trafiaja DWA pliki (uklad pre-commita 1.9.2):
//   pre-push            - shim powlokowy, jedyne, co wola git,
//   relai-pre-push.cjs  - logika hooka (kopia core/tools/release-pre-push.js).
// Idempotentny: kopia rowna zrodlu i shim RelAI na miejscu = "bez zmian", niczego nie zapisuje.
// Cudzego pre-push nie nadpisuje - kladzie logike obok i mowi, jaka linie dopisac.
// Instalacja konczy sie testem dymnym: logika przy pustym stdin konczy sie kodem 0; test
// niezdany cofa instalacje. Komunikaty ASCII (L-0016).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const NAGLOWEK_RELAI = 'RelAI core / narzedzie: git pre-push - bramka tagow wydan.';
const ZRODLO = path.join(__dirname, 'release-pre-push.js');

// Shim z koncami linii LF: sh nie strawi CRLF w linii shebang.
const SHIM = [
  '#!/bin/sh',
  '# ' + NAGLOWEK_RELAI,
  '# Ten plik jest wylacznie przelacznikiem - cala logika stoi w relai-pre-push.cjs.',
  'exec node "$(dirname "$0")/relai-pre-push.cjs" "$@"',
  '',
].join('\n');

const lf = (t) => String(t).replace(/\r\n?/g, '\n');

function czytaj(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

function katalogHookow(repo) {
  const r = spawnSync('git', ['rev-parse', '--git-path', 'hooks'], { cwd: repo, encoding: 'utf8', windowsHide: true });
  if (r.status !== 0 || !String(r.stdout || '').trim()) return null;
  return path.resolve(repo, r.stdout.trim());
}

function testDymny(repo, celLogika) {
  const r = spawnSync('node', [celLogika], { cwd: repo, input: '', encoding: 'utf8', windowsHide: true });
  if (r.error) return 'nie udalo sie uruchomic node: ' + r.error.message;
  return r.status === 0 ? null : 'kod wyjscia ' + r.status + ' ' + String(r.stderr || '').trim();
}

function odinstaluj(celHook, celLogika, hooksDir) {
  const shim = czytaj(celHook);
  if (shim !== null && !shim.includes(NAGLOWEK_RELAI)) {
    if (shim.includes('relai-pre-push.cjs')) {
      process.stderr.write('RelAI: deinstalacja przerwana - cudzy "' + celHook + '" wola relai-pre-push.cjs.\n'
        + 'Nie usunieto zadnych plikow. Usun te linie recznie i powtorz z --uninstall.\n');
      return 1;
    }
  }
  let usunieto = 0;
  if (shim !== null && shim.includes(NAGLOWEK_RELAI)) { fs.unlinkSync(celHook); usunieto++; }
  if (czytaj(celLogika) !== null) { fs.unlinkSync(celLogika); usunieto++; }
  process.stdout.write(usunieto
    ? 'RelAI: pre-push odinstalowany (' + usunieto + ' plikow usunietych z ' + hooksDir + ').\n'
    : 'RelAI: nie bylo czego odinstalowywac w ' + hooksDir + '.\n');
  return 0;
}

function main() {
  const args = process.argv.slice(2);
  const repo = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
  const hooksDir = katalogHookow(repo);
  if (!hooksDir) {
    process.stderr.write('RelAI: "' + repo + '" nie jest repozytorium gita. Nie ma gdzie zainstalowac pre-push.\n');
    return 2;
  }
  const celHook = path.join(hooksDir, 'pre-push');
  const celLogika = path.join(hooksDir, 'relai-pre-push.cjs');
  if (args.includes('--uninstall')) return odinstaluj(celHook, celLogika, hooksDir);

  const zrodlo = czytaj(ZRODLO);
  if (zrodlo === null) { process.stderr.write('RelAI: brak zrodla hooka ' + ZRODLO + '.\n'); return 2; }
  const shim = czytaj(celHook);
  const logika = czytaj(celLogika);
  const cudzy = shim !== null && !shim.includes(NAGLOWEK_RELAI);
  const logikaAktualna = logika !== null && lf(logika) === lf(zrodlo);
  const shimAktualny = shim !== null && lf(shim) === SHIM;

  if (logikaAktualna && (shimAktualny || (cudzy && shim.includes('relai-pre-push.cjs')))) {
    process.stdout.write('RelAI: pre-push aktualny w ' + hooksDir + ' - bez zmian.\n');
    return 0;
  }

  const stan = new Map([[celLogika, logika]].concat(cudzy ? [] : [[celHook, shim]]));
  try {
    fs.mkdirSync(hooksDir, { recursive: true });
    if (!logikaAktualna) fs.copyFileSync(ZRODLO, celLogika);
    if (!cudzy && !shimAktualny) {
      fs.writeFileSync(celHook, SHIM);
      try { fs.chmodSync(celHook, 0o755); } catch (_) { /* Windows: bez znaczenia */ }
    }
  } catch (e) {
    for (const [p, t] of stan) { try { if (t === null) fs.unlinkSync(p); else fs.writeFileSync(p, t); } catch (_) { /* jw. */ } }
    process.stderr.write('RelAI: instalacja nie powiodla sie (' + e.message + '). Stan sprzed instalacji przywrocony.\n');
    return 2;
  }

  const blad = testDymny(repo, celLogika);
  if (blad) {
    for (const [p, t] of stan) { try { if (t === null) fs.unlinkSync(p); else fs.writeFileSync(p, t); } catch (_) { /* jw. */ } }
    process.stderr.write('RelAI: instalacja COFNIETA - logika hooka przy pustym stdin nie konczy sie kodem 0:\n  ' + blad + '\n');
    return 2;
  }

  if (cudzy) {
    process.stderr.write('RelAI: w "' + celHook + '" jest juz cudzy hook pre-push. Nie nadpisuje go.\n'
      + 'Logika RelAI lezy obok (relai-pre-push.cjs) i przeszla test dymny. Dopisz do swojego hooka linie:\n'
      + '  node "$(dirname "$0")/relai-pre-push.cjs" "$@" || exit 1\n'
      + '(stdin gita musi do niej dotrzec - jesli Twoj hook sam czyta stdin, przekaz mu kopie).\n');
    return 1;
  }

  process.stdout.write((shim !== null || logika !== null ? 'RelAI: pre-push ZAKTUALIZOWANY w ' : 'RelAI: pre-push zainstalowany w ') + hooksDir + '.\n'
    + 'Od teraz push tagu v* albo relai-*-v* przechodzi tylko przy zielonym raporcie release-check.js --wydanie.\n'
    + 'Push zwyklego commitu - bez kontroli. Obejscie: RELAI_RELEASE_OBEJSCIE="<powod>" (linia w docs/DZIENNIK.md).\n'
    + 'Cofniecie: node core/tools/install-prepush.js --uninstall\n');
  return 0;
}

process.exit(main());
