# STATE — RelAI

Stan na: 2026-10-12 (plan LIMIT_CHECKPOINT zamknięty; rotacja lekcji, ryzyk i dziennika)

## Gdzie jesteśmy

RelAI **2.9.0** jest w repozytorium i publicznie (tag `v2.9.0`, 2026-10-11: zapis pracy przed
limitem planu, plan LIMIT_CHECKPOINT). Plugin `relai` działa w trzech narzędziach — Claude Code,
Cursorze i Codeksie — na jednym rdzeniu procesu, z czternastoma komendami. Panel RelAI w oknie
Claude Code to trzy osobne pluginy „early access” z marketplace tego repozytorium: `relai-panel`
0.14.0, `relai-progress` 0.4.0, `relai-cache-keeper` 0.6.0 (plan PANEL_CLAUDE zamknięty
2026-10-10, odnoga AUDYT_MODOW zamknięta 2026-10-11, wszystkie paczki zmierzone na żywo na 2.1.295). Aktywny plan PANEL_CODEX — panel dla Codeksa — jest
zaakceptowany, E1 trwa po stronie Codeksa. Opinii spoza projektu nadal nie ma.

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
- Załoga deleguje zadania do trzech narzędzi; recenzent bez prawa zapisu, dwa zadania nie piszą
  naraz do jednego pliku, meldunek bez dowodu dostaje najwyżej dwie kontynuacje.
- Zadanie z kodem kończy się testami projektu i przeglądem diffu w trzech liniach; „coś nie
  działa” i pierwsze wdrożenie mają własne procedury.
- Start sesji zgłasza, co zostało niedomknięte: brakujący prompt etapu, etap bez wpisu, artefakt
  bez podbitej wersji, rozjechana kopia `CLAUDE.md`, rozjazd stanu, przekroczony budżet.
- Dokumenty nie puchną bez końca: historia idzie do archiwum bajt w bajt z sumą kontrolną; sprawy
  czekające na człowieka mają jeden adres i wracają jako pytanie, gdy czekają zbyt długo.
- Klucz API nie wejdzie do repozytorium (pre-commit w każdym narzędziu, także w projektach ESM);
  pliki robocze sprząta się raportem w grupach, jednym „tak” na grupę.
- Pytanie o model pokazuje nazwy z listy narzędzia; prompt z `/relai-prompt` jest skrojony pod
  model, który go wykona, według reguł dostawcy z datą odczytu.
- **Panel w Claude Code:** nad promptem trzy spokojne paski — cache jako pięć baterii z kosztem
  sesji, plan z fokusem tej sesji (gdy pracy nie wybrano: przycisk `Wybierz pracę…`), postęp etapu
  albo paczek odnogi; `/relai-panel` z formularzami komend, Mapą od „Ta sesja”, Dokumentami
  (kafle albo drzewo, podgląd i diff), ściągą, frazami i Kosztami z cennikiem; `/relai-agents`.
  Każda zmiana stanu przez kartę „Tak / Nie”; `/relai-stage` przyjmuje zgodę z karty; jedyny ruch
  sieciowy to strona cennika Anthropic po „Tak”. Poza projektem RelAI paski milczą.
  **Start etapu w nowej sesji** (odnoga NOWA_SESJA, `relai-panel` 0.14.0 w repo, zmierzone na żywo
  2026-10-12): na desktopie „Tak” otwiera nową sesję aplikacji z komendą w polu, Enter tam startuje
  etap bez drugiego pytania o zgodę (plik zgody ważny 10 min), stara rozmowa zostaje; gdy aplikacja
  odda `start_session`, karta użyje go zamiast linku (P-032, P-033).
- **Zapis pracy przed limitem:** progi limitu 5 h (90 %) i tygodniowego (98 %) ustawiane z karty
  „Próg limitu” w Kosztach z zasięgiem sesja / projekt / globalnie; po przekroczeniu karta po turze
  „pracuję dalej / zapisz pracę”, zapis = testy, commit lokalny, dokumenty i plik wznowienia;
  po resecie przycisk „Wznów pracę” otwiera nową rozmowę od listy „Co dalej”, a start sesji mówi,
  ile commitów doszło od zapisu (plan [LIMIT_CHECKPOINT](archiwum/plany/LIMIT_CHECKPOINT/STATUS.md),
  zamknięty 2026-10-12).
- W folderze bez struktury RelAI hooki milczą; skill proponuje strukturę, a propozycję da się
  wyciszyć raz na maszynę.

## Nad czym pracujemy teraz

