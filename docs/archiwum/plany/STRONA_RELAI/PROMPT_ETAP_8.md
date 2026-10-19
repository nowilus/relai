# PROMPT_ETAP_8 — Publikacja obu wersji strony (Biurko i Film) na GitHub Pages z ankietą i odświeżaniem przy wydaniu

Plan: STRONA_RELAI • Etap: **E8 z E8** (Aneks D: kolejność E7 → E6 → E8; ostatni etap planu) • Wygenerowano: 2026-10-18 (autor: Opus 5.5, w rytuale „Na koniec” E6) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (etap jest w większości mechaniczny: workflow, wpiekanie wersji, walidator; ocena wyglądu
> dotyczy tylko miejsca ankiety i stopki, a publikacja czeka na zgody człowieka).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1, T2, T3) + ostatni wpis 2026-10-18 „E6” (stan Biurka, liczby, świadomie odłożone) |
| `docs/plany/STRONA_RELAI/STATUS.md` | sekcja „Bramki manualne”: trzy pozycje **OTWARTA** blokują publikację (niżej, pkt 1) |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcje 5 („Publikacja” we „wspólnym dla obu”), 6 (wiersz „Publikacja i utrzymanie”), 8 (przypadki brzegowe: język i `hreflang`, wydanie panelu, API GitHuba, link bez Claude Code), 9 (sprawy człowieka), 10 (**Aneks D pkt 3**: obie wersje równolegle z ankietą) |
| `docs/PULAPKI.md` | P-005 (sekwencja wydania), P-048 i P-049 (pomiary w Chrome) |
| `site/README.md` | budowa, podgląd lokalny, budżet, sekcja „Przy wydaniu” — tu dochodzi krok „strona” |
| `site/narzedzia/zbuduj.mjs`, `site/narzedzia/fakty.mjs`, `site/js/wersja.js`, `site/narzedzia/szablon.html` (nagłówek `<head>`), `site/narzedzia/szablon-film.html` (nagłówek) | jak powstają cztery strony, skąd wersje wpieczone, gdzie stoją `hreflang` i stopka |
| `core/tools/validate-adapters.js` | walidator, do którego dochodzi kontrola faktów strony |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks D pkt 3 (2026-10-16):** E8 publikuje **obie** wersje równolegle (Biurko i Film) i zbiera
  ankietę wśród odwiedzających. Wybór kierunku zapada po wynikach ankiety i **nie należy do tego
  planu** — żadnej wersji nie archiwizujesz i nie usuwasz.
- **Hosting:** GitHub Pages ze źródłem GitHub Actions (PLAN sekcja 5 i 9), adres
  `nowilus.github.io/relai/` (repo `nowilus/relai`). Własna domena jest sprawą człowieka „dowolnie”
  — nie kupujesz i nie konfigurujesz jej w tym etapie.
- **Strony są gotowe i przyjęte:** Film (E7) i Biurko (E6) mają werdykty Łukasza. Wyglądu przystanków,
  aktów, zasłon, plakatu ani kompozycji telefonu **nie zmieniasz**. Wyjątek: element ankiety i stopka
  (pkt 4 i 5) — z kadrem przed i po dla Łukasza.
- **Technologia bez zmian:** strona statyczna, bez bundlera i bez zależności npm (`site/package.json`
  bez zależności); three.js 0.186.1 i scroll-craft 0.3.1 przypięte w `site/vendor/` (sumy w `VERSION`).
  Nowa zależność albo usługa zewnętrzna — karta zgody przed użyciem (nazwa, źródło, licencja, koszt,
  dane odwiedzających, L-0172).
- **Wersje:** wartość wpieczona przy budowie jest źródłem głównym; przeglądarka tylko sprawdza nowszy tag
  w API GitHuba (`v…` dla RelAI, `relai-panel-v…` dla panelu). API milczy → zostaje wpieczona, bez
  komunikatu (PLAN 8).
- **Liczby na stronie tylko z repo**, bez wymyślonych statystyk (PLAN 8). Ankieta nie pokazuje wyników
  na stronie.
