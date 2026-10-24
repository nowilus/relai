# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

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
   punktu, nie dopasowaniem kodu (L-0254).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. (L-0002, L-0022, L-0059)
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
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262 — „przeszło testy” nie zwalnia z reguły; `sed`
     tylko do odczytu); ścieżka w powłoce z `/`, także składana ze zmiennych
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
     1,00 : 1 na całej linii to najpierw instrument (L-0213); wzorzec polskiego słowa bierze rdzeń
     sprzed oboczności (`piętna[sś]`) i ma kontrolę na każdej formie z repo (L-0261).
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
     ekran z bufora z atrybutami, skrypty PowerShell w `%TEMP%` (L-0259).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265)
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
      zmiennego cwd, test w podfolderze (L-0146); przypadek błędu najpierw na samym narzędziu
      (bez zapisu), kopia plików użytkownika przed pomiarem, który w nich pisze, odpowiedź
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
      liczysz w transkrypcie na dysku, nie w stream-json (L-0263).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264)
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

### L-0241 — Telefon oddalił widok, bo ekran laptopa wystawał z przepływu przed `tryb-3d` · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E6, telefon. Płótno miało 1156 × 2502 przy oknie 390 × 844. Budowa
  sceny ustawiała ekran laptopa na 1136 px, zanim strona przeszła w tryb 3D. W przepływie ekran
  wystawał poza stronę, mobilny Chrome oddalał widok, a scena mierzyła okno 1156 px.
- **Zasada:** klasa trybu, która wyjmuje element z przepływu, wchodzi **przed** zmianą jego
  rozmiaru. Pierwsza asercja na telefonie to `innerWidth` i `scrollWidth` równe szerokości
  emulacji. Pomiar na telefonie zawsze z `mobile: true`, bo bez tego Chrome nie oddala widoku
  i usterki nie widać.

### L-0242 — Skrypt edycji generatora z backtickami poszedł heredokiem (powtórzenie L-0210, L-0215) · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8. Przenosiny stron w `site/narzedzia/zbuduj.mjs` zrobiłem skryptem
  podanym przez heredok, a skrypt niósł szablony z backtickami. Wynik przeszedł `node --check`
  i testy, ale reguła z `CLAUDE.md` i zasady 5 była złamana.
- **Zasada:** skrypt z backtickiem, `\n` albo ścieżką powstaje narzędziem Write w katalogu
  roboczym, potem `node <plik>`. „Przeszło testy” nie zwalnia z reguły: kontrola po fakcie łapie
  tylko te przekłamania, które psują składnię.

### L-0243 — Edit zjadł spację przed atrybutem i test tego nie zauważył · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8. Po podmianie `href` w obu szablonach wyszło
  `href="./pl/"hreflang="pl"`. Przeglądarka to toleruje, a test sprawdzał tylko wartość `href`.
  Złapał to dopiero dowód negatywny (`diff` HTML przed i po).
- **Zasada:** test atrybutu kotwiczy też sąsiada (`" hreflang=`), nie samą wartość. Po Edit
  w szablonie HTML robisz `diff` wygenerowanej strony przed i po, nie tylko testy.

### L-0244 — Pages „włączone” w interfejsie, a API mówi „Not Found” · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8. Łukasz ustawił w interfejsie źródło GitHub Actions. Pierwszy
  przebieg `strona.yml` padł na `configure-pages`: „Not Found”. Strona nie istniała, dopóki nie
  poszło `gh api -X POST repos/nowilus/relai/pages -f build_type=workflow` (za zgodą Łukasza).
- **Zasada:** stan ustawienia repozytorium sprawdzasz `gh api repos/<repo>/pages`, zanim
  uruchomisz pierwsze wdrożenie. Zrzut ekranu ustawień ani słowo człowieka nie są dowodem
  (zasada 13). Procedura jest w P-005.

