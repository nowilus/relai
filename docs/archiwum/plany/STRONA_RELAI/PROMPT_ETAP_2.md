# PROMPT_ETAP_2 — Realistyczne biurko z modeli CC0 i hero od nowa

Plan: STRONA_RELAI • Etap: **E2 z E6** (Aneks A) • Wygenerowano: 2026-10-16 (autor: Opus 5.5, po akceptacji Aneksu A; zastępuje niewykonany prompt szczytu i szuflad z commitu `a097b35`) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (realizm sceny to powód aneksu; dobór zasobów z różnych źródeł, światło i budżet ciężaru
> decydują o tym, czy Łukasz przyjmie hero drugi raz).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (wiersze T1–T3) + wpisy 2026-10-16 „STRONA_RELAI E1…” i „STRONA_RELAI: Aneks A…” — liczby E1, słowa Łukasza, wybory wywiadu |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcja 10 (**Aneks A** — wiąże), potem 4B, 5, 6, 7 (ryzyka 1, 2, 10), 8 |
| `docs/zasoby/STRONA/builds/biurko/referencje/` | obrazy wzorcowe `01-hero.jpg` … `08-wieczor.jpg` od Łukasza i `PROMPTY_GPT_IMAGE.md` (co każdy obraz miał pokazać) — miara realizmu tego etapu; barwy materiałów z `07b-materialy-neutralne.jpg` (neutralne światło), fakturę i połysk z `07-materialy.jpg` (ciepłe światło podbarwia); uwagi Łukasza i moje do 01 i 07 — wpis dziennika „Obrazy wzorcowe” |
| `docs/zasoby/STRONA/builds/biurko/BRIEF.md` | krzywa odczuć, „Zaplanowana cisza”, „Kontrakt warstw hero” — obowiązują w nowej scenie |
| `docs/zasoby/STRONA/builds/biurko/kalibracja/` | kadry hero z E1: przyjęty układ (lampa i okno po prawej, nagłówek w lewym dolnym rogu) jako punkt wyjścia kompozycji |
| skill `nateherk-design:scroll-craft` (wywołaj narzędziem Skill) | `SKILL.md`, potem z `references/`: `hero-depth.md`, `approved-collection.md` §2 i §7, `taste.md` |
| `site/README.md`, potem `site/biurko/scena.js`, `obiekty.js`, `kamera.js`, `swiat.js`, `start.js` | scena, światło, tor kamery i start, które ten etap przebudowuje |
| strony licencji Poly Haven i ambientCG | licencję każdego zasobu czytasz na stronie zasobu, nie z pamięci (L-0180) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks A (2026-10-16), w całości:** swobodna kamera w three.js zostaje; obiekty i materiały
  z gotowych zasobów CC0 (Poly Haven, ambientCG — modele glTF, tekstury PBR, HDRI); dodatek
  `GLTFLoader` (i dekodery kompresji, gdy potrzebne) z three.js **0.186.1**; każde pobranie po
  zgodzie Łukasza; plik licencji obok zasobów w `site/`; obiekty, których nie ma w bibliotekach
  (teczka planu, pudełko z fiszkami), w kodzie na tych samych materiałach PBR. Obrazy GPT image
  wyłącznie jako wzorzec, nigdy na stronie; klipy wideo i Kie.ai poza planem. Pierwsze wejście
  do ok. 8 MB SZACUNEK, hero ładuje się pierwsze.
- **Słowa Łukasza o celu (wpis Aneksu A):** „żeby było wiadomo, że to jest biurko, to jest
  szuflada, to jest komputer i on ma bardzo dużo różnych szczegółów”; nie „cukierkowe
  i przetworzone”, „w jakiejś tam kolorystyce RelAI'owej”. Warstw zdjęć 2.5D nie chce.
- **Hero od nowa** z kalibracją Łukasza na zrzutach (wybór w wywiadzie Aneksu A). Kadr E1 przestaje
  być wzorcem wyglądu; jego układ jest punktem wyjścia, a gdy obraz `01-hero.jpg` układa biurko
  inaczej, wybór układu należy do Łukasza na kalibracji.
- **Bez zmian z E1:** tor kamery z postojem na siedmiu przystankach, cisza przed szczytem i szczyt
  najdłuższy (`kamera.js`, test) — pozy przestawiasz do nowej sceny, strukturę toru zostawiasz;
  treść PL/EN, generator, fakty, konfigurator, wersja, język, mapa, tryb bez WebGL (PLAN 4C–4F,
  PROMPT_ETAP_1 „Decyzje”). Konfigurator zostaje prawdziwym HTML na ekranie laptopa (CSS3D).
