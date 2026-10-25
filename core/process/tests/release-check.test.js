'use strict';

// release-check.js (PIPELINE_WYDAN E1): raport gotowosci do wydania. Fixtura to male repozytorium
// git w katalogu tymczasowym, z ukladem sciezek jak w RelAI i tagiem v1.0.0 — kazda kontrola ma
// przypadek zielony i czerwony na podlozonym defekcie (ryzyko PW1: instrument falszywie cichy).
// Mapa wplywu jest prawdziwa (core/tools/release-map.json), wiec fixtura sprawdza tez ja (PW2).

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SKRYPT = path.join(__dirname, '..', '..', 'tools', 'release-check.js');
const kontrole = require('../../tools/release-checks.js');

const KOMENDY = ['relai-a', 'relai-b', 'relai-c', 'relai-d', 'relai-e'];
const KOMPONENTY = ['Alfa', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

function pliki() {
  const f = {};
  f['.claude-plugin/plugin.json'] = JSON.stringify({ name: 'relai', version: '1.0.0' });
  f['.claude-plugin/marketplace.json'] = JSON.stringify({ plugins: [
    { name: 'relai', source: './', version: '1.0.0' },
    { name: 'relai-panel', source: './panel', version: '0.1.0' },
    { name: 'relai-progress', source: './progress', version: '0.1.0' },
  ] });
  f['panel/.claude-plugin/plugin.json'] = '{\n  "name": "relai-panel",\n  "version": "0.1.0"\n}\n';
  f['progress/.claude-plugin/plugin.json'] = '{\n  "name": "relai-progress",\n  "version": "0.1.0"\n}\n';
  f['panel/hooks/pane-parts.tsx'] = "export const TABS = [['commands', 'Komendy'], ['costs', 'Koszty']] as const\n";
  for (const k of KOMENDY) f['adapters/claude-code/commands/' + k + '.md'] = '---\ndescription: "Komenda ' + k + '."\n---\n\nTresc.\n';
  f['adapters/claude-code/hooks/hooks.json'] = JSON.stringify({ hooks: { Stop: [{ hooks: [
    { command: 'node "${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/alpha.js"' },
    { command: 'node "${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/beta.js"' },
  ] }] } });
  f['adapters/claude-code/hooks/alpha.js'] = '// a\n';
  f['adapters/claude-code/hooks/beta.js'] = '// b\n';
  f['adapters/claude-code/skills/relai-core/history.md'] = '# historia\n\nWersja 1.0.0 (start).\n';
  f['adapters/claude-code/MODELE.md'] = 'list-date: 2026-10-01\n';
  f['README.md'] = [
    '<em>Wersja 1.0.0</em>', '',
    '## Instalacja', '', 'Dwie komendy w terminalu, raz na maszyne.', '',
    '## Na co dzien', '', 'Pięć komend `/relai-*` to skroty.', '',
    '## Panel w Claude Code (early access)', '', 'Dwa osobne pluginy z tego marketplace; kazdy plugin osobno.', '',
    '| Plugin | Co pokazuje |', '|---|---|', '| `relai-panel` (0.1.0) | pasek |', '| `relai-progress` (0.1.0) | postep |', '',
    '## Co pilnuje tylko Claude Code', '', 'Claude Code ma ich dwa; reszta po czesci.', '',
    '| Hook Claude Code | Co robi |', '|---|---|', '| `alpha` | a |', '| `beta` | b |', '',
    '## Licencja', '', 'MIT.', '',
  ].join('\n');
  f['docs/ARTEFAKTY.md'] = '# ARTEFAKTY\n\n## Komendy (5)\n\n| Artefakt | Plik | Wersja | Data | Co | Po co |\n|---|---|---|---|---|---|\n'
    + KOMENDY.map((k) => '| `/' + k + '` | `adapters/claude-code/commands/' + k + '.md` | 1 | 2026-10-01 | start | - |').join('\n') + '\n';
  f['core/panel/theme.mjs'] = 'export const NAMES = Object.freeze({\n'
    + KOMENDY.map((k) => "  '" + k + "': ['Nazwa " + k + "', 'Opis " + k + "'],").join('\n')
    + "\n});\nexport const BAND = Object.freeze({ plan: {}, postep: {}, cache: {} });\n";
  f['site/tresc/en.json'] = JSON.stringify({ film: { fiszki: Object.fromEntries(KOMENDY.map((k) => [k, { tytul: 'T ' + k, opis: 'O ' + k }])) } });
  f['site/narzedzia/fakty.mjs'] = "import { readdirSync } from 'node:fs';\nimport { join } from 'node:path';\n"
    + "export async function collectFacts(root) {\n  return { liczbaKomend: readdirSync(join(root, 'adapters', 'claude-code', 'commands')).length };\n}\n";
  f['site/dane/fakty.json'] = JSON.stringify({ liczbaKomend: 5 });
  const F = 'docs/zasoby/film/zrodla/';
  f[F + 'src/komendy.ts'] = 'export const CYKL = Object.freeze([\n' + KOMENDY.map((k) => "  '" + k + "',").join('\n') + '\n] as const);\n';
  f[F + 'src/sceny/ScenaKomend.tsx'] = KOMPONENTY.map((c) => "import { " + c + " } from './komendy/" + c + "';").join('\n')
    + '\n// typ niesie "})" przed pierwszym wpisem - regresja pierwszego przebiegu\n'
    + 'const REKWIZYTY: Readonly<Record<IdKomendy, (p: { t: number }) => ReactNode>> = Object.freeze({\n'
    + KOMENDY.map((k, i) => "  '" + k + "': " + KOMPONENTY[i] + ',').join('\n') + '\n});\n';
  for (const c of KOMPONENTY) f[F + 'src/sceny/komendy/' + c + '.tsx'] = 'export const ' + c + ' = () => null;\n';
  f[F + 'src/teksty.ts'] = "export const PL = { panel: { zakladki: Object.freeze(['Komendy', 'Koszty']) } };\n";
  f[F + 'src/dane/manifest.json'] = JSON.stringify({ komendy: { wartosc: 5 }, paski: { wartosc: 3 }, narzedzia: { wartosc: 2 }, narzedziaNazwy: { wartosc: ['Claude Code', 'Codex'] } });
  f['core/tools/validate-adapters.js'] = "process.stdout.write('ok\\n  + jedna pozycja\\n');\n";
  f['adapters/codex/generate-skills.js'] = "process.stdout.write('Codex skills (3 plikow), spojne.\\n');\n";
  f['core/tools/sync-panel-core.js'] = "process.stdout.write('[sync] zgodne: 2 plikow core/panel\\n');\n";
  return f;
}

function git(dir, args) {
  const r = spawnSync('git', ['-c', 'user.name=tester', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false'].concat(args), { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) throw new Error('git ' + args.join(' ') + ': ' + r.stderr);
  return r.stdout;
}

function repo(t, opcje = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const zapisz = (rel, tresc) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), tresc);
  };
  git(dir, ['init', '-q']);
  for (const [rel, tresc] of Object.entries(pliki())) zapisz(rel, tresc);
  zapisz('.claude/relai/MODELE-claude-code.md', 'list-date: 2026-10-01\n');
  git(dir, ['add', '-A', '--', '.', ':!.claude']);
  git(dir, ['commit', '-q', '-m', 'start']);
  if (opcje.tag !== false) {
    git(dir, ['tag', 'v1.0.0']);
    git(dir, ['tag', 'relai-panel-v0.1.0']);
  }
  const commit = (msg) => { git(dir, ['add', '-A', '--', '.', ':!.claude']); git(dir, ['commit', '-q', '-m', msg || 'zmiana']); };
  const uruchom = (args = []) => {
    const r = spawnSync(process.execPath, [SKRYPT, '--repo', dir, '--json', '--szybko'].concat(args), { encoding: 'utf8' });
    const json = JSON.parse(r.stdout);
    const k = (id) => (json.kontrole || []).find((x) => x.id === id);
    return { kod: r.status, json, k };
  };
  return { dir, zapisz, commit, uruchom, czytaj: (rel) => fs.readFileSync(path.join(dir, rel), 'utf8') };
}

const WSZYSTKIE = 'walidator,generator-codex,sync-panel-core,readme-komendy,readme-hooki,readme-mody,historia,artefakty,'
  + 'strona-komendy,strona-fakty,film-komendy,film-rekwizyty,film-zakladki,film-paski,film-narzedzia,modele,stary-numer';

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

test('glob mapy: * bez ukosnika, ** dowolna glebokosc', () => {
  assert.ok(kontrole.globNaRegex('adapters/*/MODELE.md').test('adapters/codex/MODELE.md'));
  assert.ok(!kontrole.globNaRegex('adapters/*/MODELE.md').test('adapters/codex/x/MODELE.md'));
  assert.ok(kontrole.globNaRegex('docs/**').test('docs/a/b/c.md'));
  assert.ok(kontrole.globNaRegex('**/package-lock.json').test('package-lock.json'));
  assert.ok(kontrole.globNaRegex('**/package-lock.json').test('a/b/package-lock.json'));
});
