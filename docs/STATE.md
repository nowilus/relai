# STATE — RelAI

Stan na: 2026-09-04

## Gdzie jesteśmy

RelAI jest wydany w **1.9.1** i działa w dwóch narzędziach — Claude Code oraz Cursorze — z tym samym
kompletem dokumentów i tym samym procesem. Ostatnie wydanie domknęło temat modeli: pytanie „na jakim
modelu to wykonać" pokazuje nazwy dostępne w danym narzędziu zamiast trzech ogólnych klas, listę da
się odświeżyć jedną komendą, a stara lista sama się przypomina. Poprawka 1.9.1 z tego samego dnia
usunęła defekt, przez który raport plików roboczych wywracał się na katalogu wątku pobocznego.
Adapter Cursora ma od dziś przebieg na **1.9.1 we własnym narzędziu** — instalacja, zdania o liście
modeli, blokada sekretu przez opakowanie powłoki i deinstalacja z cudzym wpisem. Żadnego planu
nie prowadzimy teraz aktywnie — jedyny niezamknięty czeka na dostęp do narzędzia, którego jeszcze
nie mamy. Największa otwarta rzecz jest poza kodem: RelAI nie miał jeszcze użytkownika spoza autora.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie, bez uczenia się
  jakiejkolwiek składni; istniejący projekt przechodzi na tę strukturę przez adopcję — najpierw
  kopia zapasowa, potem zmiany, na końcu raport z przetestowaną drogą pełnego powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od przeczytania
  stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami — dla odbiorcy nietechnicznego jako
  jeden plik HTML działający bez internetu. Boczny wątek dostaje własną kartę i gotowy prompt
  świeżej sesji, bez ruszania zamrożonego planu.
- Dwanaście skrótów operacyjnych: etap planu, odnoga, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja, sprzątanie plików roboczych,
  odświeżenie listy modeli.
- **Dokumenty nie puchną bez końca.** Najstarsza historia przenosi się do archiwum w całości, bez
  skracania, a w żywym pliku zostaje linia z linkiem; sprawa czekająca na człowieka nie zatrzymuje
  już tego ruchu, bo jej link jest przepinany na plik archiwum. Poniżej progu nie pada ani jedno
  słowo, a gdy mechanizm nie może zabrać wszystkiego — mówi to wprost, zamiast udawać sukces.
- **Sprawy czekające na człowieka mają jeden adres** i wracają jako pytanie, gdy czekają zbyt
  długo: zamknąć, odroczyć, rozstrzygnąć teraz. Odroczenie przesuwa zegar, nie zamyka sprawy.
- **Każdy próg ma adres w raporcie startu sesji** — razem z nazwą procedury, która odchudza daną
  pozycję. Poniżej progu raport milczy i to milczenie jest gwarantowane.
- **Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia.**
  Skan sekretów działa też poza Claude: gitowy pre-commit zatrzymuje commit z kluczem niezależnie
  od narzędzia. Guard pilnuje projektu, **do którego idzie zapis**, a nie tego, w którym stoi
  sesja — **pokazane w żywej sesji 2026-09-04**: próba zapisania klucza do projektu RelAI
  w `%TEMP%`, z sesji otwartej w tym repozytorium, została odbita, a **plik nie powstał**.
  Ten sam zapis bez sekretu, tą samą drogą, przeszedł.
- **Pliki robocze po zamkniętych etapach mają cztery momenty sprzątania** i zawsze ten sam tryb:
  raport w grupach, jedno „tak" na grupę, ponowny pomiar po operacji. Plik śledzony przez gita nie
  jest kandydatem nigdy, a lokalną notatkę właściciela chroni marker w `.gitignore`. Etap wie, gdzie
  wolno mu tworzyć pliki, **zanim je utworzy** — prompt otwiera zakres linią z katalogiem roboczym.
- **Pytanie o model pokazuje nazwy, nie klasy.** Każde narzędzie niesie własną listę, start sesji
  mówi, która obowiązuje, a `/relai-models` odświeża ją po zgodzie na ruch sieciowy — pytanej za
  każdym razem. Nieudany odczyt zostawia starą listę z jej datą, nigdy pustą. Karta etapu mówi
  wprost, gdy model sesji jest **spoza listy**, i mimo to nie blokuje startu.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził model spoza Anthropic
  w aplikacji Cursora, z reguł zawsze obecnych w kontekście, bez przypominania.
