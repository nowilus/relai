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
   punktu, nie dopasowaniem kodu (L-0254); FAKT o lukach „na drzewie X” liczysz regułą kontroli
   z bazą tego drzewa (L-0269). Instrukcja wołająca narzędzie, którego kod wyjścia „wynik
   negatywny” nie jest awarią, mówi, co znaczy każdy kod i gdzie stoi pełny wynik, i zakazuje
   obejść — powtórki, pliku tymczasowego (L-0271); zakaz powtórki obejmuje przebieg z wyjściem
   wyrzuconym (L-0279). Kontrola „stary tekst nie może zostać” odróżnia deklarację stanu od zapisu
   przeszłości zamkniętą listą słów przed wartością i przed oddaniem przechodzi jedno realne
   podbicie, nie tylko fixturę (L-0277).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254, L-0269, L-0271, L-0277,
   L-0279)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. Komenda do wklejenia przez
   człowieka w czacie: pełna ścieżka, bez zmiennych środowiska, na Windowsie w składni PowerShella
   (L-0266). (L-0002, L-0022, L-0059, L-0266)
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
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227, L-0274, L-0275, L-0278)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262 — „przeszło testy” nie zwalnia z reguły; `sed`
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
     ekran z bufora z atrybutami, skrypty PowerShell w `%TEMP%` (L-0259).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265,
   L-0267, L-0268, L-0270)
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
    Bramka rozróżnia „wejście puste” od „wejście nieczytelne” i „wynik bez treści” — dwa ostatnie
    to odmowa z komunikatem, a `catch` bez odmowy to fałszywa zieleń (L-0272).
    (L-0043, L-0045, L-0046, L-0072, L-0272)
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
      liczysz w transkrypcie na dysku, nie w stream-json (L-0263); pomiar reguły w `claude -p`
      niesie `--allowedTools` dla każdego polecenia, które reguła uruchamia, dosłownie (L-0273).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245); strona wskazująca zasób
      wydania wdraża się po wydaniu — push tagu, wydanie z zasobami i ich sumy, potem push `main`
      (L-0280).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264, L-0273, L-0280)
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

### L-0266 — Komenda dla człowieka w składni mojej powłoki, nie jego (powtórzenie zasady 2) · 2026-10-24 · AKTYWNA

- **Trigger:** BEZPIECZENSTWO E5. Prosząc Łukasza o zaufanie hookom Codeksa, podałem
  `cd "$TEMP/relai-e5-sonda/codex" && codex` w składni Git Bash. Łukasz uruchomił to
  w PowerShellu, gdzie `$TEMP` jest puste, i dostał `Cannot find path 'C:\relai-e5-sonda\codex'`.
  Zasada 2 („z tej samej powłoki, którą zobaczy czytelnik”) już to mówiła.
- **Zasada:** komenda, którą człowiek ma wkleić sam, ma pełną ścieżkę bezwzględną, bez zmiennych
  środowiska i bez `&&`. Na Windowsie idzie w bloku `powershell`, a zmienna, gdy jest
  konieczna, w formie `$env:NAZWA`.

### L-0267 — Blok literału ucięty na typie: kontrola rekwizytów zobaczyła 0 przy 14 · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E1, pierwszy przebieg `release-check.js`. Kontrola rekwizytów filmu
  szukała wpisów od `const REKWIZYTY` do pierwszego `})`. Sygnatura typu tego samego wiersza,
  `(p: { t: number }) => ReactNode`, niesie `})`, więc blok kończył się przed pierwszym wpisem.
  Wynik: 14 czerwonych „bez rekwizytu” na zdrowym filmie. Licznik „rekwizytów w mapie 0” przy 14
  komendach pokazał, że to instrument.
- **Zasada:** blok wycinany z kodu kotwiczysz do otwarcia literału (`Object.freeze({` po nazwie),
  nie do samej nazwy. Fixtura testu niesie dosłownie ten kształt, który przewrócił parser.

### L-0268 — `git log -S` trafił w commit, który numer usunął · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E1, `--rev a1439b9`. Baza modu cofała się do poprzedniego numeru
  (0.11.0), szukając `git log -S '"version": "0.11.0"'` od rewizji. `-S` łapie każdą zmianę liczby
  wystąpień, więc znalazł commit, który 0.11.0 **zastąpił** 0.12.0. Pętla kręciła się w miejscu
  i skrypt skończył kodem 2.
