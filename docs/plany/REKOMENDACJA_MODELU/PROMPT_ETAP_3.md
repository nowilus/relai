# PROMPT_ETAP_3 — Próg świeżości listy modeli i jedno zdanie przypomnienia

Plan: REKOMENDACJA_MODELU • Etap: **E3 z E4** • Wygenerowano: 2026-09-04 (autor: Opus 5, w rytuale
„Na koniec" E2) • Wykonawca: **Opus** (z linii metrycznej `STATUS.md`: „Opus, z ustawień projektu,
D-85")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Sprawdź dostępność `claude -p`, zanim zaplanujesz pomiar** (L-0087). 2026-09-03 działał,
> 2026-09-04 zwrócił `Failed to authenticate: OAuth session expired and could not be refreshed`.
> Jedno najtańsze wywołanie na starcie etapu rozstrzyga, czy punkty weryfikacji opierasz na świeżej
> sesji, czy na uruchomieniu hooka wprost. Wynik sprawdzenia idzie do wpisu — także pozytywny.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/REKOMENDACJA_MODELU/STATUS.md` | tabela etapów, **Bramki manualne** (dwie `OTWARTA`), dziennik wdrożenia |
| `docs/plany/REKOMENDACJA_MODELU/PLAN.html` | sekcje 2 (cel 4 i „czego świadomie nie robimy"), 6 (zakres E3), 7 (ryzyka 4 i 5), 8 (przypadki b1 i b5) oraz **Aneks B** w sekcji 10 |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**M3, M4, M5** dopisane przy E2) + wpis z 2026-09-04 o E2 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `core/templates/SPEC_USTAWIENIA.md` | wzorzec wiersza czytanego maszynowo, sekcja **„Katalog progów"** — tam dochodzi nowa pozycja, i to jest jedyne miejsce, gdzie wartość domyślna progu ma prawo mieszkać |
| `core/process/session-signals.js` | `dataListyModeli()` i `provisionModelList()` (E1) oraz **`artefaktyRobocze()`** jako wzorzec: zamknięta lista brzmień przełącznika, `brakWiersza` → cisza, `nierozpoznana` → jedno zdanie o dozwolonych wartościach |
| `adapters/claude-code/hooks/session-context.js` | miejsce, w którym pada zdanie o liście (linie 158–164) — nowe zdanie o wieku listy staje obok, nie zamiast |
| `adapters/cursor/hooks/session-context.js` | to samo w drugim adapterze; oba mają mówić to samo, bo lista jest tym samym mechanizmem |
| `adapters/claude-code/commands/relai-models.md` | komenda z E2 — przypomnienie ma do niej odsyłać w brzmieniu, którym realnie się ją uruchamia |
| `docs/USTAWIENIA.md` | tu powstaje nowy wiersz; obok stoją wzorce `Rotacja dokumentów`, `Przegląd spraw człowieka`, `Artefakty robocze` |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Sieć wyłącznie w komendzie wywołanej wprost.** Hook startu zostaje w całości lokalny i cichy —
  sekcja 2 planu („czego świadomie nie robimy") oraz mitygacja ryzyka 4. **Odświeżanie bez zgody
  człowieka jest zakazane nawet po upływie progu**: przekroczony próg daje **zdanie**, nigdy
  połączenie.
- **Poniżej progu — zero znaków.** Cisza jest zachowaniem domyślnym każdego progu w RelAI. Projekt
  bez wiersza w `USTAWIENIA.md` (a więc każdy projekt sprzed tej wersji) milczy tak samo jak
  projekt z wierszem `wyłączone` — mechanizm nie zaczyna nagle mówić sam z siebie.
- **Wartość spoza zamkniętej listy brzmień nie milczy** — mówi, co jest dozwolone (L-0025, L-0035).
  Wzorzec do przepisania stoi w `artefaktyRobocze()`: `brakWiersza` → cisza, `nierozpoznana` → jedno
  zdanie z dozwolonymi wartościami.
- **Data nieczytelna albo z przyszłości = brak daty** (przypadek b5 planu, L-0025): mechanizm
  milczy i nie przypomina. `dataListyModeli()` zwraca wtedy pusty łańcuch i tej własności
  **nie zmieniasz**.
- **Wyłącznik jest osobny.** Tak jak przy przeglądzie spraw człowieka i artefaktach roboczych: ten
  próg ma własny wiersz i własny przełącznik, niezależny od rotacji i od budżetu startu.
- **Próg domyślny: 7 dni** (sekcja 6 planu, wiersz E3). Wartość domyślna mieszka
  w `SPEC_USTAWIENIA.md`, a jej kopia wykonawcza w rdzeniu jest **kopią**, nie drugim źródłem
  prawdy — dokładnie jak `PROG_ARTEFAKTOW_MB = 100`.
- **Sygnał ma jednego właściciela** (zasada 8, L-0036). Zdanie o wieku listy pada w hooku startu
  i nigdzie indziej — nie dokładasz go do rytuału zamknięcia ani do skilla planowania.
- **Listy rozróżnia nazwa pliku, nie katalog** (Aneks A): w projekcie leżą
  `.claude/relai/MODELE-claude-code.md` i `.claude/relai/MODELE-cursor.md`. Wiek liczysz dla
  **tej listy, którą kładzie hook wołający**, nie dla obu naraz.
- **Format bloku maszynowego z E1/E2 zostaje bez zmian**, razem z polem `alias` dodanym Aneksem B.
  Ten etap czyta `list-date`, nie przeprojektowuje listy.
- **Granica zakresu:** kontrola modelu w karcie etapu, nazwa spoza listy, zmiany w `SPEC_CLAUDE_MD`
  / `SPEC_STATUS` / `SPEC_PROMPT_ETAPU`, nowe sprawdzenie w walidatorze i **wydanie** to **E4**.
  W tym etapie ich nie dotykasz i nie obiecujesz. `adapters/*/MODELE.md` też zostawiasz — ich
  ostatnia zmiana (Aneks B) była jednorazowa.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-04)

RelAI **1.8.1** w repozytorium i w aplikacji; numeru wersji w E2 **nie podbijano** (należy do E4),
choć komentarze w kodzie mówią „1.9.0". E2 zamknięty tego samego dnia: listę **da się odświeżyć
komendą**, a jej pierwszy wynik trafił do obu adapterów Aneksem B — lista Claude Code niesie aliasy,
lista Cursora ma komplet trzech klas. **Czego nadal nie ma: niczego, co powiedziałoby użytkownikowi,
że lista się zestarzała.** `list-date` jest w pliku i pada przy pytaniu o model, ale nikt go z niczym
nie porównuje.

**Zmiana warunków pracy wobec E2:** `claude -p` **nie działa** — `Failed to authenticate: OAuth
session expired and could not be refreshed`, a `.env` z kluczem API w tym repozytorium nie istnieje.
W E2 pomiar szedł więc przez uruchamianie hooka wprost (payload JSON na stdin) i przez projekty
kontrolne w katalogu roboczym. Sprawdź to ponownie na starcie (L-0087): jeśli logowanie wróciło,
punkty weryfikacji dotyczące zachowania sesji stają się wykonalne wprost.

```
core/process/session-signals.js       # dataListyModeli() l.222 — kotwica ^list-date: RRRR-MM-DD$
                                      #   provisionModelList() l.233 — kopia TYLKO przy braku pliku
                                      #   artefaktyRobocze() l.~1185 — WZORZEC nowego rozpoznania
core/templates/SPEC_USTAWIENIA.md     # wzorzec wiersza + sekcja "Katalog progow" (l.398)
adapters/claude-code/hooks/session-context.js  # l.158-164: zdanie o liscie modeli
adapters/cursor/hooks/session-context.js       # l.144-152: to samo w drugim adapterze
adapters/claude-code/commands/relai-models.md  # komenda z E2, 12. w katalogu komend
adapters/claude-code/MODELE.md        # list-date: 2026-09-04, 4 pozycje, pole alias
adapters/cursor/MODELE.md             # list-date: 2026-09-04, 3 pozycje, zero <TO BE FILLED IN>
docs/USTAWIENIA.md                    # 3 wiersze maszynowe: Rotacja, Przeglad spraw, Artefakty
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** wiersza `Lista modeli` w ustawieniach;
żadnego rozpoznania wieku listy w rdzeniu; żadnego zdania w hookach startu o tym, że lista jest
stara; pozycji w katalogu progów — a **próg nieujęty w katalogu nie ma właściciela**.

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-04)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik.
   (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz.** **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — kryterium arytmetycznie nieosiągalne wraca do człowieka
   jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018, L-0040, L-0051, L-0052,
   L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej; każdy przypadek graniczny ma własną kontrolę na wyjściu.
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty — a **wynik wariantu, który ma przeżyć pomiar, wynosisz
   z katalogu odtwarzanego od razu**; plik brany z katalogu kontrolnego przenosisz z porównaniem
   sumy, nie samym `cp` (L-0086). Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi — ale
   **niedostępność cudzej usługi sprawdzasz ponownie jednym najtańszym wywołaniem**, zanim
   odpiszesz pomiar jako niewykonalny (L-0084), a **datowanie działa w obie strony**: „usługa
   działała wczoraj" też jest hipotezą (L-0087). (L-0032, L-0037, L-0054, L-0055, L-0056,
   L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz. **Próg porównuj do wielkości, którą mechanizm kontroluje**, a sygnał o zatkaniu
   wyzwalaj **różnicą między możliwym a wykonanym**, nie zerem wykonanego. (L-0034, L-0049, L-0053,
   L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`.**
   **Rdzenia szukasz w samym brzmieniu wartości, nie w całej komórce.** **Zamknięta lista ma koszt
   po drugiej stronie i ten koszt mierzysz.** (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — także w treści komend, skilli i specyfikacji. **Zachowanie zmienione, ale jeszcze
    niewydane, mierzysz artefaktem podłożonym lokalnie w projekcie kontrolnym** — hook przez
    `.claude/settings.json`, skill przez `.claude/skills/` pod **inną nazwą** niż wersja z pluginu
    (L-0085). (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca. **Kolejność wpisów
    w dokumencie jest takim samym wariantem.** **Wariantem jest też stan dokumentu wobec własnej
    specyfikacji** — mechanizm sprawdzaj na dokumencie realnego projektu. (L-0033, L-0038, L-0057,
    L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Znak cudzysłowu — także backtick — należy do grupy cudzysłowu,
    nigdy do klasy wartości. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam; przy wyprowadzaniu pozycji jednostką inwentarza
    jest **sprawa**, nie linia. Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź
    **obecności** nowej treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

W tym etapie centralne są zasady **6** (próg porównywany do wielkości, którą mechanizm kontroluje),
**7** (zamknięta lista brzmień, wartość nierozpoznana) i **15** (komunikaty hooków bez polskich
znaków diakrytycznych).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/REKOMENDACJA_MODELU/E3/`.** Wszystko tymczasowe —
projekty kontrolne, listy z podstawionymi datami, instrumenty pomiarowe, wyjścia hooków — powstaje
tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.
Katalog powstaje przy pierwszym zapisie, nie na zapas.

1. **`core/templates/SPEC_USTAWIENIA.md`** — wiersz `Lista modeli` opisany tak jak trzy wiersze
   maszynowe obok: nazwa wiersza, zamknięta lista brzmień przełącznika (`włączone` / `wyłączone`,
   `on` / `off`), człon liczbowy z jednostką (`7 dni`), zachowanie przy braku wiersza i przy
   wartości nierozpoznanej, realny przykład wiersza. Do tego **pozycja w sekcji „Katalog progów"**
   z kompletem sześciu kolumn — w tym „Adres egzekwowania".
2. **`core/process/session-signals.js`** — rozpoznanie wieku listy, wzorowane na
   `artefaktyRobocze()`: własna para wzorców przełącznika (nie współdzielona z innymi wierszami),
   kopia wykonawcza progu domyślnego jako stała z komentarzem „jedyne źródło prawdy to
   `SPEC_USTAWIENIA.md`", zwrot rozróżniający `brakWiersza` / `wyłączone` / `nierozpoznana` /
   pomiar. Data listy pochodzi z `dataListyModeli()` — **funkcji nie zmieniasz**. Nazwa pliku listy
   przychodzi od adaptera, tak jak w `provisionModelList()`: rdzeń nazw narzędzi nie zna.
   Eksport w tym samym miejscu co `dataListyModeli`.
3. **`adapters/claude-code/hooks/session-context.js`** i
   **`adapters/cursor/hooks/session-context.js`** — jedno zdanie powyżej progu, **obok** zdania
   o liście (nie zamiast niego): ile dni ma lista, jaki jest próg, i propozycja `/relai-models`.
   Komunikat **ASCII**, bez polskich znaków diakrytycznych (zasada 15). Oba adaptery mówią to samo.
4. **`docs/USTAWIENIA.md`** — wiersz `Lista modeli` w tym projekcie, z dzisiejszą datą. Zapis
   przechodzi przez hook `config-protection`, który zażąda potwierdzenia — to jest w porządku
   i **nie wolno tego obchodzić**; blokada bez możliwości potwierdzenia znaczy „powiedz wprost
   i pokaż treść wiersza".
5. **Cisza poniżej progu i przy wyłączniku** — projekt bez wiersza, projekt z `wyłączone`, lista
   świeża i lista z datą nieczytelną dają **zero znaków**. To jest właściwość do zmierzenia, nie
   do zadeklarowania.
6. **Nie ruszasz**: `dataListyModeli()` i `provisionModelList()` (poza dodaniem nowej funkcji obok),
   `adapters/*/MODELE.md`, `adapters/claude-code/commands/relai-models.md`, `SPEC_CLAUDE_MD.md`,
   `SPEC_STATUS.md`, `SPEC_PROMPT_ETAPU.md`, `validate-adapters.js`, `docs/KOMENDY.md`,
   `README.md` ani numeru wersji — to zakres E4 albo rzeczy zamknięte w E2.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Powyżej progu pada dokładnie jedno zdanie, poniżej zero znaków** — para przebiegów na tym
      samym projekcie kontrolnym, różniąca się **wyłącznie** wartością `list-date` w pliku listy
      (L-0040: obie wersje w jednym przebiegu). Dowodem jest wyjście hooka, nie deklaracja.
- [ ] **Cisza w czterech scenariuszach, każdy z własną kontrolą** (zasada 5): projekt bez wiersza
      `Lista modeli`, projekt z wartością `wyłączone`, lista świeższa niż próg, lista z datą
      nieczytelną (`list-date: wczoraj`) albo z przyszłości. Każdy → **0 znaków**; kontrola
      pozytywna w tym samym przebiegu → zdanie pada.
- [ ] **Wartość spoza zamkniętej listy brzmień nie milczy** — wiersz `Lista modeli | czasem`
      daje zdanie o dozwolonych wartościach, nie pomiar i nie ciszę (L-0025, L-0035).
- [ ] **Zdanie jest ASCII** — `grep -P "[^\x00-\x7F]"` po nowym komunikacie w obu hookach nie
      zwraca nic (zasada 15).
- [ ] **Oba adaptery mówią to samo** — ten sam projekt kontrolny obsłużony hookiem Claude Code
      i hookiem Cursora daje zdanie o tej samej treści, różniące się wyłącznie nazwą pliku listy.
- [ ] **Hook nie dotyka sieci (dowód negatywny, ryzyko 4)** — przebieg powyżej progu z odciętą
      siecią zachowuje się **identycznie** jak z siecią: to samo zdanie, ten sam kod wyjścia, ta
      sama treść pliku listy przed i po (suma kontrolna po normalizacji CRLF → LF).
- [ ] **Lista nie zmienia się od samego przypomnienia** — suma kontrolna
      `.claude/relai/MODELE-<narzędzie>.md` przed przebiegiem powyżej progu i po nim: ta sama.
- [ ] `core/templates/SPEC_USTAWIENIA.md` ma wiersz `Lista modeli` z realnym przykładem **oraz**
      pozycję w sekcji „Katalog progów"; liczba wierszy katalogu rośnie o jeden, a kolumna „Adres
      egzekwowania" mówi „jest".
- [ ] `docs/USTAWIENIA.md` ma wiersz `Lista modeli` i **czyta go rdzeń** — wywołanie nowej funkcji
      na tym projekcie zwraca pomiar, nie `brakWiersza`.
- [ ] Pliki z sekcji „Nie ruszasz" niezmienione: `git diff --stat` ich nie pokazuje.
- [ ] `node core/tools/validate-adapters.js` → kod 0.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem; `docs/STATE.md`
      nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/REKOMENDACJA_MODELU/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Artefakty spoza tego katalogu wypisane **z nazwy** razem z tym, co się
      z nimi stało.

## Na koniec — rytuał obowiązkowy (bez niego etap NIE jest ukończony)

1. **`docs/plany/REKOMENDACJA_MODELU/STATUS.md`** — E3 → `ZREALIZOWANY <data>`, E4 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_4.md` w kolumnie `Prompt`, linia w dzienniku
   wdrożenia. Sekcję „Bramki manualne" odśwież: dwie pozycje `OTWARTA` (numer wydania; pomiar E2
   w świeżej sesji) zostają, chyba że ten etap je rozstrzygnie — wtedy `ROZSTRZYGNIĘTA <data> —
   <jak>`. Nowe pozycje z sekcji „Do zrobienia przez człowieka" Twojego wpisu dopisujesz ze statusem
   `OTWARTA`.
