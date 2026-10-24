# STATUS — plan BEZPIECZENSTWO

[PLAN.html](PLAN.html) · utworzony 2026-10-23 · **ZAAKCEPTOWANY 2026-10-23** (Aneks A 2026-10-24) · Opus (D-85) w Claude Code

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | trivy-scan w pluginie i komenda /relai-security | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 16. komenda: liczniki w generatorze, panelu, testach i dokumentach; Aneks A (wiersz ryzyka na paczkę); skan pomija `.claude/relai/work` i `evals` skilla; dogfooding: Z1 (`zod` w filmie) |
| E2 | Hook lockfile-scan | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | 13. hook RelAI z bramką projektu RelAI (`run(input)` w `lockfile-hook.mjs`, zgoda Łukasza); aneks D-40 „13”; wpis z `~/.claude/settings.json` usunięty; README do E6 |
| E3 | Punkty procesu i nowa decyzja | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | D-91 po „tak” Łukasza; Trivy pierwszy w SPEC_PROMPT_ETAPU, done-check, first-deploy, session-close, plan-closing; numeracja kroków bez zmian |
| E4 | security-audit od Cloudflare | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | przegląd: PRZYJĘTY; kopia 1:1 `c1c8a8c` (21/21 sum), kontrola 14 noty; `--full` z kartą kosztu, wrapper `RELAI-validate.cjs` na Windowsie bez WSL; formularz panelu i testy modów (16 komend) po zgodzie Łukasza |
| E5 | Codex i Cursor | ZREALIZOWANY 2026-10-24 | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | lista w `core/process/bundled-skills.js`, cztery skille ze wszystkimi plikami (bez `evals/`) w Codeksie i Cursorze, test parzystości; Codex: `PostToolUse` zmierzony, hook `lockfile-scan` z bramką; Cursor: bez hooka, pomiar bramką (P-054) |
| E6 | Wydanie 3.3.0 | GOTOWY DO STARTU | [PROMPT_ETAP_6.md](PROMPT_ETAP_6.md) | publikacja po osobnej zgodzie |

## Bramki manualne

- **Zgoda na nową decyzję w `DECYZJE.md`** (Trivy jako pierwsze narzędzie audytu zależności, komendy ekosystemu jako zapas — zastępuje dopisek „nie własny skaner” w `SPEC_PROMPT_ETAPU.md`) · blokuje: E3 · źródło: [wpis z 2026-10-23](../../DZIENNIK.md) · **ROZSTRZYGNIĘTA 2026-10-24 — D-91**
- **Usunięcie wpisu hooka z `~/.claude/settings.json`** · blokuje: zamknięcie E2 · **ROZSTRZYGNIĘTA 2026-10-24 — wpis usunięty po „tak” Łukasza, kopia w `Backupy\RelAI\settings.json.przed-E2-2026-10-24`**
- **Usunięcie kopii `trivy-scan` i `security-audit` z `~/.claude/skills/`** · blokuje: zamknięcie E6 · **OTWARTA**
- **Publikacja wydania 3.3.0** · blokuje: zamknięcie E6 · **OTWARTA**
- **Pomiar zdarzenia po narzędziu w Cursorze** (`agent login`, sonda `postToolUse` / `afterFileEdit` / `afterShellExecution`; jest → hook `lockfile-scan` w instalatorze, brak → zdanie w README zostaje) · blokuje: zamknięcie E6 · źródło: [wpis E5 z 2026-10-24](../../DZIENNIK.md) · **OTWARTA**
- **Decyzja o `zod` w narzędziach filmu (ryzyko Z1)** — `npm update @remotion/cli` w `docs/zasoby/film/zrodla/` albo akceptacja ryzyka w `DECYZJE.md` · blokuje: nic (ryzyko zastane) · źródło: [wpis E1 z 2026-10-24](../../DZIENNIK.md) · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-23 — plan utworzony po dwóch rundach wywiadu (oba skille w pluginie, wszystkie trzy adaptery, ryzyka w dzienniku i raporty w `.security/`, hook przejmuje RelAI, pełny audyt na żądanie z propozycją przy pierwszym wdrożeniu, plan równolegle do PANEL_CODEX); czeka na akceptację.
- 2026-10-23 — plan zaakceptowany przez Łukasza bez poprawek; E1 gotowy do startu, wygenerowany `PROMPT_ETAP_1.md`; zgoda na nową decyzję przed E3 zostaje bramką.
- 2026-10-24 — E1 rozpoczęty
- 2026-10-24 — E1 zrealizowany: skill `trivy-scan` i `/relai-security` w pluginie, 16 komend w panelu, Codeksie i dokumentach; Aneks A (wiersz ryzyka na paczkę + plik blokady); walidator spójny, testy 216 + 199 + 15 zielone; dogfooding dał Z1; E2 gotowy do startu, wygenerowany `PROMPT_ETAP_2.md`.
- 2026-10-24 — E2 rozpoczęty
- 2026-10-24 — E2 zrealizowany: hook `lockfile-scan` w pluginie (13. hook, cisza poza projektem RelAI), test 7 przypadków, liczniki 13, aneks D-40; walidator spójny, testy 206 + 216 + 15 zielone; dogfooding w świeżej sesji: notka przy pliku blokady, cisza przy README; E3 gotowy do startu, wygenerowany `PROMPT_ETAP_3.md`.
- 2026-10-24 — E3 rozpoczęty
- 2026-10-24 — E3 zrealizowany: D-91 (bramka rozstrzygnięta), pięć dokumentów procesu z Trivy jako pierwszym narzędziem i kopie Codeksa; walidator spójny, testy 206 + 216 + 15 zielone; dogfooding z Trivy (HIGH 16) i bez (`trivy not found` → `npm audit`); E4 gotowy do startu, wygenerowany `PROMPT_ETAP_4.md`.
- 2026-10-24 — E4 rozpoczęty
- 2026-10-24 — E4 zrealizowany: `security-audit` Cloudflare w pluginie (przegląd PRZYJĘTY, kopia 1:1, nota i kontrola 14, procedura synchronizacji), `/relai-security --full` z kartą kosztu i drogą walidatorów bez WSL, propozycja w `first-deploy`; walidator spójny, testy 206 + 216 + 15 i `plugin test` 211/48/198/68 zielone; dogfooding: IDOR w `findings.json` (`needs_validation`, brak piaskownicy); E5 gotowy do startu, wygenerowany `PROMPT_ETAP_5.md`.
- 2026-10-24 — E5 rozpoczęty
- 2026-10-24 — E5 zrealizowany: `trivy-scan` i `security-audit` w Codeksie i Cursorze ze skryptami (52 pliki, 0 różnic sum), test parzystości 6/6 (stary kod 5 z 6 czerwonych), hook `lockfile-scan` w Codeksie po pomiarze `PostToolUse`; walidator spójny (parytet 73, bramki 5/5), testy 206 + 216 + 24 zielone; Trivy bez nowych CRITICAL/HIGH; Cursor bez pomiaru — bramka; E6 gotowy do startu, wygenerowany `PROMPT_ETAP_6.md`.
