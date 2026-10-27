# STATUS — plan ZASIEG_PLUGINU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-27 · Status planu: **ZAAKCEPTOWANY 2026-10-27** · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Narzędzie relai-scope | ZREALIZOWANY 2026-10-27 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | status / apply / undo / on / off, dziennik zmian, testy |
| E2 | Adopcja, init, update | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | krok włączenia lokalnego w trzech procedurach, propozycja trybu w kroku 1a |
| E3 | Przycisk w relai-mods | OCZEKUJE | — | wiersz „RelAI w tym projekcie” w kokpicie |
| E4 | Dokumentacja i wydanie | OCZEKUJE | — | README, KOMENDY, D-92; bramka: przełączenie maszyny właściciela; `/relai-release` |

## Bramki manualne

- **Kiedy przełączyć maszynę właściciela: zaraz po E1 narzędziem z repo czy po wydaniu (PLAN sekcja 9)** · źródło: wpis dziennika 2026-10-27 (E1) · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-27 — plan utworzony po wywiadzie z właścicielem (zadanie z sesji PolyFlow-rust po `/doctor`: `relai` to 16% zużycia); czeka na akceptację.
- 2026-10-27 — plan zaakceptowany przez Łukasza bez poprawek; wygenerowany `PROMPT_ETAP_1.md` (cofnięcie klucza, którego nie było przed zmianą, = jego usunięcie wąskim zapisem JSON, nie `disable`).
- 2026-10-27 — E1 zrealizowany: `relai-scope` (status / apply / undo / on / off) z dziennikiem zmian, 17 testów, `status` na tej maszynie — 15 projektów z markerem, 74 kroki, zero zapisów; wygenerowany `PROMPT_ETAP_2.md`.
