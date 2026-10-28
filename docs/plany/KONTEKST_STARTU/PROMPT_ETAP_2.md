# PROMPT_ETAP_2 — Skrót startu jednym poleceniem

Plan: KONTEKST_STARTU • Etap: **E2 z E5** • Wygenerowano: 2026-10-28 (autor: Opus 5.5, w rytuale „Na koniec” E1) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (plan nie podaje wyższego; trudność etapu leży w porównaniu dwóch akapitów i trzech
> kopii rytuału, nie w algorytmie).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | sekcja „Rytuał startu sesji” (pozycje 1–7) — to jest lista, którą zastępuje jedno polecenie |
| `docs/plany/KONTEKST_STARTU/PLAN.html` | sekcje 5 (rozwiązanie: skrót startu), 6 (wiersz E2), 7 (ryzyka 2, 3, 4, 7), 8 (przypadki brzegowe) |
| `docs/plany/KONTEKST_STARTU/STATUS.md` | Aneks A (rotacja ryzyk tylko przy zamkniętych) i dziennik wdrożenia |
| `docs/DZIENNIK.md` | wyłącznie wpis „2026-10-28 — KONTEKST_STARTU E1” — pomiar „przed” i definicja końca tury |
| `adapters/claude-code/hooks/session-context.js` | ok. l. 198–202 — zdanie rytuału z listą plików (druga kopia) |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Stan PROJEKT RELAI — rytuał startu sesji”, tabela „Kolejność czytania” (trzecia kopia) |
| `core/process/session-signals.js` | `liniaAktywnegoPlanu` (po E1), `startCost` i `startCostReport` (budżet), `NARZEDZIA` i `provisionTools` (kopia narzędzia do projektu), `wytnijSekcje`, `ostatniWpis` |
| `core/templates/SPEC_CLAUDE_MD.md` | sekcja „Rytuał startu sesji” (ok. l. 85 i 253) — szablon, z którego powstaje `CLAUDE.md` projektów |
| `adapters/codex/skills/relai-core/SKILL.md`, `AGENTS.md`, `adapters/cursor/rules/relai-core.mdc`, `adapters/cursor/hooks/session-context.js`, `adapters/codex/hooks/session-context.js` | kopie rytuału w Codeksie i Cursorze (parytet, ryzyko 4) |
| `core/tools/start-context.js` | instrument z E1 — tym samym liczysz „po” |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant C planu: skrót startu, indeks zasad, bramka w dwóch krokach (PLAN.html §4); cel RelAI
  najwyżej 25 tys. tokenów po pierwszej turze (§9, decyzja Łukasza przy akceptacji 2026-10-28).
- **Skrót startu** to narzędzie `start-digest.js` w rdzeniu (`core/tools/` albo `core/process/` —
  rozstrzygasz według tego, czy idzie do projektu przez `NARZEDZIA`) i jego kopia w projekcie
  `.claude/relai/tools/start-digest.js`. Wypisuje (PLAN.html §5): z `STATE.md` sekcje „Gdzie
  jesteśmy”, „Nad czym pracujemy teraz”, „Co blokuje” i pierwszy punkt „Co dalej”; tabelę ryzyk
  **bez kolumny „Mitygacja”**; ostatni wpis dziennika; aktywne wiersze `USTAWIENIA.md` (bez
  sekcji „Ustawienia wycofane”); `STATUS.md` planu **naprawdę aktywnego** (parser z E1); „Zasady
  aktywne” — w E2 **w pełnym brzmieniu**, indeks to E4. Sekcję „Czeka na człowieka” dokłada
  tylko przy sprawie przeterminowanej. Kończy listą drogowskazów do pełnych sekcji.
- **Jedno polecenie zamiast trzech list:** `CLAUDE.md` (i `AGENTS.md` jako kopia ze strażnikiem),
  hook `session-context` i `SKILL.md` skilla `relai-core` mówią to samo jednym zdaniem:
  uruchom `node .claude/relai/tools/start-digest.js`. `CLAUDE.md` nie jest czytany drugi raz —
  harness ładuje go sam (PLAN.html §5).
- **Budżet startu** liczy rozmiar skrótu, nie plików (PLAN.html §5). Progi zostają bez zmian do E5.
- **Przypadki brzegowe** (PLAN.html §8): po kompakcji hook przypomina polecenie, nie treść;
  „kontynuujemy pracę” uruchamia skrót ponownie; brak sekcji STATE → linia „brak sekcji …”
  z nazwą; folder bez RelAI i tryb gościa bez zmian.
- **E1 (zrobione, nie ruszasz):** linia „Aktywny plan: brak …” z linkiem = brak planu; propozycja
  rotacji tylko przy części rotowalnej > 0 i Aneks A; nakładki `rodziny/nakladka-<family>.md`;
  instrument `start-context.js` — koniec 1. tury = wejście + wyjście ostatniego wywołania (L-0295).
