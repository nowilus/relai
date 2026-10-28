'use strict';
// /relai-stage, Krok 4 (Aneks C planu WYGLAD_PANELU, 2026-10-15): karta startu ma komplet pol.
// Pomiar na transkryptach od 2026-09-15: akapit "gdzie jestesmy" pochodzil z rytualu startu
// w skillu relai-core, ktory nie wyzwala sie, gdy /relai-stage jest pierwszym promptem sesji;
// karta pisala liczbe punktow weryfikacji zamiast ich tresci, a styl skracania sesji ja sciskal.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..', '..', '..');
const KOPIE = [
  path.join(ROOT, 'adapters', 'claude-code', 'commands', 'relai-stage.md'),
  path.join(ROOT, 'adapters', 'codex', 'skills', 'relai-stage', 'SKILL.md'),
];

function krok4(plik) {
  const md = fs.readFileSync(plik, 'utf8').replace(/\r\n/g, '\n');
  const start = md.search(/^## Krok 4\b/m);
  assert.ok(start >= 0, 'Krok 4 not found in ' + plik + ': the checks would pass on nothing');
  const reszta = md.slice(start + 1);
  const koniec = reszta.search(/^## /m);
  // Line breaks in the command move with every edit; the checks read the text, not its wrapping.
  return (koniec < 0 ? reszta : reszta.slice(0, koniec)).replace(/\s+/g, ' ');
}

for (const plik of KOPIE) {
  const nazwa = path.relative(ROOT, plik).replace(/\\/g, '/');

  test(nazwa + ': the card runs the start ritual when the session has not done it yet', () => {
    const t = krok4(plik);
    assert.match(t, /\*\*Gdzie jesteśmy\*\*/);
    assert.match(t, /nie padł jeszcze akapit „gdzie jesteśmy”/);
    // KONTEKST_STARTU E2, Aneks B: rytual karty to skrot startu, nie lista plikow.
    assert.match(t, /uruchamiasz\s+`node \.claude\/relai\/tools\/start-digest\.js` \(skrót startu\)/);
  });

  test(nazwa + ': the card shows the stage table with statuses', () => {
    assert.match(krok4(plik), /\*\*Etapy planu\*\* — tabela z `STATUS\.md`/);
  });

  test(nazwa + ': the card lists every verification point, not only their number', () => {
    const t = krok4(plik);
    assert.match(t, /\*\*wszystkie punkty\*\* sekcji Weryfikacja/);
    assert.match(t, /Sama liczba punktów nie wystarcza/);
  });

  test(nazwa + ': the card names the recommended effort from the stage prompt', () => {
    assert.match(krok4(plik), /zalecanym `\/effort`/);
  });

  test(nazwa + ': the card is written in full text whatever the session compression style', () => {
    assert.match(krok4(plik), /Kartę startu piszesz pełnym tekstem/);
  });

  // Aneks D (2026-10-15): the layout is fixed, not left to the model.
  test(nazwa + ': the card has a fixed layout under the heading "Karta startu"', () => {
    const t = krok4(plik);
    assert.match(t, /\*\*Układ karty\*\*/);
    assert.match(t, /[Nn]agłówek „Karta startu”/);
    assert.match(t, /jedną listą wypunktowaną/);
  });

  test(nazwa + ': situational notes go before the card', () => {
    assert.match(krok4(plik), /\*\*Uwagi z sytuacji\*\*/);
  });

  test(nazwa + ': the stage scope is given as sub-points with concrete changes', () => {
    const t = krok4(plik);
    assert.match(t, /\*\*Czego dotyczy\*\* — podpunkty/);
    // Negative proof: the old prose rule is gone.
    assert.doesNotMatch(t, /2–4 zdania z sekcji „Zakres etapu"/);
  });

  test(nazwa + ': the hardest verification point says what happens when it fails', () => {
    assert.match(krok4(plik), /co zrobisz, gdy nie przejdzie/);
  });
}
