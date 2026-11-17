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
   z kontrolą starego numeru na „następnym wydaniu bez zmiany tego numeru” (L-0287). Krok karty
   przed testem eksportuje tylko nazwy, które już istnieją w module (L-0313).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254, L-0269, L-0271, L-0277,
   L-0279, L-0282, L-0287, L-0313)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. Komenda do wklejenia przez
   człowieka w czacie: pełna ścieżka, bez zmiennych środowiska, na Windowsie w składni PowerShella
   (L-0266). Polecenie mierzysz w każdym stanie, który samo wytwarza albo na który przełącza —
   przed zmianą i po niej (L-0292). (L-0002, L-0022, L-0059, L-0266, L-0292)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. Test nieobecności tekstu z odmianą liczebnika szuka
   rdzenia wspólnego wszystkim formom, a każdy test „czegoś nie ma” wywraca mutacja pisana dla niego
   (L-0256). Asercja nieobecności celuje w brzmienie, które zmiana usuwa, nie w słowo wspólne
   z tekstem chronionym, który w tym samym teście dostaje kontrolę pozytywną (L-0315).
   (L-0007, L-0256, L-0315)
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
     wstrzykniętą zaczyna się od asercji, że ta treść dotarła w całości (L-0303); kontrolę
     pozytywną zależną od zachowania modelu sprawdzasz pierwszą sesją serii w jej warunkach,
     zanim ruszą kolejne (L-0310). Narzędzie
     z limitem rozmiaru wyjścia mierzysz przed wydaniem na wszystkich projektach z markerem na
     maszynie (odczyt, bez zapisu), fixturę piszesz z najgorszego (L-0304).
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
   L-0301, L-0303, L-0304, L-0310)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262, L-0290 — „przeszło testy” ani „to tylko test” nie zwalnia z reguły; `sed`
     tylko do odczytu, także w komentarzu — L-0276, L-0327); ścieżka w powłoce z `/`, także składana ze zmiennych
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
     Bash nigdy gołe `cd`, w żadnym katalogu, także `cd` do korzenia repo na początku łańcucha —
     ścieżka w argumencie albo podpowłoka, do wydania `bash-guard` bez wyjątku także dla
     `cd <repo> &&` na początku ani w środku łańcucha, także gdy sesja zaczyna się komendą (L-0298, L-0302, L-0311, L-0314, L-0318, L-0329); instrument tury nie liczy lokalnych komend (`/model`) jako polecenia (L-0299).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265,
   L-0267, L-0268, L-0270, L-0283, L-0290, L-0298, L-0299, L-0302, L-0309, L-0311, L-0312, L-0329)
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
   człowiekowi wyglądają na rozpoznane) mierzysz; poszerzenie to decyzja człowieka. Wartość w
   cytowanym prompcie etapu sprawdzasz także na autentycznym zawinięciu do następnej linii (L-0334).
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074, L-0334)
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
    1 / 2–4 / 5 / 12 / 22 (L-0260). Podbicie numeru modu idzie osobnym commitem
    `chore(release)`, a przed pushem tagu raport `--rev <tag> --wydanie` (L-0305); na maszynie
    z wpisami lokalnymi pluginu `plugin update` także z `--scope user`, a dotarcie wydania
    rozstrzyga `release-verify.js --sesja` (L-0306). (L-0004, L-0008, L-0020, L-0061, L-0085,
    L-0118, L-0161, L-0260, L-0305, L-0306)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. Przed liczeniem diffu `git ls-files --eol` — `w/crlf` przy `i/lf`
    normalizujesz do LF, bo `git status` o nim milczy (L-0297); workflow CI na Windows ustawia
    `core.autocrlf false` przed checkoutem (L-0319). (L-0033, L-0038, L-0057, L-0062,
    L-0067, L-0103, L-0122, L-0297, L-0319)
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
      w `git worktree` (L-0264); przegląd kodu przed bramką pomiaru na żywo, nie po niej (L-0330);
      test panelu sprawdza układ (props pudełek w każdym progu szerokości), nie tylko tekst (L-0331).
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
      i `/config`, a analiza najpierw wypisuje model każdej sesji (L-0300); `claude -p` nie ma
      `AskUserQuestion` — odpowiedź na pytanie podajesz `--resume`, a koniec mierzonej tury
      definiujesz jawnie (L-0307); wynik maszynowy ponad limit czytasz filtrem w tym samym
      poleceniu (L-0308).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245); strona wskazująca zasób
      wydania wdraża się po wydaniu — push tagu, wydanie z zasobami i ich sumy, potem push `main`
      (L-0280).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264, L-0273, L-0280,
    L-0281, L-0284, L-0285, L-0286, L-0288, L-0289, L-0291, L-0296, L-0300, L-0307, L-0308, L-0330,
    L-0331)
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

