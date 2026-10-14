'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const h = require('../humanize-mode.js');

const CLI = path.join(__dirname, '..', 'humanize-mode.js');
const DATA = '2026-10-14';

// Kazdy test sklada wlasne drzewo w katalogu tymczasowym: proj/ (projekt) i home/ (katalog
// domowy podstawiony, zasada 5 — scenariusz "pliku globalnego nie ma" bez dotykania prawdziwego).
function drzewo(opcje) {
  const o = opcje || {};
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-humanize-mode-'));
  const cwd = path.join(root, 'proj');
  const home = path.join(root, 'home');
  fs.mkdirSync(path.join(cwd, 'docs'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  if (o.projekt !== undefined) fs.writeFileSync(path.join(cwd, 'docs', 'USTAWIENIA.md'), o.projekt);
  if (o.globalnie !== undefined) {
    fs.mkdirSync(path.join(home, '.claude', 'relai'), { recursive: true });
    fs.writeFileSync(path.join(home, '.claude', 'relai', 'USTAWIENIA.md'), o.globalnie);
  }
  if (o.sesja !== undefined) {
    const dir = path.join(cwd, '.claude', 'relai', 'humanizacja');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, (o.idSesji || 's1') + '.json'), o.sesja);
  }
  return { root, cwd, home, sesja: 's1' };
}

const sprzataj = (t) => fs.rmSync(t.root, { recursive: true, force: true });

function ustawieniaProjektu(wiersz, opcje) {
  const o = opcje || {};
  return '# USTAWIENIA — test\n\nWersja RelAI: 3.0.0 · zainicjowano: 2026-08-07\n\nRejestr.\n\n' +
    '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-08-07 | Język projektu | Polski |\n' +
    (o.przed || '') + (wiersz ? '| 2026-10-01 | Humanizacja | ' + wiersz + ' |\n' : '') +
    '| 2026-09-15 | Tryb ciągły | włączony |\n' + (o.po || '') +
    '\n## Ustawienia wycofane\n\n| Data | Czego dotyczy | Decyzja | Zastąpione |\n|---|---|---|---|\n' + (o.wycofane || '');
}

function ustawieniaGlobalne(wiersz) {
  return '# USTAWIENIA — preferencje globalne\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n' +
    '| 2026-08-09 | Język pracy | Polski |\n' + (wiersz ? '| 2026-10-02 | Humanizacja | ' + wiersz + ' |\n' : '');
}

const sesjaJson = (wartosc) => JSON.stringify({ wartosc, data: DATA });
const suma = (txt) => crypto.createHash('sha256').update(txt).digest('hex');
const bezWiersza = (txt) => txt.split(/\r?\n/).filter((l) => !/\|\s*Humanizacja\s*\|/.test(l)).join('\n');
const ileWierszy = (txt) => txt.split(/\r?\n/).filter((l) => /\|\s*Humanizacja\s*\|/.test(l)).length;

const P = 'włączona · zakresy: dokumenty · pokaz: notka · profil: nie';
const G = 'włączona · zakresy: czat · pokaz: dwie wersje · profil: tak';
const S = 'wyłączona · zakresy: brak · pokaz: notka · profil: nie';

test('pierwszenstwo: kazda para warstw i kazda warstwa sama', () => {
  const przypadki = [
    [{ sesja: sesjaJson(S), projekt: ustawieniaProjektu(P), globalnie: ustawieniaGlobalne(G) }, 'sesja', 'wyłączona'],
    [{ sesja: sesjaJson(S), projekt: ustawieniaProjektu(P) }, 'sesja', 'wyłączona'],
    [{ sesja: sesjaJson(S), globalnie: ustawieniaGlobalne(G) }, 'sesja', 'wyłączona'],
    [{ projekt: ustawieniaProjektu(P), globalnie: ustawieniaGlobalne(G) }, 'projekt', 'włączona'],
    [{ projekt: ustawieniaProjektu(P) }, 'projekt', 'włączona'],
    [{ projekt: ustawieniaProjektu(null), globalnie: ustawieniaGlobalne(G) }, 'globalnie', 'włączona'],
  ];
  for (const [uklad, zrodlo, stan] of przypadki) {
    const t = drzewo(uklad);
    try {
      const u = h.ustawienia(t);
      assert.equal(u.source, zrodlo, JSON.stringify(Object.keys(uklad)));
      assert.equal(u.value.stan, stan);
    } finally { sprzataj(t); }
  }
  const t = drzewo({ projekt: ustawieniaProjektu(P), globalnie: ustawieniaGlobalne(G) });
  try {
    assert.deepEqual(h.ustawienia(t).value.zakresy, ['dokumenty'], 'projekt, nie globalny czat');
  } finally { sprzataj(t); }
});

