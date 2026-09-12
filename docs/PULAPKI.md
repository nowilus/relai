# PUŁAPKI — budowa RelAI

Rzeczy, które zaskoczyły i zaskoczą znowu: zachowania narzędzi, kolejności kroków, wymogi
środowiska. Czytaj **na żądanie** — zanim uznasz, że coś jest zepsute. Najnowsze u góry.

Ten plik **nie jest czytany przy starcie sesji** i nie liczy się do budżetu warstwy startowej.
Specyfikacja: `SPEC_PULAPKI.md`.

## Pułapki

### P-013 — korzeniowy `hooks/` ładuje się obok hooków zadeklarowanych w manifeście · 2026-09-12 · AKTYWNA

- **Objaw:** dwa bloki kontekstu startu sesji zamiast jednego — drugi w języku i brzmieniu **innego
  adaptera** — oraz komunikat przy zamknięciu sesji: `SessionEnd hook [...] failed: Hook JSON output
  validation failed — (root): Invalid input`. Manifest jest poprawny, `claude plugin validate`
  mówi `✔ Validation passed`, komendy działają, więc nic nie wskazuje na wadę pakowania.
- **Przyczyna:** `hooks/` w korzeniu repozytorium jest dla Claude Code **katalogiem konwencyjnym**,
  tak samo jak `commands/`, `skills/` i `agents/`. Pole `hooks` w `plugin.json` nie zastępuje tej
  konwencji, tylko ją **uzupełnia** — więc hooki innego adaptera, trzymane w korzeniu dla jego
  własnej konwencji (Codex szuka ich właśnie tam), uruchamiają się dodatkowo. Stąd duplikat
  `SessionStart` i błąd `SessionEnd`: schemat `SessionEnd` w Claude Code **nie przyjmuje**
  `additionalContext`, który dla Codeksa jest poprawny.
- **Obejście:** skrypt wołany z korzeniowego `hooks/hooks.json` dostaje **bramkę hosta** — pod
  Claude Code kończy się cicho kodem 0 (`if (process.env.CLAUDECODE) process.exit(0);`, w `.sh`
  i `.cmd` odpowiednik na tej samej zmiennej). Sygnał `CLAUDECODE` jest obecny w sesji Claude Code
  (zmierzone 2026-09-12) i zgodny z konwencją rozpoznania narzędzi w `core/process/crew.js`.
  Guardrail nie traci ochrony: skan sekretów w Claude Code robi hook adaptera Claude Code,
  zarejestrowany na `PreToolUse`. W RelAI pilnuje tego `core/tools/validate-adapters.js` —
  każdy skrypt z korzeniowego `hooks.json` musi nieść bramkę, inaczej walidator kończy kodem 1.
- **Zasięg:** trzeci przypadek tej samej klasy po P-010 (korzeniowy `skills/`) — **katalog
  konwencyjny hosta wygrywa z manifestem i robi to po cichu**. Zanim uznasz, że plugin
  wieloadapterowy jest poprawnie spakowany, wypisz katalogi konwencyjne narzędzia i sprawdź, czy
  któryś z nich nie należy w Twoim repozytorium do kogoś innego. Zmierzone na świeżej instalacji
  publicznej 2.1.3 w izolowanym `CLAUDE_CONFIG_DIR`. Naprawione w 2.1.4.

### P-012 — dwukropek w opisie komendy sprawia, że komenda znika bez słowa · 2026-09-06 · AKTYWNA

- **Objaw:** plugin ładuje się poprawnie, komendy działają — **poza jedną**. Nie ma jej w
  podpowiadaczu ani na liście widzianej przez model, a plik leży na miejscu i wygląda jak reszta.
  Ani sesja, ani log aplikacji, ani `claude plugin validate` nie mówią o niej ani słowa: walidator
  sprawdza **manifest**, nie nagłówki plików komend.
- **Przyczyna:** `description:` w nagłówku to **niecytowany skalar YAML**. Dwukropek ze spacją
  w środku (`…orkiestratorem celu: wywiad o role…`) czyni z niego mapę, nagłówek przestaje się
  parsować i komenda wypada. Reszta pluginu działa dalej, więc nic nie sugeruje awarii.
- **Obejście:** bierz wartość w cudzysłów, gdy zawiera `: ` — to samo dotyczy `argument-hint`.
  W RelAI pilnuje tego `core/tools/validate-adapters.js` (kontrola nagłówków wszystkich komend).
