# Aneks B do odnogi AUDYT_MODOW — 2026-10-10 · Z13–Z14

Status: **ZAAKCEPTOWANY 2026-10-10** (Łukasz w sesji kalibracyjnej Z11: „Aneks B odnogi: Z13 i Z14”).
Źródło: dwie uwagi Łukasza po kalibracji paska cache (sesja Fable 5.1), zapisane słowo w słowo
niżej. Wykonawca: **Opus 5.5**, po wdrożeniu Z11; projekt UX w tym aneksie jest wystarczający
do wdrożenia bez nowej kalibracji — obie paczki powtarzają wzorce już zaakceptowane (przycisk
natywny w drugim wierszu paska, sekcje zwinięte jak w zakładce Koszty, fokus sesji z Z12).

## Dwie sprawy

| Paczka | Co | Typ |
|---|---|---|
| Z13 | Pasek „plan” bez wybranej pracy mówi, co zrobić, zamiast dać to zrobić | brak drogi z paska do panelu |
| Z14 | Zakładka Mapa pokazuje PANEL_CODEX i rozwinięte archiwum, choć sesja pracuje na odnodze | treść bez fokusu, bez zwijania |

## Z13 · Pasek plan: przycisk do ustawienia fokusu

**Słowa Łukasza:** „jeżeli nie mamy wybranego żadnego aktywnego planu i mamy tą informację, że
trzeba przejść i ustawić go w panelu, to chciałbym, żeby był przycisk, który od razu otwiera ten
panel, jeżeli on nie jest otwarty, i przechodzi tam do tych ustawień tego aktywnego planu […]
ewentualnie całe to ustawianie i zmianę planu, żeby nie trzeba było tego robić w panelu”.

**Stan faktyczny.** `panel/hooks/band.tsx` (linia ~37) rysuje w stanie `isAsking`: „ta sesja:
praca nie wybrana — „Zmień” w panelu, Teraz” — zdanie bez żadnej akcji. Wybór fokusu („Zmień”
w pasku „Teraz”, `pane-now.tsx`) listuje otwarte etapy aktywnego planu, otwarte odnogi i „poza
planem” (Z12).

| Wariant | Plusy | Minusy | |
|---|---|---|---|
| A. Drugi wiersz paska plan z przyciskiem `Wybierz pracę…` (natywny, `secondary`), który otwiera panel (`$.ui.open`) na zakładce Komendy z rozwiniętym wyborem fokusu w „Teraz”; wiersz znika, gdy fokus jest ustawiony | zgodne z briefem v2 §1 (drugi wiersz tylko przy zdarzeniu — brak fokusu jest zdarzeniem); jeden klik; zero nowej logiki wyboru | panel musi przyjąć sygnał „otwórz z rozwiniętym wyborem” (atom `$.state`) | **wybrany** |
| B. Cały wybór fokusu w drugim wierszu paska (lista przycisków: etapy, odnogi, „poza planem”) | bez otwierania panelu | lista bywa długa (kilka etapów + odnogi) — pasek nad promptem rośnie, wbrew Z1; duplikacja logiki z `pane-now.tsx` | odrzucony, chyba że lista ≤ 3 pozycji — wtedy wolno pokazać je wprost zamiast `Wybierz pracę…` (decyzja wykonawcy po pomiarze) |

**Zakres:** `panel/hooks/band.tsx` (drugi wiersz z przyciskiem, `CHIP.info` jako tło zdania),
`panel/hooks/register.tsx` (obsługa naciśnięcia: `$.ui.open` + atom „pokaż wybór”),
`panel/hooks/pane-now.tsx` (rozwinięcie wyboru na wejściu). Testy `band.test.ts` (wiersz tylko
w `isAsking`, znika po wyborze) i `pane-v2.test.ts` (otwarcie z rozwiniętym wyborem).

**Weryfikacja Z13:** brak fokusu → przycisk na pasku plan; klik otwiera panel z widocznym wyborem
(zrzut); po wyborze pasek wraca do jednego wiersza; z fokusem ustawionym przycisku nie ma (test).

## Z14 · Mapa: fokus sesji na górze, sekcje zwinięte

