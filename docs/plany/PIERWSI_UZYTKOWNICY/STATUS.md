# STATUS — plan PIERWSI_UZYTKOWNICY

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-12 · Status: **ZAAKCEPTOWANY** (zamrożony 2026-09-12, D-33) · Model wykonawczy etapów: **Opus** (preferencja z USTAWIENIA.md, D-85)

Cel: sprawdzić aktywne użycie RelAI przez samodzielnych twórców pracujących z AI w Polsce.
Uzgodniony limit: 2–4 sesje, bez płatnej promocji (FAKT — wywiad 2026-09-12).
Plan proponuje 3 sesje podstawowe i najwyżej 1 rezerwową, około 5–8 h pracy oraz 14–21 dni
kalendarzowych (SZACUNEK). Progi pilotażu są propozycją do akceptacji, nie wynikiem pomiaru.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Pokaz i wiarygodne wejście | ZREALIZOWANY 2026-09-12 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | Sprawdzona instalacja, **materiał demo renderowany przez agenta** (Aneks A: 25 s GIF + 60 s MP4, PL/EN), aktualny początek README; bez publikacji |
| E2 | Zaproszenie i próby | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | Gotowe materiały, istniejący wątek OPIS_REPO, próby spoza autora; publikacja po konkretnej dyspozycji |
| E3 | Powrót i decyzja | OCZEKUJE | — | Obserwacje po przerwie, WYNIKI.md, rekomendacja dalszego kierunku; jawnie także wynik nierozstrzygający |

## Odnogi

| Odnoga | O co chodzi | Etap-źródło | Karta | Status |
|---|---|---|---|---|
| HOOKI_KORZEN | Claude Code ładuje korzeniowy `hooks/` Codeksa obok hooków adaptera: zdublowany kontekst startu i błąd schematu `SessionEnd` | E1 | [karta](odnogi/HOOKI_KORZEN/ODNOGA.md) | **ZAMKNIĘTA 2026-09-12** (2.1.4, P-013; release czeka na dyspozycję) |

## Zależność od istniejącego wątku

E2 korzysta z otwartej [odnogi OPIS_REPO](../../archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md).
Nie utworzono drugiej odnogi. Jej karta wymaga aktualizacji zakresu i kryteriów podczas E2,
z jawnym śladem zmiany. Nie została teraz przeniesiona ani zamknięta.

## Bramki manualne

- ~~**Akceptacja planu**~~ — **ROZSTRZYGNIĘTE 2026-09-12**: Łukasz zaakceptował plan; plan zamrożony,
  PROMPT_ETAP_1.md wygenerowany, E1 gotowy do startu.
- **Dyspozycja publikacji i kontaktów** — E2; dotyczy dopiero gotowych materiałów i określonych
  kanałów/odbiorców. Samo zatwierdzenie planu nie zleca wysyłki.
- **Uczestnicy** — E2; wskazanie chętnych lub wykorzystanie przygotowanego zaproszenia przez Łukasza.
  Brak kandydatów nie uruchamia bezterminowej rekrutacji; raport opisze brak danych.
- ~~**Kalibracja smaku materiału demo**~~ — **ROZSTRZYGNIĘTA 2026-09-12**: Łukasz zaakceptował
  kierunek na jednej klatce kluczowej („Jest OK. Akceptuję"); szczegóły w
  [DEMO.md](DEMO.md), sekcja „Kierunek wizualny".
- **Wydanie 2.1.4** — E1 dowiózł naprawę P-013 i commit lokalny; tag `v2.1.4`, push i release
  należą do właściciela. **Do wydania nikogo nie zapraszamy** — publiczna instalacja serwuje 2.1.3
  z wadą.

## Dziennik wdrożenia

- 2026-09-12 — ocena krytyki z Odpalone na podstawie tekstu użytkownika, dokumentów repo i oficjalnych
  dokumentacji konkurencji. Wywiad: aktywni użytkownicy i feedback, Polska, samodzielni twórcy,
  mały eksperyment bez płatnej promocji. Utworzono PLAN.html i rejestr źródeł; etapy nie rozpoczęte.
- 2026-09-12 — builder i kontrola struktury PASS: sekcje, znaczniki, ID, odsyłacze, osadzone fonty,
  brak zasobów zewnętrznych, zgodne wskazanie planu. **Podgląd wizualny i interakcje NOT TESTED**:
  polityka narzędzia przeglądarkowego odrzuciła lokalny URL pliku; bez obchodzenia blokady.
- 2026-09-12 — **plan zaakceptowany i zamrożony** (D-33). Wygenerowany `PROMPT_ETAP_1.md` ze
  specyfikacji promptu etapowego, na bazie sekcji 2–9 planu, realnego stanu repozytorium
  (2.1.3 lokalnie, 2.1.2 opublikowane) i pełnej listy zasad aktywnych. E1 → GOTOWY DO STARTU.
- 2026-09-12 — **Aneks A** (sekcja 10 planu): materiał demo produkuje agent, nie nagrywa go człowiek.
  Wywiad dwiema rundami ustalił hybrydę brand + wierny replay, Remotion → 25 s GIF i 60 s MP4,
  bohatera „plan, etapy, świeża sesja etapu", neutralny projekt kontrolny, napisy PL i EN, bez
  dźwięku. Trzy nowe ryzyka (A1–A3), nowa bramka „kalibracja smaku". `PROMPT_ETAP_1.md` poprawiony
  przed startem etapu (prompt niewykonany — poprawka zamiast drugiego aneksu).
- 2026-09-12 — **E1 rozpoczęty**. Bramka „kalibracja smaku" rozstrzygnięta przed startem: kierunek
  wizualny (ciepły papier, zaokrąglone karty w lekkim szkle, Caveat jako akcent, chipy etapów,
  strzałka jako spoiwo między sesjami) zaakceptowany przez Łukasza. Korekta układu zapisana jako
  L-0094; prompt E1 dostał moduł tokenów i instrument kontroli układu.
- 2026-09-12 — **E1 ZREALIZOWANY**. Dowiezione: zmierzona publiczna instalacja (2.1.3, 13 komend,
  `validate` PASS, 6/6 plików zgodnych z tagiem), dwa realne przebiegi w neutralnym projekcie
  kontrolnym, cztery pliki materiału (25 s GIF i 60 s MP4, PL i EN), `DEMO.md` z tabelą pokrycia
  11/11, `docs/zasoby/demo/`, poprawiony początek README z osadzonym GIF-em, datowany odczyt wpisu
  na Odpalone. Po drodze odnoga HOOKI_KORZEN (P-013, 2.1.4) — zamknięta. Niedowiezione jawnie:
  weryfikacja GIF-a na żywym GitHubie (wymaga pusha) i potwierdzenie pojedynczego bloku kontekstu
  w aplikacji (wymaga `plugin update` i restartu). E2 → GOTOWY DO STARTU.

RelAI (GPT-6) + Lukasz
