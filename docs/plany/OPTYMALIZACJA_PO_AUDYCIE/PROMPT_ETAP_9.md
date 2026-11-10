# PROMPT_ETAP_9 — Tryb ciągły: trwała odmowa, filtr przyjęcia propozycji, sesja zaczęta komendą

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E9 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E8) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy, brzmienie aneksu, tabelę 44 promptów z prototypu i kopie
> zdań; praca jest wierną realizacją kart, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 5 (generator skilli Codeksa, rejestr `ARTEFAKTY.md`), sekcja 6 (backslash, backtick, ASCII, `cd`, `config-protection`) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E09_TRYB_CIAGLY.md` — całość | **to jest zakres etapu**: trzy karty (K-B1, K-B2, K-B4) z kodem docelowym, brzmieniem aneksu D-93, tabelą promptów i testami |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E9 w sekcji 6 (Grep `E09_TRYB_CIAGLY` z kontekstem 6 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `core/process/prompt-mode.js` (`FRAZY_SESJI`, `POWIADOMIENIE_W_TLE`, `POTWIERDZENIA`, `ZAIMKI_PYTAJNE`, `normalizuj`, `powodPominiecia`, `regulaBramki`, eksport) | K-B1, K-B2 |
| `core/process/session-title.js` (`PHRASES`, `bare`, `isContinuation`) | K-B2 |
| `adapters/claude-code/commands/relai-prompt.md` (Krok 0a, sekcja „Tryb ciągły”, „Dawniej”) | K-B1, K-B2 |
| hooki startu `adapters/claude-code/hooks/session-context.js` i `adapters/cursor/hooks/session-context.js`, `core/process/session-signals.js` (`sprawyPrzeterminowaneReport`) | K-B4 |
| `docs/LEKCJE.md` — pełne brzmienie zasad 1, 3, 5, 7, 8 i 13 (sekcja „Pełne brzmienie”) | 1: kopie reguły na całej rodzinie dokumentów; 3: dowód negatywny (z L-0315: asercja nieobecności celuje w brzmienie, które zmiana usuwa); 5: backslash tylko Write/Edit, bez `cd` w poleceniach; 7: zamknięta lista brzmień (`SLOWA_POTWIERDZENIA`, wiersz zgody); 8: która warstwa rozstrzyga po zapisie; 13: payload i hook z wydanego builda |
| `docs/DZIENNIK.md` — ostatni wpis (E8) | punkt wyjścia: `core/process` 409, cursor 10, codex 28, guardrails 33; dwa rozjazdy kart z E8 |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje albo test
  „najpierw” jest zielony przed zmianą (poza nazwanym wyjątkiem: test ciszy przy globalnym „nie”
  w K-B1) / czerwony z błędu innego niż asercja → zatrzymujesz się i pytasz; karty nie poprawiasz.
  Nową nazwę dopisujesz do eksportu razem z jej definicją (L-0313).
- Kolejność kart: **K-B1 → K-B2 → K-B4**. Kart nie łączysz; commit jest jeden na etap.
- K-B1: aneks do D-93 ma **gotowe brzmienie w karcie** i zgodę Łukasza z 2026-11-09 — wiersz
  dopisujesz na końcu tabeli „Decyzje zmienione” w `docs/DECYZJE.md` (dziś ostatni jest aneks D-88
  z 2026-11-10) z datą dnia wykonania; treści D-93 w linii 66 nie edytujesz. **Odczytu zgody nie
  zmieniasz** (`zgodaGlobalna`, `ZGODA_*`, `stanBramki`) — „nie” już działa (fakt z nagłówka karty).
- K-B2: rozstrzygnięcia (a)–(e) z karty są wiążące; lista `SLOWA_POTWIERDZENIA` dosłownie z karty
  — każde nowe słowo to decyzja człowieka (zasada 7). Tryb ciągły istnieje tylko w Claude Code;
  kopii filtra w Cursorze i Codeksie nie tworzysz.
- K-B4: nakaz jest warunkowy w tekście (SessionStart nie zna pierwszego promptu); hook Codeksa
  **bez zmian** (karta). Zapis zgody przez `/relai-prompt` wywołaną wprost — nie dodajesz.
- Rejestr: w E8 każdy artefakt dotknięty przez dwie karty dostał **jedno** podbicie wersji na
  etap z obiema kartami we wpisie (wpis dziennika E8) — tak samo tutaj: `relai-prompt.md`
  (K-B1, K-B2) i `SKILL.md` relai-core (K-B4) po jednym podbiciu.
- **D-41 bez zmian**: blokują wyłącznie `secret-scanner` i `config-protection`. Kontrola
  `readme-hooki` w `release-check.js` jest **czerwona do K-E9 w E14** — stan oczekiwany.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 (bramka z trzema
  opcjami, bez `bash-guard`) — dowodem zmiany kodu są testy i narzędzia z repozytorium.
- Granica zakresu: pliki z pól „Pliki” trzech kart. Zdanie startu `trybCiaglyReport` (A5), wsad
  agenta optymalizatora (B3), regula `regula()` i jej próg 400 znaków, `RESUME_LINE`, hook
  `adapters/claude-code/hooks/session-title.js`, gałąź po kompakcji, linia „kończymy na dziś”
  (E10), reguły Cursora wobec D-88 (K-E4, E11), skrót i koszt startu (E7, E8), liczebniki (E14)
  — nie ruszasz. Rotacji dokumentów zgłoszonych na starcie nie wykonujesz w tym etapie.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity planu i etapów E1–E7 (`cfee4df` — E7) i — jeśli człowiek go przyjął — commit etapu E8
(`git log --oneline -8`; brak commita E8 → zmiany E8 leżą w drzewie roboczym, zostawiasz je
i pytasz, zanim zaczniesz). E8 zmienił `start-digest.js`, `session-signals.js`
(`dokumentyPonadProgiem`), `rotate.js`, hook startu Codeksa (wypisuje teraz
`sprawyPrzeterminowaneReport`), `relai-core/SKILL.md` (dwa akapity), `relai-core.mdc` (linia 25),
`SPEC_USTAWIENIA.md` i testy `start-digest`, `ritual-copies` (nowy test spraw w trzech hookach),
`start-cost`, `rotate`. Kotwice E9 sprawdzone grepem 2026-11-10 po E8 — wszystkie są.

```
core/process/prompt-mode.js           komentarz naglowka "Trzy\n// odpowiedzi" (l. 9-11);
                                      const FRAZY_SESJI = [ (l. 69); const POWIADOMIENIE_W_TLE (l. 81);
                                      "// Krotkie potwierdzenia — zamknieta lista" (l. 83);
                                      const ZAIMKI_PYTAJNE (l. 92); ".replace(/[,;:]/g, ' ')" (l. 112);
                                      "if (POTWIERDZENIA.has(n)) return 'krotkie potwierdzenie';" (l. 285);
                                      "'pytanie (AskUserQuestion) o trzy opcje..." w regulaBramki (l. 354)
core/process/session-title.js         const PHRASES (l. 21); function bare (l. 35); "PHRASES.has(bare(text))" (l. 42)
adapters/claude-code/commands/relai-prompt.md   wiersz "`off --globalnie` | ... bramka pyta od nowa" (l. 29);
                                      "`off --globalnie` **nie wyłącza** trybu" (l. 35); "pytaniem o trzy" (l. 157);
                                      "Odpowiedź „nie" wycisza" (l. 161); "a wyłącza ją" (l. 166, dalej l. 167)
core/templates/SPEC_USTAWIENIA.md     sekcja "Zgoda na optymalizator": "pytaniem o trzy" (ok. l. 655, lamane),
                                      przelacznik "| `tak` / `nie` (EN: ..." (l. 671); "Wyłącznik: `/relai-prompt
                                      off --globalnie`." (l. 678)
adapters/claude-code/hooks/session-context.js   'potem napisz akapit "gdzie jestesmy". Jesli dostepny...' (l. 227)
adapters/cursor/hooks/session-context.js        '"gdzie jestesmy". Reguly procesu masz w regulach ' (l. 138)
core/process/session-signals.js       'albo rozstrzygnac teraz. Procedura: plik overdue-review.md ...' (l. 1794)
adapters/claude-code/skills/relai-core/SKILL.md "Nie inicjalizuj niczego drugi raz. Wykonaj **rytuał startu**" (l. 87)
adapters/claude-code/skills/relai-core/overdue-review.md "3. sesja jest interaktywna." (l. 20)
adapters/cursor/rules/relai-core.mdc  "... that is the whole start read." (l. 22)
CLAUDE.md / AGENTS.md                 "... żaden hook jej nie sygnalizuje." (l. 31 / l. 34); CLAUDE.md 6 905 B
core/templates/SPEC_CLAUDE_MD.md      to samo zdanie w l. 162 (cytat "> odroczyć ...") i l. 270 (przyklad)
docs/DECYZJE.md                       D-93 (l. 66); tabela "## Decyzje zmienione", ostatni wiersz aneks D-88
docs/ARTEFAKTY.md                     /relai-prompt (l. 97, wersja 14); Specyfikacja USTAWIENIA.md (l. 52,
                                      wersja 21); Skill relai-core (l. 119, wersja 30); Specyfikacja CLAUDE.md
                                      (l. 33, wersja 9); relai-core — przeglad spraw (l. 134, wersja 1);
                                      Regula relai-core Cursor (l. 169, wersja 9)
core/process/tests/                   38 plikow, 409 testow (FAKT, wpis E8); prompt-mode.test.js 19, prompt-gate
                                      7, session-title 23 wywolan test(); test "regulaBramki carries the three
                                      options..." (prompt-mode l. 287) zostaje bez zmiany nazwy
adapters/*/skills/relai-planning/*-closing.md    cztery pliki M z pustym git diff (konce linii) - nie ruszasz
.claude/launch.json                   niesledzony, spoza planu - nie dodajesz do commita
```

**Skutek E8 dla K-B4:** hook startu Codeksa woła od E8 `sprawyPrzeterminowaneReport`, więc zdanie
wyjątku dopisane w tej funkcji (K-B4, krok 3) trafi także do Codeksa — bez zmiany jego hooka
(zgodnie z kartą). Zdanie karty „hook Codeksa nie wypisuje przeglądu spraw” jest nieaktualne
od E8 — rozjazd do wpisu dziennika, karty nie poprawiasz. Test K-B4 nr 2 woła samą funkcję
i tego nie dotyka. Test E8 „overdue items: hooks of three adapters report them…” musi zostać
zielony.

Testy (konwencje, sekcja 4): `node --test "core/process/tests/*.test.*"` ok. 110 s,
`adapters/codex/tests` ok. 40 s (SZACUNEK) — w tle albo z limitem 10 minut, **z katalogu
repozytorium ścieżką względną, bez `cd` w poleceniu** (L-0311, L-0314: polecenie z
`cd <repo> && …` albo `cd <podkatalog>` przestawia katalog sesji; ścieżki w argumentach albo
podpowłoka `( cd … && … )`). Po etapie według karty (wiążąca jest suma od wpisu E8):
`core/process` **421** (409 + 12: K-B1 +2, K-B2 +7, K-B4 +3), `adapters/cursor` **10**
i `adapters/codex` **28** bez zmian, `core/guardrails` 33 bez zmian. `validate-adapters.js`:
kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`), `wywolania z hooks.json: 20` (FAKT z E8).

**Czego jeszcze nie ma:** czwartej opcji bramki „nie i nie pytaj więcej”; opisu `off --globalnie`
jako trwałej odmowy (komenda i `SPEC_USTAWIENIA.md` mówią dziś „bramka pyta od nowa”, co przeczy
kodowi); aneksu D-93; filtra przyjęcia propozycji (`SLOWA_POTWIERDZENIA`, `LIMIT_POTWIERDZENIA`),
`PYTAJNE_Z_PYTAJNIKIEM`, `KOMENDA`, `FRAZY_KONTYNUACJI` i frazy `gotowi do wydania`; usuwania
apostrofów i `…` w `normalizuj`; jednej listy fraz dla `session-title.js`; wyjątku „pierwsza
wiadomość to komenda” w hookach startu, raporcie spraw i siedmiu kopiach reguły.

**Zasady aktywne — indeks z rejestru lekcji** (stan 2026-11-10 po E8; D-15 Aneks A: start czyta
indeks, pełne brzmienie doczytujesz z `docs/LEKCJE.md` przy trafieniu w wyzwalacz):

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

Z etapu E8: asercja nieobecności z karty może trafić w zdanie, które ta sama karta chroni
(L-0315) — gdy test „najpierw” zostaje czerwony po poprawnej zmianie, sprawdź, czy nie trafia
w tekst z pola „Nie ruszasz”, i pytaj, zamiast zmieniać chroniony tekst. FAKT-y kart pisane
2026-11-09 (liczby, bajty, numery linii) mierzysz na starcie (L-0315). Fikstury hooka trzymają
`home`/`tmp` obok projektu (L-0312); test hooka w `prompt-gate.test.js` ustawia `USERPROFILE`
i `HOME` w `env`.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E9/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-…`) i sprząta je `finally`/`t.after`. Hook
z repozytorium uruchamiasz wyłącznie z `cwd` fikstury.

