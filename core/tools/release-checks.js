'use strict';
// RelAI core / narzedzie: kontrole zgodnosci wydania (plan PIPELINE_WYDAN, E1; "podbicie" — E2).
//
// Modul wolany przez release-check.js. Kazda kontrola dostaje kontekst (korzen drzewa, bazy,
// wersje, mape) i zwraca { id, nazwa, sprawdzono, licznik, bledy, ostrzezenia, info }.
// "sprawdzono" to liczba elementow, ktore kontrola realnie obejrzala — zero przy zbiorze, ktory
// nie moze byc pusty, jest bledem: kontrola, ktora nie znalazla, czego pilnuje, nie sprawdza.
// Kontrole tylko czytaja. Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

// --- pomocnicze --------------------------------------------------------------

const lf = (t) => String(t).replace(/\r\n?/g, '\n');

function czytaj(korzen, rel) {
  try { return lf(fs.readFileSync(path.join(korzen, rel), 'utf8')); } catch (_) { return null; }
}

function czytajJson(korzen, rel) {
  const t = czytaj(korzen, rel);
  if (t === null) return null;
  try { return JSON.parse(t); } catch (_) { return null; }
}

function wynik(id, nazwa) {
  return { id, nazwa, sprawdzono: 0, licznik: '', bledy: [], ostrzezenia: [], info: [] };
}

async function importuj(korzen, rel) {
  return import(pathToFileURL(path.join(korzen, rel)).href);
}

// Glob -> RegExp: '**/' dowolna liczba katalogow, '**' na koncu wszystko, '*' bez ukosnika.
function globNaRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, (m) => '\\' + m);
  }
  return new RegExp('^' + re + '$');
}

function pasuje(rel, globy) {
  return (globy || []).some((g) => globNaRegex(g).test(rel));
}

// --- liczebniki w prozie README ----------------------------------------------

// Formy mianownika i przypadkow zaleznych 1-20 i dziesiatek; zlozenie "dwadziescia dwa" sumowane.
const LICZEBNIKI = [
  [1, ['jeden', 'jedna', 'jedno', 'jednego', 'jednej']],
  [2, ['dwa', 'dwie', 'dwóch', 'dwoma', 'dwu']],
  [3, ['trzy', 'trzech', 'trzema']],
  [4, ['cztery', 'czterech', 'czterema']],
  [5, ['pięć', 'pięciu']],
  [6, ['sześć', 'sześciu']],
  [7, ['siedem', 'siedmiu']],
  [8, ['osiem', 'ośmiu']],
  [9, ['dziewięć', 'dziewięciu']],
  [10, ['dziesięć', 'dziesięciu']],
  [11, ['jedenaście', 'jedenastu']],
  [12, ['dwanaście', 'dwunastu']],
  [13, ['trzynaście', 'trzynastu']],
  [14, ['czternaście', 'czternastu']],
  [15, ['piętnaście', 'piętnastu']],
  [16, ['szesnaście', 'szesnastu']],
  [17, ['siedemnaście', 'siedemnastu']],
  [18, ['osiemnaście', 'osiemnastu']],
  [19, ['dziewiętnaście', 'dziewiętnastu']],
  [20, ['dwadzieścia', 'dwudziestu']],
  [30, ['trzydzieści', 'trzydziestu']],
];
const SLOWO_NA_LICZBE = new Map();
for (const [n, formy] of LICZEBNIKI) for (const f of formy) SLOWO_NA_LICZBE.set(f, n);

function tokeny(tekst) {
  return (String(tekst).toLowerCase().match(/[\p{L}]+|\d+/gu) || []);
}

// Wartosc liczebnika zaczynajacego sie na pozycji i (z sumowaniem dziesiatek i jednosci).
function liczbaNa(t, i) {
  if (/^\d+$/.test(t[i])) return Number(t[i]);
  const n = SLOWO_NA_LICZBE.get(t[i]);
  if (n === undefined) return null;
  if (n >= 20 && i + 1 < t.length) {
    const j = SLOWO_NA_LICZBE.get(t[i + 1]);
    if (j !== undefined && j < 10) return n + j;
  }
  return n;
}

// Liczby stojace najwyzej `odstep` tokenow przed slowem zaczynajacym sie od `rdzen`.
function liczbyPrzed(tekst, rdzen, odstep) {
  const t = tokeny(tekst);
  const znalezione = [];
  for (let i = 0; i < t.length; i++) {
    if (!(rdzen instanceof RegExp ? rdzen.test(t[i]) : t[i].startsWith(rdzen))) continue;
    for (let k = 1; k <= odstep && i - k >= 0; k++) {
      // Zlozenie "dwadziescia dwa": jednosc stoi bezposrednio przed slowem, dziesiatka przed nia.
      const p = i - k;
      const przed = p > 0 ? SLOWO_NA_LICZBE.get(t[p - 1]) : undefined;
      if (przed !== undefined && przed >= 20 && (SLOWO_NA_LICZBE.get(t[p]) || 99) < 10) {
        znalezione.push({ wartosc: przed + SLOWO_NA_LICZBE.get(t[p]), slowo: t[p - 1] + ' ' + t[p] + ' ' + t[i] });
        break;
      }
      const n = liczbaNa(t, p);
      if (n !== null) { znalezione.push({ wartosc: n, slowo: t[p] + ' ' + t[i] }); break; }
    }
  }
  return znalezione;
}

