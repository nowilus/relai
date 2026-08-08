# SPEC — `docs/DESIGN.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/DESIGN.md` **w języku projektu**
(nazwa pliku zostaje `DESIGN.md` w obu językach).

Dokument **warunkowy** profilu `app` (D-10, D-51). Powstaje przy pierwszym pliku interfejsu —
komponencie, widoku, szablonie albo arkuszu stylów. Nigdy przy inicjalizacji.

## Rola

Umowa o wyglądzie i zachowaniu interfejsu, spisana raz i egzekwowana przy każdej kolejnej zmianie.
Odpowiada na pytanie „**jak to ma wyglądać i dlaczego tak?**" zanim ktoś zapyta „czemu ten przycisk
jest inny niż tamten".

Dokument jest **krótki z założenia**. Design system na trzydzieści stron przy jednym ekranie to
spekulacyjna generyczność — rośnie razem z interfejsem.

## Odbiorca

Agent piszący kod interfejsu — pierwszy i najważniejszy. Człowiek czyta go przy sporze o wygląd.

Hook `design-quality-check` przypomina o tym dokumencie przy każdej edycji pliku warstwy wizualnej
(`.css`, `.scss`, `.sass`, `.less`, `.html`, `.jsx`, `.tsx`, `.vue`, `.svelte`) i wstrzykuje do
kontekstu nagłówki jego sekcji. Dopóki `DESIGN.md` nie istnieje — hook milczy. To jest praktyczny
powód, dla którego warto go napisać wcześnie i krótko, zamiast dokładnie i nigdy.

## Jedno pytanie przy powstaniu (D-51)

Zanim napiszesz pierwszą wersję, zadajesz **jedno** krótkie pytanie o kierunek wizualny. Jedno —
nie wywiad i nie runda wariantów.

Zasady tego pytania:

- Pytasz o **cechy pozytywne**: nastrój, skojarzenie, czego użytkownik ma poczuć. Lista rzeczy
  zakazanych jest filtrem końcowym, nie briefem (L-0019).
- Podajesz 3–4 opcje z krótkim skutkiem każdej, pierwsza z dopiskiem „(Rekomendowane)"; rekomendację
  bierzesz z tego, co widzisz w projekcie (istniejące kolory, biblioteka komponentów, branża).
- Najpierw sprawdzasz `docs/USTAWIENIA.md` i warstwę globalną — kierunek już tam zapisany znaczy
  „nie pytaj" (L-0006). Wtedy mówisz pół zdaniem, co przyjąłeś i skąd.
- Odpowiedź trafia do sekcji „Kierunek" tego dokumentu, dosłownie, razem z datą.

Pytanie pada **przy pierwszym UI**, nie przy inicjalizacji. Limit trzech pytań startowych zostaje
nietknięty (D-20, D-80).

## Polityka aktualizacji

| Kiedy | Co się zmienia |
|---|---|
| Nowy kolor, krój albo odstęp wchodzący do użycia | tabela tokenów |
| Nowy komponent wielokrotnego użytku | wiersz w „Komponentach" |
| Zmiana zachowania wspólnego dla całego interfejsu (stany, ruch, siatka) | odpowiednia sekcja |
| Kierunek wizualny zmieniony przez człowieka | sekcja „Kierunek" + wiersz w `USTAWIENIA.md` |
| Zmiana wyglądu jednego ekranu bez nowych tokenów i komponentów | **nic** |

Dokument jest nadpisywany, nie dopisywany — historia zmian wyglądu mieszka w `DZIENNIK.md`.

## Struktura sekcji

1. **Nagłówek z datą** — `Stan na: RRRR-MM-DD`.
2. **Kierunek** — odpowiedź człowieka na pytanie o kierunek, dosłownie, plus dwa–trzy zdania
   rozwinięcia: co ma budzić, z czym się kojarzyć. To jest jedyna sekcja, której nie zmienia się
   bez człowieka.
3. **Tokeny** — tabela `Nazwa | Wartość | Gdzie używane`. Wyłącznie wartości naprawdę używane
   w kodzie; token bez użycia to śmieć. Kolory, typografia, skala odstępów, promienie, cienie.
4. **Komponenty** — tabela `Komponent | Warianty | Zasada`. Zasada mówi, kiedy użyć którego wariantu
   — bez tego warianty rozpleniają się same.
5. **Stany** — jak wygląda ładowanie, pustka, błąd i brak uprawnień. Sekcja obowiązkowa: stany
   pominięte w dokumencie są pomijane też w kodzie i wracają jako zgłoszenia.
6. **Ruch** — czy i gdzie jest animacja, jak długo trwa, co robi `prefers-reduced-motion`. Brak
   animacji też jest odpowiedzią i warto ją zapisać.
