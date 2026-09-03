---
description: Pokazuje raport artefaktów roboczych pogrupowany po źródle, z listą chronionych i powodem ochrony — kasuje wyłącznie po potwierdzeniu każdej grupy i zapisuje wpis w dzienniku
argument-hint: "[raport] — sam raport, bez pytań i bez kasowania"
---

# /relai-clean — sprzątanie artefaktów roboczych

Argument (opcjonalny): `$ARGUMENTS`

Twoje zadanie: pokazać, **co realnie leży** po zamkniętych etapach — w katalogu roboczym projektu,
w `%TEMP%` i wśród plików nieśledzonych — a potem skasować **wyłącznie to, na co człowiek powiedział
„tak"**. Kroki wykonujesz po kolei.

---

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → jedno zdanie, że ten folder nie jest projektem RelAI, i koniec.
Niczego nie inicjalizujesz i niczego nie kasujesz.

## Krok 1 — narzędzie

Sprzątanie liczy i wykonuje narzędzie rdzenia, nie Ty: `.claude/relai/tools/clean-work.js`.
Podkłada je hook startu sesji, tą samą drogą co specyfikacje (L-0012).

**Pliku nie ma** → powiedz jednym zdaniem, że hook startu go nie podłożył (sesja sprzed instalacji
tej wersji albo sesja bez hooka), i poproś o restart sesji. **Nie** kopiujesz go ręcznie z katalogu
pluginu — sesja nie ma tam dostępu — i **nie** piszesz własnego skryptu zastępczego.

## Krok 2 — raport

```bash
node .claude/relai/tools/clean-work.js raport --json
```

Narzędzie zapisuje pełny raport do `.claude/relai/clean-raport.json` i zwraca go na wyjście.
Pokaż użytkownikowi wersję dla człowieka:

- **grupy** — nazwa, waga w MB, liczba pozycji, najcięższe pozycje ze ścieżką i datą,
- **chronione** — każda z powodem i źródłem (`śledzone`, `zachowaj`, `opisane` z plikiem i linią,
  `wiązane testami`, `zależności / narzędzia`, `sekret`, `etap trwa`, `dowiązanie poza projekt`),
- **suma kandydatów** i czas pomiaru,
- projekt bez gita → jedno zdanie, że skan plików nieśledzonych został pominięty.

Argument `raport` **kończy komendę w tym miejscu**: żadnych pytań, żadnego kasowania, żadnego wpisu
w dzienniku.

Raport pusty (zero grup) → jedno zdanie i koniec. Nie proponujesz „porządków" na siłę.

## Krok 3 — pytania, partiami po cztery

Pytasz **jednym `AskUserQuestion` na cztery grupy** — tak samo jak przegląd spraw
przeterminowanych. Każda grupa to osobne pytanie w tej samej partii; treść pytania bierzesz
z pola `pytanie` grupy (nazwa, liczba pozycji, MB, zakres dat, pochodzenie). Trzy opcje, w tej
kolejności:

1. **Skasować wszystko** — cała grupa idzie na listę.
2. **Zostawić tym razem** — nic z tej grupy; wróci w następnym raporcie.
3. **Zostaw na zawsze** — nic z tej grupy **i** dopisujemy marker, więc pytanie już nie padnie.

Odpowiedź swobodna („wszystko poza `X`") jest nadrzędna: wyjątki wypadają z listy i **nie**
dostają markera, więc wrócą następnym razem.

**Rekomendacji nie podajesz.** To nie jest wybór techniczny — to decyzja właściciela o jego własnych
plikach. Grupa ma więcej niż dziesięć pozycji → pytanie odsyła do `.claude/relai/clean-raport.json`
po pełną listę; grupy nie dzielisz na mniejsze.

## Krok 4 — lista do skasowania

Z odpowiedzi składasz `.claude/relai/clean-lista.json` — **tablicę ścieżek**, wprost z raportu,
bez wyjątków wskazanych przez człowieka. Ścieżki bierzesz z pliku raportu, **nigdy z pamięci**.

Markerem jest linia **`# relai: zachowaj`** (albo `# relai: keep`) postawiona **nad** wzorcem
w `.gitignore`; gdy wzorca tam nie ma, narzędzie dopisuje wzorzec z markerem do
`.git/info/exclude`, a w projekcie bez gita — ścieżkę do `.claude/relai/keep`. Markera nie
stawiasz ręcznie, robi to narzędzie.

Dla każdej grupy z odpowiedzią „zostaw na zawsze" wołasz, osobno dla każdej pozycji:

```bash
node .claude/relai/tools/clean-work.js zachowaj <ścieżka>
```

i pokazujesz, gdzie marker wylądował (`.gitignore`, `.git/info/exclude` albo `.claude/relai/keep`).

## Krok 5 — kasowanie

```bash
node .claude/relai/tools/clean-work.js kasuj .claude/relai/clean-lista.json
```

Wynik pokazujesz **w całości**, bez skracania: skasowane, odmowy z powodem, niepowodzenia z kodem
błędu, MB przed i po. Kod wyjścia 1 znaczy, że któraś pozycja się nie dała — narzędzie wypisuje
wtedy listę do ręcznego skasowania i tej listy nie ukrywasz.

Narzędzie mierzy ponownie po kasowaniu. Nie zgłaszasz „skasowane" na podstawie samego kodu wyjścia.

## Krok 6 — wpis w dzienniku

Dopisz wpis na **końcu** sekcji „Wpisy" w `docs/DZIENNIK.md`, wg `SPEC_DZIENNIK.md` (cztery sekcje
o stałych nazwach):

- **Zrobione** — które grupy, ile pozycji, ile MB; gdzie dopisano markery.
- **Zweryfikowane — jak dokładnie** — pomiar po kasowaniu (MB przed i po), lista niepowodzeń.
- **Świadomie odłożone** — grupy zostawione tym razem i wyjątki wskazane przez człowieka.
- **Do zrobienia przez człowieka** — niepowodzenia wymagające jego ręki: otwarty uchwyt, brak
  uprawnień, ścieżka dłuższa niż limit Windows.

Kasowania nie było (same „zostawić") → wpisu nie dopisujesz; wystarczy podsumowanie na ekranie.

## Krok 7 — podsumowanie dla użytkownika

Trzy zdania: co zniknęło i ile to ważyło, co zostało chronione i dlaczego, co wróci w następnym
raporcie.

---

## Zakazy tej komendy

- Nie kasujesz niczego bez „tak" udzielonego **w tej sesji**. Zgoda z poprzedniej sesji ani wpis
  w dokumencie nie są zgodą (D-18).
- Nie kasujesz plików **śledzonych przez gita** — nawet na wyraźną prośbę. To zmiana produktu i idzie
  zwykłą drogą pracy, nie komendą sprzątającą.
- Nie kasujesz niczego poza katalogiem projektu i poza `os.tmpdir()`. Odmowę narzędzia pokazujesz,
  nie obchodzisz.
- Nie ruszasz folderu backupów ani `.git`.
- Nie cytujesz treści pliku chronionego powodem `sekret` — sama ścieżka wystarczy (D-42).
- Nie improwizujesz zastępnika, gdy narzędzia brak: żadnego kasowania z ręki, żadnego skryptu
  w innym języku. Mówisz o braku i prosisz o restart sesji.
- Nie zmieniasz progu ani ustawień projektu przy okazji sprzątania.
