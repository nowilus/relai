# ODNOGA — przycisk panelu otwiera nową sesję Claude Code i startuje w niej etap

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-11 · Status: **OTWARTA** ·
Wykonawca: **Opus 5.5 w świeżej sesji** (decyzja Łukasza 2026-10-12; pierwotnie 2026-10-11 Opus 5.5
jako subagent sesji Fable 5.1 — wymóg Fable odwołany 2026-10-11, propozycje UX przygotowuje wykonawca)

## Cel

Po „Tak” na karcie panelu albo paska powstaje **nowa sesja Claude Code w aplikacji desktopowej**, w tym
projekcie, z komendą etapu (albo inną akcją, którą karta wskazuje) gotową do wysłania — człowiek robi
co najwyżej jeden ruch (Enter w nowej sesji), a nie `/clear` w oknie, w którym pracował. Gdy aplikacja
udostępni narzędzie `start_session`, ten sam przycisk uruchamia sesję bez żadnego ruchu poza kartą
zgody aplikacji. Po czym poznać: punkty sekcji „Weryfikacja”.

## Skąd się wzięła

2026-10-11 Łukasz poprosił o research: Codex potrafi z aplikacji otworzyć nowy wątek, panel RelAI
w Claude Code robi dziś `/clear` + komendę w tym samym oknie (E5 planu PANEL_CLAUDE; plan zapisał
jako FAKT „mody nie otwierają nowego okna”). Research w tej sesji ([RESEARCH.html](RESEARCH.html)) —
API modów (`claude-code.d.ts` 2.1.295), paczka aplikacji 2.31226.1.0, dokumentacja deep linków i CLI,
issue anthropics/claude-code#100913 — oraz pomiar na żywo dały trzy fakty: deep link
`claude://code/new?folder=…&q=…` tworzy nową sesję w tym samym oknie z promptem **wpisanym, nie
wysłanym** (także `/relai-stage`), z pytaniami o zaufanie do workspace i kradzieżą fokusu (FAKT,
pomiar Łukasza 2026-10-11); narzędzie `mcp__ccd_session__start_session` istnieje w aplikacji, ale jest
za flagą funkcji `sideSessions` i w tej instalacji go nie ma (FAKT, paczka aplikacji); mod może
wywołać oba mechanizmy — `$.process.run` bez powłoki i `$.mcp.call` / `$.tool.call`. Codex też nie
ma pełnego automatu: szkic w nowym wątku wysyła człowiek (FAKT, E1 PANEL_CODEX).

## Zakres

Pięć paczek N0–N4, każda z własnymi checkboxami; N0 jest pomiarem i rozstrzyga kształt N1.

1. **N0 · Pomiar łańcucha `-p` → desktop** — `claude -p --session-id U "/relai-stage …"`
   właściwą binarką CLI ≥ 2.1.285 (`claude` na PATH to 2.1.280, a `claude.exe` w katalogu aplikacji to
   sama aplikacja — próba z 2026-10-11 nic nie zmierzyła), potem `claude --desktop --resume U` oraz
   `claude://resume?session=U`. Wynik (nowa sesja z gotową rozmową bez Entera, czy nie) idzie do
   `docs/PULAPKI.md` i decyduje, czy N1 ma drugi wariant startu.
2. **N1 · Nowa sesja jako akcja karty** — `core/panel/decisions.mjs` (nowy rodzaj kroku
   `newSession` obok `clear`), `panel/hooks/launch.ts` (nowy: składa `claude://code/new?folder=<cwd>&q=<komenda>`
   i otwiera go `$.process.run` bez powłoki: Windows `rundll32 url.dll,FileProtocolHandler`, macOS
   `open`, Linux `xdg-open`), `panel/hooks/pane-commands.tsx` (wybór czatu: „nowa sesja” jako
   domyślny, „świeży — /clear”, „bieżący”), `panel/hooks/register.tsx` (`runStep`). Przycisk paska
   „Tak” przy karcie etapu idzie tą samą drogą.
3. **N2 · Zgoda i fokus przenoszone plikiem, nie znacznikiem** — `panel/hooks/focus.ts`,
   `panel/hooks/register.tsx`, `adapters/claude-code/commands/relai-stage.md`: komenda wpisana w nowej
   sesji przechodzi przez hook `command.run` tamtej sesji, który wycina `--zgoda-panelu` (P-022), więc
   zgoda z karty wędruje plikiem `.claude/relai/zgoda-etapu/<TEMAT>-<EN>.json` (karta, czas, cwd; ważny
   10 min, jednorazowy), a fokus — wpisem `.claude/relai/fokus/przekazanie.json` czytanym przy
   `session.start` nowego procesu. Procedura `/relai-stage` czyta plik zgody tak, jak dziś czyta
   znacznik (D-35 bez zmian: zgoda nadal pochodzi z karty).
