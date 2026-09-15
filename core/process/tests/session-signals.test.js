'use strict';

// Rdzen sygnalow startu ma jeden test celowany: wiersz "Propozycja RelAI poza projektem"
// (2.3.0). Reszta rozpoznan jest mierzona przez hooki adapterow; ten wiersz nie, bo
// dziala DOKLADNIE tam, gdzie hook do tej pory milczal — w folderze bez struktury RelAI.

const assert = require('node:assert/strict');
const test = require('node:test');

const core = require('../session-signals.js');

function ustawieniaGlobalne(wartosc) {
  const wiersz = wartosc === null
    ? ''
    : '| 2026-09-15 | Propozycja RelAI poza projektem | ' + wartosc + ' |\n';
  return '# USTAWIENIA — preferencje globalne\n\n'
    + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
    + '| 2026-08-09 | Jezyk pracy | Polski |\n'
    + wiersz;
}

test('propozycjaPozaProjektem reads the row as a fact: true, false or null', () => {
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('nie proponuj')), false);
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('**nie proponuj** — zadnych pytan')), false);
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('do not offer')), false);
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('proponuj')), true);
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('tak')), true);
  // Wartosc spoza zamknietej listy i brak wiersza znacza to samo: nie wiadomo.
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne('czasami')), null);
  assert.equal(core.propozycjaPozaProjektem(ustawieniaGlobalne(null)), null);
  assert.equal(core.propozycjaPozaProjektem(''), null);
});

test('propozycjaPozaProjektemReport speaks only on an explicit "nie proponuj"', () => {
  // "Nie wiadomo" zachowuje sie jak "proponuj": wyciszenie wymaga decyzji czlowieka,
  // a nie literowki w pliku ustawien.
  assert.deepEqual(core.propozycjaPozaProjektemReport(null), []);
  assert.deepEqual(core.propozycjaPozaProjektemReport(true), []);

  const linie = core.propozycjaPozaProjektemReport(false);
  assert.equal(linie.length, 1);
  assert.match(linie[0], /NIE proponuj/);
  assert.match(linie[0], /USTAWIENIA\.md/);
  assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(linie[0]), 'linia ma byc w ASCII (L-0016)');
});
