# PROMPT_ETAP_4 — Input Router: konektory MCP i panel przekazań

Plan: MODY_OSZCZEDZANIA • Etap: **E4 z E10** • Wygenerowano: 2026-11-11 (autor: Opus 5.5, w rytuale „Na koniec” E3) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** wykonuj wyłącznie na **Opus 5.5** (lista modeli claude-code z dnia
> 2026-11-10); inny model → zatrzymaj się i poproś o przełączenie, zanim zapiszesz cokolwiek.
> Zalecany poziom: `/effort high` — mod zacznie podmieniać wyniki konektorów MCP, których kształtu
> silnika jeszcze nie zmierzono, a pomyłka w liście nietykanych zepsuje przeglądarkę albo sesje.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcja 1, wiersze „Konektory”, „Konektory nietykane”, „Ominięcie”, „Komendy”, „Panel”, „Awaria” | wartości progów konektorów, lista nietykanych, wygląd i zachowanie panelu |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E3.md` | co zmierzono w E3 (notatki, pamięć, PDF, `persistedOutputPath`) i jak prowadzić pomiar |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 oraz lekcje L-0321 … L-0324 | dowód negatywny, efekt, instrument, API modów, nowa droga do silnika, dev-mods, materiał pomiaru |
| `docs/PULAPKI.md` — P-065, P-064, P-063, P-057, P-017 | wynik Bash ucięty w hooku, `$.ui.log`, `turn.step`, klasyfikator trybu auto, `ui.render` i `next` |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | wygląd panelu przekazań (karty, kolory, linie gasnące) |
| `input-router/hooks/register.tsx`, `route.ts`, `notes.ts` | kod E3: `handOff`, pamięć, rekord, bramki — konektory dokładasz obok, nie od nowa |
| `browser/hooks/register.tsx` — hook `ui.render` z `Pane` | wzór panelu modu oszczędzania |

Pliki duże czytasz zakresami poniżej 100 linii: na maszynie działa `input-router` BenAI, który
streszcza większe odczyty (wyłącza się go dopiero na pomiar — bramka niżej). Odczyty pod
`.claude/relai/**` i `docs/*.md` przechodzą dosłownie także przez mod RelAI.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33), Aneks A (bliźniak z `enabledPlugins`). Clean room: kodu BenAI
  nie otwierasz; pracujesz ze specyfikacji i z próby na żywo (zasada 13).
- Konektory w tym samym modzie `relai-input-router` (`input-router/`), wersja w repo 0.1.0 bez
  podbijania — wydanie wyłącznie w E10.
- Pliki procesu i instrukcji, pliki sekretów, skaner przed Haiku, pamięć notatek, rekord z `helper`
  i `measured`, zgoda projektu, `origin.kind` — jak w E3 (`POMIAR_E3.md`, wpis dziennika E3).
- Wyjście Bash z `persistedOutputPath` przechodzi bez notatek (P-065) — nie wracasz do tego.
- Konektory nietykane: lista ze specyfikacji **plus konektory RelAI**; konektor spoza listy, którego
  wynik nie jest tekstem, przechodzi.
- Ustawienie i akcja z przycisku w panelu, komenda tylko zapasowo (pamięć „UI zamiast komend”):
  `full` i włączanie/wyłączanie konektorów mają przyciski.
- Granica: Model Router to E5, `/relai-crew` E6; cięcie linii PDF (`-layout`) i kasowanie
  przeterminowanych kopii przez `clean-work.js` — E10; wyciszenie hand-backu `describe` — E10.

## Stan wyjściowy (co realnie zastajesz po E3)

`relai-input-router` 0.1.0 jest w repo i nie jest wydany; nie jest też zainstalowany — działa na żywo
tylko jako kopia w `~/.claude/dev-mods/<sesja>/` po skillu `plugin-authoring`.

```
input-router/hooks/route.ts      progi, przepustki (fileGuard, isPlainArg, fileArgsOf), Bash, PDF, kawałki
input-router/hooks/notes.ts      prompt Haiku, wynik dla Claude, pamięć, kopie, rekord, komenda
input-router/hooks/gate.ts       decide: bliźniak, projekt, zgoda, człowiek, przełącznik plików
input-router/hooks/register.tsx  tool.call dla Read i Bash, handOff, fileText, routePdf
input-router/hooks/*.test.ts     47 testów (register 24, route 23)
input-router/types/index.d.ts    stan: handoffs (ostatnie 50), idle
core/tools/sync-panel-core.js    6 celów, input-router/hooks/core: savings-gates, savings-ledger, secret-scan
~/.claude/relai/oszczednosci/    rejestr/ (rekordy relai-browser i relai-input-router); input-router/ (kopie, notatki — po pomiarze E3 puste)
```

**Czego jeszcze nie ma:** obsługi wyników `mcp__*` (obcinanie nieużywanych pól, cięcie wartości
tekstowych, notatki Haiku w kawałkach), listy konektorów nietykanych, przełącznika `connector`
w komendzie (dziś odpowiada „later version”), panelu „przekazania” z kartami i przyciskami.
Kształtu wyniku MCP w hooku `tool.call` **nie zmierzono** — sonda przed kodem.

**Liczby wyjściowe testów** (po E3, FAKT 2026-11-11): guardrails 33, process 430, panel (rdzeń) 254;
mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28, `input-router` 47;
`sync-panel-core --check` zgodne (23 pliki, 16 ikon, 6 celów).

Zasady do doczytania: 3, 4, 5, 13. Ryzyka etapu: R6, R8 (plan), C1, C10 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E4/`.** Wszystko tymczasowe
> powstaje tam — ale materiał, który mod ma przetwarzać, kładziesz **poza** `.claude/relai/`
> (L-0323), np. w scratchpadzie sesji. Artefakt spoza projektu (kopia w `~/.claude/dev-mods/`)
> wpisujesz do wpisu dziennika **z nazwy**.

1. **Sonda kształtu wyniku MCP** (zasada 13, L-0321): kopia modu z hookiem zapisującym do pliku
   kształt `ran.result` dla dwóch różnych konektorów (tekst JSON i lista bloków), dwa przebiegi;
   wynik do `POMIAR_E4.md` przed kodem.
2. **Czysta logika** `input-router/hooks/connectors.ts`: < 16 000 znaków dosłownie; obcięcie
   nieużywanych pól; ≤ 8000 po obcięciu → bez Haiku; wartości tekstowe cięte do 1200 znaków, gdy
   cięcie zabiera ≤ 20%; potem Haiku w kawałkach 128 000, najwyżej 6, `maxTokens` 8000, prompt
   ≤ 150 000; lista nietykanych (specyfikacja + konektory RelAI). Testy obok kodu.
3. **`register.tsx`**: `tool.call` dla `mcp__*` przez `handOff` (pamięć, skaner, rekord); awaria →
   zwykły wynik; `/relai-input-router off|on connector`.
4. **Panel przekazań** (`input-router/hooks/pane.tsx` albo w `register.tsx`, gdy walidator nie
   przepuści `$` przez import — P-017): karta na przekazanie (narzędzie, ścieżka, tokeny przed/po,
   koszt Haiku, stan, przyciski notatek i pełnego wyniku), przyciski `full` i przełączników; wygląd
   wg `DESIGN.md`; < 144 kolumn — wariant wąski albo czekanie, jak w specyfikacji.
5. **Typy stanu** w `input-router/types/index.d.ts` dla nowych wartości panelu; `plugin.json`
   (opis) bez zmiany wersji.
6. **Pomiar na żywo** (zasada 4, L-0322): kopia w dev-mods po skillu `plugin-authoring`; duży wynik
   konektora → notatki albo obcięcie, mały → dosłownie, konektor nietykany → dosłownie; karty w
   panelu klika człowiek (L-0289); rekordy zgodne z `savingsView`. Bramka manualna:
   `input-router@token-saving-mods` wyłączony na czas pomiaru za zgodą Łukasza, potem `/reload-plugins`
   (P-065) i włączenie z powrotem.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Sonda MCP zapisana (dwa konektory, dwa przebiegi) w `POMIAR_E4.md`, zanim powstał kod.
- [x] Dowód negatywny (zasada 3): konektor z listy nietykanych (`mcp__Claude_Browser__*`, `mcp__ccd_*`)
      i wynik < 16 000 znaków → 0 wywołań Haiku, wynik bez zmian; duży wynik zwykłego konektora →
      dokładnie 1 ścieżka (obcięcie albo Haiku); mutacja listy nietykanych czerwieni test.
- [x] Skaner: duży wynik konektora z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań Haiku i wynik
      dosłowny; bez klucza → 1.
- [x] `plugin validate input-router` ✔ i `plugin test input-router` zielony; pozostałe mody i rdzeń
      bez spadku liczby testów; `sync-panel-core --check` zgodne.
- [ ] Pomiar na żywo w `POMIAR_E4.md`: konektor duży, mały i nietykany; karta panelu kliknięta przez
      człowieka (notatki, pełny wynik, `full`); rekordy zgodne z `savingsView` co do tokena.
      *(2026-11-11: pomiar bez człowieka i zgodność z `savingsView` przeszły; kliknięcia karty nie
      było — Łukasz zamknął E4 mimo to, sprawdzenie na żywo przechodzi do E10. Punkt zostaje pusty.)*
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E3 (0 / 42);
      brak nowych zależności npm; `git grep --untracked` po wzorcu klucza w zmienionych plikach → 0.
- [x] Granica: `git status --short` pokazuje wyłącznie `input-router/**`, nowe pliki `core/panel/**`
      (jeśli trzeba), `core/tools/sync-panel-core.js` i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E4/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (kopie w dev-mods, kopie z pomiaru) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to lista nietykanych: podmiana wyniku `Claude_Browser` albo `ccd_session` zepsuje
przeglądarkę i sesje. Taki rozjazd → zatrzymaj się i pokaż przypadek.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E4 → `ZREALIZOWANY <data>`, E5 → `GOTOWY DO STARTU`,
   jedna linia w dzienniku wdrożenia; link przy E5 po kroku 5.
1a. Katalog roboczy etapu — raport, „tak”, kasowanie; liczby do wpisu z kroku 2, artefakty spoza
   katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj ryzyka R6, R8, C1, C10; lekcje → `docs/LEKCJE.md`; pułapki → `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — nierozstrzygnięte pozycje „Do zrobienia przez człowieka” jako `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu; linia „Aktywny plan” w `CLAUDE.md`.
5. **Wygeneruj `PROMPT_ETAP_5.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E5 w `PLAN.html`, ze specyfikacji (sekcja 5, Model Router),
   z realnego stanu repo i z lekcji E4.
6. Commit — propozycja, jeden commit etapu (conventional, EN); bez `git push`. Wydanie dopiero w E10.
