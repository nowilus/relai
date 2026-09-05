# PROMPT_ETAP_7 — Natywny plugin Codeksa: trzecie wyjście RelAI

Plan: ROZWOJ_PO_WYDANIU • Etap: **E7 z E8** • Wygenerowano ponownie: 2026-09-05 (autor:
gpt-5.6-sol, po zatwierdzeniu Aneksu B) • Wykonawca: **gpt-5.6-terra, effort high w Codeksie**
(wyjątek D-85 z 2026-09-05)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **balanced**, w tym narzędziu:
> **gpt-5.6-terra** z effortem **high** (wybór użytkownika i wyjątek D-85 z 2026-09-05). Jeśli
> sesja działa na innym modelu albo efforcie — zatrzymaj się przed zapisem plików i poproś
> użytkownika o przełączenie. Oczekiwanego okna 1 050 000 tokenów nie trzeba potwierdzać; jego brak
> nie blokuje etapu.

> **Aneks B (2026-09-05) ma pierwszeństwo nad faktami technicznymi z pierwotnego promptu z
> 2026-08-17.** Cel produktowy i gwarancje E7 zostają, ale wynikiem jest natywny plugin Codeksa
> 1.10.0, z repozytorium jako korzeniem pluginu i repo-marketplace w
> `.agents/plugins/marketplace.json`. Własną wersję 2.0.0 zachowuje E8.

Ten prompt jest jawną zgodą użytkownika na rozpoczęcie i pełną realizację E7 po potwierdzeniu
modelu, effortu, HEAD oraz czystego stanu względem pakietu przekazania. Nie twórz kolejnej karty
potwierdzenia i nie pytaj ponownie o decyzje zamrożone w Aneksie B; ustaw E7 na `W TOKU` i pracuj
samodzielnie aż do wyniku albo rzeczywistej bramki bezpieczeństwa.

**Oczekiwany punkt startowy nowej sesji:** `HEAD=f38ae47f8ef04446fc64fa7e27afdc36bcc8d062`.
Drzewo nie będzie puste, ponieważ pakiet przekazania nie został zacommitowany: oczekiwane są
wyłącznie zmiany w `CLAUDE.md`, `docs/STATE.md`, `docs/DZIENNIK.md`, `docs/DECYZJE.md`,
`docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html`, `STATUS.md` i tym pliku. Najpierw porównaj rzeczywisty
`git status --short` z tą listą; każdą inną zmianę traktuj jako pracę użytkownika i zachowaj.

