# REJESTR USTALEŃ — plan PROWADZENIE_END_TO_END

Utworzony: 2026-09-24 · Źródło: trzy raporty sesji 2026-09-24 (audyt RelAI w pięciu obszarach; dopasowanie do modeli wykonawczych; Opus 5.5 i rodzina GPT-6) oraz ustalenia tej samej sesji · Plan: [PLAN.html](PLAN.html) · Status: [STATUS.md](STATUS.md)

Rejestr jest pamięcią planu dla świeżych sesji, które nie widzą rozmowy, w której powstał. Każda pozycja ma dowód: ścieżkę z numerem linii, liczbę z pomiaru albo źródło dostawcy z tabeli niżej. Kolumna **Przypisanie** jest tabelą pokrycia: etap planu albo jawne odrzucenie z powodem. Duplikaty są scalone — identyfikatory źródłowe stoją razem (`A12 + M03`).

Plik należy do planu: po akceptacji zmienia się wyłącznie tak jak plan — aneksem.

## Źródła dostawców (odczyt 2026-09-24)

| Skrót | Adres |
|---|---|
| A-BP | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| A-O55 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 |
| A-O5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 |
| A-S5 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 |
| A-F51 | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 |
| A-SK | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| A-EF | https://platform.claude.com/docs/en/build-with-claude/effort |
| CC-MC | https://code.claude.com/docs/en/model-config |
| O-PG | https://developers.openai.com/api/docs/guides/prompt-guidance |
| O-LM | https://developers.openai.com/api/docs/guides/latest-model |
| O-R | https://developers.openai.com/api/docs/guides/reasoning |
| CX-M | https://learn.chatgpt.com/docs/models |
| X-R | https://docs.x.ai/developers/model-capabilities/text/reasoning |
| C-R | https://cursor.com/docs/rules |

## Audyt RelAI w pięciu obszarach (A)

