# RelAI Model Router — 0.1.0

Mod Claude Code. Wymaga Claude Code z modami (zmierzono na Claude Code 2.1.325).

## Co robi

Przed startem subagenta pomocnik-sędzia (haiku, do 200 tokenów, najwyżej 8 s) czyta zadanie i wskazuje najtańszy poziom, który je dobrze wykona: fast, balanced albo deep. Poziomy są mapowane na listę modeli projektu RelAI (domyślnie haiku, sonnet, opus). Obniżenie poziomu wymaga pewności 0,6 lub więcej, podwyższenie 0,3. Zadanie, które może zmienić produkcję, przesunąć pieniądze lub usunąć dane, zawsze idzie na poziom deep. Model głównego czatu nie jest zmieniany.

Model podany jawnie w wywołaniu jest chroniony. Inna propozycja pyta człowieka kartą. Gdy w sesji nie ma człowieka, propozycja stosuje się od razu.

## Polecenia

- `/relai-model-router` albo `stats` — tryb, poziomy, domyślny model subagenta, liczba zmian i koszt sędziego.
- `on` / `off` — przełącznik modu.
- `mine` — zawsze model podany przez wywołującego.
- `suggestion` — zawsze propozycja sędziego.
- `session` — zawsze model sesji.
- `ask` — pytaj przy każdej karcie.
- `pane` — panel z wyborem i uzasadnieniem każdej decyzji.
- `/relai-crew` — przed startem załogi jedna karta. Sędzia ocenia każde zadanie, a tabela w panelu „RelAI crew models” pozwala wybrać model w każdym wierszu. Członek załogi z decyzją na karcie działa bez drugiej karty.

## Kiedy mod jest bierny

- Zgoda: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` pyta raz na projekt. Do czasu odpowiedzi sesja bez człowieka zostaje bierna.
- Bliźniak BenAI: gdy włączony jest `model-router@token-saving-mods`, mod śpi i nie wywołuje sędziego.
- Skaner sekretów: zadanie z sekretem nie trafia do sędziego.
- Mod nie zmienia modelu w forkach, we wznowionych agentach ani w subagentach uruchamianych przez inne mody. Wyjątek: części `/relai-research deep` bez jawnego modelu — te sędzia ocenia.

## Rejestr oszczędności

Koszt sędziego zapisuje się w `~/.claude/relai/oszczednosci/rejestr/` i odejmuje od oszczędności. Zmiana modelu zapisuje usage subagenta osobno: tokeny wejścia, odczyt cache (`cacheRead`) i zapis cache (`cacheWrite`). Panel wycenia je stawkami cache z cennika projektu. Rekordy zapisane przed tą zmianą nie mają podziału cache i pokazywane są bez ceny.

Błąd lub przekroczenie czasu sędziego zostawia model bez zmian. Powód zapisuje się w `~/.claude/relai/oszczednosci/model-router/ostatni-blad.txt`.

## Znane ograniczenia

- Jedna karta naraz. Subagent uruchomiony, gdy karta jest otwarta, zachowuje wybrany model od razu, z komunikatem „another card is open”, i nie czeka.
- Tańszy model popełnia błędy, których mod nie sprawdza. W pomiarze subagenci liczący linie pliku pomylili się zarówno na haiku, jak i na modelu domyślnym.
- Sędzia ma limit 8 s. Po jego przekroczeniu model zostaje bez zmian.
- Wycena różnicy modeli opiera się na usage subagenta i cenniku. Rekordy bez podziału cache nie mają ceny i nie są liczone jako oszczędność.
