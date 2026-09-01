# PROMPT_ETAP_6 — Pomiar na realnych projektach i wydanie 1.7.0

Plan: HIGIENA_DOKUMENTOW • Etap: **E6 z E6 — OSTATNI** • Wygenerowano: 2026-09-01 (autor: Opus 5,
w rytuale „Na koniec" E5) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **To jest ostatni etap planu.** Rytuał „Na koniec" **nie** kończy się wygenerowaniem
> `PROMPT_ETAP_7.md`, tylko **sekwencją zamknięcia planu (D-36)** ze skilla `relai-planning`.
> Skill wczytaj narzędziem `Skill` — komenda wywołana wprost go nie ładuje (zasada aktywna 8).

> **Sekwencja wydania jest pułapką, nie formalnością.** `claude plugin update` melduje sukces
> i **nie działa do restartu aplikacji**, a mechanizm kontrolny wbudowany w plugin pochodzi ze
> starej wersji, więc porównuje X z X i milczy (`docs/PULAPKI.md`, **P-005**). Wersję, którą sesja
> realnie wykonuje, potwierdzasz **treścią pliku, który się zmienił**, albo ścieżką cache
> w transkrypcie — nigdy `installed_plugins.json` ani komunikatem CLI.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (4 wiersze), sekcja „Czeka na człowieka" (1 pozycja) + wpisy E4 i E5 — tam stoją liczby „przed", z którymi będziesz porównywał |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/PULAPKI.md` | **P-005** (sekwencja wydania i restart), **P-001** (`tar` w Git Bashu), **P-003** (PowerShell zjada polskie znaki przy odczycie) |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcja 6 (zakres E6), sekcja 7 (ryzyko 6 — praca dotyka rdzenia używanego przez trzy projekty), sekcja 8 (przypadki brzegowe) |
| `docs/plany/HIGIENA_DOKUMENTOW/STATUS.md` | tabela etapów, **trzy aneksy**, bramki manualne (trzy rozstrzygnięte), sekcja „Odnogi" |
| `core/templates/SPEC_ARCHIWUM.md` | procedura dwufazowa, dwa wejścia rotacji, cztery przebiegi z 1.7.0, przypadki brzegowe |
| `core/templates/SPEC_USTAWIENIA.md` | **„Katalog progów"** — po podbiciu wersji każdy wiersz z adresem musi nadal wskazywać mechanizm, który istnieje |
| `core/process/session-signals.js` | `startCost`, `startCostReport`, `dokumentyPonadProgiem`, `sprawyPrzeterminowane` — to one produkują liczby tego etapu |
| `docs/STATE.md` | sekcje „Co blokuje" i „Co dalej" — trzy pozycje tego etapu stoją tam wypisane |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Wersja docelowa to `1.7.0`**, w **trzech** źródłach naraz (walidator liczy je i porównuje:
  `node core/tools/validate-adapters.js` melduje „numery wersji: 3 zrodel"). Numeru nie negocjujesz
  i nie wydajesz „na próbę" jako 1.6.2.
- **Sekwencja P-005 obowiązuje w całości:** push → `plugin marketplace update` → `plugin update` →
  **restart aplikacji** → dopiero pomiar. Pomiar wykonany przed restartem jest pomiarem starej
  wersji i nie liczy się jako dowód (L-0031, L-0020).
- **Po podbiciu numeru przepuszczasz repozytorium `grep`-em po `1.6.1`** i rozstrzygasz **każde**
  trafienie, dzieląc je na wzmianki historyczne („do 1.6.1 reguła brzmiała…", zostają)
  i deklaracje stanu docelowego (te idą do 1.7.0). Kontrola patrząca tylko na manifesty tej
  różnicy nie widzi (zasada aktywna 10).
- **`/relai-update` uruchamiasz z cache'u pluginu, nie z repozytorium** — i dopiero po restarcie.
  Do tego czasu cache niesie starą wersję komendy, która potrafi **cofnąć** wersję migrowanego
  projektu (`docs/STATE.md`, „Co dalej").
- **Cisza poniżej progu jest testem regresji, nie miłą cechą.** Projekt w normie ma po wydaniu
  dostać **zero znaków** z obu hooków startu. Jeden znak to defekt wydania.
- **Sekcja ryzyk PolyFlow nie zejdzie pod 12 KB** i nie jest to zadanie tego etapu (Aneks C, E5):
  62 ryzyka otwarte, 0 zamkniętych. Raportujesz liczbę, jaka wyjdzie, i nie próbujesz jej
  poprawiać skracaniem cudzych ryzyk.
- **Limit „Zasad aktywnych" zostaje przy jednym adresie** — krok 1 rytuału zamknięcia w obu
  adapterach. Do raportu startu nie wchodzi (L-0036, L-0049).
- **JiraManager zostaje poza zakresem** (sekcja „Czego nie robimy" planu). Ryzyko R5 pozostaje
  otwarte do jego migracji, niezależnie od wyniku tego etapu.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, plugin zainstalowany globalnie w tej samej wersji. Plan
HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01 z **Aneksami A, B i C**; **E1–E5 zamknięte** tego
samego dnia. Wszystkie trzy bramki manualne planu są **rozstrzygnięte**, obie odnogi
(`BLOKADA_ROTACJI`, `REJESTR_ARTEFAKTOW`) **zamknięte**.

**Co dały E1–E5.** Rotacja rusza (E1), mówi, gdy stoi (E2), sprawa człowieka starsza niż 30 dni
wymusza decyzję (E3), każdy próg ma adres w raporcie startu (E4), a komórka „Mitygacja" i plik
ustawień mają drogę do archiwum (E5). Katalog progów wypisuje **17 progów, 15 z adresem
egzekwowania, 1 bez automatu** (propozycja kompresji lekcji) i 1 „nie dotyczy" (cel rotacji).

**Czego wszystkie te etapy NIE mają:** ani jednego pomiaru **po wydaniu**, w świeżej sesji,
w zainstalowanym pluginie. Wszystko powyżej zmierzono instrumentami w `%TEMP%` na kopiach plików.
To jest zakres tego etapu.

Stan pomiarowy `FAKT` (2026-09-01, po E5, przed rotacją zamykającą sesję E5):

```
docs/DZIENNIK.md            159 318 B (155,6 KB) / prog 150 KB   # PONAD progiem — raport startu mowi
docs/STATE.md                19 345 B / prog czastkowy 12 KB, 250 linii / prog 300
docs/LEKCJE.md               30 048 B / prog 50 KB, 17 lekcji zywych / prog 40
sekcja "Zasady aktywne"       8 948 B / prog 30 KB, 15 pozycji / limit 15
sekcja "Stan otwartych ryzyk" 3 978 B / prog czastkowy 12 KB, 4 ryzyka, 0 ZAMKNIETYCH
docs/USTAWIENIA.md            3 106 B / prog czastkowy 6 KB
suma warstwy startowej       53 549 B / budzet 80 KB
raport startu                2 linie  (docs/DZIENNIK.md ponad progiem rotacji)
```

**Uwaga o dzienniku:** jeśli sesja zamykająca E5 wykonała rotację, powyższe liczby dziennika są
nieaktualne — **przelicz je sam** (`node core/process/session-signals.js` przez `startCost`), nie
przepisuj z tego prompta. Reszta liczb zmienia się tylko o Twój wpis.

Stan projektu kontrolnego `FAKT` (dokumenty PolyFlow `9fcf433`, pomiar z E5):

```
warstwa startowa    111,8 KB / budzet 80 KB
docs/DZIENNIK.md    167,2 KB / prog 150 KB      -> rotacja dziennika
sekcja ryzyk         38,6 KB / prog  12 KB      -> 62 ryzyka, 0 ZAMKNIETYCH (Aneks C)
docs/USTAWIENIA.md   29,4 KB / prog   6 KB      -> rotacja ustawien do archiwum
raport startu        5 linii przy limicie 6
```

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości — plik może
urosnąć, prompt nie):

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
   materiale, zanim zaczniesz pracę** — policz na wskazanym pliku liczbę, którą ma osiągnąć,
   i porównaj ją z tym, co mechanizm w ogóle kontroluje; kryterium arytmetycznie nieosiągalne
   wraca do człowieka jako aneks. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej. Dzieląc wiersz po separatorze, który da się wyescapować, dziel
   po separatorze **niepoprzedzonym znakiem ucieczki**. Filtr odsiewający ma **wyjątek dla linii
   mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną kontrolę na
   wyjściu. **Wzorzec identyfikatora pozycji ma obok siebie kontrolę „ile wierszy odrzucono"** —
   realny rejestr trzyma numery, których wzorzec nie przewidział, a odrzucenie jest ciche.
   Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi. (L-0032, L-0037, L-0054, L-0055,
   L-0056, L-0064, L-0068, L-0071)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz. **Próg porównuj do wielkości, którą mechanizm kontroluje** (część usuwalna),
   a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie zerem wykonanego.
   (L-0034, L-0049, L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości, wartość nierozpoznana znaczy cisza. **Rdzeń słowa
   w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`.** **Rdzenia szukasz w samym
   brzmieniu wartości, nie w całej komórce** — za datą stoi proza z tymi samymi słowami. (L-0025,
   L-0035, L-0048, L-0066, L-0070)
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
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca; mechanizm czytający strukturę
    pliku sprawdzaj na **obu** wariantach w jednym przebiegu. **Kolejność wpisów w dokumencie jest
    takim samym wariantem**, a **wariantem jest też stan dokumentu wobec własnej specyfikacji** —
    mechanizm sprawdzaj na dokumencie realnego projektu. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę. (L-0043, L-0045, L-0046)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam; przy wyprowadzaniu pozycji jednostką inwentarza
    jest **sprawa**, nie linia. Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź
    **obecności** nowej treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
    nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

## Zakres etapu

1. **Podbicie wersji do 1.7.0** w trzech źródłach, które liczy walidator, plus linia
   `Wersja RelAI:` w `docs/USTAWIENIA.md` tego repozytorium. Po podbiciu — `grep` po `1.6.1`
   w całym repo i **rozstrzygnięcie każdego trafienia** z podziałem na wzmianki historyczne
   i deklaracje stanu docelowego.
2. **Sekwencja wydania P-005** w całości, z **restartem aplikacji** przed jakimkolwiek pomiarem.
   Wersję realnie wykonywaną potwierdzasz treścią zmienionego pliku, nie komunikatem CLI.
3. **Pomiar pełnego startu sesji na tym repozytorium** — świeża sesja po restarcie: liczby przed
   i po, liczba linii obu raportów, zachowanie przy dzienniku ponad progiem 150 KB.
4. **`/relai-update` dla PolyFlow** z cache'u pluginu, po restarcie: struktura projektu na 1.7.0,
   wiersze `Przegląd spraw człowieka` i pozostałe wiersze czytane maszynowo na miejscu, raport
   różnic pokazany przed zmianą.
5. **Pomiar na PolyFlow po aktualizacji** — warstwa startowa przed i po, liczba linii raportu,
   **realny przebieg** rotacji dziennika, rotacji ustawień i kompresji komórek „Mitygacja"
   wykonany **przez model w rytuale zamknięcia**, nie instrumentem. To jest jedyny pomiar, którego
   E1–E5 nie mają.
6. **Pytanie partiami po cztery** — sprawy przeterminowane w PolyFlow są dziś zerem przy `N = 30`,
   więc przebieg pytania mierzysz na **kontrolowanym** materiale (kopia dziennika z przesuniętą
   datą pozycji albo `N` obniżone w kopii projektu), a wynik opisujesz jako pomiar na materiale
   spreparowanym — nie udajesz, że to zdarzyło się samo.
7. **Zero regresji ciszy** — projekt w normie po wydaniu dostaje **0 znaków** z obu hooków.

Poza zakresem tego etapu, choć kusi: **migracja JiraManagera**, **zamykanie cudzych ryzyk
w PolyFlow**, dokładanie nowych progów i mechanizmów. Rzecz spoza zakresu → sygnał odchylenia,
jedno pytanie (AskUserQuestion): odnoga / aneks / świadomie odłożone.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0** i melduje „numery wersji:
      3 zrodel, wartosc **1.7.0**".
- [ ] `git grep -n "1\.6\.1"` — **każde** trafienie rozstrzygnięte i wypisane w dwóch grupach
      (wzmianka historyczna / deklaracja stanu docelowego). Liczba trafień w każdej grupie idzie
      do wpisu.
- [ ] **Wersja realnie wykonywana potwierdzona treścią pliku**, nie komunikatem CLI ani
      `installed_plugins.json` — pokaż fragment, który istnieje wyłącznie w 1.7.0.
- [ ] **Świeża sesja po restarcie na tym repozytorium**: wypisane liczby obu raportów przed i po,
      oraz to, czy raport `[RelAI progi dokumentow]` odzywa się zgodnie ze stanem dziennika.
- [ ] **PolyFlow po `/relai-update`**: `Wersja RelAI: 1.7.0`, a **wszystkie pięć wierszy czytanych
      maszynowo** obecne — dowód negatywny, czyli ich brzmienie po aktualizacji.
- [ ] **Realny przebieg trzech procedur w rytuale zamknięcia PolyFlow**, wykonany przez model:
      rozmiary przed i po, sumy kontrolne, liczba przepiętych linków, liczba skompresowanych
      komórek, liczba przeniesionych wierszy ustawień. **Każda suma odczytana z pliku z dysku.**
- [ ] **Cytat, nie parafraza** — dla każdej komórki skompresowanej w PolyFlow zdanie z żywej tabeli
      występuje **dosłownie** w treści archiwum.
- [ ] **Pytanie partiami po cztery** przeszło na materiale kontrolowanym: liczba partii, treść
      pytania, zapisana adnotacja odroczenia z licznikiem.
- [ ] **Zero regresji ciszy**: to repozytorium po wydaniu i po rotacji → **0 znaków** z obu hooków
      startu; projekt kontrolny → raport w limicie **6 linii**.
- [ ] **Katalog progów zgadza się ze stanem po wydaniu** — 17 wierszy, każdy z adresem wskazuje
      mechanizm, który istnieje w 1.7.0; wiersz „brak automatu" opisuje próg, którego naprawdę
      nikt nie liczy.
- [ ] Wpis w `docs/DZIENNIK.md` z linią autora `RelAI (<model>) + <git config user.name>`;
      `docs/STATE.md` nadpisany; `README.md` **tylko** jeśli zmienił się sposób uruchomienia.
- [ ] `git status --short` bez nieoczekiwanych pozycji (`docs/AUDYT_2026-08-22.html` jest
      nieśledzony **od przed** tym planem — rozstrzygnij go albo opisz wprost).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E6 → `ZREALIZOWANY <data>`, jedna linia
   w dzienniku wdrożenia. Sekcja „Odnogi" — sprawdź, czy któraś nie wróciła jako `OTWARTA`.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka). Przejrzyj tabelę „Stan otwartych ryzyk":
   **R5 rozstrzygasz w tym etapie** — plan, który był jego odpowiedzią, dobiega końca, więc albo
   zamykasz je z dowodem, albo zapisujesz wprost, co zostaje otwarte (migracja JiraManagera)
   i dlaczego. Lekcje z etapu → `docs/LEKCJE.md` + odświeżony destylat (limit **15 pozycji** jest
   twardy; dziś jest dokładnie 15, więc nowa zasada wchodzi przez rozszerzenie istniejącej).
3. **`docs/STATE.md`** — nadpisz stan: wersja, wydanie, wyniki pomiarów na obu projektach.
4. **Sekwencja zamknięcia planu (D-36)** ze skilla `relai-planning`, kroki 1–9 w kolejności,
   **bez skracania i bez odtwarzania z pamięci**: rozstrzygnięcie otwartych bramek manualnych →
   rozstrzygnięcie otwartych odnóg → `STATE.md` → wpis zamykający „dowiezione vs plan" → status
   planu `ZREALIZOWANY` → przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` →
   linia „Aktywny plan" w `CLAUDE.md` → podsumowanie. Dwa punkty blokujące idą pierwsze: dopóki
   bramki i odnogi nie są rozstrzygnięte, nigdzie nie piszesz, że plan jest zrealizowany.
5. **`PROMPT_ETAP_7.md` NIE powstaje** — to był ostatni etap.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
