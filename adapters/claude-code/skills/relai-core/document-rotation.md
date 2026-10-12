# relai-core — rotacja dokumentów

Zawartość: Kiedy i co · Czego nie ruszasz nigdy · Przebieg skryptem — dziennik i ryzyka · Przebieg ręczny — lekcje, mitygacje, ustawienia · Trzy wagi i cel · Komunikat zablokowanej rotacji · Dawniej.

Plik doczytywany skilla `relai-core`. Otwierasz go przed każdą rotacją: w kroku 2 rytuału
zamknięcia (`session-close.md`) oraz na starcie sesji po zgodzie człowieka na rotację
zaproponowaną z raportu hooka (`start-nets.md`). Oba wejścia uruchamiają **tę samą** procedurę.

## Kiedy i co

Żywe dokumenty rosną, a każda sesja czyta je od nowa. Rotacja przenosi najstarszą historię do
`docs/archiwum/`, **bajt w bajt**, i zostawia po niej linię-odsyłacz. W rytuale zamknięcia dzieje
się sama i **nie pyta o zgodę** — bo niczego nie kasuje ani nie streszcza. Pełna specyfikacja:
`SPEC_ARCHIWUM.md` (czytasz ją z `.claude/relai/templates/` **przed** rotacją, nie z pamięci);
poniżej jest to, co obowiązuje zawsze.

**Warunek — wiersz `Rotacja dokumentów` w `docs/USTAWIENIA.md`.** Kotwica na początku komórki
`Decyzja`: `wyłączona` (EN `off`) → **kończysz ten krok natychmiast**, bez sprawdzania progów
i bez słowa. Wartość nierozpoznana albo brak wiersza → traktujesz jak `wyłączona` i mówisz o tym
jednym zdaniem. Progi domyślne, gdy wiersz ich nie podaje:

| Dokument | Próg | Działanie po przekroczeniu |
|---|---|---|
| `docs/DZIENNIK.md` | 150 KB | najstarsze wpisy → `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` |
| `docs/LEKCJE.md` | 40 lekcji albo 50 KB | najstarsze pełne lekcje → `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` |
| sekcja „Stan otwartych ryzyk" | próg cząstkowy `ryzyka` z wiersza `Budżet startu sesji` (12 KB) | wiersze ryzyk `ZAMKNIĘTE` → `docs/archiwum/ryzyka/RYZYKA_<data>.md` |
| komórka „Mitygacja" ryzyka `ZMITYGOWANE` / `PRZYJĘTE ŚWIADOMIE` | 800 znaków, przy sekcji ryzyk ponad progiem | historia komórki → `docs/archiwum/ryzyka/MITYGACJE_<data>.md`; **wiersz zostaje w tabeli** |
| `docs/USTAWIENIA.md` | próg cząstkowy `ustawienia` z wiersza `Budżet startu sesji` (6 KB) | wiersze sekcji „Ustawienia wycofane" → `docs/archiwum/ustawienia/USTAWIENIA_<data>.md` |
| `docs/STATE.md` | 300 linii | **bez archiwum** — przepisujesz zwięźlej w kroku 1; fakt, który znika, a nie stoi nigdzie indziej, idzie do wpisu dziennika |

**Poniżej progu: cisza.** Zero komunikatów, zero pytań, katalog archiwum nie powstaje.
Gdy rotują i ryzyka, i dziennik, **ryzyka idą pierwsze**: ich sekcja należy do dolnej granicy
dziennika.

## Czego nie ruszasz nigdy

Sekcji „Czeka na człowieka" w dzienniku, sekcji „Zasady aktywne" w lekcjach, dziesięciu
najnowszych wpisów ani dwudziestu najnowszych lekcji. Zakres jest ciągły: pierwsza pozycja
nietykalna kończy zakres, nie przeskakujesz jej. **Najstarsza i najnowsza pozycja to daty
w nagłówkach, nie miejsca w pliku** (`SPEC_DZIENNIK.md`).

**Ryzyka są jedynym wyjątkiem od ciągłości:** schodzą z tabeli **wszystkie wiersze `ZAMKNIĘTE`**
naraz, bez względu na kolejność numerów, i tylko wtedy, gdy sekcja przekracza swój próg
cząstkowy. Status inny niż `ZAMKNIĘTE` znaczy „zostaje". Nagłówek tabeli zostaje zawsze, a pod
tabelą staje **jedna** linia-odsyłacz z numerami.

