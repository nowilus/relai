# E12 — Mody: odporność i koszt

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Etap zmienia trzy mody: `relai-progress`
(`progress/`), `relai-mods` (`mods/`) i `relai-panel` (`panel/`). Rdzenia `core/panel/` nie
dotyka, więc `sync-panel-core.js` nie jest potrzebny. Wersji modów nie podbijasz — robi to etap E14
z listy, którą zostawia pole „Gotowe, gdy” każdej karty.

- **Karty w kolejności wykonania:** K-F3 → K-F1 → K-F2. K-F3 jest najmniejsza i zabezpiecza
  następną: po niej błąd rysowania kokpitu pokazuje komunikat zamiast pustego panelu, więc pomyłka
  w pamięci z K-F1 nie zniknie po cichu. K-F1 i K-F3 zmieniają ten sam plik `mods/hooks/register.tsx`,
  więc idą jedna po drugiej. K-F2 dotyczy innego modu i jest niezależna — stoi na końcu.
- **Efekt widoczny:** wpisywanie w wyszukiwarce kokpitu `/relai-mods` nie czyta dysku przy każdym
  znaku; panel agentów i kokpit przy błędzie mówią, co się stało, zamiast zniknąć; zakładki Koszty
  i Mapa po turze nie czytają od nowa 155 plików pomiarów (6,2 MB — FAKT z audytu).
- **Szacunek:** SZACUNEK 1–2 sesje.
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; nowy test jest zielony przed zmianą
  (karta zakłada, że ma być czerwony); któryś istniejący test modu robi się czerwony po zmianie,
  a karta go nie wymienia; `plugin validate` przestaje kończyć się „✔ Validation passed”; człowiek
  w bramce manualnej widzi pusty panel albo brak pasków nad promptem.
- **Weryfikacja etapu:** cztery polecenia `plugin test` z sekcji niżej dają łącznie
  91 + 217 + 51 + 206 = 565 zielonych (stan `main`: 559, etap dokłada 6); `plugin validate` trzech
  zmienionych modów kończy się „✔ Validation passed”; `node --test "core/panel/tests/*.test.*"`
  daje 225 zielonych (bez zmian); bramka manualna przeszła.

---

## Jak testować mody

Testy modów uruchamia binarka bieżącej sesji, z korzenia repozytorium:

```bash
"$CLAUDE_CODE_EXECPATH" plugin test mods
"$CLAUDE_CODE_EXECPATH" plugin test panel
"$CLAUDE_CODE_EXECPATH" plugin test progress
"$CLAUDE_CODE_EXECPATH" plugin test cache-keeper
"$CLAUDE_CODE_EXECPATH" plugin validate mods      # tak samo dla panel, progress, cache-keeper
```

- Stan `main @ 5aeab39` (FAKT, [USTALENIA_ROBOCZE.md](USTALENIA_ROBOCZE.md), sekcja 1): mods 87,
  panel 216, progress 50, cache-keeper 206 zielonych. Ostatnie linie wyjścia mają postać
  ` 87 pass`, ` 0 fail`, `Ran 87 tests across 4 files.`; kod wyjścia 1 przy porażce.
- `node --test` na plikach modów nie działa (`Cannot find package 'claude-code'`). `claude` z `PATH`
  bywa inną wersją niż binarka sesji — zawsze `$CLAUDE_CODE_EXECPATH` (P-024 pkt 4, P-052).
- `plugin validate mods` w repozytorium przechodzi; w kopii poza repozytorium dopisuje
  `README_MISSING` — stan zastany, nie Twój błąd.
- **Czego silnik testów nie widzi** (P-017 pkt 2, P-022 pkt 6, P-023 pkt 7, P-053, P-045): nie ma
  `$.plugin.register` ani prawdziwego `$.state` (stan podkłada `mock.store` albo hook `state.get`
  w teście), nie ma stanu `hover`, nie zna limitu wielkości drzewa na desktopie i przyjmuje węzeł
  silnika pod `Box` z `width`, którego desktop nie narysuje. Zachowanie na żywo sprawdza człowiek
  w bramce manualnej.
