# PROMPT_ODNOGA — guard hooków rozpoznaje projekt po ścieżce edytowanego pliku

Odnoga: GUARD_PO_SCIEZCE • Plan-rodzic: ROZWOJ_PO_WYDANIU (**ZAMROŻONY** — zamrożenie odnóg nie
dotyczy), etap E6 (pozycja pochodzi z E10 planu BUDOWA_RELAI) • Wygenerowano: **2026-09-03**
(autor: Opus 5) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Ten prompt zastąpił wersję z 2026-08-17.** Tamta opisywała RelAI 1.5.2, osiem hooków, cztery
> źródła wersji i destylat 47 lekcji — czyli stan sprzed trzech wydań. Kartę odnogi rozszerzono
> 2026-09-03 o punkt 5 (trzeci konsument `git check-ignore`). Poprzednia wersja promptu jest
> w historii gita.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/GUARD_PO_SCIEZCE/ODNOGA.md` | cel, **pięć** punktów zakresu i weryfikacja — karta jest źródłem, ten prompt ją wykonuje |
| `core/process/session-signals.js` | `isGuest()` (linia 30) i `relaiMarkerFile()` (linia 53) — tu mieszka rozpoznanie, które trzeba rozszerzyć |
| `adapters/claude-code/hooks/secret-scanner.js` | **konsument rdzenia** (linie 22–33) + własne `isGitIgnored()` liczone z `cwd` (linia 36) |
| `adapters/claude-code/hooks/config-protection.js` | drugi guardrail, ale z **własną** kopią `isGuest` (linia 20) i `relaiMarkerFile` (linia 31) — nie konsumuje rdzenia |
| `adapters/cursor/hooks/secret-scanner.js` | bliźniak w protokole Cursora: konsumuje rdzeń (linia 34), ma własne `isGitIgnored()` (linia 36) |
| `core/process/work-artifacts.js` | trzeci konsument `check-ignore` (linia 877), dołożony do zakresu 2026-09-03 |
| `core/README.md` | granica rdzeń ↔ adapter i akapit „Rozpięcia pozostałych ośmiu hooków" (linia 84) — **liczba w nim jest nieaktualna, to część zakresu** |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Kierunek jest wybrany:** marker szukany **także od katalogu edytowanego pliku w górę**, obok
  dzisiejszego sprawdzenia po katalogu sesji. Nie zamieniasz jednego na drugie — sesja pracująca
  we własnym projekcie ma działać dokładnie jak dziś.
- **Tryb gościa wygrywa zawsze.** Marker gościa znaleziony po drodze wycisza guard, niezależnie od
  kierunku rozpoznania. „Nie chcę tu RelAI" mówi się raz i obowiązuje w obu narzędziach.
- **Zestaw chronionych plików i wzorce sekretów zostają bez zmian** — to jest zmiana rozpoznania
  projektu, nie polityki ochrony. `core/guardrails/secret-scan.js` nietknięty.
- **Adapter konsumuje rdzeń, nie kopiuje go** (P4). Logika rozpoznania mieszka w
  `core/process/session-signals.js`; hooki dostają tylko protokół.
- **„Zachowanie się nie zmieniło" dowodzisz dwoma drzewami w jednym przebiegu** (L-0040) — przy
  zmianie w rdzeniu wołanym przez wszystkie hooki to nie jest opcja.
- **Nie ruszasz planu głównego.** `PLAN.html` planu ROZWOJ_PO_WYDANIU jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.
- **Punkt 5 zakresu jest rozstrzygnięty**, nie do przedyskutowania: `work-artifacts.js` wchodzi do
  tej odnogi, bo to ta sama klasa błędu co punkt 3, a rozdzielenie zostawiłoby połowę dziury.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-03)

RelAI **1.8.0**, wydane i zainstalowane globalnie; dwa adaptery na wspólnym rdzeniu.

```
core/process/session-signals.js      # isGuest() linia 30, relaiMarkerFile() linia 53
                                     #   -- oba START ZAWSZE OD cwd; relaiMarkerFile czyta
                                     #   path.join(cwd, 'docs') i konczy sie na tym
core/process/work-artifacts.js       # linia 877: git check-ignore wolane z cwd sesji (E1, 1.8.0)
core/guardrails/secret-scan.js       # wzorce sekretow. BEZ ZMIAN.
core/README.md                       # linia 84: "pozostalych osmiu hookow" -- liczba nieaktualna
adapters/claude-code/hooks/          # 11 plikow, w tym 10 hookow Node
  secret-scanner.js                  #   KONSUMUJE rdzen (l. 22-33); wlasne isGitIgnored (l. 36)
  config-protection.js               #   WLASNA kopia isGuest (l. 20) i relaiMarkerFile (l. 31)
