# STATE — RelAI

Stan na: 2026-09-24 (plan PROWADZENIE_END_TO_END zamknięty; wydanie 2.7.0 w repozytorium)

## Gdzie jesteśmy

RelAI ma w repozytorium **2.7.0** — jedno wydanie po etapach E5–E7 planu PROWADZENIE_END_TO_END,
który zamknął się tego samego dnia (7/7 etapów); wydanie jest publiczne (tag `v2.7.0`, release
Latest), a w aplikacji działa po restarcie. Plugin działa w trzech narzędziach — Claude Code, Cursorze i Codeksie — na
jednym rdzeniu procesu, z czternastoma komendami. Plan dał lżejszy start sesji, skille czytane
na żądanie, prompty skrojone pod model, README od pierwszego kroku, procedury dla usterki i pierwszego
wdrożenia, a na koniec pilnowanie jakości: „gotowe" przychodzi z wynikiem testów, niedomknięty rytuał
jest zgłaszany na starcie, a członek załogi nie kończy samym meldunkiem. Aktywnego planu nie ma.
Opinii spoza projektu nadal nie ma — pilotaż z użytkownikami zamknięto przed wysyłką zaproszeń.

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
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- Nic w toku.

## Co dalej

- **Restart aplikacji desktopowej**, żeby sesje ładowały 2.7.0 (P-005) — instalacja i cache
  `relai/relai/2.7.0` już są, sumy plików zgodne z repo.
- **Bramki świadomie otwarte przy zamknięciu planu** (po restarcie pod 2.7.0, w sesji
  interaktywnej): pierwszy prompt merytoryczny z trybem ciągłym, bez zgody i bez modelu, daje
  **jedno** okno pytań (Aneks F); zakończone zadanie w tle nie dostaje pytania o zgodę (Aneks H).
- Odświeżenie listy modeli Codeksa w sesji Codeksa (`/relai-models`): lista ma nazwy z 2026-09-05,
  Codex zaleca dziś gpt-6-astra, gpt-6-sol i gpt-6-luna; do tego czasu nakładka `openai` nie ma
  reguł z nazwą modelu, a przydział modeli poza Claude Code jest sprawą człowieka.
- Rotacja `LEKCJE.md` (ponad progiem 50 KB) przy najbliższym „kończymy na dziś".
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

Repozytorium i publicznie: **2.7.0** (tag `v2.7.0`, release Latest, 2026-09-24). Źródło instalacji: własny marketplace w tym repozytorium, scope `user`. Wydanie potwierdzasz
treścią plików z cache'u, nie komunikatem CLI (P-005): `claude plugin validate` → tag → push →
release → `marketplace update` → `plugin update relai@relai` → suma plików po CRLF → LF. Walidator
`core/tools/validate-adapters.js` sprawdza 7 źródeł wersji, w tym baner README i tę sekcję
„Gdzie jesteśmy". Pre-commit tego repo: układ 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji (`process/session-signals.js`, z siatką rytuału), artefakty robocze, załoga (z oceną meldunku),
tryb ciągły, baza reguł optymalizatora z nakładkami rodzin modeli (`claude`, `openai`), walidator.
**Adapter Claude Code**: dwa skille (każdy poniżej 500 linii, razem 9 plików doczytywanych),
14 komend, 4 agenci, 11 hooków, lista modeli. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki,
instalator. **Adapter Codex**: natywny manifest, 14 skilli, router `AGENTS.md`, trzy hooki (start
sesji kopiuje listę modeli).

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie; siatka wersji artefaktów
bez gita milczy).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
ostatni: [PROWADZENIE_END_TO_END](archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 9 (ostatni PROWADZENIE_END_TO_END, 2026-09-24) • Aktywny: brak • Start sesji:
**88,6 KB / 100 KB** (bez aktywnego planu; po E6 98,2 KB) • Dziennik: **128,8 KB / 150 KB** • Sekcja ryzyk: 12 otwartych, archiwum ryzyk: 4 pliki
+ 1 mitygacji • Lekcje: **71,6 KB / 50 KB** — rotacja należna • Adaptery: 3 • Komendy: 14 •
Testy rdzenia i adapterów: 89 • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) •
Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto, Grok 4.6).
