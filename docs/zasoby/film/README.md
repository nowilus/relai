# Film prezentacyjny RelAI — źródła i kalibracja

Ten katalog trzyma film prezentacyjny RelAI razem z jego źródłami, tak jak dawne demo 2.1.3
(dziś w [`docs/archiwum/demo/`](../../archiwum/demo/)): kto zmieni panel, przerenderuje film jedną komendą. Plan:
[FILM_PREZENTACYJNY](../../plany/FILM_PREZENTACYJNY/STATUS.md) (zaakceptowany 2026-10-12).

Stan na E1 (2026-10-12): gotowa scena 2 „Trzy paski” — 10 s ruchu i klatka wzorcowa
[kalibracja/E1-klatka.png](kalibracja/E1-klatka.png), kierunek przyjęty przez Łukasza po dwóch
rundach (wiersz „Kierunek filmu” w [USTAWIENIA.md](../../USTAWIENIA.md)). Stan na E2 (2026-10-12):
animatik całego filmu — sześć scen, 120 s, kolejność, czasy i słownik PL przyjęte przez Łukasza.
Stan na E3 (2026-10-12): pierwsza minuta w pełnej jakości — scena 1 „Pamięć”, scena 2 w całości
(10 s z E1 i dalsza część `PaskiDalej` od tego samego kadru), scena 3 „Panel” odtworzona z kodu
`relai-panel` 0.14 i zrzutów Łukasza; klatki wzorcowe w `kalibracja/E3-scena1.png` i
`kalibracja/E3-scena3.png`. Stan na E4 (2026-10-12): cały film PL bez plansz — scena 4 „Etap
w nowej sesji” (karta startu etapu z `stageCard()` rdzenia panelu, nowa sesja z komendą w polu),
scena 5 „Praca wraca” (karta progu limitu, „zapisz pracę”, „Wznów pracę”), scena 6 „Finał”
(liczby z manifestu, instalacja, znak, pasek planu, który zrobił film). Stan na E5
(2026-10-12, Aneksy A–C): **film ma siedem scen i 169 s** — zaraz po „Pamięci” idzie wstęp
„Komendy” (49 s): czternaście komend RelAI jako papierowe rekwizyty na jednym długim biurku,
3,5 s na komendę, kamera przeskakuje sprężyną od rekwizytu do rekwizytu; u góry ikona i polska
nazwa komendy, pod rekwizytem slogan. Potem trzy paski, panel, nowa sesja, praca wraca, finał.
Pod całym filmem gra muzyka (niżej). Klatki wzorcowe: `kalibracja/E5-komenda.png`,
`E5-komendy-1.png`, `E5-komendy-2.png`. Stan na E6 (2026-10-13, Aneksy D–E): **pętla do README**
— 25 s w pionie 720×900, skrót scen „Trzy paski” i „Panel”, GIF bez dźwięku w wersji PL
(`relai-petla-25s-pl.gif`, osadzona w `README.md`) i EN (`relai-petla-25s-en.gif`); **film EN** —
ten sam film z angielskim słownikiem (napisy, slogany i nazwy w scenie komend; reszta słów
produktu po polsku, jak rysuje je produkt). Wersja EN jest zapasem i alternatywą (Aneks E):
README pokazuje tylko PL, MP4 EN idzie do wydania jako dodatek. Stan na E7 (2026-10-13, Aneks F):
oba filmy i obie pętle wyrenderowane po podbiciu do RelAI 3.0.0 (finał pokazuje `RelAI 3.0.0`
i liczby z manifestu tego dnia); MP4 do gita nie wchodzą — są zasobami wydania `v3.0.0` pod
nazwami `relai-film-pl.mp4` (film główny, kopia `zrodla/out/film.mp4`) i `relai-film-en.mp4`
(dodatek, kopia `zrodla/out/film-en.mp4`). Scena 4 bierze kartę startu etapu wprost z linii
metrycznej planu — po poprawce parsera modelu (Aneks F) bez dopisywanej etykiety.

## Co gdzie leży

