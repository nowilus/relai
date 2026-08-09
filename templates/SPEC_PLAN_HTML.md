# SPEC_PLAN_HTML — jak wygenerować plan główny w HTML

Dotyczy dokumentu: **`docs/plany/<TEMAT>/PLAN.html`**, gdy `docs/USTAWIENIA.md` (albo warstwa
globalna) mówi, że plany główne powstają w HTML.

**Struktura treści jest ta sama co w [`SPEC_PLAN.md`](SPEC_PLAN.md)** — dziesięć sekcji w stałej
kolejności, etykiety FAKT/SZACUNEK, jawny werdykt przy każdym wariancie. Ta specyfikacja nie
zmienia ani jednej reguły merytorycznej; opisuje wyłącznie, **czym** te sekcje wypełnić i **jak**
złożyć plik. Gdy obie mówią co innego o treści, rozstrzyga `SPEC_PLAN.md`.

W HTML powstaje **wyłącznie plan główny**. `STATUS.md`, prompty etapowe i MINIPLAN-y zostają
w Markdown (D-32) — HTML jest dla ludzi, Markdown dla agentów.

## Szablon jest repertuarem, nie rusztowaniem

Stałe jest dwoje: **dziesięć sekcji merytorycznych** (`SPEC_PLAN.md` — plan bez wariantów, ryzyk
czy etapów przestaje być planem) i **wygląd** każdego elementu, żeby wszystkie plany w projekcie
czytało się tak samo. Wszystko poza tym jest do wyboru.

Komponenty z `komponenty.html` — karteczka na marginesie, diagram przepływu, wykres słupkowy,
symulator ze skryptem — wstawiasz **tylko wtedy, gdy niosą treść tego planu**. Plan bez wyliczeń
nie ma symulatora; plan o jednym przepływie nie potrzebuje diagramu; sekcja bez zaskoczeń nie
potrzebuje karteczki. Każdy plan składasz osobno pod jego własne potrzeby — pusty komponent
wstawiony „bo szablon go ma" zabiera uwagę i niczego nie mówi.

Sekcja, w której naprawdę nie ma treści (typowo 9 — decyzje dla człowieka), dostaje jedno zdanie
albo `—`; nie usuwasz jej i nie wypełniasz watą.

## Skąd wziąć szablon

| Plik | Co zawiera |
|---|---|
| `HTML_PLAN/szablon.html` | szkielet: design tokens, wszystkie komponenty w CSS, pasek, szyld, dziesięć pustych sekcji, skrypt |
| `HTML_PLAN/komponenty.html` | gotowe fragmenty do wklejenia: karteczka, listy celów, tabela, karta wariantu, diagram, wykres, symulator, skrypt symulatora |
| `HTML_PLAN/zbuduj.js` | osadza fonty w gotowym pliku (Node, zero zależności) |
| `HTML_PLAN/fonty/` | sześć podzbiorów WOFF2 (Kalam 400/700, Hanken Grotesk) |

Kolejność jest wiążąca:

1. **`docs/zasoby/HTML_PLAN/`** — nadpisanie lokalne projektu (D-62). Istnieje → używasz go
   i nie zaglądasz dalej.
2. **`.claude/relai/templates/HTML_PLAN/`** — kopia z pluginu, utrzymywana przez hook
   `session-context`. Katalog samego pluginu jest dla sesji niedostępny (L-0012).
3. Nie ma ani jednego → powiedz o tym wprost i poproś o uruchomienie sesji z `--add-dir`
   na katalog pluginu — nie improwizuj własnego szablonu.

Ścieżkę do buildera w kroku 5 procedury bierzesz **z tej samej lokalizacji**, z której wziąłeś
szablon; `zbuduj.js` czyta fonty z sąsiedniego katalogu `fonty/`.

## Procedura generowania

1. **Skopiuj** `szablon.html` do `docs/plany/<TEMAT>/PLAN.html`.
2. **Wypełnij znaczniki nagłówkowe:** `{{JEZYK}}`, `{{TYTUL}}`, `{{PODTYTUL}}`, `{{DATA}}`,
   `{{STATUS}}`, `{{LICZBA_ETAPOW}}`, `{{PRACOCHLONNOSC}}`, `{{MODEL_WYKONAWCZY}}`, `{{PODPIS}}`,
   `{{TEMAT_PLANU}}`.
3. **Wypełnij `{{SEKCJA_1}}`…`{{SEKCJA_10}}`** treścią wg `SPEC_PLAN.md`, składając ją z komponentów
   z `komponenty.html` — bierzesz te, które ten plan potrzebuje, resztę pomijasz. `{{SZEPT_N}}`
   to półzdanie na prawym marginesie nagłówka sekcji — ma mówić, po co ta sekcja jest („gdyby ktoś
   czytał tylko jedno", „2 wysokie, 2 średnie").
4. **Symulator** — tylko gdy plan zawiera wyliczenia, którymi da się pokręcić.
   - **Ma wyliczenia:** wklej komponent 10 (karta z polami) oraz komponent 12 (skrypt) w miejsce
     `/*{{SKRYPT_SYMULATORA}}*/`, po czym wypełnij `{{KLUCZE_SYMULATORA}}`, `{{LOCALE}}`,
     `{{FUNKCJA_LICZ}}`, `{{FUNKCJA_ODSWIEZ}}` — a przy wykresie skumulowanym również
     `{{MIESIECY_WYKRESU}}`, `{{ZNACZNIKI_OSI}}`, `{{JEDNOSTKA_OSI}}`, `{{OPIS_PUNKTU}}`.
   - **Nie ma:** nie wklejasz nic i **nie wypełniasz żadnego z tych znaczników** — one istnieją
     wyłącznie wewnątrz komponentu 12, więc w Twoim pliku ich po prostu nie ma. Znacznik
     `/*{{SKRYPT_SYMULATORA}}*/` zostaw nietknięty: builder usunie go po cichu i napisze „Plan bez
     symulatora". Żadnych wartości pustych, żadnego martwego kodu.
