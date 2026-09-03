---
description: Zakłada odnogę — boczny wątek z etapu dostaje własną kartę i samowystarczalny prompt świeżej sesji, bez ruszania zamrożonego planu
argument-hint: "[NAZWA] [cel w jednym zdaniu] — oba opcjonalne, np. /relai-branch albo /relai-branch OPIS_REPO opis repozytorium na GitHubie"
---

# /relai-branch — odnoga planu

Argumenty (oba opcjonalne): `$ARGUMENTS`

Twoje zadanie: **wątek, który urodził się nie w porę, ma dostać własne miejsce** — kartę i gotowy
prompt dla świeżej sesji — a bieżąca praca ma wrócić do swojego zakresu. Nie wykonujesz tego wątku
teraz. Wykonuj poniższe kroki po kolei.

---

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → jedno zdanie, że ten folder nie jest projektem RelAI, więc nie ma
do czego zakładać odnogi, i koniec. Niczego nie inicjalizujesz — od tego jest `relai-core`.

## Krok 1 — zakaz głębokości (sprawdzasz to PRZED czymkolwiek innym)

Odnoga od odnogi jest zakazana — **jedna głębokość**.

Rozpoznajesz sytuację po tym, co ta sesja robi: czytałeś w niej `PROMPT_ODNOGA.md`, pracujesz nad
wątkiem opisanym w `ODNOGA.md`, albo zmiany tej sesji mieszkają w `docs/plany/<TEMAT>/odnogi/…`
lub `docs/fixy/…`.

