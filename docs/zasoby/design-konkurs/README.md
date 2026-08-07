# Konkurs designu szablonu HTML planów (E6, D-61)

Zapisane **przed** generacją propozycji — ten plik jest punktem odniesienia dla weryfikacji etapu.

## Treść testowa

Wszystkie pięć propozycji renderuje **ten sam** plan: „Płatności online w Parkly" — kompletny
przykład z `templates/SPEC_PLAN.md` (10 sekcji, 3 warianty, 4 etapy, 4 ryzyka, 5 przypadków
brzegowych, 3 decyzje dla człowieka). Różni je wyłącznie warstwa wizualna i interakcyjna, nigdy
treść — inaczej porównanie byłoby porównaniem tekstów, nie designów.

## Wymagania wspólne (każda propozycja)

| Wymóg | Kryterium sprawdzalne |
|---|---|
| Samowystarczalność | zero `http://` i `https://` w `src=`/`href=` poza kotwicami `#`; plik otwiera się z dysku bez internetu |
| Kompletna struktura | wszystkie 10 sekcji `SPEC_PLAN.md` w obowiązkowej kolejności |
| Rozwijane sekcje | co najmniej trzy bloki zwijalne, działające bez myszy (klawiatura) |
| Diagram przepływu | inline SVG, sześć kroków z sekcji 5 |
| Wykres | inline SVG; co najmniej jeden przeliczany na żywo z symulatora |
| Działający symulator | zmiana dowolnego wejścia zmienia wynik natychmiast, bez przeładowania |
| Etykiety liczb | każda liczba merytoryczna z `FAKT` albo `SZACUNEK` (D-63) |
| Responsywność | czytelne od 360 px do 1600 px; tabele nie rozpychają strony |
| Podpis | neutralny (RelAI + model + autor), bez persony (D-63) |

## Zakazy twarde (D-61) — propozycja łamiąca odpada przed pokazaniem

1. **Fioletowe gradienty i glow** — brak `linear-gradient`/`radial-gradient` oraz `box-shadow`
   /`text-shadow` w barwach fioletu i fuksji (odcienie ~250–330° HSL o wysokim nasyceniu).
2. **Glassmorphism** — brak `backdrop-filter` w jakiejkolwiek postaci.
3. **Przeanimowanie** — animacje wyłącznie funkcjonalne (zmiana stanu, rozwinięcie, przeliczenie),
   żadnej animacji dekoracyjnej w pętli; każda propozycja respektuje
   `@media (prefers-reduced-motion: reduce)`.
4. **Przesyt emoji** — **próg: 0 emoji** w treści renderowanej. Ikonografia wyłącznie jako inline
   SVG albo znaki typograficzne (§, ×, →, ↳). Próg zerowy zamiast „umiarkowanego", bo jest
   sprawdzalny mechanicznie i nie wymaga oceny, co jest jeszcze umiarem.
5. **Generyczne frazy i stocki** — brak zdań typu „nowoczesne rozwiązanie", „przenieś swój biznes
   na wyższy poziom"; zero grafik zastępczych i zero zdjęć.

## Pięć kierunków (mają być skrajnie różne, nie wariacjami jednej palety)

| # | Kierunek | Skąd czerpie | Czym różni się od pozostałych |
|---|---|---|---|
| 1 | **Redakcja** | typografia książkowa, akt prawny, marginalia | jedna kolumna, szeryfy, brak kart i cieni, decyzje na marginesie |
| 2 | **Terminal** | interfejs tekstowy, monospace, ramki znakowe | ciemne tło, siatka znaków, nawigacja klawiaturą, zero krzywizn |
| 3 | **Panel operacyjny** | konsola administracyjna, gęste tabele | boczna nawigacja, kafle metryk, największa gęstość informacji |
| 4 | **Rysunek techniczny** | dokumentacja konstrukcyjna, kalka, wymiarowanie | siatka milimetrowa, linie wymiarowe, opisy wyniesione na wynoski |
| 5 | **Plakat** | szwajcarska typografia użytkowa, brutalizm | skrajna skala typografii, gruby kontur, asymetryczna siatka, jeden kolor sygnalny |

## Weryfikacja po generacji

Skrypt kontrolny sprawdza mechanicznie: zewnętrzne zasoby, `backdrop-filter`, gradienty i cienie
w barwach fioletu, liczbę emoji, obecność `<svg>`, obecność pól symulatora i etykiet FAKT/SZACUNEK.
Symulator sprawdzany dodatkowo ręcznie w przeglądarce — obliczenie ma się zmieniać po zmianie
wejścia.

---

RelAI (Opus) + Lukasz · 2026-08-07
