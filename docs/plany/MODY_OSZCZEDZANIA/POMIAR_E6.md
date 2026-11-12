# POMIAR NA ŻYWO — E6 planu MODY_OSZCZEDZANIA (2026-11-12)

Sesja 637357ee, Claude Code 2.1.321, desktop, Windows, tryb auto, model główny Opus 5.5.

## 1. Sonda drogi orkiestrator → mod (przed kodem, zasada 13, L-0321)

Mod-sonda `relai-e6-sonda` w `~/.claude/dev-mods/637357ee…/` (skill `plugin-authoring` przed
zapisem, L-0322; tryb auto włączył przeładowanie bez pytania). `session.start` rejestruje narzędzie
`crew_models` (`$.tool.register`, `isDeferred: false`), hook `tool.call` na
`mcp__relai-e6-sonda__crew_models` zapisuje wejście do pliku i pokazuje kartę w jednym z trzech
kształtów (`mode`): `ask` — `$.ui.ask` z tabelą w treści pytania; `multi` — `$.tool.call`
narzędzia `AskUserQuestion` z pytaniem na zadanie; `pane` — `$.ui.open` z przyciskiem przy każdym
wierszu. Plik na zdarzenie w scratchpadzie sesji. Trzy zadania testowe (opus / sonnet / haiku),
karty klikał Łukasz.

| Przebieg | Kształt | Wywołanie narzędzia | Karta | Wynik do modelu |
|---|---|---|---|---|
| 1 | `ask` | przeszło (tryb auto, bez odmowy klasyfikatora) | karta z tabelą w treści, 2 przyciski; Łukasz „Accept all” | `{ answer: "Accept all", rows }` |
| 1b | `multi` | przeszło | **odmowa silnika:** `HooksError: … runs the AskUserQuestion tool: that is $.ui.ask (host check)` | błąd w wyniku, model dostał go jako tekst |
| 1c | `pane`, sonda czeka na przycisk panelu (własna obietnica) | przeszło; `$.ui.open` → `{ isPlaced: true }` | panel narysowany | **hook pominięty:** „tool.call hook skipped: ran past its 10s budget”; model dostał „no tool.call hook answered this call” |
| 2 | `pane` + `$.ui.ask` jako bramka | przeszło | panel z przyciskiem na wiersz; Łukasz przestawił wiersz 1 (sonnet → opus), na karcie „Start crew” | `{ answer: { label: "Start crew" }, rows }` z wyborem z panelu |

**FAKTY:**

- **Droga działa:** narzędzie zarejestrowane przez mod model główny woła w trybie auto jak każde
  inne — wywołanie modelu ma prośbę w rozmowie, więc P-057 (wywołanie *z* modu) go nie dotyczy.
  Hook dostaje klucze `mode`, `tasks`, `tool`, `tool_use_id` (bez `agentId` w głównym czacie);
  wynik `{ result: [{ type: 'text', text }] }` dociera do modelu dosłownie.
- **`$.ui.ask` to 2–4 przyciski** (typy `AskOptions`): tabela mieści się w treści pytania, ale
  wybór per wiersz nie — tylko decyzja dla wszystkich naraz.
- **Mod nie może zawołać `AskUserQuestion` przez `$.tool.call`** (kontrola gospodarza) — karta
  z kilkoma pytaniami naraz odpada.
- **Budżet hooka 10 s liczy własne czekanie modu**, nie wywołania `$` w toku (reference
  `plugin-authoring`, „Work that outlives a dispatch”): obietnica czekająca na przycisk panelu
  przekracza budżet, `await $.ui.ask(…)` — nie (przebiegi 1 i 2 czekały na człowieka dłużej niż
  10 s). Sędzia (`$.model.complete`) w hooku narzędzia też jest wywołaniem `$`.
- **Kształt karty załogi (wynik sondy):** panel z tabelą zadanie / model jawny / sugestia / powód
  i przyciskiem wyboru na wiersz, a narzędzie czeka na kartę `$.ui.ask` zamykającą wybór
  („start z wyborem z panelu” / „przyjmij wszystkie sugestie” / „mój dla wszystkich”). Panel
  nienarysowany (`isPlaced: false`) → sama karta: decyzja dla wszystkich naraz.
