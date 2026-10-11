# SPEC — `.claude/relai/wznowienie/<slug-projektu>.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Plik wznowienia powstaje w projekcie
**w języku projektu** — nazwa katalogu `wznowienie/` jest stała we wszystkich językach, bo czyta
ją kod (hook startu sesji, pasek `relai-cache-keeper`).

## Rola

Plik wznowienia mówi **następnej sesji, od czego zacząć**, gdy praca przerwała się przed końcem
zadania — najczęściej przez wyczerpany limit planu (5 h albo tygodniowy). Powstaje w ostatnim
kroku procedury „zapisz pracę” (`relai-core/limit-checkpoint.md`). Nowa sesja czyta go jako
**pierwsze źródło** akapitu „gdzie jesteśmy” i proponuje pierwszy krok z jego listy — bez analizy
wstecznej rozmowy, której już nie ma.

Plik nie zastępuje dokumentów projektu. `STATE.md`, wpis dziennika i `STATUS.md` planu niosą stan
na trwałe; plik wznowienia niesie **jedno przejście** — z tej przerwanej sesji do następnej.

## Odbiorca

Model w nowej sesji, często w innym dniu, czasem w innym narzędziu (Cursor, Codex). Nie zna
rozmowy, w której plik powstał. Człowiek czyta go rzadko — ale może, więc piszesz pełnymi zdaniami.

## Gdzie leży i jak się nazywa

`.claude/relai/wznowienie/<slug>.md` w korzeniu projektu. **Jeden plik na projekt**, nie na
sesję: limit tygodniowy odnawia się za kilka dni, a sesja, która go zapisała, tego nie dożyje.

**Slug** to nazwa katalogu projektu: małe litery, każdy ciąg znaków spoza `a-z`, `0-9`, `_`, `-`
zamieniony na jeden myślnik, myślniki z brzegów zdjęte. `RelAI` → `relai`, `Mój Sklep.v2` →
`m-j-sklep-v2`. Wynik pusty albo `.`/`..` → **nie zapisujesz pliku** i mówisz to jednym zdaniem.
Tę samą regułę liczą kod hooka (`core/process/resume.js`) i mod (`resumeSlug` w
`cache-keeper/hooks/limit.ts`). Gdy prompt zapisu podaje ścieżkę wprost („Plik wznowienia: …”),
bierzesz ją dosłownie — nie liczysz drugi raz.

Katalog `.claude/relai/` jest w projekcie ignorowany przez Gita. Plik wznowienia **nie trafia do
commita** — jest notatką lokalną, a jego treść o stanie repozytorium niesie hash `HEAD`.

## Polityka aktualizacji: NADPISYWANY

Każdy zapis nadpisuje plik w całości. Starego nie dopisujesz pod spodem: dwie listy „co dalej”
w jednym pliku to dwie odpowiedzi na jedno pytanie.

**Nikt nie kasuje pliku sam.** Znika po udanym wznowieniu albo po „Odrzuć” — oba za zgodą
człowieka (przycisk na pasku, E4 planu LIMIT_CHECKPOINT). Do tego czasu hook startu wspomina
o nim jednym zdaniem w każdej nowej sesji projektu.

## Struktura pliku — siedem elementów w stałej kolejności

1. **Nagłówek** — `# WZNOWIENIE — <nazwa projektu>`.
2. **Linia metryczna** — dokładnie w tym kształcie, od początku wiersza:
   `Zapisano: RRRR-MM-DD GG:MM · HEAD: <krótki hash> · Narzędzie: <narzędzie i model>`.
   Hook czyta datę z początku tej linii (`Zapisano: ` + data); linia zaczynająca się inaczej
   daje w zdaniu hooka datę modyfikacji pliku, nie zapisu. Hash to `git rev-parse --short HEAD`
   **po** commitach procedury; projekt bez Gita → `HEAD: brak gita`.
3. **`## Co było robione`** — 1–3 zdania: zadanie, plan i etap (`LIMIT_CHECKPOINT E3`) albo
   odnoga, cel.
