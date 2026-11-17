# PROMPT_ETAP_7 — `relai-effort`: propozycja poziomu effort przed turą głównego czatu

Plan: MODY_OSZCZEDZANIA • Etap: **E7 z E10** • Wygenerowano: 2026-11-12 (autor: Opus 5.5, w rytuale „Na koniec” etapu 6; dostosowany do Aneksu C tego dnia) • Wykonawca: **gpt-6.1-terra w Codeksie** (Aneks C; przegląd i poprawki gpt-6.1-sol; Claude — bramka) — effort `high`

> **Kontrola modelu:** ten etap wykonuje model klasy **balanced** w Codeksie: **gpt-6.1-terra**
> (lista modeli codex z dnia 2026-11-10), uruchomiony przez Claude poleceniem
> `node core/process/crew.js run --runtime codex --model gpt-6.1-terra` (Aneks C; nigdy kopią
> z `.claude/relai/tools/`). Sesja na innym modelu i bez pliku zadania z nakładką Aneksu C —
> zatrzymaj się. Effort `high` (z `~/.codex/config.toml`) — mod zmienia poziom pracy głównego
> czatu przy każdej turze, a jego efektu nie widać w wejściu hooka (SONDY.md, sekcja 4).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/ANEKS_C_WYKONANIE_CODEX.md` | kto co robi w tym etapie: Codex kod, testy i rytuał 1–5; Claude bramka, katalog roboczy i commit; sonda i pomiar na żywo — E10 |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcja 2 „Effort Optimizer → `relai-effort`” i sekcja 7 | zdarzenia, sędzia Sonnet, cztery pytania, odpowiedź JSON, karta, tryb auto, rekord „effort”; wymagania wspólne modów RelAI |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — wiersz E7 tabeli etapów, ryzyka R5 i R9 | kryterium „przed turą pojawia się propozycja poziomu effort z powodem”; effort etapu RelAI nienadpisywany |
| `docs/plany/MODY_OSZCZEDZANIA/SONDY.md` — sekcje 4 i 5 | `turn.step` niesie `effort` sprzed nadpisania, `$.config.list()` nie ma wiersza `effort`; `prompt.submit.origin.kind` |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E6.md` | budżet hooka 10 s, karta `$.ui.ask` (2–4 przyciski), panel i przerysowanie, jak prowadzić pomiar z człowiekiem |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 13 oraz lekcje L-0321, L-0322, L-0329, L-0330, L-0331 | dowód negatywny, efekt, instrument, API modów; bez `cd`; przegląd przed pomiarem; test układu panelu |
| `docs/PULAPKI.md` — P-068, P-067, P-064, P-063, P-057 | budżet hooka i karta, `$.ui.ask` w teście, `turn.step` jako generator, `prompt.submit` vs `command.run`, klasyfikator trybu auto |
| `model-router/` — `hooks/register.tsx` (sekcje `session.start`, `prompt.submit`, `command.run`, panel), `hooks/gate.ts`, `.claude-plugin/plugin.json` | wzór modu RelAI po E6: bramka zgody i bliźniaka, rejestr, plik błędu, panel z przyciskami, komenda |
| `core/tools/sync-panel-core.js` (lista `PLUGINS`), `core/tools/release-map.json` (wpis `mod-model-router`), `.claude-plugin/marketplace.json` | gdzie nowy mod się rejestruje |
| `docs/ARTEFAKTY.md` | rejestr artefaktów: prompt sędziego effort (cztery pytania) wchodzi jako artefakt z wersją |

Polecenia powłoki bez `cd` (L-0329); żadnego `node -e` ani heredoka z backslashem — skrypt
piszesz do pliku i uruchamiasz z pliku; tekst z backslashem albo backtickiem zmieniasz edycją
pliku, nie podmianą w powłoce.

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
`effort-optimizer@token-saving-mods` jest **włączony** (`~/.claude/settings.json`) i zostaje
włączony: w tym etapie nie ma pomiaru na żywo (Aneks C — pomiar w E10). Testy modu:
`claude plugin test effort` (binarka Claude Code; gdy nie działa w sandboksie Codeksa — napisz to
w raporcie, bramka Claude je uruchomi).

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
rekordu „effort” w rejestrze (zdarzenie, bez tokenów), panelu modu. **Nie zmierzono (pomiar
w E10, Aneks C, ryzyko AC1):** czy nadpisanie `effort` w `turn.step` głównego czatu działa (efekt
niewidoczny w wejściu hooka), ile trwa sędzia Sonnet na żywo (R5: do 20 s), czy karta `$.ui.ask`
w `prompt.submit` mieści się w budżecie hooka (P-068: wywołanie `$` w toku się nie liczy). Kod
trzyma decyzję (sędzia, karta) osobno od wykonania (nadpisanie w `turn.step`), żeby E10 mógł
wyłączyć samo wykonanie, gdyby nie działało.

**Liczby wyjściowe testów** (po E6, FAKT 2026-11-12): guardrails 33, process 430, panel (rdzeń)
254, adaptery Codex 28 / Cursor 10; mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper`
206, `browser` 28, `input-router` 79, `model-router` 102; `sync-panel-core --check` zgodne
(23 pliki, 16 ikon, 7 celów).

Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie): 3, 4, 5, 13. Ryzyka etapu: R5, R9, R11
(plan), C1 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E7/`.** Wszystko tymczasowe
> — skrypty, materiał testowy, wyjścia narzędzi, skrypt mutacji — powstaje tam. Artefakt spoza
> projektu wpisujesz do wpisu dziennika **z nazwy**.

