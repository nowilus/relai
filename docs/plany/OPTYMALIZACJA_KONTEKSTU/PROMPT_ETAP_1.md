# PROMPT_ETAP_1 — Miara warstwy startowej i budżet kontekstu

Plan: OPTYMALIZACJA_KONTEKSTU • Etap: **E1 z E5** • Wygenerowano: 2026-08-20 (autor: Opus 5, przy
akceptacji planu) • Wykonawca: **Opus** (ze `STATUS.md` planu: „Opus, z ustawień projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — cały plik |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (zwłaszcza **R5**, w tym pomiar z 2026-08-20) + ostatni wpis |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/OPTYMALIZACJA_KONTEKSTU/PLAN.html` | sekcje 3 (stan wyjściowy z pomiarem), 5 (budżet i sześć mechanizmów), 6 (zakres E1), 8 (przypadki brzegowe — wszystkie dotyczą tego etapu) |
| `core/process/session-signals.js` | miejsce, w którym powstaje pomiar; konwencje modułu: czysta biblioteka bez wiedzy o protokole hooków |
| `adapters/claude-code/hooks/session-context.js` | jak dzisiejsze sygnały (luka promptu, rozjazd stanu, nieznany autor) trafiają do kontekstu startu |
| `adapters/cursor/hooks/session-context.js` | drugi konsument tej samej funkcji rdzenia |
| `.claude/relai/templates/SPEC_USTAWIENIA.md` | sekcja „Wiersz `Rotacja dokumentów`" — wzorzec formatu maszynowego dla nowego wiersza |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | co dziś jest źródłem prawdy o progach rotacji (żeby nowy wiersz nie dublował tamtych wartości) |
| `docs/USTAWIENIA.md` | preferencje projektu; tu dopiszesz wiersz budżetu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Budżet warstwy startowej: 80 KB (≈25 tys. tokenów)**, progi cząstkowe: `CLAUDE.md` 10 KB,
  `STATE.md` 12 KB, ryzyka 12 KB, „Zasady aktywne" **30 KB**, `USTAWIENIA.md` 6 KB, `STATUS.md`
  aktywnego planu 10 KB — sekcja 5 planu, wywiad z 2026-08-20. Próg 30 KB na zasady jest **wyborem
  użytkownika** (odrzucona propozycja 8 KB) i wraca do rozstrzygnięcia dopiero po pomiarze w E5.
- **Warstwą nośną jest hook, nie skill** (L-0030, R2): pomiar ma działać bez wyzwolenia czegokolwiek,
  przy każdym modelu i w obu adapterach.
- **Mierzysz to, co rytuał naprawdę czyta:** sekcję tam, gdzie czytana jest sekcja (ryzyka + ostatni
  wpis dziennika, „Zasady aktywne"), cały plik tam, gdzie czytany jest cały plik.
- **Poniżej progu — cisza absolutna.** Zero znaków w kontekście startu, tak jak przy rotacji
  (`SPEC_ARCHIWUM.md`). Raport pojawia się wyłącznie powyżej progu i ma najwyżej sześć linii.
- **Hook nie blokuje pracy** — mówi i proponuje; wariant z twardą blokadą został odrzucony w wywiadzie.
- **W sesji nieinteraktywnej raport jest, propozycja odchudzenia nie** — sekcja 8 planu.
- **Wartość nierozpoznana w wierszu ustawień znaczy „wyłączone" i jedno zdanie o tym**, nigdy
  zgadywanie (L-0025; ten sam wyjątek co przy rotacji).
- **Komunikaty hooków są ASCII** — bez polskich diakrytyków na stdout/stderr procesu hooka (L-0016).
- **Granica zakresu:** rozbrojenie rotacji sekcją „Czeka na człowieka" to **E2**; kształt `STATE.md`,
  `CLAUDE.md` i `SPEC_PULAPKI` to **E3**; ryzyka, ustawienia i `STATUS.md` to **E4**; migracja
  JiraManagera i PolyFlow to **E5**. Podbicie wersji do **1.6.0 następuje w E4** — w tym etapie
  **nie ruszasz** numeru wersji ani w `core/MANIFEST.json`, ani w `.claude-plugin/`.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium jest na wersji **1.5.2**; plan ROZWOJ_PO_WYDANIU ma zamknięte E1–E6 i czeka z E7 do
wydania 1.6.0. Repozytorium **nie ma katalogu testów ani runnera** — zachowania weryfikuje się
uruchamianiem skryptów Nodem (`node -e`, wywołanie hooka z podstawionym payloadem) i dowodami na
stanie plików. Pomiar warstwy startowej z 2026-08-20 stoi w sekcji 3 planu i w ryzyku R5.

```
core/process/session-signals.js      # biblioteka rozpoznań startu: isGuest, relaiMarkerFile,
                                     #   todayLocal, projectVersion, provisionTemplates,
                                     #   globalSettingsText, promptGap, planyZEtapemWToku,
                                     #   liniaAktywnegoPlanu, stateDrift, gitUserName, unknownAuthor
core/MANIFEST.json                   # rejestr rdzenia i adapterów; pozycja process/session-signals
core/tools/validate-adapters.js      # walidator spójności rdzeń–adaptery (istnienie plików, wersje,
                                     #   martwe odwołania)
core/templates/SPEC_USTAWIENIA.md    # specyfikacja ustawień; wzorzec wiersza czytanego maszynowo
core/templates/SPEC_ARCHIWUM.md      # progi rotacji — jedyne źródło prawdy o wartościach domyślnych
adapters/claude-code/hooks/session-context.js  # SessionStart + PostToolUse(Skill); składa kontekst
                                     #   startu z sygnałów rdzenia
adapters/claude-code/hooks/hooks.json          # rejestracja hooków
adapters/cursor/hooks/session-context.js       # sessionStart Cursora, ten sam rdzeń
docs/USTAWIENIA.md                   # ma wiersz „Rotacja dokumentów" z 2026-08-12 (wzór formatu)
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnej funkcji liczącej koszt warstwy
startowej, żadnego wiersza „Budżet startu sesji" w ustawieniach ani w specyfikacji, żadnego sygnału
o przekroczeniu w kontekście startu. Dzisiejszy hook wypisuje wyłącznie datę, instrukcję rytuału,
ustawienia globalne, lukę promptu etapowego, rozjazd stanu i nieznanego autora.

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

## Zakres etapu

1. **`core/process/session-signals.js` — nowa funkcja `startCost(cwd, opcje)`.** Czysta biblioteka,
   bez wiedzy o protokole hooków, bez zależności npm. Ma:
   - czytać wiersz **`Budżet startu sesji`** z `docs/USTAWIENIA.md` (kotwica na początku komórki
     `Decyzja`, człony rozdzielone `·` — jak wiersz rotacji);
   - zmierzyć sześć pozycji: `CLAUDE.md` (cały plik), `docs/STATE.md` (cały plik),
     `docs/DZIENNIK.md` — sekcja „Stan otwartych ryzyk" **plus ostatni wpis**, `docs/LEKCJE.md` —
     sekcja „Zasady aktywne", `docs/USTAWIENIA.md` (cały plik), `STATUS.md` planu wskazanego linią
     „Aktywny plan" w `CLAUDE.md` (użyj istniejącej `liniaAktywnegoPlanu`);
   - obsłużyć **nazwy plików w języku projektu** (`JOURNAL.md`, `LESSONS.md`, `SETTINGS.md`) i
     angielskie nagłówki sekcji;
   - zwrócić strukturę: pozycje (`id`, ścieżka, bajty, `sposob`: `plik` / `sekcja` /
     `plik-bez-sekcji`), sumę, budżet, progi cząstkowe, listę pozycji ponad progiem i flagę
     przekroczenia sumy;
   - zwrócić `null`, gdy przełącznik jest wyłączony, gdy folder nie jest projektem RelAI albo gdy
     brakuje `docs/USTAWIENIA.md` — **bez rzucania wyjątku**;
   - przy braku szukanego nagłówka zmierzyć **cały plik** i oznaczyć to jako `plik-bez-sekcji`.
2. **`core/templates/SPEC_USTAWIENIA.md` — sekcja „Wiersz `Budżet startu sesji` (od 1.6.0)"**:
   format maszynowy, dozwolone człony, znaczenie każdego, zachowanie przy wartości nierozpoznanej,
   wartości domyślne (to jest jedyne źródło prawdy o domyślnym budżecie — nie dubluj ich w innych
   specyfikacjach). Wzorzec brzmienia komórki:
   `włączony · start 80 KB · CLAUDE 10 KB · STATE 12 KB · ryzyka 12 KB · zasady 30 KB · ustawienia 6 KB · status 10 KB`.
3. **`adapters/claude-code/hooks/session-context.js`** — wywołanie `startCost` przy `SessionStart`
   i wypisanie raportu **wyłącznie powyżej progu**: suma wobec budżetu, trzy najgrubsze pozycje
   z ich progami, pozycje zmierzone jako `plik-bez-sekcji` (jeśli są) i jedno zdanie instrukcji dla
   sesji: zgłoś to użytkownikowi jednym zdaniem przed akapitem „gdzie jesteśmy" i zaproponuj
   odchudzenie jako pierwszy krok. Maksymalnie sześć linii, ASCII.
4. **`adapters/cursor/hooks/session-context.js`** — ta sama funkcja rdzenia, ten sam raport.
   Adapter nie dostaje własnej logiki liczenia.
5. **`docs/USTAWIENIA.md` tego projektu** — wiersz `Budżet startu sesji` z dzisiejszą datą
   (dogfooding: RelAI ma mierzyć sam siebie). Pamiętaj, że zapis do tego pliku przechodzi przez hook
   `config-protection` i zażąda potwierdzenia.
6. **`docs/KOMENDY.md`** — jedna linia w zachowaniach automatycznych: co się dzieje, gdy warstwa
   startowa przekroczy budżet, i gdzie jest wyłącznik. Bez obiecywania rzeczy z E2–E5 (L-0002).
7. **Bez podbicia wersji** — `core/MANIFEST.json`, `.claude-plugin/` i marker `Wersja RelAI`
   zostają na 1.5.2 do E4.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node -e` wywołujące `startCost` na tym repozytorium zwraca **sześć pozycji** i sumę; wartości
      dwóch dowolnych pozycji zgodne co do bajta z niezależnym pomiarem (`stat -c%s` dla pliku,
      wycięcie sekcji `sed`-em dla sekcji).
- [ ] **Dowód negatywny na ciszę:** w projekcie poniżej budżetu wyjście hooka `SessionStart` jest
      **bajt w bajt identyczne** z wyjściem sprzed zmiany (porównaj zrzuty przed i po).
- [ ] Projekt powyżej budżetu (katalog testowy z rozdmuchanym `STATE.md`) dostaje raport: **nie
      więcej niż sześć linii**, zawierający sumę, budżet i trzy najgrubsze pozycje.
- [ ] Dokument z celowo zmienionym nagłówkiem sekcji jest mierzony jako **cały plik**, a raport
      mówi o tym wprost — bez zgadywania i bez milczenia (L-0025).
- [ ] Przełącznik `wyłączony` → w kontekście startu **ani jednego znaku** o budżecie (dowód
      negatywny), przy niezmienionych pozostałych sygnałach.
- [ ] Wartość przełącznika nierozpoznana → traktowana jak wyłączony **plus** jedno zdanie w raporcie.
- [ ] Folder, który **nie jest** projektem RelAI, oraz projekt bez `docs/USTAWIENIA.md`: hook kończy
      się bez wyjątku i bez wyjścia (dowód: kod wyjścia i pusty stdout).
- [ ] Komunikaty hooków bez polskich diakrytyków: `grep -nP "[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]"` na literałach
      wypisywanych przez oba hooki nie zwraca nic (L-0016).
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] Oba adaptery wołają **tę samą** funkcję rdzenia: `grep -rn "startCost" adapters/` pokazuje
      wywołania, a nie drugą implementację liczenia.
- [ ] Wersja **nie została podbita**: `core/MANIFEST.json` nadal ma `1.5.2` (dowód negatywny).
- [ ] Ślady pracy: wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy" z podpisem
      `RelAI (<model>) + <git config user.name>`, `docs/STATE.md` nadpisany, katalogi testowe
      usunięte, brak plików tymczasowych w repo.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md`: E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO
   STARTU` z linkiem do `PROMPT_ETAP_2.md`, linia w dzienniku wdrożenia. Pozycje „Do zrobienia przez
   człowieka" z wpisu tego etapu → sekcja „Bramki manualne".
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę ryzyk —
   **R5** dostaje zdanie o tym, co ten etap zmierzył. Lekcje z etapu → `docs/LEKCJE.md` plus
   odświeżone „Zasady aktywne".
3. `docs/STATE.md` — nadpisz sekcje „Co działa" i „Nad czym pracujemy teraz”; `README.md` tylko przy
   zmianie sposobu uruchomienia.
4. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, wg `SPEC_PROMPT_ETAPU.md`: na bazie sekcji 5 i 6
   planu (E2 — rozbrojenie rotacji), **realnego stanu repozytorium po tym etapie** i lekcji, które
   w nim powstały.
5. Commit z conventional message (propozycja, nie samowola).
