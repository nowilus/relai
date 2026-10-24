# PROMPT_ETAP_3 — Kokpit na desktopie: wyszukiwarka, filtry, szczegóły i przełącznik w każdym wierszu, jasny i ciemny

Plan: RELAI_MODS • Etap: **E3 z E5** • Wygenerowano: 2026-10-23 (autor: Opus 5.5, w rytuale „Na koniec” etapu E2) • Wykonawca: **Opus (D-85) w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (pierwszy etap, który rysuje kokpit z makiety, przełącza pluginy CLI z kolejką i pilnuje
> budżetu drzewa; błąd w kolejce albo w stanie „załadowanym” psuje pasek zmian).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne” (przepisana też niżej), w tym L-0253 i L-0254 |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (wiersz RM1) + wpisy z 2026-10-23 „RELAI_MODS E1” (świadomie odłożone: binarka CLI) i „RELAI_MODS E2” |
| `docs/plany/RELAI_MODS/PLAN.html` | sekcje 5 („Wygląd”), 6 (wiersz E3), 7 (R1, R4, R7, R8, R9), 8 (przypadki o przełączaniu, kłódkach, pasku zmian i wyglądzie — lista niżej), **10 (Aneks A pkt 2 i 3)** |
| `docs/plany/RELAI_MODS/makieta.html` | zakładka **C · Kokpit ze szczegółami** (`viewC()`): układ, nagłówek, filtry, lista ze szczegółami po prawej, pasek zmian |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | całość przed pierwszą zmianą wyglądu; szczególnie sekcje 2 (kolor z kluczy), 4.3 (wiersz), 6 (układ), 7 (przyciski), 8 (`Svg`), 9 (wydajność), 12 (lista kontrolna) |
| `docs/PULAPKI.md` | P-052 (CLI z moda, plan B przeładowania), P-017 (import tylko z folderu pluginu, `$` tylko w module hooków), P-023 pkt 7 (budżet drzewa), P-024 (`Svg` z `alt`, binarka aplikacji), P-042 i P-044 (kolory z motywu) |
| `core/panel/theme.mjs` | `KEY`, `INK`, `inkCss()`, `RULE` — źródło kolorów i linii gasnącej |
| `panel/hooks/pane-parts.tsx` | `DRAW_LIMIT`, wagi `Svg`, `STACK_BELOW` — wzór liczenia budżetu i jednego układu na panel |
| `mods/hooks/inventory.ts`, `mods/hooks/register.tsx`, `mods/hooks/inventory.test.ts`, `mods/hooks/mods.test.tsx` | stan po E2 — rozbudowujesz, nie piszesz obok |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant **A**: osobny mod `relai-mods` w `mods/` (PLAN, sekcja 4). Panel **nigdy nie pisze** do
  `settings.json` ani `installed_plugins.json` — przełącza wyłącznie CLI `claude plugin
  disable/enable` (BRIEF).
- Stan on/off i hooki z plików scope'u, nie z `$.settings.read()`; tylko polityka przez
  `$.settings.read({ source: 'policy' })` (Aneks A pkt 1, P-052). Model danych z E2 to niesie:
  `state`, `stateFile`, `isPolicy`, `overriddenBy`, `isSelf`, `projectPath`, `notes`.
