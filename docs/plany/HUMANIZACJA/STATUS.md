# STATUS — plan HUMANIZACJA

[PLAN.html](PLAN.html) · utworzony 2026-10-14 · **ZAAKCEPTOWANY 2026-10-14** (z Aneksem A) · model wykonawczy etapów: **Opus 5.5** w świeżych sesjach (autor planu: Opus 5.5, D-84 po aneksie 2026-10-14) · sugerowany effort: high dla E1–E3 i E5, medium dla E4

**Kolejność:** równolegle z PANEL_CODEX (decyzja Łukasza 2026-10-14) — PANEL_CODEX idzie w Codeksie,
HUMANIZACJA w Claude Code. Wspólny punkt to `core/panel/` (E1 rejestracja minimalna, E4) i wydania:
wydania po kolei, nigdy dwa naraz.

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Komenda na żądanie | GOTOWY DO STARTU | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | świeża sesja; effort high; z rejestracją minimalną w panelu i generatorze Codeksa (Aneks A6) |
| E2 | Wywiad i ustawienia | OCZEKUJE | — | dwa okna pytań, ton per rodzaj tekstu, profil stylu z logów PolyFlow (Aneks A1–A5) |
| E3 | Tryb ciągły | OCZEKUJE | — | |
| E4 | Panel i trzy narzędzia | OCZEKUJE | — | dotyka `core/panel/` — sprawdzić stan PANEL_CODEX przed startem |
| E5 | Pomiar i wydanie 3.1.0 | OCZEKUJE | — | wymaga zgody na publikację |

## Bramki manualne

- **Akceptacja planu HUMANIZACJA** · źródło: przygotowanie planu 2026-10-14 · **ROZSTRZYGNIĘTA 2026-10-14 — Łukasz: „Akceptuję plan, aktywny HUMANIZACJA”**
- **Próbka głosu w repozytorium czy lokalnie** · źródło: sekcja 9 PLAN.html · **ROZSTRZYGNIĘTA 2026-10-14 — Aneks A3: profil stylu globalnie w `~/.claude/relai/STYL.md`, poza repozytorium**
- **Zgoda na publikację wydania 3.1.0** · źródło: sekcja 9 PLAN.html · **OTWARTA** — przed E5

## Dziennik wdrożenia

- 2026-10-14 — Plan przygotowany po wywiadzie z Łukaszem (dwie rundy pytań): własna baza reguł z nakładką PL (wariant A), wywiad przy pierwszym `/relai-humanize`, zakresy trybu ciągłego wybiera użytkownik (dokumenty, czat, teksty na zewnątrz), sposób pokazywania do wyboru w wywiadzie, czat zawsze bez akceptacji, próbka głosu opcjonalna, praca równoległa z PANEL_CODEX. Czeka na akceptację.
- 2026-10-14 — Plan zaakceptowany i zamrożony z Aneksem A (ton zależny od rodzaju tekstu; profil stylu autora zamiast surowej próbki, opcjonalny, globalny, pierwszy z logów PolyFlow; wywiad w dwóch oknach; rejestracja minimalna komendy już w E1). Wygenerowano PROMPT_ETAP_1, E1 GOTOWY DO STARTU.
