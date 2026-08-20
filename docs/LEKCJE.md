# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

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
48. Gdy szukana fraza może paść w dokumencie więcej niż raz, wybieraj linię po **niesionej
    wartości** (link, liczba), nie po kolejności wystąpienia — „pierwsze trafienie" trafia
    w prozę i wycisza mechanizm bez śladu. (L-0048)
49. Mechanizm z progiem ma **jeden** wyzwalacz — ten z decyzji. Wielkości pomocnicze wskazują
    przyczynę wewnątrz komunikatu, nie wywołują go; inaczej cisza przestaje cokolwiek
    znaczyć. (L-0049)

## Lekcje
> Lekcje L-0001 … L-0024 (24 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md](archiwum/lekcje/LEKCJE_L-0001_L-0024.md)
> — przeniesione 2026-08-12, suma kontrolna `bd5f9050dc7e7278`.

### L-0025 — Dopasowanie „gdziekolwiek w linii" trafia w prozę · 2026-08-08 · AKTYWNA

- **Trigger:** pierwsza wersja `profile-rules` czytała profil wyrażeniem
  `\b(agent-voice|flow|prompty|app)\b` z **całej linii** wiersza „Profil projektu". W tym repo ten
  wiersz brzmi „Narzędzie/plugin (odpowiednik profilu »prompty/artefakty« — kod TS/JS…)" — hook
  zobaczyłby profil `prompty` i zaczął dopominać się rejestru artefaktów przy każdej specyfikacji
  i każdym pliku komendy.
- **Przyczyna:** dokument jest pisany dla człowieka, więc nazwa wartości pada w nim także w zdaniu
  wyjaśniającym. Wyrażenie bez kotwicy nie odróżnia wyboru od wzmianki.
- **Zasada:** wartość czytana maszynowo dopasowuje się do **kotwicy** — początku komórki, którą
  specyfikacja wskazuje jako nośnik wartości; specyfikacja mówi to wprost, żeby autor dokumentu
  wiedział, gdzie ma pisać. Wartość nierozpoznana daje **ciszę**, nie wartość domyślną: mechanizm,
  który blokuje, myli się drożej niż milczy.
- **Źródło:** przegląd własny w trakcie etapu E8 (2026-08-08), przed pierwszym pomiarem. Wyłapane
  przez dogfooding — regułę pisaną dla cudzych projektów sprawdziłem na własnym.

### L-0026 — Zdarzenie wyzwala dokument, ale nie dostarcza faktów · 2026-08-08 · AKTYWNA

- **Trigger:** sesja z pierwszym wdrożeniem (profil `app`) rozpoznała regułę, napisała wprost
  „profil `app` wymaga `docs/srodowiska/TEST.md` przy pierwszym wdrożeniu" — i dokumentu **nie
  utworzyła**, bo nie wiedziała, czym wdrożono, z jakiego kodu i do czego się cofa. Poprosiła
  o trzy fakty. Dokument powstał w kolejnej sesji, po odpowiedzi.
