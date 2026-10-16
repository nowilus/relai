# PROMPT_ETAP_1 — Fundament strony i hero „Biurka” w three.js

Plan: STRONA_RELAI • Etap: **E1 z E5** • Wygenerowano: 2026-10-16 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (pierwsze ujęcie sceny 3D kalibruje gust całego planu, a fundament niesie cztery
> kolejne etapy).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | wpis 2026-10-16 „Plan STRONA_RELAI: wywiad, szkice…” — wszystkie decyzje wywiadu |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcje 2 (cele), 4 (warianty A–F), 5 (jak działa), 6 (zakres E1), 7 (ryzyka 1, 2, 7, 10), 8 (przypadki brzegowe) |
| skill `nateherk-design:scroll-craft` (wywołaj narzędziem Skill) | cały `SKILL.md`, potem z `references/`: `hero-depth.md`, `approved-collection.md`, `uniqueness.md` §2.4 „Continuous world”, `worldflight.md` §4 i §7c (kontrakt tekstu, tempo), `feel.md`, `taste.md` |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | paleta „Warsztat”, nastrój „wigor”, czego nie robić |
| `core/panel/theme.mjs` | tokeny `ROOT` (kolory) — jedyne źródło barw strony |
| `docs/zasoby/film/kalibracja/E1-klatka.png` | wzorzec „Warsztat z wigorem”: ciemne okno, kremowy papier w kropki, Kalam na karteczce z taśmą, ręczna obwódka |
| `.claude/relai/work/STRONA_RELAI/szkice/s3-jeden-swiat.html` i `konfigurator.js` | zaakceptowany szkic struktury (przystanki, mapa, konfigurator na laptopie) i logika komend do przeniesienia |
| `docs/INSTALACJA.md` | komendy instalacji i aktualizacji w brzmieniu dosłownym |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Struktura:** „Jeden świat: biurko” — gramatyka scroll-craft *Continuous world*: jedna stała
  scena, przystanki zamiast sekcji, nawigacja to klikalna mapa biurka, koniec to konfigurator na
  ekranie laptopa w scenie (wywiad 2026-10-16, PLAN sekcja 4A). Prototyp „Film” to E3.
- **Słowa Łukasza do BRIEF.md (dosłownie):** „musiałoby to być naprawdę tak dopracowane […]
  wszystkie te takie elementy całego otoczenia biurka, wszystko musiało być tak pięknie graficznie
  w tym FreeJS-ie dostosowane, żeby było z takim mega efektem wow”; „nie może być tam przeładowana
  informacjami, nie może zniechęcać na wejściu”; szczegóły: „użytkownik może sam sobie poklikać po
  tych elementach i te elementy […] otwierają się w jakiś animowany sposób”. Szczyt: „Bałagan
  układa się w porządek”. Krzywa: „Cicho, jeden szczyt, spokój”. Odbiorcy: programiści solo
  i osoby nietechniczne prowadzące projekt z AI.
- **Technologia:** three.js — WebGL dla biurka, papieru, lampy i miękkich cieni; każdy tekst
  (przystanki, szuflady, ekran laptopa) to prawdziwy HTML zsynchronizowany z kamerą (CSS3D albo
  projekcja pozycji). Geometria proceduralna, zero modeli zewnętrznych (PLAN 4B).
- **Budowanie:** moduły ES bez bundlera, mapa importów, three.js w `site/vendor/three/` z plikiem
  licencji i przypiętą wersją; skrypty Node bez zależności npm (PLAN 4C). Akceptacja planu jest
  zgodą na tę jedną zależność; każda inna nowa zależność — pytanie.
- **Grafika z kodu:** zero generowanych zdjęć i klipów (bez Kie.ai), logo i 15 ikon z
  `docs/zasoby/branding/`, fonty z `docs/zasoby/fonts/` jako własne pliki WOFF2, zero CDN
  (wywiad 2026-10-16; `docs/USTAWIENIA.md` „Fonty… zero CDN”).
