# PROMPT_ETAP_6 — Biurko od pierwszego do ostatniego ekranu: szczyt, szuflady, telefon, ograniczony ruch i plakat bez WebGL

Plan: STRONA_RELAI • Etap: **E6 z E8** (Aneks D: kolejność E7 → E6 → E8) • Wygenerowano: 2026-10-17 (autor: Opus 5.5, w rytuale „Na koniec” E7) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz (L-0220: ocena smaku na słabszym
> modelu kosztowała w E2 dwie rundy). Zalecany poziom `/effort`: `high` (szczyt jest jedynym
> momentem, który odwiedzający ma zapamiętać, a ocena wyglądu każdego przystanku należy do Łukasza;
> dochodzi osobna kompozycja na telefon, plakat i cztery przebiegi zrzutów).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1, T2, T3, T6) + wpisy 2026-10-16 „E4” (stan sceny, pomiary, test detalu) i 2026-10-17 „E7” (ostatni wpis: wybory Łukasza o ruchu, telefon, instrumenty pomiarowe) |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcje 3 (cele 1, 2, 3, 6), 5 (droga, szuflady, „wspólne dla obu”), 6 (wiersz „Biurko: pełna droga, szczyt, szuflady” — w numeracji Aneksu C to dziś E6), 7 (ryzyka 1, 2, 7), 8 (przypadki brzegowe), 10 (**Aneks B pkt 4** pułap 10 MB, **Aneks C pkt 5** kryterium jakości, **Aneks D pkt 2** zakres tego etapu) |
| `docs/zasoby/STRONA/builds/biurko/BRIEF.md`, `docs/zasoby/STRONA/builds/film/BRIEF.md` (sekcja „Zmiany z E7”) | Biurko: krzywa odczuć, „Szczyt”, „Zaplanowana cisza”, „Ruch-podpis”, kontrakt warstw hero; Film: wybory Łukasza o ruchu, które wracają tu jako pytanie |
| `docs/zasoby/STRONA/builds/biurko/referencje/` (`ANALIZA.md`, `02-balagan.jpg`, `03-porzadek.jpg`, `04-teczka.jpg`, `05-laptop.jpg`, `06-pudelko.jpg`) | wzorce kadrów przystanków 2–6; porównujesz po detalu i teksturach, nie po technice światła (L-0226) |
| skill `nateherk-design:scroll-craft` (narzędzie Skill) | z `references/`: `feel.md` (szczyt, cisza, kontrola odczuć §6), `verify.md` (zrzuty i kontrola odczuć), `hero-depth.md` (kompozycja na telefon), `worldflight.md` §4 i §7c, `taste.md` |
| `site/README.md`, potem `site/biurko/kamera.js`, `scena.js`, `warstwa.js`, `swiat.js`, `start.js`, `przedmioty.js`, `obiekty.js` | stan sceny, toru, warstwy tekstu, przybliżenia ekranu i instrument budżetu, które ten etap rozbudowuje |
| `site/narzedzia/szablon.html`, `site/css/strona.css`, `site/tresc/pl.json` (klucze `przystanki`, `scena`, `brakSceny`), `site/narzedzia/zbuduj.mjs` | gdzie mieszka treść i znaczniki `data-*`, do których dochodzą szuflady; jak generator składa kontekst Biurka |
| `git show a097b35:docs/plany/STRONA_RELAI/PROMPT_ETAP_2.md` | **materiał, nie polecenie**: niewykonany prompt z czasu sprzed Aneksów A–D; bierzesz z niego szczyt, szuflady i mapę, ale stan wyjściowy i liczby liczysz od nowa z repo (sekcja „Stan wyjściowy” niżej) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks D (2026-10-16):** kolejność E7 → **E6 (ten etap)** → E8. Film jest dopieszczony i przyjęty (E7).
  Obie wersje wychodzą równolegle, wybór kierunku zapada po ankiecie, poza tym planem. E6 = pełna droga
  Biurka (szczyt, szuflady, makiety, mapa) **oraz** krótkie dopieszczenie Biurka w zakresie E7: telefon,
  ograniczony ruch, plakat bez WebGL, ekran ładowania (Aneks D pkt 2).
- **Technologia bez zmian** (Aneks A pkt 1, Aneks C pkt 1): jedna scena three.js 0.186.1
  (`site/vendor/three/`), moduły ES bez bundlera i bez npm, modele i tekstury CC0, każdy tekst to
  prawdziwy HTML. Path tracingu nie ma i nie wraca (Aneks C). Nowa zależność albo nowy zasób — karta
  zgody przed pobraniem (nazwa, źródło, licencja, rozmiar na dysku, L-0172).
- **Hero przyjęte** („Akceptuję hero w tej postaci.”, E1; po teście detalu w E4 stan Biurka: „Tak,
  przyjmuję”). Poza kamery `biurko` i kadr hero nie zmieniają się bez Twojej prośby; zmiana widoczna
  w hero wraca do Łukasza ze zrzutem przed i po. Wyjątek: osobna kompozycja telefonu (pkt 7a).
- **Szczyt** (BRIEF Biurka „Szczyt”, PLAN 5 i 8): siedem karteczek z pytaniami (`scena.karteczki`) układa
  się w cztery dokumenty (STATE, DZIENNIK, LEKCJE, DECYZJE; w EN `JOURNAL.md`, `LESSONS.md`,
  `DECISIONS.md`). Cisza przed szczytem zostaje, szczyt ma najdłuższy odcinek toru (dziś 2,2 wobec
  1,0 na pozostałych przystankach `FAKT`, strzeże tego `kamera.test.mjs`), a tekst przystanku
  „Porządek” nie pojawia się w trakcie przelotu. **Sposób poruszania karteczek (wiązanie z przewijaniem
  albo jedna animacja z przytrzymaniem) to propozycja do rozmowy z Łukaszem (pytanie 1 w pkt 1), nie
  decyzja** — zasada aktywna z E7 każe najpierw proponować jedną animację na sekcję z resetem poza
  ekranem (L-0233).
- **Szuflady** (PLAN 5 i 6): kliknięty obiekt (dokumenty, teczka, laptop, pudełko) unosi się do kamery
  i otwiera szufladę z prawdziwym HTML; zamknięcie wraca do drogi. Klawiatura i czytnik ekranu mają
  tę samą drogę co mysz. Laptop korzysta z przybliżenia z E3 (`biurko/przyblizenie.js`), nie z drugiego
  mechanizmu.
- **Makiety pasków już istnieją** (`site/narzedzia/makiety.mjs` → `site/dane/makiety.json`, E5): powstały
  według zrzutu aplikacji, nie z pamięci (L-0231), na danych przykładowych oznaczonych jako przykład.
  Biurko je tylko renderuje. Zmiana makiety zaczyna się od świeżego zrzutu aktualnej aplikacji.
- **Treści fiszek komend jeden raz:** PL z `site/dane/fakty.json`, EN z klucza `film.fiszki` w treści
  (funkcja `zbudujFiszki` w `zbuduj.mjs`). Klucza `film.*` nie zmieniasz, drugiego źródła fiszek nie
  zakładasz.