### L-0245 — Tally przyciął okładkę do pasa 8 : 1 i trzymał starą pod tym samym adresem · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8, ankieta. Okładka 3 : 1 wyszła w formularzu jako wąski pas bez
  pinezek. Okładka 2400 × 300 była już dobra, ale Tally pokazywał poprzednią, aż do zmiany adresu
  na `naglowek.png?v=2` i ponownej publikacji.
- **Zasada:** obraz dla cudzej usługi renderujesz w proporcji, którą usługa pokazuje, zmierzonej
  na opublikowanym formularzu. Każda podmiana obrazu dostaje nowy adres. Wynik oglądasz w formularzu
  publicznym, nie w edytorze.

### L-0246 — Ukryty panel i `scrollIntoView` na przypiętych sekcjach sfałszowały pomiar stopki · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8, warianty stopki. Panel przeglądarki aplikacji był ukryty i dawał
  wąskie okno. `scrollIntoView` na sekcjach Filmu z przytrzymaniem przewijania lądował w środku
  animacji, więc stopka „stała” gdzie indziej niż u odwiedzającego.
- **Zasada:** kadry i pomiary układu robisz w Chrome bez okna o zadanym rozmiarze (CDP), nie
  w ukrytym panelu (L-0214). Do końca strony z przypiętymi sekcjami dochodzisz pętlą `scrollTo`
  do ustalenia `scrollY`, nie `scrollIntoView`.

### L-0247 — Górny pas ekranu CSS3D był malowany, ale nie trafiany; „Wróć do biurka” otwierało szufladę · 2026-10-18 · AKTYWNA

- **Trigger:** STRONA_RELAI E8, zgłoszenie Łukasza ze zrzutem. W przybliżeniu klik w „Wróć do
  biurka” otwierał dialog szuflady laptopa. Błąd był od E6, na obu buildach. `elementsFromPoint`
  w punkcie przycisku nie zwracał `.ekran`, tylko płótno sceny. Raycaster szuflad brał klik
  dla siebie. Pięć punktów `elementFromPoint` z E3 tego pasa nie obejmowało.
- **Zasada:** warstwę HTML w transformacji 3D sprawdzasz `elementsFromPoint` w siatce punktów
  po całej powierzchni, w każdym stanie kamery, z kontrolą punktu poza nią. Klik w stanie
  modalnym (przybliżenie) rozstrzyga jeden słuchacz w fazie przechwytywania, zanim dojdzie do
  słuchaczy sceny. Dowód poprawki: prawdziwy klik myszą przez CDP na buildzie przed i po.

### L-0248 — Asymetrię kadrów pokazywał mój własny zrzut, a zauważył ją Łukasz · 2026-10-19 · AKTYWNA

- **Trigger:** BIURKO_PLAKAT. Kadr miał `aspect-ratio` i `max-height`, a szerokość `auto`. Ponad
  ok. 1600 px ograniczenie wysokości przechodziło przez proporcję i zwężało kadr: 72 px z lewej,
  195 z prawej. Mój zrzut 1920 to pokazywał (kadr kończył się na 1725 px), a ja oceniłem go na oko.
  Kontrola przez wstrzyknięty arkusz stylów nie odtworzyła błędu, dopiero styl wpisany w element.
- **Zasada:** układ wyśrodkowany sprawdzasz liczbą: lewy i prawy odstęp każdego bloku od krawędzi
  okna w kilku szerokościach, nie zrzutem. Element z `aspect-ratio` i ograniczeniem wysokości
  dostaje jawne `width`. Kontrola musi najpierw odtworzyć błąd; jeśli nie odtwarza, to instrument
  jest zły, a nie poprawka dobra.

### L-0249 — Reguła z `:has()` przebiła siatkę i rozepchnęła telefon do 442 px · 2026-10-19 · AKTYWNA

- **Trigger:** BIURKO_PLAKAT. Reguła `.przystanek:has(.kadr) { display: flex }` miała większą wagę
  niż `.przystanek--instalacja { display: grid }`. Instalacja układała się w rząd i na telefonie
  rozszerzyła obszar układu do 442 px (`innerWidth` 442, `visualViewport` 390). Szukanie elementu
  wystającego poza okno nic nie dało, bo przy 442 px nic nie wystawało.
