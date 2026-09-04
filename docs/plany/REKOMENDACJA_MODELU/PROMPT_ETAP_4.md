# PROMPT_ETAP_4 — Kontrola modelu, dokumenty i wydanie

Plan: REKOMENDACJA_MODELU • Etap: **E4 z E4** • Wygenerowano: 2026-09-04 (autor: Opus 5, w rytuale
„Na koniec" E3) • Wykonawca: **Opus** (z linii metrycznej `STATUS.md`: „Opus, z ustawień projektu,
D-85")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **To jest ostatni etap planu.** Rytuał „Na koniec" **nie kończy się** generacją
> `PROMPT_ETAP_5.md` — zamiast niej wykonujesz **sekwencję zamknięcia planu** (D-36) ze skilla
> `relai-planning`, sekcja „Zamknięcie planu". Skill wczytujesz narzędziem Skill: komenda wywołana
> wprost go nie ładuje.

> **Bramka blokująca start:** numer wydania (1.9.0 czy 1.8.2) jest **`OTWARTA`** w `STATUS.md`.
> Punkt 5 zakresu bez tej decyzji nie ruszy. Zapytaj o nią **jednym pytaniem na starcie etapu**,
> zanim dotkniesz pierwszego pliku — reszta zakresu jest od niej niezależna, więc pytanie nie
> blokuje punktów 1–4.

> **Sprawdź dostępność `claude -p`, zanim zaplanujesz pomiar** (L-0087). 2026-09-03 działał,
> 2026-09-04 rano odmówił (`OAuth session expired and could not be refreshed`), a tego samego dnia
> po południu znów działał — E3 zmierzył na nim dwa warianty zdania i domknął bramkę E2. Jedno
> najtańsze wywołanie na starcie rozstrzyga, na czym opierasz punkty weryfikacji. Wynik idzie do
> wpisu, także pozytywny.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/REKOMENDACJA_MODELU/STATUS.md` | tabela etapów (E1–E3 zamknięte), **Bramki manualne** — jedna `OTWARTA`, dziennik wdrożenia |
| `docs/plany/REKOMENDACJA_MODELU/PLAN.html` | sekcje 2 (cele 3 i 4), 6 (zakres E4), 7 (ryzyka 5 i 6), 8 (przypadek „model bieżącej sesji jest spoza listy") oraz **Aneksy A, B i C** w sekcji 10 |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**M1–M5**) + wpisy z 2026-09-03 i 2026-09-04 o E1, E2 i E3 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/PULAPKI.md` | **P-005** — sekwencja wydania; to jest procedura punktu 5 zakresu, nie odtwarzasz jej z pamięci |
| `core/templates/SPEC_PROMPT_ETAPU.md` | sekcja „3. Kontrola modelu" (l. 54–61) — tam dochodzi nazwa modelu z listy; oraz przykład na końcu, który ma zostać spójny ze zmianą |
| `core/templates/SPEC_CLAUDE_MD.md` | punkt 8 układu (l. 110–112) i sekcja „Dobór modeli" (l. 288–291) — trzy klasy bez ani jednej nazwy; tam dochodzi odesłanie do listy |
| `core/templates/SPEC_STATUS.md` | linia metryczna (przykład w l. 201) — tam dochodzi narzędzie, w którym ustalono model |
| `adapters/claude-code/commands/relai-stage.md` | Krok 4, punkt „Model wykonawczy" (l. 72) — karta potwierdzenia; tu dochodzi nazwa spoza listy |
| `core/tools/validate-adapters.js` | pięć sprawdzeń (l. 50, 66, 104, 117, 130, 145) — wzorzec dla szóstego; `czytajJson()` i `jest()` są gotowe |
| `core/MANIFEST.json` | deklaracje `models` obu adapterów (l. 53 i 66) — to jest to, co walidator ma zacząć sprawdzać |
| `core/process/session-signals.js` | `dataListyModeli()`, `provisionModelList()`, `wiekListyModeli()` — **czytasz, nie zmieniasz**; potrzebujesz z nich wyłącznie kształtu bloku maszynowego |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Lista mówi, co jest, nigdy co lepsze.** Żadnych cen, limitów ani porównań wydajności — sekcja 2
  planu. Rekomendacja klas zostaje rekomendacją, nie regułą (D-38).
- **Rdzeń nie zna nazw narzędzi ani nazw modeli.** Nazwę pliku listy podaje adapter
  (Aneks A); nazwę modelu podaje lista. Rozpoznawanie narzędzia „po katalogu, po nazwie procesu albo
  po własnym modelu" jest zakazane — to samo zdanie stoi już w `relai-models.md`.
- **Nazwa spoza listy nie blokuje startu etapu** (przypadek brzegowy planu): karta pisze wprost
  nazwę modelu sesji, klasę wymaganą przez plan i zdanie, że modelu nie ma na liście z dnia X.
  Decyzja należy do człowieka.
- **Zdanie o wieku listy ma jednego właściciela** — hook startu (zasada 8, L-0036). Karta etapu
  **nie powtarza** przypomnienia o starej liście; wolno jej odwołać się do daty listy, bo tę i tak
  wypisuje.
- **Cisza poniżej progu jest nienaruszalna** i tego etapu nie dotyczy inaczej niż zakazem psucia:
  po zmianach w karcie i w specyfikacjach projekt bez listy zachowuje się dokładnie jak dotąd.
- **Numer wersji podbijasz w trzech źródłach naraz** — `core/MANIFEST.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`; walidator sprawdza ich zgodność
  (l. 133–145) i to sprawdzenie musi dalej zwracać jedną wartość.
- **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI** (L-0004, L-0008, L-0061),
  a po podbiciu numeru przepuszczasz repo `grep`-em po starym numerze i **rozstrzygasz każde
  trafienie** — także w treści komend, skilli i specyfikacji.
- **Granica zakresu:** `MODELE.md` obu adapterów, `relai-models.md`, `wiekListyModeli()`, wiersz
  `Lista modeli` i zdania w hookach startu są **zamknięte** w E1–E3. Otwierasz je wyłącznie wtedy,
  gdy trafienie `grep`-a po starym numerze wersji tego wymaga.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-04)

