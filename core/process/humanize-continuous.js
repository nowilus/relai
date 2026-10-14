#!/usr/bin/env node
'use strict';
// RelAI rdzen: humanize-continuous — tryb ciagly humanizacji (plan HUMANIZACJA, E3).
//
// Czysta logika dwoch hookow Claude Code, bez wiedzy o protokole zdarzen:
//
// 1) regula przed odpowiedzia (UserPromptSubmit) — zakresy `czat` i `zewnętrzne`:
//    krotka regula ASCII wskazujaca sciage .claude/relai/humanize/SKROT.md;
// 2) regula po zapisie dokumentu (PostToolUse) — zakres `dokumenty`: "popraw proze
//    tego pliku" w trybie `notka` albo `dwie wersje`, RAZ na plik w turze;
// 3) filtr sciezek (H3): archiwum, zamrozone PLAN.*, rejestr decyzji, prompty i
//    specyfikacje dla modeli — hook milczy, a nie tylko regula prosi model o pominiecie.
//
// Ustawienia czyta humanize-mode.js (trzy warstwy z E2) — bez wlasnego parsera.
// Stan "raz na plik w turze" pisze hook, nie model (L-0185): katalog na sesje
// w .claude/relai/humanizacja-tura/<sesja>/, jeden znacznik na plik tworzony atomowo
// (`wx`), katalog kasowany, gdy czlowiek zaczyna nowa ture.
//
// Komunikaty ASCII (zasada 15): hooki pisza do konsoli Windows.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ustawieniaHumanizacji = require('./humanize-mode.js');
const optymalizator = require('./prompt-mode.js');

const SKROT = '.claude/relai/humanize/SKROT.md';
const STRAZNIK = '.claude/relai/tools/humanize-facts.js';
const KATALOG_TURY = '.claude/relai/humanizacja-tura';
const ID_SESJI = /^[A-Za-z0-9_-]{1,128}$/;
const WIEK_STANU_TURY_MS = 7 * 24 * 3600 * 1000;

