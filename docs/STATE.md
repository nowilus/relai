# STATE — RelAI

Stan na: 2026-10-08 (E8 planu PANEL_CLAUDE — motyw RelAI panelu; wydanie publiczne nadal 2.7.1)

## Gdzie jesteśmy

RelAI ma w repozytorium **2.7.1** — poprawkę kopii narzędzi w projektach z `"type": "module"`
(P-007), wydaną publicznie 2026-09-28 (tag `v2.7.1`, release Latest); w aplikacji działa po
restarcie. Poprzednie wydanie, 2.7.0, zamknęło etapy E5–E7 planu PROWADZENIE_END_TO_END
(2026-09-24, 7/7 etapów). Plugin działa w trzech narzędziach — Claude Code, Cursorze i Codeksie — na
jednym rdzeniu procesu, z czternastoma komendami. Plan dał lżejszy start sesji, skille czytane
na żądanie, prompty skrojone pod model, README od pierwszego kroku, procedury dla usterki i pierwszego
wdrożenia, a na koniec pilnowanie jakości: „gotowe" przychodzi z wynikiem testów, niedomknięty rytuał
jest zgłaszany na starcie, a członek załogi nie kończy samym meldunkiem. Aktywny plan: PANEL_CLAUDE.
Opinii spoza projektu nadal nie ma — pilotaż z użytkownikami zamknięto przed wysyłką zaproszeń.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach; istniejący przechodzi adopcję
  z kopią zapasową i przetestowaną drogą powrotu.
- Ustalenia, decyzje i korekty zapisują się w trakcie pracy, a nowa sesja zaczyna od stanu.
- Plany powstają jako osobny dokument z wariantami i ryzykami (dla odbiorcy nietechnicznego jako
  HTML bez internetu); boczny wątek dostaje własną kartę bez ruszania zamrożonego planu.
- Czternaście skrótów: etap, odnoga, kopia zapasowa, przegląd, lista zmian, przekazanie, wycieczka,
  ściąga, adopcja, aktualizacja, sprzątanie, lista modeli, załoga, optymalizator promptu.
- Podyktowane zdanie może wrócić poprawione, zanim ruszy w robotę — na żądanie albo w trybie
  ciągłym, o który sesja pyta raz; oryginał stoi obok propozycji.
- Załoga deleguje zadania do trzech narzędzi; recenzent nie dostaje prawa zapisu, dwa zadania nie
  piszą naraz do jednego pliku, meldunek bez dowodu dostaje najwyżej dwie kontynuacje.
- Zadanie z kodem kończy się uruchomieniem testów projektu i przeglądem diffu, zgłoszonymi trzema
  liniami; „coś nie działa" i pierwsze wdrożenie mają własne procedury.
- Na starcie sesji zgłaszane jest to, co zostało niedomknięte: brakujący prompt etapu, etap bez
  wpisu w dzienniku, artefakt bez podbitej wersji, rozjechana kopia `CLAUDE.md`, rozjazd stanu.
- Dokumenty nie puchną bez końca: stara historia idzie do archiwum w całości, z sumą kontrolną,
  a rotacja zabiera najstarsze pozycje, aż cały plik zejdzie poniżej 60% progu.
- Sprawy czekające na człowieka mają jeden adres i wracają jako pytanie, gdy czekają zbyt długo.
- Klucz API nie wejdzie do repozytorium (pre-commit w każdym narzędziu, także w projektach ESM),
  a guard pilnuje projektu, do którego idzie zapis.
- Pliki robocze sprząta się raportem w grupach, jednym „tak" na grupę; plik śledzony nie jest
  kandydatem nigdy.
- Pytanie o model pokazuje nazwy z listy narzędzia; prompt przerobiony przez `/relai-prompt` jest
  skrojony pod model, który go wykona, według reguł dostawcy z datą odczytu.
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- Plan Codeksa [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md) przygotowany jako osobny HTML,
  **DO AKCEPTACJI**, realizacja dopiero po pełnym zamknięciu PANEL_CLAUDE. Autor i wykonawca:
  **gpt-6.1-sol w Codeksie**. Pełny zakres wywiadu zachowany; 8 etapów, checklist przejęcia
  rdzenia i symulator API w planie. Żaden etap nie rozpoczęty, brak promptu E1 przed akceptacją.

