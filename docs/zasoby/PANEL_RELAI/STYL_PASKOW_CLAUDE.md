# Styl pasków i panelu RelAI dla Claude Code

Wersja: **2** · Data: **2026-10-10** · Zakres: trzy paski nad promptem **i panel boczny** `/relai-panel`
(zakładki Komendy i Koszty) · Źródło decyzji: wątek [AUDYT_MODOW](../../fixy/AUDYT_MODOW/ODNOGA.md),
makiety [MAKIETY.html](../../fixy/AUDYT_MODOW/MAKIETY.html) (wersja 4, kalibracja z Łukaszem
w czterech rundach 2026-10-10).

Wersja 1 (2026-10-09, brief do E9 planu PANEL_CLAUDE) jest w historii gita tego pliku. Co zostaje
z wersji 1: tokeny kolorów (`BAND`, `BAR`, `THEME` w `core/panel/theme.mjs`), siatka etykieta |
treść | liczba, miękkie tła bez kolorowych ramek, natywne przyciski z błyskiem, reguła
„agregat i segmenty z jednej listy”. Co zmienia wersja 2: **ile paski mówią w spokoju** i **jak
mówią, gdy coś się dzieje**.

## 1. Zasada nadrzędna: pasek spokojny, pasek mówiący

Pasek nad promptem ma odpowiadać na cztery pytania bez klikania i bez czytania zdań:
**nad czym pracuję** (plan · etap · status), **jak daleko** (segmenty postępu), **czy cache
żyje** (czas do wygaśnięcia), **ile limitu zostało** (5 h, tydzień, kontekst). Wszystko inne —
przyciski, koszt ponownego zapisu, nazwa odhaczonego punktu, karta decyzji — pojawia się **tylko
wtedy, gdy ma powód**, jako drugi wiersz pod tym paskiem, którego zdarzenie dotyczy, i znika razem
z powodem. Wariant „C · Spokojny pasek” z makiet.

Zdarzenia, które otwierają drugi wiersz (każde ma źródło w pliku albo w `$.state`, więc
przeładowanie modu niczego nie gubi — P-023 pkt 6):

| Pasek | Zdarzenie | Drugi wiersz |
|---|---|---|
| plan | karta decyzji czeka na „Tak” (E5, R4) | tytuł karty jako chip, `Tak` (primary), `Nie`, zdanie „nic nie idzie do czatu bez „Tak”” |
| postęp | punkt właśnie odhaczony | chip `✓ 3/14 · <nazwa>` na 10 s, potem wiersz znika |
| cache | cache stygnie (`cooling`) | chip `stygnie · ponowny zapis ≈ $x`, `Podtrzymaj` (hotkey 1), `Przekaż` (hotkey h) |
| cache | przekazanie gotowe (`H.phase === 'ready'`) | chip `przekazanie gotowe`, `Wyczyść i kontynuuj` (primary, hotkey c), `Zostań` |
| cache | nowa sesja się opłaca (Z9: zwrot w ≤ 5 turach albo cache zimny i kontekst > 2× warstwa startu) | chip `nowa sesja zwróci się po N turach · ≈ $x → $y/turę · 0,8 % → 0,2 % limitu 5 h`, `Przekaż` (hotkey h), `Zostań`; pełny rachunek w `/cache` |

W spokoju: **zero przycisków na stałe**, trzy wiersze tekstu w sumie (po jednym na pasek)
plus linia pod segmentami postępu i drugi wiersz podpisów pierścieni (sekcje 3 i 4). Kolejność
pasków jak dziś: plan → postęp → cache.

## 2. Pasek planu

Jeden wiersz: `PANEL_CODEX · E1` (pogrubione, `BAR.text`) · `W TOKU` (pogrubione, `BAND.panel.color`)
· nazwa etapu (`BAR.muted`, obcinana wielokropkiem przed kolumną liczby). Po prawej `0/8` +
`etapów`. **Koszt sesji znika z tego paska** — stoi raz, w pasku cache. Etykieta kolumny lewej:
`plan` (bez „RelAI ·”; marka jest w kolorze). Brak planu albo plan nieczytelny — słowami jak dziś.

## 3. Pasek postępu

