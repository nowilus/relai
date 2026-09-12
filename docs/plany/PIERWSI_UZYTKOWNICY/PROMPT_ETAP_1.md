# PROMPT_ETAP_1 — Materiał demo wyrenderowany z realnego przebiegu i wiarygodne wejście do README

Plan: PIERWSI_UZYTKOWNICY • Etap: **E1 z E3** • Wygenerowano: 2026-09-12 (autor: Opus 5, przy akceptacji planu; **poprawiony 2026-09-12 po Aneksie A**, przed startem etapu) • Wykonawca: **Opus** (linia metryczna `STATUS.md`, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym narzędziu:
> **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu — zatrzymaj się
> i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia etapu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — obowiązują w tym etapie bez wyjątku |
| `docs/plany/PIERWSI_UZYTKOWNICY/PLAN.html` | sekcja **10 (Aneks A — ten etap wykonujesz w jego brzmieniu)**, potem 2 (progi i nie-cele), 3 (stan wyjściowy i ocena krytyki), 5 (scenariusz, granica publikacji), 6 (zakres i odbiór E1), 7–9 (ryzyka, przypadki brzegowe, decyzje właściciela) |
| `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md` | tabela etapów, **cztery** bramki manualne, dziennik wdrożenia |
| `README.md` | plik, który ten etap zmienia — obecny początek, obietnice i drzewko repozytorium |
| `docs/STATE.md` | sekcje „Co działa", „Co dalej", „Co blokuje" — granica tego, co wolno obiecać w README i pokazać w materiale |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + ostatni wpis (2026-09-06, wydania 2.1.x i ryzyko W1) |
| `docs/PULAPKI.md` | P-005 (potwierdzanie wersji pluginu), P-010, P-011, P-012 (trzy wady dystrybucji) — instalacja kontrolna ma je respektować |
| `docs/USTAWIENIA.md` | preferencje projektu, wiersz „Artefakty robocze", lokalizacja backupów |
| `docs/zasoby/branding/` | banner, ikony, paleta — materiał wizualny, z którego korzysta render; grafik nie przerysowujesz |
| `docs/plany/PIERWSI_UZYTKOWNICY/ZRODLA.md` | co już odczytano 2026-09-12 i czego nie udało się odczytać — nie powtarzaj pracy |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Materiał demo produkuje agent, nie nagrywa go człowiek** (Aneks A, 2026-09-12). Wyjście:
  **25 s GIF** do README i **60 s MP4** na kanały (SZACUNEK), stos **Remotion**, napisy **PL i EN**,
  **bez ścieżki dźwiękowej**.
- **Treść to hybryda: brandowe wejście + wierny replay** realnego przebiegu w **neutralnym projekcie
  kontrolnym** (Aneks A). Żadna wypowiedź modelu nie jest dopisywana; klatka bez pokrycia
  w zachowanym zapisie źródłowym nie wchodzi do materiału.
- **Bohater materiału: plan jako osobny dokument, etapy i świeża sesja etapu** (Aneks A). Scenariusz
  z sekcji 5 („decyzja przeżywa sesję") mierzysz bez zmian, ale nie jest on osią materiału.
- **Cztery kierunki wizualne odrzucone na stałe** (konkurs designu 2026-08-07): skóra
  terminala/monospace-konsola, panel administracyjny, rysunek techniczny/blueprint, plakat
  brutalistyczno-szwajcarski. Nie wracają ani jako warianty, ani jako inspiracja. Kierunek
  oczekiwany: zaokrąglenia, lekki glassmorphism, typografia ozdobna, animowane zaokrąglone diagramy,
  dekoracyjne SVG w tle, animacja wyraźna ale służebna — bez dekoracji w pętli.
- **Układ liczy silnik, nie człowiek** (korekta Łukasza 2026-09-12, L-0094): każda klatka powstaje
  jako HTML z `grid`/`flex`, wymiary i typografia w jednostkach kontenera (`cqw`), karty domknięte
  `overflow`, tekst zawijany albo świadomie ucinany. Ręczne współrzędne zostają dla geometrii
  dekoracyjnej — krzywych i plam — **nigdy dla treści**. Nic rozmieszczonego „na oko", nic
  wystającego poza swój kontener, ta sama kompozycja w każdej szerokości renderu.
- **Stos renderu żyje w katalogu roboczym etapu** (Aneks A, ryzyko A2). `node_modules` i cache
  Remotiona nie wchodzą do repozytorium; do repo trafiają wyłącznie pliki wynikowe oraz skrypt scen.
- **Nazwa i tagline są zamrożone** (D-01): „RelAI", „Twój projekt pamięta wszystko". Komunikat
  roboczy z sekcji 5 planu jest tekstem do kalibracji, nie zamianą tagline'u.
- **Wariant eksperymentu: A — demo i pilotaż** (sekcja 4 planu). Strona i szeroka promocja (B),
  audyt funkcjonalny przed zaproszeniem (C) i wersja dla firm (D) są odrzucone; nie wracają.
- **Podstawowa ścieżka to Claude Code** (sekcja 5 planu). Drugie narzędzie w materiale jest
  opcjonalnym dodatkiem wyłącznie po pomiarze i w ramach rezerwy — w tym etapie go nie robisz.
- **Blokada sekretu nie jest główną historią materiału** (sekcja 5 planu).
- **Plan jest zamrożony od 2026-09-12** (D-33); sekcje 1–9 nietykalne. Kolejna rozbieżność → Aneks B,
  nie cicha korekta.
- **Liczby noszą etykietę FAKT albo SZACUNEK** (D-63); wpisy podpisujesz neutralnie.
- **Sekrety wyłącznie z `.env`** (D-42): w materiale i w README stoją nazwy zmiennych, nigdy
  wartości. Projekt kontrolny nie dostaje prawdziwego klucza.
- **Granica publikacji:** akceptacja planu pozwala **przygotować** materiały, nie wysłać je
  (sekcje 5 i 9 planu). Commit lokalny wolno; **`git push`, release, zmiana opisu repozytorium
  i kontakt z odbiorcami wymagają osobnej dyspozycji Łukasza**.
- **Zakres etapów następnych:** tekst zaproszenia dla Odpalone i własnej sieci, obsługa odnogi
  `OPIS_REPO`, rekrutacja i zbieranie prób to **E2**. `WYNIKI.md`, obserwacje po przerwie
  i rekomendacja kierunku to **E3** — tam też należy decyzja, czy źródła renderu zostają na stałe
  w repozytorium. W E1 nie dotykasz żadnej z tych rzeczy.

## Stan wyjściowy — co realnie zastajesz

Repozytorium ma **2.1.3** (README, `plugin.json`, `docs/USTAWIENIA.md` — FAKT, odczyt 2026-09-12),
tag `v2.1.3` jest na zdalnym, a **opublikowanym i potwierdzonym w aplikacji wydaniem jest 2.1.2**
(FAKT — `docs/STATE.md`, wpis dziennika z 2026-09-06). Seria 2.1.1–2.1.3 to naprawa trzech
niezależnych wad dystrybucji, po których użytkownik 2.0.0–2.1.1 nie miał komend w Claude Code
(P-010, P-011, P-012). To jest ryzyko „Pierwszy użytkownik trafia na wadę dystrybucji" z sekcji 7
planu — instalacja kontrolna tego etapu jest jego mitygacją, nie formalnością.

**Warunki pracy zmierzone 2026-09-12** (FAKT): `node` **24.13.1**, `npm` **11.8.0**, `python`
**3.14.3**. **`ffmpeg` i ImageMagick nie są na `PATH`** — Remotion nosi własny kompozytor, więc MP4
i GIF wychodzą bez nich, ale instalacja pakietów wymaga ruchu sieciowego i kilkuset MB w katalogu
roboczym (SZACUNEK).

Drzewo robocze ma zmiany niezacommitowane: `CLAUDE.md`, `docs/DZIENNIK.md`, `docs/STATE.md`
zmodyfikowane, `AGENTS.md` i `docs/plany/` nieśledzone (FAKT — `git status`, 2026-09-12).

Pliki istotne dla tego etapu:

```
README.md                                   # 556 linii; banner, „Znasz to?", „Co robi RelAI", instalacja, drzewko repo
docs/zasoby/branding/                       # banner, 13 ikon, grafiki README — materiał dla renderu, nietykalny
docs/zasoby/fonts/                          # fonty projektu; render korzysta z tych plików, nie z CDN
docs/plany/PIERWSI_UZYTKOWNICY/PLAN.html    # plan zamrożony 2026-09-12 + Aneks A w sekcji 10
docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md    # tabela etapów, cztery bramki, dziennik wdrożenia
docs/plany/PIERWSI_UZYTKOWNICY/ZRODLA.md    # rejestr źródeł odczytanych 2026-09-12
.claude/relai/tools/clean-work.js           # raport i kasowanie artefaktów roboczych
.claude/relai/MODELE-claude-code.md          # lista modeli, list-date 2026-09-04 (8 dni — może być nieaktualna)
```

Trzy nieaktualności README, które ten etap ma rozstrzygnąć (FAKT — odczyt 2026-09-12):

- linia **197** i linia **421** opisują korzeniowy katalog `skills/` jako miejsce wygenerowanego
  pakietu Codeksa; od 2.1.1 skille Codeksa leżą w `adapters/codex/skills/`, bo korzeniowy `skills/`
  kolidował nazwami z komendami (P-010),
- linia **209** mówi „E7 pozostaje w toku do czasu przejścia pełnej macierzy"; E7 i cały plan
  ROZWOJ_PO_WYDANIU zostały zamknięte 2026-09-05,
- README obiecuje ochronę konfiguracji szerzej, niż sięgają dowody: `config-protection` zwraca
  werdykt `ask`, więc w sesji z automatyczną akceptacją edycja sekcji niemutowalnej **cudzego**
  `CLAUDE.md` przeszła bez pytania (pomiar 2026-09-04). Skan sekretów tego problemu nie ma — `deny`.

**Czego jeszcze NIE ma (to jest zakres tego etapu):** potwierdzenia, że publicznie instalowalna
wersja realnie ładuje procedury w świeżym projekcie; realnego przebiegu „plan → etap → świeża sesja
wie, co robić" przeprowadzonego w neutralnym projekcie i zachowanego jako zapis źródłowy;
zaakceptowanego kierunku wizualnego; stosu renderu; scen, napisów PL/EN i tabeli pokrycia klatek;
plików wynikowych (25 s GIF, 60 s MP4); katalogu `docs/zasoby/demo/`; dokumentacji demo obok planu;
poprawionego początku README ograniczonego do zakresu dowodów.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości — zasada
w prompcie działa też wtedy, gdy rejestr urośnie):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. Wzorzec powtarzalny sprawdzasz na całej rodzinie dokumentów —
   punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo jego wartością
   jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia, nie usterką
   weryfikacji. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022,
   L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz obiema wersjami w jednym przebiegu, a instrument
   porównawczy implementuje wiernie każdą z nich. Kryterium stawiasz na poprawności wyniku, nie na
   kierunku liczby, której nie kontrolujesz. Kryterium sukcesu sprawdzasz na materiale, zanim
   zaczniesz pracę — kryterium arytmetycznie nieosiągalne wraca do człowieka jako aneks, a nie
   kończy etap jako niedowieziony punkt. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069,
   L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; dokładaj przypadek, który **musi** trafić; zero trafień przy niepustych zbiorach to
   defekt instrumentu, dopóki nie udowodnisz inaczej. Przebieg, w którym oczekujesz ciszy, jest
   ważny wyłącznie razem z kontrolą pozytywną w tym samym przebiegu — awaria ładowania modułu
   wygląda dokładnie jak zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz
   pierwszą. Cisza zmierzona złym wejściem jest fałszem, nie ciszą. Kontrolę pozytywną stawiasz na
   wejściu, którego mechanizm naprawdę pilnuje. Niedostępność cudzej usługi sprawdzasz ponownie
   jednym najtańszym wywołaniem, zanim odpiszesz pomiar jako niewykonalny — datowanie działa w obie
   strony, więc „usługa działała wczoraj" też jest hipotezą. Wyczerpany limit konta zatrzymuje
   pomiar i idzie do odnogi, nie do adnotacji „sprawdzone inaczej". (L-0032, L-0037, L-0054,
   L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088, L-0090,
   L-0091)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu jeden wyzwalacz.
   Próg porównuj do wielkości, którą mechanizm kontroluje, a sygnał o zatkaniu wyzwalaj różnicą
   między możliwym a wykonanym. (L-0034, L-0049, L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości, wartość nierozpoznana znaczy cisza. Rdzeń słowa
   w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`. Rdzenia szukasz w samym
   brzmieniu wartości, nie w całej komórce. Zamknięta lista ma koszt po drugiej stronie i ten koszt
   mierzysz. (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** — `CLAUDE.md`
   projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda wywołana wprost go
   nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza właściciela znaczy
   „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — także w treści komend, skilli i specyfikacji. Zachowanie zmienione, ale jeszcze
    niewydane, mierzysz artefaktem podłożonym lokalnie w projekcie kontrolnym, pod **inną nazwą**
    niż wersja z pluginu. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca. Kolejność wpisów w dokumencie
    jest takim samym wariantem — kierunek ustalaj z danych, nie z nawyku. Wariantem jest też stan
    dokumentu wobec własnej specyfikacji. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki; próbki sekretów składaj
    w czasie wykonania. Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do
    klasy wartości. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z warunkiem milczenia mechanizmu. Gdy narzędzie nie przyjmuje
    Twojego artefaktu, najpierw sięgnij po jego własny walidator albo widok statusu
    (`claude plugin validate`, `claude plugin list`) — zna schemat, którego nie odtworzysz
    z obserwacji, a cisza w logu nie jest dowodem poprawności. (L-0041, L-0042, L-0044, L-0047,
    L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. **Kompozycję z tekstem budujesz w warstwie, która liczy układ** — HTML
    z `grid`/`flex`, wymiary w jednostkach kontenera, karty domknięte `overflow`; ręczne
    współrzędne zostają dla geometrii dekoracyjnej, nigdy dla treści, bo szerokość napisu jest
    wtedy szacunkiem metryki fontu. Dziecko wychodzące poza kontener to defekt blokujący,
    a instrument mierzący prostokąty ma kontrolę pozytywną na podłożonym przepełnieniu.
    Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094)

Do tego jedna lekcja o grafice, której ten etap dotyczy wprost: **grafikę sprawdzasz na stronie,
która ją pokazuje, nie u siebie** (L-0075). GIF osadzony w README ocenia się na GitHubie — a to
wymaga pusha, więc do dyspozycji Łukasza zostaje jako NOT TESTED, nazwane wprost.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PIERWSI_UZYTKOWNICY/E1/`.** Wszystko tymczasowe —
neutralny projekt kontrolny, wyjścia komend instalacyjnych, zrzuty plików z cache'u pluginu, zapis
źródłowy przebiegów, projekt Remotiona wraz z `node_modules`, klatki pośrednie i warianty tekstu
README — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog
domowy, `~/.claude/plugins/cache/`, cache npm), wpisujesz do wpisu dziennika **z nazwy**, a jego
nazwę zaczynasz od slugu projektu (`relai-pierwsi-uzytkownicy-…`).

