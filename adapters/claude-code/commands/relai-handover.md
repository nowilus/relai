---
description: Składa pakiet przekazania projektu w jednym pliku HTML — stan, mapa dokumentów, plany i etapy, otwarte ryzyka, od czego zacząć
argument-hint: "[ŚCIEŻKA] — opcjonalna, gdzie zapisać plik; domyślnie docs/zasoby/"
---

# /relai-handover — pakiet przekazania projektu

Argument (opcjonalny): `$ARGUMENTS`

Odbiorcą jest **człowiek**, który dostaje projekt i nie zna go — nowy programista, klient,
współpracownik na zastępstwie. Twoje zadanie: zostawić jeden plik HTML, który otwiera się
dwuklikiem, działa bez internetu i odpowiada na pytanie „co ja właściwie dostałem i od czego mam
zacząć".

Ta komenda **niczego nie migruje i nie adoptuje**. Wytwarza dokument i tyle. Adopcja projektu
przez RelAI to osobna sprawa (`/relai-adopt`, D-70).

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak → jedno zdanie i koniec:
pakiet przekazania powstaje z dokumentów RelAI, więc bez nich nie ma z czego go złożyć.

## Krok 1 — materiał

Czytasz **w tej kolejności** i tylko to:

| Źródło | Co z niego bierzesz |
|---|---|
| `docs/STATE.md` | cały — to jest rdzeń sekcji 1 |
| `CLAUDE.md` | reguły procesu, linia „Aktywny plan" |
| `README.md` | jak to uruchomić, mapa `docs/` |
| `docs/DZIENNIK.md` | tabela „Stan otwartych ryzyk" + **trzy ostatnie** wpisy (nie więcej) |
| `docs/plany/*/STATUS.md` | plany otwarte: etapy zrealizowane, etap następny, model wykonawczy |
| `docs/DECYZJE.md` | wyłącznie te decyzje, których nieznajomość zaboli nowego (zamrożone zakazy) |
| `docs/USTAWIENIA.md` | preferencje, które nowy ma respektować |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `git log --oneline -15`, `git status` | tempo prac, niezacommitowane zmiany |

Czego **nie** robisz: nie czytasz kodu w poszukiwaniu architektury i nie opisujesz modułów, których
nie ma w dokumentach. Pakiet przekazania mówi to, co projekt o sobie zapisał — jeśli czegoś nie
zapisał, to też jest informacja i piszesz o niej wprost.

## Krok 2 — skąd szablon (kolejność wiążąca)

Korzystasz z **tego samego szablonu co plany HTML** — nie piszesz drugiego:

1. `docs/zasoby/HTML_PLAN/` — nadpisanie lokalne projektu (D-62). Istnieje → używasz i nie
   zaglądasz dalej.
2. `.claude/relai/templates/HTML_PLAN/` — kopia z pluginu utrzymywana przez hook `session-context`.
3. Nie ma ani jednego → powiedz o tym wprost i poproś o sesję z `--add-dir` na katalog pluginu.
   **Nie improwizuj własnego HTML-a** — pakiet ma wyglądać jak reszta dokumentów projektu.

Builder fontów bierzesz z **tej samej** lokalizacji co szablon.

## Krok 3 — złożenie pliku

1. **Skopiuj** `szablon.html` do `docs/zasoby/PRZEKAZANIE_RRRR-MM-DD.html` (data z kontekstu sesji;
   data w nazwie jest tu dozwolona — to snapshot, nie dokument bieżący, D-12). Argument komendy
   nadpisuje ścieżkę.