**Wpis, do którego prowadzi link z otwartej pozycji „Czeka na człowieka", jest przenoszalny** —
zamiast blokady działa **przepięcie linku** na plik archiwum w fazie 2. Wpis z pozycją
opatrzoną adnotacją `*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*` też jest
przenoszalny. Dziennik bez sekcji „Czeka na człowieka" → najpierw `waiting-migration.md`; do tego
czasu blokuje własna sekcja „Do zrobienia przez człowieka" wpisu.

## Przebieg skryptem — dziennik i ryzyka

Rotację dziennika i ryzyk wykonuje skrypt — **uruchamiasz go, nie odtwarzasz jego kroków**.
Kopię kładzie hook startu w `.claude/relai/tools/`; nie kopiujesz go ręcznie z katalogu pluginu.

```
node .claude/relai/tools/rotate.js plan ryzyka --prog <KB z ustawień>
node .claude/relai/tools/rotate.js wykonaj ryzyka --prog <KB z ustawień>
node .claude/relai/tools/rotate.js plan dziennik --prog <KB z ustawień>
node .claude/relai/tools/rotate.js wykonaj dziennik --prog <KB z ustawień>
```

1. **`plan`** — zakres, trzy wagi, próg i cel, nazwa pliku archiwum i suma fragmentu. Nic nie
   zapisuje. „ponizej progu” → koniec, cisza.
2. **`wykonaj`** — faza 1: zapis archiwum, odczyt **z dysku**, porównanie sum (SHA-256 z treści
   znormalizowanej do LF, 16 znaków hex); faza 2 dopiero po zgodności: przycięcie żywego pliku,
   linia-odsyłacz, przepięcie linków „Czeka na człowieka” do przeniesionych wpisów.
3. **Kod 3 („STOP: suma fragmentu …”)** → żywy plik jest nietknięty; mówisz o tym jednym zdaniem
   i niczego nie naprawiasz po cichu. **Kod 2** (brak pliku, kolejność wpisów mieszana, dziennik
   bez „Czeka na człowieka”, archiwum o tej nazwie z inną treścią) → przebieg ręczny wg
   `SPEC_ARCHIWUM.md`.
4. **Ślad w dzienniku** — do wpisu tej sesji przepisujesz z ostatniej linii wyjścia: co
   przeniesiono, dokąd, ile pozycji, sumę, rozmiar przed i po, ile linków przepięto i liczbę
   martwych kotwic (ma być zero; „UWAGA” w wyjściu → sprawdzasz linki i wpisujesz obie liczby).

`node .claude/relai/tools/rotate.js sprawdz <dziennik|ryzyka> --archiwum <plik>` porównuje sumę
fragmentu z żywego pliku z sumą istniejącego archiwum — np. po rotacji przerwanej między fazami.

**Brak `node`** → mówisz o tym jednym zdaniem i rotujesz ręcznie wg `SPEC_ARCHIWUM.md`, sekcja
„Przebieg — dwie fazy”.

## Przebieg ręczny — lekcje, mitygacje, ustawienia

Te trzy rotacje skrypt pomija; idą **tą samą** procedurą dwufazową z `SPEC_ARCHIWUM.md`, każda
z własną sumą i własnym plikiem archiwum, i **żadna nie dokłada własnego komunikatu** — meldują
się we wpisie dziennika tej sesji (L-0049). Sumę fragmentu i treści archiwum liczysz komendą,
nie okiem — fragment zapisany do pliku w katalogu roboczym:

```
node -e "const fs=require('fs'),c=require('crypto');const t=fs.readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n');console.log(c.createHash('sha256').update(t,'utf8').digest('hex').slice(0,16))" plik.md
```

- **Lekcje:** najstarsze pełne wpisy `L-NNNN` ponad dwudziestoma najnowszymi; odsyłacz na
  początku sekcji „Lekcje”.
