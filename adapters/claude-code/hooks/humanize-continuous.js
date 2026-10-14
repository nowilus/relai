#!/usr/bin/env node
'use strict';
// RelAI hook: humanize-continuous — tryb ciagly humanizacji (plan HUMANIZACJA, E3), CICHY.
//
// Dwa zdarzenia, jeden plik:
//   UserPromptSubmit — nowa tura (stan "raz na plik" tej sesji znika; "tak", krotkie
//                      potwierdzenie i powiadomienie systemowe tury nie zaczynaja) i, przy
//                      zakresach `czat` / `zewnętrzne`, regula przed odpowiedzia;
//   PostToolUse      — po zapisie dokumentu w docs/ przy zakresie `dokumenty`: regula
//                      "popraw proze tego pliku", raz na plik w turze.
//
// Warunki ciszy (kod 0, zero bajtow): nie projekt RelAI, tryb goscia, wiersz
// `Humanizacja` nieobecny / `wyłączona` / spoza listy, zakres nie obejmuje zdarzenia,
// plik z listy wylaczen (H3), kolejny zapis tego samego pliku w turze.
//
// Z optymalizatorem (H6): w hooks.json ten hook stoi PO prompt-mode i w pomiarze E3 jego
// kontekst trafil do transkryptu po regule optymalizatora — ale kolejnosc wykonania hookow
// jednej grupy nie jest gwarantowana, wiec poprawnosc nie moze od niej zalezec. Regula sama
// mowi, ze propozycja i oryginal z /relai-prompt nie sa humanizowane.
//
// Logike niesie rdzen (core/process/humanize-continuous.js); tutaj protokol Claude Code.

const os = require('os');
const path = require('path');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');

let core;
let tryb;
try {
  core = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-signals.js'));
  tryb = require(path.join(PLUGIN_ROOT, 'core', 'process', 'humanize-continuous.js'));
} catch (_) {
  process.exit(0);
}

const MARKERY_GOSCIA = ['.claude/relai.json'];
const NARZEDZIA_ZAPISU = new Set(['Write', 'Edit', 'MultiEdit']);

function wypisz(zdarzenie, tresc) {
  if (tresc) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: zdarzenie, additionalContext: tresc },
    }));
  }
  process.exit(0);
}

function przedOdpowiedzia(input, cwd, opcje) {
  if (tryb.zaczynaTure(input.prompt)) tryb.nowaTura(cwd, input.session_id);
  if (!tryb.wymagaReguly(input.prompt)) return '';
  const w = tryb.wlaczone(opcje);
  if (!w) return '';
  return tryb.regulaPrzedOdpowiedzia(w, { profil: tryb.sciezkaProfilu(cwd, opcje.home) });
}

function poZapisie(input, cwd, opcje) {
  if (!NARZEDZIA_ZAPISU.has(String(input.tool_name || ''))) return '';
  const w = tryb.wlaczone(opcje);
  if (!w || !tryb.maZakres(w, 'dokumenty')) return '';
  const rel = tryb.sciezkaWzgledna(cwd, (input.tool_input || {}).file_path);
  if (tryb.powodPominieciaPliku(rel, cwd) !== null) return '';
  if (!tryb.pierwszyZapisWTurze(cwd, input.session_id, rel)) return '';
  return tryb.regulaPoZapisie(rel, w, { profil: tryb.sciezkaProfilu(cwd, opcje.home) });
}

function main(input) {
  const zdarzenie = String(input.hook_event_name || '');
  if (zdarzenie !== 'UserPromptSubmit' && zdarzenie !== 'PostToolUse') return process.exit(0);
  const cwd = input.cwd || process.cwd();
  if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) return process.exit(0);
  const opcje = { cwd, home: os.homedir(), sesja: input.session_id };
  const tresc = zdarzenie === 'UserPromptSubmit' ? przedOdpowiedzia(input, cwd, opcje) : poZapisie(input, cwd, opcje);
  return wypisz(zdarzenie, tresc);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
