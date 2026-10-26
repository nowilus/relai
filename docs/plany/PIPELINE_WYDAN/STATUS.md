# STATUS — plan PIPELINE_WYDAN

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-25 · Status planu: **ZAAKCEPTOWANY 2026-10-25** · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Raport gotowości | ZREALIZOWANY 2026-10-25 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | `release-map.json` (22 wiersze), `release-check.js` + `release-checks.js` (19 kontroli, 4 zestawy), 36 testów; odbiór na `53830cc` / `v3.2.0` / `a1439b9` |
| E2 | Komenda i naprawy | ZREALIZOWANY 2026-10-25 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `/relai-release` (`.claude/commands/`, śledzona) i fraza „gotowi do wydania?”; propozycje numerów (`release-version.js`), kontrola `podbicie`, `**/*.test.*` w historycznych; 50 testów `release-check`, 14/14 mutacji |
| E3 | Bramka i na żywo | ZREALIZOWANY 2026-10-25 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | hook `pre-push` (`release-pre-push.js` + `install-prepush.js`, zainstalowany w tym klonie), `--komponent` dla tagu modu, kontrola `pre-push`, `release-verify.js` (3.3.0: 1484/1484), `release-hint.js` + reguła w `CLAUDE.md`; 267 testów `core/process`, 13/13 mutacji |
| E4 | Film do bieżącej wersji | ZREALIZOWANY 2026-10-26 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | 16 komend, 176 s (5280 klatek PL i EN), stempel „stan z wersji 3.3.0” w finale; dane filmu z kotwicy `cbfe85c` (`kotwica.mjs`, worktree), testy filmu 37/37, FILM_TESTY_V3 zamknięta; MP4 lokalnie w `out/` |
| E5 | Pierwsze wydanie przez pipeline | **GOTOWY DO STARTU** | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | publikacja tylko po zgodzie; zamknięcie planu |

## Dziennik wdrożenia

- 2026-10-25 — plan utworzony po wywiadzie z Łukaszem, przekazany do akceptacji; po akceptacji staje się aktywnym planem w `CLAUDE.md` (decyzja z wywiadu).
- 2026-10-25 — plan ZAAKCEPTOWANY bez zmian („Akceptuję plan PIPELINE_WYDAN bez zmian”); wygenerowano PROMPT_ETAP_1, plan aktywny w `CLAUDE.md`.
- 2026-10-25 — E1 ZREALIZOWANY: raport gotowości wydania (`node core/tools/release-check.js`), dowód 3/3 luk z 3.3.0 na dwóch drzewach (decyzja Łukasza przy punkcie 1), raport na `HEAD`: 4 czerwone zastane (wiersze modów w README, film 14/16, `MODELE.md`, testy filmu 29/36); E2 gotowy do startu.
- 2026-10-25 — E2 ZREALIZOWANY: `/relai-release` i fraza „gotowi do wydania?” (świeża sesja: Skill → raport po polsku, bez zmian bez zgody), propozycje numerów z conventional commits (rdzeń 3.3.0 → 3.4.0 minor), kontrola `podbicie` (czerwień z `--wydanie`), reguła testów w ścieżkach historycznych (`--rev a1439b9`: 9 → 1 trafienie, `now-art.ts` — komentarz); naprawa bezpieczna `readme-mody` po zgodzie Łukasza; zero tagów i pushu; E3 gotowy do startu.
- 2026-10-25 — E3 ZREALIZOWANY: bramka `pre-push` na tagi `v*` i `relai-*-v*` (czerwień = odmowa, gałąź bez kontroli, obejście z powodem jako wpis w dzienniku), wydanie samego modu `--komponent`, kontrola `pre-push` w raporcie, weryfikacja po publikacji (cache 3.3.0 = tag, świeża sesja), podpowiedź gotowości przy „kontynuujemy pracę”; hook zainstalowany w repo po „tak”; zero tagów i pushu; przegląd: 1 HIGH i 2 MEDIUM poprawione; E4 gotowy do startu.
- 2026-10-26 — E4 ZREALIZOWANY: rekwizyty i słowa `/relai-humanize` i `/relai-security` zaakceptowane na kadrze, finał ze stemplem wersji (decyzja Łukasza), dane filmu z commitu-kotwicy `cbfe85c` (commit lokalny E4 w toku, za zgodą), testy filmu 29/36 → 37/37 i odporne na niezwiązane zmiany (FILM_TESTY_V3 zamknięta), render PL i EN po 5280 klatek; zero tagów i pushu; E5 gotowy do startu.
