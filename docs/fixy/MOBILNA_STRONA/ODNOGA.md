# ODNOGA — Strona na telefonie: Film i Biurko bez ucięć i z przewijaniem po przystankach

Plan: brak (wątek samodzielny; plan-rodzic [STRONA_RELAI](../../archiwum/plany/STRONA_RELAI/STATUS.md) zamknięty 2026-10-18) · Etap-źródło: — · Utworzona: 2026-10-19 · Status: **OTWARTA** ·
Wykonawca: Opus 5.5 w sesji, która wątek założyła (prompt odnogi pominięty — praca trwa w tej samej sesji)

## Cel

Obie wersje strony dają się przejść na małym telefonie (375 px szerokości, widok Safari ok. 550 px
wysokości) bez uciętych elementów i bez zgadywania. W Filmie terminal mieści się z polem promptu,
komendy przewija się palcem w bok, a pionowy swipe idzie do następnej sekcji. Przycisk w nagłówku
stoi stale. Na Biurku 3D jeden swipe to jeden przystanek, a klikalne przedmioty są oznaczone.
Łukasz przyjmuje to na swoim telefonie.

## Skąd się wzięła

2026-10-19, po publikacji strony i przebudowie Biurka bez sceny (BIURKO_PLAKAT), Łukasz przeklikał
obie wersje na iPhonie (ok. 375 px). Zgłosił pięć problemów.

1. W Filmie, w sekcji 5 (panel), terminal jest za wysoki i ucina pole promptu.
2. Sekcja 15 komend: pionowy swipe przesuwa komendy w bok zamiast przejść dalej.
3. Na ostatniej sekcji przycisk „Zainstaluj” w nagłówku bywa w pół schowany.
4. Na Biurku 3D jeden swipe z rozpędem przelatuje przez wszystkie przystanki aż do końca.
5. Nic nie mówi, że teczkę, szuflady, dokumenty i laptopa można kliknąć.

Decyzje z wywiadu:

- „Nowy wątek w docs/fixy”.
- Przycisk: „Widoczny zawsze, inna nazwa”.
- Swipe: „Swipe = przystanek, blokada do dojazdu”.
- Wskazówka: „Pulsujący znacznik przy przedmiocie”.

## Zakres

1. **Film, sekcja panelu** (`site/css/film.css`): okno panelu skondensowane na niskim telefonie.
   Pole promptu musi być widoczne przy 375 × 553.
2. **Film, komendy na ekranie dotykowym** (`site/film/*`, `site/css/film.css`, `site/narzedzia/szablon-film.html`):
   - bez przypięcia sekcji;
   - taśma fiszek przewijana natywnie w poziomie, z przyciąganiem do fiszki;
   - pionowy swipe przewija stronę;
   - desktop (kółko myszy przesuwa taśmę) bez zmian.
3. **Film, przycisk w nagłówku**:
   - na telefonie widoczny w każdej sekcji, z nazwą, która nie obiecuje instalacji („Jak zacząć”, EN „Get started”);
   - na desktopie zachowanie bez zmian;
   - teksty w `site/tresc/*.json`.
4. **Biurko 3D na ekranie dotykowym** (`site/biurko/warstwa.js` + nowy moduł z czystą logiką i testem):
   - jeden swipe w pionie przenosi kamerę na sąsiedni przystanek;
   - kolejne swipe'y są ignorowane do dojazdu kamery;
   - desktop przewija płynnie jak po E6.
5. **Biurko 3D, znacznik klikalności** (`site/biurko/*`, `site/css/strona.css`):
   - pulsująca kropka z podpisem przy przedmiocie z szufladą, tylko na jego przystanku;
   - gaśnie po pierwszym otwarciu tej szuflady;
   - także przy wyświetlaczu laptopa na przystanku instalacji.

## Poza zakresem

- Biurko bez sceny (tryb przepływu) — zamknięte wątkiem BIURKO_PLAKAT.
- Treść sekcji i konfigurator.
- Zachowanie przewijania na desktopie (decyzja E6: bez blokady).

## Weryfikacja

- [x] Film 375 × 553 (dotyk): w sekcji panelu pole promptu w całości w kadrze (dół promptu 529 px
      przy 553, 537 px przy 635; przed zmianą 753 px).
- [x] Film na dotyku: komendy bez przypięcia, taśma `overflow-x` z przyciąganiem, `scrollWidth`
      strony równe szerokości okna (320, 375, 414); pionowy swipe przewija stronę o 602 px przy
      nieruchomej taśmie, poziomy przesuwa taśmę o jedną fiszkę (244 px) przy nieruchomej stronie;
      na desktopie sekcja dalej przypięta.
- [x] Film na telefonie: przycisk w nagłówku widoczny na ostatniej sekcji, nazwa „Jak zacząć”/„Get
      started”; na desktopie dalej chowa się przy instalacji.
- [x] Biurko 3D z emulacją dotyku: jeden swipe = jeden przystanek (0→1→…→6, dalej stoi), dwa szybkie
      swipe'y = jeden przystanek; kontrola pozytywna: to samo przeciągnięcie na starym kodzie przelatuje
      za przystanek 1 (y 0 → 895). Test czystej logiki `site/biurko/krok.test.mjs` (10 przypadków).
      Desktop: kółko przewija płynnie.
- [x] Biurko 3D: znacznik widoczny tylko na przystanku przedmiotu; dotknięcie otwiera właściwą
      szufladę, po zamknięciu znacznik nie wraca; znacznik ekranu na ramce nad wyświetlaczem przybliża
      ekran (desktop; na telefonie instalacja ma kartę zamiast wyświetlacza).
- [x] `node --test "site/**/*.test.mjs"` zielone (351/351).
- [ ] Werdykt Łukasza na telefonie.

## Wynik

—
