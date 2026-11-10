# E14 — CI, liczebniki, wydanie i zamknięcie planu

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ostatni etap: dokłada kontrolę ciągłą,
domyka dokumenty, scala gałąź i przeprowadza **jedno** wydanie całego planu. To drugi etap,
w którym wolno uruchamiać świeże sesje `claude -p` — wyłącznie te, które uruchamia narzędzie
weryfikacji wydania.

- **Karty w kolejności wykonania:** K-G3 → K-E9 → K-W1 (kontrola przed scaleniem) → K-W2
  (scalenie) → K-W3 (wydanie) → K-W4 (zamknięcie planu). Workflow i liczebniki idą przed
  scaleniem, żeby weszły do wydania; wydanie przed zamknięciem planu, bo zamknięcie opisuje to,
  co wydano.
- **Efekt widoczny:** `claude plugin update` w dowolnym projekcie daje wersję z poprawkami planu;
  każdy push do `main` uruchamia testy rdzenia i adapterów.
- **Szacunek:** SZACUNEK 1–2 sesje.
- **Warunki zatrzymania:** którykolwiek zestaw testów czerwony w K-W1; `release-check.js` zwraca
  kod 2; konflikt przy scaleniu; pierwszy przebieg workflow na GitHubie czerwony; człowiek nie
  udziela którejś z osobnych zgód sekwencji wydania.
- **Weryfikacja etapu:** tag wydania istnieje na `origin`; `release-verify.js --sesja` dla
  pluginu `relai` i każdego zmienionego modu kończy się kodem 0; ostatni przebieg workflow
  `testy.yml` ma wynik `success`; linia „Aktywny plan” w `CLAUDE.md` brzmi `Aktywny plan: brak`
  z odsyłaczem do zarchiwizowanego planu.

---

## K-G3 — workflow testów rdzenia i adapterów

- **Cel:** push do `main` i każdy pull request uruchamiają pięć zestawów testów Node
  i `validate-adapters.js` (raport, znalezisko G3).
- **Pliki:** nowy `.github/workflows/testy.yml`.
- **Stan dziś:** jedyny workflow to `.github/workflows/strona.yml` (strona). Jego kroki używają
  akcji przypiętych skrótem commita — z niego kopiujesz przypięcia (kotwice):
  `uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1` i
  `uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`.
- **Zmiana:** utwórz plik o tej treści (przypięcia przepisz z `strona.yml`, nie z tej karty, jeśli
  się różnią):

  ```yaml
  name: "Testy (rdzen i adaptery)"

  on:
    push:
      branches: [main]
      paths-ignore:
        - "site/**"
        - "docs/**"
    pull_request:
      paths-ignore:
        - "site/**"
        - "docs/**"
    workflow_dispatch:

  permissions:
    contents: read

  concurrency:
    group: "testy-${{ github.ref }}"
    cancel-in-progress: true

  jobs:
    testy:
      runs-on: windows-latest
      timeout-minutes: 20
      steps:
        - name: Pobierz repozytorium
          uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        - name: Ustaw Node
          uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
          with:
            node-version: 24
        - name: Guardrails
          run: node --test "core/guardrails/tests/*.test.js"
        - name: Proces
          run: node --test "core/process/tests/*.test.*"
        - name: Panel (rdzen)
          run: node --test "core/panel/tests/*.test.*"
        - name: Adapter Codex
          run: node --test "adapters/codex/tests/*.test.js"
        - name: Adapter Cursor
          run: node --test "adapters/cursor/tests/*.test.js"
        - name: Spojnosc adapterow
          run: node core/tools/validate-adapters.js
  ```

  Powody wyborów: `windows-latest` — testy są zmierzone na Windows i Node 24 (FAKT), a zachowanie
  na Linuksie nie; `paths-ignore` — zmiana samych dokumentów nie uruchamia 3 minut testów; testów
  modów workflow **nie** uruchamia, bo wymagają binarki Claude Code (`plugin test`).
