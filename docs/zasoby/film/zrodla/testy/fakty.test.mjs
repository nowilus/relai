// "A figure in the frame is a fact" (plan FILM_PREZENTACYJNY, section 1, goal 3; E2). The test
// gathers every text the film puts in a frame — the dictionary with its markers filled, the
// figures of the finale, the data of scene 2 — and fails on each figure that is in neither
// src/dane/manifest.json nor src/dane/paski.json. Since E3 also the data of scene 3
// (src/dane/panel.json) and the names it quotes from core/panel; since E4 the data of scenes 4
// and 5 (src/dane/sceny.json). The boards' lengths ("20 s") left with the boards in E4: they were
// the only figures the animatic took from scenariusz.ts. Two counters: a narrow one for
// digits and a wide one for numbers in words and percent signs. Each has its positive control,
// the wide one also a control against counting too much on material with no figures.
// Run after `npm run przygotuj` (npm test does not regenerate the files: that would test nothing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PL } from '../src/teksty.ts';
import { wstaw, tekstFaktu, znaczniki } from '../src/fakty.ts';
import { SCENY, dlugosc, odcinki } from '../src/scenariusz.ts';
import { manifest, fromRepo, dirLister, OUT as MANIFEST } from '../skrypty/manifest.mjs';
import { repoReader, OUT as PASKI } from '../skrypty/dane.mjs';
import { fromRepo as panelFromRepo, OUT as PANEL } from '../skrypty/panel.mjs';
import { fromRepo as scenyFromRepo, OUT as SCENY_DATA } from '../skrypty/sceny.mjs';
import { NAMES, GROUPS } from '../../../../../core/panel/theme.mjs';

const F = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const P = JSON.parse(readFileSync(PASKI, 'utf8'));
const PN = JSON.parse(readFileSync(PANEL, 'utf8'));
const SC = JSON.parse(readFileSync(SCENY_DATA, 'utf8'));
const FPS = 30;

// ---------- what the frame shows ----------

/** Every string of a nested object (the dictionary), in order. */
const strings = (node) => (typeof node === 'string' ? [node] : node && typeof node === 'object' ? Object.values(node).flatMap(strings) : []);

/** The values of every fact of a data file (wartosc leaves; zrodlo never reaches the frame). */
function values(node) {
  if (Array.isArray(node)) return node.flatMap(values);
  if (node && typeof node === 'object') {
    if ('wartosc' in node && 'zrodlo' in node) return values(node.wartosc);
    return Object.entries(node).filter(([k]) => k !== 'klucz' && k !== 'zrodlo').flatMap(([, v]) => values(v));
  }
  return typeof node === 'string' || typeof node === 'number' ? [String(node)] : [];
}

/** The texts the film writes itself: the dictionary filled, the finale, the figures it composes. */
function authoredTexts(pl, f) {
  const s4 = SC.nowaSesja;
  return [
    ...strings(pl).map((t) => wstaw(t, f)),
    ...Object.keys(pl.final.liczby).map((k) => tekstFaktu(f[k])),
    ...f.instalacja.wartosc,
    [P.plan.plan.wartosc, P.plan.etap.wartosc, P.plan.status.wartosc].join(' · '),
    // what scenes 4–6 put together from their facts: the bars' figures, the threshold's label
    `${P.plan.zamkniete.wartosc}/${P.plan.etapy.wartosc}`,
    `${s4.plan.wartosc.zamkniete}/${s4.plan.wartosc.etapy}`,
    `${pl.pracaWraca.prog} ${SC.pracaWraca.prog.wartosc} %`,
  ];
}

/**
 * The data of scene 2 but the names of the stage's verification points: the progress bar quotes
 * those word for word from the stage prompt (paski.test.mjs holds them to core/panel), so their
 * figures are a quotation, not facts the film may reuse elsewhere.
 */
const { punkty: _quoted, ...postep } = P.postep;
const P_FACTS = { ...P, postep };

