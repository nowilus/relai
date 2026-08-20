# SPEC — `CLAUDE.md` projektu

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku do projektu. Wygeneruj `CLAUDE.md` **w języku
projektu**, według poniższej struktury i zasad.

## Rola

Router procesowy, nie dokumentacja. `CLAUDE.md` jest wczytywany do kontekstu każdej sesji, więc
płaci się za niego tokenami przy każdym prompcie. Ma odpowiadać na jedno pytanie: *„czego mam się
trzymać i gdzie mam zajrzeć po resztę"*. Wszystko, co da się przenieść do `docs/`, ma tam być.

## Odbiorca

Agent (Claude Code) — pierwszy i najważniejszy. Człowiek czyta go rzadko, głównie przy przejmowaniu
projektu.

## Twardy limit objętości: 10 KB (od 1.6.0)

**Maksimum 10 KB.** Przekroczenie oznacza, że coś trzeba przenieść do `docs/`. Zero opisu
funkcjonalności, zero historii, zero list zrobionych rzeczy — te miejsca to `README.md`, `STATE.md`
i `DZIENNIK.md`.

**Jednostką jest rozmiar, nie liczba linii.** Do 1.5.2 limit brzmiał „maksimum 60 linii" i był
martwy w każdym zmierzonym projekcie — jeden po adopcji miał 1249 linii `FAKT`. Powód porażki jest
mechaniczny: linii nikt nie liczył, a kosztu kontekstu one i tak nie mierzą (jedna linia tabeli
bywa cięższa od pięciu linii listy). Od 1.6.0 limitem jest **próg cząstkowy `CLAUDE` z wiersza
`Budżet startu sesji`** w `docs/USTAWIENIA.md`, domyślnie **10 KB** — dokładnie ta sama liczba,
którą przy każdym starcie sesji mierzy hook. Sprawdzasz komendą, nie okiem:

```
node -e "console.log((require('fs').statSync('CLAUDE.md').size/1024).toFixed(1)+' KB')"
```

**Wartość projektowa ma pierwszeństwo przed domyślną** — projekt z własnym progiem w
`USTAWIENIA.md` pracuje na swojej liczbie, a `/relai-update` jej nie nadpisuje. Progi cząstkowe
nie sumują się do budżetu 80 KB i nie mają się sumować: 10 KB to sufit tej pozycji, nie przydział.

## Zakaz treści odtwarzalnej z repozytorium (od 1.6.0)

Treści, którą da się odtworzyć, patrząc na repozytorium, w `CLAUDE.md` **nie ma** — znika **bez
zastępnika**. Repozytorium jest swoją własną mapą, a każda linia tego pliku jest opłacana tokenami
w **każdym** prompcie sesji, także wtedy, gdy nikt jej nie czyta. Zmierzone 2026-08-20: w projekcie
po adopcji 512 linii mapy katalogów i 531 linii rejestru pułapek dawały 110 KB w pliku ładowanym do
każdego prompta `FAKT`.

**Podpada pod zakaz** (usuwasz, nie przenosisz):

- mapa katalogów i drzewo plików projektu,
- listy plików źródłowych, modułów, komponentów, endpointów, tabel bazy,
- opisy „co jest w którym pliku" i „za co odpowiada ten katalog",
- wyliczenia zależności i wersji bibliotek (są w pliku menedżera pakietów; wersje kluczowe —
  w `STATE.md`, warstwa faktografii),
- listy komend, skryptów i zadań dostępnych w projekcie (są w `package.json`, `Makefile`,
  `docs/KOMENDY.md`).

**Nie podpada** (zostaje, mimo że dotyczy repozytorium):

- reguły procesu — nie da się ich odczytać z kodu,
- **sekcja niemutowalna** — kanon pracy, nie opis projektu,
- **linia aktywnego planu** — wskazuje jeden plik, a nie odtwarza jego treści,
- **rytuał startu sesji** — to lista **czego** i **w jakiej kolejności** czytać, a nie opis, co tam
  jest,
