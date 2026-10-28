#!/usr/bin/env node
'use strict';
// RelAI core / narzedzie repozytorium: rozmiar kontekstu pierwszej tury z transkryptu Claude Code
// (plan KONTEKST_STARTU, E1). Instrument pomiaru "przed" i "po" — nie trafia do projektow
// uzytkownikow (provisionTools go nie kopiuje).
//
//   node core/tools/start-context.js --sesja <id>      jedna sesja (id albo jego poczatek)
//   node core/tools/start-context.js --ostatnie <N>    N najnowszych sesji biezacego projektu
//   opcje: --json · --projekt <katalog> (domyslnie cwd) · --transkrypty <katalog> (domyslnie
//          ~/.claude/projects/<slug projektu>)
//
// Liczby (tokeny, z pola message.usage wpisu asystenta):
//   pierwsze wywolanie = input_tokens + cache_creation_input_tokens + cache_read_input_tokens
//                        pierwszego wywolania API w sesji;
//   koniec 1. tury     = to samo dla ostatniego wywolania przed drugim poleceniem czlowieka
//                        PLUS jego output_tokens — tyle kontekstu wnosi tura do nastepnego
//                        wywolania (tak policzone sa liczby ANALIZY KONTEKST_STARTU, par. 3.1).
// Wywolanie to jeden message.id; transkrypt powtarza wpis na kazdy blok tresci, bierzemy ostatni.
// Brak ktoregokolwiek pola liczbowego daje "brak danych", nigdy liczbe (ryzyko 6 planu).
// Komunikaty bez polskich znakow diakrytycznych (L-0016).

const fs = require('fs');
const os = require('os');
const path = require('path');

const POLA_WEJSCIA = ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens'];
const BRAK = 'brak danych';

// Slug katalogu projektu tak, jak Claude Code nazywa folder transkryptow: kazdy znak spoza
// [A-Za-z0-9] zamieniony na "-" (C:\Users\Lukasz\Desktop\RelAI -> C--Users-Lukasz-Desktop-RelAI).
function slug(katalog) {
  return String(katalog).replace(/[^A-Za-z0-9]/g, '-');
}

// Polecenie czlowieka: wpis user z tekstem, nie meta (rozwiniecie komendy), nie wynik narzedzia,
// nie streszczenie kompakcji i nie zdarzenie wstrzykniete przez aplikacje (powiadomienie
// o zadaniu w tle, wyjscie komendy lokalnej) — L-0189.
const ZDARZENIE = /^\s*<(task-notification|local-command-|side-sessions-event|ci-monitor-event|system-reminder)/;

function czyPolecenie(e) {
  if (e.type !== 'user' || e.isMeta || e.isSidechain || e.isCompactSummary) return false;
  const c = e.message && e.message.content;
  let tekst = null;
  if (typeof c === 'string') tekst = c;
  else if (Array.isArray(c)) {
    const blok = c.find((b) => b && b.type === 'text');
    if (blok) tekst = String(blok.text);
  }
  return tekst !== null && !ZDARZENIE.test(tekst);
}

const liczba = (v) => typeof v === 'number' && Number.isFinite(v);

function wejscie(usage) {
  if (!usage || !POLA_WEJSCIA.every((p) => liczba(usage[p]))) return null;
  return POLA_WEJSCIA.reduce((s, p) => s + usage[p], 0);
}

