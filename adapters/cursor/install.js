#!/usr/bin/env node
'use strict';
// RelAI / adapter Cursor: instalator.
//
//   node adapters/cursor/install.js <katalog-projektu>
//   node adapters/cursor/install.js <katalog-projektu> --bez-skanu
//   node adapters/cursor/install.js <katalog-projektu> --uninstall
//
// Co robi instalacja (kolejnosc jest tresciwa, nie kosmetyczna):
//   1) reguly zawsze-w-kontekscie  -> <projekt>/.cursor/rules/relai-*.mdc
//   2) komendy /relai-*            -> <projekt>/.cursor/commands/*.md   (z adaptera Claude Code)
//   3) skille relai-core/planning  -> <projekt>/.cursor/skills/<nazwa>/SKILL.md
//   4) specyfikacje dokumentow     -> <projekt>/.claude/relai/templates/  (R8; ta sama sciezka
//                                     co w Claude Code, bo komendy i skille mowia o jednej)
//   5) hooki                       -> wpisy w <projekt>/.cursor/hooks.json wskazujace pliki
//                                     TEGO repozytorium (adapter nie jest kopiowany)
//
// Komendy i skille sa KOPIOWANE z adaptera Claude Code, a nie pisane drugi raz: jedno zrodlo
// w repozytorium, kopia w projekcie. Rdzen (core/) nie jest kopiowany nigdy — hooki wolaja go
// z miejsca instalacji adaptera.
//
// Instalacja zapisuje manifest <projekt>/.cursor/relai-install.json: co zostalo polozone i z
// jakiej wersji. Deinstalacja usuwa dokladnie to i nic wiecej — plikow projektu nie rusza.
//
// Kod wyjscia: 0 = zrobione, 1 = nic nie zrobiono (blad), 2 = zle uzycie.
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');

const ADAPTER = __dirname;
const REPO_ROOT = path.resolve(ADAPTER, '..', '..');
const MANIFEST_NAME = 'relai-install.json';

function wersja() {
  try {
    return String(JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'core', 'MANIFEST.json'), 'utf8')).version || '');
  } catch (_) {
    return '';
  }
}

function uzycie(msg) {
  process.stderr.write('RelAI install (Cursor): ' + msg + '\n');
  process.stderr.write('Uzycie: node adapters/cursor/install.js <katalog-projektu> [--bez-skanu] [--uninstall]\n');
  process.stderr.write('  --bez-skanu  swiadomie pomija hook skanu sekretow (projekt bez Node.js)\n');
  process.exit(2);
}

function kopiuj(src, dest, zapisane) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  zapisane.push(dest);
}

function pliki(dir, filtr) {
  try {
    return fs.readdirSync(dir).filter((f) => filtr.test(f)).map((f) => path.join(dir, f));
  } catch (_) {
    return [];
  }
}

// --- hooks.json -------------------------------------------------------------
// Wpisy RelAI sa oznaczone description zaczynajacym sie od "RelAI:", zeby deinstalacja
// wiedziala, co jest nasze, i zeby cudzy hook przezyl obie operacje.
// Skan sekretow jest wolany przez OPAKOWANIE powloki, nie wprost przez "node". Powod jest
// zmierzony: hook, ktorego nie da sie uruchomic (brak Node.js w PATH), Cursor ignoruje po cichu
// i zapis przechodzi. Opakowanie uruchamia sie zawsze i przy braku interpretera konczy kodem 2,
// czyli blokada z komunikatem. Kontekst startu sesji zostaje przy zwyklym "node" swiadomie:
// jego brak nie jest kwestia bezpieczenstwa, a blokowanie startu sesji byloby gorsze od ciszy.
function wpisyRelAI(bezSkanu) {
  const opakowanie = process.platform === 'win32' ? 'secret-scanner.cmd' : 'secret-scanner.sh';
  const scan = path.join(ADAPTER, 'hooks', opakowanie).split(path.sep).join('/');
  const ctx = path.join(ADAPTER, 'hooks', 'session-context.js').split(path.sep).join('/');
  const wpisy = {
    sessionStart: [{
      command: 'node "' + ctx + '"',
      event: 'sessionStart',
      description: 'RelAI: kontekst startu sesji, specyfikacje, sygnaly (D-34, D-27, rozjazd stanu)',
    }],
  };
  if (!bezSkanu) {
    wpisy.preToolUse = [{
      command: '"' + scan + '"',
      event: 'preToolUse',
      description: 'RelAI: skan sekretow, blokuje zapis do pliku sledzonego (D-41, D-42)',
    }];
  }
  return wpisy;
}

