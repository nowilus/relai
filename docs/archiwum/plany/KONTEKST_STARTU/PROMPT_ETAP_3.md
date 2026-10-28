# PROMPT_ETAP_3 — Bramka trybu ciągłego w dwóch krokach

Plan: KONTEKST_STARTU • Etap: **E3 z E5** • Wygenerowano: 2026-10-28 (autor: Opus 5.5, w rytuale „Na koniec” E2) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (plan nie podaje wyższego; trudność etapu leży w stanach bramki i pomiarze na żywo,
> nie w algorytmie).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu; rytuał startu to od E2 `node .claude/relai/tools/start-digest.js` |
| `docs/plany/KONTEKST_STARTU/PLAN.html` | sekcje 2 (cel bramki), 5 (akapit „Tryb ciągły”), 6 (wiersz E3), 7 (ryzyko 5), 8 (przypadki „Zgoda globalna”, „Odpowiedź »nie«”, „Cursor i Codex”), 9 (zamrożenie bramek) |
| `docs/plany/KONTEKST_STARTU/STATUS.md` | Aneksy A i B, dziennik wdrożenia |
| `docs/DZIENNIK.md` | wyłącznie wpis „2026-10-28 — KONTEKST_STARTU E2” — metoda pomiaru parą sesji `claude -p` i L-0296 |
| `adapters/claude-code/hooks/prompt-mode.js` | hook `UserPromptSubmit`: stan bramki, `regulaBramki` z opcją `pytajOModel` |
| `core/process/prompt-mode.js` | `stanBramki`, `zgodaSesji`, `zgodaGlobalna`, `regulaBramki`, `regula`, `modelOptymalizatoraNaStale`, `pomija` |
| `core/process/tests/prompt-mode.test.js` | 18 testów stanu bramki i filtra — punkt wyjścia dla testów stanów |
| `adapters/claude-code/commands/relai-prompt.md` | Krok 1 (model, zasięg, delegacja), sekcja „Tryb ciągły” — to dzielisz |
| `adapters/claude-code/agents/relai-prompt-optimizer.md` | agent, który po „tak” ma przejąć procedurę |
| `adapters/codex/generate-skills.js` | l. 59–63: każdy `.md` w `commands/` to komenda, oczekiwane dokładnie 16 |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant C planu (PLAN.html §4): bramka trybu ciągłego pyta **najpierw tylko o zgodę**; po „nie”
  nie ma kolejnych pytań ani odczytu procedury; po „tak” pada **drugie okno** z modelem i
  zasięgiem, pomijane przy zapisanym `· nie pytaj` (PLAN §5, §8).
- Zapis zgody bez zmian: plik na sesję `.claude/relai/zgoda-promptu/<id>.json`, zgoda trwała
  wierszem `Zgoda na optymalizator` w `~/.claude/relai/USTAWIENIA.md` (od 2.3.0; L-0189 — plik na
  zapisującego).
- Procedurę optymalizatora po „tak” czyta **agent** `relai-prompt-optimizer`, nie sesja (PLAN §5);
  `relai-prompt.md` dzieli się na rdzeń i pliki doczytywane.
- Tryb ciągły istnieje tylko w Claude Code; w Cursorze i Codeksie bramka bez zmian (PLAN §8).
- E2 (zrobione, nie ruszasz): skrót startu `start-digest.js`, jedno polecenie rytuału w 11 kopiach,
  budżet ze skrótu, po kompakcji samo przypomnienie.
- Bez wydania i bez podbicia wersji — wydanie to E5.
- **Granica zakresu:** „Zasady aktywne” jako indeks, aneks do D-15 i rozmiar skrótu ponad limitem
  wyjścia polecenia (L-0296) to E4; nowe progi budżetu i wydanie to E5. Zamrożenie bramek jako
  decyzji (sprawa z „Czeka na człowieka” z 2026-09-15) rozstrzyga **Łukasz** przy zamknięciu E3 —
  przygotowujesz brzmienie, nie zapisujesz decyzji w `DECYZJE.md` bez jego „tak”.

## Stan wyjściowy (co realnie zastajesz po E2)

RelAI 3.6.0 jest wydany; na `main` są niewydane E1 i E2 KONTEKST_STARTU. Plugin z marketplace
(3.6.0) **nadpisuje kopię `.claude/relai/` w projekcie przy starcie i przy wywołaniu skilla**
(L-0294) — zachowanie repo mierzysz w sesji z `--plugin-dir` repozytorium i instalacją wyłączoną
`--settings '{"enabledPlugins":{"relai@relai":false}}'` (w `init` `relai@inline`). Testy:
`node --test core/process/tests/*.test.js` (340/340 po E2 `FAKT`), `node --test
core/panel/tests/*.test.js` (225/225 `FAKT`), `node core/tools/validate-adapters.js` (kod 0;
ostrzeżenie: `relai-prompt.md` 30 115 B ponad 20 480 B `FAKT`).

