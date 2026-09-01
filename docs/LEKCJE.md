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
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. (L-0034, L-0049, L-0053, L-0060)
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
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. (L-0004, L-0008, L-0020, L-0061)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. (L-0033, L-0038,
    L-0057, L-0062)
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

### L-0060 — Blokada przeniesiona na nowy adres nadal siada w najgorszym miejscu · 2026-08-21 · AKTYWNA

- **Trigger:** mechanizm z E2 miał odblokować rotację w PolyFlow. Po wyprowadzeniu 109 otwartych
  linii do sekcji „Czeka na człowieka" zakres rotacji wyszedł **zerowy** — a po zamknięciu dwóch
  spraw decyzją właściciela: **5 wpisów z 97**. Dziennik został na 552 KB przy progu 150 KB.
- **Przyczyna:** dwie reguły z różnych specyfikacji złożyły się w pułapkę. `SPEC_DZIENNIK.md` każe
  linkować pozycję do **najstarszego** wpisu źródłowego, a `SPEC_ARCHIWUM.md` czyni wpis linkowany
  nietykalnym; zakres rotacji jest ciągły od najstarszej pozycji. Każda sprawa sięgająca początku
  projektu zatrzymuje więc rotację całego dziennika — czyli dokładnie tam, gdzie kosztuje najwięcej.
  Żadna z reguł osobno nie jest błędna i żadna nie została zmierzona w parze.
- **Zasada:** przenosząc blokadę pod nowy adres, policz na realnym pliku, **ile pozycji przechodzi
  po zmianie** — bo blokada zmienia adres, a nie zasięg. Reguła wskazująca „najstarszy element"
  w mechanizmie, który zaczyna od najstarszego, jest kandydatem na zatkanie z definicji.
- **Źródło:** E5 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21), migracja PolyFlow; odnoga
  BLOKADA_ROTACJI.

### L-0061 — Podbicie wersji objęło manifesty, ominęło treść komendy · 2026-08-21 · AKTYWNA

- **Trigger:** `/relai-update` w **wydanej** wersji 1.6.0 deklarowała wersję docelową **1.5.0**
  w czterech miejscach, w tym w wierszu „marker wersji". Uruchomiona dosłownie na PolyFlow
  (marker 1.5.2) **cofnęłaby** jego wersję. Ten sam ślad siedział w nagłówkach obu skilli
  i w `SPEC_KOMENDY.md`, z której generowany jest nagłówek `KOMENDY.md` w cudzym projekcie.
- **Przyczyna:** walidator spójności porównuje numery wersji w **trzech plikach manifestów**
  (`core/MANIFEST.json`, `plugin.json`, `marketplace.json`) i milczy o treści komend, skilli
  i specyfikacji. Grep po starym numerze po podbiciu (zasada 10) nie został wykonany.
- **Zasada:** numer wersji w **treści** komendy albo specyfikacji jest wartością wykonawczą, nie
  ozdobą — po podbiciu przepuść repo grepem po starym numerze i **rozstrzygnij każde trafienie**,
  dzieląc je na wzmianki historyczne („od 1.5.0…") i deklaracje stanu docelowego. Kontrola, która
  patrzy tylko na manifesty, nie widzi tej różnicy.
- **Źródło:** E5 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21); rozwinięcie L-0004, L-0008, L-0020.

### L-0062 — Mechanizm czytał strukturę cudzego dokumentu z własnym nawykiem · 2026-08-21 · AKTYWNA

- **Trigger:** po rotacji dziennika PolyFlow pozycja `ryzyka` **urosła** o 3,0 KB. Powód: funkcja
  `ostatniWpis` bierze ostatni nagłówek `###` w pliku, a PolyFlow dopisuje wpisy **na górze** —
  mierzony był więc wpis najstarszy, i to on się zmienił po rotacji.
- **Przyczyna:** kolejność wpisów jest własnością projektu, a rdzeń miał ją zaszytą jako
  założenie („najnowszy jest ostatni"), wzięte z jednego projektu — tego, w którym powstał.
- **Zasada:** mechanizm czytający strukturę dokumentu ustala kierunek **z danych** (daty
  w nagłówkach), a nie z nawyku autora. Zanim uznasz układ za oczywisty, sprawdź go na drugim
  projekcie — pierwszy zawsze potwierdza własne założenia.
- **Źródło:** E5 planu OPTYMALIZACJA_KONTEKSTU (2026-08-21); pokrewne L-0033, L-0038, L-0057.

## Lekcje zwinięte

Pełne wpisy lekcji, których zasady żyją w destylacie „Zasady aktywne" (kompresja 2026-08-20).
Treść jest kopią bajt w bajt — zmieniony został wyłącznie status w linii nagłówka (D-18).

> Lekcje zwinięte L-0025 … L-0054 (30 lekcji) są w
> [docs/archiwum/lekcje/LEKCJE_L-0025_L-0054.md](archiwum/lekcje/LEKCJE_L-0025_L-0054.md)
> — przeniesione 2026-09-01, suma kontrolna `d7c16fc38575773e`.