// Zwraca { pierwsze, koniecTury, wywolanTury, drugiePolecenie, polecen } dla tekstu JSONL.
function analizuj(tekst) {
  const wywolania = []; // { id, usage, tura }
  const indeks = new Map();
  let polecen = 0;
  for (const linia of String(tekst).split(/\r?\n/)) {
    if (!linia.trim()) continue;
    let e;
    try { e = JSON.parse(linia); } catch (_) { continue; }
    if (czyPolecenie(e)) { polecen++; continue; }
    if (e.type !== 'assistant' || e.isSidechain || !e.message) continue;
    const id = e.message.id || e.requestId || e.uuid;
    const wpis = { id, usage: e.message.usage || null, tura: polecen };
    if (indeks.has(id)) wywolania[indeks.get(id)] = wpis;
    else { indeks.set(id, wywolania.length); wywolania.push(wpis); }
  }
  const pierwszaTura = wywolania.filter((w) => w.tura <= 1);
  const pierwsze = wywolania.length ? wejscie(wywolania[0].usage) : null;
  const ostatnie = pierwszaTura[pierwszaTura.length - 1];
  let koniecTury = null;
  if (ostatnie) {
    const wej = wejscie(ostatnie.usage);
    const wyj = ostatnie.usage && ostatnie.usage.output_tokens;
    koniecTury = wej !== null && liczba(wyj) ? wej + wyj : null;
  }
  return {
    pierwsze,
    koniecTury,
    wywolanTury: pierwszaTura.length,
    drugiePolecenie: polecen >= 2,
    polecen,
  };
}

function katalogTranskryptow(o) {
  if (o.transkrypty) return path.resolve(o.transkrypty);
  return path.join(os.homedir(), '.claude', 'projects', slug(path.resolve(o.projekt || process.cwd())));
}

function wybierzSesje(katalog, o) {
  let pliki;
  try {
    pliki = fs.readdirSync(katalog).filter((n) => n.endsWith('.jsonl'));
  } catch (_) {
    return { blad: 'brak katalogu transkryptow: ' + katalog };
  }
  if (o.sesja) {
    const trafione = pliki.filter((n) => n.startsWith(o.sesja));
    if (trafione.length !== 1) {
      return { blad: (trafione.length ? 'niejednoznaczny' : 'brak') + ' transkryptu dla sesji "' + o.sesja + '"' };
    }
    return { pliki: trafione };
  }
  const n = Number(o.ostatnie);
  if (!Number.isInteger(n) || n < 1) return { blad: 'podaj --sesja <id> albo --ostatnie <N>' };
  const czas = (p) => fs.statSync(path.join(katalog, p)).mtimeMs;
  return { pliki: pliki.sort((a, b) => czas(b) - czas(a)).slice(0, n) };
}

function pomiar(o) {
  const katalog = katalogTranskryptow(o);
  const wybor = wybierzSesje(katalog, o);
  if (wybor.blad) return { kod: 2, blad: wybor.blad };
  const sesje = wybor.pliki.map((plik) => Object.assign(
    { sesja: plik.replace(/\.jsonl$/, '') },
    analizuj(fs.readFileSync(path.join(katalog, plik), 'utf8'))));
  return { kod: 0, katalog, sesje };
}

function tabela(wynik) {
  const fmt = (v) => (v === null ? BRAK : String(v));
  const out = ['| Sesja | Pierwsze wywolanie | Koniec 1. tury | Wywolan w turze | Uwagi |', '|---|---|---|---|---|'];
  for (const s of wynik.sesje) {
    const uwagi = s.polecen === 0 ? 'brak polecenia czlowieka'
      : (s.drugiePolecenie ? '' : 'bez drugiego polecenia: koniec tury = ostatnie wywolanie w pliku');
    out.push('| ' + s.sesja.slice(0, 8) + ' | ' + fmt(s.pierwsze) + ' | ' + fmt(s.koniecTury) + ' | '
      + s.wywolanTury + ' | ' + uwagi + ' |');
  }
  return out;
}

function argumenty(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') o.json = true;
    else if (a === '--sesja') o.sesja = argv[++i];
    else if (a === '--ostatnie') o.ostatnie = argv[++i];
    else if (a === '--projekt') o.projekt = argv[++i];
    else if (a === '--transkrypty') o.transkrypty = argv[++i];
  }
  return o;
}

if (require.main === module) {
  const o = argumenty(process.argv.slice(2));
  const wynik = pomiar(o);
  if (wynik.blad) {
    process.stderr.write('RelAI start-context: ' + wynik.blad + '\n');
    process.exit(wynik.kod);
  }
  process.stdout.write((o.json ? JSON.stringify(wynik, null, 2) : tabela(wynik).join('\n')) + '\n');
}

module.exports = { slug, czyPolecenie, analizuj, pomiar, tabela, BRAK };