RelAI **1.8.1** w repozytorium i w aplikacji. Plan ma **3 etapy z 4** zamknięte tego samego tygodnia:
E1 dał listy modeli w obu adapterach i pytanie z nazwami, E2 — komendę `/relai-models` (dwunastą)
razem z Aneksem B, E3 — próg świeżości listy: wiersz `Lista modeli` (`włączona · 7 dni`),
`wiekListyModeli()` w rdzeniu i jedno zdanie ASCII w obu hookach startu. Bramka pomiaru E2 została
domknięta Aneksem C w dwóch świeżych sesjach CLI.

**Czego nadal nie ma — i to jest zakres tego etapu:** karta `/relai-stage` mówi „Model wykonawczy:
Opus", ale **nie wie, czy model bieżącej sesji jest na liście**; `SPEC_CLAUDE_MD` opisuje trzy klasy
bez ani jednego odesłania do listy, więc wygenerowany `CLAUDE.md` nadal uczy projekty myślenia
klasami; `SPEC_STATUS` nie zapisuje **w jakim narzędziu** ustalono model, choć od E1 to jest
rozróżnienie niosące treść; walidator sprawdza pięć rzeczy i **żadna nie dotyczy list modeli** —
deklaracja `models` w `MANIFEST.json` może wskazywać plik, którego nie ma, a nikt tego nie zobaczy.
I wydania nie ma: `/relai-models` oraz próg świeżości **leżą w repozytorium i nie działają
w aplikacji**.

