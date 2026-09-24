# Materiał demo RelAI

Zaakceptowane pliki demonstracyjne i dokumentacja materiału. Od 2026-09-24 (E5 planu
PROWADZENIE_END_TO_END) GIF-y są renderem pod telefon, a źródła renderu mieszkają obok
w [`zrodla/`](zrodla/) — poprzednie źródła zniknęły razem z katalogiem roboczym i materiału nie
dało się poprawić bez budowania go od nowa.

## Co tu wchodzi

| Plik | Do czego | Parametry |
|---|---|---|
| `demo-relai-25s-pl.gif` | osadzenie w `README.md` | **720×900 (pion)**, 25 s, 10 kl./s, bez dźwięku, 1,56 MB — render 2026-09-24 |
| `demo-relai-25s-en.gif` | wersja angielska tego samego cięcia | jak wyżej, 1,46 MB |
| `demo-relai-60s-pl.mp4` | kanały zewnętrzne (wpis, sieć autora) | 1920×1080, 60 s, 30 kl./s, bez dźwięku — render 2026-09-12, oglądany na pełnym ekranie |
| `demo-relai-60s-en.mp4` | wersja angielska | jak wyżej |

## Co pokazuje GIF

Pięć scen: znak RelAI → prośba o plan i plan płatności z pięcioma etapami (E1 „Zamówienie po
stronie serwera" gotowy do startu, ścieżka `docs/plany/PLATNOSCI/STATUS.md`) → nowa sesja bez
historii rozmowy → „Kontynuujemy pracę." i odpowiedź „gdzie jesteśmy" z propozycją
`/relai-stage` → karta potwierdzenia etapu („Etap — E1 z E5", „Weryfikacja — 11 punktów",
„Zaczynamy?").

Plan jako osobny dokument, etapy ze statusami, a po przerwie **świeża sesja mówi, który etap jest
gotowy do startu i z którego pliku to wie**. Materiał jest odtworzeniem prawdziwego przebiegu:
każda pokazana odpowiedź i każda ścieżka pochodzą z zapisu realnych sesji, nie z inscenizacji —
wersje narzędzia i modelu oraz tabela pokrycia klatek są w
[dokumentacji materiału](../../archiwum/plany/PIERWSI_UZYTKOWNICY/DEMO.md). Dłuższa wersja i napisy
angielskie: [`docs/zasoby/demo/`](./).

Przebieg (RelAI 2.1.3, Claude Code, Opus 5, 2026-09-12) i jego zapis krok po kroku zostają
w archiwum planu PIERWSI_UZYTKOWNICY: [`zapis/`](../../archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/)
i [DEMO.md](../../archiwum/plany/PIERWSI_UZYTKOWNICY/DEMO.md) (prompty, liczba prób, kierunek
wizualny zaakceptowany 2026-09-12). Render z 2026-09-24 niczego nie dokłada do treści — zmienia
format i wielkość tekstu.

## Czytelność na telefonie — kryterium w warunkach odbiorcy

**Próg ustalony przed renderem:** mediana wysokości glifów w każdej linii tekstu **≥ 7 px** po
przeskalowaniu klatki do **375 px** szerokości (szerokość typowego telefonu). Instrument:
[`zrodla/glify.py`](zrodla/glify.py) — maska tuszu, składowe spójne, jawny filtr odsiewu (kreski,
plamy, pojedyncze znaki), grupowanie w linie po nakładaniu zakresów, osobna maska dla jasnego tekstu
na ciemnym dymku. Mierzy **klatki ustalone** (stojące na ekranie ≥ 300 ms albo prawie identyczne
z sąsiadem); klatki przenikania nie są czytane.

| Materiał | Klatki ustalone | Linii | Minimum | Wynik |
|---|---|---|---|---|
| nowy GIF PL | 38 z 100 | 167 | 8,0 px | **przechodzi** |
| nowy GIF EN | 40 z 100 | 169 | 8,0 px | **przechodzi** |
| stary GIF PL (960×540, kontrola pozytywna) | 248 z 250 | 1 517 | 2,0 px | nie przechodzi |
| stary GIF EN (kontrola pozytywna) | 248 z 250 | 1 517 | 2,0 px | nie przechodzi |

Obok pomiaru pikseli render sprawdza DOM (`render.js … uklad`) w pięciu stanach ustalonych:
0 przepełnień (kontrola pozytywna na podłożonym przepełnieniu je wykrywa), najmniejszy tekst
15 px przy 375 px, luminancja względna każdego tekstu na jasnym tle ≤ 0,167. Ograniczenie
instrumentu pikselowego: tekstu jaśniejszego niż luminancja 185 nie widzi — dlatego kontrola koloru
w DOM jest częścią kryterium, nie dodatkiem.

## Pokrycie klatek

[`zrodla/pokrycie.py`](zrodla/pokrycie.py) sprawdza każdy cytat z pliku albo odpowiedzi agenta na
scenach PL w zapisie przebiegu: **17/17 pokrytych**, 0 bez pokrycia. Kontrola pozytywna: podłożony
cytat „Etap E3 „Webhook i potwierdzanie zapłaty" jest GOTOWY DO STARTU" zgłoszony jako
`BEZ POKRYCIA`. Ścieżka `docs/plany/PLATNOSCI/STATUS.md` jest złożona z dwóch członów jednego
zdania zapisu („`docs/plany/PLATNOSCI/PLAN.md` + `STATUS.md`") i sprawdzana członami. Napisy
angielskie są tłumaczeniem tych samych zdań — sprawdzone odczytem, nie instrumentem.

## Jak odtworzyć render

Bez pakietów npm i bez `ffmpeg`: Node.js (globalny `WebSocket`, od wersji 22), Chromium z instalacji
Playwrighta (albo zmienna `RELAI_CHROME`), Python z Pillow i numpy. Wynik pośredni trafia do
`.claude/relai/work/demo/` (poza gitem; inny katalog: `RELAI_DEMO_OUT`).

```bash
node docs/zasoby/demo/zrodla/sceny.js
```

```bash
node docs/zasoby/demo/zrodla/render.js pl uklad
```

```bash
node docs/zasoby/demo/zrodla/render.js pl klatki
```

```bash
python docs/zasoby/demo/zrodla/gif.py pl docs/zasoby/demo/demo-relai-25s-pl.gif
```

```bash
python docs/zasoby/demo/zrodla/glify.py docs/zasoby/demo/demo-relai-25s-pl.gif 1
```

```bash
python docs/zasoby/demo/zrodla/pokrycie.py
```

To samo dla `en`. Treść scen i tokeny (paleta, skala typograficzna, promienie) mieszkają
wyłącznie w `sceny.js`; scena nie używa wartości dosłownej spoza tokenów. Render jest
deterministyczny co do piksela z dokładnością do pojedynczych pikseli wygładzania (zmierzone:
jedna klatka odtworzona z repozytorium różni się od renderu w jednym pikselu).

## Zasady

- **Bez zasobów zewnętrznych.** Fonty są osadzone w renderze z `docs/zasoby/fonts/`; materiał nie
  pobiera niczego z sieci przy odtwarzaniu.
- **Bez dźwięku.** Materiał musi być czytelny przy wyciszonym odtwarzaniu — napisy niosą całą treść.
- **Każda klatka pokazująca plik albo odpowiedź agenta ma pokrycie** w zapisie realnego przebiegu.
- **GIF do README trzyma się poniżej 5 MB** (SZACUNEK — próg przyjęty dla czasu wczytania strony
  repozytorium). Przekroczenie rozwiązuje się liczbą klatek i paletą, nie skróceniem materiału.
- **Czytelność mierzy się przy 375 px szerokości**, nie na ekranie autora.
- Plik wynikowy wchodzi tutaj **po akceptacji właściciela**, nigdy „na próbę".

## Czego tu nie ma

Nagrania ekranu. Materiał jest **odtworzeniem zmierzonego przebiegu**, renderowanym z zapisu
prawdziwej sesji — nie inscenizacją i nie przechwytem obrazu.
