# STATE — RelAI

Stan na: 2026-11-17 (RelAI 3.9.0 wydany; plan MODY_OSZCZEDZANIA zamknięty 2026-11-17; aktywny
plan: brak)

## Gdzie jesteśmy

RelAI **3.9.0** wydany 2026-11-17 (plan MODY_OSZCZEDZANIA — mody oszczędzania tokenów;
poprzednio 3.8.0 z 2026-11-10, naprawy po audycie). Plugin `relai` działa
w trzech narzędziach — Claude Code, Cursorze i Codeksie — na jednym rdzeniu procesu, z szesnastoma
komendami i piętnastoma hookami w Claude Code (piętnasty: `bash-guard`). Marketplace tego
repozytorium niesie też dziewięć modów: `relai-panel` 0.23.0, `relai-progress` 0.8.0,
`relai-cache-keeper` 0.14.0 („early access”), kokpit `relai-mods` 0.4.0 oraz pięć modów
oszczędzania tokenów 0.1.0: `relai-input-router`, `relai-browser`, `relai-model-router`,
`relai-effort`, `relai-research`. Wydanie robi się frazą „gotowi do wydania?”
(`/relai-release`): raport `release-check.js`, naprawy po jednej zgodzie, publikacja krok po kroku,
bramka `pre-push` na tagi. Na maszynie Łukasza `relai`, `relai-panel`, `relai-progress`,
`relai-cache-keeper` i `relai-mods` są zainstalowane w wersjach z 3.9.0 i włączone na poziomie
użytkownika (panel i cache-keeper także lokalnie w tym repo; 2026-11-17); pięciu modów
oszczędzania tu nie zainstalowano, a paczkę BenAI `token-saving-mods` odinstalowano 2026-11-17.
Tryb „RelAI tylko w projektach” jest dostępny (`relai-scope.js apply`), ale nie jest włączony.
Plan MODY_OSZCZEDZANIA zamknięty 2026-11-17 (10 etapów w siedem dni: E1–E6 Opus, E7–E9 Codex
wg Aneksu C, E10 Claude; pomiar całego pakietu na żywo, Aneks E, jedno wydanie 3.9.0 z dziewięcioma
modami); aktywny plan: brak.
Każdy push do `main` uruchamia testy rdzenia i adapterów (`testy.yml`).
PANEL_CODEX (Codex) wstrzymany 2026-10-27 decyzją Łukasza. Opinii spoza projektu nadal nie ma.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach; istniejący przechodzi adopcję
  z kopią zapasową i przetestowaną drogą powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od stanu.
- Plany powstają jako osobny dokument z wariantami i ryzykami (dla odbiorcy nietechnicznego jako
  HTML bez internetu); boczny wątek dostaje własną kartę bez ruszania zamrożonego planu.
- Szesnaście komend: etap, odnoga, kopia zapasowa, przegląd, lista zmian, przekazanie, wycieczka,
  ściąga, adopcja, aktualizacja, sprzątanie, lista modeli, załoga, optymalizator promptu,
  humanizacja tekstu (`/relai-humanize`, plan [HUMANIZACJA](archiwum/plany/HUMANIZACJA/STATUS.md))
  i skan zależności `/relai-security` z pełnym audytem `--full` (plan
  [BEZPIECZENSTWO](archiwum/plany/BEZPIECZENSTWO/STATUS.md)). Zmiana pliku blokady sama uruchamia
  szybki skan Trivy (hook `lockfile-scan`), notka tylko przy nowym CRITICAL/HIGH; Trivy jest
  pierwszym audytem zależności w punktach procesu (D-91). Codex i Cursor mają oba skille
  bezpieczeństwa; Cursor bez hooka (pomiar odłożony).
