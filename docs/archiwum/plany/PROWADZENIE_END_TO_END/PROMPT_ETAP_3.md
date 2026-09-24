# PROMPT_ETAP_3 — Skille w progresywnym ujawnianiu: podział, parytet i pomiar wyzwalania

Plan: PROWADZENIE_END_TO_END • Etap: **E3 z E7** • Wygenerowano: 2026-09-24 (autor: Opus 5.5, w rytuale „Na koniec" etapu E2) • Wykonawca: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (alias `opus`, lista modeli z dnia `2026-09-24`) — D-85. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (etap tnie skill ładowany w każdej sesji każdego użytkownika; zgubiona procedura
> nie da błędu, tylko ciszę).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sygnał odchylenia |
| `docs/plany/PROWADZENIE_END_TO_END/STATUS.md` | status planu i etapu, bramki manualne (jedna dotyczy E4, nie tego etapu) |
| `docs/plany/PROWADZENIE_END_TO_END/REJESTR.md` | pozycje z przypisaniem **E3**: A12+M03, M12, A09, A17 — każda z dowodem; to jest zakres |
| `docs/plany/PROWADZENIE_END_TO_END/PLAN.html` — sekcja 6 (wiersz E3), sekcja 7 (ryzyko **K1**), sekcja 10 (Aneks A) | kryterium etapu i reguła cofania zmiany przy spadku wyzwalania |
| `docs/DECYZJE.md` — wyłącznie **D-90** | haiku nie jest kryterium wyzwalania |
| `docs/DZIENNIK.md` — wpis „2026-09-24 — E1 planu PROWADZENIE_END_TO_END", akapit „Pomiar wyzwalania (K1)" | metoda pomiaru z E1 (instrument skasowano razem z katalogiem roboczym E1 — odtwarzasz go z opisu) |
| `adapters/claude-code/skills/relai-core/SKILL.md` i `relai-planning/SKILL.md` | materiał podziału — przeczytaj spis nagłówków (`grep -n "^#"`), nie całość na raz |
| `adapters/codex/generate-skills.js` i `adapters/cursor/install.js:240-260` | oba kopiują **wyłącznie `SKILL.md`** — pliki doczytywane muszą dojechać do obu adapterów |
| `core/tools/validate-adapters.js:251-256` | walidator woła `generator.verify()` — dziś porównuje tylko `SKILL.md` |
| `docs/PULAPKI.md` — pozycje o `claude -p` i restarcie po `plugin update` | pomiar wyzwalania stoi na świeżych sesjach CLI |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Plan zaakceptowany i zamrożony 2026-09-24 (D-33); zmiany zakresu wyłącznie aneksem (jest Aneks A z E2).
- **D-90:** haiku nie jest kryterium — pomiar na Haiku 4.5 raportujesz, jego spadek nie cofa zmian.
  Kryterium K1 to **Opus 5.5 i Sonnet 5**: spadek wyzwalania na którymkolwiek z nich cofa zmianę
  **opisu** w tym samym etapie; podział treści zostaje.
- Opisy skilli (frontmatter `description`) mieszczą się w 1 024 znakach, trzecia osoba, bez
  `MUST BE USED` — ustalone w E1 (zasada 9). Ten etap opisów nie przepisuje, chyba że pomiar tego
  wymaga.
- **Budżet startu (E2, wydanie 2.4.0):** `startCost()` liczy skill `relai-core` (ścieżkę podaje hook
  Claude Code) i pliki z numerowanej listy rytuału `CLAUDE.md`; domyślny budżet **140 KB**, podniesiony
  z 80 KB **do ponownego pomiaru po podziale skilli** — ten pomiar należy do tego etapu, nowa wartość
  wymaga zgody człowieka.
- Cel rotacji na wadze całkowitej (D-88) jest już w skillu — przy przenoszeniu procedury rotacji do
  pliku doczytywanego zachowaj brzmienie z 2.4.0.
- Rytm wydań: wydanie po każdym etapie zmieniającym plugin; **numer proponujesz, zatwierdza człowiek**
  razem ze zgodą na tag, push i release (P-005, `claude plugin validate .` przed tagiem).
