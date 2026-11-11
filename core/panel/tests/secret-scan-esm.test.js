'use strict';

// Parytet wzorcow sekretow (plan MODY_OSZCZEDZANIA, E1): kopia ESM dla modow powstaje
// z core/guardrails/secret-scan.js i daje te same werdykty na tym samym zestawie fikstur.
// Druga strona (zasada 3): podlozona zmiana w kopii musi rozjechac werdykt. Fikstury skladane
// z kawalkow — w pliku nie stoi ciag, ktory skaner repozytorium uznalby za sekret albo za
// przypisanie (takze odczyt srodowiska w cudzyslowie, po ktorym stoi przecinek).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const cjs = require('../../guardrails/secret-scan.js');
const { toEsm, build } = require('../../tools/secret-scan-esm.js');

const j = (...p) => p.join('');
const FIXTURES = [
  j('OPENAI_KEY=', 'sk', '-', 'A'.repeat(24)),
  j('token: ', 'ghp', '_', 'b'.repeat(30)),
  j('AK', 'IA', 'Q'.repeat(16)),
  j('-----BEGIN RSA ', 'PRIVATE', ' KEY-----'),
  j('postgres://admin:', 'Zq9'.repeat(4), '@db.local/app'),
  j('DB_', 'PASSWORD', '=', 'Hk2'.repeat(4)),
  j('const api', 'Key', ' = ', 'process.env.API_KEY'),
  'postgres://user:password@host/db',
  j('AK', 'IA', 'IOSFODNN7EXAMPLE'),
  'function login(password: string): Promise<User>',
  'zwykly tekst bez sekretu',
  '',
];

function load(esmText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-esm-'));
  const file = path.join(dir, 'secret-scan.mjs');
  fs.writeFileSync(file, esmText);
  return require(file);
}

test('kopia ESM daje te same werdykty co skaner CommonJS', () => {
  const esm = load(build());
  for (const f of FIXTURES) assert.equal(esm.scanText(f), cjs.scanText(f), JSON.stringify(f));
  assert.equal(esm.PATTERNS.length, cjs.PATTERNS.length);
  const hits = FIXTURES.filter((f) => cjs.scanText(f)).length;
  assert.ok(hits >= 6 && hits < FIXTURES.length, `zestaw ma obie strony (trafienia: ${hits})`);
});

test('kontrola pozytywna: zmieniony wzorzec w kopii rozjezdza werdykt', () => {
  const broken = load(build().replace('sk-[A-Za-z0-9_-]{16,}', 'sk-[A-Za-z0-9_-]{99,}'));
  assert.notEqual(broken.scanText(FIXTURES[0]), cjs.scanText(FIXTURES[0]));
});

test('zmieniona rama zrodla zatrzymuje generator, zamiast dac zla kopie', () => {
  assert.throws(() => toEsm("'use strict';\nconst x = 1;\n"), /export line/);
  assert.throws(() => toEsm("const fs = require('fs');\nmodule.exports = { scanText, PATTERNS };"), /require/);
});
