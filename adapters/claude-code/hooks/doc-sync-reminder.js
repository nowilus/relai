#!/usr/bin/env node
'use strict';
// RelAI hook: doc-sync-reminder — Stop, OSTRZEGA (D-41). Druga siatka definicji
// ukonczenia (D-44): zmiany w kodzie bez zmiany docs/STATE.md ani docs/DZIENNIK.md
// (lub ich odpowiednikow jezykowych) daja przypomnienie. Nigdy nie blokuje.
// Od E5 planu OPTYMALIZACJA_PO_AUDYCIE takze commity od daty ostatniego wpisu dziennika (jedno wywolanie git log).
// Konwencja hook-guard: poza projektem RelAI wyjscie kodem 0 bez efektu.

// K-C4: slad awarii na stderr, przed pierwszym require — ma powstac takze przy zepsutej instalacji.
const HOOK = 'doc-sync-reminder';
function nazwaBledu(e) { return String((e && (e.code || e.name)) || 'nieznany').replace(/[^\x20-\x7e]/g, '?'); }
function slad(e) { try { process.stderr.write('[RelAI ' + HOOK + '] blad: ' + nazwaBledu(e) + '\n'); } catch (_) { /* stderr zamkniety */ } }

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let ostatniWpis = () => null;
try {
  ({ ostatniWpis } = require(path.resolve(__dirname, '..', '..', '..', 'core', 'process', 'session-signals.js')));
} catch (e) {
  slad(e); // bez rdzenia zostaje sama siatka drzewa roboczego
}
const LIMIT_COMMITOW = 200;
const jestKodem = (f) => !/\.md$/i.test(f) && !f.startsWith('.claude/');
const jestDokumentemStanu = (f) => /(^|\/)docs\/(STATE|DZIENNIK|JOURNAL)\.md$/i.test(f);

// K-E3 (D-44 po commicie): data najnowszego wpisu dziennika -> jedno wywolanie git log od tej daty.
// Zwraca { data, liczba } albo null (brak dziennika, brak daty, brak gita, zgodnosc).
// --since z godzina 00:00:00: sama data git uzupelnia biezaca godzina.
function commityBezWpisu(cwd) {
  let txt = null;
  for (const n of ['DZIENNIK.md', 'JOURNAL.md']) {
    try { txt = fs.readFileSync(path.join(cwd, 'docs', n), 'utf8'); break; } catch (_) { /* nastepny */ }
  }
  if (txt === null) return null;
  const wpis = ostatniWpis(txt);
  const m = wpis && wpis.match(/^#{2,3}\s+(\d{4}-\d{2}-\d{2})\b/);
  if (!m) return null;
  const r = spawnSync('git', ['log', '--since=' + m[1] + ' 00:00:00', '--no-merges', '--max-count=' + LIMIT_COMMITOW,
    '--name-only', '--format=%x1e'], { cwd, timeout: 5000, encoding: 'utf8', windowsHide: true });
  if (r.error || r.status !== 0) return null;
  const commity = String(r.stdout || '').split('\x1e')
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((pliki) => pliki.length);
  if (commity.some((pliki) => pliki.some(jestDokumentemStanu))) return null;
  const zKodem = commity.filter((pliki) => pliki.some(jestKodem)).length;
  return zKodem ? { data: m[1], liczba: zKodem } : null;
}

function isGuest(cwd) {
  try {
    const p = path.join(cwd, '.claude', 'relai.json');
    if (!fs.existsSync(p)) return false;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    return !!j && j.mode === 'guest';
  } catch (_) {
    return true;
  }
}

function isRelaiProject(cwd) {
  try {
    if (!cwd || isGuest(cwd)) return false;
    const docsDir = path.join(cwd, 'docs');
    let entries = [];
    try { entries = fs.readdirSync(docsDir); } catch (_) { return false; }
    const candidates = [];
    for (const name of ['USTAWIENIA.md', 'SETTINGS.md']) {
      if (entries.includes(name)) candidates.push(name);
    }
    for (const f of entries) {
      if (/\.md$/i.test(f) && !candidates.includes(f)) candidates.push(f);
      if (candidates.length >= 40) break;
    }
    for (const f of candidates) {
      let head = '';
      try { head = fs.readFileSync(path.join(docsDir, f), 'utf8').slice(0, 4000); } catch (_) { continue; }
      if (/Wersja RelAI:|RelAI version:/i.test(head)) return true;
    }
    return false;
  } catch (e) {
    slad(e);
    return false;
  }
}

function main(input) {
  const cwd = input.cwd || process.cwd();
  if (!isRelaiProject(cwd)) return process.exit(0);
  if (input.stop_hook_active) return process.exit(0);

  let out = '';
  try {
    const r = spawnSync('git', ['status', '--porcelain'], {
      cwd, timeout: 8000, encoding: 'utf8', windowsHide: true,
    });
    if (r.error || r.status !== 0) return process.exit(0); // bez gita nie ma rzetelnego sygnalu
    out = r.stdout || '';
  } catch (e) {
    slad(e);
    return process.exit(0);
  }

  const files = out.split('\n')
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
    .filter(Boolean);

  const codeChanged = files.filter(jestKodem);
  if (files.some(jestDokumentemStanu)) return process.exit(0);
  if (!codeChanged.length) {
    const zaleglosc = commityBezWpisu(cwd);
    if (!zaleglosc) return process.exit(0);
    powiedzModelowi('[RelAI doc-sync-reminder] Od ostatniego wpisu dziennika (' + zaleglosc.data + ') jest ' +
      zaleglosc.liczba + ' commitow zmieniajacych kod, a zaden nie zmienia docs/DZIENNIK.md ani docs/STATE.md ' +
      '(D-44): dopisz wpis albo powiedz uzytkownikowi, dlaczego go nie ma.');
    return process.exit(0);
  }

  powiedzModelowi('[RelAI doc-sync-reminder] W drzewie roboczym sa zmiany w kodzie (' +
    codeChanged.slice(0, 3).join(', ') + (codeChanged.length > 3 ? ', ...' : '') +
    ') bez aktualizacji docs/STATE.md ani docs/DZIENNIK.md. Definicja ukonczenia (D-44): ' +
    'dokumenty aktualizuje sie w tej samej turze co zmiane funkcjonalna.');
  process.exit(0);
}

// K-C9 (C9: NIE WIDZI, odpowiedz "Przeniesc" w E5): systemMessage widzi tylko czlowiek.
// additionalContext w Stop wznawia rozmowe na jedna ture; petle zamyka stop_hook_active w main.
function powiedzModelowi(tekst) {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'Stop', additionalContext: tekst } }));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => { raw += d; });
process.stdin.on('error', (e) => { slad(e); process.exit(0); });
process.stdin.on('end', () => {
  try { main(JSON.parse(raw || '{}')); } catch (e) { slad(e); process.exit(0); }
});
