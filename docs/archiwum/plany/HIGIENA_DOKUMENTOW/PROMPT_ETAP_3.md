# PROMPT_ETAP_3 — Sprawa przeterminowana wymusza decyzję

Plan: HIGIENA_DOKUMENTOW • Etap: **E3 z E6** • Wygenerowano: 2026-09-01 (autor: Opus 5, w rytuale
„Na koniec" E2) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Materiał pomiarowy.** Sekcja „Czeka na człowieka" tego repozytorium ma **9 pozycji otwartych**,
> najstarsze z 2026-08-12 — przy `N = 30 dni` część z nich jest przeterminowana **dzisiaj**, więc
> etap ma na czym mierzyć bez sztucznych plików. Drugi materiał, 27 pozycji cudzego projektu,
> wyciągniesz bez `--add-dir` jednym poleceniem:
> `git -C "C:/Users/Lukasz/Desktop/PolyFlow" show 6a330c1:docs/DZIENNIK.md > "$TEMP/polyflow.md"`.
> Pomiar prowadź **na kopiach poza repozytorium** — E1 i E2 pokazały, że to wystarcza.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk", **cała sekcja „Czeka na człowieka" (9 pozycji — to jest materiał tego etapu)** + ostatni wpis (E2) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcja 5 (poprawka 3 — „Sprawa przeterminowana wymusza decyzję"), sekcja 6 (zakres E3), sekcja 7 (ryzyko 2 i jego mitygacja), sekcja 8 (przypadki „pozycja nie ma daty pierwszego wystąpienia" i „sesja nieinteraktywna, a sprawy są przeterminowane"), **Aneks A** |
| `core/templates/SPEC_USTAWIENIA.md` | sekcje „Wiersz to jedna decyzja", „Wiersz `Rotacja dokumentów`" i „Wiersz `Budżet startu sesji`" — **wzorzec, wg którego piszesz nowy wiersz**; tabela „Wiersz \| Czyta go" wymaga uzupełnienia |
| `core/templates/SPEC_DZIENNIK.md` | sekcja „Czeka na człowieka" (format pozycji, reguła linku do najnowszego wystąpienia z E1) — tu dochodzi format adnotacji odroczenia |
| `core/process/session-signals.js` | `komorkaDecyzji`, `progiZKomorki`, `przelacznikRotacji`, `wytnijSekcje`, `NAGLOWEK_CZEKA` (ok. linia 359) — gotowe cegły, z których składasz wykrycie; `startCost` czyta tę sekcję **wyłącznie** jako wagę |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Wyprowadzenie spraw czekających na człowieka" i „Rotacja na starcie sesji" — tam mieszka procedura, którą ten etap rozszerza |
| `adapters/cursor/rules/relai-core.mdc` | ta sama treść po angielsku + sekcja 7 („co Cursor ma zamiast AskUserQuestion") |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **`N = 30 dni`** (Aneks A, 2026-09-01). Propozycja planu brzmiała 90 dni; człowiek wybrał
  trzykrotnie ostrzej i ta wartość jest wiążąca. Nie proponujesz innej i nie robisz z niej „progu
  do kalibracji".
- **Wyłącznik przeglądu jest osobny od rotacji** (Aneks A). `Rotacja dokumentów: wyłączona`
  **nie** wycisza przeglądu spraw człowieka. To dwa niezależne wyłączniki i mają takie zostać —
  tak samo jak budżet startu i rotacja.
- **`N` jest jednocześnie okresem odroczenia.** Odpowiedź „zostawiam" przesuwa sprawę o kolejne
  30 dni i zapisuje **licznik odroczeń**; po trzecim razie raport mówi wprost, od ilu miesięcy
  sprawa jest odkładana (plan, sekcja 5, poprawka 3).
- **Pytania idą partiami po cztery**, aż do wyczerpania listy — nie jedno wielkie pytanie o
  dziewięć spraw i nie dziewięć pytań pod rząd.
- **Sesja nieinteraktywna nie pyta o nic** (plan, sekcja 8): raport wypisuje listę przeterminowanych
  pozycji i na tym kończy. To samo ograniczenie, które obowiązuje rotację na starcie sesji.
- **Pozycja bez daty pierwszego wystąpienia** liczy wiek od **daty wyprowadzenia** i zachowuje
  dopisek „(data pierwotna nieznana)" — nie zgadujesz daty i nie pomijasz pozycji (plan, sekcja 8).
- **Reguła linku z E1 zostaje:** pozycja wskazuje **najnowsze** wystąpienie sprawy, a link jest
  przepinany przy rotacji. Nie dotykasz tej reguły i nie robisz z odroczenia powodu do zmiany linku.
- **Granica zakresu:** druga linia raportu startu, progi cząstkowe dokumentów i katalog progów —
  **E4**. Rotacja ryzyk i ustawień do archiwum — **E5**. Podbicie wersji do 1.7.0 i `/relai-update`
  — **E6**. W tym etapie nie dotykasz żadnej z tych rzeczy i niczego z nich nie obiecujesz
  w dokumentach.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, plugin zainstalowany globalnie w tej samej wersji. Plan
HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01; **E1 i E2 zamknięte tego samego dnia**.

**Co dały E1 i E2 i co z tego wynika dla E3.** Sekcja „Czeka na człowieka" jest już jedynym adresem
spraw człowieka i linkuje do **najnowszego** wystąpienia sprawy (E1). Rotacja, gdy stoi, potrafi
powiedzieć na czym i ile to kosztuje (E2). Czego nadal nie ma: **niczego, co patrzy na wiek
pozycji**. Dziewięć pozycji z 2026-08-12 … 2026-08-20 czeka od kilkunastu dni i żaden mechanizm
się nimi nie interesuje — sekcja jest czytana przy każdym starcie wyłącznie jako **waga** w budżecie
(`startCost`, pozycja `ryzyka`).

```
core/templates/SPEC_USTAWIENIA.md        # wiersze maszynowe: Rotacja dokumentow, Budzet startu sesji
core/templates/SPEC_DZIENNIK.md          # sekcja "Czeka na czlowieka": format pozycji, link do najnowszego wystapienia
core/templates/SPEC_ARCHIWUM.md          # prog ponad nietykalnymi + komunikat zablokowanej rotacji (E2)
core/process/session-signals.js          # startCost/startCostReport, ostatniWpis, przelacznikRotacji, wytnijSekcje
core/tools/validate-adapters.js          # walidator spojnosci rdzen <-> adaptery
adapters/claude-code/skills/relai-core/SKILL.md    # procedury wypisane w tresci (L-0011)
adapters/cursor/rules/relai-core.mdc               # ta sama tresc po angielsku
docs/DZIENNIK.md                         # sekcja "Czeka na czlowieka": 9 pozycji otwartych, 2026-08-12 … 2026-08-20
docs/USTAWIENIA.md                       # wiersze projektu; wiersza "Przeglad spraw czlowieka" NIE MA
CLAUDE.md                                # warstwa zawsze w kontekscie — nosnik zachowania (L-0030)
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** wiersza `Przegląd spraw człowieka`
w specyfikacji ustawień i w tym projekcie; wykrycia pozycji przeterminowanych w
`session-signals.js`; nośnika zachowania w `CLAUDE.md`; procedury pytania partiami po cztery
w obu adapterach; formatu adnotacji odroczenia z licznikiem w `SPEC_DZIENNIK.md`.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości — plik może
urosnąć, prompt nie):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do
   adnotacji „sprawdzone inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". (L-0034, L-0049,
   L-0053, L-0060, L-0065)
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
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044, L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

## Zakres etapu

1. **`core/templates/SPEC_USTAWIENIA.md`, wiersz `Przegląd spraw człowieka`** — nowy wiersz
   maszynowy wg wzorca dwóch istniejących: kotwica na początku komórki `Decyzja`, zamknięta lista
   brzmień wyłącznika, wartość `N` w dniach, **wartość nierozpoznana znaczy cisza** (zasada 7).
   Domyślnie `włączony · 30 dni`. Wiersz dopisujesz też do tabeli „Wiersz | Czyta go" i do listy
   wpisów tworzonych przy inicjalizacji. **Wyłącznik jest osobny od rotacji** — napisz to wprost
   w treści, bo to jest dokładnie ta pomyłka, którą Aneks A wykluczył.
2. **`core/process/session-signals.js`, wykrycie przeterminowanych** — funkcja czytająca sekcję
   „Czeka na człowieka" i zwracająca pozycje starsze niż `N` dni: treść pozycji, data pierwszego
   wystąpienia, wiek w dniach, licznik odroczeń. Brak wiersza w ustawieniach albo wartość
   nierozpoznana → `null` i cisza. Funkcję **eksportujesz**, żeby dała się sprawdzić testem (tak
   jak `ostatniWpis` w E1). Pozycja bez daty → wiek od daty wyprowadzenia, dopisek „(data pierwotna
   nieznana)".
3. **`CLAUDE.md` projektu (nośnik) + oba adaptery (procedura)** — zachowanie ma działać **zawsze**,
   więc mieszka w warstwie obecnej w każdej sesji (zasada 8): jedno zdanie w `CLAUDE.md` szablonu
   dla nowych projektów oraz w `CLAUDE.md` tego repozytorium. Procedura pytania — partiami po
   cztery, z trzema realnymi wyborami (zamknąć / odroczyć o 30 dni / rozstrzygnąć teraz) — wchodzi
   do `adapters/claude-code/skills/relai-core/SKILL.md` i do `adapters/cursor/rules/relai-core.mdc`
   (tam bez `AskUserQuestion`, wg sekcji 7 tamtego pliku).
4. **`core/templates/SPEC_DZIENNIK.md`, format adnotacji odroczenia** — dosłowne brzmienie
   z licznikiem, na wzór adnotacji wyprowadzenia; wariant angielski obok polskiego. Opisz wprost,
   co się dzieje **po trzecim odroczeniu**: raport mówi, od ilu miesięcy sprawa jest odkładana.
   Adnotacja odroczenia **nie jest** rozstrzygnięciem — dopisz ją do listy brzmień, które
   rozstrzygnięciem nie są (`SPEC_ARCHIWUM.md`, sekcja „Jak poznać pozycję rozstrzygniętą"), żeby
   odroczona sprawa nie zaczęła nagle przepuszczać wpisu do archiwum.
5. **Sesja nieinteraktywna** — rozstrzygnij to w treści, nie w kodzie na zapas: pytania nie padają,
   lista przeterminowanych pozycji pada jako raport. Napisz, gdzie ten raport się pojawia, żeby nie
   powstał drugi komunikat obok istniejących (L-0036, L-0049).

Poza zakresem tego etapu, choć kusi: druga linia raportu startu i progi cząstkowe (E4), rotacja
ryzyk i ustawień (E5), podbicie wersji (E6), **rozstrzyganie dziewięciu spraw z sekcji „Czeka na
człowieka" tego repozytorium** — to jest decyzja człowieka, nie robota etapu; mechanizm ma o nie
zapytać, a nie zamknąć je za niego.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Wykrycie policzone na realnym pliku, w obu wariantach, w jednym przebiegu** (zasada 4):
      sekcja „Czeka na człowieka" tego repozytorium (9 pozycji) i dziennik PolyFlow (27 pozycji) —
      dla każdego wypisz, ile pozycji jest przeterminowanych przy `N = 30`, ile przy `N = 90`
      i ile pozycji nie ma daty. Liczby z instrumentu, nie z oka.
- [ ] **Dowód negatywny wyłącznika** (zasada 3): przy `Przegląd spraw człowieka: wyłączony`
      funkcja zwraca `null` i nie produkuje **ani jednego znaku** — pokazane na wyjściu. Przy
      wierszu nieobecnym w pliku — to samo.
- [ ] **Niezależność wyłączników pokazana na danych** (Aneks A): przy `Rotacja dokumentów:
      wyłączona` **i** `Przegląd spraw człowieka: włączony` wykrycie nadal działa — wypisany wynik
      obu wywołań obok siebie.
- [ ] **Wartość nierozpoznana znaczy cisza** (zasada 7): wiersz z wartością `może być` → brak
      wykrycia i jedno zdanie o nierozpoznanej wartości, nie domysł.
- [ ] **Pozycja bez daty** trafia do wyniku z dopiskiem „(data pierwotna nieznana)" i wiekiem
      liczonym od daty wyprowadzenia — pokazane na przypadku dołożonym do materiału (zasada 5:
      przypadek, który **musi** trafić).
- [ ] `SPEC_USTAWIENIA.md`, `SPEC_DZIENNIK.md` i oba adaptery mówią o `N`, o wyłączniku i o
      partiach po cztery **to samo** — sprawdzone czytaniem wszystkich czterech w jednym przebiegu
      tej sesji, nie z pamięci.
- [ ] `git grep -n` po nazwie wiersza `Przegląd spraw człowieka` zwraca trafienia w
      `core/templates/`, `core/process/`, `adapters/claude-code/` i `adapters/cursor/`.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z linią autora w formacie
      `RelAI (<model>) + <git config user.name>`; `docs/STATE.md` nadpisany.
- [ ] Brak plików tymczasowych i katalogów testowych w repozytorium (`git status --short` bez
      nieoczekiwanych pozycji).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E3 → `ZREALIZOWANY <data>`, E4 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_4.md` w kolumnie `Prompt`, jedna linia w dzienniku
   wdrożenia. Sekcja „Odnogi" — sprawdź, czy `REJESTR_ARTEFAKTOW` nadal jest `OTWARTA`.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   „Stan otwartych ryzyk" — **R5 zostaje otwarte**, a jego komórka „Mitygacja" dostaje odsyłacz do
   tego etapu (limit 800 znaków jest twardy; dziś zajęte 794). Lekcje z etapu → `docs/LEKCJE.md`
   + odświeżony destylat „Zasady aktywne" (limit 15 pozycji jest twardy; dziś jest dokładnie 15,
   więc nowa zasada wchodzi przez rozszerzenie istniejącej, nie przez dopisanie szesnastej).
3. **Bramki manualne** — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka" z Twojego
   wpisu dostaje linię w sekcji „Bramki manualne" `STATUS.md` ze statusem `OTWARTA`, a sprawa,
   która ma czekać dłużej niż tę sesję — również pozycję w sekcji „Czeka na człowieka" dziennika
   (link do **najnowszego** wystąpienia sprawy — reguła z E1).
4. **`docs/STATE.md`** — nadpisz stan obszaru spraw człowieka; `README.md` tylko wtedy, gdy zmienił
   się sposób uruchomienia (w tym etapie nie powinien). Jeśli `docs/USTAWIENIA.md` tego projektu
   dostał wiersz `Przegląd spraw człowieka`, pamiętaj, że zapis przechodzi przez hook
   `config-protection` i wymaga potwierdzenia — bez potwierdzenia pokazujesz treść wiersza zamiast
   odpuszczać go po cichu.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`:
   materiałem jest sekcja 6 planu (opis E4 — raport startu jako adres progów) wraz z **Aneksem B**
   (progi sekcji i jawny katalog progów), **realny stan repozytorium po tym etapie** i lekcje, które
   w tym etapie powstały.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
