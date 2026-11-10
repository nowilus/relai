# PROMPT_ETAP_11 — Proces i rejestry: rejestr bez kroniki, wpis po pełnej ścieżce, fakt w przeglądzie spraw, linki przy zamknięciu planu, reguła Cursora wg D-88

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E11 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E10) • Wykonawca: **Codex gpt-6.1-terra (effort high), poprawki gpt-6.1-sol; orkiestracja, `docs/`, testy, rejestr i rytuał — Opus 5.5 w Claude Code** (Aneks A, [ANEKS_A_WYKONANIE_CODEX.md](ANEKS_A_WYKONANIE_CODEX.md)) — `/effort medium` dla sesji Claude

> **Kontrola modelu:** pracę wykonawczą (kod hooka, testy, teksty skilli i reguł) robi model klasy
> **balanced** w Codeksie: **gpt-6.1-terra** (lista modeli codex z dnia `2026-11-10`), uruchamiany
> przez Claude poleceniem `node core/process/crew.js run --runtime codex --role coder --write
> --model gpt-6.1-terra` z repozytorium (nie kopią `.claude/relai/tools/crew.js` — ryzyko AX1).
> Sesja Claude, która czyta ten prompt, musi działać na **Opus 5.5** (orkiestrator); inny model →
> zatrzymaj się i poproś o przełączenie. Zalecany poziom `/effort` sesji Claude: `medium` (karty
> niosą gotowy kod, testy i bloki PRZED → PO; praca to wierna realizacja kart i recenzja).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, tabela ryzyk, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/ANEKS_A_WYKONANIE_CODEX.md` — sekcje 4 i 7 | przepływ etapu w Codeksie, nakładka 4.1, przypadki brzegowe |
| `docs/LEKCJE.md` — wpisy L-0316 i L-0317 | granice Codeksa (`docs/`, testy) i końce linii w pliku zadania — **wiążą przepływ** |
| `docs/LEKCJE.md` — pełne brzmienie zasad 1, 3, 5, 7 i 11 | 1: FAKT i punkt Weryfikacji; 3: dowód negatywny w testach K-E2 i K-E4; 5: wyrażenia z backslashem, parser kolumny, licznik pętli; 7: kod czyta kolumnę „Plik”; 11: końce linii i kształt wiersza tabeli |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie, „kotwica nie pasuje → stop”, komendy testów, sekcje 5–7 |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E11_PROCES_I_REJESTRY.md` — całość | **zakres etapu**: pięć kart (K-E6, K-C7, K-E2, K-E4, K-R11) z kodem, testami i blokami PRZED → PO |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E11 w sekcji 6 (Grep `E11_PROCES` z kontekstem 6 linii) | cel etapu słowami planu |
| `docs/DZIENNIK.md` — ostatni wpis (E10) | punkt wyjścia: liczby testów, przebiegi Codeksa, odłożone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od 2026-11-09 (D-33). Kotwica nie pasuje, test „najpierw” zielony
  przed zmianą bez nazwanego wyjątku, `sprawdz-rejestr.js` zgłasza `BLAD` albo liczba ostrzeżeń
  pętli K-C7 po zmianie różni się od karty → zatrzymujesz się i pytasz; karty nie poprawiasz.
