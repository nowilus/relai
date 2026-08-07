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

## Twardy limit objętości

**Maksimum 60 linii.** Przekroczenie oznacza, że coś trzeba przenieść do `docs/`. Zero opisu
funkcjonalności, zero historii, zero list zrobionych rzeczy — te miejsca to `README.md`, `STATE.md`
i `DZIENNIK.md`.

## Struktura sekcji (kolejność obowiązkowa)

1. **Nagłówek** — nazwa projektu + jedno zdanie: co to jest i dla kogo.
2. **Rytuał startu sesji** — numerowana lista plików do przeczytania, w kolejności, z jednozdaniowym
   uzasadnieniem każdego. Domyślnie: ten plik → `docs/STATE.md` → `docs/DZIENNIK.md` (sekcja ryzyk +
   ostatni wpis) → `docs/USTAWIENIA.md` → aktywny plan. Zakończ instrukcją „czytaj w tej kolejności,
   nie skanuj repo pełnotekstowo".
3. **Stan prac** — tabela `Co | Status | Gdzie` z maksymalnie pięcioma wierszami najwyższego
   poziomu. Szczegóły są w `STATE.md`; tu tylko drogowskazy.
4. **Aktywny plan** — dokładnie jedna linia z linkiem do `docs/plany/<TEMAT>/STATUS.md` albo
   informacja, że aktywnego planu nie ma (D-30).
5. **Reguły procesu** — 4–8 punktów, wyłącznie takie, których złamanie realnie boli. Domyślny
   zestaw: język dokumentacji / kodu / commitów (z ustawień projektu); zakaz sekretów w plikach
   śledzonych; definicja ukończenia (punkt 6); zasada „decyzje zamrożone się nie wracają"; sposób
   wykonania etapów planu. Zasady, które wynikły z konkretnej korekty użytkownika, trafiają tu
   dopiero po powtórzeniu — inaczej rosną bez kontroli.
6. **Definicja ukończenia** — jedno zdanie i konsekwencja: zadanie jest ukończone, gdy kod działa
   **i** dokumenty (`STATE.md`, wpis w `DZIENNIK.md`) są zaktualizowane w tej samej turze. Bez tego
   zadanie jest w toku, niezależnie od stanu kodu (D-44).
7. **Dobór modeli — rekomendacja** — jawnie oznaczona jako rekomendacja, nie reguła (D-38): analiza,
   architektura i plany → model najsilniejszy; wykonanie etapów → model wyważony; zadania
   mechaniczne → model najtańszy. Dopisz jedno zdanie: użytkownik może to nadpisać przy każdym
   planie, a wybór trafia do `STATUS.md` planu (D-39).
8. **Sekcja niemutowalna** — patrz niżej.

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
4. [docs/USTAWIENIA.md](docs/USTAWIENIA.md) — preferencje projektu.

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

## Dobór modeli (rekomendacja, nie reguła)

Analiza i plany → model najsilniejszy. Wykonanie etapów → model wyważony. Zadania mechaniczne →
model najtańszy. Przy każdym planie potwierdzasz wybór; trafia on do STATUS planu.

## Implementation guidelines (sekcja niemutowalna)

- **Think before coding**: nie zakładaj — sprawdź; niejasność → pytanie, nie domysł.
- **Simplicity first**: najprostsze działające rozwiązanie; zero spekulacyjnej generyczności.
- **Surgical changes**: zmieniaj minimum konieczne; nie refaktoryzuj przy okazji.
- **Goal-driven**: każda zmiana mapuje się na cel zadania; poza zakresem → do DZIENNIKA.
```
