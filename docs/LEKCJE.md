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
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu.
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
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186).
   - **Na żywo:** widok z danych projektu mierzysz w najgorszym stanie i ograniczasz w kodzie
     (L-0158); diagnoza zaczyna się od znacznika wersji w logu (L-0159); „przed” w dwóch
     przebiegach — stary kod i stary kod z nową czystą logiką (L-0165); animacja z danych procesu
     na stanie pośrednim z lukami (L-0175); chwila z przeszłości liczona kodem z jej commitu (L-0177);
     artefakt weryfikacji renderowany od nowa, wszystkie warianty razem (L-0182); parser pola
     opisanego prozą — na każdym zapisie rodziny i przykładzie specyfikacji, stary i nowy kod
     obok siebie (L-0184).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n` lub ścieżkę — Write, heredok bez wyjątku (L-0116, L-0119,
     L-0135, L-0148); wynik sprawdzasz grepem stałego ciągu.
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
   przez model: plik na zapisującego, bez scalania. Fakt rozstrzygnięty idzie do subagenta jako
   rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik doczytywany dla klasy
   `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy frazie z promptu; krok
   wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128)
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
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185)
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
      w Chromium z pomiarem (L-0142); kryterium w warunkach odbiorcy (szerokość, wysokość glifów).
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
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183)

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

### L-0165 — „Nowe testy padają na starym kodzie” dowiodło tylko, że plik się nie wczytał · 2026-10-11 · AKTYWNA

- **Trigger:** kontrola „przed” E2: nowy plik testów na kodzie E1 dał „107 pass, 1 fail” — jeden
  wiersz „the file did not load” (brak eksportu `cardDue`). Wynik wyglądał jak kontrola pozytywna,
  a nie mówił nic o żadnym z 21 testów z osobna.
- **Przyczyna:** plik testów importował nową czystą logikę razem z testami zachowania; błąd importu
  przewrócił cały plik naraz, więc test, który przeszedłby na starym kodzie, schował się za
  tym samym „✖”.
- **Zasada:** kontrolę „przed” robisz w dwóch przebiegach: (a) stary kod w całości; (b) stary kod
  z podłożoną **tylko nową czystą logiką** — wtedy każdy test zachowania musi paść osobno, a testy
  samej logiki przejść. Do wpisu idą obie liczby; „plik się nie wczytał” nie jest kontrolą pozytywną.
- **Źródło:** LIMIT_CHECKPOINT E2 (przebieg b: 16 ✖ zachowania, 5 ✔ logiki, 2026-10-11);
  destylat: zasada 4.

### L-0166 — Odpowiedź z okna, które czeka na człowieka, wylądowałaby w innej rozmowie · 2026-10-11 · AKTYWNA

- **Trigger:** przegląd kodu E2 (subagent `typescript-reviewer`): karta limitu czeka w `$.ui.ask`
  dowolnie długo; `/clear` albo `/resume` w tym czasie podmienia stan sesji, a odpowiedź zapisałaby
  próg, „nie pytaj” i snapshot pod nowy identyfikator. Testy były zielone, bo żaden nie zmieniał
  sesji w trakcie pytania.
- **Przyczyna:** stan moda jest per rozmowa, a `await` na człowieku jest jedynym miejscem, gdzie
  rozmowa może się zmienić w środku funkcji; kod czytał `S` po powrocie jak przed pytaniem.
- **Zasada:** funkcja moda, która czeka na człowieka (`$.ui.ask`, karta), zapamiętuje identyfikator
  sesji przed pytaniem i po powrocie porzuca odpowiedź, gdy się zmienił; wartości zależne od czasu
  (zegar, próg z pliku) czyta ponownie po każdym takim `await`.
- **Źródło:** LIMIT_CHECKPOINT E2 (poprawka w `limitCheckpoint`, 2026-10-11); destylat: zasada 13.

### L-0167 — Próg testowy 1 % przełączył pomiar na gałąź „oba okna” i ujawnił reset tygodnia · 2026-10-11 · AKTYWNA

- **Trigger:** pomiar na żywo E3 LIMIT_CHECKPOINT: `/cache limit-warn 1`, zapis z karty, pasek
  „zapis gotowy · reset 18.10 12:00” — reset tygodnia, bo tydzień (2 %) też był „ponad progiem”.
  Łukasz: funkcja dotyczy limitu 5 h; tydzień ma osobny próg. Skończyło się Aneksem C.
