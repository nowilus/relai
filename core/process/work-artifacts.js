#!/usr/bin/env node
'use strict';
// RelAI core / proces: work-artifacts — pomiar, bramka ochronna, raport i kasowanie
// artefaktow roboczych projektu.
//
// Ten plik nalezy do RDZENIA: nie wie nic o protokole hookow zadnego narzedzia, nie czyta
// stdin poza wlasnym CLI i nie zna pojecia "AskUserQuestion". Zna katalog projektu na
// wejsciu i FAKTY na wyjsciu. Decyzja "co skasowac" NIGDY nie nalezy do niego: kasuje
// wylacznie liste sciezek, ktora dostal od czlowieka przez komende (D-18, D-40).
//
// Uzywany w trzech miejscach:
//   1) komenda /relai-clean adaptera Claude Code (i Cursora — ta sama komenda),
//   2) hook startu sesji przez session-signals.js (raport, nigdy kasowanie),
//   3) wywolanie z reki: node .claude/relai/tools/clean-work.js raport
//
// Kopia tego pliku laduje w projekcie uzytkownika jako .claude/relai/tools/clean-work.js
// (prowizjonowanie w session-signals.js, ta sama droga co specyfikacje — L-0012). Kopia musi
// dzialac SAMA: dlatego zero require na inne pliki rdzenia i zero zaleznosci npm.
//
// Komunikaty CLI celowo bez polskich znakow diakrytycznych (L-0016): konsola Windows.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// Limit wpisow na jedna pozycje przy chodzeniu po katalogu (ryzyko 3 planu: hook startu nie
// moze utknac na rozpakowanej paczce). Po przekroczeniu wynik niesie flage niepelne.
const LIMIT_WPISOW = 20000;
// Plik testowy wiekszy niz to nie jest przeszukiwany pod katem sciezek (bramka "wiazane testami").
const LIMIT_PLIKU_TESTOWEGO = 2 * 1024 * 1024;

const KATALOG_WORK = ['.claude', 'relai', 'work'];

// Wzorce grupy "Sekrety" z /relai-backup (D-42). Raport podaje sciezke, NIGDY tresc.
const SEKRETY = [
  /^\.env$/i, /^\.env\..+$/i, /\.pem$/i, /\.key$/i, /\.pfx$/i, /\.p12$/i,
  /^id_rsa$/i, /^id_ed25519$/i, /\.keystore$/i, /^\.npmrc$/i, /^\.pypirc$/i,
  /^credentials\.json$/i, /^serviceAccount.*\.json$/i,
];

// Zaleznosci i katalogi narzedzi — nie-cel planu.
const ZALEZNOSCI = ['node_modules', 'venv', '.venv', 'vendor', '.git', '.cursor', '.vscode', '.idea'];

// Cache regenerowalne — osobna grupa raportu.
const CACHE_REGENEROWALNE = ['__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache'];

// Pliki, w ktorych szuka bramka dokumentacyjna. AGENTS.md wchodzi, gdy istnieje (D-86).
const DOKUMENTY_BRAMKI = ['docs/ARCHITEKTURA.md', 'CLAUDE.md', 'README.md', 'AGENTS.md'];

// Pliki testowe — bramka "wiazane testami".
const WZORCE_TESTOW = [/^test_.+\.py$/i, /_test\.py$/i, /\.test\.[^.]+$/i, /\.spec\.[^.]+$/i];

// Status etapu / odnogi, ktory zwalnia katalog roboczy. Zamknieta lista brzmien (L-0035):
// rdzen slowa lapany klasa znakow polskich, nie \w (L-0066).
const STATUS_ZAMKNIETY = /^(ZREALIZOWANY|POMINIĘTY|POMINIETY|ZAMKNIĘTA|ZAMKNIETA|PRZENIESIONA)\b/;

// --- pomocnicze --------------------------------------------------------------

function bezOgonkow(tekst) {
  const mapa = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  };
  return String(tekst || '').replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (z) => mapa[z]);
}

// Slug projektu liczony tak samo jak nazwa archiwum w /relai-backup (D-43).
function slugProjektu(cwd) {
  const nazwa = path.basename(path.resolve(cwd || process.cwd()));
  return bezOgonkow(nazwa)
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '')
    .toLowerCase();
}

function naPosix(p) {
  return String(p).split(path.sep).join('/');
}

function relatywna(cwd, p) {
  return naPosix(path.relative(cwd, p));
}

function czytajLinie(plik) {
  // Konce linii sa wariantem, nie szczegolem (zasada 11): CRLF i LF w jednym przebiegu.
  try {
    return fs.readFileSync(plik, 'utf8').split(/\r?\n/);
  } catch (_) {
    return null;
  }
}

function mb(bajty) {
  return (Number(bajty || 0) / (1024 * 1024)).toFixed(1);
}