- **Granica zakresu:** to ostatni etap planu. Po nim sekwencja zamknięcia planu (`plan-closing.md`).
  Wspólny moduł Filmu i Biurka, drugi bezpiecznik słabej grafiki (opcja 3B), pomiar na słabszym laptopie
  i przegląd EN przez native speakera **nie są zakresem E8** — zostają jako bramki i „świadomie odłożone”.
  Plików planu PANEL_CODEX (`docs/plany/PANEL_CODEX/*`, `docs/zasoby/PANEL_RELAI/makiety/`) i `.claude/`
  nie ruszasz i nie commitujesz.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 i pluginy panelu wydane (`relai-panel` 0.20.0, tag `relai-panel-v0.20.0`). Strona
**nieopublikowana**: w repo nie ma `.github/workflows/` (FAKT, 2026-10-18), Pages w ustawieniach repo
wyłączone. Ostatnie commity etapu E6: `3adcd18`, `cd4effa` i commit rytuału E6 — sprawdź
`git log --oneline -4`. Testy: `node --test "site/**/*.test.mjs"` → 299/299 (FAKT, uruchomione przez
autora promptu 2026-10-18; forma `node --test site/` nie działa, L-0212).

```
site/narzedzia/szablon.html       # Biurko, oba języki; <head>: hreflang z {{baza}} (względne), zasłona, importmap
site/narzedzia/szablon-film.html  # Film, oba języki; ten sam wzorzec hreflang
site/narzedzia/zbuduj.mjs (+test) # cztery strony: index.html, pl/index.html, film/index.html, pl/film/index.html; „bez zmian” przy drugim przebiegu
site/narzedzia/fakty.mjs (+test)  # fakty z repo → dane/fakty.json (15 komend, wersje relai i pluginów panelu)
site/narzedzia/makiety.mjs        # makiety pasków → dane/makiety.json
site/narzedzia/plakat.mjs         # plakat Biurka bez sceny (Chrome bez okna, serwer podglądu na 4520)
site/js/wersja.js (+test)         # wersja wpieczona + sprawdzenie API GitHuba z pamięcią w sessionStorage
site/js/konfigurator.js (+test)   # komendy instalacji, deep linki claude-cli:// (próba na żywo: bramka OTWARTA)
site/biurko/                      # Biurko: scena, szczyt, szuflady, zasłona, grafika.js (wyłącznik grafiki programowej)
site/film/                        # Film: akty, pasek, telefon, zasłona
site/grafika/plakat/              # plakaty Biurka (pobierane tylko bez sceny)
site/vendor/three/, site/vendor/scrollcraft/   # przypięte, sumy w VERSION
site/zasoby/ (CC0, ZRODLA.json)   # zasoby 3D; zasoby.test.mjs pilnuje licencji i sum
docs/zasoby/STRONA/lab/{film,biurko}/          # arkusze przebiegów zrzutów E7 i E6
```

Liczby (FAKT, ten sam instrument z `site/README.md`): Biurko 9,522 MiB / 118 plików, CPU ×4 p95
≤ 25,2 ms; Film 0,317 MiB / 35 plików, p95 16,7 ms; Lighthouse dostępność 100 (obie wersje, PL i EN,
desktop i telefon), **SEO 91 przez `hreflang`** ze ścieżkami względnymi.

