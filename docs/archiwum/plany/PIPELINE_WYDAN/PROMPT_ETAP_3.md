# PROMPT_ETAP_3 — Bramka `pre-push` na tagi wydań, podpowiedź gotowości i weryfikacja po publikacji

Plan: PIPELINE_WYDAN • Etap: **E3 z E5** • Wygenerowano: 2026-10-25 (autor: Opus 5.5, w rytuale „Na koniec” E2) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (hook git, który odrzuca push, i automat porównujący cache z tagiem — fałszywa zieleń
> albo fałszywa czerwień uczy obchodzić bramkę, ryzyka W1, S1, S4 planu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia „Frazy sesji” (fraza „gotowi do wydania?” z E2 — tam dopiszesz podpowiedź) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (PW1, PW2) + wpis „PIPELINE_WYDAN E2” z 2026-10-25 (dogfooding frazy, „Świadomie odłożone”) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne” (przepisana też niżej) |
| `docs/plany/PIPELINE_WYDAN/PLAN.html` | sekcja 5 (elementy 6–8: bramka `pre-push`, podpowiedź, weryfikacja na żywo), 6 (wiersz E3), 7 (S1, S4, N1), 8 (push zwykłego commitu, zmiana tylko w modzie, brak tagu bazowego, Codex/Cursor) |
| `core/tools/release-check.js`, `core/tools/release-checks.js`, `core/tools/release-version.js` | raport, `--rev`, `--wydanie`, propozycje; nowa kontrola „pre-push zainstalowany” idzie do `release-checks.js` |
| `core/guardrails/install-precommit.js`, `core/guardrails/pre-commit.js`, `core/guardrails/tests/install-precommit.test.js` | wzorzec instalatora (przełącznik `sh` + logika `.cjs`, układ 1.9.2) i jego testów |
| `.claude/commands/relai-release.md` | Krok 6 (publikacja) — tu wpinasz automat weryfikacji po publikacji i kartę „ok” |
| `docs/PULAPKI.md` | P-005 (cache po `plugin update`, restart, suma po CRLF → LF), P-024 (binarka aplikacji z `$CLAUDE_CODE_EXECPATH`) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant **A**: mapa wpływu + skrypt kontroli + komenda prowadząca + `pre-push` (PLAN, sekcja 4;
  wywiad 2026-10-25).
- **Bramka `pre-push` dotyczy wyłącznie tagów wydań** — `v*` i `relai-*-v*`; push zwykłego commitu
  na `main` przechodzi bez kontroli (PLAN, sekcja 8). Czerwone = odmowa pushu.
- **Obejście** wyłącznie zmienną środowiska **z powodem**, który hook dopisuje jako linię do
  `docs/DZIENNIK.md` — każde obejście to sygnał do poprawki kontroli (PLAN, S1).
- **Podpowiedź** gotowości to reguła w `CLAUDE.md` tego repo, **nie hook pluginu** — nic nie trafia
  do użytkowników RelAI (PLAN, sekcja 5 pkt 6). Milczy, gdy od tagu zmieniły się wyłącznie pliki
  wierszy `wydanie: brak` (PLAN, sekcja 8) — to rozstrzyga pole `propozycje` raportu (puste = cisza).
- **Raport E1/E2 jest źródłem prawdy:** hook i podpowiedź wołają `release-check.js`, nie liczą
  kontroli od nowa. Zmiana kontroli = zmiana w `release-checks.js` z testem zielonym i czerwonym
  w `core/process/tests/release-check.test.js`.
- Komenda `/relai-release` i fraza „gotowi do wydania?” są z E2 — w E3 tylko dopisujesz krok
  weryfikacji po publikacji i kartę „ok”; reszty komendy nie przebudowujesz.
- Uprawnienia automatu (wywiad): tag, push, wydanie GitHub, marketplace, `plugin update` i profil
  użytkownika — **wyłącznie po „tak”**. Instalacja hooka w `.git/hooks/` tego repo to zmiana
  konfiguracji maszyny → też po „tak”.
- **Granica zakresu:** rekwizyty, slogany, finał, testy i render filmu — **E4** (czerwień
  `film-komendy` i `testy-filmu` zostaje). Pierwsze wydanie przez pipeline i publikacja — **E5**.
  W E3 **nie tagujesz wydania, nie pushujesz i nie publikujesz** niczego: bramkę dowodzisz na
  fixturze z lokalnym zdalnym repo (`git init --bare` w `%TEMP%`), weryfikację po publikacji — na
  wydanym już 3.3.0.

## Stan wyjściowy (co realnie zastajesz po E2)

RelAI **3.3.0** (tag `v3.3.0`), mody `relai-panel` 0.21.2, `relai-progress` 0.6.1,
`relai-cache-keeper` 0.12.0, `relai-mods` 0.1.2 — numery bez zmian w E2. Raport na drzewie
roboczym po E2 (FAKT, pełny przebieg 133 s): propozycja `relai` 3.3.0 → 3.4.0 (minor, z commitu
`feat(release)` E1), czerwone zastane: `film-komendy`, `testy-filmu` (E4), `modele` (`MODELE.md`
pluginu 2026-09-24 starszy niż kopia projektu 2026-10-08 — naprawa po `/relai-models` i „tak”);
`readme-mody` zielona po naprawie bezpiecznej w dogfoodingu E2. Testy:
`node --test core/process/tests/*.test.js` (wzorcem plików — L-0212; 256 po E2), `core/guardrails/tests/*.test.js` (19),
`core/panel/tests/*.test.js` (216), `adapters/codex/tests/*.test.js` (24). Binarka aplikacji
2.1.308 z `$CLAUDE_CODE_EXECPATH`; `claude` na PATH to 2.1.304 (P-024).

```
core/tools/release-check.js        # CLI: bazy, diff, kontrole, zestawy; --rev (worktree %TEMP%/relai-release-check-*),
                                   #   --json, --szybko, --tylko, --wydanie, --mapa, --repo; kod 0/1/2;
                                   #   pole "propozycje" (rdzen + kazdy mod: wersjaBazy, propozycja, poziom, stan, powody)
core/tools/release-version.js      # E2: poziom z conventional commits (feat/! -> minor), podbij(), commity(), propozycja()
core/tools/release-checks.js       # 18 kontroli (E2: "podbicie" - stan propozycji: "do podbicia", "ponizej propozycji",
                                   #   "numer nieczytelny" = ostrzezenie, z --wydanie czerwien; "powyzej propozycji" = ostrzezenie)
core/tools/release-map.json        # 23 wiersze (E2: komenda-projektowa .claude/commands/*.md, wydanie brak);
                                   #   historyczne + regula "**/*.test.*"
core/process/tests/release-check.test.js   # 50 testow; fixtura git z tagiem v1.0.0 i relai-panel-v0.1.0
.claude/commands/relai-release.md  # komenda projektowa (sledzona; reszta .claude/ niesledzona): raport, podzial brakow,
                                   #   jedna zgoda na naprawy bezpieczne, publikacja krok po kroku po "tak"
core/guardrails/install-precommit.js       # instalator pre-commita (wzorzec dla pre-push)
.git/hooks/                        # pre-commit + relai-pre-commit.cjs + relai-secret-scan.cjs; pre-push NIE ISTNIEJE
```

**Czego jeszcze nie ma (to jest zakres tego etapu):** hooka `pre-push` i jego instalatora, trybu
sprawdzenia „wydanie samego modu” (dziś czerwień rdzenia — np. film — zablokowałaby tag
`relai-panel-v*`), kontroli „pre-push zainstalowany i aktualny”, podpowiedzi przy „kontynuujemy
pracę” i przy zamknięciu planu, automatu weryfikacji po publikacji (cache = tag, świeża sesja)
i karty „`/reload-plugins` i rzut oka na panel” przy wydaniu modu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie (przepisane w całości):**

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
   z bazą tego drzewa (L-0269). Instrukcja wołająca narzędzie, którego kod wyjścia „wynik
   negatywny” nie jest awarią, mówi, co znaczy każdy kod i gdzie stoi pełny wynik, i zakazuje
   obejść — powtórki, pliku tymczasowego (L-0271).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254, L-0269, L-0271)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. Komenda do wklejenia przez
   człowieka w czacie: pełna ścieżka, bez zmiennych środowiska, na Windowsie w składni PowerShella
   (L-0266). (L-0002, L-0022, L-0059, L-0266)
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
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195).
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
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215, L-0242, L-0262 — „przeszło testy” nie zwalnia z reguły; `sed`
     tylko do odczytu); ścieżka w powłoce z `/`, także składana ze zmiennych
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
     ekran z bufora z atrybutami, skrypty PowerShell w `%TEMP%` (L-0259).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265,
   L-0267, L-0268, L-0270)
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
9. **Skill nie zakłada dostępu poza katalogiem roboczym**; opis ≤ 1 024 znaki, trzecia osoba, co
   i kiedy, marker projektu i płaska lista fraz, bez `MUST BE USED`; krok sięgający dalej ma
   wyjście po odmowie. (L-0009, L-0010, L-0012, L-0023, L-0114)
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
      zmiennego cwd, test w podfolderze (L-0146); przypadek błędu najpierw na samym narzędziu
      (bez zapisu), kopia plików użytkownika przed pomiarem, który w nich pisze, odpowiedź
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
      liczysz w transkrypcie na dysku, nie w stream-json (L-0263).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255, L-0263, L-0264)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu. Pytanie kalibracyjne nazywa kadr i obszar oceny, a zmianę pokazuje
    z obrysem w otwartym oknie (L-0229). Makieta istniejącego interfejsu zaczyna się od zrzutu
    jego aktualnej wersji (L-0231).
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
      zrzut przez `PrintWindow` z `SetProcessDPIAware` (L-0206); element chwilowy (dymek,
      najechanie) nie zmienia geometrii spoczynku — test wysokości spoczynku obok testu nowego
      zachowania, pełne słowa w natywnym `<title>` (L-0209). Wygląd
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
    - **Scena 3D:** kandydaci zasobów na karcie zgody po miniaturach obok wzorca, cecha wzorca
      widoczna już na miniaturze (L-0216); obiekt za płaszczyzną sprawdzasz kadrem, w którym jest
      największy, i wobec `near`/`far` kamery (L-0217); powtarzalne bryły jako jedna geometria,
      wywołania rysowania mierzone opakowaniem kontekstu (L-0219); uwaga „nie jak wzorzec” — rozbiór
      kadru na światło, materiał, obiektyw i kompozycję z jedną przyczyną i granicą techniki przed
      kolejną rundą (L-0220); urządzenie w scenie budujesz warstwami prawdziwej konstrukcji i przed
      pierwszym zrzutem oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca — nic nie wystaje
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221); cudzy
      generator sceny sprawdzasz pudełkami wypieczonej geometrii obok `Box3.setFromObject` i klasą
      referencyjną biblioteki (L-0225); dystans do wzorca najpierw detal, tekstury i kompozycja,
      technika światła na końcu, a hipotezę „X zrobi różnicę” — tanim testem na jednym kadrze
      z werdyktem człowieka przed etapem (L-0226).
    - **Strona przewijana:** ruch wiązany z każdym ruchem kółka odbierasz człowiekowi jako lekturę.
      Najpierw proponujesz jedną animację na sekcję z resetem poza ekranem (L-0233). Tryb ograniczonego
      ruchu i brak skryptu sprawdzasz wysokością sekcji i tym, co jest za krawędzią, a nie tylko
      widocznością (L-0235). Stan sprzed animacji nie przyciemnia tekstu przezroczystością, bo
      kontrast mierzysz także na pierwszej klatce (L-0236). Każdy nowy powód zejścia do trybu
      przepływu dostaje przebieg z liczeniem elementów za krawędzią sekcji i dialogów. Reguła
      rozmiaru okna obowiązuje tylko w trybie, dla którego powstała (L-0237). Klasa wyjmująca
      element z przepływu wchodzi przed zmianą jego rozmiaru; na telefonie pierwsza asercja to
      `innerWidth` i `scrollWidth` równe emulacji z `mobile: true` (L-0241).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226, L-0233, L-0235, L-0236, L-0237,
    L-0241)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/PIPELINE_WYDAN/E3/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Hook `pre-push`** (np. `core/tools/release-pre-push.js` + przełącznik `sh` jak pre-commit
   1.9.2): czyta ze stdin linie `<lokalny ref> <sha> <zdalny ref> <sha>`; dla `refs/tags/v*`
   i `refs/tags/relai-*-v*` uruchamia `release-check.js --rev <tag> --wydanie` (zestaw kontroli
   właściwy dla komponentu tagu — punkt 2); czerwone → kod ≠ 0 i komunikat ASCII z listą
   czerwonych; inne refy → przepuszcza bez kontroli. Usunięcie tagu (sha zer) → przepuszcza.
