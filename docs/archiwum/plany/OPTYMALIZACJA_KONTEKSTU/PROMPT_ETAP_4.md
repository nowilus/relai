# PROMPT_ETAP_4 — Ryzyka, ustawienia i status planu jako stan bieżący; wydanie 1.6.0

Plan: OPTYMALIZACJA_KONTEKSTU • Etap: **E4 z E5** • Wygenerowano: 2026-08-20 (autor: Opus 5,
w rytuale „Na koniec" E3) • Wykonawca: **Opus** (ze `STATUS.md` planu: „Opus, z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna. Od E3 ma 3,1 KB — nie rozdymaj go z powrotem |
| `docs/STATE.md` | stan na dziś, cały plik; po E3 ma nowy, twardy kształt — trzymaj go |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**to jest główny materiał tego etapu — 21,4 KB w dziewięciu wierszach**), sekcja „Czeka na człowieka" i wpis z 2026-08-20 o E3 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — **48 pozycji przy limicie 15**; limit ma od E3 swój adres egzekwowania, o którym trzeba powiedzieć w podsumowaniu sesji |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html` | sekcje 5 (mechanizm 5 i tabela budżetu), 6 (zakres E4), 7 (ryzyka 1 i 3), 8 (przypadek „budżet pęka przez jedną pozycję, której nie da się skrócić") |
| `.claude/relai/templates/SPEC_DZIENNIK.md` | sekcja „Stan otwartych ryzyk" — dziś opisuje tabelę, ale **nie mówi nic o objętości komórki „Mitygacja"**; tu wchodzi reguła stanu bieżącego |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | dwie fazy, sumy kontrolne, nazwy plików — wzorzec dla nowego `docs/archiwum/ryzyka/`; sekcja „Co zostaje zawsze" mówi dziś, że sekcja ryzyk **nie rotuje** |
| `.claude/relai/templates/SPEC_USTAWIENIA.md` | struktura tabeli i polityka „append"; wiersz ma być **jedną decyzją**, nie uzasadnieniem |
| `.claude/relai/templates/SPEC_STATUS.md` | sekcja „Dziennik wdrożenia" — tu wchodzi reguła „jedna linia na etap" |
| `.claude/relai/templates/SPEC_STATE.md` | wzór z E3: jak wygląda próg wyrażony liczbą i zdanie o pierwszeństwie wartości projektowej — powtórz ten wzorzec, nie wymyślaj drugiego |
| `core/process/session-signals.js` | `startCost` — pozycja `ryzyka` mierzy sekcję ryzyk **plus** „Czeka na człowieka" **plus** ostatni wpis; to wyjaśnia, dlaczego ta pozycja jest największa |
| `core/MANIFEST.json`, `.claude-plugin/plugin.json` | trzy źródła numeru wersji; w tym etapie **podbijasz** je do 1.6.0 |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Komórka „Mitygacja" trzyma stan bieżący plus odsyłacz** do wpisów, które go zmierzyły — nie
  narrację przyrastającą przy każdym pomiarze (sekcja 5 planu, mechanizm 5). Nie negocjujesz tego
  kształtu.
- **Ryzyka zamknięte schodzą do `docs/archiwum/ryzyka/`** przy rotacji. Ryzyko `ZAMKNIĘTE` przestaje
  zajmować warstwę startową, ale **nie znika** — archiwum jest kopią bajt w bajt, jak przy dzienniku
  i lekcjach (D-18).
- **Wiersz `USTAWIENIA.md` to jedna decyzja jednym zdaniem.** Uzasadnienia i odrzucone warianty
  mieszkają w `DECYZJE.md`, nie w komórce tabeli.
- **„Dziennik wdrożenia" w `STATUS.md` to jedna linia na etap** — nie streszczenie wpisu dziennika.
- **Numeracja ryzyk jest ciągła i nigdy nie używana ponownie** (`SPEC_DZIENNIK.md`) — archiwizacja
  ryzyka nie zwalnia numeru.
- **Progi projektowe mają pierwszeństwo przed domyślnymi**, a `/relai-update` ich nie nadpisuje
  (sekcja 8 planu; R6 zamknięte w E9 planu budowy).
- **Limit w jednostce, której nikt nie liczy, jest martwy** (L-0053) — każdy nowy próg wprowadzony
  w tym etapie ma jednostkę zgodną z mechanizmem kontrolnym i komendę sprawdzającą w specyfikacji.
- **Mechanizm z progiem ma jeden wyzwalacz** (L-0049, L-0036). Rotacja ryzyk nie może stać się
  drugim komunikatem obok raportu budżetu ani obok rotacji dziennika.
