# PROMPT_ODNOGA — guard hooków rozpoznaje projekt po ścieżce edytowanego pliku

Odnoga: GUARD_PO_SCIEZCE • Plan-rodzic: ROZWOJ_PO_WYDANIU, etap E6 (pozycja pochodzi z E10 planu
BUDOWA_RELAI) • Wygenerowano: 2026-08-17 (autor: Opus 5) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/GUARD_PO_SCIEZCE/ODNOGA.md` | cel, zakres i weryfikacja — karta jest źródłem, ten prompt ją wykonuje |
| `core/process/session-signals.js` | `relaiMarkerFile()` i `isGuest()` — tu mieszka rozpoznanie, które trzeba rozszerzyć |
| `adapters/claude-code/hooks/secret-scanner.js` | konsument rdzenia + własne `isGitIgnored()` liczone z `cwd` |
| `adapters/claude-code/hooks/config-protection.js` | drugi guardrail oparty na tym samym rozpoznaniu |
| `adapters/cursor/hooks/secret-scanner.js` | bliźniak w protokole Cursora — ma zachować się identycznie |
| `core/README.md` | granica rdzeń ↔ adapter i zapis o ośmiu hookach z własną kopią `isGuest` |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Kierunek jest wybrany:** marker szukany **także od katalogu edytowanego pliku w górę**, obok
  dzisiejszego sprawdzenia po katalogu sesji. Nie zamieniasz jednego na drugie — sesja pracująca
  we własnym projekcie ma działać dokładnie jak dziś.
- **Tryb gościa wygrywa zawsze.** Marker gościa znaleziony po drodze wycisza guard, niezależnie od
  kierunku rozpoznania. „Nie chcę tu RelAI" mówi się raz i obowiązuje w obu narzędziach.
- **Zestaw chronionych plików i wzorce sekretów zostają bez zmian** — to jest zmiana rozpoznania
  projektu, nie polityki ochrony.
- **Adapter konsumuje rdzeń, nie kopiuje go** (P4). Logika rozpoznania mieszka w
  `core/process/session-signals.js`; hooki dostają tylko protokół.
- **„Zachowanie się nie zmieniło" dowodzisz dwoma drzewami w jednym przebiegu** (L-0040) — przy
  zmianie w rdzeniu wołanym przez dziesięć hooków to nie jest opcja.
- **Nie ruszasz planu głównego.** `PLAN.html` planu ROZWOJ_PO_WYDANIU jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

RelAI **1.5.2**, dwa adaptery na wspólnym rdzeniu.

```
core/process/session-signals.js      # relaiMarkerFile(cwd, markeryGoscia) — szuka docs/*.md z markerem, START ZAWSZE OD cwd
adapters/claude-code/hooks/          # dziesiec hookow; secret-scanner i config-protection to guardraile
adapters/cursor/hooks/               # secret-scanner + session-context, ten sam rdzen
core/README.md                       # zapis o osmiu hookach z wlasna kopia isGuest
```

**Czego jeszcze NIE ma:** żadnej ścieżki rozpoznania liczonej od pliku. `relaiMarkerFile()` czyta
`path.join(cwd, 'docs')` i kończy się na tym; `isGitIgnored()` w obu adapterach woła
`git check-ignore` z `cwd` sesji, więc dla pliku z innego repozytorium odpowiada o cudzej historii.

**Dowód, że dziura jest realna (E6, 2026-08-17):** sesja uruchomiona w repozytorium RelAI pisała
pliki w projekcie `ProbaCursorE6` — praca międzyprojektowa jest normą, odkąd adaptery instaluje się
z jednego repozytorium w wielu projektach.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest martwa.
   (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do
   `KOMENDY.md` dopiero w wersji, w której realnie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Plugin RelAI jest zainstalowany (scope `user`) od 0.3.1. Zachowania skilli mierzysz **realnie** —
   świeżą sesją `claude -p … --output-format stream-json` i liczbą wywołań narzędzia `Skill` —
   a nie odtwarzaniem procedury ręcznie. Po zmianie skilla: push → `claude plugin marketplace update
   relai` → **`claude plugin update relai@relai`**, inaczej mierzysz starą wersję. (L-0004, zmienione
   2026-08-07; sekwencja doprecyzowana 2026-08-08 — L-0020)
5. Zanim opiszesz zachowanie agenta w skillu, sprawdź, czy da się je zweryfikować z wnętrza sesji
   wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa, zamiast deklarować
   ją jako wykonaną. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt": zanim zapytasz, sprawdź
   `USTAWIENIA.md` i warstwę globalną, a gdy próg rozstrzyga jednoznacznie — nie pytaj wcale,
   tylko powiedz, co przyjąłeś. (L-0006)
7. Test zamrożenia (i każdy inny test „czegoś nie wolno") wymaga dowodu negatywnego: pokaż, że
   chroniony fragment ma nadal pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
8. Po podbiciu wersji pluginu przepuść repo `grep`-em po starym numerze i rozstrzygnij **każde**
   trafienie: historyczne zostaje, aktualne się zmienia. (L-0008)
9. Opis skilla zaczynaj od `MUST BE USED`, markera rozpoznawczego projektu i **płaskiej listy
   dosłownych fraz** wyzwalających. Opis narracyjny nie wygrywa konkurencji z dwustoma innymi
   skillami — zmierzone: przed poprawką 1/4 trafień, po poprawce 2/2. (L-0009)
10. Skill nie może zakładać dostępu do plików spoza katalogu roboczego. Warstwa globalna
    `~/.claude/relai/` jest niewidoczna dla sesji uruchomionej w projekcie — przewiduj brak dostępu
    i mów o tym wprost zamiast milcząco pomijać dziedziczenie. (L-0010)
11. Odesłanie do pliku specyfikacji **nie wystarcza**: struktura, której naprawdę wymagasz, musi
    być wypisana w treści skilla. Zmierzone: prompt etapowy generowany z samego odsyłacza miał
    własny układ; po wypisaniu dziewięciu sekcji w skillu — układ zgodny. (L-0011)
12. Katalog pluginu (`templates/`) jest dla sesji **niedostępny** tak samo jak katalog domowy.
    Każdy mechanizm, który musi coś stamtąd przeczytać, wymaga zapasowej ścieżki w treści skilla —
    inaczej staje. (L-0012)
13. „Zapytam człowieka" nie zwalnia z posprzątania po sobie: pytanie o wybór jest w porządku,
    zostawienie po sobie martwego linku nie. Zawsze istnieje poprawna wartość tymczasowa. (L-0013)
14. Krok rytuału wykonuj w repozytorium **zanim** napiszesz zdanie, które go opisuje. Dziennik
    mówiący o zrobionej rzeczy, której nie zrobiono, jest gorszy niż brak wpisu. (L-0014)
15. Komenda wywołana wprost **nie ładuje** skilla, do którego się odwołuje. Potrzebną procedurę
    albo wpisujesz do komendy, albo każesz jej jawnie wczytać skill. (L-0015)
16. Komunikaty hooków są **celowo ASCII** — bez polskich diakrytyków na stdout/stderr hooka;
    diakrytyki w treści plików tak, w wyjściu procesów hooków nie. (L-0016)
17. Działanie hooka dowodzisz **efektem** (plik istnieje/nie istnieje, suma kontrolna, treść
    odpowiedzi modelu), nie zdarzeniem w transkrypcie — `stream-json` loguje tylko hooki
    SessionStart. Payloady testowe hooków buduj Nodem, nie echem w shellu. (L-0017)
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz, nie na przewidywanym formacie
    wyjścia cudzego narzędzia. (L-0018)
19. Lista zakazów to filtr końcowy, nie brief. Przy zadaniu wizualnym zbierz najpierw cechy
    **pozytywne** i pokaż **jeden** wariant do kalibracji smaku, zanim wyprodukujesz pięć. (L-0019)
20. Zainstalowaną wersję pluginu potwierdzasz `~/.claude/plugins/installed_plugins.json` (`version`
    **i** `gitCommitSha`) albo treścią skilla w cache'u — **nie** `claude plugin details`, który
    pokazuje wersję z marketplace. `plugin install` na zainstalowanym pluginie to no-op, a `plugin
    update` porównuje **numer wersji**: poprawka bez podbicia wersji nie dotrze inaczej niż przez
    `uninstall` + `install`. (L-0020)
21. Narzędzie systemowe rozstrzygające o **formacie** artefaktu wywołuj pełną ścieżką i sprawdzaj
    wynik (nagłówek pliku, lista wpisów), nie kod wyjścia — `tar` w Git Bash to GNU tar i po cichu
    zapisze archiwum tar pod nazwą `.zip`. (L-0021)
22. W dokumencie użytkownika podajesz **zmierzoną** formę wywołania. Komendy pluginu żyją
    w przestrzeni nazw: `/relai:relai-<nazwa>`; forma skrócona nie istnieje w trybie `-p`. (L-0022)
23. Krok sięgający poza katalog roboczy ma mieć w procedurze zapisane wyjście po odmowie dostępu
    (komunikat + `--add-dir`); nigdy „po cichu bliżej". (L-0023)
24. Sesja pomiarowa `claude -p` ma dwa warunki wykonalności, o których nie mówi żaden błąd: prompt
    z polskimi znakami przekazujesz **przez stdin** (argument obcina go w powłoce Windows), a zapis
    plików wymaga `--permission-mode acceptEdits`. Bez nich przebieg wygląda na udany i mierzy coś
    innego. (L-0024)
25. Wartość czytana z dokumentu **maszynowo** dopasowuje się do kotwicy (początek komórki), nie
    „gdziekolwiek w linii" — inaczej trafia w prozę. Wartość nierozpoznana znaczy **cisza**, nigdy
    zgadywanie. (L-0025)
26. Zdarzenie wyzwala dokument, ale nie dostarcza faktów. Specyfikacja dokumentu, którego wartość
    polega na wykonalności, ma zapisaną ścieżkę „pytam zamiast zmyślać" wraz z formą zapisu luki
    (`<DO UZUPEŁNIENIA: …>`). (L-0026)
27. Plików z polskimi znakami **nie** przepuszczasz przez PowerShell 5.1: `Get-Content -Raw` czyta
    UTF-8 jako ANSI i psuje treść, mimo `-Encoding utf8` przy zapisie. Dokumenty dopisujesz
    narzędziem Write/Edit albo Nodem. (L-0027)
28. Sesja pomiarowa używająca narzędzi systemowych (tar, git) potrzebuje `--allowedTools "Bash"`
    obok `--permission-mode acceptEdits` — inaczej mierzysz uprawnienia harnessu, nie zachowanie
    komendy. (L-0028)
29. Komponent opcjonalny musi dać się **pominąć bez śladu**: żadnych pustych wypełniaczy ani
    martwego kodu. Jeśli pominięcie wymaga pracy, element jest rusztowaniem, nie komponentem —
    przenieś go do repertuaru i pozwól narzędziu sprzątnąć po nim znacznik. (L-0029)
30. Zachowanie, które ma działać **zawsze**, mieszka w `CLAUDE.md` projektu — nie w skillu i nie
    w ściądze dla człowieka. Skill wyzwala się zawodnie (R2), a `KOMENDY.md` nikt nie czyta na
    starcie. Regułę niesie warstwa obecna w kontekście każdej sesji; skill dokłada procedurę.
    (L-0030)
31. `claude plugin update` **nie działa od razu**: do restartu aplikacji sesje ładują stary cache,
    choć `installed_plugins.json` pokazuje już nową wersję. Mechanizm kontrolny tego nie wykryje,
    bo sam jest starą wersją. Po wydaniu: restart aplikacji, potem pomiar. (L-0031)
32. Sesja pomiarowa `claude -p` uwierzytelnia się z `~/.claude/.credentials.json` — **niezależnie
    od konta zalogowanego w aplikacji**. Konto (`oauthAccount` w `~/.claude.json`) i limit
    sprawdzasz **przed** pomiarem; wyczerpany limit jest powodem zatrzymania i prośby o
    `claude /login`, nigdy powodem odtworzenia procedury ręcznie. Niedomknięty punkt weryfikacji
    idzie do odnogi z gotowym promptem, nie do adnotacji „sprawdzone inaczej". (L-0032)
33. Sumy kontrolne plików, które przeszły przez gita (klon, checkout, cache pluginu), porównuj
    **po normalizacji CRLF → LF** — inaczej dostajesz dowód fałszywie negatywny wyglądający jak
    defekt dystrybucji. (L-0033)
34. Próg liczbowy w mechanizmie automatycznym kalibrujesz na **zmierzonych** plikach realnych
    projektów, zanim go zapiszesz — próg powyżej maksimum, jakie te projekty osiągają, jest progiem
    martwym i wygląda jak działający. (L-0034)
35. Dopisek czytany maszynowo („*(rozstrzygnięte …)*") dostaje w specyfikacji **zbiór akceptowanych
    brzmień** — kanoniczne plus historyczne — zanim powstanie pierwszy mechanizm, który go czyta.
    Inaczej mechanizm uzna zamknięte pozycje za otwarte. (L-0035)
36. Sygnał, który ma paść **raz**, ma jednego właściciela: warstwę działającą bez wyzwalania (hook).
    Druga warstwa dostaje instrukcję milczenia i własny detektor tylko na wypadek nieobecności
    pierwszej. Cisza właściciela znaczy „sprawdzone i zgodne". (L-0036)
37. Scenariusz „konfiguracji nie ma" mierzysz z **podstawionym katalogiem domowym** (`HOME`,
    `USERPROFILE` w env procesu potomnego) — inaczej mierzysz swoją maszynę, nie przypadek
    brzegowy. (L-0037)
38. Przeniesienie katalogu, na który wskazuje manifest cudzego narzędzia, sprawdzasz **na kopii**
    walidatorem tego manifestu — dwa przebiegi, z dowodem negatywnym — zanim ruszysz
    oryginał. (L-0038)
39. Drzewo dowolnego commita materializujesz `git worktree add --detach`, nie
    `git archive | tar` — tar na Windows czyta literę dysku jako nazwę hosta. (L-0039)
40. „Zachowanie nie zmieniło się" dowodzisz, uruchamiając **obie wersje na tym samym wejściu
    w jednym przebiegu**; różnice zamierzone normalizujesz jawnie w kodzie instrumentu, nie
    w głowie. (L-0040)
41. Rozpoznanie cudzego narzędzia opieraj na **wydanym build'zie i próbie**, nie na samej
    dokumentacji producenta — dokumentacja bywa niepełna, a kod produktu i realna sesja mówią
    prawdę o dziś zainstalowanej wersji. Każdą pozycję oznaczaj źródłem. (L-0041)
42. Payload hooka cudzego narzędzia parsujesz **po zdjęciu BOM** i nie zakładasz, że niesie te same
    pola co znane Ci narzędzie — katalog roboczy może przyjść pod inną nazwą. (L-0042)
43. Guardrail wołany przez interpreter znika razem z interpreterem — i narzędzie potrafi tego
    **nie zgłosić**. Wołaj go przez opakowanie powłoki, które przy braku interpretera kończy się
    kodem blokującym; „cisza" musi się zamienić w „blokada z komunikatem". (L-0043)
44. Sesję pomiarową CLI cudzego narzędzia uruchamiaj z **powłoki natywnej dla systemu** — narzędzie
    dziedziczy powłokę i potrafi budować transport payloadu w jej składni. (L-0044)
45. Blokada guardraila na treści, która sekretem nie jest, to **defekt guardraila** — wraca do
    rdzenia jako poprawka z dowodem, nigdy jako obejście w kodzie użytkownika. Wzorzec wykrywający
    sekret w przypisaniu musi odróżniać wartość od adnotacji typu. (L-0045)
46. Próbki sekretów w testach i przykłady w komentarzach składaj z fragmentów **w czasie
    wykonania** albo zakładaj pliki powłoką — guardrail blokuje także własny materiał
    dowodowy. (L-0046)
47. Zanim uznasz brak sygnału mechanizmu za defekt, przeczytaj jego **warunek milczenia** i powtórz
    pomiar po jego spełnieniu; sondę formułuj tak, by odpowiedź dało się przypisać wyłącznie do
    naszego wstrzyknięcia. (L-0047)

## Zakres i weryfikacja

Przepisane z karty odnogi (`ODNOGA.md`) — karta jest źródłem, rozbieżność jest błędem:

1. `core/process/session-signals.js` — rozpoznanie także od katalogu pliku w górę.
2. `secret-scanner.js` i `config-protection.js` (Claude Code) oraz `secret-scanner.js` (Cursor) —
   rozpoznanie liczone od ścieżki z `tool_input`.
3. `isGitIgnored()` wołane z katalogu projektu, do którego należy plik.
4. Osiem pozostałych hooków z własną kopią `isGuest` — przepięte albo świadomie zostawione
   z powodem w `core/README.md`.

- [ ] Sesja z katalogiem roboczym **poza** projektem RelAI, zapisująca sekret do pliku śledzonego
      w projekcie RelAI, dostaje blokadę (dowód: plik nie powstał).
- [ ] Ta sama sesja przy zapisie czystej treści nie dostaje żadnego komunikatu (dowód, że test nie
      jest pusty).
- [ ] Projekt z markerem trybu gościa nadal nie jest pilnowany — z obu kierunków rozpoznania.
- [ ] `git check-ignore` liczony względem projektu pliku: sekret w `.env` projektu docelowego
      przechodzi, ten sam sekret w pliku śledzonym nie.
- [ ] Instrument porównawczy dwóch adapterów w jednym przebiegu (L-0040): komplet zgodnych
      werdyktów dla materiału z katalogu sesji, przed zmianą i po niej.
- [ ] `node core/tools/validate-adapters.js` → kod 0.

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona.
2. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: linia tej odnogi w sekcji „Odnogi" →
   `ZAMKNIĘTA <data>`. Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
3. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md`, na końcu sekcji „Wpisy", z podpisem
   `Autor: RelAI (<model>) + <git config user.name>`.
4. `docs/STATE.md` — nadpisz sekcję „Co działa": zmiana dotyczy obietnicy, którą RelAI składa
   o guardrailach.
5. Podbicie wersji (poprawka rdzenia → **1.5.x**) w czterech źródłach i w markerze projektu
   (L-0008), potem commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
