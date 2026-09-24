# PROMPT_ETAP_6 — Krańce drogi: procedura „coś nie działa", bezpieczeństwo zależności i pierwszy deploy

Plan: PROWADZENIE_END_TO_END • Etap: **E6 z E7** • Wygenerowano: 2026-09-24 (autor: Opus 5.5, w rytuale „Na koniec" etapu E5) • Wykonawca: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (alias `opus`, lista modeli z dnia `2026-09-24`) — D-85. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (trzy nowe procedury piszesz od zera i każda ma przejść pierwszy realny przebieg
> na projekcie kontrolnym, zanim uznasz ją za gotową).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sygnał odchylenia |
| `docs/plany/PROWADZENIE_END_TO_END/STATUS.md` | status etapu, bramki manualne (trzy otwarte, żadna nie blokuje E6) |
| `docs/plany/PROWADZENIE_END_TO_END/REJESTR.md` | pozycje z przypisaniem **E6**: A24, A25, A27 + A28 — każda z dowodem; to jest zakres |
| `docs/plany/PROWADZENIE_END_TO_END/PLAN.html` — sekcja 6 (wiersz E6), 7 (ryzyko K6), 10 (Aneksy A–G, zwłaszcza **G**) | kryterium etapu, ryzyko pogrubienia startu, brak wydania w tym etapie |
| `docs/DZIENNIK.md` — wpis „2026-09-24 — E5 planu PROWADZENIE_END_TO_END" | co E5 zmienił (README, bramka, Cursor) i co odłożył |
| `adapters/claude-code/skills/relai-core/SKILL.md` + `profiles.md` | jak wygląda plik doczytywany w kształcie z E3 (wyzwalacz w pierwszym akapicie) i gdzie profil `app` obsługuje pierwsze wdrożenie |
| `core/templates/SPEC_SRODOWISKA.md`, `SPEC_PULAPKI.md`, `SPEC_PROMPT_ETAPU.md` (sekcja 8 „Weryfikacja") | trzy specyfikacje, które procedury E6 rozszerzają |
| `docs/PULAPKI.md` — nagłówek i jedna pozycja (np. P-002) | format wpisu, do którego procedura debugowania ma prowadzić |
| `core/process/prompt-mode.js` — `powodPominiecia` i `core/process/tests/prompt-mode.test.js` | filtr pomijania, który Aneks H rozszerza o powiadomienia systemowe |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan zaakceptowany i zamrożony 2026-09-24 (D-33); zmiany zakresu wyłącznie aneksem (są A–G).
- **Nowe procedury wyłącznie jako pliki doczytywane na żądanie** w kształcie z E3 (sekcja 3 planu,
  ryzyko K6) — nie dopisujesz ich treści do `SKILL.md`, `CLAUDE.md` ani warstwy startu; w skillu
  zostaje najwyżej jedna linia wyzwalacza z nazwą pliku.
- **Budżet startu 100 KB** (E3) — po E5 warstwa startu tego repo waży **95,9 KB** (FAKT,
  `startCost` jak w hooku); zostało ~4 KB zapasu, więc każda linia dopisana do skilla startu jest
  mierzona przed i po.
- **Aneks G:** E6 **nie wydaje** pluginu — bez podbicia numeru, tagu, pushu i release'u; wydanie
  należy do zamknięcia planu. `claude plugin validate .` zostaje punktem weryfikacji.
- **D-80:** RelAI nie buduje telemetrii ani usług; bezpieczeństwo zależności to **wskazanie komendy
  ekosystemu** (`npm audit`, `pip-audit` i odpowiedniki) i punkt weryfikacji, nie własny skaner.
- **D-90:** kryterium odbioru to modele `strong` i `balanced`; słabsze mierzysz tylko, jeśli pomiar
  i tak powstaje.
- **A01 — uczciwe minimum:** hooków nie portujesz do Cursora i Codeksa; nowe procedury dochodzą do
  nich przez skille (Cursor kopiuje skille Claude Code instalatorem, Codex dostaje je generatorem
  `adapters/codex/generate-skills.js`).
- **Granica zakresu:** krok „uruchom testy i przejrzyj zmianę" w pracy solo, siatka rytuału
  „Na koniec" i zasady załogi to **E7**; rotacja `LEKCJE.md` (65,2 KB przy progu 50 KB) należy do
  rytuału sesji.
- **Aneks H (2026-09-24):** filtr bramki trybu ciągłego ma pomijać powiadomienia o zadaniach w tle
  — to jest w zakresie E6 (punkt 6), bez zmiany samej bramki i jej treści z E5.

## Stan wyjściowy — co realnie zastajesz

RelAI **2.6.0** publicznie; repozytorium niesie ponad tym zmiany E5 **bez podbicia numeru** (Aneks G):
README 1 079 słów z instalacją na górze, `docs/INSTALACJA.md` i `docs/PRZEWODNIK.md`, jedno okno
pytań w bramce trybu ciągłego, reguła planowania Cursora na żądanie, demo pionowe ze źródłami
w `docs/zasoby/demo/zrodla/`. Testy:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js`
— **66/66** (FAKT, 2026-09-24); `node core/tools/validate-adapters.js` — kod 0.

```
adapters/claude-code/skills/relai-core/SKILL.md        29,3 KB — skill startu; pliki doczytywane: document-rotation,
                                                        history, new-project, profiles, session-close, waiting-migration
adapters/claude-code/skills/relai-core/profiles.md     5,5 KB — profil app: „pierwsze wdrożenie → docs/srodowiska/<NAZWA>.md"
adapters/claude-code/skills/relai-planning/SKILL.md    28,3 KB — + html-plan.md, plan-closing.md
core/templates/SPEC_SRODOWISKA.md                      9,0 KB — opis środowiska po wdrożeniu (procedura wdrożenia i cofnięcia)
core/templates/SPEC_PULAPKI.md                         11,4 KB — format wpisu P-NNN
core/templates/SPEC_PROMPT_ETAPU.md                    18,4 KB — sekcja 8 „Weryfikacja" bez punktu bezpieczeństwa
adapters/codex/generate-skills.js                      generator skilli Codeksa z adaptera Claude Code (parytet w walidatorze)
docs/KOMENDY.md                                        ściąga: frazy i zachowania automatyczne (fraza „coś nie działa" — brak)
```

**Czego jeszcze nie ma:** procedury dla frazy „coś nie działa" (odtworzenie → hipoteza → poprawka →
wpis do `PULAPKI`); punktu bezpieczeństwa zależności i podstaw OWASP w weryfikacji promptu etapu,
który dotyka kodu; listy kontrolnej **przed** pierwszym wdrożeniem i sekcji „co obserwować po nim"
— dziś dokument środowiska powstaje dopiero po wdrożeniu. Grep 2026-09-24: 0 trafień „debug"
w skillach i komendach, 0 trafień OWASP / `npm audit` / CVE w `core/` i `adapters/` (FAKT z rejestru).

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
   „nie zmierzono"; instrument poprawiony w trakcie idzie od nowa dla obu wariantów.
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125)
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
   po kluczu, reszta nietknięta). (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121)
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

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/PROWADZENIE_END_TO_END/E6/`.** Wszystko tymczasowe — skrypty
> pomiarowe, projekty kontrolne, wyjścia narzędzi — powstaje tam. Artefakt, który z natury musi leżeć
> **poza** projektem (`%TEMP%`, projekt testowy dla `claude -p`), wpisujesz do wpisu dziennika
> **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Procedura „coś nie działa" (A24):** nowy plik doczytywany skilla `relai-core`
   (np. `adapters/claude-code/skills/relai-core/debugging.md`) — odtworzenie z komendą i wynikiem,
   jedna hipoteza naraz sprawdzana dowodem, najmniejsza poprawka, dowód na tym samym odtworzeniu,
   wpis do `docs/PULAPKI.md` wg `SPEC_PULAPKI.md`, gdy przyczyna jest nieoczywistym zachowaniem
   narzędzia. W `SKILL.md` jedna linia wyzwalacza z frazami („coś nie działa", „nie działa",
   „błąd", „sypie się", EN: „it's broken", „doesn't work"); fraza w `docs/KOMENDY.md`.
2. **Bezpieczeństwo zależności i podstawy OWASP (A25):** `core/templates/SPEC_PROMPT_ETAPU.md`,
   sekcja 8 — prompt etapu, który dotyka kodu z zależnościami albo wejściem od użytkownika, dostaje
   punkt weryfikacji: komenda audytu ekosystemu wykryta z plików projektu (`package.json` →
   `npm audit`, `pyproject.toml`/`requirements.txt` → `pip-audit` itd.) z wynikiem do wpisu, oraz
   krótka lista podstaw (walidacja wejścia, zapytania parametryzowane, sekrety poza repo, uprawnienia)
   — brak narzędzia audytu znaczy punkt opisany z warunkiem wykonalności, nie pominięty. Przykład
   w specyfikacji zgodny z nową regułą.
3. **Pierwszy deploy przed faktem (A27 + A28):** nowy plik doczytywany (np.
   `adapters/claude-code/skills/relai-core/first-deploy.md`) — lista kontrolna **przed** pierwszym
   wdrożeniem (zmienne i sekrety, kopia danych, droga cofnięcia sprawdzona, kto ma dostęp) i sekcja
   „co obserwować po nim" (logi, błędy, koszty, kto dostaje alert); `profiles.md` i
   `SPEC_SRODOWISKA.md` dostają wyzwalacz **przed** wdrożeniem, a dokument środowiska — sekcję
   obserwacji. Bez nowego mechanizmu w hookach.
4. **Adaptery:** `node adapters/codex/generate-skills.js` (parytet), instalator Cursora kopiuje nowe
   pliki skilla; walidator kod 0.
6. **Powiadomienia w tle poza bramką (Aneks H):** `core/process/prompt-mode.js` — `powodPominiecia`
   rozpoznaje powiadomienie o zadaniu w tle (kształt treści zdarzenia `UserPromptSubmit` odczytany
   z realnego zdarzenia, nie zgadnięty — wypisz payload hookiem diagnostycznym w projekcie
   kontrolnym) i zwraca powód; test na zapisanej treści + dowód negatywny, że zdanie człowieka
   z tym samym początkiem słowa dalej trafia do bramki.
5. **Dokumenty:** `docs/KOMENDY.md` (fraza i zachowania), `docs/PRZEWODNIK.md` (krótko, w sekcji
   o tym, czego RelAI pilnuje), `docs/ARTEFAKTY.md` (nowe wersje i nowe artefakty).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Każda z trzech procedur przeszła **pierwszy realny przebieg** na projekcie kontrolnym
  w `%TEMP%` (zasada 1): debugowanie — podłożony błąd odtworzony, naprawiony i potwierdzony tym samym
  odtworzeniem; deploy — lista kontrolna wygenerowana przed wdrożeniem projektu `app`; bezpieczeństwo
  — prompt etapu wygenerowany dla projektu z `package.json` ma punkt `npm audit`, a dla projektu bez
  zależności go nie ma (dowód negatywny). Rozjazd reguły z przebiegiem poprawiony w regule.
- [ ] Wyzwalanie: fraza „coś nie działa" w świeżej sesji `claude -p` (plugin z kopii drzewa, instalacja
  wyłączona, ścieżka w `init`) czyta plik procedury — dowód z wywołań narzędzi, z kontrolą pozytywną;
  **najpierw sprawdź w `init`, że potrzebne narzędzia istnieją w trybie `-p`** (L-0123).
- [ ] Filtr bramki (Aneks H): payload powiadomienia o zadaniu w tle zapisany z realnego zdarzenia; `powodPominiecia` zwraca dla niego powód, a dla promptu człowieka `null` — oba w teście.
- [ ] Budżet startu na tym repo poniżej 100 KB po zmianach (liczba przed i po; przed: 95,9 KB FAKT).
- [ ] `grep` po „debug", „OWASP", „npm audit" w `core/` i `adapters/` — trafienia w nowych plikach
  (stan przed: 0 — FAKT z rejestru).
- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js` — wszystkie przechodzą (liczba do wpisu); `node core/tools/validate-adapters.js` kod 0; parytet skilli Codeksa bez rozjazdów.
- [ ] `claude plugin validate .` → `✔ Validation passed` (bez wydania — Aneks G).
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z podpisem `Autor: RelAI (<model>) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/PROWADZENIE_END_TO_END/E6/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po do wpisu dziennika; artefakty spoza katalogu (projekty testowe w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PROWADZENIE_END_TO_END/STATUS.md`: E6 → `ZREALIZOWANY <data>`, E7 → `GOTOWY DO STARTU`; linia „E6 rozpoczęty" zastąpiona linią wynikową.
2. Wpis w `docs/DZIENNIK.md` (Zrobione / Zweryfikowane / Świadomie odłożone / Do zrobienia przez człowieka), przegląd tabeli ryzyk; lekcje z etapu do `docs/LEKCJE.md` i destylat „Zasady aktywne"; pozycje dla człowieka jako bramki w `STATUS.md`.
3. `docs/STATE.md`, `docs/KOMENDY.md`, `docs/ARTEFAKTY.md`.
4. **Wygeneruj `PROMPT_ETAP_7.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` z wiersza E7 w sekcji 6 `PLAN.html`, pozycji E7 w `REJESTR.md`, realnego stanu repo po E6 i lekcji z tego etapu; link w kolumnie `Prompt` przy E7. E7 jest ostatni — jego prompt ma w „Na koniec" sekwencję zamknięcia planu (D-36) **z wydaniem** (Aneks G).
5. Commit (conventional, po angielsku) — propozycja do zatwierdzenia przez człowieka.