// Sciezka trafia do reguly i do polecenia powloki w apostrofach, wiec tylko ASCII bez
// znakow sterujacych, apostrofu i tyldy (alias 8.3 `DECYZJ~1.MD` omijalby wylaczenie).
const ZNAKI_SCIEZKI = /^[A-Za-z0-9 _.\/()+,@#=-]+$/;

// Prompt, ktory NIE zaczyna nowej tury: "tak" po pokazie dwoch wersji (zapis wersji
// zaakceptowanej nie moze dostac reguly drugi raz) i powiadomienie systemowe w srodku pracy.
const NIE_NOWA_TURA = new Set(['krotkie potwierdzenie', 'powiadomienie systemowe']);
// Prompt bez tresci do odpowiedzi: regula przed odpowiedzia sie nie placi.
const BEZ_REGULY = new Set(['pusty prompt', 'powiadomienie systemowe']);

// Dokument w zakresie trybu ciaglego: tekst w docs/. HTML (plany, raporty, makiety)
// pomijany decyzja Lukasza 2026-10-14 — proza przemieszana ze znacznikami (H2).
const ROZSZERZENIA_DOKUMENTU = /\.(?:md|txt)$/i;

// Stan wlaczony i rozpoznany albo null. Brak wiersza, `wyłączona` i stan spoza
// listy daja null — hook milczy (zasada 7: nierozpoznane = cisza).
// opcje: { cwd, home, sesja } jak w humanize-mode.ustawienia().
function wlaczone(opcje) {
  const u = ustawieniaHumanizacji.ustawienia(opcje);
  if (!u.value || u.value.stan !== 'włączona') return null;
  return u.value;
}

function maZakres(w, zakres) {
  return Boolean(w && Array.isArray(w.zakresy) && w.zakresy.includes(zakres));
}

// Profil stylu jako sciezka do reguly albo null (brak pliku = praca bez profilu).
function sciezkaProfilu(cwd, home) {
  if (fs.existsSync(path.join(cwd || '.', 'docs', 'zasoby', 'STYL.md'))) return 'docs/zasoby/STYL.md';
  if (fs.existsSync(path.join(home || '', '.claude', 'relai', 'STYL.md'))) return '~/.claude/relai/STYL.md';
  return null;
}

// --- regula przed odpowiedzia -------------------------------------------------------------
// Placi sie przy KAZDYM prompcie, wiec jest krotka (do 600 B, SZACUNEK planu): mowi,
// gdzie jest sciaga i ktore teksty obejmuje; tresc wzorcow mieszka w SKROT.md.
// opcje: { profil } — sciezka z sciezkaProfilu() albo null.
function regulaPrzedOdpowiedzia(w, opcje) {
  const czat = maZakres(w, 'czat');
  const zewn = maZakres(w, 'zewnętrzne');
  if (!czat && !zewn) return '';
  const ton = ustawieniaHumanizacji.tonPelny(w);
  const cele = [];
  if (czat) cele.push('odpowiedz w czacie (ton ' + ton.czat + ')');
  if (zewn) cele.push('commit, opis PR, notka wydania, README, wiadomosc do ludzi (ton ' + ton['zewnętrzne'] + '; commit: typ conventional i angielski zostaja)');
  const profilW = [];
  if (w.profil && opcje && opcje.profil) {
    if (czat && w.profilW.includes('czat')) profilW.push('czat');
    if (zewn && w.profilW.includes('wiadomości')) profilW.push('wiadomosci do ludzi');
  }
  const profil = profilW.length ? ' Profil stylu ' + opcje.profil + ' tylko w: ' + profilW.join(', ') + '.' : '';
  return '[RelAI humanizacja] Tryb ciagly: ' + cele.join('; ') + '. Piszac taki tekst, stosuj ' +
    SKROT + ' (przeczytaj raz w sesji). Tylko proza: kod, tabele, sciezki, liczby i nazwy bez zmian; ' +
    'nie dodawaj faktow. Bez akceptacji i bez listy wzorcow.' + profil + ' Nie humanizujesz propozycji ' +
    'i oryginalu z /relai-prompt ani promptow dla modeli.';
}

// --- filtr sciezek (H3) ------------------------------------------------------------------
// Sciezka wzgledna projektu z ukosnikami w przod albo null (plik poza projektem).
function sciezkaWzgledna(cwd, plik) {
  if (!plik) return null;
  const rel = path.relative(path.resolve(cwd || '.'), path.resolve(cwd || '.', String(plik)));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

// Status planu z linii metrycznej STATUS.md tego samego folderu: pierwsza niepusta linia
// pod naglowkiem `# `, status pogrubiony jak w SPEC_STATUS.md. Brak pliku, inna linia albo
// slowo statusu tylko w prozie → plan zamrozony: filtr nie zgaduje na korzysc zapisu.
const STATUS_DO_AKCEPTACJI = /\*\*\s*(?:DO AKCEPTACJI|AWAITING APPROVAL)\s*\*\*/i;
const STATUS_INNY = /ZAAKCEPTOWANY|ZREALIZOWANY|WSTRZYMANY|ACCEPTED|COMPLETED|ON HOLD/i;

function planDoAkceptacji(cwd, katalogRel) {
  let txt;
  try { txt = fs.readFileSync(path.join(cwd || '.', ...katalogRel.split('/'), 'STATUS.md'), 'utf8'); } catch (_) { return false; }
  const linie = txt.replace(/\r/g, '').split('\n');
  const naglowek = linie.findIndex((l) => /^#\s/.test(l));
  if (naglowek < 0) return false;
  const metryczna = linie.slice(naglowek + 1).find((l) => l.trim());
  return Boolean(metryczna && STATUS_DO_AKCEPTACJI.test(metryczna) && !STATUS_INNY.test(metryczna));
}

// Powod, dla ktorego hook po zapisie MILCZY, albo null (dokument w zakresie).
function powodPominieciaPliku(rel, cwd) {
  if (!rel) return 'poza projektem';
  if (!ZNAKI_SCIEZKI.test(rel)) return 'znaki spoza listy w sciezce';
  if (!/^docs\//i.test(rel)) return 'poza docs/';
  if (!ROZSZERZENIA_DOKUMENTU.test(rel)) return 'nie dokument tekstowy (.md, .txt)';
  if (/^docs\/(?:archiwum|archive)\//i.test(rel)) return 'archiwum';
  const nazwa = rel.split('/').pop();
  if (/^docs\/(?:DECYZJE|DECISIONS)\.md$/i.test(rel)) return 'rejestr decyzji';
  if (/^PROMPT_.*\.md$/i.test(nazwa)) return 'prompt dla modelu';
  if (/^SPEC_/i.test(nazwa)) return 'specyfikacja';
  if (/^(?:CLAUDE|AGENTS)\.md$/i.test(nazwa)) return 'instrukcja dla modelu';
  if (/^PLAN\./i.test(nazwa) && !planDoAkceptacji(cwd, rel.split('/').slice(0, -1).join('/'))) return 'zamrozony plan';
  return null;
}

// Rodzaj dokumentu po sciezce (nakladka PL, "Tone by kind of text"); bez rozstrzygniecia
// — robocze, jak w komendzie.
const FORMALNE = /^(?:ARCHITEKTURA|ARCHITECTURE|DESIGN|PRZEWODNIK|GUIDE|INSTALACJA|INSTALL|PLAN|RAPORT|REPORT|PRZEKAZANIE|HANDOVER|PRZENOSNOSC|PORTABILITY)\b/i;

function rodzajDokumentu(rel) {
  return FORMALNE.test(String(rel || '').split('/').pop()) ? 'formalne' : 'robocze';
}

// --- regula po zapisie dokumentu ---------------------------------------------------------
// opcje: { profil } jak wyzej.
function regulaPoZapisie(rel, w, opcje) {
  const rodzaj = rodzajDokumentu(rel);
  const ton = ustawieniaHumanizacji.tonPelny(w)[rodzaj];
  const profil = w.profil && opcje && opcje.profil && w.profilW.includes(rodzaj)
    ? ' Profil stylu ' + opcje.profil + ' (rodzaj ' + rodzaj + ').' : '';
  const pokaz = w.pokaz === 'notka'
    ? 'Tryb notka: zapisz poprawke od razu i dopisz w odpowiedzi jedna linie z liczba usunietych wzorcow.'
    : 'Tryb dwie wersje: pokaz zmienione akapity obok oryginalu i zapytaj raz o "tak"; zapisujesz dopiero po zgodzie.';
  return '[RelAI humanizacja] Zapisales ' + rel + ' (tryb ciagly, zakres dokumenty). Gdy skonczysz ' +
    'zmiany tego pliku w tej turze, popraw jego proze wg ' + SKROT + ', rodzaj ' + rodzaj + ', ton ' + ton +
    '.' + profil + ' Tylko proza akapitow i punktow listy; tabele, naglowki, adnotacje *(...)*, kod, ' +
    'sciezki i wiersze czytane maszynowo bajt w bajt; nie dodawaj faktow. Przed zapisem straznik: node ' +
    STRAZNIK + " '" + rel + "' - z wersja na stdin (heredok jak w /relai-humanize, Krok 7); roznica = " +
    'plik zostaje bez zmian. ' + pokaz + ' Nic do zmiany = nic nie zapisujesz i nic nie piszesz. Zapis ' +
    'tej poprawki albo wersji zaakceptowanej nie wymaga kolejnej.';
}

// --- prompt a tura ----------------------------------------------------------------------
// Filtr pomijania optymalizatora rozpoznaje to samo, czego potrzebuje humanizacja:
// krotkie potwierdzenie, powiadomienie systemowe, pusty prompt.
function zaczynaTure(prompt) {
  return !NIE_NOWA_TURA.has(optymalizator.powodPominiecia(prompt));
}

function wymagaReguly(prompt) {
  return !BEZ_REGULY.has(optymalizator.powodPominiecia(prompt));
}

// --- raz na plik w turze ----------------------------------------------------------------
function katalogTury(cwd, sesja) {
  if (!ID_SESJI.test(String(sesja || ''))) return null;
  return path.join(cwd || '.', ...KATALOG_TURY.split('/'), String(sesja));
}

// Nowa tura: stan tej sesji znika. Cudzych katalogow nie rusza, poza sprzataniem
// starszych niz tydzien (sesje dawno zamkniete).
function nowaTura(cwd, sesja, teraz) {
  const k = katalogTury(cwd, sesja);
  if (!k) return;
  try { fs.rmSync(k, { recursive: true, force: true }); } catch (_) { /* nastepna tura sprobuje znowu */ }
  const rodzic = path.dirname(k);
  let wpisy = [];
  try { wpisy = fs.readdirSync(rodzic); } catch (_) { return; }
  const t = teraz || Date.now();
  for (const n of wpisy) {
    const pelna = path.join(rodzic, n);
    try {
      if (t - fs.statSync(pelna).mtimeMs > WIEK_STANU_TURY_MS) fs.rmSync(pelna, { recursive: true, force: true });
    } catch (_) { /* rownolegla sesja */ }
  }
}

// true przy pierwszym zapisie pliku w tej turze, false przy kolejnych. Znacznik pliku
// powstaje atomowo (`wx`), wiec dwa rownolegle hooki tej sesji nie odezwa sie oba.
// Bez identyfikatora sesji albo przy bledzie zapisu — false, czyli cisza: regula
// powtarzana po kazdym zapisie wlasnej poprawki zapetlilaby model.
function pierwszyZapisWTurze(cwd, sesja, rel) {
  const k = katalogTury(cwd, sesja);
  if (!k) return false;
  const znacznik = path.join(k, crypto.createHash('sha1').update(String(rel).toLowerCase()).digest('hex').slice(0, 16));
  try {
    fs.mkdirSync(k, { recursive: true });
    fs.closeSync(fs.openSync(znacznik, 'wx'));
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  wlaczone, maZakres, sciezkaProfilu, regulaPrzedOdpowiedzia, sciezkaWzgledna,
  powodPominieciaPliku, rodzajDokumentu, regulaPoZapisie, zaczynaTure, wymagaReguly,
  katalogTury, nowaTura, pierwszyZapisWTurze, SKROT,
};
