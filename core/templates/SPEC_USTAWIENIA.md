# SPEC — `docs/USTAWIENIA.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/USTAWIENIA.md` **w języku
projektu** (`docs/SETTINGS.md` dla projektu angielskiego).

## Rola

Rejestr preferencji użytkownika w tym projekcie i **marker struktury RelAI**. Realizuje zasadę
„zapytaj raz, zapisz, respektuj" (D-22): odpowiedź raz udzielona nigdy nie wraca jako pytanie.

Dwie funkcje w jednym pliku:

1. **Marker wersji** — po linii `Wersja RelAI:` RelAI rozpoznaje, że folder jest projektem RelAI,
   a przyszła aktualizacja pluginu wie, od czego liczyć różnicę (Aneks A pkt 4.2).
2. **Rejestr wyborów** — tabela `Data | Czego dotyczy | Decyzja`.

## Odbiorca

Agent (podstawowy) — sprawdza tu preferencje, zanim zapyta o cokolwiek. Użytkownik zagląda, gdy chce
coś zmienić.

## Warstwy ustawień (D-23)

Globalne preferencje użytkownika (`~/.claude/relai/USTAWIENIA.md`, w projekcie angielskim
`~/.claude/relai/SETTINGS.md`) są dziedziczone przez nowe projekty; wpis w `docs/USTAWIENIA.md`
**nadpisuje** wartość globalną. Wpis lokalny wygrywa zawsze.

**Plik globalny** ma **identyczną strukturę** jak projektowy, z trzema różnicami:

1. Nagłówek brzmi `# USTAWIENIA — preferencje globalne` (bez nazwy projektu).
2. **Nie zawiera linii `Wersja RelAI:`** — marker wersji jest cechą projektu, nie użytkownika.
   Umieszczenie go tam sprawiłoby, że katalog domowy zostałby uznany za projekt RelAI.
3. Trafiają do niego wyłącznie preferencje **ponadprojektowe**: język pracy, format planów, model
   wykonawczy etapów, lokalizacja backupów, kierunek designu. Rzeczy z natury projektowe (git
   remote, profil projektu, podejście do testów w tym repo, **nadpisanie lokalne szablonu planu
   HTML** — wskazuje ścieżkę wewnątrz repozytorium) zostają w pliku projektowym.

**Kiedy powstaje:** przy pierwszej inicjalizacji projektu RelAI na danej maszynie, zaraz po paczce
trzech pytań — z ponadprojektowego podzbioru odpowiedzi. Nie zadajesz z tego powodu dodatkowego
pytania (limit trzech jest twardy, D-80); informujesz jednym zdaniem w podsumowaniu.

**Kolejność odczytu przed każdym pytaniem o preferencję:** `docs/USTAWIENIA.md` → plik globalny →
dopiero wtedy pytanie. Znalazłeś odpowiedź — nie pytasz; wspominasz pół zdaniem, skąd ją masz.

### Przykład pliku globalnego

```markdown
# USTAWIENIA — preferencje globalne

Preferencje użytkownika dziedziczone przez nowe projekty RelAI. Wpis w `docs/USTAWIENIA.md`
projektu nadpisuje wartość stąd.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język pracy | Polski — dokumentacja PL, kod EN, commity conventional EN |
| 2026-08-12 | Format planów | Interaktywny HTML dla planów głównych, Markdown dla promptów etapowych |
| 2026-08-20 | Lokalizacja backupów | `D:\Backupy\Projekty` |
```

## Struktura pliku

1. **Nagłówek** — `# USTAWIENIA — <nazwa projektu>`.
2. **Linia markera** — dokładnie: `Wersja RelAI: <semver>` oraz data inicjalizacji. Ta linia
   **musi** znaleźć się w pliku przy inicjalizacji i **musi** być aktualizowana przy aktualizacji
   pluginu. Bez niej RelAI nie rozpozna projektu.
3. **Zdanie o roli pliku** — jedno.
4. **Tabela ustawień** — `Data | Czego dotyczy | Decyzja`. Najstarsze u góry.
5. *(opcjonalnie, gdy się pojawi)* **Sekcja „Ustawienia wycofane"** — wpis zastąpiony nie znika
   z tabeli; przenosisz go tutaj z adnotacją „zastąpione przez … dnia … , powód …" (D-18).

## Wiersz to jedna decyzja, jednym zdaniem (od 1.6.0)

Komórka `Decyzja` niesie **rozstrzygnięcie** — to, co obowiązuje. Nie niesie drogi, którą do niego
doszliśmy: uzasadnienie, odrzucone warianty, historia zmiany zdania i „po czym poznaliśmy, że tak
jest lepiej" mieszkają w `docs/DECYZJE.md`, a przebieg — we wpisie dziennika.