> Lekcje L-0273 … L-0308 (36 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0273_L-0308.md](archiwum/lekcje/LEKCJE_L-0273_L-0308.md)
> — przeniesione 2026-11-17, suma kontrolna `932cbe977416309e`.

### L-0309 — Ścieżka `/tmp` dla Node na Windows (powtórka L-0265) · 2026-10-28 · AKTYWNA

- **Trigger:** KONTEKST_STARTU E5, pętla pomiaru skrótu w projektach: `> /tmp/relai-d.txt`
  z powłoki zapisało plik, a `node -e` czytające `/tmp/relai-d.txt` szukało `C:\tmp\…` (ENOENT,
  12 razy). Bajty z `wc` przeszły, znaki — nie.
- **Zasada:** bez zmian względem L-0265 — ścieżka dla Node z `cygpath -m`, a plik roboczy
  w katalogu roboczym etapu, nie w `/tmp`.

### L-0310 — Kontrola pozytywna zależna od modelu nie przeszła ani razu: seria bez próby w jej warunkach · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E2, karta K-A6m. Para ważna wymagała, żeby sesja pierwsza
  uruchomiła `start-digest.js`. Na prompt „Odpowiedz jednym slowem: OK.” model odpowiedział od razu
  we wszystkich trzech parach (0/3 ważnych), budżet 10 sesji się wyczerpał, a werdykt
  `A6: NIE POWTARZA` wyszedł z gałęzi „mniej niż dwie pary ważne”, nie z dowodu. Sesja próbna K-P0
  miała tylko `Read` i inny cel, więc tego nie pokazała.
- **Zasada:** gdy kontrola pozytywna przebiegu zależy od zachowania modelu, pierwsza sesja serii
  idzie w dokładnie jej warunkach (prompt, narzędzia) i sprawdza, czy kontrola w ogóle może
  przejść, zanim ruszą następne; autor karty pomiaru planuje tę próbę w budżecie.

### L-0311 — Trzecia powtórka L-0298: drugie `cd` w łańcuchu przestawiło sesję mimo reguły w `CLAUDE.md` · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E4. Polecenia zaczynałem od `cd <repo> && …`, co nie
  zmieniało katalogu, więc nie budziło czujności. Raz dopisałem w tym samym łańcuchu
  `&& cd adapters/claude-code/hooks && for …` — katalog sesji przeszedł do folderu hooków
  i trzeba go było cofać osobnym poleceniem.
- **Przyczyna:** reguła stała w `CLAUDE.md` („nigdy gołe `cd`”), ale `cd` do korzenia repo
  traktowałem jako nieszkodliwy wyjątek; nawyk otwierania polecenia od `cd` przeniósł się na
  drugie `cd` w łańcuchu.
- **Zasada:** polecenie Bash nie zawiera `cd` poza podpowłoką `( cd … && … )` — także `cd` do
  korzenia repo na początku łańcucha; zamiast drugiego `cd` zmienna ze ścieżką (`H=…; $H/plik`)
  albo `git -C`. Glob dla `node --test` idzie ze ścieżką względną w podpowłoce — ścieżka
  `/c/…` w globie dała 0 testów (instrument, nie wynik).

### L-0312 — Fikstura z `home` w drzewie roboczym zagłuszyła sygnał hooka Stop · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E5, skrypt efektu widocznego karty K-E3. Fikstura trzymała
  katalog `home/` (pusty `.gitconfig` dla izolacji gita) wewnątrz repozytorium fikstury. Hook Stop
  zobaczył `home/` jako niezacommitowany kod i dał komunikat „W drzewie roboczym…” zamiast
  sprawdzanego zdania „Od ostatniego wpisu dziennika…”. Testy tej samej karty były zielone, bo ich
  `home` leżał obok repozytorium, nie w nim.
- **Zasada:** fikstura hooka czytającego `git status` trzyma swoje pomocnicze katalogi (`home`,
  konfigurację, wyjścia) **poza** repozytorium fikstury albo w jej `.gitignore`; skrypt efektu
  piszesz z tego samego układu co test karty.

### L-0313 — Krok „sam eksport” nazwy, której jeszcze nie ma, daje `ReferenceError`, nie czerwień z asercji · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E6, karta K-D9. Krok 1 karty kazał przed testem dopisać
  do `module.exports` nazwy `wykonaj, zmienneInnychGospodarzy`, a funkcja `zmienneInnychGospodarzy`
  powstaje dopiero w kroku 2. Skrót `{ a, b }` z niezdefiniowaną nazwą przewraca `require` całego
  modułu, więc przebieg „czerwony z asercji” byłby czerwony z błędu ładowania. Prototyp karty miał
  funkcję już zdefiniowaną, więc tego nie pokazał.
