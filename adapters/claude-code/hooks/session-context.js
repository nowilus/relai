#!/usr/bin/env node
'use strict';
// RelAI hook: session-context — CICHY (D-40). Dwa zdarzenia, jeden plik
// (wzorzec z planu 5.2, jak doc-sync-reminder: PostToolUse/Stop):
//
// 1) SessionStart — wlasciwa mitygacja ryzyka R2: w projekcie RelAI wstrzykuje
//    date dnia, kontrole wersji projekt vs plugin, wymuszenie rytualu startu,
//    siatke brakujacych promptow etapowych (D-34), sygnal rozjazdu stanu
//    (STATUS vs CLAUDE.md vs STATE.md — od 1.3.0), tresc ustawien globalnych
//    (~/.claude/relai/ — D-23, L-0010) oraz kopiuje specyfikacje dokumentow
//    do .claude/relai/templates/ w projekcie (R8, L-0012) — od 1.4.0 zrodlem jest
//    core/templates/ rdzenia, nie katalog adaptera.
// 2) PostToolUse na narzedziu Skill — gdy wywolany skill nalezy do RelAI
//    (relai-core / relai-planning), kopiuje specyfikacje i podaje ustawienia
//    globalne TAKZE w folderze, ktory nie jest jeszcze projektem RelAI —
//    bez tego inicjalizacja nie ma z czego generowac (R8). Guard dla tego
//    zdarzenia brzmi: "czy wywolano skill RelAI", bo samo wywolanie skilla
//    jest swiadomym uzyciem pluginu przez uzytkownika; w sesjach, ktore
//    RelAI nie uzywaja, hook milczy jak kazdy inny.
//
// "Cichy" znaczy: nie zagaduje uzytkownika; dostarcza kontekst agentowi.
// Komunikaty celowo bez polskich znakow diakrytycznych (bezpieczenstwo kodowania
// konsoli Windows) — to swiadoma decyzja, nie przeoczenie.

const fs = require('fs');
const os = require('os');
const path = require('path');

// Od 1.4.0 hooki mieszkaja w adapters/claude-code/hooks/, a specyfikacje w core/templates/
// (wydzielenie rdzenia, E4). PLUGIN_ROOT to korzen repozytorium/pluginu — trzy poziomy w gore.
const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');
const CORE_TEMPLATES = path.join(PLUGIN_ROOT, 'core', 'templates');

function isGuest(cwd) {
  try {
    const p = path.join(cwd, '.claude', 'relai.json');
    if (!fs.existsSync(p)) return false;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return !!j && j.mode === 'guest';
  } catch (_) {
    return true;
  }
}

function relaiMarkerFile(cwd) {
  try {
    if (!cwd || isGuest(cwd)) return null;
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

function pluginVersion() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
    return String(j.version || '');
  } catch (_) {
    return '';
  }
}

function projectVersion(markerFile) {
  try {
    const m = fs.readFileSync(markerFile, 'utf8').match(/(?:Wersja RelAI|RelAI version)\s*:\s*([0-9][0-9A-Za-z.\-]*)/i);
    return m ? m[1] : '';
  } catch (_) {
    return '';
  }
}

// Rozszerzenia kopiowane do projektu. Poza specyfikacjami (.md) doszedl szablon
// HTML planow: szkielet i komponenty (.html), builder fontow (.js) i same fonty
// (.woff2). Bez nich sesja nie ma z czego wygenerowac planu HTML (L-0012).
const KOPIOWANE = /\.(md|html|js|css|woff2)$/i;

// Kopiuje drzewo templates/ z katalogu pluginu do <cwd>/.claude/relai/templates/,
// zachowujac podkatalogi. Zwraca liczbe skopiowanych plikow (0 = awaria — cisza).
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

function provisionTemplates(cwd) {
  try {
    const src = CORE_TEMPLATES;
    if (!fs.existsSync(src)) return 0;
    const destRoot = path.join(cwd, '.claude', 'relai');
    const dest = path.join(destRoot, 'templates');
    fs.mkdirSync(dest, { recursive: true });
    // .gitignore z "*" — lokalna kopia to cache pluginu, nie zawartosc repo
    try { fs.writeFileSync(path.join(destRoot, '.gitignore'), '*\n'); } catch (_) { /* cisza */ }
    return copyTree(src, dest);
  } catch (_) {
    return 0;
  }
}