1a. **Katalog roboczy etapu** — zmierz, pokaż pozycje, skasuj po „tak"; obie liczby idą do wpisu
   z punktu 2.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Przejrzyj tabelę „Stan otwartych ryzyk" —
   **M4** (sieć w mechanizmie bez internetu) dostaje wynik dowodu negatywnego z hooka, **M5** (nazwy
   starzeją się szybciej niż wydania) dostaje pierwszy mechanizm mówiący o wieku listy. Lekcje
   z etapu → `docs/LEKCJE.md` i odświeżony destylat.
3. **`docs/STATE.md`** — sekcja „Co działa" dostaje zdanie o tym, że stara lista przypomina się
   sama, a świeża milczy; sekcja „Nad czym pracujemy teraz" — postęp planu (3/4).
4. **`docs/ARTEFAKTY.md`** — podbicie wersji specyfikacji `SPEC_USTAWIENIA.md` (co się zmieniło,
   po co); przelicz „Zgodność liczb z dyskiem", jeśli liczba plików się zmieniła.
5. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   sekcji 6 planu (E4 — kontrola modelu, dokumenty, wydanie), **realnego stanu repozytorium po tym
   etapie** i lekcji, które w nim powstały. Etap bez tego promptu nie jest ukończony (D-34).
   **E4 jest ostatnim etapem planu** — jego prompt kończy się wskazaniem sekwencji zamknięcia planu
   (D-36), nie generacją kolejnego promptu.
6. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.