- **Test najpierw:** nie dotyczy (plik konfiguracji). Kontrola składni przed commitem: narzędziem
  Grep wyszukaj w `.github/workflows/testy.yml` znak tabulacji (wzorzec `\t`, tryb `count`) →
  zero trafień. Wzorca z backslashem nie przepuszczasz przez powłokę ani przez `node -e`.
- **Weryfikacja:** lokalnie te same sześć poleceń co w krokach `run` — wszystkie kod 0. Na
  GitHubie dopiero po K-W2: `gh run list --workflow testy.yml --limit 1` → `completed success`.
  Wynik czerwony → zatrzymaj się, pokaż człowiekowi log kroku (`gh run view --log-failed`)
  i **nie naprawiaj testów pod CI bez pytania** — to może być różnica środowiska runnera.
- **Nie ruszasz:** `strona.yml`; nie dodajesz macierzy systemów ani kroku z testami modów.
- **Pułapki:** YAML wcina się spacjami; nazwy kroków i workflow w ASCII; glob w cudzysłowie —
  PowerShell na runnerze nie rozwinie go sam, a Node 24 przyjmuje wzorzec.
- **Gotowe, gdy:** plik istnieje, kontrola składni przechodzi, sześć poleceń lokalnie daje kod 0.

---

## K-E9 — liczebniki w dokumentach i aneks do D-40

- **Cel:** dokumenty podają liczby hooków, komend i skilli zgodne z dyskiem po całym planie;
  D-40 przestaje wymagać aneksu przy każdym nowym hooku. Jedyne znalezisko niskiej wagi w planie —
  weszło, bo właściciel zgodził się na aneks D-40 (2026-11-09).
- **Pliki:** `docs/PRZEWODNIK.md`, `docs/INSTALACJA.md`, `docs/PRZENOSNOSC.md`, `docs/STATE.md`,
  `README.md`, `docs/DECYZJE.md`, `panel/hooks/register.tsx`, `panel/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`.
- **Stan dziś** (kotwice; liczby faktyczne ustal poleceniami z kroku 1):
  - `docs/PRZEWODNIK.md:120` — `Trzynaście hooków w Node.js, zero zależności npm. **Dwa blokują, siedem ostrzega, cztery pracują cicho.**`
  - `docs/PRZEWODNIK.md:245` — `rejestracja trzynastu hooków (zdarzenia i matchery)`
  - `docs/PRZEWODNIK.md:246` — `czternaście hooków Node.js, zero zależności npm`
  - `docs/PRZEWODNIK.md:256` — `wygenerowany pakiet: 16 procedur + 2 skille rdzenia (od 2.1.1)`
  - `docs/INSTALACJA.md:103-104` — `szesnaście komend` … `dwa skille`
  - `docs/PRZENOSNOSC.md:79` — `Instalator kopiuje dziesięć plików komend i dwa skille`
  - `docs/PRZENOSNOSC.md:220` — `### 3.2 Dziesięć komend`
  - `docs/STATE.md:12` — `czternastoma hookami w Claude Code (czternasty: \`session-title\`)`
  - `docs/STATE.md:105` — `z hooka \`session-title\` (czternasty hook; źródło: przekazanie,`
  - `docs/STATE.md:227` — `16 komend, 4 agenci, 14 hooków, lista modeli`
  - `README.md:194` — `ma ich czternaście; Cursor i Codex po części.`
    Bez poprawki `README.md` kontrola `readme-hooki` w `release-check.js` zostaje czerwona
    w karcie K-W3.
  - Trzy kotwice wyżej (`STATE.md:105`, `STATE.md:227`, `README.md:194`) przekazał etap E5 (karta
    w `E05_HOOK_POLECEN_I_STOP.md`, pole „Nie ruszasz”); potwierdzone Grepem 2026-11-09 na `main`.
  - `panel/hooks/register.tsx:4` — `the forms of the 15 RelAI commands`
  - `panel/.claude-plugin/plugin.json:8` i `.claude-plugin/marketplace.json:35` —
    `forms for the 15 RelAI commands`
  - `docs/DECYZJE.md` — tabela „Decyzje zmienione” ma dwa aneksy D-40 z liczbą hooków (11 i 13).
