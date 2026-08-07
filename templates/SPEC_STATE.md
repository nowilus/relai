# SPEC — `docs/STATE.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/STATE.md` **w języku projektu**.

## Rola

Odpowiedź na pytanie „**jak to teraz stoi?**" udzielona bez czytania czegokolwiek innego. Jeden
ekran, stan na dziś, zero historii.

## Odbiorca — dwie warstwy (D-13)

Dokument jest **dwuwarstwowy** i to jest jego najważniejsza cecha:

- **Górna warstwa — w pełni nietechniczna.** Czyta ją PM, szef, klient, nowa osoba pierwszego dnia.
  Zero nazw plików, bibliotek, endpointów i skrótów technicznych. Jeśli zdania nie zrozumiałby ktoś
  spoza IT — jest źle napisane.
- **Dolna warstwa — krótka faktografia.** Czyta ją agent i programista: środowiska, wersje, linki,
  liczby.

## Polityka aktualizacji: NADPISYWANY

`STATE.md` **nie ma historii**. Aktualizacja to nadpisanie treści, nie dopisanie akapitu. Historia
mieszka w `DZIENNIK.md` — i tylko tam.

Aktualizujesz **w tej samej turze**, w której zmienił się stan funkcjonalny projektu: coś zaczęło
działać, coś przestało, zmienił się priorytet, wystartował albo zamknął się plan. To część definicji
ukończenia zadania (D-44), nie osobne zadanie „do zrobienia później".

Datę aktualizacji bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura sekcji

**Warstwa 1 — nietechniczna:**

1. **Nagłówek z datą** — `Stan na: RRRR-MM-DD`.
2. **Gdzie jesteśmy** — 3–5 zdań zwykłym językiem. Co projekt już potrafi, na jakim jest etapie.
3. **Co działa** — lista możliwości gotowych do użycia, opisanych z perspektywy użytkownika
   („pracownik rezerwuje miejsce"), nie implementacji („endpoint POST /reservations").
4. **Nad czym pracujemy teraz** — 1–3 pozycje, każda z jednozdaniowym „po co".
5. **Co dalej** — najbliższe kroki, bez dat obiecywanych na wyrost.
6. **Co blokuje / na co czekamy** — jawnie, łącznie z pozycjami czekającymi na decyzję człowieka.
   Sekcja pusta to też informacja: napisz „nic nie blokuje".

**Warstwa 2 — faktografia (osobna sekcja z jawnym nagłówkiem, np. „Szczegóły techniczne"):**

7. **Środowiska** — tabela `Środowisko | URL | Stan`. Bez wartości dostępów — wyłącznie wskazanie,
   gdzie ich szukać (D-51, D-42).
8. **Wersje i zależności kluczowe** — runtime, baza, główne biblioteki: nazwa + wersja.
9. **Linki** — repo, tablica zadań, panele, dokumentacja zewnętrzna.
10. **Liczby, które się liczą** — pokrycie testami, rozmiar bazy, użytkownicy; wyłącznie takie,
    które ktoś naprawdę sprawdza.

Sekcje bez treści usuwasz, zamiast zostawiać puste nagłówki. Wyjątek: „Co blokuje" — ta zostaje
zawsze.

## Zakazy

- Zero wpisów typu „2026-08-01 — dodano X" (to `DZIENNIK.md`).
- Zero opisu, jak coś zaimplementowano (to `ARCHITEKTURA.md`).
- Zero wartości sekretów i tokenów — także w linkach (D-42).
- Warstwa nietechniczna bez żargonu, bez wyjątków „bo to oczywiste".

## Przykład (projekt polski, profil `app`)

```markdown
# STATE — Parkly

Stan na: 2026-08-07

## Gdzie jesteśmy

Aplikacja działa na środowisku testowym i jest używana przez pięć osób z biura. Rezerwacja
miejsc jest gotowa; trwa dokładanie płatności za miejsca gościnne. Do produkcji brakuje płatności
i zgody działu bezpieczeństwa.

## Co działa

- Pracownik rezerwuje miejsce na wybrany dzień i dostaje potwierdzenie mailem.
- Gdy nie ma wolnych miejsc, pracownik trafia na listę oczekujących i jest powiadamiany, gdy
  miejsce się zwolni.
- Administracja biura widzi obłożenie parkingu na dowolny dzień.

## Nad czym pracujemy teraz

- Płatności za miejsca gościnne — żeby firma mogła rozliczać gości bez faktur ręcznych.

## Co dalej

- Raport miesięczny obłożenia dla zarządu.
- Wdrożenie produkcyjne po zamknięciu płatności.

## Co blokuje

- Czekamy na decyzję o dostawcy płatności (człowiek — Łukasz).

---

## Szczegóły techniczne

### Środowiska

| Środowisko | URL | Stan |
|---|---|---|
| test | https://test.parkly.internal | działa |
| produkcja | — | nie wdrożone |

Dostępy: menedżer haseł zespołu, sekcja „Parkly".

### Wersje

Node.js 20.11 • PostgreSQL 15 • Next.js 15 • Prisma 6

### Linki

Repo: github.com/firma/parkly • Zadania: Jira PARK

### Liczby

Pokrycie testami: 71% • Użytkownicy testowi: 5
```
