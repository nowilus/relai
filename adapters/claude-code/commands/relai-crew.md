---
description: "Załoga — model, który wywołał komendę, zostaje orkiestratorem celu: wywiad o role i modele, plan fal bez konfliktów plików, delegacja do subagentów gospodarza albo do drugiego narzędzia (Claude Code, Codex, Cursor), przegląd krzyżowy i rytuał zamknięcia; bez drugiego zalogowanego narzędzia płynnie przechodzi w tryb basic"
argument-hint: "[cel] | setup | status | review [--base GAŁĄŹ] | rescue <zadanie>"
---

# /relai-crew — załoga: orkiestracja wielu agentów i przegląd krzyżowy

Argumenty (opcjonalne): `$ARGUMENTS`

Twoje zadanie: doprowadzić **cel** do końca rękami subagentów, a samemu zostać
**orkiestratorem** — analiza, plan fal, delegacja, monitorowanie, przegląd krzyżowy, rytuał
zamknięcia. Orkiestratorem jest ten model i to narzędzie, w którym komenda padła; nie przekazujesz
tej roli nikomu. Kroki wykonujesz po kolei.

Zasada nadrzędna: **decyzję „kto co robi" podejmuje człowiek w wywiadzie**, narzędzie liczy fakty
(które CLI jest, które zalogowane, które zadania kolidują plikami), a Ty wykonujesz. Nic tu nie
dzieje się „przy okazji": zadanie bez listy plików nie istnieje, zapis bez roli piszącej nie
istnieje, przegląd bez werdyktu nie istnieje.

---

## Argument — który tryb

| Argument | Co robisz |
|---|---|
| brak albo `<cel>` | pełny przebieg: kroki 0–9. Bez celu pytasz o niego jednym zdaniem i czekasz |
| `setup` | kroki 0–2, potem `node .claude/relai/tools/crew.js setup` — raport gotowości z instrukcjami instalacji i logowania; **koniec**, niczego nie instalujesz |
| `status` | kroki 0–1, potem `node .claude/relai/tools/crew.js status` — przebiegi i zadania z katalogu roboczego; koniec |
| `review [--base GAŁĄŹ]` | kroki 0–2 i **wyłącznie krok 8** dla bieżących zmian (bez `--base`: niezacommitowane) |
| `rescue <zadanie>` | kroki 0–2, jedno pytanie o narzędzie i model, potem krok 6 dla **jednego** zadania w drugim narzędziu i krok 7; bez kroku 8, chyba że człowiek poprosi |

To jest natywny odpowiednik funkcji znanych z pluginu Codex — `rescue`, `review`, `setup`,
`status` — pod nazewnictwem RelAI i bez instalowania czegokolwiek obok. Czego **nie ma**:
anulowania biegnącego zadania z poziomu komendy (zadanie biegnie synchronicznie w powłoce;
przerywasz proces powłoki) i wątków wznawianych między sesjami (każdy przebieg jest świeży;
kontekst niesie plik zadania, nie pamięć drugiego narzędzia).

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → jedno zdanie, że ten folder nie jest projektem RelAI, i koniec.
Niczego nie inicjalizujesz i niczego nie delegujesz.

## Krok 1 — narzędzie

Fakty liczy narzędzie rdzenia, nie Ty: `.claude/relai/tools/crew.js`. Podkłada je hook startu
sesji, tą samą drogą co specyfikacje i `clean-work.js` (L-0012).

**Pliku nie ma** → powiedz jednym zdaniem, że hook startu go nie podłożył (sesja sprzed instalacji
tej wersji albo sesja bez hooka), i poproś o restart sesji. **Nie** kopiujesz go z katalogu
pluginu — sesja nie ma tam dostępu — i **nie** piszesz własnego skryptu zastępczego.

## Krok 2 — gospodarz i tryb

```bash
node .claude/relai/tools/crew.js detect --json
```

Wynik niesie: `host` (gospodarz rozpoznany po zmiennych środowiska), `runtimes` (dla każdego
z trzech narzędzi: czy CLI jest w zasięgu, czy jest **zalogowane**, czy ma subagentów natywnych)
i `mode`: `full` albo `basic`.

- **Gospodarz.** Wiążąca jest nazwa narzędzia ze **zdania hooka startu** o liście modeli
  (`.claude/relai/MODELE-<narzędzie>.md`). `host` z narzędzia jest podpowiedzią; przy rozjeździe
  wierzysz hookowi, a `unknown` znaczy „weź z hooka". Bez zdania hooka i z `unknown` → pytasz
  człowieka jednym zdaniem, w którym narzędziu jesteście. **Nie zgadujesz** po własnym modelu.
