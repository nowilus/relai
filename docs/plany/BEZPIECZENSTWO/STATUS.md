# STATUS — plan BEZPIECZENSTWO

[PLAN.html](PLAN.html) · utworzony 2026-10-23 · **ZAAKCEPTOWANY 2026-10-23** (Aneks A 2026-10-24) · Opus (D-85) w Claude Code

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | trivy-scan w pluginie i komenda /relai-security | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 16. komenda: liczniki w generatorze, panelu, testach i dokumentach; Aneks A (wiersz ryzyka na paczkę); skan pomija `.claude/relai/work` i `evals` skilla; dogfooding: Z1 (`zod` w filmie) |
| E2 | Hook lockfile-scan | GOTOWY DO STARTU | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | 13. hook RelAI; wpis w `~/.claude/settings.json` usuwany po zgodzie |
| E3 | Punkty procesu i nowa decyzja | OCZEKUJE | — | wymaga zgody człowieka na nową decyzję w `DECYZJE.md` |
| E4 | security-audit od Cloudflare | OCZEKUJE | — | przegląd wg `SPEC_PRZYJECIE_KODU.md` przed kopiowaniem |
| E5 | Codex i Cursor | OCZEKUJE | — | generator i instalator kopiują dziś tylko `.md` |
| E6 | Wydanie 3.3.0 | OCZEKUJE | — | publikacja po osobnej zgodzie |

## Bramki manualne

- **Zgoda na nową decyzję w `DECYZJE.md`** (Trivy jako pierwsze narzędzie audytu zależności, komendy ekosystemu jako zapas — zastępuje dopisek „nie własny skaner” w `SPEC_PROMPT_ETAPU.md`) · blokuje: E3 · źródło: [wpis z 2026-10-23](../../DZIENNIK.md) · **OTWARTA**
- **Usunięcie wpisu hooka z `~/.claude/settings.json`** · blokuje: zamknięcie E2 · **OTWARTA**
- **Usunięcie kopii `trivy-scan` i `security-audit` z `~/.claude/skills/`** · blokuje: zamknięcie E6 · **OTWARTA**
- **Publikacja wydania 3.3.0** · blokuje: zamknięcie E6 · **OTWARTA**
- **Decyzja o `zod` w narzędziach filmu (ryzyko Z1)** — `npm update @remotion/cli` w `docs/zasoby/film/zrodla/` albo akceptacja ryzyka w `DECYZJE.md` · blokuje: nic (ryzyko zastane) · źródło: [wpis E1 z 2026-10-24](../../DZIENNIK.md) · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-23 — plan utworzony po dwóch rundach wywiadu (oba skille w pluginie, wszystkie trzy adaptery, ryzyka w dzienniku i raporty w `.security/`, hook przejmuje RelAI, pełny audyt na żądanie z propozycją przy pierwszym wdrożeniu, plan równolegle do PANEL_CODEX); czeka na akceptację.
- 2026-10-23 — plan zaakceptowany przez Łukasza bez poprawek; E1 gotowy do startu, wygenerowany `PROMPT_ETAP_1.md`; zgoda na nową decyzję przed E3 zostaje bramką.
- 2026-10-24 — E1 rozpoczęty
- 2026-10-24 — E1 zrealizowany: skill `trivy-scan` i `/relai-security` w pluginie, 16 komend w panelu, Codeksie i dokumentach; Aneks A (wiersz ryzyka na paczkę + plik blokady); walidator spójny, testy 216 + 199 + 15 zielone; dogfooding dał Z1; E2 gotowy do startu, wygenerowany `PROMPT_ETAP_2.md`.
