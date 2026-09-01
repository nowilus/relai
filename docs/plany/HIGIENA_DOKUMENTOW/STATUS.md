# STATUS — plan HIGIENA_DOKUMENTOW

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-01 · Status planu: **ZAAKCEPTOWANY 2026-09-01
(Aneksy A, B, C, D)** · Model wykonawczy etapów: Opus (D-85)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Rotacja rusza | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wchłonął odnogę [BLOKADA_ROTACJI](../../fixy/BLOKADA_ROTACJI/ODNOGA.md); zakres rotacji PolyFlow 0 → 117 wpisów ze 127 |
| E2 | Blokada mówi i próg nie kłamie | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | komunikat wypisuje blokery; próg liczony ponad nietykalnymi; `session-signals.js` bez zmian — rozstrzygnięte w zakresie |
| E3 | Sprawa przeterminowana wymusza decyzję | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `N = 30 dni`, wyłącznik osobny od rotacji (Aneks A); materiał pomiarowy inny, niż zakładał prompt — 1 pozycja zamiast 9 |
| E4 | Raport startu jako adres progów | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | drugi wyzwalacz raportu, progi sekcji, katalog progów w `SPEC_USTAWIENIA.md`; limit „Zasad aktywnych" nietknięty |
| E5 | Ryzyka i ustawienia schodzą do archiwum | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | Aneks C — kryterium „sekcja ryzyk PolyFlow pod 12 KB" nieosiągalne arytmetycznie; zamienione na dowód działania mechanizmu |
| E6 | Pomiar na realnych projektach i wydanie | **W TOKU** | [PROMPT_ETAP_6.md](PROMPT_ETAP_6.md) | wydanie 1.7.0, sekwencja P-005 obowiązuje; **ostatni etap planu** — rytuał kończy się sekwencją zamknięcia planu (D-36) |

## Odnogi

- **BLOKADA_ROTACJI** — link pozycji blokuje rotację najstarszego wpisu, a pomiar bierze zły wpis ·
  etap-źródło: E1 · [karta](../../fixy/BLOKADA_ROTACJI/ODNOGA.md) ·
  **PRZENIESIONA 2026-09-01 → wchłonięta przez E1**
- **REJESTR_ARTEFAKTOW** — profil `prompty` wymaga `docs/ARTEFAKTY.md`, a rejestru nie ma ·
  etap-źródło: E1 · [karta](odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md) · **ZAMKNIĘTA 2026-09-01** —
  `docs/ARTEFAKTY.md` z 38 pozycjami; hook `profile-rules` milczy na wszystkich 39 sprawdzonych
  ścieżkach (bez rejestru: 33 ostrzeżenia)

## Bramki manualne

- **Wartość `N` dla przeglądu spraw człowieka i zachowanie przy wyłączonej rotacji** · źródło: wpis
  dziennika 2026-09-01 · ROZSTRZYGNIĘTA 2026-09-01 — `N = 30 dni`, przegląd działa także przy
  wyłączonej rotacji; zapisane jako Aneks A do planu
- **Akceptacja planu HIGIENA_DOKUMENTOW** · źródło: wpis dziennika 2026-09-01 ·
  ROZSTRZYGNIĘTA 2026-09-01 — plan zaakceptowany z Aneksem A, sekcje 1–9 zamrożone
- **Kryterium sukcesu E5 nieosiągalne na wskazanym materiale** · źródło: wpis dziennika 2026-09-01
  (E5) · ROZSTRZYGNIĘTA 2026-09-01 — wybrany wariant „Aneks C": kryterium zamienione na dowód
  działania mechanizmu; zakres prac E5 bez zmian

## Dziennik wdrożenia

- 2026-09-01 — plan utworzony na podstawie zgłoszenia z sesji roboczej PolyFlow, przekazany do akceptacji.
- 2026-09-01 — plan **ZAAKCEPTOWANY** z Aneksem A (`N = 30 dni`, wyłącznik przeglądu osobny od rotacji).
  Wygenerowano PROMPT_ETAP_1; E1 gotowy do startu.
- 2026-09-01 — **Aneks B**: zakres E4 rozszerzony o progi sekcji i jawny katalog progów; powód wyszedł
  z rotacji `LEKCJE.md` w rytuale zamknięcia sesji.
- 2026-09-01 — E1 rozpoczęty.
- 2026-09-01 — **E1 ZREALIZOWANY**: link pozycji wskazuje najnowsze wystąpienie, nietykalność wpisu
  linkowanego zastąpiona przepięciem linku w fazie 2, `ostatniWpis` czyta kierunek z dat; zakres
  rotacji PolyFlow **0 → 117 wpisów ze 127**. Wygenerowano PROMPT_ETAP_2; E2 gotowy do startu.
