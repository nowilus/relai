# Instalacja i aktualizacja RelAI

Pełna instrukcja dla trzech narzędzi — przeniesiona z `README.md` w wydaniu 2.7.0. Skrót dla
Claude Code stoi na górze [README](../README.md).

## Wymagania

- Claude Code (dowolny klient: terminal, aplikacja, IDE) **albo Cursor**, **albo Codex** — jedno z trzech wystarczy;
  trzy ścieżki instalacji opisuje sekcja [Instalacja](#instalacja),
- Node.js 14+ w `PATH` — hooki są zwykłymi skryptami Node bez zależności npm; w Cursorze bez Node.js
  czytaj [Cursor bez Node.js](#cursor-bez-nodejs),
- git (opcjonalnie, ale bez niego znika siatka bezpieczeństwa historii zmian).

## Instalacja

RelAI działa w trzech narzędziach i instaluje się w nich **inaczej**. Wybierz swoją ścieżkę —
pozostałych narzędzi nie potrzebujesz.

| | Claude Code | Cursor | Codex |
|---|---|---|---|
| Co instalujesz | plugin z marketplace'u | adapter z repozytorium | plugin z repo-marketplace'u |
| Zasięg instalacji | **raz na maszynę**, działa w każdym folderze | **raz na projekt**, pliki lądują w projekcie | plugin z repo-marketplace'u, raz na maszynę |
| Potrzebne repozytorium RelAI na dysku | nie | **tak** — hooki wskazują jego ścieżkę | marketplace lokalny lub repozytorium |
| Aktualizacja | `claude plugin update relai@relai` + restart — [instrukcja](#aktualizacja) | `git pull` w repo RelAI + ponowny instalator w projektach — [instrukcja](#aktualizacja) | `codex plugin marketplace upgrade` + reinstall — [instrukcja](#aktualizacja) |

### A. Claude Code — plugin

**1.** Dodaj źródło pluginu:

```bash
claude plugin marketplace add nowilus/relai
```

**2.** Zainstaluj:

```bash
claude plugin install relai@relai
```

(Wewnątrz sesji Claude Code te same dwa kroki to `/plugin marketplace add nowilus/relai`
i `/plugin install relai`.)

**3.** Otwórz Claude Code w folderze projektu i napisz cokolwiek. RelAI rozpozna folder i zapyta,
czy założyć strukturę. **Odmowa jest ostateczna** — plugin zapisuje marker trybu gościa i nie
wraca do tematu w tym folderze.

> **Plugin instaluje się dla całego konta, nie dla jednego projektu.** Tak działają pluginy Claude
> Code i Codeksa: po instalacji RelAI jest dostępny w **każdym** folderze, który otworzysz — i w
> każdym nowym zapyta raz, czy założyć strukturę. Dokumenty projektu powstają wyłącznie tam, gdzie
> się na to zgodzisz; poza nimi nie powstaje ani jeden plik, a hooki milczą aż do markera
> `Wersja RelAI`. Nie chcesz tego pytania nigdzie poza swoimi projektami RelAI? Przy pierwszej
> odmowie wybierz **„nigdy poza projektami RelAI"** — zapisze się wiersz
> `Propozycja RelAI poza projektem` w `~/.claude/relai/USTAWIENIA.md` i temat zamknie się na całej
> maszynie. Adapter Cursora działa inaczej: instalujesz go per projekt, więc nie widzi niczego poza
> nim.

> **Aktualizacja pluginu:** pełna instrukcja krok po kroku jest w sekcji
> [„Aktualizacja"](#aktualizacja) niżej — łącznie z obowiązkowym restartem aplikacji.

### B. Cursor — adapter (bez Claude Code)

Cursor nie ma marketplace'u pluginów, więc RelAI mieszka u Ciebie jako **zwykłe repozytorium**,
a instalator kładzie w projekcie reguły, komendy, skille i hooki. Claude Code nie jest do niczego
potrzebny.

**1. Sprawdź Node.js** — hooki (skan sekretów, kontekst startu sesji) to skrypty Node bez żadnych
zależności:

```bash
node -v
```

Wersja 14 lub nowsza wystarczy. Nie masz Node.js? Czytaj niżej „Cursor bez Node.js" — instalacja
jest możliwa, ale z jawnie mniejszą ochroną.

**2. Sklonuj repozytorium RelAI** w miejsce, z którego **nie będziesz go przenosić** — wpisy
w `.cursor/hooks.json` wskazują ścieżkę bezwzględną, więc przeniesienie katalogu wymaga ponownej
instalacji we wszystkich projektach:

```bash
git clone https://github.com/nowilus/relai.git C:/Narzedzia/relai
```

(macOS i Linux: `git clone https://github.com/nowilus/relai.git ~/narzedzia/relai`.)

**3. Utwórz folder projektu**, jeśli jeszcze go nie masz — instalator wymaga **istniejącego**
katalogu i sam go nie zakłada:

```bash
mkdir C:/Users/<Ty>/Desktop/MojProjekt
```

**4. Uruchom instalator**, wskazując folder projektu:

```bash
node C:/Narzedzia/relai/adapters/cursor/install.js C:/Users/<Ty>/Desktop/MojProjekt
```

Instalator wypisze, co położył: trzy reguły `.cursor/rules/relai-*.mdc`, czternaście komend
`/relai-*`, dwa skille, specyfikacje dokumentów w `.claude/relai/templates/` i dwa wpisy
w `.cursor/hooks.json`. Cudze wpisy w `hooks.json` zostają nietknięte.

**5. Otwórz folder w Cursorze i zrestartuj aplikację** — hooki wczytują się przy starcie, więc
projekt otwarty przed instalacją nadal ich nie ma.

**6. Nowy czat, jedno zdanie:**

```text
zacznijmy projekt
```

RelAI zapyta o zgodę, zada **dokładnie trzy** pytania (język, git, rodzaj projektu) i wygeneruje
`CLAUDE.md`, `README.md` oraz `docs/` z sześcioma dokumentami. Od tego momentu piszesz normalnie —
dokumenty aktualizują się w ramach pracy.

**Kolejny projekt:** powtarzasz wyłącznie krok 4 ze ścieżką nowego folderu. Repozytorium RelAI
klonujesz raz.

**Aktualizacja:** pełna instrukcja krok po kroku jest w sekcji [„Aktualizacja"](#aktualizacja)
niżej. Instalator jest idempotentny — ponowne uruchomienie nie mnoży wpisów.

**Deinstalacja:** `node C:/Narzedzia/relai/adapters/cursor/install.js <projekt> --uninstall` —
usuwa dokładnie to, co położył instalator. `docs/`, `CLAUDE.md` i cache specyfikacji zostają,
bo dokumenty projektu należą do projektu.

#### Cursor bez Node.js

Warstwa dokumentowo-procesowa (reguły, komendy, skille, specyfikacje) to pliki tekstowe i działa
w całości. Guardrail wymagający Node.js zachowuje się natomiast **twardo**: opakowanie powłoki,
przez które wołany jest skan sekretów, przy braku interpretera kończy się kodem blokującym, więc
agent nie zapisze żadnego pliku. To jest świadome — Cursor ignoruje niewykonalny hook **bez słowa**
(zmierzone), a cicha degradacja guardraila jest gorsza niż jawna blokada.

Świadoma rezygnacja z tego guardraila:

```bash
node C:/Narzedzia/relai/adapters/cursor/install.js <projekt> --bez-skanu
```

Wtedy wpis `preToolUse` w ogóle nie powstaje, a instalator mówi wprost, że twardej blokady nie ma.
Zostaje reguła `relai-guardrails.mdc` — słabsza, bo zależy od dyscypliny modelu. Trzecia droga,
gdy Node jest, ale nie ma go w `PATH` sesji: zmienna `RELAI_NODE` wskazująca interpreter.

### C. Codex — natywny plugin (2.0.0; kompatybilność Codexa od 1.10.0)

Codex korzysta z repozytorium jako korzenia pluginu: `.codex-plugin/plugin.json`,
`.agents/plugins/marketplace.json`, `adapters/codex/skills/` generowane deterministycznie z adaptera
Claude Code i `hooks/hooks.json` — hooki Codeksa mają bramkę hosta, więc pod Claude Code milczą
i nie dublują hooków adaptera ([P-013](PULAPKI.md)). Dla projektu używanego przez Codex instalator D-86 tworzy router `AGENTS.md`,
przenosi zastaną treść do kopii i zostawia `CLAUDE.md` jako wskaźnik.

```bash
codex plugin marketplace add C:/Narzedzia/relai
codex plugin add relai@relai
node C:/Narzedzia/relai/adapters/codex/install.js C:/Users/<Ty>/Desktop/MojProjekt
```

Hook startu dostarcza kontekst wyłącznie projektom z markerem RelAI, a `PreToolUse` skanuje zapisy
niezależnie od reguły modelowej. Szczegóły dowodów i ograniczeń adaptera są w
[`docs/PRZENOSNOSC.md`](PRZENOSNOSC.md). Adapter jest wydany i stabilny od 2.0.0; pełna macierz
cross-tool pozostaje częściowo niezmierzona — co dokładnie, mówi `docs/STATE.md`.

## Aktualizacja

Wydaliśmy nową wersję i chcesz ją mieć u siebie? Znajdź swoje narzędzie niżej — kroki są takie
same niezależnie od tego, jaką wersję masz teraz, i możesz je bezpiecznie powtórzyć, jeśli coś nie
zadziała za pierwszym razem.

### A. Claude Code

**Gdzie wkleić:** dowolny terminal na Twoim komputerze — na Windows to **PowerShell** albo
**Wiersz poleceń (cmd)**, na macOS/Linux **Terminal**. Komenda `claude` działa identycznie
w każdym z nich, więc nie musisz się zastanawiać, który akurat masz otwarty.

**1.** Otwórz terminal i wklej:

```bash
claude plugin update relai@relai
```

(Samo `relai` bez `@relai` nie zadziała — `@relai` to nazwa źródła, z którego plugin pochodzi;
bez niej komenda nic nie robi i nie zgłasza błędu.)

**2.** Zamknij **całą** aplikację Claude Code i otwórz ją ponownie. Ten krok jest obowiązkowy —
sesja, która już działa, nie widzi nowej wersji, dopóki jej nie zrestartujesz.

**3.** Sprawdź, czy się udało:

```bash
claude plugin list
```

Powinieneś zobaczyć przy `relai` numer najnowszej wersji. Nie wiesz, jaki numer jest aktualny? Zapytaj
osobę, która Cię do testów zaprosiła.

**Alternatywa bez terminala** — wewnątrz sesji Claude Code (czyli w oknie czatu, gdzie normalnie
piszesz do RelAI) wklej:

```text
/plugin update relai@relai
```

To ta sama operacja co komenda terminalowa z kroku 1, tylko wykonana z poziomu rozmowy. Krok 2
(restart aplikacji) nadal obowiązuje.

### B. Cursor

**Gdzie wkleić:** terminal ustawiony w katalogu, w którym sklonowałeś RelAI przy instalacji
(domyślnie `C:/Narzedzia/relai` na Windows albo `~/narzedzia/relai` na macOS/Linux). Może to być
terminal wbudowany w Cursora (skrót `` Ctrl+` ``) albo zwykły terminal systemowy — działają tak samo.

**1.** Pobierz nową wersję repozytorium:

```bash
cd C:/Narzedzia/relai
git pull
```

(macOS/Linux: `cd ~/narzedzia/relai && git pull`.)

**2.** Dla **każdego** projektu, w którym masz adapter RelAI, uruchom ponownie instalator —
podmień ścieżkę na swój projekt:

```bash
node C:/Narzedzia/relai/adapters/cursor/install.js C:/Users/<Ty>/Desktop/MojProjekt
```

Instalator jest bezpieczny do wielokrotnego uruchamiania — nadpisuje stare pliki nowymi, nie
duplikuje wpisów.

**3.** Zrestartuj Cursora w każdym z tych projektów.

### C. Codex

**Gdzie wkleić:** terminal systemowy (PowerShell/cmd na Windows, Terminal na macOS/Linux) — Codex
nie ma odpowiednika tej operacji w czacie.

**1.** Pobierz nową wersję repozytorium (ta sama ścieżka co przy instalacji):

```bash
cd C:/Narzedzia/relai
git pull
```

**2.** Odśwież plugin z marketplace'u:

```bash
codex plugin marketplace upgrade
codex plugin add relai@relai
```

**3.** Dla każdego projektu z adapterem Codex uruchom ponownie instalator:

```bash
node C:/Narzedzia/relai/adapters/codex/install.js C:/Users/<Ty>/Desktop/MojProjekt
```

**4.** Zrestartuj Codex.
