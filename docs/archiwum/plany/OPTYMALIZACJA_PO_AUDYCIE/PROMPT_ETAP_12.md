# PROMPT_ETAP_12 — Mody: komunikat zamiast pustego panelu, kokpit z pamięci, Koszty bez ponownego czytania zamkniętych sesji

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E12 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E11) • Wykonawca: **Codex gpt-6.1-terra (effort high), poprawki gpt-6.1-sol; orkiestracja, testy modów, `docs/`, rejestr, bramka manualna z człowiekiem i rytuał — Opus 5.5 w Claude Code** (Aneks A, [ANEKS_A_WYKONANIE_CODEX.md](ANEKS_A_WYKONANIE_CODEX.md)) — `/effort medium` dla sesji Claude

> **Kontrola modelu:** pracę wykonawczą (kod modów i testy z kart) robi model klasy **balanced**
> w Codeksie: **gpt-6.1-terra** (lista modeli codex z dnia `2026-11-10`), uruchamiany przez Claude
> poleceniem `node core/process/crew.js run --runtime codex --role coder --write --model gpt-6.1-terra`
> z repozytorium (nie kopią `.claude/relai/tools/crew.js` — ryzyko AX1). Sesja Claude, która czyta
> ten prompt, musi działać na **Opus 5.5** (orkiestrator); inny model → zatrzymaj się i poproś
> o przełączenie. Zalecany poziom `/effort` sesji Claude: `medium` (karty niosą gotowy kod, testy
> i kotwice; praca to wierna realizacja, recenzja i uruchomienie testów modów binarką sesji).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, tabela ryzyk, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/ANEKS_A_WYKONANIE_CODEX.md` — sekcje 4 i 7 | przepływ etapu w Codeksie, nakładka 4.1; sekcja 7: testy modów (`plugin test`) uruchamia Claude, nie Codex |
| `docs/LEKCJE.md` — wpisy L-0313, L-0316 i L-0317 | L-0313: test importujący nazwę, której jeszcze nie ma; L-0316: dwa przebiegi i granice Codeksa; L-0317: końce linii w pliku zadania |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 i 15 | 3: dowód negatywny (zero odczytów dysku); 4: dowód efektem — liczniki `$.fs` przed i po; 5: instrument (atrapa `fs.stat`, licznik); 13: API modów („early access”) poznajesz z wydanego builda i z próby; 15: praca nad wyglądem panelu i komunikaty |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — sekcje 2, 4, 6, 7 | kolejność pracy na karcie, testy modów binarką sesji, rzeczy zaskakujące, granice |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E12_MODY_ODPORNOSC.md` — całość | **zakres etapu**: trzy karty (K-F3, K-F1, K-F2) z kodem, testami i bramką manualną |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/USTALENIA_ROBOCZE.md` — sekcja 1 | liczby testów modów na `main` i ograniczenia silnika testów |
| `docs/PULAPKI.md` — punkty P-017, P-018, P-021, P-023, P-042, P-044, P-052, P-053 | pułapki API modów, na które karty się powołują |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E12 w sekcji 6 (Grep `E12_MODY` z kontekstem 6 linii) | cel etapu słowami planu |
| `docs/DZIENNIK.md` — ostatni wpis (E11) | punkt wyjścia: liczby testów, przebiegi Codeksa, odłożone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od 2026-11-09 (D-33). Kotwica nie pasuje, test „najpierw” zielony
  przed zmianą, istniejący test modu czerwony po zmianie bez nazwania w karcie, `plugin validate`
  bez „✔ Validation passed” albo pusty panel w bramce manualnej → zatrzymujesz się i pytasz; karty
  nie poprawiasz.
- Kolejność kart: **K-F3 → K-F1 → K-F2** (K-F3 i K-F1 zmieniają ten sam `mods/hooks/register.tsx`);
  commit jeden na etap.
- **Wykonanie wg Aneksu A i L-0316 — dwa przebiegi Codeksa, podział pracy:**
  - **Przebieg 1 Codeksa:** wyłącznie testy z kart, dosłownie — K-F3: przypadek w
    `mods/hooks/mods.test.tsx` (`describe('cockpit', …)`) i w `progress/hooks/progress.test.ts`
    (`describe('the agents pane', …)`); K-F1: zmiana atrapy `Fake` w `mods.test.tsx` (licznik `n`,
    `fs.stat` z czasem idącym za treścią — jedyna nazwana w karcie zmiana istniejącego kodu testu),
    przypadek w `mods/hooks/inventory.test.ts` i dwa w `mods.test.tsx`; K-F2: przypadek
    w `panel/hooks/redraw.test.ts` → Claude czyta diff testów w całości (AX2) i uruchamia je na
    czerwono binarką sesji.
  - **Przebieg 2 Codeksa:** K-F3 kroki 2–3, K-F1 kroki 1–4, K-F2 kroki 1–3 — **bez zmiany testów**
    → Claude uruchamia `plugin test` czterech modów i `plugin validate` trzech zmienionych, potem
    bramka manualna z człowiekiem.
  - Plik zadania = ten prompt + nakładka 4.1 z dopiskami: Codex **nie uruchamia** testów ani
    `plugin test` / `plugin validate` (sandbox Codeksa na Windows: `spawn EPERM`, a testy modów
    wymagają binarki Claude Code) — to nie jest `STOP`; niczego pod `docs/` nie edytuje.
  - **Końce linii (L-0317):** przed każdym przebiegiem `git ls-files --eol` plików z `--files`;
    `w/crlf` przy `i/lf` → normalizacja do LF **przed** przebiegiem. FAKT 2026-11-10: wszystkie
    osiem plików kart E12 ma `i/lf w/lf`. Plik zadania mówi wyłącznie „repozytorium trzyma LF”.
  - Effort: `crew.js` przekazuje tylko `-m`; Codex bierze `model_reasoning_effort = "high"`
    z `~/.codex/config.toml` (FAKT 2026-11-10). Przed przebiegiem odczytaj go jeszcze raz; inna
    wartość → powiedz o tym w karcie startu.
- `--files` przebiegu = pola „Pliki” kart K-F3, K-F1, K-F2 (osiem plików, w tym nowy
  `panel/hooks/records-memo.ts`) oraz katalog roboczy etapu.
- **Wersji modów nie podbijasz** (`plugin.json` modów, `marketplace.json`) — robi to E14 z listy pól
  „Gotowe, gdy”: `relai-progress`, `relai-mods`, `relai-panel`. `core/panel/` i
  `sync-panel-core.js` nie są w zakresie. `cache-keeper/` nie zmienia się — jego testy idą jako
  kontrola „bez zmian”.
- Retencja plików pomiarów (raport F2, „Kierunek”), F6, F7, F8, ryzyka C1 i C8, `views.tsx`,
  `pane-agents.tsx`, `look.ts`, `cockpit.ts`, `tab-data.ts`, `memo.ts`, `pane-io.ts`, handlery
  `AbovePrompt` — poza zakresem. Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`,
  tagów i numerów wersji aż do E14 (rdzeń i mody: K-G2 w E13, liczebniki i wydanie w E14).