1. **Instalacja kontrolna publicznej wersji** — w nowym, neutralnym projekcie kontrolnym pod
   katalogiem roboczym przejdź ścieżkę obcego użytkownika:
   `claude plugin marketplace add nowilus/relai` → `claude plugin install relai@relai` → restart →
   sprawdzenie widoczności komend i realnego ładowania skilla startu sesji. **Wersję potwierdzasz
   treścią plików z cache'u instalacji, nie komunikatem CLI** (P-005, zasada 10). Przed pomiarem
   uruchom `claude plugin validate` na ścieżce instalacji (ryzyko W1). Zanotuj wersję Claude Code,
   model sesji, wersję RelAI, datę i godzinę. **Wersja publiczna różni się od repozytorium**
   (2.1.2 wobec 2.1.3) — badanie prowadzisz na wersji instalowalnej przez uczestnika, różnicę
   opisujesz wprost.
2. **Przebieg bohatera — „plan, etapy, świeża sesja etapu"** w tym samym projekcie kontrolnym:
   zainicjuj RelAI, poproś o plan dla prostego, zrozumiałego celu (projekt neutralny, nie RelAI),
   pokaż powstały `PLAN` i `STATUS.md` z tabelą etapów, zaakceptuj plan, pozwól wygenerować
   `PROMPT_ETAP_1.md`, uruchom etap kartą potwierdzenia, a potem **zamknij sesję i otwórz świeżą**
   bez przekazywania treści rozmowy — i pokaż, że nowa sesja wie, który to etap, skąd to wie i co
   jest następnym krokiem. Zachowaj **dosłowny zapis**: wyjścia terminala, treść wygenerowanych
   plików, odpowiedź świeżej sesji. To jest jedyny materiał, z którego wolno budować klatki.