function czyNasz(wpis) {
  return !!wpis && typeof wpis.description === 'string' && /^RelAI:/.test(wpis.description);
}

function zapiszHooks(projekt, tryb, zapisane, bezSkanu) {
  const p = path.join(projekt, '.cursor', 'hooks.json');
  let cfg = { version: 1, hooks: {} };
  let istnial = false;
  if (fs.existsSync(p)) {
    istnial = true;
    try {
      cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      process.stderr.write('RelAI install: ' + p + ' jest nieczytelny (' + e.message +
        ') — hookow nie ruszam, zeby nie skasowac cudzej konfiguracji.\n');
      return { zmienione: false, istnial: true };
    }
  }
  if (!cfg.hooks || typeof cfg.hooks !== 'object') cfg.hooks = {};
  if (!cfg.version) cfg.version = 1;

  // Nasze wpisy zawsze najpierw usuwamy — instalacja jest idempotentna.
  for (const zdarzenie of Object.keys(cfg.hooks)) {
    if (!Array.isArray(cfg.hooks[zdarzenie])) continue;
    cfg.hooks[zdarzenie] = cfg.hooks[zdarzenie].filter((w) => !czyNasz(w));
    if (!cfg.hooks[zdarzenie].length) delete cfg.hooks[zdarzenie];
  }

  if (tryb === 'install') {
    const nasze = wpisyRelAI(bezSkanu);
    for (const [zdarzenie, wpisy] of Object.entries(nasze)) {
      cfg.hooks[zdarzenie] = (cfg.hooks[zdarzenie] || []).concat(wpisy);
    }
  }

  const pustka = Object.keys(cfg.hooks).length === 0;
  if (tryb === 'uninstall' && pustka && !istnialCudzy(cfg)) {
    try { fs.unlinkSync(p); } catch (_) { /* cisza */ }
    return { zmienione: true, istnial };
  }

  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  if (tryb === 'install' && !istnial) zapisane.push(p);
  return { zmienione: true, istnial };
}

function istnialCudzy(cfg) {
  for (const wpisy of Object.values(cfg.hooks || {})) {
    if (Array.isArray(wpisy) && wpisy.some((w) => !czyNasz(w))) return true;
  }
  return false;
}

