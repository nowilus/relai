'use strict';

// Linia w stopce (odnoga PASKI_W_STOPCE): jedna linia statusu, ktora desktop pokazuje w kazdym
// panelu podzialu okna. relai-panel zapisuje slowa planu do pliku sesji, relai-cache-keeper sklada
// z nich i z baterii cache cala linie — tekst i sciezka tylko tutaj.

const assert = require('node:assert/strict');
const test = require('node:test');

const f = require('../footer.mjs');

test('the whole line: plan, cache, 5 h, the week and the context in this order', () => {
  const line = f.footerLine({ plan: 'PANEL_CODEX · E1 3/15 etapów', cache: '~59 min', five: '7 %', week: '29 %', ctx: '306k' });
  assert.equal(line, 'PANEL_CODEX · E1 3/15 etapów · cache ~59 min · 5 h 7 % · tydz. 29 % · kontekst 306k');
});

test('outside a RelAI project the line carries the cache part alone', () => {
  assert.equal(f.footerLine({ plan: null, cache: 'zimny', five: '7 %', week: '29 %', ctx: null }), 'cache zimny · 5 h 7 % · tydz. 29 %');
});

test('a missing figure leaves its part out, never a seeming zero', () => {
  assert.equal(f.footerLine({ plan: 'X', cache: null, five: null, week: '30 %', ctx: null }), 'X · tydz. 30 %');
});

test('nothing known clears the line (undefined, the engine removes it)', () => {
  assert.equal(f.footerLine({ plan: null, cache: null, five: null, week: null, ctx: null }), undefined);
  assert.equal(f.footerLine({ plan: '  ', cache: '', five: null, week: null, ctx: ' ' }), undefined);
});

test('the plan words of a session: its label and count, or the question when its work is not chosen', () => {
  const ok = (closed, stages) => ({ kind: 'ok', closed, stages });
  assert.equal(f.footerPlan({ label: 'PANEL_CODEX · E1', isAsking: false, unit: 'etapów', plan: ok(3, 15) }), 'PANEL_CODEX · E1 3/15 etapów');
  assert.equal(f.footerPlan({ label: 'PASKI_W_STOPCE (odnoga)', isAsking: false, unit: 'paczek', plan: ok(2, 7) }), 'PASKI_W_STOPCE (odnoga) 2/7 paczek');
  // a card without packets counts nothing: no "0/0", the label alone
  assert.equal(f.footerPlan({ label: 'PASKI_W_STOPCE (odnoga)', isAsking: false, unit: 'paczek', plan: ok(0, 0) }), 'PASKI_W_STOPCE (odnoga)');
  assert.equal(f.footerPlan({ label: 'poza planem', isAsking: false, unit: 'etapów', plan: { kind: 'none' } }), 'poza planem');
  assert.equal(f.footerPlan({ label: 'nie wybrano', isAsking: true, unit: 'etapów', plan: { kind: 'none' } }), 'praca nie wybrana');
  assert.equal(f.footerPlan(null), null);
});

test('the file is one a session, under .claude/relai/stopka, with an id safe for a path', () => {
  assert.equal(f.footerPath('87c07777-2e36'), '.claude/relai/stopka/87c07777-2e36.txt');
  assert.equal(f.footerPath('a/b:c'), '.claude/relai/stopka/a_b_c.txt');
});

test('the plan read back from the file: first line trimmed, empty means none', () => {
  assert.equal(f.readFooterPlan('PANEL_CODEX · E1\r\n'), 'PANEL_CODEX · E1');
  assert.equal(f.readFooterPlan(''), null);
  assert.equal(f.readFooterPlan(null), null);
});
