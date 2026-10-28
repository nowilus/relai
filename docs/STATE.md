# STATE — RelAI

Stan na: 2026-10-28 (ostatni zamknięty plan ZASIEG_PLUGINU ZREALIZOWANY — RelAI 3.6.0 z trybem
„RelAI tylko w projektach”, `relai-mods` 0.3.0, `relai-panel` 0.22.1; poprzednio ZGLOSZENIA
2026-10-27 — wydanie 3.5.0, PIPELINE_WYDAN 2026-10-26 — wydanie 3.4.0)

## Gdzie jesteśmy

RelAI **3.6.0** jest w repozytorium i publicznie (tag `v3.6.0`, 2026-10-28: tryb „RelAI tylko
w projektach” — plan ZASIEG_PLUGINU; wcześniej 3.5.0 z poprawkami zgłoszeń #1–#3). Plugin `relai` działa
w trzech narzędziach — Claude Code, Cursorze i Codeksie — na jednym rdzeniu procesu, z szesnastoma
komendami i czternastoma hookami w Claude Code (czternasty: `session-title`). Marketplace tego
repozytorium niesie też cztery mody: `relai-panel` 0.22.1, `relai-progress` 0.7.0,
`relai-cache-keeper` 0.13.0 („early access”) i kokpit `relai-mods` 0.3.0. Wydanie robi się frazą „gotowi do wydania?”
(`/relai-release`): raport `release-check.js`, naprawy po jednej zgodzie, publikacja krok po kroku,
bramka `pre-push` na tagi. Maszyna Łukasza pracuje w trybie „RelAI tylko w projektach” od
2026-10-28. Aktywnego planu nie ma; PANEL_CODEX (Codex) wstrzymany 2026-10-27 decyzją Łukasza.
Opinii spoza projektu nadal nie ma.

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
- Pytanie o model pokazuje nazwy z listy narzędzia (Claude Code: lista z 2026-10-08, także
  w pluginie od 3.4.0); prompt z `/relai-prompt` jest skrojony pod model, który go wykona.
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
- **Strona-wizytówka** https://nowilus.github.io/relai/ (plan
  [STRONA_RELAI](archiwum/plany/STRONA_RELAI/STATUS.md)): Film (`/`, `/pl/`) i Biurko 3D
  (`/biurko/`, `/pl/biurko/`, z plakatem bez WebGL), obie na telefonie, konfigurator instalacji
  i ankieta w Tally (PL https://tally.so/r/BE4lQ5, EN https://tally.so/r/X5lkMj). Wdrożenie
  `.github/workflows/strona.yml` po pushu na `main`; konfigurator pokazuje RelAI 3.6.0. Testy 396,
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

- **Aktywnego planu nie ma** (ZASIEG_PLUGINU zamknięty 2026-10-28).
- **PANEL_CODEX — nieaktywny, WSTRZYMANY 2026-10-27** decyzją Łukasza (plan
  [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md), ZAAKCEPTOWANY 2026-10-10, 8 etapów, Codex
  `gpt-6.1-sol`). Stan zatrzymania E1: natywny widok i wiadomość do bieżącego czatu potwierdzone
  sondą 0.0.7; pakiet `adapters/codex/panel/` 0.1.0 (13 testów) pokazuje właściwy stan; sonda
  0.0.9 z poprawką fontów czeka na pomiar. Wznowienie tylko decyzją Łukasza. Kontrakt
  w [README adaptera](../adapters/codex/panel/README.md).
- **W repo, niewydane (2026-10-28):** wiersz `installPath` w README i `KOMENDY.md` poprawiony po
  przełączeniu maszyny (P-059 — w 3.6.0 skleja ścieżki, gdy plugin ma wpisy lokalne); decyzja
  Łukasza: do następnego wydania. README na GitHubie poprawione pushem `main`.

## Co dalej

- **Po ZASIEG_PLUGINU (świadomie odłożone 2026-10-28):** `undo` zostawia pusty
  `"enabledPlugins": {}` w pliku lokalnym, który go wcześniej nie miał (P-058); przycisk „Włącz”
  w kokpicie przy stanie „● włączony z ustawień globalnych” myli (uwaga Łukasza — lepiej
  „Przypnij w tym projekcie”); test parytetu Codeksa porównuje sumy bez CRLF → LF; komenda
  `/relai-release` nie przewiduje ucięcia raportu `--json` przez narzędzie (~15 KB).
  `.worktreeinclude` w 9 pozostałych projektach zostaje lokalny (decyzja Łukasza).

- **Po ZGLOSZENIA (świadomie odłożone 2026-10-27):** `plugin test` modu `relai-panel` chwieje się
  pod obciążeniem (przekroczenia ~5 s przy równoległych przebiegach; raport raz 2/211), a raport
  wydania zachowuje tylko trzy ostatnie linie wyjścia — bez nazw porażek. Restart aplikacji po
  3.5.0 zrobiony 2026-10-27 przy pomiarze bramek (P-005; bramka E5 PIPELINE_WYDAN spełniona
  w praktyce).
- **Po PIPELINE_WYDAN (świadomie odłożone 2026-10-26):** `/relai-release` do wersji 3 — kolejność
  publikacji „tag → wydanie GitHub z zasobami → push `main`”, gdy strona wskazuje zasoby wydania
  (L-0280), i krok 8 bez wymogu restartu przed `--sesja`; kontrola `strona-film` nie pilnuje czasu
  ani rozmiaru filmu w tekście odtwarzacza; bramka nie uruchamia testów filmu (`--rev` bez
  `node_modules`); ostrzeżenie `plugin validate` o braku ikony pluginu; miniatura filmu w README
  to kadr ze starego filmu; testy parzystości Codeksa w zwykłym klonie z `core.autocrlf=true`.
- **Po BEZPIECZENSTWO:** pomiar zdarzenia po narzędziu w Cursorze (`agent login`, sondy
  `postToolUse` / `afterFileEdit` / `afterShellExecution`; jest → hook `lockfile-scan`
  w instalatorze Cursora); override `zod` 4.6.6 w narzędziach filmu zdjąć, gdy Remotion przypnie
  bezpieczny `zod`; edycja pliku blokady przez `apply_patch` w Codeksie nie wyzwala skanu;
  zaufanie hooka `lockfile-scan` w przeglądzie hooków Codeksa (P-054).
- **Strona:** odczyt ankiety i wybór kierunku (Aneks D pkt 3 STRONA_RELAI); pomiar Biurka na
  słabszym laptopie (T1, procedura w `site/README.md`); przegląd tekstów EN przez native speakera;
  drobne — karta „Zacznij tutaj” Biurka przy 1024 px, logo zasłony Filmu ładuje się po SVG.
- Tryb ciągły optymalizatora promptów dla Cursora i Codeksa — osobny plan, i licznik kosztu trybu
  ciągłego (decyzje Łukasza 2026-10-15).
- Aneks do PANEL_CODEX z zapisem pracy przed limitem dla panelu Codeksa — po domknięciu jego E1
  (decyzja Łukasza 2026-10-12). Przepięcie `prompt-mode.js` na `threshold.js` odłożone.
- PANEL_CODEX E1 (po wznowieniu planu decyzją Łukasza): przeładować klienta MCP, zmierzyć sondę
  0.0.9 (fonty, przyciski, świeży szkic); prompt E2 dopiero po odbiorze E1.
- Ustalenia poza zakresem audytu modów (pięć pozycji `outOfScope`, wariant B „jedna listwa”) —
  decyzja człowieka: plan, odnoga albo odrzucić.
- Bramki świadomie otwarte: start etapu z karty panelu bez drugiego pytania (E5 PANEL_CLAUDE);
  jedno okno pytań trybu ciągłego (Aneks F) i brak pytania po zadaniu w tle (Aneks H); bramka
  trybu ciągłego odpala na odpowiedzi z karty startu (L-0189).
- `/relai-models` w sesji Codeksa — lista ma nazwy z 2026-09-05; nakładka `openai` bez reguł
  z nazwą modelu. Nakładki rodzin modeli (`claude`, `openai`) z 2026-09-24 — starsze niż 30 dni.
- Wątek `OPIS_REPO` (opis i tematy repozytorium na GitHubie; manifest mówi o jednym narzędziu).
- Typografia modów czeka na Claude Code ≥ 2.1.299 w aplikacji; zrzut paska plan po `/clear`
  przy następnej okazji; ewaluacje zachowania komend; `relai-prompt.md` ponad 20 KB.
- Sprzątanie `.claude/relai/pomiary/` wraca, gdy folder przekroczy 10 MB (C11).
- Cudze projekty: ExpensesManager pod 2.8.0 (`package.json` przy kopiach, P-007); PolyFlow
  i JiraManager — ponowna instalacja pre-commita, w PolyFlow 60 martwych linków i należna rotacja;
  migracja JiraManagera czeka na okno właściciela (R5).
- Drobne: dwie wady `work-artifacts.js` (`kasuj` melduje sukces na ścieżce nieistniejącej,
  `zachowaj` na cudzej ścieżce pisze marker w projekcie sesji); `PRZENOSNOSC.md` 2.3 nieaktualna;
  metadane sesji `ProbaCursorE6` do usunięcia.

## Co blokuje

- Ochrona konfiguracji jest doradcza (`ask`): w sesji z automatyczną akceptacją przepuszcza zapis.
- Sesja Cursora w tym folderze nie ma kontekstu RelAI ani blokady sekretu (D-89).
- Świeża sesja CLI bywa niedostępna — etap oparty na niej sprawdza ją przed startem.
- Decyzje czekające na człowieka: sekcja „Czeka na człowieka” w dzienniku.

---

## Szczegóły techniczne

### Wersja i instalacja

Repo i publicznie **3.6.0** (tag `v3.6.0` na `2658e04`); marketplace w tym repozytorium (scope
`user`) niesie pięć pluginów: `relai` i cztery mody z własnymi wersjami i tagami
(`relai-panel-v0.22.1`, `relai-progress-v0.7.0`, `relai-cache-keeper-v0.13.0`,
`relai-mods-v0.3.0`, każdy z własnym wydaniem GitHub). Na maszynie Łukasza `relai`
i trzy dodatki są włączone lokalnie w projektach (tryb „RelAI tylko w projektach”), `relai-mods`
globalnie. Wydanie: fraza „gotowi do wydania?” →
`/relai-release` (`.claude/commands/`, wersja 2): raport `release-check.js --json`, podział braków
na naprawy bezpieczne (jedna zgoda) i listę dla człowieka, ponowny raport, `claude plugin validate`
binarką aplikacji, commit, tag przez hook `pre-push` (`core/tools/release-pre-push.js`,
instalator `install-prepush.js`, w `.git/hooks/` tego klonu), push, wydanie GitHub z notatkami EN,
`marketplace update`, `plugin update`, `release-verify.js --plugin <p> --wersja <n> --sesja`
(3.6.0: 1548/1548, 0 rozjazdów). Raport ma kody 0 / 1 / 2; `--rev <rewizja>` liczy drzewo
rewizji w worktree z `core.autocrlf=false` (Aneks B); `--komponent relai-<mod>` dla tagu modu;
baza modu przy `--rev` pomija tag stojący na samej rewizji (Aneks B ZASIEG_PLUGINU).
Walidator `core/tools/validate-adapters.js` sprawdza 7 źródeł wersji i wpis marketplace każdego
pluginu panelu. Pre-commit repo: układ 1.9.2.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji, artefakty robocze, załoga, tryb ciągły, baza reguł optymalizatora z nakładkami `claude`
i `openai`, walidator, narzędzia wydań (`core/tools/release-*.js`, `release-map.json`), rdzeń
panelu `core/panel/*.mjs`. **Adapter Claude Code**: dwa skille z plikami doczytywanymi,
`trivy-scan` i kopia `security-audit` Cloudflare, 16 komend, 4 agenci, 14 hooków, lista modeli
z 2026-10-08. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki, instalator, cztery skille.
**Adapter Codex**: manifest, 16 skilli komend i 4 dołączone, router `AGENTS.md`, cztery hooki
(z `lockfile-scan`); pakiet panelu `adapters/codex/panel/` w budowie wstrzymanej (PANEL_CODEX E1, od 2026-10-27).

### Pluginy panelu (Claude Code Mods, „early access”, zmierzone na 2.1.295)

`panel/` (`relai-panel`), `progress/` (`relai-progress`, fork `savvy-progress` MIT),
`cache-keeper/` (`relai-cache-keeper`), `mods/` (`relai-mods`); każdy z kopią rdzenia
z `sync-panel-core.js`, pilnowaną testem. Pomiary kosztów w `.claude/relai/pomiary/` (poza gitem),
cennik w `.claude/relai/panel/cennik.json`. Wygląd: [STYL_PASKOW_CLAUDE.md](zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md)
(v5.1) i [DESIGN.md](zasoby/PANEL_RELAI/DESIGN.md) (1.3); ograniczenia silnika: P-017–P-024
w [PULAPKI.md](PULAPKI.md); [karta AUDYT_MODOW](fixy/AUDYT_MODOW/ODNOGA.md). Testy:
`claude plugin test` binarką aplikacji (`claude` na PATH to starsza wersja, P-024).

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai • Wydanie: github.com/nowilus/relai/releases/tag/v3.6.0 • Plany
zamknięte: [docs/archiwum/plany/](archiwum/plany/) • Backupy: `C:\Users\Lukasz\Backupy\RelAI` •
[PRZENOSNOSC.md](PRZENOSNOSC.md) • [PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 20 (ostatni ZASIEG_PLUGINU, 2026-10-28) • Aktywne: brak • Wstrzymane:
PANEL_CODEX (Codex, od 2026-10-27) • Start sesji: 109,3 KB / 100 KB na starcie 2026-10-28 •
Dziennik: 209 KB / 150 KB (do rotacji) • Ryzyka: 20 w tabeli, 17,5 KB / 12 KB (dolna granica —
same otwarte), archiwum 12 plików • Lekcje: 60,5 KB / 50 KB (do rotacji) • Adaptery: 3 •
Komendy: 16 • Hooki Claude Code: 14 • Testy (2026-10-27, raport wydania 3.6.0): rdzeń, panel
i Codex 588 (+1 test bramki w Aneksie B), strona 396, film 37 (2026-10-26); pluginy panelu:
`relai-panel` 216, `relai-mods` 87 • Projekty z markerem RelAI na tej maszynie: 15 (status
`relai-scope` 2026-10-28) • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed
migracją) • Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto,
Grok 4.6).
