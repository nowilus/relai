#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: git pre-push - bramka tagow wydan (plan PIPELINE_WYDAN, E3).
//
// Po co: raport gotowosci (release-check.js) mowi, czy wydanie jest gotowe, ale nic nie
// zatrzymywalo tagu wypchnietego mimo czerwieni. Ten hook zatrzymuje push tagu wydania, gdy raport
// na drzewie tagu ma czerwone kontrole. Push zwyklego commitu przechodzi bez kontroli (PLAN, sekcja 8).
//
// Instalowany przez core/tools/install-prepush.js jako .git/hooks/relai-pre-push.cjs, wolany
// przez shim .git/hooks/pre-push (uklad jak pre-commit od 1.9.2: .cjs wygrywa z "type": "module").
// Hook dziala w kazdym narzedziu, ktore pushuje gitem (Claude Code, Codex, Cursor, terminal).
//
// Wejscie (git): stdin, linie "<lokalny ref> <lokalny sha> <zdalny ref> <zdalny sha>".
//   refs/tags/v<cyfra>...            -> release-check.js --rev <sha> --wydanie
//   refs/tags/relai-<mod>-v<cyfra>... -> to samo z --komponent relai-<mod> (wydanie samego modu)
//   lokalny sha z samych zer (usuniecie tagu) i kazdy inny ref -> bez kontroli.
// Raport liczy release-check.js z drzewa roboczego repozytorium (narzedzie biezace, drzewo tagu).
//
// Obejscie: RELAI_RELEASE_OBEJSCIE="<powod>". Pusty powod (takze same spacje) nie obchodzi bramki.
// Obejscie z powodem dopisuje linie do docs/DZIENNIK.md (koniec sekcji "Wpisy"): data, tag, czerwone
// kontrole, powod - kazde obejscie to sygnal do poprawki kontroli (ryzyko S1 planu).
//
// Kod wyjscia: 0 = push przechodzi, 1 = push zatrzymany. Komunikaty ASCII (L-0016).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ZERA = /^0+$/;
const TAG_RDZENIA = /^refs\/tags\/(v\d[^/]*)$/;
const TAG_MODU = /^refs\/tags\/((relai-[a-z0-9-]+)-v\d[^/]*)$/;

function tagiWydan(wejscie) {
  const out = [];
  for (const linia of String(wejscie || '').split(/\r?\n/)) {
    const [, sha, zdalny] = linia.trim().split(/\s+/);
    if (!zdalny || !sha || ZERA.test(sha)) continue;
    const m = TAG_MODU.exec(zdalny);
    if (m) { out.push({ tag: m[1], sha, komponent: m[2] }); continue; }
    const r = TAG_RDZENIA.exec(zdalny);
    if (r) out.push({ tag: r[1], sha, komponent: null });
  }
  return out;
}

function sprawdzTag(repo, t) {
  const skrypt = path.join(repo, 'core', 'tools', 'release-check.js');
  if (!fs.existsSync(skrypt)) return { czerwone: ['nie da sie sprawdzic: brak ' + skrypt] };
  const args = [skrypt, '--rev', t.sha, '--wydanie', '--json'].concat(t.komponent ? ['--komponent', t.komponent] : []);
  const r = spawnSync(process.execPath, args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 1800000, windowsHide: true });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch (_) { /* nizej */ }
  if (!json) return { czerwone: ['nie da sie sprawdzic: release-check.js kod ' + r.status + ' bez raportu JSON'] };
  if (json.blad) return { czerwone: ['nie da sie sprawdzic: ' + json.blad] };
  // Raport bez kontroli albo bez kodu nie jest zielenia (przeglad E3, LOW 4).
  if (!Array.isArray(json.kontrole) || !json.kontrole.length || typeof json.kod !== 'number') {
    return { czerwone: ['nie da sie sprawdzic: raport bez kontroli albo bez kodu'] };
  }
  const czerwone = json.kontrole.filter((k) => k.bledy && k.bledy.length).map((k) => k.id + ': ' + k.bledy[0]);
  if ((r.status !== 0 || json.kod !== 0) && !czerwone.length) czerwone.push('release-check.js kod ' + r.status + ' / raport ' + json.kod);
  return { czerwone, czas: json.czasS };
}

function dzis() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