2. **Wydanie samego modu** (PLAN, sekcja 8): tag `relai-<mod>-v*` sprawdza kontrole modu, strony
   (`strona-fakty`) i README, bez filmu i bez `podbicie` rdzenia — flaga w `release-check.js`
   (np. `--komponent <nazwa>`), wynik w `--json`. Który zestaw kontroli należy do modu, bierzesz
   z wierszy mapy `mod:<nazwa>` (pole `kontrole`), nie z listy w kodzie.
3. **Obejście**: zmienna środowiska z powodem (np. `RELAI_RELEASE_OBEJSCIE="<powód>"`) — pusty
   powód nie obchodzi; hook dopisuje do `docs/DZIENNIK.md` linię z datą, tagiem, czerwonymi
   kontrolami i powodem (dopisanie do dokumentu — plik pisany przez kod hooka, nie przez powłokę
   sesji; kotwica: koniec sekcji „Wpisy”).
4. **Instalator** (np. `core/tools/install-prepush.js`) — jak `install-precommit.js`: idempotentny,
   nie nadpisuje cudzego `pre-push` bez zgody, raport, co zrobił. Instalacja w tym repo — po „tak”.
5. **Kontrola `pre-push`** w `release-checks.js`: hook zainstalowany w `.git/hooks/` drzewa
   roboczego i równy źródłu (suma po CRLF → LF) → zielona; brak albo inna suma → czerwona tylko
   z `--wydanie`, w trybie zwykłym ostrzeżenie z komendą instalacji (PLAN, S4). Przy `--rev`
   kontrola mówi „pominięta” (hook jest stanem maszyny, nie rewizji).
