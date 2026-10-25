#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: raport gotowosci do wydania (plan PIPELINE_WYDAN, E1).
//
// Po co: przy 3.3.0 trzy luki (tabela hookow w README, trzy wpisy ARTEFAKTY.md, fiszka EN strony)
// zlapala dopiero reczna lista w prompcie etapu — zaden automat ich nie widzial (ryzyka PW1, PW2).
// Skrypt ustala baze rdzenia i kazdego modu, klasyfikuje diff od bazy wedlug mapy wplywu
// (release-map.json; plik bez wiersza mapy = czerwien "nieznany typ zmiany") i uruchamia kontrole
// zgodnosci (release-checks.js) oraz — gdy diff dotyka ich obszaru — ciezkie zestawy testow.
// Tylko czyta: niczego nie naprawia, nie podbija, nie taguje.
//
// Uruchamiany RECZNIE, przed wydaniem:
//   node core/tools/release-check.js               # drzewo robocze wobec bazy
//   node core/tools/release-check.js --rev <rew>   # drzewo rewizji w tymczasowym git worktree
//   flagi: --json (raport JSON), --szybko (bez ciezkich zestawow, raport mowi, co pominieto),
//          --tylko <id,id> (wybrane kontrole), --mapa <plik>, --repo <katalog> (fixtury testow),
//          --wydanie (tryb wydania: komponent ze zmianami i numerem bazy = czerwien "podbicie")
// Raport niesie tez propozycje numerow (E2): patch / minor z conventional commits od bazy,
// osobno dla rdzenia i kazdego modu (release-version.js).
//
// Kod wyjscia: 0 = gotowe, 1 = czerwone kontrole, 2 = nie da sie sprawdzic (brak bazy, brak mapy,
// rewizja nieznana). Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const kontrole = require('./release-checks.js');
const numery = require('./release-version.js');

class NieDaSie extends Error {}

function argumenty(argv) {
  const a = { rev: null, json: false, szybko: false, wydanie: false, tylko: null, mapa: path.join(__dirname, 'release-map.json'), repo: path.resolve(__dirname, '..', '..') };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--json') a.json = true;
    else if (x === '--wydanie') a.wydanie = true;
    else if (x === '--szybko') a.szybko = true;
    else if (x === '--rev') a.rev = argv[++i];
    else if (x === '--tylko') a.tylko = String(argv[++i] || '').split(',').filter(Boolean);
    else if (x === '--mapa') a.mapa = path.resolve(argv[++i]);
    else if (x === '--repo') a.repo = path.resolve(argv[++i]);
    else throw new NieDaSie('nieznany argument: ' + x);
  }
  if (a.rev === undefined || a.rev === '') throw new NieDaSie('--rev bez rewizji');
  return a;
}

function git(repo, args, wolnoPorazke) {
  const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    if (wolnoPorazke) return null;
    throw new NieDaSie('git ' + args.join(' ') + ': ' + ((r.stderr || '').trim() || 'kod ' + r.status));
  }
  return r.stdout.replace(/\r\n/g, '\n');
}

const linie = (t) => (t || '').split('\n').filter(Boolean);

// --- bazy ------------------------------------------------------------------------

function wersjaZ(repo, ref, rel) {
  const t = git(repo, ['show', ref + ':' + rel], true);
  if (t === null) return null;
  try { return JSON.parse(t).version || null; } catch (_) { return null; }
}

// Baza rdzenia: ostatni tag v* osiagalny z rewizji; rewizja, ktora sama jest wydaniem v*, liczy sie
// wobec poprzedniego tagu (raport mowi wtedy, czy TO wydanie bylo gotowe).
function bazaRdzenia(repo, rev, commit) {
  let start = rev || 'HEAD';
  let uwaga = null;
  if (rev) {
    const wlasne = linie(git(repo, ['tag', '--points-at', commit, '--list', 'v*']));
    if (wlasne.length) { start = commit + '^'; uwaga = 'rewizja jest wydaniem ' + wlasne[0] + ' - baza to poprzedni tag'; }
  }
  const tag = git(repo, ['describe', '--tags', '--abbrev=0', '--match', 'v*', start], true);
  if (tag === null) throw new NieDaSie('brak bazy rdzenia: zaden tag v* nie jest osiagalny z ' + start);
  const ref = tag.trim();
  return { ref, commit: git(repo, ['rev-list', '-n', '1', ref]).trim(), wersja: wersjaZ(repo, ref, '.claude-plugin/plugin.json'), uwaga };
}

