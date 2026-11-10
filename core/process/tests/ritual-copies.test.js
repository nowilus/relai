'use strict';

// Kopie rytualu startu (KONTEKST_STARTU E2, ryzyko 3 planu): CLAUDE.md, AGENTS.md, hooki trzech
// adapterow, oba SKILL.md skilla relai-core, regula Cursora i szablon SPEC_CLAUDE_MD niosa to samo
// polecenie skrotu startu, a zadna nie niesie juz listy plikow do przeczytania.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const core = require('../session-signals.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const POLECENIE = 'node .claude/relai/tools/start-digest.js';

const PLIKI = [
  'CLAUDE.md',
  'AGENTS.md',
  'adapters/claude-code/skills/relai-core/SKILL.md',
  'adapters/codex/skills/relai-core/SKILL.md',
  'adapters/cursor/rules/relai-core.mdc',
  'core/templates/SPEC_CLAUDE_MD.md',
  // Aneks B (E2): kopie spoza listy promptu.
  'adapters/claude-code/commands/relai-stage.md',
  'adapters/codex/skills/relai-stage/SKILL.md',
  'core/templates/SPEC_KOMENDY.md',
];

// Brzmienia dawnej listy plikow — kazde z kontrola pozytywna na tekscie sprzed E2 (nizej).
const DAWNA_LISTA = [
  /sekcja ryzyk \+ ostatni wpis/i,
  /Stan otwartych ryzyk["”]? \+ ostatni wpis/,
  /Kolejność czytania/,
  /Czytaj w (?:tej )?kolejności/,
  /Read, in this order, and nothing else/,
  /open risks and latest journal entry/i,
  /"Czeka na człowieka" and the last entry/,
  /docs\/LEKCJE\.md \(tylko "Zasady aktywne"\)/,
  /rytuał teraz: czytasz `docs\/STATE\.md`/,
  /ustalona kolejność czytania/,
];

// Fragmenty dawnych kopii, doslownie z HEAD b5b843b (przed E2).
const PRZED_E2 = [
  'docs/DZIENNIK.md (sekcja ryzyk + ostatni wpis)',
  '3. [docs/DZIENNIK.md](docs/DZIENNIK.md) — sekcja „Stan otwartych ryzyk" + ostatni wpis.',
  '### Kolejność czytania (obowiązkowa, nic poza tym)',
  'Czytaj w tej kolejności, nie skanuj repo pełnotekstowo:',
  'Read, in this order, and nothing else:',
  'read AGENTS.md, docs/STATE.md, the open risks and latest journal entry, active rules',
  '| **only** "Stan otwartych ryzyk", "Czeka na człowieka" and the last entry |',
  'docs/LEKCJE.md (tylko "Zasady aktywne"), docs/USTAWIENIA.md oraz STATUS.md aktywnego planu',
  'wykonujesz rytuał teraz: czytasz `docs/STATE.md`,',
  '- rytuał startu sesji (ustalona kolejność czytania + akapit „gdzie jesteśmy"),',
];

function projekt() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-rytual-'));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.6.0\n');
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# Fixtura\n');
  return dir;
}

function hook(rel, payload, env) {
  const r = spawnSync(process.execPath, [path.join(ROOT, rel)], {
    input: JSON.stringify(payload), encoding: 'utf8', env, timeout: 60000,
  });
  return r.stdout || '';
}

function bezClaudeCode() {
  const env = Object.assign({}, process.env);
  delete env.CLAUDECODE;
  return env;
}

test('start hooks of Claude Code and Cursor defer the ritual when the first message is a command (K-B4)', () => {
  const dir = projekt();
  const ids = ['test-rytual-komenda', 'test-rytual-komenda-compact'];
  try {
    const run = (rel, payload) => {
      const result = spawnSync(process.execPath, [path.join(ROOT, rel)], {
        cwd: dir, input: JSON.stringify(payload), encoding: 'utf8', env: process.env, timeout: 60000,
      });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout || '';
    };
    const wyjscia = [
      run('adapters/claude-code/hooks/session-context.js',
        { hook_event_name: 'SessionStart', cwd: dir, session_id: ids[0] }),
      run('adapters/cursor/hooks/session-context.js', { hook_event_name: 'sessionStart', cwd: dir }),
    ];
    for (const out of wyjscia) {
      assert.match(out, /pierwsza wiadomosc sesji jest wywolaniem komendy/);
      assert.match(out, /wykonaj rytual startu sesji/);
    }
    const compact = run('adapters/claude-code/hooks/session-context.js',
      { hook_event_name: 'SessionStart', source: 'compact', cwd: dir, session_id: ids[1] });
    assert.doesNotMatch(compact, /pierwsza wiadomosc sesji jest wywolaniem komendy/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    for (const id of ids) {
      fs.rmSync(path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id), { force: true });
    }
  }
});

