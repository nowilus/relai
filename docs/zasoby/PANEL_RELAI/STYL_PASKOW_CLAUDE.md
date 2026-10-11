# Styl pasków i panelu RelAI dla Claude Code

Wersja: **3.5** (v3.4 + 11.3: karta „Próg limitu” jako linijka z progiem i przyciski wartości; Aneks E, 2026-10-11; v3.4 — 11.1: podpis „próg N % · źródło” pod baterią limitu, która nie jest spokojna; Aneks D, 2026-10-11; v3.3 — sekcja 11: limit planu — dwa progi, zapis i wznowienie, karta progu w Kosztach; LIMIT_CHECKPOINT E4, 2026-10-11) · Data: **2026-10-10** · Zakres: trzy paski nad promptem **i panel boczny** `/relai-panel`
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
| cache | zapis pracy przed limitem (LIMIT_CHECKPOINT, sekcja 11) | chip `zapis pracy trwa` / `zapis gotowy · reset GG:MM` / `zapis niepełny` + `Zamknij`; po resecie i z plikiem wznowienia `limit odnowiony · praca czeka na wznowienie` + `Wznów pracę` (primary), `Odrzuć` |
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

> **Zastąpione Aneksem Z11 (2026-10-10, sekcja 10 niżej):** pasek cache rysuje pięć baterii w jednym
> wierszu, koszt sesji stoi w kolumnie liczby, czas cache tylko w podpisie baterii. Sekcja 4 zostaje
> jako zapis wariantu K2 + H3 i źródło słów dymka.

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

- [ ] Trzy paski w spokoju: 0 przycisków, wysokość ≤ 175 px na desktopie przy 1400 px
      (dziś 197 px; Aneks Z11: próg 160 → 175, bo zaokrąglona ramka kosztuje zmierzone ~26 px na
      pasek, a Łukasz wybrał ramkę); zrzut człowieka.
- [ ] Każde zdarzenie z tabeli w sekcji 1 otwiera drugi wiersz **tylko** pod swoim paskiem
      i zamyka go, gdy powód znika (test modu na każdy stan).
- [ ] Koszt sesji nad promptem dokładnie raz, w jednym formacie `usd()`.
- [ ] Segmenty widoczne podczas najechania; linia pod nimi zmienia treść (zrzut).
- [ ] ~~Cztery pierścienie z dwiema liniami podpisu~~ → Aneks Z11: pięć baterii od lewej krawędzi
      kolumny treści, słowa `etykieta · wartość`, dymek z pełnym opisem przy ikonie; kolory progów
      zmierzone testem na wartościach 69/70/89/90 %; brak danych słowami.
- [x] Panel: „Teraz” z jedną akcją główną; 14 komend bez przewijania przy ~~900 px~~ **1100 px**
      (2026-10-11, decyzja Łukasza: „Teraz” dostało po Z12 trzecią linię z fokusem sesji i „Zmień”,
      zmierzone 1046 px CSS — linia zostaje, próg rośnie); nazwa komendy obok polskiej; formularz
      pod wierszem; Koszty ze zwiniętymi sekcjami pamiętanymi w `$.state`.
- [ ] Terminal: odpowiednik tekstowy każdego elementu, test 40 kolumn.

## 10. Aneks Z11 (2026-10-10) — pasek cache: pięć baterii, koszt po prawej, dymek przy ikonie

Kalibracja w prawdziwym nośniku (sonda `cache-probe`, sesja Fable 5.1, 2026-10-10, siedem rund
zrzutów Łukasza). Źródło: [PROMPT_Z11_FABLE.md](../../fixy/AUDYT_MODOW/PROMPT_Z11_FABLE.md),
zrzut wejściowy [2026-10-10-paski-po-z8.png](../../fixy/AUDYT_MODOW/zrzuty/2026-10-10-paski-po-z8.png).
Aneks zastępuje sekcję 4 i precyzuje sekcje 1 i 5 dla paska cache; reszta briefu bez zmian.

### 10.1 Co było źle i dlaczego (pomiar, nie odczucie)

1. **Pierścienie ok. 400 px od lewej, treść pozostałych pasków 213 px.** Etykieta i drugi wiersz
   stały w siatce; przesunięty był wyłącznie `Svg` pierścieni: markup miał stałą szerokość
   (~872 px), a ramka interaktywnego `Svg` bierze całą kolumnę środkową (1271 px) i **centruje**
   rysunek: (1271 − 872) / 2 = 200 px. Pasek postępu rysuje segmenty z `width="100%"` i dlatego
   trzyma lewą krawędź. Lekarstwo: markup `width="100%"` bez `viewBox`, elementy od `x = 0`.
