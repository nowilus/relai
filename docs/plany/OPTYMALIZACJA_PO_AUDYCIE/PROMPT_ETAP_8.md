# PROMPT_ETAP_8 — Skrót startu bez odsyłaczy i spraw, progi osiągalne rotacją, wiersz modelu optymalizatora

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E8 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E7) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy, brzmienie aneksu i kopie zdań; praca jest wierną realizacją
> kart, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 5 (generator skilli Codeksa, rejestr `ARTEFAKTY.md`), sekcja 6 (backslash, backtick, ASCII, `cd`, `config-protection`) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E08_SKROT_PROGI_MODELE.md` — całość | **to jest zakres etapu**: trzy karty (K-A2, K-A3, K-A4) z kodem docelowym, brzmieniem aneksu D-88, kopiami zdań i testami |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E8 w sekcji 6 (Grep `E08_SKROT_PROGI_MODELE` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `core/process/start-digest.js` (`czescDziennika`, `blok`, drogowskazy, `NAGLOWEK_CZEKA`) | K-A2 |
| `core/process/session-signals.js` (`dokumentyPonadProgiem`) i `core/tools/rotate.js` (`raportPlanu`) | K-A3 |
| `adapters/codex/hooks/session-context.js` | K-A2, krok 3 |
| `docs/LEKCJE.md` — pełne brzmienie zasad 1, 3, 5, 6, 7 i 11 (sekcja „Pełne brzmienie”) | 1: kopie reguły na całej rodzinie dokumentów; 3: dowód negatywny; 5: backslash tylko Write/Edit, kontrola pozytywna; 6: próg liczony od wielkości, którą mechanizm kontroluje; 7: komórka ustawień czytana maszynowo; 11: końce linii i kolejność wpisów |
| `docs/DZIENNIK.md` — ostatni wpis (E7) | punkt wyjścia: `core/process` 405, cursor 10, codex 28, guardrails 33 |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje albo test
  „najpierw” jest zielony przed zmianą / czerwony z błędu innego niż asercja → zatrzymujesz się
  i pytasz; karty nie poprawiasz. Nową nazwę dopisujesz do eksportu razem z jej definicją (L-0313).
- Kolejność kart: **K-A2 → K-A3 → K-A4**. Kart nie łączysz; commit jest jeden na etap.
- K-A2: nośnikiem spraw przeterminowanych zostaje **hook startu** we wszystkich trzech adapterach
  (zasada 8); skrót traci sekcję „Czeka na człowieka” w całości, drogowskaz wskazuje ją zawsze;
  linie-odsyłacze archiwum ryzyk zwijają się do jednej linii z ich liczbą (brzmienie dosłownie
  z karty, ASCII).
- K-A3: aneks do D-88 ma **gotowe brzmienie w karcie** i zgodę Łukasza z 2026-11-09 — wiersz
  dopisujesz na końcu tabeli „Decyzje zmienione” w `docs/DECYZJE.md` z datą dnia wykonania; treści
  D-88 w linii 29 nie edytujesz. Statusów ryzyk nie zmieniasz.
- K-A4: jedno pytanie do człowieka (AskUserQuestion) z opcjami z karty; wiersz zostaje
  podpowiedzią, bez członu `· nie pytaj`; starego wiersza nie przenosisz do „Ustawień wycofanych”.
  Hook `config-protection` zapyta o zgodę na edycję `docs/USTAWIENIA.md` — to poprawne.
- **D-41 bez zmian**: blokują wyłącznie `secret-scanner` i `config-protection`. Kontrola
  `readme-hooki` w `release-check.js` jest **czerwona do K-E9 w E14** — stan oczekiwany.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 — dowodem zmiany kodu
  są testy i narzędzia z repozytorium uruchomione na tym repozytorium albo fiksturze.
- Granica zakresu: pliki z pól „Pliki” trzech kart. Reguły Cursora wobec D-88 i aneksu (K-E4,
  E11), trybu ciągłego (E9), promptów i rytuałów (E10), akapitu „Sprawa przeterminowana”
  w `CLAUDE.md` / `AGENTS.md` / `SPEC_CLAUDE_MD.md`, brzmienia `sprawyPrzeterminowaneReport`,
  zdań hooka o liście modeli (A5), `wiekListyModeliReport`, listy `MODELE.md` adapterów,
  `PRZYGOTOWANIE.md` i liczebników (E14) — nie ruszasz. Rotacji dokumentów zgłoszonych na starcie
  nie wykonujesz w tym etapie.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity planu i etapów E1–E6 (`364e94e` — E6) i — jeśli człowiek go przyjął — commit etapu E7
(`git log --oneline -8`; brak commita E7 → zmiany E7 leżą w drzewie roboczym, zostawiasz je
i pytasz, zanim zaczniesz). E7 zmienił `session-signals.js` (pamięć odczytów `czytaj` /
`pamiecOdczytow`, znacznik prowizji `.provisioned`), `start-digest.js` (`czytajLF` przez
`core.czytaj`), `work-artifacts.js` i hooki startu trzech adapterów — kotwice E8 tego nie
dotyczą (sprawdzone 2026-11-10).

```
core/process/start-digest.js          naglowek "sekcje "Czeka na czlowieka" tylko przy sprawie" (l. 8);
                                      const NAGLOWEK_CZEKA (l. 39); function blok (l. 117);
                                      function czescDziennika (l. 159); "bezMitygacji(cialo(ryzyka)),
                                      linieSekcji(rel, txt, ryzyka)));" (l. 169); komentarz "Czeka na
                                      czlowieka" tylko przy sprawie przeterminowanej (l. 171, blok do l. 181);
                                      "return { bloki, rel, czeka: przeterminowane > 0, wpis: trescWpisu };"
                                      (l. 190); drogowskaz "(c.dziennik.czeka ? '' : ..." (l. 267)
