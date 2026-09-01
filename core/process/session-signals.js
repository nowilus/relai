#!/usr/bin/env node
'use strict';
// RelAI core / proces: session-signals — rozpoznanie stanu projektu dla hooka startu sesji.
//
// Ten plik nalezy do RDZENIA: nie wie nic o protokole hookow zadnego narzedzia, nie czyta
// stdin, nie zna pojecia "permissionDecision" ani "additional_context". Zna wylacznie
// katalog projektu na wejsciu i FAKTY na wyjsciu. Protokol nalezy do adaptera.
//
// Wyjatek od reguly "formatowanie u adaptera": raport budzetu startowego
// (startCostReport, 1.6.0). Plan OPTYMALIZACJA_KONTEKSTU wymaga, zeby oba adaptery
// dawaly TEN SAM raport i zeby miescil sie w szesciu liniach — jedno brzmienie w dwoch
// plikach rozjechaloby sie przy pierwszej poprawce (ryzyko P4). Adapter decyduje
// wylacznie o tym, czy i jak te linie wstrzyknac.
//
// Powstal w E5 (1.5.0), gdy drugi adapter (Cursor) potrzebowal tych samych rozpoznan:
// marker projektu, tryb goscia, wersja projektu, luka promptu etapowego (D-34), rozjazd
// stanu (1.3.0), nieznany autor (D-27), ustawienia globalne (D-23) i prowizjonowanie
// specyfikacji do projektu (R8). Bez wydzielenia oba adaptery trzymalyby te sama logike
// w dwoch miejscach — dokladnie ryzyko P4 (dryf rdzenia i adapterow).
//
// Zero zaleznosci npm.

const fs = require('fs');
const os = require('os');
const path = require('path');

// Domyslne markery trybu goscia: kazdy adapter dodaje swoj katalog konfiguracyjny.
const DOMYSLNE_MARKERY_GOSCIA = ['.claude/relai.json', '.cursor/relai.json'];

function isGuest(cwd, markery) {
  const lista = Array.isArray(markery) && markery.length ? markery : DOMYSLNE_MARKERY_GOSCIA;
  for (const rel of lista) {
    const p = path.join(cwd, ...String(rel).split('/'));
    let txt = null;
    try {
      if (!fs.existsSync(p)) continue;
      txt = fs.readFileSync(p, 'utf8');
    } catch (_) {
      return true; // nieczytelny marker = zachowaj sie jak poza projektem RelAI
    }
    try {
      const j = JSON.parse(txt);
      if (j && j.mode === 'guest') return true;
    } catch (_) {
      return true;
    }
  }
  return false;
}

// Marker projektu RelAI: plik w docs/ z linia "Wersja RelAI:" albo "RelAI version:".
// Zwraca sciezke pliku albo null (brak struktury, tryb goscia, nieczytelne docs/).
function relaiMarkerFile(cwd, markeryGoscia) {
  try {
    if (!cwd || isGuest(cwd, markeryGoscia)) return null;
    const docsDir = path.join(cwd, 'docs');
    let entries = [];
    try { entries = fs.readdirSync(docsDir); } catch (_) { return null; }
    const candidates = [];
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      if (entries.includes(name)) candidates.push(name);
    }
    for (const f of entries) {
      if (/\.md$/i.test(f) && !candidates.includes(f)) candidates.push(f);
      if (candidates.length >= 40) break;
    }
    for (const f of candidates) {
      let head = '';
      try { head = fs.readFileSync(path.join(docsDir, f), 'utf8').slice(0, 4000); } catch (_) { continue; }
      if (/Wersja RelAI:|RelAI version:/i.test(head)) return path.join(docsDir, f);
    }
    return null;
  } catch (_) {
    return null;
  }
}

function todayLocal() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function projectVersion(markerFile) {
  try {
    const m = fs.readFileSync(markerFile, 'utf8').match(/(?:Wersja RelAI|RelAI version)\s*:\s*([0-9][0-9A-Za-z.\-]*)/i);
    return m ? m[1] : '';
  } catch (_) {
    return '';
  }
}

// --- prowizjonowanie specyfikacji (R8, L-0012) ------------------------------
// Rozszerzenia kopiowane do projektu: specyfikacje (.md) oraz szablon HTML planow
// (szkielet i komponenty .html, builder fontow .js, fonty .woff2).
const KOPIOWANE = /\.(md|html|js|css|woff2)$/i;

function copyTree(src, dest) {
  let n = 0;
  let wpisy;
  try { wpisy = fs.readdirSync(src, { withFileTypes: true }); } catch (_) { return 0; }
  for (const wpis of wpisy) {
    const zrodlo = path.join(src, wpis.name);
    const cel = path.join(dest, wpis.name);
    if (wpis.isDirectory()) {
      try { fs.mkdirSync(cel, { recursive: true }); } catch (_) { continue; }
      n += copyTree(zrodlo, cel);
    } else if (KOPIOWANE.test(wpis.name)) {
      try { fs.copyFileSync(zrodlo, cel); n++; } catch (_) { /* cisza */ }
    }
  }
  return n;
}

// Kopiuje core/templates/ do <cwd>/<destRel>/templates/. destRel domyslnie ".claude/relai"
// — ta sama sciezka w obu adapterach, zeby komendy i skille mowily o jednym miejscu.
// Zwraca liczbe skopiowanych plikow (0 = awaria albo brak zrodla — adapter milczy).
function provisionTemplates(cwd, opcje) {
  try {
    const o = opcje || {};
    const src = o.coreTemplates || path.resolve(__dirname, '..', 'templates');
    if (!fs.existsSync(src)) return 0;
    const destRoot = path.join(cwd, ...String(o.destRel || '.claude/relai').split('/'));
    const dest = path.join(destRoot, 'templates');
    fs.mkdirSync(dest, { recursive: true });
    // .gitignore z "*" — lokalna kopia to cache narzedzia, nie zawartosc repo
    try { fs.writeFileSync(path.join(destRoot, '.gitignore'), '*\n'); } catch (_) { /* cisza */ }
    return copyTree(src, dest);
  } catch (_) {
    return 0;
  }
}

// --- ustawienia globalne (D-23, L-0010) -------------------------------------
// Warstwa globalna mieszka w ~/.claude/relai/ niezaleznie od narzedzia: to ustawienia
// RelAI, a nie Claude Code, i uzytkownik pracujacy naprzemiennie ma miec je jedne.
function globalSettingsText(katalogRel) {
  try {
    const rel = String(katalogRel || '.claude/relai').split('/');
    const dir = path.join(os.homedir(), ...rel);
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8').trim().slice(0, 2500);
        if (txt) return { file: '~/' + rel.join('/') + '/' + name, text: txt };
      }
    }
    return null;
  } catch (_) {
    return null;
  }
}

