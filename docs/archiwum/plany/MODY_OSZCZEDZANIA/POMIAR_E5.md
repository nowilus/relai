# POMIAR NA ŻYWO — E5 planu MODY_OSZCZEDZANIA (2026-11-12)

Sesja fe85abbe, Claude Code 2.1.321, desktop, Windows, tryb auto, model główny Opus 5.5.

## 1. Sonda `agent.spawn` i sędziego (przed kodem, zasada 13, L-0321)

Mod-sonda `relai-e5-sonda` w `~/.claude/dev-mods/fe85abbe…/` (skill `plugin-authoring` przed
zapisem, L-0322; tryb auto włączył przeładowanie bez pytania): hook `agent.spawn` zapisuje wejście
(klucze, `model`, `fork`, `resume`, `parentAgentId`, `workflow`, `subagentType`, `provider`,
`next.origin`, długość i początek promptu) przed `next` i wynik po nim; przy znaczniku w zadaniu
przepisuje `model` na `haiku` albo woła sędziego; hook `turn.step` (generator, P-063) zapisuje
`model` każdego kroku uruchomionego subagenta. Plik na zdarzenie w scratchpadzie sesji.

| Przebieg | Wywołanie | `e.model` | `fork` / `resume` | `next(e).model` | `turn.step.model` |
|---|---|---|---|---|---|
| 1 | Agent bez modelu, znacznik sędziego | `undefined` | `false` / brak | `claude-haiku-5-5` | Haiku (2 kroki) |
| 2 | Agent z `model: sonnet`, sonda przepisuje na `haiku` | `sonnet` | `false` / brak | `claude-haiku-5-5` | Haiku (2 kroki) |
| 3 | Agent z `model: sonnet`, sonda nic nie zmienia | `sonnet` | `false` / brak | `claude-haiku-5-5` | Haiku (2 kroki) |
| 4 | Agent `subagent_type: fork` | `undefined` | `true` / brak | `claude-opus-5-5` | Opus (1 krok) |
| 5 | `SendMessage` do agenta z przebiegu 3 (wznowienie) | `claude-haiku-5-5` | `false` / `{ agentId }` | `claude-haiku-5-5` | Haiku (3 kroki) |

Sędzia (przebieg 1): `$.model.complete({ model: 'haiku', maxTokens: 200, effort: 'low',
timeoutMs: 8000 })` → `isAnswered: true`, 721 ms, tekst = sam JSON
`{"tier":"fast","confidence":0.9,"effort":1,"effort_confidence":0.8,"risky":0.1}`, usage
in 64 / out 45 (cache 0).

**FAKTY:**

- Klucze wejścia nowego subagenta: `tool_use_id`, `prompt`, `description`, `subagentType`,
  `provider`, `model`, `parentModel`, `permissionMode`, `background`, `fork`, `name`, `cwd`;
  wznowienie dokłada `resume: { agentId }`. `parentAgentId`, `workflow`, `isTeammate` — brak
  w spawnie z głównego czatu (zgodnie z typami: „absent from main”).
- **Model jawny** to `e.model` (parametr `model` narzędzia Agent, alias jak podany); bez niego
  `undefined`. `provider` i `next.origin` dla narzędzia Agent: `{ plugin: 'engine', tier: 'core' }`.
- **Fork:** `fork: true`, `model` `undefined`, działa na modelu rodzica (typy: „model is ignored”).
- **Resume:** `resume.agentId`; `e.model` niesie już **rozwiązany pełny identyfikator** poprzedniego
  przebiegu — gdyby mod go nie pominął, wziąłby go za model jawny.
- **Przepisany model przechodzi na żywo:** w przebiegu 3 model jawny `sonnet` skończył na Haiku
  (`turn.step.model`), choć sonda nic nie zmieniła — przepisał go hook niżej w łańcuchu: BenAI
  `model-router@token-saving-mods` jest włączony (`~/.claude/settings.json`), a u BenAI model jawny
  „nadpisywany jak każdy” (specyfikacja, sekcja 5). To ten sam mechanizm (`next({ ...e, model })`),
  którego użyje mod RelAI; `next(e).model` i `turn.step.model` mówią o faktycznym modelu.
- **Zastrzeżenie (instrument, zasada 5):** przebieg 2 nie odróżnia przepisania sondy od BenAI —
  oba dały Haiku. Czysty dowód „mod RelAI przepisał” należy do pomiaru na żywo (punkt 2) przy
  wyłączonym BenAI `model-router` (bramka manualna).
