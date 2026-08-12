#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: walidator spojnosci rdzen <-> adaptery.
//
// Po co: ryzyko P4 planu ROZWOJ_PO_WYDANIU — dryf rdzenia i adapterow. Adapter potrafi
// odwolywac sie do pliku rdzenia, ktory zmienil nazwe, albo zostac na starym numerze
// wersji. Nic tego nie widzi, dopoki uzytkownik nie zobaczy pustej komendy.
//
// Uruchamiany RECZNIE, przed wydaniem:
//   node core/tools/validate-adapters.js
//
// Kod wyjscia: 0 = spojne, 1 = znaleziono bledy, 2 = nie da sie sprawdzic.
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');

const CORE = path.resolve(__dirname, '..');
const ROOT = path.resolve(CORE, '..');

const bledy = [];
const sprawdzone = [];

function jest(rel) {
  return fs.existsSync(path.resolve(ROOT, rel));
}

function czytajJson(rel) {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(ROOT, rel), 'utf8'));
  } catch (e) {
    bledy.push('nie moge odczytac ' + rel + ' (' + e.message + ')');
    return null;
  }
}

// 1) Manifest rdzenia: kazdy zadeklarowany plik istnieje.
const manifest = czytajJson('core/MANIFEST.json');
if (manifest) {
  const zRdzenia = (p) => path.relative(ROOT, path.resolve(CORE, p)).split(path.sep).join('/');
  const pliki = [manifest.templates]
    .concat((manifest.guardrails || []).map((g) => g.file))
    .concat((manifest.process || []).map((p) => p.file))
    .concat((manifest.tools || []).map((t) => t.file))
    .filter(Boolean);
  for (const p of pliki) {
    const rel = zRdzenia(p);
    if (!jest(rel)) bledy.push('MANIFEST rdzenia wskazuje "' + rel + '", a tego pliku nie ma');
  }
  sprawdzone.push('pliki rdzenia z MANIFEST.json: ' + pliki.length);

  // 2) Kazdy adapter: katalog, manifest i deklarowane pliki rdzenia.
  for (const a of (manifest.adapters || [])) {
    for (const [etykieta, wartosc] of [['root', a.root], ['manifest', a.manifest], ['entry', a.entry]]) {
      if (!wartosc) continue;
      const rel = zRdzenia(wartosc);
      if (!jest(rel)) bledy.push('adapter "' + a.id + '": ' + etykieta + ' wskazuje "' + rel + '", a tego nie ma');
    }
    for (const u of (a.uses || [])) {
      const rel = zRdzenia(u);
      if (!jest(rel)) bledy.push('adapter "' + a.id + '" uzywa "' + rel + '", a tego pliku rdzenia nie ma');
    }
    sprawdzone.push('adapter ' + a.id + ': ' + (a.uses || []).length + ' odwolan do rdzenia');
  }
}

// 2b) Odwolania w KODZIE adapterow do plikow rdzenia. MANIFEST mowi, czego adapter uzywa;
// ten krok sprawdza, czy tego samego uzywa realny require. Wzorzec wychwytuje ksztalt
// require(path.resolve(..., 'core', '<katalog>', '<plik>.js')) uzywany w obu adapterach.
function plikiJs(katalog, zebrane) {
  let wpisy = [];
  try { wpisy = fs.readdirSync(katalog, { withFileTypes: true }); } catch (_) { return zebrane; }
  for (const w of wpisy) {
    const p = path.join(katalog, w.name);
    if (w.isDirectory()) plikiJs(p, zebrane);
    else if (/\.js$/i.test(w.name)) zebrane.push(p);
  }
  return zebrane;
}

if (manifest) {
  const RE = /'core'\s*,\s*'([A-Za-z0-9_.-]+)'\s*,\s*'([A-Za-z0-9_.-]+\.js)'/g;
  let odwolan = 0;
  for (const a of (manifest.adapters || [])) {
    const rootAbs = path.resolve(CORE, a.root || '.');
    for (const plik of plikiJs(rootAbs, [])) {
      let txt = '';
      try { txt = fs.readFileSync(plik, 'utf8'); } catch (_) { continue; }
      let m;
      RE.lastIndex = 0;
      while ((m = RE.exec(txt)) !== null) {
        odwolan++;
        const rel = 'core/' + m[1] + '/' + m[2];
        if (!jest(rel)) {
          bledy.push('adapter "' + a.id + '": ' + path.relative(ROOT, plik).split(path.sep).join('/') +
            ' wola "' + rel + '", a tego pliku rdzenia nie ma');
        }
      }
    }
  }
  sprawdzone.push('odwolania z kodu adapterow do rdzenia: ' + odwolan);
}

// 3) Manifest pluginu Claude Code: kazda zadeklarowana sciezka istnieje.
const plugin = czytajJson('.claude-plugin/plugin.json');
if (plugin) {
  const sciezki = []
    .concat(plugin.skills || [])
    .concat(plugin.commands || [])
    .concat(plugin.hooks ? [plugin.hooks] : []);
  for (const s of sciezki) {
    if (!jest(s)) bledy.push('plugin.json deklaruje "' + s + '", a tego nie ma — runtime zglosi blad ladowania');
  }
  sprawdzone.push('sciezki z plugin.json: ' + sciezki.length);
}

// 4) hooks.json: kazde wywolanie ${CLAUDE_PLUGIN_ROOT}/... wskazuje istniejacy plik.
const hooksRel = (plugin && plugin.hooks) || 'adapters/claude-code/hooks/hooks.json';
let hooksTxt = '';
try { hooksTxt = fs.readFileSync(path.resolve(ROOT, hooksRel), 'utf8'); } catch (_) { /* punkt 3 juz to zglosil */ }
if (hooksTxt) {
  const odwolania = hooksTxt.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/[^"\\]+/g) || [];
  for (const o of odwolania) {
    const rel = o.replace('${CLAUDE_PLUGIN_ROOT}/', '');
    if (!jest(rel)) bledy.push('hooks.json wola "' + rel + '", a tego pliku nie ma');
  }
  sprawdzone.push('wywolania z hooks.json: ' + odwolania.length);
}

// 5) Zgodnosc numeru wersji po obu stronach granicy.
const marketplace = czytajJson('.claude-plugin/marketplace.json');
const wersje = [];
if (manifest) wersje.push(['core/MANIFEST.json', manifest.version]);
if (plugin) wersje.push(['.claude-plugin/plugin.json', plugin.version]);
if (marketplace && Array.isArray(marketplace.plugins)) {
  for (const p of marketplace.plugins) wersje.push(['.claude-plugin/marketplace.json (' + p.name + ')', p.version]);
}
const unikalne = Array.from(new Set(wersje.map((w) => w[1]).filter(Boolean)));
if (unikalne.length > 1) {
  bledy.push('wersje sie rozjechaly: ' + wersje.map((w) => w[0] + ' = ' + w[1]).join(', '));
}
sprawdzone.push('numery wersji: ' + wersje.length + ' zrodel, wartosc "' + (unikalne[0] || '?') + '"');

// --- wynik -----------------------------------------------------------------
if (bledy.length) {
  process.stderr.write('RelAI validate-adapters: ZNALEZIONO ' + bledy.length + ' problemow\n');
  for (const b of bledy) process.stderr.write('  - ' + b + '\n');
  process.exit(1);
}
process.stdout.write('RelAI validate-adapters: spojne.\n');
for (const s of sprawdzone) process.stdout.write('  + ' + s + '\n');
process.exit(0);
