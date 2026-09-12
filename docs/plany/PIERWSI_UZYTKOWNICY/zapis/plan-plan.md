# PLAN — Płatności online w sklepie demo

Utworzony: 2026-09-12 · Status planu: **DO AKCEPTACJI** · Model wykonawczy etapów: Opus do
wszystkich etapów (wybór użytkownika, ustalony w Claude Code) · Status wdrożenia:
[STATUS.md](STATUS.md)

## 1. Streszczenie

Sklep dzisiaj nie potrafi przyjąć ani złotówki: istnieje jedna funkcja dodająca produkt do koszyka
po stronie przeglądarki i nic poza nią (FAKT — `src/koszyk.js`, stan na 2026-09-12). Plan wprowadza
płatność kartą przy składaniu zamówienia — klient przechodzi na hostowaną stronę operatora
płatności, płaci, a zamówienie samo przechodzi w stan „opłacone". Dla klienta zmienia się to, że
koszyk kończy się realnym zamówieniem i potwierdzeniem zapłaty; dla właściciela — że widzi, co
zostało opłacone, bez pytania kogokolwiek.

Płatność wymaga zamówienia istniejącego **po stronie serwera**, a tego w projekcie nie ma —
dlatego pierwszy etap dokłada minimalne zaplecze zamówień. To nie jest rozszerzanie zakresu, tylko
warunek konieczny: kwota do zapłaty licząca się w przeglądarce jest kwotą, którą klient może sobie
zmienić. Koszt całości: 5 etapów, 8–12 sesji roboczych (SZACUNEK).

## 2. Cele i nie-cele

**Cele:**

