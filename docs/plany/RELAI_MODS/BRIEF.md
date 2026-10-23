# Brief: relai-mods — kokpit pluginów i hooków

Przygotowane 2026-10-23 w sesji na pulpicie. Ten plik jest wejściem dla sesji w projekcie RelAI.
Zadanie tej sesji: **przygotować plan RelAI** (`docs/plany/RELAI_MODS/`, zgodnie z relai-planning).
Implementacja dopiero po akceptacji planu przez Łukasza.

## Cel

Nowy mod `relai-mods` w marketplace RelAI (folder obok `panel/`, `progress/`, `cache-keeper/`).
Komenda otwiera panel „kokpit”: lista wszystkiego, co jest zainstalowane i co się odpala,
z przełącznikami włącz/wyłącz i szczegółami wybranej pozycji.

Makieta (wariant C wybrany przez Łukasza, zakładka „C · Kokpit ze szczegółami”, przycisk motywu w rogu):
`C:\Users\Lukasz\Desktop\mods-panel\makiety.html`

## Decyzje podjęte (nie pytać ponownie)

| Temat | Decyzja |
| --- | --- |
| Wariant UI | C · Kokpit: wyszukiwarka, filtry (Wszystko / Mody / Pluginy / Hooki / Wyłączone), lista po lewej, szczegóły po prawej |
| Zakres listy | Wszystkie pluginy (mody oznaczone osobno) + klasyczne hooki z `settings.json` |
| Mechanizm wyłączania pluginu | `claude plugin disable/enable <id>` przez `$.process.run`. Prawdziwe wyłączenie, działa dla każdego pluginu |
| Hooki z `settings.json` | Tylko podgląd (kłódka). Panel nigdy nie pisze do `settings.json` |
| Po przełączeniu | Pasek „N zmian czeka na przeładowanie” + przycisk Przeładuj (zbiorczo, nie po każdym kliknięciu) |
| Ochrona | Panel nie ma przełącznika dla samego siebie. Reszta bez potwierdzeń |
| Scope | Pluginy projektowe (`project`/`local`) widoczne z etykietą „projekt”, przełączane w swoim scope (`--scope`) |
| Motywy | **Musi działać w dark i light mode** (wymóg Łukasza). Desktop i terminal |
| Dystrybucja | Kolejny plugin w marketplace RelAI: `relai-mods` |

## Ustalenia techniczne (API modów, Claude Code 2.1.308)

- **Brak elementu Switch/Toggle.** Przełącznik trzeba zbudować: `Button` z `Svg` (desktop) albo glif `●━━` / `━━○` (terminal). Na wzór tego, jak `panel/` rysuje paski.
- **Kolory tylko z kluczy motywu.** W repo jest `core/theme.mjs` (`THEME`, `BAR_LOOK`). `bar-card.tsx` pisze: „every color is a theme key, so the desktop…” — tak samo tutaj. Żadnych kolorów hex w drzewie. Dla `Svg` przełącznika: sprawdzić, jak `RULE` w `core/panel/theme.mjs` rozwiązuje kolory w obu motywach.
- **`$.settings.read` jest tylko do odczytu.** Zapis ustawień przez mod jest niemożliwy, stąd CLI.
- **`$.process.run(argv)`**: bez powłoki, timeout 30 s domyślnie. Wywołanie `['claude','plugin','disable', id, '--scope', scope]`. Na Windows sprawdzić, czy `claude` rozwiązuje się bez `.cmd`/pełnej ścieżki.
- **`$.command.run({ command: 'reload-plugins' })`** prawdopodobnie odpali przeładowanie z przycisku. **Niezweryfikowane**: pierwszy etap planu powinien to sprawdzić (spike). Plan B: pasek z tekstem „wpisz /reload-plugins”.
- **Źródła danych** (tylko odczyt):
  - `~/.claude/plugins/installed_plugins.json`: id, scope, projectPath, installPath, version
  - `enabledPlugins` z `$.settings.read()` (scaloną i per source): stan on/off
  - `<installPath>/.claude-plugin/plugin.json`: opis
  - `<installPath>/hooks/hooks.json`: `"modules"` → mod; `"hooks"` → zdarzenia klasycznych hooków pluginu
  - liczby: `skills/`, `agents/`, `commands/`, `.mcp.json`
  - `hooks` z `$.settings.read()`: klasyczne hooki użytkownika (zdarzenie, matcher, komenda)
- **Lekcja z modu Benaia** (`benai-mods/plugins/mods`, odinstalowany): wyliczał katalog domowy z `$.plugin.root.split('/.claude/')`. Na Windows przy marketplace lokalnym ścieżka nie zawiera `.claude` i skan nic nie znajdował. Nie powtarzać: katalog domowy z `$.env.get('USERPROFILE')`/`HOME`. Miał też 7 modów wpisanych na sztywno — tutaj lista wyłącznie z dysku.

## Stan dzisiaj (do testów)

14 pluginów, wszystkie scope `user`: 12 włączonych, 2 wyłączone (`filetree`, `security-guidance`).
Mody (hooks.json z `modules`): `relai-panel`, `relai-progress`, `relai-cache-keeper`, `filetree`.
Hooki w `settings.json`: SessionStart (caveman-activate.js), UserPromptSubmit (caveman-mode-tracker.js),
Stop + SessionEnd (sync-claude-sessions.ps1), PostToolUse `Edit|Write|MultiEdit|Bash` (trivy lockfile-hook.mjs).

## Przypadki brzegowe do rozstrzygnięcia w planie

- `claude plugin disable` zwraca błąd albo przekracza czas → przełącznik wraca, komunikat w panelu.
- Plugin wyłączony, a jego wiersz w `installed_plugins.json` wskazuje nieistniejący `installPath`.
- Kilka wersji w cache (np. 12 wersji `relai-panel`) → brać tę z `installed_plugins.json`, nie najnowszy folder.
- Dwa czaty otwarte: zmiana w jednym → drugi odświeża stan (odczyt co kilka sekund lub po focusie panelu).
- Plugin z `managed`/policy settings → nie da się wyłączyć: kłódka z powodem.
- Panel wąski (terminal 80 kolumn) → szczegóły pod listą zamiast obok.

## Czego nie robić

- Nie pisać do `settings.json` ani `installed_plugins.json` bezpośrednio.
- Nie dodawać zależności sieciowych.
- Nie zaczynać kodu przed akceptacją planu.
