# STATUS — plan ROZWOJ_PO_WYDANIU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-08-12 · Status planu: **ZAAKCEPTOWANY 2026-08-12
(Aneks A)** · Model wykonawczy etapów: Opus (z ustawień projektu; architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Odnoga planu — `/relai-branch` (1.1.0) | **GOTOWY DO STARTU** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | zamyka zmierzony ból: E3b JiraManager, 6 aneksów E2 PolyFlow |
| E2 | Rotacja dokumentów (1.2.0) | OCZEKUJE | — | auto przy zamknięciu sesji — decyzja użytkownika; dwufazowa, nic nie kasuje |
| E3 | Poprawki z retrospektywy (1.3.0) | OCZEKUJE | — | decyzje po adopcji → DECYZJE.md; spójność STATE/STATUS; podpisy; bramki |
| E4 | Rdzeń przenośny (1.4.0) | OCZEKUJE | — | zaczyna się od rozpoznania mechanizmów Cursora/Codexa; pre-commit ze skanem sekretów |
| E5 | Adapter Cursor (1.5.0) | OCZEKUJE | — | wymaga decyzji o języku warstwy zespołowej (sekcja 9 planu) |
| E6 | Pilotaż Cursora w firmie | OCZEKUJE | — | scenariusz akceptacyjny na realnym projekcie osoby z zespołu |
| E7 | Adapter Codex (1.6.0) | OCZEKUJE | — | ten sam scenariusz akceptacyjny co E6 |
| E8 | Wydanie 2.0.0 i dystrybucja | OCZEKUJE | — | upublicznienie repo — decyzja człowieka; bez niej dystrybucja wewnętrzna |

## Dziennik wdrożenia

- 2026-08-12 — plan utworzony po retrospektywie dwóch projektów (JiraManager, PolyFlow), inwentarzu
  przenośności i dwóch rundach wywiadu; przekazany do akceptacji.
- 2026-08-12 — plan **ZAAKCEPTOWANY** z Aneksem A (rozstrzygnięcia sekcji 9: repo już publiczne —
  opis do E8; warstwa modelowa adapterów EN, ludzka PL; zgoda na auto-rotację w istniejących
  projektach; LICENSE potwierdzone). Wygenerowano PROMPT_ETAP_1.
