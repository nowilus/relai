# ODNOGA — Biurko bez sceny 3D wygląda jak biurko, z układem wyśrodkowanym i responsywnym

Plan: brak (wątek samodzielny; plan-rodzic [STRONA_RELAI](../../archiwum/plany/STRONA_RELAI/STATUS.md) zamknięty 2026-10-18) · Etap-źródło: — · Utworzona: 2026-10-19 · Status: **ZAMKNIĘTA 2026-10-19** ·
Wykonawca: Opus 5.5 w sesji, która wątek założyła (prompt odnogi pominięty — praca trwa w tej samej sesji)

## Cel

Strona Biurka w trybie bez sceny (Chrome bez akceleracji sprzętowej, grafika programowa, brak WebGL2,
ograniczony ruch, brak JS) pokazuje biurko na każdym przystanku: kadr z prawdziwej sceny i kartkę
na nim. Szuflady stoją przy swoich przystankach, a treść jest wyśrodkowana i działa od telefonu
390 px do ekranu 1920 px. Łukasz przyjmuje wygląd na zrzutach.

## Skąd się wzięła

2026-10-19, po publikacji strony (E8 planu STRONA_RELAI), Łukasz otworzył Biurko w Chrome
z wyłączoną akceleracją sprzętową (`hardware_acceleration_mode: {"enabled": false}` w `Local
State`). Strona celowo przeszła na plakaty (werdykt 3A z E6). Po plakacie hero zostały same białe
kartki na pustym tle, przyklejone do lewej krawędzi, z ogromnymi przerwami. Szuflady i konfigurator
stały na końcu bez wyśrodkowania, a gradient nagłówka nachodził na karty. Łukasz: „W ogole to nie
wyglada jak biurko potem jak juz sie zrobi scrolla w dół od pierwszego plakatu. Poza tym wszystko
jest przyklejone do lewego bordera i nie ma zadnej responsywnosci”. Decyzje z wywiadu: „Kadr na
przystanek”, szuflady „Przy swoich przystankach”, „Wątek w docs/fixy”, kalibracja „Najpierw jeden
przystanek”.

## Zakres

1. **Kadry przystanków:** `site/narzedzia/plakat.mjs` renderuje oprócz hero po jednym kadrze na
   przystanek (poziomy 1366 × 768 i pionowy 780 × 1688) do `site/grafika/plakat/biurko-<id>-*.jpg`.
   Adres domyślny narzędzia poprawiony na `/pl/biurko/` (po E8).
2. **Układ przystanków bez sceny:** `site/narzedzia/szablon.html` (kadr w `<template data-plakat>`
   i `<noscript>` każdego przystanku), `site/biurko/start.js` (`pokazPlakat` wstawia wszystkie
   kadry), `site/css/strona.css` (kadr na pełną szerokość, kartka w wyśrodkowanej kolumnie).
3. **Szuflady przy przystankach** (Dokumenty → Porządek, Teczka → Plan, Laptop → Panel, Pudełko →
   Komendy), wyśrodkowane i responsywne; w 3D dalej jako dialogi.
4. **Instalacja, konfigurator i stopka** w trybie bez sceny: wyśrodkowane, z siatką zamiast
   lewego marginesu; nagłówek bez gradientu nachodzącego na kartki.
5. **Testy:** `site/biurko/bezjs.test.mjs` i sąsiednie — kadr na każdym przystanku bez JS, brak
   pobierania kadrów w 3D.

## Poza zakresem

- Scena 3D i jej zachowanie (`swiat.js`, `kamera.js`, `szczyt.js`) — nie zmieniają się.
- Plakat hero (`biurko-poziomy.jpg`, `biurko-pionowy.jpg`) — przyjęty w E6, nie renderowany od nowa.
- Wersja Film i treści (`site/tresc/*.json`) poza nowymi kluczami, gdyby były konieczne.
- Drugi bezpiecznik słabej grafiki (opcja 3B) — czeka na pomiar na słabszym laptopie.

## Weryfikacja

- [x] Zrzuty trybu bez sceny (ograniczony ruch) 1440 × 900 i 390 × 844: kadr biurka na każdym
      przystanku, kartka na kadrze, `scrollWidth` równe szerokości okna (także 1024 i 1920, PL i EN).
- [x] Szuflady przy swoich przystankach w trybie bez sceny; w 3D zostają w `.szuflady` i otwierają
      się z mapy (Teczka, desktop; telefon 3D nie startuje w Chrome bez okna ani na starym kodzie).
- [x] Szersze okno (1920) — treść w wyśrodkowanej kolumnie, nie przy lewej krawędzi.
- [x] Tryb 3D nie pobiera żadnego kadru (`performance` bez `grafika/plakat/`, 0 elementów `.kadr`).
- [x] Bez JS: kadry z `<noscript>` w HTML (test `frames: 6 of 6`, kontrola pozytywna 5 of 6).
- [ ] `node --test "site/**/*.test.mjs"` zielone (329/329); Lighthouse dostępność 100 w trybie bez
      sceny — Lighthouse niezmierzony (narzędzie Lighthouse w sesji nie wymusza trybu bez sceny).
- [x] Werdykt Łukasza: Amnezja „Tak, przyjmuję kierunek”, po czterech rundach uwag na żywo
      (localhost:4520) „Przyjmuję”.

## Wynik

Biurko bez sceny ma teraz na każdym przystanku odbitkę kadru z prawdziwej sceny: zaokrąglone rogi,
znacznik rozdziału („01 Amnezja”), kartka zachodząca na dolną krawędź. Kolumna ma do 150rem, więc
marginesy wynoszą 72 px przy 1920 i 80 px przy 2560, symetrycznie. Mapa w nagłówku zapala kropki
przy przewijaniu (`site/biurko/mapa-przeplywu.js`). Dokumenty i Pudełko stoją pod swoimi
przystankami. Teczka i Laptop zostały tylko dla czytników ekranu, bo plan i paski widać na
kadrach. Instalacja leży na kadrze całego biurka, z konfiguratorem jak jasna kartka. Komunikat
o braku 3D jest przypiętą karteczką z instrukcją włączenia akceleracji. Zakres urósł w rundach
uwag Łukasza (przejścia, ukrycie powtórzeń, szerokość, mapa, karteczka, dolny odstęp) w granicach
tego samego celu. Nie zrobiono pomiaru Lighthouse w trybie bez sceny. Wpis:
[dziennik 2026-10-19](../../DZIENNIK.md).

