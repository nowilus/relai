---
description: Uruchamia etap aktywnego planu RelAI — wykrywa plan i następny etap, pokazuje potwierdzenie i czeka na zgodę
argument-hint: "[TEMAT] [EN] — oba opcjonalne, np. /relai-stage albo /relai-stage E5 albo /relai-stage PLATNOSCI E2"
---

# /relai-stage — wykonanie etapu planu

Argumenty (oba opcjonalne): `$ARGUMENTS`

Twoje zadanie: doprowadzić do **startu właściwego etapu we właściwym trybie** — i ani jednego kroku
dalej, dopóki użytkownik nie potwierdzi. Wykonuj poniższe kroki po kolei.

---

## Krok 0 — czy to projekt RelAI

Sprawdź marker: `docs/USTAWIENIA.md` (albo odpowiednik w języku projektu) zawiera linię
`Wersja RelAI:`. Brak markera → napisz jedno zdanie, że ten folder nie jest projektem RelAI, więc
nie ma planu do wykonania, i zakończ. Niczego nie inicjalizuj — od tego jest `relai-core`.

## Krok 1 — który plan

| Sytuacja | Co robisz |
|---|---|
| Argument zawiera `<TEMAT>` (np. `PLATNOSCI E2`) | bierzesz ten plan; nie ma takiego folderu → mów o tym i wypisz plany, które są |
| Brak argumentu, `CLAUDE.md` ma linię „Aktywny plan" | bierzesz plan z tej linii |
| Brak argumentu, brak linii aktywnego planu, w `docs/plany/` jest **dokładnie jeden** plan niezamknięty | bierzesz go i mówisz jednym zdaniem, skąd go masz |
| Planów niezamkniętych jest **więcej niż jeden** | **jedno** pytanie (AskUserQuestion), który; nigdy nie zgadujesz (D-35) |
| `docs/plany/` nie istnieje albo nie ma planów | jedno zdanie: nie ma czego uruchomić, plan powstaje z prośby „przygotuj plan…" |

Wczytaj `docs/plany/<TEMAT>/STATUS.md` — linia metryczna (status planu, model wykonawczy) i tabela
etapów.

**Plan w statusie `DO AKCEPTACJI`** → nie uruchamiasz żadnego etapu. Mówisz, że plan czeka na
akceptację, i pytasz, czy go zaakceptować.

## Krok 2 — który etap

Bez argumentu numerycznego: etap ze statusem **`GOTOWY DO STARTU`** (z definicji jest dokładnie
jeden). Z argumentem (`E5`) — ten wskazany.

Rozstrzygnij według statusu znalezionego etapu:

| Status etapu | Zachowanie |
|---|---|
| `GOTOWY DO STARTU` | ścieżka normalna → Krok 3 |
| `W TOKU` | **nie startujesz od zera.** Powiedz, co zostało: ostatnia linia dziennika wdrożenia w `STATUS.md` + ostatni wpis `docs/DZIENNIK.md` dotyczący tego etapu + które punkty sekcji Weryfikacja są już spełnione (sprawdź w repo, nie z pamięci). Zapytaj: **dokończyć czy zacząć od nowa** |
| `ZREALIZOWANY <data>` | powiedz, że etap jest zamknięty tego dnia, i zapytaj, czy naprawdę uruchomić go ponownie; wskaż etap `GOTOWY DO STARTU` jako alternatywę |
| `OCZEKUJE` | poprzedni etap nie jest domknięty — powiedz który i zapytaj, czy uruchomić mimo to |
| `POMINIĘTY — <powód>` | przypomnij powód pominięcia i zapytaj, czy wracamy do niego |
| brak etapów niezamkniętych | plan jest gotowy do zamknięcia → Krok 6 |

## Krok 3 — prompt etapu

Kolumna `Prompt` w `STATUS.md` wskazuje `PROMPT_ETAP_N.md`.

- **Plik jest** → czytasz go w całości.
- **Pliku nie ma** (albo kolumna jest pusta) → **dogenerowujesz go** wg
  `${CLAUDE_PLUGIN_ROOT}/templates/SPEC_PROMPT_ETAPU.md`: z sekcji `PLAN.md` opisującej ten etap,
  z **realnego stanu repozytorium** (sprawdzasz, nie zakładasz) i z sekcji „Zasady aktywne"
  rejestru lekcji. Powiedz jednym zdaniem, że promptu brakowało i został wygenerowany. Uzupełnij
  kolumnę `Prompt` w `STATUS.md` linkiem. **Dopiero teraz** przechodzisz do potwierdzenia.

## Krok 4 — potwierdzenie (obowiązkowe, D-35)

Pokaż użytkownikowi kartę potwierdzenia i **zatrzymaj się**:

- **Plan** — temat + status planu.
- **Etap** — `EN z EM` + tytuł.
- **Model wykonawczy** — z `STATUS.md`. Model bieżącej sesji jest inny niż wymagany → napisz to
  wprost jako pierwszą rzecz i zaproponuj przełączenie przed startem.
