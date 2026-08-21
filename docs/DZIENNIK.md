# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R2 | Auto-wyzwalanie skilli bywa zawodne (agent nie zastosuje zasad bez komendy) | **Niski przy Opusie, średni przy modelach słabszych** (2026-08-10 po E10) | **ZMIERZONE 2026-08-10, OTWARTE ŚWIADOMIE** | Warstwą nośną są hook `session-context` i `CLAUDE.md` projektu — działają przy każdym modelu, bez wyzwalania; skill dokłada wyłącznie procedurę (L-0030). Opus wyzwala skill sam i wykonuje procedurę w całości; Sonnet 4.6 i Haiku 4.5 nie wołają `Skill` ani razu, więc projekt nie traci pamięci, ale procedura bywa niepełna. Otwarte świadomie: to trwała własność modeli, nie usterka do naprawienia. Zakres ryzyka rósł od 1.1.0 bez pomiaru — dziesiąta komenda, sygnał odchylenia, rozjazd stanu i kontrola podpisu nie były mierzone w świeżej sesji, bo limit konta zatrzymał CLI (L-0032); czeka to w odnodze `POMIAR_ODNOG`. Zmierzone: 2026-08-07 (E5), 2026-08-10 (E10), 2026-08-12 (E1), 2026-08-12 (E3) |
| R5 | Dokumenty puchną i zjadają kontekst | Średni | **OTWARTE — do obserwacji po 1.0.0** | Mechanizm jest kompletny i mierzony: budżet startu liczony hookiem przy każdej sesji, rotacja dziennika i lekcji z blokadą liczoną z sekcji „Czeka na człowieka", twardy kształt `STATE.md` i `CLAUDE.md`, rejestr pułapek poza warstwą startową, ryzyka zamknięte schodzące do archiwum. Warstwa startowa tego repozytorium: 90 KB przed planem, 55,3 KB po E3 przy budżecie 80 KB. Otwarte, bo dwa żywe projekty z realnym problemem (JiraManager 386 KB startu, PolyFlow 155 KB) nie mają z tego jeszcze nic — dostaną to przez `/relai-update` w E5 planu OPTYMALIZACJA_KONTEKSTU i tam ryzyko się zamknie. Zmierzone: 2026-08-12 (E2), 2026-08-20 (pomiar trzech projektów), 2026-08-20 (E1, E2, E3), 2026-08-21 (E4) |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Część sekretowa jest zamknięta dowodem z aplikacji: w Cursorze zadziałały obie warstwy — reguła odmówiła pierwsza, a przy prośbie o próbę mimo reguły zapis klucza odbił hook `preToolUse` werdyktem `permission: deny`; niezależnie od narzędzia commit z sekretem zatrzymuje gitowy pre-commit. Otwarte z dwóch powodów: Cursor nie ma egzekwowanego `ask`, więc pliki konfiguracyjne chroni tam sama reguła zamiast bramki, a Codex pozostaje niezmierzony do odmrożenia E7 planu ROZWOJ_PO_WYDANIU. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Reguła zawsze-w-kontekście działa w Cursorze bez żadnego wyzwalacza: pilotaż przeszedł pełny cykl na trzech modelach, a cały etap poprowadził model spoza Anthropic (Grok 4.6) — rytuał startu, karta etapu z kontrolą modelu, granica zakresu, rytuał zamknięcia z promptem następnego etapu. Dyscyplina procesu nie zależy od dostawcy modelu. Otwarte już tylko dla Codeksa: warstwą nośną ma tam być `AGENTS.md` z twardym limitem 32 KiB, a skille wyzwalają się dopasowaniem opisu — tym samym mechanizmem, który przy R2 okazał się zależny od modelu. Zmierzone: 2026-08-12 (E4), 2026-08-12 (E5), 2026-08-17 (E6) |

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka

- **`claude /login` na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`
  (L-0032)** · 2026-08-12 ·
  [wpis 2026-08-12 — E2: rotacja dokumentów](#2026-08-12--e2-rotacja-dokumentów-kalibracja-progów-relai-120)
- **Okno na `/relai-update` dla JiraManagera i PolyFlow — oba projekty z zamkniętym etapem;
  warunek startu E5** · 2026-08-12 ·
  [wpis 2026-08-12 — E2: rotacja dokumentów](#2026-08-12--e2-rotacja-dokumentów-kalibracja-progów-relai-120)
- **Decyzja o instalacji pre-commita: `node core/guardrails/install-precommit.js
  <projekt>`** · 2026-08-12 ·
  [wpis 2026-08-12 — E4: rdzeń przenośny](#2026-08-12--e4-rdzeń-przenośny-guardrails-jako-skrypty-pre-commit-ze-skanem-sekretów-relai-140)
- **Feedback od osoby spoza projektu — kryterium „ktoś inny niż autor prowadzi projekt RelAI
  w Cursorze" nadal niespełnione** · 2026-08-13 ·
  [wpis 2026-08-13 — E6: uzgodnienie pilotażu Cursora](#2026-08-13--e6-uzgodnienie-pilotażu-cursora-przed-startem)
- **Ponowna instalacja pre-commita tam, gdzie już stoi — poprawka 1.5.1 nie dotrze do
  `.git/hooks/` sama** · 2026-08-17 ·
  [wpis 2026-08-17 — E6: pilotaż Cursora](#2026-08-17--e6-pilotaż-cursora-wariant-zastępczy-wersja-151)
- **Los projektu testowego `ProbaCursorE6` — zostaje jako materiał do E7 czy idzie do
  kasacji** · 2026-08-17 ·
  [wpis 2026-08-17 — E6: pilotaż Cursora](#2026-08-17--e6-pilotaż-cursora-wariant-zastępczy-wersja-151)
- **Przeczytać ścieżkę B w `README.md` oczami kogoś, kto ma wyłącznie Cursora, i powiedzieć,
  gdzie utknął** · 2026-08-18 ·
  [wpis 2026-08-18 — README: rozdzielona instalacja](#2026-08-18--readme-rozdzielona-instalacja-dla-claude-code-i-cursora)
- **Decyzja o formalnym zamrożeniu planu ROZWOJ_PO_WYDANIU z niezamkniętym E7** · 2026-08-20 ·
  [wpis 2026-08-20 — E1: miara warstwy startowej](#2026-08-20--e1-miara-warstwy-startowej-budżet-80-kb-naprawa-martwej-siatki-d-34)
- **Weryfikacja siedmiu rozstrzygnięć wpisanych w E2 — każde ma w adnotacji swój dowód; sprzeciw
  cofa je jedną linią** · 2026-08-20 ·
  [wpis 2026-08-20 — E2: rozbrojenie rotacji](#2026-08-20--e2-rozbrojenie-rotacji--sekcja-czeka-na-człowieka-i-drugie-wejście-na-starcie)

## Wpisy

> Wpisy z okresu 2026-08-07 … 2026-08-09 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md)
> — przeniesione 2026-08-17, suma kontrolna `c17de1981ceedb1c`.

> Wpisy z okresu 2026-08-10 … 2026-08-10 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md)
> — przeniesione 2026-08-20, suma kontrolna `b7307c8678b9d6b9`.

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
  aplikacji**. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Zdecydować o upublicznieniu repozytorium i dopisać opis na GitHubie — bez tego README nie ma *(rozstrzygnięte 2026-08-12 — repo publiczne; pusty opis wydzielony do odnogi OPIS_REPO)*
  do kogo trafić.
- Potwierdzić brzmienie nazwiska w `LICENSE` („Łukasz Nowakowski", rok 2026). *(rozstrzygnięte 2026-08-12 — Aneks A do planu ROZWOJ_PO_WYDANIU: LICENSE potwierdzone)*
- Nadal otwarte z poprzedniego wpisu: los projektu pilotażowego `Desktop\Paragony`, commit zmian *(rozstrzygnięte 2026-08-17 — obie pozycje zamknięte: katalog Paragonów nie istnieje, adopcja JiraManagera jest zacommitowana)*
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
  aplikacji** — bez restartu sesje ładują cache 1.1.0 (L-0031). *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`
  (L-0032), teraz obejmującej także dwa scenariusze rotacji. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update` — dzienniki 348 KB
  i 223 KB czekają na pierwszą rotację. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

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
  Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`, która
  domyka teraz punkty z E1, E2 **i** E3 (L-0032). Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update` — JiraManager jest
  pierwszym realnym adresatem reguły o decyzjach po adopcji (`CLAUDE.md` na 639 liniach).
  Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
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
  to potwierdza, ale realne wczytanie potwierdza dopiero aplikacja. Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`
  (L-0032). Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja o instalacji pre-commita** — w tym repozytorium i w projektach roboczych:
  `node core/guardrails/install-precommit.js <projekt>`. Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Uruchomić E5 (`/relai-stage`, świeża sesja **Opus**) albo którąś z dwóch odnóg. *(zrobione 2026-08-12 — E5 zrealizowany, adapter Cursora, RelAI 1.5.0)*

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
  Bramka manualna planu, nadal otwarta z E4. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG` (L-0032).
  Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja o instalacji pre-commita** (`node core/guardrails/install-precommit.js <projekt>`).
  Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Osoba z zespołu do pilotażu E6** — etap wymaga realnego projektu prowadzonego w Cursorze przez
  kogoś spoza tego projektu. **Nowa bramka manualna.** *(rozstrzygnięte 2026-08-17 — wariant zastępczy: pilotaż poprowadził autor; kryterium „ktoś spoza projektu" wraca przy zamknięciu planu)*
- **Decyzja o dopiskach rozstrzygnięcia w `SPEC_ARCHIWUM.md`** — czy „*(zrobione …)*" i podobne
  brzmienia mają być uznawane za rozstrzygnięcie na równi z „*(rozstrzygnięte …)*". Do czasu tej
  decyzji rotacja dziennika w tym projekcie stoi, a plik rośnie. Zmiana dotyka specyfikacji
  rdzenia, więc nie robię jej przy okazji zamykania sesji. *(rozstrzygnięte 2026-08-17 — zamknięta lista rdzeni w `SPEC_ARCHIWUM.md`, wersja 1.5.2, L-0035)*
- Uruchomić E6 (`/relai-stage`, świeża sesja **Opus**) albo którąś z dwóch odnóg. *(zrobione 2026-08-17 — E6 zrealizowany, pilotaż Cursora, RelAI 1.5.1)*

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
  przy zamykaniu etapu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Ryzyko P2 (zależność reguł zawsze-w-kontekście od modelu) nie zostanie ruszone** — pilotaż
  powtarza model `auto` z E5. Zamknięcie albo obniżenie P2 wymaga próby na modelu innym niż
  mierzony. *(rozstrzygnięte 2026-08-17 — pilotaż przeszedł na Groku 4.6, P2 obniżone do niskiego dla Cursora)*

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
  Cursora działa na instrukcji, nie na mechanizmie. *(rozstrzygnięte 2026-08-17 — D-86: `AGENTS.md` plikiem głównym w projektach z adapterem Cursora/Codeksa; wdrożenie należy do E7)*
- **Sekwencja wydania 1.5.1**: push → `claude plugin marketplace update relai` → `claude plugin
  update relai@relai` → **restart aplikacji** (L-0031); dla Cursora — ponowne uruchomienie
  `adapters/cursor/install.js` w projektach z adapterem. Bramka manualna planu, otwarta od E4.
  **Uwaga z tego etapu:** guardrail tej sesji pochodził z zainstalowanej wersji 1.1.0 i blokował
  łatkę do samego siebie — do restartu obowiązuje stary skaner. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Projekty z zainstalowanym gitowym pre-commitem wymagają ponownej instalacji** — instalator
  kopiuje skaner do `.git/hooks/`, więc poprawka 1.5.1 nie dotrze tam sama. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **`claude /login`** na konto z dostępnym limitem — warunek startu odnogi `POMIAR_ODNOG`.
  Bramka manualna planu. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja, kiedy przepuścić JiraManagera i PolyFlow przez `/relai-update`.** Bramka manualna. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Decyzja o instalacji pre-commita.** Bramka manualna. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- **Czy projekt testowy `ProbaCursorE6` zostaje** (materiał do E7 i do odnogi `POMIAR_ODNOG`), czy
  idzie do kasacji. Ma niezacommitowany dorobek E1 i dwie własne bramki (testy, kierunek wizualny). *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

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
  `/relai-update` dla JiraManagera i PolyFlow, los projektu testowego `ProbaCursorE6`. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

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
  pre-commita, `claude /login`, `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

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
  wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-17 — Zamknięcie trzech pozycji z E10, odnoga GUARD_PO_SCIEZCE

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Trzy pozycje blokujące dalszą rotację rozstrzygnięte.** Dwie okazały się zamknięte faktami,
  które nigdy nie trafiły do dziennika; trzecia była realną decyzją i została podjęta.
