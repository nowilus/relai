#!/usr/bin/env node
'use strict';
// RelAI rdzen: prompt-mode — tryb ciagly optymalizatora promptow (E4 planu
// OPTYMALIZATOR_PROMPTOW). Cztery rzeczy i ani jednej wiecej:
//
// 1) przelacznik `Tryb ciagly` z docs/USTAWIENIA.md czytany maszynowo,
// 2) filtr pomijania — ktory prompt przechodzi NIETKNIETY,
// 3) tresc reguly wstrzykiwanej do tury,
// 4) BRAMKA ZGODY (2.3.0): wlaczony przelacznik nie wystarcza — pierwszy prompt
//    merytoryczny sesji pyta czlowieka, czy optymalizator ma dzialac. Trzy
//    odpowiedzi: ta sesja / na stale (zapis globalny) / nie. Powod: tryb ciagly
//    dotyka KAZDEGO promptu, a wiersz w pliku ustawien jest zgoda sprzed
//    tygodni, nie zgoda na dzisiejsza sesje.
//
// Bez wiedzy o protokole hookow — tak samo jak session-signals.js. Adapter
// wola te funkcje i sam decyduje, jak wyglada jego zdarzenie.
//
// Nosnik jest zmierzony, nie zalozony (POMIAR_CLAUDE.md, 2026-09-15): hook
// UserPromptSubmit w Claude Code DOKLADA kontekst do tury i NIE podmienia
// promptu. Tryb ciagly stoi wiec na wstrzyknietej regule, a nie na podmianie.

const fs = require('fs');
const path = require('path');

// Kotwica na POCZATKU komorki "Czego dotyczy" i zamknieta lista brzmien —
// ta sama konwencja co rotacja, budzet startu i przeglad spraw (L-0025, L-0035).
const NAZWA_TRYBU = /^(?:Tryb ci[ąa]g[łl]y|Continuous mode)\b/i;
const WLACZONY = /^(?:w[łl][ąa]czony|w[łl][ąa]czona|on|enabled)\b/i;
const WYLACZONY = /^(?:wy[łl][ąa]czony|wy[łl][ąa]czona|off|disabled)\b/i;

// --- bramka zgody (2.3.0) ---------------------------------------------------
// Zgoda globalna mieszka w ~/.claude/relai/USTAWIENIA.md, czyli w warstwie
// uzytkownika (D-23), bo dotyczy czlowieka, nie projektu. Wiersz ma ten sam
// ksztalt co reszta przelacznikow: kotwica na POCZATKU komorki, dalsze czlony
// po `·` (L-0025, L-0035).
//
//   | 2026-09-15 | Zgoda na optymalizator | tak · przypomnienie co 30 dni |
//
// Data z PIERWSZEJ komorki jest data udzielenia zgody — od niej liczy sie prog
// przypomnienia. Zgoda bez daty zyje dalej, tylko nigdy nie przypomina o sobie:
// zgadywanie daty byloby gorsze od ciszy.
const NAZWA_ZGODY = /^(?:Zgoda na optymalizator|Prompt optimizer consent)\b/i;
const ZGODA_TAK = /^(?:tak|yes|udzielona|granted)\b/i;
const ZGODA_NIE = /^(?:nie|no|cofni[ęe]ta|revoked)\b/i;
const PROG_PRZYPOMNIENIA_DNI = 30;
const CZLON_DNI_ZGODY = /^(?:przypomnienie co|reminder every)\s+(\d{1,3})\s+(?:dni|days)$/i;

// Zgoda na jedna sesje nie ma gdzie mieszkac poza projektem, wiec mieszka w jego
// cache — tam, gdzie reszta rzeczy nieprzenoszalnych miedzy maszynami.
const PLIK_ZGODY_SESJI = '.claude/relai/zgoda-promptu.json';

// Frazy sesji z CLAUDE.md i skilla relai-core. Prompt, ktory sie od nich zaczyna,
// jest poleceniem rytualu, nie zdaniem do przerobienia.
const FRAZY_SESJI = [
  'konczymy na dzis', 'kontynuujemy prace', 'sprawdz status', 'jak stoimy',
  'wrapping up', 'lets continue', 'status check',
];
const LIMIT_FRAZY = 60;