```
adapters/claude-code/hooks/prompt-mode.js        # 3 758 B: cisza / regula() / regulaBramki(sesja, {pytajOModel, listaModeli})
core/process/prompt-mode.js                      # 16 732 B: stanBramki -> 'cisza' | 'pytaj' | (regula); pomija(): komendy, frazy sesji, potwierdzenia, pytania
core/process/tests/prompt-mode.test.js           # 18 testów
adapters/claude-code/commands/relai-prompt.md    # 30 115 B, Kroki 0a-11 + "Tryb ciągły" + "Zakazy" + "Dawniej"
adapters/claude-code/agents/relai-prompt-optimizer.md  # 7 704 B, czyta .claude/relai/prompt/REGULY.md i SZABLONY.md
core/prompt/REGULY.md, SZABLONY.md, rodziny/     # 17 017 B i 9 427 B; kopiowane do .claude/relai/prompt/ przy starcie
adapters/codex/generate-skills.js                # komendy -> skille Codeksa; nowy .md w commands/ = 17. komenda = błąd
```

**Dziś bramka zadaje trzy pytania w jednym oknie** (`FAKT`, sesja E2 2026-10-28: zgoda, model
z listy z datą, zasięg), także gdy odpowiedź brzmi „nie”. Przy wyborze „model sesji” sesja czyta
`relai-prompt.md`, `SZABLONY.md`, nakładkę rodziny i rejestry — ok. +26,7 tys. tokenów (`FAKT`,
ANALIZA §3).

**Czego jeszcze nie ma (to jest zakres tego etapu):** bramki dwuetapowej (zgoda → model
i zasięg), delegacji procedury do agenta po „tak” jako ścieżki domyślnej trybu ciągłego,
podziału `relai-prompt.md` na rdzeń i pliki doczytywane, testów hooka w stanach „brak zgody”,
„nie”, „tak”, „nie pytaj”, pomiaru na żywo w aplikacji.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane dosłownie; numeracja
rejestru):

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
      w `git worktree` (L-0264).
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
      każdym kliknięciu zmieniającym stan (L-0289).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245); strona wskazująca zasób
      wydania wdraża się po wydaniu — push tagu, wydanie z zasobami i ich sumy, potem push `main`
      (L-0280).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264, L-0273, L-0280,
    L-0281, L-0284, L-0285, L-0286, L-0288, L-0289, L-0291)

**Lekcje z E2, jeszcze poza destylatem** (`docs/LEKCJE.md`): L-0296 — wyjście polecenia ponad
~30 tys. znaków model dostaje jako 2 KB podglądu, a pomiar „po” liczy, ile wyjścia trafiło do
kontekstu; L-0297 — przed liczeniem diffu i commitem `git ls-files --eol` na zmienionych plikach,
`w/crlf` przy `i/lf` normalizujesz do LF; L-0298 — w worktree pomiarowym podpowłoka `( cd … )`
albo `git -C`, nigdy gołe `cd`.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/KONTEKST_STARTU/E3/`.** Wszystko tymczasowe —
skrypty pomiarowe, fixtury, wyjścia narzędzi, worktree „przed”, wyjścia sesji `claude -p` —
powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy,
klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od
slugu projektu.

1. **Bramka w dwóch krokach** — `core/process/prompt-mode.js` (+ hook
   `adapters/claude-code/hooks/prompt-mode.js`): stan „brak zgody” → jedno pytanie o trzy opcje,
   bez pytań o model i zasięg i bez kazania czytać procedurę. Po „tak” (sesyjne albo globalne) przy
   pierwszym prompcie merytorycznym → drugie okno: model i zasięg, chyba że wiersz `Model
   optymalizatora` ma `· nie pytaj` albo wybór „ta sesja” już padł. „Nie” → cisza do końca sesji.
   Gdzie żyje stan „model już wybrany w tej sesji” — rozstrzygasz z L-0189 (plik na zapisującego,
   atomowo) i opisujesz w nagłówku modułu.
2. **Procedura u agenta** — po „tak” reguła trybu ciągłego każe delegować do
   `relai-prompt-optimizer` z nazwą modelu; sesja nie czyta `relai-prompt.md` w całości.
   „Model sesji” zostaje drogą bez delegacji (Krok 1 komendy).
3. **Podział `relai-prompt.md`** — rdzeń w `adapters/claude-code/commands/relai-prompt.md`, kroki
   wykonywane przez agenta w plikach doczytywanych **poza** `commands/` (np. `core/prompt/`,
   kopiowane do `.claude/relai/prompt/`); generator Codeksa i walidator zielone; skill Codeksa
   `relai-prompt` odtworzony generatorem. Treść reguł bez zmian (przenosiny, nie przepisywanie).
4. **Testy** w `core/process/tests/` — stany hooka: brak zgody, „nie”, „tak” bez modelu, „tak”
   z modelem w sesji, globalne „nie pytaj”, filtr pomijania; każdy „czegoś nie ma” z kontrolą
   pozytywną w tym samym przebiegu (zasada 3).
5. **Pomiar na żywo** — w aplikacji (desktop albo terminal) bramka w każdym stanie z listy, a koszt
   odpowiedzi „nie” i „tak + model sesji” instrumentem `core/tools/start-context.js`, obok liczb
   „przed” (bieżące +26,7 tys.). Warunki każdego stanu ustawiasz mechanizmem, który je tworzy
   (L-0286), a zapis pod `.claude/` mierzysz w transkrypcie (L-0281).
6. **Dokumenty:** `docs/ARTEFAKTY.md` — `/relai-prompt`, agent optymalizatora, nowe pliki
   doczytywane; `SPEC_USTAWIENIA.md` (wiersz `Tryb ciągły` / bramka), jeśli opisuje trzy pytania
   w jednym oknie; `docs/KOMENDY.md` tylko, jeśli zmienia się to, co człowiek widzi; brzmienie
   decyzji o zamrożeniu bramek do „Do zrobienia przez człowieka”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test core/process/tests/*.test.js` i `node --test core/panel/tests/*.test.js` bez
      błędów; `node core/tools/validate-adapters.js` zielony; `node adapters/codex/generate-skills.js`
      kończy się „spojne”.
