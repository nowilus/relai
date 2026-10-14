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
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129)
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
     obok siebie (L-0184).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek (L-0116, L-0119, L-0135, L-0148,
     L-0188, L-0192); znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
   - **Kontrola pozytywna:** zero trafień przy niepustych zbiorach to defekt instrumentu do czasu
     dowodu, a trafienie na materiale dotąd zdrowym sprawdzasz najpierw na instrumencie; scenariusz
     „konfiguracji nie ma” mierzysz z podstawionym katalogiem domowym; dokładasz przypadek, który **musi** trafić, na **tym samym wejściu**, którego mechanizm
     naprawdę pilnuje (nie z jego listy wyłączeń); przebieg „oczekuję ciszy" ważny tylko z kontrolą
     pozytywną w tym samym przebiegu; obok wzorca licznik „ile odrzucono” i „ile bez pary”;
     generator identyfikatorów sprawdzasz na wszystkich kandydatach; wartość podkładaną — wobec
     zbioru dozwolonego (L-0173); kontrola negatywna zmienia mierzoną wielkość, nie jej obraz (L-0181).
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
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181)
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
      kontrast — pomiar i wybór zamiast kolejnej rundy (L-0196).
    - **Nośnik:** na ograniczonym zestawie elementów sonda ustala pułap przed projektem, warianty
      w tym samym nośniku, ograniczenie mówione wprost; nowy element zbioru różnisz kształtem,
      porównanie na całym zbiorze w skali docelowej; plan z interfejsem wskazuje źródło motywu
      w pierwszym etapie, który rysuje więcej niż linię. Ostrzeżenie `plugin validate` o root
      `CLAUDE.md` jest skutkiem dogfoodingu — nie naprawiasz.
    - **Liczby i słowa:** procenty i kwoty z dwoma miejscami (L-0145); etykieta stanu słowem
      i znakiem, „x/y” tylko gdy y jest celem (L-0147); słowo o przeszłości ma warunek prawdziwości
      i test (L-0149); komórka liczby `flexShrink={0}` (L-0152); karta decyzji w całości tylko dla
      pozycji, które zmienia (L-0157); adnotacja mówi wartość wyliczoną (L-0176).
    - **Film:** element trwały po ruchu kamery bez 3D i filtra, przegląd klatki największego
      zbliżenia (L-0171); przejście przez wspólne tło, krój rozróżniający „1” i „I” (L-0174);
      „tego nie pokazujemy” szukasz we wszystkich tekstach kadru (L-0178); dźwięk z gotowych źródeł,
      próbki do wyboru (L-0179); licencję czytasz na stronie utworu, plik z kartą źródła i testem
      (L-0180); drugi język zaczyna się od jednej klatki i pytania, dla kogo (L-0183).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196)

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

### L-0177 — Scena chwili z przeszłości liczona z danych żywych pokazywałaby inny etap w dniu wydania · 2026-10-12 · AKTYWNA

- **Trigger:** scena 4 pokazuje kartę startu E4, ze statusem „GOTOWY DO STARTU” i 16 punktami
  weryfikacji. Ta sama karta policzona z bieżącego `STATUS.md` w chwili pisania sceny pokazywała
  już „W TOKU” z ostrzeżeniem, a w dniu renderu wydania (E6) pokazałaby „ZREALIZOWANY”.
- **Przyczyna:** scena 2 i finał mają pokazywać plan „w stanie z dnia renderu”. Scena 4 opowiada
  jedną chwilę z przeszłości. Ten sam mechanizm danych żywych daje w niej fałsz, który narasta
  z każdym etapem.
- **Zasada:** dane sceny dzielisz na „stan dziś” i „chwilę z przeszłości”. Chwilę liczysz tym samym
  kodem produktu, ale z plików przypiętych do commitu tej chwili (`git show <commit>:<plik>`),
  z commitem w polu `zrodlo`. Status ustawiany przez proces po tej chwili (`W TOKU` po starcie)
  wpisujesz jawnie, ze wskazaniem kroku procesu, który go ustawia.