// Krotkie potwierdzenia — zamknieta lista, dopasowanie do CALEGO promptu.
const POTWIERDZENIA = new Set([
  'tak', 'nie', 'ok', 'okej', 'okey', 'dobra', 'dobrze', 'jasne', 'zgoda', 'dawaj',
  'kontynuuj', 'dalej', 'rob', 'zrob to', 'potwierdzam', 'tak prosze', 'nie dziekuje',
  'yes', 'no', 'okay', 'go', 'go ahead', 'continue', 'proceed', 'sure',
]);

// Pytanie rozpoznajemy po PIERWSZYM slowie, nie po znaku zapytania: zdanie
// merytoryczne tez bywa zakonczone pytajnikiem, a "co robi ta funkcja" nie.
const ZAIMKI_PYTAJNE = new Set([
  'co', 'gdzie', 'dlaczego', 'czemu', 'jak', 'czy', 'kiedy', 'ile', 'kto',
  'ktory', 'ktora', 'ktore', 'skad', 'po', 'na',
  'what', 'where', 'why', 'how', 'which', 'who', 'when', 'does', 'do', 'is', 'are', 'can',
]);
// "po" i "na" wchodza wylacznie w polaczeniach pytajnych ponizej — same w sobie
// zaczynaja zdania rozkazujace ("na razie zostaw", "po zmianie odpal testy").
const PYTAJNE_DWUSLOWNE = new Set(['po co', 'na czym', 'na co']);

function bezOgonkow(s) {
  return String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L');
}

// Normalizacja do porownan: male litery, bez diakrytykow, bez interpunkcji
// koncowej, pojedyncze spacje.
function normalizuj(prompt) {
  return bezOgonkow(String(prompt || ''))
    .toLowerCase()
    .replace(/[,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?\s]+$/g, '');
}

// Przelacznik trybu ciaglego jako FAKT: true / false / null.
// null znaczy "nie wiadomo" — brak wiersza albo wartosc spoza zamknietej listy.
// Oba przypadki adapter traktuje jak WYLACZONY i milczy: zgadywanie jest zakazane
// (L-0025), a tryb, ktory wlacza sie sam z literowki, byloby gorszy od jego braku.
function trybCiagly(txtUstawien) {
  const txt = String(txtUstawien || '');
  for (const linia of txt.split('\n')) {
    if (!linia.trim().startsWith('|')) continue;
    const cells = linia.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    const czego = cells[2].replace(/\*\*/g, '').trim();
    if (!NAZWA_TRYBU.test(czego)) continue;
    const komorka = cells[3].replace(/\*\*/g, '').trim();
    if (WLACZONY.test(komorka)) return true;
    if (WYLACZONY.test(komorka)) return false;
    return null;
  }
  return null;
}

// Wczytanie przelacznika wprost z projektu. Brak pliku = null, czyli cisza.
function trybCiaglyProjektu(cwd) {
  for (const nazwa of ['USTAWIENIA.md', 'SETTINGS.md']) {
    const p = path.join(cwd || '.', 'docs', nazwa);
    try {
      if (fs.existsSync(p)) return trybCiagly(fs.readFileSync(p, 'utf8'));
    } catch (_) { /* nieczytelny plik traktujemy jak brak wiersza */ }
  }
  return null;
}

// Wiersz zgody globalnej jako FAKT: null albo { tak, data, progDni }.
// null znaczy "nie wiadomo" — brak wiersza albo kotwica spoza zamknietej listy.
// Adapter traktuje null jak BRAK ZGODY i pyta: zgoda, ktora wlacza sie z literowki,
// nie jest zgoda.
function zgodaGlobalna(txtUstawien) {
  for (const linia of String(txtUstawien || '').split('\n')) {
    if (!linia.trim().startsWith('|')) continue;
    const cells = linia.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    const czego = cells[2].replace(/\*\*/g, '').trim();
    if (!NAZWA_ZGODY.test(czego)) continue;

    const czlony = cells[3].replace(/\*\*/g, '').trim().split('·').map((c) => c.trim());
    let tak;
    if (ZGODA_TAK.test(czlony[0])) tak = true;
    else if (ZGODA_NIE.test(czlony[0])) tak = false;
    else return null;

    let progDni = PROG_PRZYPOMNIENIA_DNI;
    for (const czlon of czlony.slice(1)) {
      const m = czlon.match(CZLON_DNI_ZGODY);
      if (m) progDni = parseInt(m[1], 10);
    }
    const data = /^\d{4}-\d{2}-\d{2}$/.test(cells[1]) ? cells[1] : null;
    return { tak, data, progDni };
  }
  return null;
}