**Słowa Łukasza:** „mimo tego, że mamy wybrany plan, nad którym pracujemy w danej sesji […] i tak
widzę w mapie przepływów PANEL_CODEX i tam mam jego koszty, i mam tylko archiwum planów na liście.
[…] żeby ona była tak jak zakładka Koszty, że domyślnie ma pozwijane różne rzeczy, które można
sobie rozwinąć. Nie potrzebuję mieć rozwiniętych wszystkich sekcji z archiwum planów, nie dość, że
to co chwilę miga, to jest mi niepotrzebne. […] w mapie przepływów też powinien być ten plan czy ta
odnoga, cokolwiek mamy teraz wybrane jako aktualnie realizowane w ramach tej sesji”.

**Stan faktyczny.** `panel/hooks/pane-map.tsx`: sekcje `map` (aktywny plan z `STATUS.md`),
`map-open` („Inne plany”), `map-crew`, `map-outside`, `map-archive` (archiwum, wszystkie karty
rozwinięte, „ostatnio zamknięty na górze”); fokus sesji (Z12, `focus.ts`) nie wchodzi do mapy.

| Wariant | Plusy | Minusy | |
|---|---|---|---|
| A. Na górze sekcja **„Ta sesja”** z kartą fokusu (odnoga z paczkami albo etap planu, koszt sesji przypisany do fokusu z pomiarów), potem aktywny plan jako zwykła karta, dalej sekcje jak w Kosztach: nagłówek Kalamem, jednolinijkowe podsumowanie z liczbą (np. „12 planów zamkniętych · $412”), `▸ Rozwiń` / `▾ Zwiń`, stan w `$.state` (`unfolded`, jak Koszty), domyślnie **wszystko zwinięte poza „Ta sesja”** | jeden wzorzec zwijania w dwóch zakładkach; drzewo mapy lekkie (tylko podsumowania), więc koniec migania (P-023 pkt 7); fokus widoczny tam, gdzie liczy się przepływ | karta fokusu dla odnogi wymaga przeliczenia paczek z karty (`progress.mjs` już to robi dla paska postępu — do ponownego użycia) | **wybrany** |
| B. Tylko zwinięcie archiwum, reszta bez zmian | najmniej pracy | PANEL_CODEX dalej na górze, choć sesja go nie dotyka — główna uwaga Łukasza niezałatwiona | odrzucony |

**Zakres:** `panel/hooks/pane-map.tsx` (sekcja „Ta sesja”, sekcje zwijane z podsumowaniem,
`unfolded` w `$.state` — ten sam kształt co `pane-costs.tsx`), `panel/hooks/tab-data.ts`
(fokus do danych mapy), `core/panel/theme.mjs` (`HEADINGS`: `map-session` „Ta sesja”, wygenerowane
`headings.mjs` przez `build-panel-headings.js`). Rdzeń poza `theme.mjs` nietykalny (`flow.mjs`
czytany, nie zmieniany). Testy `map.test.ts`: fokus na górze, archiwum zwinięte domyślnie, waga
drzewa zwiniętej mapy poniżej progu z `redraw.test.ts`.

**Weryfikacja Z14:** przy fokusie na odnodze AUDYT_MODOW góra mapy pokazuje odnogę z paczkami
i jej kosztem (zrzut); archiwum i inne plany zwinięte do jednej linii z liczbą; rozwinięcie
pamiętane po przeładowaniu; liczba Svg i znaków zwiniętej mapy w teście.

## Do rozstrzygnięcia przez człowieka (przed startem Z13)

- ~~Wariant B Z13 (wybór wprost na pasku przy ≤ 3 pozycjach) — zgoda na decyzję wykonawcy po
  pomiarze czy zawsze przycisk `Wybierz pracę…`?~~ *(rozstrzygnięte 2026-10-11, Łukasz: **zawsze
  przycisk `Wybierz pracę…`** — jeden wzorzec, pasek nigdy nie rośnie, wybór w „Teraz”; wariant B
  odrzucony na stałe)*

## Wykonanie (2026-10-11)

Z13 i Z14 wykonuje **Opus 5.5 jako subagent sesji Fable 5.1** (decyzja Łukasza 2026-10-11; Fable
orkiestruje: prompt, przegląd kodu, pomiar z Łukaszem, rytuał zamknięcia). Prompt wdrożenia:
[PROMPT_Z13_Z14_WDROZENIE.md](PROMPT_Z13_Z14_WDROZENIE.md).
