# Audyt RelAI — 2026-11-09

Krytyczny przegląd pluginu, procesu i modów w stanie `main @ 5aeab39` (RelAI 3.7.0). Raport jest
jedynym plikiem dodanym przez audyt; niczego nie naprawiono. Plan optymalizacji powstaje osobno,
ze znalezisk zaakceptowanych przez właściciela.

## 1. Zakres i metoda

- **Zakres:** `core/`, `adapters/` (claude-code, cursor, codex), `hooks/`, `docs/` (dokumenty
  procesu) oraz mody `panel/`, `progress/`, `cache-keeper/`, `mods/`. Katalog `site/` poza zakresem.
- **Dowody:** statyczne i testami — liczby z uruchomionych komend, wyniki testów, odczyt kodu
  z `plik:linia`, fikstury w katalogu tymczasowym. Świeżych sesji `claude -p` nie uruchamiano,
  sieci nie używano.
- **Wykonanie:** sesja nadrzędna (pomiary, testy, weryfikacja) oraz czterech subagentów tylko do
  odczytu (bezpieczeństwo, hooki, mody, proces). Ustalenie subagenta weszło do raportu dopiero po
  sprawdzeniu przez sesję nadrzędną.
- **Oznaczenie dowodu:** **(O)** — odtworzone uruchomieniem przez sesję nadrzędną; **(C)** — cytat
  sprawdzony w pliku; **(S)** — liczba ze skryptu subagenta, nieodtworzona osobno.
