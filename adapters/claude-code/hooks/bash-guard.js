#!/usr/bin/env node
'use strict';
// RelAI hook: bash-guard — PreToolUse (Bash), OSTRZEGA (D-41). Cztery nawyki powloki, ktore
// wracaly w lekcjach mimo reguly w CLAUDE.md (audyt 2026-11-09, E3): gole cd, sed -i na pliku .md,
// backslash w heredoku albo w node -e / python -c, /tmp/ w poleceniu z node. Ostrzezenie trafia
// do modelu przed wykonaniem polecenia i go nie zatrzymuje (zasada 12). Sekret w poleceniu
// blokuje secret-scanner (D-41: blokuja wylacznie secret-scanner i config-protection).
// Konwencja hook-guard: poza projektem RelAI i w trybie goscia wyjscie kodem 0 bez efektu.
// Blad wewnetrzny: jedna linia sladu na stderr, kod 0 (hook ostrzegawczy, K-C4). Komunikaty ASCII.

const HOOK = 'bash-guard';
function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }

const path = require('path');

let core;
try {
  core = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js'));
} catch (e) {
  slad(e);
  process.exit(0);
}

const MARKERY_GOSCIA = ['.claude/relai.json'];

const GOLE_CD = /^\s*cd(?:\s|$)/;
const SEGMENT = /\|\||&&|[;|\n]/;
const SED_START = /^\s*\(?\s*sed\s/;
const SED_W_MIEJSCU = /\s(?:-[A-Za-z]*i\S*|--in-place\S*)(?=\s|$)/;
const PLIK_MD = /\.md(?=$|[\s"')])/;
const HEREDOC = /(?<!<)<<(?!<)-?\s*['"]?[A-Za-z_][A-Za-z0-9_]*/;
const INLINE_SKRYPT = /(?:^|[\s;&|(])(?:node(?:\.exe)?\s+(?:-e|--eval|-p|--print)|python[0-9.]*(?:\.exe)?\s+-c|py\s+-c)(?=[\s=]|$)/;
const BACKSLASH = /\\/;
const NODE = /(?:^|[\s;&|(/\\])node(?:\.exe)?(?=\s|$)/;
const TMP = /(?:^|[\s'"=:(<>])\/tmp\//;

function sedNaMd(cmd) {
  return cmd.split(SEGMENT).some((s) => SED_START.test(s) && SED_W_MIEJSCU.test(s) && PLIK_MD.test(s));
}

const NAWYKI = [
  { test: (c) => GOLE_CD.test(c),
    tekst: 'Polecenie zaczyna sie od golego cd: katalog sesji zostaje zmieniony dla nastepnych polecen. ' +
      'Podaj sciezke w argumencie albo uzyj podpowloki ( cd <katalog> && <polecenie> ) (L-0298, L-0302).' },
  { test: sedNaMd,
    tekst: 'sed -i zmienia plik .md: dokument z backtickiem albo cudzyslowem zmieniaj narzedziem Edit/Write, ' +
      'nie podmiana w powloce (L-0198, L-0207).' },
  { test: (c) => (HEREDOC.test(c) || INLINE_SKRYPT.test(c)) && BACKSLASH.test(c),
    tekst: 'Heredoc albo node -e / python -c z backslashem: powloka zmienia backslash, zanim dotrze do skryptu. ' +
      'Skrypt z wyrazeniem regularnym albo sciezka Windows zapisz narzedziem Write i uruchom z pliku (L-0116, L-0130).' },
  { test: (c) => NODE.test(c) && TMP.test(c),
    tekst: '/tmp/ w poleceniu z node: Node na Windows czyta /tmp jako C:\\tmp, a powloka pisze gdzie indziej. ' +
      'Uzyj katalogu scratchpad sesji albo os.tmpdir() (L-0265, L-0309).' },
];

function main(input) {
  if (String(input.tool_name || '') !== 'Bash') return process.exit(0);
  const ti = input.tool_input || {};
  const cmd = typeof ti.command === 'string' ? ti.command : '';
  if (!cmd.trim()) return process.exit(0);
  const cwd = input.cwd || process.cwd();
  if (!core.relaiMarkerFile(cwd, MARKERY_GOSCIA)) return process.exit(0);

  const w = NAWYKI.filter((n) => n.test(cmd)).map((n) => n.tekst);
  if (!w.length) return process.exit(0);
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: '[RelAI bash-guard - OSTRZEZENIE, polecenie nie zatrzymane] ' + w.join(' '),
    },
  }));
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', (e) => { slad(e); process.exit(0); });
process.stdin.on('end', () => {
  const bom = String.fromCharCode(0xfeff);
  const text = raw.startsWith(bom) ? raw.slice(1) : raw;
  try { main(JSON.parse(text || '{}')); } catch (e) { slad(e); process.exit(0); }
});
