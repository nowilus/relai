# STATE — RelAI

Stan na: 2026-09-03

## Gdzie jesteśmy

RelAI jest **wydany w 1.8.1** i ma dwa wyjścia: Claude Code oraz Cursor — te same dokumenty i ten
sam proces w dwóch narzędziach. **1.8.1 to poprawka guardraili z odnogi GUARD_PO_SCIEZCE**
(zamknięta 2026-09-03): guard pilnuje projektu, do którego idzie zapis, a nie tego, w którym stoi
sesja. W repozytorium jest, w aplikacji zaczyna działać po sekwencji wydania P-005. Plan **SPRZATANIE_ARTEFAKTOW zamknięty 2026-09-03**, cztery etapy
z czterech: pliki robocze po zamkniętych etapach mają cztery momenty sprzątania i zawsze ten sam
tryb — raport w grupach, jedno „tak" na grupę, bramka dokumentacyjna. E4 dowiózł to, co przesądza
o wiarygodności mechanizmu: **pełny przebieg na cudzym projekcie, na materiale wytworzonym
celowo** — PolyFlow 125,0 → 0,0 MB. Wcześniej plan **HIGIENA_DOKUMENTOW zamknięty 2026-09-01**,
sześć etapów z sześciu: rotacja przestała się zatykać na własnej regule, sprawa czekająca dłużej
niż 30 dni wymusza decyzję na starcie, każdy próg ma adres w raporcie startu. Plan
ROZWOJ_PO_WYDANIU jest **zamrożony** — E7 czeka na dostęp do Codeksa. **Aktywnego planu nie ma.**

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie — bez uczenia się
  jakiejkolwiek składni. Istniejący projekt przechodzi na tę strukturę przez adopcję: najpierw
  kopia zapasowa, potem zmiany, na końcu raport z przetestowaną drogą pełnego powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od przeczytania
  stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami; dla odbiorcy nietechnicznego — jako
  jeden plik HTML działający bez internetu. Boczny wątek z etapu ma gdzie zamieszkać: odnoga
  dostaje kartę i gotowy prompt świeżej sesji, bez ruszania zamrożonego planu.
- Dziesięć skrótów operacyjnych: etap planu, odnoga, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja.
- **Rotacja rusza także tam, gdzie stała latami.** Najstarsza historia sama przenosi się do
  archiwum, bajt w bajt, a w żywym pliku zostaje linia z linkiem; poniżej progu nie pada ani jedno
  słowo. Sprawa czekająca na człowieka **nie blokuje już wpisu** — jego link jest przepinany na plik
  archiwum w fazie 2, po zgodności sum. Zmierzone na cudzym projekcie 2026-09-01: PolyFlow
  **183,1 → 147,3 KB**, a przepięcie policzone w obie strony dało **bilans zero** (60 martwych
  linków przed rotacją, 65 po niej, 60 po przepięciu). Tutaj: **155,6 → 74,1 KB**, 18 wpisów.
- **Zatkana rotacja nie milczy, a próg nie obiecuje niemożliwego.** Dokument ma trzy wagi podawane
  razem z progiem: całkowitą, część rotowalną i dolną granicę osiągalną. Cel dotyczy części
  rotowalnej, więc plik złożony z samych świeżych wpisów nie wygląda na zepsuty mechanizm.
- **Sprawy czekające na człowieka mają jeden adres** — sekcję „Czeka na człowieka" na górze
  dziennika, czytaną przy każdym starcie — **a sprawa, która czeka za długo, wymusza decyzję.**
  Próg `30 dni` ma własny wyłącznik, osobny od rotacji; wykrycie robi hook startu, więc działa przy
  każdym modelu. Powyżej progu pada raport i pytanie **partiami po cztery** z trzema wyborami.
  Zmierzone na materiale kontrolowanym: **13 spraw, 4 partie po 4 + 4 + 4 + 1**. Odroczenie
  przesuwa zegar, a nie zamyka sprawy: licznik `odroczeń: 1 → 2 → 3`, data pozycji zostaje datą
  pierwszego wystąpienia, pozycja zostaje na liście otwartych.
- **Każdy próg ma adres, a raport startu jest tym adresem.** Raport odzywa się przy przekroczeniu
  sumy **albo** gdy dokument czy sekcja przekracza **własny** próg rotacji — dwie rozłączne linie,
  każda pozycja z nazwą procedury, która ją odchudza. Wykaz wszystkich progów: sekcja „Katalog
  progów" w `SPEC_USTAWIENIA.md` — **17 wierszy, 15 z adresem egzekwowania**.
