# Przejęcie — PANEL_CLAUDE → PANEL_CODEX

To bramka E1 PANEL_CODEX, do wykonania dopiero po pełnym zamknięciu poprzednika.
Nie zmienia zakresu ani statusu PANEL_CLAUDE.

- [ ] Sprawdzono ZREALIZOWANY z datą w STATUS.md poprzednika (w plany/ albo archiwum/plany/).
- [ ] Rozstrzygnięcia bramek i odnóg poprzednika nie zostawiają zależności wymaganej przez Codeksa.
- [ ] PANEL_CODEX zaakceptowany; aneks D-80 obejmuje adapter Codeksa.
- [ ] Odnotowano commit/wydanie, kontrakt i testy ukończonego core/panel, cennika oraz pomiarów.
- [ ] Sprawdzono aktualne schematy: pochodzenie licznika, uczestnik, wywołanie, model, tokeny, ceny i przypisanie.
- [ ] Normalizacja Codeksa uzgodniona z kontraktem; wejście OpenAI nie dostaje ponownie doliczonego cache.
- [ ] Profil retencji Codeksa oddzielony od heurystyki Claude; nieznany TTL nazwany prognozą.
- [ ] Pakowanie/kopie rdzenia wskazują jedno źródło; brak importowania hooków Claude Mods przez gospodarza Codex.
- [ ] Testy przejętego rdzenia mają znany wynik przed zmianami; zachowanie panelu Claude ma punkt porównania.
- [ ] Linki po archiwizacji poprzednika aktualne; stan, aktywny plan i STATUS uzgodnione.
- [ ] Prompt E1 opisuje wynik poprzednika faktycznie istniejący przy przejęciu; nie stan z chwili pisania planu.

Materiały: PLAN.html i STATUS.md w tym folderze; docs/zasoby/PANEL_RELAI/WYWIAD.md;
STATUS i wpis zamknięcia PANEL_CLAUDE; core/panel/ oraz jego testy i kontrakty po zamknięciu.

Gdy warunek nie przechodzi, E1 pozostaje OCZEKUJE. Zmiana kolejności wymaga jawnej decyzji
człowieka i datowanego aneksu; komunikat „uruchom mimo to” nie jest cichym pominięciem zależności.

RelAI (gpt-6.1-sol) + Lukasz · 2026-10-08
