# POMIAR NA ŻYWO — E2 planu MODY_OSZCZEDZANIA (2026-11-11)

Sesja e1e867ea, Claude Code 2.1.321, desktop, Windows, tryb auto. Kopie z repo w
`~/.claude/dev-mods/e1e867ea…/`: `relai-panel-e2` (przemianowana kopia `panel/`, L-0289) i
`relai-browser`. Wyłączone na czas pomiaru: `relai-panel@relai` (user + local),
`efficient-browser-use@token-saving-mods` (user).

## Zakładka „Oszczędności” — suma = rejestr

| Filtr | Zakładka | Skrypt `suma-rejestru.js` (odcięcie 16:17:03) |
|---|---|---|
| Ten czat (przed odczytami PNG) | 0 rekordów, 0 tokenów | 0 / 0 |
| Dziś | 7 rekordów, 5 303 tokeny, ~$0.02 | 7 / 5 303 (×4/10⁶ = $0,0212) |

- Zgodność co do tokena. Zakładka czyta rejestr raz na turę (klucz `sesja|epoka`, jak „Koszty”):
  rekord dopisany w tej samej turze widać od następnej — stąd odcięcie w skrypcie.
- Filtr zmienia liczby (czat 0 → dziś 7). Przycisk filtra klikany skryptem UI Automation
  (`zrzut-panelu.ps1 -Press`) nie przestawia stanu; kliknięty ręcznie — tak (Łukasz).
- Każdy mój Read pliku PNG jest obrazem: `relai-browser` go zmniejszał i zapisywał rekord
  (753×1335 → 1341 → 336 tokenów).

## `describe` — opis słowami

| Przebieg | Wynik |
|---|---|
| 1 (16:17:44) | zmniejszony 512×384 — przyczyna niewidoczna (`$.ui.log` nie idzie do transkryptu) |
| 2 (16:18:45) | zmniejszony; sonda w kopii: `spawn refused: InputValidationError … model: expected one of sonnet / opus / haiku / fable` |
| 3 (16:19:51), po poprawce `spawnAlias` | **opis**: 251 słów (z „…”), 9 507 ms, Haiku `usage` in 9 587 / out 1 537; obraz 800×600 nie dotarł do modelu |

- Rekord: `before 640, after 412, measured true, helper {claude-haiku-5-5, 9587, 1537}`.
- Bilans zrzutu: szacowane 228 × $4/10⁶ = $0,000912; zmierzone 9 587 × 0,1 + 1 537 × 0,5 = $0,001727 /10⁶… = **−$0,0008**.
- **Raport subagenta wraca do głównej sesji drugi raz** (wiadomość „Subagent hand-back”):
  opis w kontekście dwa razy (~824 tokeny > 640 obrazu). Rekord tego nie liczy.
- Treść opisu: dosłowny tekst sześciu języków, link „Learn more”, stan — zgodnie z promptem.