| ID | Ustalenie | Dowód | Waga | Przypisanie |
|---|---|---|---|---|
| A01 | Codex ma 3 hooki, Cursor 2, Claude Code 11 — synchronizacja dokumentów, podpis dziennika, reguły profilu i ochrona konfiguracji poza Claude Code stoją wyłącznie na pamięci modelu (ryzyko P1 otwarte). Decyzja 2026-09-24: uczciwe minimum — jawna tabela w README, bez portowania hooków. | `adapters/claude-code/hooks/` (11 skryptów), `hooks/hooks.json` (Codex: 3), `adapters/cursor/hooks/` (2); `docs/DZIENNIK.md`, ryzyko P1 | wysoka | E5 |
| A02 + A18 | Wersja w dokumentach czytanych przez ludzi rozjeżdża się z wydaniem: sekcja „Gdzie jesteśmy” w STATE.md podaje 2.2.0, baner README 2.1.4, a walidator sprawdza „5 źródeł” wersji bez README i STATE; `stateDrift()` nie porównuje wersji. | `docs/STATE.md:7`, `README.md:6`, `core/process/session-signals.js:494-527`, wynik `validate-adapters.js` z 2026-09-24 | wysoka | E1 |
| A03 | Dwie różne decyzje zamrożone mają numer D-87. | `docs/DECYZJE.md:83` i `:92` | średnia | E1 |
| A04 | Decyzje zamrożone nie nadążają za kodem: D-40 wylicza 8 hooków (jest 11), D-80 wyklucza Cursor i Codex, które są dostarczone od 2.x. Poprawka wyłącznie datowanym aneksem. | `docs/DECYZJE.md:55`, `:87` | średnia | E1 |
| A05 | Rytuał startu tego repo czyta DECYZJE.md (18,0 KB), choć specyfikacja produktu mówi, że rejestr decyzji nie jest czytany na starcie. | `CLAUDE.md:12` wobec `core/templates/SPEC_CLAUDE_MD.md:89` | średnia | E2 |
| A06 | Reguły bez mechanizmu: rytuał „Na koniec” (hook pilnuje tylko brakującego promptu), podbicie wersji artefaktu (sprawdzany tylko pierwszy artefakt), synchronizacja kopii CLAUDE.md→AGENTS.md, lekcja po korekcie. | `adapters/claude-code/hooks/session-context.js:109-114`, `profile-rules.js:170-179`, `AGENTS.md:3-4`, `docs/DECYZJE.md:22` (D-15) | średnia | E7 |
| A07 | Krok 7 rytuału w CLAUDE.md i AGENTS.md wskazuje z nazwy plan zamknięty 2026-09-05. | `CLAUDE.md:14`, `AGENTS.md:17` | niska | E1 |
| A08 | Reguła „sesja nieinteraktywna: sam raport” nie ma sygnału technicznego — kod sam to przyznaje; do opisania w ściądze jako zależna od rozpoznania przez model. | `CLAUDE.md:24`, `adapters/claude-code/hooks/session-context.js:138-142` | niska | E5 |
| A09 | Skille obu adapterów są dziś identyczne bajt w bajt, ale walidator nie sprawdza parytetu treści — rozjazd przejdzie niezauważony. | `core/tools/validate-adapters.js` (brak kontroli treści skilli); `cmp` 2026-09-24: identyczne | niska | E3 |
| A10 | Reguła głębokości rotacji: cel „część rotowalna poniżej 60% progu” dwa razy nieosiągalny (dziennik zostałby 164,8 KB przy progu 150, lekcje 53,0 KB przy 50). Decyzja człowieka 2026-09-24: cel przechodzi na wagę całkowitą pliku. | `docs/STATE.md:189-196`, `core/templates/SPEC_ARCHIWUM.md:108`, `:304` | wysoka | E2 |
| A11 | Budżet startu liczy 6 pozycji (88,2 KB) i pomija największe stałe koszty: skill `relai-core` wymuszany na pierwszym prompcie (67 027 B) i DECYZJE.md z rytuału tego repo (17 987 B). Realny start ≈ 174 KB. | `core/process/session-signals.js:940-975`; pomiar `wc -c` i wyjście hooka 2026-09-24 (FAKT) | wysoka | E2 |
| A12 + M03 | Skill `relai-core` ma 971 linii, `relai-planning` 583, przy zaleceniu dostawcy poniżej 500 i doczytywaniu na żądanie. Około 40% `relai-core` to procedury rzadkie: zamknięcie sesji ~14,6 tys. znaków, inicjalizacja ~7,7 tys., jednorazowa migracja ~3,4 tys. | `adapters/claude-code/skills/relai-core/SKILL.md`, `relai-planning/SKILL.md`; pomiar sekcji 2026-09-24; [A-SK] | wysoka | E3 |
| A13 | Sekcja „Stan otwartych ryzyk” to 24 046 B na 17 wierszy (średnio 1,4 KB na wiersz), a 8 z 17 wierszy zawiera ryzyka zamknięte. | `docs/DZIENNIK.md:3-37`; pomiar 2026-09-24 | średnia | E2 |
| A14 | Specyfikacja podaje koszt trybu ciągłego jako „+110 tokenów na turę”, pomijając komendę `/relai-prompt` (21,8 KB), odczyt reguł przez subagenta (~24 KB) i dodatkową turę zgody człowieka. | `core/templates/SPEC_USTAWIENIA.md:128`; pomiar wstrzyknięcia 327 B (2026-09-24) | średnia | E4 |
| A15 | DZIENNIK.md przekroczył własny próg rotacji. | 153 513 B przy progu 150 KB (pomiar 2026-09-24) | niska | E2 |
| A16 | Hooki są szybkie (121–257 ms), ale hook wywołania skilla powtarza ustawienia globalne już podane na starcie sesji (806 B). | pomiar czasów i wyjścia 2026-09-24; `adapters/claude-code/hooks/session-context.js:218-246` | niska | E2 |
| A17 | Automatyczne uruchomienie rytuału zależy od modelu: Sonnet i Haiku nie wołały skilla (R2), w Codeksie problem otwarty (P2), rozrzut zachowania modelu większy niż koszt mechanizmu (O4). | `docs/archiwum/ryzyka/RYZYKA_2026-09-04.md:11`, `docs/DZIENNIK.md:9` (P2), ryzyko O4 | wysoka | E3 |
| A19 | README ma 4 838 słów i 682 linie; pierwszy praktyczny krok stoi w połowie pliku. | `README.md:335-360`; `wc -w` 2026-09-24 | średnia | E5 |
| A20 + S03 | Pierwszy prompt sesji dostaje kilka dyrektyw procesowych naraz (bramka zgody, sprawa przeterminowana, budżet, rotacja, wiek listy), a od 2.3.1 tryb ciągły dokłada drugie pytanie — o model optymalizatora. | wyjście SessionStart 3 254 B + prompt-mode 832 B (pomiar 2026-09-24); `adapters/claude-code/commands/relai-prompt.md`, krok 1 | średnia | E5 |
| A21 | Dużo do zapamiętania i żargon bez objaśnień: 14 komend, 3 frazy, zachowania automatyczne; „hook” 48 razy w README; odnoga, aneks, rotacja, D-NN. | `grep -oiE` na `README.md` (2026-09-24); `docs/KOMENDY.md` | średnia | E5 |
| A22 | Pytanie o profil przy inicjalizacji podaje opcje `app` / `agent-voice` / `flow` / `prompty` bez objaśnienia w samym pytaniu. | `adapters/claude-code/skills/relai-core/SKILL.md:837-856` | niska | E5 |
| A23 | Zasoby pluginu tylko po polsku; pełne tłumaczenie EN wykluczone przez D-80. | `docs/DECYZJE.md:87` | średnia | ODRZUCONE — decyzja biznesowa (grupa docelowa), nie techniczna; w sprawach dla człowieka |
| A24 | Brak jakiejkolwiek procedury debugowania — vibe coder zostaje sam, gdy „coś nie działa”. | 0 trafień „debug” w skillach, komendach, `SPEC_PLAN.md`, `SPEC_PROMPT_ETAPU.md` (grep 2026-09-24) | wysoka | E6 |
| A25 | Nic nie sprawdza podatności zależności ani typowych błędów aplikacji webowej; ochrona sekretów działa (hook + pre-commit). | 0 trafień OWASP / `npm audit` / CVE w `core/` i `adapters/` (grep 2026-09-24) | wysoka | E6 |
| A26 | Uruchamianie testów i recenzja zmian istnieją tylko w trybie załogi; w pracy solo `quality-gate` wyłącznie ostrzega (tsc, eslint). | `adapters/claude-code/commands/relai-crew.md:86`, `:152`; `adapters/claude-code/hooks/quality-gate.js` | średnia | E7 |
| A27 + A28 | Deploy jest opisywany dopiero po pierwszym wdrożeniu, a utrzymanie ogranicza się do statycznego opisu „co może pójść nie tak”; RelAI nie prowadzi przez pierwsze wdrożenie ani nie mówi, co obserwować po nim. | `core/templates/SPEC_SRODOWISKA.md` | średnia | E6 |
| A29 | Koszty sesji i hostingu nie są w ogóle widoczne dla użytkownika. | `docs/DECYZJE.md:87` (D-80); ryzyko O4 | średnia | ODRZUCONE — telemetria kosztów pozostaje poza zakresem (D-80); plan nie buduje licznika |