- **Kompresja komórki „Mitygacja” — wiersz zostaje, historia schodzi.** Warunki (koniunkcja):
  sekcja ryzyk ponad progiem, komórka **ponad 800 znaków**, status z rdzeniem `zmitygowan` albo
  `przyj`/`zaakceptowan` **razem z** `świadom`. Cała treść komórki → `MITYGACJE_<data>.md` (tabela
  `| # | Mitygacja |`), w żywej komórce zostają **dosłowny cytat ostatniego zdania** sprzed
  `Zmierzone:`, `Historia: [MITYGACJE_…](…)` i niezmieniony człon `Zmierzone:`. Zdanie napisane od
  siebie zamiast cytatu jest defektem; komórka po kompresji nadal ponad 800 znaków → **STOP**
  i pytanie do człowieka. Ryzyka `OTWARTE` nie ruszasz. Pełna procedura: `SPEC_DZIENNIK.md`,
  sekcja „Kompresja komórki »Mitygacja«”.
- **Ustawienia:** plik ponad progiem cząstkowym **i** wiersze w „Ustawieniach wycofanych” →
  schodzą wszystkie naraz, pod tabelą sekcji jedna linia-odsyłacz. **Nigdy nie schodzi pięć
  wierszy:** `Język projektu`, `Profil projektu`, `Rotacja dokumentów`, `Budżet startu sesji`,
  `Przegląd spraw człowieka` — ich nieobecność wycisza mechanizmy, które je czytają. Wierszy żywej
  tabeli nie ruszasz.

## Trzy wagi i cel

Dokument ma trzy wagi i podajesz je **zawsze razem z progiem**: **waga całkowita** (cały plik,
końce linii do LF) = **część rotowalna** + **dolna granica osiągalna** (sekcje, które nie rotują,
dziesięć najnowszych wpisów, wpisy bez daty). **Wyzwalacz stoi na wadze całkowitej** — poniżej
progu cisza. **Cel też (D-88)**: najstarsze pozycje schodzą, aż cały żywy plik zejdzie poniżej
60% progu; ciąg kończy się wcześniej tylko na pozycji nietykalnej albo po wyczerpaniu części
rotowalnej. `rotate.js plan` wypisuje wszystkie cztery liczby.

## Komunikat zablokowanej rotacji

Powyżej progu, gdy rotacja nie zabrała wszystkiego, co mogła — komunikat w podsumowaniu sesji,
cztery części w tej kolejności:

1. ile wpisów przechodzi z ilu rotowalnych, ile nie przechodzi i ile ważą;
2. cztery liczby: waga całkowita = część rotowalna + dolna granica; obok próg;
3. powód i pary **„pozycja → wpis"** — wyłącznie w dzienniku **bez** sekcji „Czeka na człowieka”:
   treść pozycji, nagłówek blokowanego wpisu, wiek pozycji w dniach i ile wpisów przepuści jej
   zamknięcie; najwyżej pięć blokerów po dwie pozycje, reszta jako „i N dalszych”;
4. ile odblokowuje zamknięcie pierwszej pozycji, a ile zamknięcie wszystkich.

Gdy blokerów nie ma, a część rotowalna jest pusta (mniej niż dziesięć wpisów albo same świeże) —
ten sam kształt bez punktu 3, ze zdaniem, że plik odchudza zwięzłość wpisów, a podniesienie progu
jest decyzją człowieka. Tak samo, gdy sama dolna granica przekracza próg — to nie jest porażka
mechanizmu. Komunikat piszesz **ty**, w rytuale zamknięcia; to nadal **jeden** komunikat
(L-0036, L-0049).

## Dawniej

Rotacja działa od 1.2.0; ryzyka rotują od 1.6.0; kompresja komórek „Mitygacja”, rotacja ustawień,
trzy wagi i przepięcie linków zamiast blokady — od 1.7.0. Blokada wpisu linkowanego ze sprawy
człowieka zmieniła adres w 1.6.0 i zniknęła w 1.7.0: reguła linkowania do najstarszego wystąpienia
zatykała mechanizm idący od najstarszego — na dzienniku PolyFlow sprzed rotacji `FAKT` zakres
wynosił 0 wpisów ze 127, a bez tej blokady 117. Do 2.9.0 fazy rotacji wykonywał model ręcznie;
`rotate.js` przejął dziennik i ryzyka w odnodze AUDYT_SKILLI (S4).
