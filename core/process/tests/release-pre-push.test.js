'use strict';

// PIPELINE_WYDAN E3: bramka pre-push na tagi wydan, wydanie samego modu (--komponent), kontrola
// "pre-push" w raporcie, weryfikacja po publikacji (cache = tag) i podpowiedz gotowosci.
// Push idzie do lokalnego zdalnego repo (git init --bare w katalogu tymczasowym) przez prawdziwy
// hook zainstalowany instalatorem fixtury - nic nie wychodzi z maszyny.

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const { git, repo, pliki } = require('./release-fixture.js');
const { tagiWydan, dopiszDoDziennika } = require('../../tools/release-pre-push.js');

const NARZEDZIA = path.join(__dirname, '..', '..', 'tools');

// Srodowisko pushu: bez binarki aplikacji (plugin test na atrapie modu bylby czerwony) i bez
// obejscia z otoczenia sesji.
function srodowisko(dodatki = {}) {
  const env = Object.assign({}, process.env, dodatki);
  delete env.CLAUDE_CODE_EXECPATH;
  if (!('RELAI_RELEASE_OBEJSCIE' in dodatki)) delete env.RELAI_RELEASE_OBEJSCIE;
  return env;
}

function zBramka(t) {
  const f = repo(t, { narzedzia: true });
  const zdalne = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-remote-'));
  t.after(() => fs.rmSync(zdalne, { recursive: true, force: true }));
  git(zdalne, ['init', '-q', '--bare']);
  git(f.dir, ['remote', 'add', 'origin', zdalne]);
  const inst = spawnSync(process.execPath, ['core/tools/install-prepush.js'], { cwd: f.dir, encoding: 'utf8' });
  assert.equal(inst.status, 0, inst.stderr);
  const push = (ref, env = {}) => {
    const r = git(f.dir, ['push', 'origin', ref], { wolnoPorazke: true, env: srodowisko(env) });
    return { kod: r.status, err: r.stderr };
  };
  const naZdalnym = (ref) => git(zdalne, ['ls-remote', '.', ref]).trim() !== '';
  return Object.assign(f, { zdalne, push, naZdalnym });
}

const bezBeta = (f) => f.zapisz('README.md', f.czytaj('README.md').replace('| `beta` | b |\n', ''));
const zBeta = (f) => f.zapisz('README.md', f.czytaj('README.md').replace('| `alpha` | a |\n', '| `alpha` | a |\n| `beta` | b |\n'));

test('tagiWydan: tagi v* i relai-*-v*, usuniecie tagu i galaz bez kontroli', () => {
  const sha = 'a'.repeat(40);
  const zera = '0'.repeat(40);
  const wejscie = [
    'refs/heads/main ' + sha + ' refs/heads/main ' + zera,
    'refs/tags/v3.4.0 ' + sha + ' refs/tags/v3.4.0 ' + zera,
    'refs/tags/relai-panel-v0.21.3 ' + sha + ' refs/tags/relai-panel-v0.21.3 ' + zera,
    '(delete) ' + zera + ' refs/tags/v3.3.9 ' + sha,
    'refs/tags/notatka ' + sha + ' refs/tags/notatka ' + zera,
    'refs/tags/vnext ' + sha + ' refs/tags/vnext ' + zera,
  ].join('\n');
  assert.deepEqual(tagiWydan(wejscie), [
    { tag: 'v3.4.0', sha, komponent: null },
    { tag: 'relai-panel-v0.21.3', sha, komponent: 'relai-panel' },
  ]);
});

