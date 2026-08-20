# PROMPT_ETAP_3 — Twardy kształt `STATE.md` i `CLAUDE.md`, rejestr pułapek jako osobny dokument

Plan: OPTYMALIZACJA_KONTEKSTU • Etap: **E3 z E5** • Wygenerowano: 2026-08-20 (autor: Opus 5,
w rytuale „Na koniec" E2) • Wykonawca: **Opus** (ze `STATUS.md` planu: „Opus, z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna — **i jednocześnie materiał tego etapu**: ten plik ma się zmieścić w nowym budżecie |
| `docs/STATE.md` | stan na dziś — cały plik; drugi materiał tego etapu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**R5**), sekcja „Czeka na człowieka" i wpis z 2026-08-20 o E2 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — **49 pozycji przy limicie 15**, to jest jeden z materiałów etapu |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html` | sekcje 5 (mechanizm 4 i tabela budżetu), 6 (zakres E3), 7 (ryzyko 3), 8 (dwa przypadki: pozycja nie do skrócenia, własne progi projektu) |
| `.claude/relai/templates/SPEC_STATE.md` | dzisiejsza struktura sekcji i „Próg zwięzłości" — tu wchodzi liczba zamiast oceny |
| `.claude/relai/templates/SPEC_CLAUDE_MD.md` | sekcja „Twardy limit objętości" (dziś **60 linii**) i „Struktura sekcji" — limit zmienia jednostkę, dochodzi zakaz treści odtwarzalnej |
| `.claude/relai/templates/SPEC_LEKCJE.md` | sekcja „Zasady aktywne" i jej limit 15 pozycji — wymóg formatu istnieje, brakuje adresu egzekwowania |
| `.claude/relai/templates/SPEC_USTAWIENIA.md` | wiersz `Budżet startu sesji` — progi cząstkowe `CLAUDE 10 KB` i `STATE 12 KB` są już tam |
| `core/process/session-signals.js` | `startCost` — pozycje `CLAUDE` i `STATE` mierzone jako **całe pliki**; to one mają zejść pod próg |
| `.claude/relai/templates/SPEC_DZIENNIK.md` | wzór na nową specyfikację: rola, odbiorca, polityka aktualizacji, struktura, zakazy, kompletny przykład |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **`STATE.md`: „Nad czym pracujemy teraz" to najwyżej trzy pozycje**, a zamknięty etap **podmienia**
  pozycję zamiast dopisywać akapit (sekcja 5 planu, mechanizm 4). Nie negocjujesz liczby trzy.
- **Próg zwięzłości `STATE.md` jest liczbą, nie oceną.** Dzisiejsze „przepisujesz zwięźlej, do
  jednego ekranu" nie da się sprawdzić i przez to nie działa — ma je zastąpić kryterium, które
  sprawdza się komendą.
- **`CLAUDE.md`: budżet 10 KB** (sekcja 5 planu, tabela budżetu). Dzisiejszy limit 60 linii zostaje
  albo nie — ale **jednostką rozstrzygającą jest rozmiar w KB**, bo to on wchodzi do pomiaru z E1.
- **`CLAUDE.md`: zakaz treści odtwarzalnej z repozytorium** — mapa katalogów, listy plików, opisy
  modułów. Znika **bez zastępnika**: repozytorium jest swoją własną mapą.
- **Rejestr pułapek dostaje własny dokument `docs/PULAPKI.md`**, czytany **na żądanie**, a w regułach
  zostaje **jedna linia odsyłacza**. Dokument jest **warunkowy** — powstaje wtedy, gdy jest pierwsza
  pułapka, nigdy na zapas (D-11, L-0029).
- **Progi projektowe mają pierwszeństwo przed domyślnymi**, a `/relai-update` ich nie nadpisuje
  (sekcja 8 planu; ryzyko R6 zamknięte w E9 planu budowy).
- **Sekcja „Zasady aktywne" ma już wymóg „jedno zdanie" i limit 15 pozycji** w `SPEC_LEKCJE.md`.
  Brakuje **adresu egzekwowania**, nie reguły — patrz zakres, punkt 5. Przepisywanie 49 zasad
  w tym etapie **nie jest zlecone**.
- **Granica zakresu:** ryzyka, wiersze ustawień i `STATUS.md` to **E4**; tam też następuje podbicie
  wersji do **1.6.0**. Migracja JiraManagera i PolyFlow to **E5**. W tym etapie **nie ruszasz**
  numeru wersji ani w `core/MANIFEST.json`, ani w `.claude-plugin/`.

## Stan wyjściowy (co realnie zastajesz po E2)