- **Źródło:** FILM_PREZENTACYJNY E4, 2026-10-12; destylat: zasada 4.

### L-0178 — Słowo wycofane decyzją człowieka wracało do kadru cytatem · 2026-10-12 · AKTYWNA

- **Trigger:** Łukasz zdecydował, że karta w scenie 4 nie pokazuje „⚠ plan nie wskazuje modelu”.
  Wiersz Model poprawiłem, ale pasek postępu w tej samej scenie cytował pierwszy punkt promptu E4:
  „Pytanie o kartę »⚠ plan nie wskazuje modelu« padło na starcie…”. Wyszło to dopiero na klatce
  kontrolnej.
- **Przyczyna:** decyzję zastosowałem do miejsca, o które pytałem, a nie do słowa. Cytat
  (nazwy punktów, wiersze diffu) z założenia wymyka się testowi faktów, więc nic go nie pilnowało.
- **Zasada:** decyzja „tego nie pokazujemy” dotyczy treści, nie elementu. Po takiej decyzji szukasz
  jej brzmienia we wszystkich tekstach kadru, także w cytatach wyłączonych z testu faktów, i każde
  trafienie rozstrzygasz: usuwasz element albo pytasz. Zdjęcie elementu zgłaszasz człowiekowi przy
  pokazie.
- **Źródło:** FILM_PREZENTACYJNY E4, 2026-10-12, własny przegląd klatek; destylat: zasada 15.

### L-0179 — Muzyka skomponowana na ślepo poszła do pełnego renderu i została odrzucona w całości · 2026-10-12 · AKTYWNA

- **Trigger:** Łukasz poprosił o muzykę „bez licencji, darmową — ogarnij sam”. Napisałem syntezę
  w kodzie (pad z detuningiem i wibrato, struny Karplusa–Stronga, pogłos), sprawdziłem ją tylko
  liczbami (RMS, szczyt, długość) i od razu wpiąłem pod cały film. Pokaz: „psychodeliczna dziwna
  muzyka… zupełnie nieakceptowalne”, prośba o minimum cztery warianty prawdziwych nagrań.
- **Przyczyna:** w medium, którego nie umiem odebrać (dźwięk), liczby mówią o poziomie, nie
  o smaku. Pominąłem zasadę „jeden wariant do kalibracji przed serią” i wybrałem drogę, której
  wyniku nie mogłem ocenić, zamiast pokazać człowiekowi gotowe nagrania do wyboru.
- **Zasada:** materiał, którego nie potrafię odebrać zmysłem, na który działa (dźwięk, głos),
  biorę z gotowych źródeł z licencją sprawdzoną na stronie utworu i daję człowiekowi **próbki do
  wyboru przed integracją**; synteza najwyżej jako jedna z opcji, z uprzedzeniem, że jej nie
  słyszę. Ograniczenie mówię wprost razem z pytaniem, nie po odrzuceniu.
- **Źródło:** FILM_PREZENTACYJNY E5, 2026-10-12, runda 2 pokazu; destylat: zasada 15.

### L-0180 — „Darmowa muzyka” wybrana przez człowieka miała licencję NC-SA · 2026-10-12 · AKTYWNA

- **Trigger:** Łukasz sam wskazał dwa utwory z Free Music Archive. Na stronie utworu: „daylight
  hour” — CC BY 4.0 (przypisanie, krótszy od filmu), „Die Mit Dem Kontrabass” — CC BY-NC-SA 3.0,
  czyli tylko niekomercyjnie i z obowiązkiem wydania filmu na tej samej licencji.
- **Przyczyna:** „darmowe do pobrania” w serwisie z muzyką nie znaczy „wolne do użycia w produkcie”;
  licencja jest cechą utworu, nie serwisu, a filtr wyszukiwarki łączy kilka licencji naraz.
