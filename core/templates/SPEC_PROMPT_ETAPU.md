# SPEC — `docs/plany/<TEMAT>/PROMPT_ETAP_N.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `PROMPT_ETAP_N.md` **w języku
projektu** (nazwa pliku stała: `PROMPT_ETAP_N.md`, gdzie `N` to numer etapu bez zer wiodących —
`PROMPT_ETAP_1.md`, `PROMPT_ETAP_10.md`), obok `PLAN.md` i `STATUS.md` w folderze planu.

## Rola

Prompt etapowy to **cała pamięć, jaką dostanie świeża sesja**. Etap wykonuje się w nowej sesji, bez
kontekstu poprzedniej: agent nie wie, co zrobiono wczoraj, czego nie wolno ruszać i po czym poznać,
że skończył. Prompt musi mu to dać w jednym pliku.

Stąd wymóg **samowystarczalności** (D-34): po przeczytaniu promptu i wymienionych w nim plików agent
ma komplet — nie musi szukać, zgadywać ani pytać o rzeczy, które są już rozstrzygnięte.

Format: **Markdown** (D-32 — dokument czysto agentowy; interaktywny HTML jest dla planów czytanych
przez człowieka).

## Odbiorca

Agent w świeżej sesji, model wskazany w `STATUS.md` planu. Człowiek czyta ten plik najwyżej raz,
żeby sprawdzić, co się wydarzy — więc język ma być zwięzły i konkretny, a nie tłumaczący.

## Kiedy powstaje (generacja LAZY — D-34)

| Moment | Co powstaje |
|---|---|
| Akceptacja planu | `PROMPT_ETAP_1.md` — pierwszy i jedyny w tym momencie |
| Rytuał „Na koniec" etapu N | `PROMPT_ETAP_N+1.md`, jeszcze w tej samej turze co zamknięcie etapu N |
| Start sesji, gdy etap `GOTOWY DO STARTU` nie ma promptu | siatka bezpieczeństwa dogenerowuje brakujący po zgodzie użytkownika |

**Nie generujesz promptów na zapas.** Prompt etapu N+2 pisany dzisiaj opisywałby stan wyjściowy,
którego nie znasz — a to jest dokładnie ta jedna rzecz, której prompt nie ma prawa zmyślić.

Etap zamknięty bez wygenerowanego promptu następnego etapu **nie jest ukończony** (D-34).

## Struktura pliku — dziewięć elementów w stałej kolejności

### 1. Nagłówek

`# PROMPT_ETAP_N — <zwięzły tytuł etapu>` — tytuł mówi, co powstanie, nie „Etap 4".

### 2. Linia metryczna

Jedna linia, elementy oddzielone `•`:

- `Plan: <TEMAT>`
- `Etap: **EN z EM**` (M = liczba etapów w planie)
- `Wygenerowano: <data> (autor: <model>, w rytuale „Na koniec" etapu N-1)`
- `Wykonawca: **<model>**` — **przepisany z linii metrycznej `STATUS.md`**, dosłownie. Gdy plan
  różnicuje model per etap („złożone etapy: Opus, mechaniczne: Haiku"), wpisujesz model właściwy
  **dla tego etapu** i w nawiasie skąd wynika.

### 3. Kontrola modelu

Blockquote, jedno zdanie z numerem decyzji, jeśli model jest decyzją zamrożoną. Zdanie niesie
**klasę i nazwę razem**, a przy nazwie — datę listy, z której nazwa pochodzi:

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **<klasa>**, w tym narzędziu:
> **<nazwa>** (lista modeli z dnia `<list-date>`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

Nazwa i data pochodzą z listy modeli narzędzia (`.claude/relai/MODELE-<narzędzie>.md`, pole
`list-date`); która lista obowiązuje — mówi zdanie hooka startu, nie własne rozpoznanie narzędzia.
**Listy nie ma → zdanie zostaje przy samej klasie**, bez zmyślonej nazwy i bez daty; sama klasa
wystarcza, żeby sesja wiedziała, czy została uruchomiona właściwie.

Sekcja obowiązkowa nawet wtedy, gdy model jest ten sam we wszystkich etapach. Świeża sesja nie wie,
na czym została uruchomiona.

### 4. Co przeczytać na start

Tabela `Plik | Po co`, z dopiskiem w nagłówku sekcji: **w tej kolejności, nic więcej**.

Zasady doboru:

- **Pozycji tyle, ile trzeba, i ani jednej więcej** — 6–10 to typowy rozmiar (SZACUNEK). Lista
  dłuższa niż kilkanaście pozycji znaczy, że zakres etapu jest za szeroki.
- Przy dokumencie długim **wskaż sekcję**, nie plik: „`docs/DZIENNIK.md` — sekcja »Stan otwartych
  ryzyk« + ostatni wpis", nie „`docs/DZIENNIK.md`".
- Kolumna „Po co" mówi, **co agent ma stamtąd wziąć**, nie czym ten plik jest.
- Zawsze obecne: `CLAUDE.md`, aktywne zasady z rejestru lekcji, `PLAN.md` (sekcje właściwe dla tego
  etapu), pliki, które etap będzie zmieniał.
- **Zakaz** wpisywania „przejrzyj repo", „zapoznaj się z kodem" — to nie jest pozycja do przeczytania.

### 5. Decyzje już podjęte — NIE otwieraj ich ponownie

Lista punktowa. Każdy punkt: rozstrzygnięcie **plus numer decyzji** (`D-NN`) albo źródło (aneks,
lekcja, wpis w dzienniku).

Ta sekcja jest tarczą przed najczęstszym marnotrawstwem świeżej sesji: przeprojektowaniem czegoś,
co zostało uzgodnione trzy sesje wcześniej. Wpisujesz tu wyłącznie decyzje **dotykające tego etapu**
— rejestr decyzji w całości jest w `docs/DECYZJE.md` i agent nie ma go czytać na starcie.

Ostatni punkt sekcji zawsze wyznacza **granicę zakresu**: co należy do etapów następnych i czego
w tym etapie robić nie wolno („hooki to E5 — nie obiecuj ich; szablon HTML: E6").

### 6. Stan wyjściowy — co realnie zastajesz

**Stan faktyczny repozytorium, nie stan planowany.** Piszesz go w chwili zamykania etapu N-1, więc
masz go przed oczami; prompt pisany „z planu" prowadzi świeżą sesję na pliki, których nie ma.

Zawiera:

- jedno zdanie o wersji/stanie produktu i o rzeczach zmienionych od poprzedniego etapu, w tym
  **zmianach warunków pracy** (np. „plugin jest zainstalowany", „testy odpalasz komendą X"),
- **drzewko albo listę plików** istotnych dla etapu, z jednolinijkowym opisem zawartości każdego,
- akapit **„Czego jeszcze NIE ma"** — dokładnie to, co ten etap ma dowieźć,
- **listę aktywnych zasad z rejestru lekcji**, przepisaną w całości (nie linkiem): świeża sesja
  czyta `LEKCJE.md`, ale zasada wpisana wprost w prompt działa nawet wtedy, gdy plik urośnie.

### 7. Zakres etapu

**Sekcja otwiera się linią z katalogiem roboczym etapu**, przed pierwszym punktem zakresu, w tym
kształcie (ścieżka podstawiona, nie opisana):

> **Katalog roboczy tego etapu: `.claude/relai/work/<TEMAT>/E<N>/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Świeża sesja ma tę ścieżkę **przepisać, nie wymyślić** — dlatego podajesz ją dosłownie,
z podstawionym tematem planu i numerem etapu. Katalog powstaje przy pierwszym zapisie i nikt nie
zakłada go na zapas (D-11).

Dalej: numerowana lista rzeczy do zrobienia. Każdy punkt: **artefakt** (ścieżka pliku) **i**
decydujące wymagania wobec niego. Punkt bez wskazanego pliku jest życzeniem, nie zakresem.

Elementy, które w praktyce zamykają etap i łatwo je pominąć, wymieniasz osobno: podbicie wersji,
aktualizacja dokumentu użytkownika (`KOMENDY.md`), dogfooding, git.

Zakres promptu **nie może wyjść poza zakres etapu z `PLAN.md`**. Widzisz, że coś trzeba zrobić,
a plan tego nie przewiduje → wpisujesz to jako punkt „świadomie odłożone" do wpisu w dzienniku,
a nie po cichu do zakresu.

### 8. Weryfikacja

**Sekcja obowiązkowa zawsze** (D-25), także przy etapie mechanicznym. Lista checkboxów `- [ ]`,
nagłówek mówi wprost: **wszystkie punkty muszą przejść**.

Zasady:

- Każdy punkt musi być **sprawdzalny** — komenda, plik, konkretna treść. „Kod działa" nie jest
  punktem weryfikacji; „`npm test` kończy się bez błędu" jest.
- Sprawdzenie zachowania typu „tego nie wolno" wymaga **dowodu negatywnego**: pokaż, że chroniony
  fragment ma nadal pierwotne brzmienie, nie tylko że nowy artefakt powstał.
- Ostatnie punkty dotyczą śladów pracy: wpis w dzienniku we właściwym miejscu i **katalog roboczy
  etapu**. Ten drugi ma dwie części i wchodzi do promptu jako gotowy checkbox: **(a)** katalog
  `.claude/relai/work/<TEMAT>/E<N>/` przejrzany raportem
  (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z **liczbami przed i po**
  do wpisu dziennika; **(b)** artefakty, które musiały powstać **poza** tym katalogiem, wypisane
  z nazwy (`%TEMP%`, katalog domowy, cudze repozytorium) — razem z tym, co się z nimi stało.
  Punkt mówiący wyłącznie o repozytorium go **nie zastępuje** — artefakty etapu z definicji leżą
  poza Gitem, więc `git status` o nich milczy i taki punkt zalicza się sam.
- Ten punkt stoi w prompcie **zawsze**, także w projekcie, którego wiersz `Artefakty robocze`
  w `docs/USTAWIENIA.md` jest `wyłączone`. Wyłącznik wycisza zdanie na starcie sesji i krok 2a
  rytuału zamknięcia dnia — nie definicję ukończenia etapu.
- Punkt, którego w tym etapie zweryfikować **się nie da**, opisujesz wprost razem z warunkiem
  wykonalności i etapem, w którym da się go sprawdzić — nie udajesz, że go nie ma.

### 9. Na koniec (rytuał obowiązkowy)

Numerowana lista zamykająca etap, zawsze w tej kolejności: `STATUS.md` → wpis w dzienniku (+ lekcje,
+ ryzyka) → aktualizacja dokumentów projektu → **wygenerowanie `PROMPT_ETAP_N+1.md`** → commit.

Nagłówek zawiera zdanie: **bez tego rytuału etap NIE jest ukończony**.

Punkt o generacji następnego promptu podaje **materiał**, z którego ma powstać: sekcje `PLAN.md`
opisujące etap N+1, realny stan po tym etapie i lekcje z tego etapu. Przy ostatnim etapie planu ten
punkt zastępujesz wskazaniem: **uruchom sekwencję zamknięcia planu** (D-36).

## Zasady wspólne

- **Data z kontekstu sesji**, nigdy z pamięci modelu.
- **Liczby z etykietą** FAKT albo SZACUNEK (D-63) — także w zakresie i weryfikacji.
- **Bez powtarzania treści planu.** Prompt cytuje z planu tyle, ile trzeba do wykonania etapu,
  i linkuje resztę. Duplikat rozjedzie się z oryginałem przy pierwszym aneksie.
- **Zero sekretów** — nazwy zmiennych tak, wartości nigdy (D-42).
- Prompt raz wykonanego etapu **zostaje w folderze planu bez zmian** — jest zapisem tego, co
  zlecono. Poprawka wchodzi wyłącznie do promptu etapu jeszcze niewykonanego.

## Zakazy

- Nie piszesz promptu na podstawie planu, gdy możesz sprawdzić stan faktyczny — sekcja „Stan
  wyjściowy" ma opisywać repo, nie intencje.
- Nie pomijasz sekcji Weryfikacja ani sekcji „Na koniec". Prompt bez nich jest niekompletny,
  niezależnie od tego, jak mały jest etap.
- Nie wpisujesz zadań spoza zakresu etapu, nawet oczywistych i drobnych.
- Nie generujesz promptów dla etapów dalszych niż następny.
- Nie edytujesz promptu etapu, który jest `ZREALIZOWANY`.
- Nie zostawiasz w prompcie odsyłacza do pliku, którego nie ma (kolumna `Prompt` w `STATUS.md`
  rządzi się tą samą zasadą).

## Przykład (projekt polski, plan PLATNOSCI, etap E2 z E4)

```markdown
# PROMPT_ETAP_2 — Stripe Checkout i webhook potwierdzający płatność

Plan: PLATNOSCI • Etap: **E2 z E4** • Wygenerowano: 2026-08-14 (autor: Opus, w rytuale „Na koniec"
E1) • Wykonawca: **Opus** (plan: „Opus dla E2–E3, Haiku dla reszty")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-14 o E1 (co powstało i czego NIE zweryfikowano) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/PLATNOSCI/PLAN.md` | sekcje 5 (przebieg płatności), 6 (opis E2), 9 (dostępy po stronie człowieka), 10 (Aneks A) |
| `src/payments/model.ts` | tabela `Payment` i statusy z E1 — webhook ma zmieniać te statusy, nie własne |
| `src/payments/expiry.ts` | wygasanie po 15 minutach — webhook musi respektować zamówienie wygasłe |
| `docs/USTAWIENIA.md` | preferencje projektu, w tym podejście do testów |
| `.env.example` | konwencja nazw zmiennych; klucze Stripe wchodzą tutaj wyłącznie jako nazwy |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Płatności obsługuje **Stripe Checkout** (hostowana strona płatności), nie własny formularz karty —
  wariant wybrany w sekcji 4 planu, powód: brak zakresu PCI po naszej stronie.
- Zamówienie wygasa po **15 minutach** (E1, decyzja D-12 projektu); webhook przychodzący po tym
  czasie nie „odwygasza" zamówienia — loguje i zwraca 200.
- BLIK **poza zakresem v1** (Aneks A z 2026-08-13).
- Klucze Stripe pochodzą wyłącznie z `.env`; zapis wartości do pliku śledzonego jest zakazany.
- Faktury PDF to **E3**, panel administratora **E4**. W tym etapie ich nie dotykasz.

## Stan wyjściowy (co realnie zastajesz po E1)

Aplikacja na Next.js + PostgreSQL, migracje przez Prisma. Konto Stripe w trybie testowym jest
założone, klucze testowe leżą w `.env` (nie w repo).

```
src/payments/model.ts        # tabela Payment, statusy: oczekuje / oplacone / wygaslo / zwrocone
src/payments/expiry.ts       # zadanie wygaszające, uruchamiane co minutę
prisma/schema.prisma         # model Payment + relacja do Order
src/payments/model.test.ts   # 11 testów: przejścia statusów i współbieżność
.env.example                 # STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (same nazwy)
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** utworzenia sesji Stripe Checkout,
przekierowania użytkownika, endpointu webhooka, weryfikacji podpisu webhooka, obsługi ponowionych
zdarzeń (Stripe wysyła je wielokrotnie).

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:**
1. Każdy endpoint przyjmujący dane z zewnątrz waliduje wejście schematem, zanim cokolwiek zapisze
   (L-0001).
2. Testy integracyjne odpalasz komendą `npm run test:int` — `npm test` pomija folder `int/`
   (L-0003).
3. Migracji Prismy nie edytujesz po wygenerowaniu; poprawka to nowa migracja (L-0004).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PLATNOSCI/E2/`.** Wszystko tymczasowe — fixture'y
zdarzeń Stripe, wyjścia `stripe trigger`, zrzuty bazy — powstaje tam. Artefakt, który musi leżeć
poza projektem, wpisujesz do wpisu dziennika z nazwy.

1. **`src/payments/checkout.ts`** — utworzenie sesji Stripe Checkout dla zamówienia: kwota i waluta
   z zamówienia, `success_url` / `cancel_url` z konfiguracji, `metadata.orderId` obowiązkowe
   (webhook nie ma innej drogi powiązania zdarzenia z zamówieniem).
2. **`src/app/api/payments/webhook/route.ts`** — endpoint webhooka: weryfikacja podpisu
   (`STRIPE_WEBHOOK_SECRET`), obsługa `checkout.session.completed` i `checkout.session.expired`.
   Zdarzenie o nieznanym typie → 200 i wpis do logu, nigdy 500.
3. **Idempotencja** — to samo zdarzenie Stripe dostarczone drugi raz nie zmienia stanu i nie tworzy
   duplikatu. Klucz: `event.id` zapisywany w tabeli `ProcessedEvent`.
4. **Migracja Prismy** dla `ProcessedEvent` — nowy plik migracji, bez edycji istniejących.
5. **Testy** `src/payments/int/webhook.test.ts`: podpis poprawny, podpis zły, zdarzenie powtórzone,
   zdarzenie po wygaśnięciu zamówienia.
6. **`.env.example`** — dopisz brakujące nazwy zmiennych, bez wartości.
7. **Dokumentacja** — `docs/ARCHITEKTURA.md`: sekcja o przepływie płatności; `README.md` tylko
   wtedy, gdy zmienia się sposób uruchomienia.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `npm test` i `npm run test:int` kończą się bez błędów; nowe testy webhooka przechodzą.
- [ ] Zdarzenie `checkout.session.completed` wysłane przez `stripe trigger` przestawia zamówienie
      na `oplacone` — sprawdzone zapytaniem do bazy, nie logiem aplikacji.
- [ ] **Dowód idempotencji:** to samo zdarzenie wysłane dwa razy → w `Payment` jeden wiersz ze
      statusem `oplacone`, w `ProcessedEvent` jeden wiersz; `updatedAt` po drugim wywołaniu ma
      **tę samą wartość** co po pierwszym.
- [ ] Webhook z podpisem podmienionym na losowy → HTTP 400, brak zmiany w bazie.
- [ ] Zdarzenie dla zamówienia wygasłego → HTTP 200, status pozostaje `wygaslo` (dowód: odczyt
      statusu przed i po).
- [ ] `git grep -nE "sk_(test|live)_"` nie zwraca nic w plikach śledzonych.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z autorem w nagłówku;
      `docs/STATE.md` nadpisany.
- [ ] Dane testowe usunięte z bazy deweloperskiej.
- [ ] Katalog roboczy `.claude/relai/work/PLATNOSCI/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po
      w sekcji „Zweryfikowane" wpisu. Artefakty poza tym katalogiem: `%TEMP%/platnosci-stripe-cli/`
      — wypisany z nazwy i skasowany razem z resztą.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PLATNOSCI/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, link do
   `PROMPT_ETAP_3.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy". Zaktualizuj tabelę ryzyk;
   dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne".
3. `docs/STATE.md` — nadpisz stan obszaru płatności.
4. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.md` sekcja 6 (E3 — faktury PDF i wysyłka), realnego stanu po tym etapie i lekcji z tego
   etapu.
5. Commit + push.
```
