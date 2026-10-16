# PROMPT_ETAP_3 — Laptop jako prawdziwy ekran, dostępny konfigurator i książki od nowa

Plan: STRONA_RELAI • Etap: **E3 z E8** (Aneks B) • Wygenerowano: 2026-10-16 (autor: Opus 5.5, w rytuale „Na koniec” E2) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz (E2 szedł na Sonnet 5.5 za zgodą
> i Łukasz sam przełączył się w połowie kalibracji — L-0220). Zalecany poziom `/effort`: `high`
> (ekran HTML w scenie 3D, przybliżenie kamery i dostępność to trzy mechanizmy, które psują się
> nawzajem; ocena wyglądu należy do Łukasza).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1–T6) + wpis 2026-10-16 „STRONA_RELAI E2…” — słowa Łukasza z czterech rund kalibracji i uwagi po niej, liczby budżetu i wydajności |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcja 10 (**Aneks B** — wiąże, potem Aneks A), 4C (konfigurator), 7 (ryzyka) |
| `docs/zasoby/STRONA/builds/biurko/referencje/` | `05-laptop.jpg` (laptop, ekran, klawiatura, poświata) i `01-hero.jpg`, `08-wieczor.jpg` (książki i drobiazgi w świetle lampy) — miara wyglądu |
| `docs/zasoby/STRONA/builds/biurko/kalibracja/` | `e2-instalacja-pl-1366.jpeg` i `porownanie-laptop.jpeg` — stan ekranu po E2, od którego zaczynasz |
| `docs/zasoby/STRONA/builds/biurko/BRIEF.md` | „Kontrakt warstw hero”, krzywa odczuć — przybliżenie nie może ich złamać |
| skill `nateherk-design:scroll-craft` (wywołaj narzędziem Skill) | `SKILL.md`, potem `references/taste.md` i to, co mówi o interakcji z obiektem w scenie |
| `site/README.md`, potem `site/biurko/scena.js`, `warstwa.js`, `kamera.js`, `przedmioty.js`, `wyposazenie.js`, `site/js/konfigurator.js`, `site/css/strona.css`, `site/narzedzia/szablon.html` | ekran CSS3D, poza „instalacja”, warstwa tekstu, laptop, książki, formularz, style i szablon, które ten etap zmienia |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks B (2026-10-16), pkt 1:** konfigurator wpasowany w ekran laptopa bez szwów i ostylowany
  jak aplikacja na tym ekranie; kliknięcie ekranu przybliża kamerę do pełnego kadru ekranu,
  przewijanie wstecz oddala; konfigurator dostępny z klawiatury i dla czytników ekranu także
  w trybie 3D; książki od nowa (grzbiety, okładki, krawędzie stron, zużycie). Akceptacja Aneksu B:
  „Tak, dopisz Aneks B (Rekomendowane)”.
- **Słowa Łukasza o ekranie (wpis E2):** ma być „idealnie wpasowane… ładnie ostylowane… nie możesz
  tam nic rozjeżdżać”, „żeby to było jednym bytem”, użytkownik „w tym laptopie tak naprawdę ma to
  wszystko wyświetlone i on tam może w nim pracować”; zoom po kliknięciu, „możemy się wtedy też
  jakby cofnąć trochę tym scrollem”. O książkach: „bardzo, bardzo słabo odoszczegółowione”.
- **Konfigurator zostaje prawdziwym HTML** (CSS3D na ekranie, E1) — nie tekstura z canvas; logika
  `site/js/konfigurator.js` (96 kombinacji, testy) bez zmiany zachowania; komendy, linki
  `claude-cli://` i `claude://` jak po E1.
- **Scena E2 bez zmian poza laptopem i książkami:** zasoby CC0 i rejestr `site/zasoby/ZRODLA.json`,
  światło, miasto za oknem, kubek, tablica, tor kamery z siedmioma przystankami (`kamera.js`, test);
  pułap ciężaru ok. 10 MB (Aneks B pkt 4, FAKT po E2: 9,0 MB).
