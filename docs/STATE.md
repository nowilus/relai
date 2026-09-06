# STATE — RelAI

Stan na: 2026-09-06

## Gdzie jesteśmy

RelAI ma w repozytorium **2.1.0** (opublikowane wydanie: 2.0.0) i działa w Claude Code, Cursorze oraz
jako natywny plugin Codexa z jednym rdzeniem procesu. **2.1.0 dokłada załogę** — trzynastą komendę
`/relai-crew`: sesja zostaje orkiestratorem celu, pyta o role, liczbę subagentów, tryb i zakres
modeli, układa zadania w fale bez konfliktów plików, deleguje je subagentom gospodarza albo do
drugiego zalogowanego narzędzia i zleca przegląd krzyżowy; bez drugiego narzędzia pracuje w trybie
basic. Wydanie 2.1.0 (tag, `plugin update`, restart) czeka na człowieka.

Seria 1.9.x dodała listy modeli per narzędzie, poprawiła sprzątanie oraz uszczelniła pre-commit: działa
w projektach ESM, kończy instalację testem dymnym i nie blokuje poprawnych odczytów sekretów ze
środowiska. Szczegóły i dowody wydań są w dwóch ostatnich wpisach dziennika.

**ROZWOJ_PO_WYDANIU odmrożono 2026-09-05 Aneksem B i zamknięto 2026-09-05.** E7 dostarczył natywny
plugin Codexa 1.10.0, a E8 podbił stan do 2.0.0, opublikował release i zamknął plan. Dostępne
kontrole przeszły; pełna świeża sesja Codexa pozostaje NOT TESTED po błędzie AuthRequired worker'a MCP.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie, bez uczenia się
  jakiejkolwiek składni; istniejący projekt przechodzi na tę strukturę przez adopcję — najpierw
  kopia zapasowa, potem zmiany, na końcu raport z przetestowaną drogą pełnego powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od przeczytania
  stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami — dla odbiorcy nietechnicznego jako
  jeden plik HTML działający bez internetu. Boczny wątek dostaje własną kartę i gotowy prompt
  świeżej sesji, bez ruszania zamrożonego planu.
- Trzynaście skrótów operacyjnych: etap planu, odnoga, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja, sprzątanie plików roboczych,
  odświeżenie listy modeli, **załoga**.
- **Załoga działa między trzema narzędziami** — zmierzone 2026-09-06 z Claude Code jako gospodarza:
  Codex (odczyt i zapis), Cursor (odczyt, prompt stdin-em) i zagnieżdżony Claude Code (odczyt)
  wykonały delegowane zadanie z poprawnym raportem; recenzent nigdy nie dostaje prawa zapisu, a dwa
  zadania nigdy nie piszą naraz do tego samego pliku. Kierunki z Codeksa i Cursora jako gospodarza
  oraz zapis przez Cursora pozostają NOT TESTED.
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
- **E7 ma trzeci adapter lokalnie.** Natywny manifest Codeksa 1.10.0, repo-marketplace, 14
  wygenerowanych katalogów skilli, router `AGENTS.md`, integracja D-86 i trzy hooki przechodzą
  lokalną walidację; instalacja w tymczasowym marketplace zakończyła się widoczną wersją 1.10.0.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Wydanie 2.1.0** — repo ma komplet (komenda, narzędzie, agenci, dokumenty, 36 testów); publikacja
  to sekwencja z P-005: tag i release, `claude plugin update`, restart, potwierdzenie treścią cache'u.
  Do tego czasu `/relai-crew` w **tym** repozytorium kończy się na kroku 1 (hook z cache'u 2.0.0 nie
  podkłada `crew.js`) — jak każda funkcja między wydaniami (D-87).
- **Migracja JiraManagera** — ostatni projekt, w którym start sesji kosztuje 386 KB dokumentów,
  a rotacja nigdy nie ruszyła. Czeka na okno właściciela; do tego czasu ryzyko R5 zostaje otwarte,
  zawężone do tego jednego projektu.
- **ROZWOJ_PO_WYDANIU zamknięto 2026-09-05** (8/8); wydania 1.10.0 i 2.0.0 są publiczne,
  a plan przechodzi do archiwum.

## Co dalej

- **Projekty z hookiem sprzed 1.9.3 wymagają ponownej instalacji pre-commita** — układ sprzed
  1.9.2 przewraca się w projekcie z `"type": "module"` (rozpoznanie: obecność
  `.git/hooks/relai-secret-scan.js`), a układ 1.9.2 niesie obie regresje zamknięte w 1.9.3:
  blokadę poprawnego odczytu sekretu ze środowiska i deinstalację psującą cudzy hook. Dotyczy
  PolyFlow i JiraManagera, jeśli mają hook.
- **Ochrona konfiguracji jest doradcza, nie twarda** — `config-protection` zwraca werdykt `ask`,
  więc zatrzymuje zapis tylko wtedy, gdy tryb uprawnień sesji ten werdykt egzekwuje. W sesji
  z automatyczną akceptacją edycja sekcji niemutowalnej **cudzego** `CLAUDE.md` przeszła bez
  pytania (zmierzone 2026-09-04). Skan sekretów tego problemu nie ma — używa `deny`.
