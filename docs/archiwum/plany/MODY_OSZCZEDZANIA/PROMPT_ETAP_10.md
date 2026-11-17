# PROMPT_ETAP_10 — migracja, pomiar całego pakietu i jedno wydanie

Plan: MODY_OSZCZEDZANIA • Etap: **E10 z E10** • Wygenerowano: 2026-11-13 (autor: gpt-6.1-sol w Codeksie, w rytuale „Na koniec” E9) • Wykonawca: **gpt-6.1-terra w Codeksie, poprawki i przegląd gpt-6.1-sol, Claude tylko bramka** (Aneks C) • effort `high`

> **Kontrola modelu:** klasa balanced, gpt-6.1-terra (lista codex z 2026-11-10), effort `high`.
> Nakładka Claude potwierdza wykonawcę (L-0332); etap o szerokim zakresie dziel na zadania,
> nie powtarzaj niepełnych przebiegów Terra (L-0336). Start dopiero po dodatniej bramce E9.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wynik `node .claude/relai/tools/start-digest.js`, `CLAUDE.md` z kontekstu | aktualny stan i indeks zasad |
| `STATUS.md`, `ANEKS_C_WYKONANIE_CODEX.md`, `ANEKS_D_ROUTER_RESEARCH.md` | bramka E9, podział Codex/Claude/człowiek, zamknięty wyjątek routera |
| `PLAN.html` §6 E10, §7–9; `SPECYFIKACJA_FUNKCJI.md` §1–7; Aneksy A–B | pełna macierz zachowań, ryzyka, dwie decyzje przed wydaniem |
| `RAPORT_E9.md`; ostatni wpis E9 w `docs/DZIENNIK.md`; `docs/PULAPKI.md` P-063, P-069–P-071 | dowody offline i ograniczenia silnika/sandboxu |
| `POMIAR_E4.md`, `POMIAR_E5.md`, `POMIAR_E6.md`, `SONDY.md` §4 | zaległe kliknięcie karty, ponowna załoga, ograniczenie effort |
| `README.md` — mody, `docs/KOMENDY.md` — mody, `docs/PRZEWODNIK.md` — obsługa modów; README pięciu nowych modów | dokumentacja użytkownika do uzupełnienia, bez twierdzeń niezmierzonych |
| `core/panel/savings-view.mjs`, `core/panel/savings-ledger.mjs`, ich testy; `model-router/hooks/register.tsx`, `core/panel/pricing.mjs` | bilans kosztu helperów i odłożona wycena różnicy modeli |
| `cache-keeper/hooks/config.ts`, `register.tsx`, `config.test.ts`, `config-contract.test.mjs`; `input-router/hooks/register.test.ts` | migracja wariantu A, komendy z prefiksem, progi układu |
| `core/tools/release-map.json`, `sync-panel-core.js`, `.claude-plugin/marketplace.json`, `.claude/commands/relai-release.md` | rejestracja, kopie, wydanie wyłącznie przez Claude |
| `docs/LEKCJE.md` pełne zasady 1–5, 7, 10, 11, 13–15 i L-0289, L-0300, L-0330–L-0337; `docs/zasoby/PANEL_RELAI/DESIGN.md` §4, §7, §12 | test przed kodem, przegląd przed pomiarem, dane i props w każdej szerokości |

## Decyzje już podjęte — nie otwierasz ich ponownie

- D-33: plan zamrożony, zmiana zakresu tylko aneksem. Clean room: nie czytaj kodu BenAI.
- Aneks C: Codex pisze kod/testy i dokumenty; Claude prowadzi bramkę i pomiary na żywo,
  instaluje kopie pomiarowe, przełącza bliźniaki za zgodą Łukasza i prowadzi wydanie.
  Codex nie instaluje, nie przełącza, nie kasuje, nie commituje ani nie publikuje.