function globalSettingsText() {
  try {
    const dir = path.join(os.homedir(), '.claude', 'relai');
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      const p = path.join(dir, name);
      if (fs.existsSync(p)) {
        const txt = fs.readFileSync(p, 'utf8').trim().slice(0, 2500);
        if (txt) return { file: '~/.claude/relai/' + name, text: txt };
      }
    }
    return null;
  } catch (_) {
    return null;
  }
}

// Siatka D-34: czy etap GOTOWY DO STARTU ma istniejacy prompt etapowy.
function promptGap(cwd) {
  try {
    const claudeMd = fs.readFileSync(path.join(cwd, 'CLAUDE.md'), 'utf8');
    const line = claudeMd.split('\n').find((l) => /Aktywny plan|Active plan/i.test(l));
    if (!line || /:\s*brak|:\s*none/i.test(line)) return null;
    const link = line.match(/\]\(([^)]+)\)/);
    if (!link) return null;
    const statusPath = path.resolve(cwd, link[1]);
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

// Rozjazd stanu (1.3.0): STATUS planu mowi "W TOKU", a CLAUDE.md albo STATE.md
// mowia co innego. Retrospektywa 2026-08-12: etap zaczety w przerwanej sesji
// zostawal "W TOKU" w STATUS, podczas gdy linia aktywnego planu i STATE opisywaly
// stan sprzed niego — nastepna sesja czytala trzy dokumenty i wierzyla temu,
// ktory przeczytala pierwszy.
//
// Fakty sa surowe i porownania deterministyczne (L-0025): kotwica statusu w komorce
// tabeli, nazwa folderu planu w tresci STATE. Czego nie da sie rozstrzygnac
// jednoznacznie, tego hook nie zglasza — cisza jest tansza niz falszywy sygnal.
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

function liniaAktywnegoPlanu(cwd) {
  const txt = czytaj(path.join(cwd, 'CLAUDE.md'));
  if (!txt) return null;
  const linia = txt.split('\n').find((l) => /Aktywny plan|Active plan/i.test(l));
  if (!linia) return { brak: true, pusta: true, link: null };
  if (/:\s*brak|:\s*none/i.test(linia)) return { brak: true, pusta: false, link: null };
  const m = linia.match(/\]\(([^)]+)\)/);
  return { brak: false, pusta: false, link: m ? m[1] : null };
}

