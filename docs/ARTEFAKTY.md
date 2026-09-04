# ARTEFAKTY — rejestr wersji

Rejestr wymagany przez profil projektu `prompty` (`USTAWIENIA.md`, 2026-08-21). Odpowiada na pytanie
**„po co"**: jaki problem miała naprawić dana wersja artefaktu. Na pytanie „co się działo"
odpowiada [DZIENNIK.md](DZIENNIK.md), na „jak wygląda różnica treści" — `git log -p <plik>`.

**Artefakt** w tym repozytorium to plik czytany przez model albo przez człowieka jako instrukcja:
specyfikacja dokumentu, komenda, skill, reguła adaptera, szablon planu. Hooki, guardraile
i walidator są **nośnikiem**, nie artefaktem — do rejestru nie wchodzą.

## Zasady prowadzenia

- Każda zmiana artefaktu podbija jego **wersję** i dopisuje wiersz: co się zmieniło i po co.
- Poprzednia wersja zostaje — w historii gita albo jako datowana kopia w archiwum. Nigdy ciche
  nadpisanie (D-18).
- Wersja jest liczbą całkowitą rosnącą; `1` to wpis startowy rejestru.

## Punkt startowy (2026-09-01)

**Rejestr zaczyna liczyć od dziś.** Historii wersji sprzed tej daty nie odtwarzam — 38 artefaktów
poniżej dostaje wersję `1` niezależnie od tego, ile razy realnie się zmieniało. Kolumna `Data`
niesie **datę pojawienia się pliku w repozytorium** (`git log --diff-filter=A --follow`), a nie datę
założenia rejestru; kolumna `Co się zmieniło` dla wpisu startowego podaje datę ostatniej zmiany
z gita, żeby było widać, które artefakty żyją. Pełna historia treści jest w gicie.

