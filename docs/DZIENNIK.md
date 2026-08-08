# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Scope creep jak w vibe-forge (GUI, enterprise-szablony) | Wysoki | OTWARTE | D-80: twarda lista „poza v1"; każdy pomysł spoza listy → DZIENNIK „świadomie odłożone" |
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski** (2026-08-07 po E5; wcześniej średni) | **ZMIERZONE 2026-08-07, OTWARTE** | Podwójna warstwa: opisy skilli + reguły w projektowym CLAUDE.md zawsze w kontekście; testy fraz w pilotażu. **2026-08-07 (E1):** `relai-core` zainstalowany i widoczny w inwentarzu pluginu, ale samo auto-wyzwolenie w świeżej sesji NIEZWERYFIKOWANE. **2026-08-07 (E2):** test NIEWYKONANY — plugin odinstalowany na czas budowy na polecenie użytkownika (L-0004), więc skill nie miał prawa się wyzwolić; pomiar przeniesiony do pilotażu E10, po docelowej instalacji. Ryzyko pozostaje OTWARTE i niezmierzone przez dwa etapy (L-0005). **2026-08-07 (E3):** nadal niezmierzone — doszedł drugi skill (`relai-planning`) wyzwalany frazą, więc zakres ryzyka wzrósł. **2026-08-07 (pomiar, na wniosek użytkownika):** plugin zainstalowany, sześć świeżych sesji `claude -p`. Wersja 0.3.0: 1/4 trafień — brak wyzwolenia na prompcie naturalnym i na „przygotuj plan…", z realnym rozjazdem konwencji. Po poprawce opisów (0.3.1): 2/2 trafienia. Ryzyko zostaje otwarte: próba mała, `-p` blokuje `AskUserQuestion`, a wynik zależy od inwentarza skilli na maszynie. Kontrola ponowna w E10 (wiersz E10 w `STATUS.md`). **2026-08-07 (E5):** hook `session-context` (SessionStart) wstrzykuje rytuał startu, datę dnia i siatkę promptów niezależnie od skilli — zmierzone 2/2 na neutralnym prompcie przy **zerze** wywołań `Skill`. Poziom obniżony do niskiego; do potwierdzenia w sesji interaktywnej w E10 |
| R3 | Adopcja uszkodzi żywy projekt użytkownika | Wysoki | OTWARTE | D-70: backup+raport+recovery obowiązkowe; scenariusz akceptacyjny z pełnym testem recovery |
| R4 | Hooki Node na Windows (ścieżki ze spacjami, kodowanie PL) | Średni | **ZAMKNIĘTE 2026-08-07 (E5)** | Osiem hooków przetestowane na ścieżce `Próba RelAI E5` (spacja + „ó"): 39/39 testów jednostkowych i siedem sesji integracyjnych bez błędów kodowania i ścieżek. Komunikaty hooków świadomie ASCII (L-0016); zero zależności npm |
| R5 | Dokumenty puchną i zjadają kontekst | Średni | OTWARTE | D-14/D-15: rotacja DZIENNIKA, kompresja LEKCJI, destylaty czytane na starcie |
| R6 | Aktualizacja pluginu nadpisze lokalne nadpisania użytkowników | **Niski** (2026-08-08 po E6; wcześniej średni) | OTWARTE | D-72: diff + zgoda + pierwszeństwo lokalnych nadpisań; test w pilotażu. **2026-08-08 (E6):** nadpisanie lokalne umieszczone w `docs/zasoby/HTML_PLAN/` — poza cache'em `.claude/relai/`, którego dotyka hook i aktualizacja pluginu. Zmierzone: po `marketplace update` + `plugin update` + świeżej sesji dziewięć plików nadpisania ma identyczne sumy kontrolne, własny token na miejscu, token z pluginu nie wrócił; cache w tym samym czasie **został** nadpisany (dowód, że test nie jest pusty). Zostaje otwarte do E9: `/relai-update` musi pokazać diff i uszanować nadpisanie |
| R7 | Model wykonawczy (Sonnet/Opus) obniży jakość implementacji etapów | Średni | OTWARTE | Prompty etapowe z sekcją Weryfikacja + przegląd Fable po kluczowych etapach |
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