- **Pipeline wydań** (plan [PIPELINE_WYDAN](archiwum/plany/PIPELINE_WYDAN/STATUS.md), zamknięty
  2026-10-26, 5 etapów, Aneksy A–B): `node core/tools/release-check.js` — diff od ostatniego tagu
  przez mapę wpływu (`release-map.json`, plik bez wiersza = czerwień), 25 kontroli (README,
  `ARTEFAKTY.md`, historia, strona i odtwarzacz filmu, film, lista modeli, stary numer z wyjątkiem
  zapisu przeszłości, podbicie, `pre-push`, testy), propozycje numerów z conventional commits,
  tryb `--wydanie`. Komenda projektowa `/relai-release` (fraza „gotowi do wydania?”, tylko w tym
  repo). Hook `pre-push` odmawia tagu `v*` / `relai-<mod>-v*` przy czerwieni w drzewie tagu
  (worktree z LF); obejście tylko z powodem i wpisem w dzienniku. Po publikacji
  `release-verify.js` (cache = drzewo tagu, świeża sesja); `release-hint.js` mówi na starcie sesji,
  że jest co wydać. Pierwsze wydanie przez pipeline: 3.4.0 — pytania tylko o zgody i decyzje plus
  dwie fałszywe czerwienie instrumentu, obie naprawione z testem.
- **Film prezentacyjny**: 16 komend, 2 min 56 s, finał „stan z wersji 3.4.0”, dane z commitu-kotwicy
  (`docs/zasoby/film/zrodla/src/dane/kotwica.json`, `d917011`); MP4 PL i EN w zasobach wydania
  `v3.4.0`, odtwarzacz `/wideo/` i `/pl/wideo/` gra je stamtąd (kontrola `strona-film`); testy filmu
  37/37 przypięte do kotwicy.
- Podyktowane zdanie może wrócić poprawione, zanim ruszy w robotę — na żądanie albo w trybie
  ciągłym, o który sesja pyta raz; oryginał stoi obok propozycji.
- Załoga deleguje zadania do trzech narzędzi; recenzent bez prawa zapisu, dwa zadania nie piszą
  naraz do jednego pliku.
- Zadanie z kodem kończy się testami projektu i przeglądem diffu w trzech liniach; „coś nie
  działa” i pierwsze wdrożenie mają własne procedury.
- Start sesji zgłasza, co zostało niedomknięte: brakujący prompt etapu, etap bez wpisu, artefakt
  bez podbitej wersji, rozjechana kopia `CLAUDE.md`, rozjazd stanu, przekroczony budżet.
- Dokumenty nie puchną bez końca: historia idzie do archiwum bajt w bajt z sumą kontrolną; sprawy
  czekające na człowieka mają jeden adres i wracają jako pytanie, gdy czekają zbyt długo.
- Klucz API nie wejdzie do repozytorium (pre-commit w każdym narzędziu, także w projektach ESM);
  pliki robocze sprząta się raportem w grupach, jednym „tak” na grupę.
- Pytanie o model pokazuje nazwy z listy narzędzia (Claude Code: lista z 2026-11-10, także
  w pluginie od 3.8.0); prompt z `/relai-prompt` jest skrojony pod model, który go wykona.
- **Panel w Claude Code** (plany [PANEL_CLAUDE](archiwum/plany/PANEL_CLAUDE/STATUS.md),
  [WYGLAD_PANELU](archiwum/plany/WYGLAD_PANELU/STATUS.md),
  [LIMIT_CHECKPOINT](archiwum/plany/LIMIT_CHECKPOINT/STATUS.md)): nad promptem trzy paski — cache
  jako pięć baterii z kosztem sesji, plan z fokusem tej sesji, postęp etapu albo paczek odnogi;
  `/relai-panel` z formularzami komend, Mapą, Dokumentami, ściągą i Kosztami z cennikiem;
  `/relai-agents` z postaciami ról. Każda zmiana stanu przez kartę „Tak / Nie”; start etapu
  w nowej sesji aplikacji z karty; zapis pracy przed limitem 5 h i tygodniowym z kartą progu.
  Paski i panel za jasnym i ciemnym wyglądem, w każdym panelu podziału okna. Poza projektem RelAI
  paski milczą.
- **Kokpit pluginów i hooków** `/relai-mods` (plan [RELAI_MODS](archiwum/plany/RELAI_MODS/STATUS.md)):
  mody, pluginy i hooki z dysku, przełącznik przez `claude plugin` z PATH, Przeładuj w terminalu,
  na desktopie `/reload-plugins` (P-052, P-053). Od 0.3.0 wiersz „RelAI w tym projekcie”:
  Włącz/Wyłącz RelAI w folderze sesji (`--scope local`) z kartą „Tak / Nie”.
