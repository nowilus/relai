# PROMPT_ETAP_6 — Adaptery i załoga: deinstalator Cursora w granicach `.cursor/`, skaner Codeksa w załodze, `crew.js` bez tekstu dowolnego w argv

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E6 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E5) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy i testy sprawdzone na prototypie 2026-11-09; praca jest wierną
> realizacją czterech kart, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 6 (hooki sesji 3.7.0, backslash, ASCII, `cd`, sekret w teście) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E06_ADAPTERY_I_ZALOGA.md` — całość | **to jest zakres etapu**: cztery karty z kodem docelowym, testami i lista „Do rozstrzygnięcia przez człowieka” |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E6 w sekcji 6 (Grep `E06_ADAPTERY_I_ZALOGA` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `adapters/cursor/install.js` (`function uninstall`), `adapters/cursor/tests/install.test.js` | K-D5: kotwica, helpery `projekt`, `uruchom`, stała `INSTALL` |
| `core/process/crew.js`, `core/process/tests/crew.test.js` | K-D9, K-D6, K-D7: kotwice z pól „Stan dziś”, helpery `fixture`, `stubExec` |
| `adapters/codex/hooks/secret-scanner.js` (funkcja `ignored`) | K-D9 (b) |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 5, 12 i 13 (sekcja „Pełne brzmienie”) oraz L-0312 | 3: dowód negatywny; 5: backslash tylko Write/Edit, kontrola pozytywna, `cd` w Bash; 12: guardrail nie zatrzymuje nie-sekretu; 13: cudze CLI z pomocy i próby; L-0312: fikstura z gitem trzyma pomocnicze katalogi poza swoim repozytorium |
| `docs/DZIENNIK.md` — ostatni wpis (E5) | punkt wyjścia: `core/process` 389, odpowiedzi (a)/(b) E5, sprawy odłożone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje albo test
  „najpierw” jest zielony przed zmianą / czerwony z błędu innego niż asercja → zatrzymujesz się
  i pytasz; karty nie poprawiasz. Wyjątek zapisany w karcie: `TypeError` przy braku eksportu
  `wykonaj` → najpierw krok 1 K-D9 (sam eksport).
- Kolejność kart: **K-D5 → K-D9 → K-D6 → K-D7**. Kart nie łączysz; commit jest jeden na etap.
- K-D5: cała lista manifestu sprawdzana **przed** pierwszym usunięciem; jedna zła pozycja = kod 1
  i nic nie znika (decyzja projektowa karty — manifest jest daną niezaufaną).
- K-D9: zmienne gospodarzy usuwa **załoga** (`crew.js`), nie hook Codeksa — linia
  `if (process.env.CLAUDECODE) process.exit(0);` i warunki w `secret-scanner.cmd`/`.sh` zostają
  (P-013). Furtka `.env*` w hooku Codeksa działa tylko, gdy git nie umie odpowiedzieć.
- K-D6: prompt recenzenta Codeksa idzie stdin-em (`codex review … -`); `--model`/`--base` z białej
  listy; strażnik `%`/CR/LF/NUL wyłącznie w gałęzi `win32` `wykonaj`.
- K-D7: Cursor w trybie zapisu bez `-f`; `-f`, `--force` na `FLAGI_ZAKAZANE`; `zakazana` porównuje
  całe flagi; Claude Code w trybie zapisu dostaje `Bash` tylko z siedmiu wzorców `BASH_ZAPISU`.
  Jedyny istniejący test zmieniany z nazwy: `buildCommand gives read-only flags without --write and
  never a bypass flag` (linia 59 z `/(^| )-f( |$)/`).
- **D-41 bez zmian** (potwierdzone w E5): blokują wyłącznie `secret-scanner` i `config-protection`.
- E5 dał piętnasty hook `bash-guard` i grupę `^Bash$` w `PreToolUse`; kontrola `readme-hooki`
  w `release-check.js` jest **czerwona do K-E9 w E14** — stan oczekiwany, nie naprawiasz.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 — dowodem są testy.
- Granica zakresu: `adapters/cursor/install.js`, `adapters/cursor/tests/install.test.js`,
  `core/process/crew.js`, `core/process/tests/crew.test.js`, `adapters/codex/hooks/secret-scanner.js`,
  nowy `adapters/codex/tests/secret-scanner.test.js`. Kopii `.claude/relai/tools/crew.js` nie
  edytujesz (nadpisuje ją hook startu). Hooków Claude Code (E4/E5), kosztu startu (E7), skrótu
  i progów (E8), trybu ciągłego (E9), promptów i rytuałów (E10), komendy `/relai-crew` i jej
  dokumentów, plików agentów, liczebników (E14) — nie ruszasz. Pomiar na żywo `agent -p` /
  `claude -p` nie należy do tego etapu.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity `f3c5fbe` (plan), `86358ef` (E1), `d129566` (E2), `2ee8cb3` (E3), `5ff5147` (E4)
i — jeśli człowiek go przyjął — commit etapu E5 (`git log --oneline -7`; brak commita E5 →
zmiany E5 leżą w drzewie roboczym, zostawiasz je i pytasz, zanim zaczniesz).

```
adapters/cursor/install.js            function uninstall (l. 322); petla
                                      "for (const rel of (manifest.files || []))" (l. 338) - kotwica K-D5
