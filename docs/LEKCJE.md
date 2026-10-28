# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie indeks „Zasad aktywnych"; pełne brzmienie zasady doczytuje przy jej wyzwalaczu.

## Zasady aktywne

### Indeks

Start sesji czyta tylko ten indeks (D-15, Aneks A): numer, tytuł i wyzwalacz. Gdy zadanie trafia
w wyzwalacz, przed pracą doczytujesz pełne brzmienie zasady z sekcji „Pełne brzmienie” niżej.

- **1 · Specyfikacja dokumentu jest kompletna albo martwa** — piszesz albo zmieniasz specyfikację
  (`SPEC_*`), prompt etapu, regułę produkującą tekst, punkt Weryfikacji albo FAKT do sprawdzenia.
- **2 · W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — wpisujesz komendę,
  frazę albo polecenie do README, `KOMENDY.md`, skilla albo do czatu dla człowieka.
- **3 · Test „czegoś nie wolno” wymaga dowodu negatywnego** — piszesz test nieobecności, kontrolę
  „stary tekst nie może zostać” albo chronisz fragment przed zmianą.
- **4 · Dowodzisz efektem, nie zdarzeniem** — planujesz dowód zmiany: kryterium, materiał testu,
  porównanie przed i po, worktree, pomiar na żywo w przeglądarce albo w modzie.
- **5 · Instrument pomiarowy sam bywa źródłem fałszu** — piszesz wyrażenie regularne, ścieżkę
  Windows, skrypt edycji, parser albo licznik; porównujesz dwa drzewa; mierzysz sesją `claude -p`,
  terminalem albo cudzą usługą.
- **6 · Próg jest liczbą, którą ktoś liczy** — ustalasz albo zmieniasz próg, budżet, limit albo
  liczbę w komunikacie.
- **7 · Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień** — kod czyta komórkę,
  wiersz albo pole dokumentu (tabela, ustawienia, status).
- **8 · Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
  decydujesz, gdzie mieszka zachowanie (`CLAUDE.md`, hook, skill, plik doczytywany) albo stan
  pisany przez model.
- **9 · Skill nie zakłada dostępu poza katalogiem roboczym** — piszesz albo zmieniasz skill: opis,
  frazy, krok sięgający poza projekt.
- **10 · Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI** — mierzysz plugin
  wydany albo niewydany, podbijasz wersję albo wydajesz.
- **11 · Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
  warianty** — liczysz sumy, dopasowujesz nagłówek albo linię, przenosisz katalog z cudzego
  manifestu, przepisujesz regułę dostawcy.
- **12 · Guardrail zatrzymujący nie-sekret to defekt rdzenia** — hook albo bramka blokuje coś, co
  nie jest sekretem, albo piszesz bramkę czytającą wejście.
- **13 · Cudze narzędzie poznajesz z wydanego builda i z próby** — pracujesz z cudzym CLI, API
  modów, payloadem hooka, sesjami harnessu albo usługą zewnętrzną.
- **14 · Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje** — obowiązuje w każdym
  zadaniu, więc stoi tu w pełnym brzmieniu: weryfikację planujesz tam, gdzie wykonalna; po pytaniu
  sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę kotwiczysz do elementu,
  który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy prompt etapu przeczy
  regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika. Opcja pytania, która
  odwołuje się do wariantu planu, cytuje jego definicję z planu.
- **15 · Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są
  ASCII** — dodajesz pytanie do człowieka, komponent opcjonalny albo komunikat hooka; każda praca
  nad wyglądem (mod, panel, strona, film, scena 3D, makieta).

### Pełne brzmienie

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
   plików, nie katalogiem) (L-0212). **FAKT w prompcie do sprawdzenia na żywo autor liczy tym
   samym źródłem, które czyta kod etapu**, a rozjazd wykonawca rozstrzyga pytaniem o brzmienie
   punktu, nie dopasowaniem kodu (L-0254); FAKT o lukach „na drzewie X” liczysz regułą kontroli
   z bazą tego drzewa (L-0269); zdanie „miara rośnie z szerokością” liczysz wzorem układu przy
   każdej szerokości z listy, osobno po obu stronach progu układu (L-0282). Instrukcja wołająca narzędzie, którego kod wyjścia „wynik
   negatywny” nie jest awarią, mówi, co znaczy każdy kod i gdzie stoi pełny wynik, i zakazuje
   obejść — powtórki, pliku tymczasowego (L-0271); zakaz powtórki obejmuje przebieg z wyjściem
   wyrzuconym (L-0279). Kontrola „stary tekst nie może zostać” odróżnia deklarację stanu od zapisu
   przeszłości zamkniętą listą słów przed wartością i przed oddaniem przechodzi jedno realne
   podbicie, nie tylko fixturę (L-0277); kontrola wymagająca numeru wersji w treści dostaje test
   z kontrolą starego numeru na „następnym wydaniu bez zmiany tego numeru” (L-0287).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254, L-0269, L-0271, L-0277,
   L-0279, L-0282, L-0287)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. Komenda do wklejenia przez
   człowieka w czacie: pełna ścieżka, bez zmiennych środowiska, na Windowsie w składni PowerShella
   (L-0266). Polecenie mierzysz w każdym stanie, który samo wytwarza albo na który przełącza —
   przed zmianą i po niej (L-0292). (L-0002, L-0022, L-0059, L-0266, L-0292)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. Test nieobecności tekstu z odmianą liczebnika szuka
   rdzenia wspólnego wszystkim formom, a każdy test „czegoś nie ma” wywraca mutacja pisana dla niego
   (L-0256). (L-0007, L-0256)