- Kolejność kart: **K-E6 → K-C7 → K-E2 → K-E4 → K-R11**; commit jeden na etap.
- **Wykonanie wg Aneksu A i L-0316 — podział pracy:**
  - **Claude** robi wszystko pod `docs/`: K-E6 kroki 1–6 i 8 (naprawa `|`, kopia w
    `docs/archiwum/artefakty/`, skrócenie skryptem, dowód, kontrola wydania, punkt w „Zasadach
    prowadzenia”), K-C7 krok 3 (komórka „Plik” wiersza `security-audit`) i K-R11. K-E6 robi
    **pierwszą**, przed przebiegiem 1 — karta wymaga rejestru nietkniętego w etapie.
  - **Przebieg 1 Codeksa:** wyłącznie testy z kart, dosłownie — nowy
    `core/process/tests/profile-rules.test.js` (4 przypadki K-C7), przypadek K-E2 dopisany na
    końcu `ritual-texts.test.js`, przypadek K-E4 dopisany na końcu `ritual-copies.test.js` →
    Claude czyta diff testów w całości (AX2) i uruchamia je na czerwono.
  - **Przebieg 2 Codeksa:** K-C7 kroki 1–2 (`profile-rules.js`), K-E2 kroki 1–5, K-E4 krok 3,
    K-E6 krok 7 (`core/templates/SPEC_PROFILE.md`), generator skilli Codeksa — **bez zmiany
    testów** → Claude uruchamia testy na zielono, pętlę K-C7, walidator i resztę Weryfikacji.
  - Plik zadania = ten prompt + nakładka 4.1 aneksu z dopiskami: sandbox Codeksa na Windows nie
    uruchamia `node --test` (`spawn EPERM`) — testów nie uruchamia i to nie jest `STOP`; niczego
    pod `docs/` nie edytuje. Datę aneksu D-88 dla K-E4 (FAKT: `2026-11-10`, `docs/DECYZJE.md`
    l. 116) Claude wpisuje do pliku zadania — Codex jej nie szuka w `docs/`.
  - **Końce linii (L-0317):** przed każdym przebiegiem Claude sprawdza `git ls-files --eol` plików
    z `--files`; `w/crlf` przy `i/lf` → normalizuje do LF **przed** przebiegiem. Plik zadania nie
    każe Codeksowi „zachować CRLF”. FAKT 2026-11-10: wszystkie pliki kart E11 mają `i/lf w/lf`.
  - Effort: `crew.js` przekazuje tylko `-m`; Codex bierze `model_reasoning_effort = "high"`
    z `~/.codex/config.toml` (FAKT 2026-11-10, ustawienie globalne) — terra dostaje `high` zgodnie
    z decyzją Łukasza z 2026-11-10. Przed przebiegiem odczytaj plik jeszcze raz; inna wartość →
    powiedz o tym w karcie startu.
- `--files` przebiegu (granica Codeksa) = pola „Pliki” kart K-C7, K-E2, K-E4 bez `docs/` oraz
  `core/templates/SPEC_PROFILE.md`, kopie Codeksa z kroków generatora i katalog roboczy etapu.
- K-E4 dotyczy tylko reguły Cursora i testu; `docs/DECYZJE.md` i `document-rotation.md` nie
  ruszasz (aneks D-88 należy do E8).
- **D-41 bez zmian**: blokują wyłącznie `secret-scanner` i `config-protection`; `profile-rules.js`
  zostaje ostrzeżeniem. Kontrola `readme-hooki` w `release-check.js` jest **czerwona do K-E9
  w E14** — stan oczekiwany.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, tagów i zmiany numerów wersji aż do
  E14. W sesji działają hooki zainstalowanego pluginu 3.7.0 — zmiana `profile-rules.js` nie zmienia
  zachowania sesji; dowodem są test i pętla po hooku z repozytorium.
- Granica zakresu: pliki z pól „Pliki” pięciu kart. Linia „Sesja nieinteraktywna”, `/relai-help`,
  `SPEC_KOMENDY.md`, hooki poza `profile-rules.js`, `session-signals.js`, `rotate.js`
  (rotacja lekcji — świadomie odłożona w E10), `skroc-rejestr.js` i `sprawdz-rejestr.js`
  (załączniki zamrożone), liczebniki (E14), rotacje dokumentów zgłaszane na starcie — nie ruszasz.

## Stan wyjściowy (co realnie zastajesz po E10)

RelAI 3.7.0; gałąź `optymalizacja/po-audycie` z commitami E1–E9, aneksu A, decyzji o effortcie
i — jeśli człowiek go przyjął — commitem E10 (`git log --oneline -3`; brak commita E10 → zmiany E10
leżą w drzewie, zostawiasz je i pytasz, zanim zaczniesz). E10 zmienił teksty `plan-closing.md`,
`relai-stage.md`, `relai-planning.mdc` i `relai-core.mdc` w akapitach rozłącznych z E11, a kotwice
E11 przetrwały. Kotwice sprawdzone grepem 2026-11-10 po E10 (FAKT; numery linii inne niż w kartach,
obowiązuje tekst):

