# STATUS — plan ZGLOSZENIA

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-10-26 · Status planu: **ZAAKCEPTOWANY 2026-10-26** · Model wykonawczy etapów: Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Ikona na stronie | ZREALIZOWANY 2026-10-26 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | ikona skopiowana, test odwołań w `strona.yml`; na żywo 200 |
| E2 | Plik wznowienia w zamknięciu (#3) | ZREALIZOWANY 2026-10-26 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | krok 3a w trzech adapterach; zniknięcie pliku po „tak” — bramka po E5 |
| E3 | Pasek cache w terminalu (#2) | ZREALIZOWANY 2026-10-26 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | siatka do 3 kolumn bez linii b; kolumny rosną w obrębie układu karty (L-0282) |
| E4 | Tytuł nowej sesji (#1) | ZREALIZOWANY 2026-10-27 | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | sonda pozytywna; tytuł w „Nowa sesja” z pliku fokusu (1 przebieg, margines 131 ms) |
| E5 | Wydanie i zamknięcie zgłoszeń | GOTOWY DO STARTU | [PROMPT_ETAP_5.md](PROMPT_ETAP_5.md) | numery i komentarze na GitHubie po „tak” |

## Bramki manualne

- **Pomiar w aplikacji po wydaniu: „kończymy na dziś” → jedno pytanie → „tak” → plik wznowienia
  `.md` znika, `.patch` zostaje; następny start bez zdania o pliku** · źródło: wpis dziennika
  2026-10-26 (E2) · **OTWARTA**
- **Pomiar w aplikacji po wydaniu: „Nowa sesja” z paska cache w RelAI z aktywnym fokusem → tytuł
  „E<N> · PLAN — nazwa” w co najmniej trzech przebiegach (wyścig zapisu fokusu po `/clear`
  z hookiem zmierzony raz, margines 131 ms)** · źródło: wpis dziennika 2026-10-27 (E4) · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-26 — plan utworzony po wywiadzie z Łukaszem (cztery decyzje: ikona w planie, jeden plan, plik wznowienia z pytaniem, siatka bez linii b; tytuł z fokusu przy pierwszym prompcie-kontynuacji), przekazany do akceptacji.
- 2026-10-26 — plan ZAAKCEPTOWANY bez zmian („Akceptuję plan ZGLOSZENIA bez zmian.”); wygenerowano PROMPT_ETAP_1.
- 2026-10-26 — E1 ZREALIZOWANY: `site/grafika/ikony/security.svg` (kopia bajt w bajt) i test `site/narzedzia/odwolania.test.mjs` (26 testów, RED przed kopią na czterech stronach); testy strony 370 → 396; commit `e42f9a3` wypchnięty, `strona.yml` zielony, ikona 200 na żywo; wygenerowano PROMPT_ETAP_2.
- 2026-10-26 — E2 ZREALIZOWANY: krok 3a „Plik wznowienia” w `session-close.md` (Claude Code, Codex) i `relai-core.mdc`, czwarta droga zgody w `SPEC_WZNOWIENIE.md`; testy 272/272 i 24/24, `release-check --szybko` bez czerwieni; pomiar `-p` „przed”/„po”: pytanie pada raz, `rm` samego `.md` odrzucone przez harness (P-014) — zniknięcie pliku jako bramka manualna po E5 (decyzja Łukasza); L-0281; wygenerowano PROMPT_ETAP_3.
- 2026-10-26 — E3 ZREALIZOWANY: siatka terminala w `rings.ts` (`termColumns`, `termRows`) i `band()` bez linii `b`, desktop z odciskiem równym HEAD; testy modu 199 → 206; na żywo w `conhost` 80 i 120 kolumn, HEAD i E3 w jednej sesji (kolumny co 23 komórki); liczba kolumn 1/3/2/3 przy 31/75/94/120 — rośnie w obrębie układu (decyzja Łukasza, L-0282); L-0283; wygenerowano PROMPT_ETAP_4.
- 2026-10-27 — E4 ZREALIZOWANY: sonda `sessionTitle` pozytywna (CLI `-p`, desktop, po `/clear`; tytuł z hooka wygrywa z tytułem AI aplikacji); hook `session-title` + `core/process/session-title.js` + wspólny kształt `core/panel/session-title.mjs` (też `start_session` karty); „pierwszy prompt” z transkryptu i znacznika, bo po `/clear` aplikacja przenosi stary tytuł; testy rdzenia 272 → 295, panel 214, trzy mutacje zabite; „Nowa sesja” (`/handoff`) w projekcie testowym → „E2 · PROBA — Drugi krok sondy”; wygenerowano PROMPT_ETAP_5.