test('bramka: tag przy czerwieni odrzucony, po naprawie przyjety, galaz bez przebiegu skryptu', (t) => {
  const f = zBramka(t);
  // Galaz bez skryptu: release-check.js z drzewa roboczego podmieniony na wartownika, ktory zostawia
  // znacznik. Kontrola pozytywna wartownika: push tagu go uruchamia (znacznik jest, push odrzucony).
  const znacznik = path.join(f.dir, '..', path.basename(f.dir) + '-wartownik');
  t.after(() => fs.rmSync(znacznik, { force: true }));
  f.zapisz('docs/notatka.md', 'x\n');
  f.commit('docs: notatka');
  f.zapisz('core/tools/release-check.js', "require('fs').writeFileSync(" + JSON.stringify(znacznik) + ", 'byl'); process.exit(7);\n");
  const galaz = f.push('main');
  assert.equal(galaz.kod, 0, galaz.err);
  assert.equal(fs.existsSync(znacznik), false, 'push galezi uruchomil skrypt');
  assert.ok(f.naZdalnym('refs/heads/main'));
  git(f.dir, ['tag', 'v1.0.1']);
  const wartownik = f.push('v1.0.1');
  assert.notEqual(wartownik.kod, 0);
  assert.equal(fs.existsSync(znacznik), true, 'push tagu nie uruchomil skryptu');
  assert.match(wartownik.err, /nie da sie sprawdzic: release-check\.js kod 7/);
  git(f.dir, ['checkout', '--', 'core/tools/release-check.js']);
  git(f.dir, ['tag', '-d', 'v1.0.1']);

  bezBeta(f);
  f.commit('docs: bez beta');
  git(f.dir, ['tag', 'v1.0.1']);
  const czerwony = f.push('v1.0.1');
  assert.notEqual(czerwony.kod, 0);
  assert.match(czerwony.err, /push ZATRZYMANY - tag wydania ma czerwone kontrole/);
  assert.match(czerwony.err, /readme-hooki: tabela hookow ma 1 wierszy przy 2 hookach/);
  assert.equal(f.naZdalnym('refs/tags/v1.0.1'), false);

  zBeta(f);
  f.commit('docs: beta wraca');
  git(f.dir, ['tag', '-f', 'v1.0.1']);
  const zielony = f.push('v1.0.1');
  assert.equal(zielony.kod, 0, zielony.err);
  assert.match(zielony.err, /tag v1\.0\.1 gotowy/);
  assert.ok(f.naZdalnym('refs/tags/v1.0.1'));
});

test('obejscie: pusty powod nie obchodzi, powod przepuszcza i zostawia linie w dzienniku', (t) => {
  const f = zBramka(t);
  bezBeta(f);
  f.commit('docs: bez beta');
  git(f.dir, ['tag', 'v1.0.1']);
  const przed = f.czytaj('docs/DZIENNIK.md');
  const pusty = f.push('v1.0.1', { RELAI_RELEASE_OBEJSCIE: '   ' });
  assert.notEqual(pusty.kod, 0);
  assert.equal(f.czytaj('docs/DZIENNIK.md'), przed, 'pusty powod zmienil dziennik');
  assert.equal(f.naZdalnym('refs/tags/v1.0.1'), false);

  const zPowodem = f.push('v1.0.1', { RELAI_RELEASE_OBEJSCIE: 'test:  falszywa\nczerwien' });
  assert.equal(zPowodem.kod, 0, zPowodem.err);
  assert.match(zPowodem.err, /OBEJSCIE bramki z powodem/);
  assert.ok(f.naZdalnym('refs/tags/v1.0.1'));
  const po = f.czytaj('docs/DZIENNIK.md');
  assert.match(po, /\n### 2026-10-01 — start\n\nTresc\.\n\n### \d{4}-\d{2}-\d{2} — Obejście bramki pre-push: tag `v1\.0\.1`\n\n- Czerwone: readme-hooki\.\n- Powód: test: falszywa czerwien\n\nAutor: hook pre-push \(RELAI_RELEASE_OBEJSCIE\)\n$/);
  // Dowod negatywny: wszystko sprzed obejscia stoi nietkniete, doszla tylko linia.
  assert.ok(po.startsWith(przed.replace(/\n$/, '')));
});

test('dziennik: wpis obejscia przed nastepna sekcja "## ", konce linii reszty pliku nietkniete', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-dziennik-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'docs'));
  const plik = path.join(dir, 'docs', 'DZIENNIK.md');
  // Mieszane konce linii: CRLF w naglowkach, LF w tresci wpisu; sekcja po "Wpisach".
  const przed = '# D\r\n\r\n## Wpisy\r\n\r\n### stary\n\nTresc.\n\n## Archiwum\r\n\r\nx\r\n';
  fs.writeFileSync(plik, przed);
  assert.equal(dopiszDoDziennika(dir, ['### nowy', '', '- a']), true);
  assert.equal(fs.readFileSync(plik, 'utf8'), '# D\r\n\r\n## Wpisy\r\n\r\n### stary\n\nTresc.\n\r\n### nowy\r\n\r\n- a\r\n\n## Archiwum\r\n\r\nx\r\n');
  fs.writeFileSync(plik, '# D\n\n## Inne\n');
  assert.equal(dopiszDoDziennika(dir, ['### nowy']), false);
  assert.equal(fs.readFileSync(plik, 'utf8'), '# D\n\n## Inne\n');
});

