# SPEC — `docs/DZIENNIK.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/DZIENNIK.md` **w języku
projektu** (nazwa pliku też podąża za językiem: `JOURNAL.md` dla projektu angielskiego).

## Rola

Pamięć projektu między sesjami. Odpowiada na pytania: *co się wydarzyło*, *co zostało sprawdzone
i jak*, *czego świadomie nie zrobiliśmy i dlaczego*, *co czeka na człowieka*. Dziennik jest jedynym
dokumentem, z którego wolno odtworzyć historię — pozostałe opisują teraźniejszość.

## Odbiorca

Agent w kolejnej sesji (główny) oraz zespół.

## Polityka aktualizacji: APPEND, nigdy edycja wstecz

- Nowe wpisy dopisujesz **na końcu sekcji „Wpisy"** (Aneks A pkt 4.4). Dopisywanie na końcu, a nie
  na górze, minimalizuje konflikty gita przy pracy zespołowej.
- Wpisów historycznych **nie edytujesz**. Coś okazało się nieprawdą → nowy wpis z korektą.
- Wpis powstaje **w tej samej turze**, w której skończyła się porcja pracy — nie „na koniec dnia",
  bo koniec dnia może nie nadejść.
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku

1. **Nagłówek** — nazwa projektu.
2. **Sekcja „Stan otwartych ryzyk"** — stała, zawsze na górze pliku, **nadpisywana** (jedyny
   nadpisywany fragment dziennika). Tabela: `# | Ryzyko | Poziom | Status | Mitygacja`. Numeracja
   `R1, R2, …` jest ciągła i nigdy nie jest używana ponownie — ryzyko zamknięte zostaje w tabeli ze
   statusem `ZAMKNIĘTE` i datą. Poziomy: wysoki / średni / niski.
3. **Sekcja „Wpisy"** — chronologicznie, najstarszy u góry.

## Szablon wpisu (obowiązkowy, D-14)

Nagłówek trzeciego poziomu: `### RRRR-MM-DD — Temat`, pod nim linia autora, potem cztery sekcje
o stałych nazwach. Sekcję bez treści zostawiasz z jawnym „—", zamiast ją usuwać: brak treści to
informacja.

- **Zrobione** — fakty, nie intencje. Każda pozycja to rzecz, która istnieje w repo albo w świecie.
- **Zweryfikowane — jak dokładnie** — najważniejsza sekcja i najczęściej pomijana. Nie „przetestowano",
  tylko czym, na czym i z jakim wynikiem. Jeśli czegoś nie sprawdzono — napisz to wprost.
- **Świadomie odłożone** — co świadomie zostało poza zakresem i dlaczego. To jest bezpiecznik
  przeciw rozrostowi zakresu: pomysł spoza zakresu ląduje tutaj, nie w kodzie.