- `none` (brak wpisu w pliku scope'u) wyświetla się jako „wyłączony”; przełącznik woła `enable`.
- Id do CLI wyłącznie z `installed_plugins.json` (P-052: `enable` przyjmuje każde `x@y` i je
  zapisuje). Binarka: `claude` z PATH (E1). `CLAUDE_CODE_EXECPATH` jest dla moda pusta.
- **Plugin innego projektu jest przełączalny bez kłódki:** CLI z `cwd` = jego `projectPath`,
  z `--scope` jego scope'u. Wiersz ma etykietę „projekt <nazwa folderu>”, a szczegóły mówią, który
  plik w tamtym folderze się zmieni (Aneks A pkt 2). Plugin `project` lub `local` bieżącego folderu
  ma etykietę „projekt”, a szczegóły ostrzegają o zmianie pliku w repo (R9).
- **Przeładowanie to plan B na desktopie:** Przeładuj próbuje `$.command.run({ command:
  'reload-plugins' })` i czyta odpowiedź po tekście. Odmowa („isn't available”) daje komunikat
  „wpisz /reload-plugins” (Aneks A pkt 3, P-052). To już działa w `reloadPlugins()`.
- Kłódka zamiast przełącznika, bez wywołania CLI: polityka („zarządzane przez politykę”),
  nadpisanie wyższą warstwą („nadpisane w <plik>”) i hooki z `settings.json` („tylko podgląd”).
  Wiersz samego kokpitu (`isSelf`) nie ma przełącznika, a szczegóły podają
  `claude plugin disable relai-mods@relai` (sekcja 8).
- Wygląd z kluczy motywu: wiersz wyłączony w `inactive`; etykiety typu `mod` w `claude`, `hook`
  w `suggestion`, `plugin` w `inactive`, „projekt” w `warning`. Fiolet z makiety w jasnym wyglądzie
  nie przechodzi do kodu. Linie między wierszami to `RULE` (linia gasnąca, pierwszy kierunek
  Łukasza dla list). Przełącznik na desktopie to natywny `Button` (`plain`) z `Svg` w środku, tor
  i gałka z obiema paletami przez `inkCss()`; kłódka to inline `Svg` z `alt`, bez emoji (PLAN,
  sekcja 5).
- Jedno wywołanie CLI naraz. Kliknięty wiersz pokazuje „…” i nie przyjmuje kolejnego kliknięcia;
  kliknięcia w inne wiersze ustawiają się w kolejce. Błąd albo przekroczony czas (20 s SZACUNEK;
  E1 zmierzył ~0,7 s) cofa przełącznik do stanu z dysku, a pierwsza linia błędu z kodem stoi pod
  wierszem i w szczegółach. Taka zmiana nie liczy się do paska (sekcja 8).
- Pasek „N zmian czeka na przeładowanie” z Przeładuj pojawia się tylko przy N > 0. N to różnica
  stanu na dysku wobec stanu, który ten czat załadował przy starcie albo przy ostatnim
  przeładowaniu — nie liczba kliknięć. Powrót do stanu wyjściowego zmniejsza N (sekcja 8).
- **Do rozstrzygnięcia na starcie E3 (sygnał odchylenia, jedno pytanie AskUserQuestion, zanim
  napiszesz kod wyglądu):**
  - **Rdzeń motywu w modzie.** Mod importuje tylko z własnego folderu (P-017), a `KEY`, `inkCss()`
    i `RULE` są w `core/panel/theme.mjs`. Plan daje nowy cel kopii `mods/hooks/core` w
    `core/tools/sync-panel-core.js` dopiero w E5. Opcje: aneks B przenoszący sam cel synchronizacji
    do E3 (marketplace i `network-calls.js` zostają w E5) albo lokalne stałe w modzie do E5,
    z testem zgodności z rdzeniem.
  - **Binarka CLI** (odłożone z E1): zostaje `claude` z PATH z wersją CLI w szczegółach (R1),
    czy inna droga.
- **Granica zakresu:**
  - E3 to desktop w szerokim panelu. Gałąź terminala (glify przełącznika, sterowanie przyciskami),
    szczegóły pod listą poniżej progu szerokości, odświeżanie co 5 s i dwa czaty to E4. W E3
    terminal ma się nie wywracać (test istniejący przechodzi), ale nie dostaje własnego wyglądu.
  - Marketplace, `core/tools/network-calls.js`, `docs/KOMENDY.md`, strona, README i wersja to E5.
    `sync-panel-core.js` też, chyba że pytanie wyżej skończy się aneksem B.

## Stan wyjściowy — co realnie zastajesz po E2

`relai-mods` 0.0.1 jest w repo, niewydany i nieobecny w marketplace (FAKT, 2026-10-23). Plugin
`relai` 3.2.0 i trzy mody bez zmian. Walidacja i testy moda idą binarką aplikacji:
`"$CLAUDE_CODE_EXECPATH" plugin validate mods` i `"$CLAUDE_CODE_EXECPATH" plugin test mods` z Basha
sesji (2.1.308, P-052). Na żywo mod ładujesz kopią w `~/.claude/dev-mods/<id sesji>/relai-mods/`
(skill `plugin-authoring`, pytanie „Turn them on” do człowieka). Zrzut okna:
`powershell -NoProfile -ExecutionPolicy Bypass -File docs/zasoby/PANEL_RELAI/narzedzia/okno.ps1 -Out <ścieżka>`
(L-0206; narzędzie computer-use nie obejmuje okna Claude). Ścieżki w Bashu piszesz z `/`
(`/c/Users/...`), bo `$USERPROFILE` ma `\` i nie rozwija globów (L-0230).

```
mods/.claude-plugin/plugin.json   name relai-mods, version 0.0.1, "Early access — …", types
mods/hooks/hooks.json             { "modules": ["./register.tsx"] }
mods/types/index.d.ts             kontrakt $.state: busy (boolean), note (ModsNote = string)
mods/hooks/inventory.ts           czysta logika: Install, PluginItem (kind mod|plugin, state, stateFile,
                                  counts, events, notes, isPolicy, overriddenBy, isSelf), HookItem
                                  (event, matcher, command ≤120, script), parseInstalls (R5),
                                  stateFileOf/upperFilesOf/settingsFilesOf, sourcesOf/foldersOf/filesOf,
                                  pluginPart, userHooks, buildInventory, headerOf, summaryOf, plural,
                                  STATE_WORD, toggleArgv, cliError, joinPath
mods/hooks/register.tsx           /relai-mods: panel „RelAI Mods”, odczyt dysku przez $.fs przy każdym
                                  renderze, nagłówek „12/14 włączone · 7 hooków własnych”, lista wierszy
                                  (typ, id lub zdarzenie, scope · wersja · stan, linia liczb), przełącznik
                                  filetree i Przeładuj z E1 (do zastąpienia)
mods/hooks/inventory.test.ts      22 testy na fixturach dzisiejszego dysku (przypadki brzegowe E2, R5, R6)
mods/hooks/mods.test.tsx          6 testów: przełącznik, panel na desktopie i w terminalu, błąd CLI
```

Dane na maszynie Łukasza (FAKT, 2026-10-23, panel na żywo i pliki): 14 pluginów, 12 włączonych,
4 mody (`filetree` wyłączony), 7 hooków własnych w 5 zdarzeniach. `security-guidance` ma `false`
w `C:\Users\Lukasz\Desktop\Parkly\.claude\settings.local.json` (scope `local`, projekt Parkly), więc
to plugin innego projektu — dobry kandydat do testu przełączania z `cwd`, ale **nie** cel pomiaru na
żywo (cudzy projekt). Cel pomiaru na żywo zostaje `filetree@claude-code-filetree` (scope `user`,
mod, dziś wyłączony; przełączenie da się cofnąć bez skutków dla pracy).

**Czego jeszcze nie ma:**

- Wyszukiwarki (`Input`) i filtrów Wszystko / Mody / Pluginy / Hooki / Wyłączone.
- Szczegółów wybranej pozycji po prawej (opis, liczby, zdarzenia, plik, który się zmieni, dopiski,
  powód kłódki, komenda dla samego kokpitu).
- Przełącznika w każdym wierszu (`Button` z `Svg`), kolejki wywołań CLI i stanu „…”.
- Kłódek z powodem i braku przełącznika dla `relai-mods@relai`.
- Paska zmian ze stanem „załadowanym” w tym czacie.
- Etykiet typu w kolorach z kluczy i linii `RULE` między wierszami.
- Testu „bez hex poza `Svg`” w drzewie i testu budżetu na 100 sztucznych pluginach (R7).
- Zrzutów w jasnym i ciemnym wyglądzie.

**Zasady aktywne z rejestru lekcji (przepisane w całości):**

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
     L-0192, L-0198, L-0210, L-0215, L-0242 — „przeszło testy” nie zwalnia z reguły); ścieżka w powłoce z `/`, także składana ze zmiennych
     w funkcji (L-0230);
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
     1,00 : 1 na całej linii to najpierw instrument (L-0213).
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
     przepełnienie telefonu: `innerWidth` wobec `visualViewport`, potem bisekcja reguł (L-0249).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249)
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
      zmiennego cwd, test w podfolderze (L-0146); przypadek błędu najpierw na samym narzędziu
      (bez zapisu), kopia plików użytkownika przed pomiarem, który w nich pisze, odpowiedź
      `$.command.run` po treści, atrapa testu odpowiada na każde wywołanie z `calls` walidatora
      (L-0253).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253)
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

> **Katalog roboczy tego etapu: `.claude/relai/work/RELAI_MODS/E3/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

0. **Pytanie startowe** z sekcji „Decyzje już podjęte” (rdzeń motywu, binarka CLI) — przed kodem
   wyglądu. Aneks B do `PLAN.html` (sekcja 10) tylko po „tak” Łukasza.
1. **Czysta logika kokpitu** w `mods/hooks/` (np. `cockpit.ts` obok `inventory.ts`, bez `$`):
   filtr i wyszukiwanie po id, nazwie, opisie i zdarzeniu; liczba zmian N wobec stanu
   „załadowanego”; kolejka kliknięć (jedno wywołanie naraz, ponowne kliknięcie tego samego wiersza
   ignorowane); powód kłódki z pól modelu (`isPolicy`, `overriddenBy`, hook, `isSelf`); argv i `cwd`
   przełącznika (`projectPath` dla `project` i `local`); etykieta „projekt <folder>”; tekst „plik,
   który się zmieni”.
2. **`mods/hooks/register.tsx`** — kokpit z makiety C na desktopie: nagłówek z licznikiem,
   `Input`, filtry, lista po lewej z linią `RULE` między wierszami, szczegóły wybranej pozycji po
   prawej, przełącznik `Svg` w każdym wierszu z przełącznikiem, kłódki, pasek zmian z Przeładuj.
   Przełącznik `filetree` z E1 znika. Limit czasu CLI 20 s. Stan „załadowany” zapisany przy
   `session.start` i po przeładowaniu.
3. **`mods/types/index.d.ts`** — nowe wartości `$.state` (np. zapytanie, filtr, wybrana pozycja,
   stan załadowany, kolejka); inwentarza dalej nie trzymasz w `$.state`.
4. **Testy** (`mods/hooks/cockpit.test.ts` i `mods.test.tsx`): każdy przypadek z listy niżej osobnym
   testem z kontrolą pozytywną; test drzewa bez hex poza `Svg`; test budżetu na 100 sztucznych
   pluginach wobec wagi z `pane-parts.tsx` / P-023 pkt 7 (ponad budżet przełączniki w wierszach
   przechodzą na glif, `Svg` zostaje w szczegółach — R7).
   Przypadki z sekcji 8: błąd CLI albo przekroczony czas; policy i nadpisanie (kłódka bez CLI);
   wiersz samego kokpitu; plugin projektowy tego i innego projektu (argv z `cwd`); kliknięcie
   w trakcie wywołania (kolejka); przełączenie tam i z powrotem (N wraca do 0); mod wyłączony
   w filtrze Wyłączone; brak wpisu w `enabledPlugins` w filtrze Wyłączone; powierzchnia mobilna
   (sama lista tekstem, bez przełączników).
5. **Zrzuty** panelu w jasnym i ciemnym wyglądzie aplikacji do akceptacji Łukasza, porównane
   z makietą C (kształt, nie same barwy — zasada 15).
6. Wersja zostaje **0.0.1**.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Pytanie startowe zadane i rozstrzygnięte przed kodem wyglądu; aneks B (jeśli jest) w `PLAN.html` sekcja 10 i w dzienniku wdrożenia `STATUS.md`.
- [x] `"$CLAUDE_CODE_EXECPATH" plugin validate mods` — bez błędów; `"$CLAUDE_CODE_EXECPATH" plugin test mods` — wszystkie testy zielone, liczba testów podana we wpisie (przed: 28).
- [x] Każdy przypadek z punktu 4 zakresu ma osobny test z kontrolą pozytywną, a co najmniej jedna celowo wstawiona usterka w logice kokpitu (np. N liczone z kliknięć) wywraca test — wynik mutacji we wpisie, kod przywrócony.
- [x] Test drzewa: żaden `color` elementu poza markupem `Svg` nie jest hexem. `grep -nE "#[0-9a-fA-F]{3,6}" mods/hooks/*.tsx` trafia tylko w markup `Svg` (albo nic). Kontrola pozytywna: ten sam `grep` trafia w `core/panel/theme.mjs`.
- [x] Test budżetu: 100 sztucznych pluginów mieści się w budżecie z P-023 pkt 7 (waga liczona jak w `pane-parts.tsx`), a ponad progiem wiersze tracą `Svg` przełącznika na rzecz glifu.
- [x] Na żywo, z kopią `~/.claude/settings.json` w katalogu roboczym przed pierwszym kliknięciem (L-0253): klik przełącznika `filetree` zmienia plik (`true`), pasek pokazuje „1 zmiana czeka”; drugi klik przywraca `false` i pasek znika. Na koniec `diff` kopii z plikiem pusty.
- [x] Na żywo: Przeładuj na desktopie pokazuje „wpisz /reload-plugins”; po wpisanym ręcznie `/reload-plugins` przy N > 0 pasek znika (stan załadowany odświeżony).
- [x] Na żywo: `relai-mods@relai` bez przełącznika, z komendą w szczegółach; hooki z kłódką „tylko podgląd”; filtr Wyłączone pokazuje `filetree` i `security-guidance`.
- [x] Zrzuty w jasnym i ciemnym wyglądzie (`okno.ps1`) pokazane Łukaszowi i zaakceptowane — bramka manualna w `STATUS.md` z wynikiem.
- [x] Dowód negatywny:
      - `grep -cE '\$\.fs\.write' mods/hooks/register.tsx` (cudzysłów pojedynczy) daje 0; kontrola pozytywna: ten sam wzorzec daje 11 w `panel/hooks/register.tsx` (2026-10-23);
      - `git diff --stat` dla `.claude-plugin/marketplace.json` i `core/tools/network-calls.js` pusty (oraz `core/tools/sync-panel-core.js`, jeśli nie było aneksu B);
      - `mods/.claude-plugin/plugin.json` ma nadal `0.0.1`.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem z członem użytkownika.
- [x] Katalog roboczy `.claude/relai/work/RELAI_MODS/E3/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we wpisie dziennika. Artefakty spoza katalogu wypisane we wpisie z nazwy razem z tym, co się z nimi stało, w tym kopia moda w `~/.claude/dev-mods/<id sesji>/relai-mods/`.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. `docs/plany/RELAI_MODS/STATUS.md` — E3 → `ZREALIZOWANY <data>`, E4 → `GOTOWY DO STARTU`, linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E4 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/RELAI_MODS/E3/` — raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` (+ lekcje, jeśli coś zaskoczyło; + przegląd wiersza RM1 w tabeli ryzyk), podpis z członem użytkownika.
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu (w tym akceptacja zrzutów).
4. `docs/STATE.md`, `CLAUDE.md` (wiersz planu w „Stan prac”) i pozostałe dokumenty, których dotknął etap.
5. **Wygenerowanie `PROMPT_ETAP_4.md`** — materiał: `PLAN.html` sekcje 6 (wiersz E4), 7 (R1, R2), 8 (przypadki „Wąski panel albo terminal przy 80 kolumnach”, „Dwa czaty otwarte naraz”, „Powierzchnia mobilna”), 10 (Aneks A pkt 3 — przeładowanie w terminalu), realny stan po E3 (logika kokpitu, testy, panel), lekcje z E3; wzór testu szerokości `panel/hooks/narrow.test.ts` i `STACK_BELOW` z `panel/hooks/pane-parts.tsx`.
6. Commit — propozycja.