2. **Przerób nagłówek dokumentu:**
   - `<title>PLAN — {{TYTUL}}` → `<title>PRZEKAZANIE — {{TYTUL}}`,
   - `<span>· plan</span>` w pasku → `<span>· przekazanie</span>`,
   - `<p class="nadpis">plan wdrożenia · {{DATA}}` → `pakiet przekazania · {{DATA}}`,
   - `{{TYTUL}}` = nazwa projektu, `{{PODTYTUL}}` = jedno zdanie, czym ten projekt jest,
   - `{{STATUS}}` = stan projektu jednym słowem (np. „w budowie", „utrzymanie", „wstrzymany").
3. **Metki w szyldzie** — szablon ma cztery, przeznaczone dla planu. Zamień ich treść na:
   `stan: <STATUS>` · `dokumentów: <liczba plików w docs/>` · `otwartych ryzyk: <liczba>` ·
   `aktywny plan: <nazwa albo „brak">`. Znacznika `{{PRACOCHLONNOSC}}` razem z etykietą SZACUNEK
   tu nie ma — usuwasz go wraz z jego `<span class="metka">`.
4. **Sekcje.** Szablon ma dziesięć bloków `<section id="sN">`. Zostawiasz **sześć pierwszych**
   i zmieniasz ich tytuły; bloki `s7`–`s10` **usuwasz w całości** (od `<section` do `</section>`)
   razem z odpowiadającymi im pozycjami w `<nav>` paska:

   | # | Tytuł sekcji | Czym wypełniasz |
   |---|---|---|
   | 1 | Co to za projekt | dwa–trzy akapity z `STATE.md` i `README.md`: po co to jest, komu służy, w jakim jest stanie |
   | 2 | Mapa dokumentów | tabela (komponent 4): plik · po co jest · kiedy do niego zajrzeć |
   | 3 | Gdzie jesteśmy | co działa, co jest w toku, co ostatnio zamknięto — z trzech ostatnich wpisów dziennika |
   | 4 | Plany i etapy | tabela planów: temat · status · etap ostatni · etap następny · model wykonawczy. Brak planów → jedno zdanie |
   | 5 | Otwarte ryzyka | tabela z dziennika 1:1, bez skracania mitygacji; naklejki statusu (komponent 5) |
   | 6 | Od czego zacząć | **najważniejsza sekcja** — 3–5 ponumerowanych kroków dla nowej osoby, pierwszy wykonalny w pierwszej godzinie |

5. **Karteczki na marginesie** (komponent 1) — po jednej w sekcjach 1, 5 i 6. To jest miejsce na
   zdanie, którego nie ma w żadnym dokumencie: „tego się nie da uruchomić bez dostępu X",
   „ten moduł jest najstarszy i najbardziej kruchy".
6. **Symulator** — pakiet przekazania go nie ma. Znaczniki i tak **wypełniasz wartościami pustymi**
   (`{{KLUCZE_SYMULATORA}}` → `[]`, `{{FUNKCJA_LICZ}}` → `function(){return{};}`,
   `{{FUNKCJA_ODSWIEZ}}` → `function(){}`, `{{MIESIECY_WYKRESU}}` → `24`, `{{ZNACZNIKI_OSI}}` → `[0]`,
   `{{JEDNOSTKA_OSI}}` → `''`, `{{OPIS_PUNKTU}}` → `''`, `{{LOCALE}}` → kod języka projektu).
   Plik z niewypełnionym znacznikiem jest zepsuty; skrypt sam się wyłączy, gdy nie znajdzie pól.
7. **Stopka:** `{{PODPIS}}` = `RelAI (<model>) + <autor z git config>` (D-63),
   `{{TEMAT_PLANU}}` = nazwa projektu.
8. **Uruchom builder fontów:**
   `node .claude/relai/templates/HTML_PLAN/zbuduj.js docs/zasoby/PRZEKAZANIE_RRRR-MM-DD.html`
   (albo z `docs/zasoby/HTML_PLAN/`, jeśli stamtąd wziąłeś szablon). Builder wypisuje listę
   niewypełnionych znaczników — **traktujesz to jako błąd, nie ostrzeżenie**.

## Krok 4 — weryfikacja

Sprawdzasz na powstałym pliku, nie z pamięci:

1. Zero wystąpień `{{` w pliku.
2. Zero `http://` i `https://` w atrybutach `src`, `href` i w `url()` — pakiet ma działać bez sieci.
   Linki do dokumentów projektu są **względne** (`docs/STATE.md`) i to jest w porządku.
3. Sześć bloków `<section`, tyle samo pozycji w `<nav>`.
4. Sześć reguł `@font-face` z `data:`.
5. Otwierasz plik i sprawdzasz, że sekcje się zwijają i że strona nie przewija się w poziomie.

## Krok 5 — wpis w dzienniku i podsumowanie

Powstanie pakietu to zmiana funkcjonalna → wpis w `docs/DZIENNIK.md` w tej samej turze (D-44),
wg `SPEC_DZIENNIK.md`. W sekcji „Zweryfikowane" wypisujesz wynik pięciu kontroli z Kroku 4.

Podsumowanie dla użytkownika: gdzie leży plik, ile waży, co zawiera i **czego w nim celowo nie ma**
(sekretów, dostępów, wartości haseł — D-42). Plus jedno zdanie: pakiet jest zdjęciem stanu na dziś,
więc po większej zmianie generuje się go ponownie.

---

## Zakazy tej komendy

- Nie wpisujesz do pakietu żadnych sekretów, tokenów, haseł ani zawartości `.env`. Wskazujesz
  **nazwy** zmiennych i miejsce, gdzie sekret ma być ustawiony (D-42).
- Nie piszesz własnego szablonu HTML ani nie dokładasz reguł CSS pod ten jeden dokument — wygląd
  zmienia się wyłącznie przez tokeny w `:root`.
- Nie opisujesz architektury, której nie ma w dokumentach; brak dokumentu odnotowujesz jako brak.
- Nie migrujesz, nie adoptujesz i nie „porządkujesz przy okazji" — to jest `/relai-adopt` (D-70)
  i `/relai-audit` (D-45).
- Nie nadpisujesz wcześniejszego pakietu z tego samego dnia — dokładasz `_2`.