- [x] **Obie wersje w jednym przebiegu (zasada 4):** nowe testy stanów bramki na kodzie z HEAD
      sprzed etapu (worktree w katalogu roboczym, `core.autocrlf=false`) padają, na zmianie
      przechodzą — liczby fail/pass do wpisu.
- [x] Stan „brak zgody”: wyjście hooka bez pytania o model i zasięg i bez odesłania do
      `relai-prompt.md` (dowód negatywny) — z kontrolą pozytywną: stan „tak” bez wybranego modelu
      daje okno modelu i zasięgu.
- [x] „Nie” i globalne „nie pytaj”: zero pytań w kolejnych promptach tej sesji (test) i zero
      okna modelu przy zapisanym `· nie pytaj` (test z wierszem i bez wiersza w jednym przebiegu).
- [x] `relai-prompt.md` poniżej 20 480 B albo z jawnym powodem, dlaczego nie; kroki przeniesione
      bajt w bajt (porównanie treści przed i po, licznik nagłówków całego pakietu — zasada 5).
- [x] Pomiar na żywo: każdy stan z listy z dowodem z transkryptu (pytania w `AskUserQuestion`,
      plik zgody), koszt „nie” i „tak + model sesji” obok „przed” w dzienniku i w `docs/STATE.md`.
- [x] Dowód negatywny: `git diff --stat` od początku etapu nie pokazuje zmian w
      `core/process/start-digest.js`, kopiach rytuału startu ani w sekcji „Zasady aktywne”
      `docs/LEKCJE.md`.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md`
      zaktualizowany; brzmienie decyzji o zamrożeniu bramek w „Do zrobienia przez człowieka”.
- [x] Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (worktree „przed”, jeśli
      powstał poza nim, transkrypty sesji) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/KONTEKST_STARTU/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, linia
   „E3 rozpoczęty” w dzienniku wdrożenia zastąpiona linią wynikową; link do `PROMPT_ETAP_4.md`
   w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E3/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Tabela ryzyk, jeśli etap ją zmienił; lekcje z etapu do
   `docs/LEKCJE.md` (sekcji „Zasady aktywne” nie odświeżasz — to E4).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu (zamrożenie bramek) → sekcja
   „Bramki manualne” w `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — „Nad czym pracujemy teraz” z E3 zamkniętym, „Liczby” z kosztem bramki;
   linia „Aktywny plan” w `CLAUDE.md` i `AGENTS.md` identyczna.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie PLAN.html sekcje 6 i 9 (E4 — „Zasady
   aktywne” jako indeks, aneks do D-15 przed startem), realnego stanu po tym etapie, lekcji z tego
   etapu i L-0296 (skrót startu ponad limitem wyjścia polecenia — E4 ma go zmieścić i zmierzyć).
6. Commit — propozycja, conventional message po angielsku.
