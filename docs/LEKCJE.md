# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. (L-0001, L-0011, L-0026, L-0089)
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
   tak samo przy poprawnej ścieżce i przy rozjechanej. (L-0032, L-0037, L-0054, L-0055, L-0056,
   L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088, L-0090)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". (L-0034, L-0049,
   L-0053, L-0060, L-0065)
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
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

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

### L-0070 — Rdzeń szukany w całej komórce złapał prozę stojącą za datą · 2026-09-01 · AKTYWNA

- **Trigger:** kwalifikacja ryzyka do kompresji komórki czytała status rdzeniami `zmitygowan`
  i `przyj`+`świadom`. Na dzienniku PolyFlow sprzed migracji dawało to **11 kandydatów**. Cztery
  z nich miały status `**ZAMKNIĘTE 2026-08-18 (E4 + dowód na żywym…)** — zmitygowane w kodzie`:
  rdzeń stał w **opisie za datą**, nie w brzmieniu statusu.
- **Przyczyna:** wiersz `ZAMKNIĘTE` schodzi do archiwum **w całości**, własną rotacją. Złapany
  drugim mechanizmem schodziłby dwiema drogami naraz — raz jako wiersz, raz jako treść komórki.
- **Zasada:** rdzenia szukaj w **brzmieniu wartości**, czyli od początku komórki do pierwszej
  cyfry, myślnika albo nawiasu — nie „gdziekolwiek w komórce". Po zmianie kandydatów było **7**,
  a różnicę stanowiły dokładnie te cztery wiersze. Kontrolę stawiaj na obu stronach: brzmienia,
  które **muszą** trafić, i brzmienia, które **nie mogą** (zmierzone na jedenastu naraz).
- **Źródło:** E5 planu HIGIENA_DOKUMENTOW (2026-09-01); rozwinięcie zasady aktywnej 7 (L-0025,
  L-0035, L-0066).

### L-0071 — Wzorzec numeru ryzyka odrzucił `R17a` i nie powiedział o tym ani słowa · 2026-09-01 · AKTYWNA

- **Trigger:** instrument liczył wiersze tabeli ryzyk wzorcem „litera + cyfry". Pierwszy przebieg
  zameldował **51 wierszy przed i 51 po** — liczby równe, punkt weryfikacji zielony. Kontrola
  „ile linii tabeli odrzucono" pokazała trzy: nagłówek, separator i **`R17a`**, czyli realne
  ryzyko z sufiksem literowym.
- **Przyczyna:** numeracja ryzyk w realnym projekcie bywa rozgałęziona (`R17`, `R17a`), a wzorzec
  powstał z numeracji tego repozytorium, gdzie takiego przypadku nie ma. Odrzucenie było ciche,
  bo instrument liczył tylko to, co dopasował.
- **Zasada:** wzorzec identyfikatora pozycji ma **obok siebie kontrolę „ile wierszy odrzucono"**,
  wypisywaną z treścią odrzuconych. Bez niej „przed = po" znaczy tyle, że instrument konsekwentnie
  nie widzi tego samego dwa razy.
- **Źródło:** E5 planu HIGIENA_DOKUMENTOW (2026-09-01); rozwinięcie zasady aktywnej 5 (L-0056,
  L-0067).

### L-0072 — Guardrail zatrzymał zdanie, które opisywało jego samego · 2026-09-01 · AKTYWNA

- **Trigger:** commit wydania 1.7.0 odbił się od gitowego pre-commita: „w plikach z indeksu wyglada
  na to, ze jest sekret — `core/templates/SPEC_KOMENDY.md` (przypisanie PASSWORD= z niepusta
  wartoscia)". Sekretu tam nie było. Zatrzymało się zdanie wyliczające, czego guardrail pilnuje:
  `` `PASSWORD=`/`SECRET=` z wartością ``.
- **Przyczyna:** klasa wartości w `ASSIGN_RE` nie wykluczała backticka, więc po `PASSWORD=`
  regex zjadał `` `/`SECRET= `` — osiem znaków, żaden z listy placeholderów. Plik przeszedł przez
  skaner po raz pierwszy, bo od instalacji hooka nikt go nie zmieniał.
- **Zasada:** znak cudzysłowu należy do **grupy cudzysłowu**, nigdy do klasy wartości — także
  backtick. Ta sama poprawka domyka dziurę w drugą stronę: przypisanie w template licie JS zostaje
  złapane, bo otwierający backtick konsumuje grupa cudzysłowu, a nie klasa wartości.
- **Źródło:** E6 planu HIGIENA_DOKUMENTOW, Aneks D (2026-09-01); rozwinięcie zasad aktywnych 5 i 12
  (L-0043, L-0056).

