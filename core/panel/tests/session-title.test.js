'use strict';

// Ksztalt tytulu sesji (plan ZGLOSZENIA, E4, zgloszenie #1): jedna regula dla hooka
// UserPromptSubmit pluginu i dla start_session karty etapu w relai-panel.

const assert = require('node:assert/strict');
const test = require('node:test');

const { titleOf, TITLE_MAX } = require('../session-title.mjs');

const len = (s) => [...s].length;

test('plan z nazwa etapu: "EN · PLAN — nazwa"', () => {
  assert.equal(titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', name: 'Tytuł nowej sesji (#1)' }),
    'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)');
});

test('plan bez nazwy etapu: sam identyfikator', () => {
  assert.equal(titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4' }), 'E4 · ZGLOSZENIA');
  assert.equal(titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', name: '   ' }), 'E4 · ZGLOSZENIA');
});

test('odnoga: "Odnoga NAZWA"', () => {
  assert.equal(titleOf({ kind: 'branch', card: 'OPIS_REPO' }), 'Odnoga OPIS_REPO');
});

test('tytul dluzszy niz 60 znakow: przyciety na granicy slowa z "…", identyfikator zostaje', () => {
  const t = titleOf({ kind: 'plan', plan: 'PANEL_CODEX', stage: 'E1', name: 'Przejęcie rdzenia i natywny panel w Codeksie z mostkiem bieżącego czatu' });
  assert.ok(len(t) <= TITLE_MAX, `${len(t)} > ${TITLE_MAX}: ${t}`);
  assert.ok(t.startsWith('E1 · PANEL_CODEX — '), t);
  assert.ok(t.endsWith('…'), t);
  // granica slowa: przed "…" stoi cale slowo z nazwy, nie jego kawalek
  const kept = t.slice('E1 · PANEL_CODEX — '.length, -1);
  assert.ok('Przejęcie rdzenia i natywny panel w Codeksie z mostkiem bieżącego czatu'.startsWith(kept + ' '), kept);
});

test('tytul dokladnie 60 znakow zostaje bez "…"; 61 juz przyciety', () => {
  const head = 'E4 · ZGLOSZENIA — ';
  const fit = 'a'.repeat(TITLE_MAX - len(head));
  assert.equal(titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', name: fit }), head + fit);
  const over = titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', name: 'slowo ' + 'b'.repeat(TITLE_MAX - len(head) - 5) });
  assert.equal(over, head + 'slowo…');
});

test('nazwa bez granicy slowa w limicie: zostaje sam identyfikator', () => {
  const t = titleOf({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', name: 'x'.repeat(80) });
  assert.equal(t, 'E4 · ZGLOSZENIA');
});

test('identyfikator dluzszy niz limit nie jest ciety', () => {
  const plan = 'P'.repeat(70);
  assert.equal(titleOf({ kind: 'plan', plan, stage: 'E2', name: 'cokolwiek' }), `E2 · ${plan}`);
  assert.equal(titleOf({ kind: 'branch', card: plan }), `Odnoga ${plan}`);
});

test('pozycja tekstowa (STATE): przycieta na granicy slowa', () => {
  assert.equal(titleOf({ kind: 'text', text: 'Porządki w dokumentach' }), 'Porządki w dokumentach');
  const t = titleOf({ kind: 'text', text: 'słowo '.repeat(20).trim() });
  assert.ok(len(t) <= TITLE_MAX && t.endsWith('słowo…'), t);
});

test('cel nieznany albo pusty: null', () => {
  assert.equal(titleOf(null), null);
  assert.equal(titleOf({ kind: 'outside' }), null);
  assert.equal(titleOf({ kind: 'plan', plan: '', stage: 'E1' }), null);
  assert.equal(titleOf({ kind: 'plan', plan: 'X', stage: 'krok' }), null);
  assert.equal(titleOf({ kind: 'branch', card: '' }), null);
  assert.equal(titleOf({ kind: 'text', text: '  ' }), null);
});
