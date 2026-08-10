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
7. Aktywny plan — linia niżej w sekcji „Stan prac"; obecnie: brak.

## Stan prac

| Co | Status | Gdzie |
|---|---|---|
| Analiza projektów historycznych | ZAKOŃCZONA | DZIENNIK, wpis 2026-08-07 |
| Wywiad architektoniczny (~90 decyzji) | ZAKOŃCZONY | docs/DECYZJE.md |
| Master plan budowy | **ZREALIZOWANY 2026-08-10** (Aneks A) | docs/archiwum/plany/BUDOWA_RELAI/PLAN.html |
| E1 — fundament pluginu (wersja 0.1.0) | **ZREALIZOWANY 2026-08-07** | `.claude-plugin/`, `skills/relai-core/`, `templates/` |
| E2 — rdzeń dokumentacyjny (wersja 0.2.0) | **ZREALIZOWANY 2026-08-07** | `skills/relai-core/SKILL.md`, `templates/SPEC_{LEKCJE,DECYZJE}.md` |
| E3 — planowanie (wersja 0.3.0) | **ZREALIZOWANY 2026-08-07** | `skills/relai-planning/SKILL.md`, `templates/SPEC_{PLAN,STATUS}.md` |
| E4 — prompty etapowe i `/relai-stage` (wersja 0.4.0) | **ZREALIZOWANY 2026-08-07** | `commands/relai-stage.md`, `templates/SPEC_PROMPT_ETAPU.md` |
| E5 — osiem hooków Node.js, zamknięcie R8 (wersja 0.5.0) | **ZREALIZOWANY 2026-08-07** | `hooks/`, `hooks/hooks.json` |
| E6 — konkurs designu, szablon HTML, nadpisania lokalne (wersja 0.6.0) | **ZREALIZOWANY 2026-08-08** | `templates/HTML_PLAN/`, `templates/SPEC_PLAN_HTML.md`, `skills/relai-planning/SKILL.md` |
| E7 — sześć komend operacyjnych, propozycja wycieczki (wersja 0.7.0) | **ZREALIZOWANY 2026-08-08** | `commands/`, `hooks/session-context.js`, `templates/SPEC_KOMENDY.md` |
| E8 — profile projektów i reguły warunkowe (wersja 0.8.0) | **ZREALIZOWANY 2026-08-08** | `templates/SPEC_{PROFILE,ARCHITEKTURA,DESIGN,SRODOWISKA,SNAPSHOT}.md`, `hooks/profile-rules.js`, `hooks/config-protection.js` |
| E9 — adopcja i aktualizacja projektu (wersja 0.9.0) | **ZREALIZOWANY 2026-08-09** | `commands/relai-{adopt,update}.md`, `templates/SPEC_RAPORT_ADOPCJI.md` |
| E10 — pilotaż, cztery scenariusze akceptacyjne, **wydanie 1.0.0** | **ZREALIZOWANY 2026-08-10** | docs/archiwum/plany/BUDOWA_RELAI/, DZIENNIK wpis 2026-08-10 |
| **Plan BUDOWA_RELAI** | **ZAMKNIĘTY 2026-08-10** — wszystkie 10 etapów dowiezione | docs/archiwum/plany/BUDOWA_RELAI/STATUS.md |

Aktywny plan: brak

## Reguły procesu

- Plan zamrożony po akceptacji; zmiany wyłącznie datowanymi aneksami. Odchylenie fundamentalne → propozycja nowego planu z linkiem do starego.
- Wykonanie etapów: świeże sesje **Opus** (D-85) wg `PROMPT_ETAP_N.md`. Architektura i plany: model najsilniejszy (Fable). Na starcie etapu sprawdź model sesji — jeśli inny niż Opus, przerwij i poproś o zmianę.
- Każdy etap kończy się rytuałem „Na koniec": aktualizacja STATUS → wpis do DZIENNIKA → wygenerowanie promptu następnego etapu. Zadanie bez tego rytuału NIE jest ukończone.
- Dokumentacja po polsku, kod i identyfikatory po angielsku, commity conventional po angielsku.
- Sekrety nigdy w plikach śledzonych; klucze wyłącznie w `.env` (gitignored).

## Implementation guidelines (sekcja niemutowalna)

- **Think before coding**: nie zakładaj — sprawdź; niejasność → pytanie, nie domysł.
- **Simplicity first**: najprostsze działające rozwiązanie; zero spekulacyjnej generyczności (YAGNI).
- **Surgical changes**: zmieniaj minimum konieczne; nie refaktoryzuj przy okazji.
- **Goal-driven**: każda zmiana mapuje się na cel etapu; poza zakresem → do DZIENNIKA jako „świadomie odłożone".
