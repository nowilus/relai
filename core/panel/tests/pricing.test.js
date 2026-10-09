'use strict';

// Cennik panelu RelAI (plan PANEL_CLAUDE, E3): datowany, ze zrodlem; rekord wyceniany modelem,
// ktory odpowiedzial; brak ceny slowami, nigdy zerem.

const assert = require('node:assert/strict');
const test = require('node:test');

const p = require('../pricing.mjs');

const rec = (over) => ({
  v: 1, tool: 'claude-code', session: 's', turn: 't', index: 0, agent: null, kind: 'step', model: 'claude-opus-5-5', at: 0,
  input: 0, cacheRead: 0, cacheWrite: 0, output: 0, missing: null, ...over,
});

test('the price list is dated and names its source', () => {
  assert.match(p.PRICING.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(p.PRICING.source.length > 10);
  assert.deepEqual(p.PRICING.models['claude-opus-5-5'], { input: 4, output: 20 }, 'plan PANEL_CLAUDE, sekcja 5, FAKT 2026-10-08');
  assert.equal(p.PRICING.readMult, 0.05);
  assert.deepEqual({ ...p.PRICING.writeMult }, { '1h': 2, '5m': 1.25 });
});

test('the four categories at their own rates; the cache write by the loop that made it', () => {
  const one = 1_000_000;
  const usd = (over) => p.priceRecord(rec(over)).usd.toFixed(6);
  assert.equal(usd({ input: one }), '4.000000');
  assert.equal(usd({ output: one }), '20.000000');
  assert.equal(usd({ cacheRead: one }), '0.200000');
  assert.equal(usd({ cacheWrite: one }), '8.000000', 'main loop: 1-hour cache, x2');
  assert.equal(usd({ cacheWrite: one, agent: 'a1' }), '5.000000', 'subagent: 5-minute cache, x1.25 (sonda E3)');
  assert.equal(usd({ cacheWrite: one, kind: 'compact' }), '5.000000', 'compaction: 5-minute cache too (sonda E3)');
});

test('the model is matched without a context-window suffix', () => {
  assert.equal(p.priceRecord(rec({ model: 'claude-opus-5-5[1m]', output: 1_000_000 })).usd.toFixed(6), '20.000000');
  assert.equal(p.modelPrice('claude-opus-5-5', p.PRICING).input, 4);
});

test('no price: words naming the model; no measurement: words, never zero', () => {
  const x = p.priceRecord(rec({ model: 'claude-haiku-4-5-20251001', output: 5 }));
  assert.equal(x.usd, null);
  assert.equal(x.missing, 'brak ceny dla claude-haiku-4-5-20251001');
  const y = p.priceRecord(rec({ model: null, output: 5 }));
  assert.equal(y.missing, 'brak ceny dla nieznanego modelu');
  const z = p.priceRecord(rec({ input: null, cacheRead: null, cacheWrite: null, output: null, missing: 'odpowiedź bez usage' }));
  assert.equal(z.usd, null);
  assert.equal(z.missing, 'odpowiedź bez usage');
});

// ---------- E6 (Aneks D): the pricing page, saved versions, the card ----------

const fs = require('node:fs');
const path = require('node:path');
const d = require('../decisions.mjs');

// The probe's read of the page (relai-probe-e6, 2026-10-09): two of its tables, as served
const PAGE = fs.readFileSync(path.join(__dirname, 'fixtures', 'cennik-anthropic-2026-10-09.html'), 'utf8');
const MODEL_TABLE = PAGE.slice(PAGE.indexOf('<h2>Model pricing</h2>'));

test('the page: the model table, not the batch table before it; every row accounted for', () => {
  const r = p.parsePricingPage(PAGE);
  assert.equal(r.reason, '');
  assert.deepEqual(r.counts, { models: 20, tiers: 1, headers: 2, sections: 1, rejected: 0 });
  assert.deepEqual(r.models['claude-opus-5-5'], { input: 4, output: 20, read: 0.2, write5m: 5, write1h: 8 });
  assert.deepEqual(r.models['claude-sonnet-5-5'], { input: 2, output: 10, read: 0.1, write5m: 2.5, write1h: 4 });
  assert.equal(r.models['claude-fable-5-1'].input, 10, 'the model table (batch says 5)');
  assert.deepEqual(r.models['claude-haiku-5-5'].over, { input: 0.5, output: 2.5, read: 0.05, write5m: 0.625, write1h: 1, above: 100000 });
  assert.ok(r.models['claude-opus-4-1'], 'a retired model whose name has no link and an icon after it');
});

test('a changed page is not read at all: nothing half-applied', () => {
  // The page writes a price as "$4<!-- --> <span>/ MTok</span>": the substitution must hit
  const lost = MODEL_TABLE.replace('$4<!-- -->', 'four dollars<!-- -->');
  assert.notEqual(lost, MODEL_TABLE);
  const a = p.parsePricingPage(lost);
  assert.equal(a.models, null);
  assert.match(a.reason, /^strona zmieniona: 1 wiersz nierozpoznany$/);
  assert.equal(a.counts.rejected, 1, 'the rejected rows are counted, not dropped silently');
  const renamed = MODEL_TABLE.replace('5m writes', '5-minute writes');
  assert.equal(p.parsePricingPage(renamed).reason, 'na stronie nie ma tabeli cen modeli');
  assert.equal(p.parsePricingPage(null).models, null);
  assert.equal(p.parsePricingPage('<html>Service unavailable</html>').models, null);
  const noTier = MODEL_TABLE.replace(/<tr>(?:(?!<tr>)[\s\S])*?for prompts over[\s\S]*?<\/tr>/, '');
  assert.notEqual(noTier, MODEL_TABLE);
  assert.match(p.parsePricingPage(noTier).reason, /claude-haiku-5-5/);
  // Positive control on the same material: the untouched table reads
  assert.equal(p.parsePricingPage(MODEL_TABLE).counts.models, 20);
});

test('a page name becomes a model id; any other shape does not', () => {
  assert.equal(p.modelId('Claude Opus 5.5'), 'claude-opus-5-5');
  assert.equal(p.modelId('Claude Opus 4'), 'claude-opus-4');
  assert.equal(p.modelId('Claude Opus 5.5 For long-running work'), null);
  assert.equal(p.modelId('GPT-6.1'), null);
});

test('rates a model carries: its own cache rates, a date suffix, the tier of a long prompt', () => {
  const page = p.parsePricingPage(PAGE).models;
  const list = { ...p.PRICING, models: page };
  const one = 1_000_000;
  assert.equal(p.priceRecord(rec({ model: 'claude-fable-5-1', cacheRead: one }), list).usd.toFixed(6), '0.250000', '0.025x, not the list multiplier');
  assert.equal(p.priceRecord(rec({ model: 'claude-haiku-4-5-20251001', output: one }), list).usd.toFixed(6), '5.000000');
  assert.equal(p.priceRecord(rec({ model: 'claude-haiku-5-5', input: 100_000 }), list).usd.toFixed(6), '0.010000', 'up to 100 000: the first tier');
  assert.equal(p.priceRecord(rec({ model: 'claude-haiku-5-5', input: 200_000 }), list).usd.toFixed(6), '0.100000', 'over: the second');
  assert.equal(p.priceRecord(rec({ model: 'claude-haiku-5-5', input: 1, cacheRead: 100_000, agent: 'a' }), list).parts.cacheRead.toFixed(6), '0.005000', 'the prompt counts the cache');
});

const v2 = (over) => ({ date: '2026-10-09', source: 'test', from: 1000, readMult: 0.05, writeMult: p.PRICING.writeMult, models: {}, ...over });

test('the price file: versions round-trip; a broken file prices with PRICING alone and says why', () => {
  const text = p.serializePriceFile([], { date: '2026-10-09', source: 'x', from: 5, models: { 'claude-sonnet-5-5': { input: 2, output: 10 } } });
  const back = p.parsePriceFile(text);
  assert.equal(back.error, '');
  assert.equal(back.versions.length, 1);
  assert.equal(back.versions[0].models['claude-sonnet-5-5'].input, 2);
  assert.deepEqual(p.parsePriceFile(null), { versions: [], error: '' });
  assert.match(p.parsePriceFile('{').error, /nie jest JSON-em/);
  assert.match(p.parsePriceFile('{"v":1,"versions":[{"date":"x","source":"s","from":1,"models":{}}]}').error, /złym kształcie/);
  assert.match(p.parsePriceFile('{"v":1,"versions":[{"date":"2026-10-09","source":"s","from":1,"models":{"m":{"input":-1,"output":1}}}]}').error, /złym kształcie/);
});

test('R6: a counted cost keeps its rates; a model no list knew takes the first that does', () => {
  const lists = p.priceLists([v2({ models: { 'claude-opus-5-5': { input: 5, output: 25 }, 'claude-sonnet-5-5': { input: 2, output: 10 } } })]);
  const one = 1_000_000;
  assert.equal(p.priceAt(rec({ at: 999, output: one }), lists).usd, 20, 'measured before the new version: the old rate');
  assert.equal(p.priceAt(rec({ at: 1000, output: one }), lists).usd, 25, 'from the new version on: the new rate');
  assert.equal(p.priceAt(rec({ at: 10, model: 'claude-sonnet-5-5', output: one }), lists).usd, 10, '"brak ceny" was no cost to keep');
  assert.equal(p.priceAt(rec({ at: 10, model: 'claude-haiku-5-5', output: one }), lists).missing, 'brak ceny dla claude-haiku-5-5');
  assert.equal(p.newest(lists).date, '2026-10-09');
  assert.equal(p.newest(lists).models['claude-opus-5-5'].input, 5);
});

test('models without a price: their names and record counts, the most first; no usage is not "no price"', () => {
  const lists = p.priceLists([]);
  const records = [
    ...[1, 2, 3, 4].map((i) => rec({ index: i, model: 'claude-sonnet-5-5', output: 1 })),
    rec({ index: 9, model: 'claude-haiku-5-5', output: 1 }),
    rec({ index: 8, model: 'claude-haiku-5-5', input: null, cacheRead: null, cacheWrite: null, output: null, missing: 'odpowiedź bez usage' }),
    rec({ index: 7 }),
  ];
  const u = p.unpricedModels(records, lists);
  assert.deepEqual(u, [{ model: 'claude-sonnet-5-5', records: 4 }, { model: 'claude-haiku-5-5', records: 1 }]);
  assert.equal(p.unpricedWords(u[0]), 'claude-sonnet-5-5 — 4 rekordy bez ceny');
  assert.equal(p.unpricedWords(u[1]), 'claude-haiku-5-5 — 1 rekord bez ceny');
  assert.deepEqual(p.unpricedModels(records, p.priceLists([v2({ models: p.parsePricingPage(PAGE).models })])), []);
});

test('the difference: new models, moved categories; equal rates by multiplier or by figure are no change', () => {
  const page = p.parsePricingPage(PAGE).models;
  const diff = p.diffModels(p.PRICING.models, page);
  assert.equal(diff.find((x) => x.model === 'claude-opus-5-5'), undefined, 'Opus 5.5: 4/20 and 0.05x, 2x, 1.25x = the page');
  const sonnet = diff.find((x) => x.model === 'claude-sonnet-5-5');
  assert.equal(sonnet.kind, 'nowy');
  assert.deepEqual(sonnet.changes.map((c) => [c.category, c.from, c.to]), [['wejście', null, 2], ['wyjście', null, 10], ['odczyt cache', null, 0.1], ['zapis cache 5 min', null, 2.5], ['zapis cache 1 h', null, 4]]);
  const moved = p.diffModels({ 'claude-opus-5-5': { input: 5, output: 20 } }, { 'claude-opus-5-5': page['claude-opus-5-5'] });
  assert.deepEqual(moved[0].changes.map((c) => c.category), ['wejście', 'odczyt cache', 'zapis cache 5 min', 'zapis cache 1 h']);
  assert.equal(moved[0].kind, 'zmieniony');
  assert.equal(diff.length, 19);
});

test('an old list: the threshold from USTAWIENIA, else 30 days; words only past it', () => {
  assert.equal(p.staleDays('| 2026-10-09 | Cennik panelu | ostrzeżenie po 45 dni |'), 45);
  assert.equal(p.staleDays('| 2026-10-09 | Inny wiersz | 45 dni |'), p.STALE_DAYS);
  assert.equal(p.staleDays(null), 30);
  assert.equal(p.staleWarning('2026-10-08', '2026-11-07', 30), '');
  assert.equal(p.staleWarning('2026-10-08', '2026-11-08', 30), 'cennik z 2026-10-08 ma 31 dni (próg 30) — kwoty mogą nie odpowiadać dzisiejszym cenom');
});

test('the card: nothing to run before the second "tak"; the read gives the difference and the one write', () => {
  const unpriced = [{ model: 'claude-sonnet-5-5', records: 4 }];
  const first = p.pricingCard('karta-cennik-1', { unpriced, date: '2026-10-08', warning: '' }).card;
  assert.equal(first.fetch, p.PRICING_PAGE);
  assert.deepEqual(first.actions, []);
  assert.ok(first.facts.some((f) => f.value === 'claude-sonnet-5-5 — 4 rekordy bez ceny'));
  assert.deepEqual(d.stepsToRun(first), [], 'open: nothing');
  const second = d.answer(first, 'tak');
  assert.equal(second.state, 'second');
  assert.deepEqual(d.stepsToRun(second), [], 'after the first "tak": nothing yet');
  const r = p.pricingSecond(second, { ok: true, status: 200, text: PAGE }, { versions: [], unpriced, now: 1234, today: '2026-10-09' });
  assert.equal(r.kind, 'card');
  const step = d.shown(r.card);
  assert.match(step.question, /^Zapisać cennik z 2026-10-09 \(19 modeli zmienionych\)\?$/);
  assert.ok(step.facts.some((f) => f.label === 'Nowy' && f.value.startsWith('claude-sonnet-5-5: wejście $2.00')));
  // Live, 2026-10-09: nineteen rows of rates buried the model the card was for. Full rates only
  // for a measured, unpriced or changed model; the other new ones as names in one row
  assert.deepEqual(step.facts.filter((f) => f.label === 'Nowy').map((f) => f.value.split(':')[0]), ['claude-sonnet-5-5']);
  const others = step.facts.find((f) => f.label === 'Inne nowe');
  assert.match(others.value, /^18 modeli spoza pomiarów: claude-fable-5, /);
  assert.ok(others.value.includes('claude-haiku-5-5'));
  const measured = p.pricingSecond(second, { ok: true, status: 200, text: PAGE }, { versions: [], unpriced, measured: ['claude-haiku-5-5', 'claude-opus-5-5[1m]'], now: 1, today: '2026-10-09' });
  const haiku = d.shown(measured.card).facts.find((f) => f.value.startsWith('claude-haiku-5-5:'));
  assert.match(haiku.value, /zapis cache 5 min \$0\.125,/, 'a rate is never rounded to what it is not');
  assert.deepEqual(d.stepsToRun(r.card), [], 'second step shown: still nothing');
  const done = d.answer(r.card, 'tak');
  const steps = d.stepsToRun(done);
  assert.equal(steps.length, 1);
  assert.equal(steps[0].kind, 'write');
  assert.equal(steps[0].path, p.PRICE_FILE);
  const saved = p.parsePriceFile(steps[0].text);
  assert.equal(saved.versions[0].from, 1234);
  assert.equal(saved.versions[0].models['claude-sonnet-5-5'].input, 2);
  assert.deepEqual(d.stepsToRun(d.answer(r.card, 'nie')), [], '"nie" on the second step writes nothing');
});

test('a rate as the page writes it: two places, more only where it has them', () => {
  assert.equal(p.rate(4), '$4.00');
  assert.equal(p.rate(0.1), '$0.10');
  assert.equal(p.rate(0.125), '$0.125');
  assert.equal(p.rate(0.625), '$0.625');
  assert.equal(p.rate(12.5), '$12.50');
  assert.equal(p.rate(null), '—');
});

test("the project's models: records and cost each, priced by their own list; without a price, partial", () => {
  const lists = p.priceLists([v2({ models: { 'claude-sonnet-5-5': { input: 2, output: 10 } } })]);
  const records = [
    rec({ index: 1, output: 1_000_000 }), rec({ index: 2, output: 1_000_000 }),
    ...[1, 2, 3, 4].map((i) => rec({ index: 10 + i, model: 'claude-sonnet-5-5', output: 60_000 })),
    rec({ index: 20, model: 'gpt-6-1', output: 5 }),
    rec({ index: 21, input: null, cacheRead: null, cacheWrite: null, output: null, missing: 'odpowiedź bez usage' }),
  ];
  const m = p.modelCosts(records, lists);
  assert.deepEqual(m.map((x) => [x.model, x.records, x.usd === null ? null : x.usd.toFixed(2), x.isPartial]),
    [['claude-sonnet-5-5', 4, '2.40', false], ['claude-opus-5-5', 2, '40.00', false], ['gpt-6-1', 1, null, true]]);
});

test('the card ends with words and no write: no network, an error status, a changed page, no change', () => {
  const second = d.answer(p.pricingCard('karta-cennik-2', { unpriced: [], date: '2026-10-08', warning: '' }).card, 'tak');
  const x = { versions: [], unpriced: [{ model: 'gpt-6-1', records: 2 }], now: 1, today: '2026-10-09' };
  assert.match(p.pricingSecond(second, { error: 'getaddrinfo ENOTFOUND' }, x).reason, /^brak odczytu strony cennika \(getaddrinfo ENOTFOUND\) — cennik nietknięty$/);
  assert.match(p.pricingSecond(second, { ok: false, status: 503, text: '' }, x).reason, /503 — cennik nietknięty$/);
  assert.match(p.pricingSecond(second, { ok: true, status: 200, text: '<p>nowa strona</p>' }, x).reason, /cennik nietknięty$/);
  const saved = p.parsePriceFile(p.serializePriceFile([], { date: '2026-10-09', source: 's', from: 1, models: p.parsePricingPage(PAGE).models })).versions;
  const same = p.pricingSecond(second, { ok: true, status: 200, text: PAGE }, { ...x, versions: saved });
  assert.match(same.reason, /^strona cennika bez zmian wobec cennika z 2026-10-09; nadal bez ceny: gpt-6-1 — modelu nie ma na stronie — nic do zapisu$/);
  assert.throws(() => d.makeCard({ id: 'karta-cennik-3', title: 't', facts: [], question: 'q', actions: [], fetch: 'https://x' }), /bez drugiego kroku/);
});