**Czego jeszcze nie ma (zakres tego etapu):** workflow Pages, adresów publicznych obu wersji
i przełącznika między nimi, ankiety, absolutnych `hreflang` i `canonical`, kroku „strona” w sekwencji
wydania (P-005) i w walidatorze, linku do strony w `README.md`, pomiaru deep linku `claude-cli://` na
żywo, pierwszego wdrożenia.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-18):**

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
     L-0192, L-0198, L-0210, L-0215); ścieżka w powłoce z `/`, także składana ze zmiennych
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
     z tekstem, nie `visibility` rodzica (L-0240).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240)
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

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E8/`.** Wszystko tymczasowe —
> skrypty pomiarowe, zrzuty stron opublikowanych, logi workflow, materiał do ankiety — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, profil Chrome bez okna, worktree
> HEAD-a), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: decyzje, karty zgody, element ankiety i rozmowa z Łukaszem — Ty (Opus). Do trzech
subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) wyłącznie na punkty 3 i 6 (workflow, walidator,
testy), sprawdzane przez Ciebie przed przyjęciem z kontrolą pozytywną. Całość 1–2 sesje `SZACUNEK`
(sekcja 6 planu).

1. **Bramki przed pracą (blokujące).** W `STATUS.md` trzy pozycje **OTWARTA**: „Adresy obu wersji strony
   i narzędzie ankiety”, „Włączenie GitHub Pages (źródło: GitHub Actions) i zgoda na pierwsze wdrożenie”,
   „Próba linku `claude-cli://` na żywo w Chrome”. Na starcie pytasz Łukasza **jednym** wywołaniem
   AskUserQuestion o te, które nadal są otwarte. Rekomendacje:
   - **Adresy:** Biurko pod `nowilus.github.io/relai/` (korzeń, jak dziś `site/index.html`), Film pod
     `/relai/film/` (jak dziś `site/film/`), w obu językach (`/pl/`, `/pl/film/`); dyskretny przełącznik
     „druga wersja strony” w stopce obu. Opcja: Film w korzeniu, Biurko pod `/biurko/`.
   - **Ankieta** (karta zgody z: nazwą usługi, kosztem, danymi odwiedzających, licencją): rekomendacja
     **GitHub Discussions** z jednym wątkiem-ankietą (zero nowej usługi, zero śledzenia na stronie,
     link z obu wersji); opcje: formularz zewnętrzny (Tally / Google Forms — dane poza repo) albo
     reakcje w issue. Treść pytania ankiety cytujesz z Aneksu D pkt 3 i pokazujesz przed publikacją.
   - **Pages i zgoda na wdrożenie** robi Łukasz w ustawieniach repo — Ty podajesz dokładne kroki;
     ustawień repo nie zmieniasz sam.
   Bez rozstrzygnięcia adresów i ankiety punktów 4–5 i 8 nie zaczynasz; punkty 2, 3 i 6 możesz.
2. **Adresy absolutne i `hreflang`** — `site/narzedzia/szablon.html`, `site/narzedzia/szablon-film.html`,
   `site/narzedzia/zbuduj.mjs` (+test): `hreflang` i `<link rel="canonical">` z adresem publicznym
   (stała w generatorze, jedno źródło), dla każdej z czterech stron para PL/EN własnej wersji plus
   `x-default`. Zmiana addytywna w generatorze; strony po budowie różnią się wyłącznie `<head>`
   (dowód: `git diff` stron po budowie). Lighthouse SEO na lokalnym podglądzie bez błędu `hreflang`.
3. **Workflow Pages** — `.github/workflows/strona.yml` (nowy): wyzwalacz przy zmianie `site/**` na `main`
   i przy opublikowaniu wydania (`release: published`) oraz ręczny; kroki: checkout, Node 24,
   `node site/narzedzia/fakty.mjs`, `node site/narzedzia/makiety.mjs`, `node site/narzedzia/zbuduj.mjs`,
   `node --test "site/**/*.test.mjs"`, upload `site/` jako artefakt Pages, deploy. Akcje GitHuba
   przypięte do pełnego SHA commitu (nie do tagu), uprawnienia minimalne (`contents: read`,
   `pages: write`, `id-token: write`), bez sekretów. Na Windows workflow sprawdzasz lokalnie
   składnią (`actionlint`, jeśli jest — karta zgody przed instalacją; inaczej przegląd ręczny z listą
   kroków) i pierwszym przebiegiem dopiero po zgodzie z pkt 1. *(subagent; Ty sprawdzasz)*
4. **Przełącznik wersji i ankieta na stronie** — oba szablony, `site/tresc/pl.json` i `en.json` (nowy klucz,
   np. `publikacja`), style w `site/css/strona.css` i `site/css/film.css` tylko addytywnie: link do drugiej
   wersji i link do ankiety w stopce (Film: ostatni akt; Biurko: stopka przystanku „Instalacja” i tryb bez
   sceny). Treść przez generator z ucieczką; bez skryptów zewnętrznych i bez śledzenia. Kadr przed i po
   z obrysem dla Łukasza (L-0229); stopka nie może zmienić wysokości sekcji ani dodać przewijania
   w poziomie (przebieg z E6/E7 na 1366 i 390).