core/process/session-signals.js       function dokumentyPonadProgiem (l. 1270); "zamykanie ryzyk (zadne
                                      nie jest ZAMKNIETE..." (l. 1298); "const bajtow = bajtyLF(txt);" (l. 1306)
core/tools/rotate.js                  "komunikat zablokowanej rotacji (SPEC_ARCHIWUM.md)" (l. 331)
adapters/codex/hooks/session-context.js  "startCostReport(core.startCost(cwd, { markeryGoscia: markers }))" (l. 61)
adapters/claude-code/skills/relai-core/SKILL.md   "(sekcję „Czeka" (l. 93); "3. **Ryzyka**" (l. 224)
adapters/claude-code/skills/relai-core/document-rotation.md   tabela "40 lekcji albo 50 KB" (l. 25);
                                      "wypisuje wszystkie cztery liczby." (l. 118); "(L-0036, L-0049)." (l. 136)
adapters/cursor/rules/relai-core.mdc  "only when an item is overdue" (l. 25)
core/templates/SPEC_USTAWIENIA.md     "Czeka na człowieka” / tylko przy sprawie" (l. 188-189); katalog progow
                                      czesc `ryzyka` (l. 791); "`docs/LEKCJE.md` — waga i liczba" (l. 796)
core/templates/SPEC_ARCHIWUM.md       tabela progow (l. 76); "Te progi mają adres także na starcie" (l. 89);
                                      "**Lekcje:** dolna granica" (l. 124); "**waga całkowita** żywego pliku
                                      zejdzie **poniżej" (l. 302); przypadki brzegowe (l. 553, 557);
                                      "Sprawa człowieka a rotacja." w "Dawniej" (l. 815)
core/templates/SPEC_LEKCJE.md         "co nastąpi wcześniej." (l. 206)
docs/DECYZJE.md                       D-88 (l. 29); tabela "## Decyzje zmienione" (l. 102), ostatni wiersz
                                      aneks D-14 z 2026-11-10
docs/USTAWIENIA.md                    "| 2026-09-14 | Model optymalizatora | Sonnet 5 · lista claude-code z dnia
                                      2026-09-04 |" (l. 30)
docs/ARTEFAKTY.md                     wiersze: Specyfikacja archiwum (l. 32, wersja 6), Specyfikacja LEKCJE.md
                                      (l. 38, wersja 3), Specyfikacja USTAWIENIA.md (l. 52, wersja 20), Skill
                                      relai-core (l. 119, wersja 29), relai-core — rotacja dokumentów (l. 122,
                                      wersja 2), Regula relai-core Cursor (l. 169, wersja 8)
core/process/tests/                   38 plikow, 405 testow (FAKT, wpis E7); start-digest.test.js l. 105 test
                                      "waiting-on-a-human section appears only when an item is overdue";
                                      start-cost.test.js l. 144 komentarz "Aneks A: linia progow..."; rotate.test.js
