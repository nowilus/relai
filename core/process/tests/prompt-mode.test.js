'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const tryb = require('../prompt-mode.js');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-prompt-mode-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

// Wiersz ustawien w ksztalcie, ktory ma realny docs/USTAWIENIA.md: cztery komorki
// i naglowek tabeli nad nimi.
function ustawienia(wartosc, nazwa) {
  const wiersz = wartosc === null
    ? ''
    : '| 2026-09-15 | ' + (nazwa || 'Tryb ciagly') + ' | ' + wartosc + ' |\n';
  return '# USTAWIENIA\n\nWersja RelAI: 2.1.4\n\n'
    + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
    + '| 2026-09-14 | Model optymalizatora | Sonnet 5 |\n'
    + wiersz;
}

test('trybCiagly reads the switch as a fact: true, false or null for anything else', () => {
  assert.equal(tryb.trybCiagly(ustawienia('wlaczony')), true);
  assert.equal(tryb.trybCiagly(ustawienia('włączony')), true);
  assert.equal(tryb.trybCiagly(ustawienia('**włączony** — kazdy prompt wraca z propozycja')), true);
  assert.equal(tryb.trybCiagly(ustawienia('wyłączony')), false);
  assert.equal(tryb.trybCiagly(ustawienia('wylaczony')), false);
  // Wartosc spoza zamknietej listy i brak wiersza znacza to samo: nie wiadomo,
  // wiec adapter milczy. Tryb wlaczajacy sie z literowki bylby gorszy od jego braku.
  assert.equal(tryb.trybCiagly(ustawienia('czasami')), null);
  assert.equal(tryb.trybCiagly(ustawienia(null)), null);
  assert.equal(tryb.trybCiagly(''), null);
  // Wiersz wybierany po NIESIONEJ WARTOSCI, nie po kolejnosci: tabela zaczyna sie
  // od innego wiersza i to jego wartosc ("Sonnet 5") musi zostac pominieta.
  assert.equal(tryb.trybCiagly(ustawienia('wlaczony', 'Model optymalizatora')), null);
  // Kotwica dziala od POCZATKU komorki, wiec brzmienie angielskie tez przechodzi.
  assert.equal(tryb.trybCiagly(ustawienia('enabled', 'Continuous mode')), true);
});

test('trybCiaglyProjektu reads docs/USTAWIENIA.md and stays silent without it', (t) => {
  const root = fixture(t);
  assert.equal(tryb.trybCiaglyProjektu(root), null, 'brak katalogu docs = cisza');

  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'), ustawienia('włączony'), 'utf8');
  assert.equal(tryb.trybCiaglyProjektu(root), true);

  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'), ustawienia('wyłączony'), 'utf8');
  assert.equal(tryb.trybCiaglyProjektu(root), false);
});

test('trybCiaglyReport speaks only when the switch is on', () => {
  const on = tryb.trybCiaglyReport(true);
  assert.equal(on.length, 1);
  assert.match(on[0], /WLACZONY/);
  assert.match(on[0], /USTAWIENIA\.md/);
  // Zero znakow przy kazdej innej wartosci przelacznika — to jest cala poenta wylacznika.
  assert.deepEqual(tryb.trybCiaglyReport(false), []);
  assert.deepEqual(tryb.trybCiaglyReport(null), []);
});

test('powodPominiecia lets rituals through untouched', () => {
  const pomijane = [
    ['/relai-stage', 'wywolanie komendy'],
    ['/relai-prompt popraw to zdanie', 'wywolanie komendy'],
    ['kontynuujemy pracę', 'fraza sesji'],
    ['sprawdź status', 'fraza sesji'],
    ['kończymy na dziś', 'fraza sesji'],
    ['tak', 'krotkie potwierdzenie'],
    ['OK.', 'krotkie potwierdzenie'],
    ['co robi ta funkcja', 'pytanie'],
    ['dlaczego test pada na pustym mailu?', 'pytanie'],
    ['po co jest ten hook', 'pytanie'],
    ['', 'pusty prompt'],
    ['   ', 'pusty prompt'],
  ];
  for (const [prompt, powod] of pomijane) {
    assert.equal(tryb.powodPominiecia(prompt), powod, JSON.stringify(prompt));
    assert.equal(tryb.pomija(prompt), true, JSON.stringify(prompt));
  }
});

// Druga strona filtru i powod istnienia tego pliku: filtr rozszerzony o jeden
// przypadek za duzo POLYKA zdanie merytoryczne, a objawem jest cisza — prompt
// idzie prosto do wykonania i nikt nie widzi, ze tryb przestal dzialac (zasada 5:
// dokladasz przypadek, ktory MUSI trafic).
test('powodPominiecia must not swallow a real instruction', () => {
  const przerabiane = [
    'popraw walidacje w formularzu logowania bo sie sypie na pustym mailu',
    // Nazwa komendy w SRODKU zdania nie jest wywolaniem komendy.
    'popraw opis komendy /relai-stage w dokumentacji',
    // Fraza sesji w srodku zdania i ponad limitem dlugosci tez nie zwalnia z przerobki.
    'sprawdź status wszystkich planów i wypisz etapy zaległe razem z datami ich rozpoczęcia',
    // "po" i "na" zaczynaja zdania rozkazujace, nie tylko pytania.
    'po zmianie odpal testy rdzenia',
    'na razie zostaw ten plik w spokoju i przenies reszte',
    // Potwierdzenie rozpoznajemy po CALYM prompcie, nie po pierwszym slowie.
    'tak zmien ten limit na 20 i dopisz komentarz',
    'dobrze byloby przeniesc ten modul do rdzenia',
  ];
  for (const prompt of przerabiane) {
    assert.equal(tryb.powodPominiecia(prompt), null, JSON.stringify(prompt));
    assert.equal(tryb.pomija(prompt), false, JSON.stringify(prompt));
  }
});

test('regula carries the whole contract and costs what it was measured to cost', () => {
  const r = tryb.regula();
  assert.ok(r.length > 0, 'pusta regula znaczy tryb bez tresci');
  // Trzy zobowiazania reguly. Bez ktoregokolwiek tryb przestaje byc trybem:
  // pokazuje roznice i nie wykonuje niczego bez zgody.
  assert.match(r, /relai-prompt/);
  assert.match(r, /oryginal/i);
  assert.match(r, /zgod/i);
  // Bez polskich diakrytykow — jak pozostale komunikaty hookow (L-0016).
  assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(r), 'regula ma byc w ASCII');
  // Regula placi sie przy KAZDYM prompcie merytorycznym sesji: 245 znakow =
  // +110 tokenow wejscia (POMIAR_CLAUDE.md, E4). Prog trzyma ten koszt w ryzach.
  assert.ok(r.length <= 400, 'regula urosla do ' + r.length + ' znakow — przelicz koszt na ture');
});

test('normalizuj strips diacritics, case and trailing punctuation', () => {
  assert.equal(tryb.normalizuj('Kończymy na dziś!'), 'konczymy na dzis');
  assert.equal(tryb.normalizuj('  TAK.  '), 'tak');
  assert.equal(tryb.normalizuj('Co   robi   ta  funkcja?'), 'co robi ta funkcja');
});
