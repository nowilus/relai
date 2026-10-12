# Ewaluacje wyzwalania skilli RelAI — 2026-10-12

Odnoga AUDYT_SKILLI, paczka S5. Zestaw: `core/evals/triggers.json` (14 pozycji), narzędzie:
`core/tools/eval-triggers.js`, Claude Code 2.1.295 (binarka aplikacji), `--setting-sources project,local`,
`--strict-mcp-config`, limit tur 4, jedna sesja na pozycję (n = 1 — wynik pojedynczy, nie częstość).
Wariant **nowy** = plugin z drzewa roboczego po S2 (opisy 773 / 797 znaków); **stary** = worktree
`HEAD` 37af50f (opisy 1018 / 997 znaków, z „od czego zacząć”, „jak to ugryźć”) — tylko pozycje
`kontrola_zmiany`. Werdykt: `ok` / `blad` / `nie zmierzono`; „skill” = wywołanie narzędziem Skill,
nazwy plików = odczyt plików skilla, „rytuał” = odczyt `docs/STATE.md`/`DZIENNIK`/`USTAWIENIA` (licznik
szeroki: zachowanie bez skilla, z hooka i `CLAUDE.md`, L-0030).

Kopia fixtury jest repozytorium z `user.name = tester` (podpis dziennika fixtury). Pierwszy przebieg
tego dnia, bez tej izolacji, dał 0 z 3 pozytywów relai-planning na obu modelach: hook czytał
`~/.gitconfig` mierzącego i siatka „cudzy projekt” (D-27) zatrzymywała model pytaniem — defekt
instrumentu (L-0170), wynik odrzucony; tabela niżej to przebieg po poprawce.

| # | Skill | Folder | Oczekiwane | Prompt | Sonnet 5.5 — nowy | Opus 5.5 — nowy | Sonnet 5.5 — stary | Opus 5.5 — stary |
|---|---|---|---|---|---|---|---|---|
| core-p1 | relai-core | relai | trigger | kontynuujemy pracę | ok · skill · rytuał | ok · skill | — | — |
| core-p2 | relai-core | relai | trigger | sprawdź status | ok · skill · rytuał | ok · skill | — | — |
| core-p3 | relai-core | relai | trigger | kończymy na dziś | ok · skill · session-close.md, document-rotation.md · rytuał | ok · skill | — | — |
| core-p4 | relai-core | obcy | trigger | zacznijmy projekt | ok · skill · new-project.md | ok · skill · new-project.md | — | — |
| core-n1 | relai-core | obcy | none (procedura) | sprawdź status zamówienia 1234 w sklepie internetowym — co znaczy status „w realizacji”? | ok | ok | — | — |
| core-n2 | relai-core | obcy | none (procedura) | Popraw funkcję odwroc w lista.py tak, żeby naprawdę odwracała listę. Pokaż sam kod, niczego nie zapisuj. | ok | ok | — | — |
| core-n3 | relai-core | obcy | none (procedura) | zaplanuj mi spotkanie na jutro o 10 z Anią — jakie trzy punkty agendy proponujesz? | ok | ok | — | — |
| plan-p1 | relai-planning | relai | trigger | przygotuj plan migracji bazy danych tego projektu na PostgreSQL | ok · skill · rytuał | ok · skill | — | — |
| plan-p2 | relai-planning | relai | trigger | rozpisz na etapy przepisanie logowania w tym projekcie na OAuth | ok · skill · rytuał | ok · skill | — | — |
| plan-p3 | relai-planning | relai | trigger | zaplanujmy koszyk i płatności w tym sklepie | ok · skill · rytuał | ok · skill | — | — |
| plan-n1 | relai-planning | relai | none | zaplanuj mi spotkanie na jutro o 10 z Anią — jakie trzy punkty agendy proponujesz? | ok · rytuał | ok | ok · rytuał | ok |
| plan-n2 | relai-planning | obcy | none | sprawdź status zamówienia 1234 w sklepie internetowym — co znaczy status „w realizacji”? | ok | ok | ok | ok |
| plan-n3 | relai-planning | obcy | none | od czego zacząć naukę hiszpańskiego? | ok | ok | ok | ok |
| plan-n4 | relai-planning | obcy | none | jak to ugryźć: chcę schudnąć 5 kg do wakacji | ok | ok | ok | ok |

## Podsumowanie

- **sonnet-nowy**: 14 sesji — ok 14, blad 0, nie zmierzono 0; koszt wg CLI 1.85 USD (FAKT z `total_cost_usd`).
- **opus-nowy**: 14 sesji — ok 14, blad 0, nie zmierzono 0; koszt wg CLI 3.42 USD (FAKT z `total_cost_usd`).
- **sonnet-stary**: 4 sesji — ok 4, blad 0, nie zmierzono 0; koszt wg CLI 0.45 USD (FAKT z `total_cost_usd`).
- **opus-stary**: 4 sesji — ok 4, blad 0, nie zmierzono 0; koszt wg CLI 0.75 USD (FAKT z `total_cost_usd`).

## Kontrola zmiany opisu — powtórzenia

Negatywy `plan-n3` i `plan-n4` (folder obcy, bez dziennika — izolacja gita ich nie dotyczy, więc
przebieg 1 jest dla nich ważny) na Sonnecie 5.5: przebieg 1, przebieg 2 (tabela wyżej) i cztery
powtórzenia. Liczba sesji, w których relai-planning się wyzwolił:

| Pozycja | Stary opis | Nowy opis |
|---|---|---|
| plan-n3 | 0 z 6 | 0 z 6 |
| plan-n4 | 1 z 6 | 0 z 6 |

Opus 5.5 na starym opisie: 0 z 2 dla obu pozycji. Zmiana opisu jest zgodna z kierunkiem (żadnego
wyzwolenia na nowym), ale jedno wyzwolenie na sześć sesji starego opisu mieści się w szumie —
pomiar nie dowodzi, że to zmiana opisu usunęła fałszywe wyzwolenie. Ryzyko z audytu („planning
łapie ogólne frazy w każdym folderze”) okazało się w pomiarze małe także na starym opisie.

Surowe wyniki (narzędzia, tury, tekst odpowiedzi): [EVAL_TRIGGERS_2026-10-12.json](EVAL_TRIGGERS_2026-10-12.json).
