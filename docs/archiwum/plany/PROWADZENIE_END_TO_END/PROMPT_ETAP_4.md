# PROMPT_ETAP_4 — Zasady skrojone pod model: nakładki rodzin, model docelowy optymalizatora i lista Codeksa

Plan: PROWADZENIE_END_TO_END • Etap: **E4 z E7** • Wygenerowano: 2026-09-24 (autor: Opus 5.5, w rytuale „Na koniec" etapu E3) • Wykonawca: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (alias `opus`, lista modeli z dnia `2026-09-24`) — D-85. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (nakładki zmieniają to, co RelAI mówi każdemu modelowi; reguła bez źródła jest
> zgadywaniem).

> **Bramka przed startem:** w `STATUS.md` stoi otwarta bramka „Odświeżenie listy modeli Codeksa".
> Zapytaj człowieka jednym pytaniem, czy lista została odświeżona w sesji Codeksa. **Nie** → etap
> idzie według przypadku brzegowego z sekcji 8 planu (nakładka `openai` bez nazw modeli, przydział
> modeli poza Claude Code zostaje sprawą człowieka i `STATUS.md` mówi to wprost). Tak → nazwy bierzesz
> z odświeżonej listy.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sygnał odchylenia |
| `docs/plany/PROWADZENIE_END_TO_END/STATUS.md` | status planu i etapu; bramki manualne (lista Codeksa, restart aplikacji na 2.5.0) |
| `docs/plany/PROWADZENIE_END_TO_END/REJESTR.md` | pozycje z przypisaniem **E4**: A14, M01, M05+O05, M06, M07, M08, M10+O17, O01, O04, O09+O11+O12, O14, O15+O16, O18 — każda z dowodem i źródłem; to jest zakres |
| `docs/plany/PROWADZENIE_END_TO_END/PLAN.html` — sekcja 4 (wariant W1), 5 („Punkty styku"), 6 (wiersz E4), 7 (K3, K5), 8 (przypadki brzegowe) | wybrany mechanizm (rdzeń + nakładka rodziny), kryterium etapu, mitygacje |
| `docs/DZIENNIK.md` — wpis „2026-09-24 — E3 planu PROWADZENIE_END_TO_END" | kształt plików doczytywanych, instrument pomiaru wyzwalania, co odłożono |
| `core/prompt/REGULY.md` (sekcja „Część zależna od narzędzia i modelu", `:252-258`) i `core/prompt/SZABLONY.md` | miejsce odesłania do nakładek; meldunki i rusztowania do zmiany |
| `adapters/claude-code/commands/relai-prompt.md` — krok 1 | gdzie ustalany jest model; M01 dokłada model docelowy |
| `adapters/*/MODELE.md` (trzy listy) i `.claude/relai/MODELE-claude-code.md` | format list; pole `family` dochodzi do wszystkich, lista Codeksa do formatu pozostałych |
| `core/templates/SPEC_PROMPT_ETAPU.md` (sekcje 2, 3, 5, 9) i `core/templates/SPEC_USTAWIENIA.md:128`, `:423` | `/effort` w linii metrycznej, nagłówki bez wersalików, pełny koszt trybu ciągłego |
| `adapters/codex/AGENTS.md` | router Codeksa — zdanie o pierwszeństwie polecenia (M08) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Plan zaakceptowany i zamrożony 2026-09-24 (D-33); zmiany zakresu wyłącznie aneksem.
- **Mechanizm: wariant W1** (sekcja 4 planu) — jeden rdzeń reguł i krótkie nakładki per rodzina
  (`core/prompt/rodziny/claude.md`, `openai.md`); osobne kopie skilli per rodzina — odrzucone.
  Rodzinę bierze się **z listy modeli** (pole `family`), nigdy z aliasu ani z odgadnięcia po nazwie
  (sekcja 8: Foundry mapuje `opus` na Opus 4.6). Model spoza list → sam rdzeń i jedno zdanie
  z odesłaniem do `/relai-models`.
- **Każda reguła nakładki ma URL źródła i datę odczytu** (K3). Grok, Composer i tryb Auto nie
  dostają nakładki — brak oficjalnych wytycznych (rejestr, pozycja odrzucona).
- **Baza reguł nie niesie nazw modeli** — walidator to sprawdza („baza regul bez nazw modeli");
  nazwy mieszkają w listach, nakładka może nazwać model wyłącznie przez odczyt listy.
- **D-90:** kryterium stoją modele klasy `strong` i `balanced`; słabsze raportujesz.
- **Kształt plików doczytywanych (E3, wydanie 2.5.0):** plik obok `SKILL.md`, otwierany przy
  wyzwalaczu wypisanym w `SKILL.md`, jeden poziom w głąb; generator Codeksa i instalator Cursora
  kopiują każdy plik `.md` katalogu skilla, walidator pilnuje parytetu i plików osieroconych.
  Nakładki w `core/prompt/` prowizjonuje hook tak jak dziś `REGULY.md` (`.claude/relai/prompt/`).
- **Budżet startu 100 KB** (decyzja człowieka w E3): nakładki nie wchodzą do warstwy startowej.
- Rytm wydań: wydanie po etapie zmieniającym plugin; **numer proponujesz, zatwierdza człowiek**
  razem ze zgodą na tag, push i release (P-005, `claude plugin validate .` przed tagiem).
- **Granica zakresu:** README, `/relai-tour`, słowniczek i pierwsze kroki to **E5**; procedury
  debugowania, bezpieczeństwa zależności i deployu to **E6**; zastrzeżenie o słabszych modelach dla
  użytkownika — w tym etapie tylko wtedy, gdy wynika z nakładki; `LEKCJE.md` ponad progiem to
  rotacja lekcji w rytuale sesji, nie w tym etapie.

## Stan wyjściowy — co realnie zastajesz

RelAI **2.5.0** wydany publicznie (tag `v2.5.0`, commit `9ef2d83`, release Latest) i zainstalowany na
tej maszynie (cache `relai/relai/2.5.0`, 20/20 plików skilli zgodnych sumą). Aplikacja desktopowa
ładuje 2.5.0 dopiero po restarcie (bramka). Testy:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js`
— **58/58** (FAKT, 2026-09-24); `node core/tools/validate-adapters.js` — kod 0, „7 zrodel, wartosc
2.5.0", „parytet skilli Claude Code -> Codex: 24 plikow, 0 rozjazdow".

```
core/prompt/REGULY.md                 308 linii — baza reguł optymalizatora; :252-258 „Część zależna od narzędzia i modelu" (dziś: tylko zakaz nazw)
core/prompt/SZABLONY.md               217 linii — rusztowania; :29-50, :69-91 nagłówki tekstowe, :55-59 meldunki po każdym kroku
adapters/claude-code/commands/relai-prompt.md   392 linie — optymalizator; krok 1 ustala model optymalizatora, nie model wykonawcy
adapters/claude-code/MODELE.md        lista claude-code (list-date 2026-09-24), klasy strong/balanced/cheap, pola alias/id/source — bez `family`
adapters/codex/MODELE.md              lista Codeksa (list-date 2026-09-05), tabela Class | Model, bez źródła i daty przy pozycji
adapters/cursor/MODELE.md             lista Cursora
adapters/codex/AGENTS.md              9 linii — router Codeksa
core/templates/SPEC_PROMPT_ETAPU.md   306 linii — linia metryczna bez `/effort`; wersaliki „NIE otwieraj", „NIE jest ukończony"
core/templates/SPEC_USTAWIENIA.md     :128 i :423 — koszt trybu ciągłego „+110 tokenów"
adapters/claude-code/skills/relai-core/     SKILL.md 491 linii + 6 plików doczytywanych (E3)
adapters/claude-code/skills/relai-planning/ SKILL.md 455 linii + 2 pliki doczytywane (E3)
```

**Czego jeszcze NIE ma:** katalogu `core/prompt/rodziny/` i obu nakładek; pola `family` w listach
modeli; listy Codeksa w formacie pozostałych; modelu docelowego w `/relai-prompt`; wklejek w
`<pasted_content>`; meldunków i rusztowań zależnych od rodziny; zdania o pierwszeństwie polecenia
w routerze Codeksa; `/effort` w linii metrycznej specyfikacji promptu etapu; pełnego kosztu trybu
ciągłego w specyfikacji; sygnału wieku nakładki w hooku startu (K3).

### Zasady aktywne (przepisane w całości z `docs/LEKCJE.md`)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej pisania**, nie
   kontrolą po fakcie: planuj go przed zamknięciem pliku, a rozjazd traktuj jako defekt reguły,
   nie jako wyjątek do obejścia w wykonaniu. **Reguła produkująca tekst opisuje początek wiersza
   i to, czego w nim nie ma**, nie tylko jego zawartość — model domyka lukę formatem materiału,
   który ma pod ręką; materiał sprzed poprawki reguły zostaje obok materiału po niej.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108)
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
   + pliki docelowe), bo sam plik źródłowy pokazuje przeprowadzkę, nie zmianę. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117)
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
   **Limit tur w pomiarze ustawiasz na cały łańcuch, który mechanizm uruchamia przed mierzonym
   krokiem**, i czytasz kod wyjścia każdej sesji — wyjście limitem obok „nie wywołano" znaczy
   „nie zmierzono"; instrument poprawiony w trakcie idzie od nowa dla obu wariantów.
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
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
   (L-0015, L-0030, L-0036, L-0112)
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
    dosłownie w tym brzmieniu, w jakim go spotkałeś. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103)
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

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/PROWADZENIE_END_TO_END/E4/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, projekty kontrolne — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, projekt testowy dla `claude -p`),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Bramka listy Codeksa** — pytanie z bloku na górze; odpowiedź i jej skutek do wpisu dziennika.
2. **Pole `family` i format list (M10+O17):** `adapters/claude-code/MODELE.md`,
   `adapters/cursor/MODELE.md`, `adapters/codex/MODELE.md` — pole `family` (`claude` / `openai` /
   inne z zamkniętej listy) przy każdej pozycji; lista Codeksa w formacie pozostałych (linie klas
   z polami, źródło i data przy pozycji). Czytelnicy list (`/relai-models`, skill planowania, hook,
   walidator „listy modeli adapterow") dalej działają — sprawdzasz każdego.
3. **Nakładki (O15+O16, O09+O11+O12, O18):** `core/prompt/rodziny/claude.md` (Opus 5.5 główny)
   i `core/prompt/rodziny/openai.md` — każda reguła z URL i datą odczytu; reguły per nazwa modelu
   obowiązują tylko przy tej nazwie z listy. `REGULY.md:252-258` odsyła do nakładek z wyzwalaczem;
   prowizjonowanie do projektu (`MANIFEST.json`, hook) jak `REGULY.md`.
4. **`/relai-prompt` (M01, O04, M05+O05, M06, M07):** `adapters/claude-code/commands/relai-prompt.md`
   ustala **model docelowy** (model sesji albo model etapu z planu) i jego rodzinę z listy; wklejki
   owija w `<pasted_content id="…">` z notą o poleceniach w środku; `core/prompt/SZABLONY.md` —
   meldunki zależne od rodziny, rusztowania w XML dla `claude`, zachęta do działania dla `openai`.
5. **Router Codeksa (M08):** `adapters/codex/AGENTS.md` — zdanie, że jawne polecenie użytkownika ma
   pierwszeństwo przed skillem.
6. **Specyfikacja promptu etapu (O01, O14):** `core/templates/SPEC_PROMPT_ETAPU.md` — zalecany poziom
   `/effort` w linii metrycznej i kontroli modelu; nagłówki i zdania bez wersalików nacisku (także
   przykład). Tę samą zmianę w `relai-planning` (lista dziewięciu elementów) i jego pliku, jeśli
   brzmienie tam występuje.
7. **Koszt trybu ciągłego (A14):** `core/templates/SPEC_USTAWIENIA.md:128`, `:423` — pełny koszt:
   wstrzyknięcie reguły, komenda `/relai-prompt`, odczyt reguł przez subagenta i tura zgody,
   z etykietami FAKT / SZACUNEK.
8. **Wiek nakładki (K3):** hook startu mówi o wieku nakładki tak jak o wieku listy modeli —
   z jednym właścicielem sygnału i ciszą poniżej progu (zasada 8); test w
   `core/process/tests/`.
9. **Kryterium etapu:** jeden prompt przepuszczony przez `/relai-prompt` dla Opus 5.5 i dla modelu
   rodziny `openai` wraca w kształcie z przewodnika dostawcy — zapis obu wyników w katalogu roboczym
   i porównanie z regułami nakładki, punkt po punkcie.
10. **`docs/ARTEFAKTY.md`** — nowe wersje zmienionych artefaktów i nowe artefakty (nakładki).
11. **Wydanie** — numer proponujesz, deklaracje wersji wyrównane (walidator, zwykły `grep -r` po
    starym numerze z podziałem na wzmianki historyczne i deklaracje — L-0118), P-005 po zgodzie.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Każda pozycja listy modeli w trzech adapterach ma `family`; lista Codeksa ma źródło i datę przy pozycji; `node core/tools/validate-adapters.js` kod 0 **i** kod 1 na kopii z pozycją bez `family` (kontrola pozytywna).
- [ ] `core/prompt/rodziny/claude.md` i `openai.md` istnieją; każda reguła ma URL i datę (skrypt: liczba reguł = liczba reguł ze źródłem, przy obu liczbach); walidator „baza regul bez nazw modeli" nadal 0 trafień w `REGULY.md` i `SZABLONY.md`.
- [ ] `/relai-prompt` na tym samym zdaniu dla Opus 5.5 i dla modelu rodziny `openai` daje dwie różne propozycje zgodne z nakładkami (XML i meldunek z nakładki `claude`; zachęta do działania i format z nakładki `openai`) — oba wyniki w dzienniku skrótem.
- [ ] Model spoza list: propozycja z samego rdzenia i jedno zdanie o `/relai-models` (dowód z przebiegu, nie z opisu).
- [ ] Wklejka w propozycji owinięta w `<pasted_content>`; oryginał nietknięty obok propozycji.
- [ ] `grep` po wersalikach nacisku w `SPEC_PROMPT_ETAPU.md` — 0 trafień poza cytatami historycznymi; linia metryczna przykładu ma `/effort`.
- [ ] `SPEC_USTAWIENIA.md` podaje pełny koszt trybu ciągłego z etykietami.
- [ ] Sygnał wieku nakładki: test z nakładką starą (sygnał) i świeżą (cisza) w jednym przebiegu.
- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js` — wszystkie przechodzą (liczba do wpisu).
- [ ] `claude plugin validate .` → `✔ Validation passed` przed tagiem; po `claude plugin update relai@relai` zmienione pliki w cache'u nowej wersji zgodne z repo (suma po CRLF → LF), kontrola pozytywna wobec 2.5.0.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z podpisem `Autor: RelAI (<model>) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/PROWADZENIE_END_TO_END/E4/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po do wpisu dziennika; artefakty spoza katalogu (projekty testowe w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PROWADZENIE_END_TO_END/STATUS.md`: E4 → `ZREALIZOWANY <data>`, E5 → `GOTOWY DO STARTU`; linia „E4 rozpoczęty" zastąpiona linią wynikową; bramka listy Codeksa rozstrzygnięta albo opisana.
2. Wpis w `docs/DZIENNIK.md` (Zrobione / Zweryfikowane / Świadomie odłożone / Do zrobienia przez człowieka), przegląd tabeli ryzyk; lekcje z etapu do `docs/LEKCJE.md` i destylat „Zasady aktywne"; pozycje dla człowieka jako bramki w `STATUS.md`.
3. `docs/STATE.md`, `docs/KOMENDY.md` (jeśli `/relai-prompt` zmienia zachowanie widoczne dla człowieka), `docs/ARTEFAKTY.md`.
4. **Wygeneruj `PROMPT_ETAP_5.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` z wiersza E5 w sekcji 6 `PLAN.html`, pozycji E5 w `REJESTR.md`, realnego stanu repo po E4 i lekcji z tego etapu; link w kolumnie `Prompt` przy E5.
5. Commit (conventional, po angielsku) — propozycja do zatwierdzenia przez człowieka.