// Baza modu: wlasny tag <nazwa>-v<numer>, inaczej commit, w ktorym plugin.json dostal biezacy numer
// (czesc modow wyszla pod tagiem innego modu, PLAN N2). Numer jeszcze niewydany (commit numeru to
// sama rewizja albo nie nalezy do zadnego tagu) -> baza to poprzedni numer.
function bazaModu(repo, mod, commit, rev) {
  const rel = mod.katalog + '/.claude-plugin/plugin.json';
  let wersja = mod.wersja;
  // Punkt szukania cofa sie razem z numerem: od rodzica commitu, ktory numer zmienil — inaczej
  // "git log -S" trafia w commit, ktory poprzedni numer USUNAL (pierwszy przebieg na a1439b9).
  let punkt = commit;
  for (let krok = 0; krok < 20 && wersja; krok++) {
    const tag = mod.nazwa + '-v' + wersja;
    const tagCommit = git(repo, ['rev-list', '-n', '1', 'refs/tags/' + tag], true);
    const wNumerze = git(repo, ['log', '-1', '--format=%H', '-S', '"version": "' + wersja + '"', punkt, '--', rel], true);
    const c = tagCommit ? tagCommit.trim() : (wNumerze || '').trim();
    if (!c && !rev && krok === 0) {
      // Numer podbity w drzewie roboczym, jeszcze bez commitu: baza to numer z HEAD.
      wersja = wersjaZ(repo, commit, rel);
      continue;
    }
    if (!c) throw new NieDaSie('brak bazy modu ' + mod.nazwa + ': ani tagu ' + tag + ', ani commitu z numerem ' + wersja + ' w ' + rel);
    // --rev: commit numeru rowny rewizji to wydanie, ktore wlasnie sprawdzamy (baza = poprzedni numer).
    // Drzewo robocze: HEAD z tagiem jest juz wydany.
    // Tylko tagi osiagalne z rewizji (--merged): tag pozniejszy niz --rev nie czyni numeru wydanym.
    const wydany = (!rev || c !== commit) && Boolean(tagCommit || linie(git(repo, ['tag', '--contains', c, '--merged', commit])).length > 0);
    if (wydany) {
      return { nazwa: mod.nazwa, katalog: mod.katalog, wersja: mod.wersja, wersjaBazy: wersja, ref: tagCommit ? tag : c.slice(0, 7), commit: c,
        zrodlo: tagCommit ? 'wlasny tag' : 'commit numeru w plugin.json' };
    }
    punkt = c + '^';
    wersja = wersjaZ(repo, punkt, rel);
  }
  throw new NieDaSie('brak bazy modu ' + mod.nazwa + ': nie znaleziono wydanego numeru przed ' + mod.wersja);
}

// --- diff i mapa ----------------------------------------------------------------------

function zmiany(repo, baza, rev, mapa) {
  const args = ['diff', '--name-status', '-M', baza].concat(rev ? [rev] : []);
  const out = [];
  for (const l of linie(git(repo, args))) {
    const k = l.split('\t');
    const status = k[0][0];
    out.push(status === 'R' || status === 'C' ? { status, plik: k[2], stary: k[1] } : { status, plik: k[1] });
  }
  let pominiete = 0;
  if (!rev) {
    for (const p of linie(git(repo, ['ls-files', '--others', '--exclude-standard']))) {
      if (kontrole.pasuje(p, mapa.pominieteNiesledzone)) { pominiete++; continue; }
      out.push({ status: '?', plik: p });
    }
  }
  return { lista: out, pominieteNiesledzone: pominiete };
}

function wierszeDla(mapa, rel) {
  return mapa.wiersze.filter((w) => kontrole.pasuje(rel, w.wzorce) && !kontrole.pasuje(rel, w.wyklucz));
}

const ODMIANA = { A: 'nowy', D: 'usuniety', R: 'przemianowany', C: 'skopiowany', M: 'zmieniony', T: 'zmieniony', '?': 'niesledzony' };

