'use strict';

// release-check.js (PIPELINE_WYDAN E1): raport gotowosci do wydania. Fixtura to male repozytorium
// git w katalogu tymczasowym, z ukladem sciezek jak w RelAI i tagiem v1.0.0 — kazda kontrola ma
// przypadek zielony i czerwony na podlozonym defekcie (ryzyko PW1: instrument falszywie cichy).
// Mapa wplywu jest prawdziwa (core/tools/release-map.json), wiec fixtura sprawdza tez ja (PW2).

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { SKRYPT, git, repo } = require('./release-fixture.js');
const kontrole = require('../../tools/release-checks.js');

const WSZYSTKIE = 'walidator,generator-codex,sync-panel-core,readme-komendy,readme-hooki,readme-mody,historia,artefakty,'
  + 'strona-komendy,strona-fakty,strona-film,film-komendy,film-rekwizyty,film-zakladki,film-paski,film-narzedzia,modele,stary-numer,podbicie,pre-push';

test('czysta fixtura: wszystkie kontrole zielone, kazda z licznikiem > 0, kod 0', (t) => {
  const r = repo(t).uruchom();
  for (const k of r.json.kontrole) {
    assert.deepEqual(k.bledy, [], k.id + ': ' + k.bledy.join(' | '));
    if (k.id !== 'diff') assert.ok(k.sprawdzono > 0, k.id + ' sprawdzono 0');
  }
  assert.equal(r.json.kontrole.length, 2 + WSZYSTKIE.split(',').length);
  assert.equal(r.kod, 0);
});

test('bazy: rdzen z tagu v*, mod z wlasnym tagiem i mod z commitu numeru (bez wlasnego tagu)', (t) => {
  const r = repo(t).uruchom();
  assert.equal(r.json.bazy.rdzen.ref, 'v1.0.0');
  const panel = r.json.bazy.mody.find((m) => m.nazwa === 'relai-panel');
  const progress = r.json.bazy.mody.find((m) => m.nazwa === 'relai-progress');
  assert.equal(panel.zrodlo, 'wlasny tag');
  assert.equal(progress.zrodlo, 'commit numeru w plugin.json');
});

test('numer modu podbity w drzewie roboczym: baza to numer z HEAD, nie kod 2', (t) => {
  const f = repo(t);
  f.zapisz('progress/.claude-plugin/plugin.json', '{\n  "name": "relai-progress",\n  "version": "0.2.0"\n}\n');
  const r = f.uruchom(['--tylko', 'historia']);
  const progress = r.json.bazy.mody.find((m) => m.nazwa === 'relai-progress');
  assert.equal(progress.wersjaBazy, '0.1.0');
  assert.equal(progress.zmienionych, 1);
});

test('zmiana hooka kolejkuje testy rdzenia (przeglad E1: mapa ich nie wolala), nieruszony obszar nie', (t) => {
  const f = repo(t);
  const czysta = f.uruchom(['--tylko', 'historia']);
  assert.ok(czysta.json.pominiete.includes('ciezkie zestawy: --tylko'));
  const bez = spawnSync(process.execPath, [SKRYPT, '--repo', f.dir, '--json', '--szybko'], { encoding: 'utf8' });
  assert.ok(JSON.parse(bez.stdout).pominiete.includes('testy-rdzenia: diff nie dotyka obszaru'));
  f.zapisz('adapters/claude-code/hooks/alpha.js', '// a zmienione\n');
  const po = JSON.parse(spawnSync(process.execPath, [SKRYPT, '--repo', f.dir, '--json', '--szybko'], { encoding: 'utf8' }).stdout);
  assert.ok(po.pominiete.includes('testy-rdzenia: --szybko'), po.pominiete.join(' | '));
});

test('nieśledzony nowy plik modu liczy sie do zmian modu', (t) => {
  const f = repo(t);
  f.zapisz('panel/hooks/nowy.ts', 'export {}\n');
  const panel = f.uruchom(['--tylko', 'historia']).json.bazy.mody.find((m) => m.nazwa === 'relai-panel');
  assert.equal(panel.zmienionych, 1);
});

