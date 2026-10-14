# PROMPT_ODNOGA — panel RelAI bez rozjazdów w wąskim panelu podziału okna

Odnoga: PANEL_WASKI • Plan-rodzic: brak • Wygenerowano: 2026-10-14 (autor: Opus 5.5) • Wykonawca: **Opus 5.5 w świeżej sesji** • `/effort high`

> **Kontrola modelu:** tę odnogę wykonuj wyłącznie na modelu klasy **strong**, w Claude Code:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Inny model → zatrzymaj się i poproś o
> przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`: `high` — pomiar progów w sześciu
> zakładkach, poprawka układu we wspólnych częściach panelu i kalibracja na żywo w kilku szerokościach.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/fixy/PANEL_WASKI/ODNOGA.md` | karta: cel, zakres, weryfikacja — źródło dla tego promptu |
| `docs/PULAPKI.md` — P-017, P-024, P-041 | zachowania silnika modów, binarka 2.1.295 i komórka 9,8 px, pomiar na żywo bez pola pytania |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` | styl panelu i kafli, do którego poprawka ma pasować |
| `panel/hooks/pane-parts.tsx` | wspólne części zakładek (`section`, `folded`, `frame`, `btn`, `factRow`) — tu najpewniej siedzi większość poprawki |
| `panel/hooks/register.tsx` ~790–850 | jak panel dostaje szerokość (`Math.max(30, e.props.bodyColumns)`) i `isGui` |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Forma:** odnoga samodzielna, założona 2026-10-14 z nowej sesji, bo z wnętrza SPLIT_VIEW nie
  wolno było (jedna głębokość, L-0193).
- **Silnik liczy układ, nie człowiek:** zawijanie, `flexShrink`, `flexWrap`, `gap` — żadnych
  ręcznie wyliczonych szerokości tekstu ani obcinania napisów w kodzie pod konkretną liczbę kolumn
  (pamięć „Layout bez rozjazdów”, Zasada aktywna 15 „Układ”). Rozjazd układu blokuje rozmowę
  o smaku — najpierw układ, potem ewentualne poprawki wyglądu.
- **Kafle i ramki:** obecny język wizualny panelu zostaje (zaokrąglone kafle z tłem na desktopie,
  przyciski powierzchni, nagłówki Kalam); kolorowych ramek jako separatora nie dokładasz — odstęp
  i tło, nie obrys (pamięć „Pasek nad promptem oddzielony”).
- **Typografia modów** (`Text size/weight`) czeka na Claude Code ≥ 2.1.299 w aplikacji — poza
  zakresem (Łukasz, 2026-10-14).
- **Pomiar na żywo:** turę, po której Łukasz robi zrzut, kończysz zwykłym tekstem — pole
  „następny krok” z przyciskami zasłania paski i dół panelu (P-041).
- **Wydanie `relai-panel` i push** wyłącznie po wyraźnej zgodzie Łukasza w tej sesji.
- **Wątek jest samodzielny** — nie należy do aktywnego planu PANEL_CODEX i w żadnym `STATUS.md`
  niczego nie zapisuje; plików `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` nie
  dotykasz i nie commitujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.1.0; `relai-panel` 0.17.0 (commit `b4e96a7`, karta SPLIT_VIEW zamknięta w `d6cf943`),
`relai-progress` 0.4.2, `relai-cache-keeper` 0.9.0. Aplikacja desktopowa 2.37337.1.0 wykonuje sesje
na Claude Code 2.1.295 (binarka `%APPDATA%\Claude\claude-code\2.1.295\d2e29494ec83\claude.exe`);
na PATH jest 2.1.299. Po SPLIT_VIEW panel otwiera się w każdym panelu podziału okna — FAKT
z pomiaru 2026-10-14 (zrzuty `docs/zasoby/PANEL_RELAI/zrzuty/SPLIT_VIEW_1…5`). W kodzie zakładek
jest dziś (FAKT, `grep` 2026-10-14) 38 wystąpień `wrap="truncate"`/`wrap={…}`, 39 `gap=` i 38
`flexShrink` — narzędzia układu są w użyciu, tylko nie wszędzie tam, gdzie wąski panel ich
potrzebuje.

```
panel/hooks/register.tsx       # 1074 linie; ~825: width = Math.max(30, e.props.bodyColumns); ~842: Ctx dla zakładek
panel/hooks/pane-parts.tsx     # 211 linii; wspólne części: heading, btn, section (gap tylko gdy isGui), frame, folded (wiersz flexWrap + summary truncate + „▸ Rozwiń”), factRow
panel/hooks/pane-now.tsx       # 85 linii; ~42: linia „Ta sesja: …” z wrap="truncate"
panel/hooks/pane-commands.tsx  # 219 linii; kafle „Polecane teraz” (~203) i grupy komend, przycisk „Otwórz” (~193)
panel/hooks/pane-map.tsx       # 378 linii; „Ta sesja” na górze, karty planów, „Rozwiń” (~210), wiersz „Aktywny plan” (~361)
panel/hooks/pane-costs.tsx     # 345 linii; sekcje zwinięte, wiersz „Cennik z … · …” (~266)
panel/hooks/pane-docs.tsx      # 311 linii; kafle dokumentów, „Otwórz”/„Zamknij” (~88)
panel/hooks/pane-help.tsx      # 98 linii
panel/hooks/pane-v2.test.ts    # 19 testów zakładek; pane.test.ts — 7
core/panel/theme.mjs           # 323 linie; THEME, ikony; kopie w panel/hooks/core/ przez sync-panel-core.js, test parytetu
```

**Objawy ze zrzutów Łukasza z 2026-10-14** (wąski środkowy panel przy trzech panelach; zrzuty były
w rozmowie, w repo ich nie ma — poproś Łukasza o ponowne, jeśli potrzebujesz): Komendy — tekst karty
„Ta sesja” wychodzi poza kafel („aktywny plan: PANEL” ucięte), „Otwórz” w kaflach „Polecane teraz”
ucięty do „Otwó”; Mapa — wiersz „Aktywny plan … $8” ucięty; Koszty — wiersz „Cennik … odczyt 202”
ucięty; wszędzie kafle bez odstępów, ramki się zlewają.

**Czego jeszcze nie ma:** pomiaru, przy jakiej szerokości każda zakładka zaczyna się rozjeżdżać;
testów szerokości w `claude plugin test`; poprawki układu; zrzutów wąskiego panelu w repo.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-14):**

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
   L-0186, L-0191)
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

## Zakres i weryfikacja

**Katalog roboczy tej odnogi: `.claude/relai/work/_fixy/PANEL_WASKI/`.** Wszystko tymczasowe
(sondy, zrzuty robocze, logi) powstaje tam. Artefakt, który z natury musi leżeć **poza**
projektem (`%TEMP%`, katalog domowy, zainstalowana kopia pluginu), wpisujesz do wpisu dziennika
**z nazwy**, a jego nazwę zaczynasz od slugu projektu.

**Zakres** (z karty):

1. **Pomiar progów** — szerokości (w kolumnach `bodyColumns`; panel liczy
   `width = Math.max(30, e.props.bodyColumns)`, `panel/hooks/register.tsx` ~825), przy których każda
   zakładka (Teraz, Komendy, Mapa, Dokumenty, Koszty, Pomoc) zaczyna ucinać tekst, wypychać przycisk
   albo sklejać ramki. Wynik: tabela zakładka × szerokość × objaw, z miejscem w kodzie.
2. **Poprawka układu** w miejscach, które pomiar wskaże: `panel/hooks/pane-parts.tsx` (wspólne
   części: `section`, `folded`, `frame`, `factRow`), `panel/hooks/pane-commands.tsx` (kafle
   „Polecane teraz”, przycisk „Otwórz” ~193), `panel/hooks/pane-map.tsx` („Ta sesja”, wiersz
   „Aktywny plan”, przyciski „Rozwiń” ~210), `panel/hooks/pane-costs.tsx` (wiersz „Cennik” ~266),
   `panel/hooks/pane-now.tsx` (`wrap="truncate"` w linii „Ta sesja” ~42), `pane-docs.tsx`,
   `pane-help.tsx`; stałe układu w `core/panel/theme.mjs` (z kopiami przez `sync-panel-core.js`,
   pilnowane testem parytetu), jeśli odstęp ma być wspólną stałą. Środki: zawijanie zamiast
   `truncate` tam, gdzie treść jest potrzebna w całości, `flexShrink={0}` na przyciskach
   i liczbach (L-0152), `flexWrap` w wierszu kafla, `gap` między kaflami.
3. **Testy szerokości** w `claude plugin test` (`panel/hooks/*.test.ts`): każda zakładka
   renderowana w szerokościach z pomiaru (co najmniej najwęższa realna, próg i szeroka), z asercją,
   że przyciski mają pełną etykietę, a tekst kafla nie jest ucięty; kontrola pozytywna na kodzie
   sprzed poprawki (test musi na nim spaść). Binarka aplikacji
   `%APPDATA%\Claude\claude-code\2.1.295\d2e29494ec83\claude.exe` (P-024 pkt 4).
4. **Kalibracja na żywo z Łukaszem**: panel otwarty w wąskim panelu podziału (trzy sesje obok
   siebie) i w co najmniej dwóch innych szerokościach; zrzuty do
   `docs/zasoby/PANEL_RELAI/zrzuty/PANEL_WASKI_*`. Turę przed zrzutem kończysz zwykłym tekstem (P-041).
5. **Wersja i wydanie**: podbicie `relai-panel` w `panel/.claude-plugin/plugin.json`
   i `.claude-plugin/marketplace.json`; wydanie wyłącznie po zgodzie Łukasza.

**Weryfikacja** (wszystkie punkty muszą przejść):

- [ ] Tabela progów (zakładka × szerokość × objaw × miejsce w kodzie) zapisana we wpisie dziennika;
      każdy objaw z zrzutów 2026-10-14 ma w niej wiersz.
- [ ] `claude plugin validate .` i `claude plugin test .` w `panel/` zielone binarką aplikacji
      (P-024 pkt 4); nowe testy szerokości spadają na kodzie sprzed poprawki (kontrola pozytywna
      w tym samym przebiegu, `git worktree` HEAD-a, L-0151) i przechodzą po niej.
- [ ] Testy rdzenia `node --test core/panel/tests/*.test.js` zielone, w tym parytet kopii rdzenia
      (jeśli `theme.mjs` się zmienił).
- [ ] Na żywo, w wąskim panelu przy trzech sesjach obok siebie i w dwóch innych szerokościach:
      w każdej zakładce tekst kafla mieści się w kaflu albo zawija, „Otwórz” i „Rozwiń” mają pełną
      etykietę, między kaflami jest odstęp, ramki się nie stykają — zrzuty w repo, akceptacja
      Łukasza zapisana w dzienniku.
- [ ] `git diff` nie dotyka plików spoza zakresu; po podbiciu wersji `grep -r` po `0.17.0`
      rozstrzygnięty (historyczne vs deklaracja stanu).
- [ ] Katalog roboczy `.claude/relai/work/_fixy/PANEL_WASKI/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika, artefakty spoza niego wypisane z nazwy.

## Na koniec — rytuał zamknięcia odnogi (bez niego odnoga nie jest zamknięta)

1. **`docs/fixy/PANEL_WASKI/ODNOGA.md`** — status → `ZAMKNIĘTA <data>`, sekcja „Wynik” wypełniona.
2. Wątek samodzielny — w żadnym `STATUS.md` nic nie zmieniasz.
2a. **Katalog roboczy odnogi** — `node .claude/relai/tools/clean-work.js raport`, pozycje, kasowanie
   po „tak”; liczby przed i po do wpisu z punktu 3; artefakty spoza katalogu z nazwy.
3. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, z tabelą progów,
   podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
4. **`docs/STATE.md`** i linia odnóg w `CLAUDE.md` — numer `relai-panel` po wydaniu, odnoga
   zamknięta.
5. **Commit** — propozycja, conventional message, bez plików PANEL_CODEX. Jedyny punkt, o który pytasz.
