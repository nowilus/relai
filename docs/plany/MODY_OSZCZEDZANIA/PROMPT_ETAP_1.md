# PROMPT_ETAP_1 — Sondy silnika, rdzeń i pierwszy mod

Plan: MODY_OSZCZEDZANIA • Etap: **E1 z E10** • Wygenerowano: 2026-11-11 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus** (D-85, świeże sesje) — `/effort high`

> **Kontrola modelu:** wykonuj wyłącznie na **Opus 5.5** (lista modeli claude-code z dnia
> 2026-11-10); inny model → zatrzymaj się i poproś o przełączenie, zanim zapiszesz cokolwiek.
> Zalecany poziom: `/effort high` — etap stawia fundament pięciu modów na API „early access”,
> którego zachowanie trzeba najpierw zmierzyć, a błąd w rdzeniu powtórzy się w każdym następnym etapie.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/MODY_OSZCZEDZANIA/SPECYFIKACJA_FUNKCJI.md` — sekcje 3, 4 (tylko kontrakt rekordu), 7 i akapit „Zasada pracy” | **zakres zachowania**: `relai-browser`, pola rejestru, wspólne bramki |
| `docs/plany/MODY_OSZCZEDZANIA/PLAN.html` — sekcje 5, 7 i 8 (Grep `Wspólny rdzeń`, `R1`, `Brak zgody` z kontekstem) | rozwiązanie, ryzyka R1, R2, R7, przypadki brzegowe |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5, 12, 13 i 15 | 3: dowód negatywny (sekret nie idzie do pomocnika); 4: dowód efektem (rozmiar obrazu przed i po); 5: instrument (CRLF, wzorce); 12: bramka zatrzymująca nie-sekret to defekt; 13: API modów z próby, sonda przed kodem; 15: zgoda raz, ASCII w komunikatach, wygląd |
| `docs/PULAPKI.md` — P-017, P-023, P-024, P-052, P-053, P-057 | API modów, testy binarką sesji, przeładowanie, klasyfikator trybu auto |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | wygląd panelu modu (zasada 15) |
| `core/tools/sync-panel-core.js` (nagłówek i `PLUGINS`) oraz `core/guardrails/secret-scan.js` (eksport `scanText`, `PATTERNS`) | jak kopie rdzenia trafiają do modów; skąd wzorce sekretów |
| `docs/DECYZJE.md` — D-80 (z aneksami), D-92, D-93 | gdzie mieszka telemetria, schemat włączania modów, zgoda raz |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zaakceptowany i **zamrożony** 2026-11-11 (D-33); zmiana tylko aneksem. Rozstrzygnięcia wywiadu
  stoją we wpisie dziennika z 2026-11-11 („Plan MODY_OSZCZEDZANIA”).
- **Clean room:** kodu BenAI (`C:\Users\Lukasz\Desktop\token-saving-mods\plugins\**\hooks\*`) nie
  otwierasz i nie kopiujesz. Pracujesz ze specyfikacji, z próby i z typów silnika. Potrzebujesz
  szczegółu, którego specyfikacja nie ma → mierzysz na żywo albo pytasz Łukasza.
- Pięć osobnych modów z przedrostkiem `relai-` (ten etap: `relai-browser`), licencja MIT jak reszta
  repo, autor `nowilus` jak w `panel/.claude-plugin/plugin.json`.
- Zgoda raz na projekt: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` projektu; sesja bez
  człowieka przed zgodą → mod bierny (D-93, zasada 15).
- Skaner sekretów przed każdym wysłaniem treści do pomocnika; wzorce mają **jedno źródło**
  (`core/guardrails/secret-scan.js`) — nie przepisujesz listy ręcznie do modu.
- Rejestr oszczędności RelAI jest osobny od rejestru BenAI i go nie czyta; nazwy pól jak w
  specyfikacji, sekcja 4.
- Aktywny bliźniak BenAI (`efficient-browser-use`) → `relai-browser` śpi i mówi o tym raz na sesję.
- Granica zakresu: zakładka „Oszczędności” i tryb opisu słowami to **E2**; Input Router to E3–E4.
  W E1 rejestr tylko się zapisuje i ma test odczytu — bez widoku.

