# PROMPT_Z13_Z14_WDROZENIE — pasek plan z przyciskiem fokusu, Mapa z „Ta sesja” i zwiniętymi sekcjami

Odnoga: AUDYT_MODOW • Paczki: **Z13 · Pasek plan: przycisk fokusu** i **Z14 · Mapa z fokusem
i zwiniętymi sekcjami** (Aneks B z 2026-10-10) • Wygenerowano: 2026-10-11 (autor: Fable 5.1,
sesja orkiestrująca) • Wykonawca: **Opus 5.5** (subagent tej sesji), `/effort high`

> **Kontrola modelu:** wykonawca paczek odnogi to **Opus 5.5** (`claude-opus-5-5`, lista modeli
> z dnia `2026-10-08`). Jeśli pracujesz na innym modelu — zatrzymaj się i powiedz to w raporcie,
> zanim cokolwiek zapiszesz. Projekt UX obu paczek jest **rozstrzygnięty i zamrożony** w Aneksie B:
> nie proponujesz wariantów; odchylenie od aneksu wymaga „tak” Łukasza w czacie (zgłaszasz je
> w raporcie orkiestratorowi, nie rozstrzygasz sam).

Ta sesja **wdraża** dwie paczki Aneksu B. Wynik: pasek „plan” bez wybranej pracy ma przycisk
`Wybierz pracę…`, który otwiera panel z rozwiniętym wyborem fokusu; zakładka Mapa zaczyna się od
sekcji „Ta sesja” z kartą fokusu i kosztem, a wszystkie pozostałe sekcje są zwinięte do jednej
linii z liczbą, jak w zakładce Koszty.

## Rozstrzygnięcia człowieka (2026-10-11, Łukasz)

- Z13: **zawsze przycisk `Wybierz pracę…`**, także gdy lista wyboru ma ≤ 3 pozycje. Wariant B
  Aneksu B (pozycje wprost na pasku) odrzucony na stałe — nie implementujesz go, nie mierzysz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu i sekcja niemutowalna; rdzeń `core/panel/*.mjs` poza `theme.mjs` nietykalny (plan PANEL_CODEX) |
