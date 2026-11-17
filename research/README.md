# RelAI Research — 0.1.0

Mod Claude Code. Wymaga Claude Code z modami (zmierzono na Claude Code 2.1.325).

## Co robi

Planer wybiera dla pytania tryb quick albo deep. Quick czyta do czterech stron równolegle i cytuje tylko strony, które rzeczywiście przeczytał. Deep dzieli pytanie na 2–4 części, które badają agenci typu `relai-research:reader` z narzędziami WebSearch, WebFetch i ToolSearch. Tryb `auto` streszcza komentarz WebSearch w głównym czacie, gdy jest większy niż 800 tokenów; oryginał zostaje zapisany.

## Polecenia

- `/relai-research <pytanie>` — planer wybiera quick albo deep. Komenda wraca od razu, a raport przychodzi później jako wiadomość. Do tego czasu nie badaj tego samego pytania samodzielnie.
- `/relai-research deep <pytanie>` — wymusza tryb deep.
- `/relai-research on` / `off` — przełącznik modu.
- `/relai-research auto` / `manual` — streszczanie komentarza WebSearch.
- `/relai-research model <id>` — model pomocniczy, domyślnie `claude-haiku-5-5`. Wybór zapisuje się w magazynie modu.
- `/relai-research pane` — stan i przełączniki.
- `/relai-research stats` — stan.

## Kiedy mod jest bierny

- Zgoda: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` pyta raz na projekt. Do czasu odpowiedzi sesja bez człowieka zostaje bierna.
- Bliźniak BenAI: gdy włączony jest `research-router@token-saving-mods`, mod śpi.
- Skaner sekretów: pytanie z sekretem jest wstrzymywane. Wynik narzędzia z sekretem zatrzymuje się przed przekazaniem agentowi.
- Agenci deep nie dostają Read, Bash ani kolejnych Agent.

## Źródła

Quick próbuje kolejno: WebFetch, potem GET przez `curl` (20 s, najwyżej 40 000 znaków, bez śledzenia przekierowań), potem konektor Firecrawl, jeśli jest dostępny. Limit oczekiwania na WebSearch to 90 s; po jego przekroczeniu odpowiedź jest porzucana.

Źródło oznaczone „verified: page read” to strona, którą czytnik faktycznie zwrócił. Źródła deep oznaczone są jako „unverified: cited by an agent, not read by the mod”, bo mod nie widzi wywołań narzędzi swoich agentów. Jeden URL dostaje jeden numer we wszystkich częściach. Część dłuższa niż 250 słów jest odrzucana w całości z komunikatem „Invalid deep part size”. Części deep przydziela router modeli, bo nie podają jawnego modelu.

## Rejestr i pliki

Kopie źródeł i raporty leżą w `~/.claude/relai/oszczednosci/research/`, z datą UTC, sesją i numerem w nazwie. Planowany horyzont przechowywania to 14 dni; mod nie kasuje kopii sam.

Koszt każdego pomocnika, także przy niepoprawnej odpowiedzi, zapisuje się w `~/.claude/relai/oszczednosci/rejestr/<data>-<sesja>.relai-research.jsonl`. Tokeny oszczędzone w trybie auto są szacunkiem. Brak danych o zużyciu oznacza brak deklarowanej oszczędności. Tryb deep nie deklaruje oszczędności tokenów.

Błąd zapisuje się bez treści źródła do `ostatni-blad.txt` w tym samym folderze.

## Znane ograniczenia

- Tryb auto praktycznie się nie włącza na silniku 2.1.325, który sam streszcza WebSearch. W pomiarze trzy wyniki miały 379, 601 i 664 tokeny, czyli poniżej progu 800. Próg pozostaje bez zmian.
- Źródła deep nie są sprawdzane przez mod, a jedynie zgłoszone przez agentów.
- Quick zależy od tego, co uda się pobrać. Jeśli oficjalnej dokumentacji nie ma w wynikach, raport to mówi i nie potwierdza faktu.
