#!/usr/bin/env node
'use strict';
// RelAI rdzen: humanize-mode — ustawienia humanizacji (plan HUMANIZACJA, E2).
//
// Jeden wiersz `Humanizacja` czytany w trzech warstwach, jak progi limitu
// (threshold.js) i zgoda optymalizatora (prompt-mode.js): plik tej sesji
// .claude/relai/humanizacja/<id>.json → wiersz w docs/USTAWIENIA.md → wiersz
// w ~/.claude/relai/USTAWIENIA.md → brak (wywiad przy pierwszym /relai-humanize).
//
//   | 2026-10-14 | Humanizacja | włączona · zakresy: dokumenty, czat · pokaz: notka · profil: tak |
//
// Pierwsza warstwa, w ktorej wiersz JEST, rozstrzyga — takze wtedy, gdy jej stan
// jest nierozpoznany: literowka w projekcie daje cisze, a nie wlaczenie trybu
// z warstwy globalnej (zasada 7: nierozpoznane = cisza, nie zgadywanie).
//
// CLI zapisuje wiersz i plik sesji, bo narzedzie Write pod .claude/ harness
// odrzuca w `claude -p` i pyta o zgode w sesji interaktywnej (L-0185). Trzecia
// czynnosc to zapis profilu stylu z kontrola cytatow, sekretow i danych osobowych.
//
// Samowystarczalny (kopiowany do .claude/relai/tools/), bez zaleznosci, Node 14+.

const fs = require('fs');
const os = require('os');
const path = require('path');

const KATALOG_SESJI = '.claude/relai/humanizacja';
const ID_SESJI = /^[A-Za-z0-9_-]{1,128}$/;
const NAZWA = /^(?:Humanizacja|Humanization)$/i;
const WYCOFANE = /^#+\s.*(?:wycofane|withdrawn)/i;
const MARKER = /^(?:Wersja RelAI|RelAI version):/m;
const PLIKI_USTAWIEN = ['USTAWIENIA.md', 'SETTINGS.md'];

// Zamkniete listy brzmien: forma kanoniczna PL → [PL, EN]. Porownanie po zlozeniu
// ogonkow, wiec "zewnetrzne" z powloki bez UTF-8 jest tym samym co "zewnętrzne".
const STAN = { 'włączona': ['włączona', 'on'], 'wyłączona': ['wyłączona', 'off'] };
const STAN_INNE = { 'włączona': ['włączony', 'enabled'], 'wyłączona': ['wyłączony', 'disabled'] };
const ZAKRESY = { 'dokumenty': ['dokumenty', 'docs'], 'czat': ['czat', 'chat'], 'zewnętrzne': ['zewnętrzne', 'external'] };
const POKAZ = { 'notka': ['notka', 'note'], 'dwie wersje': ['dwie wersje', 'two versions'] };
const RODZAJE = { 'formalne': ['formalne', 'formal'], 'robocze': ['robocze', 'working'], 'czat': ['czat', 'chat'], 'zewnętrzne': ['zewnętrzne', 'external'] };
const TONY = { 'staranny': ['staranny', 'careful'], 'rzeczowy': ['rzeczowy', 'matter-of-fact'], 'swobodny': ['swobodny', 'casual'], 'wg odbiorcy': ['wg odbiorcy', 'by reader'] };
const RODZAJE_PROFILU = { 'czat': ['czat', 'chat'], 'wiadomości': ['wiadomości', 'messages'], 'robocze': ['robocze', 'working'], 'formalne': ['formalne', 'formal'] };
const TAK_NIE = { 'tak': ['tak', 'yes'], 'nie': ['nie', 'no'] };
const KLUCZE = {
  'zakresy': ['zakresy', 'scopes'], 'pokaz': ['pokaz', 'display'], 'ton': ['ton', 'tone'],
  'profil': ['profil', 'profile'], 'profil w': ['profil w', 'profile in'],
};
const BRAK = ['brak', 'none'];

const TON_WBUDOWANY = { 'formalne': 'staranny', 'robocze': 'rzeczowy', 'czat': 'swobodny', 'zewnętrzne': 'wg odbiorcy' };
const PROFIL_W_DOMYSLNIE = ['czat', 'wiadomości'];
const POKAZ_DOMYSLNIE = 'dwie wersje'; // wiersz bez czlonu niczego nie zmienia bez zgody