- **Wygląd:** D-61a / D-61b, paleta z `core/panel/theme.mjs`, fonty z `site/fonty/`; zero CDN —
  każdy zasób serwowany z `site/`.
- **Granica zakresu:** E2 = nowa scena, nowe hero, przystanki 2–7 na nowych obiektach, budżet.
  Animacja szczytu, szuflady po kliknięciu, makiety pasków i dopracowanie mapy to **E3**;
  karteczki i dokumenty w tym etapie stoją na biurku jako realistyczne obiekty bez animacji.
  Prototyp Film to **E4**; telefon, pełne reduced motion, plakat bez WebGL i słaba grafika to
  **E5**; Pages, deep linki na żywo i README to **E6**. Nie włączasz Pages, nie pushujesz.

## Stan wyjściowy — co realnie zastajesz

E1 w commicie `a097b35`, Aneks A w kolejnym (sprawdź `git log --oneline -3`). Strona działa
lokalnie z biurkiem z geometrii proceduralnej; hero tej wersji Łukasz najpierw przyjął, potem ocenił
jako „wygenerowane jednak przez AI stylistycznie”.

```
site/biurko/scena.js        # renderer, ACES, PCFShadowMap, SpotLight lampy + okno, RoomEnvironment, CSS3D konfiguratora (odleglosc 0.56), diagnostyka()
site/biurko/obiekty.js      # bryły proceduralne: blat (BLAT), ściana, okno, tablica z kartką-logo, lampa, 7 karteczek, 4 dokumenty, teczka, laptop, pudełko, kubek, ołówek
site/biurko/tekstury.js     # tekstury z canvas: drewno, papier, korek, tynk, niebo, karteczka, dokument, etykieta, karton, ekran panelu
site/biurko/kamera.js (+test) # POZY 8 póz, KLUCZE, zbudujTor, poza, aktualnyPrzystanek — 9 testów
site/biurko/warstwa.js      # okna widoczności tekstu, --scrim, mapa aria-current
site/biurko/swiat.js, start.js # fonty, window.__biurko, webglcontextlost; maWebGL2 → import('./swiat.js'), wyjątek → console.warn
site/vendor/three/          # three.core.js, three.module.js, addons/CSS3DRenderer.js, addons/RoomEnvironment.js, LICENSE, VERSION (0.186.1)
site/css/strona.css, site/narzedzia/, site/tresc/, site/js/  # strona, generator, treść i logika z E1 (bez zmian w tym etapie poza potrzebą sceny)
docs/zasoby/STRONA/builds/biurko/referencje/  # PROMPTY_GPT_IMAGE.md + obrazy 01–08 od Łukasza (bramka)
```

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (91 pass po E1; forma `node --test site/`
w Node 24 kończy się „Cannot find module”, L-0212). Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (`preview_start` odrzucił `runtimeExecutable`; `.claude/launch.json` ma wpis
`strona` z samym `url`). Ruch i czas klatki tylko w widocznej stronie, kadry o stałym rozmiarze
w osobnej stronie DevTools z `emulate viewport` (L-0214); tło pod tekstem fotografujesz
z `opacity: 0` na rodzicu (L-0213). Paczka npm three.js z E1 została skasowana — dodatki pobierasz
od nowa, z tą samą wersją i sumą `sha512` z rejestru npm.

**Czego jeszcze nie ma (to jest zakres tego etapu):** zasobów CC0 w `site/`, `GLTFLoader`, pliku
źródeł i licencji zasobów, oświetlenia z HDRI, sceny z modeli, ładowania etapami, hero w nowej
technice i jego kalibracji, pomiaru ciężaru strony z zasobami.

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
> pobrane paczki przed wyborem, skrypty pomiarowe, zrzuty, wyjścia narzędzi — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
> wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: dobór zasobów, kompozycja, światło, materiały, kamera i ocena robisz sam (Opus).
Do trzech subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie punkty 3 i 9 —
deterministyczne, z testami, sprawdzane przez Ciebie przed przyjęciem.

0. **Bramka na starcie:** w `docs/zasoby/STRONA/builds/biurko/referencje/` leży osiem plików
   `01-hero.jpg` … `08-wieczor.jpg`. Brak któregokolwiek → zatrzymaj się i zapytaj Łukasza,
   zanim cokolwiek zmienisz; pracy na samych promptach nie zaczynasz.
