# PROMPT_ETAP_7 — Dopieszczenie Filmu: akt po akcie z Łukaszem, telefon, ograniczony ruch, wersja bez skryptów

Plan: STRONA_RELAI • Etap: **E7 z E8** (Aneks D: kolejność E7 → E6 → E8) • Wygenerowano: 2026-10-16 (autor: Opus 5.5, w rytuale „Na koniec” E5) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz (L-0220: ocena smaku na słabszym
> modelu kosztowała w E2 dwie rundy). Zalecany poziom `/effort`: `high` (kalibracja smaku każdego
> aktu z Łukaszem, osobna kompozycja na telefon i cztery przebiegi zrzutów; ocena wyglądu należy
> do Łukasza).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1, T2, T3, T6) + wpis 2026-10-16 „STRONA_RELAI E5…” (co powstało, pomiary, cytaty z kalibracji hero i z bramki) |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcja 3 (cele i „poznamy po tym” — szczególnie cel 1 o pierwszym ekranie 1366 × 768 i 390 × 844 oraz cel 6 o czterech przebiegach zrzutów i Lighthouse ≥ 95), 6 (wiersz „Dopieszczenie wybranej” — zakres), 8 (przypadki brzegowe), 10 (**Aneks C pkt 4** i **Aneks D** — wiążą) |
| `docs/zasoby/STRONA/builds/film/BRIEF.md` | krzywa odczuć, szczyt, ruch-podpis „pismo odręczne staje się drukiem”, partytura aktów i kontrakt warstw hero — miara każdej poprawki |
| `docs/zasoby/STRONA/builds/film/kalibracja/` | kadry przyjęte w E5: `hero-pl-1366.jpeg` (hero po trzech rundach), `paski-aplikacja-2026-10-16.jpeg` (zrzut aplikacji, wzór makiety pasków), `porownanie-*.jpeg` (Biurko obok Filmu) |
| skill `nateherk-design:scroll-craft` (narzędzie Skill) | `references/verify.md` (procedura zrzutów i kontroli odczuć), `references/hero-depth.md` (kompozycja na telefon), `references/taste.md`, `feel.md` §6 |
| `site/README.md`, potem `site/narzedzia/szablon-film.html`, `site/css/film.css`, `site/film/start.js`, `akty.js`, `zaslona.js`, `site/tresc/pl.json` (klucz `film`) | stan Filmu, który dopieszczasz: budowa, warstwy, choreografia, ekran ładowania, treść |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | przed każdą zmianą makiety pasków (zasada 15) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks D (2026-10-16):** bramka po E5 rozstrzygnięta — najpierw dopieszczamy **Film**; żaden
  prototyp nie idzie do archiwum. Kolejność: **E7 (ten etap, Film) → E6 (Biurko: pełna droga,
  szczyt, szuflady i krótkie dopieszczenie) → E8 (publikacja obu wersji równolegle z ankietą)**.
  Ostateczny wybór kierunku zapada po ankiecie, poza tym planem. Łukasz o Filmie: „tam jeszcze
  będzie sporo rzeczy, które możemy poprawić, ulepszyć, usprawnić […] z filmem jeszcze nie było
  żadnej iteracji, oprócz tam może tego hero”.
- **Zakres E7 z sekcji 6 i Aneksu C pkt 4, dla Filmu:** pełna jakość wszystkich aktów, osobny kadr
  na telefon, ograniczony ruch, wersja bez skryptów (odpowiednik „plakatu bez WebGL” — Film nie ma
  WebGL), dostępność, budżet wydajności, harness zrzutów scroll-craft i kontrola odczuć, ekran
  ładowania dopracowany i zmierzony także na telefonie.
- **Hero przyjęte w E5** („Tak, przyjmuję”, trzecia runda): okno czatu w całości w kadrze, logo
  odsunięte, nagłówek składany linia po linii. Zmieniasz je tylko wtedy, gdy Łukasz o to poprosi
  albo gdy wymaga tego kadr telefonu (wtedy osobna kompozycja, desktop bez zmian).
- **Silnik scroll-craft 0.3.1 bez zmian** — `site/vendor/scrollcraft/` bajt w bajt (`VERSION`
  z sumami). Nowe zachowanie piszesz w `site/film/`, nigdy w silniku.
