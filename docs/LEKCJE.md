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
     licznikiem przerw głównego wątku — przeładowanie mierzy ciepłą pamięć (L-0227).
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
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)
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
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221); cudzy
      generator sceny sprawdzasz pudełkami wypieczonej geometrii obok `Box3.setFromObject` i klasą
      referencyjną biblioteki (L-0225); dystans do wzorca najpierw detal, tekstury i kompozycja,
      technika światła na końcu, a hipotezę „X zrobi różnicę” — tanim testem na jednym kadrze
      z werdyktem człowieka przed etapem (L-0226).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226)

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

### L-0192 — Oczekiwany tekst z `\n` w teście przeszedł przez literał Pythona · 2026-10-14 · AKTYWNA

- **Trigger:** odnoga KOMUNIKAT_ZWROTU. Podmiana oczekiwanych napisów w `economics.test.ts` skryptem
  Pythona z heredoku: `\n` w napisie zastępczym trafił do pliku jako prawdziwy znak nowej linii,
  literał TypeScriptu się rozerwał, a `claude plugin test` zgłosił „the file did not load —
  Unterminated string literal”. Poprawka narzędziem Edit.
- **Przyczyna:** reguła już była (zasada 5, „Backslash”: skrypt edycji niosący `\n` — tylko
  Write/Edit), a sesja jej nie zastosowała, bo podmiana „wyglądała na zwykłe napisy”.
- **Zasada:** napis z sekwencją ucieczki (`\n`, `\t`, `\\`) w pliku kodu albo testu zmieniasz
  wyłącznie narzędziem Edit — także wtedy, gdy obok idą podmiany bez ucieczek; skrypt podmian bierze
  tylko napisy bez backslasha. Po każdej zbiorczej podmianie uruchamiasz testy, zanim pójdziesz dalej.

### L-0193 — Opcja „nowa odnoga” zaproponowana z wnętrza odnogi · 2026-10-14 · AKTYWNA

- **Trigger:** odnoga SPLIT_VIEW. Wątek spoza zakresu (panel RelAI rozjechany w wąskim panelu
  podziału) dostał pytanie z opcją „Nowa odnoga (Rekomendowane)”; Łukasz ją wybrał, a `/relai-branch`
  odmówił w Kroku 1 — odnoga od odnogi jest zakazana.
- **Przyczyna:** pytanie „odnoga / aneks / odłożone” z `CLAUDE.md` zadane bez sprawdzenia, w czym
  sesja pracuje.
- **Zasada:** w sesji odnogi wątek spoza zakresu ma do wyboru plan, wpis „świadomie odłożone” albo
  odnogę otwartą **po** zamknięciu bieżącej, w nowej sesji — nigdy odnogę z tej sesji.

### L-0194 — Test układu zielony, a na żywo przycisk za krawędzią kafla · 2026-10-14 · AKTYWNA

- **Trigger:** odnoga PANEL_WASKI. Instrument szerokości modelował układ jak Yoga („Ink's Box”
  w typach: wszystko kurczy się do zera), poprawka przeszła go w całości, a pierwszy zrzut
  Łukasza pokazał „Otwórz” wypchnięte za kafel; potem jeszcze trzy objawy, których model nie znał
  (spacja sklejająca słowa, sztywny `Svg` w wierszu, styk zawiniętych przycisków).
- **Przyczyna:** model cudzego silnika układu przyjęty z opisu typów, bez kalibracji na żywo;
  dane testowe bez materiału, na którym objaw powstał (źródło cennika z długim słowem).
- **Zasada:** instrument modelujący cudzy silnik to hipoteza do pierwszego zrzutu — każdy objaw
  ze zrzutu, którego instrument nie wskazał, najpierw wchodzi do niego jako przypadek kontroli
  pozytywnej na kodzie ze zrzutu (instrument musi spaść), dopiero potem poprawka kodu; fikstura
  niesie realny materiał, który objaw wywołał (P-043).

### L-0195 — Linia „między paskami” rysowała się też pod ostatnim, nad wierszem aplikacji · 2026-10-14 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E1. Linię gasnącą przeniesiono pod kartę z warunkiem „coś stoi
  niżej” (`next(e)` niepuste). Pod paskiem cache stoi zawsze własny węzeł aplikacji, więc linia
  została pod ostatnim paskiem; Łukasz: „to też możesz usunąć te na samym dole w cache bo jest
  zbędna analogicznie jak była ta górna”. Testy były zielone — atrapa „silnika pod spodem” to
  jedyny sąsiad, jakiego znały, i test utrwalał linię nad nim jako oczekiwaną.
- **Przyczyna:** warunek napisany na „czy jest sąsiad”, a znaczenie to „czy sąsiad jest tego samego
  rodzaju”; fikstura miała jeden rodzaj sąsiada.
- **Zasada:** element „pomiędzy” ma warunek na **rodzaju** sąsiada, nie na jego istnieniu, i test
  z obiema fiksturami: sąsiad własny (element jest) i sąsiad obcy albo silnik (elementu nie ma).