2. `~59 min` dwa razy (pierścień i kolumna liczby), `sesja ≈ $` zawieszone między pierścieniami
   a prawą krawędzią, drugi wiersz pod przesuniętymi pierścieniami, pomarańczowy chip Z9 jak alarm.
3. Komórka siatki na desktopie to **~9,8 px** przy oknie 1640 px (16 komórek etykiety i odstępu
   = 157 px), nie 8 px jak zakładał kod — `middlePx` zaniżało kolumnę o ~18 %.
   **Sprostowanie 2026-10-11 (wdrożenie Z11):** 157 px to piksele zrzutu, ~1,2× piksele CSS,
   w których rysuje `Svg`; komórka to ~8,2 px CSS i kod liczy 8 px (P-024 pkt 3). Z 9,8 px piąta
   bateria i jej dymek ucinały się przed złamaniem wiersza. Wszędzie niżej „9,8 px” czytaj „8 px”.
4. Jeden wiersz tekstu ma ~22 px, pasek z zaokrągloną ramką ~48 px: **ramka kosztuje ~26 px na
   pasek**, trzy paski w spokoju ≈ 172 px. Decyzja Łukasza: ramka zostaje, próg kryterium 160 → 175 px.

### 10.2 Decyzje kalibracji (kolejno, każda „tak” Łukasza w czacie)

| Runda | Pokazane | Wybór |
|---|---|---|
| 1 | pierścienie od lewej, koszt po prawej, chip Z9 neutralny | kierunek przyjęty: **koszt sesji w kolumnie liczby**, ramka zostaje, chip Z9 neutralny, odstęp nad drugim wierszem **tak** |
| 2 | trzy języki: kapsuły, lampki (typografia), bateria z polami | **bateria**; odrzucone: zamiana napisu po najechaniu (nieintuicyjna), pola stojące *między* napisami (nie wiadomo, czyj napis) |
| 3 | pięć wiązań napis–bateria: B1 napis nad polami, B2 pola pod napisem, B3 pola przed napisem, B4 ikona baterii, B5 kreska pod napisem | B1, B4, B5 w grze; za dużo słów |
| 4 | gramatyki tekstu: pełny / zwięzły / minimalny, kreska B5 pogrubiona | **B4 w gramatyce minimalnej** |
| 5 | B4 minimalny + dymek z pełnym opisem przy ikonie | przyjęty |
| 6 | słowo „limit” w etykietach, piąta bateria „reset za” | **przyjęty jako ostateczny** („Jest dobrze”) |

### 10.3 Wiersz baterii — geometria w liczbach

Jeden interaktywny `Svg` (`isInteractive`, własny wiersz kolumny — P-021 pkt 3) o markupie
`width="100%"` i wysokości **24 px**, tło `BAND.cache.bg`; wszystkie pięć miar w tym jednym
rysunku (inaczej dymek nie przysłoni sąsiadów). Gdy suma szerokości miar przekracza szerokość
kolumny (`middlePx`, komórka 9,8 px), miary łamią się na kolejne wiersze `Svg` tej samej budowy.

| Element | Wartość |
|---|---|
| font | `system-ui, 'Segoe UI', sans-serif`, **14,5 px**; etykieta `BAR.muted`, wartość `BAR.text` **600** |
| ikona baterii | 26 × 12 px, y = 6: korpus 22 × 10,5 (x 0,75, y 0,75, rx 3, `stroke` `BAR.muted` 1,5 px, bez wypełnienia), styk 2 × 5 (rx 1, `BAR.muted`), wypełnienie od (2,5; 2,5), wysokość 7, szerokość 18 × udział, rx 1,5, kolor stanu |
| odstępy | ikona → tekst 8 px, etykieta → wartość 7 px, między miarami 30 px; linia bazowa tekstu y = 17 |
| cel najechania | prostokąt ikony poszerzony o 3 px z każdej strony, pełna wysokość wiersza |
| dymek | kapsuła 22 px (rx 11), padding 11, tło `mix(BAND.cache.bg, BAR.text, 0.14)`, cień `drop-shadow(0 1px 2px rgba(0,0,0,.45))`, font 13 px: linia a `BAR.text` 600, linia b `BAR.muted` 9 px dalej; 6 px na prawo od ikony, a gdy prawa krawędź wyszłaby poza kolumnę — 6 px na lewo od ikony; rysowany **po wszystkich miarach** (maluje się nad sąsiadami); CSS `.iN:hover ~ .tN { display: inline }`, `.t { display: none }` |
| wskaźnik | dymek nigdy nie zakrywa ikony, więc kursor na ikonie trzyma dymek bez migania; **żadnego innego hovera** (pogrubienie ikony odrzucone razem z zamianą napisu) |
| wypełnienie i kolor | **jak w telefonie: bateria pokazuje, ile ZOSTAŁO** (1 % zużycia → 99 % pełna, 99 % zużycia → 1 % pełna), a liczba obok mówi to, co liczy aplikacja (zużycie). Jedna reguła koloru dla wszystkich baterii, od tego, ile zostało: szałwia, **musztarda ≤ 30 %**, **glina ≤ 10 %** (`BATTERY.warn` / `BATTERY.alert` w motywie; zastępuje progi 70/90 zużycia i 35/15 cache). Wyjątek: `reset za` zawsze szałwia |

