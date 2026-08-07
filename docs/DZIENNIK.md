# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Scope creep jak w vibe-forge (GUI, enterprise-szablony) | Wysoki | OTWARTE | D-80: twarda lista „poza v1"; każdy pomysł spoza listy → DZIENNIK „świadomie odłożone" |
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | Wysoki | OTWARTE | Podwójna warstwa: opisy skilli + reguły w projektowym CLAUDE.md zawsze w kontekście; testy fraz w pilotażu. **2026-08-07 (E1):** `relai-core` zainstalowany i widoczny w inwentarzu pluginu, ale samo auto-wyzwolenie w świeżej sesji NIEZWERYFIKOWANE. **2026-08-07 (E2):** test NIEWYKONANY — plugin odinstalowany na czas budowy na polecenie użytkownika (L-0004), więc skill nie miał prawa się wyzwolić; pomiar przeniesiony do pilotażu E10, po docelowej instalacji. Ryzyko pozostaje OTWARTE i niezmierzone przez dwa etapy (L-0005) |
| R3 | Adopcja uszkodzi żywy projekt użytkownika | Wysoki | OTWARTE | D-70: backup+raport+recovery obowiązkowe; scenariusz akceptacyjny z pełnym testem recovery |
| R4 | Hooki Node na Windows (ścieżki ze spacjami, kodowanie PL) | Średni | OTWARTE | Test na ścieżce ze spacją i polskimi znakami w E5; brak zależności poza Node wbudowanym w Claude Code |
| R5 | Dokumenty puchną i zjadają kontekst | Średni | OTWARTE | D-14/D-15: rotacja DZIENNIKA, kompresja LEKCJI, destylaty czytane na starcie |
| R6 | Aktualizacja pluginu nadpisze lokalne nadpisania użytkowników | Średni | OTWARTE | D-72: diff + zgoda + pierwszeństwo lokalnych nadpisań; test w pilotażu |
| R7 | Model wykonawczy (Sonnet/Opus) obniży jakość implementacji etapów | Średni | OTWARTE | Prompty etapowe z sekcją Weryfikacja + przegląd Fable po kluczowych etapach |

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
- Uruchomić E3: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_3.md".
