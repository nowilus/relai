# STATUS — plan BUDOWA_RELAI

Plan: [PLAN.html](PLAN.html) • Utworzony: 2026-08-07 • Status planu: **ZAAKCEPTOWANY 2026-08-07 (Aneks A)** • Model wykonawczy: **Opus** (D-85)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Fundament repo pluginu + inicjalizacja projektu | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | plugin 0.1.0: manifest + marketplace + skill `relai-core` + 6 specyfikacji |
| E2 | Rdzeń dokumentacyjny (specyfikacje dokumentów + rytuały) | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | plugin 0.2.0: SPEC_LEKCJE + SPEC_DECYZJE, rytuały sesji, 3 frazy, ustawienia globalne |
| E3 | Planowanie (PLAN/MINIPLAN, folder-per-plan, STATUS) | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | plugin 0.3.0: skill `relai-planning`, SPEC_PLAN + SPEC_STATUS, MINIPLAN w SPEC_DZIENNIK |
| E4 | Prompty etapowe + /relai-stage + lazy-gen | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | plugin 0.4.0: `SPEC_PROMPT_ETAPU`, komenda `/relai-stage`, rytuał „Na koniec" z lazy-generacją, siatka w `relai-core` |
| E5 | Hooki Node.js (8 szt.) | **ZREALIZOWANY 2026-08-07** | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | plugin 0.5.0: 8 hooków + rejestracja; `session-context` mityguje R2 (2/2 bez wywołania `Skill`) i zamyka R8 (kopiowanie specyfikacji do `.claude/relai/templates/`, ustawienia globalne przez hook); wykonany przez **Fable** na jawne polecenie użytkownika (odstępstwo od D-85 odnotowane w dzienniku) |
| E6 | Konkurs designu + szablon HTML + nadpisania lokalne | **W TOKU** (faza 1, runda 2 zrealizowana 2026-08-08) | [PROMPT_ETAP_6.md](PROMPT_ETAP_6.md) | runda 1 odrzucona w całości przez użytkownika (D-61b), przeniesiona do `docs/zasoby/design-konkurs/runda-1/`; runda 2 wg złagodzonego briefu D-61a — pięć propozycji w `runda-2/`, czeka na wybór 1–2. Faza 2 (iteracja finału, `templates/HTML_PLAN/`, nadpisania lokalne, provisioning, wersja 0.6.0) — sesja **Fable** z użytkownikiem (D-85) |
| E7 | Komendy operacyjne (backup, audit, changelog, handover, tour) | OCZEKUJE | — | |
| E8 | Profile (app / agent-voice / flow / prompty) | OCZEKUJE | — | |
| E9 | Adopcja (/relai-adopt) + /relai-update | OCZEKUJE | — | obszar szczególnej staranności (D-70) |
| E10 | Pilotaż + scenariusze akceptacyjne | OCZEKUJE | — | nowy projekt + adopcja JiraManager. **Kontrola R2 (pierwszy pomiar wykonany 2026-08-07, 2/2 po 0.3.1):** powtórzyć w **sesji interaktywnej** (tryb `-p` blokuje `AskUserQuestion`, więc pełny cykl plan → pliki nie był mierzony) i sprawdzić powtarzalność na kilku przebiegach, osobno dla `relai-core` i `relai-planning` |

## Dziennik wdrożenia

- 2026-08-07 — plan utworzony, przekazany do akceptacji.
- 2026-08-07 — plan ZAAKCEPTOWANY z poprawkami (Aneks A: /relai-help, pytanie o model wykonawczy przy planach, wykonawca budowy = Opus, luki domknięte przeglądem architekta). Wygenerowano PROMPT_ETAP_1.
- 2026-08-07 — **E1 ZREALIZOWANY** (Opus). Plugin RelAI 0.1.0: `.claude-plugin/{plugin,marketplace}.json`, skill `relai-core`, sześć specyfikacji dokumentów w `templates/`, konwencja hook-guard w README pluginu. Instalacja z GitHuba zweryfikowana na tej maszynie (`claude plugin marketplace add nowilus/relai` + `install`). Auto-wyzwalanie skilla w świeżej sesji niezweryfikowane — do sprawdzenia na starcie E2 (ryzyko R2). Wygenerowano PROMPT_ETAP_2.
- 2026-08-07 — **E2 ZREALIZOWANY** (Opus). Plugin RelAI 0.2.0: specyfikacje `SPEC_LEKCJE.md` i `SPEC_DECYZJE.md`, skill `relai-core` rozszerzony o rytuały (start sesji, definicja ukończenia, reakcja na korektę, zamknięcie sesji), trzy frazy naturalne PL/EN, warstwa ustawień globalnych `~/.claude/relai/`, inicjalizacja generuje osiem dokumentów. Dogfooding: `docs/LEKCJE.md` repo założone (L-0001…L-0005). Test ryzyka R2 (auto-wyzwalanie skilla) **niewykonany** — plugin odinstalowany na czas budowy (L-0004), przeniesiony do E10. Wygenerowano PROMPT_ETAP_3.
- 2026-08-07 — **E3 ZREALIZOWANY** (Opus). Plugin RelAI 0.3.0: skill `relai-planning` (wykrycie
  intencji planowania, próg PLAN/MINIPLAN, jedno pytanie o rodzaj/format/model, zamrożenie
  z aneksami, zamknięcie planu), specyfikacje `SPEC_PLAN.md` i `SPEC_STATUS.md`, MINIPLAN jako
  sekcja `SPEC_DZIENNIK.md`. Sześć testów na ścieżce ze spacją i polskim znakiem — wszystkie PASS;
  nie zmierzono auto-wyzwalania skilla ani realnej interakcji AskUserQuestion. Wygenerowano
  PROMPT_ETAP_4.
