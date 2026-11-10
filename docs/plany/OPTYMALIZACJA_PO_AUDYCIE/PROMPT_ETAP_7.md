# PROMPT_ETAP_7 — Koszt hooka startu: jeden odczyt pliku testowego, jeden odczyt dokumentu, prowizja tylko przy zmianie

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E7 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E6) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy i testy sprawdzone na prototypie 2026-11-09; praca jest wierną
> realizacją kart, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 6 (hooki sesji 3.7.0, backslash, ASCII, `cd`, sekret w teście) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E07_KOSZT_HOOKA_STARTU.md` — całość | **to jest zakres etapu**: cztery karty (K-C1, K-C3, K-C2, K-A6 warunkowa) z kodem docelowym i testami |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E7 w sekcji 6 (Grep `E07_KOSZT_HOOKA_STARTU` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` — wyłącznie linia `A6:` (Grep `^A6:`) | werdykt dla karty K-A6 |
| `core/process/work-artifacts.js` (`szukajWTestach`, `bramka`, `indeksDokumentow`, `kontekstBramki`) | K-C1, K-C3: kotwice z pól „Stan dziś” |
| `core/process/session-signals.js` (`czytaj`, `markerWKatalogu`, `projectVersion`, `unknownAuthor`, `artefaktyRobocze`, `provisionTemplates`) | K-C3, K-C2 |
| `adapters/claude-code/hooks/session-context.js` (`onSessionStart`, `znacznikUstawien`, `oznaczUstawieniaPodane`, oba `provisionTemplates(cwd)`) | K-C1, K-C3, K-C2; kotwice po E4 (`raport(out, …)`) |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 4, 5 i 13 (sekcja „Pełne brzmienie”) oraz L-0312, L-0313 | 3: dowód negatywny; 4: efekt, nie zdarzenie; 5: backslash tylko Write/Edit, kontrola pozytywna, `cd` w Bash; 13: payload hooka z próby; L-0312: fikstura trzyma pomocnicze katalogi poza swoim repozytorium; L-0313: krok przed testem eksportuje tylko nazwy, które już istnieją |
| `docs/DZIENNIK.md` — ostatni wpis (E6) | punkt wyjścia: `core/process` 396, cursor 10, codex 28; trzy nowe bramki manualne |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje albo test
  „najpierw” jest zielony przed zmianą / czerwony z błędu innego niż asercja → zatrzymujesz się
  i pytasz; karty nie poprawiasz. Krok przygotowawczy, który eksportuje nazwę jeszcze nieistniejącą,
  wykonujesz tak, żeby `require` się nie przewrócił, i zapisujesz rozjazd w dzienniku (L-0313).
- Kolejność kart: **K-C1 → K-C3 → K-C2 → K-A6**. Kart nie łączysz; commit jest jeden na etap.
- K-C1: treść pliku testowego zapamiętuje kontekst bramki (mapa leniwa); pozycja `zrodlo === 'temp'`
  pomija bramki „opisane” i „wiązane testami”; znacznik ustawień w
  `<tmp>/znaczniki-relai/ustawienia-podane-<id>`, stare `relai-ustawienia-podane-*` kasowane raz,
  potem znaczniki starsze niż 7 dni.
- K-C3: pamięć odczytów **wyłączona domyślnie**, włącza ją wyłącznie hook startu
  (`core.pamiecOdczytow(true)`) w trzech adapterach; `prompt-mode.js` bez pamięci — hook podaje mu
  tekst; znacznik prowizji czytasz `fs.readFileSync`, nie `czytaj`.
- K-C2: znacznik `.claude/relai/.provisioned` z dwoma odciskami SHA-1 (źródła i kopie: ścieżka,
  rozmiar, `mtimeMs`); znacznik tylko po kopii kompletnej; przy `source === 'compact'` hook nie
  kopiuje; instalator Cursora kopiuje zawsze (`wymus: true`); brzmienia zdań hooka bez zmian.