6. **Podpowiedź** — `CLAUDE.md`, linia „Frazy sesji” (albo zdanie pod nią): przy „kontynuujemy
   pracę” i przy zamknięciu planu jedno zdanie „od v<baza>: N plików w <komponenty>; sprawdzić
   gotowość?” z `release-check.js --json --szybko --tylko podbicie` (pole `propozycje`); puste
   `propozycje` → cisza. Sprawdź koszt przebiegu (czas) i wpisz go do dziennika.
7. **Weryfikacja po publikacji** — skrypt (np. `core/tools/release-verify.js`): cache każdego
   wydanego pluginu (`~/.claude/plugins/cache/relai/<plugin>/<numer>/`) równy drzewu tagu
   (`git ls-tree` tagu, treść po CRLF → LF): liczba plików, rozjazdy, pliki nadmiarowe; świeża
   sesja `claude -p` binarką aplikacji (P-024) z ścieżką cache nowej wersji w `init`. Wpięty w
   Krok 6 `.claude/commands/relai-release.md` (po restarcie) razem z kartą „`/reload-plugins`
   i rzut oka na panel” przy wydaniu modu — wydanie zamknięte dopiero po „ok” człowieka. Karta to
   pytanie komendy, nie zmiana modu `relai-panel` — potrzeba zmiany modu to sygnał odchylenia.
