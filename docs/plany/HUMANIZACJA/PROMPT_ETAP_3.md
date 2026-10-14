# PROMPT_ETAP_3 — tryb ciągły humanizacji: reguła przed odpowiedzią i hook po zapisie dokumentu

Plan: HUMANIZACJA • Etap: **E3 z E5** • Wygenerowano: 2026-10-14 (autor: Opus 5.5, w rytuale „Na koniec” etapu E2) • Wykonawca: **Opus 5.5** (STATUS.md: „Opus 5.5 w świeżych sesjach”), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (dwa hooki w każdej turze, wyłączenia ścieżek i współpraca z bramką optymalizatora mają
> przypadki, których nie widać na jednym przebiegu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, profil `prompty` (rejestr `ARTEFAKTY.md`), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (przepisane też niżej) i lekcje L-0185, L-0187, L-0188 |
| `docs/plany/HUMANIZACJA/PLAN.html` | sekcje 5 (tryb ciągły: czat i teksty na zewnątrz, dokumenty), 6 (E3), 7 (ryzyka H2, H3, H5, H6), 8 (przypadki: zamrożony plan, prompty, commit, „dwie wersje” przy kilku zapisach), 10 (Aneks A) |
| `docs/DZIENNIK.md` | ostatni wpis (E2 HUMANIZACJA) — co zmierzono, „Świadomie odłożone” (bramka optymalizatora przy odpowiedzi na pytanie modelu) |
| `core/process/humanize-mode.js` | rdzeń ustawień z E2: `ustawienia()` (trzy warstwy), `parsuj`, `tonPelny`, stany i listy brzmień — hook czyta przez niego, nie własnym parserem |
| `core/process/prompt-mode.js` + `adapters/claude-code/hooks/prompt-mode.js` | wzór hooka `UserPromptSubmit`: czysta logika w rdzeniu, adapter bez wiedzy o regułach; filtr pomijania; reguła ASCII w zmiennej stałej |
| `adapters/claude-code/hooks/hooks.json` | gdzie dopiąć nowe wpisy (`UserPromptSubmit`, `PostToolUse` z matcherem `Write\|Edit\|MultiEdit`) |
| `adapters/claude-code/commands/relai-humanize.md` | Krok 2 (lista wyłączeń), Krok 6 (tylko proza, profil), Krok 7 (strażnik) — tryb ciągły nie może być luźniejszy niż komenda |
| `core/humanize/REGULY.md`, `core/humanize/jezyki/pl.md` | materiał na ściągę `SKROT.md` (do 6 KB SZACUNEK) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Nośnik zmierzony w optymalizatorze:** hook `UserPromptSubmit` dokłada kontekst do tury
  i promptu nie podmienia (POMIAR_CLAUDE.md, 2026-09-15). Tryb ciągły stoi na regule wstrzykiwanej,
  nie na podmianie (plan, sekcja 5).
- **Czat i teksty na zewnątrz:** hook przy każdym prompcie dokłada krótką regułę (ASCII, do 600 B
  SZACUNEK) wskazującą ściągę `.claude/relai/humanize/SKROT.md`; model czyta ściągę tylko wtedy, gdy
  pisze tekst z zakresu. Czat zawsze bez akceptacji (plan, sekcja 5; wywiad E2).
- **Dokumenty:** hook `PostToolUse` po zapisie pliku w `docs/` dokłada regułę „popraw prozę tego
  pliku”: tryb `notka` — od razu i jedna linia z liczbą wzorców; tryb `dwie wersje` — zmienione
  akapity obok oryginału i „tak”, **raz na plik w turze**, po ostatnim zapisie (plan, sekcje 5 i 8).
- **Ustawienia i ich warstwy** z E2 bez zmian: wiersz `Humanizacja`, pierwsza warstwa z wierszem
  rozstrzyga, stan spoza listy = cisza, `zakresy` decydują, który hook mówi. Hook czyta przez
  `humanize-mode.js`, identyfikator sesji z `session_id` zdarzenia.
- **Wyłączenia (H3):** archiwum `docs/archiwum/`, zamrożone `PLAN.*` (status inny niż
  `DO AKCEPTACJI`), `docs/DECYZJE.md`, prompty etapowe, `SPEC_*`, propozycje optymalizatora,
  instrukcje dla modeli — tryb ciągły pomija je **w hooku**, nie tylko w regule dla modelu.
- **Tylko proza (H2):** tabele, nagłówki, adnotacje `*(…)*`, bloki kodu, wiersze czytane maszynowo
  zostają bajt w bajt; strażnik faktów jak w komendzie.
- **Optymalizator i humanizacja razem (H6):** propozycja optymalizatora wyłączona z humanizacji;
  test z oboma trybami włączonymi naraz.
- **Profil stylu** działa tylko w rodzajach z `profil w`; commit, PR i README nigdy (E2).
- **Granica zakresu:** formularz trybów w panelu, powrót zakładki komend do 900 px, `argument-hint`
  komendy razem z formularzem, `KOMENDY.md`, `SPEC_KOMENDY.md`, liczby komend, nota MIT w README
  i walidatorze → **E4**; korpus 8 tekstów, pomiar kosztu tury (H5), wydanie 3.1.0 → **E5**.
  Odnoga FILM_TESTY_V3 — osobny wątek, testów filmu nie ruszasz.

## Stan wyjściowy (co realnie zastajesz po E2)

E2 zamknięty 2026-10-14. `/relai-humanize` ma wywiad przy pierwszym użyciu (pokaz na próbce, dwa
okna), `on` / `off` / `ustawienia` i ton per rodzaj tekstu; ustawienia czyta i zapisuje
`core/process/humanize-mode.js`. **Trybu ciągłego nie ma:** wiersz z `włączona · zakresy: …` jest
zapisywany, ale żaden hook go nie czyta. RelAI 3.0.0 zainstalowany na stałe (scope `user`) — zmiany
w repo mierzysz komendą podłożoną pod inną nazwą albo `--plugin-dir <repo>` z
`--settings '{"enabledPlugins":{"relai@relai":false}}'`; hooki z repo mierzysz tylko tą drugą drogą.
`claude -p` z Basha aplikacji był w E2 zalogowany (`claude auth status` → `loggedIn: true`); gdy nie
będzie — P-032.

W tym repo `docs/USTAWIENIA.md` ma wiersz
`| 2026-10-14 | Humanizacja | włączona · zakresy: czat · pokaz: dwie wersje · profil: tak · profil w: czat |`
— **bramka manualna w `STATUS.md`**: Łukasz rozstrzyga przed startem, czy zostaje (od E3 czat tego
projektu będzie humanizowany sam). Tryb ciągły optymalizatora jest w tym projekcie włączony
(wiersz `Tryb ciągły`), więc test H6 ma materiał na żywo.

Testy: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js
core/panel/tests/*.test.js adapters/codex/tests/*.test.js` → **384** (FAKT, 2026-10-14); walidator
`node core/tools/validate-adapters.js` spójny z jednym ostrzeżeniem zastanym (`relai-prompt.md`
30 106 B); `claude plugin test` binarką aplikacji 2.1.295: panel 178, progress 31, cache-keeper 178.

```
core/process/humanize-mode.js            # ustawienia: ustawienia(), parsuj(), tonPelny(), CLI odczyt/zapisz/przelacz/profil (487 linii)
core/process/humanize-facts.js           # strażnik faktów (pliki, "-", --stdin)
core/process/prompt-mode.js              # wzór: przełącznik, filtr pomijania, REGULA, bramka zgody
core/process/session-signals.js          # provisionHumanize (kopia core/humanize/ do .claude/relai/humanize/), NARZEDZIA
core/humanize/REGULY.md, jezyki/pl.md     # 26 wzorców, nakładka PL, ton per rodzaj (20,3 KB + 8,3 KB)
core/humanize/PROFIL_STYLU.md            # format i budowa profilu stylu
adapters/claude-code/hooks/prompt-mode.js # adapter UserPromptSubmit optymalizatora (89 linii)
adapters/claude-code/hooks/hooks.json    # PreToolUse, PostToolUse (Write|Edit|MultiEdit), UserPromptSubmit, SessionStart, Stop
adapters/claude-code/commands/relai-humanize.md  # komenda v2 (308 linii, 19,3 KB)
core/templates/SPEC_USTAWIENIA.md        # sekcja „Wiersz Humanizacja (od 3.1.0)”
~/.claude/relai/STYL.md                  # profil Łukasza (poza repo)
```

**Czego jeszcze nie ma (to jest zakres tego etapu):** ściągi `core/humanize/SKROT.md`, czystej
logiki trybu ciągłego (filtr ścieżek, reguła przed odpowiedzią, reguła po zapisie, „raz na plik
w turze”), hooka `UserPromptSubmit` humanizacji i hooka `PostToolUse` po zapisie dokumentu, testów
obu hooków osobno i razem z optymalizatorem, zdania o trybie w specyfikacji ustawień.

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

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/HUMANIZACJA/E3/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`core/humanize/SKROT.md`** — ściąga dla trybu ciągłego (do 6 KB SZACUNEK, zmierz `wc -c`):
   najczęstsze wzorce z polskimi nazwami, „tylko proza”, „nie dodawaj faktów”, ton per rodzaj,
   profil tylko w rodzajach z `profil w`, wyłączenia. Kopiowana do `.claude/relai/humanize/` razem
   z resztą bazy (test `session-signals.test.js` pilnuje listy plików — dopisz).
2. **Czysta logika trybu ciągłego** w `core/process/` (nowy plik albo rozszerzenie
   `humanize-mode.js` — rozstrzygnij po rozmiarze; plik do 800 linii): filtr ścieżek (wyłączenia
   z decyzji wyżej, sprawdzenie statusu planu dla `PLAN.*`), reguła przed odpowiedzią (ASCII, do
   600 B — zmierz), reguła po zapisie dokumentu dla `notka` i `dwie wersje`, „raz na plik w turze”
   (stan na sesję, plik na zapisującego, bez plików pod `.claude/` pisanych przez model — L-0185).
   Testy w `core/process/tests/`.
3. **Adapter Claude Code** — hook `UserPromptSubmit` humanizacji (zakresy `czat`, `zewnętrzne`)
   i hook `PostToolUse` po zapisie pliku w `docs/` (zakres `dokumenty`), dopięte w
   `adapters/claude-code/hooks/hooks.json`. Brak wiersza, stan `wyłączona` albo nierozpoznany →
   zero bajtów w kontekście. Komunikaty ASCII (zasada 15).
4. **Współpraca z optymalizatorem (H6)** — gdy oba tryby są włączone, propozycja optymalizatora
   nie jest humanizowana; kolejność reguł w turze ustalona i opisana. Rozstrzygnij jednym pytaniem
   (AskUserQuestion), czy przy okazji zawężyć bramkę optymalizatora o odpowiedzi na pytanie modelu
   („Świadomie odłożone” wpisu E2) — to plan OPTYMALIZATOR_PROMPTOW, więc odpowiedź to odnoga albo
   odłożenie, nie zmiana „przy okazji”.
5. **`core/templates/SPEC_USTAWIENIA.md`** — w sekcji „Wiersz `Humanizacja`”: który hook czyta
   który zakres, koszt reguły (bajty z pomiaru), wyłączenia; tabela „Wiersz | Czyta go” —
   uzupełnione o hooki. `core/MANIFEST.json` — nowe pliki rdzenia.
6. **`adapters/claude-code/commands/relai-humanize.md`** — tylko jeśli tryb ciągły zmienia
   zachowanie komendy (np. Krok 3a mówi o trybie); rozmiar do 480 linii i 20 KB, potem
   `node adapters/codex/generate-skills.js`.
7. **`docs/ARTEFAKTY.md`** — nowe i podbite pozycje (ściąga, specyfikacja, ewentualnie komenda),
   każda z „co i po co”.
8. **Dogfooding** — `claude -p --plugin-dir <repo>` z wyłączoną instalacją: (a) wiersz z
   `zakresy: czat` — reguła wstrzyknięta (licznik w transkrypcie), odpowiedź bez wzorców z listy;
   (b) wiersz `wyłączona` — zero bajtów reguły; (c) zapis do `docs/` przy `dokumenty` — reguła po
   zapisie, zapis do `docs/archiwum/` i do zamrożonego `PLAN.html` — cisza; (d) oba tryby ciągłe
   naraz.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js` — zero błędów; liczba testów przed (384 — FAKT) i po do wpisu.
- [ ] `node core/tools/validate-adapters.js` — zero błędów, parytet skilli Codeksa 0 rozjazdów; ostrzeżenia wypisane we wpisie.
- [ ] `claude plugin test` binarką aplikacji dla `panel/`, `progress/`, `cache-keeper/` — 178 / 31 / 178 bez zmian.
- [ ] Reguła przed odpowiedzią: rozmiar w bajtach z `wc -c` ≤ 600 (albo uzasadnione przekroczenie we wpisie); `SKROT.md` ≤ 6 KB albo uzasadnienie.
- [ ] Hook przy wyłączonym trybie, braku wiersza i wierszu nierozpoznanym: **zero bajtów** wyjścia, z kontrolą pozytywną (ten sam układ z `włączona` → reguła) w tym samym przebiegu testów.
- [ ] Wyłączenia (H3): zapis do `docs/archiwum/…`, `docs/plany/<zamrożony>/PLAN.html`, `docs/DECYZJE.md`, `PROMPT_ETAP_*.md` i `SPEC_*` — hook milczy; zapis do zwykłego dokumentu w `docs/` — mówi (kontrola pozytywna).
- [ ] „Dwie wersje”: kilka zapisów tego samego pliku w jednej turze → jedno porównanie (test); `notka` — jedna linia z liczbą wzorców w regule.
- [ ] H2 na żywo: dokument z tabelą, nagłówkami, adnotacją `*(…)*` i wierszem czytanym maszynowo poprawiony w trybie ciągłym — te elementy bajt w bajt (dowód negatywny: suma przed i po dla każdego z nich).
- [ ] H6: oba tryby ciągłe włączone w jednej sesji `-p` — propozycja optymalizatora nie jest humanizowana, kolejność reguł w transkrypcie zgodna z opisem.
- [ ] `git grep -nE "sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}|sk_(test|live)_[A-Za-z0-9]{10,}"` — 0 trafień, z kontrolą pozytywną na próbce złożonej w czasie wykonania.
- [ ] `docs/ARTEFAKTY.md` ma podbite i nowe wpisy; `git status --short` nie pokazuje plików spoza zakresu (zastane zmiany PANEL_CODEX i `docs/zasoby/PANEL_RELAI/makiety/` — nietknięte).
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md` nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/HUMANIZACJA/E3/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (podłożone komendy, `%TEMP%`, pliki sesji `.claude/relai/humanizacja/`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/HUMANIZACJA/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_4.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/HUMANIZACJA/E3/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (H1–H8 planu); lekcje z etapu →
   `docs/LEKCJE.md` i odświeżone „Zasady aktywne” (limit 15).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — „Nad czym pracujemy teraz” (plan HUMANIZACJA po E3) i „Co działa” (tryb
   ciągły); `README.md` bez zmian, chyba że zmienił się sposób uruchomienia.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` sekcja 6 (E4 — panel i trzy narzędzia), Aneksu A6, ryzyka H8, realnego stanu po tym
   etapie (w tym `argument-hint` komendy i powrót zakładki komend do 900 px) i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku.