4. **Dowodzisz efektem, nie zdarzeniem** — stanem pliku, sumą, treścią odpowiedzi; kryterium na
   stanie, który kontrolujesz, i na źródle, które artefakt produkuje. Zmianę zachowania pokazujesz
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu, na materiale, który stara
   wersja psuje (L-0191).
   - **Kryterium:** na poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz;
     sprawdzone na materiale **przed** pracą (także przez autora promptu) — arytmetycznie
     nieosiągalne wraca do człowieka jako aneks. Etap przenoszący treść liczy metrykę na całym
     pakiecie. Liczenie wywołań narzędzia zaczynasz od listy narzędzi w `init`. Wyszukiwanie
     wzorca omija pliki, które go cytują. Tekst tłumaczący liczbę ma warunek prawdziwości i test
     stanu docelowego (L-0144). Koszt liczysz tylko z przebiegów zgodnych z procedurą — kroki
     wymagane sprawdzone w transkrypcie (L-0301); ewaluacja zachowania wywołanego treścią
     wstrzykniętą zaczyna się od asercji, że ta treść dotarła w całości (L-0303).
   - **Materiał:** test na realnym pliku zmienianym przez proces sam ustawia stan wyjściowy,
     licznik do dziennika z przebiegu po ostatniej zmianie (L-0150); plik śledzony albo własna
     fixtura, nigdy z `.gitignore` (L-0156); przed pytaniem o zasięg sprawdzasz, czy plik nie jest
     generowany (L-0154); zmianę dowodzisz na widoku, który obejmuje jej rekordy (L-0155); test
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186); element
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195); dane
     z repo w artefakcie mają commit-kotwicę ze stanem, który artefakt pokazuje, i liczą się
     w worktree z `core.autocrlf=false` w folderze o nazwie repo (L-0274, L-0275); lekcja
     o mechanizmie (`git worktree add`, checkout) idzie od razu `grep`-em po każdym miejscu repo,
     które go używa, także po kodzie sprzed lekcji (L-0278).
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
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227, L-0274, L-0275, L-0278,
   L-0301, L-0303)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262, L-0290 — „przeszło testy” ani „to tylko test” nie zwalnia z reguły; `sed`
     tylko do odczytu, także w komentarzu — L-0276); ścieżka w powłoce z `/`, także składana ze zmiennych
     w funkcji (L-0230), dla Node z `cygpath -m`, nigdy `cygpath -w` z doklejonym `\\` (L-0265); znak niewidoczny w kodzie przez `String.fromCharCode`, nie ucieczkę
     unicode w Edit, i `grep` po bajtach po edycji (L-0258);
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
     1,00 : 1 na całej linii to najpierw instrument (L-0213); skrypt mutacji wymusza format
     wyniku, który parsuje (`--test-reporter=tap`), a „wszystkie przeżyły” to najpierw instrument
     (L-0270); wzorzec polskiego słowa bierze rdzeń
     sprzed oboczności (`piętna[sś]`) i ma kontrolę na każdej formie z repo (L-0261).
   - **Parsowanie:** separator niepoprzedzony znakiem ucieczki i liczba pól po podmianie; zbiór
     znaków zachowywanych wypisany raz; filtr „to nie przypadek” ma wyjątek dla linii o rzeczy
     sprawdzanej; każdy przypadek graniczny ma własną kontrolę; nazwy narzędzi w cudzym
     transkrypcie wypisujesz, zanim orzekniesz brak; blok wycinany z kodu kotwiczysz do otwarcia
     literału, nie do nazwy (L-0267); wynik `git log -S` to commit zmiany liczby wystąpień, nie
     dodania — cofając się po numerach, szukasz od rodzica (L-0268).
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
     niesie środowisko czytane przez hooki (L-0170); widok bez JS to kopia HTML bez `<script>`
     z rozpakowanym `<noscript>`, bo wyłączone skrypty zatrzymują też sondy DevTools (L-0238);
     płynność tylko bez innej przeglądarki na GPU, co najmniej dwa przebiegi, wynik z obciążonej
     maszyny odrzucony z liczbą (L-0239); zrzut sceny bez tekstu przez `opacity: 0` na elementach
     z tekstem, nie `visibility` rodzica (L-0240); test atrybutu w szablonie kotwiczy sąsiada,
     a po Edit szablonu idzie `diff` wygenerowanej strony (L-0243); kadry układu w Chrome bez okna
     o zadanym rozmiarze, koniec strony z przypiętymi sekcjami pętlą `scrollTo`, nie
     `scrollIntoView` (L-0246); warstwę HTML w transformacji 3D sprawdzasz `elementsFromPoint`
     w siatce po całej powierzchni i w każdym stanie kamery (L-0247); układ wyśrodkowany liczbą
     (lewy i prawy odstęp w kilku szerokościach), kontrola najpierw odtwarza błąd (L-0248);
     przepełnienie telefonu: `innerWidth` wobec `visualViewport`, potem bisekcja reguł (L-0249);
     przycisk zmieniający stan użytkownika naciskasz po pozycji sprawdzonej na liście przycisków,
     nie po pierwszym trafieniu etykiety, i po każdym kliknięciu `diff` z kopią (L-0257); terminal
     mierzysz w `conhost.exe` z `mode con` i oknem nietkniętym, klawisze `WriteConsoleInput`,
     ekran z bufora z atrybutami, skrypty PowerShell w `%TEMP%` (L-0259); skrypt z `Bypass`
     zapowiadasz człowiekowi przed pierwszym przebiegiem, mod „przed” i „po” stoi w jednej sesji
     jako dwie kopie pod innymi nazwami, instalacja wyłączona `--settings` (L-0283); w poleceniu
     Bash nigdy gołe `cd`, w żadnym katalogu — ścieżka w argumencie albo podpowłoka (L-0298,
     L-0302); instrument tury nie liczy lokalnych komend (`/model`) jako polecenia (L-0299).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265,
   L-0267, L-0268, L-0270, L-0283, L-0290, L-0298, L-0299, L-0302)
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
    generowanych (L-0161). Pomiar „instalacji z marketplace” stoi po bramce publikacji, gdy
    `claude plugin marketplace list` pokazuje źródło GitHub; słowo z liczbą ma test form
    1 / 2–4 / 5 / 12 / 22 (L-0260). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161, L-0260)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. Przed liczeniem diffu `git ls-files --eol` — `w/crlf` przy `i/lf`
    normalizujesz do LF, bo `git status` o nim milczy (L-0297). (L-0033, L-0038, L-0057, L-0062,
    L-0067, L-0103, L-0122, L-0297)
