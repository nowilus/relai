# SPEC — `docs/plany/<TEMAT>/STATUS.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `STATUS.md` **w języku projektu**
(nazwa pliku stała: `STATUS.md`, obok `PLAN.md` w folderze planu).

## Rola

Jedyne miejsce, w którym widać **postęp** planu. `PLAN.md` mówi, co ma powstać, i jest zamrożony;
`STATUS.md` mówi, co już powstało, i zmienia się przy każdym etapie. Rozdzielenie tych dwóch rzeczy
jest tym, co pozwala zamrozić plan bez blokowania pracy.

Drugie zadanie: `STATUS.md` jest **celem linku „Aktywny plan"** z `CLAUDE.md` (D-30) i punktem,
od którego zaczyna czytanie agent wchodzący w plan w świeżej sesji.

## Odbiorca

Agent w kolejnej sesji (pierwszy) i człowiek sprawdzający „gdzie jesteśmy z tym planem".

## Struktura pliku

1. **Nagłówek** — `# STATUS — plan <TEMAT>`.
2. **Linia metryczna** — w jednej linii, oddzielone `·`:
   - link do `PLAN.md`,
   - data utworzenia planu,
   - **status planu** (lista niżej),
   - **model wykonawczy etapów** — dosłownie tak, jak odpowiedział użytkownik przy pytaniu
     startowym (D-39); „Opus" albo „złożone etapy: Opus, mechaniczne: Haiku" — nie normalizujesz.
3. **Tabela etapów** — `Etap | Nazwa | Status | Prompt | Uwagi`.
4. **Dziennik wdrożenia** — lista dopisywana **na końcu**, jedna linia na zdarzenie:
   `- RRRR-MM-DD — <co się stało>`. Bez edycji wstecz.

## Statusy

**Statusy planu** (linia metryczna):

| Status | Kiedy |
|---|---|
| `DO AKCEPTACJI` | plan wygenerowany, czeka na człowieka |
| `ZAAKCEPTOWANY <data>` | zgoda padła — plan zamrożony, etapy mogą ruszać |
| `WSTRZYMANY <data> — <powód>` | praca przerwana, plan nadal obowiązuje |
| `ZREALIZOWANY <data>` | wszystkie etapy domknięte, plan zamknięty i zarchiwizowany |
| `CZĘŚCIOWO ZREALIZOWANY <data> — <powód>` | odchylenie fundamentalne; obok istnieje nowy plan z linkiem do tego (D-33) |

**Statusy etapu** (kolumna `Status`):

| Status | Znaczenie |
|---|---|
| `OCZEKUJE` | etap przed kolejką |
| `GOTOWY DO STARTU` | poprzedni etap zamknięty; ten można uruchomić w świeżej sesji |
| `W TOKU` | etap zaczęty i nieukończony (sesja przerwana) |
| `ZREALIZOWANY <data>` | etap zamknięty rytuałem „Na koniec" |
| `POMINIĘTY — <powód>` | etap świadomie porzucony; powód obowiązkowy |

Dokładnie **jeden** etap może mieć status `GOTOWY DO STARTU`. Jeśli po zamknięciu etapu nie ustawisz
następnego, plan wygląda na skończony, choć nie jest.

## Kolumna `Prompt`

Zawiera **link do `PROMPT_ETAP_N.md`** — samowystarczalnego promptu etapowego, wg
`SPEC_PROMPT_ETAPU.md` (D-34). Link pojawia się w chwili, w której prompt realnie powstaje, bo
generacja jest lazy:

| Etap | Zawartość kolumny |
|---|---|
| Etap z gotowym promptem (`GOTOWY DO STARTU`, `W TOKU`, `ZREALIZOWANY`) | link `[PROMPT_ETAP_N.md](PROMPT_ETAP_N.md)` |
| Etap `OCZEKUJE` — prompt jeszcze nie istnieje | `—` |