## Dopasowanie do modeli wykonawczych (M)

| ID | Ustalenie | Dowód | Waga | Przypisanie |
|---|---|---|---|---|
| M01 | `/relai-prompt` wie, na jakim modelu przepisuje prompt, ale ignoruje model, który go wykona; sekcja reguł zależnych od modelu zawiera wyłącznie zakaz wpisywania nazw. | `adapters/claude-code/commands/relai-prompt.md` (krok 1), `core/prompt/REGULY.md:252-258`; [A-SK], [O-PG] | wysoka | E4 |
| M02 + M09 | Opisy skilli `relai-core` (~1 770 znaków) i `relai-planning` (~1 830) przekraczają limit 1 024 i są ucinane w liście skilli (zaobserwowane w sesji 2026-09-24); zaczynają się od „MUST BE USED” / „ALSO USE”, czyli nacisku, który nowsze modele nadinterpretują. | `adapters/claude-code/skills/relai-core/SKILL.md:3-23`, `relai-planning/SKILL.md:3-24`; [A-SK], [A-BP] | wysoka | E1 |
| M04 + O10 | Recenzent załogi dostaje polecenie „zgłaszaj tylko pewne znaleziska”; Opus 5 i Sonnet 5 wykonują to dosłownie i obniżają wykrywalność — zalecenie: wszystko z pewnością i wagą, filtr osobno. Opus 5.5 recenzuje jeszcze lepiej, więc filtr kosztuje więcej. | `adapters/claude-code/agents/relai-reviewer.md:9-10`; [A-O5], [A-S5], [A-O55] | średnia | E1 |
| M05 + O05 | Jedna reguła „po każdym kroku meldujesz” dla modeli o sprzecznych zaleceniach: Sonnet 5 — usunąć, Opus 5/5.5 — jedno zdanie zamiaru i podsumowanie, Fable 5.1 — zamawiać wprost. | `core/prompt/SZABLONY.md:59`, `core/prompt/REGULY.md:115`; [A-S5], [A-O5], [A-O55], [A-F51] | średnia | E4 |
| M06 | Rusztowania mają tekstowe nagłówki i stawiają zadanie przed długim materiałem; dla Claude zalecane są sekcje w tagach XML i materiał na początku (do 30% lepsza jakość w testach dostawcy). | `core/prompt/SZABLONY.md:29-50`, `:69-91`; [A-BP] | średnia | E4 |
| M07 | Bramki „zatrzymaj się i zapytaj” oraz limit pytań nakładają się na skłonność gpt-6-astra do pytania tam, gdzie starsze modele działały. | `core/prompt/SZABLONY.md:55-58`, `REGULY.md:46-54`; [O-PG] | średnia | E4 |
| M08 | Router Codeksa nie mówi, że jawne polecenie użytkownika ma pierwszeństwo przed skillem — a gpt-6-astra mocniej reaguje na treść skilli. | `adapters/codex/AGENTS.md:1-9`; [O-PG], [O-LM] | średnia | E4 |
| M10 + O17 | Lista modeli Codeksa ma inny format niż pozostałe (bez źródła i daty przy pozycji) i jest nieaktualna: Codex zaleca gpt-6-astra, gpt-6-sol, gpt-6-luna, a lista ma gpt-5.6-terra i gpt-5.6-luna. Odświeżenie nazw należy do człowieka w sesji Codeksa. | `adapters/codex/MODELE.md:1-9` (list-date 2026-09-05); [CX-M] | średnia | E4 |
| M11 | Kopia listy w tym projekcie ma Opus 5.5 od 2026-09-24, ale lista w pluginie nadal Opus 5 — nowe projekty dostaną starą listę. | `.claude/relai/MODELE-claude-code.md` (2026-09-24) wobec `adapters/claude-code/MODELE.md` (2026-09-04); [CC-MC] | średnia | E1 |
| M12 | Dużo list zakazów zamiast opisu pożądanego zachowania (234 negacje w `relai-core`); zakazy bezpieczeństwa zostają. | `adapters/claude-code/skills/relai-core/SKILL.md`, `core/prompt/REGULY.md:297-308`; [A-BP] | niska | E3 |
| M13 | Cursor ładuje trzy reguły `alwaysApply` (~30 KB) do każdego zapytania; reguła planowania mogłaby być dobierana na żądanie. Brak `/relai-prompt` w Cursorze pozostaje (uczciwe minimum). | `adapters/cursor/rules/*.mdc`; [C-R] | niska | E5 |
| M14 | Mechanizm dopasowania przez osobne kopie skilli i reguł dla każdej rodziny modeli. | raport „Dopasowanie do modeli”, sekcja wariantów; `adapters/codex/generate-skills.js` | średnia | ODRZUCONE — wariant W2 (warianty plików per adapter): Cursor ma pięciu dostawców w jednym narzędziu, a kopie się rozjeżdżają |
| M15 | Mechanizm dopasowania przez hook, który na starcie sesji dokleja zalecenia dla modelu sesji. | raport „Dopasowanie do modeli”, sekcja wariantów | średnia | ODRZUCONE — wariant W3 (profil modelu z hooka): brak potwierdzonego sygnału o modelu sesji w hooku i dodatkowy koszt stały startu |
| M16 | Nakładki dla modeli z listy Cursora. | [X-R] (tylko reasoning effort), strona modelu Composer 2.5 bez wytycznych | niska | ODRZUCONE — brak oficjalnych wytycznych pisania promptów dla Grok 4.6, Composer 2.5 i trybu Auto; nakładka bez źródła łamałaby zasadę dowodu |
| M17 | Miejsca, w których RelAI już stosuje wytyczne dostawców. | `core/prompt/SZABLONY.md:21-23`, `REGULY.md:16-18`, `CLAUDE.md` (sekcja niemutowalna) | niska | SPEŁNIONE — utrzymać: sekcja „Gotowe, gdy” i kontrakt dowodowy zgodne z [O-R], powód przy regułach z [A-BP], „Surgical changes” z [A-O5], wersaliki w treści rzadkie |

