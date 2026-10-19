# site/ — strona-wizytówka RelAI

Statyczna strona po polsku (`pl/`) i angielsku (korzeń), bez bundlera i bez zależności npm.
Plan (zamknięty 2026-10-18): [docs/archiwum/plany/STRONA_RELAI](../docs/archiwum/plany/STRONA_RELAI/STATUS.md). Brief prototypu „Biurko”:
[docs/zasoby/STRONA/builds/biurko/BRIEF.md](../docs/zasoby/STRONA/builds/biurko/BRIEF.md).

## Co gdzie leży

| Ścieżka | Co to jest |
|---|---|
| `tresc/pl.json`, `tresc/en.json` | cała treść strony; tu zmieniasz słowa |
| `narzedzia/szablon.html` | jeden szablon HTML dla obu języków |
| `narzedzia/zbuduj.mjs` | generator: szablon + treść + fakty → Film w `index.html` i `pl/index.html`, Biurko w `biurko/index.html` i `pl/biurko/index.html`; adres publiczny (`ADRES_PUBLICZNY`) dla `hreflang` i `canonical` |
| `narzedzia/fakty.mjs` | fakty z repo (komendy, wersje, adaptery) → `dane/fakty.json` |
| `js/` | konfigurator instalacji, sprawdzanie wersji, wybór języka (czysta logika z testami) |
| `biurko/` | scena three.js: ładowanie zasobów (`zasoby.js`), materiały, obiekty, miasto za oknem, światło i efekty obrazu, kamera, warstwa tekstu |
| `zasoby/` | modele, tekstury i HDRI z bibliotek CC0 (Poly Haven, ambientCG); wykaz plik po pliku w `zasoby/ZRODLA.json`, licencje w `zasoby/LICENCJE.md` |
| `css/strona.css` | wygląd; kolory z `core/panel/theme.mjs` (paleta „Warsztat”) |
| `vendor/three/` | three.js 0.186.1 i jego dodatki z tej samej paczki npm, przypięte (`VERSION` z listą plików, `LICENSE`) |
| `fonty/`, `grafika/` | kopie fontów i logo z `docs/zasoby/` (licencje w `fonty/LICENCJE.md`); `grafika/ikony/` to ikony komend z `docs/zasoby/branding/ikony/` |
| `narzedzia/szablon-film.html` | szablon prototypu „Film” dla obu języków |
| `film/` | Film: ekran ładowania (`zaslona.js`), jednorazowe animacje sekcji i przytrzymanie przewijania (`akty.js`), pasek u góry (`pasek.js`), karta instalacji na telefonie (`telefon.js`), start (`start.js`); strona Filmu leży w korzeniu (`index.html`) od E8 |
| `css/film.css` | wygląd Filmu, paleta z `core/panel/theme.mjs` |
| `narzedzia/makiety.mjs` | makiety pasków nad promptem z kodu `core/panel` i zrzutu aplikacji → `dane/makiety.json` |
| `vendor/scrollcraft/` | silnik scroll-craft 0.3.1 skopiowany bajt w bajt (`VERSION` z sumami, `LICENSE` MIT); nie edytujesz go |

`index.html`, `pl/index.html` (Film), `biurko/index.html` i `pl/biurko/index.html` (Biurko) są
**generowane**.
Nie edytuj ich ręcznie: zmień treść albo szablon i zbuduj od nowa. Brief Filmu:
[docs/zasoby/STRONA/builds/film/BRIEF.md](../docs/zasoby/STRONA/builds/film/BRIEF.md).

## Zbudowanie stron

Z korzenia repozytorium:

```bash
node site/narzedzia/fakty.mjs
node site/narzedzia/makiety.mjs
node site/narzedzia/zbuduj.mjs
node --test "site/**/*.test.mjs"
```

Generator zapisuje plik tylko wtedy, gdy treść się zmieniła; drugi przebieg wypisuje
„bez zmian”. W Node 24 forma `node --test site/` nie działa (katalog traktowany jak moduł),
dlatego testy uruchamia się wzorcem plików.

## Zasoby 3D: skąd są i jak dodać nowy

