# STATE — RelAI

Stan na: 2026-10-10 (plan PANEL_CLAUDE zamknięty; wydanie 2.8.0 publicznie z trzema pluginami panelu)

## Gdzie jesteśmy

RelAI **2.8.0** jest w repozytorium i publicznie (tag `v2.8.0`, release Latest, wydane 2026-10-09).
Plan PANEL_CLAUDE jest zamknięty 2026-10-10: 9/9 etapów, Aneksy A–E. Dał panel RelAI w oknie Claude
Code jako trzy osobne pluginy w marketplace RelAI, „early access”, na modach Claude Code (zmierzone
na 2.1.293): `relai-panel` 0.9.0 (pasek planu, `/relai-panel` z formularzami komend, mapą planów,
dokumentami i kosztami sesji, karta „Tak / Nie” przed każdą zmianą), `relai-progress` 0.2.0 (postęp
etapu, `/relai-agents`) i `relai-cache-keeper` 0.3.0 (licznik cache promptu). `/relai-stage`
przyjmuje zgodę z karty panelu. Instalacja komendami z README jest zmierzona na żywo. Plugin `relai`
działa w trzech narzędziach — Claude Code, Cursorze i Codeksie — na jednym rdzeniu procesu,
z czternastoma komendami. Aktywny plan: PANEL_CODEX, zaakceptowany 2026-10-10; E1 W TOKU. Aneks A zaakceptowany; natywny widok i wiadomość do bieżącego czatu potwierdzone sondą 0.0.7. Minimalny pakiet 0.1.0 działa w sondzie 0.0.8 w czacie kontrolnym; układ zaakceptowany; sonda 0.0.9 z poprawką fontów gotowa, pomiar po restarcie i świeży szkic czekają. Opinii spoza projektu
nadal nie ma.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach; istniejący przechodzi adopcję
  z kopią zapasową i przetestowaną drogą powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od stanu.
- Plany powstają jako osobny dokument z wariantami i ryzykami (dla odbiorcy nietechnicznego jako
  HTML bez internetu); boczny wątek dostaje własną kartę bez ruszania zamrożonego planu.
- Czternaście skrótów: etap, odnoga, kopia zapasowa, przegląd, lista zmian, przekazanie, wycieczka,
  ściąga, adopcja, aktualizacja, sprzątanie, lista modeli, załoga, optymalizator promptu.
- Podyktowane zdanie może wrócić poprawione, zanim ruszy w robotę — na żądanie albo w trybie
  ciągłym, o który sesja pyta raz; oryginał stoi obok propozycji.
- Załoga deleguje zadania do trzech narzędzi; recenzent nie dostaje prawa zapisu, dwa zadania nie
  piszą naraz do jednego pliku, meldunek bez dowodu dostaje najwyżej dwie kontynuacje.
- Zadanie z kodem kończy się uruchomieniem testów projektu i przeglądem diffu, zgłoszonymi trzema
  liniami; „coś nie działa" i pierwsze wdrożenie mają własne procedury.
- Na starcie sesji zgłaszane jest to, co zostało niedomknięte: brakujący prompt etapu, etap bez
  wpisu w dzienniku, artefakt bez podbitej wersji, rozjechana kopia `CLAUDE.md`, rozjazd stanu.
- Dokumenty nie puchną bez końca: stara historia idzie do archiwum w całości, z sumą kontrolną,
  a rotacja zabiera najstarsze pozycje, aż cały plik zejdzie poniżej 60% progu.
- Sprawy czekające na człowieka mają jeden adres i wracają jako pytanie, gdy czekają zbyt długo.
- Klucz API nie wejdzie do repozytorium (pre-commit w każdym narzędziu, także w projektach ESM),
  a guard pilnuje projektu, do którego idzie zapis.
- Pliki robocze sprząta się raportem w grupach, jednym „tak" na grupę; plik śledzony nie jest
  kandydatem nigdy.
- Pytanie o model pokazuje nazwy z listy narzędzia; prompt przerobiony przez `/relai-prompt` jest
  skrojony pod model, który go wykona, według reguł dostawcy z datą odczytu.
