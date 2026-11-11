# SONDY — E1 planu MODY_OSZCZEDZANIA

Sonda `relai-sonda-e1` w `~/.claude/dev-mods/c9ce8d24-…/relai-sonda-e1/`, Claude Code 2.1.321,
desktop, tryb uprawnień auto. Paczka BenAI: `efficient-browser-use` wyłączony (`plugin disable`,
2026-11-11), `input-router` BenAI **nadal aktywny** (przechwytuje duże odczyty — patrz uwagi).

## Fakty silnika poznane przy pisaniu sondy

- Hook `turn.step` musi być generatorem (`async function*` + `yield* next(e)`); zwykła funkcja
  async → `plugin validate` „No digest … the hook on "turn.step"”. Dotyczy też `process.spawn`.
- `$.fs.read` + `$.fs.write` jako dopisywanie do jednego pliku **ściga się** przy równoległych
  zdarzeniach (dwa `agent.spawn` naraz): plik dostał 36 bajtów NUL, jedna linia stracona.
  Rejestr `savings-ledger` nie może dopisywać przez read+write całego pliku — potrzebny zapis
  rekordu do osobnego pliku albo kolejka w module (wniosek dla Zakresu pkt 3).

## 1. `tool.call` z obrazem

| Przebieg | Narzędzie | Kształt wyniku `next(e)` | Rozmiar |
|---|---|---|---|
| 1 | `mcp__Claude_Browser__computer` screenshot | `{ref, result:[{type:'image', source:{type:'base64', media_type:'image/jpeg', data}}, {type:'text', text:'[Image: source: <ścieżka .jpg>]'}, {type:'text', text:'Screenshot size: 799x609'}, {type:'text', text:'…Tab Context…'}], text}` | data 48 224 zn., wynik 49 086 zn. |
| 2 | to samo, `scale: 0.5` | jak wyżej; linia `Screenshot size: 400x300 0.5-scale view; coordinate frame: 800x600.` | data 13 464 zn. |
| 1 | `Read` PNG 1920×1080 (1 995 153 B) | `{ref, result:{type:'image', file:{base64, type:'image/jpeg', originalSize, dimensions:{originalWidth, originalHeight, displayWidth, displayHeight}}}, text:'', isReadOnly:true}` | base64 197 400 zn. |

**Rozjazdy ze specyfikacją (sekcja 3):**

- Zrzut Claude_Browser ma kształt API `{source:{data}}`, nie MCP `{type:'image', data}` —
  specyfikacja wymienia oba, mod obsłuży oba; kształt MCP do potwierdzenia innym konektorem.
- Read PNG: silnik **sam** przekodował PNG 1,99 MB na JPEG (`type:'image/jpeg'`) przed hookiem;
  wymiary 1920×1080 bez zmian. Zasada „JPEG zostaje JPEG q85, reszta PNG” dostaje na wejściu JPEG.
- Plik zrzutu zapisany przez konektor na dysku (`tool-results/*.jpg`) — podmiana `data` nie
  zmienia pliku; ścieżka w tekście wskazuje oryginał.

**Podmiana (`swap`) — DZIAŁA, dwa przebiegi:** `data` zamienione na PNG 1×1 → wynik zrzutu 49 086 →
957 znaków (przebieg 1, 15:05:38); przebieg 2 (scale 0.5, 15:05:5x) — model dostał same linie
tekstu, bez obrazu. Dowód efektem: w transkrypcie modelu obraz nie dotarł (tylko `[Image: source…]`,
`Screenshot size`). Mniejszy obraz z `next()` dociera do modelu.

## 2. `$.model.complete` z `claude-haiku-5-5`

Dwa przebiegi (komenda człowieka): `{isAnswered:true, text:'pong', usage:{input_tokens:18,
output_tokens:4, cache_read_input_tokens:0, cache_creation_input_tokens:0}}`, czas 2114 ms i 569 ms.
Tryb auto: **brak odmowy** (wywołanie z `command.run`; P-057 dotyczył `$.mcp.call` z kliknięcia).
`usage` nie ma kosztu USD — wycena z `core/panel/pricing.mjs`.

## 3. `agent.spawn`

Pola wejścia (przebieg z `model: haiku`): `tool_use_id, prompt, description, subagentType,
provider{plugin:'engine', tier:'core'}, model:'haiku', parentModel:'claude-opus-5-5',
permissionMode:'auto', background:true, fork, name, cwd`. Wynik `next(e)`: `{model:'claude-haiku-5-5', agentId}`.
Przebieg bez `model`: wynik też `model:'claude-haiku-5-5'` (wejście utracone przez wyścig zapisu —
do powtórzenia). Nadpisanie `next({...e, model:'sonnet'})`: przebieg 1 (wejście `haiku`) → wynik
`claude-haiku-5-5`; przebieg 2 (wejście bez `model`) → wynik `claude-haiku-5-5`.
**ZAKŁÓCONE:** subagent `general-purpose` bez modelu też ruszył na Haiku — na maszynie działa
`model-router@token-saving-mods` (BenAI, `true` w `settings.json`), który przepisuje model. Wynik
nie rozstrzyga, czy silnik przyjmuje nadpisanie `model`. Do powtórzenia przy wyłączonym routerze BenAI.

