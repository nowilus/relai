# STATE — RelAI

Stan na: 2026-09-01

## Gdzie jesteśmy

RelAI jest wydany (1.5.1) i ma **dwa wyjścia**: Claude Code oraz Cursor — te same dokumenty i ten
sam proces w dwóch narzędziach. Plan budowy zamknięty, cztery scenariusze akceptacyjne zdane,
pilotaż Cursora przeszedł na modelu spoza Anthropic. Repozytorium pracuje na **1.6.1** i kończy
plan **OPTYMALIZACJA_KONTEKSTU**: warstwa czytana przy starcie sesji dostała mierzony budżet i zeszła
tutaj z 90 KB do 35 KB. Plan **zamknięty 2026-08-21**, w połowie celu: PolyFlow działa na 1.6.1,
JiraManager został wyłączony z zakresu decyzją właściciela, więc ryzyko R5 zostaje otwarte. Plan
ROZWOJ_PO_WYDANIU jest **zamrożony** — E7 czeka na dostęp do Codeksa. Aktywny jest plan
**HIGIENA_DOKUMENTOW** (zaakceptowany 2026-09-01, sześć etapów, Aneksy A–C): zgłoszenie z sesji
roboczej PolyFlow pokazało sześć miejsc, w których mechanizm rotacji i progów nie broni się sam.
**E1–E5 są zamknięte** — rotacja przestała się zatykać na własnej regule, gdy stoi, mówi na czym
i ile to kosztuje, sprawa czekająca dłużej niż 30 dni wymusza decyzję na starcie, każdy próg ma
adres, a komórka ryzyka i plik ustawień mają wreszcie drogę do archiwum. Został **E6**: pomiar
na realnych projektach i wydanie 1.7.0.

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
- **Dokumenty nie puchną bez końca — zmierzone na tym repozytorium 2026-08-20.** Najstarsza historia
  sama przenosi się do archiwum, bajt w bajt, a w żywym pliku zostaje linia z linkiem; poniżej progu
  nie pada ani jedno słowo. Rotacja ma dwa wejścia: zamknięcie i start sesji. **Od E1 (2026-09-01)
  nie zatrzymuje jej już własna reguła:** wpis, na który wskazuje otwarta sprawa człowieka, nie jest
  nietykalny — jego link jest przepinany na plik archiwum w fazie 2, po zgodności sum. Destylat
  lekcji skompresowany z 48 pozycji do 15 przy zachowaniu wszystkich numerów źródłowych.
  **2026-09-01 mechanizm zadziałał w realnej sesji tego repozytorium po raz pierwszy:** 3 wpisy
  do archiwum, dziennik 168,0 → 142,2 KB, sumy kontrolne zgodne przed przycięciem. Drugi przebieg
  tego samego dnia zabrał kolejne 3 wpisy i zszedł do 130,6 KB.
- **Zatkana rotacja przestała milczeć, a próg przestał obiecywać niemożliwe (E2, 2026-09-01).**
  Dokument ma trzy wagi podawane razem z progiem: całkowitą, część rotowalną i **dolną granicę
  osiągalną** — to, czego rotacja nie ruszy nigdy. Cel dotyczy części rotowalnej, więc plik złożony
  z samych świeżych wpisów nie wygląda już na zepsuty mechanizm. Powyżej progu, gdy rotacja nie
  zabrała wszystkiego, pada komunikat z parami „pozycja → wpis", wiekiem pozycji w dniach i liczbą
  wpisów, które przepuści jej zamknięcie. Zmierzone: stary komunikat nie mówił **nic**, gdy rotacja
  w PolyFlow brała **2 z 87** wpisów, a 85 stało (453,8 KB).
- **Sprawy czekające na człowieka mają jeden adres** — sekcję „Czeka na człowieka" na górze
  dziennika, czytaną przy każdym starcie. Wpis, którego pozycja się wyprowadziła, przestaje blokować
  rotację; to był powód, dla którego rotacja nigdy nie ruszyła w JiraManagerze ani w PolyFlow.
