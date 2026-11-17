# PROMPT_ETAP_2 — Zakładka „Oszczędności” i opis słowami

Plan: MODY_OSZCZEDZANIA • Etap: **E2 z E10** • Wygenerowano: 2026-11-11 (autor: Opus 5.5, w rytuale „Na koniec” E1) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** wykonuj wyłącznie na **Opus 5.5** (lista modeli claude-code z dnia
> 2026-11-10); inny model → zatrzymaj się i poproś o przełączenie, zanim zapiszesz cokolwiek.
> Zalecany poziom: `/effort high` — zakładka zmienia `relai-panel` (wydany mod z 217 testami
> i rygorem wyglądu), a jej suma musi zgadzać się z rejestrem co do tokena (ryzyko R6).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcje 3 (wiersz „Opis słowami”), 4 i 7 | zachowanie zakładki i trybu `describe` |
| `docs/plany/MODY_OSZCZEDZANIA/ANEKS_A_BLIZNIAK.md` | bliźniak czytany z `settings.json` |
| `docs/plany/MODY_OSZCZEDZANIA/SONDY.md` (punkty 1, 2, 5) i `POMIAR.md` | kształty obrazów, `$.model.complete` z Haiku, sygnał człowieka, liczby z E1 |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — sekcje 5 i 7 (Grep `Zakładka „Oszczędności”`, `R6`) | rozwiązanie zakładki, ryzyko zawyżonych oszczędności |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 6, 7, 13 i 15 | dowód negatywny, efekt, progi, wartości czytane maszynowo, API modów, wygląd |
| `docs/PULAPKI.md` — P-063, P-017, P-042, P-043, P-044, P-057 | silnik 2.1.321, motyw, układ desktopu, klasyfikator trybu auto |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | kartka, wiersz, klucze kolorów (zasada 15) |
| `panel/hooks/pane-costs.tsx`, `panel/hooks/pane-parts.tsx` (`TABS`), `core/panel/pricing.mjs` | wzór zakładki i wycena |
| `core/panel/savings-ledger.mjs`, `browser/hooks/register.tsx` | rejestr i producent rekordów z E1 |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33), Aneks A (bliźniak z `enabledPlugins`). Clean room: kodu BenAI
  nie otwierasz i nie kopiujesz.
- Zakładka w `relai-panel`, nie osobny mod; jawnie opisana jako oszczędności włączonych modów —
  inna miara niż „Koszty”. Dwie kolumny: **zmierzone** (koszt helperów z `usage`) i **szacowane**
  (tokeny zaoszczędzone), zawsze z etykietą. Wycena wejścia ceną modelu głównego z
  `core/panel/pricing.mjs`, **bez** mnożnika przyszłych odczytów cache; koszt helperów odejmowany
  zawsze (specyfikacja, sekcja 4).
- Rejestr: plik na sesję i dzień `~/.claude/relai/oszczednosci/rejestr/<data>-<sesja>.jsonl`
  (decyzja Łukasza w E1); odczyt przez `parse()` z deduplikacją, LEFT OUT przez `isLeftOut()`.
  Rejestru BenAI nie czytasz.
- Tryb `describe` `relai-browser`: subagent albo `$.model.complete` Haiku (≤ 250 słów: co to jest,
  cały czytelny tekst dosłownie, kontrolki i położenie, stan); błąd → zmniejszanie. Treść idzie do
  pomocnika **wyłącznie po skanerze** (`guardHelper` + generowany `secret-scan.mjs`) i po zgodzie
  projektu; model z ustawień, nie na sztywno.
- Sesja bez człowieka = `origin.kind !== 'composer'` (P-063); przed zgodą mod bierny.
- Granica: Input Router to E3–E4, wydanie i `release-check` dla pierwszego wydania modu — E10.

## Stan wyjściowy (co realnie zastajesz)

```
core/panel/savings-gates.mjs        zgoda, pliki procesu, bliźniak (BOM), origin, guardHelper
core/panel/savings-ledger.mjs       rekord, parse (dedup, złe linie), isLeftOut, expiredFiles, createQueue
core/tools/secret-scan-esm.js       kopia ESM skanera → secret-scan.mjs w modzie, który go importuje
core/tools/sync-panel-core.js       cele: panel, progress, cache-keeper, mods, browser
browser/                            relai-browser 0.1.0: register.tsx, shrink.ts, resize.ts, state.ts, 18 testów
panel/                              relai-panel 0.22.2: TABS = Komendy, Koszty, Dokumenty, Mapa, Pomoc; 217 testów
docs/plany/MODY_OSZCZEDZANIA/       PLAN.html, STATUS, SPECYFIKACJA, ANEKS_A, SONDY, POMIAR, PROMPT_ETAP_1–2
~/.claude/relai/oszczednosci/rejestr/  4 rekordy relai-browser z pomiaru E1
```

**Czego jeszcze nie ma:** zakładki „Oszczędności” w `relai-panel` i jej testów sumy; trybu
`describe` w `relai-browser` (komenda zna tylko `full`, `scale`, `min`, `pane`); importu
`secret-scan.mjs` w żadnym modzie; ustawienia modelu pomocnika.

