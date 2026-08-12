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

> **Aktualizacja 2026-08-12 (E5).** Sekcja 1 (Cursor) została **przemierzona na działającej
> instalacji**: Cursor 3.7.12 (build `b887a26c`, `product.json`) oraz CLI `cursor-agent`
> 2026.08.11-e8db854, Windows 11, konto na planie darmowym (model `auto`). Źródła oznaczam trzema
> etykietami: **[próba]** — zachowanie zmierzone realną sesją agenta; **[kod produktu]** — odczyt
> z wydanego build'u Cursora (walidatory i schematy hooków, ścieżki reguł i komend);
> **[dokumentacja]** — strona producenta. Sekcja 2 (Codex) pozostaje bez zmian, na dokumentacji —
> jej próba należy do E7.

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

**Potwierdzone próbą (2026-08-12).** Reguła `.mdc` z `alwaysApply: true` położona w
`.cursor/rules/` zadziałała w świeżej sesji CLI bez żadnego wyzwalacza: agent wykonał jej
instrukcję w pierwszej linii odpowiedzi, także wtedy, gdy prompt jej nie dotyczył. Adapter E5
dzieli treść na **trzy** reguły (rdzeń, planowanie, guardraile) właśnie z powodu limitu 500 linii.

**`CLAUDE.md` jako reguła — jest, ale za przełącznikiem.** Build traktuje `/CLAUDE.md`
i `/CLAUDE.local.md` jak regułę zawsze-w-kontekście dopiero przy włączonym
`thirdPartyExtensibilityEnabled` (domyślnie **true**) **i** ustawieniu `claudeMdEnabled`
(domyślnie **false**) — **[kod produktu]**. Dlatego adapter nie liczy na `CLAUDE.md` i kładzie
własne reguły `.mdc`; `AGENTS.md` jest czytany bez żadnego przełącznika.

### 1.2 Komendy — są, ale ich ścieżek nie potwierdza dokumentacja producenta

| Co | Stan faktyczny | Źródło |
|---|---|---|
| Istnienie | dokumentacja Cursora wymienia „slash commands: Both user-level and workspace-level commands" jako materiał wejściowy migracji `/migrate-to-skills` | [cursor.com/docs/agent/chat/commands](https://cursor.com/docs/agent/chat/commands), 2026-08-12 |
| Wywołanie | skille wywoływane notacją `/nazwa` | jw. |
| Lokalizacja plików komend | `.cursor/commands/*.md` w projekcie i `~/.cursor/commands/*.md` globalnie; **nazwa pliku = nazwa komendy** | **[próba] 2026-08-12** — plik `.cursor/commands/relai-probe.md` wywołany jako `/relai-probe` wykonał swoją treść; potwierdza to **[kod produktu]**: `getCommandTargetDirectory` zwraca `userHome/.cursor/commands`, a edytor podstawia placeholder dla plików `.cursor/commands/*.md` |
| Komendy z `.claude/` | Cursor czyta **także** `.claude/commands/*.md` i wywołuje je tak samo | **[próba] 2026-08-12** (`/relai-cc-probe` z `.claude/commands/`) + **[kod produktu]** (`isClaudeCommand`, prefiks `/.claude/commands/`) |
| Skille | `.cursor/skills/<nazwa>/SKILL.md`; rozpoznawane są też `.cursor/plugins/`, `.claude/skills/`, `.claude/plugins/`, `.codex/skills/`, `.agents/skills/` | **[próba] 2026-08-12** (skill wywołany z nazwy wykonał instrukcję, oba warianty: `.cursor/` i `.claude/`) + **[kod produktu]** (lista prefiksów ścieżek skilli) |
| Kierunek rozwoju | producent przenosi komendy w stronę **skilli** (istnieje `/migrate-to-skills`) | **[dokumentacja]** |

**Co to znaczy dla RelAI.** Rozstrzygnięcie E5: adapter Cursora **nie pisze komend drugi raz**.
Instalator kopiuje dziesięć plików komend i dwa skille z adaptera Claude Code do `.cursor/`
w projekcie — jedno źródło w repozytorium, kopia w projekcie. Zmierzone: komenda `/relai-help`
wykonała w Cursorze swoją procedurę, ze specyfikacjami czytanymi z `.claude/relai/templates/`,
i zatrzymała się na pytaniu do człowieka.

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
`session-context`.