3. **Przebieg zapasowy — „decyzja przeżywa sesję"** (sekcja 5 planu, mierzony bez zmian): zapis
   decyzji „lokalne pliki zamiast zewnętrznej bazy, bo projekt ma działać offline", pokazanie
   dokumentu decyzji z uzasadnieniem, świeża sesja odnajdująca ustalenie **ze wskazaniem pliku**.
   Wynik negatywny jest wynikiem — nie ustawiasz odpowiedzi, nie dopisujesz wypowiedzi modelu.
   Liczbę prób zapisujesz.
4. **Kalibracja smaku — bramka manualna przed produkcją serii.** Zbuduj **jedną** klatkę kluczową
   jako **HTML z układem liczonym przez silnik** (`grid`/`flex`, jednostki kontenera, karty
   z `overflow`) i przedstaw ją Łukaszowi. Bez zgody na kierunek wizualny render nie startuje.
   Kierunek: zaokrąglenia, lekki glassmorphism, typografia ozdobna, animowane zaokrąglone diagramy,
   dekoracyjne SVG w tle, paleta odsunięta od dosłownej palety dokumentów. Cztery kierunki
   odrzucone na stałe — patrz „Decyzje już podjęte". Kierunek zaakceptowany 2026-09-12 w rozmowie
   zamyka tę bramkę tylko wtedy, gdy werdykt jest zapisany w `DEMO.md`; sama rozmowa nie wystarcza.