1. **Sonda przed kodem — przeniesiona do E10** (Aneks C, ryzyko AC1). W tym etapie: przegląd typów
   silnika (`turn.step`, `prompt.submit`, `$.ui.ask`) w `model-router/.claude-plugin/types/`
   albo w pliku typów skilla `plugin-authoring`, jeśli jest dostępny; ustalenia do raportu.
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
6. **Mutacje** (zasada 3): skrypt w katalogu roboczym podmienia po kolei warunki z dowodu
   negatywnego (subagent, effort z promptu etapu, `/`, powiadomienie, brak człowieka, bliźniak,
   brak zgody, skaner) i uruchamia testy; wynik `zabite / wszystkie` do raportu.
7. **Przegląd kodu i pomiar na żywo — poza tobą** (Aneks C): przegląd robi `gpt-6.1-sol`
   (`crew.js review`) w bramce Claude; pomiar na żywo (trzy prośby: rozmowa, zadanie zwykłe,
   zadanie z ukrytym kosztem błędu; tryb auto; prompt etapu RelAI z linią effort) — E10.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Wykonawca to gpt-6.1-terra w Codeksie z pliku zadania z nakładką Aneksu C; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Sonda nadpisania effort — przeniesiona do E10 (Aneks C); w raporcie ustalenia z typów
      silnika i zdanie, gdzie w kodzie decyzja jest oddzielona od wykonania.
- [x] Dowód negatywny (zasada 3): subagent → 0 wywołań sędziego i effort bez zmian; prompt etapu
      RelAI z linią effort → tryb auto nie nadpisuje; tekst od `/`, powiadomienie systemowe i sesja
      bez człowieka → bez karty; bliźniak BenAI włączony albo brak zgody → mod uśpiony; mutacja
      każdego z tych warunków czerwieni test.
- [x] Skaner: prośba z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań sędziego, effort bez
      zmian. Awaria sędziego (limit, nie-JSON, poziom spoza listy) → effort bez zmian, powód w pliku.
- [x] `plugin validate` i `plugin test` nowego modu zielone; testy panelu z układem w każdym progu
      szerokości (L-0331); pozostałe mody, rdzeń, `process` i adaptery bez spadku liczby testów;
      walidator adapterów zielony; `sync-panel-core --check` zgodne (8 celów).
- [x] Mutacje warunków dowodu negatywnego: wszystkie zabite (liczba w raporcie i we wpisie).
- [x] Przegląd kodu (`gpt-6.1-sol`, bramka Claude) — CRITICAL i HIGH naprawione z testem; wynik
      we wpisie dziennika (Claude dopisuje go w bramce).
- [x] Pomiar na żywo — przeniesiony do E10 (Aneks C); w raporcie zdanie, co E10 ma zmierzyć
      (karta przed turą, tryb auto, prompt etapu, czas sędziego, rekordy vs `savingsView`).
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E6 (0 / 42);
      brak nowych zależności npm; `git grep --untracked` po wzorcu klucza w zmienionych plikach → 0
      (z kontrolą pozytywną).
- [x] Granica: `git status --short` pokazuje wyłącznie `effort/**`, `core/tools/sync-panel-core.js`,
      `core/tools/release-map.json`, `.claude-plugin/marketplace.json`, `docs/ARTEFAKTY.md`
      i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E7/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`) — w raporcie lista i rozmiary; kasuje Claude po „tak”, liczby przed i po
      dopisuje do wpisu; artefakty spoza katalogu wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy jest dowód negatywny przy effort z promptu etapu RelAI (R9): tryb auto, który go
nadpisze, łamie plan. Test, który tego nie łapie (mutacja przeżywa) → `STOP:` w raporcie, nie
osłabiaj testu.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

Aneks C: punkty 1, 2, 3, 4 i 5 pisze Codex; punkty 1a i 6 oraz dopisek o przeglądzie Sol robi
Claude w bramce.

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E7 → `ZREALIZOWANY <data>`, E8 → `GOTOWY DO STARTU`,
   linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E8 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E7/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md` (+ lekcje do `docs/LEKCJE.md` i odświeżony
   destylat, + przegląd ryzyk R5, R9, AC1), podpis `Autor: RelAI (gpt-6.1-terra w Codeksie) +
   Lukasz`; pułapki silnika do `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — pomiar na żywo `relai-effort` (wyłączenie BenAI
   `effort-optimizer`, kliknięcie karty) jako `OTWARTA — przeniesiona do E10 (Aneks C)`.
4. `docs/STATE.md` (zdania o planie MODY_OSZCZEDZANIA) i linia „Aktywny plan” w `CLAUDE.md`;
   `docs/ARTEFAKTY.md` z punktu 5 zakresu.
5. **Wygenerowanie `PROMPT_ETAP_8.md`** — z wiersza E8 w `PLAN.html` i sekcji 6 specyfikacji
   (Research Router), z realnego stanu repo po E7 i lekcji z E7.
6. Commit — propozycja, conventional message po angielsku; bez `git push`.
