# Przegląd RelAI względem wytycznych Anthropic i OpenAI (2026-11)

Gałąź `refactor/2026-11-relai`, baza: main @ a512efe.

## 1. Zakres

- Audyt tylko do odczytu, potem poprawki wyłącznie w tym worktree.
- Obszary: `adapters/claude-code`, `adapters/codex`, `adapters/cursor`, hooki, komendy, skille, agenci, instalatory, budżet kontekstu na starcie sesji.
- Nie dodano zależności, nie usunięto plików, nie zmieniono schematów danych.
- Poprawiono tylko to, co jest wyraźną niezgodnością z dokumentacją i jest małe oraz bezpieczne. W audycie nie było ustaleń CRITICAL ani HIGH.

## 2. Źródła (tylko oficjalne)

- https://code.claude.com/docs/en/memory
- https://code.claude.com/docs/en/plugins-reference
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/best-practices
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/plugin-marketplaces
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- https://learn.chatgpt.com/docs/hooks
- https://learn.chatgpt.com/docs/build-skills
- https://learn.chatgpt.com/docs/agent-configuration/agents-md

W tej sesji ponownie pobrałem tylko stronę `memory` (potwierdzenie F03). Pozostałe adresy pochodzą z audytu wejściowego i nie były tu weryfikowane drugi raz. Strona learn.chatgpt.com to domena OpenAI podana w audycie; nie weryfikowałem jej niezależnie z developers.openai.com.

Uzupełnienie 2026-11-09 (sesja nadrzędna przeglądu): oficjalne adresy dokumentacji Codexa przekierowują na tę domenę na
stałe — `https://developers.openai.com/codex/skills` → `308 Permanent Redirect` → `https://learn.chatgpt.com/docs/build-skills`,
`https://developers.openai.com/codex/hooks` → 308 → `https://learn.chatgpt.com/docs/hooks`,
`https://developers.openai.com/codex/guides/agents-md` → 308 → `https://learn.chatgpt.com/docs/agent-configuration/agents-md`
(nagłówek `Location` z odpowiedzi serwera). learn.chatgpt.com jest więc obecnym miejscem oficjalnej dokumentacji OpenAI
dla Codexa. Treści tych stron w tej weryfikacji nie pobierałam ponownie.

## 3. Ustalenia

| ID | Waga | Status |
|---|---|---|
| F01 hooki Codeksa w `hooks/hooks.json` (ładują się też w Claude Code) | MEDIUM | do decyzji autora (wymaga próby w Codeksie) |
| F02 brak `commandWindows` w trzech hookach Codeksa | MEDIUM | do decyzji autora (nie wiem, czy Codex podstawia ścieżkę) |
| F03 `CLAUDE.md` z instalatora nie importuje `AGENTS.md` | MEDIUM | poprawione w 1db1bb6 |
| F04 dwie ręcznie synchronizowane kopie instrukcji | LOW | do decyzji autora |
| F05 16 komend w `commands/` zamiast `skills/` | LOW | do decyzji autora |
| F06 brak `disable-model-invocation` w stage, security, models, branch | LOW | do decyzji autora (zmienia zachowanie wywołań) |
| F07 hook SessionEnd Codeksa zwraca kontekst bez efektu | LOW | bez zmian |
| F08 skille Codeksa nakazują `AskUserQuestion` | MEDIUM | do decyzji autora (nie wiem, jaki jest odpowiednik w Codeksie) |
| F09 opisy skilli Codeksa blisko budżetu listy (8 083 znaków) | LOW | do decyzji autora |
| F10 brak spisu treści w trzech plikach ponad 100 linii | LOW | bez zmian |
| F11 `docs/PULAPKI.md` 105,9 KB bez rotacji | MEDIUM | do decyzji autora (zmiana procesu) |
| F12 przekroczone własne progi LEKCJE, USTAWIENIA, ryzyka | LOW | bez zmian (znane autorowi) |
| F13 plugin ze źródłem w korzeniu repo (ok. 117 MB) | MEDIUM | do decyzji autora (najpierw pomiar cache) |
| F14 siedem hooków Node na Write i Edit | INFO | bez zmian |
| F15 metadane skilli, agentów i komend zgodne z wytycznymi | INFO | bez zmian |
| F16 reguła Cursor 305 linii z `alwaysApply` | INFO | nie wiem (poza dozwolonymi źródłami) |

### F03, szczegóły

