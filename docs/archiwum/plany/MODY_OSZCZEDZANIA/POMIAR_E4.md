# POMIAR NA ŻYWO — E4 planu MODY_OSZCZEDZANIA (2026-11-11)

Sesja 3ff5d516, Claude Code 2.1.321, desktop, Windows, tryb auto.

## 1. Sonda kształtu wyniku MCP (przed kodem, zasada 13, L-0321)

Mod-sonda `relai-e4-sonda` w `~/.claude/dev-mods/3ff5d516…/` (skill `plugin-authoring` przed
zapisem, L-0322): hook `tool.call` bez dopasowania, dla `mcp__*` zapisuje kształt `await next(e)`
(klucze, typy, długości napisów, pierwsze 160 znaków) do pliku w scratchpadzie sesji, plik na
wywołanie. Wczytany przez tryb auto bez pytania.

| Konektor | Przebieg | Wejście `e` (klucze) | `ran` (klucze) | `ran.result` | `ran.text` |
|---|---|---|---|---|---|
| `mcp-registry__search_mcp_registry` (tekst JSON) | 1 | `keywords`, `tool`, `tool_use_id` | `ref`, `result`, `text` | tablica, 1 blok `{type:'text', text}` — JSON w napisie | 2 962 zn. |
| `mcp-registry__search_mcp_registry` | 2 | jw. | jw. | jw. | 1 048 zn. |
| `1a59c906…__guide` (długi tekst) | 1 | `items`, `tool`, `tool_use_id` | `ref`, `result`, `text`, `isReadOnly` | tablica, 1 blok tekstu | 35 833 zn. |
| `1a59c906…__guide` | 2 | jw. | jw. | jw. | 6 003 zn. |
| `scheduled-tasks__list_scheduled_tasks` | 1 | `tool`, `tool_use_id` | `ref`, `result`, `text` | tablica, 1 blok tekstu (zdanie) | 66 zn. |
| `Claude_Browser__tabs_context` | 1, 2 | `tool`, `tool_use_id` | `ref`, `result`, `text` | tablica, 1 blok tekstu (JSON + zdanie) | 164 zn. |

**FAKTY (dwa przebiegi):**

- `ran.result` dla konektora to **sama tablica bloków treści** (`McpContentBlock[]`), nie obiekt
  `McpToolResult` `{ content, isError, structuredContent }` z typów — zdanie z typów było hipotezą.
- JSON przychodzi jako **napis w bloku `text`**; „obcięcie nieużywanych pól” oznacza więc parsowanie
  tekstu bloku, nie pola wyniku.
- `ran.text` = teksty bloków złączone; ma tę samą długość co jedyny blok.
- W `e` **nie ma** `server` (proweniencji z typów `McpServerProvenance`) — nazwa serwera tylko
  z `e.tool` (`mcp__<serwer>__<narzędzie>`).
- Wynik 35 833 znaków konektora dotarł do modelu **w całości** (bez `persistedOutputPath`, inaczej
  niż Bash w P-065) — próg 16 000 ma więc sens dla konektorów.
- Wielu bloków w jednym wyniku żaden z sześciu konektorów sesji nie zwrócił; kod obsługuje tablicę
  dowolnej długości, blok inny niż `text` (obraz, zasób) → cały wynik przechodzi (specyfikacja:
  „wynik nie jest tekstem, przechodzi”). Wynik `isError` nie wystąpił — gałąź z typów, przepuszczana.

## 2. Pomiar na żywo kodu E4 (bez człowieka przy komputerze)

Łukasz zgodził się na bramkę, ale dalej „dokończ sam”: nikt nie robił `/reload-plugins` ani nie
klikał. BenAI `input-router@token-saving-mods` wyłączony przez `claude plugin disable` (user) —
w działającej sesji zostaje wczytany do `/reload-plugins` (P-065), więc mod RelAI widział bliźniaka
jako wyłączonego, a BenAI mógł nadal działać; wyniki niżej niosą nagłówek RelAI, czyli podmienił je
mod RelAI. Kopia `input-router/` jako `relai-input-router` w `~/.claude/dev-mods/3ff5d516…/`,
wczytana na końcu tury wywołanej poleceniem w tle (tryb auto, bez pytania).

| Wywołanie | Wynik | Tokeny przed → po | Haiku in / out |
|---|---|---|---|
| `1a59c906…__guide` `topic.index` (35 833 zn., zwykły konektor, tekst) | notatki z nagłówkiem RelAI, numery linii, ścieżka kopii pełnej treści | 8 959 → 1 900 | 14 493 / 4 296 (19,3 s) |
| ten sam wywołanie drugi raz | z pamięci (`notes-memory`), te same notatki | 8 959 → 1 900 | 0 wywołań |
| `mcp-registry__search_mcp_registry` (konektor nietykany, 2 tys. zn.) | dosłownie, bez rekordu | — | 0 |
| `Claude_Browser__tabs_context` (nietykany) | dosłownie, bez rekordu | — | 0 |

**Rejestr vs zakładka:** skrypt `suma.mjs` (katalog roboczy E4) — surowe linie rejestru sesji
vs `savingsView` (filtr „ten czat”) **zgodne co do tokena**: 2 rekordy, 14 118 tokenów mniej,
Haiku 1 wywołanie, in 14 493 / out 4 296, $0,0036 Haiku (cennik projektu).

**Poprawka po pomiarze:** ostatnie zdanie notatek kazało czytać małe zakresy „z”
`mcp__…__guide` — narzędzia nie da się czytać `Read`; dla konektora zdanie wskazuje teraz plik
kopii (`readFrom`, test w `register.test.ts`).

**Nie zmierzone na żywo:** karty panelu przekazań nie kliknął człowiek (L-0289) — panel otwiera
komenda `/relai-input-router pane` wpisana przez człowieka; przyciski „Notes”, „Full result”,
„Connectors” sprawdzone tylko w `plugin test` (montaż i `press`). Ścieżka `trim`/`cut` (JSON
z pustymi polami) — żaden konektor tej sesji nie zwrócił dużego JSON-a; tylko testy.