adapters/cursor/tests/install.test.js 4 testy (FAKT, karta); helpery projekt, uruchom, INSTALL
adapters/codex/hooks/secret-scanner.js  function ignored (l. 21) - furtka .env* bez pytania gita
adapters/codex/tests/                 5 plikow, 24 testy (FAKT, wpis E4); brak secret-scanner.test.js
core/process/crew.js                  FLAGI_ZAKAZANE (l. 110), function wykonaj (l. 149, cyt z
                                      backslashem), buildCommand: Claude Code "... 'NotebookEdit', 'Bash');"
                                      (l. 354), Cursor "if (write) args.push('-f')" (l. 370);
                                      buildReviewCommand codex "args.push(opcje.prompt || ...)" (l. 386);
                                      sprawdzFlagi (l. 393) z includes; dwa "const w = exec(...)"
                                      (l. 507, 540); module.exports "run, review, status, ..." (l. 707)
core/process/tests/crew.test.js       17 testow (FAKT, grep); l. 59 oczekuje -f dla Cursora w zapisie
core/process/tests/                   389 testow (FAKT, wpis E5)
adapters/*/skills/relai-planning/*-closing.md   cztery pliki M z pustym git diff (konce linii) - nie ruszasz
.claude/launch.json                   niesledzony, spoza planu - nie dodajesz do commita
```

Testy (konwencje, sekcja 4): `node --test "core/process/tests/*.test.*"` ok. 110 s,
`adapters/codex/tests` ok. 40 s (SZACUNEK) — w tle albo z limitem 10 minut, **z katalogu
repozytorium ścieżką względną** (glob `/c/...` daje 0 testów, L-0311). Po etapie według karty
(SZACUNEK dla sum, wiążąca jest suma od wpisu E5): `adapters/cursor` **10** (4 + 6),
`adapters/codex` **28** (24 + 4), `core/process` **396** (389 + 7: K-D9 2, K-D6 3, K-D7 2;
`crew.test.js` 17 → 24), `core/guardrails` 33 bez zmian. `validate-adapters.js`: kod 0, jedno
ostrzeżenie (`security-audit/SKILL.md`), `wywolania z hooks.json: 20` (FAKT z E5).

**Czego jeszcze nie ma:** sprawdzenia manifestu Cursora przed deinstalacją (`sciezkaZManifestu`);
usuwania zmiennych innych gospodarzy w podprocesie załogi (`zmienneInnychGospodarzy`,
`bezZmiennych`, eksport `wykonaj`); furtki `.env*` w hooku Codeksa zależnej od odpowiedzi gita;
promptu recenzenta Codeksa przez stdin, białej listy `--model`/`--base` i strażnika cmd.exe;
zakazu `-f`/`--force` i wzorców `BASH_ZAPISU`.

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

Z etapu E5 (lekcja L-0312): skrypt efektu widocznego z fiksturą-repozytorium gita dał fałszywy
sygnał, bo pomocniczy katalog `home/` leżał w drzewie fikstury — test karty miał go obok
repozytorium i był zielony. Fikstury K-D9 (`git init` w `relai-k-d9-codex-*`) trzymają pomocnicze
pliki poza repozytorium fikstury albo w jej `.gitignore`. Z E4 (L-0311): polecenie Bash nie zawiera
`cd` poza podpowłoką `( cd … && … )`. Wartości sekretów w testach składasz w czasie działania
(`secret()` z karty) — hook sesji 3.7.0 zablokuje zapis testu z gotowym przypisaniem.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E6/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-cursor-install-*`, `relai-k-d9-codex-*`, fikstury
`crew.test.js`) i sprząta je `t.after`.

1. **K-D5 — `adapters/cursor/install.js`, `adapters/cursor/tests/install.test.js`**:
   `sciezkaZManifestu` nad `uninstall`; sprawdzenie całej listy między `if (!manifest) {…}`
   a `if (!guidanceUninstall(projekt))` (kod 1, komunikat `spoza .cursor/`); pętla po `wpisy`.
   Testy z karty: pięć odmów (w tym junction) i jeden przypadek ukośników → cursor **10**.
2. **K-D9 — `core/process/crew.js`, `core/process/tests/crew.test.js`,
   `adapters/codex/hooks/secret-scanner.js`, nowy `adapters/codex/tests/secret-scanner.test.js`**:
   eksport `wykonaj, zmienneInnychGospodarzy` (najpierw), funkcja `zmienneInnychGospodarzy`,
   `bezZmiennych` w `wykonaj`, oba `const w = exec(…)` (Edit z `replace_all`); `ignored` w hooku
   Codeksa wg karty. Testy: dwa w `crew.test.js`, cztery w nowym pliku Codeksa.
3. **K-D6 — `core/process/crew.js`, `core/process/tests/crew.test.js`**: `MODEL_RE`, `BASE_RE`,
   `sprawdzWartosc` pod `FLAGI_ZAKAZANE`; `ZNAK_NIEDOZWOLONY_CMD` i strażnik w gałęzi `win32`
   `wykonaj` przed `const cyt`; `sprawdzWartosc` w `buildCommand` i `buildReviewCommand`; gałąź
   `codex` przeglądu z `'-'` i `stdin`; zdanie w komentarzu nad `wykonaj`. Trzy testy.
   Wyrażenia z backslashem wpisujesz narzędziem Edit.
4. **K-D7 — `core/process/crew.js`, `core/process/tests/crew.test.js`**: `-f`, `--force` na
   `FLAGI_ZAKAZANE` z komentarzem; `BASH_ZAPISU`; linia Claude Code z `...BASH_ZAPISU`; linia
   Cursora bez `-f`; `zakazana` i filtr w `sprawdzFlagi`; komentarz nagłówka (linia 23) z
   „, -f/--force”. Test istniejący z linii 59 zmieniany **z nazwy** wg karty, dwa nowe testy.
5. **Git.** Bez `push`. Jeden commit etapu (`fix:` po angielsku, conventional), proponowany
   w rytuale „Na koniec”.

Wszystkie komunikaty narzędzi tylko ASCII. Kod z backslashem przenosisz z karty narzędziem
Write/Edit (nigdy powłoką ani `node -e`). Wątek spoza kart → zatrzymujesz się i pytasz: odnoga,
aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_6.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E5 (albo człowiek rozstrzygnął, co z drzewem).
- [ ] Testy przed zmianą: każda karta ma zapisany w katalogu roboczym przebieg czerwony z właściwego
      powodu (K-D5: pięć odmów czerwonych — kod 0 i plik skasowany — przypadek ukośników zielony;
      K-D9: oba testy `crew.test.js` czerwone z asercji po samym eksporcie, w pliku Codeksa
      czerwony tylko pierwszy; K-D6: trzy czerwone z asercji; K-D7: zmieniony test istniejący
      i oba nowe czerwone z asercji).
- [ ] `node --test "adapters/cursor/tests/*.test.js"` → **10 pass**, 0 fail;
      `node --test "adapters/codex/tests/*.test.js"` → **28 pass**, 0 fail;
      `node --test core/process/tests/crew.test.js` → **24 pass**.
- [ ] `node --test "core/process/tests/*.test.*"` → **396 pass** (albo suma od wpisu E5 plus 7,
      opisana), 0 fail; `node --test "core/guardrails/tests/*.test.js"` → 33 pass.
      `git diff core/process/tests/crew.test.js` zmienia z istniejących testów wyłącznie linię 59
      (`git diff -U0` — jedna linia `-`), reszta to dopisane testy.
- [ ] Dowód negatywny K-D9 (zasada 3): `grep -n "if (process.env.CLAUDECODE) process.exit(0);"
      adapters/codex/hooks/secret-scanner.js` → 1 trafienie (linia zostaje); `git diff
      adapters/codex/hooks/secret-scanner.cmd adapters/codex/hooks/secret-scanner.sh` → pusty.
- [ ] Efekt widoczny z karty (fikstura w katalogu roboczym, kod z repozytorium):
      `crew.buildReviewCommand('codex', { prompt: 'a\nb' })` ma ostatni argument `-` i `stdin`
      z oboma liniami; deinstalator Cursora z manifestem `../plik` → kod 1, plik obok projektu
      istnieje; `crew.wykonaj` z `bezZmiennych: ['CLAUDECODE']` → podproces nie widzi `CLAUDECODE`.
- [ ] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      `wywolania z hooks.json: 20` bez zmian.
- [ ] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy) — zero nowych CRITICAL i HIGH
      wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie dodaje zależności; po E5:
      0 CRITICAL, 42 HIGH, 50 MEDIUM, 12 LOW — zastane fikstury ewaluacji `trivy-scan`, nie
      blokują). Trivy brak → zapis „brak pliku zależności w `adapters/` i `core/`” z wynikiem
      `git ls-files adapters core | grep package.json` (pusty).
- [ ] Podstawy na zmianie etapu: wejście niezaufane walidowane przed użyciem (manifest Cursora —
      testy odmowy; `--model`/`--base` — test białej listy; argument z `%`/CR/LF na Windows —
      test strażnika); `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"` → 0;
      Grep po `PASSWORD=` w nowych testach → 0 gotowych przypisań.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” czterech
      kart (`adapters/cursor/install.js`, `adapters/cursor/tests/install.test.js`,
      `core/process/crew.js`, `core/process/tests/crew.test.js`,
      `adapters/codex/hooks/secret-scanner.js`, `adapters/codex/tests/secret-scanner.test.js`)
      i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_6.md`, `PROMPT_ETAP_7.md`, `DZIENNIK.md`,
      `STATE.md`, ewentualnie `LEKCJE.md`); `.claude/relai/tools/crew.js` nietknięty; pod
      `adapters/*/skills/relai-planning/` wyłącznie cztery zastane `*-closing.md`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów (cursor 10,
      codex 28, `core/process` 396 albo zgodnie z sumą, opisaną), z trzema pozycjami „Do
      rozstrzygnięcia przez człowieka” z karty w sekcji „Do zrobienia przez człowieka” i podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E6/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-cursor-install-*`,
      `relai-k-d9-codex-*` i pozostałe z testów) wypisane z nazwy razem z tym, co się z nimi stało.

