# PROMPT_ETAP_4 — Fotorealizm na przystankach: path tracing na postoju kamery, połysk lakieru, poświata obiektywu

Plan: STRONA_RELAI • Etap: **E4 z E8** (Aneks B) • Wygenerowano: 2026-10-16 (autor: Opus 5.5, w rytuale „Na koniec” E3) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz (L-0220: ocena smaku na słabszym
> modelu kosztowała w E2 dwie rundy). Zalecany poziom `/effort`: `high` (nowa zależność 0.0.x, render
> progresywny wpięty w pętlę na żądanie i przejście bez skoku to trzy mechanizmy, które psują się
> nawzajem; ocena wyglądu należy do Łukasza).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1, T4, T5) + wpisy 2026-10-16 „STRONA_RELAI E2…” (rozbiór kadru po kategoriach, czwarta runda kalibracji) i „STRONA_RELAI E3…” (liczby płynności, „Świadomie odłożone”) |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcja 10 (**Aneks B pkt 2, 4 i 5** — wiąże), 7 (ryzyka) |
| `docs/zasoby/STRONA/builds/biurko/referencje/` | `01-hero.jpg`, `03-porzadek.jpg`, `05-laptop.jpg`, `08-wieczor.jpg` — światło odbite, połysk blatu, poświata lampy; miara wyglądu |
| `docs/zasoby/STRONA/builds/biurko/referencje/ANALIZA.md` | co z każdego wzorca, barwy mierzone próbką pikseli |
| skill `nateherk-design:scroll-craft` (narzędzie Skill) | `SKILL.md`, potem `references/taste.md` (sekcja „Depth”) |
| `site/README.md`, potem `site/biurko/scena.js`, `swiat.js`, `warstwa.js`, `materialy.js`, `site/vendor/three/VERSION` | pętla renderu na żądanie, kompozytor (GTAO + Bokeh + Output), światła, poświata ekranu, obniżanie jakości, materiał blatu, przypięte dodatki three.js |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks B (2026-10-16), pkt 2:** path tracing w przeglądarce (`three-gpu-pathtracer`
  i `three-mesh-bvh`, licencja MIT, zgodne z three.js ≥ 0.185) uruchamiany tylko, gdy kamera stoi na
  przystanku; obraz dochodzi progresywnie do jakości zbliżonej do renderu fotograficznego; w ruchu
  zostaje obecny render, przejście bez skoku; słaby GPU i telefon bez path tracingu. Do tego połysk
  lakieru blatu i poświata obiektywu. Kalibracja z Łukaszem na zrzutach obok obrazów wzorcowych.
- **Nowa zależność spoza pakietu three.js:** pobranie dopiero po karcie zgody (nazwa, wersja,
  licencja, rozmiar paczki i rozmiar na dysku oraz po `gzip -9`, L-0172), wersja przypięta
  w `site/vendor/`, wpis w `VERSION` i plik licencji; render rastrowy zostaje stanem bazowym (ryzyko
  T5). Dodatki three.js (np. efekt poświaty) — wyłącznie z tej samej paczki npm co
  `three.module.js` (`%TEMP%\relai-three-0.186.1\three-0.186.1.tgz`), dopisane do `VERSION`.
- **Pułap pierwszego wejścia ok. 10 MB** (Aneks B pkt 4); jednostka pomiaru: **MiB** (L-0223,
  `site/README.md`); FAKT po E3: 9,11 MiB. Path tracer mieści się w tym pułapie.
- **E3 zamknięty i zaakceptowany przez Łukasza bez uwag:** ekran laptopa (konfigurator HTML przez
  CSS3D, wpasowanie ≤ 0,04 px, ramka szkła 8 mm, uszczelka, pas aluminium), przybliżenie
  (`biurko/przyblizenie.js` z testami), dostępność formularza w trybie 3D, książki, poświata ekranu
  `RectAreaLight` 1,1. Tego nie przebudowujesz; path tracing nie może przesunąć ekranu HTML względem
  siatki (pomiar `pomiar` jak w E3).
- **Wygląd:** D-61a / D-61b, paleta z `core/panel/theme.mjs`, fonty z `site/fonty/`; zero CDN.
- **Granica zakresu:** E4 = fotorealizm na postoju (path tracing, wyłącznik, połysk lakieru, poświata
  obiektywu, przejście ruch ↔ postój). Szczyt „bałagan → porządek”, szuflady po kliknięciu i makiety
  pasków — **E5**; Film — **E6**; telefon, wąskie okno, reduced motion w pełni, plakat bez WebGL —
  **E7**; Pages i deep linki na żywo — **E8**. Nie włączasz Pages, nie pushujesz.