Wiersz pierwszy: segmenty (Svg na desktopie, znaki w terminalu) na całą szerokość kolumny
środkowej, obok chip `● N agentów · $x` gdy sesja ma subagentów (zamiast przycisku „Agenci”;
panel agentów otwiera się komendą `/relai-agents`). Przycisk „Panel RelAI” **znika z paska**.
Pod segmentami **stała mała linia** (font Svg ok. 11,5 px, `BAR.muted`): w spokoju
`w toku: <punkt ●> · następny: <punkt ○>` (albo tylko `następny: …`, gdy nic nie jest w toku);
po najechaniu na segment — `<znak> i/N · <nazwa punktu>` w `BAR.text`. Segmenty **nigdy** nie
znikają pod podpowiedzią. Wysokość Svg: dwie linie (segmenty 8 px + odstęp 4 px + linia 14 px).
Po prawej `2/14` + `punktów` (jeden format liczby dla wszystkich pasków: `a/b` + jednostka,
bez procentu z setnymi).

## 4. Pasek cache: cztery pierścienie z podpisem dwuliniowym

Wariant „K2 · Pierścienie” + „H3 · podpis dwuliniowy, bez hovera”. Jeden wiersz Svg
(wysokość ok. 24 px), w kolumnie środkowej od lewej:

| Pierścień | Linia 1 (`BAR.text`, ok. 11 px) | Linia 2 (`BAR.muted`, ok. 11 px) | Wypełnienie |
|---|---|---|---|
| cache | `Ciepły · ~60 min` / `Stygnie · ~4 min` / `Zimny · od 12 min` | `TTL 60 min` (+ „założony”, gdy TTL nie zmierzony) / w stanie zimnym `zapis ≈ $x` | czas pozostały z TTL, opróżnia się |
| 5 h | `11 % · 5 h` | `reset 17:20` | zużycie limitu 5 h |
| tydzień | `23 % · tydzień` | `reset jutro 10:00` | zużycie limitu tygodniowego (wszystkie modele) |
| kontekst | `259k · kontekst` | `z 1M · 26 %` | tokeny kontekstu z okna modelu |

Po pierścieniach `sesja ≈ $11.73` (`BAR.muted`; jedyne miejsce kosztu sesji nad promptem).
Po prawej `~60` + `min` (jak dziś; tylda, gdy TTL założony).

Geometria pierścienia: średnica 22 px, grubość 3,2 px, tor `#1d1b18`, zaokrąglone końce,
start od góry. Kolor wypełnienia mówi o stanie: szałwia (`BAR.segment.done`) do 70 %, musztarda
(`BAND.panel.color`) od 70 %, glina (`BAND.cache.color`) od 90 %; dla cache odwrotnie — pełny
tor szałwią, musztarda gdy zostaje ≤ 35 % TTL (stan `cooling`), glina gdy ≤ 15 % albo zimny.
Hover: wyłącznie pogrubienie pierścienia (4,4 px); **żadnego dymka ani nakładki** (H2 i nakładka
z v3 odrzucone 2026-10-10). Terminal: `◔ ◑ ◕ ●` + te same dwie linie tekstem w jednej.

Źródła liczb: `$.session.usage()` (`rateLimits` z `percentUsed` i czasem resetu, `context.tokens`
i okno modelu, `cost.usd`), `cacheState` z `cache-keeper/hooks/core.ts` (stan i `left`), TTL jak dziś.
Brak którejś liczby — pierścień pusty z podpisem `brak danych`, nie pozorne zero.

## 5. Wspólna geometria pasków (bez zmian wobec v1, przypomnienie)

Etykieta 14 komórek (v1: 16 — krótsza, bo bez „RelAI ·”), kolumna liczby 11 komórek, odstęp
między kolumnami 2 komórki, padding 1 komórka w poziomie; poniżej `BAR.narrow` kolumn etykieta
i liczba idą nad treść. Tła `BAND.*.bg`, ramka `round` w kolorze tła dla zaokrąglenia. Odstęp
między paskami 1 wiersz na desktopie, 0 w terminalu. Owijacz z `next(e)` bez `width` (P-017).

## 6. Panel boczny `/relai-panel` — zakładka Komendy (wariant P1)

