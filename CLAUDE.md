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
7. Aktywny plan — linia niżej w sekcji „Stan prac"; obecnie: **REKOMENDACJA_MODELU** (zaakceptowany 2026-09-03, Aneksy A–C; E1–E3 `ZREALIZOWANE`, E4 `GOTOWY DO STARTU` — ostatni etap planu, bramka numeru wydania nadal `OTWARTA`).

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
| Plugin RelAI — wydany, dwa adaptery | DZIAŁA (1.8.1 w repo) | [docs/STATE.md](docs/STATE.md) |
| Plan BUDOWA_RELAI — 10 etapów | ZAMKNIĘTY 2026-08-10 | [archiwum planu](docs/archiwum/plany/BUDOWA_RELAI/STATUS.md) |
| Plan ROZWOJ_PO_WYDANIU — 8 etapów | 6/8; **ZAMROŻONY 2026-08-21** (E7 czeka na dostęp do Codeksa) | [STATUS](docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md) |
| Plan OPTYMALIZACJA_KONTEKSTU — 5 etapów | ZREALIZOWANY 2026-08-21 | [archiwum planu](docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md) |
| Plan HIGIENA_DOKUMENTOW — 6 etapów | **ZREALIZOWANY 2026-09-01** (Aneksy A–D) | [archiwum planu](docs/archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) |
| Plan SPRZATANIE_ARTEFAKTOW — 4 etapy | **ZREALIZOWANY 2026-09-03** (4/4, wydanie 1.8.0) | [archiwum planu](docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md) |
| Plan REKOMENDACJA_MODELU — 4 etapy | **3/4** (E3 zamknięty 2026-09-04, Aneksy A–C); E4 gotowy — ostatni | [STATUS](docs/plany/REKOMENDACJA_MODELU/STATUS.md) |
| Odnogi i wątki samodzielne | 1 otwarta (`OPIS_REPO`); GUARD_PO_SCIEZCE zamknięta, REKOMENDACJA_MODELU przeniesiona do planu — obie 2026-09-03 | [docs/STATE.md](docs/STATE.md) |

Aktywny plan: [REKOMENDACJA_MODELU](docs/plany/REKOMENDACJA_MODELU/STATUS.md)

## Reguły procesu

- Plan zamrożony po akceptacji; zmiany wyłącznie datowanymi aneksami. Odchylenie fundamentalne → propozycja nowego planu z linkiem do starego.
- Wykonanie etapów: świeże sesje **Opus** (D-85) wg `PROMPT_ETAP_N.md`. Architektura i plany: model najsilniejszy (Fable). Na starcie etapu sprawdź model sesji — jeśli inny niż Opus, przerwij i poproś o zmianę.
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