Najtwardszy punkt to pełny zestaw `core/process` (396) razem z `crew.test.js` (24): K-D7 jako jedyna
zmienia oczekiwanie istniejącego testu, a K-D6 dokłada strażnika do `wykonaj`, z którego korzystają
`run` i `review`. Czerwony inny istniejący test → zatrzymujesz się i opisujesz test i zmianę,
zamiast zmieniać test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E6 → `ZREALIZOWANY <data>`, E7 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E6 rozpoczęty”); link
   w kolumnie `Prompt` przy E7 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E6/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po trzech zestawów, wynik Trivy) / Świadomie odłożone / Do zrobienia
   przez człowieka (trzy pozycje z karty: lista `BASH_ZAPISU`, Cursor bez `-f` do zmierzenia na
   żywo, `%` w ścieżce projektu na Windows); podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj
   tabelę „Stan otwartych ryzyk” (P1 — adaptery bez blokad harnessu, M6 — flagi CLI załogi);
   lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1 i trzema z E3).
4. `docs/STATE.md` — zdanie o stanie planu (E6 zrealizowany: deinstalator Cursora w granicach
   `.cursor/`, skaner Codeksa w załodze, prompt recenzenta stdin-em, tryb zapisu bez `-f`; liczby
   testów; E7 gotowy). Liczebników hooków nie zmieniasz — E14. Tabeli „Stan prac” w `CLAUDE.md`
   nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_7.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E7
   w sekcji 6 `PLAN.html`, z `karty/E07_KOSZT_HOOKA_STARTU.md` (karta K-A6 zależy od werdyktu E2:
   `A6: NIE POWTARZA` w `POMIARY.md`), z realnego stanu repozytorium po tym etapie i z lekcji tego
   etapu. Liczby po E7 według tabeli narastającej konwencji: `core/process` 404–406 (SZACUNEK;
   wiążąca jest suma od wpisu E6).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