5. **System projektowy materiału, nie zbiór jednorazowych klatek** —
   `render/styl.css` (albo równoważny moduł tokenów): jedna definicja palety, skali typograficznej,
   promieni, odstępów i siatki, używana przez **wszystkie** sceny obu cięć. Scena nie dostaje
   własnych, doraźnych wartości; nowa wartość wchodzi do tokenów albo nie wchodzi wcale. Fonty
   osadzone z `docs/zasoby/fonts/` (Fraunces, Caveat, Instrument Sans, JetBrains Mono) — nigdy CDN
   i nigdy zamiennik systemowy, bo zamiennik zmienia metrykę i psuje układ (L-0094).
6. **Instrument kontroli układu** — `render/kontrola-ukladu.*`: po zrenderowaniu scen mierzy
   prostokąty elementów i zgłasza **każde** dziecko wychodzące poza swój kontener oraz każdy tekst
   ucięty bez zamiaru. Instrument ma **kontrolę pozytywną**: podłożona scena z celowym
   przepełnieniem musi zostać zgłoszona (zasada 5) — bez tego zielony wynik nic nie znaczy.
7. **Stos renderu w katalogu roboczym** — projekt Remotiona pod
   `.claude/relai/work/PIERWSI_UZYTKOWNICY/E1/render/`: instalacja pakietów, kompozycje dla obu cięć,
   fonty brane z `docs/zasoby/fonts/` (nigdy z CDN). Sprawdź **przed** pierwszym `npm install`, że
   ścieżka jest ignorowana przez gita, i **po** instalacji, że `git status` nie widzi ani jednego
   pliku z `node_modules`.
