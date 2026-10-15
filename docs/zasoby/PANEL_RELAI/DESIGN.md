# DESIGN — panel RelAI i paski nad promptem (Claude Code, aplikacja desktopowa)

Wersja: **1.3** · Data: 2026-10-15 (1.3: E5 — natywny dymek, siatka baterii, wiersz kontekstu
z progiem auto-compactu, kształt stanu segmentu; 1.2: odbiór E4 — budżet znaków, rysunek bez tła) · Powstał w planie WYGLAD_PANELU, E3 (Aneks F), na prośbę
Łukasza: „spiszesz te wszystkie zasady, wszystkie te lekcje, wszystkie te nasze tutaj poprawki […]
jak każę Ci dodać coś nowego, to już będziesz wiedział w jakim stylu, z jakim formatowaniem, jak
z responsywnością, jak obsłużyć problemy z rozjeżdżaniem się tekstu, nierównością przycisków,
wyjeżdżaniem przycisków za swoje obrysy”.

**Jak czytać.** Ten dokument obowiązuje **przed** każdą zmianą wyglądu `relai-panel`,
`relai-progress` i `relai-cache-keeper`. Mówi, jak ma być i dlaczego. Szczegóły i historia
poszczególnych decyzji leżą w briefie [STYL_PASKOW_CLAUDE.md](STYL_PASKOW_CLAUDE.md) (paski,
kalibracje rund) i w [PULAPKI.md](../../PULAPKI.md) (zachowania silnika). Przy sprzeczności
wygrywa nowsza decyzja Łukasza zapisana w dzienniku. Lista kontrolna z sekcji 12 jest obowiązkowa
przed pokazaniem czegokolwiek.

---

## 1. Charakter

- **Paleta „Warsztat”** (wybrana 2026-08-08): papier, glina, musztarda, szałwia. Źródło barw:
  `ROOT` w `core/panel/theme.mjs`, wierna kopia `:root` szablonu planów HTML.
- **Odrzucone na stałe:** konsola monospace, panel administracyjny, blueprint, plakat
  brutalistyczno-szwajcarski. Nie proponujesz ich nawet jako inspiracji.
- **Czego Łukasz szuka:** „wigor”, zaokrąglenia, typografia z charakterem (nagłówki odręczne
  Kalam), spokój zamiast krzyku. Z trzech propozycji wybiera zwykle najprostszą i najczytelniejszą.
- **Najpierw przegląd, treść na żądanie** — ikony, stany kolorem i znakiem, liczby; szczegół po
  kliknięciu („Rozwiń”, podgląd dokumentu pod nim).
- **Ustawienie z przycisku, nie z komendy.** Komenda zostaje drogą zapasową.
- **Desktop jest miejscem kalibracji smaku.** Terminal to odpowiednik tekstowy: ma działać, nie
  musi zachwycać.

## 2. Dwa wyglądy aplikacji — skąd kolor

Mod **nie wie**, czy aplikacja jest jasna czy ciemna (P-042): wiersz `theme` stoi na `dark`,
zdarzenie zmiany nie przychodzi. Funkcje CSS (`light-dark()`, `var()`, `Canvas`, `color-mix()`)
w `Box`/`Text` desktop odrzuca (P-044). Dlatego **nic w panelu nie wybiera palety** — wszystko
przełącza się samo, trzema drogami:

| Co | Droga | Gdzie w kodzie |
|---|---|---|
| tekst (`Text color`) | klucz motywu narzędzia | `TONE_OF` / `TONE_ROLES` |
| ramka (`borderColor`) | klucz motywu | `EDGE_OF` |
| tło w `Box` | brak (kartka prześwituje) albo klucz | `FILL_OF`, `HOVER_FILL` |
| rysunek (`Svg`: nagłówki, ikony, wykresy, znaczniki) | obie palety w CSS, jasna pod `@media (prefers-color-scheme: light)` | `twoTone()`, `SVG_LIGHT`, `inkCss()` |
| kartka Warsztatu pod zakładką | „kanapka” `Svg` (sekcja 4.2) | `sheetSvg()`, `parts.sheet` |

