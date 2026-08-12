#!/usr/bin/env node
'use strict';
// RelAI hook (adapter Cursor): session-context — CICHY. Odpowiednik hooka SessionStart
// z adaptera Claude Code, w protokole Cursora (zdarzenie `sessionStart`).
//
// Co robi w projekcie RelAI: wstrzykuje date dnia, kontrole wersji, wymuszenie rytualu
// startu, siatke brakujacych promptow etapowych (D-34), sygnal rozjazdu stanu, sygnal
// nieznanego autora (D-27), tresc ustawien globalnych (D-23) oraz kopiuje specyfikacje
// dokumentow do .claude/relai/templates/ w projekcie (R8, L-0012).
//
// Wszystkie ROZPOZNANIA pochodza z rdzenia (core/process/session-signals.js) — ten plik
// zna wylacznie protokol Cursora. Zero kopiowania logiki miedzy adapterami (P4).
//
// Zmierzone na Cursorze 2026-08-12 (E5, cursor-agent 2026.08.11-e8db854):
//   * payload sessionStart: conversation_id, session_id, model, is_background_agent,
//     workspace_roots[], user_email, cursor_version, transcript_path — POLA cwd NIE MA,
//   * odpowiedz { "continue": true, "additional_context": "..." } realnie dociera do modelu,
//   * stdin przychodzi na Windows z BOM (bywa podwojnym) — trzeba go zdjac przed JSON.parse.
//
// Katalog cache specyfikacji jest CELOWO ten sam co w Claude Code (.claude/relai/templates/):
// komendy i skille sa wspoldzielone miedzy adapterami i mowia o jednej sciezce.
//
// Komunikaty celowo bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const CORE_TEMPLATES = path.join(REPO_ROOT, 'core', 'templates');

let core;
try {
  core = require(path.join(REPO_ROOT, 'core', 'process', 'session-signals.js'));
} catch (_) {
  process.exit(0);
}

// Tryb goscia deklarowany w dowolnym z dwoch narzedzi obowiazuje w obu.
const MARKERY_GOSCIA = ['.cursor/relai.json', '.claude/relai.json'];

function workingDir(input) {
  if (typeof input.cwd === 'string' && input.cwd) return input.cwd;
  const roots = Array.isArray(input.workspace_roots) ? input.workspace_roots : [];
  for (const r of roots) {
    if (typeof r === 'string' && r) return r;
  }
  return process.cwd();
}

function adapterVersion() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'core', 'MANIFEST.json'), 'utf8'));
    return String(j.version || '');
  } catch (_) {
    return '';
  }
}

function onSessionStart(input) {
  const cwd = workingDir(input);
  const markerFile = core.relaiMarkerFile(cwd, MARKERY_GOSCIA);
  if (!markerFile) return process.exit(0);

  const out = [];
  out.push('[RelAI session-context]');
  out.push('Data dzisiejsza: ' + core.todayLocal() + '. Daty do wpisow bierz stad, nie z pamieci modelu.');

  const pv = core.projectVersion(markerFile);
  const av = adapterVersion();
  if (pv && av && pv !== av) {
    out.push('Wersja RelAI projektu (' + pv + ') rozni sie od wersji adaptera (' + av +
      '). Zglos to uzytkownikowi jednym zdaniem i wskaz komende /relai-update — pokaze roznice ' +
      'i zaktualizuje projekt za zgoda, szanujac lokalne nadpisania. Nie migruj projektu recznie.');
  }

  const gap = core.promptGap(cwd);
  if (gap) {
    out.push('ZADANIE PIERWSZE (siatka D-34). Etap ' + gap.stage + ' w ' + gap.statusFile +
      ' ma status GOTOWY DO STARTU, ale jego prompt etapowy nie istnieje. Pierwsze zdanie Twojej ' +
      'odpowiedzi — jeszcze PRZED akapitem "gdzie jestesmy" — mowi o tej luce i proponuje ' +
      'dogenerowanie promptu. Nie generuj go bez zgody.');
  }

  const rozjazd = core.stateDrift(cwd);
  if (rozjazd) {
    out.push('ZADANIE PIERWSZE (rozjazd stanu). Dokumenty tego projektu mowia rozne rzeczy: ' +
      rozjazd.join('; ') + '. Zglos to uzytkownikowi JEDNYM zdaniem przed akapitem "gdzie jestesmy" ' +
      'i zapytaj, ktory zapis jest prawdziwy — nie prostuj zadnego dokumentu na wlasna reke, bo nie ' +
      'wiesz, czy etap trwa, czy sie urwal. To jedyne miejsce, w ktorym ten sygnal pada.');
  }

  const obcy = core.unknownAuthor(cwd);
  if (obcy) {
    out.push('ZADANIE PIERWSZE (nieznany autor, D-27). git user.name to "' + obcy.ja + '", a zaden z ' +
      obcy.wpisow + ' podpisow w dzienniku go nie zawiera (ostatni: "' + obcy.ostatni + '") — to cudzy ' +
      'projekt. Pierwsze zdanie Twojej odpowiedzi mowi, ze wpisy podpisal kto inny, i proponuje ' +
      'wycieczke po projekcie (stan, mapa dokumentow, plany, ryzyka, od czego zaczac). Potem CZEKASZ ' +
      'na zgode: wycieczki nie uruchamiasz sam. Po zgodzie wykonujesz procedure komendy /relai-tour. ' +
      'Odmowa zamyka temat na te sesje.');
  }

  out.push('Ten folder to projekt RelAI. Zanim odpowiesz merytorycznie, wykonaj rytual startu sesji: ' +
    'przeczytaj CLAUDE.md (albo AGENTS.md), docs/STATE.md (jesli istnieje), docs/DZIENNIK.md ' +
    '(sekcja ryzyk + ostatni wpis), docs/LEKCJE.md (tylko "Zasady aktywne"), docs/USTAWIENIA.md oraz ' +
    'STATUS.md aktywnego planu; potem napisz akapit "gdzie jestesmy". Reguly procesu masz w regulach ' +
    'projektu (.cursor/rules/relai-*.mdc) — one obowiazuja niezaleznie od tego komunikatu.');

  const copied = core.provisionTemplates(cwd, { coreTemplates: CORE_TEMPLATES, destRel: '.claude/relai' });
  if (copied > 0) {
    out.push('Specyfikacje dokumentow RelAI sa skopiowane lokalnie do .claude/relai/templates/ (' + copied +
      ' plikow). Czytaj je stamtad — katalog adaptera moze byc poza katalogiem roboczym.');
  }

  const gs = core.globalSettingsText('.claude/relai');
  if (gs) {
    out.push('Ustawienia globalne uzytkownika (' + gs.file + '; wpis projektowy w docs/USTAWIENIA.md ma pierwszenstwo):\n' + gs.text);
  }

  process.stdout.write(JSON.stringify({ continue: true, additional_context: out.join('\n') }));
  process.exit(0);
}

function stripBom(s) {
  return String(s || '').replace(/^﻿+/, '');
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(stripBom(raw) || '{}');
    const event = String(input.hook_event_name || 'sessionStart');
    if (event !== 'sessionStart') return process.exit(0);
    return onSessionStart(input);
  } catch (_) {
    process.exit(0);
  }
});
