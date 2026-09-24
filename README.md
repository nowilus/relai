<p align="center">
  <img src="docs/zasoby/branding/banner.svg" alt="RelAI — Twój projekt pamięta wszystko" width="900">
</p>

<p align="center">
  <em>Wersja 2.6.0 &nbsp;·&nbsp; licencja MIT &nbsp;·&nbsp; Claude Code, Cursor albo Codex, plus Node.js 14+ &nbsp;·&nbsp; zero zależności npm</em>
</p>

**RelAI zamienia rozmowę z agentem w prowadzony projekt.** Ustalenia, decyzje, stan prac i historia
zostają w plikach obok kodu, a nie w kontekście sesji, który za chwilę zniknie. Nowa sesja zaczyna
od przeczytania, gdzie naprawdę jest praca, zamiast pytać Cię od nowa.

## Instalacja i pierwsze kroki

**Claude Code** — dwie komendy w terminalu, raz na maszynę:

```bash
claude plugin marketplace add nowilus/relai
```

```bash
claude plugin install relai@relai
```

Potem otwórz Claude Code w folderze projektu i napisz na przykład:

```text
zacznijmy projekt
```

RelAI zapyta o zgodę, zada **trzy pytania** naraz (język, git, rodzaj projektu — każdy rodzaj
z jednym zdaniem objaśnienia) i założy osiem plików: `CLAUDE.md`, `README.md` oraz w `docs/` stan,
dziennik, lekcje, decyzje, ustawienia i ściągę komend. Od tej chwili piszesz normalnie — dokumenty
aktualizują się w ramach pracy.

Odmowa jest ostateczna: w tym folderze RelAI więcej się nie zaproponuje. Plugin działa w każdym
folderze na koncie, ale pliki powstają wyłącznie tam, gdzie się zgodzisz.

**Cursor i Codex** instalują się inaczej (adapter per projekt, plugin z repozytorium) — instrukcja
krok po kroku i aktualizacja dla wszystkich trzech narzędzi: [docs/INSTALACJA.md](docs/INSTALACJA.md).

**Masz już projekt?** `/relai-adopt` przenosi go na strukturę RelAI: najpierw pełny backup, potem
plan zmian do Twojej zgody; kod zostaje nietknięty.

## Zobacz, jak to działa

<p align="center">
  <img src="docs/zasoby/demo/demo-relai-25s-pl.gif" alt="RelAI: plan jako dokument, etapy, świeża sesja wracająca do pracy" width="420">
</p>

Plan jako osobny dokument, etapy ze statusami, a po przerwie świeża sesja mówi, który etap jest
gotowy do startu i z którego pliku to wie. Materiał odtwarza zapis prawdziwych sesji; opis,
wersja angielska i dłuższe cięcie: [docs/zasoby/demo/](docs/zasoby/demo/).

## Na co dzień

Trzy zdania wystarczą do większości pracy:

| Powiesz | Co się stanie |
|---|---|
| „kontynuujemy pracę" | RelAI czyta dokumenty, mówi, gdzie jesteśmy, i proponuje najbliższy krok |
| „sprawdź status" | krótki raport: stan, plany, otwarte ryzyka, zaległości w dokumentach |
| „kończymy na dziś" | dokumenty zsynchronizowane, wpis do dziennika, ryzyka odświeżone, propozycja commita |

„Przygotuj plan…" daje plan jako osobny dokument: warianty, ryzyka, etapy, przypadki brzegowe. Po
akceptacji plan jest zamrożony, a `/relai-stage` uruchamia kolejny etap — zawsze po Twoim „tak".