1. **Analiza wzorców** — `docs/zasoby/STRONA/builds/biurko/referencje/ANALIZA.md`: dla każdego
   obrazu, co z niego bierzesz (obiekty i ich proporcje w metrach, materiały, światło, kolory
   zmierzone próbką pikseli, detal, który robi realizm), oraz tabela „obiekt → zasób CC0
   (kandydat) albo kod na materiałach PBR”. Biurko ma szufladę (słowa Łukasza).
2. **Karta zgody i pobranie zasobów** — jedno pytanie z całą listą kandydatów: nazwa, strona
   zasobu, licencja przeczytana na tej stronie, rozdzielczość, rozmiar paczki i rozmiar po
   przycięciu do tego, co trafi do `site/` (L-0172). Po „tak” pobierasz do katalogu roboczego,
   do `site/zasoby/` kopiujesz tylko używane pliki. Tak samo `GLTFLoader` i ewentualne dekodery
   z three.js 0.186.1 do `site/vendor/three/addons/`. Nowe narzędzie do kompresji (np. pakiet
   npm) — osobne pytanie przed instalacją; narzędzia budowania nie wchodzą do `site/`.
3. **Rejestr źródeł** — `site/zasoby/ZRODLA.json` (każdy plik: nazwa, URL strony zasobu,
   licencja, autor, data pobrania, `sha256`), `site/zasoby/LICENCJE.md` i test
   `site/narzedzia/zasoby.test.mjs`: każdy plik w `site/zasoby/` ma wpis z licencją `CC0`
   i zgodną sumą, każdy wpis ma plik. *(subagent)*
4. **Scena z zasobów** — `site/biurko/obiekty.js`, `scena.js`, `swiat.js` (nowy plik ładowania,
   np. `site/biurko/zasoby.js`, jeśli porządek tego wymaga): modele w skali metrycznej, materiały
   PBR, HDRI jako `environment`, lampa jako jedyne ciepłe źródło z miękkimi cieniami, kolorystyka
   RelAI w akcentach (kubek, przekładki, karteczki), teczka i pudełko z fiszkami w kodzie na
   materiałach PBR. Bryły proceduralne zastąpione modelami usuwasz razem z teksturami canvas,
   których nic już nie używa; tekstury z tekstem (karteczki, dokumenty, etykiety) zostają.
5. **Ładowanie etapami** — najpierw zasoby kadru hero, pierwsza klatka, potem reszta w tle; treść
   HTML czytelna od pierwszej chwili. Nieudane ładowanie zasobu → tryb przepływu jak bez WebGL,
   bez komunikatu o błędzie dla odwiedzającego.
6. **Hero od nowa** — kontrakt warstw z BRIEF.md (co najmniej trzy plany o widocznie różnej
   prędkości w przewijaniu), nagłówek w całości czytelny, wezwanie w kadrze bez przewijania,
   porównanie obok `01-hero.jpg`.
7. **Przystanki 2–7 na nowych obiektach** — pozy w `kamera.js` dopasowane do nowej sceny,
   struktura toru i testy zostają; konfigurator CSS3D dopasowany do ekranu nowego laptopa.
8. **Budżet** — mediana i p95 czasu klatki (1366 × 768, DPR 1, zwykły i CPU ×4), czas do pierwszej
   klatki hero, bajty przesłane przy pierwszym wejściu z wyłączoną pamięcią podręczną (osobno
   zestaw hero i całość), `renderer.info` (wywołania rysowania, trójkąty); render dalej tylko
   w ruchu, obniżenie jakości przy medianie > 26 ms.
9. **Testy i generator** — testy `kamera.test.mjs` po zmianie póz, nowy test rejestru źródeł
   (punkt 3); `site/index.html` i `site/pl/index.html` wygenerowane od nowa, jeśli szablon się
   zmienił. *(subagent)*
10. **`site/README.md`** — skąd zasoby, jak dodać nowy (karta zgody, `ZRODLA.json`, test),
    jak zmierzyć budżet.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_2.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Bramka: `ls docs/zasoby/STRONA/builds/biurko/referencje/0[1-8]-*.jpg | wc -l` zwraca 8 przed
      pierwszą zmianą w `site/` (dodatkowy `07b-materialy-neutralne.jpg` poza licznikiem; stan
      2026-10-16: 9 plików JPEG q90 1536 × 1024 w repo; oryginały PNG tylko lokalnie, w `.gitignore`
      — gdy są, do pomiaru barw próbką pikseli bierzesz PNG).
- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 91 (E1, `FAKT`)
      plus nowy test rejestru źródeł; kontrola pozytywna: podłożony w katalogu roboczym plik bez
      wpisu (kopia `site/zasoby/` z dodatkowym plikiem) wywraca test.