Scena ładuje się dwuetapowo (`biurko/zasoby.js`): najpierw zestaw hero (blat, ściana, korek,
lampa, HDRI), po pierwszej klatce reszta. Oba etapy ładują się pod zasłoną (E6): etap drugi
zmienia kadr hero (roślina, ramki, zegar, bloczki), więc zasłona schodzi dopiero po nim. Błąd
któregokolwiek etapu przełącza stronę w tryb przepływu z plakatem.

Nowy zasób:

1. Wybierz zasób CC0 z Poly Haven albo ambientCG i przeczytaj licencję na jego stronie.
2. Przed pobraniem pokaż Łukaszowi kartę zgody: nazwa, strona, autor, licencja, rozmiar paczki
   i rozmiar po przycięciu.
3. Pobierz do katalogu roboczego etapu, do `site/zasoby/` skopiuj tylko używane pliki
   (tekstury przeskalowane do potrzebnej rozdzielczości, modele glTF 1k bez zmian).
4. Dopisz każdy plik do `zasoby/ZRODLA.json` (strona zasobu, autor, licencja `CC0`, data pobrania,
   zakres przeróbki, `bajty`, `sha256`) i zasób do tabeli w `zasoby/LICENCJE.md`.
5. `node --test "site/**/*.test.mjs"` — test `narzedzia/zasoby.test.mjs` odrzuca plik bez wpisu,
   wpis bez pliku, inną licencję niż CC0, obcy host strony zasobu i niezgodną sumę.

Dodatki three.js (loadery, efekty obrazu) kopiuje się wyłącznie z tej samej paczki npm co
`three.module.js`, razem z ich importami, i dopisuje do listy w `vendor/three/VERSION`.

## Ekran laptopa i przybliżenie

Konfigurator to prawdziwy formularz HTML położony przez CSS3D dokładnie na siatce ekranu laptopa
(1136 × 710 px CSS na 0,284 × 0,1775 m, te same zaokrąglone rogi). Jego warstwa stoi w sekcji
„Instalacja”, poza sceną `aria-hidden`, więc czytnik ekranu i Tab docierają do formularza także
w trybie 3D. Klik albo Enter na ekranie przybliża kamerę (`biurko/przyblizenie.js`, czysta logika
z testami), a Esc, przewinięcie wstecz i przycisk „Wróć do biurka” ją oddalają. Gdy scena się
wyłącza, formularz wraca na swoje miejsce w treści. Wpasowanie sprawdza się w przeglądarce:
`__biurko.diagnostyka().ekran` daje narożniki siatki rzutowane kamerą, a `getBoundingClientRect()`
elementu `[data-ekran]` musi się z nimi pokrywać (w E3: ≤ 0,04 px).

## Biurko: szczyt, szuflady, telefon i strona bez sceny

- **Szczyt** (`biurko/szczyt.js`, czysta logika z testami): Amnezja, cisza i szczyt to jedna scena;
  po wejściu kamery w postój siedem karteczek w 3 s układa się w cztery dokumenty, bez blokady
  przewijania; zejście z przystanku cofa stan do bałaganu. Skok z mapy pokazuje stan docelowy od razu.
- **Szuflady** (`biurko/szuflady.js`): cztery `<dialog>` z treścią w HTML (dokumenty, teczka, laptop,
  pudełko). Otwiera je klik w obiekt sceny i link na osi mapy, Esc, tło i „Zamknij” zamykają, fokus
  wraca do elementu, który otworzył. Bez sceny i bez skryptów to zwykłe sekcje strony.
- **Telefon** (okno węższe niż 0,8 wysokości): pozy pionowe `POZY_PIONOWE` (obiektyw 65°), karty na
  dole kadru, zamiast konfiguratora karta „Wyślij sobie link” z `film/telefon.js`.
- **Zasłona** (`biurko/zaslona.js`): stoi od pierwszej klatki (wiersz w `<head>`), karteczki przypina
  postęp wczytanych plików, pierwszą od razu; schodzi po obu etapach zasobów i dwóch klatkach
  z gotowym hero. Własny limit 30 s w `<head>`. Zimne wejście na telefonie (Fast 4G, CPU ×4): zasłona
  zdjęta po 22,7–24,1 s (dwa przebiegi), kadr hero po zdjęciu bez zmian.
