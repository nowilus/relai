---
description: Pakuje projekt do archiwum ZIP w centralnym folderze backupów — z wykluczeniem sekretów i katalogów runtime — i zapisuje wpis w dzienniku
argument-hint: "[ŚCIEŻKA] — opcjonalna, jednorazowa lokalizacja docelowa dla tego jednego backupu"
---

# /relai-backup — kopia zapasowa projektu

Argument (opcjonalny): `$ARGUMENTS`

Twoje zadanie: zostawić na dysku **jeden działający plik ZIP** z projektem, bez ani jednego sekretu
w środku, i odnotować to w dzienniku. Kroki wykonujesz po kolei.

---

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → jedno zdanie, że ten folder nie jest projektem RelAI, i koniec.
Niczego nie inicjalizujesz.

## Krok 1 — dokąd (pytanie pada raz na maszynę, D-43 + L-0006)

Lokalizacji centralnego folderu backupów szukasz **w tej kolejności** i zatrzymujesz się na
pierwszym trafieniu:

| # | Źródło | Co z niego bierzesz |
|---|---|---|
| 1 | argument komendy | ścieżka jednorazowa — używasz jej i **nie** zapisujesz jako preferencji |
| 2 | `docs/USTAWIENIA.md`, wiersz „Lokalizacja backupów" | ścieżka projektowa |
| 3 | ustawienia globalne `~/.claude/relai/USTAWIENIA.md` (wstrzykiwane do kontekstu przez hook `session-context`) | ścieżka globalna — to jest miejsce docelowe tej preferencji |
| 4 | brak wszędzie | **pytasz** (AskUserQuestion, jedno pytanie) |

