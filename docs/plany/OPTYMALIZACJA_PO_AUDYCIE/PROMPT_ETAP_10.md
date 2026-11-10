# PROMPT_ETAP_10 — Prompty etapów i rytuały: numery zasad zamiast odpisu, opisy rytuałów zgodne z procedurami

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E10 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E9) • Wykonawca: **Codex gpt-6.1-terra (effort high), poprawki gpt-6.1-sol; orkiestracja, testy, rejestr i rytuał — Opus 5.5 w Claude Code** (Aneks A, [ANEKS_A_WYKONANIE_CODEX.md](ANEKS_A_WYKONANIE_CODEX.md)) — `/effort medium` dla sesji Claude

> **Kontrola modelu:** pracę wykonawczą (edycje tekstu i nowy plik testu) robi model klasy
> **balanced** w Codeksie: **gpt-6.1-terra** (lista modeli codex z dnia `2026-11-10`), uruchamiany
> przez Claude poleceniem `node core/process/crew.js run --runtime codex --role coder --write
> --model gpt-6.1-terra` z repozytorium (nie kopią `.claude/relai/tools/crew.js` — ryzyko AX1).
> Sesja Claude, która czyta ten prompt, musi działać na **Opus 5.5** (orkiestrator); inny model →
> zatrzymaj się i poproś o przełączenie. Zalecany poziom `/effort` sesji Claude: `medium` (karty
> niosą gotowe bloki PRZED → PO i kod testu; praca to wierna realizacja kart i recenzja).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/ANEKS_A_WYKONANIE_CODEX.md` — sekcje 4 i 7 | przepływ etapu w Codeksie, nakładka 4.1, przypadki brzegowe |
| `docs/LEKCJE.md` — wpis L-0316 | dwie granice Codeksa zmierzone w E9 — **wiążą przepływ tego etapu** (sekcja „Decyzje już podjęte”) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie, „kotwica nie pasuje → stop”, komendy testów, sekcja 5 (generator, `ARTEFAKTY.md`), sekcja 6 (backtick, ASCII, `cd`) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E10_PROMPTY_ETAPOW_I_RYTUALY.md` — całość | **zakres etapu**: cztery karty (K-A1, K-E1, K-E7, K-R10) z blokami PRZED → PO, kodem testu i krokiem 4 rytuału |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E10 w sekcji 6 (Grep `E10_PROMPTY` z kontekstem 6 linii; pliku nie otwierasz w całości) | cel etapu słowami planu |
| `docs/LEKCJE.md` — pełne brzmienie zasad 1, 3, 5, 8 i 11 | 1: cała rodzina dokumentów (prompt etapu i prompt odnogi); 3: asercje „nieobecne” w teście; 5: łamanie linii i cudzysłowy mieszane w kotwicach; 8: zdanie Aneksu D w warstwie obecnej w każdej sesji; 11: numeracja kroków liczona przez walidator |
| `docs/DZIENNIK.md` — ostatni wpis (E9) | punkt wyjścia: `core/process` 421, cursor 10, codex 28, guardrails 33; pomiar Aneksu A |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od 2026-11-09 (D-33). Kotwica nie pasuje, test „najpierw” zielony
  przed zmianą, walidator zgłasza rozjazd rytuału albo `ritual-texts.test.js` już istnieje z inną
  treścią → zatrzymujesz się i pytasz; karty nie poprawiasz.
