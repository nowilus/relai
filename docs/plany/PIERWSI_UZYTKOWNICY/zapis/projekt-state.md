# STATE — Sklep demo

Stan na: 2026-09-12

## Gdzie jesteśmy

Projekt jest na samym początku. Istnieje szkielet aplikacji sklepu i jedna funkcja obsługująca
dodawanie produktu do koszyka — nic więcej jeszcze nie działa. Dzisiaj projekt dostał strukturę
dokumentacyjną RelAI, a zaraz po niej plan wdrożenia płatności online, który został zaakceptowany.
Pierwszy etap jest gotowy do uruchomienia w świeżej sesji.

## Co działa

- Nic, co użytkownik mógłby zobaczyć. Projekt nie ma jeszcze interfejsu ani sposobu uruchomienia.

## Nad czym pracujemy teraz

- Płatności online — plan `PLATNOSCI` zaakceptowany, pięć etapów, pierwszy gotowy do startu. Ma
  pozwolić klientowi zapłacić kartą za zawartość koszyka. Pierwszy etap dokłada zamówienia po
  stronie serwera, bo bez nich płatność nie ma o co zaczepić.
- Koszyk — podstawa sklepu; istnieje pierwsza funkcja dodająca produkt, reszta zachowania koszyka
  jest przed nami.

## Co dalej

- Katalog produktów.
- Sposób uruchomienia aplikacji (dziś go nie ma) — powstaje w pierwszym etapie planu płatności.

## Co blokuje

- Pierwszy etap planu płatności nie jest zablokowany niczym — można go uruchomić od razu.
- Drugi etap blokują trzy sprawy czekające na decyzję: wybór operatora płatności, konto
  u operatora oraz to, czy projekt dostanie repozytorium gita. Czwarta — długość okna płatności —
  blokuje etap czwarty.

---

## Szczegóły techniczne

### Środowiska

| Środowisko | URL | Stan |
|---|---|---|
| lokalne | — | brak sposobu uruchomienia |

### Wersje

Node.js (ESM) • brak zależności zewnętrznych — `package.json` bez sekcji `dependencies`

### Linki

Repo: brak — projekt nie jest objęty gitem
