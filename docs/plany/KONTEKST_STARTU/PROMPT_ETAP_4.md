# PROMPT_ETAP_4 — „Zasady aktywne” jako indeks z wyzwalaczami

Plan: KONTEKST_STARTU • Etap: **E4 z E5** • Wygenerowano: 2026-10-28 (autor: Opus 5.5, w rytuale „Na koniec” E3) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (ryzyko 1 planu jest jedynym wysokim: indeks, którego model nie doczyta, zgubi zasadę
> bez śladu, a dowodem jest ewaluacja na świeżych sesjach, nie test jednostkowy).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu; rytuał startu to `node .claude/relai/tools/start-digest.js` |
| `docs/plany/KONTEKST_STARTU/PLAN.html` | sekcje 2 (cel 3: indeks ≤ 5 KB, ewaluacja 3/3 i 0/3), 5 (akapit „Praca”), 6 (wiersz E4), 7 (ryzyko 1), 8 („Zasada bez sensownego wyzwalacza”), 9 (aneks do D-15) |
| `docs/plany/KONTEKST_STARTU/STATUS.md` | Aneksy A i B, bramki manualne, dziennik wdrożenia |
| `docs/DZIENNIK.md` | wyłącznie wpisy „KONTEKST_STARTU E2” (L-0296, skrót ponad limitem wyjścia) i „KONTEKST_STARTU E3” (metoda pomiaru na żywo, L-0299–L-0301) |
| `docs/DECYZJE.md` | wiersz D-15 (destylat „Zasady aktywne” czytany na starcie) — aneks tego etapu |
| `docs/LEKCJE.md` | sekcja „Zasady aktywne” (15 pozycji) — materiał indeksu; lekcje L-0296–L-0301 spoza destylatu |
| `core/templates/SPEC_LEKCJE.md` | struktura rejestru, limit 15 pozycji, „start sesji czyta wyłącznie »Zasady aktywne«” (l. 219, 238) |
| `core/process/start-digest.js` | `NAGLOWEK_ZASAD`, blok „Zasady aktywne” (l. 191–195, 244) — co skrót wypisuje dziś |
| `core/process/session-signals.js` | budżet startu: próg `zasady: 30` (l. 923), rotacja lekcji |
| `core/tools/eval-triggers.js` + `core/evals/triggers.json` | instrument ewaluacji wyzwalania (14 pozycji, świeże sesje `claude -p`) — punkt wyjścia ewaluacji sześciu scenariuszy |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Przed jakąkolwiek zmianą — aneks do D-15** (PLAN §9, decyzja Łukasza „przed startem E4”).
  Bez jego „tak” na brzmienie i zapisu w `docs/DECYZJE.md` (datowany aneks przy D-15, wzór: D-07,
  D-39) etap się nie zaczyna. Proponowane brzmienie: *„Aneks A (2026-10-28, KONTEKST_STARTU E4):
  start sesji czyta „Zasady aktywne” jako **indeks** — numer, tytuł zasady i wyzwalacz w jednej
  linii; pełne brzmienie zasady zostaje w `LEKCJE.md` i jest doczytywane, gdy zadanie trafia
  w wyzwalacz. Zasada obowiązująca w każdym zadaniu stoi w indeksie w pełnym brzmieniu.”*
- Wariant C planu (PLAN §4): indeks z wyzwalaczami w skrócie startu, pełna treść doczytywana;
  wariant D (reguły harnessu z `paths:`) odrzucony — może wrócić aneksem po E4.
- Zasada bez sensownego wyzwalacza zostaje w indeksie w pełnym brzmieniu (PLAN §8).
- D-13, D-14 i D-88 bez zmian (PLAN §2, „Czego świadomie nie robimy”).
- E1–E3 zrobione, nie ruszasz: parser aktywnego planu, `start-digest.js` (poza blokiem zasad),
  jedno polecenie rytuału w 11 kopiach, budżet ze skrótu, bramka trybu ciągłego w dwóch krokach
  (`core/process/prompt-mode.js`, `core/prompt/PRZYGOTOWANIE.md`, `PROCEDURA.md`).
