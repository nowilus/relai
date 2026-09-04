# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski przy Opusie, średni przy modelach słabszych** (2026-08-10 po E10) | **ZAMKNIĘTE 2026-09-03** | Warstwą nośną są hook `session-context` i `CLAUDE.md` projektu — działają przy każdym modelu, bez wyzwalania; skill dokłada wyłącznie procedurę (L-0030). Opus wyzwala skill sam i wykonuje procedurę w całości; Sonnet 4.6 i Haiku 4.5 nie wołają `Skill` ani razu, więc projekt nie traci pamięci, ale procedura bywa niepełna. Otwarte świadomie: to trwała własność modeli, nie usterka do naprawienia. Zakres ryzyka rósł od 1.1.0 bez pomiaru — dziesiąta komenda, sygnał odchylenia, rozjazd stanu i kontrola podpisu nie były mierzone w świeżej sesji, bo limit konta zatrzymał CLI (L-0032). **Odnoga `POMIAR_ODNOG` anulowana 2026-09-01** — ta część zakresu zostaje niezmierzona świadomie, karta zostaje w repo. **ZAMKNIĘTE 2026-09-03 decyzją człowieka** przy domknięciu tej odnogi: ryzyko zamyka się nie dlatego, że brakujące dziewięć scenariuszy zmierzono, tylko dlatego, że **nie zostaną zmierzone nigdy** — warunkiem był `claude /login` na konto z limitem, a decyzja brzmi „odpuszczamy". To, co niesie ochronę, jest zmierzone i działa: hook i `CLAUDE.md` są niezależne od wyzwalania skilla, więc niezmierzona zostaje wyłącznie kompletność procedury przy modelach słabszych od Opusa — trwała własność modeli, nie zaległość projektu. Powrót jest tani: karta odnogi zostaje w repozytorium, a pojawienie się konta z limitem otwiera ryzyko z powrotem jednym wierszem. Zmierzone: 2026-08-07 (E5), 2026-08-10 (E10), 2026-08-12 (E1), 2026-08-12 (E3). **Adnotacja 2026-09-03 (E1 planu REKOMENDACJA_MODELU): przesłanka zamknięcia jest nieaktualna** — `claude -p` w tej sesji **zadziałał** i poprowadził pomiar dwóch świeżych sesji (L-0084). Warunek „konto z limitem" jest spełniony, więc powrót ryzyka kosztuje jeden wiersz. Statusu **nie zmieniam sam** — zamknięcie było decyzją człowieka i do człowieka wraca; pytanie stoi w sekcji „Czeka na człowieka" |
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Mechanizm jest kompletny **i zadziałał na cudzym projekcie w żywej sesji**, nie tylko w instrumentach: PolyFlow 1.6.1 → 1.7.0, rotacja dziennika **183,1 → 147,3 KB** (9 wpisów, suma `566dca8a4dd45ba7` odczytana z dysku przed przycięciem), rotacja ustawień **29,8 → 25,4 KB** (16 wierszy, 5 wierszy maszynowych nietkniętych), przepięcie linków z bilansem zero (60 przed, 65 po rotacji, 60 po przepięciu). Tutaj: dziennik **155,6 → 74,1 KB**, 18 wpisów do archiwum, raport startu z 2 linii na **0**. Zawężone, bo to, co zostało, nie jest już własnością mechanizmu: **JiraManager (386 KB startu) czeka na okno właściciela**, a warstwa startowa PolyFlow (157,3 KB przy budżecie 80 KB) jest gruba sekcją ryzyk, `CLAUDE.md` i `STATE.md` — odchudzają je decyzje człowieka, nie archiwum. Zmierzone: 2026-08-20, 2026-08-21, 2026-09-01 (E1–E6) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. **1.8.1 (odnoga GUARD_PO_SCIEZCE) zamyka osobną dziurę tej samej rodziny**, obecną w obu adapterach: guard rozpoznawał projekt wyłącznie po katalogu sesji, więc zapis do cudzego projektu RelAI przechodził bez ostrzeżenia w Claude Code tak samo jak w Cursorze. Zmierzone instrumentem na dwóch drzewach (22 + 4 scenariusze, 0 niezgodnych); poziom bez zmian, bo powód otwarcia jest inny — brak egzekwowanego `ask` w Cursorze. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6), 2026-09-03 (GUARD_PO_SCIEZCE) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |

| S1 | Bramka dokumentacyjna przepuści coś potrzebnego — plik nieśledzony, o którym architektura milczy, a bez którego nie da się powtórzyć pomiaru (plan SPRZATANIE_ARTEFAKTOW, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kasowanie wyłącznie po „tak" na grupę z pełną listą pozycji; pliki śledzone nigdy nie są kandydatami; niepewność rozstrzygana na korzyść ochrony; „zostaw na zawsze" dopisuje marker, więc pytanie nie wraca. Pierwszy pomiar (E1, własne repo): 8 grup, 9 pozycji chronionych z powodem — w tym `benchmark`-owy odpowiednik, czyli `.claude/relai/templates` z powodem `opisane` i wskazaniem `README.md:150`. **Bramka przepuściła dorobek własnego etapu**: dwa nowe, niezacommitowane pliki produktu stanęły w grupach jako kandydaci (L-0078) — ochroną jest tam `git add`, nie marker, ale to jest realne trafienie tego ryzyka. Niezmierzone na cudzym projekcie: raport na PolyFlow zostaje jako bramka manualna planu. E2: drugi przebieg bez ani jednego fałszywego kandydata — 1 grupa (katalog etapu zamkniętego), 5 pozycji chronionych, w tym `templates` powodem `opisane`. **E3: trafienie powtórzyło się na innym pliku** — świeżo wygenerowany `PROMPT_ETAP_4.md`, jeszcze nieprzyjęty do indeksu, stanął w raporcie jako kandydat (grupa „repo: katalog docs") i zniknął po `git add`. Wzorzec jest więc stały, nie jednorazowy: **granicą ochrony dorobku sesji jest indeks gita**, a nie marker — i to zdanie należy mówić wprost przy sprzątaniu w trakcie etapu (L-0078). **E4: pierwsze trafienie na cudzym projekcie i najpoważniejsze z dotychczasowych.** Powód `opisane` chronił w PolyFlow **dwa** pliki benchmarku z ośmiu, a sześć dalszych — w tym `formatowanie/probki.json` i `probki_lista.json` z realnymi wypowiedziami właściciela — stanęło w grupie kandydatów. Ochrona przez opis obejmuje wyłącznie to, co ktoś opisał **w dokumencie projektu**; komentarz nad wzorcem w `.gitignore` tym dokumentem nie jest, choć czyta się identycznie. Bramka zadziałała (nic nie zniknęło bez „tak"), ale sama nie wystarczy — potrzebny był marker, i to siedem markerów zamiast zakładanych dwóch. **Ryzyko zostaje otwarte**: mechanizm jest zależny od tego, czy człowiek opisał materiał tam, gdzie narzędzie patrzy. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |
| S2 | Narzędzie skasuje coś poza dozwolonymi korzeniami — zła ścieżka względna, dowiązanie prowadzące na zewnątrz, junction do innego dysku (plan SPRZATANIE_ARTEFAKTOW, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Asercje w `kasuj`: każda ścieżka po `realpath` musi leżeć **pod** katalogiem projektu albo pod `os.tmpdir()`, nie być którymkolwiek korzeniem ani `.git` projektu; dowiązanie usuwane jako dowiązanie, bez wchodzenia do celu. Pierwszy pomiar (E1) z dowodami negatywnymi: ścieżka w katalogu domowym i `.git` projektu → dwie odmowy, zero skasowanych, `.git` **31 plików przed i 31 po**; junction wskazujący poza kandydata → dowiązanie zniknęło, cel **2 pliki przed i 2 po**. Klon repozytorium z obiektami tylko do odczytu skasowany bez ani jednego niepowodzenia (14 923 442 B → 0 B). E2: kasowanie 141,2 MB w katalogu roboczym etapu zamkniętego, zero niepowodzeń, `%TEMP%` i `work/` puste po operacji. E3: trzeci przebieg, katalog roboczy etapu i pusty katalog tematu, zero niepowodzeń; **ochrona `etap trwa` pokazana w obie strony w jednym dniu** — ten sam katalog był chroniony przy statusie `W TOKU` i został kandydatem dopiero po `ZREALIZOWANY`. **E4: czwarty przebieg, pierwszy na cudzym projekcie** — dwie pozycje (katalog etapu zamkniętego 90 MB i katalog w `%TEMP%` 35 MB), **125,0 → 0,0 MB**, zero niepowodzeń, a pomiar ponowny dał zero kandydatów. Asercje korzeni wytrzymały też przypadek, którego nikt nie planował: ścieżka **dysko-relatywna ze znakiem CR w środku** (rozjechane escapowanie w `node -e`) rozwinęła się względem katalogu projektu, `lstat` jej nie znalazł i **żadna operacja nie wykonała się na dysku**. Ujawniło to jednak osobną wadę raportowania: taka pozycja jest meldowana jako `skasowane`, nie jako `nieobecne` (`work-artifacts.js:843`) — wołający nie ma po czym poznać, że jego lista jest zepsuta. Wada zapisana w `STATE.md`, poza zakresem planu. Niezmierzone bez zmian: junction na inny dysk i ścieżka dłuższa niż limit Windows. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |

| M1 | Skill wspólny dla dwóch narzędzi pokaże listę tego drugiego — sesja w Cursorze zobaczy modele Anthropic (plan REKOMENDACJA_MODELU, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | O liście rozstrzyga **nazwa pliku**, którą podaje adapter wołający rdzeń (Aneks A) — treść skilla jest jedna i nazwy narzędzia nie zna; która lista obowiązuje, mówi hook startu jednym zdaniem (zasada 8). Pierwszy pomiar (E1) na dwóch projektach kontrolnych w jednym przebiegu: projekt obsłużony hookiem Claude Code ma w `.claude/relai/` **wyłącznie** `MODELE-claude-code.md`, projekt Cursora **wyłącznie** `MODELE-cursor.md`; treść obu kopii zgodna sumą ze źródłem adaptera. Otwarte, bo zmierzone na hookach uruchomionych z repozytorium, a **nie w żywej sesji Cursora** — reguły 1.7.0 i 1.8.0 tego adaptera też nigdy nie były w nim uruchomione. Zmierzone: 2026-09-03 (E1) |
| M2 | Kopia listy w projekcie zostaje nadpisana przy starcie sesji i zjada odświeżenie zrobione komendą (plan REKOMENDACJA_MODELU, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | `provisionModelList()` kopiuje **tylko wtedy, gdy pliku nie ma** — jedyna różnica wobec `provisionTemplates()`, które nadpisuje przy każdym starcie. Dowód negatywny (E1): plik zmieniony ręcznie w projekcie kontrolnym przeżył ponowne uruchomienie hooka, suma po normalizacji CRLF → LF `ecc6d18d9f6ccf65` przed i po; kontrola pozytywna w tym samym przebiegu — skasowany plik powstał ponownie z sumą źródła. Otwarte do czasu, aż istnieje druga droga zapisu do tego pliku: `/relai-models` z E2 pisze do tej samej kopii, a `/relai-update` do katalogu obok. **E2: druga droga zapisu istnieje i przeżywa start sesji.** Po odświeżeniu w projekcie kontrolnym Claude Code suma listy `f82ee8da0dbe7997` przed ponownym uruchomieniem hooka i po nim, a hook zameldował nową datę (`z dnia 2026-09-04`) zamiast starej; w projekcie Cursora to samo z sumą `65eca9cbea99f0b3`. Otwarte już tylko z powodu `/relai-update`, którego ta droga jeszcze nie dotknęła. Zmierzone: 2026-09-03 (E1), 2026-09-04 (E2) |
| M3 | Strona dokumentacji zmienia układ i odczyt z sieci zwraca śmieci albo nic (plan REKOMENDACJA_MODELU, ryzyko 3) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Odświeżenie zawsze kończy się pokazaniem różnicy i pytaniem; niepowodzenie zostawia starą listę **z jej datą**, nigdy pustą. Pomiar E2 na odczycie adresu nieistniejącego (`HTTP 404 Not Found`): lista w projekcie kontrolnym została z sumą `1f67fe1bc954ecdc` i `list-date: 2026-09-03`, czyli dokładnie taka jak przed przebiegiem — dowód treścią pliku, nie komunikatem. Niezmierzone: strona odpowiadająca **200 ze zmienionym układem** (odczyt „udany", treść bez nazw) — to jest realny kształt tego ryzyka i czeka na pierwszy taki przypadek. Zmierzone: 2026-09-04 (E2) |
| M4 | Sieć wchodzi do mechanizmu, który dotąd działał w całości bez internetu (plan REKOMENDACJA_MODELU, ryzyko 4) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Sieć wyłącznie w komendzie wywołanej wprost; hook startu zostaje lokalny i cichy. Zgoda pada **każdorazowo** (bramka rozstrzygnięta 2026-09-04), więc nie ma stanu, w którym mechanizm łączy się bez pytania: `docs/USTAWIENIA.md` po dwóch wywołaniach pod rząd miał tę samą sumę `65315611192c87dd`, a komenda nie ma ani jednej ścieżki zapisu zgody. Otwarte, bo dowód „hook startu z odciętą siecią zachowuje się identycznie" należy do E3, a zachowanie samej komendy zmierzyła sesja etapu, nie świeża sesja CLI. Zmierzone: 2026-09-04 (E2) |
| M5 | Nazwy modeli zmieniają się szybciej niż wydania RelAI (plan REKOMENDACJA_MODELU, ryzyko 6) | **Średni** (2026-09-04) | **OTWARTE** | Lista mieszka w adapterze **i** w projekcie; `/relai-models` aktualizuje kopię projektu bez wydawania nowej wersji pluginu. Pierwsze realne odświeżenie (E2) potwierdziło, że ryzyko nie jest teoretyczne: strona aliasów wymienia dziś dziesięć pełnych ID (`claude-opus-5` … `claude-fable-5`), a lista Cursora ~45 pozycji od pięciu dostawców — wobec czterech i trzech pozycji w listach RelAI. Otwarte, bo przypomnienie o starej liście powstaje dopiero w E3; do tego czasu nic nie mówi użytkownikowi, że lista się zestarzała. Zmierzone: 2026-09-04 (E2) |

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — 7 z 32 pozycji
  „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą). Poszerzyć listę w rdzeniu
  czy przepisać adnotacje w cudzym projekcie? · 2026-09-01 ·
  [wpis 2026-09-01 — E6: wydanie 1.7.0](#2026-09-01--e6-wydanie-170-pomiar-po-restarcie-i-pierwsza-rotacja-z-przepięciem-linków)

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)

- **Numer wydania planu `REKOMENDACJA_MODELU`: 1.9.0 czy 1.8.2** — czeka przed E4 *(pozycja zawężona
  dwa razy: 2026-09-03 odpadło czekanie na akceptację planu, 2026-09-04 **rozstrzygnięte** obie
  bramki wejściowe E2 — pięć adresów źródeł i zgoda na sieć każdorazowa)* · 2026-09-03 ·
  [wpis 2026-09-03 — Wydanie 1.8.1 potwierdzone](#2026-09-03--wydanie-181-potwierdzone-po-restarcie-plan-rekomendacja_modelu-do-akceptacji)

- **Czy pomiar wykonany przez sesję etapu domyka weryfikację E2** — `claude -p` zwrócił
  `Failed to authenticate: OAuth session expired and could not be refreshed`, więc procedurę komendy
  `/relai-models` wykonała sesja etapu, nie świeża sesja CLI. Skutki na plikach zmierzone; brakuje
  zachowania sesji, która zna wyłącznie treść komendy. Zalogować `claude /login`, dołożyć klucz do
  `.env`, czy uznać pomiar za wystarczający? · 2026-09-04 ·
  [wpis 2026-09-04 — E2 planu REKOMENDACJA_MODELU](#2026-09-04--e2-planu-rekomendacja_modelu-listę-modeli-da-się-odświeżyć-komendą)

- **Ryzyko R2 zamknięte na nieaktualnej przesłance** — 2026-09-03 zamknięto je zdaniem „nie zostanie
  zmierzone nigdy", opartym na wyczerpanym limicie `claude -p` (L-0032). W E1 tego samego dnia
  `claude -p` **zadziałał** i poprowadził pomiar świeżych sesji (L-0084). Otworzyć R2 ponownie,
  przepisać jego treść czy zostawić zamknięte z adnotacją? · 2026-09-03 ·
  [wpis 2026-09-03 — E1 planu REKOMENDACJA_MODELU](#2026-09-03--e1-planu-rekomendacja_modelu-pytanie-o-model-pokazuje-nazwy-nie-klasy)

- **Blokada zapisu do cudzego projektu niezmierzona w żywej sesji** — instrument dowiódł werdyktu
  `deny`, ale „plik nie powstał" pokaże dopiero sesja z zainstalowaną wersją 1.8.1 i katalogiem
  roboczym poza projektem docelowym; wymaga wydania i restartu aplikacji · 2026-09-03 ·
  [wpis 2026-09-03 — Odnoga GUARD_PO_SCIEZCE](#2026-09-03--odnoga-guard_po_sciezce-guardraile-rozpoznają-projekt-po-ścieżce-pliku-181)

- **Ikony README renderują się w 17–23 px zamiast 24 px, więc kreska schodzi poniżej piksela** —
  podbić grubość z 2.6 na 3.2 (zmiana proporcji rysunku) czy scalić kolumnę ikony z kolumną komendy
  w README (bez ruszania grafiki)? · 2026-09-01 ·
  [wpis 2026-09-01 — Ikony komend czytelne na obu motywach](#2026-09-01--ikony-komend-czytelne-na-obu-motywach-githuba)

## Wpisy

> Wpisy z okresu 2026-08-07 … 2026-08-09 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md)
> — przeniesione 2026-08-17, suma kontrolna `c17de1981ceedb1c`.

> Wpisy z okresu 2026-08-10 … 2026-08-10 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md)
> — przeniesione 2026-08-20, suma kontrolna `b7307c8678b9d6b9`.

> Wpisy z okresu 2026-08-10 … 2026-08-12 (4 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md)
> — przeniesione 2026-08-21, suma kontrolna `fa3e9fe384146138`.

> Wpisy z okresu 2026-08-12 … 2026-08-12 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md)
> — przeniesione 2026-09-01, suma kontrolna `b4601365eee25163`.

> Wpisy z okresu 2026-08-12 … 2026-08-17 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md)
> — przeniesione 2026-09-01, suma kontrolna `1690be9b08748504`.

> Wpisy z okresu 2026-08-17 … 2026-08-21 (18 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md](archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md)
> — przeniesione 2026-09-01, suma kontrolna `74a4d2a5fb9a3390`.

### 2026-09-01 — Zgłoszenie z PolyFlow: rotacja i progi nie bronią się same; plan HIGIENA_DOKUMENTOW

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Przyjęte zgłoszenie z sesji roboczej PolyFlow (2026-09-01)** — sześć defektów mechanizmu rotacji
  i progów, opisanych liczbami z pomiaru na tamtym projekcie: pozycja „Czeka na człowieka" bez terminu
  przydatności, niema blokada rotacji, nietykalność liczona w sztukach przy progu w kilobajtach, sekcja
  „Ustawienia wycofane" nieodchudzająca niczego, rotacja ryzyk bezsilna wobec statusów innych niż
  `ZAMKNIĘTE`, progi bez adresu egzekwowania.
- **Wywiad w czterech rundach** (12 pytań) — rozstrzygnięte: forma pracy (nowy plan, odnoga wchłonięta),
  właściciel sygnału progów (raport startu bierze progi dokumentów, limit „Zasad aktywnych" zostaje przy
  kroku 1 rytuału zamknięcia), sposób odchudzenia ryzyk (kompresja komórki „Mitygacja", wiersz zostaje
  widoczny), kryterium nietykalności (zostaje w sztukach, próg liczony ponad nietykalnymi), źródło daty
  przeglądu (domyślny wiek N dni z ustawień), tryb pytania (wymuszone `AskUserQuestion` partiami po cztery,
  aż do wyczerpania listy) i znaczenie odpowiedzi „zostawiam" (odroczenie o kolejne N dni z licznikiem).
- **`docs/plany/HIGIENA_DOKUMENTOW/PLAN.html`** — plan główny w HTML wg `SPEC_PLAN_HTML.md`: dziesięć
  sekcji, cztery warianty z jawnymi powodami odrzucenia, diagram przepływu startu sesji, wykres
  pracochłonności, sześć ryzyk, siedem przypadków brzegowych rozstrzygniętych, trzy sprawy dla człowieka
  oraz symulator na sześciu wejściach liczący zakres rotacji przed poprawką i po niej.
- **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`** — sześć etapów, wszystkie `OCZEKUJE`, status planu
  `DO AKCEPTACJI`, model wykonawczy Opus (D-85).
- **`CLAUDE.md`** — wiersz planu w tabeli „Stan prac" i linia aktywnego planu (dotąd `brak`).
- **`docs/STATE.md`** — nowa pozycja w „Nad czym pracujemy teraz"; odnoga `BLOKADA_ROTACJI` przestaje być
  wątkiem samodzielnym i wchodzi jako E1 tego planu.

**Zweryfikowane — jak dokładnie:**

- **Zgłoszenie sprawdzone na tym repozytorium, nie przyjęte na słowo** `FAKT`: `docs/LEKCJE.md` ma
  **52 260 B przy progu 50 KB** i 38 lekcji przy progu 40 — próg objętościowy przekroczony, rotacja lekcji
  nie odpaliła nigdy. To potwierdza punkt 6 zgłoszenia w projekcie, w którym mechanizm powstał. Pozostałe
  pomiary warstwy startowej: `DZIENNIK.md` 140 068 B, `STATE.md` 11 425 B, `USTAWIENIA.md` 3 039 B,
  `CLAUDE.md` 3 920 B, „Zasady aktywne" 15 pozycji przy limicie 15.
- **Zakres odnogi `BLOKADA_ROTACJI` przeczytany przed wchłonięciem** — jej sekcja „Poza zakresem" stawiała
  progi rotacji i rotację ryzyk poza zasięgiem („progi są skalibrowane, problem nie jest w liczbach";
  „rotacja ryzyk zadziałała poprawnie w PolyFlow"). Pomiar z PolyFlow pokazał, że oba wyłączenia były
  przedwczesne — stąd plan zamiast rozszerzenia karty odnogi.
- **Builder planu HTML** — `node .claude/relai/templates/HTML_PLAN/zbuduj.js` zakończony kodem **0**:
  „Osadzono 6 regul @font-face. Plik ma 239 KB", **zero** niewypełnionych znaczników.
- **Plan sprawdzony w przeglądarce, nie tylko zbudowany** `FAKT`: symulator na wartościach startowych
  (stan PolyFlow) daje rotację dziś **1 wpis / ok. 7 KB**, po poprawce **117 wpisów / 750 KB schodzi**,
  żywy plik **113 KB** — zgodne z pomiarem z sesji PolyFlow (117 wpisów, 749,6 KB, 113,3 KB). Przypadek
  brzegowy „nietykalne przekraczają próg" wykryty poprawnie po podniesieniu wagi nietykalnych do 200 KB.
  Zwijanie bloków: `aria-expanded` przechodzi `false → true → false`, klasa `otw` dokłada się i schodzi.
  Poziome przewijanie: **0 px** przy 1200×900 i przy 375×812; jedyne elementy poza kadrem to linki
  w pasku nawigacji, który ma własne `overflow-x:auto`. Żądań sieciowych brak — dwa trafienia `http://`
  to przestrzeń nazw SVG w `createElementNS`, nie zasób.

**Świadomie odłożone:**

- **Nie ruszam sekcji „Czeka na człowieka" tego repozytorium**, mimo że 9 z 10 jej pozycji byłoby po
  zmianie przeterminowanych. Reguła wieku powstaje w E3; stosowanie jej przed napisaniem byłoby
  rozstrzyganiem spraw człowieka bez mechanizmu, który to rozstrzyganie definiuje.
- **Nie rotuję `LEKCJE.md`**, choć jest 2,3 KB nad progiem. Rotacja należy do rytuału zamknięcia sesji,
  a nie do tury, w której powstaje plan o rotacji.

**Do zrobienia przez człowieka:**

- **Akceptacja planu HIGIENA_DOKUMENTOW** — do czasu zgody plan jest edytowalny; po akceptacji zmiany
  wyłącznie datowanymi aneksami (D-33).
- **Wartość `N` — po ilu dniach sprawa człowieka jest przeterminowana** (propozycja: 90 dni) oraz
  rozstrzygnięcie, czy przegląd spraw ma działać w projekcie z wyłączoną rotacją. Blokuje start E3.

### 2026-09-01 — Plan HIGIENA_DOKUMENTOW zaakceptowany z Aneksem A, E1 gotowy do startu

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Plan zaakceptowany** — status w `STATUS.md` i w `PLAN.html`: `ZAAKCEPTOWANY 2026-09-01 (Aneks A)`.
  Sekcje 1–9 planu są od teraz zamrożone; zmiany wyłącznie datowanymi aneksami (D-33).
- **Aneks A (2026-09-01)** dopisany do sekcji 10 `PLAN.html` — obie sprawy z sekcji 9, które blokowały
  start E3, rozstrzygnięte przez człowieka wraz z akceptacją:
  **`N = 30 dni`** (propozycja planu brzmiała 90 dni — wybór jest trzykrotnie ostrzejszy i wiążący)
  oraz **przegląd spraw działa także przy wyłączonej rotacji dokumentów**, co przesądza, że wyłącznik
  przeglądu jest osobny od wiersza `Rotacja dokumentów`.
- **`PROMPT_ETAP_1.md`** wygenerowany wg `SPEC_PROMPT_ETAPU.md` — dziewięć elementów w stałej
  kolejności, dziewięć pozycji do przeczytania, osiem punktów zakresu, dziesięć punktów weryfikacji,
  wszystkie 15 „Zasad aktywnych" przepisanych w całości. Zakres pokrywa cztery punkty wchłoniętej
  odnogi `BLOKADA_ROTACJI` plus przeliczenie linków w tym repozytorium i przeniesienie zmiany do obu
  adapterów.
- **Warunek startu E1 zapisany w prompcie:** etap wymaga dziennika PolyFlow sprzed rotacji
  (`--add-dir` na katalog projektu albo kopia z `git show HEAD~1:docs/DZIENNIK.md`). Bez tego materiału
  pierwszy punkt weryfikacji jest niewykonalny — zapisane wprost, zamiast udawać, że punkt nie istnieje.
- **`STATUS.md`**: E1 → `GOTOWY DO STARTU` z linkiem do promptu, sekcja „Bramki manualne" z dwiema
  pozycjami rozstrzygniętymi tego samego dnia, dwie linie w dzienniku wdrożenia.
- **`CLAUDE.md`** i **`docs/STATE.md`** — status planu i wartości z Aneksu A; adnotacje rozstrzygnięcia
  przy obu pozycjach sekcji „Czeka na człowieka".

**Zweryfikowane — jak dokładnie:**

- **Plan po dopisaniu aneksu nadal się buduje i renderuje** — sekcja 10 zawiera Aneks A, znaczników
  `{{…}}` w pliku **zero**, status w pasku i w metce zgodny (`ZAAKCEPTOWANY`), fraza `DO AKCEPTACJI`
  nie występuje już nigdzie w pliku (`grep -c` → 0).
- **Kolumna `Prompt` wskazuje istniejący plik** — `PROMPT_ETAP_1.md` jest w folderze planu, więc
  siatka bezpieczeństwa D-34 nie ma czego zgłaszać. Pozostałe etapy mają `—`, zgodnie z lazy-generacją.
- **Materiał pomiarowy dla E1 istnieje** `FAKT`: `C:\Users\Lukasz\Desktop\PolyFlow\docs\DZIENNIK.md`
  waży dziś 123 628 B (po rotacji z sesji porządkowej), a stan sprzed rotacji jest dostępny w historii
  gita tamtego repozytorium. Sprawdzone odczytem katalogu, nie założeniem.
- **Nie weryfikowano** zachowania mechanizmu po zmianie reguły — to jest zakres E1, nie tej tury.

**Świadomie odłożone:**

- **Wiersza `Przegląd spraw człowieka` w `docs/USTAWIENIA.md` nie zakładam.** Wartość jest
  rozstrzygnięta, ale ustawienie bez mechanizmu, który je czyta, jest martwym wpisem — powstaje w E3
  razem z implementacją. Zapis decyzji żyje w Aneksie A i w prompcie E1 jako granica zakresu.
- **Sekcji „Czeka na człowieka" tego repozytorium nadal nie przeglądam wiekiem.** Przy `N = 30 dni`
  przeterminowanych byłoby 9 z 10 pozycji — ale reguła powstaje w E3.

**Do zrobienia przez człowieka:**

- **Uruchomić E1 w świeżej sesji Opusa**, z dostępem do dziennika PolyFlow sprzed rotacji.

### 2026-09-01 — Zamknięcie sesji: Aneks B, rotacja „Lekcji zwiniętych", przegląd ryzyk

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Rotacja sekcji „Lekcje zwinięte" do archiwum** — `L-0025 … L-0054`, **30 lekcji**, do
  [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md),
  suma kontrolna `d7c16fc38575773e`. Żywy `docs/LEKCJE.md`: **52 260 → 16 906 B** (próg 50 KB).
  Operacja wykonana **za zgodą** — to krok kompresji z `SPEC_LEKCJE.md`, a nie rotacja, więc nie
  wolno jej robić po cichu.
- **Aneks B do planu HIGIENA_DOKUMENTOW** — zakres E4 rozszerzony o **progi sekcji wewnątrz
  dokumentu** („Lekcje zwinięte" 30 KB, „Stan otwartych ryzyk" 12 KB) oraz o **jawny katalog progów**,
  jakie RelAI zna. Powód wyszedł z tej samej sesji: plan w brzmieniu z dnia akceptacji pilnował progów
  dokumentów, więc E4 nie złapałby żadnego z tych dwóch.
- **Ryzyko R5 przepisane** — z „do obserwacji po 1.0.0" na stan faktyczny: mechanizm jest kompletny,
  ale nie broni się sam; dowody z dwóch projektów, wskazanie planu jako odpowiedzi. Komórka
  „Mitygacja" skrócona do stanu bieżącego, zgodnie z regułą z 1.6.0.
- **Plan i STATUS** doprowadzone do zgodności: status `ZAAKCEPTOWANY 2026-09-01 (Aneksy A, B)`
  w obu plikach, uwaga przy E4, dwie linie w dzienniku wdrożenia.

**Zweryfikowane — jak dokładnie:**

- **Dowód negatywny dwufazowości** (zasada 3, L-0007) `FAKT`: przebieg zatrzymany po fazie 1 — plik
  archiwum powstał, a suma kontrolna **całego żywego** `LEKCJE.md` przed i po fazie 1 jest ta sama
  (`e42f6ccac40d4d93`), rozmiar niezmieniony (52 260 B). Przycięcie nastąpiło dopiero po
  potwierdzeniu zgodności sum.
- **Sumy fragmentu zgodne w obie strony** `FAKT`: suma fragmentu w żywym pliku `d7c16fc38575773e`
  = suma treści odczytanej **z dysku** spod separatora `---` w pliku archiwum. Fragment: 35 564 B,
  30 nagłówków `### L-`.
- **Dowód obecności, nie tylko braku strat** (zasada 14) `FAKT`: w archiwum jest **30** lekcji,
  w żywym pliku zostało **8** pełnych (L-0055…L-0062) — razem 38, czyli tyle, ile było. Sekcja
  „Zasady aktywne" nietknięta: **15 pozycji** przed i po, przy twardym limicie 15. Nagłówek sekcji
  „Lekcje zwinięte" został na miejscu z linią-odsyłaczem pod spodem; w pliku są teraz **dwa**
  odsyłacze (do `L-0001…L-0024` i do `L-0025…L-0054`).
- **Progi na koniec sesji** `FAKT`: `LEKCJE.md` **16 906 B** przy progu 51 200 B; `DZIENNIK.md`
  **152 819 B** przy progu 153 600 B po dopisaniu tego wpisu — **781 B poniżej progu**, czyli nadal
  cisza; sekcja „Stan otwartych ryzyk" 3 846 B / 12 288 B; `STATE.md` 172 linie / 300 i 12 264 B przy
  progu cząstkowym 12 288 B (24 B zapasu); `CLAUDE.md` 4 180 B / 10 KB.
- **Plan po dopisaniu Aneksu B**: znaczników `{{…}}` w `PLAN.html` **zero**, status w metce
  `ZAAKCEPTOWANY 2026-09-01 (Aneksy A, B)`.
- **Nie weryfikowano** zachowania mechanizmów po zmianach z planu — żaden etap nie był wykonywany.

**Świadomie odłożone:**

- **Rotacji dziennika nie uruchamiam w tej turze.** Przed dopisaniem tego wpisu plik miał 149 114 B,
  po nim ma 152 819 B — w obu momentach **poniżej** progu 153 600 B, więc rotacja poprawnie milczy.
  Zapas wynosi jednak **781 B**: pierwszy wpis następnej sesji przekroczy próg i rotacja odpali przy
  jej zamknięciu. Zakres będzie wtedy zależał od reguły linku, którą zmienia E1 — czyli od etapu,
  który jest gotowy do startu.
- **Sekcji „Czeka na człowieka" nadal nie przeglądam wiekiem** — przy `N = 30 dni` przeterminowanych
  byłoby 9 z 10 pozycji, ale reguła powstaje w E3.

**Do zrobienia przez człowieka:**

- **Uruchomić E1 w świeżej sesji Opusa**, z dostępem do dziennika PolyFlow sprzed rotacji.

### 2026-09-01 — E1: rotacja rusza — link do najnowszego wystąpienia, przepięcie zamiast blokady, kierunek dziennika z dat

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_DZIENNIK.md`** — pozycja sekcji „Czeka na człowieka" linkuje do
  **najnowszego** wystąpienia sprawy zamiast do najstarszego; powód i liczby wypisane w treści,
  format pozycji po przepięciu na archiwum podany dosłownie. Sekcja „Rotacja": wpis linkowany
  **przestał być nietykalny**, a kolejność wpisów w pliku jest własnością projektu — mechanizmy
  ustalają ją z dat w nagłówkach. Przykład na końcu pliku przepisany tak, żeby pokazywał obie
  reguły naraz (sprawa wracająca w nowszym wpisie i sprawa, której wpis wjechał do archiwum).
- **`core/templates/SPEC_ARCHIWUM.md`** — nietykalność wpisu linkowanego zdjęta, w jej miejsce
  **przepięcie linku** jako krok 7 fazy 2 (przed zapisem żywego pliku), z liczeniem pozycji
  z martwym linkiem. Trzy nowe przypadki brzegowe: wpis linkowany wjeżdża do archiwum, kilka
  pozycji na jednym wpisie, link już przepięty. Nagłówek sekcji o blokadzie zmieniony, bo mówił
  o mechanizmie, którego już nie ma.
- **`core/process/session-signals.js`** — `ostatniWpis` ustala kierunek dziennika z **dat**
  w nagłówkach zamiast brać ostatni nagłówek w pliku; brak dat → zachowanie dotychczasowe i cisza.
  Funkcja wyeksportowana, żeby dała się sprawdzić testem.
- **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md` (reguła linku, zniesienie
  blokady, przepięcie w fazie 2, „najstarszy" liczony z dat) oraz
  `adapters/cursor/rules/relai-core.mdc` (ta sama treść po angielsku).
- **`docs/DZIENNIK.md`** — przeliczone linki sekcji „Czeka na człowieka": sześć z dziewięciu
  pozycji otwartych wskazuje teraz nowszy wpis. Dwie pozycje rozstrzygnięte 2026-09-01 usunięte
  z sekcji zgodnie ze specyfikacją (decyzja użytkownika w tej sesji) — sekcja ma 9 pozycji,
  wszystkie otwarte.
- **`docs/fixy/BLOKADA_ROTACJI/ODNOGA.md`** — status `PRZENIESIONA 2026-09-01 → wchłonięta przez
  E1`, sekcja „Wynik" wypełniona. Karta zostaje (D-18).
- **Odnoga `REJESTR_ARTEFAKTOW`** — sygnał odchylenia z tego etapu: hook `profile-rules` żąda
  `docs/ARTEFAKTY.md` przy każdej zmianie artefaktu. Karta i prompt świeżej sesji w
  `docs/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/`, linia w sekcji „Odnogi" `STATUS.md`.

**Zweryfikowane — jak dokładnie:**

- **Pomiar obiema regułami w jednym przebiegu, na realnym materiale** (instrument
  `zakres-rotacji.js`, poza repozytorium; obie wersje reguły zaimplementowane wiernie).
  Dziennik PolyFlow sprzed rotacji z 2026-09-01 (`6a330c1^`, 127 wpisów, 880 437 B): zakres
  rotacji **starą regułą 0 wpisów**, **nową 117** `FAKT`. Drugi przekrój, migracja z 2026-08-21
  (`396e243`, 92 wpisy): **6** wobec **82** `FAKT`. Próg odbioru z karty odnogi („co najmniej
  50 wpisów") przechodzi na obu. Liczba 117 zgadza się z tym, co realna rotacja w PolyFlow
  osiągnęła po ręcznym rozbrojeniu blokerów — niezależne potwierdzenie.
- **Kontrola instrumentu** (zasada 5): przy pierwszym przebiegu 29 z 46 pozycji nie znalazło pary
  treściowej, a na dzienniku RelAI **żaden** z 9 linków nie trafił w żaden wpis — oba wyniki
  okazały się defektem instrumentu, nie materiału (klucz sprawy wymagał wytłuszczenia; tekst linku
  w RelAI ma przedrostek „wpis"). Po poprawkach: 6 z 46 bez pary w PolyFlow, 0 nietrafionych
  linków w RelAI. Liczby PolyFlow po poprawce instrumentu bez zmian (0 → 117).
- **`ostatniWpis` — osiem punktów, jeden przebieg** (`test-ostatni-wpis.js`, kod wyjścia 0):
  dziennik rosnący w dół, malejący, oba warianty z CRLF, plik z wpisem dopisanym na końcu wbrew
  kierunkowi, nagłówki bez dat (zachowanie dotychczasowe, bez błędu), brak wpisów (`null`) oraz
  **kontrola negatywna** — stara implementacja na dzienniku malejącym bierze wpis najstarszy
  (`### 2026-08-16 — Najstarszy`), czyli test naprawdę mierzy zmianę.
- **Na realnych plikach:** PolyFlow sprzed rotacji — stara implementacja brała wpis z 2026-08-26,
  nowa bierze 2026-09-01; przekrój 2026-08-21 — stara brała 2026-08-10, nowa 2026-08-21. Dziennik
  RelAI: obie wersje zwracają ten sam wpis, więc zmiana nie ruszyła projektu, który był poprawny.
- **Dowód negatywny dla przepięcia linku** (zasada 3): próba rotacji na kopii dziennika RelAI
  zatrzymana po fazie 1 (`proba-rotacji.js`, przebieg A) — plik archiwum powstał, sumy fragmentu
  w żywym pliku i w archiwum zgodne (`c0eb3e45a56ec88b`), a **żywy dziennik jest bajt w bajt ten
  sam** (`be82dd80911fa366` przed i po). Sekcja „Czeka na człowieka" **razem z linkami** ma
  identyczną sumę `7778abe251ee614d` — link nie został przepięty przed potwierdzeniem sumy.
- **Dowód obecności, nie tylko braku strat** (zasada 14): pełny przebieg na kopii (przebieg B)
  przeniósł 17 wpisów, przepiął **6 linków** na plik archiwum, a walidator kotwic zgłosił
  **0 pozycji z martwym linkiem** — sprawdzając kotwice także **w pliku archiwum**, nie tylko
  w żywym dzienniku. Treść pozycji bez linków identyczna (`eca3a8f0064f651f`).
- **Sekcja „Czeka na człowieka" w repozytorium:** 11 pozycji przed, 9 po (usunięte dwie
  rozstrzygnięte), **0 martwych linków** przed i po; treść pozycji bez linków identyczna
  (`eca3a8f0064f651f` przed i po przeliczeniu linków).
- **Obie specyfikacje mówią to samo** — przeczytane w jednym przebiegu tej sesji; przy okazji
  poprawiono zdanie w `SPEC_DZIENNIK.md`, które opisywało starą nietykalność w czasie
  teraźniejszym.
- **Zmiana weszła do obu adapterów:** `git grep -c "1.7.0"` daje trafienia w
  `core/templates/SPEC_DZIENNIK.md` (2), `core/templates/SPEC_ARCHIWUM.md` (3),
  `adapters/claude-code/skills/relai-core/SKILL.md` (3), `adapters/cursor/rules/relai-core.mdc` (2).
- **`node core/tools/validate-adapters.js`** — kod wyjścia **0**.
- **`git status --short`** — wyłącznie pliki z zakresu etapu plus nieśledzony
  `docs/AUDYT_2026-08-22.html`, który leżał tam przed tą sesją. Instrumenty pomiarowe i kopie prób
  stoją poza repozytorium.
- **Nie sprawdzono:** zachowania rotacji w świeżej sesji na realnym projekcie — przepięcie linku
  jest dziś regułą w dokumentach i przetestowanym przebiegiem na kopii, ale żadna sesja nie
  wykonała go w rytuale zamknięcia. Nie sprawdzono też adaptera Cursora w aplikacji po tej zmianie.

**Świadomie odłożone:**

- **Punkt weryfikacji z karty odnogi „pozycja `ryzyka` maleje po poprawce" — nie potwierdził się
  jako sformułowany.** Poprawka sprawia, że pomiar bierze **właściwy** wpis, a nie mniejszy: na
  przekroju 2026-08-21 właściwy wpis waży 9062 B wobec 6745 B dotąd branych. Kierunek zmiany
  zależy od długości wpisów projektu, nie od poprawki. Zapisane jako **L-0063**.
- **Ponowne przeliczenie linków w PolyFlow** — poza zakresem etapu (prompt dopuszczał tam wyłącznie
  odczyt materiału pomiarowego). Wchodzi do E6 razem z pomiarem na realnych projektach.
- **Lista blokerów w komunikacie rotacji i próg liczony ponad nietykalnymi** — to E2. Wymuszone
  pytanie o sprawy przeterminowane — E3. Podbicie wersji do 1.7.0 — E6. W dokumentach nie ma
  o nich ani jednej obietnicy.
- **Rozjazd kopii specyfikacji w `.claude/relai/templates/`** — hook odświeża ją z cache'u pluginu
  (1.6.1), więc do wydania 1.7.0 lokalna kopia niesie starą regułę linku. To znany skutek
  sekwencji wydania (P-005), nie usterka tego etapu.

**Do zrobienia przez człowieka:**

- **Odnoga [REJESTR_ARTEFAKTOW](archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
  czeka na świeżą sesję Opusa; prompt jest gotowy.
- **Pozycja „Decyzja o formalnym zamrożeniu planu ROZWOJ_PO_WYDANIU" wygląda na rozstrzygniętą** —
  `STATUS.md` tamtego planu niesie `ZAMROŻONY 2026-08-21`. Zamknięcie pozycji jest decyzją
  człowieka, więc zostaje otwarta; jedno „tak" zdejmuje ją z sekcji.

### 2026-09-01 — E2: blokada mówi, a próg liczy się ponad nietykalnymi

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_ARCHIWUM.md`, nowa sekcja „Próg liczony ponad nietykalnymi"** — dokument
  ma trzy wagi podawane zawsze razem z progiem: **waga całkowita = część rotowalna + dolna granica
  osiągalna**. Wyzwalacz zostaje na wadze całkowitej (cisza poniżej progu nienaruszalna), a **cel
  przenosi się na część rotowalną**: bierzesz najstarsze pozycje, aż **ona** zejdzie poniżej 60%
  progu. Rozpisane dla dziennika, lekcji i ryzyk; tabela z trzema realnymi pomiarami.
- **`core/templates/SPEC_ARCHIWUM.md`, nowa sekcja „Komunikat zablokowanej rotacji"** — kształt
  czterech części w stałej kolejności (stan zakresu → cztery liczby → pary „pozycja → wpis"
  z wiekiem w dniach i liczbą wpisów przepuszczanych przez zamknięcie → ile odblokowuje pierwsza,
  ile wszystkie), limit pięciu blokerów po dwie pozycje, tabela realnych powodów blokady po 1.7.0
  i **dwa przykłady brzmienia wygenerowane z realnych plików**. Skąd wiek pozycji: z adnotacji,
  a gdy jej nie ma — z daty wpisu; brak obu znaczy pozycję bez wieku, nie pominiętą.
- **Trzy przypadki brzegowe zgrane z powyższym** — „cały zakres nietykalny", „mniej niż dziesięć
  wpisów" i „pozycja `ryzyka` ponad progiem bez zamkniętych ryzyk" mówią teraz **tym samym**
  językiem progu i dolnej granicy; dołożony czwarty: „rotacja wzięła wszystko, a dolna granica
  i tak przekracza próg". Sekcja „Zakazy" dostała trzy pozycje: zakaz milczenia powyżej progu,
  zakaz podawania progu bez pozostałych trzech liczb i zakaz wymieniania wpisu linkowanego wśród
  blokerów (od 1.7.0 nie blokuje).
- **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md` (sekcja „Rotacja
  dokumentów") i `adapters/cursor/rules/relai-core.mdc` (punkt 2 „Session close ritual", po
  angielsku): sposób liczenia progu i kształt komunikatu wypisane w treści, bo procedura rotacji
  mieszka w treści skilla (L-0011).
- **Rozstrzygnięcie granicy wobec kodu (punkt zakresu, nie dowolność): `session-signals.js`
  zostaje bez zmian.** `startCost` i `startCostReport` liczą **budżet startu sesji** (sześć pozycji
  wobec 80 KB), a nie progi rotacji; komunikat blokady wymaga wyznaczonego zakresu, sparsowanych
  pozycji i ich wieku — czyli wyniku rotacji, którego hook startu nie ma. Komunikat pisze **model**
  w kroku 2 rytuału zamknięcia i tak jest zapisany w obu adapterach. Kodu na zapas nie dołożono.

**Zweryfikowane — jak dokładnie:**

- **Obie wersje komunikatu w jednym przebiegu, wygenerowane przez instrument** (`prog-i-blokada.js`,
  poza repozytorium; stara reguła 1.6.1 i nowa E2 zaimplementowane obok siebie). Sześć przypadków
  na realnych plikach `FAKT`:
  - dziennik PolyFlow sprzed migracji do 1.6.1 (`396e243^`, 97 wpisów, projekt sprzed 1.6.0):
    stary komunikat **0 znaków**, nowy wypisuje 34 blokery i liczby — rotacja bierze **2 z 87**
    wpisów rotowalnych, **85 stoi (453,8 KB)**. To jest dowód, po co ten etap był.
  - dziennik RelAI z 2026-08-17 (`50b3a45`, sprzed odblokowania rotacji): stary **0 znaków**,
    nowy — 13 blokerów, **3 z 19** wpisów przechodzi, 16 stoi (107,6 KB), pozycje otwarte od 25 dni.
  - dziennik PolyFlow po rotacji (10 wpisów) przy progu 100 KB: stary „nie ma czego przenieść",
    nowy — cztery liczby plus zdanie o dolnej granicy.
- **Cztery liczby na dwóch dokumentach** (próg 150 KB): `docs/DZIENNIK.md` tego repozytorium —
  całkowita **156,7 KB**, rotowalna **104,6 KB**, dolna granica **52,1 KB**, rotacja bierze 18 z 18;
  dziennik PolyFlow sprzed rotacji — **859,8 / 748,2 / 111,5 KB**, rotacja bierze 117 ze 117.
- **Przypadek „sama dolna granica przekracza próg" pokazany na danych:** dziennik PolyFlow po
  rotacji, 10 wpisów, waga całkowita **115,9 KB** = rotowalna **0 KB** + dolna granica **115,9 KB**
  przy progu 100 KB. Treść raportu wypisana i przepisana do specyfikacji jako drugi przykład.
- **Dowód negatywny ciszy poniżej progu** (zasada 3): **ten sam plik** przy progu 150 KB —
  `komunikatNowy().length === 0` i `komunikatStary().length === 0`, wypisane jako `""`, kod wyjścia
  **0**. Przy progu 100 KB ten sam plik daje 363 znaki, więc cisza jest funkcją progu, a nie
  martwej gałęzi.
- **Kontrola instrumentu** (zasada 5): rozkład pozycji „Do zrobienia przez człowieka" wypisany dla
  każdego pliku — RelAI 63 pozycje (13 rozstrzygniętych, 35 wyprowadzonych, 3 puste, 12 otwartych),
  PolyFlow sprzed rotacji 200 (21/29/0/150), PolyFlow sprzed migracji 123 (11/0/0/112). Zero
  trafień nie wystąpiło nigdzie, a projekt z sekcją „Czeka na człowieka" daje **0 blokerów** mimo
  otwartych pozycji — czyli instrument rozpoznaje regułę z E1, a nie tylko liczy myślniki.
- **Trzy dokumenty przeczytane w jednym przebiegu tej sesji** (`SPEC_ARCHIWUM.md`, `SKILL.md`,
  `relai-core.mdc`): ta sama kolejność czterech liczb, ten sam wyzwalacz, ten sam cel na części
  rotowalnej, te same cztery części komunikatu, ten sam warunek par „pozycja → wpis".
- **`git grep -c`** po frazach nowej reguły: „dolna granica osiągalna / lowest reachable floor" —
  `SPEC_ARCHIWUM.md` 8, `SKILL.md` 1, `relai-core.mdc` 1; „część rotowalna / rotatable part" —
  12 / 2 / 2; „pozycja → wpis / item → entry" — 2 / 1 / 1.
- **`node core/tools/validate-adapters.js`** — kod wyjścia **0** („spojne", wersja 1.6.1 z trzech
  źródeł).
- **`git status --short`** — wyłącznie pliki z zakresu etapu plus nieśledzony
  `docs/AUDYT_2026-08-22.html`, który leżał tam przed sesją. Instrument i kopie dzienników stoją
  poza repozytorium (`%TEMP%\relai-e2`).
- **Nie sprawdzono:** zachowania komunikatu w świeżej sesji realnego projektu — kształt jest dziś
  regułą w trzech dokumentach i wynikiem instrumentu, ale żadna sesja nie napisała go w rytuale
  zamknięcia. Wchodzi do E6 razem z pomiarem na realnych projektach. Nie sprawdzono też adaptera
  Cursora w aplikacji po tej zmianie.

**Świadomie odłożone:**

- **Rotacja dziennika tego repozytorium** — plik jest ponad progiem (156,7 KB przy 150 KB) i miałby
  18 wpisów do przeniesienia, ale rotacja należy do rytuału zamknięcia sesji, nie do zakresu etapu.
  Prompt wymieniał to wprost jako poza zakresem.
- **Liczba „160,4 KB" w `STATE.md`** była rozmiarem w bajtach podanym jako kilobajty; poprawiona
  przy okazji aktualizacji obszaru rotacji, bo ten sam akapit i tak był przepisywany.
- **Rejestr `docs/ARTEFAKTY.md`** — hook `profile-rules` upomniał się o niego przy każdej zmianie
  specyfikacji. To odnoga **REJESTR_ARTEFAKTOW** z E1, nadal `OTWARTA`; przy okazji etapu jej nie
  robimy.
- **Druga linia raportu startu, progi cząstkowe i katalog progów** — E4. Wymuszone pytanie o sprawy
  przeterminowane — E3. Rotacja ryzyk i ustawień — E5. Podbicie wersji do 1.7.0 — E6. W dokumentach
  nie ma o nich żadnej obietnicy.

**Do zrobienia przez człowieka:**

- **Odnoga [REJESTR_ARTEFAKTOW](archiwum/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
  nadal czeka na świeżą sesję Opusa; prompt gotowy od E1.
  *(rozstrzygnięte 2026-09-01 — odnoga wykonana i ZAMKNIĘTA, `docs/ARTEFAKTY.md` istnieje)*

### 2026-09-01 — Odnoga REJESTR_ARTEFAKTOW: rejestr, którego wymagał profil `prompty`

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Powstał [`docs/ARTEFAKTY.md`](ARTEFAKTY.md)** wg `SPEC_PROFILE.md`, sekcja „Profil prompty" —
  **38 pozycji** w pięciu tabelach: 22 specyfikacje z `core/templates/`, szablon planu HTML jako
  jeden artefakt złożony, 10 komend, 2 skille, 3 reguły Cursora. Sześć kolumn wymaganych przez
  specyfikację: artefakt · plik · wersja · data · co się zmieniło · po co. Hooki, guardraile
  i walidator do rejestru **nie wchodzą** — są nośnikiem, nie instrukcją czytaną przez model.
- **Rejestr liczy od 2026-09-01, co jest w nim napisane wprost.** Wszystkie pozycje mają wersję `1`;
  daty pochodzą z `git log --diff-filter=A --follow`, a kolumna „co się zmieniło" niesie datę
  ostatniej zmiany z gita, żeby było widać, które artefakty żyją. Historii wersji sprzed rejestru
  nie odtwarzano.
- **Rozbieżność liczb wypisana jawnie, nie ukryta.** Karta odnogi i hook `session-context` mówiły
  o **31 specyfikacjach**; na dysku plików `.md` w `core/templates/` jest **22** (21 × `SPEC_*`
  + `README`). 31 to liczba **plików** kopii w `.claude/relai/templates/` razem z dziewięcioma
  z `HTML_PLAN/` (22 + 9). Rejestr trzyma się stanu z dysku.
- **`ODNOGA.md` → ZAMKNIĘTA**, sekcja „Wynik" wypełniona; linia odnogi w
  [STATUS.md](archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) planu HIGIENA_DOKUMENTOW zaktualizowana. Tabeli
  etapów i dziennika wdrożenia nie ruszano — plan jest zamrożony (D-33).

**Zweryfikowane — jak dokładnie:**

- **Hook `profile-rules`, obie wersje w jednym przebiegu** (zasada 4 z „Zasad aktywnych"). Hook
  wywołany na **39 ścieżkach artefaktów** przy dwóch katalogach roboczych różniących się wyłącznie
  obecnością rejestru: **bez `ARTEFAKTY.md` — 33 ostrzeżenia, z rejestrem — 0**. To jest dowód
  efektu, nie zdarzenia: ta sama lista, ta sama komenda, jedna różnica.
- **Cisza przy sześciu pozycjach w wariancie „bez" jest defektem hooka, nie zasługą rejestru.**
  `jestArtefaktem()` przepuszcza tylko `.md|.txt|.prompt|.tmpl|.j2` i wyklucza każdy `README.md`,
  więc trzy reguły Cursora (`.mdc`), dwa pliki `HTML_PLAN/*.html` i `core/templates/README.md` nie
  wyzwolą reguły profilu nigdy. Zero trafień przy niepustym zbiorze sprawdzone na instrumencie,
  zanim uznano je za wynik.
- **Inwentarz komendą, nie okiem:** `ls core/templates/*.md | wc -l` → 22,
  `find core/templates/HTML_PLAN -type f` → 9, komendy → 10, skille → 2, `.mdc` → 3. Liczby
  w rejestrze zgadzają się z tymi z dysku; przelicznik 38 = 22 + 1 + 10 + 2 + 3 stoi w dokumencie.
- **`node core/tools/validate-adapters.js` → kod 0**, komunikat „spojne", wersja `1.6.1` z trzech
  źródeł.
- **`git status --short`** pokazuje `docs/ARTEFAKTY.md` oraz `docs/AUDYT_2026-08-22.html` — ten
  drugi był nieśledzony **przed** tą sesją i nie został tknięty.

**Świadomie odłożone:**

- **Zmiana `jestArtefaktem()` w `profile-rules.js`**, żeby obejmowała `.mdc`, `.html` szablonu planu
  i `README` katalogu specyfikacji. Poza zakresem odnogi (zakres opisuje stan, nie poprawia
  narzędzi), a hook jest artefaktem-nośnikiem, którego zmiana wymaga własnego pomiaru.
- **Rozstrzygnięcie nazwy katalogu archiwum artefaktów.** `SPEC_PROFILE.md` **i `CLAUDE.md`** mówią
  `docs/archiwum/artefakty/`; `artefaktow/` stało wyłącznie w karcie i prompcie tej odnogi.
  *(sprostowanie 2026-09-01 — pierwsza wersja tego wpisu przypisała `artefaktow/` plikowi
  `CLAUDE.md`; sprawdzone grepem: linia 50 ma `artefakty`)*. Katalog nie istnieje (D-11), więc
  dziś nic się nie zepsuło. *(rozstrzygnięte 2026-09-01 — decyzja: `artefakty`)*
- **Progi i rotacja rejestru** — `ARTEFAKTY.md` nie wchodzi do warstwy startowej sesji ani do
  budżetu; katalog progów jest zakresem E4 planu HIGIENA_DOKUMENTOW (Aneks B).

**Do zrobienia przez człowieka:**

- **Wybrać nazwę katalogu archiwum artefaktów** — `artefakty` czy `artefaktow`. Wybór trzeba nanieść
  na przegraną stronę, zanim powstanie pierwsza datowana kopia artefaktu.
  *(rozstrzygnięte 2026-09-01 — `artefakty`; poprawione w karcie i prompcie odnogi)*
- **Zdecydować, czy `profile-rules` ma widzieć `.mdc` i `.html`.** Dziś sześć z 39 artefaktów jest
  poza zasięgiem reguły profilu; rejestr je zna, ale hook o ich zmianie nie przypomni.
  *(rozstrzygnięte 2026-09-01 — `.mdc` wchodzi do `jestArtefaktem()`; `.html` szablonu planu
  i `core/templates/README.md` zostają poza zasięgiem świadomie)*

### 2026-09-01 — Zamknięcie sesji: pierwsza rotacja regułą 1.7.0 na własnym dzienniku

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Rotacja dziennika, przebieg dwufazowy z sumą kontrolną.** Przeniesione **3 wpisy** z 2026-08-12
  do [DZIENNIK_2026-08-12_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md)
  (26,5 KB), suma kontrolna `b4601365eee25163`. Żywy dziennik: **168,0 → 142,2 KB**, 30 → 27 wpisów,
  cztery linie-odsyłacze zamiast trzech.
- **Rotacja poszła regułą 1.7.0 z `core/templates/SPEC_ARCHIWUM.md`, nie 1.6.1 z kopii
  w projekcie** — decyzja człowieka podjęta w tej sesji po pokazaniu obu wyników. Powód rozjazdu:
  `.claude/relai/templates/` niesie wersję z **zainstalowanego pluginu 1.6.1** (26,7 KB), a repo ma
  po E1/E2 wersję 1.7.0 (38,8 KB), która nie jest jeszcze wydana. To pierwsze realne użycie reguł
  z E1 i E2 w sesji, a nie na kopii pliku.

**Zweryfikowane — jak dokładnie:**

- **Trzy wagi policzone przed rotacją** wg sekcji „Próg liczony ponad nietykalnymi": waga całkowita
  **168,0 KB**, część rotowalna **115,8 KB**, dolna granica osiągalna **52,2 KB**, próg 150 KB,
  cel 60% = 90 KB. Po rotacji część rotowalna **89,7 KB** — cel osiągnięty przy **3** wpisach.
- **Cel na części rotowalnej zmienia wynik i to jest sedno E2.** Ta sama rotacja liczona po staremu
  (cel na całym pliku) brałaby 15 wpisów, a w wersji 1.6.1 z blokadą linku — 5 wpisów, kończąc na
  128,4 KB, czyli **nie osiągając celu w ogóle**. Reguła 1.7.0 wzięła **mniej** i skończyła
  z celem spełnionym; różnica jest w tym, do czego się porównuje, nie w tym, co jest chronione.
- **Faza 1 przed fazą 2, sumy porównane po odczycie z dysku:** suma fragmentu w żywym pliku
  `b4601365eee25163` = suma treści spod separatora w archiwum. Dopiero po zgodności ruszyło
  przycięcie.
- **Dowód obecności i nieobecności** (nie tylko „nic nie zginęło"): nowa linia-odsyłacz z sumą jest
  w pliku, a pierwsze 200 znaków przeniesionego fragmentu **nie występuje** już w żywym dzienniku.
- **Przepięcie linków nie było potrzebne w tym przebiegu** — pozycje sekcji „Czeka na człowieka"
  linkują do wpisów nr 6, 12, 16, 22 i 23, a zakres objął wpisy 1–3. Mechanizm przepinania z E1
  nadal czeka na przebieg, w którym coś realnie przepnie.
- **Instrument dopasowujący kotwice sprawdzony, zanim uwierzono w wynik.** Pierwsza wersja dała
  **0 dopasowań przy 9 kotwicach** — zwijała podwójne myślniki w kotwicy. Po naprawie: 9 kotwic,
  5 unikalnych, **5 dopasowanych, 0 bez pary**, plus przypadek kontrolny, który musiał trafić
  (trafił we wpis nr 12).
- **Progi, które milczą, sprawdzone i ciche:** sekcja ryzyk **3,8 KB** przy progu cząstkowym 12 KB
  i **zero** ryzyk `ZAMKNIĘTE` → nie rotuje. `LEKCJE.md` **20,6 KB / 11 lekcji** przy progach
  50 KB / 40 → nie rotuje. „Zasady aktywne" **15 pozycji przy limicie 15** → w limicie.
  `STATE.md` 197 linii przy progu 300.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Wyrównanie `.claude/relai/templates/` do repo.** Kopia specyfikacji w projekcie zostaje na
  1.6.1, bo odświeża ją hook z cache'u pluginu; wyrówna ją dopiero wydanie 1.7.0 (E6, sekwencja
  P-005). Do tego czasu każda sesja czytająca specyfikacje z kopii dostanie stare reguły rotacji.

**Do zrobienia przez człowieka:**

- **Rozstrzygnąć, którą kopią specyfikacji ma się kierować sesja do czasu wydania 1.7.0.** Dziś
  rozjazd wykryło porównanie zrobione ręcznie; nic go nie zgłasza samo.

### 2026-09-01 — Dwie bramki z odnogi zamknięte: `.mdc` w regule profilu i nazwa `artefakty`

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`adapters/claude-code/hooks/profile-rules.js`, `jestArtefaktem()` widzi `.mdc`.** Reguła
  adaptera Cursora jest czytana przez model jak skill, więc jest artefaktem; do tej pory trzy
  reguły `.mdc` nie wyzwalały reguły profilu ani razu. Jedna pozycja we wzorcu rozszerzeń, komentarz
  z powodem i datą pomiaru.
- **Nazwa katalogu archiwum artefaktów rozstrzygnięta: `artefakty`.** `CLAUDE.md` i
  `SPEC_PROFILE.md` miały ją już poprawnie; `artefaktow/` stało wyłącznie w karcie i prompcie odnogi
  REJESTR_ARTEFAKTOW — poprawione w obu (3 wystąpienia).
- **Sprostowanie wpisu z tej samej sesji.** Wcześniejszy wpis przypisał wariant `artefaktow/`
  plikowi `CLAUDE.md`. To nieprawda: `CLAUDE.md:50` ma `artefakty`. Adnotacja sprostowania stoi przy
  pierwotnym zdaniu, treść nie została skasowana (D-18).

**Zweryfikowane — jak dokładnie:**

- **Hook przemierzony tym samym instrumentem co przed zmianą, obie wersje w jednym przebiegu:**
  39 ścieżek, dwa katalogi robocze różniące się wyłącznie obecnością rejestru. Bez rejestru
  **36 ostrzeżeń** (przed zmianą: 33 — przybyły dokładnie trzy `.mdc`), z rejestrem **0**.
- **Trzy pozycje nadal poza zasięgiem i to jest świadome:** `core/templates/HTML_PLAN/szablon.html`,
  `komponenty.html` oraz `core/templates/README.md` — decyzja dotyczyła `.mdc`, nie ich.
- **Stan nazw sprawdzony grepem po całym repozytorium**, nie okiem: po poprawce `artefaktow` nie
  występuje w żadnym pliku poza adnotacjami historycznymi w tym dzienniku.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **`.html` szablonu planu i `README` katalogu specyfikacji w regule profilu.** Oba są artefaktami
  w rejestrze, ale hook o ich zmianie nie przypomni; `README.md` jest dodatkowo wykluczony wprost,
  bo w zwykłym projekcie to plik rdzenia, a nie artefakt.

**Do zrobienia przez człowieka:**

- —

### 2026-09-01 — Osiem bramek z listy zamkniętych, plan ROZWOJ_PO_WYDANIU zamrożony formalnie

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Sekcja „Czeka na człowieka" zeszła z 10 pozycji do 3.** Zamknięte decyzją człowieka w tej
  turze, każda z brzmieniem z zamkniętej listy i adnotacją przy pozycji we wpisie źródłowym:
  - **`claude /login`** → *anulowane*. Razem z pozycją **anulowana odnoga `POMIAR_ODNOG`** —
    login był jej jedynym warunkiem startu.
  - **Okno na `/relai-update` dla JiraManagera i PolyFlow** → *rozstrzygnięte*: PolyFlow przeszedł
    2026-08-21, a JiraManager **przeszedł adopcję poza sesjami tego repozytorium**. Okno nie jest
    już potrzebne.
  - **Feedback od osoby spoza projektu** → *anulowane*; kryterium akceptacyjne planu zostaje
    niespełnione świadomie.
  - **Los `ProbaCursorE6`** → *rozstrzygnięte*: projekt idzie do kasacji. **Katalogu nie usuwam** —
    trwałe kasowanie danych należy do człowieka.
  - **Ścieżka B w `README.md` oczami cursorowca** → *anulowane*.
  - **Formalne zamrożenie planu ROZWOJ_PO_WYDANIU** → *zaakceptowane*. Stan „ZAMROŻONY 2026-08-21"
    stał w trzech dokumentach od 2026-08-21, ale jawnej zgody nie było; teraz jest, i stoi
    w nagłówku `STATUS.md` planu.
  - **Którą kopią specyfikacji kierować się do wydania 1.7.0** → *rozstrzygnięte*: `core/templates/`
    z repozytorium. Zamrożone jako **D-87**.
- **`docs/DECYZJE.md` — nowa decyzja D-87**: w repozytorium RelAI źródłem prawdy o specyfikacjach
  jest `core/templates/`, nie kopia `.claude/relai/templates/`. Decyzja dotyczy **wyłącznie tego
  repozytorium** — w projekcie użytkownika kopia zostaje jedynym źródłem (L-0012).
- **Osiem rozstrzygnięć z E2 wypisane co do jednego** — pozycja weryfikacyjna została w sekcji,
  ale ma już konkretną treść do potwierdzenia zamiast odsyłacza do „siedmiu adnotacji".

**Zweryfikowane — jak dokładnie:**

- **Liczba rozstrzygnięć z E2 policzona z diffa, nie z pamięci:** porównanie `ecd2f82` z rodzicem
  po adnotacjach z zamkniętej listy rdzeni daje **osiem** nowych, nie siedem. Wpis z 2026-08-20
  mówił „7 kolejnych" — ósma to zgoda udzielona w tej samej sesji (odchudzenie „Zasad aktywnych"),
  więc prawdopodobnie nie liczono jej razem z rozstrzygnięciami wziętymi z repozytorium.
- **Stan pre-commita sprawdzony, nie założony:** `.git/hooks/pre-commit` w tym repozytorium
  **nie istnieje**. Obie pozycje pre-commita zostają otwarte — instalacja tutaj i ponowna
  instalacja tam, gdzie hook stoi od wcześniej.
- **Kotwice sekcji po przycięciu:** 3 pozycje, 3 kotwice, **3 dopasowane, 0 bez pary**, przypadek
  kontrolny trafia.
- **Limit komórki „Mitygacja"** po dopisaniu anulowania do R2: sprawdzony komendą, wszystkie
  cztery ryzyka poniżej 800 znaków.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Instalacja pre-commita w tym repozytorium.** Wyjaśniona co do komendy, ale nie wykonana —
  to jawna czynność człowieka i pozostaje jego decyzją, tak jak chce sam instalator.

**Do zrobienia przez człowieka:**

- **Usunąć katalog projektu `ProbaCursorE6`** — decyzja zapadła, kasowania nie wykonuję.
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** wypisanych w tej turze; sprzeciw przy
  którymkolwiek zawraca sprawę do sekcji „Czeka na człowieka".

### 2026-09-01 — Pre-commit zainstalowany w trzech repozytoriach i zmierzony w każdym

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Gitowy pre-commit ze skanem sekretów zainstalowany w trzech repozytoriach:** RelAI,
  JiraManager i PolyFlow. Do `.git/hooks/` każdego trafiły dwa pliki — `pre-commit` i własna kopia
  `relai-secret-scan.js`. Żaden projekt nie miał wcześniej **jakiegokolwiek** hooka `pre-commit`,
  więc instalator niczego nie nadpisał.
- **Guardrail działa teraz poza Claude i Cursorem** — commit z kluczem zatrzyma się także wtedy,
  gdy pójdzie z terminala albo z IDE. To była ostatnia warstwa, której w tych projektach brakowało.
- **Sprawa „ponowna instalacja tam, gdzie hook już stoi" okazała się bezprzedmiotowa** i została
  anulowana — patrz „Zweryfikowane".
- **Los `ProbaCursorE6` rozstrzygnięty faktem, nie decyzją:** katalog projektu już nie istnieje.
  Zostały wyłącznie metadane sesji poza repozytorium, wypisane użytkownikowi do samodzielnego
  usunięcia.

**Zweryfikowane — jak dokładnie:**

- **Każda instalacja zmierzona na dwóch wariantach indeksu w jednym przebiegu.** Indeks z próbką
  klucza `sk-ant-api03-…` → hook kończy się **kodem 1** i komunikatem „commit ZATRZYMANY", bez
  cytowania wartości; ten sam hook na indeksie bez sekretu → **kod 0**. Wynik identyczny w RelAI,
  JiraManagerze i PolyFlow.
- **Próbka składana w czasie wykonania** (L-0046) — w żadnym pliku repozytorium nie stoi ciąg
  wyglądający jak klucz. Plik próbny powstawał i znikał w tej samej komendzie.
- **Praca w toku nietknięta:** oba projekty miały **0 plików w indeksie** przed próbą i **0 po
  niej**; PolyFlow ma osiem zmodyfikowanych plików w katalogu roboczym, żadnego nie ruszono.
  Hook wołany wprost, a nie przez `git commit` — ten sam kod, zero ryzyka wpisu do historii.
- **Trzy kopie są identyczne, nie „podobne":** `sha256sum` na `pre-commit`
  (`d79908ef859d59e3…`) i `relai-secret-scan.js` (`066b5ed1ad484cf5…`) daje tę samą parę sum
  w trzech repozytoriach.
- **Sprawa ponownej instalacji zamknięta pomiarem, nie domysłem:** `find` po całym
  `C:\Users\Lukasz` (głębokość 5) za `relai-secret-scan.js` w katalogach hooków dał **jedno**
  trafienie — świeżo zainstalowane w RelAI. Starych instalacji, do których poprawka 1.5.1 miałaby
  nie dotrzeć, nie ma.
- **`ProbaCursorE6`:** katalogu nie ma ani na pulpicie, ani nigdzie w katalogu użytkownika do
  głębokości 4. Istnieją tylko `~/.claude/projects/C--Users-Lukasz-Desktop-ProbaCursorE6`,
  `~/.claude/session-data/2026-08-17-ProbaCursorE6-session.tmp` oraz
  `~/.cursor/projects/C-Users-Lukasz-Desktop-ProbaCursorE6`.

**Świadomie odłożone:**

- **Instalacja w pozostałych repozytoriach na pulpicie.** Jest ich kilkadziesiąt; decyzja dotyczyła
  trzech projektów prowadzonych przez RelAI.

**Do zrobienia przez człowieka:**

- **Usunąć metadane sesji `ProbaCursorE6`** — trzy ścieżki wypisane wyżej. Trwałego kasowania nie
  wykonuję.
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — jedyna pozycja, jaka została w sekcji
  „Czeka na człowieka".

### 2026-09-01 — Zamknięcie dnia: druga rotacja i bilans sesji

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Druga rotacja dziennika tego samego dnia**, tym samym mechanizmem co pierwsza: 3 wpisy
  (2026-08-12 … 2026-08-17) do
  [DZIENNIK_2026-08-12_2026-08-17.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md),
  23,7 KB, suma kontrolna `1690be9b08748504`. Żywy dziennik **153,7 → 130,6 KB**, 31 → 28 wpisów,
  piąta linia-odsyłacz w sekcji „Wpisy".
- **Bilans całej sesji:** rejestr artefaktów powstał, odnoga REJESTR_ARTEFAKTOW zamknięta,
  osiem bramek człowieka rozstrzygniętych, pre-commit zainstalowany w trzech repozytoriach,
  plan ROZWOJ_PO_WYDANIU zamrożony formalnie, odnoga POMIAR_ODNOG anulowana, decyzja D-87
  zamrożona. Sekcja „Czeka na człowieka": **10 → 1 pozycja**.

**Zweryfikowane — jak dokładnie:**

- **Trzy wagi przed rotacją:** waga całkowita **153,7 KB**, część rotowalna **105,0 KB**, dolna
  granica osiągalna **48,7 KB**, próg 150 KB, cel 60% = 90 KB. Po rotacji część rotowalna
  **81,7 KB** — cel osiągnięty przy trzech wpisach z 21 kandydatów.
- **Faza 1 przed fazą 2:** suma fragmentu w żywym pliku `1690be9b08748504` = suma treści spod
  separatora odczytanej **z dysku**. Przycięcie ruszyło dopiero po zgodności.
- **Przepięcie linków sprawdzone i niepotrzebne** — jedyna pozycja sekcji wskazuje wpis
  z 2026-09-01, a przenoszone były trzy wpisy z 12–17 sierpnia; kontrola dała **0 kolizji**.
  Mechanizm z E1 nadal czeka na przebieg, w którym coś realnie przepnie.
- **Dowód obecności i nieobecności:** nowa linia-odsyłacz z sumą jest w pliku, a pierwsze
  200 znaków przeniesionego fragmentu **nie występuje** już w żywym dzienniku.
- **Kotwica sekcji po przycięciu nadal trafia** — 1 kotwica, 1 dopasowanie, 0 bez pary, przypadek
  kontrolny trafia.
- **Progi, które milczą:** „Zasady aktywne" **15 / 15** — w limicie. `LEKCJE.md` 20,6 KB / 11 lekcji
  przy progach 50 KB / 40. Sekcja ryzyk **3,9 KB** przy progu cząstkowym 12 KB i **zero** ryzyk
  `ZAMKNIĘTE` → nie rotuje. `STATE.md` 208 linii przy progu 300.
- **`node core/tools/validate-adapters.js` → kod 0.**

**Świadomie odłożone:**

- **Push pięciu commitów tej sesji** — użytkownik prosił o commity, nie o wypchnięcie.
- **Wydanie 1.7.0** — reguły rotacji z E1 i E2 działają w repozytorium, ale zainstalowany plugin
  nadal niesie 1.6.1. Należy do E6 planu HIGIENA_DOKUMENTOW.

**Do zrobienia przez człowieka:**

- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — jedyna otwarta pozycja.
- **Usunąć metadane sesji `ProbaCursorE6`** — trzy ścieżki w poprzednim wpisie.

### 2026-09-01 — E3: sprawa przeterminowana wymusza decyzję

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/templates/SPEC_USTAWIENIA.md` — czwarty wiersz czytany maszynowo: `Przegląd spraw
  człowieka`, format `włączony · 30 dni`, kotwica na początku komórki, zamknięta lista brzmień
  wyłącznika, wartość nierozpoznana → przegląd wyłączony plus jedno zdanie. Wiersz dopisany do
  tabeli „Wiersz | Czyta go", do listy wpisów tworzonych przy inicjalizacji i do przykładu.
  Napisane wprost, że wyłącznik jest **osobny od rotacji** (Aneks A).
- `core/process/session-signals.js` — `sprawyPrzeterminowane(cwd, opcje)` plus
  `sprawyPrzeterminowaneReport(miara, opcje)`; pomocniczo `przegladSprawCzlowieka`, `pozycjeCzeka`,
  `dniMiedzy`, `ascii`. Wiek liczony od daty pozycji, a po odroczeniu — od daty odroczenia;
  pozycja bez żadnej daty nie jest przeterminowana. Wyeksportowane cztery funkcje plus
  `przelacznikRotacji` (dowód niezależności wyłączników).
- Oba hooki `session-context` (Claude Code i Cursor) wołają raport. Cursor przekazuje
  `interaktywna` z `is_background_agent`; Claude Code, jak przy budżecie, nie zgaduje.
- `CLAUDE.md` tego repozytorium i `core/templates/SPEC_CLAUDE_MD.md` — nośnik zachowania jako
  osobna linia pod frazami sesji (L-0030): reguła ma działać przy każdym modelu.
- `core/templates/SPEC_DZIENNIK.md` — format adnotacji odroczenia `*(odroczone RRRR-MM-DD,
  odroczeń: N)*` (EN: `*(deferred …, deferrals: N)*`) z licznikiem, zachowaniem po trzecim
  odroczeniu i przykładem w sekcji „Czeka na człowieka".
- `core/templates/SPEC_ARCHIWUM.md` — rdzeń `odroczo` dopisany wprost do brzmień, które
  rozstrzygnięciem **nie są**.
- Procedura pytania partiami po cztery, z trzema wyborami, w `adapters/claude-code/skills/
  relai-core/SKILL.md` i w `adapters/cursor/rules/relai-core.mdc` (tam bez `AskUserQuestion`,
  wg sekcji 7 tamtego pliku).
- `docs/USTAWIENIA.md` tego projektu — wiersz `Przegląd spraw człowieka: włączony · 30 dni`.

**Zweryfikowane — jak dokładnie:**
- **Wykrycie na trzech plikach, w obu wariantach końca linii, w jednym przebiegu** — instrument
  `pomiar.js` poza repozytorium buduje sztuczne projekty RelAI w `%TEMP%` i woła realne funkcje
  rdzenia (dzień podstawiony: 2026-09-01). RelAI: 1 sprawa otwarta, 0 przeterminowanych przy N=30
  i przy N=90, 0 bez daty. PolyFlow (`6a330c1`): **25 otwartych, 47 rozstrzygniętych zostawionych
  w sekcji, 0 bez daty, 0 przeterminowanych przy N=30 i N=90**. Materiał kontrolny: 5 otwartych,
  1 bez daty, **3 przeterminowane przy N=30 i 1 przy N=90**. Liczby identyczne dla LF i CRLF.
- **Kontrola zera** (zasada 5: zero trafień to defekt instrumentu, dopóki nie udowodnisz inaczej) —
  najstarsza sprawa otwarta: RelAI 12 dni, PolyFlow **16 dni**, materiał 239 dni. Zero przy progu
  30 jest wynikiem, nie defektem. Ten sam plik PolyFlow przy dacie 2026-10-15: **25 z 25
  przeterminowanych** — mechanizm rusza, gdy jest na czym.
- **Dowód negatywny wyłącznika** — `Przegląd spraw człowieka: wyłączony` → zwrot `null`, raport
  `[]`, **zero znaków**. Wiersz nieobecny w pliku → to samo. Wypisane na wyjściu instrumentu.
- **Niezależność wyłączników** (Aneks A) — przy `Rotacja dokumentów: wyłączona` i `Przegląd spraw
  człowieka: włączony` w jednym pliku: `przelacznikRotacji` = `false`, `przegladSprawCzlowieka` =
  `{"wlaczony":true,"N":30}`, wykrycie zwraca 3 przeterminowane. Oba wywołania obok siebie.
- **Wartość nierozpoznana** — wiersz `może być · 30 dni` → `{nierozpoznany:true}`, brak wykrycia
  i jedno zdanie „Dozwolone wartosci: wlaczony / wylaczony", bez domysłu.
- **Przypadek, który musi trafić** (zasada 5) — pozycja z dopiskiem `(data pierwotna nieznana)`
  trafia do wyniku z wiekiem 48 dni liczonym od daty wyprowadzenia i jest przeterminowana; pozycja
  bez żadnej daty trafia do wyniku z `wiek=null` i **nie** jest przeterminowana. Obie sprawdzone
  osobną kontrolą, która wypisałaby „DEFEKT INSTRUMENTU" przy zerze.
- **Odroczenie przesuwa zegar** — sprawa odroczona 4 dni temu (licznik 3) nie jest przeterminowana
  mimo wieku 184 dni; sprawa odroczona 62 dni temu jest, a raport dokłada linię „Odkladane co
  najmniej trzy razy: 1 — najstarsza czeka 8 miesiecy od pierwszego wystapienia".
- **Realny hook, obie strony** — `session-context.js` uruchomiony na tym repozytorium wypisuje
  **0 linii** przeglądu; uruchomiony na projekcie kontrolnym wypisuje raport i zadanie „PARTIAMI
  PO CZTERY". Cisza i sygnał zmierzone w jednym przebiegu.
- **Sesja nieinteraktywna** — ten sam materiał z `interaktywna: false` kończy raport zdaniem
  „Sesja nieinteraktywna: to jest sam raport, bez pytan"; linii z zadaniem pytania nie ma.
- **Cztery dokumenty mówią to samo** — instrument sprawdził w jednym przebiegu obecność czterech
  faktów (N=30, wyłącznik osobny od rotacji, partie po cztery, trzy wybory) w `SPEC_USTAWIENIA.md`,
  `SPEC_DZIENNIK.md`, `SKILL.md` i `relai-core.mdc`: wszystkie TAK. Jedno „NIE" okazało się zbyt
  wąskim oknem wzorca (tabela w skillu ma 369 znaków między pierwszym a trzecim wyborem) —
  potwierdzone szerszym dopasowaniem, dokument bez zmian.
- `git grep -n "Przegląd spraw człowieka"` — trafienia w `core/templates/` (4 pliki),
  `core/process/`, `adapters/claude-code/` i `adapters/cursor/`.
- `node core/tools/validate-adapters.js` → **kod 0**.
- `git status --short` — 12 zmodyfikowanych plików śledzonych, zero plików tymczasowych; instrument
  i materiały pomiarowe mieszkają w `%TEMP%/e3/`.

**Świadomie odłożone:**
- **Rozjazd promptu E3 ze stanem repozytorium.** Prompt mówił o **9 pozycjach otwartych** w sekcji
  „Czeka na człowieka"; realnie została **1** — osiem zamknięto 2026-09-01, już po wygenerowaniu
  promptu. `PLAN.html` nietknięty (D-33), aneksu nie proponowano: „9 pozycji" było opisem materiału,
  nie kryterium. Materiał zastąpiony dziennikiem PolyFlow i plikiem kontrolnym; rozstrzygnięcie
  użytkownika padło przed startem etapu.
- **Filtrowanie pozycji rozstrzygniętych zostawionych w sekcji.** Weszło do zakresu, bo bez niego
  PolyFlow dawał 67 „spraw otwartych" zamiast 25 i mechanizm pytałby o rzeczy zamknięte tydzień
  wcześniej. Rdzenie czytane z tej samej zamkniętej listy co w `SPEC_ARCHIWUM.md`.
- Druga linia raportu startu i progi cząstkowe — **E4**. Rotacja ryzyk i ustawień — **E5**.
  Podbicie wersji do 1.7.0 i `/relai-update` — **E6**. Niczego z tych rzeczy nie obiecano
  w dokumentach.
- **Pomiar w świeżej sesji** — zachowanie „pytanie partiami po cztery" jest dziś opisane, ale
  niezmierzone: ten etap nie miał ani jednej sprawy przeterminowanej w żywym repozytorium.
  Pomiar wchodzi do E6 razem z resztą sekwencji wydania.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu.

### 2026-09-01 — E4: raport startu jako adres progów

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/process/session-signals.js` — `dokumentyPonadProgiem(cwd, txtUstawien, progRyzyk)` mierzy
  **całe dokumenty i sekcje** wobec ich własnych progów: `DZIENNIK.md` (150 KB), `LEKCJE.md`
  (50 KB albo 40 lekcji), `STATE.md` (300 linii), sekcja „Stan otwartych ryzyk" (próg cząstkowy
  `ryzyka`, 12 KB), sekcja „Lekcje zwinięte" (30 KB z `SPEC_LEKCJE.md`). Progi czytane z wiersza
  `Rotacja dokumentów` przez `progiRotacjiZKomorki` — kotwica na początku członu, zamknięta lista
  brzmień, człon nierozpoznany zostawia wartość domyślną. Wagi liczone po normalizacji CRLF → LF,
  tak jak sumy kontrolne rotacji.
- `startCostReport` ma **drugi wyzwalacz**: raport pada przy przekroczeniu sumy warstwy startowej
  **albo** gdy dokument czy sekcja przekracza własny próg. Linie są rozłączne — jedna o budżecie,
  jedna `[RelAI progi dokumentow]` o dokumentach; każda pozycja z **nazwą procedury**, która ją
  odchudza. Wypisywane są najwyżej trzy pozycje, reszta jako jawna liczba z poprawną odmianą.
  Linia budżetowa wymienia teraz **pozycje ponad progiem cząstkowym**, a nie trzy najgrubsze,
  gdy takie pozycje są.
- **Wyłączniki zostały rozdzielone do końca.** Część „dokumenty ponad progiem" ma wyłącznik
  **rotacji**: `wyłączona` albo wartość nierozpoznana wycisza ją w całości. Wyłączony budżet
  jej **nie** wycisza — `startCost` zwraca wtedy kształt `{ tylkoDokumenty: true, dokumenty }`,
  a gdy nic nie przekracza progu, nadal `null`, czyli cisza.
- `core/templates/SPEC_USTAWIENIA.md` — sekcja **„Katalog progów"** (Aneks B): 17 wierszy
  `Próg | Domyślnie | Gdzie mieszka wartość | Kto go czyta | Po przekroczeniu | Adres egzekwowania`.
  Katalog jest **rejestrem, nie drugim źródłem prawdy** — wartości zostają tam, gdzie były.
  Dwa progi mają wpisane wprost „brak automatu" (limit 800 znaków komórki „Mitygacja", propozycja
  kompresji lekcji), a osobny akapit mówi, czego katalog świadomie nie obejmuje: wielkości
  nietykalności (10 wpisów, 20 lekcji), liczb orientacyjnych i wartości historycznych.
- `core/templates/SPEC_LEKCJE.md` i `SPEC_ARCHIWUM.md` — po jednym akapicie: próg sekcji „Lekcje
  zwinięte" jest od 1.7.0 czytany maszynowo, progi rotacji mają adres także na starcie sesji,
  a raport **mówi, nie rotuje**. Oba odsyłają do katalogu.
- Oba adaptery — `adapters/claude-code/skills/relai-core/SKILL.md` (sekcja „Dokument ponad własnym
  progiem") i `adapters/cursor/rules/relai-core.mdc` (ten sam opis po angielsku): jak zareagować na
  nową linię, że to drugi wyzwalacz tego samego raportu, że procedury wykonuje się dopiero po
  zgodzie i że linia nie jest kompletem do przepisania. **Limitu „Zasad aktywnych" nie ruszono** —
  został w kroku 1 rytuału zamknięcia.

**Zweryfikowane — jak dokładnie:**
- **Dwa wyzwalacze obiema wersjami w jednym przebiegu** (zasada 4) — instrument `pomiar.js`
  w `%TEMP%/e4/` buduje sztuczne projekty RelAI i woła realne funkcje rdzenia. Projekt mieszczący
  się w budżecie (4,0 KB / 80 KB) z dziennikiem **154,5 KB przy progu 150 KB** → raport **2 linie**.
  Ten sam projekt z dziennikiem **31,2 KB** → **zero znaków**. Wypisane obok siebie.
- **Regresja ciszy** (ryzyko 3 planu) — realne uruchomienie obu hooków startu na tym repozytorium
  w stanie na dziś (start 47,1 KB / 80 KB, dziennik 140,2 / 150 KB, lekcje 23,5 / 50 KB, STATE
  224 / 300 linii): `adapters/claude-code/hooks/session-context.js` → **0 linii** raportu,
  `adapters/cursor/hooks/session-context.js` → **0 linii** przy 1275 B pozostałego kontekstu.
  Zmierzone uruchomieniem hooka, nie samą funkcją.
- **Przypadek z Aneksu B odtworzony z gita** — `git show ea33e1c:docs/LEKCJE.md` (**52 260 B**,
  sekcja „Lekcje zwinięte" **35 787 B**) → raport wymienia **plik i sekcję**, każde z nazwą
  procedury: „docs/LEKCJE.md 51 KB (prog 50 KB) — rotacja lekcji; sekcja »Lekcje zwiniete«
  34.9 KB (prog 30 KB) — przeniesienie zwinietych lekcji do archiwum". Liczby identyczne dla LF
  i CRLF (na dysku 52 928 B, po normalizacji 52 260 B) — zasada 11.
- **Limit sześciu linii nie pęka** — projekt z przekroczoną sumą budżetu (87,0 KB / 80 KB),
  **dwoma** progami cząstkowymi (CLAUDE, ryzyka), **trzema** progami dokumentów (dziennik, lekcje,
  STATE) i **dwoma** progami sekcji (ryzyka, zwinięte): **5 linii** raportu, sesja nieinteraktywna
  **4 linie**. Limit 6.
- **Próg nierozpoznany znaczy cisza** (zasada 7) — cztery warianty wiersza rotacji na tym samym
  materiale: `włączona` → 2 pozycje i linia progów; `być może` → **0 pozycji, linii progów brak**,
  raport budżetu **działa dalej** (4 linie); `wyłączona` → to samo; `włączona · dziennik sporo` →
  człon nierozpoznany, wartość domyślna 150 KB, mechanizm działa.
- **Niezależność wyłączników** — budżet `wyłączony` / bez wiersza / wartość nierozpoznana przy
  rotacji włączonej i dzienniku ponad progiem: linia progów pada we wszystkich trzech przypadkach.
  Kontrola ciszy: budżet wyłączony i dokumenty **poniżej** progu → `startCost` = `null`, raport
  **0 linii**.
- **Materiał z cudzego projektu** — dokumenty PolyFlow (`9fcf433`) wstawione do sztucznego projektu
  w `%TEMP%`: dziennik 167,2 KB / 150 KB, sekcja ryzyk 38,6 KB / 12 KB, lekcje 61,3 KB / 50 KB,
  STATE 301 / 300 linii — **cztery pozycje, z których przed E4 nie odezwałaby się ani jedna**;
  raport 5 linii.
- **Katalog progów kompletny** — instrument `s6-katalog.js` zbiera z `core/templates/` i
  `core/process/` linie niosące liczbę przy jednostce mechanizmu: **51 kandydatów, 0 bez
  odpowiednika w katalogu**. Dwie kontrole instrumentu, które **muszą** trafić (zasada 5): limit
  15 pozycji w `SPEC_LEKCJE.md` i limit 800 znaków w `SPEC_DZIENNIK.md` — obie TAK. Druga z nich
  wyszła dopiero po naprawie instrumentu: linia o limicie 800 znaków niesie datę kalibracji, więc
  filtr „to jest pomiar, nie próg" zjadał ją w ciszy.
- **Limit „Zasad aktywnych" nadal ma jeden adres** — `git grep` pokazuje go w kroku 1 rytuału
  zamknięcia w obu adapterach (`SKILL.md:502`, `relai-core.mdc:136`) i **nigdzie** w opisie raportu
  startu.
- `node core/tools/validate-adapters.js` → **kod 0**.
- `git status --short` — 7 zmodyfikowanych plików śledzonych, zero plików tymczasowych; instrument
  i materiały pomiarowe mieszkają w `%TEMP%/e4/`.

**Świadomie odłożone:**
- **Wykonanie rotacji i kompresji na tym repozytorium** — raport ma o nich mówić, a nie robić ich
  za człowieka. Dziennik po tym wpisie zbliża się do progu 150 KB; rotacja pójdzie własnym trybem
  w rytuale zamknięcia sesji.
- **Rotacja ryzyk i ustawień do archiwum oraz kompresja komórki „Mitygacja"** — E5. **Podbicie
  wersji do 1.7.0, `/relai-update` i pomiar na realnych projektach** — E6. Niczego z tych rzeczy
  nie obiecano w dokumentach.
- **Próg sekcji „Zasady aktywne" liczony w pozycjach** został przy swoim adresie (krok 1 rytuału
  zamknięcia) i **nie** wszedł do raportu startu — decyzja z promptu etapu, powtórzona w planie
  dwa razy.
- **Projekt sprzed 1.6.0 (bez wiersza budżetu) usłyszy nową linię**, jeśli ma włączoną rotację
  i dokument ponad progiem. To skutek rozdzielenia wyłączników, nie przeoczenie: zgodą jest tam
  wiersz rotacji, obecny od 1.2.0.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu.

### 2026-09-01 — E5: ryzyka i ustawienia schodzą do archiwum

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- `core/templates/SPEC_DZIENNIK.md` — nowa sekcja „Kompresja komórki »Mitygacja«". Trzy warunki
  w koniunkcji: sekcja ryzyk ponad progiem cząstkowym `ryzyka`, komórka ponad **800 znaków**,
  status z **zamkniętej listy** (`zmitygowan`; `przyj`/`zaakceptowan` razem ze `świadom`). Rdzenia
  szukasz w **brzmieniu statusu** — od początku komórki do pierwszej cyfry, myślnika albo nawiasu.
  Wiek komórki warunkiem **nie jest**. W żywej komórce zostają dwa człony: **dosłowny cytat**
  ostatniego zdania sprzed `Zmierzone:` oraz `Historia: [MITYGACJE_…](…)` z niezmienionym członem
  `Zmierzone:`. Granica zdania rozstrzygnięta wprost (`.!?` + spacja + wielka litera albo `**`).
  Wynik ponad 800 znaków → STOP i pytanie do człowieka.
- `core/templates/SPEC_ARCHIWUM.md` — dwie nowe ścieżki
  (`docs/archiwum/ryzyka/MITYGACJE_<data>.md`, `docs/archiwum/ustawienia/USTAWIENIA_<data>.md`),
  dwa nowe wiersze tabeli progów, sekcje „Historia komórek »Mitygacja«" i „Wycofane wiersze
  ustawień", siedem nowych przypadków brzegowych, cztery nowe zakazy i dwa przykłady plików
  archiwum. Obie operacje to **te same dwa wejścia rotacji**, nie trzecie; każda ma własny przebieg
  i własną sumę kontrolną.
- `core/templates/SPEC_USTAWIENIA.md` — sekcja „Rotacja ustawień": schodzą wyłącznie wiersze sekcji
  „Ustawienia wycofane", wszystkie naraz, przy progu cząstkowym `ustawienia` (6 KB). **Pięć wierszy
  wypisanych z nazwy nie schodzi nigdy** — `Język projektu`, `Profil projektu`, `Rotacja
  dokumentów`, `Budżet startu sesji`, `Przegląd spraw człowieka` — także gdy stoją w sekcji
  wycofanych; `Budżet startu sesji` jest przypadkiem najostrzejszym, bo niesie próg uruchamiający
  tę właśnie rotację. Sekcja „Ustawienia wycofane" **zostaje** jako sposób na czytelność.
- Katalog progów: wiersz „komórka »Mitygacja«" przestał być **brak automatu** i dostał adres
  (krok 2 rytuału zamknięcia); wiersz `docs/USTAWIENIA.md` dostał drugiego czytelnika i drugą
  procedurę. Wierszy nadal **17**, z adresem **15**, bez automatu **1** (propozycja kompresji
  lekcji), „nie dotyczy" **1** (cel rotacji).
- `core/process/session-signals.js` — `dokumentyPonadProgiem` mierzy teraz także
  `docs/USTAWIENIA.md` (próg cząstkowy przychodzi parametrem, tak jak dla sekcji ryzyk) i wybiera
  **procedurę zgodną ze stanem pliku**: `rotacja ustawien do archiwum`, gdy sekcja „Ustawienia
  wycofane" ma wiersze, `zwiezlosc komorki Decyzja`, gdy jej nie ma. Pozycja bez procedury nadal
  nie wchodzi do listy.
- Oba adaptery — krok 2 rytuału zamknięcia w `SKILL.md` i `relai-core.mdc` opisuje obie operacje
  wraz z pięcioma nietykalnymi wierszami z nazwy. Limit „Zasad aktywnych" nietknięty.

**Zweryfikowane — jak dokładnie:**
- **Punkt 1 weryfikacji NIE PRZESZEDŁ i został zamieniony Aneksem C** (decyzja użytkownika
  z tej sesji). Materiał wskazany w prompcie — sekcja ryzyk PolyFlow `9fcf433` — jest
  arytmetycznie nie do zbicia poniżej 12 KB: **39 548 B, 62 ryzyka, 0 `ZAMKNIĘTYCH`, jedna
  komórka ponad 800 znaków (912) i ta o statusie `OTWARTE`**; cała kolumna „Mitygacja" waży
  22 032 B, więc jej wyzerowanie zostawia 17,5 KB. To jest przypadek już opisany
  w `SPEC_ARCHIWUM.md` („sekcja gruba przez ryzyka żywe — decyzja człowieka"), teraz dopisany
  tam z liczbami.
- **Obie wersje w jednym przebiegu** na realnym materiale z kroniką: dziennik PolyFlow sprzed
  migracji (`396e243^`). Sekcja ryzyk **57 136 → 49 137 B** (55,8 → 48,0 KB), **7 komórek
  skompresowanych z 15 ponad 800 znaków**, największa `R40: 1881 → 163` znaki. **Wierszy przed
  i po: 52 i 52**, zbiór numerów identyczny co do znaku — żadne ryzyko nie zniknęło z żywej
  tabeli.
- **Suma kontrolna:** `6c760e1b89d6d10b` policzona z fragmentu w żywym pliku i odczytana z pliku
  archiwum **z dysku** — zgodne. Wariant kontrolny z celowo uszkodzoną treścią archiwum:
  `6c760e1b89d6d10b` vs `a29ae5b08b3aa977`, **STOP**, żywy plik identyczny bajt w bajt,
  0 zmienionych wierszy. To samo dla ustawień: `99623158984a8313` vs `57c356387b3dcd7c`, plik
  nietknięty.
- **Cytat, nie parafraza:** 7 z 7 zdań stanu odnalezionych **dosłownie** w treści archiwum
  (`indexOf`, nie podobieństwo).
- **Dowody negatywne:** komórka `ZMITYGOWANE` poniżej limitu (R1, 574 znaki) — brzmienie
  pierwotne zachowane co do znaku; ryzyko `OTWARTE` z komórką **1866 znaków** (R43) — nietknięte.
- **Wiersz czytany maszynowo nie schodzi:** plik ustawień PolyFlow z **pięcioma** wierszami
  przeniesionymi do sekcji „Ustawienia wycofane" (brakujące dołożone wprost, żeby przypadek
  **musiał** trafić) — po rotacji **wszystkie pięć nadal w pliku**, przeniesionych 16 z 21,
  nietykalnych 5. `startCost` zwraca te same progi i przełączniki
  (`start 80 · CLAUDE 10 · STATE 12 · ryzyka 12 · zasady 30 · ustawienia 6 · status 10`,
  rotacja `true`), `sprawyPrzeterminowane` — `włączony, N=30, 28 pozycji, 0 przeterminowanych`.
  Suma warstwy startowej spadła o 4 516 B i **to jedyna liczba, która się zmieniła**.
- **Rotacja ustawień na realnym pliku:** PolyFlow **30 068 → 25 552 B**, 16 wierszy wycofanych
  przeniesionych, 16 z 16 odnalezionych w archiwum dosłownie, linia-odsyłacz w żywym pliku,
  sekcja „Ustawienia wycofane" nadal istnieje.
- **Cisza poniżej progu:** to repozytorium — sekcja ryzyk **3 978 B / 12 288 B**, ustawienia
  **3 106 B / 6 144 B**; obie procedury kończą się bez zmian w plikach, **katalog archiwum nie
  powstaje**. Hook `session-context` uruchomiony na tym repozytorium: **0 linii** raportu; ten sam
  hook na projekcie kontrolnym (dokumenty PolyFlow): **3 linie**, w tym po raz pierwszy
  `docs/USTAWIENIA.md 29.4 KB (prog 6 KB) — rotacja ustawien do archiwum`. Wariant tego samego
  pliku bez sekcji wycofanych: procedura zmienia się na `zwiezlosc komorki Decyzja`.
- **Oba warianty końca linii w jednym przebiegu:** LF i CRLF — identyczna sekcja przed i po
  (57 136 → 49 137 B), identyczna suma `6c760e1b89d6d10b`, koniec linii pliku zachowany w obu.
- **Kotwica statusu zmierzona na jedenastu brzmieniach**, w tym pięciu, które **muszą** trafić,
  i sześciu, które **nie mogą**: dopasowanie w całej komórce dawało **11 kandydatów**,
  w brzmieniu — **7**; różnicę stanowiły ryzyka `ZAMKNIĘTE` z rdzeniem „zmitygowane" w prozie za
  datą, które schodziłyby wtedy dwiema drogami naraz.
- `node core/tools/validate-adapters.js` → **kod 0** („spojne", 3 źródła wersji, wartość 1.6.1).
- `git grep` na limicie „Zasad aktywnych": dwa trafienia, po jednym w kroku 1 rytuału zamknięcia
  każdego adaptera — **ani jednego** w `session-signals.js` ani w raporcie startu.
- **Nie sprawdzono:** przebiegu obu procedur wykonanego **przez model w żywym rytuale zamknięcia**
  — mechanizm zmierzony instrumentem w `%TEMP%/e5/`, na kopiach poza repozytorium. Wchodzi do E6
  razem z sekwencją wydania.

**Świadomie odłożone:**
- **Wykonanie kompresji i rotacji na tym repozytorium** — obie pozycje są poniżej progu, więc nie
  ma czego robić; mechanizm ma być gotowy, użycie należy do rytuału zamknięcia.
- **Próg liczby wierszy tabeli ryzyk ani procedura dla ryzyk długo nieruszanych** — to był wariant
  B pytania o Aneks C i został odrzucony: nowy mechanizm poza sekcją 6 planu.
- **Wiek komórki jako warunek kompresji** — plan wymieniał „bez zmian od `N` dni", ale nie podał
  wartości `N`, a rozstrzygnięcie przypadku brzegowego z sekcji 8 planu definiuje wyzwalacz bez
  wieku. Wiek wymagałby przy tym dowodu spoza dokumentu (historia gita per komórka).
- Podbicie wersji do 1.7.0, `/relai-update` obu projektów i pomiar pełnego startu — **E6**.

**Do zrobienia przez człowieka:**
- **Potwierdzić albo cofnąć osiem rozstrzygnięć z E2** — pozycja bez zmian, nadal otwarta.
- Nic nowego z tego etapu; Aneks C rozstrzygnięty w tej sesji.

### 2026-09-01 — E6: wydanie 1.7.0, pomiar po restarcie i pierwsza rotacja z przepięciem linków

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Wydanie 1.7.0.** Numer w trzech źródłach liczonych przez walidator plus marker projektu.
  `git grep` po `1.6.1` rozstrzygnięty co do trafienia: **11 deklaracji stanu docelowego**
  podbitych (oba skille, oba README adapterów, tabela `/relai-update`, `SPEC_KOMENDY`,
  `SPEC_RAPORT_ADOPCJI`, `SPEC_USTAWIENIA`, `docs/KOMENDY.md`, `CLAUDE.md`) i **41 wzmianek
  historycznych** zostawionych nietkniętych (cztery specyfikacje, dziennik, archiwum, prompty
  etapowe).
- **`/relai-update` dostała dwa brakujące wiersze inwentaryzacji** — wiersz `Przegląd spraw
  człowieka` w `USTAWIENIA.md` i linię przeglądu w `CLAUDE.md`. Bez nich komenda „aktualizująca
  do 1.7.0" nie wnosiła tego, co 1.7.0 wniosło; drugi wiersz wyszedł dopiero przy inwentaryzacji
  PolyFlow, czyli na cudzym projekcie, a nie na tym.
- **Sekwencja P-005 wykonana w całości**, z restartem aplikacji przed jakimkolwiek pomiarem.
- **PolyFlow podniesiony z 1.6.1 na 1.7.0** komendą uruchomioną **z cache'u pluginu**, nie
  z repozytorium — i przeprowadzony przez pełny rytuał zamknięcia: rotacja dziennika, rotacja
  ustawień, kompresja komórek „Mitygacja".
- **Aneks D do planu**: poprawka wzorca `ASSIGN_RE` w `core/guardrails/secret-scan.js`. Guardrail
  zatrzymał commit wydania na zdaniu specyfikacji **opisującym ten sam guardrail**; zasada aktywna
  12 zabrania obejścia przez `--no-verify`, więc poprawka poszła do rdzenia z dowodem.
- **Rotacja tego dziennika** — 18 wpisów z okresu 2026-08-17…2026-08-21 do
  [archiwum](archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md).

**Zweryfikowane — jak dokładnie:**

- **`node core/tools/validate-adapters.js` → kod 0**, „numery wersji: 3 zrodel, wartosc 1.7.0".
- **Wersja realnie wykonywana potwierdzona treścią pliku**, nie komunikatem CLI: lokalna kopia
  `SPEC_ARCHIWUM.md` w projekcie ma po restarcie **53 057 B i 17 wystąpień „1.7.0"**, przed
  restartem **27 390 B i zero**. `session-signals.js` w cache'u 1.6.1 nie miał **ani jednego**
  wystąpienia `dokumentyPonadProgiem` i `sprawyPrzeterminowane`; w 1.7.0 ma 5 i 4.
- **Świeża sesja po restarcie na tym repozytorium:** hook wypisał `[RelAI progi dokumentow]`
  o dzienniku 155,6 KB przy progu 150 KB — **2 linie**. Ta sama sesja przed restartem, przy
  identycznym pliku, dostała **0 linii**, bo 1.6.1 tej funkcji nie miał. To jest defekt, który
  naprawiał E4, zmierzony na żywym starcie zamiast na kopii.
- **PolyFlow po `/relai-update`:** `Wersja RelAI: 1.7.0`, a **wszystkie pięć wierszy czytanych
  maszynowo** obecnych z brzmieniem — `przegladSprawCzlowieka` zwraca `wlaczony: true, N: 30`,
  `przelacznikRotacji` zwraca `true`, `startCost` — budżet 81 920 B. Dowód negatywny powtórzony
  **po** rotacji ustawień: 5 z 5.
- **Rotacja dziennika PolyFlow, procedura dwufazowa:** suma `566dca8a4dd45ba7` policzona z żywego
  pliku i odczytana **z dysku** z archiwum — zgodna przed przycięciem. 187 477 → 150 810 B,
  9 + 15 = 24 wpisy. Zakres to **cały najstarszy dzień**: pozostałych 5 kandydatów dzieli datę
  z wpisami, które zostają, a plik `DZIENNIK_2026-09-01_2026-09-01.md` już istnieje — rozcięcie
  dnia dałoby kolizję nazwy, którą specyfikacja rozstrzyga zatrzymaniem.
- **Przepięcie linków policzone w obie strony** — pierwszy realny przebieg tej operacji od E1:
  **60 martwych przed rotacją, 65 po niej, 60 po przepięciu**. Ta rotacja dołożyła 5 i przepięła 5,
  bilans zero. Pozostałe 60 pochodzi z rotacji sprzed 1.7.0, które kroku przepięcia nie miały.
- **Rotacja ustawień PolyFlow:** suma `99623158984a8313` zgodna, 30 472 → 25 961 B, 16 wierszy,
  **0 wierszy nietykalnych w zabranym zbiorze**; nagłówek sekcji i wiersz nagłówkowy tabeli zostały.
- **Kompresja komórek „Mitygacja" nie ruszyła — i to jest dowód negatywny.** Sekcja ryzyk PolyFlow
  jest ponad progiem (26,2 KB przy 12 KB), ale ani jedna komórka o statusie z zamkniętej listy nie
  przekracza 800 znaków. Sprawdzone na **dwóch** wersjach pliku: dzisiejszej i sprzed skrócenia
  tabeli przez właściciela (`8a37e84^`, sekcja 39,4 KB) — tam jedyna komórka ponad limitem (912
  znaków) ma status `OTWARTE`, a tych automat nie rusza.
- **Pytanie partiami po cztery, materiał spreparowany** (kopia dokumentów PolyFlow, próg obniżony
  z 30 na 5 dni; PolyFlow nietknięty): **13 spraw przeterminowanych z 32 otwartych, 4 partie —
  4 + 4 + 4 + 1**. Zadana partia pierwsza, trzy wybory na sprawę. Po zapisaniu dwóch adnotacji
  rozstrzygnięcia rdzeń przeliczył od razu: 32 → 30 otwartych, 13 → 11 przeterminowanych, 4 → 3
  partie.
- **Adnotacja odroczenia z licznikiem:** `*(odroczone 2026-09-01, odroczeń: 1)*` → licznik 1, potem
  2, potem 3. Zegar przesunięty, sprawa **nie zamknięta**: data pozycji została datą pierwszego
  wystąpienia (2026-08-18), `wiek` nadal 14 dni, `wiekOdOdroczenia` 0, `przeterminowana` false,
  a pozycja **nadal na liście otwartych**; przeterminowanych 11 → 10. Adnotacja bez licznika
  nie jest czytana — brzmienie jest zamknięte, zgodnie ze specyfikacją.
- **Zero regresji ciszy:** to repozytorium po wydaniu, po rotacji i po tym wpisie dostaje z obu
  hooków startu **0 znaków**. Projekt kontrolny — **5 linii przy limicie 6**.
- **Guardrail po poprawce, trzy warianty indeksu:** `PASSWORD=` z wartością → kod 1 i **commit nie
  powstaje**; czysty indeks → kod 0; zdanie dokumentacji o guardrailu → kod 0. Wzorzec stary myli
  się **1 raz na 9** przypadków, nowy **0 razy**.
- **Katalog progów zgadza się ze stanem po wydaniu:** 17 wierszy, 15 z adresem egzekwowania,
  1 „brak automatu" (propozycja kompresji lekcji), 1 „nie dotyczy" (cel rotacji).

**Świadomie odłożone:**

- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — obie należne, obie poza zakresem
  tego etapu. Raport startu tamtego projektu mówi o nich przy każdym uruchomieniu.
- **60 martwych linków w sekcji „Czeka na człowieka" PolyFlow** — pozostałość po rotacjach sprzed
  1.7.0. Naprawa to osobna operacja na cudzych pozycjach, nie skutek uboczny aktualizacji.
- **Trzy zamknięcia spraw z partii pierwszej** zostały w materiale spreparowanym. Decyzja
  właściciela: to była próba, PolyFlow zostaje bez zmian w sekcji spraw.

**Do zrobienia przez człowieka:**

- **Poszerzyć zamkniętą listę rdzeni rozstrzygnięcia albo przepisać adnotacje w PolyFlow.**
  Zmierzone: **7 z 32 pozycji** (22%) wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte — `zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą. Poszerzenie listy jest
  decyzją projektową, nie poprawką: fałszywe rozpoznanie chowa sprawę człowieka w archiwum.

### 2026-09-01 — PLAN HIGIENA_DOKUMENTOW ZAMKNIĘTY: dowiezione vs plan

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

**Co miało powstać.** Plan powstał ze zgłoszenia z sesji roboczej PolyFlow: mechanizm rotacji
i progów był kompletny, ale w projekcie prowadzonym cztery miesiące nie odezwał się **ani razu** —
dziennik doszedł do 862,7 KB przy progu 150 KB. Sześć etapów miało to naprawić w sześciu miejscach,
w których mechanizm nie bronił się sam.

**Co powstało — etap po etapie:**

- **E1 — rotacja rusza.** Wpis linkowany z otwartej sprawy człowieka przestał być nietykalny; jego
  link jest przepinany na plik archiwum w fazie 2, po zgodności sum. Zakres rotacji PolyFlow
  **0 → 117 wpisów ze 127**.
- **E2 — blokada mówi, próg nie kłamie.** Trzy wagi dokumentu (całkowita, część rotowalna, dolna
  granica osiągalna) podawane razem z progiem; komunikat zatkanej rotacji wypisuje pary
  „pozycja → wpis". Stary komunikat **milczał**, gdy rotacja brała 2 z 87 wpisów.
- **E3 — sprawa przeterminowana wymusza decyzję.** Wiersz `Przegląd spraw człowieka` z progiem
  30 dni i **własnym wyłącznikiem**, wykrycie w hooku startu, pytanie partiami po cztery.
- **E4 — każdy próg ma adres.** Drugi wyzwalacz raportu startu i sekcja „Katalog progów":
  17 progów, 15 z adresem egzekwowania. Wcześniej `LEKCJE.md` ważące 52 KB przy progu 50 KB nie
  odezwałoby się ani razu.
- **E5 — ryzyka i ustawienia schodzą do archiwum.** Kompresja komórki „Mitygacja" z dosłownym
  cytatem zamiast parafrazy i rotacja `USTAWIENIA.md` z pięcioma wierszami nietykalnymi z nazwy.
- **E6 — pomiar na realnych projektach i wydanie 1.7.0.** To, czego E1–E5 nie miały: pomiar **po
  wydaniu, w świeżej sesji, w zainstalowanym pluginie, na cudzym projekcie**.

**Co przepadło albo zmieniło kształt — trzy aneksy i jeden dołożony:**

- **Aneks A** — wartość `N = 30 dni` i wyłącznik przeglądu osobny od rotacji; rozstrzygnięcie
  człowieka przed startem E1.
- **Aneks B** — zakres E4 rozszerzony o progi sekcji i jawny katalog progów; powód wyszedł
  z rotacji `LEKCJE.md` w rytuale zamknięcia sesji.
- **Aneks C** — kryterium E5 „sekcja ryzyk PolyFlow schodzi pod 12 KB" **było arytmetycznie
  nieosiągalne** i zostało zamienione na dowód działania mechanizmu. Powód policzony przed
  implementacją: 62 ryzyka, **0 zamkniętych**, cała kolumna „Mitygacja" waży 22,0 KB, więc jej
  wyzerowanie zostawiłoby 17,5 KB. To nie kronika w komórkach, tylko liczba żywych ryzyk — a jej
  skrócenie jest decyzją człowieka, nie operacją automatu.
- **Aneks D** — poprawka guardraila, dołożona w trakcie E6, bo guardrail zatrzymał commit wydania
  na zdaniu specyfikacji opisującym jego samego.

**Zweryfikowane — jak dokładnie:**

- **Dowiezione 6 etapów z 6.** Wszystkie cztery bramki manualne planu rozstrzygnięte; obie odnogi
  domknięte — `BLOKADA_ROTACJI` wchłonięta przez E1, `REJESTR_ARTEFAKTOW` zamknięta rejestrem
  38 artefaktów.
- **Cel planu osiągnięty na dwóch projektach z trzech.** PolyFlow: dziennik **183,1 → 147,3 KB**,
  ustawienia **29,8 → 25,4 KB**, wersja struktury 1.7.0. RelAI: dziennik **155,6 → 74,1 KB**,
  warstwa startowa **55,3 KB / 80 KB**, raport startu **0 znaków**. JiraManager (386 KB startu)
  **nie został tknięty** — decyzja właściciela, projekt jest w ciągłym rozwoju.
- **Mechanizm zmierzony na cudzym materiale, nie na własnym.** Każdy z sześciu etapów kończył się
  liczbą z realnego projektu, nie z instrumentu na kopii — poza E6, który dołożył brakujący
  składnik: przebieg w żywej sesji po restarcie aplikacji.

**Świadomie odłożone:**

- **Zamknięcie sekcji ryzyk PolyFlow pod próg** — 62 ryzyka otwarte, 0 zamkniętych. Odchudza ją
  wyłącznie zamknięcie ryzyk albo podniesienie progu; obie rzeczy są decyzją człowieka (Aneks C).
- **Rotacja lekcji i rotacja ryzyk `ZAMKNIĘTYCH` w PolyFlow** — należne, poza zakresem E6.

**Do zrobienia przez człowieka:**

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — bramka
  **świadomie zostawiona otwarta** przy zamykaniu planu, przeniesiona do `STATE.md`, sekcja
  „Co dalej", żeby nie zginęła razem z folderem planu w archiwum.

### 2026-09-01 — IKONY KOMEND CZYTELNE NA OBU MOTYWACH GITHUBA

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

Zgłoszenie ze zrzutu ekranu: dziesięć ikon w sekcji „Komendy" README jest na ciemnym motywie
przeglądarki nieczytelnych. Przyczyna zmierzona w plikach, nie zgadnięta: główny kształt każdej
ikony rysuje tusz `#312c25`, który wobec tła GitHub dark (`#0d1117`) daje kontrast **1,08:1** —
kreska fizycznie znika, zostaje sam pomarańcz.

Wybór między dwoma zestawami przełączanymi przez `<picture media="(prefers-color-scheme: dark)">`
a jednym zestawem uniwersalnym rozstrzygnął człowiek: **jeden zestaw**. Powód odrzucenia
`<picture>`: przełącznik czyta ustawienie systemu, a nie motyw GitHuba, więc użytkownik z ciemnym
GitHubem na jasnym systemie dostałby dokładnie dzisiejszy problem — plus dwa razy więcej plików do
utrzymania.

Zmiana jest chirurgiczna: **geometria, grubości kresek i kompozycja bez zmian**, ruszone wyłącznie
kolory i tryb rysowania.

- **Tusz `#312c25` → `#8a7f70`** we wszystkich dziesięciu plikach. Ciepła szarość z tej samej
  rodziny barwnej, dobrana tak, by mieścić się w oknie kontrastu ≥3:1 wobec **obu** teł naraz.
- **`opacity=".55"` na liniach pomocniczych zniknęła** — przezroczystość liczy się względem tła,
  więc na ciemnym schodziła do ~2,3:1. Hierarchię niesie teraz `stroke-width="2.2"` przy 2.6 linii
  głównej: ta sama różnica, ale niezależna od tła.
- **Kremowe wypełnienie lupy w `audit.svg` usunięte** (`fill="none"`) — na ciemnym tle była to
  jasna plama. Kremowy trójkąt w `stage.svg` **zostaje**: leży w całości na pomarańczowym dysku,
  więc tła strony nie dotyka.
- **Żółty `#d9a134` → `#b8862a`** w `changelog.svg` — jedyny kolor marki, który wypadał z okna
  (2,31:1 na jasnym tle).
- **Martwy element usunięty** z `adopt.svg`: `<path d="M20 39h5" opacity="0">` nie rysował nic.

Pomarańcz `#c4643c` i zieleń `#5f8a68` zostały bez zmian — pomiar pokazał, że obie już mieściły
się w oknie, więc nie było czego naprawiać.

**Zweryfikowane — jak dokładnie:**

- **Kontrast policzony skryptem** (WCAG, luminancja względna) dla każdego koloru występującego
  w plikach, wobec trzech teł: `#ffffff`, `#0d1117` (GitHub dark) i `#22272e` (GitHub dark dimmed).
  Wynik: `#8a7f70` **3,92 / 4,82 / 3,83**, `#c4643c` **4,01 / 4,72 / 3,75**, `#5f8a68`
  **3,95 / 4,80 / 3,81**, `#b8862a` **3,24 / 5,84 / 4,64** — wszystkie ≥3:1 na wszystkich trzech.
  `#fffdf7` wypada wobec bieli (1,02:1), ale występuje wyłącznie na pomarańczowym dysku, gdzie daje
  3,94:1.
- **Render obu motywów obok siebie** — headless Chrome, `--force-device-scale-factor=2`, wszystkie
  dziesięć ikon w rozmiarze 48 px i w realnym rozmiarze README (24 px), na `#ffffff` i `#0d1117`.
  Obejrzane: każda ikona czytelna w obu kolumnach, żadna nie gubi elementu.
- **Grep kontrolny po podmianie**: zero wystąpień `#312c25` i zero atrybutów `opacity` w katalogu
  ikon; `#fffdf7` wyłącznie w `stage.svg`, w jednej linii.
- Plik podglądu był tymczasowy i **został usunięty** — `git status` pokazuje wyłącznie dziesięć
  zmienionych SVG.
- **Sprawdzone na żywym GitHubie po wypchnięciu**, bo użytkownik zgłosił, że nadal widzi stary
  stan. Commit `c07197f` na `origin/main`, drzewo czyste. Pliki **pobrane z
  `raw.githubusercontent.com`** niosą nową paletę (`#8a7f70` ×19, `#c4643c` ×18, `#5f8a68` ×3,
  `#b8862a` ×1, zero `#312c25`). `git ls-files` zna dokładnie jeden komplet ikon — kopii nie ma.
  W DOM wyrenderowanego README dziesięć obrazów, wszystkie z `complete: true` i adresem
  `/nowilus/relai/raw/main/docs/zasoby/branding/ikony/…`. Render w warunkach GitHuba wykonany
  **na plikach pobranych z GitHuba**, nie na lokalnych.
- **Przyczyna zgłoszenia: cache przeglądarki.** GitHub podaje te SVG z `Cache-Control: max-age=300`.
  Po `Ctrl+Shift+F5` użytkownik potwierdził, że jest wyraźniej.

**Świadomie odłożone:**

- **Banner i diagram nietknięte** — świadomy wybór zakresu. Banner był ruszany poprzednim commitem,
  a obie grafiki mają osadzone fonty i budują się skryptem `zbuduj.js`, więc to inna robota niż
  dziesięć małych plików. Ich kontrast na ciemnym tle **nie był mierzony**.
- **Ikony nie wchodzą do `ARTEFAKTY.md`** — rejestr obejmuje instrukcje czytane przez model
  (specyfikacje, komendy, skille, reguły), a grafika brandingowa nią nie jest.
- **Grubość kreski nietknięta**, mimo że pomiar na żywym README pokazał drugą, niezależną od koloru
  przyczynę bladości: ikona nie ma tam 24 px. Zmierzone w DOM: **23 px przy szerokim oknie i 17 px
  przy węższym**, bo `max-width:100%` ściska ją do szerokości kolumny tabeli. Kreska 2,6 przy
  `viewBox` 48 daje wtedy 1,25 px i **0,92 px** — poniżej piksela, więc przeglądarka rozmywa ją
  antyaliasingiem. Zmiana proporcji rysunku wymaga zgody, więc czeka jako pozycja niżej.

**Do zrobienia przez człowieka:**

- **Zdecydować, czy podbić grubość kreski ikon z 2.6 na 3.2** (linie pomocnicze 2.2 → 2.8).
  Zysk: 1,53 px zamiast 1,25 px przy realnych 23 px renderowania. Koszt: zmiana proporcji rysunku,
  czyli ingerencja w stylistykę, której poprawka kontrastu świadomie nie ruszała. Alternatywa bez
  ruszania grafiki: scalić kolumnę ikony z kolumną komendy w README, żeby komórka przestała ściskać
  obraz do 17 px na węższym oknie.

### 2026-09-03 — PLAN SPRZATANIE_ARTEFAKTOW: jedno miejsce na pliki robocze etapu i cztery momenty sprzątania

Autor: RelAI (Fable) + Lukasz

**Zrobione:**

- **Plan `docs/plany/SPRZATANIE_ARTEFAKTOW/` — `PLAN.html` (249 KB z osadzonymi fontami) + `STATUS.md`
  (`DO AKCEPTACJI`), cztery etapy, 5–7 sesji (SZACUNEK), wydanie jako 1.8.0.** Powód: porządki
  w PolyFlow z tego samego dnia — ~340 MB artefaktów poza Gitem w folderze projektu i 211 MB
  w 43 pozycjach w `%LOCALAPPDATA%\Temp` (FAKT), wszystko z etapów zamkniętych 2026-08-10…09-02.
  Luka w rdzeniu: `SPEC_PROMPT_ETAPU.md` linie 129 i 255 mówią „brak plików tymczasowych”
  wyłącznie o repo, więc każdy etap ten punkt zaliczał.
- **Wybrany mechanizm (wariant A):** narzędzie w rdzeniu `core/process/work-artifacts.js` (Node,
  jeden plik, biblioteka + CLI, bez zależności), prowizjonowane do `.claude/relai/tools/clean-work.js`
  tą samą drogą co specyfikacje; komenda `/relai-clean` w konwencji `/relai-backup`; hook startu
  z jedną linią `[RelAI artefakty robocze]` ponad progiem z wiersza `Artefakty robocze` w USTAWIENIA;
  krok **2a** rytuału zamknięcia (numeracja 1–6 zostaje, bo „krok 2” jest cytowany jako adres
  rotacji); punkt weryfikacji etapu w miejsce martwego. Odrzucone z powodem: sama procedura
  w Markdown (dziś kosztowała trzy blokady i `WinError 5`), skrypt PowerShell/Python (D-40, P-003),
  automatyczne kasowanie w hooku (D-18).
- **Rozstrzygnięcia z wywiadu (AskUserQuestion, jedna runda):** katalog roboczy etapu
  w projekcie — `.claude/relai/work/<TEMAT>/E<N>/` (gitignorowany, poza backupem, w zasięgu sesji,
  bez bramki „poza projektem”); pliki nieśledzone i ignorowane w repo **są** w zakresie, ale
  lokalne notatki właściciela dostają flagę w chwili decyzji o nieśledzeniu — linia-marker
  `# relai: zachowaj` nad wzorcem w `.gitignore`, cały `.git/info/exclude` jako chroniony, a bez
  gita `.claude/relai/keep`. Pliki śledzone przez gita nigdy nie są kandydatami (nie-cel).
- **`CLAUDE.md`:** linia `Aktywny plan` wskazuje nowy plan; wiersz w „Stanie prac”. **`STATE.md`:**
  nowy obszar w „Nad czym pracujemy teraz”.

**Zweryfikowane — jak dokładnie:**

- `PLAN.html` zbudowany builderem z `.claude/relai/templates/HTML_PLAN/` (6 reguł `@font-face`,
  „plan bez symulatora — znacznik usunięty”); kontrola skryptem: 10 sekcji, 0 żądań `http` w
  `src`/`href`/`url()`, 22 bloki zwijalne z unikalnymi `aria-controls`. Otwarty w przeglądarce
  przez lokalny serwer (`file://` odmówił): 6 fontów załadowanych, brak przewijania w poziomie
  (scrollWidth 625 przy oknie 640), kliknięcie bloku przełącza `aria-expanded`.
- `fs.rmSync(recursive, force, maxRetries)` na Node 24.13.1 usuwa katalog z plikiem tylko do
  odczytu bez `onerror` — sprawdzone w `%TEMP%` przed napisaniem wariantu A (katalog testowy
  skasowany w tym samym poleceniu).
- `%LOCALAPPDATA%\Temp` po porządkach właściciela: 0 pozycji `relai-*` / `polyflow*` — plan
  startuje od zera, E4 musi wytworzyć materiał pomiarowy.
- Nie weryfikowano: zachowania bramki hooka blokującej `rm -rf` wobec `node …clean-work.js`
  (ryzyko 7 planu, test w E1).

**Świadomie odłożone:**

- Fragmenty planu i skrypt wypełniający powstały w `.claude/relai/work/_sesja/2026-09-03/` —
  dogfooding lokalizacji, zanim mechanizm istnieje; skasowane na koniec sesji (utworzone w tej
  sesji, D-18 nie dotyczy).
- Ikona `clean.svg` i grubość kreski ikon (17–23 px) — sprawa 3 sekcji 9 planu, razem z otwartą
  pozycją „Czeka na człowieka”.
- `PROMPT_ETAP_1.md` nie powstaje przed akceptacją (D-34).

**Do zrobienia przez człowieka:**

- **Akceptacja planu SPRZATANIE_ARTEFAKTOW** — po niej sekcje 1–9 zamrożone, powstaje
  `PROMPT_ETAP_1.md`, start świeżą sesją Opus i `/relai-stage`.
- **Brzmienie markera „zachowaj”** (`# relai: zachowaj` / `# relai: keep`, `.git/info/exclude`
  chroniony w całości) — blokuje E1.
- **Próg domyślny wiersza `Artefakty robocze`** — rekomendacja 100 MB; przed E2.

### 2026-09-03 — PLAN SPRZATANIE_ARTEFAKTOW ZAAKCEPTOWANY: marker „zachowaj”, próg 100 MB, E1 gotowy

Autor: RelAI (Fable) + Lukasz

**Zrobione:**

- **Plan zaakceptowany bez aneksów** — sekcje 1–9 `PLAN.html` zamrożone (D-33). Dwie sprawy sekcji 9
  rozstrzygnięte zgodnie z rekomendacją: marker `# relai: zachowaj` (EN `# relai: keep`) nad
  wzorcem w `.gitignore`, cały `.git/info/exclude` chroniony, bez gita `.claude/relai/keep`; próg
  domyślny wiersza `Artefakty robocze` **100 MB**. Zapisane w `STATUS.md` jako bramki manualne
  `ROZSTRZYGNIĘTA`; dwie zostają `OTWARTA` (ikona `clean.svg`, markery w PolyFlow).
- **`PROMPT_ETAP_1.md`** wygenerowany wg `SPEC_PROMPT_ETAPU.md`: dziewięć elementów, zasady aktywne
  przepisane w całości (15 pozycji), zakres w 11 punktach z eksportami narzędzia, listą scenariuszy
  testowych i próbą z żywej sesji, 16 punktów weryfikacji, rytuał „Na koniec” z generacją
  `PROMPT_ETAP_2`. Katalog roboczy etapu nazwany z góry: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E1/`.
- `STATUS.md`: `ZAAKCEPTOWANY 2026-09-03`, E1 `GOTOWY DO STARTU` z linkiem; `CLAUDE.md` i `STATE.md`
  zaktualizowane.

**Zweryfikowane — jak dokładnie:**

- Kolumna `Prompt` przy E1 wskazuje istniejący plik (siatka D-34 ma milczeć na starcie następnej
  sesji); linia „Aktywny plan” w `CLAUDE.md` prowadzi do istniejącego `STATUS.md`.
- Nie weryfikowano: treści promptu świeżą sesją — to zrobi E1.

**Świadomie odłożone:**

- Tabela „Stan prac” w `CLAUDE.md` ma siedem wierszy przy limicie pięciu z `SPEC_CLAUDE_MD.md`
  (plik 4,7 KB przy budżecie 10 KB) — porządek w tabeli przy zamknięciu któregoś z planów, nie
  teraz.

**Do zrobienia przez człowieka:**

- Uruchomić E1 w świeżej sesji **Opus**: `/relai-stage`. Punkty weryfikacji na PolyFlow wymagają
  `--add-dir "C:\Users\Lukasz\Desktop\PolyFlow"` albo osobnej sesji w tamtym folderze.
  *(rozstrzygnięte 2026-09-03 — E1 wykonany; punkt PolyFlow przeniesiony do bramek manualnych planu)*

### 2026-09-03 — E1: narzędzie rdzenia `work-artifacts.js` i komenda `/relai-clean`

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/process/work-artifacts.js`** — plik rdzenia w konwencji `secret-scan.js` (biblioteka + CLI,
  zero zależności, **zero `require` na inne pliki rdzenia**). Osiem eksportów: `slugProjektu`,
  `czytajMarkery`, `artefaktyRobocze`, `bramka`, `grupy`, `raport` (+ `raportTekst`), `kasuj`,
  `dopiszMarker`. Pomiar z trzech źródeł (`work` / `temp` / `repo`), limit `LIMIT_WPISOW = 20000`
  z flagą `niepelne`, zamknięta lista powodów ochrony, kasowanie `fs.rmSync(recursive, force,
  maxRetries)` z asercjami korzeni i ponownym pomiarem. CLI: `raport [--json]`, `kasuj <lista.json>`,
  `zachowaj <sciezka>`; kody wyjścia 0 / 1 / 2.
- **Prowizjonowanie** — `provisionTemplates` w `session-signals.js` kopiuje narzędzie do
  `<destRel>/tools/clean-work.js` (nowa funkcja `provisionTools`, licznik obejmuje plik). Sygnatura
  funkcji i brzmienie komunikatów hooków bez zmian, więc **oba adaptery dostały narzędzie za darmo**.
- **`core/MANIFEST.json`** — wpis `work-artifacts` w `process`, odwołanie w `uses` obu adapterów.
- **`adapters/claude-code/commands/relai-clean.md`** — komenda w konwencji `/relai-backup`: krok 0
  marker projektu, krok 1 obecność narzędzia (brak → prośba o restart, **nigdy ręczna kopia
  z pluginu**), raport, pytania **partiami po cztery** z trzema opcjami i odpowiedzią swobodną,
  lista składana **z pliku raportu**, kasowanie, wpis w dzienniku, podsumowanie, sekcja zakazów.
- **Skill `relai-core`** — sekcja „Pliki lokalne, których nie sprzątamy (od 1.8.0)" między
  „Zamknięciem sesji" a „Frazami naturalnymi": marker, `.git/info/exclude`, `.claude/relai/keep`
  i reguła stawiania markera **w tej samej edycji**, w której wzorzec trafia do `.gitignore`.
  Kroku 2a **nie** dołożono (to E2), numer wersji skilla bez zmian (to E4).
- **`docs/ARTEFAKTY.md`** — wiersz `/relai-clean` (wersja 1) i podbicie skilla `relai-core` do
  wersji 2; nagłówek sekcji komend z 10 na 11.
- **Poza planem, jedna linia:** `core/tools/validate-adapters.js` wypisuje teraz **nazwy** plików
  rdzenia w odwołaniach adaptera, nie samą liczbę — bez tego punkt weryfikacji „wypisuje
  `work-artifacts.js`" był niesprawdzalny (L-0058).

**Zweryfikowane — jak dokładnie:**

- **15 z 16 punktów weryfikacji przeszło.** `node core/tools/validate-adapters.js` → kod 0, wiersz
  `adapter claude-code: 4 odwolan do rdzenia (templates, secret-scan.js, session-signals.js,
  work-artifacts.js)` i identyczny dla Cursora.
- **Prowizjonowanie**: hook `session-context` uruchomiony z payloadem `SessionStart` na kopii
  projektu → licznik **31 → 32**, `clean-work.js` obecny, SHA-256 po normalizacji CRLF → LF
  **identyczny** ze źródłem (`bc77ce96…faf6c`). Kopia **nie ma** katalogu `core/`, a
  `node clean-work.js raport --json` kończy się w niej **kodem 0** — dowód samowystarczalności.
- **Testy narzędzia: 25 scenariuszy, 25 przeszło, 0 nie przeszło** (skrypt
  `test-work-artifacts.js`, wyrażenia regularne w pliku, materiał budowany przez skrypt). Dowody
  negatywne: plik śledzony poza kandydatami **i obecny na dysku**; `smieci-lokalne` bez markera →
  kandydat, ten sam wzorzec z markerem → `zachowaj`; CRLF i LF w `.gitignore` w jednym przebiegu;
  `inny-projekt-e1` niewidoczny w TEMP **i obecny na dysku**.
- **Klon repozytorium** z obiektami Gita tylko do odczytu: `14 923 442 B → 0 B`, zero niepowodzeń,
  katalog nie istnieje po operacji. **Odmowy**: katalog domowy i `.git` projektu → dwie odmowy
  z powodem, zero skasowanych, `.git` **31 plików przed i 31 po**. **Junction** wskazujący poza
  kandydata: dowiązanie zniknęło, cel **2 pliki przed i 2 po**.
- **Limit wpisów**: katalog 25 000 plików → `niepelne: true`, pomiar **1 324 ms**. Repozytorium
  czyste po sprzątaniu: pomiar **86 ms** (punkt odniesienia dla limitu hooka w E2).
- **Sekrety**: raport JSON z materiału testowego ma **0 wystąpień** wartości kontrolnej
  z `.env.test`, a pozycja `.env.test` stoi wśród chronionych z powodem `sekret`.
- **Przebieg na żywo** (punkt 7): komenda skopiowana na czas próby do `.claude/commands/`
  (droga zanotowana; kopię usunięto po próbie, żeby nie mierzyć w E4 cienia zamiast pluginu).
  Raport: **8 grup**, 9 pozycji chronionych → **2 wywołania `AskUserQuestion`** przy
  ⌈8/4⌉ = 2. Skasowano 8 pozycji, zero niepowodzeń. Marker „zostaw na zawsze" dowiedziony
  w **kopii** projektu: diff `.gitignore` = **1 linia dodana**, reszta pliku bajt w bajt bez zmian;
  `.gitignore` tego repozytorium **nietknięty** (`git diff .gitignore` pusty).
- **Bramka hooka (ryzyko 7 planu): przeszła.** `node .claude/relai/tools/clean-work.js kasuj
  <lista>` uruchomione narzędziem `Bash` z katalogu projektu, z pozycją w `os.tmpdir()`, skasowało
  ją i zakończyło się **kodem 0** — żaden komunikat bramki nie padł. Ścieżka „narzędzie wypisuje
  listę do ręcznego skasowania" jest zaimplementowana i pokryta testem kodu wyjścia, ale
  **nie została wywołana przez realną blokadę** — to zostaje niezmierzone.
- **Sprzątanie po etapie**: raport → potwierdzenie → `kasuj`, 11 pozycji, **0,59 MB / 25 121 plików
  przed, 0 B po**, zero niepowodzeń. `%TEMP%` bez pozycji `relai-*` i bez `inny-projekt-e1`;
  `.claude/relai/work/` puste.
- **Wersja nie podbita**: `MANIFEST.json`, `plugin.json`, `marketplace.json` mają `1.7.0`.
  `git grep -nE "rm -rf|shutil|Remove-Item"` w komendzie i narzędziu → **0 trafień**.
- **Hook `profile-rules`** ostrzegł o niezarejestrowanym artefakcie przy zapisie komendy i
  **zamilkł** po dopisaniu wiersza do `ARTEFAKTY.md` — kolejna edycja tego pliku przeszła bez
  ostrzeżenia.
- **Punkt weryfikacji `git grep "relai: zachowaj"` wymagał poprawki instrumentu, nie produktu:**
  bez `--untracked` polecenie nie widzi plików, które ten etap dopiero utworzył (L-0076). Z flagą
  zwraca dziewięć plików: plan, prompt, `STATUS.md`, narzędzie, komendę, skill oraz `ARTEFAKTY.md`,
  `DZIENNIK.md` i `STATE.md`, które opisują samo rozstrzygnięcie. Trzy ostatnie nie były wypisane
  w prompcie, bo powstały po jego wygenerowaniu.

**Świadomie odłożone:**

- **Katalog roboczy etapu skasowany razem ze skryptami testowymi** — zgodnie z decyzją właściciela
  i regułą planu. `test-work-artifacts.js` i `test-prowizjonowanie.js` nie wejdą do repozytorium;
  E2 buduje własne instrumenty. Treść dowodów została w tym wpisie.
- **Kolejność powodów ochrony**: `etap trwa` sprawdzane **przed** `sekret`, odwrotnie niż w tabeli
  sekcji 5 planu. Obie odpowiedzi chronią tak samo — zmienia się wyłącznie etykieta, a przy katalogu
  etapu w toku „etap trwa" mówi człowiekowi więcej. Nie zgłaszam tego jako aneksu, bo nie zmienia
  ani zakresu ochrony, ani listy powodów.
- **`opisane` nie dziedziczy się po katalogu rodzica** — chroni ścieżkę pozycji, a nazwę katalogu
  najwyższego poziomu tylko wtedy, gdy pozycja **sama nim jest**. Inaczej `.claude` wymienione
  w `README.md` chroniłoby cały katalog roboczy, a plan wprost zakłada, że `tools/cache/` jest
  kandydatem, mimo że `tools/` jest opisane (sekcja 9, sprawa 4).
- **Junction na inny dysk i ścieżka dłuższa niż limit Windows** — niezmierzone; ryzyko S2 zostaje
  otwarte z tym zapisem.

**Do zrobienia przez człowieka:**

- **Raport `/relai-clean` na PolyFlow** — jedyny punkt weryfikacji E1, który nie przeszedł.
  Wymaga sesji z dostępem do `C:\Users\Lukasz\Desktop\PolyFlow` (osobna sesja w tamtym folderze
  albo `--add-dir`). Wyłącznie **odczyt raportu**, bez kasowania: `tools/` ma nie wystąpić w żadnej
  grupie (śledzone), `benchmark/` ma stać wśród chronionych z powodem `opisane` i wskazaniem
  `CLAUDE.md` z linią, `tools/cache/` ma być kandydatem. Zapisane jako bramka manualna planu;
  termin najpóźniej razem z E4.

### 2026-09-03 — E2: jedno zdanie na starcie sesji i krok 2a rytuału zamknięcia

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/process/session-signals.js`** — dwie funkcje jako **cienka warstwa** nad narzędziem z E1,
  bez drugiej implementacji pomiaru (P4). `artefaktyRobocze(cwd, opcje)` czyta wiersz `Artefakty
  robocze` z ustawień (kotwica + próg w MB), woła `work-artifacts.js` **wyłącznie ze źródeł `work`
  i `temp`** — `git status --ignored` na start sesji nie wchodzi — i zwraca
  `{wlaczone, progMB, suma, sumaMB, pozycji, najciezsze[3], niepelne, czas}`. Suma liczy
  **kandydatów**, nie wszystkie pozycje: katalog etapu w toku ani pozycja z markerem nie podnoszą
  raportu, po którym nie ma czego zrobić. `artefaktyRoboczeReport(miara, opcje)` zwraca **tablicę
  jednej linii albo pustą**, z opcją `interaktywna` jak `startCostReport`.
- **Własna para wzorców przełącznika** — `ARTEFAKTY_WLACZONE` / `ARTEFAKTY_WYLACZONE`. Nazwa wiersza
  jest w liczbie mnogiej, więc przełącznik brzmi `włączone`, a wspólne `WLACZONY` w rdzeniu zna
  wyłącznie `włączony` / `włączona` (L-0079). Wzorce są lokalne — brzmienia czytane przez budżet,
  rotację i przegląd spraw zostały nietknięte.
- **Oba hooki `session-context`** (Claude Code i Cursor) — wywołanie obok istniejących raportów.
  **Kolejność w raporcie startu jest świadoma:** zadania (`ZADANIE PIERWSZE`) → budżet i progi
  dokumentów → sprawy przeterminowane → **artefakty robocze na końcu**, bo to jedyny blok, który
  niczego nie wymaga, tylko proponuje komendę. Cursor przekazuje
  `interaktywna: input.is_background_agent !== true`.
- **`core/templates/SPEC_USTAWIENIA.md`** — sekcja „Wiersz `Artefakty robocze` (od 1.8.0)" z kotwicą,
  zamkniętą listą brzmień, zachowaniem przy wartości nierozpoznanej i regułą „suma z kandydatów";
  **wiersz 18** katalogu progów (17 → 18); lista nietykalnych w rotacji ustawień **pięć → sześć**;
  tabela wierszy czytanych maszynowo **cztery → pięć**; wiersz w tabeli wpisów tworzonych przy
  inicjalizacji (wartość domyślna bez pytania, jak trzy poprzednie).
- **`docs/USTAWIENIA.md`** — wiersz `| 2026-09-03 | Artefakty robocze | włączone · 100 MB |`.
- **Krok `2a` rytuału zamknięcia** w skillu `relai-core` i w regule `relai-core.mdc`: po rotacji,
  przed wpisem do dziennika. Numer `2a`, a nie `3`, bo „krok 2" jest cytowany jako adres rotacji
  w jedenastu miejscach. Krok pyta **wyłącznie** o katalogi etapów i odnóg zamkniętych oraz o całość
  ponad progiem, partiami po cztery, i **nie produkuje własnego komunikatu** poza wpisem sesji.
- **Linia fraz sesji** — `core/templates/SPEC_CLAUDE_MD.md` (oba miejsca) i `CLAUDE.md` tego
  repozytorium: „kończymy na dziś" → … przegląd ryzyk, **sprzątanie artefaktów roboczych**,
  propozycja commita.
- **`docs/ARTEFAKTY.md`** — cztery podbicia wersji: `SPEC_USTAWIENIA.md` → 2, `SPEC_CLAUDE_MD.md` → 2,
  skill `relai-core` → 3, reguła `relai-core.mdc` → 2. `session-signals.js` i hooki są nośnikiem
  i do rejestru nie wchodzą.

**Zweryfikowane — jak dokładnie:**

- **Testy rdzenia i obu hooków: 29 scenariuszy, 29 przeszło** (`test-e2.js`, wyrażenia regularne
  w pliku, materiał budowany przez skrypt). Pierwszy przebieg dał **15 czerwonych na jednej
  przyczynie** — brzmienie `włączone` poza wzorcem (L-0079); po poprawce 28/29, po zdjęciu pauzy
  z linii raportu 29/29.
- **Cisza poniżej progu jest nienaruszalna.** Hook startu na tym repozytorium po sprzątaniu
  (payload `SessionStart` przez stdin, `work/` puste, `%TEMP%` bez pozycji `relai-*`) — pełne
  wyjście, **zero** wystąpień `[RelAI artefakty robocze]`:

  ```
  [RelAI session-context]
  Data dzisiejsza: 2026-09-03. Daty do wpisow bierz stad, nie z pamieci modelu.
  Ten folder to projekt RelAI. Zanim odpowiesz merytorycznie, wykonaj rytual startu sesji: (…)
  Specyfikacje dokumentow RelAI sa skopiowane lokalnie do .claude/relai/templates/ (32 plikow). (…)
  Ustawienia globalne uzytkownika (~/.claude/relai/USTAWIENIA.md; (…)):
  # USTAWIENIA — preferencje globalne
  (…tabela dwóch wierszy ustawień globalnych…)
  ```

  Mocniejszy wariant tej samej ciszy padł **przed** sprzątaniem: przy **141,2 MB** materiału
  w katalogu etapu **w toku** hook też milczał — ochrona `etap trwa` trzyma, a nie tylko pusty
  katalog.
- **Powyżej progu pada dokładnie jedna linia** (fixture 105 MB w pięciu pozycjach):

  ```
  [RelAI artefakty robocze] Katalogi robocze i pliki tymczasowe tego projektu waza 105.0 MB w 5 poz.
  przy progu 100 MB. Najciezsze: .claude/relai/work/A/E1 40.0 MB (nieznane); .claude/relai/work/B/E1
  30.0 MB (nieznane); .claude/relai/work/C/E1 20.0 MB (nieznane); pozostale: 2 poz. Zaproponuj
  uzytkownikowi komende /relai-clean - pokaze raport w grupach i skasuje wylacznie po potwierdzeniu grupy.
  ```

  Trzy pozycje z nazwy, reszta jako liczba, linia bez znaku nowej linii i **czysto ASCII**.
- **Oba warianty w jednym przebiegu** (zasada 4): ten sam materiał, wiersz `włączone` → jedna linia;
  wiersz `wyłączone` → zero linii, a **pozostałe wyjście hooka identyczne bajt w bajt** (porównanie
  po odjęciu tej jednej linii).
- **Wartość nierozpoznana nie milczy:** `tak · 100 MB` → jedna linia z brzmieniami
  `wlaczone / wylaczone (on / off)`, i pada **także poniżej progu** (materiał 5 MB). **Brak wiersza
  → cisza** mimo 120 MB materiału. `off` i `on · 250 MB` rozpoznane; człon pominięty daje próg 100.
- **Sesja nieinteraktywna** (Cursor, `is_background_agent: true`) → ta sama linia **bez** propozycji;
  wariant `false` → z propozycją, oba w jednym przebiegu.
- **Czas — cel spełniony.** `artefaktyRobocze` (źródła `work` + `temp`, mediana z 5 przebiegów):
  projekt bez katalogu roboczego **35 ms**; katalog **30 MB / 3 000 plików — 116 ms** przy celu
  **< 300 ms** (`FAKT`, 2026-09-03); katalog **20 500 plików — 720 ms** z `niepelne: true`.
  `LIMIT_WPISOW` został na 20 000 — obniżanie nie było potrzebne. Dla porównania to samo wywołanie
  ze źródłem `repo`: **77 ms** na czystym repo, ale **2 152–2 335 ms** na materiale z E1 — dlatego
  hook tego źródła nie woła.
- **Krok 2a nie przenumerował rytuału** (dowód negatywny): `git grep` po `krok 2 | kroku 2 | step 2`
  w skillu, regule Cursora i specyfikacjach — **11 odwołań w HEAD, te same 11 w drzewie roboczym**,
  co do treści; przybyły wyłącznie dwa zdania mówiące o samym kroku 2a.
- **Wiersz ustawień czytany maszynowo:** `core.artefaktyRobocze` na realnym `docs/USTAWIENIA.md`
  tego repozytorium zwraca `wlaczone: true, progMB: 100` — sprawdzone wywołaniem funkcji, nie okiem.
- **Liczby w specyfikacji:** katalog progów **18 wierszy danych**, lista nietykalnych **6 pozycji** —
  policzone `awk`-iem na pliku.
- **`node core/tools/validate-adapters.js` → kod 0**, oba adaptery po 4 odwołania do rdzenia.
- **Wersja nie podbita:** walidator melduje „numery wersji: 3 zrodel, wartosc 1.7.0"; wszystkie
  trafienia `1.8.0` siedzą w planie, promptach, skillu, regule, hookach, rdzeniu, specyfikacji
  i dokumentach — żadne w `MANIFEST.json`, `plugin.json`, `marketplace.json`.
- **Hook `profile-rules` milczy** po wpisach do rejestru — sprawdzone wywołaniem hooka z payloadem
  `PostToolUse` dla każdego z czterech artefaktów: cztery razy cisza.
- **Sprzątanie po etapie:** raport → potwierdzenie właściciela → `kasuj`. **141,2 MB / 1 pozycja
  przed, 0,0 MB po**, zero niepowodzeń; `.claude/relai/work/` puste, `%TEMP%` bez pozycji `relai-*`.
  Pięć pozycji chronionych (`templates` powodem `opisane / README.md:150`, reszta jako
  `zaleznosci / narzedzia`) nietkniętych.

**Punkt weryfikacji, który nie przeszedł w brzmieniu dosłownym — i decyzja:**

- **„Pełny zestaw przekroczeń mieści się w sześciu liniach raportu startu".** Policzone na projekcie
  kontrolowanym (budżet + progi dokumentów + 6 spraw przeterminowanych + 110 MB artefaktów):
  **14 linii** raportu. Rozkład: `startCostReport` **5 linii przy własnym limicie 6** (nienaruszony),
  `[RelAI przeglad spraw]` **8 linii** (nagłówek + 5 spraw + „i N dalszych" + ZADANIE — mechanizm
  z 1.7.0), `[RelAI artefakty robocze]` **1 linia**. Ten sam materiał **bez** wiersza `Artefakty
  robocze`, czyli stan sprzed tego etapu: **13 linii**. Wkład E2 to dokładnie jedna linia, czyli to,
  czego wymaga mitygacja ryzyka 8 planu; kryterium w brzmieniu „całość w sześciu" było arytmetycznie
  nieosiągalne, zanim etap się zaczął.
- **Decyzja właściciela (2026-09-03): przyjąć i przeformułować.** Limit sześciu linii jest
  własnością raportu budżetu, nie sumy wszystkich bloków; ryzyko 8 mierzy się wkładem etapu.
  W kodzie nic nie zmieniono. Lekcja z tego pomiaru: **L-0080**.

**Świadomie odłożone:**

- **Katalog roboczy etapu skasowany razem ze skryptami pomiarowymi** (`test-e2.js`, `czas-e2.js`,
  `limit-linii.js`, `sonda-czasu.js`) — zgodnie z regułą planu i precedensem E1. Treść dowodów
  została w tym wpisie; E3 buduje własne instrumenty, jeśli będą potrzebne.
- **Przykład pełnego pliku ustawień w `SPEC_USTAWIENIA.md` nie dostał wiersza `Artefakty robocze`** —
  niesie linię `Wersja RelAI: 1.7.0`, więc wiersz z 1.8.0 byłby w nim niespójny. Wchodzi w E4 razem
  z podbiciem wersji; wyłapie go `grep` po starym numerze, którego wymaga L-0061.
- **Reguła Cursora nie dostała sekcji o markerze `# relai: zachowaj`** — E1 dołożył ją wyłącznie do
  skilla Claude Code. To jest realny rozjazd adapterów (P4), ale poza zakresem tego etapu.
- **Lekcje L-0079…L-0081 bez pozycji w destylacie** — „Zasady aktywne" mają **15 przy limicie 15**,
  a nowa pozycja wchodzi wyłącznie przez kompresję tematyczną za zgodą człowieka. Wszystkie trzy
  mieszczą się tematycznie w zasadach 5 i 7.

**Do zrobienia przez człowieka:**

- **Raport `/relai-clean` na PolyFlow** — bramka z E1, nadal otwarta; sesja E2 też nie miała dostępu
  do tamtego folderu. Termin bez zmian: najpóźniej razem z E4.
- **Ikona `clean.svg` w README** — bramka z akceptacji planu, potrzebna przed E4; wciąż otwarta,
  razem z otwartą sprawą grubości kreski ikon renderowanych w 17–23 px.

### 2026-09-03 — E3: katalog roboczy nazwany z góry w promptach etapowych i odnogach

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_PROMPT_ETAPU.md`** — sekcja „7. Zakres etapu" **otwiera się linią
  z katalogiem roboczym** (`.claude/relai/work/<TEMAT>/E<N>/`), podaną dosłownie, z regułą
  „wszystko tymczasowe tam; artefakt spoza projektu do wpisu dziennika z nazwy, nazwa od slugu
  projektu". W sekcji „8. Weryfikacja" martwy punkt „uprzątnięte foldery testowe…" zastąpił punkt
  dwuczęściowy: **(a)** katalog przejrzany raportem i skasowany po „tak", z liczbami przed i po;
  **(b)** artefakty spoza katalogu wypisane z nazwy. Dołożone zdanie o wyłączniku: wiersz
  `Artefakty robocze: wyłączone` wycisza start sesji i krok 2a, **nie** definicję ukończenia etapu
  (przypadek brzegowy 13 planu).
- **Przykład tej samej specyfikacji przepisany** — sekcja „Zakres etapu" przykładu otwiera się
  ścieżką `.claude/relai/work/PLATNOSCI/E2/`, a checkbox o danych testowych rozpadł się na dwa:
  dane testowe osobno, katalog roboczy osobno, z `%TEMP%/platnosci-stripe-cli/` jako artefaktem
  spoza katalogu. Punkt przepisany tylko w części normatywnej nie trafiłby do promptów (zasada 1).
- **`core/templates/SPEC_ODNOGA.md`** — to samo dla `PROMPT_ODNOGA.md`: sekcja „7. Zakres
  i weryfikacja" otwiera się katalogiem odnogi (`.claude/relai/work/<TEMAT>/<NAZWA_ODNOGI>/`,
  wariant samodzielny `_fixy` — **sprawdzony w kodzie**, `work-artifacts.js:402`, nie wymyślony),
  a rytuał zamknięcia odnogi dostał krok **`2a`** między `STATUS.md` a wpisem. Oba przykłady na
  końcu pliku przepisane.
- **Skill `relai-planning`** — elementy **7 i 8** listy dziewięciu elementów promptu etapowego
  nazywają katalog roboczy, więc generacja nie zależy od pamięci modelu; rytuał „Na koniec" etapu
  dostał krok **`1a`** zaraz po `STATUS.md`. Krok stoi tam, a nie przy dokumentach (punkt 4,
  rekomendacja promptu), bo liczby przed i po mają trafić **do wpisu z punktu 2** — po punkcie 4
  wpis już by istniał.
- **Reguła `adapters/cursor/rules/relai-planning.mdc`** — ten sam krok `1a` po angielsku plus
  katalog roboczy w opisie karty potwierdzenia. To jedyny nośnik rytuału w Cursorze (P2).
- **`/relai-stage`** — Krok 4 karty potwierdzenia dostał pozycję **Katalog roboczy**, ze ścieżką
  przepisaną z linii otwierającej zakres promptu i z rozstrzygnięciem dla promptów sprzed 1.8.0
  (podaj ścieżkę wyprowadzoną i powiedz, że prompt jej nie niesie). **`/relai-branch`** — Krok 6
  pokazuje katalog roboczy odnogi obok ścieżek obu plików.
- **`docs/ARTEFAKTY.md`** — sześć podbić wersji: obie specyfikacje, skill, reguła, obie komendy
  (każda z 1 na 2).
- **Kodu nie tknięto.** `work-artifacts.js`, `session-signals.js` i hooki zostały bez zmian —
  granica zakresu z promptu.

**Zweryfikowane — jak dokładnie:**

- **Walidator spójności:** `node core/tools/validate-adapters.js` — kod **0**, „3 zrodel, wartosc
  1.7.0". Wersja świadomie nietknięta (podbicie do 1.8.0 należy do E4).
- **Dowód obecności, nie tylko braku** (zasada 14): w każdym z sześciu zmienionych plików stoi
  linia ze ścieżką `.claude/relai/work/` — `SPEC_PROMPT_ETAPU.md:110` i `:142`,
  `SPEC_ODNOGA.md:145` i `:151`, `relai-planning/SKILL.md:366` i `:445`,
  `relai-planning.mdc:43` i `:60`, `relai-stage.md:74`, `relai-branch.md:103`.
- **Nowy punkt stoi w obu miejscach specyfikacji:** część normatywna
  `SPEC_PROMPT_ETAPU.md:143` i przykład `:282` — oba z wywołaniem
  `node .claude/relai/tools/clean-work.js raport`.
- **Numeracje nietknięte (dowód negatywny), porównanie HEAD z drzewem roboczym:** dziewięć
  nagłówków `### 1.`…`### 9.` w `SPEC_PROMPT_ETAPU.md` w tej samej kolejności i o tych samych
  tytułach; rytuał „Na koniec" etapu w skillu — **sześć** numerowanych punktów identycznych,
  `1a` dołożone literą.
- **Krok 2 rytuału zamknięcia sesji nietknięty:** liczba odwołań `krok 2 | kroku 2 | step 2`
  per plik jest **identyczna** przed i po — `relai-core/SKILL.md` **9**, `relai-core.mdc` **2**,
  `SPEC_USTAWIENIA.md` **11**, `SPEC_ARCHIWUM.md` **1**, `relai-adopt.md` **1**. Przybyło jedno
  trafienie w `SPEC_PROMPT_ETAPU.md` i jest to **zdanie o samym kroku 2a**, nie zmiana numeracji —
  ten sam wzorzec, który udokumentował E2.
- **Pierwszy realny test zmiany:** `PROMPT_ETAP_4.md` wygenerowany w tym rytuale niesie
  `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E4/` w **linii otwierającej** sekcję „Zakres etapu"
  (linia 224) **i** w punkcie weryfikacji (linia 290). Układ dziewięciu elementów kompletny.
- **Hook `profile-rules` sprawdzony wywołaniem, parą przebiegów** (L-0081): sześć zmienionych
  plików → **cisza** (0 znaków każdy); kontrola pozytywna na artefakcie spoza rejestru
  (`commands/relai-nieistniejaca-kontrola.md`) → ostrzeżenie „artefakt … nie ma wpisu
  w docs/ARTEFAKTY.md". Cisza jest więc wynikiem pomiaru, nie awarii instrumentu. Payload
  budowany `JSON.stringify` ze ścieżką o ukośnikach zwykłych.
- **Wersja nie podbita:** `core/MANIFEST.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` mają `1.7.0`. `git grep` po `1.8.0` daje trafienia wyłącznie
  w planie, promptach, skillach, komendach, regułach, rdzeniu, specyfikacjach i dokumentach
  procesu — **żadnego** w manifestach. Dwa nowe trafienia od tego etapu (`relai-stage.md:76`,
  `ARTEFAKTY.md:74`) są deklaracjami zachowania od 1.8.0, nie wersją.
- **Sprzątanie katalogu roboczego — dowód w obie strony.** Raport przy etapie `W TOKU` pokazał
  katalog jako **chroniony** powodem `etap trwa / E3 / W TOKU`; po zmianie statusu na
  `ZREALIZOWANY` ten sam katalog przeszedł do grupy `etap zamkniety`. Skasowany po potwierdzeniu:
  **0,0 MB / 1 pozycja przed, 0,0 MB po** (trzy pliki tekstowe: `plan-text.js`, `plan.txt`,
  `hook-profile.js`), plus pusty katalog tematu. `work/` **puste**, `%TEMP%` bez pozycji
  `relai-*` i bez slugu projektu. Pomiar: **86 ms** i **83 ms**. Artefakty poza katalogiem
  roboczym: **żadne** — etap nie wyszedł poza projekt.
- **L-0078 potwierdzone drugi raz, na innym pliku:** przed `git add` świeżo utworzony
  `PROMPT_ETAP_4.md` stanął w raporcie jako **kandydat do skasowania** (grupa „repo: katalog
  docs"); po `git add` zniknął z kandydatów. To drugie trafienie ryzyka **S1** i potwierdzenie,
  że granicą jest indeks gita, nie marker.

**Punkt, który nie przeszedł dosłownie:**

- **„`git grep` po martwej frazie w `core/templates/` zwraca zero trafień"** — po wykonaniu
  zakresu trafienia były dwa. Pierwsze było moje: zdanie odróżniające nowy punkt od starego,
  cytujące usuwaną frazę; przepisałem je bez cytatu i zniknęło. Drugie to **wzmianka historyczna
  z E2** w `SPEC_USTAWIENIA.md:295` — w pliku, który prompt oznaczył jako `BEZ ZMIAN`. Ta wzmianka
  **była w HEAD przed startem etapu**, więc kryterium w brzmieniu „zero w katalogu" było
  nieosiągalne od chwili napisania promptu. Właściciel przyjął przeformułowanie: kryterium
  zawężone do pliku, który frazę niósł — `SPEC_PROMPT_ETAPU.md` ma **0 trafień, było 2**.
  Lekcja: **L-0082**.

**Świadomie odłożone:**

- **Dokument użytkownika nadal nie zna `/relai-clean`** — `docs/KOMENDY.md`, `README.md`,
  `SPEC_KOMENDY.md` i `relai-update.md` mają zero wystąpień. To jest zakres E4, nie przeoczenie.
- **Prompty `PROMPT_ETAP_1..3` zostają bez zmian** (D-34), choć wszystkie trzy mają katalog
  roboczy wpisany ręcznie, a nie z nowej specyfikacji.
- **Reguła 1.8.0 adaptera Cursora nie była uruchomiona w Cursorze** — jak reguły 1.7.0. Ryzyko
  przyjęte świadomie (ryzyko 5 planu).

**Do zrobienia przez człowieka:**

- **Ikona `clean.svg` w README** — bramka z akceptacji planu, potrzebna przed E4; nadal otwarta,
  razem z otwartą sprawą grubości kreski ikon renderowanych w 17–23 px.
- **Markery „zachowaj" dla `tools/cache/` i surowego materiału benchmarku w PolyFlow** — decyzja
  właściciela tamtego projektu przy pierwszym raporcie w E4.
- **Raport `/relai-clean` na PolyFlow** — bramka z E1, trzecia sesja bez dostępu do tamtego
  folderu. Termin bez zmian: najpóźniej razem z E4.
  *(rozstrzygnięte 2026-09-03 — wykonane w E4 jako pełny przebieg, nie sam odczyt)*

### 2026-09-03 — E4: wydanie 1.8.0 zmierzone na dwóch projektach, plan SPRZATANIE_ARTEFAKTOW zamknięty

Autor: RelAI (Opus 5) + Lukasz

**Zrobione — dowiezione vs plan:**

Plan miał cztery etapy i **dowiózł wszystkie cztery**. E1 dał narzędzie rdzenia i komendę, E2 —
zdanie na starcie sesji i krok 2a rytuału zamknięcia, E3 — katalog roboczy nazwany z góry
w promptach etapowych i odnogach, E4 — dokument użytkownika, wydanie 1.8.0 i pomiar. Nie przepadło
nic z zakresu. Zakres E4 wyszedł w jednym miejscu **szerzej niż plan**: markerów `zachowaj`
w PolyFlow miało być dwa, postawionych jest siedem — powód niżej.

- **Część pierwsza (przed restartem), commit `6dba2a4`:** jedenasta komenda w dokumencie
  użytkownika (`KOMENDY.md` 10 → 11 komend, `README.md` 10 → 11 wierszy z ikoną, ikony 10 → 11
  plików), `SPEC_KOMENDY.md` z zakresem 1.8.0, `relai-update.md` z wierszem `Artefakty robocze`
  i tabelą jedenastu komend, wersja 1.8.0 w trzech źródłach, pięć podbić w `ARTEFAKTY.md`.
  Sekwencja **P-005** przeszła w całości: push → `claude plugin update` → restart aplikacji →
  potwierdzenie **treścią pliku** z cache'u `1.8.0/`.
- **Ikona `clean.svg`** w stylu dziesięciu istniejących: `viewBox` 48, kreska 2.6 z akcentem 2.2,
  paleta `#8a7f70` + `#c4643c`. Rejestr artefaktów ikon nie prowadzi (zero wystąpień `svg`
  w `ARTEFAKTY.md`), więc pozycja dla niej nie powstała — to nie przeoczenie, tylko kształt
  rejestru.
- **Pomiar u siebie, parą przebiegów** (L-0081): hook startu z cache'u **1.8.0**, pełne wyjście
  **1201 znaków, 0 wystąpień** `[RelAI artefakty robocze]` przy pustym `work/`; kontrola pozytywna
  (3 MB w `work/` przy progu 1 MB) → **1 wystąpienie** z wagą, liczbą pozycji, trzema najcięższymi
  i propozycją `/relai-clean`. Cisza jest wynikiem pomiaru, nie awarią instrumentu.
- **`git grep` po `1.7.0` przepuszczony przez repozytorium:** trafienia w **32 plikach**, każde
  rozstrzygnięte. Wszystkie to wzmianki historyczne — „od 1.7.0", „since 1.7.0", „nowość 1.7.0",
  trigger lekcji, przykładowy raport adopcji datowany 2026-08-09. W `MANIFEST.json`,
  `plugin.json` i `marketplace.json` **zero**. Jedyne deklaracje stanu stały w `docs/STATE.md`
  i poszły do 1.8.0 razem z tym wpisem.
- **PolyFlow: `/relai-update` 1.7.0 → 1.8.0.** Cztery zmiany po pokazaniu diffu i zgodzie: wiersz
  `Artefakty robocze | włączone · 100 MB`, człon o sprzątaniu dopisany do linii fraz sesji
  w `CLAUDE.md`, jedenasta komenda w `KOMENDY.md` z punktem zachowań automatycznych, marker wersji
  **na końcu**. Nietknięte jako świadomy wybór projektu (R6): wiersze `Rotacja dokumentów`,
  `Budżet startu sesji`, `Przegląd spraw człowieka`, sekcja reguł profilu `app`, sekcja „Czeka na
  człowieka". Gitowy pre-commit **nie instalowany**.
- **Narzędzie podłożył hook, nie ręczne kopiowanie:** `.claude/relai/tools/clean-work.js` powstało
  w PolyFlow przy pierwszym przebiegu hooka startu w tamtym folderze.
- **Materiał wytworzony celowo, nie zastany:** 90 MB w `work/AWATAR_3D/E1` (etap
  **ZREALIZOWANY 2026-08-31**), 20 MB w `work/AWATAR_3D/E2` (etap **GOTOWY DO STARTU** — kontrola
  ochrony) i 35 MB w `%TEMP%\polyflow-awatar-render`. **Klonu repozytorium nie robiłem** wbrew
  literze promptu: materiał nieśledzony po stronie repo jest w PolyFlow realny (`tools/cache/`,
  13 MB, zero plików śledzonych), a realny bije sztuczny.

**Zweryfikowane — jak dokładnie:**

- **Linia na starcie sesji PolyFlow, para przebiegów.** Przed materiałem cisza; po materiale
  **„waza 125.0 MB w 2 poz. przy progu 100 MB"**, najcięższe z pochodzeniem —
  `work/AWATAR_3D/E1` 90.0 MB (`etap`), `%TEMP%\polyflow-awatar-render` 35.0 MB (`temp-projekt`).
  Z wytworzonych **145 MB do sumy weszło 125 MB**: 20 MB katalogu etapu niezamkniętego mechanizm
  pominął sam, bez pytania.
- **Pełny przebieg `/relai-clean` na PolyFlow.** Raport: cztery grupy, pomiar **2391 ms**, suma
  kandydatów **125,4 MB**, **13 pozycji chronionych z powodem**. Kasowanie po „tak" na grupę:
  dwie pozycje, **125,0 MB przed, 0,0 MB po**, kod wyjścia 0. Raport ponowny: **zero kandydatów**,
  pomiar 1149 ms; start sesji znów milczy.
- **Dowód negatywny na `tools/`:** katalogu **nie ma w raporcie w ogóle** — ani wśród kandydatów,
  ani wśród chronionych, bo 26 plików jest śledzonych. Kandydatem był wyłącznie `tools/cache/`
  i to on dostał marker.
- **Powody chronionych, dosłownie z raportu:** `.claude/relai/work/AWATAR_3D/E2` →
  `etap trwa / E2 / GOTOWY DO STARTU`; `tools/cache` → `zachowaj / .gitignore: tools/cache/`;
  `benchmark/nagranie.mp3` → `opisane / docs/ARCHITEKTURA.md:2055`; `benchmark/wzorzec.txt` →
  `opisane / README.md:41`; `polyflow/venv` → `opisane / docs/ARCHITEKTURA.md:11`;
  `polyflow/sessions` → `opisane / docs/ARCHITEKTURA.md:2042`; `release` →
  `opisane / docs/ARCHITEKTURA.md:499`.
- **Hook `profile-rules` sprawdzony wywołaniem, parą przebiegów** (L-0081): sześć plików zakresu
  → **cisza** (0 znaków każdy, w tym `clean.svg`); kontrola pozytywna na artefakcie spoza rejestru
  → ostrzeżenie „artefakt … nie ma wpisu w docs/ARTEFAKTY.md".
- **Katalog roboczy etapu — dowód w obie strony, drugi raz.** Przy statusie `W TOKU` ten sam
  katalog stał wśród chronionych z powodem `etap trwa / E4 / W TOKU` i raport miał **zero
  kandydatów**; po zmianie statusu na `ZREALIZOWANY 2026-09-03` przeszedł do grupy
  `etap zamkniety`. Skasowany po „tak": **5 plików / 64 KB przed, 0 plików po** (`hook-profile.js`,
  `hook-start.js`, `hook-start2.js`, `polyflow-pomiar.js`, `plan-text.txt`). Pusty katalog tematu
  (4 KB) **został** — narzędzie pokaże go przy następnym przebiegu jako
  `katalog tematu bez podkatalogow`.
- **Artefakty poza katalogiem roboczym, z nazwy:** `%TEMP%\relai-e4-kontrola` (kontrola pozytywna,
  usunięta przez własny skrypt), `%TEMP%\polyflow-awatar-render` (35 MB, skasowany komendą),
  `PolyFlow\.claude\relai\work\AWATAR_3D\E1` (90 MB, skasowany komendą), `…\E2` (20 MB, usunięty
  ręcznie przez właściciela), `PolyFlow\.claude\relai\e4-zachowaj.json` (lista pomocnicza,
  usunięta), pusty `…\work\AWATAR_3D` (skasowany narzędziem). `work/` w PolyFlow jest puste.

**Dlaczego markerów jest siedem, a nie dwa:**

Bramka planu zakładała markery dla `tools/cache/` i „surowego materiału benchmarku", z założeniem,
że benchmark jest już chroniony powodem `opisane`. **Pomiar to obalił.** `opisane` obejmowało
**dwa** pliki z ośmiu (`nagranie.mp3`, `wzorzec.txt`), a sześć dalszych stało w grupie kandydatów
`repo: katalog benchmark` — w tym `formatowanie/probki.json` i `probki_lista.json`, które
`.gitignore` PolyFlow opisuje jako „realne wypowiedzi wlasciciela". Ochrona przez opis działa
wyłącznie dla tego, co ktoś realnie opisał **w dokumencie projektu**; komentarz nad wzorcem
w `.gitignore` tym dokumentem nie jest. Wszystkie siedem markerów postawiło **narzędzie**
(`clean-work.js zachowaj`) nad **istniejącymi** wzorcami — żaden nowy wzorzec nie powstał.
Pozycje chronione w PolyFlow: **13 → 21**.

**Świadomie odłożone:**

- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma.** Gałąź „juz go nie ma — stan docelowy
  osiagniety" w `core/process/work-artifacts.js:843` gasi jedyny sygnał, po którym wołający
  poznałby, że lista zawiera literówkę albo rozjechane escapowanie. Zreprodukowane dwa razy dziś:
  ścieżka dysko-relatywna z `\r` w środku (skutek `node -e` z podwójnym escapowaniem backslashy)
  dała `Skasowane: 1` bez ani jednej realnej operacji, a `Przed/po` nic nie powiedziało, bo
  pozycja i tak liczyła 0,0 MB. Poprawka to rozdzielenie `skasowane` od `nieobecne` w wyniku
  i w wydruku — **kod z E1, wydany już w 1.8.0**, więc poza zakresem E4. Przeniesione do
  `docs/STATE.md`, sekcja „Co dalej", żeby nie zginęło z folderem planu w archiwum.
- **Grubość kreski ikon renderowanych w 17–23 px** — jedenasta ikona powstała w tej samej kresce
  2.6 co dziesięć poprzednich, bo podbicie do 3.2 dotyczy **wszystkich jedenastu naraz**. Sprawa
  zostaje otwarta w `STATE.md`.
- **Reguły 1.8.0 adaptera Cursora nie były uruchomione w Cursorze** — tak samo jak 1.7.0. Ryzyko
  przyjęte świadomie (ryzyko 5 planu).
- **Lekcji z tego etapu nie dopisuję do destylatu** — „Zasady aktywne" mają 15 przy limicie 15,
  a nowa pozycja wymaga kompresji tematycznej za zgodą człowieka. Znalezisko o fałszywym `OK`
  mieści się pod zasadą 5 („instrument pomiarowy sam bywa źródłem fałszu") i pod L-0037, który
  już mówi: wyrażenia i ścieżki trzymaj w pliku, nie w `node -e`.

**Do zrobienia przez człowieka:**

- **Wybrać następny plan** — `CLAUDE.md` ma teraz `Aktywny plan: brak`. Kandydaci: odmrożenie
  ROZWOJ_PO_WYDANIU (E7 czeka na dostęp do Codeksa), migracja JiraManagera (ostatni projekt bez
  rotacji, trzyma otwarte ryzyko R5), trzy odnogi zamrożonego planu, poprawka `kasuj` opisana
  wyżej.
  *(rozstrzygnięte 2026-09-03 — kolejność odnóg ustalona, patrz wpis niżej)*

### 2026-09-03 — Kolejność odnóg ustalona: GUARD_PO_SCIEZCE odświeżony, POMIAR_ODNOG domknięty zupełnie

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Kolejność trzech odnóg zamrożonego planu ustalona decyzją człowieka:** `GUARD_PO_SCIEZCE`
  teraz, `REKOMENDACJA_MODELU` na koniec, `OPIS_REPO` przy okazji. Czwarta, `POMIAR_ODNOG`,
  domknięta zupełnie.
- **`POMIAR_ODNOG` — domknięcie.** Karta była `ANULOWANA 2026-09-01` z wypełnioną sekcją „Wynik",
  ale dyndały dwie rzeczy. `PROMPT_ODNOGA.md` **usunięty** (`git rm`): gotowy prompt w folderze
  odnogi anulowanej wygląda dla świeżej sesji jak zadanie do wykonania, a nie jak ślad po decyzji.
  Historia gita trzyma go w całości, więc D-18 („nigdy ciche kasowanie") jest zachowane, a karta
  i zakres zostają — odtworzenie promptu z karty jest tak samo tanie jak jego pierwsze powstanie.
- **Ryzyko R2 zamknięte 2026-09-03.** Nie dlatego, że dziewięć brakujących scenariuszy zmierzono,
  tylko dlatego, że **nie zostaną zmierzone nigdy**: warunkiem był `claude /login` na konto
  z dostępnym limitem, a decyzja brzmi „odpuszczamy". Zamknięcie jest uczciwe, bo to, co niesie
  ochronę, jest zmierzone i działa — hook `session-context` i `CLAUDE.md` projektu są niezależne
  od wyzwalania skilla (L-0030). Niezmierzona zostaje wyłącznie kompletność procedury przy
  modelach słabszych od Opusa, a to trwała własność modeli, nie zaległość projektu. Powrót jest
  tani: karta zostaje w repozytorium, konto z limitem otwiera ryzyko z powrotem jednym wierszem.
- **`GUARD_PO_SCIEZCE` — karta rozszerzona o punkt 5.** `core/process/work-artifacts.js:877` woła
  `git check-ignore` z `cwd` sesji, czyli powtarza dokładnie ten błąd, który odnoga naprawia
  w punkcie 3. Plik powstał w E1 planu SPRZATANIE_ARTEFAKTOW **dziś** i jest już wydany w 1.8.0,
  więc karta z 2026-08-17 nie mogła o nim wiedzieć. Decyzja człowieka: dopisać do zakresu, bo
  rozdzielenie tej samej poprawki na dwa wątki zostawiłoby połowę dziury — sprzątanie pytałoby
  gita o cudze repozytorium tak samo, jak robi to dziś skan sekretów. Weryfikacja dostała
  odpowiadający punkt.
- **`PROMPT_ODNOGA.md` odnogi `GUARD_PO_SCIEZCE` wygenerowany od nowa.** Poprzedni był z sierpnia
  i kłamał o stanie repozytorium w pięciu miejscach naraz.

**Zweryfikowane — jak dokładnie:**

- **Rozbieżności starego promptu policzone na repozytorium, nie oszacowane:** „RelAI 1.5.2" wobec
  **1.8.0**; „osiem hooków z własną kopią `isGuest`" wobec **dziewięciu**
  (`grep -l isGuest adapters/claude-code/hooks/*.js` → `auto-format`, `config-protection`,
  `console-log-warn`, `design-quality-check`, `doc-sync-reminder`, `journal-signature`,
  `profile-rules`, `quality-gate`, `session-context`); „cztery źródła wersji" wobec **trzech**
  (walidator: „3 zrodel, wartosc 1.8.0"); destylat **47 lekcji** wobec **15 zasad** przy limicie
  15; kotwica `relaiMarkerFile()` w linii **48** wobec linii **53**.
- **Rozkład konsumentów rdzenia sprawdzony w kodzie, nie założony:**
  `adapters/claude-code/hooks/secret-scanner.js` **konsumuje** rdzeń (linie 22–33),
  `adapters/cursor/hooks/secret-scanner.js` też (linia 34), ale
  `adapters/claude-code/hooks/config-protection.js` ma **własną** kopię `isGuest` (linia 20)
  **i** `relaiMarkerFile` (linia 31). To zmienia treść punktu 2 zakresu: dla tego hooka znaczy on
  przepięcie na rdzeń, nie samą zmianę argumentu. Stary prompt nazywał oba „konsumentami rdzenia".
- **Trzy miejsca wołające `git check-ignore` z `cwd` sesji** wypisane ze ścieżkami i liniami:
  `adapters/claude-code/hooks/secret-scanner.js:38`, `adapters/cursor/hooks/secret-scanner.js:38`,
  `core/process/work-artifacts.js:877`.
- **`core/README.md:84` niesie nieaktualną liczbę** („pozostałych ośmiu hooków") — wpisane do
  zakresu jako poprawka niezależna od wybranego wariantu przepięcia.

**Świadomie odłożone:**

- **Prompty `REKOMENDACJA_MODELU` i `OPIS_REPO` nie były odświeżane** — są z sierpnia i opisują
  RelAI 1.5.x, więc mają tę samą chorobę co odświeżony dziś. Odświeżenie należy do sesji, która
  je uruchomi; zapisane w `STATE.md`, żeby nikt nie wystartował z przeterminowanego promptu.
- **Odnoga nie została wykonana w tej sesji.** Zmiana dotyka guardraili w rdzeniu i obu adapterach,
  a weryfikacja wymaga instrumentu porównującego dwa adaptery w jednym przebiegu (L-0040) — ta
  sesja ma za sobą cały etap E4 i zamknięcie planu.

**Do zrobienia przez człowieka:**

- **Uruchomić `GUARD_PO_SCIEZCE` w świeżej sesji Opus** — prompt jest gotowy:
  `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/GUARD_PO_SCIEZCE/PROMPT_ODNOGA.md`. Odnoga kończy się
  wydaniem **1.8.1** wg sekwencji P-005, więc potrzebny będzie restart aplikacji przed pomiarem.

### 2026-09-03 — Odnoga GUARD_PO_SCIEZCE: guardraile rozpoznają projekt po ścieżce pliku (1.8.1)

Guard pilnował tego projektu, w którym stoi sesja, a nie tego, do którego idzie zapis. Sesja
otwarta gdzie indziej mogła zapisać sekret do cudzego projektu RelAI i zmienić jego `CLAUDE.md`
bez jednego ostrzeżenia. Odnoga zamyka tę dziurę w rdzeniu i w obu adapterach naraz.

**Zrobione:**

- **`core/process/session-signals.js`** — rozpoznanie rozdzielone na `markerWKatalogu()` (sam
  odczyt markera w jednym katalogu) i dwa kierunki nad nim. `relaiMarkerFile()` zachowuje
  dotychczasowe zachowanie od katalogu sesji. Nowe `rozpoznajOdSciezki()` idzie **od katalogu
  pliku w górę** i jest **trójstanowe**: `projekt` / `goscia` / `brak` — bo „nie znalazłem" i
  „znalazłem tryb gościa" znaczą dla guarda co innego. `projektDlaPliku()` składa oba kierunki:
  najpierw plik, potem sesja, a tryb gościa napotkany po drodze kończy sprawę.
- **`adapters/claude-code/hooks/secret-scanner.js`** i **`adapters/cursor/hooks/secret-scanner.js`**
  — projekt liczony od ścieżki z `tool_input`, `git check-ignore` wołany z korzenia projektu pliku,
  ścieżka w komunikacie względna wobec tego samego korzenia.
- **`adapters/claude-code/hooks/config-protection.js`** — przepięty na rdzeń. Do 1.8.0 był jedynym
  guardrailem z własną kopią `isGuest` i `relaiMarkerFile`; teraz konsumuje `projektDlaPliku()`,
  a wszystkie porównania (plik ustawień, `CLAUDE.md`, ścieżka względna, katalog snapshotów) liczą
  się względem projektu **pliku**, nie sesji.
- **`core/process/work-artifacts.js`** — trzeci konsument `check-ignore`. Nowe `korzenRepo()` szuka
  `.git` w górę od sprawdzanej ścieżki, a `juzIgnorowana()` pyta git-a w tym repozytorium, nie
  w repozytorium sesji.
- **`core/README.md`** — akapit o hookach z własną kopią `isGuest` przepisany: **osiem** zamiast
  nieaktualnych „ośmiu" liczonych przy dziewięciu (`config-protection` zszedł z listy, bo został
  przepięty), lista wypisana z nazwy, powód zostawienia zmieniony na sprawdzalny — żaden z tych
  ośmiu nie blokuje operacji. Wiersz tabeli o `session-signals.js` wspomina nowe rozpoznanie.
- **Wydanie 1.8.1** — trzy źródła wersji plus osiem deklaracji stanu docelowego: `README.md`,
  `docs/KOMENDY.md`, `adapters/cursor/README.md`, `CLAUDE.md`, marker w `docs/USTAWIENIA.md`
  i cztery liczby w `/relai-update` (zdanie otwierające, nagłówek tabeli obszarów, wymagany
  nagłówek `KOMENDY.md`, marker i propozycja commita) oraz marker w skillu `relai-core`.
- **`docs/ARTEFAKTY.md`** — dwa podbicia: `/relai-update` (2 → 3), skill `relai-core` (4 → 5).
- **`docs/LEKCJE.md`** — **L-0083** o instrumencie, który mutuje własny materiał. Bez pozycji
  w destylacie: „Zasady aktywne" mają 15 przy limicie 15, lekcja wzmacnia zasady 4 i 5.

**Zweryfikowane — jak dokładnie:**

- **Instrument porównawczy dwóch adapterów w jednym przebiegu** (L-0040): drzewo sprzed zmiany
  wyciągnięte z HEAD przez `git show` do `drzewo-przed/`, drzewo po zmianie — robocze. **22
  scenariusze, 0 niezgodnych.** Werdykty niezmienione wobec 1.8.0: **18**. Zmienione: **4** i
  dokładnie te, dla których odnoga powstała — sekret do pliku śledzonego w cudzym projekcie
  (`cisza` → `deny`, oba adaptery), zapis do cudzego `docs/USTAWIENIA.md` i skasowanie cudzej
  sekcji niemutowalnej (`cisza` → `ask`).
- **Każdy punkt „guard milczy" ma kontrolę pozytywną** (L-0081): czysta treść do tego samego pliku
  — cisza; sekret do `.env` projektu docelowego — cisza, bo `check-ignore` pyta już właściwe
  repozytorium; ten sam sekret do pliku śledzonego — `deny`. Tryb gościa sprawdzony **z obu
  kierunków**: projekt gościa wskazany ścieżką (S4, K4, C4) i projekt gościa jako katalog sesji (S8).
- **Trzeci konsument `check-ignore`**: `instrument-clean.js`, **4 scenariusze, 0 niezgodnych**.
  Z1 — ścieżka ignorowana w repozytorium A, oceniana z sesji stojącej w C: przed zmianą narzędzie
  meldowało „dopisany wzorzec z markerem" (czyli: nieignorowana), po zmianie „brak — ścieżka już
  ignorowana". Z2 jest kontrolą pozytywną na tej samej parze projektów, Z3 i Z4 pokazują materiał
  z katalogu sesji bez różnicy. Dowód negatywny: `.gitignore` obu projektów kontrolnych z tą samą
  sumą przed i po całym przebiegu (`cfcfb83f495c86ca`).
- **`node core/tools/validate-adapters.js`** → kod 0, „3 zrodel, wartosc 1.8.1".
- **Hook startu sesji uruchomiony na tym repozytorium po zmianie** — wypisuje kontekst jak
  dotychczas, kod 0; rozpoznanie od katalogu sesji jest nietknięte.
- **Katalog roboczy odnogi** `.claude/relai/work/ROZWOJ_PO_WYDANIU/GUARD_PO_SCIEZCE/`:
  **399 KB / 115 plików → 0**, razem z pustym katalogiem po planie SPRZATANIE_ARTEFAKTOW i pustym
  katalogiem tematu. Pomiar ponowny: zero kandydatów. Artefaktów poza tym katalogiem **nie było** —
  wszystkie trzy projekty kontrolne, oba instrumenty i drzewo z HEAD powstały w nim. **Narzędzie
  nie zaproponowało tego katalogu samo**: materiał kontrolny zawierał plik `.env`, więc katalog
  wpadł w grupę „Sekrety" (D-42) i został skasowany dopiero po jawnym „tak" człowieka — ochrona
  zadziałała zgodnie z projektem, a nie wbrew niemu.

**Świadomie odłożone:**

- **`dopiszMarker()` nadal zapisuje marker do repozytorium sesji**, także gdy ścieżka należy do
  innego projektu — poprawiono wyłącznie **pytanie** o ignorowanie, bo tylko ono jest w zakresie
  karty (punkt 5). Skutek: `zachowaj` na cudzej ścieżce mówi teraz prawdę o tym, czy jest
  ignorowana, ale marker wciąż wylądowałby u siebie. Sprawa dla osobnego wątku.
- **Osiem hooków z własną kopią `isGuest`** zostaje bez przepięcia, z powodem zapisanym w
  `core/README.md`: żaden nie blokuje operacji.
- **Wzmianki `1.8.0` w specyfikacjach i skillu `relai-planning`** zostają. Rozstrzygnięte po
  kolei (zasada 10): „od 1.8.0", „nowość 1.8.0", „projekt sprzed 1.8.0" i zakres wydania
  w `SPEC_KOMENDY.md` to wzmianki historyczne; przykłady w `SPEC_USTAWIENIA.md` i `SPEC_KOMENDY.md`
  ilustrują strukturę, nie numer; linia wersji skilla `relai-planning` opisuje wydanie, w którym
  skill zmieniono ostatni raz, a 1.8.1 go nie dotknęła.

**Do zrobienia przez człowieka:**

- **Sekwencja wydania 1.8.1 (P-005)**: push → `claude plugin marketplace update relai` →
  `claude plugin update relai@relai` → **restart aplikacji** → potwierdzenie wersji **treścią
  pliku** w cache'u, nigdy komunikatem CLI.
- **Żywy pomiar blokady w sesji z 1.8.1** — instrument dowodzi werdyktu hooka, ale „plik nie
  powstał" da się pokazać dopiero w sesji, która ma zainstalowaną wersję 1.8.1 i katalog roboczy
  poza projektem docelowym.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-03 — Wydanie 1.8.1 potwierdzone po restarcie; plan REKOMENDACJA_MODELU do akceptacji

Dwie rzeczy: domknięcie sekwencji wydania z poprzedniego wpisu i przekształcenie odnogi
`REKOMENDACJA_MODELU` w pełny plan — bo wywiad rozszerzył jej zakres ponad próg odnogi.

**Zrobione:**

- **Potwierdzenie wersji po restarcie aplikacji.** `~/.claude/plugins/installed_plugins.json`:
  `relai@relai` → wersja **1.8.1**, `installPath` w cache'u `1.8.1`, `gitCommitSha`
  **`897fb0be…`** — czyli dokładnie commit wypchnięty w poprzednim wpisie. Pliki cache'u zgodne
  z drzewem roboczym bajt w bajt po normalizacji CRLF (pięć plików rdzenia i hooków).
- **Plan `REKOMENDACJA_MODELU`** — `docs/plany/REKOMENDACJA_MODELU/PLAN.html` (HTML z ustawień
  projektu, szablon z pluginu, bez nadpisania lokalnego) i `STATUS.md` ze statusem
  **DO AKCEPTACJI**, czterema etapami i trzema bramkami manualnymi.
- **Odnoga `REKOMENDACJA_MODELU` przeniesiona do planu** — status `PRZENIESIONA 2026-09-03`
  w karcie i w sekcji „Odnogi" `STATUS.md` planu ROZWOJ_PO_WYDANIU, sekcja „Wynik" wypełniona.
  `PROMPT_ODNOGA.md` zostaje jako ślad (D-18) i nie jest już do wykonania.
- **`CLAUDE.md`** — linia aktywnego planu wskazuje nowy plan, wiersz tabeli „Stan prac" dopisany,
  linia rytuału startu podniesiona; **`docs/STATE.md`** — nowy obszar prac, jedna otwarta odnoga
  zamiast dwóch, bramki 1 → 4.

**Zweryfikowane — jak dokładnie:**

- **Wersja zainstalowana ≠ komunikat CLI** (L-0004, L-0020): odczytana z pliku instalacji i z sumy
  zgodności plików cache'u z repozytorium, nie z `claude plugin details`.
- **Poprawka guardraili działa na plikach, które ładuje harness** — te same payloady puszczone
  przez cache **1.8.0** i **1.8.1**, na realnym cudzym projekcie (PolyFlow), z katalogiem sesji
  ustawionym poza jakimkolwiek projektem RelAI: sekret do `CLAUDE.md` PolyFlow — `cisza` → `deny`;
  skasowana sekcja niemutowalna w tym samym pliku — `cisza` → `ask`; treść czysta — `cisza`
  w obu wydaniach (kontrola negatywna, L-0081). Pierwsza próba wybrała katalog sesji **wewnątrz**
  RelAI i nie różnicowała wydań — stary kierunek rozpoznania wystarczał; scenariusz poprawiono.
- **Plan HTML sprawdzony w przeglądarce, nie tylko builderem** (krok 6 `SPEC_PLAN_HTML`): builder
  kod 0, 6 reguł `@font-face` osadzonych, znacznik symulatora usunięty (plan bez wyliczeń).
  W dokumencie: **10 sekcji**, **12 bloków zwijanych** — klik zmienia `aria-expanded`, zero
  duplikatów `id`, `scrollWidth` równy `clientWidth` (brak przewijania w poziomie), **0** elementów
  `svg[role=img]` bez `aria-label`, **0** odwołań `http(s)://` w pliku.
- **Zakres planu oparty na repozytorium, nie na karcie odnogi.** Sprawdzenie wykazało dwa
  nieprawdziwe założenia karty z sierpnia: reguła Cursora **nie ma** pytania o model (adapter
  kopiuje skill z adaptera Claude Code, więc pytanie jest jedno na oba narzędzia), a walidator
  **nie ma** gałęzi sprawdzającej obecność pliku zadeklarowanego w `MANIFEST.adapters`. Numery
  linii z karty (`SPEC_CLAUDE_MD.md` 51 i 208) przeliczone na stan 1.8.1: **111–112 i 290–291**.

**Świadomie odłożone:**

- **Dowód „plik nie powstał" w żywej sesji** — hooki odpytano payloadami, co dowodzi werdyktu;
  pełny dowód wymaga próby zapisu do cudzego projektu z sesji mającej do niego dostęp. Pozycja
  zostaje w „Czeka na człowieka".
- **Odświeżanie listy modeli z plików stanu narzędzi** (`~/.cursor/cli-config.json` niesie
  `modelSelectionHistory`, `~/.claude.json` modele użyte w sesjach) — odrzucone jako **podstawa**
  listy w sekcji 4 planu, bo to historia wyborów, nie katalog dostępnych. Zostaje jako możliwe
  źródło pomocnicze przy odświeżaniu.
- **Rotacja dziennika** — hook startu zgłosił `docs/DZIENNIK.md` **150,1 KB przy progu 150 KB**.
  Rotacji nie uruchamiam w turze, w której dopisuję do tego pliku dwa wpisy; należy do najbliższego
  „kończymy na dziś".

**Do zrobienia przez człowieka:**

- **Akceptacja albo odrzucenie planu `REKOMENDACJA_MODELU`.** Do czasu zgody żaden etap nie
  startuje, a `PROMPT_ETAP_1.md` nie powstaje (D-34).
- **Trzy bramki planu** wypisane w jego `STATUS.md`: adresy stron dokumentacji modeli dla obu
  narzędzi i decyzja o zgodzie na ruch sieciowy (obie blokują E2), numer wydania 1.9.0 czy 1.8.2
  (przed E4).

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-03 — Plan REKOMENDACJA_MODELU zaakceptowany z Aneksem A; E1 gotowy do startu

**Zrobione:**

- **Plan zaakceptowany i zamrożony** — `STATUS.md`: status planu `ZAAKCEPTOWANY 2026-09-03`,
  E1 → `GOTOWY DO STARTU` z linkiem do promptu, linia w dzienniku wdrożenia. Metka statusu
  w `PLAN.html` przepisana w obu miejscach; sekcje 1–9 **nietknięte**.
- **Aneks A (2026-09-03)** dopisany do sekcji 10 planu. Powód wykryty przy generowaniu promptu E1:
  **oba adaptery prowizjonują do `.claude/relai/`** — Cursor również
  (`adapters/cursor/hooks/session-context.js:134`, `install.js:172`, `destRel: '.claude/relai'`).
  Rozróżnienie list modeli po katalogu, zapisane w sekcji 5, było więc niewykonalne bez rozbicia
  cache'u na dwie lokalizacje. Zmiana: listy rozróżnia **nazwa pliku**
  (`MODELE-claude-code.md`, `MODELE-cursor.md`), a która obowiązuje w tej sesji — mówi **hook
  startu** jednym zdaniem; skill bierze nazwę stamtąd, zamiast rozpoznawać narzędzie samodzielnie
  (zasada 8, L-0030). Liczba etapów i szacunek bez zmian.
- **`PROMPT_ETAP_1.md`** wygenerowany ze specyfikacji promptu etapowego: dziewięć sekcji, katalog
  roboczy nazwany w linii otwierającej zakres, dziewięć punktów weryfikacji, „Zasady aktywne"
  przepisane w całości wraz z **L-0083** dopisaną do zasady 5.
- **`CLAUDE.md`** — linia aktywnego planu bez dopisku o akceptacji, wiersz tabeli „Stan prac"
  i linia rytuału startu podniesione na stan po akceptacji.

**Zweryfikowane — jak dokładnie:**

- **Rozbieżność planu ze stanem repozytorium wyłapana przed startem etapu, nie w jego trakcie.**
  Sprawdzenie `grep -rn "provisionTemplates"` pokazało trzy wywołania i **wszystkie** z
  `destRel: '.claude/relai'` — w tym oba wejścia adaptera Cursora. Gdyby prompt powstał „z planu",
  E1 zacząłby od zakładania katalogu `.cursor/relai/`, którego żaden mechanizm nie czyta.
- **Metka statusu w `PLAN.html` policzona przed i po podmianie:** `DO AKCEPTACJI` 2 → 0,
  `ZAAKCEPTOWANY 2026-09-03` 0 → 2, obecność Aneksu A potwierdzona wyrażeniem nad treścią pliku.
- **Prompt niesie oba fakty, które przewróciły kartę odnogi** — jeden skill dla dwóch narzędzi
  (instalator Cursora kopiuje komendy i skille z adaptera Claude Code) oraz jeden katalog cache'u —
  wypisane w sekcji „Stan wyjściowy" jako rzeczy, które łatwo przyjąć odwrotnie.

**Świadomie odłożone:**

- **Sprawdzenie deklaracji `MANIFEST.adapters` przez walidator** — E1 tylko deklaruje pliki list,
  gałąź sprawdzająca ich obecność należy do E4. Dziś walidator takiej gałęzi nie ma.
- **Rotacja dziennika** — plik jest ponad progiem 150 KB; rotacja przy najbliższym „kończymy na
  dziś", nie w turze dopisującej do niego wpis.

**Do zrobienia przez człowieka:**

- **Dwie bramki blokują E2**, nie E1: adresy stron dokumentacji modeli dla obu narzędzi oraz
  decyzja, czy zgoda na ruch sieciowy pada przy każdym odświeżeniu, czy raz na projekt. E1 startuje
  bez nich.
- **Numer wydania (1.9.0 czy 1.8.2)** — przed E4.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-03 — E1 planu REKOMENDACJA_MODELU: pytanie o model pokazuje nazwy, nie klasy

**Zrobione:**

- **`adapters/claude-code/MODELE.md` i `adapters/cursor/MODELE.md`** — listy modeli per narzędzie.
  Blok maszynowy z kotwicą na początku linii, zamknięta lista brzmień klas
  (`strong` / `balanced` / `cheap`), `list-date` i **źródło przy każdej pozycji**. Warstwa modelowa
  po angielsku, cały plik ASCII. Claude Code: Opus 5 i Fable 5.1 jako `strong` (obie pozycje realne
  i obie potrzebne — D-85 wykonuje etapy Opusem, plany pisze Fable), Sonnet 5, Haiku 4.5. Cursor:
  wyłącznie `strong: Grok 4.6` z pilotażu E6; `balanced` i `cheap` stoją jako
  `<TO BE FILLED IN: …>`, bo z pomiaru ich nie ma.
- **`core/process/session-signals.js`** — `provisionModelList()` i `dataListyModeli()`. Rdzeń zna
  mechanizm, **nie zna nazw narzędzi**: adapter podaje źródło i nazwę pliku docelowego. Kopia
  powstaje **tylko wtedy, gdy pliku nie ma** — jedyna różnica wobec `provisionTemplates()` i cała
  mitygacja ryzyka 2 planu.
- **Oba hooki startu** (`adapters/claude-code/hooks/session-context.js`,
  `adapters/cursor/hooks/session-context.js`) — każdy kładzie **swoją** listę i dokłada jedno zdanie
  ASCII o tym, która obowiązuje, wraz z datą listy. Rozpoznanie narzędzia zostaje w warstwie obecnej
  w każdej sesji (zasada 8), skill go nie prowadzi.
- **`adapters/claude-code/skills/relai-planning/SKILL.md`** — Krok 3 dostał akapit „Nazwy zamiast
  klas, gdy sesja ma listę modeli": skill czyta plik wskazany przez hook, opcje pytania 3 wymieniają
  nazwy razem z datą listy, a pozycja `<TO BE FILLED IN: …>` **nie jest nazwą** — mówi się o luce
  i wskazuje `/relai-models`. Bez listy pytanie zostaje dokładnie takie jak w tabeli.
- **`core/MANIFEST.json`** — pole `models` w sekcji obu adapterów. Sama deklaracja; gałąź
  sprawdzająca ją w walidatorze należy do E4.

**Zweryfikowane — jak dokładnie:**

Dwa instrumenty w katalogu roboczym etapu, obie wersje zachowania w jednym przebiegu (zasada 4),
materiał odtwarzany i na końcu dowiedziony jako nietknięty (zasada 5, L-0083).

- **`pomiar-listy.js` — 12/12 zdanych, na żywych hookach obu adapterów.** Dwa projekty kontrolne:
  w projekcie obsłużonym hookiem Claude Code `ls .claude/relai/` daje **wyłącznie**
  `MODELE-claude-code.md`, w projekcie Cursora **wyłącznie** `MODELE-cursor.md`; treść obu kopii
  zgadza się sumą ze źródłem adaptera (`1f67fe1bc954ecdc`, `ac8fe88a943f0a92`).
- **Kopia trwała — dowód negatywny.** Plik listy zmieniony ręcznie w projekcie kontrolnym
  (podmieniona data + dopisana linia) **przeżył** ponowne uruchomienie hooka: suma po normalizacji
  CRLF → LF `ecc6d18d9f6ccf65` przed i po. Kontrola pozytywna w tym samym przebiegu: skasowany plik
  **powstał** ponownie, z sumą źródła.
- **Zdanie o liście pada raz i jest ASCII.** Hook Claude Code: 1 linia, hook Cursora: 1 linia, znaków
  spoza ASCII **0**. Brzmienie: `Lista modeli tego narzedzia: .claude/relai/MODELE-claude-code.md
  (z dnia 2026-09-03). Pytajac o model wykonawczy etapow, podaj nazwy z tej listy razem z jej data.`
  Ten sam hook z **odsuniętym** plikiem źródłowym adaptera: **0 linii** na ten temat i **0 plików**
  w cache'u projektu, przy nietkniętej reszcie kontekstu startu (1187 znaków, rytuał na miejscu).
- **`pomiar-pytania.js` — 7/7 zdanych, dowodem jest zapisana treść pytania, nie kod skilla.** Dwie
  świeże sesje `claude -p` uruchomione z powłoki natywnej, na dwóch projektach kontrolnych.
  Projekt **z listą** dał: *„Pytanie nr 3 — Model wykonawczy etapów (nazwy z listy
  `.claude/relai/MODELE-claude-code.md` z dnia 2026-09-03) … etapy złożone na modelu najsilniejszym
  (Opus 5 albo Fable 5.1), etapy mechaniczne na najtańszym (Haiku 4.5) … Sonnet 5 (zrównoważony)"*.
  Projekt **bez listy**, w tym samym przebiegu: *„Rekomendacja RelAI — złożone etapy: model
  najsilniejszy; mechaniczne: najtańszy"* — **zero nazw modeli**.
- **Nic poza zakresem.** `git diff --stat`: pięć plików zakresu + `STATUS.md` planu, 90 linii
  dodanych, 1 usunięta. Żaden plik z listy „Nie ruszasz" nietknięty.
- **`node core/tools/validate-adapters.js` → kod 0** („3 zrodel, wartosc 1.8.1").
- **Katalog roboczy** `.claude/relai/work/REKOMENDACJA_MODELU/E1/`: **2,7 MB / 186 plików przed,
  0,0 MB po** — skasowany po „tak" razem z `%TEMP%\relai_d_list.txt`. Poza katalogiem etapu nie
  powstał żaden artefakt; `zloz-plan.js` (poziom wyżej, artefakt planowania) został nietknięty.

**Świadomie odłożone:**

- **Sprawdzenie deklaracji `models` przez walidator** — E1 deklaruje, E4 sprawdza. Dziś usunięcie
  pliku listy z adaptera nadal daje kod 0.
- **`adapters/cursor/install.js`** — prowizjonuje specyfikacje przy instalacji, listy modeli nie.
  Nie szkodzi: hook startu Cursora kładzie ją przy pierwszej sesji. Poza zakresem punktu 4 promptu.
- **Rotacja dziennika** — plik przekroczył próg 150 KB (158 KB na starcie sesji). Rotacja przy
  „kończymy na dziś", nie w turze dopisującej wpis.
- **Defekt `kasuj`, trzecia reprodukcja.** Lista ścieżek zbudowana z literałami w `node -e` przeszła
  przez escapowanie powłoki i dała `Skasowane: 2` przy **zerze realnych operacji** — ścieżki
  w wydruku były okaleczone (`C:UsersLukasz…`). Poprawne kasowanie wykonano listą zbudowaną
  `path.resolve()`. To ten sam otwarty punkt ze `STATE.md` (`work-artifacts.js:843`), nie nowy.

**Do zrobienia przez człowieka:**

- **Nazwy modeli Cursora dla klas `balanced` i `cheap`** — dziś dwie pozycje z trzech stoją jako
  `<TO BE FILLED IN: …>`. Nie blokuje E2; to właśnie ta komenda ma je uzupełniać.
- **Dwie bramki nadal blokują E2**: adresy stron dokumentacji modeli dla obu narzędzi oraz decyzja,
  czy zgoda na ruch sieciowy pada przy każdym odświeżeniu, czy raz na projekt.
  *(rozstrzygnięte 2026-09-04: pięć adresów wskazanych przez człowieka i sprawdzonych odczytem tego
  samego dnia — `code.claude.com/docs/en/model-config` jako główne dla Claude Code,
  `support.claude.com/en/articles/11940350-…` jako lista ID, `platform.claude.com/docs/en/api/models/list`
  jako źródło opcjonalne wymagające `X-Api-Key`, `cursor.com/docs/models-and-pricing` jako główne dla
  Cursora i `cursor.com/help/models-and-usage/available-models` jako uzupełnienie opisowe; zgoda na
  ruch sieciowy **każdorazowa**, więc wiersz w `USTAWIENIA.md` nie powstaje. Przy okazji rozstrzygnięte
  sprowadzanie ~40 nazw Cursora do trzech klas: komenda pokazuje kandydatów i pyta, nie typuje sama.
  `STATUS.md` i `PROMPT_ETAP_2.md` zaktualizowane, warunek startu zdjęty)*
- **Numer wydania (1.9.0 czy 1.8.2)** — przed E4. Kod E1 mówi już „1.9.0" w komentarzach.
- **Ryzyko R2 warto otworzyć ponownie albo przepisać** — zamknięto je 2026-09-03 zdaniem „nie
  zostanie zmierzone nigdy", opartym na L-0032 (wyczerpany limit `claude -p`). W tej sesji
  `claude -p` **działa** i poprowadził pomiar (L-0084).

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — E2 planu REKOMENDACJA_MODELU: listę modeli da się odświeżyć komendą

**Zrobione:**

- **`adapters/claude-code/commands/relai-models.md`** — dwunasta komenda RelAI. Dziewięć kroków
  w kolejności: marker projektu → **która lista obowiązuje** (ze zdania hooka startu, nigdy
  z własnego rozpoznania narzędzia) → rozjazd „kopia projektu vs lista z pluginu" → **zgoda na ruch
  sieciowy** → odczyt źródeł → pytanie do człowieka jako drugie źródło → sprowadzenie do trzech klas
  → **różnica stara–nowa** → zapis po „tak". Na końcu dwanaście zakazów.
- **Zgoda na sieć każdorazowa, bez śladu.** Bramka rozstrzygnięta przez człowieka 2026-09-04 weszła
  do komendy dosłownie: nie powstaje wiersz w `docs/USTAWIENIA.md`, nie ma wyłącznika ani pliku
  stanu, a zgoda z poprzedniego wywołania — także w tej samej sesji — nie jest zgodą (D-18).
- **Pięć adresów źródeł wskazanych przez człowieka**, w kolejności użycia, z opisem, co z którego
  się bierze. Źródło `platform.claude.com` jest opcjonalne i wymaga `X-Api-Key`: brak klucza znaczy
  „pomiń", nie „zgłoś błąd", a wartości klucza komenda nie zapisuje nigdzie (D-42).
- **Lista Cursora sprowadzana do klas przez pytanie, nie przez typowanie.** Strona niesie ~45 modeli
  od pięciu dostawców, klasy są trzy — komenda wypisuje kandydatów pogrupowanych po dostawcy i pyta.
  RelAI nie rankuje cudzych modeli.
- **Aneks B do planu (2026-09-04)** — wynik odświeżenia przeniesiony do plików adapterów, za zgodą
  człowieka na wyjście poza wypisany zakres etapu. `adapters/claude-code/MODELE.md` dostał **aliasy**
  (`opus`, `fable`, `sonnet`, `haiku`) jako czwarte pole bloku maszynowego oraz adresy w polu
  `source`; `adapters/cursor/MODELE.md` — `balanced: Composer 2.5` i `cheap: Auto` wskazane przez
  człowieka. Bez tego rozstrzygnięcie żyłoby wyłącznie w projekcie kontrolnym skasowanym przy
  zamykaniu etapu.
- **Dokumenty użytkownika:** wiersz `/relai-models` w `docs/KOMENDY.md`, wiersz w tabeli komend
  `README.md` (11 → 12), liczby w dwóch pozostałych miejscach README (instalator Cursora, drzewo
  repozytorium).

**Zweryfikowane — jak dokładnie:**

- **Adresy: 5/5, żadnego dołożonego.** `grep -o "https://…"` po treści komendy zwraca dokładnie pięć
  adresów, po jednym wystąpieniu. Adres przekierowujący (`docs.claude.com/…`, oddaje 302) **nie
  występuje ani razu** — pierwsza wersja komendy cytowała go w ostrzeżeniu i punkt weryfikacji
  przewrócił się na tym; ostrzeżenie zostało przepisane bez adresu.
- **Liczba komend: 12.** `ls adapters/claude-code/commands/*.md | wc -l` → `12`. Frontmatter
  z `description` i `argument-hint`, sekcja „Zakazy tej komendy" obecna (`grep -c` → 1).
- **„Nie" zostawia plik nietknięty (dowód negatywny).** Projekt kontrolny `p1`, przebieg 1: suma
  listy `1f67fe1bc954ecdc` przed pokazaniem różnicy i **ta sama** po odmowie. Kontrola pozytywna
  w tym samym ciągu (przebieg 2): „tak" dało sumę `f82ee8da0dbe7997`, a `dataListyModeli()`
  z rdzenia odczytał z pliku `2026-09-04` zamiast `2026-09-03`.
- **Zgoda pada przy każdym wywołaniu — dowód pośredni.** Dwa przebiegi pod rząd w tym samym
  projekcie kontrolnym, `docs/USTAWIENIA.md` z sumą `65315611192c87dd` **przed pierwszym i po
  drugim**; w treści komendy nie ma ani jednej ścieżki zapisu zgody. Czego to **nie** dowodzi:
  że dwie kolejne świeże sesje CLI zadają pytanie — patrz „Do zrobienia przez człowieka".
- **Niepowodzenie odczytu nie kasuje listy.** Odczyt adresu nieistniejącego zwrócił `HTTP 404 Not
  Found`; lista w `p1` została z sumą `1f67fe1bc954ecdc` i linią `list-date: 2026-09-03` — dowód
  treścią pliku, nie komunikatem.
- **`<TO BE FILLED IN: …>` uzupełnione drugim źródłem: 2 → 0.** W liniach klas `p2` po zapisie zero
  wystąpień (przed: dwa w źródle adaptera); jedyne pozostałe wystąpienie frazy to opis formatu
  w zasadach parsowania, linia 20. Obie nowe pozycje niosą `named by the human` z datą, a format
  bloku jest nienaruszony — `dataListyModeli()` czyta `2026-09-04`.
- **Odświeżenie przeżywa start sesji (ryzyko M2).** Hook startu uruchomiony ponownie po zapisie:
  `p1` suma `f82ee8da0dbe7997` przed i po, `p2` suma `65eca9cbea99f0b3` przed i po; oba hooki
  meldują nową datę. Przy okazji dowód rozłączności list (ryzyko M1): w `p2` plik
  `MODELE-claude-code.md` **nie istnieje**, a w `p1` — `MODELE-cursor.md`.
- **Pliki z sekcji „Nie ruszasz" nietknięte.** `git status --porcelain` w chwili zamknięcia zakresu
  pokazywał wyłącznie `README.md`, `docs/KOMENDY.md`, `STATUS.md` planu i nowy plik komendy;
  `session-signals.js`, oba hooki startu, trzy specyfikacje rdzenia, walidator i `docs/USTAWIENIA.md`
  bez zmian. Pliki adapterów `MODELE.md` zmieniły się później i świadomie — Aneks B.
- **`node core/tools/validate-adapters.js` → kod 0** („3 zrodel, wartosc 1.8.1").
- **Katalog roboczy etapu.** `.claude/relai/work/REKOMENDACJA_MODELU/E2/` — raport przed:
  **1,1 MB, 1 pozycja**, po kasowaniu **0,0 MB**, raport ponowny: zero kandydatów. Ochrona pokazana
  w obie strony tego samego dnia: przy statusie `W TOKU` katalog był chroniony powodem `etap trwa`,
  kandydatem stał się dopiero po `ZREALIZOWANY`. Nowy plik komendy stał w raporcie jako kandydat
  do chwili `git add` — trzecia reprodukcja L-0078. Artefakty poza katalogiem etapu: **żadne**.

**Świadomie odłożone:**

- **Pomiar w świeżych sesjach CLI.** `claude -p` odmówił uwierzytelnienia (`Failed to authenticate:
  OAuth session expired and could not be refreshed`), a `.env` z kluczem API w tym repozytorium nie
  istnieje. Procedurę komendy wykonała sesja etapu — skutki na plikach są prawdziwe, ale wykonawcą
  nie była sesja, która widzi wyłącznie treść komendy. Prompt E2 niósł zdanie „`claude -p` działa"
  jako FAKT stanu wyjściowego, oparte na pomiarze sprzed doby → **L-0087**.
- **Ikona dwunastej komendy.** Kolumna w tabeli `README.md` została pusta. Dwunasta ikona to zestaw
  jedenastu rysunków w jednej kresce, a sprawa „ikony renderują się w 17–23 px" czeka na decyzję —
  rysowanie dwunastej przed nią rozjechałoby zestaw.
- **`SPEC_KOMENDY.md`** — zakres wydania z liczbą komend należy do E4 razem z podbiciem wersji.
- **Odczyt strony odpowiadającej `200` ze zmienionym układem** — realny kształt ryzyka M3.
  Zmierzono wariant łatwiejszy (404); wariant trudny czeka na pierwszy taki przypadek.
- **`adapters/cursor/install.js`** nadal nie prowizjonuje listy modeli przy instalacji; kładzie ją
  hook startu przy pierwszej sesji. Bez zmian wobec E1.

**Do zrobienia przez człowieka:**

- **Czy pomiar wykonany przez sesję etapu wystarcza do zamknięcia dwóch punktów weryfikacji** —
  „oba wywołania pytają o zgodę" i „fraza w `KOMENDY.md` w brzmieniu realnie uruchomionym". Skutki
  na plikach są zmierzone i powtarzalne; niezmierzone zostaje zachowanie **świeżej sesji**, która
  zna wyłącznie treść komendy. Domknięcie wymaga `claude /login` na konto z limitem albo klucza
  w `.env` — obie drogi są decyzją właściciela.
- **Numer wydania: 1.9.0 czy 1.8.2** — bez zmian, przed E4.

Autor: RelAI (Opus 5) + Lukasz
