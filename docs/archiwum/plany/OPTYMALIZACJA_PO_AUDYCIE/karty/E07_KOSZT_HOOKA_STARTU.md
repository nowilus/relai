# E7 — Koszt hooka startu

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia kod rdzenia
(`core/process/`) i hooki startu trzech adapterów. W Twojej sesji nadal działają hooki
zainstalowanego pluginu 3.7.0 — efekt zobaczy dopiero sesja po wydaniu w etapie E14. Dowodem są
testy i pomiary na fiksturze, nigdy zachowanie hooka w bieżącej sesji.

- **Karty w kolejności wykonania:** K-C1 → K-C3 → K-C2 → K-A6 (warunkowa).
  K-C1 jest pierwsza, bo zdejmuje 95% kosztu (37 MB odczytu). K-C3 idzie po niej, bo dokłada
  parametr `czytaj` do bramki w `work-artifacts.js`, który K-C1 już zmieniła. K-C2
  zmienia `provisionTemplates` i linię prowizji w hooku, którą K-A6 omija. K-A6 jest ostatnia,
  bo zależy od werdyktu z etapu E2 i może się skończyć bez zmiany kodu.
- **Efekt widoczny:** jeden start sesji w tym repozytorium czyta ok. 1,7 MB zamiast 38,8 MB
  i nie kopiuje 52 plików, gdy nic się nie zmieniło. W kontekście startu znika zdanie
  „Specyfikacje dokumentow RelAI sa skopiowane lokalnie … (52 plikow)” przy każdym starcie bez
  zmiany pluginu.
- **Szacunek:** SZACUNEK 2 sesje (K-C1 + K-C3 w pierwszej, K-C2 + K-A6 w drugiej).
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test „najpierw” jest czerwony
  z innego powodu niż asercja; po zmianie pada test spoza listy testów wymienionych w karcie;
  przy K-A6 plik `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` nie istnieje albo nie ma
  w nim dokładnie jednej linii `A6: POWTARZA` lub `A6: NIE POWTARZA`.
- **Weryfikacja etapu:**

  ```bash
  node --test "core/process/tests/*.test.*"      # w tle albo z limitem 10 minut
  node --test "adapters/cursor/tests/*.test.js"
  node --test "adapters/codex/tests/*.test.js"   # w tle albo z limitem 10 minut
  node core/tools/validate-adapters.js
  git status --short
  ```

  Testy dokładane w `core/process`: K-C1 **+3**, K-C3 **+2**, K-C2 **+4**, K-A6 **+1** tylko przy
  `A6: POWTARZA`. Od stanu `main` (357): **366** przy `A6: NIE POWTARZA`, **367** przy
  `A6: POWTARZA` (narastająco po E06 395 albo 396: **404–406**). Liczbę oczekiwaną liczysz od
  wpisu dziennika etapu E6 plus te przyrosty (konwencje, sekcja 4). Zestawy Cursora (10, stan po
  E06) i Codeksa (28, stan po E06) bez nowych testów — liczba bez zmian. `validate-adapters.js` — kod 0, jedno ostrzeżenie jak na `main`.

FAKTY tego etapu zmierzono 2026-11-09 na drzewie `main @ 5aeab39` skryptem z audytu
(`count-reads2.js`: zapisy zablokowane, git zastąpiony atrapą) i prototypami poprawek na kopii
modułów: skan artefaktów 4 324 odczyty plików testowych (188 plików × 23), 37 087 989 B,
591 ms → po K-C1 188 odczytów, 1 678 150 B, 225 ms, przy identycznej liście kandydatów (20)
i sumie (9 558 B). W sekwencji hooka: `DZIENNIK.md` ×7, `USTAWIENIA.md` ×16, `CLAUDE.md` ×10 →
po K-C3 ×1, ×1, ×1. Prowizja na fiksturze: 52 kopie i 36–38 ms → 0 kopii i 6,5 ms przy
drugim starcie bez zmian.

---

## K-C1 — skan artefaktów roboczych na starcie sesji

- **Cel:** jeden SessionStart czyta każdy plik testowy projektu najwyżej raz (dziś 4 324 odczyty
  przy 188 plikach); pozycje z katalogu tymczasowego nie przechodzą przez bramki „opisane”
  i „wiązane testami”; znacznik „ustawienia podane” nie jest pozycją skanu, a stare znaczniki są
  sprzątane.
- **Pliki:** `core/process/work-artifacts.js`, `adapters/claude-code/hooks/session-context.js`,
  `core/process/tests/start-hook-cost.test.js` (nowy), `core/process/tests/ritual-copies.test.js`
  (jedna linia sprzątania), `core/process/tests/hook-failures.test.js` (z etapu E4) i każdy inny
  plik w `core/process/tests/`, w którym Grep znajdzie `relai-ustawienia-podane` (ścieżka
  sprzątania).
- **Stan dziś** — trzy miejsca w `core/process/work-artifacts.js` i dwa w hooku.

  `szukajWTestach` czyta każdy plik testowy przy **każdej** pozycji, która doszła do tej bramki
  (kotwica, linia 525):

  ```js
      tresc = fs.readFileSync(p, 'utf8');
  ```

  `bramka` przepuszcza przez bramki dokumentów i testów także pozycje z `%TEMP%`, których
  `wzgledna` jest ścieżką bezwzględną (kotwice, linie 558 i 561):

  ```js
    const opis = szukajWDokumentach(kontekst, poz);
    const test = szukajWTestach(kontekst, poz);
  ```

  Hook zapisuje znacznik z prefiksem `relai-` w korzeniu katalogu tymczasowego i nigdy go nie
  kasuje (`adapters/claude-code/hooks/session-context.js`, linie 276 i 280):

  ```js
    return id ? path.join(os.tmpdir(), 'relai-ustawienia-podane-' + id) : null;
    try { if (plik) fs.writeFileSync(plik, ''); } catch (_) { /* brak znacznika = powtorzenie, nie awaria */ }
  ```

  Skan źródła `temp` bierze każdy wpis `%TEMP%` zaczynający się od `relai-` — 18 z 23 pozycji
  skanu w tym repozytorium to te znaczniki (FAKT, 2026-11-09).