- **Zasada:** krok przygotowawczy przed testem eksportuje wyłącznie nazwy, które już istnieją
  w module; nazwę nowej funkcji dopisujesz do eksportu razem z jej definicją. Kartę z takim
  krokiem wykonujesz w tej kolejności i zapisujesz rozjazd w dzienniku etapu, bez cichej poprawki.

### L-0314 — Czwarta powtórka L-0298: `cd <repo> && …` na początku każdego polecenia, raz do podkatalogu · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E8. Wszystkie polecenia etapu zaczynałem od
  `cd /c/Users/…/RelAI && …` — dokładnie to, czego zakazuje L-0311 — i raz napisałem
  `cd .claude/relai/work/…/E8 && for …`. Katalog sesji przeszedł do katalogu roboczego etapu,
  trzeba go było cofać osobnym poleceniem.
- **Przyczyna:** zasada stoi w `CLAUDE.md` i w L-0311, ale nic jej nie egzekwuje w sesji: hook
  `bash-guard` (E5) ostrzega przed gołym `cd`, lecz działa dopiero po wydaniu w E14 — w sesji
  pracuje hook zainstalowanego 3.7.0. Nawyk z pierwszego polecenia przeniósł się na kolejne.
- **Zasada:** do wydania `bash-guard` każde polecenie Bash bez `cd` — ścieżki w argumentach
  (`grep … plik/w/repo`, `-C`, zmienna `W=…; $W/plik`) albo podpowłoka `( cd … && … )`, także dla
  `node --test`. Po wydaniu E14 ostrzeżenie hooka jest mitygacją; reguła zostaje.

### L-0315 — Asercja karty „tekstu X nie ma” trafiła w zdanie, którego ta sama karta każe nie ruszać · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E8, karta K-A3. Test zmienionego oczekiwania miał
  `assert.ok(!/zamykanie ryzyk/.test(rZero))`, a ten sam raport niesie zdanie budżetu „Rotacja nic
  tu nie zdejmie… odchudza zamykanie ryzyk”, które pole „Nie ruszasz” karty chroni. Po poprawnej
  zmianie progu test został czerwony; Łukasz wybrał zawężenie asercji do brzmienia procedury
  (`zamykanie ryzyk (zadne`) z kontrolą pozytywną zdania budżetu.
- **Zasada:** asercja nieobecności w karcie celuje w brzmienie, które zmiana usuwa, nie w słowo
  wspólne z tekstem chronionym — autor karty puszcza ją na wyjściu po zmianie (prototyp), a zdanie
  z pola „Nie ruszasz” dostaje w tym samym teście kontrolę pozytywną. FAKT o stanie pliku (liczba
  lekcji, obecność spraw przeterminowanych) w karcie pisanej dzień wcześniej wykonawca mierzy na
  starcie, zanim uzna liczbę z karty za kryterium.

### L-0316 — Plik zadania dla Codeksa nie znał dwóch granic: preambuły roli i sandboksa · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E9, pierwszy etap według Aneksu A. Przebieg 1 Codeksa
  zakończył się `STOP` bez jednej zmiany: preambuła roli `coder` w `core/process/crew.js` (l. 88,
  D-44) zabrania edycji `docs/`, a karty K-B1 i K-B2 kazały zmienić `docs/KOMENDY.md`
  i `docs/DECYZJE.md`. Przebieg 2 dopisał testy i stanął na `spawn EPERM`: sandbox
  `workspace-write` Codeksa na Windows nie pozwala `node --test` uruchamiać procesów potomnych,
  więc żaden test nie ruszył (ryzyko AX4 aneksu się spełniło). Etap zajął cztery przebiegi zamiast
  jednego.
- **Zasada:** plik zadania dla Codeksa od pierwszego przebiegu oddaje Claude'owi wszystko, czego
  Codex nie może: edycje pod `docs/`, `CLAUDE.md` i `AGENTS.md` (Codex podaje kotwicę i tekst)
  oraz każde uruchomienie testów i hooków. Etap idzie dwoma przebiegami: (1) same nowe testy wg
  kart → Claude uruchamia je na czerwono; (2) wdrożenie bez zmiany testów → Claude uruchamia je na
  zielono i robi resztę Weryfikacji. Effort `crew.js` nie przekazuje (tylko `-m`), więc Codex
  bierze go z `~/.codex/config.toml`.