- E4: kliknięcia karty przeniesione do E10 decyzją Łukasza. E6: ponowny pomiar po przeglądzie.
  E7–E9: sonda i pomiar na żywo przeniesione do E10. Test nie jest pomiarem.
- AC1: najpierw dowód, że silnik faktycznie stosuje effort. Sam payload `turn.step` pokazuje
  wartość sprzed nadpisania; brak efektu → aneks z trybem sugestii, nie deklaracja sukcesu.
- Aneks D: router przepuszcza tylko spawny Research bez jawnego modelu; fork, resume,
  inne mody i model jawny nadal chronione.
- D-92: globalnie false, projektowo true tylko dla zainstalowanych elementów zestawu.
  Kokpit `relai-mods` pozostaje globalny; lokalne false jest świadomą odmową.
- Wariant A Cache Keepera (Łukasz, 2026-11-13): migracja zachowuje stare wartości magazynu,
  późniejsza jawna zmiana `/config` wygrywa. Aliasów nie usuwa się podczas migracji.
- Pomiar oszczędności: bez mnożnika przyszłych odczytów cache; koszt wszystkich helperów
  odejmowany, brak usage nie daje deklarowanego zysku. Effort jest zdarzeniem bez tokenów.
- Jedno wydanie całego planu, dopiero po pomiarze. Pięć nowych modów nadal 0.1.0.
  G1/dystrybucja, PANEL_CODEX, hand-back Browsera oraz obce projekty poza zakresem E10.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.8.0 wydany; dziewięć modów w repo, pięć oszczędzających niewydanych w wersji 0.1.0.
W chwili generowania E9 ma kod i dokumenty do bramki, ale status W TOKU: pełne zestawy Node
blokuje sandbox. Sprawdź późniejszą decyzję Claude w STATUS, nie traktuj tego opisu jako zgody.

- `browser/`, `input-router/`, `model-router/`, `effort/`, `research/` — runtime, komendy i testy.
- `core/panel/headings.mjs` — zgodny eksportami barrel; zasoby rozdzielone przez generator
  na `heading-art`, `headings-progress`, `headings-mods`, `numerals`, `labels`.
- `cache-keeper/` — userConfig, migracja z checkpointami, komendy `/relai-cache-keeper`,
  `/relai-cache-keeper-keepwarm`, `/relai-cache-keeper-handoff`; stare aliasy zachowane.
- `core/process/plugin-scope.js`, `mods/hooks/cockpit.ts` — rdzeń + osiem modów w zestawie;
  dziewiąty mod, kokpit, globalny. Prawdziwa instalacja w E9 nieprzełączana.
- `.claude/relai/work/MODY_OSZCZEDZANIA/E9/` — raporty, instrumenty, stare warianty i cztery
  reproduktory wyglądu `baseline-*` odtworzone z HEAD. Claude rozstrzyga ich zachowanie przed
  skasowaniem katalogu; jeśli skasowany, wyniki i ścieżki są w RAPORT_E9 i dzienniku.

**Czego jeszcze nie ma:** całościowego pomiaru E7–E9 i ponownego E6, kliknięć E4, bilansu na żywo,
docelowej migracji z BenAI, finalnej dokumentacji użytkownika i jedynego wydania planu.
Wycena różnicy modeli w zakładce nadal do rozstrzygnięcia kodem i pomiarem E10.