test('the overdue review waits for the first message that is not a command (K-B4)', () => {
  const miara = { przeterminowane: [{ tresc: 'Decyzja o licencji', wiek: 40, odroczen: 0 }], pozycje: [{}, {}], N: 30 };
  const interactive = core.sprawyPrzeterminowaneReport(miara);
  assert.match(interactive.at(-1), /odkladasz razem z rytualem startu/);
  assert.match(interactive.at(-1), /PARTIAMI PO CZTERY/);
  for (const line of core.sprawyPrzeterminowaneReport(miara, { interaktywna: false })) {
    assert.doesNotMatch(line, /odkladasz razem z rytualem startu/);
  }
});

test('every copy of the start rule carries the command exception (K-B4)', () => {
  const files = [
    'CLAUDE.md', 'AGENTS.md',
    'adapters/claude-code/skills/relai-core/SKILL.md', 'adapters/codex/skills/relai-core/SKILL.md',
    'adapters/claude-code/skills/relai-core/overdue-review.md',
    'adapters/codex/skills/relai-core/overdue-review.md', 'core/templates/SPEC_CLAUDE_MD.md',
  ];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
    const count = text.split('która komendą nie jest').length - 1;
    assert.ok(count >= (rel === 'core/templates/SPEC_CLAUDE_MD.md' ? 2 : 1), rel);
  }
  const cursor = fs.readFileSync(path.join(ROOT, 'adapters/cursor/rules/relai-core.mdc'), 'utf8')
    .replace(/\r\n/g, '\n');
  assert.ok(cursor.includes('the first message that is not a command'));
});

test('old file-list wording: every pattern matches the pre-E2 text (positive control)', () => {
  for (const wzorzec of DAWNA_LISTA) {
    assert.ok(PRZED_E2.some((t) => wzorzec.test(t)), 'wzorzec bez kontroli pozytywnej: ' + wzorzec);
  }
});

test('every ritual copy carries the digest command and no file list', () => {
  assert.equal(core.POLECENIE_SKROTU, POLECENIE);
  for (const rel of PLIKI) {
    const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.ok(txt.includes(POLECENIE), rel + ': brak polecenia skrotu');
    for (const wzorzec of DAWNA_LISTA) {
      assert.ok(!wzorzec.test(txt), rel + ': dawna lista plikow (' + wzorzec + ')');
    }
  }
});

test('session start hooks of three adapters print the same command, compact only reminds', () => {
  const dir = projekt();
  try {
    const wyjscia = {
      'claude-code': hook('adapters/claude-code/hooks/session-context.js',
        { hook_event_name: 'SessionStart', cwd: dir, session_id: 'test-rytual' }, process.env),
      cursor: hook('adapters/cursor/hooks/session-context.js',
        { hook_event_name: 'sessionStart', cwd: dir }, process.env),
      codex: hook('adapters/codex/hooks/session-context.js', { cwd: dir }, bezClaudeCode()),
    };
    for (const [nazwa, out] of Object.entries(wyjscia)) {
      assert.ok(out.includes(POLECENIE), nazwa + ': hook bez polecenia skrotu');
      for (const wzorzec of DAWNA_LISTA) assert.ok(!wzorzec.test(out), nazwa + ': dawna lista (' + wzorzec + ')');
    }
    assert.match(wyjscia['claude-code'], /wykonaj rytual startu sesji/);

    // Po kompakcji: przypomnienie polecenia, bez wymuszenia rytualu od nowa.
    const poKompakcji = hook('adapters/claude-code/hooks/session-context.js',
      { hook_event_name: 'SessionStart', source: 'compact', cwd: dir, session_id: 'test-rytual-2' }, process.env);
    assert.ok(poKompakcji.includes(POLECENIE));
    assert.match(poKompakcji, /Po kompakcji nie czytasz dokumentow od nowa/);
    assert.doesNotMatch(poKompakcji, /wykonaj rytual startu sesji/);

    // Projekt dostal kopie narzedzia, ktore polecenie wola.
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'relai', 'tools', 'start-digest.js')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    // Hook Claude Code zostawia znacznik "ustawienia podane" na sesje w katalogu tymczasowym.
    for (const id of ['test-rytual', 'test-rytual-2']) {
      fs.rmSync(path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id), { force: true });
    }
  }
});