- **Zasada:** `:has()` liczy się jak klasa, więc reguła wyjątku dla tego samego elementu też
  potrzebuje `:has()` albo innej drogi do większej wagi. Przy przepełnieniu na telefonie
  porównujesz najpierw `innerWidth` z `visualViewport.width`. Przyczynę znajdujesz bisekcją:
  wyłączasz po kolei swoje zmiany regułą wstrzykniętą przed ładowaniem (L-0241).

### L-0250 — Gest dotykowy z CDP nie przewijał niczego, a ja uznałem pomiar za zaliczony · 2026-10-19 · AKTYWNA

- **Trigger:** MOBILNA_STRONA. `Input.synthesizeScrollGesture` z `gestureSourceType: "touch"`
  wysyłał zdarzenia dotyku, więc moja obsługa swipe'a na Biurku przesuwała przystanki i pomiar
  wyglądał na dobry. Kontrola na starym kodzie pokazała, że ten gest w ogóle nie przewija strony.
  Dopiero `Input.dispatchTouchEvent` (start, ruchy, koniec) przewijał natywnie i odtworzył przelot
  Łukasza (y 0 → 895). Osobno: iPhone Łukasza nie pokazał zmian przez `max-age=600` i stały adres
  `akty.js`, choć serwer miał już nową wersję.
- **Zasada:** pomiar zachowania dotyku zaczynasz od kontroli pozytywnej na starym kodzie: ten sam
  gest musi odtworzyć zgłoszony błąd. Gest bez natywnego przewijania nie jest kontrolą. Gdy człowiek
  „nie widzi różnicy” po wdrożeniu, najpierw porównujesz plik na serwerze z kodem, potem prosisz o
  kartę prywatną.

### L-0251 — Testy z wyrażeniami regularnymi dopisane heredokiem w powłoce · 2026-10-19 · AKTYWNA

- **Trigger:** MOBILNA_STRONA. Dwa razy dopisałem do `*.test.mjs` bloki z `\.` i `\{` przez
  `cat >> … <<'EOF'`. Treść przeszła nienaruszona, ale to złamanie reguły z CLAUDE.md (L-0116,
  L-0119). W tej samej sesji poprawka przez `node -e` zjadła backticki w szablonie skryptu
  pomiarowego i musiałem ją powtórzyć narzędziem Edit.
- **Zasada:** tekst z backslashem albo backtickiem idzie wyłącznie przez Write/Edit, także dopisek
  na końcu pliku i także w pliku roboczym. Heredok w apostrofach nie jest wyjątkiem.

### L-0252 — Skrypt rotacji lekcji ciął po `NaN` i dokleił odsyłacz na początek pliku · 2026-10-19 · AKTYWNA

- **Trigger:** rotacja dokumentów. Skrypt roboczy liczył granice cięcia z pola `od`, którego
  obiekty lekcji nie miały. `slice(0, NaN)` dało pusty początek, `slice(NaN)` cały plik, więc
  odsyłacz trafił nad nagłówek, a plik urósł zamiast zmaleć. Kontrola sum fazy 1 przeszła, bo
  liczyła fragment z tekstów lekcji, nie z pozycji cięcia.
- **Zasada:** skrypt, który przycina żywy dokument, sprawdza granice przed zapisem: liczby
  całkowite, wewnątrz właściwej sekcji, koniec za początkiem. Po fazie 2 porównujesz wagę przed
  i po: plik po rotacji ma być mniejszy, inaczej przywracasz go i szukasz błędu.

### L-0253 — „Nieistniejący id” nie dał błędu CLI, tylko wpis w ustawieniach użytkownika, a „Przeładuj” pokazał sukces · 2026-10-23 · AKTYWNA