Repozytorium jest na wersji **1.5.2**. Testów ani runnera nadal **nie ma** — zachowania weryfikuje
się uruchamianiem skryptów Nodem (`node -e`, wywołanie hooka z payloadem podstawionym Nodem, nie
echem w powłoce) i dowodami na stanie plików.

Warstwa startowa tego repozytorium waży **73,4 KB przy budżecie 80 KB** `FAKT` (pomiar 2026-08-20,
po zamknięciu E2): CLAUDE 6,5 KB (próg 10 KB) · STATE 14,5 KB (próg 12 KB) · ryzyka 32,1 KB
(próg 12 KB) · zasady 12,4 KB (próg 30 KB) · ustawienia 4,1 KB · status planu 3,8 KB. **Mieści się
w sumie, więc raport milczy** — i ta cisza jest zweryfikowana, nie domniemana. Dwie pozycje są
ponad **własnym** progiem: `STATE` i `ryzyka`. Pierwsza należy do tego etapu, druga do E4.

Liczby pomocnicze `FAKT`: `CLAUDE.md` ma **63 linie** przy dzisiejszym limicie 60,
`docs/STATE.md` — **201 linii** przy progu 300.

```
core/templates/SPEC_STATE.md       # 4,9 KB — "Polityka aktualizacji: NADPISYWANY" z progiem
                                   #   zwiezlosci wyrazonym ocena ("do jednego ekranu"),
                                   #   "Struktura sekcji" bez limitu pozycji w zadnej sekcji
core/templates/SPEC_CLAUDE_MD.md   # 12,2 KB — "Twardy limit objetosci: maksimum 60 linii",
                                   #   brak zakazu tresci odtwarzalnej, brak linii o PULAPKI.md
core/templates/SPEC_LEKCJE.md      # 11,9 KB — "Zasady aktywne": jedno zdanie, twardy limit
                                   #   15 pozycji; nikt tego limitu nie mierzy
core/templates/SPEC_PULAPKI.md     # NIE ISTNIEJE
core/templates/SPEC_DZIENNIK.md    # wzor struktury specyfikacji + sekcja "Czeka na czlowieka" (E2)
core/templates/SPEC_ARCHIWUM.md    # dwa wejscia rotacji, blokada z sekcji "Czeka na czlowieka" (E2)
core/process/session-signals.js    # startCost: pozycje CLAUDE i STATE mierzone jako cale pliki;
                                   #   rotacja: true|false|null; startCostReport <= 6 linii
core/MANIFEST.json                 # 1.5.2 — NIE RUSZASZ
CLAUDE.md                          # 63 linie / 6,5 KB — tabela "Stan prac" z wierszem na etap
docs/STATE.md                      # 201 linii / 14,5 KB — "Nad czym pracujemy teraz" ma dzis
                                   #   siedem akapitow, nie trzy pozycje
docs/PULAPKI.md                    # NIE ISTNIEJE
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** limitu trzech pozycji w „Nad czym pracujemy
teraz"; reguły podmiany zamiast dopisywania; progu `STATE.md` wyrażonego liczbą sprawdzalną
komendą; budżetu `CLAUDE.md` w KB; zakazu treści odtwarzalnej z repozytorium; specyfikacji
`SPEC_PULAPKI.md`; dokumentu `docs/PULAPKI.md` i linii odsyłacza do niego; adresu egzekwowania
limitu „Zasad aktywnych".

**Dwie rzeczy, o których musisz wiedzieć, zanim zaczniesz:**

1. **`CLAUDE.md` i `STATE.md` tego repozytorium są jednocześnie materiałem i dowodem.** Zmiana
   specyfikacji bez przepisania tych dwóch plików pod nowy kształt jest połową etapu — dogfooding
   jest punktem weryfikacji, nie ozdobą. Twarda granica przy skracaniu `STATE.md`: fakt, który
   stąd znika, a nie stoi w żadnym innym dokumencie, **przepisujesz do wpisu dziennika tej sesji**
   (D-18) — inaczej skrócenie jest kasowaniem.
2. **Pozycja `ryzyka` (32,1 KB) należy do E4 i jej nie ruszasz**, choć jest najgrubsza. Jeśli po
   Twoich cięciach suma nadal będzie blisko budżetu, to jest oczekiwane: E3 zdejmuje dwie pozycje,
   nie wszystkie.

**Zasady aktywne z `docs/LEKCJE.md` — czytasz je z pliku w całości (52 pozycje).** Cztery, które
w tym etapie ważą najwięcej, przepisane wprost:

- Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest martwa
  (L-0001).
- Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do
  `KOMENDY.md` dopiero w wersji, w której realnie działa (L-0002).
- Komponent opcjonalny musi dać się **pominąć bez śladu**: żadnych pustych wypełniaczy ani martwego
  kodu (L-0029). Dotyczy `docs/PULAPKI.md` wprost.
- Próg liczbowy w mechanizmie automatycznym kalibrujesz na **zmierzonych** plikach realnych
  projektów, zanim go zapiszesz (L-0034). Masz trzy: RelAI, JiraManager, PolyFlow — liczby są
  w planie i we wpisie dziennika z 2026-08-20.

## Zakres etapu

1. **`core/templates/SPEC_STATE.md` — twardy kształt.** Sekcja „Nad czym pracujemy teraz":
   **najwyżej trzy pozycje**, każda jednoakapitowa, zamknięty etap **podmienia** pozycję zamiast
   dopisywać kolejną. Napisz wprost, co robić, gdy pozycji byłoby cztery (co wypada i dokąd).
   „Próg zwięzłości" dostaje kryterium **sprawdzalne komendą** — liczba, nie ocena — i zdanie
   o pierwszeństwie wartości projektowej z `USTAWIENIA.md`. Kompletny przykład na końcu musi być
   zgodny z nowym kształtem (L-0001).
2. **`core/templates/SPEC_CLAUDE_MD.md` — budżet w KB i zakaz treści odtwarzalnej.** Limit
   objętości wyrażony w **KB** (10 KB), z jawnym powiązaniem z wierszem `Budżet startu sesji`.
   Nowa reguła: **treści odtwarzalnej z repozytorium** (mapa katalogów, listy plików, opisy
   modułów) w `CLAUDE.md` nie ma — wypisz przykłady tego, co pod tę regułę podpada, i tego, co
   **nie** podpada (reguły procesu, sekcja niemutowalna, linia aktywnego planu). Dopisz **jedną
   linię odsyłacza** do `docs/PULAPKI.md` jako element warunkowy: nie ma pułapek → nie ma linii.
3. **`core/templates/SPEC_PULAPKI.md` — nowa specyfikacja.** Układ jak w pozostałych
   specyfikacjach (rola, odbiorca, polityka aktualizacji, struktura, zakazy, kompletny przykład).
   Rozstrzygnij wprost: czym pułapka **jest** (rzecz, która zaskoczyła i zaskoczy znowu: nieoczywiste
   zachowanie narzędzia, kolejność kroków, wymóg środowiska), czym **nie jest** (lekcja o sposobie
   pracy → `LEKCJE.md`; decyzja → `DECYZJE.md`; ryzyko → dziennik), kiedy dokument **powstaje**
   (przy pierwszej pułapce, nigdy na zapas) i **kto go czyta** (sesja na żądanie, nie na starcie —
   dlatego nie wchodzi do warstwy startowej).
4. **`docs/PULAPKI.md` w tym repozytorium — dogfooding.** Załóż dokument i przenieś do niego
   pułapki, które dziś mieszkają tam, gdzie nie powinny. Materiał masz w `LEKCJE.md`: część zasad
   aktywnych to **pułapki narzędziowe**, nie zasady pracy (kandydaci: L-0021 `tar` w Git Bash,
   L-0024 stdin i `--permission-mode`, L-0027 PowerShell 5.1 i UTF-8, L-0028 `--allowedTools`,
   L-0031 `plugin update` wymaga restartu, L-0039 `git worktree` zamiast `git archive`). Przenosisz
   **z adnotacją w miejscu źródłowym** — nigdy ciche kasowanie (D-18).
5. **Adres egzekwowania limitu „Zasad aktywnych"** (ryzyko 3 planu, sekcja 7). Reguła istnieje
   (`SPEC_LEKCJE.md`: jedno zdanie, 15 pozycji), a projekt ma **49 pozycji** — nikt tego nie mierzy.
   Dołóż **jedno** miejsce, w którym przekroczenie limitu staje się widoczne, i **nie więcej**:
   albo pozycja w rytuale zamknięcia sesji, albo liczba w raporcie budżetu. Wybór uzasadnij jednym
   zdaniem w dzienniku. **Przepisywania 49 zasad nie robisz** — to osobna praca.
6. **`CLAUDE.md` i `docs/STATE.md` tego repozytorium pod nowy kształt.** `STATE.md`: „Nad czym
   pracujemy teraz" do trzech pozycji, całość pod próg z punktu 1. `CLAUDE.md`: pod 10 KB, bez
   treści odtwarzalnej z repozytorium. Fakt bez innego domu → wpis dziennika tej sesji.
7. **`docs/KOMENDY.md`** — jedna linia o tym, że pułapki mają własny dokument czytany na żądanie.
   Bez obiecywania rzeczy z E4–E5 (L-0002).
8. **Bez podbicia wersji** — `core/MANIFEST.json`, `.claude-plugin/` i marker `Wersja RelAI`
   zostają na 1.5.2 do E4.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Pomiar przed i po, w jednym przebiegu:** `startCost` na stanie sprzed etapu
      (`git stash` albo `git show HEAD:`) i po nim. Pozycja `CLAUDE` **poniżej 10 KB**, pozycja
      `STATE` **poniżej 12 KB**, obie liczby wypisane (L-0040).
- [ ] **Nic nie zginęło przy skracaniu:** każdy fakt usunięty ze `STATE.md`, który nie stoi
      w innym dokumencie, ma swoje zdanie we wpisie dziennika tej sesji. Dowód: lista usuniętych
      akapitów zestawiona z wpisem, obie w dzienniku.
- [ ] **`CLAUDE.md` bez treści odtwarzalnej** — dowód negatywny: w pliku nie ma listy katalogów
      ani wyliczenia plików repozytorium (`grep` po wzorcach ze specyfikacji nie zwraca nic),
      a **sekcja niemutowalna ma nadal pierwotne brzmienie** (porównanie z `git show HEAD:CLAUDE.md`
      — dosłownie ten sam fragment, L-0007).
- [ ] **„Nad czym pracujemy teraz" ma najwyżej trzy pozycje** — policzone komendą na pliku, nie
      okiem.
- [ ] **`docs/PULAPKI.md` nie wchodzi do warstwy startowej:** `startCost` po jego założeniu ma
      nadal **sześć** pozycji i żadna z nich nie wskazuje tego pliku (dowód negatywny).
- [ ] **Komponent warunkowy da się pominąć bez śladu** (L-0029): projekt testowy **bez**
      `docs/PULAPKI.md` daje kontekst startu bajt w bajt taki jak przed zmianą, a w `CLAUDE.md`
      wygenerowanym dla niego **nie ma** linii odsyłacza.
- [ ] **Przeniesione pułapki zostawiły ślad w źródle** — każda przeniesiona pozycja `LEKCJE.md` ma
      adnotację o przeniesieniu z datą; dowód negatywny: żadna nie zniknęła bez adnotacji.
- [ ] **Nowa `SPEC_PULAPKI.md` kończy się kompletnym, realnym przykładem** (L-0001) i jest
      wymieniona tam, gdzie wymieniane są pozostałe specyfikacje (`core/MANIFEST.json` — sekcja
      listy plików rdzenia, jeśli takowa je wylicza; sprawdź, nie zakładaj).
- [ ] **Limit „Zasad aktywnych" ma dokładnie jeden adres egzekwowania** — dowód negatywny:
      przekroczenie limitu daje **jeden** komunikat, nie dwa (L-0036, L-0049).
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] Wersja **nie została podbita**: `core/MANIFEST.json` nadal ma `1.5.2` (dowód negatywny).
- [ ] Komunikaty hooków bez polskich diakrytyków, jeśli w tym etapie w ogóle powstały:
      `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na literałach obu hooków nie zwraca nic (L-0016).
