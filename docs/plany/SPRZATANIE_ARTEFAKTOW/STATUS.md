# STATUS — plan SPRZATANIE_ARTEFAKTOW

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-03 · Status planu: **ZAAKCEPTOWANY 2026-09-03** · Model
wykonawczy etapów: Opus (D-85; z ustawień projektu — architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Komenda `/relai-clean` i narzędzie rdzenia | **ZREALIZOWANY 2026-09-03** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 15 z 16 punktów weryfikacji przeszło; raport na PolyFlow niewykonany (brak dostępu w sesji) — bramka manualna niżej |
| E2 | Start sesji mówi, rytuał zamknięcia sprząta | **GOTOWY DO STARTU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `session-signals.js` + oba hooki, wiersz `Artefakty robocze`, krok 2a rytuału, linia fraz sesji; próg domyślny **100 MB** zaakceptowany 2026-09-03 |
| E3 | Prewencja w etapach i odnogach | OCZEKUJE | — | `SPEC_PROMPT_ETAPU.md` (linie 129 i 255 przestają być martwe), `SPEC_ODNOGA.md`, skill i reguła planowania, `/relai-stage`, `/relai-branch` |
| E4 | Pomiar na realnych projektach i wydanie 1.8.0 | OCZEKUJE | — | KOMENDY, README + ikona `clean.svg`, `relai-update.md`, ARTEFAKTY, sekwencja P-005; pomiar na RelAI i PolyFlow; **ostatni etap planu** |

## Bramki manualne

- **Akceptacja planu SPRZATANIE_ARTEFAKTOW** · źródło: wpis dziennika 2026-09-03 · ROZSTRZYGNIĘTA 2026-09-03 — plan zaakceptowany bez aneksów, sekcje 1–9 zamrożone
- **Brzmienie markera „zachowaj”** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 1) · ROZSTRZYGNIĘTA 2026-09-03 — `# relai: zachowaj` / `# relai: keep` nad wzorcem w `.gitignore`, cały `.git/info/exclude` chroniony, bez gita `.claude/relai/keep`
- **Próg domyślny wiersza `Artefakty robocze`** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 2) · ROZSTRZYGNIĘTA 2026-09-03 — 100 MB
- **Ikona `clean.svg` w README** (razem z otwartą sprawą grubości kreski ikon 17–23 px) · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 3) · **OTWARTA** — potrzebna przed E4
- **PolyFlow: marker „zachowaj” dla `tools/cache/` i surowego materiału benchmarku** · źródło: wpis dziennika 2026-09-03 (sekcja 9 planu, sprawa 4) · **OTWARTA** — decyzja właściciela PolyFlow przy pierwszym raporcie w E4
- **Raport `/relai-clean` na PolyFlow — punkt weryfikacji E1 niewykonany** · źródło: wpis dziennika 2026-09-03 (E1) · **OTWARTA** — sesja E1 nie miała dostępu do `C:\Users\Lukasz\Desktop\PolyFlow`; punkt jest wyłącznie odczytem raportu (`tools/` nieobecne bo śledzone, `benchmark/` chronione powodem `opisane` z linią, `tools/cache/` kandydatem). Do wykonania w osobnej sesji w tamtym folderze albo z `--add-dir`, najpóźniej razem z E4

## Dziennik wdrożenia

- 2026-09-03 — plan utworzony na podstawie porządków w PolyFlow z tego samego dnia (550 MB artefaktów po zamkniętych etapach), przekazany do akceptacji.
- 2026-09-03 — plan **ZAAKCEPTOWANY** bez aneksów; sprawy 1 i 2 sekcji 9 rozstrzygnięte zgodnie z rekomendacją (marker `# relai: zachowaj`, próg 100 MB). Wygenerowano PROMPT_ETAP_1; E1 gotowy do startu.
- 2026-09-03 — **E1 ZREALIZOWANY**: `core/process/work-artifacts.js` (biblioteka + CLI, 8 eksportów), prowizjonowanie do `.claude/relai/tools/clean-work.js` (licznik hooka 31 → 32, SHA zgodne), wpis w `MANIFEST.json` przy obu adapterach, komenda `/relai-clean`, sekcja o markerze w skillu `relai-core`, dwa wiersze w `ARTEFAKTY.md`. Testy 25/25; pierwszy realny przebieg skasował 8 grup, po nim `%TEMP%` bez pozycji `relai-*`. Wersja nietknięta (1.7.0).