- **RelAI tylko w projektach** (plan [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md),
  zamknięty 2026-10-28, wydanie 3.6.0, D-92): w Claude Code tryb do wyboru — `relai`
  i trzy dodatki `false` w ustawieniach użytkownika, `true` w `.claude/settings.local.json`
  każdego projektu z RelAI; poza projektami RelAI nie ładuje się wcale (zmierzone: folder bez
  RelAI — tylko `relai-mods`, 0 komend, 0 kontekstu). Narzędzie `core/tools/relai-scope.js`
  (`status` / `apply` / `undo` / `on` / `off`, dziennik `~/.claude/relai/zasieg-pluginu.json`)
  uruchamiane z PowerShella (README), adopcja, inicjalizacja i `/relai-update` włączają RelAI
  w projekcie same; sesja w worktree dostaje plik lokalny (CLI 2.1.304 i aplikacja 2.1.308,
  P-058). Maszyna Łukasza przełączona 2026-10-28 (15 projektów).
- **Lżejszy start sesji** (plan [KONTEKST_STARTU](archiwum/plany/KONTEKST_STARTU/STATUS.md),
  zamknięty 2026-10-28, wydanie 3.7.0, D-15 Aneks A, D-93): rytuał startu w każdej kopii to
  `node .claude/relai/tools/start-digest.js` — sekcje STATE, ryzyka bez mitygacji, ostatni wpis,
  aktywne ustawienia, STATUS planu i drogowskazy; „Zasady aktywne” jako indeks z wyzwalaczami
  (3,4 KB), pełne brzmienie przy wyzwalaczu; skrót zawsze w limicie wyjścia — sekcja za duża staje
  się drogowskazem z zakresem linii (12 projektów Łukasza 4–26,5 tys. znaków); budżet startu liczy
  skrót (`start 55`, `zasady 5`); bramka trybu ciągłego pyta najpierw tylko o zgodę, procedurę
  czyta agent; start bez fałszywych sygnałów (plan wstrzymany, pusta rotacja, nakładka jako
  zagnieżdżony `CLAUDE.md`). Instrument `core/tools/start-context.js`.
- **Naprawy po audycie** (plan [OPTYMALIZACJA_PO_AUDYCIE](archiwum/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md),
  zamknięty 2026-11-10, wydanie 3.8.0, aneksy D-14, D-40, D-85, D-88, D-93; źródło
  [raport audytu](AUDYT_RELAI_2026-11-09.md)): skaner sekretów łapie klucze w JSON, YAML, URL,
  w poleceniu `Bash` i złożone z edycji, pre-commit skanuje pliki przemianowane i UTF-16; awaria
  hooka zostawia ślad, guardy przy błędzie pytają; piętnasty hook `bash-guard` ostrzega przed
  czterema nawykami powłoki, hook Stop przypomina o commitach od ostatniego wpisu; deinstalator
  Cursora w granicach `.cursor/`, załoga bez zmiennych gospodarza; hook startu czyta pliki raz,
  specyfikacje kopiuje przy zmianie; progi dokumentów osiągalne rotacją; bramka trybu ciągłego
  z trwałą odmową; prompty etapów z numerami zasad; mody mówią, że się nie narysowały, i niosą
  tylko importowane pliki rdzenia; workflow `testy.yml` (Windows, Node 24, `autocrlf false`).
- **Strona-wizytówka** https://nowilus.github.io/relai/ (plan
  [STRONA_RELAI](archiwum/plany/STRONA_RELAI/STATUS.md)): Film (`/`, `/pl/`) i Biurko 3D
  (`/biurko/`, `/pl/biurko/`, z plakatem bez WebGL), obie na telefonie, konfigurator instalacji
  i ankieta w Tally (PL https://tally.so/r/BE4lQ5, EN https://tally.so/r/X5lkMj). Wdrożenie
  `.github/workflows/strona.yml` po pushu na `main`; konfigurator pokazuje RelAI 3.8.0. Testy 396,
  w tym test odwołań: zbudowana strona wskazująca nieistniejący plik zatrzymuje wdrożenie.
- **Zgłoszenia z GitHuba #1–#3** (plan [ZGLOSZENIA](archiwum/plany/ZGLOSZENIA/STATUS.md),
  zamknięty 2026-10-27, wydanie 3.5.0): nowa sesja po „Nowa sesja” / `/handoff` dostaje tytuł
  „E<N> · PLAN — nazwa etapu” z hooka `session-title` (czternasty hook; źródło: przekazanie,
  fokus sesji albo STATE; „pierwszy prompt” z transkryptu, P-055); „kończymy na dziś” pyta raz
  o istniejący plik wznowienia i po „tak” kasuje sam `.md`; pasek cache w terminalu to siatka do
  trzech kolumn bez drugiej linii. Obie bramki zmierzone w aplikacji po wydaniu.