Pytasz **tylko** w przypadku 4. Znalazłeś odpowiedź wyżej — używasz jej i wspominasz pół zdaniem,
skąd ją masz („zgodnie z Twoim ustawieniem globalnym").

Pytanie ma trzy opcje, pierwsza z dopiskiem „(Rekomendowane)":

1. `<dysk projektu>:\Backupy\RelAI` — obok projektów, poza repozytorium *(Rekomendowane)*
2. Folder w katalogu domowym: `~/Backupy/RelAI`
3. Inna ścieżka — użytkownik wpisuje własną

Po odpowiedzi **zapisz ją do warstwy globalnej** (`~/.claude/relai/USTAWIENIA.md`, wiersz
`| <data> | Lokalizacja backupów | <ścieżka> |`) — lokalizacja backupów jest preferencją
ponadprojektową (D-23), więc następny projekt już nie zapyta. Ścieżkę zapisujesz **dosłownie**,
bez rozwijania `~`.

Folder nie istnieje → tworzysz go. Nie da się utworzyć (brak uprawnień, zły dysk) → mówisz o tym
i pytasz o inną ścieżkę. Nie robisz backupu „gdzieś obok".

**Zakaz:** centralny folder backupów **nie może** leżeć wewnątrz katalogu projektu — archiwum
pakowałoby samo siebie. Wykryjesz taką ścieżkę → powiedz to wprost i poproś o inną.

**Zapis poza katalogiem roboczym.** Folder backupów z definicji leży poza projektem, a sesja ma
dostęp do katalogu roboczego i tego, na co użytkownik się zgodził. Odmowa zapisu **nie jest błędem
projektu** — powiedz wprost, że sesja nie ma dostępu do wskazanego folderu, i podaj dwa wyjścia:
zgoda na zapis w tej sesji albo uruchomienie jej z `--add-dir "<folder backupów>"`. Nie podmieniaj
po cichu lokalizacji na katalog projektu — backup w środku projektu nie chroni przed niczym.

## Krok 2 — nazwa archiwum (D-43)

`NAZWA_RRRR-MM-DD_GGMM.zip`, gdzie:

- `NAZWA` — nazwa folderu projektu, ze spacjami zamienionymi na `_`, bez polskich znaków
  diakrytycznych i bez znaków zakazanych w nazwach plików Windows (`\ / : * ? " < > |`),
- `RRRR-MM-DD` — dzisiejsza data **z kontekstu sesji** (podaje ją hook `session-context`),
  nigdy z pamięci modelu,
- `GGMM` — godzina i minuta lokalna, dwucyfrowo (np. `0907`).

Plik o tej samej nazwie już istnieje (dwa backupy w tej samej minucie) → dokładasz `_2`, `_3`.
Nigdy nie nadpisujesz istniejącego archiwum.

## Krok 3 — co wypada z archiwum

**Sekrety wypadają zawsze i nie jest to opcja do konfiguracji (D-42).** Lista wykluczeń:

| Grupa | Wzorce |
|---|---|
| Sekrety (twarde, D-42) | `.env`, `.env.*`, `*.pem`, `*.key`, `*.pfx`, `*.p12`, `id_rsa`, `id_ed25519`, `*.keystore`, `.npmrc`, `.pypirc`, `credentials.json`, `serviceAccount*.json` |
| Runtime i zależności | `node_modules`, `.venv`, `venv`, `__pycache__`, `.pytest_cache`, `dist`, `build`, `.next`, `.nuxt`, `target`, `.gradle`, `coverage`, `.turbo`, `.cache` |
| Śmieci systemowe | `.DS_Store`, `Thumbs.db`, `*.log`, `.claude/relai` *(cache specyfikacji odtwarzany przez hook)* |

Czego **nie** wykluczasz: katalogu `.git`. Historia zmian jest najcenniejszą częścią kopii
zapasowej — bez niej „recovery" jest odtworzeniem plików, nie projektu (R3).

Jeśli projekt ma `.gitignore` z dodatkowymi wpisami wyglądającymi na sekrety (`*.secret`,
`config.local.*`), dołóż je do wykluczeń i powiedz o tym jednym zdaniem. Wzorca z `.gitignore`,
który nie wygląda na sekret ani na runtime, **nie** wykluczasz sam z siebie.

## Krok 4 — spakowanie (rozstrzygnięte, nie improwizujesz)

Pakujesz **narzędziem systemowym**, bez instalowania czegokolwiek. Wybór wg systemu, w tej
kolejności:

### Windows — `bsdtar` z systemu

```powershell
& C:\Windows\System32\tar.exe -a -c -f "<KATALOG_BACKUPOW>\<NAZWA_ARCHIWUM>.zip" --exclude=node_modules --exclude=.env --exclude=.venv -C "<KATALOG_NADRZEDNY_PROJEKTU>" "<NAZWA_FOLDERU_PROJEKTU>"
```

- `-a` każe libarchive wybrać format **z rozszerzenia pliku** — `.zip` daje prawdziwy ZIP
  (nagłówek `PK\x03\x04`).
- Każde wykluczenie to osobny `--exclude=<wzorzec>`; wzorce z tabeli w Kroku 3 wpisujesz wszystkie.
- `-C <katalog nadrzędny>` + nazwa folderu projektu sprawia, że w archiwum jest **jeden katalog
  projektu**, a nie luźne pliki w korzeniu.
- Ścieżki ze spacjami i polskimi znakami zawsze w cudzysłowach.

**Wywołujesz `C:\Windows\System32\tar.exe` pełną ścieżką, nigdy samego `tar`.** W sesji, w której
`PATH` prowadzi do Git Bash, `tar` to **GNU tar** — ten nie umie ZIP-a i bez słowa ostrzeżenia
zapisze archiwum **tar** pod nazwą `.zip`. Plik otworzy się w `tar -tf`, ale nie w Eksploratorze
Windows ani w `Expand-Archive`.

**Zapasowo (Windows bez `tar.exe`, np. starsze buildy):** skopiuj projekt do folderu tymczasowego
z pominięciem wykluczeń (`robocopy <źródło> <temp> /E /XD node_modules .venv /XF .env *.pem`),
spakuj `Compress-Archive -Path "<temp>\*" -DestinationPath "<archiwum>.zip"`, skasuj folder
tymczasowy. Nie podawaj plików do `Compress-Archive` potokiem — spłaszcza strukturę katalogów.

### macOS

`tar` jest tam bsdtarem, więc działa to samo polecenie co na Windows (bez pełnej ścieżki).

### Linux

`tar` to GNU tar — **nie umie ZIP-a**. Kolejność: `zip -r <archiwum>.zip <folder> -x <wzorce>`,
a gdy `zip` nie jest zainstalowany — `python3 -m zipfile -c <archiwum>.zip <folder>` po wcześniejszym
skopiowaniu z wykluczeniami. Gdy nie ma ani jednego z tych narzędzi, powiedz to wprost i zaproponuj
instalację `zip` — nie podmieniaj formatu na `.tar.gz` po cichu.

## Krok 5 — weryfikacja archiwum (obowiązkowa)

Backup niezweryfikowany to nie backup. Sprawdź **na powstałym pliku**, nie na własnej deklaracji:

1. **Format** — pierwsze cztery bajty to `50 4B 03 04`.
2. **Zawartość** — wypisz listę wpisów: `tar -tf "<archiwum>.zip"` albo w PowerShellu
   `[System.IO.Compression.ZipFile]::OpenRead(...)` i `.Entries`.
3. **Dowód negatywny do D-42** — w liście wpisów **nie ma** `.env` ani żadnego innego wzorca
   z grupy „Sekrety". Sprawdzasz listą, nie pamięcią o tym, że dodałeś `--exclude`.
4. **Rozmiar** — archiwum ma więcej niż 0 bajtów. Porównanie z rozmiarem projektu jest tylko
   sygnałem orientacyjnym, nie progiem: przy małych projektach narzut nagłówków ZIP (zwłaszcza
   na wielu drobnych plikach `.git`) potrafi przewyższyć rozmiar źródła — rozstrzyga lista
   wpisów z punktu 2, nie liczba bajtów (L-0018).

Którykolwiek punkt nie przechodzi → **usuwasz wadliwe archiwum**, mówisz, co poszło nie tak,
i nie zapisujesz wpisu w dzienniku. Backup, który „prawie się udał", jest gorszy niż jego brak.

## Krok 6 — wpis w dzienniku (D-43)

Dopisz wpis na **końcu** sekcji „Wpisy" w `docs/DZIENNIK.md`, wg `SPEC_DZIENNIK.md` (cztery sekcje
o stałych nazwach). Treść ma odpowiadać na pytanie „czy da się z tego odtworzyć projekt":