- **Zmiana:**
  1. Ustal liczby z dysku i zapisz je:
     `ls adapters/claude-code/hooks/*.js | wc -l` (hooki; po etapie E5 spodziewane 15),
     `ls adapters/claude-code/commands/*.md | wc -l` (komendy; 16),
     `node -e "console.log(require('./core/process/bundled-skills.js').BUNDLED_SKILL_NAMES.length)"`
     (skille dołączane do Cursora i Codeksa; 4).
     Podział hooków na blokujące, ostrzegające i ciche policz z kodu: blokujący to hook zwracający
     `permissionDecision` `deny` albo `ask` (grep `permissionDecision` w katalogu hooków);
     ostrzegający wypisuje `additionalContext` albo `systemMessage`; reszta pracuje cicho. Jeżeli
     podział nie jest jednoznaczny dla któregoś hooka — zapytaj, nie zgaduj.
  2. W każdym miejscu z listy zastąp liczebnik liczbą z kroku 1, zachowując resztę zdania.
     W `PRZEWODNIK.md:120` zdanie o podziale przepisz liczbami z kroku 1. W `PRZENOSNOSC.md`
     nagłówek `### 3.2 Dziesięć komend` zmień na `### 3.2 Komendy` (nagłówek bez liczby nie
     zestarzeje się; sprawdź grepem, czy jakiś link wskazuje kotwicę `#32-dziesięć-komend`,
     i przepnij go). W `README.md:194` słowo `czternaście` zastąp liczebnikiem słownym liczby
     hooków z kroku 1. W `docs/STATE.md:12` zdanie opisuje stan bieżący: `czternastoma hookami
     w Claude Code (czternasty: \`session-title\`)` → liczebnik słowny liczby hooków z kroku 1
     w narzędniku i nawias z najnowszym hookiem, przy 15 hookach: `piętnastoma hookami w Claude Code
     (piętnasty: \`bash-guard\`)`. W `docs/STATE.md:105` `czternasty hook` zostaje bez zmian: zdanie opisuje
     plan ZGLOSZENIA zamknięty 2026-10-27, a `session-title` był wtedy czternastym hookiem. W `docs/STATE.md:227` `14 hooków` → liczba hooków
     z kroku 1 cyframi.
  3. W trzech miejscach panelu `15` → liczba komend z kroku 1 (opis w manifestach to jedno długie
     zdanie — zmieniasz w nim tylko liczbę).
  4. Na końcu tabeli „Decyzje zmienione” w `docs/DECYZJE.md` dopisz jeden wiersz:

     ```
     | **D-40** → aneks | <RRRR-MM-DD> | **Lista hooków wynika z `adapters/claude-code/hooks/hooks.json`** — decyzja nie wylicza już ich liczby ani nazw. Stan na dzień aneksu: <N> hooków, w tym `session-title` (plan ZGLOSZENIA) i `bash-guard` (plan OPTYMALIZACJA_PO_AUDYCIE, etap E5). Zasady D-40 bez zmian — jeden plik Node.js na hook, bez par `.ps1`/`.sh`; podział na blokujące i ostrzegające zostaje w D-41. | Aneksy z 2026-09-24 i 2026-10-24 podawały liczbę i dwukrotnie się zestarzały (audyt 2026-11-09, znalezisko E9); zgoda Łukasza 2026-11-09. |
     ```

     `<N>` to liczba z kroku 1. Jeśli etap E5 nazwał nowy hook inaczej niż `bash-guard`, wpisz
     nazwę faktyczną.

  Wartości orientacyjne policzone z kart planu (wiążące jest policzenie z dysku w kroku 1): hooki
  15 (z nowym `bash-guard`), komendy 16, skille dołączane 4, wywołania w `hooks.json` 20.
- **Test najpierw:** nie dotyczy (dokumenty). Kontrola przed zmianą: polecenie z weryfikacji ma
  dać trafienia w podanych liniach.
