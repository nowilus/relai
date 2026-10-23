# RelAI — budowa pluginu (projekt dogfoodingowy)

Ten folder to repo pluginu **RelAI** („Twój projekt pamięta wszystko") — frameworka dokumentacyjno-procesowego dla Claude Code. Projekt prowadzi się według zasad, które sam buduje. Trzymaj ten plik krótkim — szczegóły są w `docs/`.

## Rytuał startu sesji

Czytaj w kolejności, nie skanuj pełnotekstowo repo:
1. Ten plik.
2. [docs/STATE.md](docs/STATE.md) — stan na dziś, cały plik; jest krótki.
3. [docs/DZIENNIK.md](docs/DZIENNIK.md) — sekcja „Stan otwartych ryzyk" + ostatni wpis.
4. [docs/LEKCJE.md](docs/LEKCJE.md) — wyłącznie sekcja „Zasady aktywne".
5. Rejestru decyzji **nie czytasz na starcie** — `docs/DECYZJE.md` otwierasz, gdy temat dotyka decyzji; decyzji zamrożonych **nie proponujesz ponownie**.
6. [docs/USTAWIENIA.md](docs/USTAWIENIA.md) — preferencje projektu.
7. Aktywny plan — linia „Aktywny plan" pod tabelą „Stan prac"; plany zamknięte mają tam status i link do archiwum.

**Frazy sesji:** „kontynuujemy pracę" → rytuał startu, akapit „gdzie jesteśmy" **i jedno zdanie
z propozycją najbliższego kroku**; „sprawdź status" → stan, plany, ryzyka, zaległości
dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
sprzątanie artefaktów roboczych, propozycja commita. Pełna ściąga: [docs/KOMENDY.md](docs/KOMENDY.md).

**Sprawa przeterminowana:** pozycja sekcji „Czeka na człowieka" starsza niż `N` dni (wiersz
`Przegląd spraw człowieka` w [docs/USTAWIENIA.md](docs/USTAWIENIA.md), domyślnie 30) wymusza
decyzję **przed** akapitem „gdzie jesteśmy": pytasz partiami po cztery — zamknąć / odroczyć
o kolejne `N` dni / rozstrzygnąć teraz. Sesja nieinteraktywna: sam raport, bez pytań — rozpoznajesz ją z kontekstu (`claude -p`, agent w tle); żaden hook jej nie sygnalizuje.

## Stan prac

