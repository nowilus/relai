# Aneks A — wykonanie etapów E9–E13 w Codeksie, Claude jako orkiestrator

Plan: [OPTYMALIZACJA_PO_AUDYCIE](STATUS.md) · Data: 2026-11-10 · Status aneksu: **ZAAKCEPTOWANY 2026-11-10** („Akceptuję”) ·
Autor: RelAI (Opus 5.5) + Lukasz

Aneks zmienia **sposób wykonania** etapów, nie ich zakres: karty E9–E13, kolejność etapów, kryteria
Weryfikacji i jedno wydanie w E14 zostają bez zmian. Zmienia się model wykonawczy z linii
metrycznej `STATUS.md` („Opus 5.5 na effort medium, świeże sesje”) i decyzja D-85 (wykonawcą
etapów budowy jest Opus) — dla etapów E9–E13 tego planu.

## 1. Powód

Od 2026-11-10 Łukasz pracuje na subskrypcji Claude Pro (Team) zamiast Max — limit tygodnia nie
uniesie pięciu etapów wykonywanych na Opusie w świeżych sesjach (SZACUNEK: etap E1–E8 zużywał
jedną długą sesję Opus każdy). Praca wykonawcza (kod, testy, kopie zdań według kart) przechodzi
do Codeksa na tańszym modelu; Claude zostaje przy tym, co wymaga kontekstu planu: przygotowanie
zadania, recenzja, rytuał „Na koniec” i pytania do człowieka.

## 2. Rozstrzygnięcia z wywiadu (2026-11-10)

| Pytanie | Odpowiedź Łukasza |
|---|---|
| Kto uruchamia Codeksa | Claude, przez `codex exec` w tle; harness budzi Claude po zakończeniu procesu |
| Rola Claude po etapie | **recenzja + rytuał** — Codex robi kod i testy, Claude dziennik, `STATUS.md`, `STATE.md`, następny prompt i propozycję commita |
| Modele Codeksa | po odświeżeniu listy (`/relai-models` w Codeksie, robi Łukasz) — nazwy w sekcji 5 |
| E14 (CI, wydanie, publikacja) | **zostaje u Claude** — kroki zewnętrzne po osobnej zgodzie |

## 3. Warianty

| Wariant | Plusy | Minusy | Decyzja |
|---|---|---|---|
| **A. `crew.js run --runtime codex` z repozytorium, w tle** | mechanizm RelAI istnieje (preambuła roli, `--files` jako granica, kontrakt raportu `## Report` i `check`), poprawki E6 (bez zmiennych gospodarza — skaner sekretów Codeksa działa; prompt stdin-em; biała lista `--model`) | proces synchroniczny — anulowanie tylko przez przerwanie powłoki; brak wznawiania wątku Codeksa (każdy przebieg świeży) | **WYBRANY** |
| B. Kopia `.claude/relai/tools/crew.js` (zainstalowana 3.7.0) | wywołanie zgodne z komendą `/relai-crew` | **brak poprawek E6**: Codex uruchomiony z Claude Code dziedziczy zmienne gospodarza i jego skaner sekretów milknie (FAKT: `zmienneInnychGospodarzy` — 0 trafień w kopii, jest w `core/process/crew.js`) | odrzucony — bezpieczeństwo |
| C. Łukasz uruchamia Codeksa ręcznie, Claude tylko recenzuje | najmniej tokenów Claude | brak automatycznej bramki i nasłuchu; Łukasz przenosi wyniki ręcznie | odrzucony wywiadem |
| D. Codex robi też rytuał „Na koniec” | jeszcze mniej tokenów Claude | dokumenty rdzeniowe pisane innym stylem i bez kontekstu decyzji; zasada „rejestr odpowiada na po co” | odrzucony wywiadem |

## 4. Przepływ jednego etapu

```
 Claude                               Codex (w tle)                     Łukasz
 ──────                               ─────────────                     ──────
 1. /relai-stage → karta startu  ───────────────────────────────────▶  zgoda
 2. STATUS: W TOKU; plik zadania
    = PROMPT_ETAP_N + nakładka
 3. crew.js run (run_in_background) ─▶ czyta prompt, karty, pliki
                                      test najpierw → zmiana → testy
                                      ## Report (stały format)
 4. powiadomienie o końcu  ◀───────── koniec procesu
 5. bramka: raport, git diff --stat,
    testy i komendy Weryfikacji,
    diff wybiórczo
 6a. OK → rytuał „Na koniec” ───────────────────────────────────────▶  zgoda na commit
 6b. drobna usterka → poprawka Claude
 6c. poważna → zadanie poprawki  ───▶ model klasy strong, lista znalezisk
 6d. PYTANIE w raporcie  ───────────────────────────────────────────▶  odpowiedź → kolejny przebieg
```