- **Rozstrzygnięcia:**
  1. Treść pliku testowego zapamiętuje **kontekst bramki** (mapa leniwa w obiekcie kontekstu) —
     kontekst żyje dokładnie tyle co jeden pomiar, więc pamięć nie przeżywa zmiany plików.
  2. Pozycja o `zrodlo === 'temp'` pomija bramki „opisane” i „wiązane testami” — jej ścieżka nie
     jest względna, więc dokument ani test projektu jej nie wymienia; pozostałe bramki (śledzone,
     „zachowaj”, sekret, dowiązanie) zostają.
  3. Znacznik ląduje w `<katalog tymczasowy>/znaczniki-relai/ustawienia-podane-<id>` — nazwa
     katalogu nie zaczyna się od `relai-` ani `relai_`, więc skan `temp` jej nie bierze, a katalog
     tymczasowy (nie projekt) zostaje, bo hook wywołania skilla czyta znacznik także w folderze
     bez struktury RelAI.
  4. Sprzątanie: przy pierwszym utworzeniu katalogu `znaczniki-relai` hook kasuje wszystkie pliki
     `relai-ustawienia-podane-*` z korzenia katalogu tymczasowego (nowy kod ich nie czyta); potem
     przy każdym zapisie kasuje w `znaczniki-relai` znaczniki starsze niż 7 dni (wznowiona sesja
     starsza niż tydzień dostanie ustawienia globalne drugi raz — to cała cena).
- **Zmiana:**
  1. `work-artifacts.js`, nad `szukajWTestach` dopisz funkcję i zmień pętlę:

     ```js
     // Tresc pliku testowego czytana najwyzej raz na kontekst bramki (audyt C1: 23 odczyty kazdego
     // pliku testowego na jeden start sesji). Plik nieczytelny zapamietany jako null.
     function trescTestu(kontekst, p) {
       if (!kontekst.tresciTestow) kontekst.tresciTestow = new Map();
       if (!kontekst.tresciTestow.has(p)) {
         let tresc = null;
         try { tresc = fs.readFileSync(p, 'utf8'); } catch (_) { tresc = null; }
         kontekst.tresciTestow.set(p, tresc);
       }
       return kontekst.tresciTestow.get(p);
     }
     ```

     W `szukajWTestach` blok `let tresc; try { tresc = fs.readFileSync(p, 'utf8'); } catch (_) { continue; }`
     zastąp dwiema liniami: `const tresc = trescTestu(kontekst, p);` i `if (tresc === null) continue;`.
  2. `work-artifacts.js`, w `bramka` zastąp dwie linie z kotwicy:

     ```js
       // Pozycja z katalogu tymczasowego (zrodlo "temp") lezy poza projektem: jej sciezka nie jest
       // wzgledna, wiec dokument ani test projektu jej nie wymienia (audyt C1).
       const wProjekcie = poz.zrodlo !== 'temp';

       const opis = wProjekcie ? szukajWDokumentach(kontekst, poz) : null;
       if (opis) return { powod: 'opisane', zrodlo: opis.plik + ':' + opis.linia };

       const test = wProjekcie ? szukajWTestach(kontekst, poz) : null;
       if (test) return { powod: 'wiazane testami', zrodlo: test.plik };
     ```

  3. `session-context.js` (Claude Code): funkcje `znacznikUstawien` i `oznaczUstawieniaPodane`
     zastąp poniższymi; `ustawieniaPodane` zostaje bez zmian.

     ```js
     // Znacznik poza prefiksem relai- (audyt C1): skan artefaktow roboczych bierze z katalogu
     // tymczasowego kazdy wpis relai-*, a znacznikow przybywalo z kazda sesja.
     const KATALOG_ZNACZNIKOW = 'znaczniki-relai';
     const STARY_PREFIKS = 'relai-ustawienia-podane-';
     const WIEK_ZNACZNIKA_MS = 7 * 24 * 60 * 60 * 1000;

     function znacznikUstawien(sesja) {
       const id = String(sesja || '').replace(/[^A-Za-z0-9_-]/g, '');
       return id ? path.join(os.tmpdir(), KATALOG_ZNACZNIKOW, 'ustawienia-podane-' + id) : null;
     }
     function sprzatnijZnaczniki(teraz) {
       const dir = path.join(os.tmpdir(), KATALOG_ZNACZNIKOW);
       if (!fs.existsSync(dir)) {
         // Pierwszy start po zmianie: znaczniki starego ksztaltu kasujemy raz, razem z utworzeniem katalogu.
         for (const nazwa of fs.readdirSync(os.tmpdir())) {
           if (nazwa.startsWith(STARY_PREFIKS)) fs.rmSync(path.join(os.tmpdir(), nazwa), { force: true });
         }
         fs.mkdirSync(dir, { recursive: true });
         return;
       }
       for (const nazwa of fs.readdirSync(dir)) {
         const p = path.join(dir, nazwa);
         if (teraz - fs.statSync(p).mtimeMs > WIEK_ZNACZNIKA_MS) fs.rmSync(p, { force: true });
       }
     }
     function oznaczUstawieniaPodane(sesja) {
       const plik = znacznikUstawien(sesja);
       try {
         if (!plik) return;
         sprzatnijZnaczniki(Date.now());
         fs.writeFileSync(plik, '');
       } catch (_) { /* brak znacznika = powtorzenie ustawien, nie awaria */ }
     }
     ```

  4. `ritual-copies.test.js`, linia 127: ścieżkę sprzątania zmień na
     `path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id)`. To nie zmienia
     oczekiwania testu — sprząta po nim w nowym miejscu.
  5. Wyszukaj Grepem `relai-ustawienia-podane` w `core/process/tests/` i w każdym teście, który
     sprząta znacznik (w tym `hook-failures.test.js` dodany w etapie E4), zmień ścieżkę sprzątania
     na nowe położenie `path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id)`.
