# PROMPT_ETAP_1 — próg limitu z trzema poziomami zapisu i kolor baterii od progu

Plan: LIMIT_CHECKPOINT • Etap: **E1 z 4** • Wygenerowano: 2026-10-11 (autor: Fable 5.1, przy
akceptacji planu) • Wykonawca: **Opus 5.5 w świeżych sesjach** (D-85; STATUS planu), `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym narzędziu:
> **Opus 5.5** (lista modeli Claude Code z dnia `2026-10-08`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `medium` (etap mechaniczny: jedno ustawienie, jeden odczyt trójpoziomowy, jeden kolor;
> trudność jest w testach kolejności, nie w projekcie).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, reguła backslasha (L-0116) |
| `docs/plany/LIMIT_CHECKPOINT/PLAN.html` — sekcje 2, 5 (punkt 1), 6 (wiersz E1), 7 (L4), 8 | cele, przebieg odczytu progu, zakres E1, ryzyko wspólnej funkcji, przypadek „brak danych limitów” |
| `docs/plany/LIMIT_CHECKPOINT/STATUS.md` | bramki manualne — jedna otwarta dotyczy E1 (przepięcie `prompt-mode.js`) |
| `cache-keeper/hooks/core.ts` | `Settings`, `DEFAULT_SETTINGS`, `applySetting` (`/cache <klucz> <wartość>`) — tu wchodzi `limitWarn` |
| `cache-keeper/hooks/rings.ts` | `limitMeasure`, `Limit`, kolory baterii — tu wchodzi kolor od progu |
| `cache-keeper/hooks/register.tsx` — `mergeSettings`, `session.start`, hook `session.measure`, `bandView`, `maxLimitPercent` (`:295-304`) | gdzie ustawienia są czytane, gdzie limity trafiają do baterii; co **nie** zmienia się w E1 (podtrzymanie) |
| `cache-keeper/hooks/core.test.ts`, `rings.test.ts`, `commands.test.ts` | konwencja testów (`claude-code/testing`, `mock.clock`) do rozszerzenia |
| `core/process/prompt-mode.js` — `plikZgodySesji`, odczyt wiersza globalnego i projektowego; `core/process/tests/prompt-mode.test.js:169-282` | wzór trzech poziomów (sesja → projekt → globalnie) i jego testy — kopiujesz zasadę, nie kod |
| `core/templates/SPEC_USTAWIENIA.md` — wiersze `Tryb ciągły` (`:102`, `:128`, `:412`) i `Zgoda na optymalizator` (`:482`) | jak specyfikacja opisuje wiersz ustawienia z wartością domyślną i warstwą globalną |
| `docs/PULAPKI.md` — P-017, P-022, P-024 | import tylko z folderu pluginu; `prompt.submit` z `/`; binarka testów 2.1.295 poza PATH |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Próg domyślny **90 %**; opcje 85 / 90 / 95 / własna liczba całkowita 1–99 (Łukasz 2026-10-11,
  akceptacja planu).
- Trzy poziomy zapisu progu i kolejność odczytu: plik sesji `.claude/relai/limit/<id>.json` →
  wiersz `Próg limitu` w `docs/USTAWIENIA.md` → wiersz `Próg limitu` w `~/.claude/relai/USTAWIENIA.md`
  → 90. Wzór: zgoda optymalizatora (sekcja 5 planu, punkt 1).
- `limitWarn` jest **osobnym** ustawieniem od `maxLimitPercent` — pierwsze ostrzega o pracy (ten
  plan), drugie zatrzymuje podtrzymanie cache (Z9). Podtrzymania w E1 nie dotykasz.
- Karta po turze, warunek „praca trwa” i licznik tur to **E2**; procedura zapisu to **E3**; przycisk
  wznowienia, brief v3.3, README i wydania to **E4**. W E1 nic z tego nie powstaje — nawet jako
  szkic.
- Zmiany w rdzeniu panelu `core/panel/` są poza zakresem (kontrakt PANEL_CODEX); kopie rdzenia
  w pluginach synchronizuje `node core/tools/sync-panel-core.js`, czego E1 nie uruchamia w trybie
  zapisu.
- **Bramka otwarta, rozstrzygana na starcie tej sesji jednym pytaniem (AskUserQuestion):** czy
  wspólna funkcja trójpoziomowego odczytu w `core/process/` ma od razu przepiąć zgodę optymalizatora
  (`prompt-mode.js` + testy, +0,5 sesji SZACUNEK), czy tylko być gotowa z testami parytetu. Domyślna
  propozycja: **tylko gotowa** — przepięcie zapisujesz jako „świadomie odłożone”. Bez odpowiedzi
  pracujesz w wariancie domyślnym i mówisz to we wpisie.
- Dokumenty projektu, które E1 dotyka, podbijają wersję w `docs/ARTEFAKTY.md`, jeśli są tam
  zarejestrowane (`SPEC_USTAWIENIA.md` jest).

## Stan wyjściowy — co realnie zastajesz

RelAI 2.8.0; `relai-cache-keeper` 0.5.0 zmierzony na silniku 2.1.295 (FAKT). Pięć baterii nad
promptem (cache, limit 5 h, reset za, limit tygodnia, kontekst); `S.rateLimits` odświeżane po turze
głównej i w hooku `session.measure` (`register.tsx:728`, `:748`); jedyny próg na limitach to
`maxLimitPercent` (domyślnie 90) dla podtrzymania (`register.tsx:295-304`). Ustawienia w `$.store`
pod kluczem `settings`, zmieniane przez `/cache <klucz> <wartość>` (`core.ts` `applySetting`:
`ttl`, `strażnik`, `alerty`, `próg`, `progi`, `godziny`, `limit`, `payback`). Testy: 11 plików,
81 miejsc `test(` (FAKT, 2026-10-11), uruchamiane `claude plugin test cache-keeper` binarką
aplikacji (P-024). Plik sesji zgody optymalizatora i wiersze ustawień istnieją jako wzór
w `core/process/prompt-mode.js`.

```
cache-keeper/hooks/core.ts          # Settings, DEFAULT_SETTINGS (maxLimitPercent: 90), applySetting, mergeSettings
cache-keeper/hooks/rings.ts         # Limit, limitMeasure(name,label,window,limit,now), resetMeasure, kolory RING/BAR
cache-keeper/hooks/register.tsx     # stan S, session.start (loadPrices, settings), session.measure, bandView, keepWarmStep
cache-keeper/hooks/economics.ts     # tempo tur i prognoza (E2 użyje; E1 nie dotyka)
cache-keeper/hooks/handoff.ts       # /handoff (E3 użyje; E1 nie dotyka)
cache-keeper/hooks/*.test.ts        # 11 plików, claude-code/testing, mock.clock
cache-keeper/.claude-plugin/plugin.json   # 0.5.0; bez userConfig
core/process/prompt-mode.js         # trzy poziomy zgody optymalizatora (wzór)
core/process/tests/prompt-mode.test.js
core/templates/SPEC_USTAWIENIA.md   # specyfikacja wierszy ustawień, warstwa globalna
docs/USTAWIENIA.md, ~/.claude/relai/USTAWIENIA.md   # tabele preferencji (projekt / globalnie)
```

**Czego jeszcze nie ma:** ustawienia `limitWarn` i komendy `/cache limit-warn`; pliku
`cache-keeper/hooks/limit.ts` z odczytem trójpoziomowym; pliku sesji `.claude/relai/limit/<id>.json`;
wiersza `Próg limitu` w `SPEC_USTAWIENIA.md` (projekt i warstwa globalna); koloru baterii limitu
zależnego od progu; wspólnej funkcji odczytu w `core/process/`; testów kolejności odczytu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

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
   (AskUserQuestion w `claude -p`) nie da się policzyć, a zero wygląda jak sukces. **Kryterium
   wyszukujące wzorzec nie przeszukuje plików, które ten wzorzec cytują** — prompt etapu łapie sam
   siebie. **Tekst, który tłumaczy liczbę, ma warunek prawdziwości i test dla stanu docelowego**,
   nie tylko dla sesji pomiarowej, w której powstał (L-0144). **Test na realnym pliku, którego stan
   zmienia proces (checkboxy, statusy), sam ustawia stan wyjściowy**, a licznik testów do dziennika
   pochodzi z przebiegu po ostatniej zmianie przed commitem (L-0150). **Pytanie o zasięg zmiany
   pliku stawiasz po sprawdzeniu, czy plik nie jest generowany z innego** — opcja, której kontrola
   parytetu nie przepuści, nie trafia do pytania jako wykonalna (L-0154). **Zmianę dowodzisz na
   widoku, który obejmuje zbiór z jej rekordami** — sprawdzasz, na którym ekranie liczba się zmienia,
   nie tylko że się zmienia (L-0155). **Test na realnym materiale bierze plik śledzony przez gita
   albo własną fixturę** — plik z `.gitignore` daje zielony test tylko na drzewie roboczym (L-0156).
   **Widok rysowany z danych projektu mierzysz na prawdziwych danych w najgorszym stanie** (wszystko
   rozwinięte) i ograniczasz go w kodzie — harness przyjmuje drzewo, które desktop gubi bez słowa
   (L-0158). **Diagnozę na żywo zaczynasz od znacznika wersji w logu** — przeładowanie potrafi
   zostawić starą wersję i każdy wniosek z niej jest fałszywy (L-0159).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku zapisanym
   narzędziem zapisu, nie w `node -e` ani w heredoku, a tekst z backslashem (także ścieżkę
   Windows) wstawiasz Edit/Write albo piszesz z `/` (L-0116, L-0119); **skrypt edycji kodu, który
   niesie `\n` albo ścieżkę Windows, powstaje narzędziem Write — heredok bez wyjątku „tylko ten
   jeden raz"** (L-0148); scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
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
   zanim nazwiesz je defektem (L-0131). **Wiersz z backslashem w kodzie wstawiasz tylko Edit/Write,
   także przy edycji zbiorczej** — skrypt Pythona z heredoku zgubił poziom ucieczki dwa razy w jednym
   etapie (L-0135); w E3 trzeci raz, `node -` z heredoku — sprawdzaj wynik grepem stałego ciągu.
   **Instrument w środowisku bez `append` pisze plik na proces** — dwóch pisarzy jednego pliku
   kasuje sobie wiersze (L-0141). **Porównanie dwóch plików kasuje oba przed przebiegiem** i
   sprawdza, że oba powstały teraz — nieudany zapis wygląda jak zgodność ze starym wynikiem (L-0143).
   **Stan „przed" mierzysz w osobnym `git worktree` HEAD-a**, nie po `git stash` — stash zostawia
   pliki nieśledzone i daje drzewo mieszane (L-0151). **Skrypt usuwający zakres linii sprawdza
   cały blok, nie jego brzegi**, a po każdym cięciu idzie kompilator (L-0160). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160)
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
    **Wydanie zestawia zmiany artefaktów od poprzedniego tagu z rejestrem `ARTEFAKTY.md`
    i `git ls-files` pakietu z listą plików generowanych** — luka etapu wychodzi wtedy przy
    wydaniu, nie po nim (L-0161).
    (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
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
    odtworzysz z obserwacji, a cisza w logu nie jest dowodem poprawności. **Zielony walidator, typy
    i testy modu nie dowodzą zachowania w łańcuchu wtyczek** — to mierzysz na żywo, a ciszę na żywo
    najpierw sondą (licznik wywołań hooka, wynik `next`) (P-017). **Wszystko, co dostaje `$` albo
    `on`, mieszka w pliku modułu hooków** — walidator modów nie śledzi `$` przez import; na zewnątrz
    wynosisz tylko czystą logikę, a `plugin validate` puszczasz zaraz po podziale pliku.
    **Typy silnika mówią, co powierzchnia przyjmie, nie co tabela elementów niesie w czasie
    wykonania** — gałąź „desktop / terminal" rozstrzygasz polem powierzchni z wejścia, a test
    sprawdza **obecność odpowiednika** na drugiej powierzchni, nie tylko brak grafiki. Każde
    drzewo trafia do `plugin test` z montażem i kliknięciem, **zanim** człowiek zobaczy je na
    żywo — błąd czasu wykonania (nazwa fabryki JSX przesłonięta zmienną) przechodzi `validate`.
    **Kontekst sesji, który zmienia się w jej trakcie (katalog bieżący), nie jest stałą** — mod
    wyznacza korzeń projektu wejściem w górę od niego, a test ma przypadek sesji w podfolderze (L-0146).
    **Sonda, która mierzy działanie niszczące (`/clear`, kasowanie), stoi w sesji, której utrata nic
    nie kosztuje** — albo przycisk ma osobne potwierdzenie; stan etapu i wynik sondy są w pliku
    przed każdym takim krokiem (L-0153).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153)
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
    w której element realnie się wyświetli. **Plan z interfejsem dla człowieka wskazuje źródło
    motywu i kryterium wyglądu w pierwszym etapie, który rysuje więcej niż linię tekstu**, a zrzut
    do kalibracji smaku pada przed dokończeniem etapu, nie przy pomiarze na żywo.
    **Na nośniku z ograniczonym zestawem elementów sonda ustala pułap, zanim powstanie projekt**,
    a warianty do kalibracji rysujesz **w tym samym nośniku** (mod z przełącznikiem wariantów),
    nie w makiecie, która obiecuje typografię i ruch, których silnik nie narysuje; ograniczenie
    nośnika mówisz człowiekowi wprost razem z opcjami, które realnie są.
    **Rysunek idzie do człowieka po renderze w Chromium z pomiarem prostokątów** (każdy w osobnym
    `iframe`, kontrola na podłożonym defekcie) — test montażu widzi element, nie obraz (L-0142).
    **W raporcie liczb procenty i kwoty mają dwa miejsca po przecinku**; zaokrąglenie zmieniające
    odczyt jest błędem (L-0145). **Etykieta stanu nazywa stan słowem i znakiem** — zapis „x/y" tylko
    tam, gdzie y jest celem; brak danych i brak ceny to dwa różne komunikaty (L-0147). **Słowo, które
    twierdzi fakt o przeszłości („sprzed znacznika", „zmierzono"), ma warunek prawdziwości na
    danych** i test na materiale, gdzie warunek nie zachodzi (L-0149). **Komórka liczby w wierszu
    ma `flexShrink={0}`** — ustępuje nazwa; test sprawdza tę właściwość, a zrzut z terminala jest
    częścią pomiaru (L-0152). **Karta decyzji pokazuje w całości tylko pozycje, które decyzja zmienia
    dla człowieka**, resztę jednym wierszem z liczbą i nazwami; stawka nie jest kwotą — ma tyle
    miejsc, ile ma źródło (L-0157).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/LIMIT_CHECKPOINT/E1/`.** Wszystko tymczasowe —
skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt,
który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`cache-keeper/hooks/core.ts`** — `Settings.limitWarn: number` (domyślnie 90), komenda
   `/cache limit-warn <85|90|95|N>` w `applySetting` (liczba całkowita 1–99, inaczej `fail` ze
   zrozumiałym tekstem po polsku jak pozostałe); `/cache` bez argumentów pokazuje `limitWarn`
   razem ze **źródłem** progu (sesja / projekt / globalnie / domyślny). `maxLimitPercent` bez zmian.
2. **`cache-keeper/hooks/limit.ts`** (nowy) — `thresholdOf(io)`: odczyt w kolejności plik sesji
   `.claude/relai/limit/<id>.json` (`{"prog": 85, "data": "RRRR-MM-DD", "zrodlo": "sesja"}`) →
   wiersz `Próg limitu` w `docs/USTAWIENIA.md` → wiersz `Próg limitu` w `~/.claude/relai/USTAWIENIA.md`
   → `settings.limitWarn` → 90; wynik `{ value, source }`; wartości spoza 1–99 i nieliczby pomijane
   z przejściem na następny poziom; `rememberThreshold(io, value, scope)` zapisujący wybór
   w zasięgu `sesja` (plik) — zasięgi `projekt` i `globalnie` dopisują wiersz z dzisiejszą datą do
   właściwej tabeli ustawień (ten sam kształt wiersza co `Tryb ciągły`). Odczyt plików przez `$.fs`
   podany parametrem, nie importem — testy podstawiają atrapę. Walidacja identyfikatora sesji jak
   w `prompt-mode.js` (`/^[A-Za-z0-9_-]{1,128}$/`).
3. **`cache-keeper/hooks/rings.ts`** — `limitMeasure` przyjmuje próg i od progu w górę zwraca
   kolor ostrzegawczy z `BAR`/`RING` (istniejąca paleta, bez nowych kolorów); opis `b` baterii
   niesie „próg N %”. `register.tsx` przekazuje próg do obu baterii limitu i przelicza go przy
   `session.start`, `/cache limit-warn` i `session.measure`.
4. **`core/process/threshold.js`** (nowy, Node 14+, bez zależności) — ta sama kolejność odczytu
   dla hooków pluginu `relai` (wiersze projektowy i globalny, plik sesji), z testem
   `core/process/tests/threshold.test.js` na fixturach; **test parytetu** z `limit.ts`: oba
   czytają te same fixtury i dają ten sam wynik (fixtury w `core/process/tests/fixtures/limit/`).
   Przepięcie `prompt-mode.js` tylko po „tak” z bramki — inaczej „świadomie odłożone”.
5. **`core/templates/SPEC_USTAWIENIA.md`** — wiersz `Próg limitu` (projekt: wartość domyślna 90,
   kto czyta, od jakiej wersji) i jego odpowiednik w warstwie globalnej; podbicie wersji w
   `docs/ARTEFAKTY.md`. `docs/USTAWIENIA.md` tego repo dostaje wiersz tylko wtedy, gdy Łukasz
   wybierze próg inny niż domyślny — nie dopisujesz 90 na zapas.
6. **Testy** — `core.test.ts` (walidacja `limit-warn`, komunikaty), nowy `limit.test.ts` (kolejność
   czterech poziomów + domyślne, wartości nieprawidłowe pomijane, plik sesji innej sesji
   ignorowany, zapis w trzech zasięgach), `rings.test.ts` (kolor poniżej / na / powyżej progu,
   `brak danych` bez koloru ostrzegawczego). Każdy nowy test pada na starym kodzie (kontrola
   pozytywna do wpisu).
7. **Ślady:** wpis w dzienniku; STATUS; **bez wydania i bez podbicia wersji pluginu** — to E4.

## Weryfikacja — wszystkie punkty muszą przejść

- [ ] `claude plugin test cache-keeper` binarką aplikacji 2.1.295 (ścieżka z P-024): wszystkie
      testy zielone; liczba testów ≥ 81 + 12 nowych; wynik „przed” (nowe testy ✖ na starym kodzie)
      i „po” we wpisie dziennika.
- [ ] `node --test` w zakresie repo (komenda z `package.json`): 263 + nowe (`threshold.test.js`
      i parytet) zielone.
- [ ] Kolejność odczytu zmierzona testem na fixturach: sesja 85 + projekt 95 + globalnie 80 → 85;
      bez pliku sesji → 95; bez wiersza projektu → 80; nic → `limitWarn`; `limitWarn` niezmieniony
      → 90 z `source: 'domyślny'`.
- [ ] `/cache limit-warn 101`, `/cache limit-warn abc`, `/cache limit-warn 0` → odrzucone tekstem
      po polsku; `/cache limit-warn 85` → `limitWarn` 85 w `$.store` i `/cache` pokazuje „85 % (sesja)”.
- [ ] Dowód negatywny: `maxLimitPercent` i `keepWarmStep` mają brzmienie sprzed etapu
      (`git diff` nie dotyka `register.tsx:290-310` poza przekazaniem progu do baterii); test
      podtrzymania z `correctness.test.ts` nadal zielony.
- [ ] Dowód negatywny: w E1 nie ma `$.ui.ask` w hooku `session.measure` ani nowego
      `$.prompt.submit` — `grep -n "ui.ask\|prompt.submit" cache-keeper/hooks/register.tsx`
      zwraca tylko wystąpienia sprzed etapu (lista we wpisie).
- [ ] Na żywo (Łukasz, desktop 2.1.295, po `plugin update` albo kopii lokalnej): `/cache limit-warn 1`
      → bateria „limit 5 h” w kolorze ostrzegawczym z opisem „próg 1 %”; `/cache limit-warn 90`
      → kolor zwykły; zrzut do `docs/zasoby/PANEL_RELAI/zrzuty/` z nazwą etapu.
- [ ] `node core/tools/validate-adapters.js` exit 0; `node core/tools/sync-panel-core.js --check`
      zgodny; `claude plugin validate cache-keeper` exit 0.
- [ ] Podstawy bezpieczeństwa na zmianie tego etapu: wartość z `/cache limit-warn` parsowana jako
      liczba całkowita 1–99, zanim trafi do `$.store` (test); wiersz z `USTAWIENIA.md` czytany
      wzorcem, nieliczba pomijana (test); identyfikator sesji walidowany przed złożeniem ścieżki
      pliku (test na `../`); `git grep` po wzorcach kluczy (`sk-`, `api_key`) w zmienionych plikach
      nie zwraca nic. Audyt zależności: `cache-keeper/package.json` nie istnieje w dniu generacji
      (sprawdź `ls`); jeśli nadal nie istnieje, zapisz to we wpisie i punkt nie dotyczy; jeśli
      istnieje — `npm audit --omit=dev` z wynikiem do wpisu.
- [ ] `docs/ARTEFAKTY.md`: `SPEC_USTAWIENIA.md` ma nową wersję z „co” i „po co”.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/LIMIT_CHECKPOINT/E1/`: **(a)** przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we
      wpisie; **(b)** artefakty spoza katalogu wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. **`docs/plany/LIMIT_CHECKPOINT/STATUS.md`** — E1 → `ZREALIZOWANY 2026-MM-DD`; E2 →
   `GOTOWY DO STARTU`; linia „E1 rozpoczęty” zastąpiona linią wynikową; bramka o przepięciu
   `prompt-mode.js` → `ROZSTRZYGNIĘTA` z odpowiedzią.
1a. **Katalog roboczy** `.claude/relai/work/LIMIT_CHECKPOINT/E1/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z punktu 2.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka); przegląd tabeli ryzyk (L4 po E1: poziom
   i mitygacja); lekcje → `docs/LEKCJE.md` i „Zasady aktywne”.
3. **Bramki manualne** w `STATUS.md` z sekcji „Do zrobienia przez człowieka” wpisu.
4. **`docs/STATE.md`** (pozycja LIMIT_CHECKPOINT w „Nad czym pracujemy teraz”: E1 zamknięty,
   E2 następny) i tabela w `CLAUDE.md`; `README.md` bez zmian (sposób uruchomienia się nie zmienia).
5. **Wygeneruj `PROMPT_ETAP_2.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` — z sekcji
   5 (punkty 2–3) i 6 (wiersz E2) `PLAN.html`, z realnego stanu po E1 (nazwy funkcji z `limit.ts`,
   kształt `thresholdOf`) i z lekcji tego etapu; link w kolumnie `Prompt` przy E2.
6. **Commit** — propozycja, conventional (EN), bez wydania.