8. **Sceny, napisy i tabela pokrycia** — `render/sceny.*` z układem obu cięć (25 s i 60 s) oraz
   dwoma zestawami napisów (PL i EN, ten sam render). Do tego **tabela pokrycia klatek**:
   każda klatka pokazująca plik albo odpowiedź agenta ma wskazane miejsce w zapisie źródłowym
   z punktu 2 albo 3. Tabela jest instrumentem — więc ma **kontrolę pozytywną**: podłóż jedną klatkę
   bez pokrycia i pokaż, że mechanizm ją zgłasza (zasada 5), potem ją usuń.
9. **Render plików wynikowych** — `demo-relai-25s.gif` (do README) i `demo-relai-60s.mp4`
   (na kanały), oba w wersji PL i EN, bez ścieżki dźwiękowej, czytelne bez dźwięku. GIF ma zmieścić
   się w rozsądnej wadze dla README — próg przyjmij i **zapisz w dokumentacji demo razem z komendą,
   którą go zmierzyłeś** (zasada 6); przekroczenie rozwiązujesz liczbą klatek i paletą, nie
   skróceniem materiału poniżej uzgodnionych 25 s.
10. **`docs/zasoby/demo/`** — katalog na zaakceptowane media, z `README.md` w środku: co tu wchodzi
   (formaty, długości, zakaz zasobów zewnętrznych), co zostaje w katalogu roboczym. Plik wynikowy
   wchodzi tu **po akceptacji Łukasza**; dopóki go nie ma, README nie linkuje nieistniejącego pliku
   (zasada 14).
