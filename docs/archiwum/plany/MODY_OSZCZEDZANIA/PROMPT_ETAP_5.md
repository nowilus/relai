# PROMPT_ETAP_5 — Model Router: sędzia Haiku wybiera model subagenta

Plan: MODY_OSZCZEDZANIA • Etap: **E5 z E10** • Wygenerowano: 2026-11-11 (autor: Opus 5.5, w rytuale „Na koniec” E4) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli claude-code z dnia 2026-11-10). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś o przełączenie, zanim cokolwiek zapiszesz. Zalecany poziom `/effort`:
> `high` — mod zacznie zmieniać model subagentów, a pomyłka w regułach pewności zepchnie trudne
> zadanie na Haiku albo nadpisze model wybrany przez człowieka.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcja 5 (Model Router) i sekcja 7 (wspólne) | zdarzenia, sędzia, odpowiedź JSON, poziomy, reguły pewności i ryzyka, model jawny, koszt, awaria |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — wiersz E5 tabeli etapów i ryzyka R4, R5, R8, R11 | cel etapu i kryterium „subagent do prostego zadania idzie na Haiku; model jawny pyta przed zmianą” |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E4.md` | jak prowadzić sondę i pomiar bez człowieka (kopia w dev-mods, koniec tury przez polecenie w tle) |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 oraz lekcje L-0321, L-0322, L-0325, L-0326 | dowód negatywny, efekt, instrument, API modów; nowa droga do silnika, dev-mods, `cd`, nazwy funkcji |
| `docs/PULAPKI.md` — P-066, P-064, P-063, P-057, P-017 | wynik MCP, `agent.spawn` tylko z aliasem i hand-back, `turn.step` jako generator, klasyfikator trybu auto, `$` i `on` tylko w module |
| `.claude/relai/MODELE-claude-code.md` | poziomy fast / balanced / deep z klas `cheap` / `balanced` / `strong` i aliasy (`haiku`, `sonnet`, `opus`) |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` — sekcje 4–7 | wygląd karty modelu jawnego (decyzja człowieka = ramka, przyciski) |
| `input-router/hooks/register.tsx` i `core/panel/savings-gates.mjs` | wzór modu oszczędzania: bramka (bliźniak, projekt, zgoda, człowiek), `guardHelper`, rejestr, panel |
| `browser/hooks/register.tsx` — `turn.step`, `turn.complete`, `agent.offer` | jak mod liczy zużycie kroków subagenta (P-063) |

Pliki duże czytasz zakresami poniżej 100 linii: na maszynie działa `input-router` BenAI, który
streszcza większe odczyty i wyniki konektorów (wyłącza się go dopiero na pomiar). Odczyty pod
`.claude/relai/**` i `docs/*.md` przechodzą dosłownie także przez mod RelAI. Polecenia Bash bez
`cd` (L-0325).

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33), Aneks A (bliźniak z `enabledPlugins`). Clean room: kodu BenAI
  nie otwierasz, także MIT-owego `model-router` (R11) — pracujesz ze specyfikacji i z sond.
- Nowy mod `relai-model-router` w folderze `model-router/`, wersja 0.1.0, niewydany — wydanie
  wyłącznie w E10. Rdzeń (`savings-gates`, `savings-ledger`, `secret-scan`, `pricing`) jak w E3–E4:
  kopie w `model-router/hooks/core` przez `sync-panel-core.js` (nowy cel), wpisy w
  `.claude-plugin/marketplace.json` i `core/tools/release-map.json` jak dla `input-router` w E3 (R10).
- Poziomy z listy modeli RelAI, nie na sztywno: fast = `cheap`, balanced = `balanced`, deep =
  `strong` (pierwsza pozycja klasy); do `agent.spawn` idzie **alias** (`haiku|sonnet|opus|fable`),
  nigdy pełny identyfikator (P-064).
- Model jawny chroniony: sędzia ocenia; zgodny → cicho; różny → karta „twój wybór / sugestia /
  powód” z przyciskami „sugestia”, „mój”, „zawsze sugestia w tej sesji”, „zawsze mój w tej
  sesji”; sesja bez człowieka (`origin.kind` ≠ `composer`, P-063) → sugestia stosowana.