12. **Guardrail zatrzymujący nie-sekret to defekt rdzenia** — poprawka z dowodem, nie obejście;
    wołany przez opakowanie powłoki (brak interpretera = blokada); próbki sekretów składane
    w czasie wykonania; cudzysłów (także backtick) należy do grupy cudzysłowu, nie do wartości.
    Bramka rozróżnia „wejście puste” od „wejście nieczytelne” i „wynik bez treści” — dwa ostatnie
    to odmowa z komunikatem, a `catch` bez odmowy to fałszywa zieleń (L-0272).
    (L-0043, L-0045, L-0046, L-0072, L-0272)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload po
    zdjęciu BOM, bez założeń o nazwach pól; CLI z powłoki natywnej; brak sygnału konfrontujesz
    z warunkiem milczenia; nieprzyjęty artefakt — najpierw jego walidator albo widok statusu;
    atrapa cudzego CLI powtarza jego odmowy, zmierzone na prawdziwym CLI w każdym stanie
    wyjściowym przed testami (L-0288).
    - **Mody:** zielone `validate`, typy i testy nie dowodzą zachowania w łańcuchu — mierzysz na
      żywo, ciszę sondą (licznik hooka, wynik `next`) (P-017); `$` i `on` tylko w pliku modułu
      hooków, na zewnątrz czysta logika; typy mówią, co powierzchnia przyjmie, nie co niesie —
      gałąź po polu powierzchni z wejścia, test na obecność odpowiednika; każde drzewo przez
      `plugin test` z montażem i kliknięciem przed pokazem na żywo; korzeń projektu w górę od
      zmiennego cwd, test w podfolderze (L-0146); przypadek błędu najpierw na samym narzędziu
      (bez zapisu), kopia plików użytkownika przed pomiarem, który w nich pisze — kopia, nie
      same sumy (L-0291), odpowiedź
      `$.command.run` po treści, atrapa testu odpowiada na każde wywołanie z `calls` walidatora
      (L-0253); zachowanie silnika, na którym stoi mechanizm (źródło stanu, sygnał zdarzenia),
      sondą zdarzeń w `$.store` przez cały cykl, dwa razy, zanim powstanie kod — „zaraz po” i zdanie
      z typów to hipotezy (L-0255); zmiana komendy albo `core/panel/` → `sync-panel-core.js`
      i `claude plugin test` każdego drzewa z kopią rdzenia, czerwony wynik najpierw na HEAD
      w `git worktree` (L-0264).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190); projekt pomiaru na żywo poza `.claude/`
      (harness odrzuca tam edycje), najpierw `permission_denied`, a kontekst hooka `PostToolUse`
      liczysz w transkrypcie na dysku, nie w stream-json (L-0263); pomiar reguły w `claude -p`
      niesie `--allowedTools` dla każdego polecenia, które reguła uruchamia, dosłownie (L-0273);
      zapis albo skasowanie pod `.claude/` przez badaną sesję `-p` mierzysz poleceniem
      w transkrypcie, a stan pliku — interaktywnie albo bramką (L-0281); ścieżkę modu (przycisk)
      mierzysz funkcją, którą ona woła (komenda tego modu), po przeczytaniu jej kodu — ręczna
      symulacja gubi kroki (L-0284); pole payloadu hooka, na którym stoi warunek, sprawdzasz
      w każdym scenariuszu z listy, także po `/clear` (L-0285); instrukcja pomiaru dla człowieka
      ustawia każdy warunek bramki mechanizmem, który go tworzy, sprawdzonym plikiem przed
      pierwszym przebiegiem, bez kroków, które przepływ robi sam (L-0286); przycisk modu na
      desktopie klika człowiek (okna Claude nie da się sterować), kopia modu w dev-mods sesji pod
      inną nazwą z innym panelem, komendą i stanem, a seria kliknięć ma przerwę na odczyt pliku po
      każdym kliknięciu zmieniającym stan (L-0289); wyjście polecenia ponad ok. 30 tys. znaków
      model dostaje jako 2 KB podglądu — narzędzie czytane w całości mieści się w limicie, a treść
      obowiązkowa stoi na początku (L-0296); instrukcja pomiaru dla człowieka zakazuje `/model`
      i `/config`, a analiza najpierw wypisuje model każdej sesji (L-0300).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245); strona wskazująca zasób
      wydania wdraża się po wydaniu — push tagu, wydanie z zasobami i ich sumy, potem push `main`
      (L-0280).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264, L-0273, L-0280,
    L-0281, L-0284, L-0285, L-0286, L-0288, L-0289, L-0291, L-0296, L-0300)
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
      kontrast mierzysz także na pierwszej klatce (L-0236). Każdy nowy powód zejścia do trybu
      przepływu dostaje przebieg z liczeniem elementów za krawędzią sekcji i dialogów. Reguła
      rozmiaru okna obowiązuje tylko w trybie, dla którego powstała (L-0237). Klasa wyjmująca
      element z przepływu wchodzi przed zmianą jego rozmiaru; na telefonie pierwsza asercja to
      `innerWidth` i `scrollWidth` równe emulacji z `mobile: true` (L-0241).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226, L-0233, L-0235, L-0236, L-0237,
    L-0241)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Lekcje

> Lekcje L-0001 … L-0024 (24 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md](archiwum/lekcje/LEKCJE_L-0001_L-0024.md)
> — przeniesione 2026-08-12, suma kontrolna `bd5f9050dc7e7278`.

> Lekcje L-0055 … L-0069 (15 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0055_L-0069.md](archiwum/lekcje/LEKCJE_L-0055_L-0069.md)
> — przeniesione 2026-09-04, suma kontrolna `f71e94d2e913893b`.

> Lekcje L-0070 … L-0078 (9 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0070_L-0078.md](archiwum/lekcje/LEKCJE_L-0070_L-0078.md)
> — przeniesione 2026-09-14, suma kontrolna `d18c21a837531ba1`.

> Lekcje L-0079 … L-0088 (10 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0079_L-0088.md](archiwum/lekcje/LEKCJE_L-0079_L-0088.md)
> — przeniesione 2026-09-14, suma kontrolna `bbca7854a607be7b`.

> Lekcje L-0089 … L-0111 (23 pozycje) są w
> [docs/archiwum/lekcje/LEKCJE_L-0089_L-0111.md](archiwum/lekcje/LEKCJE_L-0089_L-0111.md)
> — przeniesione 2026-09-24, suma kontrolna `797c63f8e33a2a66`.

> Lekcje L-0112 … L-0141 (30 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0112_L-0141.md](archiwum/lekcje/LEKCJE_L-0112_L-0141.md)
> — przeniesione 2026-10-11, suma kontrolna `0a886eda882814a8`.

> Lekcje L-0142 … L-0148 (7 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0142_L-0148.md](archiwum/lekcje/LEKCJE_L-0142_L-0148.md)
> — przeniesione 2026-10-12, suma kontrolna `73c03313088f3f18`.

> Lekcje L-0149 … L-0164 (16 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0149_L-0164.md](archiwum/lekcje/LEKCJE_L-0149_L-0164.md)
> — przeniesione 2026-10-13, suma kontrolna `f7eed47b4878c6e9`.

> Lekcje L-0165 … L-0176 (12 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0165_L-0176.md](archiwum/lekcje/LEKCJE_L-0165_L-0176.md)
> — przeniesione 2026-10-14, suma kontrolna `21c6a15c57782d0f`.

