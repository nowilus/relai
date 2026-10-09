# Styl pasków RelAI dla Claude Code

Wersja: **1** · Data: **2026-10-09** · Zakres: trzy paski nad promptem, plan PANEL_CLAUDE / E9.

Brief do implementacji w Claude Code. Powstał po wyborze użytkownika: delikatne tła
„Miękkich powierzchni”, rozmieszczenie i przyciski z „Liczby po prawej”, postęp z „Pola
i segmenty” rozwinięty do **kafelków konkretnych zadań z krótką nazwą i statusem**.
W tej sesji powstaje opis, implementację wykonuje sesja Claude Code prowadząca E9.

## 1. Efekt docelowy

Trzy niezależne, spokojne paski: **cache → plan → postęp**. Każdy mod zachowuje własne miejsce.
Oddzielenie zapewniają delikatnie różne tła, odstępy i wyrównanie, zamiast kolorowego obrysu.
Wrażenie: porządek i elegancja narzędzia do pracy, z kolorystyką RelAI.

Przy szerokim oknie nazwa sekcji stoi po lewej, informacje w środku, najważniejsza liczba
po prawej. Liczby trzech pasków mają wspólną prawą krawędź. Postęp pokazuje osobne małe
kafelki zadań; **nie rysujemy dodatkowo dużego ciągłego paska, który je dubluje**.

## 2. Układ wspólny

| Element | Docelowa geometria desktopowa |
|---|---|
| Odstęp pomiędzy paskami | 8 px |
| Padding paska | 10 px w pionie, 13 px w poziomie |
| Rogi paska | subtelne, około 7 px |
| Lewa kolumna etykiety | około 106–118 px; jednakowa we wszystkich trzech paskach |
| Środkowa kolumna | elastyczna; mieści tytuł, metadane, przyciski albo zadania |
| Prawa kolumna liczby | około 76–88 px; nie kurczy się kosztem liczby |
| Odstępy między kolumnami | około 14 px |
| Wysokość cache i planu | zwykle 52–64 px, zależnie od szerokości i zawijania |
| Wysokość postępu | wynika z liczby rzędów kafelków; bez pustej przestrzeni |

Wartości w pikselach opisują wygląd referencyjny. Silnik modów liczy część geometrii w komórkach:
dobierz odpowiadające im właściwości i skalibruj efekt na żywo, zamiast przepisywać CSS makiety.
Przy szerokim oknie i jednym rzędzie zadań celuj w wysokość całości zbliżoną do obecnych pasków.
Jeśli zadania wymagają zawinięcia, czytelność ma pierwszeństwo przed sztuczną stałą wysokością.

## 3. Kolory i typografia

Źródło marki: `core/panel/theme.mjs`, paleta `ROOT`. Poniższe kolory są referencją ciemnego
widoku zaakceptowanych makiet, do zapisania we wspólnych tokenach pasków i ich zsynchronizowania.

| Rola | Kolor referencyjny |
|---|---|
| Otoczenie pasków | `#21211f`, w aplikacji wykorzystaj jej istniejące tło |
| Tło cache | `#2c2824`, delikatnie gliniane |
| Tło planu | `#2d2a23`, delikatnie musztardowe |
| Tło postępu | `#262c27`, delikatnie szałwiowe |
| Główny tekst | `#eee8dc` |
| Tekst pomocniczy | `#b8b0a3` |
| Etykieta cache | `#df987a` |
| Etykieta planu / potwierdzony stan „W toku” | `#e1b85c` |
| Etykieta postępu / ukończone zadanie | `#9cbea2` |
| Spokojne tło kontrolki | `#3a342b` |
| Neutralna linia kontrolki, jeśli potrzebna | `#464239` |

Kolor określa tożsamość sekcji i rzeczywisty stan zadania. Duże powierzchnie pozostają ciemne
i przygaszone. Bez glow, gradientów, ciężkiego cienia i kolorowej ramki wokół całego paska.