### L-0196 — Ta sama wysokość w pikselach, a człowiek trzy razy widział przycisk niższy · 2026-10-14 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E1, runda przycisków. Drugi przycisk wiersza (natywny
  `secondary`) Łukasz trzy razy ocenił jako niższy od `primary`; poprawka plakietką skrótu nic nie
  dała („nie nadal jest za niski”). Pomiar zrzutu: oba po 25 px — w ciemnym wyglądzie `secondary`
  ma tło bliskie tłu aplikacji i jego krawędź ginie.
- **Przyczyna:** uwagę o wyglądzie potraktowałem jak usterkę geometrii i poprawiałem geometrię,
  zanim zmierzyłem zrzut, na który człowiek patrzył.
- **Zasada:** uwagę „za niski / za mały / krzywo” sprawdzasz pomiarem tego zrzutu **przed**
  poprawką; równe piksele przy powtarzającej się uwadze znaczą kontrast albo ciężar wizualny —
  pokazujesz pomiar i dajesz wybór (np. jeden wariant dla wszystkich), zamiast kolejnej rundy.

### L-0197 — Próba wyglądu na krótkich danych makiety ukryła rozjazd na danych etapu · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E2, runda 1. Mod wariantów listy przeszedł testy i walidację;
  Łukasz zobaczył na żywo, że na danych etapu E2 długa nazwa punktu wypycha segmenty i liczbę `0/7`
  za prawą krawędź karty („coś tu się rozjeżdża”). `Text wrap="truncate"` w `Box` z `minWidth={0}`
  nie ucinał — kolumna brała min-content całej nazwy (P-043 pkt 6). Na 14 krótkich nazwach makiety
  wszystko się mieściło. Do tego warianty układu w stanie zwiniętym wyglądały tak samo, więc
  przełącznik „nic nie zmieniał”.
- **Przyczyna:** próbę wyglądu ustawiłem domyślnie na danych realnych, ale testy i własny podgląd —
  na danych krótkich; warianty różniły się dopiero po rozwinięciu.
- **Zasada:** próba wyglądu startuje na **najdłuższych realnych danych** i ma test, który ten stan
  sprawdza (tu: baza zerowa tekstu ucinanego). Warianty do oceny różnią się już w stanie domyślnym
  (zwiniętym) — różnica widoczna dopiero po kliknięciu nie jest wariantem.

### L-0198 — Backslash w heredoku drugi raz, tym razem w teście modu poza repo · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E2. Plik testu modu próby pisany heredokiem `<<'EOF'` z wyrażeniem
  `/\\/g` — w pliku zostało `/\/g`, test nie załadował się („Unterminated string literal”).
  Powtórzenie L-0116 / L-0135 (zasada aktywna 5).
- **Przyczyna:** zasadę „backslash tylko przez Write/Edit” stosowałem do plików repozytorium, a plik
  modu w `dev-mods` uznałem za roboczy.
- **Zasada:** zasada backslasha obowiązuje **każdy** plik, który piszę — także roboczy, poza repo,
  w `dev-mods` i `%TEMP%`. Separator ścieżki w kodzie testu bez backslasha:
  `split(String.fromCharCode(92))` albo plik przez Write.

### L-0199 — Animacja „w toku” kręciła się, gdy nikt nie pracował · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E2, runda 4. Znacznik bieżącego punktu kręcił się zawsze; Łukasz:
  „cały czas się to kręci, mimo że teraz tak naprawdę nie wykonujemy żadnej pracy, no bo czat stoi
  i czeka na moje dyktowanie”. Te same dane pokazały punkty odhaczone nie po kolei jako
  „poszarpany” pasek.
- **Przyczyna:** ruch przywiązałem do stanu danych („jest punkt nieodhaczony”), a człowiek czyta ruch
  jako „ktoś teraz pracuje”; kolejność segmentów do tożsamości punktu, a człowiek czyta pasek jak
  postęp rosnący od lewej.
- **Zasada:** animacja na pasku znaczy **trwającą czynność** i ma za źródło sygnał narzędzia
  (`isWorking` pasma), nie stan pliku; spoczynek rysuje się nieruchomo. Wskaźnik postępu rośnie od
  lewej — tożsamość elementu przechodzi do dymka.

### L-0200 — Z zaakceptowanego wariantu przeniosłem barwy, a zgubiłem kształt · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E3. Łukasz zaakceptował w modzie wariant 3 „jedna kartka” (sekcje
  bez kart, linie gasnące). W panelu przemapowałem kolory i dołożyłem ramkę dookoła, a wszystkie
  dawne karty zostały — ramki w ramkach, zero linii. Łukasz: „Przecież Ty zepsułeś cały wygląd tego
  panelu”. Instalację przywróciłem z kopii.
- **Przyczyna:** zakres etapu mówił „E3 zmienia barwy, nie układ” i potraktowałem wariant jak paletę;
  przed oddaniem nie położyłem wyniku obok zaakceptowanego zrzutu.
