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

// Wycena routera (E10, spec sekcja 5 "Koszt"): te same tokeny subagenta wycenione na modelu
// sprzed routera (`from`) i na modelu, na ktorym naprawde pracowal (`subagent.model`); roznica
// to oszczednosc zmierzona. Sedzia jest helperem rekordu i odejmuje sie dokladnie raz.
const OPUS = { input: 5, output: 25 };
const SONNET = { input: 3, output: 15 };
const ROUTER_LISTS = P.priceLists([{ date: '2026-11-10', source: 'test', from: 0, readMult: 0.1, writeMult: { '1h': 2, '5m': 1.25 }, models: { 'claude-opus-4-1': { input: 15, output: 75 }, 'claude-opus-5-5': OPUS, 'claude-sonnet-5-5': SONNET, 'claude-haiku-5-5': HAIKU } }]);
// Rekord routera niesie cache subagenta osobno (Aneks E.8); bez podanego cache zero.
const withCache = (s) => (s && !('cacheRead' in s) ? { cacheRead: 0, cacheWrite: 0, ...s } : s);
const route = (extra) => ({ ts: '2026-11-11T12:00:00.000Z', session: 'sesja-a', mod: 'relai-model-router', tool_use_id: 'r1', part: '0', tool: 'Agent', measured: true, helper: { model: 'claude-haiku-5-5', in: 1000, out: 0 }, ...extra, ...(extra.subagent ? { subagent: withCache(extra.subagent) } : {}) });
const atRouter = (extra = {}) => at('all', { lists: ROUTER_LISTS, ...extra });

test('router: roznica modeli wyceniona na tokenach subagenta, sedzia odjety raz', () => {
  const r = route({ action: 'route-changed', from: 'opus', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 100_000 } });
  const v = V.savingsView([r], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  // opus 5.5 (nie 4.1): 1M x 5 + 0,1M x 25 = 7,5; haiku: 1M x 0,1 + 0,1M x 0,5 = 0,15; roznica 7,35
  assert.equal(v.router.calls, 1);
  assert.equal(v.router.unpriced, 0);
  close(v.router.usd, 7.35);
  // sedzia: 1000 x 0,1 / 1M = 0,0001 — tylko w helperach
  close(v.helper.usd, 0.0001);
  assert.equal(v.helper.calls, 1);
  // bilans: szacowane 0 + router 7,35 − helpery 0,0001
  close(v.netUsd, 7.35 - 0.0001);
});

test('router: pelny identyfikator modelu i podniesienie modelu (ujemna roznica)', () => {
  const full = route({ tool_use_id: 'r2', action: 'route-changed', from: 'claude-sonnet-5-5', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } });
  const up = route({ tool_use_id: 'r3', action: 'route-changed', from: 'haiku', to: 'opus', subagent: { model: 'claude-opus-5-5', in: 1_000_000, out: 0 } });
  const v = V.savingsView([full, up], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  // sonnet − haiku = 3 − 0,1 = 2,9; haiku − opus = 0,1 − 5 = −4,9; razem −2,0
  assert.equal(v.router.calls, 2);
  close(v.router.usd, 2.9 - 4.9);
});

test('router: route-kept, brak zuzycia subagenta i inne mody nie daja roznicy', () => {
  const kept = route({ tool_use_id: 'r4', action: 'route-kept', from: 'sonnet', to: 'sonnet', subagent: { model: 'claude-sonnet-5-5', in: 1_000_000, out: 0 } });
  const pending = route({ tool_use_id: 'r5', action: 'route-changed', from: 'opus', to: 'haiku' });
  const other = { ...route({ tool_use_id: 'r6', action: 'route-changed', from: 'opus', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } }), mod: 'relai-browser' };
  const v = V.savingsView([kept, pending, other], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  assert.equal(v.router.calls, 0);
  assert.equal(v.router.usd, 0);
  assert.equal(v.helper.calls, 3, 'sedziowie nadal odjeci');
});

test('router: model bez ceny — brak bilansu, nigdy zawyzony', () => {
  const r = route({ action: 'route-changed', from: 'fable', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } });
  const v = V.savingsView([r], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  assert.equal(v.router.calls, 1);
  assert.equal(v.router.unpriced, 1);
  assert.equal(v.router.usd, 0);
  assert.equal(v.netUsd, null);
});

