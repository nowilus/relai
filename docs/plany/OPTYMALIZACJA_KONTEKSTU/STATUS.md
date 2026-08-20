# STATUS — plan OPTYMALIZACJA_KONTEKSTU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-08-20 · Status planu: **ZAAKCEPTOWANY 2026-08-20** ·
Model wykonawczy etapów: Opus (z ustawień projektu; architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Miara startu i budżet | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | pomiar w `core/process/session-signals.js`, wpięcie w hook `session-context` obu adapterów; przy okazji naprawiona `liniaAktywnegoPlanu` (L-0048) |
| E2 | Rozbrojenie rotacji | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | sekcja „Czeka na człowieka" w dzienniku i w specyfikacji, blokada liczona tylko z niej, drugie wejście rotacji na starcie; dogfooding: 41 otwartych linii → 9 spraw |
| E3 | STATE i CLAUDE pod budżetem | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | trzy pozycje w „Nad czym pracujemy teraz", limit `CLAUDE.md` w KB, zakaz treści odtwarzalnej, `SPEC_PULAPKI` + `docs/PULAPKI.md`, jeden adres egzekwowania limitu zasad; 73,4 → 63,8 KB |
| E4 | Ryzyka, ustawienia, status planu | **GOTOWY DO STARTU** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | stan bieżący zamiast historii; po tym etapie wydanie 1.6.0 |
| E5 | Migracja JiraManagera i PolyFlow | OCZEKUJE | — | backup bramką, jeden projekt na sesję, pomiar przed i po, zamknięcie R5 |

## Bramki manualne

- **Aneks do planu ROZWOJ_PO_WYDANIU: numer wydania E7 z 1.6.0 na 1.7.0** · źródło: sekcja 9 planu ·
  **ROZSTRZYGNIĘTA 2026-08-20 — aneksu nie piszemy.** Decyzja Łukasza przy starcie E1: E7 (adapter
  Codeksa) zostaje wstrzymany, bo konto Codeksa jest w planie darmowym i nie ma kto przeprowadzić
  pilotażu. Kolizja numerów wersji nie grozi, dopóki E7 stoi; wraca do rozstrzygnięcia razem
  z odmrożeniem tamtego planu
- **Decyzja o zamrożeniu planu ROZWOJ_PO_WYDANIU** (Łukasz: „moglibyśmy ewentualnie to zamrozić") ·
  źródło: rozmowa przy starcie E1, 2026-08-20 · **OTWARTA** — jedyny niezamknięty etap tamtego planu
  to E7; formalne zamrożenie albo jego brak zmienia to, co widzi start sesji
- **Okno na migrację JiraManagera i PolyFlow (oba projekty bez etapu w toku)** · źródło: sekcja 9
  planu; równoległa bramka planu ROZWOJ_PO_WYDANIU · **OTWARTA**
- **Sekwencja wydania 1.6.0: push → `plugin marketplace update` → `plugin update` → restart** ·
  źródło: sekcja 9 planu · **OTWARTA**
- **Decyzja o progu 30 KB na sekcję „Zasady aktywne" po pomiarze z E5** · źródło: sekcja 9 planu ·
  **OTWARTA**
- **Weryfikacja siedmiu rozstrzygnięć wpisanych w E2 do zastanych pozycji dziennika** (każde
  z dowodem w adnotacji; sprzeciw cofa je jedną linią) · źródło: wpis dziennika 2026-08-20 (E2) ·
  **OTWARTA**
- **Zgoda na odchudzenie sekcji „Zasady aktywne" — 48 pozycji przy limicie 15** · źródło: wpis
  dziennika 2026-08-20 (E3) · **ROZSTRZYGNIĘTA 2026-08-20 — zgoda Łukasza, kompresja wykonana tego
  samego dnia:** 48 pozycji w 15 grup tematycznych, 30 pełnych wpisów ze statusem `ZWINIĘTA`
  w nowej sekcji „Lekcje zwinięte", pozycja `zasady` w warstwie startowej 11,8 → 4,8 KB

## Dziennik wdrożenia

- 2026-08-20 — plan utworzony po pomiarze warstwy startowej w trzech projektach (JiraManager 386 KB,
  PolyFlow 155 KB, RelAI 90 KB) i dwóch rundach wywiadu; przekazany do akceptacji.
- 2026-08-20 — plan **ZAAKCEPTOWANY** bez poprawek (brak aneksu). Sekcje 1–9 zamrożone.
  Wygenerowano PROMPT_ETAP_1; E1 ustawiony jako GOTOWY DO STARTU.
- 2026-08-20 — E1 rozpoczęty.
- 2026-08-20 — E1 **ZREALIZOWANY**: `startCost` i `startCostReport` w rdzeniu, oba hooki wołają tę
  samą funkcję, wiersz `Budżet startu sesji` w specyfikacji i w projekcie. Warstwa startowa RelAI:
  57,9 KB / 80 KB. Naprawiona `liniaAktywnegoPlanu` — siatka D-34 i detektor rozjazdu przestały
  milczeć bez powodu. E2 gotowy do startu.
- 2026-08-20 — E2 rozpoczęty.
- 2026-08-20 — E2 **ZREALIZOWANY**: blokada rotacji przeniesiona do sekcji „Czeka na człowieka",
  drugie wejście rotacji na starcie, sprzężenie raportu budżetu z wyłącznikiem rotacji. Zmierzone
  na projekcie testowym w jednym przebiegu: 0 wpisów pod regułą 1.5.2, 2 wpisy pod 1.6.0. W tym
  repozytorium 41 otwartych linii → 9 spraw, zero zgubionych. Warstwa startowa: 71,3 KB / 80 KB.
  Wersja bez zmian (1.5.2). E3 gotowy do startu.
- 2026-08-20 — E3 rozpoczęty.
- 2026-08-20 — E3 **ZREALIZOWANY**: twardy kształt `SPEC_STATE` (trzy pozycje, podmiana zamiast
  dopisywania, próg zwięzłości jako liczba), `SPEC_CLAUDE_MD` na 10 KB z zakazem treści
  odtwarzalnej, nowa `SPEC_PULAPKI` i `docs/PULAPKI.md` (6 pułapek wyprowadzonych z „Zasad
  aktywnych"), jeden adres egzekwowania limitu zasad w rytuale zamknięcia sesji. Warstwa startowa
  **73,4 → 63,8 KB**; `CLAUDE` 3,1 KB i `STATE` 9,3 KB — obie pod własnym progiem. Wersja bez zmian
  (1.5.2). E4 gotowy do startu.
