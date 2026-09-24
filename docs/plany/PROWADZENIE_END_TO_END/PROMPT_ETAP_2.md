# PROMPT_ETAP_2 — Lżejszy start sesji: prawdziwy budżet i rotacja według wagi całkowitej

Plan: PROWADZENIE_END_TO_END • Etap: **E2 z E7** • Wygenerowano: 2026-09-24 (autor: Opus 5.5, w rytuale „Na koniec" etapu E1) • Wykonawca: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (alias `opus`, lista modeli z dnia `2026-09-24`) — D-85. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (etap zmienia mechanizm liczący i specyfikację rotacji, a błąd w nich działa po
> cichu we wszystkich projektach).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, krok 5 rytuału startu (DECYZJE — pozycja A05) |
| `docs/plany/PROWADZENIE_END_TO_END/STATUS.md` | status planu i etapu, bramki manualne |
| `docs/plany/PROWADZENIE_END_TO_END/REJESTR.md` | pozycje z przypisaniem **E2** (6 sztuk: A05, A10, A11, A13, A15, A16) — każda z dowodem; to jest zakres |
| `docs/DECYZJE.md` — wyłącznie **D-88** | cel rotacji na wadze całkowitej pliku — reguła, którą ten etap wdraża |
| `core/templates/SPEC_ARCHIWUM.md` — sekcje „Próg liczony ponad nietykalnymi", „Ryzyka (od 1.6.0)", „Przebieg — dwie fazy", „STATE — inny tryb" | obecna reguła głębokości (linie ~86–110 i ~304) i procedura dwufazowa, którą uruchomisz na tym repo |
| `core/process/session-signals.js` — `startCost()` (~897) i `startCostReport()` (~1003) | co budżet dziś liczy (6 pozycji) i jak raportuje |
| `adapters/claude-code/hooks/session-context.js` — `onSkillInvoked()` (~218–246) | powtórzenie ustawień globalnych przy wywołaniu skilla (A16) |
| `core/templates/SPEC_CLAUDE_MD.md:89` | reguła produktu: DECYZJE **nie** są czytane na starcie |
| `docs/USTAWIENIA.md` — wiersze `Rotacja dokumentów` i `Budżet startu sesji` | progi, od których liczysz |
| `docs/DZIENNIK.md` — sekcja „Stan otwartych ryzyk" + wpis „2026-09-24 — E1 planu PROWADZENIE_END_TO_END" | materiał do rotacji i stan po E1 |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Plan zaakceptowany i zamrożony 2026-09-24 (D-33); zmiany zakresu wyłącznie aneksem.
- **D-88:** rotacja zabiera najstarsze pozycje, aż waga **całego** żywego pliku zejdzie poniżej 60%
  progu — nie „część rotowalna". Wdrożenie w `SPEC_ARCHIWUM.md` i w mechanizmie to ten etap.
- Historia nigdy nie znika po cichu: rotacja przenosi do `docs/archiwum/` z linią-odsyłaczem
  i sumą kontrolną (D-18, `SPEC_ARCHIWUM.md`); dziennik jest append-only.
- Rytm wydań: wydanie po każdym etapie zmieniającym plugin (decyzja człowieka 2026-09-24); **numer
  wersji proponujesz, zatwierdza człowiek** razem ze zgodą na tag, push i release (sekwencja P-005,
  `claude plugin validate .` przed tagiem).
- **Haiku nie jest kryterium** (**D-90**, 2026-09-24): RelAI celuje
  w modele flagowe; pomiary na haiku raportujesz, ale nie cofają zmian.
- Zgoda na tryb ciągły mieszka od 2.3.1 w osobnym pliku sesji (`.claude/relai/zgoda-promptu/<id>.json`)
  — tego mechanizmu nie ruszasz.
- Walidator `core/tools/validate-adapters.js` od 2.3.1 sprawdza wersję także w banerze README
  i w sekcji „Gdzie jesteśmy" `STATE.md` — przy skracaniu STATE ta sekcja **zostaje**, a jej pierwszy
  numer wersji musi być bieżący.
- **Granica zakresu:** podział treści skilli i parytet w walidatorze to **E3** (tu nie skracasz
  `relai-core/SKILL.md`, tylko **liczysz** go w budżecie); nakładki per model i zastrzeżenie dla
  słabszych modeli to **E4**; README to **E5**.

## Stan wyjściowy — co realnie zastajesz