## Stan wyjściowy — co realnie zastajesz

E3 zrealizowany 2026-10-16 (commit „laptop screen as live app with zoom”, sprawdź
`git log --oneline -3`). Strona działa lokalnie; render rastrowy z GTAO i płytką głębią ostrości,
pętla renderu wyłącznie na żądanie (klatki tylko w ruchu kamery albo przybliżenia).

```
site/biurko/scena.js        # renderer (AgX, PCF, DPR ≤ 1,5), światła (lampa spot, odbicie, ściana, okno, hemisfera), poswiata() — RectAreaLight ekranu, kompozytor (RenderPass, GTAOPass, BokehPass, OutputPass), CSS3D ekranu, klatka(): lerp toru i przybliżenia, zamow(); obnizJakosc() przy medianie > 26 ms; diagnostyka() (plany, narożniki ekranu, przyblizenie, mediana, dpr)
site/biurko/swiat.js        # uruchom(): etap pierwszy zasobów, scena, warstwa, window.__biurko, etap drugi; koniecSceny() oddaje formularz do treści
site/biurko/warstwa.js      # widoczność tekstu, mapa, przybliżenie (klik/Enter/fokus/Esc/wstecz/„Wróć”), odmontuj()
site/biurko/przyblizenie.js (+test, 64) # przejscie, pozaPrzyblizenia, rzutuj, zmieszaj
site/biurko/kamera.js (+test) # POZY, KLUCZE, zbudujTor, poza, aktualnyPrzystanek, postepPrzystanku
site/biurko/materialy.js, tekstury.js, obiekty.js, przedmioty.js, wyposazenie.js, miasto.js, zasoby.js # świat z 62 plików CC0 + przedmioty z kodu
site/vendor/three/          # three.js 0.186.1 + dodatki (VERSION z listą, w tym lights/RectAreaLight*)
site/README.md              # budowa, zasoby CC0, ekran i przybliżenie, budżet (MiB) i płynność
```

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (162 pass po E3). Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (port bywa zajęty serwerem z poprzedniej sesji — wtedy `curl` na 4520 i korzystasz
z niego). Kadry o stałym rozmiarze w osobnej stronie Chrome DevTools z `emulate viewport`
(`1366x768x1`); przed każdym pomiarem ruchu `select_page` z `bringToFront` i liczba
`requestAnimationFrame` na sekundę (L-0222); język EN wymaga `localStorage.relai-jezyk = "en"`
w `initScript`. Wbudowany panel przeglądarki rysuje klatki dopiero przy zrzucie i nie ma schowka
systemu. Liczba wywołań rysowania: opakowanie kontekstu WebGL2 w `initScript` (wzór w L-0219).

**Co widać po E3 (FAKT):** przy CPU ×4 przewijanie mediana 11,9 ms, p95 22,2 ms (zapas do 26 ms
3,8 ms), przybliżanie p95 13,1 ms, najwięcej 907 wywołań rysowania na klatkę; 9,11 MiB. Rozbiór
kadru z E2 (L-0220): brak światła odbitego (ściana i spody przedmiotów nie są rozświetlone), brak
połysku lakieru blatu, brak poświaty obiektywu wokół lampy. Nierozpoznana jasna kropka w kadrze (przy
górnej ramce w przybliżeniu, na ciemnej ścianie przy książkach; była już w E2).

