# PROMPT_ETAP_2 — Biurko od pierwszego do ostatniego ekranu: szczyt „bałagan → porządek” i szuflady

Plan: STRONA_RELAI • Etap: **E2 z E5** • Wygenerowano: 2026-10-16 (autor: Opus 5.5, w rytuale „Na koniec” E1) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (szczyt jest ruchem-podpisem całej strony i jedynym momentem, który odwiedzający ma
> zapamiętać; szuflady dokładają dostępność, fokus i powrót do drogi).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (wiersze T1, T2) + wpis 2026-10-16 „STRONA_RELAI E1: fundament strony i hero…” — co powstało, liczby, co odłożone do E2 |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcje 5 (droga odwiedzającego, szuflady, „wspólne dla obu”), 6 (wiersz E2), 7 (ryzyka 1, 2, 7), 8 (przypadki brzegowe: bez WebGL, szybkie przewijanie, liczby) |
| `docs/zasoby/STRONA/builds/biurko/BRIEF.md` | krzywa odczuć, „Szczyt”, „Zaplanowana cisza”, „Ruch-podpis”, „Kontrakt warstw hero” — szczyt budujesz dokładnie według tych sekcji |
| `docs/zasoby/STRONA/builds/biurko/kalibracja/` | trzy kadry hero zaakceptowane przez Łukasza — wzorzec, którego ten etap nie psuje |
| skill `nateherk-design:scroll-craft` (wywołaj narzędziem Skill) | `SKILL.md`, potem z `references/`: `feel.md` (szczyt, cisza, kontrola odczuć), `worldflight.md` §4 i §7c (kontrakt tekstu, tempo), `taste.md` |
| `site/README.md`, potem `site/biurko/kamera.js`, `scena.js`, `obiekty.js`, `warstwa.js` | stan sceny, toru kamery i warstwy tekstu, które ten etap rozbudowuje |
| `site/narzedzia/szablon.html`, `site/tresc/pl.json` | gdzie mieszka treść i znaczniki `data-*`, do których dochodzą szuflady |
| `docs/zasoby/film/zrodla/skrypty/dane.mjs` i `panel.mjs` | precedens makiet z kodu: dane pasków i panelu liczone funkcjami `core/panel/plan-state.mjs` i `progress.mjs`, każdy liść `{ wartosc, zrodlo }` |
| `docs/zasoby/PANEL_RELAI/DESIGN.md` | wygląd pasków i panelu, który makiety mają oddać |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Struktura i technologia** bez zmian od E1: gramatyka *Continuous world* na jednej scenie
  three.js 0.186.1 (`site/vendor/three/`), moduły ES bez bundlera i bez npm, geometria
  i tekstury proceduralne, każdy tekst to prawdziwy HTML (PLAN 4A–4C, PROMPT_ETAP_1 „Decyzje”).
  Każda nowa zależność — pytanie przed pobraniem.
- **Hero zaakceptowane:** Łukasz, 2026-10-16: „Akceptuję hero w tej postaci.” Poza kamery `biurko`,
  układ z lampą i oknem po prawej, scrim w lewym dolnym rogu, rozmiar nagłówka i kolumna hero
  zostają. Zmiana widoczna w kadrze hero wraca do Łukasza ze zrzutem przed i po.
- **Szczyt** (BRIEF „Szczyt”, PLAN 5): karteczki z pytaniami („o czym rozmawialiśmy?”) wzlatują
  i układają się w cztery dokumenty (STATE, DZIENNIK, LEKCJE, DECYZJE; w EN `JOURNAL.md`,
  `LESSONS.md`, `DECISIONS.md`). Ruch wyłącznie z przewijania, odwracalny, bez pętli ozdobnych;
  przed nim zaplanowana cisza, szczyt ma najdłuższy odcinek toru (dziś 2,2 wobec 1,0, test
  `kamera.test.mjs`) i tekst przystanku nie pojawia się w trakcie przelotu (PLAN 8).