test('brak wiersza w kazdej warstwie → source brak (wywiad); kontrola pozytywna w tym samym przebiegu', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null), globalnie: ustawieniaGlobalne(null) });
  try {
    assert.deepEqual(h.ustawienia(t), { value: null, source: 'brak', plik: null, nierozpoznany: false });
    fs.writeFileSync(path.join(t.cwd, 'docs', 'USTAWIENIA.md'), ustawieniaProjektu(P));
    assert.equal(h.ustawienia(t).source, 'projekt');
  } finally { sprzataj(t); }
});

test('stan spoza listy = cisza w tej warstwie, nie spadek do globalnej; kontrola pozytywna', () => {
  const t = drzewo({ projekt: ustawieniaProjektu('włonczona · zakresy: czat'), globalnie: ustawieniaGlobalne(G) });
  try {
    const u = h.ustawienia(t);
    assert.equal(u.source, 'projekt');
    assert.equal(u.value, null);
    assert.equal(u.nierozpoznany, true);
    fs.writeFileSync(path.join(t.cwd, 'docs', 'USTAWIENIA.md'), ustawieniaProjektu('włączona · zakresy: czat'));
    assert.equal(h.ustawienia(t).value.stan, 'włączona', 'to samo miejsce z poprawnym stanem rozstrzyga');
  } finally { sprzataj(t); }
});

test('element spoza listy pominiety i wypisany, reszta rozpoznana; brzmienia EN i bez ogonkow', () => {
  const w = h.parsuj('wlaczona · zakresy: zewnetrzne, foo, czat · pokaz: tabelka · ton: czat=rzeczowy, robocze=krzyczacy · kolor: zielony');
  assert.deepEqual(w.zakresy, ['zewnętrzne', 'czat']);
  assert.equal(w.pokaz, 'dwie wersje', 'pokaz spoza listy → domyslny, nie zgadniety');
  assert.deepEqual(w.ton, { czat: 'rzeczowy' });
  assert.deepEqual(w.pominiete, ['zakresy: foo', 'pokaz: tabelka', 'ton: robocze=krzyczacy', 'kolor: zielony']);
  const en = h.parsuj('on · scopes: docs, external · display: note · tone: formal=casual · profile: yes · profile in: messages');
  assert.deepEqual(en, { stan: 'włączona', zakresy: ['dokumenty', 'zewnętrzne'], pokaz: 'notka', ton: { formalne: 'swobodny' }, profil: true, profilW: ['wiadomości'], pominiete: [] });
  assert.equal(h.parsuj('włączonaa'), null);
  assert.equal(h.parsuj('włączona').stan, 'włączona', 'kontrola pozytywna');
});

test('ton: przypisanie wbudowane, nadpisanie tylko odstepstw, odstepstwo rowne wbudowanemu znika', () => {
  assert.deepEqual(h.tonPelny(h.parsuj('włączona')), h.TON_WBUDOWANY);
  const w = h.parsuj('włączona · ton: czat=staranny, formalne=staranny');
  assert.deepEqual(w.ton, { czat: 'staranny' });
  assert.equal(h.tonPelny(w).czat, 'staranny');
  assert.equal(h.tonPelny(w).robocze, 'rzeczowy');
  assert.match(h.formatuj(w, false), /ton: czat=staranny ·/);
  assert.doesNotMatch(h.formatuj(h.parsuj('włączona'), false), /ton:/);
});

test('formatuj → parsuj daje te sama wartosc (PL i EN)', () => {
  const w = h.parsuj('włączona · zakresy: dokumenty, czat, zewnętrzne · pokaz: notka · ton: zewnętrzne=rzeczowy · profil: tak · profil w: czat, formalne');
  for (const en of [false, true]) assert.deepEqual(h.parsuj(h.formatuj(w, en)), w);
});

test('wiersz pod naglowkiem wycofanych nie rozstrzyga; ten sam wiersz nad nim rozstrzyga', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null, { wycofane: '| 2026-10-01 | Humanizacja | ' + P + ' | tak |\n' }) });
  try {
    assert.equal(h.ustawienia(t).source, 'brak');
    fs.writeFileSync(path.join(t.cwd, 'docs', 'USTAWIENIA.md'), ustawieniaProjektu(P));
    assert.equal(h.ustawienia(t).source, 'projekt');
  } finally { sprzataj(t); }
});