5. **Uruchom builder:** `node .claude/relai/templates/HTML_PLAN/zbuduj.js docs/plany/<TEMAT>/PLAN.html`.
   Podmienia `/*{{FONTY}}*/` na reguły `@font-face` z `data:` URI, usuwa nietknięty
   `/*{{SKRYPT_SYMULATORA}}*/` i **wypisuje listę pozostałych niewypełnionych znaczników** —
   tę listę traktuj jako błąd, nie ostrzeżenie.
6. **Otwórz plik i sprawdź**, że symulator liczy, sekcje się zwijają, a strona nie przewija się
   w poziomie. Bez tego kroku plan nie jest gotowy.

## Kierunek wizualny „Warsztat" (D-61a, wybrany 2026-08-08)

Kartki przypięte pinezkami na jasnym tle, Kalam w nagłówkach i akcentach, Hanken Grotesk w treści,
paleta terakotowa. Wygląd zmienia się **wyłącznie przez tokeny** w `:root` — nie dopisuj reguł
pod konkretny plan.

| Token | Wartość | Do czego |
|---|---|---|
| `--tlo` | `#f2e9d8` | tło strony |
| `--kartka` | `#fffdf7` | karta sekcji, tabela, pole |
| `--glina` | `#c4643c` | akcent główny: nawigacja, numery sekcji, wykresy |
| `--musztarda` | `#d9a134` | podkreślenia, punkt zwrotu, druga pinezka |
| `--szalwia` | `#5f8a68` | wartości dodatnie, kryteria odbioru, trzecia pinezka |
| `--pis` | Kalam | nagłówki, pasek, karteczki, akcenty |
| `--ui` | Hanken Grotesk | treść |
| `--mono` | systemowy | liczby, kod, etykiety |

## Zakazy

1. **Zero żądań sieciowych.** Żadnego `http://` ani `https://` w `src`, `href` i `url()`. Fonty
   wyłącznie jako `data:` URI, obrazy jako inline SVG. Plan bywa czytany bez internetu.
2. **Zero fioletu i poświaty** (D-61a — to jedyny zakaz kolorystyczny, który przetrwał).
3. **Zero emoji.** Ikonografia to inline SVG albo znaki typograficzne.
4. **Zero animacji ozdobnych.** Ruch tylko tam, gdzie niesie informację: rozwijanie sekcji, obrót
   spinacza, przeliczany licznik. **Zakaz kropki wędrującej po diagramie** — była, została
   usunięta 2026-08-08 jako ruch bez treści. Ścieżkę główną od wyjątkowej odróżnia linia ciągła
   kontra przerywana, co działa też na wydruku.
5. **Zero generycznych fraz i grafik zastępczych.**
6. Każdy plik respektuje `prefers-reduced-motion` — to jest już w szablonie, nie usuwaj.

## Dostępność — wymagania, nie sugestie

- Bloki zwijalne to `<button>` z `aria-expanded` i `aria-controls`; muszą działać z klawiatury.
- Każdy `<svg role="img">` ma `aria-label` **opisujący treść słowami** — czytnik ekranu nie
  zobaczy kształtów. „Diagram przepływu" to za mało; wypisz kroki.
- Elementy czysto ozdobne (pinezki, taśma, podkreślenie) mają `aria-hidden="true"`.
- Suwak sprzężony z polem liczbowym jest `aria-hidden="true"` i `tabindex="-1"` — inaczej
  użytkownik klawiatury przechodzi przez tę samą wartość dwa razy.
- Tabele zawsze w `.przewin`, inaczej rozpychają stronę na wąskim ekranie.

## Nadpisanie lokalne

Pełny przebieg opisuje skill `relai-planning` (D-62). W skrócie: przy pierwszym wygenerowaniu planu
HTML w projekcie pada — **raz na projekt** — pytanie o zmianę stylu. Zgoda kopiuje całe drzewo
`HTML_PLAN/` (razem z `fonty/`) do **`docs/zasoby/HTML_PLAN/`**; ta kopia **ma pierwszeństwo** przed
wersją z pluginu i przeżywa jego aktualizacje, bo hook pisze wyłącznie do `.claude/relai/templates/`.
Wygląd zmieniasz **tylko przez tokeny w `:root`**. Odpowiedź — także odmowną — zapisujesz wierszem
„Szablon planu HTML" w `docs/USTAWIENIA.md`, inaczej pytanie wróci (L-0006).

## Waga pliku

Plan z symulatorem waży ok. 195–210 KB, z czego ~145 KB to osadzone fonty. To świadomy koszt
samowystarczalności: plik działa bez internetu i wygląda tak samo u każdego odbiorcy. Podzbiór
znaków ograniczony wyłącznie do użytych zbiłby to do ~80–120 KB — do rozważenia, gdy waga zacznie
przeszkadzać (ryzyko R5).

## Przykład

Kompletny, wygenerowany plan w tym kierunku:
[`docs/zasoby/design-konkurs/runda-3/blend.html`](../docs/zasoby/design-konkurs/runda-3/blend.html)
w repozytorium RelAI — dziesięć sekcji, diagram, dwa wykresy, symulator na dziewięciu wejściach,
karteczki na marginesie. Ten plik jest jednocześnie wzorcem wizualnym i dowodem, że szablon składa
się w działający dokument.
