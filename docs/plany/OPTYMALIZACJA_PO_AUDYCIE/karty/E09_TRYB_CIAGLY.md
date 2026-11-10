# E9 — Tryb ciągły

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia **mechanizm pluginu**
(rdzeń `core/process/prompt-mode.js`, hooki, komendę `/relai-prompt`, skill `relai-core`, regułę
Cursora, specyfikacje) — w odróżnieniu od karty K-B1p z etapu E1, która wyłączyła tryb ciągły
w ustawieniach **tego** repozytorium. Działa dopiero po wydaniu (E14).

- **Karty w kolejności wykonania:** K-B1 → K-B2 → K-B4. K-B1 pierwsza, bo zdejmuje pytanie
  z każdej sesji człowieka, który trybu nie chce (110 odmów na 113 sesji); K-B2 zmienia filtr,
  na którym stoi druga część K-B4 (akceptacja propozycji przechodzi bez bramki, więc komenda
  wywołana wprost nie musi zapisywać zgody); K-B4 na końcu, bo zmienia teksty startu w siedmiu
  kopiach i jest niezależna od kodu filtra.
- **Efekt widoczny:** bramka trybu ciągłego ma czwartą opcję „nie i nie pytaj więcej”, po której
  tryb milczy we wszystkich projektach; odpowiedź „Wykonaj propozycję” nie wywołuje bramki;
  „Do the migration…” dostaje propozycję zamiast przejść jako pytanie; sesja zaczęta komendą
  wykonuje komendę bez rytuału i bez przeglądu spraw.
- **Szacunek:** SZACUNEK 1 sesja (K-B1 i K-B2 ok. 60%, K-B4 ok. 40%).
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test z pola „Test najpierw”
  jest zielony przed zmianą, choć karta mówi, że ma być czerwony (wyjątek nazwany wprost: test
  ciszy przy wierszu „nie” w K-B1); istniejący test spoza listy karty robi się czerwony;
  `node adapters/codex/generate-skills.js` kończy się błędem.
- **Weryfikacja etapu:**

  ```bash
  node --test "core/process/tests/*.test.*"
  node --test "adapters/codex/tests/*.test.js"
  node --test "adapters/cursor/tests/*.test.js"
  node core/tools/validate-adapters.js
  node adapters/codex/generate-skills.js && git status --short adapters/codex/skills
  ```

  Testy dokładane do `core/process/tests`: K-B1 **+2**, K-B2 **+7**, K-B4 **+3** = **+12**
  (od stanu `main` 357 → 369; liczbę oczekiwaną liczysz od wpisu dziennika etapu E8 plus 12 —
  narastająco: 408–410 → **420–422**).
  Zestawy Codeksa i Cursora: bez nowych testów, liczba bez zmian, wszystkie zielone.
  `validate-adapters.js`: kod 0, to samo jedno ostrzeżenie co na starcie planu.