- **Panel RelAI w Claude Code** (plan [PANEL_CLAUDE](archiwum/plany/PANEL_CLAUDE/STATUS.md),
  zamknięty 2026-10-10): trzy pluginy z marketplace RelAI, instalowane osobno — pasek planu,
  postępu i cache nad promptem, `/relai-panel` (komendy, mapa, dokumenty, ściąga, frazy, koszty),
  `/relai-agents`; każda zmiana stanu przez kartę „Tak / Nie”, jedyny ruch sieciowy to strona
  cennika Anthropic po „Tak”. „Early access” — działa na modach Claude Code (2.1.293).
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- Plan Codeksa [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md) przygotowany jako osobny HTML,
  **ZAAKCEPTOWANY 2026-10-10**; poprzednik PANEL_CLAUDE zamknięty, przejęcie sprawdzone
  i aneks D-80 dla adaptera Codeksa zapisany po jawnej akceptacji człowieka. Autor i wykonawca: **gpt-6.1-sol w Codeksie**. 8 etapów;
  plan uzgodniony 2026-10-10 z istniejącym rdzeniem, schematem pomiarów i ograniczeniami Claude;
  przejęcie zweryfikowane (263 testy repo i 70/16/19 testów pluginów). Prompt E1 wygenerowany, etap
  **W TOKU** po karcie relai-stage i odpowiedzi „tak” w świeżym czacie 01a1254c-f7af-7ce3-bb44-6029ad615eb0.
  Sonda 0.0.7/PID 62300 działa w rzeczywistym rendererze chatgpt 26.1007.21434;
  kliknięcie statusu dało relai-e1-active w właściwym macierzystym czacie RelAI.
  Minimalny pakiet adapters/codex/panel/ 0.1.0 przechodzi build/check:build,
  13/13 testów i audyt (0 podatności). Repo: 263/263; walidator i kopie exit 0,
  core/panel i pluginy Claude nietknięte. Sonda 0.0.8 bundluje ten sam pakiet;
  w czacie kontrolnym 01a12590-0b6d-7d40-affe-7e54f80313da, PID 38988,
  najnowsza karta 3 pokazuje RelAI, PANEL_CODEX/E1 W TOKU. Starsze karty 1/2
  nie zawierały nowego kształtu stanu — nie były wynikiem aktualnego wywołania.
  Geometria 780/320 px z kontrolą pozytywną przeszła; układ zaakceptowany przez Łukasza.
  Natywny odczyt fontów ujawnił font zastępczy; lokalna kontrola pozytywna poprawna.
  Sonda 0.0.9 deklaruje osadzone zasoby data:, ustawia font main i zapisuje dowód ładowania.
  Build, kontrola MCP i 13/13 przeszły; natywne fonty po poprawce jeszcze niepotwierdzone.
  Szkic 0.0.7 odrzucony przez helper SDK przed gospodarzem; 0.0.8 używa bazowego API.
  W macierzystym czacie nadal 0.0.7, więc rzeczywista próba nowego szkicu i przycisków
  pakietu czeka na przeładowanie. Dalsza diagnostyka w czacie kontrolnym zatwierdzona,
  bez mostków wysyłających wiadomości, nowych czatów ani zmian repo przez ten czat.
  Kontrakt i ograniczenia:
  [README adaptera](../adapters/codex/panel/README.md). Eksport RECORD_FIELDS ma 16 pól,
  przy błędnej liczbie 17 w pierwotnym planie; **Aneks A zaakceptowany 2026-10-10**
  i zapisany w PLAN.html, PRZEJECIE oraz prompcie E1 v2. Sekcje 1–9 planu nietknięte.

## Co dalej

- Kontynuacja E1 [PANEL_CODEX](plany/PANEL_CODEX/PROMPT_ETAP_1.md): przeładować
  macierzystego klienta MCP (nadal 0.0.7), otworzyć sondę 0.0.9 i zmierzyć jej
  fonty, przyciski oraz świeży szkic z właściwym projektem. Układ zaakceptowany,
  Aneks A rozstrzygnięty; E2 OCZEKUJE, brak promptu E2 zamierzony do odbioru E1.
