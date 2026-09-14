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
   nie jako wyjątek do obejścia w wykonaniu. (L-0001, L-0011, L-0026, L-0089, L-0100)
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
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
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
   odsiewu podajesz jawnie i pokazujesz cały zbiór obok wyniku. (L-0032, L-0037, L-0095, L-0096,
   L-0097,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091)
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
   fałszem. (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099)
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
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. **Zachowanie zmienione, ale jeszcze niewydane, mierzysz artefaktem podłożonym lokalnie
    w projekcie kontrolnym** — hook przez `.claude/settings.json`, skill przez `.claude/skills/`
    pod **inną nazwą** niż wersja z pluginu; kolizja nazw znaczy, że nie wiesz, którą treść
    zmierzyłeś. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. (L-0033, L-0038, L-0057, L-0062, L-0067)
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
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
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
    świadomym skutkiem dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029,
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

### L-0079 — Zamknięta lista brzmień przełącznika jest związana z rodzajem nazwy wiersza · 2026-09-03 · AKTYWNA

- **Trigger:** nowy wiersz `Artefakty robocze | włączone · 100 MB` odczytany przez rdzeń wyszedł
  jako **wartość nierozpoznana**. Wzorzec `WLACZONY` w `session-signals.js` zna `włączony`
  i `włączona` — bo wszystkie dotychczasowe wiersze mają nazwę w rodzaju męskim albo żeńskim
  (`Budżet`, `Rotacja`, `Przegląd`). Nazwa w liczbie mnogiej wymusza `włączone`, którego tam nie ma.
- **Przyczyna:** zamknięta lista brzmień była pisana pod konkretne wiersze, a nie pod język. Defekt
  nie milczy — mechanizm ratunkowy zadziałał i wypisał linię o nierozpoznanej wartości — ale wygląda
  wtedy na błąd człowieka w ustawieniach, a nie na dziurę we wzorcu.
- **Zasada:** dokładając wiersz czytany maszynowo, sprawdź, czy jego nazwa wymusza inną **formę
  gramatyczną** przełącznika niż wiersze istniejące. Wymusza → dołóż **własną parę wzorców dla tego
  wiersza**, a nie poszerzaj wspólnej listy: poszerzenie zmienia po cichu, co przechodzi w każdym
  innym mechanizmie, i nikt tego nie mierzy.
- **Źródło:** E2 planu SPRZATANIE_ARTEFAKTOW (2026-09-03), 15 z 29 testów czerwonych na jednej
  przyczynie.

### L-0080 — Kryterium nieosiągalne wskaż pomiarem wariantu bez wkładu etapu · 2026-09-03 · AKTYWNA

