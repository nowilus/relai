# STATUS — plan OPTYMALIZACJA_KONTEKSTU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-08-20 · Status planu: **ZAAKCEPTOWANY 2026-08-20** ·
Model wykonawczy etapów: Opus (z ustawień projektu; architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Miara startu i budżet | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | pomiar w `core/process/session-signals.js`, wpięcie w hook `session-context` obu adapterów; przy okazji naprawiona `liniaAktywnegoPlanu` (L-0048) |
| E2 | Rozbrojenie rotacji | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | sekcja „Czeka na człowieka" w dzienniku i w specyfikacji, blokada liczona tylko z niej, drugie wejście rotacji na starcie; dogfooding: 41 otwartych linii → 9 spraw |
| E3 | STATE i CLAUDE pod budżetem | **ZREALIZOWANY 2026-08-20** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | trzy pozycje w „Nad czym pracujemy teraz", limit `CLAUDE.md` w KB, zakaz treści odtwarzalnej, `SPEC_PULAPKI` + `docs/PULAPKI.md`, jeden adres egzekwowania limitu zasad; 73,4 → 63,8 KB |
| E4 | Ryzyka, ustawienia, status planu | **ZREALIZOWANY 2026-08-21** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | ryzyka 28,5 → 10,5 KB; przy okazji naprawiony defekt CRLF w pomiarze (zgoda na rozszerzenie zakresu) |
| E5 | Migracja JiraManagera i PolyFlow | **GOTOWY DO STARTU** | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | backup bramką, jeden projekt na sesję, pomiar przed i po, zamknięcie R5 |

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
  planu; równoległa bramka planu ROZWOJ_PO_WYDANIU · **OTWARTA — częściowo rozpoznana 2026-08-21:**
  PolyFlow nie ma katalogu `docs/plany`, więc żaden etap tam nie trwa i projekt jest gotowy;
  JiraManager ma etap **E16-1 planu PANEL_WTYCZKI w statusie `W TOKU`**, więc jego migracja czeka
  na zamknięcie tamtego etapu (sekcja 8 planu)
- **Sekwencja wydania 1.6.0: push → `plugin marketplace update` → `plugin update` → restart** ·
  źródło: sekcja 9 planu · **OTWARTA — od 2026-08-21 jest warunkiem startu E5:** migracja przechodzi
  przez `/relai-update` właśnie na tę wersję, a wersja 1.6.0 niesie też naprawę pomiaru przy CRLF
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

- 2026-08-20 — plan utworzony po pomiarze warstwy startowej w trzech projektach; do akceptacji.
- 2026-08-20 — plan **ZAAKCEPTOWANY** bez poprawek; sekcje 1–9 zamrożone, wygenerowano PROMPT_ETAP_1.
- 2026-08-20 — **E1 ZREALIZOWANY**: pomiar warstwy startowej w rdzeniu i w obu hookach; E2 gotowy.
- 2026-08-20 — **E2 ZREALIZOWANY**: blokada rotacji przeniesiona do sekcji „Czeka na człowieka",
  rotacja dostała drugie wejście na starcie sesji; E3 gotowy.
- 2026-08-20 — **E3 ZREALIZOWANY**: twardy kształt `STATE.md` i `CLAUDE.md`, rejestr pułapek jako
  osobny dokument; E4 gotowy.
- 2026-08-21 — **E4 ZREALIZOWANY**: stan bieżący zamiast kroniki w ryzykach, ustawieniach
  i dzienniku wdrożenia, archiwum ryzyk zamkniętych, wersja 1.6.0; E5 gotowy.
