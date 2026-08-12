#!/usr/bin/env node
'use strict';
// RelAI hook: secret-scanner — PreToolUse (Write/Edit), BLOKUJE (D-41, D-42).
// Blokuje zapis sekretu do pliku sledzonego przez git; pliki objete .gitignore przechodza.
// Konwencja hook-guard (README, sekcja "Konwencja: hook-guard"): poza projektem RelAI
// hook konczy sie kodem 0 bez zadnego efektu; awaria guarda = wyjscie bez efektu.
//
// Od 1.4.0 ten plik jest CIENKA WARSTWA adaptera: sama regula "czy to sekret" mieszka
// w rdzeniu (core/guardrails/secret-scan.js) i nie wie nic o hookach. Tutaj zostaje
// wylacznie to, co jest wlasciwoscia Claude Code: guard projektu, wyluskanie tresci
// z tool_input i tlumaczenie werdyktu na permissionDecision.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Rdzen lezy trzy poziomy wyzej (adapters/claude-code/hooks -> korzen). Awaria require
// jest traktowana jak awaria guarda: hook milknie zamiast wysypac sie na stderr.
let scanText;
try {
  ({ scanText } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'guardrails', 'secret-scan.js')));
} catch (_) {
  process.exit(0);
}

function isGuest(cwd) {
  try {
    const p = path.join(cwd, '.claude', 'relai.json');
    if (!fs.existsSync(p)) return false;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return !!j && j.mode === 'guest';
  } catch (_) {
    return true; // nieczytelny marker = zachowaj sie jak poza projektem RelAI
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

function isGitIgnored(cwd, filePath) {
  try {
    const r = spawnSync('git', ['check-ignore', '-q', '--', filePath], {
      cwd, timeout: 5000, windowsHide: true,
    });
    if (r.error) return path.basename(filePath).startsWith('.env');
    if (r.status === 0) return true;
    if (r.status === 1) return false;
    // 128 itp.: brak repo — bez gita nic nie jest "sledzone", ale zostawiamy furtke .env
    return path.basename(filePath).startsWith('.env');
  } catch (_) {
    return path.basename(filePath).startsWith('.env');
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!relaiMarkerFile(cwd)) return process.exit(0);

  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  const filePath = ti.file_path || ti.notebook_path || '';
  if (!filePath) return process.exit(0);

  let payload = '';
  if (tool === 'Write') payload = String(ti.content || '');
  else if (tool === 'Edit') payload = String(ti.new_string || '');
  else if (tool === 'MultiEdit') payload = (ti.edits || []).map((e) => String(e.new_string || '')).join('\n');
  else if (tool === 'NotebookEdit') payload = String(ti.new_source || '');
  if (!payload) return process.exit(0);

  if (isGitIgnored(cwd, filePath)) return process.exit(0);

  const finding = scanText(payload);
  if (!finding) return process.exit(0);

  const rel = path.relative(cwd, filePath) || filePath;
  const msg = 'RelAI secret-scanner: wykryto ' + finding + ' w pliku sledzonym "' + rel +
    '". Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42); do repozytorium moze trafic ' +
    'co najwyzej NAZWA zmiennej srodowiskowej. Wartosc nie zostala zacytowana celowo. ' +
    'Poluzowanie tej reguly wymaga swiadomej decyzji zamrozonej w docs/DECYZJE.md.';
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: msg,
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
