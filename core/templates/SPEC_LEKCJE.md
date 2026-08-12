# SPEC — `docs/LEKCJE.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/LEKCJE.md` **w języku projektu**
(nazwa pliku też podąża za językiem: `LESSONS.md` dla projektu angielskiego).

## Rola

Rejestr korekt użytkownika zamienionych w zasady. Odpowiada na pytanie: *„czego już mnie tu
nauczono, żebym nie popełnił tego samego błędu drugi raz"*.

`LEKCJE.md` jest rejestrem **zachowań agenta**, nie decyzji o produkcie. Granica jest ostra
(D-15):

| Dokument | Co tam trafia | Przykład |
|---|---|---|
| `LEKCJE.md` | korekta sposobu pracy agenta | „nie dopisuj emoji do nagłówków" |
| `DECYZJE.md` | rozstrzygnięcie merytoryczne, którego nie wolno otwierać ponownie | „baza: PostgreSQL, temat zamknięty" |
| `USTAWIENIA.md` | preferencja, o którą agent zapytał i dostał odpowiedź | „backupy w `D:\Backupy`" |

Gdy nie wiesz, gdzie coś należy: czy to korekta *Twojego zachowania*? → LEKCJE. Czy to wybór
*w projekcie*? → DECYZJE. Czy to odpowiedź *na Twoje pytanie*? → USTAWIENIA.

## Odbiorca

Wyłącznie agent. Człowiek zagląda rzadko — najczęściej, gdy chce sprawdzić, czy jego uwaga została
zapamiętana.

## Polityka aktualizacji: APPEND bez pytania

- Wpis powstaje **natychmiast po korekcie użytkownika**, w tej samej turze, **bez pytania o zgodę**
  (D-15). Pytanie „czy zapisać tę lekcję?" jest zakazane — dokłada użytkownikowi pracy w momencie,
  w którym już raz musiał Cię poprawić.
- Fakt zapisania zgłaszasz **jedną krótką linią** na końcu odpowiedzi, np. „Zapisane jako L-0007.".
  Bez uzasadniania i bez przepraszania.
- Numeracja `L-NNNN` (cztery cyfry, od `L-0001`) jest **ciągła i nigdy nie używana ponownie** —
  także po zwinięciu wpisu.
- Wpisów historycznych nie edytujesz. Lekcja okazała się błędna → nowy wpis, który ją unieważnia,
  a stara dostaje status `WYCOFANA` z odsyłaczem (D-18).
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku (kolejność obowiązkowa)

1. **Nagłówek** — `# LEKCJE — <nazwa projektu>` + jedno zdanie o roli pliku.
2. **Sekcja „Zasady aktywne"** — destylat, **zawsze na górze**, nadpisywana. To jedyna sekcja
   czytana przy starcie sesji (D-15). Lista numerowana, każda pozycja: jedno zdanie w trybie
   rozkazującym + w nawiasie źródłowe numery lekcji, np. „(L-0003, L-0009)".
3. **Sekcja „Lekcje"** — wpisy `L-NNNN` chronologicznie, najstarszy u góry.
4. *(gdy powstanie)* **Sekcja „Lekcje zwinięte"** — patrz „Kompresja".

Sekcja „Zasady aktywne" ma **twardy limit: 15 pozycji**
`SZACUNEK — próg do strojenia`. Przekroczenie znaczy, że część zasad powinna zostać zgraduowana do
`CLAUDE.md` albo połączona.

## Format wpisu (obowiązkowy)

```
### L-NNNN — <jednozdaniowy tytuł> · RRRR-MM-DD · <STATUS>

- **Trigger:** co dokładnie zrobiłem/napisałem, co wywołało korektę.
- **Przyczyna:** dlaczego to zrobiłem — błędne założenie, brak sprawdzenia, wzorzec z innego projektu.
- **Zasada:** co robię od teraz. Tryb rozkazujący, jedno zdanie, sprawdzalne.
- **Źródło:** cytat lub zwięzła parafraza korekty użytkownika.
```

**Statusy:** `AKTYWNA` (domyślny) · `ZGRADUOWANA <data>` (trafiła do `CLAUDE.md`) ·
`ZWINIĘTA <data>` (żyje już tylko w „Zasadach aktywnych") · `WYCOFANA <data>` (unieważniona nowszą
lekcją — z odsyłaczem).

Zasady dobrego wpisu:

- **Trigger jest konkretny.** „Źle sformatowałem odpowiedź" to nie trigger. „Wstawiłem tabelę tam,
  gdzie wystarczyła lista trzech punktów" — to trigger.
- **Zasada jest sprawdzalna.** Da się po fakcie orzec, czy została złamana. „Pisz lepiej" nie jest
  zasadą.
- **Jedna korekta = jeden wpis.** Użytkownik poprawił dwie rzeczy naraz → dwa wpisy.
- **Bez samobiczowania.** Wpis to instrukcja na przyszłość, nie akt skruchy.

## Kiedy powstaje wpis, a kiedy nie

**Powstaje**, gdy użytkownik:

