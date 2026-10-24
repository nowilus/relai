---
name: relai-security
description: "Scans the project's code dependencies for known vulnerabilities with Trivy, shows the counts by severity and an update plan, records new CRITICAL and HIGH findings as risks in the journal and updates packages only after a yes; with --full it runs the full multi-agent security audit of the code (Cloudflare security-audit) after a cost warning and a yes — code and dependencies, not documents. Use when the person asks about the security of dependencies or code — „przeskanuj zależności”, „sprawdź podatności”, „bezpieczeństwo zależności”, „pełny audyt bezpieczeństwa”, „scan dependencies for vulnerabilities”."
---


# /relai-security — skan zależności i ryzyka w dzienniku

Twoje zadanie: **sprawdzić zależności kodu projektu** — nie dokumenty (od dokumentów jest
`/relai-audit`). Komenda kończy się planem aktualizacji i pytaniem; żadna paczka, plik blokady ani
`.trivyignore` nie zmienia się przed „tak” człowieka (D-45).

Argument `--full` → zamiast Kroków 1–4 wykonujesz sekcję **„Tryb --full — pełny audyt kodu”** na
końcu tego pliku (Krok 0 obowiązuje w obu trybach). Bez argumentu — skan Trivy jak niżej.

---

## Krok 0 — tryb pracy

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku):

- **jest** → tryb projektu: skan, raport i zapis ryzyk do `docs/DZIENNIK.md` (Krok 3);
- **brak** → **tryb gościa**: skan i raport działają, ale do dokumentów RelAI nic nie zapisujesz —
  raport zostaje wyłącznie w `.security/trivy/`. Powiedz to jednym zdaniem i pomiń Krok 3.

## Krok 1 — skan

Wczytaj skill **`trivy-scan`** (narzędzie Skill) — tam mieszka skrypt i procedura. Skrypt uruchamiasz
z katalogu skilla podanego w linii „Base directory for this skill”, na korzeniu projektu:

```bash
node "<katalog skilla>/scripts/scan.mjs" --path <korzeń projektu> --json
```

Wynik `--json` niesie `counts`, `delta` (nowe i rozwiązane od poprzedniego skanu) i `plan` — na
każdą paczkę: `pkg`, `installed`, `fixTo`, `severity`, `ids` (identyfikatory advisory), `target`
(plik blokady), `relationship`, `via`, `majorBump`. Pełny raport ląduje w
`.security/trivy/REPORT.md`; folder ma własny `.gitignore`, więc raport nie trafi do commita.

Sytuacje, w których skan nie daje wyniku:

| Sytuacja | Co robisz |
|---|---|
| `trivy not found` | mówisz, że Trivy nie ma, i proponujesz instalację wg skilla — **dopiero po „tak”**, wyłącznie z oficjalnego źródła. Do tego czasu zapas: komenda audytu ekosystemu z pliku `first-deploy.md` skilla `relai-core` (`npm audit --omit=dev`, `pip-audit`, `bundle audit`, `govulncheck ./...`, `cargo audit`); jej wynik raportujesz tak samo, ale ryzyk w Kroku 3 nie zamykasz — inne narzędzie, inne identyfikatory |
| skilla `trivy-scan` nie ma w tym narzędziu (Codex i Cursor przed kolejnym wydaniem) | zapas jak wyżej: komenda audytu ekosystemu, i jedno zdanie, że pełny skan Trivy działa dziś w Claude Code |
| baza podatności się nie pobrała (brak sieci) | mówisz to jednym zdaniem; zapas jak wyżej, z warunkiem wykonalności |
| zero wyników, a w projekcie jest manifest bez pliku blokady | nazywasz brakujący plik (np. `package.json` bez `package-lock.json`) i nie wpisujesz ryzyka |
| kod wyjścia 2 | czytasz komunikat i mówisz go wprost; niczego nie zgadujesz |

## Krok 2 — raport na ekranie

Kolejność stała:

1. **Werdykt jednym zdaniem** — suma i liczby według wagi, plus „N nowych / M rozwiązanych od
   <data>”, gdy jest poprzedni skan.
2. **Plan aktualizacji** — tabela od najwyższej wagi: paczka, jest → cel, waga, czy zmiana głównej
   wersji, bezpośrednia czy „przez X”, plik blokady, liczba advisory. Uwagę skryptu o podniesionej
   albo niesprawdzonej wersji docelowej piszesz przy tej paczce.
3. **Bez poprawki** — jedno zdanie o podatnościach, dla których nie ma nowszej wersji.
4. Ścieżka do `REPORT.md`.

Nic do poprawienia → jedno zdanie i przechodzisz do Kroku 3 (zamknięcia ryzyk mogą nadal być).

## Krok 3 — ryzyka w dzienniku (tylko tryb projektu)