5. **Treść o autorze i kontakcie** (PLAN 9, w pierwszej osobie: „wypuściłem”, nigdy „mamy”) — jedno
   zdanie w stopce obu wersji z linkiem do GitHub Issues, jeśli Łukasz to potwierdzi w pkt 1 (pytanie
   w tym samym wywołaniu). Bez e-maila na stronie bez jego zgody.
6. **Krok „strona” w sekwencji wydania i walidator** — `docs/PULAPKI.md` P-005 (sekwencja wydania:
   dopisany krok „po podbiciu wersji: fakty, makiety, zbuduj; commit stron; workflow publikuje”),
   `site/README.md` sekcja „Przy wydaniu” (opis zmierzony, nie zamierzony), `core/tools/validate-adapters.js`
   albo osobny `site/narzedzia/fakty.test.mjs`: kontrola, że wersje wpieczone w czterech stronach są
   równe wersjom z `.claude-plugin/marketplace.json` (kontrola pozytywna: strona z podmienioną wersją
   wywraca kontrolę). *(subagent; Ty sprawdzasz)*
7. **Link w `README.md` repo** — jedna linia z adresem strony (obie wersje i ankieta), dopiero po
   pierwszym udanym wdrożeniu (pkt 8); EN/PL zgodnie z językiem README.
8. **Pierwsze wdrożenie (po zgodzie z pkt 1)** — push na `main` **tylko** po wyraźnym „tak” Łukasza
   w tej sesji; potem przebieg workflow, adresy publiczne obu wersji w obu językach otwarte w Chrome:
   `h1`, wersje wpieczone równe repo, konfigurator, przełącznik, ankieta, konsola bez błędów, żądania tylko
   do `nowilus.github.io` i `api.github.com`. Próba `claude-cli://` z adresu publicznego w prawdziwym
   Chrome z zainstalowanym Claude Code (bramka) — wynik z opisem tego, co się otworzyło.
9. **Przegląd EN przez native speakera** (PLAN 9) — nie robisz go; dopisujesz do bramek jako OTWARTA, jeśli
   Łukasz nie rozstrzygnie inaczej, a tekst EN zostaje oznaczony jak dotąd.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_8.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Bramki z pkt 1 rozstrzygnięte przez Łukasza, odpowiedzi zacytowane we wpisie; w `STATUS.md` status
      `ROZSTRZYGNIĘTA <data> — <jak>`; karta zgody na usługę ankiety pokazana przed użyciem.
- [x] `node --test "site/**/*.test.mjs"` bez błędów, liczba testów ≥ 299 (E6, `FAKT`) plus nowe; kontrola
      pozytywna: strona z podmienioną wersją wpieczoną wywraca nową kontrolę wersji.
- [x] Budowa deterministyczna: `fakty.mjs`, `makiety.mjs`, `zbuduj.mjs` dwukrotnie — drugi przebieg
      „bez zmian” dla czterech stron, zero `{{`/`}}`.
- [x] **Strony nietknięte poza `<head>` i stopką (dowód negatywny):** `git diff` czterech stron po budowie
      zawiera wyłącznie `hreflang`, `canonical` i dopisaną stopkę/przełącznik; sumy `site/biurko/*`,
      `site/film/*` (bez szablonów), `site/vendor/**`, `site/zasoby/**` zapisane na starcie i porównane na
      końcu — zero różnic; kontrola pozytywna: dopisana spacja w jednym z plików daje jedną różnicę.
- [x] `hreflang` i `canonical`: na czterech stronach adresy absolutne z jednej stałej; Lighthouse SEO
      lokalnie bez błędu `hreflang`; dostępność nadal 100 dla `/`, `/pl/`, `/film/`, `/pl/film/` (desktop
      i telefon; EN z `localStorage['relai-jezyk']='en'`).
- [x] Stopka i przełącznik: kadry przed i po (1366 i 390, PL i EN, obie wersje) z werdyktem Łukasza;
      `scrollWidth` ≤ szerokości okna, wysokość sekcji instalacji zmieniona najwyżej o wysokość nowej linii;
      tryb bez sceny Biurka i wersja bez JS pokazują przełącznik i ankietę.