> Lekcje L-0177 … L-0191 (15 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0177_L-0191.md](archiwum/lekcje/LEKCJE_L-0177_L-0191.md)
> — przeniesione 2026-10-16, suma kontrolna `5e28a9223a147861`.

> Lekcje L-0192 … L-0210 (19 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0192_L-0210.md](archiwum/lekcje/LEKCJE_L-0192_L-0210.md)
> — przeniesione 2026-10-16, suma kontrolna `d8f50b2b7da9dd9b`.

> Lekcje L-0211 … L-0231 (21 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0211_L-0231.md](archiwum/lekcje/LEKCJE_L-0211_L-0231.md)
> — przeniesione 2026-10-19, suma kontrolna `7649e0938b08d7dd`.

> Lekcje L-0232 … L-0240 (9 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0232_L-0240.md](archiwum/lekcje/LEKCJE_L-0232_L-0240.md)
> — przeniesione 2026-10-24, suma kontrolna `2b5a6edf2a08c9e4`.

> Lekcje L-0241 … L-0246 (6 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0241_L-0246.md](archiwum/lekcje/LEKCJE_L-0241_L-0246.md)
> — przeniesione 2026-10-25, suma kontrolna `521f8d24d3980479`.

> Lekcje L-0247 … L-0260 (14 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0247_L-0260.md](archiwum/lekcje/LEKCJE_L-0247_L-0260.md)
> — przeniesione 2026-10-26, suma kontrolna `68ceb57e2928eb09`.

> Lekcje L-0261 … L-0272 (12 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0261_L-0272.md](archiwum/lekcje/LEKCJE_L-0261_L-0272.md)
> — przeniesione 2026-10-28, suma kontrolna `502b70c5fa79d163`.

### L-0273 — Reguła wołająca Bash w świeżej sesji `claude -p`: bez `--allowedTools` dowód mówi „nie wiem” · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E3, punkt „podpowiedź w świeżej sesji”. Pierwszy przebieg
  `claude -p "kontynuujemy pracę"` wykonał regułę z `CLAUDE.md` i cztery razy wołał
  `release-hint.js`. Każde wywołanie dostało odmowę uprawnień, a sesja napisała uczciwie, że
  gotowości nie zna. Drugi przebieg z `--allowedTools "Bash(node core/tools/release-hint.js)"` dał
  zdanie z liczbą z raportu (12 plików). L-0263 („najpierw `permission_denied`”) mówiło o tym
  wcześniej — zastosowane dopiero po przebiegu, a nie w jego projekcie.
- **Zasada:** pomiar reguły w świeżej sesji niesie w wywołaniu `--allowedTools` dla każdego
  polecenia, które reguła ma uruchomić, wypisanego dosłownie. Transkrypt czytasz najpierw pod
  kątem `permission_denied`, dopiero potem treść odpowiedzi.

### L-0274 — Worktree pomiarowy na Windowsie: checkout zmienia bajty, nazwa folderu zmienia dane · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E4, dane filmu liczone w `git worktree` commitu-kotwicy. Pierwszy
  przebieg: testy rdzenia w worktree 524/526 — dwa testy parzystości skilli Codeksa liczą sumy
  na LF, a checkout z `core.autocrlf=true` (domyślne Git for Windows) dał CRLF. Drugi przebieg:
  `sceny.json` dostał ścieżkę wznowienia `relai-film-dane-<hash>-<pid>-<czas>.md`, bo slug pliku
  wznowienia bierze się z nazwy folderu repo — dane zmieniały się z przebiegu na przebieg.
- **Zasada:** worktree, z którego liczysz dane albo uruchamiasz testy, zakładasz z
  `git -c core.autocrlf=false worktree add`, w folderze o nazwie repozytorium
  (`<tmp>/<unikalny>/<nazwa-repo>`), i sprzątasz krok po kroku (każdy krok osobno w `try`), także
  gdy `add` padnie w połowie. Rozjazd testów rdzenia między drzewem głównym a świeżym checkoutem
  jest znaleziskiem o końcach linii, nie o kodzie.

### L-0275 — Kotwica danych „stanu etapu” nie istnieje w historii: commity są na granicach etapów · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E4. Film pokazuje plan, który go zrobił, a dane przypięte do
  `HEAD` (`b57a132`) dały pasek „E4 GOTOWY DO STARTU” bez punktów — sprzeczny z podpisem sceny
  „Postęp liczy punkty weryfikacji z promptu etapu”. Żaden commit nie ma etapu `W TOKU`, bo
  commity powstają przy zamknięciu etapów.
- **Zasada:** gdy artefakt pokazuje stan pracy w toku, kotwicą jest commit pośredni zrobiony
  w trakcie etapu, za zgodą człowieka, po odhaczeniu tego, co już przeszło. Kadr sceny
  oglądasz na danych z kotwicy, zanim wybierzesz kotwicę — nie po renderze.

### L-0276 — `sed -i` „tylko w komentarzu” to też złamanie reguły · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E4: podmiana pierwszej linii komentarza w `ScenaKomend.tsx` przez
  `sed -i`, mimo zasady 5 („`sed` tylko do odczytu”). Wynik był poprawny, a reguła złamana —
  ten sam mechanizm co w L-0262 („to tylko liczby”).
- **Zasada:** każda zmiana pliku z kodem idzie przez Edit albo skrypt Write, bez wyjątku na
  komentarz, jedną linię czy oczywistą podmianę; `sed` w powłoce wyłącznie do odczytu.

### L-0277 — Kontrola numeru wersji po całym pliku czerwieni historię · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E5, pierwsze wydanie przez raport. Po podbiciu 3.3.0 → 3.4.0
  kontrola `stary-numer` w trybie `--wydanie` dała czerwień na siedmiu plikach, a każde trafienie
  było zapisem przeszłości („od 3.3.0 `/relai-security`”, „W 3.3.0 dochodzi”, przykłady
  w komentarzach). Kontrola pisana w E1 nie przeszła ani jednego realnego podbicia, więc nikt nie
  widział, że czerwień wraca przy każdym wydaniu i blokuje tag.
- **Zasada:** kontrola „stary tekst nie może zostać” rozróżnia deklarację stanu od zapisu
  przeszłości zamkniętą listą słów tuż przed wartością (`od`, `po`, `w`, `since`…), z testem obu
  stron i mutacją listy. Taka kontrola przed oddaniem przechodzi jedno realne podbicie na kopii
  drzewa, nie tylko fixturę.

