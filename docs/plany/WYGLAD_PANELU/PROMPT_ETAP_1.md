# PROMPT_ETAP_1 — Sonda nośnika i trzy paski w kolorach narzędzia

Plan: WYGLAD_PANELU • Etap: **E1 z E4** • Wygenerowano: 2026-10-14 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus 5.5, świeże sesje** • `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (sonda w nośniku, którego zachowania nie znamy, i zmiana warstwy kolorów w trzech
> pluginach z kopiami rdzenia).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/plany/WYGLAD_PANELU/PLAN.html` | sekcje 4 (wariant A i awaryjny B), 5 (przepływ koloru, punkty 1–3), 6 (E1), 7 (ryzyka 1–3, 6, 7), 8 (b1–b3, b7, b8), 10 (Aneks A) |
| `docs/PULAPKI.md` — P-017, P-020, P-021, P-024, P-041 | ograniczenia silnika modów, `Svg` w paśmie, binarka aplikacji do testów, pole „następny krok” zasłania paski |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — §1, §5, §10 | dzisiejsza gramatyka pasków (spokojny / mówiący), wspólna siatka, baterie cache |
| `core/panel/theme.mjs` | `BAND`, `BAR`, `ROOT`, `THEME` — źródło wszystkich kolorów, kopie w trzech pluginach |
| `panel/hooks/bar-card.tsx` (kopie w `progress/`, `cache-keeper/`) | wspólna karta paska — tło, etykieta, liczba |
| `panel/hooks/band.tsx`, `progress/hooks/register.tsx` + `segments.ts`, `cache-keeper/hooks/rings.ts` + `register.tsx` | rysowanie trzech pasków i ich znaczników `Svg` |
| `progress/.claude-plugin/types/claude-code/index.d.ts` — `ThemeKey` (~12521), `Color` (~1667), `$.config.list` (~3070), `Svg.isInteractive` (~12225) | co silnik obiecuje w typach — do sprawdzenia sondą |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Paski w kluczach motywu narzędzia** (`text`, `subtle`, `inactive`, `success`, `warning`,
  `error`, `promptBorder`, …) i jeden akcent — wariant A planu, wybór Łukasza 2026-10-14. Panel
  RelAI zostaje przy palecie „Warsztat” (to E3).
- **Wariant awaryjny B** (dwie własne palety pasków wybierane po odczycie motywu) uruchamia
  wyłącznie wynik sondy, gdy desktop nie rysuje kluczy motywu — zapis aneksem, z pytaniem do
  Łukasza.
- **Aneks A:** sonda przed kodem docelowym, wynik w `docs/PULAPKI.md` i pokazany Łukaszowi;
  potem **trzy warianty** wyglądu pasków w prawdziwym nośniku (mod z przełącznikiem), oceniane
  w motywie jasnym i ciemnym; rundy poprawek do akceptacji wyglądu zapisanej w dzienniku.
- Warianty różnią się kształtem, nie odcieniem. Gust Łukasza: każdy pasek widocznie oddzielony
  miękkim tłem, odstępem i wspólną siatką — **kolorowe ramki odrzucone** (2026-10-09); hover tylko
  dodaje, nigdy nie zamienia widocznego tekstu; etykieta przygaszona · wartość pogrubiona.
- Typografia modów (`Text size/weight/tabular`) poza planem — aplikacja ma Claude Code 2.1.295.
- Wydanie pluginów i push wyłącznie po zgodzie Łukasza w sesji; wydanie należy do E4.
- **Granica zakresu:** pasek postępu jako lista kroków to E2 (tu dostaje tylko nowe kolory
  w dzisiejszym kształcie); panel `/relai-panel` i jego szata jasna to E3 — plików
  `panel/hooks/pane-*.tsx` nie dotykasz. Odnoga PANEL_WASKI pracuje w nich równolegle.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.1.0; `relai-panel` 0.17.0, `relai-progress` 0.4.2, `relai-cache-keeper` 0.9.0 (wydane
2026-10-14, tag `relai-panel-v0.17.0`). Aplikacja desktopowa 2.37337.1.0 z Claude Code 2.1.295
(binarka `%APPDATA%\Claude\claude-code\2.1.295\d2e29494ec83\claude.exe`; na PATH 2.1.299 — nie ta,
P-024). Paski rysują się w każdym panelu podziału okna (P-040 rozwiązana). Odnoga
[PANEL_WASKI](../../fixy/PANEL_WASKI/ODNOGA.md) była 2026-10-14 w toku w innej sesji
(niezacommitowane zmiany w `panel/hooks/pane-*.tsx`, nowy `panel/hooks/narrow.test.ts`) — przed
pierwszym zapisem sprawdź `git status` i nie dotykaj jej plików.

