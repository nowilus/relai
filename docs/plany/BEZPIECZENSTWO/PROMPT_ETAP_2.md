# PROMPT_ETAP_2 — hook lockfile-scan jako 13. hook RelAI

Plan: BEZPIECZENSTWO • Etap: **E2 z E6** • Wygenerowano: 2026-10-24 (autor: Opus 5.5, w rytuale „Na koniec" etapu E1) • Wykonawca: **Opus (D-85) w Claude Code**, `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (jeden hook, jeden test i kilka liczników; logika hooka już istnieje i jest zmierzona).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu (artefakty), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne” (przepisana też niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (wiersz Z1) + wpis „BEZPIECZENSTWO E1” z 2026-10-24 |
| `docs/plany/BEZPIECZENSTWO/PLAN.html` | sekcje 5 (punkt 3), 6 (wiersz E2), 7 (ryzyka 1, 4, 5), 8 (przypadek „Hook w Codeksie i Cursorze”), 10 (Aneks A) |
| `adapters/claude-code/skills/trivy-scan/scripts/lockfile-hook.mjs` | logika hooka: wyzwalacze (pliki blokady, komendy instalacji), 20 s przerwy, kiedy mówi, a kiedy milczy |
| `adapters/claude-code/skills/trivy-scan/references/hook.md` | opis hooka i rejestracji — po E2 ma mówić o rejestracji w pluginie |
| `adapters/claude-code/hooks/hooks.json` + `adapters/claude-code/hooks/humanize-continuous.js` | format wpisu (`${CLAUDE_PLUGIN_ROOT}`), kolejność PostToolUse, wzór nagłówka hooka |
| `core/process/tests/humanize-continuous.test.js` | wzór testu hooka wołanego procesem z JSON-em na stdin |
| `core/tools/validate-adapters.js` | co walidator liczy w `hooks.json` („wywolania z hooks.json”) |
| `~/.claude/settings.json` (tylko odczyt, do bramki) | wpis `PostToolUse` z `lockfile-hook.mjs` w profilu — usuwany wyłącznie po „tak” |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan BEZPIECZENSTWO zaakceptowany 2026-10-23: hook przejmuje RelAI jako **13. hook**, `PostToolUse` dla `Write|Edit|MultiEdit` i `Bash` (PLAN, sekcja 5, punkt 3).
- Hook to **jeden plik Node.js** w `adapters/claude-code/hooks/`, bez par `.ps1`/`.sh` (D-40 i jej aneks z 2026-09-24); zero zależności npm (D-04).
- Kolejność istniejących wpisów `PostToolUse` zostaje bez zmian — nowy hook dochodzi **na końcu** list (PLAN, sekcja 6, wiersz E2).
- Hook nigdy nie blokuje i nie psuje wywołania narzędzia; odzywa się tylko przy pierwszym skanie folderu z CRITICAL/HIGH albo przy nowym CRITICAL/HIGH; 20 s przerwy między skanami (PLAN, ryzyko 4; zachowanie `lockfile-hook.mjs`, zmierzone w E1).
- Komunikaty hooków są ASCII (zasada aktywna 15) — obecne komunikaty `lockfile-hook.mjs` są ASCII; nowy tekst też.
- Wpis hooka w `~/.claude/settings.json` znika **wyłącznie po „tak” człowieka** — bramka manualna planu.
- Wiersz ryzyka na paczkę + plik blokady, klucz advisory + paczka + plik (Aneks A, 2026-10-24); skan pomija `.claude/relai/work` i `evals` skilla (decyzja Łukasza w E1).
- Edycje plików śledzonych wyłącznie Edit/Write, `sed` tylko do odczytu (L-0262).
- **Granica zakresu:** sekcja „Bezpieczeństwo” w `SPEC_PROMPT_ETAPU.md`, `done-check`, `first-deploy`, zamknięcie sesji i planu oraz nowa decyzja w `DECYZJE.md` to E3; `security-audit` Cloudflare i `--full` to E4; hook w Codeksie i Cursorze (bramka `CLAUDECODE` w `hooks/hooks.json` Codeksa) to E5 — **nie dotykaj** `hooks/hooks.json` w korzeniu ani `adapters/codex/hooks/`; wydanie i wersja 3.3.0 to E6 — **nie podbijaj wersji**.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 w repo i publicznie (FAKT). E1 (2026-10-24) dodał do repo — bez wydania — skill `adapters/claude-code/skills/trivy-scan/` i komendę `/relai-security` (16 komend w panelu, Codeksie i dokumentach). Dogfooding E1 dał ryzyko **Z1** (`zod` w `docs/zasoby/film/zrodla/`). W profilu użytkownika nadal działa stary hook: `~/.claude/settings.json` ma jeden wpis `PostToolUse` z `~/.claude/skills/trivy-scan/scripts/lockfile-hook.mjs` (FAKT, sprawdzone w E1) — dopóki go nie ma usuniętego, każdy plik blokady może być skanowany dwa razy. Trivy 0.76.1 na maszynie (winget), baza pobrana (FAKT). Testy odpalasz plikami, nie katalogiem (P-036): `node --test core/process/tests/*.test.js`, `node --test core/panel/tests/*.test.js`, `node --test adapters/codex/tests/*.test.js`; walidator: `node core/tools/validate-adapters.js`.

Zmierzone autorem promptu 2026-10-24 na kopii fixtury `scan-reports-fix-plan` w `%TEMP%` (FAKT): `lockfile-hook.mjs` z `{"tool_name":"Write","tool_input":{"file_path":"<dir>/package-lock.json"},"cwd":"<dir>"}` na stdin zwrócił `hookSpecificOutput` z notką `[trivy-scan] … HIGH 16 …` w 1,4 s (ciepła baza); wywołanie `Bash` z `ls` — cisza, kod 0; `Edit` pliku spoza listy — cisza w 0,08 s. Plik `lockfile-hook.mjs` uruchamia `main()` przy załadowaniu i woła `scan.mjs` leżący obok siebie (`import.meta.url`); zostawia znaczniki `%TEMP%/trivy-scan-hook-<hash>`.

Pliki istotne dla etapu:

```
adapters/claude-code/
  hooks/hooks.json        12 hooków: PreToolUse (secret-scanner, config-protection); PostToolUse
                          ^(Write|Edit|MultiEdit)$ (quality-gate, console-log-warn, design-quality-check,
                          profile-rules, journal-signature, humanize-continuous), ^Bash$ (humanize-continuous),
                          ^Skill$ (session-context); UserPromptSubmit; SessionStart; Stop
  hooks/*.js              12 plików CommonJS ('use strict', nagłówek „RelAI hook: <nazwa> — <zdarzenie>, <rola> (D-41)”)
  skills/trivy-scan/
    scripts/lockfile-hook.mjs   logika hooka (ESM), w E1 nierejestrowana w pluginie
    scripts/scan.mjs            skan (ESM), wołany przez hook z --quick --json
    references/hook.md          sekcja „Registration”: „przejmuje E2”
    SKILL.md                    sekcja „Lockfile hook (automatic scans)”
core/process/tests/       testy procesu; wzór testu hooka: humanize-continuous.test.js
docs/PRZEWODNIK.md        l. 120 „Jedenaście hooków … Dwa blokują, sześć ostrzega, trzy pracują cicho.”
                          i tabela hooków pod nią; l. 245 drzewo „jedenaście hooków Node.js”
docs/STATE.md             „12 hooków” w akapicie adaptera Claude Code
docs/DECYZJE.md           aneks D-40 z 2026-09-24: „Hooków jest 11” (rejestr — zmiana tylko za zgodą)
```

**Czego jeszcze nie ma:** pliku hooka w `adapters/claude-code/hooks/`, wpisu w `hooks.json`, testu hooka, liczników „13 hooków” w dokumentach i opisu rejestracji w pluginie w `references/hook.md`; wpis w `~/.claude/settings.json` nadal istnieje.

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
     w funkcji (L-0230); znak niewidoczny w kodzie przez `String.fromCharCode`, nie ucieczkę
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
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249, L-0257, L-0258, L-0259, L-0261, L-0262)
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
      z typów to hipotezy (L-0255).
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
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245, L-0253, L-0255)
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

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/BEZPIECZENSTWO/E2/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`adapters/claude-code/hooks/lockfile-scan.js`** — 13. hook: jeden plik CommonJS z nagłówkiem w stylu pozostałych („RelAI hook: lockfile-scan — PostToolUse (Write/Edit/MultiEdit, Bash), OSTRZEGA cicho”). Logiki nie kopiujesz: plik ładuje `../skills/trivy-scan/scripts/lockfile-hook.mjs` dynamicznym `import()` (`pathToFileURL`), więc zostaje jeden właściciel logiki (zasada 8) i jeden proces. Błąd ładowania kończy się ciszą i kodem 0. Gdy `import()` z CommonJS nie działa w tej wersji Node albo stdin nie dochodzi do modułu — zatrzymaj się i zapytaj (przeniesienie logiki do hooka to inna decyzja).
2. **`adapters/claude-code/hooks/hooks.json`** — `node "${CLAUDE_PLUGIN_ROOT}/adapters/claude-code/hooks/lockfile-scan.js"` z `"timeout": 120` dopisany **na końcu** listy `^(Write|Edit|MultiEdit)$` i na końcu listy `^Bash$`; pozostałe wpisy i ich kolejność bez zmian.
3. **`core/process/tests/lockfile-scan.test.js`** — hook wołany procesem z JSON-em na stdin: (a) `Edit` pliku spoza listy → pusty stdout, kod 0; (b) `Bash` z komendą bez instalacji → cisza; (c) błędny JSON → cisza, kod 0; (d) `Write` `package-lock.json` z podstawionym `TRIVY_BIN` wskazującym nieistniejący plik i bez Trivy na `PATH` nie jest testowalne przenośnie — przypadek z prawdziwym Trivy i fixturą (`evals/scan-reports-fix-plan/files/` skopiowane do katalogu tymczasowego testu) uruchamiasz warunkowo: Trivy jest → oczekujesz `[trivy-scan]` i `HIGH 16`; nie ma → `t.skip` z powodem. Fixtury nie kopiujesz do repo drugi raz.
4. **`adapters/claude-code/skills/trivy-scan/references/hook.md`** i sekcja „Lockfile hook” w **`SKILL.md`** — rejestracja w pluginie (`hooks.json`, nazwa `lockfile-scan`), wyłączenie przez wyłączenie pluginu, ręczny wpis z profilu jako stary układ do usunięcia (inaczej skan idzie dwa razy). Wersje w `docs/ARTEFAKTY.md` → 2, z „co się zmieniło” i „po co”.
5. **Liczniki hooków 12 → 13**: `docs/PRZEWODNIK.md` (l. 120 z podziałem „blokują / ostrzegają / pracują cicho” — policz od nowa z D-41 i nagłówków plików, oraz wiersz w tabeli hooków; l. 245 drzewo), `docs/STATE.md`. Przed zmianą `grep -rn -i "hook" ` po liczebnikach: `jedenaście\|dwanaście\|trzynaście\|1[123] hook` w `docs/`, `README.md`, `adapters/`, `core/` — także odmiany (`jedenastu`, `dwunastu`; L-0261). Aneks D-40 w `docs/DECYZJE.md` (liczba hooków) wyłącznie za zgodą człowieka; bez zgody → „świadomie odłożone”.
6. **Pomiar czasu (ryzyko 4)** — w katalogu roboczym: hook przez `lockfile-scan.js` dla `Edit` pliku spoza listy (oczekiwane rzędu 0,1 s; zmierzone 0,08 s dla samego `.mjs`) i dla `Write` pliku blokady z ciepłą bazą (rzędu 1,4 s); liczby do wpisu dziennika.
7. **Bramka: wpis w `~/.claude/settings.json`** — pokaż człowiekowi dokładny fragment JSON do usunięcia i zapytaj; po „tak” usuń **tylko** ten wpis (kopia pliku przed zmianą w katalogu roboczym), potem `node -e` parsuje plik jako JSON. Bez „tak” → bramka zostaje `OTWARTA`, a we wpisie stoi, że skan idzie podwójnie.
8. **Dogfooding na żywo:** w świeżej sesji Claude Code z pluginem z repo (`--plugin-dir`, zasada 10) zmiana `package-lock.json` w projekcie testowym w katalogu roboczym daje notkę `[trivy-scan]` w rozmowie, a zmiana `README.md` — ciszę (sonda: licznik notek w transkrypcie). Gdy świeża sesja z `--plugin-dir` jest niewykonalna, opisz warunek i pokaż zachowanie przebiegiem hooka z `hooks.json` przez stdin.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_2.md` (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node core/tools/validate-adapters.js` kończy się „spojne”; linia „wywolania z hooks.json” rośnie o 2 wobec 15 (dwa nowe wpisy), skan sieci obejmuje `lockfile-scan.js` i nie zgłasza go.
- [ ] `node --test core/process/tests/*.test.js` — zielone, w tym `lockfile-scan.test.js`; przypadek z Trivy wykonany (nie `skip`) na tej maszynie.
- [ ] `node --test core/panel/tests/*.test.js` i `node --test adapters/codex/tests/*.test.js` — zielone (hook nie rusza panelu ani Codeksa — dowód, że nic się nie rozjechało).
- [ ] Dowód negatywny kolejności: dla każdej listy `PostToolUse` w `hooks.json` lista poleceń przed nowym wpisem jest identyczna jak w `git show HEAD:adapters/claude-code/hooks/hooks.json` (porównanie skryptem, wynik do wpisu).
- [ ] Przebieg `lockfile-scan.js` ze stdin: `Write` `package-lock.json` w kopii fixtury → notka `[trivy-scan]` (kontrola pozytywna); `Edit` `README.md` → pusty stdout; oba z kodem 0; czasy z punktu 6 zakresu we wpisie.
- [ ] Komunikaty hooka ASCII: `LC_ALL=C.UTF-8 grep -nP "[^\x00-\x7F]"` po `lockfile-scan.js` i `lockfile-hook.mjs` nic nie zwraca, a kontrola pozytywna tego wzorca na pliku z „ą” w katalogu roboczym trafia (bez `LC_ALL` Git Bash odpowiada „-P supports only unibyte and UTF-8 locales” — sprawdzone przez autora promptu: `lockfile-hook.mjs` 0 trafień, plik z „ą” 1).
- [ ] `grep -rn -i "jedenaście hook\|jedenastu hook\|dwanaście hook\|dwunastu hook\|1[12] hook"` po `docs/`, `README.md`, `adapters/`, `core/` nie zwraca miejsc mówiących o bieżącej liczbie hooków (wzmianki historyczne opisane we wpisie).
- [ ] `hooks/hooks.json` w korzeniu i `adapters/codex/hooks/` bez zmian (`git diff --stat hooks/ adapters/codex/hooks/` pusty); wersja w `.claude-plugin/plugin.json` nadal 3.2.0.
- [ ] Bramka `~/.claude/settings.json`: albo „tak” i plik parsuje się jako JSON bez wpisu `lockfile-hook.mjs` (`grep -c` = 0, kopia przed zmianą w katalogu roboczym), albo bramka `OTWARTA` z adnotacją o podwójnym skanie.
- [ ] Dogfooding z punktu 8 zakresu: notka przy pliku blokady, cisza przy `README.md` — wynik i sposób pomiaru we wpisie.
- [ ] `/relai-security` na repozytorium RelAI: zero nowych CRITICAL/HIGH wobec E1 (Z1 bez zmian albo zamknięty decyzją człowieka); wynik do wpisu.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z pomiarami i podpisem z członem użytkownika.
- [ ] Katalog roboczy `.claude/relai/work/BEZPIECZENSTWO/E2/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we wpisie dziennika; artefakty spoza katalogu (`%TEMP%/trivy-scan-hook-*`, kopie fixtur, kopia `settings.json`) wypisane we wpisie z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. `docs/plany/BEZPIECZENSTWO/STATUS.md` — E2 → `ZREALIZOWANY <data>`, E3 → `GOTOWY DO STARTU`, linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E3 zaraz po kroku 5; bramka `~/.claude/settings.json` → `ROZSTRZYGNIĘTA <data> — <jak>` albo zostaje `OTWARTA`.
1a. Katalog roboczy `.claude/relai/work/BEZPIECZENSTWO/E2/` — raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` (+ lekcje, jeśli coś zaskoczyło; + ryzyka, jeśli dogfooding je dał), podpis z członem użytkownika.
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu.
4. `docs/STATE.md`, `CLAUDE.md` (wiersz planu w „Stan prac”) i pozostałe dokumenty, których dotknął etap.
5. **Wygenerowanie `PROMPT_ETAP_3.md`** — materiał: `PLAN.html` sekcje 5 (punkty 4–5), 6 (wiersz E3), 7 (ryzyko 3), 8 (przypadki „Podatności zastane” i „Człowiek akceptuje ryzyko”), 9 (zgoda na nową decyzję — bramka blokuje E3), realny stan po E2 (13 hooków, `/relai-security` i hook w pluginie) i lekcje z E2.
6. Commit — propozycja.
