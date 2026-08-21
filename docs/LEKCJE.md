# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
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
   a instrument porównawczy implementuje wiernie każdą z nich. (L-0017, L-0018, L-0040, L-0051,
   L-0052)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
   „sprawdzone inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   (L-0034, L-0049, L-0053)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. (L-0025, L-0035, L-0048)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie. (L-0004, L-0008, L-0020)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    (L-0033, L-0038, L-0057)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania. (L-0043,
    L-0045, L-0046)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Lekcje

> Lekcje L-0001 … L-0024 (24 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0001_L-0024.md](archiwum/lekcje/LEKCJE_L-0001_L-0024.md)
> — przeniesione 2026-08-12, suma kontrolna `bd5f9050dc7e7278`.

### L-0055 — Kotwica nagłówka odtworzona „mniej więcej" wycisza cały mechanizm · 2026-08-20 · AKTYWNA

- **Trigger:** instrument wyznaczający zakres rotacji dziennika policzył **dziesięć** wpisów do
  archiwum zamiast dwóch — w tym wpisy niosące sprawy czekające na człowieka. Powód: generator
  kotwic nagłówków nie odtwarzał reguły GitHuba. Dwa błędy po kolei: pauza `—` zamieniana na
  myślnik zamiast usuwana, a potem dwie spacje scalane w jeden myślnik przez `\s+`. Każdy z osobna
  dawał **zero trafień**, czyli „żaden wpis nie jest blokowany" — wynik wyglądający na poprawny.
- **Przyczyna:** brak trafień jest nieodróżnialny od „nic nie blokuje". Mechanizm oparty na
  porównaniu dwóch zbiorów milczy tak samo, gdy zbiory są rozłączne z powodu błędu, jak wtedy, gdy
  naprawdę nie mają części wspólnej.
- **Zasada:** mechanizm porównujący **wygenerowany** identyfikator z **zastanym** (kotwica, slug,
  hash nazwy) ma obok siebie kontrolę „ile zastanych nie znalazło pary" i wypisuje ją **przed**
  jakąkolwiek zmianą. Zero par przy niepustych zbiorach traktuj jako defekt instrumentu, dopóki nie
  udowodnisz, że jest inaczej.
- **Źródło:** pierwsza rotacja dziennika w tym repozytorium (2026-08-20), po zamknięciu E3.

### L-0056 — Separator, który da się wyescapować, dzieli wiersz na więcej pól, niż widzisz · 2026-08-21 · AKTYWNA

- **Trigger:** skrypt podmieniający komórkę „Mitygacja" w tabeli ryzyk rozbijał wiersz przez
  `split('|')`. Komórka ryzyka P1 zawierała w środku `allow \| deny`, więc rozpadła się na trzy
  pola: podmieniony został pierwszy kawałek, a dwa pozostałe zostały w wierszu jako resztka starej
  treści. Ten sam defekt miał instrument pomiarowy — meldował komórkę P1 jako **632 znaki**, czyli
  długość pierwszego kawałka, wartość mieszczącą się w limicie.
- **Przyczyna:** escapowany separator jest legalną treścią komórki w Markdownie, a naiwny podział
  nie odróżnia go od separatora. Pomiar zaniżony wygląda przy tym na wynik zdany, więc defekt nie
  zgłasza się sam.
- **Zasada:** dzieląc wiersz po separatorze, który w danym formacie da się wyescapować, dziel po
  separatorze **niepoprzedzonym znakiem ucieczki** i dokładaj przypadek testowy z escapowanym
  separatorem w środku pola. Po podmianie sprawdź **liczbę pól** w zmienionym wierszu — zgodna
  liczba kolumn jest tańszym dowodem niż oglądanie treści.
- **Źródło:** dogfooding E4 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21).

### L-0057 — Kotwica końca linii w regexie nagłówka wycisza mechanizm przy CRLF · 2026-08-21 · AKTYWNA

