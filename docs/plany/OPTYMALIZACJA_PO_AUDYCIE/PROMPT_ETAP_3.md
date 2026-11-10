# PROMPT_ETAP_3 — Skaner sekretów łapie nośniki kluczy i nie blokuje kodu; pre-commit bez dziur

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E3 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E2) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą gotowy kod, testy i wzorce sprawdzone na prototypie; praca jest
> wierną realizacją, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca liczby testów, sekcja 6 (hook `secret-scanner` sesji, backslash, `cd`) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E03_SKANER_I_PRECOMMIT.md` — całość | **to jest zakres etapu**: cztery karty z kodem docelowym, testami, tabelami przypadków i warunkami zatrzymania |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E3 w sekcji 6 (Grep `E03_SKANER_I_PRECOMMIT` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB z osadzonymi fontami) | cel etapu słowami planu |
| `core/guardrails/secret-scan.js` — całość | plik K-D1 i K-D4; kotwice w liniach 20, 30, 43, 49, 89 |
| `core/guardrails/tests/secret-scan.test.js` — nagłówek i pierwsze testy | zmienne `literal`, `expected`, import `scanText`; sposób składania wartości w czasie działania |
| `core/guardrails/pre-commit.js` i `core/guardrails/install-precommit.js` | pliki K-D3 i K-D2; kotwice w `pre-commit.js:45,61,71` i `install-precommit.js:52,100,137,216` |
| `core/guardrails/tests/install-precommit.test.js` — helper `fixture` | `f.install`, `f.git`, `f.run`, `f.hooks`, `installer` — testy K-D3 i K-D2 z nich korzystają |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 5 i 12 (sekcja „Pełne brzmienie”) | 3: dowód negatywny („stay silent”, „stay blocked”); 5: backslash tylko Write/Edit, kontrola pozytywna; 12: guardrail zatrzymujący nie-sekret to defekt rdzenia |
| `docs/DZIENNIK.md` — ostatni wpis (E2) | punkt wyjścia, stan gałęzi, sprawy odroczone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje, test jest
  zielony przed zmianą albo czerwony z innego powodu niż asercja → zatrzymujesz się i pytasz;
  karty nie poprawiasz.
- Kolejność kart: **K-D1 → K-D4 → K-D3 → K-D2** (karta E03). Kart nie łączysz; commit jest
  jeden na etap.
- K-D2: przy `core.hooksPath` wskazującym inny katalog instalator **odmawia** (kod 1, nic nie
  zapisuje) z linią do wklejenia — wybór karty; alternatywa jest w „Do rozstrzygnięcia przez
  człowieka” karty i nie blokuje wykonania.
- K-D1: lista rdzeni `_KEY` zamknięta (`SECRET`, `PRIVATE`, `ENCRYPTION`, `SIGNING`, `MASTER`) —
  wariant ogólny dał 7 fałszywych blokad (zasada 12). Z znaleziska D10 bierzesz wyłącznie granicę
  `{1,8}` w `ASSIGN_PREFIX_RE` (jawny wyjątek z konwencji, sekcja 7).
- Pomiar E2 (`POMIARY.md`) nie dotyczy tego etapu: werdykt `C9:` czyta karta K-C9 w E5, `A6:` —
  karta K-A6 w E7.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. Zmiana skanera działa w sesji dopiero po wydaniu — dowodem są testy
  i skrypt porównania, nie zachowanie hooka w Twojej sesji (konwencje, sekcja 6).
- Granica zakresu: wyłącznie `core/guardrails/secret-scan.js`, `pre-commit.js`,
  `install-precommit.js` i dwa pliki testów obok. Hooki adapterów
  (`adapters/*/hooks/secret-scanner.js`), D8, D11 (`config-protection.js`), D12 i marker gościa
  z D10 (`session-signals.js`) to etapy E4/E5 albo poza planem — nie ruszasz.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki **zainstalowanego** pluginu 3.7.0, w tym `secret-scanner`,
który zablokuje zapis pliku z gotowym przypisaniem sekretu — także testu i komentarza. Gałąź
`optymalizacja/po-audycie` ma commity `f3c5fbe` (plan), `86358ef` (E1) i — jeśli człowiek go
przyjął — commit etapu E2 (`git log --oneline -4`; brak commita E2 → zmiany E2 leżą w drzewie
roboczym, zostawiasz je i pytasz, zanim zaczniesz). E1 i E2 zmieniły wyłącznie dokumenty; E3 jest
**pierwszym etapem z kodem**. Git na maszynie: 2.49.0 (FAKT, `git --version` 2026-11-10;
`git hook run` wymaga ≥ 2.36).

```
core/guardrails/secret-scan.js               PATTERNS (PEM w linii 20), ASSIGN_RE (30), ASSIGN_PREFIX_RE (43,
                                             przedrostek bez gornej granicy), ENV_READ_RE (49), petla regul (89)
core/guardrails/pre-commit.js                git() bez kodowania, --diff-filter=ACM (61), git show + bajt zerowy (71)
core/guardrails/install-precommit.js         katalogGita (52), testDymny(repo, celHook, ...) (100),
                                             hooksDir = path.join(gitDir, 'hooks') (137), wywolanie testu (216)
core/guardrails/tests/secret-scan.test.js    14 testow
core/guardrails/tests/install-precommit.test.js  5 testow; helper fixture z GIT_CONFIG_GLOBAL na pustym pliku
docs/plany/OPTYMALIZACJA_PO_AUDYCIE/         STATUS.md (E1, E2 ZREALIZOWANE; E3 GOTOWY DO STARTU; bramka G1 OTWARTA),
                                             POMIARY.md (E2), PROMPT_ETAP_1..3.md, karty/
adapters/*/skills/relai-planning/*-closing.md   cztery pliki M z pustym git diff (konce linii) — nie ruszasz
.claude/launch.json                          niesledzony, spoza planu — nie dodajesz do commita
```

Testy przed etapem (FAKT, 2026-11-10): `node --test "core/guardrails/tests/*.test.js"` → 19 pass,
0 fail. Po etapie według tabeli konwencji: **33** (14 + 9 w `secret-scan.test.js`, 5 + 5
w `install-precommit.test.js`). Rdzeń nie ma pliku zależności (`core/` bez `package.json`).

**Czego jeszcze nie ma:** wykrycia nazwy w cudzysłowie (JSON, słownik), małych nazw
z przedrostkiem w kształcie konfiguracji, nazw `_KEY` z rdzeniem sekretu, bloku PGP, tokenów
`sk_live_`/`github_pat_`/`gho_`/`xoxb-`/`AIza` i hasła w adresie URL; liniowego czasu skanu
przedrostka; przepuszczania kodu, odczytów środowiska w Pythonie/Javie/C# i prozy; skanu plików
przemianowanych i UTF-16 z BOM w pre-commicie; instalatora, który widzi `core.hooksPath`
i worktree, oraz testu dymnego przez `git hook run`.

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

Lekcja z etapu E2 (L-0310, zasada 4): kontrolę pozytywną zależną od zachowania modelu sprawdzasz
pierwszą sesją serii w jej warunkach. W E3 nie ma sesji `claude -p` — dotyczy Cię tylko jako
wzór: test „czerwony z asercji” uruchamiasz przed zmianą, nie zakładasz go.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E3/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Karta K-D4 każe zapisać `porownaj-skaner.js` „w scratchpadzie sesji”; w tym etapie tym miejscem
jest katalog roboczy powyżej. Plik pośredni skryptu (`relai-secret-scan-head.js`) powstaje
w `os.tmpdir()`, jak w karcie, i skrypt sam go kasuje. Fikstury testów powstają w `os.tmpdir()`
i sprząta je helper testu.

Wykonujesz karty z `karty/E03_SKANER_I_PRECOMMIT.md` w podanej kolejności, każdą według sekcji 2
konwencji (test najpierw, czerwony z asercji, zmiana, test zielony, weryfikacja karty).

1. **K-D1 — `core/guardrails/secret-scan.js`** + pięć testów na końcu
   `core/guardrails/tests/secret-scan.test.js`: nowe wzorce w `PATTERNS` (PGP, Stripe, GitHub,
   Slack, Google, hasło w URL z `pomin`), `ASSIGN_RE` z cudzysłowem nazwy, `ASSIGN_PREFIX_RE`
   z granicą `{1,8}` i gałęzią `_KEY`, `ASSIGN_LOWER_RE`, funkcje `bezKontynuacji`
   i `wartoscJestKodem`, nowa pętla reguł z grupami 1–4. Przed zmianą: 4 czerwone, „stay silent”
   zielony. Po: 19 pass w pliku.
2. **K-D4 — ten sam plik** + cztery testy: `ENV_READ_RE` z `os.getenv`, `System.getenv`,
   `Environment.GetEnvironmentVariable`; `wartoscJestKodem` zastąpiona blokiem z `ENV_ROOT_RE`,
   `CODE_RE`, `PROZA_RE` (flaga `u`). Przed: trzy czerwone, czwarty zielony. Po: 23 pass w pliku;
   skrypt porównania z karty → `NOWE 0`, `ZNIKNIETE 0`.
3. **K-D3 — `core/guardrails/pre-commit.js`** + dwa testy na końcu
   `core/guardrails/tests/install-precommit.test.js`: `--diff-filter=ACMR`, `git(args, kodowanie)`,
   `dekoduj(buf)` z UTF-16 LE/BE po BOM, pętla na buforze. Po: 30 pass w katalogu.
4. **K-D2 — `core/guardrails/install-precommit.js`** + trzy testy: `revParse`,
   `katalogiHookow`, `tenSamKatalog`, odmowa przy `core.hooksPath`, `testDymny(repo, celLogika,
   zeShimem)` przez `git hook run` na własnym `GIT_INDEX_FILE`, `probkaSekretu`, `blad`; usunięta
   `doSh`; komunikaty i komentarz nagłówka wg karty. Po: **33 pass**.
5. **Git.** Bez `push`. Jeden commit etapu (`fix:` albo `feat:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Wyrażenia regularne i kod z backslashem przenosisz z karty narzędziem Edit (nigdy powłoką ani
`node -e`); wartości sekretów w testach i w `probkaSekretu` składasz z części. Wątek spoza kart →
zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz w tym pliku (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu,
nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git --version` ≥ 2.36.
- [ ] Testy przed zmianą: każda karta ma zapisany w notatkach przebieg czerwony z właściwego
      powodu (K-D1: 4 czerwone i „stay silent” zielony; K-D4: 3 czerwone i „stay blocked” zielony;
      K-D3: 2 czerwone na asercji; K-D2: 3 czerwone na asercji).
- [ ] `node --test "core/guardrails/tests/secret-scan.test.js"` → 23 pass, 0 fail.
- [ ] `node --test "core/guardrails/tests/*.test.js"` → **33 pass**, 0 fail; istniejących 19 testów
      nie zmieniono (`git diff` plików testów pokazuje wyłącznie dopisane linie na końcu).
- [ ] Skrypt porównania K-D4 (`node .claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E3/porownaj-skaner.js`
      uruchomiony z katalogu repozytorium) → `NOWE 0` i `ZNIKNIETE 0`, z liczbą przejrzanych plików
      we wpisie dziennika.
- [ ] Efekt widoczny z karty: `node core/guardrails/secret-scan.js <plik>` na pliku JSON z hasłem
      w cudzysłowie → `SEKRET`, na linii Javy z `System.getenv` → `BRAK` (oba pliki w katalogu
      roboczym, treść składana skryptem pisanym Write).
- [ ] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie o `security-audit/SKILL.md`,
      jak przed etapem.
- [ ] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy) — zero nowych CRITICAL i HIGH
      wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie dodaje zależności; zastane
      idą do tabeli ryzyk i nie blokują). Trivy brak → zapis „brak pliku zależności w `core/`,
      komenda ekosystemu nie ma zastosowania” z wynikiem `git ls-files core | grep package.json`
      (pusty).
- [ ] Podstawy na zmianie etapu: `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"`
      nie zwraca nic w plikach śledzonych; test czasu skanu (`A-` × 40 000) < 1000 ms; próbka
      sekretu testu dymnego i testów składana w czasie działania (Grep po `PASSWORD=` w trzech
      plikach `core/guardrails/*.js` i dwóch testach → 0 trafień gotowego przypisania).
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pięć plików
      `core/guardrails/` i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_3.md`, `PROMPT_ETAP_4.md`,
      `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`); pod `adapters/` wyłącznie cztery zastane
      `*-closing.md`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbą testów 33
      i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E3/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (`%TEMP%/relai-secret-scan-head.js`, fikstury testów w
      `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

Najtwardszy punkt to skrypt porównania K-D4: każda nowa blokada na pliku repozytorium zatrzymuje
etap — opisujesz plik i linię (bez treści) i pytasz, zamiast poluzować wzorzec po cichu.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E3 → `ZREALIZOWANY <data>`, E4 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E3 rozpoczęty”); link
   w kolumnie `Prompt` przy E4 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E3/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po, wynik porównania, wynik Trivy) / Świadomie odłożone / Do zrobienia
   przez człowieka (co najmniej: trzy pozycje „Do rozstrzygnięcia przez człowieka” z karty E03,
   jeśli człowiek ich nie rozstrzygnął w trakcie); podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj tabelę „Stan otwartych ryzyk”; lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1).
4. `docs/STATE.md` — zdanie o stanie planu (E3 zrealizowany: skaner i pre-commit, 33 testy
   `core/guardrails`; E4 gotowy). Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_4.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E4
   w sekcji 6 `PLAN.html`, z `karty/E04_GUARDY_CLAUDE_CODE.md`, z realnego stanu repozytorium po
   tym etapie i z lekcji tego etapu. Liczba testów `core/process` po E4 według tabeli narastającej
   konwencji: 372.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