- **Bramka E5 planu PANEL_CLAUDE, pominięta decyzją człowieka 2026-10-10:** start etapu z karty
  panelu bez drugiego pytania w czacie i `/relai-stage` bez znacznika z kartą jak przed E5 nie są
  zmierzone na żywo (testy pokrywają oba przebiegi). Warunek wykonalności spełniony od wydania
  2.8.0: projekt-sonda z etapem `GOTOWY DO STARTU`, karta w panelu, „Tak” w świeżym czacie.
- Sprzątanie plików pomiarów `.claude/relai/pomiary/` (ryzyko C11) świadomie odłożone — wraca,
  gdy folder przekroczy 10 MB.
- Pierwszy start sesji w ExpensesManager pod 2.8.0 kładzie `package.json` przy kopiach narzędzi
  (P-007); obejście `.cjs` przestaje wtedy być potrzebne — do sprawdzenia przy następnej sesji tam.
- **Bramki świadomie otwarte przy zamknięciu planu** (po restarcie pod 2.7.0, w sesji
  interaktywnej): pierwszy prompt merytoryczny z trybem ciągłym, bez zgody i bez modelu, daje
  **jedno** okno pytań (Aneks F); zakończone zadanie w tle nie dostaje pytania o zgodę (Aneks H).
- Odświeżenie listy modeli Codeksa w sesji Codeksa (`/relai-models`): lista ma nazwy z 2026-09-05,
  odczyt z 2026-09-24 wskazywał gpt-6-astra, gpt-6-sol i gpt-6-luna; do tego czasu nakładka `openai` nie ma
  reguł z nazwą modelu, a przydział modeli poza Claude Code jest sprawą człowieka.
- **Wątek `AUDYT_MODOW` w `docs/fixy/` (od 2026-10-10)** — mody Claude Code po audycie: dziewięć
  paczek (panel bez I/O w rysowaniu, paski bez pustych przerysowań, poprawność `/clear` i wyceny,
  funkcja „kontynuować czy nowa sesja”, paski i panel wg briefu v2, jedno źródło formatów i cen,
  testy liczące rysowania, wydanie 0.10.0 / 0.3.0 / 0.4.0). Audyt: 94 ustalenia z werdyktami
  w [RAPORT.html](fixy/AUDYT_MODOW/RAPORT.html); decyzje wizualne po czterech rundach makiet
  ([MAKIETY.html](fixy/AUDYT_MODOW/MAKIETY.html)) zamrożone w briefie v2
  ([STYL_PASKOW_CLAUDE.md](zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md)). Wykonawca: Opus 5.5 ze
  świeżej sesji ([PROMPT_ODNOGA.md](fixy/AUDYT_MODOW/PROMPT_ODNOGA.md)); zakres: adapter Claude
  i `core/panel/theme.mjs`, rdzeń nietykalny (kontrakt PANEL_CODEX).
- Wątek `OPIS_REPO` w `docs/fixy/` — opis i tematy repozytorium na GitHubie; opis manifestu nadal
  mówi o jednym narzędziu.
- Projekty z pre-commitem sprzed 1.9.3 (PolyFlow, JiraManager) wymagają ponownej instalacji hooka.
- Migracja JiraManagera czeka na okno właściciela (ryzyko R5).
- Dwie znane wady narzędzia sprzątania (`work-artifacts.js`): `kasuj` melduje `skasowane` dla
  ścieżki nieistniejącej, `zachowaj` na cudzej ścieżce pisze marker w projekcie sesji. Obejście:
  ścieżki ukośnikami, po operacji sprawdzaj stan katalogu.
- `PRZENOSNOSC.md` sekcja 2.3 (wywołanie procedur Codeksa) jest nieaktualna.
- Usunąć metadane sesji `ProbaCursorE6` z `~/.claude/` i `~/.cursor/` (sprawa człowieka od 2026-09-01).
- W PolyFlow: 60 martwych linków w „Czeka na człowieka" oraz należna rotacja lekcji i ryzyk.

## Co blokuje