- **Zasięg:** nagłówki YAML komend i skilli. Zmierzone 2026-09-06 na wszystkich zainstalowanych
  pluginach: spośród komend **tylko** `relai-crew.md` miała `: ` w opisie i **tylko** ona się nie
  ładowała. Codex tego samego opisu nie odrzucał — parsery różnią się tolerancją, więc działanie
  w jednym narzędziu niczego nie dowodzi o drugim. Naprawione w 2.1.3.

### P-011 — katalog w polu `agents` unieważnia CAŁY manifest pluginu · 2026-09-06 · AKTYWNA

- **Objaw:** plugin nie ma ani jednej komendy, mimo że pliki komend leżą na miejscu i mają poprawny
  frontmatter. Sesja nie mówi nic. `claude plugin list` pokazuje `Status: ✘ failed to load`,
  a okno `/plugin` — `Validation errors: agents: Invalid input`.
- **Przyczyna:** pola `commands` i `skills` przyjmują **katalogi**, pole `agents` — **wyłącznie
  pliki `.md`**. Ta niesymetryczność nie rzuca się w oczy i kusi, żeby napisać
  `"agents": ["./adapters/claude-code/agents/"]` przez analogię. Manifest odpada wtedy **w całości**,
  więc przestają działać także `commands`, `skills` i `hooks` — nie tylko agenci.
- **Obejście:** wymieniaj pliki po jednym
  (`"./adapters/claude-code/agents/relai-coder.md"`, …). **Przed każdym wydaniem uruchamiaj
  `claude plugin validate <ścieżka>`** — to narzędzie mówi wprost, które pole odpadło, a bez niego
  jedynym śladem jest okno `/plugin`, do którego nikt nie zagląda. W RelAI pilnuje tego dodatkowo
  `core/tools/validate-adapters.js`.
- **Zasięg:** manifest pluginu Claude Code. W RelAI weszło z 2.1.0 (commit `6bec097`, razem
  z trzema agentami `/relai-crew`) i przez dwa wydania maskowało się nawzajem z P-010: dopóki
  korzeń miał `skills/`, plugin wyglądał na działający, bo skille odnajduje **domyślny skan**,
  bez manifestu. Naprawione w 2.1.2.

### P-010 — katalog `skills/` w korzeniu kasuje komendy pluginu Claude Code · 2026-09-06 · AKTYWNA

- **Objaw:** komendy pluginu przestają istnieć — `/relai` nie podpowiada niczego, a plugin poza tym
  działa (hooki, skille). Żaden komunikat nie trafia do sesji; ślad jest wyłącznie w logu aplikacji
  `%LOCALAPPDATA%\Claude\logs\main.log`, po jednej linii na komendę:
  `[warn] [PluginScan] Skipping legacy command "relai:relai-crew" — name collides with skills/ entry`.
- **Przyczyna:** aplikacja skanuje katalog `skills/` **w korzeniu pluginu** niezależnie od tego, co
  deklaruje `.claude-plugin/plugin.json`, i przy kolizji nazw wygrywa skill, a komenda jest
  pomijana jako „legacy". W RelAI korzeń zawiera skille wygenerowane dla **Codeksa**
  (`.codex-plugin/plugin.json` → `"skills": "./skills/"`), o nazwach identycznych z komendami — bo
  jedne i drugie powstają z tego samego źródła. Oba marketplace'y mają `"source": "./"`, więc
  artefakt jednego adaptera leży fizycznie wewnątrz pluginu drugiego.
- **Obejście:** trzymaj powierzchnie adapterów w rozłącznych katalogach; korzeń repozytorium
  wspólnego dla wielu narzędzi nie jest niczyją prywatną przestrzenią nazw. Przy sprawdzaniu, czy
  komendy się załadowały, patrz w log aplikacji — brak komendy nie zgłasza się nigdzie indziej.
- **Zasięg:** repozytorium obsługujące więcej niż jedno narzędzie z jednego korzenia. W RelAI weszło
  wydaniem **2.0.0** (commit `e36cb6e`, katalog `skills/`), pierwszy skip w logu 2026-09-05 23:26:28;
  wersje 1.8.1–1.9.2 nie miały korzeniowego `skills/` i komendy w nich działały.

### P-009 — długi opis w jednej komórce zmniejsza obrazek w sąsiedniej kolumnie · 2026-09-06 · AKTYWNA

