# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Mechanizm jest kompletny **i zadziałał na cudzym projekcie w żywej sesji**, nie tylko w instrumentach: PolyFlow 1.6.1 → 1.7.0, rotacja dziennika **183,1 → 147,3 KB** (9 wpisów, suma `566dca8a4dd45ba7` odczytana z dysku przed przycięciem), rotacja ustawień **29,8 → 25,4 KB** (16 wierszy, 5 wierszy maszynowych nietkniętych), przepięcie linków z bilansem zero (60 przed, 65 po rotacji, 60 po przepięciu). Tutaj: dziennik **155,6 → 74,1 KB**, 18 wpisów do archiwum, raport startu z 2 linii na **0**. Zawężone, bo to, co zostało, nie jest już własnością mechanizmu: **JiraManager (386 KB startu) czeka na okno właściciela**, a warstwa startowa PolyFlow (157,3 KB przy budżecie 80 KB) jest gruba sekcją ryzyk, `CLAUDE.md` i `STATE.md` — odchudzają je decyzje człowieka, nie archiwum. Zmierzone: 2026-08-20, 2026-08-21, 2026-09-01 (E1–E6) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. **1.8.1 (odnoga GUARD_PO_SCIEZCE) zamyka osobną dziurę tej samej rodziny**, obecną w obu adapterach: guard rozpoznawał projekt wyłącznie po katalogu sesji, więc zapis do cudzego projektu RelAI przechodził bez ostrzeżenia w Claude Code tak samo jak w Cursorze. Zmierzone instrumentem na dwóch drzewach (22 + 4 scenariusze, 0 niezgodnych); poziom bez zmian, bo powód otwarcia jest inny — brak egzekwowanego `ask` w Cursorze. **1.9.1 (CURSOR_1_9_1):** opakowanie `secret-scanner.cmd` zwraca `deny` i nie cytuje wartości; świeża sesja `cursor-agent -p` na projekcie kontrolnym z hookami od startu — plik z kluczem **nie powstał**, kontrola pozytywna bez sekretu utworzyła `ok.md`. Sesja GUI w repozytorium RelAI bez zainstalowanego adaptera zapisu nie zatrzymała (hooki dołożone w trakcie sesji się nie załadowały). Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6), 2026-09-03 (GUARD_PO_SCIEZCE), 2026-09-04 (CURSOR_1_9_1) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. **1.9.1 (CURSOR_1_9_1):** cały wątek pomiarowy poprowadził Grok 4.6 w aplikacji Cursora — rytuał startu, karta, granica „nie poprawiasz kodu", trzy komendy, rytuał zamknięcia. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6), 2026-09-04 (CURSOR_1_9_1) |

