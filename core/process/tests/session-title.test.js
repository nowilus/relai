'use strict';

// Tytul nowej sesji z fokusu (plan ZGLOSZENIA, E4, zgloszenie #1). Hook UserPromptSubmit nadaje
// sessionTitle tylko przy PIERWSZYM prompcie sesji, ktory jest fraza kontynuacji z zamknietej listy
// albo komenda etapu; zrodla: przekazanie fokusu, plik fokusu sesji, pierwsza pozycja
// "Nad czym pracujemy" w docs/STATE.md. Poza projektem RelAI i przy awarii hook milczy.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const st = require('../session-title.js');

const HOOK = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'hooks', 'session-title.js');
const USTAWIENIA = '# USTAWIENIA\n\nWersja RelAI: 3.4.0 · zainicjowano: 2026-08-07\n';
const STATUS = [
  '# STATUS — plan ZGLOSZENIA',
  '',
  'Plan: [PLAN.html](PLAN.html) · Status planu: **ZAAKCEPTOWANY 2026-10-26**',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E3 | Pasek cache w terminalu (#2) | ZREALIZOWANY 2026-10-26 | — | — |',
  '| E4 | Tytuł nowej sesji (#1) | W TOKU | — | — |',
  '',
].join('\n');
const STATE = [
  '# STATE',
  '',
  '## Nad czym pracujemy teraz',
  '',
  '- **PANEL_CODEX, E1 — przejęcie rdzenia i natywny panel w Codeksie** (plan',
  '  [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md), w Codeksie).',
  '- **Plan ZGLOSZENIA — E1–E3 ZREALIZOWANE** (drugi wiersz).',
  '',
].join('\n');

const NOW = Date.UTC(2026, 9, 26, 20, 0, 0);
const CWD = path.join(os.tmpdir(), 'relai-e4-cwd');
const focusZgl = JSON.stringify({ kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4', source: 'auto', at: NOW });
const statusOf = (plan) => (plan === 'ZGLOSZENIA' ? STATUS : null);

function args(over) {
  return { prompt: 'kontynuujemy pracę', isFirst: true, handoffText: null, focusText: null, stateMd: null,
    statusOf, now: NOW, cwd: CWD, session: 'nowa', ...over };
}

// ---------- zamknieta lista fraz ----------

test('kazda fraza z zamknietej listy jest kontynuacja (kontrola pozytywna)', () => {
  for (const p of ['kontynuujemy pracę', 'Kontynuujemy pracę.', '  kontynuuj ', 'tak', 'Tak!', "let's continue", 'continue', 'yes',
    'kontynuujemy pracę — plik wznowienia: .claude/relai/wznowienie/relai.md\nZgoda na skasowanie pliku wznowienia po wznowieniu: tak (karta „Wznów pracę”).',
    'kontynuujemy pracę — plik wznowienia: .claude/relai/wznowienie/relai.md']) {
    assert.equal(st.isContinuation(p), true, JSON.stringify(p));
  }
});

test('prompt z wlasna trescia nie jest kontynuacja', () => {
  for (const p of ['tak, ale najpierw popraw README', 'kontynuujemy pracę\n\nPotem: dodaj test', 'zrobione', 'kontynuujemy prace nad planem',
    'nie', '', 'kontynuujemy pracę — plik wznowienia: x\nusuń też katalog work']) {
    assert.equal(st.isContinuation(p), false, JSON.stringify(p));
  }
});

test('komenda etapu z karty: oba ukosniki, z prefiksem pluginu i ze znacznikiem zgody', () => {
  const want = { kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E4' };
  assert.deepEqual(st.stageCommandOf('/relai-stage ZGLOSZENIA E4'), want);
  assert.deepEqual(st.stageCommandOf('/relai:relai-stage ZGLOSZENIA E4 --zgoda-panelu k-12'), want);
  assert.deepEqual(st.stageCommandOf(String.fromCharCode(0xff0f) + 'relai:relai-stage ZGLOSZENIA E4'), want);
  assert.equal(st.stageCommandOf('/relai-stage'), null);
  assert.equal(st.stageCommandOf('/relai-stage ZGLOSZENIA E4 i jeszcze cos'), null);
});

// ---------- zrodla w kolejnosci ----------

test('przekazanie fokusu ma pierwszenstwo przed plikiem fokusu i STATE', async () => {
  const handoffText = JSON.stringify({ focus: { kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E3' }, from: ['stara'], cwd: CWD, at: NOW - 60_000 });
  const t = await st.sessionTitle(args({ handoffText, focusText: focusZgl, stateMd: STATE }));
  assert.equal(t, 'E3 · ZGLOSZENIA — Pasek cache w terminalu (#2)');
});

test('przekazanie nieważne (z tej sesji, inny folder, starsze niz 10 min) — plik fokusu', async () => {
  const base = { focus: { kind: 'plan', plan: 'ZGLOSZENIA', stage: 'E3' }, from: ['stara'], cwd: CWD, at: NOW - 60_000 };
  for (const bad of [{ ...base, from: ['nowa'] }, { ...base, cwd: path.join(CWD, 'inny') }, { ...base, at: NOW - 11 * 60_000 }, 'nie json']) {
    const handoffText = typeof bad === 'string' ? bad : JSON.stringify(bad);
    assert.equal(await st.sessionTitle(args({ handoffText, focusText: focusZgl })), 'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)', handoffText);
  }
});

test('plik fokusu sesji: plan z nazwa etapu ze STATUS, odnoga z karty', async () => {
  assert.equal(await st.sessionTitle(args({ focusText: focusZgl, stateMd: STATE })), 'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)');
  const branch = JSON.stringify({ kind: 'branch', card: 'OPIS_REPO', source: 'manual', at: NOW });
  assert.equal(await st.sessionTitle(args({ focusText: branch })), 'Odnoga OPIS_REPO');
});

test('plan bez czytelnego STATUS: sam identyfikator', async () => {
  const f = JSON.stringify({ kind: 'plan', plan: 'INNY', stage: 'E2', source: 'auto', at: NOW });
  assert.equal(await st.sessionTitle(args({ focusText: f })), 'E2 · INNY');
});

test('fokus "poza planem" albo uszkodzony nie jest zrodlem — STATE', async () => {
  for (const focusText of [JSON.stringify({ kind: 'outside', source: 'manual', at: NOW }), '{zly']) {
    assert.equal(await st.sessionTitle(args({ focusText, stateMd: STATE })), 'E1 · PANEL_CODEX — przejęcie rdzenia i natywny panel w…');
  }
});

test('STATE wskazuje plan z innego narzedzia: tytul z tej pozycji, tak jak stoi', async () => {
  assert.equal(await st.sessionTitle(args({ stateMd: STATE })), 'E1 · PANEL_CODEX — przejęcie rdzenia i natywny panel w…');
});

test('STATE z pozycja bez ksztaltu "PLAN, EN — nazwa": tekst pogrubienia', async () => {
  const md = '## Nad czym pracujemy\n\n- **Porządki w dokumentach po wydaniu** — opis\n';
  assert.equal(await st.sessionTitle(args({ stateMd: md })), 'Porządki w dokumentach po wydaniu');
});

test('komenda etapu bez przekazania i fokusu: tytul z jej celu, przed STATE', async () => {
  assert.equal(await st.sessionTitle(args({ prompt: '/relai-stage ZGLOSZENIA E4', stateMd: STATE })), 'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)');
});

test('tytul dluzszy niz 60 znakow przyciety, identyfikator zostaje', async () => {
  const f = JSON.stringify({ kind: 'plan', plan: 'DLUGI', stage: 'E1', source: 'auto', at: NOW });
  const statusOfLong = () => '| Etap | Nazwa | Status |\n|---|---|---|\n| E1 | Bardzo długa nazwa etapu, która nie zmieści się w tytule sesji aplikacji | W TOKU |\n';
  const t = await st.sessionTitle(args({ focusText: f, statusOf: statusOfLong }));
  assert.ok([...t].length <= 60 && t.startsWith('E1 · DLUGI — ') && t.endsWith('…'), t);
});

// ---------- dowod negatywny ----------

test('brak zrodla: brak tytulu', async () => {
  assert.equal(await st.sessionTitle(args({})), null);
  assert.equal(await st.sessionTitle(args({ stateMd: '# STATE\n\n## Co działa\n\n- **coś**\n' })), null);
});

test('nie pierwszy prompt albo prompt z trescia: brak tytulu mimo zrodel', async () => {
  assert.equal(await st.sessionTitle(args({ isFirst: false, focusText: focusZgl })), null);
  assert.equal(await st.sessionTitle(args({ prompt: 'tak, ale najpierw README', focusText: focusZgl })), null);
});

// ---------- hook: pierwszy prompt po stronie hooka ----------

function projekt({ relai = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e4-title-'));
  fs.mkdirSync(path.join(root, 'docs', 'plany', 'ZGLOSZENIA'), { recursive: true });
  if (relai) fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'), USTAWIENIA);
  fs.writeFileSync(path.join(root, 'docs', 'STATE.md'), STATE);
  fs.writeFileSync(path.join(root, 'docs', 'plany', 'ZGLOSZENIA', 'STATUS.md'), STATUS);
  fs.mkdirSync(path.join(root, '.claude', 'relai', 'fokus'), { recursive: true });
  return root;
}

function hook(root, payload) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ hook_event_name: 'UserPromptSubmit', cwd: root, session_id: 's1', prompt: 'kontynuujemy pracę', ...payload }),
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

const titleIn = (out) => (out ? JSON.parse(out).hookSpecificOutput.sessionTitle : null);

test('hook: pierwszy prompt-kontynuacja dostaje tytul z pliku fokusu sesji', () => {
  const root = projekt();
  try {
    fs.writeFileSync(path.join(root, '.claude', 'relai', 'fokus', 's1.json'), focusZgl);
    const out = hook(root, {});
    assert.equal(JSON.parse(out).hookSpecificOutput.hookEventName, 'UserPromptSubmit');
    assert.equal(titleIn(out), 'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('hook: "tak" jako drugi prompt tej samej sesji — brak sessionTitle', () => {
  const root = projekt();
  try {
    assert.equal(hook(root, { prompt: 'zrób przegląd' }), '');
    assert.equal(hook(root, { prompt: 'tak' }), '');
    // kontrola pozytywna w tym samym przebiegu: inna sesja, pierwszy prompt "tak" — tytul jest
    assert.equal(titleIn(hook(root, { prompt: 'tak', session_id: 's2' })), 'E1 · PANEL_CODEX — przejęcie rdzenia i natywny panel w…');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

// Transkrypt sesji po /clear z paska cache (zmierzone 2026-10-27, 2.1.308): tytul starej rozmowy
// przeniesiony rekordem custom-title, linie komendy /clear, potem prompt kontynuacji
const line = (o) => JSON.stringify(o);
const PO_CLEAR = [
  line({ type: 'custom-title', customTitle: 'PROMPT_ETAP_2 documentation summary', sessionId: 's1' }),
  line({ type: 'user', message: { role: 'user', content: '<local-command-caveat>The command below was run directly in the terminal</local-command-caveat>' } }),
  line({ type: 'user', message: { role: 'user', content: '<command-name>/clear</command-name>\n<command-message>clear</command-message>' } }),
  line({ type: 'user', isMeta: true, message: { role: 'user', content: 'Kontekst startu sesji' } }),
  line({ type: 'user', message: { role: 'user', content: 'kontynuujemy pracę' } }),
].join('\n') + '\n';
const DLUGA = [
  line({ type: 'user', message: { role: 'user', content: 'popraw README' } }),
  line({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'Poprawione.' }] } }),
  line({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 'x', content: 'ok' }] } }),
  line({ type: 'user', message: { role: 'user', content: [{ type: 'text', text: 'teraz testy' }] } }),
].join('\n') + '\n';

test('wczesniejsze prompty czlowieka w transkrypcie: komendy, meta i wyniki narzedzi sie nie licza', () => {
  assert.equal(st.priorPrompts(PO_CLEAR, 'kontynuujemy pracę'), 0);
  assert.equal(st.priorPrompts(PO_CLEAR.replace('kontynuujemy pracę', 'x'), 'kontynuujemy pracę'), 1);
  assert.equal(st.priorPrompts(DLUGA, 'tak'), 2);
  assert.equal(st.priorPrompts('', 'tak'), 0);
  assert.equal(st.priorPrompts('{zly\n' + DLUGA, 'tak'), 2);
});

test('prompt czlowieka zaczety od "<", komenda inna niz /clear i sam obraz licza sie jako wczesniejsze prompty', () => {
  const user = (content) => line({ type: 'user', message: { role: 'user', content } });
  assert.equal(st.priorPrompts(user('<div>wklejony HTML</div>'), 'tak'), 1);
  assert.equal(st.priorPrompts(user('<command-name>/relai-stage</command-name>\n<command-args>ZGLOSZENIA E4</command-args>'), 'tak'), 1);
  assert.equal(st.priorPrompts(user([{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AA==' } }]), 'tak'), 1);
  // opakowania systemowe nadal nie sa promptem
  for (const c of ['<local-command-stdout>ok</local-command-stdout>', '<system-reminder>x</system-reminder>', '<command-message>clear</command-message>',
    '<command-name>/clear</command-name>\n<command-message>clear</command-message>']) {
    assert.equal(st.priorPrompts(user(c), 'tak'), 0, c);
  }
});

function zTranskryptem(root, text) {
  const p = path.join(root, 'transkrypt.jsonl');
  fs.writeFileSync(p, text);
  return p;
}

test('hook: po /clear tytul przeniesiony z poprzedniej rozmowy — prompt kontynuacji i tak dostaje tytul', () => {
  const root = projekt();
  try {
    fs.writeFileSync(path.join(root, '.claude', 'relai', 'fokus', 's1.json'), focusZgl);
    const out = hook(root, { session_title: 'PROMPT_ETAP_2 documentation summary', transcript_path: zTranskryptem(root, PO_CLEAR) });
    assert.equal(titleIn(out), 'E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('hook: sesja z wczesniejszymi promptami (np. sprzed aktualizacji pluginu), bez znacznika — "tak" milczy', () => {
  const root = projekt();
  try {
    fs.writeFileSync(path.join(root, '.claude', 'relai', 'fokus', 's1.json'), focusZgl);
    assert.equal(hook(root, { prompt: 'tak', session_title: 'Stary tytuł', transcript_path: zTranskryptem(root, DLUGA) }), '');
    // kontrola pozytywna: ten sam folder, swiezy transkrypt innej sesji
    fs.writeFileSync(path.join(root, '.claude', 'relai', 'fokus', 's9.json'), focusZgl);
    assert.notEqual(titleIn(hook(root, { prompt: 'kontynuujemy pracę', session_id: 's9', transcript_path: zTranskryptem(root, PO_CLEAR) })), null);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('hook: prompt z wlasna trescia jako pierwszy — milczy', () => {
  const root = projekt();
  try {
    assert.equal(hook(root, { prompt: 'napraw test w panelu' }), '');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('hook: projekt bez markera RelAI — milczy (kontrola pozytywna z markerem)', () => {
  const bez = projekt({ relai: false });
  const z = projekt();
  try {
    assert.equal(hook(bez, {}), '');
    assert.notEqual(titleIn(hook(z, {})), null);
  } finally {
    fs.rmSync(bez, { recursive: true, force: true });
    fs.rmSync(z, { recursive: true, force: true });
  }
});

test('hook: zly payload i inne zdarzenie — milczy z kodem 0', () => {
  const root = projekt();
  try {
    assert.equal(hook(root, { hook_event_name: 'SessionStart' }), '');
    const r = spawnSync(process.execPath, [HOOK], { input: '{nie json', encoding: 'utf8' });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
