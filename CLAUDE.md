# RelAI — budowa pluginu (projekt dogfoodingowy)

Ten folder to repo pluginu **RelAI** („Twój projekt pamięta wszystko") — frameworka dokumentacyjno-procesowego dla Claude Code. Projekt prowadzi się według zasad, które sam buduje. Trzymaj ten plik krótkim — szczegóły są w `docs/`.

## Rytuał startu sesji

Uruchom `node .claude/relai/tools/start-digest.js` i przeczytaj jego wyjście — to cały odczyt
startu: stan, ryzyka, ostatni wpis dziennika, ustawienia, aktywny plan i indeks „Zasad aktywnych”.
**Zanim pierwszy raz zmienisz plik, porównaj zadanie z wyzwalaczami indeksu; trafienie → `Read`
pełnego brzmienia tej zasady z `docs/LEKCJE.md`, dopiero potem praca.** Plików,
które skrót streszcza, nie otwierasz na starcie i nie skanujesz repo pełnotekstowo; pełne sekcje
wskazują drogowskazy na końcu skrótu. Ten plik ładuje harness — nie czytasz go drugi raz.
Rejestru decyzji **nie czytasz na starcie** — `docs/DECYZJE.md` otwierasz, gdy temat dotyka
decyzji; decyzji zamrożonych **nie proponujesz ponownie**. Aktywny plan wskazuje linia „Aktywny
plan" pod tabelą „Stan prac"; tabela ma najwyżej pięć wierszy-drogowskazów (`SPEC_CLAUDE_MD.md`),
plany zamknięte są w `docs/archiwum/plany/` i w `docs/STATE.md`.

**Frazy sesji:** „kontynuujemy pracę" → rytuał startu, akapit „gdzie jesteśmy" **i jedno zdanie
z propozycją najbliższego kroku**; „sprawdź status" → stan, plany, ryzyka, zaległości
dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
sprzątanie artefaktów roboczych, propozycja commita; „gotowi do wydania?” → komenda projektowa
`/relai-release` (`.claude/commands/`; w Codeksie i Cursorze sam raport
`node core/tools/release-check.js`, bez publikacji). Pełna ściąga: [docs/KOMENDY.md](docs/KOMENDY.md).
**Podpowiedź wydania:** przy „kontynuujemy pracę” (po akapicie „gdzie jesteśmy”) i w podsumowaniu
zamknięcia planu uruchom `node core/tools/release-hint.js` (~1 s). Linia na wyjściu → jedno zdanie
o gotowości wydania z jej liczbą plików i komponentami; puste wyjście → nic nie mówisz.

**Sprawa przeterminowana:** pozycja sekcji „Czeka na człowieka" starsza niż `N` dni (wiersz
`Przegląd spraw człowieka` w [docs/USTAWIENIA.md](docs/USTAWIENIA.md), domyślnie 30) wymusza
decyzję **przed** akapitem „gdzie jesteśmy": pytasz partiami po cztery — zamknąć / odroczyć
o kolejne `N` dni / rozstrzygnąć teraz. Sesja nieinteraktywna: sam raport, bez pytań — rozpoznajesz ją z kontekstu (`claude -p`, agent w tle); żaden hook jej nie sygnalizuje.

## Stan prac

| Co | Status | Gdzie |
|---|---|---|
| Plugin RelAI — wydany, trzy adaptery | DZIAŁA (3.6.0 w repo i publicznie, wydane 2026-10-28 — tryb „RelAI tylko w projektach”; zgłoszenia #1–#3 w 3.5.0 z tego samego dnia; w marketplace także cztery mody, każdy z własnym tagiem i wydaniem: relai-panel 0.22.1, relai-progress 0.7.0, relai-cache-keeper 0.13.0 („early access”) i relai-mods 0.3.0) | [docs/STATE.md](docs/STATE.md) |
| Plany zamknięte | 20, ostatni ZASIEG_PLUGINU 2026-10-28 (wydanie 3.6.0) | [archiwum planów](docs/archiwum/plany/), [docs/STATE.md](docs/STATE.md) |
| Odnogi i wątki samodzielne | 1 otwarta: `OPIS_REPO` (od 2026-09-24); zamknięte — karty w [docs/fixy/](docs/fixy/) | [docs/STATE.md](docs/STATE.md) |

Aktywny plan: [KONTEKST_STARTU](docs/plany/KONTEKST_STARTU/STATUS.md) — w Claude Code, ZAAKCEPTOWANY 2026-10-28, E1–E4 zrealizowane 2026-10-28, E5 gotowy do startu (lżejszy start sesji: skrót startu, indeks zasad, bramka trybu ciągłego w dwóch krokach). [PANEL_CODEX](docs/plany/PANEL_CODEX/STATUS.md) (Codex) **nieaktywny — WSTRZYMANY 2026-10-27** decyzją Łukasza. Ostatni zamknięty: [ZASIEG_PLUGINU](docs/archiwum/plany/ZASIEG_PLUGINU/STATUS.md), 2026-10-28 (wydanie 3.6.0 — RelAI tylko w zaadoptowanych projektach, maszyna przełączona).

## Reguły procesu

- **PANEL_CODEX (wybór 2026-10-08; plan WSTRZYMANY 2026-10-27):** autor planu i wykonawca etapów — `gpt-6.1-sol` w Codeksie, w świeżych sesjach. Plan jest osobny i rusza dopiero po pełnym zamknięciu PANEL_CLAUDE oraz akceptacji PANEL_CODEX; jego E1 pozostaje `OCZEKUJE` do spełnienia bramek.
- Plan zamrożony po akceptacji; zmiany wyłącznie datowanymi aneksami. Odchylenie fundamentalne → propozycja nowego planu z linkiem do starego.
- Wykonanie etapów: świeże sesje **Opus** (D-85) wg `PROMPT_ETAP_N.md`; wyjątek E7 z 2026-09-05:
  **`gpt-5.6-terra/high` w Codeksie**. Architektura i plany: Opus w bieżącej sesji (D-84 zmieniona
  2026-10-14 — wymóg Fable odwołany). Na
  starcie etapu sprawdź model wskazany w prompcie — rozjazd zatrzymuje pracę przed zapisem.
- Każdy etap kończy się rytuałem „Na koniec": aktualizacja STATUS → wpis do DZIENNIKA → wygenerowanie promptu następnego etapu. Zadanie bez tego rytuału NIE jest ukończone.
- Wątek spoza zakresu etapu → zatrzymaj się i zapytaj: odnoga (`/relai-branch`), aneks do planu czy
  „świadomie odłożone" do dziennika. Nigdy „przy okazji".
- Dokumentacja po polsku, kod i identyfikatory po angielsku, commity conventional po angielsku.
- Sekrety nigdy w plikach śledzonych; klucze wyłącznie w `.env` (gitignored).
- Nieoczywiste zachowanie narzędzia, kolejność kroków, wymóg środowiska → [docs/PULAPKI.md](docs/PULAPKI.md); zajrzyj tam, zanim uznasz, że coś jest zepsute.
- Tekst z backslashem (wyrażenie regularne, ścieżka Windows) nie idzie przez powłokę ani przez literał
  innego języka: skrypt z takim tekstem piszesz narzędziem Write/Edit, a wzorzec sprawdzasz kontrolą
  pozytywną na materiale, który musi trafić (L-0116, L-0119, L-0127, L-0130).
- Tekst dokumentu z backtickiem zmieniasz wyłącznie narzędziem Edit/Write — nigdy podmianą
  w powłoce, także „krótką” (L-0198, L-0207).

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
