# SZABLONY — rusztowania promptu

Uzupełnienie [REGULY.md](REGULY.md). Trzy rusztowania dla trzech kształtów zadania. Merytoryka
portowana z `nidhinjs/prompt-master` (MIT, © 2026 Nidhin Joseph Nelson); nota źródła w `LICENSE`.

**Czytasz wyłącznie ten rozdział, który pasuje do rozpoznanego kształtu.** Nie ładujesz całego
pliku „na wszelki wypadek" — baza reguł ma zostać tania w każdym wywołaniu (ryzyko O8).

## Jak rozpoznać kształt

| Kształt | Rozpoznajesz po tym, że zadanie… | Rusztowanie |
|---|---|---|
| **Zmiana w kodzie** | dotyka plików: poprawka, nowa funkcja, refaktor, test, migracja | [1](#1--zmiana-w-kodzie) |
| **Analiza i rozpoznanie** | ma zwrócić wiedzę, nie zmianę: diagnoza, porównanie wariantów, pomiar, przegląd | [2](#2--analiza-i-rozpoznanie) |
| **Praca dokumentacyjna** | produkuje tekst dla człowieka: dokument, opis, instrukcja, wpis, komunikat | [3](#3--praca-dokumentacyjna) |

Kształtu nie da się rozstrzygnąć → bierzesz rusztowanie **1**, jeśli zadanie w ogóle dotyka plików;
w przeciwnym razie **2**. Zadanie rozpadające się na dwa kształty jest zadaniem podwójnym — wraca
do człowieka jako podział na prompt pierwszy i drugi (wzorzec „dwa zadania w jednym zdaniu").

W każdym rusztowaniu **kryterium sukcesu stoi w sekcji `Gotowe, gdy`**, a **granica zakresu
w sekcji `Zakres`**. To są dwa miejsca, których nie wolno zostawić pustych — brak któregokolwiek
jest brakiem krytycznym, więc zamienia się w pytanie albo w oznaczone dopowiedzenie.

---

## 1 — Zmiana w kodzie

```
[Czynność] w [ścieżka/do/pliku] — [funkcja albo komponent].

Stan teraz:
[co ten kod robi dzisiaj — konkretnie, nie „działa źle"]

Stan docelowy:
[co ma robić po zmianie]

Zakres:
- zmieniasz wyłącznie: [plik / funkcja / sekcja]
- nie ruszasz: [lista plików i obszarów, które zostają nietknięte]

Ograniczenia:
- [wersja języka i biblioteki; konwencje projektu]
- bez nowych zależności
- zachowujesz [sygnatury / kontrakt API / nazwy publiczne]

Gotowe, gdy:
- [warunek binarny 1 — sprawdzalny komendą albo stanem pliku]
- [warunek binarny 2]
```

**Gdy prompt idzie do agenta z dostępem do dysku i terminala**, doklejasz blok granic działania:

```
Granice działania:
- wolno: odczyt, edycja i uruchomienie kontroli w obrębie zakresu
- zatrzymujesz się i pytasz przed: skasowaniem pliku, dodaniem zależności, zmianą schematu danych,
  operacją nieodwracalną i wyjściem poza zakres
- po każdym kroku meldujesz, co zostało zrobione
```

**Czego pilnujesz najbardziej:** ścieżki pliku i listy „nie ruszasz". Polecenie bez kotwicy w pliku
jest najczęstszą przyczyną zmiany w złym miejscu.

---

## 2 — Analiza i rozpoznanie

```
[Pytanie albo zadanie analityczne — jedno, precyzyjne]

Materiał:
[co jest wejściem: pliki, dane, zakres repozytorium, wynik wcześniejszego pomiaru]

Zakres:
- analizujesz wyłącznie: [obszar]
- niczego nie zmieniasz w plikach ⟨gdy analiza ma być czysto czytająca⟩

Zwróć:
1. Wniosek
2. Założenia, na których stoi
3. Dowody — stan plików, liczby, cytaty z materiału
4. Wykonane kontrole i ich wynik
5. Pozostała niepewność — co zostało niesprawdzone i dlaczego

Gotowe, gdy:
- [warunek: każdy wniosek ma wskazane źródło / liczba pochodzi z komendy, nie z oszacowania]

Nie podajesz zapisu toku rozumowania. Uzasadnienie zwięzłe i związane z decyzją.
Podajesz wyłącznie to, czego jesteś pewien; przy niepewności mówisz o niej wprost.
```

**Czego pilnujesz najbardziej:** kontraktu dowodowego. Analiza bez wypisanych założeń i dowodów
wygląda tak samo, gdy jest prawdziwa i gdy jest zmyślona.

---

## 3 — Praca dokumentacyjna

```
Napisz [rodzaj dokumentu] o [temat].

Odbiorca:
[kto to przeczyta i co już wie]

Cel:
[co czytelnik ma wiedzieć albo zrobić po przeczytaniu]

Materiał:
[skąd biorą się fakty: pliki, wcześniejsze ustalenia, pomiar]

Zakres:
- piszesz wyłącznie: [sekcja / plik]
- nie ruszasz: [pozostałe sekcje, sąsiednie dokumenty]

Forma:
- [długość: liczba zdań, akapitów albo słów]
- [struktura: nagłówki, tabela, lista — wypisana wprost]
- [ton i język]

Gotowe, gdy:
- [warunek: każde twierdzenie ma pokrycie w materiale]
- [warunek formalny: długość, struktura, brak obietnic ponad stan faktyczny]
```

**Czego pilnujesz najbardziej:** długości i pokrycia w materiale. „Napisz streszczenie" bez liczby
zdań i bez wskazania źródła produkuje tekst, który brzmi dobrze i nie jest sprawdzalny.

---

## Blok kontekstu projektu

Doklejany **do każdego** z trzech rusztowań, gdy zadanie opiera się na wcześniejszych
rozstrzygnięciach. Stoi w **pierwszej jednej trzeciej** promptu — przed treścią zadania.

```
## Kontekst projektu (przeniesiony)
- [rozstrzygnięcie z numerem albo nazwą — jedno zdanie każde]
- [zasada obowiązująca w tym zadaniu]
- [stan: co już działa, co już próbowano i nie zadziałało]
```

Pozycje wymieniasz **z nazwy albo numeru**. „Dołączono kontekst projektu" nie jest blokiem
kontekstu — człowiek ma widzieć, co dokładnie doleciało, żeby móc to odrzucić.

Blok wypełnia się dopiero wtedy, gdy warstwa ma dostęp do pamięci projektu. Dopóki go nie ma,
sekcja **nie powstaje** — pusty nagłówek jest gorszy niż jego brak.

---

## Przykład — rusztowanie 2 na realnym zdaniu

**Przed:**

```
sprawdź, czemu start sesji jest taki ciężki
```

**Po:**

```
Ustal, które pozycje warstwy czytanej przy starcie sesji przekraczają swoje progi cząstkowe
i o ile.

Materiał: docs/STATE.md, sekcja „Stan otwartych ryzyk" w docs/DZIENNIK.md, docs/USTAWIENIA.md
(wiersz „Budżet startu sesji"). ⟨dopowiedziane: lista plików — z wiersza progów w ustawieniach⟩

Zakres:
- mierzysz wyłącznie pliki wymienione wyżej
- niczego nie zmieniasz ⟨dopowiedziane: analiza czytająca — z rodzaju zadania⟩

Zwróć:
1. Wniosek — które pozycje są ponad progiem
2. Założenia — co liczysz jako warstwę startową
3. Dowody — waga każdej pozycji w KB i jej próg, liczone komendą
4. Wykonane kontrole — suma pozycji wobec budżetu całkowitego
5. Pozostała niepewność

Gotowe, gdy każda liczba pochodzi z uruchomionej komendy, a nie z oszacowania.
⟨dopowiedziane: kryterium sukcesu — z zasady „dowodzisz efektem, nie zdarzeniem"⟩
```

**Zdanie podsumowujące:** dołożono listę mierzonych plików, kontrakt dowodowy i warunek „liczba
z komendy"; zakres zawężono do odczytu, bo oryginał nie prosił o żadną zmianę.