| Ścieżka | Co to jest | W gicie |
|---|---|---|
| `zrodla/` | projekt Remotion: `package.json` z wersjami przypiętymi dokładnie, lockfile, `src/` | tak |
| `zrodla/src/tokeny.ts` | paleta i miary kierunku „Warsztat z wigorem” — jedyne miejsce kolorów spoza `core/panel` | tak |
| `zrodla/src/rdzen.ts` | import `core/panel/*.mjs` tylko do odczytu — film liczy tym samym kodem co panel | tak |
| `zrodla/src/dane/paski.json` | dane sceny 2, wygenerowane skryptem; każda wartość ma pole `zrodlo` | tak |
| `zrodla/src/dane/panel.json` | dane sceny 3: etapy planu z `STATUS.md` i liczby sesji przepisane ze zrzutów 0.14, każda z polem `zrodlo` | tak |
| `zrodla/src/dane/sceny.json` | dane scen 4–5: karta startu E4 policzona `stageCard()`, słowa karty limitu, zapisu i wznowienia czytane z kodu `relai-cache-keeper` i `relai-core`, każde z polem `zrodlo` | tak |
| `zrodla/src/komendy.ts` | układ zakładki Komendy (polecane i grupy) — ta sama funkcja dla sceny i testu wierności; `CYKL` — kolejność komend sceny „Komendy” | tak |
| `zrodla/skrypty/` | `dane.mjs` (sceny 2), `panel.mjs` (sceny 3), `sceny.mjs` (scen 4–5), `manifest.mjs`, `fonty.mjs` i `znak.mjs` (kopie fontów, logo i ikon komend z kontrolą bajtową), `muzyka.mjs` (ścieżka dźwiękowa z `muzyka/`) | tak |
| `zrodla/testy/` | testy danych: zgodność z `core/panel`, źródła, piksele zrzutu, fakty w kadrze, wierność nazw panelu | tak |
| `kalibracja/` | klatki zaakceptowane przez człowieka | tak |
| `muzyka/` | utwór filmu (CC BY 4.0) i `ZRODLO.md` — źródło, suma, licencja, kredyt | tak |
| `zrodla/node_modules/`, `zrodla/out/`, `zrodla/public/fonty/`, `zrodla/public/znak/`, `zrodla/public/muzyka/` | zależności, rendery, kopie fontów i znaku, ścieżka dźwiękowa przycięta do filmu | nie |

## Jak wyrenderować

Raz, po sklonowaniu repozytorium (pobiera ok. 245 MB pakietów; pierwszy render dociąga Chrome
Headless Shell do `zrodla/node_modules/.remotion/`, 283 MB na dysku — zmierzone 2026-10-12):

```bash
cd docs/zasoby/film/zrodla && npm ci
```

Klatka wzorcowa sceny „Trzy paski” (PNG 1920×1080, klatka 280) do `zrodla/out/paski-klatka.png`:

```bash
cd docs/zasoby/film/zrodla && npm run klatka
```

Scena „Trzy paski” w ruchu, jej pierwsze 10 s (MP4 1920×1080, 30 kl./s, 10 s) do `zrodla/out/paski-10s.mp4`:

```bash
cd docs/zasoby/film/zrodla && npm run paski
```

Cały film PL w pełnej jakości (MP4 1920×1080, 30 kl./s, z muzyką, siedem scen z `src/scenariusz.ts`,
5070 klatek = 169 s = suma ich czasów) do `zrodla/out/film.mp4`:

```bash
cd docs/zasoby/film/zrodla && npm run film
```

Ten sam film w skali 0,5 (MP4 960×540) do `zrodla/out/animatik.mp4` — szybki podgląd całości:

```bash
cd docs/zasoby/film/zrodla && npm run animatik
```

Pierwsza minuta filmu w pełnej jakości (MP4 1920×1080, 30 kl./s, „Pamięć” i „Komendy”, 1830 klatek) do
`zrodla/out/minuta.mp4`:

```bash
cd docs/zasoby/film/zrodla && npm run minuta
```

Film EN (ten sam film, kompozycja `FilmEN`, ta sama muzyka) do `zrodla/out/film-en.mp4`:

```bash
cd docs/zasoby/film/zrodla && npm run film:en
```

Pętla do README jako GIF (kompozycje `PetlaPL` i `PetlaEN`, co 4. klatka = 7,5 kl./s, jedna paleta
128 kolorów przez `skrypty/gif.py`) do `docs/zasoby/film/relai-petla-25s-<pl|en>.gif`; dane muszą
być świeże, więc najpierw `npm run przygotuj`:

```bash
cd docs/zasoby/film/zrodla && node skrypty/petla.mjs pl
```

