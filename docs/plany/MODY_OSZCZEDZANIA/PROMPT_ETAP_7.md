# PROMPT_ETAP_7 — `relai-effort`: propozycja poziomu effort przed turą głównego czatu

Plan: MODY_OSZCZEDZANIA • Etap: **E7 z E10** • Wygenerowano: 2026-11-12 (autor: Opus 5.5, w rytuale „Na koniec” etapu 6) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli claude-code z dnia 2026-11-10). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś o przełączenie, zanim cokolwiek zapiszesz. Zalecany poziom `/effort`:
> `high` — mod zmienia poziom pracy głównego czatu przy każdej turze, a jego efektu nie da się
> odczytać z wejścia hooka (SONDY.md, sekcja 4), więc dowód wymaga przemyślanego pomiaru.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcja 2 „Effort Optimizer → `relai-effort`” i sekcja 7 | zdarzenia, sędzia Sonnet, cztery pytania, odpowiedź JSON, karta, tryb auto, rekord „effort”; wymagania wspólne modów RelAI |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — wiersz E7 tabeli etapów, ryzyka R5 i R9 | kryterium „przed turą pojawia się propozycja poziomu effort z powodem”; effort etapu RelAI nienadpisywany |
| `docs/plany/MODY_OSZCZEDZANIA/SONDY.md` — sekcje 4 i 5 | `turn.step` niesie `effort` sprzed nadpisania, `$.config.list()` nie ma wiersza `effort`; `prompt.submit.origin.kind` |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E6.md` | budżet hooka 10 s, karta `$.ui.ask` (2–4 przyciski), panel i przerysowanie, jak prowadzić pomiar z człowiekiem |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 oraz lekcje L-0321, L-0322, L-0329, L-0330, L-0331 | dowód negatywny, efekt, instrument, API modów; bez `cd`; przegląd przed pomiarem; test układu panelu |
| `docs/PULAPKI.md` — P-068, P-067, P-064, P-063, P-057 | budżet hooka i karta, `$.ui.ask` w teście, `turn.step` jako generator, `prompt.submit` vs `command.run`, klasyfikator trybu auto |
| `model-router/` — `hooks/register.tsx` (sekcje `session.start`, `prompt.submit`, `command.run`, panel), `hooks/gate.ts`, `.claude-plugin/plugin.json` | wzór modu RelAI po E6: bramka zgody i bliźniaka, rejestr, plik błędu, panel z przyciskami, komenda |
| `core/tools/sync-panel-core.js` (lista `PLUGINS`), `core/tools/release-map.json` (wpis `mod-model-router`), `.claude-plugin/marketplace.json` | gdzie nowy mod się rejestruje |
| `docs/ARTEFAKTY.md` | rejestr artefaktów: prompt sędziego effort (cztery pytania) wchodzi jako artefakt z wersją |

Pliki duże czytasz zakresami poniżej 100 linii: na maszynie działa `input-router` BenAI, który
streszcza większe odczyty. Polecenia Bash bez `cd` (L-0329); żadnego `node -e` ani heredoka
z backslashem — skrypt piszesz narzędziem Write.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33); Aneks A (bliźniak z `enabledPlugins`), Aneks B 2026-11-12
  (dotyczy routera, nie effort). Clean room: kodu BenAI nie otwierasz (R11).
- Sędzia effort 1:1 z BenAI: `$.model.complete` model Sonnet 5.5 (z listy modeli RelAI, nie na
  sztywno), `maxTokens` 120, effort `low`, limit 20 s; cztery pytania frameworka, odpowiedź
  `{"level","why"}` — decyzja Łukasza 2026-11-11 (specyfikacja, sekcja 2).
- Zmiana effort wyłącznie przez nadpisanie `effort` w `turn.step` głównego czatu: `$.config.set`
  wiersza effort na buildzie 2.1.321 nie istnieje (SONDY.md, sekcja 4 — rozstrzygnięte w E1).
- Effort wskazany w prompcie etapu RelAI (linia „Zalecany poziom `/effort`”) nie jest nadpisywany
  w trybie auto (R9; specyfikacja, sekcja 2).
- Ustawienie i akcja z przycisku albo karty, komenda tylko zapasowo (pamięć „UI zamiast komend”);
  panel wg `docs/zasoby/PANEL_RELAI/DESIGN.md`, z testem układu (L-0331).
- `relai-model-router` nie rusza effort głównego czatu (specyfikacja, sekcja 5) — granica między
  modami zostaje.
- Granica: Research — E8; porządki AUDYT_MODOW (w tym błąd układu `relai-input-router`
  `register.tsx:479`, odłożony 2026-11-12) — E9; migracja, pomiar wszystkich modów i wydanie —
  E10. Wersji żadnego modu nie podbijasz, nic nie wydajesz.

## Stan wyjściowy (co realnie zastajesz po E6)

Wersja RelAI 3.8.0 (wydana). W repo, niewydane: `relai-browser`, `relai-input-router`,
`relai-model-router` 0.1.0 (po E6 z kartą załogi `/relai-crew`, 102 testy). BenAI
`effort-optimizer@token-saving-mods` jest **włączony** (`~/.claude/settings.json`); na pomiar
wyłączasz go za zgodą Łukasza i prosisz o `/reload-plugins` (P-065). Kopia modu na żywo tylko
w `~/.claude/dev-mods/<sesja>/` po skillu `plugin-authoring` (L-0322).

```
model-router/                      wzór: hooks/{register.tsx, judge.ts, crew.ts, gate.ts, pane.ts, core/}, types/, .claude-plugin/
model-router/hooks/core/           kopie rdzenia z core/panel (sync-panel-core): savings-gates, savings-ledger, secret-scan, pricing…
core/panel/savings-gates.mjs       zgoda „Mody oszczędzania”, bliźniak BenAI, isHumanOrigin
core/panel/savings-ledger.mjs      rejestr ~/.claude/relai/oszczednosci/rejestr/<data>-<sesja>.jsonl
core/tools/sync-panel-core.js      PLUGINS: 7 celów (panel, progress, cache-keeper, mods, browser, input-router, model-router)
core/tools/release-map.json        wpisy mod-*; .claude-plugin/marketplace.json — wpisy modów
docs/ARTEFAKTY.md                  rejestr artefaktów (prompt sędziego effort jeszcze go nie ma)
```

**Czego jeszcze nie ma:** folderu modu `relai-effort` (nazwa folderu wg wzoru pozostałych:
`effort/`), sędziego effort i jego promptu jako artefaktu, karty propozycji przed turą (przełącz /
przełącz i od teraz automatycznie / zostaw), trybu auto, rozpoznania effort z promptu etapu RelAI,
rekordu „effort” w rejestrze (zdarzenie, bez tokenów), panelu modu. **Nie zmierzono:** czy
nadpisanie `effort` w `turn.step` głównego czatu działa (efekt niewidoczny w wejściu hooka — dowód
kosztem albo długością myślenia w `turn.step.usage`), ile trwa sędzia Sonnet na żywo (R5: do 20 s),
czy karta `$.ui.ask` w `prompt.submit` mieści się w budżecie hooka (P-068 mówi, że wywołanie `$`
w toku się nie liczy — sprawdź na tym zdarzeniu).

**Liczby wyjściowe testów** (po E6, FAKT 2026-11-12): guardrails 33, process 430, panel (rdzeń)
254, adaptery Codex 28 / Cursor 10; mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper`
206, `browser` 28, `input-router` 79, `model-router` 102; `sync-panel-core --check` zgodne
(23 pliki, 16 ikon, 7 celów).

Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie): 3, 4, 5, 13. Ryzyka etapu: R5, R9, R11
(plan), C1 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E7/`.** Wszystko tymczasowe
> — skrypty pomiarowe, materiał testowy, wyjścia narzędzi — powstaje tam. Artefakt spoza projektu
> (mod-sonda i kopia w `~/.claude/dev-mods/`, kopie z pomiaru) wpisujesz do wpisu dziennika
> **z nazwy**.

1. **Sonda przed kodem** (zasada 13, L-0321), dwa przebiegi, przy wyłączonym BenAI
   `effort-optimizer` (bramka): mod-sonda nadpisuje `effort` w `turn.step` głównego czatu
   (generator, P-063) na skrajnych poziomach (`low` / `high`) dla tej samej prośby i zapisuje do
   pliku `turn.step.usage` oraz długość odpowiedzi; drugi hook pokazuje kartę `$.ui.ask`
   w `prompt.submit` i zapisuje czas. Wynik do `POMIAR_E7.md`. Nadpisanie nie daje mierzalnej
   różnicy → zatrzymaj się i zapytaj (aneks: tryb tylko sugestii / odnoga).
2. **Czysta logika** w `effort/hooks/` (np. `judge.ts`): prompt sędziego z czterema pytaniami
   (tekst ≤ 4000 znaków + ostatnia odpowiedź ≤ 600 + bieżący poziom; `<task>` jako dane), parser
   biorący ostatni poprawny obiekt JSON (nie zachłanny regex), rozpoznanie effort z promptu etapu
   RelAI, decyzja: keep / karta / auto. Testy obok kodu.
3. **`effort/hooks/register.tsx`**: `prompt.submit` (origin człowieka, bez tekstu od `/`, P-063),
   bramka jak w `model-router` (zgoda, bliźniak BenAI, skaner sekretów przed sędzią), karta
   `$.ui.ask` z trzema opcjami, tryb auto z przycisku panelu, nadpisanie w `turn.step` głównego
   czatu (nigdy w subagencie), rekord „effort” w rejestrze, plik błędu, panel i komenda zapasowa.
4. **Rejestracja modu**: `effort/.claude-plugin/plugin.json` (wersja 0.1.0, opis), `effort/types/`,
   ósmy cel w `core/tools/sync-panel-core.js` (tylko pliki rdzenia, które mod importuje), wpis
   w `core/tools/release-map.json` i `.claude-plugin/marketplace.json` (opis zgodny z `plugin.json`).
5. **Artefakt**: prompt sędziego (cztery pytania) jako plik w `effort/` i wpis w `docs/ARTEFAKTY.md`
   (wersja, co i po co).
6. **Przegląd kodu przed pomiarem** (L-0330): `typescript-reviewer` na zmianie, CRITICAL i HIGH
   naprawione z testem, zanim ruszy bramka pomiaru.
7. **Pomiar na żywo** (zasada 4): trzy prośby — rozmowa („dzięki”), zadanie zwykłe, zadanie
   z ukrytym kosztem błędu — karta z poziomem i powodem przed turą; w trybie auto bez karty; prompt
   z linią „Zalecany poziom `/effort`” etapu RelAI → effort bez zmian. Bramka manualna: BenAI
   `effort-optimizer` wyłączony za zgodą Łukasza, `/reload-plugins`, kartę klika człowiek (L-0289);
   po pomiarze BenAI włączony z powrotem.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [ ] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [ ] Sonda nadpisania effort zapisana (dwa przebiegi) w `POMIAR_E7.md`, zanim powstał kod;
      różnica `low`/`high` widoczna w liczbach (`turn.step.usage`) albo etap zatrzymany pytaniem.
- [ ] Dowód negatywny (zasada 3): subagent → 0 wywołań sędziego i effort bez zmian; prompt etapu
      RelAI z linią effort → tryb auto nie nadpisuje; tekst od `/`, powiadomienie systemowe i sesja
      bez człowieka → bez karty; bliźniak BenAI włączony albo brak zgody → mod uśpiony; mutacja
      każdego z tych warunków czerwieni test.
- [ ] Skaner: prośba z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań sędziego, effort bez
      zmian. Awaria sędziego (limit, nie-JSON, poziom spoza listy) → effort bez zmian, powód w pliku.
- [ ] `plugin validate` i `plugin test` nowego modu zielone; testy panelu z układem w każdym progu
      szerokości (L-0331); pozostałe mody, rdzeń, `process` i adaptery bez spadku liczby testów;
      walidator adapterów zielony; `sync-panel-core --check` zgodne (8 celów).
- [ ] Przegląd kodu przed pomiarem: wynik i naprawione pozycje we wpisie dziennika.
- [ ] Pomiar na żywo w `POMIAR_E7.md`: karta z poziomem i powodem przed turą (trzy prośby), tryb
      auto bez karty, prompt etapu bez zmiany effort; czas sędziego na żywo; rekordy „effort”
      w rejestrze zgodne z `savingsView`.
- [ ] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E6 (0 / 42);
      brak nowych zależności npm; `git grep --untracked` po wzorcu klucza w zmienionych plikach → 0
      (z kontrolą pozytywną).
- [ ] Granica: `git status --short` pokazuje wyłącznie `effort/**`, `core/tools/sync-panel-core.js`,
      `core/tools/release-map.json`, `.claude-plugin/marketplace.json`, `docs/ARTEFAKTY.md`
      i dokumenty rytuału.
- [ ] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E7/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (mod-sonda i kopia w dev-mods, kopie z pomiaru) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy jest punkt sondy: jeśli nadpisanie `effort` w `turn.step` nie daje mierzalnej różnicy,
mod nie ma czym działać w trybie auto — zatrzymaj się i zapytaj, zamiast budować kartę, która
niczego nie zmienia.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E7 → `ZREALIZOWANY <data>`, E8 → `GOTOWY DO STARTU`,
   linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E8 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E7/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md` (+ lekcje do `docs/LEKCJE.md` i odświeżony
   destylat, + przegląd ryzyk R5, R9), podpis `Autor: RelAI (Opus 5.5) + Lukasz`; pułapki silnika
   do `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` (wyłączenie BenAI `effort-optimizer`, kliknięcie karty) —
   `OTWARTA` albo `ROZSTRZYGNIĘTA <data> — <jak>`.
4. `docs/STATE.md` (zdania o planie MODY_OSZCZEDZANIA) i linia „Aktywny plan” w `CLAUDE.md`;
   `docs/ARTEFAKTY.md` z punktu 5 zakresu.
5. **Wygenerowanie `PROMPT_ETAP_8.md`** — z wiersza E8 w `PLAN.html` i sekcji 6 specyfikacji
   (Research Router), z realnego stanu repo po E7 i lekcji z E7.
6. Commit — propozycja, conventional message po angielsku; bez `git push`.
