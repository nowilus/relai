#!/usr/bin/env node
'use strict';
// RelAI hook: console-log-warn — PostToolUse (Write/Edit), OSTRZEGA (D-41).
// Wykrywa console.log / debugger w kodzie produkcyjnym. Pomija pliki testowe
// oraz pliki, ktore same sa hookami Claude Code (console.log to ich protokol wyjscia).
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
  } catch (_) {
    return false;
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);

  const ti = input.tool_input || {};
  const filePath = String(ti.file_path || '');
  if (!/\.(js|jsx|ts|tsx|mjs|cjs|vue|svelte)$/i.test(filePath)) return process.exit(0);
  if (/(\.test\.|\.spec\.|__tests__|[\\/]tests?[\\/])/i.test(filePath)) return process.exit(0);

  let content = '';
  try { content = fs.readFileSync(path.resolve(cwd, filePath), 'utf8'); } catch (_) { return process.exit(0); }
  // Plik bedacy hookiem Claude Code uzywa console.log jako protokolu — nie ostrzegaj.
  if (/hookSpecificOutput|hook_event_name|systemMessage/.test(content)) return process.exit(0);

  const hits = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue; // komentarze pomijamy
    if (/(^|[^.\w])console\.log\s*\(/.test(line) || /(^|\s)debugger\s*;?\s*$/.test(line)) {
      hits.push(i + 1);
      if (hits.length >= 10) break;
    }
  }
  if (!hits.length) return process.exit(0);

  const rel = path.relative(cwd, path.resolve(cwd, filePath)) || filePath;
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '[RelAI console-log-warn — OSTRZEZENIE, operacja wykonana] Plik "' + rel +
        '" zawiera console.log/debugger (linie: ' + hits.slice(0, 5).join(', ') +
        (hits.length > 5 ? ', …' : '') + '). Usun przed commitem albo zamien na docelowy logger.',
    },
  }));
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