- **Zasada:** po akceptacji wariantu przenosisz do produktu jego **kształt** (karty, linie, ramki,
  kolumna przycisków), nie tylko barwy; przed oddaniem zrzut albo model drzewa stoi obok
  zaakceptowanego zrzutu i porównujesz go punkt po punkcie. Zasady wyglądu panelu:
  `docs/zasoby/PANEL_RELAI/DESIGN.md`.

### L-0201 — Walidator silnika przepuszcza, desktop nie rysuje · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E3. Sonda 0.1.0 pokazana bez `plugin test` z montażem — panel pusty
  („has not drawn”), bo jeden `Text color` odrzucił całe drzewo (powtórzona zasada 13). Potem
  `light-dark()`/`var()` przeszły walidator, a desktop ich nie narysował; `Svg` z `alt=""` w ogóle
  się nie narysował i spod niego wyszła ukryta kopia tekstu.
- **Przyczyna:** zielony walidator i zielony test drzewa wziąłem za dowód, że coś się narysuje.
- **Zasada:** trzy szczeble, każdy osobno: walidator silnika → `plugin test` z `$.ui.mount` na
  desktopie (drzewo przyjęte) → zrzut na żywo (desktop narysował). Każdy `Svg` z niepustym `alt`,
  pilnowany testem na drzewie z kontrolą pozytywną.

### L-0202 — Rozwiązanie, które podwaja drzewo, mierzysz budżetem przed wdrożeniem · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E3. Kartka „kanapka” (ukryta kopia zakładki pod tłem `Svg`)
  zadziałała w sondzie, a w panelu ciężkie zakładki przekroczyły budżet drzewa (dokumenty 391 k, koszty
  421 k przy 200 k; zniknięcie zmierzone przy 256 k). Klucz `sheet` zderzył się z sekcją Ściąga.
- **Przyczyna:** sonda miała kilka kart, panel ma najgorsze dane; o nazwę klucza nie zapytałem drzewa.
- **Zasada:** mechanizm, który mnoży drzewo, sprawdzasz na teście budżetu z najgorszymi danymi, zanim
  pokażesz go człowiekowi, i ograniczasz go do miejsc, które się mieszczą (decyzja człowieka); nowy
  klucz najpierw szukasz w istniejących (`grep key=`).

### L-0203 — Backslash w heredocu i w literale Pythona to ten sam błąd, co w powłoce · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E3 (runda przeglądu UX). Trzy razy w jednej sesji tekst z
  backslashem szedł przez literał innego języka mimo aktywnej zasady: wyrażenia regularne testu
  przez `python - <<'EOF'` (ostrzeżenie `invalid escape sequence`, wynik akurat dobry), plik testu
  `.ts` z `/\\/g` przez heredoc powłoki (plik się nie wczytał: `Unterminated string literal`),
  `re.sub` z `\(` w `python -c` (podmiana nie zaszła po cichu).