- **Film nietykalny w tym etapie** (E7 zamknięty i przyjęty): `site/film/*`, `site/css/film.css`,
  `site/narzedzia/szablon-film.html`, `site/film/index.html`, `site/pl/film/index.html` oraz silnik
  `site/vendor/scrollcraft/` (bajt w bajt wg sum w `VERSION`). Moduły wspólne — `site/js/jezyk.js`,
  `konfigurator.js`, `wersja.js`, `site/tresc/{pl,en}.json`, `site/narzedzia/zbuduj.mjs`,
  `site/dane/fakty.json` — zmieniasz tylko addytywnie: testy Filmu zielone, a strony Filmu po pełnej
  budowie „bez zmian”. Moduły Filmu możesz importować, nie edytujesz ich (wspólny moduł do wyciągnięcia
  po wyborze kierunku — „świadomie odłożone”, nie teraz).
- **Pułap pierwszego wejścia ok. 10 MiB** (Aneks B pkt 4, jednostka z instrumentu README, L-0223). Stan
  po E4: 9,49 MiB, więc zapas wynosi ok. 0,5 MiB `SZACUNEK` na szuflady, zasłonę i plakaty. Przekroczenie
  = karta decyzji dla Łukasza, nie ciche podniesienie pułapu.
- **Wygląd i gust:** kierunek „Warsztat z wigorem”, D-61a / D-61b (zakazane: fioletowe gradienty i poświata,
  przesyt emoji, generyczne frazy, stocki; odrzucone na stałe: terminal, panel administracyjny, blueprint,
  plakat brutalistyczny). Pamięć gustu Łukasza: „realizm to detal, nie światło”, jakość po detalu
  i teksturach (Aneks C pkt 5, L-0226). Ocena wyglądu należy do Łukasza: pokazujesz kadr z obrysem,
  nie orzekasz sam.
- **Liczby na stronie tylko z repo** (komendy, wersje, adaptery); bez wymyślonych statystyk i liczników
  (PLAN 8). Makiety zawsze z podpisem „dane przykładowe”.
- **Granica zakresu:** GitHub Pages, adresy obu wersji, ankieta, deep link `claude-cli://` na żywo, wiersz
  w `FINGERPRINTS.md`, push i publikacja — **E8**. Bramki manualne „Próba linku `claude-cli://`”,
  „Adresy obu wersji i narzędzie ankiety”, „Włączenie GitHub Pages” zostają `OTWARTE` i nie są zakresem
  E6. Plików planu PANEL_CODEX (`docs/plany/PANEL_CODEX/*`, `docs/zasoby/PANEL_RELAI/makiety/`) i `.claude/`
  nie ruszasz i nie commitujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 i pluginy panelu wydane; strona nieopublikowana. Ostatni commit etapu to E7 (Film,
259 testów; rytuał E7 proponował commit `feat: film polish for phone, reduced motion and no-JS
(STRONA_RELAI E7)` na `e0c9f21`) — sprawdź `git log --oneline -3`. Jeśli zmiany E7 nadal leżą
w drzewie bez commita (`git status`: `site/film/*`, `site/css/film.css`, `site/narzedzia/szablon-film.html`,
`site/tresc/*.json`), nie cofasz ich i nie commitujesz razem z E6; sumy Filmu zapisujesz z drzewa
tak, jak jest. Biurko od E4 nie było ruszane (E5 i E7 nie dotykały jego plików).

```
site/narzedzia/szablon.html (136 w.)      # mapa a[data-cel], sekcje [data-przystanek] 0–6, form[data-konfigurator] na ekranie, template[data-slowa-sceny], przekładka
site/css/strona.css (325 w.)              # tokeny ROOT, tryb przepływu i .tryb-3d, ekran laptopa 1136 × 710, jedyne zapytania: max-width 860 px (chowa mapę) i no-preference (smooth)
site/biurko/kamera.js (+test)             # POZY: biurko, amnezja, cisza, porzadek, plan, panel, komendy, instalacja; KLUCZE; zbudujTor; poza(tor, p, pozy = POZY) — pozy podmienialne
site/biurko/scena.js (303 w.)             # renderer, kompozytor (AO, głębia), CSS3D ekranu, render tylko w ruchu, obniżanie jakości przy medianie > 26 ms; __biurko.diagnostyka(): plany, ekran, przyblizenie, medianaKlatkiMs, probki, dpr
site/biurko/warstwa.js (144 w.)           # okna widoczności tekstu, --scrim, mapa (aria-current), przybliżenie ekranu; przy ograniczonym ruchu tłumienie kamery wyłączone, przewijanie „auto”
site/biurko/swiat.js, start.js            # fonty; maWebGL2 → import('./swiat.js'); błąd albo utrata kontekstu → bezSceny() = tryb przepływu + komunikat [data-brak-sceny]; etap pierwszy zasobów, po dwóch klatkach etap drugi
site/biurko/obiekty.js, przedmioty.js, wyposazenie.js, tekstury.js, geometria.js, materialy.js, miasto.js, zasoby.js
                                          # karteczki(7), dokumenty(4), teczka, pudełko, laptop (ekranPanelu), kubek, książki, miasto; wszystko STOI NIERUCHOMO
site/biurko/przyblizenie.js (+test)       # czysta logika przybliżenia ekranu (E3)
site/dane/makiety.json, fakty.json        # makiety pasków (pl/en: opis, kolory, plan, paski), 15 komend
site/narzedzia/zbuduj.mjs (+test)         # cztery strony; `makiety` i `fiszki` dostaje dziś tylko Film (filmExtras), Biurko nie
site/zasoby/ (64 pliki), ZRODLA.json      # modele i tekstury CC0; zasoby.test.mjs odrzuca plik bez wpisu, inną licencję niż CC0 i obcy host
site/grafika/, site/fonty/                # logo, 15 ikon, 10 WOFF2
docs/zasoby/STRONA/builds/biurko/         # BRIEF.md, referencje/ (01–08 + ANALIZA.md), kalibracja/ (e2-*, porownanie-*, hero-*)
docs/zasoby/STRONA/lab/film/              # arkusze czterech przebiegów Filmu z E7 — wzór harnessu zrzutów
```

**Czego jeszcze nie ma (to jest zakres tego etapu):**

- animacji szczytu (karteczki i dokumenty stoją, tor ma tylko postój), `szczyt.js`;
- szuflad i ich treści (brak `szuflady.js`, brak klikania obiektów, brak klucza treści), makiet na przystankach „Panel” i w szufladzie laptopa;
- dopracowanych przystanków 2–7 (teczka, laptop z panelem, pudełko z fiszkami bez docelowego detalu);
- kontekstu `makiety` i `fiszki` w generatorze Biurka;
- jakiejkolwiek kompozycji na telefon (jeden zestaw póz `POZY`, tylko zapytanie `max-width: 860px`),
  ekranu ładowania Biurka (Film ma, Biurko nie), plakatu (bez WebGL strona pokazuje tylko komunikat
  tekstowy), pomiaru na słabej grafice (E4: tylko RTX 4070 Ti), testu treści bez JS dla Biurka,
  pasów zrzutów Biurka w czterech przebiegach.