- **Tryb `full`** — poza gospodarzem jest choć jedno narzędzie zalogowane. Te narzędzia są do
  dyspozycji w wywiadzie (krok 4) jako wykonawcy ról i jako recenzent krzyżowy.
- **Tryb `basic`** — drugiego zalogowanego narzędzia nie ma. Mówisz o tym **jednym zdaniem**
  z nazwą tego, czego brakuje (CLI albo logowanie — narzędzie podaje które), i przechodzisz dalej
  bez zatrzymywania: orkiestracja i podział na subagentów zostają **w narzędziu gospodarza**.
  Nie instalujesz i nie logujesz niczego sam (D-42, D-70) — polecenia wypisuje `setup`.

Sprawdzenie logowania nie czyta żadnej wartości sekretu: narzędzie pyta CLI o status i patrzy na
odpowiedź. Nie wypisujesz adresów e-mail ani identyfikatorów kont z tej odpowiedzi.

## Krok 3 — analiza celu

Przeczytaj to, czego cel wymaga — i nic ponad to: `docs/STATE.md`, aktywny plan (gdy cel jest
etapem albo jego częścią), właściwe wpisy `docs/DECYZJE.md`, kod, którego cel dotyka. Rozłóż cel
na **zadania**. Każde ma:

- `id` (krótki, bez spacji), `title`,
- `files` — **ścieżki plików, które zadanie wolno mu zmienić**; zadanie bez tej listy nie wchodzi
  do planu — rozbijasz je dalej albo pytasz,
- `role`: `coder`, `tester` albo `reviewer` (lista zamknięta),
- `dependsOn` — identyfikatory zadań, które muszą się skończyć wcześniej,
- kryterium ukończenia: jedno zdanie sprawdzalne poleceniem albo stanem pliku (L-0017).

Cel będący etapem planu **nie zwalnia** z `/relai-stage`: karta etapu, zgoda i rytuał
„Na koniec" należą do etapu; załoga jest **sposobem wykonania** wewnątrz niego. Cel spoza etapu
w trakcie etapu → sygnał odchylenia jak zawsze (odnoga / aneks / świadomie odłożone).

## Krok 4 — wywiad

**Jedno** `AskUserQuestion` z maksymalnie czterema pytaniami. W narzędziu bez pytania
ustrukturyzowanego (Cursor) — te same pytania tekstem: ponumerowane opcje, rekomendacja pierwsza
z dopiskiem „(Rekomendowane)", format odpowiedzi cyframi (`1-1, 2-2`), i **czekasz**.

| # | Pytanie | Opcje i rekomendacja |
|---|---|---|
| 1 | **Podział ról** — kto koduje, kto testuje, kto recenzuje | opcje składasz z faktów kroku 2 i **list modeli** `.claude/relai/MODELE-*.md` (nazwy z datą listy, nigdy z pamięci). Rekomendacja w `full`: koder i tester w narzędziu gospodarza, **recenzent w drugim narzędziu** (przegląd krzyżowy przez inny model i inny harness). W `basic`: recenzent innym modelem gospodarza niż koder — jeśli lista ma tylko jeden model, mówisz to wprost |
| 2 | **Liczba subagentów naraz** | 1 (sekwencyjnie) / 2 (Rekomendowane) / do 4. Liczba ogranicza szerokość fali z kroku 5, nigdy jej nie poszerza |
| 3 | **Tryb pracy** | równoległy wg fal (Rekomendowane, gdy plan ma fale szersze niż 1) / sekwencyjny (każde zadanie osobno, także te bez konfliktu) |
| 4 | **Zakres modeli** — które z dostępnych subskrypcji wolno użyć | wszystkie zalogowane (Rekomendowane w `full`) / tylko gospodarz / lista wskazana przez człowieka. Odpowiedź ogranicza pytanie 1, nie odwrotnie |

Odpowiedzi **nie zapamiętujesz** w `docs/USTAWIENIA.md` — wywiad pada przy każdym wywołaniu, bo
skład załogi zależy od celu i od kosztu, który człowiek chce ponieść w tym przebiegu. Zapisujesz
je w karcie przebiegu (krok 5).

W trybie `rescue` wywiad skraca się do **jednego** pytania: które narzędzie i który model
(z listy modeli tego narzędzia) ma dostać zadanie.

## Krok 5 — plan fal

Zapisz zadania do `.claude/relai/work/CREW/<run-id>/zadania.json` (tablica obiektów z kroku 3;
`run-id` w formacie `RRRR-MM-DD_GGMMSS` albo nazwa nadana przez człowieka) i policz fale:

```bash
node .claude/relai/tools/crew.js plan .claude/relai/work/CREW/<run-id>/zadania.json
```

