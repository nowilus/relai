# STATE — RelAI

Stan na: 2026-09-01

## Gdzie jesteśmy

RelAI jest **wydany w 1.7.0** i ma dwa wyjścia: Claude Code oraz Cursor — te same dokumenty i ten
sam proces w dwóch narzędziach. Plan **HIGIENA_DOKUMENTOW zamknięty 2026-09-01**, sześć etapów
z sześciu: rotacja przestała się zatykać na własnej regule, gdy stoi — mówi na czym i ile to
kosztuje, sprawa czekająca dłużej niż 30 dni wymusza decyzję na starcie, każdy próg ma adres
w raporcie startu, a komórka „Mitygacja" i plik ustawień mają drogę do archiwum. E6 dowiózł to,
czego wcześniejsze etapy nie miały: **pomiar po wydaniu, w świeżej sesji, w zainstalowanym
pluginie, na cudzym projekcie**. Plan ROZWOJ_PO_WYDANIU jest **zamrożony** — E7 czeka na dostęp do
Codeksa. Aktywnego planu nie ma.

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
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń, a `adapters/claude-code/`
  i `adapters/cursor/` to dwa wyjścia. Walidator wykrywa, gdy adapter odjedzie od rdzenia.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził Grok 4.6 w aplikacji Cursora,
  z reguł zawsze-w-kontekście, bez przypominania.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Migracja JiraManagera.** Po co: to ostatni projekt, w którym start sesji kosztuje 386 KB
  dokumentów, a rotacja nigdy nie ruszyła. Czeka na okno — właściciel rozwija go na bieżąco.
  Dopóki nie wejdzie, **ryzyko R5 zostaje otwarte**, zawężone już wyłącznie do tego jednego
  projektu: mechanizm jest kompletny i zmierzony na dwóch projektach z trzech.
- **Plan ROZWOJ_PO_WYDANIU pozostaje zamrożony** (6/8). E7 — adapter Codeksa — czeka na dostęp.
- **Aktywnego planu nie ma.** Następny powstanie z prośby o plan.

## Co dalej

- **Rozstrzygnąć, czy zamknięta lista rdzeni rozstrzygnięcia ma poznać słownik realnego projektu.**
  Zmierzone w E6: **7 z 32 pozycji** „Czeka na człowieka" w PolyFlow (22%) wygląda dla człowieka na
  zamknięte, a mechanizm liczy je jako otwarte — `zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia
  z datą. Poszerzenie listy działa we wszystkich projektach naraz, ale każde nowe brzmienie to nowe
  ryzyko schowania sprawy człowieka w archiwum. Bramka **świadomie zostawiona otwarta** przy
  zamknięciu planu HIGIENA_DOKUMENTOW.
- **Ikony README renderują się w 17–23 px, nie w 24 px** — kolor jest naprawiony i zmierzony, ale
  kreska 2,6 przy `viewBox` 48 schodzi wtedy do 0,92 px. Dwie drogi, obie czekają na decyzję:
  podbicie grubości do 3.2 albo scalenie kolumny ikony z kolumną komendy w README.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** — pozostałość po rotacjach sprzed
  1.7.0, które kroku przepięcia nie miały. Osobna operacja na cudzych pozycjach.
- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — obie należne, obie świadomie poza
  zakresem E6. Raport startu tamtego projektu mówi o nich przy każdym uruchomieniu.
- Trzy odnogi zamrożonego planu, w dowolnej kolejności: `OPIS_REPO`, `REKOMENDACJA_MODELU`,
  `GUARD_PO_SCIEZCE`. Każda ma gotowy prompt; zamrożenie planu ich nie dotyczy.
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
  **anulowana 2026-09-01**: dziewięć scenariuszy zostaje niezmierzonych, a **ryzyko R2 pozostaje
  otwarte świadomie** w części dołożonej po 1.1.0. Nie dotyczy to zachowań hooków — te zmierzono
  w E6 na żywym starcie sesji po restarcie.
- **Adapter Cursora zmierzony w aplikacji, ale nie w całości.** Pilotaż potwierdził reguły, hook
  kontekstu, obie warstwy blokady sekretu i pełne przejście `/relai-stage`. Niezmierzone: hook
  `beforeReadFile`, dostęp poza katalogiem roboczym, osiem pozostałych komend. Reguły 1.7.0
  adaptera Cursora **nie były uruchomione w Cursorze** — wydanie zmierzono wyłącznie w Claude Code.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.7.0**, wypchnięte. Zainstalowany globalnie (scope `user`): **1.7.0**, działa
w aplikacji — potwierdzone po restarcie 2026-09-01 **treścią pliku, nie komunikatem CLI**: lokalna
kopia `SPEC_ARCHIWUM.md` w projekcie ma 53 057 B wobec 27 390 B przed restartem, a
`session-signals.js` w cache'u 1.6.1 nie miał ani jednego wystąpienia `dokumentyPonadProgiem`
i `sprawyPrzeterminowane`. Źródło: własny marketplace w tym samym repozytorium.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`, wołane przez oba adaptery) • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, dziesięć komend, dziesięć hooków Node.js bez zależności npm.
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
HIGIENA_DOKUMENTOW **6/6 (ZREALIZOWANY 2026-09-01)** •
Warstwa startowa RelAI: **37,0 KB / 80 KB**, raport startu **0 znaków** • Warstwa startowa
PolyFlow: **157,3 KB / 80 KB**, raport **5 linii przy limicie 6** • Dziennik RelAI: **85,8 KB /
próg 150 KB** po rotacji 18 wpisów • Lekcje 34,9 KB / 21 lekcji w żywym rejestrze, ostatnia
L-0075 • Sprawy czekające na człowieka: **3 tutaj**, **32 w PolyFlow**, żadna nieprzeterminowana
przy progu 30 dni • Progi w katalogu: **17, z tego 15 z adresem egzekwowania** •
Zasady aktywne: **15 przy limicie 15** •
Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora • Adaptery: 2 •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na 1.7.0: 2 (RelAI, PolyFlow) • Otwarte wątki: 3 odnogi zamrożonego planu •
Artefakty w rejestrze: 38 • Otwarte bramki manualne: **1** (zamknięta lista rdzeni) •
Otwarte ryzyka: 4 • Zamknięte ryzyka: 6 (w archiwum) • Progi rotacji: dziennik 150 KB, lekcje
40 wpisów albo 50 KB, STATE 300 linii • Archiwum dziennika: siedem plików, ostatni
2026-08-17…2026-08-21 (18 wpisów, `74a4d2a5fb9a3390`)
