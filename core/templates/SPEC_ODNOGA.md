# SPEC — `ODNOGA.md` i `PROMPT_ODNOGA.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj oba pliki **w języku projektu**
(nazwy plików stałe: `ODNOGA.md`, `PROMPT_ODNOGA.md`).

Lokalizacja zależy od tego, czy w projekcie trwa plan:

| Sytuacja | Folder |
|---|---|
| Jest aktywny plan | `docs/plany/<TEMAT>/odnogi/<NAZWA>/` |
| Nie ma żadnego planu niezamkniętego | `docs/fixy/<NAZWA>/` |

`<NAZWA>` w CAPS_SNAKE, w języku projektu, bez dat i numerów (ta sama konwencja co `<TEMAT>`,
D-12): `OPIS_REPO`, `WEBHOOK_RETRY`, `LITEROWKI_W_MAILACH`. Nazwa mówi, czego wątek dotyczy,
nie co się z nim zrobi.

## Rola

Odnoga to **boczny wątek, który urodził się w trakcie etapu i nie mieści się w jego zakresie** —
a jednocześnie jest za duży, żeby go zrobić „przy okazji", i za mały na własny plan.

Bez odnogi taki wątek kończy zawsze tak samo: albo rozdyma etap, albo ginie. Zmierzone
(retrospektywa 2026-08-12): pięć wpisów poprawkowych w jednym etapie JiraManagera i sześć aneksów
do jednego etapu PolyFlow — wszystkie z wątków, które nie miały gdzie zamieszkać.

Dwa pliki, dwie różne role:

- **`ODNOGA.md`** — karta wątku dla człowieka i dla planu: po co, co wchodzi w zakres, po czym
  poznać, że zrobione. Format miniplanu (D-31), bo odnoga jest wielkością miniplanu.
- **`PROMPT_ODNOGA.md`** — cała pamięć świeżej sesji, która ten wątek wykona. Lżejszy kuzyn
  `PROMPT_ETAP_N.md` (`SPEC_PROMPT_ETAPU.md`), z tą samą zasadą samowystarczalności (D-34).

## Odbiorca

`ODNOGA.md` — człowiek wracający do wątku i agent czytający `STATUS.md` planu.
`PROMPT_ODNOGA.md` — agent w świeżej sesji, na modelu wskazanym w karcie.

## Czego odnoga NIE robi

- **Nie dotyka `PLAN.md` / `PLAN.html`.** Plan zaakceptowany jest zamrożony (D-33), a odnoga nie
  jest aneksem: nie zmienia zakresu żadnego etapu ani celów planu. Zmiana samego planu to aneks,
  nie odnoga — i wtedy nie generujesz tych plików.
- **Nie zmienia tabeli etapów.** Odnoga nie jest etapem i nie dostaje numeru `EN`.
- **Nie rodzi kolejnej odnogi.** Jedna głębokość. Wątek z odnogi, który sam potrzebuje odnogi, jest
  sygnałem pełnego planu.
- **Nie generuje promptu następnej odnogi.** Łańcucha lazy-generacji tu nie ma — odnogi nie stoją
  w kolejce.

---

## `ODNOGA.md` — struktura

1. **Nagłówek** — `# ODNOGA — <tytuł wątku>`; tytuł mówi, co ma się zmienić.
2. **Linia metryczna** — jedna linia, elementy oddzielone `·`:
   - `Plan: <TEMAT>` z linkiem do `STATUS.md` planu — albo `Plan: brak (wątek samodzielny)`
     w wariancie `docs/fixy/`,
   - `Etap-źródło: E<N> — <nazwa>` (etap, w którym wątek się urodził) albo `Etap-źródło: —`,
   - `Utworzona: <data>`,
   - `Status: **OTWARTA**`,
   - `Wykonawca: <model>` — z linii metrycznej `STATUS.md` planu; bez planu: rekomendacja z
     `CLAUDE.md` projektu.
3. **Cel** — jedno zdanie: po czym poznamy, że zrobione. Nie „poprawić opis", tylko „opis repo na
   GitHubie mówi, czym jest RelAI, w jednym zdaniu widocznym na liście repozytoriów".
4. **Skąd się wzięła** — 1–3 zdania: co się działo, gdy wątek wypłynął. To jest jedyne miejsce,
   w którym pamięć o kontekście przetrwa do czasu wykonania.
5. **Zakres** — 2–5 punktów, każdy ze ścieżką pliku albo z nazwą rzeczy do zmiany. Punkt bez
   wskazanego artefaktu jest życzeniem.
6. **Poza zakresem** — lista rzeczy sąsiadujących, których odnoga **nie** rusza. Krótka i konkretna;
   od niej zależy, czy odnoga nie urośnie w drugi plan.