- **Przyczyna:** wygoda hurtowej podmiany w Pythonie wygrała z zasadą, bo „to tylko jedna linia”.
- **Zasada:** każdy tekst z `\` — wyrażenie regularne, ścieżka, plik testu — idzie przez Write albo
  Edit, także wtedy, gdy reszta podmiany robi się skryptem; skrypt dostaje tylko tekst bez `\`.
  Po podmianie skryptem sprawdzasz `grep`-iem, że zaszła (L-0116, L-0119, L-0127, L-0130).

### L-0204 — Test przejścia po drzewie na węźle zbudowanym ręcznie nie dowodzi niczego · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, po zamknięciu E3. Łukasz: „zobacz co się dzieje teraz z
  hooverem. No tak nie może być” — ciemny pasek pod kursorem w jasnym wyglądzie, choć `retone`
  miał test na `hover`.
- **Przyczyna:** test budował węzeł ręcznie z `hover` w `props`; silnik trzyma `hover` i `press` na
  węźle (P-045). Test sprawdzał moje wyobrażenie o drzewie, nie drzewo.
- **Zasada:** funkcję, która przechodzi po drzewie z hooka, sprawdzasz na drzewie w kształcie, który
  naprawdę wychodzi do silnika — zapisanym z działającego modu albo zbudowanym przez `h()`; kształt
  węzła z ręki jest hipotezą do zmierzenia.

### L-0205 — Poprawka „zielona w teście” mierzysz na żywo diagnostyką, gdy dane testu są lżejsze · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E4. Pusty panel po rozwinięciu Mapy: test z rozwinięciem
  wszystkiego spadał (2109 jednostek) i po poprawce przechodził, a na żywo panel dalej był pusty —
  prawdziwa Mapa miała wagę 1 045, ale 64 rysunki z hoverem i 338 tys. znaków.
- **Przyczyna:** świat testu nie miał najcięższego składnika prawdziwych danych (rysunków
  z długim źródłem), a miara (`treeWeight`) liczyła rysunek po sztuce; „przechodzi w teście”
  wziąłem za dowód zachowania na żywo.
- **Zasada:** gdy poprawka ograniczenia silnika przechodzi w teście, a na żywo nie, pierwszym krokiem
  jest tymczasowy zapis diagnostyczny z działającego modu (miara, liczba i rozmiar elementów do
  pliku w katalogu roboczym) — dopiero z tych liczb nowa hipoteza; diagnostykę usuwasz przed
  dowodem. Narzędzie pomiaru stanu (skrypt zrzutów rozwijający wszystko) zmienia zapamiętany stan
  panelu — po nim sprawdzasz, czy panel nadal się rysuje.

### L-0206 — Zrzut okna z procesu bez świadomości DPI ucina obraz · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E4. `okno.ps1` zapisał okno 2766 × 1118, a paski nad promptem
  wypadły poza kadr; ten sam ekran w pikselach fizycznych ma 3458 × 1398.
- **Przyczyna:** PowerShell bez `SetProcessDPIAware` dostaje prostokąt okna w pikselach logicznych
  (skalowanie 125 %), a `PrintWindow` rysuje w fizycznych — bitmapa za mała obcina prawy dół.
- **Zasada:** skrypt zrzutu przez `PrintWindow` woła `SetProcessDPIAware()` przed
  `GetWindowRect`; kontrola: rozmiar zrzutu równa się rozdzielczości fizycznej okna, a element przy
  dolnej krawędzi (pole promptu) jest w kadrze.

### L-0207 — Backtick w `node -e` w cudzysłowie podwójnym wykonuje się w powłoce (powtórzenie L-0198) · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, E4. Dopisek do ryzyka C1 przez `node -e "…"` zgubił nazwy
  pluginów: powłoka wykonała `` `relai-panel` `` jako polecenie („command not found”).
- **Przyczyna:** zasada „dokumenty — tylko Edit” (L-0198) była w destylacie, a sięgnąłem po
  podmianę w powłoce, bo poprzednie podmiany bez backticków przeszły.
- **Zasada:** tekst dokumentu z backtickiem idzie wyłącznie przez Edit/Write — bez wyjątku na
  „krótką podmianę”; po każdej podmianie w powłoce na dokumencie `grep` stałego ciągu wstawionej
  treści. Powtórzenie — propozycja graduacji do `CLAUDE.md`; przyjęta 2026-10-15 (reguła procesu
  w `CLAUDE.md`, zgoda Łukasza: „ok dopisz”).

### L-0208 — `String.replace` z tekstem zastępczym czyta `$` jako wzorzec · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU, rytuał „Na koniec” E4. Wklejenie „Zasad aktywnych” do
  `PROMPT_ETAP_5.md` przez `prompt.replace('<<ZASADY>>', block)` zdublowało pół promptu: zasada
  z tekstem „`$` i `on`” niosła sekwencję dolara z backtickiem, którą `replace` rozwija w tekst
  przed dopasowaniem.
- **Przyczyna:** tekst zastępczy z dokumentu podany jako ciąg, nie jako funkcja; kontrola po
  wklejeniu sprawdzała tylko brak znacznika, nie liczbę nagłówków.
- **Zasada:** wklejając cudzy tekst w JS, zastępujesz funkcją (`replace(x, () => block)`) albo
  `slice`; po wklejeniu sprawdzasz nagłówki `^## ` (każdy raz) i obecność bloku w całości.

### L-0209 — Poprawka dymku podniosła wiersz baterii w spoczynku · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU E5. Po „Zobacz jak sie ucinaja te dymki” kapsuły dymków
  dostały zawijanie i zaczep w CSS; wiersz baterii urósł w spoczynku z 24 do 44 px, a wcześniej
  `.tN:hover` przyklejał dymek pod kursorem i łapał najechanie przed ikoną. Łukasz: „popsułeś
  wygląd […] nie wprowadzaj regresji”, „tu jest dokladnie ta sama sytuacja”.
- **Przyczyna:** testy sprawdzały nowe zachowanie dymku (zaczep, brak ucięcia), żaden nie
  trzymał wysokości wiersza bez najechania; własna kapsuła w `Svg` nie może wyjść poza ramkę,
  więc każda próba jej ratowania przesuwała geometrię spoczynku.
- **Zasada:** zmiana elementu chwilowego (dymek, najechanie, rozwinięcie) idzie razem z testem
  geometrii spoczynku (wysokość, x kolumn) na kilku szerokościach. Pełne słowa po najechaniu —
  natywny `<title>`; własna kapsuła w `Svg` tylko po pomiarze, że mieści się w ramce.

### L-0210 — Dopisanie do dokumentu heredokiem i `sed -i` w tabeli (powtórzenie L-0198) · 2026-10-15 · AKTYWNA

