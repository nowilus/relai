# PROMPT_ETAP_1 — Rotacja rusza: link pozycji, nietykalność wpisu, kierunek dziennika

Plan: HIGIENA_DOKUMENTOW • Etap: **E1 z E6** • Wygenerowano: 2026-09-01 (autor: Opus 5, przy
akceptacji planu) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Warunek startu — dostęp do materiału pomiarowego.** Weryfikacja tego etapu wymaga dziennika
> PolyFlow sprzed rotacji z 2026-09-01. Uruchom sesję z `--add-dir "C:\Users\Lukasz\Desktop\PolyFlow"`
> albo poproś użytkownika o wyciągnięcie kopii poleceniem
> `git -C "C:/Users/Lukasz/Desktop/PolyFlow" show HEAD~1:docs/DZIENNIK.md > /tmp/polyflow-przed.md`
> **przed** rozpoczęciem pracy. Bez tego materiału punkt 1 weryfikacji jest niewykonalny, a etapu
> nie wolno zamknąć „na oko".

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk", sekcja „Czeka na człowieka" (10 pozycji — to na nich testujesz przeliczenie linków) + ostatni wpis |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcje 3 (stan wyjściowy), 5 (opis poprawki 1), 6 (zakres E1), 8 (przypadek „wpis linkowany wjeżdża do archiwum") |
| `docs/fixy/BLOKADA_ROTACJI/ODNOGA.md` | karta wchłoniętej odnogi — punkty 1–4 jej zakresu są zakresem tego etapu |
| `.claude/relai/templates/SPEC_DZIENNIK.md` | sekcja „Czeka na człowieka" (format pozycji i reguła linku) oraz sekcja „Rotacja" |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | sekcje „Wybór treści — co wolno przenieść", „Blokada liczy się z sekcji »Czeka na człowieka«", „Przypadki brzegowe" |
| `core/process/session-signals.js` | funkcja `ostatniWpis` (ok. linia 399) i jej użycie w `startCost` |
| `docs/USTAWIENIA.md` | wiersz `Rotacja dokumentów` z progami projektu — nie zmieniasz go w tym etapie |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Pozycja „Czeka na człowieka" linkuje do najnowszego wystąpienia sprawy**, a link do wpisu, który
  wjeżdża do archiwum, jest **przepinany** na plik archiwum w tej samej fazie, w której wpis się
  przenosi (plan, sekcje 5 i 8). Wariant „zostaw link na najstarszym, ale zdejmij nietykalność"
  został odrzucony — pozycja zostawałaby z martwym linkiem.
- **Kolejność wpisów w dzienniku jest własnością projektu.** Mechanizm ma ją czytać z dat
  w nagłówkach, nie narzucać (L-0062, zasada aktywna 11).
- **Progów nie ruszasz.** 150 KB / 50 KB / 12 KB zostają; problem jest w egzekwowaniu, nie
  w liczbach (plan, sekcja 2 — nie-cele).
- **Rotacja jest dwufazowa i nic tego nie zmienia**: suma kontrolna, odczyt archiwum z dysku,
  porównanie, dopiero potem przycięcie. Przepięcie linku idzie w **fazie 2**; rozjazd sumy
  zatrzymuje całość i link zostaje nietknięty.
- **Nic nie kasujesz** — przeniesienie bajt w bajt plus linia-odsyłacz (D-18).
- **Rozstrzygnięcia z akceptacji planu (Aneks A, 2026-09-01):** `N = 30 dni`, przegląd spraw działa
  także przy wyłączonej rotacji dokumentów. **To jest materiał dla E3, nie dla tego etapu** — wiersza
  `Przegląd spraw człowieka` w `USTAWIENIA.md` w E1 **nie tworzysz**.
- **Granica zakresu:** lista blokerów w komunikacie rotacji i próg liczony ponad nietykalnymi to
  **E2**. Wymuszone pytanie o sprawy przeterminowane — **E3**. Raport progów — **E4**. Ryzyka
  i ustawienia — **E5**. Podbicie wersji i `/relai-update` — **E6**. W tym etapie nie dotykasz
  żadnej z tych rzeczy i niczego z nich nie obiecujesz w dokumentach.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, wypchnięte, plugin zainstalowany globalnie (scope `user`) w tej samej
wersji. Plan HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01, ten etap jest pierwszy. Odnoga
`BLOKADA_ROTACJI` istnieje w `docs/fixy/` i zostaje wchłonięta — jej status zmieniasz na
`PRZENIESIONA` dopiero w rytuale „Na koniec".

```
core/templates/SPEC_DZIENNIK.md      # sekcja „Czeka na człowieka" od 1.6.0; reguła linku do NAJSTARSZEGO wpisu
core/templates/SPEC_ARCHIWUM.md      # nietykalność wpisu linkowanego; zakres ciągły od najstarszego
core/process/session-signals.js      # ostatniWpis() bierze ostatni nagłówek ### w pliku (621 linii)
core/tools/validate-adapters.js      # walidator spójności rdzeń ↔ adaptery
adapters/claude-code/skills/relai-core/SKILL.md    # procedura rotacji wypisana w treści (L-0011)
adapters/cursor/                     # reguły .mdc — ta sama treść, drugi nośnik
docs/DZIENNIK.md                     # 145 KB, 10 pozycji w „Czeka na człowieka", 9 z nich starszych niż 30 dni
docs/fixy/BLOKADA_ROTACJI/           # ODNOGA.md + PROMPT_ODNOGA.md — wchłaniana przez ten etap
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** reguły linkowania do najnowszego wystąpienia,
reguły przepinania linku przy rotacji, przypadku brzegowego „wpis linkowany wjeżdża do archiwum"
w specyfikacji archiwum, odczytu kierunku dziennika z dat oraz przeliczonych linków w sekcji „Czeka
na człowieka" tego repozytorium.

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
   a instrument porównawczy implementuje wiernie każdą z nich. (L-0017, L-0018, L-0040, L-0051, L-0052)
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

1. **`core/templates/SPEC_DZIENNIK.md`, sekcja „Czeka na człowieka"** — zmień regułę linku:
   pozycja wskazuje **najnowsze** wystąpienie sprawy, nie najstarsze. Wypisz powód w treści
   (mechanizm rotacji idzie od najstarszego, więc link do najstarszego zatyka go z definicji) oraz
   format adnotacji po przepięciu linku na archiwum. Zaktualizuj przykład na końcu pliku — przykład
   pokazujący starą regułę jest gorszy niż jego brak.
2. **`core/templates/SPEC_DZIENNIK.md`, sekcja „Rotacja"** — dopisz wprost, że **kolejność wpisów
   w pliku jest własnością projektu**, a mechanizmy mają ją czytać z dat w nagłówkach, nie narzucać.
3. **`core/templates/SPEC_ARCHIWUM.md`, sekcja „Blokada liczy się z sekcji »Czeka na człowieka«"** —
   zgraj nietykalność z nową regułą linku: nietykalny jest wpis linkowany z **otwartej** pozycji,
   a gdy taki wpis wchodzi do zakresu rotacji, link zostaje **przepięty** na plik archiwum razem
   z kotwicą, w fazie 2. Obie specyfikacje muszą mówić o tym **to samo** — sprawdzasz to czytaniem
   obu w jednym przebiegu, nie z pamięci.
4. **`core/templates/SPEC_ARCHIWUM.md`, sekcja „Przypadki brzegowe"** — dopisz przypadek „wpis
   linkowany wjeżdża do archiwum": co się dzieje z linkiem, w której fazie, i co się dzieje, gdy
   suma kontrolna się nie zgadza (link nietknięty, żywy plik nietknięty).
5. **`core/process/session-signals.js`, funkcja `ostatniWpis`** — rozpoznaj kierunek pliku z **dat**
   w nagłówkach wpisów zamiast zakładać, że najnowszy jest ostatni. Brak dat w nagłówkach albo daty
   nieparsowalne → zachowanie dotychczasowe (ostatni nagłówek) i **cisza**, nie błąd. Wzorce trzymaj
   w pliku, nie w `node -e` (zasada 5), i pamiętaj o CRLF (zasada 11).
6. **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md` oraz odpowiadająca reguła
   w `adapters/cursor/`: procedura rotacji jest wypisana w treści skilla (L-0011), więc zmiana
   reguły linku i nietykalności musi wejść **w obu nośnikach**, nie tylko w specyfikacji.
7. **`docs/DZIENNIK.md`, sekcja „Czeka na człowieka" tego repozytorium** — przelicz linki dziesięciu
   pozycji na najnowsze wystąpienie każdej sprawy. Najpierw na kopii, z porównaniem liczby pozycji
   przed i po; rozjazd liczby **zatrzymuje etap** i idzie do człowieka (zasada 14).
8. **`docs/fixy/BLOKADA_ROTACJI/ODNOGA.md`** — sekcja „Wynik": odnoga wchłonięta przez E1 planu
   HIGIENA_DOKUMENTOW, z datą i linkiem do planu. Karty **nie kasujesz** (D-18).

Poza zakresem tego etapu, choć kusi: lista blokerów w komunikacie (E2), próg ponad nietykalnymi
(E2), cokolwiek w PolyFlow poza **odczytem** materiału pomiarowego, podbicie wersji (E6).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Pomiar na realnym pliku, obiema regułami w jednym przebiegu** (zasada 4): na dzienniku
      PolyFlow sprzed rotacji zakres liczony **starą** regułą i **nową** regułą — obie liczby
      wypisane. Nowa reguła obejmuje **co najmniej 50 wpisów z 97** (SZACUNEK — próg odbioru wzięty
      z karty odnogi). Instrument implementuje wiernie obie wersje, nie jedną i „domysł" drugiej.
- [ ] **`ostatniWpis` zwraca ten sam wpis dla dziennika rosnącego w dół i dla jego odwrócenia** —
      test na obu wariantach w jednym przebiegu, plus wariant z CRLF i wariant bez dat w nagłówkach
      (oczekiwane: zachowanie dotychczasowe, bez błędu).
- [ ] **Dowód negatywny dla przepięcia linku** (zasada 3): przebieg zatrzymany po fazie 1 — plik
      archiwum powstał, a suma kontrolna żywego dziennika **i treść pozycji w „Czeka na człowieka"**
      są przed i po **identyczne**. Link nie może zostać przepięty przed potwierdzeniem sumy.
- [ ] **Dowód obecności, nie tylko braku strat** (zasada 14): po pełnym przebiegu na kopii każda
      pozycja „Czeka na człowieka" ma link prowadzący do **istniejącej kotwicy** — liczba pozycji
      z martwym linkiem wynosi **0**, wypisana jawnie.
- [ ] `SPEC_DZIENNIK.md` i `SPEC_ARCHIWUM.md` mówią o linku i o nietykalności **to samo** —
      sprawdzone czytaniem obu w jednym przebiegu tej sesji, nie z pamięci.
- [ ] Zmiana weszła do **obu** adapterów — `git grep -n` po frazie nowej reguły zwraca trafienia
      w `core/templates/`, `adapters/claude-code/` i `adapters/cursor/`.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] Sekcja „Czeka na człowieka" w `docs/DZIENNIK.md` ma nadal **10 pozycji**, każda z linkiem do
      istniejącej kotwicy; treść pozycji niezmieniona (dowód: porównanie treści bez linków przed i po).
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z linią autora w formacie
      `RelAI (<model>) + <git config user.name>`; `docs/STATE.md` nadpisany.