```
adapters/claude-code/commands/relai-stage.md   # Krok 4, l.72 — "Model wykonawczy" w karcie
core/templates/SPEC_PROMPT_ETAPU.md            # sekcja 3 "Kontrola modelu", l.54-61 + przyklad l.195
core/templates/SPEC_CLAUDE_MD.md               # punkt 8 ukladu l.110-112; "Dobor modeli" l.288-291
core/templates/SPEC_STATUS.md                  # linia metryczna, przyklad l.201
core/tools/validate-adapters.js                # 5 sprawdzen; wzorzec: jest() + czytajJson()
core/MANIFEST.json                             # "models" adapterow: l.53, l.66
adapters/claude-code/MODELE.md                 # list-date 2026-09-04, 4 pozycje, pole alias
adapters/cursor/MODELE.md                      # list-date 2026-09-04, 3 pozycje, komplet klas
docs/PULAPKI.md                                # P-005 — sekwencja wydania
.claude-plugin/plugin.json                     # wersja 1.8.1 (jedno z trzech zrodel)
.claude-plugin/marketplace.json                # wersja 1.8.1
core/MANIFEST.json                             # wersja 1.8.1
```

**Warunki pracy:** `claude -p` działał 2026-09-04 po południu (kod 0). Zachowanie niewydane mierzysz
artefaktem podłożonym lokalnie w projekcie kontrolnym (L-0085): hook przez `.claude/settings.json`,
komenda przez `.claude/commands/`, skill przez `.claude/skills/` pod **inną nazwą** niż wersja
z pluginu. Po wydaniu ta sama rzecz mierzy się już normalnie — i wtedy dopiero wolno napisać, że
działa w aplikacji.

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
   z katalogu odtwarzanego od razu** (L-0086). Wyczerpany limit konta zatrzymuje pomiar i idzie do
   odnogi — ale **niedostępność cudzej usługi sprawdzasz ponownie jednym najtańszym wywołaniem**
   (L-0084), a **datowanie działa w obie strony** (L-0087). **Przebieg, w którym oczekujesz ciszy,
   jest ważny wyłącznie razem z kontrolą pozytywną w tym samym przebiegu** — awaria ładowania
   modułu wygląda dokładnie jak zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz
   pierwszą (L-0088). (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073,
   L-0083, L-0084, L-0086, L-0087, L-0088)
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