### L-0317 — Plik zadania kazał Codeksowi „zachować CRLF” pliku, który w repozytorium ma LF · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E10, przebieg 2. Claude odczytał `git ls-files --eol`
  → `i/lf w/crlf` dla `core/templates/SPEC_PROMPT_ETAPU.md` i wpisał do pliku zadania „plik ma
  CRLF, zachowaj je”. Edycja Codeksa przepisała końce linii, Codex uznał to za naruszenie zadania
  i zakończył przebieg `STOP` po punktach 1–5 karty K-A1. `git status` wcześniej milczał
  o pliku (pamięć stat — L-0297), a drugi plik karty (`relai-planning.mdc`) miał ten sam stan.
  Etap zajął trzy przebiegi zamiast dwóch.
- **Zasada:** stan końców linii z drzewa roboczego nie trafia do pliku zadania jako wymóg. Przed
  każdym przebiegiem Codeksa Claude sprawdza `git ls-files --eol` plików z `--files`;
  `w/crlf` przy `i/lf` normalizuje do LF skryptem pisanym przez Write (L-0297) i dopiero wtedy
  uruchamia przebieg. Plik zadania mówi wyłącznie „repozytorium trzyma LF”.

### L-0318 — Piąta powtórka L-0298: gołe `cd` w pętli przestawiło katalog sesji na resztę etapu · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E14, K-E9. Polecenie klasyfikujące hooki miało w środku
  `cd adapters/claude-code/hooks 2>/dev/null; for f in adapters/…` — katalog sesji przeszedł do
  `adapters/claude-code/hooks` i został tam do końca sesji (harness przenosi `cd`), a pętla nie
  znalazła plików. Dalej każde polecenie szło z pełnymi ścieżkami albo w podpowłoce.
- **Przyczyna:** to samo co L-0314 — w sesji pracował hook 3.7.0 bez `bash-guard`; `cd` wpisane
  „na chwilę” w polecenie pomocnicze, nie na jego początku.
- **Zasada:** bez zmian (zasada 5, L-0314): żadnego `cd` poza podpowłoką, także w środku
  łańcucha. Od 3.8.0 `bash-guard` ostrzega przed gołym `cd` — pierwsza sesja po restarcie
  aplikacji to sprawdza.

### L-0319 — Pierwszy przebieg CI na Windows: runner robi checkout z `core.autocrlf=true` · 2026-11-10 · AKTYWNA

- **Trigger:** OPTYMALIZACJA_PO_AUDYCIE E14, K-W2. Workflow `testy.yml` na `windows-latest`:
  2 z 28 testów `adapters/codex` (`skill-parity.test.js`) czerwone — każdy plik skilli z inną
  sumą. Lokalnie zielono, bo ten klon ma `autocrlf=false`. Hipotezę potwierdziły dwa lokalne
  klony w jednym przebiegu: `-c core.autocrlf=true` → 2 fail, `false` → 0 fail. Krok
  `git config --global core.autocrlf false` przed checkoutem → zielono.
- **Zasada:** workflow na Windows, którego testy porównują bajty plików, ustawia
  `core.autocrlf false` przed `actions/checkout`. Rozjazd CI z lokalnym przebiegiem najpierw
  odtwarzasz lokalnie klonem w warunkach runnera, potem zmieniasz workflow — testów nie ruszasz.
  Ta sama luka testu parzystości w zwykłym klonie z `autocrlf=true` zostaje w „Co dalej”
  (PIPELINE_WYDAN).

### L-0320 — Powtórka L-0298 po raz trzeci: `cd` na początku polecenia „tylko do grep” · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E2. Polecenie `cd panel/hooks && grep … register.tsx …`
  przestawiło katalog sesji na `panel/hooks`; `bash-guard` ostrzegł, ale polecenie przeszło
  (ostrzeżenie, nie blokada). Katalog przywrócony od razu kolejnym poleceniem.
- **Przyczyna:** skrót myślowy „krótkie ścieżki w grep” — reguła z `CLAUDE.md` znana, nie
  sprawdzona przed napisaniem polecenia.
- **Zasada:** bez zmian (zasada 5, L-0298, L-0302): ścieżka w argumencie, nigdy `cd` na
  początku. Trzecia powtórka mimo `bash-guard` — do rozważenia blokada zamiast ostrzeżenia
  (decyzja człowieka, „Świadomie odłożone” E2).

### L-0321 — Nowa droga wywołania silnika sprawdzona w teście, który przyjmuje wszystko · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E2, tryb `describe`. `$.agent.spawn({ model: 'claude-haiku-5-5' })`
  przeszło `plugin test` (atrapa `agent.spawn` przyjęła każde pole), a na żywo narzędzie Agent
  odrzuciło je `InputValidationError` (tylko `sonnet|opus|haiku|fable`). Mod spadł do
  zmniejszania po cichu — `$.ui.log` w przeładowywanym modzie nie trafia do transkryptu;
  przyczynę dała dopiero sonda zapisująca powód do pliku.