### 1.3a Hooki — co zmierzono w E5 (2026-08-12)

| Pytanie z E4 | Odpowiedź | Źródło |
|---|---|---|
| Czy `preToolUse` niesie **treść** zapisu? | **Tak.** Payload ma `tool_name: "Write"` i `tool_input: { file_path, content }` — czyli dokładnie to, co skanuje rdzeń. Nazwy narzędzi są te same co w Claude Code (`Read`, `Write`) | **[próba]** przechwycony payload; **[kod produktu]**: `PreToolUseRequestQuery` z polem `tool_input` typu Struct |
| Czy blokada działa? | **Tak.** `{"permission":"deny","user_message":"…"}` zatrzymało zapis: plik z kluczem `AKIA…` nie powstał, a agent powtórzył powód. Ta sama próba bez sekretu przeszła bez słowa (dowód negatywny) | **[próba]** |
| Czy `sessionStart` wstrzykuje kontekst? | **Tak.** `{"continue":true,"additional_context":"…"}` realnie dociera do modelu — agent zacytował token wstrzyknięty przez hook. Pola przyjmowane przez walidator: `env`, `additional_context`, `continue`, `user_message` | **[próba]** + **[kod produktu]** (`sessionStartResponse`) |
| Czy jest odpowiednik `permissionDecision: ask` przy zapisie pliku? | **Schemat go przyjmuje** (`permission` ∈ `allow`/`deny`/`ask`), ale dokumentacja mówi wprost, że dla `preToolUse` `ask` **nie jest dziś egzekwowane**. Nie zmierzono go próbą — traktujemy jako **niedostępne** | **[kod produktu]** (`preToolUseResponse`) + **[dokumentacja]** |
| Co się dzieje, gdy hook jest zepsuty? | **Dwa różne zachowania.** Hook, który się uruchomił i zwrócił nieprawidłową odpowiedź → narzędzie **zablokowane** z komunikatem (fail-closed). Hook, którego **nie da się uruchomić** (brak interpretera w `PATH`) → Cursor **milczy i przepuszcza zapis** | **[próba]** obie ścieżki |
| Payload na stdin | Na Windows przychodzi **z BOM** (w pomiarze podwójnym) — `JSON.parse` bez zdjęcia BOM wysypuje się na pierwszym znaku. Pola `cwd` w payloadzie `preToolUse` **nie ma**; katalog roboczy jest w `workspace_roots[]` | **[próba]** |
| Zdarzenia | Pełna lista w build'zie: 21 pozycji, m.in. `preToolUse`, `postToolUse`, `postToolUseFailure`, `workspaceOpen`. Blokować mogą: `beforeShellExecution`, `beforeMCPExecution`, `beforeReadFile`, `beforeTabFileRead`, `subagentStart`, `preToolUse` | **[kod produktu]** |
| Zgodność z Claude Code | Build zawiera warstwę zgodności: mapowanie zdarzeń (`PreToolUse`→`preToolUse`, `UserPromptSubmit`→`beforeSubmitPrompt`, …), tłumaczenie `hookSpecificOutput.permissionDecision` na `permission` **za bramką eksperymentu** `enable_cc_nested_hook_output_normalization`, czytanie `.claude/settings.json` jako źródła hooków przez CLI, ustawianie `CLAUDE_PLUGIN_ROOT` | **[kod produktu]** |

**Wniosek dla adaptera:** hooki Cursora piszemy w **natywnym kształcie** (`permission`,
`additional_context`), a nie w kształcie Claude Code — zgodność istnieje, ale stoi za bramką
eksperymentu, której użytkownik nie kontroluje. Dwie rzeczy, których nie da się obejść z naszej
strony: brak egzekwowanego `ask` i cicha degradacja przy braku interpretera.

### 1.4 Dostęp do plików