test('wydanie samego modu: czerwony film nie blokuje tagu modu, czerwone README modu - blokuje', (t) => {
  const f = zBramka(t);
  const F = 'docs/zasoby/film/zrodla/src/komendy.ts';
  f.zapisz(F, f.czytaj(F).replace("  'relai-e',\n", ''));
  f.zapisz('panel/hooks/nowy.ts', 'export {}\n');
  f.zapisz('panel/.claude-plugin/plugin.json', '{\n  "name": "relai-panel",\n  "version": "0.1.1"\n}\n');
  f.zapisz('README.md', f.czytaj('README.md').replace('`relai-panel` (0.1.0)', '`relai-panel` (0.1.1)'));
  // Rdzen tez ma zmiane bez podbicia: "podbicie" tagu modu liczy tylko numer modu.
  f.zapisz('core/tools/validate-adapters.js', f.czytaj('core/tools/validate-adapters.js') + '// zmiana\n');
  f.commit('fix(panel): nowy plik');

  const raport = JSON.parse(spawnSync(process.execPath, ['core/tools/release-check.js', '--rev', 'HEAD', '--wydanie', '--komponent', 'relai-panel', '--json'],
    { cwd: f.dir, encoding: 'utf8', env: srodowisko() }).stdout);
  assert.deepEqual(raport.komponent.wiersze, ['mod-panel']);
  assert.ok(raport.pominiete.includes('film-komendy: poza komponentem relai-panel'), raport.pominiete.join(' | '));
  assert.deepEqual(raport.kontrole.map((k) => k.id).sort(), ['diff', 'mapa', 'podbicie', 'readme-mody', 'strona-fakty', 'walidator']);

  git(f.dir, ['tag', 'relai-panel-v0.1.1']);
  const mod = f.push('relai-panel-v0.1.1');
  assert.equal(mod.kod, 0, mod.err);
  assert.match(mod.err, /komponent relai-panel/);
  // Kontrola pozytywna: ten sam commit jako wydanie rdzenia czerwienieje od filmu.
  git(f.dir, ['tag', 'v1.0.1']);
  const rdzen = f.push('v1.0.1');
  assert.notEqual(rdzen.kod, 0);
  assert.match(rdzen.err, /film-komendy: film nie pokazuje komend: relai-e/);

  f.zapisz('README.md', f.czytaj('README.md').replace('`relai-panel` (0.1.1)', '`relai-panel` (0.1.0)'));
  f.commit('docs: stary numer panelu');
  git(f.dir, ['tag', 'relai-panel-v0.1.2']);
  const czerwonyMod = f.push('relai-panel-v0.1.2');
  assert.notEqual(czerwonyMod.kod, 0);
  assert.match(czerwonyMod.err, /readme-mody: wiersz modu relai-panel ma 0\.1\.0, a plugin\.json 0\.1\.1/);
  assert.doesNotMatch(czerwonyMod.err, /film-komendy/);
});

test('--komponent: nieznany mod to kod 2, "relai" to pelny zestaw', (t) => {
  const f = repo(t);
  const r = f.uruchom(['--komponent', 'relai-brak']);
  assert.equal(r.kod, 2);
  assert.match(r.json.blad, /nieznany komponent relai-brak/);
  const pelny = f.uruchom(['--komponent', 'relai']);
  assert.equal(pelny.json.komponent, null);
  assert.ok(pelny.k('film-komendy'));
});