.claude/relai/MODELE-claude-code.md   list-date: 2026-11-10 (FAKT): strong Opus 5.5, strong Fable 5.2,
                                      balanced Sonnet 5.5, cheap Haiku 5.5
adapters/claude-code/MODELE.md        list-date: 2026-10-08 (FAKT) - bez Fable 5.2
adapters/*/skills/relai-planning/*-closing.md    cztery pliki M z pustym git diff (konce linii) - nie ruszasz
.claude/launch.json                   niesledzony, spoza planu - nie dodajesz do commita
```

**Rozjazd karty ze stanem (K-A4):** karta pyta o model z „listy claude-code z dnia 2026-10-08”
i wzoruje wiersz na `· lista claude-code z dnia 2026-10-08`, a lista w projekcie
(`.claude/relai/MODELE-claude-code.md`, ta, którą wskazuje zdanie hooka startu) ma od 2026-11-10
datę `2026-11-10` i dodatkowo `Fable 5.2`. Przed pytaniem K-A4 mówisz o tym człowiekowi jednym
zdaniem i pytasz, którą datę wpisać do wiersza; rozjazd idzie do wpisu dziennika. Opcji pytania
z karty nie zmieniasz.

Testy (konwencje, sekcja 4): `node --test "core/process/tests/*.test.*"` ok. 110 s,
`adapters/codex/tests` ok. 40 s (SZACUNEK) — w tle albo z limitem 10 minut, **z katalogu
repozytorium ścieżką względną** (L-0311). Po etapie według karty (wiążąca jest suma od wpisu E7):
`core/process` **409** (405 + 4: K-A2 +2 i jeden przepisany, K-A3 +2 i jeden ze zmienionym
oczekiwaniem, K-A4 0), `adapters/cursor` **10** i `adapters/codex` **28** bez zmian,
`core/guardrails` 33 bez zmian. `validate-adapters.js`: kod 0, jedno ostrzeżenie
(`security-audit/SKILL.md`), `wywolania z hooks.json: 20` (FAKT z E7).

**Czego jeszcze nie ma:** funkcji `bezOdsylaczy` i linii `[odsylacze do archiwum ryzyk pominiete:
N; …]` w skrócie; skrótu bez sekcji „Czeka na człowieka” i z drogowskazem zawsze; raportu spraw
przeterminowanych w hooku Codeksa; aneksu D-88 w `docs/DECYZJE.md`; progu `LEKCJE.md` liczonego
bez „Zasad aktywnych”; ciszy sekcji ryzyk bez zamkniętych na starcie i w `rotate.js plan ryzyka`;
kopii tych reguł w specyfikacjach i skillu; wiersza „Model optymalizatora” z nazwą z listy.

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

Z etapu E7: hook startu ma od E7 pamięć odczytów — dokument zapisany w tym samym procesie hooka
nie może być czytany przez `core.czytaj` przed zapisem (karta K-C3, pułapki); E8 nie dodaje zapisu
w hooku, więc warunek jest spełniony. Fikstury hooka trzymają `home`/`tmp` obok projektu (L-0312),
a test, który zmienia `process.env.TEMP`, przywraca go w `finally`.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E8/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-…`) i sprząta je `finally`/`t.after`. Hook
z repozytorium uruchamiasz wyłącznie z `cwd` fikstury.

1. **K-A2 — `core/process/start-digest.js`, `adapters/codex/hooks/session-context.js`,
   `core/process/tests/start-digest.test.js`, `core/process/tests/ritual-copies.test.js`,
   `adapters/claude-code/skills/relai-core/SKILL.md`, `adapters/codex/skills/relai-core/SKILL.md`
   (generator), `adapters/cursor/rules/relai-core.mdc`, `core/templates/SPEC_USTAWIENIA.md`,
   `docs/ARTEFAKTY.md`**: `bezOdsylaczy` (Edit — backslash w wyrażeniach), skrót bez sekcji
   „Czeka na człowieka”, drogowskaz zawsze, usunięta `NAGLOWEK_CZEKA`, raport spraw w hooku
   Codeksa, trzy kopie zdania, `node adapters/codex/generate-skills.js`, trzy wiersze rejestru.
   Test przepisany + dwa nowe (`core/process` → 407).
2. **K-A3 — `docs/DECYZJE.md`, `core/process/session-signals.js`, `core/tools/rotate.js`,
   `core/process/tests/start-cost.test.js`, `core/process/tests/rotate.test.js`,
   `core/templates/SPEC_ARCHIWUM.md`, `core/templates/SPEC_LEKCJE.md`,
   `core/templates/SPEC_USTAWIENIA.md`, `adapters/claude-code/skills/relai-core/document-rotation.md`,
   `adapters/claude-code/skills/relai-core/SKILL.md`, kopie Codeksa (generator),
   `docs/ARTEFAKTY.md`**: wiersz aneksu D-88; ryzyka bez zamkniętych poza linią progów; próg lekcji
   bez „Zasad aktywnych”; linia `rotate.js` dla ryzyk; kopie reguły w specyfikacjach i skillu;
   generator; pięć wierszy rejestru. Test ze zmienionym oczekiwaniem + dwa nowe (→ 409).
3. **K-A4 — `docs/USTAWIENIA.md`**: kontrola przed zmianą (`grep -c` z karty → 1), zdanie o
   rozjeździe daty listy (sekcja „Stan wyjściowy”), jedno pytanie z opcjami z karty, wiersz
   zastąpiony jednym wierszem z datą dnia wykonania; odpowiedź do wpisu dziennika.
4. **Git.** Bez `push`. Jeden commit etapu (`perf:` albo `fix:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Wszystkie komunikaty i komentarze w kodzie tylko ASCII. Kod z backslashem i edycje dokumentów
z backtickiem — narzędziem Write/Edit (nigdy powłoką ani `node -e`). Skilla Codeksa nie edytujesz
ręcznie — tylko generator. Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy
„świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_8.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E7 (albo człowiek rozstrzygnął, co z drzewem).
- [ ] Testy przed zmianą: każda karta z kodem ma zapisany w katalogu roboczym przebieg czerwony
      z właściwego powodu (K-A2: przepisany test i oba nowe czerwone z asercji — skrót niesie
      `SPRAWA-CZEKA` / `suma kontrolna`, Codex milczy; K-A3: zmieniony test i oba nowe czerwone
      z asercji — pozycja ryzyk, pozycja `docs/LEKCJE.md` przy 3,5 KB, brak `zadne ryzyko nie jest
      ZAMKNIETE`).
- [ ] `node --test core/process/tests/start-digest.test.js` → o jeden test więcej niż przed etapem,
      zielone; `ritual-copies.test.js` → o jeden więcej, zielone; `start-cost.test.js`
      i `rotate.test.js` → razem o dwa więcej, zielone; `esm-project.test.js` → zielone bez zmian.
- [ ] `node --test "core/process/tests/*.test.*"` → **409 pass** (albo suma od wpisu E7 plus 4,
      opisana), 0 fail; `adapters/cursor` → 10 pass; `adapters/codex` → 28 pass;
      `core/guardrails` → 33 pass.
- [ ] Dowód negatywny (zasada 3): `git diff --stat adapters/codex/skills/` → wyłącznie
      `relai-core/SKILL.md` i `relai-core/document-rotation.md`; `git diff --stat docs/DECYZJE.md` →
      jedna linia dodana, zero usuniętych, `grep -c "D-88\*\* → aneks" docs/DECYZJE.md` → 1;
      linia 29 (`D-88`) bez zmian; `adapters/cursor/rules/relai-core.mdc` zmienia wyłącznie linię 25
      (`git diff -U0`).
- [ ] Efekt widoczny (zasada 4) na tym repozytorium, kodem z repozytorium:
      `node core/process/start-digest.js` (z `cwd` repozytorium; tylko odczyt) — bajty przed i po
      do wpisu (karta: 26 633 → 19 156 B, SZACUNEK dla dzisiejszego stanu); skrót bez
      `suma kontrolna` i bez sekcji „Czeka na człowieka”, z linią `[odsylacze do archiwum ryzyk
      pominiete:` i drogowskazem `sekcja "Czeka na czlowieka"`; `core.startCostReport(core.startCost(cwd))`
      — linia `[RelAI progi dokumentow]` nie wymienia sekcji ryzyk ani `docs/LEKCJE.md`, a nadal
      wymienia `docs/USTAWIENIA.md` (kontrola pozytywna, zasada 6);
      `node core/tools/rotate.js plan ryzyka --prog 12` → linia `ponad progiem, ale zadne ryzyko
      nie jest ZAMKNIETE …`.
- [ ] K-A4: `grep -c "Model optymalizatora" docs/USTAWIENIA.md` → 1;
      `grep -cF "| Model optymalizatora | <wybór>" docs/USTAWIENIA.md` → 1; dla nazwy z listy
      `grep -c "^[a-z]*: <wybór> |" .claude/relai/MODELE-claude-code.md` → 1; odpowiedź
      człowieka i rozstrzygnięcie daty listy we wpisie dziennika.
- [ ] Rejestr (konwencje, sekcja 5): wiersze `docs/ARTEFAKTY.md` z kart podbite o 1 (Skill
      `relai-core`, Reguła `relai-core` Cursora, Specyfikacja `USTAWIENIA.md`, Specyfikacja
      archiwum, Specyfikacja `LEKCJE.md`, `relai-core` — rotacja dokumentów), każdy z wpisem
      `2026-…(wersja N, plan OPTYMALIZACJA_PO_AUDYCIE E8, K-…)` na początku kolumny.
- [ ] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      `parytet skilli Claude Code -> Codex: … 0 rozjazdow`, `wywolania z hooks.json: 20`.
- [ ] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy, `trivy fs --scanners vuln`) — zero
      nowych CRITICAL i HIGH wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie
      dodaje zależności; po E7: 0 CRITICAL, 42 HIGH, 50 MEDIUM, 12 LOW — zastane fikstury
      ewaluacji `trivy-scan`, nie blokują). Trivy brak → zapis „brak pliku zależności w `adapters/`
      i `core/`” z wynikiem `git ls-files adapters core | grep package.json`.
- [ ] Podstawy na zmianie etapu: wzorzec `ODSYLACZ_SUMA` sprawdzony kontrolą pozytywną na
      prawdziwym bloku z `docs/DZIENNIK.md` (pierwszy blok odsyłacza zawiera `suma kontrolna`)
      i negatywną (blok cytatu bez sumy zostaje); `git grep -nE "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"`
      → 0; `PASSWORD=` w zmienionych testach → 0.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” trzech kart
      i dokumenty rytuału (`STATUS.md`, `PROMPT_ETAP_8.md`, `PROMPT_ETAP_9.md`, `DZIENNIK.md`,
      `STATE.md`, ewentualnie `LEKCJE.md`); pod `adapters/*/skills/relai-planning/` wyłącznie cztery
      zastane `*-closing.md`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów
      (`core/process` 409 albo zgodnie z sumą, opisaną), bajtami skrótu przed i po, odpowiedzią
      K-A4 i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E8/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-*` z testów) wypisane z nazwy razem
      z tym, co się z nimi stało.

