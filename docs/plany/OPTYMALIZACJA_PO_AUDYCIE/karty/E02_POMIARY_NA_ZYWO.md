# E2 — Pomiary na żywo i warianty dystrybucji

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap **niczego nie naprawia** — mierzy
trzy rzeczy, których nie dało się potwierdzić statycznie, i zapisuje wynik w jednym pliku, z którego
czytają późniejsze etapy. To jeden z dwóch etapów, w których wolno uruchamiać świeże sesje
`claude -p` (zgoda właściciela z 2026-11-09).

- **Karty w kolejności wykonania:** K-P0 (instrument) → K-C9m → K-A6m → K-G1m → K-P9 (zapis
  wyników). Instrument jest pierwszy, bo oba pomiary sesyjne go używają; dystrybucja na końcu, bo
  ma bramkę zgody człowieka.
- **Efekt widoczny:** plik [`POMIARY.md`](../POMIARY.md) z trzema werdyktami i tabelą wariantów
  dystrybucji — właściciel wybiera wariant dla wagi pluginu (114 MB na wersję) na liczbach.
- **Szacunek:** SZACUNEK 1–2 sesje.
- **Budżet sesji `claude -p`:** najwyżej **10** w całym etapie (1 próbna + 3 dla K-C9m + 6 dla
  K-A6m). Każda z `--max-turns 8` i limitem 300 s. Dziesiąta sesja wyczerpuje budżet — dalsze
  tylko po zgodzie człowieka.
- **Warunki zatrzymania:** `claude -p` kończy się błędem logowania albo limitu (zapisz komunikat,
  nie ponawiaj więcej niż raz); zdarzenia strumienia mają inny kształt niż opisany w K-P0;
  człowiek nie zgadza się na krok instalacji w K-G1m.
- **Weryfikacja etapu:** `POMIARY.md` istnieje i zawiera dokładnie jedną linię zaczynającą się od
  `C9:` i jedną od `A6:` w brzmieniu z zamkniętej listy (K-P9); `git status --short` pokazuje
  z tego etapu wyłącznie `POMIARY.md` i dokumenty rytuału „Na koniec”; w katalogu tymczasowym
  nie zostały katalogi fikstur (`relai-pomiar-*`).

**Zamknięta lista werdyktów** (czytają ją karty K-C9 w etapie E5 i K-A6 w etapie E7):

```
C9: WIDZI
C9: NIE WIDZI
A6: POWTARZA
A6: NIE POWTARZA
```

---

## K-P0 — instrument: jedna świeża sesja na fiksturze

- **Cel:** jeden skrypt, który uruchamia sesję `claude -p` na kopii fikstury projektu RelAI
  z pluginem z tego repozytorium i zwraca jej zdarzenia.
- **Pliki:** żadne w repozytorium. Skrypt `pomiar-sesji.js` i jego kontrola `pomiar-kontrola.js`
  powstają w katalogu scratchpad sesji — to jednorazowy instrument pomiarowy, nie narzędzie
  pluginu (liczba testów repozytorium się nie zmienia).
- **Stan dziś:** wzorem jest funkcja `sesja()` w `core/tools/eval-triggers.js` (linie 122–149,
  kotwica: `const args = ['-p', '--model', o.model, '--max-turns', String(o.maxTurns), '--output-format', 'stream-json', '--verbose',`).
  Fikstura projektu RelAI: `core/evals/fixtures/relai/` (`CLAUDE.md`, `docs/DZIENNIK.md`,
  `docs/STATE.md`, `docs/USTAWIENIA.md`); ostatni wpis jej dziennika kończy się linią
  `Autor: RelAI (Opus 5.5) + tester`.