- Kolejność kart: **K-A1 → K-E1 → K-E7 → K-R10**; commit jeden na etap.
- **Wykonanie wg Aneksu A (D-85 → aneks) i L-0316 — dwa przebiegi Codeksa:**
  (1) Codex zakłada `core/process/tests/ritual-texts.test.js` z trzema przypadkami z kart
  (K-A1, K-E1, K-E7) dosłownie i **nic poza tym** → Claude uruchamia test na czerwono i zapisuje
  przebieg; (2) Codex wdraża zmiany tekstu K-A1, K-E1, K-E7 **bez zmiany testu** i uruchamia
  generator skilli Codeksa → Claude uruchamia testy na zielono, walidator i resztę Weryfikacji.
  Plik zadania = ten prompt + nakładka 4.1 aneksu, z dopiskami: sandbox Codeksa na Windows nie
  uruchamia `node --test` (`spawn EPERM`) — testów nie uruchamia i to nie jest `STOP`; wszystko
  pod `docs/` należy do Claude (preambuła roli `coder`, D-44). W tym etapie jedyna zmiana
  w `docs/` to `docs/ARTEFAKTY.md` (K-R10) i `docs/STATE.md` (krok 4 rytuału) — obie robi Claude.
  Effort (decyzja Łukasza 2026-11-10, bramka w `STATUS.md`): `gpt-6-luna` na `xhigh`,
  `gpt-6.1-terra` i `gpt-6.1-sol` na `high`. `crew.js` przekazuje tylko `-m`, a
  `high` dla terra/sol ustawia Łukasz w konfiguracji Codeksa (`crew.js` bez zmian) — przed
  przebiegiem przeczytaj `~/.codex/config.toml` i sprawdź, czy terra dostanie `high`; nie dostanie
  → powiedz o tym w karcie startu, zanim uruchomisz Codeksa.
- `--files` przebiegu (granica Codeksa) = pola „Pliki” kart K-A1, K-E1, K-E7 bez `docs/` plus kopie
  Codeksa z kroków generatora kart i katalog roboczy etapu.
- K-A1 nie przepisuje wstecz `docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md` (plan wstrzymany) — pytanie
  do człowieka w podsumowaniu etapu. `CLAUDE.md` i `AGENTS.md` tego repo **nie ruszasz** (mają
  zdanie Aneksu D; K-E1r z E1).
- K-R10: wersje bierzesz **z pliku** (karta podaje stan `main @ 5aeab39`; E8–E9 podbiły część
  wierszy — FAKT 2026-11-10 niżej). Jedno podbicie na plik za cały etap.
- **D-41 bez zmian**: blokują wyłącznie `secret-scanner` i `config-protection`. Kontrola
  `readme-hooki` w `release-check.js` jest **czerwona do K-E9 w E14** — stan oczekiwany.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, tagów i zmiany numerów wersji aż do
  E14. W sesji działają hooki zainstalowanego pluginu 3.7.0.
- Granica zakresu: pliki z pól „Pliki” czterech kart. Rotacja lekcji w `rotate.js` (świadomie poza
  kartami — do wpisu jako „świadomie odłożone”), `session-close.md`, `SPEC_ARCHIWUM.md`,
  `relai-handover.md`, `relai-tour.md`, `SPEC_LEKCJE.md`, akapit D-88 „Trzy wagi i cel”,
  fragment-kotwica K-E2 w `relai-planning.mdc` (E11), hooki (E4, E5, E11), skracanie komórek
  rejestru (K-E6, E11), liczebniki (E14) — nie ruszasz. Rotacji dokumentów zgłoszonych na starcie
  nie wykonujesz w tym etapie.

## Stan wyjściowy (co realnie zastajesz po E9)

RelAI 3.7.0; gałąź `optymalizacja/po-audycie` z commitami E1–E8, aneksu A i — jeśli człowiek go
przyjął — commitem E9 (`git log --oneline -3`; brak commita E9 → zmiany E9 leżą w drzewie roboczym,
zostawiasz je i pytasz, zanim zaczniesz). E9 zmienił m.in. `relai-core/SKILL.md` (zdanie wyjątku
„pierwsza wiadomość to komenda”), `SPEC_CLAUDE_MD.md` (to samo zdanie, dwa miejsca),
`relai-core.mdc` i `docs/ARTEFAKTY.md` (sześć wierszy). Kotwice E10 sprawdzone grepem 2026-11-10
po E9 (FAKT) — wszystkie są:

```
core/templates/SPEC_PROMPT_ETAPU.md   369 linii; "aktywne zasady z rejestru lekcji" (l. 91),
                                      "przepisaną w całości (nie linkiem)" (l. 118),
                                      "punkt zastępujesz wskazaniem" (l. 217)
core/templates/SPEC_ODNOGA.md         "przepisane w całości" (l. 146 i 293)
core/templates/SPEC_CLAUDE_MD.md      "sync dokumentów, wpis do dziennika" (l. 140 i 265)
adapters/claude-code/skills/relai-core/SKILL.md          "Pytania są dwa" (l. 198)
adapters/claude-code/skills/relai-core/document-rotation.md  "nie z pamięci" (l. 14)
adapters/claude-code/skills/relai-planning/stage-closing.md  "Jedyny punkt ..." (l. 44)
adapters/claude-code/skills/relai-planning/plan-closing.md   "Punkty 3–8 nie są" (l. 72)
adapters/claude-code/skills/relai-planning/deviation-and-branches.md  "przepisanych w całości" (l. 48)
adapters/claude-code/commands/relai-stage.md   "i z sekcji „Zasady aktywne"" (l. 68)
adapters/claude-code/commands/relai-branch.md  "przepisanymi w całości" (l. 78)
adapters/claude-code/commands/relai-update.md  "bez członu o sprzątaniu" (l. 59)
adapters/cursor/rules/relai-core.mdc           "See `SPEC_ARCHIWUM.md`, read it from" (l. 149)
adapters/cursor/rules/relai-planning.mdc       "active lessons. A stage without" (l. 71);
                                               "are blocking: until they are resolved" (l. 78)
core/process/tests/ritual-texts.test.js        NIE ISTNIEJE (zakłada K-A1)
adapters/*/skills/relai-planning/{plan,stage}-closing.md  status M przy pustym git diff (końce linii)
                                      - stan zastany; po edycji K-E1/K-E7 mają realny diff
.claude/launch.json                   nieśledzony, spoza planu - nie dodajesz do commita
docs/ARTEFAKTY.md (wersje, FAKT 2026-11-10): SPEC_PROMPT_ETAPU 11, SPEC_CLAUDE_MD 10, SPEC_ODNOGA 5,
  stage-prompts 1, deviation-and-branches 1, stage-closing 2, plan-closing 4, relai-core/SKILL 31,
  document-rotation 3, relai-stage 12, relai-branch 4, relai-update 26, relai-core.mdc 10,
  relai-planning.mdc 4 — 14 wierszy
```

Testy (konwencje, sekcja 4) uruchamia **Claude**, z katalogu repozytorium, ścieżką względną, bez
`cd`: `node --test "core/process/tests/*.test.*"` ok. 110 s (SZACUNEK) — w tle. Po etapie:
`core/process` **424** (421 + 3: K-A1, K-E1, K-E7 po jednym przypadku), `adapters/cursor` 10
i `adapters/codex` 28 bez zmian, `core/guardrails` 33. `validate-adapters.js`: kod 0, jedno
ostrzeżenie (`security-audit/SKILL.md`), `rytual "Na koniec": 3 list, kroki [1,1a,2,3,4,5,6]`,
`wywolania z hooks.json: 20`.

**Czego jeszcze nie ma:** wzoru promptu etapu i odnogi z numerami zasad zamiast odpisu (zakaz
odpisu w „Zakazach”); zdania Aneksu D w szablonie `CLAUDE.md`; opisów „kończymy na dziś”, rytuału
etapu i zamknięcia planu zgodnych z procedurami (kolejność rotacja → sprzątanie → wpis; trzy
pytania; pytanie o następcę planu); czytania `SPEC_ARCHIWUM.md` tylko na ścieżce ręcznej; jednego
wpisu i jednej aktualizacji `STATE.md` na ostatnim etapie planu; pliku `ritual-texts.test.js`.

**Zasady aktywne — indeks z rejestru lekcji** (stan 2026-11-10 po E9; pełne brzmienie doczytujesz
z `docs/LEKCJE.md` przy trafieniu w wyzwalacz):

- **1 · Specyfikacja dokumentu jest kompletna albo martwa** — piszesz albo zmieniasz specyfikację
  (`SPEC_*`), prompt etapu, regułę produkującą tekst, punkt Weryfikacji albo FAKT do sprawdzenia.
- **2 · W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — wpisujesz komendę,
  frazę albo polecenie do README, `KOMENDY.md`, skilla albo do czatu dla człowieka.
- **3 · Test „czegoś nie wolno” wymaga dowodu negatywnego** — piszesz test nieobecności, kontrolę
  „stary tekst nie może zostać” albo chronisz fragment przed zmianą.