function dataZnacznika(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function dzisiaj() {
  return dataZnacznika(Date.now());
}

// --- markery "zachowaj" ------------------------------------------------------

// Wzorzec .gitignore -> wyrazenie regularne nad sciezka wzgledna w stylu posix.
// Przyblizenie skladni gita: obsluguje * i ?, kotwiczenie ukosnikiem i katalogi.
function wzorzecNaRegex(wzorzec) {
  let w = String(wzorzec || '').trim();
  if (!w || w.startsWith('#')) return null;
  w = w.replace(/^!+/, '').replace(/\/+$/, '');
  const odKorzenia = w.startsWith('/') || w.includes('/');
  w = w.replace(/^\/+/, '');
  if (!w) return null;
  const esc = w
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');
  const trzon = odKorzenia ? '^' + esc : '(^|.*/)' + esc;
  try {
    return new RegExp(trzon + '(/.*)?$');
  } catch (_) {
    return null;
  }
}

// Czyta flagi "zachowaj" z trzech zrodel (rozstrzygniecie wlasciciela 2026-09-03):
//   .gitignore          — linia-marker "# relai: zachowaj" / "# relai: keep" nad wzorcem;
//                         marker dotyczy NASTEPNEJ linii niebedacej komentarzem,
//   .git/info/exclude   — kazdy wzorzec (wykluczenie lokalne jest swiadomym wyborem),
//   .claude/relai/keep  — projekt bez gita, jedna sciezka na linie.
const MARKER_RE = /^#\s*relai:\s*(zachowaj|keep)\s*$/i;

function czytajMarkery(cwd) {
  const katalog = path.resolve(cwd || process.cwd());
  const wynik = [];

  const gitignore = czytajLinie(path.join(katalog, '.gitignore'));
  if (gitignore) {
    let uzbrojony = false;
    for (const linia of gitignore) {
      const t = linia.trim();
      if (!t) continue;
      if (t.startsWith('#')) {
        if (MARKER_RE.test(t)) uzbrojony = true;
        continue;
      }
      if (uzbrojony) {
        wynik.push({ wzorzec: t, zrodlo: '.gitignore' });
        uzbrojony = false;
      }
    }
  }

  const exclude = czytajLinie(path.join(katalog, '.git', 'info', 'exclude'));
  if (exclude) {
    for (const linia of exclude) {
      const t = linia.trim();
      if (!t || t.startsWith('#')) continue;
      wynik.push({ wzorzec: t, zrodlo: '.git/info/exclude' });
    }
  }

  const keep = czytajLinie(path.join(katalog, '.claude', 'relai', 'keep'));
  if (keep) {
    for (const linia of keep) {
      const t = linia.trim();
      if (!t || t.startsWith('#')) continue;
      wynik.push({ wzorzec: t, zrodlo: '.claude/relai/keep' });
    }
  }

  for (const m of wynik) m.re = wzorzecNaRegex(m.wzorzec);
  return wynik.filter((m) => m.re);
}

// --- git ---------------------------------------------------------------------

function git(cwd, args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'buffer',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

function maGita(cwd) {
  try {
    return fs.existsSync(path.join(cwd, '.git'));
  } catch (_) {
    return false;
  }
}

function sledzonePliki(cwd) {
  try {
    const buf = git(cwd, ['ls-files', '-z']);
    return new Set(buf.toString('utf8').split('\0').filter(Boolean));
  } catch (_) {
    return null;
  }
}

// Wpisy ?? (niesledzone) i !! (ignorowane) z jednego wywolania. -z, wiec sciezki nie sa
// cytowane i polskie znaki nie wymagaja odkodowania.
function wpisyRepo(cwd) {
  try {
    const buf = git(cwd, ['status', '--porcelain=v1', '--ignored=matching', '-z']);
    const pola = buf.toString('utf8').split('\0').filter(Boolean);
    const wynik = [];
    for (const pole of pola) {
      const kod = pole.slice(0, 2);
      const sciezka = pole.slice(3);
      if (!sciezka) continue;
      if (kod === '??' || kod === '!!') wynik.push({ kod, sciezka: sciezka.replace(/\/+$/, '') });
    }
    return wynik;
  } catch (_) {
    return null;
  }
}

// --- pomiar ------------------------------------------------------------------

// Chodzi po katalogu iteracyjnie, z limitem wpisow. Dowiazanie liczy jako 0 B i nie wchodzi
// do srodka (ryzyko 2 planu). maSekret zapala sie, gdy w srodku stoi plik pasujacy wzorcom
// sekretu — chroni caly katalog, sciezki nie cytujemy.
function zmierz(cel, limit) {
  const wynik = { bajty: 0, pliki: 0, mtime: 0, niepelne: false, maSekret: false, dowiazanie: false };
  let st;
  try {
    st = fs.lstatSync(cel);
  } catch (_) {
    return wynik;
  }
  if (st.isSymbolicLink()) {
    wynik.dowiazanie = true;
    wynik.pliki = 1;
    wynik.mtime = st.mtimeMs;
    return wynik;
  }
  if (!st.isDirectory()) {
    wynik.bajty = st.size;
    wynik.pliki = 1;
    wynik.mtime = st.mtimeMs;
    if (SEKRETY.some((re) => re.test(path.basename(cel)))) wynik.maSekret = true;
    return wynik;
  }

  const maks = limit || LIMIT_WPISOW;
  const stos = [cel];
  let wpisow = 0;
  wynik.mtime = st.mtimeMs;
  while (stos.length) {
    const biezacy = stos.pop();
    let wpisy;
    try {
      wpisy = fs.readdirSync(biezacy, { withFileTypes: true });
    } catch (_) {
      continue;
    }
    for (const w of wpisy) {
      if (++wpisow > maks) {
        wynik.niepelne = true;
        return wynik;
      }
      const p = path.join(biezacy, w.name);
      if (w.isSymbolicLink()) {
        wynik.pliki++;
        continue;
      }
      if (w.isDirectory()) {
        stos.push(p);
        continue;
      }
      let s;
      try {
        s = fs.lstatSync(p);
      } catch (_) {
        continue;
      }
      wynik.bajty += s.size;
      wynik.pliki++;
      if (s.mtimeMs > wynik.mtime) wynik.mtime = s.mtimeMs;
      if (!wynik.maSekret && SEKRETY.some((re) => re.test(w.name))) wynik.maSekret = true;
    }
  }
  return wynik;
}

function pozycja(cwd, cel, pochodzenie, zrodlo, limit) {
  const m = zmierz(cel, limit);
  return {
    sciezka: cel,
    wzgledna: relatywna(cwd, cel),
    bajty: m.bajty,
    pliki: m.pliki,
    mtime: m.mtime,
    data: dataZnacznika(m.mtime),
    niepelne: m.niepelne,
    dowiazanie: m.dowiazanie,
    maSekret: m.maSekret,
    pochodzenie,
    zrodlo,
    chronione: null,
  };
}

// --- status etapu, odnogi, sesji ---------------------------------------------

function znajdzStatusPlanu(cwd, temat) {
  const kandydaci = [
    path.join(cwd, 'docs', 'plany', temat, 'STATUS.md'),
    path.join(cwd, 'docs', 'archiwum', 'plany', temat, 'STATUS.md'),
  ];
  for (const p of kandydaci) {
    if (fs.existsSync(p)) return { plik: p, archiwum: p.includes(path.join('archiwum', 'plany')) };
  }
  return null;
}

// Wiersz tabeli etapow: | E1 | Nazwa | **ZREALIZOWANY 2026-09-03** | ...
function statusEtapu(plikStatus, etap) {
  const linie = czytajLinie(plikStatus);
  if (!linie) return null;
  for (const linia of linie) {
    if (linia.indexOf('|') !== 0) continue;
    const komorki = linia.split('|').map((k) => k.replace(/\*/g, '').trim());
    if (komorki.length < 4) continue;
    if (komorki[1].toUpperCase() !== String(etap).toUpperCase()) continue;
    return komorki[3];
  }
  return null;
}

function statusOdnogi(cwd, temat, nazwa) {
  const kandydaci = [
    path.join(cwd, 'docs', 'plany', temat, 'odnogi', nazwa, 'ODNOGA.md'),
    path.join(cwd, 'docs', 'archiwum', 'plany', temat, 'odnogi', nazwa, 'ODNOGA.md'),
    path.join(cwd, 'docs', 'fixy', nazwa, 'ODNOGA.md'),
  ];
  for (const p of kandydaci) {
    const linie = czytajLinie(p);
    if (!linie) continue;
    for (const linia of linie) {
      const m = linia.match(/Status:\s*\**\s*([A-ZĄĆĘŁŃÓŚŹŻ]+)/);
      if (m) return m[1];
    }
  }
  return null;
}

// --- zrodlo "work" -----------------------------------------------------------

function katalogiWork(cwd) {
  const korzen = path.join(cwd, ...KATALOG_WORK);
  let szczyt;
  try {
    szczyt = fs.readdirSync(korzen, { withFileTypes: true });
  } catch (_) {
    return [];
  }
  const wynik = [];
  for (const w of szczyt) {
    if (!w.isDirectory()) continue;
    const temat = w.name;
    const katalogTematu = path.join(korzen, temat);
    let dzieci = [];
    try {
      dzieci = fs.readdirSync(katalogTematu, { withFileTypes: true }).filter((d) => d.isDirectory());
    } catch (_) {
      dzieci = [];
    }
    if (!dzieci.length) {
      wynik.push({ cel: katalogTematu, temat, dziecko: null });
      continue;
    }
    for (const d of dzieci) wynik.push({ cel: path.join(katalogTematu, d.name), temat, dziecko: d.name });
  }
  return wynik;
}

// Pochodzenie i status katalogu roboczego. Niepewnosc rozstrzygana na korzysc ochrony:
// katalog bez planu o tej nazwie trafia do "nieznane" — do potwierdzenia, nigdy do cichego
// kasowania.
function opiszWork(cwd, wpis) {
  const { temat, dziecko } = wpis;
  // Katalog bez podkatalogow (dziecko === null) nie moze byc "w uzyciu": nie ma etapu ani
  // odnogi, ktora by go trzymala. Zostaje kandydatem do potwierdzenia — inaczej pusta
  // skorupa po skasowanym etapie zostawalaby chroniona na zawsze.
  if (temat === '_sesja') {
    if (!dziecko) return { pochodzenie: 'sesja', trwa: false, opis: 'katalog sesji bez daty' };
    const trwa = dziecko === dzisiaj();
    return { pochodzenie: 'sesja', trwa, opis: 'sesja ' + dziecko };
  }
  if (temat === '_fixy') {
    if (!dziecko) return { pochodzenie: 'fixy', trwa: false, opis: 'katalog watkow bez nazwy' };
    const st = statusOdnogi(cwd, null, dziecko);
    return { pochodzenie: 'fixy', trwa: !st || !STATUS_ZAMKNIETY.test(st), opis: 'watek ' + dziecko + (st ? ' / ' + st : ' / brak karty') };
  }

  const plan = znajdzStatusPlanu(cwd, temat);
  if (!plan) return { pochodzenie: 'nieznane', trwa: false, opis: 'brak planu o nazwie ' + temat };
  // Plan w archiwum jest zamkniety w calosci — wszystkie jego katalogi sa kandydatami.
  if (plan.archiwum) return { pochodzenie: dziecko && /^E\d+$/i.test(dziecko) ? 'etap' : 'odnoga', trwa: false, opis: 'plan w archiwum' };

  if (dziecko && /^E\d+$/i.test(dziecko)) {
    const st = statusEtapu(plan.plik, dziecko);
    return { pochodzenie: 'etap', trwa: !st || !STATUS_ZAMKNIETY.test(st), opis: dziecko + ' / ' + (st || 'status nieznany') };
  }
  if (dziecko) {
    const st = statusOdnogi(cwd, temat, dziecko);
    return { pochodzenie: 'odnoga', trwa: !st || !STATUS_ZAMKNIETY.test(st), opis: dziecko + ' / ' + (st || 'brak karty') };
  }
  return { pochodzenie: 'nieznane', trwa: false, opis: 'katalog tematu bez podkatalogow' };
}

// --- bramka ------------------------------------------------------------------

function indeksDokumentow(cwd) {
  const wynik = [];
  for (const rel of DOKUMENTY_BRAMKI) {
    const p = path.join(cwd, ...rel.split('/'));
    const linie = czytajLinie(p);
    if (linie) wynik.push({ plik: rel, linie });
  }
  return wynik;
}

function plikiTestowe(cwd) {
  const wynik = [];
  const stos = [cwd];
  let wpisow = 0;
  while (stos.length) {
    const biezacy = stos.pop();
    let wpisy;
    try {
      wpisy = fs.readdirSync(biezacy, { withFileTypes: true });
    } catch (_) {
      continue;
    }
    for (const w of wpisy) {
      if (++wpisow > LIMIT_WPISOW) return wynik;
      if (w.isSymbolicLink()) continue;
      const p = path.join(biezacy, w.name);
      if (w.isDirectory()) {
        if (ZALEZNOSCI.includes(w.name) || CACHE_REGENEROWALNE.includes(w.name)) continue;
        stos.push(p);
        continue;
      }
      const wTestach = biezacy.split(path.sep).includes('tests');
      if (wTestach || WZORCE_TESTOW.some((re) => re.test(w.name))) {
        try {
          if (fs.statSync(p).size <= LIMIT_PLIKU_TESTOWEGO) wynik.push(p);
        } catch (_) { /* cisza */ }
      }
    }
  }
  return wynik;
}

function kontekstBramki(cwd, opcje) {
  const o = opcje || {};
  return {
    cwd,
    markery: o.markery || czytajMarkery(cwd),
    sledzone: o.sledzone !== undefined ? o.sledzone : sledzonePliki(cwd),
    dokumenty: o.dokumenty || indeksDokumentow(cwd),
    testy: o.testy || plikiTestowe(cwd),
    korzenie: [path.resolve(cwd), fs.realpathSync(os.tmpdir())],
  };
}

function jestSledzona(kontekst, wzgledna) {
  if (!kontekst.sledzone) return false;
  if (kontekst.sledzone.has(wzgledna)) return true;
  const prefiks = wzgledna + '/';
  for (const p of kontekst.sledzone) {
    if (p.startsWith(prefiks)) return true;
  }
  return false;
}

// Bramka dokumentacyjna. Szuka SCIEZKI WZGLEDNEJ pozycji (oba style ukosnikow) oraz — gdy
// pozycja jest wpisem najwyzszego poziomu — jej nazwy ze znakiem / albo \ po niej. Katalog
// zagniezdzony NIE dziedziczy ochrony po rodzicu: plan rozstrzyga to wprost (sekcja 9,
// sprawa 4: tools/cache/ jest kandydatem, choc tools/ jest opisane).
function szukajWDokumentach(kontekst, poz) {
  const rel = poz.wzgledna;
  if (!rel || rel.startsWith('..')) return null;
  const igly = [rel, rel.split('/').join('\\')];
  if (!rel.includes('/')) {
    igly.push(rel + '/');
    igly.push(rel + '\\');
  }
  for (const d of kontekst.dokumenty) {
    for (let i = 0; i < d.linie.length; i++) {
      for (const igla of igly) {
        if (d.linie[i].includes(igla)) return { plik: d.plik, linia: i + 1 };
      }
    }
  }
  return null;
}

function szukajWTestach(kontekst, poz) {
  const rel = poz.wzgledna;
  if (!rel || rel.startsWith('..')) return null;
  const igly = [rel, rel.split('/').join('\\')];
  for (const p of kontekst.testy) {
    let tresc;
    try {
      tresc = fs.readFileSync(p, 'utf8');
    } catch (_) {
      continue;
    }
    for (const igla of igly) {
      if (tresc.includes(igla)) return { plik: relatywna(kontekst.cwd, p) };
    }
  }
  return null;
}

function wDowiazaniuPozaKorzenie(kontekst, poz) {
  if (!poz.dowiazanie) return false;
  try {
    const cel = fs.realpathSync(poz.sciezka);
    return !kontekst.korzenie.some((k) => cel === k || cel.startsWith(k + path.sep));
  } catch (_) {
    return true;
  }
}

// Zamknieta lista powodow ochrony (plan, sekcja 5 + przypadek brzegowy 9). Zwraca
// {powod, zrodlo} albo null. Niepewnosc rozstrzygana na korzysc ochrony.
function bramka(poz, kontekst) {
  const rel = poz.wzgledna;
  const segmenty = rel ? rel.split('/') : [];

  if (jestSledzona(kontekst, rel)) return { powod: 'sledzone', zrodlo: 'git ls-files' };

  for (const m of kontekst.markery) {
    if (m.re.test(rel)) return { powod: 'zachowaj', zrodlo: m.zrodlo + ': ' + m.wzorzec };
  }

  const opis = szukajWDokumentach(kontekst, poz);
  if (opis) return { powod: 'opisane', zrodlo: opis.plik + ':' + opis.linia };

  const test = szukajWTestach(kontekst, poz);
  if (test) return { powod: 'wiazane testami', zrodlo: test.plik };

  // .claude jest zaleznoscia narzedzia POZA .claude/relai/work — to jest jedyny wyjatek.
  const wWork = rel.startsWith('.claude/relai/work/') || rel === '.claude/relai/work';
  if (!wWork && segmenty.some((s) => ZALEZNOSCI.includes(s) || s === '.claude')) {
    return { powod: 'zaleznosci / narzedzia', zrodlo: 'nie-cel planu' };
  }

  // "etap trwa" idzie PRZED "sekret", choc lista planu wymienia je w odwrotnej kolejnosci:
  // obie odpowiedzi chronia tak samo, ale przy katalogu etapu w toku informacja "etap trwa"
  // mowi czlowiekowi, dlaczego pozycja nie jest kandydatem, a "sekret" tylko, ze cos w srodku
  // pasuje wzorcowi. Bezpieczenstwo bez zmian — zmienia sie wylacznie etykieta.
  if (poz.zrodlo === 'work' && poz.trwa) {
    return { powod: 'etap trwa', zrodlo: poz.opisPochodzenia || 'artefakt w uzyciu' };
  }

  if (poz.maSekret) return { powod: 'sekret', zrodlo: 'wzorzec grupy Sekrety (D-42)' };

  if (wDowiazaniuPozaKorzenie(kontekst, poz)) {
    return { powod: 'dowiazanie poza projekt', zrodlo: 'realpath poza korzeniami' };
  }

  return null;
}

// --- pomiar calosci ----------------------------------------------------------

function artefaktyRobocze(cwd, opcje) {
  const start = Date.now();
  const katalog = path.resolve(cwd || process.cwd());
  const o = opcje || {};
  const zrodla = o.zrodla || ['work', 'temp', 'repo'];
  const limit = o.limitWpisow || LIMIT_WPISOW;
  const kontekst = o.kontekst || kontekstBramki(katalog, o);
  const slug = slugProjektu(katalog);
  const pozycje = [];
  let bezGita = false;

  if (zrodla.includes('work')) {
    for (const wpis of katalogiWork(katalog)) {
      const opis = opiszWork(katalog, wpis);
      const p = pozycja(katalog, wpis.cel, opis.pochodzenie, 'work', limit);
      p.trwa = opis.trwa;
      p.opisPochodzenia = opis.opis;
      pozycje.push(p);
    }
  }

  if (zrodla.includes('temp')) {
    const tmp = os.tmpdir();
    let wpisy = [];
    try {
      wpisy = fs.readdirSync(tmp, { withFileTypes: true });
    } catch (_) {
      wpisy = [];
    }
    const prefiksy = [slug + '-', slug + '_', 'relai-'];
    for (const w of wpisy) {
      const nazwa = w.name.toLowerCase();
      const pasuje = prefiksy.find((pref) => nazwa.startsWith(pref));
      if (!pasuje) continue;
      const p = pozycja(katalog, path.join(tmp, w.name), pasuje === 'relai-' ? 'temp-relai' : 'temp-projekt', 'temp', limit);
      p.wzgledna = naPosix(path.join(tmp, w.name));
      pozycje.push(p);
    }
  }

  if (zrodla.includes('repo')) {
    if (!maGita(katalog)) {
      bezGita = true;
    } else {
      const wpisy = wpisyRepo(katalog);
      if (!wpisy) {
        bezGita = true;
      } else {
        const korzenWork = KATALOG_WORK.join('/');
        for (const w of wpisy) {
          // Katalog roboczy ma wlasne zrodlo ("work") i wlasne statusy. Gdyby wchodzil tu
          // jeszcze raz jako jedna pozycja repo, jedno "tak" kasowalo by takze etap w toku.
          if (w.sciezka === korzenWork || w.sciezka.startsWith(korzenWork + '/')) continue;
          const cel = path.join(katalog, ...w.sciezka.split('/'));
          pozycje.push(pozycja(katalog, cel, w.kod === '!!' ? 'ignorowane' : 'niesledzone', 'repo', limit));
        }
      }
    }
  }

  for (const p of pozycje) p.chronione = bramka(p, kontekst);

  const kandydaci = pozycje.filter((p) => !p.chronione);
  const suma = kandydaci.reduce((s, p) => s + p.bajty, 0);

  return {
    cwd: katalog,
    slug,
    pozycje,
    kandydaci,
    chronione: pozycje.filter((p) => p.chronione),
    suma,
    bezGita,
    repo: bezGita ? null : pozycje.filter((p) => p.zrodlo === 'repo'),
    czas: Date.now() - start,
    kontekst,
  };
}

// --- grupy -------------------------------------------------------------------

function pytanieGrupy(nazwa, pozycje) {
  const bajty = pozycje.reduce((s, p) => s + p.bajty, 0);
  const daty = pozycje.map((p) => p.data).filter(Boolean).sort();
  const pochodzenia = Array.from(new Set(pozycje.map((p) => p.pochodzenie))).join(', ');
  const zakres = daty.length ? (daty[0] === daty[daty.length - 1] ? daty[0] : daty[0] + '..' + daty[daty.length - 1]) : 'brak daty';
  return nazwa + ' — ' + pozycje.length + ' poz., ' + mb(bajty) + ' MB, ' + zakres + ', ' + pochodzenia;
}

function grupy(miara) {
  const wynik = [];
  const dodaj = (id, nazwa, pozycje) => {
    if (!pozycje.length) return;
    wynik.push({
      id,
      nazwa,
      pozycje,
      bajty: pozycje.reduce((s, p) => s + p.bajty, 0),
      pytanie: pytanieGrupy(nazwa, pozycje),
    });
  };

  for (const p of miara.kandydaci.filter((k) => k.zrodlo === 'work')) {
    dodaj('work:' + p.wzgledna, 'etap zamkniety: ' + p.wzgledna + ' (' + p.opisPochodzenia + ')', [p]);
  }

  const repo = miara.kandydaci.filter((k) => k.zrodlo === 'repo');
  const cache = repo.filter((p) => CACHE_REGENEROWALNE.includes(path.basename(p.sciezka)));
  dodaj('cache', 'cache regenerowalne', cache);

  const pozostale = repo.filter((p) => !cache.includes(p));
  const wgKatalogu = new Map();
  for (const p of pozostale) {
    const segmenty = p.wzgledna.split('/');
    const klucz = segmenty.length > 1 ? segmenty[0] : '__korzen__';
    if (!wgKatalogu.has(klucz)) wgKatalogu.set(klucz, []);
    wgKatalogu.get(klucz).push(p);
  }
  for (const [klucz, lista] of wgKatalogu) {
    if (klucz === '__korzen__') dodaj('repo:korzen', 'repo: korzen', lista);
    else dodaj('repo:' + klucz, 'repo: katalog ' + klucz, lista);
  }

  dodaj('temp:projekt', 'TEMP: nazwa projektu (' + miara.slug + ')', miara.kandydaci.filter((k) => k.pochodzenie === 'temp-projekt'));
  dodaj('temp:relai', 'TEMP: relai-* (wspolne dla wszystkich projektow RelAI na tej maszynie)', miara.kandydaci.filter((k) => k.pochodzenie === 'temp-relai'));

  return wynik;
}

// --- raport ------------------------------------------------------------------

function pozycjaDoJson(p) {
  return {
    sciezka: p.sciezka,
    wzgledna: p.wzgledna,
    bajty: p.bajty,
    pliki: p.pliki,
    data: p.data,
    niepelne: p.niepelne || false,
    dowiazanie: p.dowiazanie || false,
    pochodzenie: p.pochodzenie,
    zrodlo: p.zrodlo,
    chronione: p.chronione,
  };
}

function raport(cwd, opcje) {
  const katalog = path.resolve(cwd || process.cwd());
  const miara = artefaktyRobocze(katalog, opcje);
  const g = grupy(miara);
  const wynik = {
    cwd: miara.cwd,
    slug: miara.slug,
    data: dzisiaj(),
    bezGita: miara.bezGita,
    suma: miara.suma,
    czas: miara.czas,
    grupy: g.map((x) => ({
      id: x.id,
      nazwa: x.nazwa,
      bajty: x.bajty,
      pytanie: x.pytanie,
      pozycje: x.pozycje.map(pozycjaDoJson),
    })),
    chronione: miara.chronione.map(pozycjaDoJson),
  };
  const plik = path.join(katalog, '.claude', 'relai', 'clean-raport.json');
  try {
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.writeFileSync(plik, JSON.stringify(wynik, null, 2), 'utf8');
    wynik.plikRaportu = plik;
  } catch (_) {
    wynik.plikRaportu = null;
  }
  return wynik;
}

// Wersja dla czlowieka. Wlasne slowa raportu sa ASCII (L-0016), ale SCIEZKI wypisujemy
// doslownie — sciezka bez ogonkow nie jest ta sama sciezka i nie da sie jej skopiowac.
function raportTekst(r) {
  const linie = [];
  linie.push('[RelAI artefakty robocze] ' + r.cwd);
  if (r.bezGita) linie.push('Brak repozytorium git - skan plikow niesledzonych pominiety.');
  if (!r.grupy.length) {
    linie.push('Brak kandydatow do sprzatania.');
  }
  for (const g of r.grupy) {
    linie.push('');
    linie.push('* ' + g.nazwa + '  [' + mb(g.bajty) + ' MB, ' + g.pozycje.length + ' poz.]');
    const najciezsze = g.pozycje.slice().sort((a, b) => b.bajty - a.bajty);
    for (const p of najciezsze.slice(0, 10)) {
      linie.push('    ' + (p.niepelne ? '>=' : '  ') + mb(p.bajty) + ' MB  ' + p.data + '  ' + p.sciezka);
    }
    if (najciezsze.length > 10) linie.push('    ... i ' + (najciezsze.length - 10) + ' dalszych pozycji (pelna lista w clean-raport.json)');
  }
  if (r.chronione.length) {
    linie.push('');
    linie.push('Chronione (' + r.chronione.length + ') - nie sa kandydatami:');
    for (const p of r.chronione) {
      linie.push('    ' + p.wzgledna + '  [' + p.chronione.powod + ' / ' + p.chronione.zrodlo + ']');
    }
  }
  linie.push('');
  linie.push('Suma kandydatow: ' + mb(r.suma) + ' MB. Pomiar: ' + r.czas + ' ms.');
  if (r.plikRaportu) linie.push('Pelny raport: ' + r.plikRaportu);
  return linie.join('\n');
}

// --- kasowanie ---------------------------------------------------------------

// Asercje przed czymkolwiek (ryzyko 2 planu). Sciezka musi lezec POD katalogiem projektu albo
// POD os.tmpdir() i nie moze byc ktorymkolwiek z tych korzeni ani .git projektu.
function ocenSciezke(cwd, tmp, gitDir, p) {
  const bez = path.resolve(p);
  let rzeczywista = bez;
  try {
    if (fs.existsSync(bez)) {
      const st = fs.lstatSync(bez);
      // Dowiazanie oceniamy po SOBIE, nie po celu — usuwamy dowiazanie, nie to, na co wskazuje.
      rzeczywista = st.isSymbolicLink() ? path.resolve(fs.realpathSync(path.dirname(bez)), path.basename(bez)) : fs.realpathSync(bez);
    }
  } catch (_) {
    return { ok: false, powod: 'nie da sie rozwiazac sciezki' };
  }
  if (rzeczywista === cwd || rzeczywista === tmp) return { ok: false, powod: 'korzen — katalog projektu albo TEMP' };
  const pod = (korzen) => rzeczywista.startsWith(korzen + path.sep);
  if (!pod(cwd) && !pod(tmp)) return { ok: false, powod: 'poza katalogiem projektu i poza TEMP' };
  if (rzeczywista === gitDir || rzeczywista.startsWith(gitDir + path.sep)) {
    return { ok: false, powod: '.git projektu' };
  }
  return { ok: true, rzeczywista };
}

function sumaSciezek(sciezki) {
  let s = 0;
  for (const p of sciezki) s += zmierz(p, LIMIT_WPISOW).bajty;
  return s;
}

function kasuj(sciezki, opcje) {
  const o = opcje || {};
  const cwd = path.resolve(o.cwd || process.cwd());
  const tmp = fs.realpathSync(os.tmpdir());
  const gitDir = path.join(cwd, '.git');
  const lista = Array.isArray(sciezki) ? sciezki : [];

  const skasowane = [];
  const niepowodzenia = [];
  const odmowy = [];
  const przed = sumaSciezek(lista);

  for (const wejscie of lista) {
    const ocena = ocenSciezke(cwd, tmp, gitDir, wejscie);
    if (!ocena.ok) {
      odmowy.push({ sciezka: String(wejscie), powod: ocena.powod });
      continue;
    }
    const cel = ocena.rzeczywista;
    let st = null;
    try {
      st = fs.lstatSync(cel);
    } catch (_) {
      skasowane.push(cel); // juz go nie ma — stan docelowy osiagniety
      continue;
    }
    try {
      if (st.isSymbolicLink()) {
        // Dowiazanie i junction usuwamy jako dowiazanie, bez wchodzenia do celu.
        try {
          fs.unlinkSync(cel);
        } catch (_) {
          fs.rmdirSync(cel);
        }
      } else {
        fs.rmSync(cel, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
      }
      skasowane.push(cel);
    } catch (e) {
      niepowodzenia.push({ sciezka: cel, kod: e.code || 'BLAD', komunikat: String(e.message || e) });
    }
  }

  // Nigdy nie zglaszamy "skasowano" bez ponownego pomiaru.
  const po = sumaSciezek(lista);
  return { skasowane, niepowodzenia, odmowy, przed, po };
}

// --- marker "zostaw na zawsze" ----------------------------------------------

// Korzen repozytorium, do ktorego nalezy sciezka: pierwszy katalog z .git w gore.
// null = sciezka nie lezy w zadnym repozytorium.
function korzenRepo(sciezka) {
  let dir = path.dirname(path.resolve(sciezka));
  let poprzedni = null;
  while (dir && dir !== poprzedni) {
    if (maGita(dir)) return dir;
    poprzedni = dir;
    dir = path.dirname(dir);
  }
  return null;
}

// Od 1.8.1 (odnoga GUARD_PO_SCIEZCE) check-ignore pytamy w repozytorium, do ktorego nalezy
// SPRAWDZANA SCIEZKA, a nie w tym, w ktorym stoi sesja: dla pliku z innego projektu
// odpowiedz z cwd sesji dotyczyla cudzej historii i brzmiala tak samo pewnie.
function juzIgnorowana(cwd, wzgledna, bezwzgledna) {
  for (const m of czytajMarkery(cwd)) {
    if (m.re.test(wzgledna)) return true;
  }
  const cel = path.resolve(cwd, bezwzgledna || wzgledna);
  const korzen = korzenRepo(cel);
  if (!korzen) return false;
  try {
    git(korzen, ['check-ignore', '-q', '--', relatywna(korzen, cel)]);
    return true;
  } catch (_) {
    return false;
  }
}

// Dopisuje flage "zachowaj". Nie zmienia zadnej innej linii pliku.
function dopiszMarker(cwd, sciezka) {
  const katalog = path.resolve(cwd || process.cwd());
  const bez = path.resolve(katalog, sciezka);
  const wzgledna = relatywna(katalog, bez);
  const marker = '# relai: zachowaj';

  const gitignore = path.join(katalog, '.gitignore');
  const linie = czytajLinie(gitignore);
  if (linie) {
    for (let i = 0; i < linie.length; i++) {
      const t = linie[i].trim();
      if (!t || t.startsWith('#')) continue;
      const re = wzorzecNaRegex(t);
      if (!re || !re.test(wzgledna)) continue;
      // Wzorzec juz jest — dokladamy nad nim wylacznie linie-marker, gdy jej brak.
      const poprzednia = i > 0 ? linie[i - 1].trim() : '';
      if (MARKER_RE.test(poprzednia)) return { gdzie: '.gitignore', zmiana: 'brak — marker juz stoi', wzorzec: t };
      linie.splice(i, 0, marker);
      fs.writeFileSync(gitignore, linie.join('\n'), 'utf8');
      return { gdzie: '.gitignore', zmiana: 'dopisana linia-marker', wzorzec: t };
    }
  }

  if (maGita(katalog)) {
    const exclude = path.join(katalog, '.git', 'info', 'exclude');
    let tresc = '';
    try {
      tresc = fs.readFileSync(exclude, 'utf8');
    } catch (_) {
      tresc = '';
    }
    if (!juzIgnorowana(katalog, wzgledna, bez)) {
      const dopisek = (tresc && !tresc.endsWith('\n') ? '\n' : '') + marker + '\n' + wzgledna + '\n';
      fs.mkdirSync(path.dirname(exclude), { recursive: true });
      fs.appendFileSync(exclude, dopisek, 'utf8');
      return { gdzie: '.git/info/exclude', zmiana: 'dopisany wzorzec z markerem', wzorzec: wzgledna };
    }
    return { gdzie: '.git/info/exclude', zmiana: 'brak — sciezka juz ignorowana', wzorzec: wzgledna };
  }

  const keep = path.join(katalog, '.claude', 'relai', 'keep');
  let tresc = '';
  try {
    tresc = fs.readFileSync(keep, 'utf8');
  } catch (_) {
    tresc = '';
  }
  if (tresc.split(/\r?\n/).some((l) => l.trim() === wzgledna)) {
    return { gdzie: '.claude/relai/keep', zmiana: 'brak — sciezka juz na liscie', wzorzec: wzgledna };
  }
  fs.mkdirSync(path.dirname(keep), { recursive: true });
  fs.appendFileSync(keep, (tresc && !tresc.endsWith('\n') ? '\n' : '') + wzgledna + '\n', 'utf8');
  return { gdzie: '.claude/relai/keep', zmiana: 'dopisana sciezka', wzorzec: wzgledna };
}

module.exports = {
  slugProjektu,
  czytajMarkery,
  artefaktyRobocze,
  bramka,
  grupy,
  raport,
  raportTekst,
  kasuj,
  dopiszMarker,
  juzIgnorowana, // eksportowana dla instrumentu porownawczego odnogi GUARD_PO_SCIEZCE
  korzenRepo,
  kontekstBramki,
  LIMIT_WPISOW,
};

// --- CLI ---------------------------------------------------------------------
// node work-artifacts.js raport [--json]
// node work-artifacts.js kasuj <plik-listy.json>     (plik: tablica sciezek z raportu)
// node work-artifacts.js zachowaj <sciezka>
// Kody wyjscia: 0 ok, 1 niepowodzenia w kasowaniu, 2 zle uzycie.
if (require.main === module) {
  const args = process.argv.slice(2);
  const polecenie = args[0];
  const cwd = process.cwd();

  if (polecenie === 'raport') {
    const r = raport(cwd, {});
    if (args.includes('--json')) process.stdout.write(JSON.stringify(r, null, 2) + '\n');
    else process.stdout.write(raportTekst(r) + '\n');
    process.exit(0);
  }

  if (polecenie === 'kasuj') {
    const plik = args[1];
    if (!plik) {
      process.stderr.write('Uzycie: node work-artifacts.js kasuj <plik-listy.json>\n');
      process.exit(2);
    }
    let lista;
    try {
      lista = JSON.parse(fs.readFileSync(plik, 'utf8'));
    } catch (e) {
      process.stderr.write('Nie da sie odczytac listy: ' + plik + '\n');
      process.exit(2);
    }
    if (!Array.isArray(lista)) {
      process.stderr.write('Lista musi byc tablica sciezek.\n');
      process.exit(2);
    }
    const w = kasuj(lista, { cwd });
    process.stdout.write('Skasowane: ' + w.skasowane.length + '\n');
    for (const p of w.skasowane) process.stdout.write('  OK      ' + p + '\n');
    for (const o of w.odmowy) process.stdout.write('  ODMOWA  ' + o.sciezka + '  (' + o.powod + ')\n');
    for (const n of w.niepowodzenia) process.stdout.write('  BLAD    ' + n.sciezka + '  (' + n.kod + ')\n');
    process.stdout.write('Przed: ' + mb(w.przed) + ' MB, po: ' + mb(w.po) + ' MB\n');
    if (w.niepowodzenia.length) {
      process.stdout.write('\nDo skasowania recznie (narzedzie nie dalo rady):\n');
      for (const n of w.niepowodzenia) process.stdout.write('  ' + n.sciezka + '\n');
    }
    process.exit(w.niepowodzenia.length ? 1 : 0);
  }

  if (polecenie === 'zachowaj') {
    const sciezka = args[1];
    if (!sciezka) {
      process.stderr.write('Uzycie: node work-artifacts.js zachowaj <sciezka>\n');
      process.exit(2);
    }
    const w = dopiszMarker(cwd, sciezka);
    process.stdout.write(w.gdzie + ': ' + w.zmiana + ' (' + w.wzorzec + ')\n');
    process.exit(0);
  }

  process.stderr.write('Uzycie: node work-artifacts.js raport [--json] | kasuj <plik-listy.json> | zachowaj <sciezka>\n');
  process.exit(2);
}