4. **N3 · Gotowość na `start_session`** — `panel/hooks/launch.ts`: przy `session.start` lista narzędzi
   (`$.tool.list()`); gdy jest `mcp__ccd_session__start_session`, karta używa go (`$.mcp.call`) zamiast
   deep linku, a tekst karty mówi, że aplikacja pokaże własną kartę zgody; test na atrapie listy
   narzędzi w obu stanach. Sonda `relai-panel` loguje stan flagi raz na sesję w `/relai-panel` →
   Koszty/„Środowisko”.
5. **N4 · Dokumenty i wydanie** — `docs/PULAPKI.md` (nowa pułapka: deep link wpisuje, nie wysyła;
   pytania o zaufanie; fokus; `q` z `/` przechodzi; sesja nie istnieje do Entera; `claude.exe`
   w katalogu aplikacji to aplikacja), `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` (wiersz
   o karcie startu), `README.md` (sekcja panelu), `panel/.claude-plugin/plugin.json` i
   `.claude-plugin/marketplace.json` → `relai-panel` 0.14.0 (0.13.0 wydane 2026-10-11 w planie
   LIMIT_CHECKPOINT), nota wydania; w `docs/archiwum/plany/PANEL_CLAUDE/`
   nic nie edytujesz — nieaktualny FAKT dostaje adnotację w `docs/DZIENNIK.md` i tu w „Wyniku”.

## Poza zakresem

- Panel Codeksa i jego nowy wątek — plan PANEL_CODEX (E1 w toku, gpt-6.1-sol).
- Automatyczne wysłanie promptu bez ruchu człowieka przez deep link — aplikacja tego nie daje
  (FAKT, dokumentacja deep linków); nie obchodzimy tego symulacją klawiszy.
- Wariant „nowe okno Windows Terminal z CLI” (`wt.exe` + `claude "…"`) — odrzucony przez Łukasza
  2026-10-11 (poza aplikacją, bez panelu).
- Chip `spawn_task` (osobny worktree, klik w chip) i rutyny ad hoc (`run_scheduled_task`) — opisane
  w RESEARCH.html jako zapas, nie wdrażane.
- Zmiany w rdzeniu `core/panel/` poza `decisions.mjs` — kontrakt PANEL_CODEX.

## Weryfikacja

- [ ] N0: wynik łańcucha `-p` → desktop zapisany w `docs/PULAPKI.md` z wersją CLI i datą; jedno
      z dwóch zdań: „nowa sesja z gotową rozmową bez Entera” albo „nie działa, bo …”.
- [ ] N1: testy `panel/hooks/decisions.test.ts` i `band.test.ts` — karta etapu w trybie „nowa sesja”
      wykonuje dokładnie `['newSession']` (żadnego `clear`), a `launch.ts` buduje URL z `folder`
      równym `cwd` sesji i `q` równym komendzie (test na trzech systemach, atrapa `$.process.run`
      sprawdza argv bez powłoki). Kontrola pozytywna: testy padają na starym kodzie.
- [ ] N1 na żywo (Łukasz, 2.1.295, desktop): „Tak” na karcie etapu → nowa sesja w sidebarze
      z `/relai-stage TEMAT EN` w polu; Enter → procedura etapu rusza bez drugiego pytania o zgodę
      (N2); okno, w którym padło „Tak”, zostaje przy swojej rozmowie.
- [ ] N2: test — plik zgody starszy niż 10 min albo z innym cwd nie liczy się jako zgoda; drugi
      odczyt tego samego pliku nie liczy się (plik skasowany po użyciu); fokus trafia wyłącznie do
      pierwszej sesji startującej w tym cwd po przekazaniu (`focus-flow.test.ts`).
- [ ] N3: test z atrapą `$.tool.list()` — z `mcp__ccd_session__start_session` karta woła
      `$.mcp.call('ccd_session','start_session', …)` i nie otwiera deep linku; bez niego odwrotnie.
- [ ] N4: `claude plugin validate panel`, `claude plugin test panel` binarką 2.1.295 — wszystkie
      testy zielone; `node core/tools/validate-adapters.js` exit 0; `sync-panel-core --check` zgodny;
      wpis marketplace 0.14.0 = `plugin.json`.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/NOWA_SESJA/` przejrzany raportem i skasowany po
      „tak”; liczby przed i po we wpisie dziennika, artefakty spoza niego z nazwy.

## Wynik

—