### 4.1 Nakładka na prompt etapu (dopisywana przez Claude do pliku zadania)

- Jesteś wykonawcą etapu; orkiestratorem i recenzentem jest Claude w Claude Code, który po tobie
  uruchomi testy i przeczyta diff.
- Blockquote „Kontrola modelu” w prompcie etapu (Opus 5.5) jest zastąpiony tym aneksem: model
  wykonawcy to model, na którym działasz z pliku zadania — nie zatrzymujesz się z tego powodu.
- Wykonujesz sekcje „Co przeczytać”, „Zakres etapu” i „Weryfikacja” promptu. **Nie wykonujesz
  sekcji „Na koniec”**: nie zmieniasz `STATUS.md`, `docs/DZIENNIK.md`, `docs/STATE.md`,
  `docs/LEKCJE.md`, nie piszesz następnego promptu, **nie commitujesz**, nie robisz `git push`.
- Pytanie do człowieka z karty (AskUserQuestion w karcie) → wpisujesz je do raportu jako
  `PYTANIE:` z opcjami z karty i **kończysz przebieg** przed krokiem, który od odpowiedzi zależy.
- Kotwica karty nie pasuje, test „najpierw” zielony bez nazwanego wyjątku, test spoza listy
  czerwony → `STOP:` w raporcie z tym, czego szukałeś i co zastałeś; nie dopasowujesz.
- Raport `## Report` w stałym kształcie: karty `- [x]`/`- [ ]`; testy przed (czerwony z asercji)
  i po z dokładną komendą i liczbą; każdy punkt Weryfikacji z wynikiem; pliki zmienione;
  odchylenia i `PYTANIE:`/`STOP:`. Długość raportu: SZACUNEK do 80 linii — to jedyny tekst,
  który Claude czyta w całości.
- Polecenia bez `cd` (ścieżki w argumentach), teksty z backslashem i backtickiem tylko edycją
  pliku, komunikaty hooków ASCII — konwencje sekcja 6 obowiązują także w Codeksie.

### 4.2 Oszczędzanie tokenów Claude — wyzwalacze, nie odpytywanie

| Wyzwalacz | Co robi Claude | Czego nie robi |
|---|---|---|
| zgoda na kartę startu | składa plik zadania, uruchamia `crew.js run` w tle, kończy turę | nie czyta kart w całości drugi raz (zrobił to przy karcie startu) |
| powiadomienie harnessu o końcu procesu | czyta raport, `git diff --stat`, uruchamia testy w tle i Weryfikację | nie odpytuje procesu w trakcie, nie czyta wyjścia strumieniowego Codeksa |
| testy zielone, raport kompletny | czyta diff **logiki** (kod, testy) i próbkę kopii zdań; kopie sprawdza grepem z karty | nie czyta całego diffu dokumentów — kopie dowodzi grep i walidator |
| usterka ≤ SZACUNEK 3 edycje | poprawia sam | nie uruchamia Codeksa dla jednej linii |
| usterka większa albo `STOP:` z błędem kodu | zadanie poprawki: lista znalezisk `plik:linia — problem — oczekiwane`, model klasy strong | nie przepisuje sam całej karty |
| `PYTANIE:` | jedno AskUserQuestion do Łukasza, potem przebieg z odpowiedzią w zadaniu | nie zgaduje odpowiedzi |

## 5. Modele Codeksa

| Rola | Klasa | Model | Effort |
|---|---|---|---|
| Wykonawca etapu | balanced | **gpt-6.1-terra** (lista codex z dnia 2026-11-10) | high |
| Poprawka po recenzji (6c) | strong | **gpt-6.1-sol** (lista codex z dnia 2026-11-10; wybór Łukasza) | high |
| Orkiestrator, recenzja, rytuał | — | Opus 5.5 w Claude Code, `/effort medium` | medium |

Nazwy wpisujesz z odświeżonej listy `.claude/relai/MODELE-codex.md` razem z jej datą (zasada 7:
zamknięta lista; nazwy spoza listy nie przyjmujesz). Poziom effortu przekazywany do `codex exec`
— do sprawdzenia w pierwszym przebiegu E9 (biała lista flag `crew.js` przepuszcza `--model`;
effort może wymagać konfiguracji Codeksa) — wynik do wpisu dziennika E9.

## 6. Ryzyka