adapters/cursor/hooks/               # secret-scanner (konsumuje rdzen, l. 34) + session-context
.claude-plugin/plugin.json           # wersja 1.8.0
.claude-plugin/marketplace.json      # wersja 1.8.0
core/MANIFEST.json                   # wersja 1.8.0
```

**Liczby zastane (FAKT, policzone 2026-09-03):**

- **Dziewięć** hooków adaptera Claude Code ma własną kopię `isGuest` — nie osiem, jak mówi
  `core/README.md:84` i jak mówiła poprzednia wersja tego promptu: `auto-format`,
  `config-protection`, `console-log-warn`, `design-quality-check`, `doc-sync-reminder`,
  `journal-signature`, `profile-rules`, `quality-gate`, `session-context`.
  Sprawdzenie: `grep -l isGuest adapters/claude-code/hooks/*.js`.
- **Trzy** miejsca wołają `git check-ignore` z `cwd` sesji:
  `adapters/claude-code/hooks/secret-scanner.js:38`, `adapters/cursor/hooks/secret-scanner.js:38`
  oraz `core/process/work-artifacts.js:877`.
- **Trzy** źródła numeru wersji (nie cztery): `core/MANIFEST.json`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`. Walidator melduje „3 zrodel, wartosc 1.8.0".
- `config-protection.js` jest **jedynym guardrailem, który nie konsumuje rdzenia** — ma własne
  `isGuest` i własne `relaiMarkerFile`. Dla niego punkt 2 zakresu znaczy przepięcie na rdzeń,
  a nie samą zmianę argumentu.

**Czego jeszcze NIE ma:** żadnej ścieżki rozpoznania liczonej od pliku. `relaiMarkerFile()` czyta
`path.join(cwd, 'docs')` i kończy się na tym; `isGitIgnored()` w obu adapterach oraz sprawdzenie
w `work-artifacts.js` wołają `git check-ignore` z `cwd` sesji, więc dla pliku z innego repozytorium
odpowiadają o cudzej historii.

**Dowód, że dziura jest realna:** w pilotażu E6 (2026-08-17) sesja uruchomiona w repozytorium RelAI
pisała pliki w projekcie `ProbaCursorE6`. Świeższy dowód: **ta sesja** (2026-09-03) pracowała
jednocześnie w RelAI i w PolyFlow przez `--add-dir`, edytując `CLAUDE.md`, `.gitignore`
i `docs/USTAWIENIA.md` tego drugiego — czyli dokładnie pliki, których pilnuje `config-protection`.
Praca międzyprojektowa jest normą, nie wyjątkiem.

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-03)

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
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz.** **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — kryterium arytmetycznie nieosiągalne wraca do człowieka
   jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018, L-0040, L-0051,
   L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej. **Trafienie zgłoszone na materiale, który dotąd był zdrowy,
   sprawdzasz najpierw na instrumencie**; każdy przypadek graniczny ma własną kontrolę na wyjściu.
   **Generator identyfikatorów ma kontrolę pozytywną na wszystkich kandydatach, nie na pierwszym.**
   Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji „sprawdzone
   inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz. **Próg porównuj do wielkości, którą mechanizm kontroluje**, a sygnał o zatkaniu
   wyzwalaj **różnicą między możliwym a wykonanym**, nie zerem wykonanego. (L-0034, L-0049,
   L-0053, L-0060, L-0065)
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
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. (L-0004, L-0008, L-0020, L-0061)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca. **Kolejność wpisów
    w dokumencie jest takim samym wariantem.** **Wariantem jest też stan dokumentu wobec własnej
    specyfikacji** — mechanizm sprawdzaj na dokumencie realnego projektu. (L-0033, L-0038, L-0057,
    L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości.**
    (L-0043, L-0045, L-0046, L-0072)
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

**Lekcje z planu SPRZATANIE_ARTEFAKTOW bez własnej pozycji w destylacie** („Zasady aktywne" mają 15
przy limicie 15). Obowiązują w tym wątku:

- **L-0076** — `git grep` przeszukuje **indeks**, nie drzewo robocze.
- **L-0077** — „na korzyść ochrony" rozstrzygasz **niepewność**, nie pustkę; regułę ochronną
  sprawdzasz także na stanie **po** własnym działaniu.
- **L-0081** — punkt, którego poprawnym wynikiem jest **cisza**, sprawdzaj **parą przebiegów**
  z kontrolą pozytywną. Ścieżka Windows w JSON-ie na stdin hooka milczy tak samo jak brak markera.
  W tym wątku to zasada centralna: prawie każde kryterium weryfikacji ma postać „guard się nie
  odzywa" albo „guard się odzywa".

## Zakres i weryfikacja

**Katalog roboczy tej odnogi: `.claude/relai/work/ROZWOJ_PO_WYDANIU/GUARD_PO_SCIEZCE/`.** Wszystko
tymczasowe powstaje tam — instrumenty porównawcze, payloady hooków, projekty kontrolne, wyjścia
narzędzi. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon
cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu
projektu. Katalog powstaje przy pierwszym zapisie, nie na zapas.

Zakres przepisany z karty odnogi (`ODNOGA.md`) — karta jest źródłem, rozbieżność jest błędem:

1. `core/process/session-signals.js` — `relaiMarkerFile()` szuka markera **także od katalogu
   edytowanego pliku w górę** (do korzenia repozytorium albo do wyczerpania ścieżki), zachowując
   dzisiejsze sprawdzenie po katalogu sesji. Tryb gościa nadal wygrywa.
2. `adapters/claude-code/hooks/secret-scanner.js` i `config-protection.js` oraz
   `adapters/cursor/hooks/secret-scanner.js` — rozpoznanie liczone od ścieżki pliku z `tool_input`,
   nie od `cwd`. Dla `config-protection.js` znaczy to **przepięcie na rdzeń**: ma dziś własne
   `isGuest` (l. 20) i `relaiMarkerFile` (l. 31).
3. `isGitIgnored()` w obu adapterach — wołane z katalogu projektu, do którego należy plik.
4. Dziewięć hooków adaptera Claude Code z własną kopią `isGuest` — przepięte na rdzeń albo
   świadomie zostawione, z powodem zapisanym w `core/README.md`. **Liczba w `core/README.md:84`
   („pozostałych ośmiu") jest nieaktualna i poprawiasz ją niezależnie od wybranego wariantu.**
5. `core/process/work-artifacts.js:877` — `git check-ignore` wołane z katalogu projektu, do którego
   należy sprawdzana ścieżka, nie z `cwd` sesji.

**Poza zakresem:** zestaw chronionych plików i zasady `config-protection`, wzorce
`core/guardrails/secret-scan.js`, adapter Codeksa (E7 dziedziczy poprawiony rdzeń bez własnej pracy).

- [ ] Sesja z katalogiem roboczym **poza** projektem RelAI, zapisująca sekret do pliku śledzonego
      w projekcie RelAI, dostaje blokadę (dowód: plik nie powstał).
- [ ] Ta sama sesja przy zapisie czystej treści do tego samego pliku nie dostaje żadnego
      komunikatu (dowód, że test nie jest pusty) — para przebiegów wg L-0081.
- [ ] Projekt z markerem trybu gościa nadal nie jest pilnowany — **z obu kierunków rozpoznania**.
- [ ] `git check-ignore` liczony względem projektu pliku: sekret w `.env` projektu docelowego
      przechodzi, ten sam sekret w pliku śledzonym nie.
- [ ] **Sprzątanie liczy `check-ignore` względem projektu pliku** — raport `/relai-clean` z sesji
      spoza projektu docelowego nie uznaje jego plików śledzonych za kandydatów; dowód negatywny
      na materiale, który dziś przechodzi.
- [ ] Instrument porównawczy dwóch adapterów w jednym przebiegu (L-0040): komplet zgodnych
      werdyktów dla materiału z katalogu sesji, **przed zmianą i po niej**.
- [ ] `node core/tools/validate-adapters.js` → kod 0.
- [ ] Katalog roboczy odnogi `.claude/relai/work/ROZWOJ_PO_WYDANIU/GUARD_PO_SCIEZCE/` przejrzany
      raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby
      przed i po** we wpisie dziennika. Artefakty spoza tego katalogu (`%TEMP%`, projekty
      kontrolne, klony) wypisane **z nazwy** razem z tym, co się z nimi stało.

## Na koniec — rytuał zamknięcia odnogi (bez niego odnoga NIE jest zamknięta)

1. **`ODNOGA.md`** — status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona.
2. **`docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`** — linia tej odnogi w sekcji „Odnogi" →
   `ZAMKNIĘTA <data>`. Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
2a. **Katalog roboczy odnogi** — zmierz (`node .claude/relai/tools/clean-work.js raport`), pokaż
   pozycje i skasuj po „tak"; obie liczby, przed i po, idą do wpisu z punktu 3. Artefakty spoza
   katalogu wypisz z nazwy.
3. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Przejrzyj tabelę „Stan otwartych ryzyk" —
   ta odnoga dotyka obietnicy o guardrailach.
4. **`docs/STATE.md`** — sekcja „Co działa": zmienia się obietnica, którą RelAI składa
   o guardrailach, więc zdanie o skanie sekretów wymaga przepisania.
5. **Podbicie wersji** — poprawka rdzenia wołanego przez oba adaptery, więc **1.8.1** w **trzech**
   źródłach (`core/MANIFEST.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`),
   potem `grep` po `1.8.0` i rozstrzygnięcie każdego trafienia (L-0008, zasada 10). Sekwencja
   wydania jest z **P-005** i jest wiążąca: push → `claude plugin update` → **restart aplikacji** →
   potwierdzenie wersji **treścią pliku**, nigdy komunikatem CLI.
6. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.

Punktu „wygeneruj następny prompt" tu **nie ma** — odnogi nie tworzą łańcucha.