- tabela „Stan prac" z maksymalnie pięcioma wierszami-drogowskazami: wiersz mówi „ten obszar, ten
  status, tam po szczegóły", nigdy „oto co zrobiono".

Granica jest jedna: **czy sesja odtworzy tę informację, patrząc na repozytorium?** Odtworzy →
zdanie wypada. Nie odtworzy → zostaje.

## Linia odsyłacza do `docs/PULAPKI.md` (element warunkowy, od 1.6.0)

Rejestr pułapek — rzeczy, które zaskoczyły i zaskoczą znowu — ma **własny dokument** czytany na
żądanie, nie przy starcie sesji: `docs/PULAPKI.md` (`SPEC_PULAPKI.md`). W `CLAUDE.md` zostaje
**jedna linia** w „Regułach procesu":

> Nieoczywiste zachowanie narzędzia, kolejność kroków, wymóg środowiska → `docs/PULAPKI.md`;
> zajrzyj tam, zanim uznasz, że coś jest zepsute.

**Linia jest warunkowa i pomijalna bez śladu** (L-0029): dokumentu nie ma → linii nie ma. Nie
zakładasz go na zapas i nie zostawiasz pustego odsyłacza „na przyszłość" (D-11). Pierwsza pułapka
zakłada dokument i **w tej samej turze** dokłada tę linię.

## Struktura sekcji (kolejność obowiązkowa)

