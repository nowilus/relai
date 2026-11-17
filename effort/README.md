# RelAI Effort — 0.1.0

Mod Claude Code. Wymaga Claude Code z modami (zmierzono na Claude Code 2.1.325).

## Co robi

Przed turą głównego czatu pomocnik-sędzia proponuje poziom effortu (low, medium albo high). Sędzią jest model poziomu balanced z listy modeli projektu (`.claude/relai/MODELE-claude-code.md`); w pomiarze był to `claude-sonnet-5-5`. W trybie `ask` propozycja pojawia się jako karta i to człowiek decyduje, czy przełączyć. W trybie `auto` mod przełącza sam. Jawny effort etapu RelAI jest chroniony w trybie `auto` i nie zostaje nadpisany.

## Polecenia

- `/relai-effort` albo `stats` — stan i ostatnia propozycja.
- `on` / `off` — przełącznik modu.
- `ask` — karta przed każdą zmianą.
- `auto` — zmiana bez karty, poza etapami z jawnym effortem.
- `pane` — panel z przełącznikami.

## Kiedy mod jest bierny

- Zgoda: wiersz „Mody oszczędzania” w `docs/USTAWIENIA.md` pyta raz na projekt. Do czasu odpowiedzi sesja bez człowieka zostaje bierna.
- Bliźniak BenAI: gdy włączony jest `effort-optimizer@token-saving-mods`, mod śpi.
- Skaner sekretów i zgoda bramkują sędziego. Tekst z sekretem nie trafia do modelu.

## Rejestr oszczędności

Każda propozycja zapisuje rekord w `~/.claude/relai/oszczednosci/rejestr/`: poziom z (`from`), poziom na (`to`), powód sędziego i koszt sędziego. Rekord effortu nie deklaruje oszczędności tokenów. W bilansie odejmuje się tylko koszt sędziego.

## Znane ograniczenia

- Pole `from` to poziom, który mod ostatnio zastosował, a nie poziom bazowy. Po turze z nadpisaniem `from` może więc nie być poziomem bazowym.
- Po nieudanym werdykcie silnik wraca do poziomu bazowego, czyli ustawionego przez `/effort`.
- Werdykt bez powodu albo z za długim powodem zostaje odrzucony. Mod zostawia wtedy poziom bez zmian.
- Propozycja w karcie czeka na decyzję człowieka. Wybór „zostaw” nie zmienia poziomu.