## Stan wyjściowy (co realnie zastajesz po E11)

RelAI 3.7.0 zainstalowany; gałąź `optymalizacja/po-audycie` z commitami E1–E10, aneksu A, decyzji
o effortcie i — jeśli człowiek go przyjął — commitem E11 (`git log --oneline -3`; brak commita E11
→ zmiany E11 leżą w drzewie, zostawiasz je i pytasz, zanim zaczniesz). **Etapy E1–E11 nie dotknęły
modów:** `git diff --stat main...HEAD -- mods panel progress cache-keeper core/panel` → pusty (FAKT
2026-11-10), więc numery linii w karcie E12 (liczone na `main @ 5aeab39`) zgadzają się z plikami.
W sesji działają zainstalowane mody (`relai-panel` 0.22.1, `relai-progress` 0.7.1, `relai-mods`
0.3.0) — kod z gałęzi widać wyłącznie w testach i w bramce manualnej z `--plugin-dir`.

Kotwice sprawdzone grepem 2026-11-10 po E11 (FAKT):

```
progress/hooks/register.tsx (430 linii)
  l. 26   import { BAND, BAR, BAR_LOOK } from './core/theme.mjs'
  l. 364  on('ui.render', { component: 'Pane', requestId: PANE_ID }, async ($, e) => {   - bez .catch
mods/hooks/register.tsx (359 linii)
  l. 24   import { cockpit, mobileList } from './views'
  l. 212  await update($, queue, (q) => finish(q, taken)).catch(() => undefined)        - press, finally
  l. 257  refresher = $.clock.every(REFRESH_MS, () => {
  l. 271  const opened = await $.ui.open({ id: PANE_ID, title: PANE_TITLE })             - togglePane
  l. 280  const [inv, cwd, scope] = await Promise.all([readInventory($), cwdOf($), readScope($)])  - takeSnapshot
  l. 321  on('ui.render', { component: 'Pane', requestId: PANE_ID }, ...)               - bez .catch
  l. 323  const inv = await readInventory($)
  l. 328-331  Promise.all z readScope($) i read($, tick)
  l. 357  return base.isFull && treeWeight(full) > DRAW_LIMIT ? cockpit({ ...base, isFull: false }) : full
mods/hooks/inventory.ts       l. 185 export function settingsFilesOf(...)               - watchedPaths NIE ISTNIEJE
panel/hooks/register.tsx (1104 linii)
  l. 53   import { bump, epochNow, forget, remember } from './memo'
  l. 238  return { current, others: await Promise.all(others.map(async (x) => parseRecords(...
  l. 796  forgetPlan()                                                                    - session.start
  l. 948  }).catch(async ($, e, next) => {                                                - wzor K-F3
panel/hooks/records-memo.ts   NIE ISTNIEJE (zaklada K-F2)
testy: progress.test.ts l. 628 describe('the agents pane'; mods.test.tsx l. 172 describe('cockpit';
       redraw.test.ts l. 295 describe('the panel during a turn (Z4)'; inventory.test.ts l. 263
       describe('inventory — paths (R6)'
binarka sesji: $CLAUDE_CODE_EXECPATH (claude-code 2.1.321 w dniu generacji - sprawdz ponownie)
```

