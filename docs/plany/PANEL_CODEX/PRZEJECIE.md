# Przejęcie — PANEL_CLAUDE → PANEL_CODEX

To bramka E1 PANEL_CODEX, do wykonania dopiero po pełnym zamknięciu poprzednika.
Nie zmienia zakresu ani statusu PANEL_CLAUDE.

- [x] Sprawdzono ZREALIZOWANY z datą w STATUS.md poprzednika (w plany/ albo archiwum/plany/). Dowód 2026-10-10: `docs/archiwum/plany/PANEL_CLAUDE/STATUS.md` — `ZREALIZOWANY 2026-10-10`, 9/9 etapów, Aneksy A–E.
- [x] Rozstrzygnięcia bramek i odnóg poprzednika nie zostawiają zależności wymaganej przez Codeksa. Dowód: wszystkie bramki w STATUS poprzednika rozstrzygnięte, brak odnóg; pomiar E5 pominięty decyzją człowieka 2026-10-10, a C1/C10/C11 pozostają jawnymi ograniczeniami wyniku, bez obowiązku ich zamknięcia przed Codeksem.
- [x] PANEL_CODEX zaakceptowany; aneks D-80 obejmuje adapter Codeksa. Dowód 2026-10-10: Łukasz wybrał odpowiedź „Tak — akceptuję (a) plan i (b) aneks D-80”; STATUS ZAAKCEPTOWANY, aneks 2026-10-10 w DECYZJE.md.
- [x] Odnotowano commit/wydanie, kontrakt i testy ukończonego core/panel, cennika oraz pomiarów. Dowód: HEAD `6b502fea5135541bd50ef564a96b6a4898f1b6c5`, tag `v2.8.0` → `32851152598eebe0e15d0f831fb7642a7d03f0cb`; `gh release view` i `gh api .../releases/latest` — publiczne Latest 2.8.0 z 2026-10-09; `measure.mjs` SCHEMA=1, `pricing.mjs` tylko Anthropic, testy poniżej.
- [x] Sprawdzono aktualne schematy: pochodzenie licznika, uczestnik, wywołanie, model, tokeny, ceny i przypisanie. Dowód: 17 pól `RECORD_FIELDS` w `measure.mjs`, klucz session/turn/index/agent, stage/task w `attribution.mjs`; zapis bieżącej sesji Codeksa zawiera total_token_usage i last_token_usage z input_tokens, cached_input_tokens, cache_write_input_tokens, output_tokens i reasoning_output_tokens — stabilność i pokrycie źródła do próby E1/E2.
- [x] Normalizacja Codeksa uzgodniona z kontraktem; wejście OpenAI nie dostaje ponownie doliczonego cache. Dowód: PLAN sekcje 5 i 6 wymagają normalizacji przed agregacją do input bez cache w SCHEMA=1, tool=codex, rozróżnienia źródeł i reasoning w output; w realnym last_token_usage z tej sesji 191051 − 185856 − 0 = 5195 tokenów bez cache, output 269 obejmuje reasoning 110 (FAKT 2026-10-10); brak pola ma pozostać jawnym brakiem, mapowanie implementuje E2 po weryfikacji E1.
- [x] Profil retencji Codeksa oddzielony od heurystyki Claude; nieznany TTL nazwany prognozą. Dowód: PLAN sekcje 5–8 wskazują osobny profil w E3/E7; `cache-timer.mjs` zakłada dziś 60 min i rozpoznaje Claude 5/60 min, `pricing.mjs` mnożniki zapisu 5m/1h — Codeks ich nie dziedziczy.
- [x] Pakowanie/kopie rdzenia wskazują jedno źródło; brak importowania hooków Claude Mods przez gospodarza Codex. Dowód: `core/tools/sync-panel-core.js` ma trzy cele Claude, `--check` exit 0 dla 15 modułów i 14 ikon; `adapters/codex/panel/` nie istnieje, PLAN wybiera kopię/bundle czystego core i wyklucza API $, on, ui.render, AbovePrompt.
- [x] Testy przejętego rdzenia mają znany wynik przed zmianami; zachowanie panelu Claude ma punkt porównania. Dowód 2026-10-10: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js` — **263/263**, exit 0; `claude plugin test .` w panel/progress/cache-keeper na fizycznej binarce **2.1.293**, z `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` — **70/70, 16/16, 19/19**, exit 0; walidator exit 0.
- [x] Linki po archiwizacji poprzednika aktualne; stan, aktywny plan i STATUS uzgodnione. Dowód: PLAN i STATUS wskazują `docs/archiwum/plany/PANEL_CLAUDE/STATUS.md`; STATE, CLAUDE i AGENTS wskazują PANEL_CODEX do akceptacji, żaden etap nie rozpoczęty; nieaktualne zdania i licznik planów w STATE poprawione w tej sesji.
- [x] Prompt E1 opisuje wynik poprzednika faktycznie istniejący przy przejęciu; nie stan z chwili pisania planu. Dowód: PROMPT_ETAP_1.md wygenerowany 2026-10-10 po akceptacji, opisuje 2.8.0, 15 modułów, SCHEMA=1 i wynik 263 + 70/16/19; pełny odpis Zasad aktywnych, zakres wyłącznie E1 i link z STATUS do istniejącego pliku.

Weryfikacja: **2026-10-10, gpt-6.1-sol w Codeksie**. Wszystkie punkty przejęcia spełnione;
E1 `GOTOWY DO STARTU` w świeżej sesji, bez wykonania w sesji startowej.

Materiały: PLAN.html i STATUS.md w tym folderze; docs/zasoby/PANEL_RELAI/WYWIAD.md;
STATUS i wpis zamknięcia PANEL_CLAUDE; core/panel/ oraz jego testy i kontrakty po zamknięciu.

Gdy warunek nie przechodzi, E1 pozostaje OCZEKUJE. Zmiana kolejności wymaga jawnej decyzji
człowieka i datowanego aneksu; komunikat „uruchom mimo to” nie jest cichym pominięciem zależności.

RelAI (gpt-6.1-sol) + Lukasz · 2026-10-08