11. **`docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md`** — dokumentacja materiału obok planu: (a) zmierzone
   wersje narzędzia, modelu i RelAI z punktu 1, (b) oba przebiegi krok po kroku z promptami do
   wklejenia dosłownie i liczbą prób, (c) tabela pokrycia klatek, (d) ograniczenia materiału wprost
   — co pokazuje, a czego nie dowodzi (w tym doradczy, nie twardy charakter `config-protection`),
   (e) jak odtworzyć render od zera, łącznie z wersjami pakietów.
12. **Poprawiony początek README** — `README.md`: zamknij trzy nieaktualności ze „Stanu wyjściowego",
    ogranicz obietnice do zakresu dowodów z `docs/STATE.md`, przygotuj miejsce osadzenia GIF-a
    i instrukcję instalacji w brzmieniu, które **wykonałeś dosłownie** w punkcie 1 (zasada 2).
    Nazwa, tagline, banner i ikony bez zmian.
13. **Ponowny odczyt `odpalone.pl/p/relai`** — przy generowaniu planu strony nie udało się odczytać
    (`ZRODLA.md`). Ponów **jedno najtańsze wywołanie** (zasada 5); wynik, udany albo nie, dopisz do
    `ZRODLA.md` z datą. Treści wpisu nie redagujesz — to E2.
14. **Git** — commit lokalny. **`git push` wyłącznie po jawnej dyspozycji Łukasza**; bez niej etap
    kończy się commitem lokalnym, a push wchodzi do „Do zrobienia przez człowieka".

**Świadomie odłożone do wpisu w dzienniku** (nie rób tego w tym etapie, choć widać, że się prosi):
wydanie 2.1.3 i release na GitHubie, aktualizacja `docs/PRZENOSNOSC.md` sekcji 2.3, odświeżenie
listy modeli (`/relai-models`, lista ma 8 dni przy progu 7), rotacja dziennika i ryzyk zamkniętych,
decyzja o trwałym miejscu źródeł renderu (należy do E3).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Instalacja publiczna działa u obcego użytkownika:** `claude plugin list` pokazuje `relai`
      bez `failed to load`, `claude plugin validate <ścieżka>` kończy się `Validation passed`,
      a `/relai` podpowiada **trzynaście** komend. Liczba wypisana w dzienniku.
- [ ] **Wersja potwierdzona plikiem, nie komunikatem:** `installed_plugins.json` wskazuje ścieżkę
      cache'u z numerem wersji, a co najmniej trzy pliki z tej ścieżki zgadzają się sumą kontrolną
      z odpowiednikami z tagu tej wersji **po normalizacji CRLF → LF** (zasada 11). Liczby
      „zgodnych / sprawdzonych" w dzienniku.