function kontrolaMapy(mapa, pliki) {
  const w = kontrole.wynik('mapa', 'mapa wplywu: kazdy plik sledzony w dokladnie jednym wierszu');
  let bez = 0;
  let wielu = 0;
  for (const p of pliki) {
    const n = wierszeDla(mapa, p).length;
    if (n === 0) { bez++; if (bez <= 15) w.bledy.push('plik bez wiersza mapy: ' + p); }
    if (n > 1) { wielu++; if (wielu <= 15) w.bledy.push('plik w ' + n + ' wierszach mapy: ' + p + ' (' + wierszeDla(mapa, p).map((x) => x.id).join(', ') + ')'); }
  }
  if (bez > 15 || wielu > 15) w.bledy.push('... razem bez wiersza ' + bez + ', w wielu ' + wielu);
  w.sprawdzono = pliki.length;
  if (!pliki.length) w.bledy.push('lista plikow sledzonych jest pusta');
  w.licznik = pliki.length + ' plikow, ' + bez + ' bez wiersza, ' + wielu + ' w dwoch lub wiecej';
  return w;
}

function klasyfikuj(mapa, lista) {
  const w = kontrole.wynik('diff', 'diff od bazy: kazda zmiana ma typ z mapy');
  const typy = {};
  const osobne = {};
  for (const z of lista) {
    const grupa = Object.keys(mapa.grupyOsobne || {}).find((g) => kontrole.pasuje(z.plik, mapa.grupyOsobne[g]));
    if (grupa) { (osobne[grupa] = osobne[grupa] || []).push(z.plik); continue; }
    const wiersze = wierszeDla(mapa, z.plik);
    if (!wiersze.length) { w.bledy.push('nieznany typ zmiany: ' + z.plik + ' (' + (ODMIANA[z.status] || z.status) + ') - dopisz wiersz mapy w tej samej zmianie'); continue; }
    const klucz = wiersze[0].id + ' / ' + (ODMIANA[z.status] || z.status);
    (typy[klucz] = typy[klucz] || []).push(z.plik);
  }
  w.sprawdzono = lista.length;
  w.licznik = 'zmian ' + lista.length + ', typow ' + Object.keys(typy).length + ', nieznanych ' + w.bledy.length;
  return { wynik: w, typy, osobne };
}

// --- propozycje numerow (E2) ------------------------------------------------------------

// Rdzen: pliki z typow diffu, ktorych wiersz ma "wydanie: rdzen". Mod: pliki diffu od bazy modu
// z wierszem "mod:<nazwa>". Komponent bez takich plikow nie dostaje propozycji (przypadek "tylko docs").
function propozycjeNumerow(repo, mapa, rev, baza, wersja, mody, typy, plikiModow, lista) {
  const wydanieWiersza = (id) => (mapa.wiersze.find((w) => w.id === id) || {}).wydanie;
  // Przemianowany plik wnosi tez stara sciezke: commit feat sprzed zmiany nazwy ja niesie (przeglad E2).
  const stare = new Map((lista || []).filter((z) => z.stary).map((z) => [z.plik, z.stary]));
  const plikiRdzenia = new Set();
  const usuniete = [];
  for (const [klucz, pliki] of Object.entries(typy)) {
    const [id, odmiana] = klucz.split(' / ');
    if (wydanieWiersza(id) !== 'rdzen') continue;
    for (const p of pliki) {
      plikiRdzenia.add(p);
      if (stare.has(p)) plikiRdzenia.add(stare.get(p));
    }
    if (id === 'komenda' && (odmiana === 'usuniety' || odmiana === 'przemianowany')) usuniete.push(...pliki);
  }
  const out = [];
  const rdzen = numery.propozycja('relai', wersja, baza.wersja, plikiRdzenia, usuniete,
    plikiRdzenia.size ? numery.commity(git, repo, baza.commit, rev) : []);
  if (rdzen) out.push(rdzen);
  for (const m of mody) {
    const pliki = new Set(plikiModow.get(m.nazwa).filter((p) => (wierszeDla(mapa, p)[0] || {}).wydanie === 'mod:' + m.nazwa));
    const p = numery.propozycja(m.nazwa, m.wersja, m.wersjaBazy, pliki, [],
      pliki.size ? numery.commity(git, repo, m.commit, rev, [m.katalog]) : []);
    if (p) out.push(p);
  }
  return out;
}

// --- ciezkie zestawy -------------------------------------------------------------------

function czas(od) { return Math.round((Date.now() - od) / 100) / 10; }