- **Wygląd:** D-61a — wolno zaokrąglenia, lekki glassmorphism, typografia ozdobna, dekoracyjne
  SVG; zakazane fioletowe gradienty i poświata, przesyt emoji, generyczne frazy, stocki. D-61b —
  terminal/konsola, panel administracyjny, rysunek techniczny/blueprint i plakat brutalistyczny nie
  wracają ani jako wariant, ani jako inspiracja (świat „Technical drawing” ze scroll-craft też
  odpada). Kierunek „Warsztat z wigorem” (`docs/USTAWIENIA.md`, 2026-10-12): Fraunces w tytule,
  Kalam w notatkach, Hanken Grotesk w treści; ruch wyłącznie z przewijania i kliknięcia, zero
  pętli ozdobnych.
- **Języki:** angielska strona pod `/`, polska pod `/pl/`, para `hreflang`; pierwsza wizyta
  z przeglądarką `pl*` trafia na `/pl/`, ręczny wybór zapamiętany w `localStorage` (PLAN 8).
- **Konfigurator:** tryb (instaluję / aktualizuję) × narzędzie (Claude Code / Cursor / Codex) ×
  składniki (RelAI, panel, pasek postępu, baterie i limity); komendy do skopiowania; dla Claude
  Code dodatkowo `claude-cli://open?q=…` i `claude://code/new?q=…` z poleceniem w języku
  naturalnym **bez wiodącego „/”** (P-033: aplikacja zamienia je na „／”); link nigdy nic nie
  wykonuje sam (PLAN 4E i 8).
- **Wersja:** źródło główne to wartość wpieczona (z plików repo), przeglądarka tylko sprawdza
  nowszą w API GitHuba, filtrując po prefiksie tagu: `v` = RelAI, `relai-panel-v` = pluginy
  panelu; nigdy samo „Latest” (dziś wskazuje panel) (PLAN 4F i 8).
- **Liczby na stronie:** tylko z repozytorium (komendy, wersje, adaptery); bez wymyślonych
  statystyk i liczników (zasada 2, `taste.md`).
- **Granica zakresu:** E1 = fundament + hero na gotowo + cała droga zgrubnie. Szczyt
  „bałagan → porządek”, szuflady po kliknięciu i makiety pasków z kodu pluginów to **E2**; prototyp
  Film to **E3**; telefon, pełny wariant reduced motion i plakat bez WebGL to **E4**; workflow
  Pages, publikacja, link w README i krok w sekwencji wydania to **E5**. Nie włączasz Pages,
  nie pushujesz, nie publikujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 i pluginy panelu 0.20.0 / 0.5.0 / 0.11.0 są wydane (tagi `v3.2.0`,
`relai-panel-v0.20.0`). Strony nie ma; repo `nowilus/relai` publiczne, GitHub Pages wyłączone.
Plan STRONA_RELAI zaakceptowany 2026-10-16 bez poprawek.

```
docs/plany/STRONA_RELAI/PLAN.html       # plan (zamrożony), STATUS.md obok
docs/zasoby/branding/                   # logo.svg, banner.svg, diagram.svg, ikony/ (15 SVG komend), zrodla/
docs/zasoby/fonts/                      # Fraunces (wonk), Hanken Grotesk, Kalam 400/700, Caveat, Instrument Sans, JetBrains Mono; LICENCJE.md
core/panel/theme.mjs                    # ROOT: tlo #f2e9d8, kartka #fffdf7, txt #312c25, glina #c4643c, musztarda #d9a134, szalwia #5f8a68 …
adapters/claude-code/commands/*.md      # 15 komend (FAKT) — źródło listy komend i opisów
.claude-plugin/marketplace.json         # wersje czterech pluginów
.claude/relai/work/STRONA_RELAI/szkice/ # cztery szkice struktur + konfigurator.js (poza repo)
.claude/launch.json                     # konfiguracja podglądu szkiców (port 4510), plik lokalny
```

