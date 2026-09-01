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
| Specyfikacja `CLAUDE.md` | `core/templates/SPEC_CLAUDE_MD.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Trzyma `CLAUDE.md` w roli routera procesowego z budżetem 10 KB — plik płaci tokenami przy każdym prompcie |
| Specyfikacja `DECYZJE.md` | `core/templates/SPEC_DECYZJE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Rejestr rozstrzygnięć zamrożonych, żeby ten sam temat nie wracał co dwie sesje |
| Specyfikacja `DESIGN.md` | `core/templates/SPEC_DESIGN.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Umowa o wyglądzie spisana raz i egzekwowana przy każdej zmianie interfejsu |
| Specyfikacja `DZIENNIK.md` | `core/templates/SPEC_DZIENNIK.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-09-01 | Pamięć między sesjami: co się wydarzyło, co sprawdzono i jak, co czeka na człowieka |
| Specyfikacja `KOMENDY.md` | `core/templates/SPEC_KOMENDY.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-21 | Jedyne źródło prawdy o komendach i frazach w projekcie — `/relai-help` prezentuje ten plik, nie duplikuje go (D-07) |
| Specyfikacja `LEKCJE.md` | `core/templates/SPEC_LEKCJE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Korekty użytkownika zamienione w zasady, z twardym limitem 15 pozycji sekcji „Zasady aktywne" |
| Specyfikacja odnogi | `core/templates/SPEC_ODNOGA.md` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-08-12 | Boczny wątek dostaje kartę i samowystarczalny prompt, zamiast rozdymać etap albo zginąć |
| Specyfikacja `PLAN.md` | `core/templates/SPEC_PLAN.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Dokument decyzyjny „robimy / nie robimy / robimy inaczej" — z wariantami, ryzykami i etapami |
| Specyfikacja planu w HTML | `core/templates/SPEC_PLAN_HTML.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Ta sama treść planu dla odbiorcy nietechnicznego: jeden plik HTML działający bez internetu |
| Specyfikacja profili | `core/templates/SPEC_PROFILE.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-20 | Źródło prawdy o czterech profilach i ich regułach warunkowych — **w tym o tym rejestrze** |
| Specyfikacja promptu etapowego | `core/templates/SPEC_PROMPT_ETAPU.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Prompt etapowy jest całą pamięcią świeżej sesji; specyfikacja pilnuje, żeby nic z niej nie wypadło |
| Specyfikacja `PULAPKI.md` | `core/templates/SPEC_PULAPKI.md` | 1 | 2026-08-20 | wpis startowy; ostatnia zmiana 2026-08-20 | Rejestr własności narzędzi i kolejności kroków, czytany zanim uznasz, że coś jest zepsute |
| Specyfikacja raportu adopcji | `core/templates/SPEC_RAPORT_ADOPCJI.md` | 1 | 2026-08-09 | wpis startowy; ostatnia zmiana 2026-08-21 | Jedyny artefakt przeżywający sesję adopcji — z przetestowaną drogą pełnego cofnięcia |
| Specyfikacja `README.md` | `core/templates/SPEC_README.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Wizytówka dla kogoś, kto nie wie o projekcie nic: co to jest, jak uruchomić, gdzie reszta |
| Specyfikacja snapshotu | `core/templates/SPEC_SNAPSHOT.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Bramka profili `agent-voice` i `flow`: najpierw kopia stanu sprzed zmiany, potem zmiana |
| Specyfikacja `srodowiska/` | `core/templates/SPEC_SRODOWISKA.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Instrukcja wdrożenia i cofnięcia wykonalna o drugiej w nocy przez kogoś, kto nie zna projektu |
| Specyfikacja `STATE.md` | `core/templates/SPEC_STATE.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-20 | Odpowiedź „jak to teraz stoi" na jeden ekran, bez historii i bez czytania czegokolwiek innego |
| Specyfikacja `STATUS.md` planu | `core/templates/SPEC_STATUS.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-21 | Rozdziela zamiar od postępu — dzięki temu plan można zamrozić, nie blokując pracy |
| Specyfikacja `USTAWIENIA.md` | `core/templates/SPEC_USTAWIENIA.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-21 | Rejestr preferencji **i marker struktury RelAI**: odpowiedź raz udzielona nie wraca jako pytanie (D-22) |

## Szablon planu HTML — `core/templates/HTML_PLAN/` (1)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Szablon planu HTML z osadzaniem fontów | `core/templates/HTML_PLAN/` (`szablon.html`, `komponenty.html`, `zbuduj.js`, `fonty/`) | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Plan dla odbiorcy nietechnicznego ma działać bez internetu; ~145 KB fontów w base64 wstawia skrypt, bo model nie przepisze tego z pliku do pliku |

