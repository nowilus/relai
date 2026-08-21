# SPEC — `docs/archiwum/dziennik/`, `docs/archiwum/lekcje/` i `docs/archiwum/ryzyka/`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Pliki archiwum powstają **w języku projektu**
(`docs/archiwum/journal/JOURNAL_<od>_<do>.md`, `docs/archiwum/lessons/LESSONS_<od>_<do>.md`
i `docs/archiwum/risks/RISKS_<data>.md` w projekcie angielskim).

## Rola

Magazyn historii, która wypadła z żywych dokumentów, żeby te mieściły się w kontekście sesji.
Archiwum odpowiada na pytanie: *„gdzie jest to, czego już nie widzę w dzienniku"*.

Archiwum jest **kopią bajt w bajt** (D-18). Nic nie jest streszczane, poprawiane ani kasowane —
rotacja przenosi treść i zostawia po niej odsyłacz. Historia projektu ma się składać w całość:
żywy dokument + archiwa w kolejności dat = pełny oryginał.

## Odbiorca

Agent, który sięga po starszy okres (najczęściej przez `/relai-changelog`, `/relai-audit` albo
pytanie użytkownika o historię), oraz człowiek szukający, kiedy coś ustalono. Przy starcie sesji
archiwum **nie jest czytane** — to jest cały sens jego istnienia.

## Kiedy powstaje

Rotacja ma **dwa wejścia** i oba uruchamiają **ten sam** mechanizm dwufazowy z sumą kontrolną —
drugiego nie piszesz. Różnią się wyłącznie momentem i warunkiem wyzwolenia.