**Pomiary wyjściowe (FAKT, dziennik E4/E5/E7):** Biurko 9,49 MiB po kompresji; CPU ×4 mediana 11,3 ms,
p95 17,5 ms, najwięcej 910 wywołań rysowania na klatkę; scena 3D po ok. 11,8 s na Fast 4G z CPU ×4
(Aneks D); 259/259 testów (uruchomione przez autora promptu 2026-10-17, oba wzorce plików).
`kalibracja/hero-pl-1366.jpeg` pochodzi z E1 (hero z geometrii proceduralnej), **nie jest wzorcem
„hero nietknięte”** — wzorzec robisz na starcie z bieżącego drzewa (pkt 1).

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (forma `node --test site/` nie działa, L-0212);
budowa `node site/narzedzia/fakty.mjs`, `node site/narzedzia/makiety.mjs`, `node site/narzedzia/zbuduj.mjs`
(drugi przebieg ma wypisać „bez zmian”). Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (port bywa zajęty — `curl` na 4520 i 4530, korzystasz z działającego); Biurko pod `/` i `/pl/`.
Kadry o stałym rozmiarze w osobnej stronie Chrome DevTools z `emulate viewport` (`1366x768x1`, telefon
`390x844x3,mobile,touch`); kartę najpierw `bringToFront` i liczba `requestAnimationFrame` na sekundę
(L-0214, L-0222); przewijanie w pomiarach `scrollTo({ top, behavior: 'instant' })`, bo strona w trybie
przepływu ma `scroll-behavior: smooth`; EN wymaga `localStorage['relai-jezyk'] = 'en'` w `initScript`
(przeglądarka po polsku przekierowuje na `/pl/`), a sonda `initScript` sprawdza istnienie dokumentu
i pisze do `sessionStorage` (L-0232). Cztery przebiegi zrzutów robisz **bez instalowania paczek**: surowy
protokół DevTools do headless Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`, globalny
`WebSocket` w Node 24), skrypt w katalogu roboczym; `playwright-core` dopiero po karcie zgody (paczka,
wersja, rozmiar, źródło npm; w E7 odpowiedź brzmiała „Bez instalacji”). Widok bez skryptów: pobierz HTML,
wytnij znaczniki `<script>`, otwórz jako blob z `<base href>`. Zasłonę mierzysz ze śladu wydajności
z `ignoreCache` (zdarzenia Screenshot co ok. 100 ms), Fast 4G i CPU ×4. Ścieżki w powłoce z `/` (L-0230);
tekst z backslashem i backtickiem tylko narzędziem Write/Edit, nigdy `sed -i`, `cat >>` ani `node -e`
(L-0116, L-0198, L-0234: `sed '/x/d'` kasuje każdy pasujący wiersz). W drzewie leżą cudze zmiany PANEL_CODEX
i `.claude/launch.json` — nie ruszasz ich.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-17):**

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma ścieżkę „pytam zamiast zmyślać"
   z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie dokumentów** — „stare
   brzmienie nie zwraca nic" puszczasz na katalogu specyfikacji; trafienie poza zakresem etapu to
   sygnał odchylenia, nie usterka weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej
   pisania** — rozjazd to defekt reguły, nie wyjątek do obejścia. **Reguła produkująca tekst opisuje
   początek wiersza i to, czego w nim nie ma** — model domyka lukę formatem materiału pod ręką;
   materiał sprzed poprawki reguły zostaje obok materiału po niej.
   **Linia raportu poświadczająca krok bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia. **Komenda
   w sekcji Weryfikacja ma za sobą jeden realny przebieg autora promptu** (testy Node wzorcem
   plików, nie katalogiem) (L-0212).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem** — stanem pliku, sumą, treścią odpowiedzi; kryterium na
   stanie, który kontrolujesz, i na źródle, które artefakt produkuje. Zmianę zachowania pokazujesz
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu, na materiale, który stara
   wersja psuje (L-0191).
   - **Kryterium:** na poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz;
     sprawdzone na materiale **przed** pracą (także przez autora promptu) — arytmetycznie
     nieosiągalne wraca do człowieka jako aneks. Etap przenoszący treść liczy metrykę na całym
     pakiecie. Liczenie wywołań narzędzia zaczynasz od listy narzędzi w `init`. Wyszukiwanie
     wzorca omija pliki, które go cytują. Tekst tłumaczący liczbę ma warunek prawdziwości i test
     stanu docelowego (L-0144).
   - **Materiał:** test na realnym pliku zmienianym przez proces sam ustawia stan wyjściowy,
     licznik do dziennika z przebiegu po ostatniej zmianie (L-0150); plik śledzony albo własna
     fixtura, nigdy z `.gitignore` (L-0156); przed pytaniem o zasięg sprawdzasz, czy plik nie jest
     generowany (L-0154); zmianę dowodzisz na widoku, który obejmuje jej rekordy (L-0155); test
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186); element
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195).
   - **Na żywo:** widok z danych projektu mierzysz w najgorszym stanie i ograniczasz w kodzie
     (L-0158); diagnoza zaczyna się od znacznika wersji w logu (L-0159); „przed” w dwóch
     przebiegach — stary kod i stary kod z nową czystą logiką (L-0165); animacja z danych procesu
     na stanie pośrednim z lukami (L-0175); chwila z przeszłości liczona kodem z jej commitu (L-0177);
     artefakt weryfikacji renderowany od nowa, wszystkie warianty razem (L-0182); parser pola
     opisanego prozą — na każdym zapisie rodziny i przykładzie specyfikacji, stary i nowy kod
     obok siebie (L-0184); po zmianie kodu z trybem zastępczym pierwsza asercja to tryb, potem
     zrzut (L-0213); ruch i czas klatki tylko w widocznej stronie, kadry o stałym rozmiarze
     w osobnej stronie DevTools (L-0214); po zmianie modułu ES `reload` z `ignoreCache` i asercja
     nowego kodu przed kadrem (L-0218); przed diagnozą ruchu liczba `requestAnimationFrame` na
     sekundę — poniżej 30 najpierw `bringToFront`, schowek systemu tylko w prawdziwym Chrome
     (L-0222); kod przewijający sam zapisuje cel w stanie odbiornika przed `scrollTo` (L-0224);
     koszt pierwszej wizyty z solą w definicjach shadera, kompilacja i pierwsze rysowanie osobno,
     licznikiem przerw głównego wątku — przeładowanie mierzy ciepłą pamięć (L-0227); sonda
     `initScript` sprawdza istnienie dokumentu i pisze do `sessionStorage` (L-0232).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215); ścieżka w powłoce z `/`, także składana ze zmiennych
     w funkcji (L-0230);
     tekst zastępczy `replace` nie jest dosłowny (`` $` ``, `$&`) — cudzą treść podstawiasz funkcją,
     po wstawce porównanie ze źródłem i licznik nagłówków całego pliku (L-0211);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
   - **Kontrola pozytywna:** zero trafień przy niepustych zbiorach to defekt instrumentu do czasu
     dowodu, a trafienie na materiale dotąd zdrowym sprawdzasz najpierw na instrumencie; scenariusz
     „konfiguracji nie ma” mierzysz z podstawionym katalogiem domowym; dokładasz przypadek, który **musi** trafić, na **tym samym wejściu**, którego mechanizm
     naprawdę pilnuje (nie z jego listy wyłączeń); przebieg „oczekuję ciszy" ważny tylko z kontrolą
     pozytywną w tym samym przebiegu; obok wzorca licznik „ile odrzucono” i „ile bez pary”;
     generator identyfikatorów sprawdzasz na wszystkich kandydatach; wartość podkładaną — wobec
     zbioru dozwolonego (L-0173); kontrola negatywna zmienia mierzoną wielkość, nie jej obraz (L-0181);
     tło pod tekstem fotografujesz z `opacity: 0` na rodzicu (`visibility` dzieci wygrywa), wynik
     1,00 : 1 na całej linii to najpierw instrument (L-0213).
   - **Parsowanie:** separator niepoprzedzony znakiem ucieczki i liczba pól po podmianie; zbiór
     znaków zachowywanych wypisany raz; filtr „to nie przypadek” ma wyjątek dla linii o rzeczy
     sprawdzanej; każdy przypadek graniczny ma własną kontrolę; nazwy narzędzi w cudzym
     transkrypcie wypisujesz, zanim orzekniesz brak.
   - **Porównania:** instrument dwóch drzew odtwarza materiał przed każdym wariantem i dowodzi
     nietkniętości; wynik wynosisz od razu, z sumą; porównanie najpierw sprawdza istnienie obu
     wejść, a oba pliki kasuje przed przebiegiem (L-0143); stan „przed” w `git worktree` HEAD-a, nie
     po `stash` (L-0151); bez `append` — plik na proces (L-0141).
   - **Cudze usługi i dane:** niedostępność sprawdzasz jednym tanim wywołaniem, zanim odpiszesz
     pomiar; „działało wczoraj” też jest hipotezą; wniosek z czasu zepsutego artefaktu datujesz jego
     wersją; wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
     „sprawdzone inaczej”.
   - **Liczenie treści:** dwa liczniki — wąski (własny wzorzec, przez wykluczenie znaku
     otwierającego) i szeroki z kontrolą przeciw zawyżeniu; najpierw kształt odpowiedzi, potem
     jakość, z mianownikiem; różnica przebiegów tylko ponad zmierzony szum; agregat odsiewa elementy
     innej klasy jawnym progiem; czytelność klatek — tylko klatki ustalone, oba kontrasty, korpus =
     materiał źródłowy.
   - **Przebieg:** scenariusz „czegoś nie ma” z listą mechanizmów, które to tworzą (inaczej
     fixtura); limit tur na cały łańcuch i kod wyjścia każdej sesji; podłożony hook — `node --check`
     i licznik wstrzykniętego zdania (L-0127); nowa kontrola spójności najpierw na zastanym
     materiale, cisza podejrzana do pokazu na podłożonym defekcie; po historii commitów trafienia
     dzielisz na „naprawione później” i „nigdy” (L-0131); skrypt cięcia sprawdza cały blok i idzie
     kompilator (L-0160); wklejka dowodzona licznikiem nagłówków i porównaniem ze źródłem (L-0164);
     operacja na zakresie normalizuje tylko styk, reszta nietknięta (L-0169); fixtura ewaluacji
     niesie środowisko czytane przez hooki (L-0170).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215)