| S1 | Bramka dokumentacyjna przepuści coś potrzebnego — plik nieśledzony, o którym architektura milczy, a bez którego nie da się powtórzyć pomiaru (plan SPRZATANIE_ARTEFAKTOW, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kasowanie wyłącznie po „tak" na grupę z pełną listą pozycji; pliki śledzone nigdy nie są kandydatami; niepewność rozstrzygana na korzyść ochrony; „zostaw na zawsze" dopisuje marker, więc pytanie nie wraca. Pierwszy pomiar (E1, własne repo): 8 grup, 9 pozycji chronionych z powodem — w tym `benchmark`-owy odpowiednik, czyli `.claude/relai/templates` z powodem `opisane` i wskazaniem `README.md:150`. **Bramka przepuściła dorobek własnego etapu**: dwa nowe, niezacommitowane pliki produktu stanęły w grupach jako kandydaci (L-0078) — ochroną jest tam `git add`, nie marker, ale to jest realne trafienie tego ryzyka. Niezmierzone na cudzym projekcie: raport na PolyFlow zostaje jako bramka manualna planu. E2: drugi przebieg bez ani jednego fałszywego kandydata — 1 grupa (katalog etapu zamkniętego), 5 pozycji chronionych, w tym `templates` powodem `opisane`. **E3: trafienie powtórzyło się na innym pliku** — świeżo wygenerowany `PROMPT_ETAP_4.md`, jeszcze nieprzyjęty do indeksu, stanął w raporcie jako kandydat (grupa „repo: katalog docs") i zniknął po `git add`. Wzorzec jest więc stały, nie jednorazowy: **granicą ochrony dorobku sesji jest indeks gita**, a nie marker — i to zdanie należy mówić wprost przy sprzątaniu w trakcie etapu (L-0078). **E4: pierwsze trafienie na cudzym projekcie i najpoważniejsze z dotychczasowych.** Powód `opisane` chronił w PolyFlow **dwa** pliki benchmarku z ośmiu, a sześć dalszych — w tym `formatowanie/probki.json` i `probki_lista.json` z realnymi wypowiedziami właściciela — stanęło w grupie kandydatów. Ochrona przez opis obejmuje wyłącznie to, co ktoś opisał **w dokumencie projektu**; komentarz nad wzorcem w `.gitignore` tym dokumentem nie jest, choć czyta się identycznie. Bramka zadziałała (nic nie zniknęło bez „tak"), ale sama nie wystarczy — potrzebny był marker, i to siedem markerów zamiast zakładanych dwóch. **Ryzyko zostaje otwarte**: mechanizm jest zależny od tego, czy człowiek opisał materiał tam, gdzie narzędzie patrzy. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |
| S2 | Narzędzie skasuje coś poza dozwolonymi korzeniami — zła ścieżka względna, dowiązanie prowadzące na zewnątrz, junction do innego dysku (plan SPRZATANIE_ARTEFAKTOW, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Asercje w `kasuj`: każda ścieżka po `realpath` musi leżeć **pod** katalogiem projektu albo pod `os.tmpdir()`, nie być którymkolwiek korzeniem ani `.git` projektu; dowiązanie usuwane jako dowiązanie, bez wchodzenia do celu. Pierwszy pomiar (E1) z dowodami negatywnymi: ścieżka w katalogu domowym i `.git` projektu → dwie odmowy, zero skasowanych, `.git` **31 plików przed i 31 po**; junction wskazujący poza kandydata → dowiązanie zniknęło, cel **2 pliki przed i 2 po**. Klon repozytorium z obiektami tylko do odczytu skasowany bez ani jednego niepowodzenia (14 923 442 B → 0 B). E2: kasowanie 141,2 MB w katalogu roboczym etapu zamkniętego, zero niepowodzeń, `%TEMP%` i `work/` puste po operacji. E3: trzeci przebieg, katalog roboczy etapu i pusty katalog tematu, zero niepowodzeń; **ochrona `etap trwa` pokazana w obie strony w jednym dniu** — ten sam katalog był chroniony przy statusie `W TOKU` i został kandydatem dopiero po `ZREALIZOWANY`. **E4: czwarty przebieg, pierwszy na cudzym projekcie** — dwie pozycje (katalog etapu zamkniętego 90 MB i katalog w `%TEMP%` 35 MB), **125,0 → 0,0 MB**, zero niepowodzeń, a pomiar ponowny dał zero kandydatów. Asercje korzeni wytrzymały też przypadek, którego nikt nie planował: ścieżka **dysko-relatywna ze znakiem CR w środku** (rozjechane escapowanie w `node -e`) rozwinęła się względem katalogu projektu, `lstat` jej nie znalazł i **żadna operacja nie wykonała się na dysku**. Ujawniło to jednak osobną wadę raportowania: taka pozycja jest meldowana jako `skasowane`, nie jako `nieobecne` (`work-artifacts.js:843`) — wołający nie ma po czym poznać, że jego lista jest zepsuta. Wada zapisana w `STATE.md`, poza zakresem planu. Niezmierzone bez zmian: junction na inny dysk i ścieżka dłuższa niż limit Windows. Zmierzone: 2026-09-03 (E1, E2, E3, E4) |

| M1 | Skill wspólny dla dwóch narzędzi pokaże listę tego drugiego — sesja w Cursorze zobaczy modele Anthropic (plan REKOMENDACJA_MODELU, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | O liście rozstrzyga **nazwa pliku**, którą podaje adapter wołający rdzeń (Aneks A) — treść skilla jest jedna i nazwy narzędzia nie zna; która lista obowiązuje, mówi hook startu jednym zdaniem (zasada 8). Pierwszy pomiar (E1) na dwóch projektach kontrolnych w jednym przebiegu: projekt obsłużony hookiem Claude Code ma w `.claude/relai/` **wyłącznie** `MODELE-claude-code.md`, projekt Cursora **wyłącznie** `MODELE-cursor.md`; treść obu kopii zgodna sumą ze źródłem adaptera. Otwarte, bo zmierzone na hookach uruchomionych z repozytorium, a **nie w żywej sesji Cursora** — reguły 1.7.0 i 1.8.0 tego adaptera też nigdy nie były w nim uruchomione. **E4: mechanizm jest wydany (1.9.0) i zmierzony po stronie Claude Code w świeżej sesji z wydanego cache'u** — projekt kontrolny bez podłożonego hooka dostał zdanie o liście i zdanie o jej wieku z pliku `MODELE-claude-code.md`. Powód otwarcia bez zmian i **jedyny**: żadna z tych ścieżek nie była uruchomiona w aplikacji Cursora. **CURSOR_1_9_1 (2026-09-04):** hook Cursora na protokole aplikacji (`workspace_roots`, BOM) produkuje zdanie o `MODELE-cursor.md`, nie o liście Claude Code; para wariantów wieku zgadza się z E3. Sesja GUI w repozytorium RelAI bez zainstalowanego adaptera tego zdania **nie dostała**, a `/relai-models` zgodnie z procedurą nie zgadła narzędzia — to jest pozostały kształt ryzyka tutaj, nie rozjazd list. Zmierzone: 2026-09-03 (E1), 2026-09-04 (E4), 2026-09-04 (CURSOR_1_9_1) |
| M2 | Kopia listy w projekcie zostaje nadpisana przy starcie sesji i zjada odświeżenie zrobione komendą (plan REKOMENDACJA_MODELU, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | `provisionModelList()` kopiuje **tylko wtedy, gdy pliku nie ma** — jedyna różnica wobec `provisionTemplates()`, które nadpisuje przy każdym starcie. Dowód negatywny (E1): plik zmieniony ręcznie w projekcie kontrolnym przeżył ponowne uruchomienie hooka, suma po normalizacji CRLF → LF `ecc6d18d9f6ccf65` przed i po; kontrola pozytywna w tym samym przebiegu — skasowany plik powstał ponownie z sumą źródła. Otwarte do czasu, aż istnieje druga droga zapisu do tego pliku: `/relai-models` z E2 pisze do tej samej kopii, a `/relai-update` do katalogu obok. **E2: druga droga zapisu istnieje i przeżywa start sesji.** Po odświeżeniu w projekcie kontrolnym Claude Code suma listy `f82ee8da0dbe7997` przed ponownym uruchomieniem hooka i po nim, a hook zameldował nową datę (`z dnia 2026-09-04`) zamiast starej; w projekcie Cursora to samo z sumą `65eca9cbea99f0b3`. Otwarte już tylko z powodu `/relai-update`, którego ta droga jeszcze nie dotknęła. **E4: trzecia droga ma odtąd zapisany zakaz** — wiersz `Lista modeli` w tabeli stanu docelowego `/relai-update` kończy się zdaniem „samej listy `.claude/relai/MODELE-<narzędzie>.md` **nie ruszasz** — kopia w projekcie jest trwała i przeżywa aktualizację". Zakaz jest **napisany, nie zmierzony**: pierwszy przebieg `/relai-update` na projekcie z ręcznie poprawioną listą jeszcze się nie odbył i to jest jedyny powód, dla którego ryzyko zostaje otwarte. Zmierzone: 2026-09-03 (E1), 2026-09-04 (E2) |
| M3 | Strona dokumentacji zmienia układ i odczyt z sieci zwraca śmieci albo nic (plan REKOMENDACJA_MODELU, ryzyko 3) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Odświeżenie zawsze kończy się pokazaniem różnicy i pytaniem; niepowodzenie zostawia starą listę **z jej datą**, nigdy pustą. Pomiar E2 na odczycie adresu nieistniejącego (`HTTP 404 Not Found`): lista w projekcie kontrolnym została z sumą `1f67fe1bc954ecdc` i `list-date: 2026-09-03`, czyli dokładnie taka jak przed przebiegiem — dowód treścią pliku, nie komunikatem. Niezmierzone: strona odpowiadająca **200 ze zmienionym układem** (odczyt „udany", treść bez nazw) — to jest realny kształt tego ryzyka i czeka na pierwszy taki przypadek. **E4: stan po wydaniu bez zmian** — komenda jest w cache'u 1.9.0 i od tej pory może ją wywołać każdy projekt, więc szansa na trafienie rośnie, ale sam mechanizm ochrony (różnica przed zapisem, stara lista przy niepowodzeniu) jest ten sam co zmierzony w E2. Zmierzone: 2026-09-04 (E2) |
| M5 | Nazwy modeli zmieniają się szybciej niż wydania RelAI (plan REKOMENDACJA_MODELU, ryzyko 6) | **Średni** (2026-09-04) | **OTWARTE** | Lista mieszka w adapterze **i** w projekcie; `/relai-models` aktualizuje kopię projektu bez wydawania nowej wersji pluginu. Pierwsze realne odświeżenie (E2) potwierdziło, że ryzyko nie jest teoretyczne: strona aliasów wymienia dziś dziesięć pełnych ID (`claude-opus-5` … `claude-fable-5`), a lista Cursora ~45 pozycji od pięciu dostawców — wobec czterech i trzech pozycji w listach RelAI. Od E3 lista ma wiek i próg: powyżej **7 dni** start sesji mówi jedno zdanie z propozycją `/relai-models`, poniżej — zero znaków (zmierzone parą wariantów różniącą się wyłącznie `list-date`: 258 znaków wobec 0, potwierdzone w świeżej sesji CLI odpowiedzią `BRAK LINII`). **E4: pierwszy pełny cykl domknięty** — lista, komenda, próg i **wydanie** (1.9.0, potwierdzone treścią plików z cache'u; dwanaście komend, obie listy, zdanie o wieku działające w świeżej sesji z wydanej wersji). Otwarte już **wyłącznie** z pierwszego powodu: przypomnienie mówi o wieku listy, a nie o tym, że dostawca zmienił nazwy — lista tygodniowa może być świeża i nieprawdziwa naraz. To jest trwała własność mechanizmu, nie zaległość wydania. Zmierzone: 2026-09-04 (E2, E3, E4) |

> Ryzyka zamknięte R2, M4 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-09-04.md](archiwum/ryzyka/RYZYKA_2026-09-04.md)
> — przeniesione 2026-09-04, suma kontrolna `e2542c88b2ccd9a8`.

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka
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
  [wpis 2026-09-03 — E1 planu REKOMENDACJA_MODELU](#2026-09-03--e1-planu-rekomendacja_modelu-pytanie-o-model-pokazuje-nazwy-nie-klasy)

- **Czy ochrona konfiguracji ma zostać przy werdykcie `ask`** — w sesji z automatyczną akceptacją
  edycji `ask` nie zatrzymuje niczego, więc edycja sekcji niemutowalnej **cudzego** `CLAUDE.md`
  przechodzi mimo poprawnego werdyktu hooka. Podnieść do `deny` dla cudzego projektu (własny
  zostaje przy `ask`), zostawić bez zmian, czy opisać to jako świadomą granicę? · 2026-09-04 ·
  [wpis 2026-09-04 — Blokada guardraila pokazana w żywej sesji](#2026-09-04--blokada-guardraila-pokazana-w-żywej-sesji-ochrona-konfiguracji-okazuje-się-doradcza)

- **Ponowna instalacja pre-commita w projektach z hookiem sprzed 1.9.2** — stary układ
  (bezrozszerzeniowy `pre-commit` + `relai-secret-scan.js`) przewraca się w projekcie
  z `"type": "module"` i blokuje każdy commit. Dotyczy PolyFlow, JiraManagera i projektów
  zewnętrznych; instalacja jest jawną czynnością człowieka, więc RelAI jej nie wykona sam.
  · 2026-09-04 ·
  [wpis 2026-09-04 — Cztery defekty pre-commita](#2026-09-04--cztery-defekty-pre-commita-ze-zgłoszenia-zewnętrznego-wydanie-192)

- **Ikony README renderują się w 17–23 px zamiast 24 px, więc kreska schodzi poniżej piksela** —
  podbić grubość z 2.6 na 3.2 (zmiana proporcji rysunku) czy scalić kolumnę ikony z kolumną komendy
  w README (bez ruszania grafiki)? · 2026-09-01 ·
  [wpis 2026-09-01 — Ikony komend czytelne na obu motywach](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--ikony-komend-czytelne-na-obu-motywach-githuba)

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

### 2026-09-04 — E3 planu REKOMENDACJA_MODELU: stara lista przypomina się sama, świeża milczy

**Zrobione:**

- **`core/templates/SPEC_USTAWIENIA.md` — wiersz `Lista modeli`.** Nowa sekcja „Wiersz `Lista
  modeli` (od 1.9.0)": format komórki (`włączona · 7 dni`), zamknięta lista brzmień przełącznika,
  człon liczbowy z jednostką, cztery zachowania ciszy i realny przykład. Wiersz dołączył do tabeli
  wierszy czytanych maszynowo (**pięć → sześć**) i do listy wierszy, które nie schodzą do archiwum
  (**sześć → siedem**, razem z `Język projektu`). W „Katalogu progów" doszła pozycja z kompletem
  sześciu kolumn — **19 → 20 wierszy**, kolumna „Adres egzekwowania" mówi „jest".
- **`core/process/session-signals.js` — `wiekListyModeli()` i `wiekListyModeliReport()`.**
  Wzorzec przepisany z `artefaktyRobocze()`: własna para wzorców przełącznika (`LISTA_WLACZONA` /
  `LISTA_WYLACZONA`, nie współdzielona z żadnym innym wierszem), kopia wykonawcza progu
  `PROG_LISTY_MODELI_DNI = 7` z komentarzem, że jedynym źródłem prawdy jest specyfikacja, i zwrot
  rozróżniający `brakWiersza` / `wyłączone` / `nierozpoznana` / `brakDaty` / pomiar. Datę bierze
  `dataListyModeli()` — funkcja nietknięta. Nazwa pliku listy przychodzi od adaptera, tak jak
  w `provisionModelList()`.
- **Oba hooki startu — jedno zdanie ASCII, obok zdania o liście.** `[RelAI lista modeli]`: nazwa
  pliku, data listy, wiek w dniach, próg i propozycja `/relai-models`. Adapter Cursora podaje
  dodatkowo `interaktywna` z `is_background_agent`, tak jak przy trzech pozostałych raportach.
  W obu adapterach nazwa pliku listy zeszła do stałej `MODELE_NAZWA` — jedno miejsce dla
  prowizjonowania i dla pomiaru wieku.
- **`docs/USTAWIENIA.md`** — wiersz `| 2026-09-04 | Lista modeli | włączona · 7 dni |`. Hook
  `config-protection` zapisu nie zatrzymał.
- **Aneks C do planu (2026-09-04)** — rozszerzenie zakresu o domknięcie bramki pomiaru E2, po
  pytaniu do właściciela i jego decyzji „zmierz teraz, w tym etapie".

**Zweryfikowane — jak dokładnie:**

- **Para wariantów różniąca się wyłącznie `list-date`.** Ten sam projekt kontrolny, materiał
  odtwarzany przed każdym wariantem: lista z **2026-08-05** → dokładnie jedna linia, **258 znaków**;
  lista z **2026-09-03** → **0 znaków**. Całe wyjście hooka: 16 linii wobec 15, różnica dwie linie —
  nowe zdanie i zdanie o liście z inną datą.
- **Cztery scenariusze ciszy, każdy z własną kontrolą, plus trzy dodatkowe.** Brak wiersza,
  `wyłączona`, `list-date: wczoraj`, data z przyszłości (2026-09-07), brak listy w projekcie oraz
  próg 60 dni przy liście sprzed 30 — **wszystkie 0 znaków**; kontrola pozytywna w tym samym
  przebiegu dała zdanie. Instrument: **10/10 scenariuszy zgodnych**.
- **Wartość spoza zamkniętej listy brzmień nie milczy.** Wiersz `Lista modeli | czasem` →
  204 znaki: „Dozwolone wartosci: wlaczona / wylaczona (on / off)". Ani pomiaru, ani ciszy.
- **Dowód negatywny „hook nie dotyka sieci" (ryzyko M4).** Przebieg powyżej progu z preloadem
  blokującym `http`, `https`, `net`, `tls`, `dgram`, `dns` (każde użycie rzuca wyjątek) oraz globalne
  `fetch`/`WebSocket`/`XMLHttpRequest`: **to samo zdanie co do znaku**, kod wyjścia `0` w obu
  przebiegach, `stderr` pusty, suma listy `c062812573483d0a` przed i po. Blokada jest mocniejsza od
  odciętej karty sieciowej — łapie także próbę, której błąd dałoby się zjeść w `catch`.
- **Lista nie zmienia się od samego przypomnienia.** Suma kontrolna pliku listy (po normalizacji
  CRLF → LF) identyczna przed przebiegiem powyżej progu i po nim we **wszystkich** scenariuszach.
  Jedyny wyjątek nazwany wprost w instrumencie: scenariusz „brak listy", w którym plik **ma prawo
  powstać** — kładzie go `provisionModelList()` z E1, a wiek liczy się już od świeżej daty.
- **Oba adaptery mówią to samo.** Ten sam projekt kontrolny, hook Claude Code i hook Cursora: zdania
  identyczne po podmianie nazwy pliku listy (`MODELE-claude-code.md` wobec `MODELE-cursor.md`).
  Poniżej progu oba milczą.
- **Zdanie jest ASCII.** `grep -P` w tej powłoce odmawia pracy („-P supports only unibyte and UTF-8
  locales"), więc wzorzec zamieszkał w pliku (L-0037): **16 linii komunikatu sprawdzonych, 0 znaków
  poza ASCII**; kontrola pozytywna instrumentu (linia z myślnikiem) zwróciła oczekiwany 1.
- **Pomiar w świeżej sesji CLI.** `claude -p` odzyskał uwierzytelnienie — sprawdzone jednym
  najtańszym wywołaniem na starcie etapu (L-0087), dzień po odmowie. Hook podłożony lokalnie przez
  `.claude/settings.json` projektu kontrolnego (L-0085): wariant „lista z 2026-08-05" przepisał
  zdanie dosłownie, wariant „lista z 2026-09-03" odpowiedział `BRAK LINII`.
- **Bramka E2 domknięta (Aneks C).** Komenda podłożona jako `.claude/commands/relai-models.md`,
  fraza uruchomiona dosłownie `/relai-models`, dwa wywołania w **tym samym** projekcie bez
  odtwarzania materiału między nimi. Obie sesje zatrzymały się na pytaniu o zgodę na ruch sieciowy
  przed pierwszym połączeniem i wypisały adresy, które chcą odczytać; sumy `docs/USTAWIENIA.md`
  (`de58434a7e6fa020`) i listy (`bb7a0feae4583734`) identyczne przed pierwszym i po drugim
  wywołaniu — **zgoda nie została nigdzie zapamiętana**. Obie sesje przy okazji zacytowały nowe
  zdanie E3 („95 dni przy progu 7").
- **Rdzeń czyta wiersz tego projektu.** `wiekListyModeli()` na RelAI zwraca pomiar, nie
  `brakWiersza`: `{progDni: 7, data: "2026-09-04", wiekDni: 0}` → raport pusty; przy podstawionej
  dacie `2026-10-14` → `wiekDni: 40` i jedno zdanie. Projekt milczy dziś, bo lista jest dzisiejsza.
- **Pliki z sekcji „Nie ruszasz" nietknięte.** `git diff --stat` pokazuje wyłącznie pliki zakresu:
  oba hooki, rdzeń, `SPEC_USTAWIENIA.md`, `docs/USTAWIENIA.md`, `STATUS.md` planu i `PLAN.html`
  (Aneks C). Ani `dataListyModeli()`, ani `MODELE.md` adapterów, ani `relai-models.md`, ani
  walidator, ani `KOMENDY.md`, ani `README.md`, ani numer wersji.
- **`node core/tools/validate-adapters.js` → kod 0** („3 zrodel, wartosc 1.8.1").
- **Katalog roboczy etapu.** `.claude/relai/work/REKOMENDACJA_MODELU/E3/` — raport przed:
  **1,6 MB, 1 pozycja**, po kasowaniu **0,0 MB**, raport ponowny: zero kandydatów, siedem pozycji
  chronionych z powodem. Artefakty poza katalogiem etapu: **żadne** — trzy projekty kontrolne
  (`p1`, `p-sesja`, `p-bramka`) i cztery instrumenty leżały w środku. Kopia listy
  `.claude/relai/MODELE-claude-code.md`, którą hook położył w tym repozytorium podczas pomiaru,
  **zostaje**: jest trwałą kopią projektu, nie artefaktem etapu.

**Świadomie odłożone:**

- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma — trzecia reprodukcja.** Lista kasowania
  zapisana przez `node -e` z podwójnym escapowaniem straciła backslashe; narzędzie wypisało
  `Skasowane: 1` i `OK` dla ścieżki `...\RelAI\UsersLukaszDesktopRelAI...`, która nigdy nie
  istniała, a katalog stał nietknięty. Jedynym sygnałem rozbieżności było `Przed: 0.0 MB, po:
  0.0 MB` przy 1,6 MB kandydatów w raporcie chwilę wcześniej. Poprawka (rozdzielenie `skasowane`
  od `nieobecne`) dotyczy kodu wydanego w 1.8.0 — poza zakresem E3.
- **`zloz-plan.js` w `.claude/relai/work/REKOMENDACJA_MODELU/`** — plik z czasu tworzenia planu,
  leżący **obok** katalogów etapów, więc żadna grupa raportu go nie obejmuje. Zostaje.
- **Prowizjonowanie listy przy instalacji Cursora** — bez zmian wobec E1 i E2.

**Do zrobienia przez człowieka:**

- **Numer wydania: 1.9.0 czy 1.8.2** — bez zmian, przed E4. Po E3 argument za `1.9.0` urósł:
  wydanie niesie nową komendę, nowy wiersz ustawień i nowy próg.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — E4 planu REKOMENDACJA_MODELU: wydanie 1.9.0, karta zna model spoza listy

**Zrobione:**

- **`adapters/claude-code/commands/relai-stage.md` — trzeci przypadek w karcie.** Punkt „Model
  wykonawczy" Kroku 4 rozstrzyga odtąd trzy sytuacje, nie dwie: model zgodny, model inny niż
  wymagany i **model spoza listy**. Ten trzeci pisze nazwę modelu sesji, klasę wymaganą przez plan
  i datę listy — i **nie blokuje startu**: lista mówi, co istnieje, a nie kto ma prawo pracować.
  Nazwa pliku listy pochodzi **ze zdania hooka startu**, nigdy z własnego rozpoznania narzędzia;
  bez listy karta zostaje przy dwóch pierwszych przypadkach i o liście milczy. Przypomnienia
  o starej liście karta nie powtarza — ma ono jednego właściciela (L-0036).
- **Cztery specyfikacje uczą się listy.** `SPEC_PROMPT_ETAPU.md` (sekcja 3) i — z **Aneksu D** —
  `SPEC_ODNOGA.md` (sekcja 3) niosą **klasę i nazwę razem**, a przy nazwie datę listy; obie mają
  przepisany przykład. `SPEC_CLAUDE_MD.md` (punkt 8 układu i sekcja „Dobór modeli" w przykładzie)
  **odsyła do listy** zamiast wpisywać nazwy na stałe — `CLAUDE.md` jest kopiowany latami, a nazwy
  się starzeją. `SPEC_STATUS.md` zapisuje w linii metrycznej **narzędzie**, w którym ustalono model
  wykonawczy; linia pozostaje jedną linią z członami po `·`.
- **`core/tools/validate-adapters.js` — szóste sprawdzenie.** Każdy adapter z polem `models`
  w `core/MANIFEST.json` musi wskazywać **istniejący** plik, a plik nieść czytelną linię
  `list-date: RRRR-MM-DD`. Bez tego deklaracja mogła wskazywać plik, którego nie ma, i nikt by tego
  nie zobaczył — cisza mechanizmu wygląda dokładnie tak samo jak zgodność.
- **Wydanie 1.9.0.** Numer podbity w **trzech** źródłach (`core/MANIFEST.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`) i w markerach czytanych przez
  ludzi i przez mechanizm: `README.md`, `CLAUDE.md`, `docs/KOMENDY.md`, `docs/USTAWIENIA.md`,
  `adapters/cursor/README.md`, skill `relai-core` (linia wersji + marker wymagany w ustawieniach),
  `/relai-update` (pięć deklaracji stanu docelowego). `SPEC_KOMENDY.md` i `/relai-update` mówią
  odtąd o **dwunastu** komendach, mają wiersz `/relai-models` i wiersz ustawień `Lista modeli`
  (`włączona · 7 dni`) w tabeli stanu docelowego; `docs/KOMENDY.md` dostał punkt o starej liście
  w sekcji „Czego RelAI pilnuje bez proszenia".
- **Aneks D do planu (2026-09-04)** — zakres E4 rozszerzony o `SPEC_ODNOGA.md` po sygnale
  odchylenia zgłoszonym w trakcie etapu i decyzji człowieka.

**Zweryfikowane — jak dokładnie:**

- **Karta mówi o modelu spoza listy — na materiale, parą różniącą się wyłącznie listą.** Dwa
  projekty kontrolne zbudowane jednym instrumentem (`buduj-kontrolne.js`), identyczne co do
  `CLAUDE.md`, planu, promptu etapowego, hooka i podłożonej komendy; różnica: `proj-spoza` ma listę
  bez Opusa, `proj-nalisci` — z Opusem. Świeża sesja `claude -p` z komendą podłożoną lokalnie
  (L-0085, bo w chwili pomiaru plugin w aplikacji był w 1.8.1): w `proj-spoza` karta napisała
  „Sesja działa na `claude-opus-5[1m]` — tego identyfikatora nie ma na liście modeli narzędzia
  z dnia **2026-09-04**", podała klasę **najsilniejszą** i **nie zablokowała startu**. Kontrola
  pozytywna w tej samej parze: w `proj-nalisci` tego zdania **nie ma** — karta napisała, że model
  sesji odpowiada wymaganemu.
- **Walidator wyłapuje obie usterki, a materiał wychodzi nietknięty.** Instrument
  `walidator-listy.js`, cztery scenariusze w **jednym** przebiegu, materiał odtwarzany przed
  każdym: repo nietknięte → kod **0** i linia `+ listy modeli adapterow: 2`; `models` na plik
  nieistniejący → kod **1**, komunikat `adapter "claude-code": deklaracja models wskazuje
  "adapters/claude-code/MODELE-NIE-MA.md", a tego pliku nie ma`; `list-date: wczoraj` → kod **1**,
  komunikat o braku czytelnej linii; repo odtworzone → kod **0** (kontrola pozytywna na końcu,
  L-0088). Sumy po normalizacji CRLF → LF: `MANIFEST f66b9a9f1c5d1d15` i `MODELE f82ee8da0dbe7997`
  identyczne przed i po, `git diff` na obu plikach pusty. Wynik **4/4**.
- **Trzy specyfikacje niosą nowy przykład, stare brzmienie zniknęło.** `grep` po starych
  brzmieniach w `core/templates/` zwraca **zero** trafień; nowe przykłady stoją
  w `SPEC_PROMPT_ETAPU.md:202`, `SPEC_STATUS.md:207` i `SPEC_CLAUDE_MD.md:114,295`. Jedyne
  trafienie tego `grep`-a — `SPEC_ODNOGA.md:250` — było **sygnałem odchylenia**, nie usterką
  weryfikacji, i zostało rozstrzygnięte Aneksem D w trakcie etapu.
- **Numer wersji zgodny w trzech źródłach:** `node core/tools/validate-adapters.js` → kod **0**,
  linia `numery wersji: 3 zrodel, wartosc "1.9.0"`.
- **`grep` po starym numerze rozstrzygnięty co do trafienia.** 48 trafień `1.8.1` poza `.git`,
  archiwum i katalogiem roboczym. Zmienione (**16**): trzy źródła wersji, `README.md`, `CLAUDE.md`,
  `docs/KOMENDY.md`, `docs/USTAWIENIA.md`, `adapters/cursor/README.md`, dwa miejsca w skillu
  `relai-core`, pięć w `/relai-update`. Zostawione świadomie: komentarze „od 1.8.1" w kodzie
  (`session-signals.js`, `work-artifacts.js`, `clean-work.js`, oba `secret-scanner.js`,
  `config-protection.js`, `core/README.md`) — to **datowanie zmiany**, nie deklaracja wersji;
  historia w `ARTEFAKTY.md` i `LEKCJE.md`; zamrożone `PLAN.html` i prompty etapowe planu; karta
  i prompt odnogi `GUARD_PO_SCIEZCE` oraz `STATUS` planu ROZWOJ_PO_WYDANIU; `STATUS.md:60` tego
  planu (fakt z chwili pomiaru E2). `docs/STATE.md` przepisany osobno.
- **Wydanie potwierdzone treścią plików z cache'u, nie komunikatem CLI** (L-0004, L-0061).
  Sekwencja P-005 wykonana: push (`09335b4`) → `claude plugin marketplace update relai` →
  `claude plugin update relai@relai` („updated from 1.8.1 to 1.9.0"). W katalogu
  `~/.claude/plugins/cache/relai/relai/1.9.0/`: **dwanaście** plików komend z `relai-models.md`,
  obie listy `MODELE.md`, karta `/relai-stage` z frazą „spoza listy", `"version": "1.9.0"`
  w `core/MANIFEST.json` **i** w `.claude-plugin/plugin.json`.
- **Zdanie o wieku listy działa w wydanej wersji — bez podkładania hooka.** Dwa projekty kontrolne
  bez `.claude/settings.json` i bez lokalnej komendy, różniące się **wyłącznie** `list-date`.
  Świeża sesja `claude -p` w `proj-stara` (lista z 2026-08-01) przepisała linię dosłownie:
  `[RelAI lista modeli] Lista modeli tego narzedzia (.claude/relai/MODELE-claude-code.md, z dnia
  2026-08-01) ma 34 dni przy progu 7 dni, wiec nazwy moga byc nieaktualne.` — a `proj-swieza`
  (lista z 2026-09-04) odpowiedziała `BRAK LINII`. Hook 1.8.1 tej funkcji nie miał w ogóle, więc
  sama obecność linii dowodzi, że sesja wykonała **1.9.0**.
- **Pliki z sekcji „Nie ruszasz" nietknięte poza numerem wersji.** `git diff` na
  `adapters/*/MODELE.md`, `relai-models.md`, `core/process/session-signals.js`,
  `SPEC_USTAWIENIA.md` i obu hookach startu: **pusty**. Jedyna zmiana w `docs/USTAWIENIA.md` to
  linia markera `Wersja RelAI: 1.8.1 → 1.9.0` — dokładnie dozwolony wyjątek.
- **Katalog roboczy etapu przejrzany raportem i skasowany po „tak".** Raport: jedna grupa („etap
  zamkniety"), **2,2 MB / 1 pozycja**, sześć pozycji chronionych z powodem (w tym
  `MODELE-claude-code.md` i `templates` powodem `opisane / README.md:150`). Po kasowaniu:
  **2,2 MB → 0,0 MB**, raport ponowny bez ani jednego kandydata. Lista kasowania zapisana
  **ścieżką z `path.resolve`**, nie literałem — `kasuj` melduje `skasowane` także dla ścieżki,
  której nie ma. Artefakty poza katalogiem roboczym: **żadne** — cztery projekty kontrolne i oba
  instrumenty powstały w `.claude/relai/work/REKOMENDACJA_MODELU/E4/`.

**Świadomie odłożone:**

- **`zloz-plan.js` w `.claude/relai/work/REKOMENDACJA_MODELU/`** — 29 KB z czasu tworzenia planu,
  leżące **obok** katalogów etapów, więc żadna grupa raportu go nie obejmuje. Bez zmian wobec E3;
  wraca przy zamknięciu planu.
- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma** — bez zmian, to kod wydany w 1.8.0
  (`core/process/work-artifacts.js:843`), poza zakresem E4. Pozycja stoi w `STATE.md`.
- **Blokada w żywej sesji aplikacji** — pomiary E4 poszły przez świeże sesje `claude -p`, które są
  osobnym procesem i ładują cache 1.9.0. Aplikacja desktopowa nadal wykonuje kod sprzed restartu
  (P-005), więc „działa w żywej sesji" wolno powiedzieć dopiero po jej restarcie.

**Do zrobienia przez człowieka:**

- **Restart aplikacji Claude Code** — dopiero po nim żywa sesja wykonuje 1.9.0. Wydanie jest
  potwierdzone treścią plików z cache'u i zmierzone w świeżych sesjach CLI; restart domyka ostatnią
  warstwę P-005. *(rozstrzygnięte 2026-09-04 przy zamknięciu planu: świadomie zostawione otwarte,
  przeniesione do `STATE.md`, sekcja „Co dalej")*

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — PLAN REKOMENDACJA_MODELU ZAMKNIĘTY: dowiezione vs plan

**Zrobione — dowiezione wobec planu:**

Plan miał cztery etapy i **wszystkie cztery są zamknięte**, w dwa dni robocze (2026-09-03 →
2026-09-04), z czterema aneksami. Wobec zapisanego zakresu:

- **E1 — lista modeli i pytanie z nazwami: dowiezione w całości.** `MODELE.md` w obu adapterach,
  `provisionModelList()` w rdzeniu (kopia **trwała**, nie nadpisywana przy starcie), zdanie o liście
  w obu hookach startu, nazwy zamiast klas w skillu planowania. **Aneks A** zmienił jedną rzecz
  wobec planu: o tym, która lista obowiązuje, rozstrzyga **nazwa pliku** podana przez adapter, a nie
  katalog — bo oba adaptery prowizjonują do `.claude/relai/`.
- **E2 — komenda `/relai-models`: dowiezione, plus zakres z Aneksu B.** Dwunasta komenda, zgoda na
  ruch sieciowy **każdorazowa** (bramka rozstrzygnięta przez człowieka wbrew wariantowi „raz na
  projekt" z sekcji 9 planu), różnica przed zapisem, odczyt nieudany zostawia starą listę z jej datą.
  **Aneks B** dołożył jednorazowe przeniesienie pierwszego wyniku odświeżenia do obu `MODELE.md` —
  dzięki temu bramka „nazwy modeli Cursora" zamknęła się w E2 zamiast czekać do E4.
- **E3 — próg i przypomnienie: dowiezione, plus zakres z Aneksu C.** Wiersz `Lista modeli`
  (`włączona · 7 dni`) z własnym wyłącznikiem, `wiekListyModeli()` w rdzeniu, jedno zdanie ASCII
  w obu hookach, pozycja w katalogu progów. **Aneks C** domknął przy okazji zaległą bramkę pomiaru
  E2, bo `claude -p` odzyskał uwierzytelnienie tego samego dnia.
- **E4 — kontrola modelu, dokumenty, wydanie: dowiezione, plus zakres z Aneksu D.** Trzeci przypadek
  w karcie `/relai-stage`, trzy specyfikacje z planu **plus** `SPEC_ODNOGA.md` z **Aneksu D**
  (sygnał odchylenia zgłoszony w trakcie etapu), szóste sprawdzenie walidatora i **wydanie 1.9.0**.

**Czego plan nie przewidział, a wyszło:** czterech aneksów. Trzy z nich (A, B, D) to ta sama
rodzina odkryć — mechanizm dotykał więcej miejsc, niż widać było przy pisaniu planu: prowizjonowanie
do wspólnego katalogu, druga lista wymagająca uzupełnienia przez człowieka, druga specyfikacja
z tym samym blockquote'em. Żaden z nich nie zmienił celu ani liczby etapów.

**Czego nie dowieziono:** niczego z zakresu planu. Poza zakresem zostaje to, co plan świadomie
wykluczył — wyprowadzanie listy z plików stanu narzędzi (odrzucone w sekcji 4) i rankowanie modeli
(zakazane w sekcji 2: lista mówi, co jest, nigdy co lepsze).

**Zweryfikowane — jak dokładnie:** cztery etapy, **9 + 12 + 13 + 11 = 45 punktów weryfikacji**,
wszystkie zdane; sześć instrumentów pomiarowych; pomiary w świeżych sesjach CLI przy E2 (Aneks C),
E3 i E4. Wydanie potwierdzone **treścią plików z cache'u** (L-0004, L-0061), nie komunikatem CLI.

**Zamknięcie planu:** bramki manualne — **pięć rozstrzygniętych**, żadnej otwartej; odnóg plan nie
miał. Jedna pozycja „Do zrobienia przez człowieka" (restart aplikacji) **świadomie zostawiona
otwarta** i przeniesiona do `STATE.md`. Ryzyko **M4 zamknięte** (sieć weszła do mechanizmu i została
tam, gdzie ją wpuszczono — w komendzie wywołanej wprost, za każdorazową zgodą); M1, M2, M3 i M5
zostają otwarte z powodami wypisanymi przy każdym. Folder planu **przeniesiony** do
`docs/archiwum/plany/REKOMENDACJA_MODELU/`, linia „Aktywny plan" w `CLAUDE.md` brzmi **`brak`** —
ROZWOJ_PO_WYDANIU jest jedynym planem niezamkniętym, ale pozostaje zamrożony, a plan zamrożony nie
jest planem aktywnym.

**Świadomie odłożone:**

- **`zloz-plan.js` w `.claude/relai/work/REKOMENDACJA_MODELU/`** — 29 KB obok katalogów etapów,
  poza zasięgiem grup raportu sprzątania. Zostaje; kandydatem stanie się dopiero wtedy, gdy raport
  nauczy się katalogów tematów bez etapów.

**Do zrobienia przez człowieka:**

- **Restart aplikacji Claude Code** — przeniesione do `STATE.md`, sekcja „Co dalej".
- **Który plan ma być następny** — dziś linia aktywnego planu brzmi `brak`. ROZWOJ_PO_WYDANIU czeka
  na dostęp do Codeksa (E7); odmrożenie jest decyzją człowieka, nie mechanizmu.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Rotacja trzech dokumentów: dziennik, ryzyka zamknięte, lekcje

**Zrobione:**

- **Rotacja dziennika — 22 wpisy** (`2026-09-01 … 2026-09-03`) do
  [DZIENNIK_2026-09-01_2026-09-03.md](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md),
  suma kontrolna `4829effc7c2db525`. Żywy plik **201,1 → 84,4 KB**; w sekcji „Wpisy" zostało
  **dziesięć** najnowszych wpisów i siódma linia-odsyłacz.
- **Rotacja ryzyk zamkniętych — 2 wiersze** (`R2`, `M4`) do
  [RYZYKA_2026-09-04.md](archiwum/ryzyka/RYZYKA_2026-09-04.md), suma kontrolna
  `e2542c88b2ccd9a8`. Sekcja „Stan otwartych ryzyk" **16,8 → 13,4 KB**, dziewięć wierszy zostaje;
  linia-odsyłacz pod tabelą, obok tej z 2026-08-21.
- **Rotacja lekcji — 15 pełnych lekcji** (`L-0055 … L-0069`) do
  [LEKCJE_L-0055_L-0069.md](archiwum/lekcje/LEKCJE_L-0055_L-0069.md), suma kontrolna
  `f71e94d2e913893b`. `LEKCJE.md` **54,7 → 37,2 KB**, w żywym rejestrze zostało **20** lekcji
  (`L-0070 … L-0089`). Sekcja „Zasady aktywne" nietknięta — zasady z przeniesionych lekcji żyją
  w destylacie, który nie rotuje nigdy.

**Zweryfikowane — jak dokładnie:**

- **Trzy niezależne przebiegi, trzy sumy kontrolne, każdy dwufazowy.** Faza 1 liczyła sumę
  fragmentu w żywym pliku, zapisywała archiwum i **odczytywała je z dysku**, żeby policzyć sumę
  treści spod separatora; faza 2 ruszała dopiero po zgodności. Wszystkie trzy pary sum zgodne —
  gdyby która się rozjechała, przebieg kończyłby się na `STOP` z nietkniętym żywym plikiem
  (instrument ma tę gałąź napisaną, ale nie została w tym przebiegu wykonana).
- **Przepięcie linków sekcji „Czeka na człowieka": 3 pozycje**, każda dostała przed kotwicą ścieżkę
  pliku archiwum; treść pozycji, tekst linku i data nietknięte. **Pozycji z martwą kotwicą: 0** —
  policzone niezależnym skryptem po rotacji, na wygenerowanych kotwicach dziesięciu żywych wpisów.
- **Raport startu po rotacji: zostaje jedna pozycja z czterech.** Linia `[RelAI budzet startu]`
  znika (warstwa startowa mieści się w budżecie), z `[RelAI progi dokumentow]` schodzą dziennik
  i lekcje, a zostaje **sekcja „Stan otwartych ryzyk" 13,4 KB przy progu 12 KB** — bo nie ma tam
  już czego rotować.
  *(sprostowanie z tej samej sesji: pierwotnie stało tu „hook wypisał 0 znaków". Zdanie było
  fałszem instrumentu, nie pomiarem — hooka wołałem przez `echo '{"cwd":"C:\\Users\\…"}'`,
  gdzie backslashe rozjechały ścieżkę, więc milczał z powodu złego wejścia. Ścieżka z ukośnikami
  daje linię progu. L-0090.)*
- **Decyzja o głębokości była decyzją człowieka, nie mechanizmu.** Litera reguły („bierz, aż część
  rotowalna zejdzie poniżej 60% progu") była spełniona po **sześciu** wpisach, a plik zostawałby
  wtedy na 169,5 KB — nadal ponad progiem 150 KB, z pustym już zapasem do wzięcia. W lekcjach
  reguła nie kazała zabrać **ani jednej** (część rotowalna 17,7 KB przy celu 30 KB), mimo pliku
  54,7 KB przy progu 50 KB. Pokazane liczbami przed decyzją; człowiek wybrał wariant „wszystkie
  kandydaty" w obu dokumentach.

**Świadomie odłożone:**

- **Sekcja ryzyk zostaje 13,4 KB przy progu 12 KB** — po zabraniu obu zamkniętych wierszy nie ma
  już czego wziąć. Dziewięć pozostałych ryzyk jest **otwartych albo zawężonych**, a ich komórek
  „Mitygacja" nie kompresuje się automatycznie przy statusie `OTWARTE`. Sekcję odchudzi wyłącznie
  zamknięcie ryzyk albo podniesienie progu — obie rzeczy są decyzją człowieka. Hook startu po
  rotacji milczy, więc pozycja nie wraca przy każdej sesji.
- **`zloz-plan.js` w `.claude/relai/work/REKOMENDACJA_MODELU/`** — bez zmian, nadal poza zasięgiem
  grup raportu sprzątania.

**Do zrobienia przez człowieka:**

- **Reguła głębokości rotacji do przemyślenia.** Cel postawiony na 60% części rotowalnej zatrzymuje
  rotację nad progiem w dokumencie, którego dolna granica jest gruba — dziś trzeba było wybierać
  ręcznie. Zmiana reguły dotknęłaby wszystkich projektów RelAI naraz, więc nie robię jej przy okazji
  rotacji; to materiał na odnogę albo plan.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — 1.9.1: raport artefaktów przestaje wywracać się na katalogu wątku samodzielnego

**Zrobione:**

- **`core/process/work-artifacts.js` — `statusOdnogi()` znosi `temat === null`.** Gałąź `_fixy`
  (wątek samodzielny, bez planu-rodzica) wołała `statusOdnogi(cwd, null, nazwa)`, a ta funkcja
  składała najpierw `docs/plany/<temat>/odnogi/…`; `path.join` na `null` rzucał
  `TypeError [ERR_INVALID_ARG_TYPE]` i **cały** raport artefaktów kończył się wywrotką. Teraz
  kandydatem przy braku tematu jest wyłącznie `docs/fixy/<nazwa>/ODNOGA.md` — jedyna ścieżka,
  która dla wątku samodzielnego ma sens. Zmiana: jeden warunek, zero nowych zależności.
- **Wydanie 1.9.1** — trzy źródła numeru plus markery czytane przez ludzi i przez mechanizm;
  `/relai-update` i skill `relai-core` mówią o wersji docelowej `1.9.1`.

**Zweryfikowane — jak dokładnie:**

- **Obie wersje w jednym przebiegu, na tym samym materiale** (L-0040): projekt kontrolny z markerem
  RelAI i katalogiem `.claude/relai/work/_fixy/watek-testowy/` bez karty odnogi, odtwarzany przed
  każdym wariantem. **A — kod wydany w 1.9.0, wzięty z cache'u pluginu**: kod wyjścia **1**,
  `ERR_INVALID_ARG_TYPE` w `statusOdnogi`. **B — kod po poprawce**: kod wyjścia **0** i raport
  z pozycją `.claude/relai/work/_fixy/watek-testowy [etap trwa / watek watek-testowy / brak karty]`,
  `Suma kandydatow: 0.0 MB`. Wariant A jest tu dowodem, że defekt był realny, a nie hipotezą
  z czytania kodu.
- **Wątek bez karty zostaje chroniony** — brak `ODNOGA.md` znaczy „nie wiadomo, czy zamknięty",
  więc pozycja nie jest kandydatem do skasowania. Zachowanie zgodne z bramką dokumentacyjną
  (S1) i niezmienione przez poprawkę.
- **Walidator:** `node core/tools/validate-adapters.js` → kod **0**, `3 zrodel, wartosc "1.9.1"`,
  szóste sprawdzenie (`listy modeli adapterow: 2`) bez zmian.
- **Jak defekt się ujawnił:** przy kroku sprzątania po rotacji, na własnym katalogu roboczym tej
  sesji — czyli dokładnie na ścieżce, którą prompt odnogi i specyfikacja same polecają wątkom
  samodzielnym. Kod pochodzi z 1.8.0 i był wydany w trzech wersjach, nigdy nie trafiając na
  materiał, który go wyzwala.

**Świadomie odłożone:**

- **Kopia narzędzia w projektach (`.claude/relai/tools/clean-work.js`) leczy się sama** — hook
  startu kopiuje ją z rdzenia przy każdej sesji, więc po wydaniu i restarcie projekt dostaje wersję
  po poprawce bez żadnego działania właściciela. Do tego czasu w tym repozytorium leży kopia sprzed
  poprawki.
- **`kasuj` melduje `skasowane` dla ścieżki, której nie ma** — osobna wada tego samego pliku
  (`work-artifacts.js:843`), nadal otwarta; poprawka wymaga rozdzielenia `skasowane` od
  `nieobecne` w wyniku i w wydruku, czyli zmiany kontraktu funkcji.

**Domknięte po restarcie (2026-09-04, ta sama sesja):**

- **Żywa sesja aplikacji wykonuje 1.9.1 — dowód treścią pliku, nie komunikatem CLI** (L-0004,
  L-0061). Kopia narzędzia podłożona do projektu przez hook **tej** sesji niesie poprawkę
  (`const kandydaci = temat ? [` w linii 346), a jej suma `e9b5bed342dbb6a3` jest identyczna
  z rdzeniem repozytorium i z cache'em `1.9.1`, przy sumie `0a7a6bed187efb52` dla `1.9.0` —
  to jest ta sama para wariantów, tylko zmierzona na wersji, którą aplikacja realnie ładuje.
- **Zachowanie w żywej sesji, nie w instrumencie:** katalog `.claude/relai/work/_fixy/kontrola-1-9-1/`
  utworzony po restarcie dał raport z kodem **0** i pozycją `[etap trwa / watek kontrola-1-9-1 /
  brak karty]`, `Suma kandydatow: 0.0 MB`, pomiar 77 ms. Przed poprawką ta sama ścieżka kończyła
  się wywrotką. Materiał kontrolny skasowany po pomiarze.

**Do zrobienia przez człowieka:**

- **Blokada guardraila z 1.8.1 w żywej sesji** — restart zdjął jedyną przeszkodę techniczną,
  a sam pomiar (zapis do cudzego projektu RelAI z katalogiem roboczym poza nim) nadal czeka.
  *(rozstrzygnięte 2026-09-04 — zmierzone w tej samej sesji, patrz wpis niżej)*

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Blokada guardraila pokazana w żywej sesji; ochrona konfiguracji okazuje się doradcza

**Zrobione:**

- **Pomiar, który czekał od 1.8.1**, wykonany bez instrumentu i bez podkładania czegokolwiek:
  żywa sesja aplikacji, otwarta w tym repozytorium, spróbowała zapisać plik z kluczem do **innego**
  projektu RelAI (`%TEMP%/relai-guard-zywa-sesja/`, materiał wytworzony na tę okazję i skasowany
  po pomiarze).

**Zweryfikowane — jak dokładnie:**

- **Kontrola pozytywna najpierw** (L-0088): zapis **bez sekretu** tą samą drogą — narzędzie `Write`,
  ta sama ścieżka docelowa, ta sama sesja — **przeszedł**. Odmowa niżej jest więc własnością
  treści, a nie ścieżki ani uprawnień do katalogu.
- **Zapis z kluczem odbity:** `RelAI secret-scanner: wykryto klucz AWS (AKIA...) w pliku sledzonym
  "config.md"`. Wartości hook nie zacytował — celowo.
- **Dowód, którego nie było przez trzy wydania: plik nie powstał.** Po odmowie w katalogu
  docelowym stoją wyłącznie `CLAUDE.md`, `docs/` i plik kontroli pozytywnej; `test -e config.md`
  daje „NIE ISTNIEJE", a `grep -r` po samej wartości klucza nie znajduje jej **ani** w projekcie
  docelowym, **ani** w repozytorium sesji. Dotąd zmierzony był sam werdykt `deny` z instrumentu.
- **Druga warstwa zachowała się poprawnie, a moje oczekiwanie było błędne.** Dopisanie zwykłej
  reguły do cudzego `CLAUDE.md` przeszło bez słowa — i tak ma być: `config-protection` chroni
  **wyłącznie sekcję niemutowalną**, a projekt kontrolny jej wtedy nie miał. Po dołożeniu sekcji
  hook zapytany o ten sam zapis odpowiedział `ask` z uzasadnieniem, a przy zapisie poza tą sekcją
  **milczał** — trzy scenariusze, w tym kontrola negatywna, jednym skryptem trzymanym w pliku,
  nie w `node -e` (L-0090). Werdykt `ask` pada także dla `docs/USTAWIENIA.md` cudzego projektu.

**Świadomie odłożone:**

- **`ask` jest tak silne, jak tryb uprawnień sesji.** Edycja sekcji niemutowalnej cudzego
  `CLAUDE.md` **przeszła** w tej sesji bez pytania, mimo poprawnego werdyktu hooka — bo sesja
  akceptuje edycje automatycznie. To nie jest defekt RelAI i nie zmieniam z tego powodu kodu:
  skan sekretów używa `deny` i dlatego zatrzymuje zapis niezależnie od trybu, a ochrona
  konfiguracji ma z założenia pytać człowieka. Fakt idzie do `STATE.md`, żeby nikt nie czytał
  „bez ostrzeżenia" jako „nie da się".

**Do zrobienia przez człowieka:**

- **Czy ochrona konfiguracji ma zostać przy `ask`** — dziś w sesji z automatyczną akceptacją nie
  zatrzymuje niczego. Podniesienie do `deny` dla **cudzego** projektu (własny zostawia `ask`) jest
  zmianą zachowania w obu adapterach, więc wymaga decyzji, nie poprawki przy okazji.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Wątek CURSOR_1_9_1: adapter Cursora dostaje kartę i prompt świeżej sesji

**Zrobione:**

- **Wątek samodzielny `CURSOR_1_9_1`** — `docs/fixy/CURSOR_1_9_1/ODNOGA.md` (karta) plus
  `PROMPT_ODNOGA.md` (cała pamięć świeżej sesji). Lokalizacja `docs/fixy/`, nie `docs/plany/`,
  bo żaden plan nie jest niezamknięty poza zamrożonym ROZWOJ_PO_WYDANIU, a ten wątek do niego
  nie należy: E7 dotyczy Codeksa, nie Cursora.
- **Wykonawca wzięty z listy modeli Cursora, nie z klasy** — `Grok 4.6`, `list-date 2026-09-04`.
  To pierwszy dokument procesu, który korzysta z mechanizmu wydanego w 1.9.0 po to, żeby nazwać
  model **narzędzia docelowego**, a nie tego, w którym powstaje prompt.
- **Zakres pięciopunktowy**: instalacja adaptera do projektu kontrolnego, start sesji z dwoma
  zdaniami o liście modeli, blokada sekretu przez opakowanie powłoki, trzy komendy nieuruchomione
  w Cursorze nigdy (`/relai-clean`, `/relai-models`, jedna do wyboru) i deinstalacja z cudzym
  wpisem w `hooks.json` jako kontrolą.

**Zweryfikowane — jak dokładnie:**

- **Stan wyjściowy promptu spisany z repozytorium, nie z pamięci**: trzy reguły `.mdc`
  (19,5 + 5,7 + 4,5 KB), cztery pliki w `adapters/cursor/hooks/`, instalator z pięcioma krokami
  i manifestem `.cursor/relai-install.json`, lista modeli z `list-date: 2026-09-04`.
- **Kolizja z dokumentacją wyłapana przy pisaniu karty**: `STATE.md` wymieniał hook
  `beforeReadFile` jako niezmierzony, a instalator stawia dziś **dwa** wpisy — `sessionStart`
  i `preToolUse`. Zamiast poprawiać `STATE.md` z marszu, wpisałem to jako punkt weryfikacji wątku:
  rozstrzygnie go przebieg w Cursorze, nie moje czytanie kodu (zasada 13).
- **Karta i prompt zgodne co do zakresu** — pięć punktów w obu, w tej samej kolejności, przy
  czym prompt mówi wprost, że w razie rozbieżności **wygrywa karta**.

**Świadomie odłożone:**

- **Rejestr artefaktów nietknięty** — `docs/ARTEFAKTY.md` jawnie wyłącza karty odnóg i prompty
  z rejestru: to produkty procesu RelAI, nie artefakty pluginu. Liczba 40 bez zmian.
- **Poprawki adaptera Cursora** — wątek jest pomiarem; defekt znaleziony w przebiegu ma iść do
  dziennika i do sekcji „Czeka na człowieka", a nie do kodu przy okazji.

**Do zrobienia przez człowieka:**

- **Uruchomić wątek w aplikacji Cursora** — Claude Code go nie wykona, bo cały sens pomiaru leży
  w narzędziu docelowym. Prompt jest samowystarczalny: świeża sesja nie potrzebuje niczego z tej
  rozmowy.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Wątek CURSOR_1_9_1: adapter Cursora zmierzony na wydaniu 1.9.1

**Zrobione:**

- **Instalacja na projekcie kontrolnym** `%TEMP%\relai-cursor-1-9-1`:
  `node adapters/cursor/install.js` → kod 0, manifest `.cursor/relai-install.json` niesie
  **1.9.1**, `.cursor/commands/` ma **12** plików (w tym `relai-models.md` i `relai-clean.md`),
  trzy reguły `.mdc`, dwa skille, 32 pliki specyfikacji, hooki `sessionStart` i `preToolUse`.
  Cudzy wpis `afterFileEdit` / `pomiar-cudzy` przeżył instalację.
- **Start sesji — para wariantów na protokole Cursora** (payload z `workspace_roots`, bez `cwd`,
  podwójny BOM jak w E5): lista `list-date: 2026-08-05` → linia `[RelAI lista modeli]` **253 znaki**
  (30 dni przy progu 7); lista `2026-09-04` → **0 znaków**. Zdanie o `MODELE-cursor.md` w obu.
  Suma listy identyczna przed i po. Materiał odtwarzany przed każdym wariantem.
- **Blokada sekretu.** Opakowanie `secret-scanner.cmd`: `permission: deny`, wartości nie cytuje;
  kontrola pozytywna na tym samym wejściu milczy (kod 0, puste stdout). Świeża sesja
  `cursor-agent -p` na projekcie kontrolnym z hookami od startu: zapis z kluczem →
  `WRITE_DENIED_FILE_MISSING`; zapis bez sekretu → `WRITE_OK_FILE_EXISTS` (`ok.md`).
- **Trzy komendy w tej sesji GUI (Grok 4.6):** `/relai-help` — `docs/KOMENDY.md` w całości,
  nagłówek 1.9.1 zgodny z `USTAWIENIA.md`; `/relai-models` — stop na Kroku 1, bo zdania hooka
  nie było w kontekście (adapter nie leży w tym workspace); `/relai-clean` — raport w grupach.
- **Deinstalacja:** `--uninstall` kod 0; cudzy wpis **został** (jedyny w `hooks.json`); katalogi
  `.cursor/rules`, `commands`, `skills` i manifest zniknęły.
- **`beforeReadFile`:** zdanie ze `STATE.md` było nieaktualne. Instalator 1.9.1 nie stawia tego
  zdarzenia; wpis `beforeReadFile` w `~/.cursor/hooks.json` należy do harnessu użytkownika.

**Zweryfikowane — jak dokładnie:**

- **Wersja plikiem, nie okiem** (L-0004): `JSON.parse` manifestu, `readdir` komend — 12 nazw
  wypisanych.
- **Obie wersje wieku listy w jednym przebiegu** (L-0040), różnica wyłącznie `list-date`;
  kontrola pozytywna ciszy to niepuste zdanie o liście na tym samym wejściu (L-0090).
- **Dowód negatywny sekretu:** po `WRITE_DENIED_FILE_MISSING` `config.md` nie istnieje;
  `rg` po wartościach syntetycznych w projekcie kontrolnym i w tym repozytorium — zero trafień.
  Zapis GUI w tej sesji (po dołożeniu `hooks.json` w trakcie) **przeszedł** — plik powstał
  (34 bajty) i został skasowany od razu; dokumentacja Cursora: hooki ładują się po restarcie.
- **Deinstalacja treścią pliku:** `hooks.json` po operacji zawiera wyłącznie wpis `pomiar-cudzy`.

**Świadomie odłożone:**

- **Kod adaptera nietknięty** — w tym `adapters/cursor/README.md`, które nadal mówi o „dziesięciu
  komendach" przy dwunastu plikach.
- **Dostęp poza katalogiem roboczym i osiem komend poza trzema uruchomionymi** — poza zakresem
  karty, bez zmian wobec E6.
- **Katalog `.claude/relai/work/REKOMENDACJA_MODELU/`** (0,0 MB, plan w archiwum) — kandydat
  raportu, nie artefakt tego wątku; nie kasuję przy okazji.
- **Plan ROZWOJ_PO_WYDANIU** — nietknięty, nadal zamrożony.

**Do zrobienia przez człowieka:**

- **Kasowanie artefaktów tego wątku po „tak":** katalog roboczy
  `.claude/relai/work/_fixy/CURSOR_1_9_1/` (27,6 KB / 18 plików) oraz
  `%TEMP%\relai-cursor-1-9-1` (0,6 MB / 69 plików). Liczby po operacji — w następnym zdaniu
  tej sesji, bo SPEC zabrania edycji wpisu wstecz.
- **Czy zainstalować adapter Cursora w tym repozytorium** — osobna pozycja w „Czeka na człowieka".
- **Commit** — jedyne pytanie procesowe wątku; propozycja w odpowiedzi sesji.

Autor: RelAI (Grok 4.6) + Lukasz

### 2026-09-04 — Kasowanie po wątku CURSOR_1_9_1

**Zrobione:**

- Trzy grupy skasowane po „tak" w tej sesji: `work/REKOMENDACJA_MODELU` (29,2 KB),
  `work/_fixy/CURSOR_1_9_1` (27,6 KB), `%TEMP%\relai-cursor-1-9-1` (0,6 MB), plus pusty
  rodzic `_fixy` pozostały po operacji. Narzędzie: **3 + 1 OK**, zero odmów.

**Zweryfikowane — jak dokładnie:**

- **Przed: 0,6 MB (644 507 B), po: 0,0 MB.** Raport ponowny: `Brak kandydatow do sprzatania`,
  trzy ścieżki `Test-Path` → False. Suma kandydatów 0,0 MB.

**Świadomie odłożone:** nic.

**Do zrobienia przez człowieka:**

- **Commit** zmian wątku (`ODNOGA.md`, `DZIENNIK.md`, `STATE.md`) — propozycja w odpowiedzi.
- **Czy zainstalować adapter Cursora w tym repozytorium** — bez zmian, pozycja w „Czeka na człowieka".

Autor: RelAI (Grok 4.6) + Lukasz

### 2026-09-04 — Porządek po wątku Cursora: trzy sprawy zdjęte z listy, dwie liczby sprostowane

**Zrobione:**

- **Trzy pozycje sekcji „Czeka na człowieka" zdjęte jako rozstrzygnięte tego samego dnia**, bo
  mechanizm wymaga, żeby sprawa znikała z listy w turze, w której zapadła decyzja — a ja tego
  przy zamykaniu każdej z nich nie zrobił:
  1. **Numer wydania `REKOMENDACJA_MODELU`** — rozstrzygnięty na starcie E4: `1.9.0`, decyzja
     człowieka, powód w `STATUS.md` planu (dziś w archiwum planów).
  2. **Czy pomiar sesji etapu domyka weryfikację E2** — rozstrzygnięty **Aneksem C**: dwa
     wywołania `/relai-models` w świeżych sesjach CLI, sumy plików niezmienione.
  3. **Blokada zapisu do cudzego projektu w żywej sesji** — pokazana 2026-09-04 ze skutkiem na
     dysku (plik nie powstał, wartość klucza nieobecna w obu drzewach).
  Sekcja schodzi z **9 pozycji na 6**.
- **Dwie liczby w `STATE.md` sprostowane** po wpisach z sesji Cursora: dziennik **84,4 → 101,0 KB**
  (10 → **16** wpisów), sekcja ryzyk **13,4 → 14,4 KB**. Obie były prawdziwe w chwili pisania
  i nieprawdziwe godzinę później.

**Zweryfikowane — jak dokładnie:**

- **Policzone skryptem na żywym pliku, nie okiem**: 16 nagłówków `###` w sekcji „Wpisy",
  6 pozycji w „Czeka na człowieka", sekcja ryzyk 14,4 KB po normalizacji CRLF → LF. Zgodne
  z linią `[RelAI progi dokumentow]` hooka startu tej sesji.
- **Martwe kotwice po operacji: 0** — sprawdzone na kotwicach wygenerowanych z nagłówków żywych
  wpisów, po zdjęciu trzech pozycji.
- **Wartość syntetycznego klucza z pomiaru GUI nie została w repozytorium**: `grep` wzorcem
  `AKIA[0-9A-Z]{16}` po całym drzewie roboczym — zero trafień; plik nigdy nie wszedł do indeksu,
  więc nie ma go też w historii.
- **Znalezisko z Cursora potwierdzone u źródła**: `adapters/cursor/README.md:30` mówi o
  **dziesięciu** komendach, a `adapters/claude-code/commands/` ma ich **dwanaście** — liczba jest
  nieaktualna od 1.8.0 (`/relai-clean`) i drugi raz od 1.9.0 (`/relai-models`).

**Świadomie odłożone:**

- **Adnotacje `*(rozstrzygnięte …)*` we wpisach źródłowych trzech zdjętych spraw** — te wpisy
  leżą już w `docs/archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md`, a archiwum jest kopią
  **bajt w bajt** z sumą kontrolną w linii-odsyłaczu. Dopisanie adnotacji unieważniłoby sumę,
  więc rozstrzygnięcia stoją tutaj, w żywym dzienniku, zamiast w archiwum. To jest przypadek,
  którego `SPEC_ARCHIWUM` nie rozstrzyga wprost.
- **Poprawka `README.md` adaptera Cursora** — znalezisko zostaje znaleziskiem, tak jak zdecydował
  wątek; to jedna linia, ale w pliku wydanym, więc idzie razem z następną zmianą adaptera.

**Do zrobienia przez człowieka:**

- **Czy `SPEC_ARCHIWUM` ma opisać przypadek „sprawa rozstrzygnięta po zarchiwizowaniu jej wpisu"**
  — dziś reguła każe adnotować wpis źródłowy, a ten bywa już w archiwum chronionym sumą kontrolną.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — D-87: repozytorium RelAI zostaje bez adaptera Cursora

**Zrobione:**

- **Decyzja zamrożona jako D-87** w `docs/DECYZJE.md`: w tym repozytorium **nie instalujemy**
  adaptera Cursora. Powód jest architektoniczny, nie wygodowy — `install.js` kładzie w `.cursor/`
  kopie **dwunastu komend i dwóch skilli**, których oryginały leżą w tym samym drzewie, a `.cursor/`
  nie jest w `.gitignore`; źródło i kopia w jednym repozytorium rozjechałyby się przy pierwszej
  zmianie komendy.
- **Pozycja „Czy zainstalować adapter Cursora" zdjęta** z sekcji „Czeka na człowieka" tego samego
  dnia, w którym zapadła decyzja. Sekcja: **6 → 5** pozycji.
- **`STATE.md`** — pozycja z „Co dalej" zastąpiona zdaniem o rozstrzygnięciu; sekcja „Co blokuje"
  mówi teraz, że brak kontekstu RelAI w sesji Cursora **w tym folderze** jest skutkiem decyzji,
  a nie zaległością.

**Zweryfikowane — jak dokładnie:**

- **Podstawa decyzji policzona, nie oszacowana**: `adapters/claude-code/commands/` — 12 plików,
  `skills/` — 2, `adapters/cursor/rules/` — 3; `grep -n cursor .gitignore` — **brak wpisu**,
  więc kopie byłyby śledzone. `ls -d .cursor` — katalogu tu nie ma i po tej decyzji nie powstanie.
- **Konsekwencja opisana wprost, nie przemilczana**: sesja Cursora otwarta w tym folderze nie
  dostanie kontekstu RelAI ani blokady sekretu, a `/relai-models` skończy na Kroku 1 — dokładnie
  to zmierzył wątek CURSOR_1_9_1 i to zostaje stanem docelowym, nie usterką.

**Świadomie odłożone:**

- **`.cursor/` w `.gitignore`** — nie dopisuję go „na zapas". Wpis ma sens dopiero wtedy, gdy ktoś
  zmieni tę decyzję; D-87 mówi wprost, że to jest wtedy pierwszy krok.

**Do zrobienia przez człowieka:**

- **Nic w tej sprawie.** Wątek Cursora jest domknięty: adapter zmierzony na 1.9.1 na projektach
  kontrolnych, a sposób jego mierzenia w przyszłości zapisany w D-87.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Zamknięcie dnia: dwa wydania, trzy rotacje i adapter Cursora zmierzony

**Zrobione:**

- **Dwa wydania w jeden dzień.** `1.9.0` domknęło plan REKOMENDACJA_MODELU (E4 z Aneksem D):
  karta etapu rozpoznaje model **spoza listy**, cztery specyfikacje mówią o modelu jednym językiem,
  walidator dostał szóste sprawdzenie. `1.9.1` naprawiło defekt znaleziony godzinę później —
  raport artefaktów wywracał się na katalogu wątku samodzielnego `_fixy`.
- **Trzy rotacje**: dziennik (22 wpisy), ryzyka zamknięte (R2, M4), lekcje (15 pozycji).
- **Blokada guardraila pokazana w żywej sesji** ze skutkiem na dysku — pomiar czekał od 1.8.1.
- **Adapter Cursora zmierzony na 1.9.1 we własnym narzędziu** (wątek CURSOR_1_9_1, Grok 4.6),
  a decyzją **D-87** repozytorium RelAI zostaje bez tego adaptera.
- **`STATE.md` skrócony** 317 → 173 linie (11,8 KB), poniżej obu progów.

**Zweryfikowane — jak dokładnie:**

- **Rotacja przy zamknięciu: nie ma czego wziąć.** Dziennik **104,0 KB** przy progu 150,
  lekcje **39,2 KB** przy 50, ustawienia **3,1 KB** przy 6, `STATE.md` **173 linie** przy 300 —
  wszystko poniżej progu, więc cisza. Wyjątkiem jest sekcja ryzyk i to jest komunikat wymagany
  powyżej progu, nie przeoczenie:
  > Rotacja ryzyk stoi: w tabeli jest **9 wierszy i ani jednego `ZAMKNIĘTE`**.
  > Sekcja **14,4 KB** = część rotowalna **0 KB** + dolna granica osiągalna **14,4 KB**;
  > próg **12 KB**. Sekcję odchudzi wyłącznie zamknięcie ryzyk albo podniesienie progu — obie
  > rzeczy są decyzją człowieka, mechanizm zrobił wszystko, co mógł.
- **Sprzątanie artefaktów: zero kandydatów** (`clean-work.js raport`, 71 ms). Sześć pozycji
  chronionych z powodem, w tym `templates` przez opis w `README.md:150`. Katalog
  `.claude/relai/work/` jest pusty — poprzednie sesje sprzątnęły po sobie.
- **Przegląd ryzyk: dziewięć otwartych, żadne nie zmieniło poziomu.** `P1`, `P2` i `M1` dostały
  dziś wyniki z Cursora (opakowanie powłoki `deny` i plik nieutworzony; cały wątek poprowadzony
  przez model spoza Anthropic; hook Cursora mówi o **własnej** liście modeli). `M4` zamknięte przy
  wydaniu i zeszło rotacją do archiwum. `M2` zostaje otwarte z jednego powodu — zakaz nadpisywania
  listy przez `/relai-update` jest **napisany, nie zmierzony**.
- **Zasady aktywne: 15 przy limicie 15** — policzone komendą; limit wykorzystany, nie przekroczony,
  więc lekcja L-0090 poszła do zasady 5 zamiast otwierać szesnastą pozycję.
- **Sprawy czekające na człowieka: 5** — z dziewięciu rano, po zdjęciu czterech rozstrzygniętych
  tego samego dnia.

**Świadomie odłożone:**

- **`adapters/cursor/README.md` mówi o „dziesięciu komendach"** przy dwunastu — znalezisko wątku
  Cursora, poprawka pójdzie z następną zmianą adaptera.
- **`.cursor/` w `.gitignore`** — dopiero gdyby D-87 zostało zmienione.

**Do zrobienia przez człowieka:**

- Bez zmian wobec listy „Czeka na człowieka": pięć pozycji, żadna nieprzeterminowana przy progu
  30 dni. Najstarsza czeka od 2026-08-20.

Autor: RelAI (Opus 5) + Lukasz

### 2026-09-04 — Cztery defekty pre-commita ze zgłoszenia zewnętrznego, wydanie 1.9.2

**Zrobione:**

- **Pierwsze zgłoszenie z cudzego projektu** (widget Preact/TS, Node 24.13.1, Windows 11) i pierwsza
  poprawka wydana tego samego dnia. Wątek samodzielny
  [PRECOMMIT_ESM](fixy/PRECOMMIT_ESM/ODNOGA.md), bez planu nadrzędnego.
- **Defekt blokujący: hook zatrzymywał każdy commit w projekcie z `"type": "module"`.** Instalator
  kładł logikę jako bezrozszerzeniowy `pre-commit` i plik `.js`, a o systemie modułów rozstrzyga
  najbliższy `package.json` w górę drzewa — dla `.git/hooks/` jest nim `package.json` projektu.
  Od 1.9.2 do `.git/hooks/` idzie shim `#!/bin/sh` plus `relai-pre-commit.cjs`
  i `relai-secret-scan.cjs`.
- **Instalacja przestała być czynnością bez dowodu.** Kończy się testem dymnym: hook uruchomiony
  przy pustym indeksie (`GIT_INDEX_FILE` podstawiony, prawdziwy indeks nietknięty) musi zwrócić 0.
  Wynik inny cofa instalację do stanu sprzed niej i kończy się kodem 2 zamiast komunikatu o sukcesie.
- **Skan widzi nazwy z przedrostkiem.** `AWS_SECRET_ACCESS_KEY=`, `GITHUB_TOKEN=`, `DB_PASSWORD=` —
  do 1.9.1 przechodziły, bo `\b` przed rdzeniem nazwy nie zachodzi po podkreślniku. Doszła druga
  reguła, **wrażliwa na wielkość liter**; stara została nietknięta.
- **Wartość oczywiście przykładowa przestała blokować dokumentację.** Filtr `EXAMPLE_RE` na
  dopasowanym tokenie z listy `PATTERNS`.
- **Czwarty defekt, znaleziony przy okazji:** `scanText` sprawdzał tylko pierwsze dopasowanie
  każdego wzorca, więc placeholder w pierwszej linii pliku wyciszał realny sekret niżej. Teraz
  przegląda wszystkie dopasowania.
- **Dokumentacja:** nowa pułapka `P-007` (rozstrzyganie systemu modułów w `.git/hooks/`), akapity
  w `README.md` i `core/README.md`, wymóg ponownej instalacji dopisany do procedury `/relai-update`.

**Zweryfikowane — jak dokładnie:**

- **Defekt odtworzony przed poprawką, nie tylko wyczytany z kodu:** świeże repo w `%TEMP%`
  z `"type": "module"`, instalacja, `git commit` → `ReferenceError: require is not defined in ES
  module scope` w linii 17, kod 1. Ślad co do linii zgodny ze zgłoszeniem.
- **Regresja instalatora: 27 przypadków, 0 rozjazdów**, sześć scenariuszy w osobnych repozytoriach —
  projekt ESM (commit czysty przechodzi, commit z sekretem zatrzymany, sekret nie wszedł do
  historii, komunikat nie cytuje wartości), projekt CommonJS (dokument z kluczem przykładowym
  przechodzi, ten sam wzorzec bez markera zatrzymany), deinstalacja, cudzy hook z **dowodem
  negatywnym** (treść nietknięta), cofnięcie po nieudanym teście dymnym (poprzedni hook wrócił
  bajt w bajt, żaden plik z nieudanej instalacji nie został), aktualizacja układu sprzed 1.9.2.
- **Tabela przypadków ze zgłoszenia: 14/14 zgodnych.**
- **Fałszywe trafienia zmierzone na cudzym materiale, obie wersje w jednym przebiegu** — stara
  wzięta `git show HEAD:`, nie przepisana z pamięci. 3705 plików z pięciu repozytoriów:
  **86 → 113** plików z trafieniem, 27 różnic. Wariant pośredni (przedrostek z flagą `i`) dawał
  **54** różnice, prawie wyłącznie na polach kodu pisanych małymi literami — i to jest powód,
  dla którego reguła przedrostkowa jest wrażliwa na wielkość liter. Własne repozytorium:
  188 plików, **0 → 1** trafienie.
- **Poszerzenie `PLACEHOLDER_RE` o akcesory środowiska zmierzone i odrzucone** — `Deno.env.get`,
  `import.meta.env`, `os.environ` uciszają **2** trafienia ze 113, więc nie wchodzą.
  Instrument miał kontrolę pozytywną: wariant kandydacki musiał milczeć na akcesorze i trafiać
  w realną wartość, inaczej pomiar był przerywany.
- **Walidator spójności:** kod 0, „3 zrodel, wartosc 1.9.2".
- **Hook tego repozytorium przeinstalowany** na układ 1.9.2 — stara kopia `relai-secret-scan.js`
  zniknęła, test dymny zdany przez shim i przez samą logikę.

**Świadomie odłożone:**

- **86 fałszywych trafień obecnych już w 1.9.1** na cudzym materiale — zmierzone, nieruszane.
  To nie jest skutek tej poprawki i nie było przedmiotem zgłoszenia.
- **Linia `SECRET_TOKEN=` w archiwum dziennika tego repozytorium** (wartość pozorowana w dowodzie
  negatywnym do D-42) świeci od 1.9.2. Archiwum jest kopią bajt w bajt i się go nie edytuje (D-18);
  skutek jest realny tylko wtedy, gdy ktoś ten plik zaindeksuje.
- **Weryfikacja zapisu dokumentu z kanoniczną wartością przykładową przez hook żywej sesji** —
  wymaga restartu aplikacji (P-005), bo sesja używa kopii z cache'u.

**Do zrobienia przez człowieka:**

- **Ponowna instalacja pre-commita w projektach, które mają go sprzed 1.9.2** (PolyFlow,
  JiraManager, każdy projekt zewnętrzny). Stary układ przewraca się w projekcie ESM; rozpoznanie
  po obecności `.git/hooks/relai-secret-scan.js`. Instalacja jest jawną czynnością człowieka,
  więc RelAI tego nie zrobi sam.

Autor: RelAI (Opus 5) + Lukasz
