# PROMPT_ETAP_13 — Mody: każdy niesie tylko pliki rdzenia, które importuje; F4 i F5 zapisane w dzienniku

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E13 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E12) • Wykonawca: **Codex gpt-6.1-terra (effort high), poprawki gpt-6.1-sol; orkiestracja, uruchomienie narzędzia synchronizacji, testy, `docs/`, bramka manualna z człowiekiem i rytuał — Opus 5.5 w Claude Code** (Aneks A, [ANEKS_A_WYKONANIE_CODEX.md](ANEKS_A_WYKONANIE_CODEX.md)) — `/effort medium` dla sesji Claude

> **Kontrola modelu:** pracę wykonawczą (kod `sync-panel-core.js` i testy z karty K-G2) robi model
> klasy **balanced** w Codeksie: **gpt-6.1-terra** (lista modeli codex z dnia `2026-11-10`),
> uruchamiany przez Claude poleceniem `node core/process/crew.js run --runtime codex --role coder
> --write --model gpt-6.1-terra` z repozytorium (nie kopią `.claude/relai/tools/crew.js` — ryzyko
> AX1). Sesja Claude, która czyta ten prompt, musi działać na **Opus 5.5** (orkiestrator); inny
> model → zatrzymaj się i poproś o przełączenie. Zalecany poziom `/effort` sesji Claude: `medium`
> (karta niesie gotowy kod, testy i kotwice; praca to wierna realizacja, recenzja i uruchomienia).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, tabela ryzyk, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/ANEKS_A_WYKONANIE_CODEX.md` — sekcje 4, 6 i 7 | przepływ etapu w Codeksie, nakładka 4.1, ryzyka AX1–AX7; sekcja 7: testy modów uruchamia Claude |
| `docs/LEKCJE.md` — wpisy L-0116, L-0119, L-0313, L-0316, L-0317 | L-0116/L-0119: wyrażenie z backslashem tylko edycją pliku i kontrolą pozytywną; L-0313: import nazwy, której jeszcze nie ma; L-0316: dwa przebiegi i granice Codeksa; L-0317: końce linii w pliku zadania |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 11 i 13 | 3: dowód negatywny (kasowane wyłącznie znane nazwy, obcy plik zostaje); 4: dowód efektem — liczby plików i bajtów przed i po; 5: instrument (wyrażenie `SPEC`, porównanie drzew); 11: końce linii (`lf()`); 13: API modów („early access”) z wydanego builda i z próby |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — sekcje 2, 4, 5, 6, 7 | kolejność pracy na karcie, testy modów binarką sesji, kopie generowane, rzeczy zaskakujące, granice |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E13_MODY_RDZEN_I_KOPIE.md` — całość | **zakres etapu**: K-G2 z kodem, testami i bramką manualną; K-F4 i K-F5 — po jednym zdaniu do dziennika |
| `docs/PULAPKI.md` — punkty P-017, P-023, P-024, P-036, P-052, P-053 | pułapki API modów i testów, na które karta się powołuje |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E13 w sekcji 6 (Grep `E13_MODY` z kontekstem 6 linii) | cel etapu słowami planu |
| `docs/DZIENNIK.md` — ostatni wpis (E12) | punkt wyjścia: liczby testów modów, przebiegi Codeksa, rozjazdy, odłożone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od 2026-11-09 (D-33). Kotwica nie pasuje, test „najpierw” zielony
  przed zmianą, istniejący test czerwony po zmianie bez nazwania w karcie, `--check` po K-G2
  z jakimkolwiek problemem, `plugin validate` bez „✔ Validation passed” albo brak paska lub komendy
  w bramce manualnej → zatrzymujesz się i pytasz; karty nie poprawiasz.
- **K-G2: graf importów liczony przy każdym uruchomieniu, nie jawna lista per mod** (rozstrzygnięcie
  karty). Korzenie — wszystkie własne pliki `.ts`/`.tsx` modu pod `hooks/` poza katalogiem kopii,
  także testy. Kasowane wyłącznie pliki `.mjs` o nazwie z `core/panel/` albo `icons.mjs`; obcy plik
  zostaje i `--check` go zgłasza.
- **K-F4:** `core/panel/cache-timer.mjs` i jego test **zostają** do decyzji o planie PANEL_CODEX
  (decyzja właściciela 2026-11-09) — zero zmian w kodzie, jedno zdanie do dziennika.
- **K-F5:** podział plików `register.tsx` **wyjęty z planu** (decyzja właściciela 2026-11-09) — zero
  zmian, jedno zdanie do dziennika.