- Bez wydania i bez podbicia wersji — wydanie to E5. Zmiana zostaje w repo.
- **Granica zakresu:** bramka trybu ciągłego (hooki `prompt-mode*`, `core/process/prompt-mode.js`,
  podział `relai-prompt.md`) to E3; indeks „Zasad aktywnych”, aneks do D-15 i destylat to E4;
  nowe progi budżetu i wydanie to E5. Poza planem: zbędna kopia
  `adapters/claude-code/hooks/.claude/relai/`, czas hooka startu (24,5 s), rozmiar promptów
  etapowych — najwyżej do „Świadomie odłożone”.

## Stan wyjściowy (co realnie zastajesz po E1)

RelAI 3.6.0 jest wydany (tag `v3.6.0`); na `main` po E1 są niewydane: parser „Aktywny plan”,
propozycja rotacji z zyskiem, nakładki `nakladka-*`, instrument `core/tools/start-context.js`
(plus wcześniejsze: poprawka `installPath`, przyciski `relai-progress`). Plugin jest zainstalowany
z marketplace (3.6.0) i **nadpisuje kopię `.claude/relai/` w projekcie przy każdym starcie
i wywołaniu skilla** (L-0294) — zachowanie repo mierzysz w sesji `claude -p` z `--plugin-dir`
repozytorium i instalacją wyłączoną przez
`--settings '{"enabledPlugins":{"relai@relai":false}}'` (w `init` musi stać `relai@inline`
ze ścieżką repo). Testy: `node --test core/process/tests/*.test.js` (329/329 po E1 `FAKT`),
`node --test core/panel/tests/*.test.js` (225/225 `FAKT`), `node core/tools/validate-adapters.js`.

```
CLAUDE.md, AGENTS.md                         # „Rytuał startu sesji”: lista 7 pozycji; AGENTS.md = kopia ze strażnikiem
adapters/claude-code/hooks/session-context.js # zdanie rytuału z listą plików (ok. l. 198); siatki, budżet, provisionTemplates
adapters/claude-code/skills/relai-core/SKILL.md # tabela „Kolejność czytania” (6 pozycji)
adapters/codex/skills/relai-core/SKILL.md     # ta sama tabela po angielsku
adapters/codex/hooks/session-context.js, adapters/cursor/hooks/session-context.js, adapters/cursor/rules/relai-core.mdc
core/process/session-signals.js               # startCost (pozycje CLAUDE/STATE/ryzyka/zasady/ustawienia/status/skill/rytual), NARZEDZIA
core/templates/SPEC_CLAUDE_MD.md              # szablon sekcji „Rytuał startu sesji” dla projektów
core/tools/start-context.js                   # instrument kontekstu pierwszej tury (E1)
```

**Pomiar „przed”** (`FAKT`, wpis E1, tokeny, pierwsze wywołanie → koniec 1. tury): `730b6571`
81 946 → 173 910; `03576d50` 87 337 → 141 453; `ee1beb6e` 89 943 → 198 710. Warstwa startowa
liczona budżetem: 88 718 B bez skilla (po E1, to repo `FAKT`), raport hooka 101,6 KB ze skillem.
Plan szacuje skrót na ok. 16 KB zamiast ok. 80 KB (`SZACUNEK`, PLAN.html §6).

**Czego jeszcze nie ma (to jest zakres tego etapu):** narzędzia `start-digest.js` i jego kopii
w projekcie; jednego zdania rytuału w `CLAUDE.md`, `AGENTS.md`, hooku, `SKILL.md`, szablonie
`SPEC_CLAUDE_MD.md` i kopiach Codeksa/Cursora; budżetu liczonego ze skrótu; testu, że każda kopia
wskazuje to samo polecenie; porównania akapitu „gdzie jesteśmy” ze starego rytuału i ze skrótu.

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

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/KONTEKST_STARTU/E2/`.** Wszystko tymczasowe —
skrypty pomiarowe, fixtury, wyjścia narzędzi, worktree „przed”, wyjścia sesji `claude -p` —
powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy,
klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od
slugu projektu.

1. **`start-digest.js`** (rdzeń + wpis w `NARZEDZIA`, kopia `.claude/relai/tools/start-digest.js`)
   — treść z „Decyzji już podjętych”, ASCII w komunikatach własnych (L-0016), treść dokumentów
   w języku projektu. Sekcje szukane kotwicą nagłówka z tolerancją (`## 2.`, `**…**`), brak sekcji
   → „brak sekcji <nazwa>”. Testy w `core/process/tests/` z fixturą projektu bieżącego kształtu
   i fixturą starego projektu (ryzyko 7): brak sekcji, stare nagłówki, CRLF.
2. **Jedno zdanie rytuału** w `CLAUDE.md`, `AGENTS.md`, hooku `session-context.js` (Claude Code,
   Codex, Cursor), `SKILL.md` skilla `relai-core` (oba adaptery), `relai-core.mdc` i szablonie
   `core/templates/SPEC_CLAUDE_MD.md`. Drogowskazy hooka do `debugging.md`, `first-deploy.md`
   i `done-check.md` zostają (zasada 8 — pomiar 0/7 bez nich). Test: każda kopia wskazuje to samo
   polecenie, żadna nie niesie już listy plików (ryzyko 3).