- **Grafika z kodu, bez zdjęć, bez WebGL i bez wideo** (Aneks A pkt 2, Aneks C pkt 2; sekcja 4B:
  „Sam CSS 3D — tylko w Filmie”).
- **Makiety pasków według zrzutu aplikacji** (L-0231): kolejność plan, postęp, cache, wiersz
  kontekstu z progiem, powierzchnie #212121 / #151515 / #20201f; dane przykładowe z oznaczeniem.
  Zmiana makiety zaczyna się od świeżego zrzutu aktualnej aplikacji, nie od pamięci.
- **Kryterium jakości (Aneks C pkt 5, L-0226):** kadry ocenia się po detalu i wykonaniu (krój,
  rytm, krawędzie, ziarno papieru, cienie z CSS), nie po efekcie; ruch znaczy coś w historii albo
  go nie ma. Gust Łukasza: pamięć `gust-designowy-lukasza`, `realizm-to-detal-nie-swiatlo`,
  `linie-gasnace-miedzy-wierszami`, `layout-bez-rozjazdow`.
- **Biurko nietknięte w tym etapie** — `site/biurko/`, `site/index.html`, `site/pl/index.html`,
  `site/zasoby/`, `site/vendor/three/`, `site/css/strona.css`. Wspólne moduły (`site/js/`,
  `site/tresc/`, `zbuduj.mjs`, `makiety.mjs`) zmieniasz tylko tak, żeby strony Biurka po przebudowie
  zostały identyczne bajtowo (dowód negatywny).
- **Granica zakresu:** pełna droga Biurka i jego dopieszczenie — **E6**; GitHub Pages, adresy obu
  wersji, ankieta, deep linki na żywo, wiersz w `FINGERPRINTS.md` po wysyłce, krok „strona”
  w sekwencji wydania — **E8**. Nie włączasz Pages, nie pushujesz, nie zakładasz ankiety.

## Stan wyjściowy — co realnie zastajesz

E5 zrealizowany 2026-10-16 (commit E5 — sprawdź `git log --oneline -3`; gdy Łukasz nie zatwierdził
go przed startem, zmiany E5 leżą w drzewie i ich nie cofasz). Film działa na desktopie 1366 × 768
w PL i EN; na telefonie nikt go jeszcze nie oglądał — `site/css/film.css` ma tylko jedno zapytanie
`@media` (ograniczony ruch), żadnego układu wąskiego.

```
site/film/index.html, site/pl/film/index.html  # generowane: Film EN i PL (nie edytujesz ręcznie)
site/narzedzia/szablon-film.html (249 wierszy)  # sześć aktów: wejscie (flow, paralaksa), pamiec (pin 4.8, szczyt),
                                                # plan (flow, arkusz), panel (pin 2.2, okno 3D → paski), komendy (pan 3.2,
                                                # taśma 15 fiszek), instalacja (pin 1.15, reflektor, konfigurator)
site/css/film.css (386 wierszy)                 # tokeny z core/panel/theme.mjs, zasłona, choreografia `html.ruch`,
                                                # paski wg zrzutu aplikacji, blok prefers-reduced-motion
site/film/start.js                              # wejście: język, konfigurator, wersja, kroki zasłony, montaż silnika;
                                                # przy ograniczonym ruchu akt pamiec staje się flow
site/film/akty.js (+akty.test.mjs)              # okna czasowe zdań i lotu karteczek, ROZSYPKA, ustawOkna, zamontujPamiec/Panel
site/film/zaslona.js (+zaslona.test.mjs)        # ekran ładowania: krok(n), gotowe(), blad(), limit 4 s
site/narzedzia/makiety.mjs (+test)              # makiety pasków z core/panel → site/dane/makiety.json
site/narzedzia/zbuduj.mjs (+test)               # cztery strony (Biurko i Film × EN i PL), fiszki PL z faktów, EN z tresc.film.fiszki
site/vendor/scrollcraft/                        # silnik 0.3.1, VERSION z sumami, LICENSE MIT
site/grafika/ikony/*.svg                        # 15 ikon komend
docs/zasoby/STRONA/builds/film/BRIEF.md         # brief Filmu
docs/zasoby/STRONA/FINGERPRINTS.md              # rejestr scroll-craft, pusty (wiersz dopiero w E8)
docs/zasoby/STRONA/lab/                         # pusty katalog na pasy zrzutów
```

