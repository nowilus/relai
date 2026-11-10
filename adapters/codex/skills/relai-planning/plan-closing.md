# relai-planning — zamknięcie planu

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy ostatni etap planu dostaje status ZREALIZOWANY (rytuał „Na koniec" ostatniego etapu, `/relai-stage` Krok 6), zanim napiszesz gdziekolwiek, że plan jest zrealizowany.

## Zamknięcie planu (D-36)

Gdy ostatni etap dostaje status ZREALIZOWANY, zamknięcie wykonujesz **sam, w tej samej turze**,
w tej kolejności. Skopiuj listę do odpowiedzi i odhaczaj:

```
Zamknięcie planu: [ ] 1 bramki (blokuje)  [ ] 2 odnogi (blokuje)  [ ] 3 STATE  [ ] 4 wpis
                  [ ] 5 STATUS  [ ] 6 ryzyka  [ ] 7 archiwum  [ ] 7a linki  [ ] 8 CLAUDE.md
                  [ ] 9 podsumowanie
```


**Dwa punkty blokujące idą pierwsze** (1 i 2). Dopiero po nich wolno napisać gdziekolwiek, że plan
jest zrealizowany: zdanie „plan ZREALIZOWANY", postawione przed rozstrzygnięciem bramek i odnóg,
jest fałszem w dokumencie, któremu następna sesja zaufa bezwarunkowo — a gdy człowiek odpowie
inaczej, niż zakładałeś, zostaje po nim wpis do wycofania.

1. **Otwarte bramki manualne** — zajrzyj do sekcji „Bramki manualne" w `STATUS.md` **i** przejrzyj
   sekcje „Do zrobienia przez człowieka" we wpisach dziennika z okresu tego planu; pozycja bez
   adnotacji „*(rozstrzygnięte …)*" jest otwarta, także wtedy, gdy nie ma jeszcze swojej linii
   w `STATUS.md` (plan sprzed 1.3.0). Ostatni etap zamykany w tej turze nie ma jeszcze wpisu —
   jego pozycje dla człowieka bierzesz z pracy tej tury. Jest choć jedna → **wypisz je wszystkie
   i zapytaj o każdą**:
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
3. **`docs/STATE.md`** — nadpisz: obszar planu przechodzi z „w toku" do stanu faktycznego. To
   jedyna aktualizacja `STATE.md` w tej turze, także za ostatni etap.
4. **Wpis zamykający w `DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co miało
   powstać, co powstało, co przepadło. Bez tego porównania wpis jest niepełny. Zamknięcie idzie
   w tej samej turze co ostatni etap → to **jedyny** wpis tej tury: niesie część etapową
   (`stage-closing.md`, akapit „Ostatni etap planu”); osobnego wpisu za etap nie piszesz.
5. **`STATUS.md`** — status planu → `ZREALIZOWANY <data>`, wszystkie etapy domknięte.
6. **Ryzyka** — projekt ma plik blokady → **przed** przeglądem tabeli skan zależności Trivy ze
   skilla `trivy-scan` (`/relai-security`), który wpisuje nowe CRITICAL/HIGH i zamyka wiersze,
   których skan już nie widzi (D-91); Trivy brak (`trivy not found`) → komenda ekosystemu
   (`npm audit --omit=dev`, `pip-audit`…) i jej wynik w podsumowaniu. Potem przejrzyj tabelę
   „Stan otwartych ryzyk": ryzyka związane z planem zamknij z datą, nowe (jeśli praca je
   ujawniła) dopisz.
7. **Archiwum** — przenieś `docs/plany/<TEMAT>/` do `docs/archiwum/plany/<TEMAT>/`. Zawartość bez
   zmian; przeniesienie, nie kasowanie.
7a. **Linki do przeniesionych folderów** — zaraz po punkcie 7 przepinasz linki prowadzące do
   starych ścieżek w trzech miejscach: sekcja „Czeka na człowieka” w `docs/DZIENNIK.md`,
   `docs/STATE.md` oraz `CLAUDE.md` i `AGENTS.md` (jeśli istnieje). Zmienia się wyłącznie cel
   linku; tekst linku, treść pozycji i data zostają. Najpierw odnogi przeniesione w punkcie 2
   (`plany/<TEMAT>/odnogi/<NAZWA>/` → `fixy/<NAZWA>/`), potem plan (`plany/<TEMAT>/` →
   `archiwum/plany/<TEMAT>/`) — w `CLAUDE.md` i `AGENTS.md` z przedrostkiem `docs/`. Linię
   „Aktywny plan” zostawiasz punktowi 8. Miejsca znajdujesz poleceniami:
   `grep -nF -e "](plany/<TEMAT>/" -e "](docs/plany/<TEMAT>/" docs/STATE.md CLAUDE.md AGENTS.md`
   i `awk '/^## /{w=($0 ~ /Czeka na człowieka|Waiting for the human/)} w' docs/DZIENNIK.md | grep -nF "](plany/<TEMAT>/"`.
   Kontrola: te same polecenia po edycji nie zwracają nic poza linią „Aktywny plan”. Wpisów
   dziennika nie przepinasz — są zapisem przeszłości.
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

   **Tabela „Stan prac” — bez zmian.** Zamknięty plan nie dostaje wiersza w tabeli i nie
   dopisujesz go do żadnej komórki: jego ślad to `STATE.md` (punkt 3) i archiwum (punkt 7).
   Projekt ma w tabeli wiersz planu z czasów przed tą regułą → usuwasz go w tej turze; tabela
   kończy turę z najwyżej pięcioma wierszami (`SPEC_CLAUDE_MD.md`).
9. **Podsumowanie** — 3–5 zdań dla użytkownika: co dowieziono, czego nie i dlaczego, co czeka na
   człowieka.

Pytaniem może być wyłącznie: punkty 1 i 2 — gdy plan ma otwarte bramki manualne albo otwarte
odnogi; jedno pytanie o następcę planu w punkcie 8, zadane dopiero po wpisaniu poprawnej linii;
commit. Pozostałe punkty wykonujesz bez pytania.

**Kolejność: najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Wpis dziennika
mówiący „folder przeniesiony do archiwum", napisany zanim folder został przeniesiony, jest fałszem
w dokumencie, któremu następna sesja zaufa bezwarunkowo. Dotyczy to każdego kroku tego rytuału
i rytuału „Na koniec" etapu.
