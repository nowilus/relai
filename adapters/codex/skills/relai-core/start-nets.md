# Siatki startu sesji

Zawartość: Brakujący prompt etapowy (D-34) · Rozjazd stanu · Rotacja na starcie sesji · Dokument ponad własnym progiem · Propozycja wycieczki po cudzym projekcie (D-27).

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy kontekst sesji niesie zgłoszenie hooka
`session-context` (luka promptu etapowego, rozjazd stanu, `[RelAI budzet startu]`,
`[RelAI progi dokumentow]`, nieznany autor dziennika) albo gdy bloku `[RelAI session-context]`
nie ma w kontekście wcale i porównania wykonujesz sam. Każda siatka podlega blokowi „Zasady
każdej siatki” z `SKILL.md`.

## Brakujący prompt etapowy (D-34)

Ostatni krok czytania, wykonywany **tylko wtedy**, gdy `CLAUDE.md` wskazuje aktywny plan. Sprawdź
w jego `STATUS.md`: czy etap ze statusem `GOTOWY DO STARTU` ma w kolumnie `Prompt` link do
istniejącego pliku.

- **Ma** → siatka milczy.
- **Nie ma** (kolumna pusta, `—`, albo link prowadzi do nieistniejącego pliku) → to ślad po sesji
  przerwanej w połowie rytuału „Na koniec". Powiedz o tym **jednym zdaniem** i zaproponuj
  wygenerowanie promptu. **Po zgodzie** generuje go skill `relai-planning`
  (specyfikacja: `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`) i uzupełnia kolumnę `Prompt`.
- Brak aktywnego planu, plan `DO AKCEPTACJI`, brak etapu `GOTOWY DO STARTU` → siatka milczy.

Siatka ma dwie warstwy: ten krok rytuału oraz hook `session-context`, który wstrzykuje lukę do
kontekstu nawet wtedy, gdy skill się nie wyzwolił. Hook już zgłosił lukę → przechodzisz od razu do
propozycji dogenerowania; jego zgłoszenie wystarcza.

## Rozjazd stanu

Trzy dokumenty mówią o tym samym: `STATUS.md` planu (który etap trwa), linia „Aktywny plan"
w `CLAUDE.md` (który plan jest aktywny) i `docs/STATE.md` („nad czym pracujemy teraz"). Sesja
przerwana w połowie zostawia je rozjechane, a następna sesja wierzy temu, który przeczytała
pierwszy.

**Sygnał niesie hook `session-context`.** Porównanie jest mechaniczne (statusy w tabeli, nazwa
folderu planu w treści STATE), więc działa bez wyzwolenia czegokolwiek (L-0030, R2).

- **Hook zgłosił rozjazd** → zgłaszasz go jednym zdaniem i pytasz, który zapis jest prawdziwy.
  Porównanie hooka jest rozstrzygające.
- **Hook milczy** → milczysz też.
- **Bloku `[RelAI session-context]` nie ma w ogóle** → porównujesz sam: etap `W TOKU`
  w `STATUS.md` kontra linia „Aktywny plan" i kontra wzmianka o tym planie w `STATE.md`.

Trzy dokumenty prostujesz dopiero po odpowiedzi człowieka — rozjazd nie mówi, który zapis jest
prawdą; etap mógł trwać albo urwać się w połowie. Po odpowiedzi aktualizujesz wszystkie trzy
w tej samej turze (D-44).

## Rotacja na starcie sesji

Rotacja ma dwa wejścia: zamknięcie sesji i start sesji. Przy starcie jeszcze coś oszczędza —
przy zamknięciu kontekst jest już wykupiony.

**Kiedy proponujesz** — gdy spełnione są **wszystkie trzy** warunki:

1. hook wypisał raport `[RelAI budzet startu]` z przekroczeniem budżetu,
2. w raporcie jest zdanie zaczynające się od **„Zaproponuj rotacje"** (sygnał, że wiersz
   `Rotacja dokumentów` w `USTAWIENIA.md` jest włączony — nie sprawdzasz tego drugi raz),
3. sesja jest **interaktywna**.

Brak któregokolwiek warunku → milczysz.

Zgłaszasz budżet jednym zdaniem i w tym samym zdaniu proponujesz rotację. **Po zgodzie**
wykonujesz **dokładnie tę samą** procedurę, co w kroku 2 rytuału zamknięcia — `document-rotation.md`:
dwie fazy, suma kontrolna, linia-odsyłacz, ślad we wpisie dziennika tej sesji. Mechanizm jest jeden.

**Sesja nieinteraktywna** (`claude -p`, agent w tle, hook w CI) → rotacji **nie uruchamiasz**.
Rozpoznajesz ją po linii raportu „Sesja nieinteraktywna: to jest sam raport…". W Claude Code tej
linii nie ma — payload `SessionStart` nie odróżnia `claude -p` (L-0032) — więc propozycja padnie
także w sesji nieinteraktywnej, ale rotacja i tak nie ruszy bez zgody, a zgody nie ma komu
udzielić. Zasada „propozycja nie zamienia się w odpalenie” jest tu jedynym zabezpieczeniem.

## Dokument ponad własnym progiem

Hook wypisuje linię `[RelAI progi dokumentow]`, gdy dokument albo sekcja przekracza **własny**
próg rotacji — niezależnie od tego, czy suma warstwy startowej mieści się w budżecie. To drugi
wyzwalacz tego samego raportu: linia o budżecie i linia o dokumentach stoją osobno, każda we
własnym zdaniu.

Każda wymieniona pozycja niesie **nazwę procedury**, która ją odchudza (rotacja dziennika, rotacja
lekcji, rotacja ryzyk zamkniętych, przeniesienie zwiniętych lekcji, skrócenie `STATE.md`).
Zgłaszasz to jednym zdaniem i proponujesz wymienione procedury jako pierwszy krok; wykonujesz je
po zgodzie **dokładnie** tak, jak opisuje `document-rotation.md`.

Linia hooka niesie zmierzone wartości — bierzesz je z niej. Wypisuje najwyżej trzy pozycje,
a resztę jako liczbę: przekazujesz skrót, komplet zostaje w linii.

## Propozycja wycieczki po cudzym projekcie (D-27)

Krok kontrolny po przeczytaniu dziennika. Sprawdź, czy **którykolwiek** podpis pod wpisami
(`Autor: RelAI (<model>) + <użytkownik>`) zawiera nazwę bieżącego użytkownika z
`git config user.name`.

- **Zawiera** albo dziennik nie ma jeszcze ani jednego podpisu → milczysz.
- **Nie zawiera żadnego** → to cudzy projekt. Powiedz **jednym zdaniem**, że wpisy w dzienniku
  podpisał kto inny, i zaproponuj wycieczkę: stan, mapa dokumentów, aktywne plany, ryzyka, od czego
  zacząć. Po zgodzie wykonujesz procedurę komendy `/relai-tour`.
- Gita nie ma albo `user.name` nie jest ustawione → milczysz; nie da się rozstrzygnąć, kto pracuje.

Hook `session-context` wykonuje to samo porównanie niezależnie od skilla (R2). Hook już zgłosił
nieznanego autora → przejdź od razu do propozycji. Sygnał gaśnie sam, gdy nowa osoba dopisze
pierwszy wpis do dziennika.