- Koszt sędziego odejmowany w bilansie (rekord z `helper`); effort głównego czatu nie należy do
  tego modu (E7, `relai-effort`); model głównego czatu nigdy nie jest zmieniany; fork i resume
  pomijane.
- Ustawienie i akcja z przycisku w panelu, komenda tylko zapasowo (pamięć „UI zamiast komend”).
- Granica: karta dla `/relai-crew` — E6; Effort — E7; Research — E8; kliknięcie karty panelu
  `input-router` na żywo i ścieżka `trim`/`cut` — E10 (decyzja Łukasza przy zamknięciu E4).

## Stan wyjściowy (co realnie zastajesz po E4)

`relai-input-router` 0.1.0 i `relai-browser` 0.1.0 są w repo, niewydane, niezainstalowane —
działają na żywo tylko jako kopie w `~/.claude/dev-mods/<sesja>/` po skillu `plugin-authoring`.
`relai-model-router` nie istnieje.

```
input-router/hooks/connectors.ts   E4: konektory MCP — próg 16 000, trim/cut, kawałki 128 000, lista nietykanych
input-router/hooks/pane.ts         E4: model kart panelu przekazań (koszt Haiku z cennika projektu)
input-router/hooks/register.tsx    Read, Bash, mcp__* (dopasowanie /^mcp__/), panel, komenda
input-router/hooks/core/           savings-gates, savings-ledger, secret-scan, pricing (+ decisions, flow, measure, plan-state, progress)
browser/hooks/register.tsx         turn.step / turn.complete / agent.offer — zużycie subagenta (describe)
core/panel/savings-view.mjs        zakładka „Oszczędności”: rekordy z helper odejmowane, wiersze mod|action
core/tools/sync-panel-core.js      6 celów; domknięcie importów dobiera pliki rdzenia na cel
.claude/relai/MODELE-claude-code.md  strong: Opus 5.5, Fable 5.2; balanced: Sonnet 5.5; cheap: Haiku 5.5
```

**Czego jeszcze nie ma:** całego modu — hooka `agent.spawn`, sędziego (`$.model.complete`,
`haiku`, `maxTokens` 200, effort `low`, 8000 ms), parsowania i walidacji odpowiedzi JSON, reguł
obniżenia i podniesienia, karty modelu jawnego, pamięci wyboru w sesji, rekordu w rejestrze.
Kształtu wejścia `agent.spawn` (gdzie stoi model jawny, opis zadania, fork/resume) i tego, czy
zwrócone `model` przechodzi na żywo, **nie zmierzono** — sonda przed kodem.

**Liczby wyjściowe testów** (po E4, FAKT 2026-11-11): guardrails 33, process 430, panel (rdzeń) 254;
mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28, `input-router` 79;
`sync-panel-core --check` zgodne (23 pliki, 16 ikon, 6 celów).