/**
 * The data of scene 3 (E3) but the diff's lines: those quote STATUS.md as the screenshot shows it
 * (line numbers, dates, counts of another file), a quotation as the point names are.
 */
const { cytat: _diff, ...dokumenty } = PN.dokumenty;
const PN_FACTS = { ...PN, dokumenty };

/**
 * What scene 3 quotes from core/panel itself: the commands' Polish names and purposes and the
 * groups' headings. Held to digits and privacy like the rest; the wide counter stays on the film's
 * own words (a purpose such as "kilku agentów" is the product's wording, not the film's claim).
 */
const productTexts = () => [...Object.values(NAMES).flat(), ...GROUPS.map((g) => g.title)];

/** The data of scenes 4 and 5 (E4): facts only, nothing quoted. */
const SC_FACTS = SC;

/** Everything the film writes in a frame besides the quoted point names and diff lines. */
const frameTexts = (pl, f) => [...authoredTexts(pl, f), ...values(P_FACTS), ...values(PN_FACTS), ...values(SC_FACTS), ...productTexts()];

// ---------- the narrow counter: digits ----------

const NUMBER = /\d+(?:[.,]\d+)*/g;
const numbersIn = (t) => t.match(NUMBER) ?? [];
const allowed = new Set([...values(F), ...values(P_FACTS), ...values(PN_FACTS), ...values(SC_FACTS)].flatMap(numbersIn));

/** The figures of the texts that are not facts, with the text they stand in. */
const strays = (texts) => texts.flatMap((t) => numbersIn(t).filter((n) => !allowed.has(n)).map((n) => `${n} in "${t}"`));
const digitCount = (texts) => texts.reduce((s, t) => s + numbersIn(t).length, 0);

// ---------- the wide counter: numbers in words, percent signs ----------

// Polish numerals and vague quantities as whole words (closed list, L-0025); null = no exact value,
// always an error in the frame. A word is a run of letters of the Polish alphabet (zasada 7).
const WORDS = new Map([
  ['zero', 0], ['jeden', 1], ['jedna', 1], ['jedno', 1], ['dwa', 2], ['dwie', 2], ['dwóch', 2],
  ['trzy', 3], ['trzech', 3], ['cztery', 4], ['czterech', 4], ['pięć', 5], ['sześć', 6], ['siedem', 7],
  ['osiem', 8], ['dziewięć', 9], ['dziesięć', 10], ['jedenaście', 11], ['dwanaście', 12],
  ['trzynaście', 13], ['czternaście', 14], ['piętnaście', 15], ['dwadzieścia', 20], ['sto', 100],
  ['tysiąc', 1000], ['kilka', null], ['kilku', null], ['kilkanaście', null], ['kilkadziesiąt', null],
  ['dziesiątki', null], ['setki', null], ['tysiące', null], ['procent', null], ['procentów', null],
  ['połowa', null], ['pół', null], ['dwukrotnie', null], ['podwójnie', null],
]);
const WORD = /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+/g;

/** Every number word and percent sign of the texts; `bad` are those with no fact behind them. */
function wide(texts) {
  const hits = [];
  const bad = [];
  for (const t of texts) {
    for (const w of t.match(WORD) ?? []) {
      const key = w.toLowerCase();
      if (!WORDS.has(key)) continue;
      const v = WORDS.get(key);
      hits.push(`${w} in "${t}"`);
      if (v === null || !allowed.has(String(v))) bad.push(`${w} in "${t}"`);
    }
    const percents = (t.match(/%/g) ?? []).length;
    const tied = (t.match(/\d\s*%/g) ?? []).length;
    for (let i = 0; i < percents; i++) hits.push(`% in "${t}"`);
    if (percents !== tied) bad.push(`% without a figure in "${t}"`);
  }
  return { hits, bad };
}

// ---------- the tests ----------

