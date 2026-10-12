# Film prezentacyjny RelAI — źródła i kalibracja

Ten katalog trzyma film prezentacyjny RelAI razem z jego źródłami, tak jak `docs/zasoby/demo/`
trzymał demo 2.1.3: kto zmieni panel, przerenderuje film jedną komendą. Plan:
[FILM_PREZENTACYJNY](../../plany/FILM_PREZENTACYJNY/STATUS.md) (zaakceptowany 2026-10-12).

Stan na E1 (2026-10-12): gotowa scena 2 „Trzy paski” — 10 s ruchu i klatka wzorcowa
[kalibracja/E1-klatka.png](kalibracja/E1-klatka.png), kierunek przyjęty przez Łukasza po dwóch
rundach (wiersz „Kierunek filmu” w [USTAWIENIA.md](../../USTAWIENIA.md)). Stan na E2 (2026-10-12):
animatik całego filmu — sześć scen, 120 s, kolejność, czasy i słownik PL przyjęte przez Łukasza.
Pełna jakość scen 1 i 3–6, wersja EN, pętla do README i wydanie — kolejne etapy planu.

## Co gdzie leży

| Ścieżka | Co to jest | W gicie |
|---|---|---|
| `zrodla/` | projekt Remotion: `package.json` z wersjami przypiętymi dokładnie, lockfile, `src/` | tak |
| `zrodla/src/tokeny.ts` | paleta i miary kierunku „Warsztat z wigorem” — jedyne miejsce kolorów spoza `core/panel` | tak |
| `zrodla/src/rdzen.ts` | import `core/panel/*.mjs` tylko do odczytu — film liczy tym samym kodem co panel | tak |
| `zrodla/src/dane/paski.json` | dane sceny 2, wygenerowane skryptem; każda wartość ma pole `zrodlo` | tak |
| `zrodla/skrypty/` | `dane.mjs` (dane z repo i ze zrzutu), `fonty.mjs` (kopia fontów z kontrolą bajtową) | tak |
| `zrodla/testy/` | testy danych: zgodność z `core/panel`, źródła, piksele zrzutu | tak |
| `kalibracja/` | klatki zaakceptowane przez człowieka | tak |
| `zrodla/node_modules/`, `zrodla/out/`, `zrodla/public/fonty/` | zależności, rendery, kopie fontów | nie |

## Jak wyrenderować

Raz, po sklonowaniu repozytorium (pobiera ok. 245 MB pakietów; pierwszy render dociąga Chrome
Headless Shell do `zrodla/node_modules/.remotion/`, 283 MB na dysku — zmierzone 2026-10-12):

```bash
cd docs/zasoby/film/zrodla && npm ci
```

Klatka wzorcowa sceny 2 (PNG 1920×1080, klatka 280) do `zrodla/out/paski-klatka.png`:

```bash
cd docs/zasoby/film/zrodla && npm run klatka
```

Scena 2 w ruchu (MP4 1920×1080, 30 kl./s, 10 s) do `zrodla/out/paski-10s.mp4`:

```bash
cd docs/zasoby/film/zrodla && npm run paski
```

Animatik całego filmu (MP4 960×540, 30 kl./s, sześć scen z `src/scenariusz.ts`, długość = suma
ich czasów) do `zrodla/out/animatik.mp4` — scena 2 gotowa, reszta jako plansze surowe:

```bash
cd docs/zasoby/film/zrodla && npm run animatik
```

Wszystkie komendy renderu najpierw odświeżają dane, manifest i fonty (`npm run przygotuj`; manifest
uruchamia testy rdzenia, ok. 35–45 s). Podgląd na żywo: `npm run studio`. Testy (po
`npm run przygotuj`): `npm test`; typy: `npm run typy`.

## Skąd liczby w kadrze

Zasada filmu: na ekranie nie ma liczby, której nie da się wskazać w repozytorium albo w zapisie
prawdziwej sesji. Dlatego:

- **paski plan i postęp** liczy `core/panel/plan-state.mjs` i `progress.mjs` z bieżących `CLAUDE.md`,
  `STATUS.md` aktywnego planu i promptu etapu — film pokazuje plan, który go robi, w stanie z dnia
  renderu;
- **pasek cache** (minuty, limity, reset, kontekst, koszt sesji) nie leży w repozytorium: wartości
  są przepisane ze zrzutu prawdziwych pasków
  [`docs/fixy/AUDYT_MODOW/zrzuty/2026-10-11-z1-trzy-paski-0.12.0.png`](../../fixy/AUDYT_MODOW/zrzuty/2026-10-11-z1-trzy-paski-0.12.0.png);
  wypełnienie każdej baterii test porównuje z pikselami tego zrzutu;
- każda wartość w `paski.json` niesie pole `zrodlo`; test kończy się błędem na wartości bez niego;
- **liczby pozostałych scen** (wersja, komendy, zamknięte plany, testy rdzenia, narzędzia, próg
  limitu, linie instalacji) liczy `skrypty/manifest.mjs` ze źródeł w repozytorium i zapisuje do
  `src/dane/manifest.json` w tym samym kształcie `{ wartosc, zrodlo }`; okno „5 h” bierze z etykiety
  zrzutu przez `paski.json`;
- **słownik** `src/teksty.ts` nie ma ani jednej cyfry w tekście kadru: liczba wchodzi znacznikiem
  (`{komendy}`), który `src/fakty.ts` wypełnia z manifestu;
- **test faktów** `testy/fakty.test.mjs` zbiera wszystkie teksty kadru (słownik po podstawieniu,
  finał, czasy plansz, dane sceny 2) i kończy się błędem na każdej liczbie spoza `manifest.json`
  i `paski.json` (czasy plansz należą do animatiku i odchodzą z nim). Drugi licznik łapie liczebniki
  słowne i znak `%` bez liczby. Test generuje manifest ponownie i porównuje z zapisanym, a na
  zmienionych kopiach źródeł pokazuje, że fakt się zmienia. Pilnuje też prywatności kadru:
  ścieżki domowej, e-maila, identyfikatora sesji.

## Fonty i sieć

Fonty wyłącznie z [`docs/zasoby/fonts/`](../fonts/LICENCJE.md) (licencje OFL i Apache 2.0), kopiowane
przed renderem do `zrodla/public/fonty/`. Źródła filmu nie wykonują żadnego żądania sieciowego.

## Licencja Remotion

Remotion 4.0.535 na **Remotion Free License** — Łukasz działa jako osoba prywatna / firma do trzech
osób; warunki z remotion.dev/docs/license/faq odczytane 2026-10-12. Film raz wyrenderowany nie
zależy od licencji przyszłych wersji. Zależność dotyczy wyłącznie narzędzia filmu, nie pluginu RelAI.
