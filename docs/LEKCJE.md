# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej pisania**, nie
   kontrolą po fakcie: planuj go przed zamknięciem pliku, a rozjazd traktuj jako defekt reguły,
   nie jako wyjątek do obejścia w wykonaniu. **Reguła produkująca tekst opisuje początek wiersza
   i to, czego w nim nie ma**, nie tylko jego zawartość — model domyka lukę formatem materiału,
   który ma pod ręką; materiał sprzed poprawki reguły zostaje obok materiału po niej. **Linia
   raportu, która ma poświadczać krok, bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>", „brak po przeglądzie git diff") — linia bez takiej kotwicy powstaje bez
   uruchomienia polecenia.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022,
   L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — policz na wskazanym pliku liczbę, którą ma osiągnąć,
   i porównaj ją z tym, co mechanizm w ogóle kontroluje; kryterium arytmetycznie nieosiągalne
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. **Autor promptu
   etapu robi to samo przy pisaniu kryterium** — na materiale i wobec reguł specyfikacji, którą
   etap wykona. **Etap przenoszący treść liczy metrykę treści na całym pakiecie** (plik źródłowy
   + pliki docelowe), bo sam plik źródłowy pokazuje przeprowadzkę, nie zmianę. **Kryterium liczące
   wywołania narzędzia zaczynasz od listy narzędzi w `init` trybu pomiaru** — narzędzia nieobecnego
   (AskUserQuestion w `claude -p`) nie da się policzyć, a zero wygląda jak sukces. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku zapisanym
   narzędziem zapisu, nie w `node -e` ani w heredoku, a tekst z backslashem (także ścieżkę
   Windows) wstawiasz Edit/Write albo piszesz z `/` (L-0116, L-0119); scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. **Filtr odsiewający „to nie jest przypadek do sprawdzenia" ma
   wyjątek dla linii mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną
   kontrolę na wyjściu — jedna kontrola przechodzi zielono, gdy zniknął przypadek, którego nie
   sprawdza. **Wzorzec identyfikatora pozycji ma obok siebie kontrolę „ile wierszy odrzucono"** —
   realny rejestr trzyma numery, których wzorzec nie przewidział, a odrzucenie jest ciche.
   **Generator identyfikatorów ma kontrolę pozytywną na wszystkich kandydatach, nie na
   pierwszym** — sprawdzasz, czy wygenerowana wartość występuje w tym samym pliku; pierwszy
   element bywa jedynym nielinkowanym i przewraca kontrolę na poprawnym generatorze.
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty — a **wynik wariantu, który ma przeżyć pomiar, wynosisz
   z katalogu odtwarzanego od razu**; plik brany z katalogu kontrolnego przenosisz z porównaniem
   sumy, nie samym `cp`. Wyczerpany limit konta zatrzymuje pomiar i idzie do
   odnogi, nie do adnotacji „sprawdzone inaczej" — ale **niedostępność cudzej usługi sprawdzasz
   ponownie jednym najtańszym wywołaniem**, zanim odpiszesz pomiar jako niewykonalny: lekcja o niej
   niesie datę i jest hipotezą, nie werdyktem. **Datowanie działa w obie strony** — „usługa działała
   wczoraj" też jest hipotezą, więc etap opierający punkt weryfikacji na cudzej usłudze sprawdza ją
   przed rozpoczęciem pracy. **Przebieg, w którym oczekujesz ciszy, jest ważny wyłącznie razem
   z kontrolą pozytywną w tym samym przebiegu** — awaria ładowania modułu wygląda dokładnie jak
   zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz pierwszą. **Cisza zmierzona
   złym wejściem jest fałszem, nie ciszą** — narzędzie wołane z podstawionym payloadem dostaje
   kontrolę pozytywną **na tym samym wejściu** (odbite pole, nazwa projektu), bo „0 znaków" wygląda
   tak samo przy poprawnej ścieżce i przy rozjechanej. **Kontrolę pozytywną stawiasz na wejściu,
   którego mechanizm naprawdę pilnuje** — wejście z jego własnej listy wyłączeń (ścieżka objęta
   `.gitignore`, rozszerzenie pomijane, tryb wyciszony) daje przebieg zielony niezależnie od tego,
   czy mechanizm żyje; listę wyłączeń czytasz w kodzie, zanim postawisz kontrolę. **Wniosek
   o własności cudzego narzędzia, wyprowadzony w czasie, gdy własny artefakt był zepsuty, wygasa
   razem z jego naprawą** — datuj go wersją artefaktu, nie tylko dniem, i sprawdź ponownie, zanim
   oprzesz na nim zakres etapu. **Porównanie dwóch nieistniejących wejść jest zgodnością** —
   instrument porównujący dwa źródła sprawdza najpierw, czy oba istnieją, i zgłasza brak jako osobny
   stan, bo suma pustego strumienia jest po obu stronach ta sama; kontrola pozytywna wobec **innej
   wersji** musi zwrócić różnicę. **Agregat po wykrytych elementach bierze też elementy innej klasy
   niż mierzona** — `min()` po pasmach ciemnych pikseli zwraca kreskę, nie wiersz tekstu; próg
   odsiewu podajesz jawnie i pokazujesz cały zbiór obok wyniku. **Metrykę „czy X jest w tekście"
   stawiasz na dwóch licznikach naraz** — wąskim, ze słownika własnego wzorca, i szerokim, z brzmień,
   którymi to samo mówi ktoś, kto Twojego wzorca nie zna; szeroki dostaje kontrolę **przeciw
   zawyżeniu** na materiale, który tej rzeczy na pewno nie ma, a rozjazd między licznikami jest
   wynikiem, nie usterką. **Najpierw klasyfikujesz kształt odpowiedzi, potem liczysz jakość** — i
   liczysz ją wyłącznie tam, gdzie mierzona rzecz miała powstać; liczba przypadków stoi w raporcie
   obok procentu, bo procent bez mianownika kłamie najciszej, a sam rozkład kształtów bywa
   ważniejszy od jakości. **Różnica dwóch przebiegów mierzy tylko to, co przekracza szum** — zmierz
   szum między dwiema bazami, a sygnał od niego mniejszy wzmocnij powieleniem materiału i podaj
   pasmo błędu razem z kontrolą na połowie materiału. **Scenariusz „czegoś nie ma" planuj razem
   z listą mechanizmów, które to coś tworzą same**; czego nie da się odciąć, tam pomiar schodzi na
   fixturę i mówi to wprost. **Licznik wąski buduj przez wykluczenie znaku otwierającego przypadek,
   który ma odpaść** — alternatywa ogólna znosi zamkniętą listę brzmień, a kontrola oczekująca tego
   samego od licznika wąskiego i szerokiego nie sprawdza niczego. **Zero trafień w cudzym
   transkrypcie jest najpierw zdaniem o instrumencie** — nazwa narzędzia w cudzym protokole jest
   takim samym wariantem jak nazwa pola, więc wypisz zbiór nazw, które w materiale wystąpiły, zanim
   orzekniesz, że tej jednej nie ma. **Nową kontrolę spójności uruchamiasz na zastanym materiale,
   zanim nazwiesz ją profilaktyką**: jej pierwsze trafienia są wynikiem etapu, a cisza od pierwszego
   uruchomienia jest podejrzana do czasu pokazania drugiej strony na podłożonym defekcie; fałszywe
   trafienie zawężasz **z powodem**, nie wyciszeniem kontroli.
   **Pomiar czytelności klatek bierze wyłącznie klatki ustalone i oba kierunki kontrastu** — szczeliny
   między jasnymi literami na ciemnym panelu i klatki przenikania nie są tekstem; **korpus kontroli
   pokrycia to sam materiał źródłowy**, bez dokumentacji poprzedniego pomiaru, która niesie jego
   cytat kontrolny.
   **Limit tur w pomiarze ustawiasz na cały łańcuch, który mechanizm uruchamia przed mierzonym
   krokiem**, i czytasz kod wyjścia każdej sesji — wyjście limitem obok „nie wywołano" znaczy
   „nie zmierzono"; instrument poprawiony w trakcie idzie od nowa dla obu wariantów. **Podłożony
   hook sprawdzasz `node --check` i liczysz w transkrypcie zdanie, które ma wstrzyknąć** — zero
   trafień unieważnia przebieg (L-0127). **Kontrola spójności puszczona po historii commitów mierzy
   inną semantykę niż na drzewie roboczym** — trafienia dzielisz na „naprawione później" i „nigdy",
   zanim nazwiesz je defektem (L-0131).
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". **Liczbę zbioru
   liczysz także w komunikacie sukcesu**, nie tylko w asercji: literał w tekście czytanym przez
   człowieka jest zapisem stanu z dnia napisania i przy pierwszej zmianie zakresu staje się cichym
   fałszem. **Wielkość odejmowaną od pomiaru traktujesz jako hipotezę o stałej i sprawdzasz ją,
   zanim na niej oprzesz liczbę** — różnica ujemna albo rozjeżdżająca się znaczy, że nie ma czego
   odejmować; zostaje liczba surowa i różnica między wariantami mierzonymi w tych samych warunkach,
   gdzie narzut skraca się sam. Wynik oparty na nierzetelnym odjęciu **oznaczasz** jako nierzetelny,
   a nie usuwasz. (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`** —
   `\w` bez flagi `u` to `[A-Za-z0-9_]`, więc wzorzec przechodzi na formach bez ogonków i odpada
   na realnym dokumencie; wynik zawyżony jest tak samo podejrzany jak zerowy. **Rdzenia szukasz
   w samym brzmieniu wartości, nie w całej komórce** — za datą stoi proza z tymi samymi słowami,
   więc dopasowanie „gdziekolwiek" wciąga pozycje, które należą do innego mechanizmu.
   **Zamknięta lista ma koszt po drugiej stronie i ten koszt mierzysz:** ile pozycji wygląda dla
   człowieka na rozpoznane, a nie jest; poszerzenie listy jest decyzją człowieka, nie poprawką.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". **Stan zapisywany przez model ma kształt, w którym nie ma czego
   scalać** — osobny plik na zapisującego, nie wspólny plik z regułą scalania opisaną prozą.
   **Fakt rozstrzygnięty przez wywołującego idzie do subagenta jako rozstrzygnięty** — agent
   widzi węższy materiał, więc go nie sprawdza i nie komentuje. **Zmiana formatu pliku, którego
   kopia w projekcie jest trwała, ma od razu drogę migracji kopii** (uzupełnienie brakującego pola
   po kluczu, reszta nietknięta). **Plik doczytywany, który ma działać na klasie `balanced`, ma
   drogowskaz w warstwie zawsze obecnej** — zdanie z wyzwalaczem i nazwą pliku; ogólne „wywołaj
   skill" Sonnet 5 pomija. **Drogowskaz działa tylko przy wyzwalaczu frazą z promptu** („coś nie
   działa"); krok wyzwalany kształtem zadania (każde zadanie z kodem) stoi w warstwie zawsze obecnej
   **sam, w skrócie**, a plik doczytywany niesie pełną procedurę.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis mieści się w **1 024 znakach** i mówi w trzeciej osobie, co skill robi i kiedy
   go użyć, z markerem projektu i płaską listą fraz — bez `MUST BE USED` (zmierzone 2026-09-24:
   opus i sonnet bez spadku; haiku nie jest kryterium). Każdy krok sięgający dalej ma zapisane
   wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym (zwykłym `grep -r`,
    nie `git grep`, który nie widzi plików nowych w etapie) i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. **Zachowanie zmienione, ale jeszcze niewydane, mierzysz artefaktem podłożonym lokalnie
    w projekcie kontrolnym** — hook przez `.claude/settings.json`, skill przez `.claude/skills/`
    pod **inną nazwą** niż wersja z pluginu; kolizja nazw znaczy, że nie wiesz, którą treść
    zmierzyłeś. Cały plugin podkładasz `claude -p --plugin-dir <kopia>` z wyłączoną instalacją
    (`--settings` z `enabledPlugins` na `false`) i sprawdzasz ścieżkę pluginu w zdarzeniu `init`.
    (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. **Numeracja i wytłuszczenie nagłówka są
    takim samym wariantem** — nagłówek w cudzej odpowiedzi rozpoznawaj z tolerancją na `## 2.`,
    `**…**` i poziom znaków `#`, a kształt, który raz przewrócił wzorzec, dokładaj do kontroli
    dosłownie w tym brzmieniu, w jakim go spotkałeś. **Regułę dostawcy przepisujesz po ponownym
    odczycie źródła, z zakresem, który źródło jej nadaje** — streszczenie w rejestrze gubi, dla
    którego modelu reguła powstała. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości**,
    inaczej guardrail zatrzymuje zdanie opisujące jego samego. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. Gdy narzędzie nie przyjmuje
    Twojego artefaktu, **najpierw sięgnij po jego własny walidator albo widok statusu**
    (`<narzędzie> validate`, `<narzędzie> list`, okno ustawień) — zna schemat, którego nie
    odtworzysz z obserwacji, a cisza w logu nie jest dowodem poprawności. (L-0041, L-0042, L-0044,
    L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". **Gdy prompt etapowy przeczy regule zapisanej
    w dokumencie docelowym, wygrywa dokument**, a rozjazd idzie do dziennika jako odstępstwo
    z powodem; z prompta wiążąca jest intencja, nie nazwa pliku.
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. **Kompozycję z tekstem budujesz w warstwie, która liczy układ** — HTML
    z `grid`/`flex`, wymiary w jednostkach kontenera, karty domknięte `overflow`; ręczne
    współrzędne zostają dla geometrii dekoracyjnej, nigdy dla treści, bo szerokość napisu jest
    wtedy szacunkiem metryki fontu. Dziecko wychodzące poza kontener to defekt blokujący,
    a instrument mierzący prostokąty ma kontrolę pozytywną na podłożonym przepełnieniu.
    **Kryterium materiału wizualnego wyrażasz w warunkach odbiorcy, nie autora** — szerokość, na
    jakiej realnie się wyświetli, i minimalna wysokość glifów przy tej szerokości; kontrola
    geometrii w skali renderu jest dodatkiem, nie zamiennikiem, i przechodzi zielono na materiale,
    którego nikt nie przeczyta. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest
    świadomym skutkiem dogfoodingu — nie „naprawiaj" go. **Nowy element zbioru wizualnego różnisz
    kształtem, nie detalem** — dwie ikony złożone z tych samych brył (trzy linie plus znaczek
    w rogu) czyta się jako jedną; porównanie robisz na podglądzie **całego zbioru** i w skali,
    w której element realnie się wyświetli. (L-0003, L-0006, L-0016, L-0019, L-0029,
    L-0094, L-0098)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Lekcje

> Lekcje L-0001 … L-0024 (24 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md](archiwum/lekcje/LEKCJE_L-0001_L-0024.md)
> — przeniesione 2026-08-12, suma kontrolna `bd5f9050dc7e7278`.

> Lekcje L-0055 … L-0069 (15 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0055_L-0069.md](archiwum/lekcje/LEKCJE_L-0055_L-0069.md)
> — przeniesione 2026-09-04, suma kontrolna `f71e94d2e913893b`.

> Lekcje L-0070 … L-0078 (9 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0070_L-0078.md](archiwum/lekcje/LEKCJE_L-0070_L-0078.md)
> — przeniesione 2026-09-14, suma kontrolna `d18c21a837531ba1`.

> Lekcje L-0079 … L-0088 (10 pozycji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0079_L-0088.md](archiwum/lekcje/LEKCJE_L-0079_L-0088.md)
> — przeniesione 2026-09-14, suma kontrolna `bbca7854a607be7b`.

> Lekcje L-0089 … L-0111 (23 pozycje) są w
> [docs/archiwum/lekcje/LEKCJE_L-0089_L-0111.md](archiwum/lekcje/LEKCJE_L-0089_L-0111.md)
> — przeniesione 2026-09-24, suma kontrolna `797c63f8e33a2a66`.

### L-0112 — Stan, który zapisuje model, nie może wymagać scalania · 2026-09-24 · AKTYWNA

- **Trigger:** plik zgody na tryb ciągły trzymał jeden rekord i równoległa sesja wyparła decyzję
  tej sesji. Pierwsza poprawka zamieniła rekord na mapę sesji w jednym pliku i dopisała regułę
  „wpisy innych sesji zostaw" — recenzent wskazał, że funkcja scalająca istnieje wyłącznie w testach,
  a plik nadal pisze model z prozy.
- **Przyczyna:** gdy zapisującym jest model, poprawność scalania zależy od tego, czy przeczyta
  zastany plik i odtworzy go w całości. To ta sama klasa błędu co nadpisanie, tylko rzadsza —
  a test funkcji, której produkcja nie woła, dowodzi niczego.
- **Zasada:** stan zapisywany przez model dostaje **kształt, w którym nie ma czego scalać** —
  osobny plik na zapisującego (tu: `zgoda-promptu/<id sesji>.json`), identyfikator sprawdzony przed
  złożeniem ścieżki. Kod, który czyta ten stan, jest jedynym miejscem logiki; test stawiasz na tym,
  co naprawdę robi zapisujący.
- **Źródło:** E1 planu PROWADZENIE_END_TO_END, pozycja S01; recenzja diffu przed wydaniem 2.3.1.
  Destylat: doklejone do zasady 8.

### L-0113 — Limit tur w pomiarze wyzwalania ucina drugi skill łańcucha · 2026-09-24 · AKTYWNA

- **Trigger:** pomiar „przygotuj plan…" na `--max-turns 4` dał opus 1/2 dla `relai-planning`.
  Transkrypt: sesja najpierw wywołuje `relai-core` (tak każe hook startu), czyta pliki rytuału
  i kończy się kodem limitu, zanim dojdzie do planowania.
- **Przyczyna:** limit tur był ustawiony pod jeden skill, a zdanie o planie w projekcie RelAI
  uruchamia **łańcuch** — rytuał startu, potem planowanie. Cisza drugiego skilla była zdaniem
  o instrumencie, nie o opisie.
- **Zasada:** limit tur w pomiarze ustawiasz z zapasem na **cały łańcuch**, który mechanizm
  uruchamia przed mierzonym krokiem, i czytasz kod wyjścia każdej sesji — wyjście limitem obok
  „nie wywołano" znaczy „nie zmierzono". Instrument poprawiony w trakcie idzie od nowa dla obu
  wariantów, nie tylko dla drugiego.
- **Źródło:** E1 planu PROWADZENIE_END_TO_END (K1); limit podniesiony do 8, pomiar „przed"
  powtórzony w całości. Destylat: doklejone do zasady 5.

### L-0114 — Opis skilla nie potrzebuje nacisku, żeby się wyzwalać · 2026-09-24 · AKTYWNA

- **Trigger:** opisy `relai-core` (~1 730 znaków) i `relai-planning` (~1 790) przekraczały limit
  1 024 znaków listy skilli i zaczynały się od `MUST BE USED` — zasada 9 każe tak zaczynać.
  Przepisane do 994 i 997 znaków, w trzeciej osobie, bez nacisku.
- **Przyczyna:** zasada 9 powstała na modelach, które pomijały skill bez nacisku; nowsze modele
  nadinterpretują wersaliki, a opis ucięty w liście traci frazy z końca.
- **Zasada:** opis skilla mieści się w **1 024 znakach** i mówi w trzeciej osobie, co skill robi
  i kiedy go użyć, z markerem projektu i płaską listą fraz. Zmierzone przed i po na zainstalowanym
  pluginie (`stream-json`, wywołanie `Skill`): opus i sonnet 4/4 w obu wariantach. Haiku jest
  niestabilny w obu (`relai-core` 3/6 → 2/6, `relai-planning` 0/6 → 0/6) i **nie jest kryterium** —
  decyzja człowieka z 2026-09-24: RelAI celuje w modele flagowe.
- **Źródło:** E1 planu PROWADZENIE_END_TO_END (M02+M09, K1); wydanie 2.3.1. Destylat: zasada 9
  przepisana.

### L-0115 — Kryterium w prompcie etapu przeczyło regułom, które etap wykonuje · 2026-09-24 · AKTYWNA

- **Trigger:** trzy punkty weryfikacji E2 okazały się nieosiągalne w brzmieniu promptu: sekcja ryzyk
  „≤ ~400 B na wiersz" wymagała kompresji komórek ryzyk `OTWARTE`, której specyfikacja zabrania;
  dziennik „≤ 90 KB" był osiągalny wyłącznie przy rotacji ryzyk **przed** dziennikiem (dolna granica
  104,5 KB); „najstarszy żywy wpis późniejszy niż najnowszy zarchiwizowany" przeczył regule
  ciągłości zakresu, bo 2026-09-14 było pięć wpisów, a trzy z nich były nietykalne.
- **Przyczyna:** autor promptu (rytuał „Na koniec" E1) spisał kryteria z intencji, nie z pomiaru
  materiału i nie z reguł `SPEC_ARCHIWUM.md` / `SPEC_DZIENNIK.md`.
- **Zasada:** kryterium liczbowe w prompcie etapu sprawdzasz **przy jego pisaniu** na materiale
  i wobec reguł specyfikacji, którą etap będzie wykonywał; wykonawca sprawdza je ponownie przed
  pracą, a rozjazd idzie do człowieka jednym pytaniem, nie do niedowiezionego punktu.
- **Źródło:** E2 planu PROWADZENIE_END_TO_END — dwa pytania do człowieka (kompresja ręczna za
  zgodą, brzmienie „nie wcześniejszy"). Destylat: zasada 4 uzupełniona.

### L-0116 — Heredoc w powłoce narzędzia gubi backslashe także w cudzysłowie · 2026-09-24 · AKTYWNA

- **Trigger:** skrypt z wyrażeniem `(?<!\\)\|` zapisany przez `cat <<'EOF'` trafił na dysk jako
  `(?<!\)\|` i wywalił się na `Invalid regular expression`; ten sam kłopot zamienił `'\n'` w kodzie
  wstawianym przez Pythona w dosłowny koniec linii w środku literału JS.
- **Przyczyna:** warstwa, przez którą narzędzie przekazuje komendę powłoce, zjada `\` zanim heredoc
  z cytowanym ogranicznikiem ma szansę go chronić.
- **Zasada:** plik z wyrażeniami regularnymi albo sekwencjami ucieczki powstaje narzędziem zapisu
  pliku (Write/Edit), nigdy heredokiem ani `node -e`/`python -c`; po zapisie sprawdzasz linię
  `cat -A`, zanim ją uruchomisz.
- **Źródło:** E2 planu PROWADZENIE_END_TO_END. Destylat: zasada 5 uzupełniona.

### L-0117 — Przeniesienie treści do innego pliku udaje poprawę każdej metryki pliku źródłowego · 2026-09-24 · AKTYWNA

- **Trigger:** po podziale `relai-core` licznik negacji na samym `SKILL.md` spadł z 296 do 159,
  zanim przepisano choć jedno zdanie — treść wyjechała do plików doczytywanych.
- **Przyczyna:** metryka „ile X jest w tekście" liczona na pliku, z którego zmiana przenosi treść,
  mierzy przeprowadzkę, nie zmianę.
- **Zasada:** gdy etap przenosi treść, metrykę treści liczysz na **całym pakiecie** (plik + pliki,
  do których treść trafiła), przed i po, tym samym licznikiem; liczba dla samego pliku źródłowego
  stoi obok jako informacja o rozkładzie, nigdy jako wynik.
- **Źródło:** E3 planu PROWADZENIE_END_TO_END (pakiet: 296 → 304 po przeprowadzce, 235 po
  przepisaniu). Destylat: zasada 4 uzupełniona.

### L-0118 — `git grep` po podbiciu wersji nie widzi plików, które etap właśnie utworzył · 2026-09-24 · AKTYWNA

- **Trigger:** `git grep "2\.4\.0"` po podbiciu numeru pokazał „czyste" repo, a nowy plik
  doczytywany `new-project.md` nadal wymagał markera `Wersja RelAI: 2.4.0` — plik był nieśledzony.
- **Przyczyna:** `git grep` przeszukuje wyłącznie pliki śledzone; pliki utworzone w etapie i jeszcze
  niedodane są dla niego niewidoczne.
- **Zasada:** kontrolę „stary numer nie zwraca nic" uruchamiasz zwykłym `grep -r` po drzewie
  (z wykluczeniem archiwum) albo po `git add` — nigdy samym `git grep` na drzewie z nowymi plikami.
- **Źródło:** E3 planu PROWADZENIE_END_TO_END. Destylat: zasada 10 uzupełniona.

### L-0119 — Ścieżka Windows w literale Pythona z heredoku zamienia się w znaki sterujące · 2026-09-24 · AKTYWNA

- **Trigger:** adnotacja z ścieżką cache'u `relai` / `relai` / `2.4.0` rozdzielaną backslashami,
  wstawiona skryptem Pythona z heredoku, trafiła do dziennika jako `\r` i `\x02` — tekst
  „relaielai.4.0" w dokumencie.
- **Przyczyna:** ta sama warstwa co w L-0116 zjada jeden poziom ucieczki, a Python interpretuje
  resztę jako sekwencje `\r` i `\2`.
- **Zasada:** powtórzenie L-0116 — tekst z backslashem wstawiasz narzędziem Edit/Write; ścieżki
  w dokumentach piszesz z ukośnikami `/`. Kandydat do graduacji do `CLAUDE.md` (propozycja
  w podsumowaniu etapu, decyzja człowieka).
- **Źródło:** E3 planu PROWADZENIE_END_TO_END, wykryte odczytem pliku po zapisie.

### L-0120 — Trwała kopia pliku w projekcie blokuje każdą zmianę jego formatu · 2026-09-24 · AKTYWNA

- **Trigger:** E4 dodał pole `family` do list modeli pluginu, a kopia listy w projekcie powstaje
  wyłącznie wtedy, gdy jej nie ma — właśnie po to, żeby odświeżenie komendą przeżyło start sesji.
  Każdy istniejący projekt zostałby na zawsze bez pola, a nakładka nie zadziałałaby nigdzie poza
  nowymi projektami. Plan tego nie przewidział; wyszło przy czytaniu hooka.
- **Przyczyna:** decyzja „kopii nie nadpisujemy" chroni treść, ale zamraża też kształt. Zmiana
  formatu źródła nie ma drogi do plików, które tę decyzję niosą.
- **Zasada:** zmieniając format pliku, którego kopia w projekcie jest trwała, projektujesz od razu
  **drogę migracji dla kopii** — uzupełnienie brakującego pola po kluczu, bez ruszania reszty —
  i mierzysz ją na realnej kopii sprzed zmiany (tu: 0 → 4 pozycje z polem, data listy bez zmian).
- **Źródło:** E4 planu PROWADZENIE_END_TO_END, `core/process/session-signals.js` (`uzupelnijRodzine`).

### L-0121 — Subagent sprawdza na nowo fakt rozstrzygnięty przez wywołującego i mówi nieprawdę · 2026-09-24 · AKTYWNA

- **Trigger:** sesja znalazła `gpt-6-astra` na liście Codeksa i przekazała agentowi optymalizatora
  linię z modelem docelowym i nakładką. Agent sam przejrzał listy, trafił tylko na listę Claude Code
  i napisał człowiekowi, że modelu „nie ma na listach" — obok propozycji poprawnie skrojonej pod
  jego nakładkę.
- **Przyczyna:** agent miał regułę „nazwy modeli wyłącznie z listy narzędzia" i potraktował ją jako
  obowiązek weryfikacji, choć widział węższy wycinek niż wywołujący.
- **Zasada:** fakt, który wywołujący rozstrzygnął na pełniejszym materiale, przekazujesz agentowi
  **razem ze zdaniem, że jest rozstrzygnięty** — agent go nie sprawdza i nie komentuje. Regułę
  „czytaj tylko z X" piszesz tak, żeby nie dało się jej przeczytać jako „sprawdź na nowo".
- **Źródło:** E4, przebieg kryterium `wynik-openai-2` → poprawka agenta → `wynik-openai-3`.

### L-0122 — Streszczenie źródła w rejestrze gubi to, do kogo źródło stosuje regułę · 2026-09-24 · AKTYWNA

- **Trigger:** rejestr planu opisał trzy zalecenia jako ogólne („wersaliki nadinterpretowane przez
  nowsze modele", „cel i ograniczenia bez kroków", „przewodnik promptów OpenAI"). Odczyt stron przed
  pisaniem nakładek pokazał: wersaliki strona wiąże z modelami 4.5 i 4.6, „cel bez kroków" —
  z modelami GPT-5, a adres przewodnika OpenAI przekierowuje na stronę najnowszego modelu.
- **Przyczyna:** streszczenie niesie treść reguły, a gubi jej zakres — dla kogo dostawca ją napisał.
- **Zasada:** regułę dostawcy przepisujesz dopiero po ponownym odczycie źródła i zapisujesz przy niej
  **zakres wskazany przez źródło**; reguła przeniesiona poza ten zakres stoi jako reguła rodziny
  z jawnym zdaniem, że dla pozostałych modeli jest hipotezą do pomiaru.
- **Źródło:** E4, `core/prompt/rodziny/claude.md` (C3), `openai.md` (O1, O4, nagłówek).

### L-0123 — Kryterium liczące wywołania narzędzia, którego tryb pomiaru nie ma · 2026-09-24 · AKTYWNA

- **Trigger:** punkt weryfikacji E5 kazał policzyć wywołania AskUserQuestion w przebiegu
  `claude -p` stream-json. Trzy przebiegi dały po 0 — nie dlatego, że bramka nie zadziałała, tylko
  dlatego, że w trybie `-p` (Claude Code 2.1.280) tego narzędzia nie ma w zdarzeniu `init`,
  a `--allowedTools` ani `--tools` go nie włączają. Kryterium wróciło do człowieka jako Aneks F.
- **Przyczyna:** autor kryterium sprawdził, że mechanizm da się uruchomić w trybie pomiaru, a nie
  sprawdził, że narzędzie, którego wywołania liczy, w tym trybie istnieje. Zero wywołań narzędzia
  nieobecnego wygląda tak samo jak zero wywołań narzędzia pominiętego.
- **Zasada:** kryterium liczące wywołania narzędzia zaczynasz od odczytu listy narzędzi w zdarzeniu
  `init` trybu, w którym będziesz mierzyć — przy pisaniu promptu etapu i ponownie przed pracą.
  Narzędzie nieobecne znaczy kryterium nieosiągalne: wraca do człowieka jako aneks z kryterium
  zastępczym na źródle, które mechanizm produkuje (wyjście hooka), a zachowanie w oknie aplikacji
  idzie do bramki manualnej.
- **Źródło:** E5 planu PROWADZENIE_END_TO_END, Aneks F; destylat: dopisane do zasady 4.

### L-0124 — Pomiar glifów w klatkach bierze szczeliny i przejścia za tekst · 2026-09-24 · AKTYWNA

- **Trigger:** instrument wysokości glifów na nowym GIF-ie zwrócił minimum 2,0 px przy materiale,
  który w DOM miał najmniejszy tekst 15 px przy 375 px. Minima pochodziły z trzech klas, które nie
  są tekstem: szczelin między jasnymi literami na ciemnym dymku (maska „ciemne = tusz"), klatek
  przenikania scen i ostatniej klatki w połowie wygaszania.
- **Przyczyna:** maska tuszu zakładała jeden kierunek kontrastu, a próbkowanie co N klatek nie
  odróżniało klatki stojącej od przejściowej. Stary materiał ma dodatkowo dryf plam tła, więc
  „klatka identyczna z sąsiadem" nie zachodzi w nim nigdy.
- **Zasada:** instrument czytelności mierzy wyłącznie **klatki ustalone** (czas ≥ 300 ms albo prawie
  zero zmienionych pikseli wobec sąsiada, z progiem podanym jawnie), osobną maską dla tekstu jasnego
  na ciemnym panelu, a ostatnia klatka nie jest ustalona z urzędu. Instrument poprawiony w trakcie
  mierzy od nowa **oba** materiały — nowy i kontrolny.
- **Źródło:** E5, `docs/zasoby/demo/zrodla/glify.py`; destylat: dopisane do zasady 5.

### L-0125 — Podłożony cytat kontrolny stał w korpusie, który miał go nie mieć · 2026-09-24 · AKTYWNA

- **Trigger:** kontrola pokrycia cytatów demo wzięła do korpusu cały `DEMO.md` (potrzebna była
  tabela promptów). Podłożony cytat kontrolny okazał się **pokryty**: `DEMO.md` opisuje kontrolę
  poprzedniego instrumentu i niesie dokładnie ten cytat.
- **Przyczyna:** korpus źródłowy zawierał dokumentację o poprzednim pomiarze, a nie tylko materiał,
  z którego cytaty pochodzą.
- **Zasada:** korpus kontroli pokrycia to wyłącznie materiał źródłowy — z dokumentu opisowego bierzesz
  sekcję, która jest zapisem, nie cały plik; cytat kontrolny jest nowy dla tego przebiegu, a nie
  przeniesiony z dokumentacji poprzedniego.
- **Źródło:** E5, `docs/zasoby/demo/zrodla/pokrycie.py`; destylat: dopisane do zasady 5.

### L-0126 — Sonnet pomija „wywołaj skill", więc plik doczytywany jest dla niego niewidoczny · 2026-09-24 · AKTYWNA

- **Trigger:** pierwszy realny przebieg procedury „coś nie działa" (E6): Sonnet 5 w 7 przebiegach
  ani razu nie wywołał skilla `relai-core`, choć hook startu kazał to zrobić — przeczytał pliki
  rytuału i od razu poprawił kod. Bez skilla nie znał ścieżki `debugging.md`. Opus 5.5 wywołał
  skill i przeszedł procedurę.
- **Przyczyna:** ogólne „jeśli dostępny jest skill, wywołaj go" model `balanced` traktuje jako tło,
  gdy prompt wygląda na zadanie. Frazy usterki w opisie skilla też nie pomogły (0/3).
- **Zasada:** procedura w pliku doczytywanym, która ma działać na klasie `balanced`, dostaje
  **drogowskaz w warstwie zawsze obecnej** — zdanie z konkretnym wyzwalaczem i nazwą pliku (hook
  startu: 3/3). Treść procedury zostaje w pliku; w warstwie startu stoi tylko wskazanie.
- **Źródło:** E6 planu PROWADZENIE_END_TO_END, Aneks J; destylat: dopisane do zasady 8.

### L-0127 — Zepsuta kopia hooka dała trzy „wyniki" pomiaru (powtórzenie L-0119) · 2026-09-24 · AKTYWNA

- **Trigger:** wariant hooka startu wstawiony do kopii pluginu heredokiem z `\'` — backslash
  zniknął, hook miał błąd składni i milczał. Trzy przebiegi Sonnetu wyglądały jak wynik „0/3".
- **Przyczyna:** tekst z backslashem przepuszczony przez powłokę (L-0116, L-0119) i brak kontroli
  pozytywnej, że zdanie hooka w ogóle dotarło do sesji.
- **Zasada:** przebieg z podłożonym hookiem zaczynasz od `node --check` na kopii i liczysz
  w transkrypcie **zdanie, które hook ma wstrzyknąć** — zero trafień unieważnia przebieg, nie jest
  wynikiem. Powtórzenie L-0119: propozycja graduacji do `CLAUDE.md`.
- **Źródło:** E6 planu PROWADZENIE_END_TO_END; destylat: dopisane do zasady 5.

### L-0128 — Drogowskaz do skilla nie uruchamia kroku, którego wyzwalaczem jest kształt zadania · 2026-09-24 · AKTYWNA

- **Trigger:** pierwszy realny przebieg kroku „testy i przegląd diffu" (E7, A26). Sonnet 5 bez
  zdania w hooku 0/2; z drogowskazem „zanim napiszesz, że gotowe, wywołaj skill relai-core
  i otwórz done-check.md" 1/3; z wyzwalaczem przeniesionym na start zadania 0/3. Opus 5.5 z każdym
  drogowskazem 3/3.
- **Przyczyna:** w E6 drogowskaz działał, bo prompt niósł dosłownie frazę wyzwalacza („coś nie
  działa"). Zadanie z kodem nie ma frazy — ma kształt; Sonnet kończy je w 3–4 turach, nie wywołując
  skilla wcale.
- **Zasada:** krok wyzwalany kształtem zadania stoi w warstwie zawsze obecnej **w skrócie, sam**
  (trzy punkty w hooku startu: Sonnet 3/3, Opus 2/2), a plik doczytywany niesie pełną procedurę.
  Drogowskaz zostaje dla procedur z frazą wyzwalacza.
- **Źródło:** E7 planu PROWADZENIE_END_TO_END, `.claude/relai/work/PROWADZENIE_END_TO_END/E7/przebieg.js`;
  destylat: dopisane do zasady 8.

### L-0129 — Linia „Ryzyka: brak." bez uruchomionego git diff · 2026-09-24 · AKTYWNA

- **Trigger:** reguła „(2) przejrzyj git status i git diff; (3) zgłoś Testy / Zmiana / Ryzyka" dała
  Sonnetowi trzy linie raportu w 3/3 przebiegów, ale `git diff` uruchomił w 1/3 — w pozostałych
  napisał „Ryzyka: brak." bez przeglądu.
- **Przyczyna:** format linii nie zależał od wyniku polecenia, więc linię dało się wypełnić
  z pamięci zmiany.
- **Zasada:** linia raportu poświadczająca krok bierze treść z wyniku polecenia tego kroku
  („Zmiana: <pliki z git status>", „Ryzyka: <lista albo: brak po przeglądzie git diff>"), a krok
  nazywa polecenie wprost („uruchom … i przeczytaj wynik"). Po poprawce: `git diff` 3/3.
- **Źródło:** E7, przebiegi `sonnet-l*` → `sonnet-m*`; destylat: dopisane do zasady 1.

### L-0130 — Backslash w skrypcie z heredoku, trzeci raz (powtórzenie L-0119, L-0127) · 2026-09-24 · AKTYWNA

- **Trigger:** w E7 dwa razy: skrypt Pythona z regexem JS w heredoku przewrócił powłokę
  („unexpected EOF"), a `\b` w zwykłym napisie Pythona stał się znakiem backspace (0x08) we
  wzorcu instrumentu — licznik linii „Ryzyka" przestał trafiać na przebiegach, które je miały.
- **Przyczyna:** ta sama co w L-0116/L-0119/L-0127 — tekst z backslashem przez warstwę, która go
  interpretuje (powłoka, literał Pythona).
- **Zasada:** bez zmian — skrypt z regexem piszesz narzędziem Write, a wzorzec sprawdzasz kontrolą
  pozytywną na materiale, który musi trafić. Trzecie powtórzenie wzmacnia otwartą propozycję
  graduacji do `CLAUDE.md`.
- **Źródło:** E7; destylat: zasada 5 (bez nowego brzmienia).

### L-0131 — Siatka po historii: 64 „trafienia", z czego 57 naprawionych później · 2026-09-24 · AKTYWNA

- **Trigger:** nowa kontrola „artefakt zmieniony bez podbicia wersji" puszczona po 160 commitach:
  64 ze 141 par (commit, artefakt) bez podbicia w tym samym commicie.
- **Przyczyna:** kontrola pisana dla drzewa roboczego (zmiana vs HEAD), a w historii rejestr bywał
  podbijany osobnym commitem rytuału — ta sama reguła, inna semantyka.
- **Zasada:** trafienia kontroli na historii dzielisz na „naprawione później" i „nigdy", zanim
  nazwiesz je defektem; zostało 7 (4 zmiany treści, 3 samego numeru wydania) — do dziennika,
  rejestru wstecz nie przepisujesz (decyzja człowieka).
- **Źródło:** E7, `historia.js` i `podzial.js`; destylat: dopisane do zasady 5.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