- [x] Karta zgody na pobranie pokazana przed pierwszym pobraniem; odpowiedź Łukasza zacytowana
      w wpisie; każdy plik `site/zasoby/` ma w `ZRODLA.json` licencję `CC0` przeczytaną na stronie
      zasobu i sumę zgodną z plikiem.
- [x] Żądania sieciowe przy wejściu i pełnym przewinięciu (PL i EN): tylko `localhost`
      i `api.github.com`; `grep` po `https?://` w `src`/`href`/`url()` w `site/` — tylko odnośnik
      do repo na GitHubie (kontrola pozytywna trafia) i adresy stron zasobów w `ZRODLA.json`
      oraz `LICENCJE.md`.
- [x] Budżet (`FAKT`): bajty przesłane przy pierwszym wejściu z wyłączoną pamięcią podręczną
      ≤ ok. 8 MB (Aneks A), osobno zestaw hero; liczba z DevTools zgadza się z sumą rozmiarów
      plików (różnica wyjaśniona); przekroczenie → pytanie do Łukasza, nie cicha zmiana budżetu.
- [x] Hero: zrzuty otwarcia, stanu pośredniego i wyjścia przy 1366 × 768 i 1920 × 1080 (PL i EN)
      w katalogu roboczym, obok `01-hero.jpg`; trzy plany w dwóch pozycjach przewijania przesuwają
      się o różne odległości (współrzędne ekranowe trzech obiektów w wpisie).
- [x] Kontrast tekstu hero zmierzony na złożonym kadrze, cztery warianty PL/EN × 1366/1920:
      treść ≥ 4,5 : 1, nagłówek ≥ 3 : 1, z kontrolą pozytywną na jasnym obiekcie.
- [x] **Kalibracja smaku:** zrzuty hero i dwóch przystanków pokazane Łukaszowi obok obrazów
      wzorcowych przed zamknięciem etapu; jego werdykt zacytowany w wpisie; uwagi wdrożone w E2
      albo zapisane za jego zgodą jako zakres E3 lub E5.
- [x] Każdy z siedmiu przystanków osiągalny przewijaniem i z mapy (klik, Tab i Enter);
      konfigurator na ekranie nowego laptopa: `elementFromPoint` trafia formularz, klik zmienia
      komendy, „Kopiuj” daje komendy w schowku systemu.
- [x] WebGL wyłączony (podmiana `getContext`) i osobno zasób z odpowiedzią 404 (podmiana adresu
      w `initScript`) → treść i konfigurator widoczne w przepływie, zero komunikatów konsoli
      poziomu `error`; pierwsza asercja to tryb strony, potem zrzut (L-0213).
- [x] Konsola bez błędów i nieudanych żądań przy wejściu i pełnym przewinięciu (PL i EN).
- [x] Wydajność (`FAKT`): mediana i p95 klatki (zwykły przebieg i CPU ×4), czas do pierwszej
      klatki hero, `renderer.info` — w wpisie obok liczb E1 (mediana 5,60 ms, p95 11,10 ms
      przy CPU ×4, JS 433 KB gzip).
- [x] Podstawy bezpieczeństwa:
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko`
      kończy się kodem 1 (zero trafień), a ten sam grep bez `--exclude` trafia
      `site/js/wersja.test.mjs` (kontrola pozytywna); zasoby ładowane wyłącznie ze ścieżek
      względnych `site/`; strona nie ma formularzy wysyłających dane.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; `docs/STATE.md` zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (paczki w `%TEMP%`, serwer
      podglądu w tle) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, linia
   w dzienniku wdrożenia; link do `PROMPT_ETAP_3.md` w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E2/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T1 po pomiarze, T2 po kalibracji,
   T3 po pomiarze budżetu i ocenie spójności); dopisz lekcje z etapu do `docs/LEKCJE.md`
   i odśwież „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA` (bramka „Obrazy wzorcowe 01–08” zamknięta 2026-10-16 przed startem).
4. `docs/STATE.md` — stan strony (zasoby CC0, budżet, jak dodać zasób); `CLAUDE.md` — wiersz planu
   w tabeli „Stan prac” i linia „Aktywny plan”.
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (wiersz dawnego
   E2 — pełna droga, szczyt, szuflady) i sekcja 10 (Aneks A), treści niewykonanego promptu
   szczytu i szuflad (`git show a097b35:docs/plany/STRONA_RELAI/PROMPT_ETAP_2.md`) przeniesionej
   na nową scenę, realnego stanu `site/` po tym etapie, werdyktu kalibracji i lekcji z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: rebuild desk world from CC0 assets (STRONA_RELAI E2)`); `.claude/launch.json` poza commitem.