- Ochrona konfiguracji jest doradcza (`ask`): w sesji z automatyczną akceptacją przepuszcza zapis.
- Sesja Cursora otwarta w tym folderze nie ma kontekstu RelAI ani blokady sekretu (D-89).
- Świeża sesja CLI bywa niedostępna — etap oparty na niej sprawdza ją przed startem.
- Decyzje czekające na człowieka: sekcja „Czeka na człowieka" w dzienniku.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium i publicznie: **2.8.0** (tag `v2.8.0`, release Latest, 2026-10-09; E7 planu PANEL_CLAUDE); zainstalowane na koncie właściciela razem z trzema pluginami panelu, aplikacja po restarcie ładuje nowe wersje (znaczniki `.in_use` w cache). Źródło instalacji: własny marketplace w tym repozytorium, scope `user`; od 2.8.0 marketplace niesie cztery pluginy — `relai` i trzy pluginy panelu z własnymi wersjami. Wydanie potwierdzasz
treścią plików z cache'u, nie komunikatem CLI (P-005): `claude plugin validate` → tag → push →
release → `marketplace update` → `plugin update relai@relai` → suma plików po CRLF → LF. Walidator
`core/tools/validate-adapters.js` sprawdza 7 źródeł wersji, w tym baner README i tę sekcję
„Gdzie jesteśmy", a wpis marketplace każdego pluginu panelu porównuje z `plugin.json` tego
pluginu (wpis bez wersji to błąd). Pre-commit tego repo: układ 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji (`process/session-signals.js`, z siatką rytuału), artefakty robocze, załoga (z oceną meldunku),
tryb ciągły, baza reguł optymalizatora z nakładkami rodzin modeli (`claude`, `openai`), walidator.
**Adapter Claude Code**: dwa skille (każdy poniżej 500 linii, razem 9 plików doczytywanych),
14 komend, 4 agenci, 11 hooków, lista modeli. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki,
instalator. **Adapter Codex**: natywny manifest, 14 skilli, router `AGENTS.md`, trzy hooki (start
sesji kopiuje listę modeli).

### Panel `relai-panel` i rodzina pluginów (plan PANEL_CLAUDE, zamknięty 2026-10-10)

