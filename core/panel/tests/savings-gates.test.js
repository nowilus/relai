'use strict';

// Bramki modow oszczedzania (plan MODY_OSZCZEDZANIA, E1): zgoda raz na projekt, pliki procesu
// RelAI doslownie, blizniak BenAI (Aneks A), czlowiek przy sesji, skaner sekretow przed
// pomocnikiem. Kazda kontrola ma druga strone (zasada 3): przypadek, ktory MUSI przejsc,
// i przypadek, ktory NIE MOZE przejsc. Fikstury z sekretem skladane z kawalkow — w pliku
// nie stoi zaden ciag, ktory skaner repozytorium uznalby za sekret.

const assert = require('node:assert/strict');
const test = require('node:test');

const g = require('../savings-gates.mjs');
const { scanText } = require('../../guardrails/secret-scan.js');

const SETTINGS = [
  '# USTAWIENIA',
  '',
  'Wersja RelAI: 3.8.0 · zainicjowano: 2026-08-07',
  '',
  '| Data | Czego dotyczy | Decyzja |',
  '|---|---|---|',
  '| 2026-08-07 | Język projektu | Polski |',
  '',
  '## Ustawienia wycofane',
].join('\n');

test('zgoda: brak wiersza to pytanie, wiersz z karty to zgoda albo odmowa', () => {
  assert.equal(g.readConsent(SETTINGS), null);
  const yes = g.withConsentRow(SETTINGS, g.consentRow('2026-11-11', true));
  assert.equal(g.readConsent(yes), 'yes');
  const no = g.withConsentRow(SETTINGS, g.consentRow('2026-11-11', false));
  assert.equal(g.readConsent(no), 'no');
});

test('zgoda: wiersz trafia do tabeli, przed sekcja wycofanych, a ostatni wiersz wygrywa', () => {
  const both = g.withConsentRow(g.withConsentRow(SETTINGS, g.consentRow('2026-11-11', true)), g.consentRow('2026-11-12', false));
  const lines = both.split('\n');
  assert.ok(lines.indexOf('## Ustawienia wycofane') > lines.findIndex((l) => l.includes(g.CONSENT_ROW)));
  assert.equal(g.readConsent(both), 'no');
});

test('zgoda: brzmienie spoza zamknietej listy nie jest zgoda', () => {
  assert.equal(g.readConsent('| 2026-11-11 | Mody oszczędzania | może kiedyś |'), null);
  assert.equal(g.readConsent('| 2026-11-11 | Mody oszczedzania | zgoda |'), null, 'nazwa bez polskich znakow to inny wiersz');
});

test('marker projektu i kandydaci ustawien od cwd w gore (L-0146)', () => {
  assert.ok(g.hasMarker(SETTINGS));
  assert.ok(!g.hasMarker('# USTAWIENIA\n| a | b | c |'));
  const c = g.settingsCandidates('C:\\Users\\L\\proj\\src');
  assert.deepEqual(c.slice(0, 2).map((x) => x.file), ['C:/Users/L/proj/src/docs/USTAWIENIA.md', 'C:/Users/L/proj/docs/USTAWIENIA.md']);
});

test('pliki procesu RelAI przechodza doslownie, plik spoza listy nie', () => {
  const root = 'C:/p';
  for (const f of ['C:/p/docs/STATE.md', 'C:\\p\\docs\\plany\\X\\STATUS.md', 'C:/p/.claude/relai/templates/SPEC_PLAN.md',
    'C:/q/PROMPT_ETAP_3.md', 'C:/q/PLAN.html', 'C:/q/CLAUDE.md', 'C:/q/skills/x/SKILL.md', 'C:/u/.claude/settings.json']) {
    assert.ok(g.isVerbatimFile(f, root), `musi przejsc doslownie: ${f}`);
  }
  for (const f of ['C:/p/src/big.ts', 'C:/p/README.md', 'C:/q/docs/STATE.md', 'C:/p/docs/raport.pdf']) {
    assert.ok(!g.isVerbatimFile(f, root), `nie moze przejsc doslownie: ${f}`);
  }
  assert.ok(!g.isVerbatimFile('C:/p/docs/STATE.md', null), 'bez markera docs/ nie jest procesem');
});

const S = (o) => JSON.stringify({ enabledPlugins: o });

test('blizniak: aktywny z settings.json, ostatni plik z wpisem decyduje (Aneks A)', () => {
  assert.ok(g.isTwinActive('relai-browser', [S({ 'efficient-browser-use@token-saving-mods': true })]));
  assert.ok(!g.isTwinActive('relai-browser', [S({ 'efficient-browser-use@token-saving-mods': false })]));
  assert.ok(!g.isTwinActive('relai-browser', [S({ 'efficient-browser-use@token-saving-mods': true }), null, S({ 'efficient-browser-use@token-saving-mods': false })]));
  assert.ok(!g.isTwinActive('relai-browser', [S({ 'input-router@token-saving-mods': true })]), 'inny blizniak nie usypia');
  assert.ok(!g.isTwinActive('relai-browser', ['{zly json', null]));
  assert.ok(g.isTwinActive('relai-browser', ['﻿' + S({ 'efficient-browser-use@token-saving-mods': true })]), 'BOM na poczatku pliku');
});

test('blizniak: switches.json tylko jako wylacznik', () => {
  const on = [S({ 'efficient-browser-use@token-saving-mods': true })];
  assert.ok(!g.isTwinActive('relai-browser', on, '{"efficient-browser-use": false}'));
  assert.ok(g.isTwinActive('relai-browser', on, '{"efficient-browser-use": true}'));
  assert.ok(!g.isTwinActive('relai-browser', [S({})], '{"efficient-browser-use": true}'), 'switches.json sam nie wlacza');
});

test('czlowiek przy sesji: tylko composer (sonda E1)', () => {
  assert.ok(g.isHumanOrigin({ kind: 'composer' }));
  for (const o of [{ kind: 'sdk' }, { kind: 'task-notification' }, { kind: 'bridge' }, null, undefined]) {
    assert.ok(!g.isHumanOrigin(o), JSON.stringify(o));
  }
});

test('skaner przed pomocnikiem: sekret daje 0 wywolan, tresc czysta 1 (zasada 3)', async () => {
  let calls = 0;
  const send = async (t) => { calls++; return `notes:${t.length}`; };
  const body = 'A'.repeat(24);
  const leaky = ['config:', 'OPENAI_KEY=' + 'sk' + '-' + body, ''].join('\n');
  assert.ok(scanText(leaky), 'kontrola instrumentu: skaner widzi fiksture');
  const r1 = await g.guardHelper(leaky, scanText, send);
  assert.equal(calls, 0);
  assert.equal(r1.sent, false);
  assert.ok(!JSON.stringify(r1).includes(body), 'werdykt nie cytuje sekretu');
  const r2 = await g.guardHelper('function add(a, b) { return a + b }\n', scanText, send);
  assert.equal(calls, 1);
  assert.equal(r2.sent, true);
});
