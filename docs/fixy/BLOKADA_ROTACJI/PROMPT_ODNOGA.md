# PROMPT_ODNOGA — link sprawy blokuje rotację najstarszego wpisu, a pomiar bierze zły wpis

Odnoga: BLOKADA_ROTACJI • Plan-rodzic: brak (wątek samodzielny; wywodzi się z E5 zamkniętego planu OPTYMALIZACJA_KONTEKSTU) • Wygenerowano: 2026-08-21
(autor: Opus 5) • Wykonawca: **Opus**

> **Kontrola modelu:** wykonuj wyłącznie na modelu **Opus** (D-85). Sesja działa na innym modelu →
> zatrzymaj się i poproś o przełączenie, zanim cokolwiek zmienisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| [ODNOGA.md](ODNOGA.md) | karta tego wątku — cel, zakres, weryfikacja; karta jest źródłem |
| `docs/archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md` | skąd wątek pochodzi — wyłącznie kontekst, planu nie ruszasz |
| `.claude/relai/templates/SPEC_DZIENNIK.md` | reguła linku pozycji sekcji „Czeka na człowieka" |
| `.claude/relai/templates/SPEC_ARCHIWUM.md` | sekcja „Wybór treści", podsekcja o blokadzie od 1.6.0, przypadki brzegowe |
| `core/process/session-signals.js` | funkcje `ostatniWpis` i `startCost` — to one liczą pozycję `ryzyka` |
| `docs/DZIENNIK.md` (projektu RelAI) | wpis z 2026-08-21 o E5 — tam są liczby, od których ta odnoga się zaczyna |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Sekcja „Czeka na człowieka" zostaje jedynym adresem spraw człowieka** (E2 planu). Odnoga
  poprawia regułę linku, nie sam pomysł sekcji.
- **Blokada rotacji zostaje** — wpis, do którego prowadzi żywy link, nie może zniknąć bez śladu.
  Pytanie brzmi „który wpis linkujemy" albo „co robimy z linkiem przy rotacji", nie „czy blokada
  jest potrzebna".
- **Rotacja pozostaje dwufazowa, z sumą kontrolną** (ryzyko 1 planu). Presja rozmiaru niczego tu
  nie skraca.
- **Kolejność wpisów w dzienniku jest własnością projektu.** PolyFlow dopisuje na górze, RelAI na
  dole — oba są poprawne, a mechanizmy mają czytać kierunek, nie narzucać go.
- **Nie ruszasz planu głównego.** `PLAN.html` planu-rodzica jest zamrożony (D-33): nie edytujesz
  jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne, co ta
  odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

Repozytorium RelAI jest na wersji **1.6.1** `FAKT` (podbita w E5 razem z poprawką wersji docelowej
w `/relai-update`). Walidator `node core/tools/validate-adapters.js` przechodzi z kodem 0. Testów
ani runnera nadal nie ma — zachowania weryfikuje się uruchamianiem skryptów Nodem i dowodami na
stanie plików. Wyrażenia regularne trzymaj **w pliku**, nie w `node -e` (L-0054) — w E5 dokładnie
to wywróciło jedną kontrolę.

Pliki istotne dla wątku:

- `core/process/session-signals.js` — `ostatniWpis` (ok. linia 399) bierze **ostatni** nagłówek
  `###` w pliku; `startCost` (ok. linia 464) skleja z niego pozycję `ryzyka` razem z sekcją ryzyk
  i sekcją „Czeka na człowieka".
- `core/templates/SPEC_DZIENNIK.md` — opisuje format pozycji sekcji „Czeka na człowieka":
  treść · data pierwszego wystąpienia · link do **najstarszego** wpisu źródłowego.
- `core/templates/SPEC_ARCHIWUM.md` — sekcja „Wybór treści": zakres ciągły od najstarszej pozycji,
  nietykalny jest „każdy wpis, do którego prowadzi link z otwartej pozycji sekcji »Czeka na
  człowieka«, niezależnie od wieku".
