#!/usr/bin/env node
'use strict';
// RelAI hook: prompt-mode — UserPromptSubmit, CICHY. Tryb ciagly optymalizatora
// promptow: kazdy prompt MERYTORYCZNY dostaje regule "najpierw pokaz roznice,
// potem wykonaj", a prompt z filtru pomijania przechodzi nietkniety.
//
// Nosnik zmierzony w E4 (POMIAR_CLAUDE.md, 2026-09-15): hook UserPromptSubmit
// w Claude Code DOKLADA kontekst do tury i NIE podmienia promptu uzytkownika —
// model widzi oryginal obok reguly. Wariant z podmiana nie istnieje, wiec tryb
// stoi na regule. `exit 2` zatrzymalby ture przed modelem za zero tokenow; tutaj
// go nie uzywamy, bo uzytkownik ma dostac propozycje, a nie odbity prompt.
//
// Cztery warunki ciszy, kazdy konczy sie kodem 0 i zerem znakow na wyjsciu:
// nie ten host / nie projekt RelAI, tryb goscia, przelacznik inny niz "wlaczony"
// (brak wiersza i wartosc spoza listy licza sie jako wylaczony), prompt zlapany
// przez filtr pomijania.
//
// Piaty warunek od 2.3.0: BRAMKA ZGODY. Wlaczony przelacznik mowi, ze tryb jest
// dostepny, a nie ze ma dzialac bez pytania. Stan bramki rozstrzyga rdzen; tutaj
// zostaje wybor tresci: regula trybu, tresc bramki albo cisza.
//
// Reguly niesie rdzen (core/process/prompt-mode.js). Tutaj zostaje wylacznie to,
// co jest wlasciwoscia Claude Code — protokol zdarzenia i ksztalt wyjscia.

const path = require('path');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');

// Awaria require rdzenia jest traktowana jak awaria guarda: hook milknie.
let core;
let tryb;
try {
  core = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-signals.js'));
  tryb = require(path.join(PLUGIN_ROOT, 'core', 'process', 'prompt-mode.js'));
} catch (_) {
  process.exit(0);
}

const MARKERY_GOSCIA = ['.claude/relai.json'];

function main(input) {
  if (String(input.hook_event_name || '') !== 'UserPromptSubmit') return process.exit(0);

  const cwd = input.cwd || process.cwd();
  if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) return process.exit(0);
  if (tryb.trybCiaglyProjektu(cwd) !== true) return process.exit(0);
  if (tryb.pomija(input.prompt)) return process.exit(0);

  const globalne = core.globalSettingsText('.claude/relai');
  const stan = tryb.stanBramki({
    sesja: tryb.zgodaSesji(cwd, input.session_id),
    globalna: tryb.zgodaGlobalna(globalne ? globalne.text : ''),
  });
  if (stan === 'cisza') return process.exit(0);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: stan === 'pytaj' ? tryb.regulaBramki(input.session_id) : tryb.regula(),
    },
  }));
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (_) { process.exit(0); }
});
