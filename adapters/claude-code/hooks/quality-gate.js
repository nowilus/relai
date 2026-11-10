#!/usr/bin/env node
'use strict';
// RelAI hook: quality-gate — PostToolUse (Write/Edit), OSTRZEGA (D-41).
// Warunkiem jest obecnosc narzedzi, nie profil projektu: dziala tylko, gdy projekt ma
// tsconfig.json i lokalnie zainstalowany TypeScript (lub ESLint z konfiguracja). Brak
// narzedzi = cisza. Profil sprawdzaja profile-rules i config-protection — tu bylby
// warunkiem slabszym niz sama obecnosc tsc/eslint.
// Nigdy nie blokuje: narzedzie juz sie wykonalo; hook dostarcza ostrzezenie do kontekstu.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

// K-C4: slad awarii na stderr, przed pierwszym require — ma powstac takze przy zepsutej instalacji.
const HOOK = 'quality-gate';
function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function warn(text) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: text,
    },
  }));
  process.exit(0);
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
  if (!/\.(ts|tsx|mts|cts)$/i.test(filePath) || /\.d\.ts$/i.test(filePath)) return process.exit(0);

  const problems = [];

  const tscJs = path.join(cwd, 'node_modules', 'typescript', 'lib', 'tsc.js');
  if (fs.existsSync(path.join(cwd, 'tsconfig.json')) && fs.existsSync(tscJs)) {
    try {
      const r = spawnSync(process.execPath, [tscJs, '--noEmit', '--pretty', 'false'], {
        cwd, timeout: 90000, encoding: 'utf8', windowsHide: true,
      });
      const out = ((r.stdout || '') + (r.stderr || '')).trim();
      if (r.status !== 0 && out) {
        const count = (out.match(/error TS\d+/g) || []).length;
        problems.push('tsc --noEmit: ' + (count || 'sa') + ' bledy(-ow). Pierwsze linie:\n' + out.slice(0, 1200));
      }
    } catch (e) { slad(e); /* cisza — ostrzeganie nie moze wywracac sesji */ }
  }

  const eslintJs = path.join(cwd, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const hasEslintConfig = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', '.eslintrc', '.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.yml', '.eslintrc.yaml']
    .some((f) => fs.existsSync(path.join(cwd, f)));
  if (fs.existsSync(eslintJs) && hasEslintConfig) {
    try {
      const r = spawnSync(process.execPath, [eslintJs, '--no-color', '--', filePath], {
        cwd, timeout: 45000, encoding: 'utf8', windowsHide: true,
      });
      const out = ((r.stdout || '') + (r.stderr || '')).trim();
      if (r.status !== 0 && out) {
        problems.push('eslint: problemy w edytowanym pliku. Pierwsze linie:\n' + out.slice(0, 800));
      }
    } catch (e) { slad(e); /* cisza */ }
  }

  if (!problems.length) return process.exit(0);
  warn('[RelAI quality-gate — OSTRZEZENIE, operacja wykonana] ' + problems.join('\n---\n'));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', (e) => { slad(e); process.exit(0); });
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (e) { slad(e); process.exit(0); }
});
