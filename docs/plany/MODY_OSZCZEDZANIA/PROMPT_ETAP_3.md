# PROMPT_ETAP_3 — Input Router: pliki i PDF

Plan: MODY_OSZCZEDZANIA • Etap: **E3 z E10** • Wygenerowano: 2026-11-11 (autor: Opus 5.5, w rytuale „Na koniec” E2) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** wykonuj wyłącznie na **Opus 5.5** (lista modeli claude-code z dnia
> 2026-11-10); inny model → zatrzymaj się i poproś o przełączenie, zanim zapiszesz cokolwiek.
> Zalecany poziom: `/effort high` — nowy mod przechwytuje każdy duży Read i Bash, a pomyłka
> w przepustkach podmieni Claude'owi plik procesu albo wyśle sekret do Haiku.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych” |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcje 1 (bez wierszy „Konektory”, „Panel”) i 7 | zachowanie modu i wspólne reguły modów RelAI |
| `docs/plany/MODY_OSZCZEDZANIA/ANEKS_A_BLIZNIAK.md` | bliźniak `input-router` czytany z `settings.json` |
| `docs/plany/MODY_OSZCZEDZANIA/POMIAR_E2.md` i `SONDY.md` (punkty 2 i 5) | `$.model.complete` z Haiku, sygnał człowieka, pułapki pomiaru na żywo |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 7, 13 oraz lekcje L-0321 i L-0322 | dowód negatywny, efekt, instrument, wartości czytane maszynowo, API modów, pierwsza droga do silnika na żywo, kopia w dev-mods |
| `docs/PULAPKI.md` — P-064, P-063, P-017, P-057 | silnik 2.1.321 (`h`, `$.model.complete` tylko tekst, `$.ui.log`, dev-mods), klasyfikator trybu auto |
| `core/panel/savings-gates.mjs`, `core/panel/savings-ledger.mjs` | `isVerbatimFile`, zgoda, bliźniak, `guardHelper`, rekord i kolejka zapisów |
| `browser/hooks/register.tsx`, `browser/hooks/describe.ts` | wzór modu oszczędzania: bramki, rekord z `helper` i `measured`, zapis do rejestru, wyjście awaryjne |

Pliki duże czytasz zakresami poniżej 100 linii: na maszynie działa `input-router` BenAI, który
streszcza większe odczyty (wyłącza się go dopiero na pomiar — bramka niżej).

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zamrożony 2026-11-11 (D-33), Aneks A (bliźniak z `enabledPlugins`). Clean room: kodu
  BenAI nie otwierasz i nie kopiujesz; pracujesz ze specyfikacji.
- Mod osobny: `relai-input-router` w katalogu `input-router/` repo, jak `browser/` dla
  `relai-browser`; wpis w `marketplace.json` i `release-map.json` jak w E1, **bez** wydania.
- Pliki procesu RelAI i pliki instrukcji zawsze dosłownie (`isVerbatimFile`, specyfikacja
  sekcja 1, wiersz „Przepustki pliku”); treść do Haiku wyłącznie po skanerze sekretów
  (`guardHelper` + generowany `secret-scan.mjs`) i po zgodzie projektu (wiersz „Mody oszczędzania”
  w `docs/USTAWIENIA.md` — w tym repo już `zgoda`).
- Haiku przez `$.model.complete` (tekst — tu wystarcza); model z `$.store` modu z wartością
  domyślną `claude-haiku-5-5`, nie na sztywno w wywołaniu (wzór: `readMode` w `describe.ts`).
- Rekord do rejestru `savings-ledger` z `helper{model,in,out}` z `usage` i `measured: true`;
  zakładka „Oszczędności” (E2) liczy go bez zmian.
- Sesja bez człowieka = `origin.kind !== 'composer'` (P-063); przed zgodą mod bierny.
- Granica: konektory MCP i panel przekazań to E4; wyciszenie drugiej kopii opisu `describe`
  (hand-back) i wydanie — E10.

