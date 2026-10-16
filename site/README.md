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
| `biurko/` | scena three.js: obiekty, tekstury z kodu, światło, kamera, warstwa tekstu |
| `css/strona.css` | wygląd; kolory z `core/panel/theme.mjs` (paleta „Warsztat”) |
| `vendor/three/` | three.js 0.186.1 z npm, przypięty (`VERSION`, `LICENSE`) |
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
Pages to etap E5 planu.