Testy modów (konwencje sekcja 4, karta „Jak testować mody”) uruchamia **Claude**, z korzenia
repozytorium, binarką sesji: `"$CLAUDE_CODE_EXECPATH" plugin test <mod>`. Stan wyjściowy: mods 87,
panel 216, progress 50, cache-keeper 206 (FAKT z `main`, wpis E4 planu PANEL_CLAUDE i
`USTALENIA_ROBOCZE.md` §1 — potwierdź pierwszym przebiegiem przed zmianą). Po etapie: **mods 91,
panel 217, progress 51, cache-keeper 206** (+6). `node --test "core/panel/tests/*.test.*"` → 225 bez
zmian; `core/process` 430 bez zmian (etap go nie dotyka — przebieg kontrolny w tle).

**Czego jeszcze nie ma:** gałęzi `.catch` w rysowaniu panelu agentów i kokpitu; pamięci kokpitu
(`watchedPaths`, `readDisk`, `stampOf`, `forgetDisk`) i jej unieważnień; `records-memo.ts`
z `othersFrom` i `forgetRecords`; sześciu testów z kart; licznika `n` i czasu idącego za treścią
w atrapie `Fake` kokpitu.

**Znana pułapka przebiegu 1 (L-0313):** test `inventory.test.ts` z K-F1 importuje `watchedPaths`,
której przed zmianą nie ma. Gdy plik testów nie załaduje się w całości (błąd importu zamiast
czerwieni z asercji, a pozostałe testy pliku też padną) — to nie jest „czerwony z właściwego
powodu”: zatrzymujesz się i pytasz człowieka (nazwany wyjątek dla tego jednego przypadku albo
przypadek przeniesiony do przebiegu 2 razem z eksportem), zanim puścisz przebieg 2.

**Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 3, 4, 5, 13, 15.
**Ryzyka etapu:** C1 i C8 (API modów, pasek nad promptem — wiersze w tabeli skrótu startu); AX1–AX4
z Aneksu A, sekcja 6.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E12/`.** Wszystko
> tymczasowe — pliki zadań dla Codeksa, przebiegi czerwone i zielone, wyjścia `plugin test`
> i `plugin validate` — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem
> (`%TEMP%`, katalog domowy, klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**,
> a jego nazwę zaczynasz od slugu projektu. Przebiegi `crew.js` zapisują się w
> `.claude/relai/work/CREW/<data_czas>/` — liczysz je razem z katalogiem etapu.

1. **Przebiegi przed zmianą (Claude)** — `plugin test` czterech modów na stanie wyjściowym (liczby
   87 / 216 / 50 / 206 do wpisu) i `plugin validate` `mods`, `progress`, `panel` (lista kluczy stanu
   `state writes` / `state reads` z raportu `mods` zapisana do porównania z K-F1).
2. **Plik zadania i przebieg 1 (Claude → Codex)** — `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E12/zadanie-1.md`
   = nakładka 4.1 z dopiskami + ten prompt. Codex pisze testy z pól „Test najpierw” trzech kart
   (sześć przypadków + atrapa `Fake`) w `mods/hooks/mods.test.tsx`, `mods/hooks/inventory.test.ts`,
   `progress/hooks/progress.test.ts`, `panel/hooks/redraw.test.ts`. Claude czyta diff testów
   w całości i uruchamia `plugin test` na czerwono: K-F3 dwa czerwone z `HooksError: no
   implementation for ui.render` (właściwy powód wg karty); K-F1 trzy czerwone (liczniki
   odczytów); K-F2 jeden czerwony (`Expected: 3`, `Received: 6`); wszystkie dawne zielone —
   także po zmianie atrapy `Fake`.
3. **Przebieg 2 (Codex)** — K-F3 w `progress/hooks/register.tsx` i `mods/hooks/register.tsx`
   (`.catch` z komunikatem, bez odczytów); K-F1 w `mods/hooks/inventory.ts` (`watchedPaths`)
   i `mods/hooks/register.tsx` (pamięć `disk`, `readDisk`, `stampOf`, `forgetDisk`, trzy
   unieważnienia; `runOne` i `runScope` bez zmian); K-F2: nowy `panel/hooks/records-memo.ts`,
   `panel/hooks/register.tsx` (import, `othersFrom` w `projectRecords`, `forgetRecords()` pod
   `forgetPlan()`). Funkcje z `$` tylko w `register.tsx` (P-023 pkt 10).
4. **Testy po zmianie (Claude)** — `plugin test` czterech modów, `plugin validate` trzech
   zmienionych, `core/panel` i przebieg kontrolny `core/process` w tle.
5. **Bramka manualna (człowiek, Claude prowadzi)** — kroki 1–7 z sekcji „Bramka manualna” karty
   E12: Claude podaje Łukaszowi polecenia PowerShell z karty dosłownie (okno ≥ 110 kolumn,
   `--settings` z wyłączonymi zainstalowanymi modami, trzy `--plugin-dir`), czeka na opis kroków
   3–6 i wpisuje go do dziennika. Inny widok niż oczekiwany → etap się zatrzymuje. Plik
   `%TEMP%/relai-e12-settings.json` kasuje człowiek w kroku 7 — wpis wymienia go z nazwy.
6. **Rejestr** — nie dotyczy: hooki modów i testy to kod wykonawczy, nie artefakty (rejestr:
   „Hooki … kod wykonawczy”); `docs/ARTEFAKTY.md` bez zmian. Gdyby etap dotknął pliku `.md` modu
   (np. README) — tego karty nie przewidują → sygnał odchylenia.
7. **Git.** Bez `push`. Jeden commit etapu (`perf:` albo `fix:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Wyrażenia regularne i ścieżki z backslashem — wyłącznie edycją pliku (Edit/Write w Claude, edycja
pliku w Codeksie; nigdy `sed` ani `node -e`). Wątek spoza kart → zatrzymujesz się i pytasz: odnoga,
aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_12.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E11 (albo człowiek rozstrzygnął, co z drzewem).
- [x] Przed zmianą: `"$CLAUDE_CODE_EXECPATH" plugin test` → mods 87, panel 216, progress 50,
      cache-keeper 206, wszystkie ` 0 fail` (inna liczba → zatrzymujesz się i pytasz).
- [x] Testy przed zmianą (przebieg zapisany w katalogu roboczym, diff testów przeczytany w całości
      i zgodny z kartami): mods — 3 nowe czerwone z asercji albo z `HooksError` wg karty (K-F3 1,
      K-F1 2) i 87 dawnych zielonych; `inventory.test.ts` nowy przypadek czerwony z asercji (albo
      rozstrzygnięcie człowieka wg L-0313); progress 1 czerwony (`HooksError: no implementation
      for ui.render`), 50 zielonych; panel 1 czerwony (`Expected: 3`, `Received: 6`), 216 zielonych.
- [x] Po zmianie: `plugin test mods` → ` 91 pass`, ` 0 fail`; `panel` → ` 217 pass`; `progress` →
      ` 51 pass`; `cache-keeper` → ` 206 pass` — łącznie 565.
- [x] `plugin validate mods`, `plugin validate progress`, `plugin validate panel` → „✔ Validation
      passed”; lista kluczy stanu w raporcie `mods` (`state writes`, `state reads`) identyczna jak
      przed zmianą (dowód negatywny K-F1: pamięć nie jest stanem silnika).
- [x] `node --test "core/panel/tests/*.test.*"` → 225 pass; `node --test "core/process/tests/*.test.*"`
      → 430 pass, 0 fail (bez zmian).
