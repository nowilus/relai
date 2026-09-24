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
const crypto = require('crypto');

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
    // Nazwy, nie sama liczba: dolozenie pliku rdzenia ma byc widoczne w wyjsciu, a nie
    // wylacznie w roznicy licznika (L-0058 — dowodzisz obecnosci nowej tresci).
    const nazwy = (a.uses || []).map((u) => u.replace(/\/$/, '').split('/').pop()).join(', ');
    sprawdzone.push('adapter ' + a.id + ': ' + (a.uses || []).length + ' odwolan do rdzenia (' + nazwy + ')');
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
  let nieopisanych = 0;
  for (const a of (manifest.adapters || [])) {
    const rootAbs = path.resolve(CORE, a.root || '.');
    // Deklaracja "uses" sprowadzona do sciezek od korzenia repozytorium. Katalog
    // ("./prompt/") pokrywa wszystko, co pod nim lezy; plik pokrywa sam siebie.
    const deklarowane = (a.uses || []).map((u) => 'core/' + String(u).replace(/^\.\//, ''));
    const opisany = (rel) => deklarowane.some((d) => (d.endsWith('/') ? rel.startsWith(d) : d === rel));
    const zgloszone = new Set();
    for (const plik of plikiJs(rootAbs, [])) {
      // Testy adaptera wolaja rdzen, zeby go SPRAWDZIC — to nie jest uzycie, ktore
      // manifest opisuje. Martwe odwolanie w tescie dalej jest bledem (krok wyzej).
      const wTestach = /(^|[\\/])tests?[\\/]/.test(path.relative(rootAbs, plik));
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
          continue;
        }
        // Sytuacja odwrotna do martwego odwolania i rownie cicha: modul rdzenia
        // DODANY i dzialajacy, ktorego MANIFEST nie wymienia w "uses" adaptera.
        // Nic tego nie widzi — az do dnia, w ktorym ktos zmieni rdzen, ufajac,
        // ze manifest mowi, kto go uzywa.
        if (!wTestach && !opisany(rel) && !zgloszone.has(plik + '|' + rel)) {
          zgloszone.add(plik + '|' + rel);
          nieopisanych++;
          bledy.push('adapter "' + a.id + '": ' + path.relative(ROOT, plik).split(path.sep).join('/') +
            ' wola "' + rel + '", a MANIFEST.json nie wymienia tego pliku w "uses" tego adaptera');
        }
      }
    }
  }
  sprawdzone.push('odwolania z kodu adapterow do rdzenia: ' + odwolan +
    ', nieopisanych w MANIFEST: ' + nieopisanych);

  // Adapter may consume core modules, but it must not carry a second manual
  // copy. Compare hashes of declared core JavaScript files with every adapter
  // JavaScript file so a copied module fails the release gate with its path.
  const coreHashes = new Map();
  const coreFiles = [manifest.templates]
    .concat((manifest.guardrails || []).map((g) => g.file))
    .concat((manifest.process || []).map((p) => p.file))
    .concat((manifest.tools || []).map((t) => t.file))
    .filter((p) => p && /\.js$/i.test(p));
  for (const rel of coreFiles) {
    const file = path.resolve(CORE, rel);
    try { coreHashes.set(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), path.relative(ROOT, file)); } catch (_) { /* missing files are reported above */ }
  }
  let duplicates = 0;
  for (const a of (manifest.adapters || [])) {
    for (const file of plikiJs(path.resolve(CORE, a.root || '.'), [])) {
      let hash = '';
      try { hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); } catch (_) { continue; }
      const source = coreHashes.get(hash);
      if (source) {
        duplicates++;
        bledy.push('adapter "' + a.id + '": ' + path.relative(ROOT, file).split(path.sep).join('/') +
          ' jest reczna kopia rdzenia "' + source + '" — adapter ma go wolac, nie kopiowac');
      }
    }
  }
  sprawdzone.push('duplikaty plikow rdzenia w adapterach: ' + duplicates);
}

