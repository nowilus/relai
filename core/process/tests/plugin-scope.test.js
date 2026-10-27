'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const zp = require('../plugin-scope.js');

// Plan ZASIEG_PLUGINU, E1: narzedzie relai-scope na falszywym HOME i falszywym CLI.
// Falszywe CLI pisze do pliku zakresu jak prawdziwe `claude plugin enable|disable`
// (user: <FAKE_HOME>/.claude/settings.json, local: <cwd>/.claude/settings.local.json)
// i umie pasc po N wywolaniach pluginu (FAKE_FAIL_AFTER), zeby sprawdzic przerwane apply.

const TOOL = path.join(__dirname, '..', '..', 'tools', 'relai-scope.js');
const USTAWIENIA = '# USTAWIENIA\n\nWersja RelAI: 3.5.0 · zainicjowano: 2026-10-27\n';
const ZESTAW = zp.ZESTAW;

const FAKE_CLI = [
  "'use strict';",
  "const fs = require('fs');",
  "const path = require('path');",
  "const a = process.argv.slice(2);",
  "if (a[0] === '--version') { console.log('9.9.9 (fake)'); process.exit(0); }",
  "const home = process.env.FAKE_HOME;",
  "const licznik = path.join(home, 'fake-cli-calls.txt');",
  "const n = (fs.existsSync(licznik) ? Number(fs.readFileSync(licznik, 'utf8')) : 0) + 1;",
  "fs.writeFileSync(licznik, String(n));",
  "fs.appendFileSync(path.join(home, 'fake-cli-log.txt'), a.join(' ') + ' @ ' + process.cwd() + String.fromCharCode(10));",
  "if (process.env.FAKE_FAIL_AFTER && n > Number(process.env.FAKE_FAIL_AFTER)) { console.error('fake failure'); process.exit(3); }",
  "const [cmd, akcja, id, flaga, zakres] = a;",
  "if (cmd !== 'plugin' || flaga !== '--scope') { console.error('bad args'); process.exit(2); }",
  "const plik = zakres === 'user' ? path.join(home, '.claude', 'settings.json') : path.join(process.cwd(), '.claude', 'settings.local.json');",
  "let d = {};",
  "try { d = JSON.parse(fs.readFileSync(plik, 'utf8')); } catch (_) {}",
  "d.enabledPlugins = d.enabledPlugins || {};",
  "d.enabledPlugins[id] = akcja === 'enable';",
  "fs.mkdirSync(path.dirname(plik), { recursive: true });",
  "fs.writeFileSync(plik, JSON.stringify(d, null, 2) + String.fromCharCode(10));",
].join('\n');

function zapiszJson(plik, dane) {
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, JSON.stringify(dane, null, 2) + '\n');
}

// Falszywa maszyna: HOME z historia sesji, instalacja i ustawieniami; projekty w baza/p.
function maszyna({ zainstalowane = ZESTAW, uzytkownik } = {}) {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-zasieg-e1-'));
  const home = path.join(baza, 'home');
  const cli = path.join(baza, 'fake-claude.js');
  fs.mkdirSync(path.join(home, '.claude', 'projects'), { recursive: true });
  fs.writeFileSync(cli, FAKE_CLI);
  const plugins = {};
  for (const id of zainstalowane) plugins[id] = [{ scope: 'user', installPath: path.join(home, 'cache', id) }];
  plugins['relai-mods@relai'] = [{ scope: 'user', installPath: path.join(home, 'cache', 'mods') }];
  zapiszJson(path.join(home, '.claude', 'plugins', 'installed_plugins.json'), { version: 2, plugins });
  const ep = uzytkownik || Object.fromEntries(ZESTAW.concat('relai-mods@relai', 'inny@x').map((id) => [id, true]));
  zapiszJson(path.join(home, '.claude', 'settings.json'), { theme: 'dark', enabledPlugins: ep });
  let sesje = 0;
  const m = {
    baza, home, cli,
    projekt(nazwa, { marker = true, git = true, gosc = false, lokalne, worktree } = {}) {
      const root = path.join(baza, 'p', nazwa);
      fs.mkdirSync(root, { recursive: true });
      if (marker) { fs.mkdirSync(path.join(root, 'docs'), { recursive: true }); fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'), USTAWIENIA); }
      if (git) fs.mkdirSync(path.join(root, '.git'));
      if (gosc) zapiszJson(path.join(root, '.claude', 'relai.json'), { mode: 'guest' });
      if (lokalne) zapiszJson(path.join(root, '.claude', 'settings.local.json'), { permissions: { allow: ['Bash(ls)'] }, enabledPlugins: lokalne });
      if (worktree !== undefined) fs.writeFileSync(path.join(root, '.worktreeinclude'), worktree);
      m.sesja(root);
      return root;
    },
    sesja(cwd) {
      const dir = path.join(home, '.claude', 'projects', 'proj-' + (++sesje));
      fs.mkdirSync(dir, { recursive: true });
      const linie = [{ type: 'queue-operation', content: 'x' }, { type: 'user', cwd, message: 'hej' }];
      fs.writeFileSync(path.join(dir, 's1.jsonl'), linie.map((l) => JSON.stringify(l)).join('\n') + '\n');
    },
    env(extra) { return { ...process.env, FAKE_HOME: home, ...extra }; },
    uruchom(extra) {
      return (argv, cwd) => {
        const r = spawnSync(process.execPath, argv, { cwd, encoding: 'utf8', env: m.env(extra) });
        return { status: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error };
      };
    },
    narzedzie(args, extra) {
      return spawnSync(process.execPath, [TOOL, ...args, '--home', home, '--cli', cli], { encoding: 'utf8', env: m.env(extra), cwd: baza });
    },
    uzytkownik() { return JSON.parse(fs.readFileSync(path.join(home, '.claude', 'settings.json'), 'utf8')).enabledPlugins; },
    sprzataj() { fs.rmSync(baza, { recursive: true, force: true }); },
  };
  return m;
}

const lokalnyPlik = (root) => path.join(root, '.claude', 'settings.local.json');
const czytaj = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);