- `C:\Users\Lukasz\Desktop\PolyFlow` — projekt, na którym to wyszło. Jego stan sprzed migracji
  wyjmiesz z `git show HEAD:docs/DZIENNIK.md` (o ile migracja nie została jeszcze zacommitowana)
  albo z kopii `C:\Users\Lukasz\Backupy\RelAI\PolyFlow_2026-08-21_1542.zip`. **Nie zmieniasz w tym
  projekcie niczego** — służy wyłącznie jako materiał pomiarowy.

**Czego jeszcze NIE ma:** żadna z dwóch reguł nie jest poprawiona, a obie zostały zmierzone tylko
raz, na jednym projekcie. Liczby z E5 `FAKT`: zakres rotacji **5 wpisów z 97**; przed zamknięciem
dwóch spraw — **0 wpisów**; pozycja `ryzyka` po rotacji **65,3 KB** wobec 59,4 KB przed migracją,
z czego +3,0 KB to wyłącznie skutek zmiany „ostatniego wpisu" wg rdzenia; suma warstwy startowej
PolyFlow **155,7 → 136,4 KB** przy budżecie 80 KB.

**Zasady aktywne z `docs/LEKCJE.md`** — przeczytaj je z pliku w całości (15 pozycji przy limicie
15). W tym wątku ważą najwięcej: zasada 4 (dowodzisz efektem, obiema wersjami w jednym przebiegu),
zasada 5 (instrument pomiarowy sam bywa źródłem fałszu — regexy w pliku, przypadek, który **musi**
trafić), zasada 6 (próg jest liczbą, którą ktoś liczy), zasada 7 (wartość czytana maszynowo ma
kotwicę i zamkniętą listę brzmień) i zasada 14 (najpierw zmiana w repozytorium, potem zdanie,
które ją opisuje).

## Zakres

1. `core/templates/SPEC_DZIENNIK.md` — rozstrzygnąć regułę linku pozycji: „najnowsze wystąpienie
   sprawy" albo „link przepinany na plik archiwum przy rotacji". Wybór opisać z powodem.
2. `core/templates/SPEC_ARCHIWUM.md` — zgrać regułę nietykalności z powyższym i dopisać przypadek
   brzegowy „wpis linkowany wjeżdża do archiwum".
3. `core/process/session-signals.js` — `ostatniWpis` rozpoznaje kierunek pliku z **dat** w
   nagłówkach wpisów, zamiast zakładać, że najnowszy jest ostatni.
4. `core/templates/SPEC_DZIENNIK.md` — zapisać wprost, że kolejność wpisów jest własnością
   projektu, a mechanizmy ją czytają.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Na kopii dziennika PolyFlow zakres rotacji liczony nową regułą obejmuje **co najmniej 50
      wpisów** z 97 — liczba wypisana przed i po zmianie reguły, w jednym przebiegu.
- [ ] `ostatniWpis` zwraca ten sam wpis dla dziennika rosnącego w dół i dla jego odwrócenia —
      test na obu wariantach w jednym przebiegu.
- [ ] Pozycja `ryzyka` mierzona dla PolyFlow **maleje** po poprawce; różnica wypisana w KB.
- [ ] `SPEC_DZIENNIK.md` i `SPEC_ARCHIWUM.md` mówią o linku i o nietykalności to samo — sprawdzone
      czytaniem obu w jednym przebiegu.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.

## Na koniec — rytuał zamknięcia odnogi (bez niego odnoga NIE jest zamknięta)

1. `ODNOGA.md` — status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona (co powstało, czego nie
   i dlaczego, link do wpisu w dzienniku).
2. Żadnego `STATUS.md` nie ruszasz — wątek jest samodzielny (`docs/fixy/`), a plan-rodzic leży
   w archiwum z linią `PRZENIESIONA`.
3. `docs/DZIENNIK.md` — wpis wg `SPEC_DZIENNIK.md`, cztery sekcje o stałych nazwach, podpis
   `RelAI (<model>) + <git config user.name>`.
4. `docs/STATE.md` — tylko jeśli odnoga zmieniła stan widoczny na tym poziomie (zmieni: PolyFlow
   przestanie być projektem, w którym rotacja stoi).
5. Commit — propozycja z conventional message. Jedyny punkt, o który pytasz.