test('nazwa wiersza to cala komorka: "Humanizacja tekstu" nie jest wierszem; **Humanizacja** jest', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null, { przed: '| 2026-10-01 | Humanizacja tekstu | ' + P + ' |\n' }) });
  try {
    assert.equal(h.ustawienia(t).source, 'brak');
    fs.writeFileSync(path.join(t.cwd, 'docs', 'USTAWIENIA.md'), ustawieniaProjektu(null, { przed: '| 2026-10-01 | **Humanizacja** | ' + P + ' |\n' }));
    assert.equal(h.ustawienia(t).source, 'projekt');
  } finally { sprzataj(t); }
});

test('plik sesji: inna sesja, zly identyfikator i uszkodzony JSON nie rozstrzygaja; wlasna sesja tak', () => {
  const inna = drzewo({ sesja: sesjaJson(S), idSesji: 's2', projekt: ustawieniaProjektu(P) });
  const uszkodzony = drzewo({ sesja: '{ to nie json', projekt: ustawieniaProjektu(P) });
  const wlasna = drzewo({ sesja: sesjaJson(S), projekt: ustawieniaProjektu(P) });
  try {
    assert.equal(h.ustawienia(inna).source, 'projekt');
    assert.equal(h.ustawienia({ ...wlasna, sesja: '../s1' }).source, 'projekt');
    assert.equal(h.plikSesji(wlasna.cwd, '../s1'), null);
    assert.equal(h.ustawienia(uszkodzony).source, 'projekt');
    assert.equal(h.ustawienia(wlasna).source, 'sesja');
  } finally { [inna, uszkodzony, wlasna].forEach(sprzataj); }
});

test('zapis w projekcie: nowy wiersz na koncu pierwszej tabeli, drugi zapis nadpisuje; reszta pliku bez zmian', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null, { po: '\n| 2026-10-08 | Plan X | osierocony wiersz |\n' }) });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  try {
    const przed = fs.readFileSync(plik, 'utf8');
    h.zapisz('projekt', h.parsuj(P), { ...t, data: DATA });
    const po1 = fs.readFileSync(plik, 'utf8');
    assert.equal(ileWierszy(po1), 1);
    assert.match(po1, /\| Tryb ciągły \| włączony \|\n\| 2026-10-14 \| Humanizacja \| włączona · zakresy: dokumenty/);
    assert.equal(suma(bezWiersza(po1)), suma(bezWiersza(przed)), 'reszta pliku: suma przed = po');
    h.zapisz('projekt', h.parsuj(S), { ...t, data: '2026-10-15' });
    const po2 = fs.readFileSync(plik, 'utf8');
    assert.equal(ileWierszy(po2), 1, 'nadpisany, nie zdublowany');
    assert.match(po2, /\| 2026-10-15 \| Humanizacja \| wyłączona/);
    assert.equal(suma(bezWiersza(po2)), suma(bezWiersza(przed)));
    assert.equal(h.ustawienia(t).value.stan, 'wyłączona');
  } finally { sprzataj(t); }
});

test('zapis zachowuje CRLF i nadpisuje wiersz w miejscu', () => {
  const crlf = ustawieniaProjektu(P).replace(/\n/g, '\r\n');
  const t = drzewo({ projekt: crlf });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  try {
    h.zapisz('projekt', h.parsuj(S), { ...t, data: DATA });
    const po = fs.readFileSync(plik, 'utf8');
    assert.equal(po.split('\r\n').length, crlf.split('\r\n').length);
    assert.equal(/[^\r]\n/.test(po), false, 'zadnego samotnego LF');
    assert.equal(suma(bezWiersza(po)), suma(bezWiersza(crlf)));
  } finally { sprzataj(t); }
});

