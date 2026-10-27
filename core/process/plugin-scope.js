'use strict';
// RelAI core / proces: plugin-scope — tryb "RelAI tylko w zaadoptowanych projektach"
// (plan ZASIEG_PLUGINU, E1).
//
// Globalnie (~/.claude/settings.json) pluginy zestawu maja false, a kazdy zaadoptowany
// projekt wlacza je u siebie w .claude/settings.local.json (lokalne wygrywa z user klucz po
// kluczu) i dopisuje ten plik do .worktreeinclude, zeby worktree dostal kopie.
//
// Ten plik to czysta logika: odkrywanie folderow, klasyfikacja, plan zmian, dziennik
// i plan cofniecia. Polecenie `claude plugin ...` wstrzykuje wolajacy funkcja `uruchom`,
// wiec testy podstawiaja falszywe CLI. Zapis ustawien zawsze przez CLI (P-052); jedyny
// wyjatek to usuniecie klucza przy cofnieciu (usunKlucz) — CLI umie tylko true/false,
// a lokalne false po cofnieciu wylaczyloby RelAI mimo globalnego true.
//
// Kolejnosc apply: lokalne enable i .worktreeinclude, globalne disable na koncu — przerwane
// apply nie wylacza niczego. Cofniecie odwrotnie: najpierw globalne, potem lokalne.
//
// Zero zaleznosci npm.

const fs = require('fs');
const path = require('path');
const { isGuest, relaiMarkerFile } = require('./session-signals.js');

const ZESTAW = ['relai@relai', 'relai-panel@relai', 'relai-progress@relai', 'relai-cache-keeper@relai'];
const LINIA_WORKTREE = '.claude/settings.local.json';
const PLIK_DZIENNIKA = ['.claude', 'relai', 'zasieg-pluginu.json'];
const ODCZYT_JSONL = 64 * 1024; // pierwsze pole cwd stoi zwykle w pierwszych ~9 KB (pomiar 2026-10-27)
const BOM = new RegExp('^' + String.fromCharCode(0xfeff));
const WZOR_CWD = /"cwd":"((?:[^"\\]|\\.)*)"/;

const kluczSciezki = (p) => {
  const r = path.resolve(p);
  return process.platform === 'win32' ? r.toLowerCase() : r;
};

const plikLokalny = (folder) => path.join(folder, '.claude', 'settings.local.json');
const plikUzytkownika = (home) => path.join(home, '.claude', 'settings.json');
const plikDziennika = (home) => path.join(home, ...PLIK_DZIENNIKA);

// --- odczyty -------------------------------------------------------------------------

function czytajJson(plik) {
  let txt;
  try { txt = fs.readFileSync(plik, 'utf8'); } catch (_) { return { istnieje: false, dane: null }; }
  try { return { istnieje: true, dane: JSON.parse(txt.replace(BOM, '')), tekst: txt }; } catch (_) {
    return { istnieje: true, dane: null, tekst: txt, blad: 'nieczytelny JSON' };
  }
}

// Wartosci kluczy zestawu w enabledPlugins pliku: { id: true|false } tylko dla obecnych kluczy.
function wartosciZestawu(plik) {
  const { dane } = czytajJson(plik);
  const ep = dane && typeof dane.enabledPlugins === 'object' && dane.enabledPlugins ? dane.enabledPlugins : {};
  const out = {};
  for (const id of ZESTAW) if (typeof ep[id] === 'boolean') out[id] = ep[id];
  return out;
}

// Wartosc jednego klucza: true / false / null (brak klucza albo pliku).
function wartoscKlucza(plik, id) {
  const v = wartosciZestawu(plik)[id];
  return typeof v === 'boolean' ? v : null;
}

// Pluginy zestawu zainstalowane w zakresie user, w kolejnosci zestawu.
function zainstalowaneZestawu(home) {
  const { dane } = czytajJson(path.join(home, '.claude', 'plugins', 'installed_plugins.json'));
  const pluginy = dane && dane.plugins && typeof dane.plugins === 'object' ? dane.plugins : {};
  return ZESTAW.filter((id) => Array.isArray(pluginy[id]) && pluginy[id].some((e) => e && e.scope === 'user'));
}

