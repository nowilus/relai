# POMIAR_E10 — pomiar całego pakietu na żywo (MODY_OSZCZEDZANIA, E10)

Data: 2026-11-16 · Wykonawca: Claude Opus 5.5 w Claude Code (decyzja Łukasza 2026-11-16: cały E10
w bieżącej sesji) · Materiał i instrumenty: `.claude/relai/work/MODY_OSZCZEDZANIA/E10/`.

Każdy wiersz macierzy ma wynik, materiał (co zostało podane modowi) i dowód (rekord rejestru,
odpowiedź narzędzia, plik, zrzut). Sama nazwa wywołania nie jest dowodem. Test nie jest pomiarem.

## Środowisko

| Pole | Wartość |
|---|---|
| Claude Code | 2.1.323, Windows 11 |
| Model sesji pomiarowej | claude-opus-5-5 (sesja `302eba00…`) |
| Kopie pomiarowe (instalPath) | `~/.claude/dev-mods/302eba00-e1ad-4693-8ebd-a7ef37abcc48/`: `relai-panel` 0.22.2, `relai-cache-keeper` 0.13.1, `relai-mods` 0.3.1, `relai-browser`, `relai-input-router`, `relai-model-router`, `relai-effort`, `relai-research` 0.1.0 — kod z drzewa roboczego (z wyceną routera E10), bez testów; instrument `E10/install-dev-copies.cjs` |
| Bliźniaki BenAI w czasie pomiaru | siedem pluginów `@token-saving-mods` wyłączonych (`claude plugin disable --scope user`, zgoda Łukasza 2026-11-16) |
| Zainstalowane mody RelAI w czasie pomiaru | `relai-panel`, `relai-cache-keeper`, `relai-mods` wyłączone (user; panel i cache-keeper także local w RelAI); `relai` 3.8.0 i `relai-progress` bez zmian |
| Kopia konfiguracji przed zmianami | `E10/backup/`: `user-settings.json`, `installed_plugins.json`, `relai-settings.local.json`, `USTAWIENIA.md`, dwa magazyny `relai-cache-keeper_*` |

## Macierz specyfikacji

Statusy: `CZEKA`, `ZGODNY`, `NIEZGODNY` (z opisem), `NIE DOTYCZY` (z powodem).