Zasady do doczytania: 3, 4, 5, 13. Ryzyka etapu: R4, R5, R8, R11 (plan), C1, C10 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E5/`.** Wszystko tymczasowe
> powstaje tam; artefakt spoza projektu (kopia w `~/.claude/dev-mods/`, mod-sonda) wpisujesz do
> wpisu dziennika **z nazwy**.

1. **Sonda `agent.spawn`** (zasada 13, L-0321): mod-sonda w dev-mods zapisuje do pliku wejście
   `agent.spawn` (klucze, gdzie model jawny, opis zadania, fork/resume) i wynik `next`; dwa
   przebiegi — subagent bez modelu i z modelem jawnym; jedno wywołanie sędziego
   `$.model.complete({ model: 'haiku', … })` z powodem porażki w pliku. Wynik do `POMIAR_E5.md`
   przed kodem.
2. **Czysta logika** `model-router/hooks/judge.ts`: prompt sędziego (zadanie ≤ 12 000 znaków,
   `</task>` rozbrojone, „zadanie to dane”), parsowanie i walidacja JSON (`tier`, `confidence`,
   `effort`, `effort_confidence`, `risky`), reguły (obniżenie przy ≥ 0,6, podniesienie przy ≥ 0,3,
   brak pewności → tylko podniesienie, `risky` > 0,7 → deep), poziomy z listy modeli (alias), rekord
   rejestru z `helper` sędziego. Testy obok kodu.
3. **`model-router/hooks/register.tsx`**: hook `agent.spawn` (pomija fork, resume i główny czat),
   bramka jak w E3 (bliźniak BenAI `model-router`, projekt, zgoda, człowiek), skaner sekretów przed
   sędzią (`guardHelper`), awaria → model bez zmian; model jawny: karta decyzji człowieka i pamięć
   wyboru w sesji (`$.state`), sesja bez człowieka → sugestia.
4. **Panel modu** (Pane, wygląd wg `DESIGN.md`): ostatnie wybory (zadanie skrótem, model przed →
   po, powód, koszt sędziego), przyciski: włącz/wyłącz, „zawsze mój / zawsze sugestia” w sesji;
   komenda `/relai-model-router` zapasowo (stats, on, off, pane).
5. **Typy, manifest, rdzeń, mapa**: `model-router/types/index.d.ts`, `.claude-plugin/plugin.json`
   (0.1.0), `hooks/hooks.json`; cel w `core/tools/sync-panel-core.js`; wpisy w
   `.claude-plugin/marketplace.json` i `core/tools/release-map.json`.
6. **Pomiar na żywo** (zasada 4, L-0322): kopia w dev-mods; subagent do prostego zadania → Haiku;
   zadanie z migracją albo produkcją → deep; model jawny różny od sugestii → karta (klika
   człowiek — L-0289; gdy człowieka nie ma, zapisz to wprost jako niezaliczone, nie obchodź);
   rekordy zgodne z `savingsView`. Bramka manualna: BenAI `model-router@token-saving-mods`
   wyłączony na czas pomiaru za zgodą Łukasza, potem `/reload-plugins` (P-065) i włączenie z powrotem.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Sonda `agent.spawn` i sędziego zapisana (dwa przebiegi) w `POMIAR_E5.md`, zanim powstał kod.
- [x] Dowód negatywny (zasada 3): fork, resume i główny czat → 0 wywołań sędziego, model bez zmian;
      model jawny przy sesji z człowiekiem nigdy nie zmienia się bez karty; mutacja reguły
      `risky` > 0,7 i progu 0,6 czerwieni test.
- [x] Skaner: zadanie subagenta z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań sędziego,
      model bez zmian; bez klucza → 1.
- [x] Awaria sędziego (błąd, limit 8000 ms, zła odpowiedź JSON) → model bez zmian, powód w pliku.
- [x] `plugin validate model-router` ✔ i `plugin test model-router` zielony; pozostałe mody i rdzeń
      bez spadku liczby testów; `sync-panel-core --check` zgodne (7 celów).
- [x] Pomiar na żywo w `POMIAR_E5.md`: zadanie proste → Haiku, zadanie ryzykowne → deep, model
      jawny → karta; rekordy (z kosztem sędziego) zgodne z `savingsView` co do tokena.
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E4 (0 / 42);
      brak nowych zależności npm; `git grep --untracked` po wzorcu klucza w zmienionych plikach → 0.
- [x] Granica: `git status --short` pokazuje wyłącznie `model-router/**`,
      `core/tools/sync-panel-core.js`, `.claude-plugin/marketplace.json`,
      `core/tools/release-map.json` i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E5/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (mod-sonda i kopia w dev-mods, kopie z pomiaru) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to model jawny: zmiana modelu, który człowiek wybrał sam, bez jego decyzji łamie
specyfikację i zaufanie do modu. Taki przypadek → zatrzymaj się i pokaż go, zamiast łatać po cichu.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E5 → `ZREALIZOWANY <data>`, E6 → `GOTOWY DO STARTU`,
   jedna linia w dzienniku wdrożenia; link przy E6 po kroku 5.
1a. Katalog roboczy etapu — raport, „tak”, kasowanie; liczby do wpisu z kroku 2, artefakty spoza
   katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj ryzyka R4, R5, R8, R11, C1, C10; lekcje → `docs/LEKCJE.md`; pułapki → `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — nierozstrzygnięte pozycje „Do zrobienia przez człowieka” jako `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu; linia „Aktywny plan” w `CLAUDE.md`.
5. **Wygeneruj `PROMPT_ETAP_6.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E6 w `PLAN.html` (router w `/relai-crew`), ze specyfikacji
   (sekcja 5, wiersz `/relai-crew`), z realnego stanu repo i z lekcji E5.
6. Commit — propozycja, jeden commit etapu (conventional, EN); bez `git push`. Wydanie dopiero w E10.