- Panel dla Claude Code ma osobny plan [PANEL_CLAUDE](plany/PANEL_CLAUDE/STATUS.md) (7 etapów,
  **ZAAKCEPTOWANY** 2026-10-08): plugin `relai-panel` na Claude Code Mods, wspólny rdzeń
  `core/panel/`. Autor: Opus 5.5 — wyjątek od reguły Fable, decyzja człowieka. Aneks do D-80
  (GUI i telemetria kosztów w zakresie) wpisany. **E1 w repo (2026-10-08):** pasek RelAI nad
  promptem — plan, etap, timer cache, koszt sesji; plugin niewydany (wydanie to E7).

## Co dalej

- Akceptacja [PANEL_CODEX](plany/PANEL_CODEX/PLAN.html) i zakresu adaptera Codeksa w D-80;
  wykonanie po pełnym zamknięciu PANEL_CLAUDE oraz przejęciu jego rdzenia i testów.
  PANEL_CLAUDE pozostaje aktywny.
- **Restart aplikacji desktopowej**, żeby sesje ładowały 2.7.1 (P-005) — instalacja i cache
  `relai/relai/2.7.1` już są, sumy plików zgodne z repo. Potem pierwszy start sesji
  w ExpensesManager kładzie `package.json` przy kopiach narzędzi; obejście `.cjs` przestaje być
  potrzebne.
- **Bramki świadomie otwarte przy zamknięciu planu** (po restarcie pod 2.7.0, w sesji
  interaktywnej): pierwszy prompt merytoryczny z trybem ciągłym, bez zgody i bez modelu, daje
  **jedno** okno pytań (Aneks F); zakończone zadanie w tle nie dostaje pytania o zgodę (Aneks H).
- Odświeżenie listy modeli Codeksa w sesji Codeksa (`/relai-models`): lista ma nazwy z 2026-09-05,
  odczyt z 2026-09-24 wskazywał gpt-6-astra, gpt-6-sol i gpt-6-luna; do tego czasu nakładka `openai` nie ma
  reguł z nazwą modelu, a przydział modeli poza Claude Code jest sprawą człowieka.
- Wątek `OPIS_REPO` w `docs/fixy/` — opis i tematy repozytorium na GitHubie; opis manifestu nadal
  mówi o jednym narzędziu.
- Projekty z pre-commitem sprzed 1.9.3 (PolyFlow, JiraManager) wymagają ponownej instalacji hooka.
- Migracja JiraManagera czeka na okno właściciela (ryzyko R5).
- Dwie znane wady narzędzia sprzątania (`work-artifacts.js`): `kasuj` melduje `skasowane` dla
  ścieżki nieistniejącej, `zachowaj` na cudzej ścieżce pisze marker w projekcie sesji. Obejście:
  ścieżki ukośnikami, po operacji sprawdzaj stan katalogu.
- `PRZENOSNOSC.md` sekcja 2.3 (wywołanie procedur Codeksa) jest nieaktualna.
- Usunąć metadane sesji `ProbaCursorE6` z `~/.claude/` i `~/.cursor/` (sprawa człowieka od 2026-09-01).
- W PolyFlow: 60 martwych linków w „Czeka na człowieka" oraz należna rotacja lekcji i ryzyk.

## Co blokuje

- Ochrona konfiguracji jest doradcza (`ask`): w sesji z automatyczną akceptacją przepuszcza zapis.
- Sesja Cursora otwarta w tym folderze nie ma kontekstu RelAI ani blokady sekretu (D-89).
- Świeża sesja CLI bywa niedostępna — etap oparty na niej sprawdza ją przed startem.
- Decyzje czekające na człowieka: sekcja „Czeka na człowieka" w dzienniku.

---

## Szczegóły techniczne

### Wersja i instalacja

Repozytorium i publicznie: **2.7.1** (tag `v2.7.1`, release Latest, 2026-09-28). Źródło instalacji: własny marketplace w tym repozytorium, scope `user`. Wydanie potwierdzasz
treścią plików z cache'u, nie komunikatem CLI (P-005): `claude plugin validate` → tag → push →
release → `marketplace update` → `plugin update relai@relai` → suma plików po CRLF → LF. Walidator
`core/tools/validate-adapters.js` sprawdza 7 źródeł wersji, w tym baner README i tę sekcję
„Gdzie jesteśmy". Pre-commit tego repo: układ 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji (`process/session-signals.js`, z siatką rytuału), artefakty robocze, załoga (z oceną meldunku),
tryb ciągły, baza reguł optymalizatora z nakładkami rodzin modeli (`claude`, `openai`), walidator.
**Adapter Claude Code**: dwa skille (każdy poniżej 500 linii, razem 9 plików doczytywanych),
14 komend, 4 agenci, 11 hooków, lista modeli. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki,
instalator. **Adapter Codex**: natywny manifest, 14 skilli, router `AGENTS.md`, trzy hooki (start
sesji kopiuje listę modeli).