- Kroki subagenta niosą `turn.step.usage` (in/out), więc koszt subagenta da się liczyć jak
  w `relai-browser` (P-063); rekord modu liczy koszt **sędziego**, nie subagenta.
- Spawn modu (`$.agent.spawn` z innego pluginu, np. opis w `relai-browser`) ma w `next.origin`
  nazwę tego pluginu (typy) — mod RelAI go pomija: model wybrał tam kod, nie człowiek ani Claude
  (nie mierzone na żywo w tej sondzie).

## 2. Pomiar na żywo kodu E5 (z człowiekiem przy komputerze)

Bramka: BenAI `model-router@token-saving-mods` wyłączony za zgodą Łukasza (`claude plugin disable`,
user), Łukasz zrobił `/reload-plugins` (P-065); kopia `model-router/` jako `relai-model-router`
w `~/.claude/dev-mods/fe85abbe…/` (bez testów), przeładowywana na końcu tury. Sonda `relai-e5-sonda`
nadal zapisywała `turn.step.model`. Po pomiarze BenAI włączony z powrotem.

| Przebieg | Zadanie | Decyzja modu (rekord) | Subagent działał na (`turn.step`) | Sędzia in / out, czas |
|---|---|---|---|---|
| A | proste (liczba plików), model nie podany | `route-changed` Opus → haiku, „lower: fast, confidence 0.97” | Haiku | 400 / 45, 1 893 ms |
| B | ryzykowne (DROP kolumny w produkcyjnej tabeli płatności), model nie podany | `route-kept` Opus, „risky 0.85 > 0.7 → deep” | **Sonnet** ✗ | 420 / 45, 1 767 ms |
| C | proste, `model: sonnet` | karta → Łukasz „Mine” → `route-kept` sonnet | Sonnet | 367 / 45, 1 458 ms |
| B2 | jak B, po poprawce | `route-changed` claude-sonnet-5-5 → opus, „risky 0.80 > 0.7 → deep” | Opus | 423 / 45, 1 720 ms |
| D | proste, model nie podany, po Aneksie B | karta domyślnego → Łukasz „Subagent default (sonnet)” → `route-kept` | Sonnet | 364 / 45, 1 264 ms |

**FAKTY:**

- **Przebieg B ujawnił błąd modelu problemu:** `~/.claude/settings.json` niesie
  `env.CLAUDE_CODE_SUBAGENT_MODEL = claude-sonnet-5-5` — subagent bez `model` startuje na nim, nie
  na modelu rodzica. Mod brał za bazę rodzica (Opus = deep) i nie przypiął modelu; zadanie
  ryzykowne poszło na Sonnet. Poprawka: baza = domyślny z ustawień (ostatni z plików user →
  projekt → local), a bez modelu niczyjego wyboru poziom przypinany zawsze (B2: Opus). Hook
  zmienia domyślny z ustawień (A: Haiku) — `env` nie wymusza modelu jak „model forced on every
  subagent” z typów.
- **Aneks B** (decyzja Łukasza w trakcie pomiaru): domyślny z ustawień to wybór człowieka —
  chroniony kartą z opcjami sugestia / domyślny / model sesji / zawsze sugestia (D).
- Karta modelu jawnego (C) i karta domyślnego (D) kliknięte przez człowieka; odpowiedź zapisana
  w `detail` rekordu; pliku błędu brak.
- **Rejestr vs zakładka:** skrypt `suma.mjs` (katalog roboczy E5) — ostatnie linie rejestru tej
  sesji (`tool_use_id`, później wygrywa) vs `savingsView` (filtr „ten czat”) **zgodne co do
  tokena**: 5 rekordów, sędzia in 1 974 / out 225, $0,00031 (cennik projektu), `saved` 0 (router
  nie oszczędza kontekstu; wycena różnicy modeli odłożona do E10 decyzją Łukasza).
- Rekord dostaje zużycie subagenta po `turn.complete` (A: Haiku 142 980 / 557; B2: Opus 66 669 /
  224) — dane dla wyceny w E10.
- Czas sędziego na żywo 1,3–1,9 s (BenAI w specyfikacji: 1,2–1,3 s); limit 8000 ms nie padł.
- **Przeładowanie kopii zeruje `hasHuman`** (zmienna modułu): bez wiadomości człowieka po
  przeładowaniu mod uznaje sesję za bezludną i stosuje sugestię bez karty — przed D Łukasz napisał
  „jestem”. Na zwykłej sesji nie występuje (moduł ładuje się raz), ale zostaje do przeglądu w E10.
