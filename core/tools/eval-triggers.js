#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: ewaluacje wyzwalania skilli (odnoga AUDYT_SKILLI, S5).
//
// Po co: porownania "bez skilla / ze skillem" i przypadki falszywego wyzwolenia robilismy
// dotad doraznie, w planach, skryptami poza gitem. Tu zestaw z core/evals/triggers.json idzie
// przez swieze sesje `claude -p`, kazda w kopii folderu-fixtury, a wynik jest zapisywany.
//
//   node core/tools/eval-triggers.js --model sonnet [--plugin-dir <katalog pluginu>] [--wariant nowy]
//        [--baseline] [--tylko-kontrola] [--ids core-p1,plan-n3] [--rownolegle 3] [--max-turns 4]
//        [--out wynik.json]
//
// --plugin-dir: plugin RelAI do zmierzenia (domyslnie korzen tego repozytorium). --baseline: bez
// pluginu — punkt odniesienia "jak zachowuje sie model bez RelAI". Ustawienia uzytkownika i jego
// pluginy sa wylaczone (--setting-sources project,local, --strict-mcp-config), zeby mierzyc RelAI,
// a nie sasiadow. Binarka: zmienna RELAI_CLAUDE albo `claude` z PATH (P-024: sprawdz wersje).
// Prompt idzie przez stdin (P-002). Sesja zakonczona limitem tur przed odpowiedzia = "nie
// zmierzono", nigdy "nie wywolano" (L-0113). Komunikaty bez polskich znakow (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ZESTAW = path.join(ROOT, 'core', 'evals', 'triggers.json');

function argumenty(argv) {
  const o = { model: 'sonnet', pluginDir: ROOT, wariant: 'nowy', rownolegle: 3, maxTurns: 4 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--model') o.model = argv[++i];
    else if (a === '--plugin-dir') o.pluginDir = path.resolve(argv[++i]);
    else if (a === '--wariant') o.wariant = argv[++i];
    else if (a === '--baseline') { o.baseline = true; o.wariant = 'baseline'; }
    else if (a === '--tylko-kontrola') o.tylkoKontrola = true;
    else if (a === '--ids') o.ids = argv[++i].split(',');
    else if (a === '--rownolegle') o.rownolegle = Number(argv[++i]);
    else if (a === '--max-turns') o.maxTurns = Number(argv[++i]);
    else if (a === '--out') o.out = path.resolve(argv[++i]);
  }
  return o;
}