- **Objaw:** ikony w tabeli README, wstawione jako `<img … width="24">`, renderują się mniejsze
  niż 24 px — i to bez żadnej zmiany w plikach graficznych. Zmierzone: pliki SVG nietknięte od
  1.8.0, a ikony skurczyły się po commicie, który dodał **wiersz tekstu**.
- **Przyczyna:** GitHub renderuje tabele z `table-layout: auto`, więc szerokości kolumn wynikają
  z zawartości. Jedna komórka dłuższa od reszty (u nas opis `/relai-crew`: **204** znaki wobec
  67–100 w pozostałych wierszach) zabiera szerokość dla swojej kolumny, a kolumna z samym
  obrazkiem dostaje resztki. Wtedy `.markdown-body img { max-width: 100% }` skaluje obrazek
  **poniżej** deklarowanej szerokości. Atrybut `width` jest życzeniem, nie gwarancją.
- **Obejście:** nie stawiaj obrazka w osobnej, wąskiej kolumnie. Scal go z kolumną, której
  szerokość wymusza tekst (`<img … width="24" align="absmiddle">` w jednej komórce z nazwą),
  i pilnuj, żeby żaden opis nie był dwa razy dłuższy od reszty. Grubsza kreska w SVG jest
  leczeniem objawu — obrazek nadal będzie mniejszy.
- **Zasięg:** każdy Markdown renderowany przez GitHub i przez podglądy używające jego CSS; im
  węższy widok, tym wcześniej to uderza. Źródło: naprawa README 2026-09-06.

### P-008 — sandbox Codeksa nie ma działającego Git Basha · 2026-09-05 · AKTYWNA

- **Objaw:** test uruchamiający `git commit` przez powłokę kończy się w sesji Codeksa błędem
  `CreateFileMapping … Win32 error 5`, a nie asercją. Ten sam test uruchomiony w zwykłej sesji
  przechodzi. Sprawdzone: `install-precommit.test.js`, pełny cykl B — 932 ms i zielono poza
  sandboxem, twardy błąd wewnątrz.
- **Przyczyna:** sandbox Windows Codeksa (`[windows] sandbox = "unelevated"` w `~/.codex/config.toml`)
  blokuje mapowanie pamięci, którego MSYS2 używa przy starcie. Dotyczy całej rodziny `sh`/`bash`
  z Git for Windows, nie samego gita.
- **Obejście:** nie każ Codeksowi mierzyć niczego, co przechodzi przez powłokę POSIX-ową.
  Zlecenia formułuj tak, żeby weryfikacja szła przez `node` i API, a testy powłokowe **powtórz
  sam** po jego zakończeniu. Codex sam ten błąd rozpoznaje i raportuje — jego „test nie przeszedł"
  nie znaczy „kod jest zły", dopóki nie powtórzysz przebiegu na zewnątrz.
- **Zasięg:** każde zlecenie `codex-companion.mjs task --write` na Windows. Objaw pokrewny w tej
  samej sesji: `spawnSync` z potokami nie zwracał wyjścia, więc Codex sam obszedł to pomiarem
  przez pliki (`file-stdio.cjs`).

### P-007 — o systemie modułów pliku w `.git/hooks/` rozstrzyga `package.json` projektu · 2026-09-04 · AKTYWNA

- **Objaw:** `ReferenceError: require is not defined in ES module scope` przy **każdym** commicie
  w projekcie, którego `package.json` ma `"type": "module"` — mimo że hook jest poprawnym
  CommonJS-em. Hook fails-closed, więc projekt traci możliwość commitowania czegokolwiek, a człowiek
  widzi stack trace Node'a zamiast komunikatu RelAI.
- **Przyczyna:** Node wybiera system modułów po **najbliższym `package.json` w górę drzewa**.
  Dla `.git/hooks/` tym najbliższym jest `package.json` projektu — katalog `.git/` nie jest
  granicą. Plik bezrozszerzeniowy i plik `.js` podlegają tej samej regule.
- **Obejście:** rozszerzenie `.cjs` wygrywa z każdą wartością `"type"`. Od 1.9.2 instalator
  RelAI kładzie logikę jako `relai-pre-commit.cjs` i `relai-secret-scan.cjs`, a sam
  `.git/hooks/pre-commit` jest shimem `#!/bin/sh` z `exec node`. Drugie obejście, gdyby trzeba
  było ratować cudzy hook: `.git/hooks/package.json` z `{ "type": "commonjs" }`.
