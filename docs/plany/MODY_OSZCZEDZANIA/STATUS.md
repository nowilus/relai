# STATUS — plan MODY_OSZCZEDZANIA

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-11-11 · Status planu: **ZAAKCEPTOWANY 2026-11-11** · Model wykonawczy etapów: E1–E6 Opus (D-85, świeże sesje w Claude Code); **E7–E10 gpt-6.1-terra w Codeksie, poprawki i przegląd gpt-6.1-sol, Claude tylko bramka** ([Aneks C](ANEKS_C_WYKONANIE_CODEX.md), 2026-11-12)

Załącznik planu (zamrażany razem z nim): [specyfikacja funkcji](SPECYFIKACJA_FUNKCJI.md) —
zachowanie sześciu modów BenAI i zmiany w RelAI; etapy pracują z niej, nie z kodu BenAI.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Sondy silnika, rdzeń i pierwszy mod | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | sondy: [SONDY.md](SONDY.md), pomiar: [POMIAR.md](POMIAR.md); `relai-browser` 0.1.0 w repo, niewydany |
| E2 | Zakładka „Oszczędności” i opis słowami | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | pomiar: [POMIAR_E2.md](POMIAR_E2.md); hand-back opisu liczony podwójnie, wyciszenie odłożone |
| E3 | Input Router: pliki i PDF | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | pomiar: [POMIAR_E3.md](POMIAR_E3.md); `relai-input-router` 0.1.0 w repo, niewydany |
| E4 | Input Router: konektory i panel | ZREALIZOWANY 2026-11-11 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | pomiar: [POMIAR_E4.md](POMIAR_E4.md); zamknięty decyzją Łukasza bez kliknięcia karty panelu (przeniesione do E10) |
| E5 | Model Router | ZREALIZOWANY 2026-11-12 | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | pomiar: [POMIAR_E5.md](POMIAR_E5.md); Aneks B (domyślny subagenta z ustawień); `relai-model-router` 0.1.0 w repo, niewydany |
| E6 | Router w `/relai-crew` | ZREALIZOWANY 2026-11-12 | [PROMPT_ETAP_6.md](PROMPT_ETAP_6.md) | pomiar: [POMIAR_E6.md](POMIAR_E6.md); karta załogi w `relai-model-router` 0.1.0 (niewydany), krok 5a w `/relai-crew` |
| E7 | Effort | ZREALIZOWANY 2026-11-12 | [PROMPT_ETAP_7.md](PROMPT_ETAP_7.md) | `relai-effort` 0.1.0 w repo, niewydany (33 testy, 11 mutacji zabitych); przegląd Sol BLOCK → 12/12 naprawione; sonda i pomiar na żywo w E10 (AC1) |
| E8 | Research | GOTOWY DO STARTU | [PROMPT_ETAP_8.md](PROMPT_ETAP_8.md) | subagenci deep przez router |
| E9 | Porządki AUDYT_MODOW | OCZEKUJE | — | wchłonięte 2026-11-11 z „Czeka na człowieka” |
| E10 | Migracja, pomiar i wydanie | OCZEKUJE | — | jedyne wydanie planu; odinstalowanie paczki BenAI robi Łukasz |

## Bramki manualne