- **Ryzyko chudnie bez znikania, a ustawienia mają wyjście.** Komórka „Mitygacja" ryzyka
  `ZMITYGOWANE` albo `PRZYJĘTE ŚWIADOMIE` oddaje historię do archiwum, a wiersz zostaje z dosłownym
  cytatem ostatniego zdania. `docs/USTAWIENIA.md` ma własną rotację, a **pięć wierszy wypisanych
  z nazwy nie schodzi nigdy**. Zmierzone na PolyFlow: ustawienia **29,8 → 25,4 KB**, 16 wierszy
  przeniesionych, 5 wierszy maszynowych na miejscu i zwracających te same wartości.
- **Cisza poniżej progu jest nienaruszalna** — to repozytorium po wydaniu, po rotacji i po wpisie
  zamykającym dostaje z obu hooków startu **0 znaków** przy warstwie 37,0 KB; projekt ponad budżetem —
  **5 linii przy limicie 6**.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia. Skan
  sekretów działa **poza Claude**: gitowy pre-commit zatrzymuje commit z kluczem niezależnie od
  narzędzia. Stoi realnie w trzech repozytoriach — RelAI, JiraManager, PolyFlow.
- **Guard pilnuje projektu, do którego idzie zapis — nie tego, w którym stoi sesja.** Marker
  szukany jest od ścieżki zapisywanego pliku w górę, a katalog sesji jest dopiero drugim
  kierunkiem; `git check-ignore` we wszystkich trzech miejscach pyta repozytorium właściciela
  ścieżki. Sesja otwarta gdzie indziej nie zapisze już sekretu do cudzego projektu RelAI ani nie
  zmieni jego `CLAUDE.md` bez ostrzeżenia — a tryb gościa napotkany po drodze **wygrywa z obu
  kierunków**. Zmierzone na dwóch drzewach w jednym przebiegu: **22 + 4 scenariusze, 0
  niezgodnych**, 18 werdyktów niezmienionych wobec 1.8.0 i cztery zmienione celowo. Niezmierzone:
  blokada w żywej sesji — czeka na restart aplikacji z 1.8.1.
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń, a `adapters/claude-code/`
  i `adapters/cursor/` to dwa wyjścia. Walidator wykrywa, gdy adapter odjedzie od rdzenia.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził Grok 4.6 w aplikacji Cursora,
  z reguł zawsze-w-kontekście, bez przypominania.
- **Sprzątanie po zamkniętych etapach na żądanie** — komenda `/relai-clean` pokazuje, co realnie
  leży w katalogu roboczym, w `%TEMP%` i wśród plików nieśledzonych, grupuje to i pyta **partiami
  po cztery**; kasuje wyłącznie po „tak" na grupę i zawsze mierzy ponownie po operacji. Plik
  śledzony przez gita nie jest kandydatem nigdy, a lokalną notatkę właściciela chroni linia-marker
  `# relai: zachowaj` w `.gitignore`. Pierwszy realny przebieg (tutaj, 2026-09-03): 8 grup,
  9 pozycji chronionych z powodem, **0,59 MB / 25 121 plików sprzątnięte, 0 B po**. **Wydane
  w 1.8.0 i zmierzone na cudzym projekcie:** PolyFlow dostał komendę przez `/relai-update`,
  narzędzie podłożył hook startu, a na materiale 145 MB wytworzonym celowo start sesji powiedział
  **125,0 MB przy progu 100 MB** — 20 MB katalogu etapu niezamkniętego pominął sam. Pełny przebieg
  komendy: cztery grupy, 13 pozycji chronionych z powodem, kasowanie po „tak" na grupę
  **125,0 → 0,0 MB**, raport ponowny z zerem kandydatów. Siedem markerów `zachowaj` postawionych
  **narzędziem, nad istniejącymi wzorcami** — bez dokładania nowych; pozycje chronione **13 → 21**.
  Ochrona przez opis ma zmierzoną granicę: `opisane` obejmowało **dwa** pliki benchmarku z ośmiu,
  bo komentarz nad wzorcem w `.gitignore` dokumentem projektu nie jest.
