# SPEC — `docs/PULAPKI.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/PULAPKI.md` **w języku
projektu** (nazwa pliku też podąża za językiem: `PITFALLS.md` dla projektu angielskiego).

## Rola

Rejestr rzeczy, które **zaskoczyły i zaskoczą znowu**. Odpowiada na jedno pytanie: *„zanim uznam,
że to zepsute — czy ktoś już się na tym przejechał?"*.

Pułapka to własność **środowiska, narzędzia albo kolejności kroków**, nie własność projektu i nie
własność agenta. Jest zewnętrzna wobec kodu: nie da się jej naprawić commitem, można ją tylko znać
albo się na nią nadziać drugi raz.

## Odbiorca

Sesja, która **właśnie utknęła** — i człowiek, który utknął tak samo. Wpis czyta ktoś, kto ma przed
sobą objaw i nie wie, czy patrzy na błąd, czy na zachowanie. Dlatego wpis zaczyna się od objawu,
a nie od wyjaśnienia.

## Kiedy dokument powstaje — przy pierwszej pułapce, nigdy na zapas

Dokument jest **warunkowy** (D-11, L-0029). Nie powstaje przy inicjalizacji projektu, nie powstaje
„na przyszłość" i nie zostawia po sobie pustego nagłówka ani wypełniacza. Projekt, który nie wpadł
jeszcze w żadną pułapkę, nie ma tego pliku — i to jest stan poprawny, nie brak.

Pierwsza pułapka zakłada dokument i **w tej samej turze** dokłada jedną linię odsyłacza w „Regułach
procesu" `CLAUDE.md` (`SPEC_CLAUDE_MD.md`, sekcja „Linia odsyłacza do `docs/PULAPKI.md`").
Kolejność jest sztywna: **najpierw dokument, potem linia** — odsyłacz do pliku, którego nie ma, to
martwy link (L-0013).

Pominięcie komponentu jest bezśladowe w obie strony: nie ma dokumentu → nie ma linii → kontekst
startu sesji wygląda dokładnie tak, jakby ta specyfikacja nie istniała.

## Kto go czyta — na żądanie, nie na starcie

`docs/PULAPKI.md` **nie wchodzi do warstwy startowej sesji**. Rytuał startu czyta sześć pozycji
(`SPEC_USTAWIENIA.md`, wiersz `Budżet startu sesji`) i ten plik nie jest żadną z nich — dlatego nie
liczy się do budżetu 80 KB i może rosnąć bez szkody dla kosztu pierwszego prompta.

Sesja sięga po niego w trzech sytuacjach:

1. coś **nie działa tak, jak mówi dokumentacja** narzędzia albo intuicja,
2. przed krokiem, o którym wiadomo, że bywa kapryśny (wydanie, migracja, instalacja hooka),
3. gdy człowiek pyta wprost („co tu zwykle wybucha?").

To jest **cały powód**, dla którego pułapki wyprowadza się z `CLAUDE.md` do osobnego pliku:
w `CLAUDE.md` rejestr był opłacany tokenami w każdym prompcie, także wtedy, gdy nic nie wybuchało.
Zmierzone 2026-08-20: 531 linii rejestru pułapek w pliku ładowanym do każdego prompta `FAKT`.

## Czym pułapka jest, a czym nie jest

| Trafia tutaj | Trafia gdzie indziej |
|---|---|
| nieoczywiste zachowanie narzędzia zewnętrznego | korekta sposobu Twojej pracy → `LEKCJE.md` |
| kolejność kroków, której odwrócenie cicho psuje wynik | rozstrzygnięcie w projekcie („baza: PostgreSQL") → `DECYZJE.md` |
| wymóg środowiska, o którym nie mówi żaden komunikat błędu | preferencja, o którą zapytałeś → `USTAWIENIA.md` |
| rozbieżność między dokumentacją narzędzia a jego zachowaniem | zagrożenie dla planu, z poziomem i mitygacją → sekcja ryzyk w `DZIENNIK.md` |
| pułapka platformy (kodowanie, ścieżki, powłoka, uprawnienia) | jak działa nasz kod → `ARCHITEKTURA.md` |

Test rozstrzygający, gdy nie wiadomo: **czy to zachowa się tak samo w innym projekcie na tej samej
maszynie i tym samym narzędziu?** Tak → pułapka. Nie → to własność tego projektu i ma inny dom.

Drugi test, dla granicy z `LEKCJE.md`, która jest najczęściej mylona: **czy dałoby się tego uniknąć,
zachowując się inaczej?** Tak → lekcja („sprawdzaj X przed Y"). Nie, bo świat po prostu tak działa
→ pułapka („X w tym środowisku robi Z").

Jedna sprawa bywa jednym i drugim: narzędzie zachowuje się nieoczywiście (**pułapka**), a Ty
wyciągnąłeś z tego regułę pracy (**lekcja**). Wtedy istnieją oba wpisy i **wskazują na siebie** —
lekcja niesie zasadę, pułapka niesie fakt o świecie. Nie dublujesz treści: lekcja mówi „co robić",
pułapka „co się dzieje".

## Polityka aktualizacji: APPEND, sekcja „Nieaktualne" zamiast kasowania

- Wpis powstaje **w tej samej turze**, w której pułapka wyszła na jaw — nie na koniec sesji.
- Wpisów **nie edytujesz wstecz**. Zmieniło się zachowanie narzędzia → nowy wpis albo adnotacja
  z datą przy starym, nigdy podmiana treści (D-18).
- Numeracja `P-NNN` (trzy cyfry, od `P-001`) jest ciągła i **nigdy nie używana ponownie**.
- Pułapka, która przestała istnieć (poprawiona wersja narzędzia, zmienione środowisko), dostaje
  status `NIEAKTUALNA <data>` **z powodem** i przenosi się do sekcji „Nieaktualne" na końcu pliku.
  Nie kasujesz jej: wiedza „to już nie boli od wersji X" jest tyle samo warta co sama pułapka,
  a projekt bywa uruchamiany na starym środowisku.
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku

1. **Nagłówek** — `# PUŁAPKI — <nazwa projektu>` + jedno zdanie o roli i o tym, że plik czyta się
   **na żądanie**.
2. **Sekcja „Pułapki"** — wpisy `P-NNN`, najnowszy **u góry**. To jedyny rejestr RelAI odwrócony
   chronologicznie i jest to celowe: czytelnik szuka tu objawu, a nie historii, a świeże pułapki
   dotyczą aktualnych wersji narzędzi.
3. *(gdy powstanie)* **Sekcja „Nieaktualne"** — wpisy ze statusem `NIEAKTUALNA <data>`.

Spisu treści **nie budujesz** — jest odtwarzalny z nagłówków i rozjeżdża się przy pierwszym wpisie.

## Format wpisu (obowiązkowy)

```
### P-NNN — <objaw w jednym zdaniu> · RRRR-MM-DD · <STATUS>

- **Objaw:** co widać. Dokładny komunikat albo dokładne „nic się nie stało".
- **Przyczyna:** dlaczego tak jest — własność narzędzia, środowiska albo kolejności kroków.
- **Obejście:** co zrobić zamiast. Konkretna komenda, kolejność albo warunek.
- **Zasięg:** czego dotyczy — narzędzie i wersja, system, powłoka. Bez tego wpis starzeje się
  po cichu.
```

**Statusy:** `AKTYWNA` (domyślny) · `NIEAKTUALNA <data> — <powód>`.

Zasady dobrego wpisu:

- **Objaw jest dosłowny.** „Nie działa archiwum" to nie objaw. „`tar -a -cf x.zip` kończy się kodem
  0, a plik ma nagłówek `ustar`, nie `PK`" — to objaw. Wpis znajduje się przez wyszukanie objawu,
  więc objaw ma brzmieć tak, jak brzmi na ekranie.
- **Obejście jest wykonywalne.** Komenda, flaga, kolejność kroków — nie „uważaj na to".
- **Zasięg jest konkretny.** „Windows" to za mało; „Git Bash na Windows, GNU tar 1.34" wystarczy.
- **Cisza też jest objawem.** Najgorsze pułapki nie dają komunikatu — wpis o takiej mówi wprost,
  że objawem jest brak objawu.

## Zakazy

- Nie zakładasz dokumentu na zapas i nie zostawiasz pustych nagłówków (L-0029).
- Nie kasujesz i nie przepisujesz starych wpisów — od tego jest status `NIEAKTUALNA` (D-18).
- Nie wpisujesz sekretów, tokenów ani ścieżek z poświadczeniami (D-42). Nazwa zmiennej tak,
  wartość nigdy.
- Nie wpisujesz tu lekcji o sposobie pracy, decyzji produktowych ani ryzyk — mają własne rejestry.
- Nie dokładasz tego pliku do rytuału startu sesji. Wejście do warstwy startowej jest zmianą
  budżetu, nie drobiazgiem.
- Nie streszczasz wpisu do jednego zdania w `CLAUDE.md` „dla wygody" — jedna linia odsyłacza to
  cały ślad, jaki ten rejestr zostawia w warstwie startowej.

## Przykład (projekt polski)

Poniżej **dosłowny fragment** `docs/PULAPKI.md` repozytorium RelAI (stan 2026-08-20): trzy z sześciu
wpisów, w tym jeden, którego objawem jest brak objawu. Sekcja „Nieaktualne" w tym projekcie jeszcze
nie powstała — powstanie przy pierwszej pułapce, która przestanie boleć.

```markdown
# PUŁAPKI — budowa RelAI

Rzeczy, które zaskoczyły i zaskoczą znowu: zachowania narzędzi, kolejności kroków, wymogi
środowiska. Czytaj **na żądanie** — zanim uznasz, że coś jest zepsute. Najnowsze u góry.

Ten plik **nie jest czytany przy starcie sesji** i nie liczy się do budżetu warstwy startowej.
Specyfikacja: `SPEC_PULAPKI.md`.

## Pułapki

### P-006 — `git archive | tar` na Windows nie robi kopii drzewa · 2026-08-12 · AKTYWNA

- **Objaw:** `tar: Cannot connect to C: resolve failed` przy próbie zmaterializowania drzewa
  dowolnego commita.
- **Przyczyna:** GNU tar czyta ścieżkę `C:\...` jako `host:ścieżka`, czyli adres archiwum zdalnego.
  Litera dysku wygląda dla niego jak nazwa hosta.
- **Obejście:** `git worktree add --detach <katalog> <ref>`, sprzątanie
  `git worktree remove --force <katalog>`. Działa niezależnie od systemu, nie wymaga pośredniego
  archiwum i zostawia czysty stan. Rurociąg `git archive | tar` zostaw dla Uniksa.
- **Zasięg:** Git Bash na Windows, GNU tar; nie dotyczy Linuksa ani WSL. Źródło: L-0039.

### P-005 — `claude plugin update` nie działa do restartu aplikacji · 2026-08-10 · AKTYWNA

- **Objaw:** `installed_plugins.json` pokazuje nową wersję i `gitCommitSha`, CLI melduje „updated
  from X to Y", a sesje ładują starą treść skilla. Objawem jest **brak objawu**: nic nie protestuje,
  a mierzysz starą wersję.
- **Przyczyna:** `plugin update` podmienia wpis instalacji i pobiera nowy katalog cache, ale
  działająca aplikacja nadal ładuje stary — komunikat „Restart to apply changes" jest dosłowny.
  Gorzej: mechanizm kontrolny wbudowany w plugin **sam pochodzi ze starej wersji**, więc porównuje
  X z X, widzi zgodność i milczy. Kontrola wbudowana w wersję X nie wykryje, że działa X zamiast Y.
- **Obejście:** po `claude plugin update` **zrestartuj aplikację**, zanim cokolwiek zmierzysz.
  Którą wersję sesja naprawdę wykonuje, sprawdzasz po **ścieżce cache w transkrypcie** albo po
  treści pliku, który się zmienił — nie po `installed_plugins.json` i nie po komunikacie CLI.
- **Zasięg:** Claude Code, aplikacja desktopowa; potwierdzone na 0.9.0 → 1.0.0. Źródło: L-0031,
  L-0020.

### P-001 — `tar` na `PATH` nie jest tym `tar`, o którym myślisz · 2026-08-08 · AKTYWNA

- **Objaw:** `tar -a -c -f test.zip …` w Git Bashu kończy się kodem 0 bez ostrzeżenia, plik
  powstaje, `tar -tf` wypisuje zawartość — a Eksplorator Windows i `Expand-Archive` go nie otworzą.
  Pierwsze bajty to `ustar`, nie `PK`.
- **Przyczyna:** `tar` na `PATH` w Git Bash to GNU tar (1.35), który ZIP-a nie umie i po cichu
  ignoruje intencję `-a`. Systemowy `C:\Windows\System32\tar.exe` to bsdtar (libarchive) i ten sam
  zapis daje prawdziwy ZIP. Nazwa polecenia nie mówi nic o implementacji.
- **Obejście:** narzędzie systemowe rozstrzygające o **formacie** artefaktu wywołuj **pełną
  ścieżką** i weryfikuj **wynik**, nie kod wyjścia: nagłówek pliku, lista wpisów, otwarcie natywnym
  narzędziem platformy docelowej.
- **Zasięg:** Git Bash na Windows z GNU tar w `PATH`. Źródło: L-0021.
```

Wpis nieaktualny wygląda tak samo, z innym statusem i sekcją:

```markdown
## Nieaktualne

### P-00N — <objaw> · <data powstania> · NIEAKTUALNA 2026-08-17 — poprawka 1.5.1

- **Objaw:** …
- **Przyczyna:** …
- **Obejście:** *(historyczne)* …
- **Zasięg:** … ; przestało dotyczyć od <wersja/data> i **dlaczego**.
```