> **Decyzja podjęta — D-86 (2026-08-17), nie otwieraj jej ponownie.** Projekt z adapterem obcego
> narzędzia (Cursor, Codex) ma **`AGENTS.md` jako plik główny**, a `CLAUDE.md` jest w nim
> **wskaźnikiem** („czytaj `AGENTS.md`"). Projekt prowadzony wyłącznie w Claude Code zostaje przy
> `CLAUDE.md` i nie dostaje `AGENTS.md`. Kolizję rozstrzyga **obecność adaptera**, nie to,
> w którym narzędziu trwa sesja. Konsekwencje dla tego etapu: instalator Codeksa zakłada
> `AGENTS.md` i zamienia `CLAUDE.md` we wskaźnik (istniejącej treści **nie kasujesz** — przenosisz
> ją, a wskaźnik dostaje link), deinstalator odwraca tę operację, a `SPEC_CLAUDE_MD.md` dostaje
> sekcję opisującą oba warianty układu. To samo dotyczy adaptera Cursora — jego instalator
> wykonuje odtąd tę samą zamianę, więc zmiana obejmuje `adapters/cursor/install.js`.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, aktywny plan i wyjątek modelowy E7 |
| `docs/STATE.md` | cały aktualny stan 1.9.3 i lista rzeczy, których E7 nie może pomylić z własnym zakresem |
| `docs/DZIENNIK.md` | wyłącznie „Stan otwartych ryzyk", „Czeka na człowieka" i dwa ostatnie wpisy; P1/P2 są hipotezami do rozstrzygnięcia dowodem |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — wszystkie 15 pozycji obowiązuje w E7 |
| `docs/DECYZJE.md` | tylko D-33, D-34, D-35, oba wpisy D-85, D-86 i oba wpisy D-87 |
| `docs/USTAWIENIA.md` i `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md` | preferencje, Aneks B, status E7 i zakaz zmiany modelu bez człowieka |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | wyłącznie sekcje 6–10, zwłaszcza Aneks B |
| `docs/PRZENOSNOSC.md` | sekcja 2 Codeksa i cała tabela gwarancji w sekcji 3 — każde twierdzenie ma dostać etykietę dowodu |
| `adapters/claude-code/`, `adapters/cursor/`, `core/MANIFEST.json`, `core/README.md`, `core/tools/validate-adapters.js` | wzorce dwóch adapterów, granica rdzenia i walidator, który trzeba rozszerzyć na trzeci adapter |
| `core/process/session-signals.js`, `core/guardrails/secret-scan.js` | wspólna logika konsumowana przez hooki Codeksa; nie kopiuj jej |
| aktualny `plugin-creator` wraz z `references/plugin-json-spec.md` i `references/installing-and-updating.md` oraz oficjalna dokumentacja OpenAI o pluginach i hookach | obowiązujący manifest, marketplace, instalacja, cache i payloady; repo nie jest źródłem prawdy o aktualnym Codeksie |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Aneks B (2026-09-05): repozytorium jest korzeniem natywnego pluginu Codeksa.** Manifest
  powstaje w `.codex-plugin/plugin.json`, repo-marketplace w `.agents/plugins/marketplace.json`
  wskazuje ten korzeń, a kod wspólny pozostaje w `core/`. Nie twórz drugiej ręcznej kopii rdzenia
  pod `plugins/relai/`.
- **Wersja docelowa E7 to 1.10.0; 2.0.0 należy do E8** (Aneks B). Podbij tylko deklaracje stanu
  zmienionych artefaktów; wzmianki historyczne pozostają historią.
- **Dwanaście procedur RelAI mapuje się na natywne, wykrywalne skille Codeksa.** Folder
  `commands/` Claude Code nie jest mechanizmem Codeksa. Jeżeli natywny pakiet wymaga kopii treści
  skilli, generuj ją deterministycznie ze źródła i dodaj walidację rozjazdu.
- **Adapter konsumuje rdzeń, nie kopiuje go** (P4). Rozpoznania startu sesji bierzesz
  z `core/process/session-signals.js`, skan sekretów z `core/guardrails/secret-scan.js`. Kopiowanie
  logiki między adapterami jest zakazane — walidator to sprawdza.
- **Warstwą nośną reguł jest warstwa zawsze-w-kontekście, nie skill** (L-0030). W Codeksie to
  `AGENTS.md` z twardym limitem `project_doc_max_bytes` = 32 KiB. Skill niesie procedurę, nigdy
  regułę — mechanizm `description` + dopasowanie to ten sam wzorzec, który przy R2 okazał się
  zależny od modelu.
- **Warstwa czytana przez model po angielsku, warstwa dla człowieka po polsku** (`USTAWIENIA`,
  wpis z 2026-08-12). `AGENTS.md` adaptera: angielski. README instalacji: polski.
- **Komendy i skille nie powstają drugi raz.** Instalator kopiuje je z adaptera Claude Code, tak
  jak robi to instalator Cursora; dla natywnego pluginu Codeksa kopie są wyłącznie wynikiem
  deterministycznego generatora, nigdy drugim ręcznie utrzymywanym źródłem.
- **Rozpoznanie opieraj na próbie i na buildzie, nie na dokumentacji** (L-0041). Sekcja 2
  `PRZENOSNOSC.md` ma dziś trzy pozycje `<DO UZUPEŁNIENIA>` — domknięcie ich jest częścią tego
  etapu, a każda pozycja dostaje etykietę źródła.
- **Guardrail wołany przez interpreter wymaga opakowania powłoki** (L-0043) — chyba że próba
  pokaże, że Codex zgłasza niewykonalny hook. Wtedy zapisujesz zmierzoną różnicę.
- **Materiał testowy guardraila składasz w czasie wykonania** (L-0046) — literał sekretu w pliku
  testowym blokuje własny hook.
- Instalacja, ponowna instalacja, aktualizacja i deinstalacja są idempotentne oraz zachowują cudze
  pliki i hooki. Testujesz osobno: czysty projekt, istniejący `AGENTS.md`, istniejący `CLAUDE.md`,
  oba pliki, cudze hooki, brak gita, brak Node.js i flagę rezygnacji ze skanu.
- **Nie instaluj adaptera Codeksa ani Cursora w repozytorium RelAI** (D-87 i Aneks B). Projekty
  kontrolne i tymczasowy marketplace mają slug `relai-e7-*`, są zinwentaryzowane przed próbą i
  usunięte po niej. Nie dotykaj prawdziwego `~/.codex` bez pokazania zakresu, backupu, rollbacku
  i uzyskania osobnej zgody.
- Nie publikuj pluginu, nie wykonuj pushu, nie zmieniaj zdalnego marketplace i nie commituj.
- Wersja po tym etapie: **1.10.0**. Numer żyje w `core/MANIFEST.json`, obu manifestach Claude Code,
  natywnym `.codex-plugin/plugin.json`, README adapterów i dokumentacji projektu; marker projektu
  zmienia się wyłącznie tam, gdzie etap jawnie aktualizuje artefakt — L-0008.
- **Granica zakresu:** publiczne wydanie, zdalny marketplace, wersja 2.0.0 i decyzje dystrybucyjne
  są E8. W E7 wolno wyłącznie zbudować i lokalnie zweryfikować plugin 1.10.0.

## Stan wyjściowy — co realnie zastajesz

RelAI jest na **1.9.3**. Dwa adaptery konsumują wspólny rdzeń i mają dwanaście procedur: Claude
Code jako plugin oraz Cursor jako instalacja projektowa. Lokalny Codeks ma wersję **0.153.4** i
udostępnia polecenia `codex plugin add|list|remove` oraz
`codex plugin marketplace add|list|upgrade|remove`.

```
core/                         # jedyne źródło templates, guardrails, process i walidatora
adapters/claude-code/         # 2 skille, 12 komend, hooki i lista modeli
adapters/cursor/              # 3 reguły, 2 hooki, instalator, README i lista modeli
.claude-plugin/               # manifest i marketplace Claude Code
docs/PRZENOSNOSC.md           # stare rozpoznanie Codeksa z lukami i tabela gwarancji
.codex-plugin/                # jeszcze nie istnieje
.agents/plugins/              # repo-marketplace Codeksa jeszcze nie istnieje
```

**Aktualne fakty z oficjalnej dokumentacji OpenAI, sprawdzone 2026-09-05:** każdy plugin ma
`.codex-plugin/plugin.json`; może zawierać `skills/`, `hooks/hooks.json`, `.mcp.json`, `.app.json`
i zasoby, ale MCP/UI są opcjonalne. Repo-marketplace jest katalogiem JSON w
`$REPO_ROOT/.agents/plugins/marketplace.json`. Pluginowe hooki nie stają się zaufane automatycznie.
Aktualne zdarzenia obejmują `SessionStart`, `SessionEnd`, `PreToolUse`, `PermissionRequest`,
`PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStart`, `SubagentStop`,
`Stop` i `Interrupt`; `PreToolUse` obserwuje m.in. `Bash`, `apply_patch`/`Edit`/`Write` i większość
narzędzi MCP. Payload wspólny niesie `cwd`, `model`, `session_id` i `hook_event_name`, a
`SessionStart` może zwrócić `additionalContext`.

**Czego jeszcze NIE ma — to jest zakres E7:** natywnego manifestu i marketplace, adaptera
`adapters/codex/`, generatora dwunastu skilli, hooków Codeksa konsumujących rdzeń, instalatora
integracji projektowej D-86, testów jego idempotentności, dowodu realnej instalacji w świeżej sesji
ani kolumny Codeksa opartej na próbie. P1 i P2 nadal są otwarte właśnie z tego powodu.

**Zasady aktywne z `docs/LEKCJE.md`:** wszystkie 15 pozycji obowiązuje dosłownie. Szczególnie:
dowodź efektem i parą pozytywna/negatywna; instrument ma własną kontrolę pozytywną; zachowanie
zawsze obecne należy do `AGENTS.md` albo hooka; źródłem faktów o cudzym narzędziu jest wydany build
i próba; wersję potwierdza się plikiem instalacji/cache; końce linii, BOM i kolejność danych są
wariantami; guardrail bez interpretera nie może degradować się po cichu; najpierw wykonuje się
zmianę, potem opisuje ją w dokumentach.

**Bramki planu niezwiązane z E7:** publiczne wydanie i dystrybucja to E8. Otwarte sprawy z sekcji
„Czeka na człowieka" oraz odnoga `OPIS_REPO` nie należą do E7 i nie wolno ich robić przy okazji.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/ROZWOJ_PO_WYDANIU/E7/`.** Wszystko
> tymczasowe — skrypty pomiarowe, projekty kontrolne w obrębie repo, wyjścia narzędzi i raport
> akceptacyjny w toku — powstaje tam. Projekt, marketplace albo izolowany katalog Codeksa, który
> musi leżeć poza repozytorium, zaczyna nazwę od `relai-e7-`, trafia z dokładną ścieżką do wpisu
> dziennika i jest usuwany po teście.

1. **Rozpoznanie i dowody** — zaktualizuj `docs/PRZENOSNOSC.md`: usuń wszystkie
   `<DO UZUPEŁNIENIA>` z sekcji Codeksa, a każdy fakt oznacz jako **[próba]**, **[kod produktu]**
   albo **[dokumentacja]**. Potwierdź lokalnie payload `PreToolUse`, sandbox, dostęp do plików,
   widoczność hooków i zachowanie ich zaufania; P-008 uznaj za problem sandboxa dopiero po
   powtórzeniu poza nim.
2. **Natywny pakiet** — utwórz `.codex-plugin/plugin.json` dla `relai` 1.10.0 i repo-marketplace
   `.agents/plugins/marketplace.json`, wskazujący repozytorium jako korzeń pluginu. Użyj aktualnych
   narzędzi `plugin-creator`; manifest nie deklaruje MCP ani aplikacji UI. Dodaj wyłącznie realne
   metadane i istniejące ścieżki.
3. **Dwanaście natywnych procedur** — dodaj `adapters/codex/` i generator, który z dwunastu
   `adapters/claude-code/commands/relai-*.md` buduje wykrywalne skille Codeksa wraz z właściwymi
   opisami. Dołącz `relai-core` i `relai-planning`. Generator jest deterministyczny, a walidator
   wykrywa brak oraz rozjazd wygenerowanej treści.
4. **Warstwa zawsze obecna D-86** — `adapters/codex/AGENTS.md` jest angielskim, krótkim routerem
   procesu i mieści się w realnym limicie `project_doc_max_bytes`. `adapters/codex/install.js`
   instaluje integrację do wskazanego projektu: przenosi zastaną treść główną bez utraty,
   `AGENTS.md` czyni routerem, a `CLAUDE.md` wskaźnikiem. Ponowna instalacja i deinstalacja są
   idempotentne, nie niszczą treści użytkownika i nie usuwają cudzych plików.
5. **Cursor zgodny z D-86** — zaktualizuj `adapters/cursor/install.js`, jego testy i README tak,
   aby wykonywał tę samą odwracalną zamianę `AGENTS.md`/`CLAUDE.md`, zachowując dotychczasowe
   reguły, komendy, skille, hooki i flagę `--bez-skanu`.
6. **Hooki Codeksa** — dodaj `hooks/hooks.json` i cienkie skrypty adaptera dla co najmniej
   `SessionStart`, `PreToolUse` i domknięcia sesji. Hook startu konsumuje
   `core/process/session-signals.js`; skan konsumuje `core/guardrails/secret-scan.js`. Użyj
   aktualnych nazw pól i werdyktów potwierdzonych próbą. Brak Node.js nie może wyglądać jak zgoda;
   flaga rezygnacji ze skanu ma być jawna i mierzalna.
7. **Walidacja trzech adapterów** — rozszerz `core/MANIFEST.json`, `core/README.md` i
   `core/tools/validate-adapters.js`. Walidator sprawdza trzeci adapter, manifest Codeksa,
   marketplace, datę listy modeli, wygenerowane skille, odwołania do rdzenia i brak ręcznych
   duplikatów. Na kopii repo podłóż kontrolny duplikat i zapisz dowód, że walidator kończy się 1.
8. **Testy instalatora** — dodaj automatyczne scenariusze: czysty projekt; istniejący tylko
   `AGENTS.md`; istniejący tylko `CLAUDE.md`; oba; cudze hooki; brak gita; brak Node.js; flaga
   rezygnacji ze skanu; ponowna instalacja; aktualizacja; deinstalacja. Każdy test dowodzi także,
   czego instalator nie zmienił.
9. **Realny plugin i świeża sesja** — w kontrolowanym, izolowanym środowisku Codeksa dodaj
   tymczasowy lokalny marketplace, zainstaluj plugin, zweryfikuj jego widoczność i uruchom nową
   sesję w projekcie kontrolnym. Zapisz wynik kolejno: start RelAI; inicjalizacja po zgodzie i
   trzech pytaniach; naturalna prośba o plan; jedna procedura; zapis i odczyt wspólnego stanu;
   odmowa sekretu przez regułę; niezależna odmowa przez hook; kontrola pozytywna; rytuał końca.
10. **Praca naprzemienna** — jeśli wszystkie trzy narzędzia są dostępne, przeprowadź
    Codex–Cursor–Claude Code na jednym projekcie kontrolnym i porównaj `docs/`, `git status` oraz
    marker wersji. Brak narzędzia zapisujesz jako `NOT TESTED`, nigdy jako zaliczony.
11. **Dokumentacja i wersja** — uaktualnij sekcję Codeksa oraz tabelę gwarancji w
    `docs/PRZENOSNOSC.md`, `README.md`, README adapterów, `core/README.md`, manifesty i instrukcje
    instalacji. Podbij zmienione artefakty w `docs/ARTEFAKTY.md`; wszędzie rozdzielaj dowód
    **[próba]**, **[kod produktu]**, **[dokumentacja]**.
12. **Pełny raport E7 i cleanup** — zapisz wynik każdego kryterium jako PASS, FAIL albo NOT TESTED.
    Usuń projekty kontrolne, tymczasowe marketplace, instalacje, cachebustery i wpisy konfiguracji;
    potwierdź stan przed i po. Nie kopiuj tokenów ani plików uwierzytelnienia. Dopiero po wszystkich
    obowiązkowych PASS rozstrzygnij P1/P2, oznacz E7 jako zrealizowany i wygeneruj prompt E8.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Bieżąca sesja potwierdza `gpt-5.6-terra` i effort `high`; przed pierwszym zapisem E7 ustawia
      w `STATUS.md` etap na `W TOKU` i dopisuje jedną linię startu.
- [ ] Oficjalny walidator `plugin-creator` akceptuje `.codex-plugin/plugin.json`; repo-marketplace
      przechodzi walidację i `codex plugin list` widzi `relai` pod właściwą nazwą źródła.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0 dla trzech adapterów; kontrolny
      ręczny duplikat rdzenia na kopii kończy się kodem 1 i wskazuje właściwy plik.
- [ ] Generator dwunastu skilli jest deterministyczny: dwa przebiegi dają identyczne sumy, a
      zmiana źródłowej komendy powoduje wykryty rozjazd do czasu regeneracji.
- [ ] `AGENTS.md` adaptera ma zmierzony rozmiar w bajtach poniżej aktywnego
      `project_doc_max_bytes`; `CLAUDE.md` jako wskaźnik zachowuje dostęp do całej wcześniejszej
      treści bez duplikowania jej.
- [ ] Testy instalacji, ponownej instalacji, aktualizacji i deinstalacji przechodzą dla wszystkich
      dziewięciu wariantów z zakresu; dowód negatywny potwierdza zachowanie treści użytkownika,
      cudzych hooków, `docs/` i plików spoza manifestu instalacji.
- [ ] Hook `SessionStart` na realnym payloadzie wstrzykuje kontekst tylko w projekcie RelAI i
      milczy w zwykłym folderze; payload, wynik i wersja Codeksa są zapisane bez danych konta.
- [ ] Hook `PreToolUse` ma niezależne kontrole: sekret złożony w runtime jest zablokowany i plik nie
      istnieje; czysta treść przechodzi; brak Node.js oraz `--bez-skanu` zachowują się dokładnie tak,
      jak opisuje README.
- [ ] Świeża sesja z pluginem przechodzi wszystkie dziewięć kroków scenariusza akceptacyjnego,
      każdy zapisany jako PASS/FAIL/NOT TESTED. Reguła i hook skanu sekretów są zmierzone osobno.
- [ ] Praca naprzemienna Codeks–Cursor–Claude Code ma wynik dla każdego dostępnego narzędzia;
      `git status`, treść `docs/` i marker wersji są porównane przed oraz po. Brak narzędzia jest
      `NOT TESTED` i blokuje deklarację pełnego zaliczenia tego punktu.
- [ ] Testy guardraili, testy obu instalatorów, `node core/tools/validate-adapters.js`, walidatory
      pluginu/marketplace i `git diff --check` kończą się kodem 0. Błąd Git Basha w sandboxie
      Codeksa został powtórzony poza sandboxem przed klasyfikacją jako P-008.
- [ ] `docs/PRZENOSNOSC.md` nie ma `<DO UZUPEŁNIENIA>` w sekcji Codeksa; tabela gwarancji, P1 i P2
      wynikają z dowodów, a nie z deklaracji. Numery 1.10.0 są spójne we wszystkich źródłach stanu.
- [ ] Cleanup ma inwentarz przed i po: zero tymczasowych projektów, marketplace, instalacji,
      cachebusterów i wpisów konfiguracji. Repozytorium nie ma adaptera Codeksa ani Cursora
      zainstalowanego jako integracja projektowa.
- [ ] Katalog `.claude/relai/work/ROZWOJ_PO_WYDANIU/E7/` został przejrzany raportem
      `node .claude/relai/tools/clean-work.js raport` i skasowany po zgodzie; liczby przed i po oraz
      los każdego artefaktu `relai-e7-*` poza repo są w wpisie dziennika.
- [ ] Końcowe porównanie punkt po punkcie z pierwotnym `PROMPT_ETAP_7.md`, Aneksem B i promptem
      uruchamiającym z 2026-09-05 ma wyłącznie PASS. Jakikolwiek FAIL albo NOT TESTED oznacza, że
      E7 pozostaje `W TOKU` i nie wolno oznaczyć go jako zrealizowany.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. Najpierw zapisz macierz PASS/FAIL/NOT TESTED. Gdy istnieje choć jeden FAIL albo NOT TESTED,
   `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md` pozostaje z E7 `W TOKU`, a dziennik mówi dokładnie,
   czego brakuje. Tylko komplet PASS pozwala ustawić E7 → `ZREALIZOWANY <data>`, E8 →
   `GOTOWY DO STARTU`, dodać link do `PROMPT_ETAP_8.md` i zastąpić linię startu E7 jedną linią
   wynikową. Sekcję „Bramki manualne" odśwież; odnóg nie ruszaj bez zdarzenia z E7.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (<model>) + <git config>`.
   Lekcje → `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz „Co działa", „Nad czym pracujemy teraz", „Co blokuje" i liczby.
4. Po komplecie PASS **wygeneruj `PROMPT_ETAP_8.md`** (wydanie 2.0.0 i dystrybucja) z aktualnego
   `core/templates/SPEC_PROMPT_ETAPU.md`, na bazie sekcji 6 planu (E8), Aneksów A–B, realnego stanu
   repozytorium po E7 i wniosków z trzech adapterów. Etap bez tego kroku nie jest ukończony
   (D-34).
5. Zaproponuj commit `feat: add native Codex plugin`, ale go nie wykonuj. Nie publikuj i nie
   wykonuj pushu. W raporcie końcowym podaj: rezultat i wersję; architekturę; pliki; dokładne wyniki
   testów; zachowanie świeżej sesji; pracę naprzemienną; P1/P2; cleanup; ograniczenia i NOT TESTED;
   proponowany commit.