6. **Próg jest liczbą, którą ktoś liczy:** kalibrujesz na realnych plikach, zapisujesz w jednostce
   mechanizmu z komendą sprawdzającą, z **jednym** wyzwalaczem. Porównujesz do wielkości, którą
   mechanizm kontroluje (część usuwalna); zatkanie sygnalizuje **różnica możliwego i wykonanego**,
   nie zero wykonanego; reguła „najstarszy element” w mechanizmie od najstarszego zatyka go
   z definicji. Liczba zbioru liczona także w komunikacie sukcesu. Odejmowana stała to hipoteza —
   nierzetelne odjęcie oznaczasz. Próg wspólny sprawdzasz na każdej wielkości z osobna (L-0167).
   Karta zgody na zależność podaje wielkość na dysku (L-0172). Liczba budżetu niesie jednostkę
   zdefiniowaną w instrumencie, a różnicę wobec poprzedniego etapu liczysz tym samym instrumentem na
   drzewie poprzedniego commitu (L-0223).
   (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172, L-0223)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** od początku komórki, wybór
   linii po wartości, nierozpoznane = cisza. Rdzeń z diakrytykami łapiesz klasą znaków języka, nie
   `\w`, i tylko w brzmieniu wartości, nie w całej komórce. Koszt zamkniętej listy (pozycje, które
   człowiekowi wyglądają na rozpoznane) mierzysz; poszerzenie to decyzja człowieka.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** (`CLAUDE.md`
   albo hook); skill wyzwala się zawodnie. Sygnał jednorazowy ma jednego właściciela. Stan pisany
   przez model: plik na zapisującego, bez scalania. Zapis w warstwie niższej niż plik tej sesji
   kasuje ten plik i mówi, która warstwa rozstrzyga po zapisie (L-0187). Fakt rozstrzygnięty idzie
   do subagenta jako rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik
   doczytywany dla klasy `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy
   frazie z promptu; krok wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128, L-0187)
9. **Skill nie zakłada dostępu poza katalogiem roboczym**; opis ≤ 1 024 znaki, trzecia osoba, co
   i kiedy, marker projektu i płaska lista fraz, bez `MUST BE USED`; krok sięgający dalej ma
   wyjście po odmowie. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; zachowanie — świeżą
    sesją; po podbiciu `grep -r` po starym numerze i każde trafienie rozstrzygasz (historyczne vs
    deklaracja stanu, także w komendach i skillach). Niewydane mierzysz artefaktem podłożonym
    lokalnie pod **inną nazwą**; cały plugin — `--plugin-dir` z wyłączoną instalacją i ścieżką
    w `init`. Wydanie zestawia zmiany artefaktów z `ARTEFAKTY.md` i `git ls-files` z listą
    generowanych (L-0161). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący nie-sekret to defekt rdzenia** — poprawka z dowodem, nie obejście;
    wołany przez opakowanie powłoki (brak interpretera = blokada); próbki sekretów składane
    w czasie wykonania; cudzysłów (także backtick) należy do grupy cudzysłowu, nie do wartości.
    (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload po
    zdjęciu BOM, bez założeń o nazwach pól; CLI z powłoki natywnej; brak sygnału konfrontujesz
    z warunkiem milczenia; nieprzyjęty artefakt — najpierw jego walidator albo widok statusu.
    - **Mody:** zielone `validate`, typy i testy nie dowodzą zachowania w łańcuchu — mierzysz na
      żywo, ciszę sondą (licznik hooka, wynik `next`) (P-017); `$` i `on` tylko w pliku modułu
      hooków, na zewnątrz czysta logika; typy mówią, co powierzchnia przyjmie, nie co niesie —
      gałąź po polu powierzchni z wejścia, test na obecność odpowiednika; każde drzewo przez
      `plugin test` z montażem i kliknięciem przed pokazem na żywo; korzeń projektu w górę od
      zmiennego cwd, test w podfolderze (L-0146).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu. Pytanie kalibracyjne nazywa kadr i obszar oceny, a zmianę pokazuje
    z obrysem w otwartym oknie (L-0229). Makieta istniejącego interfejsu zaczyna się od zrzutu
    jego aktualnej wersji (L-0231).
    - **Układ:** kompozycja z tekstem w warstwie, która liczy układ (HTML `grid`/`flex`, `overflow`),
      ręczne współrzędne tylko dla dekoracji; dziecko poza kontenerem blokuje, a instrument
      prostokątów ma kontrolę na podłożonym przepełnieniu; rysunek do człowieka po renderze
      w Chromium z pomiarem (L-0142); kryterium w warunkach odbiorcy (szerokość, wysokość glifów);
      uwaga „za niski / krzywo” najpierw pomiarem zrzutu, równe piksele przy powtórzonej uwadze to
      kontrast — pomiar i wybór zamiast kolejnej rundy (L-0196); tekst ucinany w modzie stoi
      w pudełku o bazie zerowej (`width={0}` + `flexGrow`), próba wyglądu startuje na
      najdłuższych realnych danych (L-0197).
    - **Nośnik:** na ograniczonym zestawie elementów sonda ustala pułap przed projektem, warianty
      w tym samym nośniku, różne już w stanie domyślnym (L-0197), ograniczenie mówione wprost;
      animacja znaczy trwającą czynność i ma źródło w sygnale narzędzia, wskaźnik postępu rośnie
      od lewej (L-0199); nowy element zbioru różnisz kształtem,
      porównanie na całym zbiorze w skali docelowej; plan z interfejsem wskazuje źródło motywu
      w pierwszym etapie, który rysuje więcej niż linię. Ostrzeżenie `plugin validate` o root
      `CLAUDE.md` jest skutkiem dogfoodingu — nie naprawiasz. Z zaakceptowanego wariantu
      przenosisz kształt, nie same barwy, i porównujesz wynik z jego zrzutem (L-0200); walidator,
      `plugin test` z montażem i zrzut to trzy osobne dowody, `Svg` zawsze z `alt` (L-0201);
      mechanizm mnożący drzewo — najpierw test budżetu na najgorszych danych (L-0202); przejście
      po drzewie testujesz na węźle w kształcie silnika, nie z ręki (L-0204, P-045); poprawka
      zielona w teście, a martwa na żywo — najpierw diagnostyka z działającego modu (L-0205);
      zrzut przez `PrintWindow` z `SetProcessDPIAware` (L-0206); element chwilowy (dymek,
      najechanie) nie zmienia geometrii spoczynku — test wysokości spoczynku obok testu nowego
      zachowania, pełne słowa w natywnym `<title>` (L-0209). Wygląd
      panelu i pasków: `docs/zasoby/PANEL_RELAI/DESIGN.md` przed każdą zmianą.
    - **Liczby i słowa:** procenty i kwoty z dwoma miejscami (L-0145); etykieta stanu słowem
      i znakiem, „x/y” tylko gdy y jest celem (L-0147); słowo o przeszłości ma warunek prawdziwości
      i test (L-0149); komórka liczby `flexShrink={0}` (L-0152); karta decyzji w całości tylko dla
      pozycji, które zmienia (L-0157); adnotacja mówi wartość wyliczoną (L-0176).
    - **Film:** element trwały po ruchu kamery bez 3D i filtra, przegląd klatki największego
      zbliżenia (L-0171); przejście przez wspólne tło, krój rozróżniający „1” i „I” (L-0174);
      „tego nie pokazujemy” szukasz we wszystkich tekstach kadru (L-0178); dźwięk z gotowych źródeł,
      próbki do wyboru (L-0179); licencję czytasz na stronie utworu, plik z kartą źródła i testem
      (L-0180); drugi język zaczyna się od jednej klatki i pytania, dla kogo (L-0183).
    - **Scena 3D:** kandydaci zasobów na karcie zgody po miniaturach obok wzorca, cecha wzorca
      widoczna już na miniaturze (L-0216); obiekt za płaszczyzną sprawdzasz kadrem, w którym jest
      największy, i wobec `near`/`far` kamery (L-0217); powtarzalne bryły jako jedna geometria,
      wywołania rysowania mierzone opakowaniem kontekstu (L-0219); uwaga „nie jak wzorzec” — rozbiór
      kadru na światło, materiał, obiektyw i kompozycję z jedną przyczyną i granicą techniki przed
      kolejną rundą (L-0220); urządzenie w scenie budujesz warstwami prawdziwej konstrukcji i przed
      pierwszym zrzutem oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca — nic nie wystaje
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221); cudzy
      generator sceny sprawdzasz pudełkami wypieczonej geometrii obok `Box3.setFromObject` i klasą
      referencyjną biblioteki (L-0225); dystans do wzorca najpierw detal, tekstury i kompozycja,
      technika światła na końcu, a hipotezę „X zrobi różnicę” — tanim testem na jednym kadrze
      z werdyktem człowieka przed etapem (L-0226).
    - **Strona przewijana:** ruch wiązany z każdym ruchem kółka odbierasz człowiekowi jako lekturę.
      Najpierw proponujesz jedną animację na sekcję z resetem poza ekranem (L-0233). Tryb ograniczonego
      ruchu i brak skryptu sprawdzasz wysokością sekcji i tym, co jest za krawędzią, a nie tylko
      widocznością (L-0235). Stan sprzed animacji nie przyciemnia tekstu przezroczystością, bo
      kontrast mierzysz także na pierwszej klatce (L-0236).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226, L-0233, L-0235, L-0236)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E6/`.** Wszystko tymczasowe —