- **Granica zakresu:** nakładki per model i reguły per rodzina to **E4**; README i onboarding to
  **E5**; nowe procedury (debug, bezpieczeństwo, deploy) to **E6** — one powstaną w kształcie
  plików doczytywanych, który ustala ten etap, ale ich tu nie piszesz.

## Stan wyjściowy — co realnie zastajesz

RelAI **2.4.0** wydany publicznie (tag `v2.4.0`, commit `04bae44`, release Latest) i zainstalowany na
tej maszynie (cache `relai/relai/2.4.0`, zgodność 6/6 plików sumą). Testy:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js`
— **56/56** (FAKT, 2026-09-24); `node core/tools/validate-adapters.js` — kod 0, „7 zrodel, wartosc
2.4.0". Katalog-argument w `node --test` nie działa na Node 24 — podawaj pliki.

```
adapters/claude-code/skills/relai-core/SKILL.md      968 linii, 67 656 B — ładowany na pierwszym prompcie
adapters/claude-code/skills/relai-planning/SKILL.md  575 linii, 36 207 B
adapters/codex/skills/<16 katalogów>/SKILL.md        generowane (generate-skills.js), relai-core identyczny bajt w bajt
adapters/cursor/install.js                           kopiuje skille z adaptera Claude Code do .cursor/skills/<nazwa>/SKILL.md
core/process/session-signals.js                      startCost(): 6 pozycji + skill + pliki rytuału
hook startu na tym repo                              123,7 KB przy budżecie 140 KB, z czego skill relai-core 65,6 KB
```

Rejestr (A12+M03): około 40% `relai-core` to procedury rzadkie — zamknięcie sesji ~14,6 tys. znaków,
inicjalizacja ~7,7 tys., jednorazowa migracja ~3,4 tys. (pomiar 2026-09-24). M12: 234 negacje
w `relai-core` (rejestr); prosty `grep -o "nie \|Nie \|NIE "` daje dziś 363 — zdefiniuj licznik,
zanim podasz liczbę (zasada 5).

**Czego jeszcze NIE ma:** plików doczytywanych obok `SKILL.md` w żadnym adapterze; kopiowania takich
plików w generatorze Codeksa i instalatorze Cursora; kontroli parytetu plików doczytywanych
w walidatorze; instrumentu pomiaru wyzwalania (E1 go skasował); pomiaru budżetu po podziale.

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
   etap wykona. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku zapisanym
   narzędziem zapisu, nie w `node -e` ani w heredoku (L-0116); scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
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

> **Katalog roboczy tego etapu: `.claude/relai/work/PROWADZENIE_END_TO_END/E3/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, projekty kontrolne — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, projekt testowy dla `claude -p`),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Pomiar „przed" (A17, K1)** — zanim tkniesz skill: instrument z opisu E1 (`claude -p` w projekcie
   testowym, `stream-json`, dowód = wywołanie narzędzia `Skill`), na zainstalowanym 2.4.0, dla
   Opus 5.5, Sonnet 5 i Haiku 4.5; frazy startu sesji i planowania. Limit tur ustaw na cały łańcuch
   (zasada 5, L-0113). Wynik do dziennika.
2. **Podział `relai-core` i `relai-planning` (A12+M03):** oba `SKILL.md` poniżej **500 linii**;
   procedury rzadkie (zamknięcie sesji, inicjalizacja, adopcja/migracja, rotacja i inne o
   porównywalnej rzadkości) w plikach obok `SKILL.md`, doczytywanych na żądanie, **jeden poziom
   w głąb**. `SKILL.md` mówi, **kiedy** który plik otworzyć — wyzwalacz w treści, nie samo odesłanie
   (zasada 1). Żadna procedura nie ginie: mapa „sekcja przed → miejsce po" w katalogu roboczym.
3. **Mniej zakazów (M12):** tam, gdzie zakaz opisuje pożądane zachowanie od tyłu, przepisz go na opis
   zachowania; zakazy bezpieczeństwa (sekrety, kasowanie, zgoda) zostają. Liczba przed i po,
   licznikiem zdefiniowanym w punkcie wyżej.