- **Test najpierw:** nowy plik `core/process/tests/start-hook-cost.test.js` (nagłówek
  z komentarzem: „Koszt hooka startu — etap E7 planu OPTYMALIZACJA_PO_AUDYCIE”). Fikstury
  w `os.tmpdir()`, sprzątane w `finally`. Trzy przypadki:
  1. `work artifact scan reads each test file at most once (C1)` — fikstura: katalogi
     `.claude/relai/work/TEMAT_A/E1`, `TEMAT_B/E1`, `TEMAT_C/E1` (w każdym jeden plik) i katalog
     `tests/` z czterema plikami `a.test.js` … `d.test.js`. Podmień `fs.readFileSync` na
     opakowanie liczące odczyty po `path.resolve(p)` (przywróć w `finally`), wywołaj
     `require('../work-artifacts.js').artefaktyRobocze(dir, { zrodla: ['work'] })`. Oczekiwane:
     każdy plik testowy przeczytany najwyżej 1 raz, razem ≤ 4. Dziś: 3 razy każdy (czerwony).
  2. `a temp item is not protected by project documents or tests (C1)` — fikstura z `CLAUDE.md`
     i `tests/x.test.js`, oba zawierające ciąg `C:/fikcja/Temp/relai-probka`. Kontekst:
     `wa.kontekstBramki(dir, { sledzone: null, markery: [] })`; pozycja
     `{ wzgledna: 'C:/fikcja/Temp/relai-probka', zrodlo: 'temp', sciezka: path.join(dir, 'nie-ma'), bajty: 1 }`.
     Oczekiwane: `wa.bramka(poz, kontekst) === null`. Kontrola pozytywna w tym samym przebiegu:
     ta sama pozycja z `zrodlo: 'repo'` i `wzgledna: 'relai-probka'` przy `CLAUDE.md`
     zawierającym `relai-probka/` → `powod === 'opisane'`. Dziś: `opisane` dla pozycji temp
     (czerwony).
  3. `the settings marker lives outside the relai- prefix and old markers are removed (C1)` —
     helper `srodowisko()`: katalog bazowy z `projekt/docs/USTAWIENIA.md`
     (`Wersja RelAI: 3.7.0` i tabela z jednym wierszem), `home/.claude/relai/USTAWIENIA.md`
     (tabela z wierszem `| 2026-08-07 | Jezyk pracy | polski |`) i pustym `tmp/`; env =
     `{ ...process.env, HOME: home, USERPROFILE: home, TEMP: tmp, TMP: tmp, TMPDIR: tmp }`
     (Node bierze `os.tmpdir()` z tych zmiennych w chwili wywołania). Podłóż
     `tmp/relai-ustawienia-podane-stary`. Uruchom hook Claude Code (`spawnSync(process.execPath,
     [HOOK], { input, env })`) z `{ hook_event_name: 'SessionStart', source: 'startup', cwd:
     projekt, session_id: 'k-c1' }`. Oczekiwane: istnieje `tmp/znaczniki-relai/ustawienia-podane-k-c1`;
     w `tmp/` nie ma żadnego wpisu `relai-ustawienia-podane-*`; wyjście zawiera
     `Ustawienia globalne uzytkownika` (kontrola pozytywna). Potem hook z `{ hook_event_name:
     'PostToolUse', tool_name: 'Skill', tool_input: { skill: 'relai:relai-core' }, cwd: projekt,
     session_id: 'k-c1' }` → wyjście **nie** zawiera `Ustawienia globalne uzytkownika`.
- **Weryfikacja:** `node --test "core/process/tests/start-hook-cost.test.js"` → 3 zielone;
  `node --test "core/process/tests/ritual-copies.test.js"` → bez zmian liczby, zielone.
- **Nie ruszasz:** przejścia po drzewie w `plikiTestowe` (zostaje zachłanne — cel „odczyt ≤ liczba
  plików” jest spełniony bez tego); „suma z pamięci podręcznej raz na dzień” z kierunku audytu
  (cel osiągnięty bez niej, YAGNI); innych plików stanu sesji w `.claude/relai/`
  (`zgoda-promptu`, `tytul`, `fokus`, `pomiary` — znalezisko C12, niska waga, poza planem);
  zachowania `/relai-clean` poza tymi dwiema bramkami; śladów błędów w `catch` hooka (C4, etap E04);
  hooków Cursora i Codeksa (nie piszą znacznika).
- **Pułapki:** hook z repozytorium uruchamiaj wyłącznie na fiksturze — z `cwd` w repozytorium
  prowizjonuje `.claude/relai/`. Opakowanie `fs.readFileSync` musi wrócić do oryginału w `finally`,
  inaczej kolejne testy w tym procesie liczą się podwójnie. Zainstalowany 3.7.0 w Twojej sesji
  nadal pisze znaczniki starego kształtu — nie kasuj ich ręcznie; zrobi to pierwszy start po
  wydaniu. Komunikaty i komentarze w hooku ASCII.