- **Strona bez sceny** dostaje tryb przepływu z plakatem za tekstem hero w czterech sytuacjach:
  ograniczony ruch (scena nie jest nawet pobierana), brak WebGL2, grafika programowa (`biurko/grafika.js`
  rozpoznaje SwiftShader, llvmpipe, WARP i podobne po nazwie renderera; tam klatka trwa 0,3–1,7 s)
  i brak skryptów (`<noscript>`). Komunikat o braku sceny pokazuje się tylko przy braku WebGL2
  i grafice programowej. W trybie 3D plakat nie jest pobierany: stoi w `<template>`.
- **Kadry przystanków** (wątek `BIURKO_PLAKAT`, 2026-10-19): w trybie przepływu każdy przystanek po
  hero to odbitka kadru sceny z zaokrąglonymi rogami w wyśrodkowanej kolumnie (`--kolumna`, do
  80rem). Nad nią stoi znacznik rozdziału (`.rozdzial`, „01 Amnezja”), a kartka zachodzi na jej
  dolną krawędź. Kadry są oddzielone, nie przenikają się. Szuflady `start.js` przenosi pod
  przystanek, na którym leży ich przedmiot: Dokumenty → Porządek, Pudełko → Komendy. Teczka i Laptop
  zostają tylko dla czytników ekranu, bo plan i paski widać na kadrach, a ich linki w mapie
  prowadzą do przystanków Plan i Panel. Bez skryptów wszystkie cztery stoją na końcu strony.
  Instalacja leży na kadrze całego biurka (plakat hero) i ma trzy kolumny: kartka, konfigurator
  jako jasna kartka papieru, karteczki; poniżej 1180 px jedną. Nagłówek dostaje pasek z ciemnego
  szkła zamiast przyciemnienia sceny. Kadry stoją w `<template>` i `<noscript>` jak plakat, więc tryb
  3D ich nie pobiera.

### Plakat i kadry: jak odtworzyć

Po zmianie wyglądu sceny, z korzenia repozytorium, przy działającym serwerze podglądu na porcie 4520
(sekcja „Podgląd lokalny”):

```bash
node site/narzedzia/plakat.mjs --tylko amnezja,porzadek
```

Skrypt otwiera `/pl/biurko/` w Chrome bez okna, czeka na zdjęcie zasłony, a dla przystanku wchodzi
pod jego adres (`#amnezja`) i czeka 6 s na uspokojenie kamery. Potem chowa tekst, nagłówek i mapę
(winietę i ziarno dokłada CSS, więc nie ma ich w pliku) i zapisuje `grafika/plakat/biurko-poziomy.jpg`
i `biurko-<przystanek>-poziomy.jpg` (1366 × 768) oraz odpowiedniki `-pionowy` (390 × 844 w 2×), JPEG
jakości 78. Bez `--tylko` renderuje hero i pięć przystanków od Amnezji do Komend. Render nie jest
powtarzalny co do bajtu, więc przyjęte kadry zostawiasz poza `--tylko`. Plakat hero waży ok.
0,17 MiB, kadry przystanków razem 0,98 MiB; jedno i drugie pobiera tylko tryb przepływu. Inna
ścieżka Chrome: zmienna `CHROME`.

### Pomiar na słabej grafice

Grafika programowa: Chrome bez okna z `--use-angle=swiftshader --enable-unsafe-swiftshader` (osobny
profil). W E6 mediana klatki przy równym przewijaniu całej strony: 1366 × 768 — 1 700 ms, po wyłączeniu
głębi 1 183 ms, po wyłączeniu AO 817 ms; 390 × 844 — 1 033, 867, 433 i 283 ms po zejściu do 1×.
Dlatego taka grafika dostaje plakat. Kontrolę robisz tą samą przeglądarką z ukrytą nazwą renderera
(scena musi wystartować). `__biurko.obnizJakosc()` schodzi o jeden krok ręcznie, a
`__biurko.diagnostyka().jakosc` mówi, który krok jest włączony.

