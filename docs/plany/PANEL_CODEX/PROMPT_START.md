# PROMPT_START — PANEL_CODEX: uzgodnienie planu z wynikiem PANEL_CLAUDE i akceptacja

Plan: PANEL_CODEX • Sesja: **start planu (przed E1)** • Wygenerowano: 2026-10-10 (autor: Opus 5.5,
w Claude Code, po zamknięciu PANEL_CLAUDE) • Wykonawca: **gpt-6.1-sol w Codeksie** (D-84/D-85 →
wyjątek PANEL_CODEX, 2026-10-08), `effort high`

> **Kontrola modelu:** tę sesję prowadzisz wyłącznie na **gpt-6.1-sol w Codeksie**. Inny model albo
> inne narzędzie → zatrzymaj się i poproś o przełączenie, zanim cokolwiek zapiszesz. Lista modeli
> Codeksa (`.claude/relai/MODELE-codex.md`, z 2026-09-05) nie zna jeszcze gpt-6.1-sol — to przypadek
> „spoza listy”: nie blokuje pracy, powiedz o nim jednym zdaniem i zaproponuj `/relai-models`
> w Codeksie jako osobny krok. `effort high`: od tej sesji zależy, czy E1 opisze świat, który
> istnieje.

## Po co jest ta sesja

PANEL_CLAUDE zamknięto 2026-10-10, a plan PANEL_CODEX powstał 2026-10-08, kiedy poprzednik dopiero
startował. Jego treść opisuje więc stan sprzed pracy, a nie jej wynik. Ta sesja:

1. przechodzi checklistę przejęcia `PRZEJECIE.md` na **realnym** stanie repozytorium;
2. uzgadnia `PLAN.html` z tym, co PANEL_CLAUDE naprawdę dowiózł (plan jest `DO AKCEPTACJI`, więc
   edytujesz go wprost — to nie są jeszcze aneksy);
3. prosi człowieka o akceptację planu i o aneks D-80 dla adaptera Codeksa;
4. po akceptacji generuje `PROMPT_ETAP_1.md` i ustawia E1 na `GOTOWY DO STARTU`.

**E1 w tej sesji nie startuje.** Etap wykonuje świeża sesja z `PROMPT_ETAP_1.md` (decyzja człowieka
2026-10-10: start planu i realizacja E1 w osobnych sesjach).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `AGENTS.md` | reguły procesu, rytuał startu, sekcja niemutowalna |
| `docs/STATE.md` | stan po wydaniu 2.8.0; sekcja „Panel `relai-panel` i rodzina pluginów” — opis tego, co przejmujesz |
| `docs/DZIENNIK.md` | „Stan otwartych ryzyk” (C1, C10, C11) i dwa ostatnie wpisy: E7 PANEL_CLAUDE i „Zamknięcie planu PANEL_CLAUDE” (dowiezione vs plan) |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” |
| `docs/DECYZJE.md` | D-80 z dwoma aneksami (2026-09-24, 2026-10-08) i wyjątek D-84/D-85 dla PANEL_CODEX |
| `docs/plany/PANEL_CODEX/STATUS.md`, `PRZEJECIE.md`, `PLAN.html` | plan, bramki, checklist przejęcia |
| `docs/archiwum/plany/PANEL_CLAUDE/STATUS.md` | poprzednik: ZREALIZOWANY 2026-10-10, 9/9 etapów, Aneksy A–E, bramki |
| `docs/PULAPKI.md` | P-008 (sandbox Codeksa bez Git Basha) i P-019–P-023 (silnik modów Claude — czego **nie** przenosić) |
| `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`, `SPEC_STATUS.md`, `SPEC_PLAN_HTML.md` | układ promptu E1, statusu i planu HTML |
| skill `relai-planning` — plik `html-plan.md` | jak zmieniać istniejący plan HTML (szablon, builder), zanim go dotkniesz |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wykonawca planu i etapów: gpt-6.1-sol w Codeksie, w świeżych sesjach (D-84/D-85 → wyjątek).
- Wariant A planu: adapter w `adapters/codex/panel/`, lokalny MCP App/server, logika w
  `core/panel/` przejęta po PANEL_CLAUDE. Warianty B, C i D odrzucone — nie wracają.