- **Zasada:** cofając się po historii numerów, punkt szukania przesuwasz na rodzica commitu, który
  numer zmienił. Wynik `-S` to commit zmiany, nie commit dodania.

### L-0269 — Luka w rejestrze bez zmiany pliku od bazy: FAKT promptu nieosiągalny regułą · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E1, punkt 1 Weryfikacji: na `53830cc` miały wyjść trzy luki
  `ARTEFAKTY.md`, w tym `new-project.md` i `history.md`. Oba pliki nie zmieniły się między
  `v3.2.0` a `53830cc`. Wpisów zabrakło im przy wydaniu 3.2.0, a zmieniło je dopiero podbicie
  w `a1439b9`. Reguła „zmieniony od bazy bez nowego wpisu” nie mogła ich zobaczyć na tym drzewie.
  Ten sam skrypt pokazał je na `--rev v3.2.0`. Łukasz wybrał dowód na dwóch drzewach.
- **Zasada:** FAKT o lukach „na drzewie X” autor promptu liczy regułą kontroli na tym drzewie, z
  bazą tego drzewa. Luka widoczna dopiero w innym wydaniu idzie do punktu z rewizją, w której
  powstała (rozszerza L-0254).

### L-0270 — Skrypt mutacji „wszystkie przeżyły”: wzorzec TAP na wyjściu reportera spec · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E2, dowód negatywny testów (zasada 3). Skrypt podkładał 10 mutacji
  i liczył nieudane testy wzorcem `^not ok`. Wynik: 10/10 „przeżyło”, przy każdej mutacji
  „nieudanych 0”. `node --test` bez `--test-reporter` pisze w formacie `spec` (`✖`), nie TAP, więc
  wzorzec nie miał czego złapać. Z `--test-reporter=tap` 9 z 10 mutacji wywróciło swój test,
  a dziesiąta odsłoniła realną lukę: filtr plików modu bez testu.
- **Zasada:** instrument liczący wynik cudzego narzędzia wymusza format, który parsuje
  (`--test-reporter=tap`). „Zero nieudanych przy każdej mutacji” to najpierw defekt instrumentu
  (zasada 5, kontrola pozytywna), nie dowód siły testów.

### L-0271 — Kod wyjścia 1 raportu: harness pokazuje błąd, model obchodzi go zapisem do pliku · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E2, pierwszy przebieg frazy „gotowi do wydania?” w świeżej sesji.
  `release-check.js --json` kończy się kodem 1, gdy są czerwone kontrole. Narzędzie Bash oznaczyło
  wtedy wynik jako błąd („Exit code 1”), choć cały JSON (10 KB) stał w wyniku. Model uznał go za
  ucięty: najpierw dopisał `echo EXIT`, potem próbował zapisać raport do `.claude/relai/work/`
  (ścieżka wrażliwa) i do `/tmp` (poza katalogiem). Trzy odmowy, pięć wywołań skryptu zamiast
  jednego.
- **Zasada:** instrukcja, która woła narzędzie z kodem wyjścia „wynik negatywny ≠ awaria”, mówi
  wprost, co znaczy każdy kod i gdzie stoi pełny wynik. Zakazuje też obejść (powtórka, plik
  tymczasowy). Pierwszy realny przebieg instrukcji w świeżej sesji jest częścią jej pisania
  (zasada 1).

### L-0272 — Bramka z cichym `catch` na wejściu: „nie mogę odczytać” zlewa się z „nie ma czego sprawdzać” · 2026-10-25 · AKTYWNA

- **Trigger:** PIPELINE_WYDAN E3, przegląd kodu hooka `pre-push`. Lista refów szła ze stdin przez
  `try { readFileSync(0) } catch (_) {}`. Błąd odczytu (EAGAIN/EOF na rurze Windowsa) dawał pustą
  listę, a pusta lista znaczy „żadnego tagu wydania” — hook przepuszczał push. Testy były zielone,
  bo fixtura zawsze podawała czytelne wejście, a test dymny instalatora — puste `input: ''`.
  W tym samym przeglądzie: raport z kodem 0 i pustą listą kontroli liczył się jako zieleń.
- **Zasada:** mechanizm, który zatrzymuje, rozróżnia jawnie „wejście puste” od „wejście
  nieczytelne” i „wynik bez treści”. Dwa ostatnie to odmowa z komunikatem, nigdy przepustka.
  `catch` bez odmowy w bramce to fałszywa zieleń z definicji (rozszerza zasadę 12 i L-0043).

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

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
