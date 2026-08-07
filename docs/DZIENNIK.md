# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Scope creep jak w vibe-forge (GUI, enterprise-szablony) | Wysoki | OTWARTE | D-80: twarda lista „poza v1"; każdy pomysł spoza listy → DZIENNIK „świadomie odłożone" |
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | Wysoki | OTWARTE | Podwójna warstwa: opisy skilli + reguły w projektowym CLAUDE.md zawsze w kontekście; testy fraz w pilotażu |
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
- Zdecydować moment przemianowania folderu na `RelAI`. *(zrobione 2026-08-07)*
- Rozważyć rotację klucza API Anthropic oraz uprzątnięcie `klucze.txt` / `client_secret_*.json`. *(rozstrzygnięte 2026-08-07: świadoma decyzja — bez rotacji, backup wyłącznie lokalny)*

### 2026-08-07 — Akceptacja planu (Aneks A), E1 gotowy do startu

Autor: RelAI (Fable) + Łukasz

**Zrobione:**
- Plan ZAAKCEPTOWANY z poprawkami — Aneks A: nowa komenda `/relai-help` (D-07), pytanie o model wykonawczy przy każdym planie (D-39, zmiana D-38 na rekomendację), wykonawca budowy = Opus (D-85).
- Przegląd architekta po poprawkach — domknięte luki: hook-guard (hooki ciche poza projektami RelAI), zapis wersji RelAI w USTAWIENIA przy init, polskie frazy w opisach skilli, wpisy DZIENNIKA append-na-końcu z autorem (przeciw konfliktom git). Wszystko dopisane do Aneksu A i zakresów E1/E2/E5.
- Repo `github.com/nowilus/relai` założone przez Łukasza; podpięte jako origin, struktura wypchnięta.
- Folder przemianowany `VibeFramework` → `RelAI`.
- Wygenerowany [PROMPT_ETAP_1.md](plany/BUDOWA_RELAI/PROMPT_ETAP_1.md) (architekt; od E2 prompty pisze Opus w rytuale „Na koniec").

**Zweryfikowane:** spójność planu z rejestrem decyzji po naniesieniu Aneksu A; render PLAN.html sprawdzony w przeglądarce.

**Świadomie odłożone:** dostępy współpracowników do repo (moment dowolny); licencja (przy upublicznieniu); adopcja JiraManagera (po E10).

**Do zrobienia przez człowieka:**
- Uruchomić E1: świeża sesja Claude Code w folderze `RelAI`, model **Opus**, polecenie: „Wykonaj docs/plany/BUDOWA_RELAI/PROMPT_ETAP_1.md".
