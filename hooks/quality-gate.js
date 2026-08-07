#!/usr/bin/env node
'use strict';
// RelAI hook: quality-gate — PostToolUse (Write/Edit), OSTRZEGA (D-41).
// Warunkowy do czasu profili (E8): dziala tylko, gdy projekt ma tsconfig.json
// i lokalnie zainstalowany TypeScript (lub ESLint z konfiguracja). Brak narzedzi = cisza.
// Nigdy nie blokuje: narzedzie juz sie wykonalo; hook dostarcza ostrzezenie do kontekstu.
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

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
  } catch (_) {
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

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);

  const ti = input.tool_input || {};
  const filePath = String(ti.file_path || '');
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
    } catch (_) { /* cisza — ostrzeganie nie moze wywracac sesji */ }
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
    } catch (_) { /* cisza */ }
  }

  if (!problems.length) return process.exit(0);
  warn('[RelAI quality-gate — OSTRZEZENIE, operacja wykonana] ' + problems.join('\n---\n'));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