- [x] Workflow: plik przechodzi przegląd składni (`actionlint` albo ręczna lista kroków we wpisie);
      każda akcja przypięta pełnym SHA (`grep -E "uses: [^@]+@[0-9a-f]{40}"` trafia każdą linię `uses:`,
      kontrola pozytywna na podłożonym `@v4`); uprawnienia minimalne; zero sekretów
      (`git grep -nE "(api[_-]?key|token|secret)\s*[:=]"` na `.github/` bez trafień).
- [x] Podstawy bezpieczeństwa na zmianie etapu (projekt bez zależności, więc audytu zależności nie ma):
      grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` na `site/js site/biurko site/film`
      bez testów kończy się kodem 1, z testami trafia `site/js/wersja.test.mjs`; nowe linki zewnętrzne
      z `rel="noopener"` przy `target="_blank"`; formularz konfiguratora dalej bez `action` i `method`.
- [x] Krok „strona” w P-005 i w `site/README.md` opisany tak, jak został wykonany w tym etapie (komendy
      uruchomione dosłownie, L-0002).
- [x] Pierwsze wdrożenie (jeśli zgoda padła): przebieg workflow zielony (link do przebiegu we wpisie),
      cztery adresy publiczne odpowiadają 200; na każdej `h1` 1, wersje równe `.claude-plugin/marketplace.json`,
      konsola bez błędów, żądania tylko do `nowilus.github.io` i `api.github.com`. Bez zgody — punkt
      opisany z warunkiem wykonalności (Pages włączone, zgoda), nie odhaczony.
- [x] Próba `claude-cli://` na żywo (bramka): wynik opisany (otworzyło się / co pokazało / komunikat po
      1,5 s bez Claude Code); bez prawdziwego Chrome z Claude Code — bramka zostaje OTWARTA z warunkiem.
- [x] Link w `README.md` dopiero po udanym wdrożeniu; adresy w nim otwarte i równe tym z wpisu.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, podpis `Autor: RelAI (Opus 5.5) + Lukasz`; ryzyka
      T1, T2, T3 przejrzane (T2 i ankieta), `docs/STATE.md` zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E8/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po w sekcji
      „Zweryfikowane” wpisu. Artefakty poza katalogiem (serwery podglądu w tle, profile Chrome
      `%TEMP%/relai-*`, strony DevTools) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

To **ostatni etap planu**: po krokach 1–4 zamiast generowania następnego promptu uruchamiasz sekwencję
zamknięcia planu (`plan-closing.md` skilla `relai-planning`, D-36).

1. `docs/plany/STRONA_RELAI/STATUS.md`: E8 → ZREALIZOWANY (data); linia w dzienniku wdrożenia.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E8/` — raport, „tak”, kasowanie; liczby przed i po
   do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone /
   Do zrobienia przez człowieka), podpis `Autor: RelAI (Opus 5.5) + Lukasz`; ryzyka T1, T2, T3; lekcje do
   `docs/LEKCJE.md` z odświeżonymi „Zasadami aktywnymi”. Do „Świadomie odłożone” m.in.: wspólny moduł Filmu
   i Biurka po wyniku ankiety, drugi bezpiecznik słabej grafiki (3B), logo zasłony Filmu po SVG.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” → sekcja „Bramki manualne” `STATUS.md`
   (`OTWARTA`): m.in. przegląd EN, pomiar na słabszym laptopie (jeśli nadal otwarty), odczyt ankiety
   i wybór kierunku (poza planem, Aneks D pkt 3).
4. `docs/STATE.md` — strona opublikowana (adresy, jak odświeża się przy wydaniu, gdzie ankieta);
   `CLAUDE.md` — wiersz planu i linia „Aktywny plan”; `site/README.md` przy zmianie sposobu budowy.
5. **Sekwencja zamknięcia planu** (`plan-closing.md`): dwa pierwsze kroki są blokujące — otwarte bramki
   i otwarte odnogi rozstrzyga człowiek, zanim napiszesz, że plan jest zrealizowany.
6. Commit — propozycja, conventional message po angielsku (np. `feat: publish both site versions with survey (STRONA_RELAI E8)`);
   push tylko po wyraźnej zgodzie; `.claude/` i cudze zmiany PANEL_CODEX poza commitem.
