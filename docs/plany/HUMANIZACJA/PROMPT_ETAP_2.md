# PROMPT_ETAP_2 — wywiad przy pierwszym `/relai-humanize`, ustawienia w trzech warstwach i profil stylu autora

Plan: HUMANIZACJA • Etap: **E2 z E5** • Wygenerowano: 2026-10-14 (autor: Opus 5.5, w rytuale „Na koniec” etapu E1) • Wykonawca: **Opus 5.5** (STATUS.md: „Opus 5.5 w świeżych sesjach”), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (trzy warstwy ustawień z pierwszeństwem, dwa okna wywiadu i profil stylu z cudzych danych
> mają przypadki brzegowe, których nie widać na jednym przebiegu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, profil `prompty` (rejestr `ARTEFAKTY.md`), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (przepisane też niżej) i lekcje L-0185, L-0186 |
| `docs/plany/HUMANIZACJA/PLAN.html` | sekcje 5 (wywiad, ustawienia), 6 (E2), 8 (przypadki: sesja nieinteraktywna, folder bez RelAI, Cursor i Codex, próbka z danymi osobowymi), 10 (Aneks A — A1–A5) |
| `docs/DZIENNIK.md` | ostatni wpis (E1 HUMANIZACJA) — co zmierzono i co odłożono |
| `adapters/claude-code/commands/relai-humanize.md` | komenda z E1, którą ten etap rozszerza (202 linie, 11,6 KB) |
| `core/process/threshold.js` + `core/process/tests/threshold.test.js` | wzór trzech warstw: plik sesji → wiersz projektu → wiersz globalny → domyślny, zwrot `{ value, source }` |
| `core/process/prompt-mode.js` | wzór wiersza czytanego maszynowo (kotwica, zamknięta lista brzmień) i zapisu zgody na sesję |
| `core/templates/SPEC_USTAWIENIA.md` | sekcje „Wiersz to jedna decyzja”, tabela „Wiersz \| Czyta go”, „Wpisy tworzone przy inicjalizacji” |
| `docs/ARTEFAKTY.md` | sekcja „Baza reguł humanizacji” i wiersz `/relai-humanize` — wzór podbicia wersji |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Wariant A planu** i baza `core/humanize/` z E1 (26 wzorców, nakładka PL, nota MIT) — bez zmian
  merytorycznych w regułach; ten etap dokłada ustawienia i profil, nie przepisuje bazy.
- **Wywiad raz na projekt, przy pierwszym wywołaniu**, gdy w żadnej warstwie nie ma wiersza
  „Humanizacja”. Najpierw pokaz na próbce (tekst podany przez użytkownika, a gdy go nie ma —
  akapit „Gdzie jesteśmy” ze `STATE.md` albo pierwszy akapit `README.md`), potem **dwa okna**
  (Aneks A4): pierwsze — zakresy trybu ciągłego (dokumenty / czat / teksty na zewnątrz, wielokrotny
  wybór; brak zaznaczenia = „tylko na żądanie”), sposób pokazywania („notka” albo „dwie wersje”;
  pytanie mówi wprost, że czat zawsze idzie bez akceptacji), zasięg zapisu (ta sesja / ten projekt /
  wszystkie projekty); drugie — ton dla każdego rodzaju tekstu (Aneks A1, przypisanie wbudowane
  widoczne i zmienialne) oraz profil stylu (budować czy nie, z jakiego źródła, w których rodzajach
  tekstu).
- **Pierwszeństwo warstw jak w optymalizatorze i `threshold.js`:** plik sesji → wiersz projektu
  (`docs/USTAWIENIA.md`) → wiersz globalny (`~/.claude/relai/USTAWIENIA.md`) → „wyłączona, tylko na
  żądanie”. Wartość spoza zamkniętej listy = cisza, nie zgadywanie (zasada 7).
- **Profil stylu (Aneks A2, A3):** całkowicie opcjonalny; plik `~/.claude/relai/STYL.md` poza
  repozytorium, nadpisanie projektowe `docs/zasoby/STYL.md` tylko na wyraźną prośbę. Do profilu
  trafia opis cech (ulubione słowa i zwroty, długość zdań, sposób zaczynania, czego autor unika),
  **nigdy surowe teksty** i żaden cytat dłuższy niż pojedynczy zwrot. Profil bierze z mowy rytm
  i charakterystyczne sformułowania, nie przenosi potknięć, powtórzeń ani ubogiego słownictwa.
  Domyślnie działa w czacie i w wiadomościach do zespołu, w dokumentach formalnych nigdy, chyba że
  użytkownik sam to włączy.
- **Pierwszy profil z logów PolyFlow Łukasza (Aneks A5):** logi czytane lokalnie, nic z nich nie
  trafia do repozytorium; z RelAI wychodzi ogólny mechanizm „wskaż pliki”, bez zależności od
  PolyFlow. Lokalizacji i formatu logów **nie znasz** — pytasz Łukasza (rozpoznanie odłożone z dnia
  akceptacji planu do tego etapu).
- **Zapis przez skrypt, nie przez narzędzie Write (L-0185):** zapis pliku sesji i wierszy ustawień
  pod `.claude/` i w `docs/USTAWIENIA.md` robi CLI rdzenia wołane jednym poleceniem `node …`; harness
  odrzuca Write pod `.claude/` w `claude -p` i pyta o zgodę w sesji interaktywnej.
- **Sesja nieinteraktywna** (`claude -p`, agent w tle) i pierwsze wywołanie: bez wywiadu, działa
  „tylko na żądanie”, nic się nie zapisuje. **Folder bez RelAI:** wywiad oferuje tylko „ta sesja”
  albo „wszystkie projekty”. **Cursor i Codex:** pytania o zakresy trybu ciągłego nie ma; wywiad
  pyta o sposób pokazywania, ton i profil.
- **Granica zakresu:** hooki trybu ciągłego, ściąga `SKROT.md`, wyłączenia ścieżek w hooku → E3;
  tryby „ustawienia / włącz / wyłącz” w formularzu panelu, powrót zakładki komend do 900 px,
  `KOMENDY.md`, `SPEC_KOMENDY.md`, liczby komend w opisach, nota MIT w `README.md`, kontrola noty
  w walidatorze → E4; korpus 8 tekstów, pomiar kosztu, wydanie → E5. Odnoga FILM_TESTY_V3 jest
  osobnym wątkiem — nie ruszasz testów filmu.

## Stan wyjściowy (co realnie zastajesz)

E1 zamknięty 2026-10-14: komenda `/relai-humanize` działa na żądanie (tekst albo plik w projekcie),
wynik w czterech częściach, strażnik faktów przez stdin z losowym terminatorem heredoku, kopia reguł w `.claude/relai/humanize/`
i strażnik w `.claude/relai/tools/` przy każdym starcie sesji. Ustawień humanizacji **nie ma**:
komenda nie czyta żadnego wiersza i niczego nie zapisuje. RelAI 3.0.0 zainstalowany na stałe
(scope `user`) — zmiany w repo mierzysz komendą podłożoną pod **inną nazwą**
(`.claude/commands/relai-humanize-probe.md`) albo `--plugin-dir <repo>` z
`--settings '{"enabledPlugins":{"relai@relai":false}}'` (zmierzone w E1). Świeże sesje `claude -p`
z Basha aplikacji wymagają zalogowanego CLI (P-032; w E1 Łukasz zalogował je ręcznie).

Testy: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js
core/panel/tests/*.test.js adapters/codex/tests/*.test.js` → **356** (FAKT, 2026-10-14); walidator
`node core/tools/validate-adapters.js` spójny z jednym ostrzeżeniem zastanym; `claude plugin test`
binarką aplikacji 2.1.295 (`$CLAUDE_CODE_EXECPATH`): panel 178, progress 31, cache-keeper 178.
Testy filmu: 31/36, pięć błędów zastanych (odnoga FILM_TESTY_V3) — nie są kryterium tego etapu.

```
adapters/claude-code/commands/relai-humanize.md   # komenda E1: Kroki 0–9, bez ustawień i wywiadu
adapters/codex/skills/relai-humanize/             # skill generowany z komendy (generate-skills.js)
core/humanize/REGULY.md, jezyki/pl.md             # baza reguł i nakładka (ton per rodzaj tekstu — sekcja na końcu pl.md)
core/humanize/LICENSE-humanizer.md                # nota MIT
core/process/humanize-facts.js                    # strażnik faktów (pliki, "-", --stdin)
core/process/session-signals.js                   # provisionHumanize, NARZEDZIA (humanize-facts.js)
core/process/threshold.js, prompt-mode.js         # wzory warstw ustawień i zgody sesji
core/templates/SPEC_USTAWIENIA.md                 # bez wiersza „Humanizacja”
core/MANIFEST.json                                # sekcja humanize, humanize-facts w process
~/.claude/relai/USTAWIENIA.md                     # ustawienia globalne Łukasza (bez wiersza „Humanizacja”)
```

**Czego jeszcze nie ma (to jest zakres tego etapu):** rdzenia ustawień humanizacji z CLI zapisu,
wiersza „Humanizacja” w specyfikacji ustawień, wywiadu i pokazu na próbce w komendzie, argumentów
`ustawienia`, `on`, `off`, opisu formatu profilu stylu, mechanizmu budowania profilu ze wskazanych
plików, pierwszego profilu `~/.claude/relai/STYL.md` z logów PolyFlow.

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
     z `/`; skrypt edycji niosący `\n` lub ścieżkę — Write, heredok bez wyjątku (L-0116, L-0119,
     L-0135, L-0148); wynik sprawdzasz grepem stałego ciągu.
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
   przez model: plik na zapisującego, bez scalania. Fakt rozstrzygnięty idzie do subagenta jako
   rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik doczytywany dla klasy
   `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy frazie z promptu; krok
   wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128)
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

> **Katalog roboczy tego etapu: `.claude/relai/work/HUMANIZACJA/E2/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`core/process/humanize-mode.js`** — rdzeń ustawień, Node bez zależności, samowystarczalny
   (kopiowany do `.claude/relai/tools/` przez `NARZEDZIA` w `session-signals.js`): odczyt wiersza
   „Humanizacja” (kotwica na początku komórki, człony po `·`, zamknięta lista brzmień PL i EN:
   stan, zakresy, pokaz, ton per rodzaj, profil i jego rodzaje), trzy warstwy z pierwszeństwem
   i zwrotem `{ value, source }`; **CLI zapisu** (sesja / projekt / globalnie; istniejący wiersz
   nadpisany, nie zdublowany; brak pliku globalnego → plik z tabelą `| Data | Czego dotyczy |
   Decyzja |`). Plik sesji w osobnym katalogu `.claude/relai/` (nie w `humanize/`, który
   nadpisuje start sesji), identyfikator sesji walidowany jak w `threshold.js`.
2. **`core/process/tests/humanize-mode.test.js`** — pierwszeństwo warstw na każdej parze; wartość
   spoza listy = cisza; wiersz pod nagłówkiem wycofanym nie rozstrzyga; zapis nie dubluje wiersza
   i nie rusza innych wierszy (dowód negatywny: suma reszty pliku przed i po); scenariusz „pliku
   globalnego nie ma” z podstawionym katalogiem domowym (zasada 5); kontrola pozytywna każdego
   „cisza”.
3. **`adapters/claude-code/commands/relai-humanize.md`** — kroki: rozpoznanie ustawień (CLI z kroku
   1); brak wiersza w każdej warstwie i sesja interaktywna → pokaz na próbce i dwa okna wywiadu
   (decyzje wyżej), zapis przez CLI; argumenty `ustawienia` (wywiad od nowa), `on`, `off` (jak Krok
   0a `/relai-prompt`); sesja nieinteraktywna i folder bez RelAI wg decyzji wyżej; przypadek
   Cursora i Codeksa; profil stylu stosowany tylko w rodzajach tekstu wskazanych w ustawieniach.
   Rozmiar: do 480 linii i 20 KB (progi walidatora). Potem `node adapters/codex/generate-skills.js`.
4. **Profil stylu** — opis formatu i procedury budowy w `core/humanize/` (np. `PROFIL_STYLU.md`;
   kopiowany do projektu z resztą bazy): sekcje cech, zakaz cytatów dłuższych niż jeden zwrot,
   źródła (wklejony tekst / wskazane pliki / logi dyktowania), kontrola sekretów i danych osobowych
   przed zapisem, zakres rodzajów tekstu. Odwołanie z komendy (krok budowy profilu w drugim oknie
   wywiadu albo `ustawienia`).
5. **Pierwszy profil Łukasza** — `~/.claude/relai/STYL.md` z logów PolyFlow: zapytaj o lokalizację
   i format logów, czytaj lokalnie, materiał pośredni wyłącznie w katalogu roboczym etapu, profil
   pokazany Łukaszowi przed zapisem. Nic z logów w repozytorium.
6. **`core/templates/SPEC_USTAWIENIA.md`** — wiersz „Humanizacja”: brzmienia wartości, przykład,
   wiersz w tabeli „Wiersz | Czyta go”; wiersz **nie** powstaje przy inicjalizacji (wywiad przy
   pierwszym użyciu). `core/MANIFEST.json` — nowe pliki rdzenia.
7. **`docs/ARTEFAKTY.md`** — `/relai-humanize` v2, `SPEC_USTAWIENIA.md` +1, nowe pozycje (profil
   stylu), każda z „co i po co”.
8. **Dogfooding** — komenda podłożona pod inną nazwą: przebieg nieinteraktywny `claude -p` (bez
   wywiadu, nic zapisane) i przebieg interaktywny z Łukaszem (wywiad, zapis, drugie wywołanie bez
   pytania). Podłożony plik kasujesz.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_2.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js` — zero błędów; liczba testów przed (356 — FAKT) i po do wpisu.
- [x] `node core/tools/validate-adapters.js` — zero błędów, parytet skilli Codeksa 0 rozjazdów; ostrzeżenia wypisane we wpisie (komenda poniżej 480 linii i 20 KB).
- [x] `claude plugin test` binarką aplikacji dla `panel/`, `progress/`, `cache-keeper/` — 178 / 31 / 178 bez zmian (etap nie dotyka panelu).
- [x] Rdzeń ustawień: każda para warstw rozstrzyga pierwszeństwo zgodnie z decyzją; wartość spoza listy = cisza z kontrolą pozytywną w tym samym przebiegu; zapis nie dubluje wiersza, a reszta pliku ma sumę przed = po.
- [x] Przebieg `claude -p` z podłożoną komendą w projekcie bez wiersza „Humanizacja”: brak wywiadu, wynik na żądanie, `git status --short docs/USTAWIENIA.md` pusty, `~/.claude/relai/USTAWIENIA.md` z tą samą sumą przed i po.
- [x] Przebieg interaktywny z Łukaszem: pokaz na próbce, dwa okna, jeden wiersz „Humanizacja” w wybranej warstwie (treść wiersza do wpisu), drugie wywołanie bez pytań; `ustawienia` uruchamia wywiad od nowa; `on` / `off` zmieniają tylko ten wiersz.
- [x] Profil `~/.claude/relai/STYL.md`: kontrola skryptem, że żaden ciąg 6+ słów z logów nie występuje w profilu (z kontrolą pozytywną na podłożonym cytacie); skan sekretów bez trafień; `git status --short` nie pokazuje niczego z logów.
- [x] `git grep -nE "sk-ant-[a-z0-9]+-[A-Za-z0-9_-]{20,}|sk_(test|live)_[A-Za-z0-9]{10,}"` — 0 trafień, z kontrolą pozytywną na próbce złożonej w czasie wykonania (cytaty samego wzorca w dokumentach nie są trafieniem, L-0185).
- [x] `docs/ARTEFAKTY.md` ma podbite i nowe wpisy; `git status --short` nie pokazuje plików spoza zakresu (zmiany PANEL_CODEX i `docs/zasoby/PANEL_RELAI/makiety/` sprzed etapu — nietknięte).
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md` nadpisany.
- [x] Katalog roboczy `.claude/relai/work/HUMANIZACJA/E2/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (podłożona komenda `.claude/commands/relai-humanize-probe.md`, pliki w `%TEMP%`, materiał pośredni z logów) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/HUMANIZACJA/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_3.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/HUMANIZACJA/E2/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, podłożona komenda i pliki spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę ryzyk (H1–H8 planu); lekcje z etapu →
   `docs/LEKCJE.md` i odświeżone „Zasady aktywne” (limit 15).
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — „Nad czym pracujemy teraz” (plan HUMANIZACJA po E2) i „Co działa” (wywiad
   i ustawienia); `README.md` bez zmian, chyba że zmienił się sposób uruchomienia.
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` sekcja 5 (tryb ciągły: reguła przed odpowiedzią, hook po zapisie dokumentu) i 6 (E3),
   ryzyk H2, H3, H5, H6, realnego stanu po tym etapie i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku.