Typografia systemowa, jak w aplikacji. Referencja: treść 14 px, metadane 12 px,
etykiety 12 px / semibold, prawa liczba 19 px / semibold, jednostka pod nią 11–12 px.
W liczbach użyj cyfr o jednakowej szerokości, jeśli renderer to obsługuje.
Kontrast tekstu do jego tła co najmniej 4,5:1; znaczenie stanu widoczne także w symbolu i słowie.

## 4. Pasek cache

**Lewa kolumna:** `RelAI · cache` w kolorze gliny.

**Środek, pierwszy wiersz:** stan, np. `Cache ciepły`, oraz zwarta grupa dwóch przycisków
`Podtrzymaj` i `Przekaż`. Grupa stoi obok stanu, nie na skrajnym prawym końcu paska.

**Środek, drugi wiersz:** kontekst, koszt ponownego zapisu, limity i koszt sesji.
Przykład układu: `405k · zapis ≈ $3.24`, `5 h: 19% · tydzień: 35%`, `sesja ≈ $17`.
To przykładowe wartości ze zrzutu, nie stałe do wpisania do programu.

**Prawa kolumna:** duże `~54`, pod nim małe `min do końca`.
Przy mniej niż minucie pokaż rzeczywistą jednostkę; przy braku pomiaru tekst `brak danych`,
zamiast pozornego zera. Nie powtarzaj dużego czasu w środku paska.

## 5. Pasek planu

**Lewa kolumna:** `RelAI · plan` w kolorze musztardy.

**Środek, pierwszy wiersz:** `PANEL_CLAUDE · E9` i mały tekst statusu `W TOKU`.
**Drugi wiersz:** nazwa etapu i koszt sesji z jawną kwalifikacją `wg cennika API`.

**Prawa kolumna:** `4/9`, pod spodem `etapów`.
Licznik etapów planu pozostaje odrębny od licznika zadań bieżącego etapu.
Brak planu albo nieznany stan pokazuj słowami, zgodnie z istniejącym modelem.

## 6. Pasek postępu: małe kafelki na zadanie

**Lewa kolumna:** `RelAI · postęp` w kolorze szałwii.
**Środek, pierwszy wiersz:** identyfikator etapu i jego nazwa.
**Poniżej:** kompaktowa lista kafelków. Jeden kafelek = jeden rzeczywisty punkt checklisty
albo jedno zadanie załogi, w kolejności ze źródła.
**Pod kafelkami:** pomocniczy licznik `6 z 14 punktów` albo `6 z 14 zadań`, zależnie od źródła.
**Prawa kolumna:** `42.85`, pod nim `procent`. Zachowaj istniejącą regułę wyliczania i formatowania.

### Geometria kafelków

- Wysokość referencyjna 22–26 px; padding poziomy 6–8 px; odstęp 4–6 px.
- Rogi około 3–4 px. To małe komórki statusu, nie duże karty z opisem.
- Szerokość wynika z krótkiej nazwy; zwykle 60–120 px. Symbol statusu zawsze zostaje widoczny.
- Bez pełnego opisu, kosztu, modelu i dat w każdym kafelku. Pełna nazwa należy do szczegółów.
- Nazwa źródłowa pozostaje dostępna w danych. Przy długiej nazwie skróć ją deterministycznie
  przez ograniczenie długości i wielokropek; nie wołaj modelu do tworzenia etykiet.
- Jeśli renderer obsługuje podpowiedź, udostępnij pełną nazwę na hover i fokus. Jeśli nie,
  kliknięcie natywnej kontrolki pokazuje pełną nazwę i stan w szczegółach sekcji postępu,
  przez rozszerzenie istniejącego panelu `relai-progress` o listę zadań.
- Informacja o zadaniu jest dostępna także w terminalu, bez uzależnienia jej od hover.

### Wygląd stanów