test('zapis globalny bez pliku (podstawiony katalog domowy) tworzy plik z tabela; drugi zapis nie dubluje', () => {
  const t = drzewo({});
  const plik = path.join(t.home, '.claude', 'relai', 'USTAWIENIA.md');
  try {
    assert.equal(fs.existsSync(plik), false);
    h.zapisz('globalnie', h.parsuj(G), { ...t, data: DATA });
    const po = fs.readFileSync(plik, 'utf8');
    assert.match(po, /^# USTAWIENIA — preferencje globalne/);
    assert.match(po, /\| Data \| Czego dotyczy \| Decyzja \|\n\|---\|---\|---\|\n\| 2026-10-14 \| Humanizacja \| /);
    h.zapisz('globalnie', h.parsuj(S), { ...t, data: DATA });
    assert.equal(ileWierszy(fs.readFileSync(plik, 'utf8')), 1);
    assert.equal(h.ustawienia(t).source, 'globalnie');
  } finally { sprzataj(t); }
});

test('zapis w folderze bez RelAI: projekt odmawia, globalnie i sesja dzialaja', () => {
  const t = drzewo({ projekt: '# Notatki\n\nBez markera.\n' });
  try {
    assert.throws(() => h.zapisz('projekt', h.parsuj(P), t), /nie jest projektem RelAI/);
    assert.equal(fs.readFileSync(path.join(t.cwd, 'docs', 'USTAWIENIA.md'), 'utf8'), '# Notatki\n\nBez markera.\n');
    assert.throws(() => h.zapisz('sesja', h.parsuj(P), { ...t, sesja: '' }), /brak identyfikatora sesji/);
    h.zapisz('sesja', h.parsuj(P), { ...t, data: DATA });
    assert.equal(h.ustawienia(t).source, 'sesja');
    assert.throws(() => h.zapisz('wszedzie', h.parsuj(P), t), /nieznany zasieg/);
  } finally { sprzataj(t); }
});

function cli(argv, opcje) {
  const r = spawnSync(process.execPath, [CLI, ...argv], { input: (opcje && opcje.stdin) || '', encoding: 'utf8', env: { ...process.env, CLAUDE_CODE_SESSION_ID: (opcje && opcje.sesja) || '' } });
  return { kod: r.status, json: JSON.parse(r.stdout) };
}

test('CLI zapisz: wartosc spoza listy → kod 2 i plik nietkniety; poprawna → kod 0', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(P) });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  try {
    const przed = suma(fs.readFileSync(plik, 'utf8'));
    const zle = cli(['zapisz', '--zasieg', 'projekt', '--stan', 'wlaczona', '--zakresy', 'dokumenty,wszystko', '--cwd', t.cwd, '--home', t.home]);
    assert.equal(zle.kod, 2);
    assert.deepEqual(zle.json.pominiete, ['zakresy: wszystko']);
    assert.equal(suma(fs.readFileSync(plik, 'utf8')), przed);
    const ok = cli(['zapisz', '--zasieg', 'projekt', '--stan', 'wlaczona', '--zakresy', 'dokumenty,zewnetrzne', '--pokaz', 'notka', '--ton', 'czat=rzeczowy', '--profil', 'tak', '--profil-w', 'czat,wiadomosci', '--cwd', t.cwd, '--home', t.home, '--data', DATA]);
    assert.equal(ok.kod, 0);
    assert.equal(ok.json.komorka, 'włączona · zakresy: dokumenty, zewnętrzne · pokaz: notka · ton: czat=rzeczowy · profil: tak · profil w: czat, wiadomości');
  } finally { sprzataj(t); }
});

test('CLI odczyt: brak wiersza → wywiad; sesja dostepna z CLAUDE_CODE_SESSION_ID', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null) });
  try {
    const bez = cli(['odczyt', '--cwd', t.cwd, '--home', t.home]);
    assert.equal(bez.json.wywiad, true);
    assert.equal(bez.json.sesjaDostepna, false);
    assert.equal(bez.json.projektRelAI, true);
    assert.equal(bez.json.profilIstnieje, false);
    const z = cli(['odczyt', '--cwd', t.cwd, '--home', t.home], { sesja: 'abc-123' });
    assert.equal(z.json.sesjaDostepna, true);
  } finally { sprzataj(t); }
});