// 3) Manifest pluginu Claude Code: kazda zadeklarowana sciezka istnieje.
const plugin = czytajJson('.claude-plugin/plugin.json');
if (plugin) {
  const sciezki = []
    .concat(plugin.skills || [])
    .concat(plugin.commands || [])
    .concat(plugin.agents || [])
    .concat(plugin.hooks ? [plugin.hooks] : []);
  for (const s of sciezki) {
    if (!jest(s)) bledy.push('plugin.json deklaruje "' + s + '", a tego nie ma — runtime zglosi blad ladowania');
  }
  // P-011: "agents" przyjmuje WYLACZNIE pliki .md, w odroznieniu od "commands" i "skills",
  // ktore biora katalogi. Katalog w tym polu wywraca CALY manifest ("agents: Invalid input"),
  // a wtedy plugin nie laduje ani jednej komendy — i nie mowi o tym w sesji ani slowa.
  for (const a of [].concat(plugin.agents || [])) {
    const rel = String(a).replace(/^\.\//, '');
    if (!a.endsWith('.md') || (jest(rel) && fs.statSync(path.join(ROOT, rel)).isDirectory())) {
      bledy.push('plugin.json: "agents" musi wymieniac pliki .md, a "' + a + '" nim nie jest (P-011) — '
        + 'katalog w tym polu uniewaznia caly manifest');
    }
  }
  // P-012: "description:" w naglowku komendy to niecytowany skalar YAML. Dwukropek ze spacja
  // w srodku czyni z niego mape i naglowek przestaje sie parsowac — komenda znika BEZ SLOWA,
  // reszta pluginu dziala dalej. Cudzyslow zdejmuje problem.
  const kmd = path.join(ROOT, 'adapters', 'claude-code', 'commands');
  let zleOpisy = 0;
  if (jest('adapters/claude-code/commands')) {
    for (const nazwa of fs.readdirSync(kmd).filter((n) => n.endsWith('.md'))) {
      const linie = fs.readFileSync(path.join(kmd, nazwa), 'utf8').split(/\r?\n/);
      for (const l of linie.slice(0, 6)) {
        const m = /^(description|argument-hint):\s+(.*)$/.exec(l);
        if (!m) continue;
        const wartosc = m[2].trim();
        const cytowana = /^".*"$/.test(wartosc) || /^'.*'$/.test(wartosc);
        if (!cytowana && wartosc.includes(': ')) {
          zleOpisy += 1;
          bledy.push('komenda "' + nazwa + '": pole ' + m[1] + ' ma dwukropek ze spacja bez cudzyslowu '
            + '(P-012) — naglowek YAML sie nie sparsuje i komenda zniknie bez komunikatu');
        }
      }
    }
  }
  sprawdzone.push('naglowki YAML komend: ' + fs.readdirSync(kmd).filter((n) => n.endsWith('.md')).length
    + ' sprawdzonych, ' + zleOpisy + ' wadliwych');
  sprawdzone.push('sciezki z plugin.json: ' + sciezki.length);
}

// 3b) Native Codex package: it is rooted in this repository, with skills
// generated from the Claude Code command source and lifecycle hooks discovered
// from adapters/codex/hooks/hooks.json.
const codexPlugin = czytajJson('.codex-plugin/plugin.json');
const codexMarketplace = czytajJson('.agents/plugins/marketplace.json');
if (codexPlugin) {
  if (!codexPlugin.skills || !jest(codexPlugin.skills.replace(/^\.\//, ''))) {
    bledy.push('Codex plugin.json nie wskazuje istniejacego katalogu skills');
  }
  // P-010: katalog "skills/" w korzeniu jest jednoczesnie korzeniem pluginu Claude Code, ktory
  // skanuje go niezaleznie od plugin.json i przy kolizji nazw KASUJE wlasne komendy. Skille
  // Codeksa maja te same nazwy co komendy, wiec korzen musi zostac pusty — inaczej /relai
  // przestaje podpowiadac cokolwiek, i to bez zadnego komunikatu w sesji.
  if (jest('skills')) {
    bledy.push('katalog "skills/" w korzeniu koliduje z komendami pluginu Claude Code (P-010) — '
      + 'skille Codeksa naleza do adapters/codex/skills');
  }
  if (!jest('hooks/hooks.json')) bledy.push('plugin Codex nie ma hooks/hooks.json');
  else {
    const codexHooks = czytajJson('hooks/hooks.json');
    const pre = codexHooks && codexHooks.hooks && codexHooks.hooks.PreToolUse;
    const handler = Array.isArray(pre) && pre[0] && Array.isArray(pre[0].hooks) && pre[0].hooks[0];
    if (!handler || !handler.commandWindows || !/secret-scanner\.sh/.test(handler.command || '') ||
        !jest('adapters/codex/hooks/secret-scanner.sh') || !jest('adapters/codex/hooks/secret-scanner.cmd')) {
      bledy.push('hooks/hooks.json nie ma kompletu command/commandWindows i wrapperow fail-closed');
    }
    // Korzeniowy "hooks/" jest katalogiem konwencyjnym takze dla Claude Code, wiec te hooki
    // laduja sie tam OBOK hookow zadeklarowanych w plugin.json: kontekst startu dubluje sie,
    // a SessionEnd Codeksa odpada na schemacie Claude Code. Kazdy skrypt wolany z korzenia
    // musi miec bramke hosta na zmiennej CLAUDECODE (P-013).
    let txt = '';
    try { txt = fs.readFileSync(path.resolve(ROOT, 'hooks/hooks.json'), 'utf8'); } catch (_) { /* zgloszone wyzej */ }
    const wolane = [...new Set((txt.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/[^"\\]+/g) || [])
      .map((o) => o.replace('${CLAUDE_PLUGIN_ROOT}/', '')))];
    let zBramka = 0;
    for (const rel of wolane) {
      if (!jest(rel)) continue;
      let kod = '';
      try { kod = fs.readFileSync(path.resolve(ROOT, rel), 'utf8'); } catch (_) { kod = ''; }
      if (/CLAUDECODE/.test(kod)) zBramka += 1;
      else {
        bledy.push('skrypt "' + rel + '" wolany z korzeniowego hooks/hooks.json nie ma bramki hosta '
          + 'na CLAUDECODE (P-013) — w Claude Code uruchomi sie obok hookow adaptera');
      }
    }
    if (wolane.length) sprawdzone.push('bramki hosta w hookach Codeksa: ' + zBramka + '/' + wolane.length);
  }
  try {
    const generator = require(path.join(ROOT, 'adapters', 'codex', 'generate-skills.js'));
    // A09 (E3 PROWADZENIE_END_TO_END): verify() porownuje KAZDY plik skilla — SKILL.md i pliki
    // doczytywane — i zglasza pliki osierocone; Cursor kopiuje te same pliki przy instalacji.
    const rozjazdy = generator.verify();
    for (const file of rozjazdy) bledy.push('wygenerowany skill Codeksa rozjechal sie ze zrodlem: ' + path.relative(ROOT, file));
    if (!rozjazdy.length) sprawdzone.push('parytet skilli Claude Code -> Codex: ' + generator.expected().length + ' plikow, 0 rozjazdow');
  } catch (e) {
    bledy.push('nie moge zweryfikowac generatora skilli Codeksa (' + e.message + ')');
  }
}
if (codexMarketplace) {
  const entry = Array.isArray(codexMarketplace.plugins) && codexMarketplace.plugins.find((item) => item.name === 'relai');
  if (!entry) bledy.push('marketplace Codeksa nie ma wpisu relai');
  else {
    if (!entry.source || entry.source.source !== 'local' || entry.source.path !== './') {
      bledy.push('marketplace Codeksa musi wskazywac lokalny korzen repozytorium przez source.path "./"');
    }
    if (!entry.policy || entry.policy.installation !== 'AVAILABLE' || entry.policy.authentication !== 'ON_INSTALL') {
      bledy.push('marketplace Codeksa musi deklarowac policy AVAILABLE/ON_INSTALL');
    }
  }
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
if (codexPlugin) wersje.push(['.codex-plugin/plugin.json', codexPlugin.version]);
if (marketplace && Array.isArray(marketplace.plugins)) {
  for (const p of marketplace.plugins) wersje.push(['.claude-plugin/marketplace.json (' + p.name + ')', p.version]);
}
if (codexMarketplace && Array.isArray(codexMarketplace.plugins)) {
  for (const p of codexMarketplace.plugins) wersje.push(['.agents/plugins/marketplace.json (' + p.name + ')', p.version]);
}
// 5b) Wersja w dokumentach czytanych przez ludzi (od 2.3.1, pozycja A02+A18): baner README
// i pierwszy numer wersji w sekcji "Gdzie jestesmy" STATE.md. Manifesty rozjezdzaly sie
// z nimi po cichu — README stal na 2.1.4, a STATE na 2.2.0 przy wydanym 2.3.0. Brak banera
// albo sekcji to blad, nie cisza: kontrola, ktora nie znalazla, czego pilnuje, nie sprawdza.
const WERSJA = /\b(\d+\.\d+\.\d+)\b/;
function wersjaZDokumentu(rel, wycinek) {
  let txt = '';
  try { txt = fs.readFileSync(path.resolve(ROOT, rel), 'utf8').replace(/\r\n/g, '\n'); } catch (e) {
    bledy.push('nie moge odczytac ' + rel + ' (' + e.message + ')');
    return;
  }
  const fragment = wycinek(txt);
  const m = fragment === null ? null : WERSJA.exec(fragment);
  if (!m) {
    bledy.push(rel + ': nie znaleziono numeru wersji tam, gdzie powinien stac');
    return;
  }
  wersje.push([rel, m[1]]);
}
wersjaZDokumentu('README.md', (txt) => {
  const m = /<em>Wersja (\d+\.\d+\.\d+)/.exec(txt);
  return m ? m[1] : null;
});
wersjaZDokumentu('docs/STATE.md', (txt) => {
  const start = txt.search(/^## Gdzie jeste[śs]my\s*$/m);
  if (start < 0) return null;
  const reszta = txt.slice(start).split('\n').slice(1).join('\n');
  const koniec = reszta.search(/^## /m);
  return koniec < 0 ? reszta : reszta.slice(0, koniec);
});

const unikalne = Array.from(new Set(wersje.map((w) => w[1]).filter(Boolean)));
if (unikalne.length > 1) {
  bledy.push('wersje sie rozjechaly: ' + wersje.map((w) => w[0] + ' = ' + w[1]).join(', '));
}
sprawdzone.push('numery wersji: ' + wersje.length + ' zrodel, wartosc "' + (unikalne[0] || '?') + '"');

// 6) Listy modeli adapterow: deklaracja "models" wskazuje istniejacy plik, a plik niesie
// czytelna linie "list-date: RRRR-MM-DD". Bez tego sprawdzenia deklaracja moze wskazywac
// plik, ktorego nie ma, albo liste bez daty — a wtedy prog swiezosci milczy i nikt tego nie
// widzi (cisza mechanizmu wyglada dokladnie tak samo jak zgodnosc).
if (manifest) {
  const zRdzenia = (p) => path.relative(ROOT, path.resolve(CORE, p)).split(path.sep).join('/');
  let list = 0;
  let pozycjiZRodzina = 0;
  const RODZINY_LIST = ['claude', 'openai', 'xai', 'cursor', '-'];
  for (const a of (manifest.adapters || [])) {
    if (!a.models) continue;
    list++;
    const rel = zRdzenia(a.models);
    if (!jest(rel)) {
      bledy.push('adapter "' + a.id + '": deklaracja models wskazuje "' + rel + '", a tego pliku nie ma');
      continue;
    }
    let txt = '';
    try { txt = fs.readFileSync(path.resolve(ROOT, rel), 'utf8'); } catch (e) {
      bledy.push('adapter "' + a.id + '": nie moge odczytac "' + rel + '" (' + e.message + ')');
      continue;
    }
    if (!/^list-date:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(txt)) {
      bledy.push('adapter "' + a.id + '": lista modeli "' + rel + '" nie ma czytelnej linii "list-date: RRRR-MM-DD"');
    }
    // Pole family (2.6.0): optymalizator wybiera po nim nakladke rodziny, wiec pozycja bez pola
    // albo z brzmieniem spoza listy dostalaby po cichu sam rdzen. Kontrola "ile pozycji" stoi
    // obok, bo lista bez ani jednej pozycji przeszlaby te petle zielono (zasada 5).
    const pozycje = txt.split(/\r?\n/).filter((l) => /^(?:strong|balanced|cheap):/.test(l));
    if (!pozycje.length) {
      bledy.push('adapter "' + a.id + '": lista modeli "' + rel + '" nie ma ani jednej pozycji klasy');
    }
    for (const l of pozycje) {
      const m = /\|\s*family:\s*([^|\s]+)\s*(?:\||$)/.exec(l);
      if (!m) {
        bledy.push('adapter "' + a.id + '": pozycja bez pola family w "' + rel + '": ' + l.split('|')[0].trim());
      } else if (!RODZINY_LIST.includes(m[1])) {
        bledy.push('adapter "' + a.id + '": family "' + m[1] + '" spoza zamknietej listy (' +
          RODZINY_LIST.join(', ') + ') w "' + rel + '"');
      } else {
        pozycjiZRodzina++;
      }
    }
  }
  sprawdzone.push('listy modeli adapterow: ' + list + ', pozycji z polem family: ' + pozycjiZRodzina);
}

// 7) Baza regul optymalizatora NIE nosi nazw modeli (ryzyko O5 planu OPTYMALIZATOR_PROMPTOW).
// Technika promptowania zmienia sie wolno i mieszka w pluginie; czesc zalezna od modelu czyta
// MODELE-<narzedzie>.md, ktory ma wlasny prog wieku i komende odswiezajaca. Nazwa modelu wpisana
// do regul starzeje sie po cichu — plik nie ma daty, wiec nic o jej wieku nie powie.
if (manifest) {
  // Zamknieta lista rdzeni nazw rodzin, nie pelnych identyfikatorow: "Sonnet 5" zestarzeje sie
  // tak samo jak "claude-sonnet-5", a oba brzmienia sa w listach modeli obu narzedzi.
  const RODZINY = /\b(opus|sonnet|haiku|fable|gpt-\d|claude-[a-z]+-\d|gemini|grok|terra|composer|o\d-mini)\b/i;
  const katalog = path.resolve(CORE, 'prompt');
  let plikow = 0;
  let trafien = 0;
  let wpisy = [];
  try { wpisy = fs.readdirSync(katalog).filter((n) => /\.md$/i.test(n)); } catch (_) { wpisy = []; }
  for (const nazwa of wpisy) {
    plikow++;
    let linie = [];
    try { linie = fs.readFileSync(path.join(katalog, nazwa), 'utf8').split(/\r?\n/); } catch (e) {
      bledy.push('nie moge odczytac bazy regul "core/prompt/' + nazwa + '" (' + e.message + ')');
      continue;
    }
    for (let i = 0; i < linie.length; i++) {
      const m = RODZINY.exec(linie[i]);
      if (!m) continue;
      trafien++;
      bledy.push('baza regul "core/prompt/' + nazwa + '" linia ' + (i + 1) + ': nazwa modelu "' + m[1] +
        '" (O5) — czesc zalezna od modelu czyta MODELE-<narzedzie>.md, nie reguly');
    }
  }
  sprawdzone.push('baza regul bez nazw modeli: ' + plikow + ' plikow, ' + trafien + ' trafien');
}

// 8) Nakladki rodzin modeli (2.6.0, ryzyko K3 planu PROWADZENIE_END_TO_END): kazda regula
// (naglowek "### ") ma co najmniej jedna linie "Zrodlo: https://... · odczyt RRRR-MM-DD",
// a plik — czytelna linie "overlay-date", z ktorej hook liczy wiek. Regula bez zrodla jest
// zgadywaniem, a nakladka bez daty starzeje sie po cichu. Obie liczby stoja w komunikacie,
// bo "0 regul, 0 ze zrodlem" tez jest zgodnoscia (zasada 5).
{
  const katalog = path.resolve(CORE, 'prompt', 'rodziny');
  const ZRODLO_REGULY = /^Źródło:\s*https:\/\/\S+\s*·\s*odczyt\s+\d{4}-\d{2}-\d{2}\s*$/;
  let plikow = 0;
  let regul = 0;
  let zeZrodlem = 0;
  let wpisy = [];
  try { wpisy = fs.readdirSync(katalog).filter((n) => /\.md$/i.test(n)); } catch (_) { wpisy = []; }
  for (const nazwa of wpisy) {
    plikow++;
    const rel = 'core/prompt/rodziny/' + nazwa;
    const linie = fs.readFileSync(path.join(katalog, nazwa), 'utf8').split(/\r?\n/);
    if (!linie.some((l) => /^overlay-date:\s*\d{4}-\d{2}-\d{2}\s*$/.test(l))) {
      bledy.push('nakladka "' + rel + '" nie ma czytelnej linii "overlay-date: RRRR-MM-DD"');
    }
    let biezaca = null;
    let maZrodlo = false;
    const zamknij = () => {
      if (biezaca === null) return;
      regul++;
      if (maZrodlo) zeZrodlem++;
      else bledy.push('nakladka "' + rel + '": regula "' + biezaca + '" bez linii zrodla z data odczytu');
    };
    for (const l of linie) {
      if (/^#{1,3} /.test(l)) {
        zamknij();
        biezaca = /^### /.test(l) ? l.slice(4).trim() : null;
        maZrodlo = false;
      } else if (biezaca !== null && ZRODLO_REGULY.test(l.trim())) {
        maZrodlo = true;
      }
    }
    zamknij();
  }
  sprawdzone.push('nakladki rodzin: ' + plikow + ' plikow, ' + regul + ' regul, ' + zeZrodlem + ' ze zrodlem i data');
}

// --- wynik -----------------------------------------------------------------
if (bledy.length) {
  process.stderr.write('RelAI validate-adapters: ZNALEZIONO ' + bledy.length + ' problemow\n');
  for (const b of bledy) process.stderr.write('  - ' + b + '\n');
  process.exit(1);
}
process.stdout.write('RelAI validate-adapters: spojne.\n');
for (const s of sprawdzone) process.stdout.write('  + ' + s + '\n');
process.exit(0);
