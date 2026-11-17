# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Rotacja działa na cudzych projektach; otwarte, bo JiraManager czeka na migrację. 2026-11-10 (OPTYMALIZACJA_PO_AUDYCIE): progi osiągalne rotacją (K-A3, D-88), rejestr artefaktów 154 108 → 81 387 B (K-E6), skrót startu bez odsyłaczy archiwum (K-A2) — 26 633 → 23 542 B w tym repo. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Sekret zatrzymują hook i pre-commit; otwarte: Cursor bez egzekwowanego `ask`, Codex niezmierzony. Od E5 (2026-09-24) różnica jest jawna w README: tabela „Co pilnuje tylko Claude Code”. 2026-11-10 (OPTYMALIZACJA_PO_AUDYCIE): załoga uruchamia Codeksa bez zmiennych gospodarza, więc jego skaner sekretów nie milknie (K-D9); deinstalator Cursora w granicach `.cursor/` (K-D5). Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Cursor prowadzi proces regułą zawsze w kontekście; otwarte dla Codeksa, gdzie skille wyzwala opis. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| S1 | Bramka dokumentacyjna przepuści coś potrzebnego — plik nieśledzony, o którym architektura milczy, a bez którego nie da się powtórzyć pomiaru (plan SPRZATANIE_ARTEFAKTOW, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kasowanie tylko po „tak”; otwarte, bo ochrona zależy od opisu materiału, a dorobek sesji chroni `git add`. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| S2 | Narzędzie skasuje coś poza dozwolonymi korzeniami — zła ścieżka względna, dowiązanie prowadzące na zewnątrz, junction do innego dysku (plan SPRZATANIE_ARTEFAKTOW, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Asercje korzeni wytrzymały cztery przebiegi; otwarte: junction na inny dysk i długa ścieżka niezmierzone. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| M1 | Skill wspólny dla dwóch narzędzi pokaże listę tego drugiego — sesja w Cursorze zobaczy modele Anthropic (plan REKOMENDACJA_MODELU, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Listę wybiera nazwa pliku z hooka; otwarte: niezmierzone w aplikacji Cursora z adapterem. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M2 | Kopia listy w projekcie zostaje nadpisana przy starcie sesji i zjada odświeżenie zrobione komendą (plan REKOMENDACJA_MODELU, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kopia listy przeżywa start i `/relai-models`; otwarte: zakaz dla `/relai-update` niezmierzony. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M3 | Strona dokumentacji zmienia układ i odczyt z sieci zwraca śmieci albo nic (plan REKOMENDACJA_MODELU, ryzyko 3) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Niepowodzenie zostawia starą listę z datą; otwarte: odpowiedź 200 ze zmienionym układem niezmierzona. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M5 | Nazwy modeli zmieniają się szybciej niż wydania RelAI (plan REKOMENDACJA_MODELU, ryzyko 6) | **Średni** (2026-09-04) | **OTWARTE** | Lista ma próg wieku 7 dni; otwarte trwale, bo świeża lista nie wie o zmianie nazw u dostawcy. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M6 | Załoga stoi na flagach CLI trzech dostawców (`claude -p --permission-mode`, `codex exec -s`, `agent -p --mode`), które zmieniają się szybciej niż wydania RelAI (wątek ORKIESTRACJA) | **Średni** (2026-09-06) | **OTWARTE** | Flagi w `buildCommand`, porażka zawsze w raporcie; otwarte: Codex i Cursor jako gospodarz niezmierzone. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| O4 | Tryb ciągły kosztuje turę przy każdym zdaniu — praca zwalnia i drożeje (plan OPTYMALIZATOR_PROMPTOW, ryzyko O4) | **Niski** (2026-11-10 po OPTYMALIZACJA_PO_AUDYCIE — K-B1 trwała odmowa, K-B2 przyjęcie propozycji bez bramki, K-B4 sesja zaczęta komendą; wcześniej średni) | **OTWARTE** | Wyłącznik w `USTAWIENIA.md`, filtr pomija komendy; od E9 OPTYMALIZACJA_PO_AUDYCIE (2026-11-10) trwała odmowa „nie i nie pytaj więcej” i przyjęcie propozycji bez bramki; otwarte: rozrzut kosztu większy niż mierzona różnica. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| K3 | Nakładki rodzin modeli starzeją się szybciej niż wydania RelAI — dostawca zmienia wytyczne, a reguła z datą zostaje (plan PROWADZENIE_END_TO_END, ryzyko K3) | **Średni** (2026-09-24, przy zamknięciu planu) | **OTWARTE** | Każda reguła nakładki ma źródło i datę odczytu; hook startu mówi o nakładce starszej niż 30 dni; odświeżenie razem z `/relai-models`. |
| C1 | API modów Claude Code („early access”) zmieni się między wydaniami i `relai-panel` przestanie się ładować (plan PANEL_CLAUDE, ryzyko R1) | **Wysoki** (2026-10-08, przy E1) | **OTWARTE** | Osobne pluginy; rachunki w `core/panel/` poza API modów; `plugin validate` i `plugin test` przed wydaniem — od E9 dla trzech pluginów (`relai-panel`, `relai-progress`, `relai-cache-keeper`, ten ostatni przejął rolę kanarka po `cache-keeper-pl`). Otwarte: minimalna wersja silnika niezmierzona (działa 2.1.293); trzy pluginy na tym samym API to trzy miejsca do poprawki przy zmianie. E5: zgoda na start etapu opiera się na zachowaniu silnika „wysyłka wtyczki omija jej własny hook `command.run`” (P-022) — gdy się zmieni, hook wytnie znacznik także z wysyłki panelu i start wróci do pytania w czacie (awaria w bezpieczną stronę); znacznik z klawiatury jest wycinany w obu wersjach (test modu). E6: desktop **bez komunikatu** nie pokazał panelu, gdy drzewo miało 726 węzłów, 121 Svg i 256 tys. znaków (`plugin test` przyjmuje takie drzewo); przy 209 / 27 / 53 tys. — widoczny; limit drzewa w kodzie (60 wierszy, 40 na folder), dokładny próg silnika nieznany (P-023). Hot reload raz zostawił starszą wersję modułu mimo nowej kopii — rozpoznane znacznikiem wersji w logu. E7 (2026-10-09): trzy pluginy wydane publicznie jako „early access” (2.8.0; `relai-panel` 0.9.0, `relai-progress` 0.2.0, `relai-cache-keeper` 0.3.0) — opis w README i w marketplace mówi o ryzyku wprost; `register.tsx` podzielony na pliki widoków bez `$`, raport `plugin validate` identyczny z wersją jednoplikową (P-023). Instalacja z marketplace zmierzona na żywo w aplikacji 2.1.293. Otwarte trwale: minimalna wersja silnika niezmierzona. FILM_PREZENTACYJNY E7 (2026-10-13): wydanie 3.0.0 zostawia „early access” (decyzja Łukasza), `relai-panel` 0.14.1 (parser modelu, Aneks F); `plugin test` 177 / 31 / 174 i `plugin validate` na 2.1.295. WYGLAD_PANELU E3 (2026-10-15): próg desktopu zmierzony — liczą się elementy, nie znaki (1 260 rysuje, 1 344 nie, `Svg` waży więcej; P-023 pkt 7); `DRAW_LIMIT` 1 200 i bezpiecznik „kartka bez wypełnienia” zamiast pustego panelu, test wagi drzewa każdej zakładki. Otwarte: próg może się zmienić z wersją aplikacji. WYGLAD_PANELU E4 (2026-10-15): sama waga nie wystarczyła — Mapa wagi 1 045 z 338 tys. znaków nie narysowała się wcale; drugi budżet w znakach (≤ 280 tys., SZACUNEK) i widok zastępczy „Zwiń wszystko” zamiast pustego panelu (P-023 pkt 7); wydanie `relai-panel` 0.19.0 / `relai-progress` 0.5.0 / `relai-cache-keeper` 0.10.0, `plugin test` 205 / 42 / 181 na 2.1.295. WYGLAD_PANELU E5 (2026-10-15): próg auto-compactu na pasku stoi na wzorze kompaktowania odczytanym z binarki 2.1.295 (P-046) — rozbicie silnika pomija `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`; zmiana wzoru w nowej wersji przesunie kreskę bez komunikatu (otwarte: kontrola wzoru przy zmianie wersji silnika); wydanie `relai-panel` 0.20.0 / `relai-cache-keeper` 0.11.0, `plugin test` 211 / 42 / 198. |
| C8 | Inny mod paska nad promptem rysuje bez `next` albo owija węzeł silnika w `Box` z `width` i pasek RelAI znika bez komunikatu (E1, P-017) | **Średni** (2026-10-08, przy E1) | **OTWARTE** | `relai-panel`, `relai-progress` i `relai-cache-keeper` zawsze wołają `next` i nie dokładają `width` do owijacza (test „engine kept beneath" w każdym); `savvy-progress` rysował bez `next` — wyłączony w E9, zastąpiony forkiem. Otwarte: cudze mody poza kontrolą — ostrzeżenie w README w E7. |
| C10 | Pomiar kosztów niepełny albo podwójny — subagenci, kompakcja, wznowienie, `/clear`, wywołania poza pętlą (plan PANEL_CLAUDE, ryzyko R2) | **Niski** (2026-10-08 po E3; wcześniej wysoki) | **OTWARTE** | Klucz sesja + tura + indeks + agent, plik na sesję, kompakcja z `session.compact`, identyfikator sesji przy każdym zapisie; na żywo 117/117 kroków i 8/8 tur zgodnych z sondą co do kategorii; E9: koszt subagenta w `/relai-agents` = suma jego rekordów ($0,42, Opus), agent spoza cennika „brak ceny", nie „brak pomiaru". E4: rekord niesie etap w toku i zadanie załogi (`stage`, `task`); każdy rekord w dokładnie jednej pozycji (etap / „poza etapem” / „sprzed znacznika”), suma pozycji = suma sesji co do centa (test z kontrolą i na żywo $4,54 = $4,54). Otwarte: 9,16% przyrostu licznika silnika to wywołania spoza `turn.step` i kompakcji — raport mówi o nich słowami, bez rozbicia (P-020 pkt 6); zadanie załogi uruchomione jako osobna sesja `claude -p` jest przypisane tylko wtedy, gdy ta sesja ma `relai-panel`. E6: model bez ceny nie znika w sumie częściowej — przypomnienie z liczbą rekordów i aktualizacja cennika z karty; stawki cache per model ze strony (odczyt 0,05× Opus/Sonnet 5.5 — wcześniej jedna stała), Sonnet 5.5 wyceniony na żywo ($0,24 za 4 rekordy) E7: bez zmian w liczeniu (podział pliku bez zmiany zachowania); otwarte trwale na 9,16% wywołań spoza pętli, opisanych słowami. |
| C11 | Pliki pomiarów puchną albo trafiają do gita (plan PANEL_CLAUDE, ryzyko R5) | **Niski** (2026-10-08 po E3) | **OTWARTE ŚWIADOMIE** | `.claude/relai/` poza gitem (sprawdzone `git check-ignore`), plik na sesję, rekord bez treści (~250 B); E4: plik scaleń `.claude/relai/panel/scalenia.json` też poza gitem (`git check-ignore`), rekord dłuższy o dwa pola; E6: `.claude/relai/panel/cennik.json` (wersje cennika) poza gitem (`git check-ignore`), jedna wersja na zapis z karty; otwarte: sprzątanie starych plików nie istnieje — do E7 E7 (decyzja człowieka 2026-10-09): sprzątanie świadomie odłożone — zmierzone 5 plików, 260 KB po dwóch dniach intensywnej pracy; „Koszty projektu” sumują wszystkie pliki, więc kasowanie zmieniłoby sumę. Próg powrotu: folder `.claude/relai/pomiary/` powyżej 10 MB. |
| L1 | `percentUsed` limitu odświeża się tylko z odpowiedzią API — długa tura subagentów przekroczy próg, a karta przyjdzie po fakcie (plan LIMIT_CHECKPOINT, ryzyko L1) | **Średni** (2026-10-11 po E2; wcześniej wysoki) | **ZMITYGOWANE 2026-10-12** (zamknięcie planu; ograniczenie silnika — procent tylko z odpowiedzią API) | E2: `session.measure` w trakcie tury przestawia kolor baterii od razu, karta przychodzi po `turn.complete` z procentem odczytanym po turze (test „past the threshold in the middle of a turn”); otwarte, bo procent nadal przychodzi tylko z odpowiedzią API, więc długa tura może przekroczyć próg o kilka punktów, zanim karta padnie. |
| H9 | Tryb ciągły „dokumenty” nie widzi zapisu, którego nie rozpozna — `sed -i`, skrypt, podproces, `>(tee …)` — i dokument zostaje bez humanizacji (plan HUMANIZACJA, pomiar E5) | **Niski** (2026-10-14, przy zamknięciu planu) | **OTWARTE ŚWIADOMIE** | Aneks C: hook po Write/Edit i po Bash z przekierowaniem `>` / `>>` albo `tee`; w pomiarze E5 model pisał wyłącznie tymi drogami (8/8 przed poprawką, 2/2 po niej z regułą). Pominięcie kończy się ciszą, nigdy złą regułą; komenda `/relai-humanize` na pliku działa niezależnie od trybu ciągłego. |
| T1 | Scena 3D strony tnie się na słabszym laptopie albo zintegrowanej grafice (plan STRONA_RELAI, ryzyko 1) | **Średni** (2026-10-18 po E6; wcześniej wysoki) | **OTWARTE** | E1: render na żądanie, DPR ≤ 1,5, obniżenie jakości przy medianie > 26 ms. E2 (scena CC0, AO, głębia ostrości): przy CPU ×4 mediana 11,1 ms, p95 16,7 ms, 913 wywołań rysowania na klatkę po scaleniu miasta (przed: 2206, p95 22,3 ms); obniżanie jakości zaczyna od głębi ostrości. E3 (poświata ekranu RectAreaLight, nowe książki): przy CPU ×4 przewijanie mediana 11,9 ms, p95 22,2 ms — p95 wzrosło o 5,5 ms, zapas do 26 ms już tylko 3,8 ms; przybliżanie p95 13,1 ms; najwięcej 907 wywołań rysowania na klatkę. Zmierzone tylko na RTX 4070 Ti. E4 (bez path tracingu, przygaszona lampa, lakier blatu): CPU ×4 mediana 11,3 ms, p95 17,5 ms, najwięcej 910 wywołań rysowania. Otwarte: słaba grafika w E7. E5 (Film, bez WebGL): przy CPU ×4 mediana 5,6 ms, p95 5,6 ms, najdłuższa klatka 28,7 ms, więc Filmu ryzyko nie dotyczy. Aneks D: Biurko też idzie do publikacji, dlatego poziom zostaje wysoki do pomiaru na słabej grafice w E6. E7 (Film z animacjami WAAPI i przytrzymaniem): CPU ×4 mediana 11,1 ms, p95 16,7 ms na desktopie i w emulacji telefonu — Filmu nadal nie dotyczy; poziom bez zmiany przez Biurko. E6: SwiftShader (grafika programowa) 1366 × 768 mediana 1 700 → 1 183 → 817 ms po krokach obniżania, 390 × 844 1 033 → 867 → 433 → 283 ms; wyłącznik `biurko/grafika.js` daje takiej przeglądarce plakat (werdykt Łukasza 3A), brak WebGL2 i ograniczony ruch też. RTX przy CPU ×4: p95 przewijania 20,6–25,2 ms desktop, 15,4–16,3 ms telefon. Otwarte: zintegrowana karta niezmierzona (bramka „pomiar na słabszym laptopie”); drugi bezpiecznik (plakat po wyczerpaniu kroków jakości, opcja 3B) świadomie niewdrożony. E8 (2026-10-18): Biurko opublikowane pod `/biurko/` bez zmian w scenie; plan STRONA_RELAI zamknięty, bramka „pomiar na słabszym laptopie” świadomie otwarta poza planem (`docs/STATE.md`, „Co dalej”). |
| T2 | Biurko wygląda jak tani render albo glina z AI (plan STRONA_RELAI, ryzyko 2) | **Średni** (2026-10-18 po E6; wcześniej wysoki) | **OTWARTE** | E2: modele i tekstury CC0, deski orzechowe ze słojami, miasto za oknem, kubek i tablica od nowa; kalibracja w czterech rundach, zamknięcie za zgodą Łukasza, ale „nadal jesteśmy całkiem daleko” od obrazów 01–08 — przyczyna: brak światła odbitego w rasteryzacji (L-0220). Aneks B: E3 laptop i detale, E4 path tracing na przystankach. E4 (2026-10-16): światło odbite nie dało uzysku — przyczyną dystansu jest detal przedmiotów, tekstur i kompozycja, nie światło (L-0226); test detalu (blat `wood_table_worn`, druk na dokumentach, ciemniej) dał umiarkowany zysk. Aneks C: następny jest Film, Biurko po bramce. E5: Film rysowany kodem, hero przyjęte w trzeciej rundzie („Tak, przyjmuję”). Bramka z Aneksem D: najpierw dopieszczenie Filmu (E7), potem pełna droga Biurka (E6), publikacja obu z ankietą. Dla Biurka ryzyko zostaje wysokie. E7: Film dopieszczony i przyjęty akt po akcie („Tak, przyjmuję”), dotyczy już tylko Biurka (E6). E6: każdy przystanek, szczyt, mapa, szuflady, telefon, zasłona i plakat przyjęte przez Łukasza na kadrach przed i po; kontrola odczuć zgodna z krzywą briefu (4A). Otwarte do ankiety po publikacji (E8): czy odwiedzający odbierają Biurko jako dopracowane. E8 (2026-10-18): obie wersje opublikowane, ankieta w Tally zbiera głosy z ukrytym polem `wersja`; ryzyko zostaje otwarte do odczytu ankiety, który jest poza planem (`docs/STATE.md`). |

> Ryzyka zamknięte PW1, PW2, PW3 (3 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-26.md](archiwum/ryzyka/RYZYKA_2026-10-26.md)
> — przeniesione 2026-10-26, suma kontrolna `4002375c6a3d35fd`.

> Ryzyka zamknięte Z1 (1 pozycja) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-25.md](archiwum/ryzyka/RYZYKA_2026-10-25.md)
> — przeniesione 2026-10-25, suma kontrolna `b73eee99ebecd306`.