- **Weryfikacja** (wzorce uruchamiasz narzędziem Grep, nie przez powłokę):
  wzorzec `trzynast|dziesięć plików komend|Dziesięć komend|dwa skille` (bez rozróżniania wielkości
  liter) w `docs/PRZEWODNIK.md`, `docs/INSTALACJA.md`, `docs/PRZENOSNOSC.md` → brak trafień;
  wzorzec `15 RelAI commands` w `panel/hooks/register.tsx`, `panel/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` → brak trafień;
  wzorzec `ma ich czternaście` w `README.md` → brak trafień;
  wzorzec `14 hooków|czternastoma hookami` w `docs/STATE.md` → brak trafień;
  wzorzec `D-40.. → aneks` w `docs/DECYZJE.md`, tryb `count` → `3`;
  `node core/tools/release-check.js --json` → kontrola `readme-hooki` zielona;
  `node core/tools/validate-adapters.js` → kod 0 (sprawdza m.in. zgodność opisów pluginów w obu
  marketplace — jeżeli zgłosi rozjazd opisu panelu, popraw drugie miejsce wskazane w komunikacie).
- **Nie ruszasz:** `docs/ARTEFAKTY.md` (liczby w komórkach rejestru to historia wersji);
  `docs/archiwum/`; treści D-40 w linii 58 i dwóch starszych aneksów.
- **Pułapki:** `panel/hooks/register.tsx` to zmiana w modzie — dopisz `relai-panel` do listy modów
  zmienionych w tym planie (K-W3 podbija jego wersję); opis w `marketplace.json` i w `plugin.json`
  panelu musi pozostać identyczny.
- **Gotowe, gdy:** wszystkie kontrole z pola „Weryfikacja” dają podany wynik.

---

## K-W1 — kontrola przed scaleniem

- **Cel:** dowód, że gałąź jest zielona w całości, zanim trafi na `main`.
- **Pliki:** żadne.
- **Stan dziś:** nie dotyczy — karta niczego nie zmienia, tylko uruchamia kontrole; punktem
  odniesienia są liczby testów z wpisu dziennika etapu E13.
- **Zmiana:** uruchom po kolei (limit 10 minut na polecenie; `core/process/tests` ok. 110 s):

  ```bash
  node --test "core/guardrails/tests/*.test.js"
  node --test "core/process/tests/*.test.*"
  node --test "core/panel/tests/*.test.*"
  node --test "adapters/codex/tests/*.test.js"
  node --test "adapters/cursor/tests/*.test.js"
  node core/tools/validate-adapters.js
  node core/tools/sync-panel-core.js --check
  "$CLAUDE_CODE_EXECPATH" plugin test mods
  "$CLAUDE_CODE_EXECPATH" plugin test panel
  "$CLAUDE_CODE_EXECPATH" plugin test progress
  "$CLAUDE_CODE_EXECPATH" plugin test cache-keeper
  ```

  Zapisz liczby `pass` / `fail` każdego zestawu. Porównaj z liczbami z wpisów dziennika etapów
  E3–E13: żadna nie może być niższa niż ostatnia zapisana dla tego zestawu.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** wszystkie polecenia kod 0, zero `fail`; liczby wklejone do wpisu dziennika.
- **Nie ruszasz:** niczego — karta tylko mierzy. Czerwony test → zatrzymujesz się; naprawa należy
  do etapu, który go zepsuł, i wymaga decyzji człowieka (powrót do etapu albo odnoga).
- **Pułapki:** `plugin test` uruchamiaj na katalogu modu w repozytorium, nie na kopii — testy
  niczego w nim nie zapisują (FAKT, `USTALENIA_ROBOCZE.md`).
- **Gotowe, gdy:** jedenaście poleceń zielonych.

---

## K-W2 — scalenie gałęzi z `main`

