# PROMPT_ETAP_4 — humanizacja w panelu i w trzech narzędziach: formularz ustawień, liczby komend, dokumenty użytkownika

Plan: HUMANIZACJA • Etap: **E4 z E5** • Wygenerowano: 2026-10-14 (autor: Opus 5.5, w rytuale „Na koniec” etapu E3) • Wykonawca: **Opus 5.5** (STATUS.md: „Opus 5.5 w świeżych sesjach”), `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (plan tak przypisał E4: praca rozległa, ale mechaniczna — formularz, liczby, dokumenty;
> decyzje projektowe zapadły w E1–E3).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, profil `prompty` (rejestr `ARTEFAKTY.md`), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (przepisane też niżej) i lekcje L-0185, L-0187, L-0189 |
| `docs/plany/HUMANIZACJA/PLAN.html` | sekcje 5 (punkty styku: formularz i ikona w panelu, generator Codeksa, opisy z liczbą komend), 6 (E4), 7 (ryzyko H8), 8 (przypadki Cursor i Codex), 10 (Aneks A6) |
| `docs/DZIENNIK.md` | ostatni wpis (E3 HUMANIZACJA) — co zmierzono, „Świadomie odłożone”, bramka o tekście podyktowanym dosłownie |
| `docs/plany/PANEL_CODEX/STATUS.md` | stan równoległego planu: czy jego E1 nie trzyma zmian w `core/panel/` — wspólny punkt z tym etapem |
| `core/panel/commands.mjs` | formularz `relai-humanize` (dziś jedno pole „tekst albo ścieżka pliku”, komentarz „settings modes come in E4”); wzór trybów: formularz `relai-prompt` (pole `choice` z `emit`, `when`) |
| `core/panel/theme.mjs` | nazwa, opis, grupa `work` i nagłówki (`HEADINGS`) — źródło `headings.mjs`, który generuje `core/tools/build-panel-headings.js` |
| `panel/hooks/pane-v2.test.ts` (test „the 15 commands … fit 925 px”) | tymczasowe 925 px z E1 — powrót do 900 px jest w zakresie tego etapu |
| `adapters/claude-code/commands/relai-humanize.md` | `argument-hint` (zmieniasz razem z formularzem — test parowania formularzy pilnuje tej pary), Krok 0a (`on` / `off` / `ustawienia`) |
| `core/tools/validate-adapters.js`, `core/tools/sync-panel-core.js`, `adapters/codex/generate-skills.js` | kontrole, które przewrócą się na liczbach i kopiach; nowa kontrola noty MIT (H8) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Ustawienia humanizacji** (E2, `SPEC_USTAWIENIA.md` v15): jeden wiersz `Humanizacja`, trzy warstwy
  (sesja → projekt → globalnie), zapis wyłącznie skryptem `humanize-mode.js` (`zapisz`, `przelacz`).
  Panel nie pisze wiersza sam: formularz składa argumenty komendy (`on`, `off`, `ustawienia`), a karta
  potwierdzenia wysyła je do czatu — tak jak inne formularze (pamięć „UI zamiast komend”).
- **Tryb ciągły** (E3): hook `humanize-continuous` działa w Claude Code; w Cursorze i Codeksie wywiad
  nie pyta o zakresy, komenda działa na żądanie (plan, sekcja 8). Tego etapu nie zmieniasz.
- **Rejestracja minimalna z E1 (Aneks A6):** formularz „przerób tekst”, nazwa „Humanizacja tekstu”,
  ikona, grupa „Prowadzenie pracy”, generator Codeksa na 15. E4 dopisuje **tryby ustawień**
  w formularzu, liczby w opisach i dokumenty użytkownika.
- **Nota MIT** (H8): `core/humanize/LICENSE-humanizer.md` z listą plików korzystających z treści
  Humanizera (od E3 także `SKROT.md`); w E4 walidator sprawdza jej obecność, README ma wzmiankę.
- **Wiersz „Humanizacja” w tym repo** jest `wyłączona` (decyzja Łukasza 2026-10-14) — nie zmieniasz.
- **Granica zakresu:** korpus 8 tekstów, pomiar kosztu tury (H5), próba w świeżej sesji po instalacji
  i wydanie 3.1.0 (z podbiciem wersji RelAI i trzech pluginów panelu w marketplace) → **E5**. Bramka
  „czy tryb dokumenty poprawia tekst podyktowany dosłownie” — człowiek przed E5, nie tutaj. Odnoga
  FILM_TESTY_V3 — osobny wątek, testów filmu nie ruszasz. Bramka optymalizatora — świadomie odłożona.

## Stan wyjściowy (co realnie zastajesz po E3)

E3 zamknięty 2026-10-14. Tryb ciągły działa: `core/process/humanize-continuous.js` + hook
`adapters/claude-code/hooks/humanize-continuous.js` (dopięty w `hooks.json`), ściąga
`core/humanize/SKROT.md`. RelAI 3.0.0 zainstalowany na stałe (scope `user`) — zmiany w repo mierzysz
`--plugin-dir <repo>` z `--setting-sources project,local` (tak mierzył E3) albo, dla panelu, `claude
plugin test` binarką aplikacji `%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe` (P-024).

Testy: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js
core/panel/tests/*.test.js adapters/codex/tests/*.test.js` → **402** (FAKT, 2026-10-14); walidator
`node core/tools/validate-adapters.js` spójny z jednym ostrzeżeniem zastanym (`relai-prompt.md`
30 106 B); `claude plugin test` binarką 2.1.295: panel 178, progress 31, cache-keeper 178.