- **Wykonanie wg Aneksu A i L-0316 — dwa przebiegi Codeksa:**
  - **Przebieg 1 Codeksa:** wyłącznie testy z karty K-G2 w `core/panel/tests/sync.test.js` — pomoc
    `fixture` i `uses` na górze pliku, cztery istniejące testy ze zmienioną fiksturą (punkt 2 „Test
    najpierw”, asercje bez zmian), dwa nowe testy (punkty 3 i 4) → Claude czyta diff testów
    w całości (AX2) i uruchamia `node --test "core/panel/tests/*.test.*"`: dwa nowe czerwone
    z asercji, cztery zmienione i pozostałe zielone (225 dawnych).
  - **Przebieg 2 Codeksa:** K-G2 kroki 1–4 w `core/tools/sync-panel-core.js` — **bez zmiany testów**.
    Krok 5 (uruchomienie `node core/tools/sync-panel-core.js`, które kasuje 45 kopii) robi
    **Claude** po przebiegu 2: sandbox Codeksa i tak nie uruchomi procesów potomnych, a kasowanie
    plików ma być widoczne w bramce Claude.
  - Plik zadania = ten prompt + nakładka 4.1 z dopiskami: Codex **nie uruchamia** testów, narzędzia
    synchronizacji ani `plugin test` / `plugin validate` (sandbox na Windows: `spawn EPERM`; testy
    modów wymagają binarki Claude Code) — to nie jest `STOP`; niczego pod `docs/` nie edytuje.
    Wyrażenie `SPEC` Codex wpisuje edycją pliku (L-0116).
  - **Końce linii (L-0317):** przed każdym przebiegiem `git ls-files --eol` plików z `--files`;
    `w/crlf` przy `i/lf` → normalizacja do LF **przed** przebiegiem. Plik zadania mówi wyłącznie
    „repozytorium trzyma LF”.
  - Effort: `crew.js` przekazuje tylko `-m`; Codex bierze `model_reasoning_effort` z
    `~/.codex/config.toml` (FAKT 2026-11-10 przed E12: `"high"`). Przed przebiegiem odczytaj go
    jeszcze raz; inna wartość → powiedz o tym w karcie startu.
- `--files` przebiegu 1 = `core/panel/tests/sync.test.js` i katalog roboczy etapu; przebiegu 2 =
  `core/tools/sync-panel-core.js` i katalog roboczy.
- **Wersji modów ani pluginu `relai` nie podbijasz** (`plugin.json`, `marketplace.json`) — robi to E14
  z list pól „Gotowe, gdy”. Nie ruszasz: `release-checks.js`, `release-check.test.js`,
  `release-fixture.js`, `build-panel-headings.js`, `headings.mjs`, `mods-parity.test.js`, skilli
  adapterów (D-89), `core/panel/cache-timer.mjs` i jego testu, `cache-keeper/hooks/core.ts`,
  żadnego `register.tsx`. Podział `headings.mjs` — świadomie poza kartą (zdanie do dziennika).
  Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, tagów i numerów wersji — liczebniki
  i wydanie to E14.

## Stan wyjściowy (co realnie zastajesz po E12)

RelAI 3.7.0 zainstalowany; gałąź `optymalizacja/po-audycie` z commitami E1–E11 i — jeśli człowiek go
przyjął — commitem E12 (`git log --oneline -3`; brak commita E12 → zmiany E12 leżą w drzewie,
zostawiasz je i pytasz, zanim zaczniesz). E12 zmienił w modach wyłącznie `register.tsx` trzech
modów, `mods/hooks/inventory.ts`, nowy `panel/hooks/records-memo.ts` i cztery pliki testów —
**katalogów kopii rdzenia ani `core/` nie dotknął** (`git diff --stat main...HEAD --
core/tools/sync-panel-core.js core/panel` → pusty, FAKT 2026-11-10 po E12). W sesji działają
zainstalowane mody (`relai-panel` 0.22.1, `relai-progress` 0.7.1, `relai-mods` 0.3.0,
`relai-cache-keeper` 0.13.0) — kod z gałęzi widać wyłącznie w testach i w bramce manualnej
z `--plugin-dir`.

Kotwice sprawdzone 2026-11-10 po E12 (FAKT):