- [x] Dowód efektu (zasada 4): test K-F1 pokazuje przyrost `{ exists: 0, read: 0, list: 0 }` na
      serię klawiszy i tyknięcie bez zmian, `stat` > 0, a po zmianie z innego czatu `read` > 0
      (kontrola pozytywna); test K-F2 — po turze 0 odczytów innych sesji, plik o zmienionym
      rozmiarze czytany raz (kontrola pozytywna).
- [x] Granice API modów: narzędziem Grep (nie przez powłokę — zasada 5) wzorzec `\$\.` w
      `mods/hooks/inventory.ts` i `panel/hooks/records-memo.ts` → 0 trafień (P-023 pkt 10); `git diff --stat -- core/panel cache-keeper mods/hooks/views.tsx
      mods/hooks/cockpit.ts mods/hooks/look.ts progress/hooks/pane-agents.tsx panel/hooks/tab-data.ts
      panel/hooks/memo.ts panel/hooks/pane-io.ts` → pusty; manifesty modów bez zmian
      (`git diff --stat -- "*/plugin.json" "*marketplace.json"` → pusty).
- [x] Bramka manualna (karta E12, kroki 1–7): człowiek opisał kroki 3–6 — kokpit zawęża listę po
      każdej literze bez opóźnienia i nie miga przez 15 s, przełącznik daje pasek „⟳ 1 zmiana czeka
      na przeładowanie” i znika po ponownym naciśnięciu, panel agentów pokazuje kartę „● działa” →
      „✓ zakończony”, Koszty po turze rosną o koszt tury, Mapa się rysuje. Opis do wpisu dziennika.
- [x] Bezpieczeństwo (etap zmienia hooki modów czytające dysk): `trivy fs --scanners vuln .` →
      0 nowych CRITICAL i HIGH wobec wpisu E11 (zastane: 0 CRITICAL, 42 HIGH); etap nie dodaje
      zależności (`git diff --stat -- "*package.json" "*lock*"` → pusty). Zapas bez Trivy:
      `npm audit --omit=dev` w katalogu każdego śledzonego `package.json` modu, wynik do wpisu.
      Kod nie dokłada zapisu ani sieci: `git diff -- mods progress panel | grep -cE
      "fs\.write|\.request\(|fetch\("` → 0.
- [x] Granica: `git status --short` pokazuje z tego etapu wyłącznie osiem plików z pól „Pliki” trzech
      kart i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_12.md`, `PROMPT_ETAP_13.md`,
      `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`).
- [x] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów modów przed
      i po, liczbą przebiegów Codeksa (cel aneksu: 2, poprawek 0), wynikiem bramki manualnej, listą
      modów do podbicia w E14 i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E12/` i przebiegi
      `.claude/relai/work/CREW/` tego etapu przejrzane (`node .claude/relai/tools/clean-work.js
      raport`; katalog otwartego etapu raport pomija — wtedy liczby z `find`/`du`) i skasowane po
      „tak”, liczby przed i po we wpisie dziennika; (b) artefakty spoza katalogu wypisane z nazwy
      razem z tym, co się z nimi stało (`%TEMP%/relai-e12-settings.json` z bramki manualnej).

Najtwardszy punkt to bramka manualna: silnik testów nie widzi `hover`, limitu drzewa na desktopie
ani węzła pod `Box` z `width` (karta, „Czego silnik testów nie widzi”), więc zielone testy nie
dowodzą, że panel się rysuje. Pusty panel albo brak pasków nad promptem → zatrzymujesz się
i pytasz, zamiast zamykać etap na samych testach.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E12 → `ZREALIZOWANY <data>`, E13 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E12 rozpoczęty”); link
   w kolumnie `Prompt` przy E13 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E12/` i przebiegi `CREW` etapu —
   raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, `%TEMP%/relai-e12-settings.json`
   z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (testy modów przed i po, liczniki odczytów, bramka manualna) / Świadomie odłożone / Do zrobienia
   przez człowieka (w tym: mody do podbicia w E14); podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj tabelę „Stan otwartych ryzyk” (C1, C8); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka”
   tego wpisu dostaje linię `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu (E12 zrealizowany; liczby testów modów; E13 gotowy).
   Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_13.md`** wg `core/templates/SPEC_PROMPT_ETAPU.md` i `stage-prompts.md` —
   z wiersza E13 w sekcji 6 `PLAN.html`, z `karty/E13_MODY_RDZEN_I_KOPIE.md` (kod zmienia tylko
   K-G2; K-F4 i K-F5 rozstrzygnięte decyzją właściciela 2026-11-09), z realnego stanu repozytorium
   po tym etapie, z Aneksu A i z lekcji tego etapu; numery zasad do doczytania, bez odpisu.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
