'use strict';

// Zakladka "Oszczednosci" (plan MODY_OSZCZEDZANIA, E2; ryzyko R6 — zawyzone oszczednosci):
// suma na fiksturze rejestru co do tokena, duplikat i zla linia jej nie zmieniaja, LEFT OUT poza
// suma i policzony osobno, koszt helperow odejmowany zawsze, brak ceny helpera = brak bilansu.
// Liczby oczekiwane sa policzone recznie z fikstury (komentarze przy asercjach), nie kodem modulu.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const L = require('../savings-ledger.mjs');
const V = require('../savings-view.mjs');
const P = require('../pricing.mjs');

const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixtures', 'savings-rejestr.jsonl'), 'utf8');
const HAIKU = { input: 0.1, output: 0.5 };
const LISTS = P.priceLists([{ date: '2026-10-09', source: 'test', from: 0, readMult: 0.05, writeMult: { '1h': 2, '5m': 1.25 }, models: { 'claude-haiku-5-5': HAIKU } }]);
const at = (filter, extra = {}) => ({ filter, session: 'sesja-a', isToday: (ts) => ts.startsWith('2026-11-11'), mainModel: 'claude-opus-5-5', lists: LISTS, ...extra });
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, `${a} != ${b}`);

test('fikstura: 6 rekordow po deduplikacji, jedna zla linia', () => {
  const { records, bad } = L.parse(FIXTURE);
  assert.equal(records.length, 6);
  assert.equal(bad, 1);
});

test('suma co do tokena w trzech filtrach (R6)', () => {
  const { records } = L.parse(FIXTURE);
  // czat A: 382 (649-267) + 1152 (1844-692) + 1544 (1844-300) = 3078
  const chat = V.savingsView(records, at('chat'));
  assert.equal(chat.saved, 3078);
  assert.equal(chat.records, 3);
  // dzis: czat A + 377 (640-263) z sesji B
  const today = V.savingsView(records, at('today'));
  assert.equal(today.saved, 3455);
  assert.equal(today.records, 4);
  // wszystko: + 600 (800-200) z 2026-11-10
  const all = V.savingsView(records, at('all'));
  assert.equal(all.saved, 4055);
  assert.equal(all.records, 5);
  assert.notEqual(chat.saved, today.saved, 'filtr zmienia liczby');
});

test('wycena: szacunek cena wejscia modelu glownego bez mnoznika cache, helper z usage', () => {
  const { records } = L.parse(FIXTURE);
  const v = V.savingsView(records, at('chat'));
  close(v.estimatedUsd, 3078 * 4 / 1e6); // Opus 5.5: 4 USD / 1M wejscia (PRICING)
  assert.equal(v.helper.calls, 1);
  assert.equal(v.helper.in, 2000);
  assert.equal(v.helper.out, 350);
  close(v.helper.usd, (2000 * 0.1 + 350 * 0.5) / 1e6);
  close(v.netUsd, 3078 * 4 / 1e6 - (2000 * 0.1 + 350 * 0.5) / 1e6);
  assert.equal(v.byMod.length, 2);
  assert.deepEqual(v.byMod.map((r) => [r.action, r.count, r.saved]), [['describe', 1, 1544], ['shrink', 2, 1534]]); // malejaco po oszczednosci
});

test('duplikat i zla linia nie zmieniaja sumy (obie strony)', () => {
  const lines = FIXTURE.split('\n');
  const clean = lines.filter((l, i) => i !== 2 && i !== 3).join('\n'); // bez duplikatu (linia 3) i zlej linii (4)
  const a = V.savingsView(L.parse(FIXTURE).records, at('all'));
  const b = V.savingsView(L.parse(clean).records, at('all'));
  assert.equal(a.saved, b.saved);
  // kontrola instrumentu: ten sam duplikat bez deduplikacji podnosi sume o 1152
  const naive = lines.filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const naiveSaved = V.savingsView(naive.map((r) => L.makeRecord(r)), at('all')).saved;
  assert.equal(naiveSaved, a.saved + 1152);
});

test('LEFT OUT poza suma i policzony osobno; rekord tuz pod progiem liczony', () => {
  const { records } = L.parse(FIXTURE);
  const v = V.savingsView(records, at('chat'));
  assert.equal(v.leftOut.count, 1);
  assert.equal(v.leftOut.saved, 599700);
  assert.ok(v.saved < 599700, 'odrzucony rekord nie wszedl do sumy');
  const base = { ts: '2026-11-11T11:00:00.000Z', session: 'sesja-a', mod: 'relai-browser', action: 'shrink' };
  const edge = [
    L.makeRecord({ ...base, tool_use_id: 'x1', before: 400000, after: 300 }), // > 100 000 i ciecie > 1000x -> LEFT OUT
    L.makeRecord({ ...base, tool_use_id: 'x2', before: 90000, after: 10 }), // pod 100 000 -> liczony
  ];
  const e = V.savingsView(edge, at('chat'));
  assert.equal(e.leftOut.count, 1);
  assert.equal(e.saved, 89990);
});

test('koszt helpera rekordu LEFT OUT nadal odejmowany', () => {
  const r = L.makeRecord({ ts: '2026-11-11T11:00:00.000Z', session: 'sesja-a', tool_use_id: 'y1', mod: 'relai-browser', action: 'describe', before: 600000, after: 300, measured: true, helper: { model: 'claude-haiku-5-5', in: 1000, out: 0 } });
  const v = V.savingsView([r], at('chat'));
  assert.equal(v.saved, 0);
  close(v.helper.usd, 1000 * 0.1 / 1e6);
  close(v.netUsd, -1000 * 0.1 / 1e6);
});

test('brak ceny helpera albo modelu glownego: bez bilansu, nigdy zawyzony', () => {
  const { records } = L.parse(FIXTURE);
  const noHaiku = V.savingsView(records, at('chat', { lists: P.priceLists([]) }));
  assert.equal(noHaiku.helper.unpriced, 1);
  assert.equal(noHaiku.netUsd, null);
  assert.ok(noHaiku.estimatedUsd > 0, 'szacunek nadal policzony');
  const noMain = V.savingsView(records, at('chat', { mainModel: 'model-nieznany' }));
  assert.equal(noMain.estimatedUsd, null);
  assert.equal(noMain.netUsd, null);
  assert.equal(noMain.saved, 3078, 'tokeny bez ceny zostaja');
});
