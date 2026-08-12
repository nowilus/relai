# SPEC — `docs/DECYZJE.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/DECYZJE.md` **w języku projektu**
(nazwa pliku też podąża za językiem: `DECISIONS.md` dla projektu angielskiego).

## Rola

Rejestr rozstrzygnięć zamrożonych. Jedno zdanie opisuje cały jego sens: **decyzji z tego rejestru
nie proponuje się ponownie.** Plik istnieje po to, żeby ten sam temat nie wracał co dwie sesje —
ani jako pytanie agenta, ani jako „a może jednak".

Granica wobec pozostałych rejestrów (D-15) jest w [SPEC_LEKCJE.md](SPEC_LEKCJE.md). W skrócie:
LEKCJE to korekty *zachowania agenta*, DECYZJE to rozstrzygnięcia *w projekcie*, USTAWIENIA to
odpowiedzi na *pytania o preferencje*.

## Odbiorca

Agent (podstawowy) — czyta, zanim zaproponuje cokolwiek z obszaru już rozstrzygniętego. Człowiek —
gdy chce sobie przypomnieć, dlaczego coś jest tak, a nie inaczej.

## Polityka aktualizacji: APPEND, zamrożenie po zapisie

- Nowe decyzje dopisujesz do właściwej grupy tematycznej. Numeracja `D-NN` jest **ciągła w całym
  pliku** (nie per grupa) i nigdy nie jest używana ponownie.
- Wpisu nie edytujesz i nie kasujesz. Zmiana decyzji to **nowy wpis** i adnotacja przy starym.
- Wpis powstaje w tej samej turze, w której człowiek rozstrzygnął — nie „przy okazji" i nie na
  koniec sesji.
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku

1. **Nagłówek** — `# DECYZJE — <nazwa projektu>`.
2. **Zdanie o zasadzie nadrzędnej** — że decyzji z rejestru nie proponuje się ponownie, a zmiana
   wymaga jawnej prośby człowieka i datowanego wpisu z powodem.
3. **Grupy tematyczne** — nagłówki drugiego poziomu. Grupa powstaje, gdy ma pierwszą decyzję; nie
   zakładasz pustych grup na zapas. Typowe grupy: *Produkt i zakres*, *Architektura i technologie*,
   *Dane i integracje*, *Proces i praca zespołu*, *Bezpieczeństwo*, *Wygląd i treść*.
4. *(gdy powstanie)* **Sekcja „Decyzje zmienione"** — na końcu pliku; wpisy nieaktualne z jawnym
   odsyłaczem do następcy.

## Format wpisu

```
- **D-NN** *(RRRR-MM-DD)* <Rozstrzygnięcie w jednym zdaniu.> — <powód, jedno zdanie.>
  <Opcjonalnie: co zostało odrzucone i dlaczego.>
```

Zasady dobrego wpisu:

- **Rozstrzygnięcie, nie dyskusja.** Wpis mówi, co jest ustalone, nie jak długo się nad tym
  zastanawiano.
- **Powód jest obowiązkowy.** Bez powodu decyzja za pół roku wygląda na przypadkową i wraca jako
  temat — czyli plik nie spełnia swojej jedynej roli.
- **Odrzucone warianty są cenne** — dopisz je jednym zdaniem, gdy istniały. Chronią przed
  ponownym rozważaniem tej samej alternatywy.
- **Bez żargonu, gdy nie jest konieczny.** Wpis czyta też człowiek po dłuższej przerwie.

## Wykrywanie powracającego tematu i propozycja zamrożenia (D-16)

To jest jedyny mechanizm, który zapełnia ten rejestr sam z siebie.

**Co liczy się jako powtórzenie** `SZACUNEK — progi do strojenia`:

- ten sam temat rozstrzygany po raz **drugi** w osobnych sesjach, tak samo za każdym razem, albo
- **trzy** nawroty tego samego tematu w jednej sesji, albo
- człowiek odwołuje się do wcześniejszego ustalenia („mówiliśmy już", „przecież ustaliliśmy").

**Jak brzmi propozycja.** Jedno zdanie, na końcu odpowiedzi, bez rozbudowanego uzasadnienia:

> „Ten temat wraca drugi raz i rozstrzygasz go tak samo. Proponuję zamrozić jako decyzję:
> »<treść>« — powód: <powód>. Zamrozić?"

**Zatwierdza wyłącznie człowiek.** Nie ma automatycznego zamrażania z obserwacji — obserwacja daje
propozycję, nigdy wpis. Brak odpowiedzi to nie zgoda; temat wraca przy następnej okazji.

