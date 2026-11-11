# STATUS — plan MODY_OSZCZEDZANIA

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-11-11 · Status planu: **ZAAKCEPTOWANY 2026-11-11** · Model wykonawczy etapów: Opus (D-85, ustawienie projektu), świeże sesje — w Claude Code

Załącznik planu (zamrażany razem z nim): [specyfikacja funkcji](SPECYFIKACJA_FUNKCJI.md) —
zachowanie sześciu modów BenAI i zmiany w RelAI; etapy pracują z niej, nie z kodu BenAI.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Sondy silnika, rdzeń i pierwszy mod | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | sondy: [SONDY.md](SONDY.md), pomiar: [POMIAR.md](POMIAR.md); `relai-browser` 0.1.0 w repo, niewydany |
| E2 | Zakładka „Oszczędności” i opis słowami | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | pomiar: [POMIAR_E2.md](POMIAR_E2.md); hand-back opisu liczony podwójnie, wyciszenie odłożone |
| E3 | Input Router: pliki i PDF | GOTOWY DO STARTU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | |
| E4 | Input Router: konektory i panel | OCZEKUJE | — | po E3 |
| E5 | Model Router | OCZEKUJE | — | |
| E6 | Router w `/relai-crew` | OCZEKUJE | — | po E5 |
| E7 | Effort | OCZEKUJE | — | |
| E8 | Research | OCZEKUJE | — | subagenci deep przez router, gdy E5 gotowy |
| E9 | Porządki AUDYT_MODOW | OCZEKUJE | — | wchłonięte 2026-11-11 z „Czeka na człowieka” |
| E10 | Migracja, pomiar i wydanie | OCZEKUJE | — | jedyne wydanie planu; odinstalowanie paczki BenAI robi Łukasz |

## Bramki manualne

- E1 — wyłączenie `efficient-browser-use` BenAI na czas pomiarów — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone i włączone z powrotem (`claude plugin disable/enable` na prośbę Łukasza), razem z `model-router` i `effort-optimizer`.
- E2 — wyłączenie `efficient-browser-use` BenAI i zainstalowanego `relai-panel` na czas pomiaru na żywo — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone za zgodą Łukasza (`claude plugin disable`, user + local), po pomiarze włączone, kopie dev-mods skasowane.

## Dziennik wdrożenia

- 2026-11-11 — plan napisany po analizie sześciu modów BenAI i czterech rundach wywiadu; czeka na akceptację.
- 2026-11-11 — plan zaakceptowany przez Łukasza bez poprawek; E1 gotowy do startu.
- 2026-11-11 — E1 zrealizowany: sondy silnika (dwa przebiegi), rdzeń `savings-gates`/`savings-ledger`/kopia skanera, `relai-browser` 0.1.0 zmierzony na żywo; punkt release-check odłożony do E10 decyzją Łukasza. E2 gotowy do startu.
- 2026-11-11 — Aneks A ZAAKCEPTOWANY (Łukasz, sesja E1): bliźniak BenAI wykrywany z `enabledPlugins` w `settings.json`, nie z `switches.json` — [ANEKS_A_BLIZNIAK.md](ANEKS_A_BLIZNIAK.md).
- 2026-11-11 — E2 rozpoczęty.
- 2026-11-11 — E2: kod i testy gotowe (`savings-view.mjs`, zakładka „Oszczędności”, tryb `describe`); BenAI `efficient-browser-use` i zainstalowany `relai-panel` wyłączone na czas pomiaru, kopie w dev-mods sesji e1e867ea; czeka pomiar na żywo i rytuał „Na koniec”.
- 2026-11-11 — E2, pomiar na żywo: suma zakładki „Dziś” = suma rejestru co do tokena (7 rekordów, 5 303 tokeny); `describe` padał, bo narzędzie Agent przyjmuje w `model` tylko alias rodziny — poprawka `spawnAlias` w `browser/hooks/describe.ts` (28/28), pomiar opisu trwa.
- 2026-11-11 — E2: `describe` działa na żywo (251 słów, 9,5 s, Haiku in 9 587 / out 1 537); raport subagenta wraca do głównej sesji drugi raz — rekord liczy obie kopie (`HAND_BACK_COPIES`), wyciszenie odłożone decyzją Łukasza.
- 2026-11-11 — E2 zrealizowany: zakładka „Oszczędności” zgodna z rejestrem co do tokena, `describe` zmierzony na żywo, bramka pomiaru zamknięta (pluginy włączone, kopie dev-mods skasowane). E3 gotowy do startu.
