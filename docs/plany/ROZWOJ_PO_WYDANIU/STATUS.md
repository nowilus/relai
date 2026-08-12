# STATUS — plan ROZWOJ_PO_WYDANIU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-08-12 · Status planu: **ZAAKCEPTOWANY 2026-08-12
(Aneks A)** · Model wykonawczy etapów: Opus (z ustawień projektu; architektura i plany: Fable)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Odnoga planu — `/relai-branch` (1.1.0) | **ZREALIZOWANY 2026-08-12** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | 8/9 punktów weryfikacji; punkt 8 (pomiar świeżą sesją) → odnoga POMIAR_ODNOG |
| E2 | Rotacja dokumentów (1.2.0) | **ZREALIZOWANY 2026-08-12** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | 8/10 punktów weryfikacji; punkty 5 i 7 (zachowanie świeżej sesji) → odnoga POMIAR_ODNOG |
| E3 | Poprawki z retrospektywy (1.3.0) | **GOTOWY DO STARTU** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | decyzje po adopcji → DECYZJE.md; spójność STATE/STATUS; podpisy; bramki |
| E4 | Rdzeń przenośny (1.4.0) | OCZEKUJE | — | zaczyna się od rozpoznania mechanizmów Cursora/Codexa; pre-commit ze skanem sekretów |
| E5 | Adapter Cursor (1.5.0) | OCZEKUJE | — | wymaga decyzji o języku warstwy zespołowej (sekcja 9 planu) |
| E6 | Pilotaż Cursora w firmie | OCZEKUJE | — | scenariusz akceptacyjny na realnym projekcie osoby z zespołu |
| E7 | Adapter Codex (1.6.0) | OCZEKUJE | — | ten sam scenariusz akceptacyjny co E6 |
| E8 | Wydanie 2.0.0 i dystrybucja | OCZEKUJE | — | upublicznienie repo — decyzja człowieka; bez niej dystrybucja wewnętrzna |

## Odnogi

- **OPIS_REPO** — opis i tematy repozytorium na GitHubie (dziś puste) · źródło: E1 ·
  [karta](odnogi/OPIS_REPO/ODNOGA.md) · **OTWARTA**
- **POMIAR_ODNOG** — sześć scenariuszy zmierzonych świeżą sesją: cztery odnogowe (punkt 8
  weryfikacji E1) i dwa rotacyjne (punkty 5 i 7 weryfikacji E2, dopisane 2026-08-12) · źródło: E1,
  zakres rozszerzony w E2 · [karta](odnogi/POMIAR_ODNOG/ODNOGA.md) · **OTWARTA**

## Dziennik wdrożenia

- 2026-08-12 — plan utworzony po retrospektywie dwóch projektów (JiraManager, PolyFlow), inwentarzu
  przenośności i dwóch rundach wywiadu; przekazany do akceptacji.
- 2026-08-12 — plan **ZAAKCEPTOWANY** z Aneksem A (rozstrzygnięcia sekcji 9: repo już publiczne —
  opis do E8; warstwa modelowa adapterów EN, ludzka PL; zgoda na auto-rotację w istniejących
  projektach; LICENSE potwierdzone). Wygenerowano PROMPT_ETAP_1.
- 2026-08-12 — E1 rozpoczęty.
- 2026-08-12 — **E1 ZREALIZOWANY**, wersja 1.1.0 wydana. Komenda `/relai-branch`, `SPEC_ODNOGA`,
  sekcja „Odnogi", sygnał odchylenia. Punkt 8 weryfikacji niedomknięty → odnoga POMIAR_ODNOG.
  Szczegóły: wpis w `docs/DZIENNIK.md` z 2026-08-12. Wygenerowano PROMPT_ETAP_2.
- 2026-08-12 — E2 rozpoczęty.
- 2026-08-12 — **E2 ZREALIZOWANY**, wersja 1.2.0. Rotacja dokumentów: `SPEC_ARCHIWUM`, krok rotacji
  w rytuale zamknięcia sesji, progi i wyłącznik w `USTAWIENIA`, kalibracja na zmierzonych
  dziennikach (próg lekcji zmieniony na „40 wpisów albo 50 KB"). Punkty 5 i 7 weryfikacji zmierzone
  metodą słabszą → dopisane do odnogi POMIAR_ODNOG jako scenariusze E i F. Szczegóły: wpis
  w `docs/DZIENNIK.md` z 2026-08-12. Wygenerowano PROMPT_ETAP_3.