- **Zasada (zasada 13):** każda nowa droga do silnika (`$.agent.spawn`, `$.model.complete`,
  `$.tool.call`) ma pierwszy przebieg na żywo z sondą powodu porażki w pliku, zanim padnie
  zdanie „działa”; test z atrapą dowodzi liczby wywołań, nie przyjęcia argumentów. Mod
  z wyjściem awaryjnym (zmniejszanie) zapisuje powód awarii tam, gdzie człowiek albo model go
  zobaczy.

### L-0322 — Kopia w dev-mods: zanim ją podłożysz, przeczytaj L-0289 i uruchom obserwację · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E2, pomiar na żywo. Kopia `panel/` jako `relai-panel` obok
  wyłączonego zainstalowanego modu się nie wczytała (komenda nieznana); kopia przemianowana też
  nie — `/reload-plugins` nie czyta `~/.claude/dev-mods/<sesja>/`. Wczytało je dopiero
  załadowanie skilla `plugin-authoring` (start obserwacji katalogu) i zapis pliku pod nim;
  tryb auto włączył mody bez pytania. Trzy rundy człowieka na nic.
- **Zasada:** pomiar kopii modu na desktopie: najpierw L-0289 (inna nazwa modu, komendy i stanu
  niż zainstalowany), potem skill `plugin-authoring` w tej sesji, potem zapis kopii — i dopiero
  wtedy prośba do człowieka o komendę modu. Przemianowanie robisz w kopii, nie w repo.

### L-0323 — Materiał pomiaru modu w ścieżce, którą mod z definicji przepuszcza · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E3, pomiar `relai-input-router`. Duży log położony w katalogu
  roboczym `.claude/relai/work/…`; mod przepuścił go dosłownie, bo `.claude/relai/**` to plik
  procesu — odczyt (25 tys. tokenów kontekstu) nie zmierzył notatek. Dopiero kopia w scratchpadzie.
- **Zasada (zasady 4 i 13):** zanim położysz materiał pomiaru, przepuść jego ścieżkę przez
  przepustki mierzonego mechanizmu (`fileGuard`) i umieść go tam, gdzie mechanizm działa; pierwszy
  odczyt robisz na małym pliku tuż nad progiem, żeby porażka kosztowała mało.

### L-0324 — Powtórka L-0116: `node -e` z `\n` „tylko do materiału testowego” · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E3. Log pomiarowy wygenerowany `node -e "…'\n'…"` w Bash;
  `bash-guard` ostrzegł, wynik przypadkiem poprawny (1500 linii).
- **Zasada (zasada 5):** skrypt z `\n`, backslashem albo ścieżką Windows — narzędziem Write
  i uruchomienie z pliku, także dla danych testowych; ostrzeżenie `bash-guard` traktujesz jak
  zatrzymanie.

### L-0325 — Szósta powtórka L-0298: `cd <repo> &&` na początku poleceń mimo reguły w `CLAUDE.md` · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E4, pierwsze sześć poleceń Bash sesji zaczynało się od
  `cd /c/Users/Lukasz/Desktop/RelAI && …`. Katalog sesji się nie przestawił (to był katalog
  roboczy), ale reguła z `CLAUDE.md` mówi „nigdy gołe `cd`”, a lekcja L-0314 opisuje dokładnie ten
  wzorzec.
- **Zasada:** w katalogu roboczym sesji polecenie nie ma `cd` wcale — ścieżki względne od korzenia
  repo; inny katalog tylko w argumencie albo w podpowłoce `( cd … && … )`. Pierwsze polecenie sesji
  sprawdzasz pod tym kątem, zanim je wyślesz.

### L-0326 — Nowa funkcja modułu przesłoniła starą o tej samej nazwie; test innej ścieżki złapał regres · 2026-11-11 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E4. W `input-router/hooks/register.tsx` dopisana
  `async function shownText($, list, open)` dla panelu; moduł miał już `function shownText(ran)`
  z E3. Druga deklaracja wygrała po cichu — `routeRead` dostał Promise zamiast tekstu, test
  kawałkowania z E3 (60%) poczerwieniał. Diagnoza zajęła trzy próby (hook bez dopasowania, wyłączenie
  hooka, logi), zanim padło na nazwę.
- **Zasada (zasada 13):** przed dopisaniem funkcji najwyższego poziomu w pliku modułu `grep -n
  "function <nazwa>\|const <nazwa>"` w tym pliku; regres starej ścieżki po dopisaniu kodu → najpierw
  różnice nazw i importów, potem hipotezy o silniku.