- **K-A6: `POMIARY.md` ma linię `A6: NIE POWTARZA`** (FAKT, E2) — kodu nie zmieniasz; do wpisu
  dziennika idzie zdanie zamknięcia z karty. Inny wynik Grepa niż dokładnie jedna linia
  `A6: NIE POWTARZA` → zatrzymujesz się.
- **D-41 bez zmian**: blokują wyłącznie `secret-scanner` i `config-protection`. Kontrola
  `readme-hooki` w `release-check.js` jest **czerwona do K-E9 w E14** — stan oczekiwany.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 (nadal piszą
  znaczniki starego kształtu i kopiują przy każdym starcie) — dowodem są testy i hook
  z repozytorium uruchomiony na fiksturze, nigdy zachowanie hooka w bieżącej sesji.
- Granica zakresu: pliki z pól „Pliki” trzech kart (`core/process/work-artifacts.js`,
  `core/process/session-signals.js`, `core/process/start-digest.js`, hooki `session-context.js`
  trzech adapterów, `adapters/cursor/install.js`, nowy `core/process/tests/start-hook-cost.test.js`,
  ścieżka sprzątania znacznika w `ritual-copies.test.js` i `hook-failures.test.js`). Skrótu startu
  i progów (E8), trybu ciągłego i brzmienia zdania o nim (E9), promptów i rytuałów (E10),
  `resume.js`, `prompt-mode.js`, `provisionModelList`, plików stanu z znaleziska C12, kopii
  w `.claude/relai/` i liczebników (E14) — nie ruszasz. Znaczników starego kształtu w `%TEMP%` nie
  kasujesz ręcznie.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity `f3c5fbe` (plan), `86358ef` (E1), `d129566` (E2), `2ee8cb3` (E3), `5ff5147` (E4),
`1e359ed` (E5) i — jeśli człowiek go przyjął — commit etapu E6 (`git log --oneline -8`; brak
commita E6 → zmiany E6 leżą w drzewie roboczym, zostawiasz je i pytasz, zanim zaczniesz).

```
core/process/work-artifacts.js        function indeksDokumentow(cwd) (l. 432); "dokumenty: o.dokumenty ||
                                      indeksDokumentow(cwd)," (l. 480); "tresc = fs.readFileSync(p, 'utf8');"
                                      w szukajWTestach (l. 525); w bramka "const opis = szukajWDokumentach"
                                      (l. 558) i "const test = szukajWTestach" (l. 561)
core/process/session-signals.js       require child_process (l. 26); markerWKatalogu odczyt head (l. 69);
                                      projectVersion "fs.readFileSync(markerFile" (l. 147); KOPIOWANE (l. 157);
                                      NARZEDZIA (l. 183); markCommonJs (l. 223); provisionTemplates (l. 278,
                                      kopia l. 288); function czytaj (l. 598); unknownAuthor odczyt (l. 885);
                                      artefaktyRobocze "zrodla: ['work', 'temp']," (l. 1792)
core/process/start-digest.js          czytajLF z backslashem w wyrazeniu (l. 56)
adapters/claude-code/hooks/session-context.js
                                      onSessionStart (l. 114), "const markerFile = relaiMarkerFile(cwd);" (l. 116);
                                      "raport(out, 'tryb ciagly', () => ...trybCiaglyProjektu(cwd)))" (l. 202, stan po E4);
                                      "if (input.source === 'compact')" (l. 213); provisionTemplates(cwd) x2
                                      (l. 241 SessionStart, l. 310 PostToolUse Skill); znacznik
                                      "relai-ustawienia-podane-" (l. 290, zapis l. 294)
adapters/cursor/hooks/session-context.js  "const markerFile = core.relaiMarkerFile(cwd, MARKERY_GOSCIA);" (l. 66)
adapters/codex/hooks/session-context.js   "const marker = core.relaiMarkerFile(cwd, markers);" (l. 18)
adapters/cursor/install.js            "templates = core.provisionTemplates(projekt, {" (l. 263); od E6 ma
                                      sciezkaZManifestu nad uninstall
core/process/tests/                   37 plikow, 396 testow (FAKT, wpis E6); brak start-hook-cost.test.js;
                                      "relai-ustawienia-podane" w ritual-copies.test.js i hook-failures.test.js
docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md   l. 8 "A6: NIE POWTARZA" (FAKT)
adapters/*/skills/relai-planning/*-closing.md    cztery pliki M z pustym git diff (konce linii) - nie ruszasz
.claude/launch.json                   niesledzony, spoza planu - nie dodajesz do commita
```