Kod zakładek **może** pisać surowe role `THEME.*` — `retone()` w `panel/hooks/skin.ts` zamienia je
na klucze w gotowym drzewie, a każdy `Svg` dostaje jasną paletę. Nowy kolor bez decyzji w
`TONE_OF`/`EDGE_OF`/`FILL_OF`/`SVG_LIGHT` łapie test rdzenia („no raw color … without a decision”).

### 2.1 Role tekstu → klucz (kontrast zmierzony na kartce, 4,5 : 1)

| Rola | Klucz | Ciemna / jasna kartka |
|---|---|---|
| tytuł, wartość | `text` | 13,9 / 19,4 |
| opis, podpis | `inactive` | 8,9 / 7,8 |
| akcent musztardy, nagłówek tekstem | `warning` | 6,0 / 8,3 |
| sukces | `success` | 4,9 / 7,3 |
| uwaga, błąd, akcent gliny w tekście | `error` | 5,6 / 9,0 |

**Nie dla tekstu:** `claude` (glina, 3,7 / 4,2) — tylko ramka zaznaczenia i drobne znaczniki;
`subtle` (4,5 / 3,5) — tylko ramki; `inverseText` — w jasnym biały na białym. Wartości kluczy
mierzysz z pikseli zrzutu sondy (pola koloru), nie z pamięci (`KEY_SAMPLE`).

### 2.2 Ramki i tła

- Ramka spoczynkowa `subtle`, wyłączona `promptBorder`, zaznaczenie `claude`, wyróżnienie i
  wciśnięcie `warning`.
- Najechanie: tło `promptBorder` (tekst i opis czytelne na nim ≥ 5 : 1).
- `transparent` jako kolor ramki desktop rysuje **kolorem tekstu** — nie używać.

### 2.3 Jasna paleta rysunków

Ciemniejsza musztarda `#9a6a12` i glina `#a8502e` (zwykła musztarda na białym ma ~2 : 1), papier
`#fffdf7` zamiast ciemnej karty, linie `linia`/`linia-2`. Pełna tabela: `SVG_LIGHT`.

## 3. Paski nad promptem

Obowiązuje brief, sekcje 1–5 i 13: pasek spokojny w spokoju (zero przycisków na stałe), mówiący
tylko przy zdarzeniu (drugi wiersz pod swoim paskiem); wspólna siatka etykieta | treść | liczba;
**wariant 3b** — bez tła i ramki, nad każdym paskiem linia gasnąca (`RULE`) tylko między paskami
RelAI; wszystkie przyciski pasków `primary` (`secondary` w ciemnym tonie i wygląda na niższy);
pasek postępu jako lista kroków (§3 briefu). Owijacz z `next(e)` nigdy z `width` (P-017).

**Pasek cache od 1.3 (E5, wybór S2 + K1):** baterie w siatce na całą szerokość — kolumny z
najszerszej miary, każdy wiersz w kolumnach pierwszego („limit tygodnia” pod „cache”, nie
w innym x). Kontekst ma własny wiersz w gramatyce baterii: pasek od pierwszej kolumny, „kontekst”
i „użyte / okno · %” w ostatniej kolumnie, widoczne bez najechania; okno z sesji, nigdy z tabeli
modeli. Próg auto-compactu (Aneks H) to kreska jak próg limitu w Kosztach, bez napisu nad nią;
barwa paska liczona do progu regułą baterii (≤ 30 % drogi żółta, ≤ 10 % i od progu czerwona).
Próg liczony tak jak kompaktowanie, razem z `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` (rozbicie silnika
go pomija — PULAPKI). Wiersz baterii i wiersz kontekstu mają stałe 24 px w każdej szerokości.

## 4. Panel — kompozycja (wariant 3 „jedna kartka”, zaakceptowany 2026-10-15)