### L-0278 — Lekcja o mechanizmie obejmuje kod sprzed niej: szukasz wszystkich miejsc, które robią to samo · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E5. Bramka `pre-push` odrzuciła tag `v3.4.0`: w drzewie tagu nie
  przeszły 2 testy rdzenia i 2 testy strony. `release-check.js --rev` (E1–E3) zakładał
  `git worktree` z `core.autocrlf=true`, więc pliki dostały CRLF. Lekcja L-0274 z E4 mówiła już
  „worktree z `-c core.autocrlf=false`”, ale poprawiono tylko kod E4 (kotwica filmu).
- **Zasada:** gdy lekcja nazywa mechanizm (`git worktree add`, checkout, zapis pliku), zaraz po
  niej `grep` po całym repozytorium za każdym miejscem, które go używa, i każde trafienie
  poprawiasz albo opisujesz jako wyjątek. Lekcja poprawiona w jednym miejscu zostawia ten sam
  błąd w narzędziu, które ją poprzedza.

### L-0279 — „Nie uruchamiasz drugi raz” obejmuje przebieg z wyjściem wyrzuconym · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E5. Komenda `/relai-release` zakazuje drugiego przebiegu raportu
  i pisania go do pliku. Mimo to puściłem pełny raport z wyjściem do `/dev/null` przed szybkim:
  ~150 s straty, a wynik i tak nie był potrzebny.
- **Zasada:** zakaz powtórki dotyczy każdego przebiegu tego samego narzędzia, także „w tle” czy
  bez wyjścia. Potrzebny wynik czytasz z pierwszego przebiegu, a inny tryb (`--szybko`) uruchamiasz
  dopiero wtedy, gdy pierwszy nie wystarcza.

### L-0280 — Strona wskazująca zasoby wydania wdraża się po wydaniu, nie przed · 2026-10-26 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E5. Odtwarzacz filmu na stronie wskazywał zasoby `v3.4.0`, a push
  `main` od razu uruchamia wdrożenie strony (`strona.yml`). Kolejność z komendy („push main,
  potem tag”, wydanie GitHub na końcu) dałaby kilka minut 404 w odtwarzaczu.
- **Zasada:** gdy commit wydania zmienia adres na zasób, który powstaje dopiero z wydaniem,
  kolejność jest taka: push tagu (bramka), wydanie GitHub z zasobami i sprawdzenie ich sum,
  dopiero potem push `main`. Odstępstwo od kolejności komendy pada w pytaniu o zgodę, z powodem.

### L-0281 — Punkt „plik znika” pod `.claude/` nie jest mierzalny w `claude -p` · 2026-10-26 · AKTYWNA

- **Trigger:** ZGLOSZENIA E2. Prompt etapu kazał zmierzyć w sesji `-p`, że po „tak” plik
  wznowienia znika. Badana sesja wydała poprawne `rm`, ale harness odrzucił je jako zapis pod
  chronionym `.claude/` — z `--allowedTools Bash` i z dosłownym `Bash(rm:*)`. Punkt Weryfikacji
  nie przeszedł z powodu instrumentu, nie reguły, i trafił do bramki manualnej.
- **Zasada:** punkt Weryfikacji, który wymaga zapisu albo skasowania pod `.claude/` przez badaną
  sesję `-p`, autor promptu formułuje jako polecenie w transkrypcie (`rm` sam `.md`), a stan pliku
  przenosi do pomiaru interaktywnego albo bramki manualnej już w prompcie (P-014, dopisek).

### L-0282 — „Rośnie z szerokością” przez próg wspólnej karty: liczba kolumn spada · 2026-10-26 · AKTYWNA

- **Trigger:** ZGLOSZENIA E3. Prompt kazał sprawdzić, że liczba kolumn siatki terminala rośnie
  przy 31, 75, 94 i 120 kolumnach. Test policzył 1, 3, 2, 3: od 90 kolumn (`BAR.narrow`) wspólna
  karta stawia etykietę i koszt obok środka i zabiera mu 31 komórek, więc przy 94 zostaje mniej
  miejsca niż przy 75. Łukasz rozstrzygnął: kolumny rosną w obrębie układu.
- **Zasada:** autor promptu, który pisze o zależności miary od szerokości, liczy tę miarę wzorem
  układu przy każdej szerokości z listy, zanim napisze „rośnie”. Szerokości po obu stronach progu
  układu (`narrow`) wpisuje osobno albo zdanie dzieli na układy (rozszerza L-0254).

### L-0283 — Pomiar terminala z PowerShellem `Bypass`: klasyfikator pyta, jedna sesja niesie przed i po · 2026-10-26 · AKTYWNA

- **Trigger:** ZGLOSZENIA E3. Skrypt `conhost.exe` z `-ExecutionPolicy Bypass` i `WriteConsoleInput`
  został odrzucony przez klasyfikator trybu auto („Security Weaken”). Przeszedł dopiero po zgodzie
  Łukasza na dokładnie to polecenie. Sam pomiar wyszedł za pierwszym razem: dwie kopie modu pod
  innymi nazwami (`-head`, `-e3`) przez dwa `--plugin-dir`, zainstalowany mod wyłączony flagą
  `--settings`, katalog sesji poza projektem, więc „przed” i „po” na jednym ekranie po jednej turze.
- **Zasada:** pomiar terminala skryptem PowerShell z `Bypass` zapowiadasz człowiekowi przed
  pierwszym uruchomieniem: nazwa skryptu i co robi, jedna zgoda na serię. Wersje „przed” i „po” modu
  stawiasz w jednej sesji jako kopie pod innymi nazwami. Instalację wyłączasz `--settings` z pliku
  w `%TEMP%`, bez edycji `~/.claude/settings.json`. Bez jednej tury z odpowiedzią modelu limity nie
  mają danych i linii `b` nie widać.

### L-0284 — Ręczna symulacja ścieżki modu zgubiła jej krok; komenda modu woła tę samą funkcję · 2026-10-27 · AKTYWNA

- **Trigger:** ZGLOSZENIA E4. „Nowa sesja” z paska cache odtworzyłem ręcznie: `/clear`
  i „kontynuujemy pracę”. Wyszedł zły tytuł (PANEL_CODEX ze STATE) i zaproponowałem aneks. Łukasz
  zapytał, czy przycisk nie robi czegoś więcej. Kod `cache-keeper/hooks/register.tsx` pokazał
  pominięty krok synchronizacji dokumentów. Komenda modu `/handoff` woła tę samą funkcję
  (`startHandoff`) co przycisk i nie czeka na wygaśnięcie cache. Pomiar nią w projekcie testowym
  wskazał prawdziwą przyczynę (L-0285), inną niż ta z symulacji.
