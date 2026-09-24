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

// --- bramka zgody (2.3.0) ---------------------------------------------------

// Wiersz zgody w ksztalcie, ktory ma realny ~/.claude/relai/USTAWIENIA.md:
// plik globalny NIE ma linii "Wersja RelAI" — marker wersji jest cecha projektu.
function ustawieniaGlobalne(wartosc, data) {
  const wiersz = wartosc === null
    ? ''
    : '| ' + (data || '2026-09-15') + ' | Zgoda na optymalizator | ' + wartosc + ' |\n';
  return '# USTAWIENIA — preferencje globalne\n\n'
    + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
    + '| 2026-08-09 | Jezyk pracy | Polski |\n'
    + wiersz;
}

test('zgodaGlobalna reads the consent row as a fact, with the date it was given', () => {
  assert.deepEqual(tryb.zgodaGlobalna(ustawieniaGlobalne('tak')),
    { tak: true, data: '2026-09-15', progDni: 30 });
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('nie')).tak, false);
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('yes')).tak, true);
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('cofnięta')).tak, false);
  // Prog przypomnienia jest CZLONEM tego samego wiersza — jak w rotacji i liscie modeli.
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('tak · przypomnienie co 7 dni')).progDni, 7);
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('tak · przypomnienie co 7 dni')).tak, true);
  // Kotwica spoza zamknietej listy i brak wiersza znacza to samo: zgody nie ma.
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('chyba tak')), null);
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne(null)), null);
  assert.equal(tryb.zgodaGlobalna(''), null);
  // Data nieczytelna nie uniewaznia zgody — gasi wylacznie przypomnienie.
  assert.equal(tryb.zgodaGlobalna(ustawieniaGlobalne('tak', 'wczoraj')).data, null);
});

test('zgodaSesji binds the decision to one session id and never leaks to the next', (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, '.claude', 'relai'), { recursive: true });
  const plik = path.join(root, '.claude', 'relai', 'zgoda-promptu.json');

  fs.writeFileSync(plik, JSON.stringify({ sesja: 'abc', decyzja: 'tak', data: '2026-09-15' }));
  assert.equal(tryb.zgodaSesji(root, 'abc'), true);
  // Inna sesja tego samego projektu zaczyna od zera — o to wlasnie chodzi w opcji
  // "tak, w tej sesji".
  assert.equal(tryb.zgodaSesji(root, 'xyz'), null);
  assert.equal(tryb.zgodaSesji(root, ''), null);

  fs.writeFileSync(plik, JSON.stringify({ sesja: 'abc', decyzja: 'nie' }));
  assert.equal(tryb.zgodaSesji(root, 'abc'), false);

  fs.writeFileSync(plik, '{ to nie jest json');
  assert.equal(tryb.zgodaSesji(root, 'abc'), null);
  fs.rmSync(plik);
  assert.equal(tryb.zgodaSesji(root, 'abc'), null);
});

test('two sessions writing alternately keep their own decisions (S01, 2.3.1)', (t) => {
  const root = fixture(t);
  const katalog = path.join(root, '.claude', 'relai', 'zgoda-promptu');
  // Dokladnie to, co regula bramki kaze modelowi: wlasny plik sesji, cudzych nie ruszac.
  const zapisz = (sesja, decyzja) => {
    fs.mkdirSync(katalog, { recursive: true });
    fs.writeFileSync(path.join(katalog, sesja + '.json'), JSON.stringify({ decyzja, data: '2026-09-24' }));
  };

  zapisz('A', 'nie');
  zapisz('B', 'tak');
  assert.equal(tryb.zgodaSesji(root, 'A'), false, 'zapis B wyparl decyzje A');
  assert.equal(tryb.zgodaSesji(root, 'B'), true);

  zapisz('A', 'tak');
  zapisz('B', 'nie');
  assert.equal(tryb.zgodaSesji(root, 'A'), true);
  assert.equal(tryb.zgodaSesji(root, 'B'), false);
  assert.equal(tryb.zgodaSesji(root, 'C'), null, 'trzecia sesja zaczyna od zera');
});

