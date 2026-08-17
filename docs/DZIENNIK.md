# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Scope creep jak w vibe-forge (GUI, enterprise-szablony) | Wysoki | **ZAMKNIĘTE 2026-08-10 (E10)** | D-80: twarda lista „poza v1"; każdy pomysł spoza listy → DZIENNIK „świadomie odłożone". **2026-08-08 (E8):** etap o profilach był naturalnym miejscem rozrostu i nie urósł — lista czterech profili została zamknięta, żadna nowa komenda nie doszła, `quality-gate` i `auto-format` **nie** dostały warunku profilowego (obecność `tsc`/Prettiera jest warunkiem mocniejszym niż wpis w ustawieniach), a profil `prompty` skończył się na jednym rejestrze, tak jak mówi PLAN. Zapis „profile dokładają najwyżej jedno pytanie na zdarzenie" jest twardą granicą wpisaną do `SPEC_PROFILE.md` **2026-08-10 (E10):** wersja 1.0.0 wydana **bez ani jednej pozycji spoza D-80** — zero GUI, zero telemetrii, zero wsparcia dla innych narzędzi, dziewięć komend (tyle, ile zaplanowano w E7 i E9), cztery profile. Pilotaż ujawnił trzy defekty i wszystkie trzy naprawiono **w istniejących plikach**, bez dokładania nowego bytu: symulator przeniesiony między plikami szablonu, linia w `CLAUDE.md`, kolejność w hooku. Ryzyko zamknięte wraz z domknięciem zakresu v1; przy pracach po 1.0.0 wraca jako ryzyko nowego planu, nie tego. |
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski przy Opusie, średni przy modelach słabszych** (2026-08-10 po E10) | **ZMIERZONE 2026-08-10, OTWARTE ŚWIADOMIE** | Podwójna warstwa: opisy skilli + reguły w projektowym CLAUDE.md zawsze w kontekście; testy fraz w pilotażu. **2026-08-07 (E1):** `relai-core` zainstalowany i widoczny w inwentarzu pluginu, ale samo auto-wyzwolenie w świeżej sesji NIEZWERYFIKOWANE. **2026-08-07 (E2):** test NIEWYKONANY — plugin odinstalowany na czas budowy na polecenie użytkownika (L-0004), więc skill nie miał prawa się wyzwolić; pomiar przeniesiony do pilotażu E10, po docelowej instalacji. Ryzyko pozostaje OTWARTE i niezmierzone przez dwa etapy (L-0005). **2026-08-07 (E3):** nadal niezmierzone — doszedł drugi skill (`relai-planning`) wyzwalany frazą, więc zakres ryzyka wzrósł. **2026-08-07 (pomiar, na wniosek użytkownika):** plugin zainstalowany, sześć świeżych sesji `claude -p`. Wersja 0.3.0: 1/4 trafień — brak wyzwolenia na prompcie naturalnym i na „przygotuj plan…", z realnym rozjazdem konwencji. Po poprawce opisów (0.3.1): 2/2 trafienia. Ryzyko zostaje otwarte: próba mała, `-p` blokuje `AskUserQuestion`, a wynik zależy od inwentarza skilli na maszynie. Kontrola ponowna w E10 (wiersz E10 w `STATUS.md`). **2026-08-07 (E5):** hook `session-context` (SessionStart) wstrzykuje rytuał startu, datę dnia i siatkę promptów niezależnie od skilli — zmierzone 2/2 na neutralnym prompcie przy **zerze** wywołań `Skill`. Poziom obniżony do niskiego; do potwierdzenia w sesji interaktywnej w E10. **2026-08-08 (E8):** reguły warunkowe profilu zaprojektowane tak, żeby skill **nie był** warstwą nośną — regułę niesie sekcja w `CLAUDE.md` projektu (w kontekście każdej sesji bez wyzwalania), zdarzenie wykrywa hook, skill dokłada procedurę. Zmierzone: bramka snapshotu zatrzymała zapis w projekcie `flow` z **usuniętą** sekcją reguł w `CLAUDE.md` (sesja napisała wprost „bramka snapshotu i tak zablokowała zapis"), a kopia w `docs/snapshoty/` ma sumę kontrolną stanu sprzed zmiany **2026-08-10 (E10) — pomiar interaktywny, siedemnaście sesji prowadzonych przez człowieka:** wynik zależy od modelu i to jest trwała własność, nie usterka do naprawienia. **Opus:** skill wyzwala się sam, procedura wykonuje się w całości (sygnał D-27 przed akapitem „gdzie jesteśmy", propozycja, zatrzymanie na zgodzie). **Sonnet 4.6 i Haiku 4.5:** ani jedno wywołanie `Skill` na promptach naturalnych; rytuał, datę i sygnały niesie hook `session-context`, więc projekt nie traci pamięci, ale procedura bywa niepełna. Inicjalizacja w pustym folderze wyzwoliła skill 3/3 niezależnie od modelu. Dwie poprawki z tego pomiaru: frazy sesji przeniesione do `CLAUDE.md` projektu (L-0030) i sygnały „ZADANIE PIERWSZE" przed instrukcją rytuału w hooku — po nich Sonnet zgłasza sygnał D-27 zawsze (przedtem: raz wcale, raz w środku akapitu z błędną propozycją). Ryzyko zostaje otwarte świadomie: warstwą nośną jest hook i `CLAUDE.md`, skill jest warstwą procedury. **2026-08-12 (E1):** doszła dziesiąta komenda (`/relai-branch`) i sygnał odchylenia, a regułę sygnału niesie `CLAUDE.md` projektu zgodnie z L-0030 — ale **zakres ryzyka wzrósł bez pomiaru**: limit konta na CLI (L-0032) uniemożliwił sesje pomiarowe, więc o zachowaniu nowej komendy w świeżej sesji nie wiadomo nic. Pomiar czterech scenariuszy czeka w odnodze `POMIAR_ODNOG` planu ROZWOJ_PO_WYDANIU. **2026-08-12 (E3):** dwa nowe zachowania (sygnał rozjazdu stanu, kontrola podpisu wpisu) świadomie **nie** oparto na skillu — niesie je hook, a skill dostał instrukcję milczenia zamiast własnego detektora (L-0036). To zmniejsza powierzchnię ryzyka: obie rzeczy działają przy każdym modelu. Zmierzone procesowo (15/15 i 9/9); to, czego hook nie rozstrzyga — czy sesja nie dubluje sygnału — czeka w odnodze `POMIAR_ODNOG` (scenariusz G). |
| R3 | Adopcja uszkodzi żywy projekt użytkownika | **Niski** (2026-08-10 po E10; wcześniej średni) | **ZAMKNIĘTE 2026-08-10 (E10)** | D-70: backup+raport+recovery obowiązkowe; scenariusz akceptacyjny z pełnym testem recovery. **2026-08-08 (E7):** powstał pierwszy filar — `/relai-backup` pakuje projekt do prawdziwego ZIP-a (bsdtar, nagłówek `PK`), z twardym wykluczeniem sekretów i **weryfikacją listy wpisów archiwum** przed zgłoszeniem sukcesu; zmierzone: 22 wpisy, zero trafień na `.env`/`node_modules`. Brakuje drugiego filaru — **odtworzenia**: rozpakowanie i test „projekt wstaje" nie są jeszcze niczym opisane ani zmierzone. Do domknięcia w E9 (`/relai-adopt` z przetestowaną ścieżką recovery) i w scenariuszu akceptacyjnym E10. **2026-08-09 (E9):** drugi filar dowieziony — `/relai-adopt` z backupem-bramką (dwa dowody negatywne: niemożliwa lokalizacja i brak narzędzia pakującego → zero plików struktury) i **recovery przetestowanym naprawdę**: pełne cofnięcie wg sekcji raportu adopcji dało sumę drzewa plików bajt w bajt identyczną ze stanem sprzed (10/10 plików, agregat `1200960f…`). Poziom obniżony do średniego; zamknięcie po scenariuszu akceptacyjnym E10 na żywym JiraManagerze **2026-08-10 (E10) — scenariusz akceptacyjny na żywym projekcie (JiraManager: 22 commity, aplikacja PySide6, `CLAUDE.md` na 398 linii, sekrety pod niestandardową nazwą):** sumy kontrolne 194 plików przed i po adopcji — **zero plików zniknęło**, zmienione dokładnie dwa (`CLAUDE.md` przez scalanie, `DZIENNIK.md` przez wpis zerowy), kod bez zmian. `config.json` z tokenem Jiry i hasłem SMTP **poza archiwum** mimo nazwy spoza listy wzorców (D-42). Scalanie D-71: 6 z 8 zastanych sekcji bajt w bajt, kopia oryginału w `docs/archiwum/`. Recovery wykonane **na kopii**: 192/192 pliki bajt w bajt, `git log -1` = `b52c013` — hash z sekcji „Backup" raportu. Ryzyko zamknięte. |
| R4 | Hooki Node na Windows (ścieżki ze spacjami, kodowanie PL) | Średni | **ZAMKNIĘTE 2026-08-07 (E5)** | Osiem hooków przetestowane na ścieżce `Próba RelAI E5` (spacja + „ó"): 39/39 testów jednostkowych i siedem sesji integracyjnych bez błędów kodowania i ścieżek. Komunikaty hooków świadomie ASCII (L-0016); zero zależności npm |
| R5 | Dokumenty puchną i zjadają kontekst | Średni | **OTWARTE — do obserwacji po 1.0.0** | D-14/D-15: rotacja DZIENNIKA, kompresja LEKCJI, destylaty czytane na starcie. **2026-08-08 (E7):** doszły dwa narzędzia po stronie użytkownika — `/relai-audit` wykrywa dziennik ponad progiem 50 KB i lekcje bez destylatu (zmierzone na projekcie testowym: podał rozmiar dziennika i wskazał destylat bez lekcji źródłowej), a `/relai-changelog` daje historię bez trzymania jej w kontekście. Sam pakiet `/relai-handover` waży 201 KB przez osadzone fonty — to plik dla człowieka, nie dla kontekstu sesji, ale pytanie o podzbiór fontów z E6 zostaje otwarte **2026-08-10 (E10):** pilotaż dał pierwsze liczby z realnej pracy. Projekt „Paragony" po czterech etapach: dziennik 382 linie, `CLAUDE.md` 65 linii — mieści się. JiraManager po adopcji: dziennik 124 KB (historia sprzed RelAI), `CLAUDE.md` **434 linie** przy limicie 60, bo limit świadomie ustąpił wierności cudzych reguł (D-71). To jest realny przypadek, w którym mechanizm rotacji i kompresji będzie potrzebny, a `/relai-audit` go wykryje. Ryzyko zostaje otwarte z konkretnym adresem: pierwszy projekt po adopcji, nie hipoteza. **2026-08-12 (E2):** mechanizm powstał — automatyczna rotacja dwufazowa w rytuale zamknięcia sesji, progi i wyłącznik w `USTAWIENIA.md`, archiwum bajt w bajt z linią-odsyłaczem. Zmierzone na projektach testowych: dziennik 317 KB → 132 KB przy sumie przeniesionej treści identycznej z oryginałem, sekcje „Stan otwartych ryzyk" i „Zasady aktywne" nietknięte, przerwanie po fazie 1 zostawia żywy plik z tą samą sumą. Progi skalibrowane na **zmierzonych** dziennikach (JiraManager 348 KB, PolyFlow 223 KB) — próg lekcji zmieniony z martwych „60 lekcji" na „40 wpisów albo 50 KB" (L-0034). Poziom **na razie bez zmiany**: mechanizmu nie zmierzono w świeżej sesji (odnoga `POMIAR_ODNOG`, scenariusze E i F), a dwa projekty z realnym problemem dostaną go dopiero przez `/relai-update`. Zamknięcie po pierwszej rotacji na żywym projekcie. **2026-08-12 (E3):** zaadresowane **źródło** rozrostu, nie tylko skutek — decyzje podejmowane po adopcji idą od 1.3.0 do `DECYZJE.md`, a nie do zastanej tabeli w `CLAUDE.md`, czyli do warstwy czytanej w każdej sesji (JiraManager: 8 takich decyzji i plik na 639 liniach). Poziom **bez zmiany**: reguła istnieje w specyfikacji i w procedurze adopcji, ale ani nie zmierzono jej w świeżej sesji (odnoga `POMIAR_ODNOG`, scenariusz H), ani nie dotarła do JiraManagera — wejdzie tam przez `/relai-update`, co jest otwartą bramką manualną planu. |
| R6 | Aktualizacja pluginu nadpisze lokalne nadpisania użytkowników | Niski | **ZAMKNIĘTE 2026-08-09 (E9)** | D-72: diff + zgoda + pierwszeństwo lokalnych nadpisań; test w pilotażu. **2026-08-08 (E6):** nadpisanie lokalne umieszczone w `docs/zasoby/HTML_PLAN/` — poza cache'em `.claude/relai/`, którego dotyka hook i aktualizacja pluginu. Zmierzone: po `marketplace update` + `plugin update` + świeżej sesji dziewięć plików nadpisania ma identyczne sumy kontrolne, własny token na miejscu, token z pluginu nie wrócił; cache w tym samym czasie **został** nadpisany (dowód, że test nie jest pusty). Zostaje otwarte do E9: `/relai-update` musi pokazać diff i uszanować nadpisanie. **2026-08-09 (E9):** `/relai-update` działa i szanuje nadpisania — zmierzone na projekcie 0.7.0: trzy pliki `docs/zasoby/HTML_PLAN/` z sumami identycznymi po aktualizacji, wiersz „Szablon planu HTML" nietknięty, wiersz lokalny `KOMENDY.md` przepisany dosłownie do zregenerowanej tabeli; diff pokazany przed zapisem, odmowa zostawia projekt nietknięty (10/10 sum). Ryzyko zamknięte |
| R7 | Model wykonawczy (Sonnet/Opus) obniży jakość implementacji etapów | Średni | **ZAMKNIĘTE 2026-08-10 (E10)** | Prompty etapowe z sekcją Weryfikacja + przegląd Fable po kluczowych etapach **2026-08-10 (E10):** zmierzone na realnej pracy, nie na deklaracji. Etapy E3 i E4 projektu pilotażowego prowadził **Haiku 4.5** zgodnie z zapisem w `STATUS.md` („mechaniczne — najtańszy") i dowiózł je w całości: 30 testów, rytuał „Na koniec" wykonany, prompt następnego etapu wygenerowany, zamknięcie planu (D-36) przeprowadzone bez błędu — plan w archiwum, `Aktywny plan: brak`, zero martwych linków. Jakość implementacji **nie ucierpiała**; różnica między modelami leży gdzie indziej — w tym, czy skill wyzwala się sam (R2), a nie w tym, czy etap zostanie dowieziony. Jedyny ślad słabszego modelu w dokumentach: dwa wpisy podpisane `RelAI (Haiku)` bez członu `+ <użytkownik>`. Prompt etapowy z sekcją „Weryfikacja" okazał się wystarczającą mitygacją. |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Git pre-commit ze skanem sekretów w E4 (działa niezależnie od narzędzia); jawna tabela gwarancji per narzędzie w E5/E7; scenariusz akceptacyjny E6 zawiera próbę zapisu sekretu. **2026-08-12 (E4):** pierwsza mitygacja **dowieziona i zmierzona** — gitowy pre-commit blokuje commit z sekretem niezależnie od narzędzia (15/15, dowód negatywny na `git rev-parse HEAD` przed i po, oraz dowód, że test nie jest pusty: po deinstalacji ten sam commit przechodzi). Drugi powód obniżenia poziomu jest z rozpoznania, nie z kodu: `docs/PRZENOSNOSC.md` pokazuje, że **oba** narzędzia mają hooki potrafiące odmówić — Cursor `preToolUse` z `allow \| deny` i kodem wyjścia 2, Codex `PreToolUse` z `permissionDecision: deny` oraz `PermissionRequest`. Założenie planu „Codex bez blokad harnessu" jest nieaktualne. Ryzyko zostaje otwarte, bo rozpoznanie jest z dokumentacji, nie z próby: nie wiadomo, czy `preToolUse` Cursora niesie **treść** zapisu (bez niej nie ma czego skanować) ani które narzędzia Codeksa obejmuje „supported tool call". Zamknięcie po scenariuszu akceptacyjnym E6, który zawiera próbę zapisu sekretu. **2026-08-12 (E5) — połowa ryzyka zmierzona na żywym Cursorze:** `preToolUse` **niesie** treść zapisu (`tool_input.content`), a werdykt `permission: deny` realnie zatrzymał zapis klucza `AKIA…` przy przepuszczonej treści czystej (dowód negatywny). Wyszły natomiast dwie rzeczy, których plan nie przewidywał: (1) Cursor **nie ma egzekwowanego** odpowiednika `ask`, więc ochronę plików konfiguracyjnych niesie tam wyłącznie reguła, nie bramka — to jest dziś główny powód, dla którego poziom **zostaje średni**; (2) hook, którego nie da się uruchomić, jest ignorowany **bez słowa** — zaadresowane opakowaniem powłoki kończącym się kodem blokującym (L-0043). Zamknięcie nadal po E6. **2026-08-17 (E6) — część sekretowa Cursora zamknięta dowodem z aplikacji:** w pilotażu na aplikacji z interfejsem i modelu spoza Anthropic (Grok 4.6) obie warstwy zadziałały w ustalonej kolejności — reguła odmówiła pierwsza przy zwykłej prośbie, a przy prośbie jawnie proszącej o próbę mimo reguły zapis odbił hook `preToolUse` werdyktem `permission: deny`; plik nie powstał, w plikach śledzonych zero trafień (dowód negatywny). Ryzyko **zostaje otwarte**, ale z zawężonym powodem: (a) w Cursorze nadal nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni sama reguła, (b) Codex pozostaje niezmierzony do E7. Poziom bez zmiany: **średni** |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Wzorzec L-0030 od początku: reguły niesie warstwa zawsze-w-kontekście (reguły Cursora / AGENTS.md), nie mechanizm wyzwalany; pomiar na scenariuszach w E6, nie na deklaracji. **2026-08-12 (E4):** poziom **bez zmiany**, ale warstwa nośna ma teraz adres i twarde ograniczenia. Cursor: `.cursor/rules/*.mdc` z `alwaysApply: true` („Apply to every chat session"), zalecenie producenta poniżej 500 linii na regułę. Codex: `AGENTS.md` czytany „before doing any work", limit `project_doc_max_bytes` = **32 KiB**, sklejanie od korzenia w dół. Obie liczby są twardsze niż nasze dzisiejsze `CLAUDE.md` w projekcie po adopcji (JiraManager: 639 linii) — reguła E3 o kierowaniu decyzji do `DECYZJE.md` dostaje drugie uzasadnienie. Jednocześnie skille Codeksa wyzwalają się po dopasowaniu `description` do zadania, czyli tym samym mechanizmem, który przy R2 okazał się zależny od modelu — dlatego procedura może mieszkać w skillu, ale reguła nie. **2026-08-12 (E5) — zmierzone na Cursorze, poziom obniżony do średniego:** reguła `.mdc` z `alwaysApply: true` zadziałała w świeżej sesji CLI **bez żadnego wyzwalacza** (agent wykonał jej instrukcję na prompcie, który jej nie dotyczył), kontekst z hooka `sessionStart` realnie dotarł do modelu, a w próbie zapisu klucza model odmówił **sam**, powołując się na regułę — zanim zdążył zadziałać hook. Warstwa nośna z L-0030 ma więc w Cursorze potwierdzony adres. Ryzyko zostaje otwarte, bo pomiar objął jeden model (`auto` na koncie darmowym), wyłącznie CLI i pojedyncze zachowania, a nie pełny rytuał na żywym projekcie — to jest zakres pilotażu E6. **2026-08-17 (E6) — poziom obniżony do niskiego dla Cursora:** pilotaż przeszedł pełny cykl na trzech różnych modelach jednego narzędzia (Composer/`auto` — inicjalizacja i plan; **Grok 4.6** — cały etap E1; Opus 5 przez Claude Code — przegląd statusu). Model spoza Anthropic wykonał z reguł zawsze-w-kontekście: rytuał startu, kartę potwierdzenia etapu z kontrolą modelu, granicę zakresu (nie wszedł w E2 i E3), pytania warunkowe profilu `app`, zapis lekcji, rytuał zamknięcia z wygenerowaniem promptu następnego etapu i wpis dziennika z podpisem. Dyscyplina procesu **nie okazała się zależna od dostawcy modelu**. Ryzyko zostaje otwarte wyłącznie dla **Codeksa** (niezmierzony do E7) |
| R8 | Sesja nie ma dostępu do katalogu pluginu — `templates/` ze specyfikacjami jest nieczytelny bez `--add-dir`, więc inicjalizacja projektu (D-60) zatrzymuje się na braku źródła | Wysoki | **ZAMKNIĘTE 2026-08-07 (E5)** | Rozwiązanie: proces hooka ma pełny dostęp do dysku, więc `session-context` kopiuje `templates/*.md` do `.claude/relai/templates/` projektu (SessionStart w projektach RelAI; PostToolUse na wywołaniu skilla RelAI — pokrywa inicjalizację w świeżym folderze) i wstrzykuje ustawienia globalne `~/.claude/relai/` (domyka też L-0010). Zmierzone: inicjalizacja **bez** `--add-dir` dała komplet ośmiu dokumentów, specyfikacje czytane z lokalnej kopii (8/8 plików). D-60 nietknięte — specyfikacje pozostają plikami. Ryzyko szczątkowe: provisioning przy inicjalizacji wymaga wyzwolenia skilla (R2); fallback `--add-dir` opisany w skillach |

## Wpisy

> Wpisy z okresu 2026-08-07 … 2026-08-09 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md)
> — przeniesione 2026-08-17, suma kontrolna `c17de1981ceedb1c`.

### 2026-08-10 — E10: pilotaż, cztery scenariusze akceptacyjne, wydanie 1.0.0

Autor: RelAI (Fable) + Lukasz

**Zrobione — dowiezione vs plan (D-36):**

Plan zakładał pilotaż na nowym projekcie i adopcję JiraManagera, cztery obowiązkowe scenariusze
(D-83), kontrolę R2 w sesji interaktywnej, sześć pomiarów przeniesionych z trybu `-p` oraz wydanie
1.0.0. **Dowiezione w całości.** Etap prowadzony inaczej niż poprzednie: sesje wykonywał człowiek
interaktywnie (siedemnaście sesji), a ta sesja przygotowywała prompty i odbierała efekty z dysku —
tryb `-p` nie obsługuje `AskUserQuestion` ani potwierdzeń hooków (L-0005, L-0024).

- **Scenariusz 1 — pełny cykl nowego projektu.** `Desktop\Paragony` (CLI Node do rejestru
  paragonów) od pustego folderu: inicjalizacja (zgoda → trzy pytania → osiem dokumentów), pierwszy
  plan w HTML z szablonu „Warsztat", akceptacja, cztery etapy przez `/relai-stage`, zamknięcie
  planu. Wszystko interaktywnie, każdy etap osobną świeżą sesją.
- **Scenariusz 2 — przekazanie i wycieczka.** `/relai-handover` dał pakiet 194 KB otwierany
  offline. Po podmianie `git config user.name` na cudzą nazwę sygnał D-27 zadziałał i wycieczka
  ruszyła dopiero po zgodzie.
- **Scenariusz 3 — kopia zapasowa i odtworzenie.** `/relai-backup` (798 KB, lokalizacja zapisana
  do warstwy globalnej), potem odtworzenie na kopii i porównanie sum kontrolnych.
- **Scenariusz 4 — adopcja JiraManagera.** Żywy projekt użytkownika: 22 commity, aplikacja PySide6,
  `CLAUDE.md` na 398 linii, kolizja nazwy `docs/DZIENNIK.md`, sekrety w `config.json` pod
  niestandardową nazwą. Pełna sekwencja z pytaniami na żywo; recovery przetestowane **na kopii**,
  żywy projekt nietknięty.
- **Trzy defekty znalezione przez pilotaż i poprawione**, każdy z ponownym pomiarem i osobnym
  commitem — opis w „Zweryfikowane".
- **Wersja 1.0.0** w obu manifestach, README, `SPEC_KOMENDY`, `SPEC_RAPORT_ADOPCJI`,
  `SPEC_USTAWIENIA`, `relai-update`, obu skillach i markerze tego repo.

**Zweryfikowane — jak dokładnie:**

- **Inicjalizacja (scenariusz 1):** osiem dokumentów, marker `Wersja RelAI: 0.9.0`, commit
  `chore: initialize RelAI project structure` objął dokładnie 8 plików, `CLAUDE.md` 61 linii
  z sekcją „Reguły profilu (app)". Paczka trzech pytań padła jako **jedno** okno z opcjami; czwarte
  pytanie nie padło. Warstwa globalna `~/.claude/relai/USTAWIENIA.md` utworzona z jednym wpisem.
- **Plan HTML:** `PLAN.html` 238 KB, zero niewypełnionych znaczników, zero żądań sieciowych
  (jedyne wystąpienia `http` to namespace SVG), sześć `@font-face`, dziesięć sekcji. Pytanie
  o nadpisanie lokalne szablonu padło po pokazaniu planu i zostało zapisane w `USTAWIENIA.md`.
- **Karta potwierdzenia `/relai-stage`:** sprawdzona w transkrypcie sesji — karta z planem, „E1
  z E4", modelem i zakresem, po niej sesja **zatrzymała się** i ruszyła dopiero po „tak, zaczynamy".
- **Zamknięcie planu (D-36):** plan w `docs/archiwum/plany/REJESTR_PARAGONOW/` z czterema
  promptami, `PROMPT_ETAP_5.md` **nie** powstał, linia w `CLAUDE.md` brzmi `Aktywny plan: brak`
  (nie martwy link), cztery commity etapowe w historii.
- **Handover:** 194 116 B, zero zewnętrznych zasobów (`grep` po `src|href="http` pusty), sześć
  wymaganych sekcji, zero niewypełnionych znaczników.
- **Wycieczka (D-27):** przy `user.name` = „Marta Zielinska" hook wykrył, że żaden z 9 podpisów
  nie zawiera tej nazwy. Po zgodzie powstała wycieczka na osiem sekcji, wyłącznie z dokumentów.
  **Dowód negatywny:** `git status` po wycieczce pusty — komenda nie tknęła ani jednego pliku.
  Po przywróceniu podpisu sygnał gaśnie sam (hook zwraca zero wystąpień).
- **Backup + restore (scenariusz 3):** archiwum `Paragony_2026-08-10_0008.zip`, 268 wpisów, zero
  trafień na wzorce sekretów. Odtworzenie na kopii: **157/157** plików, zero brakujących, zero
  nadmiarowych; jedyna różnica to `docs/DZIENNIK.md` — odtworzony plik jest dokładnym **prefiksem**
  oryginału (349 z 382 linii), a 33 linie różnicy to wpis dopisany **po** spakowaniu.
- **Adopcja (scenariusz 4):** sumy kontrolne 194 plików przed i po. **Zero plików zniknęło**;
  zmienione dokładnie dwa: `CLAUDE.md` (scalanie) i `docs/DZIENNIK.md` (wpis zerowy). Kod
  (`app/`, `tests/`, `tools/`, skrypty) bez zmian. Archiwum 6 MB zamiast 508 MB —
  `release/`, `dist/`, `build/` wykluczone. **D-42:** `config.json` z tokenem Jiry i hasłem
  SMTP **nie ma** w archiwum, mimo niestandardowej nazwy; w kopii został `state.json` (cache
  zgłoszeń Jiry, nie sekret) — słusznie, bo nie wygląda ani na sekret, ani na runtime.
- **Scalanie `CLAUDE.md` (D-71):** 6 z 8 zastanych sekcji przeniesionych **bajt w bajt**
  („Decyzje zamrożone", „Układ katalogów", „Komendy", „Konwencje", „Pułapki", „Zanim zaczniesz
  kolejny etap"); „Stan prac" zastąpiona formatem RelAI, „Czym to jest" skrócona do nagłówka.
  Kopia oryginału w `docs/archiwum/CLAUDE_PRZED_ADOPCJA.md`. Limit 60 linii świadomie ustąpił
  wierności (434 linie), co raport odnotowuje.
- **Recovery adopcji na kopii:** **192/192** pliki wspólne bajt w bajt, zero nieoczekiwanych braków,
  zero różnic w treści; `git log -1` w odtworzonym pokazuje `b52c013` — hash z sekcji „Backup"
  raportu. Jedyne braki to celowo wykluczony `config.json` i log.
- **R2 — pomiar per model** (kryterium: wywołania narzędzia `Skill` w transkrypcie + zachowanie):
  **Opus** — skill wyzwolony, procedura w całości (sygnał D-27 przed akapitem „gdzie jesteśmy",
  propozycja, zatrzymanie na zgodzie). **Sonnet 4.6 i Haiku 4.5** — skill **nie** wyzwolony ani
  razu; rytuał niesie hook `session-context`, więc akapit „gdzie jesteśmy" i sygnały działają,
  ale procedura bywa niepełna. Inicjalizacja w pustym folderze: skill wyzwolony 3/3.
- **Pomiary przeniesione z `-p`:** AskUserQuestion na żywo — działa (paczka trzech pytań, pytanie
  o rodzaj/format/model, pytanie o testy przy pierwszym kodzie, pytanie o nadpisanie szablonu);
  `config-protection` żąda potwierdzenia interaktywnie; adopcja z pytaniami w trakcie — przeszła;
  propozycja wycieczki — patrz wyżej; skrócona forma komend — potwierdzona w sesji interaktywnej
  (podpowiadacz rozwija `/relai-…` do pełnej nazwy z przestrzenią pluginu).
- **Wydanie:** `claude plugin validate` — plugin „Validation passed with warnings" (jedno znane
  ostrzeżenie o root `CLAUDE.md`, L-0003), marketplace `--strict` „Validation passed". Dziewięć
  hooków przechodzi `node --check`. `grep` po `0.9.0` rozstrzygnięty: zmienione tam, gdzie
  opisuje wersję bieżącą; historyczne („od 0.9.0 działa", „nowe w 0.9.0", wiersz E9) zostają.

**Świadomie odłożone:**

- **Guard hooków rozpoznaje chroniony plik po katalogu roboczym sesji, nie po ścieżce pliku** —
  edycja `CLAUDE.md` cudzego projektu z sesji uruchomionej gdzie indziej przechodzi bez
  ostrzeżenia `config-protection`. Wykryte przy pracy nad tym etapem, decyzja użytkownika:
  nie ruszać przed 1.0.0, bo guard jest wspólny dla dziewięciu hooków, a scenariusz marginalny.
- **Zatrzymanie na zgodzie przy słabszym modelu** — Sonnet po poprawce zawsze zgłasza sygnał D-27
  i proponuje wycieczkę, ale przy dłuższym prompcie nie czeka, tylko dokłada akapit „gdzie
  jesteśmy". Dalsze wzmacnianie instrukcji ma malejący zwrot.
- **Podpis wpisu bez nazwy użytkownika** — dwa wpisy w dzienniku Paragonów (etapy prowadzone przez
  Haiku) mają `Autor: RelAI (Haiku)` zamiast `RelAI (Haiku) + Lukasz`. Specyfikacja wymaga obu
  członów; nie poprawiane w tym etapie.
- **Podzbiór znaków w fontach** (ryzyko R5) — pakiet handover waży 194 KB głównie przez osadzone
  fonty; pytanie otwarte od E6.

**Do zrobienia przez człowieka:**

- Zdecydować o dalszym losie projektu pilotażowego `Desktop\Paragony` (zostaje jako narzędzie czy
  idzie do usunięcia) oraz kopii testowych w katalogu tymczasowym sesji.
- JiraManager jest **zaadoptowany**: ma strukturę RelAI, raport adopcji i backup. Zmiany nie są
  zacommitowane — commit należy do właściciela projektu.
- Rozstrzygnąć, czy guard hooków ma rozpoznawać pliki po ścieżce (pozycja ze „świadomie odłożone").

### 2026-08-10 — Domknięcie pilotażu: `/relai-update` na projekcie pilotażowym

Autor: RelAI (Fable) + Lukasz

**Zrobione:**
- Ostatni pomiar odłożony z listy „przeniesione z trybu `-p`": `/relai-update` wykonany na żywo
  w projekcie „Paragony" (0.9.0 → 1.0.0), w sesji interaktywnej prowadzonej przez użytkownika.
- Usunięte foldery testowe po pomiarze R2 (`Desktop\Próba E10`). Archiwa backupów zostają —
  kopia JiraManagera sprzed adopcji jest jedyną drogą jej cofnięcia.

**Zweryfikowane — jak dokładnie:**
- Marker: `Wersja RelAI: 1.0.0`, data inicjalizacji `2026-08-09` **zachowana**.
- `docs/KOMENDY.md` zregenerowany — nagłówek `RelAI 1.0.0`.
- **Dowód negatywny zakresu:** commit `108e49c` objął dokładnie trzy pliki
  (`USTAWIENIA.md`, `KOMENDY.md`, `DZIENNIK.md`). `CLAUDE.md` **nie został tknięty** — mimo
  że komenda ma w inwentaryzacji wiersz o linii fraz sesji. Rozpoznała ją jako **obecną** i nie
  dołożyła drugiej: `grep` po „Frazy sesji" zwraca **1** wystąpienie, nie 2.
- Wpis w dzienniku projektu zawiera osobną sekcję „Pominięte jako nadpisania lokalne" z jawnym
  powodem przy każdej pozycji — czyli zachowanie z D-72 działa także wtedy, gdy nadpisań nie ma.
- Kolejność zgodna z procedurą: zmiany plików, marker wersji na końcu.

**Świadomie odłożone:**
- Aktualizacja JiraManagera do 1.0.0 — projekt jest po adopcji i zmiany nie są zacommitowane;
  decyzja i moment należą do właściciela.

**Do zrobienia przez człowieka:**
- Zdecydować o dalszym losie projektu pilotażowego `Desktop\Paragony`.
- Zacommitować zmiany adopcyjne w JiraManagerze (struktura RelAI + raport adopcji czekają
  w drzewie roboczym).

### 2026-08-10 — Audyt gotowości 1.0.0, wizytówka GitHubowa i domknięcie dogfoodingu

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Audyt przed przepinaniem kolejnych projektów** — na żądanie użytkownika, mierzony na żywo, nie
  odczytany z dziennika. Wynik i pięć znalezionych pułapek: niżej.
- **README przepisany na wizytówkę GitHubową**: narracja problem → mechanizm zamiast wyliczanki
  funkcji, zwinięta sekcja English z instalacją, tabela komend z ikonami, tabela „czego RelAI
  pilnuje bez proszenia", anonimizowane liczby z pilotażu (projekt A / projekt B zamiast nazw),
  jawna sekcja ograniczeń („co warto wiedzieć przed użyciem"), kontakt zwrotny, licencja.
  Szczegóły techniczne — struktura repo, konwencja hook-guard, profile — zwinięte w `<details>`,
  żeby pierwszy ekran czytała osoba nietechniczna.
- **Identyfikacja wizualna** w `docs/zasoby/branding/` w kierunku „Warsztat" zamrożonym w E6:
  banner nagłówkowy, logo kwadratowe, diagram „jak to działa" (pętla czterech kroków + pasek
  zachowań automatycznych) i dziewięć ikon komend. Skrypt `zbuduj.js` osadza podzbiory Kalam 700
  i Hanken Grotesk w plikach SVG — GitHub renderuje SVG jako obraz, więc font z zewnątrz by się
  nie wczytał. Ikony są bez tekstu, więc bez fontów: 4998 bajtów na dziewięć plików.
- **`LICENSE` — MIT**, decyzja użytkownika w tej sesji. Sekcja licencji w README przestała odsyłać
  do przyszłości.
- **Domknięcie dogfoodingu:** repo dostało brakujące `docs/STATE.md` i `docs/KOMENDY.md`
  wygenerowane wg specyfikacji (projekt powstał w 0.1.0, zanim te dokumenty istniały). Rytuał
  startu w `CLAUDE.md` uzupełniony o STATE jako pozycję drugą.

**Zweryfikowane — jak dokładnie:**

- **Składnia:** `node --check` na dziewięciu hookach i `templates/HTML_PLAN/zbuduj.js` — 10/10 OK.
- **Konwencja hook-guard, dowód negatywny:** wszystkie dziewięć hooków uruchomione z payloadem
  wskazującym folder bez markera RelAI — 9/9 kończy z kodem 0 i **pustym** `stdout`. To jest
  gwarancja dla cudzych projektów użytkownika.
- **`secret-scanner`:** klucz w formacie `sk-…` w pliku śledzonym → `permissionDecision: deny`;
  ten sam zapis do `.env` w projekcie z `.gitignore` → cisza. Hook zadziałał też **na żywo w tej
  sesji**: zablokował zapis pliku testowego zawierającego atrapę klucza (dowód, że jest aktywny,
  a nie tylko poprawny składniowo).
- **`config-protection`, cztery bramki:** edycja `docs/USTAWIENIA.md` → `ask`; edycja sekcji
  niemutowalnej `CLAUDE.md` → `ask`; edycja tego samego pliku **poza** sekcją → cisza; profil
  `flow`, zmiana `workflow.json` bez snapshotu → `ask`, a po położeniu kopii o identycznej treści
  w `docs/snapshoty/` → cisza. Bramka porównuje po treści, nie po nazwie pliku.
- **`session-context`:** w projekcie testowym skopiował komplet specyfikacji (20 pozycji) i wstrzyknął
  datę dnia oraz instrukcję rytuału; poza projektem RelAI — zero bajtów.
- **Manifest:** `claude plugin validate` → „Validation passed". Numer 1.0.0 spójny w
  `plugin.json`, `marketplace.json`, obu skillach i komendzie `/relai-update`.
- **`grep` po starych wersjach (L-0008):** wszystkie trafienia `0.8.0`/`0.9.0` są historyczne
  („nowe w 0.8.0", wiersze etapów) — żadne nie opisuje wersji bieżącej.
- **Sekrety w plikach śledzonych:** skan całego indeksu gita — jedyne trafienie to atrapa
  `SECRET_TOKEN` opisana w tym dzienniku jako dowód negatywny D-42. `.gitignore` pokrywa `.env`,
  `*.key`, `*.pem`, `client_secret*.json`.
- **Grafika:** banner sprawdzony w trybie `<img src="data:…">` (tak renderuje go GitHub) na motywie
  jasnym i ciemnym — osadzony Kalam wczytuje się w obu. Wszystkie ścieżki obrazów z README
  istnieją; katalog identyfikacji waży 405 KB.

**Pięć pułapek znalezionych w audycie:**

1. **Zainstalowany plugin jest dwa commity za repo** — cache stoi na `4b484b6`, HEAD na `c260bad`.
   Wersja z cache nie ma ostrzeżenia o restarcie w `/relai-update` (L-0031). To dokładnie ten
   defekt, który użytkownik zobaczył wczoraj na JiraManagerze.
2. **R2 — zależność od modelu**, potwierdzona jako trwała własność, nie usterka.
3. **Guard rozpoznaje projekt po katalogu roboczym sesji, nie po ścieżce pliku** — świadomie
   odłożone przed 1.0.0, nadal aktualne; objawia się w obie strony (cudzy `CLAUDE.md` bez
   ostrzeżenia, plik spoza projektu blokowany przez skaner).
4. **R5 — dokumenty rosną**, bez mechanizmu rotacji; `/relai-audit` wykrywa, nie naprawia.
5. **Repozytorium jest prywatne i bez opisu na GitHubie** — instalacja u kogokolwiek innego dziś
   nie zadziała.

**Świadomie odłożone:**

- **Badge'y `shields.io`** — wymagałyby pobierania obrazów z zewnętrznego serwisu przy każdym
  otwarciu README. Wersja, licencja i wymagania podane tekstem pod bannerem.
- **Eksport PNG** logo i ikon — SVG wystarcza GitHubowi; raster dopiero wtedy, gdy pojawi się
  miejsce, które go wymaga (np. awatar organizacji).
- **Wiersz „Profil projektu" w `docs/USTAWIENIA.md` tego repo nie jest żadną z czterech wartości
  listy zamkniętej** („Narzędzie/plugin (odpowiednik profilu…)"), więc bramka profilu
  w `config-protection` dla tego repo nie działa. Nie ruszane — zmiana profilu jest decyzją
  człowieka, nie porządkiem przy okazji README.

**Do zrobienia przez człowieka:**

- **Zaktualizować zainstalowany plugin przed przepinaniem kolejnych projektów:**
  `claude plugin marketplace update relai` → `claude plugin update relai@relai` → **restart
  aplikacji**.
- Zdecydować o upublicznieniu repozytorium i dopisać opis na GitHubie — bez tego README nie ma *(rozstrzygnięte 2026-08-12 — repo publiczne; pusty opis wydzielony do odnogi OPIS_REPO)*
  do kogo trafić.
- Potwierdzić brzmienie nazwiska w `LICENSE` („Łukasz Nowakowski", rok 2026). *(rozstrzygnięte 2026-08-12 — Aneks A do planu ROZWOJ_PO_WYDANIU: LICENSE potwierdzone)*
- Nadal otwarte z poprzedniego wpisu: los projektu pilotażowego `Desktop\Paragony`, commit zmian
  adopcyjnych w JiraManagerze, decyzja o guardzie rozpoznającym pliki po ścieżce.

### 2026-08-12 — Retrospektywa dwóch projektów i plan ROZWOJ_PO_WYDANIU

Autor: RelAI (Fable) + Lukasz

**Zrobione:**

- **Retrospektywa użycia RelAI na dwóch żywych projektach** (na prośbę użytkownika, zmierzona
  na plikach, nie na wrażeniach). JiraManager: dziennik 318 KB (+194 KB w ~2,5 dnia po adopcji),
  `CLAUDE.md` 639 linii — 8 nowych decyzji poszło do zastanej tabeli zamiast do pustego
  `DECYZJE.md`; etap E3b zostawił 5 wpisów poprawek, po E10 były 4 wpisy poprawek poza etapem.
  PolyFlow: dziennik 224 KB i STATE 72 KB po dwóch dniach; etap E2 planu EKRAN_USTAWIEN zamknięty
  po 6 aneksach (4 łatały jeden problem); 20 lekcji jednego dnia; plany „ZREALIZOWANE" przy
  kilkunastu otwartych bramkach manualnych. Działa dobrze: rytuały końca etapu, lekcje po
  korekcie, backup/adopcja, rejestr ryzyk, aneksy jako jawna zmiana zakresu.
- **Inwentarz przenośności pluginu** pod port na Cursora i Codexa: ~247 KB treści przenośnej
  wprost, ~152 KB wymagającej odpowiednika u hosta, ~114 KB twardo związanej z Claude Code
  (hooki z `permissionDecision`, skille z auto-wyzwalaniem, `AskUserQuestion`, marketplace).
  Kluczowy wniosek: jedyne gwarancje blokujące egzekwuje dziś harness, nie tekst.
- **Dwie rundy wywiadu** (AskUserQuestion, 8 pytań): zakres = wszystkie cztery wątki; usprawnienia
  przed portem; architektura portu = wspólny rdzeń + adaptery; odnoga jako komenda
  `/relai-branch`; rotacja automatyczna przy zamknięciu sesji (świadomie ponad rekomendację,
  z warunkiem nieusuwalności treści); Cursor przed Codexem; dystrybucja przez repo publiczne;
  konsultacje ustrukturyzowane przy odchyleniu od planu.
- **Plan ROZWOJ_PO_WYDANIU** — `docs/plany/ROZWOJ_PO_WYDANIU/`: `PLAN.html` (szablon „Warsztat",
  bez symulatora — plan nie ma wyliczeń do kręcenia) + `STATUS.md`, 8 etapów E1–E8
  (odnoga → rotacja → poprawki retro → rdzeń przenośny → adapter Cursor → pilotaż w firmie →
  adapter Codex → wydanie 2.0.0), 12–17 sesji (SZACUNEK). Linia aktywnego planu w `CLAUDE.md`
  i `STATE.md` zaktualizowane w tej samej turze.

**Zweryfikowane — jak dokładnie:**

- Retrospektywy i inwentarz: trzy niezależne analizy na plikach projektów (rozmiary, liczba
  wpisów/aneksów, `git log`/`git status`) — liczby w planie mają etykiety FAKT/SZACUNEK zgodnie
  ze źródłem.
- `PLAN.html`: builder `zbuduj.js` zakończony kodem 0 — 6 reguł @font-face osadzonych, plik
  215 KB, znacznik symulatora usunięty; `grep` po `{{` w gotowym pliku: 0 trafień.
- Decyzje zamrożone sprawdzone przed planem: D-80 wyłączała port tylko z zakresu v1 (nie na
  zawsze); D-31/D-37 nie kolidują z odnogą — odnoga domyka ich lukę (brak promptu świeżej sesji).
- **Nie weryfikowano:** renderu `PLAN.html` w przeglądarce (panel podglądu nieaktywny w tej
  sesji) — do obejrzenia dwuklikiem przed akceptacją.

**Świadomie odłożone:**

- Generacja `PROMPT_ETAP_1.md` — powstanie przy akceptacji planu (D-34, lazy).
- Wpisy P1/P2 do tabeli „Stan otwartych ryzyk" — wchodzą z chwilą akceptacji planu, nie przed.
- Szczegóły API mechanizmów Cursora/Codexa — rozpoznanie stanu faktycznego jest pierwszym
  krokiem E4, żeby prompty etapowe nie niosły przeterminowanej wiedzy.

**Do zrobienia przez człowieka:**

- **Przeczytać i zaakceptować (albo odesłać z uwagami) plan** — `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html`. *(rozstrzygnięte 2026-08-12 — plan ZAAKCEPTOWANY z Aneksem A)*
  *(rozstrzygnięte 2026-08-12 — plan ZAAKCEPTOWANY z Aneksem A)*
- Cztery decyzje z sekcji 9 planu: upublicznienie repo (przed E8), język warstwy zespołowej *(rozstrzygnięte 2026-08-12 — Aneks A: repo już publiczne, warstwa modelowa EN i ludzka PL, zgoda na auto-rotację, LICENSE potwierdzone)*
  adapterów (przed E5), zgoda na auto-rotację w istniejących projektach (po E2), brzmienie
  nazwiska w `LICENSE` (przed E8). *(rozstrzygnięte 2026-08-12 — wszystkie cztery w Aneksie A)*

### 2026-08-12 — Plan ROZWOJ_PO_WYDANIU ZAAKCEPTOWANY (Aneks A)

Autor: RelAI (Fable) + Lukasz

**Zrobione:**

- Plan zaakceptowany przez użytkownika bez zmian w sekcjach 1–9; wszystkie cztery pozycje
  sekcji 9 rozstrzygnięte przy akceptacji i zapisane jako **Aneks A** w `PLAN.html`:
  repo już publiczne (opis repo — do E8), warstwa modelowa adapterów po angielsku / ludzka po
  polsku, zgoda na auto-rotację w istniejących projektach przy `/relai-update`, LICENSE
  potwierdzone („Łukasz Nowakowski", 2026).
- `STATUS.md`: plan → ZAAKCEPTOWANY 2026-08-12 (Aneks A), E1 → GOTOWY DO STARTU.
- Wygenerowano `PROMPT_ETAP_1.md` (odnoga planu, wykonawca Opus) wg specyfikacji promptu
  etapowego — z realnego stanu repo i kompletu 31 zasad aktywnych.
- Ryzyka P1 (brak blokad harnessu w adapterach) i P2 (proces bez auto-wyzwalania) dopisane do
  tabeli „Stan otwartych ryzyk" — zgodnie z sekcją 7 planu.
- `CLAUDE.md` (linia aktywnego planu), `docs/STATE.md` (blokada repo zdjęta, następny krok:
  `/relai-stage`) i `docs/USTAWIENIA.md` (wiersz o języku warstw adapterów) zaktualizowane.

**Zweryfikowane — jak dokładnie:**

- Widoczność repo: `gh repo view nowilus/relai` → `"visibility":"PUBLIC"`, `"description":""`
  — stąd „opis repo" jako zadanie E8, nie deklaracja.
- Kolumna `Prompt` przy E1 wskazuje istniejący plik (siatka D-34 nie ma czego wyłapywać).
- Render `PLAN.html` po dopisaniu Aneksu A sprawdzony w panelu podglądu.

**Świadomie odłożone:**

- `PROMPT_ETAP_2.md` — powstanie w rytuale „Na koniec" etapu E1 (D-34, lazy).
- Opis repo na GitHubie — zaplanowany w E8; kandydat na pierwszą odnogę dogfoodingową w E1.

**Do zrobienia przez człowieka:**

- Uruchomić etap E1 w świeżej sesji **Opus**: `/relai-stage` (albo wkleić
  `docs/plany/ROZWOJ_PO_WYDANIU/PROMPT_ETAP_1.md`). *(rozstrzygnięte 2026-08-12 — E1 ZREALIZOWANY,
  wersja 1.1.0)*

### 2026-08-12 — E1: odnogi planu, sygnał odchylenia, RelAI 1.1.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`templates/SPEC_ODNOGA.md`** (nowy, 20. specyfikacja) — para plików odnogi: karta `ODNOGA.md`
  w formacie miniplanu (cel / skąd się wzięła / zakres / poza zakresem / weryfikacja / wynik) oraz
  `PROMPT_ODNOGA.md` — samowystarczalny prompt świeżej sesji o ośmiu sekcjach, odchudzony kuzyn
  `SPEC_PROMPT_ETAPU`. Trzy statusy: `OTWARTA`, `ZAMKNIĘTA <data>`,
  `PRZENIESIONA <data> → docs/fixy/`. Dwa kompletne przykłady (L-0001).
- **`commands/relai-branch.md`** (nowa, dziesiąta komenda) — sześć kroków: marker RelAI → **zakaz
  głębokości sprawdzany jako pierwszy** → nazwa i cel (jedno `AskUserQuestion`, tylko o brakujące)
  → plan i etap-źródło → generacja pary wg specyfikacji czytanej z `.claude/relai/templates/`
  (L-0012) → jedna linia w sekcji „Odnogi" → instrukcja świeżej sesji. Wariant bez planu:
  `docs/fixy/<NAZWA>/` i cisza w `STATUS.md`.
- **`templates/SPEC_STATUS.md`** — sekcja „Odnogi" po tabeli etapów: format linii, trzy statusy,
  zasada „zamknięcie planu wylicza otwarte odnogi i pyta". Przykład rozszerzony; dopisane wprost, że
  odnoga zostawia ślad **wyłącznie** w tej sekcji, a dziennik wdrożenia o niej milczy.
- **`skills/relai-planning/SKILL.md`** — dwie nowe sekcje: **sygnał odchylenia** (warunek
  wyzwolenia, tabela trzech opcji odnoga/aneks/odłożone, zasada „pytasz raz na wątek") i **„Odnogi
  planu"** z sześcioma regułami wypisanymi w treści skilla (L-0011). Sekwencja zamknięcia planu
  urosła z siedmiu kroków do ośmiu — doszło wyliczenie otwartych odnóg przed archiwizacją.
- **`templates/SPEC_CLAUDE_MD.md` + `skills/relai-core/SKILL.md`** — reguła sygnału odchylenia
  wchodzi do „Reguł procesu" **każdego** generowanego `CLAUDE.md`, także w projekcie bez planu.
  Wzorzec L-0030: warstwa zawsze-w-kontekście niesie regułę, skill dokłada procedurę.
- **`templates/SPEC_KOMENDY.md`**, `docs/KOMENDY.md`, `README.md` (wiersz + ikona `branch.svg`),
  `commands/relai-stage.md` (Krok 5 kieruje do sygnału odchylenia zamiast do „świadomie odłożone").
- **Wersja 1.1.0** w obu manifestach, obu skillach, `/relai-update`, README, `SPEC_KOMENDY`,
  `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, `docs/KOMENDY.md` i markerze tego repo.
- **Dogfooding:** dwie realne odnogi tego planu — `OPIS_REPO` (pusty opis repozytorium na GitHubie,
  wątek zostawiony przez Aneks A do E8) i `POMIAR_ODNOG` (niedomknięty punkt 8 weryfikacji tego
  etapu). Obie z kartą, promptem i linią w `STATUS.md`.

**Zweryfikowane — jak dokładnie:**

- **Manifest:** `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with
  warnings"; jedyne ostrzeżenie to znane root `CLAUDE.md` (L-0003). Walidacja marketplace: bez
  ostrzeżeń.
- **Wersja:** `git grep -n "1\.0\.0"` po podbiciu — wszystkie pozostałe trafienia historyczne
  (wpisy dziennika, archiwum planu BUDOWA_RELAI, zamrożony `PLAN.html`, `PROMPT_ETAP_1`, wiersz E10
  w `CLAUDE.md`, zdania o pilotażu w README). `docs/STATE.md` nadpisany w tym samym rytuale.
- **Instalacja:** po `push` (commit `e6b41dc`) → `claude plugin marketplace update relai` →
  `claude plugin update relai@relai` („updated from 1.0.0 to 1.1.0"). `installed_plugins.json`:
  `"version": "1.1.0"`, `"gitCommitSha": "e6b41dcd1e47…"` — zgodny z wypchniętym commitem (L-0020).
- **Projekt testowy z aktywnym planem:** powstały `odnogi/OPIS_KART/ODNOGA.md`
  i `PROMPT_ODNOGA.md`; z dziewięciu plików projektu zmienił się **dokładnie jeden** — `STATUS.md`.
- **Dowód zamrożenia (L-0007):** sumy kontrolne dziesięciu sekcji `PLAN.html` projektu testowego
  przed i po utworzeniu odnogi identyczne (`s1 983c7b56…` … `s10 fb6002bb…`, cały plik
  `a498acbb7d106e70`). Na realnym planie ROZWOJ_PO_WYDANIU mocniejszy dowód: po utworzeniu dwóch
  odnóg `PLAN.html` **nie pojawia się w `git status`** (suma sekcji: `s1 497dc31e…`).
- **Projekt bez planu:** komplet w `docs/fixy/LITEROWKI_W_MENU/`, w projekcie **zero** plików
  `STATUS.md` (`find … -name STATUS.md | wc -l` → `0`), pozostałe sześć plików bez zmian.
- **Dowód zakazu głębokości (L-0007):** wywołanie z sesji pracującej nad odnogą `LOGI_WYDAN`
  zakończyło się odmową z propozycją pełnego planu; drzewo plików przed = po, 10/10 sum
  kontrolnych identycznych — **żaden plik nie powstał**.
- **Dystrybucja specyfikacji:** hook `session-context` rozprowadził `SPEC_ODNOGA.md` do
  `.claude/relai/templates/` projektu testowego; kopia zgodna z repo bajt w bajt po normalizacji
  końców linii (`b800d24712af7216`). Nowa specyfikacja dociera drogą z L-0012 bez żadnej zmiany
  w hooku.

**Świadomie odłożone:**

- **Punkt 8 weryfikacji — samowystarczalność `PROMPT_ODNOGA` mierzona świeżą sesją — NIE ZOSTAŁ
  WYKONANY.** Punkty 4, 6 i 7 zmierzono **słabszą metodą**: procedurą wykonaną z pliku
  `commands/relai-branch.md` w sesji etapu, zamiast wywołaniem zarejestrowanej komendy w świeżej
  sesji `claude -p`. Artefakty i dowody negatywne są realne, ale to nie jest dowód, że komenda
  wyzwala się i wykonuje sama. Powód: `claude -p` zwracał „You've hit your session limit · resets
  4:10pm" — CLI uwierzytelnia się z `~/.claude/.credentials.json` (konto `drb_claude@ibpm.pro`,
  plik z 08:37), **niezależnie od konta przełączonego w aplikacji**; przelogowanie CLI jest krokiem
  człowieka. Decyzja użytkownika: zamknąć etap i przenieść pomiar do **odnogi `POMIAR_ODNOG`**
  z gotowym promptem czterech scenariuszy — zamiast trzymać etap w `W TOKU` albo zamykać go po
  cichu. Pierwszy raz mechanizm z tego etapu obsłużył własną lukę.
- Opis repozytorium na GitHubie — odnoga `OPIS_REPO`, nie zadanie tego etapu.
- Ikona `branch.svg` powstała, ale nie przeszła przeglądu wizualnego — jest spójna stylistycznie
  z dziewięcioma pozostałymi (szałwia #5f8a68, ten sam grid 48×48, ta sama grubość kreski).

**Do zrobienia przez człowieka:**

- **Restart aplikacji** — bez niego bieżące sesje ładują cache 1.0.0 (L-0031).
  *(rozstrzygnięte 2026-08-12 — pozycja zastąpiona pełną sekwencją wydania z wpisu o E2; jest ona
  bramką manualną planu)*
- **`claude /login`** w terminalu na konto z dostępnym limitem — warunek startu odnogi
  `POMIAR_ODNOG`; bez tego pomiar padnie na tym samym błędzie. *(rozstrzygnięte 2026-08-12 —
  pozycja powtórzona we wpisie o E2 i tam prowadzona jako bramka manualna planu)*
- Uruchomić dwie odnogi w świeżych sesjach Opus (`OPIS_REPO`, `POMIAR_ODNOG`) albo etap E2
  (`/relai-stage`) — kolejność dowolna, odnogi nie blokują planu. *(rozstrzygnięte 2026-08-12 —
  wybrano etap E2; obie odnogi zostają otwarte w sekcji „Odnogi" planu)*

### 2026-08-12 — E2: rotacja dokumentów, kalibracja progów, RelAI 1.2.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`templates/SPEC_ARCHIWUM.md`** (nowy, 20. specyfikacja) — archiwum dziennika i lekcji:
  ścieżki `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` i
  `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md`, nagłówek z zakresem i sumą kontrolną,
  treść **bajt w bajt**, format linii-odsyłacza, definicja sumy (SHA-256/16 po normalizacji do LF),
  reguły wyboru zakresu, przebieg dwufazowy, siedem przypadków brzegowych i dwa kompletne
  przykłady (L-0001).
- **Rotacja jako krok rytuału zamknięcia sesji** w `skills/relai-core/SKILL.md` — nowy punkt 2
  (przed wpisem do dziennika, żeby wpis opisał rotację i wylądował w przyciętym pliku). Procedura
  wypisana w treści skilla, nie odesłaniem (L-0011): warunek z `USTAWIENIA.md`, tabela progów,
  cisza poniżej progu, lista nietykalnych, dwie fazy, ślad w dzienniku.
- **`templates/SPEC_USTAWIENIA.md`** — wiersz `Rotacja dokumentów` z formatem czytanym maszynowo
  (kotwica na początku komórki, człony po `·`), wyłącznikiem i progami; powstaje przy inicjalizacji
  **bez dodatkowego pytania** (limit trzech pytań, D-80).
- **`templates/SPEC_DZIENNIK.md`** i **`templates/SPEC_LEKCJE.md`** — sekcje rotacji: co zostaje
  zawsze, co odchodzi, jak wygląda odsyłacz. W dzienniku **wycofana** dawna reguła
  „jednoakapitowe streszczenie zarchiwizowanego okresu" (streszczenie milczy o tym, czego nie
  zmieściło) oraz dawny próg 50 KB z kwartałem. W lekcjach rozdzielone dwie mylone operacje:
  kompresja (destylat, za zgodą) i rotacja (pełne wpisy, sama).
- **`templates/SPEC_STATE.md`** — próg zwięzłości 300 linii: STATE nie ma archiwum, jest pisany
  zwięźlej, a fakt znikający stąd i nieobecny gdzie indziej idzie do wpisu dziennika (D-18).
- **`commands/relai-update.md`** — wiersz stanu docelowego 1.2.0: projekt dostaje wiersz rotacji
  w `USTAWIENIA.md` (Aneks A: zgoda jest), wiersz już obecny nie jest nadpisywany — także gdy stoi
  w nim `wyłączona`.
- **`templates/SPEC_KOMENDY.md`**, `docs/KOMENDY.md`, `README.md`, `templates/README.md` — rotacja
  jako zachowanie automatyczne, opisane efektem; tabela komend bez zmian, bo rotacja nie ma
  własnej komendy.
- **Wersja 1.2.0** w obu manifestach, obu skillach, `/relai-update`, `SPEC_KOMENDY`,
  `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README i markerze tego repo.

**Zweryfikowane — jak dokładnie:**

- **Kalibracja progów — liczby zmierzone na dysku 2026-08-12** `FAKT`: JiraManager — dziennik
  355 977 B (348 KB) / 27 wpisów, lekcje 33 270 B / 16 pozycji, STATE 431 linii; PolyFlow —
  dziennik 228 303 B (223 KB) / 43 wpisy, lekcje 48 828 B / 29 pozycji, STATE 879 linii; RelAI —
  dziennik 143 462 B / lekcje 42 405 B / 33 lekcje / STATE 88 linii. Rozstrzygnięcie: **dziennik
  150 KB zostaje** (łapie oba realne projekty, nie odpala się na RelAI o włos poniżej), **STATE
  300 linii zostaje** (oba realne projekty ponad, RelAI daleko poniżej), **próg lekcji zmieniony
  z „60 lekcji" na „40 wpisów albo 50 KB, co nastąpi wcześniej"** — 60 lekcji nie osiągnął żaden
  projekt, a PolyFlow przy 29 lekcjach ma już 49 KB, więc próg liczony wyłącznie w pozycjach byłby
  martwy (→ L-0034).
- **Rotacja przenosi bajt w bajt** — projekt testowy `A_ponad_progiem` (dziennik 317 KB, 24 wpisy,
  45 lekcji): przeniesione 14 wpisów (2026-01-05 … 2026-01-18), suma przed `9d8d0434a64ec1b3`
  = suma treści w archiwum `9d8d0434a64ec1b3`, a porównanie **znak po znaku** ciągów daje
  `true`. Żywy dziennik 317 KB → 132 KB, zostało 10 wpisów **bez zmiany bajtowej**, linia-odsyłacz
  wskazuje istniejący plik. Lekcje: przeniesione 25 (L-0001 … L-0025), zostało 20.
- **Dowód dwufazowości (dowód negatywny, L-0007):** przebieg zatrzymany po fazie 1 — plik archiwum
  powstał (14 wpisów), a suma żywego dziennika przed i po jest ta sama (`62883819af1a7bb3`), tak
  samo `LEKCJE.md` (`e296eb0c61dd3a71`). W drzewie przybyło 5 pozycji (samo archiwum), **nie
  zniknęła żadna**. Kolejny pełny przebieg nadpisał osieroconą kopię tą samą treścią i dopiero
  wtedy przyciął żywy plik.
- **Sekcje nietykalne:** suma „Stan otwartych ryzyk" przed i po rotacji `c0dc8135653c99c3`
  = `c0dc8135653c99c3`; suma „Zasady aktywne" `2c42011a0e3a9099` = `2c42011a0e3a9099`.
- **Wpis z otwartą pozycją „Do zrobienia przez człowieka" zostaje:** projekt `C_otwarta_pozycja`
  (dziennik 317 KB, otwarta pozycja w **najstarszym** wpisie) — zakres pusty, **drzewo plików
  przed = po**, komunikat jednym zdaniem o tym, że nie ma czego przenieść. Projekt
  `A2_urwany_zakres` (otwarta pozycja w piątym wpisie) — przeniesione dokładnie 4 wpisy, piąty
  został w żywym pliku bajt w bajt: ciągłość zakresu urywa się na pozycji nietykalnej.
- **Cisza poniżej progu:** projekt `B_ponizej_progu` (dziennik 41 KB) — drzewo plików przed = po
  (5 pozycji), katalog `docs/archiwum/dziennik/` **nie powstał**, zero komunikatów.
- **Wyłącznik:** projekt `D_wylacznik` (dziennik 317 KB, `Rotacja dokumentów | wyłączona`) —
  progi nie były nawet sprawdzane, drzewo przed = po, zero komunikatów.
- **Manifest:** `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with
  warnings", jedyne ostrzeżenie to znane root `CLAUDE.md` (L-0003); marketplace bez ostrzeżeń.
- **Wersja:** `git grep -n "1\.1\.0"` po podbiciu — wszystkie pozostałe trafienia historyczne
  (wpisy dziennika, zamrożony `PLAN.html`, `PROMPT_ETAP_1`, wiersz E1 w `STATUS.md` i w `CLAUDE.md`,
  narracja „nowe w 1.1.0" w `SPEC_KOMENDY`, prompty odnóg sprzed tego etapu).
- **Metoda:** rotację wykonywał instrument w Node (`rotacja.js`) realizujący procedurę
  ze `SPEC_ARCHIWUM.md` krok po kroku, na projektach testowych generowanych skryptem poza
  repozytorium (`git status --short` bez śmieci).

**Świadomie odłożone:**

- **Punkty 5 i 7 weryfikacji zmierzone metodą słabszą.** „Cisza poniżej progu" i „wyłącznik
  działa" mówią o zachowaniu **sesji zamykającej projekt**; zmierzono zachowanie **procedury**
  (drzewo przed = po, zero komunikatów), nie świeżej sesji `claude -p`. Powód jest twardy:
  zainstalowana wersja to 1.1.0, a rotacja wejdzie w życie dopiero po push → `plugin update` →
  **restarcie aplikacji** (L-0031), więc pomiar z tej sesji mierzyłby wersję bez rotacji. Decyzja
  użytkownika: **rozszerzyć odnogę `POMIAR_ODNOG`** o scenariusze E i F zamiast zakładać trzecią
  odnogę — jedna sesja pomiarowa domknie punkty z E1 i E2. Karta i prompt odnogi zaktualizowane.
- **Suma kontrolna liczona po normalizacji do LF także dla archiwum**, mimo że L-0033 zostawiała
  dla plików „niewędrujących przez gita" sumę na bajtach. Powód: suma trafia do wpisu dziennika
  i ma dać się odtworzyć po klonie na Windowsie. To doprecyzowanie L-0033, nie sprzeczność.
- Rotacja w JiraManagerze i PolyFlow — wejdzie przez `/relai-update` po restarcie; tego etapu nie
  dotyczy.
- Kompresja lekcji (destylacja za zgodą) zostaje bez zmian — rotacja jej nie zastępuje.

**Do zrobienia przez człowieka:**

- **Push, `claude plugin marketplace update relai`, `claude plugin update relai@relai`, restart
  aplikacji** — bez restartu sesje ładują cache 1.1.0 (L-0031).
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`
  (L-0032), teraz obejmującej także dwa scenariusze rotacji.
- Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update` — dzienniki 348 KB
  i 223 KB czekają na pierwszą rotację.

### 2026-08-12 — E3: poprawki z retrospektywy — decyzje po adopcji, rozjazd stanu, podpis, bramki, RelAI 1.3.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Decyzje po adopcji trafiają do `DECYZJE.md`** — trzy warstwy zamiast jednej: nowa sekcja
  „Projekt po adopcji" w `templates/SPEC_DECYZJE.md` (tabela rozgraniczająca zastaną tabelę
  w `CLAUDE.md` od rejestru), sekcja „Reguła rejestru decyzji po adopcji" w
  `templates/SPEC_CLAUDE_MD.md` (brzmienie punktu do „Reguł procesu" **wyłącznie** w projekcie po
  adopcji — L-0029), punkt 5 procedury scalania w `commands/relai-adopt.md` plus zdanie pod
  nagłówkiem sekcji odziedziczonej, i sekcja „Rejestry w projekcie po adopcji" w
  `skills/relai-core/SKILL.md`. Zastanych decyzji **nie przepisujemy** do rejestru — dwie kopie
  reguły to dwa źródła prawdy.
- **Sygnał rozjazdu stanu** — `hooks/session-context.js` dostał `stateDrift()`: porównuje etap
  `W TOKU` w każdym `docs/plany/*/STATUS.md` z linią „Aktywny plan" w `CLAUDE.md` i ze wzmianką
  o tym planie w `STATE.md`, plus wykrywa martwy link w tej linii. Fakty idą do kontekstu jako
  „ZADANIE PIERWSZE" przed instrukcją rytuału, z jawnym zakazem prostowania dokumentów na własną
  rękę. **Właścicielem sygnału jest hook**; `skills/relai-core/SKILL.md` dostał sekcję „Siatka
  bezpieczeństwa: rozjazd stanu" mówiącą wprost: hook zgłosił → nie powtarzaj, hook milczy → milcz,
  hooka nie było w kontekście → dopiero wtedy porównaj sam (→ L-0036).
- **Hook `journal-signature.js`** (dziesiąty, PostToolUse na Write/Edit/MultiEdit) — po każdym
  zapisie żywego dziennika czyta ostatni wpis i ostrzega, gdy przy skonfigurowanym gicie w linii
  autora brakuje członu `+ <użytkownik>` albo linii autora nie ma wcale. Ostrzega, nigdy nie
  blokuje i nie poprawia wpisu sam. Miejsce egzekwowania wybrane świadomie: PostToolUse trafia
  w turę, w której wpis powstał, więc poprawka kosztuje jedną edycję; rytuał zamknięcia sesji
  trafiłby w moment, w którym wpisu już się nie ogląda, a sesja może skończyć się bez rytuału.
  `templates/SPEC_DZIENNIK.md` dostał osobną sekcję „Linia autora — jeden format, bez wariantów".
- **Bramki manualne widoczne w `STATUS.md`** — nowa sekcja w `templates/SPEC_STATUS.md` (format
  linii, dwa statusy, miejsce po „Odnogach", odświeżanie w rytuale „Na koniec", przykład), nowy
  punkt 3 rytuału „Na koniec" i **przebudowana kolejność sekwencji zamknięcia planu** w
  `skills/relai-planning/SKILL.md`: dwa punkty blokujące (bramki, odnogi) idą teraz **pierwsze**,
  przed `STATE.md`, wpisem zamykającym i statusem `ZREALIZOWANY`. Poprzednia kolejność pozwalała
  ogłosić plan zrealizowanym, a dopiero potem zapytać, czy wolno go zamknąć. `commands/relai-stage.md`
  (krok 6) opisuje nową kolejność i mówi o krokach 1–9.
- **Zbiór akceptowanych brzmień dopiska o rozstrzygnięciu** — `SPEC_DZIENNIK.md` i `SPEC_STATUS.md`
  mówią teraz, że mechanizm rozpoznaje `rozstrzygnięte`, `zrobione` i `wykonane` z datą, a nowe
  wpisy piszą się brzmieniem kanonicznym (→ L-0035). `SPEC_ARCHIWUM.md` **nietknięte** — rotacja
  jest domknięta w E2 i czeka na pomiar z odnogi.
- **Dokumenty użytkownika:** `templates/SPEC_KOMENDY.md` (zakres wersji 1.3.0, cztery zachowania
  opisane efektem, przykład 1.3.0) i `docs/KOMENDY.md` tego repo — trzy nowe punkty w sekcji
  „Czego RelAI pilnuje bez proszenia". Tabela komend bez zmian: żadna z poprawek nie ma własnej
  komendy. `commands/relai-update.md` — stan docelowy 1.3.0 z wierszem reguły po adopcji i jawnym
  zdaniem, że sekcja „Bramki manualne" w planach **nie** powstaje przy aktualizacji (plan to treść
  merytoryczna) i pojawi się przy najbliższym zamknięciu etapu.
- **Dogfooding na tym repo:** `STATUS.md` planu dostał sekcję „Bramki manualne" z trzema otwartymi
  pozycjami wyłuskanymi z dziennika; sześć pozycji rozstrzygniętych faktami (akceptacja planu,
  cztery decyzje sekcji 9, start E1, wybór E2 zamiast odnóg) dostało brakujące adnotacje
  w miejscu, gdzie stoją.
- **Wersja 1.3.0** w obu manifestach, obu skillach, `/relai-update`, `SPEC_KOMENDY`,
  `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README, `docs/KOMENDY.md` i markerze tego repo.

**Zweryfikowane — jak dokładnie:**

- **Podpis — 9/9 sprawdzeń** (instrument `podpis.js`, hook uruchamiany realnym procesem z payloadem
  JSON na stdin, L-0017): wpis podpisany `RelAI (Haiku)` przy `user.name = Jan Kowalski` → komunikat
  wskazujący właściwy wpis; wpis `RelAI (Opus) + Jan Kowalski` → **cisza** (dowód negatywny);
  brak linii autora → osobny komunikat; **git nieskonfigurowany** (podstawiony katalog domowy) →
  cisza; edycja `docs/STATE.md` → cisza; folder bez markera RelAI → cisza i kod 0; plik
  `docs/archiwum/dziennik/…` → cisza. Wyjście hooka bez polskich diakrytyków (L-0016).
- **Rozjazd stanu — 15/15 sprawdzeń** (instrument `rozjazd.js`, hook `session-context` na zdarzeniu
  SessionStart): etap `W TOKU` + „Aktywny plan: brak" → **dokładnie jeden** blok sygnału, przed
  instrukcją rytuału, z nazwą pliku i etapu; projekt spójny → **zero** wzmianek przy zachowanym
  reszcie kontekstu (data dnia); `STATE.md` milczący o planie w toku → sygnał raz, z właściwym
  faktem; martwy link w linii aktywnego planu → sygnał raz; plan bez etapu `W TOKU` → cisza; linia
  wskazująca **inny** plan niż ten z etapem `W TOKU` → sygnał raz. **To repozytorium: zero
  sygnałów** — trzy dokumenty mówią to samo (punkt 7 weryfikacji).
- **Manifesty:** `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with
  warnings", jedyne ostrzeżenie to znane root `CLAUDE.md` (L-0003); `marketplace.json` →
  „Validation passed" bez ostrzeżeń. `node --check` na obu zmienionych hookach, `hooks.json`
  parsuje się i ma pięć hooków na Write/Edit; `hooks/*.js` = 10 plików `FAKT`.
- **Wersja:** `git grep -n "1\.2\.0"` po podbiciu — wszystkie pozostałe trafienia historyczne
  (wpisy dziennika, zamrożony `PLAN.html`, `PROMPT_ETAP_2`/`_3`, wiersz E2 w `STATUS.md`
  i w `CLAUDE.md`, adnotacje „od 1.2.0" przy mechanizmach rotacji). Cztery wystąpienia w plikach
  odnogi `POMIAR_ODNOG` zamienione na „co najmniej 1.2.0" — wymaganie wersji na sztywno rotowałoby
  z każdym wydaniem i zablokowałoby pomiar.
- **Bramki na tym repo:** instrument wyławiający pozycje „Do zrobienia przez człowieka" z okresu
  planu ROZWOJ_PO_WYDANIU zwrócił 9 pozycji, z czego 6 okazało się zamkniętych faktami — po
  adnotacjach zostają 3 otwarte i tyle stoi w sekcji „Bramki manualne" `STATUS.md` `FAKT`.
- **Czego NIE zweryfikowano:** trzech punktów sekcji Weryfikacja opisujących zachowanie **świeżej
  sesji** — patrz „Świadomie odłożone".

**Świadomie odłożone:**

- **Trzy punkty weryfikacji przeniesione do odnogi `POMIAR_ODNOG` (scenariusze G, H, I)** — decyzja
  użytkownika z tej sesji, taka sama jak przy E2. Dotyczą: decyzji po adopcji lądującej
  w `DECYZJE.md` z dowodem negatywnym na sumie sekcji odziedziczonej (punkt 3), **sesyjnej** części
  punktu 4 — czy sygnał rozjazdu nie dubluje się między hookiem a rytuałem startu (sam hook
  zmierzony, 15/15) — oraz bramki realnie zatrzymującej zamknięcie planu (punkt 6). Powód jest
  twardy i zewnętrzny wobec kodu: zainstalowany plugin to 1.1.0, więc świeża sesja mierzyłaby
  wersję bez tych mechanizmów (L-0031), a konto zapisane w poświadczeniach CLI ma wyczerpany limit
  (L-0032). Karta i prompt odnogi zaktualizowane; scenariusze G–I wymagają wersji co najmniej 1.3.0.
- **`SPEC_ARCHIWUM.md` nietknięty**, mimo że rotacja czyta ten sam dopisek o rozstrzygnięciu co
  bramki. Zbiór akceptowanych brzmień zdefiniowany w `SPEC_DZIENNIK.md`, czyli w źródle dopiska —
  obie specyfikacje zostają zgodne bez naruszania decyzji „rotacja domknięta w E2".
- **Rozdzielenie `config-protection` na rdzeń i warstwę hooka** — to E4; tutaj ruszony nie był.
- Cokolwiek z zakresu adapterów Cursora i Codexa (E5, E7).

**Do zrobienia przez człowieka:**

- **Push, `claude plugin marketplace update relai`, `claude plugin update relai@relai`, restart
  aplikacji** — bez pełnej sekwencji 1.3.0 nie działa w żadnym projekcie poza tym repo (L-0031).
  Bramka manualna planu.
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`, która
  domyka teraz punkty z E1, E2 **i** E3 (L-0032). Bramka manualna planu.
- Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update` — JiraManager jest
  pierwszym realnym adresatem reguły o decyzjach po adopcji (`CLAUDE.md` na 639 liniach).
  Bramka manualna planu.
- Uruchomić E4 (`/relai-stage`, świeża sesja **Opus**) albo którąś z dwóch odnóg — kolejność
  dowolna, odnogi nie blokują planu. *(rozstrzygnięte 2026-08-12 — uruchomiono E4)*

### 2026-08-12 — E4: rdzeń przenośny, guardrails jako skrypty, pre-commit ze skanem sekretów, RelAI 1.4.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **`docs/PRZENOSNOSC.md`** — rozpoznanie stanu faktycznego Cursora i Codexa, każda pozycja z datą
  sprawdzenia i linkiem do dokumentacji producenta; rzeczy niepotwierdzone oznaczone
  `<DO UZUPEŁNIENIA: …>` (L-0026), zero zdań pisanych z pamięci modelu. Dokument jest wejściem do
  E5 i E7. **Dwa ustalenia zmieniają obraz z planu:** Cursor ma `preToolUse` z werdyktem
  `allow | deny` i hook `sessionStart`, a Codex ma `PreToolUse` z `permissionDecision: deny`,
  `PermissionRequest` i `UserPromptSubmit` z blokadą — czyli założenie „Codex bez blokad harnessu"
  (sekcja 5 planu) jest nieaktualne. Tabela gwarancji w E5/E7 będzie listą różnic, nie listą
  braków. Dopisano też jawnie, czego nie zrobiono: rozpoznanie oparto na dokumentacji, nie na
  eksperymencie na działającej instalacji.
- **Wydzielenie rdzenia** — repozytorium ma jawną granicę. `core/` (specyfikacje, guardrails,
  narzędzia, `MANIFEST.json`, własne `README.md`), `adapters/claude-code/` (skille, komendy,
  hooki), `.claude-plugin/` zostaje w korzeniu, bo tego wymaga Claude Code, i wskazuje na adapter.
  Przeniesienie wykonane `git mv` — historia plików zachowana, treść nietknięta.
- **Skan sekretów jako czysty skrypt rdzenia** — `core/guardrails/secret-scan.js` zna wyłącznie
  tekst na wejściu i werdykt na wyjściu; jest biblioteką i CLI naraz. Hook
  `adapters/claude-code/hooks/secret-scanner.js` schudł do cienkiej warstwy: guard projektu,
  wyłuskanie treści z `tool_input`, tłumaczenie werdyktu na `permissionDecision`. Awaria `require`
  rdzenia traktowana jest jak awaria guarda — hook milknie zamiast wysypać się na stderr.
- **Git pre-commit ze skanem sekretów** — `core/guardrails/pre-commit.js` skanuje **treść
  z indeksu** (`git show :plik`), nie plik z dysku: commitowane jest to, co w indeksie.
  `core/guardrails/install-precommit.js` instaluje i odinstalowuje go jednym poleceniem, kopiując
  do `.git/hooks/` hook **i** kopię skanera — dzięki temu hook przeżyje aktualizację, przeniesienie
  albo odinstalowanie pluginu. Brak Node.js w `PATH` → odmowa z jednym zdaniem wyjaśnienia, bez
  cichej degradacji. Cudzy `pre-commit` nie jest nadpisywany.
- **Walidator spójności rdzeń↔adaptery** — `core/tools/validate-adapters.js`: pliki z manifestu
  rdzenia, ścieżki z `plugin.json`, wywołania z `hooks.json`, odwołania adaptera do rdzenia
  i zgodność numeru wersji w trzech źródłach. Mitygacja P4 (dryf rdzenia i adapterów).
- **`config-protection` świadomie NIE rozdzielony** — powód zapisany wprost w `core/README.md`:
  sama reguła jest przenośna, ale jej egzekwowanie sprowadza się do werdyktu `ask` w protokole
  hooków, czyli do własności narzędzia. Wyciągnięcie samego rozpoznawania „czy plik jest chroniony"
  dałoby moduł bez drugiego konsumenta i rozbiło bramkę stojącą dziś w jednym miejscu. Wraca do
  rozważenia w E5, gdy z próby będzie wiadomo, czy `preToolUse` Cursora potrafi odpowiedzieć
  „zapytaj człowieka" przy zapisie pliku.
- **Dokumenty użytkownika:** `README.md` — nowa sekcja o strukturze z granicą rdzeń/adapter plus
  instalacja pre-commita po polsku; `core/README.md` — gdzie przebiega granica i co świadomie
  zostało poza rdzeniem; `templates/SPEC_KOMENDY.md` — pre-commit jako pozycja **z warunkiem**
  („piszesz tylko, gdy hook jest w tym projekcie zainstalowany"), nigdy jako zachowanie, które samo
  się włączyło (L-0002); `docs/KOMENDY.md` — akapit „Do włączenia ręcznie";
  `commands/relai-update.md` — stan docelowy 1.4.0 i jawne zdanie, że aktualizacja pre-commita
  **nie instaluje**. Tabela komend nie urosła.
- **Wersja 1.4.0** w obu manifestach, `core/MANIFEST.json`, obu skillach, `/relai-update`,
  `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README i markerze tego repo.

**Zweryfikowane — jak dokładnie:**

- **Dziesięć hooków po przeniesieniu — 18/18 scenariuszy zgodnych, 10/10 hooków pokrytych**
  (instrument `porownanie.js`). Metoda: ten sam payload JSON na stdin realnego procesu (L-0017),
  raz w drzewie sprzed etapu (`git worktree` na HEAD — układ z `hooks/` w korzeniu), raz w drzewie
  po etapie; porównywany kod wyjścia razem z wyjściem. `secret-scanner` **blokuje**
  (`permissionDecision: deny`), `config-protection` zwraca `ask` dla pliku ustawień i dla sekcji
  niemutowalnej, siedem pozostałych zachowuje swoje wyjścia co do znaku. Jedyna różnica —
  wielokropek `…` zamieniony na `...` przy przenoszeniu etykiet wzorców do rdzenia, zgodnie
  z L-0016 — znormalizowana jawnie w instrumencie z komentarzem (→ L-0040).
- **Zestawy z E3 przeszły bez zmiany wyniku:** `journal-signature` **9/9**, `session-context`
  (rozjazd stanu) **15/15** — te same instrumenty co w E3, przestawione wyłącznie na nową ścieżkę
  hooków.
- **Specyfikacje przeniesione bajt w bajt — 30/30** plików `core/templates/`, sumy SHA-256 po
  normalizacji do LF (L-0033) identyczne przed przeniesieniem i po nim. Sumy liczone **w chwili
  przeniesienia**, przed późniejszym podbiciem wersji w trzech specyfikacjach — to jest zamierzona
  zmiana treści, nie skutek przenoszenia.
- **R8 nienaruszone po zmianie ścieżek:** `session-context` prowizjonuje `.claude/relai/templates/`
  z `core/templates/` — 30 plików w źródle, 30 w projekcie testowym, `SPEC_ARCHIWUM.md`
  i katalog `HTML_PLAN/` na miejscu.
- **Skan poza hookiem — 5/5:** plik z testowym kluczem → `SEKRET` i kod wyjścia 1, plik czysty →
  `BRAK` i kod 0, wartość sekretu **niezacytowana** w wyjściu. Zero ładowania czegokolwiek
  z protokołu hooków.
- **Pre-commit — 15/15** (repozytorium testowe poza tym repo). `git commit` z kluczem AWS w indeksie
  → kod 1 i `git rev-parse HEAD` identyczny przed i po (dowód negatywny); ten sam commit po
  usunięciu sekretu przechodzi; deinstalacja usuwa oba pliki, a po niej ten sam commit z sekretem
  **przechodzi** — dowód, że test nie jest pusty; cudzy hook nietknięty; poza repozytorium gita
  instalator odmawia kodem 2.
- **Walidator — dowód pozytywny i negatywny:** układ spójny → kod 0; celowo zepsute odwołanie
  adaptera do nieistniejącego pliku rdzenia → nazwane znalezisko i kod 1.
- **Manifesty:** `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with
  warnings", jedyne ostrzeżenie to znane root `CLAUDE.md` (L-0003); `marketplace.json` → „Validation
  passed" bez ostrzeżeń. Nowy układ katalogów sprawdzony **na kopii przed ruszeniem oryginału**,
  z dowodem negatywnym (ścieżka nieistniejąca → „Path not found … The runtime loader will report
  this as a load failure") → L-0038.
- **Wersja:** `git grep -n "1\.3\.0"` po podbiciu — wszystkie pozostałe trafienia historyczne
  („od 1.3.0", „nowe w 1.3.0", „przed 1.3.0", wpisy dziennika, zamrożony plan, prompty etapów 1–4).
- **Czysto po testach:** wszystkie repozytoria i projekty testowe powstały w katalogu tymczasowym
  systemu; `git status --short` pokazuje wyłącznie zamierzone zmiany i pięć nowych ścieżek rdzenia.

**Świadomie odłożone:**

- **Rozdzielenie `config-protection`** — decyzja opisana wyżej i w `core/README.md`, wraca w E5.
- **Wydzielenie opisów procesu do osobnych plików rdzenia** — proces mieszka dziś
  w specyfikacjach i w skillach adaptera. Przepisanie skilli na format, którego żaden adapter
  jeszcze nie czyta, dałoby drugie źródło prawdy; rozstrzygnięcie zapada w E5, na realnym
  adapterze.
- **Instalacja pre-commita w tym repozytorium** — hook działa i jest zmierzony, ale instalacja to
  jawna czynność człowieka; RelAI nie podkłada hooków gita sam.
- **Eksperyment na działającej instalacji Cursora i Codexa** — `PRZENOSNOSC.md` opisuje
  dokumentację producentów; potwierdzenie zachowań należy do E5 i E7, tak jak zachowania RelAI
  mierzy się sesją, nie zapisem (L-0005).
- Cokolwiek z zakresu adapterów Cursora i Codexa — ani jeden ich plik nie powstał w tym etapie.

**Do zrobienia przez człowieka:**

- **Push, `claude plugin marketplace update relai`, `claude plugin update relai@relai`, restart
  aplikacji** — bez pełnej sekwencji 1.4.0 nie działa w żadnym projekcie poza tym repo (L-0031).
  Ten etap zmienia **układ katalogów pluginu**, więc pierwsza sesja po restarcie jest zarazem
  sprawdzianem, czy Claude Code znajduje skille i komendy pod nowymi ścieżkami — walidator manifestu
  to potwierdza, ale realne wczytanie potwierdza dopiero aplikacja. Bramka manualna planu.
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`
  (L-0032). Bramka manualna planu.
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna planu.
- **Decyzja o instalacji pre-commita** — w tym repozytorium i w projektach roboczych:
  `node core/guardrails/install-precommit.js <projekt>`. Bramka manualna planu.
- Uruchomić E5 (`/relai-stage`, świeża sesja **Opus**) albo którąś z dwóch odnóg.

### 2026-08-12 — E5: adapter Cursora — rozpoznanie próbą, reguły zawsze-w-kontekście, skan sekretów, RelAI 1.5.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- **Rozpoznanie Cursora domknięte próbą, nie dokumentacją.** Sekcja 1 `docs/PRZENOSNOSC.md` nie ma
  już ani jednej pozycji `<DO UZUPEŁNIENIA>`; każda ma źródło z jedną z trzech etykiet:
  `[dokumentacja]`, `[kod produktu]` (odczyt z wydanego build'u Cursora 3.7.12) i `[próba]`
  (realna sesja `cursor-agent` 2026.08.11). Rozstrzygnięte: ścieżki komend i skilli, treść payloadu
  `preToolUse`, kształt odpowiedzi `sessionStart`, brak egzekwowanego `ask`, odczyt plików spoza
  katalogu roboczego, brak odpowiednika `AskUserQuestion`. Wyszła też rzecz spoza listy pytań:
  Cursor czyta **`.claude/commands/`, `.claude/skills/` i `.claude/settings.json`**, a `CLAUDE.md`
  traktuje jak regułę za przełącznikiem `claudeMdEnabled` (domyślnie wyłączonym).
- **`adapters/cursor/` — trzy reguły `alwaysApply: true`** (po angielsku, Aneks A): `relai-core`
  (rytuał startu, definicja ukończenia, reakcja na korektę, zamknięcie sesji, frazy, brak
  `AskUserQuestion`), `relai-planning` (plan vs miniplan, zamrożenie, etap, rytuał „Na koniec",
  sygnał odchylenia, odnogi), `relai-guardrails` (sekrety, ochrona konfiguracji jako reguła,
  profile, bramka snapshotu, rotacja). Podział na trzy pliki wynika z limitu 500 linii na regułę.
- **Komendy i skille bez przepisywania.** Zmierzone, że Cursor czyta ten sam format, więc instalator
  **kopiuje** dziesięć komend i dwa skille z adaptera Claude Code do `.cursor/`. Jedno źródło
  w repozytorium, kopia w projekcie — zero trzeciego formatu. To domyka odłożone w E4 pytanie
  o „opisy procesu w osobnych plikach rdzenia": nie powstają.
- **Skan sekretów w protokole Cursora** — `adapters/cursor/hooks/secret-scanner.js`: guard projektu,
  katalog roboczy z `workspace_roots`, wyłuskanie `tool_input.content`, werdykt
  `{"permission":"deny"}`. Logika skanu wołana z rdzenia, nie przepisana.
- **Opakowanie powłoki dla guardraila** (`secret-scanner.cmd` / `.sh`) — odpowiedź na zmierzoną
  cichą degradację Cursora: bez interpretera opakowanie kończy się kodem 2, czyli blokadą zapisu
  z komunikatem. Świadoma rezygnacja to `--bez-skanu` przy instalacji (L-0043).
- **Kontekst startu sesji** — `adapters/cursor/hooks/session-context.js` w zdarzeniu `sessionStart`
  z odpowiedzią `additional_context`: data dnia, rozjazd wersji, siatka promptu etapowego, rozjazd
  stanu, nieznany autor, ustawienia globalne, prowizjonowanie specyfikacji do
  `.claude/relai/templates/` (R8 rozwiązane tą samą ścieżką co w Claude Code).
- **`core/process/session-signals.js`** — rozpoznania startu sesji wydzielone do rdzenia i wołane
  przez **oba** adaptery. Bez tego kroku Cursor i Claude Code trzymałyby tę samą logikę w dwóch
  miejscach (ryzyko P4). Dwa hooki adaptera Claude Code (`session-context`, `secret-scanner`)
  przepięte na rdzeń bez zmiany choćby jednego komunikatu.
- **Instalator `adapters/cursor/install.js`** — idempotentny, ze spisem `relai-install.json`,
  scalaniem `hooks.json` bez ruszania cudzych wpisów, deinstalacją i flagą `--bez-skanu`.
- **Walidator rozszerzony:** zna dwa adaptery, sprawdza pliki `process/` i — nowość — odwołania do
  rdzenia w **kodzie** adapterów, nie tylko w manifeście.
- **Dokumenty użytkownika:** `adapters/cursor/README.md` (PL — instalacja, co się dzieje, praca
  naprzemienna, zespół bez Node.js), tabela gwarancji w `docs/PRZENOSNOSC.md` sekcja 3 (mechanizmy
  + wszystkie dziesięć komend + praca naprzemienna), `README.md` (sekcja o Cursorze, struktura repo,
  wymagania), `core/README.md` (granica, rozstrzygnięcie sprawy `config-protection`),
  `SPEC_KOMENDY.md` (zakres 1.5.0 z warunkiem — punkt piszesz tylko w projekcie z adapterem).
- **Wersja 1.5.0** w obu manifestach, `core/MANIFEST.json`, obu skillach, `/relai-update`,
  `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, `SPEC_RAPORT_ADOPCJI`, README i markerze tego repo.
- **Rotacja rejestru lekcji** (rytuał zamknięcia sesji): 24 najstarsze lekcje `L-0001 … L-0024`
  przeniesione do `docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md`, w żywym pliku została
  linia-odsyłacz. Rozmiar: 57 116 B → 35 424 B, lekcji w żywym pliku: 44 → 20. Suma kontrolna
  przeniesionej treści `bd5f9050dc7e7278` zgodna w obu fazach. Sekcja „Zasady aktywne" nietknięta
  bajt w bajt.
- **Rotacja dziennika NIE została wykonana**, mimo że plik przekracza próg (185 KB przy 150 KB).
  Powód: zakres musi być ciągły od najstarszego wpisu, a najstarszy wpis ma w sekcji „Do zrobienia
  przez człowieka" pozycje oznaczone dopiskiem „*(zrobione …)*", którego `SPEC_ARCHIWUM.md`
  **nie wymienia** jako brzmienia rozstrzygnięcia — specyfikacja zna wyłącznie „*(rozstrzygnięte
  …)*". Mechanizm zachował się poprawnie (nie ruszył wpisu, którego nie umie uznać za zamknięty),
  ale rotacja dziennika będzie stała, dopóki lista akceptowanych brzmień nie zostanie uzupełniona
  (L-0035). Decyzja należy do człowieka — pozycja niżej.

**Zweryfikowane — jak dokładnie:**

- **Adapter Claude Code niezmieniony — 80/80 zgodnych** (instrument `porownanie-hookow.js`, metoda
  L-0040): dziesięć hooków po osiem scenariuszy, ten sam payload na stdin realnego procesu, raz
  w drzewie sprzed etapu (`git worktree --detach ebafa7c`), raz w bieżącym. Jedyna zamierzona
  różnica — numer wersji pluginu w komunikacie o rozjeździe — znormalizowana jawnie w instrumencie,
  na fixturze z markerem 0.9.0, żeby komunikat padał w obu drzewach. **Dowód, że test nie jest
  pusty:** podmiana jednego słowa w komunikacie `secret-scanner` dała 79/80 i nazwała różnicę.
- **Skan sekretów w Cursorze blokuje — na żywej sesji.** `cursor-agent -p` w projekcie testowym:
  polecenie zapisu pliku z testowym kluczem AWS skończyło się odmową z komunikatem RelAI,
  a `Test-Path` potwierdził, że plik **nie powstał**. Ta sama próba z treścią
  `process.env.AWS_ACCESS_KEY_ID` utworzyła plik i hook **nie odezwał się** (dowód negatywny).
  Powtórzone po przejściu na opakowanie powłoki: czysty zapis przeszedł, zapis klucza zablokowany.
- **Skan wołany z rdzenia, nie przepisany:** `git grep -nE "AKIA|BEGIN .*PRIVATE|ghp[_-]|eyJ"` po
  `adapters/cursor/` — zero trafień.
- **Poziom procesu, bez agenta:** hook Cursora uruchomiony realnym procesem z payloadem
  `preToolUse` → `permission: deny` dla sekretu, puste wyjście dla treści czystej, puste wyjście
  poza projektem RelAI (trzy scenariusze). Hook `sessionStart` → poprawny JSON
  z `additional_context`.
- **Opakowanie powłoki — 4 scenariusze:** z Node.js werdykty identyczne jak z samego hooka
  (deny albo cisza); z `RELAI_NODE` wskazującym nieistniejący interpreter — kod **2** i komunikat
  na stderr dla obu treści.
- **Reguły i kontekst docierają do modelu:** reguła `.mdc` z `alwaysApply: true` wykonana
  w świeżej sesji na prompcie, który jej nie dotyczył; token wstrzyknięty przez `sessionStart`
  zacytowany przez agenta; odczyt pliku spoza katalogu roboczego udany (podał wartość `version`
  z `core/MANIFEST.json`).
- **Komendy i skille:** komenda testowa z `.cursor/commands/` i z `.claude/commands/` wywołana jako
  `/nazwa` wykonała swoją treść; skill z `.cursor/skills/` i z `.claude/skills/` wywołany z nazwy
  — również. Realna `/relai-help` w projekcie z zainstalowanym adapterem wykonała procedurę,
  przeczytała `SPEC_KOMENDY.md` z `.claude/relai/templates/` i zatrzymała się na pytaniu do
  człowieka.
- **Instalacja na czystym katalogu:** 15 plików, 30 specyfikacji i dwa wpisy w `hooks.json`; cudzy
  wpis `afterFileEdit` nietknięty. Deinstalacja usunęła dokładnie 15 plików, zostawiła cudzy hook,
  `docs/` i cache. Ponowna instalacja nie zdublowała wpisów. Flaga `--bez-skanu`: zero wpisów
  `preToolUse` i głośny komunikat.
- **Walidator:** układ spójny → kod 0 przy **dwóch** adapterach (7 odwołań z kodu, 3 plus 3
  z manifestu); celowo zepsute odwołanie adaptera Cursora do nieistniejącego pliku rdzenia → kod 1
  z nazwanym znaleziskiem, po przywróceniu znowu 0 (dowód negatywny).
- **Manifesty:** `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with
  warnings", jedyne ostrzeżenie to znane root `CLAUDE.md` (L-0003).
- **Wersja:** `git grep -n "1\.4\.0"` po podbiciu — pozostałe trafienia są historyczne („od 1.4.0",
  „nowość 1.4.0", wpisy dziennika, zamrożony plan, prompty etapów 1–4).
- **Czysto po testach:** wszystkie projekty próbne i drzewo porównawcze powstały poza
  repozytorium; `git status --short` pokazuje wyłącznie zamierzone zmiany oraz dwa nowe katalogi
  (`adapters/cursor/`, `core/process/`).

**Świadomie odłożone:**

- **Rozdzielenie `config-protection` na rdzeń i adapter** — zamknięte odmownie, z powodem
  zmierzonym: Cursor nie egzekwuje `ask`, więc drugiego konsumenta nadal nie ma. Zapisane
  w `core/README.md`.
- **Przepięcie pozostałych ośmiu hooków Claude Code na rdzeń** — każdy ma własną, dwunastolinijkową
  kopię `isGuest`. Nie mają bliźniaka w Cursorze, więc dryf nie ma się z czym rozjechać; wraca,
  gdy któryś dostanie odpowiednik w drugim narzędziu.
- **Pomiar adaptera w aplikacji Cursora (GUI)** — cały pomiar tego etapu przeszedł przez CLI
  `cursor-agent`. Zachowania GUI (w tym `beforeReadFile` i dostęp poza katalogiem roboczym)
  potwierdzi pilotaż E6.
- **Pełne przejście dziesięciu komend na żywym projekcie w Cursorze** — zmierzono ładowanie
  i start procedur oraz jedną komendę w całości (`/relai-help`). Reszta to zakres E6.
- Cokolwiek z zakresu adaptera Codeksa — ani jeden jego plik nie powstał (E7).

**Do zrobienia przez człowieka:**

- **Push, `claude plugin marketplace update relai`, `claude plugin update relai@relai`, restart
  aplikacji** — bez pełnej sekwencji 1.5.0 nie działa w żadnym projekcie poza tym repo (L-0031).
  Bramka manualna planu, nadal otwarta z E4.
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG` (L-0032).
  Bramka manualna planu.
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna planu.
- **Decyzja o instalacji pre-commita** (`node core/guardrails/install-precommit.js <projekt>`).
  Bramka manualna planu.
- **Osoba z zespołu do pilotażu E6** — etap wymaga realnego projektu prowadzonego w Cursorze przez
  kogoś spoza tego projektu. **Nowa bramka manualna.**
- **Decyzja o dopiskach rozstrzygnięcia w `SPEC_ARCHIWUM.md`** — czy „*(zrobione …)*" i podobne
  brzmienia mają być uznawane za rozstrzygnięcie na równi z „*(rozstrzygnięte …)*". Do czasu tej
  decyzji rotacja dziennika w tym projekcie stoi, a plik rośnie. Zmiana dotyka specyfikacji
  rdzenia, więc nie robię jej przy okazji zamykania sesji.
- Uruchomić E6 (`/relai-stage`, świeża sesja **Opus**) albo którąś z dwóch odnóg.

### 2026-08-13 — E6: uzgodnienie pilotażu Cursora (przed startem)

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Rozstrzygnięta bramka manualna „osoba z zespołu do pilotażu". Osoby spoza projektu nie ma;
  wybrany **wariant zastępczy z promptu etapu**: pilotaż prowadzi **autor projektu**.
- Uzgodnienie pilotażu, spisane **przed** jego rozpoczęciem:

  | Co | Ustalenie |
  |---|---|
  | Kto prowadzi | Łukasz — autor RelAI (nie osoba z zespołu) |
  | Projekt | **nowy projekt testowy** (czysty folder) — scenariusz „inicjalizacja od zera" |
  | Narzędzie | **aplikacja Cursora z interfejsem** — to jest główny zysk wobec E5, gdzie cały pomiar przeszedł przez CLI `cursor-agent` |
  | Model | **`auto`** — te same warunki modelowe co w pomiarze E5 |
  | Termin | 2026-08-13, ta sesja |
  | Rola sesji Claude Code | zbiera wyniki i tarcia; instalację i klikanie wykonuje człowiek, żeby instrukcja była testowana, a nie omijana |

**Zweryfikowane:** nic jeszcze — to wpis otwierający pilotaż. Wyniki sześciu kroków scenariusza,
rejestr tarć i rozstrzygnięcie P1/P2 trafią do wpisu zamykającego E6.

**Świadomie odłożone:**

- **Pilotaż na realnym projekcie roboczym** (JiraManager, PolyFlow) — odrzucony na rzecz projektu
  testowego; realizm scenariusza „dołączenie struktury do żywego projektu" pozostaje niezmierzony
  w Cursorze.

**Do zrobienia przez człowieka:**

- **Kryterium akceptacyjne planu dla E6 — „ktoś inny niż autor prowadzi projekt RelAI w Cursorze" —
  pozostaje NIESPEŁNIONE.** Ten pilotaż go nie zastępuje; obniżenie kryterium jest świadome
  i zapisane. Decyzja, czy plan zamyka E6 mimo to, czy czeka na osobę z zespołu, należy do człowieka
  przy zamykaniu etapu.
- **Ryzyko P2 (zależność reguł zawsze-w-kontekście od modelu) nie zostanie ruszone** — pilotaż
  powtarza model `auto` z E5. Zamknięcie albo obniżenie P2 wymaga próby na modelu innym niż
  mierzony.

### 2026-08-17 — E6: pilotaż Cursora (wariant zastępczy), wersja 1.5.1

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Pilotaż przeprowadzony** na projekcie testowym `ProbaCursorE6` w **aplikacji Cursora
  z interfejsem** — pierwszy pomiar adaptera poza CLI. Uzgodnienie spisane przed startem (wpis
  z 2026-08-13). Trzy modele w jednym projekcie: Composer/`auto` (inicjalizacja, plan), **Grok 4.6**
  (cały etap E1), Opus 5 przez Claude Code (przegląd statusu, praca naprzemienna).
- **Sześć kroków scenariusza akceptacyjnego przeszło**, każdy z zapisanym wynikiem (niżej).
- **Poprawka rdzenia — fałszywy alarm skanera sekretów.** `core/guardrails/secret-scan.js`
  dostał `TYPE_TOKEN_RE`: adnotacja typu zakończona nawiasem przestaje wyglądać jak wartość.
  Wersja **1.5.1** w czterech źródłach (`core/MANIFEST.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `adapters/cursor/README.md`) i w markerze tego projektu.
- **Poprawki dokumentów:** licznik specyfikacji („20 specyfikacji + szablon HTML = 30 plików"
  zamiast „30 specyfikacji") w `adapters/cursor/README.md`, w etykiecie instalatora i w tabeli
  gwarancji; format odpowiedzi przy pytaniach tekstowych dopisany do `relai-core.mdc`.
- **Tabela gwarancji zaktualizowana wynikiem pilotażu** — trzy wiersze mechanizmów i wiersz
  `/relai-stage` mają datę 2026-08-17 i treść z pomiaru, nie z zapowiedzi.
- **Odnoga `REKOMENDACJA_MODELU`** założona (karta + prompt + linia w `STATUS.md`).

**Zweryfikowane — jak dokładnie:**

| Krok scenariusza | Wynik |
|---|---|
| a) start sesji | W folderze bez struktury `relai-core` wywołał się sam, rozpoznał brak dokumentów, **nie** zainicjalizował nic bez zgody. Po inicjalizacji, w świeżym czacie: rytuał wykonany bez proszenia (pięć plików przeczytanych, akapit „gdzie jesteśmy") |
| b) inicjalizacja | Dokładnie trzy pytania, potem `CLAUDE.md`, `README.md` i sześć dokumentów w `docs/`; marker `Wersja RelAI: 1.5.0 · zainicjowano: 2026-08-13`; jeden commit `chore: initialize RelAI project structure` — zgodny ze specyfikacją (bez pytania, część inicjalizacji) |
| — sonda hooka | Model zacytował **dosłownie** blok `[RelAI session-context]`: datę dnia, wymuszenie rytuału, informację o cache'u specyfikacji i **treść ustawień globalnych z `~/.claude/relai/`** — czyli hook dowozi w GUI warstwę, której sesja sama nie widzi (L-0010). Obcy hook (superpowers) wstrzykiwał się obok, bez kolizji |
| c) plan | Powstał **dokument**, nie odpowiedź w czacie: `docs/plany/LOGOWANIE/PLAN.html` (204 KB, **sześć fontów w base64, zero odwołań do CDN**) + `STATUS.md` z czterema etapami; linia „Aktywny plan" dopisana do `CLAUDE.md`. Specyfikacje czytane z lokalnego cache'u (L-0012 domknięte dla Cursora). Pytanie o format i model padło **raz** (L-0006) |
| d) etap | Karta potwierdzenia zatrzymała sesję i **jako pierwszą rzecz** zgłosiła rozjazd modelu. Po zgodzie Grok 4.6 dowiózł E1 w całości: 10/10 punktów weryfikacji, `STATUS.md` z `ZREALIZOWANY`, wpis w dzienniku z podpisem, **`PROMPT_ETAP_2.md` wygenerowany** (D-34), dwie bramki manualne wypisane w `STATUS.md` planu (sekcja z E3 działa u obcego modelu). Zakresu E2 i E3 nie tknął |
| e) próba zapisu sekretu | Dwuwarstwowo. Zwykła prośba: **odmówiła reguła**, hook nie zdążył. Prośba jawnie proszącą o próbę mimo reguły: **hook `preToolUse` zwrócił `permission: deny`**, plik `lib/aws.ts` nie powstał, `git grep` po prefiksie klucza AWS bez trafień (dowód negatywny). Model nie szukał obejścia przez powłokę |
| f) zamknięcie sesji | Wpis do dziennika z podpisem `RelAI (Grok) + Lukasz`, `STATE.md` nadpisany, commit zaproponowany i **niewykonany** bez zgody |
| praca naprzemienna | Ten sam projekt w Claude Code po sesjach Cursora: jeden dziennik z podpisami trzech modeli, `STATE` ↔ `STATUS` ↔ `CLAUDE.md` zgodne, **marker wersji nietknięty** przez samo otwarcie, żadne narzędzie nie podbiło wersji struktury |

- **Poprawka skanera zmierzona, nie zadeklarowana.** Przed: sygnatura funkcji haszującej hasło ze
  zwracanym typem → `SEKRET` (fałszywy alarm); sygnatura z przecinkiem, formularz HTML → `BRAK`.
  Po: cztery fałszywe alarmy zgaszone, cztery realne sekrety (hasło, klucz AWS oraz wartości
  zaczynające się od nazw typów) nadal wykryte.
- **Instrument porównawczy adapterów** (`scratchpad/porownanie-adapterow.js`): pięć próbek, jeden
  przebieg, oba hooki — **5/5 zgodnych werdyktów**. Różnice protokołów znormalizowane jawnie
  (porównywany werdykt blokady, nie kształt odpowiedzi) — L-0040.
- `node core/tools/validate-adapters.js` → kod **0**, „numery wersji: 3 zrodel, wartosc 1.5.1".

**Rejestr tarć** (w kolejności zgłoszenia, z oceną):

| # | Tarcie | Ocena | Co z tym zrobiono |
|---|---|---|---|
| 1 | Pytania startowe proszą o odpowiedź w formacie `1a, 2a`, a opcje numerują cyframi | defekt adaptera (brak wzorca formatu przy pytaniu tekstowym) | naprawione w `relai-core.mdc` |
| 2 | „Trzydzieści specyfikacji" — liczba zawyżona o dziesięć, licznik obejmuje pliki szablonu HTML | defekt dokumentu + etykiety instalatora | naprawione w trzech miejscach |
| 3 | Skaner sekretów blokuje sygnaturę funkcji haszującej hasło; agent obszedł blokadę, przemianowując parametr, i zapisał to jako regułę projektu | **defekt rdzenia** | naprawione (1.5.1), lekcja L-0045 |
| 4 | Guardrail blokuje własny materiał dowodowy: próbkę do testu i przykład w komentarzu do łatki | świadomy koszt mechanizmu | bez zmiany kodu, lekcja L-0046 |
| 5 | Kontrola modelu mówi klasami („najsilniejszy"), a w Cursorze nie wiadomo, który to model | brak funkcji | odnoga `REKOMENDACJA_MODELU` |
| 6 | Projekt prowadzony Cursorem dostaje `CLAUDE.md`, czytany tam **tylko dlatego, że reguła każe**; natywnie czytany jest `AGENTS.md` | brak funkcji, decyzja projektowa | do rozstrzygnięcia przez człowieka (niżej) |
| 7 | Wpisy podpisane `RelAI (Composer)` — nazwa agenta zamiast modelu | świadoma różnica narzędzi | zostaje, opisane |
| 8 | Sonda hooka przed inicjalizacją nic nie pokazała | nie defekt — warunek milczenia hooka | lekcja L-0047 |

**Ryzyka:**

- **P1** — część sekretowa Cursora **zamknięta dowodem z aplikacji** (deny + dowód negatywny na
  modelu spoza Anthropic). Ryzyko zostaje otwarte z zawężonym powodem: brak egzekwowanego `ask`
  w Cursorze i niezmierzony Codex. Poziom bez zmiany: średni.
- **P2** — **obniżone do niskiego dla Cursora**: model spoza Anthropic wykonał pełny rytuał
  z reguł zawsze-w-kontekście, łącznie z granicą zakresu i generacją promptu następnego etapu.
  Otwarte już tylko dla Codeksa (E7).

**Świadomie odłożone:**

- **Kryterium akceptacyjne planu dla E6 — „ktoś inny niż autor" — pozostaje niespełnione.** Pilotaż
  poprowadził autor; obniżenie kryterium zapisane przed startem i powtórzone tutaj.
- **Pilotaż na realnym projekcie roboczym** (JiraManager, PolyFlow) — scenariusz „dołączenie
  struktury do żywego projektu" w Cursorze pozostaje niezmierzony.
- **Zachowania GUI poza zakresem scenariusza** — `beforeReadFile` i dostęp poza katalogiem
  roboczym nadal bez próby.
- **Osiem pozostałych komend** — pełne przejście procedury zmierzone dla `/relai-stage`
  i `/relai-help`; reszta nadal tylko start procedury.
- **Rekomendacja modelu per narzędzie** — odnoga, nie ten etap.
- Cokolwiek z adaptera Codeksa — ani jeden jego plik nie powstał (E7, L-0002).

**Do zrobienia przez człowieka:**

- **Rozstrzygnąć, czy plikiem głównym projektu ma zostać `AGENTS.md`** (natywny dla Cursora
  i Codeksa) z `CLAUDE.md` jako wskaźnikiem, odwrotnie, czy zostaje stan dzisiejszy jako świadoma
  różnica. Decyzja przesądza kształt E7; do czasu rozstrzygnięcia `CLAUDE.md` w projektach
  Cursora działa na instrukcji, nie na mechanizmie.
- **Sekwencja wydania 1.5.1**: push → `claude plugin marketplace update relai` → `claude plugin
  update relai@relai` → **restart aplikacji** (L-0031); dla Cursora — ponowne uruchomienie
  `adapters/cursor/install.js` w projektach z adapterem. Bramka manualna planu, otwarta od E4.
  **Uwaga z tego etapu:** guardrail tej sesji pochodził z zainstalowanej wersji 1.1.0 i blokował
  łatkę do samego siebie — do restartu obowiązuje stary skaner.
- **Projekty z zainstalowanym gitowym pre-commitem wymagają ponownej instalacji** — instalator
  kopiuje skaner do `.git/hooks/`, więc poprawka 1.5.1 nie dotrze tam sama.
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`.
  Bramka manualna planu.
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna.
- **Decyzja o instalacji pre-commita.** Bramka manualna.
- **Czy projekt testowy `ProbaCursorE6` zostaje** (materiał do E7 i do odnogi `POMIAR_ODNOG`), czy
  idzie do kasacji. Ma niezacommitowany dorobek E1 i dwie własne bramki (testy, kierunek wizualny).

### 2026-08-17 — Zamknięcie sesji

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Etap E6 domknięty rytuałem: `STATUS.md` (E6 ZREALIZOWANY, E7 GOTOWY DO STARTU, bramka „osoba
  z zespołu" rozstrzygnięta), wpis merytoryczny, `STATE.md`, `CLAUDE.md`, `PROMPT_ETAP_7.md`.
- Commit `eabdbf6` (`fix: secret scanner no longer flags TypeScript type annotations`) i **push**
  do `github.com/nowilus/relai`. Katalog roboczy czysty przed commitem i po nim.

**Zweryfikowane — jak dokładnie:**

- `git status --short` po pushu: pusto. `git log` pokazuje `eabdbf6` nad `af329e6` (1.5.0).
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed" z jedynym znanym
  ostrzeżeniem o root `CLAUDE.md` (L-0003). `node core/tools/validate-adapters.js` → kod 0,
  wersja „1.5.1" spójna w trzech źródłach.
- **Rotacja dokumentów: próg przekroczony, ale nie ma czego przenieść.** `DZIENNIK.md` ma 196 KB
  przy progu 150 KB; zakres do archiwum musi być ciągły i zaczyna się od najstarszego wpisu, a ten
  ma w „Do zrobienia przez człowieka" pozycję z adnotacją „*(zrobione 2026-08-07 …)*". Specyfikacja
  `SPEC_ARCHIWUM.md` uznaje za rozstrzygnięcie wyłącznie brzmienie „*(rozstrzygnięte …)*", więc
  wpis jest nietykalny i blokuje cały zakres. Mechanizm nie jest zepsuty — jest zatkany na
  nierozstrzygniętej decyzji z 2026-08-12. `LEKCJE.md`: 40 KB i 47 zasad aktywnych — poniżej progu
  wielkości, na granicy progu liczby lekcji. `STATE.md`: 161 linii przy progu 300.

**Świadomie odłożone:**

- **Rotacja dziennika** — do czasu decyzji o akceptowanych brzmieniach dopisku rozstrzygnięcia.
  Plik rośnie dalej; przy tym tempie zatkanie zacznie kosztować kontekst każdej sesji.
- Trzy odnogi (`OPIS_REPO`, `POMIAR_ODNOG`, `REKOMENDACJA_MODELU`) — każda z gotowym promptem.

**Do zrobienia przez człowieka:**

- **Rozstrzygnąć dopisek rozstrzygnięcia w `SPEC_ARCHIWUM.md`**: czy „*(zrobione …)*" i podobne
  brzmienia liczą się na równi z „*(rozstrzygnięte …)*". Bez tego rotacja dziennika stoi. Zmiana
  dotyka specyfikacji rdzenia, więc nie robię jej przy okazji zamykania sesji (powtórzenie
  z 2026-08-12).
- Pozostałe pozycje bez zmian wobec wpisu E6 z dzisiaj: decyzja `AGENTS.md` / `CLAUDE.md`,
  sekwencja wydania 1.5.1, ponowna instalacja pre-commita tam, gdzie już jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los projektu testowego `ProbaCursorE6`.

### 2026-08-17 — Decyzja D-86: plik główny projektu

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Zamrożona **D-86**: projekt z adapterem obcego narzędzia (Cursor, Codex) ma **`AGENTS.md`** jako
  plik główny, a `CLAUDE.md` zostaje w nim wskaźnikiem; projekt prowadzony wyłącznie w Claude Code
  zostaje bez zmian. Kolizję rozstrzyga obecność adaptera, nie narzędzie bieżącej sesji.
- Tabela „Decyzje zmienione" w rejestrze: D-10 i D-11 uzupełnione przez D-86.
- `PROMPT_ETAP_7.md`: blokująca bramka zamieniona w rozstrzygnięcie — E7 nie pyta o to ponownie
  i dostaje wprost zakres wdrożenia (instalator Codeksa, instalator Cursora, `SPEC_CLAUDE_MD.md`).
- `STATE.md` zaktualizowany: pozycja „do rozstrzygnięcia" zamieniona na zapis decyzji.

**Zweryfikowane — jak dokładnie:** decyzja zapisana w dwóch miejscach rejestru (wpis D-86 i wiersz
tabeli zmian), a prompt etapu E7 nie zawiera już zdania nakazującego zatrzymanie się na tym pytaniu.
Wdrożenia nie ma i celowo nie było — należy do E7.

**Świadomie odłożone:**

- **Wdrożenie D-86** w całości: instalator Cursora nadal zakłada wyłącznie `CLAUDE.md`, więc
  projekty z adapterem Cursora (w tym `ProbaCursorE6`) mają dziś układ sprzed decyzji.

**Do zrobienia przez człowieka:**

- Pozycje bez zmian wobec dwóch wcześniejszych wpisów z dzisiaj: dopisek rozstrzygnięcia
  w `SPEC_ARCHIWUM.md` (rotacja dziennika stoi), sekwencja wydania 1.5.1, ponowna instalacja
  pre-commita, `claude /login`, `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`.

### 2026-08-17 — Rotacja dziennika odblokowana, wersja 1.5.2

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **`SPEC_ARCHIWUM.md` — rozstrzygnięty dopisek rozstrzygnięcia.** Pozycja „Do zrobienia przez
  człowieka" jest zamknięta, gdy ma **rdzeń z zamkniętej listy** (`rozstrzygni`, `zrobion`,
  `zaakceptowan`, `domkni`, `wykonan`, `anulowan`) **plus datę** `RRRR-MM-DD`; forma gramatyczna
  dowolna. Jawnie nie liczą się: `czeka`, `w toku`, `odłożone`, `zaplanowane`, `przypomnieć`,
  `do sprawdzenia`. Adnotacja bez daty to komentarz, nie zamknięcie. Wersja **1.5.2** w czterech
  źródłach i w markerze projektu.
- **Cztery decyzje zaległe z dziennika** rozstrzygnięte przez człowieka: rejestr `DECYZJE.md`
  zostaje historyczny (format specyfikacji obowiązuje nowe wpisy); sekcja „Weryfikacja" zostaje
  wyłącznie w prompcie etapowym; `config-protection` nie pyta przy dopisywaniu wiersza preferencji;
  fonty w HTML zostają w komplecie, bez podzbioru.
- **29 adnotacji rozstrzygnięcia** dopisanych do historycznych wpisów — każda z datą realnego
  rozstrzygnięcia i wskazaniem dowodu (status etapu, wiersz w `USTAWIENIA.md`, numer lekcji,
  Aneks A, wynik pilotażu E6).
- **Pierwsza rotacja dziennika w tym projekcie.** Szesnaście najstarszych wpisów (2026-08-07 …
  2026-08-09) przeniesione do
  [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md).

**Zweryfikowane — jak dokładnie:**

- **Dwufazowość zadziałała z dowodem.** Suma kontrolna fragmentu w żywym pliku
  `c17de1981ceedb1c`, suma treści odczytanej **z dysku** spod separatora archiwum — identyczna.
  Dopiero po zgodności nastąpiło przycięcie.
- Rozmiary: dziennik **201 KB → 98 KB** (próg 150 KB), plik archiwum 104 KB. Cel „poniżej 60%
  progu" (90 KB) **nie został osiągnięty** i to jest zachowanie zgodne ze specyfikacją: zakres
  jest ciągły i urwał się na pierwszym wpisie nietykalnym, zamiast przeskoczyć go i zabrać
  kolejne.
- Nietykalne zostały: sekcja „Stan otwartych ryzyk", dziesięć najnowszych wpisów oraz wpis
  z 2026-08-10 (E10) — ma trzy realnie otwarte pozycje dla człowieka. Odsyłacz stoi jako pierwsza
  rzecz w sekcji „Wpisy", bez streszczenia okresu.
- Ponowna analiza po adnotacjach: zakres możliwy do przeniesienia urósł z 3 wpisów (9 KB) do 16
  (103 KB) — czyli blokada była **długiem adnotacyjnym**, nie zaległością pracy.
- **L-0035 potwierdzona w praktyce:** mechanizm czytający dopisek maszynowo uznawał zamknięte
  pozycje za otwarte przez pięć dni, bo zbiór akceptowanych brzmień powstał po pierwszym nawyku
  pisania, a nie przed nim.

**Świadomie odłożone:**

- **Rotacja rejestru lekcji** — `LEKCJE.md` ma 40 KB przy progu 50 KB i 47 zasad aktywnych; poniżej
  progu wielkości, więc rotacja milczy zgodnie ze specyfikacją.
- **Dalsze przycięcie dziennika** — możliwe dopiero po rozstrzygnięciu trzech pozycji z wpisu
  E10 (niżej).

**Do zrobienia przez człowieka:**

- **Trzy pozycje blokujące dalszą rotację**, wszystkie z wpisu 2026-08-10 (E10): los projektu
  pilotażowego `Desktop\Paragony`, commit zmian adopcyjnych w JiraManagerze oraz rozstrzygnięcie,
  czy guard hooków ma rozpoznawać pliki po ścieżce. Po ich zamknięciu rotacja pójdzie dalej sama,
  przy najbliższym „kończymy na dziś".
- Pozycje bez zmian: sekwencja wydania (teraz **1.5.2**), ponowna instalacja pre-commita tam, gdzie
  jest, `claude /login`, `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`,
  wdrożenie D-86 w E7.
