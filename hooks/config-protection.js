#!/usr/bin/env node
'use strict';
// RelAI hook: config-protection — PreToolUse (Write/Edit), BLOKUJE (D-41).
// Chroni trzy rzeczy przed zmiana bez zgody:
//   1) plik ustawien (docs/USTAWIENIA.md / SETTINGS.md) — nosnik markera "Wersja RelAI:",
//   2) sekcje niemutowalna CLAUDE.md,
//   3) od 0.8.0 — produkcyjna konfiguracje projektow o profilu agent-voice i flow, dopoki
//      w docs/snapshoty/ nie lezy kopia stanu sprzed zmiany (D-52). Snapshot jest bramka:
//      najpierw kopia, potem zmiana. Ta regula profilu jako jedyna zatrzymuje operacje,
//      dlatego mieszka tutaj — D-41 pozwala blokowac wylacznie temu hookowi i skanerowi
//      sekretow. Pozostale reguly profili ostrzegaja i siedza w profile-rules.js.
// Zgoda jest jawna wypowiedzia uzytkownika: hook zwraca permissionDecision "ask" —
// w sesji interaktywnej decyduje czlowiek, w sesji headless zapis jest blokowany.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Zwraca {start, end, text} sekcji niemutowalnej albo null.
function immutableSection(text) {
  const lines = String(text).split('\n');
  let startLine = -1;
  let startLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+.*(niemutowaln|immutable)/i);
    if (m) { startLine = i; startLevel = m[1].length; break; }
  }
  if (startLine < 0) return null;
  let endLine = lines.length;
  for (let i = startLine + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s/);
    if (m && m[1].length <= startLevel) { endLine = i; break; }
  }
  const before = lines.slice(0, startLine).join('\n');
  const start = startLine === 0 ? 0 : before.length + 1;
  const end = lines.slice(0, endLine).join('\n').length;
  return { start, end, text: lines.slice(startLine, endLine).join('\n') };
}

function ask(msg) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: msg,
    },
  }));
  process.exit(0);
}

// --- Bramka snapshotu (D-52) -------------------------------------------------