- **Przyczyna:** specyfikacja stawiała twardy wymóg („procedura cofnięcia obowiązkowa, zdanie
  »przywróć poprzednią wersję« nie jest procedurą") i nie mówiła, co zrobić, gdy faktów brak.
  Zostały dwa wyjścia, oba złe: zmyślić procedurę, której ktoś użyje pod presją, albo pominąć
  dokument po cichu. Sesja wybrała trzecie, słusznie — ale z własnego rozsądku, nie z instrukcji.
- **Zasada:** specyfikacja dokumentu, którego wartość polega na **wykonalności**, ma zapisaną
  ścieżkę „pytam zamiast zmyślać": jedno pytanie o brakujące fakty i jawny znacznik luki
  (`<DO UZUPEŁNIENIA: …>`) w miejscach, których nie da się ustalić. Pusty nagłówek udaje wiedzę,
  znacznik mówi, czego brakuje. To jest L-0013 („zawsze istnieje poprawna wartość tymczasowa")
  zastosowane do dokumentu zamiast do linku.
- **Źródło:** pomiary etapu E8 (2026-08-08); po dopisaniu ścieżki do `SPEC_SRODOWISKA.md`
  zachowanie przestało zależeć od rozsądku sesji.

### L-0027 — PowerShell 5.1 zjada polskie znaki po drodze · 2026-08-08 · AKTYWNA

- **Trigger:** wpis E8 do `docs/DZIENNIK.md` dopisany sekwencją `Get-Content -Raw` +
  `Add-Content -Encoding utf8`. Nagłówek wylądował w pliku jako „### 2026-08-08 Ă˘â‚¬â€ť E8: profile
  projektÄ‚Ĺ‚w…" — cała treść przekłamana, mimo poprawnego kodowania **zapisu**.
- **Przyczyna:** przekłamanie nastąpiło przy **odczycie**: `Get-Content` w PowerShell 5.1 bez
  jawnego `-Encoding UTF8` interpretuje plik jako ANSI (strona kodowa systemu). Zapis był
  poprawny — zapisywał już zepsute znaki. Heredoc w Bashu odpadł wcześniej na parserze, więc
  PowerShell wyglądał na naturalne obejście.
- **Zasada:** dokumentów projektu z polskimi znakami nie przepuszczasz przez PowerShell 5.1.
  Dopisujesz narzędziem Write/Edit albo Nodem (`fs.readFileSync(p, utf8)`). To ta sama rodzina co
  L-0016 i L-0017: każda warstwa konsoli Windows jest podejrzana, dopóki nie sprawdzisz efektu na
  dysku — sprawdzeniem jest odczyt pliku po zapisie, nie kod wyjścia polecenia.
- **Źródło:** rytuał zamknięcia etapu E8 (2026-08-08); wpis odtworzony Nodem po obcięciu pliku.

### L-0028 — acceptEdits nie obejmuje poleceń Bash · 2026-08-09 · AKTYWNA

- **Trigger:** sesja pomiarowa `/relai-adopt` w trybie `-p` z `--permission-mode acceptEdits`
  zatrzymała się na bramce backupu nie dlatego, że bramka zadziałała merytorycznie, tylko dlatego,
  że sesja nie miała zgody na uruchomienie `tar.exe` — żaden błąd tego nie zapowiedział.
- **Przyczyna:** `acceptEdits` auto-akceptuje wyłącznie edycje plików. Każde polecenie systemowe
  (Bash/PowerShell) wymaga osobnej zgody, której w trybie `-p` nie ma kto wyrazić — sesja
  raportuje wtedy brak dostępu do narzędzia, a pomiar wygląda na test bramki, choć mierzy
  uprawnienia harnessu.
- **Zasada:** sesja pomiarowa, której scenariusz wymaga narzędzia systemowego (pakowanie,
  git, node), dostaje jawnie `--allowedTools "Bash"` obok `--permission-mode acceptEdits`.
  Przed interpretacją wyniku sprawdź, czy zatrzymanie wynikło z logiki komendy, czy z braku
  uprawnień — to rozszerzenie L-0024 o trzeci warunek wykonalności.
- **Źródło:** pomiary etapu E9 (2026-08-09); po dodaniu flagi ta sama sesja przeszła całą
  sekwencję adopcji.

### L-0029 — Szablon, którego elementu nie da się nie użyć · 2026-08-09 · AKTYWNA

- **Trigger:** pilotaż E10 — pierwszy plan użytkownika w projekcie „Paragony". Uwaga po obejrzeniu
  wyniku: „nie w każdym planie będzie potrzeba pokazywania sekcji z suwaczkami; szablon ma
  definiować pełen zakres, z czego plan może korzystać, a każdy plan powinien być indywidualnie
  sklejany na swoje potrzeby".
- **Przyczyna:** karta symulatora leżała w `komponenty.html` (czyli była opcjonalna), ale jego
  **skrypt** siedział na stałe w szkielecie `szablon.html`. Specyfikacja rozwiązywała to najgorszym
  z możliwych sposobów: „gdy planu nie dotyczą wyliczenia, i tak wypełnij znaczniki wartościami
  pustymi". Element, którego nie da się pominąć, przestaje być komponentem i staje się rusztowaniem
  — a rusztowanie zachęca, żeby je czymś wypełnić.
- **Zasada:** komponent opcjonalny musi dać się **pominąć bez śladu** — bez pustych wypełniaczy,
  bez martwego kodu, bez „wypełnij zerami". Jeśli pominięcie wymaga pracy, komponent jest w złym
  miejscu: przenieś go do repertuaru, a w szkielecie zostaw znacznik, który narzędzie sprząta samo.
  Sprawdzian: czy da się wygenerować poprawny artefakt **nie dotykając** tego elementu.
- **Źródło:** korekta użytkownika w pilotażu E10 (2026-08-09). Po poprawce: plan bez wyliczeń waży
  182 KB i nie zawiera ani jednej linii kodu symulatora (`grep` po `KLUCZE_DEKLAROWANE`, `rysuj`,
  `odswiez` → 0 trafień), plan z wyliczeniami — 193 KB, dziewięć suwaków, symulator liczy.

### L-0030 — Fraza rytualna bez warstwy nośnej · 2026-08-09 · AKTYWNA

- **Trigger:** pomiar R2 w pilotażu E10 — prompt „Kontynuujemy pracę." w projekcie RelAI. Sesja
  **nie wywołała** żadnego skilla (`Skill`: 0 wywołań), przeczytała cztery dokumenty i napisała
  akapit „gdzie jesteśmy" — po czym zakończyła pytaniem „Co dalej?" zamiast trzecim krokiem frazy:
  jednym zdaniem z propozycją najbliższego kroku.
- **Przyczyna:** akapit „gdzie jesteśmy" przyszedł z hooka `session-context`, który niesie rytuał
  startu. Trzech fraz naturalnych (D-05) hook nie zna, `CLAUDE.md` projektu ich nie wymieniał,
  a `docs/KOMENDY.md` jest ściągą dla człowieka i nikt nie czyta go na starcie. Cała fraza wisiała
  więc na skillu — czyli na jedynej warstwie, o której od E3 wiemy, że bywa pomijana.
- **Zasada:** zachowanie, które ma działać **zawsze**, musi mieć warstwę działającą zawsze. W RelAI
  jest nią `CLAUDE.md` projektu (kontekst każdej sesji) albo hook; skill jest warstwą procedury,
  nie warstwą nośną. Przed opisaniem czegokolwiek wyłącznie w skillu zadaj pytanie: „co się stanie,
  gdy skill się nie wyzwoli?". Jeśli odpowiedź brzmi „nie zadziała" — reguła jest w złym miejscu.
  To jest wniosek z E8 (reguły profilu) zastosowany do fraz rytualnych.
- **Źródło:** pomiar R2 w pilotażu E10 (2026-08-09). Po poprawce `CLAUDE.md` niesie jedną linię
  z trzema frazami, z wyróżnionym trzecim członem pierwszej z nich.

### L-0031 — Aktualizacja pluginu działa dopiero po restarcie aplikacji · 2026-08-10 · AKTYWNA

- **Trigger:** zaraz po wydaniu 1.0.0 sesja wykonała `/relai:relai-update` w zaadoptowanym
  JiraManagerze i orzekła: „wersja projektu 0.9.0, wersja docelowa 0.9.0, brak zmian" — mimo że
  `claude plugin update` zameldował „updated from 0.9.0 to 1.0.0", a `installed_plugins.json`
  pokazywał `1.0.0` z aktualnym `gitCommitSha`.
- **Przyczyna:** `plugin update` podmienia wpis instalacji i pobiera nowy katalog cache, ale
  **działająca aplikacja nadal ładuje stary** — komunikat „Restart to apply changes" jest
  dosłowny. W transkrypcie tamtej sesji jedyna ścieżka pluginu to `cache\…\relai\0.9.0`. Gorzej:
  mechanizm, który miał to wyłapać (porównanie wersji projektu z wersją pluginu w kroku 1
  `/relai-update`), **sam pochodził ze starej wersji** — hook 0.9.0 porównał 0.9.0 z 0.9.0,
  zobaczył zgodność i zamilkł. Kontrola wbudowana w wersję X nie wykryje, że działa wersja X
  zamiast Y.
- **Zasada:** po `claude plugin update` **zrestartuj aplikację**, zanim cokolwiek zmierzysz albo
  uruchomisz na nowej wersji. Weryfikacja, którą wersję naprawdę wykonuje sesja: ścieżka cache
  w transkrypcie albo treść pliku, który się zmienił — nie `installed_plugins.json` i nie
  komunikat CLI. To jest L-0020 rozszerzone o warstwę czwartą: `plugin details` kłamie o wersji
  z marketplace, `plugin install` na zainstalowanym jest no-opem, `plugin update` porównuje numer
  wersji, a **cache w pamięci aplikacji przeżywa je wszystkie do restartu**.
- **Źródło:** domknięcie pilotażu E10 (2026-08-10), po wydaniu 1.0.0.

### L-0032 — Sesja pomiarowa `claude -p` ma własne konto, niezależne od aplikacji · 2026-08-12 · AKTYWNA

- **Trigger:** w etapie E1 pomiar czterech scenariuszy odnóg padł na „You've hit your session limit
  · resets 4:10pm". Użytkownik zgłosił, że właśnie przełączył konto i limit ma dostępny — a mimo to
  kolejna próba dała ten sam komunikat.
- **Przyczyna:** podproces `claude -p` **nie dziedziczy sesji aplikacji**. Uwierzytelnia się
  z `~/.claude/.credentials.json`; `oauthAccount.emailAddress` w `~/.claude.json` wskazywał konto
  z wyczerpanym limitem, a plik poświadczeń pochodził z 08:37 tego dnia. Przełączenie konta
  w aplikacji nie dotyka żadnego z tych plików, więc każda sesja pomiarowa startowała na starym
  koncie.
- **Zasada:** zanim uznasz pomiar za niewykonalny **albo** za wykonalny, sprawdź konto CLI:
  odczytaj `oauthAccount.emailAddress` z `~/.claude.json` i wyślij jeden krótki prompt na próbę.
  Wyczerpany limit jest powodem **zatrzymania i poproszenia o `claude /login`**, nigdy powodem
  zastąpienia pomiaru odtworzeniem procedury ręcznie (L-0004). Niedomknięty punkt weryfikacji ma
  własne miejsce: odnogę z gotowym promptem, nie adnotację „sprawdzone inaczej".
- **Źródło:** E1 planu ROZWOJ_PO_WYDANIU (2026-08-12); skutek — odnoga `POMIAR_ODNOG`.

### L-0033 — Sumy kontrolne porównuj po normalizacji końców linii · 2026-08-12 · AKTYWNA

- **Trigger:** sprawdzenie, czy `SPEC_ODNOGA.md` rozprowadzona przez hook do
  `.claude/relai/templates/` jest tożsama z plikiem w repo, dało dwie różne sumy (`b800d247…` vs
  `2bee4884…`) mimo identycznej treści.
- **Przyczyna:** katalog roboczy trzyma pliki z LF, a cache pluginu jest **świeżym klonem gita**,
  który na Windowsie wypisuje CRLF (`git commit` ostrzega o tym przy każdym pliku). Różnica jest
  w bajtach, nie w treści.
- **Zasada:** dowód tożsamości pliku, który przeszedł przez gita (klon, checkout, kopia z cache),
  liczysz **po normalizacji CRLF → LF**. Suma na surowych bajtach jest wtedy dowodem fałszywie
  negatywnym — i wygląda jak defekt dystrybucji, którym nie jest. Dla plików, które przez gita nie
  przechodzą (archiwum rotacji, kopie w tym samym drzewie), zostaje suma na bajtach.
- **Źródło:** E1 planu ROZWOJ_PO_WYDANIU (2026-08-12).

### L-0034 — Próg zapisany bez pomiaru bywa progiem martwym · 2026-08-12 · AKTYWNA

- **Trigger:** próg rotacji rejestru lekcji miał brzmieć „ponad 60 lekcji". Pomiar trzech realnych
  projektów pokazał maksimum **33** lekcje (RelAI) przy pliku 42 KB, a PolyFlow przy **29** lekcjach
  ma już 49 KB. Próg 60 lekcji nie zadziałałby nigdy, a plik dawno przekroczyłby rozmiar, dla
  którego rotacja powstała.
- **Przyczyna:** próg wzięty z wyobrażenia o skali („kilkadziesiąt lekcji to dużo") zamiast
  z rozkładu wartości w projektach, które naprawdę istnieją. Jednostka też była źle dobrana:
  o koszt kontekstu decyduje rozmiar pliku, nie liczba pozycji.
- **Zasada:** zanim zapiszesz próg liczbowy w mechanizmie automatycznym, zmierz tę wielkość
  w realnych projektach i sprawdź, czy próg w ogóle bywa osiągany. Próg powyżej obserwowanego
  maksimum jest martwy i — co gorsza — wygląda w dokumentacji jak zabezpieczenie, którego nie ma.
  Gdy jednostka jest wątpliwa, użyj dwóch („40 wpisów albo 50 KB, co nastąpi wcześniej").
- **Źródło:** przegląd zamykający etap E2 planu ROZWOJ_PO_WYDANIU (2026-08-12).

### L-0035 — Dopisek czytany maszynowo z jednym dozwolonym brzmieniem · 2026-08-12 · AKTYWNA

- **Trigger:** instrument wyławiający otwarte pozycje „Do zrobienia przez człowieka" zgłosił **48**
  pozycji w dzienniku tego repo. Po obejrzeniu okazało się, że kilkanaście z nich jest zamkniętych
  od dni — tylko podpisanych „*(zrobione …)*" zamiast „*(rozstrzygnięte …)*", bo tak je pisano,
  zanim mechanizm powstał.
- **Przyczyna:** specyfikacja podała **jedno** brzmienie dopiska i nikt go nie egzekwował, więc
  historia ma kilka wariantów tego samego. Mechanizm zbudowany później na jednym z nich uznaje
  resztę za pozycje otwarte — i albo blokuje bez powodu (zamknięcie planu), albo nie rusza wpisów,
  które wolno było zarchiwizować.
- **Zasada:** dopisek czytany maszynowo dostaje w specyfikacji **zbiór akceptowanych brzmień**
  (kanoniczne plus historyczne), zanim powstanie pierwszy mechanizm, który go czyta. Nowe wpisy
  piszesz brzmieniem kanonicznym; stare mają dalej działać bez przepisywania historii (D-18).
- **Źródło:** E3 planu ROZWOJ_PO_WYDANIU (2026-08-12), budowa sekcji „Bramki manualne".

### L-0036 — Sygnał bez właściciela pada dwa razy · 2026-08-12 · AKTYWNA

- **Trigger:** zakres E3 mówił, że rozjazd stanu wykrywa skill, a hook „podaje surowe fakty do
  porównania". Przy takim podziale obie warstwy mają komplet danych i obie mają powód, żeby coś
  powiedzieć — a punkt weryfikacji wymagał **dokładnie jednego** sygnału.
- **Przyczyna:** dwie warstwy z tym samym wejściem to dwa detektory, nie jeden detektor z dostawcą
  danych. Wzorzec L-0030 mówi, gdzie reguła ma mieszkać, ale nie rozstrzyga, kto ją **wypowiada**.
- **Zasada:** sygnał, który ma paść raz, dostaje **jednego właściciela** — tutaj hook, bo działa bez
  wyzwalania i liczy deterministycznie. Druga warstwa dostaje w treści instrukcję milczenia („hook
  zgłosił → nie powtarzaj") i własny detektor **wyłącznie** na wypadek nieobecności hooka. Cisza
  właściciela znaczy „sprawdzone i zgodne", nie „nie sprawdzono".
- **Źródło:** E3 planu ROZWOJ_PO_WYDANIU (2026-08-12).

### L-0037 — Pomiar zachowania „brak konfiguracji" na maszynie, która ją ma · 2026-08-12 · AKTYWNA

- **Trigger:** test „git nieskonfigurowany → podpis bez członu użytkownika jest poprawny" oblał.
  Hook zachował się prawidłowo: projekt testowy nie miał `.git/config`, ale proces odczytał
  `~/.gitconfig` maszyny i zobaczył `user.name = Lukasz`.
- **Przyczyna:** mechanizm celowo sięga do warstwy globalnej, a projekt testowy nie izolował
  środowiska — mierzyłem maszynę, nie przypadek brzegowy.
- **Zasada:** scenariusz „konfiguracji nie ma" wykonujesz z **podstawionym katalogiem domowym**
  (`HOME` i `USERPROFILE` w środowisku procesu potomnego). Bez podstawienia oblany test jest
  fałszywie negatywny, a zielony — fałszywie pozytywny na maszynie bez tej konfiguracji.
- **Źródło:** E3 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `podpis.js`.

### L-0038 — Przeniesienie katalogu, na który wskazuje cudzy manifest, sprawdzasz na kopii · 2026-08-12 · AKTYWNA

- **Trigger:** przed przeniesieniem `skills/`, `commands/` i `hooks/` do `adapters/claude-code/`
  nie było wiadomo, czy `plugin.json` w ogóle dopuszcza inny układ niż domyślny — a błąd oznaczałby
  martwy plugin na maszynie użytkownika, wykrywalny dopiero po restarcie aplikacji (L-0031).
- **Przyczyna:** manifest narzędzia jest kontraktem cudzego runtime'u. Wiedza „chyba wspiera
  ścieżki" nie jest dowodem, a jedyny naturalny moment na sprawdzenie mija w chwili, gdy oryginał
  jest już ruszony.
- **Zasada:** zbuduj kopię docelowego układu poza repozytorium i puść na niej walidator manifestu.
  Potrzebne są **dwa** przebiegi: układ poprawny → „Validation passed", układ z celowo zepsutą
  ścieżką → błąd (dowód negatywny, L-0007). Dopiero potem ruszasz oryginał.
- **Źródło:** E4 planu ROZWOJ_PO_WYDANIU (2026-08-12), `claude plugin validate` na kopii
  w katalogu tymczasowym; komunikat walidatora („The runtime loader will report this as a load
  failure") był jednocześnie dowodem, że runtime czyta te ścieżki.

### L-0039 — Kopię drzewa z gita na Windows robisz `git worktree`, nie `git archive | tar` · 2026-08-12 · AKTYWNA

- **Trigger:** instrument porównujący zachowanie hooków przed i po przeniesieniu wysypał się na
  `tar: Cannot connect to C: resolve failed`.
- **Przyczyna:** GNU tar czyta ścieżkę `C:\...` jako `host:ścieżka`, czyli adres archiwum zdalnego.
  Litera dysku wygląda dla niego jak nazwa hosta.
- **Zasada:** drzewo dowolnego commita materializujesz `git worktree add --detach <katalog> <ref>`
  i usuwasz `git worktree remove --force`. Działa niezależnie od systemu, nie wymaga pośredniego
  archiwum i zostawia po sobie czysty stan. Rurociąg `git archive | tar` zostaw dla Uniksa.
- **Źródło:** E4 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `porownanie.js`.

### L-0040 — „Nic się nie zmieniło" dowodzisz dwoma drzewami naraz, nie pamięcią · 2026-08-12 · AKTYWNA

- **Trigger:** po przeniesieniu dziesięciu hooków do nowego katalogu trzeba było wykazać, że każdy
  zachowuje się identycznie. Oglądanie wyjścia oczami nie skaluje się do osiemnastu scenariuszy
  i nie wyłapuje różnicy w jednym znaku.
- **Przyczyna:** porównanie „z pamięci, jak było wcześniej" jest porównaniem z wyobrażeniem.
  Jedyny wiarygodny punkt odniesienia to poprzednia wersja **uruchomiona teraz**, na tym samym
  wejściu.
- **Zasada:** ten sam payload podajesz obu drzewom w jednym przebiegu instrumentu i porównujesz
  kod wyjścia razem z wyjściem. **Różnice zamierzone normalizujesz jawnie w kodzie instrumentu**
  (numer wersji, ścieżka drzewa, świadoma zmiana znaku w komunikacie) — z komentarzem, co i
  dlaczego. Normalizacja opisana w kodzie zostaje dowodem; normalizacja zrobiona w głowie znika.
- **Źródło:** E4 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `porownanie.js` — 18/18
  scenariuszy zgodnych, jedyna różnica (wielokropek `…` → `...` przy przenoszeniu etykiet do
  rdzenia, L-0016) wyszła na jaw właśnie dlatego, że porównanie było mechaniczne.

### L-0041 — Cudze narzędzie rozpoznajesz z jego build'u i z próby, nie z dokumentacji · 2026-08-12 · AKTYWNA

- **Trigger:** `PRZENOSNOSC.md` po E4 miał pięć pozycji `<DO UZUPEŁNIENIA: …>`, bo dokumentacja
  Cursora nie opisywała ścieżek komend, a dwie strony zwracały 404. Adapter miał stanąć na tych
  właśnie mechanizmach.
- **Przyczyna:** dokumentacja producenta opisuje to, co producent zdążył opisać; zainstalowany
  build opisuje to, co realnie robi wydana wersja. Różnica między nimi jest dokładnie tym, na czym
  wykłada się adapter pisany „na wiarę".
- **Zasada:** zanim napiszesz adapter, przeczytaj **kod wydanego build'u** (walidatory, schematy,
  ścieżki) i **zmierz zachowanie próbą** na działającej instalacji. Każdą pozycję rozpoznania
  oznacz źródłem: `[dokumentacja]`, `[kod produktu]`, `[próba]`. Pozycja bez źródła jest domysłem
  i wraca do listy niepewnych (L-0026).
- **Źródło:** E5 planu ROZWOJ_PO_WYDANIU (2026-08-12). Z build'u Cursora 3.7.12 wyszły: ścieżki
  komend i skilli, pełna lista 21 zdarzeń hooków, walidatory odpowiedzi `preToolUse` i
  `sessionStart` oraz warstwa zgodności z Claude Code — żadnej z tych rzeczy nie było w otwartych
  stronach dokumentacji.

### L-0042 — Payload cudzego hooka: zdejmij BOM i nie zakładaj znanych pól · 2026-08-12 · AKTYWNA

- **Trigger:** pierwsza próba adaptera Cursora nie logowała niczego. Payload przychodził
  z bajtem BOM (w pomiarze **podwójnym**), więc `JSON.parse` wywracał się na pierwszym znaku,
  a hook — zgodnie z konwencją hook-guard — milkł.
- **Przyczyna:** transport payloadu jest własnością narzędzia. Cursor na Windows dokleja BOM,
  a w payloadzie `preToolUse` **nie ma pola `cwd`** — katalog roboczy przychodzi jako
  `workspace_roots[]`. Hook przepisany z adaptera Claude Code jeden do jednego działa „na sucho":
  nie wysypuje się, tylko po cichu nic nie robi.
- **Zasada:** stdin hooka parsuj po `stripBom`, a katalog roboczy ustalaj z listy kandydatów
  (`cwd`, potem `workspace_roots[0]`, potem `process.cwd()`). Zanim uznasz hook za działający,
  **przechwyć realny payload** i przeczytaj jego pola — nie zakładaj ich z drugiego narzędzia.
- **Źródło:** E5 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `hook-log.js` i cztery
  przechwycone payloady (`sessionStart`, dwa `preToolUse`, `afterFileEdit`).

### L-0043 — Guardrail przez interpreter znika po cichu; opakowanie zamienia ciszę w blokadę · 2026-08-12 · AKTYWNA

- **Trigger:** pomiar scenariusza „zespół bez Node.js". Hook wskazany jako `node <plik>` przy braku
  interpretera nie uruchomił się, Cursor **nie powiedział o tym ani słowa**, a zapis pliku
  przeszedł. Guardrail zniknął bez śladu — użytkownik miał prawo myśleć, że nadal stoi.
- **Przyczyna:** narzędzie rozróżnia dwie awarie hooka: „uruchomił się i zwrócił śmieci" (blokuje,
  fail-closed) oraz „nie dało się uruchomić" (ignoruje). Druga jest cichą degradacją i nie da się
  jej zagłuszyć z wnętrza skryptu, którego nikt nie odpalił.
- **Zasada:** guardrail wołaj przez **opakowanie powłoki** (`.cmd` / `.sh`) — ono uruchomi się
  zawsze, bo powłokę system ma. Brak interpretera → komunikat i kod blokujący. Rezygnacja
  z guardraila musi być **jawną decyzją człowieka** (flaga instalatora), nie skutkiem ubocznym
  środowiska.
- **Źródło:** E5 planu ROZWOJ_PO_WYDANIU (2026-08-12): pomiar przed poprawką (zapis przeszedł
  w ciszy) i po poprawce (kod 2 z komunikatem; w żywej sesji Cursora czysty zapis przeszedł,
  zapis klucza został zablokowany).

### L-0044 — Sesję pomiarową cudzego CLI uruchamiaj z powłoki natywnej dla systemu · 2026-08-12 · AKTYWNA

- **Trigger:** ta sama sesja `cursor-agent -p` uruchomiona z gitowego basha kończyła się
  komunikatem o zepsutych hookach i blokadą narzędzi zapisu; uruchomiona z PowerShella wykonała
  zadanie i odpaliła wszystkie hooki.
- **Przyczyna:** narzędzie dziedziczy powłokę procesu wywołującego, a payload podaje hookowi
  transportem zbudowanym w składni tej powłoki (na Windows: here-string PowerShella). W obcej
  powłoce transport jest błędem składni — i wygląda jak błąd naszego hooka.
- **Zasada:** pomiar cudzego CLI prowadź z powłoki natywnej dla systemu (Windows: PowerShell).
  Zanim uznasz własny skrypt za winnego, sprawdź, czy w ogóle został uruchomiony — najtaniej
  logiem po stronie skryptu.
- **Źródło:** E5 planu ROZWOJ_PO_WYDANIU (2026-08-12), cztery przebiegi próbne (dwa z basha, dwa
  z PowerShella).

### L-0045 — Gdy guardrail blokuje poprawny kod, podejrzanym jest guardrail, nie kod · 2026-08-17 · AKTYWNA

- **Trigger:** w pilotażu E6 skaner sekretów zablokował zapis modułu haszującego hasło w projekcie
  testowym. Agent nie zgłosił defektu — przemianował parametr funkcji, zapisał w rejestrze lekcji
  projektu zasadę „nie nazywaj parametru tak jak wcześniej" i pojechał dalej. Błąd narzędzia stał
  się regułą nazewniczą kodu.
- **Przyczyna:** wzorzec przypisania dopuszczał w wartości nawias i dwukropek, więc adnotacja typu
  z domykającym nawiasem miała wymaganą długość i wyglądała jak sekret. Zablokowany był normalny
  kod uwierzytelniania w TypeScripcie — czyli dokładnie ten, przy którym guardrail ma pilnować
  najmocniej.
- **Zasada:** blokada na treści, która sekretem nie jest, jest defektem guardraila i wraca do
  rdzenia jako poprawka z dowodem — nigdy jako obejście po stronie kodu użytkownika. Wzorzec
  wykrywający sekret w przypisaniu musi odróżniać **wartość** od **adnotacji typu**.
- **Źródło:** E6 planu ROZWOJ_PO_WYDANIU (2026-08-17). Poprawka: `core/guardrails/secret-scan.js`
  (`TYPE_TOKEN_RE`); dowód: cztery fałszywe alarmy zgaszone, cztery realne sekrety nadal wykryte,
  5/5 zgodnych werdyktów obu adapterów w jednym przebiegu.

### L-0046 — Materiał testowy guardraila składasz w czasie wykonania · 2026-08-17 · AKTYWNA

- **Trigger:** zapis instrumentu porównawczego z próbką klucza AWS został zablokowany przez ten sam
  hook, który instrument testuje. Wcześniej ta sama blokada odbiła **komentarz do łatki**
  naprawiającej skaner: przykład sygnatury w komentarzu wyglądał jak sekret.
- **Przyczyna:** guardrail nie odróżnia treści testowej od produkcyjnej i nie ma po co odróżniać —
  to jest jego zaleta. Kosztem jest to, że narzędzie blokuje własny materiał dowodowy.
- **Zasada:** próbki sekretów w testach i przykłady w komentarzach składaj z fragmentów w czasie
  wykonania albo zakładaj pliki powłoką; nigdy nie licz na to, że guardrail zrobi wyjątek dla
  „swojego" pliku. To dotyczy także dokumentacji poprawki.
- **Źródło:** E6 planu ROZWOJ_PO_WYDANIU (2026-08-17), trzy kolejne blokady tej samej sesji.

### L-0047 — Cisza hooka bywa jego regułą, nie awarią · 2026-08-17 · AKTYWNA

- **Trigger:** sonda „czy dostałeś kontekst startu sesji" w świeżo zainstalowanym projekcie nie
  pokazała niczego z naszego hooka; model podał datę z własnego bloku narzędzia. Wyglądało to na
  defekt adaptera w aplikacji.
- **Przyczyna:** hook kontekstu kończy się po cichu, gdy w katalogu nie ma markera RelAI — a folder
  w chwili sondy dopiero czekał na inicjalizację. Pomiar był postawiony przed warunkiem działania.
- **Zasada:** zanim uznasz brak sygnału za defekt, przeczytaj **warunek milczenia** mechanizmu
  i powtórz pomiar po jego spełnieniu. Sondę formułuj tak, żeby odpowiedź dało się przypisać
  wyłącznie do naszego wstrzyknięcia (dosłowny cytat markera), a nie do wiedzy narzędzia.
- **Źródło:** E6 planu ROZWOJ_PO_WYDANIU (2026-08-17); po inicjalizacji ten sam model zacytował
  wstrzyknięty blok w całości, razem z ustawieniami globalnymi.

### L-0048 — Fraza pada w dokumencie kilka razy; „pierwsze trafienie" trafia w prozę · 2026-08-20 · AKTYWNA

- **Trigger:** nowa miara warstwy startowej nie widziała `STATUS.md` aktywnego planu. Przyczyna
  leżała poza nią: `liniaAktywnegoPlanu` brała **pierwszą** linię z frazą „Aktywny plan", a w
  `CLAUDE.md` tego projektu fraza pada najpierw w prozie rytuału startu — bez linku.
- **Przyczyna:** funkcja szukała frazy, a potrzebowała **wartości** (linku do `STATUS.md`). Dopóki
  obie rzeczy stały w tej samej linii, różnica była niewidoczna.
- **Skutek:** siatka D-34 i detektor rozjazdu stanu milczały w tym repozytorium **od 1.3.0** — nie
  dlatego, że było zgodnie, tylko dlatego, że nie miały czego porównać. Cisza wyglądała identycznie
  jak zgodność.
- **Zasada:** gdy szukana fraza może paść w dokumencie więcej niż raz, wybieraj linię po **niesionej
  wartości** (link, liczba, wzorzec), nie po kolejności wystąpienia. Pierwsze trafienie jest
  poprawne wyłącznie wtedy, gdy dokument gwarantuje jedno.
- **Źródło:** E1 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20); po poprawce oba sygnały odpalają na
  projektach testowych, z dowodem negatywnym na ciszę.

### L-0049 — Mechanizm z progiem ma jeden wyzwalacz · 2026-08-20 · AKTYWNA

- **Trigger:** raport budżetu startowego odzywał się w projekcie, który **mieścił się** w budżecie —
  bo poza sumą sprawdzałem też progi cząstkowe pozycji.
- **Przyczyna:** policzone zostały dwie wielkości, więc obie trafiły do warunku. Decyzja mówiła
  wyłącznie o jednej.
- **Zasada:** wyzwalaczem jest ta wielkość, o której mówi decyzja. Wielkości pomocnicze służą do
  wskazania **przyczyny wewnątrz komunikatu**, nie do jego wywołania — mechanizm odzywający się
  poniżej progu odbiera ciszy znaczenie, a cisza jest tu funkcją, nie brakiem.
- **Źródło:** E1 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20), sekcja 5 planu (przepływ „suma wobec
  budżetu → poniżej: cisza").