### L-0327 — Powtórka L-0324 i L-0276 w jednym etapie: heredok z `\n` i `sed -i` na pliku kodu · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E5. Poprawka testów skryptem z heredoka niosącym `'…as const\n'`
  (`bash-guard` ostrzegł), potem `sed -i` na komentarzu w `model-router/types/index.d.ts`. Oba
  wyniki przypadkiem poprawne.
- **Zasada (zasada 5):** skrypt edycji zawsze narzędziem Write i uruchomienie z pliku — także
  „krótka poprawka testów”; `sed` tylko do odczytu, także dla jednego komentarza w kodzie —
  zmiana tekstu = Edit. Ostrzeżenie `bash-guard` = zatrzymanie, nie informacja. Ta sama sesja,
  już po zapisaniu tej lekcji: `node -e` z wyrażeniem regularnym z backslashem do samego odczytu
  planu HTML — reguła obejmuje też skrypty tylko czytające.

### L-0328 — Baza decyzji modu z modelu rodzica, a silnik brał domyślny z `env` ustawień · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E5, pomiar na żywo. Mod uznał, że subagent bez modelu działa na
  modelu rodzica (Opus = deep), i przy zadaniu ryzykownym nic nie przypiął; subagent ruszył na
  Sonnecie z `env.CLAUDE_CODE_SUBAGENT_MODEL` w `~/.claude/settings.json`. Testy i sonda tego nie
  pokazały — sonda działała przy włączonym BenAI, który przepisywał model niżej w łańcuchu.
- **Zasada (zasady 4 i 13):** decyzja oparta na „co by się stało bez modu” wymaga przebiegu bez
  modu i bez bliźniaka, z odczytem efektu (`turn.step.model`), zanim padnie założenie o bazie;
  ustawienia użytkownika (`env`, `model`) to wybór człowieka — sprawdzasz je i pytasz, czy
  chronić, zamiast nadpisywać.

### L-0329 — Siódma powtórka L-0298: `cd <repo> &&` w pierwszych poleceniach sesji `/relai-stage` · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E6. Trzy pierwsze polecenia Bash sesji (marker, skrót startu,
  prompt etapu) zaczynały się od `cd /c/Users/Lukasz/Desktop/RelAI && …`, choć L-0325 opisuje ten
  wzorzec, a `CLAUDE.md` go zakazuje. Pierwsza wiadomość sesji była komendą — reguła z `CLAUDE.md`
  była w kontekście, ale nie przeszła do pierwszych poleceń.
- **Zasada (zasada 5):** w katalogu roboczym sesji polecenie nie ma `cd` także wtedy, gdy sesja
  zaczyna się komendą; pierwsze polecenie Bash sprawdzasz pod tym kątem, zanim je wyślesz, a inny
  katalog idzie przez `git -C`, ścieżkę w argumencie albo podpowłokę.

### L-0330 — Pomiar na żywo przed przeglądem kodu: przegląd zmienił kod po pomiarze · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E6. Pomiar na żywo z człowiekiem (bramka, `/reload-plugins`,
  kliknięcia) przeszedł, potem `typescript-reviewer` dał 3 HIGH i kod się zmienił — pomiar opisuje
  kod sprzed poprawek; powtórka wymagałaby drugiej bramki.
- **Zasada (zasady 4 i 13):** etap z pomiarem na żywo puszcza przegląd kodu **przed** bramką
  pomiaru; pomiar mierzy kod po poprawkach. Gdy przegląd przyszedł po pomiarze — wpis mówi wprost,
  na jakim kodzie szedł pomiar i które gałęzie dowodzą już tylko testy.

### L-0331 — Panel przeszedł testy treści, a rozjechał się na żywo: układ nie był sprawdzany · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E6. Testy panelu załogi szukały tekstu (`find`) przy 40 i 160
  kolumnach i przeszły; na żywo w wąskim doku litery stały jedna pod drugą — pudełko słów
  `width={0}` + `flexGrow` w wierszu o kierunku kolumnowym (P-043). Wzorzec skopiowany z innych
  modów, które mają ten sam błąd.
- **Zasada (zasada 4, pamięć „layout bez rozjazdów”):** test panelu sprawdza układ, nie tylko
  tekst — props pudełek (`width`, kierunek) w każdym progu szerokości i mutant błędu; wzorzec
  układu kopiowany z innego modu sprawdzasz w kierunku, w którym go używasz.