// Profil czytamy z pliku ustawien — to jedyne miejsce, ktore go trzyma. Wartosc musi stac
// NA POCZATKU kolumny "Decyzja" (SPEC_USTAWIENIA.md); opis w nawiasie jest pomijany.
// Brak jednoznacznej wartosci = brak bramki. Bramka blokuje, wiec falszywe dopasowanie
// w prozie kosztowaloby wiecej niz cisza.
function projectProfile(markerFile) {
  let txt = '';
  try { txt = fs.readFileSync(markerFile, 'utf8'); } catch (_) { return ''; }
  for (const line of txt.split('\n')) {
    if (!/Profil projektu|Project profile/i.test(line)) continue;
    const komorki = line.split('|').map((c) => c.trim()).filter(Boolean);
    const decyzja = komorki[komorki.length - 1] || '';
    const m = decyzja.match(/^\**\s*`?(agent-voice|flow|prompty|prompts|app)\b/i);
    if (m) return m[1].toLowerCase();
  }
  return '';
}

const POZA_BRAMKA_KATALOG = /^(\.\.|docs\/|\.claude\/|\.git\/|node_modules\/|dist\/|build\/|out\/|coverage\/|vendor\/|target\/|\.next\/|\.venv\/)/i;
const POZA_BRAMKA_NAZWA = /^(package(-lock)?\.json|tsconfig.*\.json|jsconfig\.json|composer\.json|\.eslintrc.*|\.prettierrc.*|.*\.schema\.json|.*\.example\..*|.*\.sample\..*)$/i;
const KATALOGI_BAZY_WIEDZY = /^(kb|knowledge|baza-wiedzy|knowledge-base)\//i;

// "Konfiguracja produkcyjna" profili agent-voice i flow: eksporty workflow i konfiguracje
// agenta (kazdy .json/.yaml/.yml poza lista wyjatkow) oraz cala baza wiedzy.
// Granica celowo ostrozna — lepiej poprosic o snapshot raz za duzo niz stracic konfiguracje raz.
function objetaBramka(rel) {
  if (!rel || POZA_BRAMKA_KATALOG.test(rel)) return false;
  const nazwa = rel.split('/').pop() || '';
  if (POZA_BRAMKA_NAZWA.test(nazwa)) return false;
  if (KATALOGI_BAZY_WIEDZY.test(rel)) return true;
  return /\.(json|ya?ml)$/i.test(nazwa);
}

function hashPliku(p) {
  try { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } catch (_) { return ''; }
}

// Czy w docs/snapshoty/ (docs/snapshots/) lezy kopia o identycznej TRESCI jak plik przed zmiana.
// Porownanie po tresci, nie po nazwie: bramka nie zalezy od konwencji nazewniczej, a konwencja
// zostaje wymogiem dokumentacyjnym (SPEC_SNAPSHOT.md).
function maSnapshot(cwd, target) {
  const szukany = hashPliku(target);
  if (!szukany) return false;
  const rozmiar = (() => { try { return fs.statSync(target).size; } catch (_) { return -1; } })();

  let budzet = 800; // twardy limit przegladanych plikow — hook nie moze spowalniac sesji
  const stos = [];
  for (const nazwa of ['snapshoty', 'snapshots']) {
    const d = path.join(cwd, 'docs', nazwa);
    if (fs.existsSync(d)) stos.push(d);
  }
  while (stos.length && budzet > 0) {
    const dir = stos.pop();
    let wpisy = [];
    try { wpisy = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { continue; }
    for (const w of wpisy) {
      const p = path.join(dir, w.name);
      if (w.isDirectory()) { stos.push(p); continue; }
      budzet--;
      if (budzet <= 0) break;
      try { if (fs.statSync(p).size !== rozmiar) continue; } catch (_) { continue; }
      if (hashPliku(p) === szukany) return true;
    }
  }
  return false;
}

function editTouchesSection(current, sec, oldString, replaceAll) {
  if (!oldString) return false;
  let from = 0;
  while (true) {
    const idx = current.indexOf(oldString, from);
    if (idx < 0) return false;
    if (idx < sec.end && idx + oldString.length > sec.start) return true;
    if (!replaceAll) return false;
    from = idx + Math.max(oldString.length, 1);
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  const markerFile = relaiMarkerFile(cwd);
  if (!markerFile) return process.exit(0);

  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  const filePath = ti.file_path || '';
  if (!filePath) return process.exit(0);

  const target = path.resolve(cwd, filePath);
  const settingsRel = path.relative(cwd, markerFile) || markerFile;

  // 1) Plik ustawien (nosnik markera "Wersja RelAI:") — kazda zmiana wymaga zgody.
  if (target === path.resolve(markerFile)) {
    return ask('RelAI config-protection: "' + settingsRel + '" to rejestr ustawien projektu i marker RelAI. ' +
      'Zmiana wymaga jawnej zgody uzytkownika w tej sesji. Zatwierdz, jesli zmiana wynika ' +
      'z Twojej decyzji (nowa preferencja, podbicie wersji RelAI); odrzuc, jesli agent zmienia plik z wlasnej inicjatywy.');
  }

  // 2) CLAUDE.md — chroniona jest wylacznie sekcja niemutowalna.
  if (target === path.resolve(cwd, 'CLAUDE.md')) {
    let current = '';
    try { current = fs.readFileSync(target, 'utf8'); } catch (_) { return process.exit(0); }
    const sec = immutableSection(current);
    if (!sec) return process.exit(0);

    if (tool === 'Write') {
      const next = immutableSection(String(ti.content || ''));
      if (!next || next.text !== sec.text) {
        return ask('RelAI config-protection: zapis nadpisuje CLAUDE.md i zmienia (lub usuwa) sekcje niemutowalna. ' +
          'Ta sekcja moze byc zmieniona wylacznie za jawna zgoda uzytkownika w tej sesji.');
      }
      return process.exit(0);
    }
    if (tool === 'Edit') {
      if (editTouchesSection(current, sec, String(ti.old_string || ''), !!ti.replace_all)) {
        return ask('RelAI config-protection: edycja dotyka sekcji niemutowalnej CLAUDE.md. ' +
          'Ta sekcja moze byc zmieniona wylacznie za jawna zgoda uzytkownika w tej sesji.');
      }
      return process.exit(0);
    }
    if (tool === 'MultiEdit') {
      for (const e of (ti.edits || [])) {
        if (editTouchesSection(current, sec, String(e.old_string || ''), !!e.replace_all)) {
          return ask('RelAI config-protection: edycja dotyka sekcji niemutowalnej CLAUDE.md. ' +
            'Ta sekcja moze byc zmieniona wylacznie za jawna zgoda uzytkownika w tej sesji.');
        }
      }
      return process.exit(0);
    }
  }

  // 3) Bramka snapshotu (D-52) — wylacznie profile agent-voice i flow.
  const profil = projectProfile(markerFile);
  if (profil !== 'agent-voice' && profil !== 'flow') return process.exit(0);

  const rel = path.relative(cwd, target).split(path.sep).join('/');
  if (!objetaBramka(rel)) return process.exit(0);
  if (!fs.existsSync(target)) return process.exit(0); // nowy plik nie ma stanu sprzed zmiany
  if (maSnapshot(cwd, target)) return process.exit(0);

  const dzis = (() => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  })();
  const baza = path.basename(rel).replace(/\.[^.]+$/, '');
  const rozsz = (path.extname(rel) || '').replace('.', '') || 'json';

  return ask('RelAI config-protection: profil "' + profil + '" traktuje snapshot jako bramke (D-52). ' +
    'Plik "' + rel + '" to konfiguracja produkcyjna, a w docs/snapshoty/ nie ma kopii o jego obecnej tresci. ' +
    'Najpierw kopia, potem zmiana. Zrob: docs/snapshoty/' + dzis + '/' + baza + '__przed-<co-zmieniamy>.' + rozsz +
    ' (kopia bajt w bajt, bez przeformatowania) plus docs/snapshoty/' + dzis + '/OPIS.md z trzema liniami: ' +
    'co zmieniamy, dlaczego, ktory plik jest stanem sprzed zmiany. Potem powtorz ten zapis. ' +
    'Zatwierdz teraz tylko wtedy, gdy uzytkownik swiadomie rezygnuje ze snapshotu.');
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
