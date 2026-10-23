# STATUS — plan BEZPIECZENSTWO

[PLAN.html](PLAN.html) · utworzony 2026-10-23 · **ZAAKCEPTOWANY 2026-10-23** · Opus (D-85) w Claude Code

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | trivy-scan w pluginie i komenda /relai-security | GOTOWY DO STARTU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 16. komenda: liczniki w generatorze, panelu, testach i dokumentach |
| E2 | Hook lockfile-scan | OCZEKUJE | — | 13. hook RelAI; wpis w `~/.claude/settings.json` usuwany po zgodzie |
| E3 | Punkty procesu i nowa decyzja | OCZEKUJE | — | wymaga zgody człowieka na nową decyzję w `DECYZJE.md` |
| E4 | security-audit od Cloudflare | OCZEKUJE | — | przegląd wg `SPEC_PRZYJECIE_KODU.md` przed kopiowaniem |
| E5 | Codex i Cursor | OCZEKUJE | — | generator i instalator kopiują dziś tylko `.md` |
| E6 | Wydanie 3.3.0 | OCZEKUJE | — | publikacja po osobnej zgodzie |

## Bramki manualne

- **Zgoda na nową decyzję w `DECYZJE.md`** (Trivy jako pierwsze narzędzie audytu zależności, komendy ekosystemu jako zapas — zastępuje dopisek „nie własny skaner” w `SPEC_PROMPT_ETAPU.md`) · blokuje: E3 · źródło: [wpis z 2026-10-23](../../DZIENNIK.md) · **OTWARTA**
- **Usunięcie wpisu hooka z `~/.claude/settings.json`** · blokuje: zamknięcie E2 · **OTWARTA**
- **Usunięcie kopii `trivy-scan` i `security-audit` z `~/.claude/skills/`** · blokuje: zamknięcie E6 · **OTWARTA**
- **Publikacja wydania 3.3.0** · blokuje: zamknięcie E6 · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-23 — plan utworzony po dwóch rundach wywiadu (oba skille w pluginie, wszystkie trzy adaptery, ryzyka w dzienniku i raporty w `.security/`, hook przejmuje RelAI, pełny audyt na żądanie z propozycją przy pierwszym wdrożeniu, plan równolegle do PANEL_CODEX); czeka na akceptację.
- 2026-10-23 — plan zaakceptowany przez Łukasza bez poprawek; E1 gotowy do startu, wygenerowany `PROMPT_ETAP_1.md`; zgoda na nową decyzję przed E3 zostaje bramką.