1. **K-B1 — `core/process/prompt-mode.js`, `core/process/tests/prompt-mode.test.js`,
   `core/process/tests/prompt-gate.test.js`, `adapters/claude-code/commands/relai-prompt.md`,
   `core/templates/SPEC_USTAWIENIA.md`, `docs/KOMENDY.md`, `docs/DECYZJE.md`, `docs/ARTEFAKTY.md`**,
   kopia `adapters/codex/skills/relai-prompt/SKILL.md` (generator): tekst bramki z czterema
   opcjami (Edit), komentarz nagłówka, tabela przełączników i akapit Kroku 0a, sekcja „Tryb
   ciągły” i „Dawniej”, cztery zmiany specyfikacji, dwie w `KOMENDY.md`, wiersz aneksu D-93.
   Dwa nowe testy (jeden strażnik regresji zielony przed zmianą) → `core/process` 411.
2. **K-B2 — `core/process/prompt-mode.js`, `core/process/session-title.js`, testy
   `prompt-mode`, `prompt-gate`, `session-title`, `relai-prompt.md`, `docs/KOMENDY.md`,
   `docs/ARTEFAKTY.md`**, kopia Codeksa: `FRAZY_KONTYNUACJI`/`FRAZY_SESJI`, `KOMENDA`,
   `SLOWA_POTWIERDZENIA`/`LIMIT_POTWIERDZENIA`, `ZAIMKI_PYTAJNE`/`PYTAJNE_Z_PYTAJNIKIEM`,
   `normalizuj` (apostrofy, `…` — Edit, backslash), `powodPominiecia`, eksport, `session-title.js`
   bez `bare`. Siedem nowych testów, żaden istniejący nie zmienia oczekiwania → 418.
