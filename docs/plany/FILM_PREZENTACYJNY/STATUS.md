# STATUS — plan FILM_PREZENTACYJNY

[PLAN.html](PLAN.html) · utworzony 2026-10-12 · **ZAAKCEPTOWANY 2026-10-12** · Aneks A (2026-10-12) · Aneks B (2026-10-12) · Aneks C (2026-10-12) · Opus 5.5 w Claude Code (ustawienia projektu, D-85)

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Klatka wzorcowa i 10 s ruchu | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | `/effort high`; zgoda na instalację Remotion przed startem; bramka smaku przed E2 |
| E2 | Scenariusz i animatik | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `/effort medium` |
| E3 | Sceny 1–3 | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `/effort high`; zrzuty referencyjne panelu 0.14 od Łukasza |
| E4 | Sceny 4–6 | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | `/effort high`; zrzuty 08–09 (karta nowej sesji, karta progu) już są |
| E5 | Scena komend | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | Aneksy A–C; `/effort high`; scena 2 (wstęp), 3,5 s na komendę, film 169 s z muzyką „daylight hour” (CC BY 4.0) |
| E6 | Wersja EN, pętla, kontrola jakości | GOTOWY DO STARTU | [PROMPT_ETAP_6.md](PROMPT_ETAP_6.md) | `/effort medium`; dawny E5 (Aneks A), obejmuje słownik EN sceny komend i muzykę w EN i w pętli (Aneks B) |
| E7 | Wydanie RelAI 3.0.0 | OCZEKUJE | — | `/effort medium`; dawny E6 (Aneks A); publikacja po zgodzie |

## Bramki manualne

