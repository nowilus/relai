# STATUS — plan PANEL_CLAUDE

[PLAN.html](PLAN.html) · utworzony 2026-10-08 · **ZAAKCEPTOWANY 2026-10-08** · Aneksy A, B (2026-10-08) · model wykonawczy: Opus, w Claude Code (autor planu: Opus 5.5 — jednorazowy wyjątek od reguły „plany: Fable”, decyzja człowieka 2026-10-08)

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Szkielet relai-panel i pasek RelAI | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | aneks do D-80 wpisany 2026-10-08; rdzeń panelu w ESM z kopią w `panel/hooks/core/` |
| E2 | Panel boczny i formularze 14 komend | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | kamień milowy „GUI zamiast wpisywania”; panel w `register.tsx` — silnik nie przekazuje `$` przez import |
| E8 | Motyw RelAI i ikony komend | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_8.md](PROMPT_ETAP_8.md) | Aneks A: po E2, przed E3; wariant A z „Polecane” z C, przyciski natywne z sygnałem kliknięcia (decyzje człowieka) |
| E3 | Kolektor pomiarów i raport kosztów | ZREALIZOWANY 2026-10-08 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | schemat pomiaru ustala ten plan (pole `tool`, decyzja 2026-10-08); raport kosztów skalibrowany na żywo w 6 rundach |
| E9 | Postęp pracy i agenci na żywo | GOTOWY DO STARTU | [PROMPT_ETAP_9.md](PROMPT_ETAP_9.md) | Aneks B: po E3, przed E4; pasek postępu i panel agentów w `relai-panel`, jednolite karty trzech modów nad promptem |
| E4 | Mapa przepływu i przypisanie pracy | OCZEKUJE | — | |
| E5 | Decyzje w panelu | OCZEKUJE | — | dostosowanie procedury `/relai-stage` w pluginie `relai` |
| E6 | Dokumenty i cennik | OCZEKUJE | — | zgoda na ruch sieciowy przy odświeżaniu cennika — przed E6 |
| E7 | Wydanie relai-panel | OCZEKUJE | — | publiczny marketplace czy lokalnie — przed E7 |

## Bramki manualne

- **Usunąć sondę `relai-probe` z folderu modów sesji `ab158a41-…`** · źródło: wpis dziennika
  2026-10-08 (E1) · **ROZSTRZYGNIĘTA 2026-10-08 — folder pusty (sprawdzone przy zamknięciu E3)**
- **Po E8 usunąć kopię `relai-panel` z folderu modów sesji `cd13613d-…`** · źródło: wpis dziennika
  2026-10-08 (E2) · **OTWARTA** (termin minął: E8 zamknięty)
- **Usunąć z folderu modów sesji `6916a9af-…` sondę `relai-probe-e8` i mod kalibracyjny
  `relai-variants-e8`; kopię `relai-panel` — po E3 albo wcześniej** · źródło: wpis dziennika
  2026-10-08 (E8) · **OTWARTA** (termin minął: E3 zamknięty)
- **Usunąć z folderu modów sesji `45c5daa1-…` kopię `relai-panel` (0.4.0, pomiar E3)** · źródło:
  wpis dziennika 2026-10-08 (E3) · **OTWARTA** (sonda `relai-probe-e3` usunięta przy zamknięciu E3)

## Dziennik wdrożenia

- 2026-10-08 — Plan utworzony na podstawie `docs/zasoby/PANEL_RELAI/WYWIAD.md` i trzech rund wywiadu w sesji Claude Code; prototyp wzorców API: prywatny mod `cache-keeper-pl` (poza repo). Czeka na akceptację.
- 2026-10-08 — Plan zaakceptowany bez poprawek; aneks do D-80 wpisany do `docs/DECYZJE.md`; wygenerowano `PROMPT_ETAP_1.md`.
- 2026-10-08 — E1 zrealizowany: pasek RelAI nad promptem (plan, etap, timer cache, koszt sesji), `core/panel/` + `panel/`; na żywo w aplikacji desktopowej oba paski (RelAI i cache-keeper-pl), poza RelAI cisza.
- 2026-10-08 — E2 zrealizowany: `/relai-panel` otwiera panel boczny z formularzami 14 komend (podgląd dokładnego tekstu, wysyłka `$.command.run`), ściągą z wyszukiwaniem i frazami sesji (`$.prompt.submit`); na żywo w aplikacji desktopowej `/relai:relai-tour krotko` i „sprawdź status” z panelu, oba paski widoczne.
- 2026-10-08 — Aneks A: nowy etap E8 „Motyw RelAI i ikony komend” po E2, przed E3; wygenerowano `PROMPT_ETAP_8.md`.
- 2026-10-08 — E8 zrealizowany: motyw RelAI w panelu (karty z ikonami 14 komend, „Polecane teraz”, nagłówki Kalamem w Svg, natywne przyciski z błyskiem ramki), terminal tekstem; na żywo na desktopie i w terminalu 2.1.293; wygenerowano `PROMPT_ETAP_3.md`.
- 2026-10-08 — Aneks B: nowy etap E9 „Postęp pracy i agenci na żywo” po E3, przed E4 (decyzje człowieka w trakcie E3).
- 2026-10-08 — E3 zrealizowany: kolektor pomiarów (wątek główny, subagenci, kompakcje → `.claude/relai/pomiary/<data>-<sesja>.jsonl`), schemat rekordu wspólny z panelem Codeksa, datowany cennik, zakładka „Koszty” (suma, licznik silnika, cache, wywołania w czasie z podpowiedziami, agenci, modele, projekt), pasek RelAI w ramce; R2 na żywo: 117/117 kroków i 8/8 tur zgodnych z sondą; wygenerowano `PROMPT_ETAP_9.md`.