| Co | Status | Gdzie |
|---|---|---|
| Plan BEZPIECZENSTWO — 6 etapów | ZAAKCEPTOWANY 2026-10-23, E1 GOTOWY DO STARTU (Trivy i audyt Cloudflare w pluginie, komenda `/relai-security`, 13. hook, wszystkie adaptery; równolegle do PANEL_CODEX) | [status](docs/plany/BEZPIECZENSTWO/STATUS.md) |
| Plan RELAI_MODS — 5 etapów | ZAAKCEPTOWANY 2026-10-23, E2 ZREALIZOWANY 2026-10-23, E3 GOTOWY DO STARTU (czwarty mod `relai-mods`: kokpit pluginów i hooków; plan B przeładowania, P-052, Aneks A; E2 — pełny inwentarz z plików, 12/14 · 7 hooków na żywo; E3 — kokpit z makiety C) | [status](docs/plany/RELAI_MODS/STATUS.md) |
| Plan FILM_PREZENTACYJNY — 7 etapów | **ZREALIZOWANY 2026-10-13** (7/7, Aneksy A–F, wydanie 3.0.0 z filmem PL i EN w zasobach `v3.0.0`, pętla w README; `relai-panel` 0.14.1 z poprawką parsera modelu karty etapu — Aneks F) | [archiwum planu](docs/archiwum/plany/FILM_PREZENTACYJNY/STATUS.md) |
| Plan STRONA_RELAI — 8 etapów | **ZREALIZOWANY 2026-10-18** (8/8, Aneksy A–E; strona https://nowilus.github.io/relai/ w dwóch wersjach: Film w korzeniu, Biurko 3D pod `/biurko/`, ankieta w Tally; wdrożenie `strona.yml`; otwarte poza planem: odczyt ankiety, pomiar na słabszym laptopie, przegląd EN — w STATE) | [archiwum planu](docs/archiwum/plany/STRONA_RELAI/STATUS.md) |
| Plan PANEL_CODEX | ZAAKCEPTOWANY 2026-10-10; E1 W TOKU — natywny widok i mostek bieżącego czatu potwierdzone; układ zaakceptowany; sonda 0.0.9 z poprawką fontów gotowa; pomiar po restarcie i świeży szkic czekają | [status](docs/plany/PANEL_CODEX/STATUS.md) |
| Plan WYGLAD_PANELU — 5 etapów | **ZREALIZOWANY 2026-10-15** (5/5, Aneksy A–H; paski i panel za jasnym i ciemnym wyglądem aplikacji, pasek postępu jako lista, wydanie 3.2.0 / panel 0.19.0; E5: „Teraz” ze stanem po kształcie, baterie w siatce, wiersz kontekstu z progiem auto-compactu, natywne dymki — `relai-panel` 0.20.0 / `relai-cache-keeper` 0.11.0) | [archiwum planu](docs/archiwum/plany/WYGLAD_PANELU/STATUS.md) |
| Plan HUMANIZACJA — 5 etapów | **ZREALIZOWANY 2026-10-14** (5/5, Aneksy A–C, wydanie 3.1.0 / `relai-panel` 0.16.0; `/relai-humanize` — oryginał obok wersji bez nawyków AI, strażnik faktów, wywiad przy pierwszym użyciu, tryb ciągły w zakresach wybranych przez użytkownika, także przy zapisie powłoką; odnoga FILM_TESTY_V3 przeniesiona do `docs/fixy/`) | [archiwum planu](docs/archiwum/plany/HUMANIZACJA/STATUS.md) |
| Plugin RelAI — wydany, trzy adaptery | DZIAŁA (3.2.0 w repo i publicznie, wydane 2026-10-15; w marketplace także trzy pluginy panelu „early access”: relai-panel 0.20.0, relai-progress 0.5.0, relai-cache-keeper 0.11.0 — paski i panel za jasnym i ciemnym wyglądem aplikacji, baterie w siatce, wiersz kontekstu z progiem auto-compactu, tag `relai-panel-v0.20.0`) | [docs/STATE.md](docs/STATE.md) |
| Plan PANEL_CLAUDE — 9 etapów | **ZREALIZOWANY 2026-10-10** (9/9, Aneksy A–E, wydanie 2.8.0; pomiar bramki E5 pominięty decyzją człowieka) | [archiwum planu](docs/archiwum/plany/PANEL_CLAUDE/STATUS.md) |
| Plan BUDOWA_RELAI — 10 etapów | ZAMKNIĘTY 2026-08-10 | [archiwum planu](docs/archiwum/plany/BUDOWA_RELAI/STATUS.md) |
| Plan ROZWOJ_PO_WYDANIU — 8 etapów | **ZREALIZOWANY 2026-09-05**; wydania 1.10.0 i 2.0.0 opublikowane | [archiwum planu](docs/archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md) |
| Plan OPTYMALIZACJA_KONTEKSTU — 5 etapów | ZREALIZOWANY 2026-08-21 | [archiwum planu](docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md) |
| Plan HIGIENA_DOKUMENTOW — 6 etapów | **ZREALIZOWANY 2026-09-01** (Aneksy A–D) | [archiwum planu](docs/archiwum/plany/HIGIENA_DOKUMENTOW/STATUS.md) |
| Plan SPRZATANIE_ARTEFAKTOW — 4 etapy | **ZREALIZOWANY 2026-09-03** (4/4, wydanie 1.8.0) | [archiwum planu](docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md) |
| Plan REKOMENDACJA_MODELU — 4 etapy | **ZREALIZOWANY 2026-09-04** (4/4, Aneksy A–D, wydanie 1.9.0) | [archiwum planu](docs/archiwum/plany/REKOMENDACJA_MODELU/STATUS.md) |
| Plan PIERWSI_UZYTKOWNICY — 3 etapy | **CZĘŚCIOWO ZREALIZOWANY 2026-09-24** (E1 i E2 zrealizowane, E3 pominięty — pilotaż nie wystartował) | [archiwum planu](docs/archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md) |
| Plan PROWADZENIE_END_TO_END — 7 etapów | **ZREALIZOWANY 2026-09-24** (7/7, Aneksy A–K; wydania 2.3.1–2.6.0 po E1–E4, E5–E7 razem w 2.7.0) | [archiwum planu](docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md) |
| Plan OPTYMALIZATOR_PROMPTOW — 5 etapów | **ZREALIZOWANY 2026-09-15** (5/5, Aneksy A i B, wydanie 2.2.0) | [archiwum planu](docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md) |
| Plan LIMIT_CHECKPOINT — 4 etapy | **ZREALIZOWANY 2026-10-12** (4/4, Aneksy A–E, wydanie 2.9.0 / `relai-cache-keeper` 0.6.0 / `relai-panel` 0.13.0); zapis pracy przed wyczerpaniem limitu 5 h / tygodniowego | [archiwum planu](docs/archiwum/plany/LIMIT_CHECKPOINT/STATUS.md) |
| Odnogi i wątki samodzielne | 2 otwarte: `FILM_TESTY_V3` (od 2026-10-14, przeniesiona z planu HUMANIZACJA — testy filmu 3.0.0 przypięte do commitu wydania; [karta](docs/fixy/FILM_TESTY_V3/ODNOGA.md)) i `OPIS_REPO` (od 2026-09-24); `AGENTS_KRABY` **ZAMKNIĘTA 2026-10-23** (panel „RelAI Agents”: każdy subagent jako postać roli — dziewięć zwierząt w strojach ról, imię z puli, barwa agenta; karta z imieniem w Hanken Grotesk, zadaniem, „co robi teraz”, siatką Model · Kroki · Koszt · Czas i chevronem z krokami narzędzi; chip agentów w pasku otwiera panel; inspirowane Helper Desk (Ben AI), bez kodu wzorca; `relai-progress` 0.6.0 wydany 2026-10-23, tag `relai-progress-v0.6.0`; [karta](docs/fixy/AGENTS_KRABY/ODNOGA.md)); `MOBILNA_STRONA` **ZAMKNIĘTA 2026-10-19** (Film i Biurko na telefonie: prompt w kadrze, komendy z przytrzymaniem i swipe'em w bok, swipe = przystanek na Biurku 3D, znaczniki „Zajrzyj”; ankieta Tally na cztery warianty z danymi o urządzeniu; [karta](docs/fixy/MOBILNA_STRONA/ODNOGA.md)); `BIURKO_PLAKAT` **ZAMKNIĘTA 2026-10-19** (Biurko bez sceny 3D: odbitki kadrów sceny na każdym przystanku, mapa śledzi przewijanie, karteczka „Jak włączyć 3D?”; [karta](docs/fixy/BIURKO_PLAKAT/ODNOGA.md)); `PANEL_WASKI` **ZAMKNIĘTA 2026-10-14** (panel bez rozjazdów w wąskim panelu podziału okna, zmierzony na żywo przy 31, 75 i 94 kolumnach: przyciski się nie kurczą, tekst zawija, grupa komend jednym kaflem z odstępami, jeden układ wierszy na panel; test szerokości w modelu CSS, P-043; `relai-panel` 0.18.0 w repo, niewydany; [karta](docs/fixy/PANEL_WASKI/ODNOGA.md)); `SPLIT_VIEW` **ZAMKNIĘTA 2026-10-14** (paski i panel w każdym panelu podziału po poprawce anthropics/claude-code#99265, linia w stopce wycofana, P-040 rozwiązana; `relai-cache-keeper` 0.9.0 / `relai-panel` 0.17.0; [karta](docs/fixy/SPLIT_VIEW/ODNOGA.md)); `KOMUNIKAT_ZWROTU` **ZAMKNIĘTA 2026-10-14** (pasek cache: jeden uczciwy wyzwalacz, próg 20 wiadomości, sam koszt w % limitu 5 h, przycisk „Nowa sesja”; `relai-cache-keeper` 0.8.0; [karta](docs/fixy/KOMUNIKAT_ZWROTU/ODNOGA.md)); `PASKI_W_STOPCE` **ZAMKNIĘTA 2026-10-13** (linia statusu w stopce każdej sesji, także w prawym panelu podziału — P-040; `relai-cache-keeper` 0.7.0 / `relai-panel` 0.15.0; [karta](docs/fixy/PASKI_W_STOPCE/ODNOGA.md)); `AUDYT_SKILLI` **ZAMKNIĘTA 2026-10-12** (S1–S7, skille wg praktyk Agent Skills: walidator metadanych, SKILL.md o połowę lżejsze, `rotate.js`, ewaluacje wyzwalania, jawne wywołanie pięciu komend, przyjęcie cudzego kodu; bez wydania — do 3.0.0; [karta](docs/fixy/AUDYT_SKILLI/ODNOGA.md)); `NOWA_SESJA` **ZAMKNIĘTA 2026-10-12** (N0–N4, start etapu w nowej sesji aplikacji deep linkiem, `start_session` gdy flaga; `relai-panel` 0.14.0 wydany 2026-10-12; [karta](docs/fixy/NOWA_SESJA/ODNOGA.md)); `AUDYT_MODOW` **ZAMKNIĘTA 2026-10-11** (14 paczek Z1–Z14, Aneksy A–B, wydania `relai-panel` 0.12.0 / `relai-progress` 0.4.0 / `relai-cache-keeper` 0.5.0, [karta](docs/fixy/AUDYT_MODOW/ODNOGA.md)); `ORKIESTRACJA` zamknięta 2026-09-06 (2.1.0 w repo), `PRECOMMIT_ESM` 2026-09-04 wydaniem 1.9.2, `CURSOR_1_9_1` tego samego dnia | [docs/STATE.md](docs/STATE.md) |

Aktywny plan: [PANEL_CODEX](docs/plany/PANEL_CODEX/STATUS.md) — prowadzony w Codeksie, E1 w toku (`gpt-6.1-sol`). Ostatni zamknięty: [STRONA_RELAI](docs/archiwum/plany/STRONA_RELAI/STATUS.md), 2026-10-18 (strona opublikowana w dwóch wersjach z ankietą; Biurko bez sceny 3D przebudowane wątkiem BIURKO_PLAKAT 2026-10-19).

## Reguły procesu

- **PANEL_CODEX (wybór 2026-10-08):** autor planu i wykonawca etapów — `gpt-6.1-sol` w Codeksie, w świeżych sesjach. Plan jest osobny i rusza dopiero po pełnym zamknięciu PANEL_CLAUDE oraz akceptacji PANEL_CODEX; jego E1 pozostaje `OCZEKUJE` do spełnienia bramek.
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