### 4.1 Szkielet

```
Panel RelAI (Kalam)   [Komendy] [Koszty] [Dokumenty] [Mapa] [Pomoc]     ← nagłówek, poza kartką
╭──────────────────────────── kartka ─────────────────────────────╮
│  Teraz / karta decyzji                                          │
│  ───────────── linia gasnąca ─────────────                      │
│  Sekcja (nagłówek Kalam)                                        │
│    ikona  Nazwa /komenda · opis                      [Otwórz]   │
│    ikona  Nazwa /komenda · opis                      [Otwórz]   │
│  ───────────── linia gasnąca ─────────────                      │
│  Sekcja …                                                       │
╰─────────────────────────────────────────────────────────────────╯
```

- **Jedna kartka na zakładkę.** W środku **sekcje, nie karty**: bez ramek, bez teł. Sekcje
  rozdziela linia gasnąca `RULE` (ta sama co między paskami), jej 22 px powietrza to cały odstęp.
- **Wiersze w sekcji** rozdziela odstęp (wiersz komórki), nie linia.
- **Ramka wewnątrz kartki tylko dla rzeczy, która czeka na decyzję człowieka:** karta „Tak / Nie”,
  otwarty formularz pod wierszem. Kafle, sumy, sekcje zwijane — bez ramek.
- Kierunek pierwszy dla list i wierszy pod sobą: **przygaszone linie gasnące**, ramki tylko jako
  alternatywa (Łukasz: „niech to będzie taki pierwszy kierunek”).
- Ramka kartki: `subtle`; w jasnym ma być wyraźna, w ciemnym miękka — nigdy biała.

### 4.2 Kartka z wypełnieniem („kanapka”, P-044) — wersja 1.1

Tło w `Box` nie idzie za wyglądem, więc wypełnienie rysuje `Svg`, a `Svg` maluje się **nad**
zwykłą treścią — także nad treścią z `position="relative"` stojącą po nim (sonda 0.7.0). Każda
zakładka stoi na wypełnionej kartce (Łukasz 2026-10-15: „zawsze wypełnione, nie może być nawet
jednego piksela między borderem a wypełnieniem”). Układ:

1. pudełko `position="relative" overflow="hidden"` **bez ramki `Box`** (ramka `Box` przycina
   wypełnienie do swojego wnętrza i zostawia szczelinę 1–5 px) →
2. **ukryta kopia** treści w toku (nadaje wysokość; klucze z sufiksem `~u`, rysunki wydrążone,
   bez kolorów) →
3. `Box` absolutny `top/left/right={0} bottom={1}`, **w kolumnie** (w wierszu rysunek bierze
   ~375 px zamiast szerokości), z rysunkami `width="100%" height="100%"` po **4000 px** (silnik
   przyjmuje najwyżej 4096): góra kartki i odcinki środkowe →
4. `Box` absolutny `bottom={0} height={1}`, kolumna z `justifyContent="flex-end"`: dół kartki →
5. ta sama treść w `Box` absolutnym `top/left/right={0}`.

**Ramka jest w rysunku razem z wypełnieniem** (`sheetTopSvg`/`sheetMiddleSvg`/`sheetEndSvg`,
geometria w CSS: `calc(100% - 1px)`, `rx` 10 px): góra ma krawędź górną i boki, dół — dolną; styk
jest niewidoczny co do piksela. Kolor ramki: `subtle` zmierzony w obu wyglądach.

**Waga:** kopia podwaja zakładkę. Desktop rysuje do ~1 260 elementów (pomiar 2026-10-15,
P-023 pkt 7: liczą się elementy, nie znaki; rysunek z treścią waży ×5). `register.tsx` liczy
`treeWeight` całego panelu z kartką; powyżej `DRAW_LIMIT` (1 200) zakładka stoi w samej ramce
`Box` bez wypełnienia — **nigdy nie znika**. Nigdy kanapka w kanapce. Terminal: bez kartki.