- **Trigger:** pomiar warstwy startowej na kopii repozytorium z `git worktree` pokazał **213,8 KB**
  zamiast 55,7 KB, bo dwie pozycje zmierzono jako całe pliki. Przyczyną był wzorzec
  `/^(#{1,6})\s+(.*)$/`: kropka w JavaScripcie nie obejmuje `\r`, więc przy końcach linii CRLF
  kotwica `$` nie dopasowuje **żadnego** nagłówka. Wzorzec wykrywający **koniec** sekcji `$` nie
  miał — działał normalnie, więc mechanizm nie padł, tylko po cichu zdegradował.
- **Przyczyna:** repozytorium klonowane na Windowsie z domyślnym `core.autocrlf=true` ma CRLF,
  a katalog roboczy autora miał LF. Defekt był niewidoczny dokładnie tam, gdzie go pisano.
- **Zasada:** w regexie nad pojedynczą linią **nie zakotwiczaj końca**, jeśli linie mogą nieść `\r`
  — albo normalizuj końce linii przy wczytaniu. Mechanizm czytający strukturę pliku sprawdzaj na
  **obu** wariantach końca linii w jednym przebiegu; wariant CRLF nie jest przypadkiem
  egzotycznym, tylko domyślnym na Windowsie.
- **Źródło:** E4 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21) — defekt znaleziony przy pomiarze
  przed/po, naprawiony w `core/process/session-signals.js` za zgodą użytkownika.

### L-0058 — Kotwica wstawki nie może być elementem usuwanym w tej samej pętli · 2026-08-21 · AKTYWNA

- **Trigger:** faza 2 rotacji ryzyk miała usunąć sześć wierszy i wstawić pod tabelą linię-odsyłacz.
  Wiersze zniknęły, linia nie powstała: punktem zaczepienia wstawki był **ostatni wiersz tabeli**,
  a ten akurat należał do usuwanych, więc `continue` pominął go razem ze wstawieniem.
- **Przyczyna:** dwie operacje na tej samej liście — usuwanie i wstawianie — dzieliły jeden
  przebieg i jeden warunek. Suma kontrolna przeniesionej treści była przy tym zgodna, bo dotyczyła
  wyłącznie tego, co wyszło; o tym, co miało zostać, nie mówiła nic.
- **Zasada:** wstawkę kotwicz do elementu, który **na pewno przeżyje** operację (nagłówek sekcji,
  granica bloku), albo wykonaj wstawianie osobnym przebiegiem po usuwaniu. W weryfikacji dołóż
  punkt na **obecność** nowej treści — dowód „nic nie zginęło" nie jest dowodem „wszystko powstało".
- **Źródło:** dogfooding E4 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21), wyłapane punktem
  weryfikacji o numerach w linii-odsyłaczu.

### L-0059 — Komenda w dokumencie musi przeżyć wklejenie do powłoki · 2026-08-21 · AKTYWNA

- **Trigger:** komenda sprawdzająca limit komórki, wpisana do `SPEC_DZIENNIK.md` z wyrażeniem
  `/(?<!\\)\|/`, wywaliła się przy pierwszym uruchomieniu: `SyntaxError: Invalid regular
  expression: /(?<!\)\|/: Unterminated group`. Powłoka zjadła podwójny backslash wewnątrz
  cudzysłowu, zanim Node zobaczył wzorzec.
- **Przyczyna:** wzorzec był poprawny jako **kod**, a niepoprawny jako **argument komendy**. Autor
  sprawdził go w pliku skryptu, gdzie żadna powłoka go nie dotyka.
- **Zasada:** komendę wklejaną do dokumentu uruchamiasz **dokładnie w tej formie**, w jakiej ma
  tam stanąć — z tej samej powłoki, którą zobaczy czytelnik. Znak, który powłoka interpretuje,
  zapisuj tak, by nie musiała: `[\x5c]` zamiast backslasha, klasa znaków zamiast escapowania.
- **Źródło:** E4 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21); rozwinięcie L-0002.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

### L-0025 — Dopasowanie „gdziekolwiek w linii" trafia w prozę · 2026-08-08 · ZWINIĘTA 2026-08-20

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

### L-0026 — Zdarzenie wyzwala dokument, ale nie dostarcza faktów · 2026-08-08 · ZWINIĘTA 2026-08-20

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

### L-0027 — PowerShell 5.1 zjada polskie znaki po drodze · 2026-08-08 · ZWINIĘTA 2026-08-20

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

  *(przeniesione 2026-08-20 → `docs/PULAPKI.md`, P-003 — fakt o narzędziu żyje tam, ta lekcja zostaje śladem historii)*