- Kolejność PANEL_CLAUDE → PANEL_CODEX spełniona: poprzednik ZREALIZOWANY 2026-10-10.
- Wszystkie funkcje z wywiadu (`docs/zasoby/PANEL_RELAI/WYWIAD.md`) zostają w zakresie.
- PANEL_CLAUDE jest zamknięty i zarchiwizowany: jego pliki, plan i pluginy Claude Code
  (`panel/`, `progress/`, `cache-keeper/`) **nie są** przedmiotem tej sesji ani tego planu
  (nie-cel planu: „drugi panel Claude Code Mods, przebudowa jego zamrożonego planu”).
- Publikacja czegokolwiek — tylko po osobnej zgodzie człowieka, w E8.
- **Granica tej sesji:** dokumenty planu, rejestr decyzji, stan, dziennik i `PROMPT_ETAP_1.md`.
  Zero kodu, zero zmian w `core/`, `adapters/`, `panel/`, zero instalacji.

## Stan wyjściowy — co PANEL_CLAUDE realnie zostawił (FAKT, 2026-10-10)

Sprawdź każdy punkt w repozytorium; ten opis jest punktem wyjścia, nie dowodem.

- **Wydanie:** RelAI **2.8.0** publicznie (tag `v2.8.0`, release Latest, 2026-10-09). Marketplace
  Claude Code (`.claude-plugin/marketplace.json`) ma cztery wpisy: `relai` 2.8.0 i trzy pluginy modów
  „early access” — `relai-panel` 0.9.0, `relai-progress` 0.2.0, `relai-cache-keeper` 0.3.0.
  Marketplace Codeksa (`.agents/plugins/marketplace.json`) ma tylko `relai`.