// Suma wszystkich plikow drzewa (sciezka + tresc), do dowodu "nic nie zapisano".
function sumaDrzewa(dir) {
  const h = crypto.createHash('sha256');
  const idz = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) idz(p);
      else { h.update(path.relative(dir, p)); h.update(fs.readFileSync(p)); }
    }
  };
  idz(dir);
  return h.digest('hex');
}

test('odkrywanie: cwd z historii i z argumentow, bez duplikatow, folder domowy i nieistniejace osobno', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A');
    m.sesja(a); // drugi wpis tego samego folderu
    if (process.platform === 'win32') m.sesja(a.toUpperCase());
    m.sesja(m.home);
    m.sesja(path.join(m.baza, 'p', 'skasowany'));
    const dodatkowy = path.join(m.baza, 'p', 'Z-argumentu');
    fs.mkdirSync(dodatkowy, { recursive: true });
    const w = zp.odkryjFoldery(m.home, [dodatkowy]);
    assert.deepEqual(w.foldery, [a, dodatkowy]);
    assert.deepEqual(w.brak, [path.join(m.baza, 'p', 'skasowany')]);
    assert.equal(w.pominietyDom, true);
  } finally { m.sprzataj(); }
});

test('odkrywanie: cwd dalej niz w pierwszej linii pliku i ucieczki JSON w sciezce', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A b', { marker: false });
    const dir = path.join(m.home, '.claude', 'projects', 'dlugi');
    fs.mkdirSync(dir);
    const smiec = JSON.stringify({ type: 'x', tekst: 'y'.repeat(9000) });
    fs.writeFileSync(path.join(dir, 'a.jsonl'), smiec + '\n' + JSON.stringify({ cwd: a }) + '\n');
    const w = zp.odkryjFoldery(m.home, []);
    assert.ok(w.foldery.includes(a));
  } finally { m.sprzataj(); }
});

test('klasyfikacja: zaadoptowany, gosc, inny; git; wartosci lokalne zestawu', () => {
  const m = maszyna();
  try {
    const k1 = zp.klasyfikuj(m.projekt('A', { lokalne: { 'relai@relai': false, 'obcy@x': true } }));
    assert.equal(k1.rodzaj, 'zaadoptowany');
    assert.equal(k1.maGit, true);
    assert.deepEqual(k1.lokalne, { 'relai@relai': false });
    assert.equal(zp.klasyfikuj(m.projekt('G', { gosc: true })).rodzaj, 'gosc');
    const k3 = zp.klasyfikuj(m.projekt('I', { marker: false, git: false }));
    assert.equal(k3.rodzaj, 'inny');
    assert.equal(k3.maGit, false);
  } finally { m.sprzataj(); }
});

