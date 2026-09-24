# relai-core — rotacja dokumentów

Plik doczytywany skilla `relai-core`. Otwierasz go przed każdą rotacją: w kroku 2 rytuału zamknięcia (`session-close.md`) oraz na starcie sesji po zgodzie człowieka na rotację zaproponowaną z raportu hooka.

### Rotacja dokumentów (krok 2 rytuału zamknięcia, od 1.2.0)

Żywe dokumenty rosną, a każda sesja czyta je od nowa. Rotacja przenosi najstarszą historię do
`docs/archiwum/`, **bajt w bajt**, i zostawia po niej linię-odsyłacz. Dzieje się sama i **nie
pyta o zgodę** — bo niczego nie kasuje ani nie streszcza. Pełna specyfikacja:
`SPEC_ARCHIWUM.md` (czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci);
poniżej jest to, co obowiązuje zawsze.

**Warunek — wiersz `Rotacja dokumentów` w `docs/USTAWIENIA.md`.** Kotwica na początku komórki
`Decyzja`: `wyłączona` (EN `off`) → **kończysz ten krok natychmiast**, bez sprawdzania progów
i bez słowa. Wartość nierozpoznana albo brak wiersza w projekcie z wersją 1.2.0 lub nowszą → traktujesz jak
`wyłączona` i mówisz o tym jednym zdaniem. Progi domyślne, gdy wiersz ich nie podaje:

| Dokument | Próg | Działanie po przekroczeniu |
|---|---|---|
| `docs/DZIENNIK.md` | 150 KB | najstarsze wpisy → `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` |
| `docs/LEKCJE.md` | 40 lekcji albo 50 KB | najstarsze pełne lekcje → `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` |
| sekcja „Stan otwartych ryzyk" | próg cząstkowy `ryzyka` z wiersza `Budżet startu sesji` (12 KB) | wiersze ryzyk `ZAMKNIĘTE` → `docs/archiwum/ryzyka/RYZYKA_<data>.md` |
| komórka „Mitygacja" ryzyka `ZMITYGOWANE` / `PRZYJĘTE ŚWIADOMIE` | 800 znaków, przy sekcji ryzyk ponad progiem | historia komórki → `docs/archiwum/ryzyka/MITYGACJE_<data>.md`; **wiersz zostaje w tabeli** |
| `docs/USTAWIENIA.md` | próg cząstkowy `ustawienia` z wiersza `Budżet startu sesji` (6 KB) | wiersze sekcji „Ustawienia wycofane" → `docs/archiwum/ustawienia/USTAWIENIA_<data>.md` |
| `docs/STATE.md` | 300 linii | **bez archiwum** — przepisujesz zwięźlej w kroku 1; fakt, który znika, a nie stoi nigdzie indziej, idzie do wpisu dziennika |

**Poniżej progu: cisza.** Zero komunikatów, zero pytań, katalog `docs/archiwum/dziennik/` nie
powstaje. Rotacja nie przypomina o swoim istnieniu.

**Czego nie ruszasz nigdy:** sekcji „Czeka na człowieka" w dzienniku, sekcji „Zasady aktywne"
w lekcjach, dziesięciu najnowszych wpisów ani dwudziestu najnowszych lekcji. Zakres jest ciągły:
pierwsza pozycja nietykalna kończy zakres, nie przeskakujesz jej. **Najstarsza i najnowsza pozycja
to daty w nagłówkach, nie miejsca w pliku** — kolejność wpisów jest własnością projektu i mechanizm
ją czyta, a nie narzuca (`SPEC_DZIENNIK.md`).

**Ryzyka (od 1.6.0) są jedynym wyjątkiem od ciągłości.** Sekcja „Stan otwartych ryzyk" nie jest
wpisem i do archiwum dziennika nie trafia nigdy — ma własny przebieg: schodzą z niej **wiersze
ryzyk `ZAMKNIĘTE`**, wszystkie naraz, bez względu na kolejność numerów. Bierzesz się za nie tylko
wtedy, gdy pozycja `ryzyka` przekracza swój próg cząstkowy **i** jest choć jedno ryzyko zamknięte;
status inny niż `ZAMKNIĘTE` (`ZMITYGOWANE`, `PRZYJĘTE ŚWIADOMIE`, `ZAWĘŻONE`) znaczy „zostaje"
i nie zgadujesz intencji. Nagłówek sekcji i wiersz nagłówkowy tabeli zostają zawsze, a pod tabelą
staje **jedna** linia-odsyłacz z numerami — po niej widać, że numer jest zajęty na zawsze.
To **nie jest** trzeci komunikat: rotacja ryzyk melduje się tylko we wpisie dziennika tej sesji,
tak jak pozostałe (L-0049).