Powód jest ten sam co przy ryzykach: ten plik jest czytany przy **każdym** starcie sesji, a wiersz
z uzasadnieniem kosztuje w każdej z nich. Zmierzone 2026-08-21 w tym repozytorium `FAKT`: jedna
komórka `Decyzja` ważyła 1,3 KB — więcej niż cała reszta tabeli razem.

**Reguła:** jedno zdanie, najwyżej dwa. Trzecie zdanie jest sygnałem, że w komórce siedzi
uzasadnienie.

**Wiersz, który już jest za długi:** przenosisz, nie kasujesz (D-18). Uzasadnienie i odrzucone
warianty idą do `DECYZJE.md` jako decyzja z tą samą datą, a w komórce zostaje rozstrzygnięcie
z odsyłaczem — `(D-61)`. Fakt, który nie ma domu ani tu, ani tam, idzie do wpisu dziennika tej
sesji, zanim skrócisz wiersz.

### Wiersze czytane maszynowo — tej reguły nie dotyczą

Trzy wiersze mają **zamknięty format** opisany niżej w tej specyfikacji i są parsowane przez hooki:

| Wiersz | Czyta go |
|---|---|
| `Profil projektu` | hooki `profile-rules` i `config-protection` |
| `Rotacja dokumentów` | procedura rotacji (`SPEC_ARCHIWUM.md`) |
| `Budżet startu sesji` | pomiar warstwy startowej w hooku startu sesji |

**Ich nie skracasz.** Człony rozdzielone `·` wyglądają jak rozwlekłość, a są składnią: usunięcie
członu zmienia próg na domyślny, a przeredagowanie kotwicy na początku komórki **wycisza mechanizm
w ciszy** (L-0025). Skrócenie, które wyłącza pomiar albo rotację, jest defektem, nie oszczędnością.

## Wpisy tworzone przy inicjalizacji

Zawsze te trzy, z odpowiedzi na paczkę startową (D-20), plus wersja RelAI w linii markera:

| Czego dotyczy | Skąd |
|---|---|
| Język projektu | pytanie 1 (dokumentacja / kod / commity) |
| Git | pytanie 2 |
| Profil projektu | pytanie 3 |
| Rotacja dokumentów | wartość domyślna `włączona` — **bez pytania**, limit trzech pytań jest twardy (D-80) |
| Budżet startu sesji | wartość domyślna `włączony` — **bez pytania**, tak samo jak rotacja (od 1.6.0) |

Wiersz **`Profil projektu`** jest czytany maszynowo — hooki `profile-rules` i `config-protection`
biorą z niego reguły warunkowe (D-50). Kolumna `Decyzja` musi **zaczynać się** od jednej z czterech
wartości, napisanej dosłownie: `app`, `agent-voice`, `flow`, `prompty`. Opis w nawiasie za nią jest
dozwolony i pomijany (`app (Next.js + PostgreSQL)` jest poprawne). Nazwy profilu **nie tłumaczysz**
na język projektu.

Wartość nierozpoznana wycisza reguły profilu — hooki milczą, zamiast zgadywać. Nazwa profilu
wspomniana w prozie środka komórki nie jest wyborem profilu i celowo nie działa.

Wiersz **`Podejście do testów`** powstaje dopiero przy pierwszym kodzie w profilu `app` (D-25) —
nie przy inicjalizacji. Jego obecność wycisza pytanie o testy, więc nazwy tego wiersza też nie
zmieniasz dowolnie.

## Wiersz `Rotacja dokumentów` (od 1.2.0)

Rotacja przenosi najstarszą historię z żywych dokumentów do `docs/archiwum/` w rytuale zamknięcia
sesji (mechanizm: `SPEC_ARCHIWUM.md`). Ten wiersz jest jej **wyłącznikiem i miejscem na progi**;
powstaje przy inicjalizacji projektu oraz przy `/relai-update` projektu z wcześniejszej wersji.

Format komórki `Decyzja` jest sztywny, bo jest czytana maszynowo (L-0025) — kotwica na **początku**
komórki, człony rozdzielone `·`:

```
włączona · dziennik 150 KB · lekcje 40 wpisów albo 50 KB · STATE 300 linii
```

| Człon | Dozwolone wartości | Znaczenie |
|---|---|---|
| przełącznik (**pierwszy, obowiązkowy**) | `włączona` / `wyłączona` (EN: `on` / `off`) | `wyłączona` → progów nawet nie sprawdzasz, rytuał zamknięcia przebiega bez rotacji i bez komunikatu |
| `dziennik <liczba> KB` | liczba całkowita | próg rozmiaru `DZIENNIK.md` |
| `lekcje <liczba> wpisów albo <liczba> KB` | dwie liczby całkowite | próg `LEKCJE.md` — zadziała ten, który padnie pierwszy |
| `STATE <liczba> linii` | liczba całkowita | próg `STATE.md`; STATE nie jest archiwizowany, tylko pisany zwięźlej |