- **Trigger:** spike E1 planu RELAI_MODS. Prompt etapu zakładał, że błąd CLI wywoła się
  nieistniejącym id. `claude plugin enable nie-ma-takiego@relai-spike` skończył się kodem 0
  i dopisał ten klucz do `enabledPlugins` w `~/.claude/settings.json` Łukasza. Usunąłem go dopiero
  przywróceniem kopii sprzed etapu. Przycisk „Przeładuj” wywołał `$.command.run`, obietnica się
  rozwiązała i panel napisał „Przeładowano”, choć silnik odpowiedział tekstem odmowy. W teście
  `plugin test` trzy z ośmiu testów padły, bo atrapa nie znała `session.cwd`, `clock.now`
  i ścieżek z `/`. Wynik wyglądał jak pusty panel modu.
- **Zasada:** przypadek błędu, którym Weryfikacja sprawdza obsługę błędów, uruchamiasz najpierw na
  samym narzędziu. Na żywo idzie dopiero wtedy, gdy zwraca błąd i niczego nie zapisuje. Do pomiaru,
  który pisze w plikach użytkownika, robisz kopię przed pierwszym wywołaniem. Odpowiedź API modu
  (`$.command.run`) oceniasz po treści, bo odmowa nie zawsze odrzuca obietnicę. W teście modu atrapa
  odpowiada na każde wywołanie `$` z listy `calls` walidatora, zanim uznasz wynik za błąd modu.

### L-0254 — Fakty w prompcie E2 policzone innym źródłem niż to, które czyta budowany kod · 2026-10-23 · AKTYWNA

- **Trigger:** etap E2 planu RELAI_MODS. Prompt zapisał jako FAKT, że `security-guidance` „nie ma
  wpisu w `enabledPlugins`”, i na tym oparł punkt 4 Weryfikacji. Fakt pochodził z
  `~/.claude/settings.json`, a kod etapu (zgodnie z Aneksem A) czyta stan z pliku scope'u
  instalacji, czyli `Parkly/.claude/settings.local.json`, gdzie wpis `false` jest. Tak samo
  „relai: 3 zdarzenia” policzono z jednego `hooks.json`, a kod sumuje dwa pliki ładowane obok
  siebie (P-013) i daje 6. Punkt 4 dało się spełnić tylko w brzmieniu zmienionym decyzją Łukasza.