test('brak tagu v*: kod 2 z nazwa brakujacej bazy (przypadek b7)', (t) => {
  const f = repo(t, { tag: false });
  const r = spawnSync(process.execPath, [SKRYPT, '--repo', f.dir, '--szybko'], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /brak bazy rdzenia: zaden tag v\*/);
});

test('mapa: plik w nowym katalogu spoza mapy - czerwien w mapie i "nieznany typ zmiany" w diffie', (t) => {
  const f = repo(t);
  f.zapisz('nowy-katalog/plik.txt', 'x\n');
  const przed = f.uruchom(['--tylko', 'historia']);
  assert.match(przed.k('diff').bledy.join('\n'), /nieznany typ zmiany: nowy-katalog\/plik\.txt \(niesledzony\)/);
  f.commit();
  const po = f.uruchom(['--tylko', 'historia']);
  assert.match(po.k('mapa').bledy.join('\n'), /plik bez wiersza mapy: nowy-katalog\/plik\.txt/);
  assert.match(po.k('diff').bledy.join('\n'), /nieznany typ zmiany: nowy-katalog\/plik\.txt \(nowy\)/);
  assert.equal(po.kod, 1);
});

test('--rev liczy drzewo rewizji w tymczasowym worktree i go sprzata', (t) => {
  const f = repo(t);
  // Rewizja po tagu (commit z tagiem v* liczylby sie wobec poprzedniego tagu, a tu go nie ma).
  f.zapisz('docs/notatka.md', 'x\n');
  f.commit('notatka');
  const start = git(f.dir, ['rev-parse', 'HEAD']).trim();
  f.zapisz('README.md', f.czytaj('README.md').replace('| `beta` | b |\n', ''));
  f.commit('bez beta');
  const stare = f.uruchom(['--rev', start, '--tylko', 'readme-hooki']);
  const nowe = f.uruchom(['--tylko', 'readme-hooki']);
  assert.deepEqual(stare.k('readme-hooki').bledy, []);
  assert.match(nowe.k('readme-hooki').bledy.join('\n'), /tabela hookow ma 1 wierszy przy 2 hookach w repo; brak wierszy: beta/);
  assert.equal(git(f.dir, ['worktree', 'list']).trim().split('\n').length, 1);
});

