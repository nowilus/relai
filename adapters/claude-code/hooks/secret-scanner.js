#!/usr/bin/env node
'use strict';
// RelAI hook: secret-scanner — PreToolUse (Write/Edit), BLOKUJE (D-41, D-42).
// Blokuje zapis sekretu do pliku projektu, ktorego git nie ignoruje; pliki objete .gitignore przechodza.
// Konwencja hook-guard (docs/PRZEWODNIK.md, sekcja "Konwencja: hook-guard"): poza projektem RelAI
// hook konczy sie kodem 0 bez zadnego efektu; awaria guarda = wyjscie bez efektu.
//
// Od 1.4.0 ten plik jest CIENKA WARSTWA adaptera: sama regula "czy to sekret" mieszka
// w rdzeniu (core/guardrails/secret-scan.js) i nie wie nic o hookach. Tutaj zostaje
// wylacznie to, co jest wlasciwoscia Claude Code: guard projektu, wyluskanie tresci
// z tool_input i tlumaczenie werdyktu na permissionDecision.

// K-C4: slad awarii na stderr, przed pierwszym require — ma powstac takze przy zepsutej instalacji.
const HOOK = 'secret-scanner';
function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }
// Guard przy bledzie wewnetrznym pyta zamiast milczec (zasada 12: catch bez odmowy to falszywa zielen).
// Nazwa bledu, nigdy e.message: komunikat JSON.parse cytuje wejscie, a wejscie bywa sekretem.
function pytajPoAwarii(e) {
  slad(e);
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason: 'RelAI secret-scanner: blad wewnetrzny skanera (' + nazwaBledu(e) + '), zapis NIE zostal sprawdzony. ' +
        'Zatwierdz tylko, jesli wiesz, ze tresc nie zawiera sekretu; trwaly blad zglos i zainstaluj plugin ponownie.',
    },
  }));
  process.exit(0);
}

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Rdzen lezy trzy poziomy wyzej (adapters/claude-code/hooks -> korzen). Awaria require
// jest traktowana jak awaria guarda: od K-C4 (E4 OPTYMALIZACJA_PO_AUDYCIE) hook pyta (ask)
// w kazdym folderze — bez rdzenia nie wie, czy stoi w projekcie RelAI.
// Od 1.5.0 z rdzenia pochodzi takze rozpoznanie projektu (marker + tryb goscia) —
// ten sam kod czyta adapter Cursora, wiec nie ma gdzie sie rozjechac (P4).
let scanText;
let projektDlaPlikuCore;
try {
  ({ scanText } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'guardrails', 'secret-scan.js')));
  ({ projektDlaPliku: projektDlaPlikuCore } =
    require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js')));
} catch (e) {
  pytajPoAwarii(e);
}

// Marker trybu goscia w adapterze Claude Code to wylacznie .claude/relai.json.
// Od 1.8.1 projekt liczy sie od SCIEZKI ZAPISYWANEGO PLIKU, a katalog sesji jest
// dopiero drugim kierunkiem: sesja otwarta gdzie indziej pisala dotad sekret do cudzego
// projektu RelAI bez jednego ostrzezenia (odnoga GUARD_PO_SCIEZCE).
function projektPliku(cwd, filePath) {
  return projektDlaPlikuCore(cwd, filePath, ['.claude/relai.json']);
}

// Plik spoza katalogu projektu nie ma drogi do jego repozytorium (D-42) — skaner go nie skanuje (C6).
function wKatalogu(root, abs) {
  const rel = path.relative(path.resolve(root), abs);
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}

// 'ignorowany' | 'nieignorowany' | 'bez-gita'. Plik .env* bez gita liczy sie jak ignorowany.
// Kod 128 itp. (brak repozytorium) daje 'bez-gita': projekt moze zostac repozytorium, wiec
// skaner dalej blokuje, ale komunikat mowi o braku gita wprost (C6).
function stanGita(cwd, filePath) {
  const env = path.basename(filePath).startsWith('.env');
  try {
    const r = spawnSync('git', ['check-ignore', '-q', '--', filePath], { cwd, timeout: 5000, windowsHide: true });
    if (!r.error && r.status === 0) return 'ignorowany';
    if (!r.error && r.status === 1) return 'nieignorowany';
    return env ? 'ignorowany' : 'bez-gita';
  } catch (_) {
    return env ? 'ignorowany' : 'bez-gita';
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();

  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  const filePath = ti.file_path || ti.notebook_path || '';
  if (!filePath) return process.exit(0);

  // Rozpoznanie projektu PRZED trescia: sciezka rozstrzyga, ktorego projektu pilnujemy.
  const abs = path.resolve(cwd, filePath);
  const projekt = projektPliku(cwd, abs);
  if (!projekt) return process.exit(0);
  if (!wKatalogu(projekt.root, abs)) return process.exit(0); // C6: plik spoza katalogu projektu

  let payload = '';
  if (tool === 'Write') payload = String(ti.content || '');
  else if (tool === 'Edit') payload = String(ti.new_string || '');
  else if (tool === 'MultiEdit') payload = (ti.edits || []).map((e) => String(e.new_string || '')).join('\n');
  else if (tool === 'NotebookEdit') payload = String(ti.new_source || '');
  if (!payload) return process.exit(0);

  // git check-ignore liczony w repozytorium, do ktorego nalezy PLIK — nie w tym, w ktorym
  // stoi sesja. Inaczej odpowiedz dotyczy cudzej historii (odnoga GUARD_PO_SCIEZCE).
  const git = stanGita(projekt.root, abs);
  if (git === 'ignorowany') return process.exit(0);

  const finding = scanText(payload);
  if (!finding) return process.exit(0);

  const rel = path.relative(projekt.root, abs) || abs;
  const gdzie = git === 'nieignorowany'
    ? 'w pliku "' + rel + '", ktorego git nie ignoruje'
    : 'w pliku "' + rel + '" (projekt bez repozytorium gita albo git niedostepny)';
  const msg = 'RelAI secret-scanner: wykryto ' + finding + ' ' + gdzie +
    '. Sekrety trzymaj wylacznie w .env objetym .gitignore (D-42); do repozytorium moze trafic ' +
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
process.stdin.on('error', (e) => pytajPoAwarii(e));
process.stdin.on('end', () => {
  // BOM zdejmowany przed JSON.parse (zasada 13) — inaczej payload z BOM dawalby ask przy kazdym zapisie.
  const bom = String.fromCharCode(0xfeff);
  const text = raw.startsWith(bom) ? raw.slice(1) : raw;
  try { main(JSON.parse(text || '{}')); } catch (e) { pytajPoAwarii(e); }
});
