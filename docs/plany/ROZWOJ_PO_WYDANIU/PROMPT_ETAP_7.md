# PROMPT_ETAP_7 — Adapter Codeksa: trzecie wyjście RelAI

Plan: ROZWOJ_PO_WYDANIU • Etap: **E7 z E8** • Wygenerowano: 2026-08-17 (autor: Opus 5, w rytuale
„Na koniec" etapu E6) • Wykonawca: **Opus** (linia metryczna `STATUS.md`: „Opus — z ustawień
projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Decyzja człowieka, którą sprawdzasz jako pierwszą rzecz.** Pilotaż E6 pokazał, że
> `CLAUDE.md` w projekcie prowadzonym Cursorem jest czytany **tylko dlatego, że reguła każe go
> przeczytać** — natywnie oba obce narzędzia czytają `AGENTS.md`. Dla Codeksa to nie jest niuans:
> `AGENTS.md` **jest** tam jedyną warstwą zawsze-w-kontekście. Wpis dziennika z 2026-08-17
> zostawił człowiekowi trzy wyjścia: (a) `AGENTS.md` plikiem głównym, `CLAUDE.md` wskaźnikiem,
> (b) odwrotnie, (c) stan dzisiejszy jako świadoma różnica. **Jeśli decyzji nie ma w
> `docs/DECYZJE.md` ani w dzienniku — zatrzymaj się i zapytaj, zanim napiszesz pierwszy plik
> adaptera.** Kształt całego etapu zależy od odpowiedzi.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (P1 i P2 — po E6 P2 jest otwarte **już tylko dla Codeksa**) + wpis z 2026-08-17: co pilotaż zmierzył, czego nie, i lista tarć |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (47 pozycji; L-0045, L-0046, L-0047 są z E6) |
| `docs/PRZENOSNOSC.md` | sekcja 2 (Codex — rozpoznanie **z dokumentacji**, z trzema pozycjami `<DO UZUPEŁNIENIA>`) i sekcja 3 (tabela gwarancji, kolumna Codex) |
| `adapters/cursor/` — `install.js`, `rules/*.mdc`, `hooks/`, `README.md` | wzorzec adaptera, który przeszedł pilotaż: co jest regułą, co hookiem, co kopią z adaptera Claude Code |
| `core/MANIFEST.json`, `core/README.md`, `core/tools/validate-adapters.js` | granica rdzeń ↔ adapter i to, co walidator egzekwuje |
| `core/process/session-signals.js` | rozpoznania startu sesji wołane przez oba dzisiejsze adaptery — trzeci ma je konsumować, nie kopiować |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 6 (zakres E7), sekcja 7 (P1, P2), sekcja 8 (praca naprzemienna) |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/REKOMENDACJA_MODELU/ODNOGA.md` | odnoga otwarta w E6; jeśli została wykonana przed tym etapem, adapter Codeksa dostaje własną listę modeli |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Adapter konsumuje rdzeń, nie kopiuje go** (P4). Rozpoznania startu sesji bierzesz
  z `core/process/session-signals.js`, skan sekretów z `core/guardrails/secret-scan.js`. Kopiowanie
  logiki między adapterami jest zakazane — walidator to sprawdza.
- **Warstwą nośną reguł jest warstwa zawsze-w-kontekście, nie skill** (L-0030). W Codeksie to
  `AGENTS.md` z twardym limitem `project_doc_max_bytes` = 32 KiB. Skill niesie procedurę, nigdy
  regułę — mechanizm `description` + dopasowanie to ten sam wzorzec, który przy R2 okazał się
  zależny od modelu.
- **Warstwa czytana przez model po angielsku, warstwa dla człowieka po polsku** (`USTAWIENIA`,
  wpis z 2026-08-12). `AGENTS.md` adaptera: angielski. README instalacji: polski.
- **Komendy i skille nie powstają drugi raz.** Instalator kopiuje je z adaptera Claude Code, tak
  jak robi to instalator Cursora.
- **Rozpoznanie opieraj na próbie i na buildzie, nie na dokumentacji** (L-0041). Sekcja 2
  `PRZENOSNOSC.md` ma dziś trzy pozycje `<DO UZUPEŁNIENIA>` — domknięcie ich jest częścią tego
  etapu, a każda pozycja dostaje etykietę źródła.
- **Guardrail wołany przez interpreter wymaga opakowania powłoki** (L-0043) — chyba że próba
  pokaże, że Codex zgłasza niewykonalny hook. Wtedy zapisujesz zmierzoną różnicę.
- **Materiał testowy guardraila składasz w czasie wykonania** (L-0046) — literał sekretu w pliku
  testowym blokuje własny hook.
- Wersja po tym etapie: **1.6.0**. Numer żyje w czterech miejscach (`core/MANIFEST.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, README adapterów) plus marker
  projektu — L-0008.