7. **Weryfikacja** — checkboxy `- [ ]`, każdy sprawdzalny. Sekcja obowiązkowa (D-25), także przy
   wątku jednoplikowym.
8. **Wynik** — pusta do czasu zamknięcia; przy zamknięciu 1–3 zdania: co powstało, czego nie i
   dlaczego, plus link do wpisu w dzienniku.

## Statusy odnogi

| Status | Kiedy |
|---|---|
| `OTWARTA` | utworzona, jeszcze niewykonana lub w trakcie |
| `ZAMKNIĘTA <data>` | wykonana i domknięta rytuałem zamknięcia odnogi |
| `PRZENIESIONA <data> → docs/fixy/<NAZWA>/` | plan zamykał się z otwartą odnogą, a człowiek zdecydował, że wątek żyje dalej samodzielnie |

Odnogi porzuconej nie kasujesz (D-18) — dostaje `ZAMKNIĘTA <data>` z sekcją „Wynik" mówiącą
wprost, że wątek odpuszczono i dlaczego.

---

## `PROMPT_ODNOGA.md` — struktura

Osiem elementów w stałej kolejności. To jest odchudzony `SPEC_PROMPT_ETAPU.md`: te same zasady
(samowystarczalność, stan faktyczny zamiast planowanego, liczby z etykietą FAKT/SZACUNEK),
mniej sekcji, bo odnoga jest mniejsza od etapu.

### 1. Nagłówek

`# PROMPT_ODNOGA — <tytuł wątku>`.

### 2. Linia metryczna

Elementy oddzielone `•`: `Odnoga: <NAZWA>` • `Plan-rodzic: <TEMAT>, etap E<N>` (albo
`Plan-rodzic: brak`) • `Wygenerowano: <data> (autor: <model>)` • `Wykonawca: **<model>**`.

Człon **plan-rodzic jest obowiązkowy** — świeża sesja musi wiedzieć, czyjego planu nie wolno jej
tknąć.

### 3. Kontrola modelu

Blockquote, jedno zdanie: wykonuj wyłącznie na modelu klasy X, w tym narzędziu — nazwa (i data
listy, z której nazwa pochodzi); inny model → zatrzymaj się i poproś o przełączenie. Nazwę i datę
bierzesz z listy modeli narzędzia (`.claude/relai/MODELE-<narzędzie>.md`, pole `list-date`); która
lista obowiązuje, mówi zdanie hooka startu. Listy nie ma → zdanie zostaje przy samej klasie, bez
zmyślonej nazwy. Postać zdania jest ta sama co w `SPEC_PROMPT_ETAPU.md`, sekcja 3 — odnoga i etap
mówią o modelu jednym językiem. Sekcja obowiązkowa nawet wtedy, gdy projekt ma jeden model do
wszystkiego.

### 4. Co przeczytać na start

Tabela `Plik | Po co`, nagłówek z dopiskiem **w tej kolejności, nic więcej**. Typowo 3–6 pozycji —
mniej niż w prompcie etapowym, bo zakres jest węższy. Zawsze obecne: `CLAUDE.md`, karta odnogi
(`ODNOGA.md`), pliki, które wątek będzie zmieniał. `PLAN.md` / `PLAN.html` planu-rodzica **tylko
wtedy**, gdy odnoga naprawdę potrzebuje kontekstu planu — zwykle nie potrzebuje.

### 5. Decyzje już podjęte — NIE otwieraj ich ponownie

Lista punktowa z numerami `D-NN` albo źródłami. Ostatni punkt jest **stały i obowiązkowy** —
granica wobec planu głównego, w tym brzmieniu (przetłumaczonym na język projektu, sens bez zmian):