Trzy pluginy Claude Code Mods w tym repo (silnik 2.1.293, „early access”), każdy z kopią rdzenia
`core/panel/` z `sync-panel-core.js`; nad promptem trzy paski cache → plan → postęp w stylu
`docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` (miękkie tło, siatka etykieta | treść | liczba,
`BAND`/`BAR` w `theme.mjs`). Korzeń projektu szukany w górę od katalogu sesji (P-021).
**`panel/`** (`relai-panel` 0.9.0; od E7 moduł hooków `register.tsx` trzyma stan, kolektor,
odczyty i działania z `$`, a widoki rysują `band.tsx`, `pane-parts.tsx` i `pane-commands`, `-map`,
`-docs`, `-costs.tsx` bez `$` — P-023 pkt 10): pasek planu (plan, etap, status, koszt sesji z
`$.session.usage()` jako hipotetyczny koszt API, liczba etapów). **`progress/`** (`relai-progress`
0.2.0, fork `savvy-progress` — MIT, johnnyvizz): pasek postępu etapu albo biegu `/relai-crew`
z checkboxów promptu, pocięty na segmenty z podpowiedzią po najechaniu (Svg na desktopie, znaki
w terminalu), odświeżany po edycji i co 10 s; przycisk „Panel RelAI”; panel `/relai-agents` —
punkty etapu i subagenci sesji z modelem, kontekstem i kosztem z pomiarów E3. **`cache-keeper/`**
(`relai-cache-keeper` 0.3.0, dawny prywatny `cache-keeper-pl`): timer cache, podtrzymanie
(`$.model.fork`) i przekazanie wyłącznie na żądanie człowieka — R7 („nie woła modelu”) dotyczy
tylko dwóch pierwszych (Aneks C). Poza projektem RelAI wszystkie milczą; paski innych wtyczek
zostają (owijacz woła `next`, bez `width` — P-017). Zmierzone na żywo na desktopie i w terminalu.
Komenda `/relai-panel` otwiera panel boczny (tylko z komendy, nigdy sam): formularze 14 komend
z podglądem dokładnego tekstu i przyciskiem „Wyślij” (`$.command.run`, nazwa z `$.command.list()`),
ściągę z `docs/KOMENDY.md` z wyszukiwaniem i frazy sesji wysyłane przyciskiem (`$.prompt.submit`).
Bez pluginu `relai` panel niczego nie wysyła; poza RelAI komenda odpowiada jednym zdaniem.
Formularze pilnuje test parujący je z `argument-hint` nagłówków komend. Wygląd (E8, wybrany przez
człowieka po kalibracji trzech wariantów na żywo): motyw RelAI z bloku `:root` szablonu planów
(`core/panel/theme.mjs` — kolory przepisane i ich mieszanki na ciemne tło, kontrast tekstu na
kartach ≥ 4,5:1 pilnowany testem), na górze „Polecane teraz” (etap, prompt, wycieczka; karta etapu
pokazuje bieżący plan i etap), niżej trzy grupy kart z ikonami 14 komend; formularz rozwija się
w karcie. Nagłówki Kalamem jako Svg z fontem przyciętym do liter napisu
(`core/tools/build-panel-headings.js` → `core/panel/headings.mjs`, wymaga fontTools), ikony z
`docs/zasoby/branding/ikony/` w module `icons.mjs` składanym przez `sync-panel-core.js`. Przyciski
natywne aplikacji, kliknięcie odpowiada błyskiem ramki karty i etykietą „✓ Wysłano” przez 0,9 s.
Terminal: te same karty tekstem w tych samych kolorach, bez grafiki. Ograniczenia silnika: P-018.
**Pomiar kosztów (E3):** kolektor zapisuje każde wywołanie modelu sesji RelAI — wątek główny
i subagenci (`turn.step`), kompakcje (`session.compact`) — do `.claude/relai/pomiary/<data>-<sesja>.jsonl`
(poza gitem, plik na sesję, rekord bez treści: sesja, tura, indeks, agent, model, cztery kategorie
tokenów, pole `tool` — schemat wspólny z panelem Codeksa). Rachunki w `core/panel/measure.mjs`
(klucz bez podwójnego liczenia, braki słowami), cennik z datą w `core/panel/pricing.mjs` (zapis
cache: wątek główny 1 h, subagent i kompakcja 5 min — P-020), wykresy w `core/panel/charts.mjs`.
Zakładka „Koszty": suma sesji z kategoriami, kafle licznika Claude Code (jak `/cost`, reszta poza
pętlą słowami), cache i całego projektu, wywołania w czasie z osią Y i podpowiedziami po najechaniu,
agenci, modele, etapy sesji z kontrolą „etapy i poza etapem = suma sesji”; kwoty i procenty
z dwoma miejscami.
**Mapa i koszt etapu (E4):** rekord pomiaru niesie etap `W TOKU` aktywnego planu (`stage`) i zadanie
`/relai-crew` (`task`, z linii `RelAI crew run: …` promptu subagenta); rekord sprzed E4 bez tych pól
idzie do „poza etapem — sprzed znacznika”. Rachunki: `core/panel/attribution.mjs` (każdy rekord
w jednej pozycji, suma co do centa), `core/panel/flow.mjs` (plany, etapy z datą, odnogi w obu
kształtach, fale załogi regułą `crew.js`, scalanie). Zakładka „Mapa”: aktywny plan z paskiem
segmentów etapów i kosztem, etapy rozwijane do rozbicia kosztu, odnóg i zadań, inne plany,
przebiegi załogi (fale, zależności, scalanie i przypisanie do etapu jako widok w
`.claude/relai/panel/scalenia.json` — pliki przebiegu nietknięte), „Poza etapem”, archiwum planów.
**Decyzje w panelu (E5):** każde działanie zmieniające stan idzie przez kartę „Do potwierdzenia”
(R4; rachunki w `core/panel/decisions.mjs`, opcjonalny drugi krok dla E6) — przed „Tak” nic nie
idzie do czatu ani na dysk. `/relai-stage` z panelu: karta z modelem sesji wobec planu, etapem,
katalogiem roboczym i liczbą punktów weryfikacji; „Tak” wysyła (w świeżym czacie po `/clear`)
komendę ze znacznikiem `--zgoda-panelu <id>` — procedura `/relai-stage` (i wygenerowany z niej
skill Codeksa) przyjmuje go jako zgodę D-35 i nie pyta drugi raz; hook panelu wycina znacznik
z każdego wywołania, które widzi, a wysyłka samego panelu go omija (P-022). „Kopiuj prompt” do
ręcznego otwarcia sesji. `/relai-update` i `/relai-models` z kartą stanu z plików; `/relai-clean`
z listą grup z raportu (`$.process.run` z jednym zamkniętym argv, nic zaznaczone na starcie);
skład `/relai-crew` edytowalny przed startem przebiegu (zapis `zadania.json` po „Tak”). Nowa
procedura `/relai-stage` czeka na wydanie `relai` w E7; pomiar na żywo startu bez drugiego
pytania — bramka E7.
**Dokumenty i cennik (E6, Aneksy D i E):** zakładka „Dokumenty” — wszystkie dokumenty projektu
(`CLAUDE.md`, `AGENTS.md`, `docs/`) jako ikony z typem pliku (MD, HTML, PDF… konturami Kalam),
filtr „Zmienione / Wszystkie” (zmienione na górze: najpierw z tej tury, potem od ostatniego
commita z liczbą linii), układ „Kafle” (półka w grupach) albo „Drzewo” jak eksplorator VS Code
(foldery otwarte/zamknięte, nazwy bez ścieżek, domyślnie zwinięte; limit 60 wierszy i 40 plików na
folder — większe drzewo desktop gubi bez słowa, P-023); wybrany dokument otwiera okno pod sobą:
„Zmiany” (`git diff HEAD` jednego pliku z listy, zamknięty argv, rysowany wierszami jak code review)
albo „Podgląd” (Markdown, kod, PDF słowem) — `core/panel/documents.mjs`; znacznik „w tej turze” z
`toolUses` kroków tury (Edit/Write/MultiEdit/NotebookEdit, także subagentów; zapisu poleceniem
powłoki nie widzi i mówi to). W „Kosztach” sekcja „Cennik”: data i źródło, ostrzeżenie po progu
z wiersza „Cennik panelu” w `docs/USTAWIENIA.md` (30 dni), przypomnienie o modelu bez ceny z liczbą
rekordów, modele z pomiarów projektu z kwotą; „Zaktualizuj cennik” → karta → po „Tak” jeden odczyt
strony cennika Anthropic (`fetchPricingPage`) → różnica stara–nowa → zapis datowanej wersji do
`.claude/relai/panel/cennik.json` po drugim „Tak”; „Nie” wycisza przypomnienie do zmiany daty
cennika. Parser strony ścisły (wiersz nierozpoznany → nic nie jest zapisane), stawki per model
z cache i progiem długiego promptu; rekord wyceniany wersją obowiązującą w chwili pomiaru (R6),
model dotąd bez ceny — pierwszą, która go zna. Zmierzone na żywo na desktopie 2026-10-09.
`relai-panel` i `relai-progress` nie wołają modelu i nie dopisują nic do kontekstu; jedyny ruch
sieciowy to odczyt strony cennika w `relai-panel` po „Tak” (wyjątek od R7, Aneks D). Rachunki: `core/panel/*.mjs`
(ESM — silnik nie ładuje CommonJS ani importu spoza folderu pluginu); `panel/hooks/core/` to kopia
bajt w bajt z `node core/tools/sync-panel-core.js` (też `progress/hooks/core/`,
`cache-keeper/hooks/relai/`), pilnowana testem. Testy: `claude plugin test` w `panel/`, `progress/`
i `cache-keeper/` (binarka 2.1.293) i `core/panel/tests/`.

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie; siatka wersji artefaktów
bez gita milczy).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
ostatni: [PROWADZENIE_END_TO_END](archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 10 (ostatni PANEL_CLAUDE, 2026-10-10) • Aktywny: PANEL_CODEX (ZAAKCEPTOWANY 2026-10-10, E1 W TOKU) • Start sesji:
**88,6 KB / 100 KB** (bez aktywnego planu; po E6 98,2 KB) • Dziennik: **~200 KB / 150 KB** (rotacja należna) • Sekcja ryzyk: 12 otwartych, archiwum ryzyk: 4 pliki
+ 1 mitygacji • Lekcje: **59,4 KB / 50 KB** (rotacja należna), 37 w żywym pliku • Adaptery: 3 • Komendy: 14 •
Testy rdzenia i adapterów: 263 (z `core/panel/`) + 13 testów pakietu panelu Codeksa + 105 testów pluginów (`relai-panel` 70, `relai-progress` 16, `relai-cache-keeper` 19) • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) •
Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto, Grok 4.6).