- [ ] **Kontrola pozytywna i negatywna ładowania w jednym przebiegu** (zasada 5): świeża sesja
      w projekcie kontrolnym wypisuje zdanie startu RelAI, a sesja w katalogu **nie będącym**
      projektem RelAI milczy. Oba przebiegi z tej samej instalacji, oba opisane.
- [ ] **Przebieg bohatera dowiedziony plikami, nie odpowiedzią agenta:** w projekcie kontrolnym
      istnieją na dysku plan, `STATUS.md` z tabelą etapów i `PROMPT_ETAP_1.md`; odpowiedź świeżej
      sesji cytuje ścieżkę promptu i numer etapu. Zapis źródłowy zachowany w katalogu roboczym.
- [ ] **Przebieg zapasowy zapisany z wynikiem** — pozytywnym albo negatywnym, razem z liczbą prób;
      dokument decyzji istnieje na dysku i zawiera uzasadnienie offline.
- [ ] **Kalibracja smaku zamknięta:** jedna klatka kluczowa pokazana Łukaszowi, jego decyzja
      zapisana w `DEMO.md` i w dzienniku. Render bez tej zgody nie startuje — brak zgody zamyka
      etap punktem niedowiezionym, a nie materiałem zrobionym „na wyczucie".
- [ ] **Tabela pokrycia klatek pełna i sprawdzona instrumentem, który potrafi się odezwać:** liczba
      klatek bez pokrycia **= 0**, a kontrola pozytywna z podłożoną klatką bez pokrycia zgłasza
      **dokładnie 1** (zasada 5). Obie liczby w dzienniku.
- [ ] **Układ nie przecieka — zero przepełnień, instrument potrafi się odezwać:** kontrola układu
      na **wszystkich** scenach obu cięć i obu wersjach językowych zgłasza **0** elementów
      wychodzących poza kontener i **0** tekstów uciętych bez zamiaru; kontrola pozytywna
      z podłożoną sceną przepełnioną zgłasza **dokładnie 1** (zasada 5, L-0094). Obie liczby
      w dzienniku. Napisy EN sprawdzone osobno — dłuższe słowa łamią układ tam, gdzie PL się mieści.
- [ ] **Tokeny projektowe są jedynym źródłem wartości:** żadna scena nie ma własnej barwy, promienia
      ani rozmiaru typografii poza modułem tokenów — dowód: wypisanie wartości dosłownych ze scen
      zwraca pustą listę. Fonty w renderze pochodzą z `docs/zasoby/fonts/`, nie z zamiennika
      systemowego (sprawdzone w wyrenderowanej klatce, nie w kodzie).
- [ ] **Pliki wynikowe mają uzgodnione parametry:** GIF 25 s ±2 s, MP4 60 s ±3 s (SZACUNEK
      z Aneksu A), obie wersje językowe wyrenderowane, oba pliki otwierają się i odtwarzają.
      Długości i wagi zmierzone komendą wypisaną w `DEMO.md`, nie „na oko".
- [ ] **Czytelność bez dźwięku:** materiał przejrzany z wyciszonym odtwarzaniem; każda teza
      w napisach ma pokrycie w `docs/STATE.md` albo w zapisie źródłowym. Napisy EN przeczytane
      osobno — nie są maszynowym kalkiem z PL.
- [ ] **Repozytorium nie wchłonęło stosu renderu:** `git status --porcelain` nie pokazuje ani
      jednego pliku z `render/node_modules`, a `git check-ignore -v` potwierdza regułę ignorowania.
      Kontrola pozytywna: ścieżka pliku wynikowego **nie** jest ignorowana.
- [ ] **Trzy nieaktualności README zamknięte, z dowodem negatywnym** (zasada 3): `git grep -nE
      "E7 pozostaje w toku"` nie zwraca nic w `README.md`; żadne zdanie README nie opisuje
      korzeniowego `skills/` jako miejsca pakietu Codeksa; zdanie o ochronie konfiguracji zgadza się
      z pomiarem z 2026-09-04. **Jednocześnie** `git diff README.md` pokazuje, że nazwa, tagline
      i ścieżki grafik mają nadal pierwotne brzmienie.