- Skille według praktyk Agent Skills (odnoga [AUDYT_SKILLI](fixy/AUDYT_SKILLI/ODNOGA.md)):
  walidator metadanych, pliki doczytywane, ewaluacje wyzwalania, pięć komend tylko na jawne
  wywołanie.
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- Aktywnego planu brak. Ostatni zamknięty: [MODY_OSZCZEDZANIA](archiwum/plany/MODY_OSZCZEDZANIA/STATUS.md)
  (2026-11-17, wydany w 3.9.0) — pięć modów oszczędzania tokenów (`relai-input-router`,
  `relai-browser`, `relai-model-router`, `relai-effort`, `relai-research`, własny kod, zachowanie
  jak paczka BenAI), rdzeń `savings-gates`/`savings-ledger` i zakładka „Oszczędności”
  w `relai-panel`; pomiar całego pakietu na żywo w
  [POMIAR_E10](archiwum/plany/MODY_OSZCZEDZANIA/POMIAR_E10.md), poprawki z pomiaru w
  [Aneksie E](archiwum/plany/MODY_OSZCZEDZANIA/ANEKS_E_POPRAWKI_POMIARU_E10.md). Kandydaci
  na następną pracę (`/relai-update`, G1, rotacja dokumentów) — w „Co dalej”.
- **PANEL_CODEX — nieaktywny, WSTRZYMANY 2026-10-27** decyzją Łukasza (plan
  [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md), ZAAKCEPTOWANY 2026-10-10, 8 etapów, Codex
  `gpt-6.1-sol`). Stan zatrzymania E1: natywny widok i wiadomość do bieżącego czatu potwierdzone
  sondą 0.0.7; pakiet `adapters/codex/panel/` 0.1.0 (13 testów) — na gałęzi `codex/panel-codex` —
  pokazuje właściwy stan; sonda 0.0.9 z poprawką fontów czeka na pomiar. Wznowienie tylko decyzją
  Łukasza. Pakiet i jego README leżą na gałęzi `codex/panel-codex` (`adapters/codex/panel/`), nie
  na `main`. Warunek startu E1 po wznowieniu (decyzja Łukasza 2026-11-10): przepisać
  `plany/PANEL_CODEX/PROMPT_ETAP_1.md` do kształtu z numerami zasad zamiast odpisu (44 569 B, odpis
  27 503 B).
- Wydane w 3.7.0 razem z planem: wiersz `installPath` w README i `KOMENDY.md` po przełączeniu
  maszyny (P-059) i przyciski paska postępu `relai-progress` 0.7.1 (MINIPLAN PRZYCISKI_POSTEPU).

## Co dalej

- **Po MODY_OSZCZEDZANIA (2026-11-17):** **świadomie otwarte** (decyzja Łukasza) — pomiar na
  żywo dwóch wierszy macierzy POMIAR_E10: nr 23 (Research: skaner sekretów przed wynikiem agentów
  deep) i nr 26 (Cache Keeper: migracja ustawień do `/config` na prawdziwej instalacji 0.14.0);
  oba mechanizmy pokryte testami modów. **Świadomie odłożone:** Input Router traktuje odpowiedź
  „gotowe” jako treść zadania (lista `isBareYes` zna tylko „tak”, LOW) — poprawka przy następnym
  wydaniu modu; nowy render filmu z zakładką „Oszczędności” (do tego czasu wyjątek
  `zakladki-poza-filmem` w `release-map.json`); linia instalacji z marketplace w README pięciu
  nowych modów i uwagi ścisłego TypeScript z type-checkera `plugin validate` (ostrzeżenia, nie
  błędy); trwała poprawka obciętego raportu `release-check --json` (P-077). Opisane zamiast
  zmiany kodu: `from` w rekordzie Effort, budżet 10 s opisu Browsera, auto Research przy
  streszczaniu `WebSearch` przez silnik (Aneks E.2–E.4, P-073).
