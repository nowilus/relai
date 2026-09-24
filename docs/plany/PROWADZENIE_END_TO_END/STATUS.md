# STATUS — plan PROWADZENIE_END_TO_END

Plan: [PLAN.html](PLAN.html) · Rejestr: [REJESTR.md](REJESTR.md) · Utworzony: 2026-09-24 · Status: **ZAAKCEPTOWANY 2026-09-24** (zamrożony, D-33) · Model wykonawczy etapów: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, lista claude-code z dnia 2026-09-24, poziom `/effort` per etap w tabeli · w Claude Code

Cel: RelAI prowadzi vibe codera od pomysłu po utrzymanie bez pilnowania procesu — spójne dokumenty,
start w budżecie, skille w progresywnym ujawnianiu, zasady skrojone pod model wykonawczy, prostsze
pierwsze 30 minut i procedury dla debugowania, bezpieczeństwa zależności i pierwszego deployu.
Rejestr: **56 pozycji**, 47 przypisanych do etapów, 9 odrzuconych z powodem, 0 bez przypisania (FAKT).
Szacunek: 7 etapów, 10–13 sesji (SZACUNEK). Poprzednik: [PIERWSI_UZYTKOWNICY](../../archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md)
(CZĘŚCIOWO ZREALIZOWANY 2026-09-24).

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Szybkie poprawki i wydanie 2.3.1 | ZREALIZOWANY 2026-09-24 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | `/effort medium`; 9 pozycji rejestru; wydanie 2.3.1 (tag `v2.3.1` na commicie zamykającym E1) |
| E2 | Lżejszy start sesji | ZREALIZOWANY 2026-09-24 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `/effort high`; 6 pozycji + Aneks A; wydanie 2.4.0 (tag `v2.4.0`) |
| E3 | Skille w progresywnym ujawnianiu | ZREALIZOWANY 2026-09-24 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `/effort high`; 4 pozycje; wydanie 2.5.0 (tag `v2.5.0`) |
| E4 | Zasady skrojone pod model | GOTOWY DO STARTU | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | `/effort high`; 13 pozycji; nakładka openai zależy od odświeżenia listy Codeksa |
| E5 | Pierwsze 30 minut | OCZEKUJE | — | `/effort medium`; 8 pozycji; w tym render demo z PIERWSI_UZYTKOWNICY |
| E6 | Krańce drogi: debug, bezpieczeństwo, deploy | OCZEKUJE | — | `/effort high`; 3 pozycje |
| E7 | Jakość pracy solo i załogi | OCZEKUJE | — | `/effort high`; 4 pozycje; ostatni etap — kończy go sekwencja zamknięcia planu (D-36) |

## Bramki manualne

- **Akceptacja planu** · źródło: wpis dziennika 2026-09-24 · ROZSTRZYGNIĘTA 2026-09-24 — Łukasz zaakceptował plan bez poprawek; razem z akceptacją zamrożona D-88
- **Haiku poza kryterium wyzwalania skilli** · źródło: wpis dziennika 2026-09-24 (E1) · ROZSTRZYGNIĘTA 2026-09-24 — Łukasz: RelAI celuje w modele flagowe; haiku mierzony i raportowany, jego spadek nie cofa zmian; zamrożona jako D-90
- **Odświeżenie listy modeli Codeksa (przydział modeli poza Claude Code)** · źródło: wpis dziennika 2026-09-24 · **OTWARTA** — przed startem E4
- **Restart aplikacji desktopowej, żeby ładowała 2.4.0** · źródło: wpis dziennika 2026-09-24 (E2) · ROZSTRZYGNIĘTA 2026-09-24 — sesja E3 w aplikacji ładowała skill z cache'u 2.4.0
- **Restart aplikacji desktopowej, żeby ładowała 2.5.0** · źródło: wpis dziennika 2026-09-24 (E3) · **OTWARTA**

## Dziennik wdrożenia

- 2026-09-24 — plan utworzony ze scalenia trzech raportów sesji po dwóch rundach wywiadu (jeden plan, wydanie po etapie, uczciwe minimum dla Cursora i Codeksa, rotacja wg wagi całkowitej, nowe procedury jako ostatnie etapy); PIERWSI_UZYTKOWNICY zamknięty tego samego dnia.
- 2026-09-24 — plan zaakceptowany i zamrożony bez poprawek (D-33); zamrożona D-88 (cel rotacji na wadze całkowitej); PROMPT_ETAP_1.md wygenerowany, E1 gotowy do startu.
- 2026-09-24 — E1 zrealizowany: 9/9 pozycji rejestru, 11/11 punktów weryfikacji, wydanie 2.3.1; pomiar wyzwalania bez spadku na opus i sonnet (haiku poza kryterium — decyzja człowieka); E2 gotowy do startu.
- 2026-09-24 — Aneks A: zakres E2 poszerzony o zdania z celem rotacji w `SPEC_USTAWIENIA.md` i w `relai-core/SKILL.md` obu adapterów (grep po starym brzmieniu trafił poza zakres; decyzja człowieka).
- 2026-09-24 — E2 zrealizowany: 6/6 pozycji rejestru, 11/11 punktów weryfikacji (punkt dat w brzmieniu „nie wcześniejszy" — decyzja człowieka), wydanie 2.4.0; dziennik 166,4 → 84,4 KB, ryzyka 24,2 → 5,3 KB, STATE 319 → 108 linii, budżet startu liczy skill i rytuał (123,7 KB przy nowym budżecie 140 KB); E3 gotowy do startu.
- 2026-09-24 — E3 zrealizowany: 4/4 pozycje rejestru, 11/11 punktów weryfikacji, wydanie 2.5.0; `relai-core` 968 → 491 linii (+6 plików doczytywanych), `relai-planning` 575 → 455 (+2), skill startu 66,1 → 28,6 KB, budżet startu 140 → 100 KB (decyzja człowieka), negacje w pakiecie `relai-core` 296 → 237; wyzwalanie bez spadku na Opus 5.5 i Sonnet 5; E4 gotowy do startu po bramce listy modeli Codeksa.

RelAI (Opus 5.5) + Lukasz