- **Czego dotyczy** — 2–4 zdania z sekcji „Zakres etapu" promptu, własnymi słowami. Nie przepisujesz
  całej sekcji.
- **Weryfikacja** — liczba punktów do przejścia i jednym zdaniem, co jest najtwardsze.
- **Rekomendacja subagenta** — jedno zdanie, tylko gdy kryteria z sekcji niżej są spełnione.
- **Pytanie** — „Zaczynamy?"

**Twardy zakaz:** przed odpowiedzią użytkownika nie tworzysz i nie modyfikujesz **żadnego** pliku —
w tym `STATUS.md`. Jedynym wyjątkiem jest prompt dogenerowany w Kroku 3, bo bez niego nie ma czego
potwierdzać, i on jest zapowiedziany osobnym zdaniem. Milczenie nie jest zgodą. „Uruchom etap"
w prompcie użytkownika nie jest zgodą na start — kartę pokazujesz mimo to.

### Rekomendacja subagenta (D-35) — kiedy ją dopisujesz

Etap jest na tyle mechaniczny, że warto go oddać subagentowi, gdy spełnia **wszystkie pięć**
warunków (progi to **SZACUNEK**, nie twarda reguła):

1. zakres dotyka **maksymalnie 3 plików**,
2. sekcja Weryfikacja ma **maksymalnie 5 punktów** i każdy da się sprawdzić komendą,
3. w zakresie **nie ma decyzji projektowych** — nic do rozstrzygnięcia z człowiekiem,
4. szacowany rozmiar **do połowy sesji roboczej**,
5. etap **nie dotyka** sekretów, migracji danych, plików zamrożonych ani dokumentów rdzeniowych
   (`CLAUDE.md`, rejestry `DECYZJE`/`LEKCJE`).

Wtedy w karcie pojawia się zdanie: *„Etap jest mechaniczny (N plików, M punktów weryfikacji) —
mogę go oddać subagentowi; powiedz, jeśli tak wolisz."*

Rekomendacja jest **zdaniem w potwierdzeniu, nigdy automatycznym odpaleniem**. Subagenta uruchamiasz
wyłącznie na wyraźną prośbę użytkownika.

## Krok 5 — wykonanie

Po zgodzie, w tej kolejności:

1. `STATUS.md`: status etapu → `W TOKU`, linia w dzienniku wdrożenia (`- <data> — E<N> rozpoczęty`).
   Dzięki temu sesja przerwana w połowie zostawia ślad, a nie zagadkę.
2. Wykonujesz prompt etapowy **dosłownie**: czytasz to, co każe przeczytać, w podanej kolejności;
   respektujesz sekcję „Decyzje już podjęte"; realizujesz zakres; przechodzisz sekcję Weryfikacja
   punkt po punkcie i **piszesz wynik każdego** — także wtedy, gdy punkt nie przeszedł.
3. Zamykasz etap rytuałem „Na koniec" opisanym w prompcie i w skillu `relai-planning`
   (sekcja „Rytuał »Na koniec« etapu"). Rytuał zawiera **wygenerowanie `PROMPT_ETAP_N+1.md`** —
   etap bez niego nie jest ukończony (D-34).

Zakres promptu jest granicą. Rzecz potrzebna, ale spoza zakresu → do wpisu w dzienniku jako
„świadomie odłożone", nie do roboty przy okazji.

## Krok 6 — ostatni etap planu

Zamykany etap był ostatnim (w tabeli nie ma już etapów `OCZEKUJE` ani `W TOKU`) → zamiast generacji
`PROMPT_ETAP_N+1` uruchom **sekwencję zamknięcia planu** z `relai-planning`, sekcja „Zamknięcie
planu (D-36)": `STATE.md` → wpis zamykający „dowiezione vs plan" → status planu `ZREALIZOWANY` →
przegląd ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → linia „Aktywny plan"
w `CLAUDE.md` → podsumowanie. Sekwencji nie odtwarzasz z pamięci i nie skracasz — wykonujesz
kroki 1–7 stamtąd. Pytaniem może być wyłącznie commit.

---

## Zakazy tej komendy

- Nie zaczynasz pracy bez potwierdzenia — w żadnym wariancie wywołania.
- Nie zgadujesz planu, gdy jest ich więcej niż jeden.
- Nie uruchamiasz subagenta samodzielnie.
- Nie tworzysz promptów dla etapów dalszych niż uruchamiany.
- Nie modyfikujesz `PLAN.md` — plan zaakceptowany jest zamrożony (D-33); rozbieżność planu ze stanem
  faktycznym zgłaszasz jako propozycję aneksu.
- Nie zamykasz etapu, którego sekcja Weryfikacja nie przeszła w całości; punkt nieprzechodzący
  opisujesz w dzienniku i pytasz człowieka.