Skill scroll-craft 0.3.1 leży w
`C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/`
(silnik `engine/`, serwer `scripts/serve.mjs`, harness `scripts/shoot.mjs`, preflight
`scripts/doctor.mjs`). Rejestru fingerprintów jeszcze nie ma (`.scrollcraft.json` brak).

**Warunki pracy:** podgląd przez `mcp__Claude_Browser__preview_start` z konfiguracją z
`.claude/launch.json`; uruchomienie serwera komendą dla ścieżki w `.claude/` zostało przez
aplikację odrzucone („cwd must be a relative path”), dla `site/` dopisz konfigurację z
`runtimeExecutable: node` i sprawdź; w razie odmowy serwer w tle przez Bash i konfiguracja z samym
`url`. Edycja pliku HTML otwiera go w panelu jako osobną kartę `file://` — przy limicie kart zamykaj
stare (`tabs_close`).

**Czego jeszcze nie ma (to jest zakres tego etapu):** katalogu `site/`, BRIEF.md, rejestru
fingerprintów, treści PL/EN, faktów z repo, konfiguratora i modułu wersji w wersji docelowej,
three.js w repo, sceny biurka, hero, drogi kamery i mapy.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-16):**

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
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210);
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
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E1/`.** Wszystko tymczasowe —
> skrypty pomiarowe, zrzuty, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: gust, kompozycja, światło, ruch, typografia i tekst robisz sam (Opus). Do trzech
subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie zadania z punktów 3, 4 i 5
— deterministyczne, z testami, sprawdzane przez Ciebie przed przyjęciem.

1. **`.scrollcraft.json`** (korzeń repo) z `{ "workspace": "docs/zasoby/STRONA" }`, potem
   `node <skill>/scripts/workspace.mjs --ensure` → `docs/zasoby/STRONA/FINGERPRINTS.md`;
   `node <skill>/scripts/doctor.mjs` — wynik do wpisu, braki nazwane wprost.
2. **`docs/zasoby/STRONA/builds/biurko/BRIEF.md`** wg `SKILL.md` Step 0: osiem tematów
   z odpowiedziami z wywiadu (dosłownie tam, gdzie są słowa Łukasza; reszta oznaczona jako
   decyzja autorska), krzywa odczuć na siedem przystanków, szczyt jako zdanie do znajomego,
   „It's the site where ___”, zaplanowana cisza; gramatyka i dlaczego siedem innych przegrało;
   ruch-podpis (szczyt „bałagan → porządek” jako sygnatura); wynik bramki fingerprint (rejestr
   pusty) i kontrakt warstw hero (`approved-collection.md` §2).
3. **Fakty z repo** — `site/narzedzia/fakty.mjs` (Node, zero zależności) → `site/dane/fakty.json`:
   lista komend (nazwa + pierwsze zdanie opisu z frontmattera `adapters/claude-code/commands/*.md`),
   wersje czterech pluginów z `.claude-plugin/marketplace.json` i `plugin.json`, liczba adapterów;
   test `site/narzedzia/fakty.test.mjs`. *(subagent)*
4. **Logika w JS z testami** — `site/js/konfigurator.js` (czysta funkcja: wybór → komendy +
   prompt; `encodeURIComponent`; prompt bez wiodącego „/” i ≤ 5000 znaków; Cursor/Codex bez
   linków), `site/js/wersja.js` (wartość wpieczona + sprawdzenie API po prefiksie tagu, limit
   czasu, pamięć `sessionStorage`, cicha porażka, wstawianie przez `textContent`),
   `site/js/jezyk.js`; testy `node --test` dla wszystkich kombinacji konfiguratora i atrapy
   `fetch` dla wersji. *(subagent)*
5. **Generator stron** — `site/narzedzia/zbuduj.mjs`: jeden szablon + `site/tresc/en.json`
   i `site/tresc/pl.json` → `site/index.html` i `site/pl/index.html` (para `hreflang`,
   `lang`, meta, cała treść w semantycznym HTML także bez JS); test zgodności „wygenerowane =
   zapisane”. *(subagent; treść JSON piszesz sam)*
6. **Treść PL i EN** — `site/tresc/pl.json`, `site/tresc/en.json`: nagłówek hero (max dwie
   linie), zdanie pod nim (max 20 słów), jedna etykieta wezwania używana wszędzie, teksty siedmiu
   przystanków po 1–2 zdania; bez myślnika w widocznym tekście (`SKILL.md`, Hard rules), bez
   słów-wypełniaczy; wersja EN oznaczona w dzienniku jako „do przeglądu native speakera” (PLAN 9).
7. **three.js w repo** — przypięta wersja w `site/vendor/three/` (`three.module.min.js` + tylko
   potrzebne dodatki) z `LICENSE` i `VERSION`. **Zatrzymaj się i zapytaj przed pobraniem:** nazwa
   pliku, źródło (npm albo wydanie na GitHubie), rozmiar.
8. **Scena biurka i hero na gotowo** — `site/biurko/*.js` (scena, obiekty proceduralne, światło,
   kamera, warstwa tekstu, mapa), `site/css/strona.css` (tokeny z `core/panel/theme.mjs`, fonty
   z `site/fonty/` z licencją). Hero: kontrakt warstw z BRIEF.md — co najmniej trzy plany
   o widocznie różnej prędkości (np. blat i ściana z oknem daleko, dokumenty i lampa w środku,
   kartka-logo na pinezce jako obiekt główny, rozmyty przedmiot na pierwszym planie), jedno ciepłe
   źródło światła, miękkie cienie, ziarno papieru i drewna; nagłówek w całości czytelny, wezwanie
   widoczne bez przewijania. Zakaz low-poly, gliny i plastiku (`worlds.md`).
9. **Droga zgrubnie** — przystanki 2–7 ze szkicu: kamera z postojem na każdym, teksty przystanków
   w stałej warstwie HTML, mapa biurka klikalna (fokus klawiatury), konfigurator na ekranie
   laptopa działający; obiekty przystanków 2–7 mogą być uproszczone (dopracowanie w E2).
10. **Minimum bez WebGL** — brak kontekstu WebGL → treść HTML i konfigurator widoczne, krótka
    informacja zamiast płótna, zero błędów w konsoli (pełny plakat w E4).
11. **Budżet wydajności** — pomiar mediany czasu klatki i rozmiaru przesłanego JS na hero przy
    1366 × 768, DPR 1; limit gęstości pikseli i pauza renderu poza ekranem już w E1.
12. **`site/README.md`** — jak zbudować strony z treści, jak uruchomić lokalnie, co zrobić przy
    wydaniu (krótko; pełny krok w sekwencji wydania to E5).

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_1.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test site/` kończy się bez błędów; test konfiguratora obejmuje wszystkie kombinacje
      (2 tryby × 3 narzędzia × 16 zestawów składników = 96 `FAKT`) i przypadek „nic nie wybrano”.
      *(2026-10-16: w Node 24 forma katalogowa `node --test site/` kończy się „Cannot find module”
      dla każdej treści; przebieg zrobiony odpowiednikiem `node --test "site/**/*.test.mjs"` — rozjazd
      instrumentu w dzienniku.)*