- **Kandydaci na plan:** dystrybucja G1 (A media poza repo 36,6 MiB / B plugin w podkatalogu
  3,8 MiB / C gałąź albo podkatalog w źródle gitowym ok. 3,8 MiB; liczby w
  [POMIARY.md](archiwum/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md); osobny plan później); migracja
  projektów sprzed KONTEKST_STARTU przez `/relai-update` (rytuał jednym poleceniem, „Zasady
  aktywne” jako indeks); tryb ciągły optymalizatora dla Cursora i Codeksa z licznikiem kosztu
  (2026-10-15); ustalenia spoza audytu modów (pięć `outOfScope`, wariant B „jedna listwa”) —
  plan, odnoga albo odrzucić.
- **`/relai-release` i wydania:** krok 1 bez filtra raportu (L-0308, L-0341, P-077); kolejność
  „tag → wydanie z zasobami → push `main`” przy zasobach na stronie (L-0280) i krok 8 bez
  restartu przed `--sesja`; `--scope user` w kroku 8; `strona-film` nie pilnuje czasu ani rozmiaru
  filmu w odtwarzaczu; bramka bez testów filmu (`--rev` bez `node_modules`); raport wydania bez
  nazw porażek `plugin test` (trzy ostatnie linie); `relai-panel` chwieje się pod obciążeniem
  (~5 s przy równoległych przebiegach); brak ikony pluginu; miniatura filmu w README ze starego
  filmu; parzystość Codeksa przy `core.autocrlf=true` i sumy bez CRLF → LF.
- **Świadomie otwarte:** pomiar w Cursorze, czy koder bez `-f` uruchomi testy (K-D7), i zdarzenia
  po narzędziu (`postToolUse` / `afterFileEdit` / `afterShellExecution` → `lockfile-scan`
  w instalatorze); wpisy lokalne pluginów w PolyFlow, PolyFlow-rust, PekaoWektor i dwóch
  worktree na 3.6.0–3.7.0 (P-062 — `claude plugin update … ` z katalogu projektu); bramki: start
  etapu z karty panelu bez drugiego pytania (E5 PANEL_CLAUDE), brak pytania po zadaniu w tle
  (Aneks H), bramka trybu ciągłego na odpowiedzi z karty startu (L-0189); filtr potwierdzeń
  bez „Tak, zaczynamy”.
- **PANEL_CODEX (po wznowieniu decyzją Łukasza):** E1 — przeładować klienta MCP, zmierzyć sondę
  0.0.9 (fonty, przyciski, świeży szkic), prompt E2 po odbiorze E1; potem aneks z zapisem pracy
  przed limitem (2026-10-12). Z nim: podział `register.tsx`, los `cache-timer.mjs` (K-F4, K-F5),
  przepięcie `prompt-mode.js` na `threshold.js`.
- **Strona:** ankieta i kierunek (Aneks D pkt 3 STRONA_RELAI); Biurko na słabszym laptopie (T1,
  `site/README.md`); teksty EN u native speakera; karta „Zacznij tutaj” przy 1024 px, logo zasłony
  Filmu po SVG.
- **Kokpit i zasięg (ZASIEG_PLUGINU):** `undo` zostawia pusty `"enabledPlugins": {}` (P-058);
  „Włącz” przy stanie „● włączony z ustawień globalnych” myli — lepiej „Przypnij w tym projekcie”;
  `.worktreeinclude` w 9 pozostałych projektach zostaje lokalny (decyzja Łukasza).
- **Bezpieczeństwo:** override `zod` 4.6.6 w narzędziach filmu zdjąć, gdy Remotion przypnie
  bezpieczny `zod`; `apply_patch` w Codeksie nie wyzwala skanu pliku blokady; zaufanie hooka
  `lockfile-scan` w przeglądzie hooków Codeksa (P-054).
- **Modele i nakładki:** `/relai-models` w Codeksie (lista z 2026-09-05), nakładka `openai` bez
  reguł z nazwą modelu; nakładki `claude` i `openai` z 2026-09-24 starsze niż 30 dni.
- **Cudze projekty:** ExpensesManager pod 2.8.0 (P-007); PolyFlow i JiraManager — pre-commit
  od nowa, w PolyFlow 60 martwych linków i rotacja; migracja JiraManagera czeka na właściciela (R5).
