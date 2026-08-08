# SPEC — `docs/ARCHITEKTURA.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/ARCHITEKTURA.md` **w języku
projektu** (`docs/ARCHITECTURE.md` dla projektu angielskiego).

Dokument **warunkowy** profilu `app` (D-10, D-51). Powstaje przy pierwszym pliku źródłowym
w projekcie — nigdy przy inicjalizacji i nigdy „na przyszłość".

## Rola

Odpowiedź na pytanie „**jak to jest zbudowane i dlaczego tak?**" dla kogoś, kto zaraz będzie w tym
kodzie grzebał. Nie zastępuje kodu i nie powtarza go — opisuje **granice, przepływ i powody**, czyli
to, czego z kodu nie widać.

Rozgraniczenie z pozostałymi dokumentami:

| Pytanie | Dokument |
|---|---|
| Jak to teraz stoi? | `STATE.md` |
| Jak to jest zbudowane i dlaczego? | **`ARCHITEKTURA.md`** |
| Czego już nie otwieramy ponownie? | `DECYZJE.md` |
| Co się wydarzyło i kiedy? | `DZIENNIK.md` |

Wybór technologiczny, którego nie wolno cofać, jest **decyzją** i mieszka w `DECYZJE.md`.
`ARCHITEKTURA.md` opisuje skutek tego wyboru w strukturze kodu i linkuje do numeru decyzji.

## Odbiorca

Programista i agent, w tej kolejności. Człowiek nietechniczny tego dokumentu nie czyta — od tego
jest górna warstwa `STATE.md`.

## Kiedy powstaje i jak się aktualizuje

**Powstanie:** pierwszy plik źródłowy w projekcie. W tej samej turze, razem z pytaniem o podejście
do testów (D-25).

Pierwsza wersja opisuje to, co **właśnie powstało** — jeden moduł, jedno wejście, jeden przepływ.
Dokument architektury napisany pod docelową architekturę wymarzoną jest fikcją i psuje zaufanie do
całego zestawu; rośnie razem z projektem.

| Kiedy | Co się zmienia |
|---|---|
| Nowy moduł, katalog albo granica odpowiedzialności | wiersz w „Mapie modułów" + ewentualnie przepływ |
| Zmiana kierunku zależności między modułami | sekcja „Zależności i kierunek" |
| Nowa integracja zewnętrzna | wiersz w „Integracjach" |
| Zmiana modelu danych na poziomie encji | sekcja „Dane" |
| Zmiana wewnątrz modułu bez zmiany jego granic | **nic** — to nie jest zmiana architektury |
| Nowy plik w istniejącym module | **nic** |

Aktualizacja idzie w tej samej turze co zmiana (D-44). Dokument opisujący nieistniejący układ jest
gorszy niż jego brak.

## Struktura sekcji

1. **Nagłówek z datą** — `Stan na: RRRR-MM-DD`.
2. **W jednym akapicie** — co to za system technicznie: rodzaj, runtime, sposób uruchomienia.
   Trzy–cztery zdania.
3. **Mapa modułów** — tabela `Moduł | Katalog | Odpowiedzialność`. Odpowiedzialność jednym zdaniem
   zaczynającym się od czasownika. Moduł, którego odpowiedzialności nie da się zamknąć w zdaniu,
   jest kandydatem do podziału — i to warto zapisać.
4. **Przepływ** — droga typowego żądania albo typowej operacji, od wejścia do skutku, wypunktowana.
   Jeden przepływ w pierwszej wersji; kolejne dochodzą, gdy naprawdę są.
5. **Zależności i kierunek** — co od czego zależy i **w którą stronę**; zależność, która nie może
   pójść w drugą stronę, opisana wprost razem z powodem.
6. **Dane** — główne encje i relacje między nimi; gdzie mieszkają. Bez pełnego schematu — od tego
   są migracje.
7. **Integracje zewnętrzne** — tabela `Usługa | Po co | Gdzie w kodzie | Co się dzieje, gdy padnie`.
   Ostatnia kolumna jest obowiązkowa: integracja bez opisanej awarii to niezapisane ryzyko.
8. **Decyzje techniczne, które kształtują ten układ** — lista odsyłaczy do `DECYZJE.md` z jednym
   zdaniem skutku. Bez powtarzania treści decyzji.