test('plan: wszystkie lokalne kroki przed globalnymi; gosc i inny bez krokow', () => {
  const m = maszyna();
  try {
    const foldery = [m.projekt('A'), m.projekt('G', { gosc: true }), m.projekt('I', { marker: false }), m.projekt('B')].map(zp.klasyfikuj);
    const { kroki } = zp.planZmian({ foldery, zainstalowane: ZESTAW, uzytkownik: m.uzytkownik() });
    const pierwszyUser = kroki.findIndex((k) => k.zakres === 'user');
    assert.ok(pierwszyUser > 0);
    assert.ok(kroki.slice(pierwszyUser).every((k) => k.zakres === 'user'));
    assert.equal(kroki.filter((k) => k.zakres === 'user').length, 4);
    assert.ok(kroki.every((k) => k.zakres === 'user' || /[\\/]p[\\/](A|B)$/.test(k.folder)));
    assert.equal(kroki.filter((k) => k.typ === 'worktreeinclude').length, 2);
    assert.ok(!kroki.some((k) => k.id === 'relai-mods@relai'));
  } finally { m.sprzataj(); }
});

test('plan: lokalne false pominiete z powodem, bez gita bez .worktreeinclude, niezainstalowany pominiety', () => {
  const m = maszyna({ zainstalowane: ['relai@relai', 'relai-panel@relai'] });
  try {
    const a = m.projekt('A', { git: false, lokalne: { 'relai@relai': false } });
    const { kroki, pominiete } = zp.planZmian({ foldery: [zp.klasyfikuj(a)], zainstalowane: zp.zainstalowaneZestawu(m.home), uzytkownik: m.uzytkownik() });
    assert.deepEqual(kroki.map((k) => [k.zakres, k.id]), [['local', 'relai-panel@relai'], ['user', 'relai@relai'], ['user', 'relai-panel@relai']]);
    assert.ok(pominiete.some((p) => p.folder === a && p.id === 'relai@relai' && /false/.test(p.powod)));
    assert.ok(pominiete.some((p) => p.id === 'relai-progress@relai' && p.powod === 'niezainstalowany'));
    assert.ok(!kroki.some((k) => k.typ === 'worktreeinclude'));
  } finally { m.sprzataj(); }
});

test('plan: worktree (.git jako plik) dostaje lokalne enable, ale bez .worktreeinclude; repo glowne z nim', () => {
  const m = maszyna();
  try {
    const repo = m.projekt('Repo');
    const wt = m.projekt('Wt', { git: false });
    fs.writeFileSync(path.join(wt, '.git'), 'gitdir: ' + path.join(repo, '.git', 'worktrees', 'wt') + '\n');
    const k = zp.klasyfikuj(wt);
    assert.equal(k.maGit, true);
    assert.equal(k.jestWorktree, true);
    const { kroki } = zp.planZmian({ foldery: [repo, wt].map(zp.klasyfikuj), zainstalowane: ZESTAW, uzytkownik: m.uzytkownik() });
    assert.equal(kroki.filter((s) => s.folder === wt && s.typ === 'plugin').length, 4);
    assert.ok(!kroki.some((s) => s.folder === wt && s.typ === 'worktreeinclude'));
    assert.ok(kroki.some((s) => s.folder === repo && s.typ === 'worktreeinclude'));
  } finally { m.sprzataj(); }
});

test('status nic nie zapisuje: suma HOME i projektow ta sama przed i po; folder domowy wymieniony', () => {
  const m = maszyna();
  try {
    m.projekt('A'); m.projekt('B', { worktree: 'node_modules\n' }); m.sesja(m.home);
    const przed = sumaDrzewa(m.baza);
    const r = m.narzedzie(['status']);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(sumaDrzewa(m.baza), przed);
    assert.match(r.stdout, /Projekty z markerem RelAI: 2/);
    assert.match(r.stdout, /Folder domowy pominiety/);
    assert.match(r.stdout, /\(nowy plik\)/);
    assert.match(r.stdout, /\(dopisanie linii\)/);
    assert.equal(czytaj(path.join(m.home, 'fake-cli-calls.txt')), null);
  } finally { m.sprzataj(); }
});