## Budżet ciężaru i płynności

Pułap pierwszego wejścia: ok. 10 MB po kompresji (Aneks B planu). Pomiar:

1. Otwórz stronę w Chrome z wyłączoną pamięcią podręczną, przewiń do końca.
2. `performance.getEntriesByType('resource')` w konsoli: suma `transferSize` to bajty bez kompresji
   serwera podglądu; zasoby z `startTime` przed startem modeli etapu drugiego to zestaw hero.
3. Ciężar po kompresji (jak na GitHub Pages): suma rozmiarów plików z tej listy, tekst
   (`.js`, `.css`, `.html`, `.svg`, `.json`, `.gltf`) przez `gzip -9`, reszta bez zmian. Wynik
   podaj w MiB (2^20 B) — w tej jednostce liczono pułap i stan po E2 (9,00 MiB = 9,44 MB).
4. Płynność: odstępy `requestAnimationFrame` podczas równego przewijania całej strony, mediana
   i p95, raz zwykle i raz z CPU ×4 w DevTools. Scena obniża jakość sama, gdy mediana klatki
   przekroczy 26 ms (najpierw głębia ostrości, potem cienie kontaktowe, potem rozdzielczość).

Tym samym instrumentem w E5: Film 0,31 MiB po kompresji (33 pliki), CPU ×4 p95 5,6 ms; Biurko
9,49 MiB, p95 17,5 ms. Po E7: Film 0,317 MiB (35 plików), CPU ×4 p95 16,7 ms na desktopie
i w emulacji telefonu (390 × 844). Po E6: Biurko 9,52 MiB (118 plików, plakat poza tą liczbą, bo
w 3D nie jest pobierany), CPU ×4 p95 przewijania 20,6–25,2 ms na desktopie i 15,4–16,3 ms na telefonie,
w trakcie szczytu do 16,3 ms, przy otwartej szufladzie do 17,9 ms. Drugi Chrome działający w tle
w tym samym czasie podbił p95 do 33,4 ms: mierzysz bez innych przeglądarek. Przewijanie mierzysz krokiem `scrollTo(..., { behavior: 'instant' })`
co klatkę, bo strona ma `scroll-behavior: smooth`. Kartę DevTools najpierw wysuwasz na wierzch:
karta w tle nie dostaje klatek ani zdarzeń przewijania.

## Film na telefonie, przy ograniczonym ruchu i bez skryptów

- **Telefon (do 600 px):** osobny blok `@media (max-width: 600px)` w `css/film.css`. Tekst idzie
  na całą szerokość, przedmioty stoją pod nim. Zamiast konfiguratora jest karta „Wyślij sobie link”
  i „Kopiuj komendy” (`film/telefon.js`), bo z telefonu nie da się zainstalować pluginu. Strona
  nigdzie nie przewija się w bok: sprawdzasz `document.documentElement.scrollWidth` ≤ 390
  w każdym akcie, PL i EN.
- **Ograniczony ruch:** bez klasy `ruch` każda sekcja stoi w stanie końcowym, a przytrzymanie
  przewijania nie działa. Taśma komend układa się w siatkę, a przypięcie znika. Pierwsza asercja
  każdego pomiaru to tryb: `matchMedia('(prefers-reduced-motion: reduce)').matches`.
- **Bez JavaScriptu:** pełna treść jest w HTML (strzeże tego `film/bezjs.test.mjs`). Taśma bez
  silnika też jest siatką (`html:not(.sc-ready)`), a przyciski wymagające skryptu mają `hidden`.
  Wersję bez skryptów oglądasz w Chrome DevTools: pobierz HTML, wytnij znaczniki `<script>`
  i otwórz go jako blob z `<base href>` strony.
- **Przebiegi zrzutów i dostępność:** cztery przebiegi (desktop, telefon, ograniczony ruch, bez JS),
  po sześć kadrów na akt, robisz przez protokół DevTools z zainstalowanego Chrome (bez paczek).
  Arkusze zapisujesz w `docs/zasoby/STRONA/lab/film/`. Lighthouse dostępność mierzysz dla
  `/` i `/pl/` (Film od E8 w korzeniu), na desktopie i telefonie; w E8 wyszło 100 we wszystkich
  czterech, SEO 100. Na stronę EN wchodzisz z `localStorage['relai-jezyk'] = 'en'`, bo przeglądarka
  po polsku przekierowuje na `/pl/`.

