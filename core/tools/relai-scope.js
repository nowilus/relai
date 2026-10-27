#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: relai-scope — tryb "RelAI tylko w zaadoptowanych projektach"
// (plan ZASIEG_PLUGINU). Logika w core/process/plugin-scope.js; tu tylko argumenty,
// wywolanie CLI i raport.
//
//   node core/tools/relai-scope.js [status] [folder...]   podglad, zero zapisow
//   node core/tools/relai-scope.js apply [folder...]      lokalne enable, potem globalne disable
//   node core/tools/relai-scope.js undo                   cofniecie z dziennika
//   node core/tools/relai-scope.js on [folder]            jeden projekt (domyslnie biezacy)
//   node core/tools/relai-scope.js off [folder]
//
// Opcje: --home <dir> (domyslnie katalog domowy), --cli <polecenie> (domyslnie claude;
// plik .js/.cjs/.mjs uruchamiany biezacym Node). Kod wyjscia: 0 sukces, 1 blad.
// Zapisy tylko przez `claude plugin enable|disable` (P-052), spawn bez powloki.
//
// Zero zaleznosci npm.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const zp = require('../process/plugin-scope.js');

const POLECENIA = ['status', 'apply', 'undo', 'on', 'off'];
const PRZYKLADY_BRAKU = 5; // historia sesji niesie setki skasowanych folderow tymczasowych
const krotko = (id) => id.replace(/@relai$/, '');

function argumenty(argv) {
  const opcje = { home: os.homedir(), cli: 'claude' };
  const reszta = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--home' || argv[i] === '--cli') {
      if (i + 1 >= argv.length) throw new Error('opcja ' + argv[i] + ' wymaga wartosci');
      opcje[argv[i].slice(2)] = argv[++i];
    } else reszta.push(argv[i]);
  }
  const polecenie = POLECENIA.includes(reszta[0]) ? reszta.shift() : 'status';
  const foldery = reszta.map((f) => path.resolve(f));
  return { ...opcje, home: path.resolve(opcje.home), polecenie, foldery };
}

function uruchamiacz(cli) {
  const przezNode = /\.(c|m)?js$/i.test(cli);
  return (argv, cwd) => {
    const [plik, ...args] = argv;
    const r = przezNode
      ? spawnSync(process.execPath, [plik, ...args], { cwd, encoding: 'utf8', timeout: 60000 })
      : spawnSync(plik, args, { cwd, encoding: 'utf8', timeout: 60000 });
    return { status: r.status, stdout: r.stdout, stderr: r.stderr, error: r.error };
  };
}

function opisLokalnych(k) {
  const pary = Object.entries(k.lokalne);
  return pary.length ? pary.map(([id, v]) => krotko(id) + '=' + v).join(', ') : 'brak wpisow lokalnych';
}

function opisZmian(folder, kroki) {
  const moje = kroki.filter((s) => s.folder === folder && s.zakres !== 'user');
  if (!moje.length) return 'bez zmian';
  const en = moje.filter((s) => s.typ === 'plugin').map((s) => krotko(s.id));
  const wt = moje.some((s) => s.typ === 'worktreeinclude');
  return [en.length ? 'enable lokalnie: ' + en.join(', ') : '', wt ? '+ .worktreeinclude' : ''].filter(Boolean).join(' ');
}

function zbierz(o) {
  const odkryte = zp.odkryjFoldery(o.home, o.foldery);
  const klasy = odkryte.foldery.map(zp.klasyfikuj);
  const zainstalowane = zp.zainstalowaneZestawu(o.home);
  const uzytkownik = zp.wartosciZestawu(zp.plikUzytkownika(o.home));
  const plan = zp.planZmian({ foldery: klasy, zainstalowane, uzytkownik });
  return { odkryte, klasy, zainstalowane, uzytkownik, plan };
}

function raportStatus(o) {
  const { odkryte, klasy, zainstalowane, uzytkownik, plan } = zbierz(o);
  const zaadoptowane = klasy.filter((k) => k.rodzaj === 'zaadoptowany');
  const goscie = klasy.filter((k) => k.rodzaj === 'gosc');
  const out = [];
  out.push('RelAI tylko w zaadoptowanych projektach — podglad (nic nie zapisuje)');
  out.push('');
  out.push('Zestaw zainstalowany: ' + (zainstalowane.length ? zainstalowane.map(krotko).join(', ') : 'zaden'));
  out.push('Poziom uzytkownika teraz: ' + (zainstalowane.map((id) => krotko(id) + '=' + (id in uzytkownik ? uzytkownik[id] : 'brak')).join(', ') || '—'));
  out.push('');
  out.push('Projekty z markerem RelAI: ' + zaadoptowane.length);
  for (const k of zaadoptowane) {
    out.push('  ' + k.folder);
    out.push('      teraz: ' + opisLokalnych(k) + (k.jestWorktree ? ' · worktree' : k.maGit ? '' : ' · bez gita'));
    out.push('      zmiana: ' + opisZmian(k.folder, plan.kroki));
  }
  if (goscie.length) {
    out.push('Tryb goscia (dostaje stan globalny): ' + goscie.length);
    for (const k of goscie) out.push('  ' + k.folder);
  }
  out.push('Inne foldery z historii sesji (bez markera, stan globalny): ' + klasy.filter((k) => k.rodzaj === 'inny').length);
  if (odkryte.brak.length) {
    out.push('Brak folderu (pominiete): ' + odkryte.brak.length + (odkryte.brak.length > PRZYKLADY_BRAKU ? ', pierwsze ' + PRZYKLADY_BRAKU + ':' : ''));
    for (const f of odkryte.brak.slice(0, PRZYKLADY_BRAKU)) out.push('  ' + f);
  }
  if (odkryte.pominietyDom) out.push('Folder domowy pominiety: jego .claude/settings.json to plik uzytkownika.');
  const pom = plan.pominiete.filter((p) => p.folder);
  if (pom.length) {
    out.push('Pominiete wartosci lokalne:');
    for (const p of pom) out.push('  ' + p.folder + ' · ' + krotko(p.id) + ': ' + p.powod);
  }
  const wt = plan.kroki.filter((s) => s.typ === 'worktreeinclude');
  out.push('');
  out.push('.worktreeinclude do utworzenia albo zmiany: ' + wt.length);
  for (const s of wt) {
    const jest = fs.existsSync(path.join(s.folder, '.worktreeinclude'));
    out.push('  ' + path.join(s.folder, '.worktreeinclude') + (jest ? ' (dopisanie linii)' : ' (nowy plik)'));
  }
  const glob = plan.kroki.filter((s) => s.zakres === 'user');
  out.push('Globalne disable (na koncu apply): ' + (glob.length ? glob.map((s) => krotko(s.id)).join(', ') : 'nic'));
  out.push('Krokow w planie: ' + plan.kroki.length + '. Zapis: node core/tools/relai-scope.js apply');
  return out.join('\n');
}

