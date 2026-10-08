#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: sync-panel-core — kopia core/panel/*.mjs do pluginu relai-panel.
//
// Po co: silnik modow Claude Code odmawia importu spoza folderu pluginu ("cannot import ...
// it is outside the plugin's folder", 2.1.293, sprawdzone 2026-10-08), a marketplace ze
// zrodlem ./panel kopiuje przy instalacji tylko ten folder. Rdzen zostaje jedynym zrodlem
// (plan PANEL_CLAUDE, wariant A): panel/hooks/core/ niesie kopie bajt w bajt, a ten skrypt
// jest jedyna droga, ktora tam pisze. Kopii nie edytuje sie recznie.
//
//   node core/tools/sync-panel-core.js          # zapisuje kopie
//   node core/tools/sync-panel-core.js --check  # tylko porownuje (test, przed wydaniem)
//
// Porownanie po normalizacji CRLF -> LF (core.autocrlf=true na Windows, L-0033).
// Kod wyjscia: 0 = zgodne / zapisane, 1 = rozjazd (tryb --check). Komunikaty ASCII.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'core', 'panel');
const DST = path.join(ROOT, 'panel', 'hooks', 'core');

function sources() {
  return fs.readdirSync(SRC).filter((n) => n.endsWith('.mjs')).sort();
}

const lf = (buf) => buf.toString('utf8').replace(/\r\n/g, '\n');

function check() {
  const want = sources();
  const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')).sort() : [];
  const problems = [];
  for (const n of want) {
    const dst = path.join(DST, n);
    if (!fs.existsSync(dst)) problems.push('brak kopii panel/hooks/core/' + n);
    else if (lf(fs.readFileSync(dst)) !== lf(fs.readFileSync(path.join(SRC, n)))) problems.push('kopia panel/hooks/core/' + n + ' rozni sie od core/panel/' + n);
  }
  for (const n of have) if (!want.includes(n)) problems.push('panel/hooks/core/' + n + ' nie ma zrodla w core/panel/');
  return { files: want.length, problems };
}

function sync() {
  fs.mkdirSync(DST, { recursive: true });
  for (const n of sources()) fs.copyFileSync(path.join(SRC, n), path.join(DST, n));
}

if (require.main === module) {
  if (!process.argv.includes('--check')) sync();
  const r = check();
  if (r.problems.length) {
    for (const p of r.problems) process.stderr.write('[sync-panel-core] ' + p + '\n');
    process.stderr.write('[sync-panel-core] napraw: node core/tools/sync-panel-core.js\n');
    process.exit(1);
  }
  process.stdout.write('[sync-panel-core] zgodne: ' + r.files + ' plikow core/panel -> panel/hooks/core\n');
}

module.exports = { check, sync };