// Kazdy przypadek: mutacja fixtury -> kontrola czerwona z konkretnym brzmieniem (dowod negatywny:
// czysta fixtura wyzej daje te sama kontrole zielona).
const MUTACJE = [
  ['readme-hooki', 'wiersz hooka usuniety z README', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('| `alpha` | a |\n', '')), /brak wierszy: alpha/],
  ['readme-hooki', 'liczba hookow w prozie nieaktualna', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('ma ich dwa', 'ma ich trzy')), /mowi "trzy" \(3\), a hookow jest 2/],
  ['readme-komendy', 'liczba komend w prozie nieaktualna', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('Pięć komend', 'Sześć komend')), /"sześć komend" \(6\), a komend w repo jest 5/],
  ['readme-komendy', 'README bez liczby komend', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('Pięć komend', 'Komendy')), /nie podaje liczby komend/],
  ['readme-mody', 'wiersz modu bez numeru', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('`relai-panel` (0.1.0)', '`relai-panel`')), /wiersz modu relai-panel bez numeru/],
  ['readme-mody', 'wiersz modu z nieaktualnym numerem', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('`relai-progress` (0.1.0)', '`relai-progress` (0.0.9)')), /relai-progress ma 0\.0\.9, a plugin\.json 0\.1\.0/],
  ['readme-mody', 'brak wiersza modu', (f) => f.zapisz('README.md', f.czytaj('README.md').replace('| `relai-progress` (0.1.0) | postep |\n', '')), /brak wiersza modu relai-progress/],
  ['historia', 'wersja podbita bez wpisu w history.md', (f) => f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: '1.1.0' })), /nie ma wpisu "Wersja 1\.1\.0"/],
  ['artefakty', 'artefakt zmieniony bez wpisu', (f) => f.zapisz('adapters/claude-code/commands/relai-b.md', f.czytaj('adapters/claude-code/commands/relai-b.md') + '\nNowy akapit.\n'), /relai-b\.md zmieniony od v1\.0\.0 bez nowego wpisu/],
  ['strona-komendy', 'brak fiszki EN', (f) => {
    const en = JSON.parse(f.czytaj('site/tresc/en.json'));
    delete en.film.fiszki['relai-c'];
    f.zapisz('site/tresc/en.json', JSON.stringify(en));
  }, /relai-c bez fiszki EN/],
  ['strona-komendy', 'brak nazwy PL w NAMES', (f) => f.zapisz('core/panel/theme.mjs', f.czytaj('core/panel/theme.mjs').replace("  'relai-d': ['Nazwa relai-d', 'Opis relai-d'],\n", '')), /relai-d bez nazwy PL w NAMES/],
  ['strona-fakty', 'fakty.json nieaktualne', (f) => f.zapisz('site/dane/fakty.json', JSON.stringify({ liczbaKomend: 4 })), /pole "liczbaKomend" inne niz w repo/],
  ['strona-film', 'odtwarzacz na zasobach starego wydania', (f) => f.zapisz('site/wideo/index.html', f.czytaj('site/wideo/index.html').split('/v1.0.0/').join('/v0.9.0/')), /site\/wideo\/index\.html: v0\.9\.0, a film jest z wersji 1\.0\.0/],
  ['film-komendy', 'nowa komenda bez miejsca w filmie', (f) => f.zapisz('adapters/claude-code/commands/relai-f.md', '---\ndescription: "F."\n---\n'), /film nie pokazuje komend: relai-f/],
  ['film-rekwizyty', 'komenda bez rekwizytu', (f) => f.zapisz('docs/zasoby/film/zrodla/src/sceny/ScenaKomend.tsx', f.czytaj('docs/zasoby/film/zrodla/src/sceny/ScenaKomend.tsx').replace("  'relai-e': Epsilon,\n", '')), /relai-e z CYKL bez rekwizytu/],
  ['film-rekwizyty', 'rekwizyt bez pliku', (f) => fs.rmSync(path.join(f.dir, 'docs/zasoby/film/zrodla/src/sceny/komendy/Gamma.tsx')), /rekwizyt Gamma komendy relai-c bez pliku/],
  ['film-zakladki', 'zakladka panelu bez odpowiednika w filmie', (f) => f.zapisz('panel/hooks/pane-parts.tsx', "export const TABS = [['commands', 'Komendy'], ['costs', 'Koszty'], ['map', 'Mapa']] as const\n"), /inne niz TABS \[Komendy, Koszty, Mapa\]/],
  ['film-paski', 'nowe pasmo paskow', (f) => f.zapisz('core/panel/theme.mjs', f.czytaj('core/panel/theme.mjs').replace('cache: {} }', 'cache: {}, nowy: {} }')), /paski = 3, BAND ma 4/],
  ['film-narzedzia', 'nowy adapter', (f) => f.zapisz('adapters/cursor/README.md', '# c\n'), /narzedzia = 2, adapterow 3/],
  ['modele', 'MODELE.md pluginu starszy niz kopia projektu', (f) => f.zapisz('adapters/claude-code/MODELE.md', 'list-date: 2026-09-01\n'), /z 2026-09-01 starszy niz kopia projektu z 2026-10-01/],
  ['stary-numer', 'stary numer po podbiciu', (f) => f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: '1.1.0' })), /numer bazy 1\.0\.0 w \d+ plikach poza historycznymi: .*README\.md/],
  ['walidator', 'walidator czerwony', (f) => f.zapisz('core/tools/validate-adapters.js', "process.stderr.write('  - blad\\n'); process.exit(1);\n"), /zakonczyl sie kodem 1/],
  ['generator-codex', 'rozjazd skilli Codeksa', (f) => f.zapisz('adapters/codex/generate-skills.js', "process.stderr.write('rozjazd (3 plikow)\\n'); process.exit(1);\n"), /zakonczyl sie kodem 1/],
  ['sync-panel-core', 'kopia rdzenia panelu rozjechana', (f) => f.zapisz('core/tools/sync-panel-core.js', "process.stdout.write('rozjazd 2 plikow core/panel\\n'); process.exit(1);\n"), /zakonczyl sie kodem 1/],
  ['walidator', 'narzedzie nie mowi, co sprawdzilo', (f) => f.zapisz('core/tools/validate-adapters.js', "process.stdout.write('ok\\n');\n"), /nie zglosil, co sprawdzil/],
];

