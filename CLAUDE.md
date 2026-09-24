# RelAI — budowa pluginu (projekt dogfoodingowy)

Ten folder to repo pluginu **RelAI** („Twój projekt pamięta wszystko") — frameworka dokumentacyjno-procesowego dla Claude Code. Projekt prowadzi się według zasad, które sam buduje. Trzymaj ten plik krótkim — szczegóły są w `docs/`.

## Rytuał startu sesji

Czytaj w kolejności, nie skanuj pełnotekstowo repo:
1. Ten plik.
2. [docs/STATE.md](docs/STATE.md) — stan na dziś, cały plik; jest krótki.
3. [docs/DZIENNIK.md](docs/DZIENNIK.md) — sekcja „Stan otwartych ryzyk" + ostatni wpis.
4. [docs/LEKCJE.md](docs/LEKCJE.md) — wyłącznie sekcja „Zasady aktywne".
5. [docs/DECYZJE.md](docs/DECYZJE.md) — decyzje zamrożone: **nie proponuj ich ponownie**.
6. [docs/USTAWIENIA.md](docs/USTAWIENIA.md) — preferencje projektu.
7. Aktywny plan — linia „Aktywny plan" pod tabelą „Stan prac"; plany zamknięte mają tam status i link do archiwum.

**Frazy sesji:** „kontynuujemy pracę" → rytuał startu, akapit „gdzie jesteśmy" **i jedno zdanie
z propozycją najbliższego kroku**; „sprawdź status" → stan, plany, ryzyka, zaległości
dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
sprzątanie artefaktów roboczych, propozycja commita. Pełna ściąga: [docs/KOMENDY.md](docs/KOMENDY.md).

**Sprawa przeterminowana:** pozycja sekcji „Czeka na człowieka" starsza niż `N` dni (wiersz
`Przegląd spraw człowieka` w [docs/USTAWIENIA.md](docs/USTAWIENIA.md), domyślnie 30) wymusza
decyzję **przed** akapitem „gdzie jesteśmy": pytasz partiami po cztery — zamknąć / odroczyć
o kolejne `N` dni / rozstrzygnąć teraz. Sesja nieinteraktywna: sam raport, bez pytań.

## Stan prac

| Co | Status | Gdzie |
|---|---|---|
| Plugin RelAI — wydany, trzy adaptery | DZIAŁA (2.3.1 w repo i publicznie, wydane 2026-09-24) | [docs/STATE.md](docs/STATE.md) |
| Plan BUDOWA_RELAI — 10 etapów | ZAMKNIĘTY 2026-08-10 | [archiwum planu](docs/archiwum/plany/BUDOWA_RELAI/STATUS.md) |
| Plan ROZWOJ_PO_WYDANIU — 8 etapów | **ZREALIZOWANY 2026-09-05**; wydania 1.10.0 i 2.0.0 opublikowane | [archiwum planu](docs/archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md) |
| Plan OPTYMALIZACJA_KONTEKSTU — 5 etapów | ZREALIZOWANY 2026-08-21 | [archiwum planu](docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md) |
| Plan HIGIENA_DOKUMENTOW — 6 etapów | **ZREALIZOWANY 2026-09-01** (Aneksy A–D) | [archiwum planu](docs/archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) |
| Plan SPRZATANIE_ARTEFAKTOW — 4 etapy | **ZREALIZOWANY 2026-09-03** (4/4, wydanie 1.8.0) | [archiwum planu](docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md) |
| Plan REKOMENDACJA_MODELU — 4 etapy | **ZREALIZOWANY 2026-09-04** (4/4, Aneksy A–D, wydanie 1.9.0) | [archiwum planu](docs/archiwum/plany/REKOMENDACJA_MODELU/STATUS.md) |
| Plan PIERWSI_UZYTKOWNICY — 3 etapy | **CZĘŚCIOWO ZREALIZOWANY 2026-09-24** (E1 i E2 zrealizowane, E3 pominięty — pilotaż nie wystartował) | [archiwum planu](docs/archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md) |
| Plan PROWADZENIE_END_TO_END — 7 etapów | **ZAAKCEPTOWANY 2026-09-24** (E1 gotowy do startu; rejestr 56 ustaleń) | [status planu](docs/plany/PROWADZENIE_END_TO_END/STATUS.md) |
| Plan OPTYMALIZATOR_PROMPTOW — 5 etapów | **ZREALIZOWANY 2026-09-15** (5/5, Aneksy A i B, wydanie 2.2.0) | [archiwum planu](docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md) |
| Odnogi i wątki samodzielne | 1 otwarta (`OPIS_REPO`, od 2026-09-24 wątek samodzielny w `docs/fixy/`); `ORKIESTRACJA` zamknięta 2026-09-06 (2.1.0 w repo), `PRECOMMIT_ESM` 2026-09-04 wydaniem 1.9.2, `CURSOR_1_9_1` tego samego dnia | [docs/STATE.md](docs/STATE.md) |

