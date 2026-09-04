# STATE — RelAI

Stan na: 2026-09-04

## Gdzie jesteśmy

RelAI jest wydany w **1.9.2** i działa w dwóch narzędziach — Claude Code oraz Cursorze — z tym samym
kompletem dokumentów i tym samym procesem. Wydanie 1.9.0 domknęło temat modeli: pytanie „na jakim
modelu to wykonać" pokazuje nazwy dostępne w danym narzędziu zamiast trzech ogólnych klas, listę da
się odświeżyć jedną komendą, a stara lista sama się przypomina. Poprawka 1.9.1 z tego samego dnia
usunęła defekt, przez który raport plików roboczych wywracał się na katalogu wątku pobocznego.
**1.9.2 naprawia gitowy pre-commit po pierwszym zgłoszeniu z cudzego projektu** — hook przestał
blokować każdy commit w projekcie z `"type": "module"`, skan zaczął widzieć nazwy z przedrostkiem,
a instalacja kończy się testem dymnym zamiast samego komunikatu o sukcesie.
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
- **Dokumenty nie puchną bez końca.** Najstarsza historia idzie do archiwum w całości, bez
  skracania, a w żywym pliku zostaje linia z linkiem; sprawa czekająca na człowieka nie zatrzymuje
  tego ruchu — jej link jest przepinany na archiwum. Poniżej progu cisza, a gdy mechanizm nie może
  zabrać wszystkiego, mówi to wprost.
- **Sprawy czekające na człowieka mają jeden adres** i wracają jako pytanie, gdy czekają zbyt
  długo: zamknąć, odroczyć, rozstrzygnąć teraz. Odroczenie przesuwa zegar, nie zamyka sprawy.
- **Każdy próg ma adres w raporcie startu sesji** — razem z nazwą procedury, która odchudza daną
  pozycję. Poniżej progu raport milczy i to milczenie jest gwarantowane.
- **Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia.**
  Gitowy pre-commit zatrzymuje commit z kluczem niezależnie od narzędzia — **od 1.9.2 także
  w projekcie z `"type": "module"`**, gdzie wcześniej przewracał się na starcie i blokował każdy
  commit; instalacja kończy się testem dymnym, więc hook, który nie przechodzi, jest cofany,
  a nie meldowany jako sukces. Skan widzi nazwy z przedrostkiem (`AWS_SECRET_ACCESS_KEY=`)
  i przepuszcza wartości oczywiście przykładowe, więc guardrail da się opisać w dokumentacji.
  Guard pilnuje projektu, **do którego idzie zapis**, a nie tego, w którym stoi sesja.
  **Dwa pomiary w żywej sesji 2026-09-04, każdy w obie strony**: klucz do projektu RelAI
  w `%TEMP%` odbity (plik nie powstał), ten sam zapis bez sekretu przeszedł; zdanie
  z kanoniczną wartością przykładową dopisane do `PULAPKI.md` przeszło, ten sam wzorzec bez
  markera na ścieżce śledzonej odbity (plik nie powstał).
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

- **Migracja JiraManagera** — ostatni projekt, w którym start sesji kosztuje 386 KB dokumentów,
  a rotacja nigdy nie ruszyła. Czeka na okno właściciela; do tego czasu ryzyko R5 zostaje otwarte,
  zawężone do tego jednego projektu.
- **Plan ROZWOJ_PO_WYDANIU pozostaje zamrożony** (6/8) i jest jedynym niezamkniętym planem. E7 —
  adapter Codeksa — czeka na dostęp; linia „Aktywny plan" w `CLAUDE.md` brzmi `brak`, bo plan
  zamrożony nie jest planem aktywnym.

## Co dalej

- **Projekty z hookiem sprzed 1.9.2 wymagają ponownej instalacji pre-commita** — stary układ
  przewraca się w projekcie z `"type": "module"`. Rozpoznanie: obecność
  `.git/hooks/relai-secret-scan.js`. Dotyczy PolyFlow i JiraManagera, jeśli mają hook.
- **Ochrona konfiguracji jest doradcza, nie twarda** — `config-protection` zwraca werdykt `ask`,
  więc zatrzymuje zapis tylko wtedy, gdy tryb uprawnień sesji ten werdykt egzekwuje. W sesji
  z automatyczną akceptacją edycja sekcji niemutowalnej **cudzego** `CLAUDE.md` przeszła bez
  pytania (zmierzone 2026-09-04). Skan sekretów tego problemu nie ma — używa `deny`.
- **Rozstrzygnąć, czy zamknięta lista rdzeni rozstrzygnięcia ma poznać słownik realnego projektu**
  — 7 z 32 pozycji PolyFlow wygląda na zamknięte, a mechanizm liczy je jako otwarte; poszerzenie
  listy działa we wszystkich projektach naraz. Szczegóły: „Czeka na człowieka" w dzienniku.
- **Reguła głębokości rotacji** — cel „60% części rotowalnej" zatrzymuje rotację nad progiem
  w dokumencie o grubej dolnej granicy; 2026-09-04 głębokość trzeba było wybierać ręcznie.
- **Ikony README renderują się w 17–23 px zamiast 24 px** — grubość 3.2 albo scalenie kolumny
  ikony z kolumną komendy; zmiana dotyczy wszystkich jedenastu ikon naraz.