**Czego jeszcze nie ma (to jest zakres tego etapu):** zależności path tracera, renderu progresywnego
na postoju, przejścia ruch ↔ postój bez skoku, wyłącznika dla słabego GPU i telefonu, połysku lakieru
blatu, poświaty obiektywu.

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
     (L-0222); kod przewijający sam zapisuje cel w stanie odbiornika przed `scrollTo` (L-0224).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224)
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
      kolejną rundą (L-0220); urządzenie w scenie budujesz warstwami prawdziwej konstrukcji i przed
      pierwszym zrzutem oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca — nic nie wystaje
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E4/`.** Wszystko tymczasowe —
> skrypty pomiarowe, kadry, strony porównań, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: projekt renderu, przejścia, wyłącznika i ocena robisz sam (Opus). Do trzech
subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie testy z punktu 6 i pomiar
budżetu — deterministyczne, sprawdzane przez Ciebie przed przyjęciem.

1. **Karta zgody na zależność, potem vendor** — `site/vendor/` (np. `three-gpu-pathtracer/`,
   `three-mesh-bvh/`, z `VERSION` i `LICENSE`), mapa importów w `site/narzedzia/szablon.html`:
   najpierw sprawdzasz w rejestrze npm wersje zgodne z three.js 0.186.1 (pole `peerDependencies`),
   pokazujesz Łukaszowi kartę (nazwa, wersja, licencja, rozmiar paczki, rozmiar plików, które trafią
   do `site/`, i po `gzip -9`), pobierasz dopiero po „tak”, do katalogu roboczego; do `site/` tylko
   używane moduły ESM.
2. **Path tracing na postoju** — `site/biurko/` (np. nowy moduł `fotorealizm.js`, wpięty w
   `scena.js`): gdy kamera stoi (tor i przybliżenie w spoczynku), render przechodzi na path tracer
   tej samej sceny i kamery i dokłada próbki klatka po klatce, aż do progu jakości albo limitu
   czasu; ruch kamery (przewinięcie, przybliżenie, zmiana rozmiaru) przerywa go od razu. Pętla
   renderu na żądanie zostaje — próbki dokładane tylko na postoju, żadnej pętli w tle po
   osiągnięciu progu. Ekran HTML (CSS3D) nie przesuwa się względem siatki.
3. **Przejście bez skoku** — `scena.js`: postój → path tracing narasta płynnie nad obrazem
   rastrowym (przenikanie), ruch → obraz rastrowy wraca bez widocznego skoku jasności i barwy
   (tone mapping i ekspozycja zgodne w obu ścieżkach).
4. **Wyłącznik** — `scena.js` / `swiat.js`: słaby GPU (np. mediana klatki rastrowej, renderer
   z `WEBGL_debug_renderer_info`, brak wymaganych rozszerzeń), telefon (`pointer: coarse`, wąski
   ekran) i `prefers-reduced-motion` nie uruchamiają path tracingu; wyłącznik może też zdjąć
   poświatę ekranu, jeśli pomiar to uzasadni (zapas p95 po E3 tylko 3,8 ms). Render rastrowy
   bez zmian.
5. **Połysk lakieru blatu i poświata obiektywu** — `site/biurko/materialy.js` (warstwa clearcoat
   blatu, odbicie lampy w lakierze jak w `03-porzadek.jpg` i `08-wieczor.jpg`), `scena.js`
   (poświata wokół jasnych źródeł — lampa, latarnie za oknem — dodatek z paczki three.js,
   w rastrze i nad path tracingiem). Przy okazji rozbioru kadru diagnoza jasnej kropki
   z „Świadomie odłożone” E3 (usunięta albo opisana).
6. **Testy** — `site/biurko/*.test.mjs`: czysta logika decyzji „path tracing tak/nie” (wyłącznik
   na danych wejściowych) i stanów postoju (spoczynek → narastanie → próg; ruch przerywa;
   reduced motion). *(subagent)*
7. **`site/README.md`** — jak działa fotorealizm na postoju, wyłącznik, jak go wymusić do
   pomiaru; zależność w tabeli „Co gdzie leży”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_4.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

> **Aneks C (2026-10-16):** path tracing i poświata obiektywu usunięte — punkty o path tracingu
> (3, 4, 5, testy wyłącznika w 1) nie dotyczą; zostają niezaznaczone z tą adnotacją.

- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 162 (E3, `FAKT`)
      plus nowe testy wyłącznika i stanów postoju; kontrola pozytywna: wyłącznik z odwróconym
      warunkiem telefonu musi wywrócić test. — 162/162 po Aneksie C; testy wyłącznika (39, z kontrolą
      pozytywną 10/39 wywróconych) powstały i odeszły razem z path tracingiem.
- [x] Karta zgody pokazana przed pobraniem, odpowiedź Łukasza zacytowana we wpisie; w `site/vendor/`
      tylko przypięta wersja z `VERSION` (źródło, `integrity`, lista plików) i `LICENSE` (MIT). —
      karta pokazana, zgoda zacytowana; zależność usunięta z `site/vendor/` (Aneks C).
- [ ] *(nie dotyczy — Aneks C)* Na każdym z siedmiu przystanków i w przybliżeniu ekranu: path tracing startuje po
      zatrzymaniu kamery, liczba próbek rośnie do progu, potem 0 klatek renderu (licznik
      `requestAnimationFrame` z pracą renderu = 0 przez 2 s); czas do progu (`FAKT`, RTX 4070 Ti,
      1366 × 768) w tabeli we wpisie.
- [ ] *(nie dotyczy — Aneks C)* Ruch przerywa path tracing w ≤ 1 klatce; przejście bez skoku: średnia luminancja kadru
      w ostatniej klatce przed i pierwszej po przełączeniu różni się o ≤ 3 % (oba kierunki, dwa
      przystanki); kontrola pozytywna: przejście z celowo wyłączonym tone mappingiem w path tracerze
      wywraca pomiar.
- [ ] *(nie dotyczy — Aneks C)* Wyłącznik: emulacja telefonu (`375x812x3,mobile,touch`), `prefers-reduced-motion` i wymuszony
      słaby GPU (podmiana w `initScript`) → path tracing nie startuje, obraz rastrowy, 0
      `console.error`; pierwsza asercja to tryb (L-0213).
- [x] Ekran HTML bez zmian: różnica narożników `[data-ekran]` i rzutu siatki ≤ 2 px (przystanek
      i przybliżenie, 1366 i 1920) także w trakcie path tracingu; konfigurator klikalny
      (`elementFromPoint` 5/5). — 0,013 px na przystanku, 0,045 / 0,046 px w przybliżeniu (1366 / 1920),
      5/5 w obu; „w trakcie path tracingu” nie dotyczy (Aneks C).
- [x] **Kalibracja smaku:** zrzuty po zbieżności (hero, „Porządek”, „Instalacja”, przybliżenie)
      pokazane Łukaszowi obok `01-hero.jpg`, `03-porzadek.jpg`, `05-laptop.jpg`, `08-wieczor.jpg`
      w otwartym oknie, z rozbiorem po kategoriach (światło, materiał, obiektyw, kompozycja —
      L-0220); werdykt zacytowany we wpisie; uwagi wdrożone w E4 albo zapisane za jego zgodą do E5–E7.
- [x] Budżet i płynność (`FAKT`): 9,49 MiB (+0,38 wobec HEAD = 9,11 MiB, ten sam instrument),
      CPU ×4 p95 17,5 ms, najwięcej 910 wywołań rysowania (E3: 907). pierwsze wejście ≤ ok. 10 MB, liczone w MiB jak w
      `site/README.md`, z różnicą wobec E3 (9,11 MiB) liczoną tym samym instrumentem na drzewie HEAD
      (L-0223); przy CPU ×4 p95 klatki w ruchu ≤ 26 ms; wywołania rysowania na klatkę rastra obok
      liczby E3 (907).
- [x] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu, postoju i przybliżeniu
      (PL i EN); żądania tylko `localhost` i `api.github.com`.
- [x] Podstawy bezpieczeństwa:
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko`
      kończy się kodem 1, a bez `--exclude` trafia `site/js/wersja.test.mjs` (kontrola pozytywna);
      kod z `site/vendor/` ładowany wyłącznie ze ścieżek względnych, bez CDN; formularz bez
      `action`/`method`.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; ryzyka T1, T4, T5 zaktualizowane; `docs/STATE.md`
      zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (`%TEMP%\relai-three-0.186.1`, pobrane
      paczki zależności, serwer podglądu w tle) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_5.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E4/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T4 po pomiarze czasu do progu
   i wyłącznika, T5 po przypięciu wersji, T1 po pomiarze płynności); dopisz lekcje z etapu do
   `docs/LEKCJE.md` i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan strony (fotorealizm na postoju, wyłącznik); `CLAUDE.md` — wiersz planu
   w tabeli „Stan prac” i linia „Aktywny plan”; `site/README.md`, gdy zmienił się sposób weryfikacji.
5. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` (sekcja 6 — dawny E3
   „Biurko: pełna droga, szczyt, szuflady”, numeracja wg Aneksu B; materiał niewykonanego promptu
   w commicie `a097b35`), realnego stanu `site/` po tym etapie, werdyktu kalibracji i lekcji z tego
   etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: path-traced stills at camera stops (STRONA_RELAI E4)`); `.claude/launch.json` poza commitem.