### Panel `relai-panel` (plan PANEL_CLAUDE, po E8)

Folder `panel/` — drugi plugin marketplace `relai` (źródło `./panel`, wersja 0.3.0 w
`panel/.claude-plugin/plugin.json`, niewydany). Moduł hooków Claude Code Mods (`hooks/register.tsx`,
silnik 2.1.293, „early access”) rysuje pasek `AbovePrompt`: aktywny plan i etap z `CLAUDE.md`
i `STATUS.md`, timer cache (progi 10 i 5 min, TTL założony do pomiaru), koszt sesji
z `$.session.usage()` jako hipotetyczny koszt API. Poza projektem RelAI milczy; przy
`cache-keeper-pl` chowa swój timer; paski innych wtyczek zostają (owijacz woła `next`, bez `width` — P-017).
Zmierzone na żywo w aplikacji desktopowej 2026-10-08.
Komenda `/relai-panel` otwiera panel boczny (tylko z komendy, nigdy sam): formularze 14 komend
z podglądem dokładnego tekstu i przyciskiem „Wyślij” (`$.command.run`, nazwa z `$.command.list()`),
ściągę z `docs/KOMENDY.md` z wyszukiwaniem i frazy sesji wysyłane przyciskiem (`$.prompt.submit`).
Bez pluginu `relai` panel niczego nie wysyła; poza RelAI komenda odpowiada jednym zdaniem.
Formularze pilnuje test parujący je z `argument-hint` nagłówków komend. Wygląd (E8, wybrany przez
człowieka po kalibracji trzech wariantów na żywo): motyw RelAI z bloku `:root` szablonu planów
(`core/panel/theme.mjs` — kolory przepisane i ich mieszanki na ciemne tło, kontrast tekstu na
kartach ≥ 4,5:1 pilnowany testem), na górze „Polecane teraz” (etap, prompt, wycieczka; karta etapu
pokazuje bieżący plan i etap), niżej trzy grupy kart z ikonami 14 komend; formularz rozwija się
w karcie. Nagłówki Kalamem jako Svg z fontem przyciętym do liter napisu
(`core/tools/build-panel-headings.js` → `core/panel/headings.mjs`, wymaga fontTools), ikony z
`docs/zasoby/branding/ikony/` w module `icons.mjs` składanym przez `sync-panel-core.js`. Przyciski
natywne aplikacji, kliknięcie odpowiada błyskiem ramki karty i etykietą „✓ Wysłano” przez 0,9 s.
Terminal: te same karty tekstem w tych samych kolorach, bez grafiki. Ograniczenia silnika: P-018.
Nie woła modelu, nie dopisuje nic do kontekstu, nie używa sieci. Rachunki: `core/panel/*.mjs`
(ESM — silnik nie ładuje CommonJS ani importu spoza folderu pluginu); `panel/hooks/core/` to kopia
bajt w bajt z `node core/tools/sync-panel-core.js`, pilnowana testem. Testy: `claude plugin test
panel` (binarka 2.1.293) i `core/panel/tests/`.

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie; siatka wersji artefaktów
bez gita milczy).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
ostatni: [PROWADZENIE_END_TO_END](archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 9 (ostatni PROWADZENIE_END_TO_END, 2026-09-24) • Aktywny: PANEL_CLAUDE (E1, E2 i E8 zrealizowane, E3 gotowy do startu) • Start sesji:
**88,6 KB / 100 KB** (bez aktywnego planu; po E6 98,2 KB) • Dziennik: **158,1 KB / 150 KB** (rotacja należna) • Sekcja ryzyk: 12 otwartych, archiwum ryzyk: 4 pliki
+ 1 mitygacji • Lekcje: **45,7 KB / 50 KB**, 24 w żywym pliku • Adaptery: 3 • Komendy: 14 •
Testy rdzenia i adapterów: 115 (z `core/panel/`) + 8 testów pluginu `relai-panel` • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) •
Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto, Grok 4.6).