Pomiary E5 (FAKT): Film 0,31 MiB po kompresji (33 pliki), przy CPU ×4 mediana i p95 klatki 5,6 ms,
najdłuższa 28,7 ms; zasłona zdjęta ok. 1,1 s przy zimnym wejściu (Fast 4G, CPU ×4); szczyt:
`scrollBy(0, 1000)` z p = 0 kończy się na p = 0,343; konsola i sieć czyste w PL i EN.

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (229 pass po E5, FAKT); budowa
`node site/narzedzia/fakty.mjs`, `node site/narzedzia/makiety.mjs`, `node site/narzedzia/zbuduj.mjs`.
Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (port bywa zajęty serwerem z poprzedniej sesji — wtedy `curl` na 4520 i korzystasz
z niego); Film pod `/film/` i `/pl/film/`. Kadry o stałym rozmiarze w osobnej stronie Chrome DevTools
z `emulate viewport` (`1366x768x1`, telefon `390x844x3,mobile,touch`); przed każdym pomiarem ruchu
`select_page` z `bringToFront` i liczba `requestAnimationFrame` na sekundę (L-0222); język EN wymaga
`localStorage.relai-jezyk = "en"` w `initScript`, a sonda `initScript` sprawdza istnienie dokumentu
i pisze do `sessionStorage` (L-0232). Harness `shoot.mjs` skilla wymaga paczki `playwright-core`,
której na maszynie nie ma (FAKT: brak globalnie; przeglądarki Playwrighta w
`%LOCALAPPDATA%/ms-playwright/` są). Pytanie kalibracyjne nazywa kadr i obszar oceny i pokazuje
zmianę z obrysem w otwartym oknie (L-0229). Ścieżki w powłoce zawsze z `/` (L-0230). W drzewie
roboczym mogą leżeć cudze zmiany planu PANEL_CODEX (`docs/plany/PANEL_CODEX/*`,
`docs/zasoby/PANEL_RELAI/makiety/`) i `.claude/launch.json` — nie ruszasz ich i nie commitujesz.