- [ ] Ślady pracy: wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" z podpisem
      `RelAI (<model>) + <git config user.name>`, `docs/STATE.md` nadpisany, sekcja „Czeka na
      człowieka" odświeżona, katalogi testowe usunięte, brak plików tymczasowych w repo.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: E3 → `ZREALIZOWANY <data>`, E4 → `GOTOWY DO
   STARTU` z linkiem do `PROMPT_ETAP_4.md`, linia w dzienniku wdrożenia. Pozycje „Do zrobienia
   przez człowieka" z wpisu tego etapu → sekcja „Bramki manualne".
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka). Sprawy czekające na
   człowieka **wyprowadzasz do sekcji „Czeka na człowieka"** w tej samej turze — od 1.6.0 to jest
   ich dom. Przejrzyj tabelę ryzyk: **R5** dostaje zdanie o tym, co ten etap zmienił w liczbach.
   Lekcje z etapu → `docs/LEKCJE.md` plus odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz w nowym kształcie (to jest jednocześnie punkt zakresu);
   `README.md` tylko przy zmianie sposobu uruchomienia.
4. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, wg `SPEC_PROMPT_ETAPU.md`: na bazie sekcji 5
   i 6 planu (E4 — ryzyka, ustawienia, status planu, podbicie wersji do 1.6.0), **realnego stanu
   repozytorium po tym etapie** i lekcji, które w nim powstały.
5. Commit z conventional message (propozycja, nie samowola).