**Zasady do doczytania:** 1, 2, 3, 4, 5, 7, 10, 11, 13, 14, 15.
**Ryzyka:** R1–R11 z planu, AC1, AC3–AC5 z Aneksu C. Trivy baza E9: 0 CRITICAL / 42 HIGH
(fixtury), 62 MEDIUM / 14 LOW; nie mylić z produkcyjnym zakresem bez fixtur.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/MODY_OSZCZEDZANIA/E10/`.** Wszystkie instrumenty,
materiał i wyjścia tam; nie kasuj cudzych katalogów. Zewnętrzne artefakty wpisuj z nazwą i ścieżką.

1. **Codex — część kodowa i dokumenty:** testem odtwórz brak wyceny routera w
   `core/panel/savings-view.mjs`, uzupełnij bilans zgodnie ze specyfikacją i rekordami producenta,
   bez podwójnego liczenia sędziego. Jeżeli stan po bramce już to naprawił, pokaż dowód,
   nie przebudowuj. Kopie wyłącznie przez `sync-panel-core.js`.
2. **Codex:** uzupełnij `README.md`, `docs/KOMENDY.md`, `docs/PRZEWODNIK.md`, README pięciu modów
   i właściwe wiersze `release-map.json`. Rozróżnij rzeczy potwierdzone testem i żywym pomiarem.
   Nie publikuj domysłów jako faktów. Dwie decyzje biznesowe z PLAN §9 (wzmianka o inspiracji
   i status early access) rozstrzyga Łukasz przed zależną redakcją.
3. **Claude po przeglądzie Sol i bramce kodu:** macierz `POMIAR_E10.md` w folderze planu,
   wiersz po wierszu specyfikacji. Najpierw Effort/AC1; potem Browser shrink/describe/full,
   Input pliki/PDF/konektory/full/pamięć/zgoda/sekrety, Router jawny/domyślny/załoga,
   Research auto/quick/deep/awarie/przypisy. Research: identyfikacja agentów przed ich narzędziami,
   skaner przed wynikiem, routing bez jawnego modelu i zachowanie limitów transportu.
4. **Claude + Łukasz:** kopia plików konfiguracji przed zapisem; zgoda na przełączenia BenAI
   i instalacji pomiarowej, `/reload-plugins`, odrębna nazwa i stan kopii dev-mods. Kliknięcia
   człowieka: zaległe E4, ponowne E6, Effort, Research, Input Router w wąskim panelu,
   Cache Keeper (stara wartość → migracja → jawna zmiana `/config` → przeładowanie).
   Każde kliknięcie zmieniające stan: przerwa na odczyt pliku. Nie zmieniaj `/model` ani `/config`
   sesji pomiarowej poza jawnym scenariuszem konfiguracji Cache Keepera. Po odmowie przywróć
   poprzedni stan z kopii, bez wymuszania.
5. **Claude:** porównaj rejestr i „Oszczędności” co do tokena i kosztów helperów, bez BenAI
   w pomiarze. `POMIAR_E10.md` niesie modele, wersje, instalPath, limity i mianowniki.
   Odinstalowanie BenAI robi Łukasz dopiero po dodatnim pomiarze. Przed publikacją zamknij
   pozostałe bramki; wydanie wyłącznie `/relai-release` z osobnymi zgodami zewnętrznymi.

## Weryfikacja — wszystkie punkty muszą przejść

- [ ] Baza od Claude przed Codexem (L-0333); test regresji najpierw czerwony z asercji, potem
      zielony; wszystkie dotknięte ochrony mają mutanta zabitego asercją, bez osłabienia testów.
- [ ] `node --test --test-isolation=none <plik>` osobno dla każdego pliku testów guardrails,
      process, panel core, adapterów Codex/Cursor i kontraktów Research/Cache Keepera;
      `claude plugin test --file <mod>/hooks/<plik> <mod>` dla dziewięciu modów. Czytaj
      `results[].failure` i `error`, nie sam kod 0. EPERM → dokładna komenda i błąd,
      pełny przebieg Claude poza sandboxem. Cztery zastane czerwienie porównaj z reproduktorami.
- [ ] `node core/tools/validate-adapters.js`, `node core/tools/sync-panel-core.js --check`,
      `claude plugin validate <mod>` dla zmienionych modów; brak ręcznie zmienionych kopii.
- [ ] Przegląd Sol i bramka przed pomiarem. Następnie macierz specyfikacji na żywo w
      `POMIAR_E10.md`, każdy wiersz ma wynik, materiał i dowód, a nie tylko nazwę wywołania.
      AC1 bez rzeczywistego efektu effort blokuje zamknięcie do aneksu.
- [ ] Panel: ciemny/jasny, terminal/desktop, 40/47/48/143/144/160 kolumn, najdłuższe dane,
      props i kliknięcia. Karty E4/E6/E7/E8 i migracja konfiguracji E9 sprawdzone z człowiekiem.
- [ ] Rejestr = zakładka co do tokena; koszt helperów i różnica modeli zgodne z usage oraz
      cennikiem. Brak usage nie zwiększa deklarowanych oszczędności; brak mnożnika cache.
- [ ] Zgoda projektowa, bliźniaki, odmowa, sekrety, błędne wejście i ścieżki mają dowód
      negatywny z kontrolą pozytywną. Testy sekretów składają nazwę i wartość z części (L-0337).
      `node core/guardrails/secret-scan.js <zmienione pliki>` → BRAK, kontrola pozytywna → SEKRET.
- [ ] `trivy fs --scanners vuln --skip-db-update .`: pełny wynik w E10, liczby z pliku,
      porównanie z zakresem/bazą E9 (0 CRITICAL / 42 HIGH), brak nowych HIGH/CRITICAL.
      Brak binarki/bazy → audyt ekosystemu w środowisku z siecią przez Claude, bez udawania wyniku.
- [ ] `node core/tools/release-check.js` przed wydaniem; brak bazy pięciu nowych modów
      to pierwszy release, nie powód do obejścia kontroli. Claude wykonuje komendę projektową,
      aktualizuje właściwe numery i marketplace, publikuje, sprawdza artefakty i świeżą instalację.
- [ ] STATUS, końcowy wpis DZIENNIKA (cztery sekcje), STATE, ARTEFAKTY tylko dla zmienionych
      instrukcji; otwarte bramki i odnogi rozstrzygnięte przed statusem ZREALIZOWANY planu.
- [ ] Katalog E10 przejrzany `node .claude/relai/tools/clean-work.js raport` (otwarty etap →
      dodatkowy inwentarz plików/bajtów); raport w E10. Zewnętrzne artefakty z nazwami.
      Claude pyta o kasowanie i zapisuje liczby przed/po; Codex niczego nie usuwa.

## Na koniec — bez tego rytuału etap nie jest ukończony

Aneks C: Codex przygotowuje dokumenty z realnego stanu, bez zamykania niezmierzonych bramek.
Claude uzupełnia wynik pomiaru, wydania, sprzątania i zamyka plan.

1. `STATUS.md`: E10 → ZREALIZOWANY dopiero po kodzie, pomiarze i wydaniu; wpis wdrożenia.
1a. Raport E10 i zewnętrznych artefaktów, zgoda, kasowanie i liczby przed/po — Claude.
2. `docs/DZIENNIK.md`: końcowy wpis wg SPEC_DZIENNIK, cztery sekcje, autor z wykonawcą
   i Łukaszem; dowiezione vs plan, pomiary, ryzyka R1–R11/AC1–AC5 i ewentualne odchylenia.
3. `STATUS.md`: wszystkie otwarte bramki manualne oraz odnogi rozstrzyga człowiek;
   dopóki otwarte, plan pozostaje ZAAKCEPTOWANY, etap W TOKU.
4. `docs/STATE.md`, zgodna linia Aktywny plan w `CLAUDE.md` i `AGENTS.md`; dokumenty użytkownika
   opisują tylko zmierzone zachowanie, instrukcje mają aktualne wersje w ARTEFAKTY.
5. To ostatni etap: nie generuj PROMPT_ETAP_11. Claude wykonuje pełną sekwencję zamknięcia
   z `relai-planning/plan-closing.md` (łącznie z archiwizacją i przepięciem linków), dopiero
   po bramkach, bez drugiego wpisu dziennika. Sprawdza `node core/tools/release-hint.js`.
6. Commit i publikacja — Claude według `/relai-release`; Codex bez commita, push i instalacji.