// --- instalacja -------------------------------------------------------------
function install(projekt, bezSkanu) {
  const zapisane = [];

  for (const src of pliki(path.join(ADAPTER, 'rules'), /\.mdc$/i)) {
    kopiuj(src, path.join(projekt, '.cursor', 'rules', path.basename(src)), zapisane);
  }

  const komendy = pliki(path.join(REPO_ROOT, 'adapters', 'claude-code', 'commands'), /\.md$/i);
  for (const src of komendy) {
    kopiuj(src, path.join(projekt, '.cursor', 'commands', path.basename(src)), zapisane);
  }

  const skillsRoot = path.join(REPO_ROOT, 'adapters', 'claude-code', 'skills');
  let skille = [];
  try { skille = fs.readdirSync(skillsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch (_) { skille = []; }
  for (const d of skille) {
    const src = path.join(skillsRoot, d.name, 'SKILL.md');
    if (!fs.existsSync(src)) continue;
    kopiuj(src, path.join(projekt, '.cursor', 'skills', d.name, 'SKILL.md'), zapisane);
  }

  let templates = 0;
  try {
    const core = require(path.join(REPO_ROOT, 'core', 'process', 'session-signals.js'));
    templates = core.provisionTemplates(projekt, {
      coreTemplates: path.join(REPO_ROOT, 'core', 'templates'),
      destRel: '.claude/relai',
    });
  } catch (_) { templates = 0; }

  const hooki = zapiszHooks(projekt, 'install', zapisane, bezSkanu);

  const manifest = {
    adapter: 'cursor',
    version: wersja(),
    installedFrom: REPO_ROOT.split(path.sep).join('/'),
    files: zapisane.map((p) => path.relative(projekt, p).split(path.sep).join('/')),
    hooks: Object.keys(wpisyRelAI(bezSkanu)),
  };
  const manifestPath = path.join(projekt, '.cursor', MANIFEST_NAME);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  process.stdout.write('RelAI adapter Cursor zainstalowany w ' + projekt + '\n');
  process.stdout.write('  + reguly zawsze-w-kontekscie: ' + pliki(path.join(ADAPTER, 'rules'), /\.mdc$/i).length + '\n');
  process.stdout.write('  + komendy /relai-*: ' + komendy.length + '\n');
  process.stdout.write('  + skille: ' + skille.length + '\n');
  // Licznik obejmuje pliki, nie same specyfikacje: 20 plikow SPEC_*.md + szablon planu HTML.
  // Etykieta "specyfikacje: 30" wprowadzala w blad (pilotaz E6, 2026-08-17).
  process.stdout.write('  + pliki specyfikacji i szablonow w .claude/relai/templates/: ' + templates + '\n');
  process.stdout.write('  + hooki w .cursor/hooks.json: ' +
    (hooki.zmienione ? Object.keys(wpisyRelAI(bezSkanu)).join(', ') : 'NIE ZAPISANE') + '\n');
  if (!hooki.zmienione) {
    process.stdout.write('    (guardraile nie dzialaja — popraw .cursor/hooks.json i uruchom instalator ponownie)\n');
  }
  process.stdout.write('Uwaga: hooki wolaja pliki z ' + REPO_ROOT.split(path.sep).join('/') +
    ' — przeniesienie tego katalogu wymaga ponownej instalacji.\n');
  if (bezSkanu) {
    process.stdout.write('UWAGA: skan sekretow zostal SWIADOMIE pominiety (--bez-skanu). Twarda blokada ' +
      'zapisu sekretu w tym projekcie NIE dziala; zostaje regula .cursor/rules/relai-guardrails.mdc ' +
      'i gitowy pre-commit: node core/guardrails/install-precommit.js <projekt>\n');
  } else {
    process.stdout.write('Uwaga (zmierzone 2026-08-12): hook skanu jest wolany przez opakowanie powloki, ' +
      'zeby brak Node.js nie zniknal po cichu — bez interpretera opakowanie konczy sie kodem 2, czyli ' +
      'KAZDY zapis pliku jest blokowany z komunikatem. Projekt bez Node.js instaluj z --bez-skanu ' +
      '(swiadoma rezygnacja) albo wskaz interpreter zmienna RELAI_NODE.\n');
  }
  return 0;
}

function uninstall(projekt) {
  const manifestPath = path.join(projekt, '.cursor', MANIFEST_NAME);
  let manifest = null;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) { manifest = null; }
  if (!manifest) {
    process.stderr.write('RelAI install: nie widze ' + manifestPath + ' — nie wiem, co bylo instalowane, ' +
      'wiec nie usuwam niczego. Skasuj pliki recznie albo zainstaluj adapter ponownie.\n');
    return 1;
  }

  let usuniete = 0;
  for (const rel of (manifest.files || [])) {
    const p = path.join(projekt, ...rel.split('/'));
    try { fs.unlinkSync(p); usuniete++; } catch (_) { /* juz go nie ma */ }
  }
  // Puste katalogi po naszych plikach — tylko nasze, tylko gdy puste.
  for (const rel of ['.cursor/skills', '.cursor/commands', '.cursor/rules']) {
    const p = path.join(projekt, ...rel.split('/'));
    try {
      for (const d of fs.readdirSync(p, { withFileTypes: true })) {
        if (d.isDirectory()) { try { fs.rmdirSync(path.join(p, d.name)); } catch (_) { /* niepuste */ } }
      }
      fs.rmdirSync(p);
    } catch (_) { /* niepuste albo go nie ma */ }
  }

  zapiszHooks(projekt, 'uninstall', []);
  try { fs.unlinkSync(manifestPath); } catch (_) { /* cisza */ }

  process.stdout.write('RelAI adapter Cursor odinstalowany z ' + projekt + ' (usuniete pliki: ' + usuniete + ').\n');
  process.stdout.write('Dokumenty projektu (docs/, CLAUDE.md) i cache .claude/relai/ zostaly nietkniete.\n');
  return 0;
}

const args = process.argv.slice(2);
const cel = args.find((a) => !a.startsWith('--'));
if (!cel) uzycie('podaj katalog projektu');
const projekt = path.resolve(cel);
if (!fs.existsSync(projekt) || !fs.statSync(projekt).isDirectory()) uzycie('to nie jest katalog: ' + projekt);

process.exit(args.includes('--uninstall') ? uninstall(projekt) : install(projekt, args.includes('--bez-skanu')));