- **Trigger:** plan WYGLAD_PANELU E5. Sekcję §14.7 briefu i wpis zgody w `DZIENNIK.md` dopisałem
  przez `cat >> plik <<'EOF'`, a wiersz tabeli §0 briefu wstawiłem `sed -i` — oba teksty
  z backtickami. Treść przeszła cała (heredok w apostrofach, kontrola grepem), ale reguła
  „dokumenty — tylko Edit” z destylatu została złamana dwa razy w jednej sesji.
- **Przyczyna:** „dopisanie na końcu” i „jeden wiersz” odczytane jako nie-edycja; reguła mówi
  o zmianie dokumentu, każdej.
- **Zasada:** każdy zapis do dokumentu w `docs/` — także dopisanie na końcu i pojedynczy wiersz
  — idzie przez Edit/Write; powłoka tylko czyta dokumenty.

### L-0211 — `String.replace` z tekstem zastępczym zdublował połowę promptu etapu · 2026-10-16 · AKTYWNA

- **Trigger:** plan STRONA_RELAI, akceptacja. Zasady aktywne wstawiałem do `PROMPT_ETAP_1.md`
  skryptem Node: `cel.replace("{{ZASADY_AKTYWNE}}", tresc)`. Treść zasady 13 niesie „`$` i `on`”,
  czyli ciąg `` $` ``, który w tekście zastępczym znaczy „wszystko przed dopasowaniem” — plik
  dostał drugi raz trzy pierwsze sekcje. Naprawa też poszła powłoką (`cp` do `docs/`), wbrew
  L-0210.
- **Przyczyna:** tekst zastępczy `replace` nie jest dosłowny (`$&`, `` $` ``, `$'`, `$1`);
  zasada 5 pilnowała backslasha, nie dolara. Wstawka była sprawdzana licznikiem zasad (15),
  a nie strukturą całego pliku.
- **Zasada:** podstawienie cudzej treści w skrypcie idzie funkcją (`replace(z, () => tresc)`) albo
  `split/join`; po wstawce porównanie bajt w bajt ze źródłem **i** licznik nagłówków całego pliku.
  Dokument w `docs/` składany skryptem powstaje w katalogu roboczym, a do `docs/` trafia przez
  Write.

### L-0212 — Komenda weryfikacji `node --test site/` nie mogła przejść na żadnej treści · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E1. Punkt 1 Weryfikacji wymagał `node --test site/`; w Node 24.13.1
  forma katalogowa kończy się „Cannot find module …\site” (1 fail) niezależnie od testów — dwa
  subagenty zgłosiły to osobno, 91 testów przechodziło wzorcem plików.
- **Przyczyna:** autor promptu wpisał komendę z pamięci, bez uruchomienia jej na pustym katalogu
  ani w wersji Node z repo; Node 22+ traktuje argument `--test` jak moduł albo wzorzec, nie katalog.
- **Zasada:** komenda w sekcji Weryfikacja ma za sobą jeden realny przebieg autora promptu — choćby
  na pustym zbiorze; testy Node wołasz wzorcem (`node --test "site/**/*.test.mjs"`). Idempotencję
  plików nieśledzonych dowodzisz sumą przed i po drugim przebiegu, nie `git diff` (i nie `git add -N`
  „na chwilę” — to zapis w indeksie).

### L-0213 — Łagodny tryb zastępczy ukrył własny błąd składni, a ukrywanie tekstu zmierzyło sam tekst · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E1, dwa przypadki. (1) Druga deklaracja `const cel` w `scena.js` wywróciła
  moduł; strona bez słowa przeszła w tryb bez WebGL i zrzut „po poprawce” pokazał płaską stronę.
  (2) Pomiar kontrastu hero dał najgorszy piksel 1,00 : 1, bo `visibility: hidden` na rodzicu nie
  ukrył przystanków z inline `visibility: visible` — instrument zmierzył litery, nie tło.
- **Przyczyna:** wdzięczna degradacja jest dla odwiedzającego, ale przy pracy zamienia błąd w „inny
  wygląd”; `visibility` dzieci wygrywa z rodzicem, `opacity` nie.
- **Zasada:** po każdej zmianie kodu sceny pierwsza asercja to tryb (`tryb-3d` na `<html>`), dopiero
  potem zrzut; tło pod tekstem fotografujesz z `opacity: 0` na rodzicu i z kontrolą pozytywną na
  jasnym obiekcie kadru (musi dać ~1 : 1), a wynik 1,00 : 1 na całej linii to najpierw instrument.

### L-0214 — Ukryty panel przeglądarki nie tyka `requestAnimationFrame`, a rozmiar okna sam się kasuje · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E1. Kliknięcie w mapę przesunęło stronę o 1,6 px, płynne przewijanie
  stało w miejscu, a skrypt mierzący klatki wisiał 45 s: panel aplikacji był ukryty (strona w tle).
  Po pokazaniu panelu ustawione 1366 × 768 zerowało się przy każdej zmianie szerokości panelu.
- **Przyczyna:** strona w ukrytym panelu działa jak karta w tle; emulacja rozmiaru w panelu należy
  do panelu, nie do sesji.