```
core/tools/sync-panel-core.js (108 linii)
  l. 33  const dests = () => PLUGINS.filter(([p]) => fs.existsSync(path.join(ROOT, p))).map(([, d]) => d);
  l. 59  function checkOne(rel, want, icons) {
  l. 73  const own = icons === null ? want : [...want, ICONS_MODULE];
  l. 92  for (const n of sources()) fs.copyFileSync(path.join(SRC, n), path.join(DST, n));
core/panel/tests/sync.test.js (120 linii)
  l. 16  test('panel/hooks/core matches core/panel'
  l. 22  test('a changed copy, a missing copy and an orphan copy are reported (planted defect)'
  l. 49  test('the icons module follows the icon files: a changed icon is reported (planted defect)'
  l. 79  test('every plugin that carries the core is checked: a stale copy in progress/ is reported (planted defect)'
  l. 101 test('relai-mods carries the core too: mods/hooks/core is written and checked (plan RELAI_MODS, Annex B)'
core/tools/release-checks.js l. 686  /(\d+) plikow core\/panel/ - liczy zrodla, nie kopie
katalogi kopii: panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai, mods/hooks/core
  kazdy 21 plikow .mjs, 570 213 B (razem 2 280 852 B)
node core/tools/sync-panel-core.js --check -> kod 0:
  [sync-panel-core] zgodne: 20 plikow core/panel i 16 ikon -> panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai, mods/hooks/core
binarka sesji: $CLAUDE_CODE_EXECPATH (claude-code 2.1.321 w dniu generacji - sprawdz ponownie)
```

Testy (Claude, z korzenia repozytorium): `"$CLAUDE_CODE_EXECPATH" plugin test <mod>` — stan po E12
(FAKT, wpis dziennika E12): **mods 91, panel 217, progress 51, cache-keeper 206** (565);
`node --test "core/panel/tests/*.test.*"` → **225**; `node --test "core/process/tests/*.test.*"` →
**430**. Po etapie: `core/panel` **227** (+2 z K-G2), mody bez zmian liczby (etap nie dokłada testów
modów, ale każdy mod traci kopie — liczby muszą się utrzymać).

**Czego jeszcze nie ma:** grafu importów w `sync-panel-core.js` (`SPEC`, `toDir`, `specsOf`,
`coreName`, `ownFiles`, `wanted`, `present`), kasowania kopii nadmiarowych i zgłoszeń „kopia
nadmiarowa” / „nie ma zrodla” w `--check`; pomocy `fixture`/`uses` i dwóch nowych testów
w `sync.test.js`; okrojonych katalogów kopii (16 / 13 / 8 / 2 pliki); zdań F4, F5 i „podział
`headings.mjs`” w dzienniku.

**Znane pułapki:**
- Test „panel/hooks/core matches core/panel” (l. 16) robi się czerwony po przebiegu 2 i zielony
  dopiero po kroku 5 (uruchomienie narzędzia) — to oczekiwane wg karty, nie `STOP`.
- Bramka E12 pokazała, że `claude --plugin-dir .\mods` zostawia nieśledzony `mods/tsconfig.json`
  (w `.gitignore` stoją tylko `panel/` i `progress/`) — po bramce E13 sprawdź `git status` i usuń
  go jako artefakt bramki (wpis z nazwy). Dopisanie do `.gitignore` jest poza kartą.
- Kasowanie 45 plików kopii widać w `git status --short` jako 45 wierszy `D` — to zakres karty,
  nie odchylenie.

**Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 3, 4, 5, 11, 13.
**Ryzyka etapu:** C1 i C8 (API modów, pasek nad promptem — wiersze w tabeli skrótu startu); AX1–AX7
z Aneksu A, sekcja 6.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E13/`.** Wszystko
> tymczasowe — pliki zadań dla Codeksa, przebiegi czerwone i zielone, wyjścia `plugin test`,
> `plugin validate` i `--check` — powstaje tam. Artefakt, który z natury musi leżeć **poza**
> projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od slugu projektu. Przebiegi `crew.js` zapisują się
> w `.claude/relai/work/CREW/<data_czas>/` — liczysz je razem z katalogiem etapu.

1. **Przebiegi przed zmianą (Claude)** — `plugin test` czterech modów (91 / 217 / 51 / 206),
   `node --test "core/panel/tests/*.test.*"` (225), `--check` (kod 0) i liczby kopii (4 × 21 plików,
   570 213 B) do wpisu.
2. **Plik zadania i przebieg 1 (Claude → Codex)** — `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E13/zadanie-1.md`
   = nakładka 4.1 z dopiskami + ten prompt. Codex pisze w `core/panel/tests/sync.test.js` pomoc
   `fixture`/`uses`, zmienia fiksturę czterech testów z punktu 2 „Test najpierw” i dodaje dwa nowe
   (punkty 3, 4). Claude czyta diff testów w całości i uruchamia `core/panel` na czerwono: dwa nowe
   czerwone z asercji, 225 dawnych zielonych.
3. **Przebieg 2 (Codex)** — K-G2 kroki 1–4 w `core/tools/sync-panel-core.js` (nagłówek, `present`,
   `SPEC`, funkcje grafu, `checkOne`/`check`/`sync`), bez zmiany testów; blok `require.main`
   i linia „zgodne: …” bez zmian.
4. **Krok 5 karty (Claude)** — `node core/tools/sync-panel-core.js`, potem `--check`; liczby
   i listy kopii porównane z tabelą „Oczekiwany wynik” karty (16 / 13 / 8 / 2 pliki,
   501 326 / 499 604 / 143 755 / 313 649 B, razem 1 458 334 B).
5. **Testy po zmianie (Claude)** — `core/panel` (227), `plugin test` czterech modów, `plugin
   validate` czterech, przebieg kontrolny `core/process` w tle.
6. **K-F4 i K-F5 (Claude)** — bez zmian w kodzie; sprawdzenie z pól „Weryfikacja” obu kart i trzy
   zdania do „Świadomie odłożone” wpisu dziennika (F4, F5, podział `headings.mjs`).
7. **Bramka manualna (człowiek, Claude prowadzi)** — kroki 1–7 z sekcji „Bramka manualna” karty E13:
   polecenia PowerShell z karty dosłownie (okno ≥ 110 kolumn, `--settings` z czterema wyłączonymi
   modami, cztery `--plugin-dir`); Claude czeka na opis kroków 3–6 i wpisuje go do dziennika. Inny
   widok niż oczekiwany → etap się zatrzymuje. `%TEMP%/relai-e13-settings.json` kasuje człowiek
   w kroku 7 — wpis wymienia go z nazwy; `mods/tsconfig.json` po bramce — jak w „Znanych pułapkach”.
8. **Rejestr** — nie dotyczy: narzędzie i testy to kod wykonawczy, kopie są generowane;
   `docs/ARTEFAKTY.md` bez zmian.
9. **Git.** Bez `push`. Jeden commit etapu (`perf:` po angielsku, conventional), proponowany
   w rytuale „Na koniec”.

Wyrażenia regularne i ścieżki z backslashem — wyłącznie edycją pliku (Edit/Write w Claude, edycja
pliku w Codeksie; nigdy `sed` ani `node -e`). Wątek spoza kart → zatrzymujesz się i pytasz: odnoga,
aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_13.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E12 (albo człowiek rozstrzygnął, co z drzewem).
- [ ] Przed zmianą: `plugin test` → mods 91, panel 217, progress 51, cache-keeper 206, wszystkie
      ` 0 fail`; `core/panel` → 225 pass; `--check` → kod 0; każdy katalog kopii 21 plików
      (inna liczba → zatrzymujesz się i pytasz).
- [ ] Testy przed zmianą narzędzia (przebieg zapisany w katalogu roboczym, diff testów przeczytany
      w całości i zgodny z kartą — asercje dawnych testów nietknięte): `core/panel` → 2 czerwone
      z asercji (nowe testy K-G2), 225 zielonych.
- [ ] Po kroku 5: `node core/tools/sync-panel-core.js --check` → kod 0 i linia
      `[sync-panel-core] zgodne: 20 plikow core/panel i 16 ikon -> panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai, mods/hooks/core`.
- [ ] Dowód efektu (zasada 4): katalogi kopii mają 16 / 13 / 8 / 2 pliki o listach z tabeli karty,
      razem 1 458 334 B (było 2 280 852 B); `git status --short` → 45 wierszy `D` w czterech
      katalogach kopii.
- [ ] `node --test "core/panel/tests/*.test.*"` → 227 pass, 0 fail; `node --test
      "core/process/tests/*.test.*"` → 430 pass, 0 fail (bez zmian).
- [ ] Po zmianie: `plugin test mods` → ` 91 pass`; `panel` → ` 217 pass`; `progress` → ` 51 pass`;
      `cache-keeper` → ` 206 pass`, wszystkie ` 0 fail`; cztery `plugin validate` → „✔ Validation
      passed”.
- [ ] Dowód negatywny (zasada 3): K-F4 — `core/panel/cache-timer.mjs` i
      `core/panel/tests/cache-timer.test.js` istnieją, żadna z czterech kopii `cache-timer.mjs` nie
      istnieje; `git diff --stat` dla `core/tools/release-checks.js`, `release-check.test.js`,
      `release-fixture.js`, `build-panel-headings.js`, `core/panel/headings.mjs`,
      `mods-parity.test.js`, `cache-keeper/hooks/core.ts` i wszystkich `*/hooks/register.tsx` →
      pusty; manifesty bez zmian (`git diff --stat -- "*/plugin.json" "*marketplace.json"` → pusty).
- [ ] Bramka manualna (karta E13, kroki 1–7): człowiek opisał kroki 3–6 — pasek cache i pasek planu
      nad promptem po `ok`, `/cache` zaczyna się od „relai-cache-keeper: kontekst”, pięć zakładek
      `/relai-panel` rysuje treść bez „⚠ Panel nie narysował tej zakładki”, `/relai-agents` otwiera
      panel, `/relai-mods` pokazuje grupy i nagłówek „N/M włączone · …”. Opis do wpisu dziennika.
- [ ] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec wpisu E12
      (zastane: 0 CRITICAL, 42 HIGH); etap nie dodaje zależności (`git diff --stat --
      "*package.json" "*lock*"` → pusty). Zapas bez Trivy: `npm audit --omit=dev` w katalogu
      każdego śledzonego `package.json`, wynik do wpisu. Narzędzie kasuje wyłącznie w katalogach
      kopii: test 4 karty (obcy `own.mjs` zostaje) zielony.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie `core/tools/sync-panel-core.js`,
      `core/panel/tests/sync.test.js`, 45 usuniętych kopii i dokumenty rytuału (`STATUS.md`,
      `PROMPT_ETAP_13.md`, `PROMPT_ETAP_14.md`, `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`).
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów i kopii przed
      i po, liczbą przebiegów Codeksa (cel aneksu: 2, poprawek 0), wynikiem bramki manualnej,
      zdaniami F4, F5 i „podział `headings.mjs`”, listą do podbicia w E14 (`relai-panel`,
      `relai-progress`, `relai-cache-keeper`, `relai-mods`, plugin `relai`) i podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E13/` i przebiegi
      `.claude/relai/work/CREW/` tego etapu przejrzane (`node .claude/relai/tools/clean-work.js
      raport`; katalog otwartego etapu raport pomija — wtedy liczby z `find`/`du`) i skasowane po
      „tak”, liczby przed i po we wpisie dziennika; (b) artefakty spoza katalogu wypisane z nazwy
      razem z tym, co się z nimi stało (`%TEMP%/relai-e13-settings.json`, `mods/tsconfig.json`
      z bramki manualnej).