> Ryzyka zamknięte RM1 (1 pozycja) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-24.md](archiwum/ryzyka/RYZYKA_2026-10-24.md)
> — przeniesione 2026-10-24, suma kontrolna `e45aeb3e194654a8`.

> Ryzyka zamknięte T3, T6 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-19.md](archiwum/ryzyka/RYZYKA_2026-10-19.md)
> — przeniesione 2026-10-19, suma kontrolna `ddafe47c4f0df2a1`.

> Ryzyka zamknięte T4, T5 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-16.md](archiwum/ryzyka/RYZYKA_2026-10-16.md)
> — przeniesione 2026-10-16, suma kontrolna `56335ea6405b401f`.

> Ryzyka zamknięte L3, L2, L5, L6 (4 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-12.md](archiwum/ryzyka/RYZYKA_2026-10-12.md)
> — przeniesione 2026-10-12, suma kontrolna `20fb367152ae9e03`.

> Ryzyka zamknięte C3, C9 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-10-11.md](archiwum/ryzyka/RYZYKA_2026-10-11.md)
> — przeniesione 2026-10-11, suma kontrolna `3d1c7384436e320c`.

> Ryzyka zamknięte W1, U1, O1, O6 (4 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-09-24.md](archiwum/ryzyka/RYZYKA_2026-09-24.md)
> — przeniesione 2026-09-24, suma kontrolna `06fbd954f5ade1fe`.

> Ryzyka zamknięte O9 (1 pozycja) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-09-14.md](archiwum/ryzyka/RYZYKA_2026-09-14.md)
> — przeniesione 2026-09-14, suma kontrolna `fe5db0ded0c018ee`.

> Ryzyka zamknięte R2, M4 (2 pozycje) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-09-04.md](archiwum/ryzyka/RYZYKA_2026-09-04.md)
> — przeniesione 2026-09-04, suma kontrolna `e2542c88b2ccd9a8`.

> Ryzyka zamknięte R1, R3, R4, R6, R7, R8 (6 pozycji) są w
> [docs/archiwum/ryzyka/RYZYKA_2026-08-21.md](archiwum/ryzyka/RYZYKA_2026-08-21.md)
> — przeniesione 2026-08-21, suma kontrolna `4b370c3e2b31c6ba`.

## Czeka na człowieka
- **Jeden katalog `skills/` w standardzie Agent Skills dla trzech narzędzi** — zdjąłby kopię Codeksa (~4300 linii) i generator, ale zmienia zamrożoną D-89 i kształt adapterów; plan, odnoga czy odrzucić (audyt AUDYT_SKILLI, wiersz 50 raportu) · 2026-10-11 · [wpis 2026-10-11 — research, audyt, plan](archiwum/dziennik/DZIENNIK_2026-10-11_2026-10-12.md#2026-10-11--research-nowej-sesji-audyt-skilli-i-plan-limit_checkpoint)
  *(odroczone 2026-11-11, odroczeń: 1)*
- **AUDYT_MODOW — ustalenia poza zakresem (5 pozycji `outOfScope` raportu)** — odchudzenie kopii rdzenia per plugin (`sync-panel-core`), `headings.mjs` 254 KB w progress i cache-keeperze, % limitu per etap w rdzeniu, `userConfig` cache-keepera, przedrostek `relai-` jego komend; plus wariant B „jedna listwa” jako kandydat na plan — decyzja: plan, odnoga albo odrzucić · 2026-10-11 · [wpis 2026-10-11 — Z13, Z14 i zamknięcie odnogi](archiwum/dziennik/DZIENNIK_2026-10-11_2026-10-12.md#2026-10-11--audyt_modow-z13-i-z14-wydanie-0120-i-zamknięcie-odnogi)
  *(rozstrzygnięte 2026-11-11 — wchłonięte w plan integracji modów oszczędzających tokeny; ustalenia dotyczące modów wchodzą tam jako zakres dodatkowy)*
- **PANEL_CODEX E1 — próba przycisków minimalnego pakietu i świeżego kontekstu** — w macierzystym czacie nadal proces 0.0.7/PID 62300; po restarcie sprawdzić sondę 0.0.9 (także fonty), nowy szkic i jego rzeczywisty projekt/kontekst. Wygląd już zaakceptowany · 2026-10-10 · [wpis — Panel i mostek](archiwum/dziennik/DZIENNIK_2026-10-09_2026-10-10.md#2026-10-10--panel_codex-e1-natywny-widok-minimalny-pakiet-i-mostek-bieżącego-czatu)
  *(odroczone 2026-11-10, odroczeń: 1)*

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — 7 z 32 pozycji
  „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą). Poszerzyć listę w rdzeniu
  czy przepisać adnotacje w cudzym projekcie? · 2026-09-01 ·
  [wpis 2026-09-01 — E6: wydanie 1.7.0](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--e6-wydanie-170-pomiar-po-restarcie-i-pierwsza-rotacja-z-przepięciem-linków)
  *(odroczone 2026-11-10, odroczeń: 2)*

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)
  *(odroczone 2026-10-11, odroczeń: 2)*
  *(rozstrzygnięte 2026-11-11 — potwierdzone: 83 dni bez sprzeciwu, Łukasz zamyka)*

- **Ryzyko R2 zamknięte na nieaktualnej przesłance** — 2026-09-03 zamknięto je zdaniem „nie zostanie
  zmierzone nigdy", opartym na wyczerpanym limicie `claude -p` (L-0032). W E1 tego samego dnia
  `claude -p` **zadziałał** i poprowadził pomiar świeżych sesji (L-0084). Otworzyć R2 ponownie,
  przepisać jego treść czy zostawić zamknięte z adnotacją? · 2026-09-03 ·
  [wpis 2026-09-03 — E1 planu REKOMENDACJA_MODELU](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-03--e1-planu-rekomendacja_modelu-pytanie-o-model-pokazuje-nazwy-nie-klasy)
  *(odroczone 2026-11-10, odroczeń: 2)*

- **Czy ochrona konfiguracji ma zostać przy werdykcie `ask`** — w sesji z automatyczną akceptacją
  edycji `ask` nie zatrzymuje niczego, więc edycja sekcji niemutowalnej **cudzego** `CLAUDE.md`
  przechodzi mimo poprawnego werdyktu hooka. Podnieść do `deny` dla cudzego projektu (własny
  zostaje przy `ask`), zostawić bez zmian, czy opisać to jako świadomą granicę? · 2026-09-04 ·
  [wpis 2026-09-04 — Blokada guardraila pokazana w żywej sesji](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--blokada-guardraila-pokazana-w-żywej-sesji-ochrona-konfiguracji-okazuje-się-doradcza)
  *(odroczone 2026-11-10, odroczeń: 2)*

- **Ponowna instalacja pre-commita w projektach z hookiem sprzed 1.9.2** — stary układ
  (bezrozszerzeniowy `pre-commit` + `relai-secret-scan.js`) przewraca się w projekcie
  z `"type": "module"` i blokuje każdy commit. Dotyczy PolyFlow, JiraManagera i projektów
  zewnętrznych; instalacja jest jawną czynnością człowieka, więc RelAI jej nie wykona sam.
  · 2026-09-04 ·
  [wpis 2026-09-04 — Cztery defekty pre-commita](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--cztery-defekty-pre-commita-ze-zgłoszenia-zewnętrznego-wydanie-192)
  *(odroczone 2026-11-10, odroczeń: 2)*

## Wpisy

> Wpisy z okresu 2026-08-07 … 2026-08-09 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md](archiwum/dziennik/DZIENNIK_2026-08-07_2026-08-09.md)
> — przeniesione 2026-08-17, suma kontrolna `c17de1981ceedb1c`.

> Wpisy z okresu 2026-08-10 … 2026-08-10 (2 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-10.md)
> — przeniesione 2026-08-20, suma kontrolna `b7307c8678b9d6b9`.

> Wpisy z okresu 2026-08-10 … 2026-08-12 (4 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-10_2026-08-12.md)
> — przeniesione 2026-08-21, suma kontrolna `fa3e9fe384146138`.

> Wpisy z okresu 2026-08-12 … 2026-08-12 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-12.md)
> — przeniesione 2026-09-01, suma kontrolna `b4601365eee25163`.

> Wpisy z okresu 2026-08-12 … 2026-08-17 (3 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md](archiwum/dziennik/DZIENNIK_2026-08-12_2026-08-17.md)
> — przeniesione 2026-09-01, suma kontrolna `1690be9b08748504`.

> Wpisy z okresu 2026-08-17 … 2026-08-21 (18 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md](archiwum/dziennik/DZIENNIK_2026-08-17_2026-08-21.md)
> — przeniesione 2026-09-01, suma kontrolna `74a4d2a5fb9a3390`.

> Wpisy z okresu 2026-09-01 … 2026-09-03 (22 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md)
> — przeniesione 2026-09-04, suma kontrolna `4829effc7c2db525`.

> Wpisy z okresu 2026-09-03 … 2026-09-06 (29 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md)
> — przeniesione 2026-09-14, suma kontrolna `f7e63de9ea130a59`.

> Wpisy z okresu 2026-09-06 … 2026-09-14 (12 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-06_2026-09-14.md](archiwum/dziennik/DZIENNIK_2026-09-06_2026-09-14.md)
> — przeniesione 2026-09-24, suma kontrolna `6b63318cde49df9c`.