### L-0028 — acceptEdits nie obejmuje poleceń Bash · 2026-08-09 · ZWINIĘTA 2026-08-20

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

  *(przeniesione 2026-08-20 → `docs/PULAPKI.md`, P-004 — fakt o narzędziu żyje tam, ta lekcja zostaje śladem historii)*

### L-0029 — Szablon, którego elementu nie da się nie użyć · 2026-08-09 · ZWINIĘTA 2026-08-20

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

### L-0030 — Fraza rytualna bez warstwy nośnej · 2026-08-09 · ZWINIĘTA 2026-08-20

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

### L-0031 — Aktualizacja pluginu działa dopiero po restarcie aplikacji · 2026-08-10 · ZWINIĘTA 2026-08-20

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

  *(przeniesione 2026-08-20 → `docs/PULAPKI.md`, P-005 — fakt o narzędziu żyje tam, ta lekcja zostaje śladem historii)*

### L-0032 — Sesja pomiarowa `claude -p` ma własne konto, niezależne od aplikacji · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0033 — Sumy kontrolne porównuj po normalizacji końców linii · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0034 — Próg zapisany bez pomiaru bywa progiem martwym · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0035 — Dopisek czytany maszynowo z jednym dozwolonym brzmieniem · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0036 — Sygnał bez właściciela pada dwa razy · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0037 — Pomiar zachowania „brak konfiguracji" na maszynie, która ją ma · 2026-08-12 · ZWINIĘTA 2026-08-20

- **Trigger:** test „git nieskonfigurowany → podpis bez członu użytkownika jest poprawny" oblał.
  Hook zachował się prawidłowo: projekt testowy nie miał `.git/config`, ale proces odczytał
  `~/.gitconfig` maszyny i zobaczył `user.name = Lukasz`.
- **Przyczyna:** mechanizm celowo sięga do warstwy globalnej, a projekt testowy nie izolował
  środowiska — mierzyłem maszynę, nie przypadek brzegowy.
- **Zasada:** scenariusz „konfiguracji nie ma" wykonujesz z **podstawionym katalogiem domowym**
  (`HOME` i `USERPROFILE` w środowisku procesu potomnego). Bez podstawienia oblany test jest
  fałszywie negatywny, a zielony — fałszywie pozytywny na maszynie bez tej konfiguracji.
- **Źródło:** E3 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `podpis.js`.

### L-0038 — Przeniesienie katalogu, na który wskazuje cudzy manifest, sprawdzasz na kopii · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0039 — Kopię drzewa z gita na Windows robisz `git worktree`, nie `git archive | tar` · 2026-08-12 · ZWINIĘTA 2026-08-20

- **Trigger:** instrument porównujący zachowanie hooków przed i po przeniesieniu wysypał się na
  `tar: Cannot connect to C: resolve failed`.
- **Przyczyna:** GNU tar czyta ścieżkę `C:\...` jako `host:ścieżka`, czyli adres archiwum zdalnego.
  Litera dysku wygląda dla niego jak nazwa hosta.
- **Zasada:** drzewo dowolnego commita materializujesz `git worktree add --detach <katalog> <ref>`
  i usuwasz `git worktree remove --force`. Działa niezależnie od systemu, nie wymaga pośredniego
  archiwum i zostawia po sobie czysty stan. Rurociąg `git archive | tar` zostaw dla Uniksa.
- **Źródło:** E4 planu ROZWOJ_PO_WYDANIU (2026-08-12), instrument `porownanie.js`.

  *(przeniesione 2026-08-20 → `docs/PULAPKI.md`, P-006 — fakt o narzędziu żyje tam, ta lekcja zostaje śladem historii)*

### L-0040 — „Nic się nie zmieniło" dowodzisz dwoma drzewami naraz, nie pamięcią · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0041 — Cudze narzędzie rozpoznajesz z jego build'u i z próby, nie z dokumentacji · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0042 — Payload cudzego hooka: zdejmij BOM i nie zakładaj znanych pól · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0043 — Guardrail przez interpreter znika po cichu; opakowanie zamienia ciszę w blokadę · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0044 — Sesję pomiarową cudzego CLI uruchamiaj z powłoki natywnej dla systemu · 2026-08-12 · ZWINIĘTA 2026-08-20

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