function zloz(s) {
  return String(s || '').normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Brzmienie → forma kanoniczna albo null.
function rozpoznaj(lista, brzmienie, dodatkowe) {
  const z = zloz(brzmienie);
  for (const [kanon, warianty] of Object.entries(lista)) {
    const wszystkie = warianty.concat((dodatkowe && dodatkowe[kanon]) || []);
    if (wszystkie.some((w) => zloz(w) === z)) return kanon;
  }
  return null;
}

function domyslne() {
  return { stan: 'wyłączona', zakresy: [], pokaz: POKAZ_DOMYSLNIE, ton: {}, profil: false, profilW: PROFIL_W_DOMYSLNIE.slice() };
}

// Lista po przecinku: rozpoznane elementy + nierozpoznane do `pominiete`.
function lista(tekst, slownik, pominiete, etykieta) {
  if (BRAK.includes(zloz(tekst))) return [];
  const wynik = [];
  for (const el of String(tekst).split(',').map((e) => e.trim()).filter(Boolean)) {
    const k = rozpoznaj(slownik, el);
    if (k === null) pominiete.push(etykieta + ': ' + el);
    else if (!wynik.includes(k)) wynik.push(k);
  }
  return wynik;
}

// Komorka Decyzja → wartosc albo null (stan nierozpoznany). Dalsze czlony z nieznanym
// kluczem albo wartoscia sa pomijane i wypisane w `pominiete` — nic nie jest zgadywane.
function parsuj(komorka) {
  const czlony = String(komorka || '').replace(/\*\*/g, '').split('·').map((c) => c.trim());
  const pierwszy = czlony[0].split(/\s+[—–-]\s+|[,;.]\s/)[0].trim();
  const stan = rozpoznaj(STAN, pierwszy, STAN_INNE);
  if (stan === null) return null;
  const w = { ...domyslne(), stan, pominiete: [] };
  for (const czlon of czlony.slice(1)) {
    const i = czlon.indexOf(':');
    const klucz = i < 0 ? null : rozpoznaj(KLUCZE, czlon.slice(0, i));
    const tresc = i < 0 ? '' : czlon.slice(i + 1).trim();
    if (klucz === 'zakresy') w.zakresy = lista(tresc, ZAKRESY, w.pominiete, 'zakresy');
    else if (klucz === 'pokaz') {
      const p = rozpoznaj(POKAZ, tresc);
      if (p) w.pokaz = p; else w.pominiete.push('pokaz: ' + tresc);
    } else if (klucz === 'ton') w.ton = tonZTekstu(tresc, w.pominiete);
    else if (klucz === 'profil') {
      const p = rozpoznaj(TAK_NIE, tresc);
      if (p) w.profil = p === 'tak'; else w.pominiete.push('profil: ' + tresc);
    } else if (klucz === 'profil w') w.profilW = lista(tresc, RODZAJE_PROFILU, w.pominiete, 'profil w');
    else if (czlon) w.pominiete.push(czlon);
  }
  return w;
}

function tonZTekstu(tekst, pominiete) {
  const ton = {};
  for (const para of String(tekst).split(',').map((e) => e.trim()).filter(Boolean)) {
    const [r, t] = para.split('=').map((e) => (e || '').trim());
    const rodzaj = rozpoznaj(RODZAJE, r);
    const wybor = rozpoznaj(TONY, t);
    if (rodzaj && wybor) { if (wybor !== TON_WBUDOWANY[rodzaj]) ton[rodzaj] = wybor; } else pominiete.push('ton: ' + para);
  }
  return ton;
}

// Ton pelny: przypisanie wbudowane z nadpisaniami z wiersza.
function tonPelny(w) {
  return { ...TON_WBUDOWANY, ...((w && w.ton) || {}) };
}

// Wartosc → komorka w jezyku pliku (0 = PL, 1 = EN). Ton tylko z odstepstwami.
function formatuj(w, en) {
  const j = en ? 1 : 0;
  const n = (slownik, k) => slownik[k][j];
  const l = (slownik, xs) => (xs.length ? xs.map((x) => n(slownik, x)).join(', ') : BRAK[j]);
  const czesci = [n(STAN, w.stan), n(KLUCZE, 'zakresy') + ': ' + l(ZAKRESY, w.zakresy), n(KLUCZE, 'pokaz') + ': ' + n(POKAZ, w.pokaz)];
  const ton = Object.keys(RODZAJE).filter((r) => w.ton[r] && w.ton[r] !== TON_WBUDOWANY[r]);
  if (ton.length) czesci.push(n(KLUCZE, 'ton') + ': ' + ton.map((r) => n(RODZAJE, r) + '=' + n(TONY, w.ton[r])).join(', '));
  czesci.push(n(KLUCZE, 'profil') + ': ' + n(TAK_NIE, w.profil ? 'tak' : 'nie'));
  if (w.profil) czesci.push(n(KLUCZE, 'profil w') + ': ' + l(RODZAJE_PROFILU, w.profilW));
  return czesci.join(' · ');
}

const BOM = String.fromCharCode(0xfeff);
const bezBom = (t) => (t.charCodeAt(0) === 0xfeff ? t.slice(1) : t);

function czytajSurowo(plik) {
  try { return fs.readFileSync(plik, 'utf8'); } catch (_) { return null; }
}

function czytaj(plik) {
  const t = czytajSurowo(plik);
  return t === null ? null : bezBom(t);
}

// Pierwszy wiersz `Humanizacja` nad sekcja wycofanych: { komorka, indeks } albo null.
function znajdzWiersz(txt) {
  const linie = String(txt || '').split('\n');
  for (let i = 0; i < linie.length; i++) {
    if (WYCOFANE.test(linie[i])) return null;
    if (!linie[i].trim().startsWith('|')) continue;
    const cells = linie[i].split('|').map((c) => c.trim());
    if (cells.length < 5 || !NAZWA.test(cells[2].replace(/\*\*/g, '').trim())) continue;
    return { komorka: cells[3], indeks: i };
  }
  return null;
}

function plikSesji(cwd, sesja) {
  if (!ID_SESJI.test(String(sesja || ''))) return null;
  return path.join(cwd || '.', ...KATALOG_SESJI.split('/'), String(sesja) + '.json');
}

function plikUstawien(katalog) {
  for (const n of PLIKI_USTAWIEN) {
    const p = path.join(katalog, n);
    if (fs.existsSync(p)) return p;
  }
  return path.join(katalog, PLIKI_USTAWIEN[0]);
}

const plikProjektu = (cwd) => plikUstawien(path.join(cwd || '.', 'docs'));
const plikGlobalny = (home) => plikUstawien(path.join(home || os.homedir(), '.claude', 'relai'));
const jestProjektemRelAI = (cwd) => MARKER.test(czytaj(plikProjektu(cwd)) || '');

// { value, source, plik, nierozpoznany } — source: 'sesja' | 'projekt' | 'globalnie' | 'brak'.
// opcje: { cwd, home, sesja }.
function ustawienia(opcje) {
  const o = opcje || {};
  const ps = plikSesji(o.cwd, o.sesja);
  const js = ps ? czytaj(ps) : null;
  if (js) {
    let komorka = null;
    try { komorka = JSON.parse(js).wartosc; } catch (_) { /* uszkodzony plik sesji nie rozstrzyga */ }
    if (typeof komorka === 'string') return wynik(parsuj(komorka), 'sesja', ps);
  }
  for (const [source, plik] of [['projekt', plikProjektu(o.cwd)], ['globalnie', plikGlobalny(o.home)]]) {
    const w = znajdzWiersz(czytaj(plik));
    if (w) return wynik(parsuj(w.komorka), source, plik);
  }
  return { value: null, source: 'brak', plik: null, nierozpoznany: false };
}

function wynik(value, source, plik) {
  return { value, source, plik, nierozpoznany: value === null };
}

function dzisiaj() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Tekst pliku ustawien z wierszem nadpisanym w miejscu albo dopisanym na koncu pierwszej
// tabeli nad sekcja wycofanych. Kazda inna linia zostaje bajt w bajt razem z wlasnym koncem
// (plik z mieszanymi CRLF i LF nie jest ujednolicany); nowa linia dostaje koniec sasiadki.
function wstawWiersz(txt, komorka, data, nazwaWiersza) {
  const czesci = txt.split(/(\r?\n)/); // [linia, koniec, linia, koniec, ..., ostatnia]
  const linie = czesci.filter((_, i) => i % 2 === 0);
  const koniecLinii = (i) => czesci[2 * i + 1] || (/\r\n/.test(txt) ? '\r\n' : '\n');
  const wiersz = '| ' + data + ' | ' + nazwaWiersza + ' | ' + komorka + ' |';
  const jest = znajdzWiersz(linie.join('\n'));
  if (jest) {
    czesci[2 * jest.indeks] = wiersz;
    return czesci.join('');
  }
  let wycofane = linie.findIndex((l) => WYCOFANE.test(l));
  if (wycofane < 0) wycofane = linie.length;
  const naglowek = linie.slice(0, wycofane).findIndex((l) => /^\|\s*(?:Data|Date)\s*\|/i.test(l.trim()));
  if (naglowek < 0) {
    // brak tabeli nad wycofanymi: nowa tabela przed ich naglowkiem albo na koncu pliku
    const e = koniecLinii(0);
    const tabela = ['| Data | Czego dotyczy | Decyzja |', '|---|---|---|', wiersz, ''].join(e) + e;
    if (wycofane < linie.length) {
      czesci.splice(2 * wycofane, 0, tabela.slice(0, -e.length), e);
      return czesci.join('');
    }
    const koniec = txt.length && !/\n$/.test(txt) ? e : '';
    return txt + koniec + e + tabela.slice(0, -e.length);
  }
  let ostatni = naglowek;
  while (ostatni + 1 < wycofane && linie[ostatni + 1].trim().startsWith('|')) ostatni++;
  const e = koniecLinii(ostatni);
  if (2 * ostatni + 1 >= czesci.length) return txt + e + wiersz; // tabela na koncu pliku bez EOL
  czesci.splice(2 * ostatni + 2, 0, wiersz, e);
  return czesci.join('');
}

const SZABLON_GLOBALNY = '# USTAWIENIA — preferencje globalne\n\nPreferencje użytkownika dziedziczone przez ' +
  'nowe projekty RelAI. Wpis w `docs/USTAWIENIA.md`\nprojektu nadpisuje wartość stąd.\n\n' +
  '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n';

// Zapis w wybranej warstwie. Zwraca { plik, komorka } albo rzuca Error z komunikatem PL.
function zapisz(zasieg, wartosc, opcje) {
  const o = opcje || {};
  const data = o.data || dzisiaj();
  if (zasieg === 'sesja') {
    const plik = plikSesji(o.cwd, o.sesja);
    if (!plik) throw new Error('brak identyfikatora sesji (zmienna CLAUDE_CODE_SESSION_ID albo --sesja)');
    const komorka = formatuj(wartosc, false);
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.writeFileSync(plik, JSON.stringify({ wartosc: komorka, data }) + '\n');
    return { plik, komorka };
  }
  let plik;
  if (zasieg === 'projekt') {
    plik = plikProjektu(o.cwd);
    // plik z wierszem juz rozstrzyga przy odczycie, wiec przelacz musi go moc przepisac
    if (!jestProjektemRelAI(o.cwd) && !znajdzWiersz(czytaj(plik))) {
      throw new Error('ten folder nie jest projektem RelAI — zasieg "projekt" niedostepny');
    }
  } else if (zasieg === 'globalnie') {
    plik = plikGlobalny(o.home);
  } else {
    throw new Error('nieznany zasieg: ' + zasieg + ' (sesja | projekt | globalnie)');
  }
  const en = path.basename(plik) === 'SETTINGS.md';
  const komorka = formatuj(wartosc, en);
  const surowy = czytajSurowo(plik);
  if (surowy === null) fs.mkdirSync(path.dirname(plik), { recursive: true });
  const bom = surowy !== null && surowy.charCodeAt(0) === 0xfeff ? BOM : '';
  const nowy = wstawWiersz(surowy === null ? SZABLON_GLOBALNY : bezBom(surowy), komorka, data, en ? 'Humanization' : 'Humanizacja');
  fs.writeFileSync(plik, bom + nowy);
  return { plik, komorka };
}

// --- profil stylu ------------------------------------------------------------------------
const DLUGOSC_CYTATU = 6;
const ROZSZERZENIA = /\.(?:txt|md|json|jsonl|log|csv)$/i;
const WZORCE_WRAZLIWE = [
  ['klucz API', /\b(?:sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}|sk_(?:test|live)_[A-Za-z0-9]{10,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|xox[abpr]-[A-Za-z0-9-]{10,})/],
  ['klucz prywatny', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['haslo w tekscie', /\b(?:password|passwd|haslo|hasło)\s*[:=]\s*\S{4,}/i],
  ['adres e-mail', /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/],
  ['klucz API', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{10,}|\bAIza[0-9A-Za-z_-]{35}/],
  ['numer telefonu', /(?:\+\d{2}[\s-]?)?\b\d{3}[\s-]\d{3}[\s-]\d{3}\b|\+\d{2}[\s-]?\d{9}\b|\b\d{2} \d{3} \d{2} \d{2}\b/],
  ['PESEL albo numer konta', /\b\d{11}\b|\b[A-Z]{2}\d{2}(?:\s?\d{4}){4,7}\b/],
];

// NFC przed podzialem: zrodlo w NFD (macOS) rozdzieliloby slowa na znaku laczacym.
function slowa(tekst) {
  return (String(tekst).normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
}

// Plik zrodla jako tekst ludzki. JSON i JSONL sa dekodowane, bo zapis z ucieczkami u-kodow
// (json.dumps) rozbija polskie slowa i cytat przeszedlby kontrole niezauwazony; z obiektu
// biore wylacznie napisy. Linia JSONL, ktora sie nie parsuje, idzie jako surowy tekst.
function napisy(v, wynik) {
  if (typeof v === 'string') wynik.push(v);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) napisy(x, wynik);
  return wynik;
}

function tekstZrodla(plik) {
  const t = czytaj(plik) || '';
  if (!/\.jsonl?$/i.test(plik)) return t;
  try { return napisy(JSON.parse(t), []).join('\n'); } catch (_) { /* moze JSONL */ }
  return t.split(/\r?\n/).map((l) => {
    try { return napisy(JSON.parse(l), []).join('\n'); } catch (_) { return l; }
  }).join('\n');
}

// Pliki zrodel; katalog przeszukiwany rekurencyjnie po ROZSZERZENIA, a plik wskazany wprost
// z innym rozszerzeniem to blad — cicho pominiety dalby kontrole na zerze materialu.
function plikiZrodel(zrodla) {
  const wynik = [];
  const dodaj = (p, wprost) => {
    const st = fs.statSync(p);
    if (st.isDirectory()) for (const n of fs.readdirSync(p)) dodaj(path.join(p, n), false);
    else if (ROZSZERZENIA.test(p)) wynik.push(p);
    else if (wprost) throw new Error('nieobslugiwany plik zrodla (txt, md, json, jsonl, log, csv): ' + p);
  };
  for (const z of zrodla) dodaj(z, true);
  return wynik;
}

// Ciagi DLUGOSC_CYTATU+ slow profilu obecne w zrodlach i trafienia wzorcow wrazliwych.
// zrodla — pliki albo katalogi; teksty — zrodla podane wprost (tekst wklejony w rozmowie).
function kontrolaProfilu(profil, zrodla, teksty) {
  const ngramy = new Set();
  const pliki = plikiZrodel(zrodla || []);
  let slowZrodel = 0;
  for (const tekst of pliki.map(tekstZrodla).concat(teksty || [])) {
    const s = slowa(tekst);
    slowZrodel += s.length;
    for (let i = 0; i + DLUGOSC_CYTATU <= s.length; i++) ngramy.add(s.slice(i, i + DLUGOSC_CYTATU).join(' '));
  }
  const p = slowa(profil);
  const cytaty = [];
  for (let i = 0; i + DLUGOSC_CYTATU <= p.length; i++) {
    const g = p.slice(i, i + DLUGOSC_CYTATU).join(' ');
    if (ngramy.has(g) && !cytaty.includes(g)) cytaty.push(g);
  }
  const wrazliwe = WZORCE_WRAZLIWE.filter(([, re]) => re.test(profil)).map(([nazwa]) => nazwa);
  return { plikow: pliki.length, slowZrodel, cytaty, wrazliwe };
}

// --- CLI ---------------------------------------------------------------------------------
function argumenty(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    const nastepny = argv[i + 1];
    const maWartosc = nastepny !== undefined && !nastepny.startsWith('--');
    if (t === '--zrodla') {
      a.zrodla = [];
      while (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) a.zrodla.push(argv[++i]);
    } else if (t.startsWith('--')) a[t.slice(2)] = maWartosc ? argv[++i] : true;
    else a._.push(t);
  }
  return a;
}

function wartoscZFlag(a, baza) {
  const w = { ...domyslne(), ...(baza || {}), pominiete: [] };
  if (a.stan !== undefined) w.stan = rozpoznaj(STAN, a.stan, STAN_INNE) || (w.pominiete.push('stan: ' + a.stan), w.stan);
  if (a.zakresy !== undefined) w.zakresy = lista(a.zakresy, ZAKRESY, w.pominiete, 'zakresy');
  if (a.pokaz !== undefined) w.pokaz = rozpoznaj(POKAZ, a.pokaz) || (w.pominiete.push('pokaz: ' + a.pokaz), w.pokaz);
  if (a.ton !== undefined) w.ton = tonZTekstu(a.ton, w.pominiete);
  if (a.profil !== undefined) {
    const p = rozpoznaj(TAK_NIE, a.profil);
    if (p) w.profil = p === 'tak'; else w.pominiete.push('profil: ' + a.profil);
  }
  if (a['profil-w'] !== undefined) w.profilW = lista(a['profil-w'], RODZAJE_PROFILU, w.pominiete, 'profil w');
  return w;
}

function plikProfilu(cwd, home) {
  const projektowy = path.join(cwd || '.', 'docs', 'zasoby', 'STYL.md');
  if (fs.existsSync(projektowy)) return projektowy;
  return path.join(home || os.homedir(), '.claude', 'relai', 'STYL.md');
}

// Kody wyjscia CLI: 0 gotowe, 1 kontrola profilu nie przeszla, 2 blad uzycia (nic nie zapisane),
// 3 "on" bez zakresow trybu ciaglego (komenda pyta i wola ponownie z --zakresy).
const FLAGI_Z_WARTOSCIA = ['zasieg', 'sesja', 'cwd', 'home', 'data', 'cel', 'stan', 'zakresy', 'pokaz', 'ton', 'profil', 'profil-w'];
const DATA_WIERSZA = /^\d{4}-\d{2}-\d{2}$/;

function cliZapisz(polecenie, a, o, pisz) {
  let zasieg = a.zasieg;
  let w;
  if (polecenie === 'przelacz') {
    const stan = rozpoznaj(STAN, a._[1] || '', STAN_INNE);
    if (!stan) { pisz({ blad: 'przelacz: on albo off' }); return 2; }
    const u = ustawienia(o);
    // wiersz nierozpoznany nie jest przepisywany z domyslnych: zgubilby profil, ton i zakresy
    if (u.nierozpoznany) { pisz({ blad: 'wiersz Humanizacja spoza listy w ' + u.plik + ' — popraw go przez "ustawienia"' }); return 2; }
    zasieg = u.source !== 'brak' ? u.source : (jestProjektemRelAI(o.cwd) ? 'projekt' : 'globalnie');
    w = wartoscZFlag({ ...a, stan }, u.value || undefined);
  } else {
    w = wartoscZFlag(a);
  }
  if (w.pominiete.length) { pisz({ blad: 'wartosci spoza listy', pominiete: w.pominiete }); return 2; }
  if (w.stan === 'włączona' && !w.zakresy.length) { pisz({ blad: 'brak zakresow trybu ciaglego', potrzebne: 'zakresy', zasieg }); return 3; }
  let wynikZapisu;
  try { wynikZapisu = zapisz(zasieg, w, o); } catch (e) { pisz({ blad: e.message }); return 2; }
  // Odpowiedz z wywiadu zapisana nizej niz plik TEJ sesji bylaby przez niego przyslonieta
  // do konca sesji (L-0187). Cudzych sesji nie dotykamy; przelacz pisze w warstwie, ktora
  // rozstrzyga, wiec tu nie wchodzi.
  const ps = polecenie === 'zapisz' && zasieg !== 'sesja' ? plikSesji(o.cwd, o.sesja) : null;
  let usunietoSesje;
  if (ps && fs.existsSync(ps)) { fs.unlinkSync(ps); usunietoSesje = ps; }
  pisz({ zasieg, ...wynikZapisu, usunietoSesje, rozstrzyga: ustawienia(o).source });
  return 0;
}

// Profil na stdin; przy --stdin-zrodlo najpierw zrodlo, linia separatora, potem profil.
function profilZeStdin(zeStdin) {
  const tresc = fs.readFileSync(0, 'utf8');
  if (!zeStdin) return { tresc, teksty: [] };
  const czesci = tresc.split(/^=====RELAI-PROFIL=====\r?$/m);
  if (czesci.length !== 2) throw new Error('stdin: zrodlo, linia =====RELAI-PROFIL=====, profil');
  return { tresc: czesci[1].replace(/^\r?\n/, ''), teksty: [czesci[0]] };
}

function cliProfil(a, o, pisz) {
  const zeStdin = a['stdin-zrodlo'] !== undefined;
  if (!zeStdin && (!a.zrodla || !a.zrodla.length)) { pisz({ blad: 'profil: --zrodla <plik albo katalog>... albo --stdin-zrodlo' }); return 2; }
  const globalny = path.join(o.home, '.claude', 'relai', 'STYL.md');
  const projektowy = path.join(o.cwd, 'docs', 'zasoby', 'STYL.md');
  const cel = path.resolve(a.cel || globalny);
  if (cel !== path.resolve(globalny) && cel !== path.resolve(projektowy)) {
    pisz({ blad: '--cel tylko ' + globalny + ' albo ' + projektowy }); return 2;
  }
  let wejscie;
  let k;
  try {
    wejscie = profilZeStdin(zeStdin);
    if (!wejscie.tresc.trim()) throw new Error('pusty profil na stdin');
    k = kontrolaProfilu(wejscie.tresc, a.zrodla, wejscie.teksty);
  } catch (e) { pisz({ blad: e.message }); return 2; }
  if (!k.plikow && !wejscie.teksty.length) { pisz({ blad: 'brak czytelnego zrodla — kontrola na zerze materialu nic nie dowodzi', ...k }); return 2; }
  if (k.cytaty.length || k.wrazliwe.length || a['tylko-kontrola'] !== undefined) {
    pisz({ zapisano: false, ...k, cytaty: k.cytaty.slice(0, 20) });
    return k.cytaty.length || k.wrazliwe.length ? 1 : 0;
  }
  const nadpisany = fs.existsSync(cel);
  fs.mkdirSync(path.dirname(cel), { recursive: true });
  fs.writeFileSync(cel, wejscie.tresc);
  const czytany = path.resolve(plikProfilu(o.cwd, o.home));
  pisz({ zapisano: true, cel, nadpisany, przyslania: czytany !== cel ? czytany : undefined, ...k });
  return 0;
}

function main(argv, wyjscie) {
  const a = argumenty(argv);
  const pisz = (obj) => wyjscie.write(JSON.stringify(obj, null, 2) + '\n');
  const bezWartosci = FLAGI_Z_WARTOSCIA.filter((f) => a[f] === true);
  if (bezWartosci.length) { pisz({ blad: 'flaga bez wartosci: --' + bezWartosci.join(', --') }); return 2; }
  if (a.data !== undefined && !DATA_WIERSZA.test(a.data)) { pisz({ blad: '--data w formacie RRRR-MM-DD' }); return 2; }
  const o = { cwd: a.cwd || process.cwd(), home: a.home || os.homedir(), sesja: a.sesja || process.env.CLAUDE_CODE_SESSION_ID || '', data: a.data };
  const polecenie = a._[0];
  if (polecenie === 'odczyt') {
    const u = ustawienia(o);
    const profil = plikProfilu(o.cwd, o.home);
    pisz({ ...u, ton: u.value ? tonPelny(u.value) : tonPelny(null), wywiad: u.source === 'brak',
      projektRelAI: jestProjektemRelAI(o.cwd), sesjaDostepna: Boolean(plikSesji(o.cwd, o.sesja)),
      profilPlik: profil, profilIstnieje: fs.existsSync(profil) });
    return 0;
  }
  if (polecenie === 'zapisz' || polecenie === 'przelacz') return cliZapisz(polecenie, a, o, pisz);
  if (polecenie === 'profil') return cliProfil(a, o, pisz);
  pisz({ blad: 'uzycie: odczyt | zapisz --zasieg sesja|projekt|globalnie [--stan --zakresy --pokaz --ton --profil --profil-w] | przelacz on|off [--zakresy] | profil --zrodla <...>|--stdin-zrodlo [--cel] [--tylko-kontrola] < profil' });
  return 2;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2), process.stdout);

module.exports = {
  parsuj, formatuj, ustawienia, zapisz, wstawWiersz, znajdzWiersz, tonPelny, plikSesji,
  kontrolaProfilu, main, TON_WBUDOWANY, PROFIL_W_DOMYSLNIE,
};