- **Zasięg:** każdy hook gita napisany w Node w projekcie ESM — nie tylko RelAI. Sprawdzenie
  instalacji: hook uruchomiony przy pustym indeksie ma kończyć się kodem 0; od 1.9.2 robi to sam
  instalator (test dymny z cofnięciem). Źródło: zgłoszenie zewnętrzne 2026-09-04, Node 24.13.1.
- **Sprawdzenie samego skanu** — kanoniczna wartość przykładowa z dokumentacji AWS
  (`AKIAIOSFODNN7EXAMPLE`) ma **przechodzić**, a ten sam wzorzec bez markera przykładu ma być
  zatrzymany. Do 1.9.1 blokowane było jedno i drugie, więc tego zdania nie dało się zapisać:

  ```
  node <RelAI>/core/guardrails/secret-scan.js docs/PULAPKI.md
  ```

  Oczekiwany wynik dla tego pliku: `BRAK` i kod 0.

### P-006 — `git archive | tar` na Windows nie robi kopii drzewa · 2026-08-12 · AKTYWNA

- **Objaw:** `tar: Cannot connect to C: resolve failed` przy próbie zmaterializowania drzewa
  dowolnego commita.
- **Przyczyna:** GNU tar czyta ścieżkę `C:\...` jako `host:ścieżka`, czyli adres archiwum zdalnego.
  Litera dysku wygląda dla niego jak nazwa hosta.
- **Obejście:** `git worktree add --detach <katalog> <ref>`, sprzątanie
  `git worktree remove --force <katalog>`. Działa niezależnie od systemu, nie wymaga pośredniego
  archiwum i zostawia czysty stan. Rurociąg `git archive | tar` zostaw dla Uniksa.
- **Zasięg:** Git Bash na Windows, GNU tar; nie dotyczy Linuksa ani WSL. Źródło: L-0039.

### P-005 — `claude plugin update` nie działa do restartu aplikacji · 2026-08-10 · AKTYWNA

- **Objaw:** `installed_plugins.json` pokazuje nową wersję i `gitCommitSha`, CLI melduje „updated
  from X to Y", a sesje ładują starą treść skilla. Objawem jest **brak objawu**: nic nie protestuje,
  a mierzysz starą wersję.
- **Przyczyna:** `plugin update` podmienia wpis instalacji i pobiera nowy katalog cache, ale
  działająca aplikacja nadal ładuje stary — komunikat „Restart to apply changes" jest dosłowny.
  Gorzej: mechanizm kontrolny wbudowany w plugin **sam pochodzi ze starej wersji**, więc porównuje
  X z X, widzi zgodność i milczy. Kontrola wbudowana w wersję X nie wykryje, że działa X zamiast Y.
- **Obejście:** po `claude plugin update` **zrestartuj aplikację**, zanim cokolwiek zmierzysz.
  Którą wersję sesja naprawdę wykonuje, sprawdzasz po **ścieżce cache w transkrypcie** albo po
  treści pliku, który się zmienił — nie po `installed_plugins.json` i nie po komunikacie CLI.
  Warstw jest cztery: `plugin details` pokazuje wersję z marketplace, `plugin install` na
  zainstalowanym jest no-opem, `plugin update` porównuje numer wersji, a cache w pamięci aplikacji
  przeżywa je wszystkie do restartu.
- **Kolejność działa w obie strony** (2026-09-04, 1.9.1 → 1.9.2): sam restart nie ładuje niczego
  nowego, bo katalog nowej wersji pojawia się w cache'u dopiero przy `claude plugin update`.
  Po restarcie bez update `~/.claude/plugins/cache/<marketplace>/<plugin>/` kończył się na starej
  wersji, a hook startu meldował rozjazd „projekt 1.9.2 / plugin 1.9.1". Sekwencja to
  **update → restart → sprawdzenie treścią plików z cache'u**; żaden z tych kroków nie zastępuje
  pozostałych.
- **Zasięg:** Claude Code, aplikacja desktopowa; potwierdzone na 0.9.0 → 1.0.0 oraz 1.9.1 → 1.9.2.
  Źródło: L-0031, L-0020.

### P-004 — `acceptEdits` nie obejmuje poleceń Bash · 2026-08-09 · AKTYWNA

- **Objaw:** sesja `claude -p` z `--permission-mode acceptEdits` zatrzymuje się w połowie
  scenariusza i raportuje brak dostępu do narzędzia. Wygląda to na zadziałanie bramki logicznej,
  a jest brakiem uprawnień.