| # | Mod | Wiersz specyfikacji | Status | Materiał | Dowód |
|---|---|---|---|---|---|
| 1 | effort | AC1: silnik faktycznie stosuje zmieniony effort (nie tylko payload `turn.step`) | ZGODNY | prompt Łukasza „jaki dziś dzień tygodnia?” przy `/effort medium` | transkrypt sesji `302eba00…jsonl`: odpowiedzi 11:52:00 `"effort":"medium","perTurnEffort":"medium"`, po przełączeniu 11:53:51 i 11:53:53 `"effort":"low","perTurnEffort":"low"` — pole zapisuje silnik, nie mod |
| 2 | effort | karta propozycji: przełącz / przełącz i auto / zostaw (kliknięcie człowieka) | ZGODNY | `/relai-effort` przed: „on; ask; No suggestion yet”; karta „Switch effort to low?” kliknięta przez Łukasza (przełącz) | rekord `effort-5` 11:53:49: `from medium → to low`, „Simple factual question in casual conversation.” |
| 3 | effort | tryb auto nie nadpisuje effortu z promptu etapu RelAI | ZGODNY | `/relai-effort auto`, potem „Zalecany poziom /effort: high. Krótko: ile modów oszczędzania ma plan?” (11:56) | brak nowego rekordu `relai-effort` po `effort-8` (sędzia niewołany, gałąź „Stage effort protected”); transkrypt 11:56:10 `"effort":"medium","perTurnEffort":"medium"` — poziom bazowy bez nadpisania |
| 4 | effort | rekord „effort” w rejestrze bez wartości tokenów | ZGODNY | ten sam prompt | rekord `effort-5` bez `before/after`; koszt sędziego jako helper `claude-sonnet-5-5` in 679 / out 26 (odejmowany w bilansie) |
| 5 | browser | shrink: zrzut zmniejszony, koordynaty przeliczone, rekord before/after | ZGODNY | `/relai-browser shrink` („pictures are shrunk”), zrzut example.com 12:02 | wynik narzędzia: obraz 512×384, linia „Screenshot size: 512x384 0.64-scale view; coordinate frame: 800x600”; rekord `toolu_014Vh…`: `shrink` 640 → 263, „800x600 -> 512x384” (cel = max(400, 512)); kliknięcie w „Learn more” w układzie 800×600 (394, 581) przeniosło na `https://www.iana.org/help/example-domains` |
| 6 | browser | describe: opis słowami przez Haiku, koszt helpera w rejestrze | ZGODNY (z uwagą E.3) | zrzut example.com 799×609, 12:01, po poprawce E.1; `/relai-browser`: „mode describe (claude-haiku-5-5); scale 0.5, min 512 px” | rekord `toolu_015XXq…` 12:01:22: `describe` 649 → 806 (243 słowa, 7 653 ms), helper Haiku 9 195 / 1 414; opis zawiera cały tekst dosłownie w sześciu językach, link i stan; brak rekordu `relai-input-router` dla JPEG (E.1 działa). Uwaga E.3: rekord 11:56:36 (13 988 ms) dotyczy zrzutu, którego hook silnik pominął po 10 s — Claude dostał pełny obraz, a rejestr mówi „describe” (zysk ujemny, więc bilans nie jest zawyżony) |
| 7 | browser | full: następny obraz w pełnym rozmiarze, raz | ZGODNY | `/relai-browser full` („the next picture goes through whole”), potem trzy zrzuty iana.org 12:03 | (1) zrzut z własnym `scale 0.3` (mój materiał) — pominięty zgodnie ze specyfikacją, `full` niezużyty, bez rekordu; (2) zrzut bez skali — 800×600 w całości, bez rekordu; (3) następny — znów 512×384, rekord `toolu_016HV…` `shrink` 640 → 263 |
| 8 | input-router | duży plik → notatki Haiku + ścieżka pełnej treści | ZGODNY | dziennik w scratchpadzie (poza przepustkami, L-0323), 156 linii, 9 621 znaków ≈ 2 406 tokenów, 12:04 | wynik `Read`: nagłówek „[RelAI input-router] Notes on …”, „They cover the whole text”, notatki z numerami linii (9 linii ERROR co 17. — zgodne z generatorem), ścieżka `oszczednosci/input-router/pelne/2026-11-16-21cb710b601352cf.txt` (9 622 B na dysku); rekord `toolu_01REwz…` `notes` 2 406 → 851, helper Haiku 5 693 / 3 265 |
| 9 | input-router | PDF > 5 stron → notatki | ZGODNY (z uwagą) | własny raport 8 stron (HTML → PDF przez Edge headless, 97 440 B; prywatnych PDF-ów z Pobranych nie użyto), 12:05 | nagłówek „a PDF, 8 of 8 pages, as text, 25 lines, ~4408 tokens”; rekord `toolu_01CtpxyR…` `notes` 4 408 → 885, helper Haiku 9 305 / 3 034, „PDF over 5 pages”; pełna kopia `pelne/2026-11-16-9b65af4fe8abb989.txt` 18 352 znaki, kompletna. Uwaga: każda strona to jedna linia > 2 000 znaków, linie cięte wg specyfikacji — notatki nie mają akapitów 21–22 i mówią to wprost („[line cut]”) |
| 10 | input-router | konektor MCP ≥ 16 000 znaków → obcięcie/notatki | ZGODNY | Claude Docs `guide(["topic.charts"])`, 20 578 znaków, 12:06 | nagłówek „Notes on mcp__…__guide — the result of the connector tool …, ~5145 tokens”; rekord `toolu_01S6RH…` `notes` 5 145 → 1 363 (helper Haiku); kontrola dolna: `guide(["topic.instructions","topic.editing"])` ≈ 12 700 znaków przeszło dosłownie, bez rekordu; górna: 62 951 znaków silnik zapisał do pliku przed hookiem („exceeds maximum allowed tokens”), mod nie miał czego skracać — bez rekordu |
| 11 | input-router | `/relai-input-router full` przepuszcza następny odczyt raz | ZGODNY (z uwagą) | `/relai-input-router full` („the next large read goes through whole”), potem dwa odczyty dziennika 156 linii, 12:08 | pierwszy odczyt: plik dosłownie, 156 linii, bez rekordu; drugi (z `limit 160`): znów notatki, rekord `toolu_015GHn…` `notes` 2 406 → 1 030 (nowe wywołanie Haiku 5 696 / 3 439 — inny klucz pamięci, bo zakres). Uwaga o jakości: notatki piszą „WARN, 27 total”, a tabela pod nimi ma 30 wierszy — błąd liczenia Haiku, ścieżka do pełnej treści i zakresów dosłownych zostaje |
| 12 | input-router | pamięć notatek: ponowny odczyt bez Haiku | ZGODNY | ten sam plik, drugi `Read` 4 s później | te same notatki; rekord `toolu_014t8k…` `notes-memory` 2 406 → 851, `measured: false`, bez helpera |
| 13 | input-router | sekret w treści → dosłownie, bez Haiku | ZGODNY | ten sam dziennik + linia z kluczem złożonym z części w skrypcie (L-0337), 158 linii | kontrola pozytywna `secret-scan.js` → „SEKRET … (klucz API w formacie sk-...)”, kod 1; `Read` zwrócił plik dosłownie (158 linii); brak nowego rekordu `relai-input-router`; `grep` klucza w `~/.claude/relai/oszczednosci/` — brak trafień |
| 14 | input-router | panel przekazań w wąskim panelu (< 144 kolumn), kliknięcie karty (zaległe E4) | ZGODNY funkcjonalnie; UX odrzucony przez człowieka | `/relai-input-router pane` w wąskim docku desktopu, 12:09; kliknięcia Łukasza: „Notes”, „Full result” | dwa zrzuty Łukasza: nagłówek „7 hand-offs · ~28 037 tokens kept out of the chat · helper $0.01”, przyciski „Next read whole”, „● Files on”, „● Connectors on”, karta „✓ notes · Read … ~2 406 → ~1 030 tokens · Haiku $0.0023”; Notes rozwija notatki, Full result — ścieżkę `pelne/…` i treść. Werdykt Łukasza: panel nieczytelny, za dużo szumu (ścieżki, identyfikatory), „za bardzo i tak z tego nie będę korzystał” — przebudowa poza zakresem E10, do decyzji |
| 15 | model-router | model niejawny → sugestia sędziego zastosowana | NIE DOTYCZY w tej sesji | maszyna ma `env.CLAUDE_CODE_SUBAGENT_MODEL = claude-sonnet-5-5`, więc każdy spawn bez modelu idzie ścieżką Aneksu B (wiersz 17); prompt E10 zabrania zmiany `/config` sesji pomiarowej | zmierzone na żywo w E5 (POMIAR_E5, wariant A: proste → Haiku bez karty) na kodzie bez zmian w tej ścieżce od E5 (router 103/103 testów w bramce E10) |
| 16 | model-router | model jawny różny od sugestii → karta, decyzja człowieka | ZGODNY | `Agent` z jawnym `model: opus` (zadanie: rozmiar jednego pliku), 12:14; Łukasz kliknął „Mine” | rekord `toolu_013rTx…`: `route-kept` `opus` → `opus`, „card: yours (lower: fast, confidence 0.97 ≥ 0.6); 719 ms”, sędzia Haiku 400 / 45 — wybór człowieka wygrał nad sugestią |
| 17 | model-router | domyślny model subagenta z ustawień chroniony kartą (Aneks B) | ZGODNY | `Agent` bez jawnego modelu (zadanie: policzyć linie dwóch plików), `env.CLAUDE_CODE_SUBAGENT_MODEL = claude-sonnet-5-5`, 12:12 | rekord `toolu_01XpaC…`: `route-changed` `claude-sonnet-5-5` → `haiku`, „card: suggestion (lower: fast, confidence 0.97 ≥ 0.6); 872 ms” — kartę kliknął Łukasz (sugestia), sędzia Haiku 440 / 45; po zakończeniu subagenta ten sam rekord niesie `subagent: claude-haiku-5-5 in 143 954 / out 471` (dane do wyceny różnicy) |
| 18 | model-router | `/relai-crew`: jedna karta załogi, wybór per wiersz (ponowne E6) | ZGODNY | `/relai-crew` z dwoma zadaniami tylko-do-odczytu (przebieg `CREW/2026-11-16_e10-crew`), wywiad: `relai-reviewer` na sonnet, 2 naraz; krok 5a `crew_models`; Łukasz: „przyjmij wszystkie”, potem „zaczynamy” | odpowiedź narzędzia: „crew card: accept all”, a/b → `haiku` ze znacznikami `[relai-crew KEoX5dz1/a|b]`; rekordy `crew-a`, `crew-b` 12:16:54 (sędzia raz, przy karcie, 421/45 i 425/45); spawn członków z `model: haiku` — bez drugiej karty i bez sędziego, te same rekordy 12:17:20 dostały `subagent` Haiku 40 935/489 i 40 970/577; raporty członków: 151 i 111 linii (APPROVE), `git status` bez zmian od załogi |
| 19 | research | auto: WebSearch > 800 tokenów → skrót Haiku, oryginał zapisany, ścieżka w wyniku | ZGODNY (próg); skracanie nie wystąpiło na żywo — Aneks E.4 | `/relai-research`: „on; auto; helper claude-haiku-5-5”; trzy `WebSearch` z głównego czatu (standard, dwa extended) | komentarz z transkryptu: 379, 601, 664 tokeny (`E10/websearch-sizes.cjs`); wszystkie poniżej 800 → wynik dosłownie, bez pytania o zgodę, bez rekordu w rejestrze i bez pliku oryginału — zgodnie z `register.tsx:221` (próg przed zgodą). Silnik 2.1.325 sam streszcza wynik `WebSearch`, więc auto przy obecnym silniku praktycznie się nie włącza; ścieżka powyżej progu tylko w testach modu. Decyzja Łukasza 2026-11-17: opis, próg bez zmian |
| 20 | research | quick: równoległe strony, kontrola cytowań [n] → URL przeczytany | ZGODNY (mechanika); jakość — obserwacja | `/relai-research` z pytaniem o jeden fakt (ID API Haiku 5.5) | planer Haiku sam wybrał quick (wcześniej przy pytaniach szerszych deep); rejestr: plan, 3× relevance, 1× quick, bez subagentów; jedyne źródło [1] „verified: page read”, cytaty tylko do niego. Treść słaba: przeszła tylko strona zewnętrzna z lipca 2026 (brak Haiku 5.5), oficjalnej dokumentacji mod nie przeczytał; raport uczciwie mówi, że nie potwierdza — bez zmyślenia |
| 21 | research | deep: części przez `agent.spawn` bez modelu → router (Aneks D), źródła „niesprawdzone” | ROZBIEŻNY → Aneks E.5, E.6; powtórka po poprawkach | `/relai-research` (pytanie o TTL cache), plan Haiku: deep, 3 części; Łukasz widział 3 karty routera | części 1–2 → Haiku po karcie; część 3 `route-failed` (budżet 10 s, E.5); raport: część 3 odrzucona „Invalid deep part size”, URL zdublowany [1]/[2], wszystkie źródła „page not read” mimo `WebFetch` tych stron w transkryptach subagentów, rekordy części `measured: false` (E.6) |
| 21b | research | powtórka po E.6 i E.7 | ZGODNY (E.5 na żywo osobno) | `/relai-research deep` (limity kontekstu i ceny 5.5), 4 części | 4/4 części scalone, bez „Invalid deep part size”; 7 źródeł bez duplikatów (E.6b; jedna para różni się tylko `.md` w URL), dopisek „unverified: cited by an agent, not read by the mod”; router: 3× `route-changed` → haiku, 1× `route-kept` sonnet, zużycie członków dopisane (powód „no person in the session”: po przeładowaniu kopii nie padła zwykła wiadomość) |
| 21c | model-router | E.5 na żywo: dwa równoległe spawny z jawnym `opus`, człowiek w sesji | ZGODNY | dwa `Agent` (`model: opus`, liczenie linii) w jednej wiadomości po „karty” | jedna karta; drugi spawn 07:59:19 `route-kept` opus „another card is open: yours kept” bez czekania; pierwszy 07:59:22 `route-changed` → haiku po karcie („card: suggestion”); brak komunikatu o budżecie 10 s i brak `route-failed` |
| 23b | research | identyfikacja agentów: narzędzia agentów deep (E.7) | ZGODNY | meta subagentów + `tool_use` w ich transkryptach | 4/4 `agentType: relai-research:reader`; wywołania wyłącznie WebSearch, WebFetch, ToolSearch i silnikowe `SubagentHandback` |
| 24a | wspólne | zgoda istniejąca: Research nie pyta drugi raz | ZGODNY | pierwsze użycie Research w projekcie z wierszem zgody z 2026-11-11 | brak karty zgody, badanie ruszyło |
| 22 | research | awarie: limity transportu (90 s WebSearch, 20 s / 40 000 B GET) | ZGODNY | 90 s: test `withDeadline` (`runtime.test.ts`, odrzuca spóźniony wynik, kasuje zegar); GET: argv modu (`register.tsx:125`) uruchomiony ręcznie | strona cennika → `curl` exit 63 „Exceeded the maximum allowed file size (40000)”, mod dostaje `''`; example.com → exit 0; limit czasu (z `--max-time 1` na `httpbin.org/delay/5`) → exit 28 po 1014 ms. Przekroczenia 90 s WebSearch na żywo nie wywołano |
| 23 | research | identyfikacja agentów przed narzędziami, skaner przed wynikiem | CZEKA | | |
| 24 | wspólne | zgoda raz na projekt (D-93), odmowa → mod bierny | ZGODNY | wiersz zgody usunięty z `docs/USTAWIENIA.md` (kopia w `E10/backup`), zwykła wiadomość → karta zgody (Effort), Łukasz: odmowa; potem przeładowanie kopii | zapisany jeden wiersz „brak zgody”; spawn subagenta: 0 wywołań sędziego, brak karty, brak rekordu routera; `/relai-research`: „passive or question held back; no research sent”. Wiersz zgody przywrócony z kopii. Uwaga pomiarowa: pierwsza próba bez przeładowania routera (skrypt pomija niezmienione pliki) — router działał na zgodzie wczytanej przy starcie; w realnym użyciu wiersz nie znika w trakcie sesji |
| 25 | wspólne | bliźniak BenAI aktywny → uśpienie z jednym komunikatem | ZGODNY | `model-router@token-saving-mods: true` w `~/.claude/settings.json` na czas próby, przeładowanie kopii routera, dwa spawny po kolei | jeden toast „relai-model-router sleeps: the BenAI model-router mod is on” (Łukasz: „tak, jeden”); 0 kart, 0 rekordów routera (ostatni nadal 08:27:05Z); bliźniak wyłączony zaraz potem, kopia przeładowana. Uboczne: oba subagenty bez routera (model domyślny) liczyły `savings-view.mjs` jako 134 linie przy rzeczywistych 151 — wcześniejsze 134 na Haiku nie jest więc skutkiem routingu |
| 26 | cache-keeper | migracja wariantu A: stara wartość → migracja → `/config` → przeładowanie | CZEKA | | |
| 27 | panel | zakładka „Oszczędności” = rejestr co do tokena; router wyceniony | ZGODNY (po Aneksie E.8) | zrzut Łukasza, filtr „Ten czat”, wobec `E10/expected-tab.mjs` (te same funkcje rdzenia, cennik projektu) | 68 rekordów, 29 083 tokeny, helpery 53 wywołania / 112 917 wej. / 30 180 wyj. / $0.05 (0,0505), szacowane ~$0.12 (0,1163), router 13 zmian — 12 bez ceny, „Bilans: brak”; 13 wierszy modów zgodnych co do tokena. Rekord po E.8 z podziałem cache (in 4, cacheRead 67 246, cacheWrite 76 807) wyceniony na $0,15; 12 starszych bez podziału — bez ceny. Obserwacja LOW: przy rekordzie bez podziału cache tekst „bez ceny w cenniku” myli przyczynę |