> sumy kontrolne, skrypty pomiarowe i harnessu zrzutów, kadry robocze, strony porównań, ślady
> wydajności — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog
> domowy, profil headless Chrome, worktree HEAD-a do pomiaru „przed”), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: ocena, wygląd, choreografia, kompozycja przystanków i rozmowa z Łukaszem — Ty (Opus).
Do trzech subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie punkty 5 i 8
— deterministyczne, sprawdzane przez Ciebie przed przyjęciem (kontrola pozytywna: zepsuj wejście
i zobacz, że test pada). Kolejność daje wcześnie widoczny efekt: przegląd → szczyt → przystanki 2–7
→ szuflady → telefon, ograniczony ruch, plakat i zasłona → pomiary. Całość to ok. 3–5 sesji roboczych
`SZACUNEK` (sekcja 6 planu: 2–3, Aneks D pkt 4: +1–2).

1. **Start, przegląd i lista uwag przed kodem** — (a) w katalogu roboczym zapisz sumy `sha256sum` plików
   Filmu i silnika (lista z „Decyzji”: `site/film/*`, `site/css/film.css`, `site/narzedzia/szablon-film.html`,
   `site/film/index.html`, `site/pl/film/index.html`, `site/vendor/scrollcraft/*`) **przed pierwszą zmianą**;
   (b) zrób kadry wzorcowe hero z bieżącego drzewa (PL 1366 × 768 i 390 × 844) — to jest „hero
   nietknięte”; (c) zmierz stan wyjściowy instrumentem z `site/README.md` na drzewie HEAD (worktree,
   L-0223): MiB po kompresji, CPU ×4 mediana i p95; (d) przewiń całe Biurko PL w 1366 × 768 i w 390 × 844
   i zrób kadry każdego przystanku w trzech położeniach (wejście, postój, wyjście) obok wzorców
   `referencje/02`–`06`. Z tego lista usterek i propozycji per przystanek, każda z kadrem i obrysem
   miejsca (strona w katalogu roboczym). Listę i **trzy pytania** pokazujesz Łukaszowi w otwartym oknie
   **przed** pierwszą poprawką (tak jak w E7), pytania narzędziem AskUserQuestion, rekomendacja pierwsza:
   - **Pytanie 1 — ruch szczytu.** Opcja A (Rekomendowane, zasada z L-0233): jedna animacja czasowa
     karteczek uruchamiana wejściem kamery w postój szczytu, przytrzymanie przewijania w dół do jej końca,
     reset po zejściu z przystanku (jak w Filmie, ale dla sceny 3D). Opcja B: pozycja karteczek jest
     czystą funkcją postępu przewijania, w pełni odwracalna (jak w briefie Biurka i PLAN 5).
   - **Pytanie 2 — co widzi odwiedzający bez żywej sceny** (ograniczony ruch i brak WebGL; PLAN 8):
     Opcja A (Rekomendowane, zgodnie z PLAN 8): tryb przepływu z jednym plakatem (render hero z samej
     sceny, JPEG, wersja pozioma i pionowa) i pełną treścią w HTML. Opcja B: przy ograniczonym ruchu zostaje
     żywa scena z cięciami między pozami, plakat tylko bez WebGL. Przy A potwierdzasz też, że „finalne
     ujęcie” z PLAN 8 to ujęcie hero.
   - **Pytanie 3 — telefon.** Opcja A (Rekomendowane): scena 3D z osobnymi pozami pionowymi, zasłoną
     i kartą „Wyślij sobie link” jak w Filmie (instalacji nie da się zrobić z telefonu). Opcja B: telefon
     dostaje tryb przepływu z plakatem, bez sceny (oszczędza ok. 9 MiB `SZACUNEK`). Do pytania dołączasz
     pomiar zimnego wejścia z pkt 7d, jeśli już go masz.
