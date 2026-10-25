# STATUS — plan PIPELINE_WYDAN

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-25 · Status planu: **ZAAKCEPTOWANY 2026-10-25** · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Raport gotowości | ZREALIZOWANY 2026-10-25 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | `release-map.json` (22 wiersze), `release-check.js` + `release-checks.js` (19 kontroli, 4 zestawy), 36 testów; odbiór na `53830cc` / `v3.2.0` / `a1439b9` |
| E2 | Komenda i naprawy | ZREALIZOWANY 2026-10-25 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `/relai-release` (`.claude/commands/`, śledzona) i fraza „gotowi do wydania?”; propozycje numerów (`release-version.js`), kontrola `podbicie`, `**/*.test.*` w historycznych; 50 testów `release-check`, 14/14 mutacji |
| E3 | Bramka i na żywo | **GOTOWY DO STARTU** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `pre-push` na tagi wydań, obejście flagą z wpisem do dziennika |
| E4 | Film do bieżącej wersji | OCZEKUJE | — | wchłania odnogę FILM_TESTY_V3; decyzja o finale filmu przed startem (sekcja 9 planu) |
| E5 | Pierwsze wydanie przez pipeline | OCZEKUJE | — | publikacja tylko po zgodzie; zamknięcie planu |

## Dziennik wdrożenia

- 2026-10-25 — plan utworzony po wywiadzie z Łukaszem, przekazany do akceptacji; po akceptacji staje się aktywnym planem w `CLAUDE.md` (decyzja z wywiadu).
- 2026-10-25 — plan ZAAKCEPTOWANY bez zmian („Akceptuję plan PIPELINE_WYDAN bez zmian”); wygenerowano PROMPT_ETAP_1, plan aktywny w `CLAUDE.md`.
- 2026-10-25 — E1 ZREALIZOWANY: raport gotowości wydania (`node core/tools/release-check.js`), dowód 3/3 luk z 3.3.0 na dwóch drzewach (decyzja Łukasza przy punkcie 1), raport na `HEAD`: 4 czerwone zastane (wiersze modów w README, film 14/16, `MODELE.md`, testy filmu 29/36); E2 gotowy do startu.
- 2026-10-25 — E2 ZREALIZOWANY: `/relai-release` i fraza „gotowi do wydania?” (świeża sesja: Skill → raport po polsku, bez zmian bez zgody), propozycje numerów z conventional commits (rdzeń 3.3.0 → 3.4.0 minor), kontrola `podbicie` (czerwień z `--wydanie`), reguła testów w ścieżkach historycznych (`--rev a1439b9`: 9 → 1 trafienie, `now-art.ts` — komentarz); naprawa bezpieczna `readme-mody` po zgodzie Łukasza; zero tagów i pushu; E3 gotowy do startu.