**Nie wstawiasz linku do pliku, którego nie ma.** Link do nieistniejącego promptu jest gorszy niż
`—`: siatka bezpieczeństwa z `relai-core` rozpoznaje po nim lukę i zaproponuje dogenerowanie, więc
fałszywy link wyłącza jedyny mechanizm, który tę lukę wyłapuje.

Odwrotnie też: etap `GOTOWY DO STARTU` z `—` w tej kolumnie to sygnał, że rytuał „Na koniec"
poprzedniego etapu został przerwany.

## Polityka aktualizacji

| Kiedy | Co się zmienia |
|---|---|
| Plan zaakceptowany | status planu + linia w dzienniku wdrożenia + pierwszy etap → `GOTOWY DO STARTU` + link do `PROMPT_ETAP_1.md` |
| Etap rozpoczęty (`/relai-stage` po potwierdzeniu) | status etapu → `W TOKU` + linia w dzienniku wdrożenia |
| Etap zamknięty | status etapu → `ZREALIZOWANY <data>`, następny → `GOTOWY DO STARTU` **z linkiem do świeżo wygenerowanego promptu**, linia w dzienniku wdrożenia |
| Sesja etapu przerwana | status etapu → `W TOKU` + linia w dzienniku wdrożenia mówiąca, co zostało |
| Aneks do planu | linia w dzienniku wdrożenia z numerem aneksu; **treść aneksu jest w `PLAN.md`**, nie tutaj |
| Plan zamknięty | status planu → `ZREALIZOWANY <data>`, plik razem z folderem idzie do `docs/archiwum/plany/` |

Dziennik wdrożenia jest **append-only** — dopisujesz na końcu, nie edytujesz starych linii. Wpis
w dzienniku wdrożenia jest krótki (jedna linia); szczegóły „co zrobiono i jak zweryfikowano" mieszkają
w `docs/DZIENNIK.md`, nie tutaj.

## Zakazy

- Nie duplikujesz treści planu — żadnych zakresów etapów ani ryzyk; od tego jest `PLAN.md`.
- Nie prowadzisz tu narracji z pracy — od tego jest `DZIENNIK.md`.
- Nie kasujesz wierszy etapów; etap porzucony dostaje status `POMINIĘTY` z powodem (D-18).
- Nie zostawiasz planu bez etapu `GOTOWY DO STARTU`, jeśli plan trwa.
- Nie wpisujesz modelu wykonawczego „z rekomendacji", jeśli użytkownik odpowiedział inaczej.

## Przykład (projekt polski)

```markdown
# STATUS — plan PLATNOSCI

Plan: [PLAN.md](PLAN.md) · Utworzony: 2026-08-12 · Status planu: **ZAAKCEPTOWANY 2026-08-13
(Aneks A)** · Model wykonawczy etapów: Opus dla E2–E3, Haiku dla reszty (wybór użytkownika)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Model płatności i statusy | **ZREALIZOWANY 2026-08-14** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wygasanie 15 min; test współbieżności przeszedł |
| E2 | Stripe Checkout + webhook | **GOTOWY DO STARTU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | wymaga kluczy Stripe (sekcja 9 planu) |
| E3 | Faktury PDF i wysyłka | OCZEKUJE | — | zakres zależny od decyzji o księgowości |
| E4 | Panel płatności dla administratora | OCZEKUJE | — | |

## Dziennik wdrożenia

- 2026-08-12 — plan utworzony, przekazany do akceptacji.
- 2026-08-13 — plan ZAAKCEPTOWANY z poprawkami (Aneks A: rezygnacja z BLIK-a w v1, kopia faktury
  do księgowości). Wygenerowano PROMPT_ETAP_1.
- 2026-08-14 — E1 rozpoczęty.
- 2026-08-14 — **E1 ZREALIZOWANY**. Tabela `Payment`, status `oczekuje na płatność`, wygasanie po
  15 minutach. Szczegóły i weryfikacja: wpis w `docs/DZIENNIK.md` z 2026-08-14. Wygenerowano
  PROMPT_ETAP_2.
- 2026-08-14 — E2 ustawiony jako GOTOWY DO STARTU; blokada: klucze Stripe po stronie człowieka.
```