Najtwardszy punkt to efekt widoczny na tym repozytorium: linia progów musi zgubić ryzyka
i `LEKCJE.md`, a zachować `docs/USTAWIENIA.md`. Gdy zgubi także ustawienia albo zachowa lekcje —
zatrzymujesz się i opisujesz liczby (bajty pliku, bajty sekcji „Zasady aktywne”, próg), zamiast
stroić próg albo test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E8 → `ZREALIZOWANY <data>`, E9 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E8 rozpoczęty”); link
   w kolumnie `Prompt` przy E9 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E8/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po, bajty skrótu przed i po, linia progów przed i po, wynik Trivy,
   odpowiedź K-A4) / Świadomie odłożone / Do zrobienia przez człowieka; podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę „Stan otwartych ryzyk” (R5 dotyczy wprost
   wagi startu); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1, trzema z E3 i trzema z E6).
4. `docs/STATE.md` — zdanie o stanie planu (E8 zrealizowany: skrót startu bez odsyłaczy archiwum
   i sekcji spraw, sprawy w hooku trzech adapterów, aneks D-88, wiersz modelu optymalizatora;
   liczby testów; E9 gotowy). Liczebników hooków nie zmieniasz — E14. Tabeli „Stan prac”
   w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_9.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E9
   w sekcji 6 `PLAN.html`, z `karty/E09_TRYB_CIAGLY.md` (aneks D-93), z realnego stanu
   repozytorium po tym etapie i z lekcji tego etapu. Liczby po E9 według tabeli narastającej
   konwencji: `core/process` 420–422 (SZACUNEK; wiążąca jest suma od wpisu E8).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