8. **Testy** w `core/process/tests/` (nowy plik albo `release-check.test.js`): fixtura z lokalnym
   `--bare` remote — push tagu przy czerwieni odrzucony, przy zieleni przyjęty, push gałęzi bez
   kontroli, obejście z powodem przechodzi i zostawia linię w dzienniku fixtury, obejście bez
   powodu nie przechodzi; tag modu nie czerwienieje od filmu; kontrola `pre-push` zielona
   i czerwona; weryfikacja cache — zgodny i z podłożonym rozjazdem. Każdy test „czegoś nie ma”
   z mutacją, która go wywraca (zasada 3; mutacje liczone reporterem TAP — L-0270).
9. **Dokumenty**: `docs/KOMENDY.md` (sekcja „Tylko w tym repozytorium” — bramka, obejście,
   instalacja), `docs/ARTEFAKTY.md` (wersja 2 wiersza `/relai-release`), `docs/STATE.md`.

Elementy łatwe do pominięcia: hook działa w każdym narzędziu (Node + git) — także w Codeksie;
pliki PANEL_CODEX poza każdym commitem; komunikaty hooka ASCII (zasada 15); `.git/hooks/` nie jest
śledzony — źródło hooka mieszka w `core/tools/`, a wiersz mapy już je obejmuje (`rdzen-procesu`).

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Fixtura z `--bare` remote: push tagu `v*` przy czerwonej kontroli → odrzucony (kod ≠ 0,
      lista czerwonych w komunikacie); po naprawie ten sam tag → przyjęty; push gałęzi `main` bez
      tagu → przyjęty bez przebiegu skryptu — wszystko w jednym przebiegu testu.