> Wpisy z okresu 2026-09-14 … 2026-10-09 (34 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-09-14_2026-10-09.md](archiwum/dziennik/DZIENNIK_2026-09-14_2026-10-09.md)
> — przeniesione 2026-10-11, suma kontrolna `73adf1254df20484`.

> Wpisy z okresu 2026-10-09 … 2026-10-10 (16 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-09_2026-10-10.md](archiwum/dziennik/DZIENNIK_2026-10-09_2026-10-10.md)
> — przeniesione 2026-10-12, suma kontrolna `e2dd7844fbecc5e2`.

> Wpisy z okresu 2026-10-11 … 2026-10-12 (19 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-11_2026-10-12.md](archiwum/dziennik/DZIENNIK_2026-10-11_2026-10-12.md)
> — przeniesione 2026-10-13, suma kontrolna `8a4ab2383b54fad2`.

> Wpisy z okresu 2026-10-12 … 2026-10-13 (10 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-12_2026-10-13.md](archiwum/dziennik/DZIENNIK_2026-10-12_2026-10-13.md)
> — przeniesione 2026-10-14, suma kontrolna `d47379978c69c0fd`.

> Wpisy z okresu 2026-10-13 … 2026-10-14 (13 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-13_2026-10-14.md](archiwum/dziennik/DZIENNIK_2026-10-13_2026-10-14.md)
> — przeniesione 2026-10-16, suma kontrolna `3e1aeaec82894461`.

> Wpisy z okresu 2026-10-14 … 2026-10-16 (25 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-14_2026-10-16.md](archiwum/dziennik/DZIENNIK_2026-10-14_2026-10-16.md)
> — przeniesione 2026-10-19, suma kontrolna `7ebe7ef575a4a560`.

> Wpisy z okresu 2026-10-16 … 2026-10-24 (22 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-16_2026-10-24.md](archiwum/dziennik/DZIENNIK_2026-10-16_2026-10-24.md)
> — przeniesione 2026-10-25, suma kontrolna `0f4971ff45e3db81`.

> Wpisy z okresu 2026-10-24 … 2026-10-26 (24 wpisy) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-24_2026-10-26.md](archiwum/dziennik/DZIENNIK_2026-10-24_2026-10-26.md)
> — przeniesione 2026-10-28, suma kontrolna `cd7f843db9423e00`.

> Wpisy z okresu 2026-10-26 … 2026-11-11 (48 wpisów) są w
> [docs/archiwum/dziennik/DZIENNIK_2026-10-26_2026-11-11.md](archiwum/dziennik/DZIENNIK_2026-10-26_2026-11-11.md)
> — przeniesione 2026-11-17, suma kontrolna `464db9377d9d48e1`.

### 2026-11-11 — MODY_OSZCZEDZANIA E2: zakładka „Oszczędności” i opis słowami w `relai-browser`

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- `core/panel/savings-view.mjs` (nowy): sumy zakładki w filtrach czat / dziś / wszystko z rekordów
  `savings-ledger.parse()`; kolumna zmierzone = koszt helperów z `helper.in/out` po cenniku modelu
  helpera (każdy rekord swoją wersją cennika), szacowane = `before − after` × cena wejścia modelu
  głównego, bez mnożnika cache; LEFT OUT poza sumą i liczony osobno, koszt helpera rekordu LEFT OUT
  zostaje; brak ceny helpera albo modelu głównego → brak bilansu (R6). Test: fikstura
  `core/panel/tests/fixtures/savings-rejestr.jsonl`, 7 testów.
- Zakładka „Oszczędności” w `relai-panel` (`panel/hooks/pane-savings.tsx`, `TABS`, typ
  `PanelView`, atom `savingsFilter`, `savingsData` w `register.tsx`): zdanie opisu miary, filtry
  (`secondary` z kropką), dwa kafle, bilans, wiersze po modach, LEFT OUT, złe linie, pusty rejestr
  słowami. Testy: `savings.test.ts` (2), `narrow.test.ts` (zakładka z najdłuższymi danymi),
  `pane-v2.test.ts` (sześć zakładek).
- Nagłówek Kalam „Oszczędności modów”: wpis w `HEADINGS` (`core/panel/theme.mjs`) i
  `headings.mjs` z generatora — **poza granicą promptu** (tylko nowe pliki `core/panel/**`),
  dopuszczone decyzją Łukasza („Dopuść w E2”); `sync-panel-core.js` rozniósł obie kopie do
  `progress/`, `cache-keeper/`, `mods/`.
- Tryb `describe` w `relai-browser` (`browser/hooks/describe.ts`, `register.tsx`, `state.ts`):
  `/relai-browser describe [model]` i `shrink` w `$.store`; ukryty subagent
  `relai-browser:describer` (Read, `agent.offer` → ukryty) czyta zapisany zrzut (`[Image: source:
  …]`), ≤ 250 słów; `usage` z kroków subagenta (`turn.step` po `agentId`), odpowiedź z
  `turn.complete`; błąd albo brak odpowiedzi w 90 s (SZACUNEK) → zmniejszanie. Skaner sekretów
  (`guardHelper` + generowany `secret-scan.mjs`) czyta **tekst wyniku narzędzia** — decyzja
  Łukasza (wariant „Skaner tylko na tekście” zamiast lokalnego OCR Windows, który w sondzie
  odczytał klucz z obrazu w 113 ms). `$.model.complete` odpadł: przyjmuje tylko tekst.
- Poprawka po pomiarze: `spawnAlias` — narzędzie Agent przyjmuje w `model` tylko alias rodziny.
- Rekord `describe`: `after` = tokeny opisu × 2 (`HAND_BACK_COPIES`), bo raport subagenta wraca do
  głównej sesji drugi raz (decyzja Łukasza: uczciwy rekord teraz, wyciszenie później).
- Wersji modów nie podbijano (E10).

**Zweryfikowane — jak dokładnie:**

- Testy przed → po: guardrails 33 → 33, process 430 → 430, panel (rdzeń) 247 → 254, mody `mods`
  91, `progress` 51, `cache-keeper` 206 bez zmian, `panel` 217 → 220, `browser` 18 → 28;
  `plugin validate` pięciu modów ✔; `sync-panel-core --check` zgodne (23 pliki, 16 ikon, 5 celów).
- Dowód negatywny (zasada 3): klucz `sk-…` (złożony z kawałków) w tekście obok zrzutu → 0 wywołań
  `agent.spawn`, obraz zmniejszony; bez klucza → dokładnie 1, z aliasem `haiku` i ścieżką pliku.
  Mutacje: wyłączenie wykluczenia LEFT OUT → 5 z 7 testów sumy czerwonych; wyłączony skaner →
  test negatywny czerwony; obie cofnięte.
- Pomiar na żywo ([POMIAR_E2.md](plany/MODY_OSZCZEDZANIA/POMIAR_E2.md)): zakładka „Dziś” 7
  rekordów / 5 303 tokeny = skrypt czytający pliki rejestru (odcięcie 16:17:03; zakładka czyta
  rejestr raz na turę), „Wszystko” w jasnym wyglądzie 12 / 8 295 / helper 9 587 + 1 537 = skrypt;
  filtr zmienia liczby (czat 0 → dziś 7). `describe` na `example.com`: 251 słów, 9,5 s, Haiku
  in 9 587 / out 1 537, obraz nie dotarł do modelu, tekst sześciu języków dosłownie. Bilans tego
  zrzutu ujemny (−$0,0008): helper droższy niż 228 zaoszczędzonych tokenów Opusa. Rekord z
  16:19:51 powstał przed `HAND_BACK_COPIES` (after 412 zamiast 824).
- Zrzuty jasny i ciemny wg DESIGN §12: `docs/zasoby/PANEL_RELAI/zrzuty/MODY_OSZCZEDZANIA_E2_r1_*`.
- `trivy fs --scanners vuln .` → 0 CRITICAL, 42 HIGH (jak po E1); bez nowych zależności npm.
- Bramka pomiaru: `efficient-browser-use@token-saving-mods` (user) i `relai-panel@relai` (user,
  local) wyłączone `claude plugin disable` za zgodą Łukasza, po pomiarze włączone (`true`
  w obu plikach ustawień); kopie `relai-panel-e2` i `relai-browser` w
  `~/.claude/dev-mods/e1e867ea…/` (3,3 MB) skasowane, plik sondy `diag-e2.txt` skasowany.
- Katalog roboczy E2: 516 KB, 14 plików → 0 (skasowany po „tak” Łukasza); `POMIAR.md`
  przeniesiony jako `plany/MODY_OSZCZEDZANIA/POMIAR_E2.md`, dwa zrzuty do
  `zasoby/PANEL_RELAI/zrzuty/`.

**Świadomie odłożone:**

- Wyciszenie drugiej kopii opisu (hand-back) — E3 albo E10 (decyzja Łukasza); do tego czasu
  domyślnym trybem zostaje `shrink`, a `describe` opłaca się tylko przy dużych obrazach z małą
  ilością tekstu.
- Klucz widoczny wyłącznie na obrazie (nie w tekście wyniku) przechodzi do Haiku — znane
  ograniczenie wariantu „skaner na tekście”; powrót do lokalnego OCR to decyzja człowieka.
- `describe` dla wyników Read (obraz bez zapisanego pliku w wyniku) — zmniejszanie.
- `bash-guard` tylko ostrzega przed gołym `cd` (trzecia powtórka, L-0320) — zmiana na blokadę do
  decyzji.
- `zrzut-panelu.ps1 -Press` nie klika filtrów zakładki — narzędzie zrzutów, poza zakresem.

**Do zrobienia przez człowieka:** —

**Ryzyka:** R6 (plan, zawyżone oszczędności) — mitygacja rozszerzona o liczenie obu kopii opisu
i brak bilansu przy braku ceny; poziom bez zmian. C1, C8, C10 bez zmian (sondy na 2.1.321
przeszły). Nowe pułapki → [PULAPKI.md](PULAPKI.md) P-064; lekcje L-0320 … L-0322.

**Uwagi procesowe:** gołe `cd` (L-0320); kopia w dev-mods podłożona pod nazwą zainstalowanego
modu i bez obserwacji — trzy rundy Łukasza (L-0322); `describe` uznany za gotowy po teście
z atrapą, padł na żywo (L-0321). Ten wpis dopisałem heredokiem w powłoce wbrew regule
z `CLAUDE.md` (L-0198: tekst z backtickiem tylko Edit/Write) — `git diff` pokazał same dopiski,
backticki całe; reguła bez zmian, dalsze zmiany wpisu narzędziem Edit.

### 2026-11-11 — MODY_OSZCZEDZANIA E3: `relai-input-router` 0.1.0 — pliki i PDF

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- Nowy mod `input-router/` (`relai-input-router` 0.1.0, niewydany): `hooks/route.ts` (próg 2000
  tokenów, przepustki plików procesu i instrukcji przez `isVerbatimFile` oraz plików sekretów po
  nazwie, zakresy < 100 linii, kawałkowanie > 50%, kawałki 120 000 / łącznie 960 000 znaków, linie
  cięte na 2000, routing Bash wyłącznie dla czytników i pomocników, PDF), `hooks/notes.ts` (prompt
  z ostatnią wiadomością człowieka ≤ 12 000 i argumentami ≤ 2000, wynik z nagłówkiem RelAI,
  pamięć notatek: ścieżka + mtime + rozmiar + skrót prośby, nazwy kopii z daty i skrótu, retencja
  14 dni, rekord rejestru, komenda), `hooks/gate.ts`, `hooks/register.tsx` (cały kod z `$`), typy
  stanu, `plugin.json`, `hooks.json`. Haiku przez `$.model.complete` (`claude-haiku-5-5` z `$.store`,
  effort `low`, 180 s, ponowienie aliasem `haiku` przy `api-error`) po `guardHelper` + skanerze
  sekretów; awaria → zwykły wynik i powód w `~/.claude/relai/oszczednosci/input-router/ostatni-blad.txt`.
- PDF > 5 stron przez Poppler; `pdfinfo` brak na natywnym PATH (FAKT 2026-11-11), więc liczba
  stron z `\f` w wyjściu `pdftotext`.
- `/relai-input-router` (stats, full, off file, on file, model); bliźniak BenAI `input-router` →
  mod śpi z jednym komunikatem (Aneks A).
- Cel `input-router` w `core/tools/sync-panel-core.js` (6 celów), wpisy w
  `.claude-plugin/marketplace.json` i `core/tools/release-map.json` (`mod-input-router`).
- Po recenzji subagenta `code-reviewer` (3×HIGH, MEDIUM, LOW), wszystkie naprawione z testami:
  argumenty Bash, które powłoka może zmienić (przekierowania, `$( )`, glob, backslash, `-Path:x`,
  `--file=x`), przepuszczają polecenie (fail closed); plik > 3,9 MB nie dostaje „pełnej kopii” z głowy
  i ogona — notatki wskazują sam plik i mówią, że środek nie był czytany; dowiązanie do pliku
  chronionego chronione po `realPath`; aliasy Windows (`CLAUDE.md.`, `::$DATA`, nazwy 8.3).
- Po pomiarze: wyjście Bash zapisane przez silnik do pliku (`persistedOutputPath`) przechodzi bez
  notatek (P-065).

**Zweryfikowane — jak dokładnie:**