- **Drobne:** znaleziska niskiej wagi audytu 2026-11-09; katalog `adapters/claude-code/hooks/.claude/`
  z 2026-10-27 (ignorowany, 0,9 MB); skrót startu ponad celem kart (23,5 KB wobec 19,2 KB);
  `docs/USTAWIENIA.md` ponad 6 KB; sekcja ryzyk 18,2 KB / 12 KB bez wierszy `ZAMKNIĘTE`;
  `work-artifacts.js` (`kasuj` melduje sukces na nieistniejącej ścieżce, `zachowaj` na cudzej
  pisze marker w projekcie sesji); `PRZENOSNOSC.md` 2.3; metadane sesji `ProbaCursorE6`;
  typografia modów na Claude Code ≥ 2.1.299; zrzut paska plan po `/clear`; ewaluacje komend;
  `relai-prompt.md` ponad 20 KB; `crew.js review` z `--color` w Codeksie; sprzątanie
  `.claude/relai/pomiary/` przy 10 MB (C11); wątek `OPIS_REPO`.

## Co blokuje

- Sandbox Codeksa daje `spawnSync node/git EPERM`, więc pełne zestawy i `release-check` robi
  bramka Claude poza nim (cztery czerwienie wyglądu z 2.1.323 naprawione w 3.9.0, Aneks E.10).
- Ochrona konfiguracji jest doradcza (`ask`): w sesji z automatyczną akceptacją przepuszcza zapis.
- Sesja Cursora w tym folderze nie ma kontekstu RelAI ani blokady sekretu (D-89).
- Świeża sesja CLI bywa niedostępna — etap oparty na niej sprawdza ją przed startem.
- Decyzje czekające na człowieka: sekcja „Czeka na człowieka” w dzienniku.

---

## Szczegóły techniczne

### Wersja i instalacja

Repo i publicznie **3.9.0** (tag `v3.9.0` na `29f65d3`); marketplace w tym repozytorium (scope
`user`) niesie dziesięć pluginów: `relai` i dziewięć modów z własnymi wersjami i tagami
(`relai-panel-v0.23.0`, `relai-progress-v0.8.0`, `relai-cache-keeper-v0.14.0`,
`relai-mods-v0.4.0`, `relai-browser-v0.1.0`, `relai-input-router-v0.1.0`,
`relai-model-router-v0.1.0`, `relai-effort-v0.1.0`, `relai-research-v0.1.0`, każdy z własnym
wydaniem GitHub). CI: `.github/workflows/testy.yml` —
pięć zestawów `node --test` i `validate-adapters.js` przy pushu do `main` i w PR (bez testów
modów, które wymagają binarki Claude Code). Na maszynie Łukasza pluginy są włączone
na poziomie użytkownika i lokalnie w projektach z markerem RelAI (stan z `relai-scope.js status`,
2026-11-10; po pomiarze E10 włączone z powrotem 2026-11-17). Wydanie: fraza „gotowi do wydania?” →
`/relai-release` (`.claude/commands/`, wersja 2): raport `release-check.js --json`, podział braków
na naprawy bezpieczne (jedna zgoda) i listę dla człowieka, ponowny raport, `claude plugin validate`
binarką aplikacji, commit, tag przez hook `pre-push` (`core/tools/release-pre-push.js`,
instalator `install-prepush.js`, w `.git/hooks/` tego klonu), push, wydanie GitHub z notatkami EN,
`marketplace update`, `plugin update` (na tej maszynie także `--scope user`, P-062),
`release-verify.js --plugin <p> --wersja <n> --sesja` (3.9.0: 1737/1737, 0 rozjazdów; mod
wyłączony w ustawieniach daje czerwień sesji mimo zgodnych plików). Raport ma kody 0 / 1 / 2; `--rev <rewizja>` liczy drzewo
rewizji w worktree z `core.autocrlf=false` (Aneks B); `--komponent relai-<mod>` dla tagu modu;
baza modu przy `--rev` pomija tag stojący na samej rewizji (Aneks B ZASIEG_PLUGINU).
Walidator `core/tools/validate-adapters.js` sprawdza 7 źródeł wersji i wpis marketplace każdego
pluginu panelu. Pre-commit repo: układ 1.9.2.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji, artefakty robocze, załoga, tryb ciągły, baza reguł optymalizatora z nakładkami `claude`
i `openai`, walidator, narzędzia wydań (`core/tools/release-*.js`, `release-map.json`), rdzeń
panelu `core/panel/*.mjs`. **Adapter Claude Code**: dwa skille z plikami doczytywanymi,
`trivy-scan` i kopia `security-audit` Cloudflare, 16 komend, 4 agenci, 15 hooków, lista modeli
z 2026-11-10. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki, instalator, cztery skille.
**Adapter Codex**: manifest, 16 skilli komend i 4 dołączone, router `AGENTS.md`, cztery hooki
(z `lockfile-scan`); pakiet panelu `adapters/codex/panel/` w budowie wstrzymanej (PANEL_CODEX E1, od 2026-10-27).

