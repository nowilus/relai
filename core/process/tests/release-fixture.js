'use strict';

// Fixtura testow pipeline'u wydan (PIPELINE_WYDAN E1-E3): male repozytorium git w katalogu
// tymczasowym, z ukladem sciezek jak w RelAI i tagami v1.0.0 i relai-panel-v0.1.0. Wspolna dla
// release-check.test.js i release-pre-push.test.js (wyniesiona w E3, tresc bez zmian).
// Opcja "narzedzia" kopiuje prawdziwe narzedzia wydania do core/tools/ fixtury przed pierwszym
// commitem (hook pre-push wola release-check.js z drzewa roboczego repozytorium).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SKRYPT = path.join(__dirname, '..', '..', 'tools', 'release-check.js');
const NARZEDZIA = ['release-check.js', 'release-checks.js', 'release-version.js', 'release-map.json', 'release-pre-push.js', 'install-prepush.js', 'release-hint.js'];

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

function git(dir, args, opcje = {}) {
  const r = spawnSync('git', ['-c', 'user.name=tester', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', '-c', 'commit.gpgsign=false'].concat(args),
    Object.assign({ cwd: dir, encoding: 'utf8' }, opcje));
  if (r.status !== 0 && !opcje.wolnoPorazke) throw new Error('git ' + args.join(' ') + ': ' + r.stderr);
  return opcje.wolnoPorazke ? r : r.stdout;
}

function repo(t, opcje = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const zapisz = (rel, tresc) => {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), tresc);
  };
  git(dir, ['init', '-q', '-b', 'main']);
  for (const [rel, tresc] of Object.entries(pliki())) zapisz(rel, tresc);
  if (opcje.narzedzia) {
    for (const n of NARZEDZIA) zapisz('core/tools/' + n, fs.readFileSync(path.join(__dirname, '..', '..', 'tools', n)));
    zapisz('docs/DZIENNIK.md', '# DZIENNIK\n\n## Stan otwartych ryzykow\n\n- brak\n\n## Wpisy\n\n### 2026-10-01 — start\n\nTresc.\n');
  }
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

module.exports = { SKRYPT, KOMENDY, pliki, git, repo };