3. **Budżet startu** w `startCost` / `startCostReport` liczy rozmiar wyjścia skrótu (plus skill,
   jeśli adapter go podaje) zamiast plików rytuału; część rotowalna i Aneks A z E1 działają dalej
   na tym samym materiale. `SPEC_USTAWIENIA.md` (wiersz „Budżet startu sesji”) i
   `SPEC_ARCHIWUM.md` mówią, co liczy budżet.
4. **Przypadki brzegowe** w hooku: po kompakcji (`source: compact`) — przypomnienie polecenia, bez
   treści; „kontynuujemy pracę” w `SKILL.md` — skrót uruchamiany ponownie.
5. **Porównanie akapitów (ryzyko 2):** w tym samym stanie repozytorium dwa akapity „gdzie jesteśmy”
   — ze starego rytuału i ze skrótu — porównane punkt po punkcie; każda informacja obecna w starym,
   a brakująca w nowym, ma rozstrzygnięcie (dodana do skrótu albo drogowskaz).
6. **Pomiar „po E2”** instrumentem `start-context.js` na świeżej sesji `claude -p` z
   `--plugin-dir` repozytorium (instalacja wyłączona), w tym repo; liczby obok „przed” do wpisu
   i do `docs/STATE.md` („Liczby”).
7. **Dokumenty:** `docs/ARTEFAKTY.md` — nowe wersje każdego zmienionego artefaktu (szablon
   `SPEC_CLAUDE_MD`, `SPEC_USTAWIENIA`, `SPEC_ARCHIWUM`, skill `relai-core`); `docs/KOMENDY.md`
   tylko jeśli zmienia się to, co mówi fraza „kontynuujemy pracę”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_2.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node --test core/process/tests/*.test.js` i `node --test core/panel/tests/*.test.js` bez
      błędów; `node core/tools/validate-adapters.js` zielony.
- [ ] **Obie wersje w jednym przebiegu (zasada 4):** nowe testy skrótu i budżetu uruchomione na
      kodzie z HEAD sprzed etapu (worktree w katalogu roboczym) padają, na zmianie przechodzą —
      liczby fail/pass do wpisu.
- [ ] Skrót na tym repozytorium wypisuje wszystkie pozycje z „Decyzji” (lista nagłówków wyjścia
      do wpisu), tabela ryzyk bez kolumny „Mitygacja” (dowód negatywny: słowo nagłówka nieobecne;
      kontrola pozytywna: liczba wierszy ryzyk równa tabeli w `DZIENNIK.md`); fixtura starego
      projektu → linie „brak sekcji …”, kod wyjścia 0.
- [ ] Sekcja „Czeka na człowieka” w skrócie tylko przy sprawie przeterminowanej: fixtura ze sprawą
      starszą niż próg → jest; ta sama fixtura z datą świeżą → nie ma (jeden przebieg).
- [ ] Kopie rytuału: test w `core/process/tests/` (albo walidatorze) — `CLAUDE.md`, `AGENTS.md`,
      hooki trzech adapterów, oba `SKILL.md`, `relai-core.mdc` i `SPEC_CLAUDE_MD.md` niosą to samo
      polecenie skrótu; `grep` po dawnej liście („sekcja ryzyk + ostatni wpis”) w tych plikach →
      zero trafień, z kontrolą pozytywną wzorca na HEAD sprzed etapu.
- [ ] Porównanie akapitów „gdzie jesteśmy” (stary rytuał vs skrót) wpisane do dziennika punkt po
      punkcie; zero informacji zgubionej bez rozstrzygnięcia.
- [ ] Pomiar „po E2” na świeżej sesji `claude -p` z `--plugin-dir` (w `init` `relai@inline`):
      pierwsze wywołanie i koniec 1. tury obok liczb „przed” w dzienniku i w `docs/STATE.md`;
      w transkrypcie sesja uruchomiła `start-digest.js` i nie czytała `docs/STATE.md` w całości.
- [ ] Dowód negatywny: `git diff --stat` od początku etapu nie pokazuje zmian w
      `adapters/claude-code/hooks/prompt-mode*`, `core/process/prompt-mode.js`,
      `adapters/claude-code/commands/relai-prompt.md` ani w sekcji „Zasady aktywne” `docs/LEKCJE.md`.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md`
      zaktualizowany.
- [ ] Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (worktree „przed”, jeśli
      powstał poza nim, transkrypty sesji `claude -p`) wypisane z nazwy razem z tym, co się
      z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/KONTEKST_STARTU/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, linia
   „E2 rozpoczęty” w dzienniku wdrożenia zastąpiona linią wynikową; link do `PROMPT_ETAP_3.md`
   w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E2/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Tabela ryzyk, jeśli etap ją zmienił; lekcje z etapu do
   `docs/LEKCJE.md` (sekcji „Zasady aktywne” nie odświeżasz — to E4).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   w `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — sekcja „Liczby” z pomiarem „po E2”, „Nad czym pracujemy teraz” z E2
   zamkniętym; linia „Aktywny plan” w `CLAUDE.md` i `AGENTS.md` identyczna.
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie PLAN.html sekcje 5 i 6 (E3 — bramka
   trybu ciągłego w dwóch krokach), realnego stanu po tym etapie i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku.