## Stan wyjściowy (co realnie zastajesz)

```
.claude-plugin/marketplace.json     relai 3.8.0 + 4 mody (panel, progress, cache-keeper, mods)
core/panel/*.mjs                    wspólny rdzeń modów (pricing, measure, theme, ...)
core/guardrails/secret-scan.js      CJS, module.exports = { scanText, PATTERNS }
core/tools/sync-panel-core.js       PLUGINS = panel, progress, cache-keeper (hooks/relai), mods
core/tools/release-map.json         wiersze mod-panel, mod-progress, mod-cache-keeper, mod-mods
panel/ progress/ cache-keeper/ mods/  mody: .claude-plugin/plugin.json + hooks/{hooks.json, register.tsx, *.test.ts}
docs/plany/MODY_OSZCZEDZANIA/       PLAN.html, STATUS.md, SPECYFIKACJA_FUNKCJI.md, ten prompt
```

**Czego jeszcze nie ma:** folderu `browser/` (mod `relai-browser`), wspólnych bramek modów
oszczędzania w `core/panel/`, rejestru `~/.claude/relai/oszczednosci/`, wiersza „Mody oszczędzania”
w `docs/USTAWIENIA.md`, wiersza modu w `release-map.json` i w `marketplace.json`.

**Liczby wyjściowe testów** (zmierzone przez autora promptu 2026-11-11, przed etapem): patrz
`Weryfikacja`, punkt 2.

**Na maszynie działa paczka BenAI** (zainstalowana, aktywna): `efficient-browser-use` zmniejsza
obrazy przed modem RelAI, a `input-router` zamienia duże odczyty na notatki Haiku, także odczyty
dokumentów RelAI. Duży plik czytasz zakresami poniżej 100 linii. Wszystkie pomiary obrazów robisz
przy wyłączonym `efficient-browser-use` (bramka manualna w Zakresie, pkt 1).

Zasady do doczytania: 3, 4, 5, 12, 13, 15. Ryzyka etapu: R1, R2, R7 (plan), C1 i C8 (dziennik).

## Zakres etapu