- 2026-08-07 — **pomiar R2** na wniosek użytkownika: plugin zainstalowany, sześć świeżych sesji.
  0.3.0 → 1/4 wyzwoleń skilla; po poprawce opisów (**0.3.1**) → 2/2. Ryzyko R2 obniżone do
  średniego, nadal otwarte. Ujawniony defekt warstwy globalnej (dostęp poza katalogiem roboczym) —
  L-0010, do rozwiązania w E5.
- 2026-08-07 — **E4 ZREALIZOWANY** (Opus). Plugin RelAI 0.4.0: `templates/SPEC_PROMPT_ETAPU.md`,
  pierwsza działająca komenda `commands/relai-stage.md`, rytuał „Na koniec" etapu z lazy-generacją
  promptu N+1 w `relai-planning`, siatka dogenerowująca w `relai-core`, kolumna `Prompt`
  w `SPEC_STATUS` z realnym linkiem, `SPEC_KOMENDY` z tabelą komend. Jedenaście świeżych sesji
  pomiarowych na ścieżce ze spacją i polskim znakiem; pięć defektów znalezionych i poprawionych
  w trakcie (układ promptu, sprzeczność zakazu zapisu, martwy link po zamknięciu planu, brak
  wczytania skilla przez komendę, nieaktualna linia aktywnego planu). Nowe ryzyko **R8**: sesja
  nie ma dostępu do `templates/` pluginu. Wygenerowano PROMPT_ETAP_5.
- 2026-08-07 — weryfikacja E4 przez Fable (na polecenie użytkownika): zero defektów do poprawy.
- 2026-08-07 — **E5 ZREALIZOWANY** (Fable, jawne polecenie użytkownika — odstępstwo od D-85).
  Plugin 0.5.0: osiem hooków Node.js (`hooks/` + `hooks.json`), 39/39 testów jednostkowych,
  siedem sesji integracyjnych. `secret-scanner` blokuje 4 formaty (dowód: pliki nie powstały),
  `config-protection` chroni sekcję niemutowalną (suma kontrolna identyczna), `session-context`
  wymusza rytuał startu bez wyzwolenia skilla (2/2) i zamyka R8: inicjalizacja bez `--add-dir`
  dała komplet ośmiu dokumentów ze specyfikacji czytanych z `.claude/relai/templates/`.
  R4 zamknięte, R2 obniżone do niskiego. Wygenerowano PROMPT_ETAP_6.
- 2026-08-07 — **E6 faza 1 ZREALIZOWANA** (Opus). Pięć propozycji designu w
  `docs/zasoby/design-konkurs/propozycja-1…5.html` (Redakcja / Terminal / Panel operacyjny /
  Rysunek techniczny / Plakat) na tej samej treści testowej — pełny plan płatności z przykładu
  `SPEC_PLAN.md`. Zasady konkursu i próg emoji (0) zapisane **przed** generacją w
  `docs/zasoby/design-konkurs/README.md`. Kontrola mechaniczna 5/5 PASS, symulatory sprawdzone
  na żywo w przeglądarce. Faza 2 (wybór, iteracja, finalny szablon, nadpisania lokalne,
  provisioning, wersja 0.6.0) wymaga sesji **Fable** z użytkownikiem.
- 2026-08-08 — **runda 1 konkursu ODRZUCONA w całości** przez użytkownika; cztery kierunki
  (Terminal, Panel operacyjny, Rysunek techniczny, Plakat) odrzucone na stałe (D-61b). Zakazy
  D-61 złagodzone do **D-61a** (zaokrąglenia, lekki glassmorphism, animacja służebna, typografia
  ozdobna dozwolone), lekcja L-0019. **Runda 2 (Opus)**: pięć nowych propozycji w
  `docs/zasoby/design-konkurs/runda-2/` — Zeszyt, Studio nocne, Tablica warsztatowa, Mapa podróży,
  Przepis; fonty OFL osadzone w base64, kontrola mechaniczna 5/5 PASS, zachowania sprawdzone
  na żywo. Poprawiony defekt: animowane liczniki nie kończyły się w karcie w tle.