Testy (konwencje, sekcja 4): `node --test "core/process/tests/*.test.*"` ok. 110 s,
`adapters/codex/tests` ok. 40 s (SZACUNEK) — w tle albo z limitem 10 minut, **z katalogu
repozytorium ścieżką względną** (glob `/c/...` daje 0 testów, L-0311). Po etapie według karty
(wiążąca jest suma od wpisu E6): `core/process` **405** (396 + 9: K-C1 3, K-C3 2, K-C2 4; K-A6 0
przy `A6: NIE POWTARZA`), `adapters/cursor` **10** i `adapters/codex` **28** bez zmian,
`core/guardrails` 33 bez zmian. `validate-adapters.js`: kod 0, jedno ostrzeżenie
(`security-audit/SKILL.md`), `wywolania z hooks.json: 20` (FAKT z E6).

**Czego jeszcze nie ma:** pamięci treści plików testowych w kontekście bramki (`trescTestu`);
pominięcia bramek dokumentów i testów dla pozycji z `%TEMP%`; znacznika ustawień poza prefiksem
`relai-` i sprzątania starych znaczników; pamięci odczytów procesu hooka startu (`pamiecOdczytow`,
eksport `czytaj`); parametru `czytajTekst` w `indeksDokumentow`; znacznika prowizji
`.provisioned` z odciskami i pominięcia kopii przy kompakcji; `wymus: true` w instalatorze
Cursora; pliku `start-hook-cost.test.js`.

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

