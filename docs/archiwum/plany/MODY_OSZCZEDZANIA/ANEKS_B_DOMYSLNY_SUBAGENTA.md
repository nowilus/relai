# Aneks B — domyślny model subagenta z ustawień (plan MODY_OSZCZEDZANIA)

Data: 2026-11-12 · Etap: E5 · Status: **ZAAKCEPTOWANY 2026-11-12** (Łukasz, sesja E5: „Tylko gdy
sugestia ≠ domyślny”, „Sugestia / Domyślny / Sesji / Zawsze…”, „Aneks B, w E5”) · Zmienia:
specyfikację funkcji, sekcja 5, wiersz „Model jawny”.

## Brzmienie przed aneksem

> **model jawny chroniony:** sędzia ocenia; zgodny → cicho; różny → karta „twój wybór / sugestia /
> powód”, decyzja człowieka; przyciski „sugestia”, „mój”, „zawsze sugestia w tej sesji”, „zawsze
> mój w tej sesji”; sesja bez człowieka → sugestia stosowana

## Co pokazał pomiar na żywo E5 ([POMIAR_E5.md](POMIAR_E5.md), punkt 2)

- `~/.claude/settings.json` Łukasza niesie `env.CLAUDE_CODE_SUBAGENT_MODEL = claude-sonnet-5-5`.
  Subagent bez parametru `model` wystartował na Sonnecie, nie na modelu rozmowy głównej (Opus).
- Mod przyjmował za bazę model rodzica i przy zadaniu ryzykownym (`risky` 0,85) uznał „deep =
  bez zmian” — zadanie ryzykowne poszło na Sonnet. Poprawka w E5: baza = domyślny z ustawień,
  poziom przypinany jawnie (przebieg B2: Sonnet → Opus).
- Domyślny model subagenta w ustawieniach to wybór człowieka tak samo świadomy jak model podany
  w wywołaniu — Łukasz w sesji E5: powinien trafić na kartę.

## Brzmienie po aneksie

Model jawny — parametr `model` wywołania **albo** domyślny model subagenta z ustawień
(`env.CLAUDE_CODE_SUBAGENT_MODEL`, ostatni z plików user → projekt → local) — jest chroniony:

- sędzia ocenia; zgodny → cicho (subagent na modelu jawnym);
- **model z wywołania** różny od sugestii → karta jak dotąd: „sugestia”, „mój”, „zawsze sugestia
  w tej sesji”, „zawsze mój w tej sesji”;
- **domyślny z ustawień** różny od sugestii → karta z przyciskami „Sugestia (<alias>)”, „Domyślny
  subagenta (<alias>)”, „Model sesji (<alias>)”, „Zawsze sugestia w tej sesji”; „zawsze domyślny”
  i „zawsze model sesji” — przyciskami w panelu modu; opcja, której alias powtarza inną, odpada;
- wybór „zawsze …” obowiązuje do końca sesji dla obu rodzajów modelu jawnego; „zawsze model
  sesji” uruchamia subagenta na modelu rozmowy głównej;
- sesja bez człowieka → sugestia stosowana;
- subagent bez modelu jawnego i bez domyślnego w ustawieniach → baza = model rodzica, poziom
  wybrany przez sędziego przypinany jawnie.

## Czego aneks nie zmienia

Reguł pewności i ryzyka, sędziego, pomijania forka, wznowienia i spawnów modów, skanera sekretów,
zachowania przy awarii, karty dla `/relai-crew` (E6) ani wydania (E10).
