# STATE — RelAI

Stan na: 2026-09-15 (zamknięcie planu OPTYMALIZATOR_PROMPTOW i wydanie 2.2.0; stan techniczny poniżej z 2026-09-06)

## Gdzie jesteśmy

RelAI ma w repozytorium i publicznie **2.2.0** (wydane 2026-09-15: tag, push, potwierdzone treścią
plików z cache'u po `plugin update` — 10/10, kontrola pozytywna na 2.1.4 dała różnicę). **2.2.0
dokłada czternastą komendę `/relai-prompt` i tryb ciągły optymalizatora.** Poprzednio **2.1.4**
(wydane 2026-09-12) i działa w Claude Code, Cursorze oraz
jako natywny plugin Codexa z jednym rdzeniem procesu. **2.1.0 dokłada załogę** — trzynastą komendę
`/relai-crew`: sesja zostaje orkiestratorem celu, pyta o role, liczbę subagentów, tryb i zakres
modeli, układa zadania w fale bez konfliktów plików, deleguje je subagentom gospodarza albo do
drugiego zalogowanego narzędzia i zleca przegląd krzyżowy; bez drugiego narzędzia pracuje w trybie
basic. **Seria 2.1.1–2.1.3 to naprawa dystrybucji, nie nowe funkcje**: trzy niezależne wady wprowadzone
razem z 2.0.0 i 2.1.0 sprawiały, że plugin Claude Code nie ładował komend (P-010, P-011, P-012).
**2.1.4 domyka czwartą wadę tej samej klasy** ([P-013](PULAPKI.md)): korzeniowy `hooks/` Codeksa jest
dla Claude Code katalogiem konwencyjnym, więc ładował się obok hooków z manifestu — zdublowany
kontekst startu i błąd schematu `SessionEnd`. Naprawione bramką hosta i wydane 2026-09-12 (odnoga
HOOKI_KORZEN); **świeża sesja na 2.1.4 ma jeden blok kontekstu i zero komunikatów o błędzie hooka**.

**W repo, niewydane (2026-09-24, zakres 2.3.1):** `/relai-prompt` pyta o model optymalizatora
i zasięg wyboru (ten prompt / ta sesja / ten projekt / wszystkie projekty), a flaga `--model`
wybiera jednorazowo. Wydanie razem z pierwszym etapem następnego planu.

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
- Czternaście skrótów operacyjnych: etap planu, odnoga, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja, sprzątanie plików roboczych,
  odświeżenie listy modeli, załoga, **optymalizator promptu**.
- **Podyktowane zdanie wraca poprawione, zanim ruszy w robotę** — na żądanie komendą albo przy
  każdym prompcie merytorycznym, gdy tryb ciągły jest włączony. Oryginał stoi obok propozycji,
  dopowiedzenia są oznaczone, a wykonanie czeka na zgodę; komendy, frazy sesji, potwierdzenia
  i pytania przechodzą nietknięte.
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
- W folderze, który nie jest projektem RelAI, **hooki** pluginu są całkowicie niewidome: pierwszy
  warunek każdego z nich to marker `Wersja RelAI`. **Skill `relai-core` widzi każdy folder** — plugin
  instaluje się w zakresie użytkownika, a opis skilla każe mu sprawdzić folder przy pierwszym
  prompcie sesji i zaproponować strukturę, gdy jej nie ma (zgłoszenie testera, 2026-09-15). Od 2.3.0
  propozycję można wyciszyć raz na maszynę wierszem `Propozycja RelAI poza projektem`; tryb gościa
  (D-21) nadal zamyka temat w jednym folderze.

## Nad czym pracujemy teraz

- **2.3.0 — dwie bramki zgody, WYDANE 2026-09-15** (zgłoszenie testera → P-015).
  Proaktywne zachowania RelAI pytają o zgodę, zamiast jej zakładać: (1) tryb ciągły optymalizatora
  pyta raz na sesję — ta sesja / nie pytaj więcej / nie — bo włączony wiersz `Tryb ciągły` znaczy
  „tryb dostępny", a nie „tryb działa"; zgoda sesyjna wiąże się z identyfikatorem sesji, trwała
  mieszka w wierszu `Zgoda na optymalizator` z przypomnieniem co 30 dni; (2) wiersz `Propozycja
  RelAI poza projektem` wycisza propozycję zakładania struktury **we wszystkich** folderach bez
  markera naraz. Przełączniki: `/relai-prompt on|off [--globalnie]`. Testy 50/50, dowód na nośniku
  9/9. Wydane commitem `8479212` i tagiem `v2.3.0` na `origin/main`. **Niezmierzone:** zachowanie
  obu bramek z **zainstalowanego** pluginu — u użytkowników po `plugin update`, u nas po restarcie
  aplikacji (P-005); ta sesja nadal wykonuje 2.2.0 z pamięci.

- **OPTYMALIZATOR_PROMPTOW — ZREALIZOWANY 2026-09-15** (5/5, wydanie **2.2.0**):
  [archiwum planu](archiwum/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md). Warstwa zamieniająca podyktowane
  zdanie w precyzyjny prompt jest **publiczna**: czternasta komenda `/relai-prompt` plus **tryb
  ciągły** włączany wierszem `Tryb ciągły` w `USTAWIENIA.md` (w tym projekcie **włączony**; wartość
  spoza listy i brak wiersza = wyłączony i cisza). Komenda przenosi do promptu **pamięć projektu**
  (4–6 pozycji ze 123, limit 1 300 znaków), odpowiada w języku wejścia i deleguje na model z wiersza
  `Model optymalizatora` = **Sonnet 5** (E2: 56 wywołań, 17,80 USD; Haiku 3 propozycje z 20, Sonnet
  14 z 20). Baza reguł jedzie do projektu razem ze specyfikacjami — kopia **nadpisywana** przy każdym
  starcie, w odróżnieniu od trwałej listy modeli.
  **Nośnik trybu jest zmierzony, nie założony:** hook `UserPromptSubmit` **dokłada kontekst**
  i promptu **nie podmienia** (O1), koszt **+110 tokenów na turę**, filtr pomijania 12/12. Na wydanej
  wersji obie strony na jednym zdaniu: `włączony` → 13 tur i propozycja bez wykonania (1,00 USD),
  `wyłączony` → 4 tury prosto do wykonania (0,35 USD). Zamknięte: **O1, O6, O9, O10** i **W1**
  (`claude plugin validate` jest odtąd krokiem P-005). Otwarte: **O4** — liczba jest, ale rozrzut
  zachowania modelu przewyższa mierzoną różnicę.
  **Zostało po planie, do rozstrzygnięcia:** kierunek następnego planu — wznowienie pilotażu
  PIERWSI_UZYTKOWNICY albo tryb ciągły poza Claude Code (materiał: `UserPromptSubmit` Codeksa
  i nośnik `exit 2`, który zatrzymuje turę przed modelem za 0,00 USD). Delegacja w trybie ciągłym
  **bywa pomijana** — model raz otwiera komendę, raz odtwarza procedurę z reguły.
- **PIERWSI_UZYTKOWNICY — CZĘŚCIOWO ZREALIZOWANY 2026-09-24** (wcześniej wstrzymany 2026-09-14), E1 i E2
  ZREALIZOWANE (2026-09-12 i 2026-09-13), E3 pominięty — pilotaż nie wystartował; zarchiwizowany: [plan](archiwum/plany/PIERWSI_UZYTKOWNICY/PLAN.html) i [status](archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md).
  Pierwszeństwo dostał nowy plan; **termin graniczny raportu 2026-10-03 traci moc** do czasu
  wznowienia, bo pilotaż nie wysłał ani jednego zaproszenia.
  Cel: aktywni użytkownicy i feedback od polskich samodzielnych twórców pracujących z AI; limit
  2–4 sesje, bez płatnej promocji. **Aneks A**: materiał demo produkuje agent, nie nagrywa go
  człowiek. E1 dowiózł **cztery pliki materiału** (25 s GIF i 60 s MP4, PL i EN, bez dźwięku)
  w [docs/zasoby/demo/](zasoby/demo/), [dokumentację materiału](archiwum/plany/PIERWSI_UZYTKOWNICY/DEMO.md)
  z tabelą pokrycia 11/11, [zapis źródłowy](archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/) siedmiu kroków
  i poprawiony początek README z osadzonym GIF-em — **sprawdzonym na żywej stronie**: GitHub serwuje
  go z `raw/main` jako animowany obraz (HTTP 200, `image/gif`, 5 063 834 B).
- **E2 dowiózł materiały zaproszenia — nic nie zostało wysłane.**
  [ZAPROSZENIE.md](archiwum/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md) ma cztery bloki gotowe do wklejenia
  (Odpalone, własna sieć, odpowiedź na krytykę, instrukcja dla uczestnika) i tabelę pokrycia
  **27 tez, 27 ze wskazanym źródłem**; [PROBY.md](archiwum/plany/PIERWSI_UZYTKOWNICY/PROBY.md) czeka pusty,
  z regułą wypełniania i wierszami-wzorami. Odnoga `OPIS_REPO` **odświeżona, nie zamknięta** —
  jej domknięcie wymaga zmiany na GitHubie. Publikacja, wysyłka i kontakty czekają na dyspozycję;
  bramki „Dyspozycja publikacji i kontaktów" oraz „Uczestnicy" są otwarte. Liczniki pilotażu:
  **0 kontaktów, 0 prób, 0 aktywacji** przy progach 3–5 / ≥3 / ≥2.
- **Publiczna instalacja zmierzona 2026-09-13** na 2.1.4 w izolowanym `CLAUDE_CONFIG_DIR`: obie
  komendy z README, `✔ enabled`, `✔ Validation passed`, 6/6 plików cache'u zgodnych z tagiem.
  Marketplace serwuje `main`, nie obiekt release. Na 2.2.0 nie powtórzone.
- **Materiał demo jest odtworzeniem zmierzonego przebiegu, nie nagraniem ekranu.** Każda klatka
  pokazująca plik albo odpowiedź agenta ma pokrycie w zapisie realnych sesji; instrument pokrycia
  ma kontrolę pozytywną. Kontrola układu na wyrenderowanych klatkach: **0 przepełnień** na
  wszystkich scenach obu cięć i obu wersjach językowych.
- **Materiał demo nie działa na telefonie i pierwsze trzy sekundy nie mówią, o co chodzi**
  (ocena odbiorcza, E2, 2026-09-13). Na szerokości 375 px, czyli tej, którą GitHub daje obrazowi na
  telefonie, czytelny jest **wyłącznie tytuł sceny** (32 px → 12,50 px); lista etapów 13 px →
  5,08 px, treść karty 14 px → 5,47 px, ścieżki plików 9 px → 3,52 px, przy progu 8 px (SZACUNEK).
  Scena `sesja` jest najbliżej progu (7,42 px). Treść merytoryczna zaczyna się dopiero w 3,5 s —
  3 z 25 sekund to plansza tytułowa. Naprawa wymaga nowego renderu, więc jest decyzją do E3.
- ~~**Wydanie 2.1.4**~~ — wydane 2026-09-12, potwierdzone treścią plików z cache'u (5/5); od niego
  `claude plugin validate` przed tagiem jest krokiem sekwencji P-005 (W1, zamknięte 2026-09-15).
- **Migracja JiraManagera** — ostatni projekt, w którym start sesji kosztuje 386 KB dokumentów,
  a rotacja nigdy nie ruszyła. Czeka na okno właściciela; do tego czasu ryzyko R5 zostaje otwarte,
  zawężone do tego jednego projektu.
- **ROZWOJ_PO_WYDANIU zamknięto 2026-09-05** (8/8); wydania 1.10.0 i 2.0.0 są publiczne,
  a plan przechodzi do archiwum.

## Co dalej

- **Plan [PROWADZENIE_END_TO_END](plany/PROWADZENIE_END_TO_END/STATUS.md) czeka na akceptację**
  (utworzony 2026-09-24): 7 etapów, 10–13 sesji (SZACUNEK), rejestr 56 ustaleń z trzech raportów
  sesji — spójność, lżejszy start, podział skilli, nakładki per model (Opus 5.5 główny), onboarding,
  debug / bezpieczeństwo / deploy. Tryb ciągły poza Claude Code nie wszedł do tego planu.
- **Restart aplikacji desktopowej po wydaniu 2.2.0** — do tego czasu ta aplikacja ładuje 2.1.4
  z pamięci (P-005). Sekwencja wydania zamknęła się na świeżych sesjach CLI z cache'u.
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
  **Potwierdzone drugi raz 2026-09-14, tym razem na dwóch dokumentach naraz**: litera specyfikacji
  wzięłaby z dziennika 7 wpisów (zostałoby 164,8 KB przy progu 150) i z lekcji **zero** pozycji
  (zostałoby 53,0 KB przy progu 50), bo ich część rotowalna jest poniżej 60% progu, zanim cokolwiek
  się zabierze. Kryterium „cały plik poniżej 60% progu" dało 29 wpisów i 9 lekcji, czyli 87,3 KB
  i 42,6 KB. **To jest wada rdzenia RelAI, nie tego projektu** — poprawka `SPEC_ARCHIWUM.md`
  wymaga decyzji, czy cel przenosi się na wagę całkowitą; kandydat na odnogę.
- ~~**Cztery wady dystrybucji 2.0.0–2.1.3**~~ — wszystkie naprawione i wydane do 2.1.4: korzeniowy
  `skills/` kasujący komendy (P-010), katalog w polu `agents` unieważniający manifest (P-011),
  dwukropek w `description` zjadający trzynastą komendę (P-012), korzeniowy `hooks/` dublujący
  kontekst startu (P-013). Opisy i dowody: [PULAPKI.md](PULAPKI.md) i wpisy dziennika z 2026-09-06
  i 2026-09-12.
- **Bramka wydania: `claude plugin validate <ścieżka>`** — narzędzie istniało przez cały czas
  i wskazałoby obie wady w sekundę. Wprowadzić do sekwencji P-005 jako krok obowiązkowy przed tagiem.
- **`PRZENOSNOSC.md` sekcja 2.3 jest nieaktualna** — opisuje wywołanie procedur Codeksa jako
  `$nazwa-skilla` (stan dokumentacji z 2026-08-12), a w aplikacji desktopowej Codeksa `/relai`
  podpowiada komplet. Rozpoznanie do powtórzenia i przepisania.
- **Dwie wady `work-artifacts.js`**: `kasuj` melduje `skasowane` dla ścieżki, której nie ma
  (linia 843 — gasi sygnał o literówce w liście), a `zachowaj` na cudzej ścieżce zapisuje marker
  w projekcie sesji zamiast w projekcie pliku. **Pierwsza wada potwierdzona w działaniu 2026-09-12**:
  lista ścieżek z backslashami została zjedzona ze znaków ucieczki, narzędzie zameldowało `OK` dla
  trzech nieistniejących ścieżek i nie skasowało niczego. Obejście do czasu naprawy: ścieżki
  w liście `kasuj` zapisuj **ukośnikami**, a po operacji sprawdzaj stan katalogu, nie komunikat.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** oraz należna tam rotacja lekcji
  i ryzyk zamkniętych — osobne operacje na cudzym projekcie.
- **Odnoga `OPIS_REPO`** (pusty opis repozytorium i tematy na GitHubie) — jej prompt jest z sierpnia
  i opisuje RelAI 1.5.x, więc wymaga odświeżenia przed startem.
- Potwierdzić albo cofnąć **osiem rozstrzygnięć z E2** planu OPTYMALIZACJA_KONTEKSTU (wypisane
  2026-09-01) oraz usunąć metadane sesji `ProbaCursorE6` z `~/.claude/` i `~/.cursor/`.
- **Po planie:** pełna sesja Codexa i praca Cursor/Claude pozostają możliwą odnogą pomiarową;
  nie są blokadą opublikowanego wydania 2.0.0.
- **Feedback od osób spoza projektu** — pilotaż PIERWSI_UZYTKOWNICY zamknięto 2026-09-24 przed
  wysyłką; kryterium „ktoś inny niż autor" nadal czeka i wróci, jeśli w ogóle, osobnym planem.
  Materiały zaproszenia zostają w archiwum planu do ponownego użycia.
- **Ponowny render materiału demo pod ekran telefonu** — od 2026-09-24 w etapie E5 planu
  PROWADZENIE_END_TO_END. Źródła renderu przestały
  istnieć razem z katalogiem roboczym E1, więc każdy nowy render zaczyna się od ich odtworzenia
  według instrukcji z [DEMO.md](archiwum/plany/PIERWSI_UZYTKOWNICY/DEMO.md) — to jest ta sama decyzja co
  „trwałe miejsce źródeł renderu" (Aneks A, ryzyko A2), tylko z nowym powodem.
- **`description` i `keywords` manifestu opisują produkt jednonarzędziowy** („…framework for Claude
  Code"), a RelAI ma trzy adaptery; `keywords` nie zawiera ani jednej nazwy narzędzia. Wizytówka
  repozytorium ma to skopiować czy najpierw poprawiamy manifest (czyli podbicie wersji i pełna
  sekwencja wydania)? Rozstrzygnięcie należy do odnogi `OPIS_REPO`, gdzie jest zapisane.

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

Repozytorium i publicznie: **2.2.0** (2026-09-15, tag `v2.2.0`, commit `fb8cd7c`). Walidator:
kod 0, „5 zrodel, wartosc 2.2.0". **Wydanie potwierdzone treścią plików z cache'u, nie komunikatem
CLI** (P-005): `installed_plugins.json` wskazuje `...\2.2.0`, a dziesięć plików z katalogu wydanej
wersji zgadza się sumą z repozytorium po normalizacji CRLF → LF (10/10); kontrola pozytywna wobec
2.1.4 dała różnicę. Sekwencja: `update` → restart → dowód treścią, przy czym `plugin update` wymaga
**pełnej nazwy** `relai@relai`. Źródło instalacji: własny marketplace w tym repozytorium, scope
`user`. Gitowy pre-commit tego repozytorium stoi na układzie 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów + szablon planu HTML z osadzonymi fontami • guardraile
jako skrypty (skan sekretów, pre-commit, instalator) • rozpoznania startu sesji
(`process/session-signals.js`), pomiar artefaktów (`process/work-artifacts.js`) i załoga
(`process/crew.js`) i tryb ciągły optymalizatora (`process/prompt-mode.js`), wołane przez
adaptery • **baza reguł optymalizatora** (`prompt/`) • walidator spójności • `MANIFEST.json`.

**Adapter Claude Code**: dwa skille, **czternaście komend**, trzej agenci załogi plus optymalizator
promptu, jedenaście hooków Node.js bez zależności npm, własna lista modeli. Manifest i marketplace zostają w `.claude-plugin/` — tego wymaga Claude Code.

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
ROZWOJ_PO_WYDANIU 8/8 (**ZREALIZOWANY**) • PIERWSI_UZYTKOWNICY 2/3 (**CZĘŚCIOWO ZREALIZOWANY 2026-09-24**) •
OPTYMALIZATOR_PROMPTOW 5/5 (**ZREALIZOWANY 2026-09-15**, Aneksy A i B) • **Aktywny plan: PROWADZENIE_END_TO_END (DO AKCEPTACJI)** •
Dziennik: **144,4/150 KB** (17 wpisów) — rotowany 2026-09-14 • Lekcje: **48,6/50 KB** (23 w żywym
rejestrze, ostatnia L-0111) — rotowane 2026-09-14, zeszło L-0079…L-0088 • Sekcja ryzyk:
**23,5 KB / 12 KB — ponad progiem**: O6 i W1 zamknięte 2026-09-15, więc część rotowalna przestała
być pusta i **rotacja ryzyk ma wreszcie co zabrać** • `STATE.md`: **24,4 KB przy progu cząstkowym
12 KB, ~300 linii przy progu 300** — skracany 2026-09-14 i 2026-09-15; odchudza go przepisanie,
nie archiwum • Archiwum: **osiem** plików dziennika, **pięć** lekcji, trzy ryzyk •
Sprawy czekające na człowieka: **8 tutaj** (6 rozstrzygniętych: 2026-09-12, dwie 2026-09-14
i trzy 2026-09-15), 32 w PolyFlow, żadna nieprzeterminowana •
Otwarte ryzyka: **10** (z planu optymalizatora został **O4**; O1 zamknięte w E4, **O6 i W1 w E5**,
O2, O3 i O7 w E1, O9 w E2, O10 i O11 zmierzone i nigdy nie weszły do tabeli) •
Zamknięte: **8 w archiwum + 4 w tabeli (O9, O1, O6, W1)** •
Otwarte bramki manualne: **3** — wszystkie w planie wstrzymanym (dyspozycja publikacji i kontaktów,
uczestnicy, ponowny render demo). **Cztery bramki optymalizatora rozstrzygnięte 2026-09-15**:
kolizja z ECC (oba zostają), licznik kosztu (nie budujemy), powrót pilotażu (nie teraz) oraz tryb
poza Claude Code (osobny plan, Aneks A) •
Otwarte wątki: **1** — odnoga `OPIS_REPO`, zakres odświeżony 2026-09-13; `ORKIESTRACJA` zamknięta 2026-09-06 •
Artefakty w rejestrze: **50** (E5 podbił wersje czterech: komenda do 5, `/relai-update` do 12,
skill `relai-core` do 14, dwie specyfikacje do 5; kod wykonawczy i zasoby wizualne do rejestru
nie wchodzą) • Zasady aktywne:
**15 przy limicie 15** (L-0110 i L-0111 doklejone do zasady 5, bez szesnastej pozycji) •
Progi w katalogu: **18, z tego 17 z adresem egzekwowania** • Adaptery: **3** •
Procedury: **14** (czternasta — `/relai-prompt`, **wydana 2026-09-15**) •
Scenariusze akceptacyjne: 4/4 + pilotaż Cursora •
Modele, na których zmierzono proces: 5 (Fable, Opus, Haiku, Composer/auto, Grok 4.6) •
Projekty na RelAI: 3 (RelAI 2.0.0, PolyFlow 1.8.0, JiraManager przed migracją) •
Testy regresyjne: **43** (guardraile 19, adapter Codex 8, załoga 9, **tryb ciągły 7**) •
Modele, które zmieniły kod produktu: **2** (Opus 5, gpt-6-astra) •
Zgłoszenia z cudzych projektów: **1, obsłużone w dniu wpłynięcia** (pre-commit, 4 defekty)