**Kompresja komórki „Mitygacja" (od 1.7.0) — wiersz zostaje, historia schodzi.** Gdy sekcja ryzyk
jest ponad swoim progiem, komórka „Mitygacja" ma **ponad 800 znaków**, a status ryzyka niesie
rdzeń `zmitygowan` albo `przyj`/`zaakceptowan` **razem z** `świadom` — cała dzisiejsza treść
komórki idzie do `docs/archiwum/ryzyka/MITYGACJE_<data>.md` (tabela `| # | Mitygacja |`), a w żywej
komórce zostają **dwa człony**: **dosłowny cytat ostatniego zdania** sprzed `Zmierzone:` oraz
`Historia: [MITYGACJE_…](…)` i niezmieniony człon `Zmierzone:`. Trzy warunki są koniunkcją;
**wiek komórki warunkiem nie jest**. Zdanie napisane od siebie zamiast cytatu jest defektem.
Ryzyka `OTWARTE` nie ruszasz — jego komórka niesie powód, dla którego nie jest zamknięte.
Komórka po kompresji nadal ponad 800 znaków → **STOP** i pytanie do człowieka, żywa tabela
nietknięta. Pełna procedura: `SPEC_DZIENNIK.md`, sekcja „Kompresja komórki »Mitygacja«".

**Rotacja ustawień (od 1.7.0).** Gdy `docs/USTAWIENIA.md` przekracza swój próg cząstkowy
(`ustawienia`, 6 KB) **i** sekcja „Ustawienia wycofane" ma wiersze do wzięcia — schodzą **wszystkie
naraz** do `docs/archiwum/ustawienia/USTAWIENIA_<data>.md`, a pod tabelą sekcji staje jedna
linia-odsyłacz. **Nigdy nie schodzi pięć wierszy wypisanych z nazwy:** `Język projektu`,
`Profil projektu`, `Rotacja dokumentów`, `Budżet startu sesji`, `Przegląd spraw człowieka` — także
gdy stoją w „Ustawieniach wycofanych"; ich nieobecność wycisza mechanizmy, które je czytają.
Wierszy **żywej** tabeli nie ruszasz: niosą decyzję obowiązującą. Plik ponad progiem bez sekcji
„Ustawienia wycofane" → nie rotujesz; odchudza go zwięzłość komórki `Decyzja`.

Obie operacje idą **tą samą** procedurą dwufazową, każda z własną sumą kontrolną i własnym plikiem
archiwum, i **żadna nie dokłada własnego komunikatu** — meldują się we wpisie dziennika tej sesji,
jak rotacja ryzyk (L-0049).

**Blokada zmieniła adres w 1.6.0, a w 1.7.0 zniknęła.** Wpis z pozycją opatrzoną adnotacją
`*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*` **jest przenoszalny**, mimo że jego
własna sekcja „Do zrobienia przez człowieka" wygląda na otwartą. **Wpis, do którego prowadzi link
z otwartej pozycji „Czeka na człowieka", też jest przenoszalny** — od 1.7.0 nie jest z tego powodu
nietykalny; zamiast blokady działa **przepięcie linku** na plik archiwum (opis w fazie 2 niżej).
Powód jest zmierzony: reguła linkowania do najstarszego wystąpienia w mechanizmie idącym od
najstarszego zatykała go z definicji — na dzienniku PolyFlow sprzed rotacji `FAKT` zakres wynosił
0 wpisów ze 127, a bez tej blokady wynosi 117. Projekt, który nie ma jeszcze sekcji „Czeka na
człowieka", działa po staremu — blokuje własna sekcja wpisu, dopóki nie przejdzie procedury
wyprowadzenia (`waiting-migration.md`).

**Przebieg jest dwufazowy** i kolejność jest tu całym zabezpieczeniem:

1. **Faza 1 — kopia i dowód.** Wyznacz ciągły zakres najstarszych pozycji (tyle, żeby żywy plik
   zszedł poniżej 60% progu). Policz sumę kontrolną tego fragmentu w żywym pliku. Zapisz plik
   archiwum. Odczytaj go **z dysku**, policz sumę treści spod separatora i porównaj. Suma:
   SHA-256 z treści znormalizowanej do LF (L-0033), pierwsze 16 znaków hex.