- **Szuflady** (PLAN 5 i 6): kliknięty obiekt unosi się do kamery i otwiera szufladę z prawdziwym
  HTML — dokumenty (cztery pliki pamięci), teczka (plan z etapami), laptop (panel z zakładkami),
  pudełko (15 fiszek komend z `site/dane/fakty.json`). Zamknięcie wraca do drogi.
- **Makiety pasków i panelu z kodu pluginów** na **oznaczonych danych przykładowych** (PLAN 5
  „Wspólne dla obu”): wartości liczy kod z `core/panel/`, nie ręka; dane sesji, których nie ma
  w repo, są przykładem podpisanym jako przykład. Film zrobił to samo (`skrypty/dane.mjs`).
- **Liczby na stronie** tylko z repozytorium (komendy, wersje, adaptery); bez wymyślonych
  statystyk i liczników (PLAN 8, `taste.md`).
- **Wygląd:** D-61a / D-61b i kierunek „Warsztat z wigorem” jak w E1 (Fraunces, Kalam, Hanken
  Grotesk; paleta z `core/panel/theme.mjs`); zakaz low-poly, gliny i plastiku.
- **Link `claude-cli://` na żywo** to bramka manualna przed E5 (STATUS, decyzja Łukasza
  2026-10-16) — w tym etapie go nie mierzysz i nie zmieniasz konfiguratora poza treścią.
- **Granica zakresu:** E2 = pełna droga Biurka, szczyt, szuflady, makiety, mapa. Prototyp Film to
  **E3**; telefon, pełny wariant reduced motion, plakat bez WebGL z finalnego ujęcia, harness
  `shoot.mjs` i budżet na słabej grafice to **E4**; workflow Pages, deep linki na żywo, link
  w README i krok w sekwencji wydania to **E5**. Nie włączasz Pages, nie pushujesz, nie publikujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 i pluginy panelu 0.20.0 / 0.5.0 / 0.11.0 wydane; strona nieopublikowana. E1 zamknięty
2026-10-16 (17/17 punktów, hero zaakceptowane). Sprawdź `git log --oneline -3`: jeśli commit E1
nie powstał, pliki `site/` i `docs/zasoby/STRONA/` są nieśledzone — wtedy dowody „bez zmian” liczysz
sumą sha256, nie `git diff` (tak jak w E1).

```
site/package.json                 # {"type":"module"} — bez zależności npm
site/narzedzia/fakty.mjs (+test)  # repo → site/dane/fakty.json: 15 komend (opis EN + nazwa PL), wersje, 3 adaptery
site/narzedzia/zbuduj.mjs (+test) # mini-Mustache: szablon.html + tresc/{en,pl}.json → index.html, pl/index.html
site/narzedzia/szablon.html       # importmap three, mapa a[data-cel], sekcje [data-przystanek] 0–6, form[data-konfigurator]
site/tresc/pl.json, en.json       # meta, hero, przystanki[5], instalacja, konfigurator, scena{karteczki[7], dokumenty[4], teczka}
site/js/konfigurator.js (+test)   # 96 kombinacji, prompt bez „/”, ≤ 5000 znaków; fallback 1,5 s po blur/visibilitychange
site/js/wersja.js, jezyk.js (+testy)  # wersja wpieczona + API po prefiksie tagu; /pl/ i localStorage relai-jezyk
site/biurko/kamera.js (+test)     # POZY: biurko, amnezja, cisza, porzadek, plan, panel, komendy, instalacja; KLUCZE, zbudujTor, poza
site/biurko/obiekty.js            # blat, ściana, okno, tablica z kartką-logo, lampa, karteczki, 4 dokumenty, teczka, laptop, pudełko, kubek, ołówek
site/biurko/tekstury.js           # tekstury z canvas: drewno, papier, korek, tynk, karteczka, dokument, etykieta, ekran panelu
site/biurko/scena.js              # światło (SpotLight lampy + okno), CSS3D konfiguratora na laptopie, render tylko w ruchu, diagnostyka()
site/biurko/warstwa.js            # okna widoczności tekstu, --scrim, mapa aria-current, klik i fokus po scrollend
site/biurko/swiat.js, start.js    # fonty, window.__biurko, webglcontextlost; maWebGL2 → import('./swiat.js')
site/css/strona.css               # tokeny ROOT, tryb przepływu i .tryb-3d, ekran laptopa 1136 × 710
site/vendor/three/, site/fonty/   # three 0.186.1 z LICENSE i VERSION; 10 WOFF2 z LICENCJE.md
docs/zasoby/STRONA/builds/biurko/ # BRIEF.md, kalibracja/ (3 kadry hero)
```

