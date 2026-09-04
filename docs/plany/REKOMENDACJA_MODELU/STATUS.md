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
| E2 | Komenda `/relai-models` | **ZREALIZOWANY 2026-09-04** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `relai-models.md` (12. komenda), zgoda na sieć każdorazowa, różnica przed zapisem; **Aneks B** — wynik odświeżenia przeniesiony do obu `MODELE.md`, aliasy i klasy Cursora domknięte |
| E3 | Próg i przypomnienie | **GOTOWY DO STARTU** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | wiersz `Lista modeli` w `USTAWIENIA.md`, jedno zdanie w hooku startu, pozycja w katalogu progów |
| E4 | Kontrola modelu, dokumenty, wydanie | OCZEKUJE | — | nazwa spoza listy w karcie etapu, `SPEC_CLAUDE_MD` / `SPEC_STATUS` / `SPEC_PROMPT_ETAPU`, nowe sprawdzenie w walidatorze; numer wydania do rozstrzygnięcia |

## Bramki manualne

- **Adresy stron dokumentacji modeli dla Claude Code i dla Cursora** · źródło: sekcja 9 planu
  (2026-09-03) · **ROZSTRZYGNIĘTA 2026-09-04 — pięć adresów wskazanych przez człowieka, wszystkie
  sprawdzone odczytem tego samego dnia.** Claude Code, w kolejności użycia:
  1. `https://code.claude.com/docs/en/model-config` — **główne**; tabela aliasów (`opus`, `sonnet`,
     `haiku`, `fable`, `best`, `opusplan`, `sonnet[1m]`, `opus[1m]`) i tabela poziomów `effort`.
     To jest warstwa, którą użytkownik realnie przełącza model w Claude Code.
  2. `https://support.claude.com/en/articles/11940350-claude-code-model-configuration` — lista
     modeli wspieranych przez Claude Code z pełnymi ID (`claude-opus-5`, `claude-fable-5-1`,
     `claude-sonnet-5`, `claude-haiku-4-5-20251001`…). Nośnik: **lista punktowa, nie tabela**;
     strona podaje „Updated this week" bez konkretnej daty.
  3. `https://platform.claude.com/docs/en/api/models/list` — **źródło opcjonalne**: `GET
     /v1/models` zwraca listę maszynowo (`id`, `display_name`, `created_at`, `capabilities`), ale
     **wymaga nagłówka `X-Api-Key`**. Używane wyłącznie wtedy, gdy klucz jest w `.env`; wartości
     klucza komenda nie zapisuje nigdzie (D-42).

  Cursor: `https://cursor.com/docs/models-and-pricing` — **główne**, dwie parsowalne tabele („Cursor
  Models": Grok 4.6/4.5, Composer 2.5, każdy też w wariancie Fast; „Other Models": ~40 pozycji od
  Anthropic, OpenAI, Google, Moonshot, Z.ai). Uzupełniająco
  `https://cursor.com/help/models-and-usage/available-models` — modele w prozie, przydatne dla
  **opisu** klas, nie dla nazw; sama strona odsyła do tabeli. **Żadna ze stron Cursora nie ma daty
  aktualizacji** — `list-date` będzie datą odczytu, nie datą źródła, i tak ma być opisane w liście.

  **Pułapka do przepisania:** `https://docs.claude.com/en/docs/about-claude/models/overview` oddaje
  **302** na `platform.claude.com`; adres źródłowy w liście ma być docelowy, nie przekierowujący.
- **Czy zgoda na ruch sieciowy pada przy każdym odświeżeniu, czy raz na projekt** · źródło: sekcja 9
  planu (2026-09-03) · **ROZSTRZYGNIĘTA 2026-09-04 — zgoda pada KAŻDORAZOWO.** Decyzja człowieka.
  Skutek dla E2: **nie powstaje** wiersz zgody w `docs/USTAWIENIA.md` ani osobny wyłącznik, a każde
  wywołanie `/relai-models` pyta o zgodę na ruch sieciowy przed pierwszym połączeniem. Zapamiętanie
  zgody na projekt jest **zakazane**.
- **Numer wydania: 1.9.0 czy 1.8.2** · źródło: sekcja 9 planu (2026-09-03) · **OTWARTA** — przed E4
- **Czy pomiar wykonany przez sesję etapu domyka dwa punkty weryfikacji E2** — „oba wywołania pytają
  o zgodę" i „fraza w `KOMENDY.md` w brzmieniu realnie uruchomionym" · źródło: E2 (2026-09-04),
  `claude -p` zwrócił `Failed to authenticate: OAuth session expired and could not be refreshed`,
  a `.env` z kluczem nie istnieje · **OTWARTA** — domknięcie wymaga `claude /login` albo klucza
  w `.env`; nie blokuje E3
- **Nazwy modeli Cursora dla klas `balanced` i `cheap`** · źródło: E1 (2026-09-03) — z pomiaru mam
  wyłącznie `strong: Grok 4.6` (pilotaż E6), więc dwie pozycje stały jako `<TO BE FILLED IN: …>` ·
  **ROZSTRZYGNIĘTA 2026-09-04 — człowiek wskazał `balanced: Composer 2.5` i `cheap: Auto`** po
  pokazaniu kandydatów pogrupowanych po dostawcy (~45 pozycji, pięciu dostawców, odczyt
  `cursor.com/docs/models-and-pricing` z tego samego dnia). Obie pozycje niosą w polu `source`
  adnotację `named by the human` z datą; `cheap: Auto` ma `id: -`, bo za trybem automatycznym stoi
  zmienny model, nie stały identyfikator. Zapisane w `adapters/cursor/MODELE.md` (Aneks B)

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
- 2026-09-04 — **obie bramki wejściowe E2 rozstrzygnięte przez człowieka**: pięć adresów źródeł
  (trzy dla Claude Code, dwa dla Cursora), wszystkie sprawdzone odczytem tego samego dnia, oraz
  zgoda na ruch sieciowy **każdorazowa**. Przy okazji rozstrzygnięty sposób sprowadzania listy
  Cursora do trzech klas: komenda **pokazuje kandydatów i pyta**, nie typuje sama. `PROMPT_ETAP_2.md`
  zaktualizowany — warunek startu zdjęty, rozstrzygnięcia wpisane w „Decyzje już podjęte".
- 2026-09-04 — E2 rozpoczęty
- 2026-09-04 — E2 **ZREALIZOWANY**: `adapters/claude-code/commands/relai-models.md` (11 → 12
  komend), wiersz w `KOMENDY.md` i w tabeli `README.md` (kolumna ikony pusta — dwunastej ikony
  świadomie nie rysowano). Weryfikacja 12/12, cztery przebiegi na dwóch projektach kontrolnych.
  **Aneks B (2026-09-04)** rozszerzył zakres o jednorazowe przeniesienie wyniku odświeżenia do
  `adapters/claude-code/MODELE.md` (aliasy `opus`/`fable`/`sonnet`/`haiku`) i
  `adapters/cursor/MODELE.md` (`balanced: Composer 2.5`, `cheap: Auto`) — bramka „nazwy modeli
  Cursora" zamknięta. Ograniczenie pomiaru: procedurę komendy wykonała sesja etapu, nie świeża
  sesja CLI — `claude -p` odmówił uwierzytelnienia (wygasła sesja OAuth).
