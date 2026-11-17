# PROMPT_ETAP_6 — Router w `/relai-crew`: jedna karta modeli przed startem załogi

Plan: MODY_OSZCZEDZANIA • Etap: **E6 z E10** • Wygenerowano: 2026-11-12 (autor: Opus 5.5, w rytuale „Na koniec” etapu 5) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli claude-code z dnia 2026-11-10). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś o przełączenie, zanim cokolwiek zapiszesz. Zalecany poziom `/effort`:
> `high` — etap łączy komendę procesu z modem, a pomyłka zmieni model wybrany przez człowieka
> w wywiadzie załogi albo zasypie go kartą przy każdym członku.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcja 5, wiersz `/relai-crew` | „jedna karta przed startem: tabela zadanie / model jawny / sugestia / powód, wybór per wiersz albo »przyjmij wszystkie«” |
| `docs/plany/MODY_OSZCZEDZANIA/ANEKS_B_DOMYSLNY_SUBAGENTA.md` | model jawny = parametr wywołania albo domyślny subagenta z ustawień; karty i „zawsze …” w sesji |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — wiersz E6 tabeli etapów i ryzyko R4 | kryterium „przed startem załogi widać sugestie modeli dla każdego zadania”; zapis wyboru do rejestru |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E5.md` | kształt `agent.spawn`, baza z `env.CLAUDE_CODE_SUBAGENT_MODEL`, przebiegi A/B2/C/D, jak prowadzić pomiar z człowiekiem |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 oraz lekcje L-0321, L-0322, L-0327, L-0328 | dowód negatywny, efekt, instrument (skrypt edycji tylko Write, `sed` tylko do odczytu), API modów; baza z ustawień zamiast założenia |
| `docs/PULAPKI.md` — P-067, P-064, P-063, P-057 | `agent.spawn` i `$.ui.ask` w teście, alias w `model`, `origin.kind`, klasyfikator trybu auto przy wywołaniu z modu |
| `adapters/claude-code/commands/relai-crew.md` — kroki 4–6 | wywiad o modelach, plan fal, delegacja: `Agent` z `subagent_type` `relai:relai-*` i `model` z wywiadu; drugie narzędzie przez `crew.js run --model` |
| `model-router/hooks/register.tsx` i `model-router/hooks/judge.ts` | hook `agent.spawn`, `protectedChoice`, `oneAtATime`, `prefNow`, rekord `routeRecord` — tu dochodzi karta załogi |
| `core/process/crew.js` — `buildCommand` (okolice linii 380–430) i lista zadań `{ id, title, files, dependsOn, role, runtime, model }` | skąd biorą się modele członków spoza gospodarza |

Pliki duże czytasz zakresami poniżej 100 linii: na maszynie działa `input-router` BenAI, który
streszcza większe odczyty. Polecenia Bash bez `cd` (L-0325); żadnego `node -e` ani heredoka
z backslashem — skrypt piszesz narzędziem Write (L-0327).

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33); Aneks A (bliźniak z `enabledPlugins`), Aneks B 2026-11-12
  (domyślny subagenta z ustawień chroniony kartą). Clean room: kodu BenAI nie otwierasz (R11).
- Rozszerzasz istniejący mod `relai-model-router` 0.1.0 (niewydany) — bez podbicia wersji; wydanie
  wyłącznie w E10. Sędzia, reguły 0,6 / 0,3 / `risky` > 0,7, skaner przed sędzią, awaria → model
  bez zmian — jak w E5, bez zmian.
- Model wybrany przez człowieka (w wywiadzie załogi albo w ustawieniach) nigdy nie zmienia się bez
  jego decyzji; sesja bez człowieka → sugestia stosowana (specyfikacja, sekcja 5; Aneks B).
- Karta załogi zastępuje karty pojedyncze: członek, którego model człowiek rozstrzygnął na karcie
  załogi, nie dostaje drugiej karty przy swoim `agent.spawn`.
- Wycena różnicy modeli w zakładce „Oszczędności” — E10 (decyzja Łukasza przy E5); `core/panel/`
  poza granicą.
- Ustawienie i akcja z przycisku albo karty, komenda tylko zapasowo (pamięć „UI zamiast komend”).
- Granica: Effort — E7; Research — E8; porządki AUDYT_MODOW — E9; migracja, pomiar wszystkich
  modów i wydanie — E10. Przeglądu krzyżowego, fal ani ról w `/relai-crew` nie zmieniasz.

## Stan wyjściowy (co realnie zastajesz po E5)

`relai-model-router` 0.1.0 jest w repo, niewydany, niezainstalowany — na żywo tylko jako kopia
w `~/.claude/dev-mods/<sesja>/` po skillu `plugin-authoring` (L-0322). BenAI `model-router`
jest włączony (`~/.claude/settings.json`); na pomiar wyłączasz go za zgodą Łukasza i prosisz
o `/reload-plugins` (P-065). Na maszynie Łukasza `env.CLAUDE_CODE_SUBAGENT_MODEL =
claude-sonnet-5-5`.

```
model-router/hooks/judge.ts        E5: sędzia, reguły, tiersOf/aliasOf, subagentDefaultOf, karty (CARD_OPTIONS, defaultCardOptions), routeRecord
model-router/hooks/register.tsx    E5: agent.spawn (pomija fork, resume, spawny modów), protectedChoice + oneAtATime, askPerson/askDefault, prefNow, panel, /relai-model-router
model-router/hooks/pane.ts         E5: karty panelu, koszt sędziego, prefWord
model-router/hooks/*.test.ts       58 testów (judge 23, register 35)
adapters/claude-code/commands/relai-crew.md  krok 6: Agent z model z wywiadu — dziś każdy członek z modelem różnym od sugestii dostaje osobną kartę
core/process/crew.js               członkowie w Codeksie/Cursorze: --model / -m / -c model=… — poza agent.spawn
```

**Czego jeszcze nie ma:** karty załogi (tabela zadanie / model jawny / sugestia / powód, wybór per
wiersz albo „przyjmij wszystkie”), drogi, którą orkiestrator `/relai-crew` przekazuje listę zadań do
modu i odbiera modele, oznaczenia „rozstrzygnięte na karcie załogi” dla późniejszych `agent.spawn`,
rekordu wyboru załogi w rejestrze. **Nie zmierzono:** czy model wołający narzędzie zarejestrowane
przez mod (`$.tool.register`) w trybie auto przechodzi przez klasyfikator (P-057 dotyczy wywołań
z modu, nie do modu) i czy `$.ui.ask` ma miejsce na tabelę, czy potrzebny jest panel.

**Liczby wyjściowe testów** (po E5, FAKT 2026-11-12): guardrails 33, process 430, panel (rdzeń) 254;
mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28, `input-router` 79,
`model-router` 58; `sync-panel-core --check` zgodne (23 pliki, 16 ikon, 7 celów).

Zasady do doczytania: 3, 4, 5, 13. Ryzyka etapu: R4, R5, R11 (plan), C1, C10 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E6/`.** Wszystko tymczasowe
> powstaje tam; artefakt spoza projektu (kopia w `~/.claude/dev-mods/`, mod-sonda) wpisujesz do
> wpisu dziennika **z nazwy**.

1. **Sonda drogi orkiestrator → mod** (zasada 13, L-0321), przed kodem, dwa przebiegi: mod-sonda
   rejestruje narzędzie (`$.tool.register`), model wywołuje je z listą zadań w trybie auto; zapis
   do pliku: czy wywołanie przeszło, co mod dostał, czy `$.ui.ask` / panel pokazuje tabelę; wynik
   do `POMIAR_E6.md`. Droga nie działa → zatrzymaj się i zapytaj (odnoga / aneks).
2. **Czysta logika** w `model-router/hooks/` (np. `crew.ts`): wiersze karty (zadanie skrótem, model
   jawny, sugestia, powód) z sędziego na każde zadanie (skaner przed sędzią, równolegle z limitem),
   wybór per wiersz i „przyjmij wszystkie”, oznaczenie zadań rozstrzygniętych, rekord wyboru
   załogi. Testy obok kodu.
3. **`model-router/hooks/register.tsx`**: narzędzie dla orkiestratora i karta załogi (Pane wg
   `docs/zasoby/PANEL_RELAI/DESIGN.md` albo `$.ui.ask` — wg sondy); `agent.spawn` członka
   rozstrzygniętego na karcie przechodzi bez drugiej karty, z modelem z karty.
4. **`adapters/claude-code/commands/relai-crew.md`**: krok między planem fal a delegacją — lista
   zadań do modu, modele z odpowiedzi do `Agent`/`crew.js run --model`; mod nieobecny albo uśpiony
   → krok pominięty jednym zdaniem, wywiad decyduje jak dotąd. Zmiana komendy → `sync-panel-core`,
   jeśli dotyka `core/panel/` (L-0264), i walidator adapterów.
5. **Typy i opis**: `model-router/types/index.d.ts`, opis w `plugin.json` i wpis marketplace bez
   zmiany wersji.
6. **Pomiar na żywo** (zasada 4, L-0322): `/relai-crew` z dwoma–trzema zadaniami, z których jedno
   proste z modelem `opus` z wywiadu → jedna karta z tabelą; wybór per wiersz zastosowany
   (`turn.step.model`), brak drugiej karty przy członkach; rekordy zgodne z `savingsView` co do
   tokena. Bramka manualna: BenAI `model-router` wyłączony za zgodą Łukasza, `/reload-plugins`,
   kartę klika człowiek (L-0289); po pomiarze BenAI włączony z powrotem.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Sonda drogi orkiestrator → mod zapisana (dwa przebiegi) w `POMIAR_E6.md`, zanim powstał kod.
- [x] Dowód negatywny (zasada 3): członek rozstrzygnięty na karcie załogi → 0 kart przy
      `agent.spawn`, model z karty; członek spoza karty → zachowanie E5 bez zmian; mod uśpiony albo
      nieobecny → `/relai-crew` działa jak przed E6; mutacja oznaczenia „rozstrzygnięte” i „przyjmij
      wszystkie” czerwieni test.
- [x] Skaner: zadanie z kluczem `sk-…` (złożonym z kawałków) → wiersz bez sugestii, 0 wywołań
      sędziego dla niego, model z wywiadu bez zmian.
- [x] `plugin validate model-router` ✔ i `plugin test model-router` zielony (więcej niż 58);
      pozostałe mody, rdzeń i `process` bez spadku liczby testów; walidator adapterów zielony;
      `sync-panel-core --check` zgodne.
- [x] Pomiar na żywo w `POMIAR_E6.md`: jedna karta z tabelą przed startem załogi, wybór per wiersz
      zastosowany (`turn.step.model`), bez drugiej karty; rekordy zgodne z `savingsView` co do tokena.
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E5 (0 / 42);
      brak nowych zależności npm; `git grep --untracked` po wzorcu klucza w zmienionych plikach → 0
      (z kontrolą pozytywną).
- [x] Granica: `git status --short` pokazuje wyłącznie `model-router/**`,
      `adapters/claude-code/commands/relai-crew.md` (i jego odpowiedniki adapterów, jeśli walidator
      ich wymaga), `.claude-plugin/marketplace.json` i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E6/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (mod-sonda i kopia w dev-mods, kopie z pomiaru) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to brak drugiej karty: członek rozstrzygnięty na karcie załogi, który przy
`agent.spawn` znów pyta albo dostaje inny model niż z karty, łamie specyfikację. Taki przypadek →
zatrzymaj się i pokaż go, zamiast łatać po cichu.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `STATUS.md`: E6 → `ZREALIZOWANY <data>`, E7 → `GOTOWY DO STARTU`, linia w dzienniku wdrożenia.
1a. Katalog roboczy E6 — raport, „tak”, skasowanie; liczby przed i po do wpisu z punktu 2.
2. `docs/DZIENNIK.md` — wpis wg `SPEC_DZIENNIK.md`, podpis `Autor: RelAI (Opus 5.5) + Lukasz`;
   przegląd tabeli ryzyk; lekcje do `docs/LEKCJE.md`, pułapki do `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — pozycje „Do zrobienia przez człowieka” jako `OTWARTA` albo
   `ROZSTRZYGNIĘTA <data> — <jak>`.
4. `docs/STATE.md` i linia „Aktywny plan” w `CLAUDE.md`.
5. Wygeneruj `PROMPT_ETAP_7.md` wg `SPEC_PROMPT_ETAPU.md` i `stage-prompts.md`.
6. Propozycja commita: jeden, conventional, po angielsku. Bez `git push`.