- **Zrzuty referencyjne panelu 0.14 z desktopu** (Teraz, Koszty, Dokumenty, karta nowej sesji, karta progu limitu) · źródło: wpis dziennika 2026-10-12 (E1) · **ROZSTRZYGNIĘTA 2026-10-12 — dziewięć zrzutów 0.14 od Łukasza w `docs/zasoby/PANEL_RELAI/zrzuty/` (01–07 do sceny 3, 08–09 do E4)**
- **Start E2 w świeżej sesji Opus 5.5** (`/relai-stage`, `/effort medium`) · źródło: wpis dziennika 2026-10-12 (E1) · **ROZSTRZYGNIĘTA 2026-10-12 — E2 wykonany w świeżej sesji Opus 5.5 z kartą `/relai-stage`**
- **Start E3 w świeżej sesji Opus 5.5** (`/relai-stage`, `/effort high`) · źródło: wpis dziennika 2026-10-12 (E2) · **ROZSTRZYGNIĘTA 2026-10-12 — E3 wykonany w świeżej sesji Opus 5.5 z kartą `/relai-stage`**
- **Start E4 w świeżej sesji Opus 5.5** (`/relai-stage`, `/effort high`) · źródło: wpis dziennika 2026-10-12 (E3) · **ROZSTRZYGNIĘTA 2026-10-12 — E4 wykonany w świeżej sesji Opus 5.5 z kartą `/relai-stage`**
- **Karta startu etapu pokazuje „⚠ plan nie wskazuje modelu”** (zrzut 08) — odnoga z poprawką panelu przed E4 albo scena 4 bez wiersza modelu · źródło: wpis dziennika 2026-10-12 (E3) · **ROZSTRZYGNIĘTA 2026-10-12 — Łukasz: scena 4 pokazuje wiersz Model w stanie zgodnym; przyczyna: `requiredModel()` w `core/panel/decisions.mjs` wymaga etykiety „model wykonawczy:”, której `SPEC_STATUS` nie wymaga — poprawka parsera odnogą po E4, przed wydaniem 3.0.0 (E6)**
- **Start E5 w świeżej sesji Opus 5.5** (`/relai-stage`; po Aneksie A to scena komend, `/effort high`) · źródło: wpis dziennika 2026-10-12 (E4) · **ROZSTRZYGNIĘTA 2026-10-12 — E5 wykonany w świeżej sesji Opus 5.5 ze zgodą z karty panelu**
- **Start E6 w świeżej sesji Opus 5.5** (`/relai-stage`, `/effort medium`) · źródło: wpis dziennika 2026-10-12 (E5) · **OTWARTA**
- **Odnoga z poprawką parsera modelu na karcie startu etapu** (`requiredModel()` w `core/panel/decisions.mjs` i kopiach pluginów) — przed wydaniem (po Aneksie A: E7) · źródło: wpis dziennika 2026-10-12 (E4) · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-12 — plan utworzony po dwóch rundach wywiadu (film ~2 min + pętla 25 s, UI odtworzone z prawdziwych danych, bez lektora, napisy PL i EN, kierunek „Warsztat z wigorem”, GIF w repo + MP4 w wydaniu, Remotion na licencji darmowej); czeka na akceptację
- 2026-10-12 — plan zaakceptowany przez Łukasza bez poprawek; aktywny plan w `CLAUDE.md`; E1 gotowy do startu z `PROMPT_ETAP_1.md`
- 2026-10-12 — E1 zrealizowany: projekt Remotion w `docs/zasoby/film/zrodla/`, scena „Trzy paski” 10 s z danych repo i zrzutu z1, kierunek „Warsztat z wigorem” przyjęty po dwóch rundach (`kalibracja/E1-klatka.png`); E2 gotowy do startu
- 2026-10-12 — E2 zrealizowany: słownik PL sześciu scen bez cyfr, `scenariusz.ts` (120 s), manifest 10 faktów ze skryptu, test faktów z kontrolami, animatik 3600 klatek; kolejność, czasy i tekst przyjęte przez Łukasza w pierwszej rundzie; E3 gotowy do startu
- 2026-10-12 — E3 zrealizowany: sceny 1–3 w pełnej jakości (Pamięć, Trzy paski 23 s z cięciem bez szwu po 10 s E1, Panel z kodu `relai-panel` 0.14 i dziewięciu zrzutów Łukasza), zakładki słownika wyrównane do `TABS`, test wierności, render pierwszej minuty 1950 klatek; przyjęte przez Łukasza w drugiej rundzie (karteczka „postęp etapu”, pytanie „ile zrobione”); E4 gotowy do startu
- 2026-10-12 — E4 rozpoczęty
- 2026-10-12 — E4 zrealizowany: sceny 4–6 w pełnej jakości (karta startu E4 z `stageCard()` i nowa sesja, karta limitu bez liczb sesji z zapisem i „Wznów pracę”, finał z manifestu), dane `sceny.json` ze źródłami, plansze usunięte, cały film PL 3600 klatek; przyjęte przez Łukasza w pierwszej rundzie; E5 gotowy do startu
- 2026-10-12 — Aneks A: nowa scena 4 „Komendy” (14 komend po 2,5 s, rekwizyty na biurku, nazwa + slogan, kolejność cyklu życia projektu) po scenie „Panel”, film 155 s SZACUNEK; nowy E5 „Scena komend”, dawne E5–E6 → E6–E7; `PROMPT_ETAP_5.md` wygenerowany dla nowego E5 (poprzednia treść — EN i pętla — w historii gita, commit `cbe0f29`, materiał dla E6)
- 2026-10-12 — E5 rozpoczęty
- 2026-10-12 — Aneks B (w trakcie E5, runda 1 pokazu): scena komend jako wstęp zaraz po „Pamięci”, 3,5 s na komendę (scena 49 s, film 169 s), nazwy duże na górze kadru, muzyka skomponowana w kodzie (`skrypty/muzyka.mjs`, takt = komenda)
- 2026-10-12 — Aneks C (w trakcie E5, runda 2 pokazu): muzyka syntetyzowana odrzucona; ścieżką filmu „daylight hour” — snoozy beats (CC BY 4.0), wybór Łukasza, plik z kartą źródła w `docs/zasoby/film/muzyka/`
- 2026-10-12 — E5 zrealizowany: scena „Komendy” jako wstęp po „Pamięci” (14 rekwizytów, 3,5 s na komendę, nazwy na górze kadru), cały film PL 5070 klatek / 169 s z muzyką, przyjęty przez Łukasza w trzeciej rundzie (poziom muzyki −30 %); E6 gotowy do startu