- **Zasada:** zanim odtworzysz ścieżkę przycisku modu ręcznie, czytasz jej kod. Jest komenda,
  która woła tę samą funkcję — mierzysz nią. Pomiar, który pisze dokumenty projektu, robisz
  w projekcie testowym w `%TEMP%` z gitem, nie w repo w trakcie etapu. Wynik symulacji nie jest
  podstawą aneksu.

### L-0285 — Warunek na polu payloadu hooka sprawdzony w jednym scenariuszu; po `/clear` pole kłamie · 2026-10-27 · AKTYWNA

- **Trigger:** ZGLOSZENIA E4. W sondzie desktopu od drugiego promptu payload `UserPromptSubmit`
  niósł `session_title`, więc hook dostał warunek „sesja ma tytuł → cisza”. Po `/clear` z paska
  cache aplikacja przenosi tytuł starej rozmowy do nowego transkryptu (rekord `custom-title`
  w linii 1, przed promptem). Pierwszy prompt nowej sesji miał więc `session_title` i hook milczał
  dokładnie w scenariuszu zgłoszenia #1.
- **Zasada:** pole payloadu cudzego narzędzia, na którym stawiasz warunek, sprawdzasz w każdym
  scenariuszu z listy sondy (świeża sesja, po `/clear`, wznowiona), zanim powstanie kod. Stan
  „pierwszy” czytasz ze źródła, które go zapisuje (transkrypt sesji), a nie z pola, które go tylko
  sugeruje. Zbiór linii, które nie są promptem człowieka, jest zamkniętą listą opakowań
  systemowych, nie prefiksem „<”.

### L-0286 — Instrukcja pomiaru bramki nie ustawiła jej warunku; trzy przebiegi człowieka na nic · 2026-10-27 · AKTYWNA

- **Trigger:** ZGLOSZENIA E5. Bramka E4 brzmiała „z aktywnym fokusem”. Moja instrukcja dla
  Łukasza zaczynała się od „wykonaj etap PROBA E2”, ale fokus ustawia tylko prompt ze ścieżką
  `docs/plany/<PLAN>/PROMPT_ETAP_N.md` albo „Zmień”. Trzy przebiegi dały tytuł „Kontynuuj”
  i dopiero transkrypty pokazały, że w projekcie nie było ani jednego pliku fokusu. Ta sama
  instrukcja miała zbędny krok „w nowej sesji napisz kontynuuj”, a „Wyczyść i kontynuuj” sam
  wysyła pierwszy prompt. Do tego przycisku „Nowa sesja” w świeżej sesji nie ma — pokazuje się
  dopiero przy opłacalnym przekazaniu.
- **Zasada:** instrukcja pomiaru dla człowieka ustawia każdy warunek z brzmienia bramki tym
  mechanizmem, który go tworzy (kod, nie nazwa kroku), a przed pierwszym przebiegiem sprawdzasz
  warunek plikiem albo stanem (tu: `.claude/relai/fokus/<sesja>.json`). Nie dopisujesz kroków,
  które przepływ robi sam, i sprawdzasz w kodzie, kiedy element interfejsu z instrukcji w ogóle
  się pokazuje. Kontrola pozytywna instrumentu (hook z podłożonym warunkiem) idzie przed prośbą
  o powtórkę.

### L-0287 — Dwie kontrole raportu przeczą sobie dopiero przy pierwszym podbiciu po zmianie jednej z nich · 2026-10-27 · AKTYWNA

- **Trigger:** ZGLOSZENIA E5. Kontrola `strona-film` (PIPELINE_WYDAN E5) wymaga w odtwarzaczu
  adresu zasobów `v<wersja filmu>`, a `stary-numer` (Aneks A tamtego planu) w trybie `--wydanie`
  czerwieni każdy numer bazy. Przy 3.4.0 wersja filmu była równa wydawanej, więc obie milczały.
  Pierwsze wydanie bez nowego renderu (3.5.0) dało czerwień, której nie dało się naprawić
  w treści — bramka `pre-push` odmówiłaby tagu. Fikstura testów miała film w wersji bazy i nie
  miała scenariusza podbicia z tym samym filmem.
- **Zasada:** nowa kontrola, która wymaga w treści numeru wersji, dostaje test razem z kontrolą
  starego numeru na scenariuszu „następne wydanie bez zmiany tego numeru”. Konflikt dwóch
  kontroli to defekt instrumentu: poprawka w kontroli z testem, nie przepisanie treści ani
  obejście.

### L-0288 — Atrapa cudzego CLI zapisywała zawsze; prawdziwe odmawia, gdy stan już jest · 2026-10-27 · AKTYWNA

- **Trigger:** ZASIEG_PLUGINU E2. Fałszywe CLI w testach `relai-scope` (E1) przy każdym
  `enable` zapisywało klucz. Prawdziwe `claude plugin enable --scope local` (2.1.304) przy
  pluginie włączonym globalnie i braku klucza lokalnego kończy się kodem 1 („already enabled at
  local scope”) i nic nie zapisuje. E1 zmierzył CLI tylko przy globalnym `false`, a `status` nic
  nie zapisuje — 17 zielonych testów, a `on` i pierwszy krok `apply` nie działały na maszynie
  właściciela. Wyszło dopiero przy pomiarze polecenia z procedury w E2.
- **Zasada:** atrapa cudzego CLI powtarza jego odmowy, nie tylko zapisy. Zanim powstaną testy,
  każdą operację zapisu puszczasz raz na prawdziwym CLI w każdym stanie wyjściowym, który
  narzędzie obsłuży (tu: globalnie `true` i `false`, z kluczem lokalnym i bez), w folderze
  tymczasowym. Wynik — kod i komunikat — wchodzi do atrapy dosłownie.

### L-0289 — Przycisk modu na desktopie klika człowiek; stan pośredni zostaje tylko na zrzucie · 2026-10-27 · AKTYWNA

- **Trigger:** ZASIEG_PLUGINU E3. Pomiar wiersza „RelAI w tym projekcie” wymagał sesji w folderze
  tymczasowym i kliknięć w panelu. Sterowanie pulpitem odmawia okna aplikacji Claude („cannot be
  granted control of its own window”), a sesja desktopu nie bierze `--settings` ani
  `--plugin-dir`. Działało: kopia modu pod inną nazwą w `~/.claude/dev-mods/<sesja>/` z przemianowanym
  panelem, komendą i kluczem stanu, sesja przeniesiona do folderu testowego narzędziem zmiany katalogu
  (mod czyta `cwd` sesji), kliknięcia i zrzuty od Łukasza. Łukasz kliknął Włącz i Wyłącz jednym
  ciągiem, więc „cztery `true`” po Włącz poświadcza tylko zrzut, nie odczyt pliku.
