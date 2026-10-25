#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: podpowiedz gotowosci wydania (plan PIPELINE_WYDAN, E3).
//
// Wolany z reguly w CLAUDE.md tego repo (nie z hooka pluginu - nic nie trafia do uzytkownikow RelAI)
// przy "kontynuujemy prace" i przy zamknieciu planu. Jedna linia na stdout albo cisza:
//   od v3.3.0: 12 plikow w relai, relai-panel; sprawdzic gotowosc? (/relai-release)
// Zrodlo prawdy to pole "propozycje" raportu release-check.js (--szybko --tylko podbicie):
// puste = zadna zmiana od bazy nie wymaga wydania (np. same docs/) = cisza.
// Raport niemozliwy (kod 2) = cisza na stdout i jedna linia na stderr. Zawsze kod 0.
//
//   node core/tools/release-hint.js [--repo <katalog>]

const path = require('path');
const { argumenty, sprawdz } = require('./release-check.js');

async function podpowiedz(argv) {
  const a = argumenty(['--szybko', '--tylko', 'podbicie'].concat(argv));
  const r = await sprawdz(a);
  if (!r.propozycje.length) return '';
  const plikow = r.propozycje.reduce((s, p) => s + p.plikow, 0);
  return 'od ' + r.bazy.rdzen.ref + ': ' + plikow + ' plikow w ' + r.propozycje.map((p) => p.komponent).join(', ')
    + '; sprawdzic gotowosc? (/relai-release)';
}

if (require.main === module) {
  podpowiedz(process.argv.slice(2)).then((t) => { if (t) process.stdout.write(t + '\n'); }, (e) => {
    process.stderr.write('RelAI release-hint: brak podpowiedzi - ' + (e && e.message) + '\n');
  });
}

module.exports = { podpowiedz };