- [ ] **Instrukcja instalacji z README uruchomiona dosłownie** z powłoki, którą zobaczy czytelnik
      (zasada 2) — obie komendy, wynik zapisany; rozbieżność brzmienia poprawiona w README.
- [ ] **Brak martwych odsyłaczy do mediów:** wypisz odsyłacze z `README.md`, `DEMO.md`
      i `docs/zasoby/demo/README.md` i pokaż, że każdy wskazuje istniejący plik.
- [ ] `ZRODLA.md` ma datowany wynik ponownej próby odczytu `odpalone.pl/p/relai` — udanej albo nie.
- [ ] `git grep -nE "sk_(test|live)_|AKIA[0-9A-Z]{16}"` nie zwraca nic w plikach śledzonych;
      projekt kontrolny nie zawiera prawdziwego klucza.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z autorem w nagłówku, w układzie
      Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka;
      `docs/STATE.md` nadpisany w obszarze planu i w zdaniu o README.
- [ ] **Katalog roboczy:** `.claude/relai/work/PIERWSI_UZYTKOWNICY/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z **liczbami przed
      i po** we wpisie dziennika — `node_modules` Remotiona daje tu liczby rzędu dziesiątek tysięcy
      plików, więc raport przed operacją jest obowiązkowy. Artefakty poza tym katalogiem
      (marketplace w `~/.claude/`, cache pluginu, cache npm, ewentualny projekt w `%TEMP%`)
      wypisane z nazwy razem z tym, co się z nimi stało.

**Punkty, których w tym etapie zweryfikować się nie da** — nazwane wprost, nie udawane:

- **Osadzenie GIF-a na żywym GitHubie.** Grafikę ocenia się na stronie, która ją pokazuje (L-0075),
  a to wymaga pusha — czyli dyspozycji Łukasza. Do tego czasu sprawdzasz lokalny podgląd Markdowna
  i zapisujesz stan jako **NOT TESTED** razem z warunkiem wykonalności. Weryfikacja należy do E2.
- **Ocena estetyczna materiału.** Jest ludzka i mieszka w bramce „kalibracja smaku"; nie zastępujesz
  jej własnym werdyktem.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md`: E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO STARTU`,
   link do `PROMPT_ETAP_2.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia, adnotacja
   rozstrzygnięcia przy bramce „kalibracja smaku". Punkt niedowieziony opisujesz, zamiast zamykać
   etap na słowo.
2. `docs/DZIENNIK.md`: wpis wg szablonu na końcu sekcji „Wpisy". Zaktualizuj tabelę ryzyk — ryzyka
   A1–A3 z Aneksu A wymagające dalszego monitorowania dopisz tutaj, obecne ryzyka produktu zostają
   pod swoimi identyfikatorami. Lekcje z etapu dopisz do `docs/LEKCJE.md` i odśwież „Zasady aktywne"
   (limit 15 pozycji jest osiągnięty — nowa zasada wchodzi przez scalenie, nie jako szesnasta).
3. `docs/STATE.md` — nadpisz obszar planu PIERWSI_UZYTKOWNICY, stan README i stan materiału demo.
   `docs/ARTEFAKTY.md` — dopisz materiał demo i skrypt scen jako artefakty z wersją.
4. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md` — otwórz i przeczytaj, nie odtwarzaj z pamięci):
   na bazie sekcji 5 i 6 `PLAN.html` opisujących E2 (zaproszenie, odnoga `OPIS_REPO`, zbieranie
   prób), Aneksu A, realnego stanu po tym etapie i lekcji z tego etapu. Weryfikacja osadzenia GIF-a
   na GitHubie wchodzi tam jako punkt.
5. Commit. Push wyłącznie po dyspozycji Łukasza — tak samo jak każda zmiana widoczna publicznie.

RelAI (Opus 5) + Lukasz