1. **Nagłówek** — nazwa projektu + jedno zdanie: co to jest i dla kogo.
2. **Rytuał startu sesji** — numerowana lista plików do przeczytania, w kolejności, z jednozdaniowym
   uzasadnieniem każdego. Domyślnie: ten plik → `docs/STATE.md` → `docs/DZIENNIK.md` (sekcja ryzyk +
   ostatni wpis) → `docs/LEKCJE.md` (**wyłącznie** sekcja „Zasady aktywne" — D-15) →
   `docs/USTAWIENIA.md` → aktywny plan. Zakończ instrukcją „czytaj w tej kolejności, nie skanuj repo
   pełnotekstowo". `docs/DECYZJE.md` **nie jest** czytany na starcie — sięgasz po niego, gdy temat
   tego wymaga; w regułach procesu zostaje sama zasada „decyzji stamtąd się nie proponuje ponownie".
   Listę zamyka **jedna linia z trzema frazami sesji** (D-05) — patrz sekcja „Linia fraz sesji".
3. **Stan prac** — tabela `Co | Status | Gdzie` z maksymalnie pięcioma wierszami najwyższego
   poziomu. Szczegóły są w `STATE.md`; tu tylko drogowskazy.
4. **Aktywny plan** — dokładnie **jedna** linia w formacie `Aktywny plan: [<TEMAT>](docs/plany/<TEMAT>/STATUS.md)`,
   umieszczona zaraz pod tabelą „Stan prac" (D-30). Link prowadzi do `STATUS.md`, nie do `PLAN.md` —
   status jest tym, co się zmienia. Planów może być kilka, ale aktywny wskazujesz jeden; pozostałe
   są widoczne w `STATE.md`. Brak planu → linia `Aktywny plan: brak`. Linia nie znika nigdy — jej
   brak jest nieodróżnialny od zapomnienia o aktualizacji.
5. **Reguły procesu** — 4–8 punktów, wyłącznie takie, których złamanie realnie boli. Domyślny
   zestaw: język dokumentacji / kodu / commitów (z ustawień projektu); zakaz sekretów w plikach
   śledzonych; definicja ukończenia (punkt 6); zasada „decyzje zamrożone się nie wracają"; sposób
   wykonania etapów planu; **sygnał odchylenia** (niżej). Zasady, które wynikły z konkretnej
   korekty użytkownika, trafiają tu dopiero po powtórzeniu — inaczej rosną bez kontroli.
6. **Reguły profilu** — sekcja o stałym tytule `## Reguły profilu (<nazwa>)`, umieszczona zaraz po
   „Regułach procesu". Patrz niżej.
7. **Definicja ukończenia** — jedno zdanie i konsekwencja: zadanie jest ukończone, gdy kod działa
   **i** dokumenty (`STATE.md`, wpis w `DZIENNIK.md`) są zaktualizowane w tej samej turze. Bez tego
   zadanie jest w toku, niezależnie od stanu kodu (D-44).
8. **Dobór modeli — rekomendacja** — jawnie oznaczona jako rekomendacja, nie reguła (D-38): analiza,
   architektura i plany → model najsilniejszy; wykonanie etapów → model wyważony; zadania
   mechaniczne → model najtańszy. Dopisz jedno zdanie: użytkownik może to nadpisać przy każdym
   planie, a wybór trafia do `STATUS.md` planu (D-39).
9. **Sekcja niemutowalna** — patrz niżej.

## Linia fraz sesji

Jedna linia zaraz pod listą rytuału startu. Powód jest ten sam co przy regułach profilu: trzy
frazy naturalne (D-05) opisane wyłącznie w skillu działają tylko wtedy, gdy skill się wyzwoli —
a wyzwala się zawodnie (R2). `CLAUDE.md` jest w kontekście zawsze, więc to on ma **nieść regułę**;
skill dokłada pełną procedurę, gdy się załaduje.

Brzmienie (przetłumacz na język projektu, sensu nie zmieniaj):

> **Frazy sesji:** „kontynuujemy pracę" → rytuał startu, akapit „gdzie jesteśmy" **i jedno zdanie
> z propozycją najbliższego kroku**; „sprawdź status" → stan, plany, ryzyka, zaległości
> dokumentacyjne; „kończymy na dziś" → sync dokumentów, wpis do dziennika, przegląd ryzyk,
> propozycja commita.

Trzeci człon pierwszej frazy jest tym, co najczęściej wypada — zmierzone w pilotażu E10: sesja bez
wyzwolonego skilla napisała akapit „gdzie jesteśmy" i zakończyła pytaniem „Co dalej?" zamiast
propozycją. Dlatego w linii ma stać wyróżniony.

Linia liczy się do limitu 10 KB. Jeśli plik go przekracza, skracasz „Stan prac" albo „Reguły
procesu" — nie tę linię i nie sekcję profilu.

## Reguła sygnału odchylenia

Jeden punkt w „Regułach procesu", tryb rozkazujący. Powód jest ten sam co przy frazach sesji i
regułach profilu: zachowanie ma działać **zawsze**, a skill wyzwala się zawodnie (R2, L-0030).
`CLAUDE.md` jest w kontekście każdej sesji, więc to on niesie regułę; skill `relai-planning`
dokłada procedurę i rozstrzygnięcia, gdy się załaduje.

Brzmienie (przetłumacz na język projektu, sensu nie zmieniaj):

> Wątek spoza zakresu etapu → zatrzymaj się i zapytaj: odnoga (`/relai-branch`), aneks do planu czy
> „świadomie odłożone" do dziennika. Nigdy „przy okazji".

Punkt wchodzi do `CLAUDE.md` **każdego** projektu, także takiego, który nie ma jeszcze żadnego
planu — wtedy działa od pierwszego planu bez potrzeby dopisywania czegokolwiek później.

## Reguła rejestru decyzji po adopcji

Punkt w „Regułach procesu" — **wyłącznie w projekcie, który przeszedł przez `/relai-adopt`**,
czyli w takim, który ma sekcję „Zasady projektu (odziedziczone)". Projekt zakładany od zera go nie
dostaje: nie ma tam zastanej tabeli, do której cokolwiek mogłoby się dopisać, a punkt bez adresata
zjada budżet 10 KB (L-0029).

Brzmienie (przetłumacz na język projektu, sensu nie zmieniaj):

> Nowe rozstrzygnięcia zapisuj w `docs/DECYZJE.md` jako `D-NN` z datą i powodem. Sekcja „Zasady
> projektu (odziedziczone)" jest zapisem stanu sprzed adopcji — czytasz ją, nie dopisujesz do niej.

To samo zdanie stoi drugi raz **pod nagłówkiem sekcji odziedziczonej**, jako jedna linia. Dublowanie
jest tu celowe: reguła w „Regułach procesu" mówi, co robić, a zdanie przy sekcji łapie moment,
w którym ktoś już patrzy na zastaną tabelę i szuka miejsca na kolejny wiersz.

Powód reguły jest zmierzony: JiraManager po adopcji ma `CLAUDE.md` na 639 linii, bo osiem decyzji
podjętych po adopcji poszło do zastanej tabeli zamiast do pustego `DECYZJE.md` (retrospektywa
2026-08-12, `FAKT`).

## Sekcja „Reguły profilu"

Powstaje **przy inicjalizacji**, razem z resztą pliku — mimo że dokumenty warunkowe profilu
powstają dopiero przy zdarzeniu (D-10). To nie jest sprzeczność: sekcja niesie **regułę**, a nie
dokument. Bez niej reguła profilu istnieje wyłącznie w skillu i w hooku, a skill wyzwala się
zawodnie (R2).

Zasady:

- **Tytuł stały:** `## Reguły profilu (<nazwa>)`, gdzie `<nazwa>` to jedna z czterech wartości:
  `app`, `agent-voice`, `flow`, `prompty` (D-50). Tytuł tłumaczysz na język projektu, nazwę profilu
  — nie.
- **Miejsce stałe:** zaraz po „Regułach procesu", przed „Definicją ukończenia".
- **3–6 punktów, tryb rozkazujący.** Punkt mówi, co ma się stać i kiedy — nie tłumaczy filozofii
  profilu i nie powtarza reguł procesu.
- **Bez odsyłaczy do plików spoza projektu.** Katalog pluginu jest dla sesji niedostępny (L-0012),
  więc reguła ma być czytelna sama z siebie.
- **Limit 10 KB całego pliku obowiązuje dalej.** Sekcja profilu nie jest wyjątkiem — jeśli plik
  przekracza limit, skracasz punkty.

Gotowe brzmienie wszystkich czterech sekcji: `SPEC_PROFILE.md`, sekcja „Przykład". Profil zmieniony
przez człowieka → podmieniasz całą sekcję i dopisujesz wiersz w `USTAWIENIA.md`.

## Sekcja niemutowalna

Kończy plik, ma nagłówek jawnie mówiący, że jest niemutowalna, i cztery zasady (kanon Karpathy'ego).
Treść przenieś do języka projektu, sensu nie zmieniaj:

- **Think before coding** — nie zakładaj, sprawdź; niejasność to pytanie, nie domysł.
- **Simplicity first** — najprostsze działające rozwiązanie; zero spekulacyjnej generyczności.
- **Surgical changes** — zmieniaj minimum konieczne; nie refaktoryzuj przy okazji.
- **Goal-driven** — każda zmiana mapuje się na cel zadania; reszta idzie do dziennika jako
  „świadomie odłożone".

Tej sekcji nie edytuje się w ramach zwykłej pracy. Zmiana wymaga jawnej prośby użytkownika.

## Polityka aktualizacji

| Kiedy | Co się zmienia |
|---|---|
| Zmiana statusu dużego obszaru prac | wiersz w tabeli „Stan prac" |
| Start / zamknięcie planu | linia „Aktywny plan" |
| Reguła powtórzyła się drugi raz jako korekta użytkownika | dopisek w „Regułach procesu" (graduacja) |
| Zmiana ustawienia językowego / procesowego | odpowiedni punkt reguł, równolegle z `USTAWIENIA.md` |
| Zmiana profilu projektu (tylko na prośbę człowieka) | cała sekcja „Reguły profilu", równolegle z `USTAWIENIA.md` |
| Cokolwiek innego | **nie tutaj** — do `STATE.md`, `DZIENNIK.md` albo dokumentu tematycznego |

Sekcja niemutowalna: nigdy bez jawnej prośby.

## Przykład (fragment, projekt polski, profil `app`)

```markdown
# Parkly — rezerwacja miejsc parkingowych dla firm

## Rytuał startu sesji

Czytaj w tej kolejności, nie skanuj repo pełnotekstowo:
1. Ten plik.
2. [docs/STATE.md](docs/STATE.md) — stan na dziś.
3. [docs/DZIENNIK.md](docs/DZIENNIK.md) — „Stan otwartych ryzyk" + ostatni wpis.
4. [docs/LEKCJE.md](docs/LEKCJE.md) — wyłącznie sekcja „Zasady aktywne".
5. [docs/USTAWIENIA.md](docs/USTAWIENIA.md) — preferencje projektu.

**Frazy sesji:** „kontynuujemy pracę" → rytuał, akapit „gdzie jesteśmy" **i zdanie z propozycją
najbliższego kroku**; „sprawdź status" → stan, plany, ryzyka, zaległości; „kończymy na dziś" →
sync dokumentów, wpis do dziennika, ryzyka, propozycja commita.

## Stan prac

| Co | Status | Gdzie |
|---|---|---|
| Rezerwacje | DZIAŁA | docs/STATE.md |
| Płatności | W TOKU | docs/plany/PLATNOSCI/STATUS.md |

Aktywny plan: [PLATNOSCI](docs/plany/PLATNOSCI/STATUS.md)

## Reguły procesu

- Dokumentacja po polsku, kod i identyfikatory po angielsku, commity conventional po angielsku.
- Sekrety wyłącznie w `.env` (gitignored) — nigdy w plikach śledzonych.
- Zadanie jest ukończone dopiero z aktualnym STATE i wpisem w DZIENNIKU (ta sama tura).
- Decyzji z `docs/DECYZJE.md` nie proponuje się ponownie.
- Wątek spoza zakresu etapu → zatrzymaj się i zapytaj: odnoga (`/relai-branch`), aneks do planu czy
  „świadomie odłożone" do dziennika. Nigdy „przy okazji".

## Reguły profilu (app)

- Pierwszy plik źródłowy → w tej samej turze powstaje `docs/ARCHITEKTURA.md` i pada jedno pytanie
  o podejście do testów; odpowiedź do `docs/USTAWIENIA.md`.
- Pierwszy plik interfejsu → jedno pytanie o kierunek wizualny i `docs/DESIGN.md`.
- Pierwsze wdrożenie środowiska → `docs/srodowiska/<NAZWA>.md` z adresem, wskazaniem dostępów,
  procedurą wdrożenia i procedurą cofnięcia.
- W `docs/srodowiska/` są nazwy zmiennych i miejsce przechowywania sekretu — nigdy wartości.

## Dobór modeli (rekomendacja, nie reguła)

Analiza i plany → model najsilniejszy. Wykonanie etapów → model wyważony. Zadania mechaniczne →
model najtańszy. Przy każdym planie potwierdzasz wybór; trafia on do STATUS planu.

## Implementation guidelines (sekcja niemutowalna)

- **Think before coding**: nie zakładaj — sprawdź; niejasność → pytanie, nie domysł.
- **Simplicity first**: najprostsze działające rozwiązanie; zero spekulacyjnej generyczności.
- **Surgical changes**: zmieniaj minimum konieczne; nie refaktoryzuj przy okazji.
- **Goal-driven**: każda zmiana mapuje się na cel zadania; poza zakresem → do DZIENNIKA.
```