- **Cel:** `main` zawiera cały plan; historia etapów zostaje czytelna.
- **Pliki:** żadne (operacja gita).
- **Stan dziś:** cała praca planu leży na gałęzi `optymalizacja/po-audycie`, po jednym commicie na
  etap; `main` stoi na stanie sprzed planu albo dalej, jeśli człowiek scalał coś w międzyczasie.
- **Zmiana:**
  1. `git status --short` → czysto (poza czterema plikami `*-closing.md` o pustym `git diff`,
     jeśli nadal są oznaczone `M`).
  2. Zapytaj człowieka o zgodę na scalenie i wypchnięcie: „Gałąź `optymalizacja/po-audycie` ma
     <N> commitów i zielone testy. Scalić z `main` commitem scalającym i wypchnąć?” — „Tak” / „Nie”.
  3. Po „Tak”: `git switch main`, `git pull --ff-only`, `git merge --no-ff optymalizacja/po-audycie -m "merge: plan OPTYMALIZACJA_PO_AUDYCIE"`,
     `git push origin main`.
  4. Poczekaj na workflow: `gh run list --workflow testy.yml --limit 1` aż do `completed`.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `git log --oneline -1` na `main` pokazuje commit scalający; przebieg `testy.yml`
  ma wynik `success`.
- **Nie ruszasz:** gałęzi `codex/panel-codex`; nie robisz `--force`, `rebase` ani `squash`.
- **Pułapki:** `git pull --ff-only` odmawia, gdy `main` się rozjechał — zatrzymaj się i zapytaj;
  pierwszy przebieg nowego workflow bywa czerwony z powodu środowiska runnera (K-G3: pokaż log,
  nie naprawiaj na ślepo); gałęzi roboczej nie kasujesz przed K-W4.
- **Gotowe, gdy:** scalenie jest na `origin/main`, a workflow zielony.

---

## K-W3 — wydanie

- **Cel:** jedna sekwencja wydania dla pluginu `relai` i każdego modu zmienionego w planie.
- **Pliki:** te, które zmienia komenda wydania (manifesty z numerem wersji, `docs/ARTEFAKTY.md`,
  `history.md`, `README.md`, `docs/STATE.md`, `docs/KOMENDY.md`).
- **Stan dziś:** wydanie prowadzi komenda projektowa `.claude/commands/relai-release.md`
  (`/relai-release`): raport `node core/tools/release-check.js --json`, naprawy po jednej zgodzie,
  publikacja krok po kroku z osobnym „tak” na każdy krok zewnętrzny, weryfikacja
  `release-verify.js`.
- **Zmiana:**
  1. Przeczytaj `.claude/commands/relai-release.md` w całości i wykonaj ją krok po kroku. **Ta
     karta niczego w niej nie zastępuje** — numery wersji proponuje raport, nie Ty.
  2. Do raportu dołóż wiedzę z planu: lista modów zmienionych w etapach E12, E13 i w karcie K-E9
     (z wpisów dziennika tych etapów). Jeśli raport nie proponuje podbicia modu, który był
     zmieniany — zatrzymaj się i zapytaj.
  3. Spodziewany rodzaj podbicia `relai`: wersja **minor** (nowy hook `bash-guard`, nowa opcja
     bramki, zmiany zachowania startu) — SZACUNEK; obowiązuje propozycja raportu.
  4. Po publikacji: `node core/tools/release-verify.js --plugin relai --wersja <N> --sesja` oraz
     to samo dla każdego wydanego modu. To jedyne miejsca, w których ten etap uruchamia świeże
     sesje.
  5. Aktualizację pluginu na tej maszynie wykonaj z `--scope user` (P-062):
     `claude plugin update relai@relai --scope user` i tak samo dla każdego wydanego modu.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `release-verify.js` kod 0 dla każdego wydanego pluginu; `git tag --list "v*" | tail -1`
  pokazuje nowy tag; `gh release view <tag>` zwraca wydanie.
- **Nie ruszasz:** kontroli w `core/tools/release-checks.js` („zmiana kontroli = zmiana z testem,
  nie obejście w komendzie”); wpisów lokalnych pluginów w innych projektach (sprawa „świadomie
  otwarta” w `STATE.md`).
