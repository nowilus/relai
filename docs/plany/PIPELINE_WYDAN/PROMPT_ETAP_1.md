# PROMPT_ETAP_1 — Raport gotowości do wydania: mapa wpływu i release-check.js

Plan: PIPELINE_WYDAN • Etap: **E1 z E5** • Wygenerowano: 2026-10-25 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (etap buduje instrument kontroli — fałszywa zieleń to najgroźniejsze ryzyko planu, W1).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, wiersz planu PIPELINE_WYDAN |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (PW1, PW2) + wpisy z 2026-10-25: „BEZPIECZENSTWO E6” (luki 3.3.0, kontrola L-0161 i jej fałsze instrumentu) i „Plan PIPELINE_WYDAN” (rozstrzygnięcia wywiadu) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne” (przepisana też niżej) |
| `docs/plany/PIPELINE_WYDAN/PLAN.html` | sekcje 3 (stan wyjściowy), 5 (elementy 1–3: mapa, skrypt, kontrole zgodności), 6 (wiersz E1), 7 (W1, W2, S1, N1, N2), 8 (przypadki b1, b2, b4, b7, b8, b9) |
| `docs/zasoby/PIPELINE_WYDAN/BRIEF.md` | tabela „Co pilnuje dziś” i „Luki zmierzone przy 3.3.0” — materiał odbioru |
| `core/tools/validate-adapters.js` | 14 kontroli, styl (komunikaty ASCII, kod wyjścia 0/1/2, „kontrola, która nie znalazła, czego pilnuje, nie sprawdza”) — nowy skrypt woła go, nie kopiuje |
| `site/narzedzia/fakty.mjs`, `site/narzedzia/zbuduj.mjs` | skąd strona bierze komendy i wersje; gdzie budowa wymaga fiszki EN |
| `docs/zasoby/film/README.md` | sekcje „Skąd liczby w kadrze” i „Wierność panelu” — co film pokazuje, a co liczy |
| `docs/ARTEFAKTY.md` | sekcja „Zasady prowadzenia” — kształt wpisu i nagłówki grup z liczbą artefaktów |
| `docs/PULAPKI.md` | P-005 (wersja z cache, nie z CLI), P-024 (`claude` na PATH starszy) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant **A**: deklaratywna mapa wpływu + skrypt kontroli + komenda prowadząca + `pre-push`
  (PLAN, sekcja 4; wywiad 2026-10-25).
- Pipeline dotyczy **wyłącznie tego repozytorium**; nic nie zmienia komend ani hooków użytkowników
  RelAI (wywiad, pytanie „Zasięg”).
- **Wszystko lokalnie, bez nowego workflow CI**; `strona.yml` bez zmian (wywiad, pytanie „CI”).
- Mapa wpływu = **tabela w repo + typ zmiany wykrywany z diffu od tagu**; plik z diffu bez wiersza
  mapy = czerwień „nieznany typ zmiany” (fail-closed, PLAN W2).
- Mody mają **własne numery**; bazą modu jest commit, w którym jego `plugin.json` dostał bieżący
  numer, bo część modów wyszła pod tagiem innego modu (`relai-cache-keeper` 0.12.0 i
  `relai-progress` 0.6.1 pod `relai-panel-v0.21.0`) (PLAN N2).
- Film: kontrola reaguje tylko na kategorię „co film pokazuje” (komendy, zakładki panelu, paski,
  narzędzia); liczniki zmienne (testy, zamknięte plany, numer wersji) **nie** wyzwalają czerwieni
  (PLAN, przypadek b4). Forma liczników w finale to decyzja człowieka przed E4 — nie rozstrzygasz
  jej tutaj.
- Strona: fakty z `fakty.json` + kontrola, że każda komenda, hook i mod ma miejsce w treści PL
  i EN; proza poza listami bez kontroli (wywiad, pytanie „Strona”).