### L-0073 — Generator kotwic zwinął dwie spacje w jeden myślnik i zgłosił 78 martwych linków · 2026-09-01 · AKTYWNA

- **Trigger:** kontrola po rotacji dziennika PolyFlow zameldowała **78 pozycji z linkiem do
  nieistniejącej kotwicy** — w tym linki do wpisów, które stały w żywym pliku dwa ekrany wyżej.
- **Przyczyna:** generator kotwic zwijał ciąg białych znaków do jednego myślnika (`\s+` → `-`),
  a Markdown daje **jeden myślnik na każdą spację**. Nagłówek „2026-09-01 — Bramka…" ma po
  usunięciu myślnika dwie spacje, więc prawdziwa kotwica ma dwa myślniki, a wygenerowana jeden.
  Instrument nie miał żadnej kontroli, więc liczył z pełnym przekonaniem.
- **Zasada:** kontrola pozytywna generatora identyfikatorów sprawdza, czy wygenerowana wartość
  **występuje w tym samym pliku**, i robi to na **wszystkich** kandydatach, nie na pierwszym —
  pierwszy element bywa jedynym, do którego nikt nie linkuje, i kontrola przewraca się na
  poprawnym generatorze. Prawidłowa liczba po poprawce: **60 przed rotacją, 65 po niej, 60 po
  przepięciu** — bilans przebiegu zero.
- **Źródło:** E6 planu HIGIENA_DOKUMENTOW (2026-09-01); rozwinięcie zasady aktywnej 5 (L-0055,
  L-0068, L-0071).

### L-0074 — Sprawa zamknięta słowem spoza listy wraca w przeglądzie jak otwarta · 2026-09-01 · AKTYWNA

- **Trigger:** w przeglądzie spraw PolyFlow pojawiła się bramka przekreślona `~~` i opisana
  „**zaliczona 2026-08-26**". Mechanizm liczył ją jako otwartą i przeterminowaną. Policzone:
  **7 z 32 pozycji** — 22% — wygląda dla człowieka na zamknięte, a rdzeń widzi je jako otwarte
  (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą).
- **Przyczyna:** lista rdzeni rozstrzygnięcia jest zamknięta świadomie, a jej zawartość powstała
  z brzmień tego repozytorium. Realny projekt zamyka bramki własnym słownikiem.
- **Zasada:** zamknięta lista brzmień ma **koszt po drugiej stronie** i ten koszt się mierzy:
  ile pozycji wygląda na zamknięte, a nie jest rozpoznanych. Liczba wchodzi do wpisu jako procent,
  a poszerzenie listy jest **decyzją człowieka**, nie poprawką — fałszywe rozpoznanie chowa sprawę
  człowieka w archiwum.
- **Źródło:** E6 planu HIGIENA_DOKUMENTOW (2026-09-01); rozwinięcie zasady aktywnej 7 (L-0025,
  L-0035, L-0070).

### L-0075 — Grafika sprawdzona u siebie, a nie na stronie, która ją pokazuje · 2026-09-01 · AKTYWNA

- **Trigger:** po poprawieniu dziesięciu ikon README zameldowałem robotę jako zweryfikowaną —
  kontrast policzony skryptem, render obu motywów obejrzany. Użytkownik odpowiedział, że na GitHubie
  **nadal widzi słabo**. Dopiero wtedy poszedłem na żywą stronę i zobaczyłem dwie rzeczy, których
  własny render pokazać nie mógł: GitHub podaje te pliki z `Cache-Control: max-age=300`, więc
  odbiorca ogląda wersję sprzed poprawki, a ikona **nie ma w README zadeklarowanych 24 px** — DOM
  mierzy **23 px na szerokim oknie i 17 px na węższym**, bo `max-width:100%` ściska ją do kolumny
  tabeli. Kreska 2,6 przy `viewBox` 48 schodzi wtedy do **0,92 px**, czyli poniżej piksela.
- **Przyczyna:** własny render odtwarzał **plik**, a nie **powierzchnię publikacji**. Rozmiar
  wziąłem z atrybutu `width="24"` w źródle README zamiast go zmierzyć, a cache w ogóle nie wszedł
  do rozumowania, bo lokalnie go nie ma.
- **Zasada:** artefakt, którego odbiorcą jest cudza strona, weryfikuje się **na tej stronie**:
  treść pobrana z jej adresu, rozmiar zmierzony w jej DOM, nagłówki cache odczytane z jej
  odpowiedzi. Render u siebie dowodzi, że plik jest poprawny — nie że odbiorca to zobaczy.
  Zdanie „zweryfikowane" bez pomiaru z docelowej powierzchni jest przedwczesne.
