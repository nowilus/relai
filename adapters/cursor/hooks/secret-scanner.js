#!/usr/bin/env node
'use strict';
// RelAI hook (adapter Cursor): secret-scanner — preToolUse, BLOKUJE (D-41, D-42).
// Odpowiednik adapters/claude-code/hooks/secret-scanner.js w protokole Cursora.
//
// Ten plik jest CIENKA WARSTWA: sama regula "czy to sekret" mieszka w rdzeniu
// (core/guardrails/secret-scan.js) i nie wie nic o hookach. Tutaj zostaje wylacznie to,
// co jest wlasciwoscia Cursora: katalog roboczy z workspace_roots, wyluskanie tresci
// z tool_input i tlumaczenie werdyktu na { "permission": "deny" }.
//
// Roznice wobec adaptera Claude Code, zmierzone na Cursorze 2026.08.11-e8db854 (E5):
//   1) payload na stdin przychodzi na Windows z BOM (czasem podwojnym) — trzeba go zdjac,
//      inaczej JSON.parse wysypuje sie na pierwszym znaku,
//   2) payload preToolUse NIE ma pola cwd — katalog roboczy jest w workspace_roots[0],
//   3) werdykt to plaskie { permission, user_message }, nie hookSpecificOutput.
//
// Konwencja hook-guard: poza projektem RelAI hook konczy sie kodem 0 bez zadnego efektu;
// awaria guarda (w tym awaria require rdzenia) = wyjscie bez efektu.

const path = require('path');
const { spawnSync } = require('child_process');

let scanText;
let core;
try {
  ({ scanText } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'guardrails', 'secret-scan.js')));
  core = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js'));
} catch (_) {
  process.exit(0);
}

// Tryb goscia deklarowany w dowolnym z dwoch narzedzi obowiazuje w obu.
const MARKERY_GOSCIA = ['.cursor/relai.json', '.claude/relai.json'];
// Od 1.8.1 projekt liczy sie od SCIEZKI ZAPISYWANEGO PLIKU, a katalog sesji jest dopiero
// drugim kierunkiem (odnoga GUARD_PO_SCIEZCE). Praca miedzyprojektowa jest w Cursorze
// norma, nie wyjatkiem.
const projektPliku = (cwd, filePath) => core.projektDlaPliku(cwd, filePath, MARKERY_GOSCIA);

function isGitIgnored(cwd, filePath) {
  try {
    const r = spawnSync('git', ['check-ignore', '-q', '--', filePath], {
      cwd, timeout: 5000, windowsHide: true,
    });
    if (r.error) return path.basename(filePath).startsWith('.env');
    if (r.status === 0) return true;
    if (r.status === 1) return false;
    return path.basename(filePath).startsWith('.env');
  } catch (_) {
    return path.basename(filePath).startsWith('.env');
  }
}

// Katalog roboczy: Cursor podaje workspace_roots (tablica), pole cwd jest opcjonalne
// i w zmierzonym payloadzie preToolUse nie wystepuje.
function workingDir(input) {
  if (typeof input.cwd === 'string' && input.cwd) return input.cwd;
  const roots = Array.isArray(input.workspace_roots) ? input.workspace_roots : [];
  for (const r of roots) {
    if (typeof r === 'string' && r) return r;
  }
  return process.cwd();
}

function main(input) {
  const cwd = workingDir(input);

  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  const filePath = ti.file_path || ti.path || ti.notebook_path || '';
  if (!filePath) return process.exit(0);

  // Rozpoznanie projektu PRZED trescia: sciezka rozstrzyga, ktorego projektu pilnujemy.
  const abs = path.resolve(cwd, filePath);
  const projekt = projektPliku(cwd, abs);
  if (!projekt) return process.exit(0);

  let payload = '';
  if (tool === 'Write') payload = String(ti.content || '');
  else if (tool === 'Edit' || tool === 'MultiEdit') {
    const edits = Array.isArray(ti.edits) ? ti.edits : [];
    payload = edits.map((e) => String((e && (e.new_string || e.newString)) || '')).join('\n');
    if (!payload) payload = String(ti.new_string || ti.newString || '');
  } else if (tool === 'NotebookEdit') payload = String(ti.new_source || '');
  if (!payload) return process.exit(0);

  // git check-ignore liczony w repozytorium, do ktorego nalezy PLIK — nie w tym, w ktorym
  // stoi sesja (odnoga GUARD_PO_SCIEZCE).
  if (isGitIgnored(projekt.root, abs)) return process.exit(0);

  const finding = scanText(payload);
  if (!finding) return process.exit(0);

  const rel = path.relative(projekt.root, abs) || abs;
  const msg = 'RelAI secret-scanner: wykryto ' + finding + ' w pliku sledzonym "' + rel +
    '". Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42); do repozytorium moze trafic ' +
    'co najwyzej NAZWA zmiennej srodowiskowej. Wartosc nie zostala zacytowana celowo. ' +
    'Poluzowanie tej reguly wymaga swiadomej decyzji zamrozonej w docs/DECYZJE.md.';
  console.log(JSON.stringify({ permission: 'deny', user_message: msg, agent_message: msg }));
  process.exit(0);
}

// Cursor na Windows dokleja do payloadu BOM (bywa podwojny) — zdejmujemy przed parsowaniem.
function stripBom(s) {
  return String(s || '').replace(/^﻿+/, '');
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(stripBom(raw) || '{}')); } catch (_) { process.exit(0); }
});