- **PANEL_CODEX, E1 — przejęcie rdzenia i natywny panel w Codeksie** (plan
  [PANEL_CODEX](plany/PANEL_CODEX/STATUS.md), ZAAKCEPTOWANY 2026-10-10, 8 etapów, autor
  i wykonawca `gpt-6.1-sol` w Codeksie, Aneks A — 16 pól kontraktu — zaakceptowany). Po co: ten sam
  panel, co w Claude Code, w oknie Codeksa, na wspólnym rdzeniu `core/panel/`. Stan: natywny widok
  i wiadomość do bieżącego czatu potwierdzone sondą 0.0.7; minimalny pakiet `adapters/codex/panel/`
  0.1.0 (13 testów, audyt 0 podatności) pokazuje właściwy stan w czacie kontrolnym, układ
  zaakceptowany; sonda 0.0.9 z poprawką natywnych fontów czeka na pomiar po przeładowaniu
  macierzystego procesu (nadal 0.0.7). Dalsza diagnostyka w czacie kontrolnym, bez mostków przez
  czat macierzysty; kontrakt w [README adaptera](../adapters/codex/panel/README.md). Tabela
  STATUS planu pokazuje jeszcze `GOTOWY DO STARTU` — do wyprostowania na `W TOKU`.

## Co dalej

- Aneks do PANEL_CODEX z zapisem pracy przed limitem dla panelu Codeksa — po domknięciu jego E1
  (bramka zamknięcia LIMIT_CHECKPOINT, decyzja Łukasza 2026-10-12). Przepięcie `prompt-mode.js`
  na `threshold.js` nadal świadomie odłożone.
- `relai-stage.md` wersja 6 (kasowanie pliku zgody po starcie, odnoga NOWA_SESJA) wyjdzie
  z najbliższym wydaniem `relai`; `relai-panel` 0.14.0 wydany 2026-10-12.
- Odnoga [AUDYT_SKILLI](fixy/AUDYT_SKILLI/ODNOGA.md) (OTWARTA): skille wg praktyk Agent Skills —
  53 wiersze luk (14 zgodne, 21 częściowo, 11 brak), paczki S1–S7 (strażnik w walidatorze,
  odchudzenie SKILL.md, historia poza instrukcje, `rotate.js`, ewaluacje, `disable-model-invocation`,
  przegląd cudzego kodu). Raport: [RAPORT.html](fixy/AUDYT_SKILLI/RAPORT.html).

- E1: przeładować klienta MCP, zmierzyć sondę 0.0.9 (fonty, przyciski, świeży szkic z właściwym
  projektem); prompt E2 powstaje dopiero po odbiorze E1.
- Pasek plan przed pierwszym promptem po `/clear` — zrzut pustego czatu przy następnej okazji
  (pasek cache ukrywa się do pierwszej tury celowo).
- Ustalenia poza zakresem audytu modów (pięć pozycji `outOfScope`, wariant B „jedna listwa”) —
  decyzja człowieka: plan, odnoga albo odrzucić.
- Bramki świadomie otwarte: start etapu z karty panelu bez drugiego pytania (E5 PANEL_CLAUDE);
  jedno okno pytań trybu ciągłego (Aneks F) i brak pytania po zadaniu w tle (Aneks H).
- `/relai-models` w sesji Codeksa — lista ma nazwy z 2026-09-05; nakładka `openai` bez reguł
  z nazwą modelu.
- Wątek `OPIS_REPO` (opis i tematy repozytorium na GitHubie; manifest mówi o jednym narzędziu).
- Sprzątanie `.claude/relai/pomiary/` wraca, gdy folder przekroczy 10 MB (C11).
- Cudze projekty: ExpensesManager pod 2.8.0 (`package.json` przy kopiach, P-007); PolyFlow
  i JiraManager — ponowna instalacja pre-commita, w PolyFlow 60 martwych linków i należna rotacja;
  migracja JiraManagera czeka na okno właściciela (R5).
- Drobne: dwie wady `work-artifacts.js` (`kasuj` melduje sukces na ścieżce nieistniejącej,
  `zachowaj` na cudzej ścieżce pisze marker w projekcie sesji — obejście: ukośniki i kontrola
  katalogu); `PRZENOSNOSC.md` 2.3 nieaktualna; metadane sesji `ProbaCursorE6` do usunięcia.

## Co blokuje

