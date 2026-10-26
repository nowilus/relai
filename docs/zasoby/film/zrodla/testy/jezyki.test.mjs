// "The two films differ only by the dictionary" (plan FILM_PREZENTACYJNY, section 4, variant A; E6).
// The English dictionary has exactly the keys of the Polish one — a key missing in EN would leave a
// Polish word in the English film or an empty place — and the product's own words are the same
// string in both (they stay as the product draws them; Annex D's command names are the one
// exception). The plural marker writes the right form for any count, in both languages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PL, EN, SLOWNIKI } from '../src/teksty.ts';
import { forma, wstaw } from '../src/fakty.ts';

/** Every path of a nested dictionary to a string, with the arrays' length as part of the shape. */
function sciezki(node, prefix = '') {
  if (typeof node === 'string') return [prefix];
  if (Array.isArray(node)) return [`${prefix}[${node.length}]`, ...node.flatMap((v, i) => sciezki(v, `${prefix}[${i}]`))];
  return Object.entries(node).flatMap(([k, v]) => sciezki(v, prefix ? `${prefix}.${k}` : k));
}

const checkParity = (a, b) => assert.deepEqual(sciezki(b).sort(), sciezki(a).sort());

test('EN has the keys of PL, no more and no less (arrays of the same length)', (t) => {
  checkParity(PL, EN);
  assert.deepEqual(Object.keys(SLOWNIKI).sort(), ['en', 'pl']);
  t.diagnostic(`paths: ${sciezki(PL).length} in each dictionary`);
  // positive controls: a copy of EN missing a key, with a key too many, with a caption too few
  const { tytul: _gone, ...pamiecBez } = EN.pamiec;
  assert.throws(() => checkParity(PL, { ...EN, pamiec: pamiecBez }));
  assert.throws(() => checkParity(PL, { ...EN, final: { ...EN.final, extra: 'x' } }));
  assert.throws(() => checkParity(PL, { ...EN, nowaSesja: { ...EN.nowaSesja, napisy: EN.nowaSesja.napisy.slice(1) } }));
});

/** The product's words: the same string in both films (section 4; Annex D excepts komendy.nazwy). */
const PRODUKT = Object.freeze([
  'panel.tytul', 'panel.zakladki', 'panel.otworz', 'panel.zamknij', 'panel.teraz', 'panel.mapa',
  'panel.dokumenty', 'panel.koszty', 'paski.etapy', 'paski.punkty', 'paski.nastepny', 'paski.wToku',
  'paski.wszystko', 'komendy.rekwizyty', 'nowaSesja.tak', 'nowaSesja.nie', 'pracaWraca.limit',
  'pracaWraca.gdzie',
]);
// final.wersja left the list in PIPELINE_WYDAN E4: "RelAI 3.0.0" was the product's name and number,
// the stamp "stan z wersji …" / "as of version …" is the film's own words, one per language
const at = (o, path) => path.split('.').reduce((n, k) => n?.[k], o);
const checkProdukt = (pl, en) => { for (const p of PRODUKT) assert.deepEqual(at(en, p), at(pl, p), p); };

/** Every string of a dictionary with its path ('a.b.0'). */
const liscie = (node, path = []) => (typeof node === 'string' ? [[path.join('.'), node]]
  : Object.entries(node).flatMap(([k, v]) => liscie(v, [...path, k])));
const jestProduktem = (p) => PRODUKT.some((q) => p === q || p.startsWith(`${q}.`));
/** The film's own words that EN leaves as they are in PL: each would be Polish in the English film. */
const nieprzetlumaczone = (pl, en) => liscie(pl).filter(([p, v]) => !jestProduktem(p) && at(en, p) === v).map(([p]) => p);

// words the same in both languages by nature, not left untranslated: the plan's word "plan:" and
// the version line, which holds only a marker after the product's name
const TAKIE_SAME = Object.freeze(['paski.postep.plan']);

test('the product\'s words are the same in both films; the film\'s own words are translated', (t) => {
  checkProdukt(PL, EN);
  assert.deepEqual(nieprzetlumaczone(PL, EN), [...TAKIE_SAME], 'film words left in Polish in EN');
  t.diagnostic(`product paths: ${PRODUKT.length}, the same in both; strings of the film: ${liscie(PL).filter(([p]) => !jestProduktem(p)).length}`);
  // positive controls: a product word translated, and a film word left in Polish, are caught
  assert.throws(() => checkProdukt(PL, { ...EN, nowaSesja: { ...EN.nowaSesja, tak: 'Yes' } }));
  const left = { ...EN, pamiec: { ...EN.pamiec, notatka: PL.pamiec.notatka } };
  assert.deepEqual(nieprzetlumaczone(PL, left), ['pamiec.notatka', ...TAKIE_SAME]);
});

test('plural forms: Polish one/few/many and English one/other, for any count', () => {
  const pl = ['komenda', 'komendy', 'komend'];
  const cases = [[0, 'komend'], [1, 'komenda'], [2, 'komendy'], [4, 'komendy'], [5, 'komend'], [11, 'komend'],
    [12, 'komend'], [14, 'komend'], [21, 'komend'], [22, 'komendy'], [24, 'komendy'], [112, 'komend'], [331, 'komend']];
  for (const [n, want] of cases) assert.equal(forma(n, pl, 'pl'), want, `pl ${n}`);
  for (const [n, want] of [[0, 'commands'], [1, 'command'], [2, 'commands'], [14, 'commands']]) assert.equal(forma(n, ['command', 'commands'], 'en'), want, `en ${n}`);
  // a marker with the wrong number of forms, a count that is not whole: errors, never a guess
  assert.throws(() => forma(2, ['a', 'b'], 'pl'), /needs 3 forms/);
  assert.throws(() => forma(2, ['a', 'b', 'c'], 'en'), /needs 2 forms/);
  assert.throws(() => forma(1.5, pl, 'pl'), /whole count/);
});

test('the markers write the noun form of the figure: "{komendy} komend" is right beyond 14', () => {
  const fakty = (n) => ({ komendy: { wartosc: n, zrodlo: 'test' }, narzedziaNazwy: { wartosc: ['A', 'B', 'C'], zrodlo: 'test' } });
  const caption = (s, n, j) => wstaw(s.panel.napisy[0], fakty(n), j);
  assert.equal(caption(PL, 14, 'pl'), 'Przycisk zamiast komendy — 14 komend w grupach.');
  assert.equal(caption(PL, 22, 'pl'), 'Przycisk zamiast komendy — 22 komendy w grupach.');
  assert.equal(caption(PL, 1, 'pl'), 'Przycisk zamiast komendy — 1 komenda w grupach.');
  assert.equal(caption(EN, 14, 'en'), 'A button instead of a command — 14 commands in groups.');
  assert.equal(caption(EN, 1, 'en'), 'A button instead of a command — 1 command in groups.');
  // a list is joined the way the language joins it
  assert.equal(wstaw(PL.final.napisy[0], fakty(14), 'pl'), 'Działa w A, B i C.');
  assert.equal(wstaw(EN.final.napisy[0], fakty(14), 'en'), 'Works in A, B and C.');
  // the plural marker needs a number: a list fact is an error
  assert.throws(() => wstaw('{narzedziaNazwy|a|b}', fakty(1), 'en'), /needs a number/);
});
