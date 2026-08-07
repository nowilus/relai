#!/usr/bin/env node
'use strict';
// RelAI hook: doc-sync-reminder — Stop, OSTRZEGA (D-41). Druga siatka definicji
// ukonczenia (D-44): zmiany w kodzie bez zmiany docs/STATE.md ani docs/DZIENNIK.md
// (lub ich odpowiednikow jezykowych) daja przypomnienie. Nigdy nie blokuje.
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

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);
  if (input.stop_hook_active) return process.exit(0);

  let out = '';
  try {
    const r = spawnSync('git', ['status', '--porcelain'], {
      cwd, timeout: 8000, encoding: 'utf8', windowsHide: true,
    });
    if (r.error || r.status !== 0) return process.exit(0); // bez gita nie ma rzetelnego sygnalu
    out = r.stdout || '';
  } catch (_) {
    return process.exit(0);
  }

  const files = out.split('\n')
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
  if (!files.length) return process.exit(0);

  const codeChanged = files.filter((f) => !/\.md$/i.test(f) && !f.startsWith('.claude/'));
  const docsChanged = files.some((f) => /(^|\/)docs\/(STATE|DZIENNIK|JOURNAL)\.md$/i.test(f));
  if (!codeChanged.length || docsChanged) return process.exit(0);

  console.log(JSON.stringify({
    systemMessage: '[RelAI doc-sync-reminder] W drzewie roboczym sa zmiany w kodzie (' +
      codeChanged.slice(0, 3).join(', ') + (codeChanged.length > 3 ? ', …' : '') +
      ') bez aktualizacji docs/STATE.md ani docs/DZIENNIK.md. Definicja ukonczenia (D-44): ' +
      'dokumenty aktualizuje sie w tej samej turze co zmiane funkcjonalna.',
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