RelAI **2.3.1** jest wydany publicznie (tag `v2.3.1` na commicie zamykającym E1, release Latest na GitHubie)
i zainstalowany na tej maszynie (scope `user`, cache `relai/relai/2.3.1`). Deklaracje wersji w dokumentach
są wyrównane do 2.3.1 (walidator: 7 źródeł). Testy:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js`
— **53/53** (FAKT, 2026-09-24); `node core/tools/validate-adapters.js` — kod 0, „7 zrodel, wartosc 2.3.1".
Katalog-argument w `node --test` nie działa na Node 24 — podawaj pliki (FAKT).

Hook startu z 2026-09-24 zgłosił (FAKT): warstwa startu **88,4 KB przy budżecie 80 KB**; ponad progiem
cząstkowym STATE 25,4 KB (próg 12) i ryzyka 33,4 KB (próg 12); dziennik ponad progiem rotacji;
STATE ponad 300 linii.

```
docs/DZIENNIK.md                         ~166 KB po wpisie E1 (próg rotacji 150 KB) — zmierz na starcie
docs/DZIENNIK.md „Stan otwartych ryzyk"  24 198 B, 15 wierszy ryzyk, 9 ze słowem „ZAMKNI" (FAKT, grep — sprawdź wiersz po wierszu)
docs/STATE.md                            319 linii, ~26 KB (próg 300 linii)
docs/DECYZJE.md                          19 739 B — czytany w kroku 5 rytuału tego repo (A05)
docs/LEKCJE.md                           ~54 KB po lekcjach E1; sekcja „Zasady aktywne" przepisana niżej
adapters/claude-code/skills/relai-core/SKILL.md   ~67 KB — ładowany na pierwszym prompcie, budżet go nie liczy (A11)
core/process/session-signals.js          startCost(): 6 pozycji (CLAUDE, STATE, ryzyka, zasady, ustawienia, status)
core/templates/SPEC_ARCHIWUM.md          cel „część rotowalna poniżej 60% progu" (~108, ~304) — sprzeczny z D-88
adapters/claude-code/hooks/session-context.js:218-246   onSkillInvoked() dokleja ustawienia globalne już podane na starcie (A16)
docs/archiwum/{dziennik,lekcje,ryzyka,plany}/   istniejące archiwa z sumami kontrolnymi
```

**Czego jeszcze NIE ma:** budżetu, który liczy skill wymuszany na pierwszym prompcie i pliki
rytuału startu projektu; celu rotacji zgodnego z D-88 w specyfikacji i mechanizmie; sekcji ryzyk
bez wierszy zamkniętych i z wierszami rzędu ~300 B; dziennika poniżej progu; rytuału startu tego
repo bez `DECYZJE.md`; hooka wywołania skilla bez powtórzenia ustawień globalnych; STATE poniżej
300 linii.

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

> **Katalog roboczy tego etapu: `.claude/relai/work/PROWADZENIE_END_TO_END/E2/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`core/templates/SPEC_ARCHIWUM.md`** (A10): cel głębokości rotacji wg **D-88** — najstarsze
   pozycje, aż waga całego żywego pliku zejdzie poniżej 60% progu; poprawione wszystkie miejsca
   z „częścią rotowalną" jako celem (sprawdź całą rodzinę specyfikacji, zasada 1). Próg liczony
   ponad nietykalnymi zostaje jako **warunek wyzwolenia**, jeśli nadal ma sens — rozstrzygnij
   i zapisz powód w dzienniku. Mechanizm w `core/process/session-signals.js`, jeśli liczy cel —
   zgodny ze specyfikacją, z testem.
2. **Rotacja tego repo** (A15, A13): procedura dwufazowa z `SPEC_ARCHIWUM.md` na `docs/DZIENNIK.md`
   (wpisy do `docs/archiwum/dziennik/`) i na sekcji ryzyk (ryzyka zamknięte do
   `docs/archiwum/ryzyka/`, wiersz żywy skrócony do ~300 B — mitygacja jako stan, nie kronika).
   Faza pierwsza pokazuje człowiekowi, co wyjdzie; przeniesienie po „tak".
3. **Budżet startu** (A11): `startCost()` liczy także skill wymuszany na pierwszym prompcie
   (`relai-core`) i pliki wymienione w rytuale startu `CLAUDE.md` projektu; raport mówi, co jest
   w sumie. Zmiana wartości budżetu w `USTAWIENIA.md` — tylko po pomiarze i za zgodą. Testy
   w `core/process/tests/`.