Po zgodzie: wpis `D-NN` z dzisiejszą datą, w odpowiedniej grupie, plus jedno zdanie potwierdzenia
(„Zamrożone jako D-12.").

## Automatyczne przechwytywanie fraz

Fraza intencjonalnie zamykająca temat trafia do rejestru **bez pytania o zgodę** — człowiek już jej
udzielił samym sformułowaniem (D-16). Frazy w języku projektu, m.in.:

| Fraza | Co robisz |
|---|---|
| „nie rób tego więcej", „nigdy więcej tak" | wpis `D-NN` z rozstrzygnięciem w formie zakazu |
| „ustalmy raz na zawsze", „zamykamy temat" | wpis `D-NN` z treścią ustalenia |
| „to jest decyzja", „koniec dyskusji o X" | wpis `D-NN` |
| „nie wracaj do tego" | wpis `D-NN`; jeśli dotyczy sposobu pracy agenta — do `LEKCJE.md` |

Po zapisie: jedna krótka linia potwierdzenia z numerem. Jeśli fraza jest niejednoznaczna co do
zakresu („nie rób tego więcej" — czego dokładnie?), **zapytaj o zakres jednym zdaniem**, ale nie
o to, czy zapisać.

## Projekt po adopcji (od 1.3.0)

Projekt przeniesiony na RelAI komendą `/relai-adopt` ma w `CLAUDE.md` sekcję **„Zasady projektu
(odziedziczone)"** — dosłowną kopię zastanych reguł, nierzadko z własną tabelą decyzji. Podział
jest ostry:

| Gdzie | Co tam jest |
|---|---|
| `CLAUDE.md`, sekcja „Zasady projektu (odziedziczone)" | rozstrzygnięcia sprzed adopcji — **zamrożone jako zapis stanu**, nie dopisuje się do nich |
| `docs/DECYZJE.md` | **każde** rozstrzygnięcie podjęte po adopcji, w formacie `D-NN` |

Zasady:

- Rejestr startuje **pusty** i to jest poprawne. Zastanych decyzji nie przepisujesz — dwie kopie
  tej samej reguły to dwa źródła prawdy, a drugie zawsze się rozjeżdża.
- Pierwszy wpis `D-01` powstaje przy pierwszym rozstrzygnięciu po adopcji, także wtedy, gdy temat
  pasuje do odziedziczonej tabeli. Pasowanie tematu **nie jest** powodem do dopisania go tam.
- Wpis może odwoływać się do zastanej reguły („doprecyzowuje regułę o migracjach z sekcji
  odziedziczonej") — odwołanie tak, przenoszenie treści nie.
- `CLAUDE.md` jest w kontekście każdej sesji i płaci tokenami przy każdym prompcie; `DECYZJE.md`
  czyta się wtedy, gdy temat tego wymaga. Dlatego rejestr rośnie tutaj, nie tam.

## Zmiana decyzji

Decyzja zamrożona zmienia się **wyłącznie na jawną prośbę człowieka**. Procedura:

1. Nowy wpis `D-NN` z dzisiejszą datą, treścią nowego rozstrzygnięcia i **powodem zmiany**.
2. Stary wpis zostaje na miejscu z dopiskiem: *(zmienione D-NN, RRRR-MM-DD — powód)*; przenosisz go
   do sekcji „Decyzje zmienione" (D-18).
3. Jeśli decyzja była cytowana w `CLAUDE.md` albo w planie — aktualizujesz je w tej samej turze.

Nigdy nie zmieniasz decyzji „przy okazji", bo nowe rozwiązanie wydaje się lepsze. Propozycja zmiany
jest dopuszczalna tylko wtedy, gdy pojawił się **fakt nieznany w momencie zamrożenia** — wtedy
mówisz o tym fakcie, nie o preferencji.

## Zakazy

- Nie proponujesz ponownie niczego, co jest w rejestrze — ani wprost, ani „w innym wariancie".
- Nie zamrażasz decyzji bez zgody człowieka (wyjątek: frazy z sekcji wyżej).
- Nie kasujesz i nie przepisujesz wpisów (D-18).
- Nie wpisujesz sekretów ani wartości dostępowych (D-42).
- Nie mieszasz rejestrów: korekta zachowania → `LEKCJE.md`, preferencja z pytania →
  `USTAWIENIA.md`.
- Nie zakładasz pustych grup tematycznych.

## Przykład (projekt polski)

```markdown
# DECYZJE — Parkly

Decyzji z tego rejestru **nie proponuje się ponownie**. Zmiana wymaga jawnej prośby i nowego wpisu
z datą oraz powodem.

## Produkt i zakres

- **D-01** *(2026-08-08)* Aplikacja obsługuje wyłącznie pracowników firmy — bez kont gościnnych
  i bez rejestracji z ulicy. Powód: parking jest zamknięty, konta gościnne generowałyby wsparcie
  bez wartości. Odrzucone: konta gościnne z kodem jednorazowym — za dużo obsługi.
- **D-06** *(2026-09-02)* Rezerwacja maksymalnie 14 dni w przód. Powód: tydzień okazał się za
  krótki dla osób planujących wokół urlopów. Zastępuje D-02.

## Architektura i technologie

- **D-03** *(2026-08-08)* Baza: PostgreSQL. Powód: zespół ją zna, jest w firmowym hostingu.
  Odrzucone: MongoDB — brak realnej potrzeby dokumentowej.
- **D-04** *(2026-08-15)* Powiadomienia wyłącznie mailem w v1. Powód: push wymagałby aplikacji
  mobilnej, której nie ma w zakresie.

## Proces i praca zespołu

- **D-05** *(2026-08-14)* Migracje bazy uruchamia człowiek, nigdy agent — także na środowisku
  testowym. Powód: jedna pomyłkowa migracja skasowała dane testowe.

## Decyzje zmienione

- **D-02** *(2026-08-12)* Rezerwacja maksymalnie 7 dni w przód.
  *(zmienione D-06, 2026-09-02 — po miesiącu użycia okazało się, że tydzień to za mało dla osób
  planujących urlopy)*
```
