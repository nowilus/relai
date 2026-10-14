# PROMPT_ETAP_5 — pomiar humanizacji na korpusie i wydanie RelAI 3.1.0

Plan: HUMANIZACJA • Etap: **E5 z E5** • Wygenerowano: 2026-10-14 (autor: Opus 5.5, w rytuale „Na koniec” etapu E4) • Wykonawca: **Opus 5.5** (STATUS.md: „Opus 5.5 w świeżych sesjach”), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (plan tak przypisał E5: pomiar jakości z kryterium liczbowym, wydanie publiczne i zamknięcie
> planu — błąd kosztuje wydanie poprawkowe).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, profil `prompty` (rejestr `ARTEFAKTY.md`), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (przepisane też niżej) |
| `docs/plany/HUMANIZACJA/PLAN.html` | sekcje 2 (cele i kryterium „licznik wzorców spada co najmniej o połowę”), 6 (E5), 7 (ryzyka H1, H4, H5), 8 (przypadki brzegowe), 9 (sprawy dla człowieka), 10 (Aneks A) |
| `docs/plany/HUMANIZACJA/STATUS.md` | bramki manualne (trzy `OTWARTA`), odnoga FILM_TESTY_V3 (`OTWARTA` — blokuje zamknięcie planu) |
| `docs/DZIENNIK.md` | wpisy E1–E4 HUMANIZACJA: sekcje „Świadomie odłożone” (pomiar zapisu pliku po „tak”, ostrożność komendy 4/6 „nic do zmiany”, tabela 14 komend w `/relai-update`) |
| `docs/PULAPKI.md` | P-005 (sekwencja wydania: `plugin validate` przed tagiem, update → restart → sprawdzenie treścią cache), P-024 (binarka aplikacji do `plugin test`) |
| `docs/archiwum/plany/FILM_PREZENTACYJNY/PROMPT_ETAP_7.md` | sekcja „Zakres etapu” punkty 3–9: wzór sekwencji wydania 3.0.0 (numery w siedmiu źródłach, `history.md`, `ARTEFAKTY.md` wobec `git diff`, notatki wydania, publikacja) |
| `core/humanize/REGULY.md`, `core/humanize/jezyki/pl.md` | lista 26 wzorców i nakładka PL — z nich licznik wzorców korpusu |
| `adapters/claude-code/commands/relai-humanize.md` | Krok 7 (strażnik faktów), Krok 9 (zapis pliku po „tak” — pomiar odłożony z E1) |
| `adapters/claude-code/commands/relai-update.md` | stan docelowy wydania (`KOMENDY.md` 3.0.0, „tabela czternastu komend”) do przepisania na 3.1.0 |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Humanizacja działa** (E1–E4): komenda `/relai-humanize` z wywiadem, trzy warstwy ustawień
  (`humanize-mode.js`), tryb ciągły w Claude Code (hook `humanize-continuous`, `SKROT.md`), formularz
  panelu z trybami, 15 komend w dokumentach, nota MIT pilnowana walidatorem. Kodu funkcji w tym
  etapie nie zmieniasz — poprawka wynikła z pomiaru to **sygnał odchylenia** (pytanie: poprawka
  w etapie z aneksem / odnoga / świadomie odłożone), nie cicha zmiana.
- **Wiersz „Humanizacja” w tym repo** jest `wyłączona` (decyzja Łukasza 2026-10-14) — pomiar
  trybu ciągłego idzie na fiksturach, jak w E3.
- **Zakładka komend panelu** ma 885 px po decyzji Łukasza w E4 („Polecane teraz” z odstępami jak
  grupy) — test pilnuje 900 px.
- **Sekwencja wydania** jak 3.0.0 (archiwum FILM_PREZENTACYJNY E7) i P-005: `plugin validate`
  repo i trzech pluginów przed tagiem; po publikacji `marketplace update` → `plugin update` →
  restart → porównanie cache z repo po CRLF → LF.