- Repozytorium ma jawną granicę: wspólny rdzeń i dwa adaptery, a walidator wykrywa, gdy adapter
  odjedzie od rdzenia — od 1.9.0 sprawdza też, czy lista modeli istnieje i ma czytelną datę.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Migracja JiraManagera.** Po co: to ostatni projekt, w którym start sesji kosztuje 386 KB
  dokumentów, a rotacja nigdy nie ruszyła. Czeka na okno właściciela, który rozwija go na bieżąco.
  Dopóki nie wejdzie, ryzyko R5 zostaje otwarte — zawężone wyłącznie do tego jednego projektu.
- **Plan ROZWOJ_PO_WYDANIU pozostaje zamrożony** (6/8) i jest jedynym niezamkniętym planem. E7 —
  adapter Codeksa — czeka na dostęp; linia „Aktywny plan" w `CLAUDE.md` brzmi `brak`, bo plan
  zamrożony nie jest planem aktywnym.

## Co dalej

- **Ochrona konfiguracji jest doradcza, nie twarda** — `config-protection` zwraca werdykt `ask`,
  więc zatrzymuje zapis tylko wtedy, gdy tryb uprawnień sesji ten werdykt egzekwuje. W sesji
  z automatyczną akceptacją edycja sekcji niemutowalnej **cudzego** `CLAUDE.md` przeszła bez
  pytania (zmierzone 2026-09-04). Skan sekretów tego problemu nie ma — używa `deny`.
- **Rozstrzygnąć, czy zamknięta lista rdzeni rozstrzygnięcia ma poznać słownik realnego projektu.**
  7 z 32 pozycji „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm
  liczy je jako otwarte. Poszerzenie listy działa we wszystkich projektach naraz, więc każde nowe
  brzmienie to nowe ryzyko schowania sprawy człowieka w archiwum.
- **Reguła głębokości rotacji** — cel „60% części rotowalnej" zatrzymuje rotację nad progiem
  w dokumencie o grubej dolnej granicy; 2026-09-04 głębokość trzeba było wybierać ręcznie.
- **Ikony README renderują się w 17–23 px zamiast 24 px**, więc kreska schodzi poniżej piksela.
  Dwie drogi: podbicie grubości do 3.2 albo scalenie kolumny ikony z kolumną komendy — zmiana
  dotyczy wszystkich jedenastu ikon naraz.
- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma** (`work-artifacts.js:843`) — gasi jedyny
  sygnał, po którym wołający poznałby literówkę w liście. Poprawka rozdziela `skasowane` od
  `nieobecne` w wyniku i w wydruku.
- **`zachowaj` na cudzej ścieżce zapisuje marker u siebie** — `dopiszMarker()` pyta już właściwe
  repozytorium o `check-ignore`, ale plik markerowy wciąż powstaje w projekcie sesji.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** oraz należna tam rotacja lekcji
  i ryzyk zamkniętych — osobne operacje na cudzym projekcie.
- **Odnoga `OPIS_REPO`** (pusty opis repozytorium i tematy na GitHubie) — jej prompt jest z sierpnia
  i opisuje RelAI 1.5.x, więc wymaga odświeżenia przed startem.
- **Zainstalować adapter Cursora w tym repozytorium** (`node adapters/cursor/install.js .`), żeby
  kolejna sesja GUI dostała `sessionStart` i `preToolUse` od startu — zmierzone 2026-09-04:
  bez tego `/relai-models` kończy się na Kroku 1, a zapis z kluczem w GUI przechodzi.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć wpisanych w E2** planu OPTYMALIZACJA_KONTEKSTU —
  wypisane co do jednego 2026-09-01, każde ze swoim dowodem.
- Usunąć metadane sesji `ProbaCursorE6` (`~/.claude/projects/`, `~/.claude/session-data/`,
  `~/.cursor/projects/`) — sam katalog projektu już nie istnieje.
- Po odmrożeniu E7: adapter Codeksa i `AGENTS.md` jako plik główny projektu (D-86) wraz
  z przepięciem instalatora Cursora.
- **Feedback od osób spoza projektu** — pilotaż poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka.

## Co blokuje

