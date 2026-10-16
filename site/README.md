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
| `fonty/`, `grafika/` | kopie fontów i logo z `docs/zasoby/` (licencje w `fonty/LICENCJE.md`) |

`index.html` i `pl/index.html` są **generowane**. Nie edytuj ich ręcznie: zmień treść albo
szablon i zbuduj od nowa.

## Zbudowanie stron

Z korzenia repozytorium:

```bash
node site/narzedzia/fakty.mjs
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

## Podgląd lokalny

Strony nie da się oglądać z `file://` (moduły ES i mapa importów wymagają serwera). Dowolny
serwer statyczny z korzeniem w `site/`, na przykład serwer skilla scroll-craft:

```bash
node <katalog-skilla-scroll-craft>/scripts/serve.mjs --root site --port 4520
```

i adres `http://localhost:4520/` (angielski) albo `http://localhost:4520/pl/`. Przeglądarka
z polskim językiem trafia przy pierwszej wizycie na `/pl/`; ręczny wybór zapamiętuje się
w `localStorage` (`relai-jezyk`).

## Przy wydaniu

Po podbiciu wersji w `.claude-plugin/marketplace.json` uruchom oba skrypty z sekcji
„Zbudowanie stron”, żeby strona miała nowe wersje wpieczone w HTML. Przeglądarka i tak sprawdza
nowszy tag w API GitHuba (`v…` dla RelAI, `relai-panel-v…` dla pluginów panelu), ale wartość
wpieczona jest źródłem głównym. Pełny krok „strona” w sekwencji wydania i publikacja na GitHub
Pages to etap E8 planu (numeracja po Aneksie B).