- **Sprawa, która czeka za długo, wymusza decyzję (E3, 2026-09-01).** Wiersz `Przegląd spraw
  człowieka` w ustawieniach niesie próg `30 dni` i **własny wyłącznik, osobny od rotacji**; wykrycie
  robi hook startu, więc działa przy każdym modelu i bez wyzwalania skilla. Powyżej progu pada
  raport i pytanie **partiami po cztery** z trzema wyborami: zamknąć, odroczyć o kolejne 30 dni
  (adnotacja z licznikiem), rozstrzygnąć teraz. Poniżej progu — zero znaków; zmierzone na tym
  repozytorium (0 linii) i na projekcie kontrolnym (pełny raport) w jednym przebiegu. Zmierzone na
  dzienniku PolyFlow: **25 spraw otwartych, 0 przeterminowanych dziś** (najstarsza 16 dni), **25
  z 25** przy dacie o sześć tygodni późniejszej. Odroczenie przesuwa zegar, a nie zamyka sprawy —
  rdzeń `odroczo` stoi wśród brzmień, które rozstrzygnięciem nie są.
- **Koszt startu sesji jest liczony, a nie szacowany.** Hook mierzy sześć pozycji rytuału startu
  i porównuje sumę z budżetem 80 KB. Powyżej budżetu: najwyżej sześć linii z sumą, pozycjami ponad
  progiem cząstkowym i propozycją odchudzenia. Poniżej: ani jednego znaku. Oba adaptery wołają
  tę samą funkcję rdzenia.