Wszystkie komendy renderu najpierw odświeżają dane, manifest, fonty, znak i muzykę (`npm run przygotuj`; manifest
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
- **liczby sceny 3** (koszty sesji, etapów i projektu, wywołania, kafle dokumentów, cennik) też nie
  leżą w repozytorium: `skrypty/panel.mjs` przepisuje je słowo w słowo ze zrzutów `relai-panel`
  0.14 z 2026-10-12 i zapisuje do `src/dane/panel.json` ze zrzutem jako źródłem; etapy planu liczy
  `core/panel/plan-state.mjs` z bieżącego `STATUS.md`, a linię o odczycie sieciowym cennika skrypt
  czyta z `panel/hooks/pane-costs.tsx`; wiersze diffu w Dokumentach są cytatem `STATUS.md` ze
  zrzutu, nie faktami filmu;
- **liczby pozostałych scen** (wersja, komendy, zamknięte plany, testy rdzenia, narzędzia, próg
  limitu, linie instalacji) liczy `skrypty/manifest.mjs` ze źródeł w repozytorium i zapisuje do
  `src/dane/manifest.json` w tym samym kształcie `{ wartosc, zrodlo }`; okno „5 h” bierze z etykiety
  zrzutu przez `paski.json`;
- **sceny 4 i 5** (`skrypty/sceny.mjs` → `src/dane/sceny.json`): kartę startu E4 liczy
  `stageCard()` z `core/panel/decisions.mjs` na `STATUS.md` i `PROMPT_ETAP_4.md` z commitu
  `0dcadef` (stan w chwili startu E4), bez zmian wejścia — do Aneksu F (E7) skrypt dopisywał
  linii metrycznej etykietę „model wykonawczy:”, bo parser panelu czytał tylko ją; test wierności
  pilnuje, że każdy wiersz karty filmu jest słowo w słowo kartą na żywo. Scena 5 nie ma
  żadnej liczby sesji (decyzja Łukasza): zdanie i przyciski karty limitu czyta skrypt
  z `cache-keeper/hooks/limit.ts`, kroki zapisu z `limit-checkpoint.md` skilla `relai-core`,
  ścieżkę pliku wznowienia liczy `core/process/resume.js`, próg 90 % to wartość domyślna
  `core/panel/limit-threshold.mjs`, a wiersz „zapis gotowy · reset 18.10 12:00” pochodzi z jedynego
  zrzutu prawdziwego zapisu (`LIMIT_CHECKPOINT_E3_zapis.png`);
- **słownik** `src/teksty.ts` nie ma ani jednej cyfry w tekście kadru: liczba wchodzi znacznikiem
  (`{komendy}`), który `src/fakty.ts` wypełnia z manifestu;
- **test faktów** `testy/fakty.test.mjs` zbiera wszystkie teksty kadru (słownik po podstawieniu,
  finał, dane scen 2–5) i kończy się błędem na każdej liczbie spoza `manifest.json`, `paski.json`,
  `panel.json` i `sceny.json` (czasy plansz odeszły z planszami w E4). Drugi licznik łapie liczebniki
  słowne i znak `%` bez liczby. Test generuje manifest ponownie i porównuje z zapisanym, a na
  zmienionych kopiach źródeł pokazuje, że fakt się zmienia. Pilnuje też prywatności kadru:
  ścieżki domowej, e-maila, identyfikatora sesji.

## Wierność panelu

Scena 3 pokazuje panel tak, jak rysuje go `relai-panel` 0.14: kolory, nazwy i opisy komend, grupy
i polecane bierze z `core/panel` (przez `src/rdzen.ts`), słowa powierzchni ze zrzutów 01–07
w [`docs/zasoby/PANEL_RELAI/zrzuty/`](../PANEL_RELAI/zrzuty/) (2026-10-12). Test
`testy/wiernosc.test.mjs` trzyma zakładki słownika przy `TABS` z `panel/hooks/pane-parts.tsx` —
czytanych z tekstu pliku, nazwy i kolejność — a komendy sceny przy `FORMS` z
`core/panel/commands.mjs`; każda z tych kontroli ma kontrolę pozytywną (kopia z inną kolejnością
zakładek, grupa bez komendy). Zmiana zakładek panelu wywraca test, zanim film rozjedzie się
z produktem.

## Scena komend

Kolejność komend to cykl życia projektu (`CYKL` w `src/komendy.ts`): adopcja, praca, opieka nad
projektem, wiedza o nim, przekazanie. Nazwa w kadrze to `NAMES[komenda][0]` z `core/panel`, ikona
to plik z [`docs/zasoby/branding/ikony/`](../branding/ikony/) (kopia bajtowa w `public/znak/`),
slogan — przyjęty przez Łukasza w Aneksie A — stoi w słowniku `src/teksty.ts`. Każdy rekwizyt
ma własny plik w `src/sceny/komendy/` i rysuje się w języku ikon (ciepła szara kreska, glina
dla tego, co działa, szałwia dla tego, co zrobione); jedyne słowa na rekwizytach („ZIP”, „.env”,
stempel „Tak”, w filmie EN „Yes” — Aneks E) są słowami produktu, a test wierności szuka ich w plikach, z których pochodzą.
`testy/wiernosc.test.mjs` trzyma też `CYKL` przy `FORMS` (każda komenda raz, kolejność z Aneksu
A), nazwy przy `NAMES`, slogany słowo w słowo i ikony bajt w bajt.

## Cztery kontrole

Każda działa w obu językach i ma kontrolę pozytywną na podłożonym defekcie:

- **fakty i prywatność** — `npm test` po `npm run przygotuj` (`testy/fakty.test.mjs` bierze oba
  słowniki z tekstami pętli; `testy/jezyki.test.mjs` pilnuje tych samych kluczy w PL i EN);
- **przepełnienia** — Chromium układa każdą klatkę i mierzy prostokąty (`src/kontrola.tsx`): tekst
  poza pudełkiem, tekst ucięty bez wielokropka, tytuł pętli poza kadrem; `--podloz` podkłada
  cztery wady, które muszą wyjść:

  ```bash
  cd docs/zasoby/film/zrodla && node skrypty/kontrola.mjs FilmEN --co=6
  ```

- **telefon** — mediana wysokości glifów w każdej linii tekstu ≥ 7 px po przeskalowaniu klatki
  do 375 px, tylko klatki ustalone. `skrypty/telefon.py` woła instrument dawnego demo
  [`docs/archiwum/demo/zrodla/glify.py`](../../archiwum/demo/zrodla/glify.py) i poprawia go w trzech
  miejscach, których tamten materiał nie miał (szary tekst na ciemnym oknie, ciemny tekst na
  karteczce leżącej na oknie, ziarno biurka); `--kontrola <klatka>` mierzy klatkę i tę samą
  klatkę w 1/3 wielkości. Linie poniżej progu ogląda się na wycinkach: w E6 były to wyłącznie
  pasy cienia okna i kursor, nie tekst.

  ```bash
  cd docs/zasoby/film/zrodla && python skrypty/telefon.py ../../../archiwum/demo/zrodla/glify.py ../relai-petla-25s-pl.gif
  ```

## Muzyka

„daylight hour” — snoozy beats, licencja **CC BY 4.0**; wybór Łukasza, plik
[`muzyka/daylight-hour.mp3`](muzyka/ZRODLO.md) ze źródłem, sumą sha256 i warunkami licencji
w `muzyka/ZRODLO.md`. Kredyt, o który prosi autor:

> 🎵(free) lofi type beat "daylight hour" by snoozy beats

`skrypty/muzyka.mjs` (w `npm run przygotuj`) dekoduje plik i dopasowuje go do długości filmu: gra
od początku do wejścia wyciszenia (93,738 s), w tym samym miejscu taktu przechodzi na początek
części rytmicznej (9,895 s), poziom 0,42 (0,6 obniżone o 30 % decyzją Łukasza), ostatnie 4 s wyciszone. Wynik `public/muzyka/relai.wav`
jest poza gitem; `testy/muzyka.test.mjs` pilnuje sumy pliku źródłowego, kredytu, długości co do
próbki i powtarzalności bajtów.

## Fonty i sieć

Fonty wyłącznie z [`docs/zasoby/fonts/`](../fonts/LICENCJE.md) (licencje OFL i Apache 2.0), kopiowane
przed renderem do `zrodla/public/fonty/`. Źródła filmu nie wykonują żadnego żądania sieciowego.

## Licencja Remotion

Remotion 4.0.535 na **Remotion Free License** — Łukasz działa jako osoba prywatna / firma do trzech
osób; warunki z remotion.dev/docs/license/faq odczytane 2026-10-12. Film raz wyrenderowany nie
zależy od licencji przyszłych wersji. Zależność dotyczy wyłącznie narzędzia filmu, nie pluginu RelAI.