> **Nie ruszasz planu głównego.** `PLAN.md` / `PLAN.html` planu-rodzica jest zamrożony (D-33):
> nie edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`.
> Jedyne, co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

Wariant bez planu (`docs/fixy/`): ostatni punkt mówi, że wątek jest samodzielny i **w żadnym
`STATUS.md` niczego nie zapisuje**.

### 6. Stan wyjściowy — co realnie zastajesz

Stan faktyczny repozytorium, sprawdzony w chwili generacji, nie stan planowany. Zawiera:

- jedno–dwa zdania o tym, co w tym obszarze jest dzisiaj,
- listę plików istotnych dla wątku z jednolinijkowym opisem każdego,
- akapit **„Czego jeszcze NIE ma"** — dokładnie to, co odnoga ma dowieźć,
- **„Zasady aktywne" z `docs/LEKCJE.md` przepisane w całości** — tak samo jak w prompcie etapowym.
  Odnoga jest mniejsza, ale świeża sesja jest tak samo świeża.

### 7. Zakres i weryfikacja

**Sekcja otwiera się linią z katalogiem roboczym odnogi**, przed pierwszym punktem zakresu, w tym
kształcie (ścieżka podstawiona, nie opisana):

> **Katalog roboczy tej odnogi: `.claude/relai/work/<TEMAT>/<NAZWA_ODNOGI>/`.** Wszystko tymczasowe
> powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy,
> klon cudzego repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od
> slugu projektu.

Wariant samodzielny (`docs/fixy/<NAZWA>/`) używa tej samej ścieżki z nazwą wątku w miejscu tematu:
`.claude/relai/work/_fixy/<NAZWA>/`. Katalog powstaje przy pierwszym zapisie, nie na zapas (D-11).

Dalej dwie krótkie sekcje: zakres przepisany z karty odnogi (punkty ze ścieżkami plików) i checkboxy
weryfikacji. Rozbieżność między kartą a promptem jest błędem — karta jest źródłem.

Wśród checkboxów stoi **zawsze** punkt o katalogu roboczym, w tych samych dwóch częściach co
w prompcie etapowym: **(a)** katalog przejrzany raportem
(`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po do
wpisu dziennika; **(b)** artefakty spoza tego katalogu wypisane z nazwy. Wyłączony wiersz
`Artefakty robocze` w `docs/USTAWIENIA.md` tego punktu **nie wycisza** — jest częścią definicji
zamknięcia odnogi.

### 8. Na koniec — rytuał zamknięcia odnogi

Numerowana lista, z nagłówkiem mówiącym wprost: **bez tego rytuału odnoga NIE jest zamknięta**.

1. **`ODNOGA.md`** — status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona.
2. **`STATUS.md` planu-rodzica** — linia tej odnogi w sekcji „Odnogi" → `ZAMKNIĘTA <data>`.
   Tabeli etapów i dziennika wdrożenia **nie ruszasz**. Wariant `docs/fixy/`: punkt odpada.
2a. **Katalog roboczy odnogi** — zmierz (`node .claude/relai/tools/clean-work.js raport`), pokaż
   pozycje i skasuj po „tak"; obie liczby, przed i po, idą do wpisu w punkcie 3. Artefakty spoza
   katalogu wypisz z nazwy. Numer z literą, a nie `3`, żeby numeracja pozostałych punktów
   pozostała nietknięta — krok stoi **przed** wpisem, bo wpis ma go opisać.
3. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy".
4. **`docs/STATE.md`** — tylko jeśli odnoga zmieniła stan projektu widoczny na tym poziomie.
5. **Commit** — propozycja, conventional message. Jedyny punkt, o który pytasz.

Punktu „wygeneruj następny prompt" tu **nie ma** — odnogi nie tworzą łańcucha.

---

## Zakazy

- Nie generujesz `PROMPT_ODNOGA.md` bez `ODNOGA.md` ani odwrotnie — pliki chodzą w parze.
- Nie wpisujesz odnogi do tabeli etapów `STATUS.md` i nie nadajesz jej numeru etapu.
- Nie zakładasz folderu `odnogi/` na zapas — powstaje razem z pierwszą odnogą (D-11).
- Nie tworzysz odnogi dla wątku, który jest zmianą samego planu — to aneks (D-33).
- Nie tworzysz odnogi z wnętrza odnogi — jedna głębokość, patrz „Czego odnoga NIE robi".
- Nie zostawiasz karty bez sekcji „Weryfikacja" (D-25) ani promptu bez „Zasad aktywnych".
- Zero sekretów — nazwy zmiennych tak, wartości nigdy (D-42).

---

## Przykład — `ODNOGA.md` (projekt polski, plan PLATNOSCI, odnoga z etapu E2)

