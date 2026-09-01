# SPEC — `docs/DZIENNIK.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/DZIENNIK.md` **w języku
projektu** (nazwa pliku też podąża za językiem: `JOURNAL.md` dla projektu angielskiego).

## Rola

Pamięć projektu między sesjami. Odpowiada na pytania: *co się wydarzyło*, *co zostało sprawdzone
i jak*, *czego świadomie nie zrobiliśmy i dlaczego*, *co czeka na człowieka*. Dziennik jest jedynym
dokumentem, z którego wolno odtworzyć historię — pozostałe opisują teraźniejszość.

## Odbiorca

Agent w kolejnej sesji (główny) oraz zespół.

## Polityka aktualizacji: APPEND, nigdy edycja wstecz

- Nowe wpisy dopisujesz **na końcu sekcji „Wpisy"** (Aneks A pkt 4.4). Dopisywanie na końcu, a nie
  na górze, minimalizuje konflikty gita przy pracy zespołowej.
- Wpisów historycznych **nie edytujesz**. Coś okazało się nieprawdą → nowy wpis z korektą.
- Wpis powstaje **w tej samej turze**, w której skończyła się porcja pracy — nie „na koniec dnia",
  bo koniec dnia może nie nadejść.
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku

1. **Nagłówek** — nazwa projektu.
2. **Sekcja „Stan otwartych ryzyk"** — stała, zawsze na górze pliku, **nadpisywana** (jeden z dwóch
   nadpisywanych fragmentów dziennika). Tabela: `# | Ryzyko | Poziom | Status | Mitygacja`. Numeracja
   `R1, R2, …` jest ciągła i nigdy nie jest używana ponownie — ryzyko zamknięte zostaje w tabeli ze
   statusem `ZAMKNIĘTE` i datą, a przy rotacji schodzi do `docs/archiwum/ryzyka/`
   (`SPEC_ARCHIWUM.md`). Poziomy: wysoki / średni / niski. Kształt komórki „Mitygacja" opisuje
   sekcja niżej.
3. **Sekcja „Czeka na człowieka"** (od 1.6.0) — stała, tuż pod ryzykami, **nadpisywana**. Sekcja
   niżej.