- **Do zrobienia przez człowieka** — rzeczy, których agent nie może albo nie powinien zrobić sam
  (decyzje biznesowe, dostępy, zakupy, akceptacje). Pozycja rozstrzygnięta później zostaje w miejscu
  z dopiskiem w nawiasie: „*(rozstrzygnięte RRRR-MM-DD — …)*".

  **Forma dopiska jest czytana maszynowo** — po niej rotacja poznaje wpis, którego nie wolno
  ruszyć (`SPEC_ARCHIWUM.md`), a zamknięcie planu poznaje otwartą bramkę (`SPEC_STATUS.md`,
  sekcja „Bramki manualne"). Kanoniczne słowo to **rozstrzygnięte**; równoważnie rozpoznawane są
  **zrobione** i **wykonane** — tak podpisywano pozycje przed 1.3.0 i te wpisy mają dalej liczyć
  się jako zamknięte. Dopisek bez żadnego z tych słów znaczy **pozycja otwarta**: mechanizm nie
  zgaduje intencji (L-0025). Piszesz nowy dopisek → pisz „rozstrzygnięte".

  Pozycja niedotycząca już niczego (temat odpadł) też dostaje dopisek — „*(rozstrzygnięte
  RRRR-MM-DD — nieaktualne, powód)*". Ciche pozostawienie jej otwartej blokuje rotację wpisu
  i zamknięcie planu bez końca.

## Linia autora — jeden format, bez wariantów (D-63)

Druga linia wpisu, zawsze ta sama:

```
Autor: RelAI (<model>) + <użytkownik z git config user.name>
```

- `<model>` to nazwa modelu, który pisze wpis — `Opus`, `Sonnet`, `Haiku`, `Fable`. Bez numeru
  wersji i bez identyfikatora API.
- `<użytkownik>` to **dosłowna** wartość `git config user.name`. Nie skracasz jej, nie tłumaczysz
  i nie zastępujesz nickiem ani „użytkownik".
- Podpis jest neutralny: bez persony, bez osobowości, bez emotikonu.
- **Git nieskonfigurowany** (brak `user.name` w konfiguracji lokalnej i globalnej) → i tylko wtedy
  → sam `Autor: RelAI (<model>)`, bez znaku `+` i bez wypełniacza. Brak członu jest wtedy
  informacją, a nie brakiem.

**Człon użytkownika nie jest ozdobą.** Wpis podpisany samym modelem przy skonfigurowanym gicie
gubi jedyny ślad tego, kto przy tej pracy był — a na nim opiera się sygnał „cudzy projekt" (D-27),
który porównuje `user.name` z podpisami. Zmierzone w pilotażu 1.0.0: dwa wpisy podpisane
`RelAI (Haiku)` bez członu użytkownika wystarczyły, żeby projekt zaczął wyglądać na cudzy.

Dlatego od 1.3.0 podpis jest **sprawdzany maszynowo**: hook `journal-signature` czyta ostatni wpis
po każdym zapisie dziennika i ostrzega, gdy przy skonfigurowanym gicie w linii autora nie ma członu
`+ <użytkownik>`. Ostrzega — nigdy nie blokuje i nigdy nie poprawia wpisu za Ciebie; poprawka
należy do tej samej tury co ostrzeżenie. Hook milczy, gdy podpis jest poprawny albo gdy gita nie
ma (D-40).

## Wpis typu MINIPLAN (D-31)

Drobne zadanie, które warto rozpisać, ale które nie zasługuje na pełny plan, dostaje **miniplan** —
i miniplan mieszka **tutaj**, jako wpis w dzienniku. Nie ma pliku `MINIPLAN.md`, nie ma folderu
w `docs/plany/`, nie ma wpisu w `CLAUDE.md`. Kryteria wyboru PLAN vs MINIPLAN są w skillu
`relai-planning`.

Miniplan to jedyny wpis dziennika pisany **przed** pracą, nie po niej. Ma trzy sekcje zamiast
czterech standardowych:

- **Cel** — jedno zdanie: po czym poznamy, że zrobione.
- **Kroki** — 2–5 pozycji w kolejności wykonania.
- **Weryfikacja** — czym konkretnie sprawdzisz, że działa (nie „przetestuję").

Nagłówek dostaje dopisek `— MINIPLAN`, żeby był rozpoznawalny przy przeglądaniu. Po wykonaniu pracy
**nie edytujesz** miniplanu — dopisujesz osobny, zwykły wpis wynikowy (dziennik jest append-only).
Zadanie, które w trakcie przerosło swój miniplan, kończy się wpisem mówiącym o tym wprost i
propozycją pełnego planu.

**Przykład wpisu typu MINIPLAN:**

```markdown
### 2026-08-09 — Eksport listy rezerwacji do CSV — MINIPLAN

Autor: RelAI (Opus) + Łukasz

**Cel:** administrator pobiera z panelu plik CSV z rezerwacjami z wybranego miesiąca.

**Kroki:**
1. Endpoint `GET /api/rezerwacje/eksport?miesiac=RRRR-MM` zwracający CSV.
2. Przycisk „Eksportuj CSV" na liście rezerwacji, z wyborem miesiąca.
3. Nagłówki kolumn po polsku, separator `;` (Excel PL).

**Weryfikacja:** pobranie pliku za lipiec i otwarcie w Excelu — polskie znaki poprawne, liczba
wierszy zgodna z licznikiem na liście.
```

## Rotacja (D-14, mechanizm od 1.2.0)

Rotacja dzieje się **sama**, w rytuale zamknięcia sesji, gdy plik przekracza próg
z `docs/USTAWIENIA.md` (domyślnie **150 KB**). Poniżej progu nie dzieje się nic i nie pada ani
jedno słowo. Pełen mechanizm — dwie fazy, sumy kontrolne, nazwy plików, przypadki brzegowe —
opisuje `SPEC_ARCHIWUM.md`; tutaj obowiązuje to, czego rotacja nie ma prawa naruszyć.

**Co zostaje w żywym pliku zawsze:**

- sekcja **„Stan otwartych ryzyk"** — nie jest wpisem i nigdy nie trafia do archiwum,
- **dziesięć najnowszych wpisów** `SZACUNEK`,
- **każdy wpis z nierozstrzygniętą pozycją w sekcji „Do zrobienia przez człowieka"**, niezależnie
  od wieku. Najpierw rozstrzygnięcie, potem archiwum: pozycja czekająca na człowieka, która wyjdzie
  z żywego dokumentu, przestaje istnieć dla kolejnej sesji. Rozstrzygnięcie poznajesz po adnotacji
  „*(rozstrzygnięte RRRR-MM-DD — …)*" przy każdej pozycji; sekcja z treścią „—" jest pusta i wpisu
  nie blokuje.

**Co odchodzi:** ciągły zakres najstarszych wpisów, **w całości i bajt w bajt**. Wpisu nie dzielisz,
nie streszczasz i nie skracasz — pierwszy wpis nietykalny kończy zakres.

**Co zostaje po nich:** jedna **linia-odsyłacz** na początku sekcji „Wpisy", z zakresem dat, liczbą
wpisów, linkiem do pliku archiwum i sumą kontrolną. Streszczenia okresu **nie piszesz** — dawna
reguła „jednoakapitowe streszczenie" jest w 1.2.0 wycofana, bo streszczenie milczy o tym, czego nie
zmieściło, a od pełnej treści jest archiwum (D-18).

Format wpisu jest przy tym nienaruszalny: treść w archiwum ma te same cztery sekcje i tę samą linię
autora co przed przeniesieniem.

## Zakazy

- Nie edytujesz i nie usuwasz starych wpisów (D-18: zamiast kasowania — adnotacja).
- Nie wpisujesz sekretów, tokenów ani wklejonych fragmentów `.env` (D-42).
- Nie dublujesz stanu bieżącego — to `STATE.md`.
- Nie piszesz wpisu bez sekcji „Zweryfikowane"; „nie weryfikowano" jest dopuszczalną treścią,
  brak sekcji nie jest.

## Przykład

```markdown
# DZIENNIK — Parkly

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Dostawca płatności niewybrany — blokuje wdrożenie | wysoki | OTWARTE | decyzja Łukasza do 15.08; wariant awaryjny: faktury ręczne |
| R2 | Brak testów listy oczekujących | średni | ZAMKNIĘTE 2026-08-05 | testy dopisane, pokrycie 71% |

## Wpisy

### 2026-08-07 — Lista oczekujących i powiadomienia

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Kolejka oczekujących na miejsce: zapis, kolejność FIFO, zwolnienie miejsca przydziela pierwszej
  osobie z listy.
- Powiadomienie mailowe o przyznaniu miejsca (szablon + wysyłka przez SMTP).

**Zweryfikowane — jak dokładnie:**
- 14 testów jednostkowych kolejki (`npm test`) — wszystkie zielone; pokrycie modułu 88%.
- Test ręczny na środowisku testowym: dwie osoby na liście, zwolnienie miejsca → mail dotarł do
  pierwszej w ciągu ~20 s, druga została na liście.
- **Nie sprawdzono:** zachowania przy 100+ osobach w kolejce — brak danych testowych.

**Świadomie odłożone:**
- Powiadomienia push (wymagałyby aplikacji mobilnej — poza zakresem v1).
- Priorytety miejsc dla zarządu — czeka na decyzję biznesową.

**Do zrobienia przez człowieka:**
- Wybrać dostawcę płatności (R1).
- Potwierdzić treść maila z działem komunikacji.
```