- **Zasada:** zanim cudzy materiał wejdzie do artefaktu, czytasz licencję **na stronie tego
  utworu** (link do creativecommons.org) i mówisz człowiekowi jej skutki dla wydania — NC, SA,
  wymóg kredytu, długość wobec potrzeby. Plik wchodzi do repo z kartą źródła (adres, suma sha256,
  licencja, tekst kredytu), a test pilnuje sumy i kredytu w dokumentach, które licencja wskazuje.
- **Źródło:** FILM_PREZENTACYJNY E5, 2026-10-12, Aneks C; destylat: zasada 15.

### L-0181 — Kontrola negatywna instrumentu czytelności nie mogła się nie udać · 2026-10-13 · AKTYWNA

- **Trigger:** `telefon.py --kontrola` miał pokazać, że ta sama klatka w 1/3 wielkości nie przechodzi
  progu 7 px. Na klatce 100 pętli dał minimum 7,5 px — „klatka trzy razy mniejsza przechodzi”.
- **Przyczyna:** kontrola zmniejszała klatkę do 1/3 i powiększała ją z powrotem (`NEAREST`) do tej
  samej wielkości, więc glify miały tę samą wysokość, tylko w kratkę. Na klatce 132 kontrola
  „trafiała” wyłącznie dzięki kursorowi, który był linią poniżej progu w obu wersjach.
- **Zasada:** kontrola negatywna zmienia **mierzoną wielkość**, nie jej obraz — zmniejszony materiał
  kładziesz na płótnie tej samej wielkości, a wynik kontroli porównujesz z liczbą, jaką defekt
  musi dać (1/3 z 7 px → ok. 2–3 px), nie z samym „nie przeszło”. Kontrolę sprawdzasz na co najmniej
  dwóch klatkach różnej treści, bo jedna klatka może trafić z innego powodu.
- **Źródło:** FILM_PREZENTACYJNY E6, 2026-10-13; destylat: zasada 5.

### L-0182 — Pomiar na artefakcie wyrenderowanym przed ostatnią zmianą kodu · 2026-10-13 · AKTYWNA

- **Trigger:** kontrola telefonu na pętli EN dała 2,0 px i siedem linii poniżej progu; na pętli PL
  — jedną. GIF EN był z 23:21, PL z 23:29, a powiększenie panelu (zoom 1,6) weszło między nimi.
- **Przyczyna:** przerwana sesja zostawiła dwa pliki wyjściowe z różnych wersji kodu; wpis
  dziennika mówił „pętle gotowe”, a pomiar wziął plik, który był, nie plik z bieżącego kodu.
- **Zasada:** artefakt wyjściowy, na którym stawiasz punkt weryfikacji, renderujesz od nowa
  w tej sesji z bieżącego kodu (albo porównujesz jego czas z ostatnią zmianą źródeł) — wszystkie
  warianty językowe w jednym przebiegu, zanim zaczniesz rozbierać wynik.
- **Źródło:** FILM_PREZENTACYJNY E6, 2026-10-13; destylat: zasada 4.

### L-0183 — Wersja językowa materiału o produkcie w jednym języku zakwestionowana na pokazie · 2026-10-13 · AKTYWNA

- **Trigger:** na pokazie filmu EN Łukasz zapytał, po co wersja angielska, skoro panel, paski
  i wszystkie zrzuty są po polsku — napisy EN nad polskim interfejsem „mijają się z celem”. Wersja
  EN zeszła do roli zapasu (Aneks E) po trzech etapach pracy nad słownikiem, testami i renderem.
- **Przyczyna:** plan przyjął PL i EN jako cel wprost, a reguła „słowa produktu bez tłumaczenia”
  rozstrzygnęła, jak wersja EN ma wyglądać, nie czy ma sens dla widza; pierwszy kadr EN człowiek
  zobaczył dopiero po renderze.
- **Zasada:** materiał w drugim języku o produkcie, którego interfejs jest tylko w jednym, idzie
  do człowieka **jedną klatką z interfejsem** przed pracą nad słownikiem — z pytaniem, dla kogo jest
  i czy nie wystarczy wersja podstawowa; reguła tłumaczenia jest drugim pytaniem, nie pierwszym.
