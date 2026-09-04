---
description: Odświeża listę modeli narzędzia w projekcie — pyta o zgodę na ruch sieciowy przy każdym wywołaniu, czyta dokumentację dostawcy albo pyta człowieka, pokazuje różnicę stara–nowa i zapisuje dopiero po potwierdzeniu
argument-hint: ""
---

# /relai-models — odświeżenie listy modeli

Twoje zadanie: doprowadzić **listę modeli tego narzędzia** w projekcie do stanu aktualnego —
pokazując wcześniej, co dokładnie się zmieni, i zapisując **wyłącznie po „tak"**. Kroki wykonujesz
po kolei.

Lista mówi, **co jest**, nigdy **co lepsze**: żadnych cen, limitów ani porównań wydajności.

---

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → jedno zdanie, że ten folder nie jest projektem RelAI, i koniec.
Niczego nie inicjalizujesz i niczego nie zapisujesz.

## Krok 1 — która lista obowiązuje

Nazwę pliku bierzesz **ze zdania hooka startu sesji** — brzmi ono „Lista modeli tego narzedzia:
`.claude/relai/MODELE-<narzędzie>.md` (z dnia …)". **Narzędzia nie rozpoznajesz sam**: treść tej
komendy jest jedna i trafia do obu adapterów, więc zgadywanie po katalogu, po nazwie procesu albo
po własnym modelu jest zakazane.

**Zdania hooka nie ma w kontekście** → powiedz jednym zdaniem, że hook startu nie podłożył listy
(sesja sprzed instalacji tej wersji albo sesja bez hooka), poproś o restart sesji i **zakończ**.
Nie tworzysz listy od zera i nie kopiujesz jej z katalogu pluginu — sesja nie ma tam dostępu
(L-0012).

Przeczytaj plik listy w całości. Zapamiętaj z niego: `list-date`, `tool`, wszystkie linie klas
oraz to, które pozycje stoją jako `<TO BE FILLED IN: …>`. Pusta lista i pozycja
`<TO BE FILLED IN: …>` to **brak danych, nie zaproszenie do improwizacji** (L-0026) — komenda ma
je uzupełnić z realnego źródła albo z odpowiedzi człowieka, nigdy z własnej pamięci.

## Krok 2 — rozjazd: kopia projektu vs lista z pluginu

Kopia w projekcie jest **trwała**: hook startu kopiuje listę tylko wtedy, gdy pliku nie ma, więc
aktualizacja pluginu **nie nadpisuje** odświeżenia zrobionego tą komendą. Dlatego przy nowszej
liście w pluginie decyzja należy do człowieka.

- Katalog pluginu jest w zasięgu sesji (uruchomiona z `--add-dir` na ten katalog) → porównaj
  `list-date` obu plików. **Różne daty** → pokaż **obie** i zapytaj, którą zostawić: kopię projektu
  czy listę z pluginu. Bez odpowiedzi nie zmieniasz niczego.
- Katalogu pluginu w zasięgu nie ma → powiedz jednym zdaniem, że porównania nie da się zrobić
  w tej sesji, i pracuj **wyłącznie** na kopii projektu. Nie zgadujesz, co niesie plugin.

## Krok 3 — zgoda na ruch sieciowy

**Pytasz przy każdym wywołaniu**, przed pierwszym połączeniem. Pytanie mówi wprost: które adresy
zostaną odczytane i że nic poza odczytem tych stron się nie wydarzy.

Zgody **nie zapamiętujesz**: żadnego wiersza w `docs/USTAWIENIA.md`, żadnego pliku stanu, żadnego
wyłącznika. Zgoda z poprzedniego wywołania — także w tej samej sesji — nie jest zgodą na to
(D-18).

**„Nie"** → nie dotykasz sieci ani razu i przechodzisz od razu do Kroku 5 (pytanie do człowieka).

## Krok 4 — odczyt źródeł

Adresy są **zamkniętą listą rozstrzygniętą przez człowieka**. Nie podmieniasz ich na „nowsze",
które znajdziesz po drodze, i nie dokładasz własnych.

**Claude Code**, w tej kolejności:

| # | Adres | Co stamtąd bierzesz |
|---|---|---|
| 1 | `https://code.claude.com/docs/en/model-config` | **główne** — tabela aliasów (`opus`, `sonnet`, `haiku`, `fable`, `best`, `opusplan`, `sonnet[1m]`, `opus[1m]`) i tabela poziomów `effort`; to warstwa, którą użytkownik realnie przełącza model |
| 2 | `https://support.claude.com/en/articles/11940350-claude-code-model-configuration` | lista modeli wspieranych przez Claude Code z pełnymi ID; nośnikiem jest **lista punktowa, nie tabela** |
| 3 | `https://platform.claude.com/docs/en/api/models/list` | **opcjonalne** — `GET /v1/models` zwraca listę maszynowo, ale wymaga nagłówka `X-Api-Key` |

**Cursor**:

| # | Adres | Co stamtąd bierzesz |
|---|---|---|
| 1 | `https://cursor.com/docs/models-and-pricing` | **główne** — dwie parsowalne tabele: „Cursor Models" i „Other Models" |
| 2 | `https://cursor.com/help/models-and-usage/available-models` | uzupełniające — modele w prozie, przydatne dla **opisu** klas, nie dla nazw |

Zasady odczytu:

- **Źródło 3 tylko z kluczem w `.env`.** Klucza nie wypisujesz, nie logujesz i nie zapisujesz
  nigdzie (D-42). Braku klucza **nie zgłaszasz jako błędu** — to znaczy „pomiń to źródło".
- **Przekierowanie idziesz raz i zapisujesz adres końcowy.** Starsze adresy dokumentacji modeli
  oddają **302** na adresy z tabel wyżej — do listy wchodzi adres **docelowy**, nigdy
  przekierowujący.
- **`list-date` po odświeżeniu jest datą odczytu, nie datą źródła** — strony Cursora nie podają
  daty aktualizacji w ogóle, a strona wsparcia Claude Code podaje „Updated this week" bez
  konkretnej daty. Adnotacja przy pozycji ma to nazywać wprost.
- **Odczyt, który zwrócił śmieci albo nic, jest niepowodzeniem** — nie próbujesz z niego
  wyciągnąć nazw „na oko".

Wszystkie źródła zawiodły → Krok 5. **Lista zostaje nietknięta ze swoją datą** i mówisz o tym
wprost; nigdy nie zostawiasz starej treści z nową datą.

## Krok 5 — drugie źródło: pytanie do człowieka

Pytasz o nazwy wprost, klasa po klasie, i pokazujesz, czego dziś brakuje. Odpowiedź zapisujesz
z adnotacją **„podane przez człowieka"** i **datą dnia**.

Człowiek nie zna nazwy albo nie chce jej podawać → pozycja zostaje jako
`<TO BE FILLED IN: …>`. To jest **poprawny stan listy**, nie porażka komendy.

## Krok 6 — sprowadzenie listy do trzech klas

Klasy są trzy i zamknięte: `strong`, `balanced`, `cheap`. Lista dostawcy bywa dużo dłuższa —
strona Cursora niesie kilkadziesiąt pozycji od kilku dostawców.

**Nie typujesz sam.** Wypisujesz kandydatów **pogrupowanych po dostawcy** i pytasz, który model
idzie do której klasy. RelAI nie rankuje cudzych modeli.

Klasa może mieć więcej niż jedną linię, gdy narzędzie realnie oferuje więcej niż jeden model tej
wagi. Model, którego klasa jest niejasna, wchodzi jako `<TO BE FILLED IN: …>`, nie do klasy
wybranej zgadywaniem.

## Krok 7 — różnica stara–nowa

Przed zapisem pokazujesz **różnicę**, nie samą nową listę:

- linie **dodane**, **usunięte** i **zmienione**, każda w całości,
- `list-date` **stara → nowa**,
- pozycje, które **zostają bez zmian**, jako liczba.

Nic się nie zmieniło → mówisz to jednym zdaniem i **kończysz bez zapisu**. `list-date`
przestawiasz **wyłącznie wtedy**, gdy realnie zmieniła się treść listy — sama data nie jest
zmianą.

## Krok 8 — zapis po „tak"

Zapis idzie do **kopii w projekcie**: `.claude/relai/MODELE-<narzędzie>.md`, pod nazwą ze zdania
hooka. **Nie** do pliku adaptera w katalogu pluginu i **nie** do drugiej listy.

Format bloku maszynowego zostaje bez zmian: jedna pozycja na linię, słowo klasy zakotwiczone na
początku linii, pola rozdzielone ` | ` i nazwane (`id`, `source`), `list-date` w formacie
`RRRR-MM-DD`. Komenda **wypełnia listę, nie przeprojektowuje jej** — czyta ją rdzeń i skill
planowania.

**„Nie"** → plik zostaje **nietknięty**, łącznie z datą. Mówisz, że nic nie zapisano.

## Krok 9 — podsumowanie

Trzy zdania: co się zmieniło na liście, skąd pochodzą nowe pozycje (adres albo „podane przez
człowieka"), z jakiego dnia jest teraz lista. Pozycje `<TO BE FILLED IN: …>`, które zostały,
wymieniasz z nazwy klasy.

---

## Zakazy tej komendy

- **Nie dotykasz sieci bez „tak" udzielonego w tym wywołaniu.** Zgoda z poprzedniego wywołania
  ani wpis w dokumencie nie są zgodą (D-18).
- **Nie zapamiętujesz zgody na sieć** — żadnego wiersza w `docs/USTAWIENIA.md`, żadnego
  wyłącznika, żadnego pliku stanu.
- **Nie zmieniasz adresów źródeł** ani nie dokładasz własnych; adres przekierowujący nie wchodzi
  do listy.
- **Nie zgadujesz nazw modeli.** Pusta pozycja i `<TO BE FILLED IN: …>` to brak danych (L-0026).
- **Nie rankujesz modeli** i nie zapisujesz cen, limitów ani wyników benchmarków.
- **Nie przypisujesz klasy bez pytania**, gdy źródło daje więcej kandydatów niż klas.
- **Nie zapisujesz niczego przed pokazaniem różnicy** i bez „tak" na tę różnicę.
- **Nie przestawiasz `list-date`**, gdy treść listy się nie zmieniła.
- **Nie piszesz do pliku adaptera** w katalogu pluginu ani do listy drugiego narzędzia.
- **Nie zapisujesz wartości klucza API** z `.env` — ani w liście, ani w dzienniku, ani na ekranie
  (D-42).
- **Nie rozpoznajesz narzędzia samodzielnie** — nazwa listy pochodzi ze zdania hooka startu.
- **Nie ruszasz progu świeżości listy ani hooka startu** — to zakres osobnego etapu.
