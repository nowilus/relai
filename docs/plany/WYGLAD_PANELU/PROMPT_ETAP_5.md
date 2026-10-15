# PROMPT_ETAP_5 — Sekcja „Teraz”, baterie w siatce i kontekst z oknem modelu (Aneks G)

Plan: WYGLAD_PANELU • Etap: **E5 z E5** • Wygenerowano: 2026-10-15 (autor: Opus 5.5, w rytuale „Na koniec” etapu E4) • Wykonawca: **Opus 5.5, świeże sesje** • `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (trzy rundy wariantów w prawdziwym nośniku, zmiana dwóch pluginów i wydanie; plan nie
> podaje poziomu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/plany/WYGLAD_PANELU/PLAN.html` | sekcja 10, **Aneks G** (zakres E5, słowa Łukasza, numery wydania) i Aneks A (warianty w prawdziwym nośniku, rundy poprawek) |
| `docs/DZIENNIK.md` — wpisy „WYGLAD_PANELU E4” (dwa) | stan po wydaniu 3.2.0, poprawki z macierzy, co odłożono do E5 |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` (całość, wersja 1.2) | jedyne źródło wyglądu; §11 proces pracy nad wyglądem, §12 lista kontrolna |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — §0, §10 (pasek cache: baterie), §13, §14.6 | co obowiązuje w paskach; geometria baterii i dymki |
| `docs/zasoby/PANEL_RELAI/narzedzia/README.md` | zrzuty bez człowieka; `okno.ps1` wymaga poprawki DPI (L-0206) |
| `docs/PULAPKI.md` — P-023 (pkt 7), P-024, P-041, P-042, P-043, P-044, P-045 | budżety drzewa, binarka aplikacji, pole pytania zasłania paski, klucze motywu, układ jak CSS, kanapka, `hover` na węźle |
| `panel/hooks/pane-now.tsx`, `cache-keeper/hooks/rings.ts`, `cache-keeper/hooks/register.tsx` (rysowanie pasa baterii) | kod, który zmieniasz |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Zakres i miejsce (Aneks G, 2026-10-15):** trzy rzeczy w tym planie, w etapie E5 — sekcja
  „Teraz” na zakładce Komendy, układ baterii w pasku cache, wyeksponowany kontekst z oknem modelu.
  Słowa Łukasza w Aneksie G; nic poza nimi.
- **Wydanie:** `relai` zostaje **3.2.0** (bez 3.2.1, bez zmian w pluginie `relai`); pluginy panelu
  dostają nowe numery: `relai-panel` **0.20.0**, `relai-cache-keeper` **0.11.0**, `relai-progress`
  tylko jeśli zmieniony (0.5.1); jeden tag `relai-panel-v0.20.0`; wybór „relai zostaje 3.2.0, panel
  dostaje nowe numery (Rekomendowane)” — `plugin update` nie widzi zmian pod tym samym numerem.
- **Kontekst i siatka baterii — trzy warianty do wyboru na żywo** (odpowiedź „Trzy warianty do
  wyboru w E5” na oba pytania). Sekcja „Teraz” — też trzy warianty (DESIGN §11).
- **Wszystko z planu zostaje:** klucze motywu i dwie palety `Svg` (Aneks B), wariant 3 · jedna
  kartka (Aneks F), lista kroków paska postępu (E2), drugi budżet drzewa w znakach (E4).
- **Granica zakresu:** nowy wygląd tylko tych trzech miejsc. Inne zakładki, inne paski, typografia
  (ryzyko 8) — poza zakresem; potrzeba → sygnał odchylenia. To ostatni etap planu: zamiast promptu
  następnego etapu — sekwencja zamknięcia planu.

## Stan wyjściowy — co realnie zastajesz

RelAI **3.2.0** wydany 2026-10-15 (commit `cc2d340`, tagi `v3.2.0` i `relai-panel-v0.19.0`),
zainstalowany u Łukasza z marketplace: `relai-panel` 0.19.0, `relai-progress` 0.5.0,
`relai-cache-keeper` 0.10.0. Aplikacja z Claude Code 2.1.295; testy binarką
`$APPDATA/Claude/claude-code/2.1.295/d2e29494ec83/claude.exe` (`plugin validate .`,
`plugin test .`; na PATH inna wersja — P-024). Testy: panel 205, progress 42, cache-keeper 181,
rdzeń 410.

```
panel/hooks/pane-now.tsx       # nowBar(): sekcja „Teraz” — plan, status, segmenty (segments() z core/charts.mjs, bez hovera), „następny:” z pełnym tekstem punktu, „Ta sesja”, Start etapu…, Zmień
core/panel/charts.mjs          # segments(), hoverSegments() (pasek z hoverem z Mapy, tło `none` od E4)
cache-keeper/hooks/rings.ts    # pięć baterii: cache, limit 5 h, reset za, limit tygodnia, kontekst; batteryWidth(); kontekst zna okno (`window`) — dymek „zużyte X z Y · wolne N %”
cache-keeper/hooks/register.tsx # pas baterii nad promptem; układ wierszy baterii
core/panel/theme.mjs           # BATTERY, RING, KEY, inkCss — kolory i geometria baterii
docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E4_*   # zrzuty odbioru E4 (obie szaty, trzy szerokości)
docs/zasoby/PANEL_RELAI/narzedzia/                   # zrzut-panelu.ps1, lupa.ps1, okno.ps1 (bez DPI — ucina dół okna), nazwy.ps1
```

API modów podaje okno kontekstu modelu: `SessionContextBreakdown` w typach
(`cache-keeper/.claude-plugin/types/claude-code/*.d.ts`, pola `totalTokens`, `maxTokens`,
`rawMaxTokens`, `percentage`) — sprawdź, którą drogą `rings.ts` dziś bierze `window`, zanim
napiszesz nową.

**Czego jeszcze nie ma (to jest zakres tego etapu):** sekcji „Teraz” z mniejszą ilością słów,
segmentami z najechaniem i barwami, które się nie zlewają; baterii w równej siatce, która skaluje
się z szerokością (dziś „limit tygodnia” pod „limitem 5 h” stoi w innej kolumnie); kontekstu
„użyte / okno modelu · %” na widoku bez najechania; `okno.ps1` z `SetProcessDPIAware`.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-15):**

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
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`) (L-0116, L-0119, L-0135, L-0148, L-0188, L-0192, L-0198);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
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
      zrzut przez `PrintWindow` z `SetProcessDPIAware` (L-0206). Wygląd
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
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/WYGLAD_PANELU/E5/`.** Wszystko tymczasowe —
mody-warianty, zrzuty robocze, kopie zainstalowanych pluginów — powstaje tam. Artefakt, który
z natury musi leżeć poza projektem (katalog `dev-mods`, cache pluginów, `%TEMP%`), wpisujesz do
wpisu dziennika z nazwy, a jego nazwę zaczynasz od slugu projektu.

1. **Narzędzie zrzutu:** `docs/zasoby/PANEL_RELAI/narzedzia/okno.ps1` woła `SetProcessDPIAware()`
   (L-0206); kontrola: zrzut ma rozmiar fizyczny okna, pole promptu w kadrze.
2. **Trzy warianty sekcji „Teraz”** w prawdziwym nośniku (mod-wariant z przełącznikiem, DESIGN §11),
   różne kształtem w stanie domyślnym, na najdłuższych realnych danych (najdłuższy punkt
   weryfikacji, długa nazwa planu). Każdy: mniej słów niż dziś (punkt „następny” skrócony albo
   na żądanie), segmenty z najechaniem (`hoverSegments` albo równoważny), barwy segmentów i tekstu
   rozróżnialne w obu szatach. Wybór Łukasza jego słowami; zrzuty obu szat.
3. **Trzy warianty układu baterii** w pasku cache: równe kolumny, wyrównane ikony i wartości,
   skalowanie z szerokością (pełne okno, połowa podziału, wąska kolumna). Wybór jego słowami.
4. **Trzy warianty miejsca kontekstu** „użyte / okno modelu · %” bez najechania (np. własny wiersz
   z paskiem wypełnienia, kolumna liczby, bateria z dopiskiem okna). Okno z danych sesji, nie
   z tablicy modeli. Wybór jego słowami.
5. **Produkt:** wybrane warianty w `panel/hooks/pane-now.tsx`, `cache-keeper/hooks/rings.ts`
   i `register.tsx` (rdzeń `core/panel/` tylko, jeśli trzeba — wtedy `sync-panel-core.js`); każda
   zmiana z testem, który spada na kodzie sprzed niej; testy szerokości (40 kolumn, wąski panel)
   i budżetu drzewa zielone. `DESIGN.md` → 1.3, brief → 5.1 (§14.7), wiersze w `ARTEFAKTY.md`.
6. **Karta zgody na wydanie** (AskUserQuestion) — numery z „Decyzji”, lista zmian, lista plików,
   tag `relai-panel-v0.20.0`, push; bez „tak” nic dalej. Po „tak”: numery w trzech miejscach
   pluginu (`*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`), `README.md` sekcja
   panelu, commit, tag, push, instalacja z marketplace, zrzut z zainstalowanej wersji.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `okno.ps1` zapisuje okno w rozmiarze fizycznym (porównanie z `GetWindowRect` po
      `SetProcessDPIAware`), pole promptu w kadrze.
- [ ] Dla każdej z trzech rzeczy: trzy warianty w prawdziwym nośniku, zrzuty obu szat
      `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E5_*`, wybór Łukasza zapisany w dzienniku jego
      słowami.
- [ ] Sekcja „Teraz” w produkcie: segmenty reagują na najechanie (zrzut z kursorem nad segmentem),
      słów mniej niż w E4 (liczba znaków sekcji przed i po w dzienniku), barwy rozróżnialne
      w obu szatach (kontrast par ≥ 3 : 1 dla segmentów, ≥ 4,5 : 1 dla tekstu — test).
- [ ] Baterie: kolumny równe w pełnym oknie, połowie podziału i wąskiej kolumnie (test układu
      i zrzuty trzech szerokości); „limit tygodnia” w tej samej kolumnie co jego sąsiad z wiersza
      wyżej.
- [ ] Kontekst „użyte / okno · %” widoczny bez najechania; okno z danych sesji (test na sesji
      z oknem 200k i 1M — dwie różne wartości na pasku).
- [ ] Każda zmiana ma test, który spada na kodzie sprzed niej i przechodzi po niej (obie wersje
      w jednym przebiegu, `git worktree` HEAD).
- [ ] `claude plugin validate .` i `claude plugin test .` zielone binarką aplikacji w `panel/`,
      `progress/` i `cache-keeper/` (co najmniej 205 / 42 / 181); rdzeń 410+ zielony;
      `sync-panel-core.js --check` zgodne.
- [ ] `DESIGN.md` 1.3 i brief 5.1 z wierszami w `ARTEFAKTY.md`; poprzednie wersje w historii gita.
- [ ] Zgoda Łukasza na wydanie zapisana w dzienniku jego słowami przed pierwszą zmianą numeru;
      `relai` nadal 3.2.0 we wszystkich plikach; tag `relai-panel-v0.20.0` w `git ls-remote --tags
      origin`; po instalacji katalogi nowych wersji w `installed_plugins.json` i zrzut z nich.
- [ ] `git diff` wydania nie dotyka `docs/plany/PANEL_CODEX/` ani `docs/zasoby/PANEL_RELAI/makiety/`.
- [ ] Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E5/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (mody-warianty w `dev-mods`, kopie w cache
      pluginów, pliki w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/WYGLAD_PANELU/STATUS.md`: E5 → ZREALIZOWANY (data), linia w dzienniku wdrożenia.
   Następnego etapu nie ma.
1a. Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E5/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (C1); lekcje do `docs/LEKCJE.md`
   i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — wersje pluginów panelu po wydaniu, stan planu; `CLAUDE.md` — wiersz planu
   i wiersz pluginu.
5. **Ostatni etap planu — zamiast `PROMPT_ETAP_6.md` uruchom sekwencję zamknięcia planu** (skill
   `relai-planning`, plik `plan-closing.md`, D-36): bramki i odnogi najpierw, potem `STATE.md`,
   wpis „dowiezione vs plan” (E1–E5, Aneksy A–G), status planu, ryzyka, przeniesienie folderu do
   `docs/archiwum/plany/`, linia „Aktywny plan” w `CLAUDE.md`.
6. Commit — propozycja, conventional message, bez plików PANEL_CODEX i makiet.