**Liczby wyjściowe testów** (po E1, 2026-11-11): guardrails 33, process 430, panel (rdzeń) 247;
mody `mods` 91, `panel` 217, `progress` 51, `cache-keeper` 206, `browser` 18; `sync-panel-core
--check` zgodne (22 pliki, 16 ikon, 5 celów).

**Na maszynie działa paczka BenAI** (wszystkie mody włączone po E1). `savings-proof` BenAI ma
własną komendę `/savings` — zakładka RelAI nie czyta jego rejestru. `input-router` BenAI streszcza
duże odczyty: plik czytasz zakresami poniżej 100 linii. Pomiar trybu `describe` robisz przy
wyłączonym `efficient-browser-use` (bramka manualna, jak w E1 — wyłącza `claude plugin disable`
na prośbę Łukasza, po etapie z powrotem `enable`).

Zasady do doczytania: 3, 4, 6, 7, 13, 15. Ryzyka etapu: R6 (plan), C1, C8 i C10 (dziennik).

## Zakres etapu

Katalog roboczy etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E2/` — zrzuty, próby, wyniki pomiarów.

1. **Odczyt rejestru dla zakładki** — `core/panel/savings-view.mjs` (czysta logika): z rekordów
   `parse()` sumy w filtrach czat / dziś / wszystko, kolumna zmierzone (koszt helperów z
   `helper.in/out` × cena z `pricing.mjs`) i szacowane (tokeny `before − after` × cena modelu
   głównego), LEFT OUT osobno z liczbą; testy w `core/panel/tests/` — **suma na fiksturze rejestru
   zgadza się co do tokena** (R6), duplikat i zła linia nie zmieniają sumy (obie strony testem).
2. **Zakładka „Oszczędności”** w `relai-panel`: wpis w `TABS` (`panel/hooks/pane-parts.tsx`),
   nowy `panel/hooks/pane-savings.tsx`, odczyt plików rejestru (`$.fs.list` + `read`) w warstwie
   danych jak „Koszty”; wygląd wg `DESIGN.md` (kartka, wiersz, klucze); zdanie opisu miary nad
   kolumnami; każda liczba szacowana z etykietą. Testy obok kodu.
3. **Tryb `describe` w `relai-browser`**: `/relai-browser describe` i `shrink` przełączają tryb
   (w `$.store`); obraz idzie do Haiku przez `guardHelper` z kopią `secret-scan.mjs` (import
   w `browser/hooks/` → `sync-panel-core.js` ją wygeneruje); model z ustawień; rekord do rejestru
   z `helper{model,in,out}` i `measured: true` dla kosztu; błąd → zmniejszanie.
4. **Wersje bez wydania:** `relai-panel` i `relai-browser` dostają numery w `plugin.json`
   i `marketplace.json` dopiero w E10 — w E2 nie podbijasz.
5. **Pomiar na żywo** (zasada 4): zakładka po czterech rekordach z E1 i nowych z `describe` —
   suma w zakładce = suma policzona z plików rejestru skryptem; `describe` na zrzucie z tekstem
   (słowa dosłownie, ≤ 250); sesja bez zgody → bez wywołania Haiku.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Test sumy zakładki na fiksturze rejestru zgodny co do tokena; duplikat i zła linia sumy nie
      zmieniają; rekord LEFT OUT poza sumą i policzony osobno (obie strony testem).
- [x] Dowód negatywny (zasada 3): `describe` na obrazie z tekstem zawierającym klucz `sk-…` → 0
      wywołań Haiku, obraz idzie zmniejszony; bez sekretu → 1 wywołanie.
- [x] `plugin validate panel` i `plugin validate browser` → ✔; `plugin test` obu zielone; pozostałe
      mody i rdzeń bez spadku liczby testów; `sync-panel-core --check` zgodne.
- [x] Pomiar na żywo zapisany w katalogu roboczym: suma zakładki = suma z plików rejestru;
      `describe` zmierzony (słowa, czas, `usage`); filtr czat/dziś/wszystko zmienia liczby.
- [x] Zrzut zakładki w jasnym i ciemnym wyglądzie przejrzany wg listy kontrolnej `DESIGN.md` §12.
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E1 (0 / 42);
      brak nowych zależności npm.
- [x] Granica: `git status --short` pokazuje wyłącznie `panel/**`, `browser/**`, nowe pliki
      `core/panel/**`, `core/tools/sync-panel-core.js` (jeśli trzeba) i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E2/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (kopie w dev-mods) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to suma co do tokena: zakładka, która zawyża, jest gorsza niż jej brak (R6).
Rozjazd sumy → zatrzymaj się i pokaż różnicę, zamiast ją zaokrąglić.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E2 → `ZREALIZOWANY <data>`, E3 → `GOTOWY DO STARTU`,
   jedna linia w dzienniku wdrożenia; link przy E3 po kroku 5.
1a. Katalog roboczy etapu — raport, „tak”, kasowanie; liczby do wpisu z kroku 2.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj ryzyka R6, C1, C8, C10; lekcje → `docs/LEKCJE.md`; pułapki → `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — nierozstrzygnięte pozycje „Do zrobienia przez człowieka” jako `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu.
5. **Wygeneruj `PROMPT_ETAP_3.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E3 w `PLAN.html`, ze specyfikacji (sekcja 1) i z realnego stanu repo.
6. Commit — propozycja, jeden commit etapu (conventional, EN); bez `git push`. Wydanie dopiero w E10.
