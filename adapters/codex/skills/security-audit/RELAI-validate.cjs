#!/usr/bin/env node
// RelAI: walidatory Cloudflare bez CLI — droga dla Windowsa bez WSL (plan BEZPIECZENSTWO E4).
// CLI upstreamu otwiera plik z O_NOFOLLOW | O_NONBLOCK; Node na Windowsie tych flag nie ma, wiec
// CLI odmawia odczytu. Ten skrypt czyta plik zwyklym readFileSync i wola eksportowane
// validateDocument — schemat i semantyka te same, pominiete: odczyt bez dowiazan i limit tekstu
// przed parsowaniem (findings). Raport mowi o tym w pierwszym akapicie. Kodu Cloudflare nie zmienia.
// Uzycie: node RELAI-validate.cjs findings <findings.json> | ledger <coverage-ledger.json>
'use strict';
const fs = require('fs');
const path = require('path');

const [rodzaj, plik] = process.argv.slice(2);
if (!['findings', 'ledger'].includes(rodzaj) || !plik) {
  process.stderr.write('Usage: node RELAI-validate.cjs findings|ledger <file.json>\n');
  process.exit(2);
}

let dane;
try {
  const tekst = fs.readFileSync(plik, 'utf8');
  if (rodzaj === 'ledger') require('./validate-coverage-ledger.cjs').preflightJsonText(tekst);
  dane = JSON.parse(tekst);
} catch (e) {
  process.stderr.write('FAIL: cannot read or parse ' + plik + ': ' + e.message + '\n');
  process.exit(1);
}

const bledy = rodzaj === 'findings'
  ? require('./validate-findings.cjs').validateDocument(dane,
    JSON.parse(fs.readFileSync(path.join(__dirname, 'report-schema.json'), 'utf8')))
  : require('./validate-coverage-ledger.cjs').validateDocument(dane);

for (const b of bledy) process.stderr.write('ERROR: ' + b + '\n');
if (bledy.length) {
  process.stderr.write('FAIL: ' + bledy.length + ' validation error(s) [RelAI module path, no CLI file guards]\n');
  process.exit(1);
}
process.stdout.write('PASS: ' + dane.length + ' ' + (rodzaj === 'findings' ? 'findings' : 'coverage units')
  + ' valid [RelAI module path, no CLI file guards]\n');