function wypiszBlad(w, naglowek) {
  const out = [naglowek];
  if (w.brakCli) {
    out.push('Nie znaleziono polecenia claude — nic nie zapisano.');
    out.push('Instalacja z npm daje claude.cmd, ktorego narzedzie nie uruchamia bez powloki: podaj pelna sciezke opcja --cli.');
  }
  if (w.blad) out.push('Blad: ' + w.blad);
  if (w.reczne && w.reczne.length) {
    out.push('Do wykonania recznie, w tej kolejnosci:');
    for (const r of w.reczne) out.push('  ' + r);
  }
  return out.join('\n');
}

function glowna(argv) {
  let o;
  try { o = argumenty(argv); } catch (e) { return { kod: 1, tekst: 'Blad: ' + e.message }; }
  const brakujace = o.foldery.filter((f) => !fs.existsSync(f));
  if (brakujace.length && o.polecenie !== 'status' && o.polecenie !== 'apply') {
    return { kod: 1, tekst: 'Folder nie istnieje: ' + brakujace.join(', ') + ' — nic nie zapisano.' };
  }
  const ctx = { uruchom: uruchamiacz(o.cli), cli: o.cli, home: o.home, teraz: new Date().toISOString() };

  if (o.polecenie === 'status') return { kod: 0, tekst: raportStatus(o) };

  if (o.polecenie === 'apply') {
    const { plan } = zbierz(o);
    const w = zp.wykonajPlan(plan.kroki, ctx);
    if (!w.ok) return { kod: 1, tekst: wypiszBlad(w, 'apply przerwane po ' + w.wykonane.length + ' z ' + plan.kroki.length + ' krokow. Globalne disable nie zostalo wykonane, jesli stalo dalej. Cofniecie: undo.') };
    return { kod: 0, tekst: 'apply: ' + w.wykonane.length + ' krokow wykonanych. Dziennik: ' + zp.plikDziennika(o.home) + '\nZmiana dziala po /reload-plugins albo w nowej sesji.' };
  }

  if (o.polecenie === 'undo') {
    const w = zp.cofnij(ctx);
    if (w.brakDziennika) {
      return { kod: 0, tekst: 'Brak dziennika ' + zp.plikDziennika(o.home) + ' — nic nie zmieniono.\nReczne przywrocenie globalne:\n' +
        zp.ZESTAW.map((id) => '  ' + o.cli + ' plugin enable ' + id + ' --scope user').join('\n') };
    }
    if (!w.ok) return { kod: 1, tekst: wypiszBlad(w, 'undo przerwane po ' + w.cofniete.length + ' krokach.') };
    return { kod: 0, tekst: w.cofniete.length ? 'undo: ' + w.cofniete.length + ' krokow cofnietych.' : 'undo: nic do cofniecia.' };
  }

  // on / off
  const folder = o.foldery[0] || process.cwd();
  if (zp.kluczSciezki(folder) === zp.kluczSciezki(o.home)) {
    return { kod: 1, tekst: 'Folder domowy pominiety: jego .claude/settings.json to plik uzytkownika — nic nie zapisano.' };
  }
  const wlacz = o.polecenie === 'on';
  const { klasyfikacja, kroki } = zp.planJednego(folder, wlacz, zp.zainstalowaneZestawu(o.home));
  const w = zp.wykonajJednego(kroki, ctx);
  if (!w.ok) return { kod: 1, tekst: wypiszBlad(w, o.polecenie + ' przerwane w ' + folder + '.') };
  const uwaga = klasyfikacja.rodzaj === 'zaadoptowany' ? '' : ' (folder bez markera RelAI: ' + klasyfikacja.rodzaj + ')';
  return { kod: 0, tekst: o.polecenie + ': ' + folder + uwaga + ' — ' + (w.wykonane.length ? w.wykonane.length + ' krokow.' : 'bez zmian.') };
}

if (require.main === module) {
  const { kod, tekst } = glowna(process.argv.slice(2));
  (kod ? process.stderr : process.stdout).write(tekst + '\n');
  process.exit(kod);
}

module.exports = { glowna, argumenty };