- **Zasada:** ruch, czas klatki i płynne przewijanie mierzysz tylko w widocznej stronie; kadry
  pomiarowe o stałym rozmiarze robisz w osobnej stronie Chrome przez DevTools (`emulate viewport`,
  izolowany kontekst), a panel aplikacji służy do pokazania człowiekowi.

### L-0215 — Edycja pliku przez `node -e` z `\n` w napisie (powtórzenie L-0210) · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E1. Przestawienie dziesięciu pozycji w `site/biurko/obiekty.js` poszło
  jednym `node -e` z podmianami, z których dwie niosły `\n` w napisie. Zadziałało, ale to dokładnie
  droga zakazana zasadą 5.
- **Przyczyna:** pośpiech przy serii drobnych podmian; „tylko liczby” uśpiło regułę, choć dwie
  podmiany obejmowały koniec linii.
- **Zasada:** bez zmian względem zasady 5 — seria podmian w kodzie to kilka wywołań Edit albo skrypt
  zapisany Write; liczy się każdy `\n` w napisie, także w kotwicy podmiany.

### L-0216 — Zasób wybrany z nazwy wrócił po pobraniu jako nieużywalny · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E2. Z karty zgody pobrane Metal012 (chrom zamiast aluminium),
  Cardboard002 (falista tektura) i Paper003 (zmięty papier); każdy wymagał drugiej karty i drugiego
  pobrania. Drewno blatu `wood_table_worn` przeszło kartę, a po dwóch rundach kalibracji Łukasz
  dalej nie widział słojów — skan nie ma słojów, tylko plamy.
- **Przyczyna:** kandydaci szli na kartę z nazwy i opisu biblioteki; miniaturę na kuli i średnią
  barwę oglądałem dopiero po pobraniu.
- **Zasada:** przed kartą zgody kandydaci idą na jedną stronę porównania z miniaturami bibliotek
  (Poly Haven: `cdn.polyhaven.com/asset_img/thumbs/<id>.png`) obok obrazu wzorcowego; cecha, o którą
  chodzi wzorcowi (słoje, faktura, połysk), ma być widoczna już na miniaturze.

### L-0217 — Niebo okna stało centymetr za ścianą przez dwie rundy kalibracji · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E2. Płaszczyzna nieba w oknie leżała na z = −0,63, a ściana bez otworu
  na z = −0,62; przez okno było widać tynk, który Łukasz nazwał „zasłoniętą roletą”. Po wycięciu
  otworu niebo za oknem zniknęło drugi raz — leżało dalej niż `far` kamery (20 m).
- **Przyczyna:** obiekty za płaszczyzną sprawdzałem w kodzie, a kadry oglądałem w pomniejszeniu, gdzie
  okno ma kilkadziesiąt pikseli; rozmieszczenie względem ściany i zakresu kamery nie miało pomiaru.
- **Zasada:** obiekt za płaszczyzną (okno, ekran, dziura) sprawdzasz kadrem przystanku, na którym
  zajmuje największą część obrazu, w pełnej rozdzielczości; nowy obiekt dalej niż 10 m — najpierw
  porównanie z `near`/`far` kamery.

### L-0218 — Przeładowanie strony z adresem nie odświeżyło modułów ES · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E2. Dwie poprawki (pozycja miasta, barwa korka) „nie zadziałały”
  w kadrze — `navigate_page` z `type: url` i `ignoreCache` pobrał nowy HTML, ale moduły
  `biurko/*.js` przyszły z pamięci podręcznej. Dwa kadry poszły do oceny ze starym kodem.
- **Przyczyna:** `ignoreCache` przy nawigacji pod adres nie obejmuje importów modułów; obejmuje je
  dopiero przeładowanie (`type: reload` z `ignoreCache`).
- **Zasada:** po zmianie modułu strona idzie przez `reload` z `ignoreCache`, a pierwsza asercja
  sprawdza, że przeglądarka ma nowy kod (np. `fetch` modułu z `no-store` i szukany fragment) — dopiero
  potem kadr.

### L-0219 — Miasto z 76 brył dało 1400 wywołań rysowania na klatkę · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E2. Bloki za oknem jako osobne `Mesh` z tablicą sześciu materiałów:
  2206 wywołań rysowania na klatkę (render, cienie kontaktowe, głębia ostrości liczą scenę osobno),
  p95 klatki przy CPU ×4 22,3 ms. Po scaleniu w jedną geometrię z atlasem fasad: 913 wywołań,
  p95 16,7 ms, obraz bez zmian.
- **Przyczyna:** koszt obiektu w scenie z efektami obrazu mnoży się przez liczbę przejść i grup
  materiału, a widziałem tylko liczbę trójkątów.
- **Zasada:** dekoracja z wielu powtarzalnych brył od razu idzie jako jedna geometria (scalona albo
  instancjonowana) z jedną teksturą; liczbę wywołań rysowania na klatkę mierzysz opakowaniem
  `drawElements`/`drawArrays` kontekstu przed i po dodaniu obiektu.