### L-0332 — Aneks C kazał Codeksowi pisać `docs/`, a preambuła roli `coder` w `crew.js` tego zabrania · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E7, pierwszy przebieg `crew.js run --role coder`: terra zwrócił
  `STOP:` bez zmian — preambuła roli (`crew.js:74`, D-44) zabrania edycji czegokolwiek w `docs/`,
  a zakres i rytuał wymagały `docs/ARTEFAKTY.md` i dokumentów rytuału; dodatkowo zdanie „Kontrola
  modelu” kazało mu potwierdzić model, którego z wnętrza sesji nie widzi. Aneks C wzorował się na
  Aneksie A, gdzie rytuał pisał Claude — sprzeczności nikt nie sprawdził.
- **Zasada:** zanim oddasz Codeksowi etap z rytuałem, porównaj zakres pliku zadania z preambułą
  roli (`node core/process/crew.js prompt --role coder`). Etap z dokumentami idzie z `--raw`,
  a granicę plików i zakazy (commit, push, pluginy) niesie nakładka; model potwierdza plik zadania
  i polecenie Claude, nie wykonawca.

### L-0333 — Sandbox Codeksa blokuje procesy potomne: baza testów nie do sprawdzenia w przebiegu · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E7, drugi przebieg terra: `spawnSync git EPERM`, `uv_spawn EPERM`
  w `node --test` i `claude plugin test` — punkt Weryfikacji „liczby wyjściowe testów” nie do
  potwierdzenia, przebieg skończył się `PYTANIE:` bez zmian.
- **Zasada:** bazę testów etapu wykonywanego przez Codeksa uruchamia Claude **przed** `crew.js run`
  i wpisuje wynik do nakładki pliku zadania; wykonawca uruchamia w sandboksie tylko to, co może
  (pojedyncze pliki, `--test-isolation=none`, `claude plugin test --file`), a pełny przebieg robi
  bramka.

### L-0334 — Effort etapu na następnej linii cytatu nie pasował do testowej jednej linii · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E7. Pierwszy test parsera używał jednej linii; rzeczywisty
  `PROMPT_ETAP_6.md` ma wskazanie po zdaniu, a poziom w następnym wierszu cytatu Markdown.
  Parser zwracał brak wskazania i nie chroniłby go w auto.
- **Zasada (zasady 3, 4 i 7):** materiał testu parsera instrukcji obejmuje dosłowny rzeczywisty
  kształt, w tym zawinięcie i cytat. Mutacja ochrony ma ujawnić zmianę wyniku `turn.step`, nie
  wyłącznie liczbę wywołań sędziego.

### L-0335 — `crew.js review --runtime codex` pada: bieżący `codex review` nie zna `--color` · 2026-11-12 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E7, bramka: `crew.js review` zwrócił „werdyktu nie rozpoznano”
  z pustym wyjściem; w `review-codex.err.txt` — `error: unexpected argument '--color' found`.
  Porażka CLI wygląda w raporcie tak samo jak brak werdyktu.
- **Zasada:** pusty werdykt `crew.js` → najpierw `*.err.txt` w `.claude/relai/work/CREW/<run-id>/`.
  Do czasu poprawki `buildReviewCommand` przegląd Codeksa idzie przez `crew.js run --role reviewer`
  z plikiem zadania (bez `--write`).

### L-0336 — Terra kończy cały etap modu po ok. 2,5 min raportem „nieukończony” bez blokady · 2026-11-13 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E8, dwa przebiegi `crew.js run --model gpt-6.1-terra --raw`
  (drugi z wprost zapisanym „nie kończ bez realnej blokady”): każdy ok. 2,5 min i ok. 110 tys.
  tokenów, potem raport „nieukończony” z samymi czystymi modułami logiki (5/5 testów), bez modu,
  panelu, rejestracji i rytuału. W logu nie ma błędu, który by blokował; terra sam ocenia
  „ograniczenia czasu i wyjścia”. Kontynuacja z `crew.js check` nie zmieniła wyniku.
- **Zasada:** etapu o zakresie całego nowego modu (mod, panel, rejestracja, rytuał) nie oddajesz
  terra w jednym przebiegu. Po pierwszym takim stopie nie ponawiasz go tym samym zadaniem:
  zmieniasz wykonawcę na Sol (decyzja Łukasza 2026-11-13) albo tniesz etap na pod-zadania
  z osobną granicą plików. Czas przebiegu poniżej 5 min przy dużym zakresie = sygnał tego stopu.

### L-0337 — Dane testowe z sekretem zatrzymały commit E8: nazwa zmiennej stała w źródle dosłownie · 2026-11-13 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E8, poprawka Sol 3: regresje skanera w `research/hooks/*.test.ts`
  budowały wartość z kawałków (`['R7m', …].join('')`), ale pisały wprost `DB_PASSWORD="${…}"`.
  Hook pre-commit (`core/guardrails/secret-scan.js`, reguła przypisania z przedrostkiem) zatrzymał
  commit bramki; testy w sandboxie Codeksa przeszły, bo tam nikt nie commituje.
