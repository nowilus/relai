# Aneks A — wykrywanie bliźniaka BenAI (plan MODY_OSZCZEDZANIA)

Data: 2026-11-11 · Etap: E1 · Status: **ZAAKCEPTOWANY 2026-11-11** (Łukasz, pytanie w sesji E1:
„Aneks: settings.json”) · Zmienia: specyfikację funkcji, sekcja 7, punkt „Bliźniak BenAI”.

## Brzmienie przed aneksem

> Mod RelAI wykrywa aktywny odpowiednik BenAI (`installed_plugins.json`,
> `~/.claude/mods/switches.json`) i przechodzi w stan uśpienia z jednorazowym komunikatem.

## Co pokazała sonda E1 ([SONDY.md](SONDY.md), punkt 6)

- `~/.claude/mods/switches.json` na maszynie z zainstalowaną i aktywną paczką BenAI **nie istnieje**
  (`$.fs.read` → `ENOENT`, dwa przebiegi).
- `installed_plugins.json` wymienia paczkę `token-saving-mods`, ale nie niesie stanu włączenia.
- Stan włączenia stoi w `~/.claude/settings.json`, klucz `enabledPlugins`, wpisy
  `<mod>@token-saving-mods: true|false`; `claude plugin disable` przestawia go na `false`.

## Brzmienie po aneksie

Mod RelAI uznaje bliźniaka BenAI za aktywny, gdy w `enabledPlugins` **ostatniego** z plików
`~/.claude/settings.json` → `<projekt>/.claude/settings.json` → `<projekt>/.claude/settings.local.json`,
który ten wpis zawiera, stoi `"<bliźniak>@token-saving-mods": true`. `~/.claude/mods/switches.json`
czytany tylko wtedy, gdy istnieje, i tylko jako wyłącznik (`false` → bliźniak śpi). Plik
nieczytelny albo bez wpisu → bliźniak nieaktywny. Pozostała treść punktu bez zmian.

## Czego aneks nie zmienia

Mapowania mod RelAI → mod BenAI, jednorazowego komunikatu, zakresu etapów ani wydania (E10).