### L-0220 — Płaskość sceny to światło, nie rozdzielczość tekstur · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E2. Po uwadze „za płaskie” dwie rundy dokładały tekstury 2K, cienie
  kontaktowe, głębię ostrości i przedmioty; Łukasz za każdym razem: „nadal daleko od wzorca”. Dopiero
  ocena po przełączeniu na Opus nazwała przyczynę: wzorce mają światło odbite (ściana i spody
  przedmiotów rozświetlone), a rasteryzacja go nie liczy — stąd Aneks B z path tracingiem.
  Etap szedł na Sonnet 5.5 za zgodą na rozjazd modelu; przy ocenie smaku nie przypomniałem o nim.
- **Przyczyna:** odpowiadałem na objaw („więcej detalu”) zamiast porównać kadr ze wzorcem po
  kategoriach (światło, materiał, obiektyw, kompozycja); zgoda na rozjazd modelu przestała być
  widoczna po starcie.
- **Zasada:** uwaga „nie tak jak na wzorcu” najpierw idzie na rozbiór kadru po kategoriach
  (światło, materiał, obiektyw, kompozycja) z jedną przyczyną wskazaną wprost i granicą techniki,
  zanim powstanie kolejna runda; etap z oceną smaku na modelu słabszym niż wymagany ma przypomnienie
  o rozjeździe przy pierwszej kalibracji.

### L-0221 — Łukasz dwa razy z rzędu wskazał matrycę, której nie zbudowałem jak prawdziwej · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E3. Ekran HTML był wpasowany w siatkę co do 0,04 px, a Łukasz zobaczył
  na zrzutach: „widzisz te zaokrąglenia ramek”, potem „sam laptop też ma swoją ramkę… na dole tuż nad
  widokiem klawiatury, zapoznaj się z tym, jak wyglądają matryce”, potem „tyle samo czarnego paska
  na górze jak i na dole”. Czarne szkło było prostokątem 2,8 mm przed klapą o rogach 12 mm, sięgało do
  zawiasu i miało podbródek 2,5 raza grubszy niż górna ramka.
- **Przyczyna:** pomiar dowodził wpasowania HTML w siatkę, a nie tego, że sama siatka jest
  urządzeniem. Warstw prawdziwej konstrukcji (szkło na powierzchni klapy, uszczelka, pas aluminium nad
  zawiasem, rogi szkła za obrysem obudowy, równa ramka) nie sprawdziłem ze wzorcem przed pokazem.
- **Zasada:** przedmiot-urządzenie w scenie budujesz warstwami jego prawdziwej konstrukcji i przed
  pierwszym zrzutem dla człowieka oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca:
  czy warstwa wewnętrzna nie wystaje poza obrys zewnętrznej, czy leży na powierzchni, nie przed nią,
  i czy marginesy, które w urządzeniu są równe, są równe w liczbach.

### L-0222 — Okno DevTools za innymi oknami dawało 2 klatki na sekundę · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E3. Przybliżenie „nie kończyło się” po 5 s, płynne przewinięcie z mapy
  skoczyło jednym zdarzeniem i nie wysłało `scrollend`, wycofanie z przybliżenia wyglądało na błąd
  kodu. Pomiar `requestAnimationFrame`: 2 na sekundę; po `select_page` z `bringToFront` — 181.
  Wbudowany panel przeglądarki rysuje klatki dopiero przy zrzucie, a jego schowek jest odcięty od
  systemu (`Get-Clipboard` zwracał starą treść).
- **Przyczyna:** przeglądarka dławi zasłonięte okno; L-0214 mówił o widocznej stronie, a nie
  o widocznym oknie.
- **Zasada:** zanim uznasz animację albo przejście za błędne, zmierz liczbę `requestAnimationFrame`
  na sekundę w tej samej stronie; poniżej 30 — najpierw `bringToFront`, potem diagnoza. Schowek
  systemu sprawdzasz tylko w prawdziwym Chrome (DevTools), nie w panelu przeglądarki aplikacji.

### L-0223 — Budżet „9,0 MB” z E2 był w MiB · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E3. Ten sam rodzaj pomiaru dał 9,55 MB wobec 9,0 MB po E2, choć etap
  dodał 0,11 MB. Ten sam instrument na drzewie HEAD (worktree) dał 9,44 MB, czyli dokładnie
  9,00 MiB; wpis E2 opisał 11 543 902 B jako „10,99 MB”.
- **Przyczyna:** liczba trafiła do dziennika z etykietą jednostki, w której jej nie liczono.
- **Zasada:** liczba budżetu niesie jednostkę zdefiniowaną w instrumencie (MiB = 2^20 B, zapisane
  w `site/README.md`); porównanie z poprzednim etapem robisz tym samym instrumentem na drzewie
  poprzedniego commitu, zanim przypiszesz różnicę zmianie.

