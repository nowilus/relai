# STATUS — plan HIGIENA_DOKUMENTOW

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-01 · Status planu: **ZAAKCEPTOWANY 2026-09-01
(Aneksy A, B)** · Model wykonawczy etapów: Opus (D-85)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Rotacja rusza | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wchłonął odnogę [BLOKADA_ROTACJI](../../fixy/BLOKADA_ROTACJI/ODNOGA.md); zakres rotacji PolyFlow 0 → 117 wpisów ze 127 |
| E2 | Blokada mówi i próg nie kłamie | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | komunikat wypisuje blokery; próg liczony ponad nietykalnymi; `session-signals.js` bez zmian — rozstrzygnięte w zakresie |
| E3 | Sprawa przeterminowana wymusza decyzję | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `N = 30 dni`, wyłącznik osobny od rotacji (Aneks A); materiał pomiarowy inny, niż zakładał prompt — 1 pozycja zamiast 9 |
| E4 | Raport startu jako adres progów | **ZREALIZOWANY 2026-09-01** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | drugi wyzwalacz raportu, progi sekcji, katalog progów w `SPEC_USTAWIENIA.md`; limit „Zasad aktywnych" nietknięty |
| E5 | Ryzyka i ustawienia schodzą do archiwum | **GOTOWY DO STARTU** | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | |
| E6 | Pomiar na realnych projektach i wydanie | OCZEKUJE | — | wydanie 1.7.0, sekwencja P-005 obowiązuje |

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