- **4 · Dowodzisz efektem, nie zdarzeniem** — planujesz dowód zmiany: kryterium, materiał testu,
  porównanie przed i po, worktree, pomiar na żywo w przeglądarce albo w modzie.
- **5 · Instrument pomiarowy sam bywa źródłem fałszu** — piszesz wyrażenie regularne, ścieżkę
  Windows, skrypt edycji, parser albo licznik; porównujesz dwa drzewa; mierzysz sesją `claude -p`,
  terminalem albo cudzą usługą.
- **6 · Próg jest liczbą, którą ktoś liczy** — ustalasz albo zmieniasz próg, budżet, limit albo
  liczbę w komunikacie.
- **7 · Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień** — kod czyta komórkę,
  wiersz albo pole dokumentu (tabela, ustawienia, status).
- **8 · Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
  decydujesz, gdzie mieszka zachowanie (`CLAUDE.md`, hook, skill, plik doczytywany) albo stan
  pisany przez model.
- **9 · Skill nie zakłada dostępu poza katalogiem roboczym** — piszesz albo zmieniasz skill: opis,
  frazy, krok sięgający poza projekt.
- **10 · Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI** — mierzysz plugin
  wydany albo niewydany, podbijasz wersję albo wydajesz.
- **11 · Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
  warianty** — liczysz sumy, dopasowujesz nagłówek albo linię, przenosisz katalog z cudzego
  manifestu, przepisujesz regułę dostawcy.
- **12 · Guardrail zatrzymujący nie-sekret to defekt rdzenia** — hook albo bramka blokuje coś, co
  nie jest sekretem, albo piszesz bramkę czytającą wejście.
- **13 · Cudze narzędzie poznajesz z wydanego builda i z próby** — pracujesz z cudzym CLI, API
  modów, payloadem hooka, sesjami harnessu albo usługą zewnętrzną.
- **14 · Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje** — obowiązuje w każdym
  zadaniu: weryfikację planujesz tam, gdzie wykonalna; po pytaniu sprzątasz sam; jednostką
  inwentarza jest sprawa, nie linia; wstawkę kotwiczysz do elementu, który przeżyje operację,
  i dowodzisz **obecności** nowej treści. Gdy prompt etapu przeczy regule dokumentu docelowego —
  wygrywa dokument, rozjazd do dziennika. Opcja pytania, która odwołuje się do wariantu planu,
  cytuje jego definicję z planu.
- **15 · Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są
  ASCII** — dodajesz pytanie do człowieka, komponent opcjonalny albo komunikat hooka; każda praca
  nad wyglądem (mod, panel, strona, film, scena 3D, makieta).