- **Odnoga `GUARD_PO_SCIEZCE`** — karta, samowystarczalny prompt (z 47 zasadami aktywnymi) i linia
  w sekcji „Odnogi" `STATUS.md`. Zakres: rozpoznanie projektu liczone także od katalogu edytowanego
  pliku, poprawka w `core/process/session-signals.js` plus trzy hooki guardraili i `isGitIgnored()`
  wołane z katalogu projektu docelowego.
- Sześć adnotacji rozstrzygnięcia dopisanych do wpisów z 2026-08-10 i 2026-08-11 (pozycje wracały
  w trzech kolejnych wpisach).

**Zweryfikowane — jak dokładnie:**

- **`Desktop\Paragony`** — katalogu nie ma na dysku (`ls` po Desktopie: tylko `JiraManager`).
  Projekt pilotażowy nie jest kontynuowany, kopie testowe wygasły razem z katalogami sesji.
- **Adopcja JiraManagera jest zacommitowana** — `git ls-files` w tamtym repozytorium zwraca
  **79 plików** w `docs/`, w tym `RAPORT_ADOPCJI.md` i `USTAWIENIA.md`. Niezacommitowane zmiany,
  które tam dziś są (`extension/`, `tests/`, `docs/plany/WTYCZKA_I_DOSTAWCY/STATUS.md`), dotyczą
  bieżącej pracy nad wtyczką, nie adopcji — pozycja z 2026-08-10 opisywała stan sprzed commita.
- **Rotacja nie została uruchomiona ponownie i tak ma być:** dziennik ma 102 KB przy progu 150 KB,
  a poniżej progu specyfikacja nakazuje ciszę. Analiza kontrolna pokazuje, że po zdjęciu blokad
  kolejny zakres wynosiłby dwa wpisy (11 KB) i urwałby się na wpisie z otwartą bramką wydania —
  ścieżka jest przetarta, mechanizm ruszy sam przy najbliższym przekroczeniu progu.

**Świadomie odłożone:**

- **Wykonanie odnogi `GUARD_PO_SCIEZCE`** — zmiana dotyka rdzenia wołanego przez dziesięć hooków,
  więc dostała własną kartę i prompt zamiast wejść „przy okazji" po zamknięciu etapu E6.

**Do zrobienia przez człowieka:**

