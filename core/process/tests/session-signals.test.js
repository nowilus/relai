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

// HUMANIZACJA E1: baza regul humanizacji w kopii projektu, ta sama droga co baza optymalizatora.
// Dowod efektem: kazdy plik core/humanize/ ma w .claude/relai/humanize/ kopie o tej samej sumie
// (po CRLF -> LF), a kopia nadpisuje zmieniony plik przy nastepnym starcie.
test('provisionTemplates copies core/humanize to .claude/relai/humanize with equal sums', (t) => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const crypto = require('node:crypto');
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-humanize-provision-'));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const zrodlo = path.join(__dirname, '..', '..', 'humanize');
  const cel = path.join(cwd, '.claude', 'relai', 'humanize');
  const suma = (p) => crypto.createHash('sha256').update(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  const pliki = (dir, pre = '') => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((w) => (w.isDirectory() ? pliki(path.join(dir, w.name), pre + w.name + '/') : [pre + w.name]));

  assert.ok(core.provisionTemplates(cwd) > 0);
  const lista = pliki(zrodlo);
  // E3: sciaga trybu ciaglego (SKROT.md) jedzie ta sama droga — regula hooka wskazuje kopie projektu
  assert.deepEqual(lista.sort(), ['LICENSE-humanizer.md', 'PROFIL_STYLU.md', 'REGULY.md', 'SKROT.md', 'jezyki/pl.md']);
  for (const rel of lista) assert.equal(suma(path.join(cel, rel)), suma(path.join(zrodlo, rel)), rel);
  assert.ok(fs.existsSync(path.join(cwd, '.claude', 'relai', 'tools', 'humanize-facts.js')));
  // E2: ustawienia humanizacji czyta i zapisuje kopia skryptu w projekcie, nie katalog pluginu
  assert.equal(suma(path.join(cwd, '.claude', 'relai', 'tools', 'humanize-mode.js')),
    suma(path.join(__dirname, '..', 'humanize-mode.js')));

  fs.writeFileSync(path.join(cel, 'REGULY.md'), 'stara kopia\n');
  core.provisionTemplates(cwd);
  assert.equal(suma(path.join(cel, 'REGULY.md')), suma(path.join(zrodlo, 'REGULY.md')), 'next start overwrites the copy');
});
