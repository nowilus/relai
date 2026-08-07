# STATUS — plan BUDOWA_RELAI

Plan: [PLAN.html](PLAN.html) • Utworzony: 2026-08-07 • Status planu: **ZAAKCEPTOWANY 2026-08-07 (Aneks A)** • Model wykonawczy: **Opus** (D-85)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Fundament repo pluginu + inicjalizacja projektu | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | plugin 0.1.0: manifest + marketplace + skill `relai-core` + 6 specyfikacji |
| E2 | Rdzeń dokumentacyjny (specyfikacje dokumentów + rytuały) | **GOTOWY DO STARTU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | świeża sesja na Opusie |
| E3 | Planowanie (PLAN/MINIPLAN, folder-per-plan, STATUS) | OCZEKUJE | — | |
| E4 | Prompty etapowe + /relai-stage + lazy-gen | OCZEKUJE | — | |
| E5 | Hooki Node.js (8 szt.) | OCZEKUJE | — | |
| E6 | Konkurs designu + szablon HTML + nadpisania lokalne | OCZEKUJE | — | propozycje: Opus; sesja wyboru i iteracja: Fable (D-85) |
| E7 | Komendy operacyjne (backup, audit, changelog, handover, tour) | OCZEKUJE | — | |
| E8 | Profile (app / agent-voice / flow / prompty) | OCZEKUJE | — | |
| E9 | Adopcja (/relai-adopt) + /relai-update | OCZEKUJE | — | obszar szczególnej staranności (D-70) |
| E10 | Pilotaż + scenariusze akceptacyjne | OCZEKUJE | — | nowy projekt + adopcja JiraManager |

## Dziennik wdrożenia

- 2026-08-07 — plan utworzony, przekazany do akceptacji.
- 2026-08-07 — plan ZAAKCEPTOWANY z poprawkami (Aneks A: /relai-help, pytanie o model wykonawczy przy planach, wykonawca budowy = Opus, luki domknięte przeglądem architekta). Wygenerowano PROMPT_ETAP_1.
- 2026-08-07 — **E1 ZREALIZOWANY** (Opus). Plugin RelAI 0.1.0: `.claude-plugin/{plugin,marketplace}.json`, skill `relai-core`, sześć specyfikacji dokumentów w `templates/`, konwencja hook-guard w README pluginu. Instalacja z GitHuba zweryfikowana na tej maszynie (`claude plugin marketplace add nowilus/relai` + `install`). Auto-wyzwalanie skilla w świeżej sesji niezweryfikowane — do sprawdzenia na starcie E2 (ryzyko R2). Wygenerowano PROMPT_ETAP_2.