- [x] Obejście: z powodem → push przyjęty i linia w `docs/DZIENNIK.md` fixtury (data, tag,
      czerwone, powód); bez powodu (pusta zmienna) → odrzucony.
- [x] Tag `relai-<mod>-v*` w fixturze z czerwonym filmem → przyjęty; ten sam tag przy czerwonej
      kontroli modu (`readme-mody`) → odrzucony.
- [x] Kontrola `pre-push`: zielona po instalacji, czerwona z `--wydanie` po podłożonej zmianie
      hooka; instalator uruchomiony drugi raz nie zmienia niczego (suma przed = po).
- [x] Weryfikacja po publikacji na wydanym 3.3.0: cache `relai` 3.3.0 wobec tagu `v3.3.0` — liczba
      plików i rozjazdów do dziennika; kontrola pozytywna: kopia cache z podłożoną zmianą jednego
      pliku → rozjazd wykryty i nazwany.
- [x] Podpowiedź: świeża sesja „kontynuujemy pracę” (transkrypt) mówi jedno zdanie o gotowości
      z liczbą z raportu; na fixturze ze zmianą tylko w `docs/` skrypt podpowiedzi milczy.
- [x] Hook zainstalowany w tym repo **po „tak”**; push gałęzi w tym repo **nie pada** w E3 (dowód:
      `git log origin/main..HEAD` przed i po), a `git tag --list 'v3.3.1' 'v3.4.0'` pusty.
- [x] Testy zielone: `node --test core/process/tests/*.test.js` (liczba przed — 256 — i po),
      `node --test core/guardrails/tests/*.test.js`, `node --test core/panel/tests/*.test.js`,
      `node --test adapters/codex/tests/*.test.js`; `node core/tools/validate-adapters.js` →
      „spojne”; `release-check.js --szybko` bez nowych czerwieni poza zastanymi (`film-komendy`,
      `modele` — chyba że Łukasz zgodził się na naprawę).
- [x] Brak zmian poza zakresem: `git diff --stat` na `site/`, `docs/zasoby/film/`, `README.md`
      i ścieżkach PANEL_CODEX (`docs/plany/PANEL_CODEX/`, `adapters/codex/panel/`,
      `docs/zasoby/PANEL_RELAI/makiety/`) — pusty.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (<model>) + Lukasz`;
      `docs/STATE.md` nadpisany.
- [x] Katalog roboczy `.claude/relai/work/PIPELINE_WYDAN/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika. Artefakty spoza katalogu (fixtury i `--bare` remote w `%TEMP%`, worktree
      `%TEMP%/relai-release-check-*`, kopia cache do kontroli pozytywnej) wypisane z nazwy razem
      z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. `docs/plany/PIPELINE_WYDAN/STATUS.md`: E3 → `ZREALIZOWANY <data>`, E4 → `GOTOWY DO STARTU`,
   linia „E3 rozpoczęty” zastąpiona linią wynikową; link do `PROMPT_ETAP_4.md` w kolumnie `Prompt`
   po kroku 5.
1a. Katalog roboczy `.claude/relai/work/PIPELINE_WYDAN/E3/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, fixtury i remote spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (<model>) + Lukasz`. Tabela ryzyk: PW1, PW2 i S4 planu z wynikiem E3. Lekcje
   z etapu do `docs/LEKCJE.md`, odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — bramka `pre-push`, podpowiedź, weryfikacja po publikacji; `docs/KOMENDY.md`,
   `docs/ARTEFAKTY.md` — wiersz `/relai-release` w wersji 2; pozostałe dokumenty, których dotknął etap.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`core/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (wiersz E4), sekcja 8
   (film: liczniki, MP4 jako zasoby wydania, odnoga FILM_TESTY_V3) i sekcja 9 (finał filmu,
   rekwizyty i slogany — decyzje Łukasza przed startem E4), realnego stanu po tym etapie i lekcji
   z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat(release): add pre-push gate
   for release tags and post-release verification (PIPELINE_WYDAN E3)`).