### 10.4 Pięć miar — słowa, wypełnienie, kolor, dymek

Gramatyka inline: **etykieta (przygaszona) · wartość (pogrubiona)** i nic więcej; szczegół
wyłącznie w dymku. Dymek = dzisiejszy podpis pierścienia: linia a (pogrubiona) · linia b.

| # | Etykieta | Wartość | Wypełnienie i kolor | Dymek (a · b) |
|---|---|---|---|---|
| 1 | `cache` | `~59 min` (tylda, gdy TTL założony) / `stygnie ~12 min` / `zimny` / `podtrzymany do 14:20` / `brak danych` | czas pozostały z TTL, opróżnia się; kolor od % TTL, który został (30/10), zimny zawsze glina | `Ciepły · ~59 min · TTL 60 min założony`; zimny: `Zimny · od 5 min · zapis ≈ $1.86` |
| 2 | `limit 5 h` | `64 %` (zużycie, jak w `/usage`) | **100 − `percentUsed`** (36 % pełna), kolor od tego, ile zostało (30/10) | `64 % · 5 h · zużyte 64 % · zostało 36 % · reset jutro 00:20` |
| 3 | `reset za` | `1 h 06 min` / `12 min` | czas do `resetsAt` okna 5 h podzielony przez 5 h, opróżnia się; **zawsze szałwia** (reset to nie alarm) | `Reset limitu 5 h za 1 h 06 min · reset jutro 00:20` |
| 4 | `limit tygodnia` | `41 %` (zużycie) | **100 − `percentUsed`** (59 % pełna), kolor jak wyżej | `41 % · tydzień · zużyte 41 % · zostało 59 % · reset jutro 12:00` |
| 5 | `kontekst` | `323k` (zużyte tokeny, jak liczy aplikacja) | **(okno − zużyte) / okno** (68 % pełna), kolor jak wyżej | `323k · kontekst · zużyte 323k z 1M · wolne 68 %` |

Decyzja Łukasza 2026-10-10: „tekst obok to 300k, ale bateria na 70 % zapełnienia na zielono” — liczba
niesie zużycie (to, co pokazuje aplikacja), bateria niesie zapas; dymek mówi obie strony.
Słowo stanu cache pojawia się inline tylko, gdy jest nowiną (`stygnie`, `zimny`, `podtrzymany`);
w spokoju sama liczba. Brak którejś liczby: bateria pusta (sam obrys), wartość `brak danych`,
dymek `<nazwa> · brak danych` — nigdy pozorne zero. Format liczb jak dotąd: `tokens()`, procent
całkowity ze spacją przed `%`, czas `h`/`min` z minutami dwucyfrowymi po godzinie.

### 10.5 Kolumna liczby i drugi wiersz

- Kolumna liczby: **`$14.93`** (pogrubione, `BAR.text`) + `sesja` (`BAR.muted`); bez kosztu:
  `brak danych` + `kosztu`. Koszt sesji nad promptem stoi **tylko tu**; czas cache nie stoi po prawej.
- Drugi wiersz (sekcja 1 bez zmian co do zdarzeń i priorytetu): `marginTop` 1 na desktopie, chip
  + przyciski natywne w jednym wierszu od kolumny treści. Kolory chipa: `stygnie` `CHIP.warn`,
  `przekazanie gotowe` `CHIP.ok`, `trwa`/`podtrzymany` `CHIP.run`, **zdarzenie Z9 — nowy token
  `CHIP.info`**: tło `mix(BAND.cache.bg, BAR.text, 0.1)`, prowadzenie `nowa sesja zwróci się po N
  turach` pogrubione `BAR.text`, reszta ` · ≈ $x → $y/turę` `BAR.muted`. Informacja, nie alarm.