Człon pominięty znaczy „wartość domyślna" — projekt, który niczego nie stroi, ma w komórce samo
`włączona`. **Wartość przełącznika nierozpoznana → rotacja jest wyłączona** i mówisz o tym jednym
zdaniem. To jedyne miejsce, gdzie nierozpoznana wartość nie kończy się ciszą (L-0025): rotacja
zmienia treść dokumentów, więc niepewność rozstrzyga się na korzyść bezczynności, ale człowiek ma
o tym wiedzieć.

Progi domyślne — `SZACUNEK`, skalibrowane 2026-08-12 na zmierzonych projektach (JiraManager:
dziennik 348 KB / 27 wpisów, lekcje 32 KB / 16 pozycji, STATE 431 linii; PolyFlow: dziennik 223 KB
/ 43 wpisy, lekcje 48 KB / 29 pozycji, STATE 879 linii) — mieszkają w `SPEC_ARCHIWUM.md` i są
jedynym źródłem prawdy o wartościach domyślnych.

## Wiersz `Budżet startu sesji` (od 1.6.0)

Rytuał startu sesji czyta sześć pozycji: `CLAUDE.md`, `docs/STATE.md`, sekcję „Stan otwartych
ryzyk" **plus ostatni wpis** dziennika, sekcję „Zasady aktywne" rejestru lekcji, ten plik oraz
`STATUS.md` aktywnego planu. Ten wiersz mówi, ile ta szóstka **wolno**, żeby ważyła, i jest
**wyłącznikiem** pomiaru. Powstaje przy inicjalizacji projektu oraz przy `/relai-update` projektu
z wcześniejszej wersji.

Pomiar wykonuje hook startu sesji, nie skill — ma działać przy każdym modelu i bez wyzwalania
czegokolwiek (L-0030). **Poniżej budżetu w kontekście startu nie pojawia się ani jeden znak.**
Raport powstaje wyłącznie powyżej progu i ma najwyżej sześć linii. Pomiar niczego nie blokuje
i niczego nie zmienia w plikach — mówi i proponuje.

Format komórki `Decyzja` jest sztywny, bo jest czytana maszynowo (L-0025) — kotwica na **początku**
komórki, człony rozdzielone `·`:

```
włączony · start 80 KB · CLAUDE 10 KB · STATE 12 KB · ryzyka 12 KB · zasady 30 KB · ustawienia 6 KB · status 10 KB
```

| Człon | Dozwolone wartości | Znaczenie |
|---|---|---|
| przełącznik (**pierwszy, obowiązkowy**) | `włączony` / `wyłączony` (EN: `on` / `off`) | `wyłączony` → nie liczysz nic i nie mówisz nic |
| `start <liczba> KB` | liczba całkowita | budżet całej warstwy startowej — **domyślnie 80** |
| `CLAUDE <liczba> KB` | liczba całkowita | próg cząstkowy `CLAUDE.md` — **domyślnie 10** |
| `STATE <liczba> KB` | liczba całkowita | próg cząstkowy `docs/STATE.md` — **domyślnie 12** |
| `ryzyka <liczba> KB` (EN: `risks`) | liczba całkowita | próg sekcji ryzyk wraz z ostatnim wpisem — **domyślnie 12** |
| `zasady <liczba> KB` (EN: `rules`) | liczba całkowita | próg sekcji „Zasady aktywne" — **domyślnie 30** |
| `ustawienia <liczba> KB` (EN: `settings`) | liczba całkowita | próg tego pliku — **domyślnie 6** |
| `status <liczba> KB` | liczba całkowita | próg `STATUS.md` aktywnego planu — **domyślnie 10** |

To jest **jedyne źródło prawdy o domyślnym budżecie** — inne specyfikacje nie powtarzają tych
liczb. Człon pominięty znaczy „wartość domyślna": projekt, który niczego nie stroi, ma w komórce
samo `włączony`. Progi cząstkowe **nie sumują się do budżetu** i nie mają się sumować — 80 KB jest
sufitem całości, a progi cząstkowe wskazują winowajcę. Raport wyzwala **wyłącznie** przekroczenie
sumy: pozycja grubsza od swojego progu w projekcie mieszczącym się w budżecie nie odzywa się
w ogóle, bo inaczej cisza przestałaby cokolwiek znaczyć.

