# STATUS — plan PANEL_CODEX

[PLAN.html](PLAN.html) · utworzony 2026-10-08 · **ZAAKCEPTOWANY 2026-10-10** · **WSTRZYMANY 2026-10-27 — decyzja Łukasza: plan nieaktywny, aktywny jest [ZASIEG_PLUGINU](../ZASIEG_PLUGINU/STATUS.md); wznowienie tylko jego decyzją** · model wykonawczy etapów: **gpt-6.1-sol w Codeksie** (wybór użytkownika 2026-10-08; także autor planu)

**Kolejność:** po pełnym zamknięciu planu [PANEL_CLAUDE](../../archiwum/plany/PANEL_CLAUDE/STATUS.md) — zamknięty 2026-10-10.
Akceptacja PANEL_CODEX nie omija tej zależności.
Przed E1: potwierdzony status poprzednika ZREALIZOWANY, przejęty wynik i kontrakt core/panel,
akceptacja PANEL_CODEX oraz rozstrzygnięcie zakresu D-80 dla adaptera Codeksa.
Żaden etap nie jest GOTOWY DO STARTU przed spełnieniem bramek. Gdy poprzednik trafia do
archiwum, jego stan sprawdzamy również w docs/archiwum/plany/PANEL_CLAUDE/STATUS.md.

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Przejęcie rdzenia i natywny panel | GOTOWY DO STARTU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | poprzednik i przejęcie sprawdzone, plan i D-80 zaakceptowane 2026-10-10; świeża sesja; effort high |
| E2 | Pomiary Codeksa i uczestników załogi | OCZEKUJE | — | zalecany effort high |
| E3 | Koszty API i profile cache | OCZEKUJE | — | zalecany effort high |
| E4 | Etap, prompt, odnoga i działania sesji | OCZEKUJE | — | zalecany effort high |
| E5 | Załoga i mapa przepływu | OCZEKUJE | — | zalecany effort high |
| E6 | Pozostałe komendy i dokumenty | OCZEKUJE | — | zalecany effort high |
| E7 | Timer i powiadomienia w tle | OCZEKUJE | — | zalecany effort high |
| E8 | Dystrybucja i odbiór całości | OCZEKUJE | — | zalecany effort high |

## Bramki manualne

- **Akceptacja PANEL_CODEX** · źródło: przygotowanie planu 2026-10-08 · **ROZSTRZYGNIĘTA 2026-10-10 — Łukasz zaakceptował uzgodniony plan (a)**
- **Aneks D-80 dla adaptera Codeksa** · źródło: sekcja 9 PLAN.html · **ROZSTRZYGNIĘTA 2026-10-10 — Łukasz zaakceptował (b), aneks zapisany w DECYZJE.md**
- **Zgoda na publikację gotowej paczki** · źródło: sekcja 9 PLAN.html · **OTWARTA** — przed wydaniem E8

## Dziennik wdrożenia

- 2026-10-08 — Plan przygotowany na podstawie pełnego WYWIAD.md; na dyspozycję człowieka oddzielony od PANEL_CLAUDE i ustawiony po jego zakończeniu. Model planowania i wykonania: gpt-6.1-sol w Codeksie. Czeka na akceptację i poprzednika.
- 2026-10-10 — Po zamknięciu PANEL_CLAUDE przygotowano [PROMPT_START.md](PROMPT_START.md) — sesja startowa w Codeksie (gpt-6.1-sol): checklist przejęcia, uzgodnienie PLAN.html z wynikiem poprzednika, akceptacja i aneks D-80, potem PROMPT_ETAP_1; E1 w osobnej sesji (decyzja człowieka).
- 2026-10-10 — Przejęcie rdzenia i testów zweryfikowane, PLAN uzgodniony z wydaniem 2.8.0; czeka na akceptację planu i aneksu D-80, E1 nadal OCZEKUJE.
- 2026-10-10 — Plan zaakceptowany i zamrożony, aneks D-80 zapisany; wygenerowano PROMPT_ETAP_1, E1 GOTOWY DO STARTU w świeżej sesji Codeksa.
- 2026-10-12 — Aneks A (zamknięcie LIMIT_CHECKPOINT, decyzja Łukasza): E3 dostaje kartę „Próg limitu” (5 h 90 %, tydzień 98 %) i kolor baterii od progu na wspólnym `core/panel/limit-threshold.mjs`; karta po turze, zapis i „Wznów” tylko przy hookach końca tury Codeksa.
- 2026-10-27 — Plan WSTRZYMANY decyzją Łukasza: nieaktywny, aktywny plan repozytorium to ZASIEG_PLUGINU. Stan E1 bez zmian (natywny widok i mostek potwierdzone, sonda 0.0.9 czeka na pomiar); praca w worktree Codeksa codex/panel-codex nietknięta. Wznowienie wymaga decyzji Łukasza i nowej linii w tym dzienniku.
