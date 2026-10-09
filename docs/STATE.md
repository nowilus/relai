# STATE — RelAI

Stan na: 2026-10-09 (E7 planu PANEL_CLAUDE — wydanie 2.8.0 i rodziny pluginów panelu w toku; publicznie nadal 2.7.1)

## Gdzie jesteśmy

RelAI ma w repozytorium **2.8.0**: zgodę na start etapu z karty panelu (`/relai-stage
--zgoda-panelu`, E5 planu PANEL_CLAUDE) i trzy pluginy panelu w marketplace RelAI, każdy z własną
wersją i dopiskiem „early access”: `relai-panel` 0.9.0, `relai-progress` 0.2.0,
`relai-cache-keeper` 0.3.0. Publicznie stoi jeszcze 2.7.1 (poprawka P-007, tag `v2.7.1` z
2026-09-28) — wypchnięcie i tag 2.8.0 idą po zgodzie człowieka. Poprzednie duże wydanie, 2.7.0, zamknęło etapy E5–E7 planu PROWADZENIE_END_TO_END
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
  (GUI i telemetria kosztów w zakresie) wpisany. Zrealizowane 2026-10-08: E1 (pasek), E2 (panel
  i formularze), E8 (motyw, Aneks A), E3 (kolektor pomiarów i zakładka „Koszty"); 2026-10-09:
  **E9 (postęp i agenci, Aneksy B i C)** — rodzina trzech pluginów w tym repo (`relai-panel`,
  `relai-progress`, `relai-cache-keeper`), **E4 (mapa przepływu i koszt etapu)**, **E5 (decyzje
  w panelu: karta potwierdzenia, start etapu ze zgodą z panelu)**, **E6 (dokumenty i cennik,
  Aneksy D i E)**. **E7 „Wydanie relai-panel” w toku** (ostatni etap planu): wpisy trzech
  pluginów w `marketplace.json` z własnymi wersjami i dopiskiem „early access” (decyzja człowieka
  2026-10-09), `relai` 2.8.0, walidator wersji pluginów panelu, `register.tsx` podzielony na pliki
  poniżej 800 linii, sekcja o panelu w README i `KOMENDY.md`. Zostają wypchnięcie i pomiar
  w czystej instalacji.

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

Repozytorium: **2.8.0** (E7 planu PANEL_CLAUDE); publicznie **2.7.1** (tag `v2.7.1`, release Latest, 2026-09-28) do wypchnięcia 2.8.0. Źródło instalacji: własny marketplace w tym repozytorium, scope `user`; od 2.8.0 marketplace niesie cztery pluginy — `relai` i trzy pluginy panelu z własnymi wersjami. Wydanie potwierdzasz
treścią plików z cache'u, nie komunikatem CLI (P-005): `claude plugin validate` → tag → push →
release → `marketplace update` → `plugin update relai@relai` → suma plików po CRLF → LF. Walidator
`core/tools/validate-adapters.js` sprawdza 7 źródeł wersji, w tym baner README i tę sekcję
„Gdzie jesteśmy", a wpis marketplace każdego pluginu panelu porównuje z `plugin.json` tego
pluginu (wpis bez wersji to błąd). Pre-commit tego repo: układ 1.9.2 (shim + dwa pliki `.cjs`).

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji (`process/session-signals.js`, z siatką rytuału), artefakty robocze, załoga (z oceną meldunku),
tryb ciągły, baza reguł optymalizatora z nakładkami rodzin modeli (`claude`, `openai`), walidator.
**Adapter Claude Code**: dwa skille (każdy poniżej 500 linii, razem 9 plików doczytywanych),
14 komend, 4 agenci, 11 hooków, lista modeli. **Adapter Cursor**: trzy reguły `.mdc`, dwa hooki,
instalator. **Adapter Codex**: natywny manifest, 14 skilli, router `AGENTS.md`, trzy hooki (start
sesji kopiuje listę modeli).

### Panel `relai-panel` i rodzina pluginów (plan PANEL_CLAUDE, E7)

Trzy pluginy Claude Code Mods w tym repo (silnik 2.1.293, „early access”), każdy z kopią rdzenia
`core/panel/` z `sync-panel-core.js`; nad promptem trzy paski cache → plan → postęp w stylu
`docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` (miękkie tło, siatka etykieta | treść | liczba,
`BAND`/`BAR` w `theme.mjs`). Korzeń projektu szukany w górę od katalogu sesji (P-021).
**`panel/`** (`relai-panel` 0.9.0; od E7 moduł hooków `register.tsx` trzyma stan, kolektor,
odczyty i działania z `$`, a widoki rysują `band.tsx`, `pane-parts.tsx` i `pane-commands`, `-map`,
`-docs`, `-costs.tsx` bez `$` — P-023 pkt 10): pasek planu (plan, etap, status, koszt sesji z
`$.session.usage()` jako hipotetyczny koszt API, liczba etapów). **`progress/`** (`relai-progress`
0.2.0, fork `savvy-progress` — MIT, johnnyvizz): pasek postępu etapu albo biegu `/relai-crew`
z checkboxów promptu, pocięty na segmenty z podpowiedzią po najechaniu (Svg na desktopie, znaki
w terminalu), odświeżany po edycji i co 10 s; przycisk „Panel RelAI”; panel `/relai-agents` —
punkty etapu i subagenci sesji z modelem, kontekstem i kosztem z pomiarów E3. **`cache-keeper/`**
(`relai-cache-keeper` 0.3.0, dawny prywatny `cache-keeper-pl`): timer cache, podtrzymanie
(`$.model.fork`) i przekazanie wyłącznie na żądanie człowieka — R7 („nie woła modelu”) dotyczy
tylko dwóch pierwszych (Aneks C). Poza projektem RelAI wszystkie milczą; paski innych wtyczek
zostają (owijacz woła `next`, bez `width` — P-017). Zmierzone na żywo na desktopie i w terminalu.
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
**Pomiar kosztów (E3):** kolektor zapisuje każde wywołanie modelu sesji RelAI — wątek główny
i subagenci (`turn.step`), kompakcje (`session.compact`) — do `.claude/relai/pomiary/<data>-<sesja>.jsonl`
(poza gitem, plik na sesję, rekord bez treści: sesja, tura, indeks, agent, model, cztery kategorie
tokenów, pole `tool` — schemat wspólny z panelem Codeksa). Rachunki w `core/panel/measure.mjs`
(klucz bez podwójnego liczenia, braki słowami), cennik z datą w `core/panel/pricing.mjs` (zapis
cache: wątek główny 1 h, subagent i kompakcja 5 min — P-020), wykresy w `core/panel/charts.mjs`.
Zakładka „Koszty": suma sesji z kategoriami, kafle licznika Claude Code (jak `/cost`, reszta poza
pętlą słowami), cache i całego projektu, wywołania w czasie z osią Y i podpowiedziami po najechaniu,
agenci, modele, etapy sesji z kontrolą „etapy i poza etapem = suma sesji”; kwoty i procenty
z dwoma miejscami.
**Mapa i koszt etapu (E4):** rekord pomiaru niesie etap `W TOKU` aktywnego planu (`stage`) i zadanie
`/relai-crew` (`task`, z linii `RelAI crew run: …` promptu subagenta); rekord sprzed E4 bez tych pól
idzie do „poza etapem — sprzed znacznika”. Rachunki: `core/panel/attribution.mjs` (każdy rekord
w jednej pozycji, suma co do centa), `core/panel/flow.mjs` (plany, etapy z datą, odnogi w obu
kształtach, fale załogi regułą `crew.js`, scalanie). Zakładka „Mapa”: aktywny plan z paskiem
segmentów etapów i kosztem, etapy rozwijane do rozbicia kosztu, odnóg i zadań, inne plany,
przebiegi załogi (fale, zależności, scalanie i przypisanie do etapu jako widok w
`.claude/relai/panel/scalenia.json` — pliki przebiegu nietknięte), „Poza etapem”, archiwum planów.
**Decyzje w panelu (E5):** każde działanie zmieniające stan idzie przez kartę „Do potwierdzenia”
(R4; rachunki w `core/panel/decisions.mjs`, opcjonalny drugi krok dla E6) — przed „Tak” nic nie
idzie do czatu ani na dysk. `/relai-stage` z panelu: karta z modelem sesji wobec planu, etapem,
katalogiem roboczym i liczbą punktów weryfikacji; „Tak” wysyła (w świeżym czacie po `/clear`)
komendę ze znacznikiem `--zgoda-panelu <id>` — procedura `/relai-stage` (i wygenerowany z niej
skill Codeksa) przyjmuje go jako zgodę D-35 i nie pyta drugi raz; hook panelu wycina znacznik
z każdego wywołania, które widzi, a wysyłka samego panelu go omija (P-022). „Kopiuj prompt” do
ręcznego otwarcia sesji. `/relai-update` i `/relai-models` z kartą stanu z plików; `/relai-clean`
z listą grup z raportu (`$.process.run` z jednym zamkniętym argv, nic zaznaczone na starcie);
skład `/relai-crew` edytowalny przed startem przebiegu (zapis `zadania.json` po „Tak”). Nowa
procedura `/relai-stage` czeka na wydanie `relai` w E7; pomiar na żywo startu bez drugiego
pytania — bramka E7.
**Dokumenty i cennik (E6, Aneksy D i E):** zakładka „Dokumenty” — wszystkie dokumenty projektu
(`CLAUDE.md`, `AGENTS.md`, `docs/`) jako ikony z typem pliku (MD, HTML, PDF… konturami Kalam),
filtr „Zmienione / Wszystkie” (zmienione na górze: najpierw z tej tury, potem od ostatniego
commita z liczbą linii), układ „Kafle” (półka w grupach) albo „Drzewo” jak eksplorator VS Code
(foldery otwarte/zamknięte, nazwy bez ścieżek, domyślnie zwinięte; limit 60 wierszy i 40 plików na
folder — większe drzewo desktop gubi bez słowa, P-023); wybrany dokument otwiera okno pod sobą:
„Zmiany” (`git diff HEAD` jednego pliku z listy, zamknięty argv, rysowany wierszami jak code review)
albo „Podgląd” (Markdown, kod, PDF słowem) — `core/panel/documents.mjs`; znacznik „w tej turze” z
`toolUses` kroków tury (Edit/Write/MultiEdit/NotebookEdit, także subagentów; zapisu poleceniem
powłoki nie widzi i mówi to). W „Kosztach” sekcja „Cennik”: data i źródło, ostrzeżenie po progu
z wiersza „Cennik panelu” w `docs/USTAWIENIA.md` (30 dni), przypomnienie o modelu bez ceny z liczbą
rekordów, modele z pomiarów projektu z kwotą; „Zaktualizuj cennik” → karta → po „Tak” jeden odczyt
strony cennika Anthropic (`fetchPricingPage`) → różnica stara–nowa → zapis datowanej wersji do
`.claude/relai/panel/cennik.json` po drugim „Tak”; „Nie” wycisza przypomnienie do zmiany daty
cennika. Parser strony ścisły (wiersz nierozpoznany → nic nie jest zapisane), stawki per model
z cache i progiem długiego promptu; rekord wyceniany wersją obowiązującą w chwili pomiaru (R6),
model dotąd bez ceny — pierwszą, która go zna. Zmierzone na żywo na desktopie 2026-10-09.
`relai-panel` i `relai-progress` nie wołają modelu i nie dopisują nic do kontekstu; jedyny ruch
sieciowy to odczyt strony cennika w `relai-panel` po „Tak” (wyjątek od R7, Aneks D). Rachunki: `core/panel/*.mjs`
(ESM — silnik nie ładuje CommonJS ani importu spoza folderu pluginu); `panel/hooks/core/` to kopia
bajt w bajt z `node core/tools/sync-panel-core.js` (też `progress/hooks/core/`,
`cache-keeper/hooks/relai/`), pilnowana testem. Testy: `claude plugin test` w `panel/`, `progress/`
i `cache-keeper/` (binarka 2.1.293) i `core/panel/tests/`.

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie; siatka wersji artefaktów
bez gita milczy).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
ostatni: [PROWADZENIE_END_TO_END](archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 9 (ostatni PROWADZENIE_END_TO_END, 2026-09-24) • Aktywny: PANEL_CLAUDE (E1, E2, E8, E3 i E9 zrealizowane, E4 gotowy do startu) • Start sesji:
**88,6 KB / 100 KB** (bez aktywnego planu; po E6 98,2 KB) • Dziennik: **~200 KB / 150 KB** (rotacja należna) • Sekcja ryzyk: 12 otwartych, archiwum ryzyk: 4 pliki
+ 1 mitygacji • Lekcje: **59,4 KB / 50 KB** (rotacja należna), 37 w żywym pliku • Adaptery: 3 • Komendy: 14 •
Testy rdzenia i adapterów: 263 (z `core/panel/`) + 105 testów pluginów (`relai-panel` 70, `relai-progress` 16, `relai-cache-keeper` 19) • Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) •
Modele, na których zmierzono proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto, Grok 4.6).