test('scenariusz.ts holds the six scenes of the plan in order, and the film is their sum', () => {
  assert.deepEqual(SCENY.map((s) => s.id), ['pamiec', 'paski', 'panel', 'nowaSesja', 'pracaWraca', 'final']);
  const sum = SCENY.reduce((a, s) => a + s.sekundy, 0);
  assert.equal(dlugosc(FPS), sum * FPS);
  const parts = odcinki(FPS);
  parts.forEach((o, i) => assert.equal(o.od, i === 0 ? 0 : (parts[i - 1]?.od ?? 0) + (parts[i - 1]?.klatki ?? 0)));
  // positive control: one scene a second longer makes the film a second longer
  const longer = SCENY.map((s, i) => (i === 2 ? { ...s, sekundy: s.sekundy + 1 } : s));
  assert.equal(dlugosc(FPS, longer), (sum + 1) * FPS);
});

test('every fact of manifest.json carries a source', () => {
  const facts = Object.entries(F);
  assert.ok(facts.length > 0);
  for (const [k, f] of facts) {
    assert.deepEqual(Object.keys(f).sort(), ['wartosc', 'zrodlo'], k);
    assert.ok(typeof f.zrodlo === 'string' && f.zrodlo.trim() !== '', `${k} has no source`);
  }
});

test('manifest.json equals the manifest computed again from the repository (runs the core suite)', () => {
  assert.deepEqual(fromRepo(), F);
});

test('positive control: a changed copy of a source gives a changed fact', () => {
  const read = repoReader();
  const dirs = dirLister();
  const files = dirLister(undefined, false);
  const plugin = JSON.parse(read('.claude-plugin/plugin.json'));
  const other = plugin.version === '9.9.9' ? '9.9.8' : '9.9.9';
  const changed = manifest({
    readText: (p) => {
      if (p === '.claude-plugin/plugin.json') return JSON.stringify({ ...plugin, version: other });
      if (p === 'docs/archiwum/plany/KONTROLA_TESTU/STATUS.md') return '# STATUS\n\n[PLAN.md](PLAN.md) · **ZREALIZOWANY 2026-10-12**\n';
      return read(p);
    },
    listDirs: (p) => (p === 'docs/archiwum/plany' ? [...dirs(p), 'KONTROLA_TESTU'] : dirs(p)),
    listFiles: files,
    coreTests: () => F.testyRdzenia.wartosc,
  });
  assert.equal(changed.wersja.wartosc, other);
  assert.equal(changed.planyZamkniete.wartosc, F.planyZamkniete.wartosc + 1);
  assert.equal(changed.komendy.wartosc, F.komendy.wartosc);
  // and an archived plan without a closing status stops the script instead of being skipped
  assert.throws(() => manifest({
    readText: (p) => (p === 'docs/archiwum/plany/KONTROLA_TESTU/STATUS.md' ? '# STATUS\n\n**W TOKU**\n' : read(p)),
    listDirs: (p) => (p === 'docs/archiwum/plany' ? [...dirs(p), 'KONTROLA_TESTU'] : dirs(p)),
    listFiles: files,
    coreTests: () => 1,
  }), /without a closing status/);
});

test('every marker of the dictionary has a fact', () => {
  const used = [...new Set(strings(PL).flatMap(znaczniki))];
  assert.ok(used.length > 0, 'the dictionary uses markers');
  assert.deepEqual(used.filter((k) => !(k in F)), []);
  assert.throws(() => wstaw('{nieMa}', F), /no fact for the marker/);
});

test('panel.json equals the data computed again; each of its facts carries a source', () => {
  assert.deepEqual(panelFromRepo(), PN);
  let facts = 0;
  for (const [group, entries] of Object.entries(PN)) {
    for (const [k, f] of Object.entries(entries)) {
      assert.deepEqual(Object.keys(f).sort(), ['wartosc', 'zrodlo'], `${group}.${k}`);
      assert.ok(typeof f.zrodlo === 'string' && f.zrodlo.trim() !== '', `${group}.${k} has no source`);
      facts++;
    }
  }
  assert.ok(facts > 0);
});