Katalog roboczy etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E1/` — sondy, zrzuty, wyniki pomiarów.

1. **Bramka manualna przed pomiarami:** poproś Łukasza o wyłączenie `efficient-browser-use` BenAI
   na czas etapu (`/mods` paczki BenAI albo `"efficient-browser-use": false` w
   `~/.claude/mods/switches.json` — zmienia **on**, nie Ty) i o włączenie z powrotem po etapie.
   Odpowiedź zapisz do wpisu dziennika.
2. **Sondy silnika (zasada 13, L-0255, L-0289)** — kopia sondy w dev-mods sesji pod nazwą
   `relai-sonda-e1`, wynik do `.claude/relai/work/MODY_OSZCZEDZANIA/E1/SONDY.md`. Dla każdego
   punktu: co wysłano, co wróciło, dwa przebiegi.
   - `tool.call` z obrazem: kształt wyniku zrzutu Claude_Browser i Read pliku PNG; czy wynik z
     `next()` da się podmienić (obraz mniejszy dociera do modelu — dowód: rozmiar w transkrypcie).
   - `$.model.complete` z modelem `claude-haiku-5-5`: czy działa z modu, pola `usage`, czas, odmowa
     w trybie auto (P-057).
   - `agent.spawn`: pola `model`, `parentModel`, `subagentType`, fork/resume; czy zmiana `model`
     w `next({...e, model})` działa (pod E5 — tylko pomiar, bez kodu routera).
   - `turn.step`: czy pole `effort` jest i czy jego nadpisanie działa; `$.config.set` wiersza effort
     (pod E7 — tylko pomiar).
   - `prompt.submit`: pole `origin`; jak mod rozpozna sesję bez człowieka (`claude -p`) — sygnał
     albo jego brak (warunek milczenia, zasada 13).
   - Odczyt `installed_plugins.json` i `~/.claude/mods/switches.json` z modu (detekcja bliźniaka).
   Wynik sondy przeczy specyfikacji → zatrzymaj się i zapytaj (decyzja: aneks do planu).
3. **Wspólny rdzeń modów oszczędzania** w `core/panel/` (nowe pliki `.mjs`, czysta logika bez `$`):
   - `savings-gates.mjs` — zgoda (odczyt wiersza „Mody oszczędzania” z `docs/USTAWIENIA.md` w górę
     od cwd, L-0146), lista plików procesu RelAI (specyfikacja, sekcja 1, kolumna „Zmiana w RelAI”),
     detekcja bliźniaka (mapowanie mod RelAI → mod BenAI), skaner sekretów;
   - wzorce sekretów z **jednego źródła**: wybierz sposób (np. przeniesienie `PATTERNS` do
     `core/panel/secret-patterns.mjs` czytanego przez `secret-scan.js`) i zapisz decyzję w dzienniku;
     test parytetu — ten sam zestaw fikstur daje te same werdykty w obu miejscach;
   - `savings-ledger.mjs` — rekord wg specyfikacji (sekcja 4), zapis dopisywany do
     `~/.claude/relai/oszczednosci/rejestr.jsonl`, odczyt z deduplikacją po `tool_use_id`,
     złe linie liczone i pomijane, rotacja po progu (próg i retencja kopii: kalibrujesz w etapie,
     liczba z etykietą — zasada 6).
   Testy w `core/panel/tests/` (`node --test`).
4. **`relai-browser` 0.1.0** w nowym folderze `browser/` (układ jak `panel/`): `hooks.json`,
   `register.tsx` (tylko `$` i `on`, logika w osobnych plikach — zasada 13), zmniejszanie wg
   specyfikacji sekcja 3 (Windows PowerShell + System.Drawing, macOS `sips`, inaczej bez zmian
   z komunikatem raz), przeliczenie współrzędnych, komenda `/relai-browser` (`full`, `scale`, `min`,
   `pane`), karta zgody przy pierwszym użyciu w projekcie, uśpienie przy aktywnym bliźniaku, rekord
   do rejestru. Panel modu minimalny (lista zmniejszeń) wg `DESIGN.md`. Testy obok kodu.
5. **Integracja:** `sync-panel-core.js` — nowy cel `['browser', 'browser/hooks/core']`;
   `.claude-plugin/marketplace.json` — wpis `relai-browser` 0.1.0 („Early access — needs Claude
   Code with mods”); `core/tools/release-map.json` — wiersz `mod-browser`; wiersz „Mody oszczędzania”
   w `docs/USTAWIENIA.md` powstaje dopiero z karty zgody (nie ręcznie).
6. **Pomiar na żywo** (zasada 4): zrzut z wbudowanej przeglądarki przed i po — wymiary i szacunek
   tokenów z rejestru; Read pliku PNG; obraz WebP (bez zmian); `/relai-browser full`; bliźniak włączony
   na chwilę → mod śpi i mówi raz (włącza i wyłącza Łukasz).

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz tu (`- [ ]` → `- [x]`) zaraz po sprawdzeniu.

- [x] Model sesji to Opus 5.5; `git status --short` przed pracą pokazuje tylko `.claude/launch.json`
      (albo człowiek rozstrzygnął, co z drzewem).
- [x] Przed zmianą — liczby wyjściowe zmierzone 2026-11-11: `node --test "core/guardrails/tests/*.test.js"`,
      `node --test "core/process/tests/*.test.*"`, `node --test "core/panel/tests/*.test.*"` oraz
      `"$CLAUDE_CODE_EXECPATH" plugin test mods|panel|progress|cache-keeper` — wartości
      z pliku `.claude/relai/work/MODY_OSZCZEDZANIA/E1/BAZA.md` (inna liczba → zatrzymaj się i zapytaj).
- [x] `SONDY.md` ma wynik każdego punktu z Zakresu pkt 2 z dwoma przebiegami; rozjazd ze specyfikacją
      rozstrzygnięty z Łukaszem przed kodem.
- [x] Testy rdzenia: nowe testy `savings-gates`, `savings-ledger` i parytetu wzorców zielone; stare
      liczby bez spadku; dowód negatywny (zasada 3): fikstura z kluczem `sk-…` nie trafia do argumentu
      wywołania pomocnika (atrapa liczy wywołania = 0) — i kontrola pozytywna: fikstura bez sekretu
      daje 1 wywołanie.
- [x] Plik procesu RelAI (fikstura `docs/STATE.md` w projekcie z markerem) przechodzi bramkę jako
      „dosłownie”; plik spoza listy — nie (obie strony testem).
- [x] `"$CLAUDE_CODE_EXECPATH" plugin validate browser` → „✔ Validation passed”;
      `plugin test browser` → wszystkie zielone; pozostałe cztery mody bez spadku liczby testów.
- [x] `node core/tools/sync-panel-core.js --check` → zgodne, w tym cel `browser`.
- [x] Pomiar na żywo (Zakres pkt 6) zapisany w katalogu roboczym: wymiary przed i po, tokeny,
      rekord w `rejestr.jsonl`; WebP bez zmian; `full` przepuszcza jeden obraz; bliźniak → uśpienie.
- [x] Karta zgody pojawia się raz; po „tak” wiersz „Mody oszczędzania” stoi w `docs/USTAWIENIA.md`,
      a druga sesja w tym projekcie nie pyta.
- [ ] `node core/tools/release-check.js` — brak czerwonego `diff` dla nowych plików (wiersz `mod-browser`).
      **NIE PRZESZEDŁ — rozstrzygnięte przez Łukasza 2026-11-11:** narzędzie kończy się kodem 2
      („brak bazy modu relai-browser”), bo nie zna pierwszego wydania modu; wiersz `mod-browser`
      dopisany, nowe pliki w `browser/**`, `core/panel/**`, `core/tools/**` mają wzorce w mapie;
      obsługa pierwszego wydania modu — świadomie odłożona do E10.
- [x] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec wpisu E14 planu
      OPTYMALIZACJA_PO_AUDYCIE (0 CRITICAL, 42 HIGH); brak nowych zależności npm.
- [x] Granica: `git status --short` pokazuje wyłącznie `browser/**`, nowe pliki `core/panel/**`,
      ewentualnie `core/guardrails/**` (jedno źródło wzorców), `core/tools/sync-panel-core.js`,
      `core/tools/release-map.json`, `.claude-plugin/marketplace.json`, `docs/USTAWIENIA.md`
      i dokumenty rytuału.
- [x] Katalog roboczy `.claude/relai/work/MODY_OSZCZEDZANIA/E1/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      `find`/`du`), skasowany po „tak”, liczby przed i po we wpisie; kopia sondy `relai-sonda-e1`
      w dev-mods i artefakty spoza katalogu wypisane z nazwy z tym, co się z nimi stało.

Najtwardszy punkt to sondy: zielone testy nie dowodzą, że silnik pozwala podmienić obraz w wyniku
narzędzia. Bez `SONDY.md` z dwoma przebiegami nie piszesz kodu modu.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/MODY_OSZCZEDZANIA/STATUS.md` — E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO STARTU`,
   jedna linia w dzienniku wdrożenia (zastępuje linię „E1 rozpoczęty”); link przy E2 po kroku 5.
1a. Katalog roboczy etapu — raport, „tak”, kasowanie; liczby do wpisu z kroku 2.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (sondy, testy przed i po, pomiar obrazu) / Świadomie odłożone / Do zrobienia przez człowieka
   (w tym: włączyć z powrotem `efficient-browser-use` BenAI); podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj ryzyka C1, C8 i R1, R2, R7 planu; lekcje → `docs/LEKCJE.md`; nowe pułapki API modów →
   `docs/PULAPKI.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka”
   dostaje linię `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu (E1 zrealizowany, `relai-browser` 0.1.0 w repo, niewydany).
5. **Wygeneruj `PROMPT_ETAP_2.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` i
   `stage-prompts.md` — z wiersza E2 w sekcji 6 `PLAN.html`, ze specyfikacji (sekcje 3 i 4),
   z `SONDY.md` i z realnego stanu repozytorium po tym etapie; numery zasad do doczytania, bez odpisu.
6. Commit — propozycja, jeden commit etapu (conventional, EN); bez `git push`. Wydanie dopiero w E10.