function stateDrift(cwd) {
  try {
    const linia = liniaAktywnegoPlanu(cwd);
    if (!linia) return null; // brak CLAUDE.md — nie ma czego porownywac
    const fakty = [];

    // Martwy link w linii aktywnego planu — mowi "tu trwa praca" i prowadzi donikad.
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

// D-27: czy projekt otworzyl ktos inny niz jego autor. Porownujemy user.name
// z konfiguracji gita z podpisami wpisow dziennika ("Autor: RelAI (model) + X").
// Zwraca null, gdy nie da sie rozstrzygnac — brak nazwy w gicie, brak dziennika,
// dziennik bez ani jednego podpisu. Cisza jest tansza niz falszywa propozycja.
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

function onSessionStart(input) {
  const cwd = input.cwd || process.cwd();
  const markerFile = relaiMarkerFile(cwd);
  if (!markerFile) return process.exit(0);

  const out = [];
  out.push('[RelAI session-context]');
  out.push('Data dzisiejsza: ' + todayLocal() + '. Daty do wpisow bierz stad, nie z pamieci modelu.');

  const pv = projectVersion(markerFile);
  const gv = pluginVersion();
  if (pv && gv && pv !== gv) {
    out.push('Wersja RelAI projektu (' + pv + ') rozni sie od wersji pluginu (' + gv +
      '). Zglos to uzytkownikowi jednym zdaniem i wskaz komende /relai-update — pokaze roznice i zaktualizuje projekt za zgoda, szanujac lokalne nadpisania. Nie migruj projektu recznie.');
  }

  // Sygnaly wymagajace dzialania ida PRZED instrukcja rytualu. Zmierzone w E10:
  // sygnal umieszczony po niej byl przez slabsze modele czytany jako tlo — sesja
  // wykonywala rytual, a propozycji nie skladala wcale albo skladala inna.
  const gap = promptGap(cwd);
  if (gap) {
    out.push('ZADANIE PIERWSZE (siatka D-34). Etap ' + gap.stage + ' w ' + gap.statusFile +
      ' ma status GOTOWY DO STARTU, ale jego prompt etapowy nie istnieje. Pierwsze zdanie Twojej ' +
      'odpowiedzi — jeszcze PRZED akapitem "gdzie jestesmy" — mowi o tej luce i proponuje ' +
      'dogenerowanie promptu. Nie generuj go bez zgody (po zgodzie robi to relai-planning).');
  }

  const rozjazd = stateDrift(cwd);
  if (rozjazd) {
    out.push('ZADANIE PIERWSZE (rozjazd stanu). Dokumenty tego projektu mowia rozne rzeczy: ' +
      rozjazd.join('; ') + '. Zglos to uzytkownikowi JEDNYM zdaniem przed akapitem "gdzie jestesmy" ' +
      'i zapytaj, ktory zapis jest prawdziwy — nie prostuj zadnego dokumentu na wlasna reke, bo nie ' +
      'wiesz, czy etap trwa, czy sie urwal. To jedyne miejsce, w ktorym ten sygnal pada: nie powtarzaj ' +
      'go z rytualu startu.');
  }

  const obcy = unknownAuthor(cwd);
  if (obcy) {
    out.push('ZADANIE PIERWSZE (nieznany autor, D-27). git user.name to "' + obcy.ja + '", a zaden z ' +
      obcy.wpisow + ' podpisow w dzienniku go nie zawiera (ostatni: "' + obcy.ostatni + '") — to cudzy ' +
      'projekt. Pierwsze zdanie Twojej odpowiedzi — jeszcze PRZED akapitem "gdzie jestesmy" i przed ' +
      'odpowiedzia na pytanie uzytkownika — mowi, ze wpisy podpisal kto inny, i proponuje wycieczke ' +
      'po projekcie (stan, mapa dokumentow, plany, ryzyka, od czego zaczac). Potem CZEKASZ na zgode: ' +
      'wycieczki nie uruchamiasz sam i nie zastepujesz jej wlasnym pomyslem (przegladem kodu, ' +
      'analiza struktury). Po zgodzie wykonujesz procedure komendy /relai-tour. Odmowa zamyka temat ' +
      'na te sesje.');
  }

  out.push('Ten folder to projekt RelAI. Zanim odpowiesz merytorycznie, wykonaj rytual startu sesji: ' +
    'przeczytaj CLAUDE.md, docs/STATE.md (jesli istnieje), docs/DZIENNIK.md (sekcja ryzyk + ostatni wpis), ' +
    'docs/LEKCJE.md (tylko "Zasady aktywne"), docs/USTAWIENIA.md oraz STATUS.md aktywnego planu; ' +
    'potem napisz akapit "gdzie jestesmy". Jesli dostepny jest skill relai-core, wywolaj go — ' +
    'ta instrukcja obowiazuje takze wtedy, gdy skill sie nie wyzwolil.');

  const copied = provisionTemplates(cwd);
  if (copied > 0) {
    out.push('Specyfikacje dokumentow RelAI sa skopiowane lokalnie do .claude/relai/templates/ (' + copied +
      ' plikow). Czytaj je stamtad — katalog pluginu jest poza zasiegiem sesji.');
  }

  const gs = globalSettingsText();
  if (gs) {
    out.push('Ustawienia globalne uzytkownika (' + gs.file + '; wpis projektowy w docs/USTAWIENIA.md ma pierwszenstwo):\n' + gs.text);
  }

  process.stdout.write(out.join('\n'));
  process.exit(0);
}

function onSkillInvoked(input) {
  const ti = input.tool_input || {};
  const skillName = String(ti.skill || ti.name || '');
  if (!/(^|:)relai-(core|planning)\b/.test(skillName)) return process.exit(0);

  const cwd = input.cwd || process.cwd();
  if (isGuest(cwd)) return process.exit(0); // tryb goscia = jak brak struktury

  const parts = [];
  const copied = provisionTemplates(cwd);
  if (copied > 0) {
    parts.push('[RelAI session-context] Specyfikacje dokumentow RelAI sa skopiowane lokalnie do ' +
      '.claude/relai/templates/ (' + copied + ' plikow). Generuj dokumenty wedlug nich — katalog pluginu ' +
      'jest poza zasiegiem sesji, wiec nie probuj czytac go bezposrednio.');
  }
  const gs = globalSettingsText();
  if (gs) {
    parts.push('Ustawienia globalne uzytkownika (' + gs.file + '; wpis projektowy ma pierwszenstwo):\n' + gs.text);
  }
  if (!parts.length) return process.exit(0);

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: parts.join('\n'),
    },
  }));
  process.exit(0);
}

function main(input) {
  const event = String(input.hook_event_name || '');
  if (event === 'SessionStart') return onSessionStart(input);
  if (event === 'PostToolUse' && String(input.tool_name || '') === 'Skill') return onSkillInvoked(input);
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