```
core/panel/theme.mjs                 # 50 wartości szesnastkowych (FAKT 2026-10-14): ROOT (paleta Warsztat), THEME (panel), BAND (tła i etykiety pasków), BAR (tekst, wyciszenie, kafle, segmenty), RING
panel/hooks/core/theme.mjs           # kopia bajt w bajt (sync-panel-core.js, test parytetu)
progress/hooks/core/theme.mjs        # kopia
cache-keeper/hooks/relai/theme.mjs   # kopia
panel/hooks/bar-card.tsx             # wspólna karta paska; kopie w progress/ i cache-keeper/ (mods-parity.test.js)
panel/hooks/band.tsx                 # pasek planu
progress/hooks/register.tsx          # pasek postępu (AbovePrompt), chip agentów, rząd „odhaczone”
progress/hooks/segments.ts           # segmenty i linia w jednym Svg z isInteractive
cache-keeper/hooks/rings.ts          # baterie paska cache (Svg), kolory progów
cache-keeper/hooks/register.tsx      # pasek cache
core/tools/sync-panel-core.js        # jedyna droga zapisu kopii rdzenia; --check w teście
```

Testy (FAKT 2026-10-14, binarka aplikacji): panel 178, progress 31, cache-keeper 179; rdzeń
`node --test core/{guardrails,panel,process}/tests/*.test.js` 386.

**Czego jeszcze nie ma (to jest zakres tego etapu):** pomiaru, co desktop rysuje dla kluczy motywu
w `AbovePrompt` i `Pane`, czy `$.config.list()` i zdarzenie `config.set` mówią o motywie jasnym
desktopu, czy SMIL w `Svg` i przycisk w pasku działają; warstwy nazw kolorów w `theme.mjs`; pasków
czytelnych w motywie jasnym; wariantów do oceny.

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

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/WYGLAD_PANELU/E1/`.** Wszystko tymczasowe — mod
sondy, zrzuty robocze, logi liczników — powstaje tam. Artefakt, który z natury musi leżeć **poza**
projektem (`%TEMP%`, katalog domowy, zainstalowana kopia pluginu), wpisujesz do wpisu dziennika
**z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Sonda nośnika** — mod `relai-motyw-sonda` w katalogu roboczym, uruchamiany w aplikacji pod
   własną nazwą (zasada 10: niewydane pod inną nazwą). Mierzy na żywo z Łukaszem:
   (a) każdy z używanych kluczy motywu jako `color` i `backgroundColor` w `AbovePrompt` i w `Pane`
   — rysuje się kolorem motywu, czy niczym; (b) wartość wiersza `theme` z `$.config.list()` i czy
   `config.set` przychodzi przy zmianie wyglądu **aplikacji** (jasny/ciemny/systemowy) oraz motywu
   Claude Code; (c) spinner SMIL w `Svg` z `isInteractive` w pasku; (d) przycisk w pasku
   przełączający stan i przerysowanie. Liczniki w pliku, zrzuty z wersją aplikacji. Wynik →
   nowa pozycja w `docs/PULAPKI.md` (numer następny po P-041) i pokaz Łukaszowi przed pkt 3.
   Wynik negatywny (a) lub (b) → zatrzymaj się, zaproponuj aneks z wariantem B albo przełącznikiem.
2. **Warstwa nazw w `core/panel/theme.mjs`** — nazwy semantyczne pasków (tekst, wyciszenie, tło
   karty, ramka, stany: zrobione / w toku / czeka / błąd, akcent) wskazujące klucz motywu; znaczniki
   `Svg` dostają surowy kolor rozwiązywany z tej samej nazwy według odczytanego motywu (ciemny /
   jasny). Najpierw nazwy bez zmiany wyglądu w trybie ciemnym — testy zielone — potem wartości.
   Kopie przez `node core/tools/sync-panel-core.js`.
3. **Trzy warianty wyglądu pasków** (Aneks A) w prawdziwym nośniku, przełącznik wariantu w sondzie
   albo w zmiennej moda: np. miękkie tło z klucza motywu / przezroczyste tło z ramką
   `promptBorder` / sama linia oddzielająca — wszystkie trzy paski naraz, w motywie jasnym
   i ciemnym, zrzuty do `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E1_*`. Wybór i rundy poprawek
   z Łukaszem; turę przed zrzutem kończysz zwykłym tekstem (P-041).
4. **Wdrożenie wybranego wariantu** w `panel/hooks/bar-card.tsx` (i obu kopiach), `panel/hooks/band.tsx`,
   `progress/hooks/register.tsx` + `segments.ts` (dzisiejszy kształt, nowe kolory),
   `cache-keeper/hooks/rings.ts` + `register.tsx`; odczyt motywu przy `session.start` i na
   `config.set` (przerysowanie bez restartu, b2); motyw nierozpoznany → ciemny (b1).
5. **Testy** w `claude plugin test` każdego z trzech pluginów: pasek nie używa koloru szesnastkowego
   poza znacznikami `Svg`; znaczniki `Svg` mają inne kolory w motywie jasnym i ciemnym; szerokość
   paska w trzech szerokościach (`bodyColumns` wąskiego panelu, pół okna, pełne) bez przepełnienia;
   kontrola pozytywna na kodzie sprzed zmiany (`git worktree` HEAD-a, L-0151).
6. **Brief** `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — nowa sekcja o kolorach z motywu
   z wybranym wariantem i wynikiem sondy; wersja w nagłówku i wpis w `docs/ARTEFAKTY.md`.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_1.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Sonda: tabela wyników (klucz motywu × `AbovePrompt` / `Pane` × motyw jasny / ciemny;
      `theme` i `config.set` przy zmianie wyglądu aplikacji i motywu CLI; SMIL; przycisk) z wersją
      aplikacji i Claude Code w nowej pozycji `docs/PULAPKI.md`; zrzuty w repo.