- **Przyczyna:** plan dał jeden próg dwóm oknom o zupełnie różnej skali, a reguła „oba naraz →
  reset późniejszy” wyglądała na brzeg, choć przy jednym progu jest drogą typową. Próg testowy
  obniża **wszystkie** okna naraz, więc pomiar zmierzył gałąź, której nikt nie uważał za podstawową.
- **Zasada:** próg, który ma stosować się do kilku wielkości, sprawdzasz na każdej z osobna przy
  pisaniu planu („czy 90 % tygodnia znaczy to samo co 90 % z 5 h?”); pomiar z progiem testowym
  opisuje w prompcie, **które** gałęzie uruchomi, i zestawia ich wynik z intencją człowieka.
- **Źródło:** LIMIT_CHECKPOINT E3 (pomiar na żywo, Aneks C, 2026-10-11); destylat: zasada 6.

### L-0168 — Atrapa odpowiadająca tak samo w nowej rozmowie udawała, że stan wrócił · 2026-10-11 · AKTYWNA

- **Trigger:** test „zapis widziany z innej rozmowy czyta się jako przerwany” padał: pasek mówił
  „zapis pracy trwa”. Diagnostyka pokazała, że `loadSave` działał — to nowa rozmowa dostała własną
  kartę limitu, a atrapa znów kliknęła „Zapisz”. Pierwsza próba diagnozy dodała asercję, która
  pada zawsze, i przesłoniła właściwe miejsce błędu.
- **Przyczyna:** odpowiedzi atrap (`w.card`) były ustawione na cały test, a scenariusz miał dwie
  rozmowy; zachowanie poprawne (nowa karta w nowej rozmowie) wyglądało jak usterka.
- **Zasada:** test wielu rozmów ustawia odpowiedzi atrap **per rozmowa** (po zmianie
  identyfikatora — od nowa); wydruk diagnostyczny zbiera stan **po** kroku, który ma sprawdzić,
  i nie zastępuje asercji, za którą stoi.
- **Źródło:** LIMIT_CHECKPOINT E3 (`checkpoint.test.ts`, 2026-10-11); destylat: zasada 13.

### L-0169 — Narzędzie „bajt w bajt” zwijało puste linie w całym pliku, nie tylko przy cięciu · 2026-10-12 · AKTYWNA

- **Trigger:** `rotate.js` odtworzył rotację C3/C9 bajt w bajt i przeszedł sześć testów, a przegląd
  kodu znalazł, że przycięcie dziennika zwija każdą podwójną pustą linię w żywym pliku — także
  w bloku kodu wpisu, który zostaje.
- **Przyczyna:** porządkowanie odstępów („bez dwóch pustych linii po wycięciu”) napisane jako
  operacja na całym pliku; materiał testów i realny dziennik nie miały podwójnych pustych linii
  poza zakresem, więc żaden przebieg tego nie pokazał.
- **Zasada:** operacja na zakresie dokumentu normalizuje **wyłącznie styk** zakresu; test ma
  zachowany fragment z formatowaniem, którego normalizacja by dotknęła (dwie puste linie, CRLF,
  blok kodu), i dowodzi, że ten fragment wyszedł nietknięty.
- **Źródło:** AUDYT_SKILLI S4, przegląd kodu 2026-10-12; destylat: zasada 5.

### L-0170 — Ewaluacja w kopii fixtury mierzyła tożsamość mierzącego, nie opis skilla · 2026-10-12 · AKTYWNA

- **Trigger:** pierwszy pełny przebieg ewaluacji wyzwalania dał 0 z 3 pozytywów relai-planning na
  Sonnecie 5.5 i Opusie 5.5; każda odpowiedź zaczynała się od propozycji wycieczki po „cudzym
  projekcie”.
- **Przyczyna:** kopia fixtury w katalogu tymczasowym nie była repozytorium; hook czytał
  `user.name` z `~/.gitconfig` mierzącego („Lukasz”), dziennik fixtury podpisał „tester”, więc
  siatka D-27 zatrzymała model pytaniem, zanim doszedł do planowania. Pierwsza poprawka
  (`GIT_CONFIG_GLOBAL`) nie zadziałała, bo hook czyta pliki konfiguracji wprost, nie przez gita —
  wyszło na kontroli pozytywnej jednej pozycji przed ponownym pełnym przebiegiem.
