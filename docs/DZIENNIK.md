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

### 2026-08-07 — Analiza, wywiad, master plan

Autor: RelAI (Fable) + Łukasz

**Zrobione:**
- Analiza pełnej historii projektów z Desktopu (7 agentów równolegle): vibe-forge, Parkly, ExpensesManager, KARTON/karton-recykling, AGRO_HOME, Gedeus, Work in Group, JiraManager, ekosystem agentów hotelowych (3 foldery), backupy, globalna konfiguracja `.claude`, projekty poboczne. Synteza ewolucji stylu pracy (4 ery) przedstawiona w rozmowie.
- Wywiad architektoniczny: 24 rundy AskUserQuestion, ~90 decyzji — skodyfikowane w [DECYZJE.md](DECYZJE.md) (D-01…D-84).
- Nazwa: **RelAI**; tagline „Twój projekt pamięta wszystko".
- Master plan budowy: [plany/BUDOWA_RELAI/PLAN.html](plany/BUDOWA_RELAI/PLAN.html) + [STATUS.md](plany/BUDOWA_RELAI/STATUS.md).
- Struktura dogfoodingowa repo (CLAUDE.md, DZIENNIK, DECYZJE, USTAWIENIA).
- Pamięć trwała: zapisane notatki o projekcie i preferencjach designowych (anty-slop).

**Zweryfikowane:** dokumenty przeczytane po zapisie w ramach tworzenia; plan czeka na akceptację Łukasza — bez niej brak dalszych kroków (D-33: plan zamrażany dopiero po akceptacji).

**Świadomie odłożone:**
- Przemianowanie folderu `VibeFramework` → `RelAI` (folder jest bieżącym katalogiem roboczym sesji — zmiana nazwy w trakcie grozi zerwaniem sesji; do wykonania między sesjami).
- Założenie repo git + prywatnego repo GitHub (po akceptacji planu, w E1).
- Generacja `PROMPT_ETAP_1.md` (zgodnie z D-34 — powstaje przy akceptacji planu).

**Do zrobienia przez człowieka:**
- Przejrzeć i zaakceptować (lub odesłać z uwagami) master plan. *(zrobione 2026-08-07 — patrz kolejny wpis)*
- Zdecydować moment przemianowania folderu na `RelAI`. *(rozstrzygnięte 2026-08-07: ręcznie, po zamknięciu bieżącej sesji — szczegóły w kolejnym wpisie)*
- Rozważyć rotację klucza API Anthropic oraz uprzątnięcie `klucze.txt` / `client_secret_*.json`. *(rozstrzygnięte 2026-08-07: świadoma decyzja — bez rotacji, backup wyłącznie lokalny)*

### 2026-08-07 — Akceptacja planu (Aneks A), E1 gotowy do startu

Autor: RelAI (Fable) + Łukasz