1. Klient płaci kartą za zawartość koszyka i dostaje potwierdzenie (sprawdzalne: zamówienie bez
   potwierdzonej płatności nigdy nie osiąga stanu „opłacone").
2. Kwota do zapłaty jest wyliczana **wyłącznie na serwerze**, z cen pobranych z katalogu po stronie
   serwera (sprawdzalne: podmiana ceny w żądaniu z przeglądarki nie zmienia kwoty sesji płatności).
3. Potwierdzenie płatności przychodzi kanałem serwer–serwer i jest odporne na powtórzenie
   (sprawdzalne: to samo zdarzenie wysłane dwa razy daje jedną płatność w bazie).
4. Porzucona płatność nie zostawia zamówienia w stanie zawieszonym (sprawdzalne: po upływie okna
   płatności zamówienie ma stan końcowy, nie „w trakcie").
5. Właściciel sklepu widzi listę zamówień ze stanem płatności (sprawdzalne: zamówienie opłacone
   i nieopłacone są rozróżnialne bez zaglądania do panelu operatora).

**Nie-cele:**

- Zwroty, korekty i częściowe zwroty — proces pozostaje ręczny w panelu operatora.
- Płatności cykliczne, subskrypcje, płatność odroczona.
- Metody inne niż karta w pierwszej wersji (BLIK, przelew natychmiastowy, portfele) — do dołożenia
  po wdrożeniu, wybrany wariant tego nie blokuje.
- Faktury i dokumenty księgowe.
- Konta klientów i logowanie — zamówienie składa gość, identyfikowany numerem zamówienia i mailem.
- Wdrożenie produkcyjne i realne przyjmowanie pieniędzy — plan kończy się działającym trybem
  testowym operatora (patrz sekcja 9).

## 3. Stan wyjściowy

- `src/koszyk.js` zawiera jedną funkcję `dodajDoKoszyka(koszyk, produkt)` zwracającą nową tablicę
  (FAKT).
- Nie ma katalogu produktów, zamówień, serwera, bazy danych ani interfejsu (FAKT).
- `package.json` nie deklaruje żadnych zależności ani skryptów uruchomieniowych — projektu nie da
  się dziś uruchomić (FAKT).
- Projekt nie jest objęty gitem, więc nie ma historii zmian ani cofania (FAKT — ryzyko R1
  w dzienniku).
- Brak jakichkolwiek testów i brak narzędzia do ich uruchamiania (FAKT).
- Podejście do testów ustalone: testy krytycznych ścieżek, bez pełnego TDD (FAKT —
  `docs/USTAWIENIA.md`, 2026-09-12).

## 4. Warianty

| Wariant | Na czym polega | Plusy | Minusy | Werdykt |
|---|---|---|---|---|
| A. Hostowana strona płatności operatora (redirect + webhook) | Serwer tworzy sesję płatności, przekierowuje klienta na stronę operatora, potwierdzenie wraca webhookiem | Dane kartowe nigdy nie dotykają naszego serwera — najwęższy możliwy zakres zgodności PCI; 3D Secure po stronie operatora; najmniej kodu | Klient opuszcza naszą domenę; wygląd strony płatności ograniczony brandingiem operatora | **WYBRANY** — przy projekcie bez serwera, bez testów i bez gita jedyny wariant, w którym najgroźniejsza część problemu (dane kartowe) nie jest nasza |
| B. Formularz karty osadzony w sklepie (pola operatora w naszym UI) | Klient zostaje u nas, numer karty trafia do ramki operatora osadzonej na naszej stronie | Pełna kontrola nad wyglądem i ścieżką zakupu; brak przeskoku domeny | Szerszy zakres samooceny PCI (nasza strona serwuje formularz); więcej kodu po naszej stronie; więcej stanów błędu do obsłużenia | **ODRZUCONY** — wygląd nie jest wart poszerzenia odpowiedzialności za dane kartowe w pierwszym wdrożeniu; wariant zostaje możliwy później, bo model zamówień z E1 się nie zmienia |
| C. Przelew tradycyjny z ręcznym potwierdzaniem | Zamówienie generuje dane do przelewu, właściciel odznacza wpłatę ręcznie | Zero integracji, zero prowizji, zero zależności zewnętrznej; działa natychmiast | Klient czeka na wysyłkę do dwóch dni; ktoś musi codziennie sprawdzać konto; nie realizuje celu „płacę i mam" | **ODRZUCONY** — nie rozwiązuje problemu, tylko przenosi go na człowieka; sensowny wyłącznie jako tryb awaryjny, gdy operator jest niedostępny (patrz sekcja 8) |
| D. Gotowa platforma sklepowa zamiast własnej integracji | Sklep przenosi się na hostowaną platformę e-commerce, która ma płatności w standardzie | Płatności, panel i bezpieczeństwo z pudełka; brak kodu do utrzymania | Przekreśla istniejący projekt i jego cel; abonament; ograniczona kontrola nad zachowaniem sklepu | **ODRZUCONY** — projekt jest własną aplikacją i ma nią zostać; to wariant „nie budujmy tego", wart nazwania, ale nie wybrania |

## 5. Rozwiązanie — jak to działa

Przebieg jednego zakupu:

1. Klient kompletuje koszyk w przeglądarce — lista identyfikatorów produktów i ilości. **Ceny nie
   wchodzą do tej listy.**
2. Klient składa zamówienie. Serwer bierze identyfikatory, pobiera ceny z własnego katalogu, liczy
   kwotę w **groszach jako liczbach całkowitych** i zapisuje zamówienie w stanie
   `oczekuje_na_platnosc` razem z numerem zamówienia i wyliczoną kwotą.
3. Serwer tworzy u operatora sesję płatności na tę kwotę, zapisuje jej identyfikator przy
   zamówieniu i przekierowuje klienta na stronę operatora.
4. Klient płaci. Operator przekierowuje go z powrotem — na stronę powodzenia albo anulowania.
   **Ten powrót niczego nie potwierdza**: to tylko informacja dla oka.
5. Operator wysyła webhook na nasz serwer. Serwer weryfikuje podpis żądania, sprawdza, czy tego
   zdarzenia jeszcze nie przetworzył, porównuje kwotę i walutę z zamówieniem i dopiero wtedy
   przestawia je na `oplacone`.
6. Zamówienie nieopłacone w oknie płatności przechodzi w `wygaslo` i przestaje czekać.
7. Właściciel widzi listę zamówień z ich stanami i identyfikatorem płatności, po którym można je
   odnaleźć w panelu operatora.

Dwa punkty rozstrzygają o bezpieczeństwie całości i oba leżą po naszej stronie: **kwota liczona na
serwerze** (krok 2) i **webhook jako jedyne źródło prawdy o zapłacie** (krok 5). Reszta to
przenoszenie klienta między stronami.

Stany zamówienia: `nowe` → `oczekuje_na_platnosc` → `oplacone` | `wygaslo` | `nieudane`. Przejścia
inne niż wymienione są niedozwolone i mają być odrzucane, nie logowane i przepuszczane.

## 6. Etapy

| Etap | Nazwa | Zakres | Szacunek | Efekt widoczny |
|---|---|---|---|---|
| E1 | Zamówienie po stronie serwera | Minimalny serwer HTTP, katalog produktów z cenami, składanie zamówienia, kwota liczona na serwerze w groszach, trwałość zamówień, sposób uruchomienia projektu | SZACUNEK 2–3 sesje | Koszyk zamienia się w zamówienie z numerem i kwotą, które przeżywa restart — dziś nie przeżywa odświeżenia strony |
| E2 | Sesja płatności u operatora | Klucze w `.env`, tworzenie sesji płatności na kwotę z zamówienia, przekierowanie, strony powrotu (powodzenie / anulowanie) | SZACUNEK 2 sesje | Klient klika „Zapłać" i trafia na stronę płatności operatora z właściwą kwotą |
| E3 | Webhook i potwierdzanie zapłaty | Odbiór webhooka, weryfikacja podpisu, idempotencja po identyfikatorze zdarzenia, porównanie kwoty i waluty, przejście w `oplacone` | SZACUNEK 2–3 sesje | Opłacone zamówienie samo pokazuje się jako opłacone — bez klikania czegokolwiek ręcznie |
| E4 | Wygasanie i ścieżki nieszczęśliwe | Okno płatności i wygasanie, powrót z anulowania, płatność nieudana, webhook po wygaśnięciu, ponowna próba zapłaty | SZACUNEK 1–2 sesje | Porzucona płatność nie zostawia zamówienia w zawieszeniu, a klient może spróbować zapłacić drugi raz |
| E5 | Widok zamówień dla właściciela | Lista zamówień ze stanem płatności, filtr po stanie, identyfikator płatności do odszukania w panelu operatora | SZACUNEK 1–2 sesje | Właściciel widzi na jednym ekranie, co zostało opłacone, a co nie |

Suma: SZACUNEK 8–12 sesji roboczych. Kamień milowy „da się zapłacić i sklep o tym wie" zamyka się
po E3 (SZACUNEK 6–8 sesji) — E4 i E5 podnoszą jakość, ale nie są warunkiem pierwszej realnej
transakcji.

Testy krytycznych ścieżek zgodnie z ustawieniem projektu obejmują: wyliczenie kwoty na serwerze
(E1), idempotencję webhooka (E3), zgodność kwoty webhooka z kwotą zamówienia (E3) i wygasanie
zamówienia (E4). Pozostały kod zostaje bez testów automatycznych — świadomie.

## 7. Ryzyka

| # | Ryzyko | Poziom | Mitygacja |
|---|---|---|---|
| 1 | Kwota podstawiona z przeglądarki — klient płaci 1 zł za zamówienie warte 500 zł | wysoki | Serwer nigdy nie przyjmuje ceny z żądania; kwota liczona z własnego katalogu (E1). Test krytyczny w E1: żądanie z podmienioną ceną daje kwotę z katalogu. W E3 druga bramka — porównanie kwoty z webhooka z kwotą zamówienia |
| 2 | Webhook zgubiony albo dostarczony wielokrotnie → zamówienie nieopłacone mimo zapłaty albo podwójne księgowanie | wysoki | Idempotencja po identyfikatorze zdarzenia operatora, zapisywanym przed przetworzeniem (E3); test krytyczny na powtórzonym zdarzeniu; w E5 widok pozwalający znaleźć zamówienie po identyfikatorze płatności i pogodzić je ręcznie |
| 3 | Webhook podrobiony przez kogokolwiek, kto zna nasz adres | wysoki | Weryfikacja podpisu żądania **przed** jakimkolwiek odczytem treści (E3); żądanie bez poprawnego podpisu odrzucane bez zmiany stanu. Test krytyczny: żądanie z błędnym podpisem nie zmienia stanu zamówienia |
| 4 | Klucze operatora w repozytorium | wysoki | Klucze wyłącznie w `.env` objętym `.gitignore` (E2); w kodzie tylko nazwy zmiennych. Projekt nie ma dziś gita — ryzyko R1 w dzienniku — więc `.gitignore` powstaje razem z repozytorium, zanim pojawi się pierwszy klucz |
| 5 | Błędy zaokrągleń przy kwotach ułamkowych | średni | Kwoty wyłącznie w groszach jako liczby całkowite, na całej długości drogi (E1); żadnych liczb zmiennoprzecinkowych w wyliczeniu ceny. Waluta zapisywana przy zamówieniu i porównywana w E3 |
| 6 | Zamówienie zablokowane na zawsze w `oczekuje_na_platnosc` | średni | Okno płatności i przejście w `wygaslo` (E4); webhook przychodzący po wygaśnięciu tworzy zapis „opłacone po terminie" i oznacza zamówienie do ręcznego rozstrzygnięcia, zamiast być zignorowany |
| 7 | Praca bez historii zmian — nieudany etap płatności trudno cofnąć | średni | Repozytorium gita przed startem E2, czyli przed pierwszym kluczem i pierwszą integracją (bramka w sekcji 9); do tego czasu etapy są małe i odwracalne ręcznie |
| 8 | Wybór operatora okazuje się zły po wdrożeniu | niski | E1 nie wie nic o operatorze; integracja jest wąska i skupiona w E2–E3, więc wymiana operatora dotyka dwóch etapów, nie całego sklepu |

Ryzyka 1–4 przechodzą do stałego monitorowania w tabeli ryzyk `docs/DZIENNIK.md` przy akceptacji
planu.

## 8. Przypadki brzegowe — rozstrzygnięte

| Sytuacja | Rozstrzygnięcie |
|---|---|
| Klient zamyka przeglądarkę zaraz po przekierowaniu na stronę płatności | Zamówienie czeka w `oczekuje_na_platnosc` do końca okna płatności; decyduje webhook, nie powrót klienta |
| Klient wraca na stronę powodzenia, ale webhook jeszcze nie dotarł | Strona pokazuje „płatność w trakcie potwierdzania" i odświeża stan; zamówienie **nie** przechodzi w `oplacone` na podstawie powrotu klienta |
| Webhook przychodzi po wygaśnięciu zamówienia | Płatność zapisana, zamówienie oznaczone jako wymagające rozstrzygnięcia przez człowieka (zwrot albo realizacja po terminie); nigdy ciche zignorowanie |
| To samo zdarzenie webhooka przychodzi trzeci raz | Rozpoznane po identyfikatorze zdarzenia, odpowiedź „przyjęte", zero zmian stanu |
| Kwota w webhooku różni się od kwoty zamówienia | Zamówienie **nie** przechodzi w `oplacone`; trafia do rozstrzygnięcia przez człowieka z zapisaną różnicą |
| Klient próbuje zapłacić drugi raz za to samo zamówienie | Dopóki zamówienie nie jest opłacone — nowa sesja płatności zastępuje poprzednią; zamówienie opłacone odrzuca kolejną próbę |
| Koszyk pusty albo produkt zniknął z katalogu między dodaniem a złożeniem zamówienia | Zamówienie nie powstaje; komunikat wskazuje produkt, którego nie ma; klient wraca do koszyka |
| Cena produktu zmieniła się między dodaniem do koszyka a złożeniem zamówienia | Obowiązuje cena z chwili składania zamówienia, pokazana klientowi do potwierdzenia przed przejściem do płatności |
| Operator płatności niedostępny | Zamówienie zostaje w `nowe`, komunikat „płatności chwilowo niedostępne"; brak trybu „zapłacę później" (wariant C świadomie odrzucony) |
| Zamówienie na kwotę 0 gr | Sesja płatności nie powstaje; zamówienie od razu `oplacone` z adnotacją „kwota zerowa" |

## 9. Do rozstrzygnięcia przez człowieka

| Sprawa | Konsekwencja | Termin |
|---|---|---|
| Wybór operatora płatności | Blokuje E2 — bez wyboru nie ma do czego się integrować. Wariant A działa z każdym operatorem oferującym hostowaną stronę płatności, więc wybór nie zmienia architektury, tylko nazwy w kodzie | przed startem E2 |
| Konto u operatora: czy w ogóle powstaje, i na jaki podmiot | Blokuje E2 w trybie testowym i całe wdrożenie w trybie produkcyjnym. Przyjmowanie realnych płatności wymaga podmiotu gospodarczego i akceptacji regulaminu operatora — projekt demonstracyjny może zakończyć się na trybie testowym | przed startem E2 |
| Czy projekt dostaje repozytorium gita | Blokuje E2 z powodu ryzyka 4 i 7: pierwszy klucz powinien trafić do `.env` chronionego przez `.gitignore`, a integracja płatności to moment, w którym cofanie zmian zaczyna być potrzebne. Sprawa stoi już w dzienniku jako otwarta (R1) | przed startem E2 |
| Waluta i zakres — jedna waluta czy wiele | Wiele walut rozszerza E1 i E3 o porównania i przeliczenia (SZACUNEK +1 sesja). Domyślnie plan zakłada jedną walutę | przed startem E1 |
| Długość okna płatności | Wpływa na E4 i na to, jak długo towar jest zarezerwowany dla nieopłaconego zamówienia. Domyślnie plan zakłada 15 minut (SZACUNEK — wartość typowa, nie zmierzona w tym projekcie) | przed startem E4 |
| Czy zamówienie wymaga zgody na regulamin i informacji o danych osobowych | Sklep przyjmujący płatności przetwarza dane klienta; brak regulaminu i informacji o przetwarzaniu jest problemem prawnym, nie technicznym. Poza zakresem planu, ale przed realnym wdrożeniem konieczne | przed wdrożeniem produkcyjnym |

## 10. Aneksy

Po akceptacji sekcje 1–9 są zamrożone. Zmiany wyłącznie tutaj, jako datowane aneksy. Odchylenie
fundamentalne (zmiana celu albo wybranego wariantu) → status CZĘŚCIOWO ZREALIZOWANY i nowy plan
z linkiem do tego dokumentu.

---

RelAI (Opus) + Łukasz · 2026-09-12
