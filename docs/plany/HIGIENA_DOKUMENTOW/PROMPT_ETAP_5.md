# PROMPT_ETAP_5 — Ryzyka i ustawienia schodzą do archiwum

Plan: HIGIENA_DOKUMENTOW • Etap: **E5 z E6** • Wygenerowano: 2026-09-01 (autor: Opus 5, w rytuale
„Na koniec" E4) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Materiał pomiarowy.** Ten etap ma materiał **w cudzym projekcie**, bo tutejsza sekcja ryzyk jest
> już po kuracji (11,7 KB przy progu cząstkowym 12 KB `FAKT`, 4 ryzyka otwarte). Dziennik PolyFlow
> wyciągniesz bez `--add-dir` jednym poleceniem:
> `git -C "C:/Users/Lukasz/Desktop/PolyFlow" show 9fcf433:docs/DZIENNIK.md > "$TEMP/e5/polyflow.md"`
> — tam sekcja „Stan otwartych ryzyk" waży **38,6 KB przy progu 12 KB** `FAKT` (zmierzone w E4).
> Ustawienia tego samego projektu: `git -C … show 9fcf433:docs/USTAWIENIA.md`. Pomiar prowadź
> **na kopiach poza repozytorium**, instrumentem w `%TEMP%` — E1–E4 pokazały, że to wystarcza.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (4 wiersze, w tym dwa `OTWARTE ŚWIADOMIE`), sekcja „Czeka na człowieka" (1 pozycja) + ostatni wpis (E4) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcja 5 (poprawki 5 i 6 — „Ryzyka chudną bez znikania", „Ustawienia dostają rotację"), sekcja 6 (zakres E5), sekcja 7 (**ryzyko 5** — parafraza zamiast cytatu), sekcja 8 (przypadki „Ryzyko ZMITYGOWANE, ale jego komórka jest krótka" i „Rotacja ustawień trafia na wiersz czytany maszynowo") |
| `core/templates/SPEC_DZIENNIK.md` | sekcja o tabeli ryzyk: statusy, limit **800 znaków** komórki „Mitygacja" i komenda, która go liczy |
| `core/templates/SPEC_ARCHIWUM.md` | procedura dwufazowa z sumą kontrolną, rotacja ryzyk `ZAMKNIĘTE` (jest), próg liczony ponad nietykalnymi, ścieżki i nazewnictwo plików archiwum |
| `core/templates/SPEC_USTAWIENIA.md` | struktura pliku, sekcja „Ustawienia wycofane", **wiersze czytane maszynowo** (cztery — te nie schodzą nigdy) i sekcja „Katalog progów" z E4, do której dopiszesz progi tego etapu |
| `core/process/session-signals.js` | `dokumentyPonadProgiem` i `PROGI_ROTACJI_DOMYSLNE` (ok. linia 345–595) — tu mieszka pomiar sekcji ryzyk; ustawienia nie mają dziś żadnego progu |
| `adapters/claude-code/skills/relai-core/SKILL.md` | krok 2 rytuału zamknięcia — sekcja „Ryzyka (od 1.6.0) są jedynym wyjątkiem od ciągłości"; procedurę kompresji dopisujesz obok, nie zamiast |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **`ZMITYGOWANE`, `PRZYJĘTE ŚWIADOMIE`, `ZAWĘŻONE` i `ZMATERIALIZOWAŁO SIĘ` nie są zamknięciem**
  (`SPEC_ARCHIWUM.md`). Wiersz takiego ryzyka **zostaje w żywej tabeli** — do archiwum schodzi
  wyłącznie **historia z jego komórki „Mitygacja"**, nigdy cały wiersz. Rotacja wierszy dotyczy
  tylko statusu `ZAMKNIĘTE` i działa od 1.6.0; jej nie ruszasz.
- **Zdanie stanu w żywej komórce jest cytatem, nie streszczeniem** (ryzyko 5, sekcja 7 planu).
  Agent nie pisze go od siebie — bierze ostatnie zdanie komórki. Parafraza jest tu defektem,
  nie uproszczeniem.
- **Procedura jest ta sama co przy dzienniku:** suma kontrolna fragmentu → zapis archiwum → odczyt
  **z dysku** → porównanie → dopiero potem przycięcie. Sumy różne → STOP i ani jednej zmiany
  w żywym pliku. Drugiego mechanizmu nie piszesz.
- **Krótka komórka nie jest powodem do niczego** (sekcja 8 planu): kompresja rusza dopiero, gdy
  **sekcja przekracza swój próg** *i* **komórka przekracza 800 znaków**. Wiek bez objętości nie
  uruchamia nic.
- **Wiersze czytane maszynowo nie schodzą nigdy** — `Profil projektu`, `Rotacja dokumentów`,
  `Budżet startu sesji`, `Przegląd spraw człowieka` i `Język projektu`, niezależnie od wieku i od
  tego, czy stoją w sekcji „Ustawienia wycofane". Ich nieobecność wycisza mechanizmy, które je
  czytają — to ten sam defekt, który przez całą budowę trzymał reguły profilu wyłączone.
- **Rotacja ryzyk nie dokłada własnego komunikatu** (L-0049) i **limit „Zasad aktywnych" zostaje
  przy swoim adresie** (krok 1 rytuału zamknięcia). Jeden problem, jeden komunikat.
- **Cisza poniżej progu jest nienaruszalna** — to test regresji każdego etapu tego planu, nie miła
  cecha.
- **Granica zakresu:** podbicie wersji do 1.7.0, `/relai-update` obu projektów i pomiar pełnego
  startu sesji na RelAI i PolyFlow — **E6**. W tym etapie nie dotykasz żadnej z tych rzeczy
  i niczego z nich nie obiecujesz w dokumentach.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, plugin zainstalowany globalnie w tej samej wersji. Plan
HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01; **E1, E2, E3 i E4 zamknięte tego samego dnia**.

**Co dały E1–E4 i co z tego wynika dla E5.** Rotacja rusza (E1), mówi, gdy stoi (E2), sprawa
człowieka starsza niż 30 dni wymusza decyzję (E3), a od E4 **każdy próg ma adres**: raport startu
wymienia dokument albo sekcję ponad własnym progiem wraz z nazwą procedury, a `SPEC_USTAWIENIA.md`
ma sekcję „Katalog progów" z kolumną „Adres egzekwowania". Katalog wypisuje dziś **dwa progi bez
automatu** — i jeden z nich, **limit 800 znaków komórki „Mitygacja"**, jest dokładnie tym, co ten
etap ma uruchomić. Drugi (propozycja kompresji lekcji) zostaje bez zmian.

Pomiar warstwy startowej tego repozytorium `FAKT` (2026-09-01, po E4):

```
CLAUDE.md                     4,5 KB / prog 10 KB
docs/STATE.md                17,7 KB / prog 12 KB   # ponad progiem czastkowym, suma nadal miesci sie w budzecie
docs/DZIENNIK.md (ryzyka)    11,7 KB / prog 12 KB   # sekcja ryzyk + "Czeka na czlowieka" + ostatni wpis
docs/LEKCJE.md (zasady)       8,0 KB / prog 30 KB
docs/USTAWIENIA.md            3,0 KB / prog  6 KB   # 15 wierszy zywych + 2 wycofane
STATUS.md planu               5,1 KB / prog 10 KB
suma                         50,0 KB / budzet 80 KB  -> raport milczy
```

```
docs/DZIENNIK.md                     # 147,7 KB / prog 150 KB; 4 ryzyka otwarte, komorki 727-744 znakow
docs/archiwum/ryzyka/                # RYZYKA_2026-08-21.md — 6 ryzyk ZAMKNIETYCH, suma 4b370c3e2b31c6ba
docs/archiwum/{dziennik,lekcje,plany}/  # trzy istniejace scieżki archiwum; katalogu ustawien NIE ma
core/templates/SPEC_DZIENNIK.md      # limit 800 znakow + komenda liczaca; brak procedury kompresji
core/templates/SPEC_USTAWIENIA.md    # "Ustawienia wycofane" jako sposob na czytelnosc; brak rotacji
core/templates/SPEC_ARCHIWUM.md      # rotacja ryzyk ZAMKNIETYCH; brak sciezki dla ustawien
core/process/session-signals.js      # dokumentyPonadProgiem: dziennik, lekcje, STATE, 2 sekcje
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** procedury kompresji komórki „Mitygacja"
(dziś limit 800 znaków ma tylko komendę sprawdzającą i żadnego mechanizmu); ścieżki
`docs/archiwum/ustawienia/` i reguły, co i kiedy tam schodzi; rozstrzygnięcia, czym staje się
sekcja „Ustawienia wycofane", gdy ciężar zdejmuje archiwum.

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
   wcześniej nie wróci później. **Filtr odsiewający „to nie jest przypadek do sprawdzenia" ma
   wyjątek dla linii mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną
   kontrolę na wyjściu — jedna kontrola przechodzi zielono, gdy zniknął przypadek, którego nie
   sprawdza. Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
   „sprawdzone inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068)
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

1. **`core/templates/SPEC_DZIENNIK.md`, kompresja komórki „Mitygacja"** — procedura dla ryzyka
   o statusie `ZMITYGOWANE` albo `PRZYJĘTE ŚWIADOMIE`, którego komórka **przekracza 800 znaków**,
   gdy **sekcja ryzyk** jest ponad swoim progiem cząstkowym. Historia komórki schodzi do
   `docs/archiwum/ryzyka/` **bajt w bajt**, tą samą procedurą dwufazową z sumą kontrolną; w żywej
   tabeli zostaje wiersz z **cytatem ostatniego zdania** komórki i odsyłaczem. Ryzyko pozostaje
   otwarte i widoczne przy każdym starcie. Wartość `N` dni bezruchu komórki — jeśli plan jej
   wymaga — czytasz z planu, nie wymyślasz.
2. **`core/templates/SPEC_ARCHIWUM.md`** — ścieżka i nazewnictwo dla historii komórek („Ścieżki
   i nazewnictwo") oraz miejsce tej operacji wobec dwóch istniejących wejść rotacji. To **nie jest**
   trzecie wejście i nie dostaje własnego komunikatu (L-0049).
3. **`core/templates/SPEC_USTAWIENIA.md`, rotacja ustawień** — `docs/archiwum/ustawienia/` z regułą,
   co schodzi i kiedy, oraz rozstrzygnięcie, czym po tej zmianie jest sekcja „Ustawienia wycofane"
   (zostaje jako sposób na czytelność; ciężar zdejmuje archiwum). **Wiersze czytane maszynowo nie
   schodzą nigdy** — wypisz je z nazwy w treści reguły, nie odsyłaczem.
4. **Katalog progów** (sekcja z E4 w `SPEC_USTAWIENIA.md`) — progi dotknięte tym etapem dostają
   adres egzekwowania; wiersz „komórka »Mitygacja« — **brak automatu**" zmienia się na wiersz
   z adresem. Katalog zostaje **rejestrem**: wartości domyślne nie przenoszą się do niego.
5. **`core/process/session-signals.js`** — **tylko jeśli** etap wprowadza próg czytany maszynowo
   (np. rozmiar `USTAWIENIA.md` albo wiek komórki). Nie ma takiego progu → pliku nie dotykasz
   i mówisz o tym wprost we wpisie.
6. **Oba adaptery** — procedura kompresji komórki i rotacji ustawień wchodzi do kroku 2 rytuału
   zamknięcia w `adapters/claude-code/skills/relai-core/SKILL.md`
   i `adapters/cursor/rules/relai-core.mdc`. **Limitu „Zasad aktywnych" nie ruszasz.**

Poza zakresem tego etapu, choć kusi: **wykonanie kompresji albo rotacji na tym repozytorium**
(mechanizm ma być gotowy, użycie należy do rytuału zamknięcia), podbicie wersji, `/relai-update`
i pomiar pełnego startu na obu projektach — **E6**.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Obie wersje w jednym przebiegu** (zasada 4): sekcja ryzyk PolyFlow (**38,6 KB przy progu
      12 KB** `FAKT`) po kompresji schodzi **poniżej 12 KB**, a wszystkie ryzyka **nadal są
      widoczne w żywej tabeli** — wypisz liczbę wierszy przed i po; muszą być równe.
- [ ] **Dowód, że treść nie zginęła:** suma kontrolna przeniesionych fragmentów policzona przed
      przycięciem i odczytana **z pliku archiwum z dysku** — zgodna. Rozjazd sumy zatrzymuje
      operację, a żywy plik zostaje nietknięty (pokaż także ten wariant).
- [ ] **Zdanie stanu jest cytatem, nie parafrazą** (ryzyko 5): dla każdej skompresowanej komórki
      pokaż, że zdanie w żywej tabeli występuje **dosłownie** w treści archiwum.
- [ ] **Krótka komórka nie jest ruszana** (sekcja 8 planu): ryzyko `ZMITYGOWANE` z komórką poniżej
      800 znaków zostaje bez zmian — dowód negatywny, czyli pierwotne brzmienie komórki po
      przebiegu.
- [ ] **Wiersz czytany maszynowo nie schodzi do archiwum ustawień**: plik z wierszami
      `Rotacja dokumentów`, `Budżet startu sesji`, `Przegląd spraw człowieka` i `Profil projektu`
      w sekcji „Ustawienia wycofane" po rotacji nadal je zawiera, a `startCost`
      i `sprawyPrzeterminowane` zwracają na nim to samo co przed nią.
- [ ] **Cisza poniżej progu**: to repozytorium (sekcja ryzyk 11,7 KB / 12 KB, ustawienia 3,0 KB)
      po przebiegu nie produkuje **ani jednego znaku** ani nie zmienia żadnego pliku.
- [ ] **Katalog progów zgadza się ze stanem faktycznym** — każdy wiersz z adresem egzekwowania
      wskazuje mechanizm, który istnieje; wiersze „brak automatu" opisują progi, których naprawdę
      nikt nie liczy. Rozjazd rozstrzygasz co do jednego.
- [ ] **Limit „Zasad aktywnych" nadal ma jeden adres** — `git grep` pokazuje go w kroku 1 rytuału
      zamknięcia w obu adapterach i nigdzie indziej.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z linią autora w formacie
      `RelAI (<model>) + <git config user.name>`; `docs/STATE.md` nadpisany.
- [ ] Brak plików tymczasowych i katalogów testowych w repozytorium (`git status --short` bez
      nieoczekiwanych pozycji).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E5 → `ZREALIZOWANY <data>`, E6 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_6.md` w kolumnie `Prompt`, jedna linia w dzienniku
   wdrożenia. Sekcja „Odnogi" — sprawdź, czy któraś nie wróciła jako `OTWARTA`.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   „Stan otwartych ryzyk" — **R5 zostaje otwarte** do zamknięcia planu, a jego komórka „Mitygacja"
   dostaje odsyłacz do tego etapu (limit 800 znaków jest twardy; dziś zajęte 744). **Uwaga: to jest
   pierwszy etap, w którym Twoja własna komórka podlega mechanizmowi, który budujesz** — jeśli
   sekcja ryzyk przekroczy próg, zastosuj procedurę do siebie i opisz to we wpisie. Lekcje z etapu
   → `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne" (limit 15 pozycji jest twardy; dziś
   jest dokładnie 15, więc nowa zasada wchodzi przez rozszerzenie istniejącej).
3. **Bramki manualne** — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka" z Twojego
   wpisu dostaje linię w sekcji „Bramki manualne" `STATUS.md` ze statusem `OTWARTA`, a sprawa,
   która ma czekać dłużej niż tę sesję — również pozycję w sekcji „Czeka na człowieka" dziennika
   (link do **najnowszego** wystąpienia sprawy). Od E3 taka pozycja po 30 dniach sama wróci jako
   pytanie na starcie sesji.
4. **`docs/STATE.md`** — nadpisz stan obszaru ryzyk i ustawień; `README.md` tylko wtedy, gdy
   zmienił się sposób uruchomienia (w tym etapie nie powinien). `docs/STATE.md` ma dziś **17,7 KB
   przy progu cząstkowym 12 KB** i 237 linii przy progu 300 — jeśli rośnie dalej, skróć go zgodnie
   z regułą podmiany zamiast dopisywania.
5. **Wygeneruj `PROMPT_ETAP_6.md`** w tym folderze, wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`:
   materiałem jest sekcja 6 planu (opis E6 — pomiar na realnych projektach i wydanie 1.7.0),
   sekwencja wydania `P-005` z `docs/PULAPKI.md`, **realny stan repozytorium po tym etapie**
   i lekcje, które w tym etapie powstały. E6 jest **ostatnim etapem planu** — zaznacz w prompcie,
   że jego rytuał kończy się **sekwencją zamknięcia planu (D-36)**, nie generacją kolejnego promptu.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