## Stan wyjściowy (co realnie zastajesz po E2)

```
core/panel/savings-gates.mjs     zgoda, pliki procesu (isVerbatimFile), bliźniak, origin, guardHelper
core/panel/savings-ledger.mjs    rekord, parse, isLeftOut, expiredFiles, createQueue
core/panel/savings-view.mjs      sumy zakładki „Oszczędności” (E2)
core/tools/sync-panel-core.js    cele: panel, progress, cache-keeper, mods, browser (graf importów)
browser/                         relai-browser 0.1.0 (niewydany): shrink + describe, 28 testów
panel/                           relai-panel 0.22.2 + zakładka „Oszczędności” (niewydana), 220 testów
~/.claude/relai/oszczednosci/rejestr/   rekordy relai-browser z E1 i E2
```

**Czego jeszcze nie ma:** folderu `input-router/` ani celu `input-router` w
`sync-panel-core.js`; kopii pełnej treści i pamięci notatek pod `~/.claude/relai/oszczednosci/`;
obsługi PDF. **FAKT 2026-11-11:** `pdftotext` jest w `/mingw64/bin` Git Bash, `pdfinfo` nie ma
na `PATH` — sprawdź, co widzi `$.process.run` (natywny Windows), zanim napiszesz drogę PDF.

**Liczby wyjściowe testów** (po E2, FAKT 2026-11-11): guardrails 33, process 430, panel (rdzeń)
254; mody `mods` 91, `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28;
`sync-panel-core --check` zgodne (23 pliki, 16 ikon, 5 celów).

Zasady do doczytania: 3, 4, 5, 7, 13. Ryzyka etapu: R4 i R8 (plan), C1, C10 (dziennik).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E3/`.** Wszystko tymczasowe
> — skrypty pomiarowe, materiał testowy, wyjścia narzędzi — powstaje tam. Artefakt, który z natury
> musi leżeć **poza** projektem (kopia w `~/.claude/dev-mods/`, katalog domowy), wpisujesz do wpisu
> dziennika **z nazwy**.

1. **Czysta logika** `input-router/hooks/route.ts` (bez `$`): próg pliku `MIN_TOKENS` 2000
   (tokeny = ceil(znaki/4)), przepustki (Read z zakresem < 100 linii i < 2k tokenów, pliki
   instrukcji, pliki procesu RelAI przez `isVerbatimFile`, grep/ls/find), kawałkowanie (> 50% pliku
   w kawałkach → następny kawałek ≥ 100 linii dostaje notatki), limity dużych plików, routing
   Bash (tylko polecenia z listy czytników/pomocników; build, testy, git, npm, błędy dosłownie) —
   wartości ze specyfikacji, sekcja 1; testy obok kodu.
2. **Notatki Haiku** `input-router/hooks/notes.ts` + `register.tsx`: prompt (ostatnia wiadomość
   człowieka ≤ 12 000 znaków, argumenty ≤ 2000, linie z numerami), wywołanie `$.model.complete`
   po `guardHelper`; wynik z nagłówkiem RelAI, notatkami z numerami linii, ścieżką do pełnej treści
   i instrukcją czytania małych zakresów; awaria → zwykły wynik.
3. **Kopie pełnej treści i pamięć notatek** pod `~/.claude/relai/oszczednosci/` (klucz: ścieżka +
   mtime + rozmiar + skrót prośby; ponowny odczyt bez Haiku), retencja jak rejestr (`expiredFiles`).
4. **PDF** > 5 stron przez Poppler (`pdfinfo`/`pdftotext -f N -l M -enc UTF-8`, limit 120 s);
   brak Popplera → zwykły Read.
5. **Komendy** `/relai-input-router` (statystyki, `full`, `off file`, `on file`) i rekord do
   rejestru po każdym przekazaniu; bliźniak `input-router` BenAI → mod śpi z jednym komunikatem.