test('overdue items: hooks of three adapters report them, the digest does not', () => {
  // Audyt A2 (OPTYMALIZACJA_PO_AUDYCIE E8): hook startu jest jedynym nosnikiem spraw
  // przeterminowanych we wszystkich trzech adapterach; skrot startu sekcji nie powtarza.
  const dir = projekt();
  try {
    fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.6.0\n\n'
      + '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n'
      + '| 2026-09-01 | Przegląd spraw człowieka | włączony · 30 dni |\n');
    fs.writeFileSync(path.join(dir, 'docs', 'DZIENNIK.md'), '# DZIENNIK\n\n## Czeka na człowieka\n\n'
      + '- **SPRAWA-STARA do decyzji** · 2026-01-01\n\n## Wpisy\n\n### 2026-10-01 — Wpis\n\nTresc.\n');
    const wyjscia = {
      'claude-code': hook('adapters/claude-code/hooks/session-context.js',
        { hook_event_name: 'SessionStart', cwd: dir, session_id: 'test-rytual-sprawy' }, process.env),
      cursor: hook('adapters/cursor/hooks/session-context.js',
        { hook_event_name: 'sessionStart', cwd: dir }, process.env),
      codex: hook('adapters/codex/hooks/session-context.js', { cwd: dir }, bezClaudeCode()),
    };
    for (const [nazwa, out] of Object.entries(wyjscia)) {
      assert.ok(out.includes('[RelAI przeglad spraw]'), nazwa + ': hook bez raportu spraw');
      assert.ok(out.includes('SPRAWA-STARA'), nazwa + ': hook bez sprawy przeterminowanej');
    }
    const skrot = require('../start-digest.js').startDigest(dir).tekst;
    assert.ok(!skrot.includes('SPRAWA-STARA'), 'skrot startu niesie sprawe przeterminowana');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-test-rytual-sprawy'), { force: true });
  }
});

test('Cursor rule states the D-88 rotation target like document-rotation.md', () => {
  const norm = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\s+/g, ' ');
  const STARE = 'The **target moves to the rotatable part**';
  const NOWE = 'until the whole live file drops below 60% of the threshold (for `LEKCJE.md`: without "Zasady aktywne")';
  const ANEKS_LEKCJE = 'In `docs/LEKCJE.md` the KB threshold and target count the file without the "Zasady aktywne" section';
  const ANEKS_RYZYKA = 'a risk section over its threshold with no `ZAMKNIĘTE` risk gives no start line and no blocked-rotation message, only one sentence in the "sprawdź status" report (D-88, annex';
  // kontrola pozytywna: STARE trafia w brzmienie reguly z main @ 5aeab39
  const PRZED = 'The **target moves to the rotatable part**: take the oldest items until **it** drops below 60% of the threshold';
  assert.ok(PRZED.includes(STARE));
  const mdc = norm('adapters/cursor/rules/relai-core.mdc');
  assert.ok(!mdc.includes(STARE), 'regula Cursora: cel na czesci rotowalnej, sprzeczny z D-88');
  assert.ok(mdc.includes(NOWE), 'regula Cursora: brak celu D-88');
  assert.ok(mdc.includes(ANEKS_LEKCJE), 'regula Cursora: brak aneksu D-88 (lekcje bez Zasad aktywnych)');
  assert.ok(mdc.includes(ANEKS_RYZYKA), 'regula Cursora: brak aneksu D-88 (ryzyka bez ZAMKNIETE)');
  for (const rel of ['adapters/claude-code/skills/relai-core/document-rotation.md',
    'adapters/codex/skills/relai-core/document-rotation.md']) {
    assert.ok(norm(rel).includes('aż cały żywy plik zejdzie poniżej 60% progu'), rel + ': zrodlo D-88');
  }
});