// --- siatka D-34: brakujacy prompt etapowy ----------------------------------
function promptGap(cwd) {
  try {
    // Jedno zrodlo prawdy o tym, ktora linia CLAUDE.md wskazuje aktywny plan.
    const linia = liniaAktywnegoPlanu(cwd);
    if (!linia || linia.brak || !linia.link) return null;
    const statusPath = path.resolve(cwd, linia.link);
    if (!fs.existsSync(statusPath)) return null;
    const statusDir = path.dirname(statusPath);
    const rows = fs.readFileSync(statusPath, 'utf8').split('\n').filter((l) => l.trim().startsWith('|'));
    for (const row of rows) {
      const cells = row.split('|').map((c) => c.trim());
      if (cells.length < 6) continue;
      if (!/GOTOWY DO STARTU|READY TO START/i.test(cells[3])) continue;
      const promptCell = cells[4] || '';
      const m = promptCell.match(/\]\(([^)]+)\)/);
      if (m && fs.existsSync(path.resolve(statusDir, m[1]))) return null;
      return { stage: cells[1] || '?', statusFile: path.relative(cwd, statusPath) };
    }
    return null;
  } catch (_) {
    return null;
  }
}

// --- rozjazd stanu (1.3.0) --------------------------------------------------
function czytaj(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
}

function planyZEtapemWToku(cwd) {
  const wynik = [];
  const root = path.join(cwd, 'docs', 'plany');
  let wpisy = [];
  try { wpisy = fs.readdirSync(root, { withFileTypes: true }); } catch (_) { return wynik; }
  for (const w of wpisy) {
    if (!w.isDirectory()) continue;
    const statusPath = path.join(root, w.name, 'STATUS.md');
    const txt = czytaj(statusPath);
    if (!txt) continue;
    for (const row of txt.split('\n')) {
      if (!row.trim().startsWith('|')) continue;
      const cells = row.split('|').map((c) => c.trim());
      if (cells.length < 6) continue;
      if (!/^\**\s*(W TOKU|IN PROGRESS)\b/i.test(cells[3])) continue;
      wynik.push({ temat: w.name, etap: cells[1] || '?', statusFile: path.relative(cwd, statusPath).split(path.sep).join('/') });
      break;
    }
  }
  return wynik;
}

// Fraza "Aktywny plan" pada w CLAUDE.md wiecej niz raz: najpierw w prozie rytualu
// startu (bez linku), dopiero nizej w linii wskazujacej plan. Branie PIERWSZEGO
// trafienia wyciszalo siatke D-34 i detektor rozjazdu w calym repozytorium — sygnal
// milczal nie dlatego, ze bylo zgodnie, tylko dlatego, ze nie mial czego porownac
// (poprawka 1.6.0, L-0047). Wygrywa linia, ktora NIESIE link do STATUS.md.
function liniaAktywnegoPlanu(cwd) {
  const txt = czytaj(path.join(cwd, 'CLAUDE.md'));
  if (!txt) return null;
  const linie = txt.split('\n').filter((l) => /Aktywny plan|Active plan/i.test(l));
  if (!linie.length) return { brak: true, pusta: true, link: null };
  const zLinkiem = linie.find((l) => /\]\([^)]+STATUS\.md\)/i.test(l));
  if (!zLinkiem) {
    if (linie.some((l) => /:\s*brak|:\s*none/i.test(l))) return { brak: true, pusta: false, link: null };
    return { brak: false, pusta: false, link: null };
  }
  const m = zLinkiem.match(/\]\(([^)]+)\)/);
  return { brak: false, pusta: false, link: m ? m[1] : null };
}

function stateDrift(cwd) {
  try {
    const linia = liniaAktywnegoPlanu(cwd);
    if (!linia) return null; // brak CLAUDE.md — nie ma czego porownywac
    const fakty = [];

    if (linia.link && !fs.existsSync(path.resolve(cwd, linia.link))) {
      fakty.push('linia "Aktywny plan" w CLAUDE.md wskazuje ' + linia.link + ', a tego pliku nie ma');
    }

    const wToku = planyZEtapemWToku(cwd);
    for (const p of wToku) {
      if (linia.brak) {
        fakty.push(p.statusFile + ' ma etap ' + p.etap + ' w statusie W TOKU, a CLAUDE.md mowi ' +
          (linia.pusta ? 'o aktywnym planie nic' : '"Aktywny plan: brak"'));
      } else if (linia.link) {
        const wskazany = path.resolve(cwd, linia.link);
        const wlasny = path.resolve(cwd, p.statusFile);
        if (wskazany !== wlasny && fs.existsSync(wskazany)) {
          fakty.push(p.statusFile + ' ma etap ' + p.etap + ' w statusie W TOKU, a linia "Aktywny plan" ' +
            'wskazuje inny plan (' + linia.link + ')');
        }
      }
      const state = czytaj(path.join(cwd, 'docs', 'STATE.md'));
      if (state && state.indexOf(p.temat) === -1) {
        fakty.push('docs/STATE.md nie wspomina planu ' + p.temat + ', ktorego etap ' + p.etap + ' jest W TOKU');
      }
    }

    return fakty.length ? fakty : null;
  } catch (_) {
    return null;
  }
}

// --- nieznany autor (D-27) --------------------------------------------------
function bezOgonkow(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[Łł]/g, 'l').toLowerCase().trim();
}