// Wszystkie liczby w tekscie (tokeny liczebnikow i cyfr).
function wszystkieLiczby(tekst) {
  const t = tokeny(tekst);
  const out = [];
  for (let i = 0; i < t.length; i++) {
    const n = liczbaNa(t, i);
    if (n === null) continue;
    out.push({ wartosc: n, slowo: t[i] });
    if (n >= 20 && n % 10 !== 0) i++;
  }
  return out;
}

// --- README ------------------------------------------------------------------

function sekcja(tekst, wzorNaglowka) {
  const linie = lf(tekst).split('\n');
  const start = linie.findIndex((l) => wzorNaglowka.test(l));
  if (start < 0) return null;
  let koniec = linie.findIndex((l, i) => i > start && /^## /.test(l));
  if (koniec < 0) koniec = linie.length;
  return linie.slice(start + 1, koniec);
}

// Wiersze tabeli pod naglowkiem kolumny `pierwszaKolumna` (bez naglowka i separatora).
function wierszeTabeli(linie, pierwszaKolumna) {
  const i = linie.findIndex((l) => l.startsWith('|') && l.split('|')[1] && l.split('|')[1].trim() === pierwszaKolumna);
  if (i < 0) return null;
  const out = [];
  for (let j = i + 2; j < linie.length && linie[j].startsWith('|'); j++) {
    out.push(linie[j].split('|').slice(1, -1).map((c) => c.trim()));
  }
  return out;
}

function komendyRepo(korzen) {
  try {
    return fs.readdirSync(path.join(korzen, 'adapters', 'claude-code', 'commands'))
      .filter((n) => n.endsWith('.md')).map((n) => n.slice(0, -3)).sort();
  } catch (_) { return []; }
}

function hookiRepo(korzen) {
  const t = czytaj(korzen, 'adapters/claude-code/hooks/hooks.json');
  if (t === null) return [];
  const nazwy = (t.match(/hooks\/([A-Za-z0-9_.-]+)\.js/g) || []).map((m) => m.replace(/^hooks\//, '').replace(/\.js$/, ''));
  return Array.from(new Set(nazwy)).sort();
}

function modyMarketplace(korzen) {
  const m = czytajJson(korzen, '.claude-plugin/marketplace.json');
  if (!m || !Array.isArray(m.plugins)) return [];
  return m.plugins.filter((p) => typeof p.source === 'string' && !/^\.\/?$/.test(p.source))
    .map((p) => {
      const dir = p.source.replace(/^\.\//, '').replace(/\/$/, '');
      const own = czytajJson(korzen, dir + '/.claude-plugin/plugin.json');
      return { nazwa: p.name, katalog: dir, wersja: own ? own.version : p.version };
    });
}

function kontrolaReadmeKomendy(ctx) {
  const w = wynik('readme-komendy', 'README: liczba komend w prozie');
  const komendy = komendyRepo(ctx.korzen);
  const readme = czytaj(ctx.korzen, 'README.md');
  if (!komendy.length) { w.bledy.push('nie znaleziono komend w adapters/claude-code/commands'); return w; }
  if (readme === null) { w.bledy.push('brak README.md'); return w; }
  // Caly README, takze tabele: wiersz relai-panel mowi "formularzami szesnastu komend". Tylko forma
  // "komend" (dopelniacz liczby mnogiej, liczby od 5): "dwie komendy w terminalu" z instalacji to
  // nie liczba komend RelAI (S1 planu: falszywa czerwien z prozy).
  const wzmianki = liczbyPrzed(readme, /^komend$/, 1);
  w.sprawdzono = wzmianki.length;
  for (const z of wzmianki) {
    if (z.wartosc !== komendy.length) w.bledy.push('README mowi "' + z.slowo + '" (' + z.wartosc + '), a komend w repo jest ' + komendy.length);
  }
  if (!wzmianki.length) w.bledy.push('README nie podaje liczby komend ani razu (szukane: liczebnik przed "komend")');
  w.licznik = 'wzmianek ' + wzmianki.length + ', komend w repo ' + komendy.length;
  return w;
}

function kontrolaReadmeHooki(ctx) {
  const w = wynik('readme-hooki', 'README: hooki w prozie i w tabeli');
  const hooki = hookiRepo(ctx.korzen);
  const readme = czytaj(ctx.korzen, 'README.md');
  if (!hooki.length) { w.bledy.push('nie znaleziono hookow w adapters/claude-code/hooks/hooks.json'); return w; }
  if (readme === null) { w.bledy.push('brak README.md'); return w; }
  const linie = sekcja(readme, /^## Co pilnuje tylko Claude Code/);
  if (!linie) { w.bledy.push('README nie ma sekcji "Co pilnuje tylko Claude Code"'); return w; }
  const wiersze = wierszeTabeli(linie, 'Hook Claude Code');
  if (!wiersze) { w.bledy.push('sekcja hookow nie ma tabeli z kolumna "Hook Claude Code"'); return w; }
  const wTabeli = wiersze.map((r) => (r[0].match(/`([^`]+)`/) || [null, r[0]])[1]);
  const brak = hooki.filter((h) => !wTabeli.includes(h));
  const obce = wTabeli.filter((h) => !hooki.includes(h));
  if (wTabeli.length !== hooki.length || brak.length || obce.length) {
    w.bledy.push('tabela hookow ma ' + wTabeli.length + ' wierszy przy ' + hooki.length + ' hookach w repo'
      + (brak.length ? '; brak wierszy: ' + brak.join(', ') : '') + (obce.length ? '; wiersze spoza repo: ' + obce.join(', ') : ''));
  }
  const proza = linie.filter((l) => !l.startsWith('|')).join('\n');
  // Pierwszy akapit pod naglowkiem ("Claude Code ma ich trzynascie"); dalsze akapity bez liczb hookow.
  const liczby = wszystkieLiczby(proza.trim().split('\n\n')[0]);
  for (const z of liczby) {
    if (z.wartosc !== hooki.length) w.bledy.push('proza sekcji hookow mowi "' + z.slowo + '" (' + z.wartosc + '), a hookow jest ' + hooki.length);
  }
  if (!liczby.length) w.bledy.push('proza sekcji hookow nie podaje liczby hookow');
  w.sprawdzono = hooki.length;
  w.licznik = 'hookow w repo ' + hooki.length + ', wierszy tabeli ' + wTabeli.length + ', liczb w prozie ' + liczby.length;
  return w;
}

function kontrolaReadmeMody(ctx) {
  const w = wynik('readme-mody', 'README: wiersze modow z biezacym numerem');
  const mody = modyMarketplace(ctx.korzen);
  const readme = czytaj(ctx.korzen, 'README.md');
  if (!mody.length) { w.bledy.push('marketplace nie ma ani jednego modu'); return w; }
  if (readme === null) { w.bledy.push('brak README.md'); return w; }
  const linie = sekcja(readme, /^## Panel w Claude Code/);
  if (!linie) { w.bledy.push('README nie ma sekcji "Panel w Claude Code"'); return w; }
  const wiersze = wierszeTabeli(linie, 'Plugin') || [];
  for (const m of mody) {
    const r = wiersze.find((x) => (x[0].match(/`([^`]+)`/) || [])[1] === m.nazwa);
    if (!r) { w.bledy.push('brak wiersza modu ' + m.nazwa); continue; }
    const numer = (r[0].match(/\((\d+\.\d+\.\d+)\)/) || [])[1];
    if (!numer) w.bledy.push('wiersz modu ' + m.nazwa + ' bez numeru (biezacy: ' + m.wersja + ')');
    else if (numer !== m.wersja) w.bledy.push('wiersz modu ' + m.nazwa + ' ma ' + numer + ', a plugin.json ' + m.wersja);
  }
  const proza = linie.filter((l) => !l.startsWith('|')).join('\n');
  const liczby = liczbyPrzed(proza, 'plugin', 2);
  for (const z of liczby) {
    if (z.wartosc !== mody.length) w.bledy.push('sekcja panelu mowi "' + z.slowo + '" (' + z.wartosc + '), a modow w marketplace jest ' + mody.length);
  }
  w.sprawdzono = mody.length;
  w.licznik = 'modow ' + mody.length + ', wierszy tabeli ' + wiersze.length + ', liczb w prozie ' + liczby.length;
  return w;
}

// --- history.md ----------------------------------------------------------------

function kontrolaHistoria(ctx) {
  const w = wynik('historia', 'history.md: wpis wydawanej wersji');
  const t = czytaj(ctx.korzen, 'adapters/claude-code/skills/relai-core/history.md');
  if (t === null) { w.bledy.push('brak adapters/claude-code/skills/relai-core/history.md'); return w; }
  const wpisy = (t.match(/^Wersja (\d+\.\d+\.\d+)/gm) || []).map((l) => l.slice(7));
  w.sprawdzono = wpisy.length;
  if (!wpisy.length) { w.bledy.push('history.md nie ma ani jednego wpisu "Wersja X.Y.Z"'); return w; }
  if (!wpisy.includes(ctx.wersja)) w.bledy.push('history.md nie ma wpisu "Wersja ' + ctx.wersja + '" (wersja z plugin.json)');
  w.licznik = 'wpisow ' + wpisy.length + ', szukany ' + ctx.wersja;
  return w;
}

// --- ARTEFAKTY.md (L-0161 jako kod) ----------------------------------------------

// Wiersze rejestru: { plik, wersja, data }; plik z backtickow kolumny "Plik" (druga).
function wierszeRejestru(tekst) {
  const out = [];
  for (const l of lf(tekst).split('\n')) {
    if (!l.startsWith('|') || /^\|\s*-/.test(l)) continue;
    const kol = l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    if (kol.length < 4 || kol[0] === 'Artefakt') continue;
    const sciezki = (kol[1].match(/`([^`]+)`/g) || []).map((s) => s.slice(1, -1)).filter((s) => /\//.test(s));
    for (const plik of sciezki) out.push({ plik, wersja: kol[2], data: kol[3] });
  }
  return out;
}

function kontrolaArtefakty(ctx) {
  const w = wynik('artefakty', 'ARTEFAKTY.md: zmieniony artefakt ma nowy wpis od bazy');
  const teraz = czytaj(ctx.korzen, 'docs/ARTEFAKTY.md');
  if (teraz === null) { w.bledy.push('brak docs/ARTEFAKTY.md'); return w; }
  const przed = ctx.pokazZBazy('docs/ARTEFAKTY.md');
  if (przed === null) { w.bledy.push('nie moge odczytac docs/ARTEFAKTY.md z bazy ' + ctx.baza.rdzen.ref); return w; }
  const rejestr = wierszeRejestru(teraz);
  const klucz = (r) => r.plik + '|' + r.wersja + '|' + r.data;
  const stare = new Set(wierszeRejestru(przed).map(klucz));
  const pliki = Array.from(new Set(rejestr.map((r) => r.plik)));
  w.sprawdzono = pliki.length;
  if (!pliki.length) { w.bledy.push('rejestr nie ma ani jednego wiersza ze sciezka pliku'); return w; }
  const zmienione = new Set(ctx.zmiany.filter((z) => z.status !== 'D').map((z) => z.plik));
  let dotkniete = 0;
  for (const p of pliki) {
    const trafia = p.includes('*') ? Array.from(zmienione).some((z) => globNaRegex(p).test(z)) : zmienione.has(p);
    if (!trafia) continue;
    dotkniete++;
    // Regula zamiast dat: wpis "nowszy niz baza" to wiersz pliku, ktorego rejestr z bazy nie mial.
    // Daty klamia w obie strony (data upstreamu kopii, wiersz z dnia tagu dopisany po tagu).
    const nowe = rejestr.filter((r) => r.plik === p && !stare.has(klucz(r)));
    if (!nowe.length) w.bledy.push('artefakt ' + p + ' zmieniony od ' + ctx.baza.rdzen.ref + ' bez nowego wpisu w ARTEFAKTY.md');
  }
  w.licznik = 'plikow rejestru ' + pliki.length + ', zmienionych od bazy ' + dotkniete + ', bez wpisu ' + w.bledy.length;
  return w;
}

// --- strona ----------------------------------------------------------------------

async function kontrolaStronaKomendy(ctx) {
  const w = wynik('strona-komendy', 'strona: kazda komenda ma nazwe PL i fiszke EN');
  const komendy = komendyRepo(ctx.korzen);
  if (!komendy.length) { w.bledy.push('nie znaleziono komend'); return w; }
  let names = null;
  try { names = (await importuj(ctx.korzen, 'core/panel/theme.mjs')).NAMES; } catch (e) {
    w.bledy.push('nie moge wczytac NAMES z core/panel/theme.mjs (' + e.message + ')');
  }
  const en = czytajJson(ctx.korzen, 'site/tresc/en.json');
  if (!en) w.bledy.push('nie moge odczytac site/tresc/en.json');
  const fiszki = (en && en.film && en.film.fiszki) || {};
  for (const k of komendy) {
    if (names && !(names[k] && names[k][0] && names[k][1])) w.bledy.push('komenda ' + k + ' bez nazwy PL w NAMES (core/panel/theme.mjs)');
    if (en && !(fiszki[k] && fiszki[k].tytul && fiszki[k].opis)) w.bledy.push('komenda ' + k + ' bez fiszki EN w site/tresc/en.json (film.fiszki)');
  }
  w.sprawdzono = komendy.length;
  w.licznik = 'komend ' + komendy.length + ', fiszek EN ' + Object.keys(fiszki).length;
  return w;
}

async function kontrolaStronaFakty(ctx) {
  const w = wynik('strona-fakty', 'strona: site/dane/fakty.json rowny faktom z repo');
  const zapisane = czytajJson(ctx.korzen, 'site/dane/fakty.json');
  if (!zapisane) { w.bledy.push('nie moge odczytac site/dane/fakty.json'); return w; }
  let fakty = null;
  try { fakty = await (await importuj(ctx.korzen, 'site/narzedzia/fakty.mjs')).collectFacts(ctx.korzen); } catch (e) {
    w.bledy.push('generator faktow strony przerwal: ' + e.message);
    return w;
  }
  const pola = Object.keys(fakty);
  w.sprawdzono = pola.length;
  for (const p of pola) {
    if (JSON.stringify(fakty[p]) !== JSON.stringify(zapisane[p])) w.bledy.push('fakty.json: pole "' + p + '" inne niz w repo (node site/narzedzia/fakty.mjs)');
  }
  w.licznik = 'pol faktow ' + pola.length + ', wersje: ' + Object.entries(fakty.wersje || {}).map((e) => e.join(' ')).join(', ');
  return w;
}

// --- film ------------------------------------------------------------------------

const FILM = 'docs/zasoby/film/zrodla';

function listaZBloku(tekst, otwarcie) {
  const i = tekst.indexOf(otwarcie);
  if (i < 0) return null;
  const koniec = tekst.indexOf(']', i);
  return (tekst.slice(i, koniec).match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1));
}

function cyklFilmu(korzen) {
  const t = czytaj(korzen, FILM + '/src/komendy.ts');
  return t === null ? null : listaZBloku(t, 'export const CYKL');
}

function manifestFilmu(korzen) {
  return czytajJson(korzen, FILM + '/src/dane/manifest.json');
}

function kontrolaFilmKomendy(ctx) {
  const w = wynik('film-komendy', 'film: komendy sceny (CYKL) i liczba komend rowne repo');
  const komendy = komendyRepo(ctx.korzen);
  const cykl = cyklFilmu(ctx.korzen);
  const man = manifestFilmu(ctx.korzen);
  if (!cykl || !cykl.length) { w.bledy.push('nie znaleziono CYKL w ' + FILM + '/src/komendy.ts'); return w; }
  const brak = komendy.filter((k) => !cykl.includes(k));
  const obce = cykl.filter((k) => !komendy.includes(k));
  if (brak.length) w.bledy.push('film nie pokazuje komend: ' + brak.join(', ') + ' (CYKL ma ' + cykl.length + ' przy ' + komendy.length + ' w repo)');
  if (obce.length) w.bledy.push('film pokazuje komendy spoza repo: ' + obce.join(', '));
  const wMan = man && man.komendy && man.komendy.wartosc;
  if (wMan !== komendy.length) w.bledy.push('manifest filmu: komendy = ' + wMan + ', w repo ' + komendy.length);
  w.sprawdzono = komendy.length;
  w.licznik = 'komend w repo ' + komendy.length + ', w CYKL ' + cykl.length + ', w manifescie ' + wMan;
  w.info.push('liczniki pominiete jawnie (stan z wersji filmu): ' + ctx.mapa.film.liczniki.join(', ')
    + '; poza kategoria E1: ' + ctx.mapa.film['poza-kategoria'].join(', '));
  return w;
}

function kontrolaFilmRekwizyty(ctx) {
  const w = wynik('film-rekwizyty', 'film: plik rekwizytu na kazda komende z CYKL');
  const cykl = cyklFilmu(ctx.korzen);
  const scena = czytaj(ctx.korzen, FILM + '/src/sceny/ScenaKomend.tsx');
  if (!cykl || !cykl.length) { w.bledy.push('nie znaleziono CYKL'); return w; }
  if (scena === null) { w.bledy.push('brak ' + FILM + '/src/sceny/ScenaKomend.tsx'); return w; }
  const importy = new Map();
  for (const m of scena.matchAll(/import \{ (\w+) \} from '\.\/komendy\/(\w+)'/g)) importy.set(m[1], m[2]);
  // Od "Object.freeze({" po REKWIZYTY, nie od samej nazwy: typ "(p: { t: number }) =>" niesie "})"
  // i ucinal blok przed pierwszym wpisem (pierwszy przebieg 2026-10-25: 0 rekwizytow przy 14).
  const poczatek = scena.indexOf('Object.freeze({', scena.indexOf('const REKWIZYTY'));
  const blok = poczatek < 0 ? '' : scena.slice(poczatek);
  const mapa = new Map();
  for (const m of blok.slice(0, blok.indexOf('})')).matchAll(/'(relai-[a-z-]+)':\s*(\w+)/g)) mapa.set(m[1], m[2]);
  for (const k of cykl) {
    const komp = mapa.get(k);
    if (!komp) { w.bledy.push('komenda ' + k + ' z CYKL bez rekwizytu w REKWIZYTY'); continue; }
    const plik = importy.get(komp);
    if (!plik || !fs.existsSync(path.join(ctx.korzen, FILM, 'src', 'sceny', 'komendy', plik + '.tsx'))) {
      w.bledy.push('rekwizyt ' + komp + ' komendy ' + k + ' bez pliku w src/sceny/komendy/');
    }
  }
  w.sprawdzono = cykl.length;
  w.licznik = 'komend w CYKL ' + cykl.length + ', rekwizytow w mapie ' + mapa.size;
  return w;
}

function tabsPanelu(korzen) {
  const t = czytaj(korzen, 'panel/hooks/pane-parts.tsx');
  if (t === null) return null;
  const linia = t.split('\n').find((l) => /^export const TABS = \[/.test(l));
  return linia ? [...linia.matchAll(/\['[a-z]+', '([^']+)'\]/g)].map((m) => m[1]) : null;
}

function kontrolaFilmZakladki(ctx) {
  const w = wynik('film-zakladki', 'film: zakladki sceny 3 rowne TABS panelu');
  const tabs = tabsPanelu(ctx.korzen);
  const teksty = czytaj(ctx.korzen, FILM + '/src/teksty.ts');
  if (!tabs || !tabs.length) { w.bledy.push('nie znaleziono TABS w panel/hooks/pane-parts.tsx'); return w; }
  if (teksty === null) { w.bledy.push('brak ' + FILM + '/src/teksty.ts'); return w; }
  const listy = teksty.split('\n').filter((l) => /zakladki:\s*Object\.freeze\(\[/.test(l))
    .map((l) => (l.match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1)));
  if (!listy.length) { w.bledy.push('src/teksty.ts nie ma listy "zakladki"'); return w; }
  for (const l of listy) {
    if (l.join('|') !== tabs.join('|')) w.bledy.push('zakladki filmu [' + l.join(', ') + '] inne niz TABS [' + tabs.join(', ') + ']');
  }
  w.sprawdzono = tabs.length;
  w.licznik = 'zakladek panelu ' + tabs.length + ', list w slowniku ' + listy.length;
  return w;
}

async function kontrolaFilmPaski(ctx) {
  const w = wynik('film-paski', 'film: liczba paskow rowna BAND');
  let band = null;
  try { band = (await importuj(ctx.korzen, 'core/panel/theme.mjs')).BAND; } catch (e) {
    w.bledy.push('nie moge wczytac BAND z core/panel/theme.mjs (' + e.message + ')');
    return w;
  }
  const man = manifestFilmu(ctx.korzen);
  const pasma = Object.keys(band || {});
  const wMan = man && man.paski && man.paski.wartosc;
  if (wMan !== pasma.length) w.bledy.push('manifest filmu: paski = ' + wMan + ', BAND ma ' + pasma.length + ' (' + pasma.join(', ') + ')');
  w.sprawdzono = pasma.length;
  w.licznik = 'pasm BAND ' + pasma.length + ', w manifescie ' + wMan;
  return w;
}

function kontrolaFilmNarzedzia(ctx) {
  const w = wynik('film-narzedzia', 'film: narzedzia rowne adapterom');
  let adaptery = [];
  try {
    adaptery = fs.readdirSync(path.join(ctx.korzen, 'adapters'), { withFileTypes: true })
      .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch (_) { /* brak katalogu nizej */ }
  if (!adaptery.length) { w.bledy.push('nie znaleziono adapterow'); return w; }
  const man = manifestFilmu(ctx.korzen);
  const nazwy = ctx.mapa.film.nazwyNarzedzi;
  const oczekiwane = adaptery.map((a) => nazwy[a] || ('<' + a + ' bez nazwy w mapie>')).sort();
  const wMan = man && man.narzedzia && man.narzedzia.wartosc;
  const nMan = ((man && man.narzedziaNazwy && man.narzedziaNazwy.wartosc) || []).slice().sort();
  if (wMan !== adaptery.length) w.bledy.push('manifest filmu: narzedzia = ' + wMan + ', adapterow ' + adaptery.length);
  if (nMan.join('|') !== oczekiwane.join('|')) w.bledy.push('manifest filmu: nazwy [' + nMan.join(', ') + '], adaptery [' + oczekiwane.join(', ') + ']');
  w.sprawdzono = adaptery.length;
  w.licznik = 'adapterow ' + adaptery.length + ', w manifescie ' + wMan;
  return w;
}

// --- listy modeli ------------------------------------------------------------------

function dataListy(tekst) {
  const m = tekst === null ? null : /^list-date:\s*(\d{4}-\d{2}-\d{2})\s*$/m.exec(tekst);
  return m ? m[1] : null;
}

function kontrolaModele(ctx) {
  const w = wynik('modele', 'MODELE.md pluginu nie starszy niz kopia projektu');
  const plugin = dataListy(czytaj(ctx.korzen, 'adapters/claude-code/MODELE.md'));
  if (!plugin) { w.bledy.push('adapters/claude-code/MODELE.md bez czytelnej linii list-date'); return w; }
  w.sprawdzono = 1;
  const kopia = dataListy(czytaj(ctx.korzenRobocze, '.claude/relai/MODELE-claude-code.md'));
  if (!kopia) {
    w.info.push('brak kopii projektu .claude/relai/MODELE-claude-code.md - porownanie pominiete');
  } else {
    w.sprawdzono = 2;
    if (plugin < kopia) w.bledy.push('MODELE.md pluginu z ' + plugin + ' starszy niz kopia projektu z ' + kopia + ' (/relai-models, potem przeniesienie do pluginu)');
  }
  w.licznik = 'plugin ' + plugin + ', kopia projektu ' + (kopia || 'brak');
  return w;
}

// --- stary numer ---------------------------------------------------------------------

function kontrolaStaryNumer(ctx) {
  const w = wynik('stary-numer', 'stary numer wersji poza sciezkami historycznymi');
  const stary = ctx.baza.rdzen.wersja;
  if (!stary) { w.bledy.push('nie znam numeru bazy'); return w; }
  const re = new RegExp('(^|[^0-9.])' + stary.replace(/\./g, '\\.') + '(?![0-9]|\\.[0-9])');
  const trafienia = [];
  let przejrzane = 0;
  for (const rel of ctx.pliki) {
    if (pasuje(rel, ctx.mapa.historyczne)) continue;
    let buf;
    try { buf = fs.readFileSync(path.join(ctx.korzen, rel)); } catch (_) { continue; }
    if (buf.length > 2 * 1024 * 1024 || buf.includes(0)) continue;
    przejrzane++;
    if (re.test(buf.toString('utf8'))) trafienia.push(rel);
  }
  w.sprawdzono = przejrzane;
  const czerwien = ctx.wersja !== stary;
  if (trafienia.length) {
    const opis = 'numer bazy ' + stary + ' w ' + trafienia.length + ' plikach poza historycznymi: ' + trafienia.slice(0, 12).join(', ')
      + (trafienia.length > 12 ? ' (+' + (trafienia.length - 12) + ')' : '');
    (czerwien ? w.bledy : w.ostrzezenia).push(opis + (czerwien ? '' : ' - wydawany numer rowny bazie, lista do rozstrzygniecia przy podbiciu'));
  }
  w.licznik = 'plikow przejrzanych ' + przejrzane + ', z numerem ' + stary + ': ' + trafienia.length;
  return w;
}

// --- podbicie numeru (E2, odlozone z przegladu E1) ---------------------------------------

// Komponent ze zmianami wymagajacymi wydania (propozycja istnieje) i numerem rownym bazie, nizszym
// niz propozycja albo nieczytelnym: w trybie wydania czerwien, w trybie zwyklym ostrzezenie — praca
// miedzy wydaniami nie jest bledem. Numer wyzszy niz propozycja to wybor czlowieka: ostrzezenie.
const STAN_PODBICIA = {
  'do podbicia': (p) => 'numer ' + p.wersja + ' rowny bazie',
  'ponizej propozycji': (p) => 'numer ' + p.wersja + ' ponizej propozycji',
  'numer nieczytelny': (p) => 'numer "' + p.wersja + '" nieczytelny',
  'numer bazy nieczytelny': (p) => 'numer bazy "' + p.wersjaBazy + '" nieczytelny',
};

function kontrolaPodbicie(ctx) {
  const w = wynik('podbicie', 'komponent ze zmianami wymagajacymi wydania ma numer co najmniej rowny propozycji');
  // Wydanie samego modu (E3): liczy sie tylko numer tego modu - nie rdzenia i nie innych modow.
  const propozycje = (ctx.propozycje || []).filter((p) => !ctx.komponent || p.komponent === ctx.komponent);
  w.sprawdzono = ctx.komponent ? 1 : 1 + ctx.baza.mody.length;
  let niepodbite = 0;
  for (const p of propozycje) {
    if (p.stan === 'podbity') continue;
    const sedno = p.komponent + ': ' + p.plikow + ' plikow wymaga wydania, ';
    if (p.stan === 'powyzej propozycji') {
      w.ostrzezenia.push(sedno + 'numer ' + p.wersja + ' powyzej propozycji ' + p.propozycja + ' (' + p.poziom + ') - wybor czlowieka');
      continue;
    }
    niepodbite++;
    const opis = sedno + (STAN_PODBICIA[p.stan] || (() => 'stan ' + p.stan))(p) + ' (propozycja ' + p.propozycja + ', ' + p.poziom + ')';
    if (ctx.trybWydania) w.bledy.push(opis);
    else w.ostrzezenia.push(opis + ' - czerwien w trybie --wydanie');
  }
  w.licznik = 'komponentow ' + w.sprawdzono + ', z propozycja ' + propozycje.length + ', niepodbitych ' + niepodbite
    + (ctx.trybWydania ? ' (tryb wydania)' : '') + (ctx.komponent ? ' (komponent ' + ctx.komponent + ')' : '');
  return w;
}

// --- hook pre-push (E3, ryzyko S4 planu) ----------------------------------------------------

// Bramka tagow wydan dziala tylko tam, gdzie hook jest zainstalowany: inna maszyna, swiezy klon
// i Codex jej nie maja. Kontrola porownuje kopie w .git/hooks/ ze zrodlem obok tego pliku (to samo
// zrodlo kopiuje instalator), tresc po CRLF -> LF. Brak albo inna suma: w trybie wydania czerwien,
// w trybie zwyklym ostrzezenie z komenda instalacji. Przy --rev release-check.js ja pomija.
const PREPUSH_ZRODLO = path.join(__dirname, 'release-pre-push.js');

function suma(tekst) {
  return require('crypto').createHash('sha256').update(lf(tekst)).digest('hex').slice(0, 12);
}

function kontrolaPrePush(ctx) {
  const w = wynik('pre-push', 'hook pre-push (bramka tagow wydan) zainstalowany i rowny zrodlu');
  const zrodlo = czytaj(path.dirname(PREPUSH_ZRODLO), path.basename(PREPUSH_ZRODLO));
  if (zrodlo === null) { w.bledy.push('brak zrodla hooka ' + PREPUSH_ZRODLO); return w; }
  const r = spawnSync('git', ['rev-parse', '--git-path', 'hooks'], { cwd: ctx.korzenRobocze, encoding: 'utf8' });
  if (r.status !== 0) { w.bledy.push('nie moge ustalic katalogu hookow gita'); return w; }
  const katalog = path.resolve(ctx.korzenRobocze, r.stdout.trim());
  w.sprawdzono = 1;
  const shim = czytaj(katalog, 'pre-push');
  const logika = czytaj(katalog, 'relai-pre-push.cjs');
  const problemy = [];
  if (shim === null) problemy.push('brak .git/hooks/pre-push');
  else if (!shim.includes('relai-pre-push.cjs')) problemy.push('.git/hooks/pre-push nie wola relai-pre-push.cjs (cudzy hook)');
  if (logika === null) problemy.push('brak .git/hooks/relai-pre-push.cjs');
  else if (suma(logika) !== suma(zrodlo)) problemy.push('kopia hooka ' + suma(logika) + ' inna niz zrodlo ' + suma(zrodlo) + ' (core/tools/release-pre-push.js)');
  for (const p of problemy) (ctx.trybWydania ? w.bledy : w.ostrzezenia).push(p + ' - instalacja: node core/tools/install-prepush.js');
  w.licznik = problemy.length ? 'hook niegotowy (' + problemy.length + ')' : 'hook zainstalowany, suma ' + suma(zrodlo);
  return w;
}

// --- narzedzia zewnetrzne (walidator, generator, rdzen panelu) -----------------------

function uruchom(ctx, args, opcje) {
  const r = spawnSync(process.execPath, args, Object.assign({ cwd: ctx.korzen, encoding: 'utf8', timeout: 300000 }, opcje));
  return { kod: r.status, out: (r.stdout || '') + (r.stderr || ''), blad: r.error };
}

function kontrolaNarzedzia(id, nazwa, rel, args, policz) {
  return (ctx) => {
    const w = wynik(id, nazwa);
    if (!fs.existsSync(path.join(ctx.korzen, rel))) { w.bledy.push('brak narzedzia ' + rel); return w; }
    const r = uruchom(ctx, [rel].concat(args));
    w.sprawdzono = policz(r.out);
    if (r.kod !== 0) {
      w.bledy.push(rel + ' zakonczyl sie kodem ' + r.kod + ': ' + r.out.trim().split('\n').slice(0, 8).join(' | '));
    }
    if (!w.sprawdzono && r.kod === 0) w.bledy.push(rel + ' nie zglosil, co sprawdzil');
    w.licznik = 'kod ' + r.kod + ', pozycji ' + w.sprawdzono;
    return w;
  };
}

const kontrolaWalidator = kontrolaNarzedzia('walidator', 'validate-adapters.js', 'core/tools/validate-adapters.js', [],
  (out) => (out.match(/^\s+[+-] /gm) || []).length);
const kontrolaGenerator = kontrolaNarzedzia('generator-codex', 'generate-skills.js --verify', 'adapters/codex/generate-skills.js', ['--verify'],
  (out) => Number((/\((\d+) plikow\)/.exec(out) || [0, 0])[1]));
const kontrolaSync = kontrolaNarzedzia('sync-panel-core', 'sync-panel-core.js --check', 'core/tools/sync-panel-core.js', ['--check'],
  (out) => Number((/(\d+) plikow core\/panel/.exec(out) || [0, 0])[1]));

const KONTROLE = [
  ['walidator', kontrolaWalidator],
  ['generator-codex', kontrolaGenerator],
  ['sync-panel-core', kontrolaSync],
  ['readme-komendy', kontrolaReadmeKomendy],
  ['readme-hooki', kontrolaReadmeHooki],
  ['readme-mody', kontrolaReadmeMody],
  ['historia', kontrolaHistoria],
  ['artefakty', kontrolaArtefakty],
  ['strona-komendy', kontrolaStronaKomendy],
  ['strona-fakty', kontrolaStronaFakty],
  ['film-komendy', kontrolaFilmKomendy],
  ['film-rekwizyty', kontrolaFilmRekwizyty],
  ['film-zakladki', kontrolaFilmZakladki],
  ['film-paski', kontrolaFilmPaski],
  ['film-narzedzia', kontrolaFilmNarzedzia],
  ['modele', kontrolaModele],
  ['stary-numer', kontrolaStaryNumer],
  ['podbicie', kontrolaPodbicie],
  ['pre-push', kontrolaPrePush],
];

module.exports = {
  KONTROLE,
  globNaRegex,
  pasuje,
  liczbyPrzed,
  wszystkieLiczby,
  wierszeRejestru,
  hookiRepo,
  komendyRepo,
  modyMarketplace,
  czytaj,
  czytajJson,
  wynik,
  importuj,
};