- **Gotowe, gdy:** trzy nowe testy zielone; `ritual-copies.test.js` zielony; `git status --short`
  pokazuje wyłącznie pliki z pola „Pliki” (w tym testy, w których zmieniłeś ścieżkę sprzątania
  znacznika).

---

## K-C3 — jeden odczyt dokumentu na proces hooka startu

- **Cel:** w procesie hooka startu `DZIENNIK.md`, `USTAWIENIA.md` i `CLAUDE.md` są czytane
  najwyżej raz (dziś 7, 16 i 10 razy), a skrót startu powstaje w tym procesie dokładnie raz.
- **Pliki:** `core/process/session-signals.js`, `core/process/start-digest.js`,
  `core/process/work-artifacts.js`, `adapters/claude-code/hooks/session-context.js`,
  `adapters/cursor/hooks/session-context.js`, `adapters/codex/hooks/session-context.js`,
  `core/process/tests/start-hook-cost.test.js`.
- **Stan dziś** — `core/process/session-signals.js`:

  ```js
  function czytaj(p) {
    try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
  }
  ```

  i trzy odczyty z pominięciem `czytaj` (kotwice, linie 69, 147, 885):

  ```js
      try { head = fs.readFileSync(path.join(docsDir, f), 'utf8').slice(0, 4000); } catch (_) { continue; }
      const m = fs.readFileSync(markerFile, 'utf8').match(
        try { dziennik = fs.readFileSync(p, 'utf8'); } catch (_) { continue; }
  ```

  `core/process/start-digest.js`, linia 56:
  `  try { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); } catch (_) { return null; }`.
  `work-artifacts.js`: `function indeksDokumentow(cwd) {` i
  `    dokumenty: o.dokumenty || indeksDokumentow(cwd),`. Wywołanie skanu w
  `session-signals.js` (linia 1792): `      zrodla: ['work', 'temp'],`. Hook Claude Code czyta
  przełącznik trybu ciągłego osobno, przez `prompt-mode.js`:
  `  for (const linia of trybPromptu.trybCiaglyReport(trybPromptu.trybCiaglyProjektu(cwd))) {`.
  Skrót startu w procesie hooka powstaje dziś raz (`startCost`, linia 1356) — FAKT; karta
  utrwala to testem.

  Po etapie E4 ten fragment ma postać wywołania `raport(out, 'tryb ciagly', () => …)`; kotwicą
  jest wtedy tekst `trybPromptu.trybCiaglyProjektu(cwd)` wewnątrz tego wywołania. Pętla
  `for (const linia of …)` z kotwicy powyżej po etapie E4 nie istnieje.
- **Rozstrzygnięcie:** pamięć odczytów jest **wyłączona domyślnie** i włącza ją wyłącznie hook
  startu na swój proces — testy i narzędzia zmieniają pliki między wywołaniami w jednym procesie,
  więc pamięć globalna podawałaby im starą treść.
- **Zmiana:**
  1. `session-signals.js`: zastąp `czytaj` poniższym kodem i dopisz do eksportów
     `czytaj, // jeden odczyt pliku dla skrotu startu i rdzenia (audyt C3)` oraz
     `pamiecOdczytow, // wlacza pamiec odczytow na czas procesu hooka startu (audyt C3)`.

     ```js
     // Pamiec odczytow procesu hooka startu (audyt C3: DZIENNIK.md x7, USTAWIENIA.md x16, CLAUDE.md x10
     // w jednym SessionStart). Wlacza ja wylacznie hook startu, na czas jednego procesu; domyslnie
     // wylaczona, bo testy i narzedzia zmieniaja pliki miedzy wywolaniami w tym samym procesie.
     let pamiec = null;
     function pamiecOdczytow(wlacz) {
       pamiec = wlacz ? new Map() : null;
     }

     function czytaj(p) {
       if (!pamiec) {
         try { return fs.readFileSync(p, 'utf8'); } catch (_) { return ''; }
       }
       const klucz = path.resolve(p);
       if (!pamiec.has(klucz)) {
         let tresc = '';
         try { tresc = fs.readFileSync(klucz, 'utf8'); } catch (_) { tresc = ''; }
         pamiec.set(klucz, tresc);
       }
       return pamiec.get(klucz);
     }
     ```

  2. `session-signals.js`, trzy odczyty z kotwic: w `markerWKatalogu` dwie linie
     (`let head = '';` i linię z kotwicy) zastąp jedną
     `const head = czytaj(path.join(docsDir, f)).slice(0, 4000);`; w `projectVersion`
     `fs.readFileSync(markerFile, 'utf8')` → `czytaj(markerFile)`; w `unknownAuthor` linię z kotwicy
     → `dziennik = czytaj(p);` (pusty wynik prowadzi do tej samej gałęzi co dotąd).
  3. `session-signals.js`, wywołanie skanu w `artefaktyRobocze`: pod `limitWpisow: o.limitWpisow,`
     dopisz `czytaj, // dokumenty bramki z tej samej pamieci odczytow co reszta startu (audyt C3)`.
  4. `work-artifacts.js` (kopia projektu musi zostać samowystarczalna — parametr jest opcjonalny):

     ```js
     // czytajTekst (opcjonalny): odczyt wolajacego, np. pamiec odczytow hooka startu (audyt C3).
     // Zwraca tekst albo '' — pusty dokument niczego nie opisuje, wiec traktujemy go jak brak.
     function indeksDokumentow(cwd, czytajTekst) {
       const wynik = [];
       for (const rel of DOKUMENTY_BRAMKI) {
         const p = path.join(cwd, ...rel.split('/'));
         const tekst = czytajTekst ? czytajTekst(p) : null;
         const linie = czytajTekst ? (tekst ? tekst.split(/\r?\n/) : null) : czytajLinie(p);
         if (linie) wynik.push({ plik: rel, linie });
       }
       return wynik;
     }
     ```

     i w `kontekstBramki`: `dokumenty: o.dokumenty || indeksDokumentow(cwd, o.czytaj),`.
  5. `start-digest.js`: `czytajLF` →
     `function czytajLF(p) { return core.czytaj(p).replace(/\r\n/g, '\n'); }` z komentarzem
     „Odczyt przez rdzen: w procesie hooka startu dziala tam pamiec odczytow (audyt C3).” Funkcję
     piszesz narzędziem Edit (backslash w wyrażeniu).
  6. Hooki: Claude Code — pierwsza linia `onSessionStart` (nad
     `  const markerFile = relaiMarkerFile(cwd);`): `core.pamiecOdczytow(true);` z komentarzem
     „Jeden odczyt kazdego dokumentu na proces hooka (audyt C3).”; całe wywołanie
     `raport(out, 'tryb ciagly', …)` z kotwicy (stan po etapie E4) zastąp:

     ```js
       raport(out, 'tryb ciagly', () => {
         const plikUstawien = ['USTAWIENIA.md', 'SETTINGS.md'].map((n) => path.join(cwd, 'docs', n))
           .find((p) => fs.existsSync(p));
         return trybPromptu.trybCiaglyReport(
           trybPromptu.trybCiagly(plikUstawien ? core.czytaj(plikUstawien) : ''));
       });
     ```

     Wariant z pętlą `for (const linia of …)` sprzed etapu E4 nie obowiązuje.
     (`trybCiagly('')` daje `null`, czyli to samo co `trybCiaglyProjektu` bez pliku). Cursor —
     nad `  const markerFile = core.relaiMarkerFile(cwd, MARKERY_GOSCIA);` dopisz
     `core.pamiecOdczytow(true);`. Codex — nad `  const marker = core.relaiMarkerFile(cwd, markers);`
     dopisz `core.pamiecOdczytow(true);`.
