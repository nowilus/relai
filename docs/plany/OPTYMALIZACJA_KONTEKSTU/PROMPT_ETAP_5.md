# PROMPT_ETAP_5 — Migracja JiraManagera i PolyFlow na 1.6.0, pomiar przed i po, zamknięcie R5

Plan: OPTYMALIZACJA_KONTEKSTU • Etap: **E5 z E5** • Wygenerowano: 2026-08-21 (autor: Opus 5,
w rytuale „Na koniec" E4) • Wykonawca: **Opus** (ze `STATUS.md` planu: „Opus, z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **To jest ostatni etap planu.** Rytuał „Na koniec" nie kończy się wygenerowaniem następnego
> promptu, tylko **sekwencją zamknięcia planu** (D-36) — patrz sekcja „Na koniec".

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/STATE.md` | stan na dziś; po E4 ma nowy kształt i nowe liczby — trzymaj go |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**R5 zamykasz w tym etapie**), sekcja „Czeka na człowieka" i wpis z 2026-08-21 o E4 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — 15 pozycji przy limicie 15 |
| `docs/PULAPKI.md` | **czytasz cały** — ten etap dotyka cudzych repozytoriów, aktualizacji pluginu i pakowania; tu mieszkają P-001, P-005 i P-006 |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html` | sekcje 5 (mechanizm 6 — migracja), 6 (zakres E5), 7 (ryzyka 1 i 5), 8 (przypadki „migracja trafia na projekt z etapem w toku" i „projekt ma własne progi") |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md` | bramki manualne — **cztery otwarte**, dwie z nich są warunkiem startu tego etapu |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | dwa wejścia rotacji, procedura dwufazowa, rotacja ryzyk zamkniętych (nowa w 1.6.0) |
| `.claude/relai/templates/SPEC_USTAWIENIA.md` | wiersz `Budżet startu sesji` — to jego brak sprawia, że oba projekty dziś nie mierzą niczego |
| `adapters/claude-code/commands/relai-update.md` | co dokładnie robi `/relai-update`: diff, zgoda, pierwszeństwo lokalnych nadpisań, wpis w dzienniku |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcje „Rotacja na starcie sesji", „Rotacja dokumentów" i procedura **wyprowadzenia otwartych pozycji** do sekcji „Czeka na człowieka" |
| `core/process/session-signals.js` | `startCost` — czym mierzysz przed i po; po E4 działa też przy końcach linii CRLF |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Backup jest bramką.** Bez wykonanej kopii zapasowej projektu **nie zmieniasz w nim ani jednego
  pliku** (D-70). To nie jest zalecenie ani punkt do odhaczenia na końcu — to warunek wejścia.
- **Jeden projekt na sesję** (sekcja 6 planu). Dwa projekty w jednej sesji to dwa razy większa
  szansa, że pomyłka trafi nie tam, gdzie trzeba.
- **Migracja wchodzi wyłącznie na projekt z zamkniętym etapem** (sekcja 8 planu). Przepisanie
  `STATE.md` i rotacja dziennika w połowie etapu zostawiłyby prompt następnej sesji opisujący stan,
  którego już nie ma.
- **Wartość projektowa ma pierwszeństwo przed domyślną**, a `/relai-update` progów nie nadpisuje
  (R6, zamknięte w E9 planu budowy). Projekt, który ma własne progi rotacji, zachowuje swoje.
- **Wyprowadzenie otwartych pozycji jest osobną, opisaną procedurą** z liczeniem przed i po — nie
  robi się go „przy okazji" rotacji (`SPEC_ARCHIWUM.md`, zakazy). Rotacja tylko czyta jej wynik.
- **Nic nie opuszcza żywego pliku bez kopii z potwierdzoną sumą kontrolną** (ryzyko 1 planu). Dwie
  fazy rotacji zostają bez zmian, także pod presją rozmiaru.
- **Raport migracji ma opisaną drogę pełnego powrotu** — tak samo jak raport adopcji (D-70).
- **Granica zakresu:** nie zmieniasz w tych projektach niczego poza warstwą RelAI. Kod, testy,
  konfiguracja aplikacji i treść merytoryczna dokumentów nie są przedmiotem tego etapu. Nie
  poprawiasz też „przy okazji" specyfikacji rdzenia — te zamknęły się w E1–E4.

## Stan wyjściowy (co realnie zastajesz po E4)

Repozytorium RelAI jest na wersji **1.6.0** `FAKT`, walidator spójności przechodzi z kodem 0
(„3 zrodel, wartosc 1.6.0"). Testów ani runnera nadal **nie ma** — zachowania weryfikuje się
uruchamianiem skryptów Nodem i dowodami na stanie plików. Instrument z wyrażeniem regularnym
zapisuj **do pliku**, nie do `node -e` (L-0054), a komendę wklejaną do dokumentu uruchom w tej
formie, w jakiej ma tam stanąć (L-0059).

Warstwa startowa tego repozytorium: **39,4 KB / 80 KB** `FAKT` (pomiar 2026-08-21, po zamknięciu
E4). Pozycja `ryzyka` ma 14,1 KB przy progu 12 KB, ale **sama sekcja ryzyk to 3,7 KB** — resztę
stanowi gruby wpis zamykający E4, który przestanie być ostatnim, gdy dopiszesz swój.

**Czego jeszcze NIE ma (to jest zakres tego etapu):** ani jeden **cudzy** projekt nie dostał 1.6.0.
Oba projekty docelowe mają w markerze `Wersja RelAI: 1.5.2`, w `USTAWIENIA.md` **nie mają wiersza
`Budżet startu sesji`**, więc `startCost` zwraca dla nich `null` i nie mierzą niczego. Sekcji
„Czeka na człowieka" też nie mają, więc rotacja blokuje się w nich po staremu — na pierwszym wpisie
dziennika.

Stan obu projektów, zmierzony 2026-08-21 `FAKT`:

```
JiraManager  C:\Users\Lukasz\Desktop\JiraManager
  marker "Wersja RelAI: 1.5.2 · zainicjowano: 2026-08-10 (adopcja)"
  docs/DZIENNIK.md  1018,5 KB      # ~1 MB; rotacja nigdy nie ruszyla
  docs/LEKCJE.md     195,9 KB
  docs/STATE.md      142,9 KB / 1611 lin.   # prog zwiezlosci: 300 lin.
  CLAUDE.md          115,3 KB / 1359 lin.   # prog: 10 KB
  wiersz "Rotacja dokumentow": JEST | wiersz "Budzet startu sesji": BRAK
  plan PANEL_WTYCZKI: etap E16-1 ma status W TOKU
PolyFlow     C:\Users\Lukasz\Desktop\PolyFlow
  marker "Wersja RelAI: 1.5.2 · zaadoptowano: 2026-08-10"
  docs/DZIENNIK.md   558,2 KB
  docs/LEKCJE.md      61,6 KB
  docs/STATE.md       29,6 KB / 403 lin.
  CLAUDE.md           15,1 KB / 147 lin.
  wiersz "Rotacja dokumentow": JEST | wiersz "Budzet startu sesji": BRAK
  katalogu docs/plany NIE MA — zaden etap nie jest w toku
```

**Dwie rzeczy wynikają z tych liczb wprost i nie są przedmiotem dyskusji.** Po pierwsze:
**JiraManager ma etap `W TOKU`**, więc według sekcji 8 planu migracja tego projektu **czeka** —
zaczynasz od PolyFlow, a JiraManagera ruszasz dopiero po potwierdzeniu, że E16-1 jest zamknięty.
Po drugie: **migracja przechodzi przez `/relai-update` do wersji 1.6.0**, a ta wymaga wykonanej
sekwencji wydania (push → `plugin marketplace update` → `plugin update` → **restart aplikacji**,
P-005). Sekwencja jest bramką człowieka i **do jej wykonania etapu nie zaczynasz** — sprawdź
zainstalowaną wersję plikiem instalacji, nie komunikatem CLI (L-0004, zasada 10).

**Zasady aktywne z `docs/LEKCJE.md` — czytasz je z pliku w całości (15 pozycji).** Sześć, które
w tym etapie ważą najwięcej, przepisane wprost:

- **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi; zmianę
  pokazujesz obiema wersjami w jednym przebiegu (zasada 4).
- **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne w pliku, przypadek, który
  **musi** trafić, kontrola „ile zastanych nie znalazło pary" (zasada 5).
- **Końce linii są wariantem, nie szczegółem:** sumy kontrolne po normalizacji CRLF → LF; cudze
  repozytorium może mieć inne końce linii niż to (zasada 11, L-0057).
- **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, a zachowania mierzysz
  świeżą sesją (zasada 10).
- **Przeniesienie w cudzym repozytorium sprawdzasz najpierw na kopii** (zasada 11, L-0038).
- **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje;** wstawkę kotwicz do elementu,
  który przeżyje operację, i dowódź **obecności** nowej treści (zasada 14, L-0058).

## Zakres etapu

1. **Warunek wejścia — sprawdzasz, nie zakładasz.** Zainstalowana wersja pluginu to 1.6.0
   (plik instalacji, nie CLI); projekt docelowy nie ma etapu `W TOKU`; backup wykonany. Którykolwiek
   warunek niespełniony → **zatrzymujesz się i mówisz który**, zamiast zaczynać połowicznie.
2. **Backup projektu** — `/relai-backup` w katalogu projektu, do lokalizacji z ustawień. Zapisz
   ścieżkę archiwum i liczbę wpisów; bez potwierdzonego archiwum nie idziesz dalej (D-70).
3. **Pomiar PRZED** — `startCost` na projekcie w stanie zastanym. Dla projektu sprzed 1.6.0 funkcja
   zwraca `null` (brak wiersza budżetu), więc **policz te same sześć pozycji ręcznie**, tą samą
   definicją co rdzeń: całe pliki tam, gdzie rytuał czyta cały plik, i wskazane sekcje tam, gdzie
   czyta sekcję. Liczbę zapisz — jest połową dowodu.
4. **`/relai-update` do 1.6.0** — diff pokazany przed zapisem, zmiany wyłącznie za zgodą, lokalne
   nadpisania nietknięte. Po aktualizacji `USTAWIENIA.md` ma wiersz `Budżet startu sesji`
   i marker `Wersja RelAI: 1.6.0`, a progi rotacji wpisane wcześniej przez projekt **zostają jego**.
5. **Wyprowadzenie otwartych pozycji** do sekcji „Czeka na człowieka" — procedurą ze skilla
   `relai-core`, z **liczeniem przed i po**: liczba otwartych spraw musi się zgadzać, zero
   zgubionych (ryzyko 4 planu). Jednostką inwentarza jest **sprawa**, nie linia (L-0050).
6. **Pierwsza rotacja dziennika** — dwie fazy, suma kontrolna, linia-odsyłacz. To jest moment,
   w którym mechanizm z E2 dostaje pierwszy raz materiał, dla którego powstał: dziennik na 1 MB
   i na 558 KB. Rotacja ryzyk zamkniętych, jeśli pozycja `ryzyka` przekracza próg cząstkowy.
7. **Przepisanie `STATE.md`** do kształtu z E3 — najwyżej trzy pozycje w „Nad czym pracujemy teraz",
   cel liczbowy to próg cząstkowy `STATE`. Fakt, który przy tym znika, a nie stoi nigdzie indziej,
   **przepisujesz do wpisu dziennika tej sesji** (D-18). Przy `STATE.md` na 1611 linii to nie jest
   formalność — to główne ryzyko utraty pamięci w tym etapie.
8. **Odchudzenie `CLAUDE.md`** do progu z `SPEC_CLAUDE_MD` — treść odtwarzalna z repozytorium
   wychodzi, pułapki narzędziowe idą do `docs/PULAPKI.md`, decyzje do `DECYZJE.md`. W JiraManagerze
   `CLAUDE.md` ma 1359 linii, w tym zastane reguły scalone przy adopcji (D-71) — **te są cudze
   i zostają**; skracasz to, co RelAI tam dołożył.
9. **Pomiar PO i raport migracji** — w tym samym przebiegu co pomiar przed (L-0040). Raport zapisz
   w projekcie migrowanym, z **opisaną drogą pełnego powrotu** (ścieżka archiwum, co odtworzyć,
   czym sprawdzić, że wróciło).
10. **Drugi projekt — osobna sesja.** W tej sesji go nie zaczynasz. Kończysz tę i zostawiasz stan,
    z którego następna wie, co już przeszło.
11. **Zamknięcie ryzyka R5** — dopiero gdy oba projekty są zmigrowane i zmierzone. Jeden projekt
    to nie jest dowód dla ryzyka, którego treścią jest „dokumenty puchną i zjadają kontekst".

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Backup istnieje i jest kompletny** — archiwum otwarte, lista wpisów sprawdzona, zero
      trafień na `.env` i katalogi runtime. Bez tego punktu pozostałe nie mają znaczenia.
- [ ] **Pomiar przed i po, w jednym przebiegu** (L-0040): obie liczby wypisane, dla każdej z sześciu
      pozycji osobno. Cel z planu dla JiraManagera to **około 25 tys. tokenów zamiast 120 tys.**
      `SZACUNEK` — wynik inny od oczekiwanego opisujesz liczbą i powodem, nie przemilczasz.
- [ ] **Nic nie zginęło:** suma kontrolna przeniesionej treści zgodna w obu fazach rotacji
      (normalizacja CRLF → LF, L-0033), a żywy dokument plus archiwa składają się w oryginał.
      Sprawdź to **komendą na plikach**, nie pamięcią o tym, co robił skrypt.
- [ ] **Liczba otwartych spraw przed i po wyprowadzeniu jest równa** — dowód wypisany obiema
      liczbami. Sprawa, która zniknęła, jest defektem migracji, nie oszczędnością.
- [ ] **Dowód negatywny na cudzej treści:** reguły odziedziczone przy adopcji (D-71) mają
      w `CLAUDE.md` **nadal pierwotne brzmienie** — porównanie sum kontrolnych tych sekcji przed
      i po. Skróciłeś warstwę RelAI, nie cudzą.
- [ ] **Progi projektowe przetrwały aktualizację** — wartości z wiersza `Rotacja dokumentów`
      wpisane przez projekt są po `/relai-update` niezmienione (dowód negatywny, R6).
- [ ] **Marker i wersja:** `Wersja RelAI: 1.6.0` w `USTAWIENIA.md` projektu; wiersz
      `Budżet startu sesji` obecny; `startCost` zwraca pomiar zamiast `null`.
- [ ] **Raport migracji ma drogę powrotu** i została ona **przeczytana pod kątem wykonalności** —
      każdy krok wskazuje istniejący plik albo istniejące archiwum.
- [ ] Ślady pracy: wpis w `docs/DZIENNIK.md` **migrowanego projektu** oraz wpis w dzienniku RelAI,
      `docs/STATE.md` odświeżony w obu, katalogi tymczasowe usunięte, brak plików tymczasowych
      w obu repozytoriach.
- [ ] **Czego w tym etapie nie da się zweryfikować:** zachowania rotacji i budżetu w **świeżej
      sesji** cudzego projektu — do tego trzeba sesji pomiarowej, a ta czeka na `claude /login`
      (L-0032, odnoga `POMIAR_ODNOG`). Napisz to wprost w dzienniku zamiast udawać, że punktu nie
      ma.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: E5 → `ZREALIZOWANY <data>`, linia w dzienniku
   wdrożenia — **jedna, w formacie z E4**, zastępująca linię „E5 rozpoczęty".
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), z podpisem
   `RelAI (<model>) + <git config user.name>`. Sprawy czekające na człowieka wyprowadź do sekcji
   „Czeka na człowieka" w tej samej turze. **R5 dostaje status zamknięcia z liczbami z obu
   projektów** — albo zostaje otwarte z jawnym powodem, jeśli migracja objęła tylko jeden.
   Lekcje z etapu → `docs/LEKCJE.md`; powiedz jednym zdaniem, ile pozycji ma „Zasady aktywne"
   wobec limitu 15.
3. `docs/STATE.md` — nadpisz w kształcie z E3.
4. **Zamiast generacji `PROMPT_ETAP_6` — sekwencja zamknięcia planu (D-36).** E5 jest ostatnim
   etapem. Wczytaj skill `relai-planning` (narzędzie Skill — komenda wywołana wprost go nie ładuje)
   i wykonaj kroki 1–9 z sekcji „Zamknięcie planu", w kolejności stamtąd. Dwa punkty są blokujące
   i idą pierwsze: **rozstrzygnięcie otwartych bramek manualnych** (w `STATUS.md` są dziś cztery
   otwarte) i **rozstrzygnięcie otwartych odnóg** (cztery: `OPIS_REPO`, `POMIAR_ODNOG`,
   `REKOMENDACJA_MODELU`, `GUARD_PO_SCIEZCE`). Dopóki nie są rozstrzygnięte, **nigdzie nie piszesz,
   że plan jest zrealizowany**. Dalej: `STATE.md` → wpis zamykający „dowiezione vs plan" → status
   planu `ZREALIZOWANY` → przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` →
   linia „Aktywny plan" w `CLAUDE.md` (istniejący plik albo `Aktywny plan: brak` — nigdy martwy
   link) → podsumowanie 3–5 zdań.
5. Commit z conventional message (propozycja, nie samowola).
