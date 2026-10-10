# PROMPT_Z11_WDROZENIE — pasek „cache”: pięć baterii według Aneksu Z11

Odnoga: AUDYT_MODOW • Paczka: **Z11 · Pasek cache** (Aneks A z 2026-10-10) • Wygenerowano:
2026-10-10 (autor: Fable 5.1, sesja kalibracyjna) • Wykonawca: **Opus 5.5**, `/effort high`

> **Kontrola modelu:** wykonawca paczek odnogi to **Opus 5.5** (`claude-opus-5-5`, lista modeli
> z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś o przełączenie,
> zanim cokolwiek zapiszesz. Wygląd jest **rozstrzygnięty i zamrożony** w aneksie: nie proponujesz
> wariantów, nie „poprawiasz” geometrii; odchylenie od aneksu wymaga „tak” Łukasza w czacie.

Ta sesja **wdraża** układ paska cache zaakceptowany przez Łukasza 2026-10-10 („Jest dobrze”) po
siedmiu rundach kalibracji w prawdziwym nośniku. Wynik: `relai-cache-keeper` rysuje pasek jak
w [Aneksie Z11 briefu v2](../../zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md#10-aneks-z11-2026-10-10--pasek-cache-pięć-baterii-koszt-po-prawej-dymek-przy-ikonie),
testy pilnują słów i siatki, a zrzut Łukasza zamyka paczkę.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu i sekcja niemutowalna; rdzeń `core/panel/*.mjs` poza `theme.mjs` nietykalny (plan PANEL_CODEX) |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md`, **sekcja 10 (Aneks Z11)** i sekcja 1 | geometria w liczbach, pięć miar, dymek, kolumna liczby, drugi wiersz, terminal, kryteria |
| `docs/fixy/AUDYT_MODOW/ODNOGA.md`, linie Z11 w „Weryfikacji” i „Dzienniku wdrożenia” | kontekst paczki i co już zmierzone |
| `docs/PULAPKI.md`, **P-024** i P-017…P-023 | zmierzone zachowania silnika: centrowanie Svg o stałej szerokości, pusty `alt`, komórka 9,8 px, binarka 2.1.280 na PATH |
| `cache-keeper/hooks/register.tsx` (`band`, `bandView`, `cacheFigure`, `secondRow`, `CHIP_OF`, `middlePx`, `CELL_PX`), `cache-keeper/hooks/rings.ts`, `cache-keeper/hooks/rings.test.ts`, `band.test.ts` | co zmieniasz i jakie testy już pilnują słów |
| `core/panel/theme.mjs` (`BAND`, `BAR`, `RING`, `CHIP`, `cacheColor`, `usageColor`) + `core/panel/tests/theme.test.js` | tokeny; tu dochodzi `CHIP.info` (i opcjonalnie `BATTERY`) |
| `~/.claude/dev-mods/a6c6108f-0e83-427f-a501-72bd152c6057/cache-probe/hooks/alts.ts` (`finalRows`, `batteryBody`, `FINAL`) i `register.tsx` (`view`) | **wzorzec zaakceptowany na żywo** — markup dymka, pakowanie wierszy, słowa pięciu miar; przenosisz logikę, nie kopiujesz pliku w ciemno |

## Zakres zmian (twardy)

> **Reguła baterii (decyzja Łukasza 2026-10-10, aneks 10.3–10.4):** liczba obok mówi to, co liczy
> aplikacja (zużycie: `64 %`, `323k`), bateria pokazuje, ile **zostało** (36 % pełna, 68 % pełna);
> kolor od zapasu: szałwia, musztarda ≤ 30 %, glina ≤ 10 %, dla wszystkich pięciu; `reset za` zawsze
> szałwia; cache zimny zawsze glina. Dymek mówi obie strony (`zużyte 64 % · zostało 36 %`).

- `cache-keeper/hooks/rings.ts`: rysunek baterii zamiast pierścieni — `batteryRows(measures, maxPx, background)`
  zwraca wiersze `{ svg, alt }` o markupie `width="100%"` (P-024 pkt 1), wysokość 24 px, każdy
  wiersz z własnymi dymkami rysowanymi po miarach; `Ring` → `Measure` z polami `label`, `value`
  (inline) obok `a`, `b` (dymek). Glify terminala zostają.
- `cache-keeper/hooks/register.tsx`: `bandView` buduje pięć miar z tabeli 10.4 (w tym `reset za`
  z `resetsAt` okna `five_hour`, stan `kept` jako `podtrzymany do HH:MM`); `cacheFigure` → koszt
  sesji (`[usd(S.costUsd), 'sesja']`, bez kosztu `['brak danych', 'kosztu']`); `cost` znika z
  rysunku; `CHIP_OF.event = CHIP.info` z dwuczęściowym tekstem (prowadzenie pogrubione, reszta
  przygaszona); `CELL_PX` 8 → **9.8** z komentarzem o pomiarze; `marginTop: 1` drugiego wiersza
  zostaje. Pasek terminalowy: glif + `etykieta wartość` + linia b przygaszona.
- `core/panel/theme.mjs`: `CHIP.info = { color: BAR.text, bg: mix(BAND.cache.bg, BAR.text, 0.1) }`
  (+ test kontrastu w `theme.test.js`, jak dla pozostałych chipów). Opcjonalnie `BATTERY` z liczbami
  z 10.3, jeśli dzięki temu `rings.ts` nie trzyma gołych stałych.
- Kopie motywu w trzech pluginach: `node core/tools/sync-panel-core.js` (nie ręcznie).
- **Nie ruszasz:** `bar-card.tsx` (test równości trzech kopii), `core/panel/*.mjs` poza `theme.mjs`,
  `adapters/codex/`, paska plan i postępu, `economics.ts`, `handoff.ts`.

## Kroki

1. Testy najpierw (RED): w `rings.test.ts` / `band.test.ts` — pięć miar w kolejności z 10.4, słowa
   inline bez szczegółu (`TTL`, `z 1M`, `reset` nie występują poza dymkiem), dymek `.iN:hover ~ .tN`
   dla każdej miary i rysowany po miarach, przerzut dymka na lewo przy wąskiej kolumnie, `width="100%"`
   w markupie, czas cache raz, koszt raz w kolumnie liczby, `brak danych` jako pusta bateria,
   kolory 69/70/89/90 % i 35/15 % TTL przeniesione na baterie, `reset za` zawsze szałwią, chip Z9
   z `CHIP.info`. Terminal: pięć glifów i linia b.
2. Implementacja (GREEN) w zakresie wyżej; `tsc` strict 0, `claude plugin validate` i `plugin test`
   **binarką aplikacji** (`%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe` — `claude`
   na PATH to 2.1.280 i odrzuca poprawne moduły, P-024 pkt 4), `node --test` rdzenia, `mods-parity`.
3. Pomiar na żywo: podmiana w zainstalowanej kopii `relai-cache-keeper` **za zgodą Łukasza** (jak
   przy Z10) albo wydanie; zrzuty: spokój przy 1640 i ~1400 px, dymek na 2. i 3. miarze, okno
   ~1000 px, stan `zdarzenie Z9`. Wysokość trzech pasków ≤ 175 px.
4. Po „tak” Łukasza: sonda `cache-probe` do usunięcia (`~/.claude/dev-mods/a6c6108f-…/cache-probe/`)
   — wcześniej **nie**, bo jest jedynym żywym wzorcem.

## Weryfikacja

- [ ] Testy z kroku 1 padały na starym kodzie (kontrola pozytywna w opisie) i przechodzą po zmianie.
- [ ] `validate` + `plugin test` (2.1.295) + `tsc` + `node --test` + `sync-panel-core --check` zielone.
- [ ] Zrzuty Łukasza: siatka trzech pasków, dymek, wąskie okno, ≤ 175 px; „tak” w czacie.
- [ ] `git diff` nie dotyka `core/panel/*.mjs` poza `theme.mjs`, `bar-card.tsx` ani `adapters/codex/`.

## Na koniec

W karcie `docs/fixy/AUDYT_MODOW/ODNOGA.md`: checkbox Z11 odhaczony z dowodem (testy z nazwy,
zrzut), linia w „Dzienniku wdrożenia”, wersja `relai-cache-keeper` podbita (0.5.0) i wpis
w `relai-panel` marketplace jak przy Z8 — publikacja **wyłącznie po „tak”**. Commit conventional
po angielsku, dokumentacja po polsku.
