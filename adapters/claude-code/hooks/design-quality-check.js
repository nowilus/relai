#!/usr/bin/env node
'use strict';
// RelAI hook: design-quality-check — PostToolUse (Write/Edit), OSTRZEGA (D-41).
// Warunkiem jest istnienie docs/DESIGN.md — brak pliku znaczy cisza. Sam dokument powstaje
// przy pierwszym UI w profilu app (D-51); zglasza to hook profile-rules.
// Gdy istnieje, a edytowany plik dotyczy warstwy wizualnej, przypomina o spojnosci
// z DESIGN.md i wstrzykuje jego naglowki sekcji do kontekstu.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

// K-C4: slad awarii na stderr, przed pierwszym require — ma powstac takze przy zepsutej instalacji.
const HOOK = 'design-quality-check';
function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }

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

function isRelaiProject(cwd) {
  try {
    if (!cwd || isGuest(cwd)) return false;
    const docsDir = path.join(cwd, 'docs');
    let entries = [];
    try { entries = fs.readdirSync(docsDir); } catch (_) { return false; }
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
      if (/Wersja RelAI:|RelAI version:/i.test(head)) return true;
    }
    return false;
  } catch (e) {
    slad(e);
    return false;
  }
}

// Plik spoza katalogu projektu (skrypt w %TEMP%, inny dysk) nie dostaje ostrzezen projektu (C6).
function wKatalogu(cwd, filePath) {
  const rel = path.relative(path.resolve(cwd), path.resolve(cwd, filePath));
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);

  const ti = input.tool_input || {};
  const filePath = String(ti.file_path || '');
  if (!filePath || !wKatalogu(cwd, filePath)) return process.exit(0);

  const designPath = path.join(cwd, 'docs', 'DESIGN.md');
  if (!fs.existsSync(designPath)) return process.exit(0); // warunek: DESIGN.md musi istniec

  if (!/\.(css|scss|sass|less|html|jsx|tsx|vue|svelte)$/i.test(filePath)) return process.exit(0);

  let headings = [];
  try {
    headings = fs.readFileSync(designPath, 'utf8')
      .split('\n')
      .filter((l) => /^#{2,3}\s/.test(l))
      .slice(0, 6)
      .map((l) => l.replace(/^#+\s*/, ''));
  } catch (_) { return process.exit(0); }

  const rel = path.relative(cwd, path.resolve(cwd, filePath)) || filePath;
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '[RelAI design-quality-check — OSTRZEZENIE, operacja wykonana] Plik "' + rel +
        '" dotyczy warstwy wizualnej, a projekt ma docs/DESIGN.md. Sprawdz spojnosc zmiany z jego ustaleniami' +
        (headings.length ? ' (sekcje: ' + headings.join(' | ') + ')' : '') + '.',
    },
  }));
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', (e) => { slad(e); process.exit(0); });
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (e) { slad(e); process.exit(0); }
});