- **Przyczyna:** `acceptEdits` auto-akceptuje **wyłącznie edycje plików**. Każde polecenie systemowe
  (Bash, PowerShell) wymaga osobnej zgody, której w trybie `-p` nie ma kto wyrazić.
- **Obejście:** scenariusz wymagający narzędzia systemowego (pakowanie, git, node) uruchamiaj
  z jawnym `--allowedTools "Bash"` obok `--permission-mode acceptEdits`. Przed interpretacją wyniku
  rozstrzygnij, czy zatrzymanie wynikło z logiki komendy, czy z braku uprawnień.
- **Zasięg:** Claude Code CLI, tryb `-p`. Źródło: L-0028.

### P-003 — PowerShell 5.1 zjada polskie znaki przy **odczycie** · 2026-08-08 · AKTYWNA

- **Objaw:** treść dopisana do dokumentu ląduje w pliku jako „### 2026-08-08 Ă˘â‚¬â€ť E8: profile
  projektÄ‚Ĺ‚w…" — mimo poprawnego kodowania zapisu.
- **Przyczyna:** przekłamanie następuje przy **odczycie**, nie przy zapisie: `Get-Content -Raw` bez
  jawnego `-Encoding UTF8` interpretuje plik jako ANSI (strona kodowa systemu). `Add-Content
  -Encoding utf8` zapisuje potem poprawnie już zepsute znaki.
- **Obejście:** dokumentów z polskimi znakami **nie przepuszczaj przez PowerShell 5.1**. Dopisuj
  narzędziem Write/Edit albo Nodem (`fs.readFileSync(p, 'utf8')`). Efekt sprawdzaj odczytem pliku
  po zapisie, nie kodem wyjścia polecenia.
- **Zasięg:** Windows PowerShell 5.1 (nie PowerShell 7+). Ta sama rodzina co komunikaty hooków
  (L-0016) i payloady budowane echem (L-0017). Źródło: L-0027.

### P-002 — Sesja pomiarowa `claude -p` mierzy co innego, niż myślisz · 2026-08-08 · AKTYWNA

- **Objaw:** przebieg wygląda na udany. Sesja odpowiada sensownie — na prompt **urwany** na
  pierwszym polskim znaku; albo wiarygodnie wyjaśnia, dlaczego nie zapisała pliku, zamiast go
  zapisać.
- **Przyczyna:** dwie niezależne bariery i żadna nie zgłasza się jako błąd. Prompt przekazany
  **argumentem** zostaje przekłamany i obcięty przez powłokę Windows; tryb `-p` domyślnie nie ma
  prawa pisać po dysku.
- **Obejście:** prompt podawaj przez **stdin** (`spawn('claude', ['-p'])` + `stdin.write(prompt)`),
  zapis włączaj `--permission-mode acceptEdits`, a przed uznaniem pomiaru za ważny sprawdź
  w wyjściu, czy sesja zobaczyła **cały** prompt. Narzędzia systemowe — patrz P-004.
- **Zasięg:** Claude Code CLI na Windows, prompty z polskimi znakami. Źródło: L-0024.

### P-001 — `tar` na `PATH` nie jest tym `tar`, o którym myślisz · 2026-08-08 · AKTYWNA

- **Objaw:** `tar -a -c -f test.zip …` w Git Bashu kończy się kodem 0 bez ostrzeżenia, plik
  powstaje, `tar -tf` wypisuje zawartość — a Eksplorator Windows i `Expand-Archive` go nie otworzą.
  Pierwsze bajty to `ustar`, nie `PK`.
- **Przyczyna:** `tar` na `PATH` w Git Bash to GNU tar (1.35), który ZIP-a nie umie i po cichu
  ignoruje intencję `-a`. Systemowy `C:\Windows\System32\tar.exe` to bsdtar (libarchive) i ten sam
  zapis daje prawdziwy ZIP. Nazwa polecenia nie mówi nic o implementacji.
- **Obejście:** narzędzie systemowe rozstrzygające o **formacie** artefaktu wywołuj **pełną
  ścieżką** i weryfikuj **wynik**, nie kod wyjścia: nagłówek pliku, lista wpisów, otwarcie natywnym
  narzędziem platformy docelowej.
- **Zasięg:** Git Bash na Windows z GNU tar w `PATH`. Źródło: L-0021.
