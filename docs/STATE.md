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
**HIGIENA_DOKUMENTOW** (zaakceptowany 2026-09-01, sześć etapów): zgłoszenie z sesji roboczej
PolyFlow pokazało sześć miejsc, w których mechanizm rotacji i progów nie broni się sam. **E1 i E2
są zamknięte** — rotacja przestała się zatykać na własnej regule, a gdy stoi, mówi na czym i ile to
kosztuje.

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
- **Koszt startu sesji jest liczony, a nie szacowany.** Hook mierzy sześć pozycji rytuału startu
  i porównuje sumę z budżetem 80 KB. Powyżej budżetu: najwyżej sześć linii z sumą, trzema
  najgrubszymi pozycjami i propozycją odchudzenia. Poniżej: ani jednego znaku. Oba adaptery wołają
  tę samą funkcję rdzenia.
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
- Trzy dokumenty mówiące o tym samym — status etapu, linia aktywnego planu i opis stanu — nie
  rozjeżdżają się po cichu: sesja mówi o rozjeździe na starcie i pyta, który zapis jest prawdziwy.
  Wpis dziennika jest podpisany modelem i użytkownikiem; brakujący człon zostaje wyłapany.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia. Skan
  sekretów działa **poza Claude**: gitowy pre-commit zatrzymuje commit z kluczem niezależnie od
  narzędzia; bez Node.js mówi o tym wprost, zamiast po cichu przepuścić.
- Repozytorium ma jawną granicę: `core/` to wspólny rdzeń, a `adapters/claude-code/`
  i `adapters/cursor/` to dwa wyjścia. Walidator wykrywa, gdy adapter odjedzie od rdzenia.
- **Proces przeżywa zmianę dostawcy modelu** — cały etap poprowadził Grok 4.6 w aplikacji Cursora,
  z reguł zawsze-w-kontekście, bez przypominania. Oba narzędzia czytają i piszą te same `docs/`,
  więc praca naprzemienna nie wymaga migracji.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- **Plan HIGIENA_DOKUMENTOW — E1 i E2 zrealizowane 2026-09-01, E3 gotowy do startu.** Po co:
  mechanizm rotacji i progów jest kompletny, ale w projekcie prowadzonym cztery miesiące nie odezwał
  się ani razu — dziennik PolyFlow doszedł do 862,7 KB przy progu 150 KB. **E1 zdjął pierwszą
  przyczynę:** pozycja „Czeka na człowieka" linkuje do najnowszego wystąpienia sprawy, wpis linkowany
  przestał być nietykalny, a jego link jest przepinany na archiwum w fazie 2 — zakres rotacji rośnie
  z **0 do 117 wpisów ze 127**. **E2 zdjął drugą:** próg liczy się ponad nietykalnymi, a zatkana
  rotacja wypisuje blokery zamiast milczeć. E3: sprawa starsza niż **`N = 30 dni`** wymusza decyzję
  na starcie sesji (Aneks A — wyłącznik osobny od rotacji). Aneks B: E4 obejmuje też **progi sekcji**
  i katalog progów.
- **Migracja JiraManagera.** Po co: to ostatni projekt, w którym start sesji kosztuje 386 KB
  dokumentów, a rotacja nigdy nie ruszyła. Czeka na okno — właściciel rozwija go na bieżąco, więc
  migracja wchodzi dopiero wtedy, gdy żaden etap tam nie trwa. Dopóki nie wejdzie, **ryzyko R5
  zostaje otwarte**: mechanizm jest kompletny i zmierzony, ale problem, dla którego powstał, jest
  rozwiązany w dwóch projektach z trzech.

## Co dalej

- **Wydanie 1.6.1** — push, `plugin marketplace update`, `plugin update`, **restart** (P-005).
  Do tego czasu cache pluginu niesie `/relai-update` z wersją docelową 1.5.0, czyli komendę, która
  cofnęłaby wersję migrowanego projektu.