## Specyfikacje dokumentów — `core/templates/` (22)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Przewodnik po specyfikacjach | `core/templates/README.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Mówi, że pliki obok **nie są szablonami do skopiowania**, tylko instrukcjami generacji dla modelu (D-60) — bez tego adapter kopiowałby specyfikację do projektu użytkownika |
| Specyfikacja `ARCHITEKTURA.md` | `core/templates/SPEC_ARCHITEKTURA.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Opis granic, przepływu i powodów dla kogoś, kto wejdzie w kod — czyli tego, czego z kodu nie widać |
| Specyfikacja archiwum | `core/templates/SPEC_ARCHIWUM.md` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-09-01 | Procedura rotacji dwufazowej z sumą kontrolną: historia schodzi z żywego dokumentu bajt w bajt, zamiast być streszczana albo kasowana |
| Specyfikacja `CLAUDE.md` | `core/templates/SPEC_CLAUDE_MD.md` | 2 | 2026-08-07 | 2026-09-03: linia fraz sesji wymienia **sprzątanie artefaktów roboczych** w rozwinięciu „kończymy na dziś" (oba miejsca: brzmienie wzorcowe i przykład) | `CLAUDE.md` jest jedyną warstwą obecną w każdej sesji, więc krok rytuału nienazwany tam nie wykona się przy modelu, który nie wyzwolił skilla (R2, L-0030) |
| Specyfikacja `DECYZJE.md` | `core/templates/SPEC_DECYZJE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Rejestr rozstrzygnięć zamrożonych, żeby ten sam temat nie wracał co dwie sesje |
| Specyfikacja `DESIGN.md` | `core/templates/SPEC_DESIGN.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Umowa o wyglądzie spisana raz i egzekwowana przy każdej zmianie interfejsu |
| Specyfikacja `DZIENNIK.md` | `core/templates/SPEC_DZIENNIK.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-09-01 | Pamięć między sesjami: co się wydarzyło, co sprawdzono i jak, co czeka na człowieka |
| Specyfikacja `KOMENDY.md` | `core/templates/SPEC_KOMENDY.md` | 2 | 2026-08-07 | 2026-09-03: zakres wersji 1.8.0 — jedenasta komenda `/relai-clean` w wymaganej tabeli, dwa punkty listy „co działa" (komenda i zachowanie automatyczne), punkt w przykładowej sekcji zachowań, przykład przepisany na 1.8.0 | Jedyne źródło prawdy o komendach i frazach w projekcie — `/relai-help` prezentuje ten plik, nie duplikuje go (D-07); bez wiersza w specyfikacji regeneracja `KOMENDY.md` gubiłaby jedenastą komendę |
| Specyfikacja `LEKCJE.md` | `core/templates/SPEC_LEKCJE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Korekty użytkownika zamienione w zasady, z twardym limitem 15 pozycji sekcji „Zasady aktywne" |
| Specyfikacja odnogi | `core/templates/SPEC_ODNOGA.md` | 2 | 2026-08-12 | 2026-09-03: sekcja „Zakres i weryfikacja" `PROMPT_ODNOGA.md` otwiera się **katalogiem roboczym odnogi**, rytuał zamknięcia dostaje krok `2a` (raport → „tak" → kasowanie, liczby do wpisu), oba przykłady przepisane | Boczny wątek dostaje kartę i samowystarczalny prompt, zamiast rozdymać etap albo zginąć — a jego pliki robocze mają adres, zanim powstaną |
| Specyfikacja `PLAN.md` | `core/templates/SPEC_PLAN.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Dokument decyzyjny „robimy / nie robimy / robimy inaczej" — z wariantami, ryzykami i etapami |
| Specyfikacja planu w HTML | `core/templates/SPEC_PLAN_HTML.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Ta sama treść planu dla odbiorcy nietechnicznego: jeden plik HTML działający bez internetu |
| Specyfikacja profili | `core/templates/SPEC_PROFILE.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-20 | Źródło prawdy o czterech profilach i ich regułach warunkowych — **w tym o tym rejestrze** |
| Specyfikacja promptu etapowego | `core/templates/SPEC_PROMPT_ETAPU.md` | 2 | 2026-08-07 | 2026-09-03: sekcja 7 otwiera się **katalogiem roboczym etapu**, a martwy punkt weryfikacji „brak plików tymczasowych" (mówił wyłącznie o repozytorium) zastąpił punkt dwuczęściowy o katalogu roboczym i artefaktach spoza niego — w części normatywnej **i** w przykładzie | Prompt etapowy jest całą pamięcią świeżej sesji; specyfikacja pilnuje, żeby nic z niej nie wypadło — w tym miejsca, w którym wolno tworzyć pliki |
| Specyfikacja `PULAPKI.md` | `core/templates/SPEC_PULAPKI.md` | 1 | 2026-08-20 | wpis startowy; ostatnia zmiana 2026-08-20 | Rejestr własności narzędzi i kolejności kroków, czytany zanim uznasz, że coś jest zepsute |
| Specyfikacja raportu adopcji | `core/templates/SPEC_RAPORT_ADOPCJI.md` | 1 | 2026-08-09 | wpis startowy; ostatnia zmiana 2026-08-21 | Jedyny artefakt przeżywający sesję adopcji — z przetestowaną drogą pełnego cofnięcia |
| Specyfikacja `README.md` | `core/templates/SPEC_README.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Wizytówka dla kogoś, kto nie wie o projekcie nic: co to jest, jak uruchomić, gdzie reszta |
| Specyfikacja snapshotu | `core/templates/SPEC_SNAPSHOT.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Bramka profili `agent-voice` i `flow`: najpierw kopia stanu sprzed zmiany, potem zmiana |
| Specyfikacja `srodowiska/` | `core/templates/SPEC_SRODOWISKA.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Instrukcja wdrożenia i cofnięcia wykonalna o drugiej w nocy przez kogoś, kto nie zna projektu |
| Specyfikacja `STATE.md` | `core/templates/SPEC_STATE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Odpowiedź „jak to teraz stoi" na jeden ekran, bez historii i bez czytania czegokolwiek innego |
| Specyfikacja `STATUS.md` planu | `core/templates/SPEC_STATUS.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-21 | Rozdziela zamiar od postępu — dzięki temu plan można zamrozić, nie blokując pracy |
| Specyfikacja `USTAWIENIA.md` | `core/templates/SPEC_USTAWIENIA.md` | 4 | 2026-08-07 | 2026-09-04 (wersja 4): wiersz `Lista modeli` (od 1.9.0) — własna sekcja z formatem `włączona · 7 dni`, zamkniętą listą brzmień i czterema zachowaniami ciszy; szósta pozycja wierszy czytanych maszynowo, siódma na liście nietykalnych w rotacji ustawień, wiersz 18 katalogu progów. Wcześniej 2026-09-03 (wersja 3): przykład na końcu przepisany na `Wersja RelAI: 1.8.0` z wierszem `Artefakty robocze`, żeby przykład nie pokazywał wersji bez wiersza, którego ta wersja wymaga. Wersja 2 tego samego dnia: wiersz `Artefakty robocze` (od 1.8.0) — kotwica, zamknięta lista brzmień, próg 100 MB; wiersz 18 katalogu progów; szósta pozycja listy nietykalnych w rotacji ustawień | Bez wiersza w ustawieniach raport o artefaktach nie miałby wyłącznika ani adresu progu, a próg nieujęty w katalogu nie ma właściciela |

## Szablon planu HTML — `core/templates/HTML_PLAN/` (1)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Szablon planu HTML z osadzaniem fontów | `core/templates/HTML_PLAN/` (`szablon.html`, `komponenty.html`, `zbuduj.js`, `fonty/`) | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Plan dla odbiorcy nietechnicznego ma działać bez internetu; ~145 KB fontów w base64 wstawia skrypt, bo model nie przepisze tego z pliku do pliku |

Traktowany jako **jedna pozycja**: trzy pliki źródłowe i sześć plików `.woff2` tworzą jeden artefakt,
którego wersji nie da się podbijać osobno.

## Komendy — `adapters/claude-code/commands/` (12)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| `/relai-adopt` | `adapters/claude-code/commands/relai-adopt.md` | 1 | 2026-08-09 | wpis startowy; ostatnia zmiana 2026-08-20 | Adopcja zastanego projektu z backupem jako bramką i raportem z przetestowaną ścieżką cofnięcia |
| `/relai-audit` | `adapters/claude-code/commands/relai-audit.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Raport o zdrowiu dokumentacji zakończony listą propozycji — sam niczego nie zmienia |
| `/relai-backup` | `adapters/claude-code/commands/relai-backup.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Archiwum ZIP w centralnym folderze, z wykluczeniem sekretów i katalogów runtime |
| `/relai-branch` | `adapters/claude-code/commands/relai-branch.md` | 2 | 2026-08-12 | 2026-09-03: Krok 6 pokazuje **katalog roboczy odnogi** (`.claude/relai/work/<TEMAT>/<NAZWA>/`, wariant samodzielny `_fixy`) obok ścieżek obu plików | Zakłada odnogę bez ruszania zamrożonego planu — karta plus prompt świeżej sesji, z adresem plików roboczych podanym z góry |
| `/relai-changelog` | `adapters/claude-code/commands/relai-changelog.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Destyluje dziennik do listy zmian; do pliku zapisuje dopiero na życzenie |
| `/relai-clean` | `adapters/claude-code/commands/relai-clean.md` | 1 | 2026-09-03 | nowy artefakt (plan SPRZATANIE_ARTEFAKTOW, E1) | Artefakty po zamkniętych etapach rosły poza Gitem i w `%TEMP%` bez żadnego adresu — komenda daje im raport w grupach, jedno „tak” na grupę i ślad w dzienniku, a kasowanie zostawia narzędziu rdzenia z asercjami korzeni |
| `/relai-handover` | `adapters/claude-code/commands/relai-handover.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Pakiet przekazania projektu w jednym pliku HTML — stan, mapa, plany, ryzyka, od czego zacząć |
| `/relai-help` | `adapters/claude-code/commands/relai-help.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Prezentuje `docs/KOMENDY.md` zamiast duplikować jego treść (D-07) |
| `/relai-models` | `adapters/claude-code/commands/relai-models.md` | 1 | 2026-09-04 | nowy artefakt (plan REKOMENDACJA_MODELU, E2): dziewięć kroków od markera projektu po zapis, zgoda na ruch sieciowy pytana **przy każdym wywołaniu** i nigdzie niezapamiętywana, pięć adresów źródeł wskazanych przez człowieka jako lista zamknięta, pytanie do człowieka jako drugie źródło, różnica stara–nowa przed zapisem, dwanaście zakazów | Listy modeli nie dało się odświeżyć inaczej niż ręczną edycją pliku, więc data przy pytaniu o model starzała się bez żadnej drogi wyjścia; komenda daje tę drogę, ale zostawia człowiekowi obie decyzje, których maszyna nie powinna podejmować — wejście do sieci i przypisanie cudzego modelu do klasy |
| `/relai-stage` | `adapters/claude-code/commands/relai-stage.md` | 2 | 2026-08-07 | 2026-09-03: karta potwierdzenia (Krok 4) dostała pozycję **Katalog roboczy** — ścieżka z linii otwierającej zakres promptu, z rozstrzygnięciem dla promptów sprzed 1.8.0 | Uruchamia etap aktywnego planu z kontrolą modelu i potwierdzeniem przed startem — a człowiek widzi, gdzie powstaną pliki, zanim powstaną |
| `/relai-tour` | `adapters/claude-code/commands/relai-tour.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Oprowadza po cudzym projekcie wyłącznie na podstawie jego dokumentów |
| `/relai-update` | `adapters/claude-code/commands/relai-update.md` | 3 | 2026-08-09 | 2026-09-03 (wersja 3): wersja docelowa podniesiona na **1.8.1** w czterech deklaracjach stanu docelowego — zdanie otwierające, nagłówek tabeli obszarów, wymagany nagłówek `docs/KOMENDY.md`, marker `Wersja RelAI:` i propozycja commita. Wymagania struktury bez zmian: 1.8.1 to poprawka rdzenia guardraili, nie nowy dokument. Wersja 2 z 2026-09-03: wersja docelowa 1.8.0 — wiersz inwentaryzacji `Artefakty robocze` (dopisywany, nigdy nadpisywany), tabela komend jedenastu pozycji, człon o sprzątaniu w linii fraz sesji, marker i propozycja commita na 1.8.0 | Podnosi strukturę projektu do wersji pluginu: różnice pokazane, zmiany wyłącznie za zgodą; bez wierszy 1.8.0 projekt zaktualizowany nie dostałby ani progu, ani jedenastej komendy |

## Skille — `adapters/claude-code/skills/` (2)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Skill `relai-core` | `adapters/claude-code/skills/relai-core/SKILL.md` | 5 | 2026-08-07 | 2026-09-03 (wersja 5): linia wersji skilla i marker wymagany w `docs/USTAWIENIA.md` podniesione na **1.8.1**; procedura skilla nietknięta — bez podbicia nowy projekt dostawałby marker starszy od pluginu, a `/relai-update` nie miałby czego domknąć. Wersja 4: linia wersji skilla i marker `Wersja RelAI:` w wymaganiach struktury podniesione na 1.8.0. Wersja 3: krok **2a** rytuału zamknięcia — sprzątanie artefaktów roboczych po rotacji, przed wpisem, z własną sekcją procedury; numeracja kroków 1–6 nietknięta (wersja 2 tego samego dnia: sekcja „Pliki lokalne, których nie sprzątamy") | Sprzątanie potrzebuje momentu w rytuale, a nie tylko komendy wywołanej wprost; bez kroku w rytuale katalogi zamkniętych etapów zostają na dysku do następnego przypadkowego spojrzenia |
| Skill `relai-planning` | `adapters/claude-code/skills/relai-planning/SKILL.md` | 4 | 2026-08-07 | 2026-09-03 (wersja 4): Krok 3 dostał akapit „Nazwy zamiast klas, gdy sesja ma listę modeli" — pytanie o model wykonawczy wymienia nazwy z pliku wskazanego przez hook startu razem z datą listy, a pozycja `<TO BE FILLED IN: …>` znaczy lukę do zgłoszenia, nie nazwę do zgadnięcia; bez listy pytanie zostaje dokładnie takie jak w tabeli. Rozpoznania narzędzia skill nie prowadzi — to należy do hooka (zasada 8). Wersja 3: linia wersji skilla podniesiona na 1.8.0 z opisem zakresu tego wydania. Wersja 2: elementy 7 i 8 układu promptu etapowego nazywają katalog roboczy, a rytuał „Na koniec" dostał krok `1a` (sprzątanie przed wpisem, żeby liczby trafiły do wpisu); numeracja 1–6 nietknięta | Niesie procedurę planowania: PLAN vs MINIPLAN, prompty etapowe, rytuał „Na koniec", odnogi |

## Reguły adaptera Cursora — `adapters/cursor/rules/` (3)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Reguła `relai-core` | `adapters/cursor/rules/relai-core.mdc` | 2 | 2026-08-12 | 2026-09-03: krok **2a** rytuału zamknięcia (sprzątanie artefaktów roboczych) i szósty wiersz nietykalny w rotacji ustawień | Reguła zawsze-w-kontekście jest w Cursorze jedynym nośnikiem rytuału — krok nieopisany tam nie wykona się w tamtym narzędziu w ogóle (P2) |
| Reguła `relai-guardrails` | `adapters/cursor/rules/relai-guardrails.mdc` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-08-12 | Sekrety, chroniona konfiguracja, bramka snapshotu i reguły profilu tam, gdzie Cursor nie ma egzekwowanego `ask` |
| Reguła `relai-planning` | `adapters/cursor/rules/relai-planning.mdc` | 2 | 2026-08-12 | 2026-09-03: ten sam krok `1a` rytuału po angielsku, a karta potwierdzenia etapu wymienia katalog roboczy — reguła jest jedynym nośnikiem rytuału w Cursorze (P2) | Plany, etapy, sygnał odchylenia i odnogi w Cursorze — bez zależności od auto-wyzwalania |

## Listy modeli — `adapters/*/MODELE.md` (2)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Lista modeli Claude Code | `adapters/claude-code/MODELE.md` | 2 | 2026-09-03 | 2026-09-04 (wersja 2, E2 / Aneks B): pierwsze odświeżenie z dokumentacji — blok maszynowy dostał czwarte pole **`alias`** (`opus`, `fable`, `sonnet`, `haiku`) opisane w zasadach parsowania, pole `source` przy każdej pozycji wskazuje adres i datę odczytu zamiast środowiska sesji, `list-date` 2026-09-03 → 2026-09-04. Wersja 1: wpis startowy (E1) — kotwica klasy na początku linii, zamknięta lista brzmień, cztery pozycje, w tym dwie w klasie `strong` | Alias jest warstwą, którą użytkownik realnie przełącza model, i przeżywa podbicie wersji, którego pełne ID nie przeżywa — lista mówiąca samo ID starzeje się szybciej, niż ktokolwiek zdąży ją odświeżyć |
| Lista modeli Cursora | `adapters/cursor/MODELE.md` | 2 | 2026-09-03 | 2026-09-04 (wersja 2, E2 / Aneks B): dwie pozycje `<TO BE FILLED IN: …>` zastąpione nazwami wskazanymi przez człowieka — `balanced: Composer 2.5` i `cheap: Auto`, obie z adnotacją `named by the human` i datą; `cheap` ma `id: -`, bo za trybem automatycznym stoi zmienny model. Pole `alias` dodane dla zgodności formatu z listą Claude Code (wszystkie pozycje `-`). Wersja 1: wpis startowy (E1) z jedną pozycją z pomiaru | Lista z dwiema trzecimi pozycji pustych odsyłała do komendy, która wtedy nie istniała; po E2 komenda istnieje i to ona pokazała człowiekowi ~45 kandydatów pogrupowanych po dostawcy, zamiast typować klasy za niego |

## Zgodność liczb z dyskiem (2026-09-04)

Inwentarz robiony komendą, nie okiem. **42 pozycje rejestru** = 22 + 1 + 12 + 2 + 3 + 2.
Wiersz komend przy poprzednim przeliczeniu mówił `10 / 10` przy jedenastu wierszach w tabeli —
`/relai-clean` doszedł do tabeli, a nie do tego wiersza. Poprawione razem z liczbą 12.

| Zbiór | Komenda | Na dysku | W rejestrze |
|---|---|---|---|
| specyfikacje dokumentów | `ls core/templates/*.md \| wc -l` | 22 | 22 |
| szablon planu HTML | `find core/templates/HTML_PLAN -type f` | 9 plików | 1 pozycja (jeden artefakt złożony) |
| komendy | `ls adapters/claude-code/commands/*.md \| wc -l` | 12 | 12 |
| skille | `ls adapters/claude-code/skills/*/SKILL.md` | 2 | 2 |
| reguły Cursora | `ls adapters/cursor/rules/*.mdc` | 3 | 3 |
| listy modeli | `ls adapters/*/MODELE.md` | 2 | 2 |

**Rozbieżność wobec karty odnogi — wypisana jawnie:** karta `REJESTR_ARTEFAKTOW/ODNOGA.md` i hook
`session-context` mówią o **31 specyfikacjach**. Na dysku plików `.md` w `core/templates/` jest
**22** (21 × `SPEC_*.md` + `README.md`). Liczba 31 to liczba **plików kopii** w
`.claude/relai/templates/` łącznie z dziewięcioma plikami katalogu `HTML_PLAN/` (22 + 9 = 31) —
czyli liczba plików, nie liczba specyfikacji. Rejestr trzyma się stanu z dysku.

## Poza rejestrem — świadomie

- **Hooki, guardraile, walidator, `session-signals.js`** — kod wykonawczy, nie instrukcja czytana
  przez model. Ich historia mieszka w gicie i w dzienniku.
- **Dokumenty tego projektu** (`docs/*.md`, plany, prompty etapowe, karty odnóg) — produkty procesu
  RelAI, nie artefakty pluginu. Prompt etapowy jest jednorazowy i wersji nie ma.
- **Manifesty i marketplace** (`.claude-plugin/`, `MANIFEST.json`) — metadane wydania; ich wersją
  jest wersja pluginu.
