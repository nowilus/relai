# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski przy Opusie, średni przy modelach słabszych** (2026-08-10 po E10) | **ZMIERZONE 2026-08-10, OTWARTE ŚWIADOMIE** | Warstwą nośną są hook `session-context` i `CLAUDE.md` projektu — działają przy każdym modelu, bez wyzwalania; skill dokłada wyłącznie procedurę (L-0030). Opus wyzwala skill sam i wykonuje procedurę w całości; Sonnet 4.6 i Haiku 4.5 nie wołają `Skill` ani razu, więc projekt nie traci pamięci, ale procedura bywa niepełna. Otwarte świadomie: to trwała własność modeli, nie usterka do naprawienia. Zakres ryzyka rósł od 1.1.0 bez pomiaru — dziesiąta komenda, sygnał odchylenia, rozjazd stanu i kontrola podpisu nie były mierzone w świeżej sesji, bo limit konta zatrzymał CLI (L-0032). **Odnoga `POMIAR_ODNOG` anulowana 2026-09-01** — ta część zakresu zostaje niezmierzona świadomie, karta zostaje w repo. Zmierzone: 2026-08-07 (E5), 2026-08-10 (E10), 2026-08-12 (E1), 2026-08-12 (E3) |
| R5 | Dokumenty puchną i zjadają kontekst | **Średni, potwierdzony na trzech projektach** (2026-09-01) | **OTWARTE — plan HIGIENA_DOKUMENTOW jest odpowiedzią** | Mechanizm jest kompletny, ale **nie broni się sam**: progi nie mają adresu egzekwowania, więc rosną latami (PolyFlow 862,7 KB przy progu 150 KB). Naprawa idzie planem HIGIENA_DOKUMENTOW (6 etapów, Aneksy A i B). E1: zakres rotacji PolyFlow **0 → 117 wpisów ze 127**. E2: próg liczy się ponad nietykalnymi, a zatkana rotacja wypisuje blokery. E3: sprawa czekająca dłużej niż 30 dni wymusza decyzję na starcie — PolyFlow ma dziś 25 spraw otwartych i 0 przeterminowanych, ale 25 z 25 sześć tygodni później. Otwarte, dopóki plan nie dobiegnie końca, dopóki nie zmierzy się tego w **cudzym** projekcie i dopóki **JiraManager (386 KB startu) nie zostanie tknięty**. Zmierzone: 2026-08-20, 2026-08-21, 2026-09-01 (E1, E2, E3, rotacja) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)

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