Z etapu E9 (L-0316): Codex nie edytuje `docs/` i nie uruchamia testów — plik zadania od pierwszego
przebiegu oddaje to Claude'owi; etap idzie dwoma przebiegami (testy → czerwień u Claude →
wdrożenie → zieleń u Claude). Z E8 (L-0315): asercja „nieobecne” celuje w brzmienie, które zmiana
usuwa — fragmenty testu K-A1 są dosłownie z plików, a cudzysłowy zamykające w kotwicach bywają
mieszane (`„…"` i `„…”`): kopiujesz z pliku, nie z karty.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E10/`.** Wszystko
> tymczasowe — plik zadania dla Codeksa, przebiegi czerwone i zielone, wyjścia narzędzi — powstaje
> tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon
> cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu
> projektu. Przebiegi `crew.js` zapisują się w `.claude/relai/work/CREW/<data_czas>/` — liczysz je
> razem z katalogiem etapu.

1. **Plik zadania i przebieg 1 (Claude → Codex)** — `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E10/zadanie.md`
   = nakładka 4.1 aneksu z dopiskami z „Decyzji już podjętych” + ten prompt. Przebieg 1 zakłada
   **`core/process/tests/ritual-texts.test.js`** z kodem z kart: nagłówek i przypadek K-A1
   (`stage prompt names rule numbers and never copies active rules`), przypadek K-E1
   (`close rituals list the same steps and questions as their procedures`), przypadek K-E7
   (`rotation spec only on manual paths, last stage writes the entry once`). Claude czyta cały
   diff testu wobec kart (AX2) i uruchamia go na czerwono — trzy przypadki czerwone z asercji.
2. **K-A1 (przebieg 2)** — `core/templates/SPEC_PROMPT_ETAPU.md` (sekcje 4, 6, „Zakazy”, przykład),
   `core/templates/SPEC_ODNOGA.md`, `core/templates/SPEC_CLAUDE_MD.md` (zdanie Aneksu D, dwa
   miejsca), `adapters/claude-code/skills/relai-planning/stage-prompts.md`,
   `adapters/claude-code/skills/relai-planning/deviation-and-branches.md`,
   `adapters/claude-code/commands/relai-stage.md`, `adapters/claude-code/commands/relai-branch.md`,
   `adapters/cursor/rules/relai-planning.mdc` — bloki PRZED → PO z karty, dziesięć zmian.
3. **K-E1 (przebieg 2)** — `SPEC_CLAUDE_MD.md` (linia fraz sesji i przykład Parkly),
   `relai-core/SKILL.md` (akapit „kończymy na dziś”), `stage-closing.md` (punkt 6),
   `plan-closing.md` (akapit pod listą), `relai-stage.md` (Krok 6), `relai-update.md` (wiersz 59,
   jedna linia, bez `|` w treści).
4. **K-E7 (przebieg 2)** — `relai-core/document-rotation.md`, `adapters/cursor/rules/relai-core.mdc`
   (krok 2 sekcji 4), `stage-closing.md` (akapit „Ostatni etap planu.” — żadna linia nie zaczyna
   się od „cyfra, kropka, spacja”), `plan-closing.md` (punkty 1, 3, 4), `SPEC_PROMPT_ETAPU.md`
   (sekcja 9), `relai-stage.md` (Krok 6), `relai-planning.mdc` (akapit po „are blocking…”,
   kotwica K-E2 nietknięta).
5. **Generator** — `node adapters/codex/generate-skills.js` po kartach (Codex); kopie Codeksa
   z list kart: `relai-planning/{stage-prompts,deviation-and-branches,stage-closing,plan-closing}.md`,
   `relai-core/{SKILL,document-rotation}.md`, `relai-stage/SKILL.md`, `relai-branch/SKILL.md`,
   `relai-update/SKILL.md`.
6. **K-R10 (Claude)** — `docs/ARTEFAKTY.md`: 14 wierszy, wersja +1 od wartości z pliku, wpis
   `2026-…(wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E10, karty …): … Powód: ….` na początku komórki
   „Co się zmieniło”; kontrola `node core/tools/release-check.js --json --tylko artefakty` przed
   (błędy „bez nowego wpisu”) i po (`"bledy":[]`).
7. **Git.** Bez `push`. Jeden commit etapu (`docs:` albo `refactor:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Dokumenty z backtickiem — wyłącznie edycją pliku (Edit/Write w Claude, edycja pliku w Codeksie;
nigdy `sed` ani `node -e`). Skilli Codeksa nie edytujesz ręcznie — tylko generator. Wątek spoza kart
→ zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_10.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E9 (albo człowiek rozstrzygnął, co z drzewem).
- [ ] Testy przed zmianą: `node --test core/process/tests/ritual-texts.test.js` → 3 fail z asercji
      (K-A1 na pierwszej asercji „nieobecne”, K-E1 na liczbie wystąpień `0` zamiast `2`, K-E7 na
      asercji „nieobecne”), przebieg zapisany w katalogu roboczym; diff testu przeczytany w całości
      i zgodny z kartami.
- [ ] Po zmianie: `node --test core/process/tests/ritual-texts.test.js` → 3 pass;
      `node --test core/process/tests/ritual-copies.test.js` → zielony.
- [ ] `node --test "core/process/tests/*.test.*"` → **424 pass** (albo suma od wpisu E9 plus 3,
      opisana), 0 fail; `adapters/cursor` → 10; `adapters/codex` → 28; `core/guardrails` → 33.
