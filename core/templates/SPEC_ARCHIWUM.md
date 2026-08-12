# SPEC — `docs/archiwum/dziennik/` i `docs/archiwum/lekcje/`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Pliki archiwum powstają **w języku projektu**
(`docs/archiwum/journal/JOURNAL_<od>_<do>.md` i `docs/archiwum/lessons/LESSONS_<od>_<do>.md`
w projekcie angielskim).

## Rola

Magazyn historii, która wypadła z żywych dokumentów, żeby te mieściły się w kontekście sesji.
Archiwum odpowiada na pytanie: *„gdzie jest to, czego już nie widzę w dzienniku"*.

Archiwum jest **kopią bajt w bajt** (D-18). Nic nie jest streszczane, poprawiane ani kasowane —
rotacja przenosi treść i zostawia po niej odsyłacz. Historia projektu ma się składać w całość:
żywy dokument + archiwa w kolejności dat = pełny oryginał.

## Odbiorca

Agent, który sięga po starszy okres (najczęściej przez `/relai-changelog`, `/relai-audit` albo
pytanie użytkownika o historię), oraz człowiek szukający, kiedy coś ustalono. Przy starcie sesji
archiwum **nie jest czytane** — to jest cały sens jego istnienia.

## Kiedy powstaje

Wyłącznie w **rytuale zamknięcia sesji** („kończymy na dziś"), gdy żywy dokument przekracza próg
z `docs/USTAWIENIA.md`. Poniżej progu nie dzieje się nic i nie pada ani jedno słowo — katalog
archiwum też wtedy nie powstaje. Rotacja nie jest osobną komendą i nie przypomina o swoim
istnieniu.

Progi domyślne (`SZACUNEK` — skalibrowane 2026-08-12 na zmierzonych projektach, patrz
`SPEC_USTAWIENIA.md`):

| Dokument | Próg | Co się dzieje po przekroczeniu |
|---|---|---|
| `docs/DZIENNIK.md` | **150 KB** | najstarsze wpisy → `docs/archiwum/dziennik/` |
| `docs/LEKCJE.md` | **40 lekcji albo 50 KB** (co nastąpi wcześniej) | pełne wpisy najstarszych lekcji → `docs/archiwum/lekcje/` |
| `docs/STATE.md` | **300 linii** | **nie jest archiwizowany** — patrz sekcja „STATE" |

## Ścieżki i nazewnictwo

| Co | Ścieżka |
|---|---|
| wpisy dziennika | `docs/archiwum/dziennik/DZIENNIK_<data-od>_<data-do>.md` |
| pełne lekcje | `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` |

`<data-od>`/`<data-do>` to daty pierwszego i ostatniego przeniesionego wpisu (`RRRR-MM-DD`).
`<numer-od>`/`<numer-do>` to numery pierwszej i ostatniej przeniesionej lekcji (`L-0001`).
Zakres w nazwie jest **domknięty obustronnie** i zawsze ciągły — patrz „Wybór treści".

Nazwa pliku nie zawiera kwartału ani wersji: zakres w nazwie ma wystarczyć do odnalezienia okresu
bez otwierania pliku.

## Struktura pliku archiwum

1. **Nagłówek** — `# ARCHIWUM DZIENNIKA — <projekt> · <od> … <do>` (dla lekcji:
   `# ARCHIWUM LEKCJI — <projekt> · <od> … <do>`).
2. **Linia metryczna** — data rotacji, plik źródłowy, liczba przeniesionych pozycji, suma
   kontrolna przeniesionej treści.
3. **Jedno zdanie o naturze pliku** — że treść niżej jest kopią bajt w bajt i nic nie zostało
   streszczone.
4. **Separator `---`**, a pod nim **przeniesiona treść bez żadnej zmiany** — łącznie z nagłówkami
   `###`, pustymi liniami i literówkami oryginału.

Plik archiwum jest **append-only w obrębie zakresu**: kolejna rotacja tworzy **nowy** plik, nie
dopisuje do istniejącego. Wyjątek: osierocona kopia po rotacji przerwanej między fazami
(sekcja „Przypadki brzegowe").

## Linia-odsyłacz w żywym pliku

W miejscu usuniętej treści zostaje **jedna linia cytatu**, na początku sekcji (dziennik: pierwsza
rzecz w sekcji „Wpisy"; lekcje: pierwsza rzecz w sekcji „Lekcje"), przed najstarszą pozostawioną
pozycją:

```markdown
> Wpisy z okresu 2026-03-02 … 2026-06-28 (14 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md](archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md)
> — przeniesione 2026-08-12, suma kontrolna `a1b2c3d4e5f60718`.
```

Kolejne rotacje dokładają kolejne linie **pod poprzednimi**, w porządku chronologicznym. Linia
odsyłacza jest jedynym śladem po przeniesionej treści — streszczenia okresu **nie piszesz**
(streszczenie kłamie tym, czego nie zmieści, a od historii jest archiwum).

## Suma kontrolna — jak liczona

SHA-256 z treści **znormalizowanej do końców linii LF** (L-0033), pierwsze 16 znaków hex. Node bez
zależności:

```bash
node -e "const fs=require('fs'),c=require('crypto');const t=fs.readFileSync(process.argv[1],'utf8').replace(/\r\n/g,'\n');console.log(c.createHash('sha256').update(t,'utf8').digest('hex').slice(0,16))" plik.md
```

Sumę liczysz z **dokładnie tego fragmentu**, który wędruje: od pierwszego znaku nagłówka
pierwszego przenoszonego wpisu do ostatniego znaku ostatniego, bez linii pustej zamykającej
fragment. Ta sama definicja obowiązuje po stronie archiwum (treść pod separatorem `---`) —
inaczej porównanie faz nic nie dowodzi.

## Wybór treści — co wolno przenieść

Zasada wspólna: **zakres jest ciągły i liczony od najstarszej pozycji**. Pierwsza pozycja
nietykalna **przerywa** ciąg — nie przeskakujesz jej, żeby zabrać kolejną. Archiwum ma być
nieprzerwanym kawałkiem historii, a nie sitem.

**Dziennik** — nietykalne są:

- sekcja **„Stan otwartych ryzyk"** (nigdy nie opuszcza żywego pliku — nie jest wpisem),
- **dziesięć najnowszych wpisów** `SZACUNEK`,
- **każdy wpis z nierozstrzygniętą pozycją w sekcji „Do zrobienia przez człowieka"** — niezależnie
  od wieku. Rozstrzygnięcie poznajesz po adnotacji „*(rozstrzygnięte RRRR-MM-DD — …)*" przy
  **każdej** pozycji tej sekcji; sekcja z treścią „—" jest pusta, więc wpis wolno przenieść.

**Lekcje** — nietykalne są:

- cała sekcja **„Zasady aktywne"** (destylat czytany na starcie — nigdy nie jest archiwizowany),
- **dwadzieścia najnowszych lekcji** `SZACUNEK`,
- sekcja „Lekcje zwinięte", jeśli istnieje — ta ma własną drogę do archiwum opisaną
  w `SPEC_LEKCJE.md` (kompresja), i rotacja jej nie dotyka.

Ile zabrać: najstarsze pozycje po kolei, aż żywy plik zejdzie **poniżej 60% progu** — nie do
samego progu, bo rotacja wywoływana przy każdym zamknięciu sesji byłaby wtedy zjawiskiem
codziennym. Ciąg kończy się wcześniej, gdy trafi na pozycję nietykalną.

## Przebieg — dwie fazy, w tej kolejności

**Faza 1 — kopia i dowód:**

1. Wyznacz zakres wg reguł wyżej. Zakres pusty → koniec, cisza.
2. Policz sumę kontrolną wyznaczonego fragmentu **w żywym pliku**.
3. Zapisz plik archiwum (nagłówek + linia metryczna + zdanie + `---` + treść).
4. Odczytaj zapisany plik **z dysku**, wytnij treść spod separatora i policz jej sumę kontrolną.
5. Sumy różne → **STOP**. Żywy plik zostaje nietknięty, powiedz o tym jednym zdaniem. Nie
   próbujesz naprawiać po cichu.

**Faza 2 — przycięcie (dopiero po zgodności sum):**

6. Usuń przeniesiony fragment z żywego pliku i wstaw w jego miejsce linię-odsyłacz.
7. Zapisz żywy plik.
8. Rotacja idzie do **wpisu dziennika tej sesji**: co przeniesiono, dokąd, ile pozycji, suma
   kontrolna, rozmiar przed i po. Wpis powstaje po rotacji, więc trafia już do przyciętego pliku.

Przerwanie między fazami zostawia oryginał kompletny — to jest cały powód, dla którego kolejność
jest taka, a nie odwrotna.

## STATE — inny tryb, bez archiwum

`STATE.md` jest **nadpisywany**, więc z definicji nie ma historii do przeniesienia; archiwum
`docs/archiwum/state/` nie istnieje i nie powstaje. Powyżej progu (300 linii) robisz jedno:
przy nadpisywaniu `STATE.md` w rytuale zamknięcia sesji **piszesz go zwięźlej**, do jednego ekranu
zgodnie z `SPEC_STATE.md`.

Twarda granica: fakt, który przy tym znika ze `STATE.md`, a nie stoi w żadnym innym dokumencie,
**przepisujesz do wpisu dziennika tej sesji**. Bez tego skrócenie STATE byłoby kasowaniem (D-18),
a nie porządkowaniem.

## Przypadki brzegowe

| Sytuacja | Rozstrzygnięcie |
|---|---|
| Żywy plik poniżej progu | Nic się nie dzieje, zero komunikatów, katalog archiwum nie powstaje |
| Rotacja wyłączona w `USTAWIENIA.md` | Progu nawet nie sprawdzasz; cisza |
| Powyżej progu, ale **cały** zakres nietykalny (same świeże wpisy albo otwarte „Do zrobienia przez człowieka") | Nie rotujesz i **mówisz o tym jednym zdaniem** w podsumowaniu sesji, z powodem. Cisza jest zarezerwowana dla stanu poniżej progu — powyżej progu milczenie ukryłoby zatkany mechanizm |
| Rotacja przerwana między fazą 1 a 2 | Oryginał nietknięty; osierocony plik archiwum **nadpisujesz** przy następnej rotacji tego samego zakresu. Nie tworzysz drugiego pliku o tej samej nazwie z sufiksem |
| Plik archiwum o tej nazwie już istnieje, a zakres jest **inny** | Nazwa kolizyjna znaczy, że coś poszło nie tak z wyznaczeniem zakresu → **STOP**, żywy plik nietknięty, pytanie do człowieka |
| Wpis dziennika bez daty w nagłówku (dokument sprzed RelAI, po adopcji) | Nie podlega rotacji — zakres nazwy pliku musi wynikać z dat, a nie ze zgadywania (L-0025) |
| Projekt bez `docs/archiwum/` | Katalog powstaje w fazie 1, razem z pierwszym plikiem — nie na zapas (D-11) |

## Zakazy

- Nie streszczasz, nie skracasz i nie poprawiasz przenoszonej treści — kopia jest bajt w bajt.
- Nie kasujesz niczego przed weryfikacją sum kontrolnych (faza 2 nie rusza bez fazy 1).
- Nie archiwizujesz sekcji „Stan otwartych ryzyk" ani „Zasady aktywne".
- Nie przenosisz wpisu z otwartą pozycją „Do zrobienia przez człowieka".
- Nie pytasz o zgodę na rotację i nie meldujesz jej poniżej progu — mechanizm ma być niewidoczny,
  dopóki nie zadziała.
- Nie czytasz archiwum w rytuale startu sesji.

## Przykład — plik archiwum dziennika

```markdown
# ARCHIWUM DZIENNIKA — Parkly · 2026-03-02 … 2026-06-28

Zarchiwizowano: 2026-08-12 · Źródło: `docs/DZIENNIK.md` · Wpisów: 2 · Suma kontrolna
przeniesionej treści: `a1b2c3d4e5f60718` (SHA-256, pierwsze 16 znaków, końce linii LF)

Treść poniżej jest kopią **bajt w bajt** wpisów usuniętych z żywego dziennika — nic nie zostało
streszczone ani zmienione (D-18).

---

### 2026-03-02 — Rezerwacja miejsca i potwierdzenie mailem

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Formularz rezerwacji na wybrany dzień, blokada podwójnej rezerwacji tego samego miejsca.
- Mail potwierdzający wysyłany przez SMTP firmy.

**Zweryfikowane — jak dokładnie:**
- 9 testów jednostkowych (`npm test`), wszystkie zielone.
- Test ręczny: rezerwacja na 2026-03-05, mail dotarł w ~15 s.

**Świadomie odłożone:**
- Odwoływanie rezerwacji — osobne zadanie.

**Do zrobienia przez człowieka:**
- Potwierdzić nadawcę maili z działem IT. *(rozstrzygnięte 2026-03-04 — nadawca `parkly@firma.pl`)*

### 2026-06-28 — Raport obłożenia dla administracji

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Widok obłożenia parkingu na dowolny dzień, eksport do CSV.

**Zweryfikowane — jak dokładnie:**
- Porównanie raportu z ręcznym zliczeniem dla trzech dni (12/12, 9/9, 15/15 rezerwacji).

**Świadomie odłożone:**
- Raport miesięczny dla zarządu — czeka na format uzgodniony z księgowością.

**Do zrobienia przez człowieka:**
- —
```

Żywy `docs/DZIENNIK.md` po tej rotacji zaczyna sekcję „Wpisy" tak:

```markdown
## Wpisy

> Wpisy z okresu 2026-03-02 … 2026-06-28 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md](archiwum/dziennik/DZIENNIK_2026-03-02_2026-06-28.md)
> — przeniesione 2026-08-12, suma kontrolna `a1b2c3d4e5f60718`.

### 2026-07-04 — Lista oczekujących
…
```

## Przykład — plik archiwum lekcji

```markdown
# ARCHIWUM LEKCJI — Parkly · L-0001 … L-0002

Zarchiwizowano: 2026-08-12 · Źródło: `docs/LEKCJE.md` · Lekcji: 2 · Suma kontrolna
przeniesionej treści: `77f0c1de9a4b2035` (SHA-256, pierwsze 16 znaków, końce linii LF)

Treść poniżej jest kopią **bajt w bajt** wpisów usuniętych z żywego rejestru lekcji. Zasady z tych
lekcji **nadal obowiązują** — żyją w sekcji „Zasady aktywne" pliku `docs/LEKCJE.md`.

---

### L-0001 — Dołożona zależność bez pytania · 2026-03-08 · ZGRADUOWANA 2026-03-19

- **Trigger:** dodałem `date-fns` do `package.json`, żeby sformatować jedną datę.
- **Przyczyna:** założyłem, że drobna zależność jest neutralna.
- **Zasada:** przed dodaniem zależności przeszukaj repo pod kątem istniejącego rozwiązania.
- **Źródło:** „nie dokładaj paczek, mamy już swoje utilsy".

### L-0002 — Tabela zamiast listy · 2026-03-11 · AKTYWNA

- **Trigger:** odpowiedź o trzech krokach wdrożenia sformatowałem jako tabelę dwukolumnową.
- **Przyczyna:** przyzwyczajenie do tabel jako „porządniejszej" formy.
- **Zasada:** tabela tylko od trzech kolumn wzwyż; dwie kolumny to lista.
- **Źródło:** „ta tabela nic nie wnosi, wypisz to punktami".
```