- **Etap wie, gdzie wolno mu tworzyć pliki — zanim je utworzy.** Prompt etapowy i prompt odnogi
  **otwierają zakres linią z katalogiem roboczym** (`.claude/relai/work/<TEMAT>/E<N>/`, odnoga
  `<NAZWA_ODNOGI>`, wątek samodzielny `_fixy`), a artefakt, który z natury musi leżeć poza
  projektem, idzie do wpisu dziennika z nazwy. Martwy punkt weryfikacji, który mówił wyłącznie
  o repozytorium — a więc zaliczał się sam, bo artefakty etapu leżą poza Gitem — zastąpił punkt
  o katalogu roboczym przejrzanym raportem i skasowanym po „tak", z liczbami przed i po. To samo
  niesie rytuał „Na koniec" (krok `1a`, przed wpisem, żeby liczby do niego trafiły), reguła
  Cursora i karty potwierdzenia `/relai-stage` i `/relai-branch`. Zmierzone na własnym produkcie:
  `PROMPT_ETAP_4.md`, pierwszy prompt wygenerowany po zmianie, niesie ścieżkę w zakresie **i**
  w weryfikacji. Numeracje nietknięte — dziewięć sekcji specyfikacji, sześć punktów rytuału,
  pięć plików z „krokiem 2" bez różnicy wobec HEAD.
- **Mechanizm mówi sam, bez pytania — i sprząta w rytuale.** Start sesji dostał **dokładnie jedno
  zdanie**: waga, liczba pozycji, próg, trzy najcięższe pozycje z pochodzeniem, reszta jako liczba
  i propozycja `/relai-clean`. Poniżej progu **100 MB**, przy wierszu `wyłączone` i w projekcie bez
  wiersza — zero znaków; wartość spoza listy brzmień nie milczy, tylko mówi, co jest dozwolone.
  Rytuał „kończymy na dziś" ma krok **2a**: po rotacji, przed wpisem, pyta wyłącznie o katalogi
  etapów zamkniętych i o całość ponad progiem. Hook mierzy katalog roboczy i `%TEMP%`, **nie**
  skanuje repozytorium — `git status --ignored` należy do komendy. Zmierzone 2026-09-03: **116 ms**
  na katalogu 30 MB / 3 000 plików przy celu poniżej 300 ms, testy **29/29**, sprzątanie po etapie
  **141,2 MB → 0**. Ochrona `etap trwa` trzyma: przy 141,2 MB w katalogu etapu **w toku** start
  sesji nadal milczał.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Migracja JiraManagera.** Po co: to ostatni projekt, w którym start sesji kosztuje 386 KB
  dokumentów, a rotacja nigdy nie ruszyła. Czeka na okno — właściciel rozwija go na bieżąco.
  Dopóki nie wejdzie, **ryzyko R5 zostaje otwarte**, zawężone już wyłącznie do tego jednego
  projektu: mechanizm jest kompletny i zmierzony na dwóch projektach z trzech.
- **Plan REKOMENDACJA_MODELU czeka na akceptację** (utworzony 2026-09-03, cztery etapy, 4–7 sesji
  SZACUNEK). Po co: pytanie „na jakim modelu wykonać etap" operuje klasami, które poza Claude Code
  nie wskazują niczego konkretnego — pilotaż Cursora pokazał kartę żądającą „najsilniejszego
  modelu" i niepotrafiącą powiedzieć, który to jest. Plan wprowadza listę modeli per narzędzie
  dostarczaną do projektu, komendę `/relai-models` odświeżającą ją na żądanie i ciche przypomnienie
  po progu. Do czasu akceptacji **żaden etap nie startuje**; trzy bramki czekają na człowieka
  (adresy stron dokumentacji, zgoda na sieć, numer wydania).
- **Plan ROZWOJ_PO_WYDANIU pozostaje zamrożony** (6/8). E7 — adapter Codeksa — czeka na dostęp.
- **Aktywnego planu nie ma.** Plan SPRZATANIE_ARTEFAKTOW zamknięty 2026-09-03 (4/4) i przeniesiony
  do [archiwum](archiwum/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md); ROZWOJ_PO_WYDANIU pozostaje
  zamrożony. Następny plan wybiera człowiek — kandydaci są w sekcji „Co dalej".

## Co dalej

