# SPEC — `docs/srodowiska/<NAZWA>.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/srodowiska/<NAZWA>.md`
**w języku projektu**; dla projektu angielskiego: `docs/environments/<NAME>.md`.

Dokument **warunkowy** profilu `app` (D-10, D-51). Powstaje przy pierwszym wdrożeniu danego
środowiska — nigdy przy inicjalizacji i nigdy dla środowiska, które jeszcze nie istnieje.

## Rola

Instrukcja dla kogoś, kto o drugiej w nocy ma **wdrożyć albo cofnąć wdrożenie**, nie znając
projektu. Dokument ma być wykonalny bez czytania czegokolwiek innego i bez pytania autora.

Sprawdzian gotowości jest jeden: czy osoba, która nigdy nie widziała tego projektu, wykona
sekcję „Jak cofnąć" wyłącznie na podstawie tego pliku. Jeśli nie — dokument jest niedokończony.

## Jeden plik na środowisko

`docs/srodowiska/` zawiera **po jednym pliku na środowisko**: `TEST.md`, `STAGING.md`,
`PRODUKCJA.md`. Nazwy wielkimi literami, bez dat i numerów wersji (D-12).

Nie robisz jednego zbiorczego pliku ze wszystkimi środowiskami: pod presją czasu czyta się jeden
plik do końca, a nie właściwą sekcję z trzech. Katalog powstaje razem z pierwszym plikiem.

## Twardy zakaz: wartości sekretów (D-42)

Dokument zawiera **wskazanie** dostępów, nigdy ich wartości. Konkretnie:

| Wolno | Nie wolno |
|---|---|
| nazwa zmiennej: `DATABASE_URL` | jej wartość, także skrócona lub zamaskowana |
| miejsce przechowywania: „menedżer haseł zespołu, sekcja Parkly" | zrzut ekranu z widocznym sekretem |
| kto ma dostęp: „administracja biura, dwie osoby" | login i hasło do panelu |
| nazwa panelu i adres logowania | token sesji, klucz API, ciąg połączenia z hasłem |

Zakaz obowiązuje także w przykładach, komentarzach i blokach kodu. Hook `secret-scanner` blokuje
zapis sekretu do pliku śledzonego, ale zakaz jest wcześniejszy niż hook: sekret w dokumentacji nie
jest wpadką narzędzia, tylko błędem autora.

## Kiedy powstaje i jak się aktualizuje

**Powstanie:** pierwsze wdrożenie tego środowiska. Sygnały: pojawia się konfiguracja wdrożeniowa
(`Dockerfile`, `docker-compose.yml`, workflow CI, `vercel.json`, `fly.toml`, `Procfile`, manifest
Kubernetes, pliki Terraform) albo człowiek mówi, że coś zostało gdzieś wystawione.

| Kiedy | Co się zmienia |
|---|---|
| Zmiana adresu, hostingu albo sposobu wdrożenia | sekcje „Adres" i „Jak wdrożyć" |
| Nowa zmienna środowiskowa | tabela zmiennych |
| Zmiana procedury cofnięcia | sekcja „Jak cofnąć" — i to jest zmiana wysokiego ryzyka, warta wpisu w dzienniku |
| Wdrożenie kolejnej wersji aplikacji | **nic** — to jest wpis w `DZIENNIK.md` |
| Środowisko wyłączone | adnotacja „NIEAKTUALNE" i przeniesienie do `docs/archiwum/` (D-18) |

Równolegle aktualizujesz tabelę środowisk w warstwie technicznej `STATE.md` — tam jest lista, tutaj
szczegóły.

## Struktura sekcji

1. **Nagłówek** — `# ŚRODOWISKO <NAZWA> — <projekt>` + linia `Stan na: RRRR-MM-DD`.
2. **Do czego służy** — jedno–dwa zdania: kto tego używa i co wolno tam robić. Dla produkcji jawnie:
   czego nie wolno.
3. **Adres** — URL aplikacji, panelu administracyjnego, podglądu logów. Bez tokenów w linkach.
4. **Dostępy — gdzie ich szukać** — tabela `Co | Gdzie przechowywane | Kto ma`. Wyłącznie wskazania.
5. **Zmienne środowiskowe** — tabela `Nazwa | Po co | Skąd wziąć wartość`. Wartości nigdy;
   „skąd wziąć" wskazuje menedżer haseł, panel dostawcy albo osobę.
6. **Jak wdrożyć** — kroki numerowane, z poleceniami. Ostatni krok to **sprawdzenie, że działa**:
   co konkretnie otworzyć albo wywołać i co ma zobaczyć osoba wdrażająca.
7. **Jak cofnąć** — sekcja obowiązkowa, o tej samej wadze co „Jak wdrożyć". Podaj: do jakiego stanu
   się cofa, jakimi poleceniami, ile to trwa, co się dzieje z danymi (migracje bazy!) i po czym
   poznać, że cofnięcie się udało. Zdanie „przywróć poprzednią wersję" nie jest procedurą.
8. **Co może pójść nie tak** — dwa–trzy znane tryby awarii i pierwszy ruch przy każdym.
9. **Zależności zewnętrzne tego środowiska** — usługi, bez których nie działa, i co się dzieje,
   gdy któraś padnie.