- **Każdy próg ma adres, a raport startu jest tym adresem (E4, 2026-09-01).** Raport odzywa się
  przy przekroczeniu sumy **albo** gdy dokument czy sekcja przekracza **własny** próg rotacji —
  dwie rozłączne linie, każda pozycja z nazwą procedury, która ją odchudza. Wcześniej `LEKCJE.md`
  ważące 52 KB przy progu 50 KB nie odezwałoby się ani razu. Zmierzone: dziennik 154,5 KB → raport,
  31,2 KB → cisza; `LEKCJE.md` sprzed przeniesienia (52 260 B, sekcja „Lekcje zwinięte" 35 787 B) →
  plik **i** sekcja, identycznie dla LF i CRLF; dokumenty PolyFlow → **4 pozycje ponad progiem**,
  z których wcześniej nie odezwała się żadna; pełny zestaw przekroczeń mieści się w **5 liniach**
  przy limicie 6, a to repozytorium dostaje z obu hooków **0 linii**. Wykaz wszystkich progów RelAI
  wraz z ich adresami egzekwowania stoi w sekcji „Katalog progów" `SPEC_USTAWIENIA.md`; dwa progi
  ma tam wpisany wprost „brak automatu". Część „dokumenty ponad progiem" ma wyłącznik **rotacji**,
  nie budżetu.
- **Ryzyko chudnie bez znikania, a ustawienia mają wreszcie wyjście (E5, 2026-09-01).** Komórka
  „Mitygacja" ryzyka `ZMITYGOWANE` albo `PRZYJĘTE ŚWIADOMIE` oddaje historię do
  `docs/archiwum/ryzyka/MITYGACJE_<data>.md`, a **wiersz zostaje w tabeli** — w komórce staje
  **dosłowny cytat** ostatniego zdania stanu i odsyłacz. Trzy warunki naraz: sekcja ponad progiem,
  komórka ponad 800 znaków, status z zamkniętej listy czytanej **od początku komórki**; wiek
  komórki warunkiem nie jest, a ryzyka `OTWARTE` automat nie rusza. `docs/USTAWIENIA.md` ma własną
  rotację — schodzą wiersze sekcji „Ustawienia wycofane", a **pięć wierszy wypisanych z nazwy nie
  schodzi nigdy**, bo ich brak wyciszyłby mechanizmy, które je czytają. Zmierzone na dzienniku
  PolyFlow sprzed migracji: sekcja ryzyk **57,1 → 48,0 KB**, 7 komórek z 15 ponad limitem,
  **52 wiersze przed i po**, 7 z 7 cytatów dosłownie w archiwum; ustawienia PolyFlow
  **30,1 → 25,6 KB**, 16 wierszy przeniesionych, 5 nietykalnych zostało, a `startCost`
  i `sprawyPrzeterminowane` zwróciły to samo co przed rotacją. Rozjazd sum kontrolnych zatrzymuje
  obie procedury i zostawia żywy plik bajt w bajt.
- **`STATE.md` i `CLAUDE.md` mają twardy kształt** (1.6.0): trzy pozycje w „Nad czym pracujemy
  teraz" z podmianą zamiast dopisywania, próg zwięzłości jako liczba sprawdzalna komendą, budżet
  `CLAUDE.md` w KB i zakaz treści odtwarzalnej z repozytorium. Pułapki narzędziowe mają własny
  dokument [PULAPKI.md](PULAPKI.md), czytany **na żądanie** — poza warstwą startową.
- **Rejestry mówią, jak jest dziś, a nie jak do tego doszło.** Komórka „Mitygacja" trzyma stan
  bieżący i odsyłacze do wpisów, które go zmierzyły, z limitem 800 znaków sprawdzalnym komendą;
  ryzyka zamknięte schodzą do `docs/archiwum/ryzyka/` tą samą procedurą dwufazową co dziennik,
  a ich numery zostają widoczne w żywej tabeli, żeby żaden nie wrócił. Wiersz ustawień to jedna
  decyzja, dziennik wdrożenia planu — jedna linia na etap. Zmierzone na tym repozytorium:
  sekcja ryzyk **21,4 → 3,7 KB**.
- **Pomiar startu działa też na repozytorium sklonowanym na Windowsie.** Wzorzec szukający sekcji
  nie trafiał przy końcach linii CRLF i po cichu mierzył całe pliki — na kopii tego repozytorium
  dawało to 213,8 KB zamiast 55,7 KB. Naprawione i sprawdzone na obu wariantach końca linii.
- **Wersja 1.6.0 jest wydana i działa w aplikacji** — potwierdzone po restarcie 2026-08-21: plugin
  wczytany z nowego układu katalogów (`adapters/claude-code/`), kopia specyfikacji w projekcie
  odświeżona automatycznie przez hook startu, raport budżetu milczy przy 35,7 KB / 80 KB.
- **Mechanizm zadziałał na cudzym projekcie** — PolyFlow przeszedł 2026-08-21 z 1.5.2 na 1.6.1:
  109 rozsypanych po dzienniku spraw człowieka złożyło się w 27 pozycji jednej sekcji, pierwsza
  rotacja w historii tego projektu przeniosła wpisy i zamknięte ryzyka z potwierdzoną sumą
  kontrolną, a start sesji zszedł ze 155,7 do 136,4 KB. Raport migracji ma przetestowaną drogę
  pełnego powrotu.
- **Artefakty mają rejestr, którego wymagał profil `prompty`** — [ARTEFAKTY.md](ARTEFAKTY.md) opisuje
  38 pozycji (22 specyfikacje, szablon planu HTML, 10 komend, 2 skille, 3 reguły Cursora)
  i odpowiada na pytanie „po co", którego git nie zna. Hook `profile-rules` przestał ostrzegać:
  zmierzone na 39 ścieżkach — bez rejestru 33 ostrzeżenia, z rejestrem 0.
- Trzy dokumenty mówiące o tym samym — status etapu, linia aktywnego planu i opis stanu — nie
  rozjeżdżają się po cichu: sesja mówi o rozjeździe na starcie i pyta, który zapis jest prawdziwy.
  Wpis dziennika jest podpisany modelem i użytkownikiem; brakujący człon zostaje wyłapany.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia. Skan
  sekretów działa **poza Claude**: gitowy pre-commit zatrzymuje commit z kluczem niezależnie od
  narzędzia; bez Node.js mówi o tym wprost, zamiast po cichu przepuścić. **Od 2026-09-01 stoi
  realnie w trzech repozytoriach** — RelAI, JiraManager, PolyFlow — a w każdym zmierzony na dwóch
  wariantach indeksu (kod 1 z sekretem, 0 bez).
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń, a `adapters/claude-code/`
  i `adapters/cursor/` to dwa wyjścia. Walidator wykrywa, gdy adapter odjedzie od rdzenia.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził Grok 4.6 w aplikacji Cursora,
  z reguł zawsze-w-kontekście, bez przypominania. Oba narzędzia czytają i piszą te same `docs/`,
  więc praca naprzemienna nie wymaga migracji.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Plan HIGIENA_DOKUMENTOW — E1–E5 zrealizowane 2026-09-01, E6 gotowy do startu.** Po co:
  mechanizm rotacji i progów jest kompletny, ale w projekcie prowadzonym cztery miesiące nie odezwał
  się ani razu — dziennik PolyFlow doszedł do 862,7 KB przy progu 150 KB. **E1** odetkał rotację
  (zakres PolyFlow **0 → 117 wpisów ze 127**), **E2** dał progowi trzy wagi i komunikat zatkania,
  **E3** wymusił decyzję po 30 dniach, **E4** dał każdemu progowi adres w raporcie startu, **E5**
  dał drogę do archiwum komórce „Mitygacja" i plikowi ustawień. Kryterium E5 zamieniono **Aneksem
  C**: sekcja ryzyk PolyFlow (62 otwarte, 0 zamkniętych) nie zejdzie pod 12 KB żadnym mechanizmem
  — to nie kronika w komórkach, tylko liczba żywych ryzyk, a jej skrócenie jest decyzją człowieka.
  **E6:** pomiar pełnego startu na obu projektach i wydanie 1.7.0 sekwencją P-005.
- **Migracja JiraManagera.** Po co: to ostatni projekt, w którym start sesji kosztuje 386 KB
  dokumentów, a rotacja nigdy nie ruszyła. Czeka na okno — właściciel rozwija go na bieżąco, więc
  migracja wchodzi dopiero wtedy, gdy żaden etap tam nie trwa. Dopóki nie wejdzie, **ryzyko R5
  zostaje otwarte**: mechanizm jest kompletny i zmierzony, ale problem, dla którego powstał, jest
  rozwiązany w dwóch projektach z trzech.

## Co dalej

- **Wydanie 1.6.1** — push, `plugin marketplace update`, `plugin update`, **restart** (P-005).
  Do tego czasu cache pluginu niesie `/relai-update` z wersją docelową 1.5.0, czyli komendę, która
  cofnęłaby wersję migrowanego projektu.
- Trzy odnogi zamrożonego planu, w dowolnej kolejności: `OPIS_REPO`, `REKOMENDACJA_MODELU`,
  `GUARD_PO_SCIEZCE`. Każda ma gotowy prompt; zamrożenie planu ich nie dotyczy. Czwarta,
  `POMIAR_ODNOG`, jest **anulowana 2026-09-01** — jej warunkiem startu było `claude /login` na konto
  z limitem, a decyzja brzmi: odpuszczamy. **[REJESTR_ARTEFAKTOW](plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)**
  zamknięta 2026-09-01, **[BLOKADA_ROTACJI](fixy/BLOKADA_ROTACJI/ODNOGA.md)** wchłonięta przez E1 —
  obie przestały być wątkami.
- Obie sprawy wyjęte z odnogi REJESTR_ARTEFAKTOW **rozstrzygnięte 2026-09-01**: katalog archiwum
  artefaktów to `artefakty`, a `profile-rules` widzi `.mdc` (bez rejestru 36 ostrzeżeń zamiast 33,
  z rejestrem 0). Poza zasięgiem hooka zostają świadomie `HTML_PLAN/*.html`
  i `core/templates/README.md`.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć wpisanych w E2** planu OPTYMALIZACJA_KONTEKSTU —
  wypisane co do jednego 2026-09-01, każde ze swoim dowodem. To **jedyna** pozycja, jaka została
  w sekcji „Czeka na człowieka".
- Usunąć metadane sesji `ProbaCursorE6` (`~/.claude/projects/`, `~/.claude/session-data/`,
  `~/.cursor/projects/`) — sam katalog projektu już nie istnieje.
- Po odmrożeniu E7: adapter Codeksa, `AGENTS.md` jako plik główny projektu z adapterem Cursora albo
  Codeksa (D-86, 2026-08-17) wraz z przepięciem instalatora Cursora, ten sam scenariusz akceptacyjny
  co w E6.
- Feedback od osób **spoza projektu** — pilotaż E6 poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka; wraca przy zamknięciu planu.

## Co blokuje

- **Pomiar zachowań w świeżej sesji nie odbędzie się** — CLI `claude -p` uwierzytelnia się
  z własnego pliku poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Decyzją z
  2026-09-01 odnoga `POMIAR_ODNOG` została **anulowana**: dziewięć scenariuszy zostaje
  niezmierzonych, a **ryzyko R2 pozostaje otwarte świadomie** w części dołożonej po 1.1.0.
- **Adapter Cursora zmierzony w aplikacji, ale nie w całości.** Pilotaż potwierdził reguły, hook
  kontekstu, obie warstwy blokady sekretu i pełne przejście `/relai-stage`. Niezmierzone: hook
  `beforeReadFile`, dostęp poza katalogiem roboczym, osiem pozostałych komend.
- **Reguły 1.7.0 działają w repozytorium, ale nie w zainstalowanym pluginie.** Rotacja z 2026-09-01
  poszła regułą z `core/templates/SPEC_ARCHIWUM.md` (38,8 KB), bo kopia w projekcie
  `.claude/relai/templates/` niesie wersję **1.6.1** (26,7 KB) z cache'u pluginu i mówi co innego
  o wpisie linkowanym. Rozjazd wykryło porównanie zrobione ręcznie — **nic go nie zgłasza samo**,
  a wyrówna go dopiero wydanie 1.7.0 (E6, sekwencja P-005).
- **Pytanie partiami po cztery jest opisane, ale niezmierzone w żywej sesji.** E3 nie miał ani
  jednej sprawy przeterminowanej w tym repozytorium — najstarsza czeka 12 dni przy progu 30 — więc
  zmierzone jest wykrycie i cisza, nie sam przebieg pytania. Pomiar wchodzi do E6 razem z sekwencją
  wydania.
- **Przepięcie linków z E1 nadal czeka na przebieg, w którym coś realnie przepnie.** Rotacja
  2026-09-01 objęła wpisy 1–3, a pozycje „Czeka na człowieka" linkują do wpisów 6, 12, 16, 22 i 23.
  Zmierzone jest zachowanie zakresu, nie sama operacja przepięcia w żywym pliku.
- Repozytorium jest **publiczne**, ale ma pusty opis — odnoga `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium: **1.6.1**, wypchnięte (`ea33e1c`). Zainstalowany globalnie (scope `user`): **1.6.1**,
działa w aplikacji — potwierdzone po restarcie 2026-08-21: hook startu zgłosił rozjazd wersji
projektu (1.6.0) wobec pluginu (1.6.1), a `/relai-update` wykonana z cache'u pluginu podniosła
strukturę tego projektu do 1.6.1. Źródło: własny marketplace w tym samym repozytorium.

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
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI` • Rozpoznanie narzędzi: [PRZENOSNOSC.md](PRZENOSNOSC.md) •
Pułapki: [PULAPKI.md](PULAPKI.md)

### Liczby

Etapy: BUDOWA_RELAI 10/10 • ROZWOJ_PO_WYDANIU 6/8 (ZAMROŻONY) • OPTYMALIZACJA_KONTEKSTU 5/5
(ZREALIZOWANY) • HIGIENA_DOKUMENTOW 5/6 •
Warstwa startowa RelAI: **47,1 KB / 80 KB** (pomiar z E4) • Warstwa
startowa PolyFlow po migracji: **136,4 KB / 80 KB** (przed: 155,7) • Dziennik: **147,7 KB /
próg 150 KB** po dwóch rotacjach 2026-09-01 i wpisach E3–E4 (przed pierwszą: 168,0) • Lekcje
25,1 KB / 14 lekcji • Sprawy czekające na człowieka: **1 tutaj** (było 10 przed 2026-09-01),
**25 otwartych w PolyFlow**, żadna nieprzeterminowana przy progu 30 dni •
Progi w katalogu: **17, z tego 1 bez adresu egzekwowania** •
Zasady aktywne: **15 przy limicie 15** • Lekcje: 17 w żywym rejestrze, ostatnia L-0071 •
Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora •
Adaptery: 2 • Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na 1.6.x: 2 (RelAI, PolyFlow) • Otwarte wątki: 3 (odnogi zamrożonego planu; POMIAR_ODNOG
anulowana) • Artefakty w rejestrze: 38 • Otwarte bramki manualne: 2 (sekwencja wydania,
pre-commit) •
Otwarte ryzyka: 4 • Zamknięte ryzyka: 6 (w archiwum) • Progi rotacji: dziennik
150 KB, lekcje 40 wpisów albo 50 KB, STATE 300 linii • Archiwum: lekcje L-0001…L-0024, dziennik
2026-08-07…2026-08-09 (16 wpisów), 2026-08-10 (2 wpisy), 2026-08-10…2026-08-12 (4 wpisy),
2026-08-12 (3 wpisy, `b4601365eee25163`) oraz 2026-08-12…2026-08-17 (3 wpisy,
`1690be9b08748504`), ryzyka R1/R3/R4/R6/R7/R8 (2026-08-21)
