# STATUS — plan HUMANIZACJA

[PLAN.html](PLAN.html) · utworzony 2026-10-14 · **ZAAKCEPTOWANY 2026-10-14** (z Aneksem A; Aneksy B i C 2026-10-14 przy E5) · model wykonawczy etapów: **Opus 5.5** w świeżych sesjach (autor planu: Opus 5.5, D-84 po aneksie 2026-10-14) · sugerowany effort: high dla E1–E3 i E5, medium dla E4

**Kolejność:** równolegle z PANEL_CODEX (decyzja Łukasza 2026-10-14) — PANEL_CODEX idzie w Codeksie,
HUMANIZACJA w Claude Code. Wspólny punkt to `core/panel/` (E1 rejestracja minimalna, E4) i wydania:
wydania po kolei, nigdy dwa naraz.

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Komenda na żądanie | ZREALIZOWANY 2026-10-14 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | świeża sesja; effort high; z rejestracją minimalną w panelu i generatorze Codeksa (Aneks A6) |
| E2 | Wywiad i ustawienia | ZREALIZOWANY 2026-10-14 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | dwa okna pytań, ton per rodzaj tekstu, profil stylu z logów PolyFlow (Aneks A1–A5) |
| E3 | Tryb ciągły | ZREALIZOWANY 2026-10-14 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | hook `humanize-continuous` (`UserPromptSubmit` + `PostToolUse`), `SKROT.md`; wiersz „Humanizacja” w tym repo wyłączony decyzją Łukasza |
| E4 | Panel i trzy narzędzia | ZREALIZOWANY 2026-10-14 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | formularz z trybami `on` / `off` / `ustawienia`, zakładka komend 885 px (decyzja: „Polecane teraz” bez odstępów), 15 komend w dokumentach, nota MIT w walidatorze |
| E5 | Pomiar i wydanie 3.1.0 | W TOKU | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | wymaga zgody na publikację; effort high |

## Odnogi

- **FILM_TESTY_V3** — testy faktów i pasków filmu 3.0.0 liczą dane z worktree `v3.0.0`, nie z bieżącego repo · źródło: E1 · [karta](odnogi/FILM_TESTY_V3/ODNOGA.md) · **OTWARTA**

## Bramki manualne

