# Konkurs designu szablonu HTML planów (E6, D-61a)

Dwie rundy. Runda 1 przepadła w całości — jej wynik i powód porażki są tu zapisane, żeby nikt nie
powtórzył tej drogi.

| Runda | Katalog | Wynik |
|---|---|---|
| 1 | [`runda-1/`](runda-1/) | **odrzucona w całości** 2026-08-07. Kierunki 2–5 (Terminal, Panel operacyjny, Rysunek techniczny, Plakat) odrzucone **na stałe** (D-61b). Kierunek 1 (Redakcja) zachowany jako baza. |
| 2 | [`runda-2/`](runda-2/) | pięć nowych propozycji; **wybrane 1 „Zeszyt" i 3 „Tablica warsztatowa"**, pozostałe trzy odpadły |
| 3 | [`runda-3/blend.html`](runda-3/blend.html) | **blend „Warsztat"** — baza Tablica + pasek górny, karteczki i paleta terakotowa z Zeszytu; czeka na akceptację kierunku |

## Runda 3 — co dokładnie zostało zblendowane

| Element | Skąd | Uwaga |
|---|---|---|
| Kartki sekcji na pinezkach, taśma, lekki obrót | Tablica | pinezki cyklują przez trzy barwy palety zamiast jednej |
| Kalam jako krój prowadzący, Hanken Grotesk w treści | Tablica | bez zmian |
| Spinacz jako mechanizm zwijania | Tablica | bez zmian |
| Pasek górny — pigułka na szkle, odręczny stan pod kątem | **Zeszyt** | wskazany wprost przez Łukasza |
| Karteczki na marginesie (sekcje 1, 2, 9) | **Zeszyt** | wskazane wprost |
| Paleta terakotowa: glina `#c4643c`, musztarda `#d9a134`, szałwia `#5f8a68` | **Zeszyt** | zastępuje błękit w przyciskach, wykresach, numerach i akcentach |
| Tło `#f2e9d8` | pośrednie | korek Tablicy za ciemny, krem Zeszytu za jasny |
| Ruch | ścięty | zostaje tylko to, co niesie informację; **animowana kropka na diagramie usunięta** |

## Czego nauczyła runda 1

Wszystkie pięć propozycji przeszło komplet zakazów D-61 — zero fioletu, zero cieni, zero
glassmorphismu, zero emoji, ostre rogi, brak animacji — i **żadna się nie spodobała**. Lista
zakazów opisuje, czego unikać, i nie niesie żadnej informacji o tym, co ma cieszyć oko.
Zapisane jako lekcja L-0019; skutkiem jest zmiana decyzji D-61 → **D-61a**.

## Treść testowa (obie rundy)

Wszystkie propozycje renderują **ten sam** plan: „Płatności online w Parkly" — kompletny przykład
z `templates/SPEC_PLAN.md` (10 sekcji, 3 warianty, 4 etapy, 4 ryzyka, 5 przypadków brzegowych,
3 decyzje dla człowieka). Różni je wyłącznie warstwa wizualna i interakcyjna — inaczej porównanie
byłoby porównaniem tekstów, nie designów.

## Brief rundy 2 (D-61a) — cechy pożądane

Zapisane **przed** generacją, na podstawie uwag Łukasza po rundzie 1.

| Cecha | Czego oczekujemy |
|---|---|
| Kształt | zaokrąglenia zamiast ostrych rogów; miękkie cienie dozwolone |
| Szkło | **lekki** glassmorphism (`backdrop-filter`) w nieprzytłaczającej dawce |
| Typografia | krój ozdobny — odręczny, kursywa albo monospace z charakterem; nie sam neutralny grotesk |
| Ruch | animacja **służebna**: przepływ na diagramie, płynne rozwijanie, reakcja na najechanie, przeliczany licznik; nic nie rusza się w pętli bez powodu |
| Tło | dekoracyjne SVG i miękkie plamy koloru |
| Kolor | „luźniejsza" paleta, świadomie odsunięta od barw AGRO_HOME |
| Zwijanie | każda propozycja ma **inny mechanizm** pokazywania i chowania sekcji |
| Baza | trzy jasne, dwie ciemne — żeby wybór był świadomy |

## Wymagania techniczne (obie rundy)

| Wymóg | Kryterium sprawdzalne |
|---|---|
| Samowystarczalność | zero `http://`/`https://` w `src=`, `href=` i `url()`; fonty jako `data:font/woff2;base64` |
| Kompletna struktura | wszystkie 10 sekcji `SPEC_PLAN.md` w obowiązkowej kolejności |
| Rozwijane sekcje | co najmniej pięć bloków na `<button aria-expanded>`, działających z klawiatury |
| Diagram przepływu | inline SVG, sześć kroków z sekcji 5 |
| Wykres | inline SVG; co najmniej jeden przeliczany na żywo z symulatora |
| Działający symulator | dziewięć wejść; zmiana dowolnego zmienia wynik natychmiast |
| Etykiety liczb | każda liczba merytoryczna z `FAKT` albo `SZACUNEK` (D-63) |
| Responsywność | od 360 px do 1600 px bez poziomego przewijania strony |
| Ruch wyłączalny | `@media (prefers-reduced-motion: reduce)` w każdym pliku |
| Podpis | neutralny (RelAI + model + autor), bez persony (D-63) |

## Zakazy, które zostają po zmianie D-61a

1. **Fioletowe gradienty i glow** — żaden kolor w pliku nie może mieć odcienia 250–330° HSL przy
   nasyceniu powyżej 25%. Sprawdzane mechanicznie na wszystkich barwach heksadecymalnych.
2. **Przesyt emoji** — próg **0**. Ikonografia wyłącznie jako inline SVG albo znaki typograficzne.
3. **Generyczne frazy i stocki** — zero „nowoczesnych rozwiązań", zero grafik zastępczych.

Zniesione względem D-61: zakaz zaokrągleń, glassmorphismu i animacji.

## Fonty

Osadzone w base64, licencje w [`../fonts/LICENCJE.md`](../fonts/LICENCJE.md). Kroje systemowe
Microsoftu (Comic Sans MS, Segoe Script) mogą wystąpić tylko jako nazwa w `font-family` —
osadzenie ich w rozsyłanym pliku łamie licencję.

## Weryfikacja

Skrypt kontrolny sprawdza mechanicznie: zasoby zewnętrzne, osadzenie fontów i brak niepodmienionych
znaczników, barwy fioletowe, liczbę emoji, komplet sekcji, liczbę SVG, pola symulatora, etykiety,
bloki zwijalne, `prefers-reduced-motion` oraz obecność cech wymaganych briefem (zaokrąglenia,
glassmorphism, ruch). Symulatory i mechanizmy zwijania sprawdzane dodatkowo na żywo w przeglądarce.

---

RelAI (Opus) + Lukasz · runda 1: 2026-08-07 · runda 2: 2026-08-08
