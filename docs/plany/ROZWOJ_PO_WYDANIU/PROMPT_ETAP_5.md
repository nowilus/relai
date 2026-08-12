# PROMPT_ETAP_5 — Adapter Cursor: reguły zawsze-w-kontekście, komendy, skan sekretów, tabela gwarancji (RelAI 1.5.0)

Plan: ROZWOJ_PO_WYDANIU • Etap: **E5 z E8** • Wygenerowano: 2026-08-12 (autor: Opus, w rytuale
„Na koniec" etapu E4) • Wykonawca: **Opus** (linia metryczna `STATUS.md`: „Opus — z ustawień
projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/PRZENOSNOSC.md` | **najważniejsze wejście tego etapu** — sekcja 1 (Cursor: reguły, komendy, hooki, dostęp do plików) i sekcja 3 (tabela gwarancji). Pozycje `<DO UZUPEŁNIENIA: …>` to Twoja lista rzeczy do sprawdzenia próbą |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (P1 i P2 są ryzykami tego etapu) + ostatni wpis (E4) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (40 pozycji) |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 5 („Port: wspólny rdzeń + adaptery" — akapit o adapterze Cursora), sekcja 6 (zakres E5), sekcja 7 (P1, P2), sekcja 8 (praca naprzemienna w dwóch narzędziach, zespół bez Node.js), sekcja 10 (Aneks A — język warstw) |
| `core/README.md` | gdzie przebiega granica rdzeń/adapter i co świadomie zostało poza rdzeniem (`config-protection`, opisy procesu) — obie decyzje wracają w tym etapie |
| `core/MANIFEST.json` | rejestr adapterów — dochodzi drugi wpis; czyta go walidator |
| `adapters/claude-code/skills/relai-core/SKILL.md` | rytuał startu, definicja ukończenia, frazy sesji — treść, która w Cursorze musi pojechać w warstwie zawsze-w-kontekście |
| `adapters/claude-code/hooks/secret-scanner.js` | wzorzec cienkiej warstwy nad rdzeniem — adapter Cursora robi to samo w swoim protokole |
| `adapters/claude-code/hooks/session-context.js` | prowizjonowanie `core/templates/` do projektu (R8) — w Cursorze trzeba to rozwiązać na nowo |
| `docs/USTAWIENIA.md` | preferencje projektu, w tym język warstw adapterów (wiersz z 2026-08-12) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Architektura: wspólny rdzeń + adaptery** (sekcja 4 planu, wariant wybrany). Adapter Cursora
  **konsumuje `core/`**, nie kopiuje go. Kopia specyfikacji do adaptera to drugie źródło prawdy.
- **Język warstw** (Aneks A, `USTAWIENIA.md` 2026-08-12): warstwa czytana przez **model** (reguły
  Cursora, `AGENTS.md`) — **angielski**; warstwa czytana przez **człowieka** (instrukcja instalacji,
  README adaptera) — **polski**. Dokumenty projektów bez zmian, w języku projektu.
- **Warstwą nośną reguł jest reguła zawsze-w-kontekście, nie mechanizm wyzwalany** (L-0030,
  potwierdzone R2 i P2). W Cursorze to `.cursor/rules/*.mdc` z `alwaysApply: true`. Skill albo
  komenda może nieść **procedurę**; reguły — nigdy.
- **Rozpoznanie mechanizmów Cursora jest w `docs/PRZENOSNOSC.md`** i pochodzi z dokumentacji
  producenta, nie z próby. Zaczynasz od potwierdzenia tego, co jest tam oznaczone jako niepewne —
  nie od pisania adaptera na wiarę (ryzyko P6).
- **Tabela gwarancji jest obowiązkowa i uczciwa** (sekcja 5 planu): mówi, co w Cursorze działa tak
  samo, co inaczej i czego nie ma. Udawanie równości narzędzi jest gorsze niż jawny brak.
- **Pre-commit jest już dowieziony** (E4) i działa w Cursorze bez żadnej pracy adaptera — mieszka
  w repozytorium. W tabeli gwarancji jest wierszem „działa wszędzie", nie zadaniem tego etapu.
- **Pilotaż w firmie to E6, adapter Codexa to E7.** W tym etapie nie tworzysz ani jednego pliku
  Codexa i nie obiecujesz go w dokumentach użytkownika (L-0002).
- Wersja tego etapu: **1.5.0**. Numer żyje w `plugin.json`, `marketplace.json`,
  `core/MANIFEST.json`, obu skillach, `/relai-update`, `SPEC_KOMENDY`, `SPEC_USTAWIENIA`,
  `SPEC_RAPORT_ADOPCJI`, README i markerze tego repo — L-0008 obowiązuje.

## Stan wyjściowy — co realnie zastajesz

RelAI **1.4.0** w repozytorium (E4 zamknięty 2026-08-12 — rdzeń przenośny). Repozytorium ma od tego
etapu jawną granicę rdzeń/adapter.

**Uwaga o warunkach pracy:** E4 zmienił **układ katalogów pluginu**. Zainstalowany plugin może nadal
pokazywać starszą wersję i stary układ, dopóki człowiek nie wykona push →
`claude plugin marketplace update relai` → `claude plugin update relai@relai` → **restart
aplikacji** (L-0031). Wersję potwierdź `installed_plugins.json` (L-0020), nie pamięcią. To jest
**otwarta bramka manualna** planu — i tym razem jest ona zarazem pierwszym sprawdzianem, czy Claude
Code znajduje skille i komendy pod nowymi ścieżkami.

```
core/MANIFEST.json                 # wersja rdzenia, spis treści, rejestr adapterow (dziś jeden)
core/README.md                     # granica rdzeń/adapter, instalacja pre-commita (PL)
core/templates/                    # 20 SPEC_*.md + README + HTML_PLAN/ (przeniesione w E4 bajt w bajt)
core/guardrails/secret-scan.js     # czysta logika skanu: biblioteka + CLI, zero wiedzy o hookach
core/guardrails/pre-commit.js      # hook gita, skanuje treść z indeksu
core/guardrails/install-precommit.js  # instalacja i --uninstall
core/tools/validate-adapters.js    # spójność rdzeń↔adaptery, uruchamiany ręcznie
adapters/claude-code/skills/       # relai-core, relai-planning
adapters/claude-code/commands/     # dziesięć komend
adapters/claude-code/hooks/        # dziesięć hooków + hooks.json (ścieżki przez ${CLAUDE_PLUGIN_ROOT})
.claude-plugin/                    # plugin.json + marketplace.json, wskazują na adapters/claude-code/
docs/PRZENOSNOSC.md                # rozpoznanie Cursora i Codexa, ze źródłami i datami
docs/plany/ROZWOJ_PO_WYDANIU/      # PLAN.html (zamrożony), STATUS.md, PROMPT_ETAP_1..5, odnogi/
```

**Dwie odnogi planu są OTWARTE** i nie należą do tego etapu: `OPIS_REPO` oraz `POMIAR_ODNOG`
(dziewięć scenariuszy pomiaru świeżą sesją).

**Czego jeszcze NIE ma (to jest zakres tego etapu):**

- **potwierdzenia rozpoznania próbą** — `PRZENOSNOSC.md` ma pozycje `<DO UZUPEŁNIENIA: …>`:
  ścieżki komend Cursora, czy `preToolUse` niesie treść zapisu, czy jest odpowiednik werdyktu
  `ask` przy zapisie pliku, czy `sessionStart` potrafi wstrzyknąć kontekst, czy agent czyta pliki
  spoza katalogu roboczego, jaki jest odpowiednik `AskUserQuestion`,
- **katalogu `adapters/cursor/`** — nie istnieje ani jeden plik adaptera,
- **reguł zawsze-w-kontekście** niosących rytuał startu, definicję ukończenia, sygnał odchylenia
  i frazy sesji,
- **komend odpowiadających `/relai-*`** po stronie Cursora,
- **hooka skanu sekretów** w protokole Cursora (logika w rdzeniu już jest — brakuje cienkiej
  warstwy),
- **rozwiązania dostępu do specyfikacji** — w Claude Code robi to hook `session-context`
  kopiujący `core/templates/` do projektu; w Cursorze nie wiadomo jeszcze, czym to zastąpić (R8
  w nowym narzędziu),
- **tabeli gwarancji „co tu działa, co nie"** i **instrukcji instalacji po polsku**,
- **wpisu adaptera Cursora w `core/MANIFEST.json`** — walidator go nie zna, więc nie pilnuje.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest
   martwa. (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Zachowania skilli mierzysz **realnie** — świeżą sesją `claude -p … --output-format stream-json`
   i liczbą wywołań narzędzia `Skill`. Po zmianie skilla: push → `marketplace update` →
   `plugin update`. (L-0004, L-0020)
5. Zanim opiszesz zachowanie agenta, sprawdź, czy da się je zweryfikować z wnętrza sesji
   wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt". (L-0006)
7. Test zakazu wymaga dowodu negatywnego. (L-0007)
8. Po podbiciu wersji przepuść repo `grep`-em po starym numerze i rozstrzygnij każde
   trafienie. (L-0008)
9. Opis skilla/komendy zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. (L-0010)
11. Odesłanie do specyfikacji nie wystarcza — struktura musi być wypisana w treści. (L-0011)
12. Katalog pluginu jest dla sesji niedostępny — mechanizm czytający stamtąd wymaga zapasowej
    ścieżki (kopia `.claude/relai/templates/`). (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania; martwy link nie jest poprawny nigdy. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. (L-0014)
15. Komenda wywołana wprost nie ładuje skilla, do którego się odwołuje. (L-0015)
16. Komunikaty hooków są celowo ASCII. (L-0016)
17. Działanie hooka dowodzisz efektem, nie zdarzeniem w transkrypcie; payloady buduj Nodem. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief. (L-0019)
20. Zainstalowaną wersję potwierdzasz `installed_plugins.json`, nie `plugin details`. (L-0020)
21. Narzędzie systemowe rozstrzygające o formacie artefaktu wywołuj pełną ścieżką i sprawdzaj
    wynik, nie kod wyjścia. (L-0021)
22. W dokumencie użytkownika podajesz zmierzoną formę wywołania: `/relai:relai-<nazwa>`. (L-0022)
23. Krok sięgający poza katalog roboczy ma zapisane wyjście po odmowie dostępu. (L-0023)
24. Sesja pomiarowa `claude -p`: polskie znaki przez **stdin**, zapis wymaga `acceptEdits`. (L-0024)
25. Wartość czytana maszynowo dopasowuje się do kotwicy; nierozpoznana znaczy cisza. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów — ścieżka „pytam zamiast zmyślać"
    z formą `<DO UZUPEŁNIENIA: …>`. (L-0026)
27. Plików z polskimi znakami nie przepuszczasz przez PowerShell 5.1. (L-0027)
28. Sesja pomiarowa z narzędziami systemowymi potrzebuje `--allowedTools "Bash"`. (L-0028)
29. Komponent opcjonalny musi dać się pominąć **bez śladu** — żadnych pustych wypełniaczy. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w warstwie obecnej w kontekście każdej sesji;
    mechanizm wyzwalany dokłada procedurę. (L-0030)
31. `claude plugin update` nie działa od razu — do restartu aplikacji sesje ładują stary
    cache. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json`, niezależnie od
    konta w aplikacji — limit sprawdzasz przed pomiarem. (L-0032)
33. Sumy kontrolne plików wędrujących przez gita porównuj po normalizacji końców linii. (L-0033)
34. Próg liczbowy kalibrujesz na zmierzonych plikach realnych projektów. (L-0034)
35. Dopisek czytany maszynowo dostaje w specyfikacji zbiór akceptowanych brzmień, zanim powstanie
    mechanizm, który go czyta. (L-0035)
36. Sygnał, który ma paść **raz**, ma jednego właściciela; druga warstwa dostaje instrukcję
    milczenia. Cisza właściciela znaczy „sprawdzone i zgodne". (L-0036)
37. Scenariusz „konfiguracji nie ma" mierzysz z podstawionym katalogiem domowym. (L-0037)
38. Przeniesienie katalogu, na który wskazuje manifest cudzego narzędzia, sprawdzasz **na kopii**
    walidatorem tego manifestu — dwa przebiegi, z dowodem negatywnym — zanim ruszysz
    oryginał. (L-0038)
39. Drzewo dowolnego commita materializujesz `git worktree add --detach`, nie
    `git archive | tar`. (L-0039)
40. „Zachowanie nie zmieniło się" dowodzisz, uruchamiając obie wersje na tym samym wejściu
    w jednym przebiegu; różnice zamierzone normalizujesz jawnie w kodzie instrumentu. (L-0040)

## Zakres etapu

1. **Domknięcie rozpoznania** — `docs/PRZENOSNOSC.md`: każda pozycja `<DO UZUPEŁNIENIA: …>`
   z sekcji 1 (Cursor) i z tabeli w sekcji 3 zostaje albo **zastąpiona faktem z datą i źródłem**,
   albo **przepisana z powodem, dlaczego nadal jest niepewna**. Źródłem może być dokumentacja
   producenta **albo próba na instalacji** — próbę oznaczasz jako próbę. Zero zdań o Cursorze
   pisanych z pamięci modelu (L-0026). Sekcji 2 (Codex) w tym etapie nie ruszasz.
2. **`adapters/cursor/` — reguły zawsze-w-kontekście** (po **angielsku**, Aneks A): pliki `.mdc`
   z frontmatterem `alwaysApply: true`, niosące rytuał startu sesji, definicję ukończenia (D-44),
   sygnał odchylenia i frazy sesji. **Limit producenta: poniżej 500 linii na regułę** — treść
   dzielisz na kilka reguł zamiast puchnąć w jednej.
3. **Komendy adaptera** — odpowiedniki `/relai-*` w mechanizmie potwierdzonym w punkcie 1
   (komendy albo skille Cursora — rozstrzyga próba, nie założenie). Zestaw nie musi być pełną
   dziesiątką: dowozisz te, które w Cursorze mają sens, a resztę wymieniasz w tabeli gwarancji
   jako niedostępne, z powodem.
4. **Skan sekretów w protokole Cursora** — cienka warstwa nad `core/guardrails/secret-scan.js`,
   wzorowana na `adapters/claude-code/hooks/secret-scanner.js`: guard projektu, wyłuskanie treści
   z payloadu, tłumaczenie werdyktu na odpowiedź Cursora. **Zero kopiowania logiki skanu.** Awaria
   `require` rdzenia = cisza i kod 0, tak jak w adapterze Claude Code.
5. **Dostęp do specyfikacji** — rozstrzygnięcie, jak adapter Cursora daje sesji `core/templates/`
   (odpowiednik R8). Jeśli nie da się tego zrobić mechanizmem Cursora, zapisz to wprost jako
   ograniczenie w tabeli gwarancji zamiast wymuszać rozwiązanie.
6. **`adapters/cursor/README.md`** (po **polsku**) — instrukcja instalacji: co skopiować, dokąd,
   co się wtedy zacznie dziać. Zespół bez Node.js: warstwa dokumentowo-procesowa działa w całości,
   guardrails wymagające Node zgłaszają brak jednym zdaniem — **bez cichej degradacji** (sekcja 8
   planu).
7. **Tabela gwarancji** — `docs/PRZENOSNOSC.md`, sekcja 3, rozbudowana o kolumnę „stan po E5":
   co w Cursorze działa tak samo jak w Claude Code, co inaczej, czego nie ma. Wiersz „git
   pre-commit" jest już zamknięty (E4).
8. **`core/MANIFEST.json`** — drugi wpis w `adapters`, z listą używanych plików rdzenia. Walidator
   ma od tego etapu pilnować obu adapterów.
9. **Praca naprzemienna** (sekcja 8 planu) — jedno zdanie rozstrzygnięcia w `adapters/cursor/README.md`
   i w tabeli gwarancji: oba narzędzia czytają i piszą te same `docs/`, wersję struktury podbija
   wyłącznie `/relai-update` (albo jego odpowiednik), nigdy samo otwarcie projektu.
10. **Dokumenty użytkownika** — `README.md` (sekcja o Cursorze, po polsku),
    `core/templates/SPEC_KOMENDY.md` i `docs/KOMENDY.md` **tylko wtedy**, gdy zachowanie realnie
    działa w tej wersji (L-0002).
11. **Wersja 1.5.0** w miejscach z sekcji „Decyzje już podjęte"; `git grep -n "1\.4\.0"`
    i rozstrzygnięcie każdego trafienia (L-0008).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` → „Validation passed"; jedyne ostrzeżenie
      to znane root `CLAUDE.md` (L-0003). Dodanie `adapters/cursor/` **nie rusza** adaptera Claude
      Code.
- [ ] `node core/tools/validate-adapters.js` → kod 0 przy **dwóch** adapterach w manifeście;
      celowo zepsute odwołanie adaptera Cursora do nieistniejącego pliku rdzenia → kod 1 z nazwanym
      znaleziskiem (dowód negatywny).
- [ ] Numer 1.5.0 spójny we wszystkich miejscach z punktu 11; `git grep -n "1\.4\.0"` zwraca
      wyłącznie trafienia historyczne.
- [ ] **Adapter Claude Code niezmieniony w zachowaniu:** dziesięć hooków uruchomionych realnym
      procesem z payloadem JSON (L-0017) daje te same wyniki co przed etapem — metodą z L-0040
      (dwa drzewa, jeden przebieg, różnice zamierzone znormalizowane w instrumencie).
- [ ] **Skan sekretów w adapterze Cursora działa na rdzeniu, nie na kopii:** `git grep -n` po
      wzorcach z `core/guardrails/secret-scan.js` (np. `AKIA`, `-----BEGIN`) nie znajduje ich
      w `adapters/cursor/` — logika jest wołana, nie przepisana.
- [ ] **Skan sekretów w adapterze Cursora blokuje:** hook uruchomiony realnym procesem z payloadem
      Cursora zwraca werdykt odmowy dla treści z kluczem i **milczy** dla treści czystej (dowód
      negatywny). Payload budujesz wg formatu potwierdzonego w punkcie 1 zakresu; formatu
      nie zmyślasz.
- [ ] `docs/PRZENOSNOSC.md`: **zero** pozycji `<DO UZUPEŁNIENIA: …>` w sekcji 1 bez zapisanego
      powodu, dlaczego zostają; każda pozycja zmieniona ma datę i źródło, a pozycje z próby są
      oznaczone jako próba.
- [ ] Tabela gwarancji wymienia **wszystkie** dziesięć komend Claude Code i przy każdej mówi:
      działa / działa inaczej / nie ma — z powodem. Brak pozycji przemilczanej.
- [ ] Instrukcja instalacji przeszła **próbę na czystym katalogu**: wykonana krok po kroku daje
      działający adapter, a scenariusz „brak Node.js" kończy się komunikatem, nie cichym brakiem
      guardraila.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" (komplet czterech sekcji, podpis z członem
      użytkownika), `docs/STATE.md` nadpisany; foldery testowe poza repozytorium
      (`git status --short` bez śmieci).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E5 → ZREALIZOWANY (data), E6 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_6.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcję „Bramki
   manualne" odśwież pozycjami „Do zrobienia przez człowieka" z wpisu tego etapu (E6 to pilotaż
   w firmie — potrzebna będzie osoba z zespołu, czyli **nowa bramka**); sekcji „Odnogi"
   **nie ruszasz**, chyba że któraś została w trakcie domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (<model>) + <git config>`.
   Przejrzyj tabelę ryzyk — **P1** i **P2** dotyczą tego etapu wprost: rozstrzygnij, czy pomiar
   na realnym Cursorze zmienia ich poziom. Lekcje z etapu → `docs/LEKCJE.md` + odświeżone
   „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje o zawartości (drugi adapter), o tym, co działa, i liczby.
4. **Wygeneruj `PROMPT_ETAP_6.md`** (pilotaż Cursora w firmie) ze specyfikacji promptu etapowego:
   na bazie sekcji 6 planu (E6), tabeli gwarancji z tego etapu, realnego stanu repo i lekcji
   z tego etapu.
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi sekwencję:
   push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → restart
   aplikacji (L-0031).