- **Źródło:** FILM_PREZENTACYJNY E6, 2026-10-13, Aneks E; destylat: zasada 15.

### L-0184 — Parser pola, którego specyfikacja nie nazywa etykietą, czytał jeden zapis z pięciu · 2026-10-13 · AKTYWNA

- **Trigger:** karta startu etapu w panelu pokazywała „⚠ plan nie wskazuje modelu” na planie,
  który model ma. `requiredModel()` rozpoznawał model w 1 z 13 realnych `STATUS.md`; repo trzyma
  pięć zapisów (bez etykiety, `Model wykonawczy etapów:`, `model wykonawczy etapów:`, `Modele:`,
  linia łamana na kilka wierszy — tak wygląda też przykład w `SPEC_STATUS`).
- **Przyczyna:** parser powstał na jednym pliku (PANEL_CLAUDE) i jego teście; `SPEC_STATUS` opisuje
  pole prozą („model wykonawczy etapów — dosłownie tak, jak odpowiedział użytkownik”), bez
  etykiety do dopasowania. Usterka czekała dwa etapy na odnogę, a film miał w tym czasie
  dopisywaną etykietę jako obejście.
- **Zasada:** parser pola, które specyfikacja opisuje prozą, ma test na **każdym zapisie tej
  rodziny dokumentów w repo** (przebieg starego i nowego kodu na tych samych plikach, liczba
  rozpoznanych obok liczby wszystkich) i na przykładzie z samej specyfikacji; zapis
  niejednoznaczny daje ciszę. Obejście w konsumencie niesie w teście warunek, który sam wskaże
  chwilę jego usunięcia — test filmu padł dokładnie po poprawce i powiedział, co zdjąć.
- **Źródło:** FILM_PREZENTACYJNY E7, 2026-10-13, Aneks F; destylat: zasada 4.

### L-0185 — Komenda zakładała pliki tymczasowe pod `.claude/`, a harness tam nie pisze · 2026-10-14 · AKTYWNA

- **Trigger:** pomiar E1 HUMANIZACJA w świeżych sesjach `claude -p`: w trzech z trzech przebiegów
  z wersją poprawioną zapis `.claude/relai/work/humanize/<id>-oryginal.md` został odrzucony jako
  edycja ścieżki wrażliwej, mimo `Write` na liście dozwolonych. Strażnik faktów nie ruszył; model
  porównał teksty czytaniem i powiedział to wprost.
- **Przyczyna:** procedura komendy zakładała, że katalog roboczy RelAI jest zwykłym miejscem zapisu
  dla modelu. Dla harnessu `.claude/` jest konfiguracją: w `-p` zapis pada, w sesji interaktywnej
  pytałby o zgodę przy każdym wywołaniu.
- **Zasada:** narzędzie wołane przez model w trakcie komendy nie dostaje plików tymczasowych pod
  `.claude/` — tekst idzie na stdin heredokiem z terminatorem w cudzysłowie, jednym poleceniem bez
  doklejonych części. Przebieg „strażnik bez różnic” liczy się tylko z wynikiem skryptu
  w transkrypcie, nie ze zdaniem modelu.

### L-0186 — Testy wydanego filmu czytały bieżące repo i czerwieniały po każdej zmianie · 2026-10-14 · AKTYWNA

- **Trigger:** pomiar bazowy E1 HUMANIZACJA: 5 z 36 testów filmu 3.0.0 padało już przed etapem
  (więcej testów rdzenia, plan filmu w archiwum), a dodanie piętnastej komendy przewróciło szósty.
- **Przyczyna:** testy wierności porównują dane filmu z danymi przeliczonymi na drzewie roboczym.
  Dzień po wydaniu każda zmiana repo, także niezwiązana z filmem, wygląda jak usterka filmu.
- **Zasada:** test wydanego artefaktu liczy dane ze stanu wydania (tag, worktree) albo przypina
  zbiór wydany stałą listą z kontrolą, że jej elementy nadal istnieją; bieżące repo jest wejściem
  tylko dla artefaktu w toku (odnoga FILM_TESTY_V3, scena 4 przypięta w E1).