**Powtórka przy wyłączonych `model-router` i `effort-optimizer` BenAI (decyzja Łukasza 2026-11-11):**
baza bez nadpisania — `general-purpose` bez `model` → `claude-sonnet-5-5` (czyli wcześniej Haiku
wymuszał router BenAI). Nadpisanie `next({...e, model:'haiku'})` — **DZIAŁA**, dwa przebiegi:
A (wejście bez `model`) → `claude-haiku-5-5`; B (wejście `model:'sonnet'`) → `claude-haiku-5-5`.
Wynik `next()` zwraca model, na którym subagent ruszył — router E5 ma z czego zapisać `answered_by`.

## 4. `turn.step`

Pola: `turnId, index, model, effort, messageCount` (+ `agentId` w subagencie). Główny czat:
`model:'claude-opus-5-5'`, `effort:'low'` (przy turze z powiadomienia systemowego);
subagent Haiku: `effort:'medium'`. Nadpisanie `effort:'low'` w `next()`: kolejne kroki subagenta
nadal zgłaszają `medium` na wejściu — wejście `turn.step` pokazuje stan sprzed hooka, więc efektu nie
da się odczytać z samego logu sondy. **ZAKŁÓCONE** także przez `effort-optimizer@token-saving-mods`
(BenAI, aktywny). `$.config.list()`: wiersze `autoCompact, idleCompaction, switchModelsOnFlag, tips,
reduceMotion, thinking, …` — lista obcięta przez sondę do 6 (błąd sondy); obecność wiersza `effort`
do sprawdzenia. `$.config.set`: OCZEKUJE.

Powtórka bez `effort-optimizer` BenAI, dwa subagenty z `effort:'low'` w `next()`: każdy kolejny krok
nadal zgłasza `effort:'medium'` na wejściu (główny czat: `low`). **Wniosek:** efektu nadpisania
`effort` nie da się zaobserwować z modu — wejście hooka jest sprzed nadpisania, a silnik nie
zwraca użytego poziomu. Rozstrzyga dopiero `$.config.set` (wiersz effort) albo pomiar kosztu
w E7; E7 zaczyna od tej sondy (bez kodu w E1, zgodnie z Zakresem).

`$.config.list()` pełna (poprawiona sonda, trzy odczyty z komendy człowieka): **43 wiersze, brak
wiersza `effort`**; są `model` (choice: default, sonnet, opus, haiku, fable, best, …[1m], opusplan)
i `switchModelsOnFlag`. Wniosek pod E7: droga „`$.config.set` wiersza effort” na tym buildzie nie
istnieje — zostaje nadpisanie `effort` w `turn.step`, którego efekt mierzy się kosztem (rozjazd ze
specyfikacją, sekcja 2 „sonda w E1, który sposób działa” — rozstrzygnięte: tylko `turn.step`).

## 5. `prompt.submit`

Pola: `text, wait, origin, isMeta`. Powiadomienie systemowe: `origin:{kind:'task-notification'}`,
`isMeta:true`. `session.start`: `{cwd, surface:null, isInteractive:false}` — **desktop zgłasza
`isInteractive:false`**, więc to pole nie odróżni sesji z człowiekiem od `claude -p`.
Prompt człowieka z pola wpisywania: `origin:{kind:'composer'}`. Komenda `/…` wpisana przez
człowieka **nie** wywołuje `prompt.submit` (sześć komend, zero rekordów) — idzie tylko przez
`command.run` (`origin` w jego wejściu). `claude -p "…" --plugin-dir <sonda>`, dwa przebiegi:
`prompt.submit.origin = {kind:'sdk'}`, `session.start = {surface:null, isInteractive:false}`.
**Warunek milczenia (zasada 13):** sesja bez człowieka = `origin.kind === 'sdk'` przy pierwszym
prompcie; `isInteractive` nie odróżnia (desktop z człowiekiem też `false`). Zakazane brzmienia do
listy zamkniętej: `composer` (człowiek), `sdk` (`claude -p`), `task-notification` (zdarzenie tła,
`isMeta:true`) — inne wartości traktowane jak „brak człowieka”, mod bierny.

## 6. Odczyt `installed_plugins.json` i `switches.json`

Dwa przebiegi `$.fs.read` z modu: `installed_plugins.json` czytelny (25 904 zn., wspomina
`token-saving-mods`, ale bez flag włączenia); `switches.json` → `ENOENT`; `settings.json` czytelny,
`enabledPlugins` ma siedem wpisów `…@token-saving-mods` z `true/false`. **Rozjazd ze specyfikacją
(sekcja 7):** stan bliźniaka czyta się z `settings.json` (`enabledPlugins`), nie z `switches.json`.
Fakt z powłoki: `~/.claude/mods/switches.json` **nie istnieje**
na tej maszynie; stan włączenia BenAI stoi w `~/.claude/settings.json` (`enabledPlugins`,
`"efficient-browser-use@token-saving-mods": false`).
