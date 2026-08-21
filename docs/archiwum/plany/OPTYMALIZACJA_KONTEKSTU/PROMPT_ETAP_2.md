# PROMPT_ETAP_2 — Rozbrojenie rotacji: sekcja „Czeka na człowieka" i drugie wejście na starcie

Plan: OPTYMALIZACJA_KONTEKSTU • Etap: **E2 z E5** • Wygenerowano: 2026-08-20 (autor: Opus 5,
w rytuale „Na koniec" E1) • Wykonawca: **Opus** (ze `STATUS.md` planu: „Opus, z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — cały plik |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**R5**) + wpis z 2026-08-20 o E1 (co powstało, co zostało zmierzone) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html` | sekcje 5 (mechanizmy 2 i 3), 6 (zakres E2), 7 (ryzyko 4), 8 (przypadki brzegowe — cztery dotyczą tego etapu) |
| `.claude/relai/templates/SPEC_DZIENNIK.md` | dzisiejsza struktura dziennika i sekcja „Do zrobienia przez człowieka" — tu dochodzi nowa sekcja |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | sekcja „Wybór treści" i „Jak poznać pozycję rozstrzygniętą" — reguła blokady zmienia adres |
| `.claude/relai/templates/SPEC_STATUS.md` | sekcja „Bramki manualne" — druga droga, którą pozycje człowieka już dziś wychodzą z wpisów |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Rotacja dokumentów (krok 2 rytuału zamknięcia)" — jedyne dzisiejsze wejście rotacji |
| `core/process/session-signals.js` | funkcje `startCost` i `startCostReport` z E1 — tu dochodzi propozycja rotacji |
| `docs/USTAWIENIA.md` | wiersze `Rotacja dokumentów` i `Budżet startu sesji` — dwa niezależne wyłączniki |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Otwarte pozycje wyprowadzają się z wpisów do jednej sekcji** „Czeka na człowieka", stojącej
  tuż pod „Stanem otwartych ryzyk" — sekcja 5 planu, mechanizm 2. Pozycja niesie treść, datę
  i link do wpisu źródłowego.
- **Wpis, którego pozycja się wyprowadziła, przestaje blokować rotację.** Blokada liczy się
  **wyłącznie** z nowej sekcji, nie z sekcji „Do zrobienia przez człowieka" w pojedynczych wpisach.
- **Wpis zachowuje swoją sekcję z adnotacją o przeniesieniu** — pozycja nie znika z historii,
  zmienia miejsce zamieszkania (D-18: nigdy ciche kasowanie).
- **Rotacja dostaje drugie wejście: start sesji.** Rytuał zamknięcia zostaje bez zmian jako
  wejście pierwsze. Ten sam mechanizm dwufazowy z sumą kontrolną — nie piszesz drugiego.
- **Rotacja i budżet to dwa niezależne wyłączniki** (sekcja 8 planu). Rotacja wyłączona → pomiar
  z E1 nadal liczy i raportuje, ale **nie proponuje rotacji**; zamiast propozycji pada pół zdania,
  że wyłącznik jest w `USTAWIENIA.md`.
- **W sesji nieinteraktywnej rotacja na starcie NIE rusza** — zmiana w repozytorium bez człowieka
  przy klawiaturze jest zakazana. Rytuał zamknięcia zostaje jedynym wejściem w takim trybie.
  Sygnał `interaktywna` jest już w `startCostReport`; w adapterze Cursora niesie go
  `is_background_agent`, w Claude Code **nie ma go czym rozstrzygnąć** — patrz „Stan wyjściowy".
- **Dziennik ponad progiem, ale wpisów mniej niż dziesięć** → rotacja nie rusza (dziesięć
  najnowszych wpisów jest nietykalne niezależnie od rozmiaru), a komunikat mówi o tym jednym
  zdaniem z powodem.
- **Pozycja rozstrzygnięta znika z sekcji w tej samej turze**, a jej rozstrzygnięcie zapisuje wpis
  dziennika tej sesji. Sekcja trzyma wyłącznie sprawy otwarte — inaczej po pół roku byłaby drugim
  dziennikiem czytanym przy każdym starcie.
- **Zamknięta lista brzmień rozstrzygnięcia zostaje bez zmian** (1.5.2, L-0035): rdzenie
  `rozstrzygni`, `zrobion`, `zaakceptowan`, `domkni`, `wykonan`, `anulowan` plus data. Nie
  poszerzasz jej przy okazji.
- **Granica zakresu:** kształt `STATE.md`, `CLAUDE.md` i nowa `SPEC_PULAPKI` to **E3**; ryzyka,
  ustawienia i `STATUS.md` to **E4**; migracja JiraManagera i PolyFlow to **E5**. Podbicie wersji
  do **1.6.0 następuje w E4** — w tym etapie **nie ruszasz** numeru wersji ani w
  `core/MANIFEST.json`, ani w `.claude-plugin/`.

## Stan wyjściowy (co realnie zastajesz po E1)

Repozytorium jest na wersji **1.5.2**. Testów ani runnera nadal **nie ma** — zachowania weryfikuje
się uruchamianiem skryptów Nodem (`node -e`, wywołanie hooka z payloadem podstawionym Nodem,
nie echem w powłoce) i dowodami na stanie plików.

Warstwa startowa tego repozytorium waży dziś **57,9 KB przy budżecie 80 KB** `FAKT` (pomiar E1,
2026-08-20): CLAUDE 6,0 KB · STATE 12,4 KB · ryzyka 20,9 KB · zasady 11,2 KB · ustawienia 4,1 KB ·
status planu 2,0 KB. Mieści się, więc raport milczy — i to milczenie jest **zweryfikowane**, nie
domniemane.

```
core/process/session-signals.js          # + startCost(cwd, opcje) — sześć pozycji, suma, progi,
                                         #   flaga przekroczenia, lista pozycji "plik-bez-sekcji"
                                         # + startCostReport(miara, opcje) — do sześciu linii ASCII,
                                         #   wyłącznie powyżej sumy; opcja `interaktywna`
                                         # ~ liniaAktywnegoPlanu — wygrywa linia NIOSĄCA link
                                         #   (poprawka L-0048); promptGap korzysta z tej samej funkcji
core/templates/SPEC_USTAWIENIA.md        # + sekcja "Wiersz `Budżet startu sesji` (od 1.6.0)"
core/templates/SPEC_ARCHIWUM.md          # BEZ ZMIAN — progi rotacji, dwie fazy, zamknięta lista brzmień
core/templates/SPEC_DZIENNIK.md          # BEZ ZMIAN — sekcja "Do zrobienia przez człowieka" żyje we wpisie
core/templates/SPEC_STATUS.md            # BEZ ZMIAN — "Bramki manualne" wyprowadzają pozycje do planu
adapters/claude-code/hooks/session-context.js  # + wywołanie startCost/startCostReport przy SessionStart
adapters/cursor/hooks/session-context.js       # + to samo, plus `interaktywna: is_background_agent !== true`
adapters/claude-code/skills/relai-core/SKILL.md # sekcja "Rotacja dokumentow (krok 2 rytualu zamkniecia)"
docs/USTAWIENIA.md                       # + wiersz "Budżet startu sesji" z 2026-08-20
docs/KOMENDY.md                          # + linia o budżecie startu w "Czego RelAI pilnuje bez proszenia"
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** sekcji „Czeka na człowieka" w dzienniku
i w jego specyfikacji; reguły blokady liczonej z tej sekcji zamiast z pojedynczych wpisów;
procedury wyprowadzenia zastanych pozycji; drugiego wejścia rotacji na starcie sesji; sprzężenia
raportu budżetu z wyłącznikiem rotacji.

**Dwie rzeczy, o których musisz wiedzieć, zanim zaczniesz:**

1. **Rotacja w tym repozytorium ruszyła** (2026-08-17): dziennik ma linię-odsyłacz do
   `docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md`. Blokada, którą ten etap rozbraja,
   dotyczy **JiraManagera i PolyFlow**, nie tego repo — nie licz na to, że zobaczysz ją tutaj
   na żywo. Materiał dowodowy musisz zbudować sam, projektem testowym.
2. **Sesji nieinteraktywnej Claude Code nie da się dziś rozpoznać** — payload `SessionStart` nie
   niesie żadnego zmierzonego rozróżnienia wobec `claude -p`, a `CLAUDE_CODE_ENTRYPOINT` nie
   został z niczym porównany (pomiar `claude -p` stoi na wyczerpanym limicie konta, L-0032).
   To jest **twarde ograniczenie tego etapu**: albo znajdziesz sygnał i **zmierzysz go**, albo
   opiszesz wprost, że w Claude Code rotacja na starcie zachowuje się jak w sesji interaktywnej,
   i zapiszesz to jako punkt do odnogi `POMIAR_ODNOG`. Nie zgadujesz (L-0025) i nie deklarujesz
   weryfikacji, której nie da się wykonać (L-0005).

**Zasady aktywne z `docs/LEKCJE.md`, przepisane w całości (obowiązują w tym etapie):**

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

## Zakres etapu

1. **`core/templates/SPEC_DZIENNIK.md` — nowa sekcja „Czeka na człowieka"** w strukturze dziennika,
   tuż pod „Stanem otwartych ryzyk". Opisz: format pozycji (treść · data · link do wpisu
   źródłowego), że sekcja jest **nadpisywana** i **nigdy nie trafia do archiwum**, że trzyma
   wyłącznie sprawy **otwarte**, oraz co się dzieje z pozycją rozstrzygniętą (znika w tej samej
   turze, rozstrzygnięcie zapisuje wpis tej sesji). Sekcja pusta ma mieć jawne brzmienie „—"
   i nie znikać z pliku. Kompletny przykład na końcu specyfikacji jest obowiązkowy (L-0001).
2. **`core/templates/SPEC_DZIENNIK.md` — sekcja „Do zrobienia przez człowieka" we wpisie** dostaje
   zdanie o wyprowadzeniu: pozycja przeniesiona zostaje w miejscu z adnotacją
   `*(wyprowadzone <data> → sekcja „Czeka na człowieka")*`, a wpis od tej chwili rotacji **nie
   blokuje**. Brzmienie adnotacji jest **zamknięte** i czytane maszynowo — wpisz je dosłownie
   (L-0035).
3. **`core/templates/SPEC_ARCHIWUM.md` — reguła blokady zmienia adres.** W sekcji „Wybór treści"
   punkt o wpisie z nierozstrzygniętą pozycją przestaje odsyłać do sekcji wpisu, a zaczyna do
   sekcji „Czeka na człowieka": blokujące są **wyłącznie** wpisy, do których prowadzi link
   z otwartej pozycji tej sekcji. Wpis z pozycją wyprowadzoną albo rozstrzygniętą jest
   przenoszalny. Zachowaj przypadek brzegowy „powyżej progu, ale cały zakres nietykalny" —
   ma nadal mówić jednym zdaniem z powodem.
4. **`core/templates/SPEC_ARCHIWUM.md` — drugie wejście rotacji.** Sekcja „Kiedy powstaje" dostaje
   start sesji jako drugi moment: rotacja rusza, gdy pomiar warstwy startowej pokaże przekroczenie
   **i** rotacja jest włączona **i** sesja jest interaktywna. Wypisz wprost, czym różni się od
   wejścia przy zamknięciu (niczym poza momentem — ten sam mechanizm dwufazowy) i że dziesięć
   najnowszych wpisów zostaje nietykalne także tutaj.
5. **`core/process/session-signals.js` — sprzężenie raportu z wyłącznikiem rotacji.** `startCost`
   czyta dodatkowo przełącznik wiersza `Rotacja dokumentów` i zwraca go jako fakt (`rotacja: true |
   false | null`). `startCostReport` powyżej progu: rotacja włączona → linia proponująca rotację
   jako pierwszy krok; rotacja wyłączona → pół zdania, że wyłącznik jest w `USTAWIENIA.md`, bez
   propozycji. Limit **sześciu linii** i zakaz polskich diakrytyków (L-0016) obowiązują dalej.
6. **`adapters/claude-code/skills/relai-core/SKILL.md`** — dwie rzeczy: (a) **procedura
   wyprowadzenia** zastanych otwartych pozycji do nowej sekcji (skąd je zebrać, jak policzyć przed
   i po, co zrobić z pozycją bez daty), (b) **rotacja na starcie** jako krok rytuału startu sesji,
   z warunkami z punktu 4 i z zakazem uruchamiania jej w sesji nieinteraktywnej.
7. **`adapters/cursor/rules/relai-core.mdc`** — sprawdź, czy reguły Cursora w ogóle mówią
   o rotacji (dziś **nie mówią**). Jeśli nie mówią, dopisz **jedno** zdanie o rotacji na starcie
   i jedno o sekcji „Czeka na człowieka" — warstwa zawsze-w-kontekście jest tam jedynym nośnikiem
   (L-0030). Reguła Cursora jest po angielsku (ustawienie z 2026-08-12).
8. **`docs/DZIENNIK.md` tego projektu — wyprowadzenie własnych pozycji** (dogfooding). Zbierz
   otwarte pozycje z wpisów, załóż sekcję „Czeka na człowieka" i wpisz je tam z linkami. Liczba
   pozycji otwartych **przed i po musi być równa** — to jest punkt weryfikacji, nie życzenie.
9. **`docs/KOMENDY.md`** — jedna linia o tym, że sprawy czekające na człowieka mają teraz stałe
   miejsce widoczne na starcie. Bez obiecywania rzeczy z E3–E5 (L-0002).
10. **Bez podbicia wersji** — `core/MANIFEST.json`, `.claude-plugin/` i marker `Wersja RelAI`
    zostają na 1.5.2 do E4.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Rotacja rusza tam, gdzie dotąd stała.** Projekt testowy: dziennik ponad progiem, pierwszy
      wpis z otwartą pozycją „Do zrobienia przez człowieka". Przed zmianą zakres rotacji jest
      pusty; po wyprowadzeniu pozycji zakres jest **niepusty** i rotacja przenosi wpisy. Oba
      przebiegi w jednym uruchomieniu, z wypisanymi liczbami (L-0040).
- [ ] **Dowód negatywny na blokadę:** wpis, do którego prowadzi link z **otwartej** pozycji sekcji
      „Czeka na człowieka", **nie** zostaje przeniesiony — mimo że jest najstarszy i mimo że jego
      własna sekcja „Do zrobienia przez człowieka" ma adnotację o wyprowadzeniu.
- [ ] **Nic nie ginie:** liczba otwartych pozycji przed wyprowadzeniem i po nim jest równa —
      policzona skryptem na obu stanach pliku, nie z pamięci (ryzyko 4 planu).
- [ ] **Suma kontrolna przeniesionej treści zgodna w obu fazach** rotacji, a żywy plik plus
      archiwa składają się w oryginał (porównanie po normalizacji CRLF → LF, L-0033).
- [ ] **Rotacja wyłączona, budżet włączony:** raport powyżej progu jest, propozycji rotacji **nie
      ma**, pada pół zdania o wyłączniku. Dowód negatywny: `grep` po słowie proponującym rotację
      w wyjściu hooka nie zwraca nic.
- [ ] **Budżet wyłączony, rotacja włączona:** w kontekście startu **ani jednego znaku** o budżecie,
      a rytuał zamknięcia sesji nadal rotuje.
- [ ] **Dziennik ponad progiem, mniej niż dziesięć wpisów:** rotacja nie rusza, komunikat mówi
      o tym jednym zdaniem z powodem (nie milczy — milczenie jest zarezerwowane dla stanu poniżej
      progu).
- [ ] **Pozycja rozstrzygnięta znika z sekcji:** projekt testowy z pozycją opatrzoną adnotacją
      z zamkniętej listy brzmień + datą → po przebiegu nie ma jej w sekcji „Czeka na człowieka",
      a wpis przestaje blokować. Adnotacja spoza listy → pozycja zostaje (dowód negatywny, L-0035).
- [ ] **Sesja nieinteraktywna nie rotuje na starcie** — zmierzone tam, gdzie sygnał istnieje
      (Cursor, `is_background_agent: true`): w wyjściu hooka nie ma propozycji rotacji. Dla Claude
      Code punkt jest **opisany jako niewykonalny dzisiaj** wraz z warunkiem wykonalności, jeśli
      sygnału nie udało się zmierzyć.
- [ ] Komunikaty hooków bez polskich diakrytyków: `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na literałach
      obu hooków nie zwraca nic (L-0016). Raport nadal ma **najwyżej sześć linii**.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] Wersja **nie została podbita**: `core/MANIFEST.json` nadal ma `1.5.2` (dowód negatywny).
- [ ] **Dogfooding:** `docs/DZIENNIK.md` tego repozytorium ma sekcję „Czeka na człowieka"
      z pozycjami zebranymi z wpisów, każda z linkiem do wpisu źródłowego.
- [ ] Ślady pracy: wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" z podpisem
      `RelAI (<model>) + <git config user.name>`, `docs/STATE.md` nadpisany, katalogi testowe
      usunięte, brak plików tymczasowych w repo.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: E2 → `ZREALIZOWANY <data>`, E3 → `GOTOWY DO
   STARTU` z linkiem do `PROMPT_ETAP_3.md`, linia w dzienniku wdrożenia. Pozycje „Do zrobienia
   przez człowieka" z wpisu tego etapu → sekcja „Bramki manualne".
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę ryzyk —
   **R5** dostaje zdanie o tym, co ten etap zmienił w mechanizmie. Lekcje z etapu →
   `docs/LEKCJE.md` plus odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje „Co działa" i „Nad czym pracujemy teraz"; `README.md` tylko
   przy zmianie sposobu uruchomienia.
4. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, wg `SPEC_PROMPT_ETAPU.md`: na bazie sekcji 5
   i 6 planu (E3 — `STATE.md` i `CLAUDE.md` pod budżetem, nowa `SPEC_PULAPKI`), **realnego stanu
   repozytorium po tym etapie** i lekcji, które w nim powstały.
5. Commit z conventional message (propozycja, nie samowola).