Traktowany jako **jedna pozycja**: trzy pliki źródłowe i sześć plików `.woff2` tworzą jeden artefakt,
którego wersji nie da się podbijać osobno.

## Komendy — `adapters/claude-code/commands/` (10)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| `/relai-adopt` | `adapters/claude-code/commands/relai-adopt.md` | 1 | 2026-08-09 | wpis startowy; ostatnia zmiana 2026-08-20 | Adopcja zastanego projektu z backupem jako bramką i raportem z przetestowaną ścieżką cofnięcia |
| `/relai-audit` | `adapters/claude-code/commands/relai-audit.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Raport o zdrowiu dokumentacji zakończony listą propozycji — sam niczego nie zmienia |
| `/relai-backup` | `adapters/claude-code/commands/relai-backup.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Archiwum ZIP w centralnym folderze, z wykluczeniem sekretów i katalogów runtime |
| `/relai-branch` | `adapters/claude-code/commands/relai-branch.md` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-08-12 | Zakłada odnogę bez ruszania zamrożonego planu — karta plus prompt świeżej sesji |
| `/relai-changelog` | `adapters/claude-code/commands/relai-changelog.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Destyluje dziennik do listy zmian; do pliku zapisuje dopiero na życzenie |
| `/relai-handover` | `adapters/claude-code/commands/relai-handover.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Pakiet przekazania projektu w jednym pliku HTML — stan, mapa, plany, ryzyka, od czego zacząć |
| `/relai-help` | `adapters/claude-code/commands/relai-help.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Prezentuje `docs/KOMENDY.md` zamiast duplikować jego treść (D-07) |
| `/relai-stage` | `adapters/claude-code/commands/relai-stage.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-12 | Uruchamia etap aktywnego planu z kontrolą modelu i potwierdzeniem przed startem |
| `/relai-tour` | `adapters/claude-code/commands/relai-tour.md` | 1 | 2026-08-08 | wpis startowy; ostatnia zmiana 2026-08-12 | Oprowadza po cudzym projekcie wyłącznie na podstawie jego dokumentów |
| `/relai-update` | `adapters/claude-code/commands/relai-update.md` | 1 | 2026-08-09 | wpis startowy; ostatnia zmiana 2026-08-21 | Podnosi strukturę projektu do wersji pluginu: różnice pokazane, zmiany wyłącznie za zgodą |

## Skille — `adapters/claude-code/skills/` (2)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Skill `relai-core` | `adapters/claude-code/skills/relai-core/SKILL.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-09-01 | Niesie procedurę: rozpoznanie folderu, inicjalizacja, rytuały startu i zamknięcia, rotacja, reguły profilu |
| Skill `relai-planning` | `adapters/claude-code/skills/relai-planning/SKILL.md` | 1 | 2026-08-07 | wpis startowy; ostatnia zmiana 2026-08-21 | Niesie procedurę planowania: PLAN vs MINIPLAN, prompty etapowe, rytuał „Na koniec", odnogi |

## Reguły adaptera Cursora — `adapters/cursor/rules/` (3)

| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |
|---|---|---|---|---|---|
| Reguła `relai-core` | `adapters/cursor/rules/relai-core.mdc` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-09-01 | `alwaysApply: true` — proces działa bez wyzwalania skilla, także na modelu spoza Anthropic (odpowiedź na R2) |
| Reguła `relai-guardrails` | `adapters/cursor/rules/relai-guardrails.mdc` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-08-12 | Sekrety, chroniona konfiguracja, bramka snapshotu i reguły profilu tam, gdzie Cursor nie ma egzekwowanego `ask` |
| Reguła `relai-planning` | `adapters/cursor/rules/relai-planning.mdc` | 1 | 2026-08-12 | wpis startowy; ostatnia zmiana 2026-08-12 | Plany, etapy, sygnał odchylenia i odnogi w Cursorze — bez zależności od auto-wyzwalania |

## Zgodność liczb z dyskiem (2026-09-01)

Inwentarz robiony komendą, nie okiem. **38 pozycji rejestru** = 22 + 1 + 10 + 2 + 3.

| Zbiór | Komenda | Na dysku | W rejestrze |
|---|---|---|---|
| specyfikacje dokumentów | `ls core/templates/*.md \| wc -l` | 22 | 22 |
| szablon planu HTML | `find core/templates/HTML_PLAN -type f` | 9 plików | 1 pozycja (jeden artefakt złożony) |
| komendy | `ls adapters/claude-code/commands/*.md \| wc -l` | 10 | 10 |
| skille | `ls adapters/claude-code/skills/*/SKILL.md` | 2 | 2 |
| reguły Cursora | `ls adapters/cursor/rules/*.mdc` | 3 | 3 |

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