4. **`## Co jest zrobione`** — lista punktów z dowodem przy każdym: commit, plik, wynik testu.
   Punkt bez dowodu nie trafia tutaj, tylko do „Co dalej”.
5. **`## Co dalej`** — **numerowana** lista kroków w kolejności wykonania; każdy krok jednym
   zdaniem, sprawdzalny. Krok 1 jest tym, który nowa sesja zaproponuje jako pierwszy.
6. **`## Pierwszy krok — komenda`** — blok kodu z jedną komendą albo frazą, którą da się
   uruchomić od razu (`/relai-stage`, `npm test -- cart`, „kontynuujemy pracę”).
7. **`## Pliki w toku`** — lista ścieżek z jednym zdaniem stanu każdej („rozgrzebany, wycofany —
   łatka w `.claude/relai/wznowienie/<slug>.patch`”, „zmieniony, zacommitowany w `abc1234`”).
   Brak plików w toku → jedna linia `— brak`.

Gdy procedura **wycofała** rozgrzebany fragment (kod nie przechodził testów), w „Pliki w toku”
stoi ścieżka łatki z tym fragmentem, a w „Co dalej” krok, który do niego wraca. Wycofanie bez
łatki jest utratą pracy — procedura go nie robi.

## Zasady wspólne

- **Fakty z poleceń, nie z pamięci.** Hash z `git rev-parse`, lista plików z `git status --short`,
  wynik testu z uruchomionej komendy (zasada 1 rejestru lekcji: linia poświadczająca krok bierze
  treść z wyniku jego polecenia).
- **Nie wiesz → piszesz, że nie wiesz.** Luka ma kształt `NIEZNANE: <czego brakuje> — <jak to
  sprawdzić>` w miejscu, w którym byłaby wartość. Nie zmyślasz kroku, żeby lista była dłuższa.
- **Żadnych sekretów** — wartości kluczy, tokenów i haseł nie przepisujesz nawet wtedy, gdy były
  w rozmowie; piszesz nazwę zmiennej (`STRIPE_KEY w .env`).
- Plik ma najwyżej **60 linii**. Dłuższy znaczy, że do pliku wznowienia trafiła historia, której
  miejsce jest w dzienniku.

## Zakazy

- Nie commitujesz pliku wznowienia i nie przenosisz go do `docs/`.
- Nie kasujesz go w procedurze zapisu ani na starcie sesji — tylko na zgodę człowieka.
- Nie zmieniasz nazwy katalogu `wznowienie/` przy projekcie w innym języku.

## Przykład (projekt polski, katalog `Sklep`, przerwany etap planu)

```markdown
# WZNOWIENIE — Sklep

Zapisano: 2026-10-11 14:05 · HEAD: 3f9c2a1 · Narzędzie: Claude Code, Opus 5.5

## Co było robione

Plan PLATNOSCI, etap E2 z 4: webhook Stripe potwierdzający płatność. Limit 5 h przekroczył
próg 90 % w połowie testów idempotencji.

## Co jest zrobione

- Endpoint `POST /api/stripe/webhook` z weryfikacją podpisu — commit `3f9c2a1`.
- Testy webhooka: `npm test -- webhook` → 6/6, kod 0.
- `docs/STATE.md` i wpis w `docs/DZIENNIK.md` z 2026-10-11 — commit `3f9c2a1`.

## Co dalej

1. Odtworzyć test idempotencji z łatki i doprowadzić go do zielonego (`npm test -- idempotency`).
2. Sprawdzić `updatedAt` po drugim wywołaniu tego samego zdarzenia (punkt 3 Weryfikacji E2).
3. Zamknąć E2 rytuałem „Na koniec” i wygenerować `PROMPT_ETAP_3.md`.

## Pierwszy krok — komenda

    git apply .claude/relai/wznowienie/sklep.patch && npm test -- idempotency

## Pliki w toku

- `src/payments/idempotency.test.ts` — rozgrzebany, nie przechodził; wycofany, łatka w
  `.claude/relai/wznowienie/sklep.patch`.
- `src/payments/webhook.ts` — zacommitowany w `3f9c2a1`.
```