4. **Sekcja „Wpisy"** — chronologicznie, najstarszy u góry. To jest **domyślna** kolejność
   projektu zakładanego przez RelAI, nie warunek działania mechanizmów: kolejność wpisów jest
   własnością projektu i mechanizmy mają ją **czytać** (sekcja „Rotacja"), nie narzucać.

## Sekcja „Czeka na człowieka" (od 1.6.0)

Sprawy, których agent zrobić nie może — decyzja biznesowa, dostęp, zakup, akceptacja — mieszkają
**tutaj**, a nie rozsypane po wpisach sprzed miesięcy. Powód jest mierzalny: warstwa czytana przy
starcie sesji obejmuje ryzyka i ostatni wpis, więc sprawa zapisana w kwietniu przestawała istnieć
dla sesji w sierpniu, a jej wpis blokował rotację dziennika bez końca (plan
OPTYMALIZACJA_KONTEKSTU, mechanizm 2).

**Format pozycji** — jedna linia, trzy człony rozdzielone `·`:

```
- **<treść sprawy>** · <RRRR-MM-DD> · [wpis źródłowy](#<kotwica-nagłówka-wpisu>)
```

- **treść** — sprawa, nie kontekst. Kontekst mieszka we wpisie, do którego prowadzi link.
- **data** — dzień, w którym sprawa padła **po raz pierwszy**, nie dzień wyprowadzenia.
- **link** — kotwica nagłówka wpisu źródłowego w tym samym pliku. Tekst linku nazywa wpis (data
  plus skrót tytułu), więc pozycja zostaje odnajdywalna nawet wtedy, gdy kotwica przestanie
  działać (L-0013). Sprawa powtórzona w kilku wpisach dostaje link do **najnowszego**
  wystąpienia — tam jest stan sprawy na dziś, a starsze wystąpienia dojdziesz z niego wstecz.

  **Dlaczego do najnowszego, a nie do najstarszego.** Do 1.6.1 reguła wskazywała wpis
  **najstarszy** i to zatykało rotację z definicji: rotacja bierze ciągły zakres **od
  najstarszej** pozycji, a wpis linkowany z otwartej sprawy **był wtedy chroniony** — więc blokada
  siadała dokładnie tam, gdzie kosztowała najwięcej. Od 1.7.0 chroniony nie jest (sekcja
  „Rotacja"); bezpiecznikiem jest przepięcie linku opisane niżej. Zmierzone na dzienniku PolyFlow sprzed
  rotacji `FAKT` (2026-09-01, 127 wpisów): starą regułą zakres obejmował **0 wpisów**, nową —
  **117**. Na przekroju z 2026-08-21 (92 wpisy): **6** wobec **82**.

  **Adnotacja po przepięciu na archiwum.** Wpis, do którego prowadzi link, może wjechać do
  archiwum — wtedy link zostaje **przepięty** na plik archiwum razem z kotwicą, w fazie 2
  rotacji (`SPEC_ARCHIWUM.md`). Brzmienie pozycji po przepięciu:

  ```
  - **<treść sprawy>** · <RRRR-MM-DD> · [wpis 2026-08-16 — Plan ODBIORCY](archiwum/dziennik/DZIENNIK_2026-08-16_2026-08-31.md#2026-08-16--plan-odbiorcy-utworzony)
  ```

  Zmienia się **wyłącznie** ścieżka przed `#`; tekst linku, treść pozycji i data zostają
  nietknięte. Pozycja nigdy nie zostaje z martwym linkiem, a wpis nigdy nie blokuje rotacji
  tylko dlatego, że ktoś na niego wskazuje.

**Adnotacja odroczenia (od 1.7.0).** Sprawa starsza niż `N` dni (wiersz `Przegląd spraw człowieka`
w `SPEC_USTAWIENIA.md`, domyślnie **30 dni**, wyłącznik **osobny od rotacji**) wymusza na starcie
sesji decyzję. Pytanie idzie **partiami po cztery sprawy** i daje trzy wybory: zamknąć, odroczyć
o kolejne `N` dni, rozstrzygnąć teraz. Odpowiedź „zostawiam" przesuwa sprawę o kolejne `N` dni
i **zostawia ślad przy pozycji** — czwartym członem, po linku:

```
- **<treść sprawy>** · <RRRR-MM-DD> · [wpis 2026-08-16 — Plan ODBIORCY](#2026-08-16--plan-odbiorcy-utworzony) ·
  *(odroczone 2026-09-01, odroczeń: 2)*
```

W projekcie angielskim: `*(deferred 2026-09-01, deferrals: 2)*`.

Brzmienie jest **zamknięte i czytane maszynowo** (L-0035): rdzeń słowa, data ostatniego odroczenia,
przecinek, licznik. Nie parafrazujesz go i nie poszerzasz listy o warianty. Zasady:

- **Data w adnotacji to dzień ostatniego odroczenia**, a data pozycji zostaje datą **pierwszego**
  wystąpienia — nie podmieniasz jednej na drugą. Od dnia odroczenia wiek przeterminowania liczy
  się od adnotacji, a wiek całkowity nadal od daty pozycji.
- **Licznik rośnie o jeden przy każdym odroczeniu.** Pierwsze odroczenie zapisujesz jako
  `odroczeń: 1`; kolejne nadpisuje całą adnotację, nie dokłada drugiej.
- **Po trzecim odroczeniu** (licznik ≥ 3) raport startu mówi wprost, **od ilu miesięcy** sprawa
  jest odkładana, licząc od daty pozycji, a pytanie o nią zawiera tę liczbę i liczbę wcześniejszych
  odroczeń. Odroczenie mimo to **zostaje udzielone** — decyzja należy do człowieka; zmienia się
  komunikat, nie prawo do odpowiedzi.
- **Adnotacja odroczenia nie jest rozstrzygnięciem.** Pozycja odroczona zostaje w sekcji, nadal
  liczy się jako otwarta i nadal blokuje to, co blokowała; rdzeń `odroczo` jest wypisany wśród
  brzmień, które rozstrzygnięciem **nie są** (`SPEC_ARCHIWUM.md`, „Jak poznać pozycję
  rozstrzygniętą"). Pomyłka w tę stronę schowałaby sprawę człowieka w archiwum.

**Zasady sekcji:**

- **Sekcja jest nadpisywana i nigdy nie trafia do archiwum.** Nie jest wpisem, więc rotacja
  dziennika jej nie dotyka, i — inaczej niż tabela ryzyk — nie ma też własnej drogi do archiwum:
  sprawa człowieka albo jest otwarta i stoi tutaj, albo została rozstrzygnięta i znika
  (`SPEC_ARCHIWUM.md`).
- **Trzyma wyłącznie sprawy otwarte.** Pozycja rozstrzygnięta **znika z sekcji w tej samej turze**,
  a jej rozstrzygnięcie — data i treść decyzji — zapisuje wpis dziennika tej sesji oraz adnotacja
  przy pozycji we wpisie źródłowym. Gdyby rozstrzygnięte pozycje zostawały, sekcja po pół roku
  byłaby drugim dziennikiem czytanym przy każdym starcie.
- **Jedna sprawa = jedna pozycja.** Ta sama sprawa powtórzona w ośmiu wpisach nie daje ośmiu
  pozycji.
- **Sekcja pusta ma jawne brzmienie „—" i nie znika z pliku** — brak treści jest informacją,
  a znikający nagłówek zmusza kolejną sesję do zgadywania, czy sekcji nie ma, bo nic nie czeka,
  czy dlatego, że projekt jest sprzed 1.6.0.
- **Sekcja nie jest listą zadań agenta.** Rzecz, którą agent może zrobić sam, tu nie wchodzi —
  od tego jest plan albo odnoga.

**Skąd biorą się pozycje:** z sekcji „Do zrobienia przez człowieka" wpisów. Procedura zebrania
zastanych pozycji przy przejściu projektu na 1.6.0 mieszka w skillu `relai-core`.

## Komórka „Mitygacja" — stan bieżący, nie kronika (od 1.6.0)

Komórka mówi, **jak z tym ryzykiem jest dzisiaj** i **skąd to wiadomo**. Nie jest zapisem przebiegu
prac nad ryzykiem — od przebiegu są wpisy, do których prowadzą odsyłacze.

Powód jest mierzalny. Do 1.5.2 komórka rosła o akapit „**data (etap):** …" przy każdym pomiarze,
bo dopisanie było zawsze łatwiejsze niż przepisanie. Zmierzone 2026-08-21 na trzech projektach
`FAKT`: 85 komórek, w tym pojedyncze na **5586**, **2576** i **1881** znaków; w tym repozytorium
suma samych komórek „Mitygacja" dawała 17,9 KB z 21,4 KB całej sekcji. Sekcja ryzyk jest czytana
przy **każdym** starcie sesji, więc płaci się za nią w każdej sesji — a osiem historycznych
pomiarów tego samego ryzyka nie mówi nic ponad to, co mówi ostatni.

**Kształt komórki — dwa człony, w tej kolejności:**

1. **Stan na dziś** — co dziś trzyma to ryzyko w ryzach albo dlaczego nadal jest otwarte. Czas
   teraźniejszy. Jeśli poziom się zmienił, to zdanie mówi, co go zmieniło.
2. **Odsyłacze do wpisów, które ten stan zmierzyły** — **data i etap, bez linku**:

   ```
   Zmierzone: 2026-08-12 (E4), 2026-08-17 (E6)
   ```

   Link markdownowy jest tu świadomie odrzucony. Kotwica polskiego nagłówka waży ponad 100 znaków
   — kilkanaście procent limitu komórki — a wpisy stoją chronologicznie, więc data prowadzi do
   wpisu równie pewnie i przeżywa zmianę tytułu (L-0013). Sekcja „Czeka na człowieka" linkuje,
   bo tam pozycji jest kilka i są czytane pojedynczo; tu odsyłaczy bywa osiem w jednej komórce.

**Limit: 800 znaków na komórkę** — skalibrowany 2026-08-21 na zmierzonych dziennikach trzech
projektów `FAKT` (RelAI 10 ryzyk, JiraManager 23, PolyFlow 52). Mediana komórki w projektach bez
narracji przyrostowej mieści się w 700 znakach, więc limit nie tnie treści potrzebnej — przekraczają
go wyłącznie komórki z kroniką. Jednostką są **znaki**, bo w znakach liczy je komenda niżej; próg
całej pozycji w warstwie startowej jest osobny i wyrażony w KB (`SPEC_USTAWIENIA.md`, wiersz
`Budżet startu sesji`).

Sprawdzasz komendą, nie okiem:

```
node -e "const fs=require('fs');let n=0;for(const l of fs.readFileSync('docs/DZIENNIK.md','utf8').split(/\r?\n/)){if(!l.trim().startsWith('|'))continue;const c=l.split(/(?<![\x5c])[|]/);if(c.length<7)continue;const m=c[5].trim();if(m.length>800){n++;console.log(c[1].trim(),m.length)}}console.log(n+' komorek ponad limitem 800')"
```

Dwie rzeczy w tej komendzie wyglądają na ozdobniki i nią nie są:

- **Podział po `|` niepoprzedzonym backslashem.** Komórka z `allow \| deny` w środku rozpada się
  przy naiwnym `split('|')` na kilka kolumn, a instrument melduje wtedy długość pierwszego kawałka
  zamiast całej komórki — wartość zaniżoną, wyglądającą na zdaną (L-0055).
- **`[\x5c]` zamiast wpisanego backslasha.** Powłoka zjada `\\` wewnątrz cudzysłowu, więc wersja
  „ładniejsza" wywala się po wklejeniu na `Invalid regular expression`. Ta forma jest tą, którą
  realnie uruchomiono.

**Co zrobić z narracją, która już tam stoi.** Nie kasujesz jej (D-18) — **przenosisz**. Każdy człon
„**data (etap):** …" opisuje pomiar, który ma swój wpis w dzienniku; treść komórki wraca więc tam,
skąd przyszła, a w komórce zostaje odsyłacz. Kolejność jest jedna i nienegocjowalna:

1. Sprawdź, czy wpis z tej daty **istnieje** i czy niesie ten fakt. Niesie → wystarczy odsyłacz.
2. **Nie niesie** — fakt istnieje wyłącznie w komórce → przepisz go do **wpisu dziennika tej
   sesji**, zanim skrócisz komórkę. To ten sam bezpiecznik co przy skracaniu `STATE.md`
   (`SPEC_STATE.md`): fakt bez innego domu nie znika.
3. Dopiero teraz przepisz komórkę na dwa człony.

**Skrócenie, które gubi powód otwartego statusu, jest defektem, nie oszczędnością.** Ryzyko
`OTWARTE` musi po skróceniu nadal odpowiadać na pytanie „dlaczego jeszcze nie zamknięte" — to jest
jedyna informacja, której nikt nie odtworzy z wpisów bez ich przeczytania.

## Kompresja komórki „Mitygacja" (od 1.7.0)

Sekcja wyżej mówi, **jak komórka ma wyglądać**, i daje komendę, która liczy znaki. Do 1.6.1 na tym
się kończyło: limit 800 znaków miał sprawdzenie i nie miał **żadnego mechanizmu**, więc komórka
raz zapuszczona rosła dalej. Ta sekcja jest jego adresem egzekwowania — historia z komórki schodzi
do `docs/archiwum/ryzyka/`, a ryzyko **zostaje otwarte i widoczne przy każdym starcie**. To nie
jest rotacja wiersza: wiersz nie rusza się z tabeli.

**Kiedy rusza — trzy warunki naraz:**

1. sekcja „Stan otwartych ryzyk" przekracza swój **próg cząstkowy** (`ryzyka` z wiersza
   `Budżet startu sesji`, domyślnie 12 KB),
2. komórka „Mitygacja" przekracza **800 znaków** (komenda z sekcji wyżej),
3. status ryzyka stoi na **zamkniętej liście** niżej.

Warunki są koniunkcją i żaden z nich sam nie wystarcza. **Wiek komórki warunkiem nie jest**:
kosztuje objętość czytana przy każdym starcie, a nie data ostatniej zmiany — komórka
nietknięta od pół roku i mieszcząca się w limicie nie kosztuje nic. Wiek wymagałby przy tym
dowodu spoza dokumentu (historia gita per komórka), a mechanizm rdzenia czyta dokument.

**Zamknięta lista statusów** (L-0025) — dopasowanie po rdzeniu, forma gramatyczna dowolna:

| Rdzeń | Przykłady wystąpień |
|---|---|
| `zmitygowan` | `ZMITYGOWANE 2026-08-13 (E2)`, `ZMITYGOWANE W KODZIE 2026-09-01` |
| `przyj` **albo** `zaakceptowan`, **razem z** `świadom` | `PRZYJĘTE ŚWIADOMIE`, `ŚWIADOMIE PRZYJĘTE`, `ŚWIADOMIE ZAAKCEPTOWANE` |

**Rdzenia szukasz w samym brzmieniu statusu, nie w całej komórce** — kotwica na jej **początku**
(L-0025). Brzmienie to wszystko od pierwszego znaku komórki (po zdjęciu `*`) **do pierwszej cyfry,
myślnika albo nawiasu**: w `**ZMITYGOWANE W KODZIE 2026-09-01**` brzmieniem jest
`ZMITYGOWANE W KODZIE`, a w `**ZAMKNIĘTE 2026-08-18 (E4)** — zmitygowane w kodzie` — samo
`ZAMKNIĘTE`. Bez tej kotwicy rdzeń trafiałby w prozę za datą i wiersz `ZAMKNIĘTE` schodziłby
**dwiema drogami naraz**: rotacją całego wiersza i kompresją komórki. Zmierzone na dzienniku
PolyFlow sprzed migracji `FAKT` (2026-09-01, `396e243^`): dopasowanie w całej komórce dawało
**11 kandydatów**, dopasowanie w brzmieniu — **7**; te cztery to ryzyka `ZAMKNIĘTE` z rdzeniem
w opisie.

Status spoza listy znaczy **„komórka zostaje"** i mechanizm nie zgaduje intencji. W szczególności:

- **`OTWARTE` nie wchodzi** — komórka ryzyka otwartego niesie powód, dla którego nie jest
  zamknięte, i tej informacji nie odtworzy nikt bez przeczytania wpisów. Skracasz ją ręcznie albo
  wcale.
- **`ZAMKNIĘTE` nie wchodzi** — tam schodzi **cały wiersz**, rotacją ryzyk (`SPEC_ARCHIWUM.md`).
- `ZAWĘŻONE`, `ZAWIESZONE`, `ZMATERIALIZOWAŁO SIĘ` i brzmienia spoza listy — zostają.

W projekcie angielskim rdzenie czytasz w języku projektu (`mitigated`; `accepted` razem
z `knowing` / `deliberate`); zasada zamkniętej listy jest ta sama.

**Co schodzi:** **dzisiejsza treść komórki w całości, bajt w bajt** — także ta jej część, która
zostanie zacytowana w żywej tabeli. Archiwum ma być kompletne samo w sobie, a nie różnicą.

**Co zostaje w żywej komórce — dwa człony, w tej kolejności:**

1. **Cytat ostatniego zdania stanu.** Dosłownie **ostatnie zdanie członu pierwszego** komórki,
   czyli ostatnie zdanie przed odsyłaczem `Zmierzone:`; gdy odsyłacza nie ma — ostatnie zdanie
   całej komórki. Nie parafrazujesz go, nie sklejasz z dwóch i nie poprawiasz w nim interpunkcji.
   **Zdanie napisane przez agenta od siebie jest defektem, nie uproszczeniem** — komórka mówi
   wtedy coś, czego nie ma w archiwum.

   **Granica zdania jest rozstrzygnięta, nie wyczuwana:** kropka, wykrzyknik albo znak zapytania,
   po nich spacja, a po niej **wielka litera** albo początek pogrubienia (`**`). Sama kropka
   granicą nie jest — komórki są pełne dat, numerów wersji i skrótów, a `1.6.1` rozpadłoby się na
   trzy „zdania".
2. **Odsyłacz do archiwum, a po nim `Zmierzone:` w niezmienionym brzmieniu:**

   ```
   Historia: [MITYGACJE_2026-09-01](archiwum/ryzyka/MITYGACJE_2026-09-01.md). Zmierzone: 2026-08-12 (E4), 2026-08-17 (E6)
   ```

   Odsyłacz prowadzi do **pliku**, nie do kotwicy: plik archiwum jest tabelą numerowaną kolumną
   `#`, a numer ryzyka odnajduje się w niej bez kotwicy, która potrafi przestać działać (L-0013).

**Wynik ponad 800 znaków → STOP.** Komórka po kompresji ma się mieścić w limicie; jeśli nie mieści
się samo zdanie stanu, znaczy to, że zdanie jest akapitem — i wtedy pyta się człowieka, zamiast
skracać cytat. Żywy plik zostaje wtedy nietknięty.

**Procedura jest ta sama co przy rotacji** (`SPEC_ARCHIWUM.md`, „Przebieg — dwie fazy") i drugiej
nie piszesz: suma kontrolna fragmentu → zapis pliku archiwum → odczyt **z dysku** → porównanie →
dopiero potem podmiana komórek. Rozjazd sum zatrzymuje całość i **żadna komórka nie jest ruszana**.
„Fragment" znaczy tu treści kompresowanych komórek, sklejone w kolejności wierszy, po jednej na
linię — ta sama definicja obowiązuje po stronie archiwum.

**Kompresja nie dokłada własnego komunikatu** (L-0049). Melduje się we wpisie dziennika tej sesji,
tak jak rotacja: które ryzyka, ile znaków przed i po, dokąd, suma kontrolna.

## Szablon wpisu (obowiązkowy, D-14)

Nagłówek trzeciego poziomu: `### RRRR-MM-DD — Temat`, pod nim linia autora, potem cztery sekcje
o stałych nazwach. Sekcję bez treści zostawiasz z jawnym „—", zamiast ją usuwać: brak treści to
informacja.

- **Zrobione** — fakty, nie intencje. Każda pozycja to rzecz, która istnieje w repo albo w świecie.
- **Zweryfikowane — jak dokładnie** — najważniejsza sekcja i najczęściej pomijana. Nie „przetestowano",
  tylko czym, na czym i z jakim wynikiem. Jeśli czegoś nie sprawdzono — napisz to wprost.
- **Świadomie odłożone** — co świadomie zostało poza zakresem i dlaczego. To jest bezpiecznik
  przeciw rozrostowi zakresu: pomysł spoza zakresu ląduje tutaj, nie w kodzie.
- **Do zrobienia przez człowieka** — rzeczy, których agent nie może albo nie powinien zrobić sam
  (decyzje biznesowe, dostępy, zakupy, akceptacje). Pozycja rozstrzygnięta później zostaje w miejscu
  z dopiskiem w nawiasie: „*(rozstrzygnięte RRRR-MM-DD — …)*".

  **Forma dopiska jest czytana maszynowo** — po niej rotacja poznaje wpis, którego nie wolno
  ruszyć (`SPEC_ARCHIWUM.md`), a zamknięcie planu poznaje otwartą bramkę (`SPEC_STATUS.md`,
  sekcja „Bramki manualne"). Kanoniczne słowo to **rozstrzygnięte**; równoważnie rozpoznawane są
  **zrobione** i **wykonane** — tak podpisywano pozycje przed 1.3.0 i te wpisy mają dalej liczyć
  się jako zamknięte. Dopisek bez żadnego z tych słów znaczy **pozycja otwarta**: mechanizm nie
  zgaduje intencji (L-0025). Piszesz nowy dopisek → pisz „rozstrzygnięte".

  Pozycja niedotycząca już niczego (temat odpadł) też dostaje dopisek — „*(rozstrzygnięte
  RRRR-MM-DD — nieaktualne, powód)*". Ciche pozostawienie jej otwartej blokuje rotację wpisu
  i zamknięcie planu bez końca.

  **Wyprowadzenie do sekcji „Czeka na człowieka" (od 1.6.0).** Pozycja otwarta nie mieszka w
  jednym miejscu wiecznie: przenosi się do sekcji „Czeka na człowieka" na górze pliku, gdzie widzi
  ją każda sesja. We wpisie **zostaje** — z adnotacją o przeprowadzce, bo historia nie kłamie
  o tym, co wtedy było otwarte (D-18):

  ```
  - Wybrać dostawcę płatności (R1). *(wyprowadzone 2026-08-20 → sekcja „Czeka na człowieka")*
  ```

  Brzmienie adnotacji jest **zamknięte i czytane maszynowo**: dosłownie `*(wyprowadzone
  RRRR-MM-DD → sekcja „Czeka na człowieka")*` (w projekcie angielskim: `*(moved out RRRR-MM-DD →
  section "Waiting on a human")*`). Nie parafrazujesz go i nie poszerzasz listy o warianty
  (L-0035).

  **Wpis z pozycją wyprowadzoną przestaje blokować rotację** — blokada liczy się odtąd wyłącznie
  z sekcji „Czeka na człowieka" (`SPEC_ARCHIWUM.md`). To jest cały sens wyprowadzenia: sprawa
  zyskuje widoczność, a wpis odzyskuje prawo do archiwum.

## Linia autora — jeden format, bez wariantów (D-63)

Druga linia wpisu, zawsze ta sama:

```
Autor: RelAI (<model>) + <użytkownik z git config user.name>
```

- `<model>` to nazwa modelu, który pisze wpis — `Opus`, `Sonnet`, `Haiku`, `Fable`. Bez numeru
  wersji i bez identyfikatora API.
- `<użytkownik>` to **dosłowna** wartość `git config user.name`. Nie skracasz jej, nie tłumaczysz
  i nie zastępujesz nickiem ani „użytkownik".
- Podpis jest neutralny: bez persony, bez osobowości, bez emotikonu.
- **Git nieskonfigurowany** (brak `user.name` w konfiguracji lokalnej i globalnej) → i tylko wtedy
  → sam `Autor: RelAI (<model>)`, bez znaku `+` i bez wypełniacza. Brak członu jest wtedy
  informacją, a nie brakiem.

**Człon użytkownika nie jest ozdobą.** Wpis podpisany samym modelem przy skonfigurowanym gicie
gubi jedyny ślad tego, kto przy tej pracy był — a na nim opiera się sygnał „cudzy projekt" (D-27),
który porównuje `user.name` z podpisami. Zmierzone w pilotażu 1.0.0: dwa wpisy podpisane
`RelAI (Haiku)` bez członu użytkownika wystarczyły, żeby projekt zaczął wyglądać na cudzy.

Dlatego od 1.3.0 podpis jest **sprawdzany maszynowo**: hook `journal-signature` czyta ostatni wpis
po każdym zapisie dziennika i ostrzega, gdy przy skonfigurowanym gicie w linii autora nie ma członu
`+ <użytkownik>`. Ostrzega — nigdy nie blokuje i nigdy nie poprawia wpisu za Ciebie; poprawka
należy do tej samej tury co ostrzeżenie. Hook milczy, gdy podpis jest poprawny albo gdy gita nie
ma (D-40).

## Wpis typu MINIPLAN (D-31)

Drobne zadanie, które warto rozpisać, ale które nie zasługuje na pełny plan, dostaje **miniplan** —
i miniplan mieszka **tutaj**, jako wpis w dzienniku. Nie ma pliku `MINIPLAN.md`, nie ma folderu
w `docs/plany/`, nie ma wpisu w `CLAUDE.md`. Kryteria wyboru PLAN vs MINIPLAN są w skillu
`relai-planning`.

Miniplan to jedyny wpis dziennika pisany **przed** pracą, nie po niej. Ma trzy sekcje zamiast
czterech standardowych:

- **Cel** — jedno zdanie: po czym poznamy, że zrobione.
- **Kroki** — 2–5 pozycji w kolejności wykonania.
- **Weryfikacja** — czym konkretnie sprawdzisz, że działa (nie „przetestuję").

Nagłówek dostaje dopisek `— MINIPLAN`, żeby był rozpoznawalny przy przeglądaniu. Po wykonaniu pracy
**nie edytujesz** miniplanu — dopisujesz osobny, zwykły wpis wynikowy (dziennik jest append-only).
Zadanie, które w trakcie przerosło swój miniplan, kończy się wpisem mówiącym o tym wprost i
propozycją pełnego planu.

**Przykład wpisu typu MINIPLAN:**

```markdown
### 2026-08-09 — Eksport listy rezerwacji do CSV — MINIPLAN

Autor: RelAI (Opus) + Łukasz

**Cel:** administrator pobiera z panelu plik CSV z rezerwacjami z wybranego miesiąca.

**Kroki:**
1. Endpoint `GET /api/rezerwacje/eksport?miesiac=RRRR-MM` zwracający CSV.
2. Przycisk „Eksportuj CSV" na liście rezerwacji, z wyborem miesiąca.
3. Nagłówki kolumn po polsku, separator `;` (Excel PL).

**Weryfikacja:** pobranie pliku za lipiec i otwarcie w Excelu — polskie znaki poprawne, liczba
wierszy zgodna z licznikiem na liście.
```

## Rotacja (D-14, mechanizm od 1.2.0)

Rotacja dzieje się **sama**, w rytuale zamknięcia sesji, gdy plik przekracza próg
z `docs/USTAWIENIA.md` (domyślnie **150 KB**). Poniżej progu nie dzieje się nic i nie pada ani
jedno słowo. Pełen mechanizm — dwie fazy, sumy kontrolne, nazwy plików, przypadki brzegowe —
opisuje `SPEC_ARCHIWUM.md`; tutaj obowiązuje to, czego rotacja nie ma prawa naruszyć.

**Co zostaje w żywym pliku zawsze:**

- sekcja **„Stan otwartych ryzyk"** — nie jest wpisem, więc nie wchodzi do archiwum dziennika.
  Rotację ma **własną i osobną**: do `docs/archiwum/ryzyka/` schodzą wiersze ryzyk `ZAMKNIĘTE`,
  nigdy cała sekcja i nigdy ryzyko otwarte (`SPEC_ARCHIWUM.md`),
- sekcja **„Czeka na człowieka"** — tak samo: nie jest wpisem, nie rotuje,
- **dziesięć najnowszych wpisów** `SZACUNEK` — najnowszych **wg dat w nagłówkach**, nie wg pozycji
  w pliku.

**Czego rotacja nie zatrzymuje (zmiana w 1.7.0):** wpis **nie** jest chroniony dlatego, że prowadzi
do niego link z otwartej pozycji „Czeka na człowieka". Taki wpis wchodzi do zakresu normalnie,
a jego **link jest przepinany** na plik archiwum w fazie 2 (`SPEC_ARCHIWUM.md`). Do 1.6.1 był
nietykalny — i to była ta jedna reguła, przez którą rotacja w dwóch żywych projektach nie ruszyła
z miejsca. Sprawa człowieka nie znika przy tym z oczu, bo nie znika **pozycja**: sekcja „Czeka na
człowieka" nie rotuje nigdy, a po przepięciu prowadzi do tej samej treści pod adresem archiwum.

Wpis, którego pozycje zostały wyprowadzone albo rozstrzygnięte, jest przenoszalny tak samo — jego
własna sekcja „Do zrobienia przez człowieka" niczego nie blokuje.

**Co odchodzi:** ciągły zakres najstarszych wpisów, **w całości i bajt w bajt**. Wpisu nie dzielisz,
nie streszczasz i nie skracasz — pierwszy wpis nietykalny kończy zakres.

**Co zostaje po nich:** jedna **linia-odsyłacz** na początku sekcji „Wpisy", z zakresem dat, liczbą
wpisów, linkiem do pliku archiwum i sumą kontrolną. Streszczenia okresu **nie piszesz** — dawna
reguła „jednoakapitowe streszczenie" jest w 1.2.0 wycofana, bo streszczenie milczy o tym, czego nie
zmieściło, a od pełnej treści jest archiwum (D-18).

Format wpisu jest przy tym nienaruszalny: treść w archiwum ma te same cztery sekcje i tę samą linię
autora co przed przeniesieniem.

**Kolejność wpisów w pliku jest własnością projektu (od 1.7.0).** RelAI dopisuje na końcu sekcji
„Wpisy", więc w projekcie założonym przez RelAI najstarszy wpis stoi u góry — ale projekt
zaadoptowany albo prowadzony wcześniej ręcznie bywa odwrotny, a bywa i mieszany. **Mechanizm nie
narzuca kolejności: ustala ją z dat w nagłówkach `### RRRR-MM-DD`, nie z pozycji w pliku.** Dotyczy
to wszystkiego, co pyta plik o wiek: wyznaczenia zakresu rotacji („najstarsze" znaczy najwcześniejsza
data, nie „pierwsze od góry"), dziesięciu nietykalnych wpisów i pomiaru „ostatniego wpisu" w warstwie
startowej.

Kosztowało to pomiar: w PolyFlow wpisy idą **od najnowszego**, a najstarszy stoi w środku pliku —
funkcja czytająca „ostatni nagłówek w pliku" brała tam wpis najstarszy i pozycja `ryzyka` urosła
o 3,0 KB tylko dlatego, że zmienił się najstarszy wpis `FAKT` (2026-08-21).

**Nagłówki bez dat albo z datami nieparsowalnymi** (dokument sprzed adopcji) → mechanizm wraca do
zachowania dotychczasowego, czyli do kolejności w pliku, i robi to **w ciszy**: brak daty nie jest
błędem, a wpis bez daty i tak nie podlega rotacji (`SPEC_ARCHIWUM.md`, przypadki brzegowe).

## Zakazy

- Nie edytujesz i nie usuwasz starych wpisów (D-18: zamiast kasowania — adnotacja).
- Nie wpisujesz sekretów, tokenów ani wklejonych fragmentów `.env` (D-42).
- Nie dublujesz stanu bieżącego — to `STATE.md`.
- Nie piszesz wpisu bez sekcji „Zweryfikowane"; „nie weryfikowano" jest dopuszczalną treścią,
  brak sekcji nie jest.

## Przykład

```markdown
# DZIENNIK — Parkly

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Dostawca płatności niewybrany — blokuje wdrożenie | wysoki | OTWARTE | Wariant awaryjny działa: faktury wystawiane ręcznie przez księgowość, więc brak dostawcy nie wstrzymuje sprzedaży. Otwarte, bo decyzja należy do Łukasza i nie ma terminu. Zmierzone: 2026-08-05 (E2) |
| R3 | Kolejka oczekujących gubi zgłoszenia przy równoległym zwolnieniu miejsca | średni | ZAMKNIĘTE 2026-08-07 | Blokada na poziomie bazy; test współbieżności 200 zgłoszeń bez zgubionego. Zmierzone: 2026-08-07 (E4) |

> Ryzyka zamknięte R2 (1 pozycja) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-07.md](archiwum/ryzyka/RYZYKA_2026-08-07.md)
> — przeniesione 2026-08-07, suma kontrolna `9c4d1a77be230f85`.

## Czeka na człowieka

- **Wybrać dostawcę płatności — blokuje wdrożenie (R1)** · 2026-08-07 ·
  [wpis 2026-08-09 — Cennik i faktury](#2026-08-09--cennik-i-faktury-ręczne)
- **Potwierdzić treść maila z działem komunikacji** · 2026-08-07 ·
  [wpis 2026-08-07 — Lista oczekujących](archiwum/dziennik/DZIENNIK_2026-03-02_2026-08-07.md#2026-08-07--lista-oczekujących-i-powiadomienia)
- **Zgoda działu prawnego na regulamin** · 2026-03-02 ·
  [wpis 2026-08-09 — Cennik i faktury](#2026-08-09--cennik-i-faktury-ręczne) ·
  *(odroczone 2026-08-09, odroczeń: 3)*

## Wpisy

> Wpisy z okresu 2026-03-02 … 2026-08-07 (15 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-03-02_2026-08-07.md](archiwum/dziennik/DZIENNIK_2026-03-02_2026-08-07.md)
> — przeniesione 2026-08-09, suma kontrolna `a1b2c3d4e5f60718`.

### 2026-08-09 — Cennik i faktury ręczne

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Cennik miesięczny w panelu administratora; faktury wystawiane ręcznie przez księgowość, bo
  dostawcy płatności nadal nie ma (R1).

**Zweryfikowane — jak dokładnie:**
- Trzy faktury wystawione ręcznie na danych testowych — kwoty zgodne z cennikiem co do grosza.
- **Nie sprawdzono:** niczego po stronie płatności online — nie ma czego sprawdzać, dopóki nie ma
  dostawcy.

**Świadomie odłożone:**
- Integracja płatności — czeka na wybór dostawcy.

**Do zrobienia przez człowieka:**
- Wybrać dostawcę płatności (R1). *(wyprowadzone 2026-08-08 → sekcja „Czeka na człowieka")*
```

W tym przykładzie widać obie reguły linku naraz:

- **Sprawa dostawcy płatności** padła 2026-08-07, ale wraca w tym wpisie z 2026-08-09 — więc
  pozycja linkuje do wpisu z **2026-08-09**, najnowszego wystąpienia. Data przy pozycji zostaje
  **2026-08-07**: to nadal dzień pierwszego wystąpienia.
- **Sprawa maila do działu komunikacji** ma tylko jedno wystąpienie, we wpisie z 2026-08-07 — a ten
  wpis wjechał do archiwum przy rotacji z 2026-08-09. Link został **przepięty** na plik archiwum
  wraz z kotwicą; tekst linku i treść pozycji zostały nietknięte. Sprawa jest dalej widoczna na
  starcie sesji, mimo że jej wpis jest już poza żywym plikiem.

- **Sprawa zgody działu prawnego** czeka od 2026-03-02 i była już odraczana trzykrotnie, ostatnio
  2026-08-09. Wiek przeterminowania liczy się od **2026-08-09**, więc przy `N = 30` wróci
  2026-09-09; wiek całkowity — od **2026-03-02**, więc raport powie, że sprawa jest odkładana od
  pięciu miesięcy. Pozycja jest otwarta mimo adnotacji: odroczenie nie jest rozstrzygnięciem.

Pozycja i wpis stoją przy tym w dwóch miejscach i to jest zamierzone: w sekcji „Czeka na człowieka"
jako **sprawa otwarta widoczna na starcie**, we wpisie jako **ślad historii** z adnotacją.