- Bez wydania i bez podbicia wersji — wydanie, nowe progi budżetu startu i poprawka instrumentu
  `start-context.js` o lokalne komendy (L-0299) to **E5**. Filtr potwierdzeń trybu ciągłego
  („Tak, zaczynamy”) świadomie odłożony decyzją Łukasza 2026-10-28 — nie należy do E4.

## Stan wyjściowy (co realnie zastajesz po E3)

RelAI 3.6.0 wydany; na `main` niewydane E1–E3 KONTEKST_STARTU. Plugin z marketplace (3.6.0)
nadpisuje kopię `.claude/relai/` w projekcie przy starcie (L-0294) — zachowanie repo mierzysz
w sesji `--plugin-dir` repozytorium z instalacją wyłączoną plikiem `--settings`
(`{"enabledPlugins":{"relai@relai":false}}`). Testy (FAKT po E3): `node --test
core/process/tests/*.test.js` 348/348, `node --test core/panel/tests/*.test.js` 225/225,
`node --test adapters/codex/tests/*.test.js` 24/24, `node core/tools/validate-adapters.js` kod 0
(jedno ostrzeżenie: `security-audit` 22 026 B, sprzed planu).

```
docs/LEKCJE.md                     # 58 634 B; "Zasady aktywne" 29 969 B, 15 pozycji (FAKT)
core/templates/SPEC_LEKCJE.md      # 15 724 B; destylat na gorze, limit 15, start czyta tylko destylat
core/process/start-digest.js       # wypisuje "Zasady aktywne" w pelnym brzmieniu (komentarz l. 10: "indeks to E4")
core/process/session-signals.js    # budzet startu: prog czastkowy zasady 30 KB; rotacja lekcji
core/tools/eval-triggers.js        # ewaluacje: skill wywolany / plik skilla przeczytany; swieze sesje claude -p
core/evals/triggers.json           # 14 pozycji, fixtury relai/obcy
adapters/claude-code/skills/relai-core/SKILL.md  # l. 95, 101, 171: "Zasady aktywne" na starcie i przy lekcji
```

Wyjście skrótu startu na tym repo: **59 377 B** (FAKT, 2026-10-28 po E3), z czego „Zasady aktywne”
ok. 30 KB. Wyjście polecenia ponad ok. 30 tys. znaków model dostaje jako 2 KB podglądu i czyta
plik kawałkami — sesje E2 i ta z E3 gubiły albo czytały osobno „Zasady aktywne” (L-0296).
Po zamianie na indeks ≤ 5 KB skrót spadnie do ok. 34 KB (SZACUNEK z różnicy) — **czy zmieści się
w limicie, nie wiadomo**; to pomiar tego etapu, nie założenie.

**Czego jeszcze nie ma (to jest zakres tego etapu):** aneksu do D-15, indeksu „Zasad aktywnych”
z wyzwalaczami, skrótu wypisującego indeks zamiast pełnej treści, ewaluacji, że model doczytuje
pełną zasadę przy wyzwalaczu i nie doczytuje bez niego, pomiaru, czy skrót mieści się w limicie
wyjścia polecenia.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane dosłownie; numeracja
rejestru):

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
   z kontrolą starego numeru na „następnym wydaniu bez zmiany tego numeru” (L-0287).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254, L-0269, L-0271, L-0277,
   L-0279, L-0282, L-0287)
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
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262, L-0290 — „przeszło testy” ani „to tylko test” nie zwalnia z reguły; `sed`
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
     ekran z bufora z atrybutami, skrypty PowerShell w `%TEMP%` (L-0259); skrypt z `Bypass`
     zapowiadasz człowiekowi przed pierwszym przebiegiem, mod „przed” i „po” stoi w jednej sesji
     jako dwie kopie pod innymi nazwami, instalacja wyłączona `--settings` (L-0283).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265,
   L-0267, L-0268, L-0270, L-0283, L-0290)
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
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)

