# RelAI Input Router — 0.1.0

Mod Claude Code. Wymaga Claude Code z modami (zmierzono na Claude Code 2.1.325).

## Co robi

Duży odczyt trafia najpierw do modelu pomocniczego (domyślnie `claude-haiku-5-5`), który zwraca notatki z numerami linii. Claude dostaje notatki i ścieżkę do pełnej treści. Dotyczy to plików od 2000 tokenów, PDF-ów dłuższych niż 5 stron, dużego wyjścia poleceń odczytu (`cat`, `head`, `tail`) oraz wyników konektorów MCP od 16 000 znaków. Wynik MCP najpierw traci puste pola i krótkie fragmenty tekstu, a to, co dalej przekracza 8000 znaków, idzie do modelu w częściach.

Zawsze dosłownie, bez modelu pomocniczego: pliki obrazów (png, jpg, jpeg, gif, webp, bmp), pliki procesu RelAI (`docs/`, `PROMPT_ETAP_*`, `STATUS.md`, `PLAN.*`, `.claude/relai/`), pliki instrukcji (`CLAUDE.md`, `SKILL.md`, ustawienia), pliki z sekretami, małe zakresy linii, `grep`, `ls`, `find`, budowanie, testy, `git` i komunikaty o błędach. Konektory sterujące aplikacją, przeglądarką, sesjami, terminalami i modami nie są przekazywane.

## Polecenia

- `/relai-input-router` albo `stats` — stan, liczba przekazań i szacunek tokenów zatrzymanych poza czatem.
- `full` — następny duży odczyt przechodzi w całości, raz.
- `on file` / `off file` — przełącznik odczytów plików.
- `on connector` / `off connector` — przełącznik wyników konektorów MCP.
- `model <id>` — model pomocniczy, np. `model claude-haiku-5-5`.
- `pane` — panel przekazań z kartą na każde przekazanie.

## Kiedy mod jest bierny

- Zgoda: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` pyta raz na projekt. Do czasu odpowiedzi sesja bez człowieka zostaje bierna.
- Bliźniak BenAI: gdy włączony jest `input-router@token-saving-mods`, mod śpi.
- Skaner sekretów: tekst, w którym skaner znajdzie sekret, nie trafia do modelu pomocniczego. Taki odczyt idzie do Claude dosłownie.

## Rejestr oszczędności

Każde przekazanie zapisuje się w `~/.claude/relai/oszczednosci/rejestr/`, razem z kosztem modelu pomocniczego, który odejmuje się od oszczędności.

Notatki i pełne kopie leżą w `~/.claude/relai/oszczednosci/input-router/`. Notatka jest pamiętana według ścieżki, czasu, rozmiaru i prośby. Pełna treść zapisywana jest w podfolderze `pelne/`. Ponowny odczyt tego samego pliku bez zmian nie wywołuje modelu pomocniczego.

## Znane ograniczenia

- Notatki pisze model pomocniczy, a jego liczenia bywają błędne. W pomiarze notatki podały 27 wystąpień przy 30 wierszach tabeli. Do liczb i szczegółów wróć do pełnej kopii.
- PDF z bardzo długimi liniami tekstu jest cięty. Notatki pomijają część linii i oznaczają to jako `[line cut]`.
- Bardzo duży wynik narzędzia może zostać zapisany przez silnik do pliku, zanim hook go zobaczy. W pomiarze był to wynik 62 951 znaków. Mod nie ma wtedy czego skracać.
- Pliki obrazów zawsze idą dosłownie. Zmniejszanie obrazów robi `relai-browser`.
- Krótka odpowiedź człowieka, np. „gotowe”, może zostać w notatkach opisana jako treść prośby.
- Panel `pane` pokazuje ścieżki i identyfikatory. W wąskim oknie bywa nieczytelny.
