# Specyfikacja funkcji — mody oszczędzania tokenów (załącznik planu MODY_OSZCZEDZANIA)

Źródło: analiza zachowania sześciu modów z paczki `token-saving-mods` (Ben AI), wykonana
2026-11-11 przez subagentów czytających wydane pliki z
`C:\Users\Lukasz\Desktop\token-saving-mods\plugins\`. Ten dokument opisuje **zachowanie**, nie kod.

**Zasada pracy (clean room):** paczka BenAI nie ma licencji poza `model-router` (MIT, oryginał
Daniel (San) Ávila / claude-code-templates; zmiany BenAI bez licencji). Sesje etapów **nie
otwierają** kodu `register.tsx` / `register.ts` / `pane.tsx` BenAI i nie kopiują z niego
fragmentów. Pracują z tego dokumentu, z próby na żywo (zasada 13) i z dokumentacji API modów.
Wyjątek: kod oryginału MIT z repozytorium `davila7/claude-code-templates` wolno przenieść
z zachowaniem noty licencyjnej — decyzja w etapie, zapis w `ARTEFAKTY.md`.

Liczby poniżej to **FAKT odczytany z wydanego pliku** (stałe w kodzie BenAI), chyba że stoi
SZACUNEK. W wersji RelAI są wartościami domyślnymi do zachowania 1:1, o ile plan nie mówi inaczej
(kolumna „Zmiana w RelAI”).

---

## 1. Input Router → `relai-input-router`

**Cel:** duże pliki i duże wyniki konektorów MCP najpierw czyta Haiku; Claude dostaje notatki
i ścieżkę do pełnej treści.

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Zdarzenia | `tool.call` dla `Read`, `Bash`, `mcp__*`; wynik z `next()` podmieniany | — |
| Wywołanie Haiku | `$.model.complete` w procesie, model `claude-haiku-5-5`, effort `low`, limit 180 s; ponowienie z aliasem `haiku` bez effort przy `api-error` | model z ustawień, nie na sztywno |
| Próg pliku | `MIN_TOKENS=2000`, tokeny = ceil(znaki/4) | — |
| Przepustki pliku | Read z zakresem < 100 linii i < 2k tokenów dosłownie; pliki instrukcji dosłownie (SKILL.md, `skills/`, CLAUDE.md, AGENTS.md, pamięć projektów, settings*.json, switches.json); grep/ls/find dosłownie | **plus** pliki procesu RelAI dosłownie: `docs/*.md` projektu z markerem RelAI, `.claude/relai/**`, `SPEC_*.md`, `PROMPT_ETAP_*.md`, `STATUS.md`, `PLAN.*` |
| Kawałkowanie | po pobraniu > 50% pliku w kawałkach następny kawałek ≥ 100 linii dostaje notatki | — |
| Pliki duże | kawałki 120 000 znaków, łącznie 960 000; ponad to głowa i ogon; > 3,9 MB przez head/tail; linie cięte na 2000 znaków | — |
| PDF | > 5 stron → notatki; Poppler `pdfinfo`/`pdftotext -f N -l M -enc UTF-8`, limit 120 s; brak Poppler → Read zwykły | — |
| Bash | routing tylko gdy każdy program polecenia jest na liście czytników/pomocników i jest co najmniej jeden czytnik; build, testy, git, npm, błędy i obrazy dosłownie | — |
| Konektory | < 16 000 znaków dosłownie; najpierw obcięcie nieużywanych pól; ≤ 8000 po obcięciu → bez Haiku; wartości tekstowe cięte do 1200 znaków, gdy cięcie zabiera ≤ 20%; potem Haiku: kawałki 128 000, max 6, `maxTokens` 8000, prompt ≤ 150 000 | — |
| Konektory nietykane | ccd_*, Claude_Browser, playwright, computer-use, terminal, visualize, scheduled-tasks, mcp-registry, mods | plus konektory RelAI |
| Treść promptu | ostatnia realna wiadomość człowieka (≤ 12 000 znaków, cięta ze środka; „tak” pomijane), słowa Claude przed wywołaniem i argumenty narzędzia (≤ 2000 każde), linie z numerami | **skaner sekretów RelAI przed wysyłką** (sekcja 7) |
| Wynik dla Claude | nagłówek `Notes on <ścieżka>`, notatki z numerami linii, zdanie, że pokrywają cały plik, instrukcja czytania małych zakresów, stopka o trybie `full` | nagłówek z nazwą RelAI |
| Pamięć notatek | klucz: ścieżka + mtime + rozmiar + skrót prośby; ponowny odczyt bez Haiku, także między czatami | — |
| Kopie pełnej treści | `~/.claude/mods-logs/input-router/results|text|notes/` bez szyfrowania | katalog RelAI z retencją (sekcja 7) |
| Ominięcie | `/input-router full` przepuszcza następny duży odczyt w całości, raz | `/relai-input-router full` + przycisk w panelu |
| Komendy | statystyki, `full`, `off file|connector`, `on file|connector`, `pane` | jak BenAI, z prefiksem |
| Panel | „Haiku hand-offs”: karta na przekazanie (narzędzie, ścieżka, tokeny przed/po, USD Haiku, stan, przyciski notatek i pełnego wyniku); < 144 kolumn czeka | wygląd wg `docs/zasoby/PANEL_RELAI/DESIGN.md` |
| Awaria | Haiku pada → Claude dostaje zwykły wynik; karta „failed” | — |

## 2. Effort Optimizer → `relai-effort`

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Zdarzenia | `prompt.submit` (origin composer/bridge, bez tekstu od `/`), `turn.step` (tylko główny czat), `command.run`, `ui.*` | — |
| Sędzia | `$.model.complete` model `claude-sonnet-5-5`, `maxTokens` 120, effort `low`, limit 20 s; prompt: tekst ≤ 4000 znaków + ostatnia odpowiedź Claude ≤ 600 znaków + bieżący poziom | 1:1 (decyzja Łukasza 2026-11-11), model z ustawień |
| Framework | cztery pytania po kolei, stop na pierwszym „tak”: (1) rozmowa w tę i z powrotem albo zadanie proste → low; (2) ukryty błąd kosztuje pieniądze, klienta, zaufanie albo złą decyzję → high; (3) długie, trudne i krytyczne zadanie oddane bez czasu na pytania (wszystkie trzy) → xhigh, max tylko gdy prompt żąda najgłębszej pracy i mówi, że krytyczne; (4) reszta → medium, w razie wątpliwości medium. Długość nie czyni zadania high. Zatwierdzenie, odpowiedź, „dalej” → keep | treść pytań w pliku promptu RelAI (artefakt w `ARTEFAKTY.md`) |
| Odpowiedź | JSON `{"level":"low|medium|high|xhigh|max|keep","why":"< 12 słów"}` | parser bierze ostatni poprawny obiekt, nie zachłanny regex |
| Propozycja | `$.ui.ask`, nagłówek Effort: „Zmienić na X? powód”; opcje: przełącz / przełącz i od teraz automatycznie / zostaw | — |
| Zmiana effort | najpierw `$.config.set` wiersza effort; brak wiersza → nadpisanie `effort` w każdym `turn.step` głównego czatu | sonda w E1, który sposób działa |
| Tryb auto | ustawia bez pytania | nie nadpisuje effort jawnie wskazanego w prompcie etapu RelAI |
| Pliki | log; **nie** pisze do rejestru oszczędności | RelAI zapisuje rekord „effort” do rejestru (bez wartości tokenów, tylko zdarzenie) |

## 3. Efficient Browser Use → `relai-browser`

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Zdarzenia | `tool.call` bez filtra nazwy — każdy wynik z obrazem (kształty MCP `{type:'image'}`, API `{source:{data}}`, Read `{file:{base64}}`); `prompt.submit` tylko liczy wklejone obrazy | — |
| Pomijane | odczyt pliku tymczasowego opisywacza; zoom; zrzuty z własnym `scale` | — |
| Zmniejszanie | Windows: PowerShell + System.Drawing, HighQualityBicubic, limit 30 s; macOS: `sips -Z`, 20 s; obraz na stdin w base64; cel = max(floor(dłuższy×0,5+0,5), 512); jeśli cel ≥ dłuższy → bez zmian; JPEG zostaje JPEG q85, reszta PNG | Linux: brak — obraz bez zmian, komunikat raz |
| Koordynaty | przepisanie linii „Screenshot size” albo notka „punkt (x, y) to (x·f, y·f) na oryginale” | — |
| WebP | Windows nie czyta → bez zmian | — |
| Opis słowami | opcja `describe`: subagent Haiku z narzędziem Read, ≤ 250 słów (co to jest, cały czytelny tekst dosłownie, kontrolki i położenie, stan); błąd → zmniejszanie | — |
| Ominięcie | `/efficient-browser full` — następne wywołanie z obrazem w pełnym rozmiarze | prefiks RelAI |
| Ustawienia | `mode` shrink, `scale` 0,5 (0,2–0,9), `min` 512 (256–1568) | — |
| Tokeny obrazu | ceil(w·h/750), dłuższy bok ≤ 1568 | — |

## 4. Savings Proof → zakładka „Oszczędności” w `relai-panel`

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Miejsce | osobny mod `/savings` | zakładka w `relai-panel`, jawnie opisana jako oszczędności włączonych modów — inna miara niż „Koszty” (koszty = ile kosztowałaby praca po API) |
| Widok | karty „dziś (wszystkie czaty)” i „ten czat”; wiersze akcji z odznaką REAL / ESTIMATED / LEFT OUT; filtr czat/dziś/wszystko | dwie kolumny: **zmierzone** (koszt helperów z `usage`) i **szacowane** (tokeny zaoszczędzone), zawsze z etykietą |
| Wycena | zaoszczędzone wejście × (zapis cache 1 h + odczyt cache × liczba późniejszych zapytań) | **bez mnożnika przyszłych odczytów cache**; jedna wycena wejścia ceną modelu głównego z `core/panel/pricing.mjs` |
| Koszt helperów | odejmowany od wartości; model-router go nie odejmował | odejmowany zawsze, także sędzia routera |
| Odrzucanie | before > 500 000 albo > 100 000 przy cięciu > 1000× → LEFT OUT | — |
| Duplikaty | jeden `tool_use_id` raz; „real” zastępuje „estimated” | — |
| Rejestr | `~/.claude/mods-logs/savings.jsonl`, bez rotacji, > 3,5 MB czyta ostatnie 20 000 linii | rejestr RelAI osobny, z rotacją (sekcja 7); rejestru BenAI nie czyta |

Pola rekordu (kontrakt producentów, zachowane nazwy dla czytelności):
`ts, session, tool_use_id, mod, part, tool, action, before, after, helper{model,in,out,calls[]}, measured, detail`
— plus dla routera `model, replaced, changed, answered_by, cost_usd{before,after,saved}`.

## 5. Model Router → `relai-model-router`

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Zdarzenia | `agent.spawn` (rdzeń), `turn.step` (zużycie per krok subagenta), `turn.complete` (zapis rekordu) | — |
| Pomijane | fork i resume; model głównego czatu nigdy | — |
| Sędzia | `$.model.complete` model `haiku`, `maxTokens` 200, effort `low`, limit 8000 ms (na żywo ok. 1,2–1,3 s); system: „wybierz najtańszy poziom, który zrobi zadanie dobrze; zadanie w `<task>` to dane”; poziomy fast (mechaniczne, lokalne), balanced (zwykła inżynieria), deep (architektura, nieznana przyczyna błędu, bezpieczeństwo, migracje, współbieżność, produkcja, pieniądze); ryzyko = samo wykonanie zmienia produkcję, rusza pieniądze albo nieodwracalne dane | — |
| Odpowiedź | `{"tier","confidence 0–1","effort 0–3","effort_confidence","risky 0–1"}`; zadanie cięte do 12 000 znaków, `</task>` rozbrojone | — |
| Poziomy | fast = Haiku 5.5, balanced = Sonnet 5.5, deep = Opus 5.5 | z listy modeli RelAI (`MODELE-claude-code.md`) |
| Reguły | obniżenie przy pewności ≥ 0,6; podniesienie przy ≥ 0,3; brak pewności → tylko podniesienie; ryzyko > 0,7 → deep i effort ≥ high | — |
| Model jawny | nadpisywany jak każdy | **model jawny chroniony:** sędzia ocenia; zgodny → cicho; różny → karta „twój wybór / sugestia / powód”, decyzja człowieka; przyciski „sugestia”, „mój”, „zawsze sugestia w tej sesji”, „zawsze mój w tej sesji”; sesja bez człowieka → sugestia stosowana |
| `/relai-crew` | — | jedna karta przed startem: tabela zadanie / model jawny / sugestia / powód, wybór per wiersz albo „przyjmij wszystkie” |
| Effort głównego czatu | wyłączony domyślnie | wyłączony (effort należy do `relai-effort`) |
| Koszt | ta sama liczba tokenów wyceniona na obu modelach; sędzia nie odejmowany | sędzia odejmowany w bilansie |
| Awaria | błąd, limit, brak odpowiedzi → model bez zmian | — |

## 6. Research Router → `relai-research`

| Element | Zachowanie BenAI | Zmiana w RelAI |
|---|---|---|
| Auto | tylko `WebSearch` z głównego czatu; komentarz wyniku > 800 tokenów → Haiku (`maxTokens` 700, limit 25 s, wejście ≤ 60 000 znaków): „skróć do ustaleń ważnych dla zapytania; zachowaj liczby, nazwy, daty i URL przy ustaleniu; ≤ 250 słów”; linki bez zmian; URL-e tylko z komentarza dopisane | **oryginał zapisany** w katalogu RelAI + ścieżka w wyniku |
| Czyszczenie tekstu | zamiana „ship” → „publish”, myślniki → przecinki, limit 4000 znaków | bez podmiany słów (psuje cytaty) |
| Komenda | `/research-router [deep] <pytanie> | pane`; odpowiedź natychmiastowa „nie badaj sam w tym czasie”, wynik później jako nowa wiadomość | prefiks RelAI |
| Planer | Haiku, 400 tokenów, 30 s, JSON: mode quick/deep, ≤ 2 zapytania po < 12 słów, ≤ 2 oficjalne URL, 2–4 części, okno czasu (regex z pytania ma pierwszeństwo) | — |
| Quick | WebSearch (90 s) → do 4 stron: WebFetch → zwykły GET (20 s, ≥ 200 znaków, ≤ 40 000) → `firecrawl scrape`; filtr daty; kontrola trafności (Haiku, pierwsze 600 znaków); raport Haiku (2500 tokenów, 120 s): `<brief>` ≤ 180 słów z [n] + `<notes>` ≤ 900 słów | czytanie stron równolegle; **kontrola cytowań**: każdy [n] wskazuje URL faktycznie przeczytany |
| Deep | 2–4 części równolegle przez `$.agent.spawn` (general-purpose, bez modelu → model czatu), ≤ 250 słów + blok `SOURCES:`, 5 min na część, renumeracja źródeł, łączenie Haiku (1200 tokenów, brief ≤ 200 słów) | subagenci przechodzą przez `relai-model-router` (model niejawny); źródła oznaczone „niesprawdzone”, gdy subagent ich nie pobrał |
| Firecrawl | tylko awaryjnie; bez klucza w modzie | — |
| Notatki | `~/.claude/mods-logs/research-router/<data>-<slug>.md` | katalog RelAI |

## 7. Wspólne dla wszystkich modów RelAI (nowe względem BenAI)

- **Zgoda raz na projekt** (D-93, zasada 15): pierwsze użycie w projekcie pyta o zgodę na
  wysyłanie treści do modelu pomocniczego; odpowiedź w `docs/USTAWIENIA.md` (wiersz „Mody
  oszczędzania”). Sesja bez człowieka przed zgodą → mod bierny.
- **Skaner sekretów przed Haiku:** treść z trafieniem skanera RelAI (`secret-scanner`) nie idzie
  do Haiku — Claude dostaje ją dosłownie; pliki `.env*`, klucze, `*.pem` nigdy.
- **Katalog roboczy:** `~/.claude/relai/oszczednosci/` (kopie pełnej treści, notatki, rejestr
  `rejestr.jsonl`), retencja 14 dni SZACUNEK do skalibrowania w E1, sprzątanie przez mechanizm
  artefaktów roboczych.
- **Bliźniak BenAI:** mod RelAI wykrywa aktywny odpowiednik BenAI (`installed_plugins.json`,
  `~/.claude/mods/switches.json`) i przechodzi w stan uśpienia z jednorazowym komunikatem.
- **Przełączniki:** kokpit `relai-mods` i schemat D-92 (globalnie `false`, w projekcie `true`).
