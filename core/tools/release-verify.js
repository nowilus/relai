#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: weryfikacja po publikacji (plan PIPELINE_WYDAN, E3).
//
// Po co: "plugin update" i restart (P-005) to ostatni krok wydania, a dotad konczyl go reczny
// rachunek w prompcie etapu. Skrypt porownuje cache wydanego pluginu z drzewem tagu - tresc po
// CRLF -> LF, liczba plikow, rozjazdy, pliki brakujace i nadmiarowe - i (z --sesja) sprawdza, ze
// swieza sesja claude -p laduje plugin z katalogu cache tej wersji (pole "plugins" zdarzenia init).
//
//   node core/tools/release-verify.js --plugin relai --wersja <N.N.N>
//   node core/tools/release-verify.js --plugin relai-panel --wersja 0.21.2 --sesja
//   flagi: --tag <tag> (domyslnie v<wersja> albo <plugin>-v<wersja>), --cache <katalog>
//          (domyslnie ~/.claude/plugins/cache/relai/<plugin>/<wersja>), --repo, --json
//
// Katalog pluginu w drzewie tagu bierze z .claude-plugin/marketplace.json tagu (pole source).
// Pomija w cache katalog .in_use/ (znacznik harnessu z PID-ami sesji, nie tresc pluginu).
// Kod wyjscia: 0 = cache rowny tagowi (i sesja widzi wersje), 1 = rozjazd, 2 = nie da sie sprawdzic.
// Komunikaty ASCII (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

class NieDaSie extends Error {}

const POMIJANE_W_CACHE = ['.in_use'];

function argumenty(argv) {
  const a = { plugin: 'relai', wersja: null, tag: null, cache: null, sesja: false, json: false, repo: path.resolve(__dirname, '..', '..') };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--plugin') a.plugin = argv[++i];
    else if (x === '--wersja') a.wersja = argv[++i];
    else if (x === '--tag') a.tag = argv[++i];
    else if (x === '--cache') a.cache = path.resolve(argv[++i]);
    else if (x === '--repo') a.repo = path.resolve(argv[++i]);
    else if (x === '--sesja') a.sesja = true;
    else if (x === '--json') a.json = true;
    else throw new NieDaSie('nieznany argument: ' + x);
  }
  if (!a.plugin || !/^[a-z0-9-]+$/.test(a.plugin)) throw new NieDaSie('--plugin bez poprawnej nazwy');
  if (!a.wersja || !/^\d+\.\d+\.\d+$/.test(a.wersja)) throw new NieDaSie('--wersja wymaga numeru X.Y.Z');
  if (!a.tag) a.tag = a.plugin === 'relai' ? 'v' + a.wersja : a.plugin + '-v' + a.wersja;
  if (!a.cache) a.cache = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'relai', a.plugin, a.wersja);
  return a;
}

function git(repo, args, opcje) {
  const r = spawnSync('git', args, Object.assign({ cwd: repo, maxBuffer: 512 * 1024 * 1024 }, opcje));
  if (r.status !== 0) throw new NieDaSie('git ' + args.join(' ') + ': ' + String(r.stderr || '').trim());
  return r.stdout;
}

const lf = (buf) => (buf.includes(0) ? buf : Buffer.from(buf.toString('utf8').replace(/\r\n?/g, '\n'), 'utf8'));

// Katalog pluginu w drzewie tagu: '' dla rdzenia (source "./"), "panel" dla relai-panel.
function katalogPluginu(repo, tag, plugin) {
  const m = JSON.parse(git(repo, ['show', tag + ':.claude-plugin/marketplace.json'], { encoding: 'utf8' }));
  const p = (m.plugins || []).find((x) => x.name === plugin);
  if (!p || typeof p.source !== 'string') throw new NieDaSie('marketplace.json tagu ' + tag + ' nie ma pluginu ' + plugin);
  return p.source.replace(/^\.\/?/, '').replace(/\/$/, '');
}

// Tresc wszystkich plikow tagu jednym procesem: git cat-file --batch.
function plikiTagu(repo, tag, katalog) {
  const lista = git(repo, ['ls-tree', '-r', '-z', tag].concat(katalog ? ['--', katalog] : []), { encoding: 'utf8' })
    .split('\0').filter(Boolean).map((l) => { const [meta, sciezka] = l.split('\t'); return { sha: meta.split(' ')[2], typ: meta.split(' ')[1], sciezka }; })
    .filter((x) => x.typ === 'blob');
  const out = git(repo, ['cat-file', '--batch'], { input: lista.map((x) => x.sha).join('\n') + '\n' });
  const mapa = new Map();
  let i = 0;
  for (const x of lista) {
    const nl = out.indexOf(10, i);
    const rozmiar = Number(out.slice(i, nl).toString('utf8').split(' ')[2]);
    const rel = katalog ? x.sciezka.slice(katalog.length + 1) : x.sciezka;
    mapa.set(rel, out.slice(nl + 1, nl + 1 + rozmiar));
    i = nl + 1 + rozmiar + 1;
  }
  return mapa;
}

function plikiCache(korzen) {
  const out = new Map();
  const idz = (dir, rel) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (!rel && POMIJANE_W_CACHE.includes(e.name)) continue;
      if (e.isDirectory()) idz(path.join(dir, e.name), r);
      else if (e.isFile()) out.set(r, fs.readFileSync(path.join(dir, e.name)));
    }
  };
  idz(korzen, '');
  return out;
}