test('router: model po stronie "po" to model z usage subagenta, nie alias z karty', () => {
  // karta mowila sonnet, ale subagent naprawde pracowal na haiku: wycena po usage
  const r = route({ tool_use_id: 'r7', action: 'route-changed', from: 'opus', to: 'sonnet', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } });
  const v = V.savingsView([r], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  // opus 5 − haiku 0,1 = 4,9 (nie opus − sonnet = 2)
  close(v.router.usd, 4.9);
});

test('router: alias wybiera wersje numerycznie najnowsza, takze z sufiksem [1m]', () => {
  // 4-10 jest nowsza niz 4-9, choc leksykalnie mniejsza; rodzina spoza domyslnego cennika
  // (priceLists dokleja PRICING, wiec "opus" trafilby w claude-opus-5-5)
  const lists = P.priceLists([{ date: '2026-11-10', source: 'test', from: 0, readMult: 0.1, writeMult: { '1h': 2, '5m': 1.25 }, models: { 'claude-testfam-4-9': { input: 9, output: 0 }, 'claude-testfam-4-10': { input: 4, output: 0 }, 'claude-haiku-5-5': HAIKU } }]);
  const r = route({ action: 'route-changed', from: 'testfam[1m]', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } });
  const v = V.savingsView([r], atRouter({ lists }));
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  assert.equal(v.router.unpriced, 0);
  // testfam 4-10: 4 − haiku 0,1 = 3,9 (nie 9 − 0,1)
  close(v.router.usd, 3.9);
});

test('router: identyfikator z data, model subagenta bez ceny i crew-part', () => {
  const dated = route({ tool_use_id: 'r8', part: 'crew-a', action: 'route-changed', from: 'claude-sonnet-5-5-20261001', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } });
  const v = V.savingsView([dated], atRouter());
  assert.equal(typeof v.router, 'object', 'widok niesie wycene routera');
  close(v.router.usd, 2.9);
  const unknownAfter = route({ tool_use_id: 'r9', action: 'route-changed', from: 'opus', to: 'haiku', subagent: { model: 'claude-nieznany-1-0', in: 1_000_000, out: 0 } });
  const u = V.savingsView([unknownAfter], atRouter());
  assert.equal(u.router.unpriced, 1);
  assert.equal(u.netUsd, null);
  const failed = route({ tool_use_id: 'r10', action: 'route-failed', from: 'opus', to: 'opus', subagent: { model: 'claude-opus-5-5', in: 1_000_000, out: 0 } });
  assert.equal(V.savingsView([failed], atRouter()).router.calls, 0);
});

test('router: odczyt i zapis cache subagenta po stawkach cache, nie po cenie wejscia (E10, Aneks E.8)', () => {
  // live E10: subagent ~300 tys. tokenow wejscia, prawie wszystko z cache — po cenie wejscia zysk 10x zawyzony
  const r = route({ action: 'route-changed', from: 'opus', to: 'haiku', subagent: { model: 'claude-haiku-5-5', in: 100_000, out: 0, cacheRead: 1_000_000, cacheWrite: 100_000 } });
  const v = V.savingsView([r], atRouter());
  assert.equal(v.router.unpriced, 0);
  // opus: 0,1M x 5 + 1M x 5 x 0,1 + 0,1M x 5 x 1,25 = 0,5 + 0,5 + 0,625 = 1,625
  // haiku: 0,1M x 0,1 + 1M x 0,1 x 0,1 + 0,1M x 0,1 x 1,25 = 0,01 + 0,01 + 0,0125 = 0,0325
  close(v.router.usd, 1.625 - 0.0325);
});

test('router: rekord bez podzialu cache (sprzed E.8) jest bez ceny — bilans brak, nigdy zawyzony', () => {
  const legacy = { ...route({ action: 'route-changed', from: 'opus', to: 'haiku' }), subagent: { model: 'claude-haiku-5-5', in: 1_000_000, out: 0 } };
  const v = V.savingsView([legacy], atRouter());
  assert.equal(v.router.calls, 1);
  assert.equal(v.router.unpriced, 1);
  assert.equal(v.router.usd, 0);
  assert.equal(v.netUsd, null);
});