- **Akceptacja planu HUMANIZACJA** · źródło: przygotowanie planu 2026-10-14 · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „Akceptuję plan, aktywny HUMANIZACJA”**
- **Próbka głosu w repozytorium czy lokalnie** · źródło: sekcja 9 PLAN.html · **ROZSTRZYGNIĘTA 2026-10-14 — Aneks A3: profil stylu globalnie w `~/.claude/relai/STYL.md`, poza repozytorium**
- **Rzut oka na ikonę i wiersz „Humanizacja tekstu” w panelu** · źródło: wpis dziennika E1 2026-10-14 · **OTWARTA** — po najbliższej instalacji panelu z repo, najpóźniej przy E5 (w E4 panel nie był instalowany z repo; od E4 także formularz z trybami `on` / `off` / `ustawienia`)
- **Zgoda na publikację wydania 3.1.0** · źródło: sekcja 9 PLAN.html · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „Tak, po szkicu”** (publikacja po drugim „tak” po obejrzeniu szkicu notatek wydania)
- **Czy tryb ciągły „dokumenty” ma poprawiać także tekst, który polecenie każe wpisać dosłownie?** (w pomiarze E3 model w trybie `notka` przeredagował podyktowany akapit i powiedział o tym; dziś reguła obejmuje całą prozę pliku) · źródło: wpis dziennika E3 2026-10-14 · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „Nie, dosłowny zostaje”; wprowadzenie: „Aneks B, poprawka w E5”** ([Aneks B](PLAN.html#s10))
- **Numery pluginów panelu w wydaniu 3.1.0** · źródło: PROMPT_ETAP_5, punkt 1 zakresu · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „0.16.0 / 0.4.1 / 0.7.1”** (`relai-panel` 0.16.0, `relai-progress` 0.4.1, `relai-cache-keeper` 0.7.1)
- **Wiersz „Humanizacja” w `docs/USTAWIENIA.md` zostaje przed E3?** (`włączona · zakresy: czat` z przebiegu interaktywnego; od E3 odpowiedzi w czacie tego projektu będą humanizowane same) · źródło: wpis dziennika E2 2026-10-14 · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „Wyłączyć”** (wiersz przełączony na `wyłączona`, zakresy zachowane; tryb ciągły mierzony w `-p` na fixturach)

## Dziennik wdrożenia

- 2026-10-14 — Plan przygotowany po wywiadzie z Łukaszem (dwie rundy pytań): własna baza reguł z nakładką PL (wariant A), wywiad przy pierwszym `/relai-humanize`, zakresy trybu ciągłego wybiera użytkownik (dokumenty, czat, teksty na zewnątrz), sposób pokazywania do wyboru w wywiadzie, czat zawsze bez akceptacji, próbka głosu opcjonalna, praca równoległa z PANEL_CODEX. Czeka na akceptację.
- 2026-10-14 — Plan zaakceptowany i zamrożony z Aneksem A (ton zależny od rodzaju tekstu; profil stylu autora zamiast surowej próbki, opcjonalny, globalny, pierwszy z logów PolyFlow; wywiad w dwóch oknach; rejestracja minimalna komendy już w E1). Wygenerowano PROMPT_ETAP_1, E1 GOTOWY DO STARTU.
- 2026-10-14 — E1 rozpoczęty (Opus 5.5, zgoda w czacie).
- 2026-10-14 — E1 zrealizowany: `core/humanize/` (26 wzorców, nakładka PL, nota MIT), strażnik faktów (pliki i stdin), `/relai-humanize` z rejestracją w panelu i Codeksie (15 komend); 356 testów rdzenia, plugin test 178/31/178; pomiar 17 świeżymi sesjami; recenzja kodu (1 HIGH, 4 MEDIUM) poprawiona w etapie; tymczasowo 925 px w teście zakładki komend (powrót do 900 px w E4); odnoga FILM_TESTY_V3. E2 GOTOWY DO STARTU.
- 2026-10-14 — E2 rozpoczęty (Opus 5.5, zgoda w czacie).
- 2026-10-14 — E2 zrealizowany: `core/process/humanize-mode.js` (trzy warstwy, CLI `odczyt` / `zapisz` / `przelacz` / `profil`), `/relai-humanize` v2 z wywiadem w dwóch oknach i `on` / `off` / `ustawienia`, `core/humanize/PROFIL_STYLU.md`, wiersz w `SPEC_USTAWIENIA.md`; profil `~/.claude/relai/STYL.md` z logów PolyFlow; 384 testy rdzenia; przebieg `-p` i interaktywny z Łukaszem; recenzja (5 MEDIUM, 7 LOW) poprawiona w etapie; L-0187, L-0188. E3 GOTOWY DO STARTU.
- 2026-10-14 — E3 rozpoczęty (Opus 5.5, zgoda w czacie; bramka wiersza „Humanizacja” rozstrzygnięta: wyłączyć).
- 2026-10-14 — E3 zrealizowany: `core/process/humanize-continuous.js` i hook `humanize-continuous` (reguła przed odpowiedzią 349–549 B, reguła po zapisie dokumentu raz na plik w turze, wyłączenia H3 w hooku, tylko `.md`/`.txt`), `core/humanize/SKROT.md` (5 271 B), `SPEC_USTAWIENIA.md` v15; 402 testy rdzenia; sześć sesji `-p` (H2 10/10 bajt w bajt, H6 kolejność reguł); recenzja (1 HIGH, 3 MEDIUM, 2 LOW) poprawiona w etapie; L-0189. E4 GOTOWY DO STARTU.
- 2026-10-14 — E4 rozpoczęty (Opus 5.5, zgoda w czacie; `core/panel/` bez zmian PANEL_CODEX w drzewie roboczym).
- 2026-10-14 — E4 zrealizowany: formularz `relai-humanize` z trybami i `argument-hint` komendy v3 (test trybów wobec Kroku 0a); zakładka komend 925 → 885 px (decyzja Łukasza: „Polecane teraz” z odstępami jak grupy), test na 900 px; 15 komend w README, PRZEWODNIK, INSTALACJA, STATE, README Cursora i opisie `relai-panel`; wiersz w `KOMENDY.md`, `SPEC_KOMENDY.md` v11; walidator, punkt 13: nota MIT (4 pliki, kontrola na czterech podłożonych defektach); 403 testy rdzenia, plugin test 178/31/178; recenzja APPROVE. E5 GOTOWY DO STARTU.
- 2026-10-14 — E5 rozpoczęty (Opus 5.5, zgoda w czacie: „zaczynamy, rotacja na koniec”; stan plików PANEL_CODEX zapisany przed etapem).