- **Test najpierw** (`start-hook-cost.test.js`, dwa przypadki):
  1. `start sequence with read memory reads each start document once and builds the digest once (C3)` —
     fikstura: `CLAUDE.md` z sekcją `## Stan prac` i linią `Aktywny plan: brak`;
     `docs/USTAWIENIA.md` z `Wersja RelAI: 3.7.0` i wierszami `Budżet startu sesji | włączony`,
     `Rotacja dokumentów | włączona`, `Przegląd spraw człowieka | włączony · 30 dni`,
     `Artefakty robocze | włączone`; `docs/STATE.md` z `## Gdzie jesteśmy`; `docs/DZIENNIK.md`
     z sekcjami ryzyk, „Czeka na człowieka” i jednym wpisem; `docs/LEKCJE.md`. Na czas testu
     `process.env.TEMP`, `TMP` i `TMPDIR` wskazują pusty katalog fikstury (skan `temp` nie
     chodzi po prawdziwym `%TEMP%`); przywróć w `finally`. Licznik odczytów jak w K-C1; licznik
     budowy skrótu: podmień `require('../start-digest.js').startDigest` na opakowanie liczące
     (przywróć w `finally`). Wywołaj `if (typeof core.pamiecOdczytow === 'function')
     core.pamiecOdczytow(true);`, potem w kolejności hooka: `relaiMarkerFile`, `projectVersion`,
     `promptGap`, `stateDrift`, `siatkaRytualu`, `unknownAuthor`, `startCost`,
     `sprawyPrzeterminowane`, `artefaktyRobocze`, `wiekListyModeli(dir, { nazwa: 'MODELE-test.md' })`.
     Oczekiwane: `DZIENNIK.md`, `USTAWIENIA.md`, `CLAUDE.md` po ≤ 1 odczycie; skrót zbudowany
     1 raz; źródła trzech hooków (`fs.readFileSync` pliku hooka) zawierają
     `pamiecOdczytow(true)`. Dziś czerwony asercją liczby odczytów (warunek `typeof` chroni przed
     błędem `TypeError`).
  2. `read memory is off by default and forgets on switch-off (C3)` — plik w fiksturze: `A` →
     `core.czytaj` zwraca `A`; zapis `B` → zwraca `B`; `pamiecOdczytow(true)`, odczyt `B`, zapis
     `C` → nadal `B`; `pamiecOdczytow(false)` → `C`. Dziś czerwony na
     `assert.equal(typeof core.czytaj, 'function')`.
- **Weryfikacja:** `node --test "core/process/tests/start-hook-cost.test.js"` → 5 zielonych;
  `node --test "core/process/tests/start-digest.test.js"` i `start-cost.test.js` → zielone, liczba
  bez zmian.
- **Nie ruszasz:** drugiego budowania skrótu przez model (`node .claude/relai/tools/start-digest.js`
  w osobnym procesie) — współdzielenie wyniku przez plik dawałoby skrót nieaktualny po edycji
  dokumentu; `prompt-mode.js` (zostaje bez pamięci; hook podaje mu tekst); brzmienia zdania o trybie
  ciągłym (etap E09); `resume.js`.
- **Pułapki:** przez `czytaj` nie czytasz pliku, który hook zapisuje wcześniej w tym samym
  procesie — dziś jedyny taki przypadek to nakładki rodzin (`wiekNakladek`), czytane **po**
  prowizji i nigdy przed nią; nie przestawiaj kolejności w hooku. Kopia `start-digest.js`
  w projekcie bierze `core` z `./session-signals.js` obok — oba pliki jadą razem (lista
  `NARZEDZIA`), więc `core.czytaj` istnieje w kopii.