- **Dwie wady `work-artifacts.js`**: `kasuj` melduje `skasowane` dla ścieżki, której nie ma
  (linia 843 — gasi sygnał o literówce w liście), a `zachowaj` na cudzej ścieżce zapisuje marker
  w projekcie sesji zamiast w projekcie pliku.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** oraz należna tam rotacja lekcji
  i ryzyk zamkniętych — osobne operacje na cudzym projekcie.
- **Odnoga `OPIS_REPO`** (pusty opis repozytorium i tematy na GitHubie) — jej prompt jest z sierpnia
  i opisuje RelAI 1.5.x, więc wymaga odświeżenia przed startem.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć z E2** planu OPTYMALIZACJA_KONTEKSTU (wypisane
  2026-09-01) oraz usunąć metadane sesji `ProbaCursorE6` z `~/.claude/` i `~/.cursor/`.
- Po odmrożeniu E7: adapter Codeksa i `AGENTS.md` jako plik główny projektu (D-86) wraz
  z przepięciem instalatora Cursora.
- **Feedback od osób spoza projektu** — pilotaż poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka.

## Co blokuje

- **Adapter Cursora zmierzony na 1.9.1, ale nie w tym repozytorium — i tak zostaje (D-87).** Wynik
  i lista rzeczy niezmierzonych: [CURSOR_1_9_1](fixy/CURSOR_1_9_1/ODNOGA.md). Skutek tutaj: sesja
  Cursora otwarta w tym folderze nie ma kontekstu RelAI ani blokady sekretu.
- **Dostępność świeżej sesji CLI bywa zmienna** — `claude -p` odmówił rano 2026-09-04 i zadziałał
  po południu, więc etap opierający pomiar na tej usłudze sprawdza ją przed startem (L-0084,
  L-0087). Dziewięć scenariuszy odnogi `POMIAR_ODNOG` niezmierzonych świadomie (2026-09-03).

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.9.2** (trzy defekty gitowego pre-commita ze zgłoszenia zewnętrznego, 2026-09-04;
tego samego dnia wcześniej 1.9.0 z planu REKOMENDACJA_MODELU i poprawka `_fixy` w 1.9.1).
Walidator: kod 0, „3 zrodel, wartosc 1.9.2". **Wydanie potwierdzone treścią plików z cache'u, nie
komunikatem CLI** (P-005): `installed_plugins.json` wskazuje ścieżkę `...\1.9.2` i commit
`ff3e6bc`, a pięć plików z cache'u — trzy guardraile, `MANIFEST.json` i `SKILL.md` — zgadza się
sumą z repozytorium po normalizacji CRLF → LF (5/5) i różni od 1.9.1. Sam restart nie wystarczył:
cache dostaje nową wersję dopiero po `claude plugin update`, a restart ją ładuje. Źródło
instalacji: własny marketplace w tym repozytorium, scope `user`. Hook gitowy tego repozytorium
przeinstalowany na układ 1.9.2 (shim + dwa pliki `.cjs`), test dymny zdany przez shim i przez samą
logikę; pierwszy realny commit (19 plików) przeszedł przez niego cicho.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`) i pomiar artefaktów (`process/work-artifacts.js`), oba wołane przez
oba adaptery • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, **dwanaście komend**, dziesięć hooków Node.js bez zależności
npm, własna lista modeli. Manifest i marketplace zostają w `.claude-plugin/` — tego wymaga Claude Code.

**Adapter Cursor**: trzy reguły `.mdc` z `alwaysApply: true`, dwa hooki z opakowaniem powłoki,
instalator z deinstalacją i flagą `--bez-skanu`, własna lista modeli. Komendy i skille kopiuje
z adaptera Claude Code.

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
Warstwa startowa: **53,6 KB / 80 KB** — jedna pozycja ponad progiem cząstkowym (sekcja ryzyk
21,9 przy 12; STATE zszedł do 11,99) • Dziennik: **119,0 KB / 150 KB** (22 wpisy) •
Lekcje: **41,0 KB / 50 KB** (22 w żywym rejestrze, ostatnia L-0091) • Sekcja ryzyk w widoku
rotacji: **15,3 KB / 12 KB** — nie ma czego rotować • Archiwum: siedem plików dziennika, trzy
lekcji, dwa ryzyk • Sprawy czekające na człowieka: **6 tutaj**, 32 w PolyFlow, żadna
nieprzeterminowana • Otwarte ryzyka: **9** • Zamknięte: **8, w archiwum** •
Otwarte bramki manualne: **1** • Otwarte wątki: **1** — odnoga `OPIS_REPO` •
Artefakty w rejestrze: **40** • Zasady aktywne: **15 przy limicie 15** •
Progi w katalogu: **18, z tego 17 z adresem egzekwowania** • Adaptery: 2 • Komendy: **12** •
Scenariusze akceptacyjne: 4/4 + pilotaż Cursora •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na RelAI: 3 (RelAI 1.9.2, PolyFlow 1.8.0, JiraManager przed migracją) •
Zgłoszenia z cudzych projektów: **1, obsłużone w dniu wpłynięcia** (pre-commit, 4 defekty)