function sumaHookow(dir) {
  const h = crypto.createHash('sha256');
  for (const n of ['pre-push', 'relai-pre-push.cjs']) h.update(n + '\0' + fs.readFileSync(path.join(dir, '.git', 'hooks', n)));
  return h.digest('hex');
}

test('kontrola pre-push: brak = ostrzezenie (czerwien z --wydanie), po instalacji zielona, zmiana kopii czerwona; --rev pomija', (t) => {
  const f = repo(t, { narzedzia: true });
  const brak = f.uruchom(['--tylko', 'pre-push']);
  assert.deepEqual(brak.k('pre-push').bledy, []);
  assert.match(brak.k('pre-push').ostrzezenia.join('\n'), /brak \.git\/hooks\/pre-push - instalacja: node core\/tools\/install-prepush\.js/);
  assert.match(f.uruchom(['--tylko', 'pre-push', '--wydanie']).k('pre-push').bledy.join('\n'), /brak \.git\/hooks\/relai-pre-push\.cjs/);

  const inst = () => spawnSync(process.execPath, ['core/tools/install-prepush.js'], { cwd: f.dir, encoding: 'utf8' });
  assert.equal(inst().status, 0);
  const zielona = f.uruchom(['--tylko', 'pre-push', '--wydanie']);
  assert.deepEqual(zielona.k('pre-push').bledy, []);
  assert.deepEqual(zielona.k('pre-push').ostrzezenia, []);
  assert.equal(zielona.kod, 0);

  const przed = sumaHookow(f.dir);
  const drugi = inst();
  assert.equal(drugi.status, 0);
  assert.match(drugi.stdout, /pre-push aktualny .* - bez zmian/);
  assert.equal(sumaHookow(f.dir), przed);

  fs.appendFileSync(path.join(f.dir, '.git', 'hooks', 'relai-pre-push.cjs'), '// zmiana\n');
  const czerwona = f.uruchom(['--tylko', 'pre-push', '--wydanie']);
  assert.match(czerwona.k('pre-push').bledy.join('\n'), /kopia hooka [0-9a-f]{12} inna niz zrodlo [0-9a-f]{12}/);
  assert.equal(czerwona.kod, 1);
  // Kopia z CRLF to ta sama tresc (suma po CRLF -> LF).
  const zrodlo = fs.readFileSync(path.join(NARZEDZIA, 'release-pre-push.js'), 'utf8');
  fs.writeFileSync(path.join(f.dir, '.git', 'hooks', 'relai-pre-push.cjs'), zrodlo.replace(/\r?\n/g, '\r\n'));
  assert.deepEqual(f.uruchom(['--tylko', 'pre-push', '--wydanie']).k('pre-push').bledy, []);

  // Rewizja po tagu: HEAD fixtury to sam v1.0.0, a wydanie bez poprzedniego tagu nie ma bazy.
  f.zapisz('docs/notatka.md', 'x\n');
  f.commit('docs: notatka');
  const rev = f.uruchom(['--rev', 'HEAD', '--tylko', 'pre-push']);
  assert.equal(rev.k('pre-push'), undefined);
  assert.ok(rev.json.pominiete.includes('pre-push: --rev (hook to stan maszyny, nie rewizji)'));
});

test('instalator nie nadpisuje cudzego pre-push, kladzie logike obok', (t) => {
  const f = repo(t, { narzedzia: true });
  const cudzy = '#!/bin/sh\necho cudzy hook\n';
  f.zapisz('.git/hooks/pre-push', cudzy);
  const r = spawnSync(process.execPath, ['core/tools/install-prepush.js'], { cwd: f.dir, encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /cudzy hook pre-push\. Nie nadpisuje go/);
  assert.equal(f.czytaj('.git/hooks/pre-push'), cudzy);
  assert.ok(fs.existsSync(path.join(f.dir, '.git', 'hooks', 'relai-pre-push.cjs')));
  assert.match(f.uruchom(['--tylko', 'pre-push', '--wydanie']).k('pre-push').bledy.join('\n'), /nie wola relai-pre-push\.cjs \(cudzy hook\)/);
});

// --- weryfikacja po publikacji ---------------------------------------------------------------

function cache(t, f, katalog) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-cache-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const [rel, tresc] of Object.entries(pliki())) {
    if (katalog && !rel.startsWith(katalog + '/')) continue;
    const cel = path.join(dir, katalog ? rel.slice(katalog.length + 1) : rel);
    fs.mkdirSync(path.dirname(cel), { recursive: true });
    fs.writeFileSync(cel, tresc);
  }
  fs.mkdirSync(path.join(dir, '.in_use'));
  fs.writeFileSync(path.join(dir, '.in_use', '12345'), '');
  return dir;
}