- **Zmiana:** napisz w scratchpadzie `pomiar-sesji.js` (narzędziem Write) z jedną funkcją
  eksportowaną `sesja({ prompt, katalog, wznow, narzedzia, model })` i trybem CLI. Korzeń
  repozytorium podaj stałą ze ścieżką bezwzględną. Zachowanie:
  1. `katalog` niepodany → `fs.mkdtempSync(path.join(os.tmpdir(), 'relai-pomiar-'))`, kopia
     `core/evals/fixtures/relai/` do środka, potem `git init -q`, `git config user.name tester`,
     `git config user.email tester@example.invalid` (jak `gitFixtury()` — bez tego siatka „cudzy
     projekt” zatrzymuje model pytaniem).
  2. Argumenty: `['-p', '--model', model, '--max-turns', '8', '--output-format', 'stream-json',
     '--verbose', '--setting-sources', 'project,local', '--strict-mcp-config', '--plugin-dir',
     <korzeń repozytorium>, '--permission-mode', 'acceptEdits', '--allowedTools', ...narzedzia]`.
     `wznow` podane → dodatkowo `'--resume', wznow`. Model domyślny: `opus`.
  3. Binarka: `process.env.RELAI_CLAUDE || 'claude'`; prompt na stdin; limit 300 000 ms;
     `cwd` = katalog fikstury.
  4. Wynik: obiekt `{ kod, katalog, sesjaId, tekstKoncowy, polecenia, zdarzenia }`, gdzie
     `zdarzenia` to sparsowane linie JSON strumienia, `sesjaId` to pole `session_id` zdarzenia
     `type: "system", subtype: "init"`, `tekstKoncowy` to pole `result` zdarzenia `type: "result"`,
     a `polecenia` to lista `input.command` wszystkich bloków `tool_use` o nazwie `Bash`
     w zdarzeniach `type: "assistant"`.
  5. Katalogu fikstury skrypt **nie kasuje** (pomiar wznowienia potrzebuje go dwa razy) — kasuje
     go wołający; tryb CLI kasuje po zakończeniu, chyba że podano `--zostaw`.
  6. Tryb CLI: `node <scratchpad>/pomiar-sesji.js --prompt "<tekst>" [--narzedzia Read,Bash] [--zostaw]`
     wypisuje JSON wyniku **bez** pola `zdarzenia` (pełny strumień zapisuje do pliku obok skryptu,
     ścieżkę wypisuje w polu `strumien`).
- **Test najpierw (kontrola instrumentu):** `pomiar-kontrola.js` w scratchpadzie, z `node:assert`
  — bez prawdziwej sesji. Zmienna `RELAI_CLAUDE` wskazuje atrapę (skrypt Node w `os.tmpdir()`, na
  Windows uruchamiany przez plik `.cmd` obok), która wypisuje trzy linie strumienia: zdarzenie
  `init` z `session_id: "s-1"`, zdarzenie `assistant` z jednym `tool_use` Bash o poleceniu
  `node .claude/relai/tools/start-digest.js` i zdarzenie `result` z `result: "OK"`. Przypadki:
  1. „zwraca identyfikator sesji, tekst końcowy i polecenia Bash” → `sesjaId === 's-1'`,
     `tekstKoncowy === 'OK'`, `polecenia.length === 1`.
  2. „fikstura jest repozytorium z tożsamością tester” → w `katalog` istnieje `.git`, a
     `git config user.name` zwraca `tester`.
  3. „wznowienie dokłada `--resume`” → atrapa zapisuje swoje `process.argv` do pliku; po wywołaniu
     z `wznow: 's-1'` plik zawiera kolejno `--resume` i `s-1`.
  4. „linia niebędąca JSON-em nie przerywa parsowania” → atrapa dopisuje linię `nie json`; wynik
     jak w przypadku 1.
- **Weryfikacja:** `node <scratchpad>/pomiar-kontrola.js` → cztery asercje przechodzą, kod 0. Potem
  **jedna sesja próbna** (liczy się do budżetu):
  `node <scratchpad>/pomiar-sesji.js --prompt "Odpowiedz jednym slowem: OK." --narzedzia Read`
  → `kod: 0`, niepuste `sesjaId`, `tekstKoncowy` zawiera `OK`. Otwórz plik strumienia i sprawdź,
  że zdarzenia mają kształt z kroku 4; inny kształt → zatrzymaj się (warunek zatrzymania etapu).
- **Nie ruszasz:** `core/tools/eval-triggers.js` (czytasz go jako wzór, nie refaktoryzujesz);
  żadnego pliku w repozytorium.
