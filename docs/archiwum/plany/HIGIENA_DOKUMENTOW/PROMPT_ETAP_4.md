# PROMPT_ETAP_4 — Raport startu jako adres progów

Plan: HIGIENA_DOKUMENTOW • Etap: **E4 z E6** • Wygenerowano: 2026-09-01 (autor: Opus 5, w rytuale
„Na koniec" E3) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Materiał pomiarowy.** Ten etap ma materiał **w tym repozytorium**, bez sztucznych plików:
> `docs/DZIENNIK.md` waży dziś **140,2 KB przy progu rotacji 150 KB** (mieści się, ale blisko),
> a `docs/LEKCJE.md` **23,5 KB przy progu 50 KB** — po przeniesieniu „Lekcji zwiniętych" z Aneksu B.
> Drugi materiał, dziennik cudzego projektu, wyciągniesz bez `--add-dir` jednym poleceniem:
> `git -C "C:/Users/Lukasz/Desktop/PolyFlow" show 6a330c1:docs/DZIENNIK.md > "$TEMP/polyflow.md"`
> (tam: dziennik ~118 KB, sekcja ryzyk gruba). Pomiar prowadź **na kopiach poza repozytorium** —
> E1, E2 i E3 pokazały, że to wystarcza, a instrument budujący sztuczne projekty RelAI w `%TEMP%`
> jest w tym etapie wzorcem do powtórzenia.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk", sekcja „Czeka na człowieka" (1 pozycja) + ostatni wpis (E3) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcja 5 (poprawka 4 — „Raport startu dostaje drugą linię"), sekcja 6 (zakres E4), sekcja 7 (**ryzyko 3** i jego mitygacja), sekcja 8 (przypadek „same pozycje nietykalne ważą więcej niż próg"), **Aneks B** |
| `core/templates/SPEC_USTAWIENIA.md` | wiersze `Budżet startu sesji`, `Rotacja dokumentów`, `Przegląd spraw człowieka` — **trzy miejsca, w których progi już mieszkają**; katalog progów ma je zebrać, nie zdublować |
| `core/templates/SPEC_LEKCJE.md` | sekcje o kompresji („plik przekracza 30 KB", „sekcja sama urośnie ponad 30 KB") i o rotacji lekcji — **to jest próg sekcji, którego dziś nikt nie liczy** |
| `core/templates/SPEC_ARCHIWUM.md` | progi rotacji dokumentów, waga całkowita = część rotowalna + dolna granica osiągalna (E2) |
| `core/process/session-signals.js` | `PROGI_DOMYSLNE`, `CZLONY`, `progiZKomorki`, `startCost`, `startCostReport` (ok. linia 490–635) — tu dokładasz pomiar dokumentów spoza budżetu i drugi wyzwalacz |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Limit «Zasad aktywnych» — jedyny adres egzekwowania" — **tego adresu nie ruszasz** |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Limit „Zasad aktywnych" zostaje przy swoim adresie** (krok 1 rytuału zamknięcia sesji, w obu
  adapterach). Nie przenosisz go do raportu startu i nie dokładasz drugiego adresu. Jeden problem,
  jeden komunikat (L-0036, L-0049). To jest zapisane w planie **dwa razy** — w sekcji 5 i w Aneksie
  B — bo jest dokładnie tą rzeczą, którą kusi „przy okazji" scalić.
- **Limit sześciu linii raportu zostaje** (ryzyko 3, sekcja 7 planu). Rozszerzenie wyzwalacza ma
  nie zamienić ciszy w szum.
- **Pozycja bez procedury nie wchodzi do listy** — dokument wymieniany w raporcie zawsze z nazwą
  procedury, która go odchudza. Bez procedury raport tylko marudzi.
- **Projekt w normie dostaje zero znaków.** To jest test regresji tego etapu, nie miła cecha:
  cisza poniżej progu jest nienaruszalna.
- **Aneks B jest wiążący:** zakres obejmuje **progi sekcji wewnątrz dokumentu** (nie tylko progi
  dokumentów) oraz **jawny katalog progów** — jedno miejsce wypisujące wszystkie progi, jakie RelAI
  zna. Próg nieujęty w katalogu nie ma właściciela.
- **Wyzwalaczem raportu przestaje być sama suma** — dochodzi próg cząstkowy i próg spoza budżetu.
  Ale wyzwalacze pozostają **rozłączne w komunikacie**: jedna linia o budżecie, jedna o dokumentach
  ponad progiem rotacji. Nie mieszasz ich w jedno zdanie.
- **`sprawyPrzeterminowane` i jego raport (E3) mają własny wyzwalacz i własny blok.** Nie wciągasz
  go do raportu budżetu i nie robisz z niego siódmej pozycji.
- **Granica zakresu:** rotacja ryzyk i ustawień do archiwum — **E5**. Podbicie wersji do 1.7.0,
  `/relai-update` i pomiar na realnych projektach — **E6**. W tym etapie nie dotykasz żadnej z tych
  rzeczy i niczego z nich nie obiecujesz w dokumentach.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, plugin zainstalowany globalnie w tej samej wersji. Plan
HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01; **E1, E2 i E3 zamknięte tego samego dnia**.

**Co dały E1–E3 i co z tego wynika dla E4.** Rotacja rusza (E1) i mówi, gdy stoi (E2). Sprawa
człowieka starsza niż 30 dni wymusza decyzję na starcie (E3) — i to jest **trzeci mechanizm
z własnym wyłącznikiem, własnym progiem i własnym blokiem w kontekście startu**. Czego nadal nie
ma: **jednego miejsca, które wie, jakie progi w ogóle istnieją**. `startCost` mierzy sześć pozycji
warstwy startowej i milczy o dzienniku jako dokumencie; `startCostReport` odzywa się **wyłącznie**
przy przekroczeniu sumy 80 KB, więc `LEKCJE.md` ważące 52 KB przy progu 50 KB nie odezwałoby się
ani razu — zdarzyło się to realnie 2026-09-01 (Aneks B).

```
core/templates/SPEC_USTAWIENIA.md        # progi budzetu startu + progi rotacji + prog przegladu spraw
core/templates/SPEC_LEKCJE.md            # prog kompresji 30 KB dla pliku I dla sekcji "Lekcje zwiniete"
core/templates/SPEC_ARCHIWUM.md          # progi rotacji dokumentow, waga calkowita/rotowalna/dolna granica
core/templates/SPEC_DZIENNIK.md          # limit 800 znakow komorki "Mitygacja" — kolejny prog bez katalogu
core/process/session-signals.js          # startCost (6 pozycji), startCostReport (wyzwalacz: suma)
core/tools/validate-adapters.js          # walidator spojnosci rdzen <-> adaptery
adapters/claude-code/skills/relai-core/SKILL.md    # limit "Zasad aktywnych" — adres NIE do ruszania
adapters/cursor/rules/relai-core.mdc               # ta sama tresc po angielsku
docs/DZIENNIK.md                         # 140,2 KB / prog 150 KB
docs/LEKCJE.md                           # 23,5 KB / prog 50 KB; sekcja "Lekcje zwiniete" po przeniesieniu
docs/STATE.md                            # 224 linie / prog 300
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** pomiaru dokumentów spoza warstwy startowej
w `startCost`; drugiego wyzwalacza raportu (próg cząstkowy, próg dokumentu, próg sekcji); drugiej
linii raportu z nazwą procedury odchudzającej; progów sekcji jako wartości czytanej maszynowo;
jawnego katalogu progów w jednym dokumencie.

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
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`** —
   `\w` bez flagi `u` to `[A-Za-z0-9_]`, więc wzorzec przechodzi na formach bez ogonków i odpada
   na realnym dokumencie; wynik zawyżony jest tak samo podejrzany jak zerowy. (L-0025, L-0035,
   L-0048, L-0066)
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
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. (L-0033, L-0038, L-0057, L-0062, L-0067)
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

1. **`core/process/session-signals.js`, pomiar dokumentów spoza budżetu** — `startCost` (albo
   funkcja obok niego) mierzy także **całe dokumenty** podlegające rotacji: `DZIENNIK.md`,
   `LEKCJE.md`, `STATE.md`, i porównuje je z progami rotacji z wiersza `Rotacja dokumentów`.
   To są inne progi niż progi cząstkowe budżetu i **nie sumują się** do 80 KB — dokument nad progiem
   rotacji jest osobnym faktem. Brak wiersza rotacji albo wartość nierozpoznana → tej części nie
   liczysz i nie mówisz o niej (zasada 7).
2. **`core/process/session-signals.js`, progi sekcji** (Aneks B) — sekcja wewnątrz dokumentu ma
   własny próg: „Lekcje zwinięte" 30 KB (`SPEC_LEKCJE.md`), sekcja „Stan otwartych ryzyk" — próg
   z budżetu. Wartości czytane maszynowo, z kotwicą i zamkniętą listą brzmień; próg nierozpoznany
   znaczy cisza. **Nie wymyślasz nowych progów** — zbierasz te, które już są zapisane
   w specyfikacjach.
3. **`startCostReport`, drugi wyzwalacz i druga linia** — raport odzywa się przy przekroczeniu
   **sumy** (jak dziś) **albo** przy dokumencie/sekcji ponad własnym progiem. Wypisuje wtedy
   **osobno**: pozycje ponad progiem cząstkowym budżetu i dokumenty/sekcje ponad progiem rotacji —
   każdy z **nazwą procedury**, która go odchudza (rotacja dziennika, rotacja lekcji, kompresja
   „Lekcji zwiniętych", skrócenie `STATE.md`). Limit **sześciu linii** zostaje; pozycja bez
   procedury nie wchodzi do listy. Projekt w normie: **zero znaków**.
4. **Jawny katalog progów** (Aneks B) — jedno miejsce wypisujące wszystkie progi, jakie RelAI zna:
   progi budżetu startu, progi rotacji dokumentów, progi sekcji, limit 800 znaków komórki
   „Mitygacja", limit 15 „Zasad aktywnych", `N` przeglądu spraw człowieka. Przy każdym: gdzie
   mieszka wartość, kto go czyta, co się dzieje po przekroczeniu i **czy ma adres egzekwowania**.
   Miejsce wybierasz sam i uzasadniasz jednym zdaniem — kandydaci: nowa sekcja w
   `SPEC_USTAWIENIA.md` albo osobna specyfikacja. Katalog jest **rejestrem, nie drugim źródłem
   prawdy**: wartości domyślne zostają tam, gdzie są dziś, a katalog do nich odsyła.
5. **Oba adaptery** — jeśli raport zyskuje nową linię, procedura reakcji na nią wchodzi do
   `adapters/claude-code/skills/relai-core/SKILL.md` i `adapters/cursor/rules/relai-core.mdc`.
   **Limitu „Zasad aktywnych" nie ruszasz** — zostaje w kroku 1 rytuału zamknięcia.

Poza zakresem tego etapu, choć kusi: rotacja ryzyk i ustawień do archiwum (E5), kompresja komórki
„Mitygacja" (E5), podbicie wersji (E6), **wykonanie rotacji albo kompresji na tym repozytorium** —
raport ma o nich powiedzieć, a nie wykonać je za człowieka.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Dwa wyzwalacze pokazane obiema wersjami w jednym przebiegu** (zasada 4): projekt
      mieszczący się w budżecie, ale z dokumentem ponad progiem rotacji → raport **pada**; ten sam
      projekt z dokumentem pod progiem → **zero znaków**. Wypisane obok siebie.
- [ ] **Test regresji ciszy** (ryzyko 3): to repozytorium w stanie na dziś (start 35 KB / 80 KB,
      dziennik 140,2 / 150 KB, lekcje 23,5 / 50 KB) dostaje z hooka **zero linii** raportu budżetu.
      Zmierzone realnym uruchomieniem hooka, nie samą funkcją.
- [ ] **Przypadek z Aneksu B odtworzony**: `LEKCJE.md` w stanie sprzed przeniesienia (52 260 B,
      sekcja „Lekcje zwinięte" 35 787 B) → raport wymienia **plik i sekcję**, każde z nazwą
      procedury. Materiał odtwórz z gita (`git show <commit>:docs/LEKCJE.md`), nie z pamięci.
- [ ] **Limit sześciu linii nie pęka** przy projekcie, w którym przekroczone są jednocześnie: suma
      budżetu, dwa progi cząstkowe, dwa progi dokumentów i jeden próg sekcji. Wypisz zmierzoną
      liczbę linii.
- [ ] **Próg nierozpoznany znaczy cisza** (zasada 7): wiersz rotacji z wartością spoza listy →
      część „dokumenty ponad progiem" nie pada w ogóle, a raport budżetu działa dalej.
- [ ] **Katalog progów jest kompletny** — `git grep` po liczbach progów (`80`, `150`, `50`, `40`,
      `30`, `12`, `800`, `15`, `300`) w `core/templates/` i `core/process/` nie zostawia progu,
      którego katalog nie wymienia. Rozjazd rozstrzygasz co do jednego.
- [ ] **Limit „Zasad aktywnych" nadal ma jeden adres** — `git grep` pokazuje go w kroku 1 rytuału
      zamknięcia w obu adapterach i **nigdzie** w raporcie startu.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z linią autora w formacie
      `RelAI (<model>) + <git config user.name>`; `docs/STATE.md` nadpisany.
- [ ] Brak plików tymczasowych i katalogów testowych w repozytorium (`git status --short` bez
      nieoczekiwanych pozycji).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E4 → `ZREALIZOWANY <data>`, E5 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_5.md` w kolumnie `Prompt`, jedna linia w dzienniku
   wdrożenia. Sekcja „Odnogi" — sprawdź, czy któraś nie wróciła jako `OTWARTA`.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   „Stan otwartych ryzyk" — **R5 zostaje otwarte**, a jego komórka „Mitygacja" dostaje odsyłacz do
   tego etapu (limit 800 znaków jest twardy; dziś zajęte 727). Lekcje z etapu → `docs/LEKCJE.md`
   + odświeżony destylat „Zasady aktywne" (limit 15 pozycji jest twardy; dziś jest dokładnie 15,
   więc nowa zasada wchodzi przez rozszerzenie istniejącej, nie przez dopisanie szesnastej).
3. **Bramki manualne** — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka" z Twojego
   wpisu dostaje linię w sekcji „Bramki manualne" `STATUS.md` ze statusem `OTWARTA`, a sprawa,
   która ma czekać dłużej niż tę sesję — również pozycję w sekcji „Czeka na człowieka" dziennika
   (link do **najnowszego** wystąpienia sprawy — reguła z E1). Pamiętaj, że od E3 taka pozycja
   po 30 dniach sama wróci jako pytanie na starcie sesji.
4. **`docs/STATE.md`** — nadpisz stan obszaru progów i raportu startu; `README.md` tylko wtedy, gdy
   zmienił się sposób uruchomienia (w tym etapie nie powinien). Jeśli `docs/USTAWIENIA.md` tego
   projektu dostał nowy wiersz progowy, pamiętaj, że zapis przechodzi przez hook
   `config-protection` i wymaga potwierdzenia — bez potwierdzenia pokazujesz treść wiersza zamiast
   odpuszczać go po cichu.
5. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`:
   materiałem jest sekcja 6 planu (opis E5 — ryzyka i ustawienia schodzą do archiwum), przypadek
   brzegowy „Ryzyko ZMITYGOWANE, ale jego komórka jest krótka" z sekcji 8, **realny stan
   repozytorium po tym etapie** i lekcje, które w tym etapie powstały.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
