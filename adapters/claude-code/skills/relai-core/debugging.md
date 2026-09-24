# relai-core — procedura „coś nie działa"

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy człowiek zgłasza usterkę („coś nie działa",
„nie działa", „błąd", „sypie się", „wywala się", „it's broken", „doesn't work", „it crashes") albo
gdy sam trafiasz na zachowanie, którego nie rozumiesz — test pada, komenda kończy się błędem, wynik
różni się od oczekiwanego. Czytasz go w całości, zanim dotkniesz kodu.

Cel jest jeden: **poprawka potwierdzona tym samym odtworzeniem, które pokazało błąd**. Poprawka bez
odtworzenia jest zgadywaniem, nawet gdy trafia.

## Krok 1 — odtworzenie

Zanim cokolwiek zmienisz, **wywołaj błąd sam**: jedna komenda (test, skrypt, zapytanie, kroki
w przeglądarce) i jej wynik zapisany dosłownie — komunikat, kod wyjścia, fragment logu. Najkrótsza
komenda, która daje ten sam objaw, jest lepsza od pełnej ścieżki.

- **Człowiek podał objaw, ale nie kroki** → jedno pytanie: co zrobił, co zobaczył, co spodziewał się
  zobaczyć. Nie zgadujesz kroków.
- **Nie da się odtworzyć** (błąd produkcyjny bez logów, zależność od danych, których nie masz) →
  mówisz to wprost i proponujesz, co zebrać (log, zrzut danych bez sekretów, wersję), zamiast
  poprawiać w ciemno.
- **Najpierw zajrzyj do `docs/PULAPKI.md`**, jeśli istnieje — szukasz po słowie z objawu. Znana
  pułapka ma gotowe obejście i kończy procedurę na kroku 4.

## Krok 2 — jedna hipoteza naraz

Wypisz dwie–trzy możliwe przyczyny, a potem **sprawdzaj po jednej**, zaczynając od najtańszej do
sprawdzenia. Każda hipoteza kończy się **dowodem**: wynikiem komendy, wartością w logu, testem,
który przechodzi albo pada. „Kod wygląda poprawnie" nie jest dowodem.

- Hipoteza **potwierdzona** → krok 3.
- Hipoteza **odrzucona** → zapisujesz jednym zdaniem, co ją wykluczyło, i bierzesz następną.
- **Trzy hipotezy odrzucone** → zatrzymujesz się i piszesz człowiekowi raport (wzór niżej): co
  odtworzone, co wykluczone i czym, jaka jest następna hipoteza. Nie strzelasz kolejnymi
  poprawkami — każda niesprawdzona zmiana zaciera ślad.

Przy sprawdzaniu nie zmieniasz dwóch rzeczy naraz. Tymczasowy wydruk albo log diagnostyczny
usuwasz przed krokiem 4.

## Krok 3 — najmniejsza poprawka

Zmieniasz **tylko to, co usuwa potwierdzoną przyczynę**. Porządki, refaktor i „skoro już tu jestem"
idą osobno — w trakcie etapu jako sygnał odchylenia (skill `relai-planning`), poza etapem jako
propozycja w jednym zdaniu.

Projekt ma testy (wiersz `Podejście do testów` w `docs/USTAWIENIA.md`) → **najpierw test, który
odtwarza błąd i pada**, potem poprawka. Pada już istniejący test → on jest tym testem i drugiego
nie dopisujesz. Nowy test dopisujesz tylko wtedy, gdy żaden nie łapał błędu, i **uruchamiasz go
przed poprawką**, żeby pokazać, że pada — test dopisany razem z poprawką niczego nie dowodzi.
Przypadki sąsiednie, które zauważysz po drodze (pusta lista, brak pola), idą do raportu jako
propozycja, nie do tej poprawki.

## Krok 4 — dowód na tym samym odtworzeniu

Uruchamiasz **dokładnie tę samą komendę** z kroku 1 i pokazujesz nowy wynik obok starego. Potem
pełny zestaw testów projektu, jeśli istnieje — poprawka nie może psuć czegoś obok. Dopiero teraz
mówisz, że naprawione.

Wynik się nie zmienił → wracasz do kroku 2; poprawka zostaje cofnięta, zanim sprawdzisz następną
hipotezę.

## Krok 5 — ślad

| Przyczyna | Dokąd idzie |
|---|---|
| nieoczywiste zachowanie narzędzia, środowiska, powłoki albo kolejności kroków — powtórzy się w innym projekcie na tej samej maszynie | wpis `P-NNN` w `docs/PULAPKI.md` wg `.claude/relai/templates/SPEC_PULAPKI.md` (objaw dosłowny, przyczyna, obejście jako komenda, zasięg z wersją); pierwszy wpis zakłada plik i linię odsyłacza w `CLAUDE.md` — w tej kolejności |
| błąd w kodzie tego projektu | wpis w `docs/DZIENNIK.md` przy najbliższym zapisie: objaw, przyczyna, poprawka, dowód |
| człowiek poprawił **Twój sposób** szukania | lekcja w `docs/LEKCJE.md` (reakcja na korektę w `SKILL.md`) |

Jedna sprawa bywa pułapką i lekcją naraz — wtedy powstają oba wpisy i wskazują na siebie.

## Raport dla człowieka

Po naprawie albo po trzeciej odrzuconej hipotezie piszesz krótko, w tej kolejności:

```
Odtworzenie: `npm test -- booking` → „TypeError: Cannot read properties of undefined (reading 'date')", kod 1
Przyczyna: formularz wysyła pusty `slot`, gdy nikt nie kliknął godziny (sprawdzone logiem żądania)
Wykluczone: strefa czasowa (test z UTC przechodzi), wersja biblioteki dat (bez zmian od tygodnia)
Poprawka: walidacja `slot` w `src/booking/form.ts` + test „pusty slot daje komunikat"
Dowód: ta sama komenda → 14/14 testów, kod 0; pełny zestaw 212/212
Ślad: wpis w dzienniku (błąd w naszym kodzie, nie pułapka)
```

Bez naprawy linie „Poprawka" i „Dowód" zastępuje linia **„Następna hipoteza"** z tym, czego
potrzebujesz od człowieka, żeby ją sprawdzić.
