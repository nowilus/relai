#!/usr/bin/env node
'use strict';
// RelAI hook: session-title — UserPromptSubmit, CICHY. Pierwszy prompt sesji bedacy fraza
// kontynuacji ("kontynuujemy pracę", "tak"…) albo komenda etapu z karty dostaje tytul z fokusu:
// "E4 · ZGLOSZENIA — nazwa etapu" (plan ZGLOSZENIA, E4, zgloszenie #1). Bez tego aplikacja nazywa
// czat od samej frazy.
//
// Nosnik zmierzony 2026-10-26 na 2.1.308: hookSpecificOutput.sessionTitle dziala w aplikacji
// desktop, w CLI (takze -p) i po /clear, a tytul AI aplikacji mu ustepuje. Payload nie mowi, czy
// prompt jest pierwszy, a session_title po /clear niesie tytul starej rozmowy, wiec "pierwszy"
// rozstrzygaja transkrypt sesji (brak wczesniejszego promptu czlowieka) i plik znacznika tej
// sesji, zakladany atomowo.
//
// Warunki ciszy (kod 0, zero znakow): inne zdarzenie, nie projekt RelAI albo tryb goscia,
// wczesniejszy prompt w transkrypcie, nie pierwszy prompt, prompt z wlasna trescia, brak zrodla,
// kazda awaria.
// Reguly niesie rdzen (core/process/session-title.js); tutaj protokol zdarzenia i odczyt plikow.

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..', '..');

let core;
let tytul;
try {
  core = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-signals.js'));
  tytul = require(path.join(PLUGIN_ROOT, 'core', 'process', 'session-title.js'));
} catch (_) {
  process.exit(0);
}

const MARKERY_GOSCIA = ['.claude/relai.json'];
const FOKUS = path.join('.claude', 'relai', 'fokus');
const ZNACZNIKI = path.join('.claude', 'relai', 'tytul');

function czytaj(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; }
}

async function main(input) {
  if (String(input.hook_event_name || '') !== 'UserPromptSubmit') return;
  const cwd = input.cwd || process.cwd();
  if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) return;
  // Najpierw tanie warunki: znacznik tej sesji (zakladany przy kazdym pierwszym prompcie, takze
  // z wlasna trescia) i fraza. Transkrypt czytamy dopiero dla frazy kontynuacji.
  const session = String(input.session_id || '');
  if (!tytul.claimFirst(path.join(cwd, ZNACZNIKI), session)) return;
  const prompt = String(input.prompt || '');
  if (!tytul.stageCommandOf(prompt) && !tytul.isContinuation(prompt)) return;
  // Pierwszy prompt: w transkrypcie nie ma wczesniejszego promptu czlowieka (sesja sprzed
  // znacznika, np. sprzed aktualizacji pluginu). Tytul w payloadzie nie rozstrzyga — po /clear
  // aplikacja przenosi tytul starej rozmowy (zmierzone 2026-10-27). Transkrypt nieczytelny: sesja
  // z tytulem liczy sie jako nie-pierwsza.
  const transkrypt = input.transcript_path ? czytaj(String(input.transcript_path)) : null;
  if (transkrypt !== null && tytul.priorPrompts(transkrypt, prompt) > 0) return;
  if (transkrypt === null && typeof input.session_title === 'string' && input.session_title.trim()) return;

  const title = await tytul.sessionTitle({
    prompt,
    isFirst: true,
    handoffText: czytaj(path.join(cwd, FOKUS, 'przekazanie.json')),
    focusText: czytaj(path.join(cwd, FOKUS, `${session.replace(/[^\w.-]/g, '_')}.json`)),
    stateMd: czytaj(path.join(cwd, 'docs', 'STATE.md')),
    statusOf: (plan) => (/^[A-Za-z0-9_-]+$/.test(plan) ? czytaj(path.join(cwd, 'docs', 'plany', plan, 'STATUS.md')) : null),
    now: Date.now(),
    cwd,
    session,
  });
  if (!title) return;
  // exit dopiero po oproznieniu stdout: potok na Windowsie moglby uciac wyjscie (przeglad E4)
  await new Promise((done) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', sessionTitle: title } }), done));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', () => process.exit(0));
process.stdin.on('end', () => {
  const bom = String.fromCharCode(0xfeff);
  const text = raw.startsWith(bom) ? raw.slice(1) : raw;
  let input;
  try { input = JSON.parse(text || '{}'); } catch (_) { process.exit(0); }
  main(input).then(() => process.exit(0), () => process.exit(0));
});