| Stan źródłowy | Etykieta przykładowa | Wygląd |
|---|---|---|
| Ukończone | `✓ Testy` | delikatne szałwiowe wypełnienie, czytelny jasny tekst |
| Oczekuje / nieodhaczone | `○ Dokumenty` | neutralne ciemne wypełnienie, spokojny tekst |
| W toku, tylko gdy źródło to potwierdza | `● Weryfikacja` | delikatna musztarda, symbol i jawny stan w szczegółach |
| Błąd / timeout, jeśli dostępne | `! Publikacja` | przygaszona glina; słowo „błąd” lub „timeout” w szczegółach |
| Stan nieznany | `? Zadanie` | neutralny wygląd i jawna informacja o braku stanu |

Przykładowe nazwy powyżej służą objaśnieniu stylu; faktyczna lista pochodzi z danych projektu.
Zwykła nieodhaczona pozycja Markdown nie dowodzi, że zadanie właśnie trwa.
Nie oznaczaj automatycznie kolejnego kafelka musztardą.

### Wymaganie dla modelu danych

Obecny `core/panel/progress.mjs` zwraca agregat `done/total/percent/words`, bez listy pozycji.
Aby kafelki odpowiadały zadaniom, zachowaj obok agregatu ich stabilne identyfikatory,
nazwy źródłowe, krótkie etykiety, kolejność i dostępne statusy.
Checklistę czytaj z istniejącego promptu etapu, zadania załogi z istniejących plików
`zadania.json` i `manifest.json`. Nie dodawaj nowego narzędzia postępu ani nowego źródła ręcznych wpisów.

Agregat i kafelki muszą wynikać z tej samej listy. Szczególnie ważny przypadek:
ukończone są pozycje 2, 5 i 9, więc szałwiowe są właśnie one, a licznik wynosi 3/N.
**Nie wolno wypełnić pierwszych trzech kafelków na podstawie samej sumy.**
Identyfikatory nie zależą od statusu. Dla Markdown wykorzystaj tożsamość źródła i pozycję
punktu w tym źródle, a dla załogi jej identyfikatory zadań. Ten brief nie wymaga śledzenia
tożsamości pozycji po przebudowie całej checklisty.

## 7. Przyciski: układ z „Liczby po prawej”

`Podtrzymaj` i `Przekaż` tworzą jedną zwartą grupę, bez wielkiej ramki wokół niej.
Pierwszy przycisk ma spokojne wypełnienie `#3a342b`, drugi nieco ciemniejsze `#322e28`.
Zewnętrzne rogi około 5 px, wewnętrzne prawie proste; pomiędzy kontrolkami szczelina 2 px.
Referencja: tekst 12 px, padding 5 px / 8 px. Nazwy pozostają widoczne.

Zachowaj obecne działania, skróty i stany: `Podtrzymaj` / `Zatrzymaj`, `Przekaż`,
trwające przekazanie oraz `Wyczyść i kontynuuj`, jeśli występują w danym stanie.
Nie zmieniaj logiki przycisków w ramach stylizacji. Klawisze mogą mieć mniejszą, pomocniczą
etykietę; nie wolno usuwać ich działania tylko dlatego, że makieta pomija widoczny skrót.
Przycisk agentów używa tej samej rodziny kontrolek, w obrębie sekcji postępu.

Hover: mała zmiana jasności. Fokus: czytelny natywny. Stan niedostępny i stan oczekiwania
mają zachować znaczenie. Nie udawaj kliknięcia sukcesem, zanim istniejąca operacja się powiedzie.
W silniku 2.1.293 unikaj `plain` na malowanym tle: P-018 opisuje niekontrolowane odwracanie kolorów.
Jeśli API nie pozwala odtworzyć połączonych rogów, zastosuj dwa sąsiadujące natywne przyciski.
Zachowanie i hierarchia są ważniejsze od identycznego promienia.

## 8. Mała szerokość i przypadki brzegowe

- Najpierw zawijaj metadane i kafelki; nie zmniejszaj tekstu do nieczytelnego rozmiaru.
- Poniżej szerokości pozwalającej na trzy kolumny przenieś etykietę nad środek i prawą liczbę.
  Przyciski mogą wejść w kolejny wiersz, ale pozostają we własnym pasku.
