#!/usr/bin/env node
'use strict';
// RelAI hook: auto-format — Stop, CICHY (D-40/D-41).
// Warunkowy do czasu profili (E8): dziala tylko, gdy projekt sam ma Prettiera
// (konfiguracja + lokalna instalacja). Formatuje wylacznie pliki zmodyfikowane
// w drzewie roboczym. Zadnego wyjscia na stdout/stderr — cichy znaczy cichy.
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

function hasPrettierConfig(cwd) {
  const files = ['.prettierrc', '.prettierrc.json', '.prettierrc.js', '.prettierrc.cjs',
    '.prettierrc.yaml', '.prettierrc.yml', 'prettier.config.js', 'prettier.config.cjs',
    'prettier.config.mjs'];
  if (files.some((f) => fs.existsSync(path.join(cwd, f)))) return true;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    return !!pkg.prettier;
  } catch (_) {
    return false;
  }
}

function prettierBin(cwd) {
  const candidates = [
    path.join(cwd, 'node_modules', 'prettier', 'bin', 'prettier.cjs'),
    path.join(cwd, 'node_modules', 'prettier', 'bin-prettier.js'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);
  if (input.stop_hook_active) return process.exit(0);
  if (!hasPrettierConfig(cwd)) return process.exit(0);
  const bin = prettierBin(cwd);
  if (!bin) return process.exit(0);

  let out = '';
  try {
    const r = spawnSync('git', ['status', '--porcelain'], {
      cwd, timeout: 8000, encoding: 'utf8', windowsHide: true,
    });
    if (r.error || r.status !== 0) return process.exit(0);
    out = r.stdout || '';
  } catch (_) {
    return process.exit(0);
  }

  const files = out.split('\n')
    .filter((l) => /^\s?[MA?]{1,2}\s/.test(l))
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
    .filter((f) => /\.(js|jsx|ts|tsx|mjs|cjs|json|css|scss|less|html|vue|yaml|yml)$/i.test(f))
    .filter((f) => fs.existsSync(path.join(cwd, f)))
    .slice(0, 30);
  if (!files.length) return process.exit(0);

  try {
    spawnSync(process.execPath, [bin, '--write', '--log-level', 'silent', '--', ...files], {
      cwd, timeout: 60000, windowsHide: true, stdio: 'ignore',
    });
  } catch (_) { /* cichy */ }
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