- **Źródło:** poprawka czytelności ikon README (2026-09-01); rozwinięcie zasady aktywnej o pomiarze
  zamiast deklaracji.

### L-0076 — `git grep` nie widzi pliku, który właśnie powstał · 2026-09-03 · AKTYWNA

- **Trigger:** punkt weryfikacji E1 brzmiał „`git grep -n \"relai: zachowaj\"` zwraca: plan, prompt,
  `work-artifacts.js`, komendę i skill". Wykonany dosłownie, zwrócił **wszystko poza** narzędziem
  i komendą — czyli poza dwoma plikami, które ten etap dopiero utworzył.
- **Przyczyna:** `git grep` przeszukuje domyślnie **indeks**, nie drzewo robocze. Plik nieśledzony
  jest dla niego niewidzialny. Kryterium napisane w chwili planowania zakładało stan po commicie,
  a wykonywane jest przed nim — i wygląda wtedy jak defekt produktu, choć jest defektem instrumentu.
- **Zasada:** kryterium oparte na `git grep` dla treści **wprowadzanej przez ten sam etap** stawiasz
  z flagą `--untracked` albo po `git add`. Zero trafień na pliku, o którym wiesz, że treść zawiera,
  jest defektem instrumentu, dopóki nie udowodnisz inaczej — dotyczy to również narzędzi, które
  „przeszukują repozytorium" bez powiedzenia, że mają na myśli indeks.
- **Źródło:** E1 planu SPRZATANIE_ARTEFAKTOW (2026-09-03); rozwinięcie zasady aktywnej nr 5
  (instrument pomiarowy sam bywa źródłem fałszu).

### L-0077 — Pusta skorupa po skasowanym etapie została chroniona na zawsze · 2026-09-03 · AKTYWNA

- **Trigger:** pierwszy realny przebieg `/relai-clean` skasował katalogi etapów, ale zostawił po nich
  puste katalogi tematów (`work/HIGIENA_DOKUMENTOW/`). Następny raport pokazał je jako **chronione
  powodem „etap trwa"** — bo reguła „katalog tematu bez podkatalogów" ustawiała status „w użyciu”.
- **Przyczyna:** domyślne rozstrzyganie niepewności na korzyść ochrony zastosowałem do przypadku,
  w którym niepewności nie ma: katalog bez podkatalogu nie ma etapu ani odnogi, która by go trzymała.
  Ochrona „na wszelki wypadek" wyprodukowała śmieć, którego mechanizm już nigdy sam nie zaproponuje
  do usunięcia.
- **Zasada:** „na korzyść ochrony" rozstrzygasz **niepewność**, a nie pustkę. Stan, o którym wiadomo,
  że nic w nim nie żyje, ma być kandydatem do potwierdzenia — inaczej mechanizm sprzątający zostawia
  po sobie osad, który sam wyklucza ze sprzątania. Regułę ochronną sprawdzaj także na stanie
  **po** własnym działaniu, nie tylko przed nim.
- **Źródło:** E1 planu SPRZATANIE_ARTEFAKTOW (2026-09-03), znalezione w przebiegu na żywo; poprawka
  plus scenariusz testowy w tym samym etapie.

### L-0078 — Nowy plik produktu wygląda dla sprzątacza jak śmieć · 2026-09-03 · AKTYWNA

- **Trigger:** raport `/relai-clean` uruchomiony w trakcie E1 pokazał w grupach `repo: katalog core`
  i `repo: katalog adapters` **dorobek tego etapu** — świeżo napisane `work-artifacts.js`
  i `relai-clean.md`, jeszcze niezacommitowane.
- **Przyczyna:** jedyną granicą między „produktem" a „artefaktem roboczym" jest indeks gita. Plik,
  który ma trafić do repozytorium, ale jeszcze do niego nie trafił, leży po złej stronie tej granicy
  przez cały czas, w którym powstaje — czyli dokładnie wtedy, gdy sesja go sprząta.
- **Zasada:** mechanizm sprzątający pyta o każdą grupę osobno **właśnie dlatego**; automatyczne
  kasowanie kandydatów byłoby kasowaniem niezacommitowanej pracy. Przy sprzątaniu w trakcie etapu
  nazywasz wprost, które grupy są dorobkiem tej sesji, zanim zadasz pytanie — a najpewniejszą
  ochroną nowego pliku jest `git add`, nie marker.
- **Źródło:** E1 planu SPRZATANIE_ARTEFAKTOW (2026-09-03), pierwszy przebieg komendy na własnym
  repozytorium.

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

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