Wtedy: **odmawiasz i nie tworzysz żadnego pliku.** Mówisz to wprost w dwóch zdaniach — wątek
z odnogi, który sam potrzebuje odnogi, jest sygnałem, że sprawa przerosła boczny wątek — i
proponujesz pełny plan („przygotuj plan…"). Kończysz. Nie pytasz o nazwę, nie zakładasz folderu,
nie dopisujesz linii do żadnego `STATUS.md`.

## Krok 2 — nazwa i cel

Z `$ARGUMENTS` bierzesz, co padło. Brakuje nazwy albo celu → **jedno wywołanie AskUserQuestion**
(nigdy dwa pod rząd), z pytaniami tylko o to, czego brakuje:

- **Nazwa** — CAPS_SNAKE w języku projektu, bez dat i numerów (konwencja `<TEMAT>`, D-12).
  Pierwszą opcją jest Twoja propozycja wyprowadzona z rozmowy, z dopiskiem „(Rekomendowane)";
  użytkownik może wpisać własną.
- **Cel** — jedno zdanie mówiące, po czym poznamy, że zrobione. Zaproponuj brzmienie z kontekstu,
  w którym wątek wypłynął.

Nazwa istnieje już w projekcie → mówisz o tym i prosisz o inną. Nie dopisujesz numerka.

## Krok 3 — plan i etap-źródło

| Sytuacja | Co robisz |
|---|---|
| `CLAUDE.md` ma linię „Aktywny plan" wskazującą istniejący `STATUS.md` | to jest plan-rodzic |
| Brak linii, ale w `docs/plany/` jest **dokładnie jeden** plan niezamknięty | bierzesz go i mówisz jednym zdaniem, skąd go masz |
| Planów niezamkniętych jest więcej niż jeden | **jedno** pytanie (AskUserQuestion), do którego planu należy odnoga; nie zgadujesz (D-35) |
| Nie ma żadnego planu niezamkniętego | **wariant samodzielny**: folder `docs/fixy/<NAZWA>/`, w żadnym `STATUS.md` nie zapisujesz nic |

**Etap-źródło** — etap ze statusem `W TOKU` w tabeli etapów planu-rodzica. Nie ma takiego (albo
wariant samodzielny) → wpisujesz `—`, nie zgadujesz.

**Wykonawca** — model z linii metrycznej `STATUS.md` planu, przepisany dosłownie. Wariant
samodzielny → rekomendacja z `CLAUDE.md` projektu.

## Krok 4 — generacja pary plików

**Otwórz i przeczytaj `.claude/relai/templates/SPEC_ODNOGA.md`** — nie generujesz z pamięci
(L-0012: katalog pluginu jest dla sesji niedostępny, kopia specyfikacji mieszka w projekcie).
Brak kopii → powiedz o tym i poproś o `--add-dir` na katalog pluginu, zamiast improwizować.

Powstają **dwa pliki, zawsze w parze**, w `docs/plany/<TEMAT>/odnogi/<NAZWA>/` albo
w `docs/fixy/<NAZWA>/`:

1. **`ODNOGA.md`** — karta: nagłówek, linia metryczna (plan, etap-źródło, data, status `OTWARTA`,
   wykonawca), cel, „Skąd się wzięła", zakres ze ścieżkami plików, „Poza zakresem", weryfikacja
   w checkboxach, pusta sekcja „Wynik".
2. **`PROMPT_ODNOGA.md`** — osiem sekcji wg specyfikacji: nagłówek, linia metryczna z **planem-
   rodzicem**, kontrola modelu, co przeczytać na start, decyzje już podjęte (ostatni punkt zawsze
   „Nie ruszasz planu głównego"), stan wyjściowy z **realnego stanu repozytorium** i z „Zasadami
   aktywnymi" przepisanymi w całości z `docs/LEKCJE.md`, zakres i weryfikacja z karty, rytuał
   zamknięcia odnogi.

Stan wyjściowy **sprawdzasz w repozytorium**, nie zakładasz. Prompt opisujący pliki, których nie
ma, jest gorszy niż brak promptu.

## Krok 5 — ślad w `STATUS.md` planu

Wariant z planem: w `docs/plany/<TEMAT>/STATUS.md`, w sekcji „Odnogi" (zaraz po tabeli etapów,
przed dziennikiem wdrożenia; nie ma sekcji → zakładasz ją teraz) dopisujesz **jedną linię**:

```
- **<NAZWA>** — <jedno zdanie, czego dotyczy> · źródło: E<N> · [karta](odnogi/<NAZWA>/ODNOGA.md) · **OTWARTA**
```

I nic więcej. **Tabeli etapów nie ruszasz, dziennika wdrożenia nie ruszasz, `PLAN.md` / `PLAN.html`
nie ruszasz** — plan jest zamrożony (D-33).

Wariant samodzielny (`docs/fixy/`): tego kroku nie ma. W żadnym `STATUS.md` nie przybywa linia.

## Krok 6 — co powiedzieć użytkownikowi

Trzy–cztery zdania, nie więcej:

- co powstało i gdzie (ścieżki obu plików),
- **katalog roboczy tej odnogi** — `.claude/relai/work/<TEMAT>/<NAZWA>/` (wariant samodzielny:
  `.claude/relai/work/_fixy/<NAZWA>/`); to jest miejsce, w którym sesja wykonawcza ma trzymać
  wszystko tymczasowe, i człowiek widzi je **zanim cokolwiek tam powstanie**,
- jak to uruchomić: **świeża sesja** na modelu z karty, wklejony `PROMPT_ODNOGA.md`,
- że bieżąca praca wraca do swojego zakresu — wątek jest odłożony, nie porzucony,
- w wariancie samodzielnym: że w żadnym planie nic się nie zmieniło, bo nie ma czego zmieniać.

---

## Zakazy tej komendy

- **Nie wykonujesz wątku, dla którego zakładasz odnogę.** Komenda kończy się na parze plików.
- Nie tworzysz odnogi z wnętrza odnogi — Krok 1 jest bezwarunkowy.
- Nie modyfikujesz `PLAN.md` / `PLAN.html` ani tabeli etapów — rozbieżność planu ze stanem
  faktycznym zgłaszasz jako propozycję aneksu (D-33), nie jako odnogę.
- Nie zakładasz odnogi dla zmiany samego planu — to aneks.
- Nie generujesz jednego pliku bez drugiego.
- Nie zakładasz folderu `odnogi/` ani `docs/fixy/` na zapas — powstają razem z pierwszym wątkiem
  (D-11).
- Nie zgadujesz planu, gdy niezamkniętych jest więcej niż jeden.
- Nie zapisujesz w prompcie wartości sekretów — nazwy zmiennych tak, wartości nigdy (D-42).