- E1 — wyłączenie `efficient-browser-use` BenAI na czas pomiarów — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone i włączone z powrotem (`claude plugin disable/enable` na prośbę Łukasza), razem z `model-router` i `effort-optimizer`.
- E2 — wyłączenie `efficient-browser-use` BenAI i zainstalowanego `relai-panel` na czas pomiaru na żywo — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone za zgodą Łukasza (`claude plugin disable`, user + local), po pomiarze włączone, kopie dev-mods skasowane.
- E3 — wyłączenie `input-router` BenAI na czas pomiaru na żywo — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone za zgodą Łukasza (`claude plugin disable`, user; w sesji dopiero po `/reload-plugins`), po pomiarze włączone, kopia dev-mods i kopie z pomiaru skasowane.
- E4 — wyłączenie `input-router` BenAI na czas pomiaru na żywo — ROZSTRZYGNIĘTA 2026-11-11 — wyłączone za zgodą Łukasza (`claude plugin disable`, user), bez `/reload-plugins` (Łukasz poza komputerem), po pomiarze włączone.
- E4 — kliknięcie karty panelu przekazań przez człowieka (notatki, pełny wynik, `full`; L-0289) — ROZSTRZYGNIĘTA 2026-11-11 — Łukasz zamknął E4 bez kliknięcia; sprawdzenie na żywo przechodzi do pomiaru E10.
- E5 — wyłączenie BenAI `model-router` na czas pomiaru na żywo i `/reload-plugins` — ROZSTRZYGNIĘTA 2026-11-12 — wyłączone za zgodą Łukasza (`claude plugin disable`, user), `/reload-plugins` zrobił Łukasz, po pomiarze włączone.
- E5 — kliknięcie kart modelu jawnego i domyślnego subagenta przez człowieka (L-0289) — ROZSTRZYGNIĘTA 2026-11-12 — Łukasz kliknął „Mine” (C) i „Subagent default (sonnet)” (D).
- E6 — wyłączenie BenAI `model-router` na czas pomiaru na żywo i `/reload-plugins` — ROZSTRZYGNIĘTA 2026-11-12 — wyłączone za zgodą Łukasza (`claude plugin disable --scope user`), `/reload-plugins` zrobił Łukasz, po pomiarze włączone, kopie dev-mods (`relai-model-router`, `relai-e6-sonda`) skasowane.
- E6 — kliknięcie karty załogi i panelu przez człowieka (L-0289) — ROZSTRZYGNIĘTA 2026-11-12 — Łukasz przestawił wiersze w panelu i wybrał „Start with the picks above” (przebieg B); przebieg A ujawnił rozjazd panelu, poprawiony.
- E7 — wyłączenie BenAI `effort-optimizer` i kliknięcie karty `relai-effort` — OTWARTA — przeniesiona do E10 (Aneks C).

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
- 2026-11-11 — E3 rozpoczęty.
- 2026-11-11 — E3: kod i testy gotowe (`input-router/` 0.1.0 w repo, 46 testów, cel w `sync-panel-core`, wpisy marketplace i release-map); uwagi recenzji (3×HIGH, MEDIUM, LOW) naprawione z testami; BenAI `input-router` wyłączony za zgodą Łukasza, kopia w dev-mods sesji 6defc1f3; czeka pomiar na żywo i rytuał „Na koniec”.
- 2026-11-11 — E3 zrealizowany: `relai-input-router` 0.1.0 (47 testów), przepustki plików procesu potwierdzone na żywo, notatki dla logu i PDF, pamięć bez Haiku, zakładka = rejestr co do tokena; poprawka `persistedOutputPath` po pomiarze; bramka zamknięta (BenAI włączony, kopia dev-mods skasowana). E4 gotowy do startu.
- 2026-11-11 — E4 rozpoczęty.
- 2026-11-11 — E4: kod i testy gotowe (konektory MCP, panel przekazań; `input-router` 79 testów), recenzja naprawiona, pomiar na żywo bez człowieka zgodny z `savingsView`; BenAI `input-router` włączony z powrotem, kopie dev-mods skasowane. Czeka jeden punkt: kliknięcie karty panelu przez człowieka (L-0289) — potem rytuał „Na koniec” i PROMPT_ETAP_5.
- 2026-11-11 — E4 zrealizowany decyzją Łukasza bez kliknięcia karty panelu (przeniesione do E10): konektory MCP i panel przekazań w `relai-input-router` (79 testów), pomiar na żywo zgodny z rejestrem co do tokena. E5 gotowy do startu.
- 2026-11-12 — E5 rozpoczęty.
- 2026-11-12 — E5: sonda zapisana ([POMIAR_E5.md](POMIAR_E5.md)), `relai-model-router` 0.1.0 w repo (47 testów, 9 mutacji zabitych, recenzja naprawiona), 7. cel `sync-panel-core`, wpisy marketplace i release-map; BenAI `model-router` wyłączony za zgodą Łukasza (user), kopia w dev-mods sesji fe85abbe; czeka pomiar na żywo (`/reload-plugins`, karta) i rytuał „Na koniec”. Wycena różnicy modeli w zakładce — świadomie odłożona do E10 (decyzja Łukasza).
- 2026-11-12 — E5, pomiar na żywo: A (proste → Haiku) i C (jawny `sonnet` → karta → „Mine”) zgodne; B (ryzykowne) poszło na Sonnet — baza z `env.CLAUDE_CODE_SUBAGENT_MODEL`, nie z rodzica; poprawka (B2: Sonnet → Opus). Aneks B ZAAKCEPTOWANY (Łukasz): domyślny subagenta z ustawień chroniony kartą — [ANEKS_B_DOMYSLNY_SUBAGENTA.md](ANEKS_B_DOMYSLNY_SUBAGENTA.md); 58 testów, 12 mutacji zabitych; czeka pomiar karty domyślnego.
- 2026-11-12 — Aneks B ZAAKCEPTOWANY (Łukasz, sesja E5): domyślny model subagenta z ustawień (`env.CLAUDE_CODE_SUBAGENT_MODEL`) chroniony kartą jak model jawny — [ANEKS_B_DOMYSLNY_SUBAGENTA.md](ANEKS_B_DOMYSLNY_SUBAGENTA.md).
- 2026-11-12 — E5 zrealizowany: `relai-model-router` 0.1.0 (58 testów, 12 mutacji zabitych), pomiar na żywo A/B2/C/D zgodny, karty kliknięte przez Łukasza, rejestr = `savingsView` co do tokena; bramka zamknięta (BenAI `model-router` włączony, kopie dev-mods skasowane). E6 gotowy do startu.
- 2026-11-12 — E6 rozpoczęty.
- 2026-11-12 — E6: sonda drogi orkiestrator → mod zapisana ([POMIAR_E6.md](POMIAR_E6.md); karta = panel z wyborem na wiersz + jedna `$.ui.ask`), karta załogi w `relai-model-router` (88 testów, 9 mutacji zabitych), krok 5a w `/relai-crew`; czeka pomiar na żywo (bramka: BenAI `model-router` wyłączony za zgodą Łukasza, `/reload-plugins`) i rytuał „Na koniec”.
- 2026-11-12 — E6 zrealizowany: pomiar na żywo zgodny (jedna karta, wybór per wiersz → Haiku w `turn.step`, 0 kart i 0 sędziego przy członkach, rejestr = `savingsView` co do tokena); rozjazd panelu (litera pod literą) poprawiony; przegląd kodu 3 HIGH / 4 MEDIUM / 6 LOW naprawione (102 testy, 18 mutacji zabitych); błąd układu `relai-input-router` odłożony do E9 (decyzja Łukasza). E7 gotowy do startu.
- 2026-11-12 — Aneks C ZAAKCEPTOWANY (Łukasz, po E6): E7–E10 wykonuje Codex (`gpt-6.1-terra`, poprawki i przegląd `gpt-6.1-sol`) razem z dokumentami rytuału, Claude robi bramkę i commit; sondy i pomiary na żywo E7–E9 przeniesione do E10 — [ANEKS_C_WYKONANIE_CODEX.md](ANEKS_C_WYKONANIE_CODEX.md); `PROMPT_ETAP_7.md` dostosowany.
- 2026-11-12 — E7 rozpoczęty (wykonawca gpt-6.1-terra w Codeksie, Claude — bramka; Aneks C).
- 2026-11-12 — E7: kod `relai-effort` 0.1.0, 13 testów modu, 8/8 mutacji zabitych;
  bramka Claude ma powtórzyć pełne zestawy poza sandboxem i przegląd Sol. Sonda i pomiar na żywo
  w E10; E8 pozostaje oczekujący do wyniku bramki.
- 2026-11-12 — E7, poprawki Sol po przeglądzie BLOCK (Aneks C, 6c): 12/12 znalezisk naprawionych, wszystkie 3 HIGH z regresjami najpierw czerwonymi; 33/33 testy effort i 17/17 testów bramek/rejestru rdzenia, validate i sync zielone; osobny plik effort usuwa wyścig bez zmiany core; 11 kotwic mutacji zgodnych, pełna powtórka blokowana EPERM — bramka Claude pozostaje otwarta.
- 2026-11-12 — E7 zrealizowany (bramka Claude): pełne zestawy zielone bez spadku, `effort` 33 testy, `mutacje.cjs` 11/11 zabitych, Trivy jak E6; przegląd Sol BLOCK → 12/12 naprawione z regresjami. E8 gotowy do startu.
