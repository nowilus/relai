'use strict';

// Siatka rytualu "Na koniec" i wersji artefaktow (E7 PROWADZENIE_END_TO_END, A06).
// Trzy sprawdzenia, jeden wlasciciel sygnalu (hook startu): etap ZREALIZOWANY bez wpisu
// w dzienniku albo bez promptu nastepnego etapu, artefakt z rejestru zmieniony bez
// podbitej wersji, kopia CLAUDE.md w AGENTS.md rozjechana z oryginalem. Kazdy przypadek
// ma kontrole pozytywna (podlozony defekt daje sygnal) obok ciszy na stanie zgodnym.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const core = require('../session-signals.js');

// Kazdy katalog tymczasowy znika po przebiegu — testy nie zostawiaja smieci w %TEMP%.
const utworzone = [];
test.after(() => { for (const d of utworzone) fs.rmSync(d, { recursive: true, force: true }); });

function projekt(pliki) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e7-net-'));
  utworzone.push(dir);
  for (const [rel, tresc] of Object.entries(pliki)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, tresc, 'utf8');
  }
  return dir;
}

function git(dir, args) {
  const r = spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 0, 'git ' + args.join(' ') + ': ' + r.stderr);
  return r.stdout;
}

function repo(pliki) {
  const dir = projekt(pliki);
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 't@example.com']);
  git(dir, ['config', 'user.name', 'Test']);
  git(dir, ['config', 'core.autocrlf', 'false']);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'start']);
  return dir;
}

const CLAUDE = '# Projekt\n\nAktywny plan: [PLATNOSCI](docs/plany/PLATNOSCI/STATUS.md)\n';

function status(wiersze) {
  return '# STATUS\n\n| Etap | Nazwa | Status | Prompt | Uwagi |\n|---|---|---|---|---|\n' +
    wiersze.join('\n') + '\n';
}

const DZIENNIK = '# DZIENNIK\n\n## Wpisy\n\n### 2026-08-14 — E1 zamkniety\n\nZrobione.\n';

// --- etap zamkniety bez rytualu ----------------------------------------------

test('rytualEtapu is silent when the closed stage has a journal entry and the next prompt', () => {
  const dir = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E1 | Model | **ZREALIZOWANY 2026-08-14** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
      '| E2 | Webhooki | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
      '| E3 | Faktury | OCZEKUJE | — | |',
    ]),
    'docs/plany/PLATNOSCI/PROMPT_ETAP_1.md': 'p1',
    'docs/plany/PLATNOSCI/PROMPT_ETAP_2.md': 'p2',
  });
  assert.deepEqual(core.rytualEtapu(dir), []);
});

test('rytualEtapu reports a closed stage without a journal entry of that date', () => {
  const dir = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E1 | Model | ZREALIZOWANY 2026-08-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
      '| E2 | Webhooki | ZREALIZOWANY 2026-08-20 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
      '| E3 | Faktury | GOTOWY DO STARTU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | |',
    ]),
    'docs/plany/PLATNOSCI/PROMPT_ETAP_3.md': 'p3',
  });
  const fakty = core.rytualEtapu(dir);
  assert.equal(fakty.length, 1);
  assert.match(fakty[0], /E2/);
  assert.match(fakty[0], /2026-08-20/);
  assert.match(fakty[0], /dziennik/);
});

test('rytualEtapu finds the journal entry in the journal archive after rotation', () => {
  const dir = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/archiwum/dziennik/DZIENNIK_2026-08-15_2026-08-20.md': '# Archiwum\n\n### 2026-08-20 — E2\n',
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E2 | Webhooki | ZREALIZOWANY 2026-08-20 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
      '| E3 | Faktury | GOTOWY DO STARTU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | |',
    ]),
    'docs/plany/PLATNOSCI/PROMPT_ETAP_3.md': 'p3',
  });
  assert.deepEqual(core.rytualEtapu(dir), []);
});

test('rytualEtapu reports a next stage left waiting without a prompt', () => {
  const dir = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E1 | Model | ZREALIZOWANY 2026-08-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
      '| E2 | Webhooki | POMINIĘTY — poza zakresem | — | |',
      '| E3 | Faktury | OCZEKUJE | — | |',
    ]),
  });
  const fakty = core.rytualEtapu(dir);
  assert.equal(fakty.length, 1);
  assert.match(fakty[0], /E3/);
  assert.match(fakty[0], /prompt/);
});

test('rytualEtapu leaves a READY stage without a prompt to promptGap (one owner)', () => {
  const dir = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E1 | Model | ZREALIZOWANY 2026-08-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
      '| E2 | Webhooki | GOTOWY DO STARTU | — | |',
    ]),
  });
  assert.deepEqual(core.rytualEtapu(dir), []);
  assert.ok(core.promptGap(dir), 'kontrola: ta luka nalezy do promptGap i on ja widzi');
});

