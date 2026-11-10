# PROMPT_ETAP_14 — Workflow testów w CI, liczebniki z dysku, scalenie, jedno wydanie i zamknięcie planu

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E14 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E13) • Wykonawca: **Opus 5.5 na effort medium, świeża sesja** (linia metryczna `STATUS.md`; Aneks A, sekcja 7: „E14 — bez zmian, wykonuje Claude (Opus 5.5), wydanie krok po kroku za zgodą” — bez Codeksa) — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli claude-code z dnia `2026-11-10`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `medium` (karty niosą gotowy YAML, kotwice i polecenia; ryzyko etapu leży w krokach
> zewnętrznych, które i tak idą po osobnym „tak” człowieka, nie w trudności rozumowania).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, tabela ryzyk, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E14_CI_I_WYDANIE.md` — całość | **zakres etapu**: K-G3 → K-E9 → K-W1 → K-W2 → K-W3 → K-W4, z kotwicami, YAML-em, poleceniami i weryfikacją każdej karty |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — sekcje 2, 3, 4, 6, 7 | kolejność pracy na karcie, gałąź i commity, komendy testów i liczby narastające, rzeczy zaskakujące, granice |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — sekcja „Bramki manualne” | osiem pozycji `OTWARTA` — wszystkie musi rozstrzygnąć człowiek przed zamknięciem planu (K-W4, krok 1 `plan-closing.md`) |
| `docs/LEKCJE.md` — wpisy L-0297, L-0308; pełne brzmienie zasad 2, 4, 5, 10, 11, 13, 14 | L-0297: końce linii przed diffem; L-0308: raport `--json` w jednym przebiegu; zasady — patrz niżej „Zasady do doczytania” |
| `.claude/commands/relai-release.md` — całość, **dopiero przy K-W3** | sekwencja wydania; karta K-W3 niczego w niej nie zastępuje |
| skill `relai-planning` → `plan-closing.md`, **dopiero przy K-W4** | dziewięć kroków zamknięcia planu z punktem 7a (przepięcie linków) |
| `docs/PULAPKI.md` — punkty P-005, P-059, P-062 | sekwencja wydania pluginu zainstalowanego na stałe, wiersz `installPath`, aktualizacja z `--scope user` |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E14 w sekcji 6 (Grep `E14_CI` z kontekstem 6 linii) i sekcja z celami planu do rozliczenia | cel etapu słowami planu; liczby do wpisu zamykającego |
| `docs/DZIENNIK.md` — wpisy E12 i E13 (dwa ostatnie) | liczby testów po E13, listy modów do podbicia, odłożone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od 2026-11-09 (D-33). Kotwica nie pasuje, test czerwony w K-W1,
  `release-check.js` z kodem 2, konflikt przy scaleniu, pierwszy przebieg workflow czerwony albo
  brak którejś z osobnych zgód sekwencji wydania → zatrzymujesz się i pytasz; karty nie poprawiasz.
- **Wykonawca E14:** Opus 5.5 w Claude Code, bez Codeksa (Aneks A, sekcja 7). Świeże sesje
  `claude -p` wyłącznie te, które uruchamia `release-verify.js --sesja` w K-W3 (konwencje, sekcja 7).
- **K-G3:** workflow `.github/workflows/testy.yml` na `windows-latest`, Node 24, pięć zestawów
  `node --test` i `validate-adapters.js`, `paths-ignore` dla `site/**` i `docs/**`, **bez testów
  modów** (wymagają binarki Claude Code); przypięcia akcji przepisane z `strona.yml`.
- **K-E9 i aneks D-40** (zgoda Łukasza 2026-11-09): liczebniki z dysku, jeden wiersz „D-40 → aneks”
  bez liczby w regule; `docs/STATE.md` „czternasty hook” w zdaniu o planie ZGLOSZENIA zostaje bez
  zmian (opis historyczny). `docs/ARTEFAKTY.md` i `docs/archiwum/` — nie ruszasz.
- **K-W2:** scalenie `git merge --no-ff` z komunikatem `merge: plan OPTYMALIZACJA_PO_AUDYCIE`, bez
  `--force`, `rebase`, `squash`; gałęzi `codex/panel-codex` nie dotykasz; push po „tak”.
- **K-W3:** numery wersji proponuje raport `release-check.js`, nie Ty; spodziewane podbicie `relai`
  minor (SZACUNEK). Każdy krok zewnętrzny (tag, push, wydanie GitHub) ma osobną zgodę. Kontroli
  w `release-checks.js` nie zmieniasz.
- **K-F4 i K-F5** rozstrzygnięte w E13 (dziennik): `cache-timer.mjs` zostaje do decyzji
  o PANEL_CODEX, podział `register.tsx` poza planem. Podział `headings.mjs` — świadomie odłożony.
- **Wariant dystrybucji G1:** plan tylko mierzy (konwencje, sekcja 7) — wdrożenie wariantu jest poza
  planem niezależnie od rozstrzygnięcia bramki.
- **Granica:** to ostatni etap — po K-W4 plan jest zamknięty, nie ma `PROMPT_ETAP_15`. Wszystko spoza
  kart E14 (np. `mods/tsconfig.json` w `.gitignore`, rotacja `DZIENNIK.md` i `LEKCJE.md`, migracja
  projektów sprzed KONTEKST_STARTU) → odnoga, nowy plan albo „świadomie odłożone”, nigdy „przy
  okazji”.

## Stan wyjściowy (co realnie zastajesz po E13)

RelAI 3.7.0 zainstalowany na maszynie (`relai`, `relai-panel`, `relai-cache-keeper` na poziomie
użytkownika); w sesji działają hooki i mody wydane, nie kod z gałęzi. Gałąź `optymalizacja/po-audycie`
ma commity E1–E12 i — jeśli człowiek go przyjął — commit E13 (`git log --oneline -3`; brak commita
E13 → zmiany E13 leżą w drzewie, zostawiasz je i pytasz). FAKT 2026-11-10 przed commitem E13:
`git rev-list --count main..HEAD` → **15**, `main` stoi na `5aeab39` (merge PR #5); nieśledzony
`.claude/launch.json` nie należy do planu.

Kotwice sprawdzone 2026-11-10 po E13 (FAKT; numery linii orientacyjne — obowiązuje tekst):

```
dysk:  adapters/claude-code/hooks/*.js        -> 15 plikow
       adapters/claude-code/commands/*.md     -> 16 plikow
       BUNDLED_SKILL_NAMES.length             -> 4
.github/workflows/         -> tylko strona.yml (testy.yml jeszcze nie ma)
  strona.yml l. 26  uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  strona.yml l. 31  uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
docs/PRZEWODNIK.md  l. 120  Trzynaście hooków w Node.js, zero zależności npm. **Dwa blokują, siedem ostrzega, cztery pracują cicho.**
                    l. 246  rejestracja trzynastu hooków (zdarzenia i matchery)
                    l. 247  czternaście hooków Node.js, zero zależności npm
                    l. 257  wygenerowany pakiet: 16 procedur + 2 skille rdzenia (od 2.1.1)
docs/INSTALACJA.md  l. 103-104  szesnaście komend … dwa skille
docs/PRZENOSNOSC.md l. 79   Instalator kopiuje dziesięć plików komend i dwa skille
                    l. 220  ### 3.2 Dziesięć komend
docs/STATE.md       l. 12   czternastoma hookami w Claude Code (czternasty: `session-title`)
                    l. 108  (czternasty hook; …)   <- zostaje (ZGLOSZENIA, opis historyczny)
                    l. 285  16 komend, 4 agenci, 14 hooków, lista modeli   (karta: l. 227 - przesuniete)
README.md           l. 194  ma ich czternaście; Cursor i Codex po części.
panel/hooks/register.tsx l. 4, panel/.claude-plugin/plugin.json l. 8,
.claude-plugin/marketplace.json l. 35  -> "15 RelAI commands" (dysk: 16)
docs/DECYZJE.md     wierszy "D-40 → aneks": 2 (2026-09-24 i 2026-10-24) -> po K-E9: 3
wersje: relai 3.7.0 · relai-panel 0.22.1 · relai-progress 0.7.1 · relai-mods 0.3.0 · relai-cache-keeper 0.13.0
CLAUDE.md l. 42, AGENTS.md l. 45 -> "Aktywny plan: [OPTYMALIZACJA_PO_AUDYCIE](docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md) …"
```

Testy po E13 (FAKT, wpis dziennika E13): `core/guardrails` **33**, `core/process` **430**,
`core/panel` **227**, `adapters/codex` **28**, `adapters/cursor` **10**; mody `mods` **91**,
`panel` **217**, `progress` **51**, `cache-keeper` **206**; `sync-panel-core.js --check` kod 0;
kopie rdzenia 16 / 13 / 8 / 2 pliki, 1 458 334 B. Kontrola `readme-hooki` w `release-check.js`
czerwona od E5 — oczekiwane do K-E9 (konwencje, sekcja 4).

**Do podbicia w K-W3** (pola „Gotowe, gdy” z wpisów E12 i E13 i z karty K-E9): `relai-panel`
(K-F2, K-G2, K-E9), `relai-progress` (K-F3, K-G2), `relai-mods` (K-F3, K-F1, K-G2),
`relai-cache-keeper` (K-G2) oraz plugin `relai` (E3–E11, K-G2, K-G3/K-E9). Raport nie proponuje
któregoś z nich → zatrzymujesz się i pytasz.

**Bramki manualne `OTWARTA` w `STATUS.md` (8):** wybór wariantu G1; K-D2 (`core.hooksPath`); K-D1
(lista rdzeni `_KEY`); K-D4 (luki i fałszywe blokady skanera); K-D7 (`BASH_ZAPISU`); K-D7 (Cursor bez
`-f`); K-D6 (`%` w ścieżce); przepisanie wstecz `PANEL_CODEX/PROMPT_ETAP_1.md`. Rozstrzyga je
człowiek w K-W4 przed słowem „zrealizowany” — zadajesz pytania partiami po cztery, każda opcja
odwołująca się do wariantu cytuje jego definicję (zasada 14).

**Czego jeszcze nie ma:** `.github/workflows/testy.yml`; liczebników zgodnych z dyskiem w siedmiu
plikach i trzecim aneksie D-40; scalenia z `main`; tagu, wydania i nowych wersji pluginu i czterech
modów; rozstrzygnięć ośmiu bramek; wpisu zamykającego plan, przeniesienia folderu do
`docs/archiwum/plany/` i linii `Aktywny plan: brak` w `CLAUDE.md` i `AGENTS.md`.

**Znane pułapki:**
- `release-check.js` z kodem 1 to „są czerwone kontrole”, nie awaria — JSON jest w tym samym wyniku;
  wynik ponad limit czytasz filtrem w tym samym poleceniu (L-0308).
- Wersję pluginu potwierdza plik instalacji, nie komunikat CLI (zasada 10); aktualizacja na tej
  maszynie z `--scope user` (P-062).
- Liczebniki: wzorce z karty K-E9 uruchamiasz narzędziem Grep, nie przez powłokę; dokumenty
  z backtickiem zmieniasz wyłącznie Edit (L-0198, L-0207).
- Pierwszy przebieg nowego workflow bywa czerwony z powodu runnera — pokaż log
  (`gh run view --log-failed`), nie naprawiaj testów pod CI bez pytania.
- Przeniesienie folderu planu zrywa linki względne — punkt 7a `plan-closing.md`.

**Zasady do doczytania z `docs/LEKCJE.md` (pełne brzmienie):** 2, 4, 5, 10, 11, 13, 14.
**Ryzyka etapu:** C1 (API modów przy wydaniu modów), K3, M6 (flagi cudzych CLI — `gh`, `claude
plugin`); po zamknięciu planu aktualizacja O4, R5 i P1 wg K-W4 punkt 3.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E14/`.** Wszystko
> tymczasowe — wyjścia testów, raport `release-check.js --json`, wyjścia `release-verify.js`, logi
> `gh run view` — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`,
> katalog domowy, klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę
> zaczynasz od slugu projektu.

1. **K-0** — `git branch --show-current` → `optymalizacja/po-audycie`; `git log --oneline -1` →
   commit E13; `git status --short` → poza `.claude/launch.json` czysto.
2. **K-G3** — nowy `.github/workflows/testy.yml` z karty (przypięcia z `strona.yml`); Grep
   tabulacji → 0; sześć poleceń `run` lokalnie, każde kod 0.
3. **K-E9** — liczby z dysku (krok 1 karty, podział hooków na blokujące / ostrzegające / ciche z kodu;
   niejednoznaczny hook → pytasz), poprawki w `docs/PRZEWODNIK.md`, `docs/INSTALACJA.md`,
   `docs/PRZENOSNOSC.md` (nagłówek `### 3.2 Komendy` i przepięcie ewentualnych linków do kotwicy),
   `docs/STATE.md` (l. 12 i l. 285; l. 108 bez zmian), `README.md`, `panel/hooks/register.tsx`,
   `panel/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (opisy identyczne), wiersz
   aneksu D-40 w `docs/DECYZJE.md`.
4. **Commit przedscaleniowy** — propozycja jednego commita K-G3 + K-E9 (`ci:` albo `docs:`
   conventional po angielsku) po „tak” człowieka.
5. **K-W1** — jedenaście poleceń z karty; liczby nie niższe niż w „Stanie wyjściowym”.
6. **K-W2** — pytanie o scalenie i push (treść z karty), po „Tak” scalenie i `git push origin main`;
   workflow `testy.yml` do `completed success`.
7. **K-W3** — `/relai-release` krok po kroku (komenda `.claude/commands/relai-release.md`), podbicia
   z listy „Do podbicia”, `release-verify.js --sesja` dla `relai` i każdego wydanego modu,
   `claude plugin update <id> --scope user` dla każdego. Rejestr `docs/ARTEFAKTY.md`, `history.md`,
   `README.md`, `docs/KOMENDY.md` — tak, jak prowadzi komenda wydania.
8. **K-W4** — zamknięcie planu wg `plan-closing.md` (kroki 1–9 z 7a): bramki i odnogi najpierw,
   rozliczenie liczbami (testy przed 629 + 559 i po; skrót startu przed 26 633 B i po; odczyty plików
   testowych na starcie przed 4 324 i po; znaleziska zamknięte / odłożone / niepotwierdzone), ryzyka
   O4, R5, P1 z numerem karty, znaleziska niskiej wagi jednym zdaniem w „Świadomie odłożone”,
   przeniesienie folderu, `Aktywny plan: brak` w `CLAUDE.md` i `AGENTS.md`, skasowanie lokalnej
   gałęzi po zgodzie.
9. **Git.** Bez `--force`; tagi i push tylko w krokach sekwencji wydania i scalenia, każdy po
   osobnym „tak”. Commit zamknięcia planu — propozycja w podsumowaniu.

Wyrażenia regularne i ścieżki z backslashem — wyłącznie narzędziem Edit/Write albo Grep, nigdy `sed`
ani `node -e`. Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_14.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0: gałąź `optymalizacja/po-audycie`, ostatni commit to E13 (albo człowiek rozstrzygnął,
      co z drzewem).
- [ ] K-G3: `.github/workflows/testy.yml` istnieje, przypięcia `checkout` i `setup-node` identyczne
      jak w `strona.yml`; Grep `\t` (tryb `count`) → 0; sześć poleceń `run` lokalnie → kod 0.
- [ ] K-E9 (Grep, nie powłoka): `trzynast|dziesięć plików komend|Dziesięć komend|dwa skille`
      (bez wielkości liter) w `PRZEWODNIK.md`, `INSTALACJA.md`, `PRZENOSNOSC.md` → 0;
      `15 RelAI commands` w trzech plikach panelu → 0; `ma ich czternaście` w `README.md` → 0;
      `14 hooków|czternastoma hookami` w `docs/STATE.md` → 0; `D-40.. → aneks` w `DECYZJE.md` →
      `3`; dowód negatywny (zasada 3): zdanie `czternasty hook` o planie ZGLOSZENIA w `STATE.md`
      nadal stoi, `docs/ARTEFAKTY.md` i `docs/archiwum/` bez zmian w `git diff --stat`.
- [ ] `node core/tools/release-check.js --json` → kontrola `readme-hooki` zielona;
      `node core/tools/validate-adapters.js` → kod 0.
- [ ] K-W1: jedenaście poleceń kod 0, zero `fail`; liczby nie niższe niż guardrails 33, process 430,
      panel 227, codex 28, cursor 10, mody 91 / 217 / 51 / 206 (do wpisu).
- [ ] K-W2 (po „Tak” człowieka): `git log --oneline -1` na `main` → commit scalający
      `merge: plan OPTYMALIZACJA_PO_AUDYCIE`; `gh run list --workflow testy.yml --limit 1` →
      `completed success`.
- [ ] K-W3: nowy tag w `git tag --list "v*"` i na `origin`; `gh release view <tag>` zwraca wydanie;
      `release-verify.js --sesja` kod 0 dla `relai` i każdego wydanego modu (pięć pozycji z listy
      „Do podbicia”, chyba że człowiek rozstrzygnął inaczej); wersje potwierdzone plikiem instalacji
      po `claude plugin update … --scope user` (zasada 10).
- [ ] Bezpieczeństwo: `trivy fs --scanners vuln .` → 0 nowych CRITICAL i HIGH wobec wpisu E13
      (zastane: 0 CRITICAL, 42 HIGH); etap nie dodaje zależności (`git diff --stat main~1 --
      "*package.json" "*lock*"` po scaleniu → bez zmian z E14). Zapas bez Trivy: `npm audit
      --omit=dev` w katalogu każdego śledzonego `package.json`. Workflow ma `permissions:
      contents: read` i akcje przypięte skrótem commita.
- [ ] K-W4 — blokujące: każda z ośmiu bramek `OTWARTA` w `STATUS.md` ma status `ROZSTRZYGNIĘTA
      <data> — <jak>` z odpowiedzi człowieka; otwarte odnogi rozstrzygnięte (`OPIS_REPO` dotyczy
      planu? — sprawdzasz, nie zakładasz).
- [ ] K-W4 — zamknięcie: `grep -n "^Aktywny plan" CLAUDE.md AGENTS.md` → w obu `Aktywny plan: brak`
      z odsyłaczem do `docs/archiwum/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md`;
      `ls docs/plany/OPTYMALIZACJA_PO_AUDYCIE` → brak katalogu; `node .claude/relai/tools/start-digest.js`
      kod 0 i sekcja „Aktywny plan” mówi o braku planu; linki w `docs/STATE.md` i w sekcji „Czeka na
      człowieka” prowadzą do istniejących plików (punkt 7a).
- [ ] Wpis zamykający jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`: dowiezione wobec planu
      liczbami (testy, skrót startu, odczyty plików testowych, znaleziska), wynik K-W1–K-W3,
      rozstrzygnięcia bramek, ryzyka O4/R5/P1 z numerami kart, znaleziska niskiej wagi jednym
      zdaniem, podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E14/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija — wtedy
      liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie; (b) artefakty spoza
      katalogu wypisane z nazwy razem z tym, co się z nimi stało (np. katalogi sesji
      `release-verify.js --sesja`, jeśli narzędzie zostawia je poza projektem).

Najtwardsze punkty to K-W2 i K-W3: zależą od cudzych usług (GitHub Actions, wydanie, instalacja
pluginu) i od osobnych zgód człowieka. Czerwony workflow albo `release-verify.js` z kodem różnym od
0 → zatrzymujesz się, pokazujesz log i pytasz; nie naprawiasz na ślepo i nie zamykasz planu, dopóki
wydanie nie jest potwierdzone.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E14 → `ZREALIZOWANY <data>`, jedna linia
   w dzienniku wdrożenia (zastępuje linię „E14 rozpoczęty”); etapu N+1 nie ma.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E14/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przy ostatnim etapie to jest **jeden** wpis — zamykający plan (E10, K-E7). Przejrzyj tabelę
   „Stan otwartych ryzyk”; lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — wszystkie rozstrzygnięte przed zamknięciem (K-W4); nowa pozycja
   „Do zrobienia przez człowieka” bez rozstrzygnięcia blokuje zamknięcie.
4. `docs/STATE.md` — stan po wydaniu i zamknięciu planu (wersje, plan zamknięty, następny kandydat
   z „Co dalej”). Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz poza tym, co każe `plan-closing.md`.
5. **Ostatni etap planu — zamiast `PROMPT_ETAP_15.md` uruchom sekwencję zamknięcia planu (D-36)**
   z wczytanego skilla `relai-planning`, plik `plan-closing.md`, kroki 1–9 z punktem 7a — to jest
   karta K-W4.
6. Commit — propozycja, conventional, po angielsku; bez `--force`.
