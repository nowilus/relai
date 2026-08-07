# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Scope creep jak w vibe-forge (GUI, enterprise-szablony) | Wysoki | OTWARTE | D-80: twarda lista „poza v1"; każdy pomysł spoza listy → DZIENNIK „świadomie odłożone" |
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | Wysoki | OTWARTE | Podwójna warstwa: opisy skilli + reguły w projektowym CLAUDE.md zawsze w kontekście; testy fraz w pilotażu. **2026-08-07 (E1):** `relai-core` zainstalowany i widoczny w inwentarzu pluginu, ale samo auto-wyzwolenie w świeżej sesji NIEZWERYFIKOWANE — pierwszy realny test na starcie E2 |
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
- Uruchomić E2: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_2.md".
- Zdecydować, czy plugin ma zostać zainstalowany na stałe (jest zainstalowany w scope `user` po teście) — jeśli nie, `claude plugin uninstall relai`.