- [ ] Brak plików tymczasowych i katalogów testowych w repozytorium (`git status --short` bez
      nieoczekiwanych pozycji).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E1 → `ZREALIZOWANY <data>`, E2 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_2.md` w kolumnie `Prompt`, linia w dzienniku
   wdrożenia (jedna, jedno zdanie). Odnoga: dopisz do sekcji „Odnogi” linię
   `BLOKADA_ROTACJI … PRZENIESIONA <data> → wchłonięta przez E1` — sekcja powstaje teraz, bo
   wcześniej jej nie było.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   „Stan otwartych ryzyk" — **R5 zostaje otwarte**, ale jego komórka „Mitygacja" dostaje odsyłacz do
   tego etapu. Lekcje z etapu → `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne”
   (limit 15 pozycji jest twardy).
3. **Bramki manualne** — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka" z Twojego
   wpisu dostaje linię w sekcji „Bramki manualne" `STATUS.md` ze statusem `OTWARTA`, a sprawa,
   która ma czekać dłużej niż tę sesję — również pozycję w sekcji „Czeka na człowieka" dziennika.
4. **`docs/STATE.md`** — nadpisz stan obszaru rotacji; `README.md` tylko wtedy, gdy zmienił się
   sposób uruchomienia (w tym etapie nie powinien).
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`:
   materiałem jest sekcja 6 planu (opis E2 — lista blokerów w komunikacie i próg liczony ponad
   nietykalnymi), **realny stan repozytorium po tym etapie** i lekcje, które w tym etapie powstały.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