- **Zasada:** fixtura ewaluacji niesie środowisko, które czytają hooki (tożsamość gita, pliki
  domowe, ustawienia); poprawkę izolacji sprawdzasz testem na **tym samym detektorze**, którego
  używa hook, i jedną pozycją kontroli pozytywnej, zanim puścisz pełny, płatny przebieg.
- **Źródło:** AUDYT_SKILLI S5, 2026-10-12; destylat: zasada 5.

### L-0171 — Kamera powiększała bitmapę warstwy, a nie tekst · 2026-10-12 · AKTYWNA

- **Trigger:** klatka 165 sceny „Trzy paski” (najazd kamery, zoom 2,8) miała rozmyty tekst pasków,
  klatka 270 tej samej sceny była ostra; pierwszy podgląd wyglądał jak wada kodeka.
- **Przyczyna:** okno sceny niosło po wejściu `perspective(…) rotateX(0)`, a szkło pod paskami
  `backdrop-filter` — obie rzeczy robią z elementu osobną warstwę rasteryzowaną w skali 1, którą
  kamera tylko rozciąga (P-035). Przegląd klatek z samego planu ogólnego tego nie pokazał.
- **Zasada:** w nośniku z kamerą element trwały nie niesie po zakończeniu ruchu transformacji 3D ani
  filtra warstwowego; przegląd własnych klatek obejmuje **klatkę największego zbliżenia**, a nie
  tylko początek i koniec ruchu.
- **Źródło:** FILM_PREZENTACYJNY E1, 2026-10-12; destylat: zasada 15.

### L-0172 — Zgoda na instalację stała na szacunku pobrania, a dysk wyszedł prawie dwa razy większy · 2026-10-12 · AKTYWNA

- **Trigger:** karta zgody podała 244,59 MB rozpakowanych pakietów (FAKT z rejestru) i przeglądarkę
  do renderu „100–150 MB” (SZACUNEK). Razem „ok. 400 MB”. Po instalacji: przeglądarka 283 MB na
  dysku, `node_modules` 714 MB.
- **Przyczyna:** szacunek przeglądarki mówił o archiwum do pobrania, a człowiek zgadzał się na
  miejsce na dysku. Pakiety policzone z pola `unpackedSize` nie obejmują binarek, które pakiety
  dociągają same po instalacji.
- **Zasada:** karta zgody na zależność podaje wielkość **na dysku** w tej samej jednostce, w której
  człowiek ją odczuje. Składnik niezmierzony przed instalacją oznaczasz jako SZACUNEK z mnożnikiem
  rozpakowania. Rozjazd zmierzony po instalacji zgłaszasz od razu, przy pierwszym raporcie, a nie
  dopiero we wpisie zamykającym.
- **Źródło:** FILM_PREZENTACYJNY E1, 2026-10-12; destylat: zasada 6.

### L-0173 — Kontrola pozytywna przeszła na liczbie, którą zbiór dozwolony już miał · 2026-10-12 · AKTYWNA

- **Trigger:** test „liczba w kadrze = fakt” budował zbiór liczb dozwolonych ze wszystkich wartości
  `paski.json`, razem z nazwami punktów weryfikacji etapu, które pasek postępu cytuje dosłownie.
  Kontrola pozytywna licznika szerokiego podłożyła „Pięć narzędzi” i oczekiwała błędu. Błędu nie
  było, bo 5 już było w zbiorze (okno „5 h”).
- **Przyczyna:** zbiór dozwolony wciągnął liczby z cytatów (prompt etapu niesie „331/331”, „± 1”,
  „5 z E1”). Kontrola wybrała wartość na oko, bez sprawdzenia, że w zbiorze jej nie ma.
- **Zasada:** zbiór wartości dozwolonych budujesz z pól faktów, a tekst cytowany dosłownie
  wyłączasz z niego jawnie, z powodem. Wartość podkładaną w kontroli pozytywnej najpierw
  sprawdzasz wobec tego zbioru: wypisz zbiór i pokaż, że wartości w nim nie ma. Kontrola na
  wartości już dozwolonej sprawdza tylko to, że instrument nie zgłasza fałszywych błędów.