1. **Nagłówek**: „Panel RelAI” (Svg Kalam, jak dziś) i w tym samym wierszu zakładki jako natywne
   przyciski: `Komendy · Koszty · Dokumenty · Mapa · Pomoc` (Ściąga i Frazy razem jako „Pomoc”;
   kolejność według użycia). Zdanie „14 komend RelAI · kliknij komendę…” **znika**.
2. **Pasek „Teraz”** (karta `THEME.cardFeatured` z ramką `THEME.mark`): wiersz 1 — `PANEL_CODEX · E1`,
   `W TOKU`, segmenty postępu (Svg), `2/14`; wiersz 2 — `następny: <punkt> · cache ciepły ~60 min ·
   3 agentów działa`; po prawej **jedna akcja główna** (`primary`): `Start etapu…` (otwiera kartę
   decyzji w tym samym miejscu), a gdy karta czeka — karta „Tak / Nie” zamiast paska.
   Liczy się z tych samych plików co paski (kopia `progress.mjs` w `relai-panel`), bez zależności
   między pluginami.
3. **Polecane teraz**: dwie karty (etap planu, optymalizator promptu) z ikoną 44 px — wycieczka
   schodzi do wierszy.
4. **Pozostałe 12 komend jako wiersze** w trzech grupach jak dziś: ikona 24 px, nazwa polska
   pogrubiona **i obok nazwa komendy** w `THEME.body` (np. `Etap planu /relai-stage`), cel jednym
   zdaniem w tej samej linii, przycisk `Otwórz` po prawej. Komenda niedostępna w sesji: wiersz
   przygaszony, przycisk `—`.
5. **Formularz otwiera się pod wierszem** (karta `THEME.cardOn`), nie wewnątrz karty; wiersz
   zostaje na miejscu. Przycisk wiersza zmienia się na `Zamknij`.

## 7. Panel boczny — zakładka Koszty (wariant P3)

Kafle zostają jak dziś (suma sesji z paskiem kategorii i legendą; licznik Claude Code; wejścia
z cache; cały projekt), procenty **bez setnych** (`96 %`). Sekcje poniżej — Etapy, Wywołania
w czasie, Agenci, Modele, Cennik — jako **zwinięte wiersze** (`THEME.card`): nagłówek Kalamem,
jednolinijkowe podsumowanie z najważniejszą liczbą sekcji, przycisk `▸ Rozwiń` / `▾ Zwiń`.
Stan rozwinięcia w `$.state` (`unfolded`), domyślnie wszystko zwinięte. Treść rozwiniętej sekcji
bez zmian wobec dziś.

## 8. Ograniczenia silnika (2.1.293) obowiązujące w tej wersji

P-017, P-018, P-020, P-021, P-023 bez zmian. Dla v2 najważniejsze: tekst w `Text` bez rozmiaru —
małe linie (podpisy pierścieni, linia pod segmentami) rysuje Svg; karta hover tylko wewnątrz Svg
(stąd brak dymków); klik tylko na `Button`; interaktywne Svg we własnym wierszu kolumny
(P-021 pkt 3) — do zmierzenia przy pierwszym uruchomieniu; natywny `Button` wyższy od wiersza
(P-021 pkt 6) — drugi wiersz zdarzenia z `marginTop`.

## 9. Kryteria odbioru v2

- [ ] Trzy paski w spokoju: 0 przycisków, wysokość ≤ 160 px na desktopie przy 1400 px
      (dziś 197 px); zrzut człowieka.
- [ ] Każde zdarzenie z tabeli w sekcji 1 otwiera drugi wiersz **tylko** pod swoim paskiem
      i zamyka go, gdy powód znika (test modu na każdy stan).
- [ ] Koszt sesji nad promptem dokładnie raz, w jednym formacie `usd()`.
- [ ] Segmenty widoczne podczas najechania; linia pod nimi zmienia treść (zrzut).
- [ ] Cztery pierścienie z dwiema liniami podpisu; kolory progów zmierzone testem na wartościach
      69/70/89/90 %; brak danych słowami.
- [ ] Panel: „Teraz” z jedną akcją główną; 14 komend bez przewijania przy 900 px; nazwa komendy
      obok polskiej; formularz pod wierszem; Koszty ze zwiniętymi sekcjami pamiętanymi w `$.state`.
- [ ] Terminal: odpowiednik tekstowy każdego elementu, test 40 kolumn.