- **Pluginy panelu** zmieniły się od swoich tagów (`relai-panel-v0.15.0`; kopie rdzenia w
  `progress/` i `cache-keeper/` dostały nowy `commands.mjs`) — numery wybiera Łukasz w pytaniu
  z punktu 1 zakresu; rekomendacja: `relai-panel` 0.16.0 (formularz z trybami), `relai-progress`
  0.4.1 i `relai-cache-keeper` 0.7.1 (sama kopia rdzenia).
- **Granica zakresu:** to ostatni etap planu. Po nim sekwencja zamknięcia planu (D-36). Odnoga
  FILM_TESTY_V3 nie jest w zakresie etapu — przy zamknięciu planu Łukasz rozstrzyga jej los
  (zamknąć / przenieść / zostawić z kartą). Zawężenie bramki zgody optymalizatora (odzywa się na
  raport subagenta) — świadomie odłożone, poza planem. Rotacja dziennika — rytuał „kończymy na
  dziś”, nie ten etap.

## Stan wyjściowy (co realnie zastajesz po E4)

E4 zamknięty 2026-10-14. RelAI **3.0.0** w repo i publicznie (tag `v3.0.0`); w repo od tego tagu:
humanizacja (E1–E4), wiersz `Humanizacja` w `SPEC_USTAWIENIA.md` v15, `SPEC_KOMENDY.md` v11
z zakresem 3.1.0, `/relai-humanize` v3. RelAI 3.0.0 zainstalowany na stałe (scope `user`) — zmiany
z repo mierzysz `claude -p --plugin-dir <repo> --setting-sources project,local` (jak E3) albo
`claude plugin test` binarką `%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe` (P-024).
Hook startu może zgłosić `docs/DZIENNIK.md` ponad progiem 150 KB — zaproponuj rotację osobno,
przed pracą etapu, i nie mieszaj jej z commitem wydania.

