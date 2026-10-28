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
      fs.rmSync(path.join(os.tmpdir(), 'relai-ustawienia-podane-' + id), { force: true });
    }
  }
});