- **Pułapki:** na Windows `spawn('claude', …)` bez powłoki nie znajdzie skryptu `.cmd` — zobacz,
  jak robi to `eval-triggers.js` (ten sam `spawn`), i nie zmieniaj sposobu; flaga `--allowedTools`
  przyjmuje nazwy jako osobne argumenty; bez niej sesja `-p` nie wykona Bash i pomiar powie „nie
  wiem” (L-0273). Sesja próbna prowizjonuje `.claude/relai/` w fiksturze — to oczekiwane.
- **Gotowe, gdy:** kontrola instrumentu przechodzi i sesja próbna zwróciła `kod: 0`.

---

## K-C9m — czy model widzi `systemMessage` hooka

- **Cel:** werdykt `C9: WIDZI` albo `C9: NIE WIDZI` (raport, znalezisko C9).
- **Pliki:** żadne w repozytorium (wynik idzie do `POMIARY.md` w K-P9).
- **Stan dziś:** `adapters/claude-code/hooks/journal-signature.js` po zapisie
  `docs/DZIENNIK.md`, którego ostatni wpis nie ma linii autora, wypisuje
  `systemMessage: '[RelAI journal-signature] Ostatni wpis dziennika ("…") nie ma linii autora. …'`
  (kotwica: `systemMessage: '[RelAI journal-signature] Ostatni wpis dziennika`). Pozostałe hooki
  mówią do modelu kanałem `hookSpecificOutput.additionalContext`.
- **Zmiana (procedura pomiaru):** trzy sesje, każda na **świeżej** fiksturze, przez
  `sesja({ prompt, narzedzia: ['Read', 'Edit', 'Write'] })` z promptem (ASCII, dosłownie):

  ```
  Dopisz na samym koncu pliku docs/DZIENNIK.md dokladnie te cztery linie, nic wiecej i nic nie zmieniaj:

  ### 2026-11-10 — Wpis pomiarowy

  **Zrobione:** pomiar.

  Potem odpowiedz dokladnie w tej postaci: KOMUNIKAT: <doslowny tekst komunikatu, ktory dostales od hooka po zapisie> albo KOMUNIKAT: BRAK.
  ```

  Prompt celowo nie zawiera nazwy hooka. Po każdej sesji sprawdź **kontrolę pozytywną**: ostatnie
  linie `docs/DZIENNIK.md` w fiksturze zawierają `### 2026-11-10 — Wpis pomiarowy` i **nie**
  zawierają linii zaczynającej się od `Autor:` po tym nagłówku (model nie dopisał podpisu sam).
  Sesja bez spełnionej kontroli jest nieważna — nie liczy się do werdyktu, ale liczy się do
  budżetu; nieważne sesje nie są powtarzane ponad łącznie trzy przebiegi.
- **Reguła werdyktu:** sesja ważna „widzi”, gdy `tekstKoncowy` zawiera ciąg `journal-signature`
  albo `nie ma linii autora`. **`C9: WIDZI` tylko wtedy, gdy wszystkie ważne sesje widzą i są
  co najmniej dwie ważne.** Każdy inny wynik → `C9: NIE WIDZI` (wariant ostrożny: kanał
  `additionalContext` działa na pewno, więc przejście na niego niczego nie psuje).
- **Test najpierw:** nie dotyczy (pomiar). Instrument ma testy z K-P0.
- **Weryfikacja:** dla każdej sesji zapisz w notatkach: ważna tak/nie, `tekstKoncowy` (pierwsze
  200 znaków), werdykt cząstkowy. Trafia to do tabeli w `POMIARY.md`.
- **Nie ruszasz:** hooka `journal-signature.js` — poprawka należy do karty K-C9 w etapie E5.
- **Pułapki:** hook działa tylko w projekcie z markerem RelAI — fikstura go ma
  (`docs/USTAWIENIA.md`); hook czyta autora z `.git/config`, dlatego tożsamość `tester` jest
  ustawiona; model bywa „pomocny” i dopisuje podpis — stąd kontrola pozytywna.
- **Gotowe, gdy:** masz werdykt z zamkniętej listy i tabelę trzech przebiegów.

---

## K-A6m — czy wznowienie sesji powtarza rytuał startu

