#!/usr/bin/env node
'use strict';
// RelAI hook: config-protection — PreToolUse (Write/Edit), BLOKUJE (D-41).
// Chroni sekcje niemutowalna CLAUDE.md oraz plik ustawien (docs/USTAWIENIA.md / SETTINGS.md)
// przed zmiana bez zgody. Zgoda jest jawna wypowiedzia uzytkownika: hook zwraca
// permissionDecision "ask" — w sesji interaktywnej decyduje czlowiek, w sesji headless
// zapis jest blokowany.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

const fs = require('fs');
const path = require('path');

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

  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