test('CLI przelacz: on/off zmienia tylko stan w warstwie rozstrzygajacej; on bez zakresow → kod 3', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(P), globalnie: ustawieniaGlobalne(G) });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  const glob = path.join(t.home, '.claude', 'relai', 'USTAWIENIA.md');
  try {
    const przed = fs.readFileSync(plik, 'utf8');
    const przedGlob = suma(fs.readFileSync(glob, 'utf8'));
    const off = cli(['przelacz', 'off', '--cwd', t.cwd, '--home', t.home, '--data', DATA]);
    assert.equal(off.kod, 0);
    assert.equal(off.json.zasieg, 'projekt');
    assert.equal(off.json.komorka, P.replace('włączona', 'wyłączona'));
    const po = fs.readFileSync(plik, 'utf8');
    assert.equal(suma(bezWiersza(po)), suma(bezWiersza(przed)));
    assert.equal(suma(fs.readFileSync(glob, 'utf8')), przedGlob, 'warstwa globalna nietknieta');
    assert.equal(cli(['przelacz', 'on', '--cwd', t.cwd, '--home', t.home]).json.komorka, P);
    fs.writeFileSync(plik, ustawieniaProjektu(S));
    const bezZakresow = cli(['przelacz', 'on', '--cwd', t.cwd, '--home', t.home]);
    assert.equal(bezZakresow.kod, 3);
    assert.equal(bezZakresow.json.potrzebne, 'zakresy');
    assert.equal(cli(['przelacz', 'on', '--zakresy', 'czat', '--cwd', t.cwd, '--home', t.home]).json.komorka, 'włączona · zakresy: czat · pokaz: notka · profil: nie');
    assert.equal(cli(['przelacz', 'moze', '--cwd', t.cwd, '--home', t.home]).kod, 2);
  } finally { sprzataj(t); }
});

test('CLI zapisz w projekcie po wywiadzie od nowa: plik TEJ sesji znika, cudzy zostaje; rozstrzyga projekt', () => {
  const t = drzewo({ sesja: sesjaJson(S), projekt: ustawieniaProjektu(null), globalnie: ustawieniaGlobalne(null) });
  const inna = path.join(t.cwd, '.claude', 'relai', 'humanizacja', 's2.json');
  fs.writeFileSync(inna, sesjaJson(S));
  const flagi = ['--stan', 'wylaczona', '--zakresy', 'brak', '--pokaz', 'notka', '--profil', 'nie', '--cwd', t.cwd, '--home', t.home];
  try {
    const projekt = cli(['zapisz', '--zasieg', 'projekt', ...flagi], { sesja: 's1' });
    assert.equal(projekt.kod, 0);
    assert.equal(projekt.json.rozstrzyga, 'projekt');
    assert.match(projekt.json.usunietoSesje, /s1\.json$/);
    assert.equal(fs.existsSync(path.join(t.cwd, '.claude', 'relai', 'humanizacja', 's1.json')), false);
    assert.equal(fs.existsSync(inna), true, 'plik innej sesji nietkniety');
    // zapis globalny przy wierszu projektowym: zapisany, ale rozstrzyga nadal projekt
    const glob = cli(['zapisz', '--zasieg', 'globalnie', ...flagi], { sesja: 's1' });
    assert.equal(glob.json.rozstrzyga, 'projekt');
    assert.equal(glob.json.usunietoSesje, undefined, 'nie bylo czego kasowac');
    // kontrola pozytywna: zapis do sesji rozstrzyga sesja i niczego nie kasuje
    const sesja = cli(['zapisz', '--zasieg', 'sesja', ...flagi], { sesja: 's1' });
    assert.equal(sesja.json.rozstrzyga, 'sesja');
    assert.equal(sesja.json.usunietoSesje, undefined);
  } finally { sprzataj(t); }
});

test('CLI przelacz bez zadnego wiersza: projekt RelAI → projekt; folder bez RelAI → globalnie', () => {
  const relai = drzewo({ projekt: ustawieniaProjektu(null) });
  const obcy = drzewo({});
  try {
    assert.equal(cli(['przelacz', 'off', '--cwd', relai.cwd, '--home', relai.home]).json.zasieg, 'projekt');
    assert.equal(cli(['przelacz', 'off', '--cwd', obcy.cwd, '--home', obcy.home]).json.zasieg, 'globalnie');
    assert.equal(fs.existsSync(path.join(obcy.home, '.claude', 'relai', 'USTAWIENIA.md')), true);
  } finally { [relai, obcy].forEach(sprzataj); }
});