test('apply, potem undo: oba poziomy wracaja do stanu sprzed apply', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A', { lokalne: { 'obcy@x': true }, worktree: 'node_modules' });
    const b = m.projekt('B');
    const c = m.projekt('C', { git: false });
    const userPrzed = czytaj(path.join(m.home, '.claude', 'settings.json'));
    const lokalnyA = czytaj(lokalnyPlik(a));
    const r = m.narzedzie(['apply']);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.deepEqual(m.uzytkownik(), { 'relai@relai': false, 'relai-panel@relai': false, 'relai-progress@relai': false, 'relai-cache-keeper@relai': false, 'relai-mods@relai': true, 'inny@x': true });
    for (const p of [a, b, c]) for (const id of ZESTAW) assert.equal(zp.wartosciZestawu(lokalnyPlik(p))[id], true, p + ' ' + id);
    assert.equal(czytaj(path.join(a, '.worktreeinclude')), 'node_modules\n.claude/settings.local.json\n');
    assert.equal(czytaj(path.join(b, '.worktreeinclude')), '.claude/settings.local.json\n');
    assert.equal(fs.existsSync(path.join(c, '.worktreeinclude')), false);

    const u = m.narzedzie(['undo']);
    assert.equal(u.status, 0, u.stderr + u.stdout);
    assert.deepEqual(JSON.parse(czytaj(path.join(m.home, '.claude', 'settings.json'))), JSON.parse(userPrzed));
    assert.deepEqual(JSON.parse(czytaj(lokalnyPlik(a))), JSON.parse(lokalnyA));
    assert.equal(fs.existsSync(lokalnyPlik(b)), false, 'plik lokalny utworzony przez apply znika');
    assert.equal(fs.existsSync(lokalnyPlik(c)), false);
    assert.equal(czytaj(path.join(a, '.worktreeinclude')), 'node_modules\n');
    assert.equal(fs.existsSync(path.join(b, '.worktreeinclude')), false);
  } finally { m.sprzataj(); }
});

test('przerwane apply (CLI pada w polowie): globalnie nic nie wylaczone, undo przywraca lokalne', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A');
    const b = m.projekt('B');
    const foldery = [a, b].map(zp.klasyfikuj);
    const { kroki } = zp.planZmian({ foldery, zainstalowane: ZESTAW, uzytkownik: m.uzytkownik() });
    const w = zp.wykonajPlan(kroki, { uruchom: m.uruchom({ FAKE_FAIL_AFTER: '5' }), cli: m.cli, home: m.home, teraz: 't' });
    assert.equal(w.ok, false);
    assert.match(w.blad, /fake failure/);
    for (const id of ZESTAW) assert.equal(m.uzytkownik()[id], true, 'globalnie ' + id + ' nadal true');
    assert.ok(w.reczne.length > 0);
    const c = zp.cofnij({ uruchom: m.uruchom(), cli: m.cli, home: m.home });
    assert.equal(c.ok, true, c.blad);
    assert.equal(fs.existsSync(lokalnyPlik(a)), false);
    assert.equal(fs.existsSync(lokalnyPlik(b)), false);
    assert.equal(fs.existsSync(path.join(a, '.worktreeinclude')), false);
    for (const id of ZESTAW) assert.equal(m.uzytkownik()[id], true);
  } finally { m.sprzataj(); }
});

test('undo jest idempotentne: drugie nic nie zmienia i nie wola CLI', () => {
  const m = maszyna();
  try {
    m.projekt('A');
    assert.equal(m.narzedzie(['apply']).status, 0);
    assert.equal(m.narzedzie(['undo']).status, 0);
    const przed = sumaDrzewa(m.baza);
    const r = m.narzedzie(['undo']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /nic do cofniecia/);
    // licznik CLI i log nie rosna — suma calego drzewa ta sama
    assert.equal(sumaDrzewa(m.baza), przed);
  } finally { m.sprzataj(); }
});

test('nieczytelny dziennik: apply odmawia przed pierwszym zapisem i nie nadpisuje dziennika', () => {
  const m = maszyna();
  try {
    m.projekt('A');
    const plik = zp.plikDziennika(m.home);
    fs.mkdirSync(path.dirname(plik), { recursive: true });
    fs.writeFileSync(plik, '{"kroki": [ {"typ": "plugin"');
    const przed = sumaDrzewa(m.baza);
    const r = m.narzedzie(['apply']);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /nieczytelny/);
    assert.equal(sumaDrzewa(m.baza), przed);
  } finally { m.sprzataj(); }
});

test('undo bez dziennika: nic nie zmienia, wypisuje polecenia reczne', () => {
  const m = maszyna();
  try {
    m.projekt('A');
    const przed = sumaDrzewa(m.baza);
    const r = m.narzedzie(['undo']);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /Brak dziennika/);
    assert.match(r.stdout, /plugin enable relai@relai --scope user/);
    assert.equal(sumaDrzewa(m.baza), przed);
  } finally { m.sprzataj(); }
});

test('brak CLI: apply konczy sie przed pierwszym zapisem z lista polecen recznych', () => {
  const m = maszyna();
  try {
    m.projekt('A');
    const przed = sumaDrzewa(m.baza);
    const r = spawnSync(process.execPath, [TOOL, 'apply', '--home', m.home, '--cli', path.join(m.baza, 'nie-ma-claude')], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Nie znaleziono polecenia claude/);
    assert.match(r.stderr, /plugin disable relai@relai --scope user/);
    assert.equal(sumaDrzewa(m.baza), przed);
  } finally { m.sprzataj(); }
});