2. **Szczyt „bałagan → porządek”** — `site/biurko/szczyt.js` (nowy), klucze toru i, gdy wariant tego
   wymaga, `site/biurko/kamera.js`, podpięcie w `site/biurko/scena.js`, tekst „Porządek” w
   `site/biurko/warstwa.js`. Siedem karteczek odrywa się od blatu i układa w cztery dokumenty; stan
   liczony **czystą funkcją** (wejście → pozycje i obroty), więc ta sama sytuacja daje ten sam kadr.
   Wariant A: czas animacji i przytrzymanie przewijania w module Biurka (nie importujesz
   `film/akty.js` i go nie edytujesz); wariant B: funkcja postępu, odwracalna w obu kierunkach. Cisza
   przed szczytem zostaje, szczyt jest najdłuższym odcinkiem (test), tekst „Porządek” wchodzi dopiero po
   ułożeniu i nie dostaje przezroczystości jako stanu przed animacją (L-0236). Testy
   `site/biurko/szczyt.test.mjs`: początek = bałagan, koniec = cztery dokumenty, monotoniczność,
   determinizm. Kalibracja z Łukaszem na pasie kadrów (cisza, start, środek, koniec), po jednej
   rundzie na zmianę, kadr „przed i po” z obrysem (L-0229).
3. **Przystanki 2–7 na gotowo, jeden po jednym** — `site/biurko/obiekty.js`, `przedmioty.js`,
   `wyposazenie.js`, `tekstury.js`, `scena.js`, pozy w `kamera.js`: teczka planu z etykietą i etapami,
   laptop z ekranem panelu (na przystanku „Panel” makieta pasków z `makiety.json`; na „Instalacji”
   konfigurator jak dziś), pudełko z fiszkami, dokumenty. Wzorce: `referencje/04`, `05`, `06`. Najpierw
   detal i tekstura, światło na końcu (L-0226); każdy przystanek z werdyktem Łukasza na kadrze „przed
   i po” z obrysem, zanim ruszy następny (L-0229). Poza `biurko` i kadr hero bez zmian; test
   `kamera.test.mjs` pilnuje, że `POZY.biurko` ma wartości sprzed etapu.
4. **Szuflady po kliknięciu** — `site/biurko/szuflady.js` (nowy), cztery `<dialog>` (albo `role="dialog"`
   z `aria-modal`) w `site/narzedzia/szablon.html`, treść w `site/tresc/pl.json` i `en.json` pod nowym
   kluczem `szuflady`, wygląd w `site/css/strona.css`. Otwiera je klik w obiekt sceny (raycaster) **i**
   przycisk osiągalny klawiaturą; obiekt unosi się do kamery; Esc i przycisk zamykają; fokus wraca do
   elementu, który otworzył; `scrollY` po zamknięciu bez zmian; przy ograniczonym ruchu bez animacji.
   Zawartość: dokumenty (cztery pliki pamięci), teczka (plan z etapami), laptop (panel z zakładkami
   z makiet, podpis „dane przykładowe”), pudełko (15 fiszek z `fakty.json`). Treść szuflad jest w HTML od
   początku i czytelna bez WebGL i bez JS; do DOM trafia przez `textContent` albo generator z ucieczką.
5. **Generator: makiety i fiszki dla Biurka** — `site/narzedzia/zbuduj.mjs` i `zbuduj.test.mjs`:
   kontekst Biurka dostaje `makiety` i `fiszki` tak jak Film (funkcja `zbudujFiszki`, bez drugiego źródła
   treści); zmiana addytywna, strony Filmu po budowie „bez zmian”; `site/index.html` i `site/pl/index.html`
   generowane od nowa. *(subagent; treść JSON piszesz sam)*
6. **Mapa i nawigacja** — `site/narzedzia/szablon.html`, `site/biurko/warstwa.js`, `site/css/strona.css`:
   siedem przystanków i cztery szuflady osiągalne z mapy (klik i klawiatura), `aria-current` na
   przystanku, wygląd spójny z hero.
7. **Dopieszczenie Biurka (Aneks D pkt 2)**:
   - **a. Telefon (≤ 600 px)** — `site/biurko/kamera.js` (drugi zestaw póz pionowych przekazany do
     `poza(tor, p, pozy)`, która już przyjmuje `pozy`; wybór po proporcjach okna w `warstwa.js`),
     `site/css/strona.css` (blok `@media (max-width: 600px)`; dziś jest tylko 860 px), układ tekstu
     przystanków i szuflad na wąskim ekranie. Pierwszy ekran 390 × 844: nagłówek, jedno zdanie
     i przycisk w kadrze (cel 1 planu). Zamiast konfiguratora na ekranie laptopa karta „Wyślij sobie link”
     i „Kopiuj komendy” — najpierw sprawdź, czy `film/telefon.js` da się zaimportować bez zmiany
     pliku i z kluczami `film.instalacja.telefon.*` (bez ich zmiany); jeśli nie, własny moduł
     `site/biurko/telefon.js` z testem, a duplikat do „świadomie odłożonego”. Hero telefonu z werdyktem
     Łukasza → `docs/zasoby/STRONA/builds/biurko/kalibracja/hero-pl-390.jpeg`. Warunek: pytanie 3.
   - **b. Ograniczony ruch** — `site/biurko/swiat.js`, `warstwa.js`, `szuflady.js`, `strona.css`: zgodnie
     z pytaniem 2; szczyt w stanie końcowym, szuflady bez animacji, znaczenie zostaje (PLAN 8).
     Sprawdzasz wysokość sekcji i treść za krawędzią, nie samą widoczność (L-0235).
   - **c. Plakat bez WebGL** — render hero z samej sceny (skrypt w katalogu roboczym, protokół DevTools)
     zapisany jako JPEG w `site/grafika/plakat/` (poziomy 1366 × 768 i pionowy 390 × 844; **nie** w
     `site/zasoby/`, bo `zasoby.test.mjs` przyjmuje tam wyłącznie zasoby CC0 z wpisem w `ZRODLA.json`).
     Wstawiany w `bezSceny()` w `site/biurko/start.js` i w `<noscript>` w szablonie, z `alt` po polsku
     i angielsku; w trybie 3D plakat **nie jest pobierany** (sprawdzasz listą żądań). Budżet plakatów
     ≤ 0,2 MiB razem `SZACUNEK`. Sposób odtworzenia plakatu opisany w `site/README.md`.
   - **d. Ekran ładowania Biurka** — `site/biurko/zaslona.js` (nowy, z testem) i style w `strona.css`
     (Filmu nie edytujesz): zasłona od pierwszej klatki, kreska postępu po etapach zasobów, zdjęcie
     dopiero po dwóch klatkach z gotowym hero; awaryjne zejście przy błędzie. Pomiar zimnego wejścia
     na telefonie (390 × 844, Fast 4G, CPU ×4, `ignoreCache`, klatki co ok. 100 ms). Jeśli etap drugi
     zasobów zmienia widoczny kadr po zdjęciu zasłony, zasłona czeka na oba etapy albo etap drugi
     dociąga się po opuszczeniu hero — rozstrzygasz liczbami i pokazujesz Łukaszowi.
   - **e. Słaba grafika (T1)** — pomiar mediany i p95 klatki na grafice programowej: headless Chrome
     z `--use-angle=swiftshader --enable-unsafe-swiftshader` (osobny profil w `%TEMP%`, nazwa od `relai-`)
     w 1366 × 768 i 390 × 844; wynik po każdym kroku obniżania jakości (głębia, cienie, rozdzielczość).
     Gdy mediana po wszystkich krokach nadal > 26 ms — karta decyzji dla Łukasza (wyłącznik sceny dla
     słabej grafiki z plakatem albo akceptacja), nie ciche pominięcie. Gdy SwiftShader nie startuje —
     punkt zostaje jako bramka manualna „pomiar na słabszym laptopie” z warunkiem wykonalności.
