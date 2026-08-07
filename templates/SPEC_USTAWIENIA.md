# SPEC — `docs/USTAWIENIA.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/USTAWIENIA.md` **w języku
projektu** (`docs/SETTINGS.md` dla projektu angielskiego).

## Rola

Rejestr preferencji użytkownika w tym projekcie i **marker struktury RelAI**. Realizuje zasadę
„zapytaj raz, zapisz, respektuj" (D-22): odpowiedź raz udzielona nigdy nie wraca jako pytanie.

Dwie funkcje w jednym pliku:

1. **Marker wersji** — po linii `Wersja RelAI:` RelAI rozpoznaje, że folder jest projektem RelAI,
   a przyszła aktualizacja pluginu wie, od czego liczyć różnicę (Aneks A pkt 4.2).
2. **Rejestr wyborów** — tabela `Data | Czego dotyczy | Decyzja`.

## Odbiorca

Agent (podstawowy) — sprawdza tu preferencje, zanim zapyta o cokolwiek. Użytkownik zagląda, gdy chce
coś zmienić.

## Warstwy ustawień (D-23)

Globalne preferencje użytkownika (`~/.claude/relai/USTAWIENIA.md`, w projekcie angielskim
`~/.claude/relai/SETTINGS.md`) są dziedziczone przez nowe projekty; wpis w `docs/USTAWIENIA.md`
**nadpisuje** wartość globalną. Wpis lokalny wygrywa zawsze.

**Plik globalny** ma **identyczną strukturę** jak projektowy, z trzema różnicami:

1. Nagłówek brzmi `# USTAWIENIA — preferencje globalne` (bez nazwy projektu).
2. **Nie zawiera linii `Wersja RelAI:`** — marker wersji jest cechą projektu, nie użytkownika.
   Umieszczenie go tam sprawiłoby, że katalog domowy zostałby uznany za projekt RelAI.
3. Trafiają do niego wyłącznie preferencje **ponadprojektowe**: język pracy, format planów, model
   wykonawczy etapów, lokalizacja backupów, kierunek designu. Rzeczy z natury projektowe (git
   remote, profil projektu, podejście do testów w tym repo) zostają w pliku projektowym.

**Kiedy powstaje:** przy pierwszej inicjalizacji projektu RelAI na danej maszynie, zaraz po paczce
trzech pytań — z ponadprojektowego podzbioru odpowiedzi. Nie zadajesz z tego powodu dodatkowego
pytania (limit trzech jest twardy, D-80); informujesz jednym zdaniem w podsumowaniu.

**Kolejność odczytu przed każdym pytaniem o preferencję:** `docs/USTAWIENIA.md` → plik globalny →
dopiero wtedy pytanie. Znalazłeś odpowiedź — nie pytasz; wspominasz pół zdaniem, skąd ją masz.

### Przykład pliku globalnego

```markdown
# USTAWIENIA — preferencje globalne

Preferencje użytkownika dziedziczone przez nowe projekty RelAI. Wpis w `docs/USTAWIENIA.md`
projektu nadpisuje wartość stąd.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język pracy | Polski — dokumentacja PL, kod EN, commity conventional EN |
| 2026-08-12 | Format planów | Interaktywny HTML dla planów głównych, Markdown dla promptów etapowych |
| 2026-08-20 | Lokalizacja backupów | `D:\Backupy\Projekty` |
```

## Struktura pliku

1. **Nagłówek** — `# USTAWIENIA — <nazwa projektu>`.
2. **Linia markera** — dokładnie: `Wersja RelAI: <semver>` oraz data inicjalizacji. Ta linia
   **musi** znaleźć się w pliku przy inicjalizacji i **musi** być aktualizowana przy aktualizacji
   pluginu. Bez niej RelAI nie rozpozna projektu.
3. **Zdanie o roli pliku** — jedno.
4. **Tabela ustawień** — `Data | Czego dotyczy | Decyzja`. Najstarsze u góry.
5. *(opcjonalnie, gdy się pojawi)* **Sekcja „Ustawienia wycofane"** — wpis zastąpiony nie znika
   z tabeli; przenosisz go tutaj z adnotacją „zastąpione przez … dnia … , powód …" (D-18).

## Wpisy tworzone przy inicjalizacji

Zawsze te trzy, z odpowiedzi na paczkę startową (D-20), plus wersja RelAI w linii markera:

| Czego dotyczy | Skąd |
|---|---|
| Język projektu | pytanie 1 (dokumentacja / kod / commity) |
| Git | pytanie 2 |
| Profil projektu | pytanie 3 |

## Polityka aktualizacji

- **Append.** Nowa preferencja to nowy wiersz z datą, nie edycja starego.
- Zmiana wcześniejszej decyzji: nowy wiersz z dzisiejszą datą **i** przeniesienie poprzedniego do
  „Ustawienia wycofane" z powodem. Historia ustaleń nie znika.
- Wpis powstaje **natychmiast** po tym, jak użytkownik coś rozstrzygnął — nie na koniec sesji.
- Aktualizacja pluginu → zmiana wyłącznie linii `Wersja RelAI:` (i wiersz w tabeli, jeśli
  aktualizacja zmieniła coś, na co użytkownik się zgodził).

## Co tu trafia, a co nie

**Trafia:** język, git, profil, sposób prowadzenia planów, podejście do testów, model wykonawczy
etapów, lokalizacja backupów, zgody na wyjątki od reguł domyślnych, wybrany kierunek designu.

**Nie trafia:** decyzje architektoniczne i produktowe („nie proponuj ponownie") — te idą do
`docs/DECYZJE.md`; lekcje z korekt — do `docs/LEKCJE.md`; stan prac — do `STATE.md`.

## Zakazy

- Zero sekretów, tokenów i haseł — także jako „ustawienie" (D-42). Zapisujesz **nazwę** zmiennej
  środowiskowej i miejsce, gdzie trzymany jest sekret, nigdy wartość.
- Nie usuwasz wierszy z tabeli.
- Nie zmieniasz brzmienia linii `Wersja RelAI:` — jest wykrywana dosłownie.

## Przykład (projekt polski)

```markdown
# USTAWIENIA — Parkly

Wersja RelAI: 0.3.0 · zainicjowano: 2026-08-07

Rejestr wyborów użytkownika dla tego projektu. Każdy wpis: data, czego dotyczył, decyzja.
Odpowiedź raz udzielona nie wraca jako pytanie.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język projektu | Polski — dokumentacja PL, kod i identyfikatory EN, commity conventional EN |
| 2026-08-07 | Git | Repo lokalne + zdalne na GitHub (prywatne) |
| 2026-08-07 | Profil projektu | app (Next.js + PostgreSQL) |
| 2026-08-12 | Testy | Testy krytycznych ścieżek, bez pełnego TDD — decyzja przy pierwszym kodzie |
| 2026-08-20 | Lokalizacja backupów | `D:\Backupy\Projekty` |
```