### Pluginy panelu (Claude Code Mods, „early access”, zmierzone na 2.1.295)

`panel/` (`relai-panel`), `progress/` (`relai-progress`, fork `savvy-progress` MIT),
`cache-keeper/` (`relai-cache-keeper`), `mods/` (`relai-mods`); każdy z kopią rdzenia
z `sync-panel-core.js`, pilnowaną testem. Pomiary kosztów w `.claude/relai/pomiary/` (poza gitem),
cennik w `.claude/relai/panel/cennik.json`. Wygląd: [STYL_PASKOW_CLAUDE.md](zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md)
(v5.1) i [DESIGN.md](zasoby/PANEL_RELAI/DESIGN.md) (1.3); ograniczenia silnika: P-017–P-024
w [PULAPKI.md](PULAPKI.md); [karta AUDYT_MODOW](fixy/AUDYT_MODOW/ODNOGA.md). Mody oszczędzania
(`browser/`, `input-router/`, `model-router/`, `effort/`, `research/`, zmierzone na 2.1.325)
mają status pełny, nie „early access” (decyzja Łukasza 2026-11-17), wspólny rejestr
`~/.claude/relai/oszczednosci/rejestr/` i zgodę raz na projekt. Testy:
`claude plugin test` binarką aplikacji (`claude` na PATH to starsza wersja, P-024).

### Wymagania i linki

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie) • Repo: github.com/nowilus/relai • Wydanie: github.com/nowilus/relai/releases/tag/v3.9.0 • Plany
zamknięte: [docs/archiwum/plany/](archiwum/plany/) • Backupy: `C:\Users\Lukasz\Backupy\RelAI` •
[PRZENOSNOSC.md](PRZENOSNOSC.md) • [PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Kontekst pierwszej tury po KONTEKST_STARTU (E5, `claude -p`, Opus 5.5, RelAI po turze
z zadaniem): „kontynuujemy pracę” 32 377 tokenów, bramka + „nie” 27 744, zadanie z wyzwalaczem
24 732 — wobec ok. 72 tys. przed planem; pomiary „przed”, po E2 i koszt bramki trybu ciągłego
w [archiwum planu](archiwum/plany/KONTEKST_STARTU/STATUS.md) •
Plany zamknięte: 23 (ostatni MODY_OSZCZEDZANIA, 2026-11-17) • Aktywne: brak • Wstrzymane:
PANEL_CODEX (Codex, od 2026-10-27) • Start sesji: 109,3 KB / 100 KB na starcie 2026-10-28 (pliki), po planie 50,2 KB / 55 KB (skrót) •
Dziennik: 88 KB / 150 KB (rotacja 2026-11-17) • Ryzyka: 20 w tabeli, 18,2 KB / 12 KB (dolna
granica — same otwarte), archiwum 12 plików • Lekcje: ok. 31 KB bez „Zasad aktywnych” / 50 KB
(rotacja 2026-11-17) • Adaptery: 3 •
Komendy: 16 • Hooki Claude Code: 15 • Testy (2026-11-17, raport wydania 3.9.0): rdzeń, panel,
Codex i Cursor 768, strona 396, film 37 (2026-10-26); mody 900 (`relai-panel` 224,
`relai-progress` 51, `relai-cache-keeper` 219, `relai-mods` 92, `relai-browser` 28,
`relai-input-router` 81, `relai-model-router` 104, `relai-effort` 33, `relai-research` 68) • Projekty z markerem RelAI na tej maszynie: 15 (status
`relai-scope` 2026-10-28) • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed
migracją) • Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto,
Grok 4.6).
