# STATUS — plan OPTYMALIZACJA_PO_AUDYCIE

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-11-09 · Status planu: **ZAAKCEPTOWANY 2026-11-09** · Model wykonawczy etapów: Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)

Karty zmian (załącznik planu, zamrażany razem z nim): [konwencje](karty/00_KONWENCJE.md) ·
[ustalenia robocze](karty/USTALENIA_ROBOCZE.md) · źródło znalezisk:
[raport audytu](../../AUDYT_RELAI_2026-11-09.md). Gałąź planu: `optymalizacja/po-audycie`.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Porządki widoczne od następnej sesji | ZREALIZOWANY 2026-11-10 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | [karty](karty/E01_PORZADKI_WIDOCZNE.md); dwa pytania do człowieka |
| E2 | Pomiary na żywo i warianty dystrybucji | ZREALIZOWANY 2026-11-10 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | [karty](karty/E02_POMIARY_NA_ZYWO.md); do 10 sesji `claude -p`; wynik w `POMIARY.md` |
| E3 | Skaner sekretów i pre-commit | ZREALIZOWANY 2026-11-10 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | [karty](karty/E03_SKANER_I_PRECOMMIT.md) |
| E4 | Guardy Claude Code | ZREALIZOWANY 2026-11-10 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | [karty](karty/E04_GUARDY_CLAUDE_CODE.md) |
| E5 | Hook poleceń i kontrola przy zatrzymaniu | GOTOWY DO STARTU | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | [karty](karty/E05_HOOK_POLECEN_I_STOP.md); po E4; karta K-C9 zależy od werdyktu z E2 |
| E6 | Adaptery i załoga | OCZEKUJE | — | [karty](karty/E06_ADAPTERY_I_ZALOGA.md) |
| E7 | Koszt hooka startu | OCZEKUJE | — | [karty](karty/E07_KOSZT_HOOKA_STARTU.md); karta K-A6 zależy od werdyktu z E2 |
| E8 | Skrót startu, progi i lista modeli | OCZEKUJE | — | [karty](karty/E08_SKROT_PROGI_MODELE.md); aneks D-88 |
| E9 | Tryb ciągły | OCZEKUJE | — | [karty](karty/E09_TRYB_CIAGLY.md); po E7; aneks D-93 |
| E10 | Prompty etapów i rytuały | OCZEKUJE | — | [karty](karty/E10_PROMPTY_ETAPOW_I_RYTUALY.md) |
| E11 | Proces i rejestry | OCZEKUJE | — | [karty](karty/E11_PROCES_I_REJESTRY.md); po E10; karta K-E4 po aneksie D-88 z E8 |
| E12 | Mody: odporność i koszt | OCZEKUJE | — | [karty](karty/E12_MODY_ODPORNOSC.md) |
| E13 | Mody: rdzeń i kopie | OCZEKUJE | — | [karty](karty/E13_MODY_RDZEN_I_KOPIE.md); po E12; kod zmienia tylko K-G2 — K-F4 i K-F5 rozstrzygnięte decyzją właściciela 2026-11-09 |
| E14 | CI, liczebniki, wydanie i zamknięcie | OCZEKUJE | — | [karty](karty/E14_CI_I_WYDANIE.md); aneks D-40; jedyne wydanie planu |

## Bramki manualne

- **Wybór wariantu dystrybucji G1 (A / B / C / bez zmiany) na liczbach z [POMIARY.md](POMIARY.md)**
  · źródło: wpis dziennika 2026-11-10 (E2) · **OTWARTA**
- **K-D2: odmowa przy `core.hooksPath` czy instalacja w katalogu, który wskazuje**
  · źródło: wpis dziennika 2026-11-10 (E3) · **OTWARTA**
- **K-D1: zamknięta lista rdzeni `_KEY` — potwierdzić albo poszerzyć**
  · źródło: wpis dziennika 2026-11-10 (E3) · **OTWARTA**
- **K-D4: świadome luki i świadome fałszywe blokady skanera — potwierdzić kompromis**
  · źródło: wpis dziennika 2026-11-10 (E3) · **OTWARTA**

## Dziennik wdrożenia

- 2026-11-09 — plan utworzony, przekazany do akceptacji. Przed przekazaniem: przegląd kolizji
  między etapami i przegląd spójności planu z kartami; poprawki naniesione na karty. Decyzje
  właściciela z tego dnia: `cache-timer.mjs` zostaje do decyzji o PANEL_CODEX (K-F4), podział
  plików `register.tsx` wyjęty z planu (K-F5).
- 2026-11-09 — plan ZAAKCEPTOWANY („Akceptuję”) i zamrożony razem z kartami; E1 GOTOWY DO STARTU,
  wygenerowany `PROMPT_ETAP_1.md`.
- 2026-11-10 — E1 rozpoczęty
- 2026-11-10 — E1 ZREALIZOWANY: siedem kart, 12/12 punktów weryfikacji; manifest — sprawa
  zamknięta, linie archiwum zostają; E2 GOTOWY DO STARTU, wygenerowany `PROMPT_ETAP_2.md`.
- 2026-11-10 — E2 ZREALIZOWANY: `C9: NIE WIDZI`, `A6: NIE POWTARZA` (bez ważnej pary), tabela G1
  w `POMIARY.md`, 10/10 sesji; E3 GOTOWY DO STARTU, wygenerowany `PROMPT_ETAP_3.md`.
- 2026-11-10 — E3 ZREALIZOWANY: cztery karty (K-D1, K-D4, K-D3, K-D2), 33 testy `core/guardrails`,
  porównanie skanera na 1219 plikach `NOWE 0` / `ZNIKNIETE 0`; E4 GOTOWY DO STARTU, wygenerowany
  `PROMPT_ETAP_4.md`.
- 2026-11-10 — E4 ZREALIZOWANY: trzy karty (K-C10 ścieżka A, K-C4, K-C6), 15 nowych testów,
  `core/process` 372; E5 GOTOWY DO STARTU, wygenerowany `PROMPT_ETAP_5.md`.