**Zrobione:**
- Plan ZAAKCEPTOWANY z poprawkami — Aneks A: nowa komenda `/relai-help` (D-07), pytanie o model wykonawczy przy każdym planie (D-39, zmiana D-38 na rekomendację), wykonawca budowy = Opus (D-85).
- Przegląd architekta po poprawkach — domknięte luki: hook-guard (hooki ciche poza projektami RelAI), zapis wersji RelAI w USTAWIENIA przy init, polskie frazy w opisach skilli, wpisy DZIENNIKA append-na-końcu z autorem (przeciw konfliktom git). Wszystko dopisane do Aneksu A i zakresów E1/E2/E5.
- Repo `github.com/nowilus/relai` założone przez Łukasza; git init + pierwszy commit lokalny.
- Próba przemianowania folderu `VibeFramework` → `RelAI`: NIEUDANA z poziomu sesji (system trzyma uchwyt na katalogu roboczym) — do wykonania ręcznie po zamknięciu tej sesji: zamknij sesję → zmień nazwę folderu → otwórz Claude Code w `RelAI`.
- Wygenerowany [PROMPT_ETAP_1.md](plany/BUDOWA_RELAI/PROMPT_ETAP_1.md) (architekt; od E2 prompty pisze Opus w rytuale „Na koniec").

**Zweryfikowane:** spójność planu z rejestrem decyzji po naniesieniu Aneksu A; render PLAN.html sprawdzony w przeglądarce.

**Świadomie odłożone:** dostępy współpracowników do repo (moment dowolny); licencja (przy upublicznieniu); adopcja JiraManagera (po E10).

**Do zrobienia przez człowieka:**
- Uruchomić E1: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_1.md". *(zrobione 2026-08-07 — patrz kolejny wpis)*

### 2026-08-07 — E1: fundament pluginu RelAI 0.1.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **Manifesty:** `.claude-plugin/plugin.json` (name `relai`, version `0.1.0`, opis EN) + `.claude-plugin/marketplace.json` — własny marketplace w tym samym repo, instalacja `add nowilus/relai` → `install relai`.
- **Skill `relai-core`** ([SKILL.md](../skills/relai-core/SKILL.md)): opis EN z polskimi frazami wyzwalającymi (Aneks A pkt 4.3); „Krok 0" — rozpoznanie czterech stanów folderu (GOŚĆ / PROJEKT RELAI / PUSTY / Z ZAWARTOŚCIĄ) z jednoznaczną definicją „pustego" (metadane narzędzi się nie liczą); ścieżka inicjalizacji: zgoda → paczka dokładnie 3 pytań (język / git / profil, defaulty z auto-detekcji) → generacja; tryb gościa `.claude/relai.json`; ścieżka niedestrukcyjnego dołączenia z jawnym komunikatem, że pełna adopcja przyjdzie później.
- **Sześć specyfikacji dokumentów** w `templates/` (D-60 — specyfikacje dla LLM, nie pliki do kopiowania): `SPEC_CLAUDE_MD` (router ≤60 linii, rytuał startu, definicja ukończenia, dobór modeli jako rekomendacja D-38, sekcja niemutowalna Karpathy), `SPEC_README`, `SPEC_STATE` (dwuwarstwowy, NADPISYWANY), `SPEC_DZIENNIK` (szablon wpisu, sekcja ryzyk, rotacja, append-na-końcu), `SPEC_USTAWIENIA` (marker `Wersja RelAI:`), `SPEC_KOMENDY` (generowany ze stanu faktycznego — w 0.1.0 jawnie „komend nie ma") + `templates/README.md` jako indeks.
- **Konwencja hook-guard** udokumentowana w README pluginu: sześć punktów, m.in. guard jako pierwsza instrukcja hooka, tryb gościa traktowany jak brak struktury, awaria guarda = wyjście bez efektu.
- **README pluginu** (opis, instalacja, zakres 0.1.0, struktura repo, hook-guard, zasady) + `.gitignore` chroniący sekrety (D-42).
- Dogfooding: do `docs/USTAWIENIA.md` tego repo dopisany marker `Wersja RelAI: 0.1.0` — repo rozpoznaje się teraz własnym mechanizmem.

**Zweryfikowane — jak dokładnie:**
- `claude plugin validate` — marketplace.json: „Validation passed" także z `--strict`; plugin.json: „Validation passed with warnings", jedno ostrzeżenie („CLAUDE.md at the plugin root is not loaded as project context") wynikające z dogfoodingu — repo jest jednocześnie pluginem i projektem RelAI. Ostrzeżenie świadomie zostawione.
- **Instalacja z GitHuba na tej maszynie:** `claude plugin marketplace add nowilus/relai` → sklonowane po HTTPS, „Successfully added marketplace: relai"; `claude plugin install relai@relai` → „Successfully installed plugin (scope: user)"; `claude plugin details relai@relai` → Skills (1) `relai-core`, koszt always-on ~316 tok. Weryfikacja przez CLI, nie przez komendę `/plugin` (sesja nieinteraktywna) — mechanizm i źródło te same.
- **Ścieżka ze spacją i polskim znakiem:** cały cykl testowy w `C:\Users\Lukasz\Desktop\Próba RelAI` — zapis 6 dokumentów, `git init`, commit, odczyt, wykrywanie struktury: bez błędów kodowania i bez problemów ze ścieżką.
- **Scenariusz inicjalizacji:** w `Próba RelAI\pusty` wygenerowany komplet (`CLAUDE.md`, `README.md`, `docs/{STATE,DZIENNIK,USTAWIENIA,KOMENDY}.md`) prosto ze specyfikacji, po polsku; `USTAWIENIA` zawiera `Wersja RelAI: 0.1.0`; commit `chore: initialize RelAI project structure` objął dokładnie 6 plików. Wygenerowany `CLAUDE.md` ma rytuał startu i sekcję niemutowalną.
- **Scenariusz odmowy:** `Próba RelAI\odmowa` — zapisany `.claude/relai.json` = `{"mode":"guest"}`; ponowne wykrycie zwraca stan GOŚĆ, czyli pytanie o inicjalizację nie wraca.
- **Scenariusz folderu z zawartością:** `Próba RelAI\z-zawartoscia` (zastane `README.md`, `package.json`, `src/index.js`) — dołożone tylko brakujące pliki. Sumy kontrolne SHA-256 wszystkich trzech plików zastanych **identyczne przed i po**; treść `README.md` niezmieniona.
- **Reguła wykrywania:** skrypt odtwarzający „Krok 0" przepuszczony przez cztery foldery — 3/3 przypadki testowe PASS, brak stanu niejednoznacznego.
- Foldery testowe usunięte po testach (`Próba RelAI` nie istnieje).
- **Nie sprawdzono:** czy skill `relai-core` sam się wyzwoli w świeżej sesji na pierwszym prompcie — tego nie da się zweryfikować z wnętrza bieżącej sesji. Procedura skilla została wykonana ręcznie krok po kroku, więc test dotyczy jej treści, nie mechanizmu wyzwalania (ryzyko R2, pierwszy realny test na starcie E2).

**Świadomie odłożone:**
- Komendy `/relai-*` — E4/E7 zgodnie z planem; `KOMENDY.md` w 0.1.0 jawnie mówi, że komend nie ma, zamiast obiecywać.
- Hooki — E5; w E1 powstała wyłącznie konwencja hook-guard.
- Specyfikacje `LEKCJE`, `DECYZJE`, `ARCHITEKTURA`, `DESIGN` — E2/E8.
- Ustawienia globalne `~/.claude/relai/` (D-23) — mechanizm dziedziczenia dochodzi razem z rytuałami w E2.
- Pełna adopcja zastanego projektu — E9; skill mówi o tym wprost użytkownikowi zamiast improwizować namiastkę.

**Do zrobienia przez człowieka:**
- Uruchomić E2: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_2.md". *(zrobione 2026-08-07 — patrz kolejny wpis)*
- Zdecydować, czy plugin ma zostać zainstalowany na stałe (jest zainstalowany w scope `user` po teście) — jeśli nie, `claude plugin uninstall relai`. *(rozstrzygnięte 2026-08-07: odinstalowany, instalacja docelowa na koniec budowy — USTAWIENIA + LEKCJE L-0004)*

### 2026-08-07 — E2: rdzeń dokumentacyjny RelAI 0.2.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **`templates/SPEC_LEKCJE.md`** — dokument `docs/LEKCJE.md`: format `L-NNNN` (trigger / przyczyna / zasada / źródło + status), zapis **bez pytania** po korekcie, sekcja „Zasady aktywne" jako jedyny destylat czytany na starcie sesji (limit 15 pozycji, SZACUNEK), **graduacja** przy drugiej korekcie w tej samej sprawie (próg 2, SZACUNEK; zatwierdza człowiek), **kompresja** przy >25 aktywnych wpisach / 30 KB / kwartale (SZACUNEK), przykład z czterema wpisami i wypełnionym destylatem.
- **`templates/SPEC_DECYZJE.md`** — dokument `docs/DECYZJE.md`: format `D-NN` z datą i obowiązkowym powodem, grupy tematyczne zakładane dopiero z pierwszą decyzją, procedura wykrywania powracającego tematu (drugi raz w osobnych sesjach albo trzeci nawrót w jednej — SZACUNEK) i propozycji zamrożenia zatwierdzanej przez człowieka, automatyczne przechwytywanie fraz („nie rób tego więcej", „ustalmy raz na zawsze"), zmiana decyzji wyłącznie nowym datowanym wpisem + sekcja „Decyzje zmienione", przykład.
- **Skill `relai-core` rozszerzony o rytuały:** rytuał startu sesji (kolejność CLAUDE → STATE → DZIENNIK: ryzyka i ostatni wpis → LEKCJE: tylko „Zasady aktywne" → USTAWIENIA → aktywny plan, zakaz skanowania repo, akapit „gdzie jesteśmy"); definicja ukończenia jako zachowanie (STATE + wpis w tej samej turze, bez pytania, z jawną listą tego, czego nie dotyczy); reakcja na korektę (lekcja bez pytania → destylat → sprawdzenie powtórzenia → propozycja graduacji → propozycja zamrożenia decyzji); zamknięcie sesji (sync docs → wpis → ryzyka → propozycja commita → podsumowanie).
- **Trzy frazy naturalne** PL/EN opisane jako sekwencje kroków, nie intencje: „kończymy na dziś"/„wrapping up", „kontynuujemy pracę"/„let's continue", „sprawdź status"/„status check". Dopisane do `SPEC_KOMENDY.md` (zakres 0.2.0) i do przykładowego `KOMENDY.md`.
- **Warstwa ustawień globalnych (D-23):** `~/.claude/relai/USTAWIENIA.md` — struktura identyczna jak projektowa, **bez** linii `Wersja RelAI:` (żeby katalog domowy nie został uznany za projekt), tylko preferencje ponadprojektowe, tworzony przy pierwszej inicjalizacji bez zadawania czwartego pytania, dziedziczenie jako opcja „(Rekomendowane)", pierwszeństwo wpisu projektowego. Opisane w skillu i w `SPEC_USTAWIENIA.md`.
- **Inicjalizacja generuje osiem dokumentów** (doszły `LEKCJE.md` i `DECYZJE.md`, puste ale kompletne strukturalnie). Zaktualizowane: tabela w skillu, `templates/README.md`, mapa dokumentacji w `SPEC_README.md`, rytuał startu w `SPEC_CLAUDE_MD.md`, przykład w `SPEC_KOMENDY.md`.
- **Wersja 0.2.0** w `plugin.json`, `marketplace.json`, README pluginu i `SPEC_KOMENDY.md`; marker w `docs/USTAWIENIA.md` tego repo podbity do 0.2.0.
- **Dogfooding:** założone `docs/LEKCJE.md` repo wg świeżej specyfikacji — pięć wpisów (L-0001…L-0003 z przeglądu E1, L-0004 z korekty użytkownika o odinstalowaniu pluginu, L-0005 z przeglądu E2 o weryfikacji planowanej tam, gdzie niewykonalna) i wypełnione „Zasady aktywne". Rytuał startu w `CLAUDE.md` repo rozszerzony o LEKCJE.

**Zweryfikowane — jak dokładnie:**
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with warnings", jedno znane ostrzeżenie o root `CLAUDE.md` (świadome, L-0003); `marketplace.json --strict` → „Validation passed". Wersja `0.2.0` spójna w obu manifestach i w README.
- **Ścieżka ze spacją i polskim znakiem:** cały test w `C:\Users\Lukasz\Desktop\Próba RelAI E2\pusty` (projekt „Notatnik", profil app, git lokalny) — bez błędów kodowania i ścieżek.
- **Inicjalizacja:** wygenerowany komplet **ośmiu** dokumentów prosto ze specyfikacji, po polsku; `docs/USTAWIENIA.md` z markerem `Wersja RelAI: 0.2.0`; `docs/LEKCJE.md` z sekcją „Zasady aktywne"; commit `chore: initialize RelAI project structure` objął dokładnie 8 plików. Plik globalny `~/.claude/relai/USTAWIENIA.md` utworzony z jednym wpisem ponadprojektowym.
- **Zmiana kodu:** `src/index.js` (`add`/`list`), uruchomione realnie — `add "pierwsza notatka"`, `add "druga notatka"`, `list` → wypisało obie w kolejności dodania. W tej samej turze nadpisany `STATE.md` i dopisany wpis do `DZIENNIK.md` — **bez proszenia**, zgodnie z definicją ukończenia.
- **Korekta i graduacja:** pierwsza korekta → wpis `L-0001` bez pytania; powtórzenie tej samej korekty → wpis `L-0002` z adnotacją „powtórzenie L-0001", propozycja graduacji i po zgodzie reguła w `CLAUDE.md` projektu testowego; destylat „Zasady aktywne" zaktualizowany z odsyłaczami do obu lekcji.
- **Frazy:** „kontynuujemy pracę" — odtworzony kontekst dokładnie z pięciu źródeł w zadanej kolejności (sekcje, nie całe pliki); „kończymy na dziś" — sync dokumentów, wpis zamykający, przegląd ryzyk, commit `feat: add and list notes from the command line`. Obie frazy widnieją w wygenerowanym `KOMENDY.md`.
- **Struktura dziennika:** `grep` po nagłówkach — „Stan otwartych ryzyk" na górze pliku, trzy wpisy w sekcji „Wpisy" w kolejności dopisywania, najnowszy na końcu.
- Foldery testowe usunięte (`Próba RelAI E2` nie istnieje); usunięty także testowy `~/.claude/relai/`, żeby maszyna została w stanie sprzed testu.
- **Nie sprawdzono:** auto-wyzwalania skilla w świeżej sesji (plugin odinstalowany — R2, L-0004/L-0005); zachowania rytuałów, gdy prowadzi je model inny niż Opus; kompresji lekcji i rotacji dziennika w praktyce (progi to SZACUNEK, nie było na czym ich uruchomić).

**Świadomie odłożone:**
- Komendy `/relai-*` — E4/E7; `KOMENDY.md` 0.2.0 nadal mówi wprost, że komend nie ma.
- Hooki (w tym `session-context` i `doc-sync-reminder`, druga siatka dla definicji ukończenia) — E5.
- Specyfikacje `ARCHITEKTURA`, `DESIGN` — E8; szablon HTML planów — E6.
- Przepisanie `docs/DECYZJE.md` tego repo do formatu nowej specyfikacji — rejestr został nietknięty (patrz „Do zrobienia przez człowieka").

**Do zrobienia przez człowieka:**
- Zgodność `docs/DECYZJE.md` tego repo ze świeżą `SPEC_DECYZJE.md`: **rejestr jest zgodny co do zasady i grup tematycznych**, różni się trzema rzeczami — (1) wpisy nie mają dat indywidualnych, tylko zbiorczą informację w nagłówku („wywiad 2026-08-07"), (2) część wpisów nie ma jawnego powodu, (3) zmiana D-38 jest odnotowana w treści wpisu zamiast w sekcji „Decyzje zmienione". Decyzja, czy migrować rejestr do nowego formatu (~90 wpisów), czy zostawić jako historyczny — należy do Łukasza.
- Uruchomić E3: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_3.md". *(zrobione 2026-08-07 — patrz kolejny wpis)*

### 2026-08-07 — E3: planowanie RelAI 0.3.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **Skill `relai-planning`** ([SKILL.md](../skills/relai-planning/SKILL.md)): opis EN z polskimi
  frazami wyzwalającymi; **wykrycie intencji planowania** z jawnymi kryteriami po obu stronach
  (sygnały „to jest plan" i cztery klasy fałszywych wyzwoleń, z „zaplanuj mi spotkanie" wprost);
  kryterium rozstrzygające przy wątpliwości — „czy odpowiedzią ma być dokument, czy zmiana w repo";
  **próg PLAN/MINIPLAN** podany liczbowo i oznaczony jako SZACUNEK (≥2 sesje, ≥3 etapy, >5 plików,
  ≥2 realne warianty, obszar wrażliwy); **jedno pytanie startowe** (rodzaj / format / model
  wykonawczy) w jednym wywołaniu AskUserQuestion, poprzedzone odczytem `USTAWIENIA.md` i warstwy
  globalnej, z zapisem preferencji natychmiast po odpowiedzi; **zamrożenie po akceptacji**
  z aneksami A, B, C… i jawnym rozgraniczeniem aneks vs odchylenie fundamentalne (status CZĘŚCIOWO
  + nowy plan z linkiem); **zamknięcie planu** jako siedmiokrokowa sekwencja (D-36); zasada jednej
  linii aktywnego planu przy wielu planach; siedem twardych zakazów.
- **`templates/SPEC_PLAN.md`** — dziesięć sekcji w stałej kolejności (streszczenie, cele i nie-cele,
  stan wyjściowy, warianty z jawnym werdyktem i powodem odrzucenia, rozwiązanie, etapy z szacunkiem
  i efektem widocznym, ryzyka z poziomem i mitygacją, przypadki brzegowe rozstrzygnięte, lista dla
  człowieka, aneksy), obowiązkowe etykiety FAKT/SZACUNEK, kompletny przykład planu płatności.
- **`templates/SPEC_STATUS.md`** — linia metryczna z linkiem do planu, statusem i **modelem
  wykonawczym zapisanym dosłownie tak, jak odpowiedział użytkownik**; pięć statusów planu i pięć
  statusów etapu; reguła „dokładnie jeden etap GOTOWY DO STARTU"; kolumna `Prompt` z jawnym `—`
  dopóki prompty etapowe nie działają (L-0002); dziennik wdrożenia append-only; przykład.
- **MINIPLAN jako sekcja `SPEC_DZIENNIK.md`**, nie osobna specyfikacja. Uzasadnienie: dokument,
  w którym miniplan mieszka, to dziennik, a jego strukturę opisuje jedna specyfikacja — dziewiąty
  plik `SPEC_MINIPLAN.md` opisywałby wariant wpisu w oderwaniu od dokumentu i rozjeżdżałby się z nim
  przy każdej zmianie. Sekcja podaje trzy pola (cel / kroki / weryfikacja), dopisek `— MINIPLAN`
  w nagłówku, zasadę „jedyny wpis pisany przed pracą" i przykład.
- **Spójność z `relai-core`:** skill rdzeniowy dostał jawny podział ról („planowanie należy do
  `relai-planning`") i wersję 0.3.0 w markerze generowanych `USTAWIENIA.md`. `SPEC_CLAUDE_MD.md`:
  linia aktywnego planu doprecyzowana — dokładnie jedna, format `Aktywny plan: [<TEMAT>](…/STATUS.md)`,
  link do STATUS a nie do PLAN, `Aktywny plan: brak` zamiast usuwania linii.
- **`SPEC_KOMENDY.md` 0.3.0:** dopisane realne zachowania planistyczne i czwarta fraza naturalna
  („przygotuj plan…"), z jawnym wyliczeniem, czego w tej wersji nie ma (prompty etapowe,
  `/relai-stage`, szablon HTML). Przykład wygenerowanego `KOMENDY.md` podbity do 0.3.0.
- **Wersja 0.3.0** w `plugin.json`, `marketplace.json`, README pluginu, `SPEC_KOMENDY.md`,
  `SPEC_USTAWIENIA.md` i w markerze `docs/USTAWIENIA.md` tego repo.

**Zweryfikowane — jak dokładnie:**
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with warnings", jedno
  znane ostrzeżenie o root `CLAUDE.md` (świadome, L-0003); `marketplace.json --strict` → „Validation
  passed". `grep` po `0.2.0` w repo: cztery trafienia, wszystkie historyczne i celowe (wpis o E2
  w `CLAUDE.md`, zdanie o projektach sprzed 0.2.0 w skillu, zdanie o komplecie ośmiu dokumentów
  od 0.2.0 w `templates/README.md`).
- **Ścieżka ze spacją i polskim znakiem:** cały cykl w `C:\Users\Lukasz\Desktop\Próba RelAI E3\sklepik`
  (projekt „Sklepik", profil app) — bez błędów kodowania i ścieżek.
- **Test planu z naturalnego prompta:** „przygotuj plan dodania logowania" bez żadnej komendy →
  powstały `docs/plany/LOGOWANIE/PLAN.md` (trzy warianty z powodami odrzucenia, trzy etapy,
  cztery ryzyka, pięć przypadków brzegowych, dwie decyzje dla człowieka) i `STATUS.md`;
  `CLAUDE.md` dostał linię `Aktywny plan: [LOGOWANIE](…)` i ma 48 linii (limit 60); przed generacją
  padło **jedno** pytanie o rodzaj/format/model — jego treść zapisana jako dowód testowy.
- **Test negatywny:** „zaplanuj mi spotkanie na jutro" → żadnego pliku; `grep -ril "spotkani"` po
  projekcie testowym nie zwrócił nic.
- **Test MINIPLAN-u:** „dodaj numer wersji do stopki" → wpis `— MINIPLAN` w dzienniku z celem,
  trzema krokami i weryfikacją; w `docs/plany/` **nie** powstał żaden folder.
- **Test utrwalonej preferencji:** druga prośba o plan („powiadomienia mailowe") → **zero pytań**;
  format i model wzięte z `USTAWIENIA.md`, co odnotowano w dzienniku wdrożenia planu.
- **Test zamrożenia:** po akceptacji planu LOGOWANIE prośba „dorzućmy wylogowanie ze wszystkich
  urządzeń" → **Aneks A z datą** w sekcji 10. Dowód, że sekcje merytoryczne są nietknięte: wiersz E3
  w sekcji 6 nadal mówi „SZACUNEK 1 sesja", a przypadek brzegowy o dwóch urządzeniach ma dokładnie
  pierwotne brzmienie; nowy szacunek 1–2 sesji żyje wyłącznie w treści aneksu.
- **Dogfooding (D-82) — `PLAN.html` vs `SPEC_PLAN.md`:** plan budowy powstał przed specyfikacją
  i różni się od niej czterema rzeczami. (1) Ma **13 sekcji zamiast 10** — dochodzą „Architektura
  pluginu", „Struktura projektu użytkownika" i „Rejestr decyzji (skrót)", właściwe dla planu
  budującego narzędzie, nie dla planu funkcji. (2) **Nie ma osobnej sekcji „Stan wyjściowy"** — jej
  rolę pełni kontekst w streszczeniu, a nie-cele mieszkają w osobnej sekcji 11 („Czego świadomie NIE
  budujemy w v1") zamiast razem z celami. (3) **Warianty są kartami, nie tabelą**, ale każdy odrzucony
  ma jawny powód poprzedzony słowem „Powód:" — wymóg specyfikacji jest spełniony w innej formie.
  (4) Etapy mają dodatkowo **sekcję „Weryfikacja"**, której specyfikacja nie wymaga — to element
  lepszy od wzorca; kandydat do dopisania do `SPEC_PLAN.md`, świadomie nie dopisany teraz, żeby nie
  rozszerzać zakresu etapu. Zamrożonego planu **nie przepisywano** (D-33).
- **Dogfooding — `STATUS.md` planu budowy vs `SPEC_STATUS.md`:** zgodny w całości (linia metryczna
  z linkiem, datą, statusem i modelem wykonawczym; tabela `Etap | Nazwa | Status | Prompt | Uwagi`;
  dziennik wdrożenia append na końcu). Jedyna różnica: kolumna `Prompt` zawiera realne linki do
  `PROMPT_ETAP_N.md`, bo w tym planie prompty etapowe pisane są ręcznie od E1 — specyfikacja
  przewiduje `—` do czasu, aż zadziała ich automatyczna generacja.
- Foldery testowe usunięte (`Próba RelAI E3` nie istnieje); usunięty także testowy
  `~/.claude/relai/` — maszyna została w stanie sprzed testu (L-0004).
- **Nie sprawdzono:** czy skill `relai-planning` sam się wyzwoli na prompcie „przygotuj plan…"
  w świeżej sesji — plugin jest odinstalowany, procedura odtworzona ręcznie (R2, L-0004);
  realnej interakcji `AskUserQuestion` — treść i liczba pytań zweryfikowane na zapisie, ale
  odpowiedzi nie udzielił człowiek; zachowania przy planie prowadzonym przez model inny niż Opus.

**Świadomie odłożone:**
- Prompty etapowe `PROMPT_ETAP_N`, komenda `/relai-stage`, lazy-generacja i siatka dogenerowująca
  — E4; kolumna `Prompt` w `STATUS.md` do tego czasu trzyma `—`.
- Interaktywny szablon HTML planów — E6; plany powstają w Markdown, a preferencja „HTML" jest
  zapisywana i honorowana dopiero wtedy.
- Sekcja „Weryfikacja" w etapach `SPEC_PLAN.md` (patrz dogfooding) — poza zakresem E3.
- Migracja `docs/DECYZJE.md` tego repo do formatu `SPEC_DECYZJE.md` — nadal czeka na decyzję
  Łukasza (wpis z E2).

**Do zrobienia przez człowieka:**
- Uruchomić E4: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj
  docs/plany/BUDOWA_RELAI/PROMPT_ETAP_4.md".
- Rozstrzygnąć, czy sekcja „Weryfikacja" ma wejść do wzorca etapu w `SPEC_PLAN.md` (dogfooding
  pokazał, że plan budowy ją ma i że jest przydatna).

### 2026-08-07 — Pomiar ryzyka R2 na zainstalowanym pluginie (0.3.0 → 0.3.1)

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- Na polecenie użytkownika **plugin zainstalowany** (`claude plugin install relai@relai`, scope
  `user`, dwa skille, ~714 tok always-on). Odwraca to L-0004 — lekcja oznaczona jako ZMIENIONA
  z powodem, zasada aktywna nr 4 przepisana.
- **Sześć pomiarów** w świeżych sesjach `claude -p … --output-format stream-json`, każdy w folderze
  ze spacją i polskim znakiem. Kryterium twarde: liczba wywołań narzędzia `Skill` w transkrypcie,
  nie „wrażenie z odpowiedzi".
- **Poprawka opisów obu skilli:** `MUST BE USED` na początku, marker rozpoznawczy projektu, płaska
  lista dosłownych fraz wyzwalających (najpierw polskich). Wersja podbita do **0.3.1**, wypchnięta,
  marketplace odświeżony, plugin przeinstalowany — dopiero wtedy powtórzony pomiar.

**Zweryfikowane — jak dokładnie:**
- **Wersja 0.3.0 — 1 trafienie na 4:**
  - „Zaczynam nowy projekt — narzędzie do pilnowania terminów…" w pustym folderze → `Skill` **0
    wywołań**, folder pusty, sesja poszła w wywiad z globalnych reguł maszyny.
  - „przygotuj plan dodania logowania" w projekcie z markerem → `Skill` **0 wywołań**; sesja
    przeczytała rytuał z projektowego `CLAUDE.md`, ale planu nie utworzyła.
  - „zainicjuj projekt, dodaj RelAI" → **`relai:relai-core` wywołany**, procedura odtworzona
    wiernie (rozpoznanie stanu, trzy pytania z rekomendacjami).
  - „zrób plan wdrożenia logowania — plan projektu, rozpisz to na etapy" → `Skill` **0 wywołań**,
    a mimo to powstał plan **łamiący trzy konwencje naraz**: `docs/plany/2026-08-07-logowanie.md`
    (data w nazwie — D-12), brak `STATUS.md` (D-30), wpis dziennika dopisany **na górze** zamiast
    na końcu (Aneks A pkt 4.4). To jest materialny dowód na R2: sam projektowy `CLAUDE.md` nie
    wystarcza.
- **Wersja 0.3.1 po poprawce — 2 trafienia na 2:**
  - „przygotuj plan dodania logowania" → **`relai-core` + `relai-planning`**; sesja wykonała rytuał
    startu, napisała akapit „gdzie jesteśmy", rozstrzygnęła próg na PLAN i **wzięła format oraz
    model z `USTAWIENIA.md` bez pytania** — dokładnie zachowanie z L-0006.
  - prompt naturalny w pustym folderze → **`relai-core`**.
- **Efekt uboczny pomiaru — defekt warstwy globalnej:** sesja wykonująca `relai-core` napisała
  wprost, że `~/.claude/relai/USTAWIENIA.md` jest **poza katalogiem roboczym i dostęp jest
  zablokowany**, więc dziedziczenia nie sprawdzi. D-23 w obecnej formie nie działa — zapisane jako
  L-0010, rozwiązanie systemowe do E5.
- **Nie sprawdzono:** pełnego cyklu end-to-end — w trybie `-p` `AskUserQuestion` jest niedostępne,
  więc obie udane sesje zatrzymały się na pytaniu startowym i **nie wygenerowały plików planu**;
  zachowania w sesji interaktywnej; powtarzalności (jeden przebieg na wariant, bez próby
  statystycznej); wpływu innych skilli na maszynie (inwentarz ~200 pozycji jest częścią wyniku).

**Świadomie odłożone:**
- Druga warstwa egzekwowania (hook `session-context` wymuszający rytuał niezależnie od tego, czy
  skill wystrzelił) — E5. To jest właściwa mitygacja R2, nie kolejne przeredagowanie opisu.
- Rozwiązanie dostępu do warstwy globalnej — E5 razem z hookami.
- Powtórzenie pomiaru w sesji interaktywnej i na innym profilu maszyny — E10.

**Do zrobienia przez człowieka:**
- Decyzja, czy plugin ma zostać zainstalowany na stałe w trakcie dalszej budowy (teraz jest, scope
  `user`, wersja 0.3.1) — wpisane do `USTAWIENIA.md` jako stan bieżący. *(rozstrzygnięte 2026-08-07:
  „tak, niech zostanie zainstalowany" — plugin zostaje; poprzednie ustawienie przeniesione do sekcji
  „Ustawienia wycofane")*

### 2026-08-07 — E4: prompty etapowe, `/relai-stage`, lazy-generacja — RelAI 0.4.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **`templates/SPEC_PROMPT_ETAPU.md`** — format `PROMPT_ETAP_N.md` jako specyfikacja: dziewięć
  elementów w stałej kolejności (nagłówek, linia metryczna z „E N z M" i wykonawcą ze `STATUS.md`,
  blok „Kontrola modelu", tabela „Co przeczytać na start", „Decyzje już podjęte — nie otwieraj",
  „Stan wyjściowy" z drzewkiem plików i przepisanymi zasadami aktywnymi, zakres, **obowiązkowa
  zawsze** Weryfikacja — D-25, rytuał „Na koniec"), trzy momenty generacji lazy, zakazy, kompletny
  przykład (L-0001). Wzorzec wzięty z istniejących `PROMPT_ETAP_1…4`, nie wymyślony od nowa.
- **`commands/relai-stage.md`** — pierwsza działająca komenda i pierwszy plik w nowym folderze
  `commands/` pluginu. Sześć kroków: guard markera → wybór planu (argument / linia aktywnego planu /
  jedyny niezamknięty / pytanie przy wielu) → wybór etapu z rozstrzygnięciem dla każdego z pięciu
  statusów → dogenerowanie brakującego promptu → **karta potwierdzenia i zatrzymanie** →
  wykonanie → sekwencja zamknięcia planu po ostatnim etapie. Kryteria rekomendacji subagenta podane
  liczbowo i oznaczone jako SZACUNEK (≤3 pliki, ≤5 punktów weryfikacji, zero decyzji projektowych,
  ≤0,5 sesji, poza sekretami i migracjami); rekomendacja jest zdaniem w karcie, nigdy odpaleniem.
- **Rytuał „Na koniec" etapu** dopisany do `relai-planning` (nie do specyfikacji promptu —
  uzasadnienie niżej): `STATUS.md` → dziennik + lekcje + ryzyka → dokumenty projektu →
  **generacja `PROMPT_ETAP_N+1`** → commit. `PROMPT_ETAP_1` powstaje przy akceptacji planu.
- **Siatka dogenerowująca** w `relai-core` jako ostatni krok rytuału startu sesji: etap
  `GOTOWY DO STARTU` bez promptu → zauważenie **przed** akapitem „gdzie jesteśmy" i propozycja;
  bez zgody nic nie powstaje. Hook `session-context` jawnie zapowiedziany jako E5, nie obiecany.
- **`SPEC_STATUS.md`** — kolumna `Prompt` przestała być `—`: zawiera link, gdy prompt istnieje,
  a `—` przy etapach `OCZEKUJE`; dopisana reguła, że fałszywy link wyłącza siatkę, oraz wiersz
  polityki dla etapu rozpoczętego (`W TOKU`). **`SPEC_KOMENDY.md`** — zakres 0.4.0 z pierwszą
  tabelą komend; sekcja „Komend jeszcze nie ma" zniknęła (L-0002).
- **Wersja 0.4.0** w obu manifestach (+ pole `commands`), README pluginu, `SPEC_KOMENDY.md`,
  `SPEC_USTAWIENIA.md`, obu skillach i markerze `docs/USTAWIENIA.md` tego repo.

**Zweryfikowane — jak dokładnie:**
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with warnings", jedno
  znane ostrzeżenie o root `CLAUDE.md` (L-0003); `marketplace.json --strict` → „Validation passed".
  `claude plugin details relai@relai` po instalacji → wersja **0.4.0**, inwentarz: `relai-core`,
  `relai-planning`, **`relai-stage`**. `grep` po `0.3.0`/`0.3.1`: trzy trafienia poza `docs/`,
  wszystkie historyczne („od 0.3.0", „od 0.3.1") — zostają (L-0008).
- **Metoda:** jedenaście świeżych sesji `claude -p … --output-format stream-json`, wszystkie
  w `C:\Users\Lukasz\Desktop\Próba RelAI E4(b)\…` — ścieżka ze spacją i polskim znakiem. Po każdej
  poprawce skilla: push → `marketplace update` → reinstalacja (L-0004).
- **Plan i akceptacja:** „przygotuj plan dodania logowania uzytkownikow" bez komendy → `relai-core`
  + `relai-planning`, powstały `PLAN.md` i `STATUS.md`, **zero pytań** (format i model z ustawień —
  L-0006), `PROMPT_ETAP_1.md` **nie** powstał. Akceptacja → `ZAAKCEPTOWANY`, Aneks A, E1
  `GOTOWY DO STARTU`, `PROMPT_ETAP_1.md` wygenerowany, link w kolumnie `Prompt`.
- **Potwierdzenie i dowód negatywny (L-0007):** `/relai-stage` bez argumentów → karta z planem,
  „E1 z E5", modelem (z porównaniem do modelu sesji), streszczeniem zakresu, liczbą punktów
  weryfikacji i oceną kryteriów subagenta („nie rekomenduję — ~12 plików"), zakończona pytaniem.
  Suma kontrolna wszystkich plików projektu przed i po: **zmienił się dokładnie jeden** —
  `STATUS.md` (link do dogenerowanego promptu, zapowiedziany osobnym zdaniem). Status etapu
  **pozostał `GOTOWY DO STARTU`**, nie `W TOKU`.
- **Siatka:** po usunięciu `PROMPT_ETAP_1.md` neutralny prompt „kontynuujemy prace" → sesja
  otworzyła odpowiedź zdaniem „Luka: etap E1 ma status GOTOWY DO STARTU, ale PROMPT_ETAP_1.md nie
  istnieje… Wygenerować go teraz?" i **nic nie zapisała** (zero `Write`/`Edit`, sumy kontrolne bez
  zmian).
- **Etap przerwany:** etap w `W TOKU` → `/relai-stage` wypisał, co zostało (ostatnia linia dziennika
  wdrożenia, ostatni wpis dziennika, tabela pięciu punktów weryfikacji **przeliczonych na nowo
  z repo**, nie z pamięci), zapytał „dokończyć czy zacząć od nowa" i nie tknął żadnego pliku.
- **Lazy-generacja:** zamknięcie etapu E1 planu testowego → `STATUS.md`: E1 `ZREALIZOWANY`,
  E2 `GOTOWY DO STARTU` z linkiem, dwie linie w dzienniku wdrożenia; powstał `PROMPT_ETAP_2.md`;
  wpis w dzienniku i nowa lekcja w `LEKCJE.md` projektu testowego.
- **Zamknięcie planu (D-36):** ostatni etap → status planu `ZREALIZOWANY`, folder planu
  **przeniesiony** do `docs/archiwum/plany/`, `STATE.md` nadpisany, wpis „dowiezione vs plan",
  `Aktywny plan: brak` w `CLAUDE.md`, **brak** zbędnego `PROMPT_ETAP_N+1`. Osiągnięte dopiero
  za czwartym podejściem — trzy pierwsze ujawniły defekty opisane niżej.
- **Etap nie zamyka się na niepełnej weryfikacji:** dwie sesje zatrzymały się przy punktach
  wymagających `node` (sandbox odmówił) i zostawiły etap w `W TOKU` z gotową komendą dla człowieka,
  zamiast podmienić dowód uruchomieniowy na statyczny. To zachowanie **nie było wymuszone
  promptem** — wynika z zakazu w komendzie.
- **Inicjalizacja na 0.4.0:** świeży pusty folder → osiem dokumentów, marker `Wersja RelAI: 0.4.0`,
  `KOMENDY.md` z tabelą komend zawierającą `/relai-stage`. **Wymagało `--add-dir` na katalog
  pluginu** — patrz R8.
- **Pięć defektów znalezionych i poprawionych w trakcie etapu** (każdy zmierzony ponownie po
  poprawce): (1) generowany prompt miał własny układ zamiast układu ze specyfikacji → dziewięć
  sekcji wypisanych w skillu, po poprawce układ zgodny (L-0011); (2) komenda kazała uzupełnić
  `STATUS.md` w kroku 3 i zakazywała tego w kroku 4 → jawny, nazwany wyjątek; (3) zamknięcie planu
  zostawiało linię aktywnego planu wskazującą na archiwum → warunek końcowy stanu zamiast
  preferencji (L-0013); (4) komenda wywołana wprost nie ładowała `relai-planning`, a bez niego
  sekwencja D-36 wychodziła niepełna → jawne polecenie wczytania skilla (L-0015); (5) reguła
  „bierz plan z linii aktywnego planu" zawodziła, gdy linia była nieaktualna → rozjazd z `STATE.md`
  i dziennikiem traktowany jako niejednoznaczność.
- **Dogfooding (D-82) — `PROMPT_ETAP_1…4` vs świeża `SPEC_PROMPT_ETAPU.md`:** prompty **E2, E3
  i E4 są zgodne w dziewięciu elementach na dziewięć** — specyfikacja opisuje wzorzec, który
  realnie działał, a nie nowy pomysł. Różnice: (a) **E1** ma w linii metrycznej „architekt: Fable"
  zamiast „autor: <model>, w rytuale »Na koniec«" i nie zawiera przepisanych zasad aktywnych ani
  drzewka plików — bo w chwili jego powstania nie istniało ani repo, ani `LEKCJE.md`; specyfikacja
  tego przypadku (pierwszy prompt w pustym projekcie) **nie opisuje**. (b) **E2** ma dodatkową
  sekcję **przed** „Co przeczytać na start" — „Zanim zrobisz cokolwiek innego: test ryzyka R2";
  to element lepszy od wzorca (etap, który musi coś zmierzyć, zanim zacznie czytać), **świadomie
  nie dopisany** do specyfikacji, żeby nie rozszerzać zakresu etapu. Istniejących promptów nie
  przepisywano.
- **Nie sprawdzono:** zachowania `/relai-stage` w sesji **interaktywnej** — wszystkie pomiary
  w trybie `-p`, w którym `AskUserQuestion` jest niedostępne, więc wariant „więcej niż jeden plan →
  pytanie" wykonał się jako pytanie w tekście, nie jako realne narzędzie; powtarzalności (jeden
  przebieg na wariant); rekomendacji subagenta w wariancie pozytywnym (żaden etap testowy nie
  spełnił wszystkich pięciu kryteriów naraz — progi pozostają SZACUNKIEM niezweryfikowanym
  empirycznie); zachowania przy planie prowadzonym przez model inny niż Opus.

**Świadomie odłożone:**
- **Osobny skill `relai-stages`** przewidziany w sekcji 5.1 planu — **nie powstał**. Treść, która
  miała tam trafić (prompty etapowe, lazy-generacja, rytuał „Na koniec"), to trzy sekcje ściśle
  zależne od `STATUS.md` i zamknięcia planu, czyli od rzeczy, które już mieszkają
  w `relai-planning`. Trzeci skill oznaczałby trzeci opis do wygrania w konkurencji wyzwalania
  (R2, L-0009) i stałe ryzyko rozjazdu z `relai-planning`. Sekcja 5.1 planu jest szkicem struktury
  repo, nie zakresem etapu — decyzja zapisana tutaj zamiast jako aneks. **Do potwierdzenia przez
  człowieka**, jeśli uzna to za odejście od planu.
- Hook `session-context` jako druga warstwa siatki — E5; w 0.4.0 siatka działa wyłącznie wtedy,
  gdy `relai-core` się wyzwoli.
- Systemowe rozwiązanie dostępu do `templates/` i do warstwy globalnej — E5 (R8, L-0010, L-0012).
- Dopisanie do `SPEC_PROMPT_ETAPU.md` wzorca „sekcja przed czytaniem" (z E2) i wariantu pierwszego
  promptu w pustym projekcie (z E1) — poza zakresem E4.
- Sekcja „Weryfikacja" w etapach `SPEC_PLAN.md` — nadal czeka na decyzję z wpisu o E3.
- Migracja `docs/DECYZJE.md` tego repo do formatu `SPEC_DECYZJE.md` — nadal czeka.

**Do zrobienia przez człowieka:**
- **Potwierdzić rezygnację z osobnego skilla `relai-stages`** (sekcja 5.1 planu) — albo polecić
  jego wydzielenie jako aneks do planu.
- **Rozstrzygnąć kierunek dla R8** przed E5: czy specyfikacje zostają plikami w `templates/`
  (wtedy potrzebny mechanizm dostępu — hook, `--add-dir` w instrukcji instalacji albo kopiowanie
  do projektu przy inicjalizacji), czy treść krytyczna przenosi się do skilli, a `templates/`
  zostaje materiałem referencyjnym. To dotyka D-60, więc decyzja należy do człowieka.
- Uruchomić E5: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj
  docs/plany/BUDOWA_RELAI/PROMPT_ETAP_5.md".

### 2026-08-07 — E5: osiem hooków Node.js, zamknięcie R8 — RelAI 0.5.0

Autor: RelAI (Fable) + Lukasz

**Odstępstwo od D-85, jawnie zlecone:** etap wykonał Fable na wyraźne polecenie użytkownika
(„Zweryfikuj dotychczasową pracę słabszego modelu OPUS […] a następnie wykonaj PROMPT_ETAP_5"),
poprzedzone przeglądem E4. Wynik przeglądu: **zero defektów do poprawy** — wersje 0.4.0 spójne,
pięć poprawek E4 w osobnych commitach, dokumenty i specyfikacje wzajemnie zgodne.

**Zrobione:**
- **`hooks/` — osiem hooków Node.js** (jeden plik na hook, zero zależności npm, nazwy ASCII),
  wszystkie z guardem wg konwencji z README: `secret-scanner` i `config-protection` (PreToolUse,
  BLOKUJĄ), `quality-gate`, `console-log-warn`, `design-quality-check` (PostToolUse, OSTRZEGAJĄ),
  `doc-sync-reminder` (Stop, OSTRZEGA), `auto-format` (Stop, CICHY), `session-context`
  (SessionStart + PostToolUse na narzędziu `Skill`, CICHY). Rejestracja w `hooks/hooks.json`,
  wpiętym w `plugin.json` polem `hooks` — walidator przyjmuje tę formę.
- **`config-protection` blokuje przez `permissionDecision: "ask"`** — zgodę wyraża człowiek
  w oknie uprawnień (jawna wypowiedź w tej sesji); w trybie headless „ask" działa jak odmowa.
  `secret-scanner` używa twardego `deny` (poluzowanie tylko decyzją per projekt, D-42).
- **Mitygacja R2:** `session-context` na SessionStart wstrzykuje datę dnia, kontrolę wersji
  projekt↔plugin, wymuszenie rytuału startu i siatkę brakujących promptów (D-34).
- **Zamknięcie R8 i L-0010:** proces hooka ma pełny dostęp do dysku — `session-context` kopiuje
  specyfikacje do `.claude/relai/templates/` projektu (z `.gitignore` „*", git ich nie widzi)
  i wstrzykuje treść `~/.claude/relai/USTAWIENIA.md`. Dla inicjalizacji w świeżym folderze ten sam
  hook reaguje na PostToolUse wywołania skilla RelAI — doprecyzowanie konwencji hook-guard opisane
  w README (wywołanie skilla RelAI jest świadomym użyciem pluginu; tryb gościa pozostaje „nie").
  Wzorzec „jeden hook, dwa zdarzenia" ma precedens w tabeli 5.2 planu (doc-sync-reminder).
  Skille i `/relai-stage` czytają odtąd specyfikacje z lokalnej kopii; fallback `--add-dir` opisany.
- **Wersja 0.5.0** w manifestach, README, `SPEC_KOMENDY` (zakres 0.5.0 z zachowaniami hooków),
  `SPEC_USTAWIENIA`, obu skillach i markerze `docs/USTAWIENIA.md`; `grep` po `0.4.0` — trafienia
  wyłącznie historyczne.

**Zweryfikowane — jak dokładnie:**
- **Sondy R8 (3 świeże sesje):** odczyt `templates/`, katalogu skilla i katalogu skilla po jawnym
  wywołaniu `Skill` — wszystkie „ODCZYT ZABLOKOWANY"; to rozstrzygnęło wybór wariantu (hook,
  nie przenosiny plików).
- **39/39 testów jednostkowych** (runner Node, payloady budowane w Node — L-0017) na ścieżce
  ze spacją i polskim znakiem: guard negatywny i tryb gościa (cisza, kod 0), cztery formaty
  sekretów + przypisanie `PASSWORD=` (deny bez cytowania wartości), `.env` i placeholdery
  przechodzą, sekcja niemutowalna (ask) vs edycja poza nią (cisza), siatka promptów, rozjazd
  wersji, kopiowanie specyfikacji, ustawienia globalne (podstawiony `USERPROFILE`), warunkowa
  cisza quality-gate/design-check/auto-format, awarie guarda (zepsuty `relai.json`, nieistniejący
  `cwd`, śmieci na stdin) — wszystko kod 0.
- **Siedem sesji integracyjnych `claude -p`** (`--permission-mode acceptEdits`, bo domyślne
  uprawnienia headless blokują Write zanim hook cokolwiek zobaczy): (1) folder bez markera —
  zapis pliku z `sk-…` i JWT przeszedł, w transkrypcie zero komunikatów RelAI (trafienia „RelAI"
  to wyłącznie ścieżka folderu); (2) tryb gościa — jak wyżej; (3) cztery sekrety do plików
  śledzonych → cztery blokady, **pliki nie istnieją** (dowód na dysku), `.env` przeszedł,
  komunikaty nie cytują wartości; (4) edycja sekcji niemutowalnej → blokada, suma kontrolna
  `CLAUDE.md` **identyczna** przed i po (L-0007), niezwiązany zapis w tej samej sesji przeszedł;
  (5–6) **pomiar R2:** neutralny prompt bez fraz wyzwalających, 2/2 przebiegi — data dnia, nakaz
  rytuału i luka promptu E2 w kontekście przy **zerze** wywołań `Skill`; (7) **inicjalizacja bez
  `--add-dir`** w pustym folderze → komplet ośmiu dokumentów, marker 0.5.0, specyfikacje czytane
  z `.claude/relai/templates/` (8/8 plików w transkrypcie). Dodatkowo: `console-log-warn` na żywo —
  plik powstał mimo ostrzeżenia, a model powtórzył treść ostrzeżenia w odpowiedzi (D-41).
- `claude plugin validate` — „passed with warnings" (znane L-0003); `details` po reinstalacji:
  wersja 0.5.0, hooki zarejestrowane dla 4 zdarzeń — **CLI liczy typy zdarzeń, nie pliki**,
  stąd „Hooks (4)" przy ośmiu plikach (L-0018); inwentarz skilli bez zmian.
- **Nie sprawdzono:** zachowania `ask` w sesji interaktywnej (wszystkie pomiary w `-p`, gdzie
  „ask" degeneruje do odmowy) — do potwierdzenia w E10; `quality-gate`/`auto-format` na realnym
  projekcie TS z zainstalowanym tsc/prettierem (warunkowa cisza zmierzona, ścieżka pozytywna
  tylko jednostkowo przez brak takiego projektu w teście); powtarzalności statystycznej pomiaru
  R2 (dwa przebiegi).

**Świadomie odłożone:**
- Pozytywny test `quality-gate`/`auto-format` na projekcie z realnym tsc/eslint/prettierem — E10
  (pilotaż na projekcie `app`); warunek wykonalności: projekt testowy z zainstalowanymi
  narzędziami (L-0005).
- Rozszerzenie provisioning o pliki inne niż `*.md` (szablon HTML) — E6, wpisane do PROMPT_ETAP_6.
- Plik globalny `~/.claude/relai/USTAWIENIA.md` **celowo nie został utworzony** — powstanie
  naturalnie przy pierwszej realnej inicjalizacji projektu; hook już go czyta, gdy istnieje
  (zmierzone na podstawionym `USERPROFILE`).
- Wiersz USTAWIENIA o instalacji pluginu nadal wspomina 0.3.1 — zapis historyczny decyzji
  (append-only), stan bieżący: 0.5.0.

**Do zrobienia przez człowieka:**
- **Potwierdzić doprecyzowanie konwencji hook-guard** (README, sekcja hook-guard): dla zdarzenia
  wywołania skilla RelAI guardem jest samo to wywołanie — bez tego inicjalizacja w świeżym
  folderze nie dostaje specyfikacji. Jeśli wolisz sztywną interpretację „cisza wszędzie poza
  projektem RelAI", R8 wraca do stanu otwartego z mitygacją `--add-dir`.
- Zdecydować, czy `config-protection` ma pytać („ask") także przy dopisywaniu wierszy preferencji
  do `USTAWIENIA.md` (obecne zachowanie — bezpieczne, ale dokłada jedno kliknięcie), czy pytać
  wyłącznie przy zmianie istniejących wierszy i markera wersji.
- Uruchomić E6 wg `PROMPT_ETAP_6.md`: generacja pięciu propozycji — świeża sesja **Opus**;
  sesja wyboru i iteracja finału — **Fable** (D-85). *(faza 1 zrobiona 2026-08-07 — patrz kolejny wpis)*

### 2026-08-07 — E6 faza 1: pięć propozycji designu szablonu HTML planów

Autor: RelAI (Opus) + Lukasz

Etap E6 ma dwie fazy o różnych modelach (blok „Kontrola modelu" w `PROMPT_ETAP_6.md`). Ta sesja
wykonała **wyłącznie fazę 1** — generację pięciu propozycji. Faza 2 (sesja wyboru z użytkownikiem,
iteracja finału, `templates/HTML_PLAN/`, `SPEC_PLAN_HTML.md`, nadpisania lokalne D-62, rozszerzenie
provisioningu, wersja 0.6.0) należy do **Fable** i nie została rozpoczęta. Etap pozostaje `W TOKU`.

**Zrobione:**
- **`docs/zasoby/design-konkurs/README.md`** — zasady konkursu zapisane **przed** generacją, żeby
  weryfikacja miała punkt odniesienia, a nie ocenę po fakcie (L-0007). Zawiera: wspólną treść
  testową, dziewięć wymagań sprawdzalnych, pięć zakazów D-61 z kryterium mechanicznym dla każdego
  i tabelę pięciu kierunków. **Próg emoji ustalony na 0** — zamiast „umiarkowanego" progu, który
  wymaga oceny, co jest jeszcze umiarem. Folder `docs/zasoby/` powstał właśnie teraz (D-11).
- **Pięć propozycji** `propozycja-1…5.html`, każda jako pełny testowy plan płatności z przykładu
  `SPEC_PLAN.md` — te same 10 sekcji, ta sama treść, ta sama arytmetyka symulatora; różni je
  wyłącznie warstwa wizualna i interakcyjna:
  1. **Redakcja** — typografia książkowa, jedna kolumna z marginalią przyklejoną do sekcji,
     szeryfy, inicjał, zero kart i cieni, akcent rdzawy.
  2. **Terminal** — ciemny monospace, ramki znakowe, nagłówki sekcji jako wiersz konsoli,
     nawigacja klawiszami 1–9 i 0, wykresy w konwencji tekstowej.
  3. **Panel operacyjny** — przyklejona nawigacja boczna z podświetlaniem aktywnej sekcji
     (IntersectionObserver), sześć kafli metryk, akordeony na `aria-expanded`, suwaki sprzężone
     z polami liczbowymi, największa gęstość informacji.
  4. **Rysunek techniczny** — siatka milimetrowa w tle, tabelka rysunkowa zamiast nagłówka,
     pozycje zamiast numerów sekcji, linie wymiarowe z grotami jako wykres pracochłonności,
     kamień milowy pokazany jako wymiar na diagramie.
  5. **Plakat** — skala typograficzna do 6,2 rem, gruby kontur, asymetryczna siatka
     (numer sekcji w osobnej kolumnie), jeden kolor sygnalny i żółty jako zapas szacunku.
- **Symulator** (ten sam model we wszystkich pięciu, różne UI): dziewięć wejść — rezerwacje,
  średnia wartość, godziny ręcznego fakturowania, koszt godziny, prowizja %, opłata stała,
  udział traconych rezerwacji, marża, koszt wdrożenia. Wyjścia: obrót, prowizja, oszczędność
  pracy, odzysk, bilans miesięczny, zwrot wdrożenia, **próg opłacalności** (ile godzin ręcznej
  pracy musi być, żeby wyszło na zero) oraz przeliczany na żywo wykres skumulowanego bilansu
  przez 24 miesiące z zaznaczonym punktem zwrotu.

**Zweryfikowane — jak dokładnie:**
- **Kontrola mechaniczna** (skrypt Node, jedenaście testów na plik, 5/5 PASS): zero `http(s)://`
  w `src=`/`href=`; brak `backdrop-filter`; **dowód negatywny na fiolet (L-0007)** — wszystkie
  kolory heksadecymalne każdego pliku (10–17 na plik) przeliczone na HSL i sprawdzone, czy
  któryś nie wpada w zakres 250–330° przy nasyceniu >25%: zero trafień; `box-shadow`/`text-shadow`
  policzone — **0 we wszystkich pięciu plikach**, więc glow nie ma prawa wystąpić; emoji liczone
  przez `\p{Extended_Pictographic}` — **0 przy progu 0**; obecne sekcje `s1…s10`; ≥3 elementy
  `<svg>`; 9 pól liczbowych symulatora i nasłuch `input`; etykiety FAKT/SZACUNEK; ≥3 bloki
  zwijalne; `prefers-reduced-motion` w każdym pliku.
- **Symulatory na żywo w przeglądarce** (wszystkie pięć, plik otwarty z dysku): przy wartościach
  domyślnych bilans +563 zł/mies. i zwrot 12 mies.; po zmianie rezerwacji 320 → 640 wynik zmienia
  się na 54 400 zł obrotu, +406 zł bilansu i 16,6 mies. zwrotu, a wykres przelicza 25 punktów.
  **Przypadek skrajny:** zerowanie godzin ręcznego fakturowania daje bilans −157 zł i komunikat
  o braku zwrotu zamiast dzielenia przez zero. W propozycji 3 sprawdzono dodatkowo synchronizację
  suwaka z polem liczbowym i przełączanie akordeonu (`aria-expanded` true → false).
- **Responsywność:** wszystkie pięć plików przy szerokości 360 px — `scrollWidth` równy
  `clientWidth`, czyli **zero poziomego przewijania strony**; szerokie tabele przewijają się
  we własnym kontenerze.
- **Nie sprawdzono:** wyglądu na realnym urządzeniu mobilnym i w innych silnikach niż ten
  w podglądzie; wydruku; kontrastu zmierzonego narzędziem (dobierany ręcznie); odbioru propozycji
  przez człowieka — to jest właśnie faza 2.

**Świadomie odłożone (całość należy do fazy 2, model Fable):**
- Prezentacja propozycji i wybór 1–2 (AskUserQuestion), iteracja wg uwag, finalny szablon
  `templates/HTML_PLAN/` z design tokens i `templates/SPEC_PLAN_HTML.md`.
- Mechanizm nadpisania lokalnego (D-62) w `relai-planning`, honorowanie preferencji „HTML"
  z `USTAWIENIA.md`, usunięcie zdań „szablon HTML dochodzi w wersji następnej".
- Rozszerzenie `provisionTemplates` w `hooks/session-context.js` o pliki inne niż `*.md` —
  świadomie **nie** zrobione teraz: bez finalnego szablonu nie ma czego kopiować, a podbicie
  wersji pluginu przed dowiezieniem funkcji obiecywałoby coś, czego nie ma (L-0002).
- Wersja 0.6.0 w manifestach i dokumentach — razem z fazą 2, z `grep` po `0.5.0` (L-0008).

**Do zrobienia przez człowieka:**
- **Wybrać 1–2 propozycje** w sesji **Fable** (D-85): otworzyć pięć plików z
  `docs/zasoby/design-konkurs/` i powiedzieć, które kierunki wchodzą do iteracji oraz co w nich
  zmienić. Bez tego etap E6 stoi.
- Rozstrzygnąć, czy wybrany kierunek ma trafić także do **warstwy globalnej**
  `~/.claude/relai/USTAWIENIA.md` (kierunek designu jest preferencją ponadprojektową, D-23),
  czy zostać wyłącznie w tym projekcie.

### 2026-08-08 — E6 faza 1, runda 2: konkurs powtórzony po odrzuceniu wszystkich propozycji

Autor: RelAI (Opus) + Lukasz

**Korekta użytkownika, od której zaczyna się ten wpis:** żadna z pięciu propozycji rundy 1 nie
spodobała się. Cytat rozstrzygający: „może zbyt rygorystycznie podszedłem do stwierdzenia no
ai-slop". Kierunki 2–5 odrzucone **na stałe**, kierunek 1 (Redakcja) zachowany jako baza do
przebudowy.

**Zrobione:**
- **Lekcja L-0019** — lista zakazów to filtr końcowy, nie brief. Runda 1 przeszła całą kontrolę
  mechaniczną i nie trafiła w gust, bo optymalizowała pod zakazy zamiast pod cechy pożądane.
  Zasada aktywna nr 19: przy zadaniu wizualnym najpierw zbierz cechy pozytywne, a serię wariantów
  poprzedź jednym wariantem kalibrującym.
- **Zmiana decyzji D-61 → D-61a** (sekcja „Decyzje zmienione" w `DECYZJE.md`, założona teraz):
  zaokrąglenia, **lekki** glassmorphism, animacja służebna, typografia ozdobna i dekoracyjne SVG
  są **dozwolone**; zostają zakazy fioletu i glow, przesytu emoji, generycznych fraz i stocków.
  **D-61b**: cztery odrzucone kierunki nie wracają jako warianty ani inspiracje.
- **Wywiad przed pracą** (trzy pytania, `AskUserQuestion`): fonty osadzone w base64; baza
  mieszana — trzy jasne, dwie ciemne; ruch „wyraźny, ale służebny". Odpowiedzi zapisane
  w `USTAWIENIA.md` razem z opisem gustu.
- **Fonty** (`docs/zasoby/fonts/` + `LICENCJE.md`): Fraunces, Instrument Sans, Hanken Grotesk
  i JetBrains Mono znalezione lokalnie w pakietach `@fontsource*` innych projektów; **Caveat
  i Kalam pobrane z fonts.gstatic.com za wyraźną zgodą użytkownika** (obie na SIL OFL, więc wolno
  je osadzać i rozsyłać). Kroje systemowe Microsoftu **świadomie nieosadzone** — licencja tego
  zabrania; mogą wystąpić tylko jako nazwa w `font-family`.
- **Runda 1 przeniesiona** do `docs/zasoby/design-konkurs/runda-1/` (`git mv`, historia zachowana).
  README konkursu przepisany: brief rundy 2 z cechami pożądanymi, zakazy które zostały, opis
  porażki rundy 1.
- **Pięć nowych propozycji** w `runda-2/`, każda z innym mechanizmem zwijania sekcji:
  1. **Zeszyt** (jasna) — przebudowana Redakcja: Fraunces z osią WONK i Caveat, karteczki
     na marginesie z lekkim obrotem, ręcznie rysowane podkreślenia i strzałki w SVG, uchwyt
     zwijania obracany o 135°.
  2. **Studio nocne** (ciemna) — szklane panele na rozmytych plamach mięty i bursztynu,
     Fraunces w kursywie, przełącznik pigułkowy jako mechanizm zwijania.
  3. **Tablica warsztatowa** (jasna) — kartki przypięte pinezkami, taśma klejąca, Kalam
     jako krój prowadzący, sekcje lekko obrócone, treść rozwija się z perspektywą `rotateX`.
  4. **Mapa podróży** (jasna) — kręta ścieżka SVG w lewym marginesie **rysowana wraz
     z przewijaniem**, sekcje jako przystanki z numerowanymi kołami, treść wyrasta jak dymek.
  5. **Przepis** (ciemna) — ciepły węgiel z miedzią i oliwką, Kalam w nagłówkach, składniki
     odhaczane checkboxem, który wypełnia się przy rozwijaniu.
- Wszystkie pięć: animowany punkt świetlny na diagramie przepływu (`animateMotion`), płynne
  liczniki, aktywna sekcja podświetlana w pasku (`IntersectionObserver`), ten sam symulator
  na dziewięciu wejściach.

**Zweryfikowane — jak dokładnie:**
- **Kontrola mechaniczna 5/5 PASS** (17 testów na plik): zero `http(s)` w `src`/`href`/`url()`;
  4–6 fontów osadzonych jako `data:font/woff2;base64` i **zero niepodmienionych znaczników**;
  **dowód negatywny na fiolet** — 12–48 barw heksadecymalnych na plik przeliczonych na HSL, zero
  w zakresie 250–330° przy nasyceniu >25%; **emoji 0 przy progu 0**; komplet sekcji `s1…s10`;
  6–29 elementów `<svg>`; 9 pól symulatora; etykiety FAKT/SZACUNEK; 8 bloków zwijalnych
  na `aria-expanded`; `prefers-reduced-motion` w każdym pliku. Dodatkowo test **cech wymaganych**
  briefem: glassmorphism 2–6 reguł, 18–23 zaokrąglenia, 12–15 elementów ruchu na plik.
- **Na żywo w przeglądarce, wszystkie pięć:** `document.fonts.ready` potwierdza status `loaded`
  dla obu rodzin w każdym pliku (Fraunces+Caveat, Fraunces+JetBrains, Kalam+Hanken,
  Instrument+Caveat, Kalam+JetBrains). Symulator: 320 → 640 rezerwacji zmienia obrót na 54 400 zł,
  bilans na +406 zł i zwrot na 16,6 mies.; powrót do 320 przywraca +563 zł. Wyzerowanie godzin
  ręcznej pracy daje −157 zł i „nie zwraca się" zamiast dzielenia przez zero. Zwijanie:
  `aria-expanded` przechodzi `true → false`. W propozycji 4 ścieżka SVG ma policzoną długość
  1008 i realny `strokeDashoffset` zależny od przewinięcia.
- **Defekt znaleziony i poprawiony w trakcie:** animowane liczniki oparte na
  `requestAnimationFrame` **zatrzymywały się w połowie w karcie w tle** — wynik zostawał
  nieaktualny, mimo że model policzył poprawnie. Poprawka we wszystkich pięciu plikach: skrót
  przy `document.hidden` plus zabezpieczenie `setTimeout`, które i tak dopisuje wartość końcową.
  Zmierzone ponownie po poprawce — wszystkie liczniki dochodzą do właściwej wartości.
- **Responsywność:** wszystkie pięć przy 360 px — `scrollWidth` równy `clientWidth`, zero
  poziomego przewijania strony.
- **Waga plików:** 172–278 KB (fonty base64 to 60–75% tej wagi). Świadomy koszt osadzenia —
  patrz „Świadomie odłożone".
- **Nie sprawdzono:** wyglądu w innych silnikach niż ten w podglądzie i na realnym urządzeniu
  mobilnym; wydruku; kontrastu zmierzonego narzędziem; odbioru przez człowieka — to jest faza 2.

**Świadomie odłożone:**
- **Podzbiór fontów tylko do użytych znaków** — brak narzędzia do subsettingu w tej sesji; pliki
  ważą 172–278 KB zamiast możliwych ~80–120 KB. Do rozważenia przy finalnym szablonie, gdy będzie
  wiadomo, który krój zostaje (ryzyko R5).
- Cała faza 2: wybór 1–2 kierunków, iteracja, `templates/HTML_PLAN/`, `SPEC_PLAN_HTML.md`,
  nadpisania lokalne (D-62), rozszerzenie provisioningu o pliki inne niż `*.md`, wersja 0.6.0.

**Do zrobienia przez człowieka:**
- **Obejrzeć pięć propozycji z `runda-2/` i wskazać 1–2 kierunki** do iteracji wraz z uwagami.
  Bez tego etap E6 stoi.
- Rozstrzygnąć, czy waga pliku rzędu 200–280 KB jest akceptowalna dla planu wysyłanego klientowi,
  czy finalny szablon ma mieć okrojony podzbiór znaków.

### 2026-08-08 — E6: wybór kierunku designu i blend „Warsztat" (runda 3)

Autor: RelAI (Opus) + Lukasz

**Wybór użytkownika po obejrzeniu rundy 2:** do drugiej tury przechodzą **propozycja 1 „Zeszyt"
i propozycja 3 „Tablica warsztatowa"**, z przewagą Tablicy jako bazy. Reszta rundy 2 odpada.

**Zrobione — blend `docs/zasoby/design-konkurs/runda-3/blend.html`:**
- **Baza: Tablica warsztatowa** — kartki sekcji przypięte pinezkami, taśma klejąca, Kalam jako
  krój prowadzący, lekki obrót sekcji, spinacz jako mechanizm zwijania.
- **Z Zeszytu przeniesione trzy rzeczy wskazane wprost:** (1) **pasek górny** — pigułka na szkle
  z odręcznym „do akceptacji!" pod kątem i ikoną notatnika; (2) **karteczki na marginesie**
  w sekcjach 1 i 2 (dodatkowo w 9, bo tam też pilnują czytelnika przed tabelą decyzji);
  (3) **paleta terakotowa** — glina `#c4643c`, musztarda `#d9a134`, szałwia `#5f8a68`.
- **Błękit wycięty z całego dokumentu:** paski wykresu etapów, aktywna pozycja w nawigacji,
  numery sekcji, pinezki, akcenty diagramu i suwaki symulatora są teraz terakotowe albo
  szałwiowe. Pinezki cyklują przez trzy barwy palety zamiast jednej.
- **Tło pośrednie `#f2e9d8`** — korek Tablicy `#e8dcc6` był za ciemny, krem Zeszytu `#fbf6ec`
  za jasny; delikatna faktura kropkowa i dwie miękkie poświaty zostały, ale przygaszone.
- **Ruch ścięty zgodnie z poleceniem:** usunięte podnoszenie kart, kafli i metek na najechanie,
  obracanie karteczek, skalowanie wyników symulatora i prostowanie sekcji pod kursorem. Zostaje
  wyłącznie to, co niesie informację: rozwijanie sekcji, obrót spinacza, zmiana tła przycisku,
  obwódka pola przy fokusie i licznik przeliczający wynik (skrócony z 370 do 300 ms).
- **Animowana kropka na diagramie przepływu usunięta** — nie niosła treści, a przyciągała wzrok
  bez powodu. Ścieżkę udanej płatności odróżnia teraz linia ciągła od przerywanej ścieżki
  wygaśnięcia, co jest czytelne także na wydruku i w zrzucie ekranu.
- **Wynik zapisany w `USTAWIENIA.md`** jako kierunek designu projektu (wymóg sekcji „Weryfikacja"
  w `PROMPT_ETAP_6.md`).

**Zweryfikowane — jak dokładnie:**
- **Kontrola mechaniczna PASS** (18 testów): zero zasobów sieciowych, 6 fontów osadzonych
  i zero niepodmienionych znaczników, **zero fioletu wśród 50 barw** przeliczonych na HSL,
  **emoji 0**, komplet sekcji `s1…s10`, 30 elementów `<svg>`, 9 pól symulatora, etykiety
  FAKT/SZACUNEK, 8 bloków zwijalnych, `prefers-reduced-motion`, glassmorphism i zaokrąglenia
  nadal obecne. **Nowy test negatywny:** `animateMotion` = 0, czyli kropka faktycznie zniknęła.
- **Na żywo w przeglądarce:** fonty Kalam i Hanken Grotesk `loaded`; symulator 320 → 640
  rezerwacji daje 54 400 zł obrotu, +406 zł bilansu i 16,6 mies. zwrotu, powrót do 320 przywraca
  +563 zł; wyzerowanie godzin ręcznej pracy daje −157 zł i „nie zwraca się"; zwijanie przechodzi
  `true → false`; trzy karteczki na marginesie obecne; tło `rgb(242, 233, 216)` mieści się między
  korkiem a kremem; pasek górny półprzezroczysty `rgba(252, 247, 238, .78)`.
- **Responsywność 360 px:** zero poziomego przewijania, karteczki tracą opływanie
  (`float: none`), sekcje tracą obrót — czyli oba efekty dekoracyjne wyłączają się na wąskim
  ekranie zamiast rozpychać układ.
- **Próg kontrolny zmieniony świadomie:** test „liczba elementów ruchu" wymagał ≥10 (brief
  rundy 2); po poleceniu ograniczenia animacji obniżony do ≥6, z powodem zapisanym w skrypcie.
  Blend ma 9 — mniej niż runda 2, więcej niż zero.
- **Nie sprawdzono:** wydruku; kontrastu zmierzonego narzędziem; wyglądu w innych silnikach
  i na realnym urządzeniu mobilnym.

**Świadomie odłożone:**
- Podzbiór fontów tylko do użytych znaków — plik waży 210 KB, z czego ~145 KB to Kalam i Hanken
  w base64. Decyzja przy finalnym szablonie (ryzyko R5, pytanie do człowieka z poprzedniego wpisu
  nadal otwarte).
- Cała reszta zakresu E6: `templates/HTML_PLAN/` z design tokens, `SPEC_PLAN_HTML.md`, nadpisania
  lokalne (D-62), rozszerzenie provisioningu, wersja 0.6.0.

**Do zrobienia przez człowieka:**
- Obejrzeć blend i powiedzieć, czy to jest już ten kierunek, czy potrzeba kolejnej iteracji.
  Dopiero po akceptacji ma sens zamrażanie go w `templates/HTML_PLAN/`.
  *(zaakceptowany 2026-08-08 — patrz kolejny wpis)*

### 2026-08-08 — E6: kierunek zaakceptowany, szablon `templates/HTML_PLAN/` zamrożony

Autor: RelAI (Opus) + Lukasz

**Akceptacja:** „tak, to jest ten kierunek — zamroź go w templates/HTML_PLAN/". Jedna poprawka
wizualna do naniesienia: pozycje sekcji w pasku górnym szły groteskiem, gdy reszta strony jest
pisana Kalamem.

**Zrobione:**
- **Poprawka paska górnego** w `blend.html` i w szablonie: pozycje nawigacji, nazwa i dopisek
  „· plan" przeszły na Kalam (1,06 rem, aktywna pozycja pogrubiona). Pasek przestał odstawać
  od reszty dokumentu.
- **`templates/HTML_PLAN/szablon.html`** — szkielet planu: **design tokens w `:root`** (tło,
  płaszczyzny, tekst, kreski, trzy barwy sygnalne, promienie, cienie, trzy kroje), komponenty
  w CSS opisane nagłówkami, pasek, szyld, dziesięć pustych sekcji z pinezkami cyklującymi przez
  trzy barwy, stopka i skrypt. Znaczniki `{{…}}` w miejscach treści.
- **`templates/HTML_PLAN/komponenty.html`** — jedenaście gotowych fragmentów do wklejenia:
  karteczka na marginesie (dwa warianty), etykiety FAKT/SZACUNEK, listy celów i nie-celów, tabela,
  naklejki statusu, karta wariantu z werdyktem, przypadek brzegowy, diagram przepływu, wykres
  słupkowy, symulator z kompletem dziewięciu pól oraz dwie wstawki JavaScript (`licz`, `odswiez`).
- **`templates/HTML_PLAN/zbuduj.js`** — builder w Node bez zależności: podmienia `/*{{FONTY}}*/`
  na sześć reguł `@font-face` z `data:` URI i **wypisuje niewypełnione znaczniki, kończąc kodem
  1**. Powód istnienia: ~145 KB base64 to nie jest coś, co model przepisze z pliku do pliku —
  to musi zrobić proces.
- **`templates/HTML_PLAN/fonty/`** — sześć podzbiorów WOFF2 (Kalam 400/700, Hanken Grotesk,
  latin + latin-ext), licencje w `docs/zasoby/fonts/LICENCJE.md`.
- **`templates/SPEC_PLAN_HTML.md`** — jak wygenerować plan HTML: sześciokrokowa procedura, tabela
  tokenów z przeznaczeniem każdego, sześć zakazów (w tym **jawny zakaz kropki wędrującej po
  diagramie**), pięć wymagań dostępności, waga pliku jako świadomy koszt, odesłanie do
  kompletnego przykładu. Rozgraniczenie wobec `SPEC_PLAN.md`: przy sporze o treść rozstrzyga
  `SPEC_PLAN.md`, ta specyfikacja opisuje wyłącznie nośnik.
- **`templates/README.md`** — dopisany wiersz `SPEC_PLAN_HTML` i sekcja tłumacząca, dlaczego
  `HTML_PLAN/` jest **jedynym miejscem z plikami do skopiowania**, a nie ze specyfikacją, i czemu
  nie łamie to D-60 (kopiowany jest nośnik, treść nadal powstaje przez generację).
- **`hooks/session-context.js`** — `provisionTemplates` przepisany na **rekurencyjne kopiowanie
  drzewa** z zachowaniem podkatalogów; lista rozszerzeń rozszerzona z samego `.md` na
  `.md/.html/.js/.css/.woff2`. Bez tego szablon nie dotarłby do żadnej sesji (L-0012).

**Zweryfikowane — jak dokładnie:**
- **Test dymny całego toru** (skrypt składający plan z szablonu i komponentów, potem builder):
  dziesięć sekcji na wyjściu, sześć reguł `@font-face`, zero niewypełnionych znaczników, plik
  197 KB. W przeglądarce: **Kalam i Hanken Grotesk `loaded`**, symulator liczy — 320 → 640
  rezerwacji daje 54 400 zł obrotu, +406 zł bilansu i 16,6 mies. zwrotu, powrót do 320 przywraca
  +563 zł i 12 mies., wyzerowanie godzin daje −157 zł i „nie zwraca się"; wykres narysowany,
  zwijanie `true → false`, dwie karteczki na marginesie, zero poziomego przewijania.
  **Liczby zgadzają się co do złotówki z blendem** — czyli szablon odtwarza wzorzec, a nie
  własną wersję.
- **Defekt znaleziony i poprawiony w trakcie:** klucz symulatora bez odpowiadającego pola
  wywracał **cały** symulator (`v()` czytało `null.value`), a padał cicho — sekcje dalej się
  zwijały, więc na oko wyglądało to na sprawny dokument. Po poprawce brakujące wejście liczy się
  jako zero i trafia jako ostrzeżenie do konsoli, a reszta liczy dalej. Przy okazji przykład
  symulatora w komponentach rozrósł się z jednego pola do kompletu dziewięciu — na jednym polu
  test nie sprawdzał realnego liczenia.
- **Drugi defekt, złapany przez builder:** komentarz w komponencie zawierał dosłowny
  `{{KLUCZE_SYMULATORA}}`, który wjeżdżał do gotowego pliku jako niewypełniony znacznik. Builder
  to zgłosił i zwrócił kod 1 — czyli kontrola robi dokładnie to, po co powstała.
- **Provisioning zmierzony osobno** (payload `SessionStart` budowany w Node — L-0017), ścieżka
  `Proba RelAI E6 szablon\projekt testowy` ze spacją: **22 pliki skopiowane** (13 `.md`,
  2 `.html`, 1 `.js`, 6 `.woff2`), komplet plików kluczowych obecny, **font identyczny bajt
  w bajt** po kopiowaniu, hook zgłosił lokalną kopię w treści wstrzykniętej sesji. Folder testowy
  usunięty.
- `claude plugin validate` → „Validation passed with warnings", jedno znane ostrzeżenie
  o root `CLAUDE.md` (L-0003).
- **Nie sprawdzono:** wygenerowania planu HTML przez **świeżą sesję** z zainstalowanego pluginu —
  to wymaga wcześniejszego domknięcia reszty E6 (honorowanie preferencji formatu w skillu,
  wersja 0.6.0) i sekwencji push → `marketplace update` → reinstalacja (L-0004). Do zrobienia
  razem z zamknięciem etapu.

**Świadomie odłożone:**
- **Mechanizm nadpisania lokalnego (D-62)** — `SPEC_PLAN_HTML.md` odsyła do skilla
  `relai-planning`, ale sam skill jeszcze tego nie opisuje. Odłożone razem z punktem niżej, żeby
  obie zmiany w skillu weszły jedną ręką.
- **Honorowanie preferencji „HTML"** w `relai-planning` i usunięcie z obu skilli oraz
  `SPEC_KOMENDY.md` zdań „szablon HTML dochodzi w wersji następnej" — teraz już dochodzi.
- **Wersja 0.6.0** w manifestach, README pluginu, `SPEC_KOMENDY`, `SPEC_USTAWIENIA`, obu skillach
  i markerze `docs/USTAWIENIA.md`, z `grep` po `0.5.0` (L-0008).
- Podzbiór fontów ograniczony do użytych znaków — pytanie do człowieka z wpisu o rundzie 2
  nadal otwarte.

**Do zrobienia przez człowieka:**
- Zdecydować, czy resztę E6 (nadpisania lokalne D-62, honorowanie preferencji formatu, wersja
  0.6.0) domyka ta sama sesja, czy osobna — wtedy trzeba ją odpalić z aktualnym stanem.
  *(domknięte 2026-08-08 w osobnej sesji — patrz wpis niżej)*

### 2026-08-08 — E6 ZAMKNIĘTY: preferencja „HTML", nadpisania lokalne D-62, RelAI 0.6.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **`skills/relai-planning/SKILL.md` honoruje preferencję formatu.** Krok 4 rozgałęzia się na
  `PLAN.md` (wg `SPEC_PLAN`) i `PLAN.html` (wg `SPEC_PLAN_HTML`); doszła sekcja „Plan główny w HTML"
  z **wypisaną w treści skilla** sześciokrokową procedurą i kolejnością szukania szablonu (L-0011).
  Pytanie o format w Kroku 3 rekomenduje teraz HTML zamiast zdania „jedyny działający w tej wersji".
  `STATUS.md`, prompty etapowe i MINIPLAN-y zostają w Markdown (D-32).
- **Nadpisanie lokalne (D-62)** opisane w tym samym skillu: pytanie **raz na projekt**, po pokazaniu
  pierwszego planu HTML; zgoda kopiuje całe drzewo `HTML_PLAN/` razem z `fonty/`, wygląd zmienia się
  wyłącznie przez tokeny w `:root`, wynik — także odmowa — ląduje wierszem „Szablon planu HTML"
  w `docs/USTAWIENIA.md`.
- **Rozstrzygnięcie lokalizacji nadpisania: `docs/zasoby/HTML_PLAN/`, nie `.claude/relai/`.**
  Prompt etapu proponował `.claude/relai/local-templates/`. Obie lokalizacje przeżywają aktualizację
  pluginu (hook pisze wyłącznie do `templates/`), więc R6 nie rozstrzyga wyboru. Rozstrzyga to, co
  dzieje się **poza** aktualizacją: `.claude/relai/` jest cache'em nadpisywanym przy każdym starcie
  sesji i objętym `.gitignore` z `*`, więc własny styl zniknąłby przy klonowaniu repo, na drugiej
  maszynie i u współpracownika. Świadoma decyzja projektu należy do repozytorium (D-11, D-24), nie
  do cache'u. Uzasadnienie wpisane do skilla, żeby następna sesja nie „poprawiła" tej lokalizacji.
- **Usunięte obietnice** „szablon HTML dochodzi w wersji następnej”: `SPEC_PLAN.md` (rozgraniczenie
  treść/nośnik), `SPEC_KOMENDY.md`, README pluginu, oba skille. `grep -i "szablon HTML"` przejrzany
  w całości — zostały wyłącznie wystąpienia historyczne i te opisujące działający mechanizm (L-0002).
- **Wersja 0.6.0** w obu manifestach, README pluginu, `SPEC_KOMENDY.md` (zakres 0.6.0 z planem HTML
  i nadpisaniem lokalnym + dwa wiersze w przykładzie dla użytkownika), `SPEC_USTAWIENIA.md`
  (marker, wiersz „Szablon planu HTML”, uwaga o projektowym charakterze tej preferencji), obu
  skillach i markerze `docs/USTAWIENIA.md` tego repo.
- **`templates/README.md`** — akapit o nadpisaniu lokalnym i o tym, czemu nie mieszka w cache'u.
- **`PROMPT_ETAP_7.md`** wygenerowany wg `SPEC_PROMPT_ETAPU` (dziewięć elementów).

**Zweryfikowane — jak dokładnie:**
- **Wersja realnie zainstalowana:** `~/.claude/plugins/installed_plugins.json` →
  `relai@relai 0.6.0`, `installPath …/cache/relai/relai/0.6.0`, `gitCommitSha 79e489d`.
- **Projekt testowy „HTML"** (ścieżka `Próba RelAI E6 domknięcie\projekt HTML` — spacja i „ó"),
  preferencja „HTML", świeża sesja `claude -p` **bez `--add-dir`**: powstał `PLAN.html` 237 KB.
  Kontrola mechaniczna: **zero** niewypełnionych znaczników `{{…}}`, **zero** `http(s)://`
  w `src`/`href`/`url()`, sześć reguł `@font-face`, dziesięć sekcji o tytułach z `SPEC_PLAN`
  (Streszczenie … Aneksy), 13 elementów z `aria-expanded`, 37 `<svg>`, **zero** emoji, **zero**
  `animateMotion` (dowód negatywny do zakazu kropki), 12 etykiet FAKT/SZACUNEK. Obok — `STATUS.md`
  w Markdown i jedna linia aktywnego planu w `CLAUDE.md`.
- **Zachowanie na żywo** (plik podany przez lokalny serwer HTTP, bo panel podglądu renderuje
  `file://` jako statyczny zrzut): `Kalam:loaded`, `Hanken Grotesk:loaded`; symulator ma 11 pól,
  zmiana liczby transakcji 12 000 → 24 000 przestawia bilans **+7 104 zł → +14 208 zł** i zwrot
  **6,8 → 3,4 mies.**, powrót do 12 000 przywraca wartości wyjściowe; przycisk sekcji przechodzi
  `true → false → true`; pięć tabel, wszystkie wewnątrz `.przewin`.
- **Projekt testowy „Markdown"** (ta sama ścieżka bazowa): świeża sesja dała `PLAN.md` + `STATUS.md`.
  Preferencja formatu rozstrzyga, nie przypadek.
- **Pierwszeństwo nadpisania lokalnego:** w projekcie „HTML" założono `docs/zasoby/HTML_PLAN/`
  z podmienionym tokenem `--glina:#1f6f6b`. Drugi plan wygenerowany w tym samym projekcie przez
  świeżą sesję zawiera **token nadpisania** i **nie zawiera** tokenu z pluginu `#c4643c`.
- **Kolizja znaleziona przy okazji:** sesja generująca drugi plan chciała dopisać wiersz „Szablon
  planu HTML" do `docs/USTAWIENIA.md` i **hook `config-protection` ją zablokował** (plik jest
  chroniony, zmiana wymaga potwierdzenia człowieka). W sesji nieinteraktywnej potwierdzenia nie ma,
  więc wiersz nie powstał, a sesja o tym powiedziała. Krok 3 procedury D-62 w skillu dostał zdanie
  o tej blokadzie: potwierdzenie jest oczekiwane, ale zapisu nie wolno odpuścić po cichu — bez
  wiersza pytanie o styl wraca przy każdym planie (L-0006).
- **Przeżycie aktualizacji (R6):** po `marketplace update` + `plugin update` + świeżej sesji
  dziewięć plików nadpisania ma **identyczne sumy kontrolne**, własny token na miejscu, token
  z pluginu nie wrócił; w tym samym czasie cache `.claude/relai/templates/HTML_PLAN/szablon.html`
  **ma** token z pluginu i różni się sumą — czyli hook działał, a nadpisania nie dotknął.
- `claude plugin validate .claude-plugin/plugin.json` → „Validation passed with warnings", jedno
  znane ostrzeżenie o root `CLAUDE.md` (L-0003). `grep` po `0.5.0` rozstrzygnięty: wszystkie
  pozostałe trafienia są historyczne (wpisy o E5, prompty etapów 5–6, zdania „nowe w 0.5.0").
- **Defekt procesu złapany w trakcie:** pierwszy przebieg pomiarowy poszedł na **0.5.0** mimo
  `marketplace update` + `plugin install` („already installed") i mimo `plugin details` pokazującego
  0.6.0 — sesja wygenerowała `PLAN.md` i napisała wprost „plugin 0.5.0 nie ma szablonu HTML".
  Podmianę wykonał dopiero `claude plugin update relai@relai`. Stąd **L-0020** i poprawiona
  sekwencja w zasadzie 4. Drugi facet tego samego problemu wyszedł na końcu etapu: poprawka
  wypchnięta **bez** podbicia wersji nie dociera wcale — `plugin update` porównuje numer wersji
  i melduje „already at the latest version", zostawiając cache na starym commicie. Zadziałał
  dopiero `uninstall` + `install`; stan końcowy potwierdzony:
  `installed_plugins.json` → `0.6.0`, `gitCommitSha 22b1b1f`, a skill w cache'u zawiera zdanie
  o `config-protection`.
- Foldery testowe usunięte po pomiarach.

**Świadomie odłożone:**
- **Pełny przebieg D-62 od strony rozmowy** (pytanie → zgoda → kopia → wiersz w `USTAWIENIA.md`)
  niezmierzony: `AskUserQuestion` nie działa w trybie `-p`, a sesja testowa sama to odnotowała
  („pytanie o nadpisanie pada po obejrzeniu pierwszego planu"). Zmierzono to, co da się zmierzyć
  bez interakcji: pierwszeństwo kopii i jej przeżycie aktualizacji. Reszta — w sesji interaktywnej
  w E10, razem z powtórnym pomiarem R2.
- **Brak przewijania w poziomie** — panel podglądu raportuje `clientWidth = 0`, więc kryterium nie
  da się na nim postawić (L-0018). Sprawdzone pośrednio: wszystkie tabele w `.przewin`. Do
  potwierdzenia okiem przy pierwszym planie otwartym przez człowieka.
- **Podzbiór fontów ograniczony do użytych znaków** (~145 KB base64, R5) — pytanie z rundy 2
  nadal otwarte; plan waży 237 KB, co na razie nikomu nie przeszkadza.
- `/relai-update` respektujący nadpisania lokalne — **E9** (D-72).

**Do zrobienia przez człowieka:**
- Przy pierwszym własnym planie HTML: sprawdzić, czy pytanie o zmianę stylu pada raz i czy plan
  otwiera się bez przewijania w poziomie.
- Decyzja o podzbiorze fontów (waga pliku kontra komplet znaków) — patrz R5.

### 2026-08-08 — E7: sześć komend operacyjnych, sygnał wycieczki, RelAI 0.7.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **Sześć plików komend** w `commands/`, wszystkie wg wzorca `relai-stage.md` (front matter,
  Krok 0 z markerem, procedura wypisana w treści — komenda nie ładuje skilla, L-0015):
  - **`relai-backup.md`** (D-43): lokalizacja szukana w kolejności argument → `USTAWIENIA.md`
    → warstwa globalna → dopiero pytanie (L-0006), odpowiedź zapisywana **globalnie**; nazwa
    `NAZWA_RRRR-MM-DD_GGMM.zip`; trzy grupy wykluczeń (sekrety twarde z D-42, runtime, śmieci
    systemowe) przy świadomym **zachowaniu `.git`**; pakowanie rozstrzygnięte per system;
    obowiązkowa weryfikacja archiwum przed wpisem w dzienniku.
  - **`relai-audit.md`** (D-45): dwie części raportu (porządki / zdrowie), sekret w pliku śledzonym
    jako jedyna pozycja krytyczna raportowana na górze i **bez cytowania wartości**, wynik zawsze
    kończy się numerowaną listą propozycji i pytaniem; zmiany dopiero po wskazaniu numerów.
  - **`relai-changelog.md`** (D-17): zakres jako argument (`od <data>`, `od <wersja>`,
    `ostatnie N`), cztery reguły destylacji, pomijanie wpisów MINIPLAN, wynik na ekran; plik
    `docs/CHANGELOG.md` wyłącznie na wyraźną prośbę i bez nadpisywania istniejącego.
  - **`relai-handover.md`**: pakiet HTML składany **z `templates/HTML_PLAN/`** (kolejność szukania
    szablonu: nadpisanie lokalne → cache → komunikat i `--add-dir`), sześć sekcji zamiast dziesięciu
    planowych, bloki `s7`–`s10` usuwane w całości, znaczniki symulatora wypełniane wartościami
    pustymi, builder fontów na końcu.
  - **`relai-tour.md`** (D-27): oprowadzanie **wyłącznie z dokumentów**, ośmiopunktowy układ
    zakończony sekcją „Czego dokumenty nie mówią", zero zapisów na dysk.
  - **`relai-help.md`** (D-07): prezentuje `docs/KOMENDY.md`, filtruje po argumencie, porównuje
    wersję ściągi z markerem projektu; brak pliku → propozycja wygenerowania ze `SPEC_KOMENDY.md`
    i czekanie na zgodę. **Zero własnej listy komend** — plik nie wymienia ani jednej innej komendy.
- **Sygnał „nieznany autor" w hooku `session-context`** (nowa funkcja `unknownAuthor`): porównuje
  `user.name` z `.git/config`, a w razie braku z `~/.gitconfig` i `~/.config/git/config`,
  z podpisami `Autor:`/`Author:` w dzienniku; brak trafienia → wstrzyknięcie zdania o cudzym
  projekcie z poleceniem **zaproponowania** wycieczki i czekania na zgodę. Porównanie odporne na
  diakrytyki (NFD + `ł`).
- **`skills/relai-core/SKILL.md`**: nowa sekcja „Propozycja wycieczki po cudzym projekcie" jako
  druga warstwa sygnału (wzorzec siatki D-34) + zdanie o tym, że operacje rzadkie mają własne
  komendy, a ich procedury nie mieszkają w skillu.
- **`templates/SPEC_KOMENDY.md`**: sekcja „Zakres wersji 0.7.0", tabela komend z **siedmioma**
  pozycjami, dwa nowe punkty w „Czego RelAI pilnuje bez proszenia", przykład wygenerowanego
  `KOMENDY.md` przepisany na 0.7.0 (L-0001), zakaz zawężony do `/relai-adopt` i `/relai-update`.
- **Wersja 0.7.0** w obu manifestach, README pluginu (nowy akapit o komendach operacyjnych),
  `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`, obu skillach i markerze `docs/USTAWIENIA.md` repo.

**Zweryfikowane — jak dokładnie:**
- **Wersja realnie zainstalowana:** `~/.claude/plugins/installed_plugins.json` →
  `relai@relai 0.7.0`, `installPath …/cache/relai/relai/0.7.0`, `gitCommitSha 68c1e03`.
  `claude plugin validate` → „Validation passed with warnings", jedno znane ostrzeżenie o root
  `CLAUDE.md` (L-0003).
- **Sześć świeżych sesji `claude -p`** w projektach testowych na ścieżce `Próba RelAI E7`
  (spacja + „ó"), każda komenda osobno. Wyniki:
  - `/relai-backup` → `projekt_wlasny_2026-08-08_2201.zip`, 7 612 B. Kontrola **moja, nie sesji**:
    nagłówek `50 4B 03 04`, 22 wpisy, struktura z katalogiem projektu w korzeniu.
  - `/relai-audit` → raport z siedmioma znaleziskami zdrowia i siedmioma propozycjami
    (m.in. wykryty rozjazd `PLAN.md` E1–E3 vs `STATUS.md` E1–E2, cytowane ryzyko R3 nieistniejące
    w tabeli, destylat lekcji bez lekcji źródłowej).
  - `/relai-changelog` → lista zmian z czterech wpisów, zakres dat podany pod listą, poprawka
    kalendarza świadomie scalona z wadą; **pliku nie utworzył** (`Test-Path docs/CHANGELOG.md`
    → `False`), skończył pytaniem o zapis.
  - `/relai-handover` → `docs/zasoby/PRZEKAZANIE_2026-08-08.html`, 201 KB.
  - `/relai-tour` → pełne oprowadzenie z ośmioma sekcjami; suma kontrolna `docs/` identyczna
    przed i po.
  - `/relai-help` → treść `docs/KOMENDY.md` wypisana w całości, bez ani jednej dopisanej pozycji.
- **Dowód negatywny do D-42:** projekt testowy miał `.env` z `SECRET_TOKEN=abcdef1234567890`.
  Lista wpisów archiwum odczytana przez `System.IO.Compression.ZipFile` — `grep` po
  `\.env|node_modules|\.pem$|\.key$` daje **zero trafień**. Sprawdzone na archiwum, nie na
  deklaracji komendy.
- **Dowód negatywny do D-45:** SHA-256 po posortowanej liście haszy plików `docs/` przed
  `/relai-audit` i po nim: `75df26b5…79d3a6` = `75df26b5…79d3a6`. Audyt nie ruszył ani jednego pliku.
- **Dowód negatywny do D-07:** `grep` po nazwach wszystkich komend w `commands/relai-help.md` →
  **zero trafień**. Help nie zna nazwy żadnej komendy poza własną.
- **Propozycja wycieczki, dwa przebiegi na neutralnym prompcie** („Ile plików jest w katalogu
  docs?"): projekt z dziennikiem podpisanym „+ Anna Kowalska" → odpowiedź kończy się zdaniem
  „Projekt wygląda na cudzy… Chcesz wycieczkę?"; projekt podpisany „+ Lukasz" → odpowiedź bez ani
  jednego zdania o wycieczce. Dowód z treści odpowiedzi, nie ze zdarzenia w transkrypcie (L-0017).
- **Sześć testów jednostkowych funkcji `unknownAuthor`** (payloady budowane Nodem): cudzy projekt →
  sygnał, własny → cisza, własny z „Łukasz" vs „Lukasz" w dzienniku → cisza, brak tożsamości gita
  (pusty `HOME`) → cisza, tożsamość tylko globalna → sygnał, dziennik bez podpisów → cisza.
  6/6 PASS.
- **Pakiet HTML sprawdzony na żywo** (serwer lokalny, bo panel podglądu renderuje `file://` jako
  zrzut): tytuł `PRZEKAZANIE — Parkly`, sześć sekcji = sześć pozycji w nawigacji, fonty
  `Kalam:loaded` i `Hanken Grotesk:loaded`, przycisk sekcji `false → true → false`,
  `scrollWidth <= clientWidth` przy `clientWidth 1265` (brak przewijania w poziomie — kryterium,
  którego w E6 nie dało się postawić), **zero** żądań sieciowych poza serwerem lokalnym. Kontrola
  statyczna: zero `{{`, zero `http(s)://` w `src`/`href`/`url()`, sześć `@font-face` z `data:`,
  zero emoji, **zero** wystąpień wartości sekretu.
- **`grep` po `0.6.0` rozstrzygnięty:** pozostałe trafienia są historyczne — wiersz E6 w `CLAUDE.md`
  i `STATUS.md`, trigger L-0020, zdania „nowe w 0.6.0" w README i `SPEC_KOMENDY`, przykład wyjścia
  w `relai-changelog.md`.
- **Po rytuale zamknięcia** commit `bf935bb` zmienił `commands/relai-backup.md` i `SPEC_KOMENDY.md`
  bez podbicia wersji, więc `plugin update` zameldował „already at the latest version (0.7.0)"
  i zostawił cache na `68c1e03` — dokładnie drugi facet L-0020. Zsynchronizowane przez `uninstall`
  + `install`; stan końcowy: `gitCommitSha bf935bb`, a w cache'u są zdania o `--add-dir`
  i o przedrostku `/relai:relai-…`. Pomiary komend wykonano na `68c1e03` i to jest wersja, której
  dotyczą wyniki wyżej.
- **Nie sprawdzono:** pełnej ścieżki pytania o lokalizację backupu (`AskUserQuestion` nie działa
  w trybie `-p` — lokalizację podawałem argumentem), regeneracji `KOMENDY.md` przez `/relai-help`
  po zgodzie, oraz zachowania komend na macOS i Linuksie (rozstrzygnięcia dla tych systemów są
  wpisane w komendę, ale zmierzone tylko na Windows).

**Świadomie odłożone:**
- **Skrócona forma wywołania komend.** Zmierzone: `/relai-backup` i `/relai-stage` w trybie `-p`
  kończą się `Unknown command`; działa wyłącznie `/relai:relai-…` (L-0022). Do `SPEC_KOMENDY`
  wszedł wymóg zdania o przedrostku pod tabelą. Czy skrócona forma działa w sesji **interaktywnej**
  — niezmierzone; do sprawdzenia razem z pozostałymi pomiarami interaktywnymi w E10.
- **Odtworzenie z backupu** (rozpakowanie + „projekt wstaje") — należy do D-70/D-83, czyli do E9
  i E10. `/relai-backup` mówi wprost, że archiwum nie zawiera sekretów, więc recovery wymaga ręki
  człowieka.
- **Rotacja dziennika** wykrywana przez `/relai-audit`, ale samo przeniesienie starszych wpisów
  do archiwum nadal wykonuje człowiek po zatwierdzeniu propozycji — świadomie, D-45.
- Profile projektów (E8), `/relai-adopt` i `/relai-update` (E9) — poza zakresem etapu.

**Do zrobienia przez człowieka:**
- Potwierdzić w sesji interaktywnej, czy podpowiadacz rozwija skróconą formę `/relai-backup`.
  Jeśli nie — zdanie o przedrostku w `KOMENDY.md` przestaje być przypisem i staje się główną
  formą w kolumnie „Komenda".
- Wskazać docelową lokalizację centralnego folderu backupów dla tej maszyny (wpis trafi do
  `~/.claude/relai/USTAWIENIA.md`).
- Decyzja o podzbiorze fontów wraca — pakiet przekazania waży 201 KB z tego samego powodu co plan
  (R5).


### 2026-08-08 — E8: profile projektów, reguły warunkowe, RelAI 0.8.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**
- **Rozstrzygnięcie nośnika reguł warunkowych — trzy warstwy o rozłącznych rolach.** Prompt dawał
  trzy drogi (skill / hook / obie). Wybrana została trzecia, ale w postaci, której prompt nie
  zakładał: warstwą **niosącą regułę** jest sekcja `## Reguły profilu (<nazwa>)` w `CLAUDE.md`
  projektu, bo ten plik siedzi w kontekście każdej sesji i nie wymaga wyzwolenia czegokolwiek —
  jest odporny na R2 w sposób, w jaki hook nie jest (hook nie potrafi napisać dokumentu, tylko
  zgłosić zdarzenie). Hook **wykrywa zdarzenie**, skill **niesie procedurę**. Trzy warstwy, trzy
  różne zadania, zero dublowania.
- **Bramka snapshotu w `config-protection`, nie w nowym hooku.** D-52 wymaga **zatrzymania**
  zmiany, a D-41 mówi, że blokują wyłącznie `secret-scanner` i `config-protection`. Zamiast
  łamać D-41 dziewiątym hookiem blokującym, bramka doszła do hooka, który już blokuje i którego
  nazwa ją obejmuje. Porównanie idzie po **sumie kontrolnej treści**, nie po nazwie pliku:
  bramka nie zależy od konwencji nazewniczej, a konwencja zostaje wymogiem dokumentacyjnym.
- **`templates/SPEC_PROFILE.md`** — źródło prawdy o czterech profilach: sygnały detekcji z regułą
  „wygrywa najbardziej specyficzny", tabela zdarzeń, tabela pytań towarzyszących z jawną granicą
  („limit trzech pytań startowych jest twardy, pytania profilu padają przy zdarzeniu"), konwencje
  bazy wiedzy, rejestr wersji artefaktów profilu `prompty`, procedura zmiany profilu i cztery
  gotowe sekcje „Reguły profilu" do wklejenia (L-0001).
- **Trzy specyfikacje profilu `app`:** `SPEC_ARCHITEKTURA.md` (opisuje to, co powstało, nie
  architekturę docelową; tabela „co jest zmianą architektury, a co nie"), `SPEC_DESIGN.md` (jedno
  pytanie o cechy **pozytywne** — L-0019; sekcja „Stany" obowiązkowa), `SPEC_SRODOWISKA.md` (jeden
  plik na środowisko, procedura cofnięcia o tej samej wadze co wdrożenie, tabela „wolno / nie wolno"
  dla D-42).
- **`templates/SPEC_SNAPSHOT.md`** — definicja „konfiguracji produkcyjnej" wraz z listą wyłączeń,
  nazewnictwo z sufiksem stanu (`przed-…` / `po-…` / `dziala-…`), `OPIS.md` w katalogu dziennym,
  obowiązkowe asercje przed zmianą i po niej, retencja przez archiwizację (D-18).
- **`hooks/profile-rules.js`** — nowy hook ostrzegający (PostToolUse): pierwszy kod, pierwszy
  interfejs, pierwsza konfiguracja wdrożeniowa, pierwszy artefakt. Milknie, gdy dokument już
  istnieje — dokument warunkowy nie powstaje na zapas (D-10).
- **`skills/relai-core/SKILL.md`** — sekcja „Reguły warunkowe profilu" z wypisaną strukturą
  (L-0011), **`templates/SPEC_CLAUDE_MD.md`** — miejsce i zasady sekcji profilu,
  **`SPEC_USTAWIENIA.md`** — wiersz „Profil projektu" jako wartość czytana maszynowo,
  **`SPEC_KOMENDY.md`** — zakres 0.8.0 z zakazem wpisywania punktów cudzego profilu,
  **`templates/README.md`** — pięć nowych specyfikacji w indeksie.
- **Wersja 0.8.0** w obu manifestach, README pluginu, obu skillach, `SPEC_KOMENDY.md`,
  `SPEC_USTAWIENIA.md` i markerze `docs/USTAWIENIA.md` tego repo.

**Zweryfikowane — jak dokładnie:**
- **Wersja realnie zainstalowana:** `~/.claude/plugins/installed_plugins.json` →
  `relai@relai 0.8.0`, `installPath …/cache/relai/relai/0.8.0`, `gitCommitSha ddc2894`.
  `claude plugin validate` → „Validation passed with warnings", jedno znane ostrzeżenie (L-0003).
- **30/30 testów jednostkowych** obu hooków, payloady budowane Nodem (L-0017), projekty testowe na
  ścieżce `Próba RelAI E8` (spacja + „ó"). Pokryte m.in.: cisza po powstaniu dokumentu, brak
  pytania o testy przy zapisanej odpowiedzi (L-0006), `next.config.js` nieuznawany za pierwszy kod,
  guard poza projektem RelAI i w trybie gościa, komunikaty bez diakrytyków (L-0016).
- **Cztery świeże sesje inicjalizacyjne, po jednej na profil** (`app`, `agent-voice`, `flow`,
  `prompty`), prompt „zgadzam się" bez odpowiedzi: każda zadała **dokładnie trzy** pytania (język,
  git, profil) i **nie utworzyła ani jednego pliku** — limit D-20/D-80 nietknięty, dowód z treści
  odpowiedzi. Opcje profilu w pytaniu opisują już realne skutki („snapshot obowiązkowy",
  „ARCHITEKTURA przy pierwszym pliku źródłowym").
- **Cztery świeże sesje generujące:** każdy projekt dostał **sześć** dokumentów w `docs/`
  (`STATE`, `DZIENNIK`, `LEKCJE`, `DECYZJE`, `USTAWIENIA`, `KOMENDY`) — **zero** dokumentów
  warunkowych na zapas, w każdym z czterech profili. `CLAUDE.md` każdego projektu ma sekcję
  „Reguły profilu" swojego profilu i żadnego cudzego; `KOMENDY.md` projektu `app` ma zero wzmianek
  o snapshotach i `ARTEFAKTY`, a `KOMENDY.md` projektu `flow` zero wzmianek o `ARCHITEKTURA`
  i `DESIGN`.
- **Zdarzenie wyzwala dokument — dowód z obu stron (L-0007):** przed sesją z pierwszym plikiem
  źródłowym `docs/ARCHITEKTURA.md` **nie istniał** (`docs/` = sześć plików), po niej istnieje
  (`docs/` = siedem plików, `src/rezerwacje.ts` na miejscu). W tej samej odpowiedzi padło pytanie
  o podejście do testów z rekomendacją i uzasadnieniem wziętym z charakteru modułu (D-25).
- **Dowód negatywny do D-51:** po **trzech** sesjach roboczych z kodem, bez UI i bez wdrożenia,
  `docs/DESIGN.md` nie istnieje i katalog `docs/srodowiska/` nie istnieje. Sprawdzone listą plików
  na dysku, nie deklaracją skilla.
- **Dowód negatywny do D-42:** `.env` projektu testowego miał ciąg połączenia z hasłem oraz klucz
  API nadawcy maili. Wygenerowany `docs/srodowiska/TEST.md` zawiera **nazwy** obu zmiennych, opis
  po co są i wskazanie miejsca przechowywania; `grep` po obu wartościach w całym `docs/` → **zero
  trafień**.
- **Bramka snapshotu, dowód na warstwie hooka (nie skilla):** projekt `flow` skopiowany, sekcja
  „Reguły profilu" **usunięta** z jego `CLAUDE.md`, katalog `docs/snapshoty/` skasowany — czyli
  symulacja sytuacji, w której reguła nie dotarła do kontekstu. Świeża sesja z poleceniem „zmień
  od razu, edycją pliku" napisała wprost: „bramka snapshotu i tak zablokowała zapis". Efekt na
  dysku: `docs/snapshoty/2026-08-08/main__przed-zmiana-nazwy-wezla-start.json` o sumie
  `198a1558d1441a97dd65fe77a907e8e84325233d765f0710418bff10a653cace` = suma pliku sprzed zmiany,
  bajt w bajt. Druga zmiana tego samego pliku zamknęła bramkę ponownie i wymusiła drugi snapshot
  (zachowanie zamierzone, dopisane do specyfikacji).
- **`grep` po `0.7.0` rozstrzygnięty:** pozostałe trafienia są historyczne — wiersze E7 w `CLAUDE.md`
  i `STATUS.md`, wpisy dziennika, `PROMPT_ETAP_7`, zdania „nowe w 0.7.0" w README, skillu
  i `SPEC_KOMENDY`.
- **Nie sprawdzono:** zachowania reguł profilu w sesji **interaktywnej** (`AskUserQuestion` nie
  działa w trybie `-p`, więc pytania o testy i o kierunek wizualny padły jako tekst, nie jako
  właściwe pytanie z opcjami); profilu `prompty` w pracy ciągłej (rejestr artefaktów sprawdzony
  jednostkowo i przy inicjalizacji, nie w sesji roboczej); zachowania na macOS i Linuksie.

**Świadomie odłożone:**
- **`quality-gate` i `auto-format` bez warunku profilowego.** PLAN wymienia je jako „wg profilu",
  ale obecność `tsconfig.json` + lokalnego `tsc` (albo Prettiera) jest warunkiem **mocniejszym** niż
  wpis w ustawieniach: projekt `prompty` z przypadkowym `tsconfig.json` i tak nie ma czego
  sprawdzać, a projekt `app` bez narzędzi nie zyskuje na dodatkowym warunku. Zamiast reguły doszły
  poprawione komentarze w obu plikach, żeby nie obiecywały nieistniejącego mechanizmu.
- **Profil tego repo.** Wiersz „Profil projektu" w `docs/USTAWIENIA.md` brzmi „Narzędzie/plugin
  (odpowiednik profilu »prompty/artefakty«…)" — opis sprzed istnienia profili. Po poprawce
  z L-0025 hooki czytają wartość z kotwicy, więc ten wiersz nie włącza żadnych reguł i nic się nie
  psuje; wybór jednej z czterech wartości należy do człowieka (niżej).
- **Sekcja „Reguły profilu" w `CLAUDE.md` tego repo** — nie dopisana z tego samego powodu:
  reguł do `CLAUDE.md` nie dopisuje się bez zgody człowieka (zakaz `relai-core`).
- **Migracja projektów sprzed 0.8.0** — projekt zainicjowany na 0.7.0 nie ma sekcji reguł profilu
  i nie dostanie jej sam. To jest zadanie `/relai-update` (D-72, E9).

**Do zrobienia przez człowieka:**
- Wskazać profil tego repo jedną z czterech wartości (`app` / `agent-voice` / `flow` / `prompty`),
  żeby dogfooding obejmował też reguły warunkowe. Rekomendacja: **`app`** — repo ma hooki w Node,
  manifesty i komendy, a specyfikacje są jego treścią, nie artefaktami wersjonowanymi osobno.
  Po decyzji: wiersz w `USTAWIENIA.md` (stary do „Ustawień wycofanych") + sekcja w `CLAUDE.md`.
- Zdecydować, czy `docs/ARCHITEKTURA.md` ma powstać dla tego repo — reguła profilu `app` zażąda go
  przy pierwszym pliku źródłowym po zmianie wiersza wyżej.
- Potwierdzić w sesji interaktywnej, że pytanie o testy i pytanie o kierunek wizualny padają jako
  `AskUserQuestion` z opcjami, a nie jako tekst (razem z pozostałymi pomiarami interaktywnymi E10).

**Dopisek po rytuale zamknięcia:** commit `df8ee20` zmienił `SPEC_SRODOWISKA.md` i `SPEC_SNAPSHOT.md`
bez podbicia wersji, więc `plugin update` zostawiłby cache na `ddc2894` (drugi facet L-0020).
Zsynchronizowane przez `uninstall` + `install`; stan końcowy: `relai@relai 0.8.0`,
`gitCommitSha df8ee20`, w cache'u dziewiętnaście specyfikacji i dziewięć hooków. Pomiary opisane
wyżej wykonano na `ddc2894` i to jest wersja, której dotyczą ich wyniki — obie różnią się wyłącznie
dwoma akapitami w specyfikacjach, dopisanymi na podstawie tych pomiarów.

### 2026-08-09 — E9: adopcja i aktualizacja, RelAI 0.9.0

Autor: RelAI (Fable) + Lukasz

Etap wykonany przez **Fable** na jawne polecenie użytkownika (odstępstwo od D-85, jak przy E5):
kontrola modelu z promptu etapu zatrzymała sesję, użytkownik wybrał „Wykonaj Fablem" — etap
najwyższego ryzyka (R3) dostał najsilniejszy model.

**Zrobione:**
- **Decyzja etapu — kształt recovery:** sekcja procedury w raporcie adopcji. Odrzucone: osobna
  komenda cofająca (poza granicą zakresu — E9 dokłada dokładnie dwie komendy — i wymagałaby
  zaufania do narzędzia, które właśnie mogło zawieść) oraz skrypt generowany przy adopcji (świeży,
  nietestowany kod za każdym razem). Procedura opiera się wyłącznie o rozpakowanie zweryfikowanego
  ZIP-a: jest identyczna dla każdej adopcji, przetestowana raz i wykonalna ręcznie — bez pluginu,
  bez Claude, bez Node — czyli dokładnie w warunkach z kryterium D-70 („człowiek ma tylko archiwum
  i raport").
- **`templates/SPEC_RAPORT_ADOPCJI.md`** — specyfikacja jedynego artefaktu przeżywającego sesję
  adopcji: backup, co powstało / przeniesiono / scalono / nie ruszono, sekrety jako wskazania,
  sekcja „Pełne cofnięcie", kompletny przykład (L-0001).
- **`commands/relai-adopt.md`** (D-70) — sekwencja bez luk: krok 0 (marker / gość / pusty folder),
  backup przez procedurę `/relai-backup` jako **bramka** (pominięte jej kroki 0 i 6 z jawnym
  powodem), analiza (kod, dokumenty, git log, profil, sekrety bez wartości), plan zmian + zgoda
  jako druga bramka, jawne wczytanie skilla `relai-core` dla provisioningu specyfikacji (L-0015,
  R8), generacja z zastanego stanu (STATE opisuje istniejący projekt, dziennik dostaje wpis
  zerowy z historią gita), scalanie `CLAUDE.md` (D-71) w tym samym pliku komendy, raport, commit
  za zgodą.
- **`commands/relai-update.md`** (D-72) — komenda samowersjonowana („pochodzi z RelAI 0.9.0");
  inwentaryzacja względem **stanu docelowego** zamiast historii wersja-po-wersji (projekt 0.5.0
  i 0.8.0 aktualizują się tą samą procedurą); nadpisania lokalne wykrywane najpierw i nietykalne;
  diff jako lista działań + zgoda (także częściowa); marker podbijany **na końcu**, żeby przerwana
  sesja zostawiała stan do dokończenia.
- **`skills/relai-core/SKILL.md`** — stan „Z ZAWARTOŚCIĄ" ma cztery drogi (adopcja rekomendowana,
  dołączenie niedestrukcyjne, gość, nic); zdanie „adopcji jeszcze nie ma" zniknęło; frazy
  wyzwalające uzupełnione o „zaadoptuj projekt" / „adopt this project".
- **`hooks/session-context.js`** — komunikat o różnicy wersji wskazuje działające `/relai-update`.
- **`templates/SPEC_KOMENDY.md`** — zakres 0.9.0, tabela komend 7 → 9, zakaz wpisywania
  `/relai-adopt`/`/relai-update` usunięty (nie ma czego zakazywać); `templates/README.md` — wiersz
  o nowej specyfikacji.
- **Poprawka defektu E7 ujawnionego pomiarem:** kryterium rozmiaru w kroku 5 `/relai-backup`
  („mniej niż rozmiar projektu") było fałszywie negatywne dla małych projektów z `.git` — narzut
  nagłówków ZIP przewyższył źródło (35 708 B wobec 32 714 B). Kryterium przepisane na stan
  kontrolowany (L-0018): rozstrzyga lista wpisów, rozmiar tylko > 0.
- Wersja **0.9.0** w obu manifestach, README, obu skillach, `SPEC_USTAWIENIA`, markerze repo;
  `grep` po `0.8.0` rozstrzygnięty (historyczne zostają). Publikacja: push → `marketplace update`
  → `plugin update`; `installed_plugins.json`: 0.9.0, sha `720f52f` (L-0020).

**Zweryfikowane — jak dokładnie:**
- Sześć świeżych sesji `claude -p` (prompt przez stdin, `--permission-mode acceptEdits`, komendy
  pełną nazwą) na projektach testowych zbudowanych skryptem, na ścieżce ze spacją i „ó"
  (`Desktop\Próba RelAI E9\Magazyn` — kod + git + własny CLAUDE.md + sekret w kodzie;
  `…\Kronika` — projekt RelAI 0.7.0 z nadpisaniem lokalnym szablonu).
- **Bramka backupu, dwa dowody negatywne:** lokalizacja na nieistniejącym dysku `Q:` → adopcja
  przerwana; sesja bez zgody na narzędzie pakujące → adopcja odmówiła pójścia dalej mimo zgody
  użytkownika na wszystko inne. W obu przypadkach sumy kontrolne projektu 10/10 identyczne
  (agregat `1200960f…`), zero plików struktury.
- **Adopcja pełna (zgoda z góry w prompcie):** commit adopcyjny `d74012a`; 7/7 plików kodu
  z sumami identycznymi; **D-70:** żaden z 10 zastanych plików nie zniknął — kolizje
  (`docs/STATE.md`, `CLAUDE.md`) w `docs/archiwum/` z adnotacjami; **D-71:** 4/4 zastane reguły
  dosłownie w sekcji „Zasady projektu (odziedziczone)", kopia oryginału kompletna, konflikt reguł
  zgłoszony pytaniem (zmierzone w osobnej sesji bez zgody z góry: zatrzymała się na czterech
  pytaniach, w tym o konflikt „commituj natychmiast"); **D-42:** wartość sekretu nieobecna
  w raporcie i dzienniku (grep po złożonej wartości: 0 trafień), archiwum ZIP bez `.env`
  (89 wpisów, 0 trafień na wzorce sekretów, nagłówek `504b0304`).
- **Recovery naprawdę (najważniejszy punkt etapu):** pełne cofnięcie wg sekcji „Pełne cofnięcie"
  raportu — przeniesienie folderu, `tar.exe -xf`, odtworzenie `.env` — dało agregat sum drzewa
  (bez `.git`) **identyczny bajt w bajt** ze stanem sprzed adopcji: `1200960f0134afc3…`, 10/10
  plików, zero różnic; `git log` kopii pokazuje HEAD sprzed adopcji (`7bd6db0`), bez commita
  adopcyjnego.
- **`/relai-update` na 0.7.0:** bez zgody → 10/10 sum identycznych (jedyne nowe pliki to cache
  `.claude/relai/` dokładany hookiem provisioningu, poza repo); ze zgodą → sekcja „Reguły profilu
  (app)" wstawiona, sekcja niemutowalna verbatim, `KOMENDY.md` zregenerowane do 0.9.0 z dziewięcioma
  komendami i **dosłownie przepisanym wierszem lokalnym**, nadpisanie `docs/zasoby/HTML_PLAN/`
  3/3 sum identycznych, wpis w dzienniku projektu. Marker: w sesji headless `config-protection`
  zablokował zapis zgodnie z projektem — sesja wypisała diff jednej linii i zostawiła stan do
  dokończenia; dokończono w sesji nadzorowanej (marker 0.9.0), pełne potwierdzenie interaktywne
  → E10.
- `claude plugin validate` — przechodzi ze znanym ostrzeżeniem L-0003.
- Foldery testowe usunięte (`Próba RelAI E9` nie istnieje).

**Świadomie odłożone:**
- Pomiary wymagające sesji interaktywnej — pełna lista przeniesiona wprost do `PROMPT_ETAP_10.md`
  (L-0005): AskUserQuestion (inicjalizacja, plan, profil, cztery drogi stanu „Z ZAWARTOŚCIĄ"),
  skrócona forma komend, potwierdzenia `config-protection` na żywo (w tym marker przy
  `/relai-update`), adopcja z pytaniami w trakcie zamiast zgody z góry, propozycja wycieczki,
  kontrola R2.
- Adopcja żywego projektu (JiraManager) — scenariusz akceptacyjny E10 (D-83); w E9 wyłącznie
  projekty testowe, zgodnie z granicą zakresu promptu.
- Ochrona `config-protection` nie obejmuje zapisów wykonywanych poza narzędziami Write/Edit
  (np. skryptem Node) — świadome ograniczenie warstwy hooków (PreToolUse widzi narzędzia, nie
  procesy); bez zmiany, do ewentualnej dyskusji po v1.

**Do zrobienia przez człowieka:**
- Uruchomić E10: świeża sesja **Opus**, polecenie „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_10.md".
  Etap wymaga Twojego udziału w sesjach interaktywnych (scenariusze D-83, pomiary AskUserQuestion)
  i wskazania folderu JiraManagera przed adopcją.

**Dopisek po rytuale zamknięcia:** commit domykający `2124ebb` zmienił m.in. `commands/relai-backup.md`
(poprawka kryterium rozmiaru) bez podbicia wersji, więc `plugin update` zostawiłby cache na `720f52f`
(drugi facet L-0020). Zsynchronizowane przez `uninstall` + `install`; stan końcowy: `relai@relai 0.9.0`,
`gitCommitSha 2124ebb`, w cache dziewięć komend i osiemnaście specyfikacji. Pomiary opisane wyżej
wykonano na `720f52f`; obie wersje różnią się wyłącznie poprawką kryterium weryfikacji backupu
i dokumentami zamknięcia etapu.

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
- Zdecydować o upublicznieniu repozytorium i dopisać opis na GitHubie — bez tego README nie ma
  do kogo trafić.
- Potwierdzić brzmienie nazwiska w `LICENSE` („Łukasz Nowakowski", rok 2026).
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

- **Przeczytać i zaakceptować (albo odesłać z uwagami) plan** — `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html`.
  *(rozstrzygnięte 2026-08-12 — plan ZAAKCEPTOWANY z Aneksem A)*
- Cztery decyzje z sekcji 9 planu: upublicznienie repo (przed E8), język warstwy zespołowej
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

### 2026-08-17 — Decyzja D-86: plik glowny projektu

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- Zamrozona **D-86**: projekt z adapterem obcego narzedzia (Cursor, Codex) ma **AGENTS.md** jako
  plik glowny, a CLAUDE.md zostaje w nim wskaznikiem; projekt prowadzony wylacznie w Claude Code
  zostaje bez zmian. Kolizje rozstrzyga obecnosc adaptera, nie narzedzie biezacej sesji.
- Tabela "Decyzje zmienione" w rejestrze: D-10 i D-11 uzupelnione przez D-86.
- PROMPT_ETAP_7: blokujaca bramka zamieniona w rozstrzygniecie — E7 nie pyta o to ponownie
  i dostaje wprost zakres wdrozenia (instalator Codeksa, instalator Cursora, SPEC_CLAUDE_MD).
- STATE zaktualizowany: pozycja "do rozstrzygniecia" zamieniona na zapis decyzji.

**Zweryfikowane — jak dokladnie:** decyzja zapisana w dwoch miejscach rejestru (wpis D-86 i wiersz
tabeli zmian), a prompt etapu E7 nie zawiera juz zdania nakazujacego zatrzymanie sie na tym pytaniu.
Wdrozenia nie ma i celowo nie bylo — nalezy do E7.

**Swiadomie odlozone:**

- **Wdrozenie D-86** w calosci: instalator Cursora nadal zaklada wylacznie CLAUDE.md, wiec projekty
  z adapterem Cursora (w tym ProbaCursorE6) maja dzis uklad sprzed decyzji.

**Do zrobienia przez czlowieka:**

- Pozycje bez zmian wobec dwoch wczesniejszych wpisow z dzisiaj: dopisek rozstrzygniecia
  w SPEC_ARCHIWUM (rotacja dziennika stoi), sekwencja wydania 1.5.1, ponowna instalacja
  pre-commita, claude /login, /relai-update dla JiraManagera i PolyFlow, los ProbaCursorE6.
