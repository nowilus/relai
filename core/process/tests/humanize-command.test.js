'use strict';
// /relai-humanize, Krok 8 (Aneks C planu HUMANIZACJA): blok wyniku ma plotek dluzszy niz
// kazdy plotek w tekscie. Pomiar E5 (k8, notatki wydania z blokiem ```bash) pokazal blok
// "Wersja poprawiona" uciety na wewnetrznym plotku.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const KOMENDA = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'commands', 'relai-humanize.md');

function krok8(md) {
  const start = md.search(/^## Step 8\b/m);
  assert.ok(start >= 0, 'Step 8 not found in relai-humanize.md: the check would pass on nothing');
  const reszta = md.slice(start + 1);
  const koniec = reszta.search(/^## /m);
  return koniec < 0 ? reszta : reszta.slice(0, koniec);
}

test('Step 8 tells the fence to be longer than any fence inside the text (annex C)', () => {
  const tekst = krok8(fs.readFileSync(KOMENDA, 'utf8').replace(/\r\n/g, '\n'));
  assert.match(tekst, /\*\*Fences\.\*\* The fence around parts 1 and 2 is longer than any run of backticks/);
  assert.match(tekst, /cuts the version ready to paste/);
});
