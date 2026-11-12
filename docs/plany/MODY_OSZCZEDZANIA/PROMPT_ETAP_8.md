# PROMPT_ETAP_8 — `relai-research`: badanie z kontrolą źródeł

Plan: MODY_OSZCZEDZANIA • Etap: **E8 z E10** • Wygenerowano: 2026-11-12 (autor: gpt-6.1-terra w Codeksie, w rytuale „Na koniec” E7) • Wykonawca: **gpt-6.1-terra w Codeksie** (Aneks C; przegląd i poprawki gpt-6.1-sol, Claude — bramka) — effort `high`

> **Kontrola modelu:** etap wykonuje model klasy **balanced**, **gpt-6.1-terra** (lista modeli
> codex z 2026-11-10), uruchomiony przez Claude zgodnie z Aneksem C; bez nakładki potwierdzającej
> model zatrzymaj się przed zapisem. Zalecany poziom `/effort`: `high` — błędne źródła albo
> przepuszczenie sekretu mogą zmienić wynik badania.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wynik `node .claude/relai/tools/start-digest.js` | rytuał startu i indeks zasad |
| `CLAUDE.md` | reguły procesu i ograniczenia repozytorium |
| `ANEKS_C_WYKONANIE_CODEX.md` obok tego pliku | podział pracy, bramka i pomiar E10 |
| `SPECYFIKACJA_FUNKCJI.md` sekcje 6 i 7 | zachowanie Research i wspólne bramki |
| `PLAN.html` wiersz E8 i ryzyka | zakres oraz kryterium raportu ze źródłami |
| `SONDY.md` sekcje 1–6, `POMIAR_E6.md` sekcja 1 | ograniczenia silnika, hook i karta |
| `docs/LEKCJE.md` zasady 1, 3, 4, 5, 7, 12, 13, 15 oraz L-0321, L-0331, L-0332, L-0333 | test negatywny, pomiar i ograniczenia wykonawcy |
| `docs/PULAPKI.md` P-057, P-063, P-064, P-067, P-068 | ograniczenia silnika i testów |
| `model-router/hooks/`, `effort/hooks/` i `browser/hooks/` | wzorce bramek, rejestru i subagentów; stan E7 potwierdź w bramce Claude |
| `core/tools/sync-panel-core.js`, `core/tools/release-map.json`, `.claude-plugin/marketplace.json`, `docs/ARTEFAKTY.md` | rejestracja i wersjonowanie promptów |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan D-33 zamrożony; Aneks A: bliźniak z `enabledPlugins`, Aneks C: kod i rytuał pisze Codex,
  przegląd Sol i bramkę robi Claude, sondy i pomiary E7–E9 przeniesione do E10.
- Clean room: kodu modów BenAI nie otwierasz. Specyfikacja opisuje zachowanie.
- Quick czyta strony równolegle, przypis wskazuje tylko faktycznie przeczytany URL. Deep kieruje
  subagentów przez `relai-model-router` bez jawnego modelu; niezweryfikowane źródła są oznaczone.
- Zgoda raz na projekt, skaner przed pomocnikiem, bliźniak i rejestr zgodnie z sekcją 7 specyfikacji.
- Granica: porządki AUDYT_MODOW — E9; pomiary na żywo, migracja i wydanie — E10. Nie podbijasz
  wersji istniejących modów ani nie publikujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.8.0 wydany; mody `browser`, `input-router`, `model-router` i `effort` 0.1.0 w repo,
niewydane. `effort/` zawiera sędziego i hooki; jego przegląd i pełne zestawy wykonuje bramka
Claude, a efekt nadpisania effort pozostaje do E10. Przed startem E8 sprawdź wynik tej bramki.
`core/panel/savings-gates.mjs` i `savings-ledger.mjs` są źródłem kopii rdzenia; `model-router/`
obsługuje subagentów. **Czego nie ma:** modu `relai-research`, jego promptów, testów, panelu,
rejestracji oraz dowodu kontroli źródeł.

## Zakres etapu

1. Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E8/`; sonda na żywo przeniesiona do E10.
   Odczytaj dostępne typy silnika; testy najpierw czerwone z asercji.
2. Zaimplementuj czystą logikę, prompty i mod `research/` zgodnie ze specyfikacją sekcji 6:
   auto dla `WebSearch`, zapis oryginału, quick i deep, równoległe pobieranie, numerację i kontrolę
   źródeł, wyjście awaryjne bez utraty oryginału. Zachowaj liczby, daty, nazwy i adresy.
3. Użyj bramek wspólnych i rejestru; skanuj każdą treść przed wysłaniem do pomocnika. Pokaż stan
   i przełączniki w panelu oraz komendę zapasową. Zarejestruj mod 0.1.0 w marketplace, release-map
   i `sync-panel-core`; promptom nadaj wersję w `ARTEFAKTY.md`.
4. Testuj zachowanie i granice, nie tylko wywołania: subagent, mały wynik, brak zgody, bliźniak,
   sekret, błąd pomocnika i brak pobranej strony; mutacje każdej ochrony mają czerwienić test.
   Wynik łączny i instrument zapisz; uruchamiaj pojedyncze pliki, gdy sandbox blokuje podprocesy.
5. Przegląd Sol i komplet testów zleca bramka Claude. Nie włączaj ani nie wyłączaj pluginów,
   nie commituj, nie rób push i nie usuwaj katalogu roboczego.

## Weryfikacja

- [ ] Wynik bramki E7 i stan drzewa sprawdzone; cudze zmiany nietknięte.
- [ ] Testy przed zmianą czerwone z asercji, po zmianie zielone; liczby i komendy w raporcie.
- [ ] Każdy przypis quick wskazuje faktycznie przeczytaną stronę; nieprzeczytane źródło deep
      jawnie oznaczone, a źródła przy scalaniu nie giną.
- [ ] Oryginał wyniku auto zapisany, ścieżka działa; awaria nie niszczy treści.
- [ ] Dowody negatywne i mutacje wszystkich warunków ochronnych; sekret nie idzie do pomocnika.
- [ ] Układ panelu sprawdzony w progach szerokości; testy i walidacja pluginu, pozostałych modów,
      rdzenia, procesu i adapterów; `sync-panel-core --check` zgodne.
- [ ] Trivy bez nowych CRITICAL/HIGH względem E7; brak nowych zależności i sekretów, kontrola
      pozytywna instrumentu. Granica plików i katalog roboczy sprawdzone.
- [ ] Sonda i pomiar na żywo przeniesione do E10 (Aneks C); przegląd Sol pozostaje bramce Claude.

## Na koniec

Codex wykonuje punkty 1–5 rytuału: STATUS (E8 i E9), wpis DZIENNIKA z ryzykami i podpisem,
lekcje i pułapki gdy powstały, STATE i linię aktywnego planu CLAUDE, rejestr artefaktów oraz
samowystarczalny `PROMPT_ETAP_9.md`. Bramki manualne pomiaru oznacza jako otwarte do E10.
Claude po bramce pyta o usunięcie katalogu roboczego i proponuje commit; Codex tego nie robi.
Raport zawiera zakres, wynik każdego punktu, pliki, mutacje i odchylenia; luki oznacz `STOP:`
albo `PYTANIE:` bez fikcyjnej zieleni.