test('sceny.json equals the data computed again; each of its facts carries a source', () => {
  assert.deepEqual(scenyFromRepo(), SC);
  let facts = 0;
  for (const [scene, entries] of Object.entries(SC)) {
    for (const [k, f] of Object.entries(entries)) {
      assert.deepEqual(Object.keys(f).sort(), ['wartosc', 'zrodlo'], `${scene}.${k}`);
      assert.ok(typeof f.zrodlo === 'string' && f.zrodlo.trim() !== '', `${scene}.${k} has no source`);
      facts++;
    }
  }
  assert.ok(facts > 0);
});

test('narrow counter: every figure in the frame is a fact; a planted figure fails', (t) => {
  // the planted values must not be facts already, or their controls test nothing (L-0173)
  for (const v of ['2500', '7']) assert.ok(!allowed.has(v), `${v} is already in the allowed set`);
  const texts = frameTexts(PL, F);
  assert.deepEqual(strays(texts), []);
  const dictionaryDigits = digitCount(strings(PL));
  assert.equal(dictionaryDigits, 0, 'the dictionary itself holds no digit');
  t.diagnostic(`narrow: ${digitCount(texts)} figures in ${texts.length} frame texts, all facts; dictionary digits ${dictionaryDigits}`);
  // positive control: the dictionary with one figure the manifest does not have
  const planted = { ...PL, panel: { ...PL.panel, napisy: [...PL.panel.napisy, 'Ponad 2500 użytkowników co tydzień.'] } };
  assert.deepEqual(strays(frameTexts(planted, F)), ['2500 in "Ponad 2500 użytkowników co tydzień."']);
});

test('wide counter: number words and percent signs stand for facts; it does not count too much', (t) => {
  const { hits, bad } = wide(authoredTexts(PL, F));
  assert.deepEqual(bad, []);
  t.diagnostic(`wide: ${hits.length} hits, all facts — ${hits.join('; ')}`);
  // positive control: a vague quantity and a percent with no figure are caught
  const caught = wide(['Mamy kilkanaście planów.', 'Oszczędzasz sporo % czasu.', 'Siedem narzędzi w pudełku.']);
  assert.deepEqual(caught.bad, ['kilkanaście in "Mamy kilkanaście planów."', '% without a figure in "Oszczędzasz sporo % czasu."', 'Siedem in "Siedem narzędzi w pudełku."']);
  // control against counting too much: words that look like numbers but are not
  const none = wide(['Trzymaj kurs, stoją dwory, pięknie się tu siedzi.', 'Setny raz? Nie — sedno, procesy i kilometry pracy.']);
  assert.deepEqual(none.hits, []);
});

// Three patterns of private data (risk 5 of the plan), kept in this file written with Write (L-0116).
const PRIVATE = Object.freeze({
  homePath: /(?:[A-Za-z]:[\\/]+Users[\\/]|\/Users\/|\/home\/)/,
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/,
  sessionId: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i,
});
const privateHits = (texts) => texts.flatMap((t) => Object.entries(PRIVATE).filter(([, re]) => re.test(t)).map(([k]) => `${k} in "${t}"`));

test('no home path, e-mail or session id in the frame or in the data files', () => {
  const texts = [...frameTexts(PL, F), ...strings(F), ...strings(P), ...strings(PN), ...strings(SC)];
  assert.deepEqual(privateHits(texts), []);
  // positive control: one planted line per pattern, each caught by its own pattern
  const planted = ['C:\\Users\\kto\\projekt', 'pisz na kto@example.com', 'sesja 475a19e0-e205-4319-8479-866bc33a0e1e'];
  assert.deepEqual(privateHits(planted).map((h) => h.split(' in ')[0]), ['homePath', 'email', 'sessionId']);
});