### L-0045 — Gdy guardrail blokuje poprawny kod, podejrzanym jest guardrail, nie kod · 2026-08-17 · ZWINIĘTA 2026-08-20

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

### L-0046 — Materiał testowy guardraila składasz w czasie wykonania · 2026-08-17 · ZWINIĘTA 2026-08-20

- **Trigger:** zapis instrumentu porównawczego z próbką klucza AWS został zablokowany przez ten sam
  hook, który instrument testuje. Wcześniej ta sama blokada odbiła **komentarz do łatki**
  naprawiającej skaner: przykład sygnatury w komentarzu wyglądał jak sekret.
- **Przyczyna:** guardrail nie odróżnia treści testowej od produkcyjnej i nie ma po co odróżniać —
  to jest jego zaleta. Kosztem jest to, że narzędzie blokuje własny materiał dowodowy.
- **Zasada:** próbki sekretów w testach i przykłady w komentarzach składaj z fragmentów w czasie
  wykonania albo zakładaj pliki powłoką; nigdy nie licz na to, że guardrail zrobi wyjątek dla
  „swojego" pliku. To dotyczy także dokumentacji poprawki.
- **Źródło:** E6 planu ROZWOJ_PO_WYDANIU (2026-08-17), trzy kolejne blokady tej samej sesji.

### L-0047 — Cisza hooka bywa jego regułą, nie awarią · 2026-08-17 · ZWINIĘTA 2026-08-20

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

### L-0048 — Fraza pada w dokumencie kilka razy; „pierwsze trafienie" trafia w prozę · 2026-08-20 · ZWINIĘTA 2026-08-20

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

### L-0049 — Mechanizm z progiem ma jeden wyzwalacz · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** raport budżetu startowego odzywał się w projekcie, który **mieścił się** w budżecie —
  bo poza sumą sprawdzałem też progi cząstkowe pozycji.
- **Przyczyna:** policzone zostały dwie wielkości, więc obie trafiły do warunku. Decyzja mówiła
  wyłącznie o jednej.
- **Zasada:** wyzwalaczem jest ta wielkość, o której mówi decyzja. Wielkości pomocnicze służą do
  wskazania **przyczyny wewnątrz komunikatu**, nie do jego wywołania — mechanizm odzywający się
  poniżej progu odbiera ciszy znaczenie, a cisza jest tu funkcją, nie brakiem.
- **Źródło:** E1 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20), sekcja 5 planu (przepływ „suma wobec
  budżetu → poniżej: cisza").

### L-0050 — Jednostką inwentarza jest sprawa, nie linia · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** wyprowadzenie pozycji „Do zrobienia przez człowieka" z dziennika dało 41 otwartych
  linii i 9 spraw. Punkt weryfikacji brzmiał „liczba przed i po musi być równa" — przy liczeniu
  linii nie mógł przejść nigdy, bo dziewiąta część tych linii to odsyłacze „pozostałe bez zmian".
- **Przyczyna:** dokument append-only powtarza tę samą sprawę w każdym kolejnym wpisie. Linia jest
  jednostką **zapisu**, sprawa jednostką **stanu**; kryterium postawione na złej jednostce albo
  nie przechodzi, albo przechodzi przez wpisanie do żywej sekcji dziewięciu kopii jednej sprawy.
- **Zasada:** „nic nie ginie" formułuj na **sprawach**, z jawnym, zapisanym mapowaniem linia →
  sprawa; niezależnie od tego trzymaj mechaniczny dowód „zero otwartych linii bez adnotacji".
  Dwie miary o różnej naturze są mocniejsze niż jedna powtórzona dwa razy.
- **Źródło:** E2 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20), ryzyko 4 planu.

### L-0051 — Limit formatu mierzysz na źródle, nie na strumieniu · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** kontrola „raport ma najwyżej sześć linii" pokazała osiem, choć raport miał cztery.
  Liczyłem linie `stdout` hooka, a hook dokleja za raportem resztę kontekstu startu — bez pustej
  linii między nimi.