- Cztery odnogi zamrożonego planu, w dowolnej kolejności: `OPIS_REPO`, `POMIAR_ODNOG` (dziewięć
  scenariuszy), `REKOMENDACJA_MODELU`, `GUARD_PO_SCIEZCE`. Każda ma gotowy prompt; zamrożenie planu
  ich nie dotyczy. Piąta — **[REJESTR_ARTEFAKTOW](plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)**
  z E1: profil `prompty` wymaga `docs/ARTEFAKTY.md`, a rejestru nadal nie ma.
  **[BLOKADA_ROTACJI](fixy/BLOKADA_ROTACJI/ODNOGA.md)** przestała być wątkiem — wchłonął ją E1.
- Przejrzeć sekcję **„Czeka na człowieka"** w dzienniku — dziewięć spraw otwartych, w tym siedem
  rozstrzygnięć wpisanych w E2 planu OPTYMALIZACJA_KONTEKSTU na podstawie faktów z repozytorium,
  do potwierdzenia.
- Zainstalować pre-commit tam, gdzie ma pilnować: `node core/guardrails/install-precommit.js
  <projekt>`. Hook jest zmierzony, ale nikt go za człowieka nie podłoży.
- Po odmrożeniu E7: adapter Codeksa, `AGENTS.md` jako plik główny projektu z adapterem Cursora albo
  Codeksa (D-86, 2026-08-17) wraz z przepięciem instalatora Cursora, ten sam scenariusz akceptacyjny
  co w E6.
- Feedback od osób **spoza projektu** — pilotaż E6 poprowadził autor, więc kryterium „ktoś inny niż
  autor" nadal czeka; wraca przy zamknięciu planu.

## Co blokuje

- **Pomiar zachowań w świeżej sesji** — CLI `claude -p` uwierzytelnia się z własnego pliku
  poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Odblokowuje to `claude /login`;
  do tego czasu odnoga `POMIAR_ODNOG` stoi. Scenariusze rotacji wymagają dodatkowo restartu
  aplikacji po aktualizacji pluginu (P-005).
- **Adapter Cursora zmierzony w aplikacji, ale nie w całości.** Pilotaż potwierdził reguły, hook
  kontekstu, obie warstwy blokady sekretu i pełne przejście `/relai-stage`. Niezmierzone: hook
  `beforeReadFile`, dostęp poza katalogiem roboczym, osiem pozostałych komend.
- **Reguły są naprawione, ale nikt ich jeszcze nie użył w prawdziwej sesji.** E1 zmierzył zakres
  rotacji na kopiach dziennika PolyFlow (0 → 117 wpisów ze 127) i przeszedł pełny przebieg
  z przepięciem linków na kopii dziennika RelAI. E2 wypisał komunikat blokady w obu wersjach na
  pięciu realnych plikach, ale żadna sesja nie napisała go w rytuale zamknięcia. Jedno i drugie
  wchodzi do E6 razem z wydaniem 1.7.0.
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
(ZREALIZOWANY) • HIGIENA_DOKUMENTOW 2/6 •
Warstwa startowa RelAI: **35,1 KB / 80 KB** (pomiar sprzed E1) • Warstwa
startowa PolyFlow po migracji: **136,4 KB / 80 KB** (przed: 155,7) • Dziennik: **163,8 KB —
ponad progiem 150 KB**; część rotowalna 104,6 KB, dolna granica osiągalna 52,1 KB (pomiar E2, przed
tym wpisem) • Lekcje 20,6 KB • Sprawy czekające na człowieka: 9 tutaj, 27 w PolyFlow •
Zasady aktywne: **15 przy limicie 15** • Lekcje: 11 w żywym rejestrze, ostatnia L-0065 •
Scenariusze akceptacyjne: 4/4 zdane + pilotaż Cursora •
Adaptery: 2 • Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na 1.6.x: 2 (RelAI, PolyFlow) • Otwarte wątki: 5 (4 odnogi zamrożonego planu +
REJESTR_ARTEFAKTOW z E1) • Otwarte bramki manualne: 4 (wszystkie w zamrożonym ROZWOJ_PO_WYDANIU) •
Otwarte ryzyka: 4 • Zamknięte ryzyka: 6 (w archiwum) • Progi rotacji: dziennik
150 KB, lekcje 40 wpisów albo 50 KB, STATE 300 linii • Archiwum: lekcje L-0001…L-0024, dziennik
2026-08-07…2026-08-09 (16 wpisów) oraz 2026-08-10 (2 wpisy), ryzyka R1/R3/R4/R6/R7/R8 (2026-08-21)
