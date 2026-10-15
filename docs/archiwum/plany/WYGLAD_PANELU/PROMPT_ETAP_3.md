# PROMPT_ETAP_3 — Panel RelAI w szacie jasnej

Plan: WYGLAD_PANELU • Etap: **E3 z E4** • Wygenerowano: 2026-10-15 (autor: Opus 5.5, w rytuale „Na koniec” etapu E2) • Wykonawca: **Opus 5.5, świeże sesje** • `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (decyzja o sposobie wyboru szaty, nowa paleta dla siedmiu zakładek, test kontrastu i rundy
> wyglądu na żywo; plan nie podaje poziomu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna |
| `docs/plany/WYGLAD_PANELU/PLAN.html` | sekcje 4 (wariant A i odrzucony C — dlaczego panel zostaje w palecie „Warsztat”), 5 (akapit „Panel”), 6 (E3), 7 (ryzyka 5, 6, 7), 8 (przypadki brzegowe: motyw nierozpoznany, zmiana motywu w trakcie, daltonized i ansi), 10 (Aneksy A i B — **Aneks B kończy się pytaniem dla E3**) |
| `docs/DZIENNIK.md` — wpisy „WYGLAD_PANELU E1” i „WYGLAD_PANELU E2” | co zmierzyła sonda, jak przebiegały rundy wyglądu, słowa Łukasza |
| `docs/PULAPKI.md` — P-042, P-043, P-041, P-024, P-017 | mod nie zna wyglądu aplikacji, klucze i `Svg` go znają; układ liczony jak CSS (pkt 6: tekst ucinany na bazie zerowej); pole „następny krok” zasłania paski; binarka aplikacji; zachowania silnika |
| `docs/fixy/PANEL_WASKI/ODNOGA.md` — sekcja „Wynik” | układ panelu w wąskim panelu podziału: `STACK_BELOW`, `textAndAct`, kafle grup komend; E3 bierze go bez zmian |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — §6, §7, §13 | panel boczny (Komendy, Koszty), wygląd pasków przyjęty w E1 i tabela barw `INK` |
| `core/panel/theme.mjs` — `ROOT`, `mix`, `THEME`, `DIFF`, `GLYPH_PATHS`/`glyph`, `HEADINGS` | jedyne źródło barw panelu; szata jasna powstaje tu; kopie przez `node core/tools/sync-panel-core.js` |
| `core/tools/build-panel-headings.js` i `core/panel/headings.mjs` (nagłówek pliku) | nagłówki odręczne (Kalam) są generowane do `Svg` — kolor nagłówka w szacie jasnej idzie przez generator, nie ręcznie |
| `panel/hooks/pane-parts.tsx` (całość) i `panel/hooks/register.tsx` — hook `ui.render` dla `Pane` | wspólne części panelu i miejsce, gdzie panel wybiera kolory |
| `panel/hooks/theme.test.ts`, `panel/hooks/narrow.test.ts` | dzisiejsze testy barw i kontrastu oraz test szerokości (model CSS) — mają przejść w obu szatach |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Panel zostaje przy palecie „Warsztat”** (`ROOT` z szablonu planu): szata ciemna jak dziś, szata
  jasna wyprowadzona z tej samej palety (`tlo`, `kartka`, `txt`, `glina`, `musztarda`, `szalwia`).
  Wariant C planu („panel w kluczach motywu”) odrzucony — Łukasz: panel „ma być tak jak jest teraz”
  (PLAN, sekcja 4).
- **Układ panelu dowozi odnoga PANEL_WASKI** (zamknięta 2026-10-14, `relai-panel` 0.18.0 w repo,
  niewydany): `STACK_BELOW = 48`, `textAndAct`, kafle grup komend, jeden układ wierszy na panel,
  test `narrow.test.ts`. E3 nie zmienia układu — zmienia barwy.
- **Aneks B (P-042):** mod nie zna wyglądu aplikacji (`theme` w `$.config.list()` stoi na `dark`,
  `config.set` nie przychodzi, `e.props.view` pusty); klucze motywu w `Box`/`Text` i ramka `Svg`
  (`@media (prefers-color-scheme)`) idą za wyglądem same; `inverseText` wykluczony. **Kolory surowe
  w `Box`/`Text` panelu nie mają drogi do wyglądu aplikacji** — sposób wyboru szaty rozstrzyga
  człowiek **na starcie tego etapu** (Zakres, punkt 1).
- **Aneks A:** trzy warianty wyglądu w prawdziwym nośniku (mod z przełącznikiem), oceniane
  w wyglądzie jasnym i ciemnym, różne kształtem już w stanie domyślnym (L-0197), na najdłuższych
  realnych danych; rundy poprawek do akceptacji zapisanej w dzienniku słowami Łukasza; turę przed
  zrzutem kończysz zwykłym tekstem, bez pola z pytaniem (P-041).
- **Paski nad promptem są zamknięte** (E1, E2): klucze motywu, `INK`, linia `barRule`, lista kroków
  postępu ze strojeniem jasnym `STEP_LIGHT_CSS` — nie ruszasz `panel/hooks/band.tsx`,
  `progress/`, `cache-keeper/` ani żadnej kopii `bar-card.tsx`.
- **Test kontrastu 4,5 : 1** dla każdej pary tekst–tło obu szat (plan, ryzyko 5); w E3 jako test,
  w E4 jeszcze raz na żywo.
- Wydanie pluginów i push wyłącznie w E4, po zgodzie Łukasza. `relai-panel` 0.18.0 (PANEL_WASKI)
  i zmiany E1–E3 wychodzą razem.
- **Granica zakresu:** E3 zmienia barwy panelu `/relai-panel` (zakładki, karty, nagłówki odręczne,
  panel agentów `/relai-agents` w `progress/` **nie** — ma własny motyw i zostaje do E4 jako
  pozycja „świadomie odłożone”, jeśli wymaga zmiany) i ich źródło w `core/panel/theme.mjs`. Macierz
  na żywo całego zestawu, brief w nowej wersji głównej i wydanie to E4.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.1.0; zainstalowane `relai-panel` 0.17.0 (z kodem E1 podłożonym ręcznie), `relai-progress`
0.4.2 (z kodem E1 **i E2** podłożonym ręcznie — oryginał w tagu wydania), `relai-cache-keeper` 0.9.0
(z kodem E1). W repo `relai-panel` 0.18.0 (PANEL_WASKI) i zmiany E1–E2, niewydane. Aplikacja
z Claude Code 2.1.295; testy binarką `%APPDATA%\Claude\claude-code\2.1.295\d2e29494ec83\claude.exe`
(na PATH inna wersja — P-024). Pomiar na żywo: kopię niewydaną podkładasz pod **inną nazwą** albo
do zainstalowanego pluginu z kopią oryginału w katalogu roboczym i zapisem w dzienniku (tak zrobił
E2), potem `/reload-plugins`.

```
core/panel/theme.mjs        # ROOT (paleta Warsztat), THEME (ciemna szata panelu, mix z ROOT), DIFF, KEY/INK/RULE (paski), STEP_LIGHT_CSS (E2)
core/panel/headings.mjs     # GENEROWANY przez core/tools/build-panel-headings.js z HEADINGS: Svg Kalam per nagłówek, kolor wpisany przy generacji
panel/hooks/register.tsx    # 1076 linii: hook Pane, zakładki, karty decyzji; czyta THEME
panel/hooks/pane-parts.tsx  # 241: heading, btn, frame, well, textAndAct, STACK_BELOW = 48 …
panel/hooks/pane-commands.tsx, pane-costs.tsx, pane-docs.tsx, pane-help.tsx, pane-map.tsx, pane-now.tsx  # zakładki
panel/hooks/theme.test.ts   # barwy i kontrast dzisiejszej szaty
panel/hooks/narrow.test.ts  # 419: model CSS szerokości (PANEL_WASKI)
```

`THEME.` występuje w `panel/hooks/*.tsx` 162 razy (FAKT 2026-10-15, `grep -c`). Testy (FAKT
2026-10-15, binarka aplikacji): `relai-panel` 188, `relai-progress` 41, `relai-cache-keeper` 181;
rdzeń `node --test core/{guardrails,panel,process}/tests/*.test.js` 386.

**Czego jeszcze nie ma (zakres tego etapu):** szaty jasnej panelu — palety wyprowadzonej z `ROOT`
dla wszystkich ról `THEME` (tło karty, tytuł, opis, akcent, linia, karta wybrana, wciśnięta);
nagłówków odręcznych w kolorach szaty jasnej; sposobu, w jaki panel wybiera szatę; testu kontrastu
obu szat; wariantów do oceny i akceptacji Łukasza.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-15):**

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
     obok siebie (L-0184).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`) (L-0116, L-0119, L-0135, L-0148, L-0188, L-0192, L-0198);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
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
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190)
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
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/WYGLAD_PANELU/E3/`.** Wszystko tymczasowe — mod
wariantów, zrzuty robocze, skrypty pomiarowe, worktree HEAD-a — powstaje tam. Artefakt, który
z natury musi leżeć **poza** projektem (`dev-mods` sesji, `%TEMP%`, zainstalowana kopia pluginu),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Pytanie startowe (Aneks B)** — zanim powstanie kod, jedno `AskUserQuestion` do Łukasza: jak
   panel wybiera szatę, skoro mod nie zna wyglądu aplikacji (P-042). Opcje z konsekwencją każdej:
   (a) przełącznik „Wygląd panelu: ciemny / jasny” w zakładce Pomoc, zapis w `$.store`, domyślnie
   ciemny — panel zostaje w barwach Warsztatu, ale nie przełącza się sam; (b) tła i teksty panelu na
   kluczach motywu, a Warsztat tylko w akcentach i w `Svg` (nagłówki, ikony, wykresy przez
   `prefers-color-scheme`) — przełącza się sam, ale część charakteru znika; (c) inny pomysł
   Łukasza. Odpowiedź do wpisu dziennika jego słowami; przy (b) sprawdź, czy nie przeczy wariantowi
   A planu — przeczy → sygnał odchylenia (aneks), nie decyzja „przy okazji”.
2. **Szata jasna w `core/panel/theme.mjs`** — paleta z `ROOT` dla każdej roli `THEME` (nazwy ról
   bez zmian, druga szata obok, np. `THEMES.dark` / `THEMES.light` albo równoważnie — kod zakładek
   pyta o rolę, nie o kolor); dostrojenie odmiany daltonized wg sekcji 8 planu, jeśli wybrany
   sposób pozwala ją rozpoznać; kopie przez `node core/tools/sync-panel-core.js`.
3. **Nagłówki odręczne** — w kolorach szaty jasnej przez `core/tools/build-panel-headings.js`
   (generowany `headings.mjs` nie jest edytowany ręcznie); przy sposobie (b) — `Svg` z obiema
   paletami w CSS jak paski (P-042).
4. **Wybór szaty w panelu** — `panel/hooks/register.tsx` i `pane-*.tsx` według odpowiedzi z punktu
   1; przy przełączniku — przycisk w Pomocy (zasada „UI zamiast komend”), wartość w `$.store`,
   kontrakt w `panel/types/index.d.ts`.
5. **Trzy warianty jasnej szaty** (Aneks A) w prawdziwym nośniku — mod `relai-szata-warianty`
   w `dev-mods` sesji z przełącznikiem, na realnych danych projektu (najdłuższe nazwy dokumentów
   i komend, L-0197), w pełnym oknie i w wąskim panelu podziału; warianty różne kształtem
   powierzchni (np. kartka z cieniem linii / karty na tle `tlo` / jedna kartka bez kart), nie
   odcieniem. Zrzuty `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E3_*`; każda runda słowami
   Łukasza do notatek w katalogu roboczym.
6. **Testy** — `panel/hooks/theme.test.ts`: kontrast 4,5 : 1 każdej pary tekst–tło w obu szatach
   (kontrola pozytywna: para podłożona poniżej progu spada); `narrow.test.ts` zielony w obu
   szatach; testy nowego zachowania (wybór szaty, przełącznik albo klucze) spadają na kodzie sprzed
   zmiany (`git worktree` HEAD-a, L-0151) i przechodzą po niej — obie wersje w jednym przebiegu.
7. **Brief** `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` — nowa sekcja o szacie jasnej panelu
   (paleta, sposób wyboru, słowa Łukasza), wersja w nagłówku i wiersz w `docs/ARTEFAKTY.md`;
   wynik pytania z punktu 1 jako P-xxx w `docs/PULAPKI.md`, jeśli odsłonił nowe zachowanie silnika.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_3.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Odpowiedź Łukasza na pytanie startowe (sposób wyboru szaty) zapisana jego słowami we wpisie
      dziennika przed pierwszą zmianą kodu panelu.
- [x] Trzy warianty jasnej szaty pokazane w prawdziwym nośniku, w pełnym oknie i w wąskim panelu
      (zrzuty `WYGLAD_PANELU_E3_*`); wybór, każda runda i akceptacja wyglądu zapisane w dzienniku
      słowami Łukasza.
- [x] Na żywo: siedem zakładek panelu w szacie jasnej i ciemnej, pełne okno i wąski panel podziału,
      bez przepełnień; przełączenie szaty wybranym sposobem działa bez restartu.
      *(2026-10-15: panel ma dziś pięć zakładek — wszystkie w obu szatach (r6), rozwinięte (r7)
      i w wąskim panelu 530 px (r8); szata przełącza się z wyglądem aplikacji, bez restartu.)*
- [x] `panel/hooks/theme.test.ts`: każda para tekst–tło obu szat ≥ 4,5 : 1, z kontrolą pozytywną na
      podłożonej parze poniżej progu; `narrow.test.ts` zielony w obu szatach.
      *(2026-10-15: pary kontrastu sprawdza `core/panel/tests/theme.test.js` — rdzeń szaty mieszka
      w `core/panel/theme.mjs`, kopie z `sync-panel-core.js`.)*
- [x] Testy nowego zachowania spadają na kodzie sprzed zmiany i przechodzą po niej (obie wersje
      w jednym przebiegu); `claude plugin validate .` i `claude plugin test .` w `panel/` zielone
      binarką aplikacji; `progress/` 41 i `cache-keeper/` 181 zielone; rdzeń 386+ zielony;
      `sync-panel-core.js --check` zgodne.
      *(2026-10-15: panel 197, rdzeń 409, na HEAD 10 testów panelu i plik testów szaty rdzenia
      spadają.)*
- [x] `git diff` nie dotyka `panel/hooks/band.tsx`, `progress/hooks/` (poza kopią rdzenia
      `progress/hooks/core/`), `cache-keeper/hooks/` (poza kopią `cache-keeper/hooks/relai/`),
      żadnej kopii `bar-card.tsx`, `docs/plany/PANEL_CODEX/` ani `docs/zasoby/PANEL_RELAI/makiety/`
      (`git diff --stat` w dzienniku).
      *(2026-10-15: zmiany w `docs/plany/PANEL_CODEX/` i `makiety/` w drzewie pochodzą z sesji
      Codeksa, nie z E3 — commit etapu ich nie obejmuje.)*
- [x] Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (mod wariantów w `dev-mods`, kopia
      podłożona do zainstalowanego pluginu, pliki w `%TEMP%`) wypisane z nazwy razem z tym, co się
      z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/WYGLAD_PANELU/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_4.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E3/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu (mod wariantów, kopia podłożona) z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk; lekcje z etapu do `docs/LEKCJE.md`
   i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan planu WYGLAD_PANELU; `STYL_PASKOW_CLAUDE.md` i `ARTEFAKTY.md`, jeśli
   jeszcze nie.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` sekcja 6 (E4 — odbiór całości i wydanie: macierz na żywo motyw jasny i ciemny ×
   trzy szerokości × paski i panel, brief STYL w nowej wersji głównej, wydanie trzech pluginów po
   zgodzie), sekcji 9 (zgoda na wydanie), realnego stanu po tym etapie (także odłożonych pozycji
   E2: `SEGMENT_INK` nieużywany, panel agentów `/relai-agents` w motywie) i lekcji z tego etapu.
6. Commit — propozycja, conventional message, bez plików PANEL_CODEX i makiet.