Reguła jest jedna i twarda: **dwa zadania z tym samym plikiem nigdy nie biegną naraz** —
narzędzie dokłada zależność późniejszego od wcześniejszego i pokazuje każdy taki konflikt.
Zadania bez wspólnych plików i bez zależności trafiają do jednej fali. Cykl zależności kończy się
błędem — wtedy poprawiasz `dependsOn`, nie „przycinasz" planu.

Pokaż człowiekowi fale (z narzędziem i rolą przy każdym zadaniu), konflikty i skład załogi
z wywiadu. Zapisz to jako `PLAN.md` w katalogu przebiegu. **Czekasz na „zaczynamy"** (D-35) —
bez zgody nie startuje ani jedno zadanie.

## Krok 6 — delegacja

Jedna fala naraz; w fali tyle zadań, ile pozwala odpowiedź na pytanie 2. Każde zadanie dostaje
prompt złożony z **preambuły roli** i treści zadania (pliki w zakresie, kryterium ukończenia,
katalog roboczy) — preambułę niesie narzędzie i jest ta sama dla wszystkich dróg:

```bash
node .claude/relai/tools/crew.js prompt --role coder --task <plik-zadania.md> --files a.js,b.js
```

Droga zależy od tego, **gdzie** biegnie zadanie:

| Gospodarz | Subagent gospodarza (basic i full) | Drugie narzędzie (tylko full) |
|---|---|---|
| Claude Code | narzędzie `Agent` z `subagent_type` `relai:relai-coder` / `relai:relai-tester` / `relai:relai-reviewer` i `model` z wywiadu; zadania jednej fali uruchamiasz **w jednej wiadomości**, żeby biegły równolegle | `node .claude/relai/tools/crew.js run --runtime codex\|cursor --task <plik> --role coder --write --files … --run-id <run> --task-id <id>`; przy fali szerszej niż 1 — w tle |
| Codex | natywny subagent (`spawn_agent`, funkcja `multi_agent`) z promptem z `crew.js prompt`; fala = tyle wywołań, ile zadań | `crew.js run --runtime claude-code\|cursor …` przez polecenie powłoki |
| Cursor | subagenci projektu `.cursor/agents/relai-coder.md`, `relai-tester.md`, `relai-reviewer.md` (kładzie je instalator adaptera); wywołujesz je nazwą | `crew.js run --runtime claude-code\|codex …` przez narzędzie powłoki; gdy powłoka jest w tej sesji zablokowana, mówisz to jednym zdaniem i **wracasz do trybu basic** — nie omijasz blokady |

Zasady delegacji, bez wyjątków:

- `--write` dostają **wyłącznie** role `coder` i `tester`; `reviewer` jest zawsze tylko-do-odczytu
  (narzędzie odmawia `--write` dla tej roli — to celowe).
- Nigdy nie dokładasz flag omijających uprawnienia (`--dangerously-*`, `--yolo`,
  `bypassPermissions`); narzędzie ich nie składa, a Ty ich nie dopisujesz ręcznie.
- Prompt zadania **nie zawiera sekretów** ani ich wartości; potrzebna zmienna nazywana jest
  z nazwy (`STRIPE_KEY`), nigdy z wartości (D-42).
- Subagent **nie pisze do `docs/`** — `STATE.md`, dziennik i rejestry należą do orkiestratora.
- Zadanie w toku nie dostaje sąsiada na tym samym pliku, nawet gdy człowiek prosi o przyspieszenie;
  wtedy tłumaczysz konflikt i proponujesz podział zadania.

## Krok 7 — monitorowanie

Po każdej fali, zanim ruszy następna:

1. `node .claude/relai/tools/crew.js status --run-id <run>` — status każdego zadania
   (`done` / `failed` / `timeout`), a dla subagentów gospodarza — ich własne raporty.
2. Czytasz sekcję `## Report` każdego zadania (plik `<id>.out.txt` przy zadaniach z drugiego
   narzędzia). Raport bez listy zmienionych plików albo bez sposobu weryfikacji to zadanie
   **niezakończone**, choćby proces zwrócił 0.
3. `git status --short` i `git diff --stat` — plik zmieniony **spoza** listy zadania to STOP:
   pokazujesz różnicę i pytasz człowieka (cofnąć / przyjąć / przenieść do nowego zadania).
   Nie decydujesz sam.
4. `failed` albo `timeout` → **jedna** powtórka z doprecyzowanym promptem; druga porażka → pytanie
   do człowieka. Nie przesuwasz zadania cicho do innego narzędzia.
5. Dopisujesz wynik fali do `PLAN.md` przebiegu (co przeszło, co nie, ile trwało).