W tym etapie centralne są zasady **10** (wersja potwierdzana plikiem instalacji, `grep` po starym
numerze), **1** (specyfikacja kompletna — każda zmieniona specyfikacja kończy się realnym
przykładem) i **2** (w dokumencie użytkownika stoi tylko to, co zmierzyłeś).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/REKOMENDACJA_MODELU/E4/`.** Wszystko tymczasowe —
projekty kontrolne, podłożone artefakty, instrumenty, wyjścia komend — powstaje tam. Artefakt, który
z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, cache pluginu), wpisujesz do wpisu
dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu. Katalog powstaje przy pierwszym
zapisie, nie na zapas.

1. **`adapters/claude-code/commands/relai-stage.md` — nazwa spoza listy w karcie potwierdzenia.**
   Punkt „Model wykonawczy" Kroku 4 dostaje trzeci przypadek obok „zgodny" i „inny niż wymagany":
   **model sesji nie występuje na liście z dnia X**. Karta pisze wtedy nazwę modelu sesji, klasę
   wymaganą przez plan i datę listy — i **nie blokuje startu**. Nazwę listy bierzesz ze zdania hooka
   startu, nigdy z własnego rozpoznania narzędzia.
2. **`core/templates/SPEC_PROMPT_ETAPU.md` — sekcja „3. Kontrola modelu".** Blockquote ma odtąd
   nieść **klasę i nazwę razem** (krok 6 diagramu z sekcji 5 planu), a przy nazwie — datę listy.
   Przykład na końcu specyfikacji przepisujesz tak, żeby pokazywał nową postać; specyfikacja bez
   realnego przykładu jest martwa (zasada 1). **Numeracji dziewięciu sekcji nie zmieniasz.**
3. **`core/templates/SPEC_CLAUDE_MD.md` — klasy z odesłaniem.** Punkt 8 układu i sekcja „Dobór
   modeli" mówią dziś wyłącznie „najsilniejszy / wyważony / najtańszy". Dochodzi jedno zdanie:
   nazwy modeli mieszkają w liście narzędzia (`.claude/relai/MODELE-<narzędzie>.md`), a wygenerowany
   `CLAUDE.md` odsyła do niej zamiast wpisywać nazwy na stałe — bo nazwy się starzeją, a plik
   projektu jest kopiowany latami.
4. **`core/templates/SPEC_STATUS.md` — narzędzie w linii metrycznej.** Linia metryczna zapisuje,
   **w jakim narzędziu** ustalono model wykonawczy (krok 7 diagramu z sekcji 5 planu). Przykład
   w specyfikacji przepisujesz razem z opisem; format linii pozostaje **jedną** linią z członami
   rozdzielonymi `·`.
5. **`core/tools/validate-adapters.js` — szóste sprawdzenie.** Każdy adapter zadeklarowany
   w `core/MANIFEST.json` z polem `models` ma wskazywać **istniejący** plik, a plik ma nieść
   czytelną linię `list-date: RRRR-MM-DD`. Wzorzec: `jest()` i `czytajJson()` (l. 24–28), komunikat
   dopisywany do `sprawdzone`, błąd — do `bledy`. Kod wyjścia bez zmian: 0 / 1 / 2.
6. **Wydanie.** Po decyzji o numerze: podbicie w **trzech** źródłach, `grep` po starym numerze
   z rozstrzygnięciem każdego trafienia, aktualizacja `docs/PULAPKI.md` P-005 tylko jeśli sekwencja
   się zmieniła, sekwencja wydania wykonana do końca i potwierdzenie **treścią pliku z cache'u**.
   Do wydania należy też liczba komend w `SPEC_KOMENDY.md`, jeśli specyfikacja ją niesie.
7. **Nie ruszasz**: `adapters/*/MODELE.md`, `relai-models.md`, `core/process/session-signals.js`,
   wiersza `Lista modeli` w `docs/USTAWIENIA.md`, zdań o liście w obu hookach startu ani
   `SPEC_USTAWIENIA.md` — chyba że wymusi to trafienie `grep`-a po starym numerze wersji, i wtedy
   zmiana dotyczy **wyłącznie** numeru.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Karta etapu mówi o modelu spoza listy — pokazane na materiale.** Projekt kontrolny z listą,
      na której modelu sesji nie ma: przejście Kroku 4 `/relai-stage` wypisuje nazwę modelu sesji,
      klasę z `STATUS.md` i datę listy, **i nie blokuje startu**. Kontrola negatywna w tym samym
      przebiegu: model obecny na liście → tego zdania nie ma (zasada 5 — cisza tylko z kontrolą
      pozytywną obok).
- [ ] **Trzy specyfikacje niosą realny przykład.** `SPEC_PROMPT_ETAPU.md`, `SPEC_CLAUDE_MD.md`
      i `SPEC_STATUS.md` — w każdej zmieniony fragment kończy się przykładem w nowej postaci,
      a `grep` po starym brzmieniu przykładu nie zwraca nic.
- [ ] **Walidator wyłapuje zerwaną deklarację `models`.** Na kopii `MANIFEST.json` ze ścieżką
      wskazującą nieistniejący plik: kod **1** i komunikat wymieniający adapter. Na repozytorium:
      kod **0** i szósta linia `+` w wykazie sprawdzeń. Obie wersje w jednym przebiegu (L-0040),
      materiał odtwarzany przed każdą.
- [ ] **Walidator wyłapuje listę bez czytelnej daty** — kopia `MODELE.md` z `list-date: wczoraj`
      daje kod 1; wersja poprawna w tym samym przebiegu daje 0.
- [ ] **Numer wersji zgodny w trzech źródłach** — `node core/tools/validate-adapters.js` wypisuje
      „3 zrodel, wartosc <nowy numer>", kod 0.
- [ ] **`grep` po starym numerze rozstrzygnięty co do trafienia** — wypisz w dzienniku liczbę
      trafień i co z każdym zrobiono; trafienia historyczne (dziennik, archiwum) zostają i to też
      jest rozstrzygnięciem.
- [ ] **Wydanie potwierdzone treścią pliku z cache'u, nie komunikatem CLI** (L-0004, L-0061):
      po sekwencji P-005 i restarcie aplikacji plik komendy `relai-models.md` **istnieje**
      w katalogu cache'u wydanej wersji, a hook startu z tego cache'u niesie zdanie o liście modeli.
- [ ] **Zdanie o wieku listy działa w wydanej wersji** — w projekcie kontrolnym z listą starszą niż
      próg start sesji (już bez podkładania hooka lokalnie) wypisuje linię `[RelAI lista modeli]`;
      przy liście świeżej — zero znaków.
- [ ] Pliki z sekcji „Nie ruszasz" niezmienione poza numerem wersji: `git diff` pokazuje w nich
      wyłącznie linie z numerem albo nic.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem; `docs/STATE.md`
      nadpisany; `docs/ARTEFAKTY.md` z podbitymi wersjami trzech specyfikacji i karty `/relai-stage`.
- [ ] Katalog roboczy `.claude/relai/work/REKOMENDACJA_MODELU/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Listę kasowania zapisuj **ścieżką rozwiązaną przez `path.resolve`**, nie
      literałem z escapowaniem — `kasuj` melduje `skasowane` także dla ścieżki, której nie ma
      (trzy reprodukcje, ostatnia w E3).

## Na koniec — rytuał obowiązkowy (bez niego etap NIE jest ukończony)

1. **`docs/plany/REKOMENDACJA_MODELU/STATUS.md`** — E4 → `ZREALIZOWANY <data>`, linia w dzienniku
   wdrożenia. Sekcję „Bramki manualne" odśwież: bramka numeru wydania → `ROZSTRZYGNIĘTA <data> —
   <numer i powód>`.
1a. **Katalog roboczy etapu** — zmierz, pokaż pozycje, skasuj po „tak"; obie liczby idą do wpisu
   z punktu 2.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Przejrzyj „Stan otwartych ryzyk": **M1**
   i **M2** dostają wynik z wydanej wersji, **M3** i **M4** — stan po wydaniu, **M5** — pierwszy
   pełny cykl (lista, komenda, próg, wydanie).
3. **`docs/STATE.md`** — wersja w aplikacji, sekcja „Co działa", sekcja „Nad czym pracujemy teraz"
   bez planu REKOMENDACJA_MODELU.
4. **`docs/ARTEFAKTY.md`** — podbicie wersji `SPEC_PROMPT_ETAPU.md`, `SPEC_CLAUDE_MD.md`,
   `SPEC_STATUS.md` i komendy `/relai-stage`.
5. **Sekwencja zamknięcia planu (D-36) zamiast generacji następnego promptu.** **Wczytaj skill
   `relai-planning`** narzędziem Skill — komenda wywołana wprost go nie ładuje, a pełna treść
   sekwencji mieszka tam. Wykonaj kroki 1–9 z sekcji „Zamknięcie planu": **otwarte bramki manualne**
   → **otwarte odnogi** → `STATE.md` → wpis zamykający „dowiezione vs plan" → status planu
   `ZREALIZOWANY` → przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → linia
   „Aktywny plan" w `CLAUDE.md` (warunek twardy: istniejący plik albo `brak`) → podsumowanie.
   Dwa pierwsze punkty są blokujące: dopóki bramki i odnogi nie są rozstrzygnięte, nigdzie nie
   piszesz, że plan jest zrealizowany. Odnoga `OPIS_REPO` jest **otwarta** i należy do innego planu
   — sprawdź, czy sekcja „Odnogi" tego `STATUS.md` niesie własne pozycje.
6. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.
