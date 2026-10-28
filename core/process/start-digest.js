#!/usr/bin/env node
'use strict';
// RelAI core / proces: start-digest — skrot startu sesji (KONTEKST_STARTU E2).
//
// Rytual startu czytal cale dokumenty (ok. 80 KB), choc akapit "gdzie jestesmy" potrzebuje
// z nich kilku sekcji. To narzedzie wypisuje dokladnie te sekcje i liste drogowskazow do reszty:
// z STATE "Gdzie jestesmy", "Nad czym pracujemy teraz", "Co blokuje" i pierwszy punkt "Co dalej";
// tabele ryzyk bez kolumny "Mitygacja"; sekcje "Czeka na czlowieka" tylko przy sprawie
// przeterminowanej; ostatni wpis dziennika; aktywne wiersze USTAWIEN; STATUS planu naprawde
// aktywnego (parser z E1); z "Zasad aktywnych" sam indeks z wyzwalaczami (E4, D-15 Aneks A),
// a w projekcie bez indeksu sekcja w calosci. Wyjscie zawsze w limicie polecenia (E5, Aneks F):
// sekcja za duza staje sie drogowskazem "Przeczytaj ja teraz narzedziem Read: plik, linie A-B".
//
// Jedno polecenie zamiast trzech list (CLAUDE.md, hook, skill): `node .claude/relai/tools/start-digest.js`.
// Kopia w projekcie lezy obok kopii session-signals.js (lista NARZEDZIA), wiec require nizej
// dziala w repozytorium i w projekcie ta sama sciezka wzgledna.
//
// Komunikaty wlasne ASCII (L-0016), tresc dokumentow w jezyku projektu. Kod wyjscia zawsze 0:
// brak sekcji to linia "brak sekcji ...", nie awaria (ryzyko 7 planu).
//
// Uzycie: node start-digest.js [katalog-projektu]

const fs = require('fs');
const path = require('path');
const core = require('./session-signals.js');

// Naglowki szukane od poczatku tytulu (L-0025), z tolerancja numeracji "## 2." (zasada 11);
// "**...**" i cudzyslowy zdejmuje wytnijSekcje.
const NR = '^(?:\\d+\\.\\s*)?';
const wzorce = (...zrodla) => zrodla.map((z) => new RegExp(NR + z, 'i'));

const SEKCJE_STATE = [
  { nazwa: 'Gdzie jestesmy', wzorce: wzorce('gdzie jeste[śs]my\\b', 'where we are\\b') },
  { nazwa: 'Nad czym pracujemy teraz', wzorce: wzorce('nad czym pracujemy\\b', 'what we.?re working on\\b', 'what we are working on\\b', 'working on now\\b') },
  { nazwa: 'Co blokuje', wzorce: wzorce('co blokuje\\b', 'what blocks\\b', 'blockers\\b', 'blocked\\b') },
  { nazwa: 'Co dalej', wzorce: wzorce('co dalej\\b', 'what.?s next\\b', 'next steps?\\b'), pierwszyPunkt: true },
];
const NAGLOWEK_RYZYK = wzorce('stan otwartych ryzyk\\b', 'open risks\\b');
const NAGLOWEK_CZEKA = wzorce('czeka na cz[łl]owieka\\b', 'waiting on a human\\b');
const NAGLOWEK_ZASAD = wzorce('zasady aktywne\\b', 'active rules\\b');
const NAGLOWEK_INDEKSU = wzorce('indeks\\b', 'index\\b');
const NAGLOWEK_WYCOFANE = wzorce('ustawienia wycofane\\b', 'withdrawn settings\\b');
const KOLUMNA_MITYGACJI = /^(?:mitygacja|mitigation)$/i;
// Limit wyjscia, ktore model dostaje w calosci: Claude Code ok. 30 tys. znakow, ponad nim podglad
// 2 KB (L-0296). 28 tys. zostawia zapas na roznice liczenia znakow (Aneks C planu KONTEKST_STARTU).
const LIMIT_ZNAKOW = 28000;
// Sekcja dluzsza niz to, w skrocie ponad limitem, zamienia sie w drogowskaz z zakresem linii
// (Aneks F planu KONTEKST_STARTU). Skalibrowane 2026-10-28: najwieksza sekcja skrotu tego repo
// ma 6 711 znakow (ryzyka) i zostaje; w projektach Lukasza sekcje ponad limitem maja 15–70 KB
// ("Zasady aktywne" bez indeksu, "Czeka na czlowieka" przy sprawach przeterminowanych, STATE).
const PROG_SEKCJI_ZNAKOW = 8000;
// Separator komorki niepoprzedzony znakiem ucieczki (zasada 5, parsowanie).
const SEPARATOR = /(?<!\\)\|/;

