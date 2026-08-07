# STATUS — plan BUDOWA_RELAI

Plan: [PLAN.html](PLAN.html) • Utworzony: 2026-08-07 • Status planu: **ZAAKCEPTOWANY 2026-08-07 (Aneks A)** • Model wykonawczy: **Opus** (D-85)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Fundament repo pluginu + inicjalizacja projektu | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | plugin 0.1.0: manifest + marketplace + skill `relai-core` + 6 specyfikacji |
| E2 | Rdzeń dokumentacyjny (specyfikacje dokumentów + rytuały) | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | plugin 0.2.0: SPEC_LEKCJE + SPEC_DECYZJE, rytuały sesji, 3 frazy, ustawienia globalne |
| E3 | Planowanie (PLAN/MINIPLAN, folder-per-plan, STATUS) | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | plugin 0.3.0: skill `relai-planning`, SPEC_PLAN + SPEC_STATUS, MINIPLAN w SPEC_DZIENNIK |
| E4 | Prompty etapowe + /relai-stage + lazy-gen | **GOTOWY DO STARTU** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | świeża sesja na Opusie |
| E5 | Hooki Node.js (8 szt.) | OCZEKUJE | — | |
| E6 | Konkurs designu + szablon HTML + nadpisania lokalne | OCZEKUJE | — | propozycje: Opus; sesja wyboru i iteracja: Fable (D-85) |
| E7 | Komendy operacyjne (backup, audit, changelog, handover, tour) | OCZEKUJE | — | |
| E8 | Profile (app / agent-voice / flow / prompty) | OCZEKUJE | — | |
| E9 | Adopcja (/relai-adopt) + /relai-update | OCZEKUJE | — | obszar szczególnej staranności (D-70) |
| E10 | Pilotaż + scenariusze akceptacyjne | OCZEKUJE | — | nowy projekt + adopcja JiraManager. **Warunek dla R2 (L-0005):** pomiar auto-wyzwalania wykonać po docelowej instalacji pluginu — świeża sesja, prompt bez komendy, osobno dla `relai-core` („nowy projekt") i `relai-planning` („przygotuj plan…"); wynik obu prób zapisać wprost |

## Dziennik wdrożenia

- 2026-08-07 — plan utworzony, przekazany do akceptacji.
- 2026-08-07 — plan ZAAKCEPTOWANY z poprawkami (Aneks A: /relai-help, pytanie o model wykonawczy przy planach, wykonawca budowy = Opus, luki domknięte przeglądem architekta). Wygenerowano PROMPT_ETAP_1.
- 2026-08-07 — **E1 ZREALIZOWANY** (Opus). Plugin RelAI 0.1.0: `.claude-plugin/{plugin,marketplace}.json`, skill `relai-core`, sześć specyfikacji dokumentów w `templates/`, konwencja hook-guard w README pluginu. Instalacja z GitHuba zweryfikowana na tej maszynie (`claude plugin marketplace add nowilus/relai` + `install`). Auto-wyzwalanie skilla w świeżej sesji niezweryfikowane — do sprawdzenia na starcie E2 (ryzyko R2). Wygenerowano PROMPT_ETAP_2.
- 2026-08-07 — **E2 ZREALIZOWANY** (Opus). Plugin RelAI 0.2.0: specyfikacje `SPEC_LEKCJE.md` i `SPEC_DECYZJE.md`, skill `relai-core` rozszerzony o rytuały (start sesji, definicja ukończenia, reakcja na korektę, zamknięcie sesji), trzy frazy naturalne PL/EN, warstwa ustawień globalnych `~/.claude/relai/`, inicjalizacja generuje osiem dokumentów. Dogfooding: `docs/LEKCJE.md` repo założone (L-0001…L-0005). Test ryzyka R2 (auto-wyzwalanie skilla) **niewykonany** — plugin odinstalowany na czas budowy (L-0004), przeniesiony do E10. Wygenerowano PROMPT_ETAP_3.
- 2026-08-07 — **E3 ZREALIZOWANY** (Opus). Plugin RelAI 0.3.0: skill `relai-planning` (wykrycie
  intencji planowania, próg PLAN/MINIPLAN, jedno pytanie o rodzaj/format/model, zamrożenie
  z aneksami, zamknięcie planu), specyfikacje `SPEC_PLAN.md` i `SPEC_STATUS.md`, MINIPLAN jako
  sekcja `SPEC_DZIENNIK.md`. Sześć testów na ścieżce ze spacją i polskim znakiem — wszystkie PASS;
  nie zmierzono auto-wyzwalania skilla ani realnej interakcji AskUserQuestion. Wygenerowano
  PROMPT_ETAP_4.