- **Sekwencja wydania 1.5.2** (push → `claude plugin marketplace update relai` → `claude plugin
  update relai@relai` → restart aplikacji, L-0031) — to jedyna pozycja, która blokuje jeszcze
  jeden wpis przed rotacją, i jedyna, która sprawia, że dzisiejsze poprawki nie działają poza tym
  repozytorium. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-18 — Potwierdzenie wydania 1.5.2 i odświeżenie README

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Sprawdzone wydanie 1.5.2 po sekwencji wykonanej przez człowieka (push → aktualizacja
  marketplace'u → `plugin update` → restart aplikacji).
- `README.md`: numer wersji w nagłówku podbity do **1.5.2**, poprawiona liczba specyfikacji
  („dwadzieścia specyfikacji plus szablon planu HTML — razem trzydzieści plików"), usunięte
  nieaktualne zdanie o adapterze Cursora jako hipotezie („gdyby jutro powstał"), dopisany akapit
  o wyniku pilotażu z 2026-08-17.
- Commit `5e71863` z tą zmianą wypchnięty na GitHuba — nagłówek README pokazuje tam 1.5.2.

**Zweryfikowane — jak dokładnie:**

- `~/.claude/plugins/installed_plugins.json`: `relai@relai` → `version 1.5.2`,
  `gitCommitSha 0c54eae78b78fbfaf9001a731be5e23f7f28b8a8` (zgodny z ostatnim commitem repozytorium),
  `installPath` na katalogu `1.5.2`, `lastUpdated 2026-08-17T15:58Z`.
- **Wersja potwierdzona zachowaniem, nie wpisem** (L-0020): hook `secret-scanner` uruchomiony
  **z cache'u pluginu 1.5.2** przepuścił sygnaturę funkcji haszującej hasło i zablokował realny
  sekret w tym samym przebiegu. Poprawka `TYPE_TOKEN_RE` jest obecna w pliku rdzenia w cache'u.
- README na GitHubie było **identyczne z lokalnym** przed zmianą (`git diff origin/main -- README.md`
  pusty), więc rozjazd repozytorium ↔ GitHub nie występował; wzmianka o Cursorze była na miejscu
  w pięciu sekcjach, nieaktualny był wyłącznie numer wersji i dwa zdania opisu.

**Świadomie odłożone:**

- Wzmianki „od 1.5.0" przy adapterze Cursora zostają — to daty historyczne wprowadzenia funkcji,
  nie numer bieżącego wydania (L-0008).

**Do zrobienia przez człowieka:**

- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-18 — README: rozdzielona instalacja dla Claude Code i Cursora

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Sekcja „Instalacja" rozbita na dwie ścieżki** z tabelą różnic na wejściu (co instalujesz,
  zasięg instalacji, czy potrzebne repozytorium na dysku, jak się aktualizuje):
  **A. Claude Code — plugin** (bez zmian merytorycznych) i **B. Cursor — adapter (bez Claude
  Code)**.
- Ścieżka Cursora opisana **od zera, krok po kroku**: sprawdzenie Node.js, klon repozytorium
  w miejsce docelowe (z powodem: hooki wskazują ścieżkę bezwzględną), utworzenie folderu projektu,
  uruchomienie instalatora, restart Cursora, pierwsze zdanie w czacie („zacznijmy projekt").
  Dołożone: co robić przy kolejnym projekcie, jak aktualizować, jak odinstalować.
- Podsekcja **„Cursor bez Node.js"** przeniesiona do instalacji razem z wariantem `--bez-skanu`
  i zmienną `RELAI_NODE`.
- Sekcja opisowa „RelAI w Cursorze" odchudzona z **duplikatu instrukcji** — zostaje w niej to, co
  adapter daje i czym różni się od pluginu, plus link do właściwej sekcji instalacji.
- „Wymagania": usunięte odesłanie „instalacja niżej" (instrukcja jest wyżej), dołożony link do
  wariantu bez Node.js.

**Zweryfikowane — jak dokładnie:**

- Kontrakt instalatora sprawdzony w kodzie, nie z pamięci: `adapters/cursor/install.js:256` wymaga
  **istniejącego katalogu** (`to nie jest katalog` przy braku) i sam go nie zakłada — stąd osobny
  krok `mkdir` w instrukcji; flagi to `--bez-skanu` i `--uninstall` (linie 6–7, 45–46); git nie
  jest wymagany do instalacji adaptera.
- Adres repozytorium wzięty z `git remote -v`: `https://github.com/nowilus/relai.git` — nie
  z pamięci modelu.
- Polecenie instalatora występuje w README **czterokrotnie** i każde wystąpienie jest inne
  (instalacja, deinstalacja, `--bez-skanu`, opis drzewa katalogów) — duplikat instrukcji zniknął.
- Kotwica linku `#b-cursor--adapter-bez-claude-code` odpowiada nagłówkowi sekcji w konwencji
  GitHuba (małe litery, spacje na łączniki, myślnik długi usunięty).

**Świadomie odłożone:**

- **Angielska wersja README** — repozytorium jest publiczne, a instrukcja instalacji jest po
  polsku; to pierwsza rzecz, która zaboli kogoś spoza zespołu. Nie mieści się w dzisiejszej
  zmianie i należy do E8 (dystrybucja).
- Weryfikacja instrukcji **na kimś, kto jej nie pisał** — pilotaż E6 pokazał, że to jedyny sposób
  wyłapania luk w instrukcji instalacji; kryterium „ktoś inny niż autor" nadal niespełnione.

**Do zrobienia przez człowieka:**

- Przeczytać ścieżkę B oczami kogoś, kto ma wyłącznie Cursora, i powiedzieć, w którym kroku
  utknął — to jest tańsze niż czekanie na pierwszego użytkownika z zewnątrz. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Pozostałe bez zmian: ponowna instalacja pre-commita tam, gdzie jest, `claude /login`,
  `/relai-update` dla JiraManagera i PolyFlow, los `ProbaCursorE6`, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — Pomiar warstwy startowej trzech projektów i plan OPTYMALIZACJA_KONTEKSTU

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **Zmierzona warstwa czytana przy starcie sesji** w trzech projektach — sześć pozycji rytuału
  startu, sekcje liczone jako sekcje, nie całe pliki: **JiraManager 386 KB (≈120 tys. tokenów),
  PolyFlow 155 KB (≈48 tys.), RelAI 90 KB**. Rozbicie i przyczyna rozrostu każdej pozycji wpisane
  do sekcji 3 planu.
- **Znaleziona przyczyna martwej rotacji** — nie rozmiar, tylko mechanizm: zakres przenoszonych
  wpisów musi być ciągły od najstarszego, a wpis z otwartą pozycją „Do zrobienia przez człowieka"
  go przerywa. W JiraManagerze robi to **wpis numer jeden** (szablonowy `## Etap N — nazwa`), więc
  rotacja włączona 2026-08-12 nie przeniosła nigdy niczego przy dzienniku 1,00 MB. PolyFlow zapisał
  ten sam objaw trzy razy pod rząd we własnym dzienniku.
- **Dwie rundy wywiadu** (siedem rozstrzygnięć): forma pracy i kolejność wobec E7, budżet startu,
  kierunek architektoniczny, zakres migracji, sposób rozbrojenia rotacji, los mapy katalogów
  i pułapek z `CLAUDE.md`, polityka tabeli ryzyk, zachowanie hooka przy przekroczeniu budżetu.
- **Plan OPTYMALIZACJA_KONTEKSTU** utworzony jako `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html`
  (HTML, 234 KB z osadzonymi fontami) oraz `STATUS.md` ze statusem `DO AKCEPTACJI`: pięć etapów,
  budżet 80 KB na warstwę startową, cztery warianty z jawnymi powodami odrzucenia, siedem ryzyk,
  dziewięć rozstrzygniętych przypadków brzegowych, cztery bramki manualne. Plan ma symulator
  kosztu startu liczący na żywo ze zmierzonych wartości JiraManagera.
- **Linia aktywnego planu w `CLAUDE.md`** przestawiona na nowy plan, z adnotacją, że E7 planu
  ROZWOJ_PO_WYDANIU czeka do wydania 1.6.0. `STATE.md` opisuje oba plany i nowy najbliższy krok.

**Zweryfikowane — jak dokładnie:**

- Rozmiary i liczby wpisów liczone `wc`, `stat` i skryptem po nagłówkach — nie z pamięci modelu:
  JiraManager `CLAUDE.md` 1249 linii / 110 KB, `STATE.md` 1485 linii / 137 KB (sama sekcja „Nad czym
  pracujemy teraz" — 882 linie), „Zasady aktywne" 930 linii / 78 KB przy limicie 15 pozycji,
  dziennik 13 430 linii / 1,00 MB / 167 wpisów.
- Blokada rotacji potwierdzona **na treści**, nie z domysłu: skrypt przeszedł pierwsze dwanaście
  wpisów JiraManagera i sprawdził ich sekcje „Do zrobienia przez człowieka" wobec zamkniętej listy
  rdzeni rozstrzygnięcia z 1.5.2 — wpis nr 1 wychodzi jako otwarty, czyli ciąg kończy się na nim.
- Plan HTML zbudowany builderem (`zbuduj.js`, 6 reguł `@font-face`, kod wyjścia 0) i **otwarty
  w przeglądarce**: zero niewypełnionych znaczników, jedyne `http://` w pliku to przestrzeń nazw
  SVG (nie żądanie sieciowe), 13 bloków zwijalnych z unikalnymi `aria-controls`, brak przewijania
  w poziomie (439/439 px). Symulator policzony na wartościach startowych: 386 KB → 123 520 tokenów,
  483% budżetu, „już pęknięty"; po podstawieniu wartości docelowych schodzi do zapasu dodatniego.

**Świadomie odłożone:**

- **`ARCHITEKTURA.md` JiraManagera (305 KB)** i inne dokumenty czytane na żądanie — nie są w
  warstwie startowej, więc nie wchodzą do tego planu; wracają, gdy zaczną boleć w trakcie etapu.
- **Waga planów HTML** (234 KB przez osadzone fonty) — to plik dla człowieka, nie dla kontekstu
  sesji; podzbiór znaków zostaje otwartym tematem przy R5.
- Rusztowanie generacji planu (dwanaście plików pomocniczych) **przeniesione**, nie skasowane, do
  `%TEMP%\relai-build-20260820` — hook bezpieczeństwa dwukrotnie odrzucił `rm -rf` mimo podanych
  faktów; do sprawdzenia, czy bramka nie jest za szeroka.

**Do zrobienia przez człowieka:**

- **Zaakceptować albo poprawić plan** — bez akceptacji nie powstaje `PROMPT_ETAP_1` i nic nie rusza.
  *(rozstrzygnięte 2026-08-20 — plan zaakceptowany bez poprawek)*
- **Aneks do zamrożonego planu ROZWOJ_PO_WYDANIU**: numer wydania E7 z 1.6.0 na 1.7.0 — do
  zatwierdzenia przed startem E1. *(rozstrzygnięte 2026-08-20 — aneksu nie piszemy, E7 wstrzymany; bramka planu OPTYMALIZACJA_KONTEKSTU)*
- Pozostałe bez zmian: sekwencja wydania, ponowna instalacja pre-commita, `claude /login`, okno na
  migrację JiraManagera i PolyFlow, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — Plan OPTYMALIZACJA_KONTEKSTU zaakceptowany, E1 gotowy do startu

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- Plan **ZAAKCEPTOWANY bez poprawek** — brak aneksu, sekcje 1–9 zamrożone. Status zmieniony
  w `STATUS.md` i w metadanych `PLAN.html` (pasek i metka).
- **Wygenerowany `PROMPT_ETAP_1.md`** (23,5 KB) wg `SPEC_PROMPT_ETAPU.md`: dziewięć elementów
  w stałej kolejności, jedenaście pozycji do przeczytania na start, dziewięć decyzji zamkniętych
  wraz z granicą zakresu wobec E2–E5, stan wyjściowy z realnym drzewem plików rdzenia i adapterów,
  siedem punktów zakresu, dwanaście punktów weryfikacji (w tym cztery dowody negatywne) i rytuał
  „Na koniec".
- E1 ustawiony jako **GOTOWY DO STARTU** z linkiem do promptu; linia w dzienniku wdrożenia planu.
- Linia aktywnego planu w `CLAUDE.md` i `docs/STATE.md` odświeżone o status planu.

**Zweryfikowane — jak dokładnie:**

- Wszystkie 47 pozycji sekcji „Zasady aktywne" wstawione do promptu **programowo z `docs/LEKCJE.md`**,
  nie przepisane ręcznie — licznik po wstawieniu zwrócił 47, więc żadna zasada nie zgubiła się
  po drodze (spec wymaga przepisania w całości, nie linkiem).
- Status w `PLAN.html` podmieniony skryptem z kontrolą: 2 wystąpienia zmienione, 0 pozostało.
- Stan wyjściowy promptu spisany z **realnego repozytorium**, nie z planu: lista funkcji
  `session-signals.js` wzięta z grepa po definicjach, drzewo plików rdzenia i adapterów z `find`,
  brak katalogu testów potwierdzony (`find` po `*test*` — zero trafień), zawartość
  `core/MANIFEST.json` odczytana przed wpisaniem do promptu.

**Świadomie odłożone:**

- Nic nowego. Zakres E1 jest zamknięty w prompcie, reszta czeka w planie.

**Do zrobienia przez człowieka:**

- **Aneks do ROZWOJ_PO_WYDANIU** (E7: 1.6.0 → 1.7.0) — przed startem E1. *(rozstrzygnięte
  2026-08-20 — aneksu nie piszemy, E7 wstrzymany: konto Codeksa w planie darmowym i brak osoby
  do pilotażu)*
- Pozostałe bez zmian: sekwencja wydania po E4, ponowna instalacja pre-commita, `claude /login`,
  okno na migrację JiraManagera i PolyFlow, wdrożenie D-86 w E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E1: miara warstwy startowej, budżet 80 KB, naprawa martwej siatki D-34

Autor: RelAI (Opus 5) + Łukasz

**Zrobione:**

- **`core/process/session-signals.js` — `startCost(cwd, opcje)`**: czysta biblioteka bez zależności
  npm. Czyta wiersz `Budżet startu sesji` z `docs/USTAWIENIA.md` (kotwica na początku komórki
  `Decyzja`, człony rozdzielone `·`), mierzy sześć pozycji rytuału startu — całe pliki tam, gdzie
  rytuał czyta cały plik, i sekcje tam, gdzie czyta sekcję — i zwraca fakty: pozycje z `sposob`
  (`plik` / `sekcja` / `plik-bez-sekcji`), sumę, budżet, progi cząstkowe, listę pozycji ponad
  progiem i flagę przekroczenia sumy. Obsługuje nazwy dokumentów w języku projektu
  (`JOURNAL.md`, `LESSONS.md`, `SETTINGS.md`) i angielskie nagłówki sekcji.
- **`startCostReport(miara, opcje)`** — raport ASCII, najwyżej sześć linii, wyłącznie powyżej
  budżetu. Formatowanie świadomie mieszka w rdzeniu, wbrew domyślnej regule „formatowanie
  u adaptera": plan wymaga **tego samego** raportu w obu adapterach, a jedno brzmienie w dwóch
  plikach rozjechałoby się przy pierwszej poprawce (ryzyko P4). Powód zapisany w nagłówku pliku.
- **Oba hooki `session-context`** wołają tę samą funkcję rdzenia. Cursor przekazuje
  `interaktywna: is_background_agent !== true` — sygnał **zmierzony** w E5. Claude Code nie
  przekazuje nic, bo nie ma czym rozstrzygnąć (patrz „Świadomie odłożone").
- **`core/templates/SPEC_USTAWIENIA.md`** — sekcja „Wiersz `Budżet startu sesji` (od 1.6.0)":
  format maszynowy, osiem członów z wartościami domyślnymi (to jedyne źródło prawdy o tych
  liczbach), zachowanie przy wartości nierozpoznanej, przy braku wiersza i przy braku sekcji
  w dokumencie. Plus wiersz w tabeli inicjalizacyjnej i w kompletnym przykładzie na końcu.
- **`docs/USTAWIENIA.md`** — wiersz `Budżet startu sesji` z 2026-08-20 (dogfooding: RelAI mierzy
  sam siebie). **`docs/KOMENDY.md`** — jedna linia w „Czego RelAI pilnuje bez proszenia".
- **Poprawka spoza pierwotnego zakresu, wykonana na wyraźną decyzję Łukasza:**
  `liniaAktywnegoPlanu` brała **pierwszą** linię z frazą „Aktywny plan", a w `CLAUDE.md` tego
  projektu fraza pada najpierw w prozie rytuału startu — bez linku. Skutkiem była **martwa siatka
  D-34 i martwy detektor rozjazdu stanu w całym repozytorium od 1.3.0**: oba zwracały `null` na
  braku linku i milczały nie dlatego, że było zgodnie, tylko dlatego, że nie miały czego
  porównać. Teraz wygrywa linia **niosąca link do `STATUS.md`**, a `promptGap` korzysta z tej
  samej funkcji zamiast własnej kopii logiki. Przy okazji poprawiona treść
  [CLAUDE.md:14](../CLAUDE.md) — mówiła „obecnie: ROZWOJ_PO_WYDANIU", czyli nieprawdę.

**Zweryfikowane — jak dokładnie:**

- **Sześć pozycji i suma na tym repozytorium:** CLAUDE 6066 B · STATE 12 668 B · ryzyka 21 441 B ·
  zasady 11 488 B · ustawienia 4220 B · status planu 1996 B = **57 879 B przy budżecie 81 920 B**.
  Cztery pozycje mierzone jako cały plik zgodne **co do bajta** z `stat -c%s`. Dwie sekcje
  porównane z `awk`/`sed`: zasady 11 488 vs 11 489 B, ryzyka + ostatni wpis 21 441 vs 19 411 + 2030
  B — różnice wynikają wyłącznie z końcowego znaku nowej linii, który `awk` dolicza, a złączenie
  linii nie. Po dopisaniu tego wpisu, lekcji i zmianach w `STATE.md` ten sam pomiar daje
  **około 65 KB** — sam etap zjadł ~8 KB budżetu, w większości w sekcji ryzyk (20,9 → 26,6 KB). To nie
  jest usterka, tylko dowód, że pozycja „ryzyka" rośnie przy każdym pomiarze; jej odchudzenie
  należy do E4.
- **Dowód negatywny na ciszę:** zrzut wyjścia hooka `SessionStart` zrobiony **przed** pierwszą
  edycją i porównany `cmp` po zmianach — **bajt w bajt identyczny** w trzech przypadkach: projekt
  testowy poniżej budżetu (Claude Code i Cursor osobno) oraz to repozytorium (57,9 KB < 80 KB).
- **Projekt powyżej budżetu** (katalog testowy z `STATE.md` na 90 KB): raport ma **3 linie** —
  suma wobec budżetu, trzy najgrubsze pozycje z progami, zdanie instrukcji. Wariant z brakującym
  nagłówkiem: **4 linie**, w tym jawne „zmierzone jako caly plik, bo nie znaleziono szukanej
  sekcji: ryzyka — wartosc jest zawyzona z tego powodu"; pozycja ma `sposob: plik-bez-sekcji`.
- **Przełącznik `wyłączony`, brak wiersza budżetu, brak `docs/USTAWIENIA.md`:** w wyjściu hooka
  **zero** trafień na słowo „budzet" (dowód negatywny), pozostałe sygnały niezmienione.
  **Wartość nierozpoznana** (`byle co`): dokładnie **jedna** linia raportu, bez liczenia.
- **Folder niebędący projektem RelAI:** oba hooki kończą się kodem **0** przy **pustym stdout**
  (0 bajtów). Projekt RelAI bez `docs/USTAWIENIA.md` daje normalny kontekst startu i **zero**
  linii o budżecie — pusty stdout dotyczy wyłącznie folderu bez markera.
- **Cursor, sesja nieinteraktywna** (`is_background_agent: true`): raport jest, a zamiast
  propozycji odchudzenia pada „Sesja nieinteraktywna: to jest sam raport, bez propozycji
  odchudzenia".
- **Naprawa siatki D-34 zmierzona na projektach testowych**, z `CLAUDE.md` odtwarzającym pułapkę
  (fraza najpierw w prozie, potem w linii z linkiem): etap `GOTOWY DO STARTU` bez pliku promptu →
  `promptGap` zwraca `{stage: "E1"}`; **dowód negatywny** — ten sam projekt z istniejącym plikiem
  promptu → `null`. Etap `W TOKU` przy `STATE.md` niewspominającym planu → `stateDrift` zwraca
  fakt rozjazdu. Przed poprawką wszystkie trzy przebiegi dawały `null`.
- Brak polskich diakrytyków w literałach obu hooków i w `startCostReport`
  (`grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` bez trafień, L-0016). `node core/tools/validate-adapters.js`
  kończy się kodem 0. `grep -rn "startCost" adapters/` pokazuje **wywołania**, nie drugą
  implementację liczenia. `core/MANIFEST.json` nadal ma `1.5.2` (dowód negatywny — wersję podbija
  E4).
- Katalogi testowe powstały poza repozytorium (`%TEMP%\relai-e1`); w repo nie ma plików
  tymczasowych.

**Świadomie odłożone:**

- **Rozpoznanie sesji nieinteraktywnej w Claude Code.** Payload `SessionStart` nie niesie żadnego
  zmierzonego rozróżnienia wobec `claude -p`; jedyny kandydat (`CLAUDE_CODE_ENTRYPOINT`) nie
  został z niczym porównany, bo pomiar `claude -p` stoi na wyczerpanym limicie konta (L-0032).
  Zamiast zgadywać, adapter Claude Code nie przekazuje opcji `interaktywna` i zachowuje się jak
  w sesji interaktywnej — funkcja rdzenia jest na to gotowa. Wraca w E2, gdzie od tego zależy
  rotacja na starcie, i w odnodze `POMIAR_ODNOG`.
- **Sekcja „Zasady aktywne" ma 49 pozycji przy limicie 15** ze `SPEC_LEKCJE.md`. Dwie nowe lekcje
  ten stan pogłębiają. Skrócenie zasad do formatu „jedna zasada = jedno zdanie" należy do E3 —
  nie ruszam go przy okazji.
- **Plan ROZWOJ_PO_WYDANIU** zostaje z niezamkniętym E7 i numerem wydania 1.6.0 w dokumentach.
  Dopóki E7 stoi, kolizja numerów nie grozi.

**Do zrobienia przez człowieka:**

- **Decyzja o zamrożeniu planu ROZWOJ_PO_WYDANIU** — Łukasz przy starcie E1: „moglibyśmy
  ewentualnie to zamrozić". Zamrożenie formalne (status planu + linia w `STATE.md`) albo jego brak
  zmienia to, co widzi start sesji. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Bez zmian: sekwencja wydania 1.6.0 po E4, ponowna instalacja pre-commita, `claude /login` na
  konto z limitem, okno na migrację JiraManagera i PolyFlow, wdrożenie D-86 przy odmrożeniu E7. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E2: rozbrojenie rotacji — sekcja „Czeka na człowieka" i drugie wejście na starcie

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_DZIENNIK.md` — sekcja „Czeka na człowieka"**: format pozycji (treść · data
  pierwszego wystąpienia · link do najstarszego wpisu źródłowego), nadpisywana, nigdy do archiwum,
  wyłącznie sprawy otwarte, jedna sprawa = jedna pozycja, pusta ma jawne „—". Sekcja „Do zrobienia
  przez człowieka" we wpisie dostała **zamknięte, czytane maszynowo** brzmienie adnotacji
  `*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*` wraz z regułą, że taki wpis rotacji
  już nie blokuje. Kompletny przykład na końcu specyfikacji obejmuje obie sekcje (L-0001).
- **`core/templates/SPEC_ARCHIWUM.md` — blokada zmieniła adres.** Nowa sekcja „Blokada liczy się
  z sekcji «Czeka na człowieka»" mówi wprost, co blokuje (wpis linkowany z **otwartej** pozycji),
  a co nie (wpis z pozycją wyprowadzoną albo rozstrzygniętą). Sekcja „Kiedy powstaje" opisuje
  **dwa wejścia** rotacji — zamknięcie sesji bez zmian, start sesji przy trzech warunkach naraz
  (przekroczony budżet · rotacja włączona · sesja interaktywna) — i mówi wprost, że różnią się
  wyłącznie momentem. Cztery nowe przypadki brzegowe, w tym „mniej niż dziesięć wpisów" i projekt
  sprzed 1.6.0.
- **`core/process/session-signals.js`** — `startCost` czyta drugi, niezależny przełącznik (wiersz
  `Rotacja dokumentów`) i zwraca go jako fakt `rotacja: true | false | null`. `startCostReport`
  powyżej progu: rotacja włączona → linia zaczynająca się od **„Zaproponuj rotacje"**; wyłączona
  albo nieustawiona → pół zdania o wyłączniku, bez propozycji; sesja nieinteraktywna → sam raport,
  bez propozycji i bez rotacji. Sekcja „Czeka na człowieka" wchodzi do **istniejącej** pozycji
  `ryzyka`, bo rytuał startu czyta ją razem z ryzykami — siódmej pozycji budżetu **nie ma**.
- **`adapters/claude-code/skills/relai-core/SKILL.md`** — dwie nowe sekcje: „Rotacja na starcie
  sesji" (trzy warunki, rozpoznanie po frazie z raportu hooka, zakaz w sesji nieinteraktywnej,
  zakaz automatycznego odpalenia) oraz sześciokrokowa **procedura wyprowadzenia** zastanych pozycji
  z liczeniem przed i po. Sekcja rotacji w rytuale zamknięcia dostała nowy adres blokady.
- **`adapters/cursor/rules/relai-core.mdc`** — reguły Cursora **nie mówiły ani o rotacji na
  starcie, ani o sekcji**; doszły dwa zdania po angielsku (ustawienie z 2026-08-12) plus
  poprawiona reguła blokady w rytuale zamknięcia. Warstwa zawsze-w-kontekście jest tam jedynym
  nośnikiem (L-0030).
- **Dogfooding — `docs/DZIENNIK.md` tego repozytorium**: sekcja „Czeka na człowieka" z dziewięcioma
  sprawami, każda z linkiem do najstarszego wpisu źródłowego. 34 linie źródłowe dostały adnotację
  o wyprowadzeniu, 7 kolejnych — adnotację rozstrzygnięcia, bo ich rozstrzygnięcie **jest faktem
  w repozytorium**: E5 zamknięty 2026-08-12, E6 i D-86 2026-08-17, zamknięta lista brzmień
  w 1.5.2 (L-0035), P2 zmierzone na Groku 4.6, aneks numeru wydania odrzucony 2026-08-20.
- **`docs/KOMENDY.md`** — jedna pozycja w „Czego RelAI pilnuje bez proszenia".

**Zweryfikowane — jak dokładnie:**

- **Rotacja rusza tam, gdzie dotąd stała.** Instrument `zakres.js` implementuje regułę blokady
  w **obu** wersjach i liczy zakres dla obu stanów w jednym przebiegu (L-0040). Projekt testowy:
  14 wpisów, 166 KB przy progu 150 KB. **PRZED** (reguła 1.5.2, brak sekcji): do przeniesienia
  **0 wpisów** — „pierwsza pozycja nietykalna: Etap testowy 1". **PO** (reguła 1.6.0): **2 wpisy**,
  zatrzymanie na wpisie 3. Kontrola izolująca przyczynę: ten sam materiał PO pod regułą 1.5.2 daje
  **1 wpis** (blokuje wpis 2, bo adnotacja o wyprowadzeniu jest dla niej dopiskiem spoza listy) —
  różnica bierze się z reguły, nie z materiału.
- **Dowód negatywny na blokadę:** wpis 3 ma adnotację o wyprowadzeniu we własnej sekcji, a mimo to
  **nie** został przeniesiony, bo prowadzi do niego link z otwartej pozycji sekcji. Wpis 1 —
  najstarszy, wyprowadzony i rozstrzygnięty — **został** przeniesiony.
- **Nic nie ginie, policzone skryptem na obu stanach pliku:** `inwentarz.js` na
  `git show HEAD:docs/DZIENNIK.md` i na pliku po zmianie. Przed: 60 pozycji, w tym **41 otwartych**,
  sekcja „Czeka na człowieka" BRAK. Po: 60 pozycji, **0 otwartych**, 34 z adnotacją o wyprowadzeniu,
  26 rozstrzygniętych (19 zastanych + 7 nowych), sekcja: **9 pozycji**. Mapowanie linia → sprawa
  jest jawne w `wyprowadz.js`. Archiwum dziennika sprawdzone osobno: **0 otwartych pozycji**.
- **Wszystkie 9 kotwic sekcji wskazuje istniejące nagłówki wpisów** — porównanie zbioru kotwic
  wyliczonych z nagłówków `###` ze zbiorem linków sekcji: 9 żywych, 0 martwych (L-0013).
- **Suma kontrolna zgodna w obu fazach:** `f764d1f0373d71ab` przy liczeniu z żywego pliku i po
  odczycie archiwum **z dysku** (SHA-256 po normalizacji CRLF → LF, L-0033). Żywy plik po
  przycięciu plus archiwum składają się w oryginał **znak w znak** (167 203 = 167 203); rozmiar
  166,1 → 142,3 KB.
- **Rotacja wyłączona, budżet włączony:** raport jest (4 linie), **zero trafień** na frazę
  „Zaproponuj rotacje" (dowód negatywny), pada „Rotacja dokumentow jest wylaczona albo
  nieustawiona". Brak wiersza `Rotacja dokumentów` zachowuje się tak samo — bez zgadywania (L-0025).
- **Budżet wyłączony, rotacja włączona:** w wyjściu hooka **zero trafień** na „budzet" i na
  „rotacj", a pozostały kontekst startu (1823 B) bez zmian; kod wyjścia 0.
- **Sesja nieinteraktywna zmierzona tam, gdzie sygnał istnieje** — Cursor,
  `is_background_agent: true`: raport jest, propozycji rotacji **nie ma**, pada zdanie „Sesja
  nieinteraktywna: to jest sam raport, bez propozycji odchudzenia i bez rotacji na starcie".
  Kontrola, że test nie jest pusty: ta sama konfiguracja z `is_background_agent: false` daje
  propozycję. **Dla Claude Code punkt pozostaje niewykonalny** — patrz „Świadomie odłożone".
- **Dziennik ponad progiem, mniej niż dziesięć wpisów** (6 wpisów, 175 KB): rotacja nie rusza,
  powód nazwany wprost („mniej niz 10 wpisow"), nie cisza.
- **Pozycja rozstrzygnięta znika z sekcji:** pozycja z rdzeniem z zamkniętej listy i datą przestaje
  blokować wpis; pozycja z dopiskiem **spoza** listy („w toku 2026-01-20") blokuje dalej — dowód
  negatywny (L-0035).
- **Sekcja doliczona do pomiaru:** para projektów testowych różniąca się wyłącznie obecnością
  sekcji daje pozycję `ryzyka` 1362 B vs 1486 B (+124 B). Liczba pozycji budżetu bez zmian — brak
  identyfikatora `czeka`. Projekt bez sekcji nie jest awarią.
- **Przełącznik jako fakt:** `startCost().rotacja` daje `true` / `false` / `null` dla wiersza
  włączonego, wyłączonego i nieobecnego.
- `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na obu hookach: **bez trafień** (L-0016). Raport rdzenia
  w trzech wariantach ma 5 / 4 / 3 linie — **poniżej limitu sześciu**, zero diakrytyków. Limit
  liczony na tablicy zwracanej przez `startCostReport`, nie na `stdout` hooka (L-0051).
- `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.5.2". **Dowód negatywny
  na wersję:** `core/MANIFEST.json`, `.claude-plugin/plugin.json` i marker `Wersja RelAI` nadal
  **1.5.2** — podbicie należy do E4.
- Katalogi i pliki testowe powstały poza repozytorium (`%TEMP%\relai-e2`) i zostały usunięte;
  w repozytorium nie ma plików tymczasowych.

**Świadomie odłożone:**

- **Rozpoznanie sesji nieinteraktywnej w Claude Code — nadal niewykonalne.** Payload `SessionStart`
  nie niesie zmierzonego rozróżnienia wobec `claude -p`, a jedyny kandydat
  (`CLAUDE_CODE_ENTRYPOINT`) wymaga porównania dwóch przebiegów CLI — te stoją na wyczerpanym
  limicie konta (L-0032). **Warunek wykonalności:** `claude /login` na konto z limitem, potem jeden
  przebieg `claude -p` i jeden interaktywny na tym samym projekcie. Do tego czasu adapter Claude
  Code zachowuje się jak w sesji interaktywnej, a jedynym zabezpieczeniem jest zakaz zamiany
  propozycji w automatyczne odpalenie. Punkt dopisany do odnogi `POMIAR_ODNOG`.
- **Rotacja tego dziennika.** Plik jest **poniżej progu** 150 KB, więc rotacja nie ma prawa ruszyć
  i nie rusza. Pierwsza rotacja po rozbrojeniu blokady wydarzy się sama, gdy plik urośnie; dowód,
  że rozbrojenie działa, dał projekt testowy, nie to repozytorium.
- **Odchudzenie pozycji `ryzyka` i `STATE`** — obie są ponad własnymi progami. Należy do E3 i E4.
- **Wyprowadzenie pozycji w JiraManagerze i PolyFlow** — procedura jest opisana, ale uruchamia ją
  E5, po `/relai-update` do 1.6.0.

**Do zrobienia przez człowieka:**

- **Weryfikacja siedmiu rozstrzygnięć wpisanych w tej turze** — każde ma w adnotacji swój dowód
  (zamknięty etap, decyzja, lekcja). Jeśli któreś nie odpowiada Twojej wiedzy, jedna linia to
  cofa, a sprawa wraca do sekcji „Czeka na człowieka".
  *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
- Pozostałe sprawy mają teraz stały adres: sekcja **„Czeka na człowieka"** na górze tego pliku,
  dziesięć pozycji otwartych. *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*

### 2026-08-20 — E3: twardy kształt STATE i CLAUDE, rejestr pułapek jako osobny dokument

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **`core/templates/SPEC_STATE.md` — twardy kształt sekcji „Nad czym pracujemy teraz".** Nowa sekcja
  specyfikacji: najwyżej **trzy pozycje**, każda jednoakapitowa, zamknięty etap **podmienia** pozycję
  zamiast dopisywać kolejną. Wypisana kolejność wypadania, gdy pozycji byłyby cztery (zamknięta →
  „Co działa"; wstrzymana → „Co blokuje"; nierozpoczęta → „Co dalej"; cztery wątki naraz → zostają
  trzy najważniejsze i pada o tym zdanie). Dwa nowe zakazy. Przykład na końcu przepisany pod nowy
  kształt (L-0001).
- **`SPEC_STATE.md` — próg zwięzłości przestał być oceną.** Wyzwalaczem zostaje liczba linii (300,
  wiersz `Rotacja dokumentów`), a **celem** przepisania jest odtąd liczba: plik ma zejść poniżej
  progu cząstkowego `STATE` z wiersza `Budżet startu sesji` (12 KB) — tego samego, który mierzy
  hook. Dwie komendy sprawdzające wpisane wprost. Zdanie o pierwszeństwie wartości projektowej
  i zdanie o jednym wyzwalaczu (L-0049).
- **`core/templates/SPEC_CLAUDE_MD.md` — limit w KB zamiast linii.** „Maksimum 60 linii" zastąpione
  progiem **10 KB** z jawnym powiązaniem z wierszem `Budżet startu sesji` i komendą sprawdzającą.
  Powód zmiany jednostki opisany w specyfikacji, nie tylko w dzienniku.
- **`SPEC_CLAUDE_MD.md` — zakaz treści odtwarzalnej z repozytorium.** Nowa sekcja z dwiema listami:
  co podpada (mapa katalogów, listy plików i modułów, wyliczenia zależności, listy komend) i co
  **nie** podpada (reguły procesu, sekcja niemutowalna, linia aktywnego planu, rytuał startu, tabela
  „Stan prac" jako drogowskazy). Granica jednym pytaniem: czy sesja odtworzy to, patrząc na
  repozytorium. Dołożona sekcja o **warunkowej** linii odsyłacza do `docs/PULAPKI.md`.
- **Cztery miejsca z martwym limitem 60 linii doprowadzone do zgodności:** `core/templates/README.md`,
  `SPEC_PROFILE.md`, `commands/relai-adopt.md`, `commands/relai-update.md`. Zostawienie ich
  oznaczałoby dwa sprzeczne limity w jednym wydaniu.
- **`core/templates/SPEC_PULAPKI.md` — nowa specyfikacja.** Rozstrzyga wprost: czym pułapka jest
  (fakt o narzędziu, kolejności kroków, środowisku), czym nie jest (tabela granic wobec `LEKCJE`,
  `DECYZJE`, `USTAWIENIA`, ryzyk i `ARCHITEKTURA`), kiedy dokument powstaje (przy pierwszej pułapce,
  nigdy na zapas) i kto go czyta (sesja **na żądanie**, dlatego poza warstwą startową). Dwa testy
  rozstrzygające granicę, format wpisu `P-NNN` (objaw / przyczyna / obejście / zasięg), statusy,
  sekcja „Nieaktualne" zamiast kasowania, sześć zakazów, kompletny przykład.
- **`docs/PULAPKI.md` w tym repozytorium — dogfooding.** Sześć pułapek narzędziowych wyprowadzonych
  z „Zasad aktywnych": `tar` na `PATH` (P-001, L-0021), sesja pomiarowa `claude -p` (P-002, L-0024),
  PowerShell 5.1 i UTF-8 (P-003, L-0027), `acceptEdits` bez `--allowedTools` (P-004, L-0028),
  restart aplikacji po `plugin update` (P-005, L-0031), `git worktree` zamiast `git archive | tar`
  (P-006, L-0039).
- **`SPEC_LEKCJE.md` — procedura wyprowadzenia pułapki.** Test rozstrzygający („czy dałoby się tego
  uniknąć, zachowując się inaczej?"), czterokrokowa procedura, zamknięte brzmienie adnotacji
  `*(przeniesione RRRR-MM-DD → docs/PULAPKI.md, P-NNN — …)*` i reguła, że wpis, który zdążył trafić
  do archiwum, **zostaje nietknięty** — bo archiwum jest kopią bajt w bajt i edycja zerwałaby jego
  sumę kontrolną.
- **Limit „Zasad aktywnych" dostał jeden adres egzekwowania** — krok 1 rytuału zamknięcia sesji,
  z komendą liczącą pozycje. Opisany w `SPEC_LEKCJE.md`, w skillu `relai-core` i w regule Cursora,
  z jawnym zakazem drugiego adresu. **Wybór uzasadniony:** raport budżetu startu odzywa się wyłącznie
  przy przekroczeniu **sumy** warstwy startowej, a to repozytorium ma 48 pozycji przy limicie 15
  i **mieści się w budżecie** — raport milczałby dokładnie tam, gdzie limit jest łamany.
- **`CLAUDE.md` tego repozytorium przepisany:** tabela „Stan prac" z 22 wierszy historii etapów do
  **pięciu wierszy-drogowskazów**, linia aktywnego planu bez ogona prozy, dołożona linia odsyłacza do
  `docs/PULAPKI.md`. Sekcja niemutowalna nietknięta.
- **`docs/STATE.md` przepisany pod nowy kształt:** „Nad czym pracujemy teraz" z siedmiu akapitów do
  **dwóch pozycji**, „Co działa" i „Co dalej" zwięźlej, liczby zaktualizowane.
- **`docs/KOMENDY.md`** — jedna pozycja w „Czego RelAI pilnuje bez proszenia" o rejestrze pułapek
  czytanym na żądanie. Bez obiecywania czegokolwiek z E4–E5 (L-0002).

**Zweryfikowane — jak dokładnie:**

- **Pomiar przed i po w jednym przebiegu** (L-0040), oba stany liczone tą samą funkcją `startCost`;
  stan „przed" to snapshot sześciu plików warstwy startowej zrobiony przed pierwszą zmianą
  merytoryczną etapu. Suma **73,4 KB → 63,8 KB** przy budżecie 80 KB. Pozycje: `CLAUDE`
  **6,5 → 3,1 KB** (próg 10 — **przeszedł**), `STATE` **14,5 → 9,3 KB** (próg 12 — **przeszedł**),
  `ryzyka` 32,1 KB bez zmian (należy do E4), `zasady` 12,4 → 11,3 KB, `ustawienia` 4,1 KB, `status`
  3,8 KB. Raport nadal milczy, bo suma jest pod budżetem.
  **Po dopisaniu tego wpisu** (12,2 KB, wchodzi do pozycji `ryzyka` jako „ostatni wpis") warstwa
  waży **69,6 KB / 80 KB** — nadal pod budżetem, raport nadal milczy. Liczba 63,8 KB opisuje stan
  po zmianach merytorycznych, a przed rytuałem zamknięcia; obie są prawdziwe i obie są tu wypisane,
  żeby następny pomiar nie wyglądał na regres.
- **Nic nie zginęło przy skracaniu `STATE.md`.** Diff usuniętych akapitów przejrzany pozycja po
  pozycji; lista niżej. Każdy fakt, który wypadł, ma dom w innym dokumencie — sprawdzone grepem, nie
  z pamięci. Jedyny konkret budzący wątpliwość, `gitCommitSha e6b41dc`, stoi we wpisie dziennika
  z 2026-08-12 (linie 414–416).
- **`CLAUDE.md` bez treści odtwarzalnej — dowód negatywny:** `grep -E` po wzorcach ze specyfikacji
  (drzewa katalogów, ścieżki `core/…`, `adapters/…`, wyliczenia trzech plików `.md` w jednej komórce,
  listy plików `.js`/`.json`) — **zero trafień**. **Sekcja niemutowalna:** `diff` fragmentu od
  nagłówka „Implementation guidelines" do końca pliku wobec `git show HEAD:CLAUDE.md` — **identyczna
  co do znaku** (L-0007).
- **„Nad czym pracujemy teraz" ma dwie pozycje** — policzone skryptem na pliku, sufit trzy.
- **`docs/PULAPKI.md` nie wchodzi do warstwy startowej — dowód negatywny:** `startCost` po założeniu
  pliku ma nadal **sześć** pozycji, żadna nie wskazuje tego pliku (wypisane ścieżki wszystkich
  sześciu). Dodatkowo `grep` po `core/process/`, `core/guardrails/`, `core/tools/` i obu hookach
  `session-context` — **zero** odwołań do `PULAPKI`.
- **Komponent warunkowy da się pominąć bez śladu** (L-0029). Dwa bliźniacze projekty testowe poza
  repozytorium, różniące się **wyłącznie** obecnością `docs/PULAPKI.md`; hook `session-context`
  uruchomiony na obu payloadem podstawionym Nodem (L-0017). Kontekst startu: **1842 B w obu
  przypadkach, identyczny bajt w bajt** po normalizacji ścieżki projektu. Słowo „PULAPKI" w kontekście
  startu: **zero trafień**. `CLAUDE.md` projektu bez pułapek: **bez linii odsyłacza**. Kontrola, że
  test nie jest pusty: kontekst ma 1842 B, nie zero.
- **Przeniesione pułapki zostawiły ślad — dowód negatywny na każdą z sześciu.** Instrument sprawdził
  jednocześnie cztery rzeczy per pozycja: zniknęła z listy „Zasad aktywnych", jest w linii zbiorczej,
  jest w `docs/PULAPKI.md`, a wpis źródłowy ma adnotację o przeniesieniu. Cztery wpisy żywe (L-0027,
  L-0028, L-0031, L-0039) mają adnotację w treści; dwa (L-0021, L-0024) mieszkają w archiwum bajt
  w bajt i ich śladem jest **wyłącznie** linia zbiorcza — archiwum celowo nietknięte. Kontrola, że
  test nie jest pusty: nieprzeniesiona L-0030 nadal jest na liście.
- **Limit „Zasad aktywnych" ma dokładnie jeden adres — dowód negatywny:** egzekwowanie znalezione
  wyłącznie w warstwie rytuału zamknięcia (skill Claude Code, reguła Cursora — jedna sesja używa
  jednej z nich), **zero** w rdzeniu i w obu hookach. Raport budżetu startu nie wspomina limitu
  pozycji ani słowem (L-0036, L-0049).
- **`SPEC_PULAPKI.md` wymieniona tam, gdzie wymieniane są pozostałe specyfikacje** —
  `core/templates/README.md`, własna tabela dokumentów warunkowych czytanych na żądanie.
  **Sprawdzone, nie założone:** `core/MANIFEST.json` **nie wylicza** specyfikacji pojedynczo — pole
  `templates` wskazuje katalog `./templates/`, więc nie ma tam czego dopisywać.
- `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.5.2".
- **Wersja nie została podbita — dowód negatywny:** `core/MANIFEST.json` 1.5.2,
  `.claude-plugin/plugin.json` 1.5.2, marker `Wersja RelAI: 1.5.2`.
- **Diakrytyki w komunikatach hooków** (L-0016): oba pliki `session-context.js` — **zero** linii
  z polskimi znakami. Sześć trafień w `core/process/session-signals.js` to wzorce **czytające**
  polskie nagłówki dokumentów, nie literały komunikatów; w tym etapie nie powstał ani jeden nowy
  komunikat hooka.
- Katalogi i pliki testowe powstały poza repozytorium (`%TEMP%\relai-e3`) i zostały usunięte.

**Lista akapitów usuniętych ze `STATE.md` i ich domy** — dowód do punktu „nic nie zginęło":

| Co wypadło | Gdzie stoi dalej |
|---|---|
| Rozwinięcie czterech scenariuszy akceptacyjnych | wpis dziennika 2026-08-10 (E10) |
| „Nowe rozstrzygnięcia po adopcji idą do `DECYZJE.md`" | `SPEC_CLAUDE_MD.md`, sekcja „Reguła rejestru decyzji po adopcji" |
| „Sprawy człowieka wychodzą do statusu planu, plan nie zamyka się bez pytania" | `SPEC_STATUS.md`, „Bramki manualne"; skill `relai-planning` |
| Naprawa `liniaAktywnegoPlanu` — siatka D-34 i detektor rozjazdu milczały | wpis dziennika 2026-08-20 (E1), L-0048 |
| Poprawka skanera 1.5.1 i dwie warstwy blokady sekretu | wpis 2026-08-17 (E6), ryzyko P1, L-0045 |
| „Brak Node.js nie usuwa guardraila po cichu", flaga `--bez-skanu` | L-0043, `adapters/cursor/README.md` |
| `gitCommitSha e6b41dc` zainstalowanej wersji | wpis dziennika 2026-08-12, linie 414–416 |
| Rozmiary dzienników JiraManagera i PolyFlow (348 / 223 KB) | ryzyko R5; `PLAN.html` planu, sekcja 3 |
| „Repozytorium publiczne — zweryfikowane 2026-08-12" (data weryfikacji) | wpis dziennika 2026-08-12 |
| Wymagane wersje pluginu dla scenariuszy rotacji (1.2.0 / 1.3.0) | `odnogi/POMIAR_ODNOG/PROMPT_ODNOGA.md` |
| Rozwinięcie nazw czterech otwartych ryzyk | tabela „Stan otwartych ryzyk" wyżej w tym pliku |
| „Dwadzieścia specyfikacji", układ katalogów rdzenia i adapterów | odtwarzalne z repozytorium — nowa reguła `SPEC_CLAUDE_MD.md` |

Przy okazji poprawiona liczba **błędna przed tym etapem**: otwartych bramek manualnych jest
**dziewięć** (5 w planie OPTYMALIZACJA_KONTEKSTU, 4 w ROZWOJ_PO_WYDANIU), a nie cztery — `STATE.md`
liczył tylko jeden plan.

**Świadomie odłożone:**

- **Przepisanie 48 zasad aktywnych do limitu 15.** Zakres etapu obejmował **adres egzekwowania**, nie
  samą kompresję — a kompresja i graduacja zmieniają treść wstecz i wymagają zgody człowieka
  (`SPEC_LEKCJE.md`). Od tej tury limit ma miejsce, w którym się o nim mówi; pierwsze zdanie pada
  w podsumowaniu tej sesji.
- **Pozycja `ryzyka` (32,1 KB przy progu 12 KB)** — najgrubsza w warstwie startowej, należy do E4.
- **Brakująca linia fraz sesji w `CLAUDE.md` tego repozytorium.** `SPEC_CLAUDE_MD.md` wymaga jej od
  1.0.0 (D-05), a tego pliku nigdy nie dotknęła. Wykryte przy przepisywaniu, **nie naprawione** —
  poza zakresem etapu, który dotyczy objętości i treści odtwarzalnej. Do rozstrzygnięcia w E4 albo
  jako drobna poprawka: jedna linia, około 200 B.
- **Rotacja tego dziennika — próg przekroczony właśnie tym wpisem.** Po dopisaniu plik ma **151,9 KB**
  przy progu 150 KB, więc rotacja **należy się** i uruchamia ją krok 2 rytuału zamknięcia sesji, nie
  rytuał „Na koniec" etapu. To będzie **pierwsza rotacja po rozbrojeniu blokady z E2** i pierwszy
  raz, gdy mechanizm zadziała na tym repozytorium, a nie na projekcie testowym — dlatego wykonuje się
  ją świadomie, przy człowieku, a nie mimochodem na końcu etapu.

**Do zrobienia przez człowieka:**

- **Zgoda na odchudzenie sekcji „Zasady aktywne" — 48 pozycji przy limicie 15.** Kompresja tematyczna
  albo graduacja do `CLAUDE.md`; obie zmieniają treść wstecz, więc bez zgody nic się nie dzieje.
  *(rozstrzygnięte 2026-08-20 — zgoda Łukasza w tej samej sesji; kompresja wykonana: 48 pozycji
  w 15 grup, 30 wpisów ze statusem ZWINIĘTA, patrz kolejny wpis)*

### 2026-08-20 — Pierwsza rotacja dziennika po rozbrojeniu blokady i kompresja „Zasad aktywnych"

Autor: RelAI (Opus 5) + Lukasz

**Zrobione:**

- **Rotacja dziennika — pierwsza w tym repozytorium po rozbrojeniu blokady z E2.** Do archiwum
  poszły dwa najstarsze wpisy z 2026-08-10 (`docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md`),
  a w żywym pliku została druga linia-odsyłacz, pod tą z 2026-08-17. Rozmiar **153,9 → 143,5 KB**
  przy progu 150 KB.
- **Zakres skończył się na trzecim wpisie i to jest zachowanie poprawne**, nie usterka: do wpisu
  „Audyt gotowości 1.0.0" prowadzi link z **otwartej** pozycji sekcji „Czeka na człowieka"
  (sekwencja wydania), a zakres rotacji jest ciągły od najstarszego. Dalej blokują kolejne wpisy
  linkowane z otwartych spraw. Rotacja przenosi tyle, ile wolno, i tyle przeniosła.
- **Kompresja sekcji „Zasady aktywne" — 48 pozycji w 15 grup tematycznych** (`SPEC_LEKCJE.md`,
  sekcja „Kompresja"), za zgodą Łukasza. Trzydzieści pełnych wpisów `L-NNNN` dostało status
  `ZWINIĘTA 2026-08-20` i przeniosło się do nowej sekcji **„Lekcje zwinięte"** na końcu pliku.
  Nic nie zostało skasowane, żaden numer nie został odzyskany.
- **Warstwa startowa: 69,6 → 63,3 KB** przy budżecie 80 KB. Pozycja `zasady` **11,8 → 4,8 KB**
  (próg 30 KB), czyli sekcja czytana przy każdym starcie sesji schudła o 60%.

**Zweryfikowane — jak dokładnie:**

- **Rotacja, faza 1:** suma kontrolna fragmentu w żywym pliku `b7307c8678b9d6b9`; ta sama suma
  policzona z treści **odczytanej z dysku** spod separatora `---` w pliku archiwum. Zgodne, więc
  faza 2 ruszyła. SHA-256, pierwsze 16 znaków, po normalizacji CRLF → LF (L-0033).
- **Żywy plik plus archiwum składają się w oryginał znak w znak.** Rekonstrukcja: żywy dziennik
  z linią-odsyłaczem podmienioną z powrotem na treść archiwum daje sumę `c50e554ef8861202` —
  identyczną z sumą pliku sprzed rotacji, przy 151 185 znakach. Kontrola, że instrument nie kłamie:
  zmiana **jednej litery** w rekonstrukcji daje inną sumę.
- **Blokada rotacji policzona z sekcji „Czeka na człowieka", nie z pojedynczych wpisów** (reguła
  1.6.0): 9 kotwic z otwartych pozycji, wszystkie trafiają w istniejące nagłówki wpisów — **zero
  martwych linków** (L-0013). Osiem wpisów oznaczonych jako nietykalne przez link, dziesięć jako
  najnowsze.
- **Kompresja nie zgubiła ani jednej zasady — dowód automatyczny:** instrument porównał zbiór
  numerów `L-NNNN` w starym destylacie (54 numery, wliczając sześć wyprowadzonych do
  `docs/PULAPKI.md`) ze zbiorem w nowym. **Zero zgubionych.** Pierwszy przebieg **zatrzymał się
  z błędem**, bo nowy destylat nie zawierał jeszcze linii zbiorczej o pułapkach — kontrola
  zadziałała, zanim cokolwiek zostało zapisane.
- **Treść zwiniętych wpisów jest nietknięta:** suma ciał wszystkich trzydziestu wpisów (bez linii
  nagłówkowych, bo w nich zmienia się status) przed i po przeniesieniu — `fff49c86c8df5741`
  w obu przypadkach.
- **Pomiar po obu operacjach:** warstwa startowa 63,3 KB / 80 KB, `zasady` 4,8 KB, `raport hooka`
  zwraca pustą tablicę (milczy). Sekcja „Zasady aktywne" ma **15 pozycji przy limicie 15** —
  pierwszy raz od 0.2.0. Dziennik 143,5 KB (próg 150), rejestr lekcji 40,1 KB / 30 wpisów
  (progi 50 KB / 40 wpisów) — oba pod progiem, więc kolejna rotacja nie rusza.
- **Instrument rotacji dwa razy podał nieprawdę, zanim podał prawdę** — obie pomyłki w generatorze
  kotwic nagłówków: zamiana pauzy `—` na myślnik zamiast usunięcia, a potem scalanie dwóch spacji
  w jeden myślnik. Każda z osobna dawała **zero trafień** w kotwice sekcji „Czeka na człowieka",
  czyli **wyciszała całą blokadę** i proponowała do archiwum dziesięć wpisów zamiast dwóch —
  w tym wpisy ze sprawami czekającymi na człowieka. Wyłapała to kontrola „kotwice bez wpisu",
  wypisana zanim cokolwiek zostało zapisane. Stąd L-0055.

**Świadomie odłożone:**

- **Pozycja `ryzyka` (36,8 KB przy progu 12 KB)** — największa w warstwie startowej, należy do E4.
  Rotacja jej nie dotyczy: sekcja „Stan otwartych ryzyk" nie jest wpisem i nigdy nie trafia do
  archiwum. Zejście z tej liczby to zadanie E4 (komórka „Mitygacja" jako stan bieżący,
  `docs/archiwum/ryzyka/`).
- **Kolejna rotacja dziennika** — ruszy sama, gdy plik wróci ponad 150 KB. Zakres będzie wtedy
  zależał od tego, ile spraw z sekcji „Czeka na człowieka" zostanie rozstrzygniętych.

**Do zrobienia przez człowieka:**

- —

### 2026-08-21 — E4: ryzyka, ustawienia i status planu jako stan bieżący, wersja 1.6.0

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- `SPEC_DZIENNIK.md`: komórka „Mitygacja" ma odtąd kształt **stan na dziś + odsyłacze** zamiast
  łańcucha „**data (etap):** …". Limit **800 znaków na komórkę** z komendą sprawdzającą; odsyłacz
  to data i etap **bez linku** — kotwica polskiego nagłówka waży ponad 100 znaków, czyli
  kilkanaście procent limitu, a wpisy stoją chronologicznie. Opisana kolejność przenoszenia
  zastanej narracji: sprawdź, czy wpis ją niesie → jeśli nie, przepisz do wpisu tej sesji →
  dopiero potem skracaj.
- `SPEC_ARCHIWUM.md`: nowe `docs/archiwum/ryzyka/`. Ryzyka `ZAMKNIĘTE` schodzą tą samą procedurą
  dwufazową co dziennik i lekcje. Rozstrzygnięte wprost: nazwa pliku z **datą rotacji**, nie
  zakresem numerów (zbiór bywa nieciągły, bo kryterium jest status, nie wiek); **jedna**
  linia-odsyłacz pod tabelą z wyliczeniem numerów; próg uruchomienia to próg cząstkowy `ryzyka`
  z budżetu startu, który mówi „czy jest co brać", a nie „kiedy się odezwać" — rotacja ryzyk nie
  dokłada ani jednego komunikatu (L-0049). Zdanie „sekcja ryzyk nie rotuje" zastąpione, nie obejściem.
- `SPEC_USTAWIENIA.md`: wiersz to **jedna decyzja, jednym zdaniem**; uzasadnienia i odrzucone
  warianty idą do `DECYZJE.md`. Trzy wiersze czytane maszynowo (`Profil projektu`,
  `Rotacja dokumentów`, `Budżet startu sesji`) mają jawnie zapisane wyłączenie z tej reguły — ich
  człony to składnia, nie proza, a skrócenie wyciszyłoby mechanizm.
- `SPEC_STATUS.md`: „Dziennik wdrożenia" to **jedna linia na etap**. Linia „E<N> rozpoczęty" scala
  się z linią zamknięcia i jest to jedyny nazwany wyjątek od append-only w tym pliku — ta linia
  jest znacznikiem stanu dla sesji przerwanej, nie zdarzeniem historycznym.
- **Dogfooding.** Sekcja ryzyk: sześć ryzyk `ZAMKNIĘTE` (R1, R3, R4, R6, R7, R8) przeniesione do
  `docs/archiwum/ryzyka/RYZYKA_2026-08-21.md`; cztery otwarte (R2, R5, P1, P2) przepisane na stan
  bieżący — najgrubsza komórka zeszła z 5586 do 698 znaków. `USTAWIENIA.md`: siedem wierszy
  przyciętych do decyzji, treść przeniesiona do D-61a/D-61b i do wpisu dziennika 2026-08-08.
  `STATUS.md` planu: dziennik wdrożenia z 22 linii do 7.
- **Wersja 1.6.0** w czterech miejscach: `core/MANIFEST.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, marker `Wersja RelAI`. Do tego trzy miejsca, które mówią
  o wersji człowiekowi: `CLAUDE.md`, `README.md`, `adapters/cursor/README.md`.
- `docs/KOMENDY.md`: jedna linia o tym, że zamknięte ryzyka schodzą do archiwum.
- **Warstwa nośna reguły** (zasada 8): rotacja ryzyk dopisana do rytuału zamknięcia w skillu
  `relai-core` i do reguły `relai-core.mdc` adaptera Cursora — reguła żyjąca wyłącznie
  w specyfikacji nie wykonuje się sama.
- **Poza pierwotnym zakresem, za zgodą użytkownika:** naprawiony defekt CRLF w
  `core/process/session-signals.js` — patrz „Zweryfikowane".

**Zweryfikowane — jak dokładnie:**

- **Pomiar przed i po w jednym przebiegu** (L-0040), stan „przed" z `git worktree` na HEAD (P-006):
  pozycja `ryzyka` **28,5 → 10,5 KB przy progu 12 KB**, suma warstwy startowej **55,7 → 34,7 KB**
  przy budżecie 80 KB. `startCostReport` zwraca pustą tablicę — raport milczy, tak jak przed etapem.
  Uwaga do liczby „przed": worktree wypisuje pliki z CRLF, więc zawiera ~1,7 KB znaków CR; pomiar
  tego samego stanu na LF dał 28,4 KB.
- **Ta sama pozycja po dopisaniu tego wpisu: 14,1 KB, czyli 2,1 KB ponad progiem** — i to nie jest
  regres, tylko konstrukcja pomiaru. Pozycja `ryzyka` obejmuje trzy rzeczy: **sekcję ryzyk 3,7 KB**
  (przed etapem 21,4 KB), sekcję „Czeka na człowieka" 2,5 KB i **ostatni wpis dziennika 7,9 KB** —
  a ostatnim wpisem jest ten. Etap, którego zakresem jest odchudzanie, zamyka się grubym wpisem
  z dowodami i chwilowo sam przekracza próg; następny wpis, o zwykłej wielkości, sprowadzi pozycję
  poniżej 12 KB bez niczyjej pracy. Suma warstwy startowej **39,4 KB / 80 KB** — mieści się,
  raport milczy.
- **Defekt rdzenia znaleziony przy tym pomiarze i naprawiony.** Wzorzec `/^(#{1,6})\s+(.*)$/`
  w `wytnijSekcje` nie dopasowywał **żadnego** nagłówka przy końcach linii CRLF, bo kropka w JS nie
  obejmuje `\r`, a `$` bez flagi `m` wymaga końca stringa; wzorzec wykrywający koniec sekcji `$` nie
  ma, więc mechanizm nie padał, tylko po cichu mierzył **cały plik**. Skutek na worktree tego repo:
  213,8 KB zamiast 55,7 KB, dwie pozycje naraz (`ryzyka`, `zasady`). Dowód poprawki: ten sam
  projekt próbny w dwóch wariantach końca linii, jeden przebieg — `bezSekcji` puste w obu, różnica
  13 B równa liczbie linii sekcji. Kontrola negatywna: projekt z celowo zmienionym nagłówkiem nadal
  raportuje `bezSekcji: ["ryzyka"]`, więc instrument nie jest ślepo pozytywny.
- **Nic nie zginęło:** suma kontrolna przeniesionej treści zgodna w obu fazach
  (`4b370c3e2b31c6ba`); każdy z sześciu wierszy archiwum występuje w `HEAD` **znak w znak**;
  numery z żywej tabeli plus numery z archiwum dają komplet z `HEAD`
  (`R1,R2,R3,R4,R5,R6,R7,P1,P2,R8`).
- **Numery nieodzyskane — dowód negatywny:** żaden z sześciu zarchiwizowanych numerów nie występuje
  w żywej tabeli jako wiersz, a wszystkie sześć jest widocznych w linii-odsyłaczu (6/6).
- **Wiersze czytane maszynowo działają dalej — dowód negatywny na wszystkich trzech:** `startCost`
  zwraca ten sam budżet (81920 B) i te same progi przed i po; `startCost().rotacja` = `true` przed
  i po; wiersz `Profil projektu` daje ten sam werdykt co przed etapem — wartość spoza zamkniętej
  listy, więc hooki profilu milczą, i milczały tak samo wcześniej.
- **Wersja:** `node core/tools/validate-adapters.js` → kod **0**, „3 zrodel, wartosc 1.6.0"; marker
  w `docs/USTAWIENIA.md` to 1.6.0. `grep -rn "1\.5\.2"` — wszystkie pozostałe trafienia rozstrzygnięte
  jako historyczne: wpisy dziennika, lekcja L-0055, zamrożony `PLAN.html` (D-33), prompty etapowe
  E1–E4, `PROMPT_ODNOGA.md` odnogi GUARD_PO_SCIEZCE oraz zdania „do 1.5.2 / od 1.5.2" w pięciu
  specyfikacjach, opisujące poprzednią wersję reguły.
- **Rotacja ryzyk ma jeden wyzwalacz — dowód negatywny:** projekt próbny z budżetem 10 KB, ryzykiem
  zamkniętym na 14 KB i przekroczoną sumą dostaje **jeden** raport (4 linie, limit 6) z jedną
  wzmianką o rotacji. Rotacja ryzyk nie dokłada drugiego komunikatu.
- **Limit komórki:** komenda ze specyfikacji, uruchomiona dosłownie, zwraca `0 komorek ponad
  limitem 800`. Najgrubsza komórka po etapie: R5, 698 znaków.
- **Cztery zmienione specyfikacje kończą się kompletnym przykładem** obejmującym nowy kształt
  (L-0001) — sprawdzone skryptem na markerach: nowa komórka i linia-odsyłacz w `SPEC_DZIENNIK`,
  pełny plik archiwum ryzyk plus żywa tabela w `SPEC_ARCHIWUM`, wiersz z odsyłaczem `D-58`
  w `SPEC_USTAWIENIA`, dziennik wdrożenia z jedną linią na etap w `SPEC_STATUS`.
- **Nie sprawdzono:** rotacja ryzyk nie została wykonana przez świeżą sesję z rytuału zamknięcia —
  w tym etapie wykonał ją skrypt prowadzony ręcznie, według tej samej procedury dwufazowej.
  Zachowanie mechanizmu w świeżej sesji czeka w odnodze `POMIAR_ODNOG`, razem z pozostałymi
  scenariuszami.
- **Komunikaty hooków:** w tym etapie nie powstał żaden nowy komunikat hooka. Trafienia
  `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` w `session-signals.js` to wyłącznie wzorce dopasowania
  i komentarze, nie treść komunikatów.

**Świadomie odłożone:**

- **Wykonanie sekwencji wydania 1.6.0** (push → `plugin marketplace update` → `plugin update` →
  restart). Zakres etapu mówi wprost, że to bramka człowieka; repozytorium jest gotowe.
- **`komorkaDecyzji` w rdzeniu dzieli komórki naiwnym `split('|')`** — ten sam defekt, co
  w L-0056. Dziś nie szkodzi, bo w wierszach czytanych maszynowo nie ma escapowanych separatorów,
  a wartość i tak jest kotwiczona od początku komórki. Nie ruszam poza zakresem; do rozstrzygnięcia
  przy najbliższej pracy nad rdzeniem.
- **Numer `PROMPT_ODNOGA.md` odnogi GUARD_PO_SCIEZCE zostaje na 1.5.2** — prompty są zamrożone
  w chwili wygenerowania, tak samo jak prompty etapowe. Sesja wykonująca odnogę zobaczy realny
  stan repozytorium, nie ten opis.

**Do zrobienia przez człowieka:**

- Sekwencja wydania 1.6.0 — bez niej poprawki tego etapu, łącznie z naprawą CRLF, nie działają
  w żadnym innym projekcie. *(rozstrzygnięte 2026-08-21 — sekwencja wykonana w całości, restart
  potwierdzony pomiarem: cache pluginu 1.6.0, kopia specyfikacji odświeżona, raport budżetu milczy)*

### 2026-08-21 — Wydanie 1.6.0: push i aktualizacja pluginu, zostaje restart

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- Commit `9ac3d78` z całością E4 (21 plików) wypchnięty na `main`.
- `claude plugin marketplace update relai` — cache marketplace odświeżony.
- `claude plugin update relai@relai` — plugin podniesiony z 1.5.2 do 1.6.0 w scope `user`.

**Zweryfikowane — jak dokładnie:**

- **Wersja potwierdzona plikiem instalacji, nie komunikatem CLI** (zasada 10):
  `~/.claude/plugins/installed_plugins.json` → `plugins."relai@relai"` ma `version 1.6.0`,
  `installPath` na katalogu `…\cache\relai\relai\1.6.0`, `gitCommitSha 9ac3d78` — ten sam commit,
  który przed chwilą poszedł na zdalne. `lastUpdated 2026-08-21T06:58:39Z`.
- **Pierwsza próba aktualizacji nie przeszła:** `claude plugin update relai` zwróciło
  `Plugin "relai" not found`. Nazwą rozpoznawaną jest **`relai@relai`** (nazwa pluginu plus
  marketplace), widoczna w `claude plugin list`. Sama nazwa pluginu nie wystarcza, mimo że
  `plugin marketplace update relai` przyjmuje ją bez zastrzeżeń.
- **Zastana wersja była inna, niż mówiły dokumenty.** `claude plugin list` pokazał 1.5.2, podczas
  gdy `docs/STATE.md` twierdził, że globalnie stoi 1.1.0. Liczba w STATE była nieaktualna od
  wydania 1.5.2 (2026-08-17, sekwencja wykonana przez człowieka i odnotowana we wpisie z 2026-08-18,
  ale bez poprawienia STATE). Poprawione.
- **Ostrzeżenia gita przy commicie potwierdziły defekt naprawiony w E4:** 21 razy „LF will be
  replaced by CRLF the next time Git touches it". To repozytorium ma `core.autocrlf` włączone, więc
  każdy jego checkout niesie CRLF — a pomiar warstwy startowej do wczoraj takiego pliku nie umiał
  policzyć i po cichu mierzył całość.
- **Nie sprawdzono:** czy aplikacja realnie wczytuje 1.6.0 — wymaga restartu (P-005). Do tego czasu
  ta sesja pracuje na kodzie 1.5.2, łącznie z hookiem mierzącym start.

**Świadomie odłożone:**

- Weryfikacja wczytania nowego układu katalogów pluginu w aplikacji — wraca w pierwszej sesji po
  restarcie, razem z potwierdzeniem bramki wydania.

**Do zrobienia przez człowieka:**

- **Restart aplikacji**, a po nim jedno spojrzenie na start sesji: czy hook budżetu milczy (powinien
  — 41,4 KB przy budżecie 80 KB) i czy komendy oraz skille wczytują się z nowego układu katalogów.
  Dopiero to zamyka bramkę wydania i odblokowuje E5.
  *(rozstrzygnięte 2026-08-21 — restart wykonany, oba warunki sprawdzone; patrz wpis „Restart
  potwierdzony")*

### 2026-08-21 — Restart potwierdzony: 1.6.0 działa, bramka wydania zamknięta

Autor: RelAI (Opus) + Lukasz

**Zrobione:**

- Zamknięta bramka manualna „Sekwencja wydania 1.6.0" w `STATUS.md` planu — czwarty krok (restart)
  wykonany przez człowieka, całość potwierdzona pomiarem.
- Pozycja o restarcie usunięta z sekcji „Czeka na człowieka"; adnotacje o rozstrzygnięciu dopisane
  przy obu pozycjach źródłowych we wpisach z tego dnia.
- `docs/STATE.md`: wersja zainstalowana i wydanie przeniesione z „co blokuje" do „co działa";
  E5 opisany jako odblokowany, z kolejnością projektów.

**Zweryfikowane — jak dokładnie:**

- **Kopia specyfikacji w projekcie odświeżona przez hook nowej wersji** — 22 pliki `.md`
  w `.claude/relai/templates/` mają sumy kontrolne **zgodne co do bajta** z `core/templates/`
  (normalizacja CRLF → LF). To jest dowód mocny, bo na starcie pracy nad E4 sześć z dziewięciu
  sprawdzanych plików **różniło się** — cache pochodził wtedy z wersji 1.1.0. Hook startu tej sesji
  zameldował 31 plików zamiast wcześniejszych 30.
- **Nowy układ katalogów wczytany** — `…\.claude\plugins\cache\relai\relai\1.6.0` zawiera
  `adapters/claude-code/skills` (2), `commands` (10), `hooks` (11) i `core/templates` (23);
  `core/MANIFEST.json` w cache'u ma `version 1.6.0`. To domyka pozycję, która od 2026-08-17 czekała
  w „Co blokuje" jako „realne wczytanie potwierdzi dopiero pierwsza sesja po restarcie".
- **Raport budżetu milczy, zgodnie z regułą** — `startCostReport` zwraca pustą tablicę przy warstwie
  **35,7 KB / 80 KB** i **zerowej** liczbie pozycji ponad własnym progiem. Pozycja `ryzyka` zeszła
  z 14,1 KB do **8,7 KB**, dokładnie tak, jak zapowiedziano we wpisie E4: przestała nią być treść
  grubego wpisu zamykającego etap.
- **Nie sprawdzono:** zachowania hooka i rotacji w sesji nieinteraktywnej po tej aktualizacji —
  wymaga `claude -p`, a to czeka na `claude /login` (L-0032, odnoga `POMIAR_ODNOG`).

**Świadomie odłożone:**

- Kasowanie siedemnastu starych katalogów w cache'u pluginu (`0.1.0` … `1.5.2`). Zajmują miejsce,
  ale niczego nie psują, a kasowanie cudzego cache'u nie jest pracą tego projektu.

**Do zrobienia przez człowieka:**

- —