- **Status:** POTWIERDZONE albo HIPOTEZA (z pomiarem na żywo, który by ją rozstrzygnął).
- **Skrypty dowodowe:** katalog sesyjny
  `C:\Users\Lukasz\AppData\Local\Temp\claude\f5685311e9e58537\bb90a618-e6fa-4c62-8359-bd7fdde537be\scratchpad\`
  (podkatalogi `timing`, `verify`, `sec`, `hooks`, `mods`, `proc`). To katalog tymczasowy — może
  zniknąć; każde znalezisko podaje też komendę albo linię, z której da się je odtworzyć bez niego.
- **Poprzedni przegląd:** `docs/przeglad-2026-11/RAPORT.md` (F01–F16). Ten raport ich nie powtarza;
  doprecyzowuje liczbami F11, F12, F13 i F14.

Stan repozytorium przed pracą (`git status --short`): cztery pliki `M` w `relai-planning`
(`git diff` pusty — różnica samych końców linii) i nieśledzony `.claude/launch.json`.

## 2. Podsumowanie

| Status | Wysoka | Średnia | Niska | Razem |
|---|---|---|---|---|
| POTWIERDZONE | 7 | 32 | 13 | 52 |
| HIPOTEZA | 0 | 3 | 1 | 4 |

Trzy znaleziska potwierdzone mają część niezmierzoną na żywo (B3, D9, F1) — opisane przy nich.

**Największy zysk, w kolejności:**

1. **G1** — zainstalowany plugin waży 114 MB na wersję; warstwa wykonawcza to 3,8 MB.
2. **B1** — tryb ciągły odrzucono w 110 ze 113 sesji, a bramka pyta w każdej nowej.
3. **A1** — start etapu ładuje ok. 138 KB, w tym zasady i ryzyka dwukrotnie.
4. **C1** — hook startu czyta ok. 37 MB i zajmuje ok. 1,9 s na samym skanie artefaktów.
5. **D1 i D2** — skaner sekretów przepuszcza najczęstsze nośniki, a instalator pre-commita melduje
   ochronę, której git nie wywoła.
6. **C4** — awaria hooka wygląda tak samo jak „sprawdzone i zgodne”.

**Co działa dobrze (sprawdzone, bez znaleziska):** testy rdzenia i adapterów 629 z 629;
`validate-adapters.js` kod 0; hook po edycji albo poleceniu trwa 33–49 ms; kopie projektowe narzędzi są zgodne
ze źródłem; kasowanie artefaktów trzyma asercje korzeni. Szczegóły w sekcji 10.

---

## 3. Start sesji i kontekst (A)

### A1 · wysoka · POTWIERDZONE — start etapu ładuje ok. 138 KB, a zasady i ryzyka wchodzą dwa razy

- **Wniosek:** świeża sesja etapu czyta te same treści z dwóch źródeł, a prompt etapu niesie
  dosłowny odpis „Zasad aktywnych”. Wpływ: kontekst i koszt każdego etapu.
- **Dowód:** (C) `relai-stage.md:190-192` wymusza skill `relai-planning`; (C)
  `SPEC_PROMPT_ETAPU.md:260-261` każe czytać sekcję ryzyk i sekcję „Zasady aktywne”, choć skrót
  startu już je niesie (6 711 B i 3 671 B). (O) `docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md` ma
  44 569 B, z czego sekcja „Zasady aktywne — dosłowny odpis” od linii 58 to 27 503 B (62%);
  linia 14 tego promptu każe przeczytać tę sekcję jeszcze raz z `LEKCJE.md`. (O) 120 archiwalnych
  `PROMPT_ETAP_*.md`: mediana 32 275 B, maksimum 58 044 B. (S) instrukcje etapu razem 58 333 B.
- **Kontrola:** `STATE.md:44` odkłada tylko „zdanie Aneksu D”, bez liczb i bez podwójnego odczytu.
- **Diagnoza:** wzór promptu etapu powstał przed indeksem zasad (D-15, Aneks A) i nie został do
  niego dostosowany.
- **Kierunek:** we wzorze listy lektur „indeks ze skrótu + pełne brzmienie zasad N, M”; ryzyka ze
  skrótu; zakaz dosłownego odpisu zasad w prompcie. Zgodne z D-15. Spodziewany zysk: ok. 27 KB na
  prompt etapu i ok. 53 KB podwójnych lektur na start etapu.

### A2 · średnia · POTWIERDZONE — skrót startu niesie ok. 7,6 KB bez wartości decyzyjnej, a sprawy przeterminowane trafiają do kontekstu trzy razy

- **Wniosek:** z 26 633 B skrótu ok. 29% to odsyłacze do archiwum i pełna sekcja spraw, którą
  hook zgłasza osobno.
- **Dowód:** (O) `node .claude/relai/tools/start-digest.js` — 26 633 B, 289 linii; sekcja ryzyk
  6 711 B, z czego 11 bloków „Ryzyka zamknięte … suma kontrolna” to 2 184 B; sekcja „Czeka na
  człowieka” 5 448 B (10 pozycji, przeterminowane 4). (C) `start-digest.js:172-179` wycina całą
  sekcję przy pierwszej przeterminowanej sprawie; (C) `session-context.js:166-171` zgłasza te same
  sprawy sam; trzeci nośnik to `CLAUDE.md:28-31`. Najdłuższy wiersz ustawień w skrócie: „Kierunek
  filmu”, 699 B.
- **Kontrola:** kontrola pozytywna wzorca odsyłaczy — pierwszy blok zawiera „suma kontrolna”.
- **Diagnoza:** odsyłacze dopisuje każda rotacja (`SPEC_ARCHIWUM.md:193`), więc ta część rośnie
  liniowo; skrót i hook powstały niezależnie.
- **Kierunek:** skrót pomija linie odsyłaczy (jeden drogowskaz) i wypisuje tylko pozycje
  przeterminowane; jeden nośnik zgłoszenia. Zysk: ok. 2,2 KB od razu, do 5,4 KB przy sprawach
  przeterminowanych.

### A3 · średnia · POTWIERDZONE — dwa progi startu są nieosiągalne z konstrukcji, więc komunikat wraca w każdej sesji

- **Wniosek:** próg `LEKCJE.md` i próg sekcji ryzyk nie mogą zostać spełnione rotacją; start
  zgłasza je bez końca.
- **Dowód:** (O) `node core/tools/rotate.js plan ryzyka --prog 12` → „calkowita 17.5 KB =
  rotowalna 0.0 KB … ponad progiem, ale nic nie przechodzi”; 20 wierszy, zamkniętych 0. (O)
  `LEKCJE.md`: sekcja „Zasady aktywne” (indeks i pełne brzmienie) 35 174 B; dolna granica pliku
  54 205 B przy progu 51 200 B (skrypt `proc/lekfloor.js`, część nietykalna + 20 najnowszych
  lekcji).
- **Kontrola:** tabela ryzyk żyje — PW1–PW3 zamknięto i zrotowano 2026-10-26; blokada wynika
  z tego, że pozostałe mają statusy „OTWARTE ŚWIADOMIE” i „ZMITYGOWANE”, których rotacja nie rusza.
- **Diagnoza:** próg liczony od całego pliku, a część nietykalna sama go przekracza (dotyka D-88
  i D-15 Aneks A).
- **Kierunek:** próg lekcji liczyć bez sekcji zasad albo przenieść pełne brzmienie zasad do
  osobnego pliku; statusy „ZMITYGOWANE” i „OTWARTE ŚWIADOMIE” uczynić rotowalnymi po decyzji.
  Zmiana reguły rotacji wymaga aneksu do D-88.

### A4 · średnia · POTWIERDZONE — model sesji nie stoi na liście modeli, więc nakładka rodziny jest pomijana

- **Wniosek:** najnowszy model pracuje bez reguł swojej rodziny, a wiersz-podpowiedź wskazuje
  model, którego na liście już nie ma.
- **Dowód:** (O) `grep -n "fable-5-2" .claude/relai/MODELE-*.md adapters/*/MODELE.md` → brak
  trafień; lista z 2026-10-08 (32 dni przy progu 7). (C) `core/prompt/PRZYGOTOWANIE.md:36` — model
  spoza list dostaje „sam rdzeń”. (C) `docs/USTAWIENIA.md:30` — „Sonnet 5 · lista … 2026-09-04”,
  a lista ma „Sonnet 5.5”. W tej sesji optymalizator pracował bez nakładki.
- **Kontrola:** reguła „rodziny nie odgadujesz z nazwy” jest zamierzona; problemem jest brak
  ścieżki, która odświeża listę bez ręcznej komendy z ruchem sieciowym.
- **Diagnoza:** lista starzeje się szybciej niż wydania (ryzyko M5, otwarte), a mechanizm milczy
  dokładnie wtedy, gdy model jest nowy.
- **Kierunek:** pole rodziny dopasowywane po prefiksie `id` zapisanym na liście (np. wzorzec
  rodziny obok pozycji), albo jawne zdanie na starcie „model sesji spoza listy” zamiast ogólnego
  „lista ma 32 dni”.

### A5 · niska · POTWIERDZONE — linie startu powtarzane co sesję, na które nie da się zareagować

- **Dowód:** (S) nakładki rodzin 392 B (nadpisywane z pluginu przy każdym starcie,
  `session-signals.js:248-261`), wiek listy modeli w dwóch zdaniach 420 B, zdanie o trybie ciągłym
  245 B. (O) zdanie „każdy prompt wraca z propozycją” jest nieprawdziwe w 110 ze 113 sesji (B1).
- **Kierunek:** przypomnienie raz na N dni; linia o nakładkach tylko w repozytorium pluginu; zdanie
  o trybie ciągłym zależne od stanu zgody.

### A6 · średnia · HIPOTEZA — wznowienie i `/clear` powtarzają pełny blok startu i nakaz rytuału

- **Dowód:** (C) `hooks.json:48-54` — SessionStart bez matchera; `session-context.js:201` rozróżnia
  tylko `compact`.
- **Pomiar rozstrzygający:** `claude --resume` i sprawdzenie w transkrypcie, czy skrót startu
  uruchamia się drugi raz (koszt: 4,5 KB bloku i 26,6 KB skrótu).

---

## 4. Tryb ciągły optymalizatora (B)

### B1 · wysoka · POTWIERDZONE — tryb ciągły odrzucono w 110 ze 113 sesji, a bramka pyta w każdej nowej

- **Wniosek:** ustawienie „włączony” kosztuje pytanie na sesję, a prawie nigdy nie jest używane.
- **Dowód:** (O) pole `decyzja` w plikach `.claude/relai/zgoda-promptu/*.json` (od 2026-09-24):
  „nie” 110, „tak” 3 (`verify/hooks-verify.js`). (C) `docs/USTAWIENIA.md:32` — „Tryb ciągły |
  włączony”. (C) `prompt-mode.js:350-362` — bramka ma trwałą opcję tylko dla „tak”.
- **Kontrola:** liczba obejmuje bieżącą sesję; pliki są osobne na sesję, więc jedna sesja to jeden
  głos.
- **Diagnoza:** bramka (D-93) zakłada, że odmowa jest wyjątkiem; pomiar pokazuje odwrotnie.
- **Kierunek:** najprościej — wyłączyć tryb w tym projekcie (`/relai-prompt off`), komenda zostaje
  na żądanie. Trwała odmowa („nie i nie pytaj więcej”) zmienia kształt bramki, więc dotyka D-93.
  Zysk: jedno pytanie i ok. 1,8 KB reguły mniej w każdej sesji.

### B2 · średnia · POTWIERDZONE — filtr nie rozpoznaje akceptacji propozycji i myli zadania z pytaniami

- **Wniosek:** odpowiedź przyjmująca propozycję wraca do bramki albo reguły; część zadań przechodzi
  jako „pytanie”.
- **Dowód:** (O) `verify/hooks-verify.js` i `timing/filter-test.js` na `powodPominiecia`:
  „Wykonaj propozycję”, „akceptuję”, „tak, wykonaj”, „ok, dalej”, „opcja B”, „gotowi do wydania?”,
  „Let's continue” — niepominięte; „Do the migration…”, „Czy możesz przepisać…”, „Jak skończysz,
  odpal testy” — pominięte jako pytanie; ścieżka zaczynająca się od `/c/` — pominięta jako komenda.
  W tej sesji „Wykonaj propozycję” wywołało bramkę zgody. (C) `prompt-mode.js:84-88` (zamknięta
  lista, dopasowanie całego promptu), `:92-96`, `:274`.
- **Kontrola:** kontrola pozytywna — „tak”, „ok”, „kontynuuj”, komenda i fraza sesji są pomijane.
- **Diagnoza:** potwierdzenie to dziś dokładne brzmienie z listy; pytanie to pierwsze słowo.
- **Kierunek:** potwierdzeniem jest prompt złożony wyłącznie ze słów z listy; po pokazaniu
  propozycji następny prompt sesji przechodzi bez reguły; „do/can/czy/jak/kiedy” tylko ze znakiem
  zapytania; wspólna lista fraz dla `CLAUDE.md`, `prompt-mode` i `session-title`.

### B3 · średnia · POTWIERDZONE — jedna optymalizacja to 43–58 KB instrukcji i dodatkowa tura

- **Dowód:** (O) `wc -c`: komenda 16 174 B, `PRZYGOTOWANIE` 5 956, `PROCEDURA` 11 042, `SZABLONY`
  9 652 (praca na modelu sesji: 42 824 B); ścieżka agenta dokłada `REGULY` 17 352 i definicję agenta
  7 842. Ryzyko O4 otwarte od 2026-09-14.
- **Niezmierzone:** jak często tryb faktycznie przerabia prompt (HIPOTEZA; przy B1 — rzadko).
- **Kierunek:** decyzja właściciela po B1. Jeśli tryb zostaje — skrót reguł dla agenta wzorem
  `core/humanize/SKROT.md`.

### B4 · średnia · POTWIERDZONE — nakaz rytuału startu koliduje z komendą wąską

- **Wniosek:** gdy pierwszą wiadomością sesji jest komenda, hook żąda rytuału i przeglądu spraw
  z zapisami, a komenda zakazuje zapisów.
- **Dowód:** (C) `session-context.js:206` („Zanim odpowiesz merytorycznie, wykonaj rytuał”),
  `session-signals.js:1715` („zadaj pytanie … PARTIAMI PO CZTERY”), `relai-prompt.md:207` („Nie
  zmieniasz żadnego pliku poza wyjątkami”). W tej sesji przegląd spraw nie został wykonany z tego
  powodu. Komenda wywołana wprost nie zapisuje też zgody sesji, więc bramka zapytała przy
  akceptacji propozycji.
- **Kierunek:** hook pomija nakaz rytuału, gdy pierwszy prompt jest komendą (ten sam test co
  w filtrze trybu ciągłego), albo komenda jawnie odracza przegląd spraw do pierwszego promptu
  merytorycznego.

---

## 5. Hooki: koszt i ciche awarie (C)

Koszt pojedynczego hooka nie jest problemem: (O) mediany hooków PostToolUse 33–49 ms przy 35 ms
pustego procesu Node; `secret-scanner` 114 ms (uruchamia gita), hooki promptu 49–87 ms, hooki Stop
87–168 ms (`timing/hook-timing.js`, 5 przebiegów na fiksturze bez gita). Problemy leżą niżej.

### C1 · wysoka · POTWIERDZONE — skan artefaktów roboczych czyta ok. 37 MB przy każdym starcie sesji

- **Wniosek:** hook startu czyta każdy plik testowy 23 razy; sam skan zajmuje ok. 1,9 s.
- **Dowód:** (O) `hooks/count-reads2.js` (zapisy podmienione na wyjątek, git zastąpiony atrapą):
  `artefaktyRobocze bytesRead 37101099 … "czas":1858`, „test files 188 test reads 4324”, razem
  38 808 877 B i 1 025 listowań katalogów. (C) `session-signals.js:1791-1794` woła skan bez
  kontekstu; `work-artifacts.js:649` uruchamia bramkę per pozycja, `:522-525` czyta wtedy każdy
  plik testowy. (O) w `%TEMP%` 21 610 wpisów, w tym 18 znaczników `relai-ustawienia-podane-*`
  zapisywanych przez `session-context.js:276-280` i nigdy niekasowanych — każdy jest kolejną
  pozycją skanu.
- **Kontrola:** ścieżka kodu jest ta sama z prawdziwym gitem (pozycje z `.claude/relai/work`
  i `%TEMP%` nie są śledzone). Pomiar czasu hooka na fiksturze bez testów dał 297 ms — różnicę
  tłumaczy właśnie brak plików testowych w fiksturze.
- **Diagnoza:** bramka ochronna zaprojektowana dla kasowania została użyta do samego pomiaru sumy.
- **Kierunek:** pliki testowe czytać raz; pozycji spoza projektu nie przepuszczać przez bramkę
  dokumentów; suma z pamięci podręcznej raz na dzień; znacznik ustawień poza prefiksem `relai-`
  i ze sprzątaniem. Zysk: ok. 37 MB odczytu i ok. 1,8 s na start.

### C2 · średnia · POTWIERDZONE — każdy start i każde wywołanie skilla kopiuje 52 pliki (934 KB) bez sprawdzenia zmian

- **Dowód:** (C) `session-signals.js:288-289` — `copyTree + provisionTools + provisionPrompt +
  provisionHumanize` bez porównania wersji; (O) `hooks/prov.js` → 52 pliki, 933 889 B; hook
  `PostToolUse` na `Skill` woła to samo (`hooks.json:33-36`).
- **Kontrola:** zdanie „skopiowane lokalnie (52 plików)” pada zawsze, więc nie niesie informacji.
- **Kierunek:** znacznik z wersją albo sumą; kopia tylko przy różnicy; pominięcie przy `compact`.

### C3 · średnia · POTWIERDZONE — te same dokumenty czytane wielokrotnie, a skrót startu powstaje dwa razy na sesję

- **Dowód:** (O) `count-reads2.js`: `DZIENNIK.md` ×7, `USTAWIENIA.md` ×16, `CLAUDE.md` ×10 w jednym
  SessionStart; faza `startCost` 1 053 403 B. (C) `session-signals.js:1356` buduje cały skrót po to,
  żeby policzyć bajty; potem model uruchamia `start-digest.js` (117–186 ms, pięć przebiegów).
- **Kierunek:** mapa odczytów w procesie; jeden wynik skrótu współdzielony.

### C4 · wysoka · POTWIERDZONE — awaria hooka wygląda jak „sprawdzone i zgodne”, a guard przy błędzie przepuszcza

- **Wniosek:** wyjątek w hooku kończy się kodem 0 bez śladu; model ma napisane, że cisza znaczy
  zgodność.
- **Dowód:** (O) `secret-scanner.js` z wejściem `{not json` → `exit=0 stdout="" stderr=""`.
  (O) 121 linii `catch` w hookach Claude Code i dwóch modułach rdzenia, zero zapisów na stderr.
  (C) `session-context.js:329` — jeden `catch` kasuje cały blok startu razem z nakazem rytuału;
  `secret-scanner.js:101`; `relai-core/SKILL.md:112-113` („cisza hooka znaczy »sprawdzone
  i zgodne«”).
- **Kontrola:** adapter Codeksa przy błędzie blokuje (`secret-scanner.js:19`, kod 2), więc
  zachowanie adapterów jest niespójne, nie zamierzone.
- **Diagnoza:** konwencja „hook nigdy nie psuje sesji” objęła także hooki ochronne.
- **Kierunek:** w `catch` jedna linia `[RelAI <hook>] blad: <nazwa>`; osobny `try` na każdy raport
  startu; guard przy błędzie wewnętrznym zwraca `ask`.

### C5 · niska · POTWIERDZONE — jedna edycja to 9 procesów Node i 8 rozpoznań projektu

- **Dowód:** (O) suma median 156 ms (PreToolUse) i 268 ms (PostToolUse) liczona sekwencyjnie.
  (O) `function isRelaiProject` skopiowana w siedmiu hookach, w sześciu identyczna co do bajta
  (`git hash-object` → `4fa5cfed7f`). (C) `lockfile-scan.js:26-42` ładuje rdzeń przed tanim filtrem
  komendy.
- **Niezmierzone:** czy harness uruchamia hooki równolegle — wtedy czas ścienny to ok. 0,1 s.
- **Kierunek:** tani predykat przed rozpoznaniem projektu; jeden dispatcher PostToolUse. Zysk
  czasowy mały; zysk utrzymaniowy — jedna kopia rozpoznania.

### C6 · średnia · POTWIERDZONE — hooki działają na plikach spoza projektu

- **Wniosek:** ostrzeżenia i blokady trafiają w pliki tymczasowe poza repozytorium, z mylącym
  komunikatem.
- **Dowód:** (O) w tej sesji `console-log-warn` ostrzegł dwukrotnie przy zapisie skryptu
  w katalogu `%TEMP%`, a `secret-scanner` zablokował taki zapis z tekstem „w pliku śledzonym”.
  (C) `console-log-warn.js:49-58` sprawdza projekt po `cwd`, nie po położeniu pliku.
- **Diagnoza:** warunek „czy to projekt RelAI” dotyczy katalogu sesji, a nie celu zapisu.
- **Kierunek:** hooki ostrzegawcze pomijają plik spoza katalogu projektu; komunikat skanera nie
  nazywa pliku śledzonym, gdy git tego nie potwierdził.

### C7 · średnia · POTWIERDZONE — `profile-rules` maskuje brak wpisu w rejestrze dla 70 z 232 artefaktów

- **Dowód:** (C) `profile-rules.js:185-187` — dopasowanie po pełnej ścieżce **albo** po samej nazwie
  pliku; nazwa `SKILL.md` występuje w rejestrze, więc każdy `SKILL.md` uchodzi za wpisany.
  (S) `hooks/artef.js`: 232 artefakty, 92 po ścieżce, 70 „wpisanych” tylko po nazwie. Rejestr
  (145 240 B) jest czytany przy każdej edycji artefaktu.
- **Kierunek:** dopasowanie po pełnej ścieżce w kolumnie „Plik”; pamięć podręczna po czasie
  modyfikacji.

### C8 · niska · POTWIERDZONE — parsery ustawień nie zatrzymują się na „Ustawieniach wycofanych”

- **Dowód:** (C) tylko `humanize-mode.js:155` przerywa na nagłówku wycofanych; `komorkaDecyzji`
  (`session-signals.js:1063-1072`) i parsery w `prompt-mode.js` szukają w całym pliku. Wartość
  nierozpoznana w wierszu „Tryb ciągły” daje ciszę (`prompt-mode.js:133`).
- **Kontrola:** dziś każdy wiersz wycofany ma aktywny odpowiednik wyżej, więc błąd jest ukryty.
- **Kierunek:** jeden parser, kolumna wybierana po nagłówku, linia „nierozpoznana” jak w budżecie.

### C9 · średnia · HIPOTEZA — dwa hooki mówią do modelu kanałem, który może widzieć tylko człowiek

- **Dowód:** (C) `journal-signature.js:127,143` i `doc-sync-reminder.js:74` używają `systemMessage`
  z poleceniem dla modelu; pozostałe hooki używają `additionalContext`. Potwierdzone w kodzie:
  `journal-signature.js:91-97` bierze ostatni nagłówek pliku, choć rdzeń obsługuje dzienniki
  odwrotne.
- **Pomiar rozstrzygający:** wpis dziennika bez linii autora i pytanie do modelu, co zgłosił hook.

### C10 · średnia · HIPOTEZA — `CLAUDE.md` z końcami CRLF pozwala edytować sekcję niemutowalną bez pytania

- **Dowód:** (C) `config-protection.js:137` porównuje surowy tekst z `old_string`; wieloliniowy
  fragment z LF nie trafi w plik z CRLF.
- **Pomiar rozstrzygający:** fikstura z `CLAUDE.md` w CRLF i dwuliniowym `old_string` w sekcji
  niemutowalnej.

### C11 · niska · POTWIERDZONE — martwy kod i niepełny manifest rdzenia

- **Dowód:** (O) `grep -rn "plik-bez-sekcji"` → jedyne użycie w `session-signals.js:1411` (wartość
  nigdzie nieprzypisywana). (O) 12 z 30 skryptów `core/process` i `core/tools` nie ma w
  `core/MANIFEST.json`, w tym `start-digest.js` i `threshold.js`. (S) pięć eksportów rdzenia bez
  użytkownika w kodzie i testach.
- **Kierunek:** usunąć martwe gałęzie; kontrola w `validate-adapters.js`, że każdy skrypt rdzenia
  stoi w manifeście albo na liście wyjątków.

### C12 · niska · POTWIERDZONE — pliki stanu sesji rosną bez sprzątania

- **Dowód:** (O) `.claude/relai/`: `zgoda-promptu` 113 plików, `tytul` 53, `fokus` 26, `pomiary`
  155 plików (6,2 MB), `work` 3 837 plików (33 MB); dziewięć plików `pt*.txt` z 2026-10-27 bez
  odwołań w kodzie; katalog `adapters/claude-code/hooks/.claude/relai/` (prowizja z niewłaściwego
  katalogu, ignorowana przez gita).
- **Kierunek:** sprzątanie plików sesji starszych niż N dni przy starcie albo w `/relai-clean`.

---

## 6. Bezpieczeństwo (D)

Wartości testowe były syntetyczne; fikstury i repozytoria gita powstały w katalogu tymczasowym.

### D1 · wysoka · POTWIERDZONE — skaner sekretów przepuszcza najczęstsze nośniki sekretów

- **Dowód:** (O) `verify/sec-verify.js` na `scanText` — bez werdyktu: nazwa w cudzysłowie przed
  dwukropkiem (JSON, nazwa mała i wielka), `db_` z małą nazwą hasła (YAML), mały
  `aws_secret_access_key`, nazwa kończąca się na `_KEY` (Django), blok klucza prywatnego PGP,
  prefiksy `sk_live_` i `github_pat_`, hasło w części userinfo adresu URL. (C)
  `secret-scan.js:15-21` (pięć formatów), `:30` (między nazwą a separatorem nie może stać
  cudzysłów), `:43` (wariant z przedrostkiem tylko wielkimi literami).
- **Kontrola:** w tym samym przebiegu klucz z prefiksem `sk-` i przypisanie wielkimi literami dają
  blokadę.
- **Kierunek:** opcjonalny cudzysłów przed separatorem; małe litery z przedrostkiem w kontekście
  klucza w cudzysłowie i plików konfiguracyjnych; `BLOCK` w wzorcu PEM; prefiksy popularnych tokenów
  i hasło w URL.

### D2 · wysoka · POTWIERDZONE — instalator pre-commita melduje ochronę, której git nie wywoła

- **Dowód:** (O) repozytorium z `core.hooksPath=.husky`: instalator kończy kodem 0 z „pre-commit
  zainstalowany … Test dymny zdany”, commit pliku z sekretem → `exit=0`,
  `git rev-parse --git-path hooks` → `.husky`. Kontrola bez `hooksPath`: commit → `exit=1`.
  (C) `install-precommit.js:53` (`--git-dir`), `:137`, `:105` (test dymny woła `node` wprost).
  (S) to samo w worktree.
- **Kierunek:** katalog z `git rev-parse --git-path hooks`; przy ustawionym `core.hooksPath` odmowa
  albo instrukcja integracji; test dymny przez prawdziwy commit próbny.

### D3 · średnia · POTWIERDZONE — pre-commit pomija pliki przemianowane i pliki UTF-16

- **Dowód:** (O) `git mv` z dopisanym kluczem (stan `R093`) → commit `exit=0`; plik UTF-16LE
  z sekretem → `exit=0`; kontrola UTF-8 → `exit=1`. (C) `pre-commit.js:61` (`--diff-filter=ACM`),
  `:74` (bajt zerowy = plik binarny).
- **Kierunek:** `ACMR` albo `--no-renames`; dekodowanie UTF-16 po znaczniku BOM.

### D4 · średnia · POTWIERDZONE — skaner blokuje zwykły kod, w tym wzorzec, który sam zaleca

- **Dowód:** (O) blokada dla: odczytu pola żądania do zmiennej o nazwie hasła, odczytu zmiennej
  środowiskowej przez `os.getenv` i `System.getenv`, zdania prozą po polsku z nazwą z listy
  i dwukropkiem. W tej sesji hook zablokował zapis skryptu testowego z takim opisem. (C)
  `secret-scan.js:49` — biała lista odczytów środowiska zna tylko `process.env`, `import.meta.env`,
  `os.environ`, `Deno.env`.
- **Kierunek:** wartość bez literału (identyfikator, wywołanie) nie jest sekretem; rozszerzyć białą
  listę odczytów. Zgodne z zasadą 12 („guardrail zatrzymujący nie-sekret to defekt rdzenia”).

### D5 · średnia · POTWIERDZONE — deinstalator adaptera Cursora kasuje pliki spoza projektu

- **Dowód:** (O) manifest `.cursor/relai-install.json` z pozycją `../ofiara.txt` →
  `install.js <projekt> --uninstall` kończy kodem 0, plik poza projektem skasowany. (C)
  `adapters/cursor/install.js:338-340`.
- **Niezmierzone:** jak często manifest trafia do repozytorium (wektor przez cudzy commit).
- **Kierunek:** po `path.resolve` wymagać prefiksu katalogu projektu i `.cursor/`; odrzucać `..`.

### D6 · średnia · POTWIERDZONE — `crew.js` na Windows źle cytuje argumenty dla `cmd.exe`

- **Dowód:** (O) `sec/crew-quote2.js` z funkcją wyciętą z pliku: argument z cudzysłowem i znakiem
  `&` wykonuje dopisane polecenie (wypisane `INJECTED_BY_ARG`), tak samo wartość `--base`. (S)
  prompt recenzenta ucinany na pierwszej nowej linii. (C) `crew.js:162-164`.
- **Kontrola:** wektor przez `--base` wymaga spreparowanej nazwy gałęzi; ucięcie promptu zachodzi
  zawsze.
- **Kierunek:** tekst dowolny przez stdin albo plik; `model` i `base` z białą listą znaków.

### D7 · średnia · POTWIERDZONE — tryb zapisu załogi obchodzi własną listę zakazanych flag

- **Dowód:** (C) `crew.js:112` zakazuje `--yolo`, a `:370` dodaje `-f`; `:394` sprawdza podciągiem,
  więc `-f` przechodzi. (C) `:354` daje Claude Code `Bash` bez wzorca. (S) pomoc Cursor CLI nazywa
  `--yolo` aliasem `--force`.
- **Niezmierzone:** zachowanie Cursora na żywo (CLI nie było uruchamiane).
- **Kierunek:** `-f` i `--force` na listę zakazanych albo jawna zgoda człowieka; wzorce
  `Bash(<polecenie>:*)`.

### D8 · średnia · POTWIERDZONE — hook Claude Code skanuje tylko treść Write i Edit

- **Dowód:** (C) `hooks.json:5` — matcher bez `Bash`; `secret-scanner.js:68-71` skanuje sam
  `new_string`, nie plik po zamianie. Zapis przez przekierowanie w powłoce jest poza zasięgiem.
- **Kierunek:** PreToolUse na `Bash` ze skanem polecenia (adapter Codeksa już to robi); dla Edit
  skan treści po zastosowaniu zamiany.

### D9 · średnia · POTWIERDZONE — skaner Codeksa milknie po odziedziczonej zmiennej `CLAUDECODE` i przepuszcza każdy plik `.env*`

- **Dowód:** (C) `adapters/codex/hooks/secret-scanner.js:8` i `:23`; `crew.js:158` przekazuje całe
  środowisko procesu. (S) hook z ustawioną zmienną → cisza, bez niej → blokada.
- **Niezmierzone (HIPOTEZA):** czy Codex przekazuje swoje środowisko do hooków.
- **Kierunek:** załoga usuwa zmienne gospodarza ze środowiska innych narzędzi; furtka `.env*` tylko
  przy błędzie gita.

### D10 · niska · POTWIERDZONE — zepsuty marker gościa wyłącza guardy; czas skanu rośnie kwadratowo

- **Dowód:** (C) `session-signals.js:39-47` — nieczytelny albo niepoprawny `.claude/relai.json`
  działa jak tryb gościa. (O) `sec/redos.js`: ciąg `A-` ×10 000 (20 KB) 211 ms, ×20 000 805 ms,
  ×40 000 (78 KB) 4 019 ms.
- **Niezmierzone:** czy przekroczenie limitu czasu hooka przepuszcza zapis.
- **Kierunek:** błąd parsowania markera znaczy „projekt”; ograniczyć powtórzenia w wyrażeniu
  z przedrostkiem.

### D11 · niska · POTWIERDZONE — ochrona konfiguracji omijana zmianą wielkości liter na Windows

- **Dowód:** (O) `docs/USTAWIENIA.md` → `ask`; `docs/ustawienia.md` (ten sam plik) → cisza.
  (C) `config-protection.js:164,171`.
- **Kierunek:** porównanie przez klucz ścieżki małymi literami na win32.

### D12 · niska · POTWIERDZONE — dane w plikach śledzonych

- **Dowód:** (O) `docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md:944` — przypisanie nazwy
  `SECRET_TOKEN` z wartością (kształt wartości testowej); `DZIENNIK_2026-08-10_2026-08-12.md:257`
  — adres e-mail konta. Wartości nie są tu przepisane.
- **Do rozstrzygnięcia przez człowieka:** czy pierwsza wartość jest wyłącznie testowa i czy adres
  ma zostać w publicznym repozytorium.

---

## 7. Proces i dokumentacja (E)

### E1 · średnia · POTWIERDZONE — opisy rytuałów zamknięcia przeczą sobie

- **Dowód:** (C) `CLAUDE.md:20-21` podaje „wpis do dziennika … sprzątanie artefaktów”, a
  `session-close.md:26-27` stawia sprzątanie **przed** wpisem; `relai-core/SKILL.md:196-198` mówi
  o dwóch pytaniach i punktach „1–6 wraz z krokiem 2a”, a `session-close.md:33-34` (krok 3a) dodaje
  trzecie pytanie. (S) analogiczne sprzeczności w `stage-closing.md:21-22` wobec `:44`
  i `plan-closing.md:57-61` wobec `:72`.
- **Diagnoza:** kolejność z `CLAUDE.md` jest zawsze w kontekście i trafia do projektów przez
  szablon; procedura doczytywana zmieniła się później.
- **Kierunek:** w `CLAUDE.md` sama fraza z odsyłaczem albo poprawna kolejność; w skillu pełna lista
  pytań.

### E2 · średnia · POTWIERDZONE — przegląd spraw wraca do sprawy już załatwionej, a sekcje startowe mają martwe linki

- **Dowód:** (C) `DZIENNIK.md:86-91` — „Rozjazd manifestu …”, odroczone 2026-10-14; manifest ma
  już „for Claude Code, Cursor and Codex” i słowa kluczowe `codex`, `cursor`
  (`.claude-plugin/plugin.json`, commit `2c41a07` z 2026-10-12). (O) link pozycji prowadzi do
  nieistniejącego `docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md` (plik leży
  w `docs/fixy/OPIS_REPO/`); `STATE.md:122-124` wskazuje `adapters/codex/panel/`, którego nie ma.
  (O) 7 z 10 pozycji „Czeka na człowieka” ma adnotację odroczenia.
- **Diagnoza:** `overdue-review.md:37-38` zakazuje zamykania bez decyzji człowieka, więc pozycja
  załatwiona wraca co 30 dni; przeniesienie odnogi nie przepina linków.
- **Kierunek:** pytanie przeglądu podaje fakt z repozytorium jako podpowiedź; zamknięcie planu
  przepina linki tak jak rotacja.

### E3 · średnia · POTWIERDZONE — reguły „nigdy/zawsze” bez hooka są łamane ponownie po awansie do `CLAUDE.md`

- **Dowód:** (C) lekcje-powtórki po wejściu reguły do `CLAUDE.md`: backslash przez powłokę —
  L-0290 (`LEKCJE.md:655`), L-0293 (`:688`); `sed -i` na dokumencie — L-0276 (`:491`). (O)
  D-44 („STATE i DZIENNIK w tej samej turze”): `git log --since=2026-10-29 -- docs/DZIENNIK.md
  docs/STATE.md` → 0 commitów przy 6 commitach bez merge w tym okresie, w tym zmiany instalatorów.
- **Diagnoza:** PreToolUse nie obejmuje `Bash` (`hooks.json:5`), a reguły dotyczą właśnie poleceń
  powłoki.
- **Kierunek:** PreToolUse na `Bash` z werdyktem ostrzegawczym (nie blokadą — zasada 12) dla
  czterech wzorców; hook Stop porównujący commity z datą ostatniego wpisu.

### E4 · średnia · POTWIERDZONE — reguła Cursora (zawsze w kontekście) dryfuje od zamrożonej D-88

- **Dowód:** (C) `adapters/cursor/rules/relai-core.mdc:189-191` — „target moves to the rotatable
  part”; `DECYZJE.md:29` — „aż waga całego żywego pliku … nie »część rotowalna«”.
- **Kontrola:** `ritual-copies.test.js` sprawdza w regule tylko polecenie skrótu.
- **Kierunek:** część rytualna reguły generowana z jednego źródła albo test parytetu kluczowych
  zdań. Decyzji nie zmienia.

### E5 · średnia · POTWIERDZONE — D-14 przeczy wdrożonej rotacji i numeracji ryzyk (dotyka D-14)

- **Dowód:** (C) `DECYZJE.md:21` — „Rotacja: >50 KB lub kwartał … streszczenie”, „R-numeracja
  ciągła”; `SPEC_ARCHIWUM.md:75` — 150 KB, `:194` — „streszczenia okresu nie piszesz”; tabela ryzyk
  ma prefiksy R, P, S, M, O, K, C, L, H, T.
- **Kierunek:** aneks do D-14 opisujący stan wdrożony. To decyzja właściciela, nie poprawka.

### E6 · średnia · POTWIERDZONE — `docs/ARTEFAKTY.md` ma 145 KB, nie ma rotacji i dubluje dziennik

- **Dowód:** (O) 145 240 B, 270 linii, 154 wiersze tabel. (S) 14 wierszy ponad 2 000 znaków,
  najdłuższy 8 426. (C) `CLAUDE.md:71` — „Rejestr odpowiada na pytanie »po co«, dziennik na »co się
  działo« — nie mieszasz ich”. Kontrola wydania porównuje tylko klucz plik, wersja, data
  (`release-checks.js:291`).
- **Kierunek:** w komórce samo „po co” bieżącej wersji; historia zostaje w gicie. Skutek uboczny:
  C7 czyta mniejszy plik.

### E7 · średnia · POTWIERDZONE — rytuały zamknięcia są cięższe, niż wynika z ich opisów

| Rytuał | Kroki | Polecenia obowiązkowe | Instrukcje ładowane |
|---|---|---|---|
| Start („kontynuujemy pracę”) | 4 + do 5 warunkowych | `start-digest.js`, `release-hint.js` | ok. 49 KB (CLAUDE.md, hook, skill, skrót) |
| Zamknięcie sesji | 8 | co najmniej 4 (`count-rules`, `rotate plan` ×2, `clean-work`) | 18,8 KB; z rotacją +55,3 KB |
| Zamknięcie etapu | 7 | `clean-work` | 30,3 KB + skill 13,2 KB |
| Zamknięcie planu | 9 + 6 etapu = 15 | skan zależności | 25,3 KB |
| Wydanie | 5 + 10 podkroków, 7 zgód | `release-check` co najmniej 2 razy | 13,5 KB |

- **Dowód:** (S) liczby z `session-close.md:12-52`, `stage-closing.md:11-46`,
  `plan-closing.md:10-70`; (C) `document-rotation.md:14` każe czytać `SPEC_ARCHIWUM.md` (55 269 B)
  przed rotacją, a `:55` mówi „uruchamiasz skrypt, nie odtwarzasz kroków”. Ostatni etap planu daje
  dwa wpisy do dziennika i dwie aktualizacje `STATE.md`.
- **Kierunek:** specyfikację czytać tylko na ścieżkach ręcznych; lekcje dodać do `rotate.js`; na
  ostatnim etapie kroki dziennika i stanu wykonać raz.

### E8 · średnia · POTWIERDZONE — `STATE.md` opisuje tryb, w którym maszyna już nie pracuje

- **Dowód:** (C) `STATE.md:16` — „Maszyna Łukasza pracuje w trybie »RelAI tylko w projektach«”.
  (O) `node core/tools/relai-scope.js status` → „Poziom uzytkownika teraz: relai=true,
  relai-panel=true, relai-progress=false, relai-cache-keeper=true”.
- **Niezmierzone:** co przywróciło włączenie na poziomie użytkownika (kandydat: aktualizacja
  z `--scope user`, P-062).
- **Kierunek:** ponowne `relai-scope.js apply` albo korekta stanu; kontrola rozjazdu w hooku startu
  repozytorium pluginu.

### E9 · niska · POTWIERDZONE — liczby zapisane słowami rozjechały się z dyskiem (dotyka D-40)

- **Dowód:** (O) 14 hooków i 16 komend na dysku; (C) `PRZEWODNIK.md:120` „Trzynaście hooków”,
  `:245` „trzynastu” obok `:246` „czternaście”; `INSTALACJA.md:103-104` „dwa skille”;
  `PRZENOSNOSC.md:79` „dziesięć plików komend”; `panel/hooks/register.tsx:4` i opis panelu —
  „15 RelAI commands”.
- **Kierunek:** kontrola liczb słownych w `release-checks.js` albo odesłanie do `hooks.json` zamiast
  liczby.

### E10 · niska · POTWIERDZONE — `/relai-help` pokazuje w całości ściągę „krótką z założenia”, która ma 30 KB

- **Dowód:** (C) `relai-help.md:33-34`; (O) `docs/KOMENDY.md` 30 230 B. (S) w `SPEC_KOMENDY.md`
  sekcja historii wersji to 22 966 B z 35 791 B.
- **Kierunek:** limit rozmiaru w specyfikacji; historia do `history.md`.

### E11 · niska · POTWIERDZONE — skill każe rozpoznawać linię „Sesja nieinteraktywna”, której Claude Code nie wysyła

- **Dowód:** (C) `overdue-review.md:19`, `relai-core/SKILL.md:117` wobec
  `session-context.js:156-158` i `CLAUDE.md:31`.
- **Kierunek:** oznaczyć warunek jako dotyczący Cursora.

---

## 8. Mody i UI (F)

Ustalenia tej sekcji pochodzą z kodu i z emulacji w Node. **Korekta z 2026-11-09 (po audycie):**
pierwsza wersja raportu mówiła, że testów modów nie da się uruchomić poza hostem — to było błędne.
`node --test` kończy się na `Cannot find package 'claude-code'`, ale działa polecenie silnika
`"$CLAUDE_CODE_EXECPATH" plugin test <katalog modu>`: (O) `mods/` 87, `panel/` 216, `progress/` 50,
`cache-keeper/` 206 testów zielonych, razem 559, zero czerwonych.

### F1 · średnia · POTWIERDZONE — kokpit `relai-mods` wykonuje 602 wywołania systemu plików na każde rysowanie

- **Dowód:** (C) `mods/hooks/register.tsx:323` (`readInventory` w każdym `ui.render`), `:257`
  (odświeżanie co `REFRESH_MS`), `cockpit.ts:306` (5 000 ms), `views.tsx:188` (`onInput` na każdy
  znak). (O) `mods/count.ts` na tym dysku: 58 instalacji, 14 plików ustawień → 602 wywołania
  (exists 425, read 137, list 39, stat 1), 79–110 ms bezpośrednio w Node.
- **Niezmierzone (HIPOTEZA):** czas jednego rysowania w hoście; do zmierzenia na żywo przy 58
  pluginach.
- **Kierunek:** inwentarz w pamięci modułu z kluczem z `stat`; wpisywanie i kliknięcia rysują
  z pamięci. Zysk: 602 → 0 wywołań na znak, ok. 16 na tyknięcie bez zmian.

### F2 · średnia · POTWIERDZONE — zakładki Koszty i Mapa czytają wszystkie pliki pomiarów po każdej turze

- **Dowód:** (C) `panel/hooks/register.tsx:237-238`, `:1047-1048`. (O) `.claude/relai/pomiary`:
  155 plików, 6,2 MB od 2026-10-08; rotacji brak. (S) parsowanie całości 39–75 ms w Node, 19 578
  rekordów.
- **Kierunek:** pliki sesji zamkniętych w pamięci po kluczu nazwa, rozmiar, czas modyfikacji;
  retencja pomiarów jako osobna decyzja.

### F3 · średnia · POTWIERDZONE — panele `relai-progress` i `relai-mods` znikają bez komunikatu przy błędzie

- **Dowód:** (O) handler `ui.render` z `Pane` kończy się bez `.catch` w
  `progress/hooks/register.tsx:364-389` i `mods/hooks/register.tsx:321-358`; `relai-panel` ma go
  w `:948` z komentarzem o zamykaniu panelu „without a word”.
- **Kierunek:** skopiować wzór obsługi z panelu.

### F4 · średnia · POTWIERDZONE — `cache-timer.mjs` nie działa w żadnym modzie, a testy sprawdzają właśnie jego

- **Dowód:** (O) `git grep "cache-timer"` — jedyny import to `core/panel/tests/cache-timer.test.js`;
  graf importów (`mods/graph.js`) pokazuje plik jako nieosiągalny we wszystkich modach. (S) żywa
  logika jest w `cache-keeper/hooks/core.ts:36-76` z własnymi stałymi.
- **Kierunek:** cache-keeper importuje moduł rdzenia albo moduł i jego siedem testów znikają.

### F5 · średnia · POTWIERDZONE — dwa pliki modów przekroczyły 800 linii

- **Dowód:** (O) `wc -l`: `cache-keeper/hooks/register.tsx` 1 284, `panel/hooks/register.tsx`
  1 104. (S) sześć funkcji widoku ma ponad 150 linii, najdłuższa `mapView` 340.
- **Kierunek:** wynieść z cache-keepera warstwy bez dostępu do hosta jako czyste funkcje.

### F6 · niska · POTWIERDZONE — kod prawie identyczny bez strażnika i martwe eksporty

- **Dowód:** (S) `relaiRoot` w trzech wersjach, wzorzec markera w trzech miejscach, `readText`
  w dwóch wariantach; `mods-parity.test.js:15` pilnuje tylko trzech plików. (S) 16 eksportów
  `core/panel` używanych wyłącznie w testach, `readCost` w `cache-keeper/hooks/pricing.ts:89` bez
  odwołań.
- **Kierunek:** czyste części do `core/panel`; test równości ciał funkcji po nazwie.

### F7 · niska · POTWIERDZONE — zapis kolektora przepisuje cały plik sesji; zapis scaleń może zgubić cudzą zmianę

- **Dowód:** (S) `panel/hooks/register.tsx:169-186` (największy plik 363 KB, 2,2 ms na zapis);
  `pane-map.tsx:263-280` zapisuje `scalenia.json` z danych z chwili otwarcia zakładki.
- **Kierunek:** odczyt przed zapisem scaleń; poprawki etapów po czasie modyfikacji.

### F8 · niska · HIPOTEZA — pasek postępu przerysowuje się przy każdym kroku subagenta; kokpit pokazuje mod odrzucony jako włączony

- **Dowód:** (S) `progress/hooks/register.tsx:316-321` zapisuje atom bezwarunkowo;
  `mods/hooks/inventory.ts:8` zna stan tylko z plików.
- **Pomiar rozstrzygający:** licznik rysowań paska podczas `/relai-crew`; sprawdzenie, czy zdarzenie
  rejestracji niesie identyfikator pluginu.

---

## 9. Repozytorium i dystrybucja (G)

### G1 · wysoka · POTWIERDZONE — zainstalowany plugin waży 114 MB na wersję, z czego 3,8 MB to warstwa wykonawcza

- **Wniosek:** każda instalacja i aktualizacja kopiuje dokumentację, film i stronę.
- **Dowód:** (O) `~/.claude/plugins/cache/relai/relai/3.7.0` — 114,0 MB, 1 588 plików: `docs`
  92,6 MB, `site` 14,1 MB, `core` 2,3 MB, `adapters` 1,6 MB. W pamięci podręcznej są cztery wersje
  (3.4.0–3.7.0), razem 452 MB. (C) `.claude-plugin/marketplace.json:14` — `"source": "./"`.
  (O) pliki śledzone: 113,7 MB, w `docs/` PNG 41,3 MB, MP4 14,3 MB, GIF 8,2 MB; paczka gita
  129,6 MiB.
- **Kontrola:** mody mają własne źródła (`./panel` itd.) i ważą 0,7–1,1 MB — problem dotyczy tylko
  pluginu głównego.
- **Diagnoza:** źródłem pluginu jest korzeń repozytorium, w którym leży też dorobek projektu.
- **Kierunek:** źródło pluginu w podkatalogu albo osobnej gałęzi wydaniowej; media poza
  repozytorium pluginu. Zysk: ok. 110 MB na wersję i projekt (97%). Wymaga pomiaru instalacji po
  zmianie — F13 poprzedniego przeglądu.

### G2 · średnia · POTWIERDZONE — 2,8 MB plików identycznych co do bajta; mody niosą kopie rdzenia, których nie używają

- **Dowód:** (O) `git ls-files -s` w zakresie: 85 grup duplikatów, 2 816 454 B nadmiaru;
  20 plików `core/panel` w pięciu kopiach (2 242 348 B), 52 pliki skilli w dwóch adapterach
  (511 797 B). (O) graf importów: pliki nieosiągalne z `register.tsx` — cache-keeper 426 458 B,
  mods 256 564 B, progress 70 609 B, panel 68 887 B. `headings.mjs` (282 006 B) cache-keeper nie
  używa wcale, progress w ok. 10 KB.
- **Kontrola:** `sync-panel-core.js --check` pilnuje równości kopii — dryfu nie ma.
- **Kierunek:** synchronizacja kopiuje do modu tylko pliki osiągalne z jego `register.tsx`;
  `headings.mjs` podzielony per mod. Jedna kopia skilli dla trzech narzędzi dotyka D-89 (sprawa
  „Czeka na człowieka” z 2026-10-11).

### G3 · średnia · POTWIERDZONE — testy rdzenia, adapterów i modów nie mają CI

- **Dowód:** (O) jedyny workflow to `.github/workflows/strona.yml` (strona); testy uruchamia się
  ręcznie albo bramką `pre-push` przy tagu. Testy modów (559) wymagają binarki Claude Code
  (`plugin test`), więc CI na samym Node ich nie uruchomi.
- **Kierunek:** workflow z `node --test` dla czterech zestawów i `validate-adapters.js` (ok. 3 min
  lokalnie).

---

## 10. Sprawdzone bez znaleziska

- **Testy:** `node --test` — `adapters/codex/tests` 24/24 (39 s), `adapters/cursor/tests` 4/4,
  `core/guardrails/tests` 19/19, `core/panel/tests` 225/225, `core/process/tests` 357/357 (107 s).
  Razem 629 z 629, zero pominiętych.
- **`validate-adapters.js`:** kod 0, jedno ostrzeżenie (`security-audit/SKILL.md` 22 026 B ponad
  20 480 B).
- **Czas hooków:** PostToolUse 33–49 ms każdy, pozostałe do 168 ms (rozkład w sekcji 5);
  `start-digest.js` 105–186 ms.
- **Kopie projektowe:** 11 par źródło–kopia w `.claude/relai/tools` i `prompt` identycznych po
  normalizacji końców linii (kopie pochodzą z zainstalowanego 3.7.0).
- **Kasowanie artefaktów:** `work-artifacts.js` odmawia przy `..`, ścieżce względnej i junction
  (S, fikstura).
- **Spawny:** `plugin-scope.js` i `relai-scope.js` bez powłoki, z tablicą argumentów (S).
- **Identyfikatory sesji w ścieżkach:** sanityzowane w `session-title`, `prompt-mode`,
  `humanize-mode` (S).
- **Wersje modów:** manifesty, marketplace, README i `STATE.md` zgodne (0.22.1, 0.7.1, 0.13.0,
  0.3.0) (S).
- **Liczby w `STATE.md` i tabela w `KOMENDY.md`:** zgodne z dyskiem (S).
- **Mody:** brak `skip`, `todo` i `.only` w testach; twarde kolory tylko w paletach SVG (S).

## 11. Pozostała niepewność

- **Brak pomiarów na żywo:** czas rysowania modów w hoście (F1, F2, F8), zachowanie przy
  przekroczeniu limitu czasu hooka (D10), kanał `systemMessage` (C9), wznowienie sesji (A6),
  równoległość hooków (C5), przekazywanie środowiska w Codeksie (D9), Cursor CLI (D7).
- **Tokeny:** raport podaje bajty. Jedyne liczby w tokenach pochodzą z istniejących transkryptów
  (sekcja 12).
- **Nieprzeczytane:** `docs/archiwum/`, `docs/zasoby/`, `docs/fixy/`, `site/` (tylko rozmiary);
  treść `docs/PULAPKI.md` poza strukturą; historia gita pod kątem sekretów (tylko `HEAD`);
  adaptery Cursora i Codeksa na żywo; macOS i Linux.
- **Liczby subagentów oznaczone (S)** nie były odtwarzane osobno; ich cytaty z plików sprawdzono.
- **Znane z poprzedniego przeglądu i pominięte:** F01, F02, F05–F10, F15, F16.

## 12. Obserwacja poza zakresem: kontekst pierwszego wywołania

Nie jest to znalezisko RelAI, ale dotyczy pytania o za duży kontekst.

- (O) `node core/tools/start-context.js --ostatnie 10` — pierwsze wywołanie API w dziesięciu
  ostatnich sesjach tego projektu: 80 977–113 662 tokenów; ta sesja 112 495.
- Stała warstwa RelAI na starcie to ok. 46,6 KB (pomiar poprzedniego przeglądu, skrót potwierdzony
  dziś: 26 633 B), czyli mniejsza część tej liczby.
- (O) reguły globalne użytkownika (`~/.claude/CLAUDE.md` i `rules/common`, `rules/typescript`)
  to 26 053 B; w `~/.claude/agents` jest 60 definicji agentów; włączonych jest dziewięć pluginów.
- Rozkład pierwszego wywołania na składniki (prompt systemowy, schematy narzędzi, pluginy, reguły)
  nie został zmierzony. To osobny temat od optymalizacji RelAI.
