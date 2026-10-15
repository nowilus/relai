# STATUS — plan WYGLAD_PANELU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-14 · Status planu: **ZAAKCEPTOWANY 2026-10-14 (Aneksy A–F)** · Model wykonawczy etapów: Opus 5.5, świeże sesje (ustawienie projektu, D-85; ustalony w Claude Code)

Makieta kalibracyjna paska postępu: [MAKIETA_PASEK_POSTEPU.html](MAKIETA_PASEK_POSTEPU.html) (wariant 1, kierunek przyjęty 2026-10-14).

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Sonda nośnika i paski w kolorach narzędzia | ZREALIZOWANY 2026-10-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | sonda przed kodem docelowym; jej wynik może uruchomić wariant awaryjny B |
| E2 | Pasek postępu jako lista kroków | ZREALIZOWANY 2026-10-15 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | wg makiety |
| E3 | Panel w szacie jasnej | ZREALIZOWANY 2026-10-15 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | start dopiero po zamknięciu odnogi [PANEL_WASKI](../../fixy/PANEL_WASKI/ODNOGA.md) (zamknięta 2026-10-14) |
| E4 | Odbiór całości i wydanie | GOTOWY DO STARTU | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | wydanie po zgodzie Łukasza |

## Dziennik wdrożenia

- 2026-10-14 — plan utworzony po wywiadzie i kalibracji makiety paska postępu, przekazany do akceptacji; układ panelu zostaje przy odnodze PANEL_WASKI (decyzja Łukasza).
- 2026-10-14 — plan ZAAKCEPTOWANY z Aneksem A (sonda obowiązkowa, trzy warianty do oceny w E1–E3, rundy poprawek). Wygenerowano PROMPT_ETAP_1.
- 2026-10-14 — E1: sonda `relai-motyw-sonda` 0.1.0–0.2.0 (P-042) — klucze motywu i `prefers-color-scheme` w `Svg` idą za wyglądem aplikacji, mod go nie widzi; Aneks B przyjęty (paski na kluczach, `Svg` z dwiema paletami w CSS, ograniczenie dla E3).
- 2026-10-14 — E1 ZREALIZOWANY: paski w kluczach motywu i `Svg` w dwóch paletach (wariant 3b, linia L2 tylko między paskami RelAI, wszystkie przyciski `primary`), w repo bez wydania (wydanie w E4); E2 gotowy do startu.
- 2026-10-15 — E2 rozpoczęty
- 2026-10-15 — E2 ZREALIZOWANY: pasek postępu jako lista kroków (wygląd A, jasny „J3 miękki”, zwijanie tekstem, stan za nazwą, zrobione od lewej, kręcenie tylko przy pracy modelu; akceptacja „Akceptuje”), w repo bez wydania (wydanie w E4); E3 gotowy do startu, wygenerowano PROMPT_ETAP_3.
- 2026-10-15 — Aneks C przyjęty („Tak, ale przed E3”): pełna karta startu `/relai-stage` (akapit „gdzie jesteśmy”, tabela etapów, lista punktów weryfikacji, model i effort, pełny tekst) — poprawka przed E3, wydanie w E4.
- 2026-10-15 — Aneks D przyjęty („Tak, zapisz układ z przykładu w Kroku 4 komendy jako Aneks D przed E3, pola z Aneksu C zostają.”): stały układ karty startu `/relai-stage` — uwagi z sytuacji i „gdzie jesteśmy” przed kartą, nagłówek „Karta startu” z listą pól, „Czego dotyczy” w podpunktach, najtwardszy punkt ze zdaniem, co gdy nie przejdzie — poprawka przed E3, wydanie w E4.
- 2026-10-15 — E3 rozpoczęty
- 2026-10-15 — Aneks E przyjęty („Automatycznie, tła w Svg (Rekomendowane)”, po sondzie `relai-szata-sonda` 0.1.0–0.3.0, P-044): panel przełącza szatę sam — powierzchnie w `Svg` z obiema paletami Warsztatu, tekst w kluczach motywu, bez przełącznika w Pomocy.
- 2026-10-15 — Aneks F przyjęty („Czyli nadal mają te takie dziwne jakieś bordery”, prośba o „design MD”): `docs/zasoby/PANEL_RELAI/DESIGN.md` jako źródło wyglądu panelu i pasków; wariant 3 (sekcje bez kart, gasnące linie, ramka tylko przy decyzji) na wszystkich zakładkach.
- 2026-10-15 — przegląd UX po Aneksie F: kartka zawsze wypełniona z ramką w rysunku, próg desktopu zmierzony w elementach (`DRAW_LIMIT` 1 200, bezpiecznik), baza poprawek na wszystkich zakładkach, zrzuty obu szat; E3 dalej W TOKU.
- 2026-10-15 — E3 ZREALIZOWANY: panel w obu szatach automatycznie (wariant 3 · jedna kartka, ramka subtle, akceptacja „jest ok juz nie bede pokazywal ale jest ok”), kartka wypełniona bez szczeliny na wszystkich zakładkach, sprawdzona na żywo w obu szatach, rozwinięta i w wąskim panelu 530 px; w repo bez wydania (wydanie w E4); E4 gotowy do startu, wygenerowano PROMPT_ETAP_4.
- 2026-10-15 — po E3: foldery drzewa z własną jasną paletą i hover w kluczu motywu także tam, gdzie silnik go trzyma (na węźle, P-045); uwagi Łukasza po commicie E3.