for (const [id, opis, mutuj, wzor] of MUTACJE) {
  test('podlozony defekt: ' + opis + ' -> ' + id + ' czerwone', (t) => {
    const f = repo(t);
    mutuj(f);
    const r = f.uruchom(['--tylko', id]);
    assert.match(r.k(id).bledy.join('\n'), wzor);
    assert.equal(r.kod, 1);
  });
}

test('stary numer przy wydawanym numerze rownym bazie: ostrzezenie, nie czerwien', (t) => {
  const r = repo(t).uruchom(['--tylko', 'stary-numer']);
  assert.deepEqual(r.k('stary-numer').bledy, []);
  assert.match(r.k('stary-numer').ostrzezenia.join('\n'), /numer bazy 1\.0\.0 w \d+ plikach/);
});

test('ARTEFAKTY: wiersz dopisany po bazie liczy sie mimo starej daty i kolejnosci (falsze instrumentu z E6)', (t) => {
  const f = repo(t);
  f.zapisz('adapters/claude-code/commands/relai-b.md', f.czytaj('adapters/claude-code/commands/relai-b.md') + '\nNowy akapit.\n');
  // Nowy wiersz z data starsza niz pozostale i wstawiony PRZED wierszem startowym.
  f.zapisz('docs/ARTEFAKTY.md', f.czytaj('docs/ARTEFAKTY.md').replace('| `/relai-a`', '| `/relai-b` | `adapters/claude-code/commands/relai-b.md` | 2 | 2026-09-14 | kopia upstreamu | - |\n| `/relai-a`'));
  const r = f.uruchom(['--tylko', 'artefakty']);
  assert.deepEqual(r.k('artefakty').bledy, []);
  assert.match(r.k('artefakty').licznik, /zmienionych od bazy 1, bez wpisu 0/);
});

test('liczebniki: formy 1 / 2-4 / 5 / 12 / 22 i dopelniacz', () => {
  const w = (s) => kontrole.wszystkieLiczby(s).map((x) => x.wartosc);
  assert.deepEqual(w('jeden plugin'), [1]);
  assert.deepEqual(w('dwie komendy, trzy hooki, cztery mody'), [2, 3, 4]);
  assert.deepEqual(w('pięć komend'), [5]);
  assert.deepEqual(w('dwanaście hookow'), [12]);
  assert.deepEqual(w('dwadzieścia dwa pliki'), [22]);
  assert.deepEqual(kontrole.liczbyPrzed('formularzami szesnastu komend', /^komend$/, 1).map((x) => x.wartosc), [16]);
  assert.deepEqual(kontrole.liczbyPrzed('dwadzieścia dwa komend', /^komend$/, 1).map((x) => x.wartosc), [22]);
  // "dwie komendy w terminalu" nie jest liczba komend RelAI (forma "komendy", nie "komend").
  assert.deepEqual(kontrole.liczbyPrzed('dwie komendy w terminalu', /^komend$/, 1), []);
});

// --- E2: propozycje numerow, kontrola "podbicie", sciezki historyczne, komenda projektowa ---------

const numery = require('../../tools/release-version.js');
const { wierszeDla } = require('../../tools/release-check.js');
const MAPA = require('../../tools/release-map.json');

const propozycja = (r, komponent) => r.json.propozycje.find((p) => p.komponent === komponent);
const zmienRdzen = (f) => f.zapisz('core/tools/validate-adapters.js', f.czytaj('core/tools/validate-adapters.js') + '// zmiana\n');

test('propozycja: fix w rdzeniu -> patch 1.0.1; czysta fixtura bez propozycji', (t) => {
  const f = repo(t);
  assert.deepEqual(f.uruchom(['--tylko', 'podbicie']).json.propozycje, []);
  zmienRdzen(f);
  f.commit('fix(tools): popraw walidator');
  const p = propozycja(f.uruchom(['--tylko', 'podbicie']), 'relai');
  assert.equal(p.poziom, 'patch');
  assert.equal(p.propozycja, '1.0.1');
  assert.equal(p.stan, 'do podbicia');
});