## Obserwacje poza wierszami

- **Effort, 11:54 (`/relai-effort auto`):** materiał „Kontrola modelu: effort high. …” nie pasuje do
  wzorców `stageEffort` (brzmienie „Zalecany poziom /effort: X” albo nagłówek „Plan: … Wykonawca: …
  — effort X”) — błąd materiału, nie modu; wiersz 3 powtórzony. Sędzia odpowiedział, parser odrzucił
  werdykt („judge reason missing or too long”), mod zostawił poziom: transkrypt 11:54:55 `medium`.
  Rekord `effort-8` niesie `from: low` — to poziom nadpisany w poprzedniej turze, nie bazowy
  (`/effort medium`); pole `from` po turze z nadpisaniem jest nieścisłe (LOW, do decyzji).

- **Browser + Input Router, 11:56 (zrzut example.com w przeglądarce wbudowanej, tryb `describe`
  zastany w magazynie kopii z E2):** pierwszy zrzut 799×609 — hook `tool.call` Browsera pominięty
  przez silnik („ran past its 10s budget”), obraz przeszedł bez zmian. Drugi zrzut 800×600 —
  rekord `describe` 649 → 674 (opis dłuższy niż obraz), helper Haiku 16 247 / 1 314. Subagent opisu
  czytał JPEG zrzutu, a `relai-input-router` przechwycił `Read` jak tekst: rekordy `notes`
  8 580 → 457 (helper 23 381 / 779) i `notes-memory` — fałszywa oszczędność, opis pusty.
  Usterka HIGH → Aneks E.1 (obrazy przepuszczane), budżet 10 s → Aneks E.3. Wiersze 5–6 powtórzone
  po poprawce.