- 2026-09-01 — E2 rozpoczęty.
- 2026-09-01 — **E2 ZREALIZOWANY**: próg liczony ponad nietykalnymi (waga całkowita = część
  rotowalna + dolna granica osiągalna), komunikat zablokowanej rotacji wypisuje pary
  „pozycja → wpis" z wiekiem i liczbą przepuszczanych wpisów; stary komunikat milczał przy rotacji
  biorącej **2 z 87** wpisów PolyFlow. `session-signals.js` bez zmian — komunikat pisze model
  w rytuale zamknięcia. Wygenerowano PROMPT_ETAP_3; E3 gotowy do startu.
- 2026-09-01 — E3 rozpoczęty.
- 2026-09-01 — **E3 ZREALIZOWANY**: wiersz `Przegląd spraw człowieka` (`włączony · 30 dni`,
  wyłącznik osobny od rotacji), wykrycie `sprawyPrzeterminowane` w `session-signals.js` wołane
  przez oba hooki startu, nośnik w `CLAUDE.md`, procedura pytania partiami po cztery w obu
  adapterach, adnotacja odroczenia z licznikiem w `SPEC_DZIENNIK.md`. Zmierzone na trzech plikach
  w obu wariantach końca linii: PolyFlow **25 spraw otwartych, 0 przeterminowanych przy N=30**
  (najstarsza 16 dni), ten sam plik przy dacie 2026-10-15 — **25 z 25**. Wygenerowano
  PROMPT_ETAP_4; E4 gotowy do startu.
- 2026-09-01 — E4 rozpoczęty.
- 2026-09-01 — **E4 ZREALIZOWANY**: `startCostReport` ma drugi wyzwalacz (dokument albo sekcja ponad
  własnym progiem), osobną linię `[RelAI progi dokumentow]` z nazwą procedury, a `SPEC_USTAWIENIA.md`
  — sekcję „Katalog progów" (17 wierszy, kolumna „Adres egzekwowania", dwa progi bez automatu
  wypisane wprost). Część dokumentów ma wyłącznik rotacji, nie budżetu. Zmierzone: dziennik
  154,5 KB → raport, 31,2 KB → zero znaków; `LEKCJE.md` z `ea33e1c` (52 260 B, sekcja 35 787 B) →
  plik i sekcja z procedurami, identycznie dla LF i CRLF; pełny zestaw przekroczeń → **5 linii**
  przy limicie 6; to repozytorium → **0 linii** z obu hooków. Wygenerowano PROMPT_ETAP_5;
  E5 gotowy do startu.
- 2026-09-01 — E5 rozpoczęty.
- 2026-09-01 — **Aneks C**: kryterium E5 „sekcja ryzyk PolyFlow schodzi pod 12 KB" zamienione na
  dowód działania mechanizmu. Powód zmierzony przed implementacją: sekcja `9fcf433` ma
  **39 548 B, 62 ryzyka, 0 `ZAMKNIĘTYCH`**, jedną komórkę ponad 800 znaków (i tę o statusie
  `OTWARTE`), a cała kolumna „Mitygacja" waży 22 032 B — próg jest nieosiągalny mechanizmem
  z zakresu etapu. Zakres prac bez zmian.
- 2026-09-01 — **E5 ZREALIZOWANY**: kompresja komórki „Mitygacja" (trzy warunki w koniunkcji,
  zamknięta lista statusów czytana **od początku komórki**, dosłowny cytat zamiast parafrazy)
  i rotacja `docs/USTAWIENIA.md` z pięcioma wierszami nietykalnymi z nazwy; obie przez tę samą
  procedurę dwufazową, obie bez własnego komunikatu. Katalog progów: **17 wierszy, 15 z adresem,
  1 bez automatu** (było 2). Zmierzone na dzienniku PolyFlow `396e243^`: sekcja ryzyk
  **57 136 → 49 137 B**, 7 komórek z 15 ponad limitem, **52 wiersze przed i po**, 7 z 7 cytatów
  dosłownie w archiwum; ustawienia PolyFlow **30 068 → 25 552 B**, 5 wierszy maszynowych
  zostało, `startCost` i `sprawyPrzeterminowane` bez zmiany. Rozjazd sum zatrzymuje obie
  procedury. To repozytorium: **0 zmian, 0 znaków**. Wygenerowano PROMPT_ETAP_6; E6 gotowy do
  startu i jest ostatnim etapem planu.
- 2026-09-01 — E6 rozpoczęty.
- 2026-09-01 — **Aneks D**: zakres E6 rozszerzony o poprawkę wzorca `ASSIGN_RE`
  w `core/guardrails/secret-scan.js`. Powód wyszedł przy commicie wydania: guardrail zatrzymał
  zdanie specyfikacji **opisujące ten sam guardrail** (`PASSWORD=` / `SECRET=` w kodzie liniowym
  Markdown), bo klasa wartości nie wykluczała backticka. Zasada aktywna 12 zabrania obejścia
  przez `--no-verify`, a bez commita nie ma sekwencji wydania. Zakres pozostałych punktów E6
  bez zmian.