## Opus 5.5 i rodzina GPT-6 (O)

| ID | Ustalenie | Dowód | Waga | Przypisanie |
|---|---|---|---|---|
| O01 | Opus 5.5 domyślnie pracuje na effort `medium` (Opus 5 na `high`); dostawca zaleca ustawiać poziom jawnie. Linia metryczna promptu etapu nie mówi o `/effort`. | `core/templates/SPEC_PROMPT_ETAPU.md:43-70`; [A-EF], [CC-MC] | średnia | E4 |
| O02 + O03 | Opus 5.5 może odrzucić prompt żądający rozpisania rozumowania (`reasoning_extraction`), a polecenia „pomyśl dokładnie” warto usunąć. | `core/prompt/REGULY.md:143`, `:307`; [A-O55] | niska | SPEŁNIONE — RelAI zakazuje prośby o tok rozumowania i nie zawiera poleceń „pomyśl dokładnie”; nakładka claude utrzymuje zakaz |
| O04 | Tekst wklejony przez człowieka jest dziś danymi wyłącznie na poziomie reguły; Opus 5.5 zaleca oznaczać go tagiem `<pasted_content id="…">` z notą o poleceniach w środku. | `core/prompt/REGULY.md:148-160`; [A-O55] | wysoka | E4 |
| O06 + O07 | W pracy bez nadzoru Opus 5.5 czasem kończy turę samym meldunkiem; to nie jest dowód ukończenia. Zalecenie: lista zadań, 2–3 automatyczne kontynuacje, akapit o niechcianych zatrzymaniach tylko dla agentów autonomicznych. Dotyczy członków załogi uruchamianych przez `crew.js`. | `adapters/claude-code/commands/relai-crew.md`, `core/process/crew.js`; [A-O55] | średnia | E7 |
| O08 | Sygnał upływu czasu przyspiesza pracę zespołów agentów. | [A-O55] | niska | ODRZUCONE — sygnał czasu zmierzony przez dostawcę na zadaniach badawczych małych zespołów; załoga RelAI ma deterministyczne fale; wraca przy pomiarze |
| O09 + O11 + O12 | Reguły nakładki claude bez osobnej pracy w plikach: frontend — konkretne wzorce do unikania; Opus 5 — nie dopisywać „sprawdź ponownie”; przy wąskim zadaniu zdanie o zakresie i długość dokumentu wprost. | [A-O55], [A-O5] | niska | E4 |
| O13 | Opus 5/5.5 deleguje do subagentów chętniej niż poprzednicy; potrzebna jawna reguła, kiedy delegować, a kiedy nie. | `adapters/claude-code/commands/relai-crew.md`; [A-O5] | niska | E7 |
| O14 | Nagłówki promptu etapu używają wersalików („NIE otwieraj”, „NIE jest ukończony”) — nacisk, który nowsze modele nadinterpretują. | `core/templates/SPEC_PROMPT_ETAPU.md:86`, `:294`; [A-BP] | niska | E4 |
| O15 + O16 | Nakładka openai: cel, ograniczenia i format bez kroków pośrednich; „Gotowe, gdy” z „jak sprawdzisz”; pierwszeństwo polecenia nad skillem; dla Astry — zachęta do działania, akapity, testy znaczące. Sol i Luna nie mają własnych wytycznych — reguły Astry tylko jako hipoteza do pomiaru. | [O-R], [O-PG], [O-LM] | średnia | E4 |
| O18 | Microsoft Foundry mapuje alias `opus` na Opus 4.6 — nakładka ma czytać nazwę modelu z listy, nie z aliasu. | [CC-MC] (tabela aliasów per dostawca) | niska | E4 |
| O19 | Luki w dokumentacji dostawców. | [CX-M]; [A-O55] (meldunki opisane na poziomie API) | niska | ODRZUCONE — brak źródła: znaczenie ustawienia „Sol Light” w Codeksie i wyświetlanie meldunków Opus 5.5 w Claude Code pozostają lukami |