3. **K-B4 — hooki startu Claude Code i Cursora, `core/process/session-signals.js`,
   `relai-core/SKILL.md`, `overdue-review.md`, `relai-core.mdc`, `CLAUDE.md`, `AGENTS.md`,
   `core/templates/SPEC_CLAUDE_MD.md`, `ritual-copies.test.js`, `docs/ARTEFAKTY.md`**, kopie Codeksa
   (generator): zdanie wyjątku w ASCII w dwóch hookach i raporcie spraw, zdanie w pięciu kopiach
   dokumentów (w `SPEC_CLAUDE_MD.md` dwa miejsca), cztery wiersze rejestru. Trzy nowe testy → 421.
   `config-protection` może zapytać przy `CLAUDE.md` — człowiek potwierdza.
4. **Git.** Bez `push`. Jeden commit etapu (`feat:` albo `fix:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Wszystkie komunikaty i komentarze w kodzie tylko ASCII. Kod z backslashem i edycje dokumentów
z backtickiem — narzędziem Write/Edit (nigdy powłoką ani `node -e`). Skilli Codeksa nie edytujesz
ręcznie — tylko generator. Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy
„świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_9.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E8 (albo człowiek rozstrzygnął, co z drzewem).
- [x] Testy przed zmianą: każda karta ma zapisany w katalogu roboczym przebieg czerwony z asercji
      (K-B1: test `regulaBramki offers the fourth option…` czerwony, test ciszy przy globalnym
      „nie” zielony — strażnik; K-B2: siedem nowych czerwonych; K-B4: trzy nowe czerwone).
- [x] `node --test core/process/tests/prompt-mode.test.js core/process/tests/prompt-gate.test.js core/process/tests/session-title.test.js`
      → zielone, o 9 więcej niż przed etapem; `ritual-copies.test.js` → zielone, o 3 więcej
      (w tym test E8 spraw w trzech hookach).
- [x] `node --test "core/process/tests/*.test.*"` → **421 pass** (albo suma od wpisu E8 plus 12,
      opisana), 0 fail; `adapters/cursor` → 10 pass; `adapters/codex` → 28 pass;
      `core/guardrails` → 33 pass.
- [x] Greps z kart: `grep -c "D-93\*\* → aneks" docs/DECYZJE.md` → 1 i `git diff --numstat
      docs/DECYZJE.md` → `1 0` (linia 66 bez zmian); `grep -n "bramka pyta od nowa"
      adapters/claude-code/commands/relai-prompt.md adapters/codex/skills/relai-prompt/SKILL.md`
      → brak; `grep -c "nie i nie pytaj więcej" adapters/claude-code/commands/relai-prompt.md` → ≥ 2;
      `grep -n "let's continue" core/process/session-title.js` → brak;
      `grep -c "gotowi do wydania" core/process/prompt-mode.js` → 1.
- [x] Dowód negatywny (zasada 3): `git diff --stat adapters/codex/` → wyłącznie
      `skills/relai-prompt/SKILL.md`, `skills/relai-core/SKILL.md`, `skills/relai-core/overdue-review.md`
      (plus zastane `relai-planning/*-closing.md`), **hook Codeksa bez zmian**;
      `diff CLAUDE.md AGENTS.md | grep -c "^[<>]"` → ta sama liczba co przed K-B4;
      `wc -c CLAUDE.md` → poniżej 10 240; odczyt zgody (`zgodaGlobalna`, `ZGODA_`) bez zmian
      w `git diff core/process/prompt-mode.js`.
- [x] Efekt widoczny (zasada 4), kodem z repozytorium: tabela 44 promptów z karty K-B2 przepuszczona
      przez `powodPominiecia` przed (kopia `prompt-mode.js` z commitu E8 przez `git show` do
      katalogu roboczego, bez `git stash`) i po — wynik „44 z 44 zgodnych” do wpisu; `regulaBramki('s')`
      po zmianie zawiera `(4) nie i nie pytaj wiecej`, a bajty tekstu bramki mieszczą się
      w progach 1200 i 1800 znaków (karta: 1118 / 1743 / 1190 B, SZACUNEK z prototypu).
- [x] Rejestr (konwencje, sekcja 5): wiersze `docs/ARTEFAKTY.md` z kart podbite o 1 na etap
      (`/relai-prompt` 14 → 15, Specyfikacja `USTAWIENIA.md` 21 → 22, Skill `relai-core` 30 → 31,
      `relai-core` — przegląd spraw 1 → 2, Reguła `relai-core` Cursora 9 → 10, Specyfikacja
      `CLAUDE.md` 9 → 10), każdy z wpisem `2026-…(wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E9, K-…)`
      na początku kolumny.
- [x] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      `parytet skilli Claude Code -> Codex: … 0 rozjazdow`, `wywolania z hooks.json: 20`.
- [x] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy, `trivy fs --scanners vuln`) — zero
      nowych CRITICAL i HIGH wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie
      dodaje zależności; po E8: 0 CRITICAL, 42 HIGH, 50 MEDIUM, 12 LOW — zastane fikstury
      ewaluacji `trivy-scan`, nie blokują). Trivy brak → zapis „brak pliku zależności w `adapters/`
      i `core/`” z wynikiem `git ls-files adapters core | grep package.json`.
- [x] Podstawy na zmianie etapu (filtr czyta wejście człowieka — zasada 12): `KOMENDA` sprawdzony
      kontrolą pozytywną (`/relai:relai-stage PLAN E3` trafia) i negatywną (`/c/Users/x/log.txt`
      nie); powiadomienie `<task-notification>` dalej pomijane (istniejące testy zielone);
      `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"` → 0; `PASSWORD=`
      w zmienionych testach → 0.
- [x] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” trzech kart,
      kopie Codeksa i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_9.md`, `PROMPT_ETAP_10.md`,
      `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`); pod `adapters/*/skills/relai-planning/`
      wyłącznie cztery zastane `*-closing.md`.
- [x] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów
      (`core/process` 421 albo zgodnie z sumą, opisaną), wynikiem tabeli 44 promptów, bajtami
      tekstu bramki, rozjazdem „hook Codeksa a przegląd spraw” i podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E9/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-*` z testów) wypisane z nazwy razem
      z tym, co się z nimi stało.