`beforeReadFile` z werdyktem `allow | deny` dowodzi, że odczyty plików przechodzą przez warstwę
hooków ([cursor.com/docs/hooks](https://cursor.com/docs/hooks), 2026-08-12).

**Czy agent czyta pliki spoza katalogu roboczego — tak** (**[próba]** 2026-08-12): agent poproszony
o odczyt `C:\Users\Lukasz\Desktop\RelAI\core\MANIFEST.json` z projektu leżącego w zupełnie innym
miejscu podał poprawną wartość pola `version`. Pomiar wykonano w CLI (`cursor-agent -p`, workspace
w katalogu tymczasowym); w aplikacji nie sprawdzano, a `--add-dir` istnieje jako jawny mechanizm
dokładania korzeni.

**Co z tego wynika dla R8.** Mimo że odczyt spoza katalogu roboczego działa, adapter i tak
**kopiuje specyfikacje do projektu** (`.claude/relai/templates/`, hook `sessionStart` oraz
instalator). Powód jest procesowy, nie techniczny: L-0010 mówi, że mechanizm nie może zakładać
dostępu poza katalogiem roboczym, a komendy i skille współdzielone z adapterem Claude Code mówią
o jednej ścieżce cache. Zmierzone: 30 plików w projekcie po instalacji, komenda `/relai-help`
czytała specyfikację właśnie stamtąd.

### 1.5 Ustrukturyzowane pytanie do człowieka

Protokół narzędzi Cursora **zawiera** `ask_question` (pola `ask_question_params` /
`ask_question_result` w definicjach protokołu agenta — **[kod produktu]**), ale sesja CLI zapytana
wprost odpowiedziała, że nie ma osobnego narzędzia do zadawania pytań i pyta zwykłym tekstem
(**[próba]** 2026-08-12). Dla adaptera znaczy to: **odpowiednika `AskUserQuestion` nie ma** —
procedury pytają tekstem (ponumerowane opcje, rekomendacja pierwsza) i zatrzymują się.

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

## 3. Tabela gwarancji

Stan po **E5** (adapter Cursora, 1.5.0). Kolumna „Cursor" mówi jedno z trzech: **działa tak samo**,
**działa inaczej** (z opisem różnicy), **nie ma** (z powodem). Kolumna „Codex" jest wciąż
z dokumentacji — jej próba należy do E7.

### 3.1 Mechanizmy

| Gwarancja RelAI | Claude Code | Cursor (po E5) | Codex |
|---|---|---|---|
| Reguła zawsze w kontekście | `CLAUDE.md` projektu | **działa tak samo** — `.cursor/rules/relai-*.mdc`, `alwaysApply: true` (zmierzone). Różnica: limit 500 linii na regułę, więc treść jest w trzech plikach | `AGENTS.md` (limit 32 KiB) |
| Kontekst na starcie sesji | hook `SessionStart` | **działa tak samo** — `sessionStart` + `additional_context` (zmierzone). Różnica: nie działa w agentach chmurowych; brak pola `cwd` (katalog z `workspace_roots`) | hook `SessionStart` |
| Twarda blokada zapisu sekretu | hook `PreToolUse` + `deny` | **działa tak samo** — `preToolUse` + `permission: deny`, payload niesie `tool_input.content` (zmierzone: zapis klucza zablokowany, czysta treść przeszła) | `PreToolUse` + `permissionDecision: deny` (do potwierdzenia: które narzędzia) |
| Guardrail nie znika po cichu | brak interpretera = brak hooka, ale plugin jest instalowany razem z runtime'em | **działa inaczej.** Samo narzędzie **milczy i przepuszcza zapis**, gdy polecenia hooka nie da się uruchomić (zmierzone). Adapter obchodzi to opakowaniem powłoki: bez Node.js kończy się kodem 2, czyli blokadą **każdego** zapisu z komunikatem (zmierzone). Świadoma rezygnacja: instalacja z `--bez-skanu` | nie sprawdzone |
| **git pre-commit ze skanem sekretów** | **działa (E4, 1.4.0)** | **działa tak samo** — mieszka w repozytorium, nie w narzędziu | **działa** |
| Pytanie o zgodę przy zmianie konfiguracji | `permissionDecision: ask` (hook `config-protection`) | **nie ma** — `ask` jest w schemacie `preToolUse`, ale producent pisze, że nie jest egzekwowane. Ochronę niesie reguła, nie hook | `PermissionRequest` |
| Ustrukturyzowane pytanie do człowieka | `AskUserQuestion` | **nie ma** — protokół ma `ask_question`, ale adapter go nie dostaje; procedury pytają tekstem i zatrzymują się | do sprawdzenia w E7 |
| Specyfikacje dokumentów w sesji | hook kopiuje do `.claude/relai/templates/` | **działa tak samo** — ta sama ścieżka, hook `sessionStart` **i** instalator (30 plików, zmierzone) | do sprawdzenia w E7 |
| Skille jako nośnik procedury | `Skill` (auto-wyzwalanie zależne od modelu, R2) | **działa tak samo** — `.cursor/skills/<nazwa>/SKILL.md`, wywołanie z nazwy (zmierzone) | `.agents/skills/`, `$nazwa` |
| Reakcja na wywołanie skilla (dosypanie kontekstu) | hook `PostToolUse` na narzędziu `Skill` | **nie ma** — nie zmierzono zdarzenia niosącego nazwę wywołanego skilla; prowizjonowanie robi `sessionStart` i instalator, więc luka nie boli | nie sprawdzone |

### 3.2 Dziesięć komend

Instalator kopiuje **wszystkie dziesięć** plików komend do `.cursor/commands/`; wywołanie
`/relai-<nazwa>` działa (zmierzone na `/relai-help` i na komendzie testowej). Poniżej to, co
w treści procedury zachowuje się inaczej. **Zastrzeżenie wspólne:** zmierzono ładowanie i start
procedur, nie pełne przejście każdej z nich na żywym projekcie — to jest zakres pilotażu E6.

| Komenda | Cursor | Różnica / powód |
|---|---|---|
| `/relai-stage` | działa inaczej | karta potwierdzenia i wybór planu pytają zwykłym tekstem (brak `AskUserQuestion`); reszta procedury bez zmian |
| `/relai-branch` | działa inaczej | jak wyżej — jedno pytanie o rodzaj odnogi tekstem |
| `/relai-help` | działa tak samo | zmierzone: wykonała procedurę, przeczytała `SPEC_KOMENDY.md` z cache i zatrzymała się na pytaniu |
| `/relai-tour` | działa tak samo | czyta dokumenty projektu, niczego nie zmienia |
| `/relai-audit` | działa tak samo | raport + lista propozycji do zatwierdzenia |
| `/relai-changelog` | działa tak samo | destylat dziennika na ekran |
| `/relai-backup` | działa tak samo | wymaga narzędzia pakującego w `PATH` (jak w Claude Code); Cursor ma narzędzie powłoki |
| `/relai-handover` | działa tak samo | generuje jeden plik HTML z osadzonymi fontami |
| `/relai-adopt` | działa inaczej | backup-bramka i procedura bez zmian; pytania tekstem, a raport adopcji opisuje adapter Cursora zamiast pluginu |
| `/relai-update` | działa inaczej | w Cursorze nie ma menedżera pluginów: wersję adaptera bierze z `core/MANIFEST.json` miejsca instalacji, a aktualizacja adaptera to ponowne uruchomienie `adapters/cursor/install.js`. Sam `/relai-update` aktualizuje **dokumenty projektu**, nie pliki adaptera |

### 3.3 Praca naprzemienna

Oba narzędzia czytają i piszą te same `docs/`. Wersję struktury projektu podbija wyłącznie
`/relai-update` — samo otwarcie projektu w drugim narzędziu nie zmienia niczego. Ustawienia
globalne mieszkają w `~/.claude/relai/` niezależnie od narzędzia, a tryb gościa zadeklarowany
w jednym (`.cursor/relai.json` albo `.claude/relai.json`) obowiązuje w obu.

Jeden wniosek jest już pewny i nie czeka na eksperyment: **pre-commit jest jedyną gwarancją, która
w każdej z trzech kolumn wygląda tak samo**, bo mieszka w repozytorium, a nie w harnessie. Dlatego
powstał w E4, przed jakimkolwiek adapterem.

Drugi wniosek jest ostrzeżeniem: oba narzędzia mają blokady mocniejsze, niż zakładał plan pisany
2026-08-12 rano. Jeżeli potwierdzi je próba w E5 i E7, „jawna tabela gwarancji per narzędzie"
przestanie być listą braków, a stanie się listą różnic — i to jest lepszy wynik, niż plan
przewidywał.