- [x] `node site/narzedzia/fakty.mjs` daje w `site/dane/fakty.json` tyle komend, ile plików
      w `adapters/claude-code/commands/` (dowód: obie liczby w wpisie), a wersje równe wartościom
      z `.claude-plugin/marketplace.json`.
- [x] `node site/narzedzia/zbuduj.mjs` generuje `site/index.html` i `site/pl/index.html` z parą
      `hreflang`, bez niewypełnionych znaczników; ponowne uruchomienie nie zmienia plików
      (`git diff --stat` puste po drugim przebiegu).
- [x] Zero żądań zewnętrznych poza `api.github.com` (moduł wersji): lista żądań sieciowych
      w przeglądarce przy wejściu i pełnym przewinięciu zawiera tylko `localhost` i to API;
      `grep` po `https?://` w `src`/`url()` w `site/` nie zwraca nic poza dozwolonym.
- [x] Hero: zrzuty otwarcia, stanu pośredniego i wyjścia z hero przy 1366 × 768 i 1920 × 1080
      w katalogu roboczym; trzy plany w dwóch pozycjach przewijania przesuwają się o różne
      odległości (zmierzone współrzędne ekranowe trzech obiektów w wpisie).
- [x] Kontrast tekstu hero zmierzony na złożonym obrazie: treść ≥ 4,5 : 1, nagłówek ≥ 3 : 1.
- [x] **Kalibracja smaku:** zrzuty hero pokazane Łukaszowi przed zamknięciem etapu; jego werdykt
      zacytowany w wpisie; uwagi wdrożone w E1 albo zapisane jako zakres E2 za jego zgodą.