- **Input Router — kontekst prośby:** po odpowiedzi człowieka „gotowe” notatki piszą „The task field
  reads only "gotowe"” i nie wiedzą, po co jest plik. Specyfikacja pomija samo „tak”, nie „gotowe”
  (LOW, do decyzji — lista `isBareYes`).

## Bilans

Stan rejestru 2026-11-17 ok. 08:48Z, sesja pomiarowa E10 (filtr „Ten czat”), cennik projektu,
model sesji `claude-opus-5-5` (wejście $4/MTok). Liczby z `E10/expected-tab.mjs`, czyli z tych
samych funkcji rdzenia co panel; zakładka zgodna co do tokena (wiersz 27).

| Pozycja | Wartość | Skąd |
|---|---|---|
| Tokeny, których Claude nie przeczytał | 29 083 (Input Router 28 511, Browser 572 netto) | `before − after` rekordów liczonych |
| Szacowana wartość | ~$0,116 | 29 083 × $4/MTok, bez mnożnika przyszłych odczytów cache |
| Koszt helperów (zmierzony) | $0,0505 — 53 wywołania, 112 917 wej. / 30 180 wyj. | usage Haiku 5.5 z rekordów, także pominiętych |
| Bilans bez routera | ~+$0,066 | szacowane − helpery |
| Router — różnica modeli | 13 zmian; 1 wyceniona po E.8: **+$0,150** (Sonnet → Haiku, 4 wej. + 67 246 odczytu + 76 807 zapisu cache, 409 wyj.); 12 bez podziału cache → bez ceny | `subagent` rekordu, stawki cache z cennika |
| Bilans w zakładce | „brak” — dopóki w filtrze są rekordy routera sprzed E.8 | reguła R6: bez ceny nie liczę |