// Zgoda na TE sesje. Plik wiazacy decyzje z identyfikatorem sesji — bez niego
// "tak w tej sesji" przeciekloby do nastepnej, a o to czlowiek nie prosil.
// Zwraca true / false / null (brak pliku, inna sesja, wartosc nierozpoznana).
function zgodaSesji(cwd, sesja) {
  if (!sesja) return null;
  try {
    const p = path.join(cwd || '.', ...PLIK_ZGODY_SESJI.split('/'));
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (String(j.sesja || '') !== String(sesja)) return null;
    const decyzja = String(j.decyzja || '');
    if (ZGODA_TAK.test(decyzja)) return true;
    if (ZGODA_NIE.test(decyzja)) return false;
    return null;
  } catch (_) {
    return null;
  }
}

// Stan bramki jako jedno slowo: 'dziala' | 'cisza' | 'pytaj'.
// Sesja ma pierwszenstwo nad globalna zgoda w OBIE strony: "nie w tej sesji"
// wycisza tryb mimo zgody na stale, a "tak w tej sesji" wlacza go mimo jej braku.
function stanBramki(stan) {
  const s = stan || {};
  if (s.sesja === true) return 'dziala';
  if (s.sesja === false) return 'cisza';
  if (s.globalna && s.globalna.tak === true) return 'dziala';
  if (s.globalna && s.globalna.tak === false) return 'cisza';
  return 'pytaj';
}

function dniMiedzy(od, do_) {
  const a = Date.parse(od + 'T00:00:00Z');
  const b = Date.parse(do_ + 'T00:00:00Z');
  if (isNaN(a) || isNaN(b)) return null;
  return Math.floor((b - a) / 86400000);
}