- [x] Każdy z siedmiu przystanków osiągalny przewijaniem i kliknięciem w mapę (pas zrzutów);
      mapa obsługiwana klawiaturą (Tab, Enter).
- [x] Konfigurator na ekranie laptopa: kopiowanie działa; link `claude-cli://` otwiera terminal
      z wpisanym poleceniem na tej maszynie (albo zapisane, że obsługa schematu nie jest
      zarejestrowana); polecenie nie zaczyna się od „/”.
      *(2026-10-16: kopiowanie do schowka systemu i polecenie bez „/” sprawdzone; schemat
      `claude-cli` zarejestrowany (`claude.exe --handle-uri`). Otwarcie terminalu na żywo nie
      sprawdzone — decyzja Łukasza: przeniesione do bramki manualnej przed E5, gdzie plan i tak
      mierzy deep linki na żywo.)*
- [x] WebGL wyłączony (podmiana `getContext` albo flaga przeglądarki) → treść i konfigurator
      widoczne, zero błędów w konsoli.
- [x] Konsola bez błędów i nieudanych żądań przy wejściu i pełnym przewinięciu (obie wersje
      językowe).
- [x] Pomiar wydajności hero (mediana czasu klatki, KB JS przesłane) zapisany w wpisie z etykietą
      `FAKT`.
- [x] `site/vendor/three/` ma `LICENSE` i `VERSION`; fonty w `site/fonty/` mają plik licencji.
- [x] Podstawy bezpieczeństwa na zmianie etapu: dane z API GitHuba trafiają na stronę wyłącznie
      przez `textContent` (dowód: `grep -n "innerHTML" site/js` nie zwraca miejsc z danymi z
      sieci); wartość `q` w linkach przechodzi przez `encodeURIComponent` (test); strona nie ma
      formularzy wysyłających dane.
- [x] `docs/zasoby/STRONA/builds/biurko/BRIEF.md` ma osiem tematów, krzywą odczuć, szczyt,
      zdanie „It's the site where…” i wynik bramki fingerprint.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; `docs/STATE.md` zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (np. pobrana paczka three.js
      w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E1 → ZREALIZOWANY (data), E2 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_2.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E1/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (ryzyka 1 i 2 planu po pomiarze
   i kalibracji); dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan strony (co jest w `site/`, jak uruchomić); `CLAUDE.md` — wiersz planu
   w tabeli „Stan prac”.
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (E2 — pełna
   droga, szczyt, szuflady), realnego stanu `site/` po tym etapie, werdyktu kalibracji hero
   i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: add site foundation and desk hero (STRONA_RELAI E1)`); `.claude/launch.json` poza commitem.
