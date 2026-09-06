#!/usr/bin/env node
'use strict';
// RelAI core / proces: crew — rozpoznanie srodowisk, plan fal bez konfliktow, delegacja
// zadania do innego narzedzia (Claude Code, Codex, Cursor) i przeglad krzyzowy.
//
// Ten plik nalezy do RDZENIA: nie zna protokolu hookow zadnego narzedzia i nie zna pojecia
// "AskUserQuestion". Zna FAKTY o srodowisku (ktore CLI jest, ktore jest zalogowane), umie
// policzyc kolejnosc zadan tak, zeby dwa zadania nie pisaly naraz do tego samego pliku, i umie
// uruchomic JEDNO zadanie w JEDNYM narzedziu. Decyzja "kto co robi" NIGDY nie nalezy do niego —
// podejmuje ja czlowiek w wywiadzie komendy /relai-crew, a orkiestrator (model, ktory
// komende wywolal) tylko ja wykonuje.
//
// Uzywany w dwoch miejscach:
//   1) komenda /relai-crew (ta sama tresc we wszystkich trzech adapterach),
//   2) wywolanie z reki: node .claude/relai/tools/crew.js detect
//
// Kopia tego pliku laduje w projekcie uzytkownika jako .claude/relai/tools/crew.js
// (prowizjonowanie w session-signals.js, ta sama droga co clean-work.js — L-0012). Kopia musi
// dzialac SAMA: zero require na inne pliki rdzenia i zero zaleznosci npm.
//
// Twarde granice (D-41, D-42):
//   - nigdy nie dodaje flag omijajacych uprawnienia (--dangerously-*, --yolo, bypassPermissions);
//   - zadanie bez --write dostaje tryb tylko-do-odczytu narzedzia;
//   - nie czyta i nie wypisuje wartosci sekretow; sprawdza wylacznie CZY narzedzie jest zalogowane;
//   - nie pisze do docs/ — wpis w dzienniku i STATE naleza do komendy (D-44).
//
// Komunikaty CLI celowo bez polskich znakow diakrytycznych (L-0016): konsola Windows.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const KATALOG_WORK = ['.claude', 'relai', 'work', 'CREW'];
const DOMYSLNY_TIMEOUT_S = 1800;
const LIMIT_WYJSCIA = 4 * 1024 * 1024;

// Zamknieta lista narzedzi. Klucz = nazwa uzywana w listach modeli (MODELE-<narzedzie>.md).
const NARZEDZIA = {
  'claude-code': { cli: 'claude', etykieta: 'Claude Code', env: ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT'] },
  codex: { cli: 'codex', etykieta: 'Codex', env: ['CODEX_SANDBOX', 'CODEX_THREAD_ID', 'CODEX_HOME'] },
  cursor: { cli: 'agent', etykieta: 'Cursor', env: ['CURSOR_AGENT', 'CURSOR_TRACE_ID'] },
};

// Role subagentow — zamknieta lista. Ta sama tresc stoi w plikach agentow adapterow
// (adapters/claude-code/agents/, adapters/cursor/agents/); tutaj jest zrodlem dla zadan
// delegowanych do INNEGO narzedzia, ktore tych plikow nie widzi.
const ROLE = {
  coder: {
    etykieta: 'coder',
    zapis: true,
    preambula: [
      'You are a RelAI crew member in the role of CODER.',
      'Implement exactly the task below and nothing else. Touch only the files listed in the task;',
      'if the task cannot be done without touching another file, stop and report it instead of doing it.',
      'Keep code and identifiers in English. Never write a secret into a tracked file.',
      'Do not edit docs/STATE.md, docs/DZIENNIK.md or any file under docs/ — the orchestrator owns them.',
      'Finish with a section "## Report" listing: files changed, how you verified the change',
      '(exact commands and results), and anything you deliberately left out.',
    ],
  },
  tester: {
    etykieta: 'tester',
    zapis: true,
    preambula: [
      'You are a RelAI crew member in the role of TESTER.',
      'Write or extend tests for the task below; run them and report the exact command and result.',
      'Touch only test files and the files listed in the task. Never weaken an existing assertion',
      'to make a test pass — report the failure instead.',
      'Do not edit anything under docs/ — the orchestrator owns documentation.',
      'Finish with a section "## Report": tests added, command run, pass/fail counts, gaps left.',
    ],
  },
  reviewer: {
    etykieta: 'reviewer',
    zapis: false,
    preambula: [
      'You are a RelAI crew member in the role of REVIEWER. You are read-only: do not edit files.',
      'Review the change described below (use git diff for uncommitted work). Report only findings',
      'you are confident about, each as: file:line, severity (CRITICAL/HIGH/MEDIUM/LOW), problem, fix.',
      'Check explicitly: secrets in tracked files, behaviour changes outside the task scope,',
      'missing or weakened tests, and anything that contradicts docs/DECYZJE.md.',
      'Finish with a section "## Verdict": APPROVE, WARN or BLOCK, with one sentence of reason.',
    ],
  },
};

// Flagi, ktorych to narzedzie NIGDY nie sklada (D-41). Test regresyjny pilnuje tej listy.
const FLAGI_ZAKAZANE = [
  '--dangerously-skip-permissions', '--dangerously-bypass-approvals-and-sandbox',
  '--dangerously-bypass-hook-trust', '--allow-dangerously-skip-permissions', '--yolo',
  'bypassPermissions', 'danger-full-access',
];

// --- pomocnicze --------------------------------------------------------------

function teraz() {
  return new Date().toISOString();
}

function katalogWork(cwd) {
  return path.join(cwd, ...KATALOG_WORK);
}

function czytajJson(plik, domyslne) {
  try { return JSON.parse(fs.readFileSync(plik, 'utf8')); } catch (_) { return domyslne; }
}

function zapiszJson(plik, dane) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, JSON.stringify(dane, null, 2) + '\n', 'utf8');
}