**Warunki pracy:** testy odpalasz `node --test "site/**/*.test.mjs"` (91 pass po E1) — forma
`node --test site/` w Node 24 kończy się „Cannot find module” (L-0212). Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (konfiguracja z `runtimeExecutable` została przez `preview_start` odrzucona),
`.claude/launch.json` ma wpis `strona` z samym `url`. Ruch i czas klatki mierzysz tylko w widocznej
stronie (panel podglądu odsłonięty), kadry o stałym rozmiarze w osobnej stronie DevTools z
`emulate viewport` (L-0214). Kontrast — tło fotografujesz z `opacity: 0` na rodzicu tekstu (L-0213).

**Czego jeszcze nie ma (to jest zakres tego etapu):** animacji szczytu (dziś karteczki i dokumenty
stoją, tor kamery ma tylko postój), szuflad i ich treści, makiet pasków i panelu z kodu pluginów,
klikania obiektów w scenie, dopracowanych obiektów przystanków 2–7 (teczka, laptop z panelem,
pudełko z fiszkami są uproszczone), rozmycia pierwszego planu.

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
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia. **Komenda
   w sekcji Weryfikacja ma za sobą jeden realny przebieg autora promptu** (testy Node wzorcem
   plików, nie katalogiem) (L-0212).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212)
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
     w osobnej stronie DevTools (L-0214).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215);
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
     niesie środowisko czytane przez hooki (L-0170).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215)
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

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E2/`.** Wszystko tymczasowe —
> skrypty pomiarowe, zrzuty, wyjścia narzędzi — powstaje tam. Artefakt, który z natury musi leżeć
> **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do wpisu dziennika **z nazwy**, a jego
> nazwę zaczynasz od `relai-`.

Podział pracy: ruch szczytu, kompozycja przystanków, szuflady, światło, typografia i tekst robisz
sam (Opus). Do trzech subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie
punkty 4 i 5 — deterministyczne, z testami, sprawdzane przez Ciebie przed przyjęciem.

1. **Szczyt „bałagan → porządek”** — `site/biurko/szczyt.js` (nowy) i klucze toru
   w `site/biurko/kamera.js`: siedem karteczek z `scena.karteczki` odrywa się od blatu, wzlatuje
   i układa w cztery dokumenty z `scena.dokumenty`; stan liczony **czystą funkcją postępu**
   (`p → pozycje i obroty`), więc ta sama pozycja przewijania daje ten sam kadr w obu kierunkach.
   Odcinek szczytu najdłuższy na torze, cisza przed nim zostaje, tekst przystanku „Porządek”
   wchodzi dopiero po ułożeniu. Test `site/biurko/szczyt.test.mjs`: początek = stan bałaganu,
   koniec = cztery dokumenty, monotoniczność i deterministyczność.
2. **Przystanki 2–7 na gotowo** — `site/biurko/obiekty.js`, `tekstury.js`, `scena.js`, pozy
   w `kamera.js`: obiekt każdego przystanku czytelny w kadrze postoju (teczka planu z etykietą
   i etapami, laptop z panelem, pudełko z fiszkami, dokumenty), tekst przystanku w stałej
   warstwie HTML z kontrastem jak w hero. Poza `biurko` i kadr hero bez zmian (Decyzje).
3. **Szuflady po kliknięciu** — `site/biurko/szuflady.js` (nowy), znaczniki w
   `site/narzedzia/szablon.html`, treść w `site/tresc/pl.json` i `en.json`: cztery szuflady
   (dokumenty, teczka, laptop, pudełko). Otwiera je klik w obiekt sceny (raycaster) **i** przycisk
   osiągalny klawiaturą; obiekt unosi się do kamery, szuflada to dialog (`<dialog>` albo
   `role="dialog"` z `aria-modal`), Esc i przycisk zamykają, fokus wraca do elementu, który ją
   otworzył, pozycja przewijania po zamknięciu ta sama. Treść szuflad jest w HTML od początku —
   bez WebGL i bez JS czytelna w zwykłym przepływie.
4. **Makiety pasków i panelu z kodu pluginów** — `site/narzedzia/makiety.mjs` (nowy, Node, zero
   zależności) → `site/dane/makiety.json`: pasek planu i postępu etapu z
   `core/panel/plan-state.mjs` i `progress.mjs` na fixturze `site/narzedzia/fixtury/makiety/`
   (przykładowy plan, nie stan tego repo), pozostałe wartości sesji jako przykład z polem
   `zrodlo: "przykład"`; każdy liść `{ wartosc, zrodlo }` jak w filmie. Render w HTML/CSS na
   przystanku „Panel” i w szufladzie laptopa (wygląd wg `DESIGN.md`), podpis „dane przykładowe”
   widoczny. Test `site/narzedzia/makiety.test.mjs`: wartości równe wynikowi funkcji `core/panel`
   na fixturze, dwa przebiegi z identyczną sumą. *(subagent)*
5. **Generator i fakty pod szuflady** — rozszerzenie `site/narzedzia/zbuduj.mjs` (sekcje
   `{{#…}}` dla fiszek i szuflad, jeśli potrzebne) i jego testu; `site/index.html`
   i `site/pl/index.html` wygenerowane od nowa. *(subagent; treść JSON piszesz sam)*
6. **Mapa** — `site/narzedzia/szablon.html`, `site/biurko/warstwa.js`, `site/css/strona.css`:
   siedem przystanków i cztery szuflady osiągalne z mapy, `aria-current` na przystanku, wygląd
   spójny z hero.
7. **Rozmycie pierwszego planu** (odłożone z E1) — przedmiot bliski kamerze z miękkim rozmyciem
   (np. kubek lub ołówek), wyłącznie jeśli Łukasz zaakceptuje zrzut hero przed i po; odmowa →
   zostaje bez, zapis w dzienniku.
8. **Treść PL i EN** — `site/tresc/pl.json`, `en.json`: teksty szuflad, podpisy fiszek
   (z `fakty.json`, nie przepisane ręcznie), podpis makiet; bez myślnika w widocznym tekście,
   bez słów-wypełniaczy; EN dalej „do przeglądu native speakera”.
9. **Wydajność szczytu** — pomiar mediany i p95 czasu klatki w trakcie szczytu i przy otwartej
   szufladzie (1366 × 768, DPR 1, także CPU ×4) oraz przyrostu JS wobec E1 (2148 KB surowo /
   433 KB gzip `FAKT`); render dalej tylko w ruchu, obniżenie jakości przy medianie > 26 ms.
10. **`site/README.md`** — dopisz `makiety.mjs`, kolejność uruchomień (`fakty.mjs` → `makiety.mjs`
    → `zbuduj.mjs`) i gdzie mieszka treść szuflad.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_2.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node --test "site/**/*.test.mjs"` kończy się bez błędów; liczba testów większa niż 91
      (E1, `FAKT`), w tym nowe `szczyt.test.mjs` i `makiety.test.mjs`.
- [ ] `node site/narzedzia/makiety.mjs` i `node site/narzedzia/zbuduj.mjs` uruchomione dwukrotnie
      dają identyczne sumy sha256 `site/dane/makiety.json`, `site/index.html`, `site/pl/index.html`;
      zero niewypełnionych `{{`/`}}`; każda wartość makiety ma `zrodlo`, a te spoza `core/panel`
      mają `zrodlo: "przykład"` (licznik obu grup w wpisie).
- [ ] **Szczyt odwracalny:** `window.__biurko.diagnostyka()` (rozszerzona w tym etapie; po E1 zwraca
      tylko plany okno / lampa / kubek) zwraca pozycje karteczek dla tej samej pozycji
      przewijania przy zejściu w dół i powrocie w górę — różnica ≤ 0,001 jednostki sceny dla
      każdej z siedmiu (pomiar w trzech punktach szczytu: początek, środek, koniec).
- [ ] Szczyt na zrzutach: pas kadrów (cisza, start, środek, koniec szczytu) przy 1366 × 768
      w katalogu roboczym; tekst „Porządek” ma opacity 0 w trakcie przelotu i 1 po ułożeniu
      (odczyt stylu w trzech punktach).
- [ ] **Hero nietknięte (dowód negatywny):** kadr hero PL 1366 po etapie obok
      `kalibracja/hero-pl-1366.jpeg` — średnia różnica pikseli zapisana w wpisie; każda widoczna
      zmiana pokazana Łukaszowi (punkt 7 albo zgoda na różnicę), `POZY.biurko` bez zmian.
- [ ] Szuflady: każda z czterech otwiera się klikiem w obiekt sceny i z klawiatury (Tab, Enter),
      Esc zamyka, `document.activeElement` po zamknięciu = element otwierający, `scrollY` przed
      i po identyczne; pudełko pokazuje 15 fiszek = 15 komend w `fakty.json`.
- [ ] Każdy z siedmiu przystanków osiągalny przewijaniem i z mapy (klik i klawiatura); kontrast
      tekstu przystanków 2–7 zmierzony na złożonym kadrze: treść ≥ 4,5 : 1, nagłówek ≥ 3 : 1
      (z kontrolą pozytywną na jasnym obiekcie).
- [ ] WebGL wyłączony (podmiana `getContext`) → treść przystanków, szuflad, fiszek, makiet
      i konfigurator widoczne w przepływie, zero komunikatów konsoli.
- [ ] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu i otwarciu każdej
      szuflady (PL i EN); żądania sieciowe tylko `localhost` i `api.github.com`.
- [ ] Wydajność (`FAKT`): mediana i p95 klatki w trakcie szczytu i z otwartą szufladą, oba
      przebiegi (zwykły, CPU ×4), oraz KB JS przesłane — w wpisie obok liczb E1.
- [ ] Podstawy bezpieczeństwa na zmianie etapu: treść szuflad i makiet trafia do DOM przez
      `textContent` albo przez generator z ucieczką —
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko`
      kończy się kodem 1 (zero trafień; po E1 tak samo, a test-strażnik `wersja.test.mjs` cytuje
      `innerHTML` i dlatego jest wyłączony), z kontrolą pozytywną: ten sam grep bez `--exclude`
      trafia `wersja.test.mjs`; strona nie ma formularzy wysyłających dane.
- [ ] **Kalibracja szczytu i szuflad:** pas kadrów szczytu i zrzut jednej otwartej szuflady
      pokazane Łukaszowi przed zamknięciem etapu; jego werdykt zacytowany w wpisie; uwagi wdrożone
      w E2 albo zapisane za jego zgodą jako zakres E4.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; `docs/STATE.md` zaktualizowany.
- [ ] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (np. serwer podglądu w tle, pliki
      w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_3.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E2/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T1 po pomiarze szczytu, T2 po
   kalibracji; sekcja ryzyk jest ponad progiem 12 KB — propozycja z wpisu E1: historia wiersza C1
   do archiwum przy przeglądzie); dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady
   aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan strony (szczyt, szuflady, makiety, jak uruchomić); `CLAUDE.md` — wiersz
   planu w tabeli „Stan prac” i linia „Aktywny plan”.
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (E3 — Film:
   pełna droga, hero i szczyt, bramka wyboru wersji), realnego stanu `site/` po tym etapie
   (moduły wspólne, które Film ma wziąć), werdyktu kalibracji szczytu i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: add desk peak, drawers and panel mockups (STRONA_RELAI E2)`); `.claude/launch.json` poza commitem.