**Czego jeszcze nie ma (to jest zakres tego etapu):** kalibracji aktów 2–6 z Łukaszem, kompozycji
na telefon, pełnego trybu ograniczonego ruchu, sprawdzonej wersji bez skryptów, pomiaru dostępności,
pasów zrzutów w czterech przebiegach i kontroli odczuć.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-16):**

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
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E7/`.** Wszystko tymczasowe —
> skrypty pomiarowe, kadry robocze, strony porównań, paczka `playwright-core` — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
> wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: ocena, wygląd, choreografia i rozmowa z Łukaszem — Ty (Opus). Do trzech subagentów
Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie testy z punktu 7 i zliczenia z punktu 6
— deterministyczne, sprawdzane przez Ciebie przed przyjęciem.

1. **Przegląd i lista uwag przed kodem** — przewiń cały Film PL 1366 × 768 i zrób kadry każdego
   aktu w trzech położeniach (wejście, środek, wyjście), w tym klatki pośrednie szczytu. Z nich
   lista usterek i propozycji per akt, każda z kadrem i obrysem miejsca. Listę pokazujesz Łukaszowi
   w otwartym oknie **przed** poprawkami i pytasz, co bierze, co odrzuca i co dopisuje (jego słowa:
   „sporo rzeczy, które możemy poprawić, ulepszyć, usprawnić”). Strona z listą w katalogu roboczym.
2. **Kalibracja akt po akcie** — `site/css/film.css`, `site/narzedzia/szablon-film.html`,
   `site/film/akty.js`, `site/tresc/{pl,en}.json` (klucz `film`): poprawki z przyjętej listy,
   po jednym akcie naraz, każdy akt z werdyktem Łukasza na kadrze „przed i po” (zasada 15, L-0229),
   zanim ruszy następny. Akty przyjęte → `docs/zasoby/STRONA/builds/film/kalibracja/akt-<nazwa>-pl-1366.jpeg`.
3. **Telefon** — osobna kompozycja dla szerokości ≤ 600 px w `site/css/film.css` (i, gdy potrzebne,
   osobne okna czasowe w `site/film/akty.js`): pierwszy ekran 390 × 844 ma nagłówek, jedno zdanie
   i przycisk w kadrze (cel 1 planu); szczyt nadal najdłuższym odcinkiem; taśma fiszek przewijalna
   palcem bez blokady przewijania strony; konfigurator używalny jednym kciukiem. Kadr hero telefonu
   z werdyktem Łukasza → `kalibracja/hero-pl-390.jpeg`.
4. **Ograniczony ruch i wersja bez skryptów** — `prefers-reduced-motion: reduce`: akty jako zwykłe
   sekcje w stanie końcowym (karteczki już w dokumentach, okno wyprostowane, paski widoczne), bez
   lotu i bez przyklejania, znaczenie zostaje (sekcja 8). Bez JavaScriptu: cała treść, fiszki,
   komendy instalacji i odnośniki widoczne w stanie końcowym, bez zasłony i bez pustych miejsc po
   animacjach (sekcja 8, „JavaScript wyłączony”).
5. **Ekran ładowania na telefonie i dostępność** — zasłona mierzona przy zimnym wejściu na telefonie
   (390 × 844, Fast 4G, CPU ×4) tak jak w E5; kolejność Tab przez całą stronę, widoczny fokus,
   `aria-hidden` tylko na dekoracjach, kontrast tekstu na najjaśniejszej klatce pod każdą linią
   (`references/verify.md`); Lighthouse dostępność ≥ 95 (cel 6 planu) dla `/film/` i `/pl/film/`.
6. **Pasy zrzutów i kontrola odczuć** — harness `shoot.mjs` w czterech przebiegach: desktop,
   telefon, reduced motion i JavaScript wyłączony, PL; wynik w `docs/zasoby/STRONA/lab/film/`
   (arkusze `sheet.png` jako JPEG). `playwright-core` instalujesz wyłącznie do katalogu roboczego
   i dopiero po karcie zgody (paczka, wersja, rozmiar, źródło npm); bez zgody — te same cztery
   przebiegi przez Chrome DevTools w tych samych położeniach (sześć na akt). Potem kontrola odczuć
   z `feel.md` §6 na krzywej z briefu: każdy akt — odczucie zamierzone i odczucie z kadru.
7. **Testy** — `site/film/*.test.mjs`, `site/narzedzia/*.test.mjs`: nowe okna czasowe i układ
   telefonu (jeśli dotknięte), stan końcowy aktów przy ograniczonym ruchu, treść kompletna w HTML
   bez JS (nagłówek, zdania szczytu, 15 fiszek, komenda instalacji, konfigurator) dla obu języków.
   *(subagent)*
8. **`site/README.md`** — telefon, ograniczony ruch, wersja bez skryptów, przebiegi zrzutów
   i pomiar dostępności Filmu; tylko to, co zmienił ten etap.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_7.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 229 (E5, `FAKT`)
      plus nowe; kontrola pozytywna: szablon Filmu bez jednej fiszki albo bez komendy instalacji
      w HTML musi wywrócić test treści bez JS.
- [x] Silnik bez zmian: `sha256sum site/vendor/scrollcraft/scrollcraft.js scrollcraft.css LICENSE`
      równe wpisom w `site/vendor/scrollcraft/VERSION`.
- [x] Biurko nietknięte (dowód negatywny): sumy `sha256sum` plików `site/biurko/*`,
      `site/zasoby/**`, `site/vendor/three/**`, `site/css/strona.css`, `site/index.html`
      i `site/pl/index.html` zapisane w katalogu roboczym **na starcie etapu** (przed pierwszą
      zmianą) i porównane na końcu, po pełnej budowie — zero różnic; kontrola pozytywna: plik
      z dopisaną spacją daje jedną różnicę.
- [x] Lista uwag z punktu 1 pokazana Łukaszowi w otwartym oknie przed pierwszą poprawką; jego
      wybór zacytowany we wpisie.
- [x] Każdy z aktów 2–6 ma werdykt Łukasza na kadrze „przed i po” z obrysem zmiany (L-0229),
      zacytowany we wpisie; kadry przyjęte w `docs/zasoby/STRONA/builds/film/kalibracja/`.
- [x] Telefon 390 × 844, PL i EN: pierwszy ekran ma nagłówek, jedno zdanie i przycisk w kadrze;
      brak poziomego przewijania strony (`document.documentElement.scrollWidth` ≤ 390 w każdym
      akcie); szczyt ma najdłuższy odcinek przewijania; hero telefonu z werdyktem Łukasza.
- [x] Ograniczony ruch (emulacja `prefers-reduced-motion: reduce`): pierwsza asercja to tryb
      (L-0213), potem w każdym akcie stan końcowy widoczny bez przewijania wewnątrz przyklejenia
      i bez pustych kadrów.
- [x] Bez JavaScriptu (DevTools z wyłączonym JS oraz `curl`): nagłówek, zdania szczytu, 15 fiszek,
      komenda instalacji i konfigurator w HTML i widoczne; zasłony nie ma.
- [x] Cztery przebiegi zrzutów (desktop, telefon, reduced motion, JS wyłączony) bez pustych kadrów
      i bez martwego przewijania poza ciszą zapisaną w briefie; arkusze w `docs/zasoby/STRONA/lab/film/`;
      karta zgody na `playwright-core` pokazana, a odpowiedź zacytowana we wpisie.
- [x] Kontrola odczuć: tabela akt → odczucie z briefu → odczucie z kadru we wpisie; rozjazd tylko
      z werdyktem Łukasza.
- [x] Lighthouse dostępność ≥ 95 dla `/film/` i `/pl/film/` (desktop i telefon); kontrast
      najjaśniejszej klatki pod każdą linią tekstu ≥ 4,5 : 1 (tekst duży ≥ 3 : 1).
- [x] Budżet i płynność (`FAKT`, instrument z `site/README.md`): Film w MiB obok 0,31 MiB z E5;
      przy CPU ×4 p95 klatki w ruchu ≤ 26 ms na desktopie i w emulacji telefonu; zasłona przy
      zimnym wejściu na telefonie (Fast 4G, CPU ×4) — czas zejścia i brak stanów pośrednich
      (zrzuty co 100 ms).
- [x] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu i konfiguratorze
      (Film PL i EN, desktop i telefon); żądania tylko `localhost` i `api.github.com`.
- [x] Podstawy bezpieczeństwa:
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko site/film`
      kończy się kodem 1, a bez `--exclude` trafia `site/js/wersja.test.mjs` (kontrola pozytywna);
      kod z `site/vendor/` tylko ze ścieżek względnych, bez CDN; formularz bez `action`/`method`;
      `grep -rn "data-sc-src" site/film site/narzedzia/szablon-film.html` nie trafia nic.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; ryzyka T1, T2, T3 i T6 zaktualizowane (T6: telefon);
      `docs/STATE.md` zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E7/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (serwer podglądu w tle, strony
      DevTools, `playwright-core`, jeśli trafił poza katalog roboczy) wypisane z nazwy razem z tym,
      co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E7 → ZREALIZOWANY (data); **E6 → GOTOWY DO STARTU**
   (kolejność z Aneksu D: po E7 rusza E6, nie E8); linia w dzienniku wdrożenia; link do
   `PROMPT_ETAP_6.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E7/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T1, T2, T3, T6); dopisz lekcje
   z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan Filmu po dopieszczeniu; `CLAUDE.md` — wiersz planu w tabeli „Stan prac”
   i linia „Aktywny plan”; `site/README.md`, gdy zmienił się sposób budowy albo weryfikacji.
5. **Wygeneruj `PROMPT_ETAP_6.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (dawny E2
   „Biurko: pełna droga, szczyt, szuflady”, numeracja wg Aneksu C) i **Aneksu D pkt 2** (do zakresu
   dochodzi krótkie dopieszczenie Biurka: telefon, ograniczony ruch, plakat bez WebGL, ekran
   ładowania); materiał niewykonanego promptu w commicie `a097b35`; realny stan `site/` po tym
   etapie (wspólne moduły zmienione przy Filmie) i lekcje z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: film polish for phone, reduced motion and no-JS (STRONA_RELAI E7)`); `.claude/launch.json` i cudze zmiany PANEL_CODEX poza commitem.