### 10.6 Terminal i wąska kolumna

- Terminal: na miarę glif `○ ◔ ◑ ◕ ●` w kolorze stanu, potem `etykieta wartość` jak inline
  (`◑ limit 5 h 64 %`), miary w jednym zawijanym wierszu rozdzielone trzema komórkami; dymka nie
  ma, więc linia b **nie znika**: idzie po wartości przygaszona (`reset jutro 00:20`). Koszt sesji
  w kolumnie liczby jak na desktopie.
- Poniżej `BAR.narrow` (90 kolumn): etykieta i liczba nad treścią (jak dziś), wiersz baterii
  łamie się na dwa–trzy `Svg`; dymek przerzuca się na lewo od ikony, gdy nie mieści się po prawej.

### 10.7 Zakres wdrożenia i kryteria

Zmiany wyłącznie w `cache-keeper/` (`register.tsx`: `band`, `bandView`, `cacheFigure`,
`secondRow`; `rings.ts` → rysunek baterii; testy) i `core/panel/theme.mjs` (`CHIP.info`,
`BATTERY` z geometrią i progami 30/10 zapasu, `leftColor(leftPercent, isCold)`; `usageColor`
i `cacheColor` zostają dla panelu, pasek cache ich nie woła); `bar-card.tsx` bez zmian (siatka
wspólna). Kryteria:

- [ ] treść trzech pasków zaczyna się w tej samej kolumnie (zrzut przy 1400 i 1640 px);
- [ ] czas cache narysowany raz, koszt sesji raz (testy);
- [ ] bateria = zapas, liczba = zużycie: test na 1 % / 64 % / 99 % zużycia (99 % / 36 % / 1 % pełna,
      szałwia / szałwia / glina) i na 29 % / 10 % zapasu (musztarda / glina); `reset za` szałwia przy 5 %;
- [ ] pięć baterii, słowa z tabeli 10.4, dymek po najechaniu na ikonę 2. i 3. miary nad sąsiadami,
      przerzut na lewo przy ostatniej miarze w wąskim oknie (zrzuty);
- [ ] trzy paski w spokoju ≤ 175 px przy 1400 px;
- [ ] od 900 do 1640 px bez rozjazdu (zrzut 900/1000 px);
- [ ] terminal: test montażu z pięcioma miarami i linią b.

## 11. Limit planu: dwa progi, zapis i wznowienie (v3.3, LIMIT_CHECKPOINT E4, 2026-10-11)

Źródło: plan [LIMIT_CHECKPOINT](../../plany/LIMIT_CHECKPOINT/STATUS.md), Aneksy B i C; miejsce
ustawienia progu zaproponował Fable 5.1, Łukasz przyjął 2026-10-11 („Panel → Koszty, bez
podpowiedzi”).

### 11.1 Kolor baterii limitu od progu

- **Dwa progi, każdy dla swojej baterii:** `limit 5 h` od `Próg limitu` (domyślnie 90 %),
  `limit tygodnia` od `Próg limitu tygodnia` (domyślnie 98 %). Od progu bateria jest **glina**
  bez względu na to, ile zostało; poniżej — reguła 10.3 (30/10 zapasu).
- Dymek baterii kończy linię b członem `· próg N %` — próg **tej** baterii. Terminal: to samo
  w linii b po wartości.
- `reset za` pokazuje dalej reset okna 5 h. Reset tygodnia trafia na kartę i do drugiego wiersza
  wyłącznie wtedy, gdy przekroczony jest próg tygodnia.
- **Podpis pod baterią (v3.4, Aneks D, wariant W3 z makiety czterech wariantów):** bateria limitu,
  która **nie jest spokojna** (musztarda albo glina), dostaje pod etykietą, od jej lewej krawędzi,
  drugą linię 11 px w `BAR.muted`: `próg N % · <źródło>` — „ta sesja” / „ten projekt” /
  „wszystkie projekty” / „domyślny”. Spokojna albo bez danych — nic; inne miary — nigdy. Wiersz
  baterii ma wtedy 36 px zamiast 24 (tylko wiersz z podpisem); miara z podpisem szerszym od napisu
  poszerza się (szerokość znaku 5,3 px — zmierzone 4,9 w Chromium), więc sąsiedzi się przesuwają.
  Dymek bez zmian. Terminal bez zmian — linia b ma już `próg N %`.