```
core/panel/commands.mjs           # formularz relai-humanize: jedno pole text (isRequired), argumentHint '[tekst albo ścieżka pliku]'
core/panel/theme.mjs              # 'relai-humanize': ['Humanizacja tekstu', 'Usuń z tekstu nawyki pisarskie AI'], grupa work
core/panel/headings.mjs           # GENEROWANY przez core/tools/build-panel-headings.js (name-relai-humanize już jest)
panel/hooks/core/*.mjs            # kopia core/panel/ — synchronizuje core/tools/sync-panel-core.js
panel/hooks/pane-v2.test.ts       # "15 commands … fit 925 px (900 px until HUMANIZACJA E1)" — TEMPORARY
panel/.claude-plugin/plugin.json  # relai-panel 0.15.0, opis: "forms for the 14 RelAI commands"
adapters/claude-code/commands/relai-humanize.md  # v2, argument-hint "[tekst albo ścieżka pliku]"
adapters/codex/skills/relai-humanize/SKILL.md    # wygenerowany (generate-skills.js wymaga 15 komend)
adapters/cursor/install.js        # kopiuje wszystkie komendy adaptera Claude Code do .cursor/commands/
core/humanize/LICENSE-humanizer.md               # nota MIT (REGULY, pl.md, SKROT.md, komenda)
```

Liczba „czternaście” stoi dziś m.in. w: `README.md:76`, `docs/PRZEWODNIK.md:86` i `:236`,
`adapters/cursor/README.md:32`, `core/templates/SPEC_KOMENDY.md:89` (historycznie: „czternasta
komenda” w 2.2.0 — rozstrzygasz, czy to opis historii), `docs/STATE.md` („Czternaście skrótów”,
„14 komend” w szczegółach), opis `panel/.claude-plugin/plugin.json` („14 RelAI commands”) i jego
odpowiednik w obu marketplace. `docs/KOMENDY.md` i `SPEC_KOMENDY.md` nie wymieniają
`/relai-humanize` ani razu (FAKT, `grep -c` → 0).

**Czego jeszcze nie ma (to jest zakres tego etapu):** trybów ustawień w formularzu panelu
(`on`, `off`, `ustawienia` obok „przerób tekst”), `argument-hint` komendy zgodnego z formularzem,
zakładki komend mieszczącej się znów w 900 px, liczby 15 w opisach i dokumentach, wpisu
`/relai-humanize` w `KOMENDY.md` i `SPEC_KOMENDY.md`, kontroli noty MIT w walidatorze i wzmianki
w README, potwierdzenia, że komenda trafia do Cursora instalatorem i że skill Codeksa jest aktualny.

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

