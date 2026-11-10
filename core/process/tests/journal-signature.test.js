'use strict';

// K-C9 (plan OPTYMALIZACJA_PO_AUDYCIE, E5): journal-signature sprawdza podpis NAJNOWSZEGO wpisu
// takze w dzienniku malejacym (najnowszy na gorze), a przy pomiarze "C9: NIE WIDZI" oba hooki
// przypomnien (journal-signature, doc-sync-reminder) mowia do modelu przez additionalContext.
// Kazdy przypadek "cisza" ma w tym samym tescie kontrole pozytywna (zasada 3).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS = path.join(ROOT, 'adapters', 'claude-code', 'hooks');
const OK = 'Autor: RelAI (Opus 5.5) + Jan Testowy';

function fikstura(t, dziennik) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c9-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, '.git'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  fs.writeFileSync(path.join(root, '.git', 'config'), '[user]\n\tname = Jan Testowy\n');
  fs.writeFileSync(path.join(root, 'docs', 'DZIENNIK.md'), dziennik);
  return { root, home };
}

function wpis(data, tytul, autor) {
  return '### ' + data + ' — ' + tytul + '\n\n' + (autor ? autor + '\n\n' : '') + 'Tresc wpisu.\n\n';
}

function surowe(f) {
  const r = spawnSync(process.execPath, [path.join(HOOKS, 'journal-signature.js')], {
    cwd: f.root,
    input: JSON.stringify({
      hook_event_name: 'PostToolUse', cwd: f.root, tool_name: 'Edit',
      tool_input: { file_path: path.join(f.root, 'docs', 'DZIENNIK.md') },
    }),
    encoding: 'utf8',
    env: { ...process.env, HOME: f.home, USERPROFILE: f.home },
  });
  assert.equal(r.status, 0, 'hook konczy sie kodem 0');
  return r.stdout.trim() ? JSON.parse(r.stdout) : null;
}

function werdykt(f) {
  const j = surowe(f);
  if (!j) return 'cisza';
  const tekst = j.systemMessage || (j.hookSpecificOutput && j.hookSpecificOutput.additionalContext) || '';
  if (tekst.includes('nie ma linii autora')) return 'brak autora';
  if (tekst.includes('bez czlonu uzytkownika')) return 'bez czlonu';
  return 'nieznany: ' + tekst;
}

test('journal-signature: in a descending journal the newest entry at the top is checked', (t) => {
  const malejacy = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-02', 'b') + wpis('2026-11-01', 'a', OK));
  assert.equal(werdykt(malejacy), 'brak autora');

  const haiku = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-02', 'b', 'Autor: RelAI (Haiku)') + wpis('2026-11-01', 'a', OK));
  assert.equal(werdykt(haiku), 'bez czlonu');

  // Kontrola: dziennik rosnacy z niepodpisanym najnowszym na dole.
  const rosnacy = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-01', 'a', OK) + wpis('2026-11-02', 'b'));
  assert.equal(werdykt(rosnacy), 'brak autora');
});

test('journal-signature: an older unsigned entry below the newest one is ignored', (t) => {
  const malejacy = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-02', 'b', OK) + wpis('2026-11-01', 'a'));
  assert.equal(werdykt(malejacy), 'cisza');

  // Kontrola: rosnacy z najnowszym podpisanym na dole.
  const rosnacy = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-01', 'a') + wpis('2026-11-02', 'b', OK));
  assert.equal(werdykt(rosnacy), 'cisza');
  // Kontrola pozytywna w tym samym tescie: ten sam uklad bez podpisu najnowszego daje werdykt.
  const bez = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-01', 'a', OK) + wpis('2026-11-02', 'b'));
  assert.equal(werdykt(bez), 'brak autora');
});

// --- doc-sync-reminder: przypadek glowny testu 1 K-E3, tu tylko kanal -----------------------

function gitEnv(home, data) {
  const e = {
    ...process.env, HOME: home, USERPROFILE: home,
    GIT_CONFIG_GLOBAL: path.join(home, '.gitconfig'), GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
  };
  if (data) { e.GIT_AUTHOR_DATE = data; e.GIT_COMMITTER_DATE = data; }
  return e;
}

function git(root, env, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', env });
  assert.equal(r.status, 0, 'git ' + args.join(' ') + ': ' + r.stderr);
}

function projektZCommitemKodu(t) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-c9-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(home, '.gitconfig'), '');
  fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
    '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  fs.writeFileSync(path.join(root, 'docs', 'DZIENNIK.md'), '# DZIENNIK\n\n### 2026-11-01 — wpis\n\nAutor: x\n');
  git(root, gitEnv(home), ['init', '-q']);
  git(root, gitEnv(home), ['add', '--', 'docs']);
  git(root, gitEnv(home, '2026-10-01T09:00:00'), ['commit', '-q', '-m', 'docs']);
  fs.writeFileSync(path.join(root, 'src', 'a.js'), 'x\n');
  git(root, gitEnv(home), ['add', '--', 'src/a.js']);
  git(root, gitEnv(home, '2026-11-03T10:00:00'), ['commit', '-q', '-m', 'kod']);
  return { root, home };
}

test('C9: model-facing reminders use additionalContext', (t) => {
  const f = fikstura(t, '# DZIENNIK\n\n' + wpis('2026-11-02', 'b') + wpis('2026-11-01', 'a', OK));
  const j = surowe(f);
  assert.ok(j, 'journal-signature daje wyjscie dla brakujacego autora');
  assert.ok(!('systemMessage' in j), 'bez systemMessage');
  assert.equal(j.hookSpecificOutput.hookEventName, 'PostToolUse');
  assert.match(j.hookSpecificOutput.additionalContext, /nie ma linii autora/);

  const p = projektZCommitemKodu(t);
  const r = spawnSync(process.execPath, [path.join(HOOKS, 'doc-sync-reminder.js')], {
    cwd: p.root,
    input: JSON.stringify({ hook_event_name: 'Stop', cwd: p.root }),
    encoding: 'utf8',
    env: gitEnv(p.home),
  });
  assert.equal(r.status, 0);
  assert.ok(r.stdout.trim(), 'doc-sync-reminder daje wyjscie po commicie kodu');
  const d = JSON.parse(r.stdout);
  assert.ok(!('systemMessage' in d), 'bez systemMessage');
  assert.equal(d.hookSpecificOutput.hookEventName, 'Stop');
  assert.match(d.hookSpecificOutput.additionalContext, /Od ostatniego wpisu dziennika/);
});