- [x] Wynik sondy pokazany Łukaszowi przed wariantami; przy wyniku negatywnym — aneks
      zaproponowany i rozstrzygnięty, zanim powstał kod docelowy.
- [x] Trzy warianty pokazane w obu motywach (zrzuty `WYGLAD_PANELU_E1_*`), wybór i każda runda
      poprawek zapisane we wpisie dziennika słowami Łukasza; akceptacja wyglądu zapisana.
- [x] `grep` po kolorach szesnastkowych w kodzie pasków (`bar-card.tsx`, `band.tsx`,
      `progress/hooks/register.tsx`, `cache-keeper/hooks/register.tsx`) — 0 trafień poza
      znacznikami `Svg`; kontrola pozytywna: na HEAD przed zmianą trafienia są.
- [x] `claude plugin validate .` i `claude plugin test .` w `panel/`, `progress/`, `cache-keeper/`
      zielone binarką aplikacji; testy rdzenia 386+ zielone, w tym parytet kopii (`sync-panel-core.js
      --check`) i `mods-parity.test.js`.
- [x] Nowe testy (brak koloru spoza motywu, dwa motywy znaczników, szerokości) spadają na kodzie
      sprzed zmiany i przechodzą po niej — obie wersje w jednym przebiegu.
      *(2026-10-14: test kolorów spada na HEAD we wszystkich trzech pluginach i przechodzi po
      zmianie; test szerokości przechodzi na obu — stary kod też się mieścił — więc pilnuje
      regresji; tak rozliczony decyzją Łukasza.)*
- [x] Na żywo: aplikacja w motywie jasnym i ciemnym, trzy paski czytelne w pełnym oknie i w wąskim
      panelu podziału; przełączenie motywu w trakcie sesji przerysowuje paski bez restartu (albo
      odnotowane w P-xxx, że desktop tego nie zgłasza).
- [x] `git diff` nie dotyka `panel/hooks/pane-*.tsx`, `panel/hooks/narrow.test.ts`,
      `docs/plany/PANEL_CODEX/` ani `docs/zasoby/PANEL_RELAI/makiety/`.
- [ ] Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (podłożony mod sondy w katalogu pluginów,
      pliki w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/WYGLAD_PANELU/STATUS.md`: E1 → ZREALIZOWANY (data), E2 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_2.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E1/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu (mod sondy, `%TEMP%`) z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk; lekcje z etapu do
   `docs/LEKCJE.md` (plik ponad budżetem 50 KB — rotacja należna przed dopisaniem) i odśwież
   „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan planu WYGLAD_PANELU; `STYL_PASKOW_CLAUDE.md` i `ARTEFAKTY.md`, jeśli
   jeszcze nie.
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` sekcja 6 (E2 — pasek postępu jako lista kroków), Aneksu A (trzy warianty),
   makiety `MAKIETA_PASEK_POSTEPU.html`, realnego stanu po tym etapie (wynik sondy: SMIL,
   przycisk) i lekcji z tego etapu.
6. Commit — propozycja, conventional message, bez plików PANEL_CODEX, makiet i plików odnogi
   PANEL_WASKI.