8. **Testy** — `site/biurko/kamera.test.mjs` (nowe klucze, szczyt najdłuższy, `POZY.biurko` bez zmian,
   pozy pionowe), `szczyt.test.mjs`, `szuflady` (czysta logika stanów i powrotu fokusu),
   `zaslona.test.mjs`, `site/biurko/bezjs.test.mjs` (treść Biurka w HTML bez JS dla PL i EN: `h1`,
   siedem sekcji, 15 fiszek, cztery szuflady z treścią, komenda instalacji, formularz; kontrola
   pozytywna: szablon bez jednej fiszki wywraca test), `zbuduj.test.mjs`. *(subagent)*
9. **Pasy zrzutów i kontrola odczuć** — cztery przebiegi (desktop, telefon, ograniczony ruch, bez WebGL;
   dodatkowo wersja bez JS z pkt wyżej), PL, po sześć kadrów na przystanek przez surowy protokół DevTools
   (wzór: harness z E7), arkusze `*-sheet.jpeg` w `docs/zasoby/STRONA/lab/biurko/`. Potem kontrola odczuć
   z `feel.md` §6 na krzywej z briefu Biurka: przystanek → odczucie zamierzone → odczucie z kadru.
   Rozjazd tylko z werdyktem Łukasza.
10. **Treść PL i EN** — `site/tresc/pl.json`, `en.json`: klucz `szuflady`, podpisy makiet, etykiety
    dialogów, `alt` plakatów; bez myślnika w widocznym tekście i bez słów-wypełniaczy; EN dalej do
    przeglądu native speakera (sekcja 9 planu).
11. **`site/README.md`** — szczyt, szuflady, plakat (jak odtworzyć), telefon, ograniczony ruch, zasłona
    Biurka, pomiar na grafice programowej, przebiegi zrzutów; tylko to, co zmienił ten etap.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_6.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 259 (E7, `FAKT`) plus nowe;
      kontrola pozytywna: szablon Biurka bez jednej fiszki wywraca test treści bez JS, a usunięcie
      klucza szczytu z toru wywraca test „szczyt najdłuższy”.
- [x] Silnik bez zmian: `sha256sum site/vendor/scrollcraft/scrollcraft.js scrollcraft.css LICENSE` równe
      wpisom w `site/vendor/scrollcraft/VERSION`.
- [x] **Film nietknięty (dowód negatywny):** sumy `sha256sum` plików z pkt 1a, zapisane **na starcie**
      i porównane na końcu **po pełnej budowie** (`fakty.mjs`, `makiety.mjs`, `zbuduj.mjs` dwukrotnie):
      zero różnic, `zbuduj.mjs` wypisuje „bez zmian” dla `site/film/index.html` i `site/pl/film/index.html`;
      kontrola pozytywna: `site/css/film.css` z dopisaną spacją daje dokładnie jedną różnicę, po
      przywróceniu zero i czysty `git diff` tego pliku względem stanu z początku. Testy Filmu
      (`site/film/*.test.mjs`) zielone w tym samym przebiegu.
- [ ] Moduły wspólne zmienione tylko addytywnie: `git diff --stat` na `site/js/`, `site/tresc/*.json`,
      `site/narzedzia/zbuduj.mjs`, `site/dane/fakty.json` wypisany we wpisie z uzasadnieniem każdej
      zmiany; klucze `film.*` w `site/tresc/*.json` identyczne z początkiem etapu (porównanie obiektu
      `film` sprzed i po, kontrola pozytywna na zmienionym jednym znaku).
- [x] Budowa deterministyczna: `fakty.mjs`, `makiety.mjs`, `zbuduj.mjs` uruchomione dwukrotnie — drugi
      przebieg „bez zmian”, identyczne sumy `site/index.html` i `site/pl/index.html`; zero niewypełnionych
      `{{` i `}}`; 15 fiszek w obu językach Biurka.
- [ ] Lista uwag z pkt 1 i trzy pytania pokazane Łukaszowi w otwartym oknie przed pierwszą poprawką; jego
      wybór (pytania 1–3) zacytowany we wpisie.
- [x] **Szczyt odwracalny albo deterministyczny** (zależnie od wariantu z pytania 1): `__biurko.diagnostyka()`
      (rozszerzona o pozycje karteczek) w trzech punktach szczytu (początek, środek, koniec) daje przy
      zejściu w dół i powrocie w górę różnicę ≤ 0,001 jednostki sceny dla każdej z siedmiu (wariant B)
      albo ten sam stan końcowy po resecie i ponownym wejściu (wariant A); test w `szczyt.test.mjs` pokrywa to samo.
- [x] Szczyt na zrzutach: pas kadrów (cisza, start, środek, koniec) przy 1366 × 768; tekst „Porządek” ma
      przezroczystość 0 w trakcie przelotu i 1 po ułożeniu (odczyt stylu w trzech punktach), a kontrast
      zmierzony także na pierwszej klatce (L-0236).
- [x] **Hero nietknięte (dowód negatywny):** kadr hero PL 1366 × 768 po etapie obok kadru wzorcowego
      z pkt 1b — średnia różnica pikseli w sumie wpisu, kontrola pozytywna: kadr z przesuniętą kamerą daje
      różnicę ponad zmierzony szum; każda widoczna zmiana pokazana Łukaszowi; `POZY.biurko` równe wartości
      z `git show HEAD:site/biurko/kamera.js`.
- [x] Szuflady: każda z czterech otwiera się klikiem w obiekt sceny i z klawiatury (Tab, Enter), Esc zamyka,
      `document.activeElement` po zamknięciu = element otwierający, `scrollY` przed i po identyczne;
      pudełko pokazuje 15 fiszek = 15 komend w `fakty.json`; przy ograniczonym ruchu otwarcie bez animacji.
