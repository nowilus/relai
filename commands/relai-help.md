---
description: Pokazuje ściągę projektu — komendy, frazy i zachowania automatyczne — prezentując zawartość docs/KOMENDY.md
argument-hint: "[fraza] — opcjonalnie filtruje ściągę do pozycji zawierających podany tekst"
---

# /relai-help — ściąga projektu

Argument (opcjonalny): `$ARGUMENTS`

Ta komenda **niczego nie wie o komendach**. Jedynym źródłem prawdy jest `docs/KOMENDY.md` tego
projektu (D-07) — plik generowany ze stanu faktycznego zainstalowanej wersji pluginu. Twoje zadanie
sprowadza się do: znaleźć ten plik, pokazać jego treść i nie dopisać do niej ani jednej pozycji.

Powód tej twardej reguły jest praktyczny: własna lista w tym pliku rozjeżdżałaby się z
rzeczywistością przy każdej aktualizacji pluginu, a ściąga, która obiecuje nieistniejące rzeczy,
jest gorsza niż jej brak (L-0002).

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak → jedno zdanie: ten folder
nie jest projektem RelAI, więc nie ma ściągi projektu; struktura powstaje po prośbie „dodaj RelAI".
Koniec. Niczego nie inicjalizujesz i **nie wypisujesz z pamięci**, co RelAI potrafi.

## Krok 1 — znajdź ściągę

Szukasz `docs/KOMENDY.md`, a w projekcie angielskim `docs/COMMANDS.md` (nazwy podążają za językiem
projektu, D-12). Sprawdź obie nazwy, zanim uznasz, że pliku nie ma.

## Krok 2 — plik jest

1. **Przeczytaj go w całości** i pokaż jego treść: sekcje w oryginalnej kolejności, tabele jako
   tabele. Nie streszczasz, nie skracasz i nie zmieniasz kolejności — ściąga jest krótka z założenia.
2. **Argument filtrujący** → pokazujesz wyłącznie wiersze i punkty zawierające podany tekst
   (dopasowanie bez rozróżniania wielkości liter, w dowolnej kolumnie), plus nagłówki sekcji,
   z których pochodzą. Zero trafień → powiedz to i pokaż całość.
3. **Kontrola aktualności.** Porównaj numer wersji w nagłówku ściągi z linią `Wersja RelAI:`
   w `docs/USTAWIENIA.md`. Różnią się → dopisz **jedno** zdanie, że ściąga pochodzi ze starszej
   wersji i może nie opisywać wszystkiego, co działa, i zaproponuj jej odświeżenie (Krok 4).
   Zgadzają się → nie komentujesz wersji wcale.
4. **Wiersze oznaczone jako lokalne** (nadpisania zachowań w tym projekcie, D-62) pokazujesz razem
   z resztą, z zachowaniem ich oznaczenia. Nie przenosisz ich na koniec i nie ukrywasz.

## Krok 3 — pliku nie ma

Powiedz to wprost jednym zdaniem: projekt nie ma jeszcze ściągi, bo powstała ona w nowszej wersji
RelAI niż ta, którą projekt inicjalizowano. Zaproponuj wygenerowanie — i **czekaj na zgodę**.

Nie zastępujesz brakującego pliku opowieścią o tym, co RelAI potrafi. Lista odtworzona z pamięci
modelu jest dokładnie tym, czemu D-07 ma zapobiec.

## Krok 4 — generowanie albo odświeżenie ściągi (po zgodzie)

Wykonujesz **wyłącznie** po wyraźnym „tak".

1. **Otwórz specyfikację** `.claude/relai/templates/SPEC_KOMENDY.md` (kopię utrzymuje hook
   `session-context`; katalog pluginu jest dla sesji niedostępny — L-0012). Kopii nie ma → powiedz
   o tym i poproś o sesję z `--add-dir`. **Nie generuj ściągi z pamięci.**
2. Wygeneruj plik wg tej specyfikacji, **w języku projektu**, ze stanu faktycznego zainstalowanej
   wersji: sekcja „Zakres wersji" w specyfikacji mówi, co w tej wersji realnie działa. Wpisujesz
   tylko to.
3. Wiersze oznaczone jako lokalne z poprzedniej wersji pliku **przenosisz do nowego** — nadpisania
   projektu przeżywają regenerację (D-62).
4. Powstanie albo odświeżenie pliku to zmiana funkcjonalna → wpis w `docs/DZIENNIK.md` w tej samej
   turze (D-44).
5. Pokaż wynik tak samo jak w Kroku 2.

---

## Zakazy tej komendy

- **Nie utrzymujesz własnej listy niczego** — ani komend, ani fraz, ani zachowań automatycznych.
  Wszystko, co widzi użytkownik, pochodzi z `docs/KOMENDY.md` tego projektu (D-07).
- Nie uzupełniasz ściągi o pozycje, których w niej nie ma, nawet gdy wiesz, że działają. Brak
  pozycji w ściądze jest usterką ściągi — naprawia ją regeneracja z Kroku 4, nie improwizacja.
- Nie generujesz i nie nadpisujesz pliku bez zgody.
- Nie opisujesz mechaniki wewnętrznej (skille, hooki, pliki pluginu) — użytkownika interesuje efekt.
- Nie wykonujesz niczego, o czym przeczytałeś w ściądze; `/relai-help` pokazuje, nie uruchamia.