```
docs/ARTEFAKTY.md                     154 107 B; "„Wiersz | Czyta go”" -> 1 trafienie
  probny przebieg K-E6 na kopii (2026-11-10, scratchpad): skroc-rejestr -> 118 wierszy,
  skroconych 40, 154 108 -> 79 901 B; sprawdz-rejestr -> kluczy 127, linii zmienionych 40, bledow 0
docs/archiwum/artefakty/              NIE ISTNIEJE (zaklada K-E6)
karty/zalaczniki/                     c7-count.js, skroc-rejestr.js, sprawdz-rejestr.js
adapters/claude-code/hooks/profile-rules.js   238 linii; jestArtefaktem() od l. 134;
                                      kotwica K-C7 krok 2 w l. 200-201 (te same dwie linie co w karcie;
                                      "const nazwa = ..." wystepuje tez w l. 120 i 135 - kotwica to PARA)
core/process/tests/profile-rules.test.js     NIE ISTNIEJE (zaklada K-C7)
adapters/claude-code/skills/relai-core/overdue-review.md  "Pytanie nie zamienia się w rozstrzygnięcie
                                      za człowieka" (l. 41), L-0025 w l. 42
adapters/cursor/rules/relai-core.mdc  "On the **third and every later**" (l. 92); "target moves to the
                                      rotatable" (l. 195), "unreachable by definition." (l. 197)
adapters/claude-code/skills/relai-planning/plan-closing.md  lista "[ ] 5 STATUS ... [ ] 9 podsumowanie"
                                      (l. 12); "7. **Archiwum**" (l. 55)
adapters/claude-code/commands/relai-stage.md  "przegląd ryzyk → przeniesienie folderu planu" (l. 208);
                                      "kroki 1–9 stamtąd." (l. 210)
adapters/cursor/rules/relai-planning.mdc      kotwica K-E2 "folder to `docs/archiwum/plany/` → update
                                      the "Aktywny plan" line" (l. 78) - nietknieta przez E10
docs/DECYZJE.md                       "| **D-88** → aneks | 2026-11-10 |" (l. 116)
adapters/claude-code/skills/relai-core/document-rotation.md  "aż cały żywy plik zejdzie poniżej" - 1
security-audit                        git ls-files ... | grep -c "\.md$" -> 17
core/process/tests/ritual-texts.test.js   3 przypadki (E10); ritual-copies.test.js 7 przypadkow
docs/ARTEFAKTY.md (wersje, FAKT 2026-11-10 po E10): overdue-review 2, plan-closing 5, relai-stage 13,
  relai-core.mdc 11, relai-planning.mdc 5, SPEC_PROFILE 3 - 6 wierszy
.claude/launch.json                   nieśledzony, spoza planu - nie dodajesz do commita
```

Testy (konwencje, sekcja 4) uruchamia **Claude**, z katalogu repozytorium, ścieżką względną, bez
`cd`: `node --test "core/process/tests/*.test.*"` ok. 110 s (SZACUNEK) — w tle. Po etapie:
`core/process` **430** (424 + 6: K-C7 +4, K-E2 +1, K-E4 +1), `adapters/cursor` 10, `adapters/codex`
28, `core/guardrails` 33 bez zmian. `validate-adapters.js`: kod 0, jedno ostrzeżenie
(`security-audit/SKILL.md`), `rytual "Na koniec": 3 list, kroki [1,1a,2,3,4,5,6]`,
`wywolania z hooks.json: 20`.

**Czego jeszcze nie ma:** rejestru bez kroniki wersji w komórkach i jego datowanej kopii; reguły
o wpisie bieżącej wersji w `SPEC_PROFILE.md` i w „Zasadach prowadzenia”; dopasowania wpisu
w `profile-rules.js` po pełnej ścieżce i wyłączeń materiału testowego, kopii Codeksa, `AGENTS.md`
i `LICENCJE.md`; faktu z repozytorium w pytaniu o sprawę przeterminowaną; punktu 7a „Linki do
przeniesionych folderów” w zamknięciu planu; celu rotacji wg D-88 w regule Cursora; testów
`profile-rules.test.js`, czwartego przypadku `ritual-texts` i ósmego `ritual-copies`.

**Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 1, 3, 5, 7, 11.
**Ryzyka etapu:** R5 (dokumenty puchną — K-E6 zdejmuje ok. 74 KB z rejestru) — wiersz w tabeli
skrótu startu; AX1–AX3 z Aneksu A, sekcja 6.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E11/`.** Wszystko
> tymczasowe — pliki zadań dla Codeksa, przebiegi czerwone i zielone, wyjścia skryptów (`<TMP>`
> kart) — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog
> domowy, klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę
> zaczynasz od slugu projektu. Przebiegi `crew.js` zapisują się w `.claude/relai/work/CREW/<data_czas>/`
> — liczysz je razem z katalogiem etapu.

1. **K-E6 (Claude, przed przebiegiem 1)** — `docs/ARTEFAKTY.md`: raport kontroli przed, naprawa
   `„Wiersz | Czyta go”` narzędziem Edit, kopia `docs/archiwum/artefakty/ARTEFAKTY_<data>.md`
   (data dnia wykonania), `skroc-rejestr.js` → podmiana, `sprawdz-rejestr.js` → `bledow: 0`,
   kontrola wydania po (obiekt `artefakty` jak przed), punkt w „Zasadach prowadzenia” (krok 8).
2. **Plik zadania i przebieg 1 (Claude → Codex)** — `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E11/zadanie-1.md`
   = nakładka 4.1 z dopiskami + ten prompt. Codex zakłada `core/process/tests/profile-rules.test.js`
   i dopisuje przypadek K-E2 do `ritual-texts.test.js` oraz K-E4 do `ritual-copies.test.js` —
   dosłownie z kart. Claude czyta diff testów w całości i uruchamia na czerwono: K-C7 3 czerwone
   z asercji + 1 zielony (przypadek „bare path and a link target” — nazwany wyjątek karty), K-E2
   i K-E4 czerwone z asercji.
3. **Przebieg 2 (Codex)** — K-C7 kroki 1–2 w `adapters/claude-code/hooks/profile-rules.js`
   (wyrażenia z backslashem edycją pliku); K-E2 kroki 1–5 w `overdue-review.md`,
   `relai-core.mdc`, `plan-closing.md`, `relai-stage.md`, `relai-planning.mdc`; K-E4 krok 3
   w `relai-core.mdc` z datą aneksu `2026-11-10`; K-E6 krok 7 w `core/templates/SPEC_PROFILE.md`;
   `node adapters/codex/generate-skills.js` (kopie: `relai-core/overdue-review.md`,
   `relai-planning/plan-closing.md`, `relai-stage/SKILL.md`).
4. **K-C7 krok 3 (Claude)** — `docs/ARTEFAKTY.md`, komórka „Plik” wiersza
   ``| Skill `security-audit` (kopia Cloudflare) |``: 15 ścieżek z karty + opis sześciu plików bez
   tekstu instrukcji; wersja i data bez zmian; wiersz zostaje jedną linią. Pętla z karty: przed
   (liczba do wpisu), po krokach 1–2 → `14`, po kroku 3 → `0`.
5. **K-R11 (Claude)** — `docs/ARTEFAKTY.md`: 6 wierszy, wersja +1 od wartości z pliku, komórka
   „Co się zmieniło” = **nowy wpis zastępujący** wpis bieżący (kształt z K-E6), odsyłacz „Starsze
   wersje” zostaje na końcu; `relai-core.mdc` jednym wpisem za K-E2 i K-E4.
6. **Git.** Bez `push`. Jeden commit etapu (`refactor:` albo `docs:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Dokumenty z backtickiem — wyłącznie edycją pliku (Edit/Write w Claude, edycja pliku w Codeksie;
nigdy `sed` ani `node -e`). Skilli Codeksa nie edytujesz ręcznie — tylko generator. Wątek spoza kart
→ zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_11.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `git log --oneline -1` pokazuje commit E10 (albo człowiek rozstrzygnął, co z drzewem).
- [x] K-E6: `skroc-rejestr.js` wypisał linię liczb (do wpisu); `sprawdz-rejestr.js` → kluczy jak
      w przebiegu kopii z samą sobą, linii zmienionych = skróconych, `bledow: 0`; obiekt `artefakty`
      w raporcie przed i po identyczny (`licznik`, `bledy`); `wc -c docs/ARTEFAKTY.md` ≤ 85 000;
      Grep `count`: `Starsze wersje: .ARTEFAKTY_` → liczba skróconych, `Wiersz .. Czyta go`
      w rejestrze → 0, w kopii archiwum → 1; `node --test core/process/tests/release-check.test.js`
      → zielony.
- [x] Testy przed zmianą (przebieg zapisany w katalogu roboczym, diff testów przeczytany w całości
      i zgodny z kartami): `profile-rules.test.js` → 3 fail z asercji + 1 pass (nazwany wyjątek);
      `ritual-texts.test.js` → 3 pass + 1 fail z asercji; `ritual-copies.test.js` → 7 pass + 1 fail
      z asercji.
- [x] Po zmianie: `profile-rules.test.js` → 4 pass; `ritual-texts.test.js` → 4 pass;
      `ritual-copies.test.js` → 8 pass.
- [x] `node --test "core/process/tests/*.test.*"` → **430 pass** (albo suma od wpisu E10 plus 6,
      opisana), 0 fail; `adapters/cursor` → 10; `adapters/codex` → 28; `core/guardrails` → 33.
- [x] Pętla K-C7 (polecenie z karty, Git Bash): przed — liczba do wpisu; po krokach 1–2 → `14`; po
      kroku 3 → `0`. Inna liczba → ścieżki przez `grep -o 'artefakt [^ ]*'` i pytanie do człowieka.