### L-0187 — Odpowiedź z wywiadu zapisana w projekcie przegrywała z plikiem tej samej sesji · 2026-10-14 · AKTYWNA

- **Trigger:** przebieg interaktywny E2 HUMANIZACJA. Pierwszy wywiad Łukasz zapisał z zasięgiem
  „ta sesja”, a `/relai-humanize ustawienia` w tej samej sesji z zasięgiem „ten projekt”. Wiersz
  projektu powstałby poprawnie, ale do końca sesji rozstrzygałby plik sesji z pierwszej odpowiedzi.
- **Przyczyna:** pierwszeństwo warstw (sesja → projekt → globalnie) było przetestowane na odczycie,
  a zapis traktował każdą warstwę osobno. Nikt nie zapytał, co zobaczy człowiek zaraz po zapisie.
- **Zasada:** zapis w warstwie niższej niż plik **tej** sesji kasuje ten plik, bo człowiek właśnie
  odpowiedział od nowa. Cudzych sesji nie rusza. Wynik zapisu podaje, która warstwa rozstrzyga po
  zapisie (`rozstrzyga`), a komenda mówi o tym, gdy to nie jest warstwa właśnie zapisana. Test zapisu
  w warstwach sprawdza stan odczytu po zapisie, nie tylko plik.

### L-0188 — Wyrażenie regularne puszczone przez `node -e` w powłoce straciło backslash · 2026-10-14 · AKTYWNA

- **Trigger:** E2 HUMANIZACJA, poprawka `humanize-mode.js`. Podmiana zakresu znaków diakrytycznych
  na `\p{M}` poszła skryptem `node -e "…"` w podwójnym cudzysłowie Basha. W pliku wylądowało
  `/p{M}/gu`, wyrażenie bez backslasha, które dopasowuje literalny tekst „p{M}”. Wyłapała to
  kontrola `grep` zaraz po zapisie.
- **Przyczyna:** zasada L-0116/L-0119 już to zakazywała. Złamałem ją, bo zmiana wyglądała na
  „tylko podmianę jednego ciągu”, a nie na pisanie skryptu. Druga pułapka tego samego kroku: zakres
  znaków łączących wpisany w Write trafił do pliku jako niewidoczne znaki.
- **Ciąg dalszy tej samej sesji:** heredok z testami pełnymi backslashy przewrócił Basha
  („unexpected EOF”), a podmiana w `STATE.md` przez `node -e "…"` z backtickami w treści wykonała
  podstawienia — powłoka uruchomiła `on`, `off` i próbowała wykonać `docs/USTAWIENIA.md` jako
  skrypt (padł na składni w linii 7; `git diff` potwierdził, że pliki są nietknięte).
- **Zasada:** każda zmiana tekstu z backslashem **albo backtickiem** idzie przez Edit albo Write,
  także jednolinijkowa podmiana; dokumenty projektu — wyłącznie Edit. Znaki łączące usuwasz przez
  `\p{M}` z flagą `u`, nie zakresem wpisanych znaków. Po zapisie sprawdzasz `cat -A` albo `grep`
  stałego ciągu, a po każdym błędzie powłoki — `git diff` plików, które polecenie wymieniało.

### L-0189 — Stan „raz na turę” kasowany przez każde zdarzenie promptu, także przez „tak” · 2026-10-14 · AKTYWNA

- **Trigger:** E3 HUMANIZACJA, recenzja kodu hooka `humanize-continuous` (HIGH). Hook kasował stan
  „raz na plik w turze” przy każdym `UserPromptSubmit`. W trybie „dwie wersje” człowiek odpowiada
  „tak”, a to też jest `UserPromptSubmit`: stan znikał i zapis zaakceptowanej wersji dostawał regułę
  „popraw prozę” drugi raz. Pętlę zatrzymywało tylko zdanie w regule. W tej samej sesji bramka zgody
  zainstalowanego optymalizatora 3.0.0 odezwała się na raport subagenta, który harness też podaje
  jako prompt.
