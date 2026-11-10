'use strict';

// K-E3 (plan OPTYMALIZACJA_PO_AUDYCIE, E5): hook Stop doc-sync-reminder przypomina jednym
// zdaniem, gdy od daty najnowszego wpisu dziennika sa commity zmieniajace kod, a zaden nie
// zmienia docs/DZIENNIK.md ani docs/STATE.md (D-44 po commicie). Pomocnik czyta tekst
// z systemMessage albo z hookSpecificOutput.additionalContext - test przezywa K-C9.
// Git w fiksturze odciety od konfiguracji uzytkownika (GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOK = path.join(ROOT, 'adapters', 'claude-code', 'hooks', 'doc-sync-reminder.js');
const D = '# DZIENNIK\n\n### 2026-11-01 — wpis\n\nAutor: x\n';
const D_MALEJACY = '# DZIENNIK\n\n### 2026-11-01 — nowy\n\nAutor: x\n\n### 2026-09-01 — stary\n\nAutor: x\n';

function fikstura(t, opcje) {
  const o = opcje || {};
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e3-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  fs.writeFileSync(path.join(home, '.gitconfig'), '');
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    GIT_CONFIG_GLOBAL: path.join(home, '.gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
    GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
  };
  const f = { root, home, env };
  zapisz(f, 'docs/USTAWIENIA.md', '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  zapisz(f, 'docs/DZIENNIK.md', o.dziennik || D);
  if (o.git !== false) {
    git(f, ['init', '-q']);
    commit(f, ['docs/USTAWIENIA.md', 'docs/DZIENNIK.md'], '2026-10-01T09:00:00');
  }
  return f;
}

function zapisz(f, rel, tresc) {
  const p = path.join(f.root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, tresc);
}

function git(f, args, env) {
  const r = spawnSync('git', args, { cwd: f.root, encoding: 'utf8', env: env || f.env });
  assert.equal(r.status, 0, 'git ' + args.join(' ') + ': ' + r.stderr);
  return r;
}

// Commit plikow (tworzy je, gdy ich nie ma) z data autora i commitera.
function commit(f, pliki, data) {
  for (const rel of pliki) {
    const p = path.join(f.root, rel);
    if (!fs.existsSync(p)) zapisz(f, rel, rel + '\n');
    else fs.appendFileSync(p, 'zmiana ' + data + '\n');
  }
  git(f, ['add', '--', ...pliki]);
  git(f, ['commit', '-q', '-m', 'test ' + data], { ...f.env, GIT_AUTHOR_DATE: data, GIT_COMMITTER_DATE: data });
}

// '' = stdout pusty; inaczej tekst przypomnienia z dowolnego kanalu.
function przypomnienie(f, pola) {
  const r = spawnSync(process.execPath, [HOOK], {
    cwd: f.root,
    input: JSON.stringify({ hook_event_name: 'Stop', cwd: f.root, ...(pola || {}) }),
    encoding: 'utf8',
    env: f.env,
  });
  assert.equal(r.status, 0, 'hook konczy sie kodem 0');
  if (!r.stdout.trim()) return '';
  const j = JSON.parse(r.stdout);
  return j.systemMessage || (j.hookSpecificOutput && j.hookSpecificOutput.additionalContext) || '';
}

test('doc-sync-reminder: code commits since the last journal entry without a journal or state commit give one sentence', (t) => {
  const f = fikstura(t);
  commit(f, ['src/a.js'], '2026-11-03T10:00:00');
  assert.match(przypomnienie(f), /Od ostatniego wpisu dziennika \(2026-11-01\) jest 1 commitow/);

  // Kontrole - kazda na swiezej fiksturze - stdout pusty.
  const zDziennikiem = fikstura(t);
  commit(zDziennikiem, ['src/a.js'], '2026-11-03T10:00:00');
  commit(zDziennikiem, ['docs/DZIENNIK.md'], '2026-11-03T11:00:00');
  assert.equal(przypomnienie(zDziennikiem), '', 'commit dziennika');

  const zeStanem = fikstura(t);
  commit(zeStanem, ['src/a.js', 'docs/STATE.md'], '2026-11-03T10:00:00');
  assert.equal(przypomnienie(zeStanem), '', 'kod razem z docs/STATE.md');

  const readme = fikstura(t);
  commit(readme, ['README.md'], '2026-11-03T10:00:00');
  assert.equal(przypomnienie(readme), '', 'sam README.md');

  const stary = fikstura(t);
  commit(stary, ['src/a.js'], '2026-10-20T10:00:00');
  assert.equal(przypomnienie(stary), '', 'commit sprzed wpisu');

  const drzewo = fikstura(t);
  commit(drzewo, ['src/a.js'], '2026-11-03T10:00:00');
  fs.appendFileSync(path.join(drzewo.root, 'docs', 'DZIENNIK.md'), 'nowy akapit\n');
  assert.equal(przypomnienie(drzewo), '', 'dziennik zmieniony w drzewie');

  const aktywny = fikstura(t);
  commit(aktywny, ['src/a.js'], '2026-11-03T10:00:00');
  assert.equal(przypomnienie(aktywny, { stop_hook_active: true }), '', 'stop_hook_active');

  const bezGita = fikstura(t, { git: false });
  zapisz(bezGita, 'src/a.js', 'x\n');
  assert.equal(przypomnienie(bezGita), '', 'projekt bez gita');

  const bezDaty = fikstura(t, { dziennik: '# DZIENNIK\n\n### wpis bez daty\n\nAutor: x\n' });
  commit(bezDaty, ['src/a.js'], '2026-11-03T10:00:00');
  assert.equal(przypomnienie(bezDaty), '', 'naglowek bez daty');

  // Kontrola dotychczasowa: niezacommitowany kod w drzewie roboczym.
  const roboczy = fikstura(t);
  zapisz(roboczy, 'b.js', 'x\n');
  assert.match(przypomnienie(roboczy), /W drzewie roboczym/);
});

test('doc-sync-reminder: a commit on the day of the newest entry counts, in a descending journal the newest date wins', (t) => {
  const f = fikstura(t);
  commit(f, ['src/a.js'], '2026-11-01T08:00:00');
  assert.match(przypomnienie(f), /Od ostatniego wpisu dziennika \(2026-11-01\)/);

  const malejacy = fikstura(t, { dziennik: D_MALEJACY });
  commit(malejacy, ['src/a.js'], '2026-10-15T10:00:00');
  assert.equal(przypomnienie(malejacy), '', 'najnowsza data z dziennika malejacego');
});