- **Przyczyna:** kryterium postawione na strumieniu, w którym artefakt się znalazł, zamiast na
  funkcji, która go produkuje. Wynik mierzył cudzy tekst i wyglądał na defekt produktu.
- **Zasada:** limit formatu sprawdzaj tam, gdzie powstaje (tablica linii z funkcji), a strumienia
  używaj do dowodu **obecności i nieobecności** fraz. Rozszerzenie L-0018: nie tylko „nie
  przewiduj cudzego formatu", ale i „nie licz cudzych linii jako swoich".
- **Źródło:** E2 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20), punkt weryfikacji o sześciu liniach.

### L-0052 — Test dwóch wersji reguły musi wiernie implementować obie · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** instrument porównujący regułę blokady 1.5.2 i 1.6.0 uznawał adnotację
  „*(wyprowadzone …)*" za rozstrzygnięcie **także** w wariancie 1.5.2 — a dla reguły 1.5.2 jest to
  dopisek spoza zamkniętej listy, czyli pozycja otwarta. Porównanie pokazywało, że obie reguły
  rotują, więc dowód na zmianę zachowania był pusty.
- **Przyczyna:** wspólna funkcja pomocnicza napisana pod nową regułę i użyta dla obu. Stara reguła
  dostała wiedzę, której w swoim czasie nie miała.
- **Zasada:** w instrumencie porównawczym każda wersja reguły ma własną, wierną semantykę —
  parametr, nie domysł. Inaczej test „przechodzi", pokazując brak różnicy dokładnie tam, gdzie
  różnica jest całą istotą zmiany (L-0040: jeden przebieg, dwa stany — plus wierność obu reguł).
- **Źródło:** E2 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20), punkt weryfikacji „rotacja rusza tam,
  gdzie dotąd stała".

### L-0053 — Limit w jednostce, której nikt nie liczy, jest martwy · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** `SPEC_CLAUDE_MD.md` od 0.2.0 mówił „maksimum 60 linii", a mierzony hook liczy
  **bajty**. W projekcie po adopcji plik miał 1249 linii i nikt tego nie zauważył przez cztery
  miesiące; w tym repozytorium 63 linie przy limicie 60 też nie wywołały ani jednego komunikatu.
- **Przyczyna:** limit i mechanizm kontrolny mówiły dwoma różnymi językami. Linia nie mierzy kosztu
  kontekstu (wiersz tabeli bywa cięższy od pięciu linii listy), a bajtów nie porównywał z limitem
  nikt, bo limit ich nie znał.
- **Zasada:** limit zapisuj w **tej samej jednostce**, w której liczy go mechanizm kontrolny, i wskaż
  w specyfikacji komendę, która go sprawdza. Jednostka bez licznika to życzenie, nie limit.
- **Źródło:** przegląd zamykający E3 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20) — nie korekta
  użytkownika.

### L-0054 — Instrument z wyrażeniem regularnym zapisuj do pliku, nie podawaj przez `-e` · 2026-08-20 · ZWINIĘTA 2026-08-20

- **Trigger:** dwa punkty weryfikacji tego etapu dały fałszywy negatyw, bo wzorce przekazane
  w `node -e` przez powłokę straciły ukośniki odwrotne: raz przerwał je błąd składni, raz —
  gorzej — instrument policzył „brak adnotacji" tam, gdzie adnotacje były w pliku.
- **Przyczyna:** ukośnik odwrotny przechodzi przez dwie warstwy cytowania (powłoka, potem parser
  JS), a liczba potrzebnych powtórzeń różni się między nimi. Błąd nie zgłasza się jako błąd —
  wzorzec po prostu przestaje pasować.
- **Zasada:** instrument weryfikacyjny zawierający wyrażenie regularne albo ukośnik odwrotny
  zapisujesz do pliku `.js` i uruchamiasz jako plik. `node -e` zostaw dla jednolinijkowców bez
  metaznaków. Do każdego takiego instrumentu dokładaj kontrolę „test nie jest pusty" — przypadek,
  który **musi** trafić.
- **Źródło:** przegląd zamykający E3 planu OPTYMALIZACJA_KONTEKSTU (2026-08-20) — nie korekta
  użytkownika.