- **Granica zakresu:** migracja JiraManagera i PolyFlow to **E5**. W tym etapie nie dotykasz żadnego
  cudzego repozytorium. Kształt `STATE.md`, `CLAUDE.md` i rejestr pułapek są **zamknięte w E3** —
  nie poprawiasz ich „przy okazji".

## Stan wyjściowy (co realnie zastajesz po E3)

Repozytorium jest na wersji **1.5.2** — i to jest ostatni etap, w którym tak jest: podbicie do
**1.6.0** należy do tego zakresu. Testów ani runnera nadal **nie ma**; zachowania weryfikuje się
uruchamianiem skryptów Nodem i dowodami na stanie plików. Instrument z wyrażeniem regularnym
zapisuj **do pliku**, nie do `node -e` (L-0054) — w E3 dwa punkty weryfikacji dały przez to fałszywy
negatyw.

Warstwa startowa waży **69,6 KB przy budżecie 80 KB** `FAKT` (pomiar 2026-08-20, po zamknięciu E3):
CLAUDE 3,1 KB (próg 10) · STATE 9,4 KB (próg 12) · **ryzyka 36,4 KB (próg 12)** · zasady 11,8 KB
(próg 30) · ustawienia 4,1 KB (próg 6) · status 4,8 KB (próg 10). Mieści się w sumie, więc raport
milczy. **Jedyna pozycja ponad własnym progiem to `ryzyka`** — i to jest główny materiał tego etapu.