// Wlasny wpis "### <data> — ..." na koncu sekcji "## Wpisy" (przed nastepnym naglowkiem "## " albo
// na koncu pliku) - nie punkt doklejony do cudzego wpisu (przeglad E3, MEDIUM 2). Wstawka miedzy
// kawalki oryginalnego tekstu: konce linii reszty pliku zostaja nietkniete (MEDIUM 3).
function dopiszDoDziennika(repo, linie) {
  const plik = path.join(repo, 'docs', 'DZIENNIK.md');
  let tekst;
  try { tekst = fs.readFileSync(plik, 'utf8'); } catch (_) { return false; }
  const eol = tekst.includes('\r\n') ? '\r\n' : '\n';
  const kawalki = tekst.split(/(?<=\n)/);
  const start = kawalki.findIndex((l) => /^## Wpisy\s*$/.test(l.trimEnd()));
  if (start < 0) return false;
  let koniec = kawalki.findIndex((l, i) => i > start && /^## /.test(l));
  if (koniec < 0) koniec = kawalki.length;
  let wstaw = koniec;
  while (wstaw > start + 1 && kawalki[wstaw - 1].trim() === '') wstaw--;
  const przed = kawalki.slice(0, wstaw).join('');
  const separator = przed.endsWith('\n') ? '' : eol;
  // Puste linie przed nastepnym naglowkiem zostaja w oryginale (kawalki od "wstaw") - nie dokladamy.
  const wpis = separator + eol + linie.join(eol) + eol + (wstaw < kawalki.length && kawalki[wstaw].trim() !== '' ? eol : '');
  fs.writeFileSync(plik, przed + wpis + kawalki.slice(wstaw).join(''));
  return true;
}

function main() {
  let wejscie;
  try { wejscie = fs.readFileSync(0, 'utf8'); } catch (e) {
    // Nieczytelny stdin to nie "brak refow": odmowa, bo nie wiemy, czy nie ma tam tagu (przeglad E3, HIGH 1).
    process.stderr.write('RelAI pre-push: push ZATRZYMANY - nie moge odczytac listy refow ze stdin (' + e.code + ').\n');
    return 1;
  }
  const tagi = tagiWydan(wejscie);
  if (!tagi.length) return 0;

  const repoR = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8', windowsHide: true });
  const repo = repoR.status === 0 ? repoR.stdout.trim() : process.cwd();

  const odmowy = [];
  for (const t of tagi) {
    process.stderr.write('RelAI pre-push: sprawdzam tag ' + t.tag + (t.komponent ? ' (komponent ' + t.komponent + ')' : '') + ' - release-check.js --rev --wydanie\n');
    const w = sprawdzTag(repo, t);
    if (!w.czerwone.length) { process.stderr.write('RelAI pre-push: tag ' + t.tag + ' gotowy (' + w.czas + ' s)\n'); continue; }
    odmowy.push(Object.assign({}, t, w));
  }
  if (!odmowy.length) return 0;

  const lista = odmowy.map((o) => '  ' + o.tag + ':\n' + o.czerwone.map((c) => '    - ' + c).join('\n')).join('\n');
  const powod = String(process.env.RELAI_RELEASE_OBEJSCIE || '').replace(/\s+/g, ' ').trim();
  if (powod) {
    for (const o of odmowy) {
      const wpis = ['### ' + dzis() + ' — Obejście bramki pre-push: tag `' + o.tag + '`', '',
        '- Czerwone: ' + o.czerwone.map((c) => c.split(':')[0]).join(', ') + '.', '- Powód: ' + powod,
        '', 'Autor: hook pre-push (RELAI_RELEASE_OBEJSCIE)'];
      if (!dopiszDoDziennika(repo, wpis)) {
        process.stderr.write('RelAI pre-push: push ZATRZYMANY - obejscie wymaga linii w docs/DZIENNIK.md (sekcja "## Wpisy"), a nie moge jej dopisac.\n' + lista + '\n');
        return 1;
      }
    }
    process.stderr.write('RelAI pre-push: OBEJSCIE bramki z powodem - push przechodzi mimo czerwieni:\n' + lista + '\n'
      + 'Linia obejscia dopisana do docs/DZIENNIK.md (niezacommitowana). Popraw kontrole albo jej przyczyne.\n');
    return 0;
  }
  process.stderr.write('RelAI pre-push: push ZATRZYMANY - tag wydania ma czerwone kontrole:\n' + lista + '\n'
    + 'Pelny raport: node core/tools/release-check.js --rev <tag> --wydanie [--komponent relai-<mod>]\n'
    + 'Swiadome obejscie tylko z powodem (trafi do docs/DZIENNIK.md):\n'
    + '  RELAI_RELEASE_OBEJSCIE="<powod>" git push ...\n');
  return 1;
}

if (require.main === module) process.exit(main());

module.exports = { tagiWydan, dopiszDoDziennika };