4. **Dystrybucja plików doczytywanych:** `adapters/codex/generate-skills.js` generuje je obok
   `SKILL.md` Codeksa, `adapters/cursor/install.js` kopiuje je do `.cursor/skills/<nazwa>/`; test
   albo dowód na projekcie kontrolnym.
5. **Parytet (A09):** `validate-adapters.js` wykrywa rozjazd **każdego** pliku skilla między adapterami
   (nie tylko `SKILL.md`); kontrola pozytywna na podłożonym rozjeździe (zasada 5).
6. **Pomiar „po"** — ten sam instrument, lokalnie podłożony skill pod **inną nazwą** (zasada 10) albo
   po wydaniu; spadek na Opus 5.5 lub Sonnet 5 → zmiana opisu wraca (K1), wynik haiku raportujesz.
7. **Budżet:** hook startu na tym repo przed i po; propozycja nowej wartości `start` dla rdzenia,
   `SPEC_USTAWIENIA.md` i `docs/USTAWIENIA.md` — **tylko za zgodą człowieka**.
8. **`docs/ARTEFAKTY.md`** — nowe wersje obu skilli i nowe artefakty (pliki doczytywane).
9. **Wydanie** — numer proponujesz, deklaracje wersji wyrównane (walidator, `grep` po starym numerze
   z podziałem na wzmianki historyczne i deklaracje), P-005 po zgodzie.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `wc -l` obu `SKILL.md` < 500 (Claude Code i Codex); każdy plik doczytywany osiągalny z `SKILL.md` jednym odesłaniem z wyzwalaczem.
- [ ] Mapa sekcji przed → po: 0 sekcji bez miejsca docelowego (kontrola pozytywna: podłożona zgubiona sekcja zostaje wykryta).
- [ ] Wyzwalanie przed i po, tabela w dzienniku: Opus 5.5 i Sonnet 5 bez spadku; Haiku 4.5 zaraportowany (D-90); kody wyjścia każdej sesji przeczytane.
- [ ] `node adapters/codex/generate-skills.js --verify` spójne, a pliki doczytywane są w `adapters/codex/skills/`; instalator Cursora kopiuje je do projektu kontrolnego.
- [ ] `node core/tools/validate-adapters.js` kod 0 **i** kod 1 na kopii z podłożonym rozjazdem pliku doczytywanego.
- [ ] Negacje w `relai-core` przed i po, jednym licznikiem, liczby w dzienniku.
- [ ] Budżet startu na tym repo przed i po (linia „W sumie"); wartość `start` zmieniona tylko za zgodą.
- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js` — wszystkie przechodzą (liczba do wpisu).
- [ ] `claude plugin validate .` → `✔ Validation passed` przed tagiem; po `claude plugin update relai@relai` pliki skilli w cache'u nowej wersji zgodne z repo (suma po CRLF → LF), kontrola pozytywna wobec 2.4.0.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z podpisem `Autor: RelAI (<model>) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/PROWADZENIE_END_TO_END/E3/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po do wpisu dziennika; artefakty spoza katalogu (projekty testowe w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PROWADZENIE_END_TO_END/STATUS.md`: E3 → `ZREALIZOWANY <data>`, E4 → `GOTOWY DO STARTU`; linia „E3 rozpoczęty" zastąpiona linią wynikową.
2. Wpis w `docs/DZIENNIK.md` (Zrobione / Zweryfikowane / Świadomie odłożone / Do zrobienia przez człowieka), przegląd tabeli ryzyk; lekcje z etapu do `docs/LEKCJE.md` i destylat „Zasady aktywne"; pozycje dla człowieka jako bramki w `STATUS.md`.
3. `docs/STATE.md`, `docs/KOMENDY.md`, `docs/ARTEFAKTY.md`.
4. **Wygeneruj `PROMPT_ETAP_4.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` z wiersza E4 w sekcji 6 `PLAN.html`, pozycji E4 w `REJESTR.md`, realnego stanu repo po E3 i lekcji z tego etapu; przed startem E4 stoi otwarta bramka „Odświeżenie listy modeli Codeksa"; link w kolumnie `Prompt` przy E4.
5. Commit (conventional, po angielsku) — propozycja do zatwierdzenia przez człowieka.