- Źródłem prawdy o specyfikacjach w tym repo jest `core/templates/`, nie kopia w `.claude/` (D-87).
- **Granica zakresu:** E1 jest **tylko do odczytu** — skrypt niczego nie naprawia ani nie podbija.
  Komenda `/relai-release`, fraza i naprawy to **E2**; hook `pre-push`, podpowiedź na starcie
  sesji i weryfikacja na żywo — **E3**; rekwizyty, render i testy filmu — **E4**. Pliki filmu,
  strony, README i rejestru w tym etapie **czytasz**, nie zmieniasz (wyjątek: wiersz w
  `ARTEFAKTY.md` nie dotyczy — skrypt jest nośnikiem, nie artefaktem).

## Stan wyjściowy (co realnie zastajesz)

RelAI **3.3.0** wydany 2026-10-25 (tag `v3.3.0`), mody: `relai-panel` 0.21.2 (tag
`relai-panel-v0.21.2`), `relai-progress` 0.6.1, `relai-cache-keeper` 0.12.0, `relai-mods` 0.1.2
(tag `relai-mods-v0.1.2`). Plugin zainstalowany na stałe (scope `user`). Testy: `node --test
core/process/tests/*.test.js` (wzorcem plików, nie katalogiem — L-0212), `core/panel/tests/*.test.js`,
`adapters/codex/tests/*.test.js`, `node --test "site/**/*.test.mjs"`, testy filmu
`node --test docs/zasoby/film/zrodla/testy/*.test.mjs` (29/36 — 7 czerwonych zastanych, odnoga
FILM_TESTY_V3 wchłonięta przez E4). `claude plugin test <katalog>` wyłącznie binarką aplikacji
(P-024). W repo **nie ma CI poza `strona.yml`** i **nie ma `pre-push`**; pre-commit (skan sekretów)
leży lokalnie w `.git/hooks/` bez `core.hooksPath`.

```
core/tools/validate-adapters.js        # 14 kontroli spójności, kod 0/1/2, komunikaty ASCII
core/tools/rotate.js, count-rules.js   # wzór narzędzi z fazą planu i sprawdzenia
core/process/tests/rotate.test.js      # wzór testu narzędzia z core/tools (osobnego katalogu testów tools nie ma)
core/MANIFEST.json                     # deklaracje rdzenia czytane przez walidator
.claude-plugin/plugin.json, marketplace.json   # relai + wpisy czterech modów
panel/ progress/ cache-keeper/ mods/   # mody, każdy z .claude-plugin/plugin.json
adapters/claude-code/commands/         # 16 komend (źródło dla Codeksa, panelu, strony)
adapters/claude-code/hooks/hooks.json  # 13 hooków
adapters/claude-code/skills/relai-core/history.md   # wpis na każdą wersję
adapters/claude-code/MODELE.md         # lista modeli pluginu (2026-09-24) — starsza niż kopia projektu (2026-10-08)
core/panel/commands.mjs                # FORMS / NAMES komend panelu
README.md                              # baner wersji, liczby komend i hooków w prozie, tabela hooków (sekcja „Co pilnuje tylko Claude Code”), tabela modów
docs/KOMENDY.md                        # ściąga z nagłówkiem wersji
docs/ARTEFAKTY.md                      # rejestr wersji artefaktów (nagłówki grup z liczbą)
site/narzedzia/fakty.mjs → site/dane/fakty.json   # liczbaKomend, adaptery, wersje, komendy (bez liczby hooków)
site/tresc/pl.json, en.json            # treść strony; film.fiszki per komenda (brak = przerwana budowa)
docs/zasoby/film/zrodla/src/dane/manifest.json    # fakty filmu z dnia 3.0.0
docs/zasoby/film/zrodla/src/komendy.ts            # CYKL — kolejność 14 komend sceny
docs/zasoby/film/zrodla/src/sceny/komendy/        # 15 plików rekwizytów (bez /relai-humanize i /relai-security)
docs/zasoby/film/zrodla/skrypty/manifest.mjs      # generator faktów filmu (uruchamia testy rdzenia, 35–45 s)
```