- **Przyczyna:** „tura” w kodzie znaczyła „zdarzenie promptu”, a dla człowieka to nowe polecenie.
  Krótkie potwierdzenie, powiadomienie o zadaniu w tle i raport subagenta przychodzą tym samym
  zdarzeniem. Test sprawdzał reset po „tak” jako poprawne zachowanie.
- **Zasada:** stan hooka liczony „na turę” zaczyna się od nowego polecenia człowieka. Potwierdzenia
  i powiadomienia rozpoznajesz tym samym filtrem, którego używa optymalizator (`powodPominiecia`),
  i test przechodzi ścieżkę „pokaz, tak, zapis”. Stan współdzielony przez równoległe hooki tej samej
  sesji powstaje atomowo (znacznik `wx` na element, nie odczyt-modyfikacja-zapis jednego pliku).

### L-0190 — Hook „po zapisie dokumentu” nie odezwał się ani razu, bo model pisał powłoką · 2026-10-14 · AKTYWNA

- **Trigger:** E5 HUMANIZACJA, pomiar kosztu tury trybu „dokumenty”. W 8 z 8 sesji `-p` model
  dopisał akapit do `docs/NOTATKI.md` przez Bash (`printf >>`, `cat >> <<EOF`), a hook
  `PostToolUse` miał matcher `Write|Edit`. Reguła nie trafiła do kontekstu ani razu, a podyktowany
  akapit „został dosłownie” — co wyglądało na dowód Aneksu B, choć reguły w ogóle nie było. Nawet
  `--allowedTools ... Bash(node:*)` nie zatrzymał `cd … && printf`.
- **Przyczyna:** test hooka podawał zdarzenie z `tool_name: 'Write'`, czyli zakładał narzędzie,
  którego model użyje. E3 mierzył na prompcie, przy którym model akurat wybrał Edit.
- **Zasada:** zachowanie wyzwalane narzędziem mierzysz najpierw listą narzędzi, których model
  naprawdę użył w transkrypcie, i licznikiem wstrzykniętego kontekstu (`hook_additional_context`
  w transkrypcie sesji — `stream-json` go nie pokazuje). Wynik „pożądany stan bez reguły w
  kontekście” nie jest dowodem reguły. Mechanizm „po zapisie pliku” obejmuje każdą drogę zapisu,
  którą model wybiera sam (Write, Edit, przekierowanie i `tee` w Bash), albo nazywa granicę wprost.

### L-0191 — Prompt kontrolny nie rozróżniał starej i nowej reguły · 2026-10-14 · AKTYWNA

- **Trigger:** E5 HUMANIZACJA, dowód Aneksu B. Prompt „dopisz akapit słowo w słowo” dał akapit
  dosłownie przy nowej regule 2/2 i przy starej (worktree HEAD) też 2/2. Różnicę pokazał dopiero
  prompt w układzie z E3 („dopisz akapit: "…" Potem zrób to, o co poproszą reguły RelAI”): stara
  0/2, nowa 2/2. Ten sam etap: korpus z surowego wyjścia Opus 5.5 miał 2 trafienia licznika
  wąskiego na 8 tekstów, więc kryterium „spada o połowę” nie miało siły dowodowej, dopóki nie doszły
  teksty Haiku i licznik potwierdzony.
- **Przyczyna:** materiał kontrolny dobrany pod wynik, który ma wyjść, a nie pod różnicę, którą ma
  pokazać; kryterium planu policzone dopiero po przebiegach.
- **Zasada:** zmianę zachowania dowodzisz na materiale, na którym stara wersja **psuje** — najpierw
  stara wersja na tym materiale, potem nowa, w jednym przebiegu. Kryterium „spadek o połowę” liczysz
  na materiale przed pracą i przy małej liczbie zdarzeń wracasz z pytaniem o materiał albo licznik,
  zanim puścisz przebiegi.

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

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