- Kafelki zawijają się do następnych rzędów. Nie ściskaj wszystkich zadań w jedną cienką kreskę.
- Przy dużej liczbie pozycji pokaż do dwóch rzędów w podglądzie; resztę udostępnij kontrolką
  `Wszystkie zadania · N`, otwierającą listę zadań w rozszerzonym panelu `relai-progress`.
  Licznik nadal obejmuje całą listę.
  Nie usuwaj nadmiarowych zadań ze źródła i nie chowaj ich bez informacji.
- Przy braku źródła pokaż komunikat słowny; bez pustej listy imitującej 0%.
- 0/N: wszystkie kafelki oczekują, 0%. N/N: wszystkie ukończone, 100%.
  Zachowaj istniejące pierwszeństwo źródeł i reguły zakończenia pracy załogi.
- Zadania zakończone błędem nie powiększają licznika ukończonych.
- Terminal: te same nazwy i stany w zwartej postaci tekstowej; brak grafik nie oznacza braku treści.

## 9. Miejsca implementacji i ograniczenia silnika

Przed zmianą sprawdź aktualne źródła, ponieważ E9 jest w toku:

- `core/panel/theme.mjs`: wspólne tokeny wyglądu pasków.
- `core/panel/progress.mjs`: zachowanie indywidualnych pozycji obok agregatu.
- `panel/hooks/register.tsx`: wygląd paska planu.
- `cache-keeper/hooks/register.tsx`: wygląd cache i grupy istniejących przycisków.
- `progress/hooks/register.tsx`: kafelki zadań, licznik, dostęp do szczegółów.
- `core/tools/sync-panel-core.js`: generowanie kopii rdzenia do pluginów; kopii nie edytuj ręcznie.

To natywny renderer Claude Code Mods, nie strona WWW. Ograniczenia udokumentowano w
`docs/PULAPKI.md`, P-017 i P-018. `Text` nie udostępnia rozmiaru fontu; przyjmij natywną
typografię, a większe liczby, jeśli wykonalne, rysuj istniejącą metodą SVG na desktopie.
SVG jest prezentacją, nie zamiennikiem klikalnego `Button`. Nie używaj `foreignObject`.
Kod z `$` pozostaje w module hooków; owijacz zawierający wynik `next(e)` nie dostaje `width`.
Wszystkie trzy mody zachowują przekazanie wyniku `next(e)` i nie zasłaniają innych pasków.

Wybór wyglądu w tym briefie aktualizuje wcześniejszą preferencję pełnych kolorowych ramek.
Przy implementacji odnotuj go zgodnie z zasadami aktywnego etapu; tego dokumentu nie traktuj
jako uruchomienia E9 w Codeksie ani polecenia zmiany zamrożonego planu bez datowanego aneksu.

## 10. Kryteria odbioru

- Trzy osobne paski, delikatne tła, żadnych pełnych kolorowych ramek wokół nich.
- Wspólna lewa kolumna etykiet i wspólna prawa krawędź liczb; przyciski w środku paska cache.
- Postęp reprezentowany małymi, nazwanymi kafelkami z rzeczywistymi stanami konkretnych zadań.
- Przykład z niekolejno ukończonymi pozycjami pokazuje poprawne kafelki i poprawny licznik.
- Nie zmieniają się działania przycisków, rachunki, źródła postępu ani wykrywanie projektu.
- Brak obciętych liczb, nachodzących kontrolek i znikających innych modów przy szerokim oknie
  oraz przy 90 i 40 kolumnach; nadmiarowe zadania mają dostępną pełną listę.
- Testy rdzenia i modów dotyczące zmienianych miejsc, synchronizacja rdzenia, kontrola typów
  i walidacja pluginów przechodzą; desktop i terminal sprawdzone na żywo.
- Pokaż użytkownikowi rzeczywisty zrzut trzech pasków oraz listę ograniczeń API, które wpłynęły
  na odwzorowanie stylu. Domknij dokumentację zgodnie z rytuałem E9.