### 2026-08-17 — Zamknięcie sesji

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Etap E6 domknięty rytuałem: `STATUS.md` (E6 ZREALIZOWANY, E7 GOTOWY DO STARTU, bramka „osoba
  z zespołu" rozstrzygnięta), wpis merytoryczny, `STATE.md`, `CLAUDE.md`, `PROMPT_ETAP_7.md`.
- Commit `eabdbf6` (`fix: secret scanner no longer flags TypeScript type annotations`) i **push**
  do `github.com/nowilus/relai`. Katalog roboczy czysty przed commitem i po nim.

**Zweryfikowane — jak dokładnie:**

- `git status --short` po pushu: pusto. `git log` pokazuje `eabdbf6` nad `af329e6` (1.5.0).
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed" z jedynym znanym
  ostrzeżeniem o root `CLAUDE.md` (L-0003). `node core/tools/validate-adapters.js` → kod 0,
  wersja „1.5.1" spójna w trzech źródłach.
- **Rotacja dokumentów: próg przekroczony, ale nie ma czego przenieść.** `DZIENNIK.md` ma 196 KB
  przy progu 150 KB; zakres do archiwum musi być ciągły i zaczyna się od najstarszego wpisu, a ten
  ma w „Do zrobienia przez człowieka" pozycję z adnotacją „*(zrobione 2026-08-07 …)*". Specyfikacja
  `SPEC_ARCHIWUM.md` uznaje za rozstrzygnięcie wyłącznie brzmienie „*(rozstrzygnięte …)*", więc
  wpis jest nietykalny i blokuje cały zakres. Mechanizm nie jest zepsuty — jest zatkany na
  nierozstrzygniętej decyzji z 2026-08-12. `LEKCJE.md`: 40 KB i 47 zasad aktywnych — poniżej progu
  wielkości, na granicy progu liczby lekcji. `STATE.md`: 161 linii przy progu 300.

**Świadomie odłożone:**

- **Rotacja dziennika** — do czasu decyzji o akceptowanych brzmieniach dopisku rozstrzygnięcia.
  Plik rośnie dalej; przy tym tempie zatkanie zacznie kosztować kontekst każdej sesji.
- Trzy odnogi (`OPIS_REPO`, `POMIAR_ODNOG`, `REKOMENDACJA_MODELU`) — każda z gotowym promptem.

**Do zrobienia przez człowieka:**

- **Rozstrzygnąć dopisek rozstrzygnięcia w `SPEC_ARCHIWUM.md`**: czy „*(zrobione …)*" i podobne
  brzmienia liczą się na równi z „*(rozstrzygnięte …)*". Bez tego rotacja dziennika stoi. Zmiana
  dotyka specyfikacji rdzenia, więc nie robię jej przy okazji zamykania sesji (powtórzenie
  z 2026-08-12).
- Pozostałe pozycje bez zmian wobec wpisu E6 z dzisiaj: decyzja `AGENTS.md` / `CLAUDE.md`,
  sekwencja wydania 1.5.1, ponowna instalacja pre-commita tam, gdzie już jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los projektu testowego `ProbaCursorE6`. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-17 — Decyzja D-86: plik główny projektu

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Zamrożona **D-86**: projekt z adapterem obcego narzędzia (Cursor, Codex) ma **`AGENTS.md`** jako
  plik główny, a `CLAUDE.md` zostaje w nim wskaźnikiem; projekt prowadzony wyłącznie w Claude Code
  zostaje bez zmian. Kolizję rozstrzyga obecność adaptera, nie narzędzie bieżącej sesji.
- Tabela „Decyzje zmienione" w rejestrze: D-10 i D-11 uzupełnione przez D-86.
- `PROMPT_ETAP_7.md`: blokująca bramka zamieniona w rozstrzygnięcie — E7 nie pyta o to ponownie
  i dostaje wprost zakres wdrożenia (instalator Codeksa, instalator Cursora, `SPEC_CLAUDE_MD.md`).
- `STATE.md` zaktualizowany: pozycja „do rozstrzygnięcia" zamieniona na zapis decyzji.

**Zweryfikowane — jak dokładnie:** decyzja zapisana w dwóch miejscach rejestru (wpis D-86 i wiersz
tabeli zmian), a prompt etapu E7 nie zawiera już zdania nakazującego zatrzymanie się na tym pytaniu.
Wdrożenia nie ma i celowo nie było — należy do E7.

**Świadomie odłożone:**

- **Wdrożenie D-86** w całości: instalator Cursora nadal zakłada wyłącznie `CLAUDE.md`, więc
  projekty z adapterem Cursora (w tym `ProbaCursorE6`) mają dziś układ sprzed decyzji.

**Do zrobienia przez człowieka:**

- Pozycje bez zmian wobec dwóch wcześniejszych wpisów z dzisiaj: dopisek rozstrzygnięcia
  w `SPEC_ARCHIWUM.md` (rotacja dziennika stoi), sekwencja wydania 1.5.1, ponowna instalacja
  pre-commita, `claude /login`, `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-17 — Rotacja dziennika odblokowana, wersja 1.5.2

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **`SPEC_ARCHIWUM.md` — rozstrzygnięty dopisek rozstrzygnięcia.** Pozycja „Do zrobienia przez
  człowieka" jest zamknięta, gdy ma **rdzeń z zamkniętej listy** (`rozstrzygni`, `zrobion`,
  `zaakceptowan`, `domkni`, `wykonan`, `anulowan`) **plus datę** `RRRR-MM-DD`; forma gramatyczna
  dowolna. Jawnie nie liczą się: `czeka`, `w toku`, `odłożone`, `zaplanowane`, `przypomnieć`,
  `do sprawdzenia`. Adnotacja bez daty to komentarz, nie zamknięcie. Wersja **1.5.2** w czterech
  źródłach i w markerze projektu.
- **Cztery decyzje zaległe z dziennika** rozstrzygnięte przez człowieka: rejestr `DECYZJE.md`
  zostaje historyczny (format specyfikacji obowiązuje nowe wpisy); sekcja „Weryfikacja" zostaje
  wyłącznie w prompcie etapowym; `config-protection` nie pyta przy dopisywaniu wiersza preferencji;
  fonty w HTML zostają w komplecie, bez podzbioru.
- **29 adnotacji rozstrzygnięcia** dopisanych do historycznych wpisów — każda z datą realnego
  rozstrzygnięcia i wskazaniem dowodu (status etapu, wiersz w `USTAWIENIA.md`, numer lekcji,
  Aneks A, wynik pilotażu E6).
- **Pierwsza rotacja dziennika w tym projekcie.** Szesnaście najstarszych wpisów (2026-08-07 …
  2026-08-09) przeniesione do
  [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md).

**Zweryfikowane — jak dokładnie:**

- **Dwufazowość zadziałała z dowodem.** Suma kontrolna fragmentu w żywym pliku
  `c17de1981ceedb1c`, suma treści odczytanej **z dysku** spod separatora archiwum — identyczna.
  Dopiero po zgodności nastąpiło przycięcie.
- Rozmiary: dziennik **201 KB → 98 KB** (próg 150 KB), plik archiwum 104 KB. Cel „poniżej 60%
  progu" (90 KB) **nie został osiągnięty** i to jest zachowanie zgodne ze specyfikacją: zakres
  jest ciągły i urwał się na pierwszym wpisie nietykalnym, zamiast przeskoczyć go i zabrać
  kolejne.
- Nietykalne zostały: sekcja „Stan otwartych ryzyk", dziesięć najnowszych wpisów oraz wpis
  z 2026-08-10 (E10) — ma trzy realnie otwarte pozycje dla człowieka. Odsyłacz stoi jako pierwsza
  rzecz w sekcji „Wpisy", bez streszczenia okresu.
- Ponowna analiza po adnotacjach: zakres możliwy do przeniesienia urósł z 3 wpisów (9 KB) do 16
  (103 KB) — czyli blokada była **długiem adnotacyjnym**, nie zaległością pracy.
- **L-0035 potwierdzona w praktyce:** mechanizm czytający dopisek maszynowo uznawał zamknięte
  pozycje za otwarte przez pięć dni, bo zbiór akceptowanych brzmień powstał po pierwszym nawyku
  pisania, a nie przed nim.

**Świadomie odłożone:**

- **Rotacja rejestru lekcji** — `LEKCJE.md` ma 40 KB przy progu 50 KB i 47 zasad aktywnych; poniżej
  progu wielkości, więc rotacja milczy zgodnie ze specyfikacją.
- **Dalsze przycięcie dziennika** — możliwe dopiero po rozstrzygnięciu trzech pozycji z wpisu
  E10 (niżej).

**Do zrobienia przez człowieka:**

- **Trzy pozycje blokujące dalszą rotację**, wszystkie z wpisu 2026-08-10 (E10): los projektu
  pilotażowego `Desktop\Paragony`, commit zmian adopcyjnych w JiraManagerze oraz rozstrzygnięcie,
  czy guard hooków ma rozpoznawać pliki po ścieżce. Po ich zamknięciu rotacja pójdzie dalej sama,
  przy najbliższym „kończymy na dziś".
- Pozycje bez zmian: sekwencja wydania (teraz **1.5.2**), ponowna instalacja pre-commita tam, gdzie
  jest, `claude /login`, `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`,
  wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-17 — Zamknięcie trzech pozycji z E10, odnoga GUARD_PO_SCIEZCE

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Trzy pozycje blokujące dalszą rotację rozstrzygnięte.** Dwie okazały się zamknięte faktami,
  które nigdy nie trafiły do dziennika; trzecia była realną decyzją i została podjęta.
- **Odnoga `GUARD_PO_SCIEZCE`** — karta, samowystarczalny prompt (z 47 zasadami aktywnymi) i linia
  w sekcji „Odnogi" `STATUS.md`. Zakres: rozpoznanie projektu liczone także od katalogu edytowanego
  pliku, poprawka w `core/process/session-signals.js` plus trzy hooki guardraili i `isGitIgnored()`
  wołane z katalogu projektu docelowego.
- Sześć adnotacji rozstrzygnięcia dopisanych do wpisów z 2026-08-10 i 2026-08-11 (pozycje wracały
  w trzech kolejnych wpisach).

**Zweryfikowane — jak dokładnie:**

- **`Desktop\Paragony`** — katalogu nie ma na dysku (`ls` po Desktopie: tylko `JiraManager`).
  Projekt pilotażowy nie jest kontynuowany, kopie testowe wygasły razem z katalogami sesji.
- **Adopcja JiraManagera jest zacommitowana** — `git ls-files` w tamtym repozytorium zwraca
  **79 plików** w `docs/`, w tym `RAPORT_ADOPCJI.md` i `USTAWIENIA.md`. Niezacommitowane zmiany,
  które tam dziś są (`extension/`, `tests/`, `docs/plany/WTYCZKA_I_DOSTAWCY/STATUS.md`), dotyczą
  bieżącej pracy nad wtyczką, nie adopcji — pozycja z 2026-08-10 opisywała stan sprzed commita.
- **Rotacja nie została uruchomiona ponownie i tak ma być:** dziennik ma 102 KB przy progu 150 KB,
  a poniżej progu specyfikacja nakazuje ciszę. Analiza kontrolna pokazuje, że po zdjęciu blokad
  kolejny zakres wynosiłby dwa wpisy (11 KB) i urwałby się na wpisie z otwartą bramką wydania —
  ścieżka jest przetarta, mechanizm ruszy sam przy najbliższym przekroczeniu progu.

**Świadomie odłożone:**

- **Wykonanie odnogi `GUARD_PO_SCIEZCE`** — zmiana dotyka rdzenia wołanego przez dziesięć hooków,
  więc dostała własną kartę i prompt zamiast wejść „przy okazji" po zamknięciu etapu E6.

**Do zrobienia przez człowieka:**

- **Sekwencja wydania 1.5.2** (push → `claude plugin marketplace update relai` → `claude plugin
  update relai@relai` → restart aplikacji, L-0031) — to jedyna pozycja, która blokuje jeszcze
  jeden wpis przed rotacją, i jedyna, która sprawia, że dzisiejsze poprawki nie działają poza tym
  repozytorium. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-18 — Potwierdzenie wydania 1.5.2 i odświeżenie README

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Sprawdzone wydanie 1.5.2 po sekwencji wykonanej przez człowieka (push → aktualizacja
  marketplace'u → `plugin update` → restart aplikacji).
- `README.md`: numer wersji w nagłówku podbity do **1.5.2**, poprawiona liczba specyfikacji
  („dwadzieścia specyfikacji plus szablon planu HTML — razem trzydzieści plików"), usunięte
  nieaktualne zdanie o adapterze Cursora jako hipotezie („gdyby jutro powstał"), dopisany akapit
  o wyniku pilotażu z 2026-08-17.
- Commit `5e71863` z tą zmianą wypchnięty na GitHuba — nagłówek README pokazuje tam 1.5.2.

**Zweryfikowane — jak dokładnie:**

- `~/.claude/plugins/installed_plugins.json`: `relai@relai` → `version 1.5.2`,
  `gitCommitSha 0c54eae78b78fbfaf9001a731be5e23f7f28b8a8` (zgodny z ostatnim commitem repozytorium),
  `installPath` na katalogu `1.5.2`, `lastUpdated 2026-08-17T15:58Z`.
- **Wersja potwierdzona zachowaniem, nie wpisem** (L-0020): hook `secret-scanner` uruchomiony
  **z cache'u pluginu 1.5.2** przepuścił sygnaturę funkcji haszującej hasło i zablokował realny
  sekret w tym samym przebiegu. Poprawka `TYPE_TOKEN_RE` jest obecna w pliku rdzenia w cache'u.
- README na GitHubie było **identyczne z lokalnym** przed zmianą (`git diff origin/main -- README.md`
  pusty), więc rozjazd repozytorium ↔ GitHub nie występował; wzmianka o Cursorze była na miejscu
  w pięciu sekcjach, nieaktualny był wyłącznie numer wersji i dwa zdania opisu.

**Świadomie odłożone:**

- Wzmianki „od 1.5.0" przy adapterze Cursora zostają — to daty historyczne wprowadzenia funkcji,
  nie numer bieżącego wydania (L-0008).

**Do zrobienia przez człowieka:**

- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-18 — README: rozdzielona instalacja dla Claude Code i Cursora

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Sekcja „Instalacja" rozbita na dwie ścieżki** z tabelą różnic na wejściu (co instalujesz,
  zasięg instalacji, czy potrzebne repozytorium na dysku, jak się aktualizuje):
  **A. Claude Code — plugin** (bez zmian merytorycznych) i **B. Cursor — adapter (bez Claude
  Code)**.
- Ścieżka Cursora opisana **od zera, krok po kroku**: sprawdzenie Node.js, klon repozytorium
  w miejsce docelowe (z powodem: hooki wskazują ścieżkę bezwzględną), utworzenie folderu projektu,
  uruchomienie instalatora, restart Cursora, pierwsze zdanie w czacie („zacznijmy projekt").
  Dołożone: co robić przy kolejnym projekcie, jak aktualizować, jak odinstalować.
- Podsekcja **„Cursor bez Node.js"** przeniesiona do instalacji razem z wariantem `--bez-skanu`
  i zmienną `RELAI_NODE`.
- Sekcja opisowa „RelAI w Cursorze" odchudzona z **duplikatu instrukcji** — zostaje w niej to, co
  adapter daje i czym różni się od pluginu, plus link do właściwej sekcji instalacji.
- „Wymagania": usunięte odesłanie „instalacja niżej" (instrukcja jest wyżej), dołożony link do
  wariantu bez Node.js.

**Zweryfikowane — jak dokładnie:**

- Kontrakt instalatora sprawdzony w kodzie, nie z pamięci: `adapters/cursor/install.js:256` wymaga
  **istniejącego katalogu** (`to nie jest katalog` przy braku) i sam go nie zakłada — stąd osobny
  krok `mkdir` w instrukcji; flagi to `--bez-skanu` i `--uninstall` (linie 6–7, 45–46); git nie
  jest wymagany do instalacji adaptera.
- Adres repozytorium wzięty z `git remote -v`: `https://github.com/nowilus/relai.git` — nie
  z pamięci modelu.
- Polecenie instalatora występuje w README **czterokrotnie** i każde wystąpienie jest inne
  (instalacja, deinstalacja, `--bez-skanu`, opis drzewa katalogów) — duplikat instrukcji zniknął.
- Kotwica linku `#b-cursor--adapter-bez-claude-code` odpowiada nagłówkowi sekcji w konwencji
  GitHuba (małe litery, spacje na łączniki, myślnik długi usunięty).

**Świadomie odłożone:**

- **Angielska wersja README** — repozytorium jest publiczne, a instrukcja instalacji jest po
  polsku; to pierwsza rzecz, która zaboli kogoś spoza zespołu. Nie mieści się w dzisiejszej
  zmianie i należy do E8 (dystrybucja).
- Weryfikacja instrukcji **na kimś, kto jej nie pisał** — pilotaż E6 pokazał, że to jedyny sposób
  wyłapania luk w instrukcji instalacji; kryterium „ktoś inny niż autor" nadal niespełnione.

**Do zrobienia przez człowieka:**

- Przeczytać ścieżkę B oczami kogoś, kto ma wyłącznie Cursora, i powiedzieć, w którym kroku
  utknął — to jest tańsze niż czekanie na pierwszego użytkownika z zewnątrz. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")* *(anulowane 2026-09-01 — decyzja użytkownika, sprawa zdjęta z listy bez wykonania)*
- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")* *(rozstrzygnięte 2026-09-01 — `claude /login` anulowany wraz z odnogą POMIAR_ODNOG, okno `/relai-update` zamknięte, `ProbaCursorE6` do kasacji ręką człowieka; otwarte zostają obie sprawy pre-commita i wdrożenie D-86 w E7)*

### 2026-08-20 — Pomiar warstwy startowej trzech projektów i plan OPTYMALIZACJA_KONTEKSTU

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Zmierzona warstwa czytana przy starcie sesji** w trzech projektach — sześć pozycji rytuału
  startu, sekcje liczone jako sekcje, nie całe pliki: **JiraManager 386 KB (≈120 tys. tokenów),
  PolyFlow 155 KB (≈48 tys.), RelAI 90 KB**. Rozbicie i przyczyna rozrostu każdej pozycji wpisane
  do sekcji 3 planu.
- **Znaleziona przyczyna martwej rotacji** — nie rozmiar, tylko mechanizm: zakres przenoszonych
  wpisów musi być ciągły od najstarszego, a wpis z otwartą pozycją „Do zrobienia przez człowieka"
  go przerywa. W JiraManagerze robi to **wpis numer jeden** (szablonowy `## Etap N — nazwa`), więc
  rotacja włączona 2026-08-12 nie przeniosła nigdy niczego przy dzienniku 1,00 MB. PolyFlow zapisał
  ten sam objaw trzy razy pod rząd we własnym dzienniku.
- **Dwie rundy wywiadu** (siedem rozstrzygnięć): forma pracy i kolejność wobec E7, budżet startu,
  kierunek architektoniczny, zakres migracji, sposób rozbrojenia rotacji, los mapy katalogów
  i pułapek z `CLAUDE.md`, polityka tabeli ryzyk, zachowanie hooka przy przekroczeniu budżetu.
- **Plan OPTYMALIZACJA_KONTEKSTU** utworzony jako `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html`
  (HTML, 234 KB z osadzonymi fontami) oraz `STATUS.md` ze statusem `DO AKCEPTACJI`: pięć etapów,
  budżet 80 KB na warstwę startową, cztery warianty z jawnymi powodami odrzucenia, siedem ryzyk,
  dziewięć rozstrzygniętych przypadków brzegowych, cztery bramki manualne. Plan ma symulator
  kosztu startu liczący na żywo ze zmierzonych wartości JiraManagera.
- **Linia aktywnego planu w `CLAUDE.md`** przestawiona na nowy plan, z adnotacją, że E7 planu
  ROZWOJ_PO_WYDANIU czeka do wydania 1.6.0. `STATE.md` opisuje oba plany i nowy najbliższy krok.

**Zweryfikowane — jak dokładnie:**

- Rozmiary i liczby wpisów liczone `wc`, `stat` i skryptem po nagłówkach — nie z pamięci modelu:
  JiraManager `CLAUDE.md` 1249 linii / 110 KB, `STATE.md` 1485 linii / 137 KB (sama sekcja „Nad czym
  pracujemy teraz" — 882 linie), „Zasady aktywne" 930 linii / 78 KB przy limicie 15 pozycji,
  dziennik 13 430 linii / 1,00 MB / 167 wpisów.
- Blokada rotacji potwierdzona **na treści**, nie z domysłu: skrypt przeszedł pierwsze dwanaście
  wpisów JiraManagera i sprawdził ich sekcje „Do zrobienia przez człowieka" wobec zamkniętej listy
  rdzeni rozstrzygnięcia z 1.5.2 — wpis nr 1 wychodzi jako otwarty, czyli ciąg kończy się na nim.
- Plan HTML zbudowany builderem (`zbuduj.js`, 6 reguł `@font-face`, kod wyjścia 0) i **otwarty
  w przeglądarce**: zero niewypełnionych znaczników, jedyne `http://` w pliku to przestrzeń nazw
  SVG (nie żądanie sieciowe), 13 bloków zwijalnych z unikalnymi `aria-controls`, brak przewijania
  w poziomie (439/439 px). Symulator policzony na wartościach startowych: 386 KB → 123 520 tokenów,
  483% budżetu, „już pęknięty"; po podstawieniu wartości docelowych schodzi do zapasu dodatniego.

**Świadomie odłożone:**

- **`ARCHITEKTURA.md` JiraManagera (305 KB)** i inne dokumenty czytane na żądanie — nie są w
  warstwie startowej, więc nie wchodzą do tego planu; wracają, gdy zaczną boleć w trakcie etapu.
- **Waga planów HTML** (234 KB przez osadzone fonty) — to plik dla człowieka, nie dla kontekstu
  sesji; podzbiór znaków zostaje otwartym tematem przy R5.
- Rusztowanie generacji planu (dwanaście plików pomocniczych) **przeniesione**, nie skasowane, do
  `%TEMP%\relai-build-20260820` — hook bezpieczeństwa dwukrotnie odrzucił `rm -rf` mimo podanych
  faktów; do sprawdzenia, czy bramka nie jest za szeroka.

**Do zrobienia przez człowieka:**

- **Zaakceptować albo poprawić plan** — bez akceptacji nie powstaje `PROMPT_ETAP_1` i nic nie rusza.
  *(rozstrzygnięte 2026-08-20 — plan zaakceptowany bez poprawek)*
- **Aneks do zamrożonego planu ROZWOJ_PO_WYDANIU**: numer wydania E7 z 1.6.0 na 1.7.0 — do
  zatwierdzenia przed startem E1. *(rozstrzygnięte 2026-08-20 — aneksu nie piszemy, E7 wstrzymany; bramka planu OPTYMALIZACJA_KONTEKSTU)*
- Pozostałe bez zmian: sekwencja wydania, ponowna instalacja pre-commita, `claude /login`, okno na
  migrację JiraManagera i PolyFlow, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — Plan OPTYMALIZACJA_KONTEKSTU zaakceptowany, E1 gotowy do startu

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Plan **ZAAKCEPTOWANY bez poprawek** — brak aneksu, sekcje 1–9 zamrożone. Status zmieniony
  w `STATUS.md` i w metadanych `PLAN.html` (pasek i metka).
- **Wygenerowany `PROMPT_ETAP_1.md`** (23,5 KB) wg `SPEC_PROMPT_ETAPU.md`: dziewięć elementów
  w stałej kolejności, jedenaście pozycji do przeczytania na start, dziewięć decyzji zamkniętych
  wraz z granicą zakresu wobec E2–E5, stan wyjściowy z realnym drzewem plików rdzenia i adapterów,
  siedem punktów zakresu, dwanaście punktów weryfikacji (w tym cztery dowody negatywne) i rytuał
  „Na koniec".
- E1 ustawiony jako **GOTOWY DO STARTU** z linkiem do promptu; linia w dzienniku wdrożenia planu.
- Linia aktywnego planu w `CLAUDE.md` i `docs/STATE.md` odświeżone o status planu.

**Zweryfikowane — jak dokładnie:**

- Wszystkie 47 pozycji sekcji „Zasady aktywne" wstawione do promptu **programowo z `docs/LEKCJE.md`**,
  nie przepisane ręcznie — licznik po wstawieniu zwrócił 47, więc żadna zasada nie zgubiła się
  po drodze (spec wymaga przepisania w całości, nie linkiem).
- Status w `PLAN.html` podmieniony skryptem z kontrolą: 2 wystąpienia zmienione, 0 pozostało.
- Stan wyjściowy promptu spisany z **realnego repozytorium**, nie z planu: lista funkcji
  `session-signals.js` wzięta z grepa po definicjach, drzewo plików rdzenia i adapterów z `find`,
  brak katalogu testów potwierdzony (`find` po `*test*` — zero trafień), zawartość
  `core/MANIFEST.json` odczytana przed wpisaniem do promptu.

**Świadomie odłożone:**

- Nic nowego. Zakres E1 jest zamknięty w prompcie, reszta czeka w planie.

**Do zrobienia przez człowieka:**

- **Aneks do ROZWOJ_PO_WYDANIU** (E7: 1.6.0 → 1.7.0) — przed startem E1. *(rozstrzygnięte
  2026-08-20 — aneksu nie piszemy, E7 wstrzymany: konto Codeksa w planie darmowym i brak osoby
  do pilotażu)*
- Pozostałe bez zmian: sekwencja wydania po E4, ponowna instalacja pre-commita, `claude /login`,
  okno na migrację JiraManagera i PolyFlow, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E1: miara warstwy startowej, budżet 80 KB, naprawa martwej siatki D-34

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **`core/process/session-signals.js` — `startCost(cwd, opcje)`**: czysta biblioteka bez zależności
  npm. Czyta wiersz `Budżet startu sesji` z `docs/USTAWIENIA.md` (kotwica na początku komórki
  `Decyzja`, człony rozdzielone `·`), mierzy sześć pozycji rytuału startu — całe pliki tam, gdzie
  rytuał czyta cały plik, i sekcje tam, gdzie czyta sekcję — i zwraca fakty: pozycje z `sposob`
  (`plik` / `sekcja` / `plik-bez-sekcji`), sumę, budżet, progi cząstkowe, listę pozycji ponad
  progiem i flagę przekroczenia sumy. Obsługuje nazwy dokumentów w języku projektu
  (`JOURNAL.md`, `LESSONS.md`, `SETTINGS.md`) i angielskie nagłówki sekcji.
- **`startCostReport(miara, opcje)`** — raport ASCII, najwyżej sześć linii, wyłącznie powyżej
  budżetu. Formatowanie świadomie mieszka w rdzeniu, wbrew domyślnej regule „formatowanie
  u adaptera": plan wymaga **tego samego** raportu w obu adapterach, a jedno brzmienie w dwóch
  plikach rozjechałoby się przy pierwszej poprawce (ryzyko P4). Powód zapisany w nagłówku pliku.
- **Oba hooki `session-context`** wołają tę samą funkcję rdzenia. Cursor przekazuje
  `interaktywna: is_background_agent !== true` — sygnał **zmierzony** w E5. Claude Code nie
  przekazuje nic, bo nie ma czym rozstrzygnąć (patrz „Świadomie odłożone").
- **`core/templates/SPEC_USTAWIENIA.md`** — sekcja „Wiersz `Budżet startu sesji` (od 1.6.0)":
  format maszynowy, osiem członów z wartościami domyślnymi (to jedyne źródło prawdy o tych
  liczbach), zachowanie przy wartości nierozpoznanej, przy braku wiersza i przy braku sekcji
  w dokumencie. Plus wiersz w tabeli inicjalizacyjnej i w kompletnym przykładzie na końcu.
- **`docs/USTAWIENIA.md`** — wiersz `Budżet startu sesji` z 2026-08-20 (dogfooding: RelAI mierzy
  sam siebie). **`docs/KOMENDY.md`** — jedna linia w „Czego RelAI pilnuje bez proszenia".
- **Poprawka spoza pierwotnego zakresu, wykonana na wyraźną decyzję Łukasza:**
  `liniaAktywnegoPlanu` brała **pierwszą** linię z frazą „Aktywny plan", a w `CLAUDE.md` tego
  projektu fraza pada najpierw w prozie rytuału startu — bez linku. Skutkiem była **martwa siatka
  D-34 i martwy detektor rozjazdu stanu w całym repozytorium od 1.3.0**: oba zwracały `null` na
  braku linku i milczały nie dlatego, że było zgodnie, tylko dlatego, że nie miały czego
  porównać. Teraz wygrywa linia **niosąca link do `STATUS.md`**, a `promptGap` korzysta z tej
  samej funkcji zamiast własnej kopii logiki. Przy okazji poprawiona treść
  [CLAUDE.md:14](../CLAUDE.md) — mówiła „obecnie: ROZWOJ_PO_WYDANIU", czyli nieprawdę.

**Zweryfikowane — jak dokładnie:**

- **Sześć pozycji i suma na tym repozytorium:** CLAUDE 6066 B · STATE 12 668 B · ryzyka 21 441 B ·
  zasady 11 488 B · ustawienia 4220 B · status planu 1996 B = **57 879 B przy budżecie 81 920 B**.
  Cztery pozycje mierzone jako cały plik zgodne **co do bajta** z `stat -c%s`. Dwie sekcje
  porównane z `awk`/`sed`: zasady 11 488 vs 11 489 B, ryzyka + ostatni wpis 21 441 vs 19 411 + 2030
  B — różnice wynikają wyłącznie z końcowego znaku nowej linii, który `awk` dolicza, a złączenie
  linii nie. Po dopisaniu tego wpisu, lekcji i zmianach w `STATE.md` ten sam pomiar daje
  **około 65 KB** — sam etap zjadł ~8 KB budżetu, w większości w sekcji ryzyk (20,9 → 26,6 KB). To nie
  jest usterka, tylko dowód, że pozycja „ryzyka" rośnie przy każdym pomiarze; jej odchudzenie
  należy do E4.
- **Dowód negatywny na ciszę:** zrzut wyjścia hooka `SessionStart` zrobiony **przed** pierwszą
  edycją i porównany `cmp` po zmianach — **bajt w bajt identyczny** w trzech przypadkach: projekt
  testowy poniżej budżetu (Claude Code i Cursor osobno) oraz to repozytorium (57,9 KB < 80 KB).
- **Projekt powyżej budżetu** (katalog testowy z `STATE.md` na 90 KB): raport ma **3 linie** —
  suma wobec budżetu, trzy najgrubsze pozycje z progami, zdanie instrukcji. Wariant z brakującym
  nagłówkiem: **4 linie**, w tym jawne „zmierzone jako caly plik, bo nie znaleziono szukanej
  sekcji: ryzyka — wartosc jest zawyzona z tego powodu"; pozycja ma `sposob: plik-bez-sekcji`.
- **Przełącznik `wyłączony`, brak wiersza budżetu, brak `docs/USTAWIENIA.md`:** w wyjściu hooka
  **zero** trafień na słowo „budzet" (dowód negatywny), pozostałe sygnały niezmienione.
  **Wartość nierozpoznana** (`byle co`): dokładnie **jedna** linia raportu, bez liczenia.
- **Folder niebędący projektem RelAI:** oba hooki kończą się kodem **0** przy **pustym stdout**
  (0 bajtów). Projekt RelAI bez `docs/USTAWIENIA.md` daje normalny kontekst startu i **zero**
  linii o budżecie — pusty stdout dotyczy wyłącznie folderu bez markera.
- **Cursor, sesja nieinteraktywna** (`is_background_agent: true`): raport jest, a zamiast
  propozycji odchudzenia pada „Sesja nieinteraktywna: to jest sam raport, bez propozycji
  odchudzenia".
- **Naprawa siatki D-34 zmierzona na projektach testowych**, z `CLAUDE.md` odtwarzającym pułapkę
  (fraza najpierw w prozie, potem w linii z linkiem): etap `GOTOWY DO STARTU` bez pliku promptu →
  `promptGap` zwraca `{stage: "E1"}`; **dowód negatywny** — ten sam projekt z istniejącym plikiem
  promptu → `null`. Etap `W TOKU` przy `STATE.md` niewspominającym planu → `stateDrift` zwraca
  fakt rozjazdu. Przed poprawką wszystkie trzy przebiegi dawały `null`.
- Brak polskich diakrytyków w literałach obu hooków i w `startCostReport`
  (`grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` bez trafień, L-0016). `node core/tools/validate-adapters.js`
  kończy się kodem 0. `grep -rn "startCost" adapters/` pokazuje **wywołania**, nie drugą
  implementację liczenia. `core/MANIFEST.json` nadal ma `1.5.2` (dowód negatywny — wersję podbija
  E4).
- Katalogi testowe powstały poza repozytorium (`%TEMP%\relai-e1`); w repo nie ma plików
  tymczasowych.

**Świadomie odłożone:**

- **Rozpoznanie sesji nieinteraktywnej w Claude Code.** Payload `SessionStart` nie niesie żadnego
  zmierzonego rozróżnienia wobec `claude -p`; jedyny kandydat (`CLAUDE_CODE_ENTRYPOINT`) nie
  został z niczym porównany, bo pomiar `claude -p` stoi na wyczerpanym limicie konta (L-0032).
  Zamiast zgadywać, adapter Claude Code nie przekazuje opcji `interaktywna` i zachowuje się jak
  w sesji interaktywnej — funkcja rdzenia jest na to gotowa. Wraca w E2, gdzie od tego zależy
  rotacja na starcie, i w odnodze `POMIAR_ODNOG`.
- **Sekcja „Zasady aktywne" ma 49 pozycji przy limicie 15** ze `SPEC_LEKCJE.md`. Dwie nowe lekcje
  ten stan pogłębiają. Skrócenie zasad do formatu „jedna zasada = jedno zdanie" należy do E3 —
  nie ruszam go przy okazji.
- **Plan ROZWOJ_PO_WYDANIU** zostaje z niezamkniętym E7 i numerem wydania 1.6.0 w dokumentach.
  Dopóki E7 stoi, kolizja numerów nie grozi.

**Do zrobienia przez człowieka:**

- **Decyzja o zamrożeniu planu ROZWOJ_PO_WYDANIU** — Łukasz przy starcie E1: „moglibyśmy
  ewentualnie to zamrozić". Zamrożenie formalne (status planu + linia w `STATE.md`) albo jego brak
  zmienia to, co widzi start sesji. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Bez zmian: sekwencja wydania 1.6.0 po E4, ponowna instalacja pre-commita, `claude /login` na
  konto z limitem, okno na migrację JiraManagera i PolyFlow, wdrożenie D-86 przy odmrożeniu E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E2: rozbrojenie rotacji — sekcja „Czeka na człowieka" i drugie wejście na starcie

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_DZIENNIK.md` — sekcja „Czeka na człowieka"**: format pozycji (treść · data
  pierwszego wystąpienia · link do najstarszego wpisu źródłowego), nadpisywana, nigdy do archiwum,
  wyłącznie sprawy otwarte, jedna sprawa = jedna pozycja, pusta ma jawne „—". Sekcja „Do zrobienia
  przez człowieka" we wpisie dostała **zamknięte, czytane maszynowo** brzmienie adnotacji
  `*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*` wraz z regułą, że taki wpis rotacji
  już nie blokuje. Kompletny przykład na końcu specyfikacji obejmuje obie sekcje (L-0001).
- **`core/templates/SPEC_ARCHIWUM.md` — blokada zmieniła adres.** Nowa sekcja „Blokada liczy się
  z sekcji «Czeka na człowieka»" mówi wprost, co blokuje (wpis linkowany z **otwartej** pozycji),
  a co nie (wpis z pozycją wyprowadzoną albo rozstrzygniętą). Sekcja „Kiedy powstaje" opisuje
  **dwa wejścia** rotacji — zamknięcie sesji bez zmian, start sesji przy trzech warunkach naraz
  (przekroczony budżet · rotacja włączona · sesja interaktywna) — i mówi wprost, że różnią się
  wyłącznie momentem. Cztery nowe przypadki brzegowe, w tym „mniej niż dziesięć wpisów" i projekt
  sprzed 1.6.0.
- **`core/process/session-signals.js`** — `startCost` czyta drugi, niezależny przełącznik (wiersz
  `Rotacja dokumentów`) i zwraca go jako fakt `rotacja: true | false | null`. `startCostReport`
  powyżej progu: rotacja włączona → linia zaczynająca się od **„Zaproponuj rotacje"**; wyłączona
  albo nieustawiona → pół zdania o wyłączniku, bez propozycji; sesja nieinteraktywna → sam raport,
  bez propozycji i bez rotacji. Sekcja „Czeka na człowieka" wchodzi do **istniejącej** pozycji
  `ryzyka`, bo rytuał startu czyta ją razem z ryzykami — siódmej pozycji budżetu **nie ma**.
- **`adapters/claude-code/skills/relai-core/SKILL.md`** — dwie nowe sekcje: „Rotacja na starcie
  sesji" (trzy warunki, rozpoznanie po frazie z raportu hooka, zakaz w sesji nieinteraktywnej,
  zakaz automatycznego odpalenia) oraz sześciokrokowa **procedura wyprowadzenia** zastanych pozycji
  z liczeniem przed i po. Sekcja rotacji w rytuale zamknięcia dostała nowy adres blokady.
- **`adapters/cursor/rules/relai-core.mdc`** — reguły Cursora **nie mówiły ani o rotacji na
  starcie, ani o sekcji**; doszły dwa zdania po angielsku (ustawienie z 2026-08-12) plus
  poprawiona reguła blokady w rytuale zamknięcia. Warstwa zawsze-w-kontekście jest tam jedynym
  nośnikiem (L-0030).
- **Dogfooding — `docs/DZIENNIK.md` tego repozytorium**: sekcja „Czeka na człowieka" z dziewięcioma
  sprawami, każda z linkiem do najstarszego wpisu źródłowego. 34 linie źródłowe dostały adnotację
  o wyprowadzeniu, 7 kolejnych — adnotację rozstrzygnięcia, bo ich rozstrzygnięcie **jest faktem
  w repozytorium**: E5 zamknięty 2026-08-12, E6 i D-86 2026-08-17, zamknięta lista brzmień
  w 1.5.2 (L-0035), P2 zmierzone na Groku 4.6, aneks numeru wydania odrzucony 2026-08-20.
- **`docs/KOMENDY.md`** — jedna pozycja w „Czego RelAI pilnuje bez proszenia".

**Zweryfikowane — jak dokładnie:**

- **Rotacja rusza tam, gdzie dotąd stała.** Instrument `zakres.js` implementuje regułę blokady
  w **obu** wersjach i liczy zakres dla obu stanów w jednym przebiegu (L-0040). Projekt testowy:
  14 wpisów, 166 KB przy progu 150 KB. **PRZED** (reguła 1.5.2, brak sekcji): do przeniesienia
  **0 wpisów** — „pierwsza pozycja nietykalna: Etap testowy 1". **PO** (reguła 1.6.0): **2 wpisy**,
  zatrzymanie na wpisie 3. Kontrola izolująca przyczynę: ten sam materiał PO pod regułą 1.5.2 daje
  **1 wpis** (blokuje wpis 2, bo adnotacja o wyprowadzeniu jest dla niej dopiskiem spoza listy) —
  różnica bierze się z reguły, nie z materiału.
- **Dowód negatywny na blokadę:** wpis 3 ma adnotację o wyprowadzeniu we własnej sekcji, a mimo to
  **nie** został przeniesiony, bo prowadzi do niego link z otwartej pozycji sekcji. Wpis 1 —
  najstarszy, wyprowadzony i rozstrzygnięty — **został** przeniesiony.
- **Nic nie ginie, policzone skryptem na obu stanach pliku:** `inwentarz.js` na
  `git show HEAD:docs/DZIENNIK.md` i na pliku po zmianie. Przed: 60 pozycji, w tym **41 otwartych**,
  sekcja „Czeka na człowieka" BRAK. Po: 60 pozycji, **0 otwartych**, 34 z adnotacją o wyprowadzeniu,
  26 rozstrzygniętych (19 zastanych + 7 nowych), sekcja: **9 pozycji**. Mapowanie linia → sprawa
  jest jawne w `wyprowadz.js`. Archiwum dziennika sprawdzone osobno: **0 otwartych pozycji**.
- **Wszystkie 9 kotwic sekcji wskazuje istniejące nagłówki wpisów** — porównanie zbioru kotwic
  wyliczonych z nagłówków `###` ze zbiorem linków sekcji: 9 żywych, 0 martwych (L-0013).
- **Suma kontrolna zgodna w obu fazach:** `f764d1f0373d71ab` przy liczeniu z żywego pliku i po
  odczycie archiwum **z dysku** (SHA-256 po normalizacji CRLF → LF, L-0033). Żywy plik po
  przycięciu plus archiwum składają się w oryginał **znak w znak** (167 203 = 167 203); rozmiar
  166,1 → 142,3 KB.
- **Rotacja wyłączona, budżet włączony:** raport jest (4 linie), **zero trafień** na frazę
  „Zaproponuj rotacje" (dowód negatywny), pada „Rotacja dokumentow jest wylaczona albo
  nieustawiona". Brak wiersza `Rotacja dokumentów` zachowuje się tak samo — bez zgadywania (L-0025).
- **Budżet wyłączony, rotacja włączona:** w wyjściu hooka **zero trafień** na „budzet" i na
  „rotacj", a pozostały kontekst startu (1823 B) bez zmian; kod wyjścia 0.
- **Sesja nieinteraktywna zmierzona tam, gdzie sygnał istnieje** — Cursor,
  `is_background_agent: true`: raport jest, propozycji rotacji **nie ma**, pada zdanie „Sesja
  nieinteraktywna: to jest sam raport, bez propozycji odchudzenia i bez rotacji na starcie".
  Kontrola, że test nie jest pusty: ta sama konfiguracja z `is_background_agent: false` daje
  propozycję. **Dla Claude Code punkt pozostaje niewykonalny** — patrz „Świadomie odłożone".
- **Dziennik ponad progiem, mniej niż dziesięć wpisów** (6 wpisów, 175 KB): rotacja nie rusza,
  powód nazwany wprost („mniej niz 10 wpisow"), nie cisza.
- **Pozycja rozstrzygnięta znika z sekcji:** pozycja z rdzeniem z zamkniętej listy i datą przestaje
  blokować wpis; pozycja z dopiskiem **spoza** listy („w toku 2026-01-20") blokuje dalej — dowód
  negatywny (L-0035).
- **Sekcja doliczona do pomiaru:** para projektów testowych różniąca się wyłącznie obecnością
  sekcji daje pozycję `ryzyka` 1362 B vs 1486 B (+124 B). Liczba pozycji budżetu bez zmian — brak
  identyfikatora `czeka`. Projekt bez sekcji nie jest awarią.
- **Przełącznik jako fakt:** `startCost().rotacja` daje `true` / `false` / `null` dla wiersza
  włączonego, wyłączonego i nieobecnego.
- `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na obu hookach: **bez trafień** (L-0016). Raport rdzenia
  w trzech wariantach ma 5 / 4 / 3 linie — **poniżej limitu sześciu**, zero diakrytyków. Limit
  liczony na tablicy zwracanej przez `startCostReport`, nie na `stdout` hooka (L-0051).
- `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.5.2". **Dowód negatywny
  na wersję:** `core/MANIFEST.json`, `.claude-plugin/plugin.json` i marker `Wersja RelAI` nadal
  **1.5.2** — podbicie należy do E4.
- Katalogi i pliki testowe powstały poza repozytorium (`%TEMP%\relai-e2`) i zostały usunięte;
  w repozytorium nie ma plików tymczasowych.

**Świadomie odłożone:**

- **Rozpoznanie sesji nieinteraktywnej w Claude Code — nadal niewykonalne.** Payload `SessionStart`
  nie niesie zmierzonego rozróżnienia wobec `claude -p`, a jedyny kandydat
  (`CLAUDE_CODE_ENTRYPOINT`) wymaga porównania dwóch przebiegów CLI — te stoją na wyczerpanym
  limicie konta (L-0032). **Warunek wykonalności:** `claude /login` na konto z limitem, potem jeden
  przebieg `claude -p` i jeden interaktywny na tym samym projekcie. Do tego czasu adapter Claude
  Code zachowuje się jak w sesji interaktywnej, a jedynym zabezpieczeniem jest zakaz zamiany
  propozycji w automatyczne odpalenie. Punkt dopisany do odnogi `POMIAR_ODNOG`.
- **Rotacja tego dziennika.** Plik jest **poniżej progu** 150 KB, więc rotacja nie ma prawa ruszyć
  i nie rusza. Pierwsza rotacja po rozbrojeniu blokady wydarzy się sama, gdy plik urośnie; dowód,
  że rozbrojenie działa, dał projekt testowy, nie to repozytorium.
- **Odchudzenie pozycji `ryzyka` i `STATE`** — obie są ponad własnymi progami. Należy do E3 i E4.
- **Wyprowadzenie pozycji w JiraManagerze i PolyFlow** — procedura jest opisana, ale uruchamia ją
  E5, po `/relai-update` do 1.6.0.

**Do zrobienia przez człowieka:**

- **Weryfikacja siedmiu rozstrzygnięć wpisanych w tej turze** — każde ma w adnotacji swój dowód
  (zamknięty etap, decyzja, lekcja). Jeśli któreś nie odpowiada Twojej wiedzy, jedna linia to
  cofa, a sprawa wraca do sekcji „Czeka na człowieka".
  *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Pozostałe sprawy mają teraz stały adres: sekcja **„Czeka na człowieka"** na górze tego pliku,
  dziesięć pozycji otwartych. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E3: twardy kształt STATE i CLAUDE, rejestr pułapek jako osobny dokument

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_STATE.md` — twardy kształt sekcji „Nad czym pracujemy teraz".** Nowa sekcja
  specyfikacji: najwyżej **trzy pozycje**, każda jednoakapitowa, zamknięty etap **podmienia** pozycję
  zamiast dopisywać kolejną. Wypisana kolejność wypadania, gdy pozycji byłyby cztery (zamknięta →
  „Co działa"; wstrzymana → „Co blokuje"; nierozpoczęta → „Co dalej"; cztery wątki naraz → zostają
  trzy najważniejsze i pada o tym zdanie). Dwa nowe zakazy. Przykład na końcu przepisany pod nowy
  kształt (L-0001).
- **`SPEC_STATE.md` — próg zwięzłości przestał być oceną.** Wyzwalaczem zostaje liczba linii (300,
  wiersz `Rotacja dokumentów`), a **celem** przepisania jest odtąd liczba: plik ma zejść poniżej
  progu cząstkowego `STATE` z wiersza `Budżet startu sesji` (12 KB) — tego samego, który mierzy
  hook. Dwie komendy sprawdzające wpisane wprost. Zdanie o pierwszeństwie wartości projektowej
  i zdanie o jednym wyzwalaczu (L-0049).
- **`core/templates/SPEC_CLAUDE_MD.md` — limit w KB zamiast linii.** „Maksimum 60 linii" zastąpione
  progiem **10 KB** z jawnym powiązaniem z wierszem `Budżet startu sesji` i komendą sprawdzającą.
  Powód zmiany jednostki opisany w specyfikacji, nie tylko w dzienniku.
- **`SPEC_CLAUDE_MD.md` — zakaz treści odtwarzalnej z repozytorium.** Nowa sekcja z dwiema listami:
  co podpada (mapa katalogów, listy plików i modułów, wyliczenia zależności, listy komend) i co
  **nie** podpada (reguły procesu, sekcja niemutowalna, linia aktywnego planu, rytuał startu, tabela
  „Stan prac" jako drogowskazy). Granica jednym pytaniem: czy sesja odtworzy to, patrząc na
  repozytorium. Dołożona sekcja o **warunkowej** linii odsyłacza do `docs/PULAPKI.md`.
- **Cztery miejsca z martwym limitem 60 linii doprowadzone do zgodności:** `core/templates/README.md`,
  `SPEC_PROFILE.md`, `commands/relai-adopt.md`, `commands/relai-update.md`. Zostawienie ich
  oznaczałoby dwa sprzeczne limity w jednym wydaniu.
- **`core/templates/SPEC_PULAPKI.md` — nowa specyfikacja.** Rozstrzyga wprost: czym pułapka jest
  (fakt o narzędziu, kolejności kroków, środowisku), czym nie jest (tabela granic wobec `LEKCJE`,
  `DECYZJE`, `USTAWIENIA`, ryzyk i `ARCHITEKTURA`), kiedy dokument powstaje (przy pierwszej pułapce,
  nigdy na zapas) i kto go czyta (sesja **na żądanie**, dlatego poza warstwą startową). Dwa testy
  rozstrzygające granicę, format wpisu `P-NNN` (objaw / przyczyna / obejście / zasięg), statusy,
  sekcja „Nieaktualne" zamiast kasowania, sześć zakazów, kompletny przykład.
- **`docs/PULAPKI.md` w tym repozytorium — dogfooding.** Sześć pułapek narzędziowych wyprowadzonych
  z „Zasad aktywnych": `tar` na `PATH` (P-001, L-0021), sesja pomiarowa `claude -p` (P-002, L-0024),
  PowerShell 5.1 i UTF-8 (P-003, L-0027), `acceptEdits` bez `--allowedTools` (P-004, L-0028),
  restart aplikacji po `plugin update` (P-005, L-0031), `git worktree` zamiast `git archive | tar`
  (P-006, L-0039).
- **`SPEC_LEKCJE.md` — procedura wyprowadzenia pułapki.** Test rozstrzygający („czy dałoby się tego
  uniknąć, zachowując się inaczej?"), czterokrokowa procedura, zamknięte brzmienie adnotacji
  `*(przeniesione RRRR-MM-DD → docs/PULAPKI.md, P-NNN — …)*` i reguła, że wpis, który zdążył trafić
  do archiwum, **zostaje nietknięty** — bo archiwum jest kopią bajt w bajt i edycja zerwałaby jego
  sumę kontrolną.
- **Limit „Zasad aktywnych" dostał jeden adres egzekwowania** — krok 1 rytuału zamknięcia sesji,
  z komendą liczącą pozycje. Opisany w `SPEC_LEKCJE.md`, w skillu `relai-core` i w regule Cursora,
  z jawnym zakazem drugiego adresu. **Wybór uzasadniony:** raport budżetu startu odzywa się wyłącznie
  przy przekroczeniu **sumy** warstwy startowej, a to repozytorium ma 48 pozycji przy limicie 15
  i **mieści się w budżecie** — raport milczałby dokładnie tam, gdzie limit jest łamany.
- **`CLAUDE.md` tego repozytorium przepisany:** tabela „Stan prac" z 22 wierszy historii etapów do
  **pięciu wierszy-drogowskazów**, linia aktywnego planu bez ogona prozy, dołożona linia odsyłacza do
  `docs/PULAPKI.md`. Sekcja niemutowalna nietknięta.
- **`docs/STATE.md` przepisany pod nowy kształt:** „Nad czym pracujemy teraz" z siedmiu akapitów do
  **dwóch pozycji**, „Co działa" i „Co dalej" zwięźlej, liczby zaktualizowane.
- **`docs/KOMENDY.md`** — jedna pozycja w „Czego RelAI pilnuje bez proszenia" o rejestrze pułapek
  czytanym na żądanie. Bez obiecywania czegokolwiek z E4–E5 (L-0002).

**Zweryfikowane — jak dokładnie:**

- **Pomiar przed i po w jednym przebiegu** (L-0040), oba stany liczone tą samą funkcją `startCost`;
  stan „przed" to snapshot sześciu plików warstwy startowej zrobiony przed pierwszą zmianą
  merytoryczną etapu. Suma **73,4 KB → 63,8 KB** przy budżecie 80 KB. Pozycje: `CLAUDE`
  **6,5 → 3,1 KB** (próg 10 — **przeszedł**), `STATE` **14,5 → 9,3 KB** (próg 12 — **przeszedł**),
  `ryzyka` 32,1 KB bez zmian (należy do E4), `zasady` 12,4 → 11,3 KB, `ustawienia` 4,1 KB, `status`
  3,8 KB. Raport nadal milczy, bo suma jest pod budżetem.
  **Po dopisaniu tego wpisu** (12,2 KB, wchodzi do pozycji `ryzyka` jako „ostatni wpis") warstwa
  waży **69,6 KB / 80 KB** — nadal pod budżetem, raport nadal milczy. Liczba 63,8 KB opisuje stan
  po zmianach merytorycznych, a przed rytuałem zamknięcia; obie są prawdziwe i obie są tu wypisane,
  żeby następny pomiar nie wyglądał na regres.
- **Nic nie zginęło przy skracaniu `STATE.md`.** Diff usuniętych akapitów przejrzany pozycja po
  pozycji; lista niżej. Każdy fakt, który wypadł, ma dom w innym dokumencie — sprawdzone grepem, nie
  z pamięci. Jedyny konkret budzący wątpliwość, `gitCommitSha e6b41dc`, stoi we wpisie dziennika
  z 2026-08-12 (linie 414–416).
- **`CLAUDE.md` bez treści odtwarzalnej — dowód negatywny:** `grep -E` po wzorcach ze specyfikacji
  (drzewa katalogów, ścieżki `core/…`, `adapters/…`, wyliczenia trzech plików `.md` w jednej komórce,
  listy plików `.js`/`.json`) — **zero trafień**. **Sekcja niemutowalna:** `diff` fragmentu od
  nagłówka „Implementation guidelines" do końca pliku wobec `git show HEAD:CLAUDE.md` — **identyczna
  co do znaku** (L-0007).
- **„Nad czym pracujemy teraz" ma dwie pozycje** — policzone skryptem na pliku, sufit trzy.
- **`docs/PULAPKI.md` nie wchodzi do warstwy startowej — dowód negatywny:** `startCost` po założeniu
  pliku ma nadal **sześć** pozycji, żadna nie wskazuje tego pliku (wypisane ścieżki wszystkich
  sześciu). Dodatkowo `grep` po `core/process/`, `core/guardrails/`, `core/tools/` i obu hookach
  `session-context` — **zero** odwołań do `PULAPKI`.
- **Komponent warunkowy da się pominąć bez śladu** (L-0029). Dwa bliźniacze projekty testowe poza
  repozytorium, różniące się **wyłącznie** obecnością `docs/PULAPKI.md`; hook `session-context`
  uruchomiony na obu payloadem podstawionym Nodem (L-0017). Kontekst startu: **1842 B w obu
  przypadkach, identyczny bajt w bajt** po normalizacji ścieżki projektu. Słowo „PULAPKI" w kontekście
  startu: **zero trafień**. `CLAUDE.md` projektu bez pułapek: **bez linii odsyłacza**. Kontrola, że
  test nie jest pusty: kontekst ma 1842 B, nie zero.
- **Przeniesione pułapki zostawiły ślad — dowód negatywny na każdą z sześciu.** Instrument sprawdził
  jednocześnie cztery rzeczy per pozycja: zniknęła z listy „Zasad aktywnych", jest w linii zbiorczej,
  jest w `docs/PULAPKI.md`, a wpis źródłowy ma adnotację o przeniesieniu. Cztery wpisy żywe (L-0027,
  L-0028, L-0031, L-0039) mają adnotację w treści; dwa (L-0021, L-0024) mieszkają w archiwum bajt
  w bajt i ich śladem jest **wyłącznie** linia zbiorcza — archiwum celowo nietknięte. Kontrola, że
  test nie jest pusty: nieprzeniesiona L-0030 nadal jest na liście.
- **Limit „Zasad aktywnych" ma dokładnie jeden adres — dowód negatywny:** egzekwowanie znalezione
  wyłącznie w warstwie rytuału zamknięcia (skill Claude Code, reguła Cursora — jedna sesja używa
  jednej z nich), **zero** w rdzeniu i w obu hookach. Raport budżetu startu nie wspomina limitu
  pozycji ani słowem (L-0036, L-0049).
- **`SPEC_PULAPKI.md` wymieniona tam, gdzie wymieniane są pozostałe specyfikacje** —
  `core/templates/README.md`, własna tabela dokumentów warunkowych czytanych na żądanie.
  **Sprawdzone, nie założone:** `core/MANIFEST.json` **nie wylicza** specyfikacji pojedynczo — pole
  `templates` wskazuje katalog `./templates/`, więc nie ma tam czego dopisywać.
- `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.5.2".
- **Wersja nie została podbita — dowód negatywny:** `core/MANIFEST.json` 1.5.2,
  `.claude-plugin/plugin.json` 1.5.2, marker `Wersja RelAI: 1.5.2`.
- **Diakrytyki w komunikatach hooków** (L-0016): oba pliki `session-context.js` — **zero** linii
  z polskimi znakami. Sześć trafień w `core/process/session-signals.js` to wzorce **czytające**
  polskie nagłówki dokumentów, nie literały komunikatów; w tym etapie nie powstał ani jeden nowy
  komunikat hooka.
- Katalogi i pliki testowe powstały poza repozytorium (`%TEMP%\relai-e3`) i zostały usunięte.

**Lista akapitów usuniętych ze `STATE.md` i ich domy** — dowód do punktu „nic nie zginęło":

| Co wypadło | Gdzie stoi dalej |
|---|---|
| Rozwinięcie czterech scenariuszy akceptacyjnych | wpis dziennika 2026-08-10 (E10) |
| „Nowe rozstrzygnięcia po adopcji idą do `DECYZJE.md`" | `SPEC_CLAUDE_MD.md`, sekcja „Reguła rejestru decyzji po adopcji" |
| „Sprawy człowieka wychodzą do statusu planu, plan nie zamyka się bez pytania" | `SPEC_STATUS.md`, „Bramki manualne"; skill `relai-planning` |
| Naprawa `liniaAktywnegoPlanu` — siatka D-34 i detektor rozjazdu milczały | wpis dziennika 2026-08-20 (E1), L-0048 |
| Poprawka skanera 1.5.1 i dwie warstwy blokady sekretu | wpis 2026-08-17 (E6), ryzyko P1, L-0045 |
| „Brak Node.js nie usuwa guardraila po cichu", flaga `--bez-skanu` | L-0043, `adapters/cursor/README.md` |
| `gitCommitSha e6b41dc` zainstalowanej wersji | wpis dziennika 2026-08-12, linie 414–416 |
| Rozmiary dzienników JiraManagera i PolyFlow (348 / 223 KB) | ryzyko R5; `PLAN.html` planu, sekcja 3 |
| „Repozytorium publiczne — zweryfikowane 2026-08-12" (data weryfikacji) | wpis dziennika 2026-08-12 |
| Wymagane wersje pluginu dla scenariuszy rotacji (1.2.0 / 1.3.0) | `odnogi/POMIAR_ODNOG/PROMPT_ODNOGA.md` |
| Rozwinięcie nazw czterech otwartych ryzyk | tabela „Stan otwartych ryzyk" wyżej w tym pliku |
| „Dwadzieścia specyfikacji", układ katalogów rdzenia i adapterów | odtwarzalne z repozytorium — nowa reguła `SPEC_CLAUDE_MD.md` |

Przy okazji poprawiona liczba **błędna przed tym etapem**: otwartych bramek manualnych jest
**dziewięć** (5 w planie OPTYMALIZACJA_KONTEKSTU, 4 w ROZWOJ_PO_WYDANIU), a nie cztery — `STATE.md`
liczył tylko jeden plan.

**Świadomie odłożone:**

- **Przepisanie 48 zasad aktywnych do limitu 15.** Zakres etapu obejmował **adres egzekwowania**, nie
  samą kompresję — a kompresja i graduacja zmieniają treść wstecz i wymagają zgody człowieka
  (`SPEC_LEKCJE.md`). Od tej tury limit ma miejsce, w którym się o nim mówi; pierwsze zdanie pada
  w podsumowaniu tej sesji.
- **Pozycja `ryzyka` (32,1 KB przy progu 12 KB)** — najgrubsza w warstwie startowej, należy do E4.
- **Brakująca linia fraz sesji w `CLAUDE.md` tego repozytorium.** `SPEC_CLAUDE_MD.md` wymaga jej od
  1.0.0 (D-05), a tego pliku nigdy nie dotknęła. Wykryte przy przepisywaniu, **nie naprawione** —
  poza zakresem etapu, który dotyczy objętości i treści odtwarzalnej. Do rozstrzygnięcia w E4 albo
  jako drobna poprawka: jedna linia, około 200 B.
- **Rotacja tego dziennika — próg przekroczony właśnie tym wpisem.** Po dopisaniu plik ma **151,9 KB**
  przy progu 150 KB, więc rotacja **należy się** i uruchamia ją krok 2 rytuału zamknięcia sesji, nie
  rytuał „Na koniec" etapu. To będzie **pierwsza rotacja po rozbrojeniu blokady z E2** i pierwszy
  raz, gdy mechanizm zadziała na tym repozytorium, a nie na projekcie testowym — dlatego wykonuje się
  ją świadomie, przy człowieku, a nie mimochodem na końcu etapu.

**Do zrobienia przez człowieka:**

- **Zgoda na odchudzenie sekcji „Zasady aktywne" — 48 pozycji przy limicie 15.** Kompresja tematyczna
  albo graduacja do `CLAUDE.md`; obie zmieniają treść wstecz, więc bez zgody nic się nie dzieje.
  *(rozstrzygnięte 2026-08-20 — zgoda Łukasza w tej samej sesji; kompresja wykonana: 48 pozycji
  w 15 grup, 30 wpisów ze statusem ZWINIĘTA, patrz kolejny wpis)*

### 2026-08-20 — Pierwsza rotacja dziennika po rozbrojeniu blokady i kompresja „Zasad aktywnych"

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Rotacja dziennika — pierwsza w tym repozytorium po rozbrojeniu blokady z E2.** Do archiwum
  poszły dwa najstarsze wpisy z 2026-08-10 (`docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md`),
  a w żywym pliku została druga linia-odsyłacz, pod tą z 2026-08-17. Rozmiar **153,9 → 143,5 KB**
  przy progu 150 KB.
- **Zakres skończył się na trzecim wpisie i to jest zachowanie poprawne**, nie usterka: do wpisu
  „Audyt gotowości 1.0.0" prowadzi link z **otwartej** pozycji sekcji „Czeka na człowieka"
  (sekwencja wydania), a zakres rotacji jest ciągły od najstarszego. Dalej blokują kolejne wpisy
  linkowane z otwartych spraw. Rotacja przenosi tyle, ile wolno, i tyle przeniosła.
- **Kompresja sekcji „Zasady aktywne" — 48 pozycji w 15 grup tematycznych** (`SPEC_LEKCJE.md`,
  sekcja „Kompresja"), za zgodą Łukasza. Trzydzieści pełnych wpisów `L-NNNN` dostało status
  `ZWINIĘTA 2026-08-20` i przeniosło się do nowej sekcji **„Lekcje zwinięte"** na końcu pliku.
  Nic nie zostało skasowane, żaden numer nie został odzyskany.
- **Warstwa startowa: 69,6 → 63,3 KB** przy budżecie 80 KB. Pozycja `zasady` **11,8 → 4,8 KB**
  (próg 30 KB), czyli sekcja czytana przy każdym starcie sesji schudła o 60%.

**Zweryfikowane — jak dokładnie:**

- **Rotacja, faza 1:** suma kontrolna fragmentu w żywym pliku `b7307c8678b9d6b9`; ta sama suma
  policzona z treści **odczytanej z dysku** spod separatora `---` w pliku archiwum. Zgodne, więc
  faza 2 ruszyła. SHA-256, pierwsze 16 znaków, po normalizacji CRLF → LF (L-0033).
- **Żywy plik plus archiwum składają się w oryginał znak w znak.** Rekonstrukcja: żywy dziennik
  z linią-odsyłaczem podmienioną z powrotem na treść archiwum daje sumę `c50e554ef8861202` —
  identyczną z sumą pliku sprzed rotacji, przy 151 185 znakach. Kontrola, że instrument nie kłamie:
  zmiana **jednej litery** w rekonstrukcji daje inną sumę.
- **Blokada rotacji policzona z sekcji „Czeka na człowieka", nie z pojedynczych wpisów** (reguła
  1.6.0): 9 kotwic z otwartych pozycji, wszystkie trafiają w istniejące nagłówki wpisów — **zero
  martwych linków** (L-0013). Osiem wpisów oznaczonych jako nietykalne przez link, dziesięć jako
  najnowsze.
- **Kompresja nie zgubiła ani jednej zasady — dowód automatyczny:** instrument porównał zbiór
  numerów `L-NNNN` w starym destylacie (54 numery, wliczając sześć wyprowadzonych do
  `docs/PULAPKI.md`) ze zbiorem w nowym. **Zero zgubionych.** Pierwszy przebieg **zatrzymał się
  z błędem**, bo nowy destylat nie zawierał jeszcze linii zbiorczej o pułapkach — kontrola
  zadziałała, zanim cokolwiek zostało zapisane.
- **Treść zwiniętych wpisów jest nietknięta:** suma ciał wszystkich trzydziestu wpisów (bez linii
  nagłówkowych, bo w nich zmienia się status) przed i po przeniesieniu — `fff49c86c8df5741`
  w obu przypadkach.
- **Pomiar po obu operacjach:** warstwa startowa 63,3 KB / 80 KB, `zasady` 4,8 KB, `raport hooka`
  zwraca pustą tablicę (milczy). Sekcja „Zasady aktywne" ma **15 pozycji przy limicie 15** —
  pierwszy raz od 0.2.0. Dziennik 143,5 KB (próg 150), rejestr lekcji 40,1 KB / 30 wpisów
  (progi 50 KB / 40 wpisów) — oba pod progiem, więc kolejna rotacja nie rusza.
- **Instrument rotacji dwa razy podał nieprawdę, zanim podał prawdę** — obie pomyłki w generatorze
  kotwic nagłówków: zamiana pauzy `—` na myślnik zamiast usunięcia, a potem scalanie dwóch spacji
  w jeden myślnik. Każda z osobna dawała **zero trafień** w kotwice sekcji „Czeka na człowieka",
  czyli **wyciszała całą blokadę** i proponowała do archiwum dziesięć wpisów zamiast dwóch —
  w tym wpisy ze sprawami czekającymi na człowieka. Wyłapała to kontrola „kotwice bez wpisu",
  wypisana zanim cokolwiek zostało zapisane. Stąd L-0055.

**Świadomie odłożone:**

- **Pozycja `ryzyka` (36,8 KB przy progu 12 KB)** — największa w warstwie startowej, należy do E4.
  Rotacja jej nie dotyczy: sekcja „Stan otwartych ryzyk" nie jest wpisem i nigdy nie trafia do
  archiwum. Zejście z tej liczby to zadanie E4 (komórka „Mitygacja" jako stan bieżący,
  `docs/archiwum/ryzyka/`).
- **Kolejna rotacja dziennika** — ruszy sama, gdy plik wróci ponad 150 KB. Zakres będzie wtedy
  zależał od tego, ile spraw z sekcji „Czeka na człowieka" zostanie rozstrzygniętych.

**Do zrobienia przez człowieka:**

- —

### 2026-08-21 — E4: ryzyka, ustawienia i status planu jako stan bieżący, wersja 1.6.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- `SPEC_DZIENNIK.md`: komórka „Mitygacja" ma odtąd kształt **stan na dziś + odsyłacze** zamiast
  łańcucha „**data (etap):** …". Limit **800 znaków na komórkę** z komendą sprawdzającą; odsyłacz
  to data i etap **bez linku** — kotwica polskiego nagłówka waży ponad 100 znaków, czyli
  kilkanaście procent limitu, a wpisy stoją chronologicznie. Opisana kolejność przenoszenia
  zastanej narracji: sprawdź, czy wpis ją niesie → jeśli nie, przepisz do wpisu tej sesji →
  dopiero potem skracaj.
- `SPEC_ARCHIWUM.md`: nowe `docs/archiwum/ryzyka/`. Ryzyka `ZAMKNIĘTE` schodzą tą samą procedurą
  dwufazową co dziennik i lekcje. Rozstrzygnięte wprost: nazwa pliku z **datą rotacji**, nie
  zakresem numerów (zbiór bywa nieciągły, bo kryterium jest status, nie wiek); **jedna**
  linia-odsyłacz pod tabelą z wyliczeniem numerów; próg uruchomienia to próg cząstkowy `ryzyka`
  z budżetu startu, który mówi „czy jest co brać", a nie „kiedy się odezwać" — rotacja ryzyk nie
  dokłada ani jednego komunikatu (L-0049). Zdanie „sekcja ryzyk nie rotuje" zastąpione, nie obejściem.
- `SPEC_USTAWIENIA.md`: wiersz to **jedna decyzja, jednym zdaniem**; uzasadnienia i odrzucone
  warianty idą do `DECYZJE.md`. Trzy wiersze czytane maszynowo (`Profil projektu`,
  `Rotacja dokumentów`, `Budżet startu sesji`) mają jawnie zapisane wyłączenie z tej reguły — ich
  człony to składnia, nie proza, a skrócenie wyciszyłoby mechanizm.
- `SPEC_STATUS.md`: „Dziennik wdrożenia" to **jedna linia na etap**. Linia „E<N> rozpoczęty" scala
  się z linią zamknięcia i jest to jedyny nazwany wyjątek od append-only w tym pliku — ta linia
  jest znacznikiem stanu dla sesji przerwanej, nie zdarzeniem historycznym.
- **Dogfooding.** Sekcja ryzyk: sześć ryzyk `ZAMKNIĘTE` (R1, R3, R4, R6, R7, R8) przeniesione do
  `docs/archiwum/ryzyka/RYZYKA_2026-08-21.md`; cztery otwarte (R2, R5, P1, P2) przepisane na stan
  bieżący — najgrubsza komórka zeszła z 5586 do 698 znaków. `USTAWIENIA.md`: siedem wierszy
  przyciętych do decyzji, treść przeniesiona do D-61a/D-61b i do wpisu dziennika 2026-08-08.
  `STATUS.md` planu: dziennik wdrożenia z 22 linii do 7.
- **Wersja 1.6.0** w czterech miejscach: `core/MANIFEST.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, marker `Wersja RelAI`. Do tego trzy miejsca, które mówią
  o wersji człowiekowi: `CLAUDE.md`, `README.md`, `adapters/cursor/README.md`.
- `docs/KOMENDY.md`: jedna linia o tym, że zamknięte ryzyka schodzą do archiwum.
- **Warstwa nośna reguły** (zasada 8): rotacja ryzyk dopisana do rytuału zamknięcia w skillu
  `relai-core` i do reguły `relai-core.mdc` adaptera Cursora — reguła żyjąca wyłącznie
  w specyfikacji nie wykonuje się sama.
- **Poza pierwotnym zakresem, za zgodą użytkownika:** naprawiony defekt CRLF w
  `core/process/session-signals.js` — patrz „Zweryfikowane".

**Zweryfikowane — jak dokładnie:**

- **Pomiar przed i po w jednym przebiegu** (L-0040), stan „przed" z `git worktree` na HEAD (P-006):
  pozycja `ryzyka` **28,5 → 10,5 KB przy progu 12 KB**, suma warstwy startowej **55,7 → 34,7 KB**
  przy budżecie 80 KB. `startCostReport` zwraca pustą tablicę — raport milczy, tak jak przed etapem.
  Uwaga do liczby „przed": worktree wypisuje pliki z CRLF, więc zawiera ~1,7 KB znaków CR; pomiar
  tego samego stanu na LF dał 28,4 KB.
- **Ta sama pozycja po dopisaniu tego wpisu: 14,1 KB, czyli 2,1 KB ponad progiem** — i to nie jest
  regres, tylko konstrukcja pomiaru. Pozycja `ryzyka` obejmuje trzy rzeczy: **sekcję ryzyk 3,7 KB**
  (przed etapem 21,4 KB), sekcję „Czeka na człowieka" 2,5 KB i **ostatni wpis dziennika 7,9 KB** —
  a ostatnim wpisem jest ten. Etap, którego zakresem jest odchudzanie, zamyka się grubym wpisem
  z dowodami i chwilowo sam przekracza próg; następny wpis, o zwykłej wielkości, sprowadzi pozycję
  poniżej 12 KB bez niczyjej pracy. Suma warstwy startowej **39,4 KB / 80 KB** — mieści się,
  raport milczy.
- **Defekt rdzenia znaleziony przy tym pomiarze i naprawiony.** Wzorzec `/^(#{1,6})\s+(.*)$/`
  w `wytnijSekcje` nie dopasowywał **żadnego** nagłówka przy końcach linii CRLF, bo kropka w JS nie
  obejmuje `\r`, a `$` bez flagi `m` wymaga końca stringa; wzorzec wykrywający koniec sekcji `$` nie
  ma, więc mechanizm nie padał, tylko po cichu mierzył **cały plik**. Skutek na worktree tego repo:
  213,8 KB zamiast 55,7 KB, dwie pozycje naraz (`ryzyka`, `zasady`). Dowód poprawki: ten sam
  projekt próbny w dwóch wariantach końca linii, jeden przebieg — `bezSekcji` puste w obu, różnica
  13 B równa liczbie linii sekcji. Kontrola negatywna: projekt z celowo zmienionym nagłówkiem nadal
  raportuje `bezSekcji: ["ryzyka"]`, więc instrument nie jest ślepo pozytywny.
- **Nic nie zginęło:** suma kontrolna przeniesionej treści zgodna w obu fazach
  (`4b370c3e2b31c6ba`); każdy z sześciu wierszy archiwum występuje w `HEAD` **znak w znak**;
  numery z żywej tabeli plus numery z archiwum dają komplet z `HEAD`
  (`R1,R2,R3,R4,R5,R6,R7,P1,P2,R8`).
- **Numery nieodzyskane — dowód negatywny:** żaden z sześciu zarchiwizowanych numerów nie występuje
  w żywej tabeli jako wiersz, a wszystkie sześć jest widocznych w linii-odsyłaczu (6/6).
- **Wiersze czytane maszynowo działają dalej — dowód negatywny na wszystkich trzech:** `startCost`
  zwraca ten sam budżet (81920 B) i te same progi przed i po; `startCost().rotacja` = `true` przed
  i po; wiersz `Profil projektu` daje ten sam werdykt co przed etapem — wartość spoza zamkniętej
  listy, więc hooki profilu milczą, i milczały tak samo wcześniej.
- **Wersja:** `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.6.0"; marker
  w `docs/USTAWIENIA.md` to 1.6.0. `grep -rn "1\.5\.2"` — wszystkie pozostałe trafienia rozstrzygnięte
  jako historyczne: wpisy dziennika, lekcja L-0055, zamrożony `PLAN.html` (D-33), prompty etapowe
  E1–E4, `PROMPT_ODNOGA.md` odnogi GUARD_PO_SCIEZCE oraz zdania „do 1.5.2 / od 1.5.2" w pięciu
  specyfikacjach, opisujące poprzednią wersję reguły.
- **Rotacja ryzyk ma jeden wyzwalacz — dowód negatywny:** projekt próbny z budżetem 10 KB, ryzykiem
  zamkniętym na 14 KB i przekroczoną sumą dostaje **jeden** raport (4 linie, limit 6) z jedną
  wzmianką o rotacji. Rotacja ryzyk nie dokłada drugiego komunikatu.
- **Limit komórki:** komenda ze specyfikacji, uruchomiona dosłownie, zwraca `0 komorek ponad
  limitem 800`. Najgrubsza komórka po etapie: R5, 698 znaków.
- **Cztery zmienione specyfikacje kończą się kompletnym przykładem** obejmującym nowy kształt
  (L-0001) — sprawdzone skryptem na markerach: nowa komórka i linia-odsyłacz w `SPEC_DZIENNIK`,
  pełny plik archiwum ryzyk plus żywa tabela w `SPEC_ARCHIWUM`, wiersz z odsyłaczem `D-58`
  w `SPEC_USTAWIENIA`, dziennik wdrożenia z jedną linią na etap w `SPEC_STATUS`.
- **Nie sprawdzono:** rotacja ryzyk nie została wykonana przez świeżą sesję z rytuału zamknięcia —
  w tym etapie wykonał ją skrypt prowadzony ręcznie, według tej samej procedury dwufazowej.
  Zachowanie mechanizmu w świeżej sesji czeka w odnodze `POMIAR_ODNOG`, razem z pozostałymi
  scenariuszami.
- **Komunikaty hooków:** w tym etapie nie powstał żaden nowy komunikat hooka. Trafienia
  `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` w `session-signals.js` to wyłącznie wzorce dopasowania
  i komentarze, nie treść komunikatów.

**Świadomie odłożone:**

- **Wykonanie sekwencji wydania 1.6.0** (push → `plugin marketplace update` → `plugin update` →
  restart). Zakres etapu mówi wprost, że to bramka człowieka; repozytorium jest gotowe.
- **`komorkaDecyzji` w rdzeniu dzieli komórki naiwnym `split('|')`** — ten sam defekt, co
  w L-0056. Dziś nie szkodzi, bo w wierszach czytanych maszynowo nie ma escapowanych separatorów,
  a wartość i tak jest kotwiczona od początku komórki. Nie ruszam poza zakresem; do rozstrzygnięcia
  przy najbliższej pracy nad rdzeniem.
- **Numer `PROMPT_ODNOGA.md` odnogi GUARD_PO_SCIEZCE zostaje na 1.5.2** — prompty są zamrożone
  w chwili wygenerowania, tak samo jak prompty etapowe. Sesja wykonująca odnogę zobaczy realny
  stan repozytorium, nie ten opis.

**Do zrobienia przez człowieka:**

- Sekwencja wydania 1.6.0 — bez niej poprawki tego etapu, łącznie z naprawą CRLF, nie działają
  w żadnym innym projekcie. *(rozstrzygnięte 2026-08-21 — sekwencja wykonana w całości, restart
  potwierdzony pomiarem: cache pluginu 1.6.0, kopia specyfikacji odświeżona, raport budżetu milczy)*

### 2026-08-21 — Wydanie 1.6.0: push i aktualizacja pluginu, zostaje restart

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- Commit `9ac3d78` z całością E4 (21 plików) wypchnięty na `main`.
- `claude plugin marketplace update relai` — cache marketplace odświeżony.
- `claude plugin update relai@relai` — plugin podniesiony z 1.5.2 do 1.6.0 w scope `user`.

**Zweryfikowane — jak dokładnie:**

- **Wersja potwierdzona plikiem instalacji, nie komunikatem CLI** (zasada 10):
  `~/.claude/plugins/installed_plugins.json` → `plugins."relai@relai"` ma `version 1.6.0`,
  `installPath` na katalogu `…\cache\relai\relai\1.6.0`, `gitCommitSha 9ac3d78` — ten sam commit,
  który przed chwilą poszedł na zdalne. `lastUpdated 2026-08-21T06:58:39Z`.
- **Pierwsza próba aktualizacji nie przeszła:** `claude plugin update relai` zwróciło
  `Plugin "relai" not found`. Nazwą rozpoznawaną jest **`relai@relai`** (nazwa pluginu plus
  marketplace), widoczna w `claude plugin list`. Sama nazwa pluginu nie wystarcza, mimo że
  `plugin marketplace update relai` przyjmuje ją bez zastrzeżeń.
- **Zastana wersja była inna, niż mówiły dokumenty.** `claude plugin list` pokazał 1.5.2, podczas
  gdy `docs/STATE.md` twierdził, że globalnie stoi 1.1.0. Liczba w STATE była nieaktualna od
  wydania 1.5.2 (2026-08-17, sekwencja wykonana przez człowieka i odnotowana we wpisie z 2026-08-18,
  ale bez poprawienia STATE). Poprawione.
- **Ostrzeżenia gita przy commicie potwierdziły defekt naprawiony w E4:** 21 razy „LF will be
  replaced by CRLF the next time Git touches it". To repozytorium ma `core.autocrlf` włączone, więc
  każdy jego checkout niesie CRLF — a pomiar warstwy startowej do wczoraj takiego pliku nie umiał
  policzyć i po cichu mierzył całość.
- **Nie sprawdzono:** czy aplikacja realnie wczytuje 1.6.0 — wymaga restartu (P-005). Do tego czasu
  ta sesja pracuje na kodzie 1.5.2, łącznie z hookiem mierzącym start.

**Świadomie odłożone:**

- Weryfikacja wczytania nowego układu katalogów pluginu w aplikacji — wraca w pierwszej sesji po
  restarcie, razem z potwierdzeniem bramki wydania.

**Do zrobienia przez człowieka:**

- **Restart aplikacji**, a po nim jedno spojrzenie na start sesji: czy hook budżetu milczy (powinien
  — 41,4 KB przy budżecie 80 KB) i czy komendy oraz skille wczytują się z nowego układu katalogów.
  Dopiero to zamyka bramkę wydania i odblokowuje E5.
  *(rozstrzygnięte 2026-08-21 — restart wykonany, oba warunki sprawdzone; patrz wpis „Restart
  potwierdzony")*

### 2026-08-21 — Restart potwierdzony: 1.6.0 działa, bramka wydania zamknięta

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- Zamknięta bramka manualna „Sekwencja wydania 1.6.0" w `STATUS.md` planu — czwarty krok (restart)
  wykonany przez człowieka, całość potwierdzona pomiarem.
- Pozycja o restarcie usunięta z sekcji „Czeka na człowieka"; adnotacje o rozstrzygnięciu dopisane
  przy obu pozycjach źródłowych we wpisach z tego dnia.
- `docs/STATE.md`: wersja zainstalowana i wydanie przeniesione z „co blokuje" do „co działa";
  E5 opisany jako odblokowany, z kolejnością projektów.

**Zweryfikowane — jak dokładnie:**

- **Kopia specyfikacji w projekcie odświeżona przez hook nowej wersji** — 22 pliki `.md`
  w `.claude/relai/templates/` mają sumy kontrolne **zgodne co do bajta** z `core/templates/`
  (normalizacja CRLF → LF). To jest dowód mocny, bo na starcie pracy nad E4 sześć z dziewięciu
  sprawdzanych plików **różniło się** — cache pochodził wtedy z wersji 1.1.0. Hook startu tej sesji
  zameldował 31 plików zamiast wcześniejszych 30.
- **Nowy układ katalogów wczytany** — `…\.claude\plugins\cache\relai\relai\1.6.0` zawiera
  `adapters/claude-code/skills` (2), `commands` (10), `hooks` (11) i `core/templates` (23);
  `core/MANIFEST.json` w cache'u ma `version 1.6.0`. To domyka pozycję, która od 2026-08-17 czekała
  w „Co blokuje" jako „realne wczytanie potwierdzi dopiero pierwsza sesja po restarcie".
- **Raport budżetu milczy, zgodnie z regułą** — `startCostReport` zwraca pustą tablicę przy warstwie
  **35,7 KB / 80 KB** i **zerowej** liczbie pozycji ponad własnym progiem. Pozycja `ryzyka` zeszła
  z 14,1 KB do **8,7 KB**, dokładnie tak, jak zapowiedziano we wpisie E4: przestała nią być treść
  grubego wpisu zamykającego etap.
- **Nie sprawdzono:** zachowania hooka i rotacji w sesji nieinteraktywnej po tej aktualizacji —
  wymaga `claude -p`, a to czeka na `claude /login` (L-0032, odnoga `POMIAR_ODNOG`).

**Świadomie odłożone:**

- Kasowanie siedemnastu starych katalogów w cache'u pluginu (`0.1.0` … `1.5.2`). Zajmują miejsce,
  ale niczego nie psują, a kasowanie cudzego cache'u nie jest pracą tego projektu.

**Do zrobienia przez człowieka:**

- —

### 2026-08-21 — E5: PolyFlow na 1.6.1, pierwsza rotacja w cudzym projekcie, wydanie 1.6.1

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **PolyFlow zmigrowany z 1.5.2 na 1.6.1.** Backup jako bramka, `/relai-update` z pokazanym diffem,
  wyprowadzenie 109 otwartych linii do sekcji „Czeka na człowieka" (27 spraw), pierwsza rotacja
  dziennika i ryzyk w historii tamtego projektu, `STATE.md` 29,6 → 11,7 KB, `CLAUDE.md`
  15,1 → 7,4 KB, raport migracji z drogą pełnego powrotu. Warstwa startowa **155,7 → 136,4 KB**.
- **Zakres etapu zawężony do PolyFlow** decyzją Łukasza — JiraManager jest w ciągłym rozwoju, więc
  nie został dotknięty ani razu.
- **Poprawiona wersja docelowa w `/relai-update` i wydanie 1.6.1.** Komenda w wydanej wersji 1.6.0
  deklarowała **1.5.0** w czterech miejscach, w tym w wierszu „marker wersji" — uruchomiona
  dosłownie **cofnęłaby** wersję migrowanego projektu. Ten sam ślad był w nagłówkach obu skilli,
  w `SPEC_KOMENDY.md` (nagłówek generowanego `KOMENDY.md`), w `SPEC_USTAWIENIA.md`
  i `SPEC_RAPORT_ADOPCJI.md` (przykłady markera) oraz w `relai-core/SKILL.md` (marker przy
  inicjalizacji nowego projektu). Rozszerzenie zakresu za zgodą Łukasza.
- **`/relai-update` dostała dwa brakujące wiersze inwentaryzacji** — wiersz `Budżet startu sesji`
  i sekcję „Czeka na człowieka". Bez nich komenda „aktualizująca do 1.6.x" nie wnosiła tego, co
  1.6.0 wniosło; specyfikacja mówiła wprost, że wiersz budżetu powstaje właśnie przy `/relai-update`.
- Odnoga **BLOKADA_ROTACJI** założona (karta + prompt świeżej sesji).

**Zweryfikowane — jak dokładnie:**

- **Backup przed pierwszą zmianą w PolyFlow:** `PolyFlow_2026-08-21_1542.zip`, 54,0 MB, nagłówek
  `50 4b 03 04`, 2330 wpisów; zero trafień na dwanaście wzorców sekretów i na `venv/`, `release/`,
  `__pycache__/`, `*.log`; kontrola pozytywna na `.git/`, `docs/DZIENNIK.md`, `polyflow/src/`.
- **Pomiar przed i po w jednym przebiegu** (L-0040), funkcją `startCost` rdzenia; stan „przed"
  odtworzony z `HEAD` PolyFlow do katalogu tymczasowego, bo na żywym projekcie sprzed migracji
  funkcja zwracała `null` (brak wiersza budżetu). Wynik: `CLAUDE` 14,9 → 7,4 KB, `STATE`
  29,6 → 11,7 KB, `ryzyka` 59,4 → **65,3 KB**, `zasady` i `ustawienia` bez zmian; suma
  **155,7 → 136,4 KB** (−12,4%), ≈48 → ≈42 tys. tokenów `SZACUNEK`.
- **Dlaczego pozycja ryzyk urosła — rozbite na składniki:** sekcja ryzyk 55,8 → 50,6 KB, nowa
  sekcja „Czeka na człowieka" +8,1 KB, „ostatni wpis" 3,6 → 6,6 KB. Ten ostatni składnik urósł
  **z powodu defektu rdzenia** (L-0062).
- **Nic nie zginęło w rotacjach:** dziennik — suma `3cb689e9c62b00d7` zgodna między żywym plikiem
  a archiwum odczytanym z dysku, 92 + 5 = 97 wpisów; ryzyka — suma `4c5a757191d58c14`, 46 + 6 = 52
  wiersze, dowód negatywny na każdym przeniesionym numerze i kontrola pozytywna na R1, R4, R6, R50.
- **Wyprowadzenie policzone w obie strony:** przed — 109 otwartych linii, **0 bez przypisania**
  (44 do spraw, 8 zbiorczych, 57 rozstrzygnięć z dowodem); po — **0 otwartych linii** i tyle samo
  spraw, ile wyszło z deduplikacji. Wszystkie linki sekcji trafiają w istniejący nagłówek;
  generator kotwic sprawdzony **na działającym linku z dziennika RelAI**, zanim policzył cudze.
- **Cudza treść w `CLAUDE.md` PolyFlow nietknięta:** sekcje „Zasady projektu (odziedziczone)",
  „Implementation guidelines" i „Reguły profilu (app)" mają po skróceniu te same sumy kontrolne
  (`927e998fb38d50e4`, `1a97fedc0dda819a`, `940e0879f7614f49`).
- **Komendy drogi powrotu uruchomione w tej formie, w jakiej stoją w raporcie** (L-0059) — cztery
  z czterech działają; `git ls-files` potwierdza, że katalogów `docs/archiwum/dziennik` i `ryzyka`
  w `HEAD` nie ma, więc krok „usuń je przy powrocie" ma sens.
- **Po podbiciu na 1.6.1:** `node core/tools/validate-adapters.js` kończy się kodem 0 („3 zrodel,
  wartosc 1.6.1"), a grep po `1.5.x` i `1.6.0` zostawia wyłącznie wzmianki historyczne
  („od 1.5.0…", „do 1.5.2…") — każde trafienie rozstrzygnięte pojedynczo.
- **Nie sprawdzono:** zachowania budżetu i rotacji w **świeżej sesji** PolyFlow — wymaga sesji
  pomiarowej z CLI, a ta czeka na `claude /login` (L-0032, odnoga `POMIAR_ODNOG`). Nie sprawdzono
  też poprawionej `/relai-update` **z cache'u pluginu** — migrację poprowadziła treść
  z repozytorium, bo 1.6.1 nie jest jeszcze wydana.

**Świadomie odłożone:**

- **`docs/USTAWIENIA.md` PolyFlow waży 20,9 KB przy progu 6 KB.** Przepisanie tabeli wg reguły
  „wiersz to jedna decyzja" jest pracą na treści tamtego projektu i nie mieściło się w zakresie E5.
- **Walidator spójności nie widzi numerów wersji w treści komend i specyfikacji** — porównuje trzy
  manifesty. Rozszerzenie go to kandydat na osobny wątek, nie na trzecie rozszerzenie tego etapu.
- **Kolizja numeru R50 w PolyFlow** (dwa różne ryzyka o tym samym numerze) — wpisana jako sprawa
  w tamtym projekcie; numeracja ryzyk jest jego treścią, nie warstwą RelAI.

**Do zrobienia przez człowieka:**

- **Sekwencja wydania 1.6.1:** push → `claude plugin marketplace update` → `claude plugin update
  relai@relai` → **restart aplikacji** (P-005). Do tego czasu cache pluginu niesie `/relai-update`
  z wersją docelową 1.5.0.
- **R5 zostaje otwarte** — jeden zmigrowany projekt nie jest dowodem dla ryzyka „dokumenty puchną
  i zjadają kontekst". JiraManager czeka na decyzję o oknie migracji.
  *(rozstrzygnięte 2026-09-01 — JiraManager przeszedł adopcję poza sesjami tego repozytorium,
  pozycja zamknięta; R5 zostaje otwarte, bo pomiaru startu po tamtej migracji tutaj nie ma)*

### 2026-08-21 — Plan OPTYMALIZACJA_KONTEKSTU zamknięty: dowiezione vs plan

Autor: RelAI (Opus 5) + Lukasz

**Zrobione — dowiezione vs plan:**

Plan powstał 2026-08-20 z jednego pomiaru: start sesji w trzech projektach kosztował 90 KB (tutaj),
155 KB (PolyFlow) i 386 KB (JiraManager), a limity ze specyfikacji nie były przez nikogo mierzone.
Pięć etapów, wszystkie zamknięte.

| Etap | Co miało powstać | Co powstało |
|---|---|---|
| E1 | miara warstwy startowej i budżet | `startCost` w rdzeniu, wpięty w hook obu adapterów; raport milczy poniżej budżetu **dowiezione** |
| E2 | rozbrojenie rotacji | sekcja „Czeka na człowieka" jako jedyny adres blokady, drugie wejście rotacji na starcie **dowiezione** |
| E3 | `STATE.md` i `CLAUDE.md` pod budżetem | twardy kształt obu, rejestr pułapek poza warstwą startową; 73,4 → 63,8 KB **dowiezione** |
| E4 | ryzyka, ustawienia, status planu | stan bieżący zamiast kroniki, archiwum ryzyk zamkniętych; sekcja ryzyk 21,4 → 3,7 KB **dowiezione** |
| E5 | migracja **JiraManagera i PolyFlow** | **PolyFlow** zmigrowany (155,7 → 136,4 KB); **JiraManager nietknięty** — wyłączony decyzją właściciela jako projekt w ciągłym rozwoju **dowiezione w połowie** |

**Co przepadło i dlaczego.** Cel planu brzmiał „dwa żywe projekty schodzą do budżetu" i nie został
osiągnięty w żadnej z dwóch części. JiraManager nie wszedł do zakresu w ogóle. PolyFlow wszedł, ale
zatrzymał się na **136,4 KB przy budżecie 80 KB**: rotacja przeniosła 5 wpisów z 97 (blokada na
najstarszym wpisie — odnoga BLOKADA_ROTACJI), sekcja „Zasady aktywne" ma tam 70 pozycji przy
limicie 15, a tabela ustawień 20,9 KB przy progu 6 KB — obie czekają na decyzje właściciela
tamtego projektu. **Ryzyko R5 zostaje otwarte** i to jest uczciwy zapis stanu: mechanizm jest
kompletny i zmierzony, ale problem, dla którego powstał, jest rozwiązany w jednym projekcie z trzech.

**Co dowiózł ten plan ponad zakres:** wydanie **1.6.1** z poprawką `/relai-update`, która w wydanej
1.6.0 deklarowała wersję docelową 1.5.0 i cofnęłaby wersję migrowanego projektu.

**Zweryfikowane — jak dokładnie:**

- **Cztery otwarte bramki manualne rozstrzygnięte z Łukaszem przed zamknięciem planu**, każda
  z zapisem w `STATUS.md`: zamrożenie planu ROZWOJ_PO_WYDANIU (wykonane — status planu
  `ZAMROŻONY 2026-08-21` z powodem), okno migracji (zamknięte częściowo, JiraManager przechodzi do
  `STATE.md`), próg 30 KB na „Zasady aktywne" (zostaje — pomiar z E5: RelAI 6,5 KB, PolyFlow
  31,0 KB), weryfikacja 26 rozstrzygnięć z E2 (potwierdzona w całości).
- **Odnoga BLOKADA_ROTACJI przeniesiona do `docs/fixy/`** przed archiwizacją planu — sumy kontrolne
  obu plików zgodne przed usunięciem oryginału (`4124a7835db76621`, `5c33f96aa5dfc387`); karta
  i prompt przepisane na wariant samodzielny.
- **Folder planu przeniesiony do `docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/`** — 7 plików,
  sumy kontrolne porównane parami przed usunięciem oryginału.
- **Warstwa startowa tego repozytorium po zamknięciu planu: 35,1 KB / 80 KB**, żadna pozycja ponad
  własnym progiem; pozycja `status` wypadła z pomiaru, bo aktywnego planu nie ma — a nie dlatego,
  że zostawiono martwy link. Rozjazd stanu: brak (`stateDrift` zwraca `null`).

**Świadomie odłożone:**

- **JiraManager (386 KB startu) czeka na okno migracji** — jest w `STATE.md`, nie w archiwum planu.
- **Trzy rzeczy blokujące zejście PolyFlow do budżetu** żyją w jego własnej sekcji „Czeka na
  człowieka" (27 spraw), a nie w dokumentach RelAI.

**Do zrobienia przez człowieka:**

- **Sekwencja wydania 1.6.1** — push → `plugin marketplace update` → `plugin update` → restart
  (P-005). Bez niej cache pluginu niesie `/relai-update` z wersją docelową 1.5.0.
- **Decyzja o oknie migracji JiraManagera** — dopóki jej nie ma, R5 zostaje otwarte.
  *(rozstrzygnięte 2026-09-01 — okno nie jest już potrzebne: adopcja odbyła się poza sesjami tego
  repozytorium)*

### 2026-08-21 — Projekt RelAI zaktualizowany do 1.6.1, profil wreszcie czytany maszynowo

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- `/relai-update` po restarcie aplikacji: struktura projektu **1.6.0 → 1.6.1**. Dogfooding —
  komenda poprawiona kilka godzin wcześniej w E5 przeszła tu pierwszy raz w wersji wydanej.
- **Wiersz `Profil projektu` doprowadzony do wartości czytanej maszynowo.** Od inicjalizacji
  (2026-08-07) stało w nim `Narzędzie/plugin (odpowiednik profilu „prompty/artefakty"…)` — opis,
  a nie wartość z zamkniętej listy. Kotwica maszynowa go nie czytała, więc **reguły profilu były
  w tym projekcie wyciszone przez cały czas jego budowy**. Nowa wartość: `prompty`, wybór Łukasza;
  stary wiersz zszedł do „Ustawień wycofanych" z powodem (D-18).
- `CLAUDE.md` dostał **linię fraz sesji** pod listą rytuału startu oraz sekcję
  **„Reguły profilu (prompty)"** wg `SPEC_PROFILE.md`. Obie warstwy działają bez wyzwalania skilla
  (R2, L-0030) — dotąd trzy frazy naturalne trzymały się w tym projekcie wyłącznie na skillu.
- `docs/KOMENDY.md`: nagłówek `RelAI 1.5.0` → `RelAI 1.6.1`.
- Marker `Wersja RelAI` podbity **na końcu**, po wykonaniu zmian.

**Zweryfikowane — jak dokładnie:**

- **Kotwica maszynowa trafia:** komórka `Profil projektu` zaczyna się od `prompty`, wzorzec
  `^(app|agent-voice|flow|prompty)\b` dopasowuje. Przed zmianą nie dopasowywał — to jest cała
  różnica między regułą działającą a wyciszoną.
- `CLAUDE.md` **3,8 KB** przy progu 10 KB po dołożeniu dwóch sekcji; warstwa startowa
  **34,7 KB / 80 KB**, żadna pozycja ponad własnym progiem.
- **Korekta wcześniejszego ustalenia z tej samej sesji:** przy inwentaryzacji zgłosiłem brak opisu
  rotacji w `KOMENDY.md`. Był błędny — rotacja jest tam opisana (efektem, nie nazwą mechanizmu,
  zgodnie z zakazem opisywania mechaniki w `SPEC_KOMENDY.md`). Mój instrument szukał słowa
  „rotacja"; dokument użytkownika celowo go nie używa. Do `KOMENDY.md` weszła wyłącznie zmiana
  numeru wersji.
- **Nadpisań lokalnych nie ma i nic ich nie dotknęło:** `docs/zasoby/HTML_PLAN/` nie istnieje,
  w `KOMENDY.md` zero wierszy oznaczonych jako lokalne. Wiersze `Rotacja dokumentów`
  i `Budżet startu sesji` — oba z własnymi progami projektu — zostały nietknięte (R6).

**Świadomie odłożone:**

- **Dokumentu `docs/ARTEFAKTY.md` nie zakładam.** Profil `prompty` tworzy go przy **pierwszym
  artefakcie**, a nie przy zmianie wiersza w ustawieniach — warunkowe znaczy warunkowe (D-10).
  W praktyce ten projekt ma artefakty od dawna (31 specyfikacji, dziesięć komend, dwa skille), więc
  rejestr jest kandydatem na osobny wątek, nie na skutek uboczny aktualizacji.

**Do zrobienia przez człowieka:**

- —

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

- **Odnoga [REJESTR_ARTEFAKTOW](plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
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

- **Odnoga [REJESTR_ARTEFAKTOW](plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md)** —
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
  [STATUS.md](plany/HIGIENA_DOKUMENTOW/STATUS.md) planu HIGIENA_DOKUMENTOW zaktualizowana. Tabeli
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