- **Rdzeń `core/panel/`** — 15 modułów ESM z JSDoc (`agents`, `attribution`, `cache-timer`,
  `charts`, `commands`, `decisions`, `documents`, `flow`, `headings`, `measure`, `phrases`,
  `plan-state`, `pricing`, `progress`, `theme`) i 15 plików testów w `core/panel/tests/`.
  Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js
  adapters/codex/tests/*.test.js core/panel/tests/*.test.js` → **263/263** (także w czystym
  `git worktree`). Kopia do pluginów wyłącznie przez `node core/tools/sync-panel-core.js`
  (`--check` sprawdza zgodność); lista celów kopii (`PLUGINS`) zna dziś tylko trzy pluginy Claude.
- **Kontrakt pomiaru** (`core/panel/measure.mjs`): `SCHEMA = 1`, `RECORD_FIELDS` = `v, tool,
  session, turn, index, agent, kind, model, at, input, cacheRead, cacheWrite, output, missing,
  stage, task`. Pole `tool` powstało z myślą o panelu Codeksa (decyzja E3 PANEL_CLAUDE). Plik na
  sesję: `.claude/relai/pomiary/<data>-<sesja>.jsonl`, rekord bez treści rozmowy (~250 B), poza
  gitem. Klucz bez podwójnego liczenia: sesja + tura + indeks + agent. `stage` i `task` przypisują
  koszt do etapu i zadania załogi (`attribution.mjs`), suma pozycji = suma sesji co do centa.
  Otwarte (C10): ok. 9% przyrostu licznika silnika Claude to wywołania spoza pętli, opisane słowami.
- **Semantyka tokenów jest Anthropic:** `input` **nie obejmuje** cache. Wejście OpenAI cache
  obejmuje — normalizacja dostawcy przed agregacją jest zadaniem Codeksa (ryzyko C3 planu).
- **Cennik** (`pricing.mjs`): tylko modele Anthropic; datowane wersje w
  `.claude/relai/panel/cennik.json`, każdy rekord liczony stawką obowiązującą w chwili pomiaru;
  aktualizacja z karty — jeden odczyt strony cennika Anthropic po „Tak”, zapis po drugim „Tak”.
  Stawek OpenAI nie ma.
- **Timer cache** (`cache-timer.mjs`) niesie heurystykę Claude (wątek główny 1 h, subagent
  i kompakcja 5 min — P-020); w rodzinie Claude timer żyje tylko w `relai-cache-keeper`. Codeks
  jej nie dziedziczy (cel planu i ryzyko C6).
- **Decyzje i karta** (`decisions.mjs`): każde działanie zmieniające stan przez kartę „Tak / Nie”
  (R4). `/relai-stage` przyjmuje znacznik `--zgoda-panelu <id>` (procedura w
  `adapters/claude-code/commands/relai-stage.md` i **wygenerowany z niej skill Codeksa**
  `adapters/codex/skills/relai-stage/`). W Claude Code znacznik wpisany ręcznie wycina hook panelu;
  w Codeksie takiego strażnika jeszcze nie ma. Pomiar na żywo startu z karty — niezmierzony
  (bramka E5 PANEL_CLAUDE pominięta decyzją człowieka).
- **Mapa i załoga** (`flow.mjs`): plany z `docs/plany/` i `docs/archiwum/plany/`, przebiegi
  `/relai-crew` z `.claude/relai/work/CREW/`, scalenia jako widok w
  `.claude/relai/panel/scalenia.json` (pliki przebiegu nietknięte).
- **Dokumenty** (`documents.mjs`): półka i drzewo z limitem (60 wierszy, 40 plików na folder —
  L-0158), diff wyłącznie przez zamknięte argv `git` dla plików z listy dokumentów.
- **Walidator** `core/tools/validate-adapters.js`, punkt 5a: wpis marketplace ze źródłem innym niż
  `./` musi mieć wersję równą `plugin.json` swojego pluginu — dotyczy dziś marketplace Claude Code.
- **Czego nie przenosić:** wszystko, co w PANEL_CLAUDE dotyczy silnika modów Claude (`$`, `on`,
  `ui.render`, AbovePrompt, P-019–P-023) — to warstwa gospodarza Claude, nie rdzeń.

**Czego jeszcze nie ma:** adaptera `adapters/codex/panel/`, mapowania pól Codeksa na kontrakt,
stawek OpenAI, profilu cache Codeksa, strażnika znacznika zgody po stronie Codeksa, wpisu panelu
w marketplace Codeksa, aneksu D-80 dla adaptera Codeksa i `PROMPT_ETAP_1.md`.

## Zakres sesji

**Katalog roboczy tej sesji: `.claude/relai/work/PANEL_CODEX/START/`** — notatki i zrzuty różnic
planu tylko tam.

1. **Rytuał startu i model** — wg `AGENTS.md`; kontrola modelu z nagłówka.
2. **`PRZEJECIE.md`** — każdy punkt sprawdzony w repo, odhaczony z jednym zdaniem dowodu (plik,
   komenda, wynik). Punkt, który nie przechodzi, zostaje nieodhaczony z powodem — wtedy E1
   pozostaje `OCZEKUJE`, a sesja kończy się raportem. Test rdzenia uruchamiasz komendą ze „Stanu
   wyjściowego” i zapisujesz liczbę (to „punkt porównania” checklisty). Bez Git Basha w sandboksie
   (P-008): polecenia przez `node` albo PowerShell.
3. **`PLAN.html` — uzgodnienie ze stanem faktycznym**, wg `html-plan.md` i `SPEC_PLAN_HTML.md`,
   etykiety FAKT / SZACUNEK przy każdej liczbie. Co najmniej:
   - streszczenie i sekcja 3: 2.8.0 zamiast 2.7.1, PANEL_CLAUDE **zamknięty** zamiast „implementacja
     trwa / pozostaje aktywny”, faktyczny kontrakt z listy wyżej;
   - sekcja 5 i 6: E1–E3 opierają się na istniejących modułach i schemacie `SCHEMA = 1` (pole
     `tool`); nazwij, gdzie Codeks rozszerza kontrakt (normalizacja OpenAI, stawki OpenAI, profil
     cache) i że każda zmiana `core/panel/` przechodzi testy obu konsumentów, w tym `plugin test`
     trzech pluginów Claude;
   - E4: strażnik znacznika `--zgoda-panelu` po stronie Codeksa (skill `relai-stage` jest wspólny);
   - E8: wpis w `.agents/plugins/marketplace.json` i rozszerzenie walidatora 5a na marketplace
     Codeksa;
   - sekcja 9 i źródła: link do `docs/archiwum/plany/PANEL_CLAUDE/STATUS.md`.
   Zakresu, celów i wariantu **nie zmieniasz** — tylko fakty. Coś, co zmienia zakres albo
   szacunek etapu o więcej niż połowę → osobne pytanie do człowieka w punkcie 4, nie cicha edycja.
4. **Jedno pytanie do człowieka** (narzędzie pytań Codeksa; tekst w czacie, gdy go nie ma) —
   wszystko naraz, rekomendacja pierwsza z powodem: (a) akceptacja planu w wersji uzgodnionej
   (z listą zmian treści); (b) aneks D-80 w brzmieniu z sekcji 9 planu: GUI i telemetria obejmują
   także adapter Codeksa dla panelu RelAI, lokalne pomiary, wspólny `core/panel/`, pozostałe
   wykluczenia bez zmian; (c) tylko jeśli wyszły w punktach 2–3 — rozstrzygnięcia zmieniające
   zakres. Milczenie i „ok” bez wskazania punktu nie są akceptacją.
5. **Po „tak” na (a) i (b):**
   - `docs/DECYZJE.md` — wiersz `D-80 → aneks` z dzisiejszą datą, treścią i powodem;
   - `STATUS.md` — `ZAAKCEPTOWANY <data>`, bramki „Akceptacja PANEL_CODEX” i „Aneks D-80” →
     `ROZSTRZYGNIĘTA <data> — <jak>`, E1 → `GOTOWY DO STARTU`, linia w dzienniku wdrożenia;
   - **`PROMPT_ETAP_1.md`** wg `SPEC_PROMPT_ETAPU.md` (dziewięć sekcji, w tej kolejności;
     „Zasady aktywne” przepisane **w całości**; katalog roboczy
     `.claude/relai/work/PANEL_CODEX/E1/`; „Stan wyjściowy” z realnego stanu po punktach 2–3, nie
     z tego promptu), link w kolumnie `Prompt` przy E1;
   - `AGENTS.md` **i** `CLAUDE.md` (źródłem prawdy jest `CLAUDE.md`, kopia w tej samej turze) —
     linia „Aktywny plan” i wiersz PANEL_CODEX w „Stan prac”;
   - `docs/STATE.md` — „Nad czym pracujemy teraz”.
   Odpowiedź „nie” albo poprawki → plan zostaje `DO AKCEPTACJI`, wracasz do punktu 3 z poprawkami.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Model sesji: gpt-6.1-sol w Codeksie, zapisany w dzienniku; przypadek „spoza listy” nazwany.
- [ ] `PRZEJECIE.md`: każdy punkt odhaczony z dowodem albo nieodhaczony z powodem; testy repo —
      liczba zapisana (oczekiwane 263/263, FAKT 2026-10-10).
- [ ] `PLAN.html` po zmianie: żadnego „2.7.1”, „implementacja trwa”, „pozostaje aktywny” ani linku
      do `docs/plany/PANEL_CLAUDE/` — sprawdzone wyszukaniem w pliku (kontrola pozytywna: to samo
      wyszukanie na wersji sprzed zmiany z gita zwraca trafienia).
- [ ] Odpowiedzi człowieka zapisane z datą w dzienniku; bez „tak” na (a) i (b) — punkt 5 nie
      wykonany, E1 `OCZEKUJE`.
- [ ] Po akceptacji: `PROMPT_ETAP_1.md` ma dziewięć sekcji specyfikacji w kolejności, „Zasady
      aktywne” równe sekcji z `LEKCJE.md`, linię katalogu roboczego; link w `STATUS.md` prowadzi do
      istniejącego pliku.
- [ ] `node core/tools/validate-adapters.js` — exit 0; testy repo — bez zmian liczby (sesja nie
      dotyka kodu).
- [ ] `git status`: zmienione wyłącznie dokumenty z zakresu tej sesji; zero plików w `core/`,
      `adapters/`, `panel/`, `progress/`, `cache-keeper/`.
- [ ] Katalog roboczy `.claude/relai/work/PANEL_CODEX/START/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”.

## Na koniec

1. Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”: Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (gpt-6.1-sol) + Lukasz`.
   Lekcje z sesji → `docs/LEKCJE.md` i „Zasady aktywne”.
2. Commit conventional po angielsku — propozycja, wykonanie po zgodzie człowieka. Bez pushu.
3. Ostatnie zdanie do człowieka: jak ruszyć E1 — świeża sesja Codeksa na gpt-6.1-sol,
   skill `relai-stage` (w Codeksie wywołany tak, jak skille RelAI wywołuje się w tej instalacji —
   albo zdaniem „uruchom etap E1 planu PANEL_CODEX”), `effort high`.