Najtwardszy punkt to tabela 44 promptów: każda pozycja musi dać wynik z kolumny „Po zmianie”.
Pozycja niezgodna → zatrzymujesz się i pokazujesz ją z wynikiem przed i po, zamiast dopisywać
słowo do `SLOWA_POTWIERDZENIA` albo stroić regułę (zasada 7: poszerzenie listy to decyzja
człowieka).

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E9 → `ZREALIZOWANY <data>`, E10 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E9 rozpoczęty”); link
   w kolumnie `Prompt` przy E10 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E9/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po, tabela 44 promptów, bajty bramki, wynik Trivy) / Świadomie
   odłożone / Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj
   tabelę „Stan otwartych ryzyk” (O4 — tryb ciągły kosztuje turę — dotyczy wprost tego etapu);
   lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1, trzema z E3 i trzema z E6).
4. `docs/STATE.md` — zdanie o stanie planu (E9 zrealizowany: trwała odmowa trybu ciągłego,
   aneks D-93, filtr przyjęcia propozycji, sesja zaczęta komendą; liczby testów; E10 gotowy).
   Liczebników hooków nie zmieniasz — E14. Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_10.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E10
   w sekcji 6 `PLAN.html`, z `karty/E10_PROMPTY_ETAPOW_I_RYTUALY.md`, z realnego stanu repozytorium
   po tym etapie i z lekcji tego etapu. Liczby po E10 według tabeli narastającej konwencji:
   `core/process` 423–425 (SZACUNEK; wiążąca jest suma od wpisu E9).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