- Ochrona konfiguracji jest doradcza (`ask`): w sesji z automatyczną akceptacją przepuszcza zapis.
- Sesja Cursora w tym folderze nie ma kontekstu RelAI ani blokady sekretu (D-89).
- Świeża sesja CLI bywa niedostępna — etap oparty na niej sprawdza ją przed startem.
- Decyzje czekające na człowieka: sekcja „Czeka na człowieka” w dzienniku.

---

## Szczegóły techniczne

### Wersja i instalacja

Repo i publicznie **2.9.0**; marketplace w tym repozytorium (scope `user`) niesie cztery pluginy:
`relai` i trzy pluginy panelu z własnymi wersjami i tagami (`relai-panel-v0.14.0`). Wydanie
potwierdzasz treścią plików z cache'u, nie komunikatem CLI (P-005): `claude plugin validate` → tag
→ push → release → `marketplace update` → `plugin update` → suma plików po CRLF → LF. Walidator
`core/tools/validate-adapters.js` sprawdza 7 źródeł wersji (w tym baner README i „Gdzie jesteśmy”)
i wpis marketplace każdego pluginu panelu z jego `plugin.json`. Pre-commit repo: układ 1.9.2.

### Zawartość pluginu

**Rdzeń** (`core/`): specyfikacje dokumentów, szablon planu HTML, guardraile, rozpoznania startu
sesji, artefakty robocze, załoga, tryb ciągły, baza reguł optymalizatora z nakładkami `claude`
i `openai`, walidator, rdzeń panelu `core/panel/*.mjs` (pomiar kosztów, cennik, atrybucja, mapa,
decyzje, dokumenty, motyw, nagłówki Kalamem). **Adapter Claude Code**: dwa skille z plikami
doczytywanymi, 14 komend, 4 agenci, 11 hooków, lista modeli. **Adapter Cursor**: trzy reguły
`.mdc`, dwa hooki, instalator. **Adapter Codex**: manifest, 14 skilli, router `AGENTS.md`, trzy
hooki; pakiet panelu `adapters/codex/panel/` w budowie (E1).

### Pluginy panelu (Claude Code Mods, „early access”, zmierzone na 2.1.295)

`panel/` (`relai-panel`), `progress/` (`relai-progress`, fork `savvy-progress` MIT),
`cache-keeper/` (`relai-cache-keeper`); każdy z kopią rdzenia z `sync-panel-core.js`, pilnowaną
testem. Pomiary kosztów w `.claude/relai/pomiary/<data>-<sesja>.jsonl` (poza gitem, schemat
wspólny z panelem Codeksa), cennik z datą w `.claude/relai/panel/cennik.json`, scalenia i fokus
sesji w `.claude/relai/`. Wygląd i zasady pasków: brief
[STYL_PASKOW_CLAUDE.md](zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md) (v3.2); ograniczenia silnika:
P-017–P-024 w [PULAPKI.md](PULAPKI.md); historia i decyzje: [plan PANEL_CLAUDE](archiwum/plany/PANEL_CLAUDE/STATUS.md)
(Aneksy A–E) i [karta AUDYT_MODOW](fixy/AUDYT_MODOW/ODNOGA.md) (14 paczek, raport 94 ustaleń).
Testy: `claude plugin test` binarką aplikacji (`claude` na PATH to starsza wersja, P-024).

### Wymagania

Claude Code, Cursor albo Codex • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai • Plany zamknięte: [docs/archiwum/plany/](archiwum/plany/) •
Backupy: `C:\Users\Lukasz\Backupy\RelAI` • [PRZENOSNOSC.md](PRZENOSNOSC.md) •
[PULAPKI.md](PULAPKI.md) • [KOMENDY.md](KOMENDY.md)

### Liczby

Plany zamknięte: 11 (ostatni LIMIT_CHECKPOINT, 2026-10-12) • Aktywny: PANEL_CODEX (E1 W TOKU) •
Start sesji: **123,2 KB / 100 KB** (2026-10-12 przed rotacją) • Dziennik: **~90 KB / 150 KB**
(po rotacji 2026-10-12) • Ryzyka: 17 w tabeli, archiwum 6 plików + 1 mitygacji • Lekcje:
**46,9 KB / 50 KB**, 20 w żywym pliku • Adaptery: 3 • Komendy: 14 •
Testy: 295 rdzeń, panel i adaptery (`node --test`, 4 katalogi) + 353 pluginów panelu (148 / 31 / 174) •
Projekty na RelAI: 3 (RelAI, PolyFlow, JiraManager przed migracją) • Modele, na których zmierzono
proces: 6 (Fable, Opus, Sonnet, Haiku, Composer/auto, Grok 4.6).