test('rytualEtapu is silent for the last stage of a plan and without an active plan', () => {
  const ostatni = projekt({
    'CLAUDE.md': CLAUDE,
    'docs/DZIENNIK.md': DZIENNIK,
    'docs/plany/PLATNOSCI/STATUS.md': status([
      '| E1 | Model | ZREALIZOWANY 2026-08-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
    ]),
  });
  assert.deepEqual(core.rytualEtapu(ostatni), []);
  const bezPlanu = projekt({ 'CLAUDE.md': '# Projekt\n\nAktywny plan: brak\n', 'docs/DZIENNIK.md': DZIENNIK });
  assert.deepEqual(core.rytualEtapu(bezPlanu), []);
});

// --- artefakt bez podbitej wersji --------------------------------------------

const REJESTR = (wersja) => '# ARTEFAKTY\n\n| Artefakt | Plik | Wersja | Data | Co sie zmienilo | Po co |\n' +
  '|---|---|---|---|---|---|\n' +
  '| Prompt powitalny | `prompts/powitanie.md` | ' + wersja + ' | 2026-08-01 | start | powitanie |\n' +
  '| Prompt zwrotu | `prompts/zwrot.md` | 2 | 2026-08-02 | poprawka | zwroty |\n';

function repoArtefaktow() {
  return repo({
    'docs/ARTEFAKTY.md': REJESTR(1),
    'prompts/powitanie.md': 'Czesc.\n',
    'prompts/zwrot.md': 'Zwrot.\n',
    'src/app.js': 'console.log(1);\n',
  });
}

test('artefaktyBezWersji is silent on a clean tree and on a bumped version', () => {
  const dir = repoArtefaktow();
  assert.deepEqual(core.artefaktyBezWersji(dir), []);
  fs.writeFileSync(path.join(dir, 'prompts/powitanie.md'), 'Dzien dobry.\n');
  fs.writeFileSync(path.join(dir, 'docs/ARTEFAKTY.md'), REJESTR(2));
  assert.deepEqual(core.artefaktyBezWersji(dir), []);
});

test('artefaktyBezWersji reports a changed artifact whose version stayed the same', () => {
  const dir = repoArtefaktow();
  fs.writeFileSync(path.join(dir, 'prompts/powitanie.md'), 'Dzien dobry.\n');
  fs.writeFileSync(path.join(dir, 'src/app.js'), 'console.log(2);\n'); // nie artefakt — cisza
  const fakty = core.artefaktyBezWersji(dir);
  assert.equal(fakty.length, 1);
  assert.match(fakty[0], /prompts\/powitanie\.md/);
  assert.match(fakty[0], /nadal wersje 1/);
});

test('artefaktyBezWersji is silent without git or without a registry', () => {
  const bezGita = projekt({ 'docs/ARTEFAKTY.md': REJESTR(1), 'prompts/powitanie.md': 'x' });
  assert.deepEqual(core.artefaktyBezWersji(bezGita), []);
  const bezRejestru = repo({ 'prompts/powitanie.md': 'x' });
  fs.writeFileSync(path.join(bezRejestru, 'prompts/powitanie.md'), 'y');
  assert.deepEqual(core.artefaktyBezWersji(bezRejestru), []);
});

// --- kopia CLAUDE.md w AGENTS.md ---------------------------------------------

const ORYGINAL = '# Projekt\n\nWstep dla Claude Code.\n\n## Rytual\n\nCzytaj STATE.\n\n## Reguly\n\nPo polsku.\n';
const KOPIA = (reguly) => '# Projekt\n\n> Kopia `CLAUDE.md` dla Codeksa, zsynchronizowana 2026-09-01.\n\n' +
  'Wstep dla Codeksa.\n\n## Rytual\n\nCzytaj STATE.\n\n## Reguly\n\n' + reguly + '\n';

test('kopiaAgents is silent when the copy matches from the first section on (CRLF too)', () => {
  const dir = projekt({ 'CLAUDE.md': ORYGINAL.replace(/\n/g, '\r\n'), 'AGENTS.md': KOPIA('Po polsku.') });
  assert.deepEqual(core.kopiaAgents(dir), []);
});

test('kopiaAgents reports the first section where the copy drifted', () => {
  const dir = projekt({ 'CLAUDE.md': ORYGINAL, 'AGENTS.md': KOPIA('Po angielsku.') });
  const fakty = core.kopiaAgents(dir);
  assert.equal(fakty.length, 1);
  assert.match(fakty[0], /AGENTS\.md/);
  assert.match(fakty[0], /## Reguly/);
});

test('kopiaAgents ignores an AGENTS.md that does not declare itself a copy', () => {
  const dir = projekt({ 'CLAUDE.md': ORYGINAL, 'AGENTS.md': '# Router\n\nRead CLAUDE.md.\n\n## Other\n\nx\n' });
  assert.deepEqual(core.kopiaAgents(dir), []);
});

// --- raport -----------------------------------------------------------------

test('siatkaRytualuReport is empty for no facts and one ASCII line otherwise', () => {
  assert.deepEqual(core.siatkaRytualuReport([]), []);
  const linie = core.siatkaRytualuReport(['etap E2 — brak wpisu „dziennika"', 'AGENTS.md rozjechany']);
  assert.equal(linie.length, 1);
  assert.match(linie[0], /E2/);
  assert.match(linie[0], /AGENTS\.md/);
  assert.ok(/^[\x20-\x7e]*$/.test(linie[0]), 'linia ma byc w ASCII (L-0016)');
});
