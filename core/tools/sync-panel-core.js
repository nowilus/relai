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
// relai-browser joined in E1 of plan MODY_OSZCZEDZANIA (the first token-saving mod),
// relai-input-router in its E3, relai-model-router in its E5.
const PLUGINS = [['panel', 'panel/hooks/core'], ['progress', 'progress/hooks/core'], ['cache-keeper', 'cache-keeper/hooks/relai'], ['mods', 'mods/hooks/core'], ['browser', 'browser/hooks/core'], ['input-router', 'input-router/hooks/core'], ['model-router', 'model-router/hooks/core'], ['effort', 'effort/hooks/core']];
const present = () => PLUGINS.filter(([p]) => fs.existsSync(path.join(ROOT, p)));
const ICONS = path.join(ROOT, 'docs', 'zasoby', 'branding', 'ikony');
const ICONS_MODULE = 'icons.mjs';
// The secret scanner for mods: ESM made from core/guardrails/secret-scan.js, the one source of
// the patterns (plan MODY_OSZCZEDZANIA, E1). Like icons.mjs it is generated, never copied.
const SECRET_MODULE = 'secret-scan.mjs';
const SECRET_TOOL = path.join(__dirname, 'secret-scan-esm.js');
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
function wanted(plugin, rel, names, gen) {
  const dir = toDir(rel);
  const known = new Set([...names, ...Object.keys(gen)]);
  const stack = ownFiles(plugin, dir).flatMap((f) => specsOf(f).map((s) => coreName(path.dirname(f), s, dir, known))).filter(Boolean);
  const want = new Set();
  while (stack.length) {
    const n = stack.pop();
    if (want.has(n)) continue;
    want.add(n);
    if (n in gen) continue;
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

// Generated modules: name -> text. Each only when its source is in the repo (a tree without
// the icon folder or without the scanner has nothing of that kind to carry).
const GEN_SOURCE = { [ICONS_MODULE]: 'docs/zasoby/branding/ikony/', [SECRET_MODULE]: 'core/guardrails/secret-scan.js' };
function generated() {
  const gen = {};
  const icons = iconsModule();
  if (icons !== null) gen[ICONS_MODULE] = icons;
  if (fs.existsSync(SECRET_TOOL)) {
    const tool = require(SECRET_TOOL);
    if (fs.existsSync(tool.SOURCE)) gen[SECRET_MODULE] = tool.build();
  }
  return gen;
}

function checkOne(rel, want, names, gen) {
  const DST = toDir(rel);
  const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')).sort() : [];
  const problems = [];
  for (const n of want) {
    const dst = path.join(DST, n);
    if (n in gen) {
      if (!fs.existsSync(dst)) problems.push('brak ' + rel + '/' + n + ' (generowany z ' + GEN_SOURCE[n] + ')');
      else if (lf(fs.readFileSync(dst)) !== gen[n]) problems.push(rel + '/' + n + ' rozni sie od ' + GEN_SOURCE[n]);
    } else if (!fs.existsSync(dst)) problems.push('brak kopii ' + rel + '/' + n);
    else if (lf(fs.readFileSync(dst)) !== lf(fs.readFileSync(path.join(SRC, n)))) problems.push('kopia ' + rel + '/' + n + ' rozni sie od core/panel/' + n);
  }
  const known = new Set([...names, ...Object.keys(gen)]);
  for (const n of have) {
    if (want.includes(n)) continue;
    problems.push(known.has(n) ? 'kopia nadmiarowa ' + rel + '/' + n + ' - zaden plik modu jej nie importuje' : rel + '/' + n + ' nie ma zrodla w core/panel/');
  }
  return problems;
}

function check() {
  const names = sources();
  const gen = generated();
  const to = present();
  const copies = Object.fromEntries(to.map(([p, rel]) => [rel, wanted(p, rel, names, gen)]));
  const problems = to.flatMap(([, rel]) => checkOne(rel, copies[rel], names, gen));
  const iconCount = !(ICONS_MODULE in gen) ? 0 : fs.readdirSync(ICONS).filter((n) => n.endsWith('.svg')).length;
  return { files: names.length, icons: iconCount, dests: to.map(([, rel]) => rel), copies, problems };
}

function sync() {
  const names = sources();
  const gen = generated();
  const known = new Set([...names, ...Object.keys(gen)]);
  for (const [p, rel] of present()) {
    const DST = toDir(rel);
    const want = wanted(p, rel, names, gen);
    if (want.length) fs.mkdirSync(DST, { recursive: true });
    for (const n of want) {
      if (n in gen) fs.writeFileSync(path.join(DST, n), gen[n]);
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