Sekcji 6 i 7 nie wolno pominąć ani zredukować do odsyłacza. Reszta może zniknąć, jeśli nie ma
treści.

## Zakazy

- Zero wartości sekretów, tokenów, haseł i ciągów połączenia (D-42) — bez wyjątków dla „środowiska
  testowego".
- Zero jednego zbiorczego pliku dla wielu środowisk.
- Zero procedury cofnięcia napisanej w trybie przypuszczającym.
- Zero pliku dla środowiska, które jeszcze nie istnieje — planowane środowisko jest wpisem
  w `STATE.md`, nie dokumentem.
- Zero opisu architektury aplikacji (to `ARCHITEKTURA.md`).

## Przykład (projekt polski, `docs/srodowiska/PRODUKCJA.md`)

```markdown
# ŚRODOWISKO PRODUKCJA — Parkly

Stan na: 2026-08-09

## Do czego służy

Z tego środowiska korzystają wszyscy pracownicy biura. **Nie testujemy tu niczego** — zmiany
wchodzą wyłącznie po przejściu przez środowisko testowe i po zamknięciu okna rezerwacji na dany
dzień.

## Adres

- Aplikacja: https://parkly.firma.pl
- Panel hostingu: https://vercel.com/firma/parkly
- Logi: panel hostingu → zakładka „Logs", filtr `production`

## Dostępy — gdzie ich szukać

| Co | Gdzie przechowywane | Kto ma |
|---|---|---|
| Konto hostingu | menedżer haseł zespołu, sekcja „Parkly / Vercel" | Łukasz, Anna |
| Baza produkcyjna | menedżer haseł zespołu, sekcja „Parkly / Postgres" | Łukasz |
| Klucz nadawcy maili | panel Resend, konto firmowe | Łukasz |

## Zmienne środowiskowe

| Nazwa | Po co | Skąd wziąć wartość |
|---|---|---|
| `DATABASE_URL` | połączenie z bazą produkcyjną | menedżer haseł, sekcja „Parkly / Postgres" |
| `RESEND_API_KEY` | wysyłka potwierdzeń | panel Resend → API Keys |
| `NEXT_PUBLIC_URL` | linki w mailach | stała: adres aplikacji powyżej |

Wartości ustawia się w panelu hostingu (Settings → Environment Variables), nigdy w repozytorium.

## Jak wdrożyć

1. Upewnij się, że zmiana przeszła na środowisku testowym i jest zmergowana do `main`.
2. `git push origin main` — hosting buduje automatycznie z gałęzi `main`.
3. Migracje bazy: `npx prisma migrate deploy` z ustawionym `DATABASE_URL` produkcji.
4. Poczekaj na status „Ready" w panelu hostingu (zwykle 2–3 minuty).
5. **Sprawdź, że działa:** otwórz https://parkly.firma.pl, zaloguj się kontem testowym
   `kontrola@firma.pl` i zarezerwuj dowolne miejsce na jutro. Rezerwacja ma się zapisać,
   a potwierdzenie przyjść mailem w ciągu minuty.

## Jak cofnąć

Cofasz do poprzedniego udanego wdrożenia. Czas: około 2 minuty.

1. Panel hostingu → zakładka „Deployments" → znajdź ostatnie wdrożenie ze statusem „Ready"
   sprzed zmiany (kolumna z datą).
2. Menu przy tym wdrożeniu → „Promote to Production". Potwierdź.
3. **Migracje bazy nie cofają się same.** Jeśli wdrożenie zawierało migrację, sprawdź w katalogu
   `prisma/migrations/`, czy dodawała kolumnę (bezpieczne — stara wersja jej nie używa), czy
   usuwała lub zmieniała typ (niebezpieczne — potrzebna migracja cofająca, przygotowana razem
   ze zmianą).
4. **Sprawdź, że cofnięcie się udało:** adres aplikacji odpowiada, a w panelu hostingu wdrożenie
   sprzed zmiany ma etykietę „Current".
5. Wpis w `docs/DZIENNIK.md`: co cofnięto, dlaczego i w jakim stanie została baza.

## Co może pójść nie tak

- **Build przechodzi, aplikacja zwraca 500.** Najczęściej brakująca zmienna środowiskowa po
  dodaniu nowej — sprawdź listę wyżej i porównaj z panelem hostingu.
- **Maile nie wychodzą.** Rezerwacje działają dalej (awaria poczty nie cofa zapisu). Sprawdź
  limit konta Resend przed szukaniem błędu w kodzie.
- **Migracja zawisa.** Zwykle blokada na tabeli `Rezerwacja` w godzinach porannego szczytu —
  migracje wykonuj po 18:00.

## Zależności zewnętrzne

| Usługa | Bez niej | Co robimy |
|---|---|---|
| Vercel | aplikacja niedostępna | status.vercel.com; brak własnego zapasowego hostingu — świadomie |
| Postgres (Neon) | aplikacja niedostępna | kopie zapasowe dzienne po stronie dostawcy, retencja 7 dni |
| Resend | brak potwierdzeń mailem | rezerwacje działają; ponowienia przez godzinę |
```
