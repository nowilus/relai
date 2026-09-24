# relai-planning — zamknięcie planu

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy ostatni etap planu dostaje status ZREALIZOWANY (rytuał „Na koniec" ostatniego etapu, `/relai-stage` Krok 6), zanim napiszesz gdziekolwiek, że plan jest zrealizowany.

## Zamknięcie planu (D-36)

Gdy ostatni etap dostaje status ZREALIZOWANY, zamknięcie wykonujesz **sam, w tej samej turze**,
w tej kolejności:

**Dwa punkty blokujące idą pierwsze** (1 i 2). Dopiero po nich wolno napisać gdziekolwiek, że plan
jest zrealizowany: zdanie „plan ZREALIZOWANY", postawione przed rozstrzygnięciem bramek i odnóg,
jest fałszem w dokumencie, któremu następna sesja zaufa bezwarunkowo — a gdy człowiek odpowie
inaczej, niż zakładałeś, zostaje po nim wpis do wycofania.

1. **Otwarte bramki manualne** — zajrzyj do sekcji „Bramki manualne" w `STATUS.md` **i** przejrzyj
   sekcje „Do zrobienia przez człowieka" we wpisach dziennika z okresu tego planu; pozycja bez
   adnotacji „*(rozstrzygnięte …)*" jest otwarta, także wtedy, gdy nie ma jeszcze swojej linii
   w `STATUS.md` (plan sprzed 1.3.0). Jest choć jedna → **wypisz je wszystkie i zapytaj o każdą**:
   rozstrzygnięta teraz (wtedy zapisujesz jak — w obu miejscach) czy świadomie zostawiona otwarta
   (wtedy przechodzi do `STATE.md`, sekcja „Co blokuje" albo „Co dalej", żeby nie zginęła razem
   z folderem planu w archiwum). Bez decyzji człowieka **plan się nie zamyka**.

   Powód: „plan ZREALIZOWANY" przy kilkunastu pozycjach czekających na człowieka to zdanie
   nieprawdziwe, a po archiwizacji nikt już do nich nie zagląda (PolyFlow, retrospektywa
   2026-08-12, `FAKT`). Brak sekcji i brak otwartych pozycji → punkt przechodzi bez pytania
   i bez komentarza.
2. **Otwarte odnogi** — zajrzyj do sekcji „Odnogi" w `STATUS.md`. Jest tam choć jedna linia
   `OTWARTA` → **wypisz je wszystkie i zapytaj o każdą**: zamknąć teraz czy przenieść do
   `docs/fixy/<NAZWA>/` jako wątek samodzielny. Przeniesienie = folder odnogi wędruje do
   `docs/fixy/`, a jej linia w `STATUS.md` dostaje status
   `PRZENIESIONA <data> → docs/fixy/<NAZWA>/`. Bez decyzji człowieka **plan się nie zamyka** —
   folder planu w archiwum z żywym wątkiem w środku znaczy, że wątek przepadł. Brak sekcji „Odnogi"
   albo same linie zamknięte → punkt przechodzi bez pytania i bez komentarza.
3. **`docs/STATE.md`** — nadpisz: obszar planu przechodzi z „w toku" do stanu faktycznego.
4. **Wpis zamykający w `DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co miało
   powstać, co powstało, co przepadło. Bez tego porównania wpis jest niepełny.
5. **`STATUS.md`** — status planu → `ZREALIZOWANY <data>`, wszystkie etapy domknięte.
6. **Ryzyka** — przejrzyj tabelę „Stan otwartych ryzyk": ryzyka związane z planem zamknij z datą,
   nowe (jeśli praca je ujawniła) dopisz.
7. **Archiwum** — przenieś `docs/plany/<TEMAT>/` do `docs/archiwum/plany/<TEMAT>/`. Zawartość bez
   zmian; przeniesienie, nie kasowanie.
8. **`CLAUDE.md`** — linia aktywnego planu. **Warunek twardy: kiedy kończysz turę, linia wskazuje
   istniejący plik albo brzmi `Aktywny plan: brak`.** Link do przeniesionego folderu jest błędem —
   prowadzi donikąd, a jednocześnie mówi „tu trwa praca". Rozstrzygasz tak:

   - jest dokładnie jeden inny plan niezamknięty → wpisujesz go, bez pytania;
   - jest ich więcej albo nie masz pewności → wpisujesz `Aktywny plan: brak`, **a potem** pytasz
     jednym zdaniem, który ma być następny;
   - nie ma żadnego → `Aktywny plan: brak`.

   Pytanie o następcę jest dozwolone. Pytanie **zamiast** poprawienia linii — nie: to zostawia
   projekt z martwym linkiem i przerzuca sprzątanie po sobie na człowieka. `brak` jest zawsze
   poprawną wartością tymczasową; martwy link nie jest poprawny nigdy.
9. **Podsumowanie** — 3–5 zdań dla użytkownika: co dowieziono, czego nie i dlaczego, co czeka na
   człowieka.

Punkty 3–8 nie są przedmiotem pytania. Pytaniem może być wyłącznie commit oraz punkty 1 i 2 — gdy
plan ma otwarte bramki manualne albo otwarte odnogi.

**Kolejność: najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Wpis dziennika
mówiący „folder przeniesiony do archiwum", napisany zanim folder został przeniesiony, jest fałszem
w dokumencie, któremu następna sesja zaufa bezwarunkowo. Dotyczy to każdego kroku tego rytuału
i rytuału „Na koniec" etapu.