Rozbicie tej pozycji `FAKT`: sekcja „Stan otwartych ryzyk" **21,4 KB w dziewięciu wierszach**
(komórka „Mitygacja" ryzyka R2 ma ponad 5 KB samej narracji z ośmiu pomiarów), sekcja „Czeka na
człowieka" 2,8 KB / 11 pozycji, ostatni wpis dziennika 12,2 KB. Sześć z dziewięciu ryzyk ma status
`ZAMKNIĘTE` — to one są kandydatem do archiwum.

**Dziennik ma 153,5 KB przy progu rotacji 150 KB** `FAKT` — próg przekroczono wpisem zamykającym
E3. Rotacja należy do kroku 2 rytuału zamknięcia sesji i **może się wydarzyć przed tym etapem albo
w jego trakcie**; sprawdź stan pliku, zanim cokolwiek policzysz, i nie zakładaj żadnej z tych liczb
w ciemno.

```
docs/DZIENNIK.md                   # 153,5 KB / 1789 lin. — sekcja ryzyk 21,4 KB (9 wierszy,
                                   #   6 zamknietych), "Czeka na czlowieka" 2,8 KB (11 pozycji)
docs/USTAWIENIA.md                 # 4,1 KB / 31 lin. — 14 wierszy, kilka z uzasadnieniem
                                   #   i odrzuconymi wariantami w komorce (wiersz "Gust designowy"
                                   #   ma ~1,3 KB w jednej komorce)
docs/plany/.../STATUS.md           # 4,8 KB — "Dziennik wdrozenia" ma 8 linii na 3 zamkniete etapy
core/templates/SPEC_DZIENNIK.md    # 14,1 KB — sekcja ryzyk opisana bez limitu objetosci
core/templates/SPEC_ARCHIWUM.md    # 17,8 KB — dwa wejscia rotacji; "sekcja ryzyk nie rotuje"
core/templates/SPEC_USTAWIENIA.md  # 12,8 KB — struktura tabeli, budzet startu, rotacja
core/templates/SPEC_STATUS.md      # 10,9 KB — "Dziennik wdrozenia" bez limitu na etap
core/templates/SPEC_STATE.md       # 8,5 KB  — WZOR z E3: prog jako liczba + komenda sprawdzajaca
core/templates/SPEC_PULAPKI.md     # 11,1 KB — nowa w E3, NIE RUSZASZ
docs/PULAPKI.md                    # 5,9 KB / 6 pulapek — NIE RUSZASZ
core/MANIFEST.json                 # 1.5.2 -> 1.6.0 w tym etapie
.claude-plugin/plugin.json         # 1.5.2 -> 1.6.0
.claude-plugin/marketplace.json    # 1.5.2 -> 1.6.0
docs/USTAWIENIA.md                 # marker "Wersja RelAI: 1.5.2" -> 1.6.0
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** reguły objętości i kształtu komórki
„Mitygacja"; katalogu `docs/archiwum/ryzyka/` i reguły schodzenia tam ryzyk zamkniętych; reguły
„jedna decyzja, jedno zdanie" w specyfikacji ustawień; reguły „jedna linia na etap" w dzienniku
wdrożenia `STATUS.md`; wersji 1.6.0 w żadnym z czterech miejsc.

**Zasady aktywne z `docs/LEKCJE.md` — czytasz je z pliku w całości (48 pozycji).** Pięć, które w tym
etapie ważą najwięcej, przepisane wprost:

- Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest martwa
  (L-0001).
- Po podbiciu wersji przepuść repo `grep`-em po starym numerze i rozstrzygnij **każde** trafienie:
  historyczne zostaje, aktualne się zmienia (L-0008).
- Próg liczbowy w mechanizmie automatycznym kalibrujesz na **zmierzonych** plikach realnych
  projektów, zanim go zapiszesz (L-0034). Masz trzy: RelAI, JiraManager, PolyFlow.
- Limit zapisuj w **tej samej jednostce**, w której liczy go mechanizm kontrolny, i wskaż komendę,
  która go sprawdza (L-0053).
- Instrument weryfikacyjny z wyrażeniem regularnym **zapisujesz do pliku**, nie do `node -e`;
  dokładaj przypadek, który **musi** trafić (L-0054).

## Zakres etapu

1. **`core/templates/SPEC_DZIENNIK.md` — komórka „Mitygacja" jako stan bieżący.** Sekcja „Stan
   otwartych ryzyk" dostaje regułę kształtu komórki: **dzisiejszy stan plus odsyłacz** do wpisów,
   które go zmierzyły — zamiast łańcucha „**data (etap):** …" przyrastającego przy każdym pomiarze.
   Napisz wprost, co robić z narracją, która już tam jest (przenosi się do wpisów, do których i tak
   prowadzą odsyłacze — nie kasuje się jej). Podaj **limit objętości komórki** w jednostce
   sprawdzalnej komendą (L-0053) i skalibruj go na zmierzonych plikach (L-0034): RelAI 21,4 KB / 9
   wierszy, JiraManager 24 KB, PolyFlow 57 KB.
2. **`core/templates/SPEC_ARCHIWUM.md` — `docs/archiwum/ryzyka/`.** Ryzyko ze statusem `ZAMKNIĘTE`
   schodzi do archiwum tą samą procedurą dwufazową co dziennik i lekcje: kopia, suma kontrolna,
   dopiero potem przycięcie. Rozstrzygnij wprost: nazwę pliku archiwum, **co zostaje w żywej
   tabeli** po zarchiwizowanym ryzyku (linia-odsyłacz czy nic), próg uruchomienia i jego relację do
   istniejących wyzwalaczy — **bez dokładania drugiego komunikatu** (L-0049). Dziś ta specyfikacja
   mówi, że sekcja ryzyk **nie rotuje**; to zdanie wymaga zmiany, nie obejścia.
3. **`core/templates/SPEC_USTAWIENIA.md` — wiersz to jedna decyzja.** Reguła: komórka `Decyzja`
   niesie **rozstrzygnięcie**, nie jego uzasadnienie ani odrzucone warianty — te idą do
   `DECYZJE.md`. Wypisz, co robić z wierszem, który już jest za długi (przeniesienie treści, nie
   kasowanie — D-18). Wiersze czytane maszynowo (`Profil projektu`, `Rotacja dokumentów`,
   `Budżet startu sesji`) mają **zamknięty format i ta reguła ich nie dotyczy** — powiedz to wprost,
   żeby nikt ich nie „skrócił".
4. **`core/templates/SPEC_STATUS.md` — jedna linia na etap.** „Dziennik wdrożenia" przestaje
   streszczać wpisy dziennika: jedna linia na zdarzenie, z datą i jednym zdaniem, bez przepisywania
   sekcji „Zweryfikowane". Rozstrzygnij, co z linią „E**N** rozpoczęty" (zostaje czy scala się
   z linią zamknięcia).
5. **Dogfooding — cztery dokumenty tego repozytorium.** `docs/DZIENNIK.md`: sekcja ryzyk pod nowy
   kształt, sześć ryzyk `ZAMKNIĘTE` do `docs/archiwum/ryzyka/`. `docs/USTAWIENIA.md`: wiersze
   z uzasadnieniami przycięte do decyzji, treść przeniesiona (nie skasowana).
   `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: dziennik wdrożenia do jednej linii na etap.
   Fakt bez innego domu → wpis dziennika tej sesji (D-18).
6. **Podbicie wersji do 1.6.0** w czterech miejscach: `core/MANIFEST.json`,
   `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, marker `Wersja RelAI`
   w `docs/USTAWIENIA.md`. Potem `grep` po `1.5.2` w całym repozytorium i rozstrzygnięcie **każdego**
   trafienia: historyczne (prompty etapowe, wpisy dziennika) zostaje, aktualne się zmienia (L-0008).
7. **`docs/KOMENDY.md`** — jedna linia o tym, że zamknięte ryzyka schodzą do archiwum. Bez
   obiecywania czegokolwiek z E5 (L-0002).
8. **Wydanie 1.6.0 jest gotowe do wypuszczenia po tym etapie** — ale sekwencji wydania **nie
   wykonujesz**: push, `plugin marketplace update`, `plugin update` i restart to bramka manualna
   człowieka (sekcja 9 planu).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Pomiar przed i po, w jednym przebiegu** (L-0040): `startCost` na stanie sprzed etapu
      i po nim, obie liczby wypisane. Pozycja `ryzyka` **poniżej 12 KB** albo — jeśli zejść się nie
      da — jawnie nazwany powód i liczba, o ile zeszła.
- [ ] **Nic nie zginęło:** suma kontrolna treści przeniesionej do `docs/archiwum/ryzyka/` zgodna
      w obu fazach (L-0033: normalizacja CRLF → LF), a żywa tabela plus archiwum składają się
      w oryginał znak w znak.
- [ ] **Numery ryzyk nie zostały odzyskane ani przenumerowane** — dowód negatywny: numer
      zarchiwizowanego ryzyka nie występuje ponownie w żywej tabeli.
- [ ] **Wiersze ustawień czytane maszynowo działają dalej** — dowód negatywny na wszystkich trzech:
      `startCost` zwraca ten sam budżet i progi co przed etapem, `startCost().rotacja` daje tę samą
      wartość, a hook `profile-rules` rozpoznaje profil. Skrócenie wiersza, które wycisza mechanizm,
      jest defektem, nie oszczędnością (L-0025).
- [ ] **Wersja podbita w czterech miejscach i nigdzie indziej** — `node core/tools/validate-adapters.js`
      kończy się kodem 0 i melduje „3 zrodel, wartosc 1.6.0"; marker w `docs/USTAWIENIA.md` to
      1.6.0; `grep -rn "1\.5\.2"` daje **wyłącznie** trafienia historyczne, każde wymienione
      z powodem (L-0008).
- [ ] **Warstwa startowa mieści się w budżecie po tym etapie** i raport hooka nadal milczy — dowód:
      `startCostReport` zwraca pustą tablicę.
- [ ] **Rotacja ryzyk ma jeden wyzwalacz** — dowód negatywny: przekroczenie progu daje **jeden**
      komunikat, a nie dwa obok raportu budżetu i rotacji dziennika (L-0036, L-0049).
- [ ] **Zmienione specyfikacje kończą się kompletnym, realnym przykładem** obejmującym nowy kształt
      (L-0001) — dotyczy `SPEC_DZIENNIK`, `SPEC_ARCHIWUM`, `SPEC_USTAWIENIA`, `SPEC_STATUS`.
- [ ] Komunikaty hooków bez polskich diakrytyków, jeśli w tym etapie powstały:
      `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na literałach obu hooków nie zwraca nic (L-0016).
- [ ] Ślady pracy: wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" z podpisem
      `RelAI (<model>) + <git config user.name>`, `docs/STATE.md` nadpisany, sekcja „Czeka na
      człowieka" odświeżona, katalogi testowe usunięte, brak plików tymczasowych w repo.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: E4 → `ZREALIZOWANY <data>`, E5 → `GOTOWY DO
   STARTU` z linkiem do `PROMPT_ETAP_5.md`, linia w dzienniku wdrożenia — **już w nowym formacie
   z punktu 4 zakresu**. Pozycje „Do zrobienia przez człowieka" z wpisu tego etapu → sekcja „Bramki
   manualne".
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka). Sprawy czekające na
   człowieka wyprowadź do sekcji „Czeka na człowieka" w tej samej turze. Przejrzyj tabelę ryzyk:
   **R5** dostaje zdanie o tym, co ten etap zmienił w liczbach. Lekcje z etapu → `docs/LEKCJE.md`
   plus odświeżone „Zasady aktywne" — i **powiedz jednym zdaniem**, ile pozycji ma ta sekcja wobec
   limitu 15 (adres egzekwowania z E3).
3. `docs/STATE.md` — nadpisz w kształcie z E3: najwyżej trzy pozycje w „Nad czym pracujemy teraz",
   zamknięty etap **podmienia** pozycję. `README.md` tylko przy zmianie sposobu uruchomienia.
4. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, wg `SPEC_PROMPT_ETAPU.md`: na bazie sekcji 5
   i 6 planu (E5 — migracja JiraManagera i PolyFlow: backup jako bramka, jeden projekt na sesję,
   `/relai-update` do 1.6.0, pomiar przed i po, raport z drogą pełnego powrotu, zamknięcie R5),
   **realnego stanu repozytorium po tym etapie** i lekcji, które w nim powstały. E5 jest ostatnim
   etapem planu — zaznacz w jego prompcie, że punkt „wygeneruj następny prompt" zastępuje
   **sekwencja zamknięcia planu** (D-36).
5. Commit z conventional message (propozycja, nie samowola).
