# STATUS — plan RELAI_MODS

[PLAN.html](PLAN.html) · utworzony 2026-10-23 · **ZAAKCEPTOWANY 2026-10-23** · Opus (D-85) w Claude Code

Wejście planu: [BRIEF.md](BRIEF.md) i [makieta.html](makieta.html) (wariant C), kopie z `Desktop/mods-panel` z 2026-10-23.

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Spike na Windows: przełącznik i przeładowanie z moda | GOTOWY DO STARTU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wynik GO albo plan B; ustalenia do `PULAPKI.md`; cel przełącznika: `filetree` |
| E2 | Inwentarz: pełna lista i szczegóły z dysku | OCZEKUJE | — | moduł bez `$`, fixtury ze ścieżkami Windows |
| E3 | Kokpit na desktopie, jasny i ciemny | OCZEKUJE | — | zrzuty w obu wyglądach do akceptacji |
| E4 | Terminal, wąski panel i dwa czaty | OCZEKUJE | — | pomiar na żywo przy 80 kolumnach |
| E5 | Wydanie relai-mods 0.1.0 | OCZEKUJE | — | publikacja po osobnej zgodzie |

## Bramki manualne

- **Plan B, gdy spike E1 wykaże, że CLI z moda nie działa żadną drogą** (tylko podgląd albo zapis `enabledPlugins`) · blokuje: E3, tylko przy złym wyniku E1 · **OTWARTA**
- **Wersja i etykieta „early access” w marketplace** (propozycja 0.1.0) · blokuje: E5 · **OTWARTA**
- **Termin wydania wspólny z planem BEZPIECZENSTWO (3.3.0) albo osobny** · blokuje: E5 · **OTWARTA**
- **Zgoda na publikację: tag `relai-mods-v0.1.0` i push** · blokuje: zamknięcie E5 · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-23 — plan utworzony z briefu i makiety wariantu C (decyzje briefu przyjęte bez ponownego pytania); czeka na akceptację.
- 2026-10-23 — plan przeniesiony z worktree `relai-mods-plan-3c68a3` do `main`; przed akceptacją poprawiony o pięć rozbieżności z kodem i maszyną (`relai-progress` 0.6.0; `security-guidance` w scope `local` projektu Parkly zamiast „wyłączony w user”; cel spike'u E1 `filetree`; nowy przypadek „pluginu nie ma w `enabledPlugins`”; hooki liczone jako 7 komend w 5 zdarzeniach, kryterium „tyle, ile w plikach”; `docs/KOMENDY.md` w punktach styku i E5).
- 2026-10-23 — plan zaakceptowany przez Łukasza z tymi poprawkami; E1 gotowy do startu, wygenerowany `PROMPT_ETAP_1.md`.