- **Cel:** werdykt `A6: POWTARZA` albo `A6: NIE POWTARZA` (raport, znalezisko A6).
- **Pliki:** żadne w repozytorium.
- **Stan dziś:** `adapters/claude-code/hooks/hooks.json` rejestruje SessionStart bez matchera,
  a `session-context.js` rozróżnia tylko `input.source === 'compact'` (kotwica:
  `if (input.source === 'compact')`). Przy każdym innym źródle hook wypisuje pełny blok z nakazem
  uruchomienia `node .claude/relai/tools/start-digest.js`.
- **Zmiana (procedura pomiaru):** trzy pary sesji; każda para na **jednej** fiksturze:
  1. Sesja pierwsza: `sesja({ prompt: 'Odpowiedz jednym slowem: OK.', narzedzia: ['Read', 'Bash'] })`
     — zachowaj `katalog` i `sesjaId`.
  2. Sesja druga: `sesja({ prompt: 'Odpowiedz jednym slowem: OK.', katalog, wznow: sesjaId, narzedzia: ['Read', 'Bash'] })`.
  3. Policz w każdej sesji polecenia Bash zawierające ciąg `start-digest.js`.
  4. Skasuj katalog fikstury.

  **Kontrola pozytywna pary:** sesja pierwsza ma co najmniej jedno takie polecenie (model
  wykonał rytuał na starcie). Para bez kontroli jest nieważna.
- **Reguła werdyktu:** para ważna „powtarza”, gdy sesja druga ma co najmniej jedno polecenie ze
  `start-digest.js`. **`A6: POWTARZA`, gdy powtarzają co najmniej dwie pary ważne.** Każdy inny
  wynik (w tym mniej niż dwie pary ważne) → `A6: NIE POWTARZA` — bez dowodu kosztu nie zmieniamy
  zachowania startu.
- **Test najpierw:** nie dotyczy (pomiar).
- **Weryfikacja:** tabela trzech par: ważna tak/nie, liczba poleceń w sesji pierwszej i drugiej.
  Dodatkowo z jednej pary zapisz liczbę tokenów wejścia pierwszego wywołania sesji drugiej, jeśli
  zdarzenie `result` niesie pole `usage` — jako informację, nie warunek.
- **Nie ruszasz:** `session-context.js` — poprawka należy do karty K-A6 w etapie E7.
- **Pułapki:** `--resume` wymaga tego samego `cwd` co sesja pierwsza — dlatego `katalog` jest
  przekazywany; identyfikator sesji bierz ze zdarzenia `init` sesji pierwszej, nie z nazwy pliku
  transkryptu; po `/clear` pole `source` hooka bywa mylące (L-0285) — mierzymy wyłącznie `--resume`.
- **Gotowe, gdy:** masz werdykt z zamkniętej listy i tabelę trzech par.

---

## K-G1m — warianty dystrybucji pluginu: liczby zamiast wyboru

- **Cel:** tabela trzech wariantów zmniejszenia wagi zainstalowanego pluginu (114 MB na wersję —
  FAKT, raport G1) z liczbami i ryzykiem. **Plan nie wdraża żadnego wariantu** — wybór należy do
  właściciela, wdrożenie do aneksu albo osobnego planu.
- **Pliki:** żadne w repozytorium poza `POMIARY.md` (K-P9). Katalogi robocze wyłącznie
  w `os.tmpdir()`.
- **Stan dziś:** `.claude-plugin/marketplace.json:14` — `"source": "./"` dla pluginu `relai`;
  mody mają `"./panel"`, `"./progress"`, `"./cache-keeper"`, `"./mods"`. Pliki śledzone: 113,7 MB,
  z czego `docs/` 92,5 MB i `site/` 14,0 MB; warstwa wykonawcza (`core/`, `adapters/`, `hooks/`,
  manifesty) 3,8 MB (FAKT, raport G1).
