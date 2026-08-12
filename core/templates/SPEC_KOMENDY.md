# SPEC — `docs/KOMENDY.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/KOMENDY.md` **w języku
projektu** (`docs/COMMANDS.md` dla projektu angielskiego).

## Rola

Ściąga: co użytkownik może powiedzieć albo wpisać, żeby coś się stało. Jedyne źródło prawdy o
komendach i frazach RelAI w tym projekcie — przyszła komenda `/relai-help` będzie ten plik
prezentować, a nie duplikować (D-07).

## Odbiorca

Użytkownik (człowiek). Język prosty, opisy przez efekt, nie przez mechanikę.

## Zasada nadrzędna: generowany ze stanu faktycznego

Plik zawiera **wyłącznie to, co w zainstalowanej wersji pluginu naprawdę działa**. Nie wpisujesz
komend zapowiedzianych, planowanych ani „wkrótce". Obietnica w ściądze jest gorsza niż jej brak:
użytkownik traci zaufanie do całego zestawu.

Na końcu pliku dopisujesz jedno zdanie: lista rośnie z kolejnymi wersjami RelAI, aktualna wersja
projektu jest w `docs/USTAWIENIA.md`.

## Struktura sekcji

1. **Nagłówek** — `# KOMENDY — <nazwa projektu>` + linia `RelAI <wersja>`.
2. **Zdanie wstępne** — że nic z tej listy nie jest obowiązkowe: RelAI działa w zwykłej rozmowie,
   a komendy są skrótem dla rzadszych operacji (D-22).
3. **Komendy** — tabela `Komenda | Co robi | Kiedy użyć`. Tylko działające. Pod tabelą **jedno
   zdanie o przedrostku**: Claude Code rejestruje komendy pluginu pod pełną nazwą
   `/relai:relai-<nazwa>`, a sama nazwa (`/relai-backup`) działa tam, gdzie podpowiadacz ją
   rozwinie. Zmierzone: w sesji nieinteraktywnej (`claude -p`) forma skrócona kończy się
   komunikatem `Unknown command`. Zdanie ma być jedno i ma stać pod tabelą, żeby nie zaśmiecać
   kolumny „Komenda" dwiema wersjami każdej pozycji.
4. **Frazy naturalne** — tabela `Powiesz | Co się stanie`. Frazy w języku projektu. Tylko działające.
5. **Czego RelAI pilnuje bez proszenia** — punkty o zachowaniach automatycznych działających w tej
   wersji (np. aktualizacja dokumentów w ramach ukończenia zadania). Lista rośnie z wersjami;
   typowo 5–10 pozycji. Punkt o zachowaniu, którego jeszcze nie ma, nie istnieje.
6. **Stopka** — jedno zdanie o rosnącej liście + odsyłacz do `docs/USTAWIENIA.md` po numer wersji.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Aktualizacja pluginu do wyższej wersji | regenerujesz plik ze stanu faktycznego nowej wersji, zmieniasz numer w nagłówku |
| Lokalne nadpisanie zachowania w projekcie | dopisujesz wiersz z jawnym oznaczeniem „lokalne" |
| Cokolwiek innego | plik zostaje bez zmian — nie jest miejscem na notatki |

Plik jest **regenerowany**, nie edytowany ręcznie. Wyjątkiem są wiersze oznaczone jako lokalne —
te przeżywają regenerację (D-62: lokalne nadpisania mają pierwszeństwo).

## Zakres wersji 1.5.0 — co realnie działa

