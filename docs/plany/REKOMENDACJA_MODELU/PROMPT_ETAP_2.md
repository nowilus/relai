# PROMPT_ETAP_2 — Komenda `/relai-models`: odświeżenie listy modeli za zgodą człowieka

Plan: REKOMENDACJA_MODELU • Etap: **E2 z E4** • Wygenerowano: 2026-09-03 (autor: Opus 5, w rytuale
„Na koniec" E1) • Wykonawca: **Opus** (z linii metrycznej `STATUS.md`: „Opus, z ustawień projektu,
D-85")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Obie bramki wejściowe są rozstrzygnięte (2026-09-04)** — adresy źródeł i tryb zgody na sieć
> masz w sekcji „Decyzje już podjęte". Startu nic nie blokuje. Adresów **nie szukasz sam** i nie
> podmieniasz ich na „nowsze", które znajdziesz po drodze: to decyzja człowieka, nie propozycja.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/REKOMENDACJA_MODELU/STATUS.md` | **sekcja „Bramki manualne"** — warunek startu tego etapu; dziennik wdrożenia |
| `docs/plany/REKOMENDACJA_MODELU/PLAN.html` | sekcje 2 (cele 3 i 6), 5 (kroki 4–5 przepływu), 6 (zakres E2), 7 (ryzyka 3, 4 i 6), 8 (przypadki b2, b3, b8) i 10 (Aneks A) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**M1 i M2** dopisane przy E1) + wpis z 2026-09-03 o E1 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `adapters/claude-code/MODELE.md` | format, który komenda ma **czytać i zapisywać** — blok maszynowy, kotwice, `list-date` |
| `adapters/cursor/MODELE.md` | ten sam format z dwiema pozycjami `<TO BE FILLED IN: …>` — to je komenda ma umieć uzupełnić |
| `core/process/session-signals.js` | `provisionModelList()` (kopia trwała) i `dataListyModeli()` — komenda pisze do **tej samej kopii w projekcie**, którą czyta skill |
| `adapters/claude-code/commands/relai-clean.md` | wzorzec komendy pytającej o zgodę przed operacją — układ frontmatteru, kroków i sekcji „Zakazy tej komendy" |
| `docs/KOMENDY.md` | ściąga użytkownika; nowa komenda wchodzi tu w brzmieniu, które realnie uruchomiłeś (zasada 2) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Zgoda na ruch sieciowy pada KAŻDORAZOWO** — bramka rozstrzygnięta 2026-09-04. Każde wywołanie
  `/relai-models` pyta o zgodę przed pierwszym połączeniem. **Nie powstaje** wiersz zgody
  w `docs/USTAWIENIA.md` ani osobny wyłącznik, a zapamiętanie zgody „na projekt" jest **zakazane**.
  To jest zwężenie punktu 7 zakresu: wyjątku dla `USTAWIENIA.md` nie ma.
- **Adresy źródeł — wskazane przez człowieka, wszystkie sprawdzone odczytem 2026-09-04.** Claude
  Code, w kolejności użycia: (1) `https://code.claude.com/docs/en/model-config` — **główne**, tabela
  aliasów (`opus`, `sonnet`, `haiku`, `fable`, `best`, `opusplan`, `sonnet[1m]`, `opus[1m]`) i tabela
  poziomów `effort`; (2)
  `https://support.claude.com/en/articles/11940350-claude-code-model-configuration` — lista modeli
  wspieranych przez Claude Code z pełnymi ID, **nośnikiem jest lista punktowa, nie tabela**;
  (3) `https://platform.claude.com/docs/en/api/models/list` — **opcjonalne**: `GET /v1/models` zwraca
  listę maszynowo, ale **wymaga nagłówka `X-Api-Key`**, więc używasz go wyłącznie wtedy, gdy klucz
  jest w `.env`; wartości klucza nie zapisujesz nigdzie (D-42), a brak klucza znaczy „pomiń to
  źródło", nie „zgłoś błąd". Cursor: `https://cursor.com/docs/models-and-pricing` — **główne**, dwie
  parsowalne tabele; `https://cursor.com/help/models-and-usage/available-models` — uzupełniające,
  modele w prozie, przydatne dla opisu klas, nie dla nazw.