**Lekcje z E2 i E3, jeszcze poza destylatem** (`docs/LEKCJE.md`): L-0296 — wyjście polecenia ponad
~30 tys. znaków model dostaje jako 2 KB podglądu; pomiar „po” liczy, ile wyjścia trafiło do
kontekstu; L-0297 — przed liczeniem diffu `git ls-files --eol`, `w/crlf` przy `i/lf` normalizujesz
do LF (w E3 Edit zostawił CRLF w `prompt-mode.js`); L-0298 — w worktree pomiarowym `git -C` albo
podpowłoka, nigdy gołe `cd`; L-0299 — `start-context.js` liczy lokalną komendę (`/model`) jako
polecenie człowieka; L-0300 — instrukcja pomiaru dla człowieka zakazuje `/model` i `/config`,
a analiza najpierw wypisuje model każdej sesji; L-0301 — koszt tylko z przebiegów zgodnych
z procedurą.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/KONTEKST_STARTU/E4/`.** Wszystko tymczasowe —
skrypty pomiarowe, fixtury ewaluacji, wyjścia narzędzi, worktree „przed”, wyjścia sesji
`claude -p` — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`,
katalog domowy, klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę
zaczynasz od slugu projektu.

0. **Aneks do D-15** w `docs/DECYZJE.md` — po „tak” Łukasza na brzmienie (sekcja wyżej). Bez tego
   punktu nic dalej.
1. **Indeks w `docs/LEKCJE.md`** — sekcja „Zasady aktywne” zaczyna się indeksem: jedna linia na
   zasadę (numer, tytuł, wyzwalacz — kiedy model ma doczytać pełne brzmienie), całość ≤ 5 KB
   (SZACUNEK z planu, cel 3). Pełne brzmienie 15 zasad zostaje w tym samym pliku, bajt w bajt
   (porównanie przed i po, licznik nagłówków — zasada 5). Zasada bez sensownego wyzwalacza stoi
   w indeksie w pełnym brzmieniu. Kształt nagłówków — tak, by `start-digest.js` i
   `session-signals.js` wycinały indeks maszynowo (zasada 7, 11).
2. **Skrót startu** — `core/process/start-digest.js` wypisuje indeks zamiast pełnej treści,
   z drogowskazem „pełne brzmienie zasady N: `docs/LEKCJE.md`”; test w
   `core/process/tests/start-digest.test.js` (indeks jest, pełnej treści nie ma — z kontrolą
   pozytywną w tym samym przebiegu). Fixtura starego projektu bez indeksu → skrót wypisuje
   dotychczasową sekcję w całości, nic nie zgaduje.
3. **`SPEC_LEKCJE.md`** — struktura z indeksem (miejsce, format linii, limit bajtów, zasada bez
   wyzwalacza), zdania „start czyta wyłącznie destylat” przepisane na indeks; realny przykład na
   końcu (zasada 1). **`SKILL.md` `relai-core`** (Claude Code, Codex z generatora, reguła Cursora)
   — tylko zdania, które mówią, co start czyta i jak dopisać lekcję do destylatu.
4. **Budżet i rotacja** — próg cząstkowy `zasady` w `session-signals.js` i w wierszu `Budżet startu
   sesji` liczy indeks (nowy próg to E5 — tu tylko jednostka i to, co liczy); rotacja lekcji nie
   wycina pełnego brzmienia zasad ani indeksu.
5. **Ewaluacja wyzwalania** — sześć scenariuszy na świeżych sesjach `--plugin-dir` repo: trzy
   z wyzwalaczem (np. zmiana wyglądu modu → zasada 15, wyrażenie regularne w skrypcie → zasada 5,
   próg budżetu → zasada 6) i trzy bez. Miara: pełne brzmienie zasady doczytane (`Read`/`Grep` na
   `docs/LEKCJE.md` przy tej zasadzie) — cel 3/3 i 0/3. Instrument: `eval-triggers.js`
   rozszerzony o miarę odczytu pliku spoza skilla albo własny skrypt w katalogu roboczym — wybór
   i powód do wpisu. Model każdej sesji wypisany z transkryptu przed liczbami (L-0300).
