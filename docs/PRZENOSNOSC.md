# PRZENOSNOSC — co Cursor i Codex realnie dają

Rozpoznanie stanu faktycznego mechanizmów, na których staną adaptery: **E5 (Cursor)** i **E7
(Codex)**. Dokument powstał w etapie E4 planu ROZWOJ_PO_WYDANIU jako pierwszy krok, świadomie
przed wydzieleniem rdzenia — adapter budowany na założeniach o cudzym narzędziu to etap zbudowany
dwa razy (sekcja 5 planu, ryzyko P6).

**Data rozpoznania: 2026-08-12.** Każda pozycja ma źródło i datę sprawdzenia. Czego nie dało się
potwierdzić w dokumentacji producenta, stoi jako `<DO UZUPEŁNIENIA: …>` — nie jako domysł
(L-0026). Dokumentacja obu narzędzi zmienia się szybciej niż ten plan; **przed E5 i przed E7
powtórz rozpoznanie** i zaktualizuj daty.

**Czego tu nie ma:** rozpoznanie oparto na dokumentacji producentów, nie na eksperymencie na
działającej instalacji — ani Cursor, ani Codex nie były uruchomione przy pisaniu tego dokumentu.
Zachowania oznaczone jako „deklaracja producenta" wymagają potwierdzenia próbą w E5/E7, tak samo
jak zachowania RelAI mierzy się sesją, nie zapisem w specyfikacji (L-0005).

---

## 1. Cursor

### 1.1 Reguły zawsze w kontekście — jest, i to dokładnie w potrzebnym kształcie

