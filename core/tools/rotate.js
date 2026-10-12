#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie: rotacja dziennika i ryzyk zamknietych jako skrypt (AUDYT_SKILLI S4).
//
// Po co: rotacja jest jedyna operacja niszczaca na kilku plikach naraz, a do 2.9.0 wykonywal ja
// model recznie wg SPEC_ARCHIWUM.md — z suma liczona skryptem ad hoc, ktory raz padl na wlasnym
// defekcie. Tu ten sam mechanizm dwufazowy jako kod: plan -> kopia -> odczyt z dysku -> porownanie
// sum -> dopiero wtedy przyciecie zywego pliku.
//
//   node .claude/relai/tools/rotate.js plan    <dziennik|ryzyka> [opcje]   zakres i trzy wagi, nic nie zapisuje
//   node .claude/relai/tools/rotate.js sprawdz <dziennik|ryzyka> [opcje]   suma fragmentu kontra plik archiwum
//   node .claude/relai/tools/rotate.js wykonaj <dziennik|ryzyka> [opcje]   faza 1 i -- po zgodnosci sum -- faza 2
//
// Opcje: --plik docs/DZIENNIK.md · --prog <KB> (dziennik 150, ryzyka 12) · --data RRRR-MM-DD
//        --projekt "<nazwa>" (domyslnie z naglowka # pliku) · --archiwum <plik> (tylko sprawdz)
// Kody wyjscia: 0 = zrobione albo nic do zrobienia, 2 = nie da sie sprawdzic (brak pliku, uklad
// spoza obslugi), 3 = STOP: sumy rozne, zywy plik nietkniety.
// Lekcje, mitygacje i ustawienia rotuje model wg SPEC_ARCHIWUM.md — tego skrypt nie robi.
// Komunikaty bez polskich znakow diakrytycznych (L-0016); tresc plikow — w jezyku projektu.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KB = 1024;
const NIETYKALNE_WPISY = 10;
const CEL = 0.6; // D-88: cel na wadze calkowitej, 60% progu
const PROG_DOMYSLNY = { dziennik: 150, ryzyka: 12 };

const lf = (t) => String(t).replace(/\r\n/g, '\n');
const suma = (t) => crypto.createHash('sha256').update(lf(t), 'utf8').digest('hex').slice(0, 16);
const waga = (t) => Buffer.byteLength(lf(t), 'utf8');
const kb = (b) => (b / KB).toFixed(1) + ' KB';

