#!/usr/bin/env node
'use strict';
// RelAI rdzen: prompt-mode — tryb ciagly optymalizatora promptow (E4 planu
// OPTYMALIZATOR_PROMPTOW). Trzy rzeczy i ani jednej wiecej:
//
// 1) przelacznik `Tryb ciagly` z docs/USTAWIENIA.md czytany maszynowo,
// 2) filtr pomijania — ktory prompt przechodzi NIETKNIETY,
// 3) tresc reguly wstrzykiwanej do tury.
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
};