Z etapu E6 (lekcja L-0313): krok karty K-D9 „sam eksport” wymieniał funkcję, której jeszcze nie
było — skrót w `module.exports` przewróciłby `require`. W E7 nowe eksporty `czytaj`
i `pamiecOdczytow` dopisujesz razem z ich kodem; warunek `typeof core.pamiecOdczytow ===
'function'` w teście K-C3 chroni przebieg czerwony przed `TypeError`. Z E5 (L-0312): fikstura hooka
trzyma pomocnicze katalogi (`home`, `tmp`) obok projektu fikstury, nie w nim — helper `srodowisko()`
z karty K-C1 ma je w katalogu bazowym, obok `projekt/`. Wartości sekretów w testach składasz
w czasie działania — hook sesji 3.7.0 zablokuje zapis testu z gotowym przypisaniem.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E7/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-…`) i sprząta je `finally`/`t.after`. Hook
z repozytorium uruchamiasz wyłącznie z `cwd` fikstury — z `cwd` w repozytorium prowizjonuje
`.claude/relai/`.

1. **K-C1 — `core/process/work-artifacts.js`, `adapters/claude-code/hooks/session-context.js`,
   nowy `core/process/tests/start-hook-cost.test.js`, ścieżka sprzątania w
   `core/process/tests/ritual-copies.test.js` i `core/process/tests/hook-failures.test.js`**:
   `trescTestu` i dwie linie w `szukajWTestach`; `wProjekcie` w `bramka`; `KATALOG_ZNACZNIKOW`,
   `sprzatnijZnaczniki`, nowe `znacznikUstawien` i `oznaczUstawieniaPodane` w hooku. Trzy testy
   (`core/process` → 399).
2. **K-C3 — `core/process/session-signals.js`, `core/process/start-digest.js`,
   `core/process/work-artifacts.js`, hooki `session-context.js` trzech adapterów,
   `start-hook-cost.test.js`**: `pamiecOdczytow` i `czytaj` z pamięcią (eksporty dopisane razem
   z kodem), trzy odczyty przez `czytaj`, `czytaj` w wywołaniu skanu, `indeksDokumentow(cwd,
   czytajTekst)`, `czytajLF` przez `core.czytaj` (Edit — backslash), `pamiecOdczytow(true)` w trzech
   hookach i nowy `raport(out, 'tryb ciagly', …)` w hooku Claude Code. Dwa testy (→ 401).
3. **K-C2 — `core/process/session-signals.js`, hook Claude Code, `adapters/cursor/install.js`,
   `start-hook-cost.test.js`**: `crypto`, `ZNACZNIK_PROWIZJI`, `paryDrzewa`, `plikiProwizji`,
   `odcisk`, sprawdzenie i zapis znacznika w `provisionTemplates`, komentarz nad funkcją; pierwsze
   trafienie `provisionTemplates(cwd)` (SessionStart) z warunkiem `compact`; `wymus: true`
   w instalatorze Cursora. Cztery testy (→ 405).
4. **K-A6 — bez kodu** przy `A6: NIE POWTARZA`: Grep werdyktu (dwie komendy z karty) i zdanie
   zamknięcia karty we wpisie dziennika.
5. **Git.** Bez `push`. Jeden commit etapu (`perf:` po angielsku, conventional), proponowany
   w rytuale „Na koniec”.

Wszystkie komunikaty i komentarze w hookach tylko ASCII. Kod z backslashem przenosisz z karty
narzędziem Write/Edit (nigdy powłoką ani `node -e`). Wątek spoza kart → zatrzymujesz się i pytasz:
odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_7.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E6 (albo człowiek rozstrzygnął, co z drzewem).
- [x] Testy przed zmianą: każda karta z kodem ma zapisany w katalogu roboczym przebieg czerwony
      z właściwego powodu (K-C1: trzy czerwone z asercji — 3 odczyty pliku, `opisane` dla temp,
      znacznik w starym miejscu; K-C3: dwa czerwone z asercji — liczba odczytów i `typeof
      core.czytaj`; K-C2: przypadki 1, 3, 4 czerwone z asercji, przypadek 2 zielony jako kontrola).
- [x] `node --test core/process/tests/start-hook-cost.test.js` → **9 pass**;
      `node --test core/process/tests/ritual-copies.test.js`, `start-digest.test.js`,
      `start-cost.test.js`, `session-signals.test.js`, `esm-project.test.js` → zielone, liczba
      testów bez zmian.
- [x] `node --test "core/process/tests/*.test.*"` → **405 pass** (albo suma od wpisu E6 plus 9,
      opisana), 0 fail; `node --test "adapters/cursor/tests/*.test.js"` → 10 pass;
      `node --test "adapters/codex/tests/*.test.js"` → 28 pass; `core/guardrails` → 33 pass.
- [x] Dowód negatywny (zasada 3): `git diff core/process/tests/ritual-copies.test.js
      core/process/tests/hook-failures.test.js` zmienia wyłącznie ścieżki sprzątania znacznika
      (`git diff -U0` — każda linia `-` zawiera `relai-ustawienia-podane`); `prompt-mode.js`,
      `resume.js` i `.claude/relai/` bez zmian w `git status --short`.
- [x] K-A6: `grep -c "^A6: NIE POWTARZA$" docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` → 1
      i `grep -c "^A6: POWTARZA$" …` → 0; gałąź `compact` w hooku Claude Code bez zmian
      w brzmieniu; zdanie zamknięcia karty we wpisie dziennika.
- [x] Efekt widoczny (zasada 4; skrypt w katalogu roboczym, kod z repozytorium, fikstura z markerem
      i `TEMP`/`TMP`/`TMPDIR` na pusty katalog): pierwszy SessionStart hooka Claude Code mówi
      „Specyfikacje dokumentow RelAI sa skopiowane lokalnie”, drugi `startup` bez zmian i `compact`
      — nie; plik `.claude/relai/.provisioned` istnieje; znacznik w `tmp/znaczniki-relai/`, zero
      `relai-ustawienia-podane-*` w `tmp/`. Liczby odczytów (pliki testowe, `DZIENNIK.md`,
      `USTAWIENIA.md`, `CLAUDE.md`) przed i po z testów K-C1/K-C3 do wpisu.
- [x] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      `wywolania z hooks.json: 20` bez zmian.
- [x] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy, `trivy fs --scanners vuln`) — zero
      nowych CRITICAL i HIGH wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie
      dodaje zależności; po E6: 0 CRITICAL, 42 HIGH, 50 MEDIUM, 12 LOW — zastane fikstury
      ewaluacji `trivy-scan`, nie blokują). Trivy brak → zapis „brak pliku zależności w `adapters/`
      i `core/`” z wynikiem `git ls-files adapters core | grep package.json` (same fikstury
      ewaluacji `trivy-scan`).
- [x] Podstawy na zmianie etapu: nazwa znacznika z identyfikatora sesji oczyszczona do
      `[A-Za-z0-9_-]` (test K-C1 z identyfikatorem); `sprzatnijZnaczniki` kasuje wyłącznie wpisy
      z prefiksem `relai-ustawienia-podane-` w korzeniu i wpisy w `znaczniki-relai` (Grep `rmSync`
      w hooku → tylko te dwa miejsca); `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"`
      → 0; Grep po `PASSWORD=` w nowym teście → 0.