## Stan wyjściowy — co realnie zastajesz

RelAI **1.5.1** (E6 zamknięty 2026-08-17). Dwa adaptery na wspólnym rdzeniu, oba zmierzone na
żywych sesjach; Codex nie ma dziś w repozytorium **ani jednego pliku**.

```
core/                        # templates (20 SPEC + HTML_PLAN), guardrails, process/, tools/, MANIFEST
adapters/claude-code/        # dwa skille, dziesiec komend, dziesiec hookow
adapters/cursor/             # rules/*.mdc (alwaysApply), hooks/ (+ opakowania powloki), install.js, README.md
docs/PRZENOSNOSC.md          # sekcja 1 zmierzona (Cursor), sekcja 2 z dokumentacji (Codex), sekcja 3 = gwarancje
```

**Co wiadomo o Codeksie (z dokumentacji, sprawdzone 2026-08-12):** `AGENTS.md` czytany „before
doing any work", sklejany od korzenia w dół, limit 32 KiB; hooki w `hooks.json` albo `config.toml`
(`~/.codex/` i `<repo>/.codex/`), zdarzenia obejmują `SessionStart`, `PreToolUse`,
`PermissionRequest`, `PostToolUse`, `Stop`; blokada przez `permissionDecision: deny` albo kod
wyjścia 2; skille w `.agents/skills/<nazwa>/SKILL.md`, wywołanie `$nazwa`; własne prompty w
`$CODEX_HOME/prompts/`, wywołanie `/nazwa`.

**Czego NIE wiadomo — to jest materiał tego etapu:**

- czy `PreToolUse` Codeksa niesie **treść** zapisu (bez niej nie ma czego skanować) i które
  narzędzia obejmuje „supported tool call",
- jak wygląda **sandbox**: tryby zatwierdzania, dostęp poza katalogiem roboczym, dostęp sieciowy —
  bez tego nie wiadomo, czy adapter może prowadzić dokumenty projektu bez pytania przy każdym
  zapisie (`PRZENOSNOSC.md`, sekcja 2.4),
- czy przeglądarka hooków (`/hooks` w TUI) istnieje w wydanej wersji,
- czy limit 32 KiB wystarcza dla trzech reguł, które w Cursorze zajmują trzy pliki,
- czy praca naprzemienna Codex ↔ Cursor ↔ Claude Code na jednym projekcie nie rozjeżdża dokumentów.

**Czego nauczył pilotaż E6 (2026-08-17) — bierz to jako wejście, nie jako ciekawostkę:**

- proces przeżył zmianę dostawcy modelu (Grok 4.6 dowiózł cały etap z reguł zawsze-w-kontekście),
  więc **P2 dla Codeksa jest hipotezą do obalenia, nie pewnikiem**,
- blokada sekretu działa dwuwarstwowo: reguła odmawia pierwsza, hook łapie wtedy, gdy model
  spróbuje mimo reguły — obie warstwy mierz osobno,