### 11.2 Drugi wiersz paska cache przy zapisie pracy

Drugi wiersz w tej kolejności priorytetów: przekazanie (sekcja 1) → zapis pracy → stygnie →
zdarzenie Z9 → podtrzymany.

| Stan | Chip | Kolor chipa | Przyciski |
|---|---|---|---|
| zapis trwa | `zapis pracy trwa` | `CHIP.run` | — |
| zapis gotowy, przed resetem | `zapis gotowy · reset GG:MM` (inny dzień: `DD.MM GG:MM`; bez czasu: `reset nieznany`) | `CHIP.ok` | — |
| po resecie, plik wznowienia jest | `limit odnowiony · praca czeka na wznowienie` | `CHIP.ok` | `Wznów pracę` (primary), `Odrzuć` (secondary) |
| wznawianie | `wznawiam pracę` | `CHIP.run` | — |
| zapis niepełny | `zapis niepełny` | `CHIP.warn` | `Zamknij` (secondary) |

Każdy przycisk otwiera kartę `$.ui.ask` przed działaniem: `Wznów pracę` → „Wznów / Nie teraz”
(potem `/clear` i fraza wznowienia), `Odrzuć` → „Odrzuć / Zostaw” (potem prośba do czatu
o skasowanie pliku). Bez hotkeyów (cyfra w pustym polu naciskała przycisk, Z5).

### 11.3 Karta „Próg limitu” w panelu, zakładka Koszty

- Miejsce: pod trzema kaflami, nad sekcjami zwiniętymi; karta `costBox` (`THEME.card`).
- Treść (v3.5, Aneks E — hybryda W1 „linijka z progiem” + przyciski wartości z W3, wybór Łukasza
  z makiety trzech wariantów): nagłówek `Próg limitu` (`THEME.title`, pogrubiony), **bez linii
  podpowiedzi**, wiersz na okno w trzech częściach, `flexWrap`:
  - **nazwa** (min. 15 komórek, `flexShrink={0}`): `limit 5 h` pogrubione, pod nim `próg: <źródło>`
    (`ta sesja` / `ten projekt` / `wszystkie projekty` / `domyślny`) w `THEME.body`;
  - **linijka** (`flexGrow`, min. 20 komórek): jedno `Svg isInteractive` szerokości 100 %, 46 px —
    tor 0–100 % (`THEME.lineOff`), wypełnienie do zużycia teraz w kolorze reguły baterii
    (szałwia, musztarda ≤ 30 % zapasu, glina od progu albo ≤ 10 %), pionowa kreska progu
    (`THEME.title`) z napisem `próg N %` po stronie z miejscem (próg ≥ 50 — z lewej), pod torem
    `zużyte X % · do progu Y pkt` / `zużyte X % · ponad progiem` / `brak danych o zużyciu`.
    Linie bazowe 13 i 42 px zmierzone w Chromium (pudełko linii 12 px: 12,8 nad, 3,2 pod).
    Terminal: zamiast linijki tekst `próg N % · <słowa>`;
  - **przyciski wartości** (`flexShrink={0}`, zawijają się): 5 h `85 % · 90 % · 95 %`, tydzień
    `95 % · 98 % · 99 %`, plus wartość bieżąca spoza listy w kolejności; bieżąca `primary`,
    reszta `secondary`; na końcu `Inna…`.
- Wartość uruchamia `/cache limit-warn N` albo `/cache limit-warn-week N` pluginu
  `relai-cache-keeper` — od razu karta zasięgu (`Ta sesja` / `Ten projekt` / `Wszystkie projekty` /
  `Nie zapisuj`); `Inna…` — komenda bez liczby: karta wartości, potem zasięgu. Nagłówek karty ma
  najwyżej 12 znaków (`Próg 5 h`, `Próg tydzień`, P-026). Zużycie z `session.measure`
  (`rateLimits`) i `$.session.usage()` na starcie.
- Pasek nad promptem w spokoju **bez zmian**: zero przycisków progu.

### 11.4 Kryteria

- [ ] bateria tygodnia od progu tygodnia, bateria 5 h od swojego (test);
- [ ] drugi wiersz: przed resetem bez przycisków, po resecie z plikiem `Wznów pracę` i `Odrzuć`,
      bez pliku — bez przycisków (testy);
- [ ] karta `Próg limitu` w Kosztach w 40 kolumnach bez rozjazdu; zrzut na żywo z desktopu.

