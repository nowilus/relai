# site/ — strona-wizytówka RelAI

Statyczna strona po polsku (`pl/`) i angielsku (korzeń), bez bundlera i bez zależności npm.
Plan: [docs/plany/STRONA_RELAI](../docs/plany/STRONA_RELAI/STATUS.md). Brief prototypu „Biurko”:
[docs/zasoby/STRONA/builds/biurko/BRIEF.md](../docs/zasoby/STRONA/builds/biurko/BRIEF.md).

## Co gdzie leży

| Ścieżka | Co to jest |
|---|---|
| `tresc/pl.json`, `tresc/en.json` | cała treść strony; tu zmieniasz słowa |
| `narzedzia/szablon.html` | jeden szablon HTML dla obu języków |
| `narzedzia/zbuduj.mjs` | generator: szablon + treść + fakty → `index.html` i `pl/index.html` |
| `narzedzia/fakty.mjs` | fakty z repo (komendy, wersje, adaptery) → `dane/fakty.json` |
| `js/` | konfigurator instalacji, sprawdzanie wersji, wybór języka (czysta logika z testami) |
| `biurko/` | scena three.js: ładowanie zasobów (`zasoby.js`), materiały, obiekty, miasto za oknem, światło i efekty obrazu, kamera, warstwa tekstu |
| `zasoby/` | modele, tekstury i HDRI z bibliotek CC0 (Poly Haven, ambientCG); wykaz plik po pliku w `zasoby/ZRODLA.json`, licencje w `zasoby/LICENCJE.md` |
| `css/strona.css` | wygląd; kolory z `core/panel/theme.mjs` (paleta „Warsztat”) |
| `vendor/three/` | three.js 0.186.1 i jego dodatki z tej samej paczki npm, przypięte (`VERSION` z listą plików, `LICENSE`) |
| `fonty/`, `grafika/` | kopie fontów i logo z `docs/zasoby/` (licencje w `fonty/LICENCJE.md`); `grafika/ikony/` to ikony komend z `docs/zasoby/branding/ikony/` |
| `narzedzia/szablon-film.html` | szablon prototypu „Film” dla obu języków |
| `film/` | Film: ekran ładowania (`zaslona.js`), jednorazowe animacje sekcji i przytrzymanie przewijania (`akty.js`), pasek u góry (`pasek.js`), karta instalacji na telefonie (`telefon.js`), start (`start.js`); `film/index.html` to generowana strona EN |
| `css/film.css` | wygląd Filmu, paleta z `core/panel/theme.mjs` |
| `narzedzia/makiety.mjs` | makiety pasków nad promptem z kodu `core/panel` i zrzutu aplikacji → `dane/makiety.json` |
| `vendor/scrollcraft/` | silnik scroll-craft 0.3.1 skopiowany bajt w bajt (`VERSION` z sumami, `LICENSE` MIT); nie edytujesz go |

`index.html`, `pl/index.html`, `film/index.html` i `pl/film/index.html` są **generowane**.
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
lampa, HDRI), po pierwszej klatce reszta w tle. Błąd etapu pierwszego przełącza stronę w tryb
przepływu bez sceny; błąd drugiego zostawia treść i wyłącza scenę bez komunikatu dla
odwiedzającego.

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
i w emulacji telefonu (390 × 844). Przewijanie mierzysz krokiem `scrollTo(..., { behavior: 'instant' })`
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
  `/film/` i `/pl/film/`, na desktopie i telefonie; w E7 wyszło 100 we wszystkich czterech.
  Na stronę EN wchodzisz z `localStorage['relai-jezyk'] = 'en'`, bo przeglądarka po polsku
  przekierowuje na `/pl/film/`.

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

i adres `http://localhost:4520/` (angielski) albo `http://localhost:4520/pl/`; Film pod
`http://localhost:4520/film/` i `http://localhost:4520/pl/film/`. Przeglądarka
z polskim językiem trafia przy pierwszej wizycie na `/pl/`; ręczny wybór zapamiętuje się
w `localStorage` (`relai-jezyk`).

## Przy wydaniu

Po podbiciu wersji w `.claude-plugin/marketplace.json` uruchom oba skrypty z sekcji
„Zbudowanie stron”, żeby strona miała nowe wersje wpieczone w HTML. Przeglądarka i tak sprawdza
nowszy tag w API GitHuba (`v…` dla RelAI, `relai-panel-v…` dla pluginów panelu), ale wartość
wpieczona jest źródłem głównym. Pełny krok „strona” w sekwencji wydania i publikacja na GitHub
Pages to etap E8 planu (numeracja po Aneksie B).