2. **Sumy różne → STOP.** Żywy plik zostaje nietknięty, mówisz o tym jednym zdaniem. Niczego nie
   naprawiasz po cichu.
3. **Faza 2 — przycięcie**, dopiero po zgodności sum: usuń fragment z żywego pliku, wstaw
   linię-odsyłacz na początku sekcji („Wpisy" / „Lekcje"), **przepnij linki pozycji „Czeka na
   człowieka" prowadzące do przeniesionych wpisów** (przed kotwicą staje ścieżka pliku archiwum;
   tekst linku, treść pozycji i data zostają nietknięte), zapisz. Przepięcie dotyczy wyłącznie
   rotacji dziennika i idzie **przed** zapisem. Policz przy tym pozycje z linkiem do nieistniejącej
   kotwicy — ma ich być **zero**.
4. **Ślad w dzienniku** — do wpisu tej sesji (krok 3 rytuału): co przeniesiono, dokąd, ile
   pozycji, suma kontrolna, rozmiar przed i po, ile linków przepięto.

**Próg liczony ponad nietykalnymi (od 1.7.0).** Dokument ma trzy wagi i podajesz je **zawsze razem
z progiem**, w tej kolejności: **waga całkowita** (cały plik, końce linii do LF) = **część
rotowalna** + **dolna granica osiągalna**. Dolna granica dziennika to sekcje, które nie rotują
nigdy („Stan otwartych ryzyk", „Czeka na człowieka", nagłówki, linie-odsyłacze), dziesięć
najnowszych wpisów i wpisy bez daty w nagłówku. **Wyzwalacz zostaje na wadze całkowitej** — poniżej
progu cisza. **Cel stoi na wadze całkowitej (D-88)**: bierzesz najstarsze pozycje, aż **cały żywy
plik** zejdzie poniżej 60% progu; ciąg kończy się wcześniej tylko na pozycji nietykalnej albo po
wyczerpaniu części rotowalnej — trzy wagi mówią, ile da się wziąć, nie kiedy przestać. Gdy rotują
i ryzyka, i dziennik, **ryzyka idą pierwsze**: ich sekcja należy do dolnej granicy dziennika.

**Powyżej progu, gdy rotacja nie zabrała wszystkiego, co mogła → komunikat zablokowanej rotacji**
w podsumowaniu sesji. Cztery części, zawsze w tej kolejności:

1. ile wpisów przechodzi z ilu rotowalnych, ile nie przechodzi i ile ważą;
2. cztery liczby: waga całkowita = część rotowalna + dolna granica; obok próg;
3. powód i pary **„pozycja → wpis"** — treść pozycji, nagłówek blokowanego wpisu, **wiek pozycji
   w dniach** i **ile wpisów przepuści jej zamknięcie**; najwyżej **pięć** blokerów po **dwie**
   pozycje, reszta jako „i N dalszych blokerów tej samej natury";
4. ile odblokowuje zamknięcie pierwszej pozycji, a ile zamknięcie wszystkich.

Pary wypisujesz **tylko** w projekcie **bez** sekcji „Czeka na człowieka" — tam blokuje własna
sekcja wpisu. Wpisu linkowanego z otwartej pozycji „Czeka na człowieka" **nie wymieniasz**: od
1.7.0 nie blokuje. Gdy blokerów nie ma, a **część rotowalna jest pusta** (mniej niż dziesięć
wpisów albo same świeże) — ten sam kształt bez punktu 3, ze zdaniem, że plik odchudza zwięzłość
wpisów, nie archiwum, a podniesienie progu jest decyzją człowieka. Tak samo, gdy sama **dolna
granica przekracza próg**: to nie jest porażka mechanizmu i nie nazywasz jej porażką.

Cisza obowiązuje **poniżej progu** i jest nienaruszalna; powyżej progu milczenie ukryłoby zatkany
mechanizm. Komunikat piszesz **ty**, w rytuale zamknięcia — hook startu go nie produkuje. To nadal
**jeden** komunikat: rotacja ryzyk nie dokłada własnego, a limit „Zasad aktywnych" zostaje przy
swoim adresie w kroku 1 (L-0036, L-0049).

**To jest krok 2 rytuału zamknięcia, czyli wejście pierwsze.** Wejście drugie — start sesji — jest
w `SKILL.md`, sekcja „Rotacja na starcie sesji (od 1.6.0)", i uruchamia **dokładnie tę samą** procedurę.