**Margines kartki:** `paddingX` 2 (1, gdy wiersze stoją pod sobą — wąski panel), `paddingY` 1 —
jeden dla wszystkich zakładek (Łukasz: „brakuje w ogóle jakichś paddingów w środku”).

### 4.3 Wiersz

`ikona (flexShrink 0) | słowa (rosną, zawijają) | przycisk (flexShrink 0)` przez `textAndAct`.

- **Jedna kolumna przycisków na całą zakładkę:** każdy wiersz ten sam margines (`paddingX={1}`),
  także „Teraz” i Polecane. Różny margines = przyciski „się nie wyrównują” (live 2026-10-15).
- Każdy przycisk w **swoim** wierszu, po prawej — nie w osobnej kolumnie obok bloku tekstu.
- Słowa jako osobne kawałki zawijanego wiersza z `columnGap`, nigdy ze spacją na początku
  kawałka (P-043 pkt 2: spacja otwierająca nie łamie, skleja z poprzednim słowem).
- Ikona komendy 24 px w wierszu, 44 px w Polecanych; nazwa polska pogrubiona, obok `/komenda`,
  opis po `·`.

## 5. Typografia i słowa

- Nagłówki sekcji i liczby kosztów — Kalam jako `Svg` (generator `build-panel-headings.js`,
  pliku `headings.mjs` nie edytujesz ręcznie). Tekst zmienny w czasie — krojem powierzchni.
- `Text` nie ma rozmiaru (Claude Code 2.1.295): małe podpisy rysuje `Svg`.
- Stan słowem **i** znakiem (`✓ zrealizowany`, `● w toku`), nigdy samym kolorem.
- Procenty w kosztach bez setnych; kwoty `usd()`; „x/y” tylko gdy y jest celem.
- Hover **dodaje** (karta obok celu), nigdy nie zamienia widocznego tekstu.
- Element graficzny stoi **przy swoim napisie**, nie między napisami.

## 6. Układ i responsywność (desktop liczy jak CSS — P-043)

- Element flex nie zwęża się poniżej najdłuższego słowa ani etykiety przycisku. Przycisk i ikona:
  `Box flexShrink={0}`. Wiersz bez `flexWrap`, który się nie mieści, wychodzi poza rodzica.
- **Jedna decyzja układu na panel**: poniżej `STACK_BELOW = 48` kolumn (`bodyColumns`) każdy
  przycisk schodzi **pod** swoje słowa, od 48 stoi obok. Nigdy wiersz po wierszu.
- Tekst do ucięcia: pudełko o **bazie zerowej** `width={0}` + `flexGrow` (`minWidth={0}` i
  `wrap="truncate"` nie wystarczą — P-043 pkt 6).
- Zawijany rząd przycisków: `rowGap` (natywny przycisk 28 px, bez odstępu się styka).
- `Svg` obok przycisku we własnym `Box` (wtedy skaluje się do pudełka).
- Wiersz desktopu ~24 px, komórka ~9,8 px, tekst ~6,8 px na znak (P-024).
- Mieści się: **40 kolumn** każda zakładka (test), Komendy ≤ **1065 px** wysokości (test),
  wąski panel podziału okna (31, 44, 75, 94 kolumn — `narrow.test.ts`, model CSS).
- Próba wyglądu zawsze na **najdłuższych realnych danych** (najdłuższa nazwa, ścieżka, opis).

## 7. Przyciski

- **`primary` tylko dla zakładki wybranej i jednej akcji głównej** (Start etapu, Wyślij do czatu,
  Tak). Wartość wybrana w grupie (próg, filtr, widok) to `secondary` z kropką: `● 98 %`
  (przegląd 2026-10-15: biały przycisk w pięciu rolach nie mówił nic).
- **Kolor błędu (`error`) tylko dla tego, co nie działa** albo wymaga naprawy; liczby, nagłówki
  list i uwagi — `warning` (musztarda) albo `inactive`.