- **Źródło:** FILM_PREZENTACYJNY E2, 2026-10-12; destylat: zasada 5.

### L-0174 — Przenikanie dwóch plansz o tym samym układzie dawało podwójny tytuł · 2026-10-12 · AKTYWNA

- **Trigger:** animatik przechodził między planszami przenikaniem (nowa scena nad starą,
  przezroczystość 0→1 w 18 klatek). W połowie przejścia oba tytuły stały w tym samym miejscu jeden
  na drugim, nieczytelne. Czas „15 s” pisany Kalamem czytał się jak „IS s”.
- **Przyczyna:** przenikanie dobrze wygląda między obrazami o różnym układzie. Przy wspólnej siatce
  nakłada tekst na tekst. Odręczny font ma cyfrę „1” w kształcie litery „I”.
- **Zasada:** przejście między ekranami o tej samej siatce idzie przez tło: stary obraz gaśnie do
  papieru w pierwszej połowie, nowy wschodzi w drugiej. Pod scenami leży wspólne tło, żeby
  przejście nie przeszło przez czerń. Liczby i czasy w kadrze piszesz krojem, który rozróżnia „1”
  i „I”. Klatkę ze środka każdego przejścia oglądasz przed pokazem.
- **Źródło:** FILM_PREZENTACYJNY E2, 2026-10-12; destylat: zasada 15.

### L-0175 — Animacja „punkt po punkcie” założyła kolejność, której dane nie mają · 2026-10-12 · AKTYWNA

- **Trigger:** scena 2 filmu prowadzi znacznik po segmentach postępu i stawia ✓ nad każdym punktem
  odhaczonym; znacznik zatrzymywał się na pierwszym punkcie nieodhaczonym. Przy danych 0/16 z chwili
  pisania wyglądało to dobrze. Przy realnych 10/16 punkt 1 (pytanie rozstrzygane wpisem na końcu
  etapu) był otwarty, więc znacznik stanął na pierwszym segmencie i nie pojawił się ani jeden ✓.
- **Przyczyna:** animacja zakładała, że punkty odhacza się po kolei. Prompt etapu tego nie
  gwarantuje — kolejność odhaczania wyznacza praca, nie numeracja. Stan „zero” i stan „wszystko”
  tego nie pokazują; pokazuje go dopiero stan pośredni.
- **Zasada:** element animowany z danych procesu sprawdzasz na danych w stanie pośrednim, z lukami
  (część zrobiona, nie od początku), a nie tylko w stanie z chwili pisania i w stanie skrajnym.
  Animacja przechodzi cały zbiór i oznacza elementy po ich stanie; nie zatrzymuje się na
  „pierwszym otwartym”, chyba że stan naprawdę jest kolejką.
- **Źródło:** FILM_PREZENTACYJNY E3, 2026-10-12 (render rundy 2, klatka 950); destylat: zasada 4.

### L-0176 — Karteczka z pytaniem retorycznym przy liczbie zamiast liczby wyliczonej · 2026-10-12 · AKTYWNA

- **Trigger:** w scenie 2 trzy karteczki odpowiadały trzem pytaniom spod tytułu; przy liczniku
  „0/16 punktów” stała karteczka „jak daleko”. Łukasz (runda 1 E3): „to zupełnie nie pasuje tutaj
  do kontekstu”, przy postępie powinien stać wyliczony postęp.
- **Przyczyna:** karteczka powielała hasło konstrukcji sceny (pytanie z tytułu), a nie mówiła, co
  liczba znaczy. Karteczka baterii z E1, przyjęta, robi to drugie: tytuł i dwie linie z danymi.
- **Zasada:** adnotacja przy liczbie w interfejsie mówi wartość wyliczoną z tych samych danych
  („odhaczone 10 z 16 punktów”, „plan: 2 z 6 etapów”), nie pytanie, na które liczba odpowiada.
  Hasło konstrukcyjne sceny (pytania pod tytułem) zmieniasz razem z nią, żeby para pytanie–karteczka
  dalej się zgadzała.
- **Źródło:** FILM_PREZENTACYJNY E3, 2026-10-12, korekta Łukasza w rundzie 1; destylat: zasada 15.

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

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