- **Gotowe, gdy:** dwa nowe testy zielone; trzy hooki wołają `pamiecOdczytow(true)`; całe
  `core/process/tests` zielone.

---

## K-C2 — prowizja tylko przy zmianie

- **Cel:** start sesji i wywołanie skilla RelAI kopiują pliki do `.claude/relai/` tylko wtedy,
  gdy zmieniło się źródło albo brakuje lub zmienił się plik w kopii; zdanie „Specyfikacje
  dokumentow RelAI sa skopiowane lokalnie …” pada tylko po realnej kopii; przy `source ===
  'compact'` hook nie kopiuje.
- **Pliki:** `core/process/session-signals.js`, `adapters/claude-code/hooks/session-context.js`,
  `adapters/cursor/install.js`, `core/process/tests/start-hook-cost.test.js`.
- **Stan dziś:** `provisionTemplates` (linia 288) kopiuje zawsze:

  ```js
      const n = copyTree(src, dest) + provisionTools(destRoot, o) + provisionPrompt(destRoot, o)
        + provisionHumanize(destRoot, o);
  ```

  Hook Claude Code woła ją w obu zdarzeniach (kotwica `  const copied = provisionTemplates(cwd);`
  — **dwa** trafienia: SessionStart linia 228, PostToolUse `Skill` linia 296). Cursor
  (`session-context.js:139`) i Codex (`session-context.js:33`) wołają tę samą funkcję rdzenia.
  Instalator Cursora (`    templates = core.provisionTemplates(projekt, {`) wypisuje jej wynik
  jako liczbę plików. Na fiksturze (2026-11-09) hook 3.7.0 wypisał zdanie o 52 plikach przy
  starcie, przy drugim starcie bez zmian i po kompakcji. Po etapie E4 ta linia leży wewnątrz
  wywołania `raport(out, 'kopie specyfikacji', …)` i ma inne wcięcie — kotwicy szukasz bez
  wiodących spacji; zmienna `input` jest tam dostępna.
- **Rozstrzygnięcia:** znacznik `.claude/relai/.provisioned` trzyma dwa odciski SHA-1 z ostatniej
  kopii kompletnej — źródeł i plików w projekcie; odcisk liczy ścieżkę, rozmiar i `mtimeMs`, nie
  treść (odczyt 934 KB kosztowałby tyle co kopia, a edycja źródła w repozytorium pluginu bez
  zmiany wersji zmienia `mtime`). Wersji pluginu w znaczniku nie ma: nowa wersja to nowy katalog
  w cache, więc zmieniają się ścieżki źródeł i odcisk. Instalator Cursora kopiuje zawsze
  (`wymus: true`) — instalacja to jawne polecenie człowieka.
- **Zmiana:**
  1. `session-signals.js`: pod `const { spawnSync } = require('child_process');` dopisz
     `const crypto = require('crypto');`. Nad `provisionTemplates` dopisz:

     ```js
     // --- znacznik prowizji (audyt C2) -------------------------------------------
     // Kopia 52 plikow (ok. 934 KB) szla przy kazdym starcie i kazdym wywolaniu skilla RelAI.
     // Znacznik trzyma odciski zrodel i kopii z ostatniej kopii kompletnej; odcisk to stat
     // (sciezka, rozmiar, mtime), nie tresc. Kopia idzie, gdy rozni sie ktorykolwiek odcisk
     // albo brakuje choc jednego pliku.
     const ZNACZNIK_PROWIZJI = '.provisioned';

     function paryDrzewa(src, dest, out) {
       let wpisy;
       try { wpisy = fs.readdirSync(src, { withFileTypes: true }); } catch (_) { return out; }
       for (const wpis of wpisy) {
         const zrodlo = path.join(src, wpis.name);
         const cel = path.join(dest, wpis.name);
         if (wpis.isDirectory()) paryDrzewa(zrodlo, cel, out);
         else if (KOPIOWANE.test(wpis.name)) out.push({ zrodlo, cel });
       }
       return out;
     }

     // Te same pary co copyTree, provisionTools, provisionPrompt i provisionHumanize, plus pliki
     // pisane obok: .gitignore i package.json katalogow skryptow (markCommonJs).
     function plikiProwizji(src, destRoot, o) {
       const pary = paryDrzewa(src, path.join(destRoot, 'templates'), []);
       const srcProcess = o.coreProcess || __dirname;
       for (const n of NARZEDZIA) {
         pary.push({ zrodlo: path.join(srcProcess, n.zrodlo), cel: path.join(destRoot, 'tools', n.cel) });
       }
       paryDrzewa(o.corePrompt || path.resolve(__dirname, '..', 'prompt'), path.join(destRoot, 'prompt'), pary);
       paryDrzewa(o.coreHumanize || path.resolve(__dirname, '..', 'humanize'), path.join(destRoot, 'humanize'), pary);
       const obok = [path.join(destRoot, '.gitignore'), path.join(destRoot, 'tools', 'package.json')];
       if (fs.existsSync(path.join(src, 'HTML_PLAN'))) obok.push(path.join(destRoot, 'templates', 'HTML_PLAN', 'package.json'));
       return { zrodla: pary.map((p) => p.zrodlo), cele: pary.map((p) => p.cel).concat(obok) };
     }

     function odcisk(pliki) {
       const h = crypto.createHash('sha1');
       for (const p of pliki) {
         let st = null;
         try { st = fs.statSync(p); } catch (_) { st = null; }
         h.update(p + '\t' + (st ? st.size + '\t' + st.mtimeMs : 'brak') + '\n');
       }
       return h.digest('hex');
     }
     ```

     W `provisionTemplates` po linii `const destRoot = …` dopisz sprawdzenie, a kopię zostaw bez
     zmian:

     ```js
         const znacznik = path.join(destRoot, ZNACZNIK_PROWIZJI);
         const pliki = plikiProwizji(src, destRoot, o);
         const komplet = () => pliki.cele.every((p) => fs.existsSync(p));
         let zapisany = '';
         try { zapisany = fs.readFileSync(znacznik, 'utf8').trim(); } catch (_) { zapisany = ''; }
         if (!o.wymus && komplet() && zapisany === odcisk(pliki.zrodla) + ' ' + odcisk(pliki.cele)) return 0;
     ```

     a po `markCommonJs(destRoot);`:

     ```js
         // Znacznik tylko po kopii kompletnej: brakujacy plik wymusza kopie przy nastepnym starcie.
         if (komplet()) {
           try { fs.writeFileSync(znacznik, odcisk(pliki.zrodla) + ' ' + odcisk(pliki.cele) + '\n'); } catch (_) { /* cisza */ }
         }
     ```

     Zaktualizuj komentarz nad funkcją: „Zwraca liczbe skopiowanych plikow; 0 = nic sie nie
     zmienilo, awaria albo brak zrodla — adapter milczy.” Znacznik czytasz `fs.readFileSync`,
     nie `czytaj` (plik zapisywany w tym samym procesie).
  2. Hook Claude Code, SessionStart (pierwsze trafienie kotwicy, linia 228):
     `const copied = input.source === 'compact' ? 0 : provisionTemplates(cwd);` z komentarzem
     „Po kompakcji kopia jest juz w projekcie (audyt C2).” Drugie trafienie (PostToolUse) bez
     zmiany — ta sama funkcja, ten sam znacznik. Zdań hooka nie zmieniasz: warunek
     `if (copied > 0)` już wycisza je przy zerze.
  3. `adapters/cursor/install.js`: w obiekcie opcji wywołania z kotwicy dopisz `wymus: true,`.