Od 0.4.0 działa **pierwsza komenda** — `/relai-stage` — i wygenerowany `KOMENDY.md` ma tabelę
komend. W 0.5.0 doszło **osiem hooków**: sekcja „Czego RelAI pilnuje bez proszenia" urosła
o zachowania hooków (lista niżej). W 0.6.0 doszedł **interaktywny plan HTML** i **nadpisanie
lokalne szablonu**. W 0.7.0 doszło **sześć komend operacyjnych** — tabela komend urosła z jednej
pozycji do siedmiu. W 0.8.0 **profil projektu zaczyna cokolwiek robić**: rośnie sekcja
o zachowaniach automatycznych. W 0.9.0 dochodzą **adopcja i aktualizacja** — tabela komend rośnie
z siedmiu do dziewięciu pozycji. W 1.1.0 dochodzą **odnogi planu**: dziesiąta komenda
`/relai-branch` i sygnał odchylenia w sekcji o zachowaniach automatycznych. W 1.2.0 dochodzi
**rotacja dokumentów** — kolejny punkt w sekcji o zachowaniach automatycznych; tabela komend nie
rośnie, bo rotacja nie ma własnej komendy. W 1.3.0 dochodzą **cztery poprawki z retrospektywy** —
same zachowania, żadnej nowej komendy: sygnał rozjazdu stanu, kontrola podpisu wpisu, bramki
manualne przy zamykaniu planu i rejestr decyzji po adopcji. W 1.4.0 dochodzi **skan sekretów przy
commicie** — guardrail spoza harnessu, **instalowany ręcznie**, więc opisany osobno jako
możliwość, a nie jako zachowanie, które samo się włączyło; tabela komend znowu nie rośnie.
W 1.5.0 dochodzi **adapter Cursora**: te same dziesięć komend, te same dokumenty i ten sam proces
w drugim narzędziu. Tabela komend nie rośnie i **nie zmienia się ani jeden wiersz o zachowaniach
Claude Code**; w projekcie, w którym adapter Cursora został zainstalowany, dopisujesz jedno zdanie
o pracy naprzemiennej (oba narzędzia czytają te same `docs/`, wersję struktury podbija wyłącznie
`/relai-update`). Punkt piszesz **wyłącznie wtedy, gdy w projekcie jest `.cursor/relai-install.json`**
— inaczej milczysz, tak jak przy pre-commicie (L-0002, L-0029). Działa:

