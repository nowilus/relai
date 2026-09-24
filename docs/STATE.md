# STATE — RelAI

Stan na: 2026-09-24 (po etapie E2 planu PROWADZENIE_END_TO_END — wydanie 2.4.0)

## Gdzie jesteśmy

RelAI ma w repozytorium **2.4.0** — wydanie z etapu E2 planu PROWADZENIE_END_TO_END (lżejszy
start sesji; poprzednio 2.3.1 z E1). Plugin działa w trzech narzędziach — Claude Code, Cursorze i Codeksie — na jednym
rdzeniu procesu, z czternastoma komendami. Start sesji kosztuje teraz mniej i liczy uczciwie
wszystko, co naprawdę czyta; następny krok to podział największych instrukcji na części czytane
na żądanie. Ostatni pilotaż z użytkownikami zamknięto przed wysyłką
zaproszeń, więc opinii spoza projektu nadal nie ma.

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
- Załoga deleguje zadania do trzech narzędzi (zmierzone z Claude Code jako gospodarzem); recenzent
  nie dostaje prawa zapisu, dwa zadania nie piszą naraz do jednego pliku.
- Dokumenty nie puchną bez końca: stara historia idzie do archiwum w całości, z sumą kontrolną,
  a rotacja zabiera najstarsze pozycje, aż cały plik zejdzie poniżej 60% progu.
- Sprawy czekające na człowieka mają jeden adres i wracają jako pytanie, gdy czekają zbyt długo.
- Każdy próg ma adres w raporcie startu sesji; poniżej progu raport milczy.
- Klucz API nie wejdzie do repozytorium (pre-commit w każdym narzędziu, także w projektach ESM),
  a guard pilnuje projektu, do którego idzie zapis.
- Pliki robocze sprząta się raportem w grupach, jednym „tak" na grupę; plik śledzony nie jest
  kandydatem nigdy.
- Pytanie o model pokazuje nazwy z listy narzędzia; lista odświeża się po zgodzie na sieć.
- Proces przeżywa zmianę dostawcy modelu — cały etap poprowadził model spoza Anthropic.
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- **E3 planu PROWADZENIE_END_TO_END — skille w progresywnym ujawnianiu** (gotowy do startu). Dwa
  największe skille schodzą poniżej 500 linii, procedury rzadkie idą do plików doczytywanych na
  żądanie, a walidator pilnuje, żeby oba adaptery miały tę samą treść. Po co: skill ładowany na
  pierwszym prompcie to dziś ponad połowa kosztu startu (65,6 z 123,7 KB).

## Co dalej

- **E4–E7 planu** [PROWADZENIE_END_TO_END](plany/PROWADZENIE_END_TO_END/STATUS.md): zasady
  pod model, pierwsze 30 minut (w tym render demo pod telefon),
  debug / bezpieczeństwo / deploy, jakość pracy solo i załogi.
- Przed E4: odświeżenie listy modeli Codeksa (bramka manualna planu).
- Odnoga `OPIS_REPO` — opis i tematy repozytorium na GitHubie; opis manifestu nadal mówi
  o jednym narzędziu.
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

Repozytorium i publicznie: **2.4.0** (tag `v2.4.0`, release Latest). Źródło instalacji: własny
marketplace w tym repozytorium, scope `user`. Wydanie potwierdzasz treścią plików z cache'u, nie
komunikatem CLI (P-005): `claude plugin validate` → tag → push → release → `marketplace update` →
`plugin update relai@relai` → suma plików po CRLF → LF. Walidator `core/tools/validate-adapters.js`
sprawdza 7 źródeł wersji, w tym baner README i tę sekcję „Gdzie jesteśmy". Pre-commit tego repo:
układ 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji (`process/session-signals.js`), artefakty robocze, załoga, tryb ciągły, baza reguł
optymalizatora, walidator. **Adapter Claude Code**: dwa skille, 14 komend, 4 agenci, 11 hooków,
lista modeli. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki, instalator. **Adapter Codex**:
natywny manifest, 14 skilli, router `AGENTS.md`, trzy hooki.

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 8 (ostatni PIERWSI_UZYTKOWNICY, częściowo, 2026-09-24) • Aktywny:
PROWADZENIE_END_TO_END, E2/7 zrealizowany, E3 gotowy • Start sesji: **123,7 KB / 140 KB** (skill 65,6 KB) • Dziennik: **91,8 KB / 150 KB** (po rotacji
2026-09-24 i wpisie E2 (archiwum: 9 plików)) • Sekcja ryzyk: **5,3 KB / 12 KB**, 11 otwartych, archiwum
ryzyk: 4 pliki + 1 mitygacji • Lekcje: 56 KB / 50 KB — rotacja należna • Adaptery: 3 •
Komendy: 14 • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) • Modele, na
których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6).