Materiał odbioru (FAKT): commit `53830cc` (bezpośredni rodzic `a1439b9` — commitu wydania 3.3.0) to drzewo
**sprzed poprawek E6**: README z 11 wierszami hooków przy 13, `ARTEFAKTY.md` bez trzech wpisów
(`new-project.md` v10, `history.md` v8, README Codeksa v3), `site/tresc/en.json` bez fiszki
`relai-security`. Baza tego drzewa to tag `v3.2.0`. Commit `a1439b9` ma wszystkie trzy poprawki.

**Czego jeszcze nie ma (to jest zakres tego etapu):** mapy wpływu, skryptu `release-check.js`,
kontroli zgodności README / `history.md` / `ARTEFAKTY.md` / treści strony / faktów filmu /
`MODELE.md` / starego numeru wersji, wykrywania baz tagów modów i raportu gotowości.

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
   punktu, nie dopasowaniem kodu (L-0254).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212, L-0254)
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
     1,00 : 1 na całej linii to najpierw instrument (L-0213); wzorzec polskiego słowa bierze rdzeń
     sprzed oboczności (`piętna[sś]`) i ma kontrolę na każdej formie z repo (L-0261).
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
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262, L-0265)
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

> **Katalog roboczy tego etapu: `.claude/relai/work/PIPELINE_WYDAN/E1/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Mapa wpływu — `core/tools/release-map.json`** (nazwa robocza z planu; inna → uzasadnij we
   wpisie). Wiersz = typ zmiany: wzorzec ścieżek wykrywający go w diffie, komponenty do ruszenia,
   identyfikator kontroli, która to sprawdza, oraz klasa „bez wydania” (np. `docs/` poza
   `core/templates/`, plany, dziennik) i lista ścieżek historycznych dla kontroli starego numeru.
   Typy minimum: nowa / usunięta / przemianowana komenda, hook, skill, mod; zmiana kodu modu;
   zmiana zakładek panelu (`TABS`), pasków, `core/panel/`; zmiana specyfikacji; zmiana strony;
   zmiana filmu; zmiana adaptera Codeksa i Cursora; zmiana listy modeli. Każdy plik śledzony
   w repo musi trafiać w dokładnie jeden wiersz — kontrola tego jest częścią skryptu.
2. **Skrypt — `core/tools/release-check.js`** (CommonJS jak walidator, Node bez zależności,
   komunikaty ASCII): (a) ustala bazę rdzenia (ostatni tag `v*` osiągalny z `HEAD`) i bazę każdego
   modu (commit, w którym jego `plugin.json` dostał bieżący numer; własny tag `relai-<mod>-v<numer>`,
   jeśli istnieje); brak bazy → kod 2 z nazwą bazy, której brak (przypadek b7); (b) klasyfikuje
   `git diff --name-status <baza>..<rewizja>` wg mapy — plik bez wiersza = czerwień „nieznany typ
   zmiany”; (c) wywołuje kontrole z punktu 3; (d) raport tekstowy po polsku bez diakrytyków
   i `--json`; przy każdej kontroli licznik „sprawdzono N” — zero przy niepustym zbiorze = błąd;
   kod wyjścia 0 / 1 / 2 jak walidator. Flaga `--rev <commit>` liczy wszystko na drzewie wskazanej
   rewizji przez `git worktree` w katalogu tymczasowym ze slugiem `relai-` (sprzątany po przebiegu;
   L-0151, L-0186) — tak powstaje dowód na `53830cc`. Ciężkie zestawy (testy rdzenia, budowa
   i testy strony, testy filmu, `claude plugin test`) tylko, gdy diff dotyka ich obszaru, z czasem
   przebiegu w raporcie; flaga `--szybko` pomija je jawnie (raport mówi, co pominięto).
3. **Kontrole zgodności** (w skrypcie albo w module obok, np. `core/tools/release-checks.js`):
   - walidator (`validate-adapters.js`), `generate-skills.js --verify`, `sync-panel-core.js --check` —
     wywołane, wynik przeniesiony do raportu;
   - **README**: liczba komend i hooków w prozie i liczba wierszy tabeli hooków = liczba w repo
     (`commands/`, `hooks.json`); każdy mod z marketplace ma wiersz z bieżącym numerem;
   - **`history.md`**: wpis wersji, która będzie wydawana (wersja z `plugin.json`, gdy różna od
     bazy) albo — dla rewizji już wydanej — wpis jej wersji;
   - **`ARTEFAKTY.md`**: L-0161 jako kod — każdy plik z rejestru zmieniony od bazy ma wpis nowszy
     niż baza; trzy fałsze instrumentu z E6 (kopia Cloudflare datowana commitem upstreamu, wiersze
     STYL/DESIGN dopisane po tagu) rozstrzygnij regułą, nie wyjątkiem z nazwy;
   - **strona**: każda komenda ma fiszkę `film.fiszki` w PL i EN; każda komenda, hook i mod ma
     miejsce w treści PL i EN — najpierw ustal na `site/tresc/*.json` i szablonach, gdzie takie
     listy realnie są, i zapisz to w mapie (miejsca bez listy nie wymyślasz — zdanie do wpisu);
   - **film**: fakty kategorii „co film pokazuje” (komendy z `CYKL`/`FORMS`, zakładki, paski,
     narzędzia) z `src/dane/*.json` równe repo; liczniki pominięte jawnie (lista w raporcie);
     plik rekwizytu na każdą komendę z `CYKL`;
   - **`MODELE.md`** pluginu nie starszy (`list-date`) niż `.claude/relai/MODELE-claude-code.md`,
     gdy kopia projektu istnieje (brak kopii → informacja, nie błąd);
   - **stary numer**: wystąpienia numeru bazy poza ścieżkami historycznymi z mapy → lista do
     rozstrzygnięcia (ostrzeżenie w E1; czerwień dopiero, gdy wydawany numer różni się od bazy).
4. **Testy — `core/process/tests/release-check.test.js`** (wzorem `rotate.test.js`): na fixturach
   w katalogu tymczasowym (repo git z tagiem), dla każdej kontroli przypadek zielony i czerwony na
   podłożonym defekcie (wiersz hooka usunięty z README, artefakt zmieniony bez wpisu, brak fiszki EN,
   komenda bez rekwizytu, plik bez wiersza mapy, brak bazy → kod 2, `MODELE.md` starszy). Każdy test
   „czegoś nie ma” wywraca mutacja pisana dla niego (zasada 3).
5. **Dowód na historii** (sekcja „Zweryfikowane” wpisu): `--rev 53830cc` → czerwone 3/3 luki z 3.3.0
   (README 11/13, `ARTEFAKTY.md` 3 wpisy, fiszka EN); `--rev a1439b9` → te trzy kontrole zielone;
   bieżący `HEAD` → raport z dzisiejszym stanem (oczekiwane m.in.: dług filmu czerwony, `MODELE.md`
   pluginu starszy, mody bez zmian od baz albo ze zmianami — co wyjdzie, to zapisujesz, nie
   poprawiasz).
6. **Dokumenty**: komentarz nagłówkowy skryptu (po co, uruchomienie, kod wyjścia — jak
   w walidatorze); `docs/STATE.md` „Szczegóły techniczne → Wersja i instalacja” — jedno zdanie
   o `release-check.js`. Bez `KOMENDY.md` i `CLAUDE.md` (fraza i komenda to E2).

Elementy łatwe do pominięcia: pliki PANEL_CODEX (`docs/plany/PANEL_CODEX/`,
`adapters/codex/panel/`, `docs/zasoby/PANEL_RELAI/makiety/`) poza każdym commitem; worktree
założone przez `--rev` sprzątnięte (`git worktree list`); żadnej zmiany w README, stronie, filmie,
rejestrze — luki z bieżącego raportu idą do wpisu jako lista dla E2/E4, nie do poprawki.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_1.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node core/tools/release-check.js --rev 53830cc` kończy się kodem 1 i raport nazywa trzy luki:
      README (11 wierszy hooków przy 13), `ARTEFAKTY.md` (`new-project.md`, `history.md`, README
      Codeksa), fiszka EN `relai-security`.
- [x] `node core/tools/release-check.js --rev a1439b9` — te trzy kontrole zielone (dowód negatywny:
      ten sam instrument, ta sama wersja skryptu, dwa drzewa w jednym przebiegu — zasada 4).
- [x] Mapa: każdy plik z `git ls-files` trafia w dokładnie jeden wiersz (licznik w raporcie: N plików,
      0 bez wiersza, 0 w dwóch); kontrola pozytywna — plik w nowym katalogu spoza mapy na fixturze
      daje czerwień „nieznany typ zmiany”.
- [x] Każda kontrola w raporcie ma licznik „sprawdzono N” > 0 na bieżącym repo; podłożony defekt
      każdej kontroli wychodzi w teście (punkt 4 zakresu).
- [x] Bazy modów: raport na `HEAD` podaje bazę każdego z czterech modów; dla `relai-cache-keeper`
      i `relai-progress` to commit z bieżącym numerem w `plugin.json`, nie tag innego modu.
- [x] `node core/tools/release-check.js` na `HEAD` — raport zapisany do wpisu dziennika (zielone,
      czerwone, pominięte, czas przebiegu); czerwień zastana opisana, nie poprawiona.
- [x] Testy zielone: `node --test core/process/tests/*.test.js` (liczba przed i po),
      `node --test core/panel/tests/*.test.js`, `node --test adapters/codex/tests/*.test.js`;
      `node core/tools/validate-adapters.js` → „spojne”.
- [x] Brak zmian poza zakresem: `git status --short` pokazuje wyłącznie mapę, skrypt (moduł
      kontroli), test, `STATE.md`, `DZIENNIK.md`, `STATUS.md`, `PROMPT_ETAP_1.md` i
      `PROMPT_ETAP_2.md`; `git diff --stat` na `README.md`, `site/`, `docs/zasoby/film/`,
      `docs/ARTEFAKTY.md` i ścieżkach PANEL_CODEX — pusty.
- [x] `git worktree list` po przebiegach nie zawiera worktree założonych przez skrypt.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (<model>) + Lukasz`;
      `docs/STATE.md` nadpisany.
- [x] Katalog roboczy `.claude/relai/work/PIPELINE_WYDAN/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika. Artefakty spoza katalogu (worktree w `%TEMP%` ze slugiem `relai-`, repo
      fixtur testów) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. `docs/plany/PIPELINE_WYDAN/STATUS.md`: E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO STARTU`,
   linia „E1 rozpoczęty” zastąpiona linią wynikową; link do `PROMPT_ETAP_2.md` w kolumnie `Prompt`
   po kroku 5.
1a. Katalog roboczy `.claude/relai/work/PIPELINE_WYDAN/E1/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, worktree i fixtury spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (<model>) + Lukasz`. Tabela ryzyk: PW1 i PW2 z wynikiem E1. Lekcje z etapu do
   `docs/LEKCJE.md`, odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — zdanie o `release-check.js` i wynik raportu na `HEAD`; pozostałe dokumenty,
   których dotknął etap.
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`core/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 5 (elementy 4 i 6:
   komenda, fraza, uprawnienia automatu) i sekcja 6 (wiersz E2), realnego stanu po tym etapie
   (format raportu JSON, nazwy kontroli, lista luk z bieżącego `HEAD`) i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat(release): add release
   readiness report and impact map (PIPELINE_WYDAN E1)`).
