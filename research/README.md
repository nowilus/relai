# RelAI Research — 0.1.0 (niewydany)

Mod Claude Code, early access. Kod sprawdzony w testach silnika 2.1.323; sonda i pomiar
na żywo przeniesione do E10 planu MODY_OSZCZEDZANIA (Aneks C). Zielony test nie dowodzi
przyjęcia wszystkich argumentów w działającej sesji.

## Obsługa

- `/relai-research pane` — stan i przełączniki w jednej kolumnie, także w wąskim panelu.
- `/relai-research <pytanie>` — planer wybiera quick albo deep. Komenda wraca od razu;
  raport pojawia się później jako wiadomość. Nie badaj tego samego równolegle samodzielnie.
- `/relai-research deep <pytanie>` — wymusza deep; 2–4 równoległe zadania general-purpose,
  bez jawnego modelu, z wąskim wyjątkiem w routerze (Aneks D).
- `/relai-research on|off`, `auto|manual`, `model <id>`, `stats` — droga zapasowa ustawień.
  Domyślny pomocnik: `claude-haiku-5-5`; wybrany model zapisuje się w magazynie modu.

Auto obejmuje wyłącznie komentarz głównego WebSearch większy niż 800 tokenów (ceil znaków/4).
Struktura linków zostaje; pełna koperta wyniku trafia na dysk przed pomocą modelu.
Wyłączenie lub zmiana ustawień unieważnia wynik rozpoczętej pracy.

## Źródła i ochrona

Quick czyta do czterech stron równolegle: WebFetch, następnie GET przez `curl` (20 s,
40 000 znaków, bez śledzenia przekierowań), następnie dostępny konektor Firecrawl.
Brak narzędzia lub konektora uruchamia dalsze wyjście awaryjne. WebSearch ma limit oczekiwania
90 s; przekroczenie porzuca odpowiedź, nie deklaruje zatrzymania narzędzia silnika.
Przypisy quick odsyłają tylko do stron rzeczywiście zwróconych przez czytnik.
Deep zachowuje źródła wszystkich poprawnych części; brak dowodu WebFetch oznacza „unverified”.

Zgoda „Mody oszczędzania” raz na projekt z markerem RelAI. Przed zgodą sesja bez człowieka
pozostaje bierna. Aktywny `research-router@token-saving-mods` usypia mod, z jednym komunikatem.
Skaner pracuje przed każdym pomocnikiem; agenci Research dostają wyłącznie publiczne WebSearch
i WebFetch, nie Read, Bash ani kolejne Agent. Wynik narzędzia z sekretem jest zatrzymywany
przed przekazaniem agentowi. Zachowanie tych hooków na żywo nadal wymaga E10.

## Pliki i pomiar

Kopie i raporty: `~/.claude/relai/oszczednosci/research/`, nazwy z datą UTC, sesją i numerem.
Horyzont retencji to 14 dni (SZACUNEK wspólnego rdzenia); datowane kopie są materiałem
do sprzątania przez mechanizm artefaktów, nie obietnicą automatycznego kasowania przez mod.
Błąd zapisuje bez treści źródła do `ostatni-blad.txt`.
Koszt każdego pomocnika, także niepoprawnej odpowiedzi, trafia do osobnego pliku producenta
`rejestr/<data>-<sesja>.relai-research.jsonl`, czytelnego przez obecną zakładkę oszczędności.
Tokeny auto są szacunkiem; brak usage oznacza brak deklarowanej oszczędności.
Deep nie deklaruje oszczędności tokenów (hand-back agenta może trafić do czatu osobno).
