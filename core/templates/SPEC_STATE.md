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

**Próg zwięzłości (od 1.2.0, kryterium docelowe od 1.6.0).** Wyzwalaczem jest **liczba linii**:
plik dłuższy niż próg z wiersza `Rotacja dokumentów` w `docs/USTAWIENIA.md` (domyślnie **300 linii**)
przepisujesz w rytuale zamknięcia sesji zwięźlej. Do 1.5.2 celem tego przepisania był „jeden
ekran" — ocena, której nie da się sprawdzić, więc reguła nie działała w żadnym projekcie.

**Celem jest liczba:** przepisujesz tak długo, aż plik zejdzie **poniżej progu cząstkowego `STATE`
z wiersza `Budżet startu sesji`** (domyślnie **12 KB**). To jest ten sam próg, który mierzy hook
startu sesji, więc skutek przepisania widać w następnym pomiarze, a nie w niczyjej ocenie.
Sprawdzasz komendą, nie okiem:

```
node -e "console.log((require('fs').statSync('docs/STATE.md').size/1024).toFixed(1)+' KB')"
wc -l docs/STATE.md
```

**Wartość projektowa ma pierwszeństwo przed domyślną.** Projekt, który wpisał własne progi
w `docs/USTAWIENIA.md`, pracuje na swoich liczbach — 300 linii i 12 KB to wartości domyślne, nie
narzucone, a `/relai-update` ich nie nadpisuje.

**Dwa progi, jeden wyzwalacz** (L-0049): przepisanie wyzwala **wyłącznie** liczba linii. Próg w KB
mówi, kiedy przestać, i nie odzywa się sam — raport budżetu startu wyzwala przekroczenie sumy
całej warstwy, nie ta jedna pozycja.

Archiwum dla `STATE.md` nie istnieje — nie ma czego archiwizować, skoro plik z definicji nie ma
historii. Jedyna twarda reguła: fakt, który przy skracaniu znika stąd, a nie stoi w żadnym innym
dokumencie, **przepisujesz do wpisu dziennika tej sesji** — inaczej skrócenie byłoby kasowaniem
(D-18). Mechanizm i progi rotacji: `SPEC_ARCHIWUM.md`; budżet startu: `SPEC_USTAWIENIA.md`.

## Struktura sekcji

**Warstwa 1 — nietechniczna:**

1. **Nagłówek z datą** — `Stan na: RRRR-MM-DD`.
2. **Gdzie jesteśmy** — 3–5 zdań zwykłym językiem. Co projekt już potrafi, na jakim jest etapie.
3. **Co działa** — lista możliwości gotowych do użycia, opisanych z perspektywy użytkownika
   („pracownik rezerwuje miejsce"), nie implementacji („endpoint POST /reservations").
4. **Nad czym pracujemy teraz** — **najwyżej trzy pozycje**, każda **jednoakapitowa**, z jednozdaniowym
   „po co". Twardy kształt tej sekcji opisuje osobna sekcja niżej — to ona urosła w każdym zmierzonym
   projekcie.
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

## Twardy kształt sekcji „Nad czym pracujemy teraz" (od 1.6.0)

Ta jedna sekcja odpowiada za większość rozrostu pliku i powód jest mechaniczny: każdy zamknięty
etap **dopisywał** do niej akapit, zamiast podmieniać poprzedni. Zmierzone 2026-08-20: w projekcie
prowadzonym cztery miesiące urosła do 882 linii `FAKT`, w drugim — do 30 KB. Dlatego kształt tej
sekcji jest twardy, a nie zalecany.

- **Najwyżej trzy pozycje.** Trzy to sufit, nie cel — dwie są lepsze niż trzy, jedna od dwóch.
- **Jedna pozycja to jeden akapit.** Nie podsekcja, nie lista zagnieżdżona, nie tabela. Pozycja
  mówi, **co robimy** i **po co**; jak to działa — `ARCHITEKTURA.md`, jak do tego doszło —
  `DZIENNIK.md`.
- **Zamknięty etap podmienia pozycję, nigdy nie dopisuje kolejnej.** Praca, która się skończyła,
  wychodzi z tej sekcji w tej samej turze, w której się skończyła: jej wynik idzie do „Co działa"
  (jednym zdaniem, językiem użytkownika), a jej przebieg został już opisany we wpisie dziennika.

**Gdy pozycji byłyby cztery** — nie dopisujesz czwartej, tylko rozstrzygasz, która wypada, i **mówisz
o tym jednym zdaniem**. Kolejność wypadania jest ustalona, żeby nie była negocjowana za każdym
razem:

1. Pozycja, której praca jest **zamknięta** → do „Co działa", jednym zdaniem.
2. Pozycja **wstrzymana albo czekająca na człowieka** → do „Co blokuje"; sprawa człowieka ma
   dodatkowo swoją linię w sekcji „Czeka na człowieka" dziennika (`SPEC_DZIENNIK.md`).
3. Pozycja **jeszcze nierozpoczęta** → do „Co dalej".
4. Żadna z powyższych, czyli cztery rzeczy naprawdę dzieją się naraz → **to jest informacja dla
   człowieka, nie problem redakcyjny**. Zostawiasz trzy najważniejsze, czwartą przenosisz do „Co
   dalej" i piszesz jedno zdanie: równolegle idą cztery wątki, a sekcja mieści trzy.

Fakt, który przy tej operacji nie ma domu w żadnym innym dokumencie, **przepisujesz do wpisu
dziennika tej sesji** (D-18) — tak samo jak przy skracaniu całego pliku.

## Zakazy

- Zero wpisów typu „2026-08-01 — dodano X" (to `DZIENNIK.md`).
- Zero opisu, jak coś zaimplementowano (to `ARCHITEKTURA.md`).
- Zero czwartej pozycji w „Nad czym pracujemy teraz" — sufit to trzy, a przekroczenie rozstrzyga się
  wypadnięciem pozycji, nie dopisaniem kolejnej.
- Zero dopisywania akapitu za każdy zamknięty etap — etap **podmienia** pozycję albo ją zabiera.
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
- Powiadomienia o zwolnionym miejscu — żeby osoba z listy oczekujących dowiedziała się o miejscu
  tego samego dnia, a nie następnego.

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
