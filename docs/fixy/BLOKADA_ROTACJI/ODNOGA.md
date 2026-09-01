# ODNOGA — link sprawy blokuje rotację najstarszego wpisu, a pomiar bierze zły wpis

Plan: brak (wątek samodzielny — przeniesiony 2026-08-21 z zamkniętego planu
[OPTYMALIZACJA_KONTEKSTU](../../archiwum/plany/OPTYMALIZACJA_KONTEKSTU/STATUS.md)) ·
Etap-źródło: E5 — Migracja JiraManagera i PolyFlow · Utworzona: 2026-08-21 ·
Status: **PRZENIESIONA 2026-09-01 → wchłonięta przez E1 planu HIGIENA_DOKUMENTOW** · Wykonawca: Opus

## Cel

Rotacja dziennika w projekcie, w którym otwarta sprawa człowieka ma najstarsze źródło w pierwszym
wpisie, przenosi **więcej niż kilka procent** wpisów — a pozycja `ryzyka` w pomiarze startu liczy
**ten wpis, który sesja naprawdę czyta**, niezależnie od tego, czy projekt dopisuje wpisy na górze,
czy na dole.

## Skąd się wzięła

Migracja PolyFlow (E5, 2026-08-21) była pierwszym uruchomieniem mechanizmu z E2 na cudzym
projekcie. Wyszły dwie rzeczy naraz. **Pierwsza:** `SPEC_DZIENNIK.md` każe linkować pozycję sekcji
„Czeka na człowieka" do **najstarszego** wpisu źródłowego, a `SPEC_ARCHIWUM.md` czyni każdy wpis
linkowany nietykalnym — więc blokada siada dokładnie na najstarszym wpisie, czyli tam, gdzie
kosztuje najwięcej. W PolyFlow przeszło **5 wpisów z 97**, a dziennik został na 552 KB przy progu
150 KB; przed zamknięciem dwóch spraw decyzją właściciela przechodziło **zero**. **Druga:**
funkcja `ostatniWpis` w rdzeniu bierze ostatni nagłówek `###` w pliku. PolyFlow dopisuje wpisy
**na górze**, więc pomiar liczył tam wpis **najstarszy** — po rotacji pozycja `ryzyka` urosła
o 3,0 KB tylko dlatego, że zmienił się najstarszy wpis w pliku.

## Zakres

1. `core/templates/SPEC_DZIENNIK.md` — reguła linku pozycji sekcji „Czeka na człowieka":
   rozstrzygnąć między „najnowsze wystąpienie sprawy" a „link przepinany na archiwum przy rotacji".
   Wariant wybrany opisać wprost, z powodem.
2. `core/templates/SPEC_ARCHIWUM.md` — zgrać z powyższym regułę nietykalności wpisu linkowanego
   i dopisać przypadek brzegowy „wpis linkowany wjeżdża do archiwum".
3. `core/process/session-signals.js`, funkcja `ostatniWpis` — rozpoznać kierunek pliku z **dat**
   w nagłówkach wpisów, zamiast zakładać, że najnowszy jest ostatni.
4. `core/templates/SPEC_DZIENNIK.md` — powiedzieć wprost, że kolejność wpisów w pliku jest
   własnością projektu, i że mechanizmy mają ją **czytać**, a nie narzucać.

## Poza zakresem

- Zmiana progów rotacji i budżetu (`SPEC_USTAWIENIA.md`) — progi są skalibrowane, problem nie jest
  w liczbach.
- Rotacja lekcji i rotacja ryzyk — obie zadziałały poprawnie w PolyFlow.
- Cokolwiek w samym PolyFlow: jego dziennik i sprawy są treścią tamtego projektu.
- Ponowne przepisywanie sekcji „Czeka na człowieka" w PolyFlow — po poprawce reguły wystarczy
  przeliczyć linki, i to jest praca kolejnej sesji, nie tej odnogi.

## Weryfikacja

- [ ] Na kopii dziennika PolyFlow (`git show HEAD:docs/DZIENNIK.md`) zakres rotacji liczony nową
      regułą obejmuje **co najmniej 50 wpisów** z 97 — liczba wypisana przed i po zmianie reguły.
- [ ] `ostatniWpis` zwraca ten sam wpis dla dziennika rosnącego w dół i dla jego odwrócenia —
      test na obu wariantach w jednym przebiegu.
- [ ] Pozycja `ryzyka` mierzona dla PolyFlow **maleje** po poprawce; różnica wypisana w KB.
- [ ] `SPEC_DZIENNIK.md` i `SPEC_ARCHIWUM.md` mówią o linku i o nietykalności **to samo** —
      sprawdzone czytaniem obu w jednym przebiegu, nie z pamięci.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.

## Wynik

**Odnoga wchłonięta 2026-09-01 przez etap E1 planu
[HIGIENA_DOKUMENTOW](../../plany/HIGIENA_DOKUMENTOW/STATUS.md).** Zakres tej karty (punkty 1–4)
wszedł w całości do zakresu tamtego etapu, a etap poszedł dalej, niż karta zakładała: zamiast
przenosić nietykalność wpisu linkowanego, zdejmuje ją i zastępuje **przepięciem linku** na plik
archiwum w fazie 2 rotacji.

Zmierzone w E1 na dzienniku PolyFlow sprzed rotacji `FAKT`: zakres rotacji **0 wpisów ze 127**
starą regułą wobec **117** nową (przekrój 2026-09-01) oraz **6 z 92** wobec **82**
(przekrój 2026-08-21). Funkcja `ostatniWpis` czyta kierunek dziennika z dat w nagłówkach —
na obu kierunkach, w wariancie CRLF i przy nagłówkach bez dat.

Punkt weryfikacji „pozycja `ryzyka` mierzona dla PolyFlow **maleje**" **nie potwierdził się jako
sformułowany**: poprawka sprawia, że pomiar bierze **właściwy** wpis, a nie mniejszy. Na przekroju
2026-08-21 właściwy wpis jest większy od dotychczas branego (9062 B wobec 6745 B). Kierunek zmiany
zależy od długości wpisów, nie od poprawki; wartością jest poprawność pomiaru.

Karta zostaje w repozytorium jako ślad (D-18). Szczegóły: wpis dziennika z 2026-09-01 o E1.
