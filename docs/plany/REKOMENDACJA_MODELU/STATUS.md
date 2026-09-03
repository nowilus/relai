# STATUS — plan REKOMENDACJA_MODELU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-03 · Status planu: **ZAAKCEPTOWANY 2026-09-03**
(z Aneksem A) · Model wykonawczy etapów: Opus (z ustawień projektu, D-85; architektura i plany: Fable)

> Plan powstał z odnogi `REKOMENDACJA_MODELU` planu ROZWOJ_PO_WYDANIU (utworzonej 2026-08-17 po
> pilotażu E6). Wywiad 2026-09-03 rozszerzył zakres o odświeżanie listy modeli — komenda na żądanie
> i przypomnienie po progu — więc wątek przestał mieścić się w jednej sesji i przeszedł na pełny
> plan. Odnoga jest zamknięta linią `PRZENIESIONA` w
> [STATUS planu ROZWOJ_PO_WYDANIU](../ROZWOJ_PO_WYDANIU/STATUS.md).

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Lista modeli i pytanie z nazwami | **ZREALIZOWANY 2026-09-03** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | `MODELE.md` w obu adapterach, prowizjonowanie kopii do projektu **tylko przy braku pliku**, listy rozróżniane nazwą pliku (Aneks A); kamień milowy planu |
| E2 | Komenda `/relai-models` | **GOTOWY DO STARTU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | wejście: adresy stron dokumentacji i decyzja o zgodzie na sieć (sekcja 9 planu) — **obie bramki nadal OTWARTE, startu nie ma bez nich** |
| E3 | Próg i przypomnienie | OCZEKUJE | — | wiersz `Lista modeli` w `USTAWIENIA.md`, jedno zdanie w hooku startu, pozycja w katalogu progów |
| E4 | Kontrola modelu, dokumenty, wydanie | OCZEKUJE | — | nazwa spoza listy w karcie etapu, `SPEC_CLAUDE_MD` / `SPEC_STATUS` / `SPEC_PROMPT_ETAPU`, nowe sprawdzenie w walidatorze; numer wydania do rozstrzygnięcia |

## Bramki manualne

- **Adresy stron dokumentacji modeli dla Claude Code i dla Cursora** · źródło: sekcja 9 planu
  (2026-09-03) · **OTWARTA** — blokuje E2
- **Czy zgoda na ruch sieciowy pada przy każdym odświeżeniu, czy raz na projekt** · źródło: sekcja 9
  planu (2026-09-03) · **OTWARTA** — blokuje E2
- **Numer wydania: 1.9.0 czy 1.8.2** · źródło: sekcja 9 planu (2026-09-03) · **OTWARTA** — przed E4
- **Nazwy modeli Cursora dla klas `balanced` i `cheap`** · źródło: E1 (2026-09-03) — z pomiaru mam
  wyłącznie `strong: Grok 4.6` (pilotaż E6), więc dwie pozycje stoją jako `<TO BE FILLED IN: …>` ·
  **OTWARTA** — nie blokuje E2, bo to właśnie ta komenda ma je uzupełniać

## Dziennik wdrożenia

- 2026-09-03 — plan utworzony po dwóch rundach wywiadu; przekazany do akceptacji. Zakres wobec
  karty odnogi rozszerzony o odświeżanie listy (komenda + próg) i o poprawkę walidatora, zawężony
  o wariant „lista wyprowadzana z plików stanu narzędzi" (odrzucony w sekcji 4).
- 2026-09-03 — plan **ZAAKCEPTOWANY z Aneksem A**: oba adaptery prowizjonują do `.claude/relai/`
  (FAKT sprawdzony przy generowaniu promptu E1), więc listy rozróżnia **nazwa pliku**
  (`MODELE-claude-code.md`, `MODELE-cursor.md`), a która obowiązuje — mówi hook startu.
  Wygenerowano `PROMPT_ETAP_1.md`.
- 2026-09-03 — E1 rozpoczęty
- 2026-09-03 — E1 **ZREALIZOWANY**: `MODELE.md` w obu adapterach, `provisionModelList()` w rdzeniu
  (kopia trwała), zdanie o liście w obu hookach startu, nazwy zamiast klas w Kroku 3 skilla
  `relai-planning`, deklaracja `models` w `MANIFEST.json`. Weryfikacja 9/9; dwa instrumenty,
  12/12 i 7/7 zdanych. Nowa bramka: kompletna lista modeli Cursora (`balanced`, `cheap`).