| Co | Stan faktyczny | Źródło (sprawdzone 2026-08-12) |
|---|---|---|
| Lokalizacja | `.cursor/rules/` w repozytorium, pliki wersjonowane | [cursor.com/docs/context/rules](https://cursor.com/docs/context/rules) |
| Format | **wyłącznie `.mdc`** — „A plain `.md` file in `.cursor/rules` is ignored" | jw. |
| Metadane | frontmatter: `description`, `globs`, `alwaysApply` | jw. |
| Tryb „zawsze" | `alwaysApply: true` → „Apply to every chat session" | jw. |
| Tryb „po plikach" | `globs` → reguła dopina się, gdy pasujący plik jest w kontekście | jw. |
| Tryb „na żądanie" | brak `description` i `globs` → tylko `@`-wzmianka | jw. |
| Zagnieżdżanie | reguły można układać w podkatalogach `.cursor/rules` | jw. |
| `AGENTS.md` | wspierany jako prostsza alternatywa, w korzeniu albo w podkatalogach | jw. |
| Rozmiar | zalecenie producenta: **poniżej 500 linii** na regułę, większe dzielić | jw. |

**Co to znaczy dla RelAI.** `alwaysApply: true` jest bezpośrednim odpowiednikiem warstwy nośnej
z L-0030: rytuał startu, definicja ukończenia i sygnał odchylenia mogą zamieszkać w regule, która
wchodzi do każdej sesji bez wyzwalania czegokolwiek. Limit 500 linii jest twardszy niż nasze
dzisiejsze `CLAUDE.md` w projektach po adopcji (JiraManager: 639 linii) — reguła E3 o kierowaniu
decyzji do `DECYZJE.md` zyskuje drugie uzasadnienie.

### 1.2 Komendy — są, ale ich ścieżek nie potwierdza dokumentacja producenta

| Co | Stan faktyczny | Źródło |
|---|---|---|
| Istnienie | dokumentacja Cursora wymienia „slash commands: Both user-level and workspace-level commands" jako materiał wejściowy migracji `/migrate-to-skills` | [cursor.com/docs/agent/chat/commands](https://cursor.com/docs/agent/chat/commands), 2026-08-12 |
| Wywołanie | skille wywoływane notacją `/nazwa` | jw. |
| Lokalizacja plików komend | `<DO UZUPEŁNIENIA: strona dokumentacji Cursora opisująca ścieżki komend — próby cursor.com/docs/agent/chat/commands i /docs/agent/skills nie zawierają ich, druga zwraca 404. Źródła społecznościowe wskazują `.cursor/commands/*.md` (projekt) i `~/.cursor/commands/*.md` (globalnie), nazwa pliku = nazwa komendy — do potwierdzenia w E5 eksperymentem na instalacji>` | — |
| Kierunek rozwoju | producent przenosi komendy w stronę **skilli** (istnieje `/migrate-to-skills`) | jw. |

**Co to znaczy dla RelAI.** Dziesięć komend `/relai-*` ma w Cursorze odpowiednik, ale wybór między
„komendą" a „skillem" powinien zapaść **po** eksperymencie w E5, nie teraz. Migracja producenta
w stronę skilli sugeruje skille jako cel; sprawdzenia wymaga, czy skill Cursora daje się wywołać
wprost, tak jak nasza komenda.

### 1.3 Hooki — najmocniejsza część, z realną blokadą

| Co | Stan faktyczny | Źródło (sprawdzone 2026-08-12) |
|---|---|---|
| Konfiguracja | `<repo>/.cursor/hooks.json`, `~/.cursor/hooks.json`, warstwa enterprise (`/etc/cursor/hooks.json`, `C:\ProgramData\Cursor\hooks.json`); pierwszeństwo Enterprise → Team → Project → User | [cursor.com/docs/hooks](https://cursor.com/docs/hooks) |
| Protokół | JSON na stdin, JSON na stdout, kod wyjścia — ten sam wzorzec co w Claude Code | jw. |
| Zdarzenia agenta | 17, m.in. `sessionStart`, `sessionEnd`, `preToolUse`, `postToolUse`, `beforeShellExecution`, `afterShellExecution`, `beforeReadFile`, `afterFileEdit`, `beforeSubmitPrompt`, `stop` | jw. |
| Blokada | `preToolUse` zwraca `permission: allow \| deny`; `beforeShellExecution` i `beforeMCPExecution` dodatkowo `ask`; `beforeReadFile` — `allow \| deny`; **kod wyjścia 2 blokuje działanie** („equivalent to returning `permission: "deny"`") | jw. |
| Ograniczenie | w agentach chmurowych część zdarzeń nie działa: `sessionStart`, `sessionEnd`, `beforeMCPExecution`, `afterMCPExecution` i hooki Tab | jw. |

**Co to znaczy dla RelAI.** To zmienia ocenę ryzyka **P1**: Cursor **ma** twardą blokadę
odpowiadającą naszemu `secret-scanner` (`preToolUse` + `deny`) i ma `sessionStart` odpowiadający
`session-context`. Adapter Cursora może więc być bliższy pełnym gwarancjom, niż zakładał plan.
Trzy rzeczy do sprawdzenia próbą w E5: czy `preToolUse` niesie treść zapisu (bez niej skan sekretu
nie ma czego skanować), jak wygląda odpowiednik `permissionDecision: ask` przy zapisie pliku
(potrzebny dla `config-protection`) i czy `sessionStart` potrafi wstrzyknąć kontekst do sesji,
a nie tylko wykonać skrypt.

### 1.4 Dostęp do plików

`beforeReadFile` z werdyktem `allow | deny` dowodzi, że odczyty plików przechodzą przez warstwę
hooków ([cursor.com/docs/hooks](https://cursor.com/docs/hooks), 2026-08-12).
`<DO UZUPEŁNIENIA: czy agent Cursora czyta pliki spoza katalogu roboczego — istotne dla L-0010
i dla tego, czy adapter musi kopiować specyfikacje do projektu tak jak robi to hook
session-context w Claude Code>`

---

## 2. Codex

### 2.1 `AGENTS.md` — warstwa zawsze w kontekście, z policzalnym limitem

| Co | Stan faktyczny | Źródło (sprawdzone 2026-08-12) |
|---|---|---|
| Kolejność szukania | katalog domowy Codeksa (`~/.codex`, albo `$CODEX_HOME`), potem od korzenia repozytorium w dół do katalogu roboczego | [learn.chatgpt.com/docs/agent-configuration/agents-md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |
| Nazwy w katalogu | `AGENTS.override.md` → `AGENTS.md` → nazwy zapasowe z konfiguracji | jw. |
| Scalanie | pliki sklejane od korzenia w dół; „Files closer to your current directory override earlier guidance because they appear later in the combined prompt" | jw. |
| Limit | `project_doc_max_bytes`, domyślnie **32 KiB**; po przekroczeniu producent radzi podnieść limit albo rozbić instrukcje na katalogi | jw. |
| Kiedy czytane | „Codex reads `AGENTS.md` files before doing any work" — czyli zawsze, przed pracą | jw. |
| Konfiguracja | `~/.codex/config.toml`; `project_doc_fallback_filenames` zmienia listę nazw zapasowych | [learn.chatgpt.com/docs/config-file/config-advanced](https://learn.chatgpt.com/docs/config-file/config-advanced) |

**Co to znaczy dla RelAI.** `AGENTS.md` jest dokładnym odpowiednikiem `CLAUDE.md` projektu razem
z mechaniką dziedziczenia w podkatalogach. Limit 32 KiB jest liczbą, której w Claude Code nie
mieliśmy — dla projektu po adopcji z regułami odziedziczonymi to realna granica, a nie zalecenie.

### 2.2 Hooki — są, z blokadą na `PreToolUse`

| Co | Stan faktyczny | Źródło (sprawdzone 2026-08-12) |
|---|---|---|
| Konfiguracja | `hooks.json` albo tabele `[hooks]` w `config.toml`; lokalizacje: `~/.codex/hooks.json`, `~/.codex/config.toml`, `<repo>/.codex/hooks.json`, `<repo>/.codex/config.toml` | [learn.chatgpt.com/docs/config-file/config-advanced](https://learn.chatgpt.com/docs/config-file/config-advanced) |
| Zdarzenia | `SessionStart`, `SessionEnd`, `SubagentStart`, `SubagentStop`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `Stop` | [learn.chatgpt.com/docs/hooks](https://learn.chatgpt.com/docs/hooks) |
| Blokada | `PreToolUse` — „To deny a supported tool call, return this hook-specific shape" z `"permissionDecision": "deny"`, alternatywnie kod wyjścia `2` z powodem na stderr; `PermissionRequest` — `"behavior": "deny"`; `UserPromptSubmit` — `"decision": "block"` | jw. |
| Czego nie da się | `PostToolUse` nie cofa skutków — „it can't undo side effects from a tool that already ran" | jw. |
| Przeglądarka hooków | polecenie `/hooks` w TUI pokazuje aktywne hooki i pozwala je przełączać (od wersji 0.129.0) | `<DO UZUPEŁNIENIA: potwierdzić na stronie producenta — informacja pochodzi z wyszukiwania, nie z otwartej strony dokumentacji>` |

**Co to znaczy dla RelAI.** Założenie planu, że Codex jest narzędziem **bez blokad harnessu**
(„brak blokad harnessu opisany wprost", sekcja 5), jest **nieaktualne**: nazewnictwo
`PreToolUse` / `permissionDecision: deny` jest niemal identyczne z Claude Code. Tabela gwarancji
w E7 powinna to odzwierciedlać — ale dopiero po próbie, bo dokumentacja mówi „supported tool call"
bez listy narzędzi objętych blokadą.

### 2.3 Skille i komendy

| Co | Stan faktyczny | Źródło (sprawdzone 2026-08-12) |
|---|---|---|
| Skille — lokalizacje | `$REPO_ROOT/.agents/skills`, `$CWD/../.agents/skills`, `$HOME/.agents/skills`, `/etc/codex/skills` | [learn.chatgpt.com/docs/build-skills](https://learn.chatgpt.com/docs/build-skills) |
| Struktura | katalog z `SKILL.md` (wymagany, metadane `name` i `description`), opcjonalnie `scripts/`, `references/`, `agents/openai.yaml` | jw. |
| Wywołanie | jawnie przez `$nazwa-skilla` albo pośrednio, gdy zadanie pasuje do `description` | jw. |
| Prompty własne | pliki `.md` w `$CODEX_HOME/prompts/` (domyślnie `~/.codex/prompts/`), wywołanie `/nazwa`; **producent kieruje do skilli jako formatu autorskiego** | jw. + `<DO UZUPEŁNIENIA: strona dokumentacji opisująca custom prompts — adresy learn.chatgpt.com/docs/prompts-and-skills/custom-prompts i /docs/prompts-and-skills/skills zwracają 404; szczegóły ścieżek pochodzą z wyszukiwania>` |

**Co to znaczy dla RelAI.** Mechanizm `description` + dopasowanie do zadania to ten sam wzorzec
auto-wyzwalania, który w Claude Code okazał się zależny od modelu (R2) — czyli **P2 zostaje
wysokie**. Reguła musi jechać w `AGENTS.md`, skill może nieść co najwyżej procedurę.

### 2.4 Sandbox i dostęp do plików

`<DO UZUPEŁNIENIA: model sandboxa Codeksa (tryby zatwierdzania, dostęp do plików poza katalogiem
roboczym, dostęp sieciowy) — nie sprawdzony w tym etapie; potrzebny w E7 do rozstrzygnięcia, czy
adapter może w ogóle prowadzić dokumenty projektu bez pytania o zgodę przy każdym zapisie>`

---

## 3. Co z tego wynika dla rdzenia

| Gwarancja RelAI | Claude Code | Cursor | Codex |
|---|---|---|---|
| Reguła zawsze w kontekście | `CLAUDE.md` projektu | `.cursor/rules/*.mdc` z `alwaysApply: true` | `AGENTS.md` (limit 32 KiB) |
| Kontekst na starcie sesji | hook `SessionStart` | hook `sessionStart` (nie działa w agentach chmurowych) | hook `SessionStart` |
| Twarda blokada zapisu sekretu | hook `PreToolUse` + `deny` | `preToolUse` + `deny` (do potwierdzenia: czy niesie treść zapisu) | `PreToolUse` + `permissionDecision: deny` (do potwierdzenia: które narzędzia) |
| Blokada niezależna od narzędzia | — | — | — |
| **git pre-commit ze skanem sekretów** | **działa (E4, 1.4.0)** | **działa** | **działa** |
| Pytanie o zgodę przy zmianie konfiguracji | `permissionDecision: ask` | `beforeShellExecution` i `beforeMCPExecution` mają `ask`; `<DO UZUPEŁNIENIA: czy preToolUse też>` | `PermissionRequest` |
| Ustrukturyzowane pytanie do człowieka | `AskUserQuestion` | `<DO UZUPEŁNIENIA: odpowiednik w Cursorze>` | `<DO UZUPEŁNIENIA: odpowiednik w Codeksie>` |

Jeden wniosek jest już pewny i nie czeka na eksperyment: **pre-commit jest jedyną gwarancją, która
w każdej z trzech kolumn wygląda tak samo**, bo mieszka w repozytorium, a nie w harnessie. Dlatego
powstał w E4, przed jakimkolwiek adapterem.

Drugi wniosek jest ostrzeżeniem: oba narzędzia mają blokady mocniejsze, niż zakładał plan pisany
2026-08-12 rano. Jeżeli potwierdzi je próba w E5 i E7, „jawna tabela gwarancji per narzędzie"
przestanie być listą braków, a stanie się listą różnic — i to jest lepszy wynik, niż plan
przewidywał.