function maLinieWorktree(folder) {
  let txt;
  try { txt = fs.readFileSync(path.join(folder, '.worktreeinclude'), 'utf8'); } catch (_) {
    return { istnieje: false, maLinie: false };
  }
  return { istnieje: true, maLinie: txt.split(/\r?\n/).some((l) => l.trim() === LINIA_WORKTREE) };
}

// --- odkrywanie folderow ---------------------------------------------------------------

function cwdZPliku(plik) {
  let fd;
  try {
    fd = fs.openSync(plik, 'r');
    const buf = Buffer.alloc(ODCZYT_JSONL);
    const n = fs.readSync(fd, buf, 0, ODCZYT_JSONL, 0);
    const m = WZOR_CWD.exec(buf.toString('utf8', 0, n));
    return m ? JSON.parse('"' + m[1] + '"') : null;
  } catch (_) {
    return null;
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd); } catch (_) { /* nic */ }
  }
}

// Foldery z historii sesji (<home>/.claude/projects/*/*.jsonl, pierwsze pole cwd w katalogu)
// i z argumentow. Zwraca { foldery, brak, pominietyDom }: folder domowy i nieistniejace osobno.
function odkryjFoldery(home, dodatkowe) {
  const kandydaci = [];
  const projekty = path.join(home, '.claude', 'projects');
  let katalogi = [];
  try { katalogi = fs.readdirSync(projekty, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch (_) { /* brak historii */ }
  for (const d of katalogi) {
    let pliki = [];
    try { pliki = fs.readdirSync(path.join(projekty, d.name)).filter((f) => f.endsWith('.jsonl')).sort(); } catch (_) { continue; }
    for (const f of pliki) {
      const cwd = cwdZPliku(path.join(projekty, d.name, f));
      if (cwd) { kandydaci.push(cwd); break; }
    }
  }
  for (const a of dodatkowe || []) kandydaci.push(a);

  const dom = kluczSciezki(home);
  const widziane = new Set();
  const foldery = [];
  const brak = [];
  let pominietyDom = false;
  for (const k of kandydaci) {
    const abs = path.resolve(k);
    const klucz = kluczSciezki(abs);
    if (widziane.has(klucz)) continue;
    widziane.add(klucz);
    if (klucz === dom) { pominietyDom = true; continue; }
    let jestKatalogiem = false;
    try { jestKatalogiem = fs.statSync(abs).isDirectory(); } catch (_) { /* nie istnieje */ }
    if (jestKatalogiem) foldery.push(abs); else brak.push(abs);
  }
  return { foldery, brak, pominietyDom };
}

// --- klasyfikacja i plan -----------------------------------------------------------------

// .git jako plik = worktree: dostaje lokalne enable, ale .worktreeinclude dziala tylko
// w repozytorium glownym, z ktorego powstaja nowe worktree.
function rodzajGita(folder) {
  try { return fs.statSync(path.join(folder, '.git')).isDirectory() ? 'repo' : 'worktree'; } catch (_) { return null; }
}

function klasyfikuj(folder) {
  const rodzaj = isGuest(folder) ? 'gosc' : relaiMarkerFile(folder) ? 'zaadoptowany' : 'inny';
  const git = rodzajGita(folder);
  return {
    folder,
    rodzaj,
    maGit: git !== null,
    jestWorktree: git === 'worktree',
    lokalne: wartosciZestawu(plikLokalny(folder)),
    projektowe: wartosciZestawu(path.join(folder, '.claude', 'settings.json')),
    worktree: maLinieWorktree(folder),
  };
}

// Kroki w ustalonej kolejnosci: dla kazdego zaadoptowanego projektu lokalne enable, potem
// linia w .worktreeinclude; na samym koncu globalne disable. Zwraca { kroki, pominiete }.
function planZmian({ foldery, zainstalowane, uzytkownik }) {
  const kroki = [];
  const pominiete = [];
  for (const id of ZESTAW) {
    if (!zainstalowane.includes(id)) pominiete.push({ id, powod: 'niezainstalowany' });
  }
  for (const k of foldery) {
    if (k.rodzaj !== 'zaadoptowany') continue;
    for (const id of zainstalowane) {
      if (k.lokalne[id] === false) {
        pominiete.push({ folder: k.folder, id, powod: 'lokalnie false — swiadome wylaczenie, apply go nie nadpisuje' });
      } else if (k.lokalne[id] !== true) {
        kroki.push({ typ: 'plugin', zakres: 'local', folder: k.folder, id, wartosc: true });
      }
    }
    if (k.maGit && !k.jestWorktree && !k.worktree.maLinie) kroki.push({ typ: 'worktreeinclude', folder: k.folder });
  }
  for (const id of zainstalowane) {
    if ((uzytkownik || {})[id] !== false) kroki.push({ typ: 'plugin', zakres: 'user', id, wartosc: false });
  }
  return { kroki, pominiete };
}

// Kroki odwrotne z dziennika, od ostatniego: poprzednia true/false -> CLI w tym zakresie;
// poprzednio brak klucza -> usuniecie klucza; dopisana linia .worktreeinclude -> jej usuniecie.
function planCofniecia(dziennik) {
  const kroki = (dziennik && Array.isArray(dziennik.kroki) ? dziennik.kroki : [])
    .map((k, i) => ({ k, i }))
    .filter(({ k }) => !k.cofniety);
  const out = [];
  for (const { k, i } of kroki.reverse()) {
    if (k.typ === 'worktreeinclude') {
      if (k.dopisano) out.push({ indeks: i, akcja: 'usunLinie', folder: k.folder, kasujPusty: !!k.plikPowstal });
      else out.push({ indeks: i, akcja: 'nic' });
    } else if (k.poprzednia === null || k.poprzednia === undefined) {
      out.push({ indeks: i, akcja: 'usunKlucz', zakres: k.zakres, folder: k.folder, id: k.id, kasujPusty: k.plikIstnial === false });
    } else {
      out.push({ indeks: i, akcja: k.poprzednia ? 'enable' : 'disable', zakres: k.zakres, folder: k.folder, id: k.id });
    }
  }
  // Najpierw globalne, potem lokalne (kolejnosc odwrotna do apply, takze przy cofnieciu czesciowym).
  return out.filter((c) => c.zakres === 'user').concat(out.filter((c) => c.zakres !== 'user'));
}

// --- zapisy wlasne (dziennik, .worktreeinclude, usuniecie klucza) ----------------------

function zapiszAtomowo(plik, tekst) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  const tmp = plik + '.relai-tmp-' + process.pid;
  fs.writeFileSync(tmp, tekst);
  fs.renameSync(tmp, plik);
}

function czytajDziennik(home) {
  const { istnieje, dane } = czytajJson(plikDziennika(home));
  if (!istnieje) return null;
  return dane && Array.isArray(dane.kroki) ? dane : { kroki: [], blad: 'nieczytelny dziennik' };
}

const zapiszDziennik = (home, d) => zapiszAtomowo(plikDziennika(home), JSON.stringify(d, null, 2) + '\n');

function dopiszLinieWorktree(folder) {
  const plik = path.join(folder, '.worktreeinclude');
  const stan = maLinieWorktree(folder);
  if (stan.maLinie) return { plikPowstal: false, dopisano: false };
  if (!stan.istnieje) {
    fs.writeFileSync(plik, LINIA_WORKTREE + '\n');
    return { plikPowstal: true, dopisano: true };
  }
  const txt = fs.readFileSync(plik, 'utf8');
  const nl = txt.includes('\r\n') ? '\r\n' : '\n';
  fs.writeFileSync(plik, txt + (txt === '' || txt.endsWith('\n') ? '' : nl) + LINIA_WORKTREE + nl);
  return { plikPowstal: false, dopisano: true };
}

function usunLinieWorktree(folder, kasujPusty) {
  const plik = path.join(folder, '.worktreeinclude');
  let txt;
  try { txt = fs.readFileSync(plik, 'utf8'); } catch (_) { return; }
  const linie = txt.split(/(?<=\n)/);
  const zostaje = linie.filter((l) => l.trim() !== LINIA_WORKTREE);
  if (zostaje.length === linie.length) return;
  const nowy = zostaje.join('');
  if (kasujPusty && nowy.trim() === '') fs.unlinkSync(plik);
  else fs.writeFileSync(plik, nowy);
}

// Waski zapis JSON: skasowanie jednego klucza w enabledPlugins, reszta obiektu bez zmian,
// wciecie i konce linii jak w oryginale. Plik, ktory powstal przez apply i zostal pusty, znika.
function usunKlucz(plik, id, kasujPusty) {
  const { istnieje, dane, tekst } = czytajJson(plik);
  if (!istnieje) return { zmiana: false };
  if (!dane) throw new Error('nieczytelny JSON w ' + plik + ' — klucz ' + id + ' do usuniecia recznie');
  const ep = dane.enabledPlugins;
  if (!ep || typeof ep !== 'object' || !(id in ep)) return { zmiana: false };
  delete ep[id];
  if (kasujPusty && Object.keys(dane).length === 1 && Object.keys(ep).length === 0) {
    fs.unlinkSync(plik);
    return { zmiana: true, skasowany: true };
  }
  const wciecie = (/\n([ \t]+)"/.exec(tekst) || [null, '  '])[1];
  const crlf = tekst.includes('\r\n');
  let nowy = JSON.stringify(dane, null, wciecie) + (/\r?\n$/.test(tekst) ? '\n' : '');
  if (crlf) nowy = nowy.replace(/\n/g, '\r\n');
  zapiszAtomowo(plik, nowy);
  return { zmiana: true };
}

// --- wykonanie -------------------------------------------------------------------------

const argvPluginu = (cli, akcja, id, zakres) => [cli, 'plugin', akcja, id, '--scope', zakres];

const plikZakresu = (krok, home) => (krok.zakres === 'user' ? plikUzytkownika(home) : plikLokalny(krok.folder));
const cwdZakresu = (krok, home) => (krok.zakres === 'user' ? home : krok.folder);

// Polecenia do recznego wykonania (brak CLI, przerwanie): jedno na krok, w kolejnosci.
function poleceniaReczne(kroki, cli) {
  return kroki.map((k) => {
    if (k.typ === 'worktreeinclude' || k.akcja === 'usunLinie') {
      return (k.akcja === 'usunLinie' ? 'usun linie ' : 'dopisz linie ') + LINIA_WORKTREE + ' w ' + path.join(k.folder, '.worktreeinclude');
    }
    if (k.akcja === 'usunKlucz') return 'usun klucz "' + k.id + '" z enabledPlugins w ' + (k.zakres === 'user' ? '~/.claude/settings.json' : plikLokalny(k.folder));
    if (k.akcja === 'nic') return null;
    const akcja = k.akcja || (k.wartosc ? 'enable' : 'disable');
    const pre = k.zakres === 'user' ? '' : 'cd "' + k.folder + '" && ';
    return pre + argvPluginu(cli, akcja, k.id, k.zakres).join(' ');
  }).filter(Boolean);
}

// Czy CLI w ogole startuje. ENOENT (i kazdy blad spawnu) = brak CLI.
function cliDostepne(uruchom, cli, home) {
  const r = uruchom([cli, '--version'], home);
  return !r.error && r.status === 0;
}

function bladCli(r) {
  if (r.error) return r.error.code || String(r.error.message || r.error);
  const linia = String(r.stderr || r.stdout || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean);
  return 'kod ' + r.status + (linia ? ': ' + linia : '');
}

const JUZ_TAKI = /is already (enabled|disabled) at/i;

// Jeden krok pluginu przez CLI i odczyt pliku zakresu. Zwraca null albo opis bledu.
// CLI odmawia (kod 1, "is already enabled at local scope"), gdy stan efektywny z innego zakresu
// jest juz taki, a w tym zakresie klucza brak (P-058, CLI 2.1.304). Wtedy para: akcja
// przeciwna, potem zadana — zapisuje klucz, a odczyt pliku sprawdza wynik jak zwykle.
function krokPluginu(krok, akcja, oczekiwana, { uruchom, cli, home }) {
  const cwd = cwdZakresu(krok, home);
  let r = uruchom(argvPluginu(cli, akcja, krok.id, krok.zakres), cwd);
  const odmowa = !r.error && r.status !== 0 && JUZ_TAKI.test(String(r.stderr || '') + String(r.stdout || ''));
  if (odmowa && wartoscKlucza(plikZakresu(krok, home), krok.id) === oczekiwana) return null;
  if (odmowa) {
    const przeciwna = akcja === 'enable' ? 'disable' : 'enable';
    const p = uruchom(argvPluginu(cli, przeciwna, krok.id, krok.zakres), cwd);
    if (p.error || p.status !== 0) return 'CLI ' + przeciwna + ' ' + krok.id + ' (' + krok.zakres + '): ' + bladCli(p);
    r = uruchom(argvPluginu(cli, akcja, krok.id, krok.zakres), cwd);
    if (r.error || r.status !== 0) {
      return 'CLI ' + akcja + ' ' + krok.id + ' (' + krok.zakres + ') po ' + przeciwna + ': ' + bladCli(r)
        + ' — w ' + plikZakresu(krok, home) + ' zostal klucz ' + krok.id + ' = ' + !oczekiwana;
    }
  }
  if (r.error || r.status !== 0) return 'CLI ' + akcja + ' ' + krok.id + ' (' + krok.zakres + '): ' + bladCli(r);
  const po = wartoscKlucza(plikZakresu(krok, home), krok.id);
  if (po !== oczekiwana) {
    return 'odczyt ' + plikZakresu(krok, home) + ': ' + krok.id + ' = ' + po + ', oczekiwano ' + oczekiwana;
  }
  return null;
}

// apply: wykonuje plan krok po kroku; dziennik po kazdym kroku. Pierwszy blad zatrzymuje
// reszte (globalne disable stoja na koncu, wiec nie zostana wykonane).
function wykonajPlan(kroki, { uruchom, cli, home, teraz }) {
  const wykonane = [];
  if (!kroki.length) return { ok: true, wykonane, reczne: [] };
  if (!cliDostepne(uruchom, cli, home)) {
    return { ok: false, brakCli: true, wykonane, reczne: poleceniaReczne(kroki, cli) };
  }
  const poprzedni = czytajDziennik(home);
  // Nieczytelny dziennik moze niesc kroki do cofniecia — nadpisanie go zgubiloby undo.
  if (poprzedni && poprzedni.blad) {
    return { ok: false, blad: 'dziennik ' + plikDziennika(home) + ' jest nieczytelny — popraw go albo przenies, zanim apply cokolwiek zapisze', wykonane, reczne: [] };
  }
  const dziennik = poprzedni && poprzedni.kroki.some((k) => !k.cofniety)
    ? poprzedni
    : { wersja: 1, utworzono: teraz, kroki: [] };
  for (let n = 0; n < kroki.length; n++) {
    const krok = kroki[n];
    if (krok.typ === 'worktreeinclude') {
      const wpis = { typ: 'worktreeinclude', folder: krok.folder, plikPowstal: false, dopisano: false, data: teraz };
      try {
        Object.assign(wpis, dopiszLinieWorktree(krok.folder));
      } catch (e) {
        return { ok: false, blad: '.worktreeinclude w ' + krok.folder + ': ' + e.message, wykonane, reczne: poleceniaReczne(kroki.slice(n), cli) };
      }
      dziennik.kroki.push(wpis);
      zapiszDziennik(home, dziennik);
      wykonane.push(krok);
      continue;
    }
    const plik = plikZakresu(krok, home);
    const wpis = {
      typ: 'plugin', zakres: krok.zakres, folder: krok.folder, id: krok.id,
      poprzednia: wartoscKlucza(plik, krok.id), plikIstnial: fs.existsSync(plik), nowa: krok.wartosc, data: teraz,
    };
    // Wpis przed wywolaniem: CLI moze zapisac plik i potem zglosic blad — cofniecie i tak go zna.
    dziennik.kroki.push(wpis);
    zapiszDziennik(home, dziennik);
    const blad = krokPluginu(krok, krok.wartosc ? 'enable' : 'disable', krok.wartosc, { uruchom, cli, home });
    if (blad) return { ok: false, blad, wykonane, reczne: poleceniaReczne(kroki.slice(n), cli) };
    wykonane.push(krok);
  }
  return { ok: true, wykonane, reczne: [] };
}

// undo: kroki odwrotne z dziennika; kazdy cofniety oznaczany od razu, wiec drugie undo
// i undo po przerwaniu nie powtarzaja niczego.
function cofnij({ uruchom, cli, home }) {
  const dziennik = czytajDziennik(home);
  if (!dziennik) return { ok: true, brakDziennika: true, cofniete: [] };
  if (dziennik.blad) return { ok: false, blad: 'dziennik ' + plikDziennika(home) + ' jest nieczytelny', cofniete: [] };
  const plan = planCofniecia(dziennik);
  const cofniete = [];
  if (!plan.length) return { ok: true, cofniete };
  const potrzebaCli = plan.some((c) => c.akcja === 'enable' || c.akcja === 'disable');
  if (potrzebaCli && !cliDostepne(uruchom, cli, home)) {
    return { ok: false, brakCli: true, cofniete, reczne: poleceniaReczne(plan, cli) };
  }
  for (let n = 0; n < plan.length; n++) {
    const c = plan[n];
    try {
      if (c.akcja === 'usunLinie') usunLinieWorktree(c.folder, c.kasujPusty);
      else if (c.akcja === 'usunKlucz') usunKlucz(plikZakresu(c, home), c.id, c.kasujPusty);
      else if (c.akcja !== 'nic') {
        const blad = krokPluginu(c, c.akcja, c.akcja === 'enable', { uruchom, cli, home });
        if (blad) return { ok: false, blad, cofniete, reczne: poleceniaReczne(plan.slice(n), cli) };
      }
    } catch (e) {
      return { ok: false, blad: e.message, cofniete, reczne: poleceniaReczne(plan.slice(n), cli) };
    }
    dziennik.kroki[c.indeks].cofniety = true;
    zapiszDziennik(home, dziennik);
    cofniete.push(c);
  }
  return { ok: true, cofniete };
}

// on/off dla jednego projektu: poziom uzytkownika nietkniety, dziennik apply nietkniety.
function planJednego(folder, wlacz, zainstalowane) {
  const k = klasyfikuj(folder);
  const kroki = zainstalowane
    .filter((id) => k.lokalne[id] !== wlacz)
    .map((id) => ({ typ: 'plugin', zakres: 'local', folder, id, wartosc: wlacz }));
  if (wlacz && k.maGit && !k.jestWorktree && !k.worktree.maLinie) kroki.push({ typ: 'worktreeinclude', folder });
  return { klasyfikacja: k, kroki };
}

function wykonajJednego(kroki, { uruchom, cli, home }) {
  if (!kroki.length) return { ok: true, wykonane: [] };
  if (!cliDostepne(uruchom, cli, home)) return { ok: false, brakCli: true, wykonane: [], reczne: poleceniaReczne(kroki, cli) };
  const wykonane = [];
  for (let n = 0; n < kroki.length; n++) {
    const krok = kroki[n];
    if (krok.typ === 'worktreeinclude') {
      try {
        dopiszLinieWorktree(krok.folder);
      } catch (e) {
        return { ok: false, blad: '.worktreeinclude w ' + krok.folder + ': ' + e.message, wykonane, reczne: poleceniaReczne(kroki.slice(n), cli) };
      }
    } else {
      const blad = krokPluginu(krok, krok.wartosc ? 'enable' : 'disable', krok.wartosc, { uruchom, cli, home });
      if (blad) return { ok: false, blad, wykonane, reczne: poleceniaReczne(kroki.slice(n), cli) };
    }
    wykonane.push(krok);
  }
  return { ok: true, wykonane };
}

module.exports = {
  ZESTAW,
  LINIA_WORKTREE,
  kluczSciezki,
  plikDziennika,
  plikUzytkownika,
  wartosciZestawu,
  zainstalowaneZestawu,
  odkryjFoldery,
  klasyfikuj,
  planZmian,
  planCofniecia,
  czytajDziennik,
  usunKlucz,
  poleceniaReczne,
  wykonajPlan,
  cofnij,
  planJednego,
  wykonajJednego,
};