- **Zmiana (procedura):**
  1. **Wariant A — media poza repozytorium.** Policz skryptem w scratchpadzie (z `git ls-files -z`
     i `fs.statSync`) wagę plików śledzonych po odjęciu: `docs/zasoby/PANEL_RELAI/`,
     `docs/zasoby/film/`, `docs/zasoby/STRONA/`, `docs/archiwum/demo/` oraz wszystkich plików
     `.png`, `.jpg`, `.jpeg`, `.gif`, `.mp4`, `.mp3` pod `docs/`. Zapisz: waga pluginu po zmianie,
     liczba plików do przeniesienia, liczba linków Markdown w `docs/**/*.md` wskazujących na
     przenoszone pliki (grep po ścieżkach) — to koszt przepięcia.
  2. **Wariant B — źródło pluginu w podkatalogu.** Zbuduj w `os.tmpdir()` katalog kontrolny
     `relai-pomiar-dystrybucja/` zawierający: `plugin/` z kopią `core/`, `adapters/`, `hooks/`,
     `.claude-plugin/plugin.json` i `.codex-plugin/`, oraz `.claude-plugin/marketplace.json`
     z nazwą marketplace **`relai-pomiar`** i jednym pluginem o `"source": "./plugin"`.
     Uruchom `"$CLAUDE_CODE_EXECPATH" plugin validate <katalog>/plugin` i zapisz wynik. Policz wagę
     `plugin/`. Wypisz, które ścieżki w repozytorium zakładają dzisiejszy układ: grep
     `CLAUDE_PLUGIN_ROOT` w `adapters/` i `hooks/`, pole `root`/`manifest`/`entry`
     w `core/MANIFEST.json`, ścieżki w `core/tools/release-map.json` i w
     `core/tools/validate-adapters.js` — sama **liczba miejsc** jest miarą kosztu wariantu.
  3. **Bramka zgody człowieka** przed próbą instalacji wariantu B: „Próba instalacji doda do
     konfiguracji Claude Code marketplace `relai-pomiar` i plugin w zakresie lokalnym projektu
     tymczasowego; po pomiarze oba usunę. Wykonać?” — „Tak” / „Nie, wystarczy walidacja”.
     Przy „Tak”: w świeżym katalogu `os.tmpdir()/relai-pomiar-projekt/` (z `git init`) uruchom
     `"$CLAUDE_CODE_EXECPATH" plugin marketplace add <katalog kontrolny>`, potem
     `"$CLAUDE_CODE_EXECPATH" plugin install relai@relai-pomiar --scope local`; zmierz wagę
     katalogu w `~/.claude/plugins/cache/relai-pomiar/`; potem **sprzątanie w tej samej turze**:
     `plugin uninstall relai@relai-pomiar --scope local`, `plugin marketplace remove relai-pomiar`,
     usunięcie obu katalogów tymczasowych i katalogu `cache/relai-pomiar/`. Dokładne nazwy
     podpoleceń sprawdź przez `"$CLAUDE_CODE_EXECPATH" plugin --help` i
     `plugin marketplace --help` przed pierwszym użyciem (zasada 13: cudze narzędzie poznajesz
     z próby, nie z pamięci). Każde polecenie, które pyta o coś innego niż opisano → zatrzymaj się.
  4. **Wariant C — osobna gałąź albo podkatalog w źródle gitowym.** Przeczytaj oficjalną stronę
     `https://code.claude.com/docs/en/plugin-marketplaces` (jedno pobranie, tylko odczyt; zgoda
     właściciela na ten ruch sieciowy jest częścią akceptacji planu) i wypisz, jakie postaci pola
     `source` są udokumentowane (ścieżka względna, repozytorium z gałęzią albo tagiem, podkatalog
     repozytorium). Wariant oceniasz **na papierze**: co musiałby robić skrypt wydania (budowa
     gałęzi tylko z warstwą wykonawczą), czy mody z `"./panel"` mogą zostać w tym samym
     marketplace. Bez próby instalacji z sieci.
  5. Dla każdego wariantu jedna linia rekomendacji technicznej z powodem — bez wyboru za
     właściciela.
- **Test najpierw:** nie dotyczy (pomiar).
- **Weryfikacja:** po etapie `"$CLAUDE_CODE_EXECPATH" plugin marketplace list` nie zawiera
  `relai-pomiar`; `ls ~/.claude/plugins/cache/` nie zawiera `relai-pomiar`; w `os.tmpdir()` nie ma
  katalogów `relai-pomiar-*`.