const weryfikuj = (f, args) => {
  const r = spawnSync(process.execPath, [path.join(NARZEDZIA, 'release-verify.js'), '--repo', f.dir, '--json'].concat(args), { encoding: 'utf8' });
  return Object.assign(JSON.parse(r.stdout), { status: r.status });
};

test('release-verify: cache rowny tagowi (takze CRLF), rozjazd, brak i nadmiar nazwane', (t) => {
  const f = repo(t);
  const dir = cache(t, f);
  const args = ['--plugin', 'relai', '--wersja', '1.0.0', '--cache', dir];
  const zgodny = weryfikuj(f, args);
  assert.equal(zgodny.status, 0);
  assert.equal(zgodny.plikowTagu, Object.keys(pliki()).length);
  assert.equal(zgodny.plikowCache, zgodny.plikowTagu);
  fs.writeFileSync(path.join(dir, 'README.md'), fs.readFileSync(path.join(dir, 'README.md'), 'utf8').replace(/\n/g, '\r\n'));
  assert.equal(weryfikuj(f, args).status, 0, 'CRLF policzony jako rozjazd');

  fs.appendFileSync(path.join(dir, 'adapters', 'claude-code', 'hooks', 'alpha.js'), '// podlozone\n');
  fs.rmSync(path.join(dir, 'LICENSE'), { force: true });
  fs.rmSync(path.join(dir, 'docs', 'ARTEFAKTY.md'));
  fs.writeFileSync(path.join(dir, 'nadmiar.txt'), 'x');
  const rozjazd = weryfikuj(f, args);
  assert.equal(rozjazd.status, 1);
  assert.deepEqual(rozjazd.rozjazdy, ['adapters/claude-code/hooks/alpha.js']);
  assert.deepEqual(rozjazd.brakujace, ['docs/ARTEFAKTY.md']);
  assert.deepEqual(rozjazd.nadmiarowe, ['nadmiar.txt']);
});

test('release-verify: mod porownany z podkatalogiem tagu; brak cache to kod 2', (t) => {
  const f = repo(t);
  const dir = cache(t, f, 'panel');
  const r = weryfikuj(f, ['--plugin', 'relai-panel', '--wersja', '0.1.0', '--cache', dir]);
  assert.equal(r.status, 0);
  assert.equal(r.katalog, 'panel');
  assert.equal(r.plikowTagu, 2);
  const brak = weryfikuj(f, ['--plugin', 'relai-panel', '--wersja', '0.1.0', '--cache', path.join(dir, 'nie-ma')]);
  assert.equal(brak.status, 2);
  assert.match(brak.blad, /brak katalogu cache/);
});

// --- podpowiedz -------------------------------------------------------------------------------

const podpowiedz = (f) => spawnSync(process.execPath, [path.join(NARZEDZIA, 'release-hint.js'), '--repo', f.dir], { encoding: 'utf8' });

test('podpowiedz: zmiana tylko w docs/ - cisza; zmiana w rdzeniu - jedno zdanie z liczba plikow', (t) => {
  const f = repo(t);
  f.zapisz('docs/notatka.md', 'x\n');
  f.commit('feat(docs): notatka');
  const cisza = podpowiedz(f);
  assert.equal(cisza.status, 0);
  assert.equal(cisza.stdout, '');
  f.zapisz('core/tools/validate-adapters.js', f.czytaj('core/tools/validate-adapters.js') + '// zmiana\n');
  f.commit('fix(tools): zmiana');
  assert.equal(podpowiedz(f).stdout, 'od v1.0.0: 1 plikow w relai; sprawdzic gotowosc? (/relai-release)\n');
});
