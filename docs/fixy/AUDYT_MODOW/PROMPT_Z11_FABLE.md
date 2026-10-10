# PROMPT_Z11_FABLE — pasek „cache”: przebudowa układu (makiety, kalibracja smaku)

Odnoga: AUDYT_MODOW • Paczka: **Z11 · Pasek cache** (Aneks A z 2026-10-10) • Wygenerowano:
2026-10-10 (autor: Opus 5.5, sesja wykonawcza wątku) • Wykonawca: **Fable 5.1**, `/effort high`

> **Kontrola modelu:** tę paczkę projektowo prowadzi wyłącznie model klasy **strong** z decyzją
> Łukasza „propozycje UX/UI tylko od Fable”: **Fable 5.1** (`claude-fable-5-1`, lista modeli z dnia
> `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś o przełączenie, zanim
> cokolwiek zrobisz. Makiet, wariantów i argumentacji wyglądu nie zlecasz subagentom; subagenci
> (Opus 5.5, najwyżej trzech) wolno ci użyć do czytania kodu i pomiarów.

Ta sesja **projektuje i kalibruje**, nie wdraża. Wynik: jeden wariant do kalibracji smaku
w prawdziwym nośniku, po akceptacji 1–2 kolejne, wybrany wariant opisany w briefie v2 tak, żeby
sesja Opus wdrożyła go bez zgadywania. Kod produkcyjny `cache-keeper/` zmienia dopiero sesja
wdrożeniowa — chyba że Łukasz wprost każe inaczej.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu i sekcja niemutowalna; aktywny plan PANEL_CODEX, którego rdzenia nie dotykasz |
| `docs/fixy/AUDYT_MODOW/ANEKS_A.md`, sekcja „Z11” | skąd paczka, co jest źle, zakres zmian, kryteria |
| `docs/fixy/AUDYT_MODOW/zrzuty/2026-10-10-paski-po-z8.png` | zrzut Łukasza (okno 1640 px): trzy paski nad promptem po wydaniu Z8 |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` | brief v2: §1 zasada „pasek spokojny, pasek mówiący”, §4 pasek cache (pierścienie K2 + podpis H3), §5 wspólna geometria, §8 ograniczenia silnika |
| `docs/PULAPKI.md`, P-017…P-023 | zmierzone zachowania silnika modów: Svg i jego szerokość (P-020 pkt 7), interaktywne Svg we własnym wierszu (P-021 pkt 3), natywny `Button` wyższy od wiersza (P-021 pkt 6), klik tylko w `Button` (P-023 pkt 7a) |
| `cache-keeper/hooks/register.tsx` (`band`, `bandView`, `secondRow`, `middlePx`), `cache-keeper/hooks/rings.ts` (`ringRows`), `cache-keeper/hooks/bar-card.tsx` | jak pasek jest dziś zbudowany |
| `core/panel/theme.mjs` (`BAND`, `BAR`, `RING`, `CHIP`) | paleta i siatka trzech pasków — jedyny plik rdzenia, który wolno zmienić |
| `docs/fixy/AUDYT_MODOW/MAKIETY.html` | cztery rundy kalibracji pasków z tego wątku — tylko jako tło, wariantów stamtąd nie powtarzasz |

## Co jest źle (Łukasz, 2026-10-10: „to rozmieszczenie jest jakieś dziwne … wygląda po prostu brzydko”)

Odczyt zrzutu (do potwierdzenia pomiarem, nie zgadywania):

1. **Brak wspólnej siatki trzech pasków.** Treść paska „plan” i „postęp” zaczyna się ok. 213 px od
   lewej; pierścienie paska „cache” ok. 400 px. Prawdopodobna przyczyna: wiersz `Svg` pierścieni
   bez `width` wyśrodkowany w kolumnie środkowej (P-020 pkt 7) — do zmierzenia.
2. **Ta sama informacja dwa razy:** `~59 min` w podpisie pierścienia cache i jako liczba po prawej.
3. **Koszt sesji wisi:** `sesja ≈ $69.55` między ostatnim pierścieniem a prawą krawędzią, bez
   własnego miejsca w siatce.
4. **Drugi wiersz nie trzyma kolumn pierwszego:** pigułka „nowa sesja zwróci się po 4 turach ·
   ≈ $0.13 → $0.01/turę”, `Przekaż (RelAI)` i `Zostań` stoją pod pierścieniami bez wyrównania.
5. **Pomarańczowa pigułka wygląda jak alarm,** a niesie informację (ekonomika przekazania, Z9).
6. Pasek cache jest wyraźnie wyższy od dwóch pozostałych w spokoju (kryterium Z1: trzy paski
   ≤ 160 px przy oknie 1400 px — dziś niespełnione).

## Ograniczenia (twarde)

- Nośnik: mody Claude Code 2.1.295 na desktopie (i terminal jako drugi). Tekst w `Text` ma jeden
  rozmiar; małe podpisy rysuje `Svg`. Klikalne wyłącznie `Button` (link w `Markdown` gubi co drugi
  klik — P-023 pkt 7a). Natywny `Button` rysuje się po swojemu: kolor tekstu w środku znika.
- Siatka wspólna z paskami „plan” i „postęp”: etykieta `BAR.labelColumn` (14 komórek), treść,
  kolumna liczby `BAR.figureColumn`; `bar-card.tsx` jest **tym samym plikiem w trzech pluginach**
  (test równości) — zmiana siatki to zmiana dla wszystkich trzech pasków.
- Zakres zmian sesji wdrożeniowej: `cache-keeper/` i `core/panel/theme.mjs`; nic w
  `core/panel/*.mjs` poza `theme.mjs`, nic w `adapters/codex/`.
- Zasada briefu v2 §1 zostaje: w spokoju zero przycisków, drugi wiersz tylko przy zdarzeniu,
  jeden na raz.
- Szerokości: od 900 px do 1640 px okna bez rozjazdu; poniżej `BAR.narrow` etykieta i liczba nad treścią.

## Smak Łukasza (stałe ustalenia — czytaj zanim narysujesz)

- **Odrzucone na stałe:** konsola monospace, panel administracyjny, rysunek techniczny / blueprint,
  plakat brutalistyczno-szwajcarski. Nie proponujesz ich ani jako wariantu, ani jako inspiracji.
- **Czego chce:** zaokrąglenia, lekkość, „wigor”; elementy jednego paska trzymają się razem
  i oddziela je **miękkie tło, odstęp i wspólna siatka** (etykieta po lewej, treść w środku, liczba
  po prawej) — **nie kolorowe ramki** (odrzucone 2026-10-09). Każdy klikalny element wygląda jak
  przycisk; żadnych „AI-slopowych” pigułek z obrysem.
- **Układ najpierw:** rozjazd (tekst poza kartą, elementy „na oko”, brak skalowania) blokuje
  rozmowę o smaku. Zanim pokażesz cokolwiek, zmierz prostokąty i potwierdź zero przepełnień.
- **Jeden wariant do kalibracji, potem seria.** Ostatnio zadziałały warianty w **prawdziwym
  nośniku** (mod z przełącznikiem) — makieta HTML tylko pomocniczo.

## Kroki

1. Pomiar stanu: skąd przesunięcie pierścieni (pkt 1), ile pikseli zajmuje każdy z trzech pasków
   przy 1400 px. Sonda w prawdziwym nośniku: mod deweloperski w `~/.claude/dev-mods/<sesja>/`
   (skill `plugin-authoring`; wzór sondy z tego wątku: `.claude/relai/work/_fixy/AUDYT_MODOW/tree-probe/`).
2. **Jeden wariant** paska cache w modzie z przełącznikiem (stary / nowy), na prawdziwych danych
   `$.session.usage()`; zrzut Łukasza; pytanie o kierunek.
3. Po kalibracji 1–2 warianty dalsze w tym samym modzie; wybór Łukasza.
4. Wybrany wariant zapisany jako aneks briefu v2 (`STYL_PASKOW_CLAUDE.md`, nowa wersja w
   `docs/ARTEFAKTY.md`) z geometrią w liczbach, stanami (spokój, stygnie, zimny, drugi wiersz Z9,
   brak danych) i wyglądem w terminalu.
5. Prompt dla sesji wdrożeniowej (Opus 5.5): `docs/fixy/AUDYT_MODOW/PROMPT_Z11_WDROZENIE.md`.

## Weryfikacja

- [ ] Pomiar: przyczyna przesunięcia pierścieni nazwana z liczbami; wysokość trzech pasków przy 1400 px.
- [ ] Wariant kalibracyjny pokazany w prawdziwym nośniku; zrzut i odpowiedź Łukasza zapisane.
- [ ] Wybrany wariant zaakceptowany przez Łukasza („tak” w czacie).
- [ ] Brief v2 z aneksem Z11, wiersz w `docs/ARTEFAKTY.md`.
- [ ] `PROMPT_Z11_WDROZENIE.md` gotowy; mod-sonda usunięty albo opisany w karcie.

## Na koniec

W karcie `docs/fixy/AUDYT_MODOW/ODNOGA.md`: checkbox „Z11” w „Weryfikacji” zostaje otwarty do
wdrożenia, w „Dzienniku wdrożenia” jedna linia z wynikiem kalibracji i linkiem do aneksu briefu.
Commit conventional po angielsku, dokumentacja po polsku.
