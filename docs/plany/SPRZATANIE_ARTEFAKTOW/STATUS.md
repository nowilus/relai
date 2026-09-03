# STATUS — plan SPRZATANIE_ARTEFAKTOW

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-03 · Status planu: **ZAAKCEPTOWANY 2026-09-03** · Model
wykonawczy etapów: Opus (D-85; z ustawień projektu — architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Komenda `/relai-clean` i narzędzie rdzenia | **ZREALIZOWANY 2026-09-03** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 15 z 16 punktów weryfikacji przeszło; raport na PolyFlow niewykonany (brak dostępu w sesji) — bramka manualna niżej |
| E2 | Start sesji mówi, rytuał zamknięcia sprząta | **ZREALIZOWANY 2026-09-03** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `session-signals.js` + oba hooki, wiersz `Artefakty robocze`, krok 2a rytuału, linia fraz sesji; próg domyślny **100 MB** zaakceptowany 2026-09-03 |
| E3 | Prewencja w etapach i odnogach | **ZREALIZOWANY 2026-09-03** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | 10 z 11 punktów weryfikacji przeszło dosłownie; punkt „zero trafień martwej frazy w `core/templates/`" przeformułowany za zgodą właściciela — zawężony do pliku, który frazę niósł (L-0082) |
| E4 | Pomiar na realnych projektach i wydanie 1.8.0 | **GOTOWY DO STARTU** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | KOMENDY, README + ikona `clean.svg`, `relai-update.md`, ARTEFAKTY, sekwencja P-005; pomiar na RelAI i PolyFlow; **ostatni etap planu** — rytuał kończy się sekwencją zamknięcia planu (D-36) |

## Bramki manualne

- **Akceptacja planu SPRZATANIE_ARTEFAKTOW** · źródło: wpis dziennika 2026-09-03 · ROZSTRZYGNIĘTA 2026-09-03 — plan zaakceptowany bez aneksów, sekcje 1–9 zamrożone
- **Brzmienie markera „zachowaj”** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 1) · ROZSTRZYGNIĘTA 2026-09-03 — `# relai: zachowaj` / `# relai: keep` nad wzorcem w `.gitignore`, cały `.git/info/exclude` chroniony, bez gita `.claude/relai/keep`
- **Próg domyślny wiersza `Artefakty robocze`** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 2) · ROZSTRZYGNIĘTA 2026-09-03 — 100 MB
- **Limit sześciu linii raportu startu — kryterium nieosiągalne** · źródło: wpis dziennika 2026-09-03 (E2) · ROZSTRZYGNIĘTA 2026-09-03 — limit jest własnością raportu budżetu (5 z 6), nie sumy bloków; ryzyko 8 mierzy się wkładem etapu, a ten wynosi **1 linię** (13 → 14 na materiale kontrolowanym). W kodzie nic nie zmieniono
- **Ikona `clean.svg` w README** (razem z otwartą sprawą grubości kreski ikon 17–23 px) · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 3) · **OTWARTA** — potrzebna przed E4
- **PolyFlow: marker „zachowaj” dla `tools/cache/` i surowego materiału benchmarku** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 4) · **OTWARTA** — decyzja właściciela PolyFlow przy pierwszym raporcie w E4
- **Raport `/relai-clean` na PolyFlow — punkt weryfikacji E1 niewykonany** · źródło: wpis dziennika 2026-09-03 (E1) · **OTWARTA** — sesja E1 nie miała dostępu do `C:\Users\Lukasz\Desktop\PolyFlow`; punkt jest wyłącznie odczytem raportu (`tools/` nieobecne bo śledzone, `benchmark/` chronione powodem `opisane` z linią, `tools/cache/` kandydatem). Do wykonania w osobnej sesji w tamtym folderze albo z `--add-dir`, najpóźniej razem z E4

## Dziennik wdrożenia

- 2026-09-03 — plan utworzony na podstawie porządków w PolyFlow z tego samego dnia (550 MB artefaktów po zamkniętych etapach), przekazany do akceptacji.
- 2026-09-03 — plan **ZAAKCEPTOWANY** bez aneksów; sprawy 1 i 2 sekcji 9 rozstrzygnięte zgodnie z rekomendacją (marker `# relai: zachowaj`, próg 100 MB). Wygenerowano PROMPT_ETAP_1; E1 gotowy do startu.
- 2026-09-03 — **E1 ZREALIZOWANY**: `core/process/work-artifacts.js` (biblioteka + CLI, 8 eksportów), prowizjonowanie do `.claude/relai/tools/clean-work.js` (licznik hooka 31 → 32, SHA zgodne), wpis w `MANIFEST.json` przy obu adapterach, komenda `/relai-clean`, sekcja o markerze w skillu `relai-core`, dwa wiersze w `ARTEFAKTY.md`. Testy 25/25; pierwszy realny przebieg skasował 8 grup, po nim `%TEMP%` bez pozycji `relai-*`. Wersja nietknięta (1.7.0).
- 2026-09-03 — E2 rozpoczęty.
- 2026-09-03 — **E2 ZREALIZOWANY**: `artefaktyRobocze` / `artefaktyRoboczeReport` w `session-signals.js` (cienka warstwa nad narzędziem z E1, źródła `work` + `temp`, własna para wzorców przełącznika — L-0079), wywołanie w obu hookach `session-context` (artefakty na końcu raportu, po zadaniach i raportach), wiersz `Artefakty robocze | włączone · 100 MB` w `SPEC_USTAWIENIA.md` i `docs/USTAWIENIA.md`, katalog progów 17 → 18, lista nietykalnych 5 → 6, krok **2a** rytuału zamknięcia w skillu i regule Cursora, linia fraz sesji w `SPEC_CLAUDE_MD.md` i `CLAUDE.md`, cztery podbicia w `ARTEFAKTY.md`. Testy 29/29. Czas: **116 ms** na katalogu 30 MB / 3 000 plików przy celu < 300 ms. Punkt „6 linii raportu startu" nie przeszedł dosłownie (14 linii, wkład etapu **1**) — właściciel przyjął i przeformułował. Sprzątanie: 141,2 MB → 0. Wersja nietknięta (1.7.0).
- 2026-09-03 — E3 rozpoczęty.
- 2026-09-03 — **E3 ZREALIZOWANY**: katalog roboczy nazwany z góry w sześciu nośnikach — `SPEC_PROMPT_ETAPU.md` (sekcja 7 otwiera się ścieżką, martwy punkt weryfikacji zastąpiony dwuczęściowym, przykład przepisany), `SPEC_ODNOGA.md` (sekcja 7 + krok `2a` rytuału zamknięcia odnogi, oba przykłady), skill `relai-planning` (elementy 7 i 8 układu promptu + krok `1a` rytuału „Na koniec"), reguła `relai-planning.mdc` (to samo po angielsku + karta potwierdzenia), `/relai-stage` (Krok 4) i `/relai-branch` (Krok 6). Kodu nie tknięto. Sześć podbić w `ARTEFAKTY.md`. Numeracje nietknięte: dziewięć sekcji specyfikacji i sześć punktów rytuału identyczne z HEAD, pięć plików niosących „krok 2" bez zmian. `PROMPT_ETAP_4.md` — pierwszy prompt wygenerowany po zmianie — niesie katalog roboczy w zakresie i w weryfikacji. Wersja nietknięta (1.7.0).
