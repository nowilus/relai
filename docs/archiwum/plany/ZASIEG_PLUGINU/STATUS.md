# STATUS — plan ZASIEG_PLUGINU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-27 · Status planu: **ZREALIZOWANY 2026-10-28** (zaakceptowany 2026-10-27) · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Narzędzie relai-scope | ZREALIZOWANY 2026-10-27 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | status / apply / undo / on / off, dziennik zmian, testy |
| E2 | Adopcja, init, update | ZREALIZOWANY 2026-10-27 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | krok włączenia lokalnego w trzech procedurach, propozycja trybu w kroku 1a |
| E3 | Przycisk w relai-mods | ZREALIZOWANY 2026-10-27 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | wiersz „RelAI w tym projekcie” w kokpicie |
| E4 | Dokumentacja i wydanie | ZREALIZOWANY 2026-10-28 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | README, KOMENDY, D-92; bramka: przełączenie maszyny właściciela; `/relai-release` |

## Bramki manualne

- **Kiedy przełączyć maszynę właściciela: zaraz po E1 narzędziem z repo czy po wydaniu (PLAN sekcja 9)** · źródło: wpis dziennika 2026-10-27 (E1) · **ROZSTRZYGNIĘTA 2026-10-28** — decyzja Łukasza: po wydaniu; `relai-scope apply` z zainstalowanego 3.6.0 → `undo` → `apply` (74 kroki, 15 projektów), pomiar świeżych sesji w RelAI i PolyFlow (kontekst startu jest) i w folderze bez RelAI (brak)
- **Wydanie 3.6.1 z poprawionym wierszem `installPath` (P-059) teraz czy przy następnym wydaniu** · źródło: wpis dziennika 2026-10-28 (E4) · **ROZSTRZYGNIĘTA 2026-10-28** — przy następnym wydaniu; README na GitHubie poprawione pushem `main`, sprawa w `STATE.md` „Co dalej”
- **Commit `.worktreeinclude` w 10 projektach — zostawić lokalnie czy commitować (PLAN sekcja 9)** · źródło: wpis dziennika 2026-10-28 (E4) · **ROZSTRZYGNIĘTA 2026-10-28** — commit tylko w repo RelAI (commit zamknięcia planu); w pozostałych 9 projektach plik zostaje lokalny

## Dziennik wdrożenia

- 2026-10-27 — plan utworzony po wywiadzie z właścicielem (zadanie z sesji PolyFlow-rust po `/doctor`: `relai` to 16% zużycia); czeka na akceptację.
- 2026-10-27 — plan zaakceptowany przez Łukasza bez poprawek; wygenerowany `PROMPT_ETAP_1.md` (cofnięcie klucza, którego nie było przed zmianą, = jego usunięcie wąskim zapisem JSON, nie `disable`).
- 2026-10-27 — E1 zrealizowany: `relai-scope` (status / apply / undo / on / off) z dziennikiem zmian, 17 testów, `status` na tej maszynie — 15 projektów z markerem, 74 kroki, zero zapisów; wygenerowany `PROMPT_ETAP_2.md`.
- 2026-10-27 — E2 rozpoczęty
- 2026-10-27 — E2 zrealizowany: krok włączenia lokalnego w `/relai-adopt`, inicjalizacji i `/relai-update` (tylko Claude Code), Codex zregenerowany; Aneks A — `relai-scope` obchodzi odmowę CLI „already enabled” parą disable → enable (pomiar na prawdziwym CLI: 4 klucze `true`), testy 342/344 (2 zastane), ewaluacje 7/7; wygenerowany `PROMPT_ETAP_3.md`.
- 2026-10-27 — E3 rozpoczęty
- 2026-10-27 — E3 zrealizowany: wiersz „RelAI w tym projekcie” w kokpicie `relai-mods` (karta „Tak / Nie”, para disable → enable, linia w `.worktreeinclude`), testy 87/87, trzy mutacje zabite, pomiar na żywo na desktopie (kopia `relai-mods-e3`, kliknięcia Łukasza): cztery klucze lokalne, sumy globalne bez zmian; wygenerowany `PROMPT_ETAP_4.md`.
- 2026-10-27 — E4 rozpoczęty
- 2026-10-28 — E4 zrealizowany: README i KOMENDY (tryb „RelAI tylko w projektach”, polecenia PowerShella zmierzone dosłownie, P-059), D-92, wydanie RelAI 3.6.0 + `relai-mods` 0.3.0 + `relai-panel` 0.22.1 (Aneks B — poprawka bazy modu w bramce `pre-push`), `release-verify` zgodny ×3; maszyna przełączona (`apply` → `undo` → `apply`, 74 kroki, 15 projektów), pomiar 2 projekty + 1 folder; R2 nie zachodzi w CLI 2.1.304 ani w aplikacji 2.1.308 (P-058).
- 2026-10-28 — plan zamknięty: bramki 3/3 rozstrzygnięte, odnóg brak, Trivy 0 znalezisk; folder przeniesiony do `docs/archiwum/plany/ZASIEG_PLUGINU/`.