- **Zasada:** pomiar przycisku modu na desktopie planujesz z człowiekiem jako wykonawcą kliknięć.
  Instrukcja dzieli serię na kroki z przerwą: po każdym kliknięciu zmieniającym stan człowiek
  pisze „dalej”, a ty czytasz plik, zanim padnie następne kliknięcie. Zainstalowanego modu nie
  wyłączysz na desktopie — kopia nie spotyka się z nim, gdy panel, komenda i stan mają inne nazwy.

### L-0290 — Powtórka L-0198: kod testu z `\\` dopisany heredokiem stracił backslash · 2026-10-27 · AKTYWNA

- **Trigger:** ZASIEG_PLUGINU E3. Testy wiersza dopisałem do `cockpit.test.ts` przez `cat >>`
  z heredokiem. Ścieżka `'C:\\Users\\Ktos'` trafiła do pliku jako `'C:\Users\Ktos'`, a test
  „folder domowy” padł. Reguła z zasady aktywnej 5 („dopisanie na końcu (`cat >>` z heredokiem)”)
  istniała. Złamałem ją, bo dopisek był „tylko testem”.
- **Zasada:** bez zmian względem zasady 5 — kod z ukośnikiem wstecznym, także test i także
  dopisek na końcu, idzie wyłącznie przez Write/Edit. Czerwony test z dziwną ścieżką sprawdzasz
  najpierw `grep`-em bajtów pliku, zanim dotkniesz kodu.

### L-0291 — Powtórka L-0253: migawka sumami przed zapisem w plikach użytkownika nie pozwala rozłożyć różnicy · 2026-10-28 · AKTYWNA

- **Trigger:** ZASIEG_PLUGINU E4, bramka `apply → undo → apply` na prawdziwym HOME. Migawka
  przed `apply` trzymała same sumy 31 plików. Po `undo` 5 plików miało inne sumy. W czterech
  plikach lokalnych przyczynę dało się odczytać z treści (pusty `"enabledPlugins": {}`).
  W `~/.claude/settings.json` nie dało się już ustalić, co poza wartościami RelAI się zmieniło:
  kopii nie było, a najbliższa kopia zapasowa miała zmiany człowieka z innego dnia.
- **Zasada:** bez zmian względem zasady 13 („kopia plików użytkownika przed pomiarem, który
  w nich pisze”). Migawka przed zapisem w plikach człowieka to **kopia plików** do folderu
  pomiaru, a nie same sumy. Sumy służą do szybkiego porównania, kopia do wyjaśnienia różnicy.

### L-0292 — Polecenie z README działało przed przełączeniem i padło po nim: mierz w każdym stanie, który samo wytwarza · 2026-10-28 · AKTYWNA

- **Trigger:** ZASIEG_PLUGINU E4. Wiersz README
  `((claude plugin list --json | ConvertFrom-Json) | Where-Object id -eq 'relai@relai').installPath`
  zmierzyłem dosłownie przed `apply` — działał. Po przełączeniu maszyny CLI wypisuje
  `relai@relai` raz na zakres (user + każdy projekt z lokalnym `true`). `.installPath` skleił
  trzy ścieżki i `node` padł kodem 1. Wydanie 3.6.0 wyszło z tym wierszem (P-059).
- **Zasada:** polecenie w dokumencie użytkownika mierzysz w każdym stanie, który samo wytwarza
  albo na który przełącza: przed zmianą i po niej. Zwłaszcza gdy czyta wynik narzędzia, którego
  kształt zależy od tego stanu (lista pluginów, zakresy). Pomiar „przed” nie wystarcza dla
  polecenia, które człowiek uruchomi też „po”.

### L-0293 — Powtórka L-0290: test z napisami `\n` dopisany heredokiem · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E1. Test parsera „Aktywny plan” dopisałem do
  `session-signals.test.js` przez `cat >> … <<'EOF'`, a jego fixtury niosą napisy z `\n`.
  Heredok z cudzysłowem zachował bajty i test przeszedł, ale reguła z zasady 5 zakazuje tej drogi
  bez wyjątku („przeszło testy” nie zwalnia). Dwa kolejne testy etapu poszły już przez Edit i Write.
- **Zasada:** bez zmian względem zasady 5. Dopisanie testu na końcu pliku to też edycja kodu
  z napisem `\n`: Edit z kotwicą na ostatnim teście albo Write całego nowego pliku.

### L-0294 — Zainstalowany plugin odtwarza stan, który naprawia kod z repo · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E1. Sesja B z `--plugin-dir` skasowała w projekcie stare kopie
  `rodziny/claude.md` i `openai.md`. Potem w sesji etapu wczytałem skill `relai-planning`
  z zainstalowanego 3.6.0, a jego hook po wywołaniu skilla skopiował obie stare kopie z powrotem.
  Stan katalogu przeczył pomiarowi sprzed kilku minut.
- **Zasada:** sprzątanie, które robi kod z repo, odtworzy każdy hook zainstalowanej wersji
  w tej samej maszynie. Stan pliku po naprawie mierzysz w sesji z wyłączoną instalacją
  (`--settings` z `enabledPlugins: false`), a w dokumentach piszesz, że do wydania stara
  kopia wraca przy każdym starcie i każdym wywołaniu skilla.

### L-0295 — Liczba z analizy sprawdzona instrumentem ujawniła definicję, której prompt nie podał · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E1. Prompt definiował rozmiar kontekstu jako sumę trzech pól
  wejścia. Pierwsze wywołanie zgadzało się co do tokena, koniec tury nie (120 021 zamiast
  122 268). Liczby ANALIZY to wejście ostatniego wywołania **plus jego `output_tokens`**.
  Zgodność na czterech sesjach dała dopiero ta definicja.
- **Zasada:** kontrola pozytywna instrumentu na liczbach z dokumentu sprawdza też definicję. Gdy
  liczba nie wychodzi, najpierw szukasz składnika, który dokument dodał po cichu (sonda: wszystkie
  pola na wywołanie), zanim uznasz liczbę albo kod za błędne. Definicję zapisujesz w nagłówku
  narzędzia razem ze źródłem liczb.

