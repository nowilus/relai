'use strict';

// Tabela "Stan prac" w CLAUDE.md ma najwyzej piec wierszy-drogowskazow (SPEC_CLAUDE_MD.md).
// Zamkniecie planu dopisywalo wiersz z historia planu, wiec w tym repo tabela urosla do ~20
// wierszy i 15 KB (przeglad 2026-10-27). Hook startu zglasza tabele ponad progiem w raporcie
// progow dokumentow — ten sam raport, ktory wolaja hooki startu wszystkich trzech adapterow.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const core = require('../session-signals.js');

const utworzone = [];
test.after(() => { for (const d of utworzone) fs.rmSync(d, { recursive: true, force: true }); });

const USTAWIENIA = (rotacja) => '# USTAWIENIA\n\nWersja RelAI: 3.5.0 · zainicjowano: 2026-10-27\n\n'
  + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
  + '| 2026-10-27 | Rotacja dokumentów | ' + rotacja + ' |\n';

const wiersze = (n) => Array.from({ length: n }, (_, i) => '| Obszar ' + (i + 1) + ' | DZIALA | docs/STATE.md |').join('\n');

const CLAUDE = (n, naglowek) => '# Projekt\n\n## Rytuał startu sesji\n\n1. Ten plik.\n\n'
  + '## ' + (naglowek || 'Stan prac') + '\n\n| Co | Status | Gdzie |\n|---|---|---|\n' + wiersze(n) + '\n\n'
  + 'Aktywny plan: brak\n\n## Reguły procesu\n\n| Reguła | Opis |\n|---|---|\n| a | b |\n| c | d |\n';

function projekt(claude, rotacja) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-work-table-'));
  utworzone.push(dir);
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), USTAWIENIA(rotacja || 'włączona'));
  if (claude !== null) fs.writeFileSync(path.join(dir, 'CLAUDE.md'), claude);
  return dir;
}

const pozycjaTabeli = (dir) => {
  const txt = fs.readFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), 'utf8');
  return core.dokumentyPonadProgiem(dir, txt).find((d) => /Stan prac/.test(d.etykieta));
};

test('a work table with six rows is reported with its row count and the procedure', () => {
  const p = pozycjaTabeli(projekt(CLAUDE(6)));
  assert.ok(p, 'tabela z szescioma wierszami nie zostala zgloszona');
  assert.equal(p.wartosc, 6);
  assert.equal(p.prog, 5);
  assert.equal(p.jednostka, 'wierszy');
  assert.match(p.procedura, /STATE/);
});

test('a work table with five rows is silent, and so are tables of other sections', () => {
  assert.equal(pozycjaTabeli(projekt(CLAUDE(5))), undefined);
});

test('CRLF line endings and the English heading count the same rows', () => {
  assert.equal(pozycjaTabeli(projekt(CLAUDE(7).replace(/\n/g, '\r\n'))).wartosc, 7);
  assert.equal(pozycjaTabeli(projekt(CLAUDE(7, 'Work status'))).wartosc, 7);
});

test('no CLAUDE.md, no work section or rotation switched off means silence', () => {
  assert.equal(pozycjaTabeli(projekt(null)), undefined);
  assert.equal(pozycjaTabeli(projekt('# Projekt\n\n## Reguły\n\n| a | b |\n|---|---|\n' + wiersze(9) + '\n')), undefined);
  assert.equal(pozycjaTabeli(projekt(CLAUDE(9), 'wyłączona')), undefined);
});

test('the start report names the table in ASCII with rows, not kilobytes', () => {
  const dir = projekt(CLAUDE(8));
  const linie = core.startCostReport(core.startCost(dir, {}));
  const linia = linie.find((l) => /progi dokumentow/.test(l));
  assert.ok(linia, 'brak linii progow dokumentow: ' + JSON.stringify(linie));
  assert.match(linia, /Stan prac/);
  assert.match(linia, /8 wierszy \(prog 5 wierszy\)/);
  assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(linie.join('\n')), 'raport ma byc w ASCII (L-0016)');
});
