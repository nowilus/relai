# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Mechanizm jest kompletny **i zadziałał na cudzym projekcie w żywej sesji**, nie tylko w instrumentach: PolyFlow 1.6.1 → 1.7.0, rotacja dziennika **183,1 → 147,3 KB** (9 wpisów, suma `566dca8a4dd45ba7` odczytana z dysku przed przycięciem), rotacja ustawień **29,8 → 25,4 KB** (16 wierszy, 5 wierszy maszynowych nietkniętych), przepięcie linków z bilansem zero (60 przed, 65 po rotacji, 60 po przepięciu). Tutaj: dziennik **155,6 → 74,1 KB**, 18 wpisów do archiwum, raport startu z 2 linii na **0**. Zawężone, bo to, co zostało, nie jest już własnością mechanizmu: **JiraManager (386 KB startu) czeka na okno właściciela**, a warstwa startowa PolyFlow (157,3 KB przy budżecie 80 KB) jest gruba sekcją ryzyk, `CLAUDE.md` i `STATE.md` — odchudzają je decyzje człowieka, nie archiwum. Zmierzone: 2026-08-20, 2026-08-21, 2026-09-01 (E1–E6) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. **1.8.1 (odnoga GUARD_PO_SCIEZCE) zamyka osobną dziurę tej samej rodziny**, obecną w obu adapterach: guard rozpoznawał projekt wyłącznie po katalogu sesji, więc zapis do cudzego projektu RelAI przechodził bez ostrzeżenia w Claude Code tak samo jak w Cursorze. Zmierzone instrumentem na dwóch drzewach (22 + 4 scenariusze, 0 niezgodnych); poziom bez zmian, bo powód otwarcia jest inny — brak egzekwowanego `ask` w Cursorze. **1.9.1 (CURSOR_1_9_1):** opakowanie `secret-scanner.cmd` zwraca `deny` i nie cytuje wartości; świeża sesja `cursor-agent -p` na projekcie kontrolnym z hookami od startu — plik z kluczem **nie powstał**, kontrola pozytywna bez sekretu utworzyła `ok.md`. Sesja GUI w repozytorium RelAI bez zainstalowanego adaptera zapisu nie zatrzymała (hooki dołożone w trakcie sesji się nie załadowały). **1.9.2 (PRECOMMIT_ESM) trafia w rdzeń tego ryzyka od strony, której nie przewidywało:** mitygacja sama była zepsuta w całej klasie projektów — pre-commit instalowany od 1.4.0 przewracał się na starcie w każdym projekcie z `"type": "module"` i blokował **każdy** commit, a wykryło to **zgłoszenie z cudzego projektu**, nie nasz pomiar; guardrail nigdy wcześniej nie był uruchomiony poza repozytoriami, które sami zakładaliśmy. Po poprawce: 27 przypadków regresji w sześciu scenariuszach (0 rozjazdów), instalacja kończy się testem dymnym z cofnięciem, a fałszywe trafienia policzone na 3705 plikach z pięciu cudzych repozytoriów. Poziom bez zmian — powód otwarcia jest ten sam (brak egzekwowanego `ask` w Cursorze, Codex niezmierzony), ale doszła własność zmierzona: **gwarancja poza harnessem była dotąd sprawdzana wyłącznie na materiale własnym**. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6), 2026-09-03 (GUARD_PO_SCIEZCE), 2026-09-04 (CURSOR_1_9_1), 2026-09-04 (PRECOMMIT_ESM) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. **1.9.1 (CURSOR_1_9_1):** cały wątek pomiarowy poprowadził Grok 4.6 w aplikacji Cursora — rytuał startu, karta, granica „nie poprawiasz kodu", trzy komendy, rytuał zamknięcia. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6), 2026-09-04 (CURSOR_1_9_1) |