Tabela „Stan otwartych ryzyk” w `docs/DZIENNIK.md`. Do tabeli idą **wyłącznie advisory CRITICAL
i HIGH** — niższe wagi zostają w raporcie. Wagę **pojedynczego** advisory czytasz z
`.security/trivy/latest-summary.json` (tablica `vulns`: `id`, `pkg`, `target`, `severity`,
`title`), nie z `plan` — lista `ids` w planie łączy identyfikatory wszystkich wag jednej paczki.

**Klucz** = identyfikator advisory + paczka + plik blokady. **Wiersz** = paczka + plik blokady,
a w nim lista kluczy tej paczki (Aneks A planu BEZPIECZENSTWO). Komórka „Ryzyko” wiersza tej
komendy ma stałe brzmienie, od początku komórki:

```
`<paczka>` · `<plik blokady>` — podatna zależność: `<ID>`, `<ID>`, …
```

Klucz jest „w tabeli”, gdy istnieje wiersz z tym początkiem komórki (`<paczka>` i `<plik blokady>`)
i z tym identyfikatorem w backtickach. Kolejne uruchomienie z tymi samymi kluczami **nie zmienia
tabeli**.

| Sytuacja | Zapis |
|---|---|
| nowy klucz, bez decyzji w `docs/DECYZJE.md` o tym advisory, a paczka + plik nie mają wiersza | nowy wiersz: numer `Z<n>` (kolejny wolny wśród `Z` w tabeli i w `docs/archiwum/ryzyka/`), poziom = najwyższa waga jego advisory, status `OTWARTE`, mitygacja = plan „jest → cel” (z „zmiana głównej wersji”, gdy `majorBump`) albo „brak poprawki — obserwowane, zamknie je skan, który go nie zobaczy” |
| nowy klucz, a wiersz paczki + pliku już jest (`OTWARTE`) | dopisujesz identyfikator na końcu listy; poziom i mitygację podnosisz, gdy nowy advisory je zmienia |
| klucz już w tabeli | nic nie zmieniasz |
| skan Trivy (nie zapas) nie widzi **żadnego** klucza wiersza | status → `ZAMKNIĘTE <data>` z jednym zdaniem: „skan <data> nie widzi tych advisory” |
| decyzja w `DECYZJE.md` akceptuje advisory | klucza nie dopisujesz; wiersz, którego wszystkie klucze są zaakceptowane, przechodzi w `ZAMKNIĘTE <data>` z odesłaniem do decyzji |

Zmiana w tabeli → wpis w `docs/DZIENNIK.md` w tej samej turze (D-44), z liczbami ze skanu. Żadnej
zmiany → bez wpisu.

## Krok 4 — pytanie o aktualizację

Jedno pytanie (AskUserQuestion, gdy jest) z opcjami ze skilla `trivy-scan`: wszystko bez zmiany
głównej wersji (rekomendowane) / wszystko łącznie z główną / wybrane paczki / zostaw jako raport.

Po „tak” prowadzisz aktualizację **procedurą skilla** (`references/fixing.md`): menedżer pakietów,
nie ręczna edycja pliku blokady; potem testy projektu i ponowny skan z liczbami przed → po, a po nim
Krok 3 jeszcze raz (zamknięcia).

Pełny audyt kodu (wiele agentów) uruchamia `/relai-security --full` — niżej.

---

## Tryb --full — pełny audyt kodu

Pełny audyt bezpieczeństwa kodu według skilla **`security-audit`** (Cloudflare, MIT; kopia 1:1
w pluginie, nota w `RELAI-NOTICE.md` skilla). Kosztowny — wielu agentów — dlatego uruchamiasz go
**wyłącznie na żądanie i po „tak”**.

### F1 — karta kosztu i zgoda

Wczytaj skill `security-audit` (narzędzie Skill) i ustal z jego sekcji „Run profiles and scope”
oraz „Cost budget” profil: `quick` dla małego projektu albo pierwszego przebiegu, `standard`
domyślnie, `deep` dla dużego albo krytycznego. Zanim cokolwiek uruchomisz, pokaż kartę:

- **koszt** — zdanie dosłownie: „Pełny audyt uruchamia wielu agentów: <N–M> wywołań przy profilu
  <profil> (cztery rozpoznania, łowcy, krytycy pokrycia, weryfikatorzy) — to zużyje wyraźną część
  limitu sesji.” Liczby szacujesz z rozmiaru projektu wg sekcji „Cost budget” skilla i oznaczasz
  jako SZACUNEK; człowiek może podać budżet (maksymalna liczba wywołań agentów);
- **zakres** — korzeń projektu albo ścieżki, które człowiek wskaże;
- **gdzie powstaną pliki** — `.security/security-audit/run-<N>/` w projekcie (pierwszy wolny `N`);
  ta odpowiedź „tak” jest jawnym wyborem katalogu wewnątrz projektu, którego skill wymaga;