test('CLI profil: cytat 6 slow zatrzymuje zapis, 5 slow nie; sekret zatrzymuje; czysty profil zapisany', () => {
  const t = drzewo({});
  const zrodlo = path.join(t.root, 'logi');
  fs.mkdirSync(zrodlo);
  fs.writeFileSync(path.join(zrodlo, 'dzien.txt'), 'No to słuchaj, robimy to tak żeby było szybko i bez kombinowania z tym wszystkim.');
  fs.writeFileSync(path.join(zrodlo, 'obraz.png'), 'robimy to tak żeby było szybko');
  const cel = path.join(t.home, '.claude', 'relai', 'STYL.md');
  const baza = '# Profil stylu\n\n- Zaczyna od „No to”.\n';
  try {
    const cytat = cli(['profil', '--zrodla', zrodlo, '--cel', cel, '--home', t.home], { stdin: baza + '- Mówi: robimy to tak, żeby było szybko.\n' });
    assert.equal(cytat.kod, 1);
    assert.deepEqual(cytat.json.cytaty, ['robimy to tak żeby było szybko']);
    assert.equal(cytat.json.plikow, 1, 'plik .png pominiety');
    assert.equal(fs.existsSync(cel), false);
    const piec = cli(['profil', '--zrodla', zrodlo, '--cel', cel, '--home', t.home, '--tylko-kontrola'], { stdin: baza + '- Mówi: robimy to tak, żeby.\n' });
    assert.equal(piec.kod, 0);
    assert.deepEqual(piec.json.cytaty, []);
    assert.equal(fs.existsSync(cel), false, '--tylko-kontrola nie zapisuje');
    const klucz = ['sk', 'ant', 'api03', 'A'.repeat(24)].join('-');
    const sekret = cli(['profil', '--zrodla', zrodlo, '--cel', cel, '--home', t.home], { stdin: baza + 'klucz ' + klucz + '\n' });
    assert.equal(sekret.kod, 1);
    assert.deepEqual(sekret.json.wrazliwe, ['klucz API']);
    const mail = cli(['profil', '--zrodla', zrodlo, '--cel', cel, '--home', t.home], { stdin: baza + 'pisze z ' + ['jan', 'firma.pl'].join('@') + '\n' });
    assert.deepEqual(mail.json.wrazliwe, ['adres e-mail']);
    const ok = cli(['profil', '--zrodla', zrodlo, '--cel', cel, '--home', t.home], { stdin: baza });
    assert.equal(ok.kod, 0);
    assert.equal(ok.json.zapisano, true);
    assert.equal(fs.readFileSync(cel, 'utf8'), baza);
  } finally { sprzataj(t); }
});

test('CLI profil --stdin-zrodlo: zrodlo i profil w jednym strumieniu; bez separatora kod 2', () => {
  const t = drzewo({});
  const cel = path.join(t.home, '.claude', 'relai', 'STYL.md');
  const zrodlo = 'Wklejony akapit: no więc działamy dalej i sprawdzamy wszystko po kolei.\n';
  try {
    const cytat = cli(['profil', '--stdin-zrodlo', '--cel', cel, '--home', t.home], { stdin: zrodlo + '=====RELAI-PROFIL=====\n- działamy dalej i sprawdzamy wszystko po kolei\n' });
    assert.equal(cytat.kod, 1);
    assert.deepEqual(cytat.json.cytaty, ['działamy dalej i sprawdzamy wszystko po', 'dalej i sprawdzamy wszystko po kolei']);
    const ok = cli(['profil', '--stdin-zrodlo', '--cel', cel, '--home', t.home], { stdin: zrodlo + '=====RELAI-PROFIL=====\n- krótkie zdania, często „no więc” na początku\n' });
    assert.equal(ok.kod, 0);
    assert.equal(fs.readFileSync(cel, 'utf8'), '- krótkie zdania, często „no więc” na początku\n');
    assert.equal(cli(['profil', '--stdin-zrodlo', '--cel', cel, '--home', t.home], { stdin: zrodlo }).kod, 2);
  } finally { sprzataj(t); }
});

// --- poprawki po recenzji kodu E2 ---------------------------------------------------------

const BOM = String.fromCharCode(0xfeff);
const BACKSLASH = String.fromCharCode(92);
// JSON.stringify nie ucieka polskich znakow; json.dumps (Python) domyslnie tak — skladamy to recznie
const ucieczki = (s) => Array.from(s).map((c) => (c.charCodeAt(0) > 127
  ? BACKSLASH + 'u' + c.charCodeAt(0).toString(16).padStart(4, '0') : c)).join('');

