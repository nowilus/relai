#!/usr/bin/env node
'use strict';
// RelAI core / proces: session-signals — rozpoznanie stanu projektu dla hooka startu sesji.
//
// Ten plik nalezy do RDZENIA: nie wie nic o protokole hookow zadnego narzedzia, nie czyta
// stdin, nie zna pojecia "permissionDecision" ani "additional_context". Zna wylacznie
// katalog projektu na wejsciu i FAKTY na wyjsciu. Formatowanie komunikatu i protokol
// naleza do adaptera.
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
};