Najtwardszy punkt to bramka manualna: brak pliku rdzenia, którego mod potrzebuje, wychodzi na żywo
jako moduł, który się nie ładuje — znikają paski i komendy. Testy modów to łapią, ale tylko dla
importów, które testy ładują. Brak paska albo „Unknown command” → zatrzymujesz się i pytasz, zamiast
zamykać etap na samych testach.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E13 → `ZREALIZOWANY <data>`, E14 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E13 rozpoczęty”); link
   w kolumnie `Prompt` przy E14 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E13/` i przebiegi `CREW` etapu —
   raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, `%TEMP%/relai-e13-settings.json`
   i `mods/tsconfig.json` z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (testy przed i po, kopie przed i po, bramka manualna) / Świadomie odłożone (F4, F5, podział
   `headings.mjs`, `mods/tsconfig.json` poza `.gitignore` — jeśli nadal) / Do zrobienia przez
   człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę „Stan otwartych ryzyk”
   (C1, C8); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka”
   tego wpisu dostaje linię `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu (E13 zrealizowany; kopie rdzenia; E14 gotowy). Tabeli
   „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_14.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E14 w sekcji 6 `PLAN.html`, z `karty/E14_CI_I_WYDANIE.md`
   (aneks D-40; jedyne wydanie planu; wykonawca E14 wg Aneksu A: **Opus 5.5**, bez Codeksa),
   z realnego stanu repozytorium po tym etapie, z list modów do podbicia z wpisów E12 i E13
   i z lekcji tego etapu; numery zasad do doczytania, bez odpisu. E14 jest ostatnim etapem —
   jego „Na koniec” zastępuje generację promptu sekwencją zamknięcia planu (`plan-closing.md`),
   a otwarte bramki manualne `STATUS.md` muszą być rozstrzygnięte przed zamknięciem.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