## Krok 8 — przegląd krzyżowy

Recenzent z wywiadu dostaje **całość zmian przebiegu**, nie pojedyncze zadania:

- w `full`, gdy recenzentem jest drugie narzędzie:
  `node .claude/relai/tools/crew.js review --runtime <narzędzie> [--base GAŁĄŹ] [--model m] --run-id <run>`
  — Codex idzie przez `codex review`, pozostałe przez zadanie tylko-do-odczytu z preambułą
  recenzenta;
- w `basic` albo gdy człowiek wskazał recenzenta w gospodarzu: subagent `relai-reviewer`
  (Claude Code) / `.cursor/agents/relai-reviewer.md` (Cursor) / natywny subagent z promptem
  `crew.js prompt --role reviewer` (Codex) — **innym modelem niż koder**, gdy lista na to pozwala.

Recenzent zgłasza **wszystkie** znaleziska, każde z wagą i pewnością — filtr jest Twój: człowiekowi
pokazujesz CRITICAL i HIGH zawsze, a MEDIUM i LOW o niskiej pewności zbiorczo, jedną linią z liczbą.

Werdykt jest jeden z trzech: **APPROVE** → krok 9; **WARN** → pokazujesz znaleziska i pytasz,
czy poprawić teraz (wtedy krok 6 dla wskazanych zadań) czy przyjąć świadomie (wchodzi do wpisu
jako „świadomie odłożone"); **BLOCK** → wracasz do kroku 6 dla wskazanych zadań, potem ponowny
przegląd. Najwyżej **dwie** rundy poprawek; trzecia to pytanie do człowieka, nie kolejna pętla.
Werdyktu nierozpoznanego (brak sekcji `## Verdict`) nie interpretujesz jako zgody — prosisz
recenzenta o werdykt ponownie, raz.

## Krok 9 — zamknięcie (D-44, w tej samej turze)

1. `docs/STATE.md` — nadpisujesz to, co się zmieniło.
2. `docs/DZIENNIK.md` — wpis na końcu „Wpisów": w „Zrobione" **kto** (narzędzie i model) zrobił
   **co**, w „Zweryfikowane — jak dokładnie" polecenia testów z wynikiem **i werdykt recenzenta
   z nazwą narzędzia**, w „Świadomie odłożone" przyjęte WARN-y, w „Do zrobienia przez człowieka"
   to, czego załoga nie mogła. Podpis z modelem orkiestratora.
3. Profil `prompty` → wpisy w `docs/ARTEFAKTY.md` dla artefaktów, które przebieg zmienił.
4. Propozycja commita z conventional message; **bez zgody nie commitujesz**.
5. Podsumowanie: 3–5 zdań — cel, skład załogi, ile zadań w ilu falach, werdykt, co czeka.

Katalog przebiegu `.claude/relai/work/CREW/<run-id>/` **zostaje** — sprząta go `/relai-clean`
jak każdy artefakt roboczy (prompty, wyjścia, manifest). Cel będący etapem → rytuał „Na koniec"
etapu wykonujesz **dodatkowo**, według `relai-planning`.

---

## Zakazy tej komendy

- **Nie startujesz żadnego zadania bez „zaczynamy"** po pokazaniu fal i składu załogi (D-35).
- **Nie decydujesz o rolach, liczbie subagentów, trybie ani zakresie modeli sam** — to odpowiedzi
  wywiadu; brak odpowiedzi to brak przebiegu, nie domysł.
- **Nie zapamiętujesz odpowiedzi wywiadu** w `docs/USTAWIENIA.md` ani w pliku stanu.
- **Nie uruchamiasz dwóch zadań na tym samym pliku naraz** i nie „przycinasz" konfliktu ręcznie.
- **Nie dajesz `--write` recenzentowi** i nie dokładasz flag omijających uprawnienia.
- **Nie instalujesz i nie logujesz** żadnego narzędzia; `setup` wypisuje polecenia dla człowieka.
- **Nie wypisujesz wartości sekretów** ani identyfikatorów kont z odpowiedzi o logowaniu.
- **Nie przesuwasz zadania do innego narzędzia po cichu** po porażce — pytasz.
- **Nie przyjmujesz zmiany spoza listy plików zadania** bez pytania.
- **Nie zamykasz przebiegu bez werdyktu** recenzenta i bez wpisu w dzienniku.
- **Nie zastępujesz `/relai-stage`** — etap ma swoją kartę, zgodę i rytuał; załoga działa w nim.
- **Nie rozpoznajesz gospodarza po własnym modelu** — nazwa narzędzia pochodzi ze zdania hooka.