test('profil: zrodlo JSON i JSONL z ucieczkami u-kodow oraz zrodlo NFD daja te same slowa (recenzja M1)', () => {
  const t = drzewo({});
  const dir = path.join(t.root, 'logi');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'a.json'), ucieczki(JSON.stringify({ wpisy: [{ tekst: 'robimy to tak żeby było szybko' }] })));
  fs.writeFileSync(path.join(dir, 'b.jsonl'), ucieczki(JSON.stringify({ tekst: 'drugi wpis zupełnie inny od pierwszego' })) + '\n{ to nie json\n');
  fs.writeFileSync(path.join(dir, 'c.txt'), 'zdanie zapisane w formie rozłożonej przez system'.normalize('NFD'));
  try {
    assert.ok(fs.readFileSync(path.join(dir, 'a.json'), 'utf8').includes(BACKSLASH + 'u017c'), 'kontrola: plik naprawde ma ucieczki');
    const k = h.kontrolaProfilu('- mówi: robimy to tak żeby było szybko\n- cytat: drugi wpis zupełnie inny od pierwszego\n- zapisane w formie rozłożonej przez system', [dir]);
    assert.ok(k.cytaty.includes('robimy to tak żeby było szybko'), 'JSON z ucieczkami');
    assert.ok(k.cytaty.includes('drugi wpis zupełnie inny od pierwszego'), 'JSONL z ucieczkami, mimo zepsutej drugiej linii');
    assert.ok(k.cytaty.includes('zapisane w formie rozłożonej przez system'), 'NFD w zrodle trafia NFC w profilu');
    assert.equal(k.plikow, 3);
  } finally { sprzataj(t); }
});

test('profil: zero czytelnych zrodel albo jawnie wskazany plik bez obslugiwanego rozszerzenia → kod 2 (recenzja M2)', () => {
  const t = drzewo({});
  const pusty = path.join(t.root, 'pusty');
  fs.mkdirSync(pusty);
  fs.writeFileSync(path.join(pusty, 'notatki.docx'), 'binarne');
  try {
    assert.equal(cli(['profil', '--zrodla', pusty, '--home', t.home], { stdin: '- profil\n' }).kod, 2);
    assert.equal(cli(['profil', '--zrodla', path.join(pusty, 'notatki.docx'), '--home', t.home], { stdin: '- profil\n' }).kod, 2);
    assert.equal(fs.existsSync(path.join(t.home, '.claude', 'relai', 'STYL.md')), false);
    fs.writeFileSync(path.join(pusty, 'ok.md'), 'zwykly tekst zrodla');
    assert.equal(cli(['profil', '--zrodla', pusty, '--home', t.home], { stdin: '- profil\n' }).kod, 0, 'kontrola pozytywna');
  } finally { sprzataj(t); }
});

test('zapis zachowuje BOM i mieszane konce linii; zmienia sie wylacznie jedna linia (recenzja M3)', () => {
  const tresc = BOM + ustawieniaProjektu(P).split('\n').map((l, i) => l + (i % 2 ? '\r\n' : '\n')).join('');
  const t = drzewo({ projekt: tresc });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  try {
    h.zapisz('projekt', h.parsuj(S), { ...t, data: DATA });
    const po = fs.readFileSync(plik, 'utf8');
    assert.equal(po.charCodeAt(0), 0xfeff, 'BOM zostal');
    const linie = (s) => s.split(/(?<=\n)/);
    const a = linie(tresc);
    const b = linie(po);
    assert.equal(a.length, b.length);
    const rozne = a.map((l, i) => (l === b[i] ? null : i)).filter((i) => i !== null);
    assert.equal(rozne.length, 1, 'jedna zmieniona linia');
    assert.equal(a[rozne[0]].endsWith('\r\n'), b[rozne[0]].endsWith('\r\n'), 'koniec tej linii jak byl');
  } finally { sprzataj(t); }
});

test('jedyna tabela pod "Ustawienia wycofane": nowy wiersz trafia do tabeli nad naglowkiem i jest czytany (recenzja M4)', () => {
  const txt = '# USTAWIENIA\n\nWersja RelAI: 3.0.0\n\n## Ustawienia wycofane\n\n| Data | Czego dotyczy | Decyzja | Zastąpione |\n|---|---|---|---|\n| 2026-01-01 | X | y | z |\n';
  const po = h.wstawWiersz(txt, 'wyłączona', DATA, 'Humanizacja');
  assert.ok(h.znajdzWiersz(po), 'wiersz czytelny');
  assert.ok(po.indexOf('| 2026-10-14 | Humanizacja |') < po.indexOf('## Ustawienia wycofane'));
  assert.ok(po.includes('| 2026-01-01 | X | y | z |'), 'wycofane nietkniete');
  assert.equal(h.wstawWiersz(po, 'włączona', DATA, 'Humanizacja').split('| Humanizacja |').length, 2, 'drugi zapis nie dubluje');
});

