# RelAI Browser — 0.1.0

Mod Claude Code. Wymaga Claude Code z modami (zmierzono na Claude Code 2.1.325).

## Co robi

Zmniejsza obrazy, które narzędzia przekazują Claude: zrzuty przeglądarki, odczyt obrazu przez `Read` i obrazy z konektorów MCP. Domyślnie dłuższy bok obrazu jest zmniejszany o połowę, nie poniżej 512 px. JPEG zostaje JPEG (jakość 85), inne formaty zapisywane są jako PNG. Współrzędne kliknięć na zmniejszonym zrzucie są przeliczane, więc kliknięcie trafia w ten sam element. W trybie `describe` Claude dostaje zamiast obrazu opis słowny przygotowany przez model pomocniczy.

## Polecenia

- `/relai-browser` — stan: tryb, skala, minimum i model opisu.
- `/relai-browser shrink` — tryb zmniejszania (domyślny).
- `/relai-browser describe [id-modelu]` — tryb opisu; domyślny model `claude-haiku-5-5`.
- `/relai-browser full` — następny obraz przechodzi w pełnym rozmiarze, raz.
- `/relai-browser scale <liczba>` — skala dłuższego boku, np. `scale 0.5`.
- `/relai-browser min <liczba>` — najmniejszy dłuższy bok w pikselach, domyślnie 512.
- `/relai-browser pane` — lista ustawień w panelu.

## Kiedy mod jest bierny

- Zgoda: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` pyta raz na projekt. Do czasu odpowiedzi sesja bez człowieka zostaje bierna.
- Bliźniak BenAI: gdy włączony jest `efficient-browser-use@token-saving-mods`, mod śpi.
- Skaner sekretów działa przed modelem pomocniczym w trybie `describe`.
- Platforma: zmniejszanie działa na Windows (PowerShell i System.Drawing) oraz na macOS (sips). Na innych systemach obrazy przechodzą bez zmian.

## Rejestr oszczędności

Każde zmniejszenie i każdy opis zapisują się w `~/.claude/relai/oszczednosci/rejestr/`, w pliku `<data>-<sesja>.jsonl`. Rekord zawiera rozmiar obrazu przed i po w tokenach. W trybie `describe` rekord zawiera też zużycie modelu pomocniczego. Przykład z pomiaru: zrzut strony example.com zmniejszony z 640 do 263 tokenów.

Mod nie wykonuje żadnych wywołań modelu w trybie `shrink` i nie korzysta z sieci.

## Znane ograniczenia

- Zmniejszenie zmniejsza też szczegóły. Drobny tekst może być nieczytelny; wtedy `/relai-browser full` przepuszcza następny obraz w całości.
- Tryb `describe` bywa droższy niż obraz. W pomiarze zrzut ważący 649 tokenów dał opis ważący 806 tokenów. Rekord zapisuje wtedy ujemny zysk.
- Opis ma limit 10 s na hook `tool.call`. Gdy model opisu nie zdąży, obraz przechodzi bez zmian. Rekord nadal mówi `describe`, z ujemnym zyskiem.
- Tryb `describe` wymaga modelu, który czyta obraz. Błąd modelu zmniejsza obraz zamiast opisu.