**Mianowniki i wnioski:**

- Input Router dał prawie cały zysk tokenowy (notatki zamiast pełnych plików); jego helpery
  kosztowały mniej niż połowę szacowanej wartości. Browser `describe` ma bilans ujemny
  (−182 tokeny), `shrink` dodatni.
- Router to największa pozycja kwotowo: jedna zmiana Sonnet → Haiku dla subagenta z ~144 tys.
  tokenów kontekstu (głównie cache) to ~$0,15 przy koszcie sędziego ~$0,0001. Wcześniejsze ~$3,79
  było artefaktem wyceny cache po cenie wejścia (Aneks E.8).
- Effort, Research (deep/quick/plan) i karty nie deklarują oszczędności tokenowych — w rejestrze
  mają 0 tokenów i tylko koszt helperów (Research deep: zużycie członków liczy router).
- Jakość tańszego modelu: przy liczeniu linii pliku pomylili się subagenci i na Haiku, i na modelu
  domyślnym (134/151, 101/111) — błąd zadania, nie routingu; Research quick oparł się na stronie
  zewnętrznej i uczciwie nie potwierdził faktu (wiersz 20).
- Pełny bilans kwotowy w zakładce pojawi się dla danych zebranych po wydaniu (rekordy z podziałem
  cache); wiersz 26 (Cache Keeper) — po wydaniu na świeżej instalacji.