- [ ] Greps z kart: `grep -rn "przepisan[a-ząę]* w całości" core/templates adapters/claude-code/commands adapters/claude-code/skills/relai-planning`
      → brak; `grep -c "Pytania są dwa"` w obu `relai-core/SKILL.md` → 0; `grep -c "Jedyny punkt
      tego rytuału" adapters/*/skills/relai-planning/stage-closing.md` → 0 w obu; `grep -c
      "nie z pamięci" adapters/claude-code/skills/relai-core/document-rotation.md` → 0.
- [ ] Dowód negatywny (zasada 3): `git diff --stat CLAUDE.md AGENTS.md
      docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md core/tools/rotate.js` → pusty;
      fragment ``folder to `docs/archiwum/plany/` → update the "Aktywny plan" line`` w
      `adapters/cursor/rules/relai-planning.mdc` obecny (kotwica K-E2).
- [ ] `node adapters/codex/generate-skills.js --verify` → kod 0; `node core/tools/validate-adapters.js`
      → kod 0, jedno ostrzeżenie, `rytual "Na koniec": 3 list, kroki [1,1a,2,3,4,5,6]`,
      `parytet … 0 rozjazdow`, `wywolania z hooks.json: 20`.
- [ ] Rejestr (K-R10): `node core/tools/release-check.js --json --tylko artefakty` → `"bledy":[]`;
      `git diff --numstat docs/ARTEFAKTY.md` → `14 14`.
- [ ] Efekt widoczny (zasada 4): ten etap generuje `PROMPT_ETAP_11.md` już według nowej
      specyfikacji — w nim linia „Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie): …”
      i brak odpisu indeksu; rozmiar `PROMPT_ETAP_11.md` w bajtach i rozmiar tego promptu do wpisu.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” czterech
      kart, kopie Codeksa i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_10.md`,
      `PROMPT_ETAP_11.md`, `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`).
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów, liczbą
      przebiegów Codeksa (cel aneksu: 2, poprawek 0), „świadomie odłożonym” — rotacja lekcji
      w `rotate.js` — i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E10/` i przebiegi
      `.claude/relai/work/CREW/` tego etapu przejrzane (`node .claude/relai/tools/clean-work.js
      raport`; katalog otwartego etapu raport pomija — wtedy liczby z `find`/`du`) i skasowane po
      „tak”, liczby przed i po we wpisie dziennika; (b) artefakty spoza katalogu wypisane z nazwy
      razem z tym, co się z nimi stało.

Najtwardszy punkt to testy przed zmianą: przypadek K-A1 musi być czerwony na asercji „nieobecne”
z fragmentem dosłownie z pliku — jeśli jest czerwony z innego powodu (np. cudzysłów prosty zamiast
zamykającego), zatrzymujesz się i pokazujesz fragment z pliku i z karty, zamiast poprawiać test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E10 → `ZREALIZOWANY <data>`, E11 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E10 rozpoczęty”); link
   w kolumnie `Prompt` przy E11 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E10/` i przebiegi `CREW` etapu —
   raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (testy przed i po, greps, rejestr, rozmiary promptów) / Świadomie odłożone (rotacja lekcji
   w `rotate.js`) / Do zrobienia przez człowieka (m.in. czy przepisać wstecz
   `PANEL_CODEX/PROMPT_ETAP_1.md`); podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę
   „Stan otwartych ryzyk”; lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka”
   tego wpisu dostaje linię `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu (E10 zrealizowany; liczby testów; E11 gotowy) oraz
   krok z karty E10: w akapicie „Świadomie odłożone” planu KONTEKST_STARTU usuwasz ostatni człon
   (od „zdanie Aneksu D w” do „Zasadami aktywnymi”.”), średnik przed nim zamieniasz na kropkę.
   Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_11.md`** — już wg zmienionej `SPEC_PROMPT_ETAPU.md` (numery zasad,
   bez odpisu) i `stage-prompts.md` — z wiersza E11 w sekcji 6 `PLAN.html`,
   z `karty/E11_PROCES_I_REJESTRY.md`, z realnego stanu repozytorium po tym etapie, z Aneksu A
   (wykonawca Codex, dwa przebiegi, `docs/` i testy u Claude) i z lekcji tego etapu.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