- **Aliasy Claude Code są warstwą, którą użytkownik realnie przełącza model** (`opus`, `sonnet`,
  `haiku`, `fable`). Lista ma nieść **i alias, i pełne ID** — dziś w `MODELE.md` stoi sama nazwa
  z ID. Poszerzenie linii o alias mieści się w formacie z E1 (kolejne pole `nazwa: wartość` po `|`)
  i **nie jest** przeprojektowaniem bloku.
- **Żadna ze stron Cursora nie ma daty aktualizacji** (sprawdzone 2026-09-04). `list-date` po
  odświeżeniu jest **datą odczytu**, nie datą źródła — i tak ma być nazwane w adnotacji źródła
  przy pozycji.
- **`docs.claude.com/en/docs/about-claude/models/overview` oddaje 302** na `platform.claude.com`.
  Do listy wchodzi adres **docelowy**; komenda, która trafi na przekierowanie, idzie za nim raz
  i zapisuje adres końcowy.
- **Lista Cursora ma ~40 pozycji, a klasy są trzy: komenda POKAZUJE kandydatów i pyta, nie typuje
  sama** — bramka rozstrzygnięta 2026-09-04. Modele wypisujesz pogrupowane po dostawcy i pytasz,
  który idzie do której klasy. RelAI nie rankuje cudzych modeli (sekcja 2 planu: „lista mówi, co
  jest, nie co lepsze").
- **Zapis dopiero po „tak".** Komenda pokazuje **różnicę stara–nowa** przed zapisem; „nie" zostawia
  plik nietknięty. Sekcja 2 planu, cel 3.
- **Sieć wyłącznie w komendzie wywołanej wprost.** Hook startu zostaje w całości lokalny i cichy —
  sekcja 2 planu („czego świadomie nie robimy") oraz mitygacja ryzyka 4. Odświeżanie bez zgody
  człowieka jest zakazane **nawet po upływie progu**.
- **Brak sieci nie kończy komendy błędem.** Drugim źródłem jest pytanie do człowieka; odpowiedź
  zapisujesz z adnotacją „podane przez człowieka" i datą. Nigdy ciche zostawienie starej listy
  z nową datą (przypadek b3 planu).
- **Niepowodzenie odczytu zostawia starą listę z jej datą, nigdy pustą** — mitygacja ryzyka 3.
- **Lista pusta albo z `<TO BE FILLED IN: …>` to brak danych, nie zaproszenie do improwizacji**
  (L-0026, przypadek b2). Komenda nie zgaduje nazw modeli.
- **Aktualizacja pluginu nie wygrywa z kopią projektu** — przy dwóch listach komenda pokazuje **obie
  daty** i pyta, którą zostawić; bez pytania nic się nie zmienia (przypadek b8).
- **Listy rozróżnia nazwa pliku, nie katalog** (Aneks A z 2026-09-03): w projekcie leżą
  `.claude/relai/MODELE-claude-code.md` i `.claude/relai/MODELE-cursor.md`. Która obowiązuje —
  mówi hook startu; komenda **nie rozpoznaje narzędzia samodzielnie** (zasada 8).
- **Kopia w projekcie jest trwała** (E1, ryzyko M2): `provisionModelList()` kopiuje tylko przy braku
  pliku. Komenda pisze do kopii projektu — i to jest jedyny powód, dla którego ten zapis przeżywa
  najbliższy start sesji. Tej własności **nie zmieniasz**.
- **Klasy zostają trzy** (`strong` / `balanced` / `cheap`) i format bloku maszynowego z E1 zostaje
  bez zmian. Komenda wypełnia listę, nie przeprojektowuje jej.
- **Granica zakresu:** próg świeżości listy i przypomnienie w hooku startu to **E3**; kontrola
  modelu w karcie etapu, zmiany w `SPEC_CLAUDE_MD` / `SPEC_STATUS` / `SPEC_PROMPT_ETAPU`, nowe
  sprawdzenie w walidatorze i wydanie to **E4**. W tym etapie ich nie dotykasz i nie obiecujesz.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-03)

RelAI **1.8.1** w repozytorium i w aplikacji. E1 zamknięty tego samego dnia: mechanizm dostarczania
listy działa i jest zmierzony, ale **listy nie da się dziś odświeżyć inaczej niż ręczną edycją
pliku** — to jest luka tego etapu. Numer wersji **nie był podbijany** w E1 (należy do E4), choć
komentarze w kodzie mówią „1.9.0".

**Zmiana warunków pracy wobec poprzednich etapów:** `claude -p` **działa** — w E1 poprowadził pomiar
dwóch świeżych sesji. L-0032 („wyczerpany limit konta") opisuje stan z 2026-08-21, nie dzisiejszy
(L-0084). Zachowanie skilla zmienione, ale niewydane, mierzy się artefaktem podłożonym lokalnie
w projekcie kontrolnym (L-0085) — w cache'u pluginu jest wersja sprzed zmiany.

```
adapters/claude-code/MODELE.md     # 4 pozycje: strong x2 (Opus 5, Fable 5.1), balanced, cheap
adapters/cursor/MODELE.md          # 1 pozycja z pomiaru (strong: Grok 4.6) + 2x <TO BE FILLED IN>
core/process/session-signals.js    # provisionModelList() — kopia TYLKO przy braku pliku;
                                   #   dataListyModeli() — kotwica ^list-date: RRRR-MM-DD$
adapters/claude-code/hooks/session-context.js  # kladzie MODELE-claude-code.md + jedno zdanie ASCII
adapters/cursor/hooks/session-context.js       # kladzie MODELE-cursor.md + to samo zdanie
adapters/claude-code/skills/relai-planning/SKILL.md  # Krok 3: nazwy zamiast klas, gdy lista jest
core/MANIFEST.json                 # pole "models" w sekcji obu adapterow (deklaracja, bez kontroli)
adapters/claude-code/commands/     # 11 komend .md; adapter Cursora kopiuje je stad przy instalacji
                                   #   (install.js l.155-157 -> <projekt>/.cursor/commands/)
docs/KOMENDY.md                    # sciaga uzytkownika: 11 komend
README.md                          # tabela komend, l.242+ — kolumna ikony 24 px z docs/zasoby/branding/ikony/
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnej komendy odświeżającej listę; żadnej
ścieżki, którą nazwa modelu trafia do pliku inaczej niż ręczną edycją; żadnego miejsca, w którym
pokazuje się różnica stara–nowa przed zapisem; żadnej obsługi rozjazdu „kopia projektu vs lista
z pluginu".

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-03)

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
   końcu, że materiał wyszedł nietknięty (L-0083). Wyczerpany limit konta zatrzymuje pomiar i idzie
   do odnogi — ale **niedostępność cudzej usługi sprawdzasz ponownie jednym najtańszym wywołaniem**,
   zanim odpiszesz pomiar jako niewykonalny (L-0084). (L-0032, L-0037, L-0054, L-0055, L-0056,
   L-0064, L-0068, L-0071, L-0073, L-0083, L-0084)
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

W tym etapie centralne są zasady **1** (forma zapisu luki, gdy nazwy nie ma), **2** (fraza do
`KOMENDY.md` w brzmieniu realnie uruchomionym) i **3** (dowód negatywny: „nie" zostawia plik
nietknięty).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/REKOMENDACJA_MODELU/E2/`.** Wszystko tymczasowe —
projekty kontrolne, zapisane kopie stron dokumentacji, wyjścia komendy, instrumenty porównawcze —
powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon
cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu
projektu. Katalog powstaje przy pierwszym zapisie, nie na zapas.

1. **`adapters/claude-code/commands/relai-models.md`** — komenda odświeżająca listę. Frontmatter
   (`description`, `argument-hint`) wzorem `relai-clean.md`. Kroki wypisane po kolei, tak jak
   w pozostałych komendach: rozpoznanie, która lista obowiązuje (ze zdania hooka startu, nie
   z własnego rozpoznania narzędzia) → **zgoda na ruch sieciowy w kształcie rozstrzygniętym bramką**
   → odczyt źródła → **różnica stara–nowa pokazana przed zapisem** → zapis dopiero po „tak".
   Sekcja „Zakazy tej komendy" na końcu, wzorem pozostałych.
2. **Źródła w kolejności z sekcji „Decyzje już podjęte"**, a gdy wszystkie zawiodą — **pytanie do
   człowieka**, którego odpowiedź zapisujesz z adnotacją „podane przez człowieka" i datą.
   Niepowodzenie wszystkich źródeł zostawia listę **nietkniętą** i mówi o tym wprost. Przy liście
   Cursora krok pośredni jest obowiązkowy: **wypisz kandydatów pogrupowanych po dostawcy i zapytaj**,
   który model idzie do której klasy.
2a. **Zgoda na sieć pada przed pierwszym połączeniem, przy każdym wywołaniu** — bez niej komenda
   przechodzi od razu do pytania do człowieka i nie dotyka sieci ani razu.
3. **Zapis idzie do kopii w projekcie** (`.claude/relai/MODELE-<narzędzie>.md`), nie do pliku
   adaptera — kopia jest trwała (E1), więc odświeżenie przeżywa start sesji. `list-date` przestawiasz
   **wyłącznie wtedy**, gdy realnie zmieniła się treść listy.
4. **Rozjazd „kopia projektu vs lista z pluginu"** — komenda porównuje obie daty i pyta, którą
   zostawić (przypadek b8). Bez pytania nie zmienia niczego.
5. **`docs/KOMENDY.md`** — nowa pozycja w ściądze, w brzmieniu, które realnie uruchomiłeś
   (zasada 2). Liczba komend w tekście dokumentu: **11 → 12**.
6. **`README.md`** — wiersz w tabeli komend (l. 242+). Ikona: **użyj istniejącej albo zostaw kolumnę
   pustą i napisz o tym w dzienniku** — nowa ikona to zestaw jedenastu rysunków w jednej kresce
   i otwarta sprawa człowieka („Ikony README renderują się w 17–23 px"), więc **nie rysujesz
   dwunastej** w tym etapie.
7. **Nie ruszasz**: `core/process/session-signals.js` (prowizjonowanie zostaje jakie jest),
   hooków startu, `SPEC_CLAUDE_MD.md`, `SPEC_STATUS.md`, `SPEC_PROMPT_ETAPU.md`,
   `validate-adapters.js`, `docs/USTAWIENIA.md` ani numeru wersji — to zakres E3 i E4.
   `USTAWIENIA.md` **bez wyjątku**: zgoda na sieć jest każdorazowa, więc nie ma czego zapisywać.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Adresy źródeł w komendzie są dokładnie tymi z sekcji „Decyzje już podjęte"** — pięć pozycji,
      żadnej podmienionej ani dołożonej; adres `docs.claude.com/...` (przekierowujący) **nie
      występuje** w treści komendy. Dowód: `grep` po treści `relai-models.md`.
- [ ] **Zgoda na sieć pada przy każdym wywołaniu (dowód negatywny, zasada 3):** dwa wywołania pod
      rząd w tym samym projekcie kontrolnym — **oba** pytają o zgodę. Kontrola pozytywna w tym samym
      przebiegu: `docs/USTAWIENIA.md` po obu wywołaniach **nie ma** żadnego nowego wiersza (suma
      kontrolna przed i po, po normalizacji CRLF → LF).
- [ ] `adapters/claude-code/commands/relai-models.md` istnieje, ma frontmatter z `description`
      i sekcję „Zakazy tej komendy"; `ls adapters/claude-code/commands/*.md | wc -l` → **12**.
- [ ] **„Nie" zostawia plik nietknięty (dowód negatywny, zasada 3):** w projekcie kontrolnym
      uruchom komendę, odmów zapisu i pokaż **sumę kontrolną listy przed i po** (po normalizacji
      CRLF → LF, zasada 11) — ta sama wartość. Kontrola pozytywna w tym samym przebiegu: „tak"
      zmienia treść i `list-date`.
- [ ] **Niepowodzenie odczytu nie kasuje listy:** przebieg z adresem nieistniejącym (albo z siecią
      odciętą) zostawia starą listę z jej datą i mówi o tym wprost — dowód treścią pliku, nie
      komunikatem.
- [ ] **Pozycja `<TO BE FILLED IN: …>` daje się uzupełnić** drugim źródłem: lista Cursora po
      przebiegu ma nazwę w klasie `balanced` z adnotacją „podane przez człowieka" i datą; format
      bloku maszynowego **niezmieniony** (`dataListyModeli()` z rdzenia nadal czyta datę).
- [ ] **Odświeżenie przeżywa start sesji** (ryzyko M2): po zapisie uruchom hook startu w tym samym
      projekcie kontrolnym i pokaż sumę listy przed i po — ta sama.
- [ ] Adapter drugiego narzędzia i pliki z sekcji „Nie ruszasz" niezmienione: `git diff --stat` nie
      pokazuje ich.
- [ ] `node core/tools/validate-adapters.js` → kod 0.
- [ ] `docs/KOMENDY.md` niesie nową frazę w brzmieniu **realnie uruchomionym** (zasada 2), a liczba
      komend w tekście dokumentu zgadza się z liczbą plików na dysku.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem; `docs/STATE.md`
      nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/REKOMENDACJA_MODELU/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Artefakty spoza tego katalogu wypisane **z nazwy** razem z tym, co się
      z nimi stało.

## Na koniec — rytuał obowiązkowy (bez niego etap NIE jest ukończony)

1. **`docs/plany/REKOMENDACJA_MODELU/STATUS.md`** — E2 → `ZREALIZOWANY <data>`, E3 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_3.md` w kolumnie `Prompt`, linia w dzienniku
   wdrożenia. Sekcję „Bramki manualne" odśwież: obie bramki wejściowe są już
   `ROZSTRZYGNIĘTA 2026-09-04` i tego **nie ruszasz**; dopisujesz wyłącznie nowe pozycje z sekcji
   „Do zrobienia przez człowieka" Twojego wpisu, ze statusem `OTWARTA`.
1a. **Katalog roboczy etapu** — zmierz, pokaż pozycje, skasuj po „tak"; obie liczby idą do wpisu
   z punktu 2.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Przejrzyj tabelę „Stan otwartych ryzyk" —
   **ryzyka 3, 4 i 6 planu** wchodzą do niej przy tym etapie, a **M2** dostaje wynik pomiaru
   „odświeżenie przeżywa start sesji". Lekcje z etapu → `docs/LEKCJE.md` i odświeżony destylat.
3. **`docs/STATE.md`** — sekcja „Co działa" dostaje zdanie o tym, jak odświeża się lista; sekcja
   „Nad czym pracujemy teraz" — postęp planu (2/4).
4. **`docs/ARTEFAKTY.md`** — nowa komenda jako artefakt (wersja 1), sekcja komend `11 → 12`,
   przelicz „Zgodność liczb z dyskiem".
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   sekcji 6 planu (E3 — próg i przypomnienie), **realnego stanu repozytorium po tym etapie**
   i lekcji, które w nim powstały. Etap bez tego promptu nie jest ukończony (D-34).
6. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.