- **Test najpierw** (`start-hook-cost.test.js`, cztery przypadki; licznik `fs.copyFileSync`
  jak licznik odczytów, przywracany w `finally`):
  1. `provisioning copies on the first start and nothing on an unchanged second start (C2)` —
     pierwszy `core.provisionTemplates(dir)` ≥ 52, drugi `=== 0` i zero wywołań `copyFileSync`;
     plik `.claude/relai/.provisioned` istnieje.
  2. `a missing or edited copy forces a copy (C2)` — po kopii skasuj
     `.claude/relai/templates/SPEC_ARCHIWUM.md` → wynik > 0 i plik wrócił; skasuj
     `.claude/relai/tools/package.json` → > 0 i plik wrócił; zapisz `stara kopia\n` do
     `.claude/relai/humanize/REGULY.md` → > 0 i treść inna niż `stara kopia\n`.
  3. `a source edited without a version bump forces a copy (C2)` — kopia `core/templates`
     (`fs.cpSync(…, { recursive: true })`) w fiksturze jako `coreTemplates`; dwa wywołania →
     drugie 0; `fs.utimesSync` pliku źródłowego na `Date.now() + 5000` → wynik > 0; trzecie → 0;
     `{ coreTemplates, wymus: true }` → > 0.
  4. `the session hook says "copied" only after a real copy and not after compaction (C2)` —
     helper `srodowisko()` z K-C1; nowa fikstura, hook z `source: 'compact'` jako **pierwsze**
     zdarzenie → brak katalogu `.claude/relai/templates`; potem `startup` → wyjście zawiera
     `Specyfikacje dokumentow RelAI sa skopiowane lokalnie`; drugi `startup` i `compact` → nie
     zawierają.
  Dziś czerwone: 1 (drugi zwrot 52), 3 (drugi zwrot 52), 4 (compact kopiuje i mówi); przypadek 2
  przechodzi już dziś — to kontrola, że znacznik nie zgubi naprawy kopii.
- **Weryfikacja:** `node --test "core/process/tests/start-hook-cost.test.js"` → 9 zielonych;
  `node --test "core/process/tests/session-signals.test.js"` i `esm-project.test.js` → zielone
  bez zmian (oba sprawdzają, że następny start naprawia zmienioną albo brakującą kopię);
  `node --test "adapters/cursor/tests/*.test.js"` → 10 zielonych (stan po E06).
- **Nie ruszasz:** `provisionModelList` (kopia trwała, osobna reguła); brzmienia zdań hooków
  o kopii; hooków Cursora i Codeksa (dostają zachowanie przez funkcję rdzenia); linii o nakładkach
  rodzin (A5, niska waga, poza planem).
- **Pułapki:** `copyFileSync` na Windows przenosi `mtime` źródła — odcisk kopii liczysz **po**
  kopii, nie z góry. Znacznik zapisany po kopii niekompletnej zablokowałby naprawę — stąd warunek
  `komplet()`. W Twojej sesji hook 3.7.0 dalej kopiuje przy każdym starcie: dowodem są testy.
- **Gotowe, gdy:** cztery nowe testy zielone; `session-signals.test.js`, `esm-project.test.js`
  i testy Cursora zielone bez zmian.

---

## K-A6 — wznowienie sesji bez ponownego rytuału (karta warunkowa)

- **Cel:** przy `A6: POWTARZA` wznowiona rozmowa (`source: 'resume'`) dostaje przypomnienie
  polecenia skrótu zamiast nakazu rytuału startu, jak po kompakcji; przy `A6: NIE POWTARZA`
  karta zamyka się bez zmiany kodu.