Czternaście komend `/relai-*` to skróty rzadszych operacji (backup, audyt, przekazanie projektu,
optymalizator promptów…). Pełna lista: `/relai-help` albo [przewodnik](docs/PRZEWODNIK.md#komendy).
W Claude Code komendy mają pełną nazwę `/relai:relai-<nazwa>`.

## Zanim zaczniesz: jakość zależy od modelu

RelAI to w większości instrukcje dla modelu. Kryterium odbioru są modele klasy **`strong`**
i **`balanced`** z listy narzędzia (dziś w Claude Code: Opus 5.5, Fable 5.1, Sonnet 5). Na słabszych
modelach pamięć projektu zostaje w plikach, a sygnały startu niesie hook, ale procedury bywają
niepełne — rytuał skrócony, skill niewyzwolony. Adopcję istniejącego projektu i etapy planu
prowadź na modelu `strong`.

## Co pilnuje tylko Claude Code

Twarde mechanizmy to **hooki** — skrypty uruchamiane przez narzędzie, nie przez model. Claude Code
ma ich jedenaście; Cursor i Codex po części. Tam, gdzie hooka nie ma, zasada stoi wyłącznie na
pamięci modelu — reguła w kontekście, bez blokady.

| Hook Claude Code | Co robi | Cursor | Codex |
|---|---|---|---|
| `secret-scanner` | blokuje zapis klucza do pliku śledzonego przez gita | hook | hook |
| `config-protection` | zmiana reguł projektu lub ustawień wraca jako pytanie; konfiguracja produkcyjna wymaga kopii stanu | reguła | tylko pamięć modelu |
| `session-context` | na starcie: data, rytuał startu, wersja, sygnały wymagające reakcji | hook | hook |
| `doc-sync-reminder` | zmiana kodu bez wpisu do dziennika kończy się przypomnieniem | reguła | przypomnienie na końcu sesji |
| `journal-signature` | pilnuje formatu podpisu wpisu dziennika | tylko pamięć modelu | tylko pamięć modelu |
| `profile-rules` | pierwszy plik kodu, ekran czy wdrożenie tworzy właściwy dokument | reguła | tylko pamięć modelu |
| `prompt-mode` | tryb ciągły optymalizatora promptów i jego pytanie o zgodę | brak trybu | brak trybu |
| `quality-gate` | `tsc` i eslint po edycji, gdy projekt je ma | brak | brak |
| `console-log-warn` | ostrzega o `console.log` w zapisanym pliku | brak | brak |
| `design-quality-check` | sygnalizuje odstępstwo od `docs/DESIGN.md` | brak | brak |
| `auto-format` | Prettier na zmienionych plikach, gdy projekt go ma | brak | brak |

Poza projektem RelAI każdy hook milczy. Commit z sekretem zatrzymuje w każdym narzędziu opcjonalny
gitowy pre-commit — [przewodnik](docs/PRZEWODNIK.md#skan-sekretów-przy-commicie-opcjonalny-poza-harnessem).

## Słowniczek

| Pojęcie | Znaczy |
|---|---|
| **hook** | skrypt, który narzędzie uruchamia samo przy zdarzeniu (start sesji, zapis pliku) — działa bez względu na to, co pamięta model |
| **skill** | plik z procedurą, który model wczytuje, gdy temat rozmowy do niego pasuje |
| **etap** | część planu wykonywana w jednej świeżej sesji według gotowego promptu |
| **aneks** | datowana zmiana zamrożonego planu — plan nie jest przepisywany po cichu |
| **odnoga** | boczny wątek odłożony z etapu na osobną kartę z promptem dla świeżej sesji (`/relai-branch`) |
| **rotacja** | przeniesienie najstarszej historii z dziennika czy lekcji do `docs/archiwum/` — w całości, z linkiem |
| **D-NN** | numer decyzji w `docs/DECYZJE.md` (np. D-90); decyzja zamrożona nie wraca jako propozycja |
| **L-NNNN** | numer lekcji w `docs/LEKCJE.md` — Twojej korekty zapisanej jako zasada pracy |

## Dalej

- [Przewodnik](docs/PRZEWODNIK.md) — co RelAI robi i czego nie robi, komendy, plany, dowody działania,
  struktura repozytorium, konwencje hooków.
- [Instalacja i aktualizacja](docs/INSTALACJA.md) — Claude Code, Cursor, Codex.
- [Przenośność](docs/PRZENOSNOSC.md) — co Cursor i Codex realnie dają.

<details>
<summary><strong>English summary</strong></summary>

RelAI is a documentation-first process framework for Claude Code, Cursor and Codex. Your project's
state, decisions, lessons and plans live in plain Markdown files next to the code, so every new
session starts by reading where the work actually is. Install with
`claude plugin marketplace add nowilus/relai` and `claude plugin install relai@relai`, open a project
folder and say "start project". Documentation is generated in the project's language; this README
and the plugin's own docs are Polish.

</details>

## Feedback

RelAI jest po pilotażu, ale przed spotkaniem z cudzymi nawykami pracy — i to jest teraz
najciekawsza część. Jeśli coś nie zadziałało, zadziałało inaczej niż się spodziewałeś albo
przeszkadzało: **nowakowskilukasznl@gmail.com**.

Najbardziej przydatne zgłoszenie zawiera wersję pluginu (`docs/USTAWIENIA.md` w Twoim projekcie),
model, na którym pracowałeś, oraz to, co miało się stać i co się stało zamiast tego.

## Licencja

MIT — patrz [LICENSE](LICENSE). Używaj, zmieniaj, wdrażaj u siebie, także komercyjnie. Bez żadnej
gwarancji.