**Cytaty w krokach „Zmiana” są podane bez łamań linii.** W plikach te same fragmenty bywają
złamane między liniami (np. „Trzy\n// odpowiedzi” w komentarzu `prompt-mode.js`, „a wyłącza ją\n`/relai-prompt
off --globalnie`” w komendzie, zdania w `docs/KOMENDY.md`). Fragment znajdujesz po tekście,
łamanie linii w nim zachowujesz albo dobierasz tak, żeby linia nie przekroczyła 100 znaków.
Kotwice z pól „Stan dziś” są pojedynczymi liniami i sprawdzone Grepem na `main @ 5aeab39`.

**Fakt ustalony przy pisaniu kart (2026-11-09, prototyp w scratchpadzie):** odczyt wiersza
`Zgoda na optymalizator | nie` **już działa**. `zgodaGlobalna` rozpoznaje `nie`
(`ZGODA_NIE`), `stanBramki` zwraca dla niego `'cisza'`, a hook z `main` uruchomiony na fiksturze
z takim wierszem w `~/.claude/relai/USTAWIENIA.md` milczy w sesjach S1 i S2. Brakuje wyłącznie
drogi zapisu z bramki i opisu: komenda mówi dziś, że `off --globalnie` „kasuje zgodę” i „bramka
pyta od nowa”, co przeczy kodowi. Dlatego K-B1 **nie zmienia odczytu** — zmienia tekst bramki,
komendę i specyfikację.

---

## K-B1 — trwała odmowa trybu ciągłego (aneks D-93)

- **Cel:** bramka zgody ma czwartą opcję „nie i nie pytaj więcej”, zapisującą wiersz
  `| RRRR-MM-DD | Zgoda na optymalizator | nie |` w `~/.claude/relai/USTAWIENIA.md`; przy tym wierszu
  hook `prompt-mode` wypisuje zero znaków we wszystkich projektach, dopóki człowiek nie zmieni
  wiersza albo nie wywoła `/relai-prompt on --globalnie`. Zgoda Łukasza na aneks: 2026-11-09.
- **Pliki:** `core/process/prompt-mode.js`, `core/process/tests/prompt-mode.test.js`,
  `core/process/tests/prompt-gate.test.js`, `adapters/claude-code/commands/relai-prompt.md`,
  `core/templates/SPEC_USTAWIENIA.md`, `docs/KOMENDY.md`, `docs/DECYZJE.md`, `docs/ARTEFAKTY.md`;
  kopia generowana `adapters/codex/skills/relai-prompt/SKILL.md`.
  `adapters/claude-code/hooks/prompt-mode.js` **bez zmian** — wybór „cisza” rozstrzyga już rdzeń.
- **Stan dziś** — cztery kotwice.
  1. `core/process/prompt-mode.js`, funkcja `regulaBramki` (ok. linii 352–361):

     ```
         'pytanie (AskUserQuestion) o trzy opcje i nic wiecej: (1) tak, w tej sesji; (2) tak i nie ' +
     ```

  2. `adapters/claude-code/commands/relai-prompt.md`, Krok 0a (linie 29 i 35):

     ```
     | `off --globalnie` | wiersz `Zgoda na optymalizator` = `nie` w `~/.claude/relai/USTAWIENIA.md` | zgoda na stałe cofnięta; bramka pyta od nowa w każdej sesji |
     `off --globalnie` **nie wyłącza** trybu w projektach — kasuje wyłącznie zgodę „nie pytaj więcej".
     ```

  3. Ta sama komenda, sekcja „Tryb ciągły” (linie 157–158 i 161–162):

     ```
     pytania". Bramka ma **dwa kroki**. Pierwszy prompt merytoryczny sesji wraca **pytaniem o trzy
     w `~/.claude/relai/USTAWIENIA.md`. Odpowiedź „nie" wycisza tryb do końca sesji i wraca dopiero
     ```

  4. `core/templates/SPEC_USTAWIENIA.md`, sekcja „`Zgoda na optymalizator`” (linie 655–656, 671, 678):

     ```
     projekcie bywa zgodą sprzed tygodni — więc pierwszy taki prompt w sesji wraca pytaniem o trzy
     | przełącznik (**pierwszy, obowiązkowy**) | `tak` / `nie` (EN: `yes` / `no`) | `tak` → bramka nie pyta; `nie` → tryb ciągły milczy mimo włączonego wiersza projektowego |
     stałe, „tak w tej sesji" włącza go mimo jej braku. Wyłącznik: `/relai-prompt off --globalnie`.
     ```

- **Zmiana:**
  1. **Tekst bramki.** W `regulaBramki` zastąp ciąg od `'pytanie (AskUserQuestion) o trzy opcje`
     do `'wracasz do tematu w tej sesji. Po (1) i (2) dalej wg reguly: ' + regula(o);` kodem:

     ```js
         'pytanie (AskUserQuestion) o cztery opcje i nic wiecej: (1) tak, w tej sesji; (2) tak i nie ' +
         'pytaj wiecej; (3) nie w tej sesji; (4) nie i nie pytaj wiecej. Odpowiedz ZAPISZ, zanim ' +
         'wykonasz prompt: kazda do WLASNEGO pliku tej sesji .claude/relai/zgoda-promptu/' +
         String(sesja || '') + '.json jako {"decyzja":"tak albo nie","data":"RRRR-MM-DD"} - plikow ' +
         'innych sesji nie ruszasz; (2) i (4) dodatkowo wiersz "| RRRR-MM-DD | Zgoda na optymalizator ' +
         '| tak albo nie |" w ~/.claude/relai/USTAWIENIA.md (istniejacy nadpisujesz). Po (3) i (4) ' +
         'wykonujesz prompt bez zmian, bez kolejnych pytan i bez czytania procedury, i nie wracasz do ' +
         'tematu w tej sesji. Po (1) i (2) dalej wg reguly: ' + regula(o);
     ```

     Pierwsze dwie linie funkcji (`'[RelAI bramka zgody] Tryb ciagly…'` i `'zgody na te sesje…'`)
     zostają. Zmierzone na prototypie (bajty UTF-8): bez listy modeli **1109 → 1118 B**, z listą
     **1734 → 1743 B**, z modelem znanym **1181 → 1190 B** — mieści się w progach istniejących
     testów (1200 i 1800 znaków). Nowy tekst nie ma pauzy `—`, cały jest w ASCII.
     Zmień też komentarz nagłówka pliku (linie 9–11): „Trzy odpowiedzi: ta sesja / na stale
     (zapis globalny) / nie” → „Cztery odpowiedzi: ta sesja / na stale (zapis globalny) / nie /
     nie na stale (zapis globalny, K-B1 planu OPTYMALIZACJA_PO_AUDYCIE)”.
  2. **Odczytu nie zmieniasz.** `ZGODA_NIE`, `zgodaGlobalna`, `stanBramki`,
     `przypomnienieZgodyReport` zostają; ta ostatnia już zwraca `[]` dla `tak !== true`, więc dla
     „nie” przypomnienia na starcie nie ma (test „przypomnienieZgodyReport speaks once…” to
     sprawdza). Pierwszeństwo decyzji sesyjnej nad globalną zostaje (D-93, `stanBramki`).
  3. **Krok 0a komendy.** Zastąp całą tabelę przełączników (cztery wiersze pod nagłówkiem
     `| Argument | Co zapisujesz | Skutek |`) tabelą:

     ```
     | Argument | Co zapisujesz | Skutek |
     |---|---|---|
     | `on` | wiersz `Tryb ciągły` = `włączony` w `docs/USTAWIENIA.md` | tryb dostępny w tym projekcie; o zgodę na sesję pyta bramka. Gdy `~/.claude/relai/USTAWIENIA.md` ma wiersz `Zgoda na optymalizator` = `nie`, tryb dalej milczy — mówisz to w tym samym zdaniu meldunku i wskazujesz `on --globalnie` |
     | `off` | wiersz `Tryb ciągły` = `wyłączony` w `docs/USTAWIENIA.md` | tryb milczy w tym projekcie, ustawienia globalne bez zmian |
     | `off --globalnie` | wiersz `Zgoda na optymalizator` = `nie` z dzisiejszą datą w `~/.claude/relai/USTAWIENIA.md`; istniejący wiersz nadpisujesz | trwała odmowa: tryb milczy we wszystkich projektach i bramka nie pyta — to samo co odpowiedź „nie i nie pytaj więcej” w bramce |
     | `on --globalnie` | wiersz `Zgoda na optymalizator` = `tak` z dzisiejszą datą w `~/.claude/relai/USTAWIENIA.md`; istniejący wiersz nadpisujesz | bramka przestaje pytać, tryb działa w projektach z włączonym wierszem; przypomnienie wraca po progu z członu `· przypomnienie co N dni` (domyślnie 30) |
     ```

     Akapit zaczynający się od „`off --globalnie` **nie wyłącza** trybu w projektach” (trzy linie)
     zastąp akapitem:

     ```
     Wiersz projektu i wiersz globalny są rozdzielone świadomie: projekt mówi, czy tryb jest
     dostępny, człowiek mówi, czy ma działać. `off --globalnie` nie zmienia wiersza `Tryb ciągły`
     w żadnym projekcie. Powrót do pytania bramki w każdej sesji to usunięcie wiersza `Zgoda na
     optymalizator` — osobnego przełącznika na to nie ma. Decyzja zapisana wcześniej w tej sesji
     (plik `.claude/relai/zgoda-promptu/<id sesji>.json`) rozstrzyga do końca tej sesji, nowy wiersz
     globalny — od następnej; mówisz to w meldunku po `off --globalnie` i `on --globalnie`.
     ```

     Powód ostatniego zdania: zasada 8 każe przy zapisie w warstwie niższej skasować plik tej
     sesji, ale komenda nie zna identyfikatora sesji (wstawia go tylko hook), więc zostaje druga
     połowa zasady — powiedzieć, która warstwa rozstrzyga.
  4. **Sekcja „Tryb ciągły” komendy.** Fragment od „pytaniem o trzy” do „bez czytania procedury.”
     zastąp brzmieniem (resztę akapitu od „Po „tak” pada…” zostaw):

     ```
     pytaniem o cztery opcje i nic więcej**: tak w tej sesji / tak i nie pytaj więcej (zapis
     globalny) / nie w tej sesji / nie i nie pytaj więcej (zapis globalny). Odpowiedź zapisuje się
     od razu — każda do `.claude/relai/zgoda-promptu/<id sesji>.json` (osobny plik na sesję, więc
     nie przecieka do następnej), obie trwałe dodatkowo wierszem `Zgoda na optymalizator`
     w `~/.claude/relai/USTAWIENIA.md`. „Nie w tej sesji” wycisza tryb do końca sesji i wraca
     w następnej; „nie i nie pytaj więcej” wycisza go we wszystkich projektach, dopóki człowiek nie
     zmieni wiersza albo nie wywoła `/relai-prompt on --globalnie`. Po obu „nie” — bez kolejnych
     pytań i bez czytania procedury.
     ```

     W ostatnim zdaniu akapitu „a wyłącza ją `/relai-prompt off --globalnie`.” zastąp „a
     `/relai-prompt off --globalnie` zamienia ją w trwałą odmowę.”. W sekcji „Dawniej” dopisz na
     końcu zdanie: „Czwarta opcja bramki (trwała odmowa) — od planu OPTYMALIZACJA_PO_AUDYCIE, E9.”
  5. **`SPEC_USTAWIENIA.md`.** (a) „pytaniem o trzy opcje: **ta sesja** / **nie pytaj więcej** /
     **nie**.” → „pytaniem o cztery opcje: **ta sesja** / **nie pytaj więcej** / **nie** / **nie
     i nie pytaj więcej**.” (b) Wiersz tabeli członów „przełącznik” zastąp:

     ```
     | przełącznik (**pierwszy, obowiązkowy**) | zamknięta lista: `tak` / `nie` (EN: `yes` / `no`); czytane też dawne brzmienia `udzielona` / `cofnięta` (EN: `granted` / `revoked`). Inne brzmienie = brak wiersza, bramka pyta | `tak` → bramka nie pyta, tryb działa; `nie` → trwała odmowa: tryb ciągły milczy we wszystkich projektach mimo włączonego wiersza projektowego i bramka nie pyta |
     ```

     (c) Pod istniejącym przykładem wiersza z `tak` dopisz w tym samym bloku kodu drugi przykład:
     `| 2026-11-09 | Zgoda na optymalizator | nie |`. (d) „Wyłącznik: `/relai-prompt off --globalnie`.”
     → „Trwała odmowa: czwarta opcja bramki albo `/relai-prompt off --globalnie`; przy `nie`
     przypomnienia na starcie nie ma. Powrót do pytania w każdej sesji: usunięcie wiersza.”
  6. **`docs/KOMENDY.md`** (linie 184–188): „**ta sesja** / **nie pytaj więcej** / **nie**. Odmowa
     wycisza tryb do końca sesji,” → „**ta sesja** / **nie pytaj więcej** / **nie** / **nie i nie
     pytaj więcej**. Odmowa wycisza tryb do końca sesji, trwała odmowa — we wszystkich projektach,”;
     „(cofnięcie zgody na stałe).” → „(trwała odmowa: tryb milczy wszędzie, bramka nie pyta).”
  7. **Aneks D-93.** Dopisz **na końcu** tabeli „Decyzje zmienione” w `docs/DECYZJE.md` jeden wiersz
     (treści D-93 w linii 66 nie edytujesz):

     ```
     | **D-93** → aneks | <RRRR-MM-DD> | Bramka trybu ciągłego pyta o **cztery** opcje: ta sesja / nie pytaj więcej / nie / **nie i nie pytaj więcej**. Czwarta zapisuje decyzję „nie” w pliku sesji i wiersz `Zgoda na optymalizator` = `nie` w `~/.claude/relai/USTAWIENIA.md`; przy tym wierszu hook trybu ciągłego milczy we wszystkich projektach, dopóki człowiek nie zmieni wiersza albo nie wywoła `/relai-prompt on --globalnie`. Ten sam wiersz zapisuje `/relai-prompt off --globalnie`. Reguła D-93 bez zmian: pierwsze okno pyta wyłącznie o zgodę, po każdym „nie” nie pada żadne kolejne pytanie i nic nie jest czytane. | Audyt 2026-11-09, znalezisko B1: odmowa w 110 ze 113 sesji (pliki `zgoda-promptu/*.json` od 2026-09-24), a bramka pytała w każdej nowej sesji; zgoda Łukasza 2026-11-09. |
     ```

  8. **Kopie i rejestr.** `node adapters/codex/generate-skills.js` (zmienia
     `adapters/codex/skills/relai-prompt/SKILL.md`). W `docs/ARTEFAKTY.md` w wierszu z plikiem
     `adapters/claude-code/commands/relai-prompt.md` podbij kolumnę „Wersja” o 1; kolumny „Data”
     i „Po co” zostają bez zmian. Na **początek** komórki „Co się zmieniło” wstaw wpis i spację
     przed dotychczasową treścią: `<RRRR-MM-DD> (wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E9, K-B1):
     czwarta opcja bramki „nie i nie pytaj więcej”; off --globalnie = trwała odmowa zamiast „bramka
     pyta od nowa”; nowa tabela przełączników Kroku 0a. Powód: 110 odmów na 113 sesji (audyt B1);
     opis off --globalnie przeczył kodowi, który przy „nie” już milczał.` Tak samo w wierszu
     `core/templates/SPEC_USTAWIENIA.md`: `<RRRR-MM-DD> (wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E9,
     K-B1): zamknięta lista brzmień wiersza Zgoda na optymalizator, znaczenie „nie” = trwała
     odmowa, przykład wiersza „nie”. Powód: aneks D-93.` Wpis zaczyna się od daty i `(wersja` —
     po tym kształcie rozpoznaje go skrypt `karty/zalaczniki/skroc-rejestr.js` (format karty K-R10
     z etapu E10).
- **Test najpierw:**
  - `core/process/tests/prompt-mode.test.js`, nowy test **„regulaBramki offers the fourth
    option: no and do not ask again (K-B1)”**: `const r = tryb.regulaBramki('sesja-42')`;
    `assert.match(r, /\(4\) nie i nie pytaj wiecej/)`; `assert.match(r, /Zgoda na optymalizator \| tak albo nie \|/)`;
    `assert.match(r, /Po \(3\) i \(4\) wykonujesz prompt bez zmian/)`; w części przed
    `split('Po (1) i (2)')[0]` dokładnie jedno `AskUserQuestion`. **Czerwony przed zmianą.**
  - `core/process/tests/prompt-gate.test.js`, nowy test **„global "nie": silence in every
    session and every project, the gate without the row (K-B1)”**: `projekt(t, { zgodaGlobalna: 'nie' })`
    → `hook(p, MERYTORYCZNY, 'S1') === ''` i `hook(p, MERYTORYCZNY, 'S2') === ''`; drugi projekt
    `q = projekt(t)` wołany z domem pierwszego: `hook({ root: q.root, home: p.home }, MERYTORYCZNY, 'S3') === ''`;
    kontrola pozytywna w tym samym teście: `hook(projekt(t), MERYTORYCZNY)` pasuje do
    `/\[RelAI bramka zgody\]/`. **Ten test jest zielony już przed zmianą** (odczyt działa — fakt
    z nagłówka etapu); to strażnik regresji, nie dowód zmiany. Zatrzymanie z powodu „zielony
    przed zmianą” go nie dotyczy.
  - Żaden istniejący test nie zmienia oczekiwania. Test „regulaBramki carries the three options…”
    zostaje zielony (sprawdza id sesji, ścieżkę pliku, `USTAWIENIA.md`, `PROCEDURA.md` i próg
    1200); jego nazwy nie zmieniasz.
- **Weryfikacja:** `node --test core/process/tests/prompt-mode.test.js core/process/tests/prompt-gate.test.js`
  → wszystkie zielone, dwa testy więcej niż przed kartą;
  `grep -c "D-93\*\* → aneks" docs/DECYZJE.md` → `1`;
  `grep -n "bramka pyta od nowa" adapters/claude-code/commands/relai-prompt.md adapters/codex/skills/relai-prompt/SKILL.md`
  → brak trafień; `grep -c "nie i nie pytaj więcej" adapters/claude-code/commands/relai-prompt.md` → co najmniej `2`.
- **Nie ruszasz:** odczytu zgody (`zgodaGlobalna`, `ZGODA_*`) ani innych parserów ustawień
  (C8); zdania startu `trybCiaglyReport` — przy trwałej odmowie dalej mówi, że tryb jest włączony
  w projekcie (znalezisko A5, niskiej wagi, poza planem); wiersza „Tryb ciągły” w
  `docs/USTAWIENIA.md` tego repozytorium (K-B1p, E1); wsadu agenta optymalizatora (B3); treści
  D-93 w linii 66.
- **Pułapki:** w sesji wykonawcy działa hook zainstalowanego pluginu 3.7.0 — jego bramka nadal
  ma trzy opcje; dowodem jest test. Tabela przełączników zawiera backticki i pionowe kreski —
  edycja wyłącznie narzędziem Edit. Wiersz aneksu jest jedną linią; w treści komórki nie ma `|`.
  Test hooka ustawia `USERPROFILE` i `HOME` w `env` (wzór: funkcja `hook` w `prompt-gate.test.js`).
- **Gotowe, gdy:** oba nowe testy zielone; trzy greps dają podany wynik; kopia Codeksa
  zregenerowana; dwa wiersze `ARTEFAKTY.md` podbite.

---

## K-B2 — filtr pomijania: akceptacja, pytania, apostrofy, frazy, ścieżki

- **Cel:** odpowiedź przyjmująca propozycję („Wykonaj propozycję”, „tak, wykonaj”, „opcja B”)
  przechodzi nietknięta; „Do the migration…”, „Czy możesz przepisać…” bez pytajnika i „Jak
  skończysz, odpal testy” dostają regułę; „Let’s continue” i „gotowi do wydania?” są frazami
  sesji; ścieżka `/c/Users/…` nie jest komendą.
- **Pliki:** `core/process/prompt-mode.js`, `core/process/session-title.js`,
  `core/process/tests/prompt-mode.test.js`, `core/process/tests/prompt-gate.test.js`,
  `core/process/tests/session-title.test.js`, `adapters/claude-code/commands/relai-prompt.md`,
  `docs/KOMENDY.md`, `docs/ARTEFAKTY.md`; kopia `adapters/codex/skills/relai-prompt/SKILL.md`.
- **Rozstrzygnięcia (jedno rozwiązanie, jeden powód):**
  - (a) **Akceptacja: prompt złożony wyłącznie ze słów listy potwierdzeń, najwyżej 6 słów.**
    Bez stanu: wiedza „propozycja padła” wymagałaby czytania transkryptu albo pliku stanu
    pisanego przez model, a tabela 44 promptów przechodzi bez tego. Lista brzmień dla całego
    promptu odpada, bo każde połączenie („zgoda, wykonaj propozycję”) byłoby nową pozycją.
    Odpowiedź poprawiająca propozycję („popraw punkt 2 i wykonaj”) dostaje regułę — to nowe zadanie.
  - (b) **Węższa reguła niż w zleceniu.** Pytajnik jest wymagany tylko dla słów, które zaczynają
    też polecenia: `czy`, `jak`, `kiedy`, `when`, `does`, `do`, `is`, `are`, `can`. Słowa
    `co`, `po co` (i reszta zaimków) zostają bezwarunkowe, bo istniejące testy „co robi ta
    funkcja” i „po co jest ten hook” (bez pytajnika) słusznie oczekują pominięcia — objęcie ich
    regułą pytajnika złamałoby dwa zamierzone przypadki. Dla symetrii z apostrofami dochodzą
    `whats`, `wheres`, `whos`, `hows`.
  - (c) Apostrofy `'` i `’` znikają w `normalizuj` przed resztą; dodatkowo znak `…` dołącza do
    końcowej interpunkcji (session-title zdejmował go dotąd własną funkcją `bare`).
  - (d) **Jedna lista fraz w `prompt-mode.js`**, eksportowana: `FRAZY_SESJI` (wszystkie) i jej
    podzbiór `FRAZY_KONTYNUACJI` (`kontynuujemy prace`, `lets continue`), z którego
    `session-title.js` buduje swoje frazy tytułu. Krótkie potwierdzenia tytułu (`kontynuuj`,
    `tak`, `continue`, `yes`) zostają w `session-title.js`, bo to nie są frazy sesji.
  - (e) Komenda to `/` i nazwa z liter, cyfr, `-` i `:` do pierwszego odstępu albo końca.
- **Stan dziś** (`core/process/prompt-mode.js`):

  ```
  const FRAZY_SESJI = [
    'konczymy na dzis', 'kontynuujemy prace', 'sprawdz status', 'jak stoimy',
  // Krotkie potwierdzenia — zamknieta lista, dopasowanie do CALEGO promptu.
  const ZAIMKI_PYTAJNE = new Set([
      .replace(/[,;:]/g, ' ')
      .replace(/[.!?\s]+$/g, '');
    if (/^\s*\//.test(surowy)) return 'wywolanie komendy';
    if (POTWIERDZENIA.has(n)) return 'krotkie potwierdzenie';
  ```

  `core/process/session-title.js`:

  ```
  const PHRASES = new Set(['kontynuujemy pracę', 'kontynuuj', 'tak', "let's continue", 'continue', 'yes']);
    if (PHRASES.has(bare(text))) return true;
  ```

- **Zmiana:**
  1. W `prompt-mode.js` zastąp blok `const FRAZY_SESJI = [ … ];` (z komentarzem nad nim zostaw
     pierwsze dwie linie):

     ```js
     // Jedna lista dla prompt-mode i session-title (K-B2 d). Brzmienia po normalizuj().
     // FRAZY_KONTYNUACJI to podzbior, ktory session-title zamienia w tytul z fokusu.
     const FRAZY_KONTYNUACJI = ['kontynuujemy prace', 'lets continue'];
     const FRAZY_SESJI = [
       ...FRAZY_KONTYNUACJI,
       'konczymy na dzis', 'sprawdz status', 'jak stoimy', 'gotowi do wydania',
       'wrapping up', 'status check',
     ];
     ```

  2. Pod stałą `POWIADOMIENIE_W_TLE` dopisz:

     ```js
     // Wywolanie komendy (K-B2 e): ukosnik, nazwa z liter, cyfr, '-' i ':' do pierwszego
     // odstepu albo konca. Sciezka "/c/Users/x/log.txt" ma drugi ukosnik w nazwie, wiec nia nie jest.
     const KOMENDA = /^\s*\/[A-Za-z0-9:-]+(?:\s|$)/;
     ```

  3. Zastąp blok od `// Krotkie potwierdzenia — zamknieta lista` do końca `const ZAIMKI_PYTAJNE = new Set([ … ]);`
     (z komentarzem „Pytanie rozpoznajemy po PIERWSZYM slowie…”) kodem:

     ```js
     // Potwierdzenie (K-B2 a): prompt zlozony WYLACZNIE ze slow tej listy, najwyzej
     // LIMIT_POTWIERDZENIA slow. Tak przechodzi odpowiedz na propozycje optymalizatora
     // ("Wykonaj propozycje", "tak, wykonaj", "opcja B") bez stanu w pliku: wystarczy
     // sam tekst. Slowo spoza listy ("zmien", "limit") robi z promptu zadanie.
     const SLOWA_POTWIERDZENIA = new Set([
       'tak', 'nie', 'ok', 'okej', 'okey', 'dobra', 'dobrze', 'jasne', 'zgoda', 'dawaj',
       'kontynuuj', 'dalej', 'rob', 'zrob', 'to', 'potwierdzam', 'prosze', 'dziekuje', 'dzieki',
       'wykonaj', 'propozycje', 'propozycja', 'oryginal', 'akceptuje', 'zatwierdzam', 'odrzucam',
       'opcja', 'wariant', 'super', 'i', 'a', 'b', 'c', 'd', '1', '2', '3', '4',
       'yes', 'no', 'okay', 'go', 'ahead', 'continue', 'proceed', 'sure', 'please', 'thanks',
       'do', 'it', 'run', 'the', 'proposal', 'original', 'accept', 'approve', 'approved', 'option', 'lgtm',
     ]);
     const LIMIT_POTWIERDZENIA = 6;

     // Pytanie rozpoznajemy po PIERWSZYM slowie. Slowa jednoznacznie pytajne licza sie
     // zawsze ("co robi ta funkcja" nie ma pytajnika). Slowa z PYTAJNE_Z_PYTAJNIKIEM
     // zaczynaja tez polecenia ("Do the migration", "Czy mozesz przepisac", "Jak skonczysz,
     // odpal testy"), wiec licza sie wylacznie przy znaku zapytania na koncu promptu (K-B2 b).
     const ZAIMKI_PYTAJNE = new Set([
       'co', 'gdzie', 'dlaczego', 'czemu', 'ile', 'kto',
       'ktory', 'ktora', 'ktore', 'skad', 'po', 'na',
       'what', 'whats', 'where', 'wheres', 'why', 'how', 'hows', 'which', 'who', 'whos',
     ]);
     const PYTAJNE_Z_PYTAJNIKIEM = new Set([
       'czy', 'jak', 'kiedy', 'when', 'does', 'do', 'is', 'are', 'can',
     ]);
     ```

  4. W `normalizuj` przed `.replace(/[,;:]/g, ' ')` wstaw `.replace(/['’]/g, '')`, a ostatnią linię
     zmień na `.replace(/[.!?…\s]+$/g, '');`. Wzorce piszesz narzędziem Edit (backslash).
  5. W `powodPominiecia`: `if (/^\s*\//.test(surowy))` → `if (KOMENDA.test(surowy))`; linię
     `if (POTWIERDZENIA.has(n)) return 'krotkie potwierdzenie';` i następne do sprawdzenia
     zaimków zastąp:

     ```js
       const slowa = n.split(' ');
       if (slowa.length <= LIMIT_POTWIERDZENIA && slowa.every((s) => SLOWA_POTWIERDZENIA.has(s))) {
         return 'krotkie potwierdzenie';
       }

       const dwa = slowa.slice(0, 2).join(' ');
       if (PYTAJNE_DWUSLOWNE.has(dwa)) return 'pytanie';
       if (ZAIMKI_PYTAJNE.has(slowa[0]) && !['po', 'na'].includes(slowa[0])) return 'pytanie';
       if (PYTAJNE_Z_PYTAJNIKIEM.has(slowa[0]) && surowy.trim().endsWith('?')) return 'pytanie';
     ```

     Kolejność zostaje: pusty → komenda → powiadomienie w tle → frazy → potwierdzenie → pytanie.
     Powiadomienie `<task-notification>` (wzorzec `POWIADOMIENIE_W_TLE`) dalej jest pomijane —
     nowa reguła komendy go nie dotyczy, bo zaczyna się od `<`.
  6. Do `module.exports` dopisz `FRAZY_SESJI` i `FRAZY_KONTYNUACJI`.
  7. W `session-title.js` zastąp linię `const PHRASES = …` trzema liniami:

     ```js
     // The session phrases have one list, in prompt-mode.js (K-B2 d); the short confirmations stay here.
     const { normalizuj, FRAZY_KONTYNUACJI } = require('./prompt-mode.js');
     const PHRASES = new Set([...FRAZY_KONTYNUACJI, 'kontynuuj', 'tak', 'continue', 'yes']);
     ```

     W `isContinuation` `bare(text)` → `normalizuj(text)`; funkcję `bare` usuń (nie ma innych
     wywołań — sprawdź `grep -n "bare(" core/process/session-title.js` → jedna linia definicji).
  8. Komenda `relai-prompt.md`, sekcja „Tryb ciągły”: zdanie „Nietknięte przechodzą: wywołania
     komend (tekst zaczynający się od `/`), frazy sesji, krótkie potwierdzenia i pytania.” zastąp:

     ```
     Nietknięte przechodzą: wywołania komend (`/` i nazwa komendy — ścieżka `/c/Users/…` komendą nie
     jest), frazy sesji, krótkie potwierdzenia — także przyjęcie propozycji, czyli prompt złożony
     wyłącznie ze słów potwierdzenia („wykonaj propozycję”, „tak, wykonaj”, „opcja B”) — i pytania;
     prompt zaczęty od „czy”, „jak”, „kiedy”, „do”, „is”, „can” jest pytaniem tylko ze znakiem
     zapytania na końcu.
     ```

     W `docs/KOMENDY.md` zdanie „Nietknięte przechodzą wywołania komend, frazy sesji, krótkie
     potwierdzenia i pytania — o kod pytasz normalnie.” uzupełnij po „krótkie potwierdzenia” o
     „(także „wykonaj propozycję” i „opcja B”)”.
  9. `node adapters/codex/generate-skills.js`; w `docs/ARTEFAKTY.md` wiersz `relai-prompt.md` —
     kolumna „Wersja” +1, kolumny „Data” i „Po co” bez zmian; na **początek** komórki „Co się
     zmieniło” wstaw wpis i spację przed dotychczasową treścią: `<RRRR-MM-DD> (wersja N, plan
     OPTYMALIZACJA_PO_AUDYCIE E9, K-B2): opis filtra — przyjęcie propozycji przechodzi, pytajnik dla
     słów dwuznacznych, ścieżka nie jest komendą. Powód: audyt B2 — akceptacja propozycji
     wywoływała bramkę, zadania przechodziły jako pytania.` Wpis zaczyna się od daty i `(wersja` —
     po tym kształcie rozpoznaje go skrypt `karty/zalaczniki/skroc-rejestr.js` (format karty K-R10
     z etapu E10).
- **Dowód z prototypu** (2026-11-09, kopia `core` i hooków w scratchpadzie, nowy
  `powodPominiecia` wg kroków 1–7): tabela niżej — **44 z 44** zgodnych z oczekiwaniem; istniejące
  testy `prompt-mode.test.js`, `prompt-gate.test.js` i `session-title.test.js` na prototypie —
  **49 z 49 zielonych** (bez zmiany żadnego oczekiwania). `P` = krotkie potwierdzenie, `F` = fraza
  sesji, `Q` = pytanie, `K` = wywolanie komendy, `—` = brak pominięcia (reguła albo bramka).

  | Prompt | Dziś | Po zmianie |
  |---|---|---|
  | Wykonaj propozycję · Wykonaj oryginał · tak, wykonaj · akceptuję · zatwierdzam | — | P |
  | ok, dalej · opcja B · wykonaj · ok, rób · dobra, dawaj · tak, zrób to | — | P |
  | zgoda, wykonaj propozycję · nie, wykonaj oryginał · odrzucam · dzięki · lgtm · yes please | — | P |
  | do it | Q | P |
  | tak · ok · kontynuuj | P | P |
  | gotowi do wydania? · Let's continue · Let’s continue | — | F |
  | lets continue · kontynuujemy pracę | F | F |
  | Do the migration of the settings parser | Q | — |
  | Czy możesz przepisać parser ustawień na jeden moduł | Q | — |
  | Czy możesz przepisać parser ustawień na jeden moduł? | Q | Q |
  | Jak skończysz, odpal testy · kiedy skończysz, zrób commit | Q | — |
  | Does the parser handle CRLF? | Q | Q |
  | Does the parser handle CRLF | Q | — |
  | /c/Users/x/log.txt - co tu jest? | K | — |
  | co robi ta funkcja · po co jest ten hook · dlaczego test pada na pustym mailu? | Q | Q |
  | What's next? | — | Q |
  | /relai-prompt cos · /relai:relai-stage PLAN E3 · /relai-stage | K | K |
  | popraw punkt 2 i wykonaj · tak zmien ten limit na 20 i dopisz komentarz | — | — |
  | popraw walidacje w formularzu logowania bo sie sypie na pustym mailu (MA dostać regułę) | — | — |

- **Test najpierw** (wszystkie **czerwone przed zmianą**):
  - `prompt-mode.test.js`:
    1. **„powodPominiecia passes an answer to the proposal made only of confirmation words (K-B2)”** —
       każde z: `Wykonaj propozycję`, `Wykonaj oryginał`, `tak, wykonaj`, `akceptuję`,
       `zatwierdzam`, `ok, dalej`, `opcja B`, `nie, wykonaj oryginał`, `do it` →
       `'krotkie potwierdzenie'`; kontrola negatywna w tym samym teście: `popraw punkt 2 i wykonaj`
       i `wykonaj propozycję i dopisz test` → `null`.
    2. **„ambiguous question words count only with a question mark (K-B2)”** —
       `Do the migration of the settings parser`, `Czy możesz przepisać parser ustawień na jeden
       moduł`, `Jak skończysz, odpal testy`, `kiedy skończysz, zrób commit` → `null`;
       `Czy możesz przepisać parser ustawień na jeden moduł?`, `Does the parser handle CRLF?`,
       `jak to działa?`, `What's next?` → `'pytanie'`.
    3. **„normalizuj drops straight and curly apostrophes and the ellipsis (K-B2)”** —
       `normalizuj("Let's continue")` i `normalizuj('Let’s continue')` → `'lets continue'`;
       `normalizuj('kontynuujemy pracę…')` → `'kontynuujemy prace'`.
    4. **„gotowi do wydania is a session phrase from CLAUDE.md (K-B2)”** —
       `tryb.FRAZY_SESJI.includes('gotowi do wydania')`; `powodPominiecia` dla `gotowi do wydania?`,
       `Let's continue`, `Let’s continue` → `'fraza sesji'`.
    5. **„a path that starts with a slash is not a command (K-B2)”** —
       `/c/Users/x/log.txt - co tu jest?` → `null`; `/relai:relai-stage PLAN E3` i
       `/relai-prompt cos` → `'wywolanie komendy'`.
  - `session-title.test.js`: **„session phrases come from one list shared with prompt-mode (K-B2)”** —
    dla każdej frazy z `require('../prompt-mode.js').FRAZY_KONTYNUACJI`: `st.isContinuation(f) === true`
    i `powodPominiecia(f) === 'fraza sesji'`; `st.isContinuation('Let’s continue') === true`;
    `st.isContinuation('kontynuujemy pracę…') === true`.
  - `prompt-gate.test.js`: **„accepting the proposal passes untouched, a task without a question
    mark gets the gate (K-B2)”** — `p = projekt(t)` (bez zgody): `hook(p, 'Wykonaj propozycję')`,
    `hook(p, 'tak, wykonaj')`, `hook(p, 'opcja B')` → `''`; `hook(p, 'Do the migration of the settings parser')`
    i `hook(p, MERYTORYCZNY)` → pasują do `/\[RelAI bramka zgody\]/`.
  - **Istniejące testy, których oczekiwanie słusznie się zmienia: żaden** (zmierzone na
    prototypie, 49/49). Testy „powodPominiecia must not swallow a real instruction” i
    „powodPominiecia still gates a human prompt…” zostają bez zmian i są zielone.
- **Weryfikacja:** `node --test "core/process/tests/*.test.*"` → zielone, +7 wobec stanu po K-B1;
  `grep -n "let's continue" core/process/session-title.js` → brak trafień;
  `grep -c "gotowi do wydania" core/process/prompt-mode.js` → `1`.
- **Nie ruszasz:** treści reguły `regula()` i jej progu 400 znaków; obsługi ukośnika pełnej
  szerokości `／` (jest tylko w `STAGE_COMMAND` session-title); `RESUME_LINE`; hooka
  `adapters/claude-code/hooks/session-title.js`.
- **Pułapki:** `normalizuj` jest wspólny — zmiana działa też w `session-title`; dlatego testy
  `session-title.test.js` są w weryfikacji. Powiadomienie o zadaniu w tle przychodzi jako
  `UserPromptSubmit` i musi dalej być pomijane — testy „powodPominiecia skips a background task
  notification…” muszą zostać zielone. Lista `SLOWA_POTWIERDZENIA` nie może dostać czasownika
  z dopełnieniem (np. `zmien`, `dodaj`), bo wtedy krótkie zadanie przejdzie bez reguły — każde
  nowe słowo to decyzja człowieka (zasada 7). Tryb ciągły istnieje tylko w Claude Code; kopii
  filtra w Cursorze i Codeksie nie ma i nie tworzysz.
- **Gotowe, gdy:** siedem nowych testów zielonych; istniejące testy trzech plików zielone bez
  zmiany oczekiwań; kopia Codeksa zregenerowana.

---

## K-B4 — sesja zaczęta komendą: rytuał i przegląd spraw odroczone

- **Cel:** gdy pierwsza wiadomość sesji jest wywołaniem komendy (zaczyna się od `/`), model
  wykonuje komendę, a rytuał startu i przegląd spraw przeterminowanych odkłada do pierwszej
  wiadomości, która komendą nie jest. SessionStart nie zna jeszcze pierwszego promptu, więc nakaz
  jest warunkowy w tekście, a nie w kodzie.
- **Pliki:** `adapters/claude-code/hooks/session-context.js`, `adapters/cursor/hooks/session-context.js`,
  `core/process/session-signals.js`, `adapters/claude-code/skills/relai-core/SKILL.md`,
  `adapters/claude-code/skills/relai-core/overdue-review.md`, `adapters/cursor/rules/relai-core.mdc`,
  `CLAUDE.md`, `AGENTS.md`, `core/templates/SPEC_CLAUDE_MD.md`,
  `core/process/tests/ritual-copies.test.js`, `docs/ARTEFAKTY.md`; kopie generowane
  `adapters/codex/skills/relai-core/SKILL.md` i `adapters/codex/skills/relai-core/overdue-review.md`.
- **Kopie (sprawdzone grepem):** nakaz rytuału niosą hooki Claude Code i Cursora; przegląd spraw —
  `session-signals.js` (wołany przez oba hooki), `SKILL.md`, `overdue-review.md`, `relai-core.mdc`,
  `CLAUDE.md`, `AGENTS.md`, `SPEC_CLAUDE_MD.md` (brzmienie i przykład). **Hook Codeksa zostaje bez
  zmian:** mówi tylko „Before substantive work, run … start digest” (odczyt), nie wypisuje
  przeglądu spraw, a komendy RelAI są tam skillami — kolizji z B4 nie ma.
- **Stan dziś** — kotwice:
  1. `adapters/claude-code/hooks/session-context.js` (ok. linii 206–209):
     `'potem napisz akapit "gdzie jestesmy". Jesli dostepny jest skill relai-core, wywolaj go — ' +`
  2. `adapters/cursor/hooks/session-context.js` (ok. linii 134–137):
     `'"gdzie jestesmy". Reguly procesu masz w regulach ' +`
  3. `core/process/session-signals.js`, `sprawyPrzeterminowaneReport` (ok. linii 1715–1718):
     `'albo rozstrzygnac teraz. Procedura: plik overdue-review.md skilla relai-core. ' +`
  4. `SKILL.md` relai-core, linia 87: `Nie inicjalizuj niczego drugi raz. Wykonaj **rytuał startu** — raz na sesję, przed pierwszą merytoryczną odpowiedzią.`
  5. `overdue-review.md`, linia 20: `3. sesja jest interaktywna.`
  6. `relai-core.mdc`, linia 22: `` Run `node .claude/relai/tools/start-digest.js` and read its output — that is the whole start read. ``
  7. `CLAUDE.md` linia 31 i `AGENTS.md` linia 34, `SPEC_CLAUDE_MD.md` linia 270:
     `o kolejne `N` dni / rozstrzygnąć teraz. Sesja nieinteraktywna: sam raport, bez pytań — rozpoznajesz ją z kontekstu (`claude -p`, agent w tle); żaden hook jej nie sygnalizuje.`
     oraz `SPEC_CLAUDE_MD.md` linia 162 (brzmienie w cytacie): `> odroczyć o kolejne `N` dni, rozstrzygnąć teraz. Sesja nieinteraktywna: …`.
- **Zmiana:**
  1. **Hook Claude Code.** W zdaniu rytuału po `'potem napisz akapit "gdzie jestesmy". '` wstaw
     (gałąź `source === 'compact'` bez zmian):

     ```js
       'Wyjatek: gdy pierwsza wiadomosc sesji jest wywolaniem komendy (zaczyna sie od "/"), ' +
       'najpierw wykonujesz komende, a rytual startu odkladasz do pierwszej wiadomosci, ktora komenda nie jest. ' +
     ```

     Reszta zdania bez zmian. Bajty całego zdania: **355 → 543 B**. Fraza
     `wykonaj rytual startu sesji` zostaje (sprawdza ją `ritual-copies.test.js`).
  2. **Hook Cursora.** To samo zdanie wyjątku po `'"gdzie jestesmy". '`, przed
     `'Reguly procesu masz w regulach '`. Bajty: **321 → 509 B**.
  3. **Przegląd spraw.** W `sprawyPrzeterminowaneReport` po `'albo rozstrzygnac teraz. '` wstaw:

     ```js
       'Gdy pierwsza wiadomosc sesji jest wywolaniem komendy (zaczyna sie od "/"), najpierw ' +
       'wykonujesz komende, a ten przeglad odkladasz razem z rytualem startu do pierwszej ' +
       'wiadomosci, ktora komenda nie jest. ' +
     ```

     Linia `ZADANIE:` (przy `N` = 30): **425 → 627 B**. Gałąź `interaktywna === false` bez zmian.
  4. **`SKILL.md` relai-core**, po zdaniu z kotwicy 4 dopisz w tym samym akapicie: „Pierwsza
     wiadomość sesji jest wywołaniem komendy (zaczyna się od `/`) → najpierw wykonujesz komendę;
     rytuał startu i przegląd spraw przeterminowanych odkładasz do pierwszej wiadomości, która
     komendą nie jest.”
  5. **`overdue-review.md`**, pod listą trzech warunków (po kotwicy 5, pusta linia) dopisz:
     „Pierwsza wiadomość sesji jest wywołaniem komendy (zaczyna się od `/`) → pytania odkładasz do
     pierwszej wiadomości, która komendą nie jest; komenda idzie pierwsza i jej zakazy zapisu
     obowiązują do jej końca.”
  6. **`relai-core.mdc`**, po zdaniu z kotwicy 6 (nowa linia, ten sam akapit): „When the first
     message of the session is a command call (it starts with `/`), run the command first; the
     start ritual and the overdue review below wait for the first message that is not a command.”
  7. **`CLAUDE.md` i `AGENTS.md`** — na końcu akapitu „Sprawa przeterminowana” (po „żaden hook
     jej nie sygnalizuje.”) dopisz zdanie: „Pierwsza wiadomość sesji to komenda (zaczyna się od
     `/`) → najpierw komenda; rytuał startu i ten przegląd czekają na pierwszą wiadomość, która
     komendą nie jest.” Ten sam tekst w obu plikach (różnią się tylko nagłówkiem).
  8. **`SPEC_CLAUDE_MD.md`** — to samo zdanie na końcu cytatu brzmienia linii przeglądu (po
     „żaden hook jej nie sygnalizuje.” w linii zaczynającej się od `> odroczyć o kolejne`) i na
     końcu akapitu „Sprawa przeterminowana” w przykładzie (Parkly).
  9. `node adapters/codex/generate-skills.js`. `docs/ARTEFAKTY.md` — w czterech wierszach
     (`SKILL.md` relai-core, `overdue-review.md`, `relai-core.mdc`, `SPEC_CLAUDE_MD.md`): kolumna
     „Wersja” +1, kolumny „Data” i „Po co” bez zmian; na **początek** komórki „Co się zmieniło”
     wstaw wpis i spację przed dotychczasową treścią: `<RRRR-MM-DD> (wersja N, plan
     OPTYMALIZACJA_PO_AUDYCIE E9, K-B4): sesja zaczęta komendą — rytuał i przegląd spraw odroczone
     do pierwszej wiadomości, która komendą nie jest. Powód: audyt B4 — hook żądał rytuału
     z zapisami, a komenda wąska zakazuje zapisów.` Wpis zaczyna się od daty i `(wersja` — po tym
     kształcie rozpoznaje go skrypt `karty/zalaczniki/skroc-rejestr.js` (format karty K-R10
     z etapu E10).
- **Druga część B4 — komenda `/relai-prompt` wywołana wprost bez zgody sesji.** Po K-B2 odpowiedź
  przyjmująca propozycję („Wykonaj propozycję”, „tak, wykonaj”) jest pomijana przez filtr, więc
  bramka przy niej nie pada. **Zapis zgody przez komendę nie jest potrzebny i nie dodajesz żadnego
  mechanizmu.** Zakaz zapisu w „Zakazach tej komendy” zostaje bez zmian.
- **Test najpierw** (`core/process/tests/ritual-copies.test.js`, wszystkie **czerwone przed
  zmianą**):
  1. **„start hooks of Claude Code and Cursor defer the ritual when the first message is a
     command (K-B4)”** — fikstura `projekt()` z tego pliku; wyjście hooka Claude Code
     (`hook_event_name: 'SessionStart'`) i Cursora (`'sessionStart'`) pasuje do
     `/pierwsza wiadomosc sesji jest wywolaniem komendy/` i nadal do `/wykonaj rytual startu sesji/`;
     wyjście Claude Code z `source: 'compact'` do niego **nie** pasuje. Sprzątanie jak w teście
     obok (`finally`, znaczniki `path.join(os.tmpdir(), 'znaczniki-relai', 'ustawienia-podane-' + id)`
     — położenie po karcie K-C1 z etapu E7).
  2. **„the overdue review waits for the first message that is not a command (K-B4)”** —
     `const miara = { przeterminowane: [{ tresc: 'Decyzja o licencji', wiek: 40, odroczen: 0 }], pozycje: [{}, {}], N: 30 }`;
     ostatnia linia `core.sprawyPrzeterminowaneReport(miara)` pasuje do
     `/odkladasz razem z rytualem startu/` i do `/PARTIAMI PO CZTERY/`; żadna linia
     `core.sprawyPrzeterminowaneReport(miara, { interaktywna: false })` do pierwszego wzorca nie
     pasuje (kontrola: wejście sprawdzone na `main` — daje trzy linie, ostatnia `ZADANIE: …`).
  3. **„every copy of the start rule carries the command exception (K-B4)”** — pliki
     `CLAUDE.md`, `AGENTS.md`, `adapters/claude-code/skills/relai-core/SKILL.md`,
     `adapters/codex/skills/relai-core/SKILL.md`, `adapters/claude-code/skills/relai-core/overdue-review.md`,
     `adapters/codex/skills/relai-core/overdue-review.md`, `core/templates/SPEC_CLAUDE_MD.md` zawierają
     `która komendą nie jest` (dla `SPEC_CLAUDE_MD.md` co najmniej dwa trafienia);
     `adapters/cursor/rules/relai-core.mdc` zawiera `the first message that is not a command`.
     Odczyt z normalizacją `\r\n` → `\n`.
- **Weryfikacja:** `node --test core/process/tests/ritual-copies.test.js` → zielone, +3;
  `node --test "adapters/cursor/tests/*.test.js"` i `node --test "adapters/codex/tests/*.test.js"`
  → zielone, liczby bez zmian; `diff CLAUDE.md AGENTS.md | grep -c "^[<>]"` → ta sama liczba co
  przed kartą; `wc -c CLAUDE.md` → poniżej 10 240.
- **Nie ruszasz:** hooka Codeksa; gałęzi po kompakcji; zdania o trybie ciągłym na starcie (A5);
  linii „kończymy na dziś” w `CLAUDE.md` i `SPEC_CLAUDE_MD.md` (K-E1r w E1, K-E1 w E10); kosztu
  startu (E07) i skrótu startu (E08); śladów błędów w hookach (E04); `relai-prompt.md` w tej karcie.
- **Pułapki:** etapy E04 i E07 mogły zmienić otoczenie zdania rytuału w `session-context.js`
  (śledzenie błędów, K-A6) — kotwicą jest fragment `potem napisz akapit "gdzie jestesmy".`;
  jego brak → zatrzymanie. Hook startu w Twojej sesji to 3.7.0 — zdania wyjątku nie zobaczysz
  w swoim kontekście; dowodem jest test. Teksty hooków piszesz w ASCII (bez polskich liter).
  `CLAUDE.md` ma sekcję niemutowalną — ta zmiana jej nie dotyka, ale `config-protection` może
  zapytać; człowiek potwierdza. `CLAUDE.md` i dokumenty z backtickami edytujesz narzędziem Edit.
- **Gotowe, gdy:** trzy nowe testy zielone; `ritual-copies.test.js` w całości zielony; kopie
  Codeksa zregenerowane; cztery wiersze `ARTEFAKTY.md` podbite.