- **Wygląd:** D-61a / D-61b, paleta z `core/panel/theme.mjs`, fonty z `site/fonty/`; zero CDN.
  Nowy zasób CC0 (np. model książek) tylko po karcie zgody z miniaturą obok wzorca (L-0216).
- **Granica zakresu:** E3 = ekran laptopa, przybliżenie, dostępność konfiguratora, książki.
  Path tracing, połysk lakieru i poświata obiektywu to **E4**; szczyt „bałagan → porządek”,
  szuflady po kliknięciu i makiety pasków — **E5**; Film — **E6**; telefon, wąskie okno, reduced
  motion w pełni, plakat bez WebGL — **E7**; Pages i deep linki na żywo — **E8**. Nie włączasz
  Pages, nie pushujesz.

## Stan wyjściowy — co realnie zastajesz

E2 zrealizowany 2026-10-16 (commit „rebuild desk world from CC0 assets”, sprawdź `git log
--oneline -3`). Strona działa lokalnie: scena z 62 plików CC0, laptop z kodu z klawiaturą QWERTY,
konfigurator na ekranie przez CSS3D; 98 testów.

```
site/biurko/scena.js        # renderer, kompozytor (GTAO + Bokeh + Output), światło, CSS3D ekranu (EKRAN_PX 1136×710, skala 0.284/1136), poza „instalacja” liczona z normalnej ekranu (odległość 0.56, przesunięcie w lewo 0.04), obnizJakosc, diagnostyka()
site/biurko/warstwa.js      # okna widoczności tekstu, mapa aria-current; ekran: opacity/visibility i klasa „w-scenie” od postępu przystanku 6
site/biurko/kamera.js (+test) # POZY, KLUCZE (instalacja: wejście 0.55, postój 0.65), zbudujTor, poza, aktualnyPrzystanek — 9 testów
site/biurko/przedmioty.js   # laptop(): baza, studnia klawiatury, klawisze instancjonowane + arkusz napisów (canvas), gładzik, klapa, siatka „ekran” (0.284 × 0.1775 m) z emissiveMap ekranPanelu
site/biurko/wyposazenie.js  # ksiazki(): 4 książki z pudełek (okładka, grzbiet, blok stron z tekstury canvas), grupa (0.9, 0, -0.15), obrót 0.5
site/biurko/swiat.js, start.js # ładowanie etapami, window.__biurko (diagnostyka, tor, obiekty, scena)
site/narzedzia/szablon.html # <div class="scena" data-scena aria-hidden="true"> — w trybie 3D formularz [data-ekran] trafia do środka tej warstwy
site/js/konfigurator.js (+test), site/css/strona.css # formularz i jego wygląd
site/zasoby/ZRODLA.json, LICENCJE.md, narzedzia/zasoby.test.mjs # rejestr CC0 z sumami i test
```

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (98 pass po E2). Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash. Po każdej zmianie modułu `navigate_page` z `type: reload` i `ignoreCache`, potem
asercja nowego kodu (L-0218). Kadry o stałym rozmiarze w osobnej stronie DevTools z `emulate
viewport` (`1366x768x1`); język EN wymaga `localStorage.relai-jezyk = "en"` (zapisany wybór
wygrywa z adresem). Element w warstwie `aria-hidden` nie ma identyfikatora w migawce DevTools —
w E2 do prawdziwego kliknięcia zdejmowano `aria-hidden` czasowo. Paczka npm three.js 0.186.1 leży
w `%TEMP%\relai-three-0.186.1`.

**Co widać po E2 (FAKT, kadry):** przy przystanku „Instalacja” formularz zajmuje górną część ekranu,
dół ekranu jest pusty; karta „Zacznij tutaj” zachodzi na lewy brzeg laptopa; ekran to płaski
prostokąt HTML na ciemnej ramce bez poświaty na klawiaturze; w trybie 3D konfigurator jest
w `aria-hidden` (niedostępny dla czytników). Książki to zestaw pudełek z jednolitym kolorem.