- Wyłącznie natywny `Button`: `primary` — jak wyżej;
  `secondary` — akcje wierszy; `plain` — przycisk-duch (rzadko). Kolor etykiety, dzieci `Text` i
  obrys wokół desktop **ignoruje** (P-042).
- Kliknięcie tylko na `Button`. Efekt kliknięcia: błysk ramki karty (`pressed`) i etykieta „✓
  Wysłano” na chwilę — nigdy hover odwracający tekst („tragedia”).
- Jedna akcja główna na sekcję; reszta drugorzędna.

## 8. Rysunki (`Svg`)

- **Zawsze niepusty `alt`** — bez niego desktop rysunku nie rysuje (P-042, P-044).
- `width="100%"` w znacznikach daje ~375 px (domyślne 300 × 150); stały `width`/`height` skaluje
  się do szerokości miejsca z proporcją. Na tła: 1 : 100. `isInteractive` (hover, SMIL, `<title>`)
  ma ramkę stałego rozmiaru — nie na tła.
- Rysunek pod treścią (pasek z hoverem, wykres) **nie maluje własnego tła** (`fill="none"`): na
  zakładce w samej ramce tło w kolorze kartki stoi jako pas (E4).
- Obie palety w CSS rysunku; reguła tylko dla pary atrybut–kolor obecnej w rysunku (budżet).
- **Pełne słowa po najechaniu — natywny dymek z `<title>`, nigdy własna kapsuła** (E5, Łukasz:
  „dajmy po prostu ten natywny z caloscia i tyle, nie komplikujemy”). Własna kapsuła w `Svg`
  się ucina na krawędzi ramki, miga, łapie hover poza ikoną, a zawinięta podnosi wiersz
  w spoczynku. Element chwilowy nigdy nie zmienia geometrii spoczynku — test wysokości spoczynku
  stoi obok testu nowego zachowania.
- **Stan bez polegania na barwie** (E5): znacznik ≥ 3 : 1 do kartki w obu wyglądach, stany różni
  kształt — zrobiony pełny, w toku połowa w obrysie, czeka sam obrys, nie przeszedł pełny w glinie.
  Trzech wypełnień parami ≥ 3 : 1 i do białej kartki nie ma.
- Wykres to geometria; każde słowo stoi w pudełku, które liczy układ (tekst w `Svg` się nie
  zawija i jest szacunkiem metryki).

## 9. Wydajność

- Budżet drzewa: **waga ≤ 1 200** (`treeWeight`: element 1, `Svg` z treścią 5, pusty obrys 1) na
  najgorszych danych — `redraw.test.ts`, `map.test.ts`. Znaki nie są miarą: 250 tys. znaków w ~210
  elementach się rysuje, 1 344 elementy już nie (sonda 2026-10-15, P-023 pkt 7).
- **Drugi budżet — znaki drzewa ≤ 280 tys.** (`isDrawable` w `pane-parts.tsx`, SZACUNEK): wiele
  rysunków z hoverem waży więcej, niż liczy waga (E4: waga 1 045, 338 tys. znaków — pusty panel).
  Zakładka, która nie mieści się nawet w samej ramce, pokazuje zakładki, jedno zdanie i
  „Zwiń wszystko” — **nigdy pusty panel**, także po przeładowaniu z zapamiętanym rozwinięciem.
- Długie listy stronicowane: diff dokumentu po **60** wierszy, kafle i drzewo z limitem i linią
  „… jeszcze N”.
- Sekcje ciężkie zwinięte domyślnie (stan w `$.state`), zwinięta sekcja nie rysuje treści.
- Kanapka liczy się w wadze; za ciężka zakładka traci wypełnienie, nie znika (4.2).
- Dane zakładki z pamięci (`remember`), nie przy każdym rysowaniu.

## 10. Klucze elementów