- Dokumentacja (https://code.claude.com/docs/en/memory, sekcja "AGENTS.md"): gdy w projekcie jest `AGENTS.md` i `CLAUDE.md`, Claude czyta tylko `CLAUDE.md`. Sam tekst "Read AGENTS.md" nie ładuje pliku.
- Zalecenie ze strony: linia `@AGENTS.md` w `CLAUDE.md` (sekcja "Share one file with other coding tools").
- Zmiana: `claudePointer()` w `adapters/codex/install.js` i `adapters/cursor/install.js` zwraca teraz tekst zaczynający się od `@AGENTS.md`. Test `adapters/codex/tests/install.test.js` sprawdza tę linię.
- Odinstalowanie bez zmian: sumy kontrolne liczone są z zapisanego tekstu, więc `uninstall` działa tak samo. Projekty zainstalowane wcześniej zachowują stary pointer do czasu ponownej instalacji.

## 4. Zmierzony budżet kontekstu na starcie sesji

| Warstwa | Bajty |
|---|---|
| `CLAUDE.md` (78 linii) | 6 671 |
| Wstrzyknięcie hooka SessionStart | 4 451 |
| Lista skilli, komend i agentów (24 pozycje) | 8 856 |
| Skrót startu `start-digest.js` (289 linii) | 26 633 |
| **Suma stała** | **ok. 46,6 KB** |

- Szacunek: 13–16 tys. tokenów przy 3–3,5 B/token. To szacunek, nie pomiar.
- Nie wliczono promptu systemowego ani schematów narzędzi.
- Budżet autora: start 55 KB (`docs/USTAWIENIA.md:25`). Wynik się mieści.
- Na żądanie dochodzą: `relai-core/SKILL.md` 15 558 B, `relai-planning/SKILL.md` 13 218 B, `history.md` 25 356 B.
- Duże dokumenty (streszczane, nie ładowane w całości): DZIENNIK 147 699 B, PULAPKI 105 888 B, LEKCJE 69 739 B, DECYZJE 26 830 B, STATE 21 572 B.
- Codex: ten sam skrót 26,6 KB; zainstalowany `AGENTS.md` ok. 0,6 KB (limit 32 KiB).

## 5. Rekomendacje: dokumenty i kontekst

1. Jedno źródło instrukcji: `AGENTS.md`, a w `CLAUDE.md` import `@AGENTS.md` (F03 wdrożone w instalatorach, F04 otwarte). https://code.claude.com/docs/en/memory
2. Instrukcje obecne zawsze trzymać poniżej 200 linii; reguły dla części repo do `.claude/rules/*.md` z `paths:`. https://code.claude.com/docs/en/memory
3. Ciężką treść zostawiać w skillach i plikach doczytywanych na żądanie; w kontekście sam opis. https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices i https://learn.chatgpt.com/docs/build-skills
4. Twarde reguły przenosić do hooków PreToolUse, bo CLAUDE.md jest kontekstem, nie wymuszeniem. https://code.claude.com/docs/en/memory
5. Skrót startu 26,6 KB skracać zamiast rozbudowywać; dodać rotację PULAPKI (F11). https://code.claude.com/docs/en/best-practices
6. Wyniki hooków mieścić w limitach (10 000 znaków dla `additionalContext` w Claude Code; Codex ma własny limit). https://code.claude.com/docs/en/hooks i https://learn.chatgpt.com/docs/hooks
7. Używać `/clear` między niezwiązanymi zadaniami i `/compact` z celem. https://code.claude.com/docs/en/best-practices
8. Lista skilli Codeksa: 8 083 znaków wobec budżetu ok. 2% okna (8000 znaków przy nieznanym oknie); skrócić najdłuższe opisy albo ustawić `skills.max_context_tokens`. https://learn.chatgpt.com/docs/build-skills
9. Pliki pomocnicze skilli jeden poziom od `SKILL.md`, spis treści przy plikach ponad 100 linii (F10). https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

## 6. Testy przed i po

Uruchamiane przez `node --test` na globach (sam katalog kończy się błędem na Node v24.13.1).

| Zestaw | Przed | Po |
|---|---|---|
| `adapters/codex/tests` | 24 / 23 zal. / 1 błąd | 24 / 23 / 1 |
| `core/guardrails/tests` | 19 / 19 / 0 | 19 / 19 / 0 |
| `core/process/tests` | 357 / 355 / 2 | 357 / 355 / 2 |
| `core/panel/tests` | 225 / 225 / 0 | 225 / 225 / 0 |
| `node core/tools/validate-adapters.js` | kod 0 | kod 0 |

- Błędy (3 łącznie) to ta sama asercja `HIGH 16`, a żywa baza podatności Trivy zwraca teraz `HIGH 17`. To dryf danych zewnętrznych, nie skutek zmian. Test warto oprzeć na stałej bazie albo poluzować.
- Po zmianie nie uruchamiałem ponownie: `site/**/*.test.mjs` (396, wszystkie zaliczone przed zmianą) i `security-audit/*.test.cjs` (2 x 65; 7 błędów i 12 pominiętych z powodu braku ochrony no-follow na Windows). Zmiana ich nie dotyka.
- Testy modów (`panel/hooks`, `cache-keeper/hooks`, `mods/hooks`, `progress/hooks`, 39) nie uruchamiają się poza hostem modów (`Cannot find package 'claude-code'`). Nie wiem, jak je odpalić samodzielnie.

## 7. Do decyzji autora

- F01 i F02: przeniesienie hooków Codeksa do `adapters/codex/hooks/hooks.json` ze wskazaniem w `.codex-plugin/plugin.json`, oraz `commandWindows`. Wymaga próby w Codeksie na Windows.
- F04 i F05: jeden `AGENTS.md` jako źródło; migracja komend na skille.
- F06: dodać `disable-model-invocation: true` do komend z efektami ubocznymi.
- F08: zastąpić `AskUserQuestion` w skillach Codeksa (zmiana w `generate-skills.js` i regeneracja), po sprawdzeniu zachowania Codeksa.
- F09: skrócić opisy skilli Codeksa.
- F11: rotacja `docs/PULAPKI.md` (zmiana procesu).
- F13: pomiar rozmiaru zainstalowanego cache, potem ewentualnie podkatalog lub `git-subdir`.
- Test `HIGH 16`: oprzeć na stałej bazie lub zluzować.
- Atrybucja commitów: zadanie wskazywało "Claude Opus 5.5", a środowisko wymusza "Claude Sonnet 5.5"; użyto drugiej.