**Czego jeszcze nie ma (to jest zakres tego etapu):** ekranu, który wygląda jak aplikacja na tym
laptopie (wypełniony, wyrównany do krawędzi matrycy, ostylowany), przybliżenia po kliknięciu
i oddalenia przewijaniem, dostępnego konfiguratora w trybie 3D, książek na poziomie wzorców.

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
     nowego kodu przed kadrem (L-0218).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215);
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
   Karta zgody na zależność podaje wielkość na dysku (L-0172).
   (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172)
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
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu.
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
      kolejną rundą (L-0220).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E3/`.** Wszystko tymczasowe —
> skrypty pomiarowe, kadry, strony porównań, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: projekt ekranu, przybliżenie, dostępność i ocena robisz sam (Opus). Do trzech
subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie testy z punktu 6 —
deterministyczne, sprawdzane przez Ciebie przed przyjęciem.

1. **Ekran jako aplikacja** — `site/css/strona.css` (style `[data-ekran]` w trybie „w-scenie”),
   `site/narzedzia/szablon.html` (o ile układ formularza tego wymaga, potem generator),
   `site/biurko/scena.js` (wymiar i położenie CSS3D): treść wypełnia całą matrycę w proporcji
   16:10, marginesy równe od krawędzi matrycy, pasek okna aplikacji u góry, typografia i kontrast
   czytelne w kadrze przystanku i w przybliżeniu, nic nie wystaje poza matrycę ani nie zostawia
   pustego pasa. Krawędź HTML pokrywa się z krawędzią siatki „ekran” co do piksela przy 1366 i 1920.
2. **Ekran w świetle sceny** — `site/biurko/przedmioty.js`, `scena.js`: ramka matrycy, lekki refleks
   szkła nad treścią HTML, chłodna poświata ekranu na klawiaturze i blacie przed laptopem (wzorzec
   `05-laptop.jpg`); bez zmiany palety konfiguratora.
3. **Przybliżenie i powrót** — `site/biurko/scena.js`, `warstwa.js` (i `kamera.js` tylko gdy
   trzeba nowej pozy; struktura toru i testy zostają): kliknięcie (i Enter na fokusie) ekranu
   w przystanku „Instalacja” płynnie przybliża kamerę do kadru, w którym ekran wypełnia widok;
   przewinięcie wstecz albo Esc oddala do pozy przystanku; karta tekstu przystanku nie zasłania
   ekranu w przybliżeniu; `prefers-reduced-motion` → skok bez animacji.
4. **Dostępność konfiguratora w trybie 3D** — `site/narzedzia/szablon.html`, `site/biurko/swiat.js`
   / `warstwa.js`: formularz poza warstwą `aria-hidden` (albo warstwa bez `aria-hidden` dla
   formularza), fokus z klawiatury trafia do formularza przy przystanku „Instalacja”, kolejność
   Tab logiczna, etykiety i `aria-live` jak po E1; tryb bez WebGL bez zmian.
5. **Książki od nowa** — `site/biurko/wyposazenie.js` (albo model CC0 po karcie zgody, L-0216):
   zaokrąglone grzbiety z wypukłością, okładki z lekkim wypaczeniem i przetarciem rogów, blok stron
   z krawędzią i cieniem, tytuły albo wytłoczenia na grzbietach w barwach RelAI, materiały PBR;
   stos czytelny w kadrach „Panel” i „Instalacja”. Nowy zasób → `ZRODLA.json`, `LICENCJE.md`, test.
6. **Testy** — `site/js/*.test.mjs` / `site/biurko/*.test.mjs`: czysta logika przybliżenia (stan
   „przybliżony / przystanek”, przejścia na klik, Esc i przewinięcie) i pozy przybliżenia
   (ekran w kadrze dla 16:9 i 16:10). *(subagent)*
7. **`site/README.md`** — jak działa ekran i przybliżenie (jedno–dwa zdania), gdy zmienia się
   sposób weryfikacji.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 98 (E2, `FAKT`)
      plus nowe testy przybliżenia; kontrola pozytywna: test pozy przybliżenia z ekranem wyjętym
      poza kadr musi się wywrócić.
- [x] Ekran wpasowany (`FAKT`, 1366 × 768 i 1920 × 1080, PL i EN): narożniki prostokąta `[data-ekran]`
      (`getBoundingClientRect` po transformacji CSS3D) i narożniki siatki „ekran” rzutowane kamerą
      różnią się o ≤ 2 px w pozie przystanku i w przybliżeniu; żaden element formularza nie wystaje
      poza ten prostokąt (`scrollWidth`/`scrollHeight` ≤ wymiar); kontrola pozytywna: formularz
      sztucznie poszerzony o 40 px wywraca pomiar.
- [x] Przybliżenie: klik w ekran i Enter na fokusie ekranu → ekran zajmuje ≥ 85 % szerokości albo
      wysokości widoku; przewinięcie wstecz i Esc → poza przystanku; zrzuty trzech położeń
      (przystanek, w trakcie, przybliżenie) przy 1366 i 1920 w katalogu roboczym; z
      `prefers-reduced-motion` przejście bez klatek pośrednich.
- [x] Interakcja w przybliżeniu: `elementFromPoint` w pięciu punktach formularza trafia formularz;
      klik w narzędzie zmienia komendy; „Kopiuj” daje komendy w schowku systemu (`Get-Clipboard`).
- [x] Dostępność w trybie 3D: migawka dostępności DevTools **bez zdejmowania `aria-hidden`** pokazuje
      formularz z radiami, polami i przyciskiem „Kopiuj”; Tab z mapy „Instalacja” dochodzi do
      formularza; dowód negatywny: warstwa sceny poza formularzem nadal `aria-hidden`.
- [x] Bez WebGL i z zasobem 404 (podmiana w `initScript`): tryb przepływu, konfigurator widoczny,
      0 `console.error` z kodu; pierwsza asercja to tryb strony (L-0213).
- [x] **Kalibracja smaku:** zrzuty ekranu laptopa (przystanek i przybliżenie) i stosu książek
      pokazane Łukaszowi obok `05-laptop.jpg`, `01-hero.jpg` i `08-wieczor.jpg` w otwartym oknie;
      werdykt zacytowany w wpisie; uwagi wdrożone w E3 albo zapisane za jego zgodą do E4–E7.
- [x] Budżet i płynność (`FAKT`): pierwsze wejście ≤ ok. 10 MB po kompresji (pomiar jak w
      `site/README.md`); przy CPU ×4 p95 klatki ≤ 26 ms także w trakcie przybliżenia; wywołania
      rysowania na klatkę obok liczby E2 (913).
- [x] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu i przybliżeniu (PL i EN);
      żądania tylko `localhost` i `api.github.com`.
- [x] Podstawy bezpieczeństwa:
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko`
      kończy się kodem 1, a bez `--exclude` trafia `site/js/wersja.test.mjs` (kontrola pozytywna);
      zasoby ze ścieżek względnych `site/`; formularz bez `action`/`method`.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; `docs/STATE.md` zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (`%TEMP%\relai-three-0.186.1`,
      serwer podglądu w tle) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_4.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E3/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T6 po pomiarze wpasowania,
   T1 po pomiarze przybliżenia); dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan strony (ekran, przybliżenie, dostępność); `CLAUDE.md` — wiersz planu
   w tabeli „Stan prac” i linia „Aktywny plan”; `site/README.md`, gdy zmienił się sposób weryfikacji.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 10 (Aneks B pkt 2 —
   path tracing na postoju kamery, połysk lakieru, poświata obiektywu, wyłącznik dla słabego GPU,
   karta zgody na `three-gpu-pathtracer` i `three-mesh-bvh`), realnego stanu `site/` po tym
   etapie, werdyktu kalibracji i lekcji z tego etapu (oraz L-0220: rozbiór kadru po kategoriach).
6. Commit — propozycja, conventional message po angielsku (np. `feat: laptop screen as live app with zoom (STRONA_RELAI E3)`); `.claude/launch.json` poza commitem.