- **Jak wyglądają istniejące testy:** test dostaje `$` i `on`; hookami `on('fs.read', …)` itd.
  podkłada atrapę świata, a `$.ui.mount` montuje panel. Wzór — wybrane linie z
  `panel/hooks/redraw.test.ts:34-53` (atrapa licząca wywołania `$.fs`):

  ```ts
  function world(on: On, files: Record<string, string>, git = { numstat: '', diff: '' }, uses: Uses = {}) {
    const n: Counts = { fs: 0, process: 0, prices: 0, read: [], written: [], invalidate: 0 }
    const broken = { session: false, write: false } // set: the engine stops answering the session's id / writing the measurements
    const disk: Record<string, string> = { ...files }
    const key = (path: string) => path.replace(/\\/g, '/')
    const clock = mock.clock(on, { now: NOW })
    mock.store(on, {})
    on('session.cwd', () => ({ value: CWD }))
    on('session.id', () => { if (broken.session) throw new Error('silnik nie odpowiada'); return { value: SESSION } })
    on('fs.read', ($, e) => {
      n.fs += 1
      n.read.push(key(e.path))
      return key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: 'ENOENT ' + e.path }
    })
  ```

  Odmowę wywołania `$` atrapa zwraca jako `{ deny: '…' }`. Atrapy normalizują `\` na `/`, bo `$.fs`
  dostaje ścieżki w postaci systemu (P-017 pkt 4).
- **Ustalone prototypem 2026-11-09 (nowe, nie ma go w PULAPKI):** wyjątek rzucony w hooku testu
  `on('state.get', …)` silnik testów **pomija** („test's state.get hook was skipped”) i odczyt stanu
  się udaje. Żeby odczyt stanu w rysowaniu się nie udał, hook ma **zwrócić** `{ deny: '…' }` —
  wtedy `read($, atom)` odrzuca obietnicę, a silnik woła gałąź `.catch` handlera `ui.render`.
  Hook `state.get` rejestrujesz **przed** atrapą świata (`world(…)`, `engine(…)`), tak jak
  `panel/hooks/band.test.ts:257`.

### Bramka manualna (człowiek, po K-F2)

Wersje modów podbija dopiero E14, więc zainstalowane mody w Twojej aplikacji nadal są stare.
Kod z gałęzi ładujesz w osobnej sesji terminala, z wyłączonymi zainstalowanymi kopiami tych modów.

1. Otwórz **zwykłe okno PowerShell** (nie terminal aplikacji Claude) o szerokości co najmniej
   110 kolumn — węższe okno stawia panel nad promptem zamiast w doku (P-053).
2. Wpisz kolejno:

   ```powershell
   $s = Join-Path $env:TEMP 'relai-e12-settings.json'
   '{"enabledPlugins":{"relai-panel@relai":false,"relai-progress@relai":false,"relai-mods@relai":false}}' | Out-File -Encoding ascii $s
   cd C:\Users\Lukasz\Desktop\RelAI
   claude --settings $s --plugin-dir .\panel --plugin-dir .\progress --plugin-dir .\mods
   ```

3. **Kokpit (K-F1, K-F3):** wpisz `/relai-mods`. Panel „RelAI Mods” pokazuje nagłówek
   „N/M włączone · …” i listę. Naciśnij dwa razy `ctrl+x tab` (fokus: najpierw pasek, potem panel,
   P-053) i w polu „Szukaj” wpisz po jednej literze `r`, `e`, `l`. Oczekiwane: lista zawęża się po
   każdej literze bez odczuwalnego opóźnienia. Odczekaj 15 sekund: lista nie skacze i nie miga.
4. **Przełącznik (K-F1, unieważnienie pamięci):** wybierz plugin, którego w tej sesji nie
   potrzebujesz (np. `filetree`), naciśnij jego przełącznik. Oczekiwane: przycisk zmienia napis,
   pojawia się pasek „⟳ 1 zmiana czeka na przeładowanie”. Naciśnij przełącznik ponownie: pasek
   znika. Plik `~/.claude/settings.json` wraca do stanu sprzed kroku.
5. **Panel agentów (K-F3):** wpisz `/relai-agents`, potem prompt „Uruchom jednego subagenta Explore,
   który policzy pliki .md w docs/fixy i odpowie liczbą”. Oczekiwane: w panelu pojawia się karta
   agenta „● działa”, po zakończeniu „✓ zakończony” z kosztem albo „brak pomiaru”.
6. **Koszty (K-F2):** wpisz `/relai-panel`, wybierz zakładkę „Koszty”. Zapisz sumę projektu. Wyślij
   prompt `ok`. Oczekiwane: po turze zakładka rysuje się bez odczuwalnej przerwy, suma sesji
   i suma projektu rosną o koszt tej tury, nic nie znika. Otwórz zakładkę „Mapa”: rysuje się.
7. Gałęzi błędu (`.catch`) nie wywołujesz na żywo — pokrywają ją testy K-F3. Zakończ sesję `/exit`
   i usuń plik: `Remove-Item $s`.

Wynik bramki (co widziałeś w krokach 3–6) wpisujesz do dziennika etapu. Inny widok niż oczekiwany →
etap się zatrzymuje.

---

## K-F3 — panele `relai-progress` i `relai-mods` mówią, że się nie narysowały

- **Cel:** wyjątek albo przekroczenie budżetu czasu w rysowaniu panelu agentów (`/relai-agents`)
  i kokpitu (`/relai-mods`) daje panel z jednym zdaniem „co się stało” i jednym „co zrobić”, zamiast
  panelu zamkniętego przez silnik bez słowa (raport F3).
- **Pliki:** `progress/hooks/register.tsx`, `progress/hooks/progress.test.ts`,
  `mods/hooks/register.tsx`, `mods/hooks/mods.test.tsx`.
- **Stan dziś:** wzór jest w `panel/hooks/register.tsx:948-964` (dosłownie):

  ```tsx
  }).catch(async ($, e, next) => {
    // A drawing that threw or overran its budget: the pane says so and keeps its tabs, so the
    // person can leave the tab, instead of the engine closing the pane without a word (Z3)
    if (e.surface === 'mobile') return next(e)
    const el = $.ui.resolve(e)
    const { Box, Text } = el
    const why = next.error.kind === 'timeout' ? 'liczyła się dłużej niż pozwala silnik' : next.error.message ?? 'nieznany błąd'
    const tab = tabOf(await read($, view).catch(() => 'commands'))
    const p = parts({ el, Svg: null, isGui: e.surface !== 'terminal', width: Math.max(30, e.props.bodyColumns), flashed: '', last: '', flash: () => undefined,
      isUnfolded: (_key, byDefault) => byDefault, fold: () => undefined })
    return retone(
      <Box key="relai-pane" flexDirection="column" gap={1}>
        {p.tabs(tab, (v) => { bump(); void update($, view, () => v) })}
        <Box key="pane-error"><Text color={THEME.accentText}>{`⚠ Panel nie narysował tej zakładki: ${why}. Wybierz inną zakładkę albo otwórz /relai-panel ponownie.`}</Text></Box>
      </Box>,
    ) as RenderNode
  })
  ```

  Handlery bez `.catch` — kotwice: `progress/hooks/register.tsx:364`
  `on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {` kończy się w linii
  387–389 na `onFrame: () => { update($, cardFrame, …` + `}))` + `})`;
  `mods/hooks/register.tsx:321` (ta sama pierwsza linia) kończy się w linii 357–358 na
  `return base.isFull && treeWeight(full) > DRAW_LIMIT ? cockpit({ ...base, isFull: false }) : full`
  + `})`. Budżet czasu hooka to 10 s (komentarz `panel/hooks/register.tsx:287`, `HookBudget`);
  przekroczenie przychodzi do `.catch` jako `next.error.kind === 'timeout'`.
- **Zmiana:**
  1. Komunikat błędu **nie czyta niczego** z dysku ani ze stanu: odczyt, który zawiódł, zawiódłby
     drugi raz. Panel agentów nie ma zakładek, kokpit też — dlatego zamiast zakładek (jak w
     `relai-panel`) rysujesz tytuł panelu, zdanie z przyczyną i zdanie z tym, co zrobić.
  2. `progress/hooks/register.tsx`: w imporcie `import { BAND, BAR, BAR_LOOK } from './core/theme.mjs'`
     dopisz `THEME`. Zamknięcie handlera panelu (`}))` + `})` po `onFrame`) zastąp:

     ```tsx
         onFrame: () => { update($, cardFrame, (x) => (x === 'draw' ? 'box' : 'draw')).catch(() => undefined) },
       }))
     }).catch(async ($, e, next) => {
       // A drawing that threw or overran its budget: the pane says so in words instead of the engine
       // closing it without a word (audit F3, the pattern of relai-panel). Nothing read here: the read
       // that failed would fail again; an agent's next step draws the pane anew by itself
       if (e.surface === 'mobile') return next(e)
       const { Box, Text } = $.ui.resolve(e)
       const why = next.error.kind === 'timeout' ? 'liczył się dłużej, niż pozwala silnik' : next.error.message ?? 'nieznany błąd'
       return retone(
         <Box key="agents-error" flexDirection="column" rowGap={1}>
           <Text key="agents-error-title" bold color={THEME.title}>{PANE_TITLE}</Text>
           <Text key="agents-error-why" color={THEME.accentText}>{`⚠ Panel agentów nie narysował się: ${why}.`}</Text>
           <Text key="agents-error-todo" color={THEME.body}>Narysuje się ponownie przy następnym kroku agenta. Jeśli komunikat zostaje, zamknij panel i otwórz go ponownie komendą /relai-agents.</Text>
         </Box>,
       )
     })
     ```

     `retone` zamienia kolory `THEME` na klucze motywu (P-042, P-044) — ten sam zabieg co w handlerze.
  3. `mods/hooks/register.tsx`: pod `import { cockpit, mobileList } from './views'` dopisz
     `import { KEY } from './look'`. Zamknięcie handlera (`return base.isFull && …` + `})`) zastąp:

     ```tsx
         return base.isFull && treeWeight(full) > DRAW_LIMIT ? cockpit({ ...base, isFull: false }) : full
       }).catch(async ($, e, next) => {
         // A drawing that threw or overran its budget: the pane says so in words instead of the engine
         // closing it without a word (audit F3, the pattern of relai-panel). Nothing read here: the read
         // that failed would fail again; the refresh every REFRESH_MS draws the pane anew by itself
         if (e.surface === 'mobile') return next(e)
         const { Box, Text } = $.ui.resolve(e)
         const why = next.error.kind === 'timeout' ? 'odczyt dysku trwał dłużej, niż pozwala silnik' : next.error.message ?? 'nieznany błąd'
         return (
           <Box key="mods-error" flexDirection="column" rowGap={1}>
             <Text key="mods-error-title" bold color={KEY.text}>{PANE_TITLE}</Text>
             <Text key="mods-error-why" color={KEY.failed}>{`⚠ Kokpit nie narysował listy: ${why}.`}</Text>
             <Text key="mods-error-todo" color={KEY.muted}>Panel spróbuje ponownie za kilka sekund. Jeśli komunikat zostaje, zamknij go i otwórz ponownie komendą /relai-mods.</Text>
           </Box>
         )
       })
     ```

     Kokpit podaje kolory wyłącznie kluczami motywu z `look.ts` (`KEY.text`, `KEY.failed`,
     `KEY.muted`) — test „no hex color outside the markup of a Svg” tego pilnuje.
- **Test najpierw:** dwa przypadki, prototyp zielony po zmianie i czerwony przed nią (sprawdzone
  2026-11-09 na kopiach modów).
  - `mods/hooks/mods.test.tsx`, w `describe('cockpit', …)` przed testem „the mobile surface…”:
    `a drawing that throws says so in the pane, never an empty pane (audit F3)`.

    ```tsx
    let isBroken = false
    const isQuery = (e: unknown) => (e as { plugin?: string }).plugin === 'relai-mods' && (e as { key?: string }).key === 'query'
    on('state.get', ($, e, next) => (isBroken && isQuery(e) ? { deny: 'stan niedostępny' } as never : next(e)))
    engine(on, 'ok')
    await $.session.start({ cwd: CWD, surface: 'desktop', isInteractive: true })
    const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect((await ui.find({ type: 'Text', text: /włączone ·/ }))?.text).toBe('4/6 włączone · 1 hook własny')
    isBroken = true
    await ui.press({ key: 'filter-off' })
    expect((await ui.find({ type: 'Text', text: /^⚠ Kokpit nie narysował listy/ }))?.text).toContain('stan niedostępny')
    expect(await ui.find({ type: 'Text', text: /komendą \/relai-mods/ })).toBeTruthy()
    await ui.unmount()
    isBroken = false
    const again = await $.ui.mount({ ...PANE, surface: 'desktop' })
    expect(await again.find({ type: 'Text', text: /^⚠ Kokpit/ })).toBeFalsy()
    expect(await again.find({ type: 'Button', key: 'filter-all' })).toBeTruthy()
    await again.unmount()
    ```

  - `progress/hooks/progress.test.ts`, w `describe('the agents pane', …)` przed testem
    „an agent on a model outside the price list…”: `a drawing that throws says so in the pane, never
    an empty pane (audit F3)` — hook `state.get` jak wyżej, ale dla klucza `foldedGroups` pluginu
    `relai-progress`; potem `world(on, FILES)`, `start($)`, `spawn($)`; kontrola pozytywna: panel
    z `isBroken = false` ma węzeł `agent-${AGENT}`; po `isBroken = true` dla `surface` `desktop`
    i `terminal` montujesz `PANE()` i sprawdzasz, że `textOf(await ui.drawn())` zawiera
    `⚠ Panel agentów nie narysował się`, `stan niedostępny` i `/relai-agents`.
  - Przed zmianą oba są czerwone z komunikatem `HooksError: no implementation for ui.render` (panel
    się nie rysuje) — to właściwy powód.
- **Weryfikacja:** `"$CLAUDE_CODE_EXECPATH" plugin test mods` → ` 88 pass`, ` 0 fail`;
  `"$CLAUDE_CODE_EXECPATH" plugin test progress` → ` 51 pass`, ` 0 fail`;
  `plugin validate mods` i `plugin validate progress` → „✔ Validation passed”.
- **Nie ruszasz:** handlera `ui.render` z `AbovePrompt` w obu modach (pasek ma `next` i rysuje to,
  co pod nim — P-017 pkt 3); `.catch` w `panel/`; plików `views.tsx`, `pane-agents.tsx`, `look.ts`;
  F8 (przerysowania paska postępu) i pozostałych znalezisk niskiej wagi; ryzyk API modów C1 i C8;
  manifestów (K-E9, etap E14).
- **Pułapki:**
  - P-023 pkt 10 i P-017 pkt 5: `.catch` używa `$`, więc stoi w `register.tsx`, nigdy w innym pliku.
  - P-018 pkt 4: właściwość obecna z wartością `undefined` odrzuca całe drzewo — `why` zawsze jest
    napisem (`?? 'nieznany błąd'`).
  - P-021 pkt 2: `key` przeżywa tylko na `Box`; test szuka komunikatu po tekście, nie po kluczu `Text`.
  - Hook testu `state.get` ma **zwracać** `{ deny }`, nie rzucać (sekcja „Jak testować mody”).
  - P-053: z `.catch` nie zapisujesz stanu (`update`) — rysowanie jest „czyste”.
- **Gotowe, gdy:** oba nowe testy były czerwone przed zmianą i są zielone po niej; liczby z
  „Weryfikacji” się zgadzają. Mody zmienione tą kartą: `relai-progress`, `relai-mods`.

---

## K-F1 — kokpit `relai-mods` rysuje z pamięci, dysk pyta tylko o czasy plików

- **Cel:** wpisanie znaku, filtr, rozwinięcie i kliknięcie rysują kokpit bez odczytu dysku
  (dziś 602 wywołania `$.fs` na rysowanie: exists 425, read 137, list 39, stat 1 — FAKT,
  `count.ts` z audytu); tyknięcie odświeżania co 5 s bez zmian na dysku woła tylko `$.fs.stat`.
- **Pliki:** `mods/hooks/register.tsx`, `mods/hooks/inventory.ts`, `mods/hooks/inventory.test.ts`,
  `mods/hooks/mods.test.tsx`.
- **Stan dziś** (`mods/hooks/register.tsx`):
  - `:323` `const inv = await readInventory($)` — pełny odczyt przy każdym rysowaniu; `:330`
    `cwdOf($), read($, loaded), read($, ask), readScope($), read($, tick),` — drugi;
  - przerysowanie wywołuje zapis `tick` co `REFRESH_MS` (`:257` `refresher = $.clock.every(REFRESH_MS, () => {`,
    `cockpit.ts:306` `= 5_000`) i zapis `query` na każdy znak (`views.tsx:188` `onInput={(q) => v.onQuery(q)}`);
  - miejsca unieważnienia: `:212` `await update($, queue, (q) => finish(q, taken)).catch(() => undefined)`
    (`press`), `:271` `const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })`
    (`togglePane`), `:280` `const [inv, cwd, scope] = await Promise.all([readInventory($), cwdOf($), readScope($)])`
    (`takeSnapshot`).
  - `$.fs.stat(path)` daje `{ kind, size, mtimeMs, isLink }`, dla braku pliku odrzuca obietnicę (użycie
    w `panel/hooks/register.tsx:92`; typów silnika nie ma w repozytorium — `mods/types/index.d.ts`
    opisuje tylko stan modu).
- **Zmiana:**
  1. `mods/hooks/inventory.ts`, pod funkcją `settingsFilesOf` dopisz czystą funkcję listy plików,
     od których zależy kokpit:

     ```ts
     /**
      * The files whose times key the cockpit's memory (audit F1): installed_plugins.json, every settings
      * file the inventory reads, and the three the row "RelAI w tym projekcie" reads in the folder.
      */
     export function watchedPaths(home: string, cwd: string, installs: Install[]): string[] {
       return [...new Set([
         joinPath(home, '.claude/plugins', INSTALLED_FILE),
         ...settingsFilesOf(installs, home, cwd),
         joinPath(cwd, '.claude/settings.local.json'),
         joinPath(cwd, '.git'),
         joinPath(cwd, '.worktreeinclude'),
       ])]
     }
     ```

  2. `mods/hooks/register.tsx`: do importu z `./inventory` dopisz `watchedPaths`, do importu typów
     `PluginItem`. Pod funkcją `readScope` dopisz pamięć:

     ```ts
     // ---------- the cockpit's memory (audit F1) ----------
     // What the drawing shows, read once and kept while the files it came from stand still: a key
     // press in the search, a filter or a fold draws from here, the refresh every REFRESH_MS asks only
     // the files' times. Data only, never `$` (P-023 pkt 10). Per module: another chat's write moves a
     // file's time, so the key sees it. A plugin's own folder is not watched: an installPath holds one
     // version, a new version comes with a new installed_plugins.json.
     type Disk = { home: string, cwd: string, policy: string, paths: string[], stamp: string, inv: Inventory, scope: ScopeRow | null }
     let disk: Disk | null = null

     // The pane opened again, a reload and every press of a switch read the disk anew
     const forgetDisk = () => { disk = null }

     // Each path's time and size, '-' for a file that is not there (its appearing moves the stamp)
     async function stampOf($: $T, paths: readonly string[]): Promise<string> {
       return (await Promise.all(paths.map((p) => $.fs.stat(p).then((s) => `${s.mtimeMs}:${s.size}`, () => '-')))).join('|')
     }

     async function readDisk($: $T): Promise<Disk> {
       const [home, cwd, policy] = await Promise.all([homeDir($), cwdOf($), policyEnabled($).then((p) => JSON.stringify(p))])
       const isSamePlace = disk !== null && disk.home === home && disk.cwd === cwd && disk.policy === policy
       // The times are taken before the read: a file that moves during it is read again next time
       const before = isSamePlace && disk ? await stampOf($, disk.paths) : null
       if (disk && before !== null && before === disk.stamp) return disk
       const [inv, scope] = await Promise.all([readInventory($), readScope($)])
       const paths = watchedPaths(home, cwd, inv.items.filter((i): i is PluginItem => i.kind !== 'hook'))
       const isSamePaths = disk !== null && paths.length === disk.paths.length && paths.every((p, i) => p === disk?.paths[i])
       disk = { home, cwd, policy, paths, stamp: isSamePaths && before !== null ? before : await stampOf($, paths), inv, scope }
       return disk
     }
     ```

     Pamięć to **dane** w zmiennej `disk`, zastępowanej w całości; `$` przychodzi przy każdym
     wywołaniu od handlera i nie jest nigdzie przechowywany. Klucz: katalog domowy, `cwd`,
     `enabledPlugins` warstwy polityki (`$.settings.read`, nie plik) i `mtimeMs:size` każdego pliku
     z `watchedPaths` — na dysku Łukasza ok. 17 wywołań `stat` na tyknięcie (SZACUNEK z `count.ts`).
  3. Handler `ui.render` kokpitu: linię `const inv = await readInventory($)` zastąp

     ```ts
         // From memory while the watched files stand still (audit F1): a typed letter, a filter or a
         // fold reads no file, the refresh's tick asks only their times
         const { inv, scope } = await readDisk($)
     ```

     a w `Promise.all` usuń `readScope($)` i zmienną `scope` z listy po lewej:
     `const [q, f, sel, qu, errs, said, version, cwd, was, asked] = await Promise.all([` … 
     `cwdOf($), read($, loaded), read($, ask), read($, tick),`. Komentarz nad nim zmień na
     `// tick is read only so its write redraws the pane, which asks the files' times again (the refresh)`.
  4. Unieważnienia (wszystkie miejsca, po kotwicach):
     - `press`, blok `finally` — **przed** zapisem kolejki, który przerysowuje panel:
       `// Before the write that redraws: the drawing after a switch reads the disk the CLI changed`,
       `forgetDisk()`, potem bez zmian `await update($, queue, (q) => finish(q, taken)).catch(() => undefined)`.
       To obejmuje przełącznik pluginu i wiersz „RelAI w tym projekcie” (zapis `.worktreeinclude`),
       bo oba idą przez `press`.
     - `togglePane`, gałąź otwarcia — przed `const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })`:
       `forgetDisk() // the pane opened by the person shows the disk as it is now`.
     - `takeSnapshot` (wołane z `session.start` i z każdego `plugin.register`, czyli po przeładowaniu):
       przed `void (async () => {` dopisz `forgetDisk() // a reload may have brought another version of any plugin: its folder is read anew`,
       a linię z kotwicy zastąp `const [{ inv, scope }, cwd] = await Promise.all([readDisk($), cwdOf($)])`.
     - `runOne` i `runScope` **zostają** przy świeżym odczycie (`readInventory`, `readScope`): przycisk
       ma działać na dysku z chwili kliknięcia (komentarz nad `runScopeCall`).
  5. Dwie sesje (dwa procesy modu) mają osobne pamięci; zapis pliku ustawień przez jedną zmienia
     `mtimeMs` i rozmiar, więc druga widzi zmianę przy najbliższym tyknięciu — tak jak dziś.
- **Test najpierw:** prototyp 2026-11-09: przed zmianą trzy testy czerwone (odczyty `{ exists: 225,
  read: 60, list: 10 }` na serię klawiszy i `{ exists: 45, read: 12, list: 2 }` na tyknięcie), po
  zmianie zielone, a 87 istniejących zielone przed i po.
  1. **Atrapa w `mods/hooks/mods.test.tsx` (jedyna zmiana istniejącego kodu testu):** `Fake`
     dostaje licznik `n: { exists, read, list, stat }` (start od zera), który zwiększają hooki
     `fs.exists`, `fs.read`, `fs.list`, `fs.stat`. `fs.stat` dla pliku zwraca dziś stałe
     `size: 1, mtimeMs: 0` — **zmień** na czas idący za treścią, jak `panel/hooks/redraw.test.ts:62`:
     `const stampOf = (text: string) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)`,
     `size: (disk[p] ?? '').length, mtimeMs: stampOf(disk[p] ?? '')`. Bez tego `writeElsewhere` nie
     zmienia czasu i test odświeżania (linia 405) zrobi się czerwony. Asercji nie zmieniasz.
  2. `inventory.test.ts`, `describe('inventory — paths (R6)', …)`:
     `the memory watches installed_plugins.json, every settings file and the folder row's three, once each (audit F1)`
     — `watchedPaths(HOME, CWD, parseInstalls(INSTALLED).installs)` równa się dokładnie:
     `C:/Users/Ktos/.claude/plugins/installed_plugins.json`, `C:/Users/Ktos/.claude/settings.json`,
     `C:/Users/Ktos/Desktop/RelAI/.claude/settings.json`, `C:/Users/Ktos/Desktop/RelAI/.claude/settings.local.json`,
     `C:/Users/Ktos/Desktop/Parkly/.claude/settings.local.json`, `C:/Users/Ktos/Desktop/RelAI/.git`,
     `C:/Users/Ktos/Desktop/RelAI/.worktreeinclude` (w tej kolejności).
  3. `mods.test.tsx`, `describe('cockpit', …)`:
     `a typed letter, a filter and a fold draw from memory: no read, list or exists (audit F1)` —
     `engine(on, 'ok')`, start, montaż, kontrola nagłówka `4/6 włączone · 1 hook własny`; zapamiętaj
     `before = { ...fake.n }`; `ui.input` z tekstem `s`, `st`, `''`; `press` `filter-off` i
     `pick-${FILETREE}`; oczekiwane: przyrosty `exists`, `read`, `list` równe `{ exists: 0, read: 0, list: 0 }`,
     tekst `^Przełącznik: ` narysowany (kontrola pozytywna) i przyrost `stat` większy od zera.
  4. `mods.test.tsx`:
     `a refresh tick with nothing changed asks only the times; a change from another chat is read (audit F1)` —
     `engine(on, 'ok')`, `const clock = mock.clock(on)`, start, `$.command.run({ command: 'relai-mods' })`,
     montaż, `clock.settle()`; `clock.advance(REFRESH_MS)` → przyrosty `exists/read/list` zero,
     `stat` > 0; potem `writeElsewhere(fake, 'filetree@claude-code-filetree', true)`,
     `clock.advance(REFRESH_MS)` → przyrost `read` > 0 i tekst `⟳ 1 zmiana czeka na przeładowanie`;
     na końcu `$.command.run({ command: 'relai-mods' })` (zamknięcie, zatrzymanie zegara) i `unmount`.
- **Weryfikacja:** `"$CLAUDE_CODE_EXECPATH" plugin test mods` → ` 91 pass`, ` 0 fail`
  (88 po K-F3 + 3); `plugin validate mods` → „✔ Validation passed”, a lista kluczy stanu w raporcie
  (`state writes`, `state reads`) bez zmian względem `main`.
- **Nie ruszasz:** logiki `inventory.ts` poza nową funkcją; `runOne`, `runScope`, `runScopeCall`;
  `cockpit.ts`, `views.tsx`; F8 (kokpit pokazuje mod odrzucony jako włączony); F6; C1, C8.
- **Pułapki:**
  - P-023 pkt 10, P-017 pkt 5: funkcja z `$` (`readDisk`, `stampOf`) tylko w `register.tsx`;
    `watchedPaths` jest czysta, więc może być w `inventory.ts`. Pamięć trzyma dane, **nie** funkcję
    zamkniętą nad `$` — funkcja z `$` zachowana w module po przeładowaniu wołałaby stary `$`.
  - P-053: zapis `$.state` z rysowania jest odrzucany; zmienna modułu nie jest stanem silnika —
    tak samo robi `panel/hooks/memo.ts`.
  - P-023 pkt 6: przeładowanie modu zeruje zmienne modułu; pierwsze rysowanie czyta dysk od nowa.
  - P-053 / P-052: stan „załadowany” (`loaded`) robi `takeSnapshot` — po zmianie musi nadal czytać
    świeży dysk, stąd `forgetDisk()` przed nim.
  - Czas pliku na dysku sieciowym albo zapis w tej samej milisekundzie o tej samej długości nie
    zmieni znacznika; dlatego każdy przycisk unieważnia pamięć jawnie.
- **Gotowe, gdy:** trzy nowe testy były czerwone i są zielone; 87 dawnych zielone; liczby z
  „Weryfikacji” się zgadzają. Mody zmienione tą kartą: `relai-mods`.

---

## K-F2 — Koszty i Mapa nie czytają po turze plików zamkniętych sesji

- **Cel:** po `turn.complete` zakładki Koszty i Mapa czytają ponownie tylko pliki pomiarów nowe albo
  o zmienionym kluczu (nazwa, rozmiar, czas modyfikacji); rekordy pozostałych sesji biorą z pamięci.
  Dziś czytają i parsują wszystkie pliki `.claude/relai/pomiary/*.jsonl` (155 plików, 6,2 MB,
  parsowanie 39–75 ms — FAKT/SZACUNEK z audytu F2).
- **Pliki:** nowy `panel/hooks/records-memo.ts`, `panel/hooks/register.tsx`,
  `panel/hooks/redraw.test.ts`.
- **Stan dziś:** `panel/hooks/register.tsx:232-239` (funkcja `projectRecords`), kotwica:

  ```ts
    const others = entries.filter((x) => x.kind === 'file' && x.name.endsWith('.jsonl') && x.name !== current.name)
    return { current, others: await Promise.all(others.map(async (x) => parseRecords(await readText($, join(dir, x.name))).records)) }
  ```

  Po turze `bump()` (`:1047`) przesuwa epokę w kluczu pamięci zakładek (`:858`), więc `costData`
  i `mapData` (`tab-data.ts:56`, `:97`) wołają `io.records()`, czyli `projectRecords`. Bieżąca sesja
  jest w pamięci kolektora (`ledgerFor`, `:144-153`). Wpisy `$.fs.list` niosą `size` i `mtimeMs` —
  ten sam klucz pliku ma już `progress/hooks/register.tsx:202`.
- **Zmiana:**
  1. Nowy plik `panel/hooks/records-memo.ts` (bez `$`):

     ```ts
     // relai-panel: the other sessions' measurements in memory (audit F2). The costs and the map read
     // every session file of .claude/relai/pomiary after each turn; a closed session's file does not
     // change, so its records are kept here under the name, size and time its listing gave, and read
     // again only when one of them moved. No `$` here (P-023 pkt 10): register.tsx passes the read.
     // Module memory: a reload starts it over, session.start forgets it.

     import type { MeasureRecord } from './core/measure.mjs'

     export type ListedFile = { name: string, size: number, mtimeMs: number }

     type Kept = { key: string, records: MeasureRecord[] }
     let kept: Record<string, Kept> = {} // by file name; replaced, never mutated in place

     export const fileKey = (x: ListedFile): string => `${x.name}|${x.size}|${x.mtimeMs}`

     // A new session reads every file again
     export function forgetRecords(): void { kept = {} }

     // The records of the listed files, in their order: from memory while a file's key stands, read
     // otherwise. A read that failed (null) gives no records and is not kept: the next call tries again.
     export async function othersFrom(files: readonly ListedFile[], read: (name: string) => Promise<MeasureRecord[] | null>): Promise<MeasureRecord[][]> {
       const next: Record<string, Kept> = {}
       const out = await Promise.all(files.map(async (x) => {
         const key = fileKey(x)
         const hit = kept[x.name]
         if (hit && hit.key === key) {
           next[x.name] = hit
           return hit.records
         }
         const records = await read(x.name)
         if (records === null) return []
         next[x.name] = { key, records }
         return records
       }))
       kept = next
       return out
     }
     ```

     Plik usunięty z katalogu wypada z pamięci (nowa pamięć powstaje z bieżącej listy). Po `/clear`
     plik poprzedniej sesji staje się „innym” i jest czytany raz.
  2. `panel/hooks/register.tsx`: pod `import { bump, epochNow, forget, remember } from './memo'`
     dopisz `import { forgetRecords, othersFrom } from './records-memo'`. Linię `return { current,
     others: await Promise.all(…) }` z kotwicy zastąp:

     ```ts
       // A closed session's file from memory while its name, size and time stand (audit F2)
       return { current, others: await othersFrom(others, async (name) => {
         const text = await readText($, join(dir, name))
         return text === null ? null : parseRecords(text).records
       }) }
     ```

  3. W `session.start`, pod `forgetPlan()`, dopisz `forgetRecords()`.
  4. Retencji plików pomiarów karta nie wprowadza — to osobna decyzja (raport F2, „Kierunek”).
- **Test najpierw:** `panel/hooks/redraw.test.ts`, `describe('the panel during a turn (Z4)', …)`,
  przed testem „a write of the measurements that fails…”:
  `after a turn the costs read only what moved: the other sessions' files stay in memory (audit F2)`.

  ```ts
  const { n, disk, clock } = world(on, { ...BASE, ...crewSession(4, 3, 40) })
  const old = (p: string) => p.includes('/.claude/relai/pomiary/') && p.includes('-old-')
  const ui = await open($, 'costs')
  expect(n.read.filter(old).length).toBe(3) // the tab opened: each other session once
  const mark = n.read.length
  await step($, 't1', 0)
  await $.turn.complete({ answer: 'ok', durationMs: 1000, isAborted: false, turnId: 't1', reason: 'answer' } as never)
  await clock.settle()
  expect(textOf(await ui.drawn())).toContain('Suma sesji') // the tab drawn again after the turn
  expect(n.read.filter(old).length).toBe(3) // no other session read again
  const own = `${CWD}/.claude/relai/pomiary/${fileName(new Date(NOW), SESSION)}`
  expect(n.read.slice(mark).filter((p) => p.includes('/.claude/relai/pomiary/') && p !== own)).toEqual([])
  // positive control: a closed session's file that changed (its size moved) is read again, alone
  const grown = Object.keys(disk).find(old) ?? ''
  disk[grown] = `${disk[grown] ?? ''}${disk[grown] ?? ''}`
  await ui.press({ key: 'tab-costs' })
  expect(n.read.filter(old)).toEqual([...n.read.filter(old).slice(0, 3), grown])
  await ui.unmount()
  ```

  Przed zmianą czerwony: `Expected: 3`, `Received: 6` (prototyp 2026-11-09). Po turze odczytów
  pomiarów innych niż plik bieżącej sesji jest zero; plik bieżącej sesji kolektor trzyma w pamięci.
- **Weryfikacja:** `"$CLAUDE_CODE_EXECPATH" plugin test panel` → ` 217 pass`, ` 0 fail`;
  `plugin validate panel` → „✔ Validation passed”.
- **Nie ruszasz:** zapisu kolektora (`writeOne`, `withCorrections` — F7); `tab-data.ts`, `memo.ts`,
  `pane-io.ts`; pamięci zakładek `remember`; F6, F8; C1, C8; manifestów.
- **Pułapki:**
  - P-023 pkt 10: `othersFrom` nie dostaje `$`, tylko gotową funkcję odczytu zamkniętą nad `$`
    w `register.tsx` — jak `ioOf` (`register.tsx:100`).
  - P-020 pkt 1: pliki pomiarów pisze się w całości, nie dopisuje; rozmiar i czas zmieniają się przy
    każdym zapisie, więc klucz z listy wystarcza.
  - P-023 pkt 6: przeładowanie modu zeruje pamięć — pierwsza zakładka po przeładowaniu czyta wszystko.
  - Atrapa `fs.list` w `redraw.test.ts` podaje stały `mtimeMs` i rozmiar z treści — kontrola
    pozytywna zmienia rozmiar (podwaja treść), nie czas.
- **Gotowe, gdy:** nowy test był czerwony i jest zielony; 216 dawnych zielone. Mody zmienione tą
  kartą: `relai-panel`.
