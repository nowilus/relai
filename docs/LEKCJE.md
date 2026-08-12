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

## Lekcje

### L-0001 — Specyfikacja bez przykładu · 2026-08-07 · AKTYWNA

- **Trigger:** pierwsze wersje `SPEC_*` w E1 opisywały strukturę dokumentu bez pokazania gotowego
  wyniku.
- **Przyczyna:** założenie, że opis sekcji wystarczy modelowi generującemu dokument.
- **Zasada:** każda specyfikacja kończy się sekcją „Przykład" z kompletnym, realnym dokumentem
  w języku projektu.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0002 — Obietnica zamiast stanu faktycznego · 2026-08-07 · AKTYWNA

- **Trigger:** pokusa, by w `KOMENDY.md` wypisać komendy `/relai-*` zaplanowane na kolejne etapy.
- **Przyczyna:** ściąga wygląda kompletniej, gdy zawiera pełną listę docelową.
- **Zasada:** dokument użytkownika opisuje wyłącznie to, co działa w zainstalowanej wersji; rzeczy
  planowane nie istnieją w ściądze.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0003 — „Naprawianie" świadomego ostrzeżenia · 2026-08-07 · AKTYWNA

- **Trigger:** `claude plugin validate --strict` zgłasza, że `CLAUDE.md` w korzeniu pluginu nie jest
  ładowany jako kontekst projektu.
- **Przyczyna:** to repo jest jednocześnie pluginem i projektem RelAI (dogfooding, D-82) — walidator
  nie zna tego przypadku.
- **Zasada:** ostrzeżenie zostaje; nie przenoś `CLAUDE.md` i nie zmieniaj struktury repo, by je
  uciszyć.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0004 — Plugin odinstalowany na czas budowy · 2026-08-07 · ZMIENIONA 2026-08-07