test('propozycja: feat w rdzeniu -> minor 1.1.0 z commitem w powodach', (t) => {
  const f = repo(t);
  zmienRdzen(f);
  f.commit('feat(tools): nowa kontrola');
  const p = propozycja(f.uruchom(['--tylko', 'podbicie']), 'relai');
  assert.equal(p.poziom, 'minor');
  assert.equal(p.propozycja, '1.1.0');
  assert.match(p.powody.join('\n'), /feat\(tools\): nowa kontrola/);
});

test('propozycja: usunieta komenda -> minor mimo commitu fix', (t) => {
  const f = repo(t);
  fs.rmSync(path.join(f.dir, 'adapters/claude-code/commands/relai-e.md'));
  f.commit('fix: usun relai-e');
  const p = propozycja(f.uruchom(['--tylko', 'podbicie']), 'relai');
  assert.equal(p.poziom, 'minor');
  assert.match(p.powody.join('\n'), /usunieta lub przemianowana komenda: adapters\/claude-code\/commands\/relai-e\.md/);
});

test('propozycja: zmiana tylko w modzie -> propozycja tylko dla modu', (t) => {
  const f = repo(t);
  f.zapisz('progress/hooks/nowy.ts', 'export {}\n');
  f.commit('feat(progress): nowy wiersz');
  const r = f.uruchom(['--tylko', 'podbicie']);
  assert.deepEqual(r.json.propozycje.map((p) => p.komponent), ['relai-progress']);
  assert.equal(propozycja(r, 'relai-progress').propozycja, '0.2.0');
});

test('propozycja: plik w katalogu modu z wierszem "wydanie: brak" nie daje propozycji modu', (t) => {
  const f = repo(t);
  const mapa = JSON.parse(JSON.stringify(MAPA));
  mapa.wiersze.find((w) => w.id === 'mod-progress').wyklucz = ['progress/docs/**'];
  mapa.wiersze.push({ id: 'mod-docs', wzorce: ['progress/docs/**'], wydanie: 'brak', komponenty: [], kontrole: [] });
  const plikMapy = path.join(f.dir, '..', path.basename(f.dir) + '-mapa.json');
  fs.writeFileSync(plikMapy, JSON.stringify(mapa));
  t.after(() => fs.rmSync(plikMapy, { force: true }));
  f.zapisz('progress/docs/notatka.md', 'x\n');
  f.commit('feat(progress): notatka');
  assert.deepEqual(f.uruchom(['--tylko', 'podbicie', '--mapa', plikMapy]).json.propozycje, []);
  f.zapisz('progress/hooks/nowy.ts', 'export {}\n');
  f.commit('fix(progress): kod');
  assert.equal(propozycja(f.uruchom(['--tylko', 'podbicie', '--mapa', plikMapy]), 'relai-progress').poziom, 'patch');
});

test('propozycja: zmiana tylko w docs/ (nawet feat) -> brak propozycji', (t) => {
  const f = repo(t);
  f.zapisz('docs/notatka.md', 'x\n');
  f.commit('feat(docs): notatka');
  assert.deepEqual(f.uruchom(['--tylko', 'podbicie']).json.propozycje, []);
});

test('propozycja: feat dotykajacy tylko strony nie podnosi rdzenia do minor', (t) => {
  const f = repo(t);
  f.zapisz('site/dane/fakty.json', JSON.stringify({ liczbaKomend: 5, nowe: 1 }));
  f.commit('feat(site): nowe pole');
  zmienRdzen(f);
  f.commit('fix(tools): drobiazg');
  const p = propozycja(f.uruchom(['--tylko', 'podbicie']), 'relai');
  assert.equal(p.poziom, 'patch');
  assert.equal(p.commitow, 1);
});

