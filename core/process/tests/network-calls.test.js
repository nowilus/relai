'use strict';

// Kontrola wywolan sieciowych (AUDYT_SKILLI S7): wywolanie sieciowe w kodzie pluginow wolno miec
// tylko modulom z listy dozwolonych. Podlozony plik w kopii katalogu = kontrola pozytywna.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const siec = require('../../tools/network-calls.js');

test('rozpoznaje require/import modulow sieciowych, fetch i $.http; pomija komentarze', () => {
  const kod = [
    "const https = require('https');",
    "import net from 'node:net';",
    'const r = await fetch(url);',
    'const s = await $.http.fetch(PAGE)',
    '// fetch( w komentarzu nie jest wywolaniem',
    ' * @see require("http") w JSDoc',
    "const fs = require('fs');",
  ].join('\n');
  assert.deepEqual(siec.wywolania(kod).map((w) => w.linia), [1, 2, 3, 4]);
});

function drzewo(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-siec-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const pisz = (rel, txt) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), txt); };
  pisz('panel/hooks/register.tsx', 'const r = await $.http.fetch(PRICING_PAGE)\n');
  pisz('core/process/zwykly.js', "const fs = require('fs');\n");
  pisz('core/process/tests/x.test.js', "require('https');\n");
  pisz('panel/types/index.d.ts', 'fetch(input: string): Promise<Response>\n');
  return { dir, pisz };
}

test('moduł z listy dozwolonych przechodzi, podlozony modul spoza listy daje blad z nazwa pliku', (t) => {
  const { dir, pisz } = drzewo(t);
  const DOZWOLONE = [{ plik: 'panel/hooks/register.tsx', poCo: 'cennik po Tak' }];
  assert.deepEqual(siec.sprawdz(dir, DOZWOLONE).bledy, []);

  pisz('core/process/wyciek.js', "const https = require('https');\nhttps.get('https://example.com');\n");
  const wynik = siec.sprawdz(dir, DOZWOLONE);
  assert.equal(wynik.bledy.length, 1);
  assert.match(wynik.bledy[0], /core\/process\/wyciek\.js:1/);
});

test('pozycja listy, ktora nie ma juz wywolania, jest bledem (lista nie rosnie po cichu)', (t) => {
  const { dir } = drzewo(t);
  const wynik = siec.sprawdz(dir, [
    { plik: 'panel/hooks/register.tsx', poCo: 'cennik' },
    { plik: 'core/process/zwykly.js', poCo: 'dawniej' },
  ]);
  assert.equal(wynik.bledy.length, 1);
  assert.match(wynik.bledy[0], /zwykly\.js.*nie ma juz wywolania/);
});