- poprawia sposób, w jaki coś zrobiłeś („nie tak", „za długo", „bez tego"),
- prosi o zmianę stylu, formatu albo kolejności pracy,
- zwraca uwagę na pominięty krok procesu,
- mówi wprost „zapamiętaj", „nie rób tego więcej", „na przyszłość".

**Drugie dopuszczalne źródło** (i jedyne poza korektą użytkownika): **przegląd zamykający etap
planu**, gdy wniosek zmienia sposób pracy w etapie następnym. Taki wpis ma w polu „Źródło" jawnie
napisane, że pochodzi z przeglądu etapu, a nie z korekty. Poza tymi dwoma źródłami lekcje nie
powstają.

**Nie powstaje**, gdy:

- użytkownik zmienia zdanie co do treści zadania (to zwykła zmiana zakresu),
- podaje nową informację merytoryczną (to wiedza o projekcie, nie lekcja),
- rozstrzyga wybór produktowy → to `DECYZJE.md`,
- odpowiada na Twoje pytanie o preferencję → to `USTAWIENIA.md`.

## Graduacja — z lekcji do reguły w `CLAUDE.md`

**Próg: druga korekta w tej samej sprawie** `SZACUNEK — próg do strojenia`. Pierwsze powtórzenie
znaczy, że sam wpis nie wystarczył — zasada musi trafić tam, gdzie agent czyta ją bez pytania,
czyli do `CLAUDE.md` (sekcja „Reguły procesu").

Procedura:

1. Wykrywasz, że nowa korekta dotyczy sprawy już zapisanej (ta sama zasada, inne słowa).
2. Zamiast dopisywać drugi bliźniaczy wpis, **dopisujesz nową lekcję z adnotacją**
   „powtórzenie L-XXXX" i **proponujesz graduację** jednym zdaniem:
   > „To druga korekta w tej samej sprawie (L-0003). Proponuję dopisać do reguł procesu
   > w `CLAUDE.md`: »<treść zasady>«. Dopisać?"
3. **Zgodę daje człowiek** — `CLAUDE.md` jest wczytywany do każdej sesji, więc każda linia kosztuje
   tokeny w każdym prompcie. Bez zgody nic tam nie wchodzi.
4. Po zgodzie: reguła w `CLAUDE.md`, obie lekcje dostają status `ZGRADUOWANA <data>`, pozycja
   znika z „Zasad aktywnych" (jest już wyżej w łańcuchu).

Graduacji **nie proponujesz** przy pierwszej korekcie — od tego jest wpis.

## Kompresja — zwijanie lekcji do destylatu

Kompresję proponujesz, gdy zajdzie którykolwiek warunek `SZACUNEK — progi do strojenia`:

- sekcja „Lekcje" ma więcej niż **25 wpisów** ze statusem `AKTYWNA`,
- plik przekracza **30 KB**,
- minął kwartał od poprzedniej kompresji.

Procedura:

1. Grupujesz aktywne lekcje tematycznie i zapisujesz każdą grupę jako **jedno zdanie** w „Zasadach
   aktywnych", z numerami źródłowymi w nawiasie.
2. Zwinięte wpisy dostają status `ZWINIĘTA <data>` i przenosisz je do sekcji „Lekcje zwinięte" na
   końcu pliku — albo, gdy sekcja sama urośnie ponad 30 KB, do
   `docs/archiwum/lekcje/LEKCJE_<numer-od>_<numer-do>.md` z linkiem (D-18); nazewnictwo i nagłówek
   pliku archiwum wg `SPEC_ARCHIWUM.md`.
3. **Sekcja „Zasady aktywne" nigdy nie jest archiwizowana** — zostaje w bieżącym pliku.
4. Nic nie jest kasowane. Numery nie są odzyskiwane.

Kompresję **proponujesz**, nie wykonujesz po cichu: to jedyna operacja na tym pliku, która zmienia
treść wstecz.

## Rotacja — pełne lekcje do archiwum (od 1.2.0)

Kompresja i rotacja to **dwie różne operacje** i nie wolno ich mylić:

| Operacja | Co robi | Kto uruchamia |
|---|---|---|
| **Kompresja** (wyżej) | destyluje treść lekcji do zdania w „Zasadach aktywnych" — zmienia sens zapisu | propozycja, zgoda człowieka |
| **Rotacja** (tutaj) | przenosi **pełne wpisy bajt w bajt** do `docs/archiwum/lekcje/` — nie zmienia ani znaku | sama, w rytuale zamknięcia sesji |

Rotacja rusza, gdy plik przekracza próg z `docs/USTAWIENIA.md`: domyślnie **40 lekcji albo 50 KB**,
co nastąpi wcześniej. Poniżej progu — cisza. Mechanizm (dwie fazy, sumy kontrolne, nazwy plików)
opisuje `SPEC_ARCHIWUM.md`; tutaj obowiązuje to, czego rotacja nie ma prawa naruszyć.

**Co zostaje zawsze:**

- **cała sekcja „Zasady aktywne"** — destylat czytany na starcie sesji nigdy nie opuszcza żywego
  pliku. Zasada z zarchiwizowanej lekcji **nadal obowiązuje**: żyje w destylacie, a numer w nawiasie
  prowadzi do archiwum,
- **dwadzieścia najnowszych lekcji** `SZACUNEK` — to zapas na sprawdzanie powtórzeń przy graduacji,
- sekcja „Lekcje zwinięte", jeśli istnieje — ta ma własną drogę opisaną w „Kompresji" i rotacja jej
  nie dotyka.

**Co odchodzi:** ciągły zakres najstarszych wpisów `L-NNNN` z sekcji „Lekcje", w całości. Numery
nie są odzyskiwane ani przenumerowywane — `L-0007` w archiwum jest tym samym `L-0007`, do którego
odsyła destylat.

**Co zostaje po nich:** jedna **linia-odsyłacz** na początku sekcji „Lekcje", z zakresem numerów,
linkiem do pliku archiwum i sumą kontrolną.

Skutek dla graduacji: sprawdzając, czy dana korekta już padła, zaczynasz od „Zasad aktywnych"
(są kompletne) — i dopiero gdy trop prowadzi do numeru spoza żywego pliku, otwierasz archiwum.

## Jak ten plik jest czytany

Przy starcie sesji czytasz **wyłącznie sekcję „Zasady aktywne"**. Pełną listę lekcji otwierasz
tylko wtedy, gdy sprawdzasz, czy dana korekta już padła (przy graduacji) albo gdy użytkownik pyta
o historię. To jest cała oszczędność kontekstu, dla której ten plik ma dwie warstwy.

## Zakazy

- Nie pytasz o zgodę na zapis lekcji.
- Nie dopisujesz lekcji z własnej refleksji („chyba mogłem lepiej") — lekcja pochodzi z korekty
  użytkownika albo z przeglądu zamykającego etap, nigdy ze swobodnej autoanalizy.
- Nie kasujesz i nie przepisujesz starych wpisów (D-18).
- Nie wpisujesz sekretów ani cytatów zawierających klucze (D-42).
- Nie wpisujesz tu decyzji produktowych ani preferencji — mają własne rejestry.
- Nie przenosisz zasady do `CLAUDE.md` bez zgody człowieka.

## Przykład (projekt polski)

```markdown
# LEKCJE — Parkly

Rejestr korekt zamienionych w zasady. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

1. Nie dodawaj bibliotek bez pytania — najpierw sprawdź, czy problem rozwiązuje kod już w repo.
   (L-0001, L-0004)
2. Odpowiadaj tabelą tylko przy trzech i więcej kolumnach; w pozostałych wypadkach lista. (L-0002)
3. Migracje bazy uruchamiaj wyłącznie po jawnej zgodzie — nawet na środowisku testowym. (L-0003)

## Lekcje

### L-0001 — Dołożona zależność bez pytania · 2026-08-08 · ZGRADUOWANA 2026-08-19

- **Trigger:** dodałem `date-fns` do `package.json`, żeby sformatować jedną datę.
- **Przyczyna:** założyłem, że drobna zależność jest neutralna; nie sprawdziłem, że w repo jest już
  `formatDate` w `src/utils/date.ts`.
- **Zasada:** przed dodaniem jakiejkolwiek zależności przeszukaj repo pod kątem istniejącego
  rozwiązania i zapytaj, jeśli go nie ma.
- **Źródło:** „nie dokładaj paczek, mamy już swoje utilsy".

### L-0002 — Tabela zamiast listy · 2026-08-11 · AKTYWNA

- **Trigger:** odpowiedź o trzech krokach wdrożenia sformatowałem jako tabelę dwukolumnową.
- **Przyczyna:** przyzwyczajenie do tabel jako „porządniejszej" formy.
- **Zasada:** tabela tylko od trzech kolumn wzwyż; dwie kolumny to lista.
- **Źródło:** „ta tabela nic nie wnosi, wypisz to punktami".

### L-0003 — Migracja bez zgody · 2026-08-14 · AKTYWNA

- **Trigger:** uruchomiłem `npm run db:migrate` na środowisku testowym zaraz po napisaniu migracji.
- **Przyczyna:** uznałem środowisko testowe za bezpieczne domyślnie.
- **Zasada:** żadnej migracji bez jawnej zgody, niezależnie od środowiska.
- **Źródło:** „migracje odpalam ja, nie ty — nawet na teście".

### L-0004 — Powtórzenie L-0001 · 2026-08-19 · ZGRADUOWANA 2026-08-19

- **Trigger:** dodałem `lodash.debounce` zamiast napisać cztery linie.
- **Przyczyna:** ta sama przyczyna co w L-0001 — zależność uznana za „darmową".
- **Zasada:** jak w L-0001. Druga korekta w tej samej sprawie → zasada zgraduowana do `CLAUDE.md`
  za zgodą Łukasza.
- **Źródło:** „znowu paczka; wpisz to sobie na stałe".
```