// Kotwica naglowka w stylu GitHuba: male litery, bez interpunkcji (litery i cyfry dowolnego jezyka
// zostaja, tak samo "-" i "_"), spacje na "-". Powtorzony naglowek dostaje -1, -2...
function kotwice(linie) {
  const licznik = new Map();
  const wynik = new Set();
  let wBloku = false;
  for (const l of linie) {
    if (/^\s*```/.test(l)) { wBloku = !wBloku; continue; }
    if (wBloku) continue;
    const m = /^#{1,6}\s+(.*)$/.exec(l);
    if (!m) continue;
    const baza = slug(m[1]);
    const n = licznik.get(baza) || 0;
    licznik.set(baza, n + 1);
    wynik.add(n ? baza + '-' + n : baza);
  }
  return wynik;
}

function slug(naglowek) {
  return naglowek.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

function sekcja(linie, wzorzec) {
  const start = linie.findIndex((l) => wzorzec.test(l));
  if (start < 0) return null;
  let koniec = linie.length;
  for (let i = start + 1; i < linie.length; i++) if (/^## /.test(linie[i])) { koniec = i; break; }
  return { start, koniec };
}

function liczba(n, jeden, dwa, piec) {
  const r10 = n % 10;
  const r100 = n % 100;
  if (n === 1) return n + ' ' + jeden;
  if (r10 >= 2 && r10 <= 4 && !(r100 >= 12 && r100 <= 14)) return n + ' ' + dwa;
  return n + ' ' + piec;
}

function projektZNaglowka(linie) {
  const h1 = linie.find((l) => /^# /.test(l)) || '';
  const m = / — (.+)$/.exec(h1);
  return m ? m[1].trim() : 'projekt';
}

const komorki = (wiersz) => wiersz.split(/(?<!\\)\|/).slice(1, -1).map((k) => k.trim());
const zamkniete = (status) => /^(ZAMKNI[ĘE]TE|CLOSED)\b/i.test(status.replace(/\*/g, '').trim());
const bezPustychNaKoncu = (linie) => { const k = linie.slice(); while (k.length && k[k.length - 1] === '') k.pop(); return k; };

// ---------- plan: ryzyka ----------
function planRyzyka(tekst, o) {
  const linie = lf(tekst).split('\n');
  const s = sekcja(linie, /^## (Stan otwartych ryzyk|Open risks)\s*$/);
  if (!s) return { blad: 'brak sekcji "## Stan otwartych ryzyk"' };
  const tabela = [];
  for (let i = s.start + 1; i < s.koniec; i++) if (/^\|/.test(linie[i])) tabela.push(i);
  if (tabela.length < 2 || !/^\|\s*-/.test(linie[tabela[1]])) return { blad: 'sekcja ryzyk bez tabeli z naglowkiem' };
  const wiersze = tabela.slice(2);
  const odrzucone = wiersze.filter((i) => komorki(linie[i]).length < 5).length;
  const zabrane = wiersze.filter((i) => { const k = komorki(linie[i]); return k.length >= 5 && zamkniete(k[3]); });
  const wagaSekcji = waga(linie.slice(s.start, s.koniec).join('\n'));
  const rotowalna = zabrane.reduce((a, i) => a + waga(linie[i]) + 1, 0);
  const prog = (o.prog || PROG_DOMYSLNY.ryzyka) * KB;
  return {
    rodzaj: 'ryzyka', linie, s, naglowek: [linie[tabela[0]], linie[tabela[1]]], zabrane,
    numery: zabrane.map((i) => komorki(linie[i])[0]), fragment: zabrane.map((i) => linie[i]).join('\n'),
    wagi: { calkowita: wagaSekcji, rotowalna, dolna: wagaSekcji - rotowalna, prog },
    ponadProgiem: wagaSekcji > prog, odrzucone, wierszy: wiersze.length,
  };
}

// ---------- plan: dziennik ----------
function planDziennik(tekst, o) {
  const linie = lf(tekst).split('\n');
  const s = sekcja(linie, /^## (Wpisy|Entries)\s*$/);
  if (!s) return { blad: 'brak sekcji "## Wpisy"' };
  if (!sekcja(linie, /^## (Czeka na człowieka|Waiting for the human)\s*$/)) {
    return { blad: 'dziennik bez sekcji "Czeka na czlowieka" — rotacja wg SPEC_ARCHIWUM.md recznie, po procedurze waiting-migration.md' };
  }
  const starty = [];
  for (let i = s.start + 1; i < s.koniec; i++) if (/^### /.test(linie[i])) starty.push(i);
  const wpisy = starty.map((start, k) => {
    const koniec = k + 1 < starty.length ? starty[k + 1] : s.koniec;
    const m = /^### (\d{4}-\d{2}-\d{2})/.exec(linie[start]);
    return { start, koniec, data: m ? m[1] : null, naglowek: linie[start].replace(/^###\s+/, '') };
  });
  const daty = wpisy.filter((w) => w.data).map((w) => w.data);
  const rosnaco = daty.every((d, i) => i === 0 || daty[i - 1] <= d);
  const malejaco = daty.every((d, i) => i === 0 || daty[i - 1] >= d);
  if (!rosnaco && !malejaco) return { blad: 'kolejnosc wpisow mieszana — rotacja wg SPEC_ARCHIWUM.md recznie' };
  const porzadek = wpisy.map((w, i) => i).filter((i) => wpisy[i].data)
    .sort((a, b) => (wpisy[a].data < wpisy[b].data ? -1 : wpisy[a].data > wpisy[b].data ? 1 : a - b));
  const najnowsze = new Set(porzadek.slice(-NIETYKALNE_WPISY));
  const odNajstarszego = rosnaco ? wpisy.map((w, i) => i) : wpisy.map((w, i) => i).reverse();
  const osiagalne = [];
  for (const i of odNajstarszego) {
    if (!wpisy[i].data || najnowsze.has(i)) break;
    osiagalne.push(i);
  }
  const wagaWpisu = (w) => waga(linie.slice(w.start, w.koniec).join('\n')) + 1;
  const calkowita = waga(tekst);
  const rotowalna = osiagalne.reduce((a, i) => a + wagaWpisu(wpisy[i]), 0);
  const prog = (o.prog || PROG_DOMYSLNY.dziennik) * KB;
  const cel = Math.floor(CEL * prog);
  const zabrane = [];
  let po = calkowita;
  if (calkowita > prog) {
    for (const i of osiagalne) {
      if (po < cel) break;
      zabrane.push(i);
      po -= wagaWpisu(wpisy[i]);
    }
  }
  const wPliku = zabrane.slice().sort((a, b) => a - b);
  const fragment = bezPustychNaKoncu(wPliku.flatMap((i) => linie.slice(wpisy[i].start, wpisy[i].koniec))).join('\n');
  const datyZabranych = wPliku.map((i) => wpisy[i].data).sort();
  return {
    rodzaj: 'dziennik', linie, s, wpisy, zabrane: wPliku, fragment,
    od: datyZabranych[0], do: datyZabranych[datyZabranych.length - 1],
    wagi: { calkowita, rotowalna, dolna: calkowita - rotowalna, prog, cel, po },
    ponadProgiem: calkowita > prog, wpisow: wpisy.length, bezDaty: wpisy.length - daty.length,
  };
}

function planuj(rodzaj, tekst, o) {
  if (rodzaj === 'ryzyka') return planRyzyka(tekst, o);
  if (rodzaj === 'dziennik') return planDziennik(tekst, o);
  return { blad: 'rodzaj musi byc "dziennik" albo "ryzyka"' };
}

function nazwaArchiwum(plan, data) {
  return plan.rodzaj === 'ryzyka'
    ? path.join('archiwum', 'ryzyka', 'RYZYKA_' + data + '.md')
    : path.join('archiwum', 'dziennik', 'DZIENNIK_' + plan.od + '_' + plan.do + '.md');
}

function tekstArchiwum(plan, o, rel, s) {
  const zrodlo = '`' + o.zrodloRel + '`';
  if (plan.rodzaj === 'ryzyka') {
    return '# ARCHIWUM RYZYK — ' + o.projekt + ' · ' + o.data + '\n\n'
      + 'Rotacja: ' + o.data + ' · plik źródłowy: ' + zrodlo + ', sekcja „Stan otwartych ryzyk" ·\n'
      + 'przeniesionych pozycji: ' + plan.zabrane.length + ' (' + plan.numery.join(', ') + ') · suma kontrolna: `' + s + '`\n\n'
      + 'Treść poniżej jest kopią bajt w bajt z żywej tabeli — nic nie zostało streszczone ani skrócone.\n\n'
      + plan.naglowek.join('\n') + '\n\n---\n\n' + plan.fragment + '\n';
  }
  return '# ARCHIWUM DZIENNIKA — ' + o.projekt + ' · ' + plan.od + ' … ' + plan.do + '\n\n'
    + 'Rotacja: ' + o.data + ' · plik źródłowy: ' + zrodlo + ' · przeniesionych pozycji: ' + plan.zabrane.length + ' ·\n'
    + 'suma kontrolna: `' + s + '`\n\n'
    + 'Treść poniżej jest kopią bajt w bajt z żywego dziennika — nic nie zostało streszczone ani skrócone.\n\n'
    + '---\n' + plan.fragment + '\n';
}

// Tresc spod separatora "---" (pierwsza linia "---" po naglowku), bez pustych linii na brzegach.
function trescArchiwum(tekst) {
  const linie = lf(tekst).split('\n');
  const sep = linie.indexOf('---');
  if (sep < 0) return null;
  const tresc = linie.slice(sep + 1);
  while (tresc.length && tresc[0] === '') tresc.shift();
  return bezPustychNaKoncu(tresc).join('\n');
}

function odsylacz(plan, o, rel, s) {
  const pelna = o.archiwumRel;
  if (plan.rodzaj === 'ryzyka') {
    return ['> Ryzyka zamknięte ' + plan.numery.join(', ') + ' (' + liczba(plan.zabrane.length, 'pozycja', 'pozycje', 'pozycji') + ') są w',
      '> [' + pelna + '](' + rel + ')', '> — przeniesione ' + o.data + ', suma kontrolna `' + s + '`.'];
  }
  return ['> Wpisy z okresu ' + plan.od + ' … ' + plan.do + ' (' + liczba(plan.zabrane.length, 'wpis', 'wpisy', 'wpisów') + ') są w',
    '> [' + pelna + '](' + rel + ')', '> — przeniesione ' + o.data + ', suma kontrolna `' + s + '`.'];
}

const zwinPuste = (linie) => linie.filter((l, i) => !(l === '' && linie[i - 1] === ''));

function przytnijRyzyka(plan, odsylaczLinie) {
  const usun = new Set(plan.zabrane);
  const przed = plan.linie.slice(0, plan.s.start);
  const sekcjaLinie = zwinPuste(plan.linie.slice(plan.s.start, plan.s.koniec).filter((l, k) => !usun.has(plan.s.start + k)));
  const po = plan.linie.slice(plan.s.koniec);
  let ostatni = -1;
  sekcjaLinie.forEach((l, k) => { if (/^\|/.test(l)) ostatni = k; });
  const wstawka = sekcjaLinie[ostatni + 1] === '' ? [''].concat(odsylaczLinie) : [''].concat(odsylaczLinie, ['']);
  sekcjaLinie.splice(ostatni + 1, 0, ...wstawka);
  return przed.concat(sekcjaLinie, po);
}

function przytnijDziennik(plan, odsylaczLinie, relArchiwum) {
  const usun = new Set();
  for (const i of plan.zabrane) for (let k = plan.wpisy[i].start; k < plan.wpisy[i].koniec; k++) usun.add(k);
  // Puste linie zwijane WYLACZNIE na styku wycietego zakresu — tresc poza zakresem zostaje bajt
  // w bajt (blok kodu z dwiema pustymi liniami w zachowanym wpisie nie traci zadnej).
  const linie = [];
  let poWycieciu = false;
  plan.linie.forEach((l, k) => {
    if (usun.has(k)) { poWycieciu = true; return; }
    if (poWycieciu && l === '' && linie[linie.length - 1] === '') { poWycieciu = false; return; }
    poWycieciu = false;
    linie.push(l);
  });
  // odsylacz: za ostatnim istniejacym odsylaczem na poczatku sekcji "Wpisy", w porzadku chronologicznym
  const s = sekcja(linie, /^## (Wpisy|Entries)\s*$/);
  let miejsce = s.start + 1;
  for (let k = s.start + 1; k < s.koniec && !/^### /.test(linie[k]); k++) if (/^> /.test(linie[k])) miejsce = k + 1;
  linie.splice(miejsce, 0, '', ...odsylaczLinie);
  if (linie[miejsce + odsylaczLinie.length + 1] === '' && linie[miejsce + odsylaczLinie.length + 2] === '') {
    linie.splice(miejsce + odsylaczLinie.length + 1, 1);
  }
  const s2 = sekcja(linie, /^## (Wpisy|Entries)\s*$/);
  for (let k = s2.start + 1; k < s2.koniec; k++) {
    if (/^### /.test(linie[k])) { if (linie[k - 1] !== '') linie.splice(k, 0, ''); break; }
  }
  // przepiecie linkow z "Czeka na czlowieka" do przeniesionych wpisow
  const przeniesione = new Set(plan.zabrane.map((i) => slug(plan.wpisy[i].naglowek)));
  const c = sekcja(linie, /^## (Czeka na człowieka|Waiting for the human)\s*$/);
  let przepiete = 0;
  for (let k = c.start + 1; k < c.koniec; k++) {
    linie[k] = linie[k].replace(/\]\(#([^)\s]+)\)/g, (cale, kotwica) => {
      if (!przeniesione.has(kotwica)) return cale;
      przepiete++;
      return '](' + relArchiwum + '#' + kotwica + ')';
    });
  }
  return { linie, przepiete };
}

// Linki z sekcji "Czeka na czlowieka" do kotwic, ktorych nie ma (w zywym pliku albo w archiwum).
function martweKotwice(linie, katalog, io) {
  const c = sekcja(linie, /^## (Czeka na człowieka|Waiting for the human)\s*$/);
  if (!c) return { linkow: 0, martwych: 0, bezPliku: 0 };
  const lokalne = kotwice(linie);
  const cache = new Map();
  let linkow = 0;
  let martwych = 0;
  let bezPliku = 0; // osobny stan: brak pliku to nie to samo, co brak kotwicy w pliku (zasada 5)
  for (let k = c.start + 1; k < c.koniec; k++) {
    for (const m of linie[k].matchAll(/\]\(([^)#\s]*)#([^)\s]+)\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(m[1])) continue; // adres zewnetrzny (https:, mailto:) — nie kotwica dziennika
      linkow++;
      if (!m[1]) { if (!lokalne.has(m[2])) martwych++; continue; }
      const plik = path.join(katalog, m[1]);
      if (!cache.has(plik)) cache.set(plik, io.exists(plik) ? kotwice(lf(io.read(plik)).split('\n')) : null);
      const zbior = cache.get(plik);
      if (!zbior) bezPliku++;
      else if (!zbior.has(m[2])) martwych++;
    }
  }
  return { linkow, martwych, bezPliku };
}

const IO = {
  read: (p) => fs.readFileSync(p, 'utf8'),
  write: (p, t) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t); },
  exists: (p) => fs.existsSync(p),
};

function dzis() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function przygotuj(rodzaj, o, io) {
  const plik = path.resolve(o.plik || 'docs/DZIENNIK.md');
  if (!io.exists(plik)) return { blad: 'brak pliku ' + plik, kod: 2 };
  const surowy = io.read(plik);
  const plan = planuj(rodzaj, surowy, o);
  if (plan.blad) return { blad: plan.blad, kod: 2 };
  const data = o.data || dzis();
  const katalog = path.dirname(plik);
  const relArchiwum = nazwaArchiwum(plan, data).split(path.sep).join('/');
  const korzen = o.korzen || process.cwd();
  const ctx = {
    plik, surowy, plan, data, katalog, relArchiwum,
    archiwum: path.join(katalog, relArchiwum),
    projekt: o.projekt || projektZNaglowka(plan.linie),
    zrodloRel: path.relative(korzen, plik).split(path.sep).join('/'),
    archiwumRel: path.relative(korzen, path.join(katalog, relArchiwum)).split(path.sep).join('/'),
    eol: surowy.includes('\r\n') ? '\r\n' : '\n',
  };
  return ctx;
}

function raportPlanu(ctx) {
  const { plan } = ctx;
  const w = plan.wagi;
  const out = [];
  if (plan.rodzaj === 'ryzyka') {
    out.push('ryzyka: ' + plan.wierszy + ' wierszy w tabeli, zamknietych ' + plan.zabrane.length
      + (plan.zabrane.length ? ' (' + plan.numery.join(', ') + ')' : '') + ', wierszy odrzuconych przez parser: ' + plan.odrzucone);
  } else {
    out.push('dziennik: ' + plan.wpisow + ' wpisow (bez daty: ' + plan.bezDaty + '), zakres: '
      + (plan.zabrane.length ? plan.zabrane.length + ' wpisow ' + plan.od + ' … ' + plan.do : 'pusty'));
  }
  out.push('wagi: calkowita ' + kb(w.calkowita) + ' = rotowalna ' + kb(w.rotowalna) + ' + dolna granica ' + kb(w.dolna)
    + ' · prog ' + kb(w.prog) + (w.cel ? ' · cel ' + kb(w.cel) + ' · po rotacji ' + kb(w.po) : ''));
  if (!plan.ponadProgiem) out.push('ponizej progu — rotacja nic nie robi');
  else if (!plan.zabrane.length) out.push('ponad progiem, ale nic nie przechodzi — komunikat zablokowanej rotacji (SPEC_ARCHIWUM.md)');
  else out.push('archiwum: ' + ctx.archiwumRel + ' · suma fragmentu ' + suma(plan.fragment));
  return out;
}

function wykonaj(rodzaj, o, io) {
  io = io || IO;
  const ctx = przygotuj(rodzaj, o, io);
  if (ctx.blad) return { kod: ctx.kod, out: ['RelAI rotate: ' + ctx.blad] };
  const out = raportPlanu(ctx);
  const { plan } = ctx;
  if (!plan.ponadProgiem || !plan.zabrane.length) return { kod: 0, out };
  const s = suma(plan.fragment);
  if (io.exists(ctx.archiwum) && suma(trescArchiwum(io.read(ctx.archiwum)) || '') !== s) {
    return { kod: 2, out: out.concat('RelAI rotate: ' + ctx.archiwumRel + ' juz istnieje z inna trescia — nie nadpisuje') };
  }
  // faza 1: kopia i dowod z dysku
  io.write(ctx.archiwum, tekstArchiwum(plan, ctx, ctx.relArchiwum, s).replace(/\n/g, ctx.eol));
  const zDysku = trescArchiwum(io.read(ctx.archiwum));
  const s2 = zDysku === null ? '(brak separatora)' : suma(zDysku);
  if (s2 !== s) {
    return { kod: 3, out: out.concat('STOP: suma fragmentu ' + s + ', suma archiwum z dysku ' + s2 + ' — zywy plik nietkniety') };
  }
  out.push('faza 1: archiwum zapisane i odczytane z dysku, suma ' + s + ' zgodna');
  // faza 2: przyciecie
  const linieOds = odsylacz(plan, ctx, ctx.relArchiwum, s);
  let linie;
  let przepiete = 0;
  if (plan.rodzaj === 'ryzyka') linie = przytnijRyzyka(plan, linieOds);
  else ({ linie, przepiete } = przytnijDziennik(plan, linieOds, ctx.relArchiwum));
  const nowy = linie.join('\n');
  io.write(ctx.plik, nowy.replace(/\n/g, ctx.eol));
  const martwe = martweKotwice(linie, ctx.katalog, io);
  out.push('faza 2: ' + ctx.zrodloRel + ' ' + kb(waga(ctx.surowy)) + ' -> ' + kb(waga(nowy))
    + ', przeniesionych pozycji ' + plan.zabrane.length + ', przepietych linkow ' + przepiete
    + ', linki "Czeka na czlowieka": ' + martwe.linkow + ', martwe kotwice ' + martwe.martwych
    + ', do nieistniejacego pliku ' + martwe.bezPliku);
  if (martwe.martwych || martwe.bezPliku) out.push('UWAGA: obie liczby maja wynosic zero — sprawdz linki recznie i wpisz je do dziennika');
  return { kod: 0, out, suma: s, archiwum: ctx.archiwum };
}

function sprawdz(rodzaj, o, io) {
  io = io || IO;
  const ctx = przygotuj(rodzaj, o, io);
  if (ctx.blad) return { kod: ctx.kod, out: ['RelAI rotate: ' + ctx.blad] };
  if (!ctx.plan.zabrane.length) {
    return { kod: 2, out: ['RelAI rotate: w zywym pliku nie ma juz fragmentu do porownania (rotacja zakonczona albo zakres pusty) — `sprawdz` sluzy do rotacji przerwanej miedzy fazami'] };
  }
  const archiwum = o.archiwum ? path.resolve(o.archiwum) : ctx.archiwum;
  if (!io.exists(archiwum)) return { kod: 2, out: ['RelAI rotate: brak pliku archiwum ' + archiwum] };
  const tresc = trescArchiwum(io.read(archiwum));
  const sa = tresc === null ? '(brak separatora)' : suma(tresc);
  const sf = suma(ctx.plan.fragment);
  return { kod: sa === sf ? 0 : 3, out: ['suma fragmentu z zywego pliku ' + sf + ', suma archiwum ' + sa + ' — ' + (sa === sf ? 'zgodne' : 'ROZNE')] };
}

function argumenty(argv) {
  const o = {};
  const poz = [];
  for (let i = 0; i < argv.length; i++) {
    const m = /^--(plik|prog|data|projekt|archiwum)$/.exec(argv[i]);
    if (m) { o[m[1]] = m[1] === 'prog' ? Number(argv[++i]) : argv[++i]; continue; }
    poz.push(argv[i]);
  }
  return { tryb: poz[0], rodzaj: poz[1], o };
}

if (require.main === module) {
  const { tryb, rodzaj, o } = argumenty(process.argv.slice(2));
  let wynik;
  if (tryb === 'plan') {
    const ctx = przygotuj(rodzaj, o, IO);
    wynik = ctx.blad ? { kod: ctx.kod, out: ['RelAI rotate: ' + ctx.blad] } : { kod: 0, out: raportPlanu(ctx) };
  } else if (tryb === 'sprawdz') wynik = sprawdz(rodzaj, o);
  else if (tryb === 'wykonaj') wynik = wykonaj(rodzaj, o);
  else wynik = { kod: 2, out: ['uzycie: rotate.js <plan|sprawdz|wykonaj> <dziennik|ryzyka> [--plik P] [--prog KB] [--data RRRR-MM-DD] [--projekt N] [--archiwum P]'] };
  process.stdout.write(wynik.out.join('\n') + '\n');
  process.exit(wynik.kod);
}

module.exports = { suma, waga, slug, kotwice, planuj, trescArchiwum, wykonaj, sprawdz, martweKotwice };