- [x] Każdy z siedmiu przystanków osiągalny przewijaniem i z mapy (klik i klawiatura); kontrast tekstu
      przystanków 2–7 na złożonym kadrze: treść ≥ 4,5 : 1, nagłówek ≥ 3 : 1, z kontrolą pozytywną na
      jasnym obiekcie i z `opacity: 0` na rodzicu przy fotografowaniu tła (L-0213).
- [x] Telefon 390 × 844, PL i EN: pierwszy ekran ma nagłówek, jedno zdanie i przycisk w kadrze; brak
      poziomego przewijania (`document.documentElement.scrollWidth` ≤ 390 na każdym przystanku i przy
      otwartej każdej szufladzie); na ekranie instalacji karta „Wyślij sobie link” (jeśli pytanie 3 = A);
      szczyt nadal najdłuższym odcinkiem; hero telefonu z werdyktem Łukasza.
- [x] Ograniczony ruch (emulacja `prefers-reduced-motion: reduce`, desktop i telefon): pierwsza asercja to
      tryb (L-0213), potem na każdym przystanku stan końcowy widoczny, wysokość sekcji zgodna z treścią,
      brak treści za krawędzią i brak martwego przewijania (L-0235).
- [x] Bez WebGL (podmiana `getContext('webgl2')` na `null`, pierwsza asercja to brak klasy `tryb-3d`):
      plakat widoczny z `alt`, cała treść przystanków, szuflad, fiszek, makiet i konfigurator w przepływie,
      zero komunikatów konsoli poza zamierzonym `warn`; w trybie 3D lista żądań **nie** zawiera plakatu
      (kontrola pozytywna: w trybie bez WebGL zawiera).
- [x] Bez JavaScriptu (`curl` i render bez skryptów): `h1` 1, siedem sekcji, 15 fiszek, cztery szuflady
      z treścią, komenda instalacji i formularz w HTML i widoczne; plakat z `<noscript>`.
- [x] Cztery przebiegi zrzutów (desktop, telefon, ograniczony ruch, bez WebGL; plus bez JS) bez pustych
      kadrów i bez martwego przewijania poza zapisaną ciszą przed szczytem; arkusze w
      `docs/zasoby/STRONA/lab/biurko/`; karta zgody na `playwright-core` pokazana (jeśli użyta),
      odpowiedź zacytowana we wpisie.
- [ ] Kontrola odczuć: tabela przystanek → odczucie z briefu → odczucie z kadru we wpisie; rozjazd tylko
      z werdyktem Łukasza.
- [x] Zasłona na telefonie, zimne wejście (390 × 844, Fast 4G, CPU ×4, `ignoreCache`): czas do zdjęcia
      zasłony i do gotowego hero, brak stanów pośrednich sceny pod i po zasłonie (klatki co ok. 100 ms);
      obok FAKT-u 11,8 s sceny 3D z Aneksu D.
- [x] Budżet (`FAKT`, instrument z `site/README.md`, L-0223): Biurko w MiB obok 9,49 MiB z E4 i obok
      pomiaru HEAD z pkt 1c, ten sam instrument; ≤ ok. 10 MiB. Przekroczenie = karta decyzji, nie podniesienie pułapu.
- [x] Płynność (`FAKT`): przy CPU ×4 p95 klatki ≤ 26 ms na desktopie i w emulacji telefonu — w trakcie
      szczytu, przy otwartej szufladzie i w równym przewijaniu całej strony; pomiar T1 na grafice programowej
      (pkt 7e) z wynikiem po każdym kroku obniżania jakości albo jawna bramka manualna z warunkiem wykonalności.
- [x] Lighthouse dostępność ≥ 95 dla `/` i `/pl/` (desktop i telefon); EN z `localStorage['relai-jezyk']='en'`;
      fokus: kolejność naturalna, brak dodatnich `tabindex`, 0 elementów fokusowalnych pod `aria-hidden`,
      dialogi z etykietą.
- [x] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu, otwarciu każdej szuflady
      i konfiguratorze (PL i EN, desktop i telefon); żądania tylko `localhost` i `api.github.com`.
- [x] Podstawy bezpieczeństwa na zmianie etapu (`site/package.json` nie ma zależności, więc audytu zależności
      nie ma): `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko site/film`
      kończy się kodem 1, a bez `--exclude` trafia `site/js/wersja.test.mjs` (kontrola pozytywna); treść
      szuflad i makiet do DOM przez `textContent` albo generator z ucieczką; kod z `site/vendor/` tylko ze
      ścieżek względnych, bez CDN; formularz bez `action` i `method`; `node --test "site/**/*.test.mjs"` obejmuje
      `zasoby.test.mjs` zielony, a plakaty leżą w `site/grafika/plakat/`, nie w `site/zasoby/`.
- [ ] Kalibracja: werdykty Łukasza zacytowane we wpisie dla szczytu, każdego z przystanków 3–7 (kadr przed
      i po z obrysem), szuflad, hero telefonu, plakatu i zasłony; kadry przyjęte w
      `docs/zasoby/STRONA/builds/biurko/kalibracja/` (`e6-*-pl-1366.jpeg`, `hero-pl-390.jpeg`).
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis `Autor: RelAI (Opus 5.5) + Lukasz`;
      ryzyka T1 (słaba grafika), T2 (wygląd po przystankach), T3 (ciężar), T6 (telefon i wąskie okno)
      zaktualizowane; `docs/STATE.md` zaktualizowany.
- [ ] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E6/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji
      „Zweryfikowane” wpisu. Artefakty poza katalogiem (serwer podglądu w tle, strony DevTools, profil
      headless Chrome z SwiftShader w `%TEMP%`, worktree HEAD-a do pomiaru „przed”) wypisane z nazwy razem
      z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E6 → ZREALIZOWANY (data); **E8 → GOTOWY DO STARTU** (kolejność
   z Aneksu D: E7 → E6 → E8); linia w dzienniku wdrożenia; link do `PROMPT_ETAP_8.md` w kolumnie `Prompt`
   po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E6/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T1, T2, T3, T6); dopisz lekcje
   z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne”. Do „Świadomie odłożone” wpisz m.in.:
   `hreflang` ze względnymi `{{baza}}` (SEO) i logo zasłony ładowane dopiero po SVG (z E7), duplikat
   modułu telefonu, jeśli powstał.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA` (m.in. pomiar na słabszym laptopie, jeśli SwiftShader nie wystarczył).
4. `docs/STATE.md` — stan Biurka (szczyt, szuflady, telefon, plakat, zasłona, jak uruchomić);
   `CLAUDE.md` — wiersz planu w tabeli „Stan prac” i linia „Aktywny plan”; `site/README.md`, gdy zmienił
   się sposób budowy albo weryfikacji.
5. **Wygeneruj `PROMPT_ETAP_8.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (dawny E5/E6
   „Publikacja i utrzymanie”, numeracja wg Aneksu B), **Aneksu D pkt 3** (obie wersje, Biurko i Film,
   równolegle, z ankietą wśród odwiedzających), otwartych bramek manualnych (`claude-cli://` na żywo,
   adresy i narzędzie ankiety, GitHub Pages), realnego stanu `site/` po tym etapie (czy Film i Biurko dzielą
   moduły, czy duplikaty) i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: desk full journey, drawers and polish (STRONA_RELAI E6)`);
   zmiany E7, jeśli nadal leżą niezatwierdzone, to osobny commit przed tym; `.claude/launch.json`
   i cudze zmiany PANEL_CODEX poza commitem.