function nodeTest(cwd, wzorce) {
  const r = spawnSync(process.execPath, ['--test'].concat(wzorce), { cwd, encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  const liczba = (nazwa) => Number((new RegExp('^(?:#|ℹ) ' + nazwa + ' (\\d+)', 'm').exec(out) || [0, NaN])[1]);
  return { kod: r.status, pass: liczba('pass'), fail: liczba('fail'), out };
}

function wynikTestow(id, nazwa, r, od) {
  const w = kontrole.wynik(id, nazwa);
  w.sprawdzono = (r.pass || 0) + (r.fail || 0);
  if (r.kod !== 0 || r.fail) w.bledy.push('testy: ' + r.pass + ' zaliczonych, ' + r.fail + ' niezaliczonych (kod ' + r.kod + ')');
  if (!w.sprawdzono) w.bledy.push('przebieg nie zglosil liczby testow');
  w.licznik = r.pass + '/' + w.sprawdzono + ' w ' + czas(od) + ' s';
  return w;
}

async function zestawStrony(korzen) {
  const od = Date.now();
  const w = wynikTestow('testy-strony', 'budowa i testy strony', nodeTest(korzen, ['site/**/*.test.mjs']), od);
  try {
    const { buildPages } = await kontrole.importuj(korzen, 'site/narzedzia/zbuduj.mjs');
    const strony = await buildPages(korzen);
    for (const [rel, tresc] of Object.entries(strony)) {
      const zapis = kontrole.czytaj(korzen, rel);
      if (zapis !== String(tresc).replace(/\r\n?/g, '\n')) w.bledy.push('strona ' + rel + ' inna niz budowa z biezacych danych (node site/narzedzia/zbuduj.mjs)');
    }
    w.licznik += ', stron porownanych ' + Object.keys(strony).length;
  } catch (e) {
    w.bledy.push('budowa strony przerwana: ' + e.message);
  }
  w.licznik = w.licznik.replace(/ w [\d.]+ s/, '') + ' w ' + czas(od) + ' s';
  return w;
}

function zestawPluginTest(korzen, mody) {
  const od = Date.now();
  const w = kontrole.wynik('plugin-test', 'claude plugin test modow ze zmianami');
  const exe = process.env.CLAUDE_CODE_EXECPATH;
  if (!exe || !fs.existsSync(exe)) return null;
  for (const m of mody) {
    const r = spawnSync(exe, ['plugin', 'test', m.katalog], { cwd: korzen, encoding: 'utf8', timeout: 900000 });
    w.sprawdzono++;
    if (r.status !== 0) w.bledy.push(m.nazwa + ': claude plugin test kod ' + r.status + ' - ' + ((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-3).join(' | '));
  }
  w.licznik = 'modow ' + mody.length + ' w ' + czas(od) + ' s';
  return w;
}

async function zestawy(ctx, potrzebne, modyZeZmianami, szybko, rev) {
  const wyniki = [];
  const pominiete = [];
  for (const id of ['testy-rdzenia', 'testy-strony', 'testy-filmu', 'plugin-test']) {
    if (!potrzebne.has(id)) { pominiete.push(id + ': diff nie dotyka obszaru'); continue; }
    if (szybko) { pominiete.push(id + ': --szybko'); continue; }
    const od = Date.now();
    if (id === 'testy-rdzenia') {
      wyniki.push(wynikTestow(id, 'testy rdzenia, panelu i Codeksa', nodeTest(ctx.korzen,
        ['core/process/tests/*.test.js', 'core/guardrails/tests/*.test.js', 'core/panel/tests/*.test.js', 'adapters/codex/tests/*.test.js']), od));
    } else if (id === 'testy-strony') {
      wyniki.push(await zestawStrony(ctx.korzen));
    } else if (id === 'testy-filmu') {
      const film = path.join(ctx.korzen, 'docs', 'zasoby', 'film', 'zrodla');
      if (!fs.existsSync(path.join(film, 'node_modules'))) { pominiete.push(id + ': brak node_modules filmu' + (rev ? ' w worktree' : ' (npm ci w zrodla filmu)')); continue; }
      wyniki.push(wynikTestow(id, 'testy filmu', nodeTest(film, ['testy/*.test.mjs']), od));
    } else {
      const w = zestawPluginTest(ctx.korzen, modyZeZmianami);
      if (!w) { pominiete.push(id + ': brak binarki aplikacji ($CLAUDE_CODE_EXECPATH, P-024)'); continue; }
      if (!modyZeZmianami.length) { pominiete.push(id + ': zaden mod nie zmienil sie od bazy'); continue; }
      wyniki.push(w);
    }
  }
  return { wyniki, pominiete };
}

// --- raport ------------------------------------------------------------------------------

function raportTekst(r) {
  const o = [];
  // Pominiety zestaw nie jest zielenia: naglowek mowi o nim, a nie tylko stopka.
  const bez = r.pominiete.filter((p) => !/diff nie dotyka obszaru|zaden mod nie zmienil/.test(p)).length;
  o.push('RelAI release-check: ' + (r.kod === 0 ? 'GOTOWE' : 'CZERWONE (' + r.czerwone + ')') + (bez ? ' (BEZ ' + bez + ' pozycji - lista "Pominiete")' : '')
    + ' - rewizja ' + r.rewizja + ', wersja relai ' + r.wersja);
  o.push('Baza rdzenia: ' + r.bazy.rdzen.ref + ' (' + r.bazy.rdzen.commit.slice(0, 7) + ', ' + r.bazy.rdzen.wersja + ')' + (r.bazy.rdzen.uwaga ? ' - ' + r.bazy.rdzen.uwaga : ''));
  for (const m of r.bazy.mody) {
    o.push('Baza modu ' + m.nazwa + ' ' + m.wersja + ': ' + m.ref + ' (' + m.commit.slice(0, 7) + ', ' + m.zrodlo + ', numer bazy ' + m.wersjaBazy + '), zmienionych plikow od bazy: ' + m.zmienionych);
  }
  o.push('Zmiany od bazy rdzenia: ' + r.zmiany.plikow + (r.zmiany.pominieteNiesledzone ? ' (pominiete niesledzone .claude/: ' + r.zmiany.pominieteNiesledzone + ')' : ''));
  for (const [typ, pliki] of Object.entries(r.zmiany.typy)) o.push('  ' + typ + ': ' + pliki.length);
  for (const [g, pliki] of Object.entries(r.zmiany.osobne)) o.push('  [grupa osobna ' + g + ' - poza pipeline]: ' + pliki.length);
  o.push('Propozycje numerow' + (r.trybWydania ? ' (tryb wydania)' : '') + ':' + (r.propozycje.length ? '' : ' brak - zadna zmiana nie wymaga wydania'));
  for (const p of r.propozycje) {
    o.push('  ' + p.komponent + ': ' + p.wersjaBazy + ' -> ' + p.propozycja + ' (' + p.poziom + '), teraz ' + p.wersja + ' - ' + p.stan
      + '; plikow ' + p.plikow + ', commitow ' + p.commitow + (p.bezCommitu ? ', bez commitu ' + p.bezCommitu : ''));
    for (const pw of p.powody) o.push('      > ' + pw);
  }
  o.push('Kontrole:');
  for (const k of r.kontrole) {
    o.push('  ' + (k.bledy.length ? '[CZERWONE] ' : '[ok] ') + k.id + ' - ' + k.nazwa + ' (sprawdzono ' + k.sprawdzono + (k.licznik ? '; ' + k.licznik : '') + ')');
    for (const b of k.bledy) o.push('      - ' + b);
    for (const b of k.ostrzezenia) o.push('      ! ' + b);
    for (const b of k.info) o.push('      i ' + b);
  }
  if (r.pominiete.length) { o.push('Pominiete:'); for (const p of r.pominiete) o.push('  ' + p); }
  o.push('Czas przebiegu: ' + r.czasS + ' s');
  return o.join('\n') + '\n';
}

// --- przebieg ------------------------------------------------------------------------------

async function sprawdz(a) {
  const od = Date.now();
  let mapa;
  try { mapa = JSON.parse(fs.readFileSync(a.mapa, 'utf8')); } catch (e) { throw new NieDaSie('nie moge odczytac mapy ' + a.mapa + ' (' + e.message + ')'); }
  const repo = git(a.repo, ['rev-parse', '--show-toplevel']).trim();
  const commit = git(repo, ['rev-parse', '--verify', (a.rev || 'HEAD') + '^{commit}']).trim();
  let worktree = null;
  try {
    let korzen = repo;
    if (a.rev) {
      worktree = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-release-check-'));
      git(repo, ['worktree', 'add', '--detach', worktree, commit]);
      korzen = worktree;
    }
    const baza = bazaRdzenia(repo, a.rev, commit);
    const wersja = (kontrole.czytajJson(korzen, '.claude-plugin/plugin.json') || {}).version || null;
    const mody = kontrole.modyMarketplace(korzen).map((m) => bazaModu(repo, m, commit, a.rev));
    const plikiModow = new Map();
    for (const m of mody) {
      const lista = linie(git(repo, ['diff', '--name-only', m.commit].concat(a.rev ? [commit] : []).concat(['--', m.katalog])))
        .concat(a.rev ? [] : linie(git(repo, ['ls-files', '--others', '--exclude-standard', '--', m.katalog])));
      plikiModow.set(m.nazwa, lista);
      m.zmienionych = lista.length;
    }
    const z = zmiany(repo, baza.commit, a.rev ? commit : null, mapa);
    const pliki = linie(a.rev ? git(repo, ['ls-tree', '-r', '--name-only', commit]) : git(repo, ['ls-files']));
    const klas = klasyfikuj(mapa, z.lista);
    const propozycje = propozycjeNumerow(repo, mapa, a.rev ? commit : null, baza, wersja, mody, klas.typy, plikiModow, z.lista);
    const ctx = {
      korzen, korzenRobocze: repo, mapa, wersja, pliki, zmiany: z.lista,
      baza: { rdzen: baza, mody }, propozycje, trybWydania: a.wydanie,
      pokazZBazy: (rel) => git(repo, ['show', baza.commit + ':' + rel], true),
    };
    const wyniki = [kontrolaMapy(mapa, pliki), klas.wynik];
    const pominiete = [];
    for (const [id, fn] of kontrole.KONTROLE) {
      if (a.tylko && !a.tylko.includes(id)) { pominiete.push(id + ': poza --tylko'); continue; }
      wyniki.push(await fn(ctx));
    }
    const potrzebne = new Set();
    for (const typ of Object.keys(klas.typy)) {
      const wiersz = mapa.wiersze.find((w) => w.id === typ.split(' / ')[0]);
      for (const k of (wiersz && wiersz.kontrole) || []) potrzebne.add(k);
    }
    if (mody.some((m) => m.zmienionych)) potrzebne.add('plugin-test');
    const zest = a.tylko ? { wyniki: [], pominiete: ['ciezkie zestawy: --tylko'] } : await zestawy(ctx, potrzebne, mody.filter((m) => m.zmienionych), a.szybko, a.rev);
    const wszystkie = wyniki.concat(zest.wyniki);
    // Kontrola z zerowym licznikiem nic nie sprawdzila — to blad instrumentu, nie zielen.
    for (const k of wszystkie) {
      if (!k.sprawdzono && !k.bledy.length && k.id !== 'diff') k.bledy.push('sprawdzono 0 - kontrola nie znalazla, czego pilnuje');
    }
    const czerwone = wszystkie.filter((k) => k.bledy.length).length;
    return {
      wersjaSkryptu: 1, rewizja: a.rev ? commit.slice(0, 7) + ' (' + a.rev + ')' : 'drzewo robocze (HEAD ' + commit.slice(0, 7) + ')',
      wersja, trybWydania: a.wydanie, bazy: { rdzen: baza, mody }, propozycje,
      zmiany: { plikow: z.lista.length, pominieteNiesledzone: z.pominieteNiesledzone, typy: klas.typy, osobne: klas.osobne },
      kontrole: wszystkie, pominiete: pominiete.concat(zest.pominiete), czerwone,
      czasS: czas(od), kod: czerwone ? 1 : 0,
    };
  } finally {
    if (worktree) {
      git(repo, ['worktree', 'remove', '--force', worktree], true);
      fs.rmSync(worktree, { recursive: true, force: true });
      git(repo, ['worktree', 'prune'], true);
    }
  }
}

async function main() {
  let a;
  try {
    a = argumenty(process.argv.slice(2));
    const r = await sprawdz(a);
    process.stdout.write(a.json ? JSON.stringify(r, null, 2) + '\n' : raportTekst(r));
    return r.kod;
  } catch (e) {
    const opis = e instanceof NieDaSie ? e.message : (e && e.stack) || String(e);
    if (a && a.json) process.stdout.write(JSON.stringify({ kod: 2, blad: opis }, null, 2) + '\n');
    else process.stderr.write('RelAI release-check: NIE DA SIE SPRAWDZIC - ' + opis + '\n');
    return 2;
  }
}

if (require.main === module) main().then((kod) => { process.exitCode = kod; });

module.exports = { argumenty, bazaRdzenia, bazaModu, kontrolaMapy, klasyfikuj, wierszeDla, propozycjeNumerow, raportTekst, sprawdz };