> **ZMIENIONE 2026-08-07** — użytkownik odwrócił decyzję („może jednak doinstaluj ten plugin
> i zrealizuj testy R2"). Plugin jest zainstalowany od wersji 0.3.1; testy zachowań wykonuje się
> realnie, świeżymi sesjami. Powód zmiany: dwa etapy bez pomiaru ryzyka R2 kosztowały więcej niż
> ryzyko pracy z zainstalowaną wersją w trakcie budowy. Aktualna treść zasady — punkt 4 w „Zasadach
> aktywnych"; poniższy zapis zostaje jako historia (D-18).

- **Trigger:** po testach instalacji w E1 plugin został na maszynie w scope `user`; użytkownik
  polecił go odinstalować.
- **Przyczyna:** założenie, że zainstalowana wersja przyda się do testów w kolejnych etapach.
  W praktyce nieaktualna wersja pluginu mogłaby wpływać na sesje budowy.
- **Zasada:** przez cały czas budowy plugin pozostaje odinstalowany; testy zachowań wykonujesz,
  odtwarzając procedurę skilla ręcznie, i piszesz wprost, czego przez to nie zmierzono.
- **Źródło:** „odinstaluj, zainstalujemy sobie na sam koniec" (korekta użytkownika, 2026-08-07).

### L-0005 — Weryfikacja zaplanowana tam, gdzie niewykonalna · 2026-08-07 · AKTYWNA

- **Trigger:** E1 odłożył test auto-wyzwalania skilla „na start E2", a E2 nie mógł go wykonać,
  bo plugin jest odinstalowany (L-0004). Ryzyko R2 przeszło dwa etapy bez pomiaru.
- **Przyczyna:** przy planowaniu weryfikacji nie sprawdzono, czy warunki jej wykonania będą
  spełnione w etapie, do którego ją przeniesiono.
- **Zasada:** przenosząc weryfikację do późniejszego etapu, zapisz w prompcie tego etapu warunek,
  który musi być spełniony, żeby dała się wykonać; jeśli warunku nie da się zapewnić, przenieś
  weryfikację tam, gdzie się da.
- **Źródło:** przegląd zamykający etap E2 (nie korekta użytkownika).

### L-0006 — „Przy każdym planie" wzięte dosłownie · 2026-08-07 · AKTYWNA

- **Trigger:** pierwsza wersja skilla `relai-planning` zadawała pytanie o rodzaj planu zawsze,
  także wtedy, gdy próg PLAN/MINIPLAN rozstrzygał sprawę jednoznacznie, a format i model były już
  w `USTAWIENIA.md`.
- **Przyczyna:** decyzja D-39 mówi „przed powstaniem każdego planu RelAI pyta" — zapis odczytany
  dosłownie, bez zestawienia z D-22 („zapytaj RAZ, zapisz, respektuj").
- **Zasada:** pytanie startowe planu pada raz na projekt, nie raz na plan. Przed pytaniem czytasz
  `USTAWIENIA.md` i warstwę globalną; gdy nie zostaje nic do zapytania, generujesz plan i mówisz
  jednym zdaniem, co przyjąłeś i skąd.
- **Źródło:** przegląd przy teście utrwalonej preferencji, etap E3 (nie korekta użytkownika).

### L-0007 — Test zakazu bez dowodu negatywnego · 2026-08-07 · AKTYWNA

- **Trigger:** test zamrożenia planu początkowo sprawdzał tylko, czy powstał aneks — a to nie
  dowodzi, że sekcje planu pozostały nietknięte.
- **Przyczyna:** mylenie „nowy artefakt istnieje" z „stary artefakt się nie zmienił". Pierwsze jest
  łatwe do sprawdzenia i dlatego kuszące.
- **Zasada:** test zachowania typu „tego nie wolno ruszać" musi pokazać pierwotne brzmienie
  chronionego fragmentu po operacji, obok dowodu, że zmiana wylądowała tam, gdzie miała.
- **Źródło:** przegląd zamykający etap E3 (nie korekta użytkownika).

### L-0008 — Numer wersji żyjący w sześciu miejscach · 2026-08-07 · AKTYWNA

- **Trigger:** podbicie 0.2.0 → 0.3.0 objęło manifesty, README i `SPEC_KOMENDY.md`, ale numer
  w przykładzie wewnątrz `SPEC_USTAWIENIA.md` został stary — wyłapany dopiero `grep`-em.
- **Przyczyna:** wersja występuje też w przykładach i w zdaniach historycznych, więc lista „miejsc
  do zmiany" prowadzona z pamięci zawsze będzie niepełna.
- **Zasada:** po podbiciu wersji uruchamiasz `grep` po starym numerze w całym repo i rozstrzygasz
  każde trafienie osobno — historyczne zostaje (i wiesz dlaczego), aktualne się zmienia.
- **Źródło:** przegląd zamykający etap E3 (nie korekta użytkownika).

### L-0009 — Opis skilla przegrywa konkurencję · 2026-08-07 · AKTYWNA

- **Trigger:** pierwszy realny pomiar R2 na zainstalowanym pluginie 0.3.0: `relai-planning` **nie
  wystrzelił** na prompcie „przygotuj plan dodania logowania", mimo że dokładnie ta fraza była
  w jego opisie; sesja napisała plan po swojemu, łamiąc trzy konwencje naraz.
- **Przyczyna:** opis był narracyjny („RelAI planning: turning a request for a plan into…"), a fraza
  wyzwalająca schowana w trzecim zdaniu. Na maszynie z ~200 skillami przegrywa z opisami mocniej
  zaadresowanymi.
- **Zasada:** opis skilla zaczyna się od `MUST BE USED`, potem marker rozpoznawczy projektu, potem
  **płaska lista dosłownych fraz** — najpierw polskich. Zmiana opisu wymaga ponownego pomiaru,
  nie deklaracji.
- **Źródło:** pomiar R2 na wniosek użytkownika, etap E3 (2026-08-07). Wynik po poprawce: 2/2.

### L-0010 — Skill sięgający poza katalog roboczy · 2026-08-07 · AKTYWNA

- **Trigger:** w teście R2 sesja wykonująca `relai-core` napisała: „Global settings
  `~/.claude/relai/USTAWIENIA.md` — dostęp zablokowany (poza working directory), więc dziedziczenia
  nie sprawdzę".
- **Przyczyna:** warstwa globalna (D-23) została zaprojektowana bez sprawdzenia, czy sesja w ogóle
  ma prawo czytać pliki spoza katalogu projektu. Domyślnie nie ma.
- **Zasada:** procedura skilla przewiduje brak dostępu do zasobów spoza katalogu roboczego: mówi
  o tym jednym zdaniem i działa dalej na wartościach projektowych. Mechanizm dziedziczenia wymaga
  rozwiązania systemowego (hook albo jawna zgoda na katalog) — do rozstrzygnięcia w E5.
- **Źródło:** pomiar R2, etap E3 (2026-08-07).

### L-0011 — Odsyłacz do specyfikacji zamiast specyfikacji · 2026-08-07 · AKTYWNA

- **Trigger:** `relai-planning` kazał generować `PROMPT_ETAP_N.md` „wg
  `${CLAUDE_PLUGIN_ROOT}/templates/SPEC_PROMPT_ETAPU.md`". Pierwszy realnie wygenerowany prompt miał
  treść merytorycznie dobrą i **własny układ dziesięciu sekcji** — bez linii metrycznej z numerem
  etapu, bez bloku „Kontrola modelu", bez tabeli „Co przeczytać na start".
- **Przyczyna:** sesja nie otwarła pliku specyfikacji (patrz L-0012) i wypełniła lukę zdrowym
  rozsądkiem. Zdrowy rozsądek daje dobry dokument o innym kształcie — a kształt jest tu funkcją:
  świeża sesja szuka konkretnych sekcji w konkretnej kolejności.
- **Zasada:** to, czego naprawdę wymagasz, wypisujesz **w treści skilla**, a odsyłacz do
  specyfikacji zostaje jako źródło szczegółów. Sam odsyłacz jest życzeniem.
- **Źródło:** pomiar w etapie E4 (2026-08-07). Przed poprawką układ niezgodny w 9 elementach na 9;
  po wypisaniu dziewięciu sekcji w skillu — zgodny w 9 na 9.

### L-0012 — Katalog pluginu niedostępny dla sesji · 2026-08-07 · AKTYWNA

- **Trigger:** inicjalizacja projektu w świeżym pustym folderze **zatrzymała się**: sesja napisała
  „blocked: `…/plugins/cache/relai/relai/0.4.0/templates/*`" i odmówiła generowania ośmiu dokumentów
  z pamięci. Po `claude --add-dir <katalog pluginu>` ta sama inicjalizacja przeszła w całości.
- **Przyczyna:** D-60 zakłada, że specyfikacje mieszkają w `templates/` pluginu i są czytane
  w czasie pracy. Sesja uruchomiona w projekcie nie ma prawa czytać niczego spoza katalogu
  roboczego — dotyczy to katalogu pluginu tak samo jak katalogu domowego (L-0010).
- **Zasada:** żaden krok obowiązkowy nie może zależeć wyłącznie od odczytu pliku z katalogu
  pluginu. Rzeczy krytyczne mieszkają w treści skilla; `templates/` zostaje źródłem szczegółów
  i przykładów. Rozwiązanie systemowe — E5, razem z hookami.
- **Źródło:** test inicjalizacji w etapie E4 (2026-08-07). Ryzyko R8.

### L-0013 — Pytanie zamiast posprzątania · 2026-08-07 · AKTYWNA

- **Trigger:** sekwencja zamknięcia planu (D-36) przeniosła folder planu do archiwum, a linię
  „Aktywny plan" w `CLAUDE.md` zostawiła wskazującą na przeniesiony folder — z adnotacją „nie
  wybieram za Ciebie, to martwy link". Pierwsza poprawka („jest jeden inny plan → wpisz go") tego
  nie zmieniła: sesja nadal wolała zapytać.
- **Przyczyna:** reguła „decyzje należą do człowieka" bierze górę nad wszystkim, także wtedy, gdy
  skutkiem jest zostawienie projektu w stanie niespójnym. Model traktuje pytanie jako bezpieczne
  domyślnie — a nie jest, gdy koszt czekania ponosi plik.
- **Zasada:** wskaż **warunek końcowy stanu**, nie tylko preferowany wybór: „kiedy kończysz turę,
  linia wskazuje istniejący plik albo brzmi »brak«". Wtedy pytanie o następcę zostaje dozwolone,
  a martwy link — nie. Zawsze podaj poprawną wartość tymczasową.
- **Źródło:** dwa kolejne pomiary w etapie E4 (2026-08-07); dopiero sformułowanie warunku końcowego
  dało wynik zgodny z D-36.

### L-0014 — Wpis o kroku, którego nie wykonano · 2026-08-07 · AKTYWNA

- **Trigger:** sesja zamykająca plan napisała w dzienniku „folder przeniesiony do archiwum",
  podczas gdy tabela etapów stała jeszcze na `W TOKU`, a `docs/archiwum/` nie istniało. Wyłapała to
  dopiero następna sesja, sprawdzając stan repo zamiast ufać wpisowi.
- **Przyczyna:** rytuał opisany jako lista kroków kusi, by opisać całą listę jednym wpisem, zanim
  wykona się jej koniec.
- **Zasada:** najpierw zmiana w repozytorium, potem zdanie, które ją opisuje. Dziennik jest
  dokumentem, któremu następna sesja ufa bezwarunkowo — zdanie napisane na zapas jest fałszem
  z odroczonym skutkiem.
- **Źródło:** przebieg testowy zamknięcia planu w etapie E4 (2026-08-07).

### L-0015 — Komenda nie ładuje skilla, do którego odsyła · 2026-08-07 · AKTYWNA

- **Trigger:** `/relai-stage` odsyłał do sekcji „Zamknięcie planu" w `relai-planning`. W trzech
  przebiegach, w których transkrypt **nie zawiera wywołania `Skill`**, zamknięcie planu wyszło
  niepełne; w przebiegach, w których `relai-planning` się załadował — pełne.
- **Przyczyna:** wywołanie komendy wprost wczytuje wyłącznie treść komendy. Odesłanie „patrz skill
  X" nie jest instrukcją wykonawczą dla środowiska — jest notatką dla czytelnika.
- **Zasada:** procedurę potrzebną komendzie albo wpisujesz do niej, albo każesz jej **jawnie
  wczytać skill** (narzędzie `Skill`) jako pierwszy krok tej części pracy.
- **Źródło:** pomiary w etapie E4 (2026-08-07); po dopisaniu jawnego wczytania — sekwencja D-36
  pełna, ze skillem widocznym w transkrypcie.

### L-0016 — Polskie znaki w wyjściu hooka na Windows · 2026-08-07 · AKTYWNA

- **Trigger:** punkt weryfikacji E5 kazał rozstrzygnąć, czy komunikaty hooków niosą polskie znaki,
  czy są świadomie ASCII; równolegle test hooka przez `echo` w bashu przekłamał „ó" w ścieżce
  i guard po cichu odmówił działania.
- **Przyczyna:** wyjście procesu hooka przechodzi przez warstwy konsoli Windows o niejednolitym
  kodowaniu; treść plików czytana narzędziami Claude Code jest od tego wolna.
- **Zasada:** komunikaty hooków (stdout/stderr, JSON `permissionDecisionReason`,
  `additionalContext`, `systemMessage`) piszemy bez polskich diakrytyków; dokumenty i skille —
  normalną polszczyzną.
- **Źródło:** rozstrzygnięcie punktu weryfikacji etapu E5 (2026-08-07), nie korekta użytkownika.

### L-0017 — Dowód działania hooka to efekt, nie zdarzenie w transkrypcie · 2026-08-07 · AKTYWNA

- **Trigger:** żywy test `console-log-warn` wyglądał na FAIL: `grep` po transkrypcie
  `stream-json` nie znalazł ostrzeżenia, a bezpośredni test przez `echo` milczał. Hook działał —
  transkrypt loguje wyłącznie hooki SessionStart, a `echo` w bashu przekłamał „ó" w `cwd`.
- **Przyczyna:** dwa niezależne artefakty pomiaru: format transkryptu nie itemizuje zdarzeń
  PreToolUse/PostToolUse/Stop; shell na Windows psuje diakrytyki w payloadzie.
- **Zasada:** zachowanie hooka mierzysz efektem na dysku (obecność/suma kontrolna pliku) i treścią
  odpowiedzi modelu; payload testowy budujesz w Node (plik skryptu), nigdy `echo`/heredoc
  z polskimi znakami.
- **Źródło:** debugowanie fałszywego FAIL-a w etapie E5 (2026-08-07).

### L-0018 — Kryterium weryfikacji przewidujące cudzy format · 2026-08-07 · AKTYWNA

- **Trigger:** PROMPT_ETAP_5 wymagał, by `claude plugin details` pokazało „Hooks (8)"; realne CLI
  liczy typy zdarzeń i pokazuje „Hooks (4)" przy ośmiu zarejestrowanych plikach.
- **Przyczyna:** punkt weryfikacji zapisany jako przewidywanie formatu wyjścia narzędzia, którego
  nie kontrolujemy; przewidywanie się zestarzało, zanim zostało użyte.
- **Zasada:** punkt weryfikacji opieraj na stanie, który kontrolujesz (zawartość `hooks.json`,
  zachowanie ośmiu hooków), a wynik cudzego narzędzia traktuj jako sygnał pomocniczy do
  zinterpretowania, nie jako kryterium dosłowne.
- **Źródło:** przegląd zamykający etap E5 (2026-08-07), nie korekta użytkownika.

### L-0019 — Lista zakazów wzięta za definicję dobrego designu · 2026-08-07 · AKTYWNA

- **Trigger:** pięć propozycji designu z E6 fazy 1 przeszło całą kontrolę mechaniczną (zero
  fioletu, zero cieni, zero emoji, zero glassmorphismu) i **żadna nie spodobała się użytkownikowi**:
  „nie zrobił efektu wow", „za ostre", „zbyt rygorystycznie podszedłem do stwierdzenia no ai-slop".
- **Przyczyna:** D-61 wylicza, czego **nie wolno**. Potraktowałem tę listę jako komplet wymagań
  i optymalizowałem pod nią — zero cieni, ostre rogi, brak animacji, surowa typografia. Spełnienie
  wszystkich zakazów daje dokument poprawny i martwy, bo zakaz nie niesie żadnej informacji o tym,
  co ma **przyciągać**.
- **Zasada:** lista zakazów jest filtrem końcowym, nie briefem. Zanim wygenerujesz N wariantów
  pod jeden brief, zbierz od człowieka **cechy pozytywne** (co ma cieszyć oko, jaki nastrój, jakie
  skojarzenie) — a przy zadaniu wizualnym pokaż **jeden** wariant do kalibracji smaku, zanim
  wyprodukujesz pięć. Pięć chybionych propozycji kosztuje pięć razy tyle, co jedna.
- **Źródło:** korekta użytkownika 2026-08-07 po prezentacji fazy 1 etapu E6; skutkowała zmianą
  decyzji D-61 (patrz `DECYZJE.md`, sekcja „Decyzje zmienione").

### L-0020 — „Zainstalowane" wzięte z niewłaściwego źródła · 2026-08-08 · AKTYWNA

- **Trigger:** po pushu 0.6.0 sekwencja `marketplace update` + `plugin install` zameldowała
  „Plugin already installed", a `claude plugin details` pokazał `relai 0.6.0`. Pierwszy pomiar E6
  poszedł mimo to na skillu z 0.5.0: świeża sesja wygenerowała `PLAN.md` zamiast `PLAN.html`
  i napisała wprost „plugin 0.5.0 nie ma szablonu HTML".
- **Przyczyna:** dwa fałszywe dowody instalacji. `plugin install` na już zainstalowanym pluginie
  kończy się bez zmian (nie aktualizuje), a `plugin details` czyta metadane **marketplace'u**,
  nie wpisu instalacji — po `marketplace update` pokazuje nowy numer niezależnie od tego, co
  faktycznie siedzi na dysku.
- **Zasada:** po pushu obowiązuje `claude plugin marketplace update <mp>` → **`claude plugin update
  <plugin>@<mp>`**. Wersję zainstalowaną potwierdzasz wpisem w
  `~/.claude/plugins/installed_plugins.json` (`installPath`, `version` **i `gitCommitSha`**) albo
  nagłówkiem skilla w `~/.claude/plugins/cache/…`. Zanim uznasz pomiar za ważny, sprawdź, którą
  wersję mierzyłeś.
- **Dopisek z tej samej sesji:** `plugin update` porównuje **numer wersji**, nie commit. Poprawka
  wypchnięta bez podbicia wersji zostawia cache na starym `gitCommitSha` („already at the latest
  version") — dociera dopiero przez `plugin uninstall` + `plugin install` albo przez podbicie
  wersji. Zmierzone: sha `79e489d` → po reinstalacji `22b1b1f`.
- **Źródło:** pomiar zamykający etap E6 (2026-08-08), nie korekta użytkownika.

### L-0021 — `tar` na PATH nie jest tym `tar`, o którym myślisz · 2026-08-08 · AKTYWNA

- **Trigger:** rozstrzygając, czym `/relai-backup` ma pakować ZIP na Windows, uruchomiłem
  `tar -a -c -f test.zip …` w powłoce Git Bash. Polecenie **przeszło bez błędu i bez ostrzeżenia**,
  plik powstał, `tar -tf` wypisał jego zawartość. Dopiero kontrola pierwszych bajtów pokazała, że
  to archiwum **tar** z rozszerzeniem `.zip` — Eksplorator Windows i `Expand-Archive` by go nie
  otworzyły.
- **Przyczyna:** `tar` na `PATH` w Git Bash to GNU tar 1.35, który ZIP-a nie umie i po cichu ignoruje
  intencję `-a`. Systemowy `C:\Windows\System32\tar.exe` to bsdtar 3.8.4 (libarchive) i ten sam
  zapis daje prawdziwy ZIP. Nazwa polecenia nie mówi nic o implementacji.
- **Zasada:** narzędzie systemowe, od którego zależy **format** artefaktu, wywołuj pełną ścieżką
  i weryfikuj **wynik**, nie kod wyjścia: nagłówek pliku, lista wpisów, otwarcie natywnym
  narzędziem docelowej platformy. „Polecenie się udało" nie znaczy „powstało to, co miało powstać".
- **Źródło:** rozstrzygnięcie punktu 1 zakresu etapu E7 (2026-08-08).

### L-0022 — Komenda pluginu nazywa się inaczej, niż ją nazwałeś · 2026-08-08 · AKTYWNA

- **Trigger:** pierwszy pomiar E7 — `claude -p "/relai-backup <ścieżka>"` odpowiedział
  `Unknown command: /relai-backup`. To samo dla `/relai-stage`, czyli dla komendy działającej
  od E4. Zadziałała dopiero forma pełna: `/relai:relai-backup`, `/relai:relai-stage`.
- **Przyczyna:** Claude Code rejestruje komendy pluginu w przestrzeni nazw pluginu —
  `/<plugin>:<plik-komendy>`. Nazwa skrócona bywa rozwijana przez podpowiadacz w sesji
  interaktywnej, ale w trybie `-p` nie istnieje. Przez trzy etapy `docs/KOMENDY.md` obiecywał
  użytkownikowi formę, której nie zmierzono ani razu.
- **Zasada:** w dokumencie użytkownika podajesz **tę formę wywołania, którą zmierzyłeś**. Zanim
  wpiszesz komendę do ściągi, uruchom ją dosłownie tak, jak jest tam zapisana. To jest L-0002
  zastosowane do składni, nie do zakresu funkcji.
- **Źródło:** pomiary etapu E7 (2026-08-08).

### L-0023 — Krok, który sięga poza katalog roboczy, musi mieć zapisane wyjście awaryjne · 2026-08-08 · AKTYWNA

- **Trigger:** `/relai-backup` z folderem docelowym poza projektem zakończył się w świeżej sesji
  odmową zapisu. Sesja zachowała się dobrze (powiedziała wprost, że to blokada uprawnień, i nie
  podmieniła lokalizacji), ale wiedziała to **z własnego rozsądku**, nie z treści komendy — w pliku
  komendy tej sytuacji nie było.
- **Przyczyna:** ta sama luka co przy katalogu pluginu (L-0012) i warstwie globalnej (L-0010):
  mechanizm sięgający poza katalog roboczy zakłada dostęp, którego sesja domyślnie nie ma.
- **Zasada:** przy każdym kroku wychodzącym poza katalog roboczy wpisz do procedury, **co zrobić
  po odmowie** — jak brzmi komunikat dla użytkownika i jakie są dwa wyjścia (zgoda w sesji albo
  `--add-dir`). Nigdy „po cichu bliżej": backup w środku projektu nie chroni przed niczym.
- **Źródło:** pomiary etapu E7 (2026-08-08).

### L-0024 — Sesja pomiarowa, która mierzy co innego · 2026-08-08 · AKTYWNA

- **Trigger:** pierwszy przebieg fazy 1 pomiarów E8 — cztery świeże sesje `claude -p` z promptem
  „Chcę tutaj założyć projekt RelAI…" przekazanym **argumentem**. Wszystkie cztery odpowiedziały
  sensownie i wszystkie zobaczyły prompt urwany na słowie „Chcę": powłoka Windows przekłamała
  polskie znaki i obcięła resztę. Drugi przebieg, faza 2 — sesje odmówiły zapisu („zgoda na `Write`
  nie została udzielona"), bo tryb `-p` domyślnie nie ma prawa pisać.
- **Przyczyna:** dwie niezależne bariery, z których żadna nie zgłasza się jako błąd. Obcięty prompt
  daje **wiarygodną** odpowiedź na inne pytanie; brak uprawnień daje wiarygodne wyjaśnienie zamiast
  wyniku. Oba przebiegi wyglądały na udane.
- **Zasada:** prompt sesji pomiarowej przekazujesz **przez stdin** (`spawn('claude', ['-p'])` +
  `stdin.write(prompt)`), a zapis włączasz `--permission-mode acceptEdits`. To jest L-0017
  („payload buduj Nodem, nie echem") rozszerzone z payloadów hooków na prompty sesji. Zanim uznasz
  pomiar za ważny, sprawdź w wyjściu, czy sesja zobaczyła cały prompt.
- **Źródło:** pomiary etapu E8 (2026-08-08).

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