```markdown
# ODNOGA — ponowione zdarzenia Stripe w logu aplikacji

Plan: [PLATNOSCI](../../STATUS.md) · Etap-źródło: E2 — Stripe Checkout + webhook · Utworzona:
2026-08-15 · Status: **OTWARTA** · Wykonawca: Opus

## Cel

Ponowione zdarzenie Stripe (to samo `event.id` drugi raz) zostawia w logu jedną linię na poziomie
`info` z numerem zamówienia — dziś nie zostawia nic i nie da się odróżnić duplikatu od zdarzenia,
które nigdy nie doszło.

## Skąd się wzięła

W E2 idempotencja webhooka została zrobiona i przetestowana, ale przy testach okazało się, że
duplikat jest **cichy**: kończy się `200` i pustym logiem. Sam mechanizm jest poprawny, więc to nie
jest błąd etapu — to brakująca obserwowalność, spoza zakresu E2.

## Zakres

1. `src/app/api/payments/webhook/route.ts` — gałąź „zdarzenie już przetworzone" loguje
   `info` z `event.id`, `orderId` i datą pierwszego przetworzenia.
2. `src/payments/int/webhook.test.ts` — test sprawdzający, że drugie wywołanie zostawia dokładnie
   jedną linię logu.

## Poza zakresem

- Metryki i alerty (osobny temat, nie ma dziś żadnej warstwy metryk).
- Zmiana formatu logów w pozostałych endpointach.
- Cokolwiek w tabeli `ProcessedEvent` — schemat zostaje z E2.

## Weryfikacja

- [ ] `npm run test:int` przechodzi, nowy test też.
- [ ] Zdarzenie wysłane dwa razy przez `stripe trigger` daje w logu dokładnie jedną linię `info`
      z numerem zamówienia (sprawdzone na wyjściu, nie na kodzie).
- [ ] `git diff` nie dotyka żadnego pliku spoza dwóch wymienionych w zakresie.
- [ ] Katalog roboczy `.claude/relai/work/PLATNOSCI/PONOWIONE_ZDARZENIA/` przejrzany raportem
      i skasowany po „tak"; liczby przed i po we wpisie dziennika, artefakty spoza niego z nazwy.

## Wynik

—
```

## Przykład — `PROMPT_ODNOGA.md` (ta sama odnoga, fragmenty kluczowych sekcji)

```markdown
# PROMPT_ODNOGA — ponowione zdarzenia Stripe w logu aplikacji

Odnoga: PONOWIONE_ZDARZENIA • Plan-rodzic: PLATNOSCI, etap E2 • Wygenerowano: 2026-08-15
(autor: Opus) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/PLATNOSCI/odnogi/PONOWIONE_ZDARZENIA/ODNOGA.md` | cel, zakres i weryfikacja — karta jest źródłem, ten prompt tylko ją wykonuje |
| `src/app/api/payments/webhook/route.ts` | gałąź „już przetworzone" — tu wchodzi log |
| `src/payments/int/webhook.test.ts` | konwencja testów integracyjnych z E2 |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Poziom logu to `info`, nie `warn` — duplikat jest normalnym zachowaniem Stripe'a, nie usterką.
- Formatu logów nie zmieniamy; dopisujesz linię w istniejącej konwencji.
- **Nie ruszasz planu głównego.** `PLAN.md` planu PLATNOSCI jest zamrożony (D-33): nie edytujesz
  jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne, co ta
  odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

Webhook z E2 działa, idempotencja przetestowana (11 testów integracyjnych, wszystkie zielone).

```
src/app/api/payments/webhook/route.ts   # weryfikacja podpisu + dwie gałęzie zdarzeń
src/payments/int/webhook.test.ts        # 11 testów, w tym „zdarzenie powtórzone"
```

**Czego jeszcze NIE ma:** żadnego śladu w logu przy zdarzeniu powtórzonym — gałąź kończy się
`return new Response(null, { status: 200 })` bez linii logu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości):
1. Każdy endpoint przyjmujący dane z zewnątrz waliduje wejście schematem, zanim cokolwiek zapisze
   (L-0001).
2. Testy integracyjne odpalasz komendą `npm run test:int` (L-0003).

## Zakres i weryfikacja

**Katalog roboczy tej odnogi: `.claude/relai/work/PLATNOSCI/PONOWIONE_ZDARZENIA/`.** Wszystko
tymczasowe powstaje tam; artefakt spoza projektu wpisujesz do wpisu dziennika z nazwy.

(zakres i checkboxy przepisane z karty — karta jest źródłem)

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md`: status → `ZAMKNIĘTA 2026-08-15`, sekcja „Wynik" wypełniona.
2. `docs/plany/PLATNOSCI/STATUS.md`: linia tej odnogi w sekcji „Odnogi" → `ZAMKNIĘTA 2026-08-15`.
   Tabeli etapów i dziennika wdrożenia nie ruszasz.
2a. Katalog roboczy `.claude/relai/work/PLATNOSCI/PONOWIONE_ZDARZENIA/` — raport, „tak", kasowanie;
   liczby przed i po do wpisu z punktu 3.
3. `docs/DZIENNIK.md`: wpis wg szablonu, na końcu sekcji „Wpisy".
4. `docs/STATE.md` — bez zmian, odnoga nie zmienia stanu obszaru płatności.
5. Commit (conventional, EN) — propozycja, nie wykonanie bez zgody.
```