- kontrola modelu mówi klasami („najsilniejszy"), co poza Claude Code nie wskazuje niczego
  konkretnego — odnoga `REKOMENDACJA_MODELU`,
- fałszywy alarm guardraila potrafi zamienić się w regułę nazewniczą w cudzym kodzie, jeśli nikt
  nie sprawdzi guardraila (L-0045).

**Bramki manualne planu (rozstrzyga człowiek, nie Ty):** sekwencja wydania, `claude /login` na
konto z limitem, `/relai-update` dla JiraManagera i PolyFlow, instalacja pre-commita. Trzy odnogi
(`OPIS_REPO`, `POMIAR_ODNOG`, `REKOMENDACJA_MODELU`) pozostają otwarte i nie należą do tego etapu.

## Zakres etapu

1. **Domknięcie rozpoznania Codeksa próbą** — sekcja 2 `PRZENOSNOSC.md` bez pozycji
   `<DO UZUPEŁNIENIA>`: payload `PreToolUse` (czy niesie treść), sandbox i dostęp do plików,
   przeglądarka hooków. Każda pozycja z etykietą źródła: **[próba]**, **[kod produktu]**,
   **[dokumentacja]**.
2. **`adapters/codex/` — warstwa nośna**: `AGENTS.md` (angielski) mieszczący rdzeń procesu
   w limicie 32 KiB. Gdy treść nie mieści się w jednym pliku, rozbijasz ją mechanizmem, który Codex
   naprawdę ma (sklejanie od korzenia w dół), a nie własnym wynalazkiem.
3. **Hooki adaptera**: kontekst startu sesji (`SessionStart`) i skan sekretów (`PreToolUse`),
   oba wołające rdzeń. Zachowanie przy braku interpretera zmierz — jeśli Codex milczy tak jak
   Cursor, dokładasz opakowanie powłoki (L-0043).
4. **Instalator** `adapters/codex/install.js` z deinstalacją i flagą rezygnacji ze skanu, wzorowany
   na instalatorze Cursora: reguły, komendy, skille, cache specyfikacji, wpisy hooków, spis
   instalacji, idempotentność.
5. **README instalacji po polsku** — z sekcją „czego w Codeksie nie ma" i z zachowaniem przy braku
   Node.js.
6. **Scenariusz akceptacyjny ten sam co w E6**, na realnym projekcie: start sesji, struktura, plan
   jako dokument, etap domknięty rytuałem, próba zapisu sekretu (obie warstwy osobno), zamknięcie
   sesji. Wynik każdego kroku zapisany dosłownie, także nieprzechodzący.
7. **Praca naprzemienna trzech narzędzi** na jednym projekcie — dokumenty bez rozjazdu, marker
   wersji nietknięty przez samo otwarcie.
8. **Tabela gwarancji**: kolumna Codex przestaje być kolumną z dokumentacji. Wiersz, który się nie
   potwierdził, poprawiasz — nie tłumaczysz.
9. **Ryzyka P1 i P2** — rozstrzygnij wprost dla Codeksa: zamknięte, obniżone czy bez zmiany.
   Zamknięcie wymaga dowodu z próby.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `docs/PRZENOSNOSC.md` sekcja 2 nie zawiera ani jednej pozycji `<DO UZUPEŁNIENIA>`; każda
      pozycja ma etykietę źródła, a co najmniej payload `PreToolUse` i sandbox są oznaczone
      **[próba]**.
- [ ] `adapters/codex/` zawiera warstwę nośną, dwa hooki, instalator i README; **żaden** plik nie
      duplikuje logiki rdzenia — dowód: `node core/tools/validate-adapters.js` kończy się kodem 0
      przy **trzech** adapterach i wykrywa podłożony duplikat (dowód negatywny na kopii).
- [ ] Warstwa nośna mieści się w limicie: rozmiar plików `AGENTS.md` adaptera zmierzony w bajtach
      i porównany z `project_doc_max_bytes` (32 KiB); wynik zapisany liczbą.
- [ ] Instalacja w czystym projekcie i deinstalacja: po instalacji wszystkie zadeklarowane pliki
      istnieją, po deinstalacji znikają wyłącznie one (dowód negatywny na `docs/` i `CLAUDE.md`).
- [ ] Sześć kroków scenariusza akceptacyjnego ma **zapisany wynik każdego**. Krok „próba zapisu
      sekretu" rozróżnia warstwę reguły i warstwę hooka, z dowodem negatywnym (plik nie powstał).
- [ ] Praca naprzemienna trzech narzędzi sprawdzona na jednym projekcie: `git status` i zawartość
      `docs/` bez rozjazdu, marker wersji nietknięty.
- [ ] Adaptery Claude Code i Cursor niezmienione w zachowaniu — instrument porównawczy w jednym
      przebiegu (L-0040), komplet zgodnych werdyktów; punkt obowiązkowy, bo ten etap dotyka rdzenia.
- [ ] `claude plugin validate .claude-plugin/plugin.json` → „Validation passed" z jedynym znanym
      ostrzeżeniem (L-0003); numery wersji 1.6.0 spójne we wszystkich źródłach (L-0008).
- [ ] Wpis w `docs/DZIENNIK.md` (komplet czterech sekcji, podpis z członem użytkownika),
      `docs/STATE.md` nadpisany, ryzyka P1 i P2 rozstrzygnięte wprost, `git status --short` bez
      śmieci po testach.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E7 → ZREALIZOWANY (data), E8 → GOTOWY DO STARTU, link
   do `PROMPT_ETAP_8.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcję „Bramki manualne"
   odśwież; sekcji „Odnogi" nie ruszasz, chyba że któraś została domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (<model>) + <git config>`.
   Lekcje → `docs/LEKCJE.md` + odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz „Co działa", „Nad czym pracujemy teraz", „Co blokuje" i liczby.
4. **Wygeneruj `PROMPT_ETAP_8.md`** (wydanie 2.0.0 i dystrybucja) ze specyfikacji promptu
   etapowego, na bazie sekcji 6 planu (E8), realnego stanu repozytorium i wniosków z trzech
   adapterów. Etap bez tego kroku nie jest ukończony (D-34).
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij sekwencję wydania:
   push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` → restart
   aplikacji (L-0031); dla Cursora i Codeksa — ponowne uruchomienie instalatorów w projektach,
   które mają adapter.