- **Trigger:** punkt weryfikacji „pełny zestaw przekroczeń mieści się w sześciu liniach raportu
  startu" dał na materiale kontrolowanym **14 linii**. Sam blok `[RelAI przeglad spraw]` ma ich osiem
  (nagłówek + pięć spraw + „i N dalszych" + ZADANIE) i wszedł do produktu w 1.7.0.
- **Przyczyna:** kryterium liczy sumę linii **wszystkich** bloków, a limit sześciu linii jest
  własnością jednego z nich (`startCostReport`, tam 5 z 6). Bez drugiego pomiaru nie da się odróżnić
  „etap zepsuł raport" od „kryterium było nieosiągalne, zanim etap się zaczął".
- **Zasada:** punkt weryfikacji o kształcie „całość mieści się w N" mierz **dwa razy w jednym
  przebiegu**: z wkładem etapu i bez niego (wyłącznik, usunięty wiersz, wariant konfiguracji).
  Różnica jest wkładem etapu i to ona podlega ocenie; wynik bezwzględny idzie do człowieka razem
  z obiema liczbami, a nie do dziennika jako „niedowieziony punkt".
- **Źródło:** E2 planu SPRZATANIE_ARTEFAKTOW (2026-09-03); zmierzone 13 linii bez wiersza
  `Artefakty robocze` i 14 z nim.

### L-0081 — Ścieżka Windows w JSON-ie na stdin hooka milczy tak samo jak brak markera · 2026-09-03 · AKTYWNA

- **Trigger:** ręczne wywołanie hooka startu z powłoki (`printf … | node session-context.js`) ze
  ścieżką `C:\Users\…` dało **zero znaków** — dokładnie taki sam wynik, jaki daje folder niebędący
  projektem RelAI i jaki jest poprawnym wynikiem punktu weryfikacji „cisza poniżej progu".
- **Przyczyna:** `\U`, `\L`, `\D` nie są poprawnymi sekwencjami ucieczki w JSON-ie, więc
  `JSON.parse` rzuca, a hook z założenia milczy przy każdym wyjątku. Instrument produkuje wtedy
  fałszywy dowód **na korzyść tezy**, którą ma sprawdzać.
- **Zasada:** ścieżkę Windows w payloadzie hooka podawaj z ukośnikami zwykłymi (`C:/Users/…`) albo
  buduj payload `JSON.stringify`, nie ręcznie. Punkt weryfikacji, którego poprawnym wynikiem jest
  cisza, sprawdzaj **parą przebiegów**: jeden musi dać niepustą odpowiedź, inaczej mierzysz awarię
  instrumentu.
- **Źródło:** E2 planu SPRZATANIE_ARTEFAKTOW (2026-09-03), dowód ciszy hooka po sprzątaniu.

### L-0082 — Kryterium „fraza zniknęła" postawione na katalogu łapie zdania, które ją opisują · 2026-09-03 · AKTYWNA

- **Trigger:** punkt weryfikacji E3 brzmiał „`git grep` po martwej frazie w `core/templates/`
  zwraca zero trafień". Po wykonaniu całego zakresu trafienia były **dwa**: zdanie tego etapu
  wyjaśniające, dlaczego stary punkt nie wystarcza, i wzmianka historyczna z etapu poprzedniego
  („punkt … mówił wyłącznie o repozytorium") w pliku oznaczonym w prompcie jako `BEZ ZMIAN`.
- **Przyczyna:** fraza usuwana jest jednocześnie **nazwą rzeczy usuwanej**. Zakres postawiony na
  katalogu obejmuje więc nie tylko wystąpienia normatywne, ale też każdy opis zmiany — w tym opis,
  który sam etap dopiero napisze. Wzmianka z E2 istniała w HEAD **przed** startem etapu, więc
  kryterium było nieosiągalne od chwili napisania promptu, a nie z powodu wykonania.
- **Zasada:** kryterium „fraza zniknęła" zawężaj do **pliku, który frazę niósł**, nie do katalogu,
  i **policz trafienia w HEAD, zanim zaczniesz pracę** — liczba większa od liczby miejsc, które
  etap ma zmienić, znaczy, że kryterium mierzy coś innego, niż zakładasz. Własne wyjaśnienie
  zmiany pisz **bez cytowania** usuwanej frazy.
- **Źródło:** E3 planu SPRZATANIE_ARTEFAKTOW (2026-09-03), punkt przeformułowany za zgodą
  właściciela. Wzmocnienie zasady 4 („kryterium sukcesu sprawdzasz na materiale, zanim zaczniesz
  pracę") — bez własnej pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0083 — Instrument porównujący dwa drzewa musi odtwarzać materiał między wariantami · 2026-09-03 · AKTYWNA

- **Trigger:** instrument odnogi GUARD_PO_SCIEZCE uruchamiał ten sam scenariusz najpierw na drzewie
  sprzed zmiany, potem na drzewie po zmianie. Scenariusz Z3 dał `dopisana linia-marker` przed
  i `brak — marker juz stoi` po — wyglądało to na zmianę zachowania, a było skutkiem tego, że
  **pierwszy przebieg dopisał linię do `.gitignore` materiału kontrolnego**, a drugi zastał ją
  na miejscu.
- **Przyczyna:** mierzona funkcja miała efekt uboczny na materiale. Dwa warianty w jednym
  przebiegu (L-0040) dzielą wtedy nie tylko wejście, ale i stan — a różnica w wyniku pochodzi
  z kolejności wywołań, nie z kodu.
- **Zasada:** instrument porównawczy **odtwarza materiał przed każdym wariantem**, a na końcu
  dowodzi, że materiał wyszedł nietknięty — sumą kontrolną pliku, który miał zostać bez zmian.
  Scenariusz dobieraj tak, żeby trafiał w sprawdzenie, które mierzysz: ścieżka ignorowana wzorcem
  z korzenia nie dociera do `git check-ignore`, bo wcześniej łapie ją czytanie markerów.
- **Źródło:** odnoga GUARD_PO_SCIEZCE (2026-09-03), `instrument-clean.js`. Wzmocnienie zasad 4
  i 5 — bez własnej pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0084 — Niedostępność cudzej usługi jest stanem chwilowym, nie własnością świata · 2026-09-03 · AKTYWNA

- **Trigger:** punkt weryfikacji E1 wymagał treści pytania ze świeżej sesji. L-0032 (2026-08-21)
  mówi, że `claude -p` uwierzytelnia się z własnego pliku poświadczeń, a konto tam zapisane ma
  wyczerpany limit — na tej podstawie punkt był o krok od opisania jako niewykonalny i oddania
  człowiekowi. Jedno tanie wywołanie kontrolne (`claude -p` z modelem Haiku) **przeszło**.
- **Przyczyna:** lekcja zapisała stan cudzej usługi z konkretnego dnia, a przy czytaniu została
  wzięta za trwałą właściwość narzędzia. Odnoga `POMIAR_ODNOG` została na jej podstawie anulowana,
  a ryzyko R2 zamknięte słowami „nie zostanie zmierzone nigdy".
- **Zasada:** zanim odpiszesz pomiar jako niewykonalny **z powodu cudzej usługi** — limit konta,
  brak dostępu, awaria API — sprawdź ją **jednym najtańszym wywołaniem w tej sesji**. Lekcja o cudzej
  usłudze niesie datę i jest hipotezą do odświeżenia, nie werdyktem. Dotyczy to również lekcji
  własnych: wpis mówi, co było prawdą tamtego dnia.
- **Źródło:** E1 planu REKOMENDACJA_MODELU (2026-09-03). Wzmocnienie zasady 5 (człon o wyczerpanym
  limicie) — bez własnej pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0085 — Zachowanie zależne od wydania mierzysz artefaktem podłożonym lokalnie, pod własną nazwą · 2026-09-03 · AKTYWNA

- **Trigger:** punkt weryfikacji E1 żądał dowodu treścią pytania ze świeżej sesji, ale zmiana
  mieszkała w repozytorium, nie w zainstalowanym pluginie. Sprawdzenie sześciu katalogów cache'u
  (1.5.2…1.8.1) pokazało, że **żaden nie ma pliku `MODELE.md`** — świeża sesja czytałaby skill
  sprzed zmiany i pomiar dałby fałsz zgodny z oczekiwaniem „nic się nie zmieniło".
- **Przyczyna:** świeża sesja bierze skille i hooki z cache'u pluginu, a nie z katalogu roboczego.
  Domknięcie tej luki sekwencją wydania oznaczałoby wydawanie wersji w środku etapu, który wydania
  nie ma w zakresie.
- **Zasada:** artefakt wykonawczy (skill, hook) podkładasz **lokalnie w projekcie kontrolnym**:
  hook przez `.claude/settings.json` wskazujące plik z repozytorium, skill przez
  `.claude/skills/<nazwa>/` z **inną nazwą niż wersja z pluginu** — kolizja nazw znaczy, że nie
  wiesz, którą treść zmierzyłeś. Mierzysz wtedy **treść artefaktu**, nie jego wyzwalanie; to drugie
  należy do warstwy hooka i mierzy się osobno.
- **Źródło:** E1 planu REKOMENDACJA_MODELU (2026-09-03), `pomiar-pytania.js`. Wzmocnienie
  zasady 10 — bez własnej pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0086 — Wynik wariantu wynosisz z katalogu, który instrument odtwarza · 2026-09-04 · AKTYWNA

- **Trigger:** E2 mierzył cztery przebiegi w dwóch projektach kontrolnych. Przebieg 2 zapisał do
  `p1` odświeżoną listę (suma `f82ee8da0dbe7997`), przebieg 3 zaczął się od odtworzenia materiału
  (L-0083) i przywrócił listę sprzed odświeżenia. Przy przenoszeniu wyniku do adaptera `cp` wziął
  plik z `p1` — czyli **starą treść** — i dopiero porównanie sum (`1f67fe1bc954ecdc` zamiast
  `f82ee8da0dbe7997`) pokazało podmianę.
- **Przyczyna:** L-0083 nakazuje odtwarzać materiał przed każdym wariantem, ale nie mówi, co zrobić
  z **wynikiem** wariantu poprzedniego. Katalog kontrolny pełni wtedy dwie role naraz: jest
  materiałem wejściowym i jedynym nośnikiem dorobku.
- **Zasada:** wynik wariantu, który ma przeżyć pomiar, **kopiujesz poza katalog odtwarzany**
  natychmiast po jego wytworzeniu — albo zapisujesz go tam, gdzie ma trafić docelowo. Przy
  przenoszeniu pliku z katalogu kontrolnego **porównujesz sumę źródła z sumą oczekiwaną**; `cp`
  bez tego porównania nie jest dowodem, że przeniosłeś to, co myślisz.
- **Źródło:** E2 planu REKOMENDACJA_MODELU (2026-09-04). Wzmocnienie zasady 5 — bez własnej pozycji
  w destylacie, limit 15 pozostaje wykorzystany.

### L-0087 — Dostępność cudzej usługi sprawdzasz w tej sesji, także gdy poprzednia ją potwierdziła · 2026-09-04 · AKTYWNA

- **Trigger:** `PROMPT_ETAP_2.md` niósł w „Stanie wyjściowym" zdanie „`claude -p` **działa** — w E1
  poprowadził pomiar dwóch świeżych sesji", oparte na pomiarze z 2026-09-03 (L-0084). Nazajutrz to
  samo wywołanie zwróciło `Failed to authenticate: OAuth session expired and could not be
  refreshed`. Pomiar w świeżych sesjach CLI nie odbył się.
- **Przyczyna:** L-0084 poprawiła jeden kierunek błędu — „niedostępne wczoraj" brane za „niedostępne
  zawsze". Drugi kierunek został otwarty: „dostępne wczoraj" wzięte za „dostępne dziś" i wpisane do
  promptu etapowego jako FAKT stanu wyjściowego.
- **Zasada:** zdanie o cudzej usłudze jest **datowane w obie strony**. Prompt etapowy, który opiera
  punkt weryfikacji na dostępności usługi, każe ją sprawdzić **przed rozpoczęciem pracy tego etapu**
  — jednym najtańszym wywołaniem, tak samo jak przy podejrzeniu niedostępności (zasada 4: kryterium
  sprawdzasz na materiale, zanim zaczniesz). Wynik sprawdzenia idzie do wpisu, nawet gdy jest
  pozytywny.
- **Źródło:** E2 planu REKOMENDACJA_MODELU (2026-09-04). Wzmocnienie zasad 4 i 5 — bez własnej
  pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0088 — Awaria ładowania modułu wygląda dokładnie jak cisza mechanizmu · 2026-09-04 · AKTYWNA

- **Trigger:** nowa stała w rdzeniu dostała nazwę `CZLON_DNI`, zajętą od 1.7.0 przez wiersz
  „Przegląd spraw człowieka". `SyntaxError: Identifier 'CZLON_DNI' has already been declared`
  wywrócił **cały** `session-signals.js`, a oba hooki łapią awarię `require` i milkną z założenia.
  Pierwszy przebieg instrumentu pokazał wtedy **7 scenariuszy „zdanych"** — wszystkie te, których
  oczekiwanym wynikiem było zero znaków.
- **Przyczyna:** cisza jest w RelAI zachowaniem domyślnym każdego progu, więc „mechanizm milczy, bo
  jest poniżej progu" i „mechanizm milczy, bo nie istnieje" dają **identyczne** wyjście. Scenariusz
  ciszy sam z siebie niczego nie dowodzi.
- **Zasada:** przebieg, w którym oczekujesz ciszy, jest ważny **wyłącznie razem z kontrolą
  pozytywną w tym samym przebiegu** — i to ona jest pierwszą rzeczą, na którą patrzysz. Kontrola
  pozytywna, która nie trafiła przy niepustym materiale, znaczy „mechanizm nie działa", a nie
  „jeszcze nie doszedłem do tego przypadku". Przy dokładaniu funkcji do modułu, który ma jedno
  wejście dla wszystkich rozpoznań, **nazwy stałych sprawdzasz `grep`-em przed napisaniem** —
  kolizja nie kosztuje jednej funkcji, tylko wszystkie.
- **Źródło:** E3 planu REKOMENDACJA_MODELU (2026-09-04). Wzmocnienie zasad 5 i 8 — bez własnej
  pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0089 — Punkt „stare brzmienie zniknęło" jest wykrywaczem rodzeństwa dokumentu · 2026-09-04 · AKTYWNA

- **Trigger:** E4 miał zmienić blockquote „Kontrola modelu" w trzech specyfikacjach wymienionych
  w zakresie. Punkt weryfikacji kazał sprawdzić `grep`-em, że stare brzmienie przykładu zniknęło —
  i `grep` po całym `core/templates/` zwrócił **czwarty** plik: `SPEC_ODNOGA.md`, z tym samym
  zdaniem w starej postaci. Zakres go nie wymieniał, bo przy pisaniu planu nikt nie pamiętał, że
  prompt odnogi ma tę samą sekcję co prompt etapowy.
- **Przyczyna:** zakres etapu powstaje z **listy plików**, a wzorzec tekstowy żyje w **rodzinie
  dokumentów**. Lista jest pisana z pamięci autora planu; `grep` czyta repozytorium. Rozjazd między
  nimi jest regułą, nie wyjątkiem — i ujawnia się dopiero przy weryfikacji, czyli po zmianie.
- **Zasada:** punkt weryfikacji „stare brzmienie nie zwraca nic" uruchamiaj **na katalogu rodziny,
  nie na zmienianych plikach** — jego wartością jest właśnie trafienie poza zakresem. Takie
  trafienie jest **sygnałem odchylenia** (odnoga / aneks / świadomie odłożone), nigdy usterką
  weryfikacji ani cichym dopisaniem pliku do zakresu. Zmiana wzorca powtarzalnego w jednym miejscu
  z czterech rozjeżdża dokumenty tym mocniej, im dłużej nikt nie patrzy.
- **Źródło:** E4 planu REKOMENDACJA_MODELU (2026-09-04) — rozstrzygnięte Aneksem D w trakcie etapu.
  Wzmocnienie zasad 1 i 14; bez własnej pozycji w destylacie, limit 15 pozostaje wykorzystany.

### L-0090 — Cisza mechanizmu zmierzona złym wejściem jest fałszem, nie ciszą · 2026-09-04 · AKTYWNA

- **Trigger:** po rotacji trzech dokumentów uruchomiłem hook startu poleceniem
  `echo '{"cwd":"C:\\Users\\Lukasz\\Desktop\\RelAI",…}' | node …`. Hook wypisał **0 znaków**,
  co zapisałem do dziennika jako dowód, że po rotacji nie ma już nic ponad progiem. Godzinę później
  ten sam hook — wołany przez aplikację przy starcie sesji — wypisał linię o sekcji ryzyk
  **13,4 KB przy progu 12 KB**.
- **Przyczyna:** w pojedynczych cudzysłowach powłoki `\\` zostaje dwoma znakami w JSON-ie, więc
  `cwd` rozjechał się na ścieżkę, której nie ma. Hook zachował się poprawnie: folder bez markera
  RelAI to folder, o którym nie ma nic do powiedzenia. **Zero znaków było prawdziwą odpowiedzią
  na złe pytanie** — a wygląda identycznie jak prawdziwa odpowiedź na dobre pytanie.
- **Zasada:** przebieg, w którym oczekujesz ciszy, wymaga **kontroli pozytywnej na tym samym
  wejściu** — zanim uznasz ciszę za wynik, pokaż, że to wejście potrafi cokolwiek wypisać. Przy
  narzędziu przyjmującym ścieżkę w JSON-ie kontrolą jest jedno pole odbite z powrotem (echo
  ścieżki, nazwa projektu, wersja) albo ta sama ścieżka podana w postaci, której powłoka nie tknie
  (ukośniki). Wzmocnienie zasady 5: instrument bywa źródłem fałszu **także wtedy, gdy sam kod
  mechanizmu jest w porządku**.
- **Źródło:** rotacja dokumentów 2026-09-04; sprostowanie wpisane do tego samego wpisu dziennika
  w tej samej sesji. Bez własnej pozycji w destylacie — dopisane do zasady 5, limit 15 pozostaje
  wykorzystany.

### L-0091 — Kontrola pozytywna postawiona na ścieżce, którą mechanizm przepuszcza z założenia, nie jest kontrolą · 2026-09-04 · AKTYWNA

- **Trigger:** po wydaniu 1.9.2 sprawdzałem hook skanu sekretów w żywej sesji. Zapis dokumentu
  z kanoniczną wartością przykładową przeszedł — tego oczekiwałem. Jako kontrolę pozytywną
  zapisałem plik z wartością bez markera przykładu do `.claude/relai/work/` i **ten zapis też
  przeszedł**, co przez chwilę wyglądało na dowód, że hook w ogóle nie działa.
- **Przyczyna:** `.claude/relai/work/` jest objęte `.gitignore`, a hook przepuszcza pliki
  ignorowane **z projektu, nie z przeoczenia** (`secret-scanner.js`: „pliki objete .gitignore
  przechodza"). Kontrola mierzyła więc zachowanie domyślne mechanizmu, nie jego blokadę. Ta sama
  cisza znaczyła co innego, niż zakładałem — powtórzenie na ścieżce **śledzonej** dało werdykt
  odmowy i nieutworzony plik w pierwszej próbie.
- **Zasada:** kontrola pozytywna musi stać **na wejściu, którego mechanizm naprawdę pilnuje** —
  zanim ją postawisz, sprawdź w kodzie mechanizmu, jakie wejścia są wyłączone przez projekt
  (ścieżki ignorowane, rozszerzenia pomijane, tryby wyciszone). Wejście z listy wyłączeń daje
  przebieg zielony niezależnie od tego, czy mechanizm żyje. Wzmocnienie zasady 5 od strony
  **doboru materiału**, nie escapowania.
- **Źródło:** weryfikacja wydania 1.9.2 w żywej sesji, wątek PRECOMMIT_ESM. Bez własnej pozycji
  w destylacie — dopisane do zasady 5, limit 15 pozostaje wykorzystany.

### L-0092 — Narzędzie producenta sprawdzające własny format bije każdy pomiar pośredni · 2026-09-06 · AKTYWNA

- **Trigger:** komendy pluginu przestały się ładować w Claude Code. Przez trzy wydania (2.1.0,
  2.1.1, 2.1.2) szukałem przyczyny logiem aplikacji, kodem skanera z paczki `app.asar`, sesjami
  `claude -p --plugin-dir` i porównaniami z cudzymi pluginami. Rozstrzygnęło dopiero okno
  `/plugin` otwarte **przez użytkownika**: `Validation errors: agents: Invalid input`.
- **Przyczyna:** manifest był nieważny, ale żadne z moich wejść tego nie mówiło. Log aplikacji
  o nieważnym manifeście **milczał**, a skaner CCD czytał ten sam plik mimo wszystko i wypisywał
  ostrzeżenia o kolizji nazw — czyli aktywnie **sugerował**, że manifest jest poprawnie parsowany.
  Przez cały ten czas istniało `claude plugin validate <ścieżka>`, które wskazuje pole i powód
  w jednym wywołaniu, oraz `claude plugin list` ze statusem `✘ failed to load`.
- **Zasada:** gdy cudze narzędzie nie przyjmuje Twojego artefaktu, **najpierw sprawdź, czy ma
  własny walidator albo widok statusu** (`<narzędzie> validate`, `<narzędzie> list`, okno
  ustawień) — dopiero potem loguj, dekompiluj i porównuj z cudzymi przykładami. Walidator zna
  schemat, którego nie odtworzysz z obserwacji; brak komunikatu w logu **nie** jest dowodem, że
  format jest poprawny.
- **Źródło:** naprawa regresji 2.1.0 → 2.1.3, pułapki P-010, P-011, P-012. Bramka wydania wpisana
  do `STATE.md` jako krok sekwencji P-005.

### L-0093 — Pomiar bez kontroli na wersji zepsutej nie odróżnia „nie działa" od „nie mierzy" · 2026-09-06 · AKTYWNA

- **Trigger:** sprawdzałem, czy CLI ładuje komendy pluginu ze ścieżki z `plugin.json`. Sesja
  `claude -p --plugin-dir <cache 2.1.1>` odpowiedziała `BRAK` — wynik zgodny z hipotezą, gotowy
  do wyciągnięcia wniosku, że winna jest ścieżka.
- **Przyczyna:** kontrola na wariancie z komendami w korzeniu dała **to samo** `BRAK`, a kontrola
  na wersji 2.1.0 z korzeniowym `skills/` — również. Tryb headless po prostu nie pokazuje modelowi
  komend ani skilli pluginu, więc próba nie mierzyła niczego. Bez tej kontroli zbudowałbym
  wydanie na wniosku wyprowadzonym z martwego wejścia.
- **Zasada:** zanim uznasz negatywny wynik za dowód, **powtórz pomiar na wejściu, o którym wiesz,
  że powinno dać wynik pozytywny**. Ten sam wynik po obu stronach znaczy, że przyrząd nie mierzy —
  i wtedy wnioskiem jest „próba nierozstrzygająca", nie „mechanizm nie działa". Rozszerzenie
  [[L-0090]] na przyrząd: tam cisza zmierzona złym wejściem, tu wynik zmierzony martwym trybem.
- **Źródło:** naprawa regresji 2.1.x. Bez własnej pozycji w destylacie — mieści się w zasadzie
  o dowodzie negatywnym, limit 15 pozostaje wykorzystany.

### L-0094 — Tekst postawiony współrzędnymi nie wie, gdzie kończy się karta · 2026-09-12 · AKTYWNA

- **Trigger:** klatka kalibracyjna materiału demo powstała jako SVG z ręcznie wpisanymi `x`/`y`
  każdego `<text>`. Dwa napisy wyszły poza swoje karty — odręczny podpis pod tabelą etapów
  i zdanie świeżej sesji z kropką za krawędzią. Łukasz zobaczył to od razu.
- **Przyczyna:** `<text>` w SVG nie ma silnika układu: nie zawija się, nie zna szerokości
  rodzica, nie da się go domknąć `overflow`. Szerokość każdego napisu była **moim szacunkiem
  metryki fontu**, a przy podmianie fontu na zamiennik systemowy szacunek przestaje trzymać
  w ogóle. Kontrola „czy coś wystaje" nie istniała, bo nie było czego zapytać.
- **Zasada:** **kompozycję wizualną z tekstem budujesz w warstwie, która liczy układ** — HTML
  z `grid`/`flex`, wymiary w jednostkach kontenera (`cqw`), karty z `overflow:hidden`, tekst
  zawijany albo świadomie ucinany. Ręczne współrzędne zostają dla geometrii dekoracyjnej
  (krzywe, plamy), nigdy dla treści. Kryterium stawiasz na zmierzonych prostokątach: dziecko
  wychodzące poza kontener to **defekt blokujący**, a instrument liczący te prostokąty ma
  kontrolę pozytywną na podłożonym przepełnieniu ([[L-0090]] — cisza bez kontroli jest fałszem).
  To samo dotyczy renderu wideo: skoro klatki składa silnik HTML, podgląd kalibracyjny też.
- **Źródło:** korekta Łukasza, przygotowanie materiału demo E1 planu PIERWSI_UZYTKOWNICY
  (Aneks A). Destylat: doklejone do zasady 15 o zadaniu wizualnym, bez szesnastej pozycji.

### L-0095 — Wniosek o własności narzędzia wyprowadzony przy zepsutym artefakcie wygasa z jego naprawą · 2026-09-12 · AKTYWNA

- **Trigger:** E1 potrzebował przebiegu dowodowego w świeżej sesji. L-0093 mówił wprost: „tryb
  headless po prostu nie pokazuje modelowi komend ani skilli pluginu", więc przebieg wyglądał na
  niewykonalny bez człowieka klikającego w aplikacji.
- **Przyczyna:** tamten pomiar szedł na wersjach **2.1.0 i 2.1.1**, czyli na pluginie z manifestem,
  który odpadał w całości (P-011). Niewidoczność komend była skutkiem zepsutego manifestu, a nie
  własnością trybu headless. Po naprawie manifestu ta sama komenda w tym samym trybie wypisała
  **trzynaście komend i dwa skille** (zmierzone 2026-09-12), co otworzyło całą ścieżkę pomiarową.
- **Zasada:** wniosek o **własności cudzego narzędzia**, wyprowadzony w czasie, gdy własny artefakt
  był zepsuty, jest hipotezą datowaną **podwójnie** — datą pomiaru i wersją artefaktu. Naprawa
  artefaktu unieważnia wniosek: sprawdzasz go ponownie jednym najtańszym wywołaniem, zanim oprzesz
  na nim plan etapu. Rozszerzenie [[L-0084]] („niedostępność cudzej usługi jest stanem chwilowym")
  na niedostępność **funkcji**: tam zmienia się świat, tu zmienia się nasz własny artefakt.
- **Źródło:** E1 planu PIERWSI_UZYTKOWNICY. Destylat: doklejone do zasady 5, bez nowej pozycji.

### L-0096 — Porównanie dwóch nieistniejących plików jest zgodnością · 2026-09-13 · AKTYWNA

- **Trigger:** instrument E2 porównywał sumy plików z cache'u zainstalowanego pluginu z ich treścią
  w tagu `v2.1.4`. Zameldował **3/5 zgodnych** — i to był wynik zmyślony w całości. Ścieżki po obu
  stronach były błędne: pliki guardraili nazywają się `secret-scan.js`, nie `secret-scanner.js`,
  a cache trzyma je w podkatalogu wersji (`.../relai/relai/2.1.4/`), którego w ścieżce nie było.
- **Przyczyna:** `tr -d '\r' < nieistniejący_plik | sha256sum` i `git show v2.1.4:nieistniejąca/ścieżka
  | sha256sum` zwracają **tę samą sumę** — `e3b0c442…`, sumę pustego strumienia. Instrument
  porównywał dwa nic i meldował zgodność. Trzy z pięciu pozycji „przeszły" właśnie dlatego, że nie
  istniały po żadnej ze stron; dwie pozostałe „nie przeszły", bo istniały po stronie taga.
  **Zielony wynik był tu dowodem awarii, nie zgodności.**
- **Zasada:** instrument porównujący dwa źródła sprawdza **najpierw, czy oba wejścia istnieją**,
  i zgłasza brak jako osobny stan (`BRAK`), nigdy jako wynik porównania. Do tego kontrola pozytywna
  po drugiej stronie: to samo porównanie wobec **innej wersji** musi zwrócić różnicę — bez niej
  „6/6 zgodnych" jest nieodróżnialne od „6/6 pustych". Rozszerzenie [[L-0090]] na porównania:
  tam cisza zmierzona złym wejściem, tu **zgodność** zmierzona złym wejściem.
- **Źródło:** E2 planu PIERWSI_UZYTKOWNICY, pomiar publicznej instalacji 2.1.4. Destylat: doklejone
  do zasady 5, bez nowej pozycji.

### L-0097 — Agregat po wykrytych elementach bierze też te, których nie mierzysz · 2026-09-13 · AKTYWNA

- **Trigger:** instrument czytelności wyciągał wysokość wierszy tekstu z wyrenderowanej klatki
  i meldował, że najniższy wiersz listy etapów ma **2 px**. Na oku ten wiersz ma kilkanaście.
- **Przyczyna:** instrument wykrywał pasma rzędów zawierających ciemne piksele i brał z nich
  `min()`. Pasmem jest jednak wszystko, co jest ciemne: kreska oddzielająca nagłówek, kropka nad
  „i", cień karty, odłamek glifu rozcięty progiem ciemności. `min()` po całym zbiorze zwracał
  najcieńszą kreskę w prostokącie, nie najniższy wiersz — i robił to **cicho**, bo 2 px jest
  wynikiem prawdopodobnym dla „za małego tekstu".
- **Zasada:** agregat (`min`, `max`, średnia) po zbiorze wykrytych elementów jest ważny dopiero po
  odsianiu elementów **innej klasy niż mierzona** — a próg odsiewu podajesz jawnie i pokazujesz
  **cały zbiór obok wyniku**, żeby dało się zobaczyć, co wypadło. Wynik zgodny z oczekiwaniem jest
  tu najgroźniejszy: nikt nie sprawdza liczby, która potwierdza to, czego się spodziewał.
- **Źródło:** E2 planu PIERWSI_UZYTKOWNICY, ocena czytelności materiału demo. Destylat: doklejone
  do zasady 5, bez nowej pozycji.

### L-0098 — Materiał wizualny sprawdzony w warunkach autora, nie odbiorcy · 2026-09-13 · AKTYWNA

- **Trigger:** materiał demo przeszedł w E1 twardą kontrolę układu — 0 przepełnień i 0 tekstów
  uciętych na wszystkich scenach obu cięć i obu wersjach językowych. W E2, przy pierwszym pytaniu
  o odbiorcę, okazało się, że na ekranie telefonu czytelny jest **wyłącznie tytuł sceny**: lista
  etapów schodzi do 5,08 px, treść karty do 5,47 px, ścieżki plików do 3,52 px przy progu 8 px.
- **Przyczyna:** kontrola z E1 mierzyła **geometrię kompozycji w jej własnej skali** (960 px) —
  czy coś wychodzi poza kontener. To poprawne pytanie i poprawna odpowiedź, tylko inne niż „czy
  człowiek to przeczyta". Skala odbiorcy nie była żadnym parametrem pomiaru, bo nikt jej nie
  wpisał do kryterium. Rozszerzenie [[L-0075]] („grafikę ocenia się na stronie, która ją pokazuje")
  o drugi wymiar: nie tylko **gdzie** się ją pokazuje, ale **jak duża** tam jest.
- **Zasada:** materiał wizualny ma kryterium wyrażone **w warunkach odbiorcy**, nie autora:
  szerokość, na jakiej realnie się wyświetli, i minimalna wysokość glifów przy tej szerokości.
  Kontrola geometrii w skali renderu jest do tego **dodatkiem**, nie zamiennikiem — przechodzi
  zielono na materiale, którego nikt nie przeczyta.
- **Źródło:** E2 planu PIERWSI_UZYTKOWNICY, ocena materiału po stronie odbiorcy. Destylat: doklejone
  do zasady 15, bez szesnastej pozycji.

### L-0099 — Liczba wpisana literałem w komunikacie sukcesu kłamie pierwszego dnia po zmianie · 2026-09-14 · AKTYWNA

- **Trigger:** czternasta komenda przewróciła walidator na twardym `!== 13` w generatorze skilli
  Codeksa. Po podbiciu liczby do 14 generator zameldował `14 procedur` — nieprawda, bo komunikat
  sukcesu miał **drugą** liczbę wpisaną literałem: `13 procedur + 2 skille rdzeniowe`. Asercja
  i komunikat mówiły dwie różne rzeczy o tym samym przebiegu.
- **Przyczyna:** asercja i komunikat powstały razem, więc przy pisaniu wyglądały na jedną prawdę.
  Przy zmianie zakresu poprawia się to, co **przewraca przebieg** — komunikat sukcesu nie przewraca
  niczego, więc zostaje ze starą liczbą i jest tym głośniejszy, im częściej przebieg wychodzi
  zielono.
- **Zasada:** liczbę mierzonego zbioru **liczysz w miejscu, w którym ją piszesz** — także
  w komunikacie sukcesu, nie tylko w asercji. Literał w tekście, który czyta człowiek, jest
  zapisem stanu z dnia napisania, a nie pomiarem; przy pierwszej zmianie zakresu zamienia się
  w cichy fałsz. Rozszerzenie [[L-0053]] o drugą stronę: próg liczy ktoś, ale komunikat też.
- **Źródło:** E1 planu OPTYMALIZATOR_PROMPTOW, `adapters/codex/generate-skills.js`. Destylat:
  doklejone do zasady 6, bez nowej pozycji.

### L-0100 — Regułę pisaną w tym samym etapie, co jej pierwszy przebieg, przewraca ten przebieg · 2026-09-14 · AKTYWNA

- **Trigger:** reguła optymalizatora mówiła „brak krytyczny → zamiast propozycji stoją pytania
  i nic więcej". Pierwszy realny przebieg na zdaniu „zrób coś z tym raportem, żeby był lepszy"
  pokazał, że to wyklucza najczęstszy przypadek: zadanie jest jasne, a niewyprowadzalny jest
  **jeden** wymiar. Litera reguły dawała same pytania tam, gdzie człowiek oczekuje propozycji.
- **Przyczyna:** reguła powstała z materiału źródłowego, zanim cokolwiek przez nią przeszło.
  Materiał niósł limit trzech pytań, ale nie rozstrzygał, **gdzie** pytania stoją wobec propozycji —
  i ta luka wyglądała na rozstrzygniętą, dopóki nie pojawiło się wejście, które w nią trafia.
- **Zasada:** pierwszy realny przebieg reguły jest **częścią jej pisania**, nie kontrolą po fakcie:
  planuj go przed zamknięciem pliku i traktuj rozjazd jako defekt reguły, nie jako wyjątek do
  obejścia w wykonaniu. Reguła, której nikt nie przepuścił przez materiał, jest hipotezą — tak samo
  jak instrument bez kontroli pozytywnej (zasada 5).
- **Źródło:** E1 planu OPTYMALIZATOR_PROMPTOW, `core/prompt/REGULY.md`. Destylat: doklejone do
  zasady 1, bez nowej pozycji.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