test('podbicie: numer bazy w trybie wydania czerwony, po podbiciu zielony; tryb zwykly ostrzega', (t) => {
  const f = repo(t);
  zmienRdzen(f);
  f.commit('fix(tools): popraw walidator');
  const zwykly = f.uruchom(['--tylko', 'podbicie']);
  assert.deepEqual(zwykly.k('podbicie').bledy, []);
  assert.match(zwykly.k('podbicie').ostrzezenia.join('\n'), /relai: 1 plikow wymaga wydania, numer 1\.0\.0 rowny bazie/);
  const przed = f.uruchom(['--tylko', 'podbicie', '--wydanie']);
  assert.match(przed.k('podbicie').bledy.join('\n'), /relai: 1 plikow wymaga wydania, numer 1\.0\.0 rowny bazie \(propozycja 1\.0\.1, patch\)/);
  assert.equal(przed.kod, 1);
  f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: '1.0.1' }));
  const po = f.uruchom(['--tylko', 'podbicie', '--wydanie']);
  assert.deepEqual(po.k('podbicie').bledy, []);
  assert.equal(propozycja(po, 'relai').stan, 'podbity');
  assert.equal(po.kod, 0);
});

test('podbicie: numer ponizej propozycji i nieczytelny czerwone w trybie wydania, powyzej - ostrzezenie', (t) => {
  const f = repo(t);
  zmienRdzen(f);
  f.commit('feat(tools): nowa kontrola');
  const ustaw = (v) => f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: v }));
  ustaw('1.0.1');
  const ponizej = f.uruchom(['--tylko', 'podbicie', '--wydanie']);
  assert.match(ponizej.k('podbicie').bledy.join('\n'), /numer 1\.0\.1 ponizej propozycji \(propozycja 1\.1\.0, minor\)/);
  ustaw('x');
  assert.match(f.uruchom(['--tylko', 'podbicie', '--wydanie']).k('podbicie').bledy.join('\n'), /numer "x" nieczytelny/);
  ustaw('2.0.0');
  const powyzej = f.uruchom(['--tylko', 'podbicie', '--wydanie']);
  assert.deepEqual(powyzej.k('podbicie').bledy, []);
  assert.match(powyzej.k('podbicie').ostrzezenia.join('\n'), /numer 2\.0\.0 powyzej propozycji 1\.1\.0/);
});

test('propozycja: feat sprzed zmiany nazwy pliku nadal daje minor (stara sciezka w zbiorze)', (t) => {
  const f = repo(t);
  // Plik dosc dlugi, zeby "git diff -M" od bazy pokazal R (stary -> nowy), a nie D + A.
  const tresc = Array.from({ length: 30 }, (_, i) => '// linia ' + i + '\n').join('');
  f.zapisz('core/process/stary.js', tresc);
  f.commit('chore: plik');
  git(f.dir, ['tag', '-d', 'v1.0.0']);
  git(f.dir, ['tag', 'v1.0.0']);
  f.zapisz('core/process/stary.js', tresc + '// funkcja\n');
  f.commit('feat(process): funkcja');
  git(f.dir, ['mv', 'core/process/stary.js', 'core/process/nowy.js']);
  f.commit('refactor(process): nowa nazwa');
  const r = f.uruchom(['--tylko', 'podbicie']);
  assert.deepEqual(Object.keys(r.json.zmiany.typy), ['rdzen-procesu / przemianowany']);
  const p = propozycja(r, 'relai');
  assert.equal(p.poziom, 'minor');
  assert.match(p.powody.join('\n'), /feat\(process\): funkcja/);
});

test('propozycja: plik bez commitu - powod "poziom niepewny" obok poziomu z commitow', (t) => {
  const f = repo(t);
  zmienRdzen(f);
  f.commit('fix(tools): popraw walidator');
  f.zapisz('adapters/claude-code/hooks/gamma.js', '// nowy hook bez commitu\n');
  const p = propozycja(f.uruchom(['--tylko', 'podbicie']), 'relai');
  assert.equal(p.bezCommitu, 1);
  assert.match(p.powody.join('\n'), /same poprawki/);
  assert.match(p.powody.join('\n'), /poziom niepewny: 1 plikow bez commitu - propozycja to co najmniej patch/);
});