- **Zasada:** dane testowe wyglądające jak sekret (token, przypisanie `*_PASSWORD=`, `*_TOKEN=`,
  `SECRET=`) składasz w czasie testu z kawałków — **nazwę zmiennej też**, np.
  `${['DB', 'PASSWORD'].join('_')}="${['R7m', 'K2p'].join('')}"`. Przed raportem wykonawca
  uruchamia `node core/guardrails/secret-scan.js <pliki testów>` i oczekuje `BRAK` przy każdym.
  `--no-verify` nie jest obejściem. Dotyczy każdego wykonawcy, w szczególności Codeksa (Aneks C).

### L-0338 — Kopia pomiarowa modu nie przeładowała się po zmianie pliku, który mod czyta przy starcie · 2026-11-17 · AKTYWNA

- **Trigger:** MODY_OSZCZEDZANIA E10, wiersz 24: usunięty wiersz zgody z `docs/USTAWIENIA.md`,
  potem `install-dev-copies.cjs` dla routera; skrypt pomija pliki bez zmian, więc silnik nie
  przeładował modu, a router działał dalej na zgodzie wczytanej przy `session.start`.
- **Zasada:** po zmianie stanu, który mod wczytuje przy starcie (wiersz zgody, ustawienia,
  lista modeli), przeładowanie kopii w `~/.claude/dev-mods/<sesja>/` wymuszasz realną zmianą jej
  pliku (np. dopisany komentarz z godziną) i sprawdzasz datę modyfikacji, zanim zaczniesz pomiar.
  Ponowny zapis identycznej treści nie przeładowuje modu (L-0322).

### L-0339 — Decyzje biznesowe planu zadane po wypchnięciu tagów wydania · 2026-11-17 · AKTYWNA

- **Trigger:** wydanie 3.9.0 (`/relai-release`, zamknięcie MODY_OSZCZEDZANIA): dwie decyzje
  z PLAN §9 (status „early access” nowych modów, wzmianka o inspiracji w README) padły dopiero
  przy pisaniu notatek, po tagach i ich pushu. Odpowiedź Łukasza akurat nie zmieniła plików;
  inna oznaczałaby wydanie 0.1.1 albo przenoszenie wypchniętych tagów.
- **Zasada:** przed commitem wydania przejrzyj otwarte bramki i decyzje człowieka aktywnego planu
  (`STATUS.md`, sekcja bramek; PLAN „do rozstrzygnięcia przez człowieka”). Każda, która zmienia
  treść wydawanych plików (README, opis w marketplace, manifest), musi być rozstrzygnięta przed
  krokiem 2 (commit) `/relai-release`.

### L-0340 — Pomiar wyłączył zainstalowane mody i nikt ich nie włączył przed wydaniem · 2026-11-17 · AKTYWNA

- **Trigger:** E10 wyłączył `relai-panel`, `relai-cache-keeper` i `relai-mods` na czas pomiaru
  kopii (POMIAR_E10, „Środowisko”); kopia konfiguracji była, przywrócenia nie było. Wyszło
  dopiero w `release-verify --sesja`: pliki zgodne, sesja „init nie ma pluginu”.
- **Zasada:** każde przełączenie instalacji na czas pomiaru ma w tym samym dokumencie pomiaru
  wiersz przywrócenia z datą; etap nie zamyka się, dopóki stan instalacji nie równa się kopii
  sprzed pomiaru (pomijając zmiany, na które człowiek się zgodził). Czerwień sesji
  w `release-verify` przy zgodnych plikach → najpierw `enabledPlugins` w ustawieniach.

### L-0341 — Powtórka L-0308: raport `release-check --json` czytany bez filtra, drugi przebieg · 2026-11-17 · AKTYWNA

- **Trigger:** `/relai-release` przy 3.9.0: krok 1 komendy uruchomiony dosłownie, bez filtra;
  wynik obcięty w środku (`propozycje`, `zmiany`, połowa `kontrole`), drugi przebieg ~2 min
  z filtrem ze scratchpadu. L-0308 (archiwum `LEKCJE_L-0273_L-0308.md`) mówiła to od 2026-10-28,
  a krok 1 komendy nadal każe czytać pełny JSON z jednego wyniku (P-077).
- **Zasada:** jak L-0308 — raport, który może przekroczyć ~30 tys. znaków, czytasz filtrem w tym
  samym poleceniu, od pierwszego przebiegu. Gdy komenda projektu przeczy lekcji, wygrywa lekcja,
  a rozjazd idzie do „Co dalej” jako poprawka komendy.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