| # | Ryzyko | Poziom | Mitygacja |
|---|---|---|---|
| AX1 | Codex uruchomiony kopią 3.7.0 `crew.js` działa z wyciszonym skanerem sekretów | **wysoki** | wyłącznie `node core/process/crew.js` z repozytorium (poprawka E6); punkt w karcie startu każdego etapu E9–E13 |
| AX2 | Tańszy model pomija test „najpierw” albo osłabia test, żeby był zielony | **wysoki** | bramka: raport musi mieć przebieg czerwony z asercji (plik w katalogu roboczym); `git diff` testów czytany zawsze w całości; osłabienie = BLOCK i zadanie poprawki na modelu strong |
| AX3 | Codex dotyka plików spoza kart | średni | `--files` z pola „Pliki” kart jako granica w preambule; `git status --short` w bramce; plik spoza listy = odrzucenie zmiany w tym pliku |
| AX4 | Sandbox Codeksa na Windows nie uruchomi testów Node albo hooków | średni | pierwszy przebieg E9 jest pomiarem: brak przebiegu testów w raporcie → Claude uruchamia testy sam i zapisuje to w dzienniku; otwarta bramka K-D7 (Cursor) dotyczy innego narzędzia |
| AX5 | Recenzja zjada tyle tokenów, ile wykonanie | średni | tabela 4.2; recenzja na stanie testów i grepach, diff wybiórczo; licznik „ile przebiegów poprawki” w dzienniku — dwa w jednym etapie → rozmowa o modelu wykonawcy |
| AX6 | Codex commituje albo pisze dokumenty rytuału mimo nakładki | niski | `git log` i `git status` w bramce; commit Codeksa → `git reset --soft` po zgodzie Łukasza, dokumenty rytuału przywracane z HEAD |
| AX7 | Limit konta Codeksa wyczerpany w trakcie etapu | niski | etap zostaje `W TOKU`, raport częściowy w katalogu roboczym; zasada 5 („Cudze usługi”): wyczerpany limit zatrzymuje pracę, nie idzie do adnotacji |

## 7. Przypadki brzegowe — rozstrzygnięte

- **Karta z pytaniem do człowieka** (np. K-A4 w E8, K-D12 w E11): Codex staje na `PYTANIE:`,
  Claude pyta, drugi przebieg dostaje odpowiedź w pliku zadania; karty po pytaniu Codex robi
  w drugim przebiegu.
- **Hook `config-protection`** (edycja `CLAUDE.md`, `docs/USTAWIENIA.md` w K-B4, E11): w Codeksie
  hook Claude Code nie działa, więc zgody nie zapyta — te edycje Claude robi **sam** w bramce
  (lista w zadaniu: „pliki pod ochroną — zostaw, opisz w raporcie”).
- **Generator skilli Codeksa** (`node adapters/codex/generate-skills.js`): uruchamia Codex
  w ramach karty; Claude sprawdza `git status --short adapters/codex/skills`.
- **Mody (E12, E13)**: testy modów (`claude plugin test`) wymagają binarki Claude Code —
  uruchamia je Claude w bramce, nie Codex.
- **Rejestr `ARTEFAKTY.md`**: wpisy wersji robi Claude w rytuale (dokument „po co”).
- **Dwa przebiegi poprawki bez zielonej bramki**: etap zostaje `W TOKU`, Claude pyta Łukasza:
  dokończyć samemu na Opusie, zmienić model wykonawcy albo odłożyć.
- **E14**: bez zmian — wykonuje Claude (Opus 5.5), wydanie krok po kroku za zgodą.

## 8. Etapy wdrożenia aneksu

| Krok | Co | SZACUNEK |
|---|---|---|
| 1 | Akceptacja aneksu; nazwy modeli z odświeżonej listy do sekcji 5 | 5 min (Łukasz) |
| 2 | Wpis aneksu: sekcja „Aneksy” w `PLAN.html` (jedno zdanie + link do tego pliku), wiersz **D-85 → aneks** w `docs/DECYZJE.md`, adnotacja w linii metrycznej `STATUS.md`, wpis dziennika | 1 tura Claude |
| 3 | E9 jako pierwszy przebieg: pomiar effortu, testów w sandboxie i wielkości raportu; wynik do dziennika | 1 etap |
| 4 | E10–E13 tym samym przepływem; po E13 ocena: koszt tokenów Claude na etap, liczba przebiegów poprawki | 4 etapy |

## 9. Do rozstrzygnięcia przez człowieka

- ~~Nazwy modeli wykonawcy i poprawek (sekcja 5)~~ — rozstrzygnięte 2026-11-10: gpt-6.1-terra
  i gpt-6.1-sol z listy odświeżonej przez Łukasza w Codeksie.
- Czy `PROMPT_ETAP_9.md` (wygenerowany przed aneksem, kontrola modelu: Opus 5.5) zostaje bez
  zmian, a model wykonawczy niesie plik zadania z nakładką — **propozycja: tak** (nakładka
  z 4.1 zastępuje kontrolę modelu; prompty E10–E13 Claude generuje już z kontrolą modelu
  Codeksa i z odwołaniem do tego aneksu).