### L-0224 — Własny `scrollTo` po zmianie rozmiaru wyglądał jak przewinięcie wstecz · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E3. Przybliżenie ekranu wycofywało się po zmianie rozmiaru okna:
  obsługa `resize` przewija programowo do tej samej pozycji toru, nowa droga jest krótsza, więc
  `scrollY` maleje, a reguła „przewinięcie wstecz oddala” brała to za gest odwiedzającego.
- **Przyczyna:** zdarzenie `scroll` nie mówi, kto przewinął; stan „ostatnie Y” aktualizował tylko
  odbiornik przewinięcia.
- **Zasada:** kod, który sam przewija stronę, zapisuje docelowe położenie w stanie odbiornika przed
  `scrollTo`; reguła oparta na kierunku przewinięcia ma test z programowym przewinięciem obok testu
  gestu.

### L-0225 — Generator path tracera źle wypiekał klawiaturę i książki · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E4. Pierwszy obraz z path tracera miał metrową płytę przed biurkiem
  i pomieszane tekstury (korek ze słojami drewna, czarne karteczki); raycaster sceny nie trafiał
  niczego w tym miejscu.
- **Przyczyna:** `three-gpu-pathtracer` 0.0.27 wypieka `InstancedMesh` jako samą geometrię bazową
  (klawiatura z 74 klawiszy → kostka 1 m) i numeruje scalone grupy numerem siatki, a listę
  materiałów rozwija po siatkach wielomateriałowych — od pierwszej książki każda siatka dostaje cudzy
  materiał. Zastępcze siatki z `matrixAutoUpdate = false` bez `updateMatrixWorld` lądowały w zerze
  układu.
- **Zasada:** cudzy generator sceny sprawdzasz, zanim ocenisz obraz: pudełko wypieczonej geometrii
  każdej siatki obok `Box3.setFromObject(o, true)` na całej scenie, a referencyjna klasa biblioteki
  na tej samej scenie odróżnia błąd okablowania od błędu sceny. Nieobsługiwane kształty upraszczasz
  na czas budowy, bez łatania vendora.

### L-0226 — Światło nie zastąpiło detalu · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E4. Path tracing dał światło odbite i miękkie cienie, a Łukasz ocenił
  efekt jako „słaby, bez uzysku”: obrazy wzorcowe są fotograficzne dzięki detalowi powierzchni
  i przedmiotów (zużycie drewna, pismo na kartkach, nakrapiana ceramika), nie dzięki globalnemu
  oświetleniu. Etap planu (Aneks B) zbudowano na hipotezie z rozbioru kadru E2 bez testu.
- **Przyczyna:** rozbiór kadru (L-0220) wskazał jedną przyczynę — światło — i nikt jej nie sprawdził
  tanim testem na jednym kadrze, zanim powstał etap z nową zależnością.
- **Zasada:** dystans do wzorca rozbierasz najpierw na detal przedmiotów, rozdzielczość tekstur
  i kompozycję; technika światła dopiero, gdy detal stoi. Hipotezę „to X zrobi różnicę” sprawdzasz
  najtańszym testem na jednym kadrze z werdyktem człowieka, zanim zaplanujesz etap.

### L-0227 — Koszt pierwszej wizyty ukrywała ciepła pamięć shaderów · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E4. Kompilacja path tracera po przeładowaniu trwała 51 ms; pierwsze
  wejście blokowało stronę na ok. 8 s. Widać to było tylko w dziurze w logu pomiaru.
- **Przyczyna:** Chrome trzyma skompilowane programy na dysku; `compileAsync` (KHR_parallel_shader_compile)
  nie blokuje, ale ANGLE/D3D11 kompiluje wariant pod rysowanie przy pierwszym `draw` — synchronicznie.
  Rozgrzewka w workerze przyspiesza linkowanie, nie rysowanie.
- **Zasada:** koszt pierwszej wizyty mierzysz z unikalną definicją w shaderze (sól = zimna pamięć),
  osobno kompilację i pierwsze rysowanie, licznikiem przerw głównego wątku; drugi pomiar po
  przeładowaniu nie jest pomiarem pierwszej wizyty.

### L-0228 — Opcja w pytaniu opisała wariant inaczej niż plan · 2026-10-16 · AKTYWNA

- **Trigger:** STRONA_RELAI E4. W pytaniu o kierunek opisałem „Film” jako fotorealizm z obrazów lub
  wideo; w planie Film to kinowy przelot w języku filmu 3.0.0 z grafiką z kodu, a Aneks A pkt 2
  wyklucza zdjęcia na stronie. Łukasz wybrał opcję w moim brzmieniu.
- **Przyczyna:** opis wariantu z pamięci rozmowy, nie z sekcji planu.
- **Zasada:** opcja, która odwołuje się do etapu albo wariantu planu, cytuje jego definicję z planu
  (sekcja, aneks); rozjazd wykryty później — sprostowanie i ponowne pytanie przed zapisem czegokolwiek.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