## Ustalone w tej sesji (S)

| ID | Ustalenie | Dowód | Waga | Przypisanie |
|---|---|---|---|---|
| S01 | Plik zgody na tryb ciągły trzyma jeden rekord — równoległa sesja nadpisała zgodę tej sesji, więc bramka pytała ponownie mimo odpowiedzi „nie”. | `.claude/relai/zgoda-promptu.json` z obcym identyfikatorem sesji (obserwacja 2026-09-24); `core/process/prompt-mode.js` | średnia | E1 |
| S02 | Wybór modelu optymalizatora w `/relai-prompt` jest w repo, ale niewydany; specyfikacja ściągi nie opisuje go jeszcze. | commit `36991a9`; `docs/ARTEFAKTY.md` (wersja 7); `core/templates/SPEC_KOMENDY.md:87-92` | średnia | E1 |
| S04 | Materiał demo osadzony w README jest nieczytelny na telefonie (treść scen 3,52–7,42 px na 375 px); przeniesiony z zamkniętego planu PIERWSI_UZYTKOWNICY. | `docs/archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md` (bramki manualne), `docs/zasoby/demo/` | średnia | E5 |

## Pokrycie

Pozycji w rejestrze: **56** (FAKT, policzone z tabel wyżej). Przypisane do etapów: **47**. Odrzucone z powodem: **9** (w tym 2 jako już spełnione). Bez przypisania: **0**.

| Etap | Pozycje |
|---|---|
| E1 | A02 + A18, A03, A04, A07, M02 + M09, M04 + O10, M11, S01, S02 |
| E2 | A05, A10, A11, A13, A15, A16 |
| E3 | A09, A12 + M03, A17, M12 |
| E4 | A14, M01, M05 + O05, M06, M07, M08, M10 + O17, O01, O04, O09 + O11 + O12, O14, O15 + O16, O18 |
| E5 | A01, A08, A19, A20 + S03, A21, A22, M13, S04 |
| E6 | A24, A25, A27 + A28 |
| E7 | A06, A26, O06 + O07, O13 |

---

RelAI (Opus 5.5) + Lukasz · 2026-09-24