6. **Folder modu** jak `browser/`: `plugin.json`, `hooks.json`, `types/`, cel w
   `core/tools/sync-panel-core.js`, wpisy w `.claude-plugin/marketplace.json` i `core/tools/release-map.json`. Wersji nie
   wydajesz (E10).
7. **Pomiar na żywo** (zasada 4, L-0321, L-0322): kopia `input-router/` jako `relai-input-router`
   w `~/.claude/dev-mods/<sesja>/` po załadowaniu skilla `plugin-authoring`; duży log i PDF
   docierają jako notatki ze ścieżką; plik procesu (`docs/DZIENNIK.md`) dosłownie; drugi odczyt
   z pamięci bez Haiku; bramka manualna: `input-router@token-saving-mods` wyłączony na czas pomiaru
   (`claude plugin disable` za zgodą Łukasza), potem włączony.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu, nie na końcu
etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Liczby wyjściowe testów jak w „Stanie wyjściowym” (inna liczba → zatrzymaj się i zapytaj).
- [x] Dowód negatywny (zasada 3): plik procesu RelAI (`docs/DZIENNIK.md`, `PROMPT_ETAP_*.md`,
      `.claude/relai/**`) i plik instrukcji (`CLAUDE.md`, `SKILL.md`) dochodzą dosłownie — 0 wywołań
      Haiku; duży plik zwykły → 1 wywołanie; mutacja przepustki czerwieni test.
- [x] Dowód negatywny skanera: duży plik z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań Haiku
      i wynik dosłowny; ten sam plik bez klucza → 1 wywołanie.
- [x] `plugin validate input-router` ✔ i `plugin test input-router` zielony; pozostałe mody i rdzeń
      bez spadku liczby testów; `sync-panel-core --check` zgodne z nowym celem.
- [x] Pomiar na żywo zapisany w katalogu roboczym: duży log i PDF (albo FAKT braku Popplera dla
      `$.process.run`) jako notatki ze ścieżką; tokeny przed/po i `usage` Haiku; drugi odczyt bez
      Haiku; rekordy w rejestrze widoczne w zakładce „Oszczędności” i zgodne ze skryptem.
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec E2 (0 / 42);
      brak nowych zależności npm; podstawy: ścieżki z wejścia narzędzia normalizowane, zanim mod
      zapisze kopię; `git grep` po wzorcu klucza w nowych plikach nie zwraca nic.
- [x] Granica: `git status --short` pokazuje wyłącznie `input-router/**`, nowe pliki `core/panel/**`
      (jeśli trzeba), `core/tools/sync-panel-core.js`, `.claude-plugin/marketplace.json`,
      `core/tools/release-map.json` i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E3/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; artefakty spoza katalogu
      (kopie w dev-mods, kopie pełnej treści z pomiaru) wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to przepustki plików procesu: notatka Haiku zamiast `PROMPT_ETAP_*.md` albo
`DZIENNIK.md` zepsułaby rytuały RelAI. Taki rozjazd → zatrzymaj się i pokaż przypadek.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E3 → `ZREALIZOWANY <data>`, E4 → `GOTOWY DO STARTU`,
   jedna linia w dzienniku wdrożenia; link przy E4 po kroku 5.
1a. Katalog roboczy etapu — raport, „tak”, kasowanie; liczby do wpisu z kroku 2, artefakty spoza
   katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj ryzyka R4, R8, C1, C10; lekcje → `docs/LEKCJE.md`; pułapki → `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — nierozstrzygnięte pozycje „Do zrobienia przez człowieka” jako `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu; linia „Aktywny plan” w `CLAUDE.md`.
5. **Wygeneruj `PROMPT_ETAP_4.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E4 w `PLAN.html`, ze specyfikacji (sekcja 1, wiersze
   „Konektory”, „Konektory nietykane”, „Panel”), z realnego stanu repo i z lekcji E3.
6. Commit — propozycja, jeden commit etapu (conventional, EN); bez `git push`. Wydanie dopiero w E10.