| `docs/fixy/AUDYT_MODOW/ANEKS_B.md` | **projekt obu paczek** — słowa Łukasza, stan faktyczny, wybrane warianty, zakres, weryfikacja |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md`, sekcje 1, 2, 7 i 9 | drugi wiersz paska tylko przy zdarzeniu; zakładka Koszty jako wzorzec sekcji zwiniętych; kryteria odbioru |
| `docs/PULAPKI.md`, **P-023 pkt 7 i 10**, **P-024 pkt 4** | za duże drzewo panelu znika bez słowa; `$` nie wchodzi do `pane-*.tsx`; `claude` na PATH to 2.1.280 — testy binarką aplikacji 2.1.295 |
| `panel/hooks/band.tsx`, `panel/hooks/band.test.ts` | pasek plan: stan `isAsking`, drugi wiersz (`cardRow`), jak testy mierzą pasek |
| `panel/hooks/register.tsx`: `ui.render` dla `AbovePrompt` (~linia 830), `command.run` `relai-panel` (~590), `ui.render` panelu (~600–700: `unfolded`, `isUnfolded`, `fold`, `nowBar` z `FocusUi`), `chooseFocus` | gdzie pasek dostaje `S.work`, jak panel się otwiera (`$.ui.open`), jak fold trafia do `$.state` |
| `panel/hooks/pane-now.tsx` (`focusRow`, `FocusUi`) | istniejący wybór fokusu „Zmień”/„Zwiń” — Z13 go **rozwija**, nie dubluje |
| `panel/hooks/focus.ts` (`Work`, `Focus`, `branchState`, `branchProgress`, `cardPackets`) | fokus sesji; z czego zbudować kartę „Ta sesja” |
| `panel/hooks/pane-map.tsx`, `panel/hooks/map.test.ts` | obecna mapa: sekcje `map`, `map-open`, `map-crew`, `map-outside`, `map-archive`; `planCard`, `stageRow`, `strip` |
| `panel/hooks/pane-costs.tsx` (`folded`), `panel/hooks/pane-v2.test.ts` (opis „the five sections folded…”) | **wzorzec sekcji zwiniętej**: nagłówek Kalamem, jedna linia podsumowania, `▸ Rozwiń` / `▾ Zwiń`, klucz `fold-costs:<id>` w `$.state` `unfolded` |
| `panel/hooks/tab-data.ts` (`mapData`, `nowData`, `focusChoices`), `panel/hooks/data.ts` (`MapData`, `NowData`) | skąd mapa bierze dane; tu dochodzi fokus sesji i koszt fokusu |
| `panel/hooks/redraw.test.ts` (`TREE_BUDGET`, pomiar `chars`/`svgs`) | instrument wagi drzewa — Z14 dokłada pomiar zwiniętej mapy |
| `core/panel/theme.mjs` (`HEADINGS`), `core/tools/build-panel-headings.js`, `core/tools/sync-panel-core.js` | nowy nagłówek `map-session` „Ta sesja”; `headings.mjs` generowany narzędziem, kopie przez sync |
| `core/panel/attribution.mjs` (`StageCosts`, `rows[].tag`), `core/panel/flow.mjs` (`splitStage`, `PlanNode`) | koszt odnogi = suma `rows` z `tag` `AUDYT_MODOW/Z12` itd.; czytasz, nie zmieniasz |

## Zakres zmian (twardy)

### Z13 · pasek plan: przycisk `Wybierz pracę…`

- `panel/hooks/band.tsx`: w stanie `w.isAsking` pasek rysuje **drugi wiersz** (jak `cardRow`,
  ten sam `marginTop: 1` na desktopie, `flexWrap="wrap"`): chip z `CHIP.info` jako tło zdania
  („ta sesja: praca nie wybrana” — krótsze niż dziś, bez „«Zmień» w panelu, Teraz”) i natywny
  `Button` `Wybierz pracę…` (`variant="secondary"`). Pierwszy wiersz zostaje jednowierszowy
  (słowa + `mention`). Nowy, opcjonalny parametr `pick: (() => void) | null` — bez `$` w pliku
  (P-023 pkt 10). Gdy fokus jest ustawiony (`isAsking === false`) przycisku **nie ma** i drugi
  wiersz nie istnieje. Gdy jednocześnie czeka karta (`waiting`), karta ma pierwszeństwo — wiersz
  fokusu nie dubluje się pod nią (dwa drugie wiersze łamią §1 briefu).
- `panel/hooks/register.tsx`: `AbovePrompt` przekazuje `pick` = (1) ustaw w `$.state` `unfolded`
  klucz `now:focus` na `true` (ten sam klucz, którego `nowBar` używa dla „Zmień”), (2) ustaw
  zakładkę `view` na `commands`, (3) `loadData` + `bump()` + `$.ui.open({ id: PANE_ID, title:
  PANE_TITLE })` — ta sama ścieżka co komenda `relai-panel`, wyciągnięta do jednej funkcji
  `openPane($)` używanej w obu miejscach (bez duplikatu). Panel otwarty wcześniej: `$.ui.open`
  tylko go podnosi; wybór i tak jest rozwinięty przez `now:focus`.
- `panel/hooks/pane-now.tsx`: bez zmian logiki — rozwinięcie przychodzi stanem `now:focus`. Jeśli
  `focusRow` wymaga drobnej korekty (np. `isAsking` ma pokazać listę bez dodatkowego kliknięcia),
  robisz ją tam, nie w `band.tsx`.
- Testy `band.test.ts`: (a) `isAsking` → drugi wiersz z przyciskiem `Wybierz pracę…`, chip
  `CHIP.info`; (b) naciśnięcie → `$.ui.open` wywołany raz z `PANE_ID`, `unfolded['now:focus'] ===
  true`, `view === 'commands'`; (c) po wyborze fokusu (`chooseFocus` przez przycisk `focus-…` w
  panelu albo zapis pliku fokusu + `turn.complete`) pasek wraca do jednego wiersza, przycisku
  brak; (d) fokus ustawiony od początku → przycisku nie ma; (e) karta czeka **i** `isAsking` →
  jeden drugi wiersz (karty). Test szerokości 40 kolumn obejmuje nowy wiersz.
  Testy `pane-v2.test.ts`: panel otwarty z `now:focus` ustawionym → lista wyboru (`focus-…`)
  widoczna bez kliknięcia „Zmień”, przycisk mówi „Zwiń”.

### Z14 · Mapa: „Ta sesja” na górze, sekcje zwinięte

- `core/panel/theme.mjs`: `HEADINGS` dostaje `{ key: 'map-session', text: 'Ta sesja', size: 20,
  color: <jak map-open> }`. Potem `node core/tools/build-panel-headings.js` (wymaga Pythona
  z fontTools — jeśli brak, zgłoś w raporcie i **nie** edytuj `headings.mjs` ręcznie) i `node
  core/tools/sync-panel-core.js`. `headings.mjs` zmienia się tylko o nowy klucz — sprawdź diffem.
  Rdzeń poza `theme.mjs` nietykalny.
- `panel/hooks/data.ts`: `MapData` dostaje `session: MapSession | null`, gdzie `MapSession` to
  karta fokusu: `{ kind: 'branch', card, status, packets: Packet[], now: Packet | null, cost }`
  albo `{ kind: 'plan', plan, stage: Stage | null, cost }` albo `{ kind: 'outside', cost }` albo
  `{ kind: 'asking' }` (praca nie wybrana — karta mówi to i wskazuje `Wybierz pracę…` w „Teraz”).
  `cost` to `Cost` jak w `pane-map.tsx` (`usd`, `isPartial`, `records`) policzony z `md.cost.rows`:
  dla odnogi suma wierszy z `tag` zaczynającym się od `${card}/` i równym `card`; dla etapu wiersz
  `${plan}/${stage}`; dla „poza planem” `md.cost.outside.group`. Liczysz w `tab-data.ts`
  (`mapData`), z `io.session().work` i odczytu karty `cardPathOf(card)` — bez nowego I/O poza tym
  jednym odczytem (Z3: mapa czyta raz na otwarcie zakładki, nigdy na rysowanie).
- `panel/hooks/pane-map.tsx`:
  - nowa sekcja **`map-session`** na samej górze, zawsze rozwinięta (bez przycisku zwijania):
    jedna karta `costBox` w stylu `planCard` z `isMain` (tło `THEME.cardFeatured`, ramka
    `THEME.mark`): tytuł (`AUDYT_MODOW (odnoga)` / `PANEL_X · E2` / `poza planem`), linia faktów
    (status karty, `zamknięte a z b paczek` albo status etapu), pasek segmentów paczek przez
    `hoverSegments` jak `strip` (paczki jako etapy: `done`/`running`/`pending`), koszt fokusu
    Kalamem (`costFig`, 26) — „bez pomiaru” słowami, gdy 0 rekordów; stan `asking` → jedna linia
    `THEME.accentText`: „Praca tej sesji nie wybrana — „Wybierz pracę…” na pasku plan albo „Zmień”
    w Teraz.” Karta **nie** powtarza listy etapów planu (to robi `planCard` niżej).
  - sekcje `map` (aktywny plan), `map-open`, `map-crew`, `map-outside`, `map-archive` stają się
    **zwijane wzorcem `folded` z `pane-costs.tsx`** (ten sam markup: wiersz z nagłówkiem Kalamem,
    podsumowanie jedną linią, `▸ Rozwiń` / `▾ Zwiń`, klucz `fold-map:<id>`, stan `unfolded`
    `map:<id>`), **domyślnie zwinięte wszystkie**. Podsumowania z liczbą: aktywny plan — `PANEL_CODEX
    · W TOKU · zamknięte 0 z 9 etapów · $412`; inne plany — `2 plany · $…`; załoga — `3 przebiegi`
    albo `brak przebiegów`; poza etapem — `$… · 120 wywołań`; archiwum — `12 planów zamkniętych ·
    $…`. Pieniądze przez `money`/`usd` z `fmt.ts` (jedno źródło, Z6). Zwinięta sekcja **nie
    rysuje** swoich kart ani `strip` (to jest cała oszczędność drzewa). Rozwinięta rysuje jak
    dziś. `planCard` aktywnego planu po rozwinięciu sekcji zachowuje własne `isUnfolded('plan:…',
    isMain)` — bez zmian.
  - wyciągnij `folded` do `pane-parts.tsx` jako część wspólną (`p.folded(prefix, id, summary,
    content, isAlert)`) i użyj jej w **obu** zakładkach — zamiast kopiować 15 linii; test
    `pane-v2.test.ts` dla Kosztów musi przejść bez zmian (klucze `fold-costs:<id>` zostają).
  - stopka `map-foot` zostaje.
- Testy `map.test.ts` (nowe, w opisie „the map tab, focused (Z14)”): (a) fokus na odnodze
  (plik fokusu `kind: 'branch'`, karta `docs/fixy/X/ODNOGA.md` z czterema paczkami, dwie
  zamknięte, pomiary z `stage: 'X/Z3'`) → pierwsza sekcja to `map-session`, karta mówi `X
  (odnoga)`, `zamknięte 2 z 4 paczek`, koszt równy sumie rekordów `X/…` policzonej ręcznie w
  teście; (b) fokus na etapie planu → `PANEL_X · E2` i koszt etapu; (c) bez fokusu przy aktywnym
  planie w Codeksie → stan `asking` ze zdaniem o `Wybierz pracę…`; (d) wszystkie pięć sekcji
  zwinięte domyślnie (`fold-map:<id>` z etykietą `▸ Rozwiń`), podsumowanie archiwum z liczbą i
  kwotą; rozwinięcie w `$.state` przeżywa ponowne zamontowanie (jak test Kosztów); (e) **waga**:
  mapa z 12 planami w archiwum po 9 etapów, 3 przebiegami załogi i 400 wywołaniami zwinięta —
  `chars` i `svgs` wypisane w `expect` liczbami (instrument z `redraw.test.ts`; zwinięta mapa
  ma ≤ 6 Svg: 5 nagłówków + pasek paczek; po rozwinięciu archiwum poniżej `TREE_BUDGET`).
  Istniejące testy mapy, które liczą na karty rozwinięte, dostają `press` na `fold-map:<id>`
  przed asercją — **nie** zmieniasz ich asercji merytorycznych.
- **Nie ruszasz:** `core/panel/*.mjs` poza `theme.mjs` (i wygenerowanego `headings.mjs`),
  `adapters/codex/`, `bar-card.tsx` (test równości trzech kopii), `progress/`, `cache-keeper/`,
  `pane-docs.tsx`, `pane-commands.tsx`.

## Kroki

1. Testy najpierw (RED): wymienione wyżej w `band.test.ts`, `pane-v2.test.ts`, `map.test.ts`.
   Uruchom je na starym kodzie i **zapisz liczbę padających** do raportu (kontrola pozytywna).
2. Implementacja (GREEN) w zakresie wyżej. Potem: `claude plugin test` **binarką aplikacji**
   (`%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe`, P-024 pkt 4) dla `panel/`, a także
   `progress/` i `cache-keeper/` (kopie rdzenia po sync); `claude plugin validate` ×3; `node --test
   core/panel/tests/*.test.js`; `node core/tools/sync-panel-core.js --check`; `npx tsc --noEmit -p
   panel` — na HEAD są dwie klasy błędów (TS7016 `.mjs`, TS2345 `Mounted` w testach): **żaden nowy
   rodzaj** błędu.
3. Przegląd własny: `git diff --stat` — tylko pliki z zakresu; żadnego `console.log`; funkcje
   < 50 linii tam, gdzie dopisujesz nowe.
4. **Nie wydajesz, nie podbijasz wersji, nie commitujesz** — to robi orkiestrator po pomiarze
   z Łukaszem.

## Weryfikacja (do raportu)

- [ ] Liczba testów padających na starym kodzie i przechodzących po zmianie, z nazwami testów.
- [ ] `plugin test` ×3 (2.1.295), `validate` ×3, `node --test` rdzenia, `sync-panel-core --check`
      — wyniki liczbami.
- [ ] Waga zwiniętej mapy: `chars` i `svgs` z testu (e).
- [ ] `git diff --stat` i lista odchyleń od tego promptu (każde z powodem) albo „brak”.
- [ ] Rzeczy świadomie odłożone (z powodem).

## Raport końcowy (format)

Zwięźle, po polsku, z nagłówkami: **Zrobione** (plik → co), **Testy** (liczby RED/GREEN, komendy
→ wynik), **Waga mapy**, **Odchylenia**, **Odłożone**, **Do pomiaru na żywo** (co Łukasz ma
zobaczyć na zrzutach). Bez przeklejania kodu do raportu.