4. **`CLAUDE.md` i `AGENTS.md`** (A05): krok 5 rytuału nie każe czytać `DECYZJE.md` na starcie —
   brzmienie zgodne z `SPEC_CLAUDE_MD.md:89` („sięgasz, gdy temat dotyka decyzji"); zakaz
   proponowania zamrożonych decyzji zostaje. Oba pliki w tej samej turze.
5. **`adapters/claude-code/hooks/session-context.js`** (A16): `onSkillInvoked()` nie powtarza
   ustawień globalnych, gdy sesja dostała je na starcie; test albo dowód na nośniku (hook przez
   stdin) z kontrolą pozytywną.
6. **`docs/STATE.md`**: poniżej 300 linii bez utraty stanu (tryb STATE z `SPEC_ARCHIWUM.md` — bez
   archiwum, nadpisanie); sekcja „Gdzie jesteśmy" zostaje, walidator po skróceniu kod 0.
7. **`docs/ARTEFAKTY.md`**: nowa wersja przy każdym zmienionym artefakcie z rejestru.
8. **Wydanie**: numer wersji proponujesz (etap zmienia plugin), wszystkie deklaracje wersji
   wyrównane (walidator), `docs/KOMENDY.md` i `docs/USTAWIENIA.md` wg wzorca z 2.3.1; sekwencja
   P-005 **po zgodzie człowieka** na tag, push i release.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `SPEC_ARCHIWUM.md` nie wskazuje już „części rotowalnej" jako celu głębokości (grep na całym `core/templates/` — trafienia poza zakresem to sygnał odchylenia); D-88 przywołane przy regule.
- [ ] Dziennik po rotacji poniżej 60% progu (≤ 90 KB, `wc -c`), archiwum z linią-odsyłaczem i sumą kontrolną zgodną z przeniesioną treścią; najstarszy żywy wpis ma datę późniejszą niż najnowszy zarchiwizowany.
- [ ] Sekcja ryzyk bez wierszy o statusie zamkniętym (policzone), średnio ≤ ~400 B na wiersz (FAKT z pomiaru), zamknięte w archiwum z sumą.
- [ ] Budżet: test pokazuje, że `startCost()` liczy skill i pliki rytuału; hook startu na tym repo raportuje sumę z nimi — liczba przed i po w dzienniku.
- [ ] `grep -n "DECYZJE" CLAUDE.md` — krok 5 nie każe czytać rejestru na starcie; `diff CLAUDE.md AGENTS.md` — wyłącznie nagłówek kopii i nazwa narzędzia.
- [ ] Hook wywołania skilla: przebieg bez powtórzenia ustawień globalnych **i** kontrola pozytywna na tym samym wejściu (zasada 5).
- [ ] `wc -l docs/STATE.md` < 300; `node core/tools/validate-adapters.js` — kod 0.
- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js` — wszystkie przechodzą (liczba do wpisu).
- [ ] `claude plugin validate .` → `✔ Validation passed` przed tagiem; po `claude plugin update relai@relai` treść zmienionego pliku w cache'u nowej wersji zgodna z repo (suma po CRLF → LF), kontrola pozytywna wobec 2.3.1.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z podpisem `Autor: RelAI (<model>) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/PROWADZENIE_END_TO_END/E2/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po do wpisu dziennika; artefakty spoza katalogu (np. `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PROWADZENIE_END_TO_END/STATUS.md`: E2 → `ZREALIZOWANY <data>`, E3 → `GOTOWY DO STARTU`; linia „E2 rozpoczęty" zastąpiona linią wynikową.
2. Wpis w `docs/DZIENNIK.md` (Zrobione / Zweryfikowane / Świadomie odłożone / Do zrobienia przez człowieka), przegląd tabeli ryzyk; lekcje z etapu do `docs/LEKCJE.md` i destylat „Zasady aktywne"; pozycje dla człowieka jako bramki w `STATUS.md`.
3. `docs/STATE.md`, `docs/KOMENDY.md`, `docs/ARTEFAKTY.md`.
4. **Wygeneruj `PROMPT_ETAP_3.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` z wiersza E3 w sekcji 6 `PLAN.html`, pozycji E3 w `REJESTR.md` (A12+M03, M12, A09, A17), realnego stanu repo po E2 i lekcji z tego etapu; link w kolumnie `Prompt` przy E3.
5. Commit (conventional, po angielsku) — propozycja do zatwierdzenia przez człowieka.