- Testy przed → po: guardrails 33 → 33, process 430 → 430, panel (rdzeń) 254 → 254, mody `mods` 91,
  `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28 bez zmian, `input-router` 0 → 47;
  `plugin validate input-router` ✔, marketplace ✔ (te same dwa ostrzeżenia co przed etapem);
  `sync-panel-core --check` zgodne (23 pliki, 16 ikon, 6 celów).
- Dowód negatywny (zasada 3): `docs/DZIENNIK.md`, `PROMPT_ETAP_3.md`, `STATUS.md`,
  `.claude/relai/**`, `CLAUDE.md`, `SKILL.md`, `.env.local` → 0 wywołań Haiku i treść bez zmian;
  duży plik zwykły → 1. Mutacja `fileGuard` (przepustka wyłączona) → 10 z 42 testów czerwonych,
  cofnięta → 42/42. Skaner: duży plik z kluczem `sk-…` (złożonym z kawałków) → 0 wywołań, dosłownie;
  bez klucza → 1.
- Pomiar na żywo ([POMIAR_E3.md](plany/MODY_OSZCZEDZANIA/POMIAR_E3.md)): `small.log` 2525 → 661
  tokenów (Haiku in 5 948 / out 1 418, 7,8 s), drugi odczyt z pamięci bez Haiku; `umowa.pdf`
  8 stron 9718 → 551; `cat` z prośbą Łukasza → notatki odpowiadające na nią; `PROMPT_ETAP_3.md`
  i plik pod `.claude/relai/` dosłownie. Zakładka (wariant „a” Łukasza): `savingsView` = surowy
  rejestr co do tokena — 5 rekordów, 21 748 tokenów, Haiku 4 × in 34 900 / out 5 608 (z jednym
  rekordem zawyżonym sprzed poprawki `persistedOutputPath`).
- `trivy fs --scanners vuln .` → 0 CRITICAL, 42 HIGH (jak po E2); mod bez `package.json`;
  `git grep --untracked` po wzorcu klucza w `input-router/` → 0 (kontrola: kawałek `k-ant-api03`
  w teście widoczny).
- Bramka pomiaru: `input-router@token-saving-mods` (user) wyłączony za zgodą Łukasza, w sesji
  dopiero po `/reload-plugins`; po pomiarze włączony (`true`). Artefakty spoza katalogu:
  kopia `relai-input-router` w `~/.claude/dev-mods/6defc1f3…/` skasowana; kopie z pomiaru
  w `~/.claude/relai/oszczednosci/input-router/` (4 notatki, 4 pełne treści, dane testowe)
  skasowane; materiał w scratchpadzie sesji (tymczasowy).
- Katalog roboczy E3: 4 pliki, 140 655 B → 0 (skasowany po „tak” Łukasza).

**Świadomie odłożone:**

- Cięcie linii 2000 znaków w PDF: `pdftotext` skleja wiersze strony, końcówki klauzul nie
  docierają do Haiku — `-layout` albo zawijanie do decyzji w E10 (pomiar).
- Notatki z pełnego wyjścia zapisanego przez silnik (`persistedOutputPath`) zamiast przepuszczania
  — dziś przepuszczane, bo nie oszczędzają tokenów.
- Kasowanie przeterminowanych kopii: `expiredCopies` wylicza, kasuje mechanizm artefaktów
  roboczych (jak rejestr); podpięcie do `clean-work.js` — E10.
- Konektory MCP i panel przekazań — E4 (plan); wyciszenie hand-backu `describe` — E10.

**Do zrobienia przez człowieka:** —

**Ryzyka:** R6 (zawyżone oszczędności) — nowy przypadek: wyjście Bash zapisane przez silnik;
mitygacja w kodzie i teście, poziom bez zmian. R8 (treść jako instrukcja) — prompt Haiku mówi, że
tekst to dane. C1, C10 bez zmian. Nowa pułapka → [PULAPKI.md](PULAPKI.md) P-065; lekcje L-0323,
L-0324.

**Uwagi procesowe:** materiał pomiaru położony w katalogu roboczym pod `.claude/relai/`, który mod
słusznie przepuszcza jako plik procesu — pierwszy odczyt nie mierzył notatek (L-0323); log
pomiarowy wygenerowany przez `node -e` z `\n` wbrew zasadzie 5 — wynik sprawdzony (1500 linii),
dalsze skrypty narzędziem Write (L-0324).

### 2026-11-11 — MODY_OSZCZEDZANIA E4: konektory MCP i panel przekazań w `relai-input-router`

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- Sonda kształtu wyniku MCP przed kodem (mod `relai-e4-sonda` w dev-mods, sześć konektorów, dwa
  przebiegi): `ran.result` to tablica bloków, nie `McpToolResult` z typów; bez `server` w `e`
  ([POMIAR_E4.md](plany/MODY_OSZCZEDZANIA/POMIAR_E4.md), P-066).
- `input-router/hooks/connectors.ts` (czysta logika): < 16 000 znaków dosłownie; JSON bez pustych
  pól ≤ 8000 → bez Haiku (`trim`); wartości tekstowe cięte do 1200, gdy cięcie zabiera ≤ 20% i wynik
  mieści się w 8000 → bez Haiku (`cut`); inaczej Haiku na widoku po obcięciu pustych pól, kawałki
  128 000 (najwyżej 6, długa linia dzielona, prompt ≤ 150 000); lista nietykanych ze specyfikacji
  + konektory RelAI + (decyzja Łukasza po recenzji) „mods” czytane jako narzędzia modów i pluginów:
  serwery `plugin_*` i nazwy z `enabledPlugins`; liczba całkowita ≥ 16 cyfr → bez parsowania JSON.
- `register.tsx`: hook `tool.call` z dopasowaniem `/^mcp__/` przez `handOff` (pamięć, skaner,
  rekord, kopia pełnej treści `copyText`), wynik jako jeden blok tekstu; sekret w JSON-ie
  obcinanym lokalnie → wynik dosłowny i brak kopii; `/relai-input-router off|on connector` i `pane`.
- Panel przekazań (`pane.ts` czysty + rysunek w `register.tsx`): karta na przekazanie (stan
  słowem i znakiem, narzędzie, ścieżka, tokeny przed → po, koszt Haiku z cennika projektu),
  przyciski „Notes” i „Full result” (treść w miejscu, „Copy path”), przełączniki „Next read whole”,
  „Files”, „Connectors”; poniżej 144 kolumn przyciski pod słowami. Rdzeń `pricing.mjs` (i jego
  importy) dociągnięty do `input-router/hooks/core` przez `sync-panel-core` (bez zmiany skryptu).
- Typy stanu (`at`, `copy`, `notes`, `helperIn/out`, `shown`), opis w `plugin.json` bez zmiany wersji.
- Recenzja `typescript-reviewer` (1 CRITICAL, 2 HIGH, 6 MEDIUM, 3 LOW): CRITICAL rozstrzygnięty
  przez Łukasza („mods” = narzędzia modów), oba HIGH naprawione z testami (duże liczby; notatki
  i kopia na tym samym widoku), MEDIUM — skaner przed kopią lokalną naprawiony; `args` (sonda: `e`
  ma tylko argumenty), zgoda dla ścieżki lokalnej (zgoda dotyczy modu w projekcie) i wspólne `full`
  odrzucone z uzasadnieniem; `isError` bez pomiaru — zostaje gałąź z typów; LOW: `__proto__`,
  pusty zakres linii luki, klucze kart po czasie — naprawione.
- Po pomiarze: zdanie „Read small ranges of …” dla konektora wskazuje kopię, nie nazwę narzędzia.

**Zweryfikowane — jak dokładnie:**

- Testy przed → po: guardrails 33, process 430, panel (rdzeń) 254, `mods` 91, `panel` 220,
  `progress` 51, `cache-keeper` 206, `browser` 28 bez zmian; `input-router` 47 → 79;
  `plugin validate input-router` ✔; `sync-panel-core --check` zgodne (23 pliki, 16 ikon, 6 celów).
- Dowód negatywny (zasada 3): nietykane (`Claude_Browser`, `ccd_session`, `relai_panel`) z wynikiem
  ~40 tys. znaków → 0 wywołań Haiku, wynik identyczny, brak rekordu; mutacja listy (bez
  `claude_browser`) → 3 testy czerwone, mutacja reguły `ccd_` → 2 czerwone; cofnięte → zielono.
- Skaner: duży wynik konektora z kluczem `sk-…` (z kawałków) → 0 wywołań, dosłownie; bez klucza → 1.
- Pomiar na żywo bez człowieka: `guide` 35 833 zn. → notatki 8 959 → 1 900 tokenów (Haiku 14 493 /
  4 296, 19,3 s), drugi raz z pamięci; konektor mały i nietykany dosłownie; `savingsView` = surowy
  rejestr co do tokena (2 rekordy, 14 118 tokenów, $0,0036 Haiku).
- `trivy fs --scanners vuln .` → 0 CRITICAL, 42 HIGH (jak po E3); brak nowych zależności npm;
  `git grep --untracked` po wzorcu klucza w `input-router/` i planie → 0.
- Bramka pomiaru: BenAI `input-router@token-saving-mods` wyłączony za zgodą Łukasza i włączony po
  pomiarze; `/reload-plugins` nie zrobiono (Łukasz poza komputerem). Artefakty spoza katalogu:
  `relai-e4-sonda` i kopia `relai-input-router` w `~/.claude/dev-mods/3ff5d516…/` skasowane; kopia
  pełnej treści i notatki z pomiaru w `~/.claude/relai/oszczednosci/input-router/` (po 1 pliku)
  zostają do retencji 14 dni; pliki sondy w scratchpadzie sesji (tymczasowe).
- Katalog roboczy E4: 1 plik (`suma.mjs`), 4 KB → 0 — skasowany na polecenie „dokończ sam”.

**Niezaliczone:** punkt Weryfikacji „karta panelu kliknięta przez człowieka (notatki, pełny wynik,
`full`)” — panel otwiera komenda wpisana przez człowieka, a przyciski desktopu klika człowiek
(L-0289); sprawdzone tylko w `plugin test` (montaż, `press`). Ścieżka `trim`/`cut` bez dużego
JSON-a na żywo — tylko testy. Łukasz zamknął E4 mimo to („Zamknij E4 bez tego”); punkt w promptcie
zostaje pusty z adnotacją, sprawdzenie na żywo przechodzi do pomiaru E10.

**Świadomie odłożone:**

- Rozpoznanie wyniku błędu konektora na żywo (`isError` nie wystąpił w sondzie) — przy pomiarze E10.
- Jedno `full` dla plików i konektorów — zgodnie ze specyfikacją („następny duży odczyt”).
- Kliknięcie karty panelu przekazań przez człowieka i ścieżka `trim`/`cut` na żywo — do pomiaru
  E10 (decyzja Łukasza przy zamknięciu E4).

**Do zrobienia przez człowieka:** — (kliknięcie karty — ROZSTRZYGNIĘTE 2026-11-11: przeniesione do
E10 decyzją Łukasza)

**Ryzyka:** R6 (zawyżone oszczędności) — „przed” liczone z pełnego wyniku, nie z widoku po
obcięciu; poziom bez zmian. R8 (treść jako instrukcja) — notatki z dokumentu-instrukcji (`guide`
Docs) zastępują instrukcję streszczeniem: konektor zwykły wg specyfikacji, obserwować w E10. C1,
C10 bez zmian. Pułapka P-066, lekcje L-0325, L-0326.

**Uwagi procesowe:** sześć pierwszych poleceń z `cd <repo> &&` (L-0325); zdublowana nazwa funkcji
kosztowała trzy próby diagnozy (L-0326).

### 2026-11-12 — MODY_OSZCZEDZANIA E5: Model Router (`relai-model-router` 0.1.0) i Aneks B

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- Sonda przed kodem (mod `relai-e5-sonda` w dev-mods, pięć przebiegów): kształt wejścia
  `agent.spawn` (model jawny = `e.model`, fork `fork: true`, wznowienie `resume.agentId` z pełnym
  identyfikatorem w `model`), `next(e).model` i `turn.step.model` mówią o faktycznym modelu,
  przepisanie modelu przez hook działa na żywo; sędzia `$.model.complete` haiku 721 ms, czysty JSON
  ([POMIAR_E5.md](plany/MODY_OSZCZEDZANIA/POMIAR_E5.md), P-067).
- `model-router/` 0.1.0 (niewydany): `judge.ts` (prompt sędziego, zadanie ≤ 12 000 znaków,
  `</task>` rozbrojone, walidacja JSON, reguły 0,6 / 0,3 / `risky` > 0,7, poziomy z listy modeli),
  `gate.ts`, `pane.ts`, `register.tsx` (hook `agent.spawn` pomijający fork, wznowienie i spawny
  modów; bramka jak E3; skaner przed sędzią; awaria → model bez zmian i powód w
  `~/.claude/relai/oszczednosci/model-router/ostatni-blad.txt`; karta modelu jawnego; wybór sesji;
  rekord z sędzią jako `helper` i zużyciem subagenta po `turn.complete`), panel i komenda
  `/relai-model-router` (stats, on, off, pane, mine, suggestion, session, ask). Siódmy cel
  `sync-panel-core`, wpisy w `marketplace.json` i `release-map.json`.
- Recenzja `typescript-reviewer` (1 HIGH, 8 MEDIUM, 6 LOW): HIGH (zużycie subagenta przed
  rozwiązaniem `next`) i trzy MEDIUM naprawione z testem — rekord po `next`, karty z równoległych
  spawnów kolejno (test złapał, że zapis `$.state` nie jest widoczny dla równoległego hooka —
  wybór sesji trzymany też w zmiennej modułu), koszt sędziego przy nieudanym spawnie.
- Pomiar na żywo ujawnił błąd modelu problemu: `env.CLAUDE_CODE_SUBAGENT_MODEL` (Sonnet)
  w `~/.claude/settings.json` — subagent bez modelu startuje na nim, nie na modelu rodzica, więc
  zadanie ryzykowne poszło na Sonnet. Poprawka: baza = domyślny z ustawień, poziom przypinany.
- **Aneks B** (Łukasz w trakcie pomiaru): domyślny z ustawień chroniony kartą jak model jawny —
  „Suggestion / Subagent default / Session model / Always suggestion”, „zawsze …” z panelu
  ([ANEKS_B_DOMYSLNY_SUBAGENTA.md](plany/MODY_OSZCZEDZANIA/ANEKS_B_DOMYSLNY_SUBAGENTA.md)).

**Zweryfikowane — jak dokładnie:**

- Testy przed → po: guardrails 33, process 430, panel (rdzeń) 254, `mods` 91, `panel` 220,
  `progress` 51, `cache-keeper` 206, `browser` 28, `input-router` 79 bez zmian; `model-router`
  0 → 58; `plugin validate model-router` ✔; `sync-panel-core --check` zgodne (23 pliki, 16 ikon,
  7 celów).
- Dowód negatywny (zasada 3): fork, wznowienie, główny czat, bliźniak, brak zgody → 0 wywołań
  sędziego i model bez zmian; 12 mutacji na kopii (próg `risky` > i ≥, reguła usunięta, 0,8; próg
  0,6 → 0,5 i ≥ → >; model jawny bez karty; fork i wznowienie niepomijane; bez skanera; domyślny
  bez ochrony; baza z rodzica; bez przypięcia) — każda czerwieni testy.
- Skaner: zadanie z kluczem złożonym z kawałków → 0 wywołań, bez klucza → 1. Awaria (API, limit,
  nie-JSON, poziom spoza listy, wyjątek) → model bez zmian, powód w pliku.
- Na żywo (Łukasz przy komputerze, BenAI `model-router` wyłączony, `/reload-plugins`): A proste →
  Haiku; B ryzykowne → Sonnet ✗, po poprawce B2 → Opus; C jawny `sonnet` → karta → „Mine” →
  Sonnet; D po Aneksie B → karta domyślnego → „Subagent default” → Sonnet (`turn.step.model`).
  Rejestr vs `savingsView` („ten czat”) zgodne co do tokena: 5 rekordów, sędzia 1 974 / 225,
  $0,00031.
- `trivy fs --scanners vuln .` → 0 CRITICAL, 42 HIGH (jak po E4); brak nowych zależności npm;
  `git grep --untracked` po wzorcu klucza → 0 (kontrola pozytywna na pliku z kluczem → 1).
- Katalog roboczy E5: przed 1 plik (`suma.mjs`, 2 012 B), po 0 — skasowany po „tak”. Poza
  katalogiem, skasowane po „tak”: `~/.claude/dev-mods/fe85abbe…/relai-e5-sonda` (1,06 MB) i
  `relai-model-router` (1,23 MB), scratchpad `e5-sonda/`, `mutate.mjs`, `fix-test.mjs` (10 KB).
  W `work/MODY_OSZCZEDZANIA/` został `E1/` sprzed etapu — nie ruszany.

**Świadomie odłożone:**

- Wycena różnicy modeli (te same tokeny subagenta na dwóch modelach) w zakładce „Oszczędności” —
  `core/panel/savings-view.mjs` poza granicą E5; rekord niesie `from`/`to` i zużycie subagenta;
  do E10 (decyzja Łukasza).
- Ze recenzji: zewnętrzny limit czasu sędziego (polegamy na `timeoutMs` silnika, typy: „resolves
  aborted”), test spawnu z innego modu (`next.origin` z typów, nie z sondy), bufor `parseVerdict`
  dla prozy z klamrami, cichy brak decyzji przy modelu spoza listy.
- `hasHuman` w zmiennej modułu zeruje się przy przeładowaniu kopii (pomiar D) — do przeglądu w E10.
- Model z definicji agenta (frontmatter `model:`) nie jest widoczny w `agent.spawn` — baza wtedy
  z ustawień albo rodzica; do E10.

**Do zrobienia przez człowieka:** — (bramka pomiaru i kliknięcie kart — ROZSTRZYGNIĘTE 2026-11-12:
Łukasz zrobił `/reload-plugins` i kliknął obie karty)

**Ryzyka:** R4 (router zepchnie trudne zadanie) — zmaterializowało się na żywo (B) i zostało
naprawione przypięciem poziomu; poziom bez zmian. R5 — sędzia 1,3–1,9 s na żywo. C1, C10 bez
zmian. Pułapka P-067, lekcje L-0327, L-0328.

**Uwagi procesowe:** heredok z `\n` i `sed -i` na pliku typów mimo L-0324 i L-0276, potem
`node -e` z backslashem do odczytu (L-0327). Walidator adapterów (`validate-adapters.js`, CI) był
czerwony już na HEAD: opisy `relai-browser` (E2) i `relai-input-router` (E4) w `marketplace.json`
inne niż w ich `plugin.json`; wpis `relai-model-router` wyrównany w E5, dwa pozostałe — osobnym
commitem `fix` po commicie E5 (decyzja Łukasza: „Napraw teraz, osobnym commitem”).

### 2026-11-12 — MODY_OSZCZEDZANIA E6: karta załogi w `/relai-crew` (`relai-model-router`)

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- Sonda drogi orkiestrator → mod przed kodem (mod `relai-e6-sonda` w dev-mods, dwa przebiegi):
  narzędzie zarejestrowane przez mod (`$.tool.register`) model główny woła w trybie auto bez odmowy
  klasyfikatora; `$.ui.ask` to 2–4 przyciski; `$.tool.call` narzędzia `AskUserQuestion` z modu —
  odmowa gospodarza; własne czekanie modu w hooku `tool.call` przekracza budżet 10 s, wywołanie `$`
  w toku nie. Kształt karty: panel z wyborem na wiersz + jedna `$.ui.ask` zamykająca
  ([POMIAR_E6.md](plany/MODY_OSZCZEDZANIA/POMIAR_E6.md), P-068).
- `model-router/hooks/crew.ts` (nowy, czysta logika): wejście orkiestratora (do 12 zadań, zadanie
  cięte jak u sędziego), wiersze karty (model z wywiadu albo domyślny z ustawień chroniony, Aneks B;
  bez niczyjego wyboru poziom sędziego od razu), „przyjmij wszystkie” / „mój dla wszystkich” /
  „model sesji”, znacznik `[relai-crew <run>/<id>]` tylko jako pierwsza linia promptu, decyzje
  trzymane całymi przebiegami, odpowiedź z modelem z wywiadu dosłownie, gdy nic się nie zmieniło.
- `register.tsx`: narzędzie `crew_models` (za `ToolSearch`), sędzia na każde zadanie (skaner przed
  sędzią, trzy naraz), karta załogi (panel „RelAI crew models” + `$.ui.ask`), druga karta załogi
  w trakcie pierwszej odmówiona od razu; `agent.spawn` członka ze znacznikiem i modelem z odpowiedzi
  albo z wywiadu → model z karty, bez sędziego i bez drugiej karty (przy włączonym routerze);
  decyzje także w `$.state` (przeżywają przeładowanie); rekord na zadanie (`part: crew-<id>`)
  z zużyciem członka po `turn.complete`. `routeRecord` dostał `part`, klucz kart panelu E5 — indeks.
- `adapters/claude-code/commands/relai-crew.md`: krok 5a (narzędzie raz po „zaczynamy”, znacznik
  przed preambułą roli, 12 zadań na kartę, mod nieobecny albo uśpiony → krok pominięty jednym
  zdaniem); skill Codeksa wygenerowany ponownie (walidator). Opis w `plugin.json` i marketplace bez
  zmiany wersji.
- Rozjazd panelu na żywo (Łukasz: „wszystko jest wertykalnie… literki są pod sobą”): w wąskim
  panelu wiersz w kolumnie, pudełko słów `width={0}` + `flexGrow` → szerokość zero. Poprawka:
  `width={0}` tylko obok przycisku, próg panelu załogi 48 kolumn (DESIGN.md, 6), ten sam wzorzec
  w panelu E5 tego modu; test szerokości przy 40/47/48/160 kolumnach.
- Przegląd `typescript-reviewer` (Block: 3 HIGH, 4 MEDIUM, 6 LOW) — wszystkie naprawione z testem:
  znacznik w dowolnym miejscu i nadpisanie innego jawnego modelu (H), odpowiedź zamieniała
  `opus[1m]`, pełny identyfikator i model spoza listy na alias albo `null` (H), nieudany zapis
  `$.state` po karcie gubił odpowiedź człowieka (H); kolejka kart przekraczająca budżet, stały
  token przebiegu, limit decyzji ucinający przebieg, migawka stanu nadpisująca równoległy zapis (M);
  router wyłączony a przepinanie, utrata wyboru z panelu bez słowa, zadanie bez limitu, tytuł
  z sekretem na karcie, dwie luki w kroku 5a (L).

**Zweryfikowane — jak dokładnie:**

- Testy przed → po: guardrails 33, process 430, panel (rdzeń) 254, adaptery Codex 28 / Cursor 10,
  `mods` 91, `panel` 220, `progress` 51, `cache-keeper` 206, `browser` 28, `input-router` 79 bez
  zmian; `model-router` 58 → 102; `plugin validate model-router` ✔; walidator adapterów ✔
  (ostrzeżenie o rozmiarze `security-audit` sprzed etapu); `sync-panel-core --check` zgodne
  (23 pliki, 16 ikon, 7 celów).
- Dowód negatywny (zasada 3): członek rozstrzygnięty → 0 kart i 0 sędziego, model z karty; członek
  bez znacznika, ze znacznikiem nie w pierwszej linii albo z innym modelem → droga E5 (karta);
  mod uśpiony (bliźniak) → `asleep`, 0 sędziego, spawn jak przed E6; router wyłączony → model
  podany. 18 mutacji (znacznik nieznaleziony / poza linią 1, decyzja bez przebiegu, każdy model jako
  członek, alias zamiast modelu z wywiadu, token bez numeru, limit bez cięcia, tytuł sekretu,
  „przyjmij wszystkie” jako no-op / na wszystkich wierszach / jako „mój”, gałąź członka pominięta,
  przełącznik pominięty, model z karty niezastosowany, panel `width={0}`, decyzje nieodtworzone po
  przeładowaniu, druga karta nieodmówiona) — 18 zabitych.
- Skaner: zadanie z kluczem złożonym z kawałków → wiersz bez sugestii, 0 wywołań sędziego dla
  niego, model z wywiadu bez zmian, tytuł nie trafia na kartę.
- Na żywo (Łukasz przy komputerze, BenAI `model-router` wyłączony, `/reload-plugins`): przebieg A —
  rozjazd panelu, karta bez przycisku → „mine kept”; przebieg B po poprawce panelu — Łukasz wybrał
  w panelu, „Start with the picks above” → a, b, c na Haiku; trzech członków w jednej wiadomości,
  `turn.step.model` = `claude-haiku-5-5` we wszystkich 7 krokach, w rejestrze tylko `part: crew-*`
  (0 rekordów `part: 0` — sędzia ani karta przy członkach nie ruszyły). Rejestr vs `savingsView`
  („ten czat”) zgodne co do tokena: 6 rekordów, sędzia 2 470 / 270, 6 wywołań. **Pomiar szedł na
  kodzie sprzed poprawek z przeglądu**; mierzona ścieżka (znacznik w linii 1, model z odpowiedzi)
  zachowuje się po nich tak samo, zmienione gałęzie pokrywają testy i mutacje.
- `trivy fs --scanners vuln .` → 0 CRITICAL, 42 HIGH (jak po E5, trafienia w fixturach evals
  i katalogu PANEL_CODEX); brak nowych zależności npm; `git grep --untracked` po wzorcu klucza
  w 14 zmienionych plikach → 0 (kontrola pozytywna → 1).
- Katalog roboczy E6: przed 3 pliki (`klucz.sh`, `suma.mjs`, `trivy-licz.mjs`, 3 135 B), po 0 —
  skasowany po „tak”. Poza katalogiem, skasowane: `~/.claude/dev-mods/637357ee…/relai-e6-sonda`
  i `relai-model-router`, scratchpad `e6/`. W `work/MODY_OSZCZEDZANIA/` został `E1/` sprzed etapu.

**Świadomie odłożone:**

- Ten sam błąd układu w `relai-input-router` (`register.tsx:479`, `width={0}` w kolumnie) — poza
  granicą E6; **do E9** (decyzja Łukasza).
- Ponowny pomiar na żywo po poprawkach z przeglądu — w pomiarze wszystkich modów w E10.
- Wycena różnicy modeli członków załogi w zakładce — razem z E5, do E10.

**Do zrobienia przez człowieka:** — (bramka pomiaru i kliknięcie karty załogi — ROZSTRZYGNIĘTE
2026-11-12: Łukasz zrobił `/reload-plugins`, przestawił wiersze w panelu i zamknął kartę)

**Ryzyka:** R4 bez zmian (wybór załogi zawsze człowieka albo jego „zawsze …”). C1 — nowa
powierzchnia silnika (narzędzie modu, panel, budżet hooka), zmierzona sondą (P-068). Członek załogi
sam spróbował `hand_off_to_session` — klasyfikator odmówił; zachowanie modelu członka, nie modu.

**Uwagi procesowe:** pierwsze trzy polecenia Bash sesji z `cd <repo> &&` mimo L-0325 (L-0329).
Pomiar na żywo przed przeglądem kodu — przegląd zmienił kod po pomiarze (L-0330). Panel przeszedł
testy (tekst znaleziony), a rozjechał się na żywo — testy nie sprawdzały układu (L-0331).

### 2026-11-12 — MODY_OSZCZEDZANIA: Aneks C — E7–E10 wykonuje Codex, Claude tylko bramka

Autor: RelAI (Opus 5.5) + Lukasz

**Zrobione:**

- Łukasz po E6: limit planu Team nie starcza na etapy w Opusie — kolejne etapy ma robić Codex
  (gpt-6.1 sol albo terra), Claude tylko weryfikuje i robi minimum kroków. Wywiad (cztery
  pytania, wszystkie rekomendacje przyjęte): wykonawca `gpt-6.1-terra`, poprawki i przegląd
  `gpt-6.1-sol`; sondy i pomiary na żywo E7–E9 przeniesione do E10; dokumenty rytuału pisze Codex,
  Claude sprawdza; weryfikacja Claude = testy, walidatory, diff, przegląd przez Sol
  (`crew.js review`), bez subagenta Claude.
- [ANEKS_C_WYKONANIE_CODEX.md](plany/MODY_OSZCZEDZANIA/ANEKS_C_WYKONANIE_CODEX.md) (wzór: Aneks A
  planu OPTYMALIZACJA_PO_AUDYCIE), linia metryczna i dziennik wdrożenia `STATUS.md`,
  `PROMPT_ETAP_7.md` dostosowany (kontrola modelu, zakres, weryfikacja, rytuał), linia „Aktywny
  plan” w `CLAUDE.md`.

**Zweryfikowane — jak dokładnie:**

- `~/.codex/config.toml`: `model_reasoning_effort = "high"` — terra i sol z `-m` dostaną `high`
  (pamięć „Effort Codeksa wg modelu”); `crew.js run` nie przekazuje effortu.
- `grep` w `PROMPT_ETAP_7.md`: brak resztek Opusa, `typescript-reviewer`, `POMIAR_E7`, dev-mods.

**Świadomie odłożone:**

- Sonda nadpisania `effort` w `turn.step` (SONDY.md §4: efekt niewidoczny z modu) — do E10; ryzyko
  AC1 wysokie: `relai-effort` może zostać zbudowany na mechanizmie, który nie działa.

**Do zrobienia przez człowieka:** —

**Ryzyka:** nowe AC1–AC6 w aneksie (AC1, AC2, AC3 wysokie).

### 2026-11-12 — MODY_OSZCZEDZANIA E7: kod do bramki Claude

Autor: RelAI (gpt-6.1-terra w Codeksie) + Lukasz

**Zrobione:**

- `effort/` 0.1.0: sędzia, karta, auto, ochrona wskazania etapu, bramki, rejestr i panel;
  wpisy marketplace i release-map, ósmy cel synchronizacji, prompt sędziego w rejestrze artefaktów.
- Powstał `PROMPT_ETAP_8.md`; E8 nie startuje przed bramką E7. Lekcja L-0334: prawdziwe zawinięcie
  wskazania effort w prompcie i mutacja skutku, nie samego licznika wywołań.

**Zweryfikowane — jak dokładnie:**

- `claude plugin test --file … effort`: 13/13 testów; `claude plugin validate effort` przechodzi
  z ostrzeżeniem o braku ikony; `sync-panel-core --check` zgodne, 8 celów.
- Osiem mutacji po kolei przez edycję i test pojedynczego pliku: 8/8 zabitych. R9: po usunięciu
  ochrony wynik `turn.step` zmienił się z oczekiwanego `high` na `low`; po odtworzeniu kodu zielono.
  Skrypt powtórki `mutacje.cjs` w katalogu E7; jego podproces blokuje `EPERM` w tym sandboxie.
- Wszystkie testy siedmiu wcześniejszych modów pojedynczymi plikami: mods 91, panel 220, progress
  51, cache-keeper 206, browser 28, input-router 79, model-router 102; walidator adapterów zielony.
  Trivy: 0 CRITICAL, 42 HIGH. Pełne zestawy Node natrafiły na `spawnSync … EPERM` i wymagają
  bramki poza sandboxem. Testy bramek i rejestru rdzenia: 17/17.

**Świadomie odłożone:**

- Przegląd Sol i pełne zestawy — bramka Claude; sonda i pomiar karty, auto, promptu etapu, czasu
  sędziego oraz rejestru względem `savingsView` — E10 (Aneks C). Typów silnika w podanej ścieżce
  `model-router/.claude-plugin/types/` ani skilla `plugin-authoring` nie znaleziono; weryfikator
  potwierdza nazwy hooków, nie ich zachowanie na żywo.
- Katalog E7: 11 plików, 60 897 B przed przekazaniem; nie kasowano. `clean-work.js raport`
  utworzył poza katalogiem E7 `.claude/relai/clean-raport.json` — pozostawiono, poza zakresem
  edycji. Przerwane testy pozostawiły w katalogu systemowym TEMP `relai-e7-validator-1RA5OS`
  (877 583 275 B) oraz `relai-esm-7x2UBo` i `relai-esm-knWBxF` (po 11 114 B); nie usuwano.

**Do zrobienia przez człowieka:** —

**Ryzyka:** R5 planu — czas sędziego nadal niezmierzony, limit 20 s i pomiar w E10; R9 — ochrona
testowana i mutant zabity, ale efekt silnika wymaga E10; AC1 — wysokie, efekt nadpisania nadal
niepotwierdzony na żywo. C1 — wysokie, API early access nadal wymaga bramki i pomiaru.

**Przegląd i poprawki Sol — 2026-11-12, Aneks C, krok 6c:**

- Przegląd BLOCK: 3 HIGH, 6 MEDIUM, 3 LOW; poprawiono 12/12 znalezisk. HIGH: wyłączenie
  unieważnia sędziego i kartę; decyzja związana z turą, czyszczona po końcu i przed komendą;
  osobne poziomy bazowy i zastosowany, sekwencja `low → keep` zachowuje `low`. Sześć regresji
  HIGH najpierw czerwonych z asercji, po poprawkach zielonych.
- R9 obejmuje dosłowne linie promptów E1/E5/E7, zawinięcia i pogrubienie; koszt sędziego
  zapisany także dla błędnego werdyktu. Nieznany katalog użytkownika usypia mod; odmowa kończy
  dodatkowe odczyty; bliźniak aktualizuje status i daje jeden komunikat na sesję. Wszystkie
  pola sędziego są danymi, poprzednia odpowiedź ma osobną granicę (prompt sędziego v2).
- Effort zapisuje do `<data>-<sesja>.relai-effort.jsonl`: osobny plik producenta usuwa wyścig
  z routerem, istniejący czytnik i retencja obsługują sufiks, stare pliki pozostają czytelne.
  Kolejka zmienia dzień UTC po opróżnieniu poprzedniej. Testy błędów sprawdzają dokładny plik,
  treść i brak innych zapisów. `core/` ani `effort/hooks/core/` nie zmieniano.
- Testy pojedynczych plików `claude plugin test --file effort/hooks/<plik> effort`:
  register 24/24, judge 6/6, ledger 3/3 — **33/33** (wcześniej 13). Testy rdzenia
  `node --test --test-isolation=none core/panel/tests/savings-gates.test.js core/panel/tests/savings-ledger.test.js`:
  **17/17**. `claude plugin validate effort` zielony (zastany brak ikony), synchronizacja 8 celów
  zgodna; 3 fixtury zgodne ze źródłami, skaner z kontrolą pozytywną: 8 plików bez sekretów.
- `mutacje.cjs` zaktualizowany: 11/11 kotwic zgodnych; pełne uruchomienie zatrzymuje
  `spawnSync claude.exe EPERM` przed mutowaniem. Ręcznie zabite 2/2 mutacje: R9 (efekt
  `high → low`) i zapis błędu do ustawień zamiast `ostatni-blad.txt`; po odtworzeniu zielono.
  Pełną powtórkę oraz bramkę wykonuje Claude, pomiar pozostaje w E10. Katalogu E7 nie kasowano;
  doszedł roboczy `review-check.cjs`. Bez commita, pushu i przełączania pluginów.
- Przekazanie Claude poza zakresem zapisu tej poprawki: zsynchronizować `docs/ARTEFAKTY.md`
  z v2 promptu sędziego (odgrodzenie wszystkich danych wejściowych). Brak pytań biznesowych.

**Bramka Claude — 2026-11-12 (Opus 5.5 w Claude Code):**

- Pełne zestawy poza sandboksem: guardrails 33, process 430, panel (rdzeń) 254, adaptery Codex 28 /
  Cursor 10 — bez spadku; mody `effort` **33**, `mods` 91, `panel` 220, `progress` 51,
  `cache-keeper` 206, `browser` 28, `input-router` 79, `model-router` 102 — zielone;
  `claude plugin validate effort` i walidator adapterów zielone, `sync-panel-core --check` 8 celów.
- `mutacje.cjs` w pełnym przebiegu: **11/11 zabitych** (subagent, effort etapu, `/`, powiadomienie,
  brak człowieka, bliźniak, brak zgody, ścieżka awarii, izolacja producenta, zmiana dnia UTC,
  skaner). Trivy 0 CRITICAL / 42 HIGH (jak E6); bez nowych zależności npm; `git grep --untracked`
  po wzorcu klucza → 0, kontrola pozytywna trafia.
- Typy silnika (kopia w sondzie dev-mods `tree-probe`): wejście `turn.step` niesie `effort`,
  nadpisanie przez `next({ ...e, effort })` — decyzja (sędzia, karta) i wykonanie (`turn.step`)
  rozdzielone; efekt na żywo — E10 (AC1).
- Przegląd Sol: `crew.js review` padł na `--color` (L-0335), przegląd poszedł przez
  `crew.js run --role reviewer`; werdykt BLOCK → poprawki Sol (wyżej) → bramka zielona.
  Przebiegi wykonawcy: pierwszy STOP przez zakaz `docs/` w preambule roli (L-0332), drugi przez
  `EPERM` bazy testów (L-0333), trzeci z `--raw` i bazą potwierdzoną przez Claude.
- Prompt sędziego v2 wpisany do `docs/ARTEFAKTY.md` (v1 nie wyszedł z drzewa roboczego).
- Sprzątanie (1a, po „tak” Łukasza): skasowane `.claude/relai/work/MODY_OSZCZEDZANIA/E7/` (17 plików,
  115 KB → 0), przebiegi `.claude/relai/work/CREW/mody-e7*` (6 folderów, ok. 5,2 MB → 0)
  i `.claude/relai/clean-raport.json`. Katalogi TEMP z przerwanych testów (`relai-e7-validator-*`,
  `relai-esm-*`) leżały w TEMP sandboksu Codeksa — w TEMP użytkownika ich nie ma.

### 2026-11-13 — MODY_OSZCZEDZANIA E8: kontynuacja Sol 2, Aneks D i kod do bramki

Autor: RelAI (gpt-6.1-terra w Codeksie) + Lukasz

**Zrobione:**

- Kontynuację wykonał gpt-6.1-sol zgodnie z decyzją Łukasza i Aneksem D. Wąski wyjątek routera:
  wyłącznie relai-research bez jawnego modelu; inne mody, model jawny, fork i resume pomijane.
  Wersja routera 0.1.0 bez zmian. Podpis wpisu zachowuje format nakładki Aneksu C.
- `research/` 0.1.0: manifest, hooki i typy, auto z kopią całej koperty WebSearch, quick
  z równoległymi czytnikami i kontrolą przypisów, deep z renumeracją wszystkich źródeł;
  komenda w tle z raportem jako wiadomość, panel ze stanem i dwoma przełącznikami.
- Zgoda projektowa, skaner przed pomocnikami i przed wynikami narzędzi własnych agentów,
  blokada lokalnych odczytów/programów agenta Research, uśpienie przy bliźniaku, unieważnianie
  pracy przy zmianie ustawień; atomowy snapshot bramek usuwa wyścig równoległych odczytów.
  Osobny plik producenta rejestru z kolejką i zmianą daty; brak usage nie deklaruje zysku.
- Marketplace, release-map i dziewiąty cel sync; kopie rdzenia wyłącznie przez narzędzie.
  Prompty v1 bez zmiany treści, opis w ARTEFAKTY zaktualizowany. STATUS i STATE opisują bramkę,
  CLAUDE/AGENTS mają zgodną sekcję Stan prac; PROMPT_ETAP_9 gotowy, E9 nie startuje przed bramką.
  Dopisano P-070. Nie dublowano rozstrzygniętej bramki AC5 ani wpisu pierwszej kontynuacji Sol.

**Zweryfikowane — jak dokładnie:**

- Przed: nowa regresja `claude plugin test --file model-router/hooks/judge.test.ts model-router`
  — 23/24, czerwona asercja Expected null / Received „spawned by the mod relai-research”.
  `node --test --test-isolation=none research/hooks/runtime-contract.test.mjs` — 0/1 z asercji
  brakującego manifestu, bez błędu importu. Dowód oraz stare 14 czerwonych przepływów w E8.
- Po: pojedyncze `claude plugin test --file research/hooks/<plik> research` — 47/47;
  router 103/103. Node dla sześciu testów Research — 6/6. Instrument run-tests.ps1 zapisuje
  każdy raport i czyta results[].failure, nie sam kod wyjścia. Mutacje 39/39 zabitych asercją,
  w tym usunięcie i poszerzenie wyjątku routera; źródła odtwarzane w finally.
- Pozostałe mody, każdy plik osobno: effort 33/33, mods 91/91, browser 28/28,
  input-router 79/79; panel 218/220, progress 50/51, cache-keeper 205/206. Cztery czerwienie
  wyglądu odtworzone na kopiach HEAD w 2.1.323; brak zmian w tych trzech modach. To nie jest
  dodatnia pełna bramka. Dokładne asercje i reproduktory baseline-*.txt w katalogu E8.
- Node plikami z `--test-isolation=none`: guardrails 23 pass / 10 fail, process 246/184,
  panel core 235/7, Codex 19/9, Cursor 0/10. Proces potomny z sondy środowiska:
  `spawnSync node EPERM`, `spawnSync git EPERM`; dokumenty padają też przed rejestracją
  testów na `stdout.split`. `release-check.js` — „git rev-parse --show-toplevel: kod null”.
- `validate-adapters.js` zgodne (zastane ostrzeżenie rozmiaru skilla), `sync-panel-core --check`
  zgodne, 9 celów. `claude plugin validate research` passed with warnings: brak odpowiedzi
  type-checkera i ikony; nie deklarowano pełnego sprawdzenia typów.
- Trivy bezpośrednio, bo wrapper blokuje spawnSync: zakres jak E7, `trivy fs --scanners vuln
  --skip-db-update ... .` — 0 CRITICAL / 42 HIGH / 62 MEDIUM / 14 LOW, bez nowych zależności.
  Zakres produkcyjny skilla (bez fixtur i katalogów roboczych): 0 we wszystkich wagach.
  Skaner kodu: 27 plików, 0 trafień, kontrola pozytywna trafia. Panel: props przy
  40/47/48/143/144/160 kolumnach i kliknięcia przełączników, mutant width=0 zabity.
- Katalog E8 zinwentaryzowany, skrypty i raporty pozostawione do bramki; nie kasowano.
  W trakcie testów zaobserwowano TEMP sandboxu `relai-esm-XtcS4D` i `relai-esm-yj2buC`;
  przy końcowym odczycie bieżącego TEMP nieobecne. Nie usuwano niczego poza repozytorium.

**Świadomie odłożone:**

- Sonda i pomiar na żywo, identyfikacja agentów przed ich narzędziami, routing silnika,
  karty/panel i bilans względem savingsView — E10 (Aneks C). Test nie zastępuje pomiaru.
- Naprawy czterech zastanych czerwieni wyglądu poza AC5: nie zmieniano tych modów;
  najpierw powtórka bramki poza sandboxem. Porządki AUDYT_MODOW i kokpit/scope — E9.
- Rytuał 1a i commit — Claude po bramce; żadnej instalacji, przełączania, commita ani push.

**Do zrobienia przez człowieka:**

- Bramka Claude: przegląd Sol, pełne zestawy i release-check poza sandboxem, rozstrzygnięcie
  czterech zastanych czerwieni; po dodatnim wyniku E8 → ZREALIZOWANY, E9 → GOTOWY DO STARTU.
  Następnie decyzja o skasowaniu katalogu E8 i commit (Aneks C).
- Pomiar Research na żywo i kliknięcia — E10; odpowiednia bramka pozostaje OTWARTA w STATUS.

**Ryzyka:** R1/C1 wysokie — API early access, aktualny silnik 2.1.323, typy i live nadal
do bramki; R2 wysokie — skaner oraz ograniczenia agenta dowiedzione testami i mutacjami,
kolejność własności agenta do sondy E10; R5 średnie — limity, bez pomiaru czasów na żywo;
R6 średnie — usage i osobny producent przetestowane, rzeczywisty hand-back do E10;
R7 średnie — bliźniak testowany, bez przełączeń maszyny; R10 niskie — rejestracja i sync zgodne.

**Przebieg poprawki Sol 3 — 2026-11-13:**

Autor: RelAI (gpt-6.1-sol w Codeksie) + Lukasz

- Naprawiono cztery znaleziska przeglądu (1 HIGH, 3 MEDIUM): skan surowych wartości i JSON
  przed pomocnikiem oraz wynikiem dla agenta; odrzucanie błędnych kopert czytników; odczyt
  źródła bez daty i weryfikacja daty publikacji po pobraniu; niepełne usage jako koszt nieznany.
- Regresje najpierw czerwone z asercji: sekrety 3, czytniki 2, daty 4, usage 7. Po poprawkach
  `claude plugin test --file research/hooks/<plik>.test.ts research`: runtime 7/7,
  workflow 30/30, register 27/27, ledger 2/2 — razem 66/66 (zastane 49 zachowane).
  `node --test research/hooks/*.test.mjs`: w sandboxie `spawn EPERM`, po zgodzie poza nim 6/6.
- Mutacje nowych ochron: 12/12 zabitych asercjami (sekrety 6, czytniki 2, daty 2, usage 2);
  źródła odtwarzane w `finally`. Zakres: trzy pliki logiki Research i ich trzy pliki testów,
  ten dopisek, jedna linia STATUS oraz `RAPORT_SOL3.md`; router i rdzeń nietknięte.
- Raport poprawki nie zastępuje ponownego przeglądu ani pełnej bramki Claude; E8 nadal W TOKU,
  E9 oczekuje, sondy i pomiary na żywo nadal E10. Bez subagentów, commita i przełączeń pluginów.

**Bramka Claude — 2026-11-13: E8 ZREALIZOWANY**

Autor: RelAI (Opus 5.5 w Claude Code, terminal Herdr) + Lukasz

- Przegląd Sol (Codex w terminalu `hc`, tylko odczyt): BLOCK — 1 HIGH (skan po
  `JSON.stringify` przepuszczał cytowane przypisanie sekretu do pomocnika i agenta), 3 MEDIUM
  (błąd czytnika jako `verified`, link bez daty odrzucany przed pobraniem, puste `usage` jako znany
  koszt). Poprawka Sol 3 (wyżej). Raporty przeniesione do folderu planu: `PRZEGLAD_SOL_E8.md`,
  `RAPORT_SOL3_E8.md`, dowód routingu `DOWOD_ROUTING_E8.txt`.
- Poza sandboxem: `node --test` rdzenia (guardrails 33, process 428 + 2 pominięte, panel 254),
  adapterów (codex 27 + 1 pominięty, cursor 10) i Research 6 — 0 porażek;
  `validate-adapters.js` kod 0. `claude plugin test` wszystkich modów: effort 33, mods 91,
  browser 28, input-router 79, model-router 103, research 66 bez porażek; panel 2, progress 1,
  cache-keeper 1 porażka — te same cztery zastane czerwienie wyglądu co na HEAD (nie z E8).
- `release-check.js` kod 2 „brak bazy modu relai-browser” — pierwsze wydanie modu, odłożone do E10
  decyzją Łukasza z E1; nie regres.
- AC3: regresje sekretu cytowanego sprawdzone wybiórczo — `requests.length` 0 i pusty dysk
  (dowód negatywny) obok kontroli pozytywnej `scanText`.
- Katalog roboczy E8 (5 MB) skasowany po zgodzie Łukasza. E9 → GOTOWY DO STARTU.
- Pierwszy commit zatrzymał pre-commit: dane testowe Sol z dosłowną nazwą `DB_PASSWORD="…"`
  (fałszywy alarm). Nazwa składana z kawałków w trzech testach, wyniki bez zmian (27/7/30), skan
  `BRAK`; bez `--no-verify`. Lekcja L-0337 i punkt w `PROMPT_ETAP_9` dla Codeksa. Commit
  `32bc113` wypchnięty; wcześniejszy push wysłał też zaległe lokalne commity E5–E7.

**Świadomie odłożone:** agent startowany przyciskiem „+” w layoucie PolyFlow (proces główny
`powershell.exe`, pod nim `claude.exe`) nie zgłasza stanu OSC 7501 i nie trafia na listę Agents
w Herdrze; agent z `hc run` trafia. Sprawa projektu `desktop/herdr`, poza RelAI.

### 2026-11-13 — MODY_OSZCZEDZANIA E9: kontynuacja Sol, porządki i kod do bramki

Autor: RelAI (gpt-6.1-terra → gpt-6.1-sol w Codeksie) + Lukasz

**Zrobione:**

- Łukasz przekazał dokończenie etapu Sol po przebiegach Terra kończących po 2–5 minutach bez
  realnej blokady (L-0336). Zachowano zastane zmiany kokpitu/scope i układu Input Routera.
- Generator headings dzieli nagłówki panelu, postępu i kokpitu, cyfry oraz etykiety dokumentów;
  kompatybilny barrel nadal ma cztery eksporty. Odbiorcy importują potrzebne moduły, kopie
  i usunięcie nadmiarowych kopii wyłącznie przez sync-panel-core. Zachowano adnotacje typów.
- Cache Keeper ma dziewięć opcji userConfig i komendy `/relai-cache-keeper`,
  `/relai-cache-keeper-keepwarm`, `/relai-cache-keeper-handoff`; aliasy stare i `ckp-*` zachowane,
  o ile ich nazwy wolne. Rozstrzygnięcie Łukasza **wariant A**: stare wartości `$.store.settings`
  przeżywają migrację; późniejszy jawny `/config` wygrywa. Checkpoint per pole zapobiega
  nadpisaniu późniejszej decyzji po częściowej odmowie. Sama migracja starego klucza nie zmienia;
  dawne komendy nadal zapisują zgodny magazyn, oznaczając dane jako już zmigrowane.
- Kokpit i scope znają nowe mody; nazwy sprawdzone z marketplace. D-92 zachowana: rdzeń + osiem
  modów przełączanych projektowo, kokpit globalny. Bez przełączeń prawdziwej instalacji.
- Input Router w kolumnie nie ma width=0; test obejmuje sześć szerokości, nazwę rzeczywistego
  narzędzia Google Drive długości 64 znaków oraz otwieranie notatek i pełnego wyniku.
- Release-map poprawiona dla dziewięciu celów. STATUS, STATE i zgodna linia CLAUDE/AGENTS
  aktualne; PROMPT_ETAP_10 wygenerowany, bez rozpoczęcia E10. P-071 opisuje ograniczenia
  konfiguracji w harnessie testowym. ARTEFAKTY bez zmiany: prompty etapowe są wprost wyłączone
  z rejestru, nie zmieniono instrukcji pluginu. Raport: [RAPORT_E9.md](plany/MODY_OSZCZEDZANIA/RAPORT_E9.md).

**Zweryfikowane — jak dokładnie:**

- Baza od Claude: `BAZA_PRZED.md` w katalogu E9, pełny przebieg poza sandboxem. Nowa regresja
  headings najpierw 0/1 z asercji; migracja najpierw dwie czerwone asercje; poprawki przeglądu
  najpierw czerwień faktycznie zapisanej wartości i minimalnego zakresu w manifeście.
- Po: każdy plik przez `claude plugin test --file <mod>/hooks/<plik> <mod>`, odczyt
  `results[].failure` i `error`: panel 218/220, progress 50/51, Cache Keeper 211/212,
  mods 92/92, browser 28/28, Input Router 80/80, Model Router 103/103, Effort 33/33,
  Research 66/66; konfiguracja 6/6, kontrakt manifestu Node 1/1, Research Node 6/6.
  Cztery porażki wyglądu odtworzone na pełnych źródłach HEAD w tym samym silniku 2.1.323;
  katalogi i raporty baseline-* pozostawione jako reproduktory. Nie zmieniono oczekiwań migawek.
- Node każdym plikiem z `--test-isolation=none`: guardrails 23 pass / 10 fail, process 248/184,
  panel core 236/7, Codex 19/9, Cursor 0/10. Sonda: `spawnSync node EPERM`, `spawnSync git EPERM`;
  test documents pada także na `stdout.split`. `release-check.js`: „NIE DA SIE SPRAWDZIC -
  git rev-parse --show-toplevel: kod null”. Pełna bramka nadal przy Claude poza sandboxem.
- `mutations.ps1`: 11/11 mutantów zabitych asercjami, źródła odtwarzane w finally. Ochrony:
  migracja, jej jednokrotność, zachowanie starej wartości, odmowa zapisu, walidacja wejścia,
  faktycznie zapisana wartość, zestaw i lista zamknięta, kokpit, width=0 i ciężki barrel.
  Test układu 38/38 przy 40/47/48/143/144/160 kolumnach; nie zastępuje zrzutu na żywo.
- Wszystkie eksporty headings, SVG, metryki i podzbiory odbiorców identyczne przed/po.
  Pakiety (bloby HEAD LF vs bieżące śledzone + nowe nieignorowane, bez SDK):
  **3 530 683 → 2 988 560 B, mniej o 542 123 B (15,35%)**. Miara obejmuje nowe testy;
  dodatkowy pomiar lokalnych drzew i stary wariant w E9. Nie jest to miara pobrania ani G1.
- Pomocnicze przeglądy Sol: core APPROVE; TS dwa MEDIUM (wartość zwrócona przez config.set,
  stary legalny zakres ułamkowy) → naprawione z czerwonymi regresjami, ponowny przegląd bez
  HIGH/MEDIUM. Walidator adapterów i sync zgodne; plugin validate zmienionych modów
  passed with warnings (zastane ikony, type-checker bez odpowiedzi). Polecenie `tsc` niedostępne.
- Trivy bez aktualizacji bazy: pełny `trivy-final.json`, **0 CRITICAL / 42 HIGH / 62 MEDIUM /
  14 LOW**, zakres z fixturami jak E8, brak nowych HIGH/CRITICAL i nowych zależności.
  Skaner: 46 zmienionych/nowych plików źródłowych BRAK, kontrola pozytywna SEKRET;
  wszystkie zmienione testy osobno BRAK. Wejście konfiguracji walidowane przed zapisem.
- Katalog E9 w pomiarze końcowym: **496 plików / 6 228 066 B** (stan przed zapisem inwentarza).
  Raport clean-work wywołany CLI z preloaderem przekierowującym wyłącznie zapis raportu do E9;
  także `clean-raport-final.json` i `inventory.json`. Sandbox nie rozpoznaje Gita, otwarty etap
  pominięty przez skaner — dlatego dodatkowy inwentarz. Zastany `.claude/relai/clean-raport.json`
  zachowany bajt w bajt. Nie kasowano artefaktów i nie commitowano.
- Zewnętrzne artefakty: brak nowych pozostawionych katalogów `relai-*` w TEMP między migawkami.
  Zastany `C:/Users/Lukasz/AppData/Local/Temp/relai-e7-validator-vOzuLs` zniknął w trakcie testów,
  bez ręcznego kasowania. Wszystkie własne instrumenty i wyniki w E9; cudzy `.claude/launch.json`
  nietknięty. Kontrola końcowa: cztery identyczne porażki bazy, zgodne CLAUDE/AGENTS,
  dziewięć elementów promptu E10, istniejące linki STATE/STATUS; `git diff --check` czysty.

**Poprawki po przeglądzie Sol — WARN, 5 × MEDIUM (Aneks C, 6c):**

- RelAI (gpt-6.1-sol w Codeksie, effort high) + Lukasz: pięć znalezisk Cache Keepera naprawionych
  wyłącznie w konfiguracji, rejestracji i ich testach. Aliasy tylko wolne, cudze wywołania
  przepuszczane; potwierdzone wartości zapisu zamiast starej listy po migracji i komendzie;
  brak zbędnych zapisów, odmowa zarządzanego pola nie przerywa startu; rzeczywiste klucze
  konfiguracji obejmują inline. Wariant A bez zmiany, stary magazyn migracji nietknięty.
- Przed poprawkami 7 czerwonych asercji; po config 11/11, komendy 19/19, kontrakt Node 1/1,
  13/13 mutacji zabitych asercjami, bajty źródeł odtworzone w `finally` i sprawdzone SHA-256.
  Cache Keeper plikami 218/219; jedyna porażka `terminal-grid` z identycznymi hashami jak baza.
  Pełny `claude plugin test cache-keeper` blokuje `uv_spawn EPERM` — powtarza bramka Claude.
  Sync dziewięciu celów zgodny, skan sekretów ośmiu zmienionych plików BRAK 8/8.
  Przegląd własnego diffu bez nowych usterek, `git diff --check` czysty. Dowody `review-*` w E9; szczegóły w dopisku
  [raportu E9](plany/MODY_OSZCZEDZANIA/RAPORT_E9.md#poprawki-po-przeglądzie--2026-11-13-aneks-c-krok-6c).
  Bez commita, kasowania, instalacji i przełączeń; E9 W TOKU, E10 OCZEKUJE.

**Świadomie odłożone:**

- Sonda i pomiar integracji E7–E9, ponowne E6, kliknięcie E4, migracja BenAI, dokumentacja
  użytkownika całego pakietu i jedyne wydanie — E10 (Aneks C). Wersje niewydanych modów 0.1.0
  bez podbijania. G1 i PANEL_CODEX nieotwierane; nie czytano kodu BenAI.
- Przegląd ryzyk: R1/C1 wysoki (zmienne API; testy nie zastępują E10), R7 średni
  (bliźniaki; bez przełączeń przed zgodą), R10 niski (mapa/sync zgodne), AC3–AC5 nadal pod
  formalną bramką Claude. Brak podstaw do zamknięcia tych ryzyk samym wynikiem offline.

**Do zrobienia przez człowieka:**

- Claude: pełna bramka poza sandboxem i formalny przegląd; po dodatnim wyniku E9 → ZREALIZOWANY,
  E10 → GOTOWY DO STARTU. Do tej chwili E9 W TOKU, E10 OCZEKUJE mimo istniejącego promptu.
- Claude: przegląd raportu i sprzątanie E9 dopiero po „tak”, zachowanie reproduktorów do pomiaru,
  liczby przed/po oraz propozycja commita. Codex bez commita, push, instalacji i przełączeń.
- E10: pomiar z Łukaszem i przełączenia BenAI, dwie decyzje biznesowe z PLAN §9 oraz
  odinstalowanie BenAI przez Łukasza po dodatnim pomiarze; bramki jawnie OTWARTE w STATUS.

**Bramka Claude — 2026-11-13: E9 ZREALIZOWANY**

Autor: RelAI (Opus 5.5 w Claude Code) + Lukasz

- Przebieg: terra `crew.js run --role coder` bez `--raw` → `STOP:` (preambuła roli zabrania
  `docs/`; L-0332 powtórzona przez Claude); terra `--raw` → `PYTANIE:` o konflikt `$.store` ↔
  `userConfig` (Łukasz: wariant A); dwa kolejne przebiegi terra po 2–5 min „nieukończony”
  (L-0336 powtórzona — ponowienie zamiast zmiany wykonawcy); Sol: pierwszy przebieg na limicie
  Codeksa, drugi (44 min) dowiózł zakres i rytuał. Reguły `--raw` i L-0336 dopisane do pamięci.
- Przegląd Sol (`crew.js run --role reviewer`, tylko odczyt): WARN, 5 × MEDIUM w Cache Keeperze
  (aliasy komend bez sprawdzenia zajętości, opóźniony odczyt konfiguracji w dwóch miejscach,
  zbędne zapisy pól zarządzanych, przestrzeń `@inline`) → poprawki Sol 5/5, 7 czerwonych asercji
  przed kodem, 13/13 mutacji zabitych. Raport: `PRZEGLAD_SOL_E9.md` w folderze planu.
- Poza sandboxem: `node --test --test-isolation=none` — guardrails 33, process 432, panel 255,
  codex 28, cursor 10, Research 6 — 0 porażek. `claude plugin test`: browser 28, effort 33,
  input-router 80, model-router 103, mods 92, research 66 bez porażek; cache-keeper 218/219,
  panel 218/220, progress 50/51 — te same cztery zastane czerwienie wyglądu (nazwy testów jak
  w bazie). `validate-adapters.js` kod 0, `sync-panel-core --check` zgodne 9 celów, skaner
  sekretów `BRAK` dla zmienionych plików Cache Keepera. `release-check.js` kod 2 „brak bazy
  modu relai-browser” — odłożone do E10, nie regres.
- Katalog roboczy E9 (8,3 MB) i przebiegi `CREW/mody-e9*` skasowane po zgodzie Łukasza.
  E9 → ZREALIZOWANY, E10 → GOTOWY DO STARTU.
- **Świadomie odłożone:** `crew.js review` nie działa z bieżącym CLI Codeksa — `codex review`
  odrzuca `--color` („unexpected argument '--color' found”); przegląd szedł przez
  `crew.js run --role reviewer`. Naprawa poza zakresem E9 — odnoga albo E10.

### 2026-11-17 — MODY_OSZCZEDZANIA E10 i zamknięcie planu: pomiar na żywo, Aneks E, wydanie 3.9.0

Autor: RelAI (Opus 5.5 w Claude Code) + Lukasz

**Zrobione — dowiezione vs plan:**

- Plan (10 etapów): pięć modów oszczędzania tokenów z zachowaniem paczki BenAI na własnym kodzie,
  wspólny rdzeń bramek i rejestru, zakładka „Oszczędności” w `relai-panel`, migracja z BenAI
  i jedno wydanie. Powstało wszystko: `relai-input-router`, `relai-browser`, `relai-model-router`
  (z kartą załogi `/relai-crew`), `relai-effort`, `relai-research` 0.1.0, rdzeń
  `savings-gates`/`savings-ledger`, zakładka z wyceną routera, porządki AUDYT_MODOW (E9) i wydanie
  3.9.0 razem z `relai-panel` 0.23.0, `relai-progress` 0.8.0, `relai-cache-keeper` 0.14.0
  i `relai-mods` 0.4.0. Odstępstwa od planu: wykonawca E7–E9 Codex (Aneks C), E10 w całości
  Claude (decyzja Łukasza 2026-11-16), wyjątek routera dla Research (Aneks D), dziesięć poprawek
  z pomiaru (Aneks E). Przepadło nic; dwa wiersze pomiaru świadomie otwarte (niżej).
- E10 (2026-11-16–17): macierz [POMIAR_E10](archiwum/plany/MODY_OSZCZEDZANIA/POMIAR_E10.md) —
  28 wierszy zgodnych, w tym zaległe kliknięcia E4/E6/E7/E8; usterki → Aneks E: obrazy
  przepuszczane przez Input Router (E.1), jedna karta routera naraz (E.5), jeden URL = jeden numer
  i typ agenta `relai-research:reader` z samymi narzędziami web (E.6–E.7), wycena routera ze
  stawkami cache (E.8, wcześniejsze ~$3,79 było artefaktem), pierwsze wydanie modu
  w `release-check` (E.9), kreska i stała kolejność pasków na 2.1.323+ (E.10 — znikły też cztery
  „zastane czerwienie wyglądu”). E.2–E.4 opisane bez zmiany kodu.
- Wydanie (fraza „gotowi do wydania?”): raport miał jedną czerwień `film-zakladki` (film z 3.4.0
  bez zakładki „Oszczędności”). Decyzja Łukasza: jawny wyjątek `zakladki-poza-filmem`
  w `release-map.json`, kontrola czerwienieje, gdy wyjątek straci sens; commit `29f65d3`. Dziesięć
  tagów przez bramkę `pre-push`, dziesięć wydań GitHub, push `main`, `marketplace update`,
  `plugin update` (user i local).
- Decyzje §9 planu (Łukasz 2026-11-17): nowe mody bez „early access”, bez wzmianki o inspiracji.
  Siedem pluginów `@token-saving-mods` odinstalowanych za zgodą Łukasza; `relai-panel`,
  `relai-cache-keeper`, `relai-mods` włączone z powrotem (wyłączył je pomiar E10, L-0340).
- Lekcje: L-0339 (decyzje człowieka przed commitem wydania), L-0340 (przywrócenie instalacji po
  pomiarze); pułapka P-077 (raport `--json` dziesięciu komponentów obcięty w wyniku Bash).

**Zweryfikowane — jak dokładnie:**

- `release-check.js --json --wydanie` → kod 0, 0 czerwonych (pominięte tylko `testy-filmu`:
  diff nie dotyka filmu); testy rdzenia, panelu, Codeksa i Cursora 768/768, strona 396/396,
  `claude plugin test` dziewięciu modów 900/900; `release-check.test.js` 61/61, nowe testy
  wyjątku najpierw czerwone z asercji, mutant „bez filtra wyjątku” zabity (2 czerwone).
- `claude plugin validate` binarką aplikacji: rdzeń i dziewięć modów „passed with warnings”
  (`CLAUDE.md` w korzeniu, brak ikony, uwagi ścisłego TS z type-checkera, brak linii instalacji
  w README nowych modów).
- `release-verify --sesja`: `relai` 1737/1737, `relai-panel` 65, `relai-progress` 28,
  `relai-cache-keeper` 39, `relai-mods` 14 plików — 0 rozjazdów, świeża sesja ładuje każdy
  z katalogu nowej wersji (trzy po ponownym włączeniu). Strona `strona.yml` zielona, na żywo
  3.9.0; panel po `/reload-plugins` sprawdzony przez Łukasza („ok”).
- Trivy (`--skip-db-update`): 0 CRITICAL / 42 HIGH / 62 MEDIUM / 14 LOW — jak w E9, bez nowych.
- Katalog roboczy planu przed: E10 22 pliki / 243 KB, E1 19 plików / 30 KB, kopia pomiarowa
  `~/.claude/dev-mods/302eba00…` 12 MB; po: 0 — skasowane po zgodzie Łukasza. Szkice notatek
  wydania w `.claude/relai/work/WYDANIE/3.9.0/` zostają.

**Świadomie odłożone:**

- Wiersze 23 (skaner przed wynikiem agentów Research) i 26 (migracja Cache Keepera na
  instalacji 0.14.0) macierzy POMIAR_E10 — pomiar po wydaniu (decyzja Łukasza); `isBareYes`
  bez „gotowe” (LOW); nowy render filmu; linia instalacji w README nowych modów i uwagi TS;
  trwała poprawka P-077; `crew.js review` z `--color` (z E9). Wszystko w STATE „Co dalej”.
- Przegląd ryzyk: C1 (zmienne API modów) bez zmiany — wysoki, wydanie stoi na 2.1.325; C8 bez
  zmiany; nowych ryzyk tabeli brak. Plan zamknięty i przeniesiony do
  [archiwum](archiwum/plany/MODY_OSZCZEDZANIA/STATUS.md); aktywny plan: brak.

**Do zrobienia przez człowieka:**

- —

### 2026-11-17 — Rotacja dziennika i lekcji, skrócenie STATE

Autor: RelAI (Opus 5.5 w Claude Code) + Lukasz

**Zrobione:**

- Dziennik (`rotate.js`, próg 150 KB, cel 90 KB): 48 wpisów 2026-10-26 … 2026-11-11 →
  [DZIENNIK_2026-10-26_2026-11-11.md](archiwum/dziennik/DZIENNIK_2026-10-26_2026-11-11.md),
  suma `464db9377d9d48e1` zgodna po odczycie z dysku; 314,2 → 88,0 KB; linki „Czeka na
  człowieka” 8, przepiętych 0, martwych kotwic 0.
- Ryzyka: sekcja 18,2 KB / 12 KB, wierszy `ZAMKNIĘTE` 0 — rotacja nic nie zdejmuje; kompresji
  „Mitygacji” brak (jedyna `ZMITYGOWANE`, L1, ma 330 znaków).
- Lekcje (ręcznie, skrypt z 2026-10-28 z wagą bez „Zasad aktywnych” wg aneksu D-88): 36 lekcji
  L-0273 … L-0308 → [LEKCJE_L-0273_L-0308.md](archiwum/lekcje/LEKCJE_L-0273_L-0308.md), suma
  `932cbe977416309e` zgodna; 94,9 → 65,6 KB całości, bez „Zasad aktywnych” 59,4 → ok. 30 KB;
  linków do przeniesionych kotwic 0. Dopisana L-0341 (powtórka L-0308 przy wydaniu 3.9.0).
- STATE 334 → 297 linii: „Co dalej” pogrupowane tematycznie, „Wymagania” złączone z linkami,
  szczegółowe pomiary KONTEKST_STARTU zastąpione wynikiem „po planie” i linkiem do archiwum
  planu. Usunięte fakty historyczne: restart aplikacji po 3.5.0 zrobiony 2026-10-27 (bramka E5
  PIPELINE_WYDAN spełniona w praktyce); Aneks F („jedno okno pytań”) odwrócony 2026-10-28
  i wydany w 3.7.0 (D-93); pozycja „rotacja dziennika i lekcji” (zrobiona tym wpisem).

**Zweryfikowane — jak dokładnie:**

- Sumy archiwów z wyjścia skryptów (faza 1 przed fazą 2); `grep` kotwic `LEKCJE.md#l-0273…0308`
  poza archiwum — 0; `wc -l docs/STATE.md` 297; skrót startu po zmianach 20 636 B (kod 0);
  testy procesu 436/436, walidator kod 0.

**Do zrobienia przez człowieka:**

- —