- **Zasada:** liczbę albo stan, które prompt etapu zapisuje jako FAKT do sprawdzenia na żywo,
  autor promptu wylicza tym samym źródłem, które ma czytać kod etapu (plik scope'u, suma plików),
  a nie najbliższym plikiem pod ręką. Wykonawca, który trafi na rozjazd, najpierw sprawdza oba
  źródła, potem pyta człowieka o brzmienie punktu, a nie dopasowuje kod do faktu.

### L-0255 — Pasek zmian zbudowany dwa razy na niezmierzonym zachowaniu silnika i dwa razy nie znikał · 2026-10-23 · AKTYWNA

- **Trigger:** etap E3 planu RELAI_MODS. Stan „załadowany” najpierw wziąłem z `$.settings.read()`,
  bo P-052 pkt 4 mówił, że po zapisie CLI zwraca starą wartość. Ten pomiar obejmował tylko chwilę
  zaraz po zapisie, a silnik odświeża migawkę po kilku sekundach. Druga wersja oparła się na zdaniu
  z typów („all if one hooks plugin.register”), że przeładowanie odpali `session.start`. Za pierwszym
  razem zadziałało, bo ładował się świeżo włączony mod, a za drugim nie. Dopiero sonda zapisująca
  do `$.store` każde zdarzenie przy dwóch ręcznych przeładowaniach pokazała stały sygnał:
  `plugin.register` innych modów (P-053).
- **Zasada:** zachowanie cudzego silnika, na którym stoi mechanizm (źródło stanu, sygnał zdarzenia),
  mierzysz sondą zdarzeń przez cały cykl i co najmniej dwa razy, zanim zbudujesz na nim kod.
  Pomiar „zaraz po” nie mówi nic o stanie kilka sekund później, a zdanie z typów to hipoteza do
  sondy. Jeden udany przebieg na żywo nie wystarcza, gdy istnieje druga droga, która mogła dać ten
  sam wynik.

### L-0256 — Test „pasek zniknął” nie widział formy „2 zmiany czekają” · 2026-10-23 · AKTYWNA

- **Trigger:** etap E3 planu RELAI_MODS, mutacja „N liczone z kliknięć”. Test „tam i z powrotem”
  przeszedł mimo zepsutej logiki, bo sprawdzał brak tekstu wzorcem `/czeka na przeładowanie/`,
  a po dwóch kliknięciach panel pisał „2 zmiany czekają na przeładowanie”.
- **Zasada:** test nieobecności tekstu z odmianą liczebnika szuka rdzenia wspólnego wszystkim
  formom (`/na przeładowanie/`). Każdy test „czegoś nie ma” przechodzi przez mutację, która ma go
  wywrócić. Wynik mutacji, w którym nie padł test pisany właśnie dla niej, traktujesz jako defekt
  testu.

### L-0257 — Klik po samej etykiecie „Wyłącz” przełączył cudzy plugin w ustawieniach Łukasza · 2026-10-23 · AKTYWNA

- **Trigger:** etap E3 planu RELAI_MODS, pomiar na żywo. Skrypt UI Automation nacisnął pierwszy
  przycisk o nazwie „Wyłącz” i wyłączył `andrej-karpathy-skills` zamiast `filetree`. `diff`
  z kopią ustawień złapał to od razu i plugin wrócił drugim kliknięciem. W tej samej serii ścieżka
  `"$WW\\$1"` w funkcji powłoki zablokowała rozwinięcie `$1`, więc trzy zrzuty nadpisały jeden plik
  (L-0230).
- **Zasada:** przycisk, który zmienia stan użytkownika, naciskasz po pozycji sprawdzonej na liście
  przycisków (indeks albo klucz wiersza), nigdy po pierwszym trafieniu etykiety. Po każdym kliknięciu
  robisz `diff` z kopią sprzed pomiaru. Nazwy plików w funkcji powłoki składasz z `/`.

### L-0258 — Ucieczka unicode w Edit trafiła do pliku jako niewidoczny znak · 2026-10-24 · AKTYWNA

- **Trigger:** etap E4 planu RELAI_MODS. Ucieczki znaków U+200B (w klasie znaków wyrażenia
  w `narrow.test.ts`) i U+FEFF (we wzorcu BOM w `mods.test.tsx`), zapisane w `new_string`
  narzędzia Edit jako backslash, `u` i cztery cyfry, wylądowały w plikach jako dosłowne znaki.
  Ten sam efekt zaszedł w pierwszej wersji tej lekcji. Testy przechodziły, a znak był niewidoczny
  w czytanym kodzie. Wykrył go dopiero `grep` po bajtach.
- **Zasada:** znak niewidoczny (U+200B, U+FEFF, NBSP) w kodzie zapisujesz wyrażeniem
  `String.fromCharCode(0x…)`, nie ucieczką w literale. Po każdej edycji, która go dotyczy,
  uruchamiasz `grep -c $'\xe2\x80\x8b\|\xef\xbb\xbf'` na zmienionych plikach. Wynik ma być 0.
  Literał z ucieczką już w pliku poprawiasz skryptem pisanym Write, który liczy trafienia przed
  zmianą i po niej.

### L-0259 — Pomiar terminala z Basha sesji: cztery usterki instrumentu, zanim padł pierwszy pomiar · 2026-10-24 · AKTYWNA

- **Trigger:** etap E4 planu RELAI_MODS, punkt „terminal przy 80 kolumnach”. Zanim pomiar ruszył,
  zawiodły cztery rzeczy:
  - `run_in_terminal` nie wysyła klawiszy do działającego TUI;
  - PowerShell z Basha nie czyta skryptu spod `.claude/` (ścieżka wrażliwa harnessu);
  - zwykła konsola w Windows 11 otwiera się w Windows Terminal, który sam zmienia szerokość
    (80 → 120 → 232), a zmaksymalizowanego okna nie da się zwęzić z API (błąd 87);
  - w skrypcie `$CH` i `$ch` to w PowerShellu jedna zmienna.
  Do tego `ctrl+x tab` dawał fokus paskowi `relai-panel`, a nie panelowi kokpitu.
- **Zasada:** terminal mierzysz w `conhost.exe` uruchomionym wprost z `mode con`, z oknem, którego
  nikt nie rusza, a zmienne `CLAUDE*` hosta czyścisz w launcherze. Klawisze wysyłasz przez
  `WriteConsoleInput`, a ekran czytasz z bufora razem z atrybutami, bo pierścień fokusu to
  inwersja tła. Skrypty PowerShell leżą w `%TEMP%` z prefiksem slugu. Każdą nazwę zmiennej
  w PowerShellu traktujesz jako bez wielkości liter. Panel nad promptem dostaje klawiaturę po
  drugim `ctrl+x tab` (P-053), a pierścień sprawdzasz przed każdym Enterem (L-0257).

### L-0260 — Instalacja z marketplace przed publikacją: kolejność promptu niewykonalna · 2026-10-24 · AKTYWNA

- **Trigger:** prompt E5 planu RELAI_MODS kazał najpierw zmierzyć instalację z marketplace (punkt 7),
  a dopiero potem pytać o tag i push (punkt 8). Marketplace `relai` na maszynie Łukasza czyta
  z GitHuba (`nowilus/relai`), więc przed pushem `claude plugin install relai-mods@relai` nie
  znalazłby pluginu. Ten sam pomiar ujawnił dwie usterki kokpitu („2 zdarzeń”, „0 komend · bez
  hooków” przy modzie), których 66 testów nie widziało. Trzeba było więc wydać 0.1.1 tego samego
  dnia.
- **Zasada:** zanim prompt wydania każe mierzyć „instalację z marketplace”, autor sprawdza źródło
  marketplace (`claude plugin marketplace list`). Przy źródle GitHub pomiar stoi **po** bramce
  publikacji, a prompt to mówi. Tańszy pomiar wiersza przed publikacją idzie artefaktem
  podłożonym lokalnie (`--plugin-dir`, zasada 10). Słowo z liczbą w interfejsie dostaje test
  form 1 / 2–4 / 5 / 12 / 22, a nie tylko jednej liczby.

### L-0261 — Wzorzec `piętnast` z Weryfikacji nie widział „piętnaście” · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E1. Punkt 8 Weryfikacji szukał miejsc liczących komendy wzorcem
  `15 komend\|piętnast\|Komendy (15)`. Rdzeń `piętnast` łapie „piętnastu” i „piętnasta”, ale nie
  „piętnaście” ani „Piętnaście” (ś zamiast st). Poszerzony wzorzec `piętna[sś]` znalazł sześć
  miejsc o bieżącej liczbie: README, przewodnik (dwa), instalacja, README Cursora i `STATE.md`.
  Ścisły wzorzec z promptu zwróciłby „czysto” przy nieaktualnych dokumentach.
- **Zasada:** wzorzec słowa po polsku bierze rdzeń sprzed oboczności i klasę liter dla obu form
  (`piętna[sś]`, bez rozróżniania wielkości liter). Autor promptu sprawdza go kontrolą pozytywną na
  każdej formie, która w repo występuje: mianownik, dopełniacz, narzędnik.

### L-0262 — Liczby w generatorze i teście podmienione `sed -i` (powtórzenie L-0242) · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E1. Licznik komend 15 → 16 w `adapters/codex/generate-skills.js`
  i dwa w `generate-skills.test.js` zmieniłem dwoma `sed -i` zamiast trzech Edit. Wynik był
  poprawny (sprawdzony grepem, testy zielone), ale zasada aktywna 5 mówi wprost: seria podmian
  w kodzie — Edit albo skrypt Write, także gdy „to tylko liczby”.
- **Zasada:** bez wyjątku — każda zmiana pliku śledzonego idzie przez Edit/Write. `sed` służy
  wyłącznie do odczytu (`sed -n`). Odruch „krótka podmiana” jest sygnałem, żeby sięgnąć po Edit.

### L-0263 — Dogfooding hooka w `claude -p`: dwie warstwy fałszu, zanim hook w ogóle zagrał · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E2, punkt 8 zakresu. Projekt testowy stał w katalogu roboczym
  `.claude/relai/work/…`, a dwie sesje `claude -p --plugin-dir` dały „0 notek” w obu przypadkach.
  Przyczyna nie leżała w hooku. (1) Harness odrzucił obie edycje (`permission_denied`,
  `safetyCheck`: ścieżka pod `.claude/` jest wrażliwa także przy `acceptEdits`), więc `PostToolUse`
  nie miał czego zobaczyć. Do tego `scan.mjs` pomija `.claude/relai/work`. (2) Po przeniesieniu
  projektu do `%TEMP%` edycja przeszła i skan się odbył (`.security/trivy/` w projekcie), ale
  `--output-format stream-json` nie niesie kontekstu hooków `PostToolUse`. Notka stoi dopiero
  w transkrypcie na dysku `~/.claude/projects/<slug>/<session_id>.jsonl` jako rekordy
  `attachment` `hook_additional_context` i `api-request-blob`.
- **Zasada:** projekt do pomiaru na żywo, w którym model ma pisać, leży poza `.claude/`, w `%TEMP%`
  z nazwą od slugu projektu. Przed liczeniem wyniku sprawdzasz `permission_denied` w transkrypcie.
  Kontekst hooka narzędziowego liczysz w transkrypcie sesji na dysku, nie w stream-json. Cisza
  bez kontroli pozytywnej w tym samym przebiegu nic nie dowodzi (zasada 5).

### L-0264 — 16. komenda złamała testy pluginu panelu, a etap E1 tego nie zobaczył · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E4. Zmiana `argument-hint` w `/relai-security` złamała dwa testy
  `core/panel/tests/commands.test.js`, bo formularz panelu jest przypięty do brzmienia nagłówka.
  `claude plugin test panel` pokazał przy tym 3 błędy (15 wobec 16 wierszy komend, 1185 wobec
  1213 px). Na czystym HEAD w `git worktree` było tak samo (208/3), więc błędy żyły od E1, które
  dodało 16. komendę. Weryfikacja E1–E3 uruchamiała `node --test` trzech pakietów, a nie
  `claude plugin test` modów, które niosą kopię rdzenia panelu.
- **Zasada:** zmiana komendy (nowa komenda, `argument-hint`, opis) albo pliku `core/panel/`
  → po `node core/tools/sync-panel-core.js` idzie `claude plugin test` każdego drzewa z kopią
  rdzenia (`panel`, `progress`, `cache-keeper`, `mods`). Wynik czerwony najpierw sprawdzasz na
  HEAD w `git worktree`, żeby odróżnić błąd zastany od własnego.

### L-0265 — Ścieżka Windows z backslashem w powłoce (powtórzenie L-0230) · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E4. Wrapper `RELAI-validate.cjs` dostał ścieżkę
  `$(cygpath -w "$TEMP")\\relai-e4-empty.json`. Bash zjadł separator i wyszło
  `…\Temprelai-e4-empty.json` (ENOENT). Zasada 5 („ścieżka w powłoce z `/`”) już to mówiła.
- **Zasada:** ścieżkę dla Node w powłoce składasz z `cygpath -m` (ukośniki `/`), nigdy z
  `cygpath -w` i doklejonym `\\`. Pierwszy przebieg narzędzia przyjmującego ścieżkę ma kontrolę
  pozytywną: komunikat ENOENT z posklejaną nazwą to błąd instrumentu, nie wynik.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