test('profil --cel: tylko plik globalny albo docs/zasoby/STYL.md projektu; projektowy przyslania globalny (recenzja M5)', () => {
  const t = drzewo({ projekt: ustawieniaProjektu(null) });
  const zrodlo = path.join(t.root, 'z.md');
  fs.writeFileSync(zrodlo, 'tekst zrodla');
  const arg = (cel) => ['profil', '--zrodla', zrodlo, '--cwd', t.cwd, '--home', t.home].concat(cel ? ['--cel', cel] : []);
  try {
    assert.equal(cli(arg(path.join(t.root, 'gdzies', 'STYL.md')), { stdin: '- p\n' }).kod, 2);
    assert.equal(fs.existsSync(path.join(t.root, 'gdzies')), false);
    const projektowy = path.join(t.cwd, 'docs', 'zasoby', 'STYL.md');
    assert.equal(cli(arg(projektowy), { stdin: '- p\n' }).kod, 0);
    const glob = cli(arg(null), { stdin: '- g\n' });
    assert.equal(glob.kod, 0);
    assert.equal(glob.json.przyslania, projektowy, 'globalny zapisany, ale czytany bedzie projektowy');
  } finally { sprzataj(t); }
});

test('CLI: flaga bez wartosci, zla data, "zapisz on" bez zakresow, przelacz na wierszu nierozpoznanym (recenzja L6, L7, L11)', () => {
  const t = drzewo({ projekt: ustawieniaProjektu('włonczona · zakresy: czat · profil: tak') });
  const plik = path.join(t.cwd, 'docs', 'USTAWIENIA.md');
  const wspolne = ['--cwd', t.cwd, '--home', t.home];
  try {
    const przed = suma(fs.readFileSync(plik, 'utf8'));
    assert.equal(cli(['zapisz', '--zasieg', 'sesja', '--stan', 'off', '--sesja', ...wspolne]).kod, 2);
    assert.equal(fs.existsSync(path.join(t.cwd, '.claude', 'relai', 'humanizacja', 'true.json')), false);
    assert.equal(cli(['zapisz', '--zasieg', 'projekt', '--stan', 'off', '--data', '2026-10-14 | x', ...wspolne]).kod, 2);
    assert.equal(cli(['zapisz', '--zasieg', 'projekt', '--stan', 'on', ...wspolne]).kod, 3);
    assert.equal(cli(['przelacz', 'off', ...wspolne]).kod, 2, 'wiersz nierozpoznany nie jest przepisywany z domyslnych');
    assert.equal(suma(fs.readFileSync(plik, 'utf8')), przed, 'plik nietkniety po czterech odmowach');
    assert.equal(cli(['zapisz', '--zasieg', 'projekt', '--stan', 'off', ...wspolne]).kod, 0, 'kontrola pozytywna');
  } finally { sprzataj(t); }
});

test('zapis w projekcie z wierszem, ale bez markera RelAI: wiersz istnieje, wiec przelacz dziala (recenzja L9)', () => {
  const t = drzewo({ projekt: '# Ustawienia\n\n| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-10-01 | Humanizacja | ' + P + ' |\n' });
  try {
    assert.equal(h.ustawienia(t).source, 'projekt');
    assert.equal(cli(['przelacz', 'off', '--cwd', t.cwd, '--home', t.home]).kod, 0);
    assert.equal(h.ustawienia(t).value.stan, 'wyłączona');
  } finally { sprzataj(t); }
});

test('wzorce wrazliwe: telefon bez separatorow i z +48, JWT, klucz Google; zwykle liczby nie (recenzja L10)', () => {
  const traf = (s) => h.kontrolaProfilu(s, [], ['zrodlo']).wrazliwe;
  assert.deepEqual(traf('dzwoń +48 123456789'), ['numer telefonu']);
  assert.deepEqual(traf('dzwoń 22 123 45 67'), ['numer telefonu']);
  assert.deepEqual(traf('token ' + ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiIxIn0', 'abcdefghijklmnop'].join('.')), ['klucz API']);
  assert.deepEqual(traf('klucz AIza' + 'B'.repeat(35)), ['klucz API']);
  assert.deepEqual(traf('mediana 18 słów, 347 wpisów, 16 tys. słów, wersja 3.0.0, 2026-10-14'), []);
});