> **Katalog roboczy tego etapu: `.claude/relai/work/HUMANIZACJA/E4/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

0. **Przed pierwszą zmianą w `core/panel/`:** stan PANEL_CODEX (`docs/plany/PANEL_CODEX/STATUS.md`,
   `git status`, `git log -5 -- core/panel panel`). Zmiany cudzego planu w tych plikach → zatrzymaj
   się i zapytaj (zastane zmiany `docs/plany/PANEL_CODEX/*` i `docs/zasoby/PANEL_RELAI/makiety/`
   z poprzednich sesji to nie są zmiany w `core/panel/`).
1. **`core/panel/commands.mjs`** — formularz `relai-humanize` z trybami: „przerób tekst” (dzisiejsze
   pole), `on`, `off`, `ustawienia` (pole `choice` z `emit` jak w `relai-prompt`, pole tekstu tylko
   w trybie „przerób tekst”). `argumentHint` i `argument-hint` w
   `adapters/claude-code/commands/relai-humanize.md` zmieniasz **razem** (np. `[tekst albo ścieżka
   pliku] | on | off | ustawienia`); potem `node adapters/codex/generate-skills.js`.
2. **Zakładka komend w 900 px** — `panel/hooks/pane-v2.test.ts`: test wraca do 900 px, a układ
   zakładki (`core/panel/theme.mjs` / plik widoku komend) mieści 15 komend, „Teraz” i nagłówek
   w 900 px desktopu. Zmierz przed i po (`claude plugin test` i, gdy trzeba, render w Chromium
   — zasada 15). Nie da się bez zmiany projektu zakładki → sygnał odchylenia (pytanie), nie
   ciche 925.
3. **Kopia rdzenia panelu** — `node core/tools/sync-panel-core.js` (i `build-panel-headings.js`, jeśli
   zmienisz `HEADINGS`); walidator: 0 duplikatów/rozjazdów kopii.
4. **Liczba 15 w opisach i dokumentach** — każde trafienie „czternaście / 14 komend / 14 RelAI
   commands” w `README.md`, `docs/PRZEWODNIK.md`, `adapters/cursor/README.md`, `docs/STATE.md`,
   opisie `panel/.claude-plugin/plugin.json` i jego odpowiednikach w obu marketplace rozstrzygasz:
   deklaracja stanu → 15 (z nazwą humanizacji w wyliczeniach), opis historii → bez zmian (zasada 10).
   Wersji pluginów **nie podbijasz** (E5).
5. **`docs/KOMENDY.md`** i **`core/templates/SPEC_KOMENDY.md`** — wpis `/relai-humanize`: co robi,
   formy wywołania (`<tekst|plik>`, `on`, `off`, `ustawienia`) uruchomione dosłownie (zasada 2),
   tryb ciągły w Claude Code w jednym zdaniu, Cursor i Codex na żądanie.
6. **Nota MIT (H8)** — `core/tools/validate-adapters.js`: kontrola, że `core/humanize/LICENSE-humanizer.md`
   istnieje, ma „MIT” i prawa autora oraz wymienia każdy plik `core/humanize/*.md` poza sobą
   i `PROFIL_STYLU.md` (rozstrzygnij listę i zapisz ją w kodzie) — z kontrolą pozytywną na podłożonym
   braku; `README.md` — jedno zdanie o źródle reguł (Humanizer, MIT) z linkiem do noty.
7. **Cursor i Codex** — instalator Cursora (`node adapters/cursor/install.js` na fiksturze w `%TEMP%`)
   kopiuje `relai-humanize.md`; skill Codeksa po `generate-skills.js` w parytecie (walidator).
8. **`docs/ARTEFAKTY.md`** — podbite pozycje (komenda `argument-hint`, `SPEC_KOMENDY.md`, ewentualnie
   inne artefakty), każda z „co i po co”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_4.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js` — zero błędów; liczba testów przed (402 — FAKT) i po do wpisu.
- [ ] `node core/tools/validate-adapters.js` — zero błędów, parytet skilli Codeksa 0 rozjazdów, nowa kontrola noty MIT widoczna w wyniku i czerwona na podłożonym braku (kontrola pozytywna, potem przywrócenie); ostrzeżenia wypisane we wpisie.
- [ ] `claude plugin test` binarką aplikacji dla `panel/`, `progress/`, `cache-keeper/` — wszystkie zielone; liczby przed (178 / 31 / 178) i po do wpisu.
- [ ] Test zakładki komend w `pane-v2.test.ts` sprawdza **900 px** (nie 925), komentarz „TEMPORARY” usunięty, test zielony.
- [ ] Formularz `relai-humanize`: każdy tryb składa argument zgodny z Krokiem 0a komendy (test w `core/panel/tests/` albo `panel/hooks/*.test.ts`), a test parowania formularza z `argument-hint` przechodzi.
- [ ] `git grep -niE "czternaście komend|14 komend|14 RelAI commands|czternaście skrótów"` — każde trafienie wypisane we wpisie jako „poprawione” albo „historyczne, zostaje”.
- [ ] `docs/KOMENDY.md` i `SPEC_KOMENDY.md` mają wpis `/relai-humanize` (dowód obecności `grep -c` > 0); formy wywołania w nich są dosłownie tymi z komendy.
- [ ] Instalator Cursora na fiksturze kopiuje `relai-humanize.md` (plik w `.cursor/commands/` z tą samą sumą co źródło).
- [ ] `git grep -nE "sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}|sk_(test|live)_[A-Za-z0-9]{10,}"` — 0 trafień, z kontrolą pozytywną na próbce złożonej w czasie wykonania.
- [ ] `docs/ARTEFAKTY.md` ma podbite wpisy; `git status --short` nie pokazuje plików spoza zakresu (zastane zmiany PANEL_CODEX i `docs/zasoby/PANEL_RELAI/makiety/` — nietknięte).
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md` nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/HUMANIZACJA/E4/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (fikstury w `%TEMP%`, render w Chromium) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/HUMANIZACJA/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_5.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/HUMANIZACJA/E4/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (H1–H8 planu); lekcje z etapu →
   `docs/LEKCJE.md` i odświeżone „Zasady aktywne” (limit 15).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`; rzut oka na ikonę i wiersz „Humanizacja tekstu” w panelu (bramka
   z E1) — rozstrzygnij z człowiekiem albo zostaw otwartą z powodem.
4. `docs/STATE.md` — „Nad czym pracujemy teraz” (plan HUMANIZACJA po E4) i „Co działa” (formularz
   w panelu, 15 komend); `README.md` — tylko zmiany z zakresu (liczba, nota MIT).
5. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` sekcja 6 (E5 — pomiar i wydanie 3.1.0), ryzyk H1, H4, H5, bramek „zgoda na publikację
   3.1.0” i „tekst podyktowany dosłownie”, realnego stanu po tym etapie (wersje pluginów do podbicia,
   sekwencja wydania P-005) i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku.