Testy: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js
core/panel/tests/*.test.js adapters/codex/tests/*.test.js` → **403** (FAKT, 2026-10-14);
`node core/tools/validate-adapters.js` spójny, jedno ostrzeżenie zastane (`relai-prompt.md`
30 106 B), „nota MIT Humanizera: 4 plików wymaganych, 4 wymienionych”; `claude plugin test`:
panel 178, progress 31, cache-keeper 178.

```
core/humanize/REGULY.md, jezyki/pl.md, SKROT.md   # baza reguł (26 wzorców), nakładka PL, ściąga trybu ciągłego
core/humanize/LICENSE-humanizer.md                # nota MIT (walidator, punkt 13)
core/process/humanize-facts.js                     # strażnik faktów (pliki i stdin)
core/process/humanize-mode.js                      # ustawienia w trzech warstwach
core/process/humanize-continuous.js                # reguły trybu ciągłego (koszt 349–549 B przed odpowiedzią, 758–770 B po zapisie)
core/process/tests/fixtures/humanize/              # fikstury E1 (6 tekstów korpusu wstępnego)
adapters/claude-code/commands/relai-humanize.md   # v3, argument-hint "[tekst albo ścieżka pliku] | on | off | ustawienia"
adapters/claude-code/commands/relai-update.md     # stan docelowy 3.0.0 — do 3.1.0 (tabela 15 komend)
adapters/claude-code/skills/relai-core/history.md # wpis 3.0.0 na górze; 3.1.0 do dopisania (kopia Codeksa generatorem)
.claude-plugin/plugin.json, .codex-plugin/plugin.json, marketplace × 2   # 3.0.0 — siedem źródeł numeru (walidator)
panel/ progress/ cache-keeper/ .claude-plugin/plugin.json                # 0.15.0 / 0.4.0 / 0.7.0
```

**Czego jeszcze nie ma (to jest zakres tego etapu):** korpusu 8 tekstów (5 PL, 3 EN) z licznikiem
wzorców przed i po, strażnika faktów puszczonego na całym korpusie, pomiaru kosztu tury trybu
ciągłego (H5), pomiaru zapisu pliku po „tak” (Krok 9), próby w świeżej sesji po instalacji 3.1.0,
numerów 3.1.0 i pluginów panelu, wpisu 3.1.0 w `history.md`, stanu docelowego 3.1.0
w `/relai-update`, notatek wydania, publikacji i zamknięcia planu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie (przepisane w całości 2026-10-14):**

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
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit (L-0116, L-0119, L-0135, L-0148,
     L-0188); znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
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
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189)
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

> **Katalog roboczy tego etapu: `.claude/relai/work/HUMANIZACJA/E5/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Na start — decyzje człowieka w jednym wywołaniu AskUserQuestion:** (a) zgoda na publikację
   3.1.0 (tag, wydanie GitHub, marketplace; bez zgody etap kończy się lokalnym commitem —
   PLAN.html sekcja 9); (b) bramka „czy tryb ciągły »dokumenty« poprawia także tekst podyktowany
   dosłownie” — odpowiedź wpływa na korpus; zmiana reguły to sygnał odchylenia, nie cicha poprawka;
   (c) numery pluginów panelu (rekomendacja w „Decyzjach już podjętych”). Rozstrzygnięcia od razu
   do `STATUS.md` (bramki `ROZSTRZYGNIĘTA <data> — <jak>`).
2. **Korpus** — 8 tekstów (5 PL, 3 EN) jako fikstury śledzone w
   `core/process/tests/fixtures/humanize/korpus/` (istniejące 6 z E1 można włączyć; brakujące
   dopisz z realnych rodzajów: dokument formalny, roboczy, czat, tekst na zewnątrz, commit/README
   nie — wyłączone z profilu). Kryterium z PLAN.html sekcja 2 („licznik wzorców spada co najmniej
   o połowę”) sprawdź **na materiale przed pracą** — tekst bez wzorców nie może spaść o połowę
   (zasada 4: arytmetycznie nieosiągalne wraca jako pytanie). Licznik wzorców — skrypt w katalogu
   roboczym, dwa liczniki (wąski i szeroki, zasada 5) z kontrolą pozytywną na podłożonych wzorcach.
3. **Przebiegi korpusu** — `claude -p --plugin-dir <repo> --setting-sources project,local`, jedna
   świeża sesja na tekst, `/relai-humanize` na pliku; wynik: licznik przed/po per tekst i suma,
   strażnik faktów (`humanize-facts.js`) na każdej parze → 0 zgubionych / 0 dopisanych; koszt
   z `total_cost_usd`. H4: teksty PL — półpauza i „…” zostają, strona bierna w tekście urzędowym
   nie jest „poprawiana”.
4. **Koszt tury (H5)** — trybu ciągłego „czat” i „dokumenty” na fiksturze: ta sama tura z wierszem
   `wyłączona` i `włączona`, różnica tokenów wejścia (pole `usage` z wyniku `-p`) ponad zmierzony
   szum (dwa przebiegi każdego wariantu).
5. **Zapis pliku po „tak” (Krok 9)** — odłożony z E1: przebieg interaktywny z Łukaszem albo
   w sesji `-p` z drugą turą (`--resume`), dowód `git diff` na fiksturze i nietknięte pliki obok.
6. **Numery wersji** — `3.1.0` w siedmiu źródłach (walidator), pluginy panelu wg punktu 1
   (`plugin.json` + wpis w marketplace); `grep -r "3\.0\.0"` (zwykłym `grep -r`, poza `.git`)
   i stare numery pluginów — każde trafienie rozstrzygnięte (historyczne / deklaracja stanu).
   `adapters/claude-code/commands/relai-update.md` — stan docelowy 3.1.0 (`KOMENDY.md` z 15
   komendami, nagłówek `RelAI 3.1.0`, wiersz `Humanizacja` w `USTAWIENIA.md`); `docs/KOMENDY.md` —
   nagłówek `RelAI 3.1.0`. Kopie: `node adapters/codex/generate-skills.js`,
   `node core/tools/sync-panel-core.js`.
7. **Historia i rejestr** — `adapters/claude-code/skills/relai-core/history.md`: wpis „Wersja 3.1.0”
   w układzie poprzednich (humanizacja: komenda, wywiad, trzy warstwy, tryb ciągły w Claude Code,
   formularz panelu, nota MIT); `docs/ARTEFAKTY.md` — każdy artefakt zmieniony od `v3.0.0`
   (`git diff --stat v3.0.0..HEAD` na plikach z rejestru) ma wpis z wersją (L-0161).
8. **Kontrole wydania** — testy rdzenia, `validate-adapters.js`, `generate-skills.js --verify`,
   `sync-panel-core.js --check`, `plugin test` trzech pluginów, `plugin validate` repo i trzech
   pluginów binarką aplikacji (P-005), skan sekretów na diffie `origin/main..HEAD`.
9. **Notatki wydania** (po angielsku, jak 3.0.0) — szkic w katalogu roboczym: zdanie wstępne,
   lista zmian, linia „Checks:” z dzisiejszymi wynikami, liczby korpusu, instrukcja aktualizacji
   (`claude plugin marketplace update relai`, `claude plugin update relai@relai`, restart).
   `README.md` — baner 3.1.0. Szkic do przejrzenia przez Łukasza przed publikacją.
10. **Publikacja — tylko po zgodzie z punktu 1, powtórzonej po pokazaniu szkicu:** commit, push
    `main`, tag adnotowany `v3.1.0` (i tagi pluginów panelu), wydanie GitHub `RelAI 3.1.0`. Po
    publikacji: `marketplace update` → `plugin update` → restart aplikacji → porównanie cache
    z repo po CRLF → LF; próba w **świeżej sesji** na zainstalowanym 3.1.0 (`/relai-humanize`
    na jednym tekście korpusu, ścieżka cache w transkrypcie). Bramka „rzut oka na ikonę i formularz
    w panelu” — po restarcie, z Łukaszem.
11. **Zamknięcie planu** — to ostatni etap: sekwencja D-36 z rytuału niżej.

Elementy łatwe do pominięcia: pliki PANEL_CODEX (`docs/plany/PANEL_CODEX/`,
`docs/zasoby/PANEL_RELAI/makiety/`) poza każdym commitem etapu; wydania po kolei — gdy PANEL_CODEX
wydaje w tym czasie, pytasz o kolejność; dokumenty tylko przez Edit (zasada 5).

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Decyzje z punktu 1 (publikacja, tekst podyktowany dosłownie, numery pluginów) zapisane w `STATUS.md` jako bramki `ROZSTRZYGNIĘTA` z datą i słowami Łukasza.
- [x] Korpus: 8 fikstur (5 PL, 3 EN) w repo; licznik wzorców ma kontrolę pozytywną (podłożony wzorzec trafiony) i wynik per tekst przed/po do wpisu; suma po ≤ połowa sumy przed — **albo** kryterium nieosiągalne pokazane na materiale przed pracą i pytanie do Łukasza (aneks), bez cichego obniżenia progu.
- [x] Strażnik faktów na wszystkich 8 parach: `{"zgubione":[],"dopisane":[]}`; kontrola pozytywna na parze z podłożoną zmianą liczby → różnica wykryta.
- [x] H4: w tekstach PL po humanizacji półpauza i cudzysłów „…” zachowane (`grep -c` przed i po), dowód na każdym tekście PL.
- [x] H5: różnica tokenów wejścia tury z trybem ciągłym i bez niego zmierzona dwoma przebiegami każdego wariantu; wynik i szum do wpisu.
- [x] Zapis pliku po „tak”: `git diff` fikstury pokazuje zmianę wyłącznie w prozie, plik obok nietknięty (suma przed i po).
- [x] `node core/tools/validate-adapters.js` → exit 0, „numery wersji: 7 zrodel, wartosc "3.1.0"”, nota MIT 4/4; ostrzeżenia wypisane we wpisie.
- [x] `grep -r "3\.0\.0"` i stare numery pluginów panelu po repo poza `.git` — każde trafienie wypisane jako „podbite” albo „historyczne, zostaje”.
- [x] `history.md` (obie kopie) ma wpis 3.1.0; `docs/ARTEFAKTY.md` — każdy artefakt z rejestru zmieniony od `v3.0.0` ma wpis (lista z `git diff --stat v3.0.0..HEAD` do wpisu).
- [x] Testy rdzenia zielone (403 + nowe, liczba do wpisu); `plugin test` panel / progress / cache-keeper zielone (178 / 31 / 178 przed); `plugin validate` repo i trzech pluginów — `✔ Validation passed` (ostrzeżenie o root `CLAUDE.md` dopuszczalne, zasada 15).
- [x] Skan sekretów na plikach diffu `origin/main..HEAD` — zero trafień; kontrola pozytywna (próbka złożona w czasie wykonania) trafiona.
- [ ] Publikacja po zgodzie: `git ls-remote --tags origin v3.1.0` zwraca tag, `gh release view v3.1.0` istnieje, cache pluginu po `plugin update` i restarcie równy repo po CRLF → LF (liczba plików i rozjazdów do wpisu), świeża sesja na 3.1.0 wykonała `/relai-humanize` — **albo** brak zgody i etap kończy się lokalnym commitem, bramka publikacji `OTWARTA`.
- [ ] Pliki PANEL_CODEX nietknięte: `git status --short` i `git diff --stat` na `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` identyczne z zapisem sprzed etapu; żaden w commitach etapu.
- [ ] Sekwencja zamknięcia planu (D-36) wykonana w całości: bramki i odnoga FILM_TESTY_V3 rozstrzygnięte z Łukaszem, plan `ZREALIZOWANY`, folder w `docs/archiwum/plany/`, linia „Aktywny plan” w `CLAUDE.md` wskazuje istniejący plik albo brzmi `Aktywny plan: brak`.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (Opus 5.5) + Lukasz`; `docs/STATE.md` nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/HUMANIZACJA/E5/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (fikstury `%TEMP%/relai-e5-*`, transkrypty sesji `-p`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/HUMANIZACJA/STATUS.md`: E5 → ZREALIZOWANY (data); linia zamknięcia E5 w dzienniku
   wdrożenia; bramki rozstrzygnięte w etapie → `ROZSTRZYGNIĘTA <data> — <jak>`.
1a. Katalog roboczy `.claude/relai/work/HUMANIZACJA/E5/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (H1, H4, H5 planu; O4 projektu —
   koszt trybu ciągłego); lekcje z etapu → `docs/LEKCJE.md` i odświeżone „Zasady aktywne” (limit 15).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` (wersja 3.1.0, liczby testów, plan HUMANIZACJA zamknięty), `docs/KOMENDY.md`
   (nagłówek wersji), `README.md` (baner), linie planu w `CLAUDE.md`; `docs/ARTEFAKTY.md` zgodnie
   z punktem 7 zakresu.
5. **To ostatni etap planu — zamiast generacji następnego promptu uruchom sekwencję zamknięcia
   planu (D-36)** z pliku `plan-closing.md` skilla `relai-planning` (wczytaj skill narzędziem
   Skill): rozstrzygnięcie otwartych bramek manualnych → rozstrzygnięcie otwartych odnóg
   (FILM_TESTY_V3) → `STATE.md` → wpis zamykający „dowiezione vs plan” → status planu
   `ZREALIZOWANY` → przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → linia
   „Aktywny plan” w `CLAUDE.md` (PANEL_CODEX albo `brak` — pytasz) → podsumowanie.
6. Commit (conventional, EN) i push — wyłącznie za zgodą Łukasza, bez plików PANEL_CODEX.