**Wartość przełącznika nierozpoznana → pomiar jest wyłączony** i pada o tym jedno zdanie. To ten
sam wyjątek co przy rotacji (L-0025): niepewność rozstrzyga się na korzyść bezczynności, ale
człowiek ma o tym wiedzieć.

**Brak wiersza w tabeli → cisza.** Projekt sprzed 1.6.0 nie zaczyna nagle mierzyć sam z siebie;
wiersz wnosi tam `/relai-update`. Milczenie jest tu bezpieczne, bo pomiar niczego nie pilnuje —
najgorszym skutkiem jest projekt, który nie wie, ile kosztuje jego start.

**Budżet i rotacja to dwa niezależne wyłączniki** i mają takie zostać. Rotacja wyłączona nie
wycisza pomiaru; budżet wyłączony nie wycisza rotacji.

Pozycji, której w projekcie nie ma (najczęściej `STATUS.md`, gdy nie ma aktywnego planu), **nie
liczy się jako zero** — wypada z sumy, a budżet zostaje bez zmian. Zwolnione KB są zapasem, nie
premią do rozdania między pozostałe progi.

Gdy dokument nie ma szukanego nagłówka (projekt po adopcji, nietypowa struktura), mierzony jest
**cały plik**, a raport mówi o tym wprost i nazywa pozycję. Wartość zawyżona z jawnym powodem jest
bezpieczna; wartość zgadnięta nie jest.

## Polityka aktualizacji

- **Append.** Nowa preferencja to nowy wiersz z datą, nie edycja starego.
- Zmiana wcześniejszej decyzji: nowy wiersz z dzisiejszą datą **i** przeniesienie poprzedniego do
  „Ustawienia wycofane" z powodem. Historia ustaleń nie znika.
- Wpis powstaje **natychmiast** po tym, jak użytkownik coś rozstrzygnął — nie na koniec sesji.
- Aktualizacja pluginu → zmiana wyłącznie linii `Wersja RelAI:` (i wiersz w tabeli, jeśli
  aktualizacja zmieniła coś, na co użytkownik się zgodził).

## Co tu trafia, a co nie

**Trafia:** język, git, profil, sposób prowadzenia planów, podejście do testów, model wykonawczy
etapów, lokalizacja backupów, rotacja dokumentów, budżet startu sesji, zgody na wyjątki od reguł
domyślnych, wybrany kierunek designu.

**Nie trafia:** decyzje architektoniczne i produktowe („nie proponuj ponownie") — te idą do
`docs/DECYZJE.md`; lekcje z korekt — do `docs/LEKCJE.md`; stan prac — do `STATE.md`.

## Zakazy

- Zero sekretów, tokenów i haseł — także jako „ustawienie" (D-42). Zapisujesz **nazwę** zmiennej
  środowiskowej i miejsce, gdzie trzymany jest sekret, nigdy wartość.
- Nie usuwasz wierszy z tabeli.
- Nie zmieniasz brzmienia linii `Wersja RelAI:` — jest wykrywana dosłownie.

## Przykład (projekt polski)

```markdown
# USTAWIENIA — Parkly

Wersja RelAI: 1.5.0 · zainicjowano: 2026-08-07

Rejestr wyborów użytkownika dla tego projektu. Każdy wpis: data, czego dotyczył, decyzja.
Odpowiedź raz udzielona nie wraca jako pytanie.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język projektu | Polski — dokumentacja PL, kod i identyfikatory EN, commity conventional EN |
| 2026-08-07 | Git | Repo lokalne + zdalne na GitHub (prywatne) |
| 2026-08-07 | Profil projektu | app (Next.js + PostgreSQL) |
| 2026-08-07 | Rotacja dokumentów | włączona |
| 2026-08-07 | Budżet startu sesji | włączony |
| 2026-08-12 | Podejście do testów | Testy krytycznych ścieżek, bez pełnego TDD |
| 2026-08-14 | Format planów | Interaktywny HTML dla planów głównych; `STATUS.md` i prompty etapowe w Markdown |
| 2026-08-14 | Szablon planu HTML | Nadpisanie lokalne w `docs/zasoby/HTML_PLAN/` — ma pierwszeństwo przed wersją z pluginu (D-58) |
| 2026-08-20 | Lokalizacja backupów | `D:\Backupy\Projekty` |
```

Trzy pierwsze wiersze to jedno zdanie każdy. Wiersze `Profil projektu`, `Rotacja dokumentów`
i `Budżet startu sesji` wyglądają na dłuższe i **takie mają zostać** — to składnia, nie proza.
Wiersz „Szablon planu HTML" pokazuje wzorzec skracania: rozstrzygnięcie zostaje, a „zmieniona
paleta i krój nagłówków, bo domyślna kolorystyka nie przechodziła u klienta" mieszka w `D-58`
w `docs/DECYZJE.md`.