- **Zrobione** — ścieżka archiwum, jego rozmiar, liczba wpisów.
- **Zweryfikowane — jak dokładnie** — nagłówek pliku, lista zawartości, **potwierdzony brak
  sekretów** (wymień wzorce, których szukałeś).
- **Świadomie odłożone** — co zostało poza archiwum poza standardowymi wykluczeniami.
- **Do zrobienia przez człowieka** — jeśli coś wymaga jego ręki (np. sekrety do odtworzenia
  ręcznie przy recovery — bo w archiwum ich nie ma).

## Krok 7 — podsumowanie dla użytkownika

Trzy zdania: gdzie leży plik, co w nim jest, czego w nim celowo nie ma. Plus jedno zdanie
o odtworzeniu: rozpakowanie archiwum daje projekt bez `.env` — sekrety trzeba wpisać ponownie.

---

## Zakazy tej komendy

- Nie pakujesz sekretów. Nigdy, w żadnym trybie, na żadną prośbę — poluzowanie wymaga zamrożonej
  decyzji projektu (D-42), a nie zgody w rozmowie.
- Nie pytasz o lokalizację, jeśli odpowiedź jest w ustawieniach (L-0006).
- Nie nadpisujesz istniejącego archiwum.
- Nie kasujesz starych backupów i nie proponujesz „porządków" w folderze backupów — od porządków
  jest `/relai-audit`, i tam też decyduje człowiek.
- Nie zgłaszasz backupu jako wykonanego przed weryfikacją z Kroku 5.
- Nie robisz backupu do folderu wewnątrz projektu.