function czytajLF(p) {
  try { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); } catch (_) { return null; }
}

function pierwszyIstniejacy(dir, nazwy) {
  for (const n of nazwy) {
    const p = path.join(dir, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function wzgledna(cwd, p) {
  return path.relative(cwd, p).split(path.sep).join('/');
}

// Cialo sekcji bez linii naglowka, bez koncowych pustych linii i linii "---".
function cialo(sekcja) {
  const linie = sekcja.split('\n').slice(1);
  while (linie.length && /^\s*(?:-{3,})?\s*$/.test(linie[linie.length - 1])) linie.pop();
  while (linie.length && !linie[0].trim()) linie.shift();
  return linie.join('\n');
}

// Pierwszy punkt listy (albo pierwszy akapit): od pierwszej niepustej linii do pustej linii
// albo do poczatku kolejnego punktu na tym samym wcieciu.
function pierwszyPunkt(tekst) {
  const linie = tekst.split('\n');
  const out = [];
  for (const linia of linie) {
    if (!out.length) {
      if (linia.trim()) out.push(linia);
      continue;
    }
    if (!linia.trim()) break;
    if (/^(?:[-*]|\d+\.)\s+/.test(linia)) break;
    out.push(linia);
  }
  return out.join('\n');
}

// Tabela bez kolumny "Mitygacja". Indeks kolumny z pierwszego wiersza naglowka; wiersze tabel
// dalej w sekcji (bez wlasnego naglowka, jak w tym repo) traca te sama kolumne.
function bezMitygacji(tekst) {
  const linie = tekst.split('\n');
  let indeks = -1;
  for (const linia of linie) {
    if (!linia.trim().startsWith('|')) continue;
    const komorki = linia.split(SEPARATOR).map((c) => c.trim());
    indeks = komorki.findIndex((c) => KOLUMNA_MITYGACJI.test(c.replace(/\*\*/g, '')));
    break;
  }
  if (indeks < 0) return tekst;
  return linie.map((linia) => {
    if (!linia.trim().startsWith('|')) return linia;
    const komorki = linia.split(SEPARATOR);
    if (komorki.length <= indeks + 1) return linia;
    return komorki.filter((_, i) => i !== indeks).join('|');
  }).join('\n');
}

// Blok skrotu: tytul, tresc i (gdy jest) zrodlo { rel, od, do } — plik i zakres linii, z ktorych
// tresc pochodzi; zrodlo pozwala zamienic za duza sekcje w drogowskaz do odczytu (Aneks F).
function blok(tytul, tresc, zrodlo) {
  return { tytul, tresc, zrodlo: zrodlo || null };
}

function pokaz(b) {
  return '=== ' + b.tytul + ' ===\n' + b.tresc;
}

// Zakres linii (od 1) fragmentu w tekscie pliku po normalizacji CRLF -> LF (liczba linii ta sama).
function linieSekcji(rel, txt, fragment) {
  const i = txt.indexOf(fragment);
  if (i < 0) return null;
  const od = txt.slice(0, i).split('\n').length;
  return { rel, od, do: od + fragment.replace(/\n+$/, '').split('\n').length - 1 };
}

function drogowskazSekcji(b) {
  return '[sekcja za duza do skrotu startu: ' + b.tresc.length + ' znakow. Przeczytaj ja teraz narzedziem Read: ' +
    b.zrodlo.rel + ', linie ' + b.zrodlo.od + '-' + b.zrodlo.do + ']';
}

function czescState(cwd, docsDir) {
  const plik = pierwszyIstniejacy(docsDir, ['STATE.md']);
  if (!plik) return { bloki: [blok('docs/STATE.md', 'brak pliku docs/STATE.md')], inne: [] };
  const txt = czytajLF(plik) || '';
  const rel = wzgledna(cwd, plik);
  const bloki = SEKCJE_STATE.map((s) => {
    const sekcja = core.wytnijSekcje(txt, s.wzorce);
    if (sekcja === null) return blok(rel, 'brak sekcji "' + s.nazwa + '"');
    const naglowek = sekcja.split('\n')[0].replace(/^#+\s*/, '').trim();
    const tresc = cialo(sekcja);
    return s.pierwszyPunkt
      ? blok(rel + ' - ' + naglowek + ' (pierwszy punkt)', pierwszyPunkt(tresc))
      : blok(rel + ' - ' + naglowek, tresc, linieSekcji(rel, txt, sekcja));
  });
  // Pozostale sekcje drugiego poziomu — do drogowskazu, z nazwy.
  const znane = SEKCJE_STATE.flatMap((s) => s.wzorce);
  const inne = txt.split('\n').map((l) => l.match(/^##\s+(.*)/)).filter(Boolean)
    .map((m) => m[1].trim()).filter((t) => !znane.some((w) => w.test(t.replace(/[„”"'*`]/g, ''))));
  return { bloki, inne, rel };
}

function czescDziennika(cwd, docsDir, opcje) {
  const plik = pierwszyIstniejacy(docsDir, ['DZIENNIK.md', 'JOURNAL.md']);
  if (!plik) return { bloki: [blok('docs/DZIENNIK.md', 'brak pliku docs/DZIENNIK.md')] };
  const txt = czytajLF(plik) || '';
  const rel = wzgledna(cwd, plik);
  const bloki = [];
  const ryzyka = core.wytnijSekcje(txt, NAGLOWEK_RYZYK);
  bloki.push(ryzyka === null
    ? blok(rel, 'brak sekcji "Stan otwartych ryzyk"')
    : blok(rel + ' - ' + ryzyka.split('\n')[0].replace(/^#+\s*/, '').trim() + ' (bez kolumny Mitygacja)',
      bezMitygacji(cialo(ryzyka)), linieSekcji(rel, txt, ryzyka)));

  // "Czeka na czlowieka" tylko przy sprawie przeterminowanej — ta sama miara co hook startu.
  const miara = core.sprawyPrzeterminowane(cwd, { dzisiaj: opcje.dzisiaj });
  const przeterminowane = miara && Array.isArray(miara.przeterminowane) ? miara.przeterminowane.length : 0;
  if (przeterminowane > 0) {
    const czeka = core.wytnijSekcje(txt, NAGLOWEK_CZEKA);
    if (czeka !== null) {
      bloki.push(blok(rel + ' - ' + czeka.split('\n')[0].replace(/^#+\s*/, '').trim() +
        ' (spraw przeterminowanych: ' + przeterminowane + ', prog ' + miara.N + ' dni)', cialo(czeka),
        linieSekcji(rel, txt, czeka)));
    }
  }

  const wpis = core.ostatniWpis(txt);
  const trescWpisu = wpis === null ? null : wpis.replace(/\n+$/, '');
  const blokWpisu = trescWpisu === null
    ? blok(rel, 'brak wpisow (naglowkow ### albo ## z data)')
    : blok(rel + ' - ostatni wpis', trescWpisu, linieSekcji(rel, txt, trescWpisu));
  blokWpisu.wpis = trescWpisu !== null;
  bloki.push(blokWpisu);
  return { bloki, rel, czeka: przeterminowane > 0, wpis: trescWpisu };
}

// Skrocenie ostatniego wpisu, gdy skrot przekracza limit (Aneks C): poczatek wpisu do granicy
// linii, a na koncu linia z liczbami i drogowskazem. Kolejnosc wzgledem zamiany sekcji
// w drogowskazy (Aneks F) ustala startDigest.
function skroconyWpis(wpis, nadmiar, rel) {
  const dopisek = (n) => '\n\n[wpis skrocony do ' + n + ' z ' + wpis.length + ' znakow; calosc: ' + rel +
    ' - ostatni wpis]';
  let dlugosc = Math.max(0, wpis.length - nadmiar - dopisek(wpis.length).length);
  const koniecLinii = wpis.lastIndexOf('\n', dlugosc);
  if (koniecLinii > 0) dlugosc = koniecLinii;
  const poczatek = wpis.slice(0, dlugosc).replace(/\n+$/, '');
  return poczatek + dopisek(poczatek.length);
}

function czescUstawien(cwd, docsDir) {
  const plik = pierwszyIstniejacy(docsDir, ['USTAWIENIA.md', 'SETTINGS.md']);
  if (!plik) return { bloki: [blok('docs/USTAWIENIA.md', 'brak pliku docs/USTAWIENIA.md')] };
  const txt = czytajLF(plik) || '';
  const rel = wzgledna(cwd, plik);
  const wycofane = core.wytnijSekcje(txt, NAGLOWEK_WYCOFANE);
  const aktywne = wycofane === null ? txt : txt.replace(wycofane, '');
  const linie = aktywne.split('\n').filter((l) => l.trim().startsWith('|') || /^(?:Wersja RelAI|RelAI version)\b/i.test(l));
  return {
    bloki: [blok(rel + ' - wiersze aktywne (bez "Ustawien wycofanych")', linie.join('\n'),
      { rel, od: 1, do: txt.replace(/\n+$/, '').split('\n').length })],
    rel,
    wycofane: wycofane !== null,
  };
}

function czescPlanu(cwd) {
  const linia = core.liniaAktywnegoPlanu(cwd);
  const link = linia && !linia.brak ? linia.link : null;
  const p = link ? path.resolve(cwd, link) : null;
  if (!p || !fs.existsSync(p)) {
    return { bloki: [blok('Aktywny plan', 'brak aktywnego planu (linia "Aktywny plan" w CLAUDE.md)')] };
  }
  const rel = wzgledna(cwd, p);
  const tresc = (czytajLF(p) || '').replace(/\n+$/, '');
  return { bloki: [blok('Aktywny plan - ' + rel, tresc, { rel, od: 1, do: tresc.split('\n').length })], rel };
}

function czescLekcji(cwd, docsDir) {
  const plik = pierwszyIstniejacy(docsDir, ['LEKCJE.md', 'LESSONS.md']);
  if (!plik) return { bloki: [blok('docs/LEKCJE.md', 'brak pliku docs/LEKCJE.md')] };
  const txt = czytajLF(plik) || '';
  const rel = wzgledna(cwd, plik);
  const zasady = core.wytnijSekcje(txt, NAGLOWEK_ZASAD);
  if (zasady === null) return { bloki: [blok(rel, 'brak sekcji "Zasady aktywne"')], rel };
  const tytul = rel + ' - ' + zasady.split('\n')[0].replace(/^#+\s*/, '').trim();
  // Indeks (D-15, Aneks A): podsekcja "Indeks" wchodzi sama, z drogowskazem do pelnego brzmienia.
  // Brak indeksu albo indeks pusty (projekt sprzed E4) -> sekcja w calosci, bez zgadywania.
  const indeks = core.wytnijSekcje(zasady.split('\n').slice(1).join('\n'), NAGLOWEK_INDEKSU);
  const trescIndeksu = indeks === null ? '' : cialo(indeks);
  return {
    // Zdanie wykonawcze w warstwie obecnej w kazdej sesji (zasada 8, Aneks D): sam opis
    // indeksu w LEKCJE.md nie wystarczyl, model nie porownywal zadania z wyzwalaczami.
    bloki: [trescIndeksu
      ? blok(tytul + ' (indeks)', 'Zanim pierwszy raz zmienisz plik, porownaj zadanie z wyzwalaczami ponizej; ' +
        'trafienie = Read pelnego brzmienia tej zasady z ' + rel + ' (podsekcja pelnego brzmienia), dopiero potem praca.\n\n' +
        trescIndeksu, linieSekcji(rel, txt, indeks))
      : blok(tytul, cialo(zasady), linieSekcji(rel, txt, zasady))],
    rel,
    indeks: Boolean(trescIndeksu),
  };
}

function drogowskazy(cwd, docsDir, c) {
  const out = [];
  if (c.state.rel) {
    out.push('- ' + c.state.rel + ' - dalsze punkty "Co dalej"' +
      (c.state.inne.length ? ' i sekcje: ' + c.state.inne.join(', ') : ''));
  }
  if (c.dziennik.rel) {
    out.push('- ' + c.dziennik.rel + ' - kolumna "Mitygacja" tabeli ryzyk' +
      (c.dziennik.czeka ? '' : ', sekcja "Czeka na czlowieka"') + ', starsze wpisy');
  }
  if (c.lekcje.rel) {
    out.push('- ' + c.lekcje.rel + ' - ' + (c.lekcje.indeks ? 'pelne brzmienie "Zasad aktywnych" przy wyzwalaczu, ' : '') +
      'pelne wpisy lekcji (L-...)');
  }
  if (c.ustawienia.rel && c.ustawienia.wycofane) out.push('- ' + c.ustawienia.rel + ' - sekcja "Ustawienia wycofane"');
  if (c.plan.rel) out.push('- ' + path.posix.dirname(c.plan.rel) + '/ - plan aktywny (PLAN, prompty etapow)');
  for (const [nazwy, opis] of [
    [['DECYZJE.md', 'DECISIONS.md'], 'rejestr decyzji, gdy temat ich dotyczy; zamrozonych nie proponujesz ponownie'],
    [['PULAPKI.md', 'PITFALLS.md'], 'pulapki narzedzi, zanim uznasz, ze cos jest zepsute'],
    [['KOMENDY.md', 'COMMANDS.md'], 'sciaga komend i fraz'],
  ]) {
    const p = pierwszyIstniejacy(docsDir, nazwy);
    if (p) out.push('- ' + wzgledna(cwd, p) + ' - ' + opis);
  }
  return pokaz(blok('Drogowskazy (pelne tresci otwierasz dopiero, gdy zadanie ich wymaga)', out.join('\n') || '- brak'));
}

// Zwraca { tekst, czesci: [{ id, bajty }] } albo null poza projektem RelAI. Identyfikatory
// czesci to pozycje budzetu startu (progi czastkowe), "skrot" to ramka i drogowskazy.
function startDigest(cwd, opcje) {
  const o = opcje || {};
  if (!cwd || !core.relaiMarkerFile(cwd, o.markeryGoscia)) return null;
  const docsDir = path.join(cwd, 'docs');
  const c = {
    state: czescState(cwd, docsDir),
    dziennik: czescDziennika(cwd, docsDir, o),
    ustawienia: czescUstawien(cwd, docsDir),
    plan: czescPlanu(cwd),
    lekcje: czescLekcji(cwd, docsDir),
  };
  // Brak planu = brak pozycji "status", nie zero (jak w budzecie do E2): linia "brak aktywnego
  // planu" liczy sie do ramki.
  // Indeks zasad zaraz po STATE, przed ryzykami i wpisem dziennika (Aneks C): tresc obowiazkowa
  // nie moze stac na koncu wyjscia, ktore bywa przyciete do podgladu (L-0296).
  const czesci = [
    { id: 'STATE', cz: c.state },
    { id: 'zasady', cz: c.lekcje },
    { id: 'ryzyka', cz: c.dziennik },
    { id: 'ustawienia', cz: c.ustawienia },
    { id: c.plan.rel ? 'status' : 'skrot', cz: c.plan },
  ];
  const tekstCzesci = (x) => x.cz.bloki.map(pokaz).join('\n\n');
  const naglowek = '[RelAI skrot startu] ' + (o.dzisiaj || core.todayLocal()) + '. To jest caly odczyt ' +
    'startu sesji: akapit "gdzie jestesmy" piszesz z ponizszych sekcji, nie otwierajac plikow, ' +
    'ktore skrot streszcza.';
  const zloz = () => [naglowek].concat(czesci.map(tekstCzesci), drogowskazy(cwd, docsDir, c)).join('\n\n') + '\n';
  let tekst = zloz();
  // Limit wyjscia (Aneks F): najpierw sekcje ponad progiem, od najwiekszej, zamieniaja sie
  // w drogowskaz do odczytu; potem skraca sie ostatni wpis (Aneks C); na koniec, gdy to nie
  // wystarczy, drogowskazem staje sie kazda sekcja ze zrodlem, znow od najwiekszej.
  const bloki = () => czesci.flatMap((x) => x.cz.bloki);
  const zastapNajwieksza = (warunek) => {
    const k = bloki().filter((b) => b.zrodlo && !b.zastapiona && warunek(b))
      .sort((a, b) => b.tresc.length - a.tresc.length)[0];
    if (!k || k.tresc.length <= drogowskazSekcji(k).length) return false;
    k.tresc = drogowskazSekcji(k);
    k.zastapiona = true;
    tekst = zloz();
    return true;
  };
  while (tekst.length > LIMIT_ZNAKOW && zastapNajwieksza((b) => !b.wpis && b.tresc.length > PROG_SEKCJI_ZNAKOW));
  const blokWpisu = c.dziennik.bloki.find((b) => b.wpis);
  if (tekst.length > LIMIT_ZNAKOW && blokWpisu) {
    blokWpisu.tresc = skroconyWpis(c.dziennik.wpis, tekst.length - LIMIT_ZNAKOW, c.dziennik.rel);
    blokWpisu.zrodlo = null;
    tekst = zloz();
  }
  while (tekst.length > LIMIT_ZNAKOW && zastapNajwieksza(() => true));
  const bajty = (t) => Buffer.byteLength(t, 'utf8');
  const policzone = czesci.filter((x) => x.id !== 'skrot')
    .map((x) => ({ id: x.id, sciezka: x.cz.rel || null, bajty: bajty(tekstCzesci(x)) }));
  const reszta = bajty(tekst) - policzone.reduce((s, x) => s + x.bajty, 0);
  return { tekst, czesci: policzone.concat([{ id: 'skrot', sciezka: null, bajty: reszta }]) };
}

module.exports = { startDigest, bezMitygacji, pierwszyPunkt, LIMIT_ZNAKOW };

if (require.main === module) {
  const cwd = path.resolve(process.argv[2] || process.cwd());
  const wynik = startDigest(cwd);
  process.stdout.write(wynik
    ? wynik.tekst
    : '[RelAI skrot startu] Ten folder nie jest projektem RelAI - skrotu nie ma.\n');
  process.exit(0);
}