- [x] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” trzech kart
      i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_7.md`, `PROMPT_ETAP_8.md`, `DZIENNIK.md`,
      `STATE.md`, ewentualnie `LEKCJE.md`); pod `adapters/*/skills/relai-planning/` wyłącznie cztery
      zastane `*-closing.md`.
- [x] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów
      (`core/process` 405 albo zgodnie z sumą, opisaną), liczbami odczytów przed i po, zdaniem
      zamknięcia K-A6 i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E7/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-*` z testów i skryptu efektu) wypisane
      z nazwy razem z tym, co się z nimi stało.

Najtwardszy punkt to pełny zestaw `core/process` (405): K-C3 zmienia `czytaj`, z którego korzysta
cały rdzeń startu, a K-C2 zmienia `provisionTemplates`, które sprawdzają `session-signals.test.js`
i `esm-project.test.js`. Czerwony test spoza listy w karcie → zatrzymujesz się i opisujesz test
i zmianę, zamiast zmieniać test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E7 → `ZREALIZOWANY <data>`, E8 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E7 rozpoczęty”); link
   w kolumnie `Prompt` przy E8 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E7/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po, liczby odczytów przed i po, wynik Trivy, zdanie zamknięcia K-A6) /
   Świadomie odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj tabelę „Stan otwartych ryzyk”; lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1, trzema z E3 i trzema z E6).
4. `docs/STATE.md` — zdanie o stanie planu (E7 zrealizowany: skan artefaktów czyta każdy plik
   testowy raz, dokumenty startu raz na proces hooka, prowizja tylko przy zmianie, K-A6 zamknięta
   bez kodu; liczby testów; E8 gotowy). Liczebników hooków nie zmieniasz — E14. Tabeli „Stan prac”
   w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_8.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E8
   w sekcji 6 `PLAN.html`, z `karty/E08_SKROT_PROGI_MODELE.md` (aneks D-88), z realnego stanu
   repozytorium po tym etapie i z lekcji tego etapu. Liczby po E8 według tabeli narastającej
   konwencji: `core/process` 408–410 (SZACUNEK; wiążąca jest suma od wpisu E7).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
