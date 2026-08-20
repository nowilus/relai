# PUŁAPKI — budowa RelAI

Rzeczy, które zaskoczyły i zaskoczą znowu: zachowania narzędzi, kolejności kroków, wymogi
środowiska. Czytaj **na żądanie** — zanim uznasz, że coś jest zepsute. Najnowsze u góry.

Ten plik **nie jest czytany przy starcie sesji** i nie liczy się do budżetu warstwy startowej.
Specyfikacja: `SPEC_PULAPKI.md`.

## Pułapki

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
- **Zasięg:** Claude Code, aplikacja desktopowa; potwierdzone na 0.9.0 → 1.0.0. Źródło: L-0031,
  L-0020.

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