## Ekran ładowania Filmu

Skrypt w `<head>` dodaje klasę `ladowanie` z limitem 4 s, więc zasłona stoi od pierwszej klatki.
`film/start.js` przesuwa kreskę pod logo w trzech krokach (fonty, montaż silnika, choreografia aktów)
i zdejmuje zasłonę dopiero po dwóch klatkach z gotowym układem. Gdy silnik rzuci błąd albo minie
limit, zasłona schodzi i treść zostaje widoczna bez animacji. Czas zejścia mierzysz przy zimnym
wejściu: pusta pamięć podręczna, Fast 4G i CPU ×4; w E5 wyszło ok. 1,1 s.

## Podgląd lokalny

Strony nie da się oglądać z `file://` (moduły ES i mapa importów wymagają serwera). Dowolny
serwer statyczny z korzeniem w `site/`, na przykład serwer skilla scroll-craft:

```bash
node <katalog-skilla-scroll-craft>/scripts/serve.mjs --root site --port 4520
```

i adres `http://localhost:4520/` (Film, angielski) albo `http://localhost:4520/pl/`; Biurko pod
`http://localhost:4520/biurko/` i `http://localhost:4520/pl/biurko/`. Przeglądarka
z polskim językiem trafia przy pierwszej wizycie na `/pl/`; ręczny wybór zapamiętuje się
w `localStorage` (`relai-jezyk`). Przekierowanie idzie względnym linkiem języka z nagłówka, nie
absolutnym `hreflang`, więc podgląd lokalny zostaje lokalny.

## Publikacja

Strona stoi na GitHub Pages pod `https://nowilus.github.io/relai/`: Film pod `/` i `/pl/`, Biurko
pod `/biurko/` i `/pl/biurko/`. Publikuje ją workflow `.github/workflows/strona.yml` (akcje
przypięte pełnym SHA, uprawnienia `contents: read`, `pages: write`, `id-token: write`): przy pushu
na `main` ze zmianą w `site/**`, w `marketplace.json` albo w samym workflow, przy opublikowaniu
wydania i ręcznie. Kroki: fakty, makiety, budowa, testy, upload katalogu `site/`, publikacja.
Stopka obu wersji linkuje drugą wersję, ankietę w Tally (`publikacja.ankietaAdres` w treści, PL
`tally.so/r/BE4lQ5`, EN `tally.so/r/X5lkMj`, z polami `wersja` i `jezyk` w adresie) i GitHub
Issues. Nagłówek ankiety to `grafika/ankieta/naglowek.png`, rysowany z
`narzedzia/naglowek-ankiety.html` (proporcja ok. 8 : 1, bo tyle pokazuje Tally), przy działającym
podglądzie:

```bash
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars --window-size=2400,300 --screenshot="C:\Users\<ty>\...\site\grafika\ankieta\naglowek.png" http://localhost:4520/narzedzia/naglowek-ankiety.html
```

## Przy wydaniu

Po podbiciu wersji w `.claude-plugin/marketplace.json`, z korzenia repo:

```bash
node site/narzedzia/fakty.mjs && node site/narzedzia/makiety.mjs && node site/narzedzia/zbuduj.mjs && node --test "site/**/*.test.mjs"
```

Test `narzedzia/strony.test.mjs` wywraca się, gdy któraś z czterech stron niesie inną wersję niż
`marketplace.json`. Strony commitujesz razem z wydaniem; push na `main` uruchamia publikację, wynik
pokazuje `gh run list --workflow strona.yml --limit 1`. Przeglądarka i tak sprawdza nowszy tag
w API GitHuba (`v…` dla RelAI, `relai-panel-v…` dla pluginów panelu), ale wartość wpieczona jest
źródłem głównym. Ta sama sekwencja stoi w `docs/PULAPKI.md`, P-005.