- **Repozytorium RelAI otwarte w Cursorze nie ma zainstalowanego adaptera.** Wątek
  [CURSOR_1_9_1](fixy/CURSOR_1_9_1/ODNOGA.md) zmierzył adapter na 1.9.1 (Grok 4.6): instalator
  kładzie dwanaście komend i manifest `1.9.1`, hook startu mówi o `MODELE-cursor.md`, para
  wariantów wieku listy daje 253 znaki wobec zera, a `cursor-agent` na projekcie kontrolnym
  odbija zapis z kluczem — plik nie powstaje. Ta sesja GUI w tym repozytorium zdania hooka
  **nie dostała**, bo `.cursor/` tu nie leży; dołożenie `hooks.json` w trakcie sesji zapisu
  nie zatrzymało. Niezmierzone zostają dostęp poza katalogiem roboczym i osiem komend poza
  trzema uruchomionymi (`/relai-help`, `/relai-clean`, `/relai-models`).
- **Dostępność świeżej sesji CLI bywa zmienna** — `claude -p` odmówił uwierzytelnienia rano
  2026-09-04 i zadziałał tego samego dnia po południu, więc każdy etap opierający pomiar na tej
  usłudze sprawdza ją przed startem (L-0084, L-0087). Dziewięć scenariuszy odnogi `POMIAR_ODNOG`
  zostaje niezmierzonych świadomie — decyzja z 2026-09-03.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium i aplikacja: **1.9.1** (poprawka `_fixy` w rdzeniu, 2026-09-04; wcześniej tego samego
dnia 1.9.0 z planu REKOMENDACJA_MODELU). Walidator: kod 0, „3 zrodel, wartosc 1.9.1". Wydanie
potwierdzone **treścią plików z cache'u, nie komunikatem CLI** (P-005): kopia narzędzia podłożona do
projektu przez hook żywej sesji po restarcie ma sumę `e9b5bed342dbb6a3`, identyczną z cache'em 1.9.1
i różną od 1.9.0 (`0a7a6bed187efb52`). Źródło instalacji: własny marketplace w tym repozytorium,
scope `user`.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`) i pomiar artefaktów (`process/work-artifacts.js`), oba wołane przez
oba adaptery • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, **dwanaście komend**, dziesięć hooków Node.js bez zależności
npm, własna lista modeli `MODELE.md`. Manifest i marketplace zostają w `.claude-plugin/` w korzeniu
— tego wymaga Claude Code.

**Adapter Cursor**: trzy reguły `.mdc` z `alwaysApply: true`, dwa hooki z opakowaniem powłoki dla
guardraila, instalator z deinstalacją i flagą `--bez-skanu`, własna lista modeli. Komendy i skille
kopiuje z adaptera Claude Code.

### Wymagania

Claude Code **albo Cursor** • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (publiczne) • Plany zamknięte:
[docs/archiwum/plany/](archiwum/plany/) • Backupy: `C:\Users\Lukasz\Backupy\RelAI` •
Rozpoznanie narzędzi: [PRZENOSNOSC.md](PRZENOSNOSC.md) • Pułapki: [PULAPKI.md](PULAPKI.md) •
Komendy i frazy: [KOMENDY.md](KOMENDY.md)

### Liczby

Plany: BUDOWA_RELAI 10/10 • OPTYMALIZACJA_KONTEKSTU 5/5 • HIGIENA_DOKUMENTOW 6/6 •
SPRZATANIE_ARTEFAKTOW 4/4 • REKOMENDACJA_MODELU 4/4 (zamknięty 2026-09-04) •
ROZWOJ_PO_WYDANIU 6/8 (ZAMROŻONY) • **Aktywny plan: brak** •
Warstwa startowa: **50,5 KB / 80 KB** — raport budżetu milczy, raport progów wymienia jedną
pozycję (sekcja ryzyk) • Dziennik: **102,5 KB / 150 KB**
(17 wpisów) • Lekcje: **37,2 KB / 50 KB** (20 w żywym rejestrze, ostatnia L-0090) • Sekcja ryzyk:
**14,4 KB / 12 KB** — nie ma już czego rotować • Archiwum: siedem plików dziennika, trzy lekcji,
dwa ryzyk • Sprawy czekające na człowieka: **6 tutaj**, 32 w PolyFlow, żadna nieprzeterminowana •
Otwarte ryzyka: **9** • Zamknięte ryzyka: **8, wszystkie w archiwum** •
Otwarte bramki manualne: **1** (zamknięta lista rdzeni rozstrzygnięcia) •
Otwarte wątki: **1** — odnoga `OPIS_REPO` • Artefakty w rejestrze: **40** •
Zasady aktywne: **15 przy limicie 15** • Progi w katalogu: **18, z tego 17 z adresem egzekwowania** •
Adaptery: 2 • Komendy: **12** • Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na RelAI: 3 (RelAI 1.9.1, PolyFlow 1.8.0, JiraManager przed migracją)