- **Pułapki:** `release-check.js` kończący się kodem 1 to „są czerwone kontrole”, nie awaria —
  JSON stoi w tym samym wyniku, nie uruchamiasz skryptu drugi raz (L-0308); wersję potwierdza plik
  instalacji, nie komunikat CLI (zasada 10); każdy krok zewnętrzny (tag, push, wydanie GitHub)
  ma osobną zgodę człowieka.
- **Gotowe, gdy:** weryfikacja wydania przechodzi dla `relai` i każdego wydanego modu.

---

## K-W4 — zamknięcie planu

- **Cel:** plan zamknięty procedurą RelAI, z rozliczeniem „dowiezione wobec planu”.
- **Pliki:** wg `plan-closing.md` (STATUS, DZIENNIK, STATE, tabela ryzyk, `CLAUDE.md`
  i `AGENTS.md`, przeniesienie folderu planu do `docs/archiwum/plany/`).
- **Stan dziś:** linia „Aktywny plan” w `CLAUDE.md` i `AGENTS.md` wskazuje
  `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md`; etapy E1–E13 mają status ZREALIZOWANY.
- **Zmiana:**
  1. Wczytaj skill `relai-planning` i otwórz `plan-closing.md`; wykonaj kroki 1–9 wraz z punktem 7a (przepięcie linków, dodany kartą K-E2 w etapie E11) w podanej
     kolejności. Dwa pierwsze są blokujące: otwarte bramki manualne (m.in. wybór wariantu
     dystrybucji z etapu E2 i ewentualne decyzje z kart K-E2r, K-D12) i otwarte odnogi rozstrzyga
     człowiek.
  2. W rozliczeniu celów użyj liczb, nie przymiotników: liczba testów przed (629 + 559) i po;
     waga skrótu startu przed (26 633 B) i po (`node .claude/relai/tools/start-digest.js | wc -c`
     po aktualizacji pluginu); liczba odczytów plików testowych na starcie przed (4 324) i po
     (z testu karty K-C1); liczba znalezisk raportu zamkniętych, odłożonych i niepotwierdzonych.
  3. Ryzyka raportu, które plan zamknął albo obniżył (O4 — koszt trybu ciągłego; R5 — puchnięcie
     dokumentów; P1 — w części dotyczącej skanera Codeksa), zaktualizuj w tabeli ryzyk; każdą
     zmianę statusu uzasadnij numerem karty.
  4. Znaleziska niskiej wagi wyłączone z planu wypisz we wpisie zamykającym w sekcji „Świadomie
     odłożone” jednym zdaniem z odsyłaczem do raportu audytu.
  5. Po zamknięciu: gałąź `optymalizacja/po-audycie` skasuj lokalnie (`git branch -d`) po zgodzie
     człowieka; zdalnej nie było.
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `grep -n "^Aktywny plan" CLAUDE.md AGENTS.md` → w obu `Aktywny plan: brak` z
  odsyłaczem do `docs/archiwum/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md`;
  `ls docs/plany/OPTYMALIZACJA_PO_AUDYCIE` → brak katalogu;
  `node .claude/relai/tools/start-digest.js` kończy się kodem 0 i w sekcji „Aktywny plan” mówi
  o braku planu.
- **Nie ruszasz:** raportu `docs/AUDYT_RELAI_2026-11-09.md` (zostaje na miejscu jako źródło
  znalezisk; `.gitignore` obejmuje tylko `docs/AUDYT_*.html`).
- **Pułapki:** przeniesienie folderu planu zrywa linki względne do kart — po przeniesieniu
  sprawdź linki w `docs/STATE.md` i w sekcji „Czeka na człowieka” (karta K-E2 z etapu E11 dodała
  tę kontrolę do `plan-closing.md`; jeśli jest już w wydanej wersji procedury, po prostu ją
  wykonaj).
- **Gotowe, gdy:** trzy polecenia weryfikacji dają podany wynik, a wpis zamykający jest
  w dzienniku.