function porownaj(tag, cache) {
  const rozjazdy = [];
  const brakujace = [];
  for (const [rel, tresc] of tag) {
    if (!cache.has(rel)) { brakujace.push(rel); continue; }
    if (!lf(tresc).equals(lf(cache.get(rel)))) rozjazdy.push(rel);
  }
  const nadmiarowe = Array.from(cache.keys()).filter((rel) => !tag.has(rel));
  return { plikowTagu: tag.size, plikowCache: cache.size, rozjazdy, brakujace, nadmiarowe };
}

// Swieza sesja binarka aplikacji (P-024): zdarzenie init niesie liste pluginow ze sciezkami.
function sesja(a) {
  const exe = process.env.CLAUDE_CODE_EXECPATH;
  if (!exe || !fs.existsSync(exe)) return { ok: false, opis: 'brak binarki aplikacji ($CLAUDE_CODE_EXECPATH, P-024) - sesja niesprawdzona' };
  const r = spawnSync(exe, ['-p', 'Odpowiedz jednym slowem: ok', '--output-format', 'stream-json', '--verbose', '--max-turns', '1'],
    { cwd: a.repo, encoding: 'utf8', timeout: 300000, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  const init = String(r.stdout || '').split('\n').map((l) => { try { return JSON.parse(l); } catch (_) { return null; } })
    .find((e) => e && e.type === 'system' && e.subtype === 'init');
  if (!init) return { ok: false, opis: 'sesja bez zdarzenia init (kod ' + r.status + ')' };
  const plugin = (init.plugins || []).find((p) => p.name === a.plugin);
  if (!plugin) return { ok: false, opis: 'init nie ma pluginu ' + a.plugin + ' (pluginow ' + (init.plugins || []).length + ')' };
  const norm = (p) => String(p).replace(/\\/g, '/').replace(/\/$/, '').toLowerCase();
  const ok = norm(plugin.path) === norm(a.cache);
  return { ok, opis: 'init: ' + a.plugin + ' z ' + plugin.path + (ok ? '' : ' - oczekiwany ' + a.cache), sciezka: plugin.path };
}

function raportTekst(r) {
  const o = ['RelAI release-verify: ' + (r.kod === 0 ? 'ZGODNE' : 'ROZJAZD') + ' - ' + r.plugin + ' ' + r.wersja + ' (tag ' + r.tag + ', katalog w tagu: ' + (r.katalog || '/') + ')'];
  o.push('Cache: ' + r.cache + ' (pominiete: ' + POMIJANE_W_CACHE.join(', ') + ')');
  o.push('Plikow w tagu ' + r.plikowTagu + ', w cache ' + r.plikowCache + ', rozjazdow ' + r.rozjazdy.length + ', brakujacych ' + r.brakujace.length + ', nadmiarowych ' + r.nadmiarowe.length);
  for (const [nazwa, lista] of [['rozjazd', r.rozjazdy], ['brak w cache', r.brakujace], ['nadmiarowy w cache', r.nadmiarowe]]) {
    for (const p of lista.slice(0, 20)) o.push('  - ' + nazwa + ': ' + p);
    if (lista.length > 20) o.push('  ... razem ' + lista.length);
  }
  if (r.sesja) o.push('Sesja: ' + (r.sesja.ok ? '[ok] ' : '[CZERWONE] ') + r.sesja.opis);
  return o.join('\n') + '\n';
}

function weryfikuj(a) {
  if (!fs.existsSync(a.cache)) throw new NieDaSie('brak katalogu cache ' + a.cache + ' (plugin update i restart, P-005)');
  git(a.repo, ['rev-parse', '--verify', 'refs/tags/' + a.tag], { encoding: 'utf8' });
  const katalog = katalogPluginu(a.repo, a.tag, a.plugin);
  const wynik = porownaj(plikiTagu(a.repo, a.tag, katalog), plikiCache(a.cache));
  if (!wynik.plikowTagu) throw new NieDaSie('drzewo tagu ' + a.tag + ' nie ma plikow w ' + (katalog || '/'));
  const s = a.sesja ? sesja(a) : null;
  const zgodne = !wynik.rozjazdy.length && !wynik.brakujace.length && !wynik.nadmiarowe.length && (!s || s.ok);
  return Object.assign({ plugin: a.plugin, wersja: a.wersja, tag: a.tag, katalog, cache: a.cache }, wynik, { sesja: s, kod: zgodne ? 0 : 1 });
}

function main() {
  let a;
  try {
    a = argumenty(process.argv.slice(2));
    const r = weryfikuj(a);
    process.stdout.write(a.json ? JSON.stringify(r, null, 2) + '\n' : raportTekst(r));
    return r.kod;
  } catch (e) {
    const opis = e instanceof NieDaSie ? e.message : (e && e.stack) || String(e);
    if (a && a.json) process.stdout.write(JSON.stringify({ kod: 2, blad: opis }, null, 2) + '\n');
    else process.stderr.write('RelAI release-verify: NIE DA SIE SPRAWDZIC - ' + opis + '\n');
    return 2;
  }
}

if (require.main === module) process.exitCode = main();

module.exports = { argumenty, porownaj, plikiCache, weryfikuj };