- inicjalizacja struktury projektu (zgoda → trzy pytania → osiem dokumentów),
- rozpoznanie folderu, który już jest projektem RelAI,
- tryb gościa po odmowie (bez ponownego pytania),
- niedestrukcyjne dołączenie struktury do folderu z zawartością,
- rytuał startu sesji (ustalona kolejność czytania + akapit „gdzie jesteśmy"),
- definicja ukończenia: `STATE.md` i wpis w `DZIENNIK.md` w tej samej turze co zmiana, bez proszenia,
- rejestr lekcji: wpis po każdej korekcie bez pytania, propozycja graduacji przy powtórzeniu,
- rejestr decyzji: propozycja zamrożenia powracającego tematu, przechwytywanie fraz zamykających,
- dziedziczenie preferencji globalnych między projektami,
- trzy frazy rytualne (poniżej) w wariancie polskim i angielskim,
- naturalne prośby: „dodaj RelAI", „dołącz strukturę RelAI",
- **planowanie (od 0.3.1):** prośba o plan w zwykłej rozmowie → `docs/plany/<TEMAT>/PLAN.md`
  + `STATUS.md` + linia „Aktywny plan" w `CLAUDE.md`; drobne zadanie → miniplan w dzienniku;
  jedno pytanie o rodzaj, format i model wykonawczy etapów (potem brane z ustawień); zamrożenie
  planu po akceptacji i zmiany wyłącznie datowanymi aneksami; zamknięcie planu z archiwizacją,
- **etapy (od 0.4.0):** akceptacja planu tworzy `PROMPT_ETAP_1.md`; komenda `/relai-stage`
  wykrywa plan i następny etap, pokazuje potwierdzenie i czeka; zamknięcie etapu aktualizuje
  `STATUS.md`, dopisuje wpis do dziennika i **generuje prompt następnego etapu**; brakujący prompt
  jest wyłapywany na starcie sesji; po ostatnim etapie plan zamyka się sam,
- **hooki (nowe w 0.5.0), do sekcji „Czego RelAI pilnuje bez proszenia":** blokada zapisu sekretu
  (klucz API, token, JWT, klucz prywatny, `PASSWORD=`/`SECRET=` z wartością) do pliku śledzonego —
  sekret może trafić wyłącznie do `.env` objętego `.gitignore`; zmiana sekcji niemutowalnej
  `CLAUDE.md` albo `USTAWIENIA.md` wymaga jawnego zatwierdzenia; przypomnienie, gdy zmiana kodu
  zostaje bez aktualizacji `STATE`/`DZIENNIK`; ostrzeżenie o `console.log`/`debugger` w kodzie
  produkcyjnym; ostrzeżenie tsc/eslint, gdy projekt ma te narzędzia; przypomnienie o spójności
  z `DESIGN.md`, gdy plik istnieje; ciche formatowanie Prettierem, gdy projekt go ma; na starcie
  sesji: data dnia, kontrola wersji projekt↔plugin, wymuszenie rytuału startu i siatka brakujących
  promptów etapowych — nawet bez wyzwolenia skilla,
- **plan główny w HTML (nowe w 0.6.0):** gdy preferencja formatu mówi „HTML", plan powstaje jako
  jeden samowystarczalny plik `PLAN.html` — zwijane sekcje, diagram, wykres, symulator wyliczeń,
  zero połączeń z internetem; `STATUS.md`, prompty etapowe i miniplany zostają w Markdown,
- **własny styl planów (nowe w 0.6.0):** przy pierwszym planie HTML pada pytanie o zmianę wyglądu;
  zgoda tworzy kopię szablonu w `docs/zasoby/HTML_PLAN/`, która **ma pierwszeństwo** przed wersją
  z pluginu i przeżywa jego aktualizacje,
- **komendy operacyjne (nowe w 0.7.0):** kopia zapasowa projektu do archiwum ZIP w centralnym
  folderze (pytanie o lokalizację raz, sekrety zawsze poza archiwum); przegląd porządków i zdrowia
  kończący się listą propozycji do zatwierdzenia; lista zmian destylowana z dziennika; pakiet
  przekazania projektu w jednym pliku HTML; wycieczka po projekcie z jego dokumentów; ściąga
  komend i fraz,
- **propozycja wycieczki (nowe w 0.7.0), do sekcji „Czego RelAI pilnuje bez proszenia":** gdy
  wszystkie wpisy w dzienniku podpisał kto inny niż bieżący użytkownik gita, RelAI proponuje
  wycieczkę po projekcie — propozycja, nigdy automatyczne odpalenie,
- **reguły profilu (nowe w 0.8.0), do sekcji „Czego RelAI pilnuje bez proszenia":** dokumenty
  dopasowane do typu projektu powstają **przy zdarzeniu**, nie przy zakładaniu projektu. Wpisujesz
  **wyłącznie punkty profilu tego projektu** — projekt `app` nie czyta o snapshotach, a projekt
  `flow` o dokumencie architektury:
  - profil `app`: pierwszy kod → opis architektury i jedno pytanie o testy; pierwszy ekran →
    jedno pytanie o kierunek wizualny i dokument wyglądu; pierwsze wdrożenie → opis środowiska
    z procedurą wdrożenia i cofnięcia, z nazwami zmiennych zamiast wartości,
  - profile `agent-voice` i `flow`: zmiana produkcyjnej konfiguracji bez kopii stanu sprzed
    zmiany zostaje **zatrzymana** — RelAI mówi, jaką kopię zrobić, i czeka,
  - profil `prompty`: rejestr wersji artefaktów; nowy albo niezarejestrowany artefakt →
    przypomnienie o wpisie „co się zmieniło" i „po co",
- **adopcja i aktualizacja (nowe w 0.9.0):** `/relai-adopt` przenosi istniejący projekt na
  strukturę RelAI — backup jako bramka, analiza kodu i historii, struktura z zastanego stanu,
  scalenie istniejącego `CLAUDE.md` z zachowaniem reguł, raport zmian z procedurą pełnego
  cofnięcia; działa wyłącznie na jawne wywołanie. `/relai-update` porównuje wersję projektu
  z wersją pluginu, pokazuje różnice, aktualizuje strukturę za zgodą i nie rusza nadpisań
  lokalnych,
- **sygnał wersji (zmienione w 0.9.0), do sekcji „Czego RelAI pilnuje bez proszenia":** gdy
  wersja projektu różni się od wersji pluginu, RelAI mówi o tym na starcie sesji i wskazuje
  `/relai-update` — nie migruje projektu na własną rękę,
- **odnogi planu (nowe w 1.1.0):** `/relai-branch` zakłada boczny wątek — kartę z celem, zakresem
  i weryfikacją oraz gotowy prompt świeżej sesji — nie ruszając zamrożonego planu; bez aktywnego
  planu ten sam wątek powstaje jako samodzielny w `docs/fixy/`,
- **sygnał odchylenia (nowe w 1.1.0), do sekcji „Czego RelAI pilnuje bez proszenia":** gdy
  w trakcie etapu wypływa rzecz spoza jego zakresu, RelAI zatrzymuje się i pyta — odnoga, aneks do
  planu czy „świadomie odłożone" — zamiast robić ją przy okazji. Przy zamykaniu planu wylicza
  odnogi, które zostały otwarte, i pyta o każdą,
- **rotacja dokumentów (nowe w 1.2.0), do sekcji „Czego RelAI pilnuje bez proszenia":** przy
  zamykaniu sesji najstarsza historia przenosi się z dziennika i rejestru lekcji do
  `docs/archiwum/`, w całości i bez zmiany choćby znaku; w żywym pliku zostaje linia z linkiem do
  archiwum. Dopóki dokumenty mieszczą się w progu, nie dzieje się nic i nie pada ani jedno słowo.
  Wpis czekający na decyzję człowieka zostaje na miejscu niezależnie od wieku. Progi i wyłącznik są
  w `USTAWIENIA.md`. Opisujesz **efekt** — dwufazowość, sumy kontrolne i nazwy plików to mechanika,
  która do ściągi nie wchodzi.
- **rozjazd stanu (nowe w 1.3.0), do sekcji „Czego RelAI pilnuje bez proszenia":** gdy dokumenty
  mówią różne rzeczy o tym, który etap trwa — status etapu kontra wskazanie aktywnego planu kontra
  opis stanu — RelAI mówi o tym na starcie sesji jednym zdaniem i pyta, który zapis jest prawdziwy.
  Nie prostuje żadnego dokumentu sam,
- **podpis wpisu (nowe w 1.3.0), do sekcji „Czego RelAI pilnuje bez proszenia":** wpis w dzienniku
  jest podpisany modelem **i** użytkownikiem z konfiguracji gita; brakujący człon użytkownika
  zostaje wyłapany zaraz po zapisie. Opisujesz efekt („wiadomo, kto przy tym był"), nie nazwę
  hooka,
- **bramki manualne (nowe w 1.3.0), do sekcji „Czego RelAI pilnuje bez proszenia":** rzeczy
  czekające na człowieka, zapisane we wpisach dziennika, są widoczne w `STATUS.md` planu, a plan
  nie zamyka się, dopóki RelAI nie zapyta o każdą z nich,
- **rejestr decyzji po adopcji (nowe w 1.3.0):** w projekcie przeniesionym na RelAI nowe
  rozstrzygnięcia zapisują się w `DECYZJE.md`, a zastane reguły w `CLAUDE.md` zostają zapisem
  stanu sprzed adopcji. **Punkt piszesz wyłącznie w projekcie po adopcji** — w projekcie zakładanym
  od zera nie ma czego rozdzielać (L-0029),
- **skan sekretów przy commicie (nowe w 1.4.0), do sekcji „Czego RelAI pilnuje bez proszenia" —
  ale jako pozycja z warunkiem:** gdy w projekcie **zainstalowano** gitowy pre-commit RelAI,
  `git commit` z kluczem albo hasłem w plikach z indeksu kończy się błędem i commit nie powstaje —
  także wtedy, gdy commituje człowiek albo inne narzędzie, bez udziału Claude. Punkt piszesz
  **wyłącznie wtedy, gdy hook jest w tym projekcie zainstalowany** (`.git/hooks/pre-commit`
  pochodzący z RelAI); w pozostałych projektach zamiast tego dopisujesz **jedno zdanie
  z możliwością** i poleceniem instalacji. Nigdy nie piszesz, że dzieje się to samo — instalacja
  jest jawną czynnością człowieka (L-0002),

Wygenerowany `KOMENDY.md` w wersji 1.5.0 zawiera **tabelę komend z dziesięcioma pozycjami**
oraz tabelę fraz naturalnych:

| Komenda | Co robi |
|---|---|
| `/relai-stage [TEMAT] [EN]` | uruchamia etap planu: wykrywa aktywny plan i następny etap, pokazuje potwierdzenie i czeka na zgodę; bez argumentów bierze etap `GOTOWY DO STARTU` |
| `/relai-backup [ŚCIEŻKA]` | pakuje projekt do archiwum ZIP w centralnym folderze backupów; sekrety i katalogi runtime zostają poza archiwum; kończy wpisem w dzienniku |
| `/relai-audit [porzadki\|zdrowie]` | raport w dwóch częściach — porządki i zdrowie — zakończony listą propozycji; sam niczego nie zmienia |
| `/relai-changelog [zakres]` | destyluje dziennik do listy zmian; wynik na ekran, plik dopiero na życzenie |
| `/relai-handover [ŚCIEŻKA]` | składa pakiet przekazania projektu w jednym pliku HTML działającym bez internetu |
| `/relai-tour [krotko]` | oprowadza po projekcie wyłącznie z jego dokumentów; niczego nie zapisuje |
| `/relai-help [fraza]` | pokazuje ściągę projektu — treść pochodzi wyłącznie z `KOMENDY.md` |
| `/relai-adopt [ŚCIEŻKA_BACKUPU]` | adoptuje zastany projekt: backup-bramka, analiza, struktura z zastanego stanu, scalenie `CLAUDE.md`, raport z procedurą pełnego cofnięcia; wyłącznie na jawne wywołanie |
| `/relai-update` | aktualizuje projekt do wersji zainstalowanego pluginu: różnice, zgoda, poszanowanie nadpisań lokalnych, wpis w dzienniku |
| `/relai-branch [NAZWA] [cel]` | zakłada odnogę: kartę wątku i samowystarczalny prompt świeżej sesji; jedna linia w sekcji „Odnogi" `STATUS.md`, zamrożony plan bez zmian; bez planu — wątek samodzielny w `docs/fixy/` |

| Fraza (PL / EN) | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | rytuał zamknięcia: sync dokumentów, wpis w dzienniku, aktualizacja ryzyk, propozycja commita, podsumowanie |
| „kontynuujemy pracę" / „let's continue" | odtworzenie kontekstu z dokumentów + akapit „gdzie jesteśmy" + propozycja najbliższego kroku |
| „sprawdź status" / „status check" | raport: stan, plany i etapy, otwarte ryzyka, zaległości dokumentacyjne |
| „przygotuj plan …" / „zaplanuj …" / „rozpisz to na etapy" / „make a plan" | plan w strukturze projektu: pełny PLAN z etapami albo miniplan w dzienniku — po jednym pytaniu o rodzaj, format i model |

## Zakazy

- Nie dopisujesz fraz spoza listy działających w danej wersji.
- Nie opisujesz mechaniki wewnętrznej (skille, hooki) — użytkownika interesuje efekt.
- Nie wpisujesz punktów profilu, którego ten projekt nie ma.

## Przykład dla wersji 1.5.0 (projekt polski, profil `app`)

```markdown
# KOMENDY — Parkly

RelAI 1.5.0

Nic z tej listy nie jest obowiązkowe. RelAI działa w zwykłej rozmowie — piszesz normalnie,
a struktura projektu nadąża. Komendy są skrótem do rzadszych operacji.

## Komendy

| Komenda | Co robi | Kiedy użyć |
|---|---|---|
| `/relai-stage` | znajduje aktywny plan i pierwszy etap gotowy do startu, pokazuje, co się wydarzy, i czeka na Twoje „zaczynamy" | na początku świeżej sesji, w której chcesz zrobić kolejny etap planu |
| `/relai-stage E5` · `/relai-stage PLATNOSCI E2` | to samo, ale dla wskazanego etapu (i planu) | gdy chcesz wrócić do etapu innego niż następny w kolejce |
| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP w Twoim folderze backupów; hasła i klucze zostają poza archiwum | przed większą zmianą, przed aktualizacją, albo po prostu raz na jakiś czas |
| `/relai-audit` | przegląda dokumenty i mówi, co się rozjechało: co jest nieaktualne, czego brakuje, co czeka od miesięcy — i proponuje, co z tym zrobić | gdy wracasz po przerwie albo przed przekazaniem projektu komuś |
| `/relai-changelog` · `/relai-changelog od 2026-07-01` | zamienia dziennik w listę zmian po ludzku: co nowego, co poprawione | gdy ktoś pyta „co się zmieniło od ostatniego razu" |
| `/relai-handover` | składa pakiet przekazania: jeden plik HTML ze stanem, mapą dokumentów, planami, ryzykami i pierwszymi krokami | gdy oddajesz projekt komuś innemu — na stałe albo na czas urlopu |
| `/relai-tour` | oprowadza Cię po projekcie: co to jest, gdzie jesteśmy, czego nie ruszać, od czego zacząć | gdy otwierasz cudzy projekt albo wracasz do własnego po długiej przerwie |
| `/relai-help` | pokazuje tę ściągę | gdy nie pamiętasz, co można wpisać |
| `/relai-adopt` | przenosi istniejący projekt na RelAI: najpierw pełny backup, potem analiza i dokumenty wygenerowane z tego, co w projekcie naprawdę jest; kończy raportem z instrukcją pełnego cofnięcia | w folderze innego projektu, który chcesz objąć RelAI — ten projekt już jest objęty |
| `/relai-update` | podnosi ten projekt do wersji zainstalowanego RelAI: pokazuje, co się zmieni, czeka na Twoje „tak" i nie rusza niczego, co sam zmieniłeś | gdy RelAI mówi na starcie sesji, że projekt jest starszy niż plugin |
| `/relai-branch` · `/relai-branch OPIS_REPO` | odkłada boczny wątek na bok: spisuje, o co chodzi i po czym poznać, że zrobione, i przygotowuje gotowy prompt do wklejenia w nowej sesji | gdy w trakcie etapu wypływa coś ważnego, ale nie na teraz — zamiast robić to przy okazji albo zapomnieć |

Pełna nazwa każdej z nich to `/relai:relai-…` (np. `/relai:relai-backup`) — wpisz `/relai` i wybierz
z podpowiedzi; skrócona forma działa tam, gdzie podpowiadacz ją rozwinie.

## Frazy, które działają

| Powiesz | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | RelAI domyka dokumenty, zapisuje wpis w dzienniku, aktualizuje ryzyka, proponuje commit i podsumowuje sesję |
| „kontynuujemy pracę" / „let's continue" | RelAI odtwarza kontekst z dokumentów, mówi, gdzie jesteśmy, i proponuje najbliższy krok |
| „sprawdź status" / „status check" | krótki raport: stan projektu, plany i etapy, otwarte ryzyka, zaległości w dokumentach |
| „przygotuj plan…" / „zaplanuj…" / „rozpisz to na etapy" | powstaje plan w `docs/plany/` z wariantami, ryzykami i etapami — albo krótki miniplan w dzienniku, jeśli zadanie jest drobne |
| „dodaj RelAI" / „dołącz strukturę RelAI" | RelAI dołoży brakujące dokumenty, nie ruszając niczego, co już jest |

## Czego RelAI pilnuje bez proszenia

- Po każdej zmianie funkcjonalnej aktualizuje `STATE.md` i dopisuje wpis do `DZIENNIK.md` — w tej
  samej turze, bez przypominania.
- Po każdej Twojej korekcie zapisuje lekcję w `LEKCJE.md`; gdy ta sama uwaga wraca, proponuje wpisać
  ją na stałe do reguł projektu.
- Gdy ten sam temat rozstrzygasz drugi raz tak samo, proponuje zamrozić to jako decyzję.
- O format planów i model wykonawczy etapów pyta raz — potem bierze odpowiedź z ustawień.
- Plan główny składa w jednym pliku HTML, który otwierasz dwuklikiem i wysyłasz dalej — działa bez
  internetu. Przy pierwszym takim planie pyta raz, czy chcesz inny styl; Twoja wersja szablonu
  zostaje w projekcie i wygrywa z domyślną także po aktualizacji RelAI.
- Zaakceptowanego planu nie przepisuje: zmiana wchodzi jako datowany aneks, żeby było widać, co
  uzgodniliście pierwotnie.
- Po zaakceptowaniu planu przygotowuje prompt pierwszego etapu, a po zamknięciu każdego etapu —
  prompt następnego. Kolejną sesję zaczynasz od `/relai-stage`, nie od tłumaczenia, co dalej.
- Gdy poprzednia sesja urwała się w połowie zamykania etapu, mówi o tym na starcie następnej
  i proponuje uzupełnić brakujący prompt.
- Gdy w trakcie etapu wypływa coś spoza jego zakresu, zatrzymuje się i pyta: zrobić z tego odnogę,
  dopisać aneks do planu, czy odłożyć świadomie — zamiast robić to przy okazji i rozdymać etap.
- Po ostatnim etapie zamyka plan sam: aktualizuje stan, pisze wpis „co dowieziono vs plan"
  i przenosi plan do archiwum. Zostały otwarte odnogi albo rzeczy czekające na Ciebie — najpierw
  pyta o każdą z nich, zanim napisze gdziekolwiek, że plan jest skończony.
- To, co czeka na Twoją decyzję — dostęp, zakup, akceptacja — nie zostaje pogrzebane w dzienniku:
  jest widoczne w statusie planu, dopóki go nie rozstrzygniesz.
- Gdy dokumenty rozjadą się co do tego, który etap trwa, mówi o tym na starcie sesji jednym zdaniem
  i pyta, który zapis jest prawdziwy — zamiast wybrać sobie jeden i pracować na nim.
- Każdy wpis w dzienniku podpisuje modelem i Tobą (z konfiguracji gita), żeby po miesiącach było
  wiadomo, kto przy tym był.
- Nie nadpisuje i nie kasuje plików, których sam nie utworzył.
- **Blokuje** zapis klucza, tokenu albo hasła do pliku trafiającego do repozytorium — sekret może
  wylądować wyłącznie w `.env`, którego git nie śledzi.
- Zmiana zamrożonych reguł projektu (`CLAUDE.md` — sekcja niemutowalna, `USTAWIENIA.md`) wymaga
  Twojego zatwierdzenia — RelAI zapyta, zanim cokolwiek zmieni.
- Gdy dziennik albo rejestr lekcji urośnie ponad próg, przy zamykaniu sesji przenosi najstarszą
  historię do `docs/archiwum/` — w całości, bez skracania — i zostawia w żywym pliku linię z linkiem
  do niej. Wpis czekający na Twoją decyzję zostaje na miejscu, choćby był najstarszy. Dopóki
  dokumenty mieszczą się w progu, nie dzieje się nic; progi i wyłącznik masz w `USTAWIENIA.md`.
- Przypomina, gdy zmiana kodu została bez wpisu w dzienniku i aktualizacji stanu.
- Ostrzega przed `console.log` zostawionym w kodzie produkcyjnym; gdy projekt ma TypeScript albo
  ESLint — pokazuje ich błędy zaraz po edycji pliku.
- Na starcie każdej sesji sam podaje dzisiejszą datę, sprawdza wersję projektu i przypomina
  o niedokończonym etapie planu — nawet jeśli nic nie napiszesz. Gdy projekt jest starszy niż
  plugin, wskazuje `/relai-update` zamiast przerabiać cokolwiek na własną rękę.
- Gdy otworzysz projekt, którego wszystkie wpisy w dzienniku podpisał kto inny, proponuje
  oprowadzenie po nim — propozycję, nie oprowadzanie na siłę.
- Dokumenty dopasowane do typu projektu zakłada **wtedy, gdy są potrzebne**, a nie przy zakładaniu
  projektu: przy pierwszym kodzie opis architektury i jedno pytanie o testy, przy pierwszym ekranie
  jedno pytanie o kierunek wizualny i dokument wyglądu, przy pierwszym wdrożeniu opis środowiska
  z procedurą wdrożenia i cofnięcia.
- W opisie środowiska trzyma **nazwy** zmiennych i miejsce przechowywania haseł — nigdy samych
  haseł.
- Z backupu wyrzuca hasła i klucze, zanim spakuje projekt — i sprawdza to na gotowym archiwum,
  a nie na własnej obietnicy.
- Nie zakłada repozytorium gita wewnątrz innego repozytorium.

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu znajdziesz
w [USTAWIENIA.md](USTAWIENIA.md).
```