- **piaskownica** — RelAI nie zapewnia piaskownicy systemowej, której skill wymaga do uruchamiania
  kodu projektu, więc audyt jest **wyłącznie źródłowy**: zachowanie, którego nie da się ustalić
  z kodu, kończy się rekordem `needs_validation` (zasada skilla „Universal execution safety”);
- **walidatory** — która droga z F3 obowiązuje na tej maszynie.

Pytanie: zaczynamy z tym profilem i budżetem / zmień profil albo zakres / nie teraz. Bez „tak”
nie tworzysz katalogu ani nie uruchamiasz agenta.

### F2 — przebieg

1. Utwórz `.security/security-audit/` z plikiem `.gitignore` o treści `*` (jak `.security/trivy/`)
   i sprawdź `git check-ignore -q .security/security-audit/run-<N>/findings.json` — katalog
   nieignorowany → zatrzymaj się i powiedz to; skill zabrania wtedy zapisu w projekcie.
2. Prowadź pełny audyt **dosłownie wg skilla**: tryb „Full audit mode”, sześć faz w kolejności,
   katalog wyjściowy z punktu 1, profil i budżet z F1 w `run-metadata.json`. Kodu skilla nie
   zmieniasz i nie skracasz faz.
3. Kod projektu się nie wykonuje (F1, piaskownica) — także „żeby sprawdzić”.

### F3 — walidatory skilla

Fazy 4 i 5 wymagają `validate-findings.cjs` i `validate-coverage-ledger.cjs`. Na Windowsie CLI
upstreamu odmawia odczytu („OS no-follow and nonblocking input protection is unavailable”) —
Node na Windowsie nie ma flag `O_NOFOLLOW` i `O_NONBLOCK`. Droga zależy od systemu:

| System | Droga | Adnotacja w raporcie |
|---|---|---|
| macOS, Linux | CLI skilla: `node "<katalog skilla>/validate-findings.cjs" <plik>` i `validate-coverage-ledger.cjs` | brak |
| Windows z WSL (`wsl -e node --version` działa) | to samo CLI przez WSL: `wsl -e node <ścieżka skilla w /mnt/…> <plik w /mnt/…>` (ścieżki z `wslpath`) | „Walidatory uruchomione przez WSL.” |
| Windows bez WSL | wrapper RelAI: `node "<katalog skilla>/RELAI-validate.cjs" findings <plik>` i `… ledger <plik>` — ten sam schemat i semantyka, bez zabezpieczeń odczytu CLI | zdanie niżej |

Ścieżki do Node podajesz z ukośnikami `/`. Na Windowsie bez WSL **pierwszy akapit `REPORT.md`**
zaczyna się dosłownie od zdania: „Walidatory formatu uruchomiono przez wrapper RelAI
(`RELAI-validate.cjs`), bo na Windowsie bez WSL CLI walidatorów Cloudflare odmawia odczytu pliku:
schemat i semantyka sprawdzone, zabezpieczenia odczytu CLI (bez dowiązań, limit tekstu) pominięte.”
Wrapper też zawodzi → walidacji nie było: zdanie „Sprawdzenia formatu nie było: <powód>.” w tym
samym miejscu i `run_status: "incomplete"` wg skilla.

### F4 — wynik

Na ekranie: profil, liczba wywołań agentów, liczby rekordów `confirmed` według wagi,
`needs_validation`, `rejected`, droga walidatorów i ścieżki `REPORT.md` oraz `findings.json`.
Tryb projektu: rekord `confirmed` o wadze `critical` albo `high` → wiersz ryzyka w tabeli „Stan
otwartych ryzyk” (`docs/DZIENNIK.md`) z odesłaniem do `findings.json` i wpis w dzienniku w tej
samej turze (D-44); kod projektu poprawiasz dopiero po „tak”, osobnym zadaniem. Tryb gościa:
nic poza `.security/security-audit/`.

---

## Zakazy tej komendy

- Nie zmieniasz paczek, plików blokady, manifestów ani `.trivyignore` przed „tak”.
- Nie używasz `npm audit fix --force` ani innego przełącznika „napraw wszystko” — przeskakuje
  główne wersje bez pytania.
- Nie dopisujesz advisory do `.trivyignore` i nie obniżasz wagi bez decyzji człowieka w
  `docs/DECYZJE.md` — ukrycie podatności to decyzja o ryzyku, nie techniczna.
- Nie instalujesz niczego globalnie, żeby skan zadziałał — instalacja Trivy tylko po „tak”.
- W trybie gościa nie zapisujesz nic poza `.security/trivy/` (a w trybie `--full` poza
  `.security/security-audit/`).
- Nie uruchamiasz pełnego audytu bez karty kosztu i „tak”; nie zmieniasz plików skilla
  `security-audit`.
- Nie dublujesz wiersza ryzyka: ten sam klucz to ten sam wiersz.