| S1 | Bramka dokumentacyjna przepuści coś potrzebnego — plik nieśledzony, o którym architektura milczy, a bez którego nie da się powtórzyć pomiaru (plan SPRZATANIE_ARTEFAKTOW, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kasowanie wyłącznie po „tak" na grupę z pełną listą pozycji; pliki śledzone nigdy nie są kandydatami; niepewność rozstrzygana na korzyść ochrony; „zostaw na zawsze" dopisuje marker, więc pytanie nie wraca. Pierwszy pomiar (E1, własne repo): 8 grup, 9 pozycji chronionych z powodem — w tym `benchmark`-owy odpowiednik, czyli `.claude/relai/templates` z powodem `opisane` i wskazaniem `README.md:150`. **Bramka przepuściła dorobek własnego etapu**: dwa nowe, niezacommitowane pliki produktu stanęły w grupach jako kandydaci (L-0078) — ochroną jest tam `git add`, nie marker, ale to jest realne trafienie tego ryzyka. Niezmierzone na cudzym projekcie: raport na PolyFlow zostaje jako bramka manualna planu. E2: drugi przebieg bez ani jednego fałszywego kandydata — 1 grupa (katalog etapu zamkniętego), 5 pozycji chronionych, w tym `templates` powodem `opisane`. **E3: trafienie powtórzyło się na innym pliku** — świeżo wygenerowany `PROMPT_ETAP_4.md`, jeszcze nieprzyjęty do indeksu, stanął w raporcie jako kandydat (grupa „repo: katalog docs") i zniknął po `git add`. Wzorzec jest więc stały, nie jednorazowy: **granicą ochrony dorobku sesji jest indeks gita**, a nie marker — i to zdanie należy mówić wprost przy sprzątaniu w trakcie etapu (L-0078). **E4: pierwsze trafienie na cudzym projekcie i najpoważniejsze z dotychczasowych.** Powód `opisane` chronił w PolyFlow **dwa** pliki benchmarku z ośmiu, a sześć dalszych — w tym `formatowanie/probki.json` i `probki_lista.json` z realnymi wypowiedziami właściciela — stanęło w grupie kandydatów. Ochrona przez opis obejmuje wyłącznie to, co ktoś opisał **w dokumencie projektu**; komentarz nad wzorcem w `.gitignore` tym dokumentem nie jest, choć czyta się identycznie. Bramka zadziałała (nic nie zniknęło bez „tak"), ale sama nie wystarczy — potrzebny był marker, i to siedem markerów zamiast zakładanych dwóch. **Ryzyko zostaje otwarte**: mechanizm jest zależny od tego, czy człowiek opisał materiał tam, gdzie narzędzie patrzy. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |
| S2 | Narzędzie skasuje coś poza dozwolonymi korzeniami — zła ścieżka względna, dowiązanie prowadzące na zewnątrz, junction do innego dysku (plan SPRZATANIE_ARTEFAKTOW, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Asercje w `kasuj`: każda ścieżka po `realpath` musi leżeć **pod** katalogiem projektu albo pod `os.tmpdir()`, nie być którymkolwiek korzeniem ani `.git` projektu; dowiązanie usuwane jako dowiązanie, bez wchodzenia do celu. Pierwszy pomiar (E1) z dowodami negatywnymi: ścieżka w katalogu domowym i `.git` projektu → dwie odmowy, zero skasowanych, `.git` **31 plików przed i 31 po**; junction wskazujący poza kandydata → dowiązanie zniknęło, cel **2 pliki przed i 2 po**. Klon repozytorium z obiektami tylko do odczytu skasowany bez ani jednego niepowodzenia (14 923 442 B → 0 B). E2: kasowanie 141,2 MB w katalogu roboczym etapu zamkniętego, zero niepowodzeń, `%TEMP%` i `work/` puste po operacji. E3: trzeci przebieg, katalog roboczy etapu i pusty katalog tematu, zero niepowodzeń; **ochrona `etap trwa` pokazana w obie strony w jednym dniu** — ten sam katalog był chroniony przy statusie `W TOKU` i został kandydatem dopiero po `ZREALIZOWANY`. **E4: czwarty przebieg, pierwszy na cudzym projekcie** — dwie pozycje (katalog etapu zamkniętego 90 MB i katalog w `%TEMP%` 35 MB), **125,0 → 0,0 MB**, zero niepowodzeń, a pomiar ponowny dał zero kandydatów. Asercje korzeni wytrzymały też przypadek, którego nikt nie planował: ścieżka **dysko-relatywna ze znakiem CR w środku** (rozjechane escapowanie w `node -e`) rozwinęła się względem katalogu projektu, `lstat` jej nie znalazł i **żadna operacja nie wykonała się na dysku**. Ujawniło to jednak osobną wadę raportowania: taka pozycja jest meldowana jako `skasowane`, nie jako `nieobecne` (`work-artifacts.js:843`) — wołający nie ma po czym poznać, że jego lista jest zepsuta. Wada zapisana w `STATE.md`, poza zakresem planu. Niezmierzone bez zmian: junction na inny dysk i ścieżka dłuższa niż limit Windows. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |

| M1 | Skill wspólny dla dwóch narzędzi pokaże listę tego drugiego — sesja w Cursorze zobaczy modele Anthropic (plan REKOMENDACJA_MODELU, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | O liście rozstrzyga **nazwa pliku**, którą podaje adapter wołający rdzeń (Aneks A) — treść skilla jest jedna i nazwy narzędzia nie zna; która lista obowiązuje, mówi hook startu jednym zdaniem (zasada 8). Pierwszy pomiar (E1) na dwóch projektach kontrolnych w jednym przebiegu: projekt obsłużony hookiem Claude Code ma w `.claude/relai/` **wyłącznie** `MODELE-claude-code.md`, projekt Cursora **wyłącznie** `MODELE-cursor.md`; treść obu kopii zgodna sumą ze źródłem adaptera. Otwarte, bo zmierzone na hookach uruchomionych z repozytorium, a **nie w żywej sesji Cursora** — reguły 1.7.0 i 1.8.0 tego adaptera też nigdy nie były w nim uruchomione. **E4: mechanizm jest wydany (1.9.0) i zmierzony po stronie Claude Code w świeżej sesji z wydanego cache'u** — projekt kontrolny bez podłożonego hooka dostał zdanie o liście i zdanie o jej wieku z pliku `MODELE-claude-code.md`. Powód otwarcia bez zmian i **jedyny**: żadna z tych ścieżek nie była uruchomiona w aplikacji Cursora. **CURSOR_1_9_1 (2026-09-04):** hook Cursora na protokole aplikacji (`workspace_roots`, BOM) produkuje zdanie o `MODELE-cursor.md`, nie o liście Claude Code; para wariantów wieku zgadza się z E3. Sesja GUI w repozytorium RelAI bez zainstalowanego adaptera tego zdania **nie dostała**, a `/relai-models` zgodnie z procedurą nie zgadła narzędzia — to jest pozostały kształt ryzyka tutaj, nie rozjazd list. Zmierzone: 2026-09-03 (E1), 2026-09-04 (E4), 2026-09-04 (CURSOR_1_9_1) |
| M2 | Kopia listy w projekcie zostaje nadpisana przy starcie sesji i zjada odświeżenie zrobione komendą (plan REKOMENDACJA_MODELU, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | `provisionModelList()` kopiuje **tylko wtedy, gdy pliku nie ma** — jedyna różnica wobec `provisionTemplates()`, które nadpisuje przy każdym starcie. Dowód negatywny (E1): plik zmieniony ręcznie w projekcie kontrolnym przeżył ponowne uruchomienie hooka, suma po normalizacji CRLF → LF `ecc6d18d9f6ccf65` przed i po; kontrola pozytywna w tym samym przebiegu — skasowany plik powstał ponownie z sumą źródła. Otwarte do czasu, aż istnieje druga droga zapisu do tego pliku: `/relai-models` z E2 pisze do tej samej kopii, a `/relai-update` do katalogu obok. **E2: druga droga zapisu istnieje i przeżywa start sesji.** Po odświeżeniu w projekcie kontrolnym Claude Code suma listy `f82ee8da0dbe7997` przed ponownym uruchomieniem hooka i po nim, a hook zameldował nową datę (`z dnia 2026-09-04`) zamiast starej; w projekcie Cursora to samo z sumą `65eca9cbea99f0b3`. Otwarte już tylko z powodu `/relai-update`, którego ta droga jeszcze nie dotknęła. **E4: trzecia droga ma odtąd zapisany zakaz** — wiersz `Lista modeli` w tabeli stanu docelowego `/relai-update` kończy się zdaniem „samej listy `.claude/relai/MODELE-<narzędzie>.md` **nie ruszasz** — kopia w projekcie jest trwała i przeżywa aktualizację". Zakaz jest **napisany, nie zmierzony**: pierwszy przebieg `/relai-update` na projekcie z ręcznie poprawioną listą jeszcze się nie odbył i to jest jedyny powód, dla którego ryzyko zostaje otwarte. Zmierzone: 2026-09-03 (E1), 2026-09-04 (E2) |
| M3 | Strona dokumentacji zmienia układ i odczyt z sieci zwraca śmieci albo nic (plan REKOMENDACJA_MODELU, ryzyko 3) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Odświeżenie zawsze kończy się pokazaniem różnicy i pytaniem; niepowodzenie zostawia starą listę **z jej datą**, nigdy pustą. Pomiar E2 na odczycie adresu nieistniejącego (`HTTP 404 Not Found`): lista w projekcie kontrolnym została z sumą `1f67fe1bc954ecdc` i `list-date: 2026-09-03`, czyli dokładnie taka jak przed przebiegiem — dowód treścią pliku, nie komunikatem. Niezmierzone: strona odpowiadająca **200 ze zmienionym układem** (odczyt „udany", treść bez nazw) — to jest realny kształt tego ryzyka i czeka na pierwszy taki przypadek. **E4: stan po wydaniu bez zmian** — komenda jest w cache'u 1.9.0 i od tej pory może ją wywołać każdy projekt, więc szansa na trafienie rośnie, ale sam mechanizm ochrony (różnica przed zapisem, stara lista przy niepowodzeniu) jest ten sam co zmierzony w E2. Zmierzone: 2026-09-04 (E2) |
| M5 | Nazwy modeli zmieniają się szybciej niż wydania RelAI (plan REKOMENDACJA_MODELU, ryzyko 6) | **Średni** (2026-09-04) | **OTWARTE** | Lista mieszka w adapterze **i** w projekcie; `/relai-models` aktualizuje kopię projektu bez wydawania nowej wersji pluginu. Pierwsze realne odświeżenie (E2) potwierdziło, że ryzyko nie jest teoretyczne: strona aliasów wymienia dziś dziesięć pełnych ID (`claude-opus-5` … `claude-fable-5`), a lista Cursora ~45 pozycji od pięciu dostawców — wobec czterech i trzech pozycji w listach RelAI. Od E3 lista ma wiek i próg: powyżej **7 dni** start sesji mówi jedno zdanie z propozycją `/relai-models`, poniżej — zero znaków (zmierzone parą wariantów różniącą się wyłącznie `list-date`: 258 znaków wobec 0, potwierdzone w świeżej sesji CLI odpowiedzią `BRAK LINII`). **E4: pierwszy pełny cykl domknięty** — lista, komenda, próg i **wydanie** (1.9.0, potwierdzone treścią plików z cache'u; dwanaście komend, obie listy, zdanie o wieku działające w świeżej sesji z wydanej wersji). Otwarte już **wyłącznie** z pierwszego powodu: przypomnienie mówi o wieku listy, a nie o tym, że dostawca zmienił nazwy — lista tygodniowa może być świeża i nieprawdziwa naraz. To jest trwała własność mechanizmu, nie zaległość wydania. Zmierzone: 2026-09-04 (E2, E3, E4) |
| W1 | Wydanie pluginu wychodzi bez bramki walidacyjnej narzędzia docelowego — format manifestu i nagłówków sprawdzamy własnym walidatorem, który zna tylko to, co ktoś w nim opisał (wątek samodzielny, 2026-09-06) | **Wysoki** (2026-09-06, przy powstaniu wpisu) | **OTWARTE** | Trzy kolejne wydania (2.1.0, 2.1.1, 2.1.2) wyszły z pluginem, który w Claude Code nie ładował komend, a wykrył to **użytkownik oknem `/plugin`**, nie żaden pomiar: log aplikacji o nieważnym manifeście milczał, a skaner czytał go mimo wszystko i wypisywał ostrzeżenia sugerujące, że format jest w porządku. `claude plugin validate` istniało przez cały ten czas i wskazuje pole oraz powód w jednym wywołaniu. Zmierzone 2026-09-06: na cache'u 2.1.1 `✘ Found 1 error: plugins[0] plugin.json → agents: Invalid input`, na repozytorium po naprawie `✔ Validation passed`. Częściowa mitygacja **jest**: `validate-adapters.js` blokuje katalog w polu `agents` (P-011), korzeniowy `skills/` (P-010) i dwukropek bez cudzysłowu w nagłówkach komend (P-012) — każda kontrola pokazana w obie strony. Ryzyko zostaje otwarte, bo mitygacja jest **retrospektywna**: chroni przed trzema znanymi kształtami, a nie przed czwartym, i nie zna schematu narzędzia. Zamknie je dopiero wpisanie `claude plugin validate` do sekwencji wydania P-005 jako kroku obowiązkowego przed tagiem — to jest decyzja człowieka i stoi w `STATE.md` |
| U1 | Pilotaż kończy się bez ani jednego uczestnika spoza autora — brak kandydatów albo brak odpowiedzi (plan PIERWSI_UZYTKOWNICY, sekcja 7) | **Średni** (2026-09-13, przy wejściu ryzyka do rejestru) | **OTWARTE** | Mitygacja z planu: własna sieć Łukasza i istniejący wpis na Odpalone, każde zaproszenie zanotowane, raport w terminie **także przy małej próbie**, z werdyktem „wynik nierozstrzygający". Materiały gotowe od 2026-09-13 (`ZAPROSZENIE.md`, cztery bloki), rejestr `PROBY.md` czeka pusty. **Stan faktyczny na dziś: 0 kontaktów, 0 prób, 0 aktywacji** przy progach 3–5 uczestników / ≥3 aktywacje / ≥2 powroty. Ryzyko nie zmaterializowało się jeszcze **ani nie zostało odparte** — zegar nie ruszył, bo wysyłka wymaga dyspozycji, której nie było. Termin graniczny raportu: **2026-10-03** (21 dni od akceptacji, SZACUNEK). Doszła własność, której plan nie przewidywał: materiał demo, którym zaproszenie się posługuje, jest **nieczytelny na telefonie** (pomiar E2) — a to jest urządzenie, na którym większość odbiorców zobaczy link pierwszy raz |
| M6 | Załoga stoi na flagach CLI trzech dostawców (`claude -p --permission-mode`, `codex exec -s`, `agent -p --mode`), które zmieniają się szybciej niż wydania RelAI (wątek ORKIESTRACJA) | **Średni** (2026-09-06) | **OTWARTE** | Flagi stoją w jednym miejscu (`buildCommand` w `core/process/crew.js`), a test pilnuje trybu read-only bez `--write` i zamkniętej listy flag zakazanych; porażka `run` kończy się statusem `failed` z `stderr` w pliku przebiegu, nigdy ciszą, a krok 7 komendy każe czytać raport zadania i `git status`, nie kod wyjścia. Zmierzone 2026-09-06 z Claude Code jako gospodarza: Codex read-only i write, Cursor read-only (prompt stdin-em), zagnieżdżony Claude Code read-only — trzy narzędzia, cztery zadania `done`. Otwarte, bo kierunki z Codeksa i Cursora jako gospodarza i zapis przez Cursora są NOT TESTED, a zmiana flagi u dostawcy nie ma dziś własnego sygnału poza porażką przebiegu |

| O1 | Hook `UserPromptSubmit` w Claude Code nie podmienia promptu, tylko dokłada kontekst — „tryb ciągły" może być nierealizowalny w zakładanym kształcie (plan OPTYMALIZATOR_PROMPTOW, ryzyko O1) | **Wysoki** (2026-09-14, przy akceptacji planu) | **OTWARTE** | Pomiar idzie **pierwszym krokiem E4**, przed napisaniem czegokolwiek: hook kontrolny w projekcie neutralnym, dowód treścią odpowiedzi, nie komunikatem. Ścieżka odwrotu zapisana z góry — tryb ciągły degraduje do wstrzykniętej reguły, która każe modelowi najpierw pokazać różnicę; funkcja zostaje, zmienia się nośnik. Niezmierzone: cokolwiek — ryzyko wchodzi do rejestru przed pierwszym przebiegiem |
| O4 | Tryb ciągły kosztuje turę przy każdym zdaniu — praca zwalnia i drożeje (plan OPTYMALIZATOR_PROMPTOW, ryzyko O4) | **Średni** (2026-09-14, przy akceptacji planu) | **OTWARTE** | Filtr pomijania jest częścią E4, nie dodatkiem: komendy RelAI, frazy sesji, krótkie potwierdzenia i pytania o kod przechodzą nietknięte. Mierzone parą przypadków w jednym przebiegu, z których jeden **musi** trafić (zasada aktywna 5). Wyłącznik jest wierszem w `USTAWIENIA.md`, więc odwrót kosztuje jedną edycję. Sprawa „czy tryb ciągły ma licznik kosztu" czeka na człowieka — bez licznika opłacalność oceniamy na wrażeniu, nie na danych |
| O6 | Kolizja z zainstalowanym `ecc:prompt-optimizer` — dwa skille o podobnych opisach wyzwalają się nawzajem albo zamiast siebie (plan OPTYMALIZATOR_PROMPTOW, ryzyko O6) | **Średni** (2026-09-14, przy akceptacji planu) | **OTWARTE** | Komenda wołana wprost kolizji nie ma — to jest jeden z powodów, dla których E1 daje komendę, a nie skill. Opis trybu ciągłego będzie zawężony markerem projektu RelAI, jak opisy pozostałych skilli (zasada aktywna 9). Otwarte, bo rozstrzygnięcie należy do człowieka: wyłączenie cudzego pluginu jest zmianą w konfiguracji użytkownika i RelAI jej nie wykona sam. Stan faktyczny: skill ECC obecny w konfiguracji, 16 843 B, autor YannJY02 |
| O9 | Tani model nie udźwignie optymalizacji — prompt wychodzi gorszy niż zdanie, które człowiek podyktował, a oszczędność zamienia się w koszt poprawek (plan OPTYMALIZATOR_PROMPTOW, ryzyko O9) | **Wysoki** (2026-09-14, przy akceptacji planu) | **OTWARTE** | **E2 istnieje wyłącznie po to, żeby to zmierzyć.** Ten sam zestaw surowych zdań przez Haiku 4.5, Sonneta 5 i Opusa 5; instrument liczy pokrycie dziewięciu wymiarów i koszt jednego przerobienia, osobno z blokiem kontekstu i bez niego — różnica między tymi przebiegami jest ceną utraconego cache'u (ryzyko O10). Kontrola pozytywna: podłożony prompt bez formatu wyjścia i bez kryterium sukcesu **musi** zostać zgłoszony jako niepokryty. Ceny bazowe (dokumentacja Anthropic, stan 2026-06-24): Haiku 4.5 $1/$5, Sonnet 5 $2/$10, Opus 5 $5/$25 za milion tokenów; kontekst 200K u Haiku wobec 1M u pozostałych. Ścieżka odwrotu: Sonnet 5, potem model sesji bez delegacji. Zapisujemy **każdy** wynik, także ten, który przewraca założenie o Haiku |

> Ryzyka zamknięte R2, M4 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-09-04.md](archiwum/ryzyka/RYZYKA_2026-09-04.md)
> — przeniesione 2026-09-04, suma kontrolna `e2542c88b2ccd9a8`.

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka
- ~~**Akceptacja planu PIERWSI_UZYTKOWNICY**~~ *(rozstrzygnięte 2026-09-12 — plan zaakceptowany i zamrożony; E1 i E2 zamknięte)* · 2026-09-12 · [wpis 2026-09-12 — Plan pierwszych użytkowników](#2026-09-12--plan-pierwszych-użytkowników)

- ~~**Akceptacja planu OPTYMALIZATOR_PROMPTOW**~~ *(rozstrzygnięte 2026-09-14 — Łukasz zaakceptował
  plan bez uwag; plan zamrożony, `PROMPT_ETAP_1.md` wygenerowany, E1 gotowy do startu)* · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- ~~**Nazwa komendy optymalizatora**~~ *(rozstrzygnięte 2026-09-14 — `/relai-prompt`, zgodnie
  z konwencją rodziny komend)* · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Który model zostaje domyślny, jeśli pomiar E2 wyjdzie nierozstrzygający** — na przykład gdy
  Haiku pokryje siedem wymiarów na dziewięć i wypadnie na wybiórczym czytaniu decyzji. Wybór między
  tańszym i słabszym a droższym i pewnym jest decyzją o jakości pracy, nie o cenniku. · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Kolizja z zainstalowanym `ecc:prompt-optimizer`** — dwa skille o podobnych opisach mogą wyzwalać
  się nawzajem albo zamiast siebie. Wyłączenie cudzego pluginu jest zmianą w konfiguracji
  użytkownika, więc RelAI jej nie wykona sam. · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Czy tryb ciągły optymalizatora ma licznik kosztu** — dokłada około pół sesji do E3 i jest
  jedynym sposobem, żeby ocenić opłacalność trybu na danych zamiast na wrażeniu. · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan** — plan OPTYMALIZATOR_PROMPTOW daje
  im wyłącznie komendę; tryb ciągły wymaga poznania ich mechanizmu przechwytywania promptu.
  · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Kiedy wraca plan PIERWSI_UZYTKOWNICY** — wstrzymany 2026-09-14, nie zamknięty; E3 i trzy bramki
  czekają nietknięte, a termin graniczny raportu traci moc do czasu wznowienia. · 2026-09-14 ·
  [wpis 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW](#2026-09-14--nowy-plan-optymalizator_promptow-pilotaż-wstrzymany-na-wniosek-właściciela)

- **Dyspozycja publikacji i kontaktów (plan PIERWSI_UZYTKOWNICY)** — cztery bloki tekstu czekają
  gotowe w `docs/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md`. Bez wskazania kanału, treści i odbiorców
  nic nie zostanie wysłane, `PROBY.md` zostanie pusty, a E3 zamknie plan wynikiem
  nierozstrzygającym. · 2026-09-13 ·
  [wpis 2026-09-13 — E2 zamknięty](#2026-09-13--e2-zamknięty-materiały-zaproszenia-gotowe-demo-nieczytelne-na-telefonie)

- **Wskazanie uczestników pilotażu** — trzy do pięciu osób z własnym małym, niekrytycznym
  projektem. Brak kandydatów nie uruchamia bezterminowej rekrutacji. · 2026-09-13 ·
  [wpis 2026-09-13 — E2 zamknięty](#2026-09-13--e2-zamknięty-materiały-zaproszenia-gotowe-demo-nieczytelne-na-telefonie)

- **Czy powstaje nowa wersja materiału demo pod ekran telefonu** — dziś na 375 px czytelny jest
  wyłącznie tytuł sceny (12,50 px przy progu 8 px), treść scen ma 3,52–7,42 px, a wejście brandowe
  zajmuje 3 z 25 sekund. Naprawa to nowy render; źródła renderu nie istnieją, więc łączy się
  z decyzją o ich trwałym miejscu (Aneks A, ryzyko A2). Rozstrzygnięcie należy do E3. · 2026-09-13 ·
  [wpis 2026-09-13 — E2 zamknięty](#2026-09-13--e2-zamknięty-materiały-zaproszenia-gotowe-demo-nieczytelne-na-telefonie)

- **Rozjazd manifestu z produktem przy opisie repozytorium** — `description`
  w `.claude-plugin/plugin.json` mówi „…framework for Claude Code", a RelAI ma trzy adaptery;
  `keywords` nie zawiera ani jednej nazwy narzędzia. Wizytówka GitHuba ma skopiować manifest, czy
  najpierw poprawiamy manifest (czyli podbicie wersji i pełna sekwencja wydania)? · 2026-09-13 ·
  [karta odnogi OPIS_REPO](archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md)

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — 7 z 32 pozycji
  „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą). Poszerzyć listę w rdzeniu
  czy przepisać adnotacje w cudzym projekcie? · 2026-09-01 ·
  [wpis 2026-09-01 — E6: wydanie 1.7.0](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--e6-wydanie-170-pomiar-po-restarcie-i-pierwsza-rotacja-z-przepięciem-linków)

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)

- **Ryzyko R2 zamknięte na nieaktualnej przesłance** — 2026-09-03 zamknięto je zdaniem „nie zostanie
  zmierzone nigdy", opartym na wyczerpanym limicie `claude -p` (L-0032). W E1 tego samego dnia
  `claude -p` **zadziałał** i poprowadził pomiar świeżych sesji (L-0084). Otworzyć R2 ponownie,
  przepisać jego treść czy zostawić zamknięte z adnotacją? · 2026-09-03 ·
  [wpis 2026-09-03 — E1 planu REKOMENDACJA_MODELU](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-03--e1-planu-rekomendacja_modelu-pytanie-o-model-pokazuje-nazwy-nie-klasy)

- **Czy ochrona konfiguracji ma zostać przy werdykcie `ask`** — w sesji z automatyczną akceptacją
  edycji `ask` nie zatrzymuje niczego, więc edycja sekcji niemutowalnej **cudzego** `CLAUDE.md`
  przechodzi mimo poprawnego werdyktu hooka. Podnieść do `deny` dla cudzego projektu (własny
  zostaje przy `ask`), zostawić bez zmian, czy opisać to jako świadomą granicę? · 2026-09-04 ·
  [wpis 2026-09-04 — Blokada guardraila pokazana w żywej sesji](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--blokada-guardraila-pokazana-w-żywej-sesji-ochrona-konfiguracji-okazuje-się-doradcza)

- **Ponowna instalacja pre-commita w projektach z hookiem sprzed 1.9.2** — stary układ
  (bezrozszerzeniowy `pre-commit` + `relai-secret-scan.js`) przewraca się w projekcie
  z `"type": "module"` i blokuje każdy commit. Dotyczy PolyFlow, JiraManagera i projektów
  zewnętrznych; instalacja jest jawną czynnością człowieka, więc RelAI jej nie wykona sam.
  · 2026-09-04 ·
  [wpis 2026-09-04 — Cztery defekty pre-commita](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--cztery-defekty-pre-commita-ze-zgłoszenia-zewnętrznego-wydanie-192)

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

> Wpisy z okresu 2026-09-01 … 2026-09-03 (22 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md)
> — przeniesione 2026-09-04, suma kontrolna `4829effc7c2db525`.

> Wpisy z okresu 2026-09-03 … 2026-09-06 (29 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md)
> — przeniesione 2026-09-14, suma kontrolna `f7e63de9ea130a59`.

### 2026-09-06 — Wydanie 2.1.0 potwierdzone w cache'u; ikony README naprawione przyczyną, nie objawem

**Zrobione:**

- **Rotacja ryzyk: nie odbyła się, bo mechanizm nie ma czego wziąć.** Sekcja „Stan otwartych
  ryzyk" waży **16 625 B (16,2 KB) przy progu 12 KB**, ale wszystkie **dziesięć** wierszy (R5, P1,
  P2, S1, S2, M1, M2, M3, M5, M6) ma status inny niż `ZAMKNIĘTE`, a brzmienia statusów to
  `ZMIERZONE` i `OTWARTE` — żadne nie trafia na zamkniętą listę kompresji komórek
  (`zmitygowan`, `przyj`+`świadom`). To jest przypadek opisany wprost w `SPEC_ARCHIWUM.md`:
  część rotowalna 0 KB, dolna granica równa wadze sekcji. Plik **nietknięty**; decyzja
  o podniesieniu progu albo zamknięciu ryzyka należy do człowieka. Dla orientacji: dziesięć
  komórek „Mitygacja" waży 14,3 KB z 16,2 KB sekcji, najcięższe P1 (2296 znaków), S1 (2017),
  S2 (1794).
- **`/relai-update` zatrzymany na kroku 1 zgodnie z własną bramką.** Marker projektu 2.1.0,
  wersja docelowa wykonywanej komendy 2.0.0 (sesja wystartowała przed aktualizacją pluginu),
  więc rozstrzygnięcie brzmiało „projekt nowszy niż plugin → nie cofasz projektu". Zero zmian:
  ani pliku, ani markera, ani wpisu — zgodnie z zakazem „nie cofasz projektu do starszej wersji".
- **Ikony README: rozpoznana przyczyna i naprawa układu tabeli.** Sprawa stała otwarta w „Czeka
  na człowieka" od 2026-09-01 z pytaniem „grubość 3.2 czy scalenie kolumn"; rozstrzygnięta
  2026-09-06 na **scalenie kolumny ikony z kolumną komendy**. Tabela komend ma odtąd **dwie
  kolumny zamiast trzech**, ikona stoi w jednej komórce z nazwą komendy
  (`<img … width="24" align="absmiddle">` plus `` `/relai-…` ``). Grafiki **nie ruszono**:
  grubość kreski zostaje 2.6 we wszystkich plikach.
- **Dwie brakujące ikony dorysowane** — `docs/zasoby/branding/ikony/models.svg` (trzy pozycje
  listy `#8a7f70`, terakotowa czteroramienna gwiazda świeżości jako wypełniony kształt — celowo
  inna forma niż kreskowane iskry `clean.svg`) i `crew.svg` (dwa obrysowane krążki `#8a7f70`
  z tyłu, jeden wypełniony `#c4643c` z przodu — załoga i orkiestrator; bez linii, żeby nie
  kolidować z `branch.svg`). Oba w konwencji zestawu: `viewBox 0 0 48 48`, `stroke-width 2.6`,
  `stroke-linecap/linejoin="round"`, `role="img"` z etykietą ASCII. Komplet ikon: **13 z 13**.
- Opis `/relai-crew` w tabeli README skrócony z **204 do 95 znaków**; opis `/relai-models`
  przywrócony bez zmian po tym, jak skróciłem go poza zakresem zgody.

**Zweryfikowane — jak dokładnie:**

- **Wydanie 2.1.0 doszło na miejsce.** `main` == `origin/main` (commit `6bec097` na zdalnym);
  cache pluginu `~/.claude/plugins/cache/relai/relai/2.1.0/` z `plugin.json` → `"version":
  "2.1.0"`; zawartość policzona: **13** komend (z `relai-crew.md`), **3** agenty
  (`relai-coder`, `relai-tester`, `relai-reviewer`), **15** skilli (z `relai-crew/`).
  Sesja nadal wykonuje komendy z 2.0.0, bo wystartowała przed aktualizacją.
- **Przyczyna zmniejszenia ikon zmierzona, nie zgadnięta.** Pliki SVG są nietknięte od 1.8.0
  (`6dba2a4`) — zmieniła się długość sąsiedniej kolumny. Opisy w kolumnie trzeciej: `/relai-crew`
  **204** znaki wobec 67–100 w pozostałych dwunastu wierszach (drugi najdłuższy: `/relai-models`
  100). Przy `table-layout: auto` komórka z 204 znakami żąda szerokości dla trzeciej kolumny,
  pierwsza dostaje resztki, a `.markdown-body img { max-width: 100% }` skaluje obrazek poniżej
  deklarowanych 24 px. Po naprawie rozpiętość kolumny opisu wynosi **67–100** znaków, a kolumn
  jest dwie zamiast trzech.
- Zestaw trzynastu ikon obejrzany w 48 px i 24 px na tle kremowym `#fffdf7` i na tle GitHuba
  w trybie ciemnym `#0d1117` — obie nowe czytelne w 24 px na obu motywach. Podgląd był plikiem
  roboczym pod `docs/AUDYT_*.html` (wzorzec z `.gitignore`, potwierdzony `git check-ignore`)
  i został skasowany razem z kopią w `%TEMP%`.

**Świadomie odłożone:**

- Rotacja ryzyk i kompresja komórek — patrz wyżej: brak materiału, nie zaległość.

**Do zrobienia przez człowieka:**

- **Tag `v2.1.0` nie istnieje na zdalnym** — są tylko `v1.10.0` i `v2.0.0`, mimo że cache
  pobrał 2.1.0 (marketplace ciągnie z gałęzi, nie z wydań). Jeśli tagi mają zostać śladem
  wydań: `git tag v2.1.0 6bec097 && git push origin v2.1.0`.
- Decyzja o sekcji ryzyk: podnieść próg `ryzyka` w wierszu `Budżet startu sesji` czy zamknąć
  któreś z dziesięciu otwartych ryzyk. Bez jednej z tych rzeczy raport startu będzie meldował
  przekroczenie przy każdej sesji.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-06 — Regresja 2.0.0: korzeniowy `skills/` kasował komendy Claude Code; naprawione wydaniem 2.1.1

**Zrobione:**

- **Rozpoznanie: `/relai` nie podpowiada niczego w Claude Code od wydania 2.0.0.** Aplikacja
  skanuje katalog `skills/` **w korzeniu pluginu** niezależnie od `.claude-plugin/plugin.json`
  i przy kolizji nazw pomija własne komendy jako „legacy". Korzeń zawierał skille generowane dla
  **Codeksa** (`.codex-plugin/plugin.json` → `"skills": "./skills/"`) o nazwach identycznych
  z komendami, bo jedne i drugie powstają z tych samych plików. Oba marketplace'y mają
  `"source": "./"`, więc artefakt jednego adaptera leżał fizycznie wewnątrz pluginu drugiego.
- **Naprawa: `skills/` → `adapters/codex/skills/`.** Zmiana obejmuje trzy miejsca —
  `.codex-plugin/plugin.json` (ścieżka), `adapters/codex/generate-skills.js` (domyślne wyjście
  `generate` i `verify`) oraz sam katalog, przeniesiony `git mv`, więc historia plików zostaje.
  Korzeń repozytorium ma odtąd siedem pozycji i **żadnego** katalogu `skills/`.
- **Blokada powrotu w walidatorze.** `core/tools/validate-adapters.js` odmawia, gdy w korzeniu
  pojawi się `skills/`, z komunikatem wskazującym P-010 i właściwe miejsce. To jest mechanizm,
  nie notatka: regresja weszła cicho i przez pięć dni nikt jej nie zauważył, bo nic nie krzyczało.
- Wersja **2.1.1** w pięciu źródłach i w markerze `docs/USTAWIENIA.md`; `relai-update` (v8),
  skill `relai-core` (v10), `README.md`, `KOMENDY.md`, README adapterów Cursora i Codeksa,
  rejestr `ARTEFAKTY.md`, `STATE.md`, nowa pułapka **P-010**.

**Zweryfikowane — jak dokładnie:**

- **Pomiar rozstrzygający, czy Codex przyjmie ścieżkę spoza korzenia** — bo wszystkie **20**
  zainstalowanych pluginów Codeksa deklaruje `"./skills/"` i precedensu nie było. Kopia repozytorium
  w `%TEMP%` z przeniesionym katalogiem, zarejestrowana jako lokalny marketplace w **izolowanym
  `CODEX_HOME`** (instalacja użytkownika nietknięta), a następnie `codex debug prompt-input` —
  narzędzie renderujące listę widzianą przez model **bez sesji API**. Wynik: **15 skilli**
  `relai-*` (13 procedur + `relai-core` + `relai-planning`). Trzynastu procedur nie ma nigdzie
  indziej w drzewie, więc Codex czyta ścieżkę zagnieżdżoną. Pierwsza próba, przez `codex exec`,
  padła na `401 Unauthorized` — izolowany `CODEX_HOME` nie ma poświadczeń; `debug prompt-input`
  obchodzi to bez dotykania pliku z sekretami.
- **Blokada walidatora pokazana w obie strony**: korzeń pusty → kod 0; podłożony pusty `skills/`
  → `ZNALEZIONO 1 problemow` z komunikatem o P-010; katalog usunięty → znowu kod 0.
- `node --test` na trzech katalogach — **36/36**. `generate-skills.js --verify` — 13 + 2 spójne.
  `validate-adapters.js` — „5 zrodel, wartosc 2.1.1". `git status` pokazuje przeniesienie jako
  `R` (rename), nie jako parę usunięcie/dodanie.
- **Zasięg regresji policzony z cache'u wersji**: 1.8.1–1.9.2 nie miały korzeniowego `skills/`
  (komendy działały), 2.0.0 miało 14 skilli przy 12 komendach, 2.1.0 — 15 przy 13. Pierwszy skip
  w logu aplikacji: **2026-09-05 23:26:28**, czyli tuż po instalacji 2.0.0.

**Ustalone przy okazji:**

- **`PRZENOSNOSC.md` 2.3 jest nieaktualne co do wywołania procedur w Codeksie.** Zapis z 2026-08-12
  mówi o `$nazwa-skilla`; użytkownik potwierdził, że w aplikacji desktopowej Codeksa `/relai`
  podpowiada komplet. Sekcja wymaga odświeżenia — zapisane w `STATE.md`, poza zakresem tej naprawy.
- Cursor tej wady nie ma: instalator kładzie komendy do `.cursor/commands/` i tylko **dwa** skille,
  więc nazwy się nie pokrywają.

**Do zrobienia przez człowieka:**

- Wydanie 2.1.1: tag, release, `claude plugin update relai@relai`, **restart aplikacji**
  i sprawdzenie, że `/relai` podpowiada trzynaście komend. Dowodem negatywnym jest brak linii
  `[PluginScan] Skipping legacy command "relai:…"` w `%LOCALAPPDATA%\Claude\logs\main.log`.
- Tagi `v2.1.0` i `v2.1.1` nie istnieją na zdalnym — repozytorium ma dziś tylko `v1.10.0` i `v2.0.0`.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-06 — Druga przyczyna tej samej awarii: katalog w polu `agents` unieważniał cały manifest (2.1.2)

**Zrobione:**

- **Rozpoznanie zamknięte dopiero po wskazówce użytkownika.** Po wydaniu 2.1.1 komend nadal nie
  było. Okno `/plugin` pokazało to, czego nie widać ani w sesji, ani w logu aplikacji:
  `Plugin relai has an invalid manifest file … Validation errors: agents: Invalid input`.
  `claude plugin list` potwierdził: `Status: ✘ failed to load`.
- **Przyczyna:** `.claude-plugin/plugin.json` miał `"agents": ["./adapters/claude-code/agents/"]`.
  Pola `commands` i `skills` przyjmują katalogi, pole **`agents` wyłącznie pliki `.md`** — ta
  niesymetryczność kusi analogią. Katalog unieważnia manifest **w całości**, więc razem z agentami
  przestają działać `commands`, `skills` i `hooks`.
- **Naprawa:** trzej agenci wymienieni po jednym pliku. Wersja **2.1.2** w pięciu źródłach
  i markerze.
- **Blokada w walidatorze projektu:** `validate-adapters.js` odmawia, gdy wpis w `agents` nie jest
  plikiem `.md`, z odsyłaczem do P-011. Nowa pułapka **P-011**.
- **Dwie wady maskowały się nawzajem.** Dopóki korzeń miał `skills/` (P-010), plugin wyglądał na
  działający, bo skille odnajduje **domyślny skan**, bez manifestu. Usunięcie korzenia w 2.1.1
  zabrało tę protezę i dopiero wtedy P-011 stało się widoczne. Kolejność napraw była więc
  konieczna, choć wyglądała na nieskuteczną.

**Zweryfikowane — jak dokładnie:**

- `claude plugin validate` na cache'u 2.1.1: `✘ Found 1 error: plugins[0] plugin.json → agents:
  Invalid input`. Na repozytorium po naprawie: `✔ Validation passed` (po wyrównaniu numerów wersji;
  wcześniej samo ostrzeżenie o rozjeździe 2.1.1 vs 2.1.2 między wpisem marketplace'u a `plugin.json`).
- Blokada walidatora pokazana w obie strony: manifest z listą plików → kod 0; podłożony katalog
  w `agents` → `ZNALEZIONO 1 problemow` z komunikatem P-011; przywrócony → kod 0.
- `validate-adapters.js` — „5 zrodel, wartosc 2.1.2", 6 ścieżek z `plugin.json`.

**Lekcja procesowa:**

- **`claude plugin validate <ścieżka>` istniało przez cały czas** i wskazałoby obie wady w sekundę.
  Trzy wydania (2.1.0, 2.1.1) wyszły bez tej bramki, a diagnozę pchnęło dopiero okno `/plugin`
  otwarte przez użytkownika. Narzędzie producenta sprawdzające **własny** format bije każdy pomiar
  pośredni: log aplikacji milczał o nieważnym manifeście, a skaner CCD czytał go mimo to i wypisywał
  ostrzeżenia o kolizji — czyli sugerował, że manifest jest czytany poprawnie.
- Moje próby przez `claude -p --plugin-dir` były **nierozstrzygające, nie negatywne**: kontrola na
  2.1.0 dała ten sam wynik `BRAK`, co znaczy, że tryb headless nie pokazuje modelowi komend ani
  skilli pluginu. Wniosek wyciągnięty z takiej próby byłby fałszywy.

**Do zrobienia przez człowieka:**

- Wydanie 2.1.2: tag, release, `claude plugin update relai@relai`, restart. Sprawdzian:
  `claude plugin list` ma pokazać `relai@relai` **bez** `failed to load`, a `/relai` — trzynaście komend.
- Wpisać `claude plugin validate` do sekwencji P-005 jako krok obowiązkowy przed tagiem.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-06 — Trzecia, ostatnia przyczyna: dwukropek w opisie zjadał trzynastą komendę (2.1.3)

**Zrobione:**

- **2.1.2 potwierdzone w aplikacji przez użytkownika** — komendy widoczne, agenci załogi
  (`relai-coder`, `relai-tester`, `relai-reviewer`) dostępni, czyli manifest ładuje się w całości.
- **Znaleziony brak przy odbiorze:** komend było **dwanaście, nie trzynaście** — nie ładowała się
  `/relai-crew`. Plik leżał w cache'u 2.1.2, miał poprawny frontmatter, a `claude plugin validate`
  milczał, bo sprawdza **manifest**, nie nagłówki plików komend.
- **Przyczyna:** `description:` w nagłówku to niecytowany skalar YAML, a opis zawierał dwukropek
  ze spacją (`…orkiestratorem celu: wywiad o role…`). Skalar staje się wtedy mapą, nagłówek nie
  parsuje się i komenda wypada — reszta pluginu działa dalej, więc nic nie sygnalizuje awarii.
- **Naprawa:** opis wzięty w cudzysłów, treść bez zmian. Kontrola w `validate-adapters.js`:
  `description` i `argument-hint` każdej komendy nie mogą zawierać `: ` bez cudzysłowu.
  Nowa pułapka **P-012**, wersja **2.1.3**.

**Zweryfikowane — jak dokładnie:**

- **Korelacja policzona na całym zainstalowanym materiale:** przejrzane nagłówki wszystkich komend
  wszystkich pluginów w `~/.claude/plugins/cache` — dwukropek ze spacją w opisie ma **wyłącznie**
  `relai-crew.md` i **wyłącznie** ta komenda się nie ładowała.
- Blokada walidatora pokazana w obie strony: opis w cudzysłowie → `13 sprawdzonych, 0 wadliwych`;
  cudzysłów zdjęty → `ZNALEZIONO 1 problemow` z komunikatem P-012; przywrócony → znowu czysto.
- `generate-skills.js --verify` spójny (cudzysłów przechodzi też do skilla Codeksa),
  `validate-adapters.js` — „5 zrodel, wartosc 2.1.3", `claude plugin validate` — `✔ Validation passed`.

**Ustalone przy okazji:**

- **Codex tego samego opisu nie odrzucał** — w pomiarze z tego dnia `codex debug prompt-input`
  wypisał `relai-crew` wśród piętnastu skilli. Parsery różnią się tolerancją, więc działanie
  procedury w jednym narzędziu nie dowodzi niczego o drugim.
- Opis `/relai-crew` ma **337 znaków** i jest najdłuższy w zestawie — wchodzi do kontekstu każdej
  sesji. Skrócenie zostawiam jako osobną decyzję, poza zakresem tej naprawy.

**Trzy przyczyny jednej awarii — podsumowanie dnia:**

| Wydanie | Przyczyna | Skutek |
|---|---|---|
| 2.1.1 | korzeniowy `skills/` kolidował z nazwami komend (P-010) | wszystkie komendy pomijane |
| 2.1.2 | katalog w polu `agents` unieważniał manifest (P-011) | plugin `failed to load` |
| 2.1.3 | dwukropek w `description` psuł nagłówek YAML (P-012) | jedna komenda znikała |

Każda maskowała następną: dopóki działała pierwsza, druga była niewidoczna, a trzecia ujawniła się
dopiero przy odbiorze poprawnie działającego pluginu.

**Do zrobienia przez człowieka:**

- Wydanie 2.1.3: tag, release, `claude plugin update relai@relai`, restart. Sprawdzian: `/relai`
  ma pokazać **trzynaście** komend, z `/relai-crew` włącznie.
- Wpisać `claude plugin validate` do sekwencji P-005 (wciąż otwarte z poprzedniego wpisu).

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-06 — Zamknięcie dnia: cztery wydania, trzy pułapki, jedna diagnoza od użytkownika

**Zrobione:**

- **2.1.2 potwierdzone w aplikacji, 2.1.3 wydane w repozytorium.** Komendy widoczne, komplet
  trzynastu po naprawie nagłówka `/relai-crew`; agenci załogi dostępni, czyli manifest ładuje się
  w całości. Tagi `v2.1.0`, `v2.1.1`, `v2.1.2`, `v2.1.3` są na zdalnym — do dziś repozytorium
  miało ślad wydań tylko do `v2.0.0`.
- **Wcześniej tego samego dnia:** commit `/relai-crew` (2.1.0), naprawa ikon README (scalenie
  kolumny ikony z kolumną komendy, dwie brakujące ikony, komplet 13/13) oraz trzy naprawy
  dystrybucji opisane w osobnych wpisach.
- **Dwie lekcje:** [[L-0092]] — narzędzie producenta sprawdzające własny format bije każdy pomiar
  pośredni; [[L-0093]] — pomiar bez kontroli na wersji zepsutej nie odróżnia „nie działa" od „nie
  mierzy". Pierwsza dopisana do zasady aktywnej 13, druga bez własnej pozycji w destylacie:
  **limit 15 pozostaje wykorzystany, nie przekroczony**.
- **Nowe ryzyko W1** — wydanie wychodzi bez bramki walidacyjnej narzędzia docelowego.

**Zweryfikowane — jak dokładnie:**

- **Rotacja: nie ruszyła, bo nie miała czego wziąć.** Zmierzone przed wpisem: dziennik 149,4 KB
  (próg 150), lekcje 39,1 KB i 22 wpisy (progi 50 KB / 40), ustawienia 3,0 KB (próg 6),
  `STATE.md` 216 linii (próg 300). Sekcja ryzyk **15,6 KB przy progu 12 KB** — nadal zero ryzyk
  `ZAMKNIĘTE` i zero komórek na zamkniętej liście statusów kompresji, więc część rotowalna wynosi
  0 KB. **Dzisiejsze wpisy przekroczą próg dziennika**, więc rotacja ruszy na starcie następnej sesji.
- **Sprzątanie artefaktów: 30,2 → 0,0 MB**, siedem pozycji, zero niepowodzeń, pomiar ponowny dał
  **zero kandydatów**. Zeszły: katalog zamkniętego wątku `PRECOMMIT_ESM`, cały materiał pomiarowy
  z dziś (`relai-skillpath` 15,9 MB z izolowanym `CODEX_HOME`, `relai-rootcmd` 6,4 MB,
  `relai-cmdtest`) oraz starszy materiał w `%TEMP%` (7,9 MB plus dwa pliki `.bak`). Dziewięć
  pozycji chronionych nietkniętych, w tym dwa katalogi z wzorca grupy „Sekrety" (D-42).
- `node --test` — 36/36; `validate-adapters.js` — „5 zrodel, wartosc 2.1.3", 13 nagłówków komend
  bez wady; `claude plugin validate` — `✔ Validation passed`.

**Do zrobienia przez człowieka:**

- **Wydanie 2.1.3**: release z taga `v2.1.3`, `claude plugin update relai@relai`, restart,
  sprawdzenie, że `/relai` pokazuje trzynaście komend.
- **Wpisać `claude plugin validate` do sekwencji P-005** jako krok obowiązkowy przed tagiem —
  to zamyka ryzyko W1.
- **Sekcja ryzyk 15,6 KB przy progu 12 KB**: podnieść próg czy zamknąć któreś z jedenastu
  otwartych ryzyk. Bez jednej z tych decyzji raport startu melduje przekroczenie przy każdej sesji.
- Opis `/relai-crew` ma 337 znaków i wchodzi do kontekstu każdej sesji — skrócić czy zostawić.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-12 — Plan pierwszych użytkowników

**Zrobione:**

- Oceniono krytykę z Odpalone przekazaną przez Łukasza: potrzeba demo jest zasadna, natomiast
  konieczność monetyzacji i wersji zespołowej pozostaje hipotezą. Sprawdzono dokumenty projektu,
  publiczne pole About repo i oficjalne dokumentacje pamięci Claude Code oraz reguł Cursora.
  Strony Odpalone nie udało się odczytać; źródłem samej krytyki był tekst użytkownika.
- Wywiad rozstrzygnął cel: aktywni użytkownicy i feedback, polscy samodzielni twórcy pracujący
  z AI, mały eksperyment 2–4 sesje bez płatnej promocji. Te odpowiedzi są zgodą na kierunek planu,
  nie akceptacją jego jeszcze nieprzedstawionej treści.
- Utworzono [PLAN.html](plany/PIERWSI_UZYTKOWNICY/PLAN.html),
  [STATUS.md](plany/PIERWSI_UZYTKOWNICY/STATUS.md) i
  [ZRODLA.md](plany/PIERWSI_UZYTKOWNICY/ZRODLA.md). Propozycja obejmuje demo i poprawę wejścia,
  próby spoza autora oraz powrót po przerwie. Proponowane progi: co najmniej 3 aktywacje i 2
  udokumentowane powroty; są kryteriami do akceptacji, nie wynikiem. Szacunek: 3–4 sesje,
  około 5–8 h pracy w oknie 14–21 dni. Wynik nierozstrzygający jest dopuszczony jawnie.
- Wskazanie aktywnego planu zsynchronizowane w AGENTS.md, CLAUDE.md i STATE.md. Istniejąca
  odnoga OPIS_REPO pozostaje zależnością E2, bez tworzenia drugiej odnogi. Model wykonawczy Opus
  i format HTML pochodzą z ustawień. Plany są produktami procesu, wyłączonymi z rejestru
  artefaktów pluginu zgodnie z sekcją „Poza rejestrem” ARTEFAKTY.md.

**Zweryfikowane — jak dokładnie:**

- Builder z core/templates/HTML_PLAN/ (D-87): osadzonych 6 fontów, brak pozostałych znaczników;
  plan nie wymaga symulatora — nie zawiera modelu wyliczeń do regulowania.
- Kontrola pliku: 10 sekcji, 3 bloki zwijane, unikalne identyfikatory i poprawne aria-controls,
  istniejące linki lokalne, brak zewnętrznych zasobów, UTF-8 i prefers-reduced-motion.
- AGENTS.md i CLAUDE.md mają po jednym wskazaniu planu; status DO AKCEPTACJI, wszystkie etapy
  OCZEKUJE, PROMPT_ETAP_1.md nie powstał. git diff --check bez błędów.
- **Podgląd wizualny i interakcje NOT TESTED**: CLI Playwright zakończył wyświetlenie pomocy
  asercją procesu na Windows; narzędzie przeglądarkowe następnie odrzuciło lokalny adres file
  polityką bezpieczeństwa. Nie obchodzono blokady innym adresem ani powierzchnią przeglądarki.
  Kontrola strukturalna nie jest dowodem renderowania ani działania kliknięć.

**Świadomie odłożone:**

- Implementacja etapów, nagranie demo, zmiany README i publikacje — plan czeka na akceptację.
- Nowe funkcje, płatna wersja, osobna strona i szerszy audyt poza ścieżką demo — poza eksperymentem.
- W repo przed pracą był nieśledzony AGENTS.md; zachowano jego treść poza konieczną aktualizacją
  wskazania planu. Bez commita i bez zmian zdalnych.

**Do zrobienia przez człowieka:**

- Ocenić i zaakceptować albo skorygować plan PIERWSI_UZYTKOWNICY. Weryfikacja jego podglądu
  pozostaje jawnie niedomknięta; akceptacja planu nie jest zgodą na wysyłanie zaproszeń.

Autor: RelAI (GPT-6) + Lukasz

### 2026-09-12 — E1 w toku: publiczna instalacja zmierzona, czwarta wada dystrybucji naprawiona (odnoga HOOKI_KORZEN, 2.1.4)

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Plan PIERWSI_UZYTKOWNICY zaakceptowany i zamrożony**; `PROMPT_ETAP_1.md` wygenerowany ze
  specyfikacji, E1 uruchomiony po karcie potwierdzenia.
- **Aneks A do planu** (sekcja 10): materiał demo produkuje agent, nie nagrywa go człowiek. Remotion,
  25 s GIF do README i 60 s MP4 na kanały (SZACUNEK), napisy PL i EN, bez dźwięku, bohater „plan,
  etapy, świeża sesja etapu", replay z neutralnego projektu kontrolnego. Trzy nowe ryzyka A1–A3,
  nowa bramka manualna „kalibracja smaku".
- **Bramka kalibracji zamknięta przed startem etapu**: kierunek wizualny (ciepły papier, zaokrąglone
  karty w lekkim szkle, Caveat jako akcent, chipy etapów, strzałka jako spoiwo) zaakceptowany na
  jednej klatce kluczowej. Po korekcie właściciela klatka przebudowana z ręcznie stawianego SVG na
  HTML z `grid`/`flex` i jednostkami kontenera — **L-0094**, doklejona do zasady aktywnej 15.
- **Pomiar ścieżki obcego użytkownika** (punkt 1 zakresu E1) — świeża instalacja z marketplace
  `nowilus/relai` w izolowanym `CLAUDE_CONFIG_DIR`, bez dotykania konfiguracji właściciela.
- **Odnoga HOOKI_KORZEN utworzona i zamknięta tego samego dnia**: korzeniowy `hooks/` jest dla
  Claude Code katalogiem konwencyjnym, więc hooki Codeksa ładowały się **obok** hooków
  zadeklarowanych w `plugin.json`. Bramka hosta na `CLAUDECODE` w czterech skryptach, kontrola tej
  klasy wady w `core/tools/validate-adapters.js`, pozycja **P-013** w rejestrze pułapek, wersja
  **2.1.4** w pięciu źródłach prawdy i dziewięciu deklaracjach stanu docelowego, skille Codeksa
  przegenerowane (15 plików), dwa wiersze rejestru artefaktów podbite.

**Zweryfikowane — jak dokładnie:**

- **Publiczna wersja to 2.1.3, nie 2.1.2** — marketplace serwuje `main`, a nie obiekt release.
  Świeża instalacja: `✔ enabled`, 13 komend, `claude plugin validate` → `✔ Validation passed`,
  6/6 plików zgodnych sumą z tagiem `v2.1.3` po normalizacji CRLF → LF; kontrola pozytywna na
  `v2.1.2` zgłosiła różnicę. Konfiguracja właściciela nietknięta: `sha256sum -c` na
  `installed_plugins.json` i `known_marketplaces.json` → OK po operacji.
- **Wada zmierzona i naprawa dowiedziona oba warianty w jednym układzie** — ta sama izolowana
  konfiguracja, ten sam projekt kontrolny, ta sama komenda: instalacja 2.1.3 → **1 trafienie**
  `Hook JSON output validation failed`; instalacja 2.1.4 z lokalnego marketplace → **0 trafień**
  tego komunikatu i **0 trafień** zdania Codeksa „read AGENTS.md".
- **Bramka hosta na poziomie skryptów: 3/3**, każdy z kontrolą pozytywną w tym samym przebiegu —
  pod `CLAUDECODE` 0 znaków, bez niej 893 (`session-context.js`), 178 (`session-end.js`)
  i 218 znaków z werdyktem `deny` (`secret-scanner.js` na payloadzie z próbką sekretu składaną
  w czasie wykonania). Guardrail Codeksa żyje dalej, a w Claude Code skan robi hook adaptera
  Claude Code zarejestrowany na `PreToolUse`.
- **Walidator**: kod 0 i „bramki hosta w hookach Codeksa: 4/4"; na podłożonym skrypcie bez bramki
  kod 1 ze wskazaniem pliku, po przywróceniu ponownie kod 0. Numery wersji: 5 źródeł, wartość 2.1.4.
- **Pierwszy dowód potwierdzenia zdublowanego kontekstu w tej sesji**: angielski blok
  `[RelAI session-context]` jest dosłownie linią 18 `adapters/codex/hooks/session-context.js`,
  obok polskiego bloku adaptera Claude Code.
- **Pomiar, który nic nie zmierzył, i tak jest wynikiem**: `claude -p --plugin-dir` dał zero trafień
  po **obu** stronach — ta ścieżka nie podłącza hooków pluginu. Potwierdzenie L-0093 i P-002; wynik
  odrzucony, nie zaliczony.
- **Katalog roboczy odnogi**: przed 2 pliki / 12 KB, po 0 — skasowany razem z pięcioma
  pozostałościami w `%TEMP%` z 7–8 września (`relai_t7_before.txt`, `relai_t7_after.txt`,
  `relai_panel_head.js`, `relai_readme.txt`, `relai_mut_path.txt`). Raport: przed 0,3 MB, po 0,0 MB.

**Świadomie odłożone:**

- **Zdublowany blok kontekstu w aplikacji desktopowej NOT TESTED** — potwierdzenie wymaga
  `claude plugin update relai@relai` i restartu aplikacji (P-005), czyli działania człowieka.
- Reszta zakresu E1: przebieg dowodowy „plan → etap → świeża sesja", przebieg zapasowy „decyzja
  przeżywa sesję", stos renderu, sceny i napisy, pliki wynikowe, `docs/zasoby/demo/`, `DEMO.md`,
  poprawki README, ponowny odczyt `odpalone.pl/p/relai`.
- Rotacja dziennika (163 KB przy progu 150 KB) i ryzyk zamkniętych (17,6 KB przy progu 12 KB),
  odświeżenie listy modeli (8 dni przy progu 7), aktualizacja `docs/PRZENOSNOSC.md` sekcji 2.3.
- Decyzja o trwałym miejscu źródeł renderu — należy do E3 (Aneks A, ryzyko A2).

**Do zrobienia przez człowieka:**

- **Wydanie 2.1.4**: tag `v2.1.4`, push i release. Właściciel wybrał commit lokalny bez pushu, więc
  do tego czasu marketplace serwuje 2.1.3 z wadą P-013 — i do tego czasu **nie zapraszamy nikogo**.
- Po wydaniu: `claude plugin update relai@relai` + restart aplikacji i potwierdzenie, że blok
  kontekstu startu jest jeden.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-12 — E1 zamknięty: materiał demo wyrenderowany z realnego przebiegu, README bez obietnic ponad dowody

Autor: RelAI (Opus 5) + Lukasz

**Zrobione — dowiezione vs plan:**

- **Cztery pliki materiału** (Aneks A): `demo-relai-25s-pl.gif` 4,83 MB i `-en` 4,77 MB (960×540,
  25 s, 10 kl./s), `demo-relai-60s-pl.mp4` 7,17 MB i `-en` 7,10 MB (1920×1080, 60 s, 30 kl./s),
  wszystkie bez ścieżki dźwiękowej — w `docs/zasoby/demo/` razem z `README.md` katalogu.
- **Dwa realne przebiegi w neutralnym projekcie kontrolnym**, siedem sesji: inicjalizacja → plan
  PLATNOSCI (5 etapów) → akceptacja i `PROMPT_ETAP_1.md` → **świeża sesja** „Kontynuujemy pracę" →
  **świeża sesja** `/relai-stage` z kartą potwierdzenia; osobno decyzja D-01 i **świeża sesja**
  odnajdująca ją ze wskazaniem `docs/DECYZJE.md:8`.
- **`DEMO.md`** — wersje z pomiaru, oba przebiegi z promptami i liczbą prób, tabela pokrycia klatek,
  ograniczenia materiału wypisane wprost, instrukcja odtworzenia renderu od zera.
- **Zapis źródłowy przeniesiony do repozytorium** (`docs/plany/PIERWSI_UZYTKOWNICY/zapis/`,
  11 plików, 53 KB) — plan wymaga zachowania materiału źródłowego, a katalog roboczy szedł do
  skasowania.
- **README**: nowa sekcja „Zobacz, jak to działa" z osadzonym GIF-em; zamknięte trzy nieaktualności
  (korzeniowy `skills/` jako pakiet Codeksa, „E7 pozostaje w toku", obietnica twardej ochrony
  konfiguracji) i dopisana bramka hosta hooków Codeksa w opisie adaptera.
- **Poza planem, bo wypłynęło z pomiaru E1:** odnoga **HOOKI_KORZEN** — czwarta wada dystrybucji
  (P-013), naprawiona i zamknięta tego samego dnia wydaniem 2.1.4 w repozytorium.
- **Nie było w planie i nie zostało zrobione:** nic. Zakres E1 z Aneksem A dowieziony w całości
  poza dwoma punktami jawnie niewykonalnymi bez człowieka (niżej).

**Zweryfikowane — jak dokładnie:**

- **Instalacja obcego użytkownika**: świeża instalacja z marketplace `nowilus/relai` w izolowanym
  `CLAUDE_CONFIG_DIR` → `✔ enabled`, **2.1.3** (marketplace serwuje `main`, nie obiekt release —
  korekta wobec założenia „publiczne = 2.1.2"), **13 komend**, `claude plugin validate` →
  `✔ Validation passed`, **6/6** plików zgodnych sumą z tagiem `v2.1.3` po normalizacji CRLF → LF;
  kontrola pozytywna na `v2.1.2` zgłosiła różnicę. Konfiguracja właściciela nietknięta
  (`sha256sum -c` na dwóch plikach → OK).
- **Kontrola pozytywna i negatywna w jednym przebiegu**: świeża sesja w projekcie z markerem
  odpowiedziała `TAK` na pytanie o obecność kontekstu RelAI, sesja w folderze bez markera → `NIE`.
- **Headless widzi komendy pluginu** — 13 komend i 2 skille wypisane przez model w `claude -p`.
  To przewraca wniosek z L-0093: niewidoczność była własnością **zepsutego manifestu** 2.1.0/2.1.1,
  nie trybu. Zapisane jako **L-0095** i doklejone do zasady aktywnej 5.
- **Kontrola układu na wyrenderowanych klatkach**: 0 elementów wychodzących poza kontener i 0
  tekstów uciętych bez zamiaru na **wszystkich** scenach obu cięć i obu wersjach językowych (112
  linii pomiaru w renderze EN); kontrola pozytywna na scenie z celowym przepełnieniem → **1**
  trafienie, +1199 px. Instrument poprawiany dwa razy, oba razy po tym, jak sam się zdradził:
  najpierw mierzył przed ułożeniem drzewa (`zbadane=0`), potem zgłaszał pięć fałszywych trafień na
  rodzicu z `display:contents`.
- **Pokrycie klatek: 11/11**, 0 bez pokrycia; kontrola pozytywna z podłożonym cytatem → `BEZ
  POKRYCIA`. Trzy pierwsze trafienia okazały się różnicą formatowania markdown, jedno było
  prawdziwe — dopisana kropka w cytacie, usunięta.
- **Polskie znaki**: pierwszy render wyszedł z przekręconymi glifami („płatnosći"), bo podzbiór
  `latin` nie niesie diakrytyków; po dołożeniu `latin-ext` z `unicode-range` tytuł renderuje się
  poprawnie — sprawdzone na klatce, nie w kodzie.
- **Repozytorium nie wchłonęło stosu renderu**: `git status --porcelain` bez ani jednego pliku
  z `node_modules`, `git check-ignore -v` potwierdza regułę; kontrola negatywna — plik wynikowy
  w `docs/zasoby/demo/` **nie** jest ignorowany (kod 1).
- **Instrukcja instalacji z README uruchomiona dosłownie** — obie komendy, w izolowanej
  konfiguracji, z wynikiem zapisanym.
- **`odpalone.pl/p/relai` odczytane** przy ponowieniu; przy tworzeniu planu tego samego dnia odczyt
  się nie udał. Wynik i treść wpisu dopisane do `ZRODLA.md` z datą.
- **Sekrety**: `git grep` po wzorcach `sk_test/live` i `AKIA…` nie zwraca nic w plikach śledzonych
  poza udokumentowanymi wartościami przykładowymi; przeniesiony zapis przebiegów przeskanowany
  osobno — czysto.
- **Katalog roboczy E1**: przed **9538 plików / 492 MB** (raport narzędzia: 461,2 MB), po **0**.
  Skasowane razem z artefaktami poza projektem: `%TEMP%/relai-pierwsi-uzytkownicy-sklep-demo`
  (projekt kontrolny) i `%TEMP%/relai-pierwsi-uzytkownicy-obcy-folder` (kontrola negatywna).
  Headless Shell Remotiona (102 MB) został w cache'u narzędzia poza projektem.
- **Wada `work-artifacts.js` potwierdzona na własnej skórze**: `kasuj` z listą ścieżek zapisanych
  backslashami zjadł znaki ucieczki i zameldował `OK` dla trzech ścieżek, **których nie ma** —
  nic nie zostało skasowane, a raport mówił, że tak. Ponowienie z ukośnikami przeszło poprawnie
  (461,2 MB → 0,0 MB). To dokładnie ta pozycja z „Co dalej" w `STATE.md`.

**Świadomie odłożone:**

- Rotacja dziennika (**172 KB** przy progu 150 KB) i ryzyk zamkniętych; odświeżenie listy modeli
  (8 dni przy progu 7); `docs/PRZENOSNOSC.md` sekcja 2.3.
- Decyzja o trwałym miejscu źródeł renderu — należy do E3 (Aneks A, ryzyko A2). Dziś projekt
  renderu przestał istnieć razem z katalogiem roboczym; odtworzenie jest opisane w `DEMO.md`.
- Ewentualne przeniesienie plików MP4 (14,3 MB) z repozytorium do zasobów wydania — repozytorium
  urosło o 24 MB mediów.
- Naprawa dwóch wad `work-artifacts.js` (ciche `OK` dla nieistniejącej ścieżki, marker `zachowaj`
  w złym projekcie) — osobny zakres, nie E1.

**Do zrobienia przez człowieka:**

- **Wydanie 2.1.4**: tag `v2.1.4`, push i release. Do tego czasu publiczna instalacja serwuje 2.1.3
  z wadą P-013, więc **E2 nie zaprasza nikogo** — to jest zapisane w prompcie E2 jako decyzja.
- Po wydaniu: `claude plugin update relai@relai` + restart aplikacji i potwierdzenie, że blok
  kontekstu startu jest **jeden** (dziś NOT TESTED — pomiar wymaga aplikacji, nie CLI).
- **Weryfikacja osadzonego GIF-a na github.com** — wymaga pusha; do tego czasu sprawdzony jest tylko
  podgląd lokalny (L-0075). Punkt wchodzi do weryfikacji E2.
- Dyspozycja publikacji i kontaktów oraz wskazanie uczestników — bramki manualne E2.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-12 — Wydanie 2.1.4: trzy sprawy człowieka domknięte tego samego dnia

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Wydanie 2.1.4** — bramka W1 przed tagiem (`claude plugin validate` → `✔ Validation passed`,
  walidator adapterów kod 0), push `9e4387a..2b8d2ac` na `origin/main`, tag `v2.1.4` na zdalnym,
  [release](https://github.com/nowilus/relai/releases/tag/v2.1.4) z notą opisującą P-013, sposób
  pomiaru i materiał demo.
- **`claude plugin update relai@relai`** wykonany; cache przeszedł na `...\cache\relai\relai\2.1.4`,
  commit `2b8d2ac`.
- **Dokumenty zsynchronizowane w tej samej turze:** `STATE.md` (wersja, zamknięte pozycje „Co
  dalej", stan materiału), `STATUS.md` planu (bramka wydania rozstrzygnięta), `CLAUDE.md` (wiersz
  stanu), `PROMPT_ETAP_2.md` (zdjęta blokada „nie zapraszamy przed wydaniem", punkt o weryfikacji
  GIF-a zamieniony na ocenę odbioru — techniczna część jest już zmierzona).

**Zweryfikowane — jak dokładnie:**

- **Wersja potwierdzona plikiem, nie komunikatem** (P-005): `installed_plugins.json` wskazuje
  ścieżkę z numerem **2.1.4** i commit `2b8d2ac`, a **5/5** plików z cache'u (`plugin.json`, oba
  hooki Codeksa, walidator, rejestr pułapek) zgadza się sumą z tagiem `v2.1.4` po normalizacji
  CRLF → LF. Kontrola pozytywna: bramka hosta (`CLAUDECODE`) **obecna** w pliku z cache'u.
- **Naprawa P-013 działa w świeżej sesji na wydanej wersji**: sesja CLI zapytana o własny kontekst
  odpowiedziała „fraza `RelAI session-context` — **raz** (drugie wystąpienie to treść pytania)",
  zdanie Codeksa „Before substantive work, read AGENTS.md" — **NIE**, polski rytuał startu —
  **TAK**, a w całym przebiegu **zero** komunikatów `Hook JSON output validation failed`.
  Wcześniejszy pomiar tej samej pary dawał jedno trafienie błędu, więc kontrola działa w obie strony.
- **GIF na żywej stronie repozytorium**: HTML README niesie
  `<img src="/nowilus/relai/raw/main/docs/zasoby/demo/demo-relai-25s-pl.gif" … data-animated-image>`,
  a pobranie tego adresu zwraca **HTTP 200**, `image/gif`, **5 063 834 B** — pełny plik, bez
  obcięcia. GitHub serwuje go z własnej ścieżki `raw`, więc limit proxy obrazów nie wchodzi w grę.
  To domyka punkt, który E1 zostawił jawnie jako NOT TESTED (L-0075: grafikę ocenia się na stronie,
  która ją pokazuje).
- Odczyt strony repozytorium potwierdził też **brak zepsutych odnośników do obrazów** w README.

**Świadomie odłożone:**

- Rotacja dziennika (**ponad 179 KB** przy progu 150 KB) i ryzyk zamkniętych — do rytuału zamknięcia
  dnia; odświeżenie listy modeli (9 dni przy progu 7); `docs/PRZENOSNOSC.md` sekcja 2.3.
- Przeniesienie plików MP4 (14,3 MB) z repozytorium do zasobów wydania — repozytorium urosło
  o 24 MB mediów, ale pliki są potrzebne E2 i decyzja należy do E3.
- Naprawa dwóch wad `work-artifacts.js` — osobny zakres.

**Do zrobienia przez człowieka:**

- **Restart aplikacji desktopowej** — cache ma 2.1.4, ale ta sesja pracuje na kodzie sprzed
  aktualizacji; potwierdzenie pojedynczego bloku kontekstu w aplikacji (nie w CLI) wymaga restartu.
- **Dyspozycja publikacji i kontaktów** oraz **wskazanie uczestników** — dwie otwarte bramki
  manualne E2. Nic technicznego już nie blokuje zaproszeń.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-12 — P-013 potwierdzone w aplikacji po restarcie: sprawa człowieka zamknięta

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:** zamknięcie ostatniej pozycji „Do zrobienia przez człowieka" z wpisu o wydaniu 2.1.4 —
Łukasz zrestartował aplikację, więc pomiar, który wcześniej dał się wykonać wyłącznie w CLI, został
powtórzony tam, gdzie objaw mieszkał.

**Zweryfikowane — jak dokładnie:**

- **Kontekst startu tej sesji zawiera dokładnie jeden blok `[RelAI session-context]`** — polski,
  z adaptera Claude Code, kierujący do `CLAUDE.md` i `docs/STATE.md`. Zdania
  „This is a RelAI project. Before substantive work, read AGENTS.md…" (linia 18
  `adapters/codex/hooks/session-context.js`) **nie ma**. Przy starcie poprzedniej sesji, na 2.1.3,
  były oba — ten sam projekt, ta sama aplikacja, więc pomiar ma obie strony.
- **`claude plugin list`**: `relai@relai` 2.1.4, scope `user`, `✔ enabled`; cache wydanej wersji ma
  **trzynaście** plików komend. Restart nie zgubił niczego, co naprawa mogła zepsuć.

**Świadomie odłożone:** rotacja dziennika (**178,2 KB** przy progu 150 KB) i rotacja ryzyk
zamkniętych (**17,6 KB** przy progu 12 KB) — obie należne, obie do rytuału zamknięcia dnia.
Odświeżenie listy modeli (8 dni przy progu 7). Aktualizacja `docs/PRZENOSNOSC.md` sekcji 2.3.

**Do zrobienia przez człowieka:** dwie bramki manualne E2 — dyspozycja publikacji i kontaktów oraz
wskazanie uczestników. Nic technicznego nie blokuje już zaproszeń.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-13 — E2 zamknięty: materiały zaproszenia gotowe, demo nieczytelne na telefonie

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **`docs/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md`** — cztery bloki do wklejenia bez
  przeredagowania: (a) aktualizacja wpisu na Odpalone z osadzonym GIF-em przez `raw/main`,
  (b) krótki tekst dla własnej sieci z jawnym „szukam 3–5 osób", (c) odpowiedź na cztery tezy
  krytyki z sekcji 3 planu, (d) instrukcja dla uczestnika: dwie komendy, jedno zadanie, jedno
  pytanie. Na końcu **tabela pokrycia: 27 tez, każda ze wskazanym źródłem** w `STATE.md`, `DEMO.md`,
  `ZRODLA.md`, `README.md` albo w dzisiejszym pomiarze — plus lista tez **świadomie
  niepostawionych** (liczba użytkowników, porównanie z pamięcią natywną, twarda ochrona
  konfiguracji, niezawodność z jednego przebiegu).
- **`docs/plany/PIERWSI_UZYTKOWNICY/PROBY.md`** — rejestr prób, **pusty i to jest stan zamierzony**.
  Osiem reguł wypełniania, dwie tabele (kontakty i próby) z kolumnami dokładnie z sekcji 5 planu,
  wiersz „odmowa / brak odpowiedzi" jako pełnoprawny wynik, wiersze `PRZYKŁAD` do skasowania przy
  pierwszym realnym wpisie, tabela progów z sekcji 2 i cztery werdykty z sekcji 5.
- **Karta odnogi `OPIS_REPO` odświeżona** — zakres i kryteria przepisane z RelAI 1.5.x na 2.1.4,
  datowana linia śladu zmiany na górze, **poprzednie brzmienie zachowane w treści** (nie tylko
  w historii gita). Status nadal `OTWARTA`; linia o niej dopisana do sekcji „Odnogi" w `STATUS.md`.
  Karta niesie teraz rzecz, której stare kryterium nie widziało: `description` manifestu mówi
  „…for Claude Code", a produkt ma trzy adaptery, więc kryterium „identyczne z manifestem"
  skopiowałoby do wizytówki repozytorium opis sprzed trzech serii wydań.
- **Ocena materiału demo po stronie odbiorcy** (punkt 4 zakresu) — dwa pytania, na które pomiar
  z E1 nie odpowiadał.
- **Nie było w planie i nie zostało zrobione:** żaden kontakt nie został wysłany, nic nie zostało
  opublikowane, opis repozytorium na GitHubie nietknięty. Wszystko trzy czekają na dyspozycję —
  to jest zakres bramek manualnych, nie zaległość etapu.

**Zweryfikowane — jak dokładnie:**

- **Publiczna instalacja serwuje 2.1.4.** Obie komendy z README uruchomione dosłownie
  w izolowanym `CLAUDE_CONFIG_DIR` (`%TEMP%/relai-e2-instalacja/konfiguracja`):
  `✔ Successfully added marketplace` → `✔ Successfully installed plugin` → `claude plugin list`
  pokazuje `Version: 2.1.4`, `✔ enabled`. Manifest cache'u niesie `"version": "2.1.4"`, katalog
  komend ma **13** plików, `claude plugin validate` na klonie marketplace → `✔ Validation passed`.
  **Potwierdzenie treścią plików, nie komunikatem** (P-005): sześć plików cache'u (trzy guardraile,
  `MANIFEST.json`, `SKILL.md` skilla rdzeniowego, komenda `relai-stage`) zgadza się sumą z tagiem
  `v2.1.4` po normalizacji CRLF → LF — **6/6**. Kontrola pozytywna: ten sam plik wobec `v2.1.3`
  daje inną sumę (`7242dfc0…` vs `cb056525…`), więc zielony wynik coś znaczy. Klon marketplace stoi
  na commicie `fceb255` (HEAD `main`), a tag `v2.1.4` wskazuje `061d95f` — **marketplace serwuje
  gałąź, nie obiekt release**; potwierdzenie ustalenia z E1.
- **Pokrycie tez: 27/27.** Instrument przechodzi tezę po tezie i sprawdza, czy wskazane źródło
  naprawdę ją niesie. Kontrola pozytywna: podłożona teza „RelAI ma 500 aktywnych użytkowników"
  zgłoszona jako BRAK. Jedna teza wypadła po drodze z tekstu — „siedem sesji" nie ma czystego
  pokrycia (`DEMO.md` opisuje kroki 1–3 jako **jedną** sesję), więc blok (a) mówi teraz „dwa
  przebiegi, siedem zachowanych zapisów kroków", a liczba 7 jest policzona na plikach `zapis/*.txt`.
- **Żadna obietnica nie przekracza dowodów:** `git grep -niE "gwarant|nie pozwoli|uniemożliwia"`
  w `ZAPROSZENIE.md` nie zwraca nic (kod 1), a ten sam wzorzec na `docs/*.md` zwraca cztery pliki —
  więc instrument działa. Zdanie o ochronie konfiguracji mówi o pytaniu, nie o blokadzie.
- **Dowód negatywny na README:** `git diff README.md` pusty; nazwa, tagline, ścieżka bannera
  i ścieżka GIF-a mają nadal pierwotne brzmienie (linie 2, 9, 44).
- **Anchor sprawdzony na żywej stronie** (L-0075): blok (b) linkuje
  `github.com/nowilus/relai#zobacz-jak-to-działa`; odczyt HTML strony 2026-09-13 pokazuje
  `user-content-zobacz-jak-to-działa`, więc link prowadzi tam, gdzie ma.
- **Stan GitHuba odczytany dziś, nie wzięty z sierpnia** (L-0087, datowanie w obie strony):
  `gh repo view nowilus/relai --json description,homepageUrl,repositoryTopics` →
  `{"description":"","homepageUrl":"","repositoryTopics":null}`. Stan identyczny jak przy założeniu
  odnogi 2026-08-12.
- **Ocena demo — pierwsze trzy sekundy.** Klatki wyciągnięte w 0,5 / 1,5 / 2,5 / 3,5 s: do 2,5 s na
  ekranie jest sam napis „RelAI" z taglinem, treść (scena `plan`) wchodzi dopiero w **3,5 s**.
  **3 z 25 sekund to plansza tytułowa.** Materiał nie mówi, o co chodzi, w oknie, w którym człowiek
  decyduje, czy patrzeć dalej.
- **Ocena demo — czytelność na 375 px** (szerokość, jaką GitHub daje obrazowi na telefonie; skala
  0,3906). Próg: wysokość glifów ≥ 8 px na ekranie telefonu (SZACUNEK). Scena `plan`: tytuł sceny
  32 px → **12,50 px CZYTELNE**; lista etapów 13 px → 5,08 px; nagłówek karty 15–19 px →
  5,86–7,42 px; treść karty 14 px → 5,47 px; ścieżka w ramce 9 px → 3,52 px. Scena `sesja`,
  najbliżej progu: zdanie główne 16–20 px → 6,25–7,81 px, propozycja komendy 19 px → 7,42 px.
  **Czytelny jest wyłącznie tytuł sceny.** Kontrola pozytywna instrumentu jest w tej samej parze:
  tytuł zwraca CZYTELNE, reszta PONIŻEJ PROGU, więc instrument rozróżnia obie odpowiedzi.
- **Dwa razy złapałem własny instrument na kłamstwie i oba trafienia są lekcjami.** (1) Porównanie
  sum plików z cache'u meldowało **3/5 zgodnych** przy wszystkich pięciu ścieżkach nieistniejących —
  suma pustego strumienia jest po obu stronach ta sama (`e3b0c442…`). **L-0096.** (2) Pomiar
  wysokości wierszy brał `min()` po wszystkich pasmach ciemnych pikseli i meldował 2 px dla wiersza,
  który ma 13 — bo kreska i kropka nad „i" też są pasmami. **L-0097.** Trzecia lekcja jest o samym
  wyniku: materiał przeszedł w E1 kontrolę układu (0 przepełnień), bo mierzyła geometrię w skali
  renderu, a nie czytelność w skali odbiorcy. **L-0098.**
- **Sekrety:** `git grep -nE "sk_(test|live)_|AKIA[0-9A-Z]{16}"` zwraca trzy trafienia, wszystkie to
  udokumentowana wartość przykładowa AWS w `DZIENNIK.md`, `PULAPKI.md` i karcie `PRECOMMIT_ESM` —
  ta sama trójka co w E1.
- **Katalog roboczy E2**: przed **1,6 MB / 24 pliki**, po **0**. Razem z nim skasowane artefakty
  spoza projektu, wypisane z nazwy: `%TEMP%/relai-e2-instalacja` (82,7 MB — izolowana konfiguracja
  i klon marketplace z pomiaru instalacji) oraz dwa puste katalogi
  `%TEMP%/relai-precommit-regresja-1216` i `-23948` z 2026-09-04. **Razem 84,2 → 0,0 MB**,
  sprawdzone **stanem dysku, nie komunikatem** — narzędzie melduje `OK` także dla ścieżki, której
  nie ma. Ponowny raport: 0,0 MB kandydatów. Po drodze potwierdziło się L-0078: świeżo wygenerowany
  `PROMPT_ETAP_3.md` stanął w raporcie jako kandydat i zniknął dopiero po `git add` — granicą
  ochrony dorobku sesji jest indeks gita, nie marker.

**Świadomie odłożone:**

- Rotacja dziennika (**179,7 KB** przy progu 150 KB) i rotacja ryzyk zamkniętych (**17,6 KB** przy
  progu 12 KB) — obie należne od wczoraj, obie do rytuału zamknięcia dnia.
- Odświeżenie listy modeli — **9 dni** przy progu 7.
- `docs/PRZENOSNOSC.md` sekcja 2.3 (opisuje wywołanie procedur Codeksa stanem z 2026-08-12).
- Naprawa dwóch wad `work-artifacts.js`: ciche `OK` dla nieistniejącej ścieżki i marker `zachowaj`
  zapisywany w projekcie sesji zamiast w projekcie pliku.
- Przeniesienie plików MP4 (14,3 MB) z repozytorium do zasobów wydania.
- **Nowy render materiału demo** — decyzja należy do E3 razem z decyzją o trwałym miejscu źródeł
  renderu (Aneks A, ryzyko A2); źródła nie istnieją, odtworzenie opisuje `DEMO.md`.

**Do zrobienia przez człowieka:**

- **Dyspozycja publikacji i kontaktów** — materiały są gotowe i czekają w `ZAPROSZENIE.md`. Bez
  wskazania kanału, treści i odbiorców `PROBY.md` zostanie pusty, a E3 zamknie plan wynikiem
  nierozstrzygającym. To jest dopuszczalne zakończenie, ale warto, żeby było wyborem, nie skutkiem
  przeoczenia.
- **Wskazanie uczestników** — trzech do pięciu osób z własnym małym projektem.
- **Decyzja o ponownym renderze demo pod telefon** — dopisana do bramek manualnych `STATUS.md`;
  rozstrzygnięcie należy do E3.
- **Rozjazd manifestu z produktem** (`description` mówi „for Claude Code", `keywords` nie zawiera
  nazwy żadnego narzędzia) — wizytówka repozytorium ma go skopiować czy najpierw poprawiamy
  manifest, czyli podbijamy wersję? Zapisane w karcie odnogi `OPIS_REPO` i w `STATE.md`.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-14 — Nowy plan OPTYMALIZATOR_PROMPTOW; pilotaż wstrzymany na wniosek właściciela

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Walidacja `nidhinjs/prompt-master`** na wniosek Łukasza — licencja, zdrowie projektu,
  powierzchnia ataku i jakość merytoryczna. Wynik: **MIT, zgodne z licencją RelAI**; pięć plików
  Markdown, zero kodu wykonywalnego, zero GitHub Actions.
- **Przegląd alternatyw** — osiem kandydatów z dwóch zapytań do API GitHuba plus wyszukiwanie
  w sieci. Jeden odpadł licencyjnie (`linshenkx/prompt-optimizer`, AGPL-3.0), jeden jako martwy
  (`microsoft/PromptWizard`, ostatni push 2025-10-13), trzy jako zły kształt (DSPy, GEPA,
  prompt-ops wymagają datasetu i metryki), jeden bez licencji
  (`anthropics/prompt-eng-interactive-tutorial`).
- **Wywiad w trzech rundach**, jedenaście rozstrzygnięć. Zakres: wyłącznie prompty użytkownika do
  agenta. Wyzwalacz: komenda on-demand **plus** tryb ciągły z trwałym przełącznikiem. Adopcja: port
  reguł, nie vendoring. Tryb: pokaż różnicę i czekaj. Pomijanie: potwierdzenia, komendy RelAI,
  pytania o kod. Kontekst: wybiórczy i widoczny. Język: domyślnie polski, pytanie raz na projekt.
  Reguły: w pluginie, nazwy modeli z istniejącej listy. Budżet: 4–5 sesji.
- **`docs/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html`** — dziesięć sekcji, pięć wariantów (jeden wybrany,
  cztery z jawnym powodem odrzucenia), cztery etapy MVP-first, osiem ryzyk, dziesięć rozstrzygniętych
  przypadków brzegowych, sześć spraw dla człowieka. Diagram przepływu i wykres pracochłonności;
  bez symulatora, bo plan nie ma wyliczeń, którymi da się pokręcić.
- **`docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md`** — status `DO AKCEPTACJI`, cztery etapy
  `OCZEKUJE`, sześć bramek manualnych.
- **Plan PIERWSI_UZYTKOWNICY przeszedł w stan `WSTRZYMANY`** — decyzja Łukasza, nie wniosek agenta.
  E3 zostaje `GOTOWY DO STARTU` z gotowym promptem, trzy bramki otwarte, **termin graniczny raportu
  2026-10-03 traci moc** do czasu wznowienia. Nic z dorobku E1 i E2 nie zostało ruszone.
- **Linia aktywnego planu w `CLAUDE.md`** przestawiona na nowy plan; tabela „Stan prac" dostała
  wiersz planu wstrzymanego.
- **Plan rozszerzony przed akceptacją o wątek kosztu modelu** (czwarta runda wywiadu, na wniosek
  Łukasza). Optymalizacja ma biec na **modelu wskazanym przez człowieka**, jak najtańszym przy
  zachowanej jakości. Rozpoznanie pokazało, że **mechanizm już istnieje i jest wydany**:
  `/relai-crew` (2.1.0) pyta o model wg listy `MODELE-<narzędzie>.md` i deleguje przez narzędzie
  `Agent` z parametrem `model` albo przez `crew.js run --model`, gdzie `buildCommand` zna flagę
  modelu dla wszystkich trzech dostawców. Do planu weszły: **nowy etap E2 (pomiar modeli)**, wiersz
  `Model optymalizatora` w ustawieniach, sekcja „Kto to wykonuje" w rozwiązaniu, trzy ryzyka
  (**O9** jakość taniego modelu — wysokie, **O10** utrata cache'u przy delegacji, **O11** opóźnienie
  subagenta), cztery przypadki brzegowe (b11–b14) i jedna sprawa dla człowieka. Plan ma **pięć
  etapów i 5–6 sesji** zamiast czterech i 4–5 — **przekroczenie pierwotnego budżetu jest świadome
  i zaakceptowane w wywiadzie**, nie przeoczone.
- **Plan ZAAKCEPTOWANY i zamrożony tego samego dnia** (D-33), bez uwag. Sekwencja akceptacji
  wykonana w całości: status planu w `STATUS.md` **i w nagłówku `PLAN.html`** (żeby dwa dokumenty
  nie mówiły dwóch rzeczy), E1 → `GOTOWY DO STARTU`, bramka „Akceptacja planu" → rozstrzygnięta
  w obu miejscach, cztery ryzyka planu (**O1, O4, O6, O9**) przeniesione do tabeli „Stan otwartych
  ryzyk" — tak, jak plan to przewidział w sekcji 7.
- **`docs/plany/OPTYMALIZATOR_PROMPTOW/PROMPT_ETAP_1.md`** — samowystarczalny prompt świeżej sesji
  wg `SPEC_PROMPT_ETAPU.md`: dziewięć elementów w stałej kolejności, kontrola modelu z nazwą
  **Opus 5** i datą listy `2026-09-04`, dwanaście pozycji do przeczytania, siedem decyzji
  zamkniętych z jawną granicą zakresu wobec E2–E5, drzewko stanu faktycznego, jedenaście punktów
  weryfikacji i rytuał „Na koniec". Zasady aktywne przepisane w prompcie w skrócie (wzorzec
  `PROMPT_ETAP_3` planu PIERWSI_UZYTKOWNICY), bo pełna sekcja waży 13,8 KB.
- **Rotacja dwóch dokumentów** (na prośbę Łukasza, procedura dwufazowa ze `SPEC_ARCHIWUM.md`).
  Dziennik: **29 wpisów** z okresu 2026-09-03 … 2026-09-06 →
  [`docs/archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md`](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md),
  suma kontrolna `f7e63de9ea130a59`, **206,9 → 87,3 KB**, **3 linki przepięte**, pozycji z martwą
  kotwicą **0**. Lekcje: **9 pozycji L-0070 … L-0078** →
  [`docs/archiwum/lekcje/LEKCJE_L-0070_L-0078.md`](archiwum/lekcje/LEKCJE_L-0070_L-0078.md),
  suma kontrolna `d18c21a837531ba1`, **53,0 → 42,6 KB**. Dwa niezależne przebiegi, dwa pliki
  archiwum, dwie sumy — nie sklejane w jeden.
- **Ryzyk nie rotowano i to jest stan poprawny.** Sekcja waży **21,7 KB przy progu 12 KB**, ale ma
  **16 wierszy i zero o statusie `ZAMKNIĘTE`** — kryterium jest status, nie objętość. Kompresja
  komórek „Mitygacja" też nie ruszyła: żadne ryzyko nie ma statusu `ZMITYGOWANE` ani `PRZYJĘTE
  ŚWIADOMIE`, a R5 (`OTWARTE ŚWIADOMIE`) do zamkniętej listy brzmień nie należy i mechanizm nie
  zgaduje za nią (L-0025). `USTAWIENIA.md` 3,3 KB przy progu 6 KB — poniżej. `STATE.md` 299 linii
  przy progu 300 — w progu liniowym.
- **Odstępstwo od litery specyfikacji, świadome i rozstrzygnięte przez człowieka.** Reguła
  `SPEC_ARCHIWUM.md` każe brać, aż **część rotowalna** zejdzie poniżej 60% progu. Zmierzone dziś
  na obu dokumentach: dziennik wziąłby **7 wpisów** i został z 164,8 KB **ponad progiem**, a lekcje
  **zero pozycji** i zostałyby z 53,0 KB **ponad progiem** — bo ich część rotowalna (10,7 KB) jest
  poniżej 30 KB, zanim cokolwiek zabierzemy. Na pytanie o głębokość Łukasz wybrał kryterium
  **„cały plik poniżej 60% progu"**; stąd 29 wpisów i 9 lekcji. To jest materiał dowodowy do
  otwartej pozycji „Reguła głębokości rotacji" ze `STATE.md` — **defekt potwierdzony na dwóch
  dokumentach naraz**, nie na jednym przypadku.

**Zweryfikowane — jak dokładnie:**

- **Licencje odczytane z API, nie z opisu repozytorium**: `repos/nidhinjs/prompt-master/license`
  zwraca `{"spdx":"MIT"}`, a nagłówek pliku — `Copyright (c) 2026 Nidhin Joseph Nelson`.
  Kontrola porównawcza na `linshenkx/prompt-optimizer`: `spdx: NOASSERTION`, a nagłówek mówi
  `GNU Affero General Public License v3.0 only` — czyli pole SPDX samo w sobie nie wystarcza
  i trzeba czytać treść pliku.
- **Zdrowie projektu z metadanych, nie z wrażenia**: 12 820 gwiazdek, 1 505 forków, 58 commitów,
  7 kontrybutorów (autor 41), **0 tagów i 0 release'ów**, 32 otwarte zgłoszenia, ostatni push
  2026-08-24. Drzewo repozytorium ma **5 pozycji**, największa to `SKILL.md` (32 138 B).
- **Builder planu HTML: kod wyjścia 0**, komunikat „Osadzono 6 regul @font-face", zero
  niewypełnionych znaczników. Kontrola zasobów zewnętrznych: `grep` po `http(s)://` w gotowym pliku
  zwraca wyłącznie `www.w3.org` z przestrzeni nazw SVG. Duplikaty `aria-controls`: zero.
- **Kontrola układu na żywej stronie** (zasada aktywna 15): dokument **nie przewija się w poziomie**
  (`scrollWidth` 1009 = `clientWidth` 1009), 15 bloków zwijalnych, 14 zwiniętych na starcie,
  rozwinięcie przez `click` zmienia `aria-expanded` na `true` i daje wysokość 398 px.
- **Instrument przepełnień z kontrolą pozytywną.** Pierwszy przebieg wykrył realne trafienie:
  napis „dziewięć wymiarów, max 3 pytania" wychodził **5 px** poza prawą krawędź kartki diagramu.
  Kontrola pozytywna w tym samym przebiegu — podłożony napis wystający o 320 px został wykryty,
  więc zielony wynik coś znaczy. Po skróceniu napisu i przegenerowaniu **zero przepełnień
  w diagramie**; jedyne pozostałe trafienie to adnotacja odręczna nad słupkiem wykresu, która
  z założenia leży poza słupkiem i **mieści się w `viewBox`** (0 tekstów poza `viewBox`).
- **Zero emoji** — policzone w Node po zdjęciu `data:` URI fontów, zakresy 1F300–1FAFF, 2600–27BF
  i selektory wariantu. Zero trafień na fiolet i poświatę.
- **Etykiety liczb**: po rozszerzeniu 19 wystąpień `FAKT` i 10 `SZACUNEK` w gotowym pliku
  (przed rozszerzeniem: 14 i 9). Kontrola, że etykieta nie została napisana zwykłym tekstem zamiast
  znacznikiem — `grep -oE '[^>](FAKT|SZACUNEK)\)'` zwraca pusto; pierwszy przebieg po rozszerzeniu
  **zwracał trafienie** i zostało poprawione.
- **Ceny modeli wzięte z dokumentacji, nie z pamięci** — Opus 5 $5/$25, Sonnet 5 $2/$10,
  Haiku 4.5 $1/$5 za milion tokenów wejścia/wyjścia; kontekst 1M wobec 200K u Haiku
  (stan cache'u dokumentacji: 2026-06-24). Stamtąd pochodzi też przestroga wpisana do planu:
  przed budowaniem kaskady wielomodelowej warto zmierzyć mocniejszy model na **niższym wysiłku**,
  a cache jest **przypisany do modelu**, więc delegacja traci możliwość jego odczytu.
- **Mechanizm delegacji sprawdzony w kodzie, nie założony** — `buildCommand` w
  `core/process/crew.js` ma gałąź `--model` / `-m` / `-c model=` dla trzech dostawców, a komenda
  `/relai-crew` wprost wymienia narzędzie `Agent` z `subagent_type` i `model` z wywiadu. Trzej
  agenci załogi **nie mają** pola `model` w nagłówku — model podaje się przy wywołaniu.
- **Układ po rozszerzeniu sprawdzony ponownie na żywej stronie**: brak przewijania poziomego,
  19 bloków zwijalnych, 32 wiersze tabel, zero tekstów poza `viewBox` obu figur. Jedyne trafienie
  instrumentu przepełnień to adnotacja odręczna nad słupkiem wykresu, która z założenia leży poza
  słupkiem. Kontrola pozytywna instrumentu w tym samym przebiegu: **wykryta**.
- **Rotacja: sumy kontrolne policzone po obu stronach, w tej kolejności.** Dla każdego z dwóch
  przebiegów suma fragmentu w żywym pliku, potem zapis archiwum, potem **odczyt z dysku** i suma
  treści spod separatora — zgodne (`f7e63de9ea130a59` i `d18c21a837531ba1`), dopiero po tym faza 2.
  Próba na sucho przed każdym wykonaniem; drzewo gita czyste przed operacją, więc cofnięcie było
  jednym poleceniem.
- **Dowód, że nic nie zginęło, z kontrolą pozytywną.** Instrument porównuje nagłówki pozycji sprzed
  rotacji (`git show HEAD:`) ze zbiorem „żywy plik + archiwum": dziennik **41 przed = 12 + 29 po**,
  lekcje **29 przed = 20 + 9 po**, zero pozycji zgubionych i zero dorobionych. Kontrola pozytywna
  w tym samym przebiegu: instrument z jedną celowo usuniętą pozycją **zgłasza dokładnie jedną**.
- **Sekcje nietykalne — dowód negatywny.** „Stan otwartych ryzyk" (21,7 KB) i „Zasady aktywne"
  (13,5 KB) mają nadal **pierwotne brzmienie bajt w bajt**. Liczba zasad aktywnych bez zmian: **15
  przy limicie 15**.
- **Pierwszy przebieg instrumentu zgłosił „Czeka na człowieka" jako naruszoną — i to był defekt
  instrumentu, nie rotacji** (zasada aktywna 5). Sekcja **nie jest** bajtowo nietykalna, bo faza 2
  przepina w niej linki; nietykalne są treść pozycji, daty i teksty linków. Po poprawieniu miary:
  **86 linii przed i po**, **3 linie różne — w każdej zmieniła się wyłącznie ścieżka przed
  kotwicą**, a sekcja po zdjęciu ścieżek archiwum jest identyczna. Kontrola pozytywna poprawionego
  testu: podmiana jednego znaku w treści pozycji **jest wykrywana**.
- **Zero martwych kotwic po przepięciu** — 16 linków wewnętrznych sprawdzonych, każdy rozwiązany
  albo w żywym pliku, albo w nagłówkach pliku archiwum, do którego prowadzi.
- **Warstwa startowa sesji wróciła do budżetu: 83,4 → 71,2 KB przy budżecie 80 KB.** Ponad własnym
  progiem cząstkowym zostają dwie pozycje: `STATE.md` (23,7 KB przy 12 KB) i sekcja ryzyk
  (21,7 KB przy 12 KB) — pierwszą odchudza przepisanie zwięźlej, drugiej nie odchudzi nic poza
  zamknięciem ryzyk albo podniesieniem progu.

**Świadomie odłożone:**

- **Rotacja dziennika, lekcji i ryzyk zamkniętych** — zgłoszona na starcie sesji (warstwa startowa
  83,4 KB przy budżecie 80 KB; dziennik 191,4/150 KB, ryzyka 18,7/12 KB, lekcje 53/50 KB) i nadal
  należna. Ten wpis dokłada do dziennika kolejne kilka KB.
- **Odświeżenie listy modeli** — `.claude/relai/MODELE-claude-code.md` ma 10 dni przy progu 7.
- **Ryzyka O1–O8 nie weszły do tabeli „Stan otwartych ryzyk"** — plan przewiduje, że O1, O4 i O6
  przechodzą tam **przy akceptacji**, nie przy utworzeniu planu.
- **Pytanie o nadpisanie lokalne szablonu HTML** (D-62) — pada raz na projekt i nadal nie ma
  swojego wiersza w `USTAWIENIA.md`, mimo że plany HTML powstają tu od sierpnia.

**Do zrobienia przez człowieka:**

- ~~**Akceptacja planu OPTYMALIZATOR_PROMPTOW**~~ *(rozstrzygnięte 2026-09-14 — zaakceptowany bez
  uwag; plan zamrożony, sekcje 1–9 nietykalne, `PROMPT_ETAP_1.md` wygenerowany, E1 gotowy do startu,
  ryzyka O1/O4/O6/O9 w rejestrze)*
- ~~**Nazwa komendy**~~ *(rozstrzygnięte 2026-09-14 — `/relai-prompt`; prompt E1 był już na tę nazwę
  napisany, więc nie wymagał poprawki)*
- **Który model zostaje domyślny, jeśli pomiar E2 wyjdzie nierozstrzygający** — realny wynik to
  „Haiku wystarcza w siedmiu wymiarach na dziewięć, a wypada na wybiórczym czytaniu decyzji".
  Wybór między tańszym i słabszym a droższym i pewnym jest decyzją o jakości pracy, nie o cenniku.
- **Co z zainstalowanym `ecc:prompt-optimizer`** — dwa skille o podobnych opisach mogą wyzwalać się
  nawzajem albo zamiast siebie (ryzyko O6). Wyłączenie cudzego pluginu jest zmianą w konfiguracji
  użytkownika, więc RelAI jej nie wykona sam.
- **Czy tryb ciągły ma licznik kosztu** — dokłada około pół sesji do E3 i jest jedynym sposobem,
  żeby ocenić opłacalność trybu na danych zamiast na wrażeniu.
- **Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan** — ten plan daje im wyłącznie komendę.
- **Kiedy wraca plan PIERWSI_UZYTKOWNICY** — jest wstrzymany, nie zamknięty; trzy bramki i E3
  czekają nietknięte.

Autor: RelAI (Opus 5) + Lukasz