- **Pliki:** przy `A6: POWTARZA` — `adapters/claude-code/hooks/session-context.js`,
  `core/process/tests/ritual-copies.test.js`. Przy `A6: NIE POWTARZA` — żadne (zdanie idzie do
  wpisu dziennika etapu).
- **Stan dziś:** hook rozróżnia tylko kompakcję (kotwica, linia 201):

  ```js
    if (input.source === 'compact') {
      out.push('Ten folder to projekt RelAI. Po kompakcji nie czytasz dokumentow od nowa: gdy zadanie ' +
  ```

  Gałąź `compact` zmienia **wyłącznie** ostatnie zdanie bloku: wszystkie raporty (budżet, sprawy,
  artefakty, lista modeli, ustawienia globalne) padają tak samo jak przy starcie. Każde inne
  źródło, także `resume`, dostaje pełny nakaz (355 B) — i model uruchamia skrót drugi raz
  (26 633 B dziś, 19 156 B po etapie E8).
- **Zmiana:**
  1. Odczytaj werdykt: `grep -c "^A6: POWTARZA$" docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`
     i `grep -c "^A6: NIE POWTARZA$" …`. Dokładnie jedna jedynka → dalej; inaczej zatrzymaj się.
  2. **`A6: NIE POWTARZA`:** kodu nie zmieniasz. Do wpisu dziennika etapu dopisz jedno zdanie:
     „K-A6 zamknieta jako niepotwierdzona: POMIARY.md ma linie `A6: NIE POWTARZA`, wiec start po
     wznowieniu zostaje bez zmian.” Koniec karty.
  3. **`A6: POWTARZA`:** gałąź `if (input.source === 'compact') { … }` zastąp:

     ```js
       // Po kompakcji i po wznowieniu (pomiar E2 planu OPTYMALIZACJA_PO_AUDYCIE: A6: POWTARZA) stan
       // jest w historii rozmowy: hook przypomina polecenie, nie kaze wykonac rytualu od nowa.
       // /clear zaczyna nowa rozmowe, wiec dostaje pelny nakaz.
       const POWROT = { compact: 'Po kompakcji', resume: 'Po wznowieniu rozmowy' };
       if (POWROT[input.source]) {
         out.push('Ten folder to projekt RelAI. ' + POWROT[input.source] + ' nie czytasz dokumentow ' +
           'od nowa: gdy zadanie potrzebuje stanu projektu, uruchom ' + core.POLECENIE_SKROTU +
           ' (skrot startu z drogowskazami do pelnych sekcji).');
       } else {
     ```

     Gałąź `else` (pełny nakaz) i reszta hooka bez zmian. Zaktualizuj komentarz nad gałęzią
     (linie 198–200): „Po kompakcji i po wznowieniu (source: compact / resume) …”.
     Teksty dla modelu dosłownie:

     | Źródło | Zdanie | Bajty przed | Bajty po |
     |---|---|---|---|
     | `compact` | `Ten folder to projekt RelAI. Po kompakcji nie czytasz dokumentow od nowa: gdy zadanie potrzebuje stanu projektu, uruchom node .claude/relai/tools/start-digest.js (skrot startu z drogowskazami do pelnych sekcji).` | 211 | 211 (bez zmian) |
     | `resume` | `Ten folder to projekt RelAI. Po wznowieniu rozmowy nie czytasz dokumentow od nowa: gdy zadanie potrzebuje stanu projektu, uruchom node .claude/relai/tools/start-digest.js (skrot startu z drogowskazami do pelnych sekcji).` | 355 (pełny nakaz) | 220 |
     | `startup`, `clear` | pełny nakaz rytuału — bez zmian | 355 | 355 |

- **Test najpierw** (tylko przy `A6: POWTARZA`; `ritual-copies.test.js`, jeden przypadek obok
  testu kompakcji): `after resume the hook reminds the digest command and does not force the ritual; clear still forces it` —
  fikstura `projekt()`; hook Claude Code z `source: 'resume'` → zawiera
  `Po wznowieniu rozmowy nie czytasz dokumentow od nowa` i polecenie skrótu, nie zawiera
  `wykonaj rytual startu sesji`; z `source: 'clear'` → zawiera `wykonaj rytual startu sesji`.
  Sprzątanie znaczników w `finally` jak w teście kompakcji (nowa ścieżka z K-C1). Dziś czerwony:
  `resume` dostaje pełny nakaz.
- **Weryfikacja:** `node --test "core/process/tests/ritual-copies.test.js"` → zielone, o jeden
  test więcej.
- **Nie ruszasz:** `clear` (nowa rozmowa potrzebuje rytuału); raportów bloku startu przy
  `resume` — zostają jak przy `compact`; brzmienia pełnego nakazu rytuału (etap E09); hooków
  Cursora i Codeksa (ich payload nie niesie zmierzonego `source: 'resume'`); `hooks.json`
  (matcher bez zmian).
- **Pułapki:** pole `source` bywa mylące po `/clear` (L-0285) — pomiar E2 objął wyłącznie
  `--resume`, więc warunek stoi tylko na wartości `resume`; nie rozszerzaj go na inne źródła.
  Werdykt czytasz z `POMIARY.md` wyłącznie w brzmieniu z zamkniętej listy (zasada 7) — „powtarza”
  małymi literami albo inny zapis to zatrzymanie, nie interpretacja.
- **Gotowe, gdy:** przy `A6: POWTARZA` — test zielony i `git status --short` pokazuje dwa pliki
  z pola „Pliki”; przy `A6: NIE POWTARZA` — zdanie zamknięcia stoi we wpisie dziennika etapu.