- Unikalne w całym drzewie (silnik odrzuca dwa `Button` o jednym kluczu). Przed nadaniem nowego
  klucza sprawdź istniejące (`sheet` to sekcja Ściąga, `tab-sheet` — dawna zakładka).
- Element JSX: `{ type, props: { key, … }, children }` — `children` na wierzchu, nie w `props`.

## 11. Proces pracy nad wyglądem

1. **Sonda przed projektem**, gdy nie wiesz, co nośnik umie — małe pola, kontrola pozytywna
   (surowy hex, `red`), zrzut obu wyglądów.
2. **Trzy warianty w prawdziwym nośniku** (mod z przełącznikiem), różne **kształtem** już w stanie
   domyślnym, na realnych danych; przełącznik wariantu — tak, symulacja jasnego/ciemnego — **nie**
   (Łukasz przełącza aplikację sam).
3. **Każde drzewo przez `claude plugin test` z montażem na desktopie** przed pokazem (pusty panel
   „has not drawn” = drzewo odrzucone przez walidator).
4. Po akceptacji przenosisz do produktu **kształt** wariantu, nie tylko barwy; przed oddaniem
   zrzut/model drzewa **obok zaakceptowanego zrzutu**, punkt po punkcie (karty? linie? ramki?
   kolumna przycisków?).
5. Pomiar na żywo: kopia zainstalowanego pluginu do katalogu roboczego, podłożenie, `/reload-plugins`;
   zła wersja — natychmiast przywrócić kopię.
6. **Zrzuty robisz sam** skryptami z `narzedzia/` (README tam): `zrzut-panelu.ps1` naciska
   zakładki i przyciski panelu przez UI Automation i fotografuje okno (PrintWindow, także
   zasłonięte), `-UnfoldAll` rozwija każdą sekcję, `lupa.ps1` powiększa szew ×10. Człowiek
   przełącza tylko wygląd aplikacji i `/reload-plugins`. Okno zminimalizowane — zrzutu nie będzie.
   Prośba o zrzut pasków — zwykły tekst, bez pola pytania (P-041).
7. Słowa Łukasza z każdej rundy do dziennika; zrzuty `docs/zasoby/PANEL_RELAI/zrzuty/<PLAN>_<E>_r<N>_*`.

## 12. Lista kontrolna przed oddaniem

- [ ] Kształt zgodny z zaakceptowanym zrzutem (kartka, sekcje, linie, ramki tylko przy decyzji).
- [ ] Przyciski w jednej kolumnie; ten sam margines wiersza wszędzie.
- [ ] Ciemny i jasny wygląd, pełne okno i wąski panel (< 48 kolumn), najdłuższe dane.
- [ ] Żaden tekst ani przycisk poza swoim obrysem (`narrow.test.ts`, 40 kolumn, wysokość).
- [ ] Tekst tylko w kluczach z tabeli 2.1; nowy kolor ma decyzję w `theme.mjs` (test rdzenia).
- [ ] Każdy `Svg` z niepustym `alt` i jasną paletą.
- [ ] Najechanie nie zmienia wysokości ani układu spoczynku (dymek tylko z `<title>`).
- [ ] Klucze unikalne; budżet drzewa ≤ 210 k na najgorszych danych.
- [ ] `claude plugin validate` i `plugin test` binarką aplikacji (P-024), rdzeń `node --test`,
      `sync-panel-core.js --check`.
- [ ] Terminal: odpowiednik tekstowy, test terminalowy zielony.

## 13. Źródła

Brief [STYL_PASKOW_CLAUDE.md](STYL_PASKOW_CLAUDE.md) · pułapki P-017–P-024, P-041–P-044 ·
plan [WYGLAD_PANELU](../../archiwum/plany/WYGLAD_PANELU/STATUS.md) (Aneksy A–H) · zrzuty
`zrzuty/WYGLAD_PANELU_E1_*`, `_E2_*`, `_E3_*` · odnogi PANEL_WASKI, AUDYT_MODOW, SPLIT_VIEW.