test('stary-numer: plik testu z numerem bazy pominiety, plik produkcyjny nadal czerwony', (t) => {
  const f = repo(t);
  f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: '1.1.0' }));
  f.zapisz('site/js/wersja.test.mjs', "// dane testu: stara wersja 1.0.0\n");
  f.zapisz('core/process/produkcja.js', "const WERSJA = '1.0.0';\n");
  f.commit('chore: 1.1.0');
  const r = f.uruchom(['--tylko', 'stary-numer']);
  const bledy = r.k('stary-numer').bledy.join('\n');
  assert.match(bledy, /core\/process\/produkcja\.js/);
  assert.doesNotMatch(bledy, /wersja\.test\.mjs/);
  // Kontrola pozytywna reguly: ten sam plik testu poza wzorcem '*.test.*' wchodzi do trafien.
  f.zapisz('site/js/wersja-dane.mjs', "// dane testu: stara wersja 1.0.0\n");
  f.commit('chore: dane');
  assert.match(f.uruchom(['--tylko', 'stary-numer']).k('stary-numer').bledy.join('\n'), /site\/js\/wersja-dane\.mjs/);
});

test('strona-film: adres odtwarzacza = tag wersji filmu; zielony na zgodnym, czerwony na v0.9.0, obcym jezyku i braku adresu (jeden przebieg)', (t) => {
  const f = repo(t);
  const zgodny = f.uruchom(['--tylko', 'strona-film']).k('strona-film');
  assert.deepEqual(zgodny.bledy, []);
  assert.equal(zgodny.sprawdzono, 4);
  f.zapisz('site/wideo/index.html', f.czytaj('site/wideo/index.html').split('/v1.0.0/').join('/v0.9.0/'));
  f.zapisz('site/pl/wideo/index.html', f.czytaj('site/pl/wideo/index.html').split('relai-film-pl').join('relai-film-en'));
  const bledy = f.uruchom(['--tylko', 'strona-film']).k('strona-film').bledy.join('\n');
  assert.match(bledy, /site\/wideo\/index\.html: v0\.9\.0, a film jest z wersji 1\.0\.0/);
  assert.match(bledy, /site\/pl\/wideo\/index\.html: relai-film-en\.mp4, a strona jest w jezyku pl/);
  f.zapisz('site/wideo/index.html', '<video controls></video>\n');
  assert.match(f.uruchom(['--tylko', 'strona-film']).k('strona-film').bledy.join('\n'), /site\/wideo\/index\.html: brak adresu filmu/);
});

test('strona-film: czas filmu w tekscie odtwarzacza = suma sekund scen; zielony na zgodnym, czerwony na starym i na braku (jeden przebieg)', (t) => {
  const f = repo(t);
  assert.deepEqual(f.uruchom(['--tylko', 'strona-film']).k('strona-film').bledy, []);
  f.zapisz('site/wideo/index.html', f.czytaj('site/wideo/index.html').split('<p>RelAI, 1 min 30 s.</p>').join('<p>RelAI, 1 min 20 s.</p>'));
  f.zapisz('site/pl/wideo/index.html', f.czytaj('site/pl/wideo/index.html').split(' min 30 s').join(''));
  const bledy = f.uruchom(['--tylko', 'strona-film']).k('strona-film').bledy.join('\n');
  assert.match(bledy, /site\/wideo\/index\.html: czas "1 min 20 s", a film ma 1 min 30 s/);
  assert.doesNotMatch(bledy, /site\/wideo\/index\.html: czas "1 min 30 s"/);
  assert.match(bledy, /site\/pl\/wideo\/index\.html: brak czasu filmu/);
});

test('--rev: drzewo rewizji z LF niezaleznie od core.autocrlf=true repozytorium (PIPELINE_WYDAN, Aneks B)', (t) => {
  const f = repo(t);
  git(f.dir, ['config', 'core.autocrlf', 'true']);
  f.zapisz('core/tools/validate-adapters.js', "const t = require('fs').readFileSync(__filename, 'utf8');\n"
    + "if (t.includes(String.fromCharCode(13))) { process.stderr.write('  - CRLF w drzewie\\n'); process.exit(1); }\n"
    + "process.stdout.write('ok\\n  + jedna pozycja\\n');\n");
  f.commit('chore: walidator czuly na CRLF');
  assert.deepEqual(f.uruchom(['--rev', 'HEAD', '--tylko', 'walidator']).k('walidator').bledy, []);
  // Kontrola pozytywna instrumentu: ten sam walidator na pliku z CRLF jest czerwony.
  f.zapisz('core/tools/validate-adapters.js', f.czytaj('core/tools/validate-adapters.js').split('\n').join(String.fromCharCode(13, 10)));
  assert.match(f.uruchom(['--tylko', 'walidator']).k('walidator').bledy.join('\n'), /zakonczyl sie kodem 1/);
});