9. **Czego tu świadomie nie ma** — rzeczy, których ktoś będzie szukał, a ich nie ma, wraz z powodem
   (na przykład: brak warstwy cache, brak kolejki, brak wielojęzyczności). Ta sekcja oszczędza
   najwięcej czasu następnej osobie.

Sekcję bez treści usuwasz, zamiast zostawiać pusty nagłówek. Wyjątek: „Czego tu świadomie nie ma"
zostaje zawsze — pusta znaczy „nie zastanawialiśmy się", i to też jest informacja.

## Zakazy

- Zero wartości sekretów, tokenów i haseł — także w przykładach konfiguracji (D-42).
- Zero opisu, co się wydarzyło i kiedy (to `DZIENNIK.md`).
- Zero przepisywania kodu do dokumentu: fragment kodu wchodzi tylko wtedy, gdy pokazuje **granicę**
  (sygnatura wejścia modułu, kształt zdarzenia), nigdy jako ilustracja implementacji.
- Zero architektury docelowej udającej istniejącą. Plan mieszka w `docs/plany/`.
- Zero diagramów, których nikt nie zaktualizuje — schemat w ASCII albo tabela żyją dłużej niż
  obrazek.

## Przykład (projekt polski, profil `app`, pierwsza wersja po pierwszym kodzie)

```markdown
# ARCHITEKTURA — Parkly

Stan na: 2026-08-09

## W jednym akapicie

Aplikacja webowa na Next.js 15 (App Router) z bazą PostgreSQL przez Prismę. Jeden proces Node.js
serwuje interfejs i API. Uruchomienie lokalne: `npm run dev`; zmienne środowiskowe w `.env`.

## Mapa modułów

| Moduł | Katalog | Odpowiedzialność |
|---|---|---|
| `rezerwacje` | `src/rezerwacje/` | przyjmuje żądanie rezerwacji, sprawdza dostępność, zapisuje |
| `kalendarz` | `src/kalendarz/` | liczy zajętość miejsc na dany dzień |
| `powiadomienia` | `src/powiadomienia/` | wysyła potwierdzenia mailem |
| `db` | `prisma/` | schemat bazy i migracje |

## Przepływ — rezerwacja miejsca

1. Formularz w przeglądarce wysyła `POST /api/rezerwacje` z datą i identyfikatorem pracownika.
2. `rezerwacje` pyta `kalendarz` o wolne miejsca na ten dzień.
3. Brak miejsc → odpowiedź `409` i wpis na listę oczekujących.
4. Jest miejsce → zapis w transakcji i zdarzenie `rezerwacja.utworzona`.
5. `powiadomienia` odbiera zdarzenie i wysyła maila; awaria maila nie cofa rezerwacji.

## Zależności i kierunek

`rezerwacje` → `kalendarz` → `db`. `powiadomienia` zależy wyłącznie od zdarzeń — nie sięga do bazy
i nie może, bo inaczej awaria poczty zablokowałaby zapis rezerwacji.

## Dane

Encje: `Pracownik`, `Miejsce`, `Rezerwacja` (pracownik + miejsce + dzień, unikalne na parę
miejsce–dzień), `Oczekujacy`. PostgreSQL 15, migracje przez Prismę.

## Integracje zewnętrzne

| Usługa | Po co | Gdzie w kodzie | Co się dzieje, gdy padnie |
|---|---|---|---|
| Resend | maile potwierdzające | `src/powiadomienia/resend.ts` | rezerwacja zostaje zapisana, mail trafia do kolejki ponowień; użytkownik widzi potwierdzenie w aplikacji |

## Decyzje techniczne, które kształtują ten układ

- [D-03](DECYZJE.md) — rezerwacja jest transakcyjna, lista oczekujących nie; stąd rozdział
  `rezerwacje` / `Oczekujacy`.

## Czego tu świadomie nie ma

- **Kolejki zadań.** Powiadomienia idą przez ponowienia w procesie — przy pięciu użytkownikach
  kolejka byłaby infrastrukturą bez powodu.
- **Cache.** Zajętość liczona zapytaniem; przy obecnym rozmiarze danych mierzone czasy nie
  uzasadniają warstwy cache.
- **Wielojęzyczności.** Interfejs wyłącznie po polsku — decyzja produktowa, nie techniczna.
```