function bezpiecznyId(tekst) {
  return String(tekst || '').replace(/[^A-Za-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'zadanie';
}

function nowyRunId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '_' +
    p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
}

// Domyslny wykonawca procesow. Testy podkladaja wlasny (L-0032: instrument mierzysz osobno).
// Na Windows pliki .cmd nie uruchamiaja sie przez spawnSync bez powloki (EINVAL od Node 18.20),
// wiec komenda idzie przez cmd.exe z jawnym cytowaniem kazdego argumentu.
function wykonaj(cmd, args, opcje) {
  const o = opcje || {};
  const wspolne = {
    cwd: o.cwd,
    input: o.stdin,
    encoding: 'utf8',
    timeout: (o.timeoutS || DOMYSLNY_TIMEOUT_S) * 1000,
    maxBuffer: LIMIT_WYJSCIA,
    windowsHide: true,
    env: Object.assign({}, process.env, o.env || {}),
  };
  let wynik;
  if (process.platform === 'win32') {
    const cyt = (a) => '"' + String(a).replace(/"/g, '\\"') + '"';
    const linia = [cyt(cmd)].concat(args.map(cyt)).join(' ');
    wynik = spawnSync('cmd.exe', ['/d', '/s', '/c', '"' + linia + '"'], Object.assign({ windowsVerbatimArguments: true }, wspolne));
  } else {
    wynik = spawnSync(cmd, args, wspolne);
  }
  return {
    status: wynik.status,
    stdout: String(wynik.stdout || ''),
    stderr: String(wynik.stderr || ''),
    error: wynik.error ? String(wynik.error.message || wynik.error) : '',
    timedOut: Boolean(wynik.error && wynik.error.code === 'ETIMEDOUT'),
  };
}

// Na Windows nazwa bez rozszerzenia nie wystarcza: claude jest .exe, codex i agent sa .cmd.
// Sciezke daje "where"; wynik jest zapamietywany na czas procesu.
const CACHE_CLI = {};

function sciezkaCli(narzedzie, env) {
  const e = env || process.env;
  const cli = NARZEDZIA[narzedzie].cli;
  if (process.platform !== 'win32') return cli;
  if (CACHE_CLI[cli]) return CACHE_CLI[cli];
  let znaleziona = '';
  try {
    const w = spawnSync('where.exe', [cli], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
    znaleziona = String(w.stdout || '').split(/\r?\n/).map((l) => l.trim()).find((l) => /\.(exe|cmd|bat)$/i.test(l)) || '';
  } catch (_) { znaleziona = ''; }
  if (!znaleziona && narzedzie === 'cursor' && e.LOCALAPPDATA) {
    const lokalny = path.join(e.LOCALAPPDATA, 'cursor-agent', 'agent.cmd');
    if (fs.existsSync(lokalny)) znaleziona = lokalny;
  }
  CACHE_CLI[cli] = znaleziona || cli + '.cmd';
  return CACHE_CLI[cli];
}

// --- detect ------------------------------------------------------------------
// Fakty o srodowisku: ktore CLI jest w zasiegu, ktore jest zalogowane, ktore narzedzie jest
// gospodarzem sesji (po zmiennych srodowiska). Tryb wynika z faktow: "basic", gdy poza
// gospodarzem nie ma zadnego zalogowanego narzedzia; "full", gdy jest choc jedno.
// Wartosci sekretow nie sa czytane: sprawdzana jest wylacznie odpowiedz komendy statusu.

function gospodarz(env) {
  const e = env || process.env;
  for (const [id, n] of Object.entries(NARZEDZIA)) {
    if (n.env.some((k) => e[k])) return id;
  }
  return 'unknown';
}

function statusLogowania(narzedzie, exec, env) {
  const cli = sciezkaCli(narzedzie, env);
  const opcje = { timeoutS: 30 };
  if (narzedzie === 'claude-code') {
    const r = exec(cli, ['auth', 'status'], opcje);
    if (r.status !== 0) return { loggedIn: false, detail: 'auth status exit ' + r.status };
    const j = czytajJsonTekst(r.stdout);
    return { loggedIn: Boolean(j && j.loggedIn), detail: j && j.authMethod ? String(j.authMethod) : '' };
  }
  if (narzedzie === 'codex') {
    const r = exec(cli, ['login', 'status'], opcje);
    return { loggedIn: r.status === 0 && /logged in/i.test(r.stdout + r.stderr), detail: (r.stdout + r.stderr).trim().split('\n')[0] || '' };
  }
  const r = exec(cli, ['status'], opcje);
  return { loggedIn: r.status === 0 && /logged in/i.test(r.stdout + r.stderr), detail: (r.stdout + r.stderr).trim().split('\n')[0] || '' };
}

function czytajJsonTekst(tekst) {
  const i = String(tekst).indexOf('{');
  if (i < 0) return null;
  try { return JSON.parse(String(tekst).slice(i)); } catch (_) { return null; }
}

function zdolnoscNatywna(narzedzie, exec, env) {
  const cli = sciezkaCli(narzedzie, env);
  if (narzedzie === 'claude-code') return { subagents: true, source: 'Agent tool + plugin agents/' };
  if (narzedzie === 'codex') {
    const r = exec(cli, ['features', 'list'], { timeoutS: 30 });
    const linia = (r.stdout || '').split('\n').find((l) => /^multi_agent\s/.test(l.trim())) || '';
    const wlaczone = /\btrue\s*$/.test(linia.trim());
    return { subagents: wlaczone, source: 'codex features list: ' + (linia.trim() || 'brak linii multi_agent') };
  }
  return { subagents: true, source: '.cursor/agents/*.md (subagenci projektu)' };
}

function detect(opcje) {
  const o = opcje || {};
  const exec = o.exec || wykonaj;
  const env = o.env || process.env;
  const host = o.host || gospodarz(env);
  const runtimes = {};
  for (const id of Object.keys(NARZEDZIA)) {
    const cli = sciezkaCli(id, env);
    const w = exec(cli, ['--version'], { timeoutS: 30 });
    const dostepne = w.status === 0 && !w.error;
    const wersja = dostepne ? (w.stdout + w.stderr).trim().split('\n')[0] : '';
    const wpis = { label: NARZEDZIA[id].etykieta, cli, available: dostepne, version: wersja, loggedIn: false, detail: '', native: null };
    if (dostepne) {
      const s = statusLogowania(id, exec, env);
      wpis.loggedIn = s.loggedIn;
      wpis.detail = s.detail;
      wpis.native = zdolnoscNatywna(id, exec, env);
    } else {
      wpis.detail = w.error || ('exit ' + w.status);
    }
    runtimes[id] = wpis;
  }
  const zdalne = Object.keys(runtimes).filter((id) => id !== host && runtimes[id].available && runtimes[id].loggedIn);
  return { host, runtimes, remote: zdalne, mode: zdalne.length ? 'full' : 'basic', measuredAt: teraz() };
}

function detectReport(d) {
  const out = [];
  out.push('Gospodarz sesji: ' + (d.host === 'unknown' ? 'nierozpoznany (wez nazwe z listy modeli hooka startu)' : NARZEDZIA[d.host].etykieta));
  for (const [id, r] of Object.entries(d.runtimes)) {
    const stan = !r.available ? 'BRAK CLI' : (r.loggedIn ? 'zalogowane' : 'CLI jest, NIEZALOGOWANE');
    out.push('  ' + r.label + ' (' + id + '): ' + stan + (r.version ? ' — ' + r.version : '') +
      (r.native ? '; subagenci natywni: ' + (r.native.subagents ? 'tak' : 'nie') : ''));
  }
  out.push('Tryb: ' + d.mode + (d.mode === 'full' ? ' (zdalne: ' + d.remote.join(', ') + ')' : ' (poza gospodarzem nie ma zalogowanego narzedzia)'));
  return out;
}

// --- plan --------------------------------------------------------------------
// Wejscie: lista zadan { id, title, files: [], dependsOn: [], role, runtime, model }.
// Wyjscie: fale. Dwa zadania z tym samym plikiem NIGDY nie stoja w jednej fali — pozniejsze
// na liscie dostaje niejawna zaleznosc od wczesniejszego. Zaleznosci jawne (dependsOn) tez.
// Cykl konczy sie bledem, nie zgadywaniem.

function normalizujSciezke(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
}

function planWaves(zadania) {
  if (!Array.isArray(zadania) || !zadania.length) return { waves: [], conflicts: [], error: 'brak zadan' };
  const ids = new Set();
  for (const z of zadania) {
    if (!z || !z.id) return { waves: [], conflicts: [], error: 'zadanie bez id' };
    if (ids.has(z.id)) return { waves: [], conflicts: [], error: 'powtorzone id: ' + z.id };
    ids.add(z.id);
  }
  const zaleznosci = new Map(zadania.map((z) => [z.id, new Set((z.dependsOn || []).filter((d) => ids.has(d)))]));
  const konflikty = [];
  for (let i = 0; i < zadania.length; i++) {
    const a = new Set((zadania[i].files || []).map(normalizujSciezke));
    for (let j = i + 1; j < zadania.length; j++) {
      const wspolne = (zadania[j].files || []).map(normalizujSciezke).filter((f) => a.has(f));
      if (!wspolne.length) continue;
      konflikty.push({ first: zadania[i].id, second: zadania[j].id, files: wspolne });
      zaleznosci.get(zadania[j].id).add(zadania[i].id);
    }
  }
  const gotowe = new Set();
  const fale = [];
  let pozostale = zadania.map((z) => z.id);
  while (pozostale.length) {
    const fala = pozostale.filter((id) => Array.from(zaleznosci.get(id)).every((d) => gotowe.has(d)));
    if (!fala.length) return { waves: fale, conflicts: konflikty, error: 'cykl zaleznosci: ' + pozostale.join(', ') };
    fale.push(fala);
    fala.forEach((id) => gotowe.add(id));
    pozostale = pozostale.filter((id) => !gotowe.has(id));
  }
  return { waves: fale, conflicts: konflikty, error: '' };
}

function planReport(plan, zadania) {
  const out = [];
  if (plan.error) { out.push('BLAD planu: ' + plan.error); return out; }
  const poId = new Map((zadania || []).map((z) => [z.id, z]));
  plan.waves.forEach((fala, i) => {
    out.push('Fala ' + (i + 1) + (fala.length > 1 ? ' (rownolegle): ' : ' (pojedyncze): ') +
      fala.map((id) => { const z = poId.get(id) || {}; return id + (z.runtime ? '@' + z.runtime : '') + (z.role ? '/' + z.role : ''); }).join(', '));
  });
  for (const k of plan.conflicts) out.push('  konflikt plikow: ' + k.second + ' czeka na ' + k.first + ' (' + k.files.join(', ') + ')');
  if (!plan.conflicts.length) out.push('  konflikty plikow: brak');
  return out;
}

// --- komenda narzedzia -------------------------------------------------------
// Sklada wywolanie bez uruchamiania: testowalne i widoczne dla czlowieka przed startem.
// Tryb zapisu jest JAWNY (write=true); brak flagi = tryb tylko-do-odczytu narzedzia.

function buildCommand(narzedzie, o) {
  const opcje = o || {};
  const write = Boolean(opcje.write);
  if (!NARZEDZIA[narzedzie]) throw new Error('nieznane narzedzie: ' + narzedzie);
  const cwd = opcje.cwd || process.cwd();
  const cli = opcje.cli || sciezkaCli(narzedzie, opcje.env);
  if (narzedzie === 'claude-code') {
    const args = ['-p', '--output-format', 'text'];
    if (opcje.model) args.push('--model', opcje.model);
    if (write) args.push('--permission-mode', 'acceptEdits', '--allowedTools', 'Read', 'Glob', 'Grep', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Bash');
    else args.push('--permission-mode', 'plan');
    return { cmd: cli, args, stdin: opcje.prompt || '', cwd };
  }
  if (narzedzie === 'codex') {
    const args = ['exec', '--skip-git-repo-check', '--color', 'never', '-C', cwd];
    if (opcje.model) args.push('-m', opcje.model);
    if (write) args.push('-s', 'workspace-write', '-c', 'approval_policy="never"');
    else args.push('-s', 'read-only', '--ephemeral');
    if (opcje.lastMessageFile) args.push('-o', opcje.lastMessageFile);
    args.push('-');
    return { cmd: cli, args, stdin: opcje.prompt || '', cwd };
  }
  if (narzedzie === 'cursor') {
    const args = ['-p', '--output-format', 'text', '--trust', '--workspace', cwd];
    if (opcje.model) args.push('--model', opcje.model);
    if (write) args.push('-f'); else args.push('--mode', 'ask');
    // Prompt idzie stdin-em, jak w pozostalych narzedziach (zmierzone 2026-09-06: agent -p
    // czyta stdin; ten sam prompt wieloliniowy jako argument bywa czytany fragmentami).
    return { cmd: cli, args, stdin: opcje.prompt || '', cwd };
  }
  throw new Error('nieznane narzedzie: ' + narzedzie);
}

function buildReviewCommand(narzedzie, o) {
  const opcje = o || {};
  const cwd = opcje.cwd || process.cwd();
  const cli = opcje.cli || sciezkaCli(narzedzie, opcje.env);
  if (narzedzie === 'codex') {
    const args = ['review', '--color', 'never'];
    if (opcje.base) args.push('--base', opcje.base); else args.push('--uncommitted');
    if (opcje.model) args.push('-c', 'model="' + opcje.model + '"');
    args.push(opcje.prompt || ROLE.reviewer.preambula.join('\n'));
    return { cmd: cli, args, stdin: '', cwd };
  }
  // Claude Code i Cursor: przeglad to zadanie tylko-do-odczytu z preambula recenzenta.
  return buildCommand(narzedzie, Object.assign({}, opcje, { write: false }));
}

function sprawdzFlagi(komenda) {
  const zle = komenda.args.filter((a) => FLAGI_ZAKAZANE.some((f) => String(a).includes(f)));
  if (zle.length) throw new Error('zakazana flaga w komendzie: ' + zle.join(' '));
  return komenda;
}

// --- prompt roli -------------------------------------------------------------

function composePrompt(rola, trescZadania, o) {
  const opcje = o || {};
  const r = ROLE[rola];
  if (!r) throw new Error('nieznana rola: ' + rola + ' (dozwolone: ' + Object.keys(ROLE).join(', ') + ')');
  const czesci = [r.preambula.join('\n'), ''];
  if (opcje.files && opcje.files.length) czesci.push('Files in scope: ' + opcje.files.join(', '), '');
  czesci.push('## Task', '', String(trescZadania).trim(), '');
  czesci.push('Working directory: ' + (opcje.cwd || process.cwd()), 'RelAI crew run: ' + (opcje.runId || '-') + ', task: ' + (opcje.taskId || '-'));
  return czesci.join('\n') + '\n';
}

// --- run ---------------------------------------------------------------------
// Uruchamia JEDNO zadanie w JEDNYM narzedziu i zostawia slad w katalogu roboczym:
//   <id>.prompt.md, <id>.out.txt, <id>.err.txt, manifest.json (status zadan przebiegu).

function manifestPlik(cwd, runId) {
  return path.join(katalogWork(cwd), runId, 'manifest.json');
}

function zapiszStatus(cwd, runId, rekord) {
  const plik = manifestPlik(cwd, runId);
  const m = czytajJson(plik, { runId, createdAt: teraz(), tasks: [] });
  const i = m.tasks.findIndex((t) => t.id === rekord.id);
  if (i >= 0) m.tasks[i] = Object.assign({}, m.tasks[i], rekord); else m.tasks.push(rekord);
  m.updatedAt = teraz();
  zapiszJson(plik, m);
  return m;
}

function run(cwd, o) {
  const opcje = o || {};
  const exec = opcje.exec || wykonaj;
  const narzedzie = opcje.runtime;
  if (!NARZEDZIA[narzedzie]) throw new Error('nieznane narzedzie: ' + String(narzedzie) + ' (dozwolone: ' + Object.keys(NARZEDZIA).join(', ') + ')');
  const runId = bezpiecznyId(opcje.runId || nowyRunId());
  const taskId = bezpiecznyId(opcje.taskId || 'zadanie');
  const rola = opcje.role || (opcje.write ? 'coder' : 'reviewer');
  if (!ROLE[rola]) throw new Error('nieznana rola: ' + rola);
  const write = opcje.write === undefined ? ROLE[rola].zapis : Boolean(opcje.write);
  if (write && !ROLE[rola].zapis) throw new Error('rola ' + rola + ' jest tylko-do-odczytu; --write jest tu zakazane');

  const katalog = path.join(katalogWork(cwd), runId);
  fs.mkdirSync(katalog, { recursive: true });
  const tresc = opcje.prompt !== undefined ? String(opcje.prompt) : fs.readFileSync(opcje.promptFile, 'utf8');
  const prompt = opcje.raw ? tresc : composePrompt(rola, tresc, { files: opcje.files, cwd, runId, taskId });
  const promptPlik = path.join(katalog, taskId + '.prompt.md');
  fs.writeFileSync(promptPlik, prompt, 'utf8');
  const lastMessageFile = path.join(katalog, taskId + '.last.md');

  const komenda = sprawdzFlagi(buildCommand(narzedzie, {
    cwd, write, model: opcje.model, prompt, promptFile: promptPlik, lastMessageFile, env: opcje.env, cli: opcje.cli,
  }));
  const start = teraz();
  zapiszStatus(cwd, runId, { id: taskId, runtime: narzedzie, role: rola, model: opcje.model || '', write, status: 'running', startedAt: start, command: [komenda.cmd].concat(komenda.args) });

  const w = exec(komenda.cmd, komenda.args, { cwd, stdin: komenda.stdin, timeoutS: opcje.timeoutS, env: opcje.env });
  const outPlik = path.join(katalog, taskId + '.out.txt');
  const errPlik = path.join(katalog, taskId + '.err.txt');
  fs.writeFileSync(outPlik, w.stdout, 'utf8');
  fs.writeFileSync(errPlik, w.stderr + (w.error ? '\n[spawn] ' + w.error : ''), 'utf8');
  let ostatnia = w.stdout;
  try { if (fs.existsSync(lastMessageFile)) ostatnia = fs.readFileSync(lastMessageFile, 'utf8'); } catch (_) { /* zostaje stdout */ }
  const ok = w.status === 0 && !w.error;
  const rekord = {
    id: taskId, runtime: narzedzie, role: rola, model: opcje.model || '', write,
    status: w.timedOut ? 'timeout' : (ok ? 'done' : 'failed'), exitCode: w.status, startedAt: start, finishedAt: teraz(),
    files: { prompt: promptPlik, out: outPlik, err: errPlik },
  };
  zapiszStatus(cwd, runId, rekord);
  return Object.assign({ ok, runId, output: ostatnia, stderr: w.stderr, spawnError: w.error }, rekord);
}

function review(cwd, o) {
  const opcje = o || {};
  const exec = opcje.exec || wykonaj;
  const narzedzie = opcje.runtime;
  if (!NARZEDZIA[narzedzie]) throw new Error('nieznane narzedzie: ' + String(narzedzie));
  const runId = bezpiecznyId(opcje.runId || nowyRunId());
  const taskId = bezpiecznyId(opcje.taskId || 'review-' + narzedzie);
  const katalog = path.join(katalogWork(cwd), runId);
  fs.mkdirSync(katalog, { recursive: true });
  const zakres = opcje.base ? 'Review the changes of this branch against base "' + opcje.base + '" (git diff ' + opcje.base + '...HEAD).' : 'Review the uncommitted changes (git diff, git diff --staged, untracked files).';
  const prompt = composePrompt('reviewer', zakres + '\n\n' + String(opcje.context || ''), { cwd, runId, taskId, files: opcje.files });
  const promptPlik = path.join(katalog, taskId + '.prompt.md');
  fs.writeFileSync(promptPlik, prompt, 'utf8');
  const komenda = sprawdzFlagi(buildReviewCommand(narzedzie, { cwd, model: opcje.model, base: opcje.base, prompt, promptFile: promptPlik, env: opcje.env, cli: opcje.cli }));
  const start = teraz();
  zapiszStatus(cwd, runId, { id: taskId, runtime: narzedzie, role: 'reviewer', model: opcje.model || '', write: false, status: 'running', startedAt: start, command: [komenda.cmd].concat(komenda.args) });
  const w = exec(komenda.cmd, komenda.args, { cwd, stdin: komenda.stdin, timeoutS: opcje.timeoutS, env: opcje.env });
  const outPlik = path.join(katalog, taskId + '.out.txt');
  fs.writeFileSync(outPlik, w.stdout, 'utf8');
  fs.writeFileSync(path.join(katalog, taskId + '.err.txt'), w.stderr + (w.error ? '\n[spawn] ' + w.error : ''), 'utf8');
  const ok = w.status === 0 && !w.error;
  const rekord = { id: taskId, runtime: narzedzie, role: 'reviewer', model: opcje.model || '', write: false, status: w.timedOut ? 'timeout' : (ok ? 'done' : 'failed'), exitCode: w.status, startedAt: start, finishedAt: teraz(), files: { prompt: promptPlik, out: outPlik } };
  zapiszStatus(cwd, runId, rekord);
  const werdykt = (w.stdout.match(/\b(APPROVE|WARN|BLOCK)\b/) || [])[1] || '';
  return Object.assign({ ok, runId, output: w.stdout, stderr: w.stderr, spawnError: w.error, verdict: werdykt }, rekord);
}

// --- status ------------------------------------------------------------------

function status(cwd, runId) {
  const root = katalogWork(cwd);
  let przebiegi = [];
  try { przebiegi = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); } catch (_) { przebiegi = []; }
  if (runId) przebiegi = przebiegi.filter((r) => r === runId);
  return przebiegi.map((r) => czytajJson(manifestPlik(cwd, r), { runId: r, tasks: [] }));
}

function statusReport(lista) {
  const out = [];
  if (!lista.length) { out.push('Brak przebiegow crew w .claude/relai/work/CREW/.'); return out; }
  for (const m of lista) {
    out.push('Przebieg ' + m.runId + ' (' + (m.tasks || []).length + ' zadan, ostatnia zmiana ' + (m.updatedAt || m.createdAt || '?') + ')');
    for (const t of (m.tasks || [])) {
      out.push('  ' + t.id + ' @' + t.runtime + '/' + t.role + (t.model ? ' [' + t.model + ']' : '') + ': ' + t.status +
        (t.exitCode !== undefined && t.exitCode !== null ? ' (exit ' + t.exitCode + ')' : '') + (t.write ? ' write' : ' read-only'));
    }
  }
  return out;
}

// --- setup -------------------------------------------------------------------
// Raport gotowosci z instrukcjami dla czlowieka. NICZEGO nie instaluje i nie loguje —
// instalacja i logowanie sa jawna czynnoscia czlowieka (D-42, D-70).

const INSTRUKCJE = {
  'claude-code': { install: 'npm install -g @anthropic-ai/claude-code', login: 'claude auth login' },
  codex: { install: 'npm install -g @openai/codex', login: 'codex login' },
  cursor: { install: 'cursor.com/cli (instalator agenta Cursor)', login: 'agent login' },
};

function setupReport(d) {
  const out = detectReport(d);
  for (const [id, r] of Object.entries(d.runtimes)) {
    if (!r.available) out.push('  -> ' + r.label + ': zainstaluj: ' + INSTRUKCJE[id].install + ' (RelAI tego nie robi za Ciebie)');
    else if (!r.loggedIn) out.push('  -> ' + r.label + ': zaloguj: ' + INSTRUKCJE[id].login + ' (RelAI tego nie robi za Ciebie)');
  }
  if (d.mode === 'basic') out.push('Tryb basic: orkiestracja zostaje w narzedziu gospodarza; drugie zalogowane narzedzie wlacza tryb full bez zadnej konfiguracji.');
  return out;
}

// --- CLI ---------------------------------------------------------------------

function parsujArgs(argv) {
  const flagi = {};
  const wolne = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const nazwa = a.slice(2);
      const nast = argv[i + 1];
      if (nast !== undefined && !nast.startsWith('--')) { flagi[nazwa] = nast; i++; } else flagi[nazwa] = true;
    } else wolne.push(a);
  }
  return { flagi, wolne };
}

const UZYCIE = [
  'Uzycie: node crew.js <detect|setup|plan|run|review|status> [opcje] [--json]',
  '  detect                       ktore narzedzia sa i sa zalogowane; tryb basic/full',
  '  setup                        to samo plus instrukcje instalacji/logowania (nic nie wykonuje)',
  '  plan <zadania.json>          fale zadan bez konfliktow plikow',
  '  run --runtime <r> --task <plik> [--role coder|tester|reviewer] [--write] [--model m]',
  '      [--run-id id] [--task-id id] [--files a,b] [--timeout s] [--raw]',
  '  review --runtime <r> [--base galaz] [--model m] [--run-id id] [--context plik]',
  '  status [--run-id id]',
  '  prompt --role <rola> [--task <plik>] [--files a,b]   sklada prompt roli (dla natywnych subagentow gospodarza)',
  'Narzedzia: ' + Object.keys(NARZEDZIA).join(', ') + '. Role: ' + Object.keys(ROLE).join(', ') + '.',
];

function main(argv) {
  const { flagi, wolne } = parsujArgs(argv);
  const cmd = wolne[0];
  const json = Boolean(flagi.json);
  const cwd = path.resolve(flagi.cwd || process.cwd());
  const wypisz = (obiekt, linie) => { process.stdout.write(json ? JSON.stringify(obiekt, null, 2) + '\n' : linie.join('\n') + '\n'); };
  try {
    if (cmd === 'detect' || cmd === 'setup') {
      const d = detect({ host: flagi.host });
      wypisz(d, cmd === 'setup' ? setupReport(d) : detectReport(d));
      return 0;
    }
    if (cmd === 'plan') {
      const plik = wolne[1] || flagi.tasks;
      if (!plik) { process.stderr.write('plan: podaj plik z zadaniami (JSON, tablica)\n'); return 2; }
      const dane = JSON.parse(fs.readFileSync(plik, 'utf8'));
      const zadania = Array.isArray(dane) ? dane : (dane.tasks || []);
      const p = planWaves(zadania);
      wypisz(Object.assign({ tasks: zadania.map((z) => z.id) }, p), planReport(p, zadania));
      return p.error ? 1 : 0;
    }
    if (cmd === 'run') {
      if (!flagi.runtime || !flagi.task) { process.stderr.write('run: wymagane --runtime i --task <plik>\n'); return 2; }
      const r = run(cwd, {
        runtime: flagi.runtime, promptFile: path.resolve(flagi.task), role: flagi.role, write: flagi.write ? true : undefined,
        model: flagi.model, runId: flagi['run-id'], taskId: flagi['task-id'], raw: Boolean(flagi.raw),
        files: flagi.files ? String(flagi.files).split(',').map((s) => s.trim()).filter(Boolean) : [],
        timeoutS: flagi.timeout ? Number(flagi.timeout) : undefined,
      });
      wypisz(r, ['Zadanie ' + r.id + ' @' + r.runtime + '/' + r.role + ': ' + r.status + ' (exit ' + r.exitCode + ')', 'Przebieg: ' + r.runId + ' — pliki w ' + path.dirname(r.files.out), '', r.output || '(puste wyjscie)', r.spawnError ? '[spawn] ' + r.spawnError : '']);
      return r.ok ? 0 : 1;
    }
    if (cmd === 'review') {
      if (!flagi.runtime) { process.stderr.write('review: wymagane --runtime\n'); return 2; }
      const kontekst = flagi.context ? fs.readFileSync(path.resolve(flagi.context), 'utf8') : '';
      const r = review(cwd, { runtime: flagi.runtime, base: flagi.base, model: flagi.model, runId: flagi['run-id'], context: kontekst, timeoutS: flagi.timeout ? Number(flagi.timeout) : undefined });
      wypisz(r, ['Przeglad @' + r.runtime + ': ' + r.status + (r.verdict ? ' — werdykt ' + r.verdict : ' — werdyktu nie rozpoznano'), 'Przebieg: ' + r.runId, '', r.output || '(puste wyjscie)', r.spawnError ? '[spawn] ' + r.spawnError : '']);
      return r.ok ? 0 : 1;
    }
    if (cmd === 'prompt') {
      if (!flagi.role) { process.stderr.write('prompt: wymagane --role\n'); return 2; }
      const tresc = flagi.task ? fs.readFileSync(path.resolve(flagi.task), 'utf8') : '';
      const p = composePrompt(flagi.role, tresc, { cwd, runId: flagi['run-id'], taskId: flagi['task-id'], files: flagi.files ? String(flagi.files).split(',').map((x) => x.trim()).filter(Boolean) : [] });
      wypisz({ role: flagi.role, prompt: p }, [p]);
      return 0;
    }
    if (cmd === 'status') {
      const s = status(cwd, flagi['run-id']);
      wypisz(s, statusReport(s));
      return 0;
    }
    process.stdout.write(UZYCIE.join('\n') + '\n');
    return cmd ? 2 : 0;
  } catch (e) {
    process.stderr.write('RelAI crew: ' + (e && e.message ? e.message : String(e)) + '\n');
    return 1;
  }
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = {
  NARZEDZIA, ROLE, FLAGI_ZAKAZANE, KATALOG_WORK,
  gospodarz, detect, detectReport, setupReport,
  planWaves, planReport,
  buildCommand, buildReviewCommand, sprawdzFlagi, composePrompt,
  run, review, status, statusReport, sciezkaCli, main,
};