- **Rozstrzygnąć, czy zamknięta lista rdzeni rozstrzygnięcia ma poznać słownik realnego projektu.**
  Zmierzone w E6: **7 z 32 pozycji** „Czeka na człowieka" w PolyFlow (22%) wygląda dla człowieka na
  zamknięte, a mechanizm liczy je jako otwarte — `zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia
  z datą. Poszerzenie listy działa we wszystkich projektach naraz, ale każde nowe brzmienie to nowe
  ryzyko schowania sprawy człowieka w archiwum. Bramka **świadomie zostawiona otwarta** przy
  zamknięciu planu HIGIENA_DOKUMENTOW.
- **Ikony README renderują się w 17–23 px, nie w 24 px** — kolor jest naprawiony i zmierzony, ale
  kreska 2,6 przy `viewBox` 48 schodzi wtedy do 0,92 px. Dwie drogi, obie czekają na decyzję:
  podbicie grubości do 3.2 albo scalenie kolumny ikony z kolumną komendy w README. Sprawa
  **zostawiona świadomie otwarta** przy zamknięciu planu SPRZATANIE_ARTEFAKTOW: jedenasta ikona
  (`clean.svg`) powstała w tej samej kresce 2.6 co dziesięć poprzednich, bo podbicie dotyczy
  **wszystkich jedenastu naraz** — jedna ikona grubsza rozjechałaby zestaw.
- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma** — gałąź „juz go nie ma, stan docelowy
  osiagniety" w `core/process/work-artifacts.js:843` gasi jedyny sygnał, po którym wołający poznałby,
  że lista zawiera literówkę albo rozjechane escapowanie. Zreprodukowane dwa razy 2026-09-03 (E4):
  ścieżka dysko-relatywna z `\r` w środku dała `Skasowane: 1` bez ani jednej realnej operacji.
  Poprawka to rozdzielenie `skasowane` od `nieobecne` w wyniku i w wydruku — poza zakresem E4, bo
  to kod z E1 wydany już w 1.8.0.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** — pozostałość po rotacjach sprzed
  1.7.0, które kroku przepięcia nie miały. Osobna operacja na cudzych pozycjach.
- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — obie należne, obie świadomie poza
  zakresem E6. Raport startu tamtego projektu mówi o nich przy każdym uruchomieniu.
- **Wydać 1.8.1** — repozytorium ma tę wersję w trzech źródłach, aplikacja nadal 1.8.0. Sekwencja
  P-005: push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` →
  restart → potwierdzenie **treścią pliku** z cache'u. Dopiero po tym da się pokazać blokadę
  w żywej sesji.
- **`zachowaj` na cudzej ścieżce zapisuje marker u siebie** — `dopiszMarker()` pyta już właściwe
  repozytorium o `check-ignore`, ale plik markerowy wciąż powstaje w projekcie sesji.
  Poza zakresem odnogi GUARD_PO_SCIEZCE, która poprawiła wyłącznie samo pytanie.
- Została **jedna odnoga**: `OPIS_REPO` (pusty `description` i tematy na GitHubie). Jej prompt jest
  z sierpnia i opisuje RelAI 1.5.x — wymaga odświeżenia przed startem, tak jak wymagał go
  `GUARD_PO_SCIEZCE`. Zamrożenie planu odnóg nie dotyczy.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć wpisanych w E2** planu OPTYMALIZACJA_KONTEKSTU —
  wypisane co do jednego 2026-09-01, każde ze swoim dowodem.
- Usunąć metadane sesji `ProbaCursorE6` (`~/.claude/projects/`, `~/.claude/session-data/`,
  `~/.cursor/projects/`) — sam katalog projektu już nie istnieje.
- Po odmrożeniu E7: adapter Codeksa, `AGENTS.md` jako plik główny projektu z adapterem Cursora albo
  Codeksa (D-86) wraz z przepięciem instalatora Cursora.
- Feedback od osób **spoza projektu** — pilotaż poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka.

## Co blokuje

- **Pomiar zachowań w świeżej sesji CLI nie odbędzie się** — `claude -p` uwierzytelnia się z własnego
  pliku poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Odnoga `POMIAR_ODNOG`
  **anulowana 2026-09-01 i domknięta zupełnie 2026-09-03**: dziewięć scenariuszy zostaje
  niezmierzonych, prompt odnogi usunięty (historia gita go trzyma), a **ryzyko R2 zamknięte** —
  nie dlatego, że coś zmierzono, tylko dlatego, że nie zostanie zmierzone nigdy, więc przestaje
  być zaległością. Nie dotyczy to zachowań hooków — te zmierzono w E6 na żywym starcie sesji po
  restarcie, a warstwa nośna ochrony (hook + `CLAUDE.md`) działa bez wyzwalania skilla.
- **Adapter Cursora zmierzony w aplikacji, ale nie w całości.** Pilotaż potwierdził reguły, hook
  kontekstu, obie warstwy blokady sekretu i pełne przejście `/relai-stage`. Niezmierzone: hook
  `beforeReadFile`, dostęp poza katalogiem roboczym, osiem pozostałych komend. Reguły **1.7.0
  i 1.8.0** adaptera Cursora **nie były uruchomione w Cursorze** — oba wydania zmierzono wyłącznie
  w Claude Code.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.8.1** (odnoga GUARD_PO_SCIEZCE, 2026-09-03), **wypchnięte** (`26036a3`) —