function gitUserName(cwd) {
  const pliki = [
    path.join(cwd, '.git', 'config'),
    path.join(os.homedir(), '.gitconfig'),
    path.join(os.homedir(), '.config', 'git', 'config'),
  ];
  for (const p of pliki) {
    let txt = '';
    try { txt = fs.readFileSync(p, 'utf8'); } catch (_) { continue; }
    const sekcja = txt.match(/\[user\][^[]*/i);
    if (!sekcja) continue;
    const m = sekcja[0].match(/^\s*name\s*=\s*(.+)$/mi);
    if (m && m[1].trim()) return m[1].trim();
  }
  return '';
}

function unknownAuthor(cwd) {
  try {
    const nazwa = gitUserName(cwd);
    if (!nazwa) return null;

    let dziennik = '';
    for (const name of ['DZIENNIK.md', 'JOURNAL.md']) {
      const p = path.join(cwd, 'docs', name);
      try { dziennik = fs.readFileSync(p, 'utf8'); } catch (_) { continue; }
      if (dziennik) break;
    }
    if (!dziennik) return null;

    const podpisy = dziennik.match(/^\s*(?:\*\*)?(?:Autor|Author)(?:\*\*)?\s*:\s*(.+)$/gmi);
    if (!podpisy || !podpisy.length) return null;

    const ja = bezOgonkow(nazwa);
    const czesci = ja.split(/\s+/).filter((c) => c.length >= 3);
    for (const linia of podpisy) {
      const l = bezOgonkow(linia);
      if (l.indexOf(ja) !== -1) return null;
      if (czesci.length && czesci.every((c) => l.indexOf(c) !== -1)) return null;
    }

    const ostatni = podpisy[podpisy.length - 1].replace(/^\s*(?:\*\*)?(?:Autor|Author)(?:\*\*)?\s*:\s*/i, '').trim();
    return { ja: nazwa, ostatni: ostatni.slice(0, 120), wpisow: podpisy.length };
  } catch (_) {
    return null;
  }
}

// --- miara warstwy startowej (1.6.0, plan OPTYMALIZACJA_KONTEKSTU E1) --------
// Rytual startu sesji czyta szesc pozycji. Ta funkcja liczy, ile one waza, i
// porownuje z budzetem z wiersza "Budzet startu sesji" w USTAWIENIA.md.
// Mierzy to, co rytual naprawde czyta: caly plik tam, gdzie czytany jest caly
// plik, i sekcje tam, gdzie czytana jest sekcja.

const KB = 1024;

// Progi domyslne w KB. Jedyne zrodlo prawdy o tych wartosciach to
// core/templates/SPEC_USTAWIENIA.md — tutaj stoi ich kopia wykonawcza.
const PROGI_DOMYSLNE = {
  start: 80,
  CLAUDE: 10,
  STATE: 12,
  ryzyka: 12,
  zasady: 30,
  ustawienia: 6,
  status: 10,
};

// Nazwy czlonow komorki, per pozycja: polska i angielska.
const CZLONY = {
  start: ['start'],
  CLAUDE: ['claude'],
  STATE: ['state'],
  ryzyka: ['ryzyka', 'risks'],
  zasady: ['zasady', 'rules'],
  ustawienia: ['ustawienia', 'settings'],
  status: ['status'],
};

// Progi rotacji dokumentow w jednostkach mechanizmu kontrolnego (KB, sztuki, linie).
// Jedyne zrodlo prawdy o tych wartosciach to core/templates/SPEC_ARCHIWUM.md — tutaj stoi
// ich kopia wykonawcza. To NIE sa progi czastkowe budzetu: nie sumuja sie do 80 KB,
// dokument nad wlasnym progiem jest osobnym faktem (1.7.0, E4).
const PROGI_ROTACJI_DOMYSLNE = {
  dziennik: 150, // KB
  lekcjeKB: 50, // KB
  lekcjeWpisy: 40, // sztuk
  STATE: 300, // linii
};

// Prog sekcji "Lekcje zwiniete" w KB. Zrodlo prawdy: core/templates/SPEC_LEKCJE.md,
// sekcja "Kompresja" ("gdy sekcja sama urosnie ponad 30 KB").
const PROG_ZWINIETE_KB = 30;

const NAZWA_WIERSZA = /^(?:Bud[żz]et startu sesji|Session start budget)\b/i;
// Drugi, NIEZALEZNY wylacznik (sekcja 8 planu): rotacja moze byc wylaczona przy
// wlaczonym budzecie i odwrotnie. Czytamy go jako FAKT — decyzje o tym, co z nim
// zrobic, podejmuje raport i procedura rotacji, nie ta funkcja.
const NAZWA_ROTACJI = /^(?:Rotacja dokument[óo]w|Document rotation)\b/i;
const WLACZONY = /^(?:w[łl][ąa]czony|w[łl][ąa]czona|on|enabled)\b/i;
const WYLACZONY = /^(?:wy[łl][ąa]czony|wy[łl][ąa]czona|off|disabled)\b/i;

// Naglowki sekcji — kotwica na POCZATKU linii naglowka (L-0025), nie "gdziekolwiek".
const NAGLOWEK_RYZYK = [/^stan otwartych ryzyk\b/i, /^open risks\b/i];
const NAGLOWEK_ZASAD = [/^zasady aktywne\b/i, /^active rules\b/i];
// Sekcja "Czeka na czlowieka" (1.6.0) wchodzi do pozycji "ryzyka", bo rytual startu czyta ja
// razem z ryzykami i ostatnim wpisem. NIE jest siodma pozycja budzetu — budzet ma szesc pozycji
// z sekcji 5 planu i tego etap nie rusza. Brak sekcji (projekt sprzed 1.6.0) = zero bajtow,
// nie awaria.
const NAGLOWEK_CZEKA = [/^czeka na cz[łl]owieka\b/i, /^waiting on a human\b/i];
// Sekcja "Lekcje" bez przymiotnika — kotwica domknieta na koncu tytulu, zeby "Lekcje zwiniete"
// nie trafila w to samo wyrazenie. Sekcja "Lekcje zwiniete" ma wlasny prog (SPEC_LEKCJE.md).
const NAGLOWEK_LEKCJI = [/^lekcje$/i, /^lessons$/i];
const NAGLOWEK_ZWINIETE = [/^lekcje zwini[ęe]te\b/i, /^folded lessons\b/i];
// Sekcja "Ustawienia wycofane" (SPEC_USTAWIENIA.md). Jej obecnosc rozstrzyga, KTORA procedura
// odchudza plik ustawien: rotacja do archiwum bierze wylacznie wiersze wycofane, a plik gruby
// samymi wierszami obowiazujacymi odchudza zwiezlosc komorki "Decyzja". Pozycja bez procedury
// nie wchodzi do raportu, wiec procedura musi byc ta, ktora naprawde zadziala.
const NAGLOWEK_WYCOFANE = [/^ustawienia wycofane\b/i, /^withdrawn settings\b/i];
// Naglowek pojedynczej lekcji: "### L-0007 — tytul". Bez kotwicy konca linii (CRLF, L-0033).
const NAGLOWEK_LEKCJI_POZYCJA = /^###\s+L-\d+/gm;

function bajty(txt) {
  return Buffer.byteLength(String(txt), 'utf8');
}

// Pierwszy istniejacy plik z listy nazw w katalogu — nazwa dokumentu podaza za
// jezykiem projektu (DZIENNIK.md / JOURNAL.md).
function pierwszyIstniejacy(dir, nazwy) {
  for (const n of nazwy) {
    const p = path.join(dir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function wytnijSekcje(txt, wzorce) {
  const linie = String(txt).split('\n');
  let start = -1;
  let poziom = 0;
  for (let i = 0; i < linie.length; i++) {
    // Bez kotwicy konca linii: kropka w JS nie obejmuje CR, wiec przy koncach linii
    // CRLF wzorzec zakotwiczony na koncu nie dopasowuje ZADNEGO naglowka — a naglowek
    // konczacy sekcje (wzorzec nizej, bez kotwicy) dopasowuje sie normalnie. Skutkiem
    // byla cicha degradacja do pomiaru calego pliku na repo z core.autocrlf=true.
    const m = linie[i].match(/^(#{1,6})\s+(.*)/);
    if (!m) continue;
    const tytul = m[2].replace(/[„”"'*`]/g, '').trim();
    if (wzorce.some((w) => w.test(tytul))) { start = i; poziom = m[1].length; break; }
  }
  if (start === -1) return null;
  let koniec = linie.length;
  for (let i = start + 1; i < linie.length; i++) {
    const m = linie[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= poziom) { koniec = i; break; }
  }
  return linie.slice(start, koniec).join('\n');
}

// Naglowek wpisu z data: "### RRRR-MM-DD — Temat". Bez kotwicy konca linii (CRLF, L-0033).
const NAGLOWEK_WPISU = /^###\s+(\d{4}-\d{2}-\d{2})\b/;
const NAGLOWEK_WPISU_BEZ_DATY = /^###\s+/;

// Ostatni wpis dziennika = wpis NAJNOWSZY, czyli o najpozniejszej dacie w naglowku.
// Kolejnosc wpisow w pliku jest wlasnoscia projektu (SPEC_DZIENNIK): RelAI dopisuje na koncu,
// ale projekt zaadoptowany bywa odwrotny. Czytanie "ostatniego naglowka w pliku" braloby tam
// wpis NAJSTARSZY — zmierzone na PolyFlow 2026-08-21: pozycja "ryzyka" urosla o 3,0 KB tylko
// dlatego, ze zmienil sie najstarszy wpis.
// Brak dat albo daty nieparsowalne -> zachowanie dotychczasowe (ostatni naglowek) i cisza.
function ostatniWpis(txt) {
  const linie = String(txt).split('\n');
  const zData = [];
  let ostatniNaglowek = -1;
  for (let i = 0; i < linie.length; i++) {
    if (!NAGLOWEK_WPISU_BEZ_DATY.test(linie[i])) continue;
    ostatniNaglowek = i;
    const m = linie[i].match(NAGLOWEK_WPISU);
    if (m) zData.push({ linia: i, data: m[1] });
  }
  if (ostatniNaglowek === -1) return null;
  if (zData.length < 2) return linie.slice(ostatniNaglowek).join('\n');

  // Kierunek pliku z danych, nie z nawyku: pierwsza data pozniejsza od ostatniej = malejaco.
  const malejaco = zData[0].data > zData[zData.length - 1].data;
  const najpozniejsza = zData.reduce((a, b) => (b.data > a.data ? b : a)).data;
  const kandydaci = zData.filter((w) => w.data === najpozniejsza);
  const wybrany = malejaco ? kandydaci[0] : kandydaci[kandydaci.length - 1];

  // Wpis konczy sie na kolejnym naglowku ### albo na naglowku sekcji wyzszego poziomu.
  let koniec = linie.length;
  for (let i = wybrany.linia + 1; i < linie.length; i++) {
    if (/^#{1,3}\s+/.test(linie[i])) { koniec = i; break; }
  }
  return linie.slice(wybrany.linia, koniec).join('\n');
}

// Komorka "Decyzja" wiersza o podanej nazwie. Nazwa dopasowywana od POCZATKU
// komorki "Czego dotyczy" — proza wspominajaca budzet w srodku komorki nie liczy sie.
function komorkaDecyzji(txt, nazwaWiersza) {
  for (const linia of String(txt).split('\n')) {
    if (!linia.trim().startsWith('|')) continue;
    const cells = linia.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    const czego = cells[2].replace(/\*\*/g, '').trim();
    if (!nazwaWiersza.test(czego)) continue;
    return cells[3].replace(/\*\*/g, '').trim();
  }
  return null;
}

function progiZKomorki(komorka) {
  const progi = Object.assign({}, PROGI_DOMYSLNE);
  const czlony = String(komorka).split('·').map((c) => c.trim()).filter(Boolean);
  for (const czlon of czlony.slice(1)) {
    for (const id of Object.keys(CZLONY)) {
      for (const nazwa of CZLONY[id]) {
        const m = czlon.match(new RegExp('^' + nazwa + '\\s+(\\d+)\\s*KB\\b', 'i'));
        if (m) progi[id] = parseInt(m[1], 10);
      }
    }
  }
  return progi;
}

// Sciezka do STATUS.md aktywnego planu — z tego samego zrodla co siatka D-34.
// Brak planu = pozycja nie wchodzi do sumy, a nie zero.
function sciezkaStatusuPlanu(cwd) {
  const linia = liniaAktywnegoPlanu(cwd);
  if (!linia || !linia.link) return null;
  const p = path.resolve(cwd, linia.link);
  return fs.existsSync(p) ? p : null;
}

// Przelacznik rotacji dokumentow jako FAKT: true / false / null.
// null znaczy "nie wiadomo" — brak wiersza albo wartosc nierozpoznana. Skill traktuje
// oba te przypadki jak wylaczona (SPEC_ARCHIWUM), wiec raport tez nie proponuje rotacji;
// zgadywanie jest tu zakazane (L-0025).
function przelacznikRotacji(txtUstawien) {
  const komorka = komorkaDecyzji(txtUstawien, NAZWA_ROTACJI);
  if (komorka === null) return null;
  if (WLACZONY.test(komorka)) return true;
  if (WYLACZONY.test(komorka)) return false;
  return null;
}

// Czlony komorki "Rotacja dokumentow" — kotwica na POCZATKU czlonu i zamknieta lista
// brzmien (L-0025, L-0035). Czlon nierozpoznany zostawia wartosc domyslna.
const CZLON_DZIENNIKA = /^(?:dziennik|journal)\s+(\d+)\s*KB\b/i;
const CZLON_LEKCJI = /^(?:lekcje|lessons)\s+(\d+)\s*(?:wpis[óo]w|wpisy|entries)\s+(?:albo|lub|or)\s+(\d+)\s*KB\b/i;
const CZLON_STATE = /^STATE\s+(\d+)\s*(?:lini[ie]|lines)\b/i;

function progiRotacjiZKomorki(komorka) {
  const progi = Object.assign({}, PROGI_ROTACJI_DOMYSLNE);
  const czlony = String(komorka).split('·').map((c) => c.trim()).filter(Boolean);
  for (const czlon of czlony.slice(1)) {
    let m = czlon.match(CZLON_DZIENNIKA);
    if (m) { progi.dziennik = parseInt(m[1], 10); continue; }
    m = czlon.match(CZLON_LEKCJI);
    if (m) {
      progi.lekcjeWpisy = parseInt(m[1], 10);
      progi.lekcjeKB = parseInt(m[2], 10);
      continue;
    }
    m = czlon.match(CZLON_STATE);
    if (m) progi.STATE = parseInt(m[1], 10);
  }
  return progi;
}

// Dokumenty i sekcje ponad WLASNYM progiem — inny fakt niz suma warstwy startowej.
// Kazda pozycja niesie nazwe procedury, ktora ja odchudza: pozycja bez procedury nie wchodzi
// do listy, bo raport bez procedury tylko marudzi (ryzyko 3 planu HIGIENA_DOKUMENTOW).
// Wyzwalaczem tej czesci jest wylacznik ROTACJI, nie budzetu — to dwa niezalezne wylaczniki
// (SPEC_USTAWIENIA.md). Rotacja wylaczona albo wartosc nierozpoznana → pusta lista i cisza.
function dokumentyPonadProgiem(cwd, txtUstawien, progRyzyk, progUstawien) {
  const out = [];
  // Waga porownywana z progiem rotacji liczy sie po normalizacji CRLF -> LF (L-0033),
  // tak jak sumy kontrolne rotacji — inaczej ten sam plik wazylby wiecej na Windowsie.
  const bajtyLF = (txt) => bajty(String(txt).replace(/\r\n/g, '\n'));
  try {
    if (przelacznikRotacji(txtUstawien) !== true) return out;
    const progi = progiRotacjiZKomorki(komorkaDecyzji(txtUstawien, NAZWA_ROTACJI));
    const docsDir = path.join(cwd, 'docs');

    const dodaj = (etykieta, wartosc, prog, jednostka, procedura) => {
      if (wartosc > prog) out.push({ etykieta, wartosc, prog, jednostka, procedura });
    };

    const dziennik = pierwszyIstniejacy(docsDir, ['DZIENNIK.md', 'JOURNAL.md']);
    if (dziennik) {
      const txt = czytaj(dziennik);
      dodaj(path.relative(cwd, dziennik).split(path.sep).join('/'),
        bajtyLF(txt), progi.dziennik * KB, 'KB', 'rotacja dziennika');
      // Sekcja ryzyk ma prog CZASTKOWY budzetu (SPEC_ARCHIWUM.md) — mierzona sama,
      // bez sekcji "Czeka na czlowieka" i bez ostatniego wpisu, bo to jej rotacja odchudza.
      const ryzyka = wytnijSekcje(txt, NAGLOWEK_RYZYK);
      if (ryzyka !== null && typeof progRyzyk === 'number') {
        dodaj('sekcja "Stan otwartych ryzyk"', bajtyLF(ryzyka), progRyzyk, 'KB',
          'rotacja ryzyk ZAMKNIETYCH do archiwum');
      }
    }

    const lekcje = pierwszyIstniejacy(docsDir, ['LEKCJE.md', 'LESSONS.md']);
    if (lekcje) {
      const txt = czytaj(lekcje);
      const sciezka = path.relative(cwd, lekcje).split(path.sep).join('/');
      const bajtow = bajtyLF(txt);
      const sekcjaLekcji = wytnijSekcje(txt, NAGLOWEK_LEKCJI);
      const sztuk = sekcjaLekcji === null
        ? 0
        : (sekcjaLekcji.match(NAGLOWEK_LEKCJI_POZYCJA) || []).length;
      // Prog lekcji ma dwie jednostki i dziala ta, ktora padnie pierwsza — ale pozycja
      // w raporcie jest jedna, bo procedura jest jedna.
      if (bajtow > progi.lekcjeKB * KB) {
        dodaj(sciezka, bajtow, progi.lekcjeKB * KB, 'KB', 'rotacja lekcji');
      } else if (sztuk > progi.lekcjeWpisy) {
        dodaj(sciezka, sztuk, progi.lekcjeWpisy, 'lekcji', 'rotacja lekcji');
      }
      const zwiniete = wytnijSekcje(txt, NAGLOWEK_ZWINIETE);
      if (zwiniete !== null) {
        dodaj('sekcja "Lekcje zwiniete"', bajtyLF(zwiniete), PROG_ZWINIETE_KB * KB, 'KB',
          'przeniesienie zwinietych lekcji do archiwum');
      }
    }

    const state = pierwszyIstniejacy(docsDir, ['STATE.md']);
    if (state) {
      const linii = czytaj(state).split('\n').length;
      dodaj(path.relative(cwd, state).split(path.sep).join('/'), linii, progi.STATE, 'linii',
        'skrocenie STATE.md');
    }

    // Plik ustawien (1.7.0, E5): prog CZASTKOWY budzetu, tak jak sekcja ryzyk. Dwa wylaczniki
    // zostaja niezalezne — wyzwalaczem tej listy jest rotacja, a wartosc progu mieszka w wierszu
    // budzetu i przychodzi tu parametrem.
    const ustawienia = pierwszyIstniejacy(docsDir, ['USTAWIENIA.md', 'SETTINGS.md']);
    if (ustawienia && typeof progUstawien === 'number') {
      const txt = czytaj(ustawienia);
      const wycofane = wytnijSekcje(txt, NAGLOWEK_WYCOFANE);
      // Rotacja ustawien bierze WYLACZNIE wiersze sekcji "Ustawienia wycofane". Brak sekcji albo
      // sekcja bez wierszy tabeli znaczy, ze plik jest gruby wierszami obowiazujacymi — te
      // odchudza zwiezlosc komorki "Decyzja", nie archiwum (SPEC_USTAWIENIA.md).
      const maWiersze = wycofane !== null
        && wycofane.split('\n').filter((l) => l.trim().startsWith('|')).length > 2;
      dodaj(path.relative(cwd, ustawienia).split(path.sep).join('/'),
        bajtyLF(txt), progUstawien, 'KB',
        maWiersze ? 'rotacja ustawien do archiwum' : 'zwiezlosc komorki Decyzja');
    }
  } catch (_) {
    return out;
  }
  return out;
}

// Zwraca:
//   null                              — pomiaru nie ma (wylaczony, brak wiersza, brak
//                                       ustawien, folder nie jest projektem RelAI)
//   { nierozpoznany: true, wartosc }  — wartosc przelacznika nierozpoznana: liczenia nie ma,
//                                       ale adapter mowi o tym jednym zdaniem (L-0025)
//   { tylkoDokumenty: true, dokumenty } — budzet wylaczony albo bez wiersza, ale rotacja jest
//                                       wlaczona i cos przekracza WLASNY prog (1.7.0, E4);
//                                       nic nie przekracza → null, czyli cisza
//   { wlaczony: true, ... }           — pomiar
function startCost(cwd, opcje) {
  try {
    const o = opcje || {};
    if (!cwd) return null;
    const markerFile = relaiMarkerFile(cwd, o.markeryGoscia);
    if (!markerFile) return null;

    const docsDir = path.join(cwd, 'docs');
    const plikUstawien = pierwszyIstniejacy(docsDir, ['USTAWIENIA.md', 'SETTINGS.md']);
    if (!plikUstawien) return null;

    const txtUstawien = czytaj(plikUstawien);
    const komorka = komorkaDecyzji(txtUstawien, NAZWA_WIERSZA);
    // Budzet i rotacja to dwa NIEZALEZNE wylaczniki (SPEC_USTAWIENIA.md): wylaczony budzet
    // wycisza pomiar warstwy startowej, ale nie wycisza progow dokumentow. Prog czastkowy
    // ryzyk bierzemy wtedy z wartosci domyslnej — wiersza budzetu nie ma czego czytac.
    if (!komorka || WYLACZONY.test(komorka)) {
      const same = dokumentyPonadProgiem(cwd, txtUstawien,
        PROGI_DOMYSLNE.ryzyka * KB, PROGI_DOMYSLNE.ustawienia * KB);
      return same.length ? { tylkoDokumenty: true, dokumenty: same } : null;
    }
    if (!WLACZONY.test(komorka)) {
      return {
        nierozpoznany: true,
        wartosc: komorka.split('·')[0].trim().slice(0, 60),
        dokumenty: dokumentyPonadProgiem(cwd, txtUstawien,
          PROGI_DOMYSLNE.ryzyka * KB, PROGI_DOMYSLNE.ustawienia * KB),
      };
    }

    const progi = progiZKomorki(komorka);
    const pozycje = [];

    const dodaj = (id, plik, tresc, sposob) => {
      if (plik === null || tresc === null) return;
      pozycje.push({
        id,
        sciezka: path.relative(cwd, plik).split(path.sep).join('/'),
        bajty: bajty(tresc),
        prog: progi[id] * KB,
        sposob,
      });
    };

    // 1. CLAUDE.md — caly plik
    const claudeMd = pierwszyIstniejacy(cwd, ['CLAUDE.md']);
    if (claudeMd) dodaj('CLAUDE', claudeMd, czytaj(claudeMd), 'plik');

    // 2. STATE.md — caly plik
    const state = pierwszyIstniejacy(docsDir, ['STATE.md']);
    if (state) dodaj('STATE', state, czytaj(state), 'plik');

    // 3. dziennik — sekcja ryzyk PLUS ostatni wpis
    const dziennik = pierwszyIstniejacy(docsDir, ['DZIENNIK.md', 'JOURNAL.md']);
    if (dziennik) {
      const txt = czytaj(dziennik);
      const ryzyka = wytnijSekcje(txt, NAGLOWEK_RYZYK);
      if (ryzyka === null) {
        dodaj('ryzyka', dziennik, txt, 'plik-bez-sekcji');
      } else {
        const czeka = wytnijSekcje(txt, NAGLOWEK_CZEKA);
        const wpis = ostatniWpis(txt);
        dodaj('ryzyka', dziennik,
          ryzyka + (czeka ? '\n' + czeka : '') + (wpis ? '\n' + wpis : ''), 'sekcja');
      }
    }

    // 4. lekcje — sekcja "Zasady aktywne"
    const lekcje = pierwszyIstniejacy(docsDir, ['LEKCJE.md', 'LESSONS.md']);
    if (lekcje) {
      const txt = czytaj(lekcje);
      const zasady = wytnijSekcje(txt, NAGLOWEK_ZASAD);
      if (zasady === null) dodaj('zasady', lekcje, txt, 'plik-bez-sekcji');
      else dodaj('zasady', lekcje, zasady, 'sekcja');
    }

    // 5. ustawienia — caly plik
    dodaj('ustawienia', plikUstawien, txtUstawien, 'plik');

    // 6. STATUS.md aktywnego planu — caly plik; brak planu = brak pozycji, nie zero
    const statusPath = sciezkaStatusuPlanu(cwd);
    if (statusPath) dodaj('status', statusPath, czytaj(statusPath), 'plik');

    const suma = pozycje.reduce((s, p) => s + p.bajty, 0);
    const budzet = progi.start * KB;

    return {
      wlaczony: true,
      rotacja: przelacznikRotacji(txtUstawien),
      budzet,
      progi,
      pozycje,
      suma,
      przekroczonaSuma: suma > budzet,
      dokumenty: dokumentyPonadProgiem(cwd, txtUstawien, progi.ryzyka * KB, progi.ustawienia * KB),
      ponadProgiem: pozycje.filter((p) => p.bajty > p.prog).map((p) => p.id),
      bezSekcji: pozycje.filter((p) => p.sposob === 'plik-bez-sekcji').map((p) => p.id),
    };
  } catch (_) {
    return null;
  }
}

// Raport dla kontekstu startu — ASCII (L-0016), najwyzej szesc linii, wylacznie
// powyzej progu. Zwraca [] , gdy nie ma o czym mowic: cisza jest zachowaniem
// domyslnym, tak jak przy rotacji.
function startCostReport(miara, opcje) {
  if (!miara) return [];
  const o = opcje || {};
  const kb = (n) => (n / KB).toFixed(1).replace(/\.0$/, '') + ' KB';
  const miara_ = (d) => (d.jednostka === 'KB' ? kb(d.wartosc) : d.wartosc + ' ' + d.jednostka);
  const prog_ = (d) => (d.jednostka === 'KB' ? kb(d.prog) : d.prog + ' ' + d.jednostka);

  // Druga linia raportu (1.7.0, E4): dokumenty i sekcje ponad WLASNYM progiem rotacji.
  // Wyzwalacz rozlaczny z budzetem i osobne zdanie — jedna linia o budzecie, jedna
  // o dokumentach; nie mieszamy ich w jedno zdanie.
  // Odmiana rzeczownika przy liczbie — komunikat czyta czlowiek, a "1 dalszych pozycji"
  // wyglada na usterke mechanizmu. Formy ASCII (L-0016).
  const odmiana = (n) => {
    if (n === 1) return 'dalsza pozycja';
    const dziesiatki = n % 100;
    const jednosci = n % 10;
    if (jednosci >= 2 && jednosci <= 4 && (dziesiatki < 12 || dziesiatki > 14)) return 'dalsze pozycje';
    return 'dalszych pozycji';
  };

  // Wypisujemy najwyzej trzy pozycje, zeby jedna linia nie urosla w akapit; reszta idzie
  // jako jawna liczba, nie jako cisza — obciete bez sladu wygladaloby na komplet.
  const dokumenty = Array.isArray(miara.dokumenty) ? miara.dokumenty : [];
  const reszta = dokumenty.length - 3;
  const liniaDokumentow = dokumenty.length
    ? '[RelAI progi dokumentow] Ponad wlasnym progiem: ' + dokumenty.slice(0, 3)
      .map((d) => d.etykieta + ' ' + miara_(d) + ' (prog ' + prog_(d) + ') — ' + d.procedura)
      .join('; ') + (reszta > 0 ? ' oraz ' + reszta + ' ' + odmiana(reszta) + ' ponad progiem' : '') + '.'
    : null;

  const out = [];

  if (miara.nierozpoznany) {
    out.push('[RelAI budzet startu] Wartosc przelacznika w wierszu "Budzet startu sesji" (' +
      miara.wartosc + ') jest nierozpoznana, wiec pomiar warstwy startowej jest wylaczony. ' +
      'Dozwolone wartosci: wlaczony / wylaczony.');
    if (liniaDokumentow) out.push(liniaDokumentow);
    return out;
  }

  // Wyzwalacze sa DWA i sa rozlaczne: SUMA wobec budzetu (jak od 1.6.0) albo dokument
  // czy sekcja ponad wlasnym progiem rotacji (1.7.0). Progi czastkowe budzetu nadal nie
  // wywoluja raportu — wskazuja winowajce WEWNATRZ niego. Zaden z nich nie padl -> cisza.
  if (!miara.przekroczonaSuma && !liniaDokumentow) return [];

  if (miara.przekroczonaSuma) {
    const ponad = miara.pozycje.filter((p) => p.bajty > p.prog);
    const wybrane = (ponad.length ? ponad : miara.pozycje.slice().sort((a, b) => b.bajty - a.bajty).slice(0, 3))
      .map((p) => p.id + ' ' + kb(p.bajty) + ' (prog ' + kb(p.prog) + ')').join(', ');
    out.push('[RelAI budzet startu] Warstwa czytana przy starcie sesji wazy ' + kb(miara.suma) +
      ' przy budzecie ' + kb(miara.budzet) + '.');
    out.push((ponad.length ? 'Pozycje ponad progiem czastkowym: ' : 'Najgrubsze pozycje: ') +
      wybrane + '.' + (miara.bezSekcji.length
        ? ' Zmierzone jako caly plik, bo nie znaleziono szukanej sekcji: ' +
          miara.bezSekcji.join(', ') + ' — wartosc jest zawyzona z tego powodu.'
        : ''));
  }

  if (liniaDokumentow) out.push(liniaDokumentow);

  if (o.interaktywna === false) {
    // Rotacja na starcie to zmiana w repozytorium; bez czlowieka przy klawiaturze nie rusza
    // (SPEC_ARCHIWUM, wejscie 2). Raport zostaje, propozycja znika.
    out.push('Sesja nieinteraktywna: to jest sam raport, bez propozycji odchudzenia ' +
      'i bez rotacji na starcie.');
    return out;
  }

  out.push('Zglos to uzytkownikowi JEDNYM zdaniem przed akapitem "gdzie jestesmy" i zaproponuj ' +
    'wymienione procedury jako pierwszy krok. Wylaczniki i progi: wiersze "Budzet startu ' +
    'sesji" i "Rotacja dokumentow" w docs/USTAWIENIA.md.');

  // Linia o rotacji dziennika nalezy do wyzwalacza BUDZETOWEGO (wejscie 2 rotacji,
  // SPEC_ARCHIWUM) — przy samym progu dokumentu procedury sa juz nazwane w linii wyzej.
  if (!miara.przekroczonaSuma) return out;

  // Dwa niezalezne wylaczniki (sekcja 8 planu): budzet moze liczyc przy wylaczonej rotacji.
  // Fraza "Zaproponuj rotacje" pada WYLACZNIE przy rotacji wlaczonej — na niej stoi dowod
  // negatywny z punktu weryfikacji E2.
  if (miara.rotacja === true) {
    out.push('Zaproponuj rotacje dziennika jako pierwszy krok odchudzania: procedura dwufazowa ' +
      'z SPEC_ARCHIWUM.md, wejscie 2 (start sesji).');
  } else {
    out.push('Rotacja dokumentow jest wylaczona albo nieustawiona (wiersz "Rotacja dokumentow" ' +
      'w docs/USTAWIENIA.md) — sam raport, bez rotowania.');
  }
  return out;
}

// --- przeglad spraw czekajacych na czlowieka (1.7.0, E3) --------------------
// Sprawa z sekcji "Czeka na czlowieka" starsza niz N dni jest PRZETERMINOWANA i wymusza
// decyzje na starcie sesji. Wylacznik jest OSOBNY od rotacji (Aneks A planu HIGIENA_DOKUMENTOW):
// "Rotacja dokumentow: wylaczona" nie wycisza tego przegladu i odwrotnie.
const NAZWA_PRZEGLADU = /^(?:Przegl[ąa]d spraw cz[łl]owieka|Waiting-on-a-human review)\b/i;
const N_DOMYSLNE = 30;

// Czlon "<liczba> dni" komorki. Jedyne zrodlo prawdy o wartosci domyslnej to
// core/templates/SPEC_USTAWIENIA.md — tutaj stoi jej kopia wykonawcza.
const CZLON_DNI = /^(\d+)\s*(?:dni|dzie[ńn]|days?)\b/i;

// Dopisek przy pozycji wyprowadzonej z wpisu bez daty w naglowku (SPEC_DZIENNIK.md).
const DATA_NIEZNANA = /\((?:data pierwotna nieznana|original date unknown)\)/i;

// Adnotacja odroczenia z licznikiem (SPEC_DZIENNIK.md). Brzmienie zamkniete, czytane
// maszynowo (L-0035): rdzen slowa + data + licznik. Forma gramatyczna dowolna.
// UWAGA: koncowka slowa lapana klasa z polskimi znakami, nie przez \w — \w w JS bez flagi
// unicode nie obejmuje "ę", wiec "odroczeń" i "rozstrzygnięte" nie trafialy (L-0054).
const KONCOWKA = '[a-ząćęłńóśźż]*';
const ODROCZENIE = new RegExp(
  '\\(\\s*(?:odroczo' + KONCOWKA + '|deferred)\\s+(\\d{4}-\\d{2}-\\d{2})\\s*,\\s*' +
  '(?:odrocze' + KONCOWKA + '|deferrals?)\\s*:\\s*(\\d+)\\s*\\)', 'i');

const DATA_ISO = /^(\d{4}-\d{2}-\d{2})\b/;

// Adnotacja rozstrzygniecia — ta sama zamknieta lista rdzeni co w SPEC_ARCHIWUM.md,
// z wymogiem daty. Specyfikacja kaze pozycji rozstrzygnietej zniknac z sekcji w tej samej
// turze, ale projekt prowadzony wczesniej recznie trzyma ja przekreslona (PolyFlow: 45 z 72).
// Pozycja z takim dopiskiem NIE jest sprawa otwarta, wiec nie ma o co pytac.
const ROZSTRZYGNIECIE = new RegExp(
  '(?:rozstrzygni|zrobion|zaakceptowan|domkni|wykonan|anulowan|' +
  'resolved|done|accepted|closed|cancelled)' + KONCOWKA +
  '(?:\\*\\*)?\\s+(?:[—-]\\s*)?(?:\\*\\*)?\\d{4}-\\d{2}-\\d{2}', 'i');

function ascii(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/Ł/g, 'L').replace(/ł/g, 'l')
    .replace(/[„”"']/g, '"').replace(/[–—]/g, '-')
    .replace(/[^\x20-\x7e]/g, '').replace(/\s+/g, ' ').trim();
}

function dniMiedzy(od, do_) {
  const a = Date.parse(od + 'T00:00:00Z');
  const b = Date.parse(do_ + 'T00:00:00Z');
  if (isNaN(a) || isNaN(b)) return null;
  return Math.floor((b - a) / 86400000);
}

// Wiersz "Przeglad spraw czlowieka" jako FAKT: null / {nierozpoznany} / {wlaczony, N}.
// Brak wiersza -> null i cisza: projekt sprzed 1.7.0 nie zaczyna nagle pytac sam z siebie.
function przegladSprawCzlowieka(txtUstawien) {
  const komorka = komorkaDecyzji(txtUstawien, NAZWA_PRZEGLADU);
  if (komorka === null) return null;
  if (WYLACZONY.test(komorka)) return null;
  if (!WLACZONY.test(komorka)) {
    return { nierozpoznany: true, wartosc: komorka.split('·')[0].trim().slice(0, 60) };
  }
  let N = N_DOMYSLNE;
  for (const czlon of String(komorka).split('·').map((c) => c.trim()).slice(1)) {
    const m = czlon.match(CZLON_DNI);
    if (m) N = parseInt(m[1], 10);
  }
  return { wlaczony: true, N };
}

// Pozycje sekcji "Czeka na czlowieka". Pozycja bywa zawinieta na kilka linii, wiec
// blokiem jest wszystko od myslnika do nastepnego myslnika albo do konca sekcji.
function pozycjeCzeka(txtDziennika) {
  const sekcja = wytnijSekcje(txtDziennika, NAGLOWEK_CZEKA);
  if (sekcja === null) return null;
  const bloki = [];
  for (const linia of sekcja.split('\n')) {
    if (/^\s*-\s+/.test(linia)) bloki.push([linia.replace(/^\s*-\s+/, '')]);
    else if (bloki.length && linia.trim()) bloki[bloki.length - 1].push(linia.trim());
  }
  const pozycje = [];
  for (const blok of bloki) {
    const tekst = blok.join(' ').replace(/\s+/g, ' ').trim();
    if (!tekst || tekst === '—' || tekst === '-') continue; // sekcja pusta ma jawne "—"
    const czlony = tekst.split('·').map((c) => c.trim());
    const bold = tekst.match(/\*\*(.+?)\*\*/);
    const tresc = (bold ? bold[1] : czlony[0]).replace(/\*\*/g, '').trim();
    let data = null;
    for (const czlon of czlony.slice(1)) {
      const m = czlon.replace(/\*\*/g, '').trim().match(DATA_ISO);
      if (m) { data = m[1]; break; }
    }
    const odr = tekst.match(ODROCZENIE);
    pozycje.push({
      tresc,
      data,
      rozstrzygnieta: ROZSTRZYGNIECIE.test(tekst),
      dataPierwotnaNieznana: DATA_NIEZNANA.test(tekst),
      odroczone: odr ? odr[1] : null,
      odroczen: odr ? parseInt(odr[2], 10) : 0,
    });
  }
  return pozycje;
}

// Zwraca:
//   null                              — przegladu nie ma (wylaczony, brak wiersza, brak
//                                       ustawien, brak dziennika, folder nie jest projektem RelAI)
//   { nierozpoznany: true, wartosc }  — wartosc przelacznika nierozpoznana: liczenia nie ma,
//                                       ale adapter mowi o tym jednym zdaniem (L-0025)
//   { wlaczony: true, ... }           — przeglad
function sprawyPrzeterminowane(cwd, opcje) {
  try {
    const o = opcje || {};
    if (!cwd) return null;
    const markerFile = relaiMarkerFile(cwd, o.markeryGoscia);
    if (!markerFile) return null;

    const docsDir = path.join(cwd, 'docs');
    const plikUstawien = pierwszyIstniejacy(docsDir, ['USTAWIENIA.md', 'SETTINGS.md']);
    if (!plikUstawien) return null;

    const wiersz = przegladSprawCzlowieka(czytaj(plikUstawien));
    if (!wiersz) return null;
    if (wiersz.nierozpoznany) return wiersz;

    const dziennik = pierwszyIstniejacy(docsDir, ['DZIENNIK.md', 'JOURNAL.md']);
    if (!dziennik) return null;
    const wszystkie = pozycjeCzeka(czytaj(dziennik));
    if (wszystkie === null) return null; // projekt sprzed 1.6.0 — sekcji nie ma, cisza
    // Sprawa rozstrzygnieta nie jest sprawa czekajaca, nawet gdy ktos zostawil ja w sekcji.
    const pozycje = wszystkie.filter((p) => !p.rozstrzygnieta);

    const dzisiaj = o.dzisiaj || todayLocal();
    const N = wiersz.N;
    for (const p of pozycje) {
      // Wiek CALKOWITY liczy sie od daty pozycji — przy dopisku "(data pierwotna nieznana)"
      // jest nia data wyprowadzenia (SPEC_DZIENNIK.md). Bez daty w ogole: wieku nie ma,
      // wiec pozycja nie jest przeterminowana — zgadywanie jest zakazane (L-0025).
      p.wiek = p.data ? dniMiedzy(p.data, dzisiaj) : null;
      // Odroczenie przesuwa sprawe o kolejne N dni, wiec licznik przeterminowania
      // biegnie od daty ostatniego odroczenia, a nie od pierwszego wystapienia.
      p.wiekOdOdroczenia = p.odroczone ? dniMiedzy(p.odroczone, dzisiaj) : null;
      const odniesienie = p.odroczone ? p.wiekOdOdroczenia : p.wiek;
      p.przeterminowana = odniesienie !== null && odniesienie > N;
    }
    return {
      wlaczony: true,
      N,
      dzisiaj,
      pozycje,
      przeterminowane: pozycje.filter((p) => p.przeterminowana),
      bezDaty: pozycje.filter((p) => p.data === null).length,
      rozstrzygniete: wszystkie.length - pozycje.length,
    };
  } catch (_) {
    return null;
  }
}

// Raport dla kontekstu startu — ASCII (L-0016), wylacznie gdy cos jest przeterminowane.
// Cisza jest zachowaniem domyslnym, tak samo jak przy budzecie i przy rotacji.
function sprawyPrzeterminowaneReport(miara, opcje) {
  if (!miara) return [];
  if (miara.nierozpoznany) {
    return ['[RelAI przeglad spraw] Wartosc przelacznika w wierszu "Przeglad spraw czlowieka" (' +
      miara.wartosc + ') jest nierozpoznana, wiec przeglad spraw czekajacych na czlowieka jest ' +
      'wylaczony. Dozwolone wartosci: wlaczony / wylaczony.'];
  }
  if (!miara.przeterminowane.length) return [];

  const o = opcje || {};
  const lista = miara.przeterminowane;
  const LIMIT = 5;
  const out = [];
  out.push('[RelAI przeglad spraw] W sekcji "Czeka na czlowieka" ' + lista.length + ' z ' +
    miara.pozycje.length + ' spraw czeka dluzej niz ' + miara.N + ' dni.');
  for (const p of lista.slice(0, LIMIT)) {
    const wiek = p.wiek === null ? 'wiek nieznany (pozycja bez daty)' : p.wiek + ' dni';
    const ogon = (p.dataPierwotnaNieznana ? ', data pierwotna nieznana' : '') +
      (p.odroczen ? ', odroczen: ' + p.odroczen + ' (ostatnie ' + p.odroczone + ', ' +
        p.wiekOdOdroczenia + ' dni temu)' : '');
    out.push('- ' + ascii(p.tresc).slice(0, 100) + ' — ' + wiek + ogon + '.');
  }
  if (lista.length > LIMIT) {
    out.push('- i ' + (lista.length - LIMIT) + ' dalszych spraw tego samego rodzaju.');
  }
  const zaOdkladane = lista.filter((p) => p.odroczen >= 3);
  if (zaOdkladane.length) {
    out.push('Odkladane co najmniej trzy razy: ' + zaOdkladane.length + ' — najstarsza czeka ' +
      Math.round(Math.max.apply(null, zaOdkladane.map((p) => p.wiek || 0)) / 30) +
      ' miesiecy od pierwszego wystapienia.');
  }
  if (o.interaktywna === false) {
    out.push('Sesja nieinteraktywna: to jest sam raport, bez pytan — zapis do repozytorium bez ' +
      'czlowieka przy klawiaturze jest zakazany.');
    return out;
  }
  out.push('ZADANIE: przed akapitem "gdzie jestesmy" zadaj pytanie o te sprawy PARTIAMI PO CZTERY, ' +
    'az do wyczerpania listy. Kazda sprawa ma trzy realne wybory: zamknac (adnotacja ' +
    'rozstrzygniecia), odroczyc o kolejne ' + miara.N + ' dni (adnotacja odroczenia z licznikiem) ' +
    'albo rozstrzygnac teraz. Procedura: skill relai-core, sekcja "Przeglad spraw ' +
    'przeterminowanych". Wylacznik i wartosc N: wiersz "Przeglad spraw czlowieka" w ' +
    'docs/USTAWIENIA.md — osobny od rotacji.');
  return out;
}

module.exports = {
  isGuest,
  relaiMarkerFile,
  todayLocal,
  projectVersion,
  provisionTemplates,
  globalSettingsText,
  promptGap,
  stateDrift,
  unknownAuthor,
  ostatniWpis, // eksportowana, zeby dalo sie ja sprawdzic testem na obu kierunkach dziennika
  startCost,
  startCostReport,
  przelacznikRotacji, // eksportowany, zeby dalo sie pokazac niezaleznosc obu wylacznikow (Aneks A)
  progiRotacjiZKomorki, // eksportowane, zeby dalo sie sprawdzic testem czlony wiersza rotacji
  dokumentyPonadProgiem, // eksportowane, zeby dalo sie zmierzyc drugi wyzwalacz osobno (E4)
  przegladSprawCzlowieka, // eksportowane, zeby dalo sie sprawdzic testem wylacznik i wartosc N
  pozycjeCzeka,
  sprawyPrzeterminowane,
  sprawyPrzeterminowaneReport,
};