test('apply nie nadpisuje lokalnego false i nie wlacza goscia ani folderu bez markera', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A', { lokalne: { 'relai@relai': false } });
    const g = m.projekt('G', { gosc: true });
    const i = m.projekt('I', { marker: false });
    assert.equal(m.narzedzie(['apply']).status, 0);
    assert.equal(zp.wartosciZestawu(lokalnyPlik(a))['relai@relai'], false);
    assert.equal(zp.wartosciZestawu(lokalnyPlik(a))['relai-panel@relai'], true);
    assert.equal(fs.existsSync(lokalnyPlik(g)), false);
    assert.equal(fs.existsSync(lokalnyPlik(i)), false);
  } finally { m.sprzataj(); }
});

test('on/off: jeden projekt, poziom uzytkownika nietkniety; folder domowy i nieistniejacy odrzucone', () => {
  const m = maszyna();
  try {
    const a = m.projekt('A', { marker: false });
    const userPrzed = czytaj(path.join(m.home, '.claude', 'settings.json'));
    assert.equal(m.narzedzie(['on', a]).status, 0);
    for (const id of ZESTAW) assert.equal(zp.wartosciZestawu(lokalnyPlik(a))[id], true);
    assert.equal(czytaj(path.join(a, '.worktreeinclude')), '.claude/settings.local.json\n');
    assert.equal(m.narzedzie(['off', a]).status, 0);
    for (const id of ZESTAW) assert.equal(zp.wartosciZestawu(lokalnyPlik(a))[id], false);
    assert.equal(czytaj(path.join(m.home, '.claude', 'settings.json')), userPrzed);
    assert.equal(fs.existsSync(zp.plikDziennika(m.home)), false, 'on/off nie pisze dziennika apply');

    const przed = sumaDrzewa(m.baza);
    const dom = m.narzedzie(['on', m.home]);
    assert.equal(dom.status, 1);
    assert.match(dom.stderr, /Folder domowy pominiety/);
    const brak = m.narzedzie(['on', path.join(m.baza, 'nie-ma')]);
    assert.equal(brak.status, 1);
    assert.match(brak.stderr, /Folder nie istnieje/);
    assert.equal(sumaDrzewa(m.baza), przed);
  } finally { m.sprzataj(); }
});

test('usunKlucz: kasuje jeden klucz, reszta pliku i konce linii zostaja', () => {
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-zasieg-e1-'));
  try {
    const plik = path.join(baza, 's.json');
    const tekst = '{\r\n    "a": 1,\r\n    "enabledPlugins": {\r\n        "relai@relai": false,\r\n        "x@y": true\r\n    }\r\n}\r\n';
    fs.writeFileSync(plik, tekst);
    assert.deepEqual(zp.usunKlucz(plik, 'relai@relai', false), { zmiana: true });
    assert.equal(fs.readFileSync(plik, 'utf8'), '{\r\n    "a": 1,\r\n    "enabledPlugins": {\r\n        "x@y": true\r\n    }\r\n}\r\n');
    assert.deepEqual(zp.usunKlucz(plik, 'relai@relai', false), { zmiana: false });
    assert.deepEqual(zp.usunKlucz(path.join(baza, 'nie-ma.json'), 'relai@relai', false), { zmiana: false });
  } finally { fs.rmSync(baza, { recursive: true, force: true }); }
});

test('plan cofniecia: brak klucza = usuniecie, nie disable; globalne przed lokalnymi', () => {
  const plan = zp.planCofniecia({ kroki: [
    { typ: 'plugin', zakres: 'local', folder: '/p/A', id: 'relai@relai', poprzednia: null, plikIstnial: false },
    { typ: 'plugin', zakres: 'local', folder: '/p/A', id: 'relai-panel@relai', poprzednia: false, plikIstnial: true },
    { typ: 'worktreeinclude', folder: '/p/A', dopisano: true, plikPowstal: true },
    { typ: 'plugin', zakres: 'user', id: 'relai@relai', poprzednia: true },
    { typ: 'plugin', zakres: 'user', id: 'relai-panel@relai', poprzednia: true, cofniety: true },
  ] });
  assert.deepEqual(plan.map((c) => [c.akcja, c.zakres || '-', c.indeks]), [
    ['enable', 'user', 3], ['usunLinie', '-', 2], ['disable', 'local', 1], ['usunKlucz', 'local', 0],
  ]);
});