w aplikacji **jeszcze niezainstalowane**; walidator: kod 0, „3 zrodel, wartosc 1.8.1". Zostaje
reszta sekwencji P-005: `claude plugin marketplace update relai` → `claude plugin update
relai@relai` → restart → potwierdzenie treścią pliku. Poniżej stan wydania poprzedniego, który
nadal działa w aplikacji.

Repozytorium 1.8.0: wypchnięte. Zainstalowany globalnie (scope `user`): **1.8.0**, działa
w aplikacji — potwierdzone po restarcie 2026-09-03 **treścią pliku, nie komunikatem CLI**: cache
`1.8.0/` niesie jedenaście plików komend i linię 28 skilla `relai-core` o markerze `zachowaj`,
a hook startu z tego cache'u przeszedł w tej sesji pomiar na dwóch projektach. Walidator:
kod 0, „3 zrodel, wartosc 1.8.0". Źródło: własny marketplace w tym samym repozytorium.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`, wołane przez oba adaptery) • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, **jedenaście komend** (`/relai-clean` weszła do wydania
w 1.8.0), dziesięć hooków Node.js bez zależności npm.
Manifest i marketplace zostają w `.claude-plugin/` w korzeniu — tego wymaga Claude Code.

**Adapter Cursor**: trzy reguły `.mdc` z `alwaysApply: true`, dwa hooki z opakowaniem powłoki dla
guardraila, instalator z deinstalacją i flagą `--bez-skanu`. Komendy i skille kopiuje z adaptera
Claude Code.

### Wymagania

Claude Code **albo Cursor** • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (publiczne) • Plan budowy:
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Plan higieny:
[docs/archiwum/plany/HIGIENA_DOKUMENTOW/](archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI` • Rozpoznanie narzędzi: [PRZENOSNOSC.md](PRZENOSNOSC.md) •
Pułapki: [PULAPKI.md](PULAPKI.md)

### Liczby

Etapy: BUDOWA_RELAI 10/10 • ROZWOJ_PO_WYDANIU 6/8 (ZAMROŻONY) • OPTYMALIZACJA_KONTEKSTU 5/5 •
SPRZATANIE_ARTEFAKTOW **4/4 (ZREALIZOWANY 2026-09-03)** •
HIGIENA_DOKUMENTOW **6/6 (ZREALIZOWANY 2026-09-01)** •
Warstwa startowa RelAI: **37,0 KB / 80 KB**, raport startu **0 znaków** • Warstwa startowa
PolyFlow: **157,3 KB / 80 KB**, raport **5 linii przy limicie 6** • Dziennik RelAI: **107,4 KB /
próg 150 KB** • Lekcje **28 lekcji** w żywym rejestrze, ostatnia
**L-0083** • Sprawy czekające na człowieka: **4 tutaj**, **32 w PolyFlow**, żadna nieprzeterminowana
przy progu 30 dni • Progi w katalogu: **18, z tego 16 z adresem egzekwowania** •
Zasady aktywne: **15 przy limicie 15** •
Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora • Adaptery: 2 • Komendy: **11** •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na 1.8.0: 2 (RelAI, PolyFlow) • **Aktywny plan: REKOMENDACJA_MODELU (DO AKCEPTACJI)** •
Otwarte wątki: **1 odnoga** zamrożonego planu (GUARD_PO_SCIEZCE zamknięta, REKOMENDACJA_MODELU
przeniesiona do planu — obie 2026-09-03) •
Artefakty w rejestrze: 39 (dwa podbite w odnodze GUARD_PO_SCIEZCE) • Otwarte bramki manualne: **4** (zamknięta lista
rdzeni rozstrzygnięcia + trzy bramki nowego planu REKOMENDACJA_MODELU; trzy bramki planu
SPRZATANIE_ARTEFAKTOW rozstrzygnięte 2026-09-03) •
Otwarte ryzyka: **5** (R2 zamknięte 2026-09-03) • Zamknięte ryzyka: **7** (6 w archiwum, R2
w żywej tabeli) • Progi rotacji: dziennik 150 KB, lekcje
40 wpisów albo 50 KB, STATE 300 linii • Archiwum dziennika: siedem plików, ostatni
2026-08-17…2026-08-21 (18 wpisów, `74a4d2a5fb9a3390`)