test('stary-numer: zapis przeszlosci (slowo z zamknietej listy przed numerem) pominiety, deklaracja stanu czerwona (PIPELINE_WYDAN, Aneks A)', (t) => {
  const f = repo(t);
  f.zapisz('.claude-plugin/plugin.json', JSON.stringify({ name: 'relai', version: '1.1.0' }));
  f.zapisz('docs/historia-a.md', 'Tabela komend (od 1.0.0 `/relai-x`), W 1.0.0 dochodzi skan,\nprzy 1.0.0 trzy luki; since v1.0.0; (po 1.0.0) sprzed 1.0.0, after 1.0.0, in 1.0.0, do 1.0.0.\n');
  f.zapisz('docs/stan-b.md', '| Obszar | Stan docelowy 1.0.0 |\n');
  f.zapisz('docs/mieszany-c.md', 'od 1.0.0 nowa komenda; naglowek `RelAI 1.0.0`\n');
  f.zapisz('docs/wydanie-d.md', 'w repo, do wydania 1.0.0\n');
  f.commit('chore: 1.1.0');
  const bledy = f.uruchom(['--tylko', 'stary-numer']).k('stary-numer').bledy.join('\n');
  assert.doesNotMatch(bledy, /historia-a\.md/);
  assert.match(bledy, /stan-b\.md/);
  assert.match(bledy, /mieszany-c\.md/);
  // "wydania" nie jest na liscie: slowo przed numerem musi stac tuz przed nim.
  assert.match(bledy, /wydanie-d\.md/);
});

test('mapa: komenda projektowa .claude/commands/*.md w dokladnie jednym wierszu, bez wydania', () => {
  const w = wierszeDla(MAPA, '.claude/commands/relai-release.md');
  assert.deepEqual(w.map((x) => x.id), ['komenda-projektowa']);
  assert.equal(w[0].wydanie, 'brak');
  assert.deepEqual(wierszeDla(MAPA, '.claude/relai/work/x.md'), []);
});

test('poziom commitu i podbicie numeru', () => {
  assert.equal(numery.poziomCommitu('feat(x): a').poziom, 'minor');
  assert.equal(numery.poziomCommitu('fix(x): a').poziom, 'patch');
  assert.equal(numery.poziomCommitu('docs: a').poziom, 'patch');
  assert.deepEqual(numery.poziomCommitu('fix!: a'), { poziom: 'minor', typ: 'fix', breaking: true });
  assert.equal(numery.poziomCommitu('refactor: a', 'opis\n\nBREAKING CHANGE: api').poziom, 'minor');
  assert.deepEqual(numery.poziomCommitu('Merge branch main'), { poziom: 'patch', typ: null, breaking: false });
  assert.equal(numery.podbij('3.3.0', 'minor'), '3.4.0');
  assert.equal(numery.podbij('0.21.2', 'patch'), '0.21.3');
  assert.equal(numery.podbij('x', 'patch'), null);
});

test('glob mapy: * bez ukosnika, ** dowolna glebokosc', () => {
  assert.ok(kontrole.globNaRegex('adapters/*/MODELE.md').test('adapters/codex/MODELE.md'));
  assert.ok(!kontrole.globNaRegex('adapters/*/MODELE.md').test('adapters/codex/x/MODELE.md'));
  assert.ok(kontrole.globNaRegex('docs/**').test('docs/a/b/c.md'));
  assert.ok(kontrole.globNaRegex('**/package-lock.json').test('package-lock.json'));
  assert.ok(kontrole.globNaRegex('**/package-lock.json').test('a/b/package-lock.json'));
});
