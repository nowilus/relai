# STATUS — plan KONTEKST_STARTU

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-28 · Status planu: **ZAAKCEPTOWANY 2026-10-28** · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Fałszywe sygnały startu i instrument pomiaru | ZREALIZOWANY 2026-10-28 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | parser aktywnego planu, rotacja tylko z zyskiem, nakładki rodzin bez kolizji z `CLAUDE.md`, pomiar „przed” |
| E2 | Skrót startu jednym poleceniem | ZREALIZOWANY 2026-10-28 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `start-digest.js`, jedna linia rytuału w trzech kopiach, budżet ze skrótu, adaptery |
| E3 | Bramka trybu ciągłego w dwóch krokach | GOTOWY DO STARTU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | najpierw sama zgoda, po „tak” model i zasięg; procedura u agenta; podział `relai-prompt.md` |
| E4 | „Zasady aktywne” jako indeks | OCZEKUJE | — | przed startem: aneks do D-15 (sekcja 9 planu); ewaluacja wyzwalania |
| E5 | Pomiar końcowy, progi i wydanie | OCZEKUJE | — | progi budżetu startu — decyzja Łukasza; „gotowi do wydania?” |

## Aneksy

- **Aneks A (2026-10-28, E1, decyzja Łukasza):** zakres E1 obejmuje także linię
  `[RelAI progi dokumentow]` — pozycja sekcji ryzyk ponad progiem proponuje „rotację ryzyk
  ZAMKNIĘTYCH” tylko wtedy, gdy co najmniej jedno ryzyko jest zamknięte; inaczej procedurą jest
  „zamykanie ryzyk”. Ten sam fałszywy sygnał co propozycja rotacji przy części rotowalnej 0;
  test w `start-cost.test.js`.
- **Aneks B (2026-10-28, E2, decyzja Łukasza):** zakres E2 obejmuje także dwie kopie rytuału
  spoza listy promptu — pole „Gdzie jesteśmy” w Kroku 4 komendy `/relai-stage`
  (`adapters/claude-code/commands/relai-stage.md`) i opis rytuału w `SPEC_KOMENDY.md` (l. 115).
  Oba mówią to samo jedno polecenie skrótu i wchodzą do testu kopii rytuału.

## Dziennik wdrożenia

- 2026-10-28 — Plan utworzony na podstawie [ANALIZA.md](ANALIZA.md) i wywiadu z Łukaszem; czeka na akceptację.
- 2026-10-28 — Plan zaakceptowany przez Łukasza bez poprawek, z celem 25 tys. tokenów; E1 gotowy do startu.
- 2026-10-28 — E1 zrealizowany (Opus 5.5): parser „Aktywny plan: brak” z linkiem, propozycja
  rotacji tylko przy części rotowalnej > 0 (z Aneksem A), nakładki `nakladka-<family>.md` ze
  sprzątaniem starych kopii, instrument `core/tools/start-context.js`; testy 329/329 i 225/225,
  pomiar „przed” w dzienniku. E2 gotowy do startu.
- 2026-10-28 — E2 zrealizowany (Opus 5.5, z Aneksem B): `core/process/start-digest.js` i kopia
  w projekcie (obok `session-signals.js`), jedno polecenie rytuału w 11 kopiach (test
  `ritual-copies`), budżet ze skrótu (to repo 109,3 → 77,7 KB ze skillem), po kompakcji samo
  przypomnienie; testy 340/340 i 225/225; `claude -p` 52 154 → 88 144 (stary rytuał) wobec
  52 492 → 75 848 (skrót). E3 gotowy do startu.