### L-0296 — Wyjście polecenia ponad ~30 tys. znaków model dostaje jako 2 KB podglądu · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E2. Skrót startu na tym repo ma 55 KB. W sesji `claude -p`
  harness zapisał wyjście `start-digest.js` do pliku `tool-results` i pokazał modelowi 2 KB
  podglądu. Model doczytał plik kawałkami (`Read` z `limit`, `Grep`, `Read` z `offset`), razem
  ok. 14 KB, bez „Zasad aktywnych”. Pomiar kontekstu wyszedł niższy, niż kosztowałby pełny odczyt.
- **Zasada:** narzędzie, którego wyjście model ma przeczytać w całości, mieści się w limicie
  wyjścia polecenia (Claude Code: ok. 30 tys. znaków) albo stawia treść obowiązkową na początku.
  Pomiar „po” mówi, ile wyjścia trafiło do kontekstu (wyniki narzędzi z transkryptu), a nie tylko
  że polecenie padło.

### L-0297 — `git status` milczał o pięciu plikach z CRLF na dysku przy LF w indeksie · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E2. Kontrola pozytywna dowodu negatywnego (`git diff --stat` od
  bazy na `core/process/`) pokazała ok. 1900 zmienionych linii przy kilkudziesięciu realnych.
  `session-signals.js`, `CLAUDE.md`, `AGENTS.md`, `SPEC_CLAUDE_MD.md` i `SPEC_USTAWIENIA.md`
  miały na dysku CRLF przy LF w indeksie i w HEAD. Na starcie sesji `git status` ich nie pokazywał
  — pamięć stat uznała je za nietknięte do pierwszego zapisu.
- **Zasada:** przed commitem i przed liczeniem diffu sprawdzasz końce linii zmienionych plików
  (`git ls-files --eol`). `w/crlf` przy `i/lf` normalizujesz do LF skryptem pisanym Write, zanim
  liczba z `git diff --stat` trafi do wpisu. Wynik `--ignore-cr-at-eol` jest kontrolą, nie wynikiem.

### L-0298 — `cd` do worktree w poleceniu Bash przestawił katalog roboczy sesji · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E2. Polecenie `cd <worktree> && node --test …` uruchomione
  w powłoce sesji zmieniło jej katalog roboczy. Harness ogłosił worktree głównym katalogiem
  i kazał nie wracać do repo, więc następne polecenie musiało wrócić ścieżką bezwzględną.
- **Zasada:** w worktree pomiarowym pracujesz podpowłoką `( cd … && … )` albo `git -C` / ścieżkami
  bezwzględnymi; gołego `cd` do innego drzewa w sesji etapu nie używasz.

### L-0299 — instrument tury liczył lokalną komendę `/model` jako polecenie człowieka · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E3, pomiar bramki na żywo. `core/tools/start-context.js` dał „brak
  danych” dla końca 1. tury w sześciu z siedmiu sesji: wpis `<command-name>/model</command-name>`
  przed promptem przesunął licznik poleceń, więc cała tura wypadła poza „turę 1”.
- **Zasada:** filtr „to nie polecenie człowieka” obejmuje lokalne komendy (`<command-name>`,
  `<local-command-stdout>`, `<local-command-caveat>`); „brak danych” przy istniejącym pierwszym
  wywołaniu to najpierw defekt instrumentu, nie brak tury.

### L-0300 — `/model` w sesji pomiarowej zmienił domyślny model człowieka i model pomiaru · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E3. Instrukcja dla człowieka podała `claude --model opus`, ale nie
  zakazała `/model`. Człowiek przełączył sześć sesji na Sonnet 5.5, a Claude Code zapisał go jako
  domyślny model nowych sesji (`~/.claude/settings.json`, `"model": "sonnet"`). Liczby stały się
  porównywalne tylko między sobą, nie z „przed” zmierzonym na Opusie.
- **Zasada:** instrukcja pomiaru dla człowieka mówi wprost, czego w sesji nie robić (`/model`,
  `/config`), a analiza najpierw wypisuje model każdej sesji z transkryptu (`message.model`), zanim
  zestawi liczby; zmiana ustawień użytkownika przez sesję pomiarową idzie do raportu jako uwaga.

### L-0301 — sesja „przed” na słabszym modelu pominęła procedurę i wyszła tańsza · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E3. Stara bramka, „tak” + „model sesji”, Sonnet 5.5: sesja nie
  przeczytała `relai-prompt.md`, nie oznaczyła dopowiedzeń i zrobiła propozycję z głowy — 51 892
  tokenów wobec 71 256 nowej wersji, która procedurę wykonała w całości.
- **Zasada:** koszt mierzysz tylko na przebiegach zgodnych z procedurą — przed porównaniem liczb
  sprawdzasz w transkrypcie, czy kroki wymagane zaszły (odczyty plików, markery w wyniku);
  przebieg niezgodny opisujesz z nazwy i nie wstawiasz jako „przed”.

### L-0302 — Powtórka L-0298: `cd` do katalogu roboczego w poleceniu Bash przestawił sesję · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E4. Ewaluację uruchomiłem jako `cd .claude/relai/work/… && node
  eval-indeks.js run`, a analizę tym samym wzorcem — katalog roboczy sesji przeszedł do folderu
  etapu i kolejne polecenie trzeba było cofać.
- **Przyczyna:** L-0298 zapamiętana jako „worktree pomiarowy”, a nie jako każdy katalog.
- **Zasada:** w poleceniu Bash nigdy gołe `cd` — skrypt dostaje ścieżkę w argumencie albo
  podpowłokę `( cd … && … )`, w każdym katalogu, nie tylko w worktree. Powtórzenie L-0298 →
  propozycja graduacji do `CLAUDE.md`.

### L-0303 — Ewaluacja wyzwalacza bez sprawdzenia, że materiał dotarł do sesji · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E4. Sześć sesji `claude -p` miało pokazać, czy model doczytuje
  pełną zasadę przy wyzwalaczu z indeksu. Wynik 0/3 i 0/3 — ale we wszystkich sesjach skrót startu
  (34 KB) przyszedł jako podgląd 2 190 znaków, a indeks stoi na jego końcu: żadna sesja go nie
  widziała.
- **Przyczyna:** zakres etapu stawiał pomiar dostarczenia skrótu (punkt 6) po ewaluacji (punkt 5),
  a skrypt ewaluacji nie sprawdzał, czy wynik `start-digest.js` przyszedł w całości.
- **Zasada:** ewaluacja zachowania wywołanego treścią wstrzykniętą zaczyna się od asercji
  dostarczenia — w transkrypcie wynik narzędzia niesie mierzony fragment (np. pierwszą linię
  indeksu), inaczej przebieg to „nie zmierzono”, nie 0/3. Pomiar dostarczenia idzie przed
  pomiarem zachowania.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
