#!/usr/bin/env node
'use strict';
// RelAI hook: lockfile-scan - PostToolUse (Write/Edit/MultiEdit, Bash), OSTRZEGA (D-41)
// (plan BEZPIECZENSTWO, E2).
//
// Po zmianie pliku blokady albo komendzie instalacji menedzera paczek szybki skan Trivy
// folderu sesji; notka `[trivy-scan]` w kontekscie tylko przy pierwszym skanie folderu
// z CRITICAL/HIGH albo przy nowym CRITICAL/HIGH, poza tym cisza. 20 s przerwy miedzy
// skanami folderu.
//
// Logike niesie skill trivy-scan (skills/trivy-scan/scripts/lockfile-hook.mjs, ESM, eksport
// run) - tutaj protokol: stdin, bramka projektu RelAI i ladowanie modulu. Jeden wlasciciel
// logiki, jeden proces. Konwencja hook-guard: poza projektem RelAI i w trybie goscia wyjscie
// kodem 0 bez efektu. Kazdy blad konczy sie cisza i kodem 0: hook nigdy nie blokuje
// i nie psuje wywolania narzedzia.

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');
const LOGIKA = path.resolve(__dirname, '..', 'skills', 'trivy-scan', 'scripts', 'lockfile-hook.mjs');
const MARKERY_GOSCIA = ['.claude/relai.json'];

let core;
try {
  core = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-signals.js'));
} catch (_) {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch (_) {
  process.exit(0);
}

const cwd = (input && input.cwd) || process.cwd();
if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) process.exit(0);

import(pathToFileURL(LOGIKA).href)
  .then((logika) => logika.run(input))
  .catch(() => {
    process.exitCode = 0;
  });