- **Instrument (zasada 5):** przeładowanie sondy zeruje licznik plików, więc przebieg 2 nadpisał
  pliki `01`–`02` przebiegu 1; wejście przebiegu 1 przepisane wyżej z odczytu sprzed przeładowania.

## 2. Pomiar na żywo kodu E6 (z człowiekiem przy komputerze)

Bramka: BenAI `model-router@token-saving-mods` wyłączony za zgodą Łukasza (`claude plugin disable
--scope user`), Łukasz zrobił `/reload-plugins` (P-065); kopia `model-router/` jako
`relai-model-router` w `~/.claude/dev-mods/637357ee…/` (bez testów). Sonda `relai-e6-sonda`
zapisywała `agent.spawn` (model na wejściu i wyjściu, początek promptu) i `turn.step.model` członków.
Orkiestrator (ta sesja) jak w kroku 5a `/relai-crew`: `ToolSearch` → `crew_models` z trzema
zadaniami tylko do odczytu — a: proste, `opus` z wywiadu; b: proste, `sonnet` z wywiadu; c: proste,
bez modelu (domyślny subagenta z ustawień `claude-sonnet-5-5`, Aneks B) — potem trzech członków
`Agent` w jednej wiadomości, każdy ze znacznikiem w pierwszej linii promptu i modelem z odpowiedzi.

| Przebieg | Karta | Odpowiedź modu | Członkowie |
|---|---|---|---|
| A | panel narysowany **pionowo, litera pod literą** (zgłosił Łukasz); karta bez wyboru przycisku — Łukasz pisał wtedy wiadomość | `crew card: no answer: mine kept` — modele z wywiadu (opus / sonnet / sonnet) | nie uruchomieni (poprawka panelu) |
| B | panel po poprawce; Łukasz przestawił wiersze w panelu, na karcie „Start with the picks above” | `crew card: picks per row` — a, b, c → `haiku` (`changed: true`), sędzia „lower: fast, confidence 0.97” | a, b, c: `agent.spawn` wejście `haiku`, wyjście `claude-haiku-5-5`; **każdy krok** `turn.step.model = claude-haiku-5-5` (7 kroków); 0 kart przy starcie członków |

**FAKTY:**

- **Jedna karta przed startem załogi, wybór per wiersz zastosowany** (`turn.step.model`), także dla
  zadania c, którego model chronił Aneks B (domyślny z ustawień).
- **Brak drugiej karty i sędziego przy członkach:** w rejestrze sesji są wyłącznie rekordy
  `part: crew-<id>` (po jednym ocenianiu zadania na karcie); żaden spawn członka nie dał rekordu
  `part: 0`, czyli gałąź E5 (sędzia, karta pojedyncza) nie ruszyła. Pliku błędu modu brak.
- **Rejestr vs zakładka:** skrypt `suma.mjs` (katalog roboczy E6) — ostatnie linie rejestru tej sesji
  (klucz `mod|part|tool_use_id`, później wygrywa) vs `savingsView` (filtr „ten czat”) **zgodne co do
  tokena**: 6 rekordów (3 z przebiegu A, 3 z B), sędzia in 2 470 / out 270, 6 wywołań. Rekordy B
  niosą zużycie członków po `turn.complete` (a: Haiku 143 879 / 478; b: 227 965 / 1 151;
  c: 145 117 / 1 122) — dane dla wyceny w E10.
- **Błąd układu panelu (przebieg A):** w wąskim panelu (poniżej `WIDE_COLUMNS` 144, w doku prawie
  zawsze) wiersz szedł w kolumnie, a pudełko słów miało `width={0}` z `flexGrow` — w kolumnie
  `flexGrow` rośnie w pionie, szerokość zostaje zero, każda litera w osobnej linii (P-043). Poprawka:
  `width={0}` tylko obok przycisku, próg panelu załogi `STACK_BELOW` 48 (DESIGN.md, 6); ten sam
  wzorzec w panelu E5 tego modu poprawiony, w `relai-input-router` (`register.tsx:479`) zostaje —
  poza granicą E6. Test szerokości przy 40/47/48/160 kolumnach i mutant błędu (zabity).
- **Członek b** sam spróbował `mcp__ccd_session__hand_off_to_session`; klasyfikator trybu auto
  odmówił, plików nie zapisał (raport członka). Zachowanie modelu członka, nie modu.