**Wejście 1 — rytuał zamknięcia sesji** („kończymy na dziś"), gdy żywy dokument przekracza próg
z `docs/USTAWIENIA.md`. Poniżej progu nie dzieje się nic i nie pada ani jedno słowo — katalog
archiwum też wtedy nie powstaje. Rotacja nie jest osobną komendą i nie przypomina o swoim
istnieniu.

**Wejście 2 — start sesji** (od 1.6.0), gdy spełnione są **wszystkie trzy** warunki:

1. pomiar warstwy startowej pokazał **przekroczenie budżetu** (wiersz `Budżet startu sesji`
   w `docs/USTAWIENIA.md`, mechanizm z `SPEC_USTAWIENIA.md`),
2. **rotacja jest włączona** (wiersz `Rotacja dokumentów` — to dwa niezależne wyłączniki i mają
   pozostać niezależne),
3. sesja jest **interaktywna**.

Powód drugiego wejścia jest arytmetyczny: przy zamknięciu sesji kontekst jest już wykupiony,
a przy starcie rotacja jeszcze coś oszczędza. Wejście pierwsze **zostaje bez zmian** — projekt
poniżej budżetu albo z wyłączonym budżetem rotuje dokładnie tak jak dotąd.

**Czym się nie różnią:** ani jednym krokiem przebiegu. Te same dwie fazy, ta sama suma kontrolna,
ta sama linia-odsyłacz, ten sam ślad we wpisie dziennika tej sesji. **Dziesięć najnowszych wpisów
zostaje nietykalne także tutaj** — start sesji nie jest trybem awaryjnym, w którym reguły są
luźniejsze.

**Sesja nieinteraktywna** (`claude -p`, hook w CI, agent w tle) → **wejście 2 nie rusza**. Zmiana
w repozytorium bez człowieka przy klawiaturze jest zakazana; raport z pomiaru pada, propozycja
rotacji nie. Rytuał zamknięcia zostaje w takim trybie jedynym wejściem rotacji.

**Rotacja wyłączona, budżet włączony** → pomiar liczy i raportuje, ale **nie proponuje rotacji**;
zamiast propozycji pada pół zdania, że wyłącznik jest w `USTAWIENIA.md`. **Budżet wyłączony,
rotacja włączona** → pomiaru nie ma w ogóle, więc wejście 2 nie ma czym się wyzwolić, a wejście 1
działa normalnie.

Progi domyślne (`SZACUNEK` — skalibrowane 2026-08-12 na zmierzonych projektach, patrz
`SPEC_USTAWIENIA.md`):

| Dokument | Próg | Co się dzieje po przekroczeniu |
|---|---|---|
| `docs/DZIENNIK.md` | **150 KB** | najstarsze wpisy → `docs/archiwum/dziennik/` |
| `docs/LEKCJE.md` | **40 lekcji albo 50 KB** (co nastąpi wcześniej) | pełne wpisy najstarszych lekcji → `docs/archiwum/lekcje/` |
| sekcja „Stan otwartych ryzyk" | **próg cząstkowy `ryzyka`** z wiersza `Budżet startu sesji` (domyślnie 12 KB) | wiersze ryzyk `ZAMKNIĘTE` → `docs/archiwum/ryzyka/` |
| `docs/STATE.md` | **300 linii** | **nie jest archiwizowany** — patrz sekcja „STATE" |

Wiersz ryzyk **nie dokłada trzeciego wejścia ani własnego komunikatu** (L-0049): rotacja ryzyk
dzieje się w tych samych dwóch momentach co pozostałe, a próg cząstkowy mówi jedynie, **czy jest
co brać** — patrz „Ryzyka" w sekcji „Wybór treści".

## Ścieżki i nazewnictwo

| Co | Ścieżka |
|---|---|
| wpisy dziennika | `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` |
| pełne lekcje | `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` |
| wiersze ryzyk zamkniętych | `docs/archiwum/ryzyka/RYZYKA_<data-rotacji>.md` |

`<data-od>`/`<data-do>` to daty pierwszego i ostatniego przeniesionego wpisu (`RRRR-MM-DD`).
`<numer-od>`/`<numer-do>` to numery pierwszej i ostatniej przeniesionej lekcji (`L-0001`).
Zakres w nazwie jest **domknięty obustronnie** i zawsze ciągły — patrz „Wybór treści".

**Ryzyka mają w nazwie datę rotacji, nie zakres numerów** — i to jest różnica celowa. Kryterium
wyboru jest tu **status**, nie wiek, więc przeniesiony zbiór bywa nieciągły (`R1, R3, R4, R6`).
Nazwa `RYZYKA_R1_R6.md` obiecywałaby wtedy ciągłość, której nie ma, a nazwa z datą nie obiecuje
niczego poza tym, co jest prawdą: to jest to, co zeszło tego dnia. Numery przeniesionych ryzyk
wypisuje linia metryczna w środku pliku oraz linia-odsyłacz w żywej tabeli.

Nazwa pliku nie zawiera kwartału ani wersji: zakres w nazwie ma wystarczyć do odnalezienia okresu
bez otwierania pliku.

## Struktura pliku archiwum

1. **Nagłówek** — `# ARCHIWUM DZIENNIKA — <projekt> · <od> … <do>` (dla lekcji:
   `# ARCHIWUM LEKCJI — <projekt> · <od> … <do>`; dla ryzyk: `# ARCHIWUM RYZYK — <projekt> ·
   <data rotacji>`).
2. **Linia metryczna** — data rotacji, plik źródłowy, liczba przeniesionych pozycji, suma
   kontrolna przeniesionej treści. W archiwum ryzyk dochodzi **wyliczenie numerów** przeniesionych
   ryzyk — to ono zastępuje zakres, którego nie ma w nazwie pliku.
3. **Jedno zdanie o naturze pliku** — że treść niżej jest kopią bajt w bajt i nic nie zostało
   streszczone.
4. **Separator `---`**, a pod nim **przeniesiona treść bez żadnej zmiany** — łącznie z nagłówkami
   `###`, pustymi liniami i literówkami oryginału.

Plik archiwum jest **append-only w obrębie zakresu**: kolejna rotacja tworzy **nowy** plik, nie
dopisuje do istniejącego. Wyjątek: osierocona kopia po rotacji przerwanej między fazami
(sekcja „Przypadki brzegowe").

## Linia-odsyłacz w żywym pliku

W miejscu usuniętej treści zostaje **jedna linia cytatu**, na początku sekcji (dziennik: pierwsza
rzecz w sekcji „Wpisy"; lekcje: pierwsza rzecz w sekcji „Lekcje"), przed najstarszą pozostawioną
pozycją:

```markdown
> Wpisy z okresu 2026-03-02 … 2026-06-28 (14 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md](archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md)
> — przeniesione 2026-08-12, suma kontrolna `a1b2c3d4e5f60718`.
```

Kolejne rotacje dokładają kolejne linie **pod poprzednimi**, w porządku chronologicznym. Linia
odsyłacza jest jedynym śladem po przeniesionej treści — streszczenia okresu **nie piszesz**
(streszczenie kłamie tym, czego nie zmieści, a od historii jest archiwum).

**W tabeli ryzyk** linia-odsyłacz stoi **pod tabelą**, nie w niej, i wymienia numery zamiast
zakresu dat:

```markdown
> Ryzyka zamknięte R1, R3, R4, R6 (4 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `a1b2c3d4e5f60718`.
```

Jedna linia na rotację, nie jedna na ryzyko — inaczej tabela odchudzona z sześciu wierszy zyskałaby
sześć linii i cała operacja byłaby bez sensu. Wyliczenie numerów w tej linii jest tym, co utrzymuje
**ciągłość numeracji**: `SPEC_DZIENNIK.md` zabrania użycia numeru ponownie, a numer zarchiwizowany
musi zostać widoczny w żywym pliku, żeby nikt go nie odzyskał w dobrej wierze.

## Suma kontrolna — jak liczona

SHA-256 z treści **znormalizowanej do końców linii LF** (L-0033), pierwsze 16 znaków hex. Node bez
zależności:

```bash
node -e "const fs=require('fs'),c=require('crypto');const t=fs.readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n');console.log(c.createHash('sha256').update(t,'utf8').digest('hex').slice(0,16))" plik.md
```

Sumę liczysz z **dokładnie tego fragmentu**, który wędruje: od pierwszego znaku nagłówka
pierwszego przenoszonego wpisu do ostatniego znaku ostatniego, bez linii pustej zamykającej
fragment. Ta sama definicja obowiązuje po stronie archiwum (treść pod separatorem `---`) —
inaczej porównanie faz nic nie dowodzi.

## Wybór treści — co wolno przenieść

Zasada wspólna dla **dziennika i lekcji**: **zakres jest ciągły i liczony od najstarszej pozycji**.
Pierwsza pozycja nietykalna **przerywa** ciąg — nie przeskakujesz jej, żeby zabrać kolejną.
Archiwum ma być nieprzerwanym kawałkiem historii, a nie sitem. **Ryzyka są jedynym wyjątkiem** —
tam kryterium jest status, nie wiek; patrz podsekcja „Ryzyka".

**Dziennik** — nietykalne są:

- sekcja **„Stan otwartych ryzyk"** (nie jest wpisem, więc do archiwum dziennika nie trafia nigdy;
  ma własną drogę opisaną niżej),
- sekcja **„Czeka na człowieka"** (od 1.6.0 — tak samo nie jest wpisem i nie rotuje),
- **dziesięć najnowszych wpisów** `SZACUNEK`,
- **każdy wpis, do którego prowadzi link z otwartej pozycji sekcji „Czeka na człowieka"** —
  niezależnie od wieku.

### Blokada liczy się z sekcji „Czeka na człowieka" (od 1.6.0)

Do 1.5.2 blokowała **własna** sekcja wpisu: wpis z nierozstrzygniętą pozycją „Do zrobienia przez
człowieka" zostawał w żywym pliku na zawsze. Skutek był mierzalny i odwrotny do zamierzonego —
w dwóch żywych projektach (JiraManager 1,00 MB, PolyFlow 571 KB) rotacja **nigdy nie ruszyła**,
bo blokował ją **pierwszy** wpis dziennika, a zakres jest ciągły od najstarszej pozycji `FAKT`.

Od 1.6.0 adres blokady jest jeden:

- **Blokujące są wyłącznie wpisy, do których prowadzi link z pozycji sekcji „Czeka na człowieka"**
  — i tylko dopóki ta pozycja jest w sekcji, czyli dopóki sprawa jest otwarta.
- **Wpis z pozycją wyprowadzoną jest przenoszalny** — także wtedy, gdy jego własna sekcja „Do
  zrobienia przez człowieka" wygląda na otwartą. Adnotacja `*(wyprowadzone RRRR-MM-DD → sekcja
  „Czeka na człowieka")*` znaczy, że sprawa ma inny dom (`SPEC_DZIENNIK.md`).
- **Wpis z pozycją rozstrzygniętą jest przenoszalny** — bez zmian wobec 1.5.2, patrz sekcja niżej.
- Sekcja z treścią „—" jest pusta i niczego nie blokuje.

Sprawa człowieka nie może zniknąć w archiwum — dlatego blokada nie znika, tylko **zmienia adres**
na ten, który sesja czyta na starcie.

### Jak poznać pozycję rozstrzygniętą (od 1.5.2)

Pozycja jest rozstrzygnięta, gdy ma adnotację złożoną z **rdzenia z zamkniętej listy** i **daty
`RRRR-MM-DD`**. Forma gramatyczna jest dowolna (rodzaj, liczba, przypadek) — liczy się rdzeń:

| Rdzeń | Przykłady wystąpień |
|---|---|
| `rozstrzygni` | *(rozstrzygnięte 2026-08-12 — …)*, *(rozstrzygnięta 2026-08-12)* |
| `zrobion` | *(zrobione 2026-08-07 — patrz kolejny wpis)* |
| `zaakceptowan` | *(zaakceptowany 2026-08-08)* |
| `domkni` | *(domknięte 2026-08-08 — …)* |
| `wykonan` | *(wykonane 2026-09-01)* |
| `anulowan` | *(anulowane 2026-09-01 — powód)* |

**Nie są rozstrzygnięciem** — nawet z datą: `czeka`, `w toku`, `odłożone`, `zaplanowane`,
`przypomnieć`, `do sprawdzenia`. Lista rdzeni jest **zamknięta**: dopisek spoza niej znaczy
„pozycja otwarta", więc wpis zostaje w żywym pliku. Cisza jest bezpieczna — najgorszym skutkiem
jest dziennik większy, niż musi być; najgorszym skutkiem fałszywego rozpoznania byłaby sprawa
człowieka schowana w archiwum.

Adnotacja bez daty nie liczy się jako rozstrzygnięcie — data jest tym, co odróżnia zamknięcie od
komentarza. W projekcie anglojęzycznym rdzenie czytasz w języku projektu (`resolved`, `done`,
`accepted`, `closed`, `cancelled`); zasada zamkniętej listy i wymóg daty są takie same.

**Lekcje** — nietykalne są:

- cała sekcja **„Zasady aktywne"** (destylat czytany na starcie — nigdy nie jest archiwizowany),
- **dwadzieścia najnowszych lekcji** `SZACUNEK`,
- sekcja „Lekcje zwinięte", jeśli istnieje — ta ma własną drogę do archiwum opisaną
  w `SPEC_LEKCJE.md` (kompresja), i rotacja jej nie dotyka.

Ile zabrać: najstarsze pozycje po kolei, aż żywy plik zejdzie **poniżej 60% progu** — nie do
samego progu, bo rotacja wywoływana przy każdym zamknięciu sesji byłaby wtedy zjawiskiem
codziennym. Ciąg kończy się wcześniej, gdy trafi na pozycję nietykalną.

### Ryzyka (od 1.6.0)

**Co schodzi:** wiersze tabeli „Stan otwartych ryzyk" ze statusem `ZAMKNIĘTE` — **wszystkie naraz**,
bez względu na datę zamknięcia i bez względu na to, czy tworzą ciągły zakres numerów. Ryzyko
zamknięte przestało być ryzykiem; trzyma je w tabeli wyłącznie D-18, a archiwum spełnia D-18 lepiej
niż wiersz czytany przy każdym starcie.

**Co jest nietykalne:**

- każde ryzyko o statusie **innym niż `ZAMKNIĘTE`** — otwarte, zmitygowane, przyjęte świadomie,
  zawężone. Zamknięcie poznajesz po statusie zaczynającym się od `ZAMKNIĘTE` (EN: `CLOSED`);
  status spoza tej listy znaczy „zostaje" i mechanizm nie zgaduje intencji (L-0025). Zmierzone
  2026-08-21 na trzech projektach `FAKT`: w użyciu jest jedenaście różnych brzmień statusu, w tym
  `ZMITYGOWANE`, `PRZYJĘTE ŚWIADOMIE`, `ZAWĘŻONE` i `ZMATERIALIZOWAŁO SIĘ` — żadne z nich nie
  znaczy „zamknięte",
- **nagłówek i wiersz nagłówkowy tabeli** — sekcja nigdy nie znika, także wtedy, gdy po rotacji
  zostaje pusta. Tabela bez wierszy z linią-odsyłaczem pod spodem jest informacją; brak sekcji
  zmuszałby kolejną sesję do zgadywania.

**Kiedy w ogóle bierzesz się za ryzyka:** gdy pozycja `ryzyka` przekracza swój **próg cząstkowy**
z wiersza `Budżet startu sesji` (domyślnie 12 KB) **i** w tabeli jest choć jedno ryzyko
`ZAMKNIĘTE`. Próg cząstkowy mówi **czy jest co brać**, nie **kiedy się odezwać** — wyzwalaczem
pozostają dwa wejścia rotacji opisane wyżej, a rotacja ryzyk nie dokłada ani jednego komunikatu
(L-0036, L-0049). Poniżej progu cząstkowego nie rotujesz ryzyk, nawet gdy dziennik właśnie rotował.

**Ile zabrać:** wszystkie zamknięte, jednym przebiegiem. Reguła „poniżej 60% progu" **nie
obowiązuje** — zbiór jest wyznaczony statusem, a nie objętością, więc nie ma czego dozować.

## Przebieg — dwie fazy, w tej kolejności

**Faza 1 — kopia i dowód:**

1. Wyznacz zakres wg reguł wyżej. Zakres pusty → koniec, cisza.
2. Policz sumę kontrolną wyznaczonego fragmentu **w żywym pliku**.
3. Zapisz plik archiwum (nagłówek + linia metryczna + zdanie + `---` + treść).
4. Odczytaj zapisany plik **z dysku**, wytnij treść spod separatora i policz jej sumę kontrolną.
5. Sumy różne → **STOP**. Żywy plik zostaje nietknięty, powiedz o tym jednym zdaniem. Nie
   próbujesz naprawiać po cichu.

**Faza 2 — przycięcie (dopiero po zgodności sum):**

6. Usuń przeniesiony fragment z żywego pliku i wstaw w jego miejsce linię-odsyłacz.
7. Zapisz żywy plik.
8. Rotacja idzie do **wpisu dziennika tej sesji**: co przeniesiono, dokąd, ile pozycji, suma
   kontrolna, rozmiar przed i po. Wpis powstaje po rotacji, więc trafia już do przyciętego pliku.

Przerwanie między fazami zostawia oryginał kompletny — to jest cały powód, dla którego kolejność
jest taka, a nie odwrotna.

**Ryzyka przechodzą dokładnie tę samą procedurę** — drugiej nie piszesz. „Fragment" znaczy tam
zbiór wybranych wierszy tabeli, sklejony w kolejności, w jakiej stoją w żywym pliku, po jednym
wierszu na linię. Ta sama kolejność obowiązuje po stronie archiwum, inaczej porównanie sum nic nie
dowodzi. Rotacja dziennika i rotacja ryzyk w jednej sesji to **dwa niezależne przebiegi** z dwiema
sumami kontrolnymi — nie mieszasz ich treści w jednym pliku archiwum.

## STATE — inny tryb, bez archiwum

`STATE.md` jest **nadpisywany**, więc z definicji nie ma historii do przeniesienia; archiwum
`docs/archiwum/state/` nie istnieje i nie powstaje. Powyżej progu (300 linii) robisz jedno:
przy nadpisywaniu `STATE.md` w rytuale zamknięcia sesji **piszesz go zwięźlej**, do jednego ekranu
zgodnie z `SPEC_STATE.md`.

Twarda granica: fakt, który przy tym znika ze `STATE.md`, a nie stoi w żadnym innym dokumencie,
**przepisujesz do wpisu dziennika tej sesji**. Bez tego skrócenie STATE byłoby kasowaniem (D-18),
a nie porządkowaniem.

## Przypadki brzegowe

| Sytuacja | Rozstrzygnięcie |
|---|---|
| Żywy plik poniżej progu | Nic się nie dzieje, zero komunikatów, katalog archiwum nie powstaje |
| Rotacja wyłączona w `USTAWIENIA.md` | Progu nawet nie sprawdzasz; cisza |
| Powyżej progu, ale **cały** zakres nietykalny (same świeże wpisy albo wpisy linkowane z otwartych pozycji „Czeka na człowieka") | Nie rotujesz i **mówisz o tym jednym zdaniem** w podsumowaniu sesji, z powodem. Cisza jest zarezerwowana dla stanu poniżej progu — powyżej progu milczenie ukryłoby zatkany mechanizm |
| Dziennik ponad progiem, ale wpisów jest **mniej niż dziesięć** | Nie rotujesz — dziesięć najnowszych wpisów jest nietykalne niezależnie od rozmiaru pliku. **Mówisz o tym jednym zdaniem z powodem**: problemem są długie wpisy, a nie ich liczba, i rozwiązuje go zwięzłość, nie archiwum |
| Sesja nieinteraktywna, budżet przekroczony | Wejście 2 (start sesji) nie rusza; raport pomiaru pada, propozycja rotacji nie. Wejście 1 (zamknięcie sesji) działa bez zmian |
| Wpis ma otwartą pozycję „Do zrobienia przez człowieka", ale **bez** adnotacji o wyprowadzeniu, a sekcji „Czeka na człowieka" w pliku nie ma (projekt sprzed 1.6.0) | Blokuje jak dotąd — reguła 1.5.2 obowiązuje, dopóki projekt nie przejdzie procedury wyprowadzenia (skill `relai-core`). Nie rotujesz „na zapas" i nie zakładasz sekcji przy okazji rotacji |
| Rotacja przerwana między fazą 1 a 2 | Oryginał nietknięty; osierocony plik archiwum **nadpisujesz** przy następnej rotacji tego samego zakresu. Nie tworzysz drugiego pliku o tej samej nazwie z sufiksem |
| Plik archiwum o tej nazwie już istnieje, a zakres jest **inny** | Nazwa kolizyjna znaczy, że coś poszło nie tak z wyznaczeniem zakresu → **STOP**, żywy plik nietknięty, pytanie do człowieka |
| Wpis dziennika bez daty w nagłówku (dokument sprzed RelAI, po adopcji) | Nie podlega rotacji — zakres nazwy pliku musi wynikać z dat, a nie ze zgadywania (L-0025) |
| Pozycja `ryzyka` ponad progiem, ale **żadne** ryzyko nie jest zamknięte | Nie rotujesz ryzyk. Pozycja jest gruba przez ryzyka żywe, a te zostają — **mówisz o tym jednym zdaniem**, bo to jest przypadek „budżet pęka przez pozycję, której nie da się skrócić" (sekcja 8 planu): decyzja o podniesieniu progu należy do człowieka |
| Wszystkie ryzyka zamknięte — tabela po rotacji byłaby pusta | Rotujesz normalnie. Zostaje nagłówek sekcji, wiersz nagłówkowy tabeli i linia-odsyłacz pod nią; pustej sekcji nie kasujesz i nie zastępujesz zdaniem „brak ryzyk" |
| Ryzyko zamknięte, do którego prowadzi link z otwartej pozycji „Czeka na człowieka" | Schodzi do archiwum jak każde inne. Blokada z sekcji „Czeka na człowieka" dotyczy **wpisów**, nie wierszy tabeli — sprawa człowieka nie znika, bo jej własna pozycja zostaje w żywym pliku |
| Ryzyko zamknięte i **ponownie otwarte** (status wrócił do `OTWARTE`) | Zostaje w żywej tabeli; kryterium czyta się ze stanu na dziś, nie z historii statusów. Jeśli zdążyło już zejść do archiwum, wraca jako **nowy numer** z odsyłaczem do archiwum w komórce „Mitygacja" — numeru nie odzyskujesz |
| Projekt bez `docs/archiwum/` | Katalog powstaje w fazie 1, razem z pierwszym plikiem — nie na zapas (D-11) |

## Zakazy

- Nie streszczasz, nie skracasz i nie poprawiasz przenoszonej treści — kopia jest bajt w bajt.
  Dotyczy też wiersza ryzyka: do archiwum idzie **dzisiejsza** treść komórki „Mitygacja", nawet gdy
  wydaje się za długa. Skracanie jest osobną operacją i robi się je **przed** rotacją, w żywym
  pliku (`SPEC_DZIENNIK.md`), nigdy po drodze do archiwum.
- Nie kasujesz niczego przed weryfikacją sum kontrolnych (faza 2 nie rusza bez fazy 1).
- Nie archiwizujesz sekcji „Czeka na człowieka" ani „Zasady aktywne"; z sekcji „Stan otwartych
  ryzyk" schodzą **wyłącznie wiersze ryzyk `ZAMKNIĘTE`** — nigdy nagłówek, nigdy cała sekcja,
  nigdy ryzyko o innym statusie.
- Nie zmieniasz numeru ryzyka przy przenoszeniu i nie odzyskujesz numeru zwolnionego przez
  archiwizację — numeracja jest ciągła i nigdy nie wraca (`SPEC_DZIENNIK.md`).
- Nie przenosisz wpisu, do którego prowadzi link z **otwartej** pozycji sekcji „Czeka na człowieka".
- Nie wyprowadzasz pozycji „przy okazji" rotacji — wyprowadzenie jest osobną, opisaną procedurą
  z liczeniem przed i po (skill `relai-core`), a rotacja tylko czyta jej wynik.
- Nie pytasz o zgodę na rotację i nie meldujesz jej poniżej progu — mechanizm ma być niewidoczny,
  dopóki nie zadziała.
- Nie czytasz archiwum w rytuale startu sesji.

## Przykład — plik archiwum dziennika

```markdown
# ARCHIWUM DZIENNIKA — Parkly · 2026-03-02 … 2026-06-28

Zarchiwizowano: 2026-08-12 · Źródło: `docs/DZIENNIK.md` · Wpisów: 2 · Suma kontrolna
przeniesionej treści: `a1b2c3d4e5f60718` (SHA-256, pierwsze 16 znaków, końce linii LF)

Treść poniżej jest kopią **bajt w bajt** wpisów usuniętych z żywego dziennika — nic nie zostało
streszczone ani zmienione (D-18).

---

### 2026-03-02 — Rezerwacja miejsca i potwierdzenie mailem

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Formularz rezerwacji na wybrany dzień, blokada podwójnej rezerwacji tego samego miejsca.
- Mail potwierdzający wysyłany przez SMTP firmy.

**Zweryfikowane — jak dokładnie:**
- 9 testów jednostkowych (`npm test`), wszystkie zielone.
- Test ręczny: rezerwacja na 2026-03-05, mail dotarł w ~15 s.

**Świadomie odłożone:**
- Odwoływanie rezerwacji — osobne zadanie.

**Do zrobienia przez człowieka:**
- Potwierdzić nadawcę maili z działem IT. *(rozstrzygnięte 2026-03-04 — nadawca `parkly@firma.pl`)*

### 2026-06-28 — Raport obłożenia dla administracji

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Widok obłożenia parkingu na dowolny dzień, eksport do CSV.

**Zweryfikowane — jak dokładnie:**
- Porównanie raportu z ręcznym zliczeniem dla trzech dni (12/12, 9/9, 15/15 rezerwacji).

**Świadomie odłożone:**
- Raport miesięczny dla zarządu — czeka na format uzgodniony z księgowością.

**Do zrobienia przez człowieka:**
- —
```

Żywy `docs/DZIENNIK.md` po tej rotacji zaczyna sekcję „Wpisy" tak:

```markdown
## Wpisy

> Wpisy z okresu 2026-03-02 … 2026-06-28 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md](archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md)
> — przeniesione 2026-08-12, suma kontrolna `a1b2c3d4e5f60718`.

### 2026-07-04 — Lista oczekujących
…
```

## Przykład — plik archiwum lekcji

```markdown
# ARCHIWUM LEKCJI — Parkly · L-0001 … L-0002

Zarchiwizowano: 2026-08-12 · Źródło: `docs/LEKCJE.md` · Lekcji: 2 · Suma kontrolna
przeniesionej treści: `77f0c1de9a4b2035` (SHA-256, pierwsze 16 znaków, końce linii LF)

Treść poniżej jest kopią **bajt w bajt** wpisów usuniętych z żywego rejestru lekcji. Zasady z tych
lekcji **nadal obowiązują** — żyją w sekcji „Zasady aktywne" pliku `docs/LEKCJE.md`.

---

### L-0001 — Dołożona zależność bez pytania · 2026-03-08 · ZGRADUOWANA 2026-03-19

- **Trigger:** dodałem `date-fns` do `package.json`, żeby sformatować jedną datę.
- **Przyczyna:** założyłem, że drobna zależność jest neutralna.
- **Zasada:** przed dodaniem zależności przeszukaj repo pod kątem istniejącego rozwiązania.
- **Źródło:** „nie dokładaj paczek, mamy już swoje utilsy".

### L-0002 — Tabela zamiast listy · 2026-03-11 · AKTYWNA

- **Trigger:** odpowiedź o trzech krokach wdrożenia sformatowałem jako tabelę dwukolumnową.
- **Przyczyna:** przyzwyczajenie do tabel jako „porządniejszej" formy.
- **Zasada:** tabela tylko od trzech kolumn wzwyż; dwie kolumny to lista.
- **Źródło:** „ta tabela nic nie wnosi, wypisz to punktami".
```

## Przykład — plik archiwum ryzyk

```markdown
# ARCHIWUM RYZYK — Parkly · 2026-08-21

Zarchiwizowano: 2026-08-21 · Źródło: `docs/DZIENNIK.md`, sekcja „Stan otwartych ryzyk" · Ryzyk: 3
(R2, R4, R5) · Suma kontrolna przeniesionej treści: `3fa9c0d271b6e845` (SHA-256, pierwsze 16
znaków, końce linii LF)

Treść poniżej jest kopią **bajt w bajt** wierszy usuniętych z żywej tabeli ryzyk — nic nie zostało
streszczone ani zmienione (D-18). Numery R2, R4 i R5 pozostają zajęte na zawsze: numeracja ryzyk
jest ciągła i archiwizacja jej nie zwalnia.

---

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R2 | Brak testów listy oczekujących | średni | ZAMKNIĘTE 2026-08-05 | Testy dopisane, pokrycie modułu 71%. Zmierzone: 2026-08-05 (E2) |
| R4 | Podwójna rezerwacja tego samego miejsca | wysoki | ZAMKNIĘTE 2026-08-07 | Ograniczenie unikalności w bazie; próba 200 równoległych rezerwacji dała zero duplikatów. Zmierzone: 2026-08-07 (E4) |
| R5 | Mail potwierdzający nie dochodzi przez filtr antyspamowy | niski | ZAMKNIĘTE 2026-08-11 | Nadawca na własnej domenie z SPF i DKIM; 30 wysyłek testowych, wszystkie w skrzynce odbiorczej. Zmierzone: 2026-08-11 (E6) |
```

Żywa sekcja „Stan otwartych ryzyk" po tej rotacji wygląda tak — nagłówek i wiersz nagłówkowy
zostają zawsze, także gdyby tabela była pusta:

```markdown
## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Dostawca płatności niewybrany — blokuje wdrożenie | wysoki | OTWARTE | Wariant awaryjny działa: faktury ręcznie przez księgowość. Otwarte, bo decyzja należy do Łukasza i nie ma terminu. Zmierzone: 2026-08-05 (E2) |
| R3 | Kolejka oczekujących gubi zgłoszenia przy równoległym zwolnieniu | średni | ZMITYGOWANE 2026-08-07 | Blokada na poziomie bazy; 200 zgłoszeń bez zgubionego. Nie zamknięte, bo zachowania przy ponad 1000 osób w kolejce nikt nie mierzył. Zmierzone: 2026-08-07 (E4) |

> Ryzyka zamknięte R2, R4, R5 (3 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `3fa9c0d271b6e845`.
```

W przykładzie widać obie reguły naraz: `ZMITYGOWANE` **nie** jest zamknięciem, więc R3 zostaje,
a numery R2, R4 i R5 są dalej widoczne w żywym pliku — nikt ich nie odzyska w dobrej wierze.