Aktywny plan: [PROWADZENIE_END_TO_END](docs/plany/PROWADZENIE_END_TO_END/STATUS.md) — **ZAAKCEPTOWANY 2026-09-24**, E1 gotowy do startu (`/relai-stage` w świeżej sesji Opus 5.5).

## Reguły procesu

- Plan zamrożony po akceptacji; zmiany wyłącznie datowanymi aneksami. Odchylenie fundamentalne → propozycja nowego planu z linkiem do starego.
- Wykonanie etapów: świeże sesje **Opus** (D-85) wg `PROMPT_ETAP_N.md`; wyjątek E7 z 2026-09-05:
  **`gpt-5.6-terra/high` w Codeksie**. Architektura i plany: model najsilniejszy (Fable). Na
  starcie etapu sprawdź model wskazany w prompcie — rozjazd zatrzymuje pracę przed zapisem.
- Każdy etap kończy się rytuałem „Na koniec": aktualizacja STATUS → wpis do DZIENNIKA → wygenerowanie promptu następnego etapu. Zadanie bez tego rytuału NIE jest ukończone.
- Wątek spoza zakresu etapu → zatrzymaj się i zapytaj: odnoga (`/relai-branch`), aneks do planu czy
  „świadomie odłożone" do dziennika. Nigdy „przy okazji".
- Dokumentacja po polsku, kod i identyfikatory po angielsku, commity conventional po angielsku.
- Sekrety nigdy w plikach śledzonych; klucze wyłącznie w `.env` (gitignored).
- Nieoczywiste zachowanie narzędzia, kolejność kroków, wymóg środowiska → [docs/PULAPKI.md](docs/PULAPKI.md); zajrzyj tam, zanim uznasz, że coś jest zepsute.

## Reguły profilu (prompty)

- Pierwszy artefakt (prompt, instrukcja, szablon) → powstaje rejestr `docs/ARTEFAKTY.md`.
- Każda zmiana artefaktu podbija jego wersję w rejestrze: co się zmieniło i po co.
- Poprzednia wersja zostaje: w historii gita albo jako datowana kopia w
  `docs/archiwum/artefakty/`. Nigdy ciche nadpisanie.
- Rejestr odpowiada na pytanie „po co", dziennik na pytanie „co się działo" — nie mieszasz ich.

## Implementation guidelines (sekcja niemutowalna)

- **Think before coding**: nie zakładaj — sprawdź; niejasność → pytanie, nie domysł.
- **Simplicity first**: najprostsze działające rozwiązanie; zero spekulacyjnej generyczności (YAGNI).
- **Surgical changes**: zmieniaj minimum konieczne; nie refaktoryzuj przy okazji.
- **Goal-driven**: każda zmiana mapuje się na cel etapu; poza zakresem → do DZIENNIKA jako „świadomie odłożone".