test('the 2.3.0 single-record file is still read, and the per-session file wins over it', (t) => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, '.claude', 'relai'), { recursive: true });
  const stary = path.join(root, '.claude', 'relai', 'zgoda-promptu.json');
  fs.writeFileSync(stary, JSON.stringify({ sesja: 'stara', decyzja: 'nie', data: '2026-09-15' }));

  assert.equal(tryb.zgodaSesji(root, 'stara'), false);
  assert.equal(tryb.zgodaSesji(root, 'nowa'), null);

  const katalog = path.join(root, '.claude', 'relai', 'zgoda-promptu');
  fs.mkdirSync(katalog, { recursive: true });
  fs.writeFileSync(path.join(katalog, 'stara.json'), JSON.stringify({ decyzja: 'tak', data: '2026-09-24' }));
  assert.equal(tryb.zgodaSesji(root, 'stara'), true, 'plik sesji ma pierwszenstwo przed starym rekordem');

  // Zepsuty plik sesji nie rzuca, a identyfikator, ktory wychodzi z katalogu, nie jest czytany.
  fs.writeFileSync(path.join(katalog, 'X.json'), '{ zepsuty');
  assert.equal(tryb.zgodaSesji(root, 'X'), null);
  fs.writeFileSync(path.join(root, '.claude', 'relai', 'wyjscie.json'), JSON.stringify({ decyzja: 'tak' }));
  assert.equal(tryb.zgodaSesji(root, '../wyjscie'), null);
  assert.equal(tryb.zgodaSesji(root, '__proto__'), null);
});

test('stanBramki: session decision wins over the standing consent in both directions', () => {
  const tak = { tak: true, data: '2026-09-15', progDni: 30 };
  const nie = { tak: false, data: '2026-09-15', progDni: 30 };

  assert.equal(tryb.stanBramki({ sesja: null, globalna: null }), 'pytaj');
  assert.equal(tryb.stanBramki({}), 'pytaj');
  assert.equal(tryb.stanBramki({ sesja: true, globalna: null }), 'dziala');
  assert.equal(tryb.stanBramki({ sesja: false, globalna: tak }), 'cisza');
  assert.equal(tryb.stanBramki({ sesja: true, globalna: nie }), 'dziala');
  assert.equal(tryb.stanBramki({ sesja: null, globalna: tak }), 'dziala');
  assert.equal(tryb.stanBramki({ sesja: null, globalna: nie }), 'cisza');
});

test('regulaBramki carries the three options, the session id and the place to write them', () => {
  const r = tryb.regulaBramki('sesja-42');
  assert.match(r, /sesja-42/);
  assert.match(r, /AskUserQuestion/);
  // Od 2.3.1 wlasny plik sesji: wspolny plik nadpisywala rownolegla sesja (S01).
  assert.match(r, /zgoda-promptu\/sesja-42\.json/);
  assert.match(r, /innych sesji nie ruszasz/);
  assert.match(r, /USTAWIENIA\.md/);
  assert.match(r, /relai-prompt/);
  assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(r), 'bramka ma byc w ASCII');
  // Bramka placi sie tylko do odpowiedzi, wiec moze byc dluzsza od reguly — ale nie
  // dowolnie: czlowiek czeka na swoj prompt, a nie na regulamin.
  assert.ok(r.length <= 1200, 'bramka urosla do ' + r.length + ' znakow');
});

test('przypomnienieZgodyReport speaks once past the threshold and stays silent otherwise', () => {
  const zg = (data, progDni) => ({ tak: true, data, progDni: progDni || 30 });
  assert.deepEqual(tryb.przypomnienieZgodyReport(zg('2026-09-01'), '2026-09-15'), []);
  assert.deepEqual(tryb.przypomnienieZgodyReport(zg('2026-08-16'), '2026-09-15'), []); // dokladnie 30
  const linie = tryb.przypomnienieZgodyReport(zg('2026-08-01'), '2026-09-15');
  assert.equal(linie.length, 1);
  assert.match(linie[0], /2026-08-01/);
  assert.match(linie[0], /relai-prompt off --globalnie/);
  assert.ok(!/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(linie[0]), 'przypomnienie ma byc w ASCII');
  // Zgoda cofnieta, zgoda bez daty, brak zgody i data z przyszlosci: zero znakow.
  assert.deepEqual(tryb.przypomnienieZgodyReport({ tak: false, data: '2026-01-01', progDni: 30 }, '2026-09-15'), []);
  assert.deepEqual(tryb.przypomnienieZgodyReport(zg(null), '2026-09-15'), []);
  assert.deepEqual(tryb.przypomnienieZgodyReport(null, '2026-09-15'), []);
  assert.deepEqual(tryb.przypomnienieZgodyReport(zg('2026-12-01'), '2026-09-15'), []);
});