- **Rozstrzygnąć, czy zamknięta lista rdzeni rozstrzygnięcia ma poznać słownik realnego projektu**
  — 7 z 32 pozycji PolyFlow wygląda na zamknięte, a mechanizm liczy je jako otwarte; poszerzenie
  listy działa we wszystkich projektach naraz. Szczegóły: „Czeka na człowieka" w dzienniku.
- **Reguła głębokości rotacji** — cel „60% części rotowalnej" zatrzymuje rotację nad progiem
  w dokumencie o grubej dolnej granicy; 2026-09-04 głębokość trzeba było wybierać ręcznie.
- ~~**Ikony README renderują się w 17–23 px zamiast 24 px**~~ — rozstrzygnięte 2026-09-06:
  scalenie kolumny ikony z kolumną komendy (dwie kolumny zamiast trzech), grubość kreski 2.6
  bez zmian. Grafiki nietknięte; komplet ikon uzupełniony do trzynastu (`models`, `crew`).
- **Dwie wady `work-artifacts.js`**: `kasuj` melduje `skasowane` dla ścieżki, której nie ma
  (linia 843 — gasi sygnał o literówce w liście), a `zachowaj` na cudzej ścieżce zapisuje marker
  w projekcie sesji zamiast w projekcie pliku.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** oraz należna tam rotacja lekcji
  i ryzyk zamkniętych — osobne operacje na cudzym projekcie.
- **Odnoga `OPIS_REPO`** (pusty opis repozytorium i tematy na GitHubie) — jej prompt jest z sierpnia
  i opisuje RelAI 1.5.x, więc wymaga odświeżenia przed startem.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć z E2** planu OPTYMALIZACJA_KONTEKSTU (wypisane
  2026-09-01) oraz usunąć metadane sesji `ProbaCursorE6` z `~/.claude/` i `~/.cursor/`.
- **Po planie:** pełna sesja Codexa i praca Cursor/Claude pozostają możliwą odnogą pomiarową;
  nie są blokadą opublikowanego wydania 2.0.0.
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

Repozytorium: **2.1.0** (załoga `/relai-crew`, 2026-09-06, niewydane). Poprzednio 2.0.0 (natywny plugin
Codexa wydany 2026-09-05; pełna macierz cross-tool pozostaje częściowo niezmierzona).
Poprzednio 1.9.2 (trzy defekty gitowego pre-commita ze zgłoszenia zewnętrznego, 2026-09-04;
tego samego dnia wcześniej 1.9.0 z planu REKOMENDACJA_MODELU i poprawka `_fixy` w 1.9.1).
Walidator: kod 0, „5 zrodel, wartosc 2.1.0" (2026-09-06; przy wydaniu 2.0.0: „3 zrodel"). **Wydanie potwierdzone treścią plików z cache'u, nie
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
(`process/session-signals.js`), pomiar artefaktów (`process/work-artifacts.js`) i załoga
(`process/crew.js`: rozpoznanie narzędzi, fale zadań, delegacja, przegląd krzyżowy), wołane przez
adaptery • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, **trzynaście komend**, trzej agenci załogi, dziesięć hooków Node.js
bez zależności npm, własna lista modeli. Manifest i marketplace zostają w `.claude-plugin/` — tego wymaga Claude Code.

**Adapter Cursor**: trzy reguły `.mdc` z `alwaysApply: true`, dwa hooki z opakowaniem powłoki,
instalator z deinstalacją i flagą `--bez-skanu`, własna lista modeli. Komendy i skille kopiuje
z adaptera Claude Code, agentów załogi przepisuje na frontmatter Cursora.

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
ROZWOJ_PO_WYDANIU 8/8 (**ZREALIZOWANY**) • **Aktywny plan: brak** •
Warstwa startowa: **62,8/80 KB** — ponad progiem tylko ryzyka **21,3/12 KB**; STATE **11,9/12**,
status **9,9/10** • Dziennik: **127,2/150 KB** (24 wpisy) •
Lekcje: **41,0 KB / 50 KB** (22 w żywym rejestrze, ostatnia L-0091) • Sekcja ryzyk w widoku
rotacji: **15,3 KB / 12 KB** — nie ma czego rotować • Archiwum: siedem plików dziennika, trzy
lekcji, dwa ryzyk • Sprawy czekające na człowieka: **6 tutaj**, 32 w PolyFlow, żadna
nieprzeterminowana • Otwarte ryzyka: **9** • Zamknięte: **8, w archiwum** •
Otwarte bramki manualne: **1** • Otwarte wątki: **1** — odnoga `OPIS_REPO`; `ORKIESTRACJA` zamknięta 2026-09-06 •
Artefakty w rejestrze: **46** • Zasady aktywne: **15 przy limicie 15** •
Progi w katalogu: **18, z tego 17 z adresem egzekwowania** • Adaptery: **3** •
Procedury: **13** •
Scenariusze akceptacyjne: 4/4 + pilotaż Cursora •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na RelAI: 3 (RelAI 2.0.0, PolyFlow 1.8.0, JiraManager przed migracją) •
Testy regresyjne: **36** (guardraile 19, adapter Codex 8, załoga 9 w `core/process/tests/`) •
Modele, które zmieniły kod produktu: **2** (Opus 5, gpt-6-astra) •
Zgłoszenia z cudzych projektów: **1, obsłużone w dniu wpłynięcia** (pre-commit, 4 defekty)
