#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: sync-panel-core — kopia core/panel/*.mjs do pluginow, ktore niosa
// rdzen panelu: relai-panel (panel/), relai-progress (progress/) i relai-cache-keeper
// (cache-keeper/, hooks/relai/) — E9 planu PANEL_CLAUDE, Aneks C — oraz relai-mods (mods/,
// plan RELAI_MODS, Aneks B).
//
// Po co: silnik modow Claude Code odmawia importu spoza folderu pluginu ("cannot import ...
// it is outside the plugin's folder", 2.1.293, sprawdzone 2026-10-08), a marketplace ze
// zrodlem ./panel kopiuje przy instalacji tylko ten folder. Rdzen zostaje jedynym zrodlem
// (plan PANEL_CLAUDE, wariant A): panel/hooks/core/ niesie kopie bajt w bajt, a ten skrypt
// jest jedyna droga, ktora tam pisze. Kopii nie edytuje sie recznie.
//
// Kazdy mod dostaje tylko pliki, ktore importuje (audyt 2026-11-09, G2; plan
// OPTYMALIZACJA_PO_AUDYCIE, K-G2): korzeniami grafu sa wszystkie wlasne pliki .ts/.tsx modu pod
// hooks/ (register.tsx, widoki i testy), poza katalogiem kopii; krawedzie to `import ... from`,
// `export ... from`, `import '...'` i `import('...')` ze sciezka zaczynajaca sie od ./ albo ../.
// Plik rdzenia wnosi swoje importy. Graf liczy sie przy kazdym uruchomieniu, wiec nowy import
// w modzie bez ponownej synchronizacji wychodzi w --check jako "brak kopii".
// Kasowane sa wylacznie pliki o nazwie z core/panel/ (albo icons.mjs), ktorych mod juz nie
// importuje; obcy plik .mjs w katalogu kopii nie jest kasowany, --check go zglasza.
//
//   node core/tools/sync-panel-core.js          # zapisuje kopie i usuwa nadmiarowe
//   node core/tools/sync-panel-core.js --check  # tylko porownuje (test, przed wydaniem)
//
// Ikony 16 komend (E8, humanizacja od HUMANIZACJA E1, bezpieczenstwo od BEZPIECZENSTWO E1): zrodlem jest docs/zasoby/branding/ikony/*.svg; narzedzie sklada z nich
// modul icons.mjs w katalogu kopii modu, ktory go importuje (ICONS: nazwa pliku bez .svg -> tekst SVG bez deklaracji XML),
// bo plugin czyta wylacznie pliki ze swojego folderu. --check porownuje go z ikonami.
//
// Porownanie po normalizacji CRLF -> LF (core.autocrlf=true na Windows, L-0033).
// Kod wyjscia: 0 = zgodne / zapisane, 1 = rozjazd (tryb --check). Komunikaty ASCII.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'core', 'panel');
// Plugin folders that carry the core, and where; one whose folder is absent is skipped.
// relai-cache-keeper has a hooks/core.ts of its own, so its copy lives in hooks/relai/.
// relai-mods joined in E3 of plan RELAI_MODS (Annex B), for the theme keys of its cockpit.
const PLUGINS = [['panel', 'panel/hooks/core'], ['progress', 'progress/hooks/core'], ['cache-keeper', 'cache-keeper/hooks/relai'], ['mods', 'mods/hooks/core']];
const present = () => PLUGINS.filter(([p]) => fs.existsSync(path.join(ROOT, p)));
const ICONS = path.join(ROOT, 'docs', 'zasoby', 'branding', 'ikony');
const ICONS_MODULE = 'icons.mjs';
// A relative specifier of a static import or re-export, a bare import, or a dynamic import()
const SPEC = /(?:\bimport|\bexport)\s[^'"]*?\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]|\bimport\s*['"](\.{1,2}\/[^'"]+)['"]|\bimport\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;

function sources() {
  return fs.readdirSync(SRC).filter((n) => n.endsWith('.mjs')).sort();
}

const lf = (buf) => buf.toString('utf8').replace(/\r\n/g, '\n');

const toDir = (rel) => path.join(ROOT, ...rel.split('/'));

function specsOf(file) {
  return [...fs.readFileSync(file, 'utf8').matchAll(SPEC)].map((m) => m[1] || m[2] || m[3]);
}

// The core file a specifier names, by its name, when it points into `dir`; null otherwise
function coreName(fromDir, spec, dir, known) {
  const target = path.resolve(fromDir, spec);
  if (path.dirname(target) !== dir) return null;
  const name = path.basename(target).endsWith('.mjs') ? path.basename(target) : path.basename(target) + '.mjs';
  return known.has(name) ? name : null;
}

// The mod's own code: every .ts/.tsx under hooks/, the copy folder left out
function ownFiles(plugin, copyDir) {
  const hooks = path.join(ROOT, plugin, 'hooks');
  if (!fs.existsSync(hooks)) return [];
  return fs.readdirSync(hooks, { recursive: true }).map((n) => path.join(hooks, n))
    .filter((f) => /\.tsx?$/.test(f) && !f.startsWith(copyDir + path.sep) && !f.includes(path.sep + 'node_modules' + path.sep) && fs.statSync(f).isFile());
}

// The core files one mod reaches, sorted: from its own files, then what each core file imports
function wanted(plugin, rel, names, icons) {
  const dir = toDir(rel);
  const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
  const stack = ownFiles(plugin, dir).flatMap((f) => specsOf(f).map((s) => coreName(path.dirname(f), s, dir, known))).filter(Boolean);
  const want = new Set();
  while (stack.length) {
    const n = stack.pop();
    if (want.has(n)) continue;
    want.add(n);
    if (n === ICONS_MODULE) continue;
    for (const s of specsOf(path.join(SRC, n))) {
      const next = coreName(SRC, s, SRC, known);
      if (next) stack.push(next);
    }
  }
  return [...want].sort();
}

// The icons as one ESM module; null when the repo has no icon folder (nothing to carry)
function iconsModule() {
  if (!fs.existsSync(ICONS)) return null;
  const names = fs.readdirSync(ICONS).filter((n) => n.endsWith('.svg')).sort();
  const map = {};
  for (const n of names) map[n.replace(/\.svg$/, '')] = lf(fs.readFileSync(path.join(ICONS, n))).replace(/<\?xml[^>]*>\s*/, '').trim();
  return [
    '// RelAI core / panel: icons — GENERATED by core/tools/sync-panel-core.js from docs/zasoby/branding/ikony.',
    '// Do not edit: change the SVG files and run the tool.',
    '',
    '/** @type {Readonly<Record<string, string>>} */',
    'export const ICONS = Object.freeze(' + JSON.stringify(map, null, 1) + ');',
    '',
  ].join('\n');
}

function checkOne(rel, want, names, icons) {
  const DST = toDir(rel);
  const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')).sort() : [];
  const problems = [];
  for (const n of want) {
    const dst = path.join(DST, n);
    if (n === ICONS_MODULE) {
      if (!fs.existsSync(dst)) problems.push('brak ' + rel + '/' + ICONS_MODULE + ' (ikony komend)');
      else if (lf(fs.readFileSync(dst)) !== icons) problems.push(rel + '/' + ICONS_MODULE + ' rozni sie od docs/zasoby/branding/ikony/');
    } else if (!fs.existsSync(dst)) problems.push('brak kopii ' + rel + '/' + n);
    else if (lf(fs.readFileSync(dst)) !== lf(fs.readFileSync(path.join(SRC, n)))) problems.push('kopia ' + rel + '/' + n + ' rozni sie od core/panel/' + n);
  }
  const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
  for (const n of have) {
    if (want.includes(n)) continue;
    problems.push(known.has(n) ? 'kopia nadmiarowa ' + rel + '/' + n + ' - zaden plik modu jej nie importuje' : rel + '/' + n + ' nie ma zrodla w core/panel/');
  }
  return problems;
}

function check() {
  const names = sources();
  const icons = iconsModule();
  const to = present();
  const copies = Object.fromEntries(to.map(([p, rel]) => [rel, wanted(p, rel, names, icons)]));
  const problems = to.flatMap(([, rel]) => checkOne(rel, copies[rel], names, icons));
  const iconCount = icons === null ? 0 : fs.readdirSync(ICONS).filter((n) => n.endsWith('.svg')).length;
  return { files: names.length, icons: iconCount, dests: to.map(([, rel]) => rel), copies, problems };
}

function sync() {
  const names = sources();
  const icons = iconsModule();
  const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
  for (const [p, rel] of present()) {
    const DST = toDir(rel);
    const want = wanted(p, rel, names, icons);
    if (want.length) fs.mkdirSync(DST, { recursive: true });
    for (const n of want) {
      if (n === ICONS_MODULE) fs.writeFileSync(path.join(DST, n), icons);
      else fs.copyFileSync(path.join(SRC, n), path.join(DST, n));
    }
    // Only a copy this tool wrote is removed: a name from core/panel/ (or icons.mjs) no file imports
    const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')) : [];
    for (const n of have) if (known.has(n) && !want.includes(n)) fs.unlinkSync(path.join(DST, n));
  }
}

if (require.main === module) {
  if (!process.argv.includes('--check')) sync();
  const r = check();
  if (r.problems.length) {
    for (const p of r.problems) process.stderr.write('[sync-panel-core] ' + p + '\n');
    process.stderr.write('[sync-panel-core] napraw: node core/tools/sync-panel-core.js\n');
    process.exit(1);
  }
  process.stdout.write('[sync-panel-core] zgodne: ' + r.files + ' plikow core/panel i ' + r.icons + ' ikon -> ' + r.dests.join(', ') + '\n');
}

module.exports = { check, sync };