- **Nie ruszasz:** `.claude-plugin/marketplace.json` i `plugin.json` repozytorium; istniejących
  marketplace i pluginów użytkownika (`relai`, cztery mody, pozostałe); zakresu `user` — pracujesz
  wyłącznie w zakresie `local` projektu tymczasowego.
- **Pułapki:** `claude plugin update` bez `--scope` rusza tylko zakres bieżącego katalogu (P-062);
  wersję zainstalowanego pluginu potwierdza plik instalacji, nie komunikat CLI (zasada 10);
  marketplace kontrolny **musi** mieć inną nazwę niż `relai`, inaczej nadpisze wpis prawdziwego.
- **Gotowe, gdy:** tabela trzech wariantów jest wypełniona liczbami, a konfiguracja maszyny jest
  taka sama jak przed etapem (trzy polecenia weryfikacji).

---

## K-P9 — zapis wyników w `POMIARY.md`

- **Cel:** jeden plik, z którego późniejsze etapy czytają werdykty maszynowo, a właściciel —
  tabelę wariantów.
- **Pliki:** nowy `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`.
- **Stan dziś:** pliku nie ma; werdykty kart K-C9m, K-A6m i K-G1m istnieją tylko w notatkach
  tej sesji.
- **Zmiana:** utwórz plik o dokładnie tej strukturze (wartości w nawiasach ostrych zastąp
  wynikami; linie `C9:` i `A6:` zostają **samodzielnymi liniami od początku wiersza**):

  ```markdown
  # POMIARY — plan OPTYMALIZACJA_PO_AUDYCIE, etap E2

  Wykonano: <RRRR-MM-DD> · Claude Code <wersja z `claude --version`> · sesji `claude -p`: <N> z 10

  ## Werdykty (czytane przez karty K-C9 i K-A6)

  C9: <WIDZI albo NIE WIDZI>
  A6: <POWTARZA albo NIE POWTARZA>

  ## C9 — kanał systemMessage

  | Przebieg | Ważny | Początek odpowiedzi modelu | Widzi |
  |---|---|---|---|
  | 1 | <tak/nie> | <do 200 znaków> | <tak/nie> |

  ## A6 — wznowienie sesji

  | Para | Ważna | start-digest w sesji 1 | start-digest w sesji 2 |
  |---|---|---|---|
  | 1 | <tak/nie> | <liczba> | <liczba> |

  ## G1 — warianty dystrybucji

  | Wariant | Waga pluginu na wersję | Co się zmienia w repozytorium | Zmierzone czy na papierze | Ryzyko |
  |---|---|---|---|---|
  | Dziś | 114,0 MB (FAKT) | — | zmierzone | — |
  | A. Media poza repozytorium | <MB> | <liczba plików i linków> | zmierzone | <jedno zdanie> |
  | B. Plugin w podkatalogu | <MB> | <liczba miejsc ze ścieżkami> | <walidacja / instalacja> | <jedno zdanie> |
  | C. Gałąź albo podkatalog w źródle gitowym | <MB, SZACUNEK> | <co robi skrypt wydania> | na papierze | <jedno zdanie> |

  Rekomendacja techniczna: <jedno zdanie na wariant>. Wybór należy do właściciela.
  ```

- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** narzędziem Grep (tryb `count`, nie przez powłokę) w
  `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`: wzorzec `^C9: (WIDZI|NIE WIDZI)$` → `1`;
  wzorzec `^A6: (POWTARZA|NIE POWTARZA)$` → `1`.
- **Nie ruszasz:** `PLAN.html` (zamrożony), kart innych etapów.
- **Pułapki:** werdykt wpisany innym brzmieniem („nie widzi”, „C9 - WIDZI”) nie zostanie
  rozpoznany przez karty warunkowe — obowiązuje zamknięta lista z nagłówka tego pliku.
- **Gotowe, gdy:** oba greps dają `1`, a wybór wariantu G1 jest wpisany jako bramka manualna
  w `STATUS.md` (rytuał „Na koniec”: pozycja „Do zrobienia przez człowieka” we wpisie dziennika).
