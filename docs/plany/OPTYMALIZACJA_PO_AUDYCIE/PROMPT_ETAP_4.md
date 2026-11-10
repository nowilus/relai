# PROMPT_ETAP_4 — Guardy Claude Code: awaria hooka jest widoczna, ostrzeżenia tylko w projekcie, CRLF w CLAUDE.md

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E4 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E3) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy, tabelę `catch` dla czternastu hooków i przypadki testowe
> sprawdzone na prototypie; praca jest wierną realizacją, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 5 (generator skilli Codeksa, rejestr `ARTEFAKTY.md`), sekcja 6 (hooki sesji 3.7.0, backslash, ASCII) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E04_GUARDY_CLAUDE_CODE.md` — całość | **to jest zakres etapu**: trzy karty z kodem docelowym, tabelą `catch`, testami i warunkami zatrzymania |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E4 w sekcji 6 (Grep `E04_GUARDY_CLAUDE_CODE` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `adapters/claude-code/hooks/config-protection.js` | K-C10 i K-C4; kotwice `immutableSection` (l. 34–35), `editTouchesSection`, odczyt `current` |
| `adapters/claude-code/hooks/secret-scanner.js` i `session-context.js` | K-C4 (guard i raporty startu) i K-C6 (`isGitIgnored`, komunikat z l. 82) |
| pozostałe dwanaście hooków `adapters/claude-code/hooks/*.js` — tylko linie z tabeli K-C4 | kotwice `catch`; numery orientacyjne, obowiązuje tekst |
| `core/process/tests/prompt-gate.test.js` i `ritual-copies.test.js:120-130` | wzór fikstury projektu, wywołania hooka i sprzątania `relai-ustawienia-podane-*` |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 5, 12 i 13 (sekcja „Pełne brzmienie”) | 3: dowód negatywny; 5: kontrola pozytywna, backslash tylko Write/Edit; 12: `catch` bez odmowy to fałszywa zieleń; 13: BOM w payloadzie |
| `docs/DZIENNIK.md` — ostatni wpis (E3) | punkt wyjścia, liczba testów `core/guardrails` (33), sprawy odroczone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje, test jest
  czerwony z innego powodu niż asercja albo K-C10 daje wynik spoza ścieżek A i B → zatrzymujesz
  się i pytasz; karty nie poprawiasz.
- Kolejność kart: **K-C10 → K-C4 → K-C6** (karta E04). Kart nie łączysz; commit jest jeden na etap.
- K-C4: ślad to trzy linie powtórzone w każdym hooku, nie wspólny moduł; nazwa błędu z
  `e.code || e.name`, **nigdy** `e.message` (komunikat `JSON.parse` cytuje wejście, a wejście
  guarda bywa sekretem); guard przy awarii `require` rdzenia zwraca `ask` w każdym folderze;
  guardy zdejmują BOM przed `JSON.parse` (rozstrzygnięcia karty, zasady 12 i 13).
- K-C6: `secret-scanner` nie skanuje pliku spoza katalogu projektu przypisanego rozpoznaniem
  „od katalogu sesji”; w projekcie bez gita **dalej blokuje**, ale mówi to wprost (rozstrzygnięcie
  karty, D-42).
- E3 zamknął `core/guardrails/` (skaner, pre-commit, instalator; 33 testy). Trzy pozycje
  „Do rozstrzygnięcia przez człowieka” z E3 są bramkami `OTWARTA` w `STATUS.md` i nie blokują E4.
- Pomiar E2: werdykt `C9:` czyta karta K-C9 w E5, `A6:` — karta K-A6 w E7; ten etap ich nie dotyka.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 — awaria hooka w Twojej
  sesji dalej będzie cicha; dowodem są wyłącznie testy.
- Granica zakresu: hooki `adapters/claude-code/hooks/*.js`, `adapters/claude-code/skills/relai-core/SKILL.md`
  z kopią generowaną `adapters/codex/skills/relai-core/SKILL.md`, wiersz `relai-core` w
  `docs/ARTEFAKTY.md` i trzy nowe pliki testów w `core/process/tests/`. Rdzenia (`core/guardrails/`,
  `core/process/*.js`), hooków Cursora i Codeksa, zmian `secret-scanner` z karty K-D8 (Bash i treść
  po edycji — etap E5), kosztu startu (E7), D11 i C5/C8 — nie ruszasz.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity `f3c5fbe` (plan), `86358ef` (E1), `d129566` (E2) i — jeśli człowiek go przyjął — commit
etapu E3 (`git log --oneline -5`; brak commita E3 → zmiany E3 w `core/guardrails/` leżą w drzewie
roboczym, zostawiasz je i pytasz, zanim zaczniesz). E3 zmienił wyłącznie `core/guardrails/` i
dokumenty; hooki adaptera Claude Code są takie jak na `main` (FAKT: `git diff --quiet
adapters/claude-code/hooks` → kod 0, 2026-11-10).

```
adapters/claude-code/hooks/               14 hookow: auto-format, config-protection, console-log-warn,
                                          design-quality-check, doc-sync-reminder, humanize-continuous,
                                          journal-signature, lockfile-scan, profile-rules, prompt-mode,
                                          quality-gate, secret-scanner, session-context, session-title
  config-protection.js                    immutableSection: const lines = String(text).split('\n') (l. 35)
  secret-scanner.js                       komunikat "w pliku sledzonym" (l. 82); isGitIgnored dwustanowe
  session-context.js                      raporty startu bez osobnych try — jeden wyjatek gasi caly blok
  (13 z 14 plikow)                        maja "catch (_) { process.exit(0); }" (FAKT, grep -c)
adapters/claude-code/skills/relai-core/SKILL.md   zdanie o ciszy hooka z jednym wyjatkiem (l. ok. 112-114)
adapters/codex/skills/relai-core/SKILL.md         kopia generowana: node adapters/codex/generate-skills.js
docs/ARTEFAKTY.md                         wiersz relai-core: wersja 28
core/process/tests/                       357 testow (FAKT 2026-11-09, E1-E3 ich nie zmienialy); brak
                                          hook-failures, hook-project-scope, config-protection-crlf
core/guardrails/tests/                    33 testy (stan po E3)
adapters/*/skills/relai-planning/*-closing.md   cztery pliki M z pustym git diff (konce linii) — nie ruszasz
.claude/launch.json                       niesledzony, spoza planu — nie dodajesz do commita
```

Testy: `node --test "core/process/tests/*.test.*"` trwa ok. 110 s (SZACUNEK z konwencji) —
uruchamiaj w tle albo z limitem 10 minut. Po etapie według tabeli konwencji: `core/process`
**372** (357 + 3 K-C10 + 6 K-C4 + 6 K-C6), `core/guardrails` 33 bez zmian, `adapters/codex/tests`
24 bez zmian. `validate-adapters.js`: kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`), linia
`wywolania z hooks.json: 18`.

**Czego jeszcze nie ma:** normalizacji CRLF w ochronie sekcji niemutowalnej `CLAUDE.md` (o ile
test K-C10 potwierdzi defekt); śladu `[RelAI <hook>] blad: <nazwa>` w czternastu hookach; pytania
`ask` guardów przy błędzie wewnętrznym i braku rdzenia; osobnego `try` na każdy raport startu
sesji; drugiego wyjątku w zdaniu skilla o ciszy hooka; milczenia hooków ostrzegawczych i skanera
dla plików spoza katalogu projektu; komunikatu skanera, który nie nazywa pliku „śledzonym” bez
potwierdzenia gita.

**Zasady aktywne — indeks z rejestru lekcji** (stan 2026-11-10; D-15 Aneks A: start czyta indeks,
pełne brzmienie doczytujesz z `docs/LEKCJE.md` przy trafieniu w wyzwalacz):

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

Z etapu E3 (bez nowej lekcji): testy „czerwone z asercji” zapisywałem do pliku w katalogu roboczym
przed każdą kartą — to jest dowód z punktu Weryfikacji, nie zdanie z pamięci. Kontrolę pozytywną
instrumentu porównania zrobiłem na tych samych liniach co mechanizm (zasada 5).

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E4/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-c10-`, `relai-c4-`, `relai-c6-` itd.) i sprząta
je `t.after`; znaczniki `relai-ustawienia-podane-<sesja>` z testu 4 K-C4 sprząta sam test.

Wykonujesz karty z `karty/E04_GUARDY_CLAUDE_CODE.md` w podanej kolejności, każdą według sekcji 2
konwencji (test najpierw, czerwony z asercji, zmiana, test zielony, weryfikacja karty).

1. **K-C10 — `core/process/tests/config-protection-crlf.test.js`** (nowy, 3 przypadki), w ścieżce A
   także `adapters/claude-code/hooks/config-protection.js`: funkcja `bezCR` i cztery miejsca
   z kroków 2–4 karty. Ścieżka B (test zielony bez zmiany) → hook bez zmian, zdanie do wpisu
   dziennika. Przewidywanie karty: ścieżka A.
2. **K-C4 — czternaście hooków `adapters/claude-code/hooks/*.js`**: `HOOK`, `nazwaBledu`, `slad`
   przed pierwszym `require`; `pytajPoAwarii` w `secret-scanner` i `config-protection`; tabela
   S / A / Z dla każdego `catch`; BOM w guardach; w `session-context.js` pomocnik `raport` i piętnaście
   raportów z nazwami z karty; `SKILL.md` `relai-core` — trzy linie z kotwicy na nowe brzmienie;
   `node adapters/codex/generate-skills.js`; wiersz `relai-core` w `docs/ARTEFAKTY.md` → wersja 29.
   Test `core/process/tests/hook-failures.test.js` (nowy, 6 przypadków).
3. **K-C6 — `console-log-warn.js`, `quality-gate.js`, `design-quality-check.js`, `profile-rules.js`,
   `secret-scanner.js`**: `wKatalogu` i warunek przed każdą inną pracą; w `secret-scanner` także
   `stanGita` (trójstanowa) i komunikat bez słowa „śledzonym”, poprawiony komentarz nagłówka.
   Test `core/process/tests/hook-project-scope.test.js` (nowy, 6 przypadków; przypadek 4 z
   `{ skip: process.platform !== 'win32' }`).
4. **Git.** Bez `push`. Jeden commit etapu (`fix:` po angielsku, conventional), proponowany
   w rytuale „Na koniec”.

Wszystkie komunikaty i ślady **tylko ASCII** (bez półpauzy). Kod z backslashem przenosisz z karty
narzędziem Edit (nigdy powłoką ani `node -e`); testy nie zawierają gotowego przypisania sekretu ani
w kodzie, ani w nazwie przypadku. Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy
„świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_4.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`.
- [ ] Testy przed zmianą: każda karta ma zapisany w katalogu roboczym przebieg czerwony z właściwego
      powodu (K-C10 ścieżka A: przypadki 1 i 2 czerwone z asercji — albo ścieżka B: 3 zielone
      i zdanie do wpisu; K-C4: 1–6 czerwone z asercji; K-C6: 6 czerwonych z asercji, przypadek 4
      tylko na Windows).
- [ ] `node --test core/process/tests/config-protection-crlf.test.js` → 3 pass;
      `hook-failures.test.js` → 6 pass; `hook-project-scope.test.js` → 6 pass.
- [ ] `node --test "core/process/tests/*.test.*"` → **372 pass**, 0 fail;
      `node --test "core/guardrails/tests/*.test.js"` → 33 pass; `node --test
      "adapters/codex/tests/*.test.js"` → 24 pass. Żaden istniejący test nie zmieniony
      (`git diff --stat core/process/tests` pokazuje wyłącznie trzy nowe pliki).
- [ ] Ślady i wyjścia: `grep -c "function slad" adapters/claude-code/hooks/*.js` → `1` w każdym
      z czternastu plików; `grep -n "catch (_) { process.exit(0); }" adapters/claude-code/hooks/*.js`
      → 0 trafień; `grep -c "pytajPoAwarii" ` w dwóch guardach ≥ 1, w pozostałych dwunastu 0;
      `grep -n "sledzonym" adapters/claude-code/hooks/secret-scanner.js` → 0 trafień.
- [ ] Efekt widoczny z karty (na fiksturze w katalogu roboczym, hook z repozytorium):
      `secret-scanner` z wejściem `{nie json` → `ask` i stderr `[RelAI secret-scanner] blad:
      SyntaxError`; ten sam hook z poprawnym payloadem w folderze bez markera → stdout i stderr
      puste (kontrola, że ślad nie pojawia się przy zwykłej pracy).
- [ ] `SKILL.md` `relai-core` w obu adapterach ma nowe zdanie (grep `nie zadzialala” → porównujesz
      sam tylko tę siatkę` → 1 w każdym), stare brzmienie z jednym wyjątkiem zniknęło (grep
      `dopiero\n    wtedy porównujesz sam` → 0); wiersz `relai-core` w `docs/ARTEFAKTY.md` ma
      wersję 29 i dopisek z datą na początku komórki „Co się zmieniło”.
- [ ] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      linia `wywolania z hooks.json: 18`.
- [ ] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy) — zero nowych CRITICAL i HIGH
      wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie dodaje zależności; zastane —
      fikstury ewaluacji `trivy-scan` — nie blokują, jak w E3). Trivy brak → zapis „brak pliku
      zależności w `adapters/claude-code/hooks/` i `core/`” z wynikiem
      `git ls-files adapters/claude-code/hooks core | grep package.json` (pusty).
- [ ] Podstawy na zmianie etapu: wejście hooka (payload) przy błędzie parsowania nie trafia do
      komunikatu ani śladu (`grep -n "e.message" adapters/claude-code/hooks/*.js` — żadne nowe
      trafienie z tego etapu w `diff`); `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"`
      → 0; Grep po `PASSWORD=` w trzech nowych testach → 0 gotowych przypisań.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” trzech kart
      (czternaście hooków, dwa `SKILL.md` `relai-core`, `docs/ARTEFAKTY.md`, trzy nowe testy)
      i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_4.md`, `PROMPT_ETAP_5.md`, `DZIENNIK.md`,
      `STATE.md`, ewentualnie `LEKCJE.md`); pod `adapters/*/skills/relai-planning/` wyłącznie cztery
      zastane `*-closing.md`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbą testów `core/process`
      372 (albo zgodną z sumą, jeśli ścieżka K-C10 zmieniła liczbę — opisaną), ze ścieżką K-C10
      (A albo B) i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E4/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-c10-*`, `relai-c4-*`, `relai-c6-*`,
      znaczniki `%TEMP%/relai-ustawienia-podane-*` z testów) wypisane z nazwy razem z tym, co się
      z nimi stało.

Najtwardszy punkt to pełny zestaw `core/process` (372): K-C4 dotyka czternastu hooków, z których
część ma własne testy. Spadek albo czerwony istniejący test → zatrzymujesz się i opisujesz test
i hook, zamiast zmieniać test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E4 → `ZREALIZOWANY <data>`, E5 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E4 rozpoczęty”); link
   w kolumnie `Prompt` przy E5 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E4/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po w trzech zestawach, ścieżka K-C10, wynik Trivy) / Świadomie odłożone /
   Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę
   „Stan otwartych ryzyk” (C1 — API modów, P1 — adaptery); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1 i trzema z E3).
4. `docs/STATE.md` — zdanie o stanie planu (E4 zrealizowany: guardy Claude Code, liczba testów
   `core/process`; E5 gotowy). Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_5.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E5
   w sekcji 6 `PLAN.html`, z `karty/E05_HOOK_POLECEN_I_STOP.md` (karta K-C9 czyta werdykt
   `C9: NIE WIDZI` z `POMIARY.md`), z realnego stanu repozytorium po tym etapie i z lekcji tego
   etapu. Liczba testów `core/process` po E5 według tabeli narastającej konwencji: 388–389
   (SZACUNEK; wiążąca jest suma od wpisu E4).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