7. **Siatka i responsywność** — punkty łamania i zachowanie układu; co się dzieje z szeroką treścią
   (tabele, kod) na wąskim ekranie.
8. **Dostępność** — minimalny kontrast, rozmiar celu dotykowego, widoczny fokus, obsługa klawiaturą.
   Poziom, który projekt naprawdę utrzymuje, nie poziom aspiracyjny.
9. **Czego świadomie nie robimy** — odrzucone kierunki i wzorce, z powodem. Chroni przed wracaniem
   do rozstrzygniętych sporów; kierunek odrzucony na stałe przez człowieka trafia dodatkowo do
   `DECYZJE.md`.

## Zakazy

- Zero tokenów „na przyszłość" — paleta z dziewięcioma odcieniami przy interfejsie używającym
  trzech jest listą życzeń.
- Zero opisu implementacji (nazwy klas CSS, struktura komponentów w kodzie) — to jest w kodzie
  i w `ARCHITEKTURA.md`.
- Zero zewnętrznych linków jako jedynego nośnika ustaleń: „design jak w Figmie" znaczy, że
  dokument nie istnieje.
- Zero sekcji aspiracyjnych. „Dążymy do WCAG AAA" bez pokrycia w kodzie psuje zaufanie do całości.

## Przykład (projekt polski, pierwsza wersja po pierwszym UI)

```markdown
# DESIGN — Parkly

Stan na: 2026-08-09

## Kierunek

Odpowiedź na pytanie o kierunek (2026-08-09): „spokojne narzędzie biurowe — ma nie rzucać się
w oczy, ma być czytelne o ósmej rano".

Interfejs ma być cichy: dużo powietrza, jeden kolor akcentu, zero ozdobników walczących o uwagę.
Skojarzenie: dobrze zorganizowana tablica ogłoszeń, nie panel sterowania.

## Tokeny

| Nazwa | Wartość | Gdzie używane |
|---|---|---|
| `--tlo` | `#f7f7f5` | tło strony |
| `--tekst` | `#1f2421` | tekst podstawowy |
| `--akcent` | `#2f6f4e` | przyciski główne, aktywny dzień w kalendarzu |
| `--ostrzezenie` | `#a8442a` | brak wolnych miejsc, błędy formularza |
| `--krój-podstawowy` | Inter, systemowy bezszeryfowy | całość |
| `--odstęp` | 4 / 8 / 16 / 32 px | marginesy i odstępy — wyłącznie z tej skali |
| `--promień` | 6 px | przyciski, karty, pola formularza |

## Komponenty

| Komponent | Warianty | Zasada |
|---|---|---|
| Przycisk | główny, drugorzędny, tekstowy | jeden główny na ekran; drugorzędny dla akcji odwracalnych |
| Karta dnia | wolny, zajęty, wybrany | stan „zajęty" nigdy nie jest klikalny |
| Komunikat | informacja, ostrzeżenie | ostrzeżenie wyłącznie wtedy, gdy użytkownik musi coś zrobić |

## Stany

- **Ładowanie:** szkielet karty dnia, bez kręcącej się ikony.
- **Pustka:** „Na ten dzień nie ma jeszcze rezerwacji" + przycisk rezerwacji.
- **Błąd:** komunikat nad formularzem, treścią mówiący co zrobić, nie co się stało technicznie.
- **Brak uprawnień:** ekran z jednym zdaniem i kontaktem do administracji biura.

## Ruch

Wyłącznie zmiana tła przycisku (120 ms) i rozwijanie szczegółów dnia (180 ms). Bez animacji
dekoracyjnych. `prefers-reduced-motion: reduce` wyłącza rozwijanie — treść pojawia się od razu.

## Siatka i responsywność

Jedna kolumna do 720 px, dwie powyżej. Kalendarz miesięczny poniżej 720 px zamienia się w listę
dni. Tabele przewijają się poziomo we własnym kontenerze — strona nigdy nie przewija się w bok.

## Dostępność

Kontrast tekstu minimum 4.5:1 (sprawdzane dla `--tekst` na `--tlo` i dla białego na `--akcent`).
Cel dotykowy minimum 44×44 px. Fokus widoczny obwódką w kolorze akcentu — nigdy `outline: none`.
Cały przepływ rezerwacji przechodzi się klawiaturą.

## Czego świadomie nie robimy

- **Trybu ciemnego** — użytkownicy pracują w biurze przy świetle dziennym; do przemyślenia, gdy
  pojawi się aplikacja mobilna.
- **Własnych kontrolek kalendarza** — natywne pole daty jest gorsze wizualnie i lepsze w obsłudze
  klawiaturą; wybór świadomy.
```