- [x] Greps z kart: `grep -c "Pytanie nie zamienia się w rozstrzygnięcie za człowieka"
      adapters/claude-code/skills/relai-core/overdue-review.md` → 1 (akapit chroniony);
      `grep -c "target moves to the rotatable" adapters/cursor/rules/relai-core.mdc` → 0;
      `git ls-files adapters/claude-code/skills/security-audit/ | grep -c "\.md$"` → 17.
- [x] Dowód negatywny (zasada 3): `git diff --stat CLAUDE.md AGENTS.md docs/DECYZJE.md
      adapters/claude-code/skills/relai-core/document-rotation.md core/process/session-signals.js
      core/tools/rotate.js docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/zalaczniki` → pusty.
- [x] `node adapters/codex/generate-skills.js --verify` → kod 0; `node core/tools/validate-adapters.js`
      → kod 0, jedno ostrzeżenie, `rytual "Na koniec": 3 list, kroki [1,1a,2,3,4,5,6]`,
      `parytet … 0 rozjazdow`, `wywolania z hooks.json: 20`.
- [x] Rejestr (K-R11): `node core/tools/release-check.js --json --tylko artefakty` → `"bledy":[]`
      we wszystkich sekcjach; licznik `plikow rejestru` większy o 14 niż po K-E6.
- [x] Bezpieczeństwo (etap zmienia hook czytający wejście JSON): `trivy fs --scanners vuln .` →
      0 nowych CRITICAL i HIGH wobec wpisu E9 (zastane: 0 CRITICAL, 42 HIGH); etap nie dodaje
      zależności. Zapas bez Trivy: korzeń repo nie ma `package.json` (FAKT 2026-11-10; pięć
      śledzonych `package.json` leży w modach i fiksturach) → `npm audit --omit=dev` w katalogu
      każdego z nich, z wynikiem do wpisu. Hook nie dokłada zapisu ani sieci: `git diff
      adapters/claude-code/hooks/profile-rules.js | grep -cE "writeFile|https?\.request|fetch\("` → 0.
- [x] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” pięciu
      kart, `SPEC_PROFILE.md`, kopie Codeksa, nowy plik archiwum i dokumenty rytuału (`STATUS.md`,
      `PROMPT_ETAP_11.md`, `PROMPT_ETAP_12.md`, `DZIENNIK.md`, `STATE.md`, ewentualnie `LEKCJE.md`).
- [x] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbami testów, liczbą
      przebiegów Codeksa (cel aneksu: 2, poprawek 0), linią skryptu skracającego, liczbami pętli
      K-C7 i podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E11/` i przebiegi
      `.claude/relai/work/CREW/` tego etapu przejrzane (`node .claude/relai/tools/clean-work.js
      raport`; katalog otwartego etapu raport pomija — wtedy liczby z `find`/`du`) i skasowane po
      „tak”, liczby przed i po we wpisie dziennika; (b) artefakty spoza katalogu wypisane z nazwy
      razem z tym, co się z nimi stało (fikstury `%TEMP%/relai-profile-rules-*` po testach).

Najtwardszy punkt to dowód K-E6: `sprawdz-rejestr.js` musi dać `bledow: 0`, a obiekt `artefakty`
przed i po — identyczny. Rozjazd albo `liczba komorek 9 -> 8` → zatrzymujesz się, przywracasz
`docs/ARTEFAKTY.md` z HEAD i pokazujesz wyjście skryptu, zamiast poprawiać skrypt czy rejestr ręcznie.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E11 → `ZREALIZOWANY <data>`, E12 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E11 rozpoczęty”); link
   w kolumnie `Prompt` przy E12 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E11/` i przebiegi `CREW` etapu —
   raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (testy przed i po, linia skryptu i dowód K-E6, pętla K-C7, rejestr) / Świadomie odłożone /
   Do zrobienia przez człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę
   „Stan otwartych ryzyk” (R5 po K-E6); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka”
   tego wpisu dostaje linię `OTWARTA`.
4. `docs/STATE.md` — zdanie o stanie planu (E11 zrealizowany; liczby testów; rejestr ok. 80 KB;
   E12 gotowy). Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_12.md`** wg `SPEC_PROMPT_ETAPU.md` i `stage-prompts.md` — z wiersza E12
   w sekcji 6 `PLAN.html`, z `karty/E12_MODY_ODPORNOSC.md`, z realnego stanu repozytorium po tym
   etapie, z Aneksu A (sekcja 7: testy modów `claude plugin test` uruchamia Claude) i z lekcji tego
   etapu; numery zasad do doczytania, bez odpisu.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