// Czy ten prompt przechodzi NIETKNIETY. Zwraca powod albo null.
// Kolejnosc ma znaczenie: komenda jest rozpoznawana po POCZATKU tekstu, wiec
// zdanie, ktore tylko wspomina nazwe komendy, nie jest pomijane.
function powodPominiecia(prompt) {
  const surowy = String(prompt || '');
  if (!surowy.trim()) return 'pusty prompt';
  if (/^\s*\//.test(surowy)) return 'wywolanie komendy';

  const n = normalizuj(surowy);
  if (!n) return 'pusty prompt';

  for (const fraza of FRAZY_SESJI) {
    if (n === fraza) return 'fraza sesji';
    if (n.startsWith(fraza + ' ') && n.length <= LIMIT_FRAZY) return 'fraza sesji';
  }

  if (POTWIERDZENIA.has(n)) return 'krotkie potwierdzenie';

  const slowa = n.split(' ');
  const dwa = slowa.slice(0, 2).join(' ');
  if (PYTAJNE_DWUSLOWNE.has(dwa)) return 'pytanie';
  if (ZAIMKI_PYTAJNE.has(slowa[0]) && !['po', 'na'].includes(slowa[0])) return 'pytanie';

  return null;
}

function pomija(prompt) {
  return powodPominiecia(prompt) !== null;
}

// Tresc wstrzykiwana do tury. Krotka z policzonego powodu: 2,6 znaku = 1 token
// wejscia (POMIAR_CLAUDE.md), wiec kazde zdanie w tym tekscie placi sie przy
// KAZDYM prompcie sesji. Bez polskich znakow diakrytycznych — jak w pozostalych
// hookach (bezpieczenstwo kodowania konsoli Windows).
const REGULA = '[RelAI tryb ciagly] Zanim wykonasz ten prompt: przerob go procedura komendy ' +
  '/relai-prompt, pokaz oryginal obok propozycji i CZEKAJ na zgode. Bez zgody nie wykonujesz ' +
  'ani oryginalu, ani propozycji. Zgoda uruchamia prompt przyjety przez czlowieka.';

function regula() {
  return REGULA;
}

// Tresc bramki. Placi sie tylko do momentu odpowiedzi — potem wraca zwykla REGULA
// albo cisza — wiec moze byc dluzsza od niej, ale nie dowolnie: prompt, na ktory
// czlowiek czeka, konkuruje z nia o kontekst. Identyfikator sesji wstawia adapter,
// bo model go nie widzi, a bez niego zgoda "na te sesje" nie ma czego pilnowac.
function regulaBramki(sesja) {
  return '[RelAI bramka zgody] Tryb ciagly optymalizatora jest wlaczony w tym projekcie, ale ' +
    'zgody na te sesje jeszcze nie ma. ZANIM zrobisz cokolwiek z tym promptem, zadaj JEDNO ' +
    'pytanie (AskUserQuestion) o trzy opcje: (1) tak, w tej sesji; (2) tak i nie pytaj wiecej — ' +
    'zgoda zapisana globalnie; (3) nie, nie korzystaj w tej sesji. Odpowiedz ZAPISZ, zanim ' +
    'wykonasz prompt: (1) i (3) do .claude/relai/zgoda-promptu.json jako {"sesja":"' +
    String(sesja || '') + '","decyzja":"tak albo nie","data":"RRRR-MM-DD"}; (2) to samo z ' +
    'decyzja "tak" PLUS wiersz "| RRRR-MM-DD | Zgoda na optymalizator | tak |" w ' +
    '~/.claude/relai/USTAWIENIA.md. Po (1) i (2) przerabiasz ten prompt procedura /relai-prompt; ' +
    'po (3) wykonujesz go bez zmian i nie wracasz do tematu w tej sesji.';
}

// Przypomnienie o zgodzie udzielonej na stale — JEDNA linia albo zero, na starcie
// sesji, nie przy kazdym prompcie. Zgoda bez daty i zgoda mlodsza od progu milcza.
function przypomnienieZgodyReport(zg, dzisiaj) {
  if (!zg || zg.tak !== true || !zg.data) return [];
  const wiekDni = dniMiedzy(zg.data, dzisiaj || '');
  if (wiekDni === null || wiekDni < 0 || wiekDni <= zg.progDni) return [];
  return ['[RelAI zgoda optymalizatora] Zgoda na tryb ciagly zostala udzielona globalnie ' +
    zg.data + ' (' + wiekDni + ' dni przy progu ' + zg.progDni + '), wiec kazdy prompt ' +
    'merytoryczny wraca najpierw z propozycja. Cofasz ja komenda /relai-prompt off --globalnie ' +
    'albo wierszem "Zgoda na optymalizator" w ~/.claude/relai/USTAWIENIA.md.'];
}

// Jedno zdanie o wlaczonym trybie na starcie sesji. Wylaczony albo nierozpoznany
// przelacznik = pusta lista, czyli zero znakow w kontekscie startu.
function trybCiaglyReport(stan) {
  if (stan !== true) return [];
  return ['[RelAI tryb ciagly] Tryb ciagly optymalizatora promptow jest WLACZONY w tym projekcie ' +
    '(wiersz "Tryb ciagly" w docs/USTAWIENIA.md): kazdy prompt merytoryczny wraca najpierw ' +
    'z propozycja i oryginalem obok. Wylaczasz go zmiana tego jednego wiersza.'];
}

module.exports = {
  trybCiagly,
  trybCiaglyProjektu,
  trybCiaglyReport,
  powodPominiecia,
  pomija,
  regula,
  normalizuj,
  // Bramka zgody (2.3.0) — kazda czesc eksportowana osobno, zeby dalo sie
  // zmierzyc testem odczyt wiersza, wiazanie z sesja i sam wybor stanu.
  zgodaGlobalna,
  zgodaSesji,
  stanBramki,
  regulaBramki,
  przypomnienieZgodyReport,
};
