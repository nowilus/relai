# STATUS — plan RELAI_MODS

[PLAN.html](PLAN.html) · utworzony 2026-10-23 · **ZAAKCEPTOWANY 2026-10-23** · Opus (D-85) w Claude Code

Wejście planu: [BRIEF.md](BRIEF.md) i [makieta.html](makieta.html) (wariant C), kopie z `Desktop/mods-panel` z 2026-10-23.

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Spike na Windows: przełącznik i przeładowanie z moda | ZREALIZOWANY 2026-10-23 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wynik: plan B — CLI z moda działa, przeładowanie tylko wpisane `/reload-plugins` (P-052) |
| E2 | Inwentarz: pełna lista i szczegóły z dysku | ZREALIZOWANY 2026-10-23 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | 28 testów; na żywo 12/14 włączone · 7 hooków; punkt 4 w brzmieniu zmienionym decyzją Łukasza (L-0254) |
| E3 | Kokpit na desktopie, jasny i ciemny | ZREALIZOWANY 2026-10-23 | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | 60 testów; akordeon w grupach z nagłówkami Kalam (runda 2, przyjęty); Aneksy B i C; sygnał przeładowania z `plugin.register` (P-053) |
| E4 | Terminal, wąski panel i dwa czaty | GOTOWY DO STARTU | [PROMPT_ETAP_4.md](PROMPT_ETAP_4.md) | pomiar na żywo przy 80 kolumnach |
| E5 | Wydanie relai-mods 0.1.0 | OCZEKUJE | — | publikacja po osobnej zgodzie |

## Bramki manualne

- **Plan B, gdy spike E1 wykaże, że CLI z moda nie działa żadną drogą** (tylko podgląd albo zapis `enabledPlugins`) · blokuje: E3, tylko przy złym wyniku E1 · **ROZSTRZYGNIĘTA 2026-10-23 — nie zaszła: CLI z moda działa (E1, P-052); przeładowanie idzie planem B z briefu**
- **Akceptacja wyglądu kokpitu E3 (zrzuty w jasnym i ciemnym wyglądzie)** · blokuje: zamknięcie E3 · **ROZSTRZYGNIĘTA 2026-10-23 — zaakceptowana po dwóch rundach: runda 1 cztery układy w modzie (A grupy, B kafle, C lista, D akordeon, zrzuty `docs/zasoby/PANEL_RELAI/zrzuty/RELAI_MODS_E3_r1_*`), wybór Łukasza „D z grupami z A, grupy z większą ekspozycją”; runda 2 akordeon z nagłówkami grup Kalamem 26 px, zaakceptowany w obu wyglądach (`RELAI_MODS_E3_r2_ciemny.png`, `_r2_jasny.png`)**
- **Wersja i etykieta „early access” w marketplace** (propozycja 0.1.0) · blokuje: E5 · **OTWARTA**
- **Termin wydania wspólny z planem BEZPIECZENSTWO (3.3.0) albo osobny** · blokuje: E5 · **OTWARTA**
- **Zgoda na publikację: tag `relai-mods-v0.1.0` i push** · blokuje: zamknięcie E5 · **OTWARTA**

## Dziennik wdrożenia

- 2026-10-23 — plan utworzony z briefu i makiety wariantu C (decyzje briefu przyjęte bez ponownego pytania); czeka na akceptację.
- 2026-10-23 — plan przeniesiony z worktree `relai-mods-plan-3c68a3` do `main`; przed akceptacją poprawiony o pięć rozbieżności z kodem i maszyną (`relai-progress` 0.6.0; `security-guidance` w scope `local` projektu Parkly zamiast „wyłączony w user”; cel spike'u E1 `filetree`; nowy przypadek „pluginu nie ma w `enabledPlugins`”; hooki liczone jako 7 komend w 5 zdarzeniach, kryterium „tyle, ile w plikach”; `docs/KOMENDY.md` w punktach styku i E5).
- 2026-10-23 — plan zaakceptowany przez Łukasza z tymi poprawkami; E1 gotowy do startu, wygenerowany `PROMPT_ETAP_1.md`.
- 2026-10-23 — E1 rozpoczęty
- 2026-10-23 — E1 zrealizowany: szkielet `mods/` 0.0.1, pomiary (a)–(f) na żywo, wynik plan B (przeładowanie wpisane ręcznie), P-052, L-0253; `filetree` i `settings.json` jak przed etapem; wygenerowany `PROMPT_ETAP_2.md`.
- 2026-10-23 — Aneks A (zatwierdzony przez Łukasza): stan i hooki z plików zamiast `$.settings.read()`, plugin innego projektu przełączany z `cwd` bez kłódki, przeładowanie wpisane ręcznie na desktopie (plan B).
- 2026-10-23 — E2 rozpoczęty
- 2026-10-23 — E2 zrealizowany: inwentarz czterech źródeł w czystej logice (`inventory.ts`, 22 nowe testy, razem 28), pełna lista w panelu, sonda spike'u usunięta; na żywo 12/14 i 7 hooków zgodne z plikami; wygenerowany `PROMPT_ETAP_3.md`.
- 2026-10-23 — E3 rozpoczęty
- 2026-10-23 — Aneks B (zatwierdzony przez Łukasza na starcie E3): cel kopii rdzenia `mods/hooks/core` w `sync-panel-core.js` przechodzi z E5 do E3; marketplace, `network-calls.js`, `KOMENDY.md`, strona i wersja zostają w E5. Binarka CLI zostaje `claude` z PATH z wersją w szczegółach.
- 2026-10-23 — Aneks C (zatwierdzony przez Łukasza w E3): `Svg` w `Button` silnik odrzuca (P-051), więc przełącznik na desktopie to rysunek stanu `Svg` i obok przycisk `plain` ze słowem „Włącz” / „Wyłącz”.
- 2026-10-23 — Aneks D (decyzja Łukasza przy akceptacji wyglądu E3): kokpit to akordeon w grupach Mody / Pluginy / Hooki z nagłówkami Kalam; szczegóły pod wierszem w każdej szerokości, próg „obok listy od 100 kolumn” znika (sekcje 5 i 8).
- 2026-10-23 — E3 zrealizowany: kokpit w `cockpit.ts` / `look.ts` / `views.tsx` / `register.tsx`, 60 testów, punkty 6–8 na żywo (stan „załadowany” z migawki przy `session.start` i `plugin.register`, P-053), dwie rundy wyglądu zakończone akordeonem w grupach; wygenerowany `PROMPT_ETAP_4.md`.