6. **Pomiar skrótu** — rozmiar wyjścia `start-digest.js` na tym repo przed i po (bajty i znaki)
   wobec limitu wyjścia polecenia; świeża sesja „kontynuujemy pracę”: czy wyjście przyszło w
   całości, czy jako podgląd, i ile trafiło do kontekstu (L-0296). Nie mieści się → zatrzymaj się
   i zapytaj (aneks), nie przycinaj po cichu.
7. **Dokumenty:** `docs/ARTEFAKTY.md` (`SPEC_LEKCJE`, skill `relai-core`, reguła Cursora, nowe
   pozycje ewaluacji); `docs/KOMENDY.md` tylko, jeśli zmienia się to, co człowiek widzi. Lekcje
   L-0296–L-0301 i z tego etapu wchodzą do destylatu w nowym kształcie.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_4.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] Aneks do D-15 w `docs/DECYZJE.md` z datą i „tak” Łukasza, zapisany **przed** pierwszą zmianą
      kodu albo rejestru (kolejność widoczna w transkrypcie).
- [ ] `node --test core/process/tests/*.test.js`, `node --test core/panel/tests/*.test.js`,
      `node --test adapters/codex/tests/*.test.js` bez błędów; `node core/tools/validate-adapters.js`
      kod 0; `node adapters/codex/generate-skills.js` kończy się „spojne”.
- [ ] **Obie wersje w jednym przebiegu (zasada 4):** nowe testy skrótu na kodzie z HEAD sprzed
      etapu (worktree w katalogu roboczym, `core.autocrlf=false`) padają, na zmianie przechodzą —
      liczby fail/pass do wpisu.
- [ ] Indeks ≤ 5 KB (FAKT, `wc -c` na wyciętej sekcji); 15 zasad w pełnym brzmieniu nadal
      w `LEKCJE.md` bajt w bajt (porównanie ze stanem sprzed etapu, licznik nagłówków).
- [ ] Ewaluacja: pełna zasada doczytana 3/3 w scenariuszach z wyzwalaczem i 0/3 bez — z modelem
      każdej sesji i listą narzędzi z `init`; wynik niższy → zatrzymanie i pytanie, nie powtórka
      do skutku (zasada 1, L-0271).
- [ ] Skrót startu: bajty i znaki przed i po; świeża sesja dostaje go w całości albo rozjazd jest
      opisany i rozstrzygnięty z Łukaszem.
- [ ] Dowód negatywny: `git diff --stat` od początku etapu nie pokazuje zmian w
      `core/process/prompt-mode.js`, `core/prompt/` ani w kopiach rytuału startu poza zdaniami
      o „Zasadach aktywnych”.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md`
      zaktualizowany.
- [ ] Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (worktree „przed”, jeśli
      powstał poza nim, foldery fixtur w `%TEMP%`, transkrypty sesji ewaluacji) wypisane z nazwy
      razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/KONTEKST_STARTU/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU, linia
   „E4 rozpoczęty” w dzienniku wdrożenia zastąpiona linią wynikową; link do `PROMPT_ETAP_5.md`
   w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E4/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Tabela ryzyk (ryzyko 1 planu), lekcje do `docs/LEKCJE.md`
   i destylat „Zasady aktywne” w nowym kształcie — od tego etapu odświeżasz go normalnie.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   w `STATUS.md`, status `OTWARTA`; dwie otwarte z E3 (zamrożenie bramek, domyślny model) —
   status bez zmian, chyba że Łukasz je rozstrzygnął.
4. `docs/STATE.md` — „Nad czym pracujemy teraz” z E4 zamkniętym, „Liczby” z rozmiarem skrótu
   i indeksu; linia „Aktywny plan” w `CLAUDE.md` i `AGENTS.md` identyczna.
5. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie PLAN.html sekcje 2, 6 i 9 (E5 —
   pomiar końcowy na trzech sesjach i w projekcie użytkownika, nowe progi budżetu startu jako
   decyzja Łukasza, `KOMENDY.md` i README, wydanie frazą „gotowi do wydania?”), realnego stanu po
   tym etapie, lekcji z tego etapu i L-0299 (poprawka `start-context.js` przed pomiarem).
6. Commit — propozycja, conventional message po angielsku.