function kopiuj(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const w of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, w.name);
    const d = path.join(dest, w.name);
    if (w.isDirectory()) kopiuj(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Czyta strumien stream-json sesji. Nazwy narzedzi zbiera wszystkie (zasada 5: zanim orzekniesz,
// ze jednego nie ma, wypisz zbior tych, ktore wystapily).
function analizuj(stdout, skill) {
  const wynik = { narzedzia: [], wywolany: false, rytual: false, odczyty: [], subtype: null, tekst: '', tury: null, koszt: null, init: null };
  const katalog = '/skills/' + skill + '/';
  for (const linia of stdout.split('\n')) {
    let j;
    try { j = JSON.parse(linia); } catch (_) { continue; }
    if (j.type === 'system' && j.subtype === 'init') {
      wynik.init = { narzedzia: (j.tools || []).length, skill: (j.tools || []).includes('Skill'), pluginy: (j.plugins || []).map((p) => p.name + '@' + p.path) };
    }
    if (j.type === 'assistant' && j.message && Array.isArray(j.message.content)) {
      for (const c of j.message.content) {
        if (c.type !== 'tool_use') continue;
        wynik.narzedzia.push(c.name);
        const wejscie = JSON.stringify(c.input || {}).replace(/\\\\/g, '/');
        if (c.name === 'Skill' && new RegExp('(^|[":/])' + skill + '"').test(wejscie)) wynik.wywolany = true;
        // Licznik szeroki (zasada 5): rytual RelAI wykonany bez skilla — hook i CLAUDE.md kaza czytac
        // docs/STATE.md (L-0030). Werdykt stoi na skillu; to pole mowi, czy zachowanie i tak zaszlo.
        if (c.name === 'Read' && /\/docs\/(STATE|DZIENNIK|USTAWIENIA)\.md"/.test(wejscie)) wynik.rytual = true;
        const m = wejscie.match(new RegExp('[^"]*' + katalog.replace(/\//g, '/') + '[^"]*', 'g'));
        // ogon "\" to ucieczka cudzyslowu w poleceniu Basha, nie czesc nazwy; sam katalog skilla to nie odczyt pliku
        if (m) {
          for (const p of m) {
            const plik = p.slice(p.indexOf(katalog) + katalog.length).replace(/[\\/]+$/, '');
            if (plik) wynik.odczyty.push(plik);
          }
        }
      }
    }
    if (j.type === 'result') {
      wynik.subtype = j.subtype;
      wynik.isError = Boolean(j.is_error);
      wynik.tekst = String(j.result || '');
      wynik.tury = j.num_turns;
      wynik.koszt = j.total_cost_usd;
    }
  }
  return wynik;
}

function werdykt(pozycja, a) {
  const plikiDoczytywane = a.odczyty.filter((p) => p !== 'SKILL.md');
  // is_error przy subtype "success" (logowanie, limit konta) = sesja nie odpowiedziala na prompt
  const zakonczona = a.subtype === 'success' && !a.isError;
  if (!zakonczona && !a.wywolany && !a.odczyty.length) return 'nie zmierzono';
  if (pozycja.expect === 'trigger') {
    if (a.wywolany || a.odczyty.length) return 'ok';
    return zakonczona ? 'blad' : 'nie zmierzono';
  }
  if (pozycja.miara === 'procedura') {
    if (plikiDoczytywane.length || /RelAI/i.test(a.tekst)) return 'blad';
    return zakonczona ? 'ok' : 'nie zmierzono';
  }
  if (a.wywolany || a.odczyty.length) return 'blad';
  return zakonczona ? 'ok' : 'nie zmierzono';
}

// Kopia fixtury jest repozytorium z lokalna tozsamoscia "tester": inaczej user.name osoby mierzacej
// (hook czyta .git/config folderu, potem ~/.gitconfig) rozni sie od podpisu w dzienniku fixtury
// i siatka "cudzy projekt" (D-27) zatrzymuje model pytaniem o wycieczke przed mierzonym skillem.
function gitFixtury(dir) {
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 'tester'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 'tester@example.invalid'], { cwd: dir });
}

function sesja(pozycja, zestaw, o) {
  return new Promise((resolve) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-eval-' + pozycja.id + '-'));
    kopiuj(path.join(ROOT, zestaw.fixtures[pozycja.folder]), dir);
    gitFixtury(dir);
    const args = ['-p', '--model', o.model, '--max-turns', String(o.maxTurns), '--output-format', 'stream-json', '--verbose',
      '--setting-sources', 'project,local', '--strict-mcp-config'];
    if (!o.baseline) args.push('--plugin-dir', o.pluginDir);
    const bin = process.env.RELAI_CLAUDE || 'claude';
    const start = Date.now();
    const child = spawn(bin, args, { cwd: dir, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    const zegar = setTimeout(() => child.kill(), 300000);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { err += String(e); });
    child.on('close', (kod) => {
      clearTimeout(zegar);
      const a = analizuj(out, pozycja.skill);
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) { /* katalog tymczasowy */ }
      resolve(Object.assign({ id: pozycja.id, skill: pozycja.skill, expect: pozycja.expect, miara: pozycja.miara || 'wywolanie',
        folder: pozycja.folder, model: o.model, wariant: o.wariant, kod, sekundy: Math.round((Date.now() - start) / 1000),
        werdykt: werdykt(pozycja, a), stderr: err.slice(0, 300) }, a, { tekst: a.tekst.slice(0, 400) }));
    });
    child.stdin.end(pozycja.prompt);
  });
}

async function main() {
  const o = argumenty(process.argv.slice(2));
  const zestaw = JSON.parse(fs.readFileSync(ZESTAW, 'utf8'));
  let pozycje = zestaw.pozycje;
  if (o.ids) pozycje = pozycje.filter((p) => o.ids.includes(p.id));
  if (o.tylkoKontrola) pozycje = pozycje.filter((p) => p.kontrola_zmiany);
  const wyniki = [];
  let i = 0;
  const robotnik = async () => {
    while (i < pozycje.length) {
      const p = pozycje[i++];
      const w = await sesja(p, zestaw, o);
      wyniki.push(w);
      process.stdout.write(w.werdykt.padEnd(14) + w.id.padEnd(9) + ' ' + o.model + '/' + o.wariant + ' wywolany=' + w.wywolany
        + ' rytual=' + w.rytual + ' odczyty=' + (w.odczyty.join(',') || '-') + ' koniec=' + w.subtype + ' tury=' + w.tury + ' ' + w.sekundy + 's\n');
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, o.rownolegle) }, robotnik));
  wyniki.sort((a, b) => a.id.localeCompare(b.id));
  if (o.out) {
    fs.mkdirSync(path.dirname(o.out), { recursive: true });
    fs.writeFileSync(o.out, JSON.stringify({ model: o.model, wariant: o.wariant, pluginDir: o.baseline ? null : o.pluginDir, wyniki }, null, 2) + '\n');
  }
  const ile = (w) => wyniki.filter((x) => x.werdykt === w).length;
  process.stdout.write('RelAI eval-triggers: ' + wyniki.length + ' sesji, ok ' + ile('ok') + ', blad ' + ile('blad')
    + ', nie zmierzono ' + ile('nie zmierzono') + '\n');
  process.exit(wyniki.some((w) => w.init === null) ? 2 : 0);
}

if (require.main === module) main();

module.exports = { analizuj, werdykt, gitFixtury };
