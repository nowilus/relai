# DZIENNIK — budowa RelAI

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R5 | Dokumenty puchną i zjadają kontekst | **Niski dla projektów na 1.7.0, średni dla niezmigrowanych** (2026-09-01 po E6; wcześniej średni) | **ZMIERZONE 2026-09-01, OTWARTE ŚWIADOMIE — zawężone do migracji JiraManagera** | Rotacja działa na cudzych projektach; otwarte, bo JiraManager czeka na migrację. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| P1 | Adaptery Cursor/Codex nie egzekwują blokad harnessu — sekret albo zmiana konfiguracji przejdzie tam, gdzie w Claude Code stoi ściana (plan ROZWOJ_PO_WYDANIU) | **Średni** (2026-08-12 po E4; wcześniej wysoki) | **OTWARTE** | Sekret zatrzymują hook i pre-commit; otwarte: Cursor bez egzekwowanego `ask`, Codex niezmierzony. Od E5 (2026-09-24) różnica jest jawna w README: tabela „Co pilnuje tylko Claude Code”. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| P2 | Odpowiednik R2 w Cursor/Codex: bez auto-wyzwalania skilli proces zależy od dyscypliny modelu (plan ROZWOJ_PO_WYDANIU) | **Niski dla Cursora, średni dla Codeksa** (2026-08-17 po E6; wcześniej średni) | **OTWARTE (już tylko Codex)** | Cursor prowadzi proces regułą zawsze w kontekście; otwarte dla Codeksa, gdzie skille wyzwala opis. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| S1 | Bramka dokumentacyjna przepuści coś potrzebnego — plik nieśledzony, o którym architektura milczy, a bez którego nie da się powtórzyć pomiaru (plan SPRZATANIE_ARTEFAKTOW, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kasowanie tylko po „tak”; otwarte, bo ochrona zależy od opisu materiału, a dorobek sesji chroni `git add`. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| S2 | Narzędzie skasuje coś poza dozwolonymi korzeniami — zła ścieżka względna, dowiązanie prowadzące na zewnątrz, junction do innego dysku (plan SPRZATANIE_ARTEFAKTOW, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Asercje korzeni wytrzymały cztery przebiegi; otwarte: junction na inny dysk i długa ścieżka niezmierzone. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| M1 | Skill wspólny dla dwóch narzędzi pokaże listę tego drugiego — sesja w Cursorze zobaczy modele Anthropic (plan REKOMENDACJA_MODELU, ryzyko 1) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Listę wybiera nazwa pliku z hooka; otwarte: niezmierzone w aplikacji Cursora z adapterem. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M2 | Kopia listy w projekcie zostaje nadpisana przy starcie sesji i zjada odświeżenie zrobione komendą (plan REKOMENDACJA_MODELU, ryzyko 2) | **Wysoki** (2026-09-03, przy powstaniu mechanizmu) | **OTWARTE** | Kopia listy przeżywa start i `/relai-models`; otwarte: zakaz dla `/relai-update` niezmierzony. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M3 | Strona dokumentacji zmienia układ i odczyt z sieci zwraca śmieci albo nic (plan REKOMENDACJA_MODELU, ryzyko 3) | **Średni** (2026-09-04, przy wejściu sieci do mechanizmu) | **OTWARTE** | Niepowodzenie zostawia starą listę z datą; otwarte: odpowiedź 200 ze zmienionym układem niezmierzona. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M5 | Nazwy modeli zmieniają się szybciej niż wydania RelAI (plan REKOMENDACJA_MODELU, ryzyko 6) | **Średni** (2026-09-04) | **OTWARTE** | Lista ma próg wieku 7 dni; otwarte trwale, bo świeża lista nie wie o zmianie nazw u dostawcy. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
| M6 | Załoga stoi na flagach CLI trzech dostawców (`claude -p --permission-mode`, `codex exec -s`, `agent -p --mode`), które zmieniają się szybciej niż wydania RelAI (wątek ORKIESTRACJA) | **Średni** (2026-09-06) | **OTWARTE** | Flagi w `buildCommand`, porażka zawsze w raporcie; otwarte: Codex i Cursor jako gospodarz niezmierzone. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |

| O4 | Tryb ciągły kosztuje turę przy każdym zdaniu — praca zwalnia i drożeje (plan OPTYMALIZATOR_PROMPTOW, ryzyko O4) | **Średni** (2026-09-14, przy akceptacji planu) | **OTWARTE** | Wyłącznik w `USTAWIENIA.md`, filtr pomija komendy; otwarte: rozrzut kosztu większy niż mierzona różnica. Historia: [MITYGACJE_2026-09-24](archiwum/ryzyka/MITYGACJE_2026-09-24.md). |
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
- **AUDYT_MODOW — ustalenia poza zakresem (5 pozycji `outOfScope` raportu)** — odchudzenie kopii rdzenia per plugin (`sync-panel-core`), `headings.mjs` 254 KB w progress i cache-keeperze, % limitu per etap w rdzeniu, `userConfig` cache-keepera, przedrostek `relai-` jego komend; plus wariant B „jedna listwa” jako kandydat na plan — decyzja: plan, odnoga albo odrzucić · 2026-10-11 · [wpis 2026-10-11 — Z13, Z14 i zamknięcie odnogi](archiwum/dziennik/DZIENNIK_2026-10-11_2026-10-12.md#2026-10-11--audyt_modow-z13-i-z14-wydanie-0120-i-zamknięcie-odnogi)
- **PANEL_CODEX E1 — próba przycisków minimalnego pakietu i świeżego kontekstu** — w macierzystym czacie nadal proces 0.0.7/PID 62300; po restarcie sprawdzić sondę 0.0.9 (także fonty), nowy szkic i jego rzeczywisty projekt/kontekst. Wygląd już zaakceptowany · 2026-10-10 · [wpis — Panel i mostek](archiwum/dziennik/DZIENNIK_2026-10-09_2026-10-10.md#2026-10-10--panel_codex-e1-natywny-widok-minimalny-pakiet-i-mostek-bieżącego-czatu)

- **Zamrożenie dwóch bramek zgody jako decyzji** — zgoda na tryb ciągły (raz na sesję, z zapisem
  globalnym) i zgoda na propozycję struktury poza projektem (raz na maszynę). Oba wzorce wrócą przy
  każdym nowym zachowaniu proaktywnym RelAI · 2026-09-15 ·
  [wpis 2026-09-15 — Zgłoszenie testera](archiwum/dziennik/DZIENNIK_2026-09-14_2026-10-09.md#2026-09-15--zgłoszenie-testera-plugin-pyta-o-relai-w-cudzym-folderze-dwie-bramki-zgody-i-wydanie-230)
  *(odroczone 2026-10-16, odroczeń: 1)*

- **Rozjazd manifestu z produktem przy opisie repozytorium** — `description`
  w `.claude-plugin/plugin.json` mówi „…framework for Claude Code", a RelAI ma trzy adaptery;
  `keywords` nie zawiera ani jednej nazwy narzędzia. Wizytówka GitHuba ma skopiować manifest, czy
  najpierw poprawiamy manifest (czyli podbicie wersji i pełna sekwencja wydania)? · 2026-09-13 ·
  [karta odnogi OPIS_REPO](archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md)
  *(odroczone 2026-10-14, odroczeń: 1)*

- **Zamknięta lista rdzeni rozstrzygnięcia nie zna słownika realnego projektu** — 7 z 32 pozycji
  „Czeka na człowieka" w PolyFlow wygląda dla człowieka na zamknięte, a mechanizm liczy je jako
  otwarte (`zaliczona` ×3, `dostarczony` ×1, trzy bez rdzenia z datą). Poszerzyć listę w rdzeniu
  czy przepisać adnotacje w cudzym projekcie? · 2026-09-01 ·
  [wpis 2026-09-01 — E6: wydanie 1.7.0](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--e6-wydanie-170-pomiar-po-restarcie-i-pierwsza-rotacja-z-przepięciem-linków)
  *(odroczone 2026-10-08, odroczeń: 1)*

- **Weryfikacja ośmiu rozstrzygnięć wpisanych w E2 — wypisane co do jednego 2026-09-01, czekają na
  potwierdzenie albo sprzeciw** · 2026-08-20 ·
  [wpis 2026-09-01 — Osiem bramek z listy zamkniętych](archiwum/dziennik/DZIENNIK_2026-09-01_2026-09-03.md#2026-09-01--osiem-bramek-z-listy-zamkniętych-plan-rozwoj_po_wydaniu-zamrożony-formalnie)
  *(odroczone 2026-10-11, odroczeń: 2)*

- **Ryzyko R2 zamknięte na nieaktualnej przesłance** — 2026-09-03 zamknięto je zdaniem „nie zostanie
  zmierzone nigdy", opartym na wyczerpanym limicie `claude -p` (L-0032). W E1 tego samego dnia
  `claude -p` **zadziałał** i poprowadził pomiar świeżych sesji (L-0084). Otworzyć R2 ponownie,
  przepisać jego treść czy zostawić zamknięte z adnotacją? · 2026-09-03 ·
  [wpis 2026-09-03 — E1 planu REKOMENDACJA_MODELU](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-03--e1-planu-rekomendacja_modelu-pytanie-o-model-pokazuje-nazwy-nie-klasy)
  *(odroczone 2026-10-08, odroczeń: 1)*

- **Czy ochrona konfiguracji ma zostać przy werdykcie `ask`** — w sesji z automatyczną akceptacją
  edycji `ask` nie zatrzymuje niczego, więc edycja sekcji niemutowalnej **cudzego** `CLAUDE.md`
  przechodzi mimo poprawnego werdyktu hooka. Podnieść do `deny` dla cudzego projektu (własny
  zostaje przy `ask`), zostawić bez zmian, czy opisać to jako świadomą granicę? · 2026-09-04 ·
  [wpis 2026-09-04 — Blokada guardraila pokazana w żywej sesji](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--blokada-guardraila-pokazana-w-żywej-sesji-ochrona-konfiguracji-okazuje-się-doradcza)
  *(odroczone 2026-10-08, odroczeń: 1)*

- **Ponowna instalacja pre-commita w projektach z hookiem sprzed 1.9.2** — stary układ
  (bezrozszerzeniowy `pre-commit` + `relai-secret-scan.js`) przewraca się w projekcie
  z `"type": "module"` i blokuje każdy commit. Dotyczy PolyFlow, JiraManagera i projektów
  zewnętrznych; instalacja jest jawną czynnością człowieka, więc RelAI jej nie wykona sam.
  · 2026-09-04 ·
  [wpis 2026-09-04 — Cztery defekty pre-commita](archiwum/dziennik/DZIENNIK_2026-09-03_2026-09-06.md#2026-09-04--cztery-defekty-pre-commita-ze-zgłoszenia-zewnętrznego-wydanie-192)
  *(odroczone 2026-10-08, odroczeń: 1)*

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

### 2026-10-26 — ZGLOSZENIA E3: pasek cache w terminalu jako siatka kolumn (#2)

**Zrobione:**

- `cache-keeper/hooks/rings.ts`: czysta siatka terminala (bez `$`). `TERM` (odstęp 2, najwyżej
  3 kolumny), `termCellWidth` (glif + etykieta + wartość w komórkach), `termColumns` i `termRows`.
  Komentarz mówi, że glif ma jedną komórkę w `conhost`, a w terminalu z szerokimi znakami
  „ambiguous” dwie.
- `cache-keeper/hooks/register.tsx`: gałąź terminalowa `band()` rysuje wiersze `cells-N` po N
  miar. Przy więcej niż jednej kolumnie komórka `m-<miara>` ma stałą szerokość i `flexShrink={0}`,
  a wartość zawsze stoi w pudełku `flexShrink={0}`. Linii `b` nie ma. `termMiddle()` liczy środek
  karty w komórkach jak `middlePx`, ale kolumna kosztu rośnie z tekstem („brak danych kosztu” to
  18 komórek). Gałąź `Svg` nietknięta.
- Testy: nowy `cache-keeper/hooks/terminal-grid.test.ts` (7 testów). `rings.test.ts`: test
  terminala oczekuje teraz glifu, etykiety i wartości bez linii `b` (decyzja wariantu A planu).

**Zweryfikowane — jak dokładnie:**

- `claude plugin test .` w `cache-keeper/` (2.1.308) → **206/206 w 15 plikach** (było 199/199
  w 14).
- Szerokość przy 31, 75, 94 i 120 kolumnach, z kosztem i bez niego: żaden wiersz nie jest szerszy
  niż okno (instrument `natural`). Każda miara stoi raz, wiersze mają równe kolumny. Kontrola
  pozytywna w tym samym przebiegu: drzewo z komórką o szerokości okna + 1 jest wykryte.
  Liczba kolumn: **1, 3, 2, 3**. Od `BAR.narrow` = 90 wspólna karta stawia etykietę i koszt obok
  środka i zabiera mu 31 komórek. Punkt promptu „rośnie z szerokością” nie przeszedłby dosłownie.
  Rozstrzygnięcie Łukasza: „Rosną w obrębie układu”. Test sprawdza wzrost osobno dla układu
  wąskiego (31 → 75: 1 → 3) i szerokiego (94 → 120: 2 → 3), oraz 1 kolumnę przy 31 i najwyżej 3
  (L-0282).
- Węższy niż jedna komórka (16 i 20 kolumn, przypadek z sekcji 8 planu): pięć wierszy po jednej
  mierze, wszystkie pięć wartości całe. Instrument `narrowest` (zawijanie) ≤ okno, a `natural`
  > okno, więc zawijanie jest naprawdę potrzebne. Kontrola: podłożona wartość dłuższa niż okno
  wykryta. Dodane po przeglądzie diffu; wcześniej gałąź zawijania nie miała testu.
- Brak linii `b`: rdzenie `zużyt|zostało|reset (jutro |\d)|TTL|wolne|próg` nie występują w tekście
  terminala przy żadnej z czterech szerokości. Kontrola pozytywna: ten sam wzorzec trafia w `alt`
  desktopu tej samej sesji. **Mutacja** przywracająca `{m.b}` w komórce (skrypt z kotwicą,
  1 trafienie) → 200 pass / 4 fail, w tym „no line b in the terminal”. Plik po przywróceniu ma tę
  samą sumę (sha1 `8cc929d34ff7` przed i po).
- Desktop bez zmian: odcisk FNV-1a drzewa `desktop` przy 75 i 140 kolumnach — **HEAD `f07fc26`**
  (sonda w `git worktree` z `core.autocrlf=false`) i drzewo robocze w jednym przebiegu dały te same
  wartości `b2293fa1` / `705cb674`, wpisane w test. Dowód negatywny: `git diff -U0` w
  `register.tsx` nie zawiera ani jednego wiersza z `Svg`.
- Na żywo w `conhost.exe` (L-0259): `mode con` 80 i 120 kolumn, `claude.exe` 2.1.308. W jednej
  sesji dwie kopie modu pod innymi nazwami (`relai-cache-keeper-head` z worktree HEAD i `-e3`
  z drzewa roboczego, dwa `--plugin-dir`). Zainstalowany mod wyłączony przez `--settings`,
  katalog sesji poza projektem, jedna tura „ok”. Klawisze przez `WriteConsoleInput`, ekran
  z bufora. Skrypt PowerShell z `Bypass` klasyfikator trybu auto najpierw odrzucił; ruszył po
  zgodzie Łukasza („Pozwól, uruchom pomiar”, L-0283).
  - Przy 80 kolumnach HEAD rysuje „◕ limit 5 h 25 % zużyte 25 % · zostało 75 % · reset 21:10 ·
    próg 90 %”, a „zużyte 16 % …” limitu tygodnia spada do osobnej linii (7 wierszy). E3 rysuje
    „● cache ~60 min ◕ limit 5 h 25 % ◑ reset za 2 h 05 min” i „◕ limit tygodnia 16 % ●
    kontekst 66.5k” (2 wiersze). Glify E3 stoją na pozycjach 1, 24, 47 i w drugim wierszu 1, 24.
  - Przy 120 kolumnach HEAD ma 5 wierszy z linią `b`. E3 ma 2 wiersze, glify na 17, 40, 63
    i 17, 40. Krok kolumny 23 = komórka 21 + odstęp 2.
- `node core/tools/release-check.js --szybko` → zero czerwieni; `relai-cache-keeper` 0.12.0 →
  propozycja 0.12.1 (4 pliki bez commitu, „co najmniej patch”) do E5.
- Przegląd diffu (subagent recenzent): 0 krytycznych, 7 średnich, 1 drobna. Wzięte: test
  węższego okna, kontrola pozytywna `cutCells`, `natural` liczy `Box` bez kierunku jako wiersz
  (jak Ink), komentarz o glifie „ambiguous”. Odrzucone:
  - wspólne stałe geometrii z `bar-card.tsx` — ten sam wzór ma `middlePx` od dawna, a rozjazd
    złapie test szerokości;
  - pojedyncza spacja w wyrażeniach `rings.test.ts` — tekst węzłów łączy się bez spacji, odstęp
    to `columnGap`.
- Katalog roboczy `.claude/relai/work/ZGLOSZENIA/E3/`: przed — 7 plików, 24 504 B (skrypty
  `make-probe.js`, `mutate.js`, `plan-text.js`, tekst planu, trzy zrzuty bufora). Skasowany po
  „Wszystko” Łukasza; po — katalogu nie ma. Poza katalogiem: worktree
  `%TEMP%/relai-zgl-e3-head` (116 MB) usunięty `git worktree remove`. Skasowane też
  `%TEMP%/relai-zgl-e3-mods` (3,6 MB), `relai-zgl-e3-cwd`, `relai-zgl-e3-term.ps1`,
  `relai-zgl-e3-run80.cmd` i `relai-zgl-e3-run120.cmd`; 0 trafień `relai-zgl-e3` w `%TEMP%`.

**Świadomie odłożone:**

- Glif w terminalu z szerokimi znakami „ambiguous” (CJK) zajmie dwie komórki i wiersz może
  wyjść poza środek — niezmierzone, opisane w komentarzu `rings.ts`.
- Próg `narrow` wspólnej karty (trzy mody) zostaje: przy 90–~100 kolumnach siatka ma 2 kolumny,
  przy 75 ma 3.
- `.claude/relai/work/ZGLOSZENIA/plan-fill.mjs` i `zasady.md` — pozostałości sprzed etapów,
  nie E3. `.claude/launch.json` — nieśledzony plik spoza etapu.
- Rotacja dziennika (153 KB przy progu 150) i zamkniętych ryzyk; `LEKCJE.md` po dwóch lekcjach
  powyżej progu 50 KB — przy „kończymy na dziś”.

**Do zrobienia przez człowieka:** —

Przegląd ryzyk: ryzyko 3 planu (siatka rozjedzie się w wąskim terminalu) nie zaszło — szerokości
31–120 i 16–20 zmierzone testem, 80 i 120 na żywo. C8 (inny mod nad promptem) bez zmian: gałąź
terminalowa nie owija `next(e)`.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — ZGLOSZENIA E4: tytuł nowej sesji z fokusu przez `sessionTitle` (#1)

**Zrobione:**

- Sonda przed kodem (zasada 13): build 2.1.308 ma `sessionTitle` w schemacie wyjścia
  `UserPromptSubmit` i `SessionStart`; payload nie mówi, czy prompt jest pierwszy.
- `core/panel/session-title.mjs` (nowy): kształt „E4 · PLAN — nazwa etapu” / „Odnoga NAZWA”,
  najwyżej 60 znaków, cięcie na granicy słowa z „…”, identyfikator nigdy nie cięty. Jedna reguła
  dla hooka (przez `import()`) i dla `start_session` karty etapu (kopia `sync-panel-core` w czterech
  modach).
- `core/process/session-title.js` (nowy): zamknięta lista fraz (`kontynuujemy pracę`, `kontynuuj`,
  `tak`, `let's continue`, `continue`, `yes`, forma z plikiem wznowienia i zgodą), komenda etapu
  (oba ukośniki, `--zgoda-panelu`), źródła w kolejności przekazanie → plik fokusu sesji → komenda
  etapu → pierwsza pozycja „Nad czym pracujemy” w STATE; `priorPrompts` (wcześniejsze prompty
  człowieka w transkrypcie) i `claimFirst` (znacznik `.claude/relai/tytul/<id>`, flaga `wx`).
- `adapters/claude-code/hooks/session-title.js` (nowy, czternasty hook) i jedno wejście
  w `hooks.json`. Kolejność: marker RelAI → znacznik → fraza → transkrypt → źródła; cisza przy
  awarii; `exit` po opróżnieniu stdout.
- `panel/hooks/launch.ts`: `startSessionArgs(topic, stage, text, name)` bierze tytuł z `titleOf`;
  `core/panel/decisions.mjs` niesie `name` etapu w akcji `newSession`; `register.tsx` przekazuje go
  dalej.
- `core/MANIFEST.json` (biblioteka `session-title`, `uses` adaptera), README (tabela i „czternaście”),
  `docs/PRZEWODNIK.md` (drzewo katalogów). P-055, P-056; L-0284, L-0285.
- Komenda etapu jako źródło stoi za przekazaniem i plikiem fokusu, przed STATE — decyzja planu
  wymienia trzy źródła, komenda z karty i tak niesie ten sam cel co przekazanie.

**Zweryfikowane — jak dokładnie:**

- Sonda `sessionTitle`, trzy pomiary:
  - CLI `claude -p` (2.1.308, `--settings` z hookiem sondy, katalog w `%TEMP%`): log debug „Hook
    sessionTitle applied (14 chars)”, transkrypt ma `custom-title` „SONDA-E4 33471”.
  - Desktop, folder sondy wybrany ręcznie: lista sesji aplikacji pokazała „SONDA-E4 67435”, tytuł
    z hooka wygrał z tytułem AI. Pierwsza próba linkiem wylądowała w folderze RelAI i nie
    zmierzyła niczego (P-056).
  - Po `/clear` w tej samej sesji: nowe id `56b96d95`, tytuł z hooka zapisany w nowym transkrypcie.
- Testy: `core/process/tests/session-title.test.js` 23 testy, `core/panel/tests/session-title.test.js`
  9. `node --test "core/process/tests/*.test.js"` → **295/295** (było 272). `node --test
  "core/panel/tests/*.test.js"` → **225/225**. `claude plugin test .`: panel **214**, progress 48,
  cache-keeper 206, mods 68 — bez porażek (L-0264).
- Mutacje (skrypt z kotwicą, `--test-reporter=tap`, plik przywrócony i porównany): zdjęcie
  znacznika w hooku → 1 fail („tak” jako drugi prompt); zdjęcie `isFirst` w rdzeniu → 1 fail;
  zdjęcie warunku transkryptu → 1 fail (sesja z wcześniejszymi promptami).
- Dowód negatywny na realnym repo, po ostatniej zmianie: sesja `e4-dowod-3` „zrób przegląd
  README” → pusto, potem „tak” → pusto; kontrola pozytywna `e4-dowod-4` „kontynuujemy pracę” →
  tytuł. Znaczniki skasowane.
- Na żywo, „Nowa sesja” — trzy przebiegi:
  1. Ręcznie w RelAI (`/clear` + „kontynuujemy pracę”): tytuł „E1 · PANEL_CODEX — …” ze STATE,
     bo nowa sesja `dd164ad9` nie miała pliku fokusu. Zaproponowałem aneks; Łukasz zapytał, czy
     przycisk nie robi więcej. Kod potwierdził pominięty krok synchronizacji (L-0284).
  2. Projekt testowy `%TEMP%/relai-zgl-e4-proj` (INNY_PLAN pierwszy w STATE, PROBA drugi),
     `/handoff` → „Wyczyść i kontynuuj”: tytuł „PROMPT_ETAP_2 documentation summary” z aplikacji.
     Transkrypt nowej sesji zaczyna się rekordem `custom-title` starej rozmowy, a hook milczał na
     warunku `session_title` (L-0285, P-055). Synchronizacja nie zmieniła kolejności w STATE.
  3. Po poprawce (pierwszy prompt z transkryptu), ten sam projekt: lista sesji aplikacji —
     **„E2 · PROBA — Drugi krok sondy”**. Plik fokusu nowej sesji powstał o 08:08:07.011, znacznik
     hooka o 08:08:07.142 — tytuł ze źródła nr 2, nie ze STATE.
- `priorPrompts` na prawdziwych transkryptach przebiegów 2–3: nowe sesje po `/clear` → 0, stare → 3.
- `node core/tools/release-check.js --szybko` → zero czerwieni (dwie czerwienie od E4 — `uses`
  w MANIFEST i README na 13 hooków — naprawione w etapie).
- Przegląd diffu (subagent recenzent): 0 krytycznych, 0 wysokich, 2 średnie, 4 drobne. Wzięte:
  transkrypt czytany dopiero po znaczniku i frazie; zamknięta lista opakowań systemowych zamiast
  prefiksu „<” (wklejony HTML i komenda inna niż `/clear` liczą się jako prompt); prompt z samym
  obrazem lub dokumentem liczy się; `exit` po opróżnieniu stdout. Odłożone: niżej.
- Katalog roboczy `.claude/relai/work/ZGLOSZENIA/E4/`: przed — 17 plików, 10 632 B (skrypty
  `probe-title.js`, `mutate.js`, `make-proj.js`, `open-probe.js`, pięć payloadów, pięć tytułów,
  ustawienia i wynik sondy `-p`). Skasowany po zgodzie Łukasza; po — katalogu nie ma. Poza
  katalogiem: `%TEMP%/relai-zgl-e4-cwd` i `%TEMP%/relai-zgl-e4-proj` oraz ich katalogi
  transkryptów w `~/.claude/projects/` — skasowane; `.claude/settings.local.json` z hookiem
  pomiaru w RelAI — skasowany; sesje testowe „E2 · PROBA …”, „PROMPT_ETAP_2 documentation
  summary”, „Sonda E4 pierwszy prompt” — zarchiwizowane. 0 trafień `relai-zgl-e4` w `%TEMP%`.

**Świadomie odłożone:**

- Wyścig zapisu fokusu po `/clear` z hookiem: jeden przebieg, margines 131 ms. Gdy hook wygra,
  tytuł spada do STATE — bramka manualna po wydaniu (trzy przebiegi).
- Przegląd, uwagi drobne: „tak” bez znacznika z jednym wcześniejszym „tak” w transkrypcie liczy
  się jako pierwszy, a nieczytelny transkrypt po `/clear` milczy tylko przy niepustym
  `session_title` — oba przypadki dotyczą wyłącznie sesji sprzed znacznika i błądzą w stronę ciszy
  albo jednego tytułu.
- Panel nie przeniósł fokusu na sesję po ręcznym `/clear` w RelAI (brak pliku dla `dd164ad9`),
  a po `/clear` z `/handoff` przeniósł — przyczyna w `relai-panel` niezbadana, poza zakresem E4.
- Pozycja STATE wskazująca plan z innego narzędzia daje tytuł tego planu (decyzja planu, sekcja 8).
  W tym repo pierwszą pozycją jest PANEL_CODEX, więc sesja bez fokusu dostanie jego tytuł.
- `relai-progress` i `relai-mods` dostały kopię `session-title.mjs` przez `sync-panel-core`, choć
  jej nie używają — raport proponuje im patch; rozstrzygnięcie w E5.
- Sesje testowe: `local_69f0791f` (RelAI, po `/clear`) nie dała się zarchiwizować, bo pracowała;
  `local_6fbb7b19` „PROMPT_ETAP_2 documentation summary” w folderze RelAI — nieruszona, do decyzji
  Łukasza. Znaczniki `7232f936` i `dd164ad9` w `.claude/relai/tytul/` to zwykły stan hooka.
- Powtórka błędu z L-0116: ścieżkę Windows przepuściłem przez `node -e` w powłoce (błąd składni,
  nic nie powstało); poprawione skryptem pisanym Write.
- Rotacja dziennika, ryzyk i lekcji (wszystkie ponad progiem) — przy „kończymy na dziś”.

**Do zrobienia przez człowieka:**

- Po wydaniu: „Nowa sesja” z paska cache w RelAI z aktywnym fokusem → tytuł „E<N> · PLAN — nazwa”
  w trzech przebiegach (bramka w `STATUS.md`). *(rozstrzygnięte 2026-10-27 w E5 — trzy przebiegi
  `/handoff` z fokusem na 3.5.0, `STATUS.md` planu ZGLOSZENIA)*

Przegląd ryzyk: ryzyko 1 planu (aplikacja ignoruje albo nadpisuje `sessionTitle`) nie zaszło —
sonda pozytywna w trzech miejscach. Ryzyko 2 planu (fałszywe „tak” — tytuł sesji, której pierwszy
prompt nie był kontynuacją) nie zaszło: testy drugiego promptu, „tak” z treścią i sesji
z wcześniejszymi promptami, trzy mutacje zabite. Poza tabelą planu zaszło coś innego: tytuł ze
STATE zamiast z fokusu (przebiegi 1–2), naprawione warunkiem pierwszego promptu z transkryptu;
wyścig zapisu fokusu zostaje w bramce.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — ZGLOSZENIA E5: wydanie 3.5.0 i zamknięcie zgłoszeń #1–#3

**Zrobione:**

- Wydanie przez `/relai-release`: RelAI **3.5.0** z czterema modami — `relai-panel` 0.22.0,
  `relai-progress` 0.7.0, `relai-cache-keeper` 0.13.0, `relai-mods` 0.2.0. Wszystkie pięć numerów
  z propozycji raportu (minor, bo commit `feat` E4 dotknął każdego kopią `session-title.mjs`);
  decyzja Łukasza „wszystkie 5 wg raportu”.
- Podbicie: manifesty i oba marketplace'y (skrypt), README (baner i wiersze modów),
  `relai-update.md` (pięć deklaracji), `new-project.md`, README Cursora, `KOMENDY.md`, markery
  `USTAWIENIA.md` (projekt i fikstura ewaluacji), `STATE.md`; wpis 3.5.0 w `history.md` zamiast
  akapitu „Niewydane”; generator Codeksa, fakty i strony; dwa wiersze `ARTEFAKTY.md`
  (`relai-update.md` v24, `new-project.md` v12); zdanie w `relai-release.md` przepisane na zapis
  przeszłości („w 3.4.0”).
- Aneks A planu: kontrola `stary-numer` pomija w dwóch stronach odtwarzacza adres zasobu wydania
  z wersji filmu (manifest filmu — to samo źródło co `strona-film`). Test w
  `release-check.test.js`, RED przed poprawką, z kontrolą pozytywną.
- Publikacja, każdy krok po osobnym „tak”: commit `5842186`, pięć tagów adnotowanych, push
  tagów przez `pre-push`, pięć wydań GitHub (`v3.5.0` Latest, mody z `--latest=false`, bez MP4 —
  film bez zmian), push `main`, `marketplace update`, `plugin update` pięciu pluginów.
- Bramki manualne E2 i E4 zmierzone w aplikacji po restarcie (projekt testowy w `%TEMP%`).
- Zgłoszenia #1, #2, #3: komentarz w pierwszej osobie z odnośnikiem do wydania, zamknięte jako
  `completed`.

**Zweryfikowane — jak dokładnie:**

- Raport przed tagiem: `node core/tools/release-check.js --json --wydanie` → kod 0, 25 kontroli,
  0 czerwonych; rdzeń 564/564, strona 396/396, `plugin test` czterech modów zielony, `stary-numer`
  0 plików z 3.4.0, `artefakty` 0 bez wpisu. Wcześniej w tym etapie: 1 czerwień `plugin-test`
  (panel 209/211) i po podbiciu 2 czerwienie (`artefakty`, `stary-numer`).
- Bramka `pre-push`: `v3.5.0` gotowy (99,8 s), mody 5,6–15,7 s, każdy push kod 0; tagi na
  `origin` (`git ls-remote`). `gh release view` dla pięciu tagów — `draft=false`.
- `release-verify.js --sesja`: ZGODNE dla pięciu pluginów, 0 rozjazdów (relai 1538/1538,
  panel 63, progress 35, cache-keeper 48, mods 33 pliki); sesja ładuje katalog nowej wersji.
- `strona.yml` po pushu `main` — success; strona na żywo pokazuje 3.5.0; film `v3.4.0` → 200.
- `claude plugin validate` binarką aplikacji: rdzeń „passed with warnings” (znane: `CLAUDE.md`
  w korzeniu, brak ikony), cztery mody „passed”.
- Bramka E2: transkrypty `6aeab3d7` i `79892253` (ścieżka cache `relai/3.5.0`) — pytanie
  (AskUserQuestion), `rm` samego `.md`, `.patch` zostało; w drugiej sesji 0 rekordów ze zdaniem
  hooka o pliku.
- Bramka E4: pierwsza seria trzech przebiegów bez tytułu — w projekcie nie było pliku fokusu,
  bo mój prompt „wykonaj etap PROBA E2” go nie ustawia. Kontrola pozytywna hooka z cache 3.5.0
  z podłożonym fokusem → `"sessionTitle":"E2 · PROBA — Odejmowanie z łatki"`, bez fokusu cisza.
  Druga seria z promptem ze ścieżką `PROMPT_ETAP_2.md`: trzy przebiegi `/handoff` → „Wyczyść
  i kontynuuj”, tytuł „E2 · PROBA — Odejmowanie z łatki”, fokus przed hookiem o 145, 139 i 209 ms.
- Zgłoszenia: `gh issue view` → #1, #2, #3 `CLOSED COMPLETED`, po jednym komentarzu.
- Skan Trivy przy zamknięciu planu (`scan-20261027-110956.json`, HIGH/CRITICAL): 0 trafień
  w plikach blokady projektu; 47 HIGH to fikstury ewaluacji `trivy-scan` (celowo podatne),
  nieśledzone kopie paczki w `.claude/relai/work/PANEL_CODEX/GIT_IZOLACJA/` i stary worktree
  `.claude/worktrees/charming-rosalind-7cfc42`.
- Katalogi robocze: przed — `.claude/relai/work/ZGLOSZENIA/` 25 plików (281 KB),
  `.claude/relai/work/WYDANIE/3.5.0/` 6 plików (16 KB); poza repo `%TEMP%/relai-zgl-e5-proj`
  161 plików. Skasowane po zgodzie Łukasza; po — żadnego z nich nie ma. Siedem sesji testowych
  projektu zarchiwizowanych. Zostają transkrypty w
  `~/.claude/projects/C--Users-Lukasz-AppData-Local-Temp-relai-zgl-e5-proj/`.

**Świadomie odłożone:**

- `plugin test` modu `relai-panel` chwieje się pod obciążeniem: osobno 214/214 dwa razy, trzy
  przebiegi naraz — 14–17 porażek z przekroczeniem ~5 s i pliki „did not load”; raport po
  testach rdzenia raz dał 2 porażki na 211. Raport zachowuje tylko trzy ostatnie linie wyjścia,
  więc nazw porażek z tamtego przebiegu nie ma (decyzja Łukasza: do dziennika, nie aneks).
- Przycisk „Nowa sesja” pokazuje się tylko przy opłacalnym przekazaniu (20 tur) albo stygnącym
  cache; w świeżej sesji go nie ma i bramka szła przez `/handoff` — tę samą funkcję.
- Rotacja dziennika, ryzyk i lekcji (wszystkie ponad progiem) — przy „kończymy na dziś”.

**Do zrobienia przez człowieka:** —

Przegląd ryzyk: tabela bez zmian — plan nie miał w niej wierszy; ryzyka planu 1–5 nie zaszły
po wydaniu (bramki w aplikacji pozytywne).

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Plan ZGLOSZENIA zamknięty: dowiezione vs plan

**Zrobione — dowiezione vs plan:**

| Miało powstać (plan, sekcja 5) | Powstało | Różnica |
|---|---|---|
| E1: ikona `/relai-security` na stronie | ikona i test odwołań zatrzymujący wdrożenie | test ponad plan |
| E2 (#3): pytanie o plik wznowienia w zamknięciu | krok 3a w trzech adapterach, bramka w aplikacji | — |
| E3 (#2): pasek cache w terminalu w kolumnach | siatka do 3 kolumn bez linii `b` | liczba kolumn idzie za układem karty (L-0282) |
| E4 (#1): tytuł nowej sesji z fokusu | hook `session-title`, tytuł `start_session` w panelu | „pierwszy prompt” z transkryptu (P-055) |
| E5: wydanie i zamknięcie zgłoszeń | 3.5.0 + cztery mody, #1–#3 zamknięte | Aneks A — poprawka instrumentu |

Przepadło: nic. Plan miał wydać `relai` i `relai-cache-keeper`; wyszły też trzy pozostałe mody,
bo E4 dał im kopię rdzenia (decyzja Łukasza w E5).

**Zweryfikowane — jak dokładnie:** bramki manualne obie `ROZSTRZYGNIĘTA 2026-10-27` w `STATUS.md`
i z adnotacją we wpisach E2 i E4; odnóg plan nie miał; folder przeniesiony `git mv` do
`docs/archiwum/plany/ZGLOSZENIA/` (`ls docs/plany/` → `PANEL_CODEX/`).

**Świadomie odłożone:** —

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Karta „Etap planu” w trybie auto: deep link po odmowie klasyfikatora — MINIPLAN

Zgłoszenie Łukasza (zrzut z projektu TargiKielce, `relai-panel` 0.22.0): „Przygotuj start” → „Tak”
→ „Nie wysłano … `$.mcp.call(ccd_session, start_session) refused: The server-side auto mode
classifier gave no verdict …`”. Sesja w trybie `auto` (transkrypt: `"permissionMode":"auto"`);
aplikacja oddaje już `start_session`, więc karta woła je zamiast deep linku
(`panel/hooks/register.tsx:616`), a klasyfikator nie znajduje w rozmowie prośby o wywołanie
z kliknięcia. Po odmowie panel zużywa zgodę i nie ma drogi zapasowej. Zgoda Łukasza: „Miniplan
teraz”.

- **Cel:** w sesji w trybie auto karta „Etap planu” z czatem „nowa sesja” otwiera nową sesję
  deep linkiem, gdy silnik odmówi `start_session` z powodu klasyfikatora; odmowa człowieka na
  karcie aplikacji (`isError`, „The user declined.”) i każda inna odmowa zostają jak dziś.
- **Kroki:**
  1. Test w `panel/hooks/decisions.test.ts`: wyjątek z powodem klasyfikatora → jeden proces
     z linkiem `claude://`, zgoda nieużyta, „Otwarto”; wyjątek z innym powodem → bez linku,
     zgoda zużyta. Czerwony przed poprawką.
  2. `panel/hooks/launch.ts`: rozpoznanie powodu odmowy (zamknięta lista brzmień, kotwica
     „auto mode classifier”); `register.tsx`: `launch` po takim wyjątku idzie drogą linku.
  3. `claude plugin test panel`, testy `core/panel`, wpis w `PULAPKI.md`, wydanie `relai-panel`
     0.22.1 przez `/relai-release` (kroki zewnętrzne po „tak”), wpis wynikowy.
- **Weryfikacja:** nowy test czerwony na HEAD i zielony po poprawce w jednym przebiegu;
  `plugin test panel` i N1 (odmowa człowieka) zielone; raport `--wydanie` bez czerwieni.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Plan ZASIEG_PLUGINU: RelAI tylko w zaadoptowanych projektach (DO AKCEPTACJI)

Zadanie przyszło z sesji PolyFlow-rust po przeglądzie `/doctor`: `relai` to 16% zużycia, a plugin
i trzy dodatki ładują się w każdym folderze. Rozpoznanie: hooki już milkną poza projektem; listę
skilli, komend i agentów chowa wyłącznie wyłączenie pluginu. Zmierzone w folderze tymczasowym:
lokalne `false` wygrywa z globalnym `true`, a `claude plugin enable … --scope local` zapisuje
`true` do `.claude/settings.local.json`. Skan historii sesji: 13 projektów z markerem (brief
mówił o 9). Wywiad (dwie rundy): zapis lokalny + `.worktreeinclude`; bramką objęte relai,
relai-panel, relai-progress, relai-cache-keeper, a `relai-mods` zostaje globalnie z przyciskiem
„RelAI w tym projekcie”; narzędzie `relai-scope` z dry-run / apply / undo; tryb do wyboru dla
innych użytkowników; tylko Claude Code; pełny PLAN. Plan w HTML, 4 etapy, 4–6 sesji (SZACUNEK).
Ustawień maszyny ani innych projektów nie zmieniałem.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Plan ZASIEG_PLUGINU zaakceptowany

Łukasz zaakceptował plan bez poprawek („Akceptuję plan ZASIEG_PLUGINU.”). Status planu
ZAAKCEPTOWANY 2026-10-27, E1 „Narzędzie relai-scope” gotowy do startu, wygenerowany
`PROMPT_ETAP_1.md` (Opus 5.5, `/effort high`). Doprecyzowanie przy generacji promptu: cofnięcie
lokalnego wpisu, którego przed `apply` nie było, usuwa klucz wąskim zapisem JSON — `disable`
zostawiłby lokalne `false`, które po przywróceniu globalnego `true` wyłączyłoby RelAI w projekcie.
Start etapu: świeża sesja i `/relai-stage`.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Tabela „Stan prac” w limicie: plan bez własnego wiersza — MINIPLAN

Zlecenie z sesji nadrzędnej po przeglądzie `/doctor` (tabela tego repo urosła do ~20 wierszy
i 15 KB, przycięta ręcznie). Zgoda Łukasza na miniplan, kontrolę w hooku startu i regułę „plan nie
ma wiersza w tabeli” (D-30).

- **Cel:** zamknięcie etapu ani planu nie dopisuje wierszy do tabeli „Stan prac” w `CLAUDE.md`,
  a tabela ponad pięcioma wierszami jest zgłaszana przy starcie sesji.
- **Kroki:**
  1. `SPEC_CLAUDE_MD.md` i `SPEC_PROMPT_ETAPU.md` — reguła: plan żyje wyłącznie w linii „Aktywny
     plan”, krok 4 rytuału „Na koniec” nie dotyka tabeli.
  2. Skille `relai-planning` w Claude Code i Codeksie (`stage-closing.md`, `plan-closing.md`)
     i reguła Cursora — to samo zdanie.
  3. `core/process/session-signals.js` — sygnał startu, gdy tabela „Stan prac” ma ponad 5 wierszy;
     test czerwony najpierw.
  4. Testy `core/process`, wpis wynikowy.
- **Weryfikacja:** nowy test sygnału czerwony przed zmianą kodu i zielony po niej (tabela 6 wierszy
  → sygnał, 5 → cisza, brak tabeli → cisza); `node --test core/process/tests/*.test.js` zielone;
  `grep` po regule w siedmiu plikach.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Tabela „Stan prac” w limicie: wynik miniplanu

Miniplan wykonany w całości, bez rozszerzania zakresu.

**Zrobione:**

- Reguła „plan nie ma wiersza w tabeli Stan prac” (zgodna z D-30, bez aneksu): `SPEC_CLAUDE_MD.md`
  (punkt 3 układu, polityka aktualizacji, „Dawniej”), `SPEC_PROMPT_ETAPU.md` (krok 4 sekcji 9),
  `stage-closing.md` i `plan-closing.md` skilla `relai-planning` w Claude Code i Codeksie (kopie
  identyczne), reguła Cursora `relai-planning.mdc`; katalog progów w `SPEC_USTAWIENIA.md`.
  Przyczyna: krok 4 rytuału „Na koniec” („dokumenty, których dotknął etap”) prompty etapów
  rozwijały w „`CLAUDE.md` — wiersz planu”, a krok 8 zamknięcia planu mówił tylko o linii
  „Aktywny plan”.
- `core/process/session-signals.js`: `wierszeStanuPrac()` i pozycja w `dokumentyPonadProgiem()`
  — tabela ponad 5 wierszami trafia do linii `[RelAI progi dokumentow]` z procedurą „przeniesienie
  wierszy planow zamknietych do STATE.md”. Jeden kod dla trzech adapterów, bo raport startu wołają
  hooki Claude Code, Codeksa i Cursora. Bramka: włączona rotacja dokumentów, jak reszta raportu.
- `docs/ARTEFAKTY.md`: sześć wierszy podbitych (SPEC_CLAUDE_MD 8, SPEC_PROMPT_ETAPU 11,
  SPEC_USTAWIENIA 16, plan-closing 4, stage-closing 2, reguła Cursora 4).

**Zweryfikowane — jak dokładnie:**

- `core/process/tests/work-table.test.js` (5 testów): przed zmianą kodu 3 czerwone, 2 zielone
  (przypadki ciszy); po zmianie 5/5. Granica 5 → cisza, 6 → sygnał; CRLF i nagłówek EN
  „Work status”; brak pliku, sekcji albo rotacja wyłączona → cisza; raport w ASCII z „8 wierszy
  (prog 5 wierszy)”.
- Kontrola na żywych plikach `FAKT`: `CLAUDE.md` tego worktree (tabela sprzed przycięcia)
  → 22 wiersze, zgłoszone; główny checkout po ręcznym przycięciu (4 wiersze) → cisza.
- `node --test core/process/tests/*.test.js` 301/301, `core/panel` + `core/tools` 225/225,
  `core/guardrails` 19/19; `release-check.js --szybko` bez czerwieni; `validate-adapters.js` zielony.

**Świadomie odłożone:** wydanie — osobno przez `/relai-release` (propozycja raportu: 3.5.1, patch).
Przycięcie tabeli w `CLAUDE.md` tego repo zrobione ręcznie w głównym checkoucie, poza tą gałęzią.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — Scalenie przed ZASIEG_PLUGINU E1: poprawka tabeli „Stan prac” + panel 0.22.1

Prośba Łukasza: wyrównać prace dwóch sesji, żeby E1 ZASIEG_PLUGINU ruszył w jednej świeżej sesji.

**Zrobione:**

- Niezacommitowana praca głównego checkoutu (za zgodą Łukasza) w dwóch commitach na `main`:
  przycięcie tabeli w `CLAUDE.md` z wpisami dziennika i P-057, oraz poprawka `relai-panel` 0.22.1.
- `main` scalony do gałęzi poprawki tabeli; konflikty tylko w `DZIENNIK.md` i `STATE.md`,
  addytywne — wpisy z `main` przed wpisami gałęzi, w STATE zdanie „aktywnego planu nie ma”
  usunięte (aktywny jest ZASIEG_PLUGINU), dopisany niewydany panel 0.22.1.

**Zweryfikowane — jak dokładnie:**

- `claude plugin test panel` (binarka z PATH): 169 zaliczonych, 0 porażek asercji, 5 plików
  testów nie załadowało się (exit 9: `map`, `pricing`, `promises`, `redraw`, `register`);
  `decisions.test.ts` z testem P-057 zielony. Binarka aplikacji (`$CLAUDE_CODE_EXECPATH`)
  przerwała się na `MemoryExhaustion` — ograniczenie maszyny, nie kodu.

**Świadomie odłożone:** wydanie (`relai` 3.5.1 i `relai-panel` 0.22.1) osobno przez `/relai-release`.

**Do zrobienia przez człowieka:** ponowić `claude plugin test panel` po zwolnieniu pamięci
(pięć plików bez raportu, w tym `register.test.ts` dotknięty poprawką 0.22.1).
*(rozstrzygnięte 2026-10-28 — `claude plugin test panel` 216/216 przy wydaniu 0.22.1, wpis E4)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — PANEL_CODEX wstrzymany, aktywny plan ZASIEG_PLUGINU we wszystkich dokumentach

Decyzja Łukasza: aktywnym planem jest ZASIEG_PLUGINU, PANEL_CODEX ma być jawnie nieaktywny.

**Zrobione:**

- `docs/plany/PANEL_CODEX/STATUS.md`: status planu `WSTRZYMANY 2026-10-27` (SPEC_STATUS: praca
  przerwana, plan obowiązuje) i linia w dzienniku wdrożenia; tabela etapów bez zmian.
- `CLAUDE.md`: wiersz PANEL_CODEX usunięty z tabeli „Stan prac” (reguła „plan bez wiersza”,
  zostają 3 wiersze), linia „Aktywny plan” — ZASIEG_PLUGINU, PANEL_CODEX jako wstrzymany.
- `AGENTS.md` (instrukcje Codeksa): linia „Aktywny plan” wskazywała PANEL_CODEX — teraz
  ZASIEG_PLUGINU z zakazem podejmowania etapów PANEL_CODEX bez nowej decyzji; wiersz planu z tabeli
  usunięty.
- `docs/STATE.md`: „Gdzie jesteśmy”, „Nad czym pracujemy” (PANEL_CODEX jako wstrzymany, ze stanem
  zatrzymania E1), „Co dalej”, opis adaptera Codex i liczby.

**Zweryfikowane — jak dokładnie:** `grep PANEL_CODEX` w `CLAUDE.md`, `AGENTS.md`, `docs/STATE.md`
— żadne miejsce nie nazywa go aktywnym; `stateDrift` na repo bez faktów; testy `core/process`.

**Świadomie odłożone:** `AGENTS.md` poza linią aktywnego planu jest nieaktualny wobec `CLAUDE.md`
(tabela 12 wierszy, panel 0.15.0) — pełna synchronizacja osobno. Worktree Codeksa
`codex/panel-codex` nietknięty.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — `AGENTS.md` zsynchronizowany z `CLAUDE.md`, kopia ze strażnikiem

Odłożone we wpisie o wstrzymaniu PANEL_CODEX; zgoda Łukasza na formę „kopia ze strażnikiem”.

**Zrobione:**

- `AGENTS.md` (instrukcje Codeksa w tym repo) był równoległą kopią `CLAUDE.md` bez deklaracji
  kopii, więc `kopiaAgents()` w hooku startu milczał, a plik rozjechał się po cichu: tabela „Stan
  prac” z 12 wierszami historii, wydanie 3.0.0 i panel 0.15.0, otwarta odnoga AUDYT_MODOW,
  „plany: Fable” (D-84 zmieniona 2026-10-14), brak frazy „gotowi do wydania?”, podpowiedzi
  wydania i reguły backticka. Żadna różnica nie była właściwa dla Codeksa.
- Treść 1:1 z `CLAUDE.md` plus linia pod tytułem „Kopia `CLAUDE.md` dla Codeksa,
  zsynchronizowana 2026-10-27” — nagłówek, po którym hook startu rozpoznaje kopię i porównuje
  sekcje od pierwszego `##`. D-86 dotyczy projektów użytkowników, nie tego repo.

**Zweryfikowane — jak dokładnie:** `kopiaAgents('.')` → `[]` na zgodnej kopii; kontrola pozytywna
z dopisaną linią na końcu → fakt o sekcji „Implementation guidelines”, po przywróceniu znowu `[]`;
testy `core/process` zielone.

**Świadomie odłożone:** —

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — ZASIEG_PLUGINU E1: narzędzie `relai-scope` przełącza maszynę i umie to cofnąć

Etap E1 planu [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md), wg `PROMPT_ETAP_1.md`, w tej samej
sesji co start (karta startu → zgoda Łukasza). Tryb ciągły optymalizatora w tej sesji: odmowa
(zapisana w pliku zgody sesji).

**Zrobione:**

- `core/process/plugin-scope.js` — czysta logika: odkrywanie folderów (`cwd` z pierwszych 64 KB
  plików `~/.claude/projects/*/*.jsonl` + argumenty, deduplikacja bez wielkości liter na Windows,
  folder domowy i nieistniejące osobno), klasyfikacja (`zaadoptowany` / `gosc` / `inny` przez
  `relaiMarkerFile` i `isGuest`, git, worktree), plan zmian (lokalne `enable` i `.worktreeinclude`
  przed globalnym `disable`), dziennik `~/.claude/relai/zasieg-pluginu.json` po każdym kroku,
  plan cofnięcia (poprzednio brak klucza → usunięcie klucza wąskim zapisem JSON). CLI wstrzykiwane
  funkcją.
- `core/tools/relai-scope.js` — `status` (domyślne) / `apply` / `undo` / `on [folder]` /
  `off [folder]`, opcje `--home` i `--cli` (plik `.js` uruchamiany bieżącym Node), kod 0 / 1,
  spawn bez powłoki.
- `core/process/tests/plugin-scope.test.js` — 17 testów na fałszywym HOME i fałszywym CLI
  (skrypt Node piszący do pliku zakresu jak prawdziwe `claude plugin`, z awarią po N wywołaniach).
- `core/MANIFEST.json` — moduł `plugin-scope` i narzędzie `relai-scope`; `docs/PULAPKI.md` — P-058.
- Dwie rzeczy ponad literę promptu, w granicach narzędzia: (1) worktree (`.git` jako plik)
  dostaje lokalne `enable`, ale nie `.worktreeinclude` — ta linia działa tylko w repo głównym;
  (2) raport `status` skraca listę „brak folderu” do liczby i 5 przykładów (na tej maszynie 241).
- Po recenzji (subagent `code-reviewer`, APPROVE, 0 CRITICAL/HIGH): `apply` odmawia przy
  nieczytelnym dzienniku zamiast go nadpisać (zgubiłby `undo`); `on`/`off` łapie błąd zapisu
  `.worktreeinclude`; komunikat braku CLI podpowiada `--cli` (instalacja npm daje `claude.cmd`,
  którego spawn bez powłoki nie uruchomi).

**Zweryfikowane — jak dokładnie:**

- `node --test core/process/tests/plugin-scope.test.js` — 17/17. Mutacja „globalne `disable` przed
  lokalnymi” (kopia modułu i testu w katalogu roboczym): test przerwanego `apply` czerwony
  („globalnie relai@relai nadal true”), oryginał zielony. Druga mutacja (bez odmowy przy
  nieczytelnym dzienniku): test dziennika czerwony, oryginał zielony.
- `node --test core/process/tests/*.test.js` — przed etapem 301/301, po 318/318 (FAKT). Katalog
  jako argument kończy się porażką „test failed” bez testów — wzorzec plików (L-0212).
- `node core/tools/validate-adapters.js` — kod 0; wywołania sieciowe „0 poza listą”. Kontrola
  pozytywna: oba nowe pliki są w zbiorze skanu, a dopisane `require('https')` trafia.
- `node core/tools/relai-scope.js status` na tej maszynie (FAKT 2026-10-27): zestaw zainstalowany
  w całości, globalnie wszystkie cztery `true`; **15 projektów z markerem** (13 projektów + 2
  worktree aplikacji w `RelAI\.claude\worktrees\`; PolyFlow-rust to worktree PolyFlow),
  wszystkie bez wpisów lokalnych; 2 bez gita (KartonOps, TargiKielce); 25 innych folderów;
  241 folderów z historii już nie istnieje; folder domowy pominięty; 10 plików `.worktreeinclude`
  do utworzenia; **74 kroki** planu. Suma `~/.claude/settings.json` (`0ea9ff58…`)
  i `installed_plugins.json` (`e8d2d282…`) ta sama przed i po; dziennik zmian nie powstał.
- Dowód negatywny: `git diff --stat -- panel site README.md .claude-plugin package.json` pusty;
  `settings.json` z tą samą sumą na końcu etapu.
- Bezpieczeństwo: brak `package.json` w zmianie; argumenty przez `path.resolve`, `on`/`off`
  odrzucają folder nieistniejący i domowy przed zapisem; `spawnSync` bez `shell`; `git grep -n
  "sk-\|api[_-]key"` po `git add -N` pusty, a kontrola pozytywna (`spawnSync`) trafia.
- Katalog roboczy `.claude/relai/work/ZASIEG_PLUGINU/E1/`: przed 11 plików / 156 KB, po 0
  (skasowany po „tak”). Poza katalogiem: fałszywe HOME testów `%TEMP%/relai-zasieg-e1-*` —
  sprzątane przez każdy test, po etapie 0.
- Tabela „Stan otwartych ryzyk” przejrzana — bez zmian; ryzyka R1–R6 planu żyją w `PLAN.html`,
  R4 (przerwane `apply`) ma test i mutację.

**Świadomie odłożone:**

- Lista „brak folderu” (241) pokazuje, że historia sesji niesie setki skasowanych folderów
  tymczasowych — narzędzie je pomija; sprzątanie `~/.claude/projects/` nie należy do planu.
- Instalacja `claude` z npm (`claude.cmd`) wymaga `--cli` z pełną ścieżką — opis do README w E4.
- Złamałem L-0258 przy pisaniu modułu: znak BOM w wyrażeniu regularnym wszedł przez Write jako
  surowy bajt; wyłapany `grep` po bajtach i zamieniony na `String.fromCharCode(0xfeff)` przed
  testami. Lekcja istnieje, nowej nie dopisuję.

**Do zrobienia przez człowieka:**

- Kiedy przełączyć maszynę: zaraz po E1 narzędziem z repo (`node core/tools/relai-scope.js apply`
  z tego folderu; oszczędność od razu, ale nowy folder tylko poleceniem `on`) czy po wydaniu
  (PLAN sekcja 9). *(rozstrzygnięte 2026-10-28 — po wydaniu: `apply → undo → apply` z 3.6.0, wpis E4)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — ZASIEG_PLUGINU E2: adopcja, init i update włączają RelAI w projekcie; poprawka narzędzia (Aneks A)

Etap E2 planu [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md), wg `PROMPT_ETAP_2.md`, w sesji
startu (karta startu → zgoda Łukasza). Tryb ciągły optymalizatora w tej sesji: odmowa (plik zgody
sesji).

**Zrobione:**

- `adapters/claude-code/commands/relai-adopt.md` — Krok 3: pozycja 7 „Włączenie RelAI w tym
  projekcie (tylko Claude Code)”; Krok 7: cztery punkty przed commitem — `installPath` z `claude
  plugin list --json`, `test -e` narzędzia (kod 1 → zdanie z poleceniem ręcznym), lokalne `false`
  → bez wywołania (R6), jedno `on` z opisem kodów 0/1 i zakazem obejść (L-0271); `.worktreeinclude`
  poza commitem bez osobnej zgody.
- `adapters/claude-code/skills/relai-core/new-project.md` — sekcja 1: zgoda wymienia włączenie
  w Claude Code; 1a: po „Nigdy poza projektami RelAI” zdanie o trybie z `relai-scope status`, bez
  `apply`; 3: ten sam krok `on` po commicie inicjalizacji; 4: zdanie o wyniku.
- `adapters/claude-code/commands/relai-update.md` — Krok 2: wiersz „włączenie lokalne” (tylko przy
  RelAI wyłączonym globalnie; lokalne `false` zostaje); Krok 4: wykonanie z tą samą gałęzią braku
  narzędzia.
- Codex: `generate-skills.js` — `relai-adopt`, `relai-update` i `relai-core/new-project.md`
  zregenerowane; tekst kroku mówi „w Codeksie i Cursorze pomijasz”. Cursor bez zmian.
- **Aneks A planu (decyzja Łukasza w trakcie etapu):** pomiar z punktu 5 zakresu pokazał, że
  prawdziwe `claude plugin enable --scope local` (2.1.304) przy globalnym `true` i braku klucza
  lokalnego odmawia kodem 1 „already enabled at local scope”. `on` i pierwszy krok `apply` nie
  działały na tej maszynie. Poprawka w `core/process/plugin-scope.js` (`krokPluginu`): odmowa
  „already …” i brak żądanej wartości w pliku → akcja przeciwna, potem żądana; odmowa przy pliku
  już w stanie żądanym = sukces; pad drugiej akcji mówi, jaki klucz został. Fałszywe CLI w testach
  odmawia teraz jak prawdziwe; dwa nowe testy. P-058 punkt 5, ręczne polecenie w adopcji i init
  z obejściem `disable` → `enable`.
- Recenzja (subagent `code-reviewer`): 0 CRITICAL/HIGH, dwa MEDIUM w nowej gałęzi — oba
  poprawione z testem (pad drugiej akcji); trzeci przypadek (odmowa przy pliku w stanie żądanym)
  bez osobnego testu — `planJednego` go odfiltrowuje.

**Zweryfikowane — jak dokładnie:**

- `grep -n "relai-scope"` w trzech plikach: trafienia w Kroku 3 i 7 adopcji, Kroku 2 i 4
  aktualizacji, sekcjach 1a i 3 `new-project.md`; ten sam `grep -c` na HEAD w `git worktree`:
  0 / 0 / 0.
- `node core/tools/validate-adapters.js` — kod 0, „parytet skilli Claude Code -> Codex: 73 plikow,
  0 rozjazdow”.
- `node --test core/process/tests/*.test.js adapters/codex/tests/*.test.js` — przed etapem
  340/342, po 342/344 (FAKT). Dwie porażki te same przed i po: parytet Codeksa przy
  `core.autocrlf=true` (znane, STATE „Co dalej”). Generator przepisuje przy tym
  `relai-planning/plan-closing.md` i `stage-closing.md` samymi końcami linii — przywrócone,
  poza commitem.
- Testy narzędzia: z nową atrapą na starym `krokPluginu` 12/18 (sześć czerwonych, w tym nowy test
  pary), po poprawce 19/19.
- Pomiar polecenia z procedury na prawdziwym `claude` (2.1.304), folder z markerem i `git init`:
  `node "C:/Users/Lukasz/Desktop/RelAI/core/tools/relai-scope.js" on "C:/Users/Lukasz/AppData/Local/Temp/relai-zasieg-e2-2"`
  → `on: … — 5 krokow.`, kod 0; cztery klucze `true` w `.claude/settings.local.json`, linia
  `.claude/settings.local.json` w `.worktreeinclude`; drugie `on` → „bez zmian.”. Suma
  `~/.claude/settings.json` (`0ea9ff58b6c4…`) i `installed_plugins.json` (`e8d2d2826f7b…`) ta sama
  przed i po. Pierwszy przebieg (przed poprawką, `relai-zasieg-e2-1`): kod 1, zero zapisów.
- Gałąź „narzędzia nie ma”: `installPath` z `claude plugin list --json` =
  `C:\Users\Lukasz\.claude\plugins\cache\relai\relai\3.5.0`; `test -e …/core/tools/relai-scope.js`
  → 1; tekst kroku ma na to punkt 2.
- Dowód negatywny (zakres wg Aneksu A): `git diff --stat -- adapters/cursor panel site README.md
  .claude-plugin core/tools core/process` pokazuje tylko `core/process/plugin-scope.js` i jego test;
  `~/.claude/settings.json` z tą samą sumą na końcu etapu.
- `node core/tools/eval-triggers.js --model sonnet --ids core-p1,core-p2,core-p3,core-p4,core-n1,core-n2,core-n3`
  — przed 7/7 ok, po 7/7 ok (`core-p4` czyta `new-project.md` w obu).
- Katalog roboczy `.claude/relai/work/ZASIEG_PLUGINU/E2/`: przed 14 plików / 141 KB, po 0
  (skasowany po „tak”). Poza nim: `%TEMP%/relai-zasieg-e2-1` (63 KB) i `relai-zasieg-e2-2`
  (68 KB) — skasowane po tym samym „tak”.
- Tabela „Stan otwartych ryzyk” przejrzana — bez zmian; R3 planu („CLI zapisze co innego”) się
  zmaterializował w innej postaci (odmowa zamiast zapisu) i jest zamknięty poprawką z testem.

**Świadomie odłożone:**

- Lista „Do wykonania recznie” w wyniku narzędzia podaje samo `enable` — przy globalnym `true`
  człowiek trafi na tę samą odmowę; procedury mają obejście w tekście, narzędzie nie. Do E4
  (README) albo osobnej poprawki.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-27 — ZASIEG_PLUGINU E3: wiersz „RelAI w tym projekcie” w kokpicie relai-mods

Etap E3 planu [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md), wg `PROMPT_ETAP_3.md`, w sesji
startu (karta startu → zgoda Łukasza). Tryb ciągły optymalizatora w tej sesji: odmowa (plik zgody
sesji).

**Zrobione:**

- `mods/hooks/cockpit.ts` (czysta logika): `RELAI_SET` (cztery pluginy, tylko instalacje `user`,
  nigdy `relai-mods`), `scopeRowOf` (brak wiersza w folderze domowym i bez żadnego pluginu zestawu;
  wartość lokalna i efektywna = lokalna, bez niej user), `scopePlan` (`enable|disable --scope local`
  z `cwd` = folder sesji, pominięte pluginy z żądaną wartością lokalną, linia worktree tylko przy
  włączaniu w repo głównym), `outcomeOf` + `oppositeArgv` (odmowa „already …” → para, jak
  `krokPluginu`), `withWorktreeLine` (końce linii zachowane), `scopeStateWord`
  (✓ / ● z globalnych / ◐ x/y / ○), `scopeFacts` (karta), `pendingCount` z wierszem — plugin
  liczony raz.
- `mods/hooks/register.tsx`: `readScope` (pliki, `$.fs.stat` na `.git`), `runScope`
  i `runScopeCall` — wykonanie przez istniejącą kolejkę (klucz `scope-row`), po każdym pluginie
  odczyt pliku jako dowód; linia `.claude/settings.local.json` w `.worktreeinclude` przez
  `$.fs.write` (API ma zapis — punkt 3 zakresu bez odchylenia); migawka „załadowane” obejmuje
  wartości efektywne zestawu, więc wyłączenie daje ten sam pasek przeładowania co przełącznik.
- `mods/hooks/views.tsx`: wiersz nad listą (stan słowem i znakiem, przycisk Włącz/Wyłącz otwiera
  tylko kartę), karta z ramką `Plik / Pluginy / Worktree / Potem`, pytanie, „Tak” / „Nie”, błąd CLI
  pod wierszem.
- `mods/types/index.d.ts`: wartość `ask` (karta czekająca na „Tak”) — poza listą plików promptu,
  ale walidator trzyma każdy klucz `$.state` w tym kontrakcie; bez niej karty nie ma.
- Testy: 10 w `cockpit.test.ts`, 9 w `mods.test.tsx`; atrapa CLI `--scope local` odmawia jak
  prawdziwe 2.1.304 (L-0288), atrapa `fs.stat` / `fs.write`.
- Recenzja (subagent `typescript-reviewer`): HIGH — `.worktreeinclude`, którego nie da się
  odczytać, byłby nadpisany jedną linią (`readText` zamienia błąd odczytu na „brak pliku”).
  Poprawione: odczyt poza `readText`, błąd przerywa zapis i trafia pod wiersz; test z plikiem
  nieczytelnym. MEDIUM (nieczytelny `settings.local.json` raportowany jako „brak wpisu”) —
  świadomie odłożone niżej.

**Zweryfikowane — jak dokładnie:**

- `"$CLAUDE_CODE_EXECPATH" plugin validate mods` → „Validation passed” (ostrzeżenie o ikonie jak
  dotąd); `plugin test mods` przed 68/68, po 87/87 (FAKT).
- Mutacje skryptem w katalogu roboczym (trzy kopie modu, wynik czytany po liniach `(fail)`):
  bez pary → czerwony „global true, no local key: Włącz, Tak”; bez warunku folderu domowego →
  czerwone oba testy folderu domowego; `relai-mods` w `RELAI_SET` → czerwone oba testy „nigdy
  w planie”; oryginał 87/87. Poprawka z recenzji obiema wersjami w jednym przebiegu: stary zapis
  przez `readText` — test pliku nieczytelnego `(fail)`, nowy — `(pass)`.
- Pomiar na żywo na desktopie (aplikacja 2.1.308, `claude` z PATH): kopia modu jako
  `relai-mods-e3` w `~/.claude/dev-mods/7be49f27-…/` (panel, komenda i stan przemianowane),
  sesja przeniesiona do `%TEMP%/relai-zasieg-e3-1` (marker, `git init`). Kliknięcia i cztery zrzuty
  od Łukasza (L-0289): przed — „● włączony z ustawień globalnych”; karta z plikiem, czterema
  pluginami i linią worktree; po Włącz → Tak — „✓ włączony w tym projekcie” (stan liczony z pliku:
  wszystkie cztery wpisy lokalne `true`; samego pliku między kliknięciami nie odczytałem); po
  Wyłącz → Tak — „○ wyłączony”, „4 zmiany czekają na przeładowanie”, wiersze `relai-*` z kłódką
  „nadpisane”. Odczyt po serii: `.claude/settings.local.json` — cztery klucze `false`;
  `.worktreeinclude` — `.claude/settings.local.json` z LF. Suma `~/.claude/settings.json`
  (`0ea9ff58b6c4…`) i `installed_plugins.json` (`e8d2d2826f7b…`) ta sama przed i po.
  Zainstalowanego `relai-mods` nie wyłączałem — desktop nie bierze `--settings`; kopia ma inny
  panel i komendę. Poprawka z recenzji powstała po pomiarze i dotyczy tylko pliku nieczytelnego —
  na żywo niemierzona.
- Dowód negatywny: `git diff --stat -- adapters core panel progress cache-keeper site README.md
  .claude-plugin` pusty; `mods/.claude-plugin/plugin.json` bez zmian.
- `node --test core/process/tests/*.test.js adapters/codex/tests/*.test.js` — 342/344, dwie
  porażki te same co w E2 (parytet Codeksa przy `core.autocrlf=true`), bez regresji.
- Katalog roboczy `.claude/relai/work/ZASIEG_PLUGINU/E3/`: przed 142 pliki / 3 549 KB (mutacje,
  kopie modu, zrzuty, skrypty), po 0 — skasowany po „tak” Łukasza. Poza nim, po tym samym „tak”:
  kopia `~/.claude/dev-mods/7be49f27-…/relai-mods-e3` (1,7 MB) — skasowana;
  `%TEMP%/relai-zasieg-e3-1` (76 KB) — treść skasowana, sam folder zostaje („Device or resource
  busy”): aplikacja trzyma go jako katalog tej sesji i założyła w nim na nowo pusty `.claude/`.
  Do skasowania po zamknięciu sesji.
- Tabela „Stan otwartych ryzyk” przejrzana — bez zmian.

**Świadomie odłożone:**

- MEDIUM z recenzji: nieczytelny `.claude/settings.local.json` po udanym CLI wiersz raportuje
  jako „brak wpisu”, a `scopeRowOf` czyta go jak plik bez kluczy. Błąd nie przechodzi po cichu
  (wiersz pokazuje niezgodność), mylące jest tylko słowo. Do E4 albo osobnej poprawki.
- Opis w `mods/.claude-plugin/plugin.json` nie mówi o wierszu ani o zapisie `.worktreeinclude`
  („Never writes settings.json…” zostaje prawdą) — do E4 razem z podbiciem 0.3.0.
- Folder testowy po pomiarze ma lokalne `false` dla zestawu — nie dotyczy żadnego projektu.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — ZASIEG_PLUGINU E4: tryb „RelAI tylko w projektach” opisany, wydany (3.6.0) i włączony na maszynie

Etap E4 planu [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md), wg `PROMPT_ETAP_4.md`, start
2026-10-27 w sesji startu (karta → zgoda Łukasza), dokończony 2026-10-28 w sesji przejętej po
przekazaniu (główna sesja zajęła się CI strony). Tryb ciągły optymalizatora: odmowa w obu sesjach.

**Zrobione:**

- `README.md`: podrozdział „RelAI tylko w projektach (Claude Code, od 3.6.0)” — dwa tryby,
  `relai-scope` w PowerShellu (`installPath` → `status` → `apply` → `undo`, `on`/`off`), przycisk
  kokpitu, sesja w korzeniu projektu, `--cli` dla `claude.cmd`, para `disable` → `enable` przy
  odmowie „already enabled” (odłożone z E1/E2); wiersz `relai-mods` w tabeli panelu.
  `docs/KOMENDY.md`: sekcja narzędzia (pięć poleceń, kody wyjścia, opcje) i wiersz kokpitu.
- `docs/DECYZJE.md`: D-92 (wariant A, odrzucone B–D). `mods/.claude-plugin/plugin.json` i wpis
  marketplace: opis z wierszem i zapisem `.worktreeinclude`.
- Wydanie przez `/relai-release`: RelAI **3.6.0**, `relai-mods` **0.3.0**, `relai-panel`
  **0.22.1** (numery z raportu). Naprawy bezpieczne po jednej zgodzie: numery w 7 źródłach
  + `relai-update.md`, marker w `new-project.md`, README Cursora, fixture ewaluacji, własny
  marker; trafienia „np. 3.5.0” przepisane na „wersja sprzed 3.6.0”; wiersze `ARTEFAKTY.md`
  (`relai-adopt` v3, `relai-update` v25, `new-project` v13, `history.md` v11), wpis 3.6.0
  w `history.md`, generator Codeksa, fakty i budowa strony. Commity `74e8d0e` (wydanie)
  i `2658e04` (poprawka bramki), tagi trzech komponentów, trzy wydania GitHub (v3.6.0 oznaczone
  „Latest” — GitHub nadał etykietę modowi utworzonemu ostatni), push `main`, `strona.yml` success.
- **Aneks B** (decyzja Łukasza: poprawka w E4): hook `pre-push` odmówił wszystkich trzech tagów —
  `bazaModu` w `core/tools/release-check.js` zapętlała się, gdy numer modu podbito wcześniejszym
  commitem (`relai-panel` 0.22.1 w `2adda0b`), a tag stał na sprawdzanej rewizji. Przy `--rev`
  tag na samej rewizji nie czyni numeru wydanym, szukanie idzie od commitu numeru. Test
  z fixturą tego układu: czerwony przed poprawką („brak bazy modu relai-panel”), zielony po;
  testy wydań 68/68. Tagi lokalne przeniesione na `2658e04` po „tak”, push przeszedł bramkę.
- Bramka maszyny (decyzja Łukasza: po wydaniu, `apply → undo → apply`): `relai-scope` z
  zainstalowanego 3.6.0 — 74 kroki w 15 projektach, 10 nowych `.worktreeinclude`, na końcu
  globalne `false` dla czterech pluginów zestawu; dziennik `~/.claude/relai/zasieg-pluginu.json`
  (74 wpisy). Bramka w `STATUS.md`: ROZSTRZYGNIĘTA 2026-10-28.
- `docs/PULAPKI.md`: P-058 — pomiar R2 (CLI i aplikacja) i pusty `enabledPlugins` po `undo`;
  nowa P-059 — PowerShell 5.1 i powtórzone wpisy `claude plugin list --json`. README i KOMENDY:
  wiersz `installPath` z nawiasem i `Select-Object -First 1`.

**Zweryfikowane — jak dokładnie:**

- Polecenia README/KOMENDY dosłownie w PowerShellu 5.1 z zainstalowanego 3.6.0 (skrypt przez stdin):
  wiersz `installPath` → kod 0, `…\relai\3.6.0`; `status` → kod 0, „RelAI tylko w zaadoptowanych
  projektach — podglad (nic nie zapisuje)”; `on` (folder tymczasowy) → kod 0, „on: … — 5 krokow.”,
  plik z czterema `true` i linia `.worktreeinclude`; `off` → kod 0, „— 4 krokow.”; `on --cli`
  pełną ścieżką → kod 0; `--cli claude.cmd` → kod 1, „Nie znaleziono polecenia claude — nic nie
  zapisano.” + polecenia ręczne. Po przełączeniu: pierwotny wiersz `installPath` sklejał trzy
  ścieżki → `status` kod 1; poprawiony → `status` kod 0 („Krokow w planie: 0”), `apply` kod 0
  („apply: 0 krokow wykonanych.”). `apply`/`undo` na prawdziwym HOME szły tym samym wywołaniem
  `node` z Basha.
- Pierwszy wiersz `installPath` pierwotnie (repo przed wydaniem) dawał w PS 5.1 pustą wartość
  z kodem 0; diagnoza wariantami A/B/C w jednym przebiegu — nawias wokół `ConvertFrom-Json`
  zwraca ścieżkę (P-059).
- `apply` 1: kod 0, 26 z 31 plików zmienionych, w `~/.claude/settings.json` cztery klucze `false`,
  `relai-mods` `true`. `undo`: kod 0, „74 krokow cofnietych”, zestaw istniejących plików jak przed
  (5), wartości RelAI w `settings.json` z powrotem `true`; 5 plików bajtowo innych — 4 pliki
  lokalne z pustym `"enabledPlugins": {}`, `settings.json` bez możliwej do ustalenia przyczyny
  (migawka bez kopii — L-0291). `apply` 2: kod 0, stan bajt w bajt równy `apply` 1 (0 różnic
  w 31 plikach).
- Pomiar świeżymi sesjami `claude -p` (`init` + transkrypt na dysku): RelAI — 5 pluginów `relai*`,
  24 komendy `relai*`, „RelAI session-context” 2; PolyFlow — 5 / 22 / 2; folder bez RelAI
  („Agenci Hotelowi framework/Rajd Polski”) — tylko `relai-mods`, 0 komend, 0 kontekstu.
- R2: CLI 2.1.304 (`claude -w … -p`, maszyna jeszcze globalnie `true`, lokalnie `false`) kopiuje
  `.claude/settings.local.json` do worktree także bez `.worktreeinclude`; kontrola instrumentu bez
  pliku — 2 trafienia kontekstu. Aplikacja 2.1.308 po przełączeniu: sesja z karty w worktree
  `angry-spence-081996` — plik lokalny z czterema `true`, kontekst `[RelAI session-context]` jest.
- `release-check.js --wydanie`: 0 czerwonych, 25 kontroli (testy rdzenia 588/588 po normalizacji LF
  dwóch źródeł `relai-planning`, strona 396/396); raport drzewa tagu `v3.6.0` po Aneksie B
  0 czerwonych; `plugin validate` — rdzeń z ostrzeżeniem o ikonie, `mods`, `panel` czyste;
  `plugin test` mods 87/87, panel 216/216. `release-verify --sesja`: relai 1548/1548,
  relai-mods 33/33, relai-panel 63/63, 0 rozjazdów, świeża sesja ładuje każdą wersję. Panel
  i kokpit po `/reload-plugins` — „ok” Łukasza.
- Dowód negatywny: `git diff --stat 92d3d73 -- core/process/plugin-scope.js mods/hooks/` pusty.
- Katalog roboczy `.claude/relai/work/ZASIEG_PLUGINU/E4/`: przed 24 pliki / 298 KB (+
  `work/WYDANIE/3.6.0/` 16 KB, notatki wydania), po 0 — skasowane po „tak” Łukasza. Poza
  projektem, po tym samym „tak”: `%TEMP%/relai-zasieg-e4-proba` (skasowany w trakcie, z trzema
  worktree R2), `%TEMP%/relai-zasieg-e4-kopie` (kopie ustawień przed drugim `apply`),
  `%TEMP%/relai-zasieg-e3-1` (po E3), 4 foldery transkryptów `~/.claude/projects/…-relai-zasieg-e4-proba*`,
  worktree i gałąź `claude/angry-spence-081996` (sesja pomiaru zarchiwizowana). Folder transkryptu
  sesji w „Rajd Polski” zostaje (projekt Łukasza).
- Tabela „Stan otwartych ryzyk” przejrzana — bez zmian (R1–R6 planu żyją w `PLAN.html`).

**Świadomie odłożone:**

- `undo` zostawia pusty `"enabledPlugins": {}` w pliku lokalnym, który przed `apply` nie miał
  tego obiektu (P-058) — neutralne dla precedencji; poprawka w `plugin-scope.js` poza zakresem.
- Wiersz kokpitu przy „● włączony z ustawień globalnych” ma przycisk „Włącz” — uwaga Łukasza
  2026-10-28: myli, bo RelAI już działa; lepsze brzmienie typu „Przypnij w tym projekcie”.
  Zmiana modu poza zakresem E4.
- Testy parytetu Codeksa w klonie z `core.autocrlf=true`: źródła `relai-planning` w drzewie
  roboczym znormalizowane do LF (decyzja Łukasza), sam test dalej porównuje sumy bez CRLF → LF.
- Raport `release-check.js --json` (~15 KB) narzędzie ucina w środku — drugi przebieg z filtrem
  był potrzebny, żeby zobaczyć drugą czerwień; komenda `/relai-release` tego nie przewiduje.
- Procedury adopt/init/update czytają „wpis `relai@relai`” bez wyboru zakresu — po przełączeniu
  wpisów jest kilka, ścieżka ta sama; bez zmian.

**Do zrobienia przez człowieka:**

- Wydane 3.6.0 (README na GitHubie w tagu i w pluginie) ma wiersz `installPath`, który po
  przełączeniu maszyny skleja ścieżki (P-059); poprawka jest w repo — wydanie 3.6.1 teraz czy
  przy następnym wydaniu? *(rozstrzygnięte 2026-10-28 — przy następnym wydaniu)*
- Commit `.worktreeinclude` w 10 projektach (w tym w tym repo) — zostawić lokalnie czy
  commitować (PLAN sekcja 9)? *(rozstrzygnięte 2026-10-28 — commit tylko w RelAI, w pozostałych
  projektach lokalnie)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Plan ZASIEG_PLUGINU zamknięty: dowiezione vs plan

Plan [ZASIEG_PLUGINU](archiwum/plany/ZASIEG_PLUGINU/STATUS.md) (zaakceptowany 2026-10-27,
4 etapy, Aneksy A–B) — zamknięcie po E4.

**Zrobione — dowiezione vs plan:**

| Cel z PLAN sekcja 2 | Stan |
|---|---|
| Folder bez markera nie dostaje skilli, komend, agentów ani hooków RelAI | dowiezione — zmierzone 2026-10-28: „Rajd Polski” ładuje tylko `relai-mods`, 0 komend `relai*`, 0 kontekstu |
| Każdy zaadoptowany projekt działa jak przed, także w worktree | dowiezione — RelAI i PolyFlow z kontekstem startu; worktree w CLI 2.1.304 i aplikacji 2.1.308 dostaje plik lokalny (R2 nie zachodzi); pozostałe 13 projektów nie mierzone osobno, `apply` sprawdził zapis każdego odczytem pliku |
| Przełączenie i cofnięcie jednym poleceniem, z podglądem | dowiezione — `status` bez zapisu, `apply` / `undo` na prawdziwym HOME; `undo` przywraca klucze RelAI, bajtowo zostaje pusty `enabledPlugins` w 4 plikach (P-058) |
| Adopcja, inicjalizacja i `/relai-update` włączają RelAI lokalnie | dowiezione w E2 (ewaluacje 7/7) |
| Nowy folder bez terminala | dowiezione w E3 — wiersz kokpitu `relai-mods` 0.3.0, zmierzony na desktopie |

- Etapy: E1 narzędzie, E2 procedury (Aneks A — para disable → enable), E3 kokpit, E4 dokumentacja,
  D-92, wydanie 3.6.0 / 0.3.0 / 0.22.1 (Aneks B — poprawka bramki `pre-push`), przełączenie maszyny.
- Szacunek 4–6 sesji: 5 sesji (E1, E2, E3, E4 w dwóch sesjach po przekazaniu).
- Przepadło / poza planem: nic z celów. Poza planem doszły Aneks B i P-059 (wiersz `installPath`
  w wydanym README — do następnego wydania).

**Zweryfikowane — jak dokładnie:** bramki w `STATUS.md` — 3 z 3 rozstrzygnięte (przełączenie
maszyny, 3.6.1, `.worktreeinclude`); odnóg plan nie miał; sprawy „Do zrobienia przez człowieka”
z okresu planu — 4 z adnotacją rozstrzygnięcia. Trivy przed przeglądem ryzyk: 0 znalezisk,
0 nowych. Tabela ryzyk bez zmian (ryzyka R1–R6 planu w `PLAN.html`: R2 zmierzone — nie
zachodzi; R3, R4 — zapisy sprawdzane odczytem, `apply` przerwane nie wystąpiło; R5 —
`.worktreeinclude` rozstrzygnięte; R6 — commity z plikami z nazwy).

**Świadomie odłożone:** pozycje z wpisu E4 (pusty `enabledPlugins` po `undo`, brzmienie przycisku
kokpitu, test parytetu przy CRLF, ucięty raport `--json`) — w `STATE.md` „Co dalej”.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Strona: koniec maili o nieudanych przebiegach przy wydaniu — MINIPLAN

Zgłoszenie Łukasza: GitHub co chwilę przysyła maile o nieudanych jobach CI. Jedyny workflow repo
to `.github/workflows/strona.yml`.

**Rozpoznanie:** z `push` na `main` 20/20 przebiegów udanych, z `release` 13 przebiegów (od
2026-10-18, `6fd755b`), żaden udany — 9 porażek, 4 anulowane. Przebieg z wydania działa na tagu,
a środowisko `github-pages` dopuszcza tylko gałąź `main`: „Tag "relai-panel-v0.22.1" is not
allowed to deploy to github-pages due to environment protection rules” (krok `publikuj`; budowa
przechodzi). Anulowania: `concurrency: pages` trzyma w kolejce jeden przebieg, a wydanie z kilkoma
tagami tworzy kilka naraz. Wyzwalacz był zbędny: `/relai-release` po wydaniu GitHub robi push
`main`, który wdraża stronę (L-0280).

**Zrobione (wybór Łukasza: usunąć wyzwalacz, nie dopuszczać tagów w środowisku):** z `strona.yml`
usunięty `release: types: [published]` (zostają `push` i `workflow_dispatch`); w `site/README.md`
zdanie o publikacji „przy opublikowaniu wydania” zastąpione powodem, dla którego wydania jej nie
wyzwalają. Commit `9db57d9`, push `main` po zgodzie.

**Zweryfikowane:** testy strony 396/396; przebieg `strona.yml` z pushu `9db57d9` (2026-10-28 07:50)
— success; `https://nowilus.github.io/relai/` → 200, `/pl/` pokazuje 3.6.0. Skutek dla maili
widać od następnego wydania — wydarzenie `release` bierze workflow z drzewa tagu, a tagi 3.6.0
mają jeszcze starą wersję (ich przebiegi już się odbyły: 2 porażki, 1 anulowany).

**Świadomie odłożone:** komunikat o migracji `ubuntu-latest` na Ubuntu 26 (ostrzeżenie, nie
porażka).

### 2026-10-28 — Rotacja dziennika i lekcji po zamknięciu ZASIEG_PLUGINU

Zgoda Łukasza na rotację zaproponowaną z raportu hooka startu (dziennik, ryzyka, lekcje ponad
progami). Procedura `document-rotation.md` skilla `relai-core`, `SPEC_ARCHIWUM.md`.

**Zrobione:**

- Dziennik (`rotate.js wykonaj dziennik --prog 150`): 24 wpisy 2026-10-24 … 2026-10-26 →
  [DZIENNIK_2026-10-24_2026-10-26.md](archiwum/dziennik/DZIENNIK_2026-10-24_2026-10-26.md),
  suma fragmentu `cd7f843db9423e00`, faza 1 zgodna z odczytem z dysku; 212,0 KB → 86,0 KB;
  przepiętych linków 0, linków „Czeka na człowieka” 10, martwych kotwic 0, do nieistniejącego
  pliku 0.
- Lekcje (skrypt `.claude/relai/work/rotacja-lekcje.cjs`, dwie fazy): L-0261 … L-0272 (12) →
  [LEKCJE_L-0261_L-0272.md](archiwum/lekcje/LEKCJE_L-0261_L-0272.md), suma `502b70c5fa79d163`
  zgodna po odczycie z dysku; 60,5 KB → 50,7 KB; w sekcji zostaje 20 najnowszych.

**Zweryfikowane — jak dokładnie:** wyjścia obu skryptów (sumy faz 1, rozmiary przed i po);
`grep -c "^### L-" docs/LEKCJE.md` → 20; odsyłacz lekcji w miejscu przeniesionego zakresu.

**Komunikat zablokowanej rotacji:**

- Ryzyka: 0 z 20 wierszy przechodzi (żaden nie jest `ZAMKNIĘTE`); 17,5 KB = rotowalna 0,0 KB
  + dolna granica 17,5 KB, próg 12 KB. Kompresji komórki „Mitygacja” brak — jedyna kwalifikująca
  się (L1, `ZMITYGOWANE`) ma 328 znaków, poniżej 800. Odchudza zamykanie ryzyk albo zwięźlejsze
  komórki; podniesienie progu to decyzja człowieka.
- Lekcje: po rotacji 50,7 KB przy progu 50 KB — reszta to „Zasady aktywne” (~29 KB) i 20
  nietykalnych lekcji; dalej odchudza tylko zwięźlejszy destylat zasad.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Przyciski paska postępu: duchy z odstępem, krótkie etykiety w wąskim panelu — MINIPLAN

Zgłoszenie Łukasza: przycisk „Rozwiń” na pasku postępu „zajmuje za dużo miejsca, nachodzi on
prawie na pasek postępu, prawie się zlewa, nie ma tam odpowiednich marginesów, paddingów”; w trakcie
dopisał: „zobacz, jak to wygląda na takim małym zwiniętym pasku […] można od razu też ten przycisk
z liczbą agentów poprawić analogicznie”. Wątek bez aktywnego planu — MINIPLAN, prompt po
optymalizatorze (tryb ciągły) przyjęty z aneksem o chipie i wąskim pasku.

**Zrobione:**

- Sonda `relai-przyciski-sonda` w `dev-mods` sesji (budowana skryptem
  `.claude/relai/work/PRZYCISKI_POSTEPU/build-sonda.cjs` z kopii `steps.tsx` z liczonymi
  podmianami): pięć rund na danych etapu E4 ZASIEG_PLUGINU — przed/po, formy natywnego `Button`,
  `sm` wobec `xs`, trzy układy wąskiego paska (A jeden rząd, B krótkie etykiety, C przyciski pod
  nazwą), na końcu prawdziwy plik z repo obok kodu z HEAD. Wybór Łukasza: „tak niech będzie b”.
- `progress/hooks/steps.tsx`: na desktopie „Rozwiń/Zwiń” i chip agentów jako `plain`, odstęp `xs`
  nad linią i pod etykietą wąskiej karty, poniżej `SHORT_BELOW = 48` kolumn w linii chip `● N`
  i „Rozwiń” bez ▾ (szeroko: „Rozwiń ▾” / „Zwiń ▴”); sam chip zostaje w pełnych słowach; terminal
  bez zmian. Nowa funkcja `chipShort`.
- `progress/hooks/progress.test.ts`: trzy testy zmienione, dwa nowe (wąska linia na obu
  powierzchniach, sam chip z odstępem).
- `DESIGN.md` 1.4 (§3, wyjątek od „przyciski pasków `primary`”) z wierszem w `ARTEFAKTY.md`;
  `PULAPKI.md` P-060 (desktop rysuje `label`, nie dzieci `Button`; `plain` zostawia natywną
  wysokość). Wycinki zrzutów `docs/zasoby/PANEL_RELAI/zrzuty/PRZYCISKI_POSTEPU_r0–r5_*`; pełne
  zrzuty okna (z innymi sesjami na ekranie) usunięte, sonda usunięta.

**Zweryfikowane — jak dokładnie:**

- Piksele zrzutów (`okno.ps1`, `lupa.ps1`, skan wierszy `rzedy.ps1`, skala ekranu ok. 1,73):
  przed — segmenty i przycisk w jednym bloku bez wiersza tła (0 px), w wąskim panelu przycisk
  zasłania segmenty, nazwa „Bramka …” / „Bram…”; produkt B przy 37 kolumnach — 17 px przerwy,
  karta 80 px zamiast 70 px, nazwa „Bramka maszyny …”, sam chip 18 px pod etykietą.
- Dowód obiema wersjami: nowe testy na kodzie z HEAD (worktree w `%TEMP%`, stała zamiast
  importu) — 5 fail, dokładnie zmienione i nowe; na zmianie `claude plugin test progress`
  (binarka aplikacji 2.1.309) 50/50; `node --test core/panel/tests/*.test.js` 225/225;
  `claude plugin validate progress` zielone; `sync-panel-core.js --check` zgodne.
- Recenzja (agent `code-reviewer`): zero HIGH i MEDIUM, dwa LOW — oba poprawione: wiersz z samym
  tekstem (bez przycisku) nie dostaje odstępu `xs`; testy dopisane dla wąskiej linii rozwiniętej
  („Zwiń” bez ▴ obok `● 1`) i wiersza bez przycisku. Mutacja (powrót odstępu dla samego tekstu)
  → 1 fail w tym teście; po przywróceniu 50/50.

**Świadomie odłożone:**

- Wydanie: wersja `relai-progress` podnosi się przy „gotowi do wydania?”.
- Najechanie na przycisk-duch maluje jego tło, które przy wąskim pasku może dotknąć segmentów
  (P-060) — niezmierzone na żywo.
- Samotny chip stoi kilka pikseli na prawo od krawędzi etykiety (wewnętrzny margines przycisku).

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Analiza kontekstu startowego KONTEKST_STARTU: pomiar, mapa, zalecenia dostawcy, wywiad

Zgłoszenie Łukasza: przy pierwszej wiadomości w projekcie RelAI ok. 100 tys. tokenów zajętych;
prośba o przegląd logiki czytania dokumentów na starcie „biorąc pod uwagę najnowsze zalecenia”
i o logikę doczytywania tylko potrzebnych sekcji. Optymalizator (tryb ciągły, zgoda „tak, w tej
sesji”, model sesji) rozdzielił zdanie na dwa prompty: przyciski (wpis wyżej) i tę analizę.

**Zrobione:**

- Trzy równoległe rozpoznania: A — pomiar tokenów w transkryptach (`api-request-shape`,
  kalibracja 1,93 B/tok PL, 2,31 EN, 3,52 JSON); B — mapa mechanizmu (kto każe czytać co
  i kiedy); C — dokumentacja Claude Code i blog Anthropic, odczyt 2026-10-28.
- Raport [ANALIZA.md](plany/KONTEKST_STARTU/ANALIZA.md): warianty W0–W4 (W1 „rytuał sekcjami”
  i W2 „indeks z drogowskazem” rekomendowane, W0 i W4 odrzucone z powodem), ryzyka, przypadki
  brzegowe, rozstrzygnięcia wywiadu.
- Wywiad, dwie rundy. Rozstrzygnięcia: cel — kontekst po pierwszej turze; „Zasady aktywne” jako
  indeks z doczytywaniem (W2, wpis przy D-15 do zrobienia w planie); tryb ciągły — delegacja
  i podział `relai-prompt.md`, a bramka zgody pyta najpierw tylko o zgodę, po „nie” kończy,
  po „tak” drugie okno z modelem i zasięgiem (słowa Łukasza: „on bardzo często zadaje za dużo
  pytań […] jak odpowiadam «nie», to po prostu nie drąży tematu”); zakres — tylko RelAI.
- `PULAPKI.md` P-061 (zagnieżdżony `claude.md` na Windows).
- Sprawa „Jedno okno pytań na starcie w sesji interaktywnej” (z 2026-09-24) zdjęta z sekcji
  „Czeka na człowieka”: rozstrzygnięta odwrotnie decyzją Łukasza z wywiadu. Wpis źródłowy jest
  w archiwum z sumą kontrolną, więc adnotacja stoi tylko tutaj.

**Zweryfikowane — jak dokładnie:**

- Pierwsze wywołanie API dziś 81,9–87,3 tys. (pięć sesji), linia bazowa bez RelAI 73,2 tys.
  (Jarvis); koniec pierwszej tury 122–174 tys., mediana 129,5 tys.; w tej sesji 81,9 → 173,9 tys.:
  rytuał +39,1 tys., bramka trybu ciągłego +26,7 tys., wyjście modelu +25,3 tys.
- Każde zalecenie dostawcy w raporcie ma adres; liczby z transkryptów i `wc -c`, nie oszacowania
  (tokeny składników startu — wyliczone przelicznikiem, oznaczone).

**Świadomie odłożone:**

- Plan KONTEKST_STARTU — następny krok, skill `relai-planning`.
- Usterki znalezione w analizie idą do planu: parser aktywnego planu bierze link z linii
  „Aktywny plan: brak” (wstrzymany PANEL_CODEX liczy się jako aktywny), propozycja rotacji
  dziennika przy każdym starcie mimo braku części rotowalnej, nakładki `rodziny/claude.md`
  jako zagnieżdżony `CLAUDE.md` u wszystkich użytkowników, zbędna kopia
  `adapters/claude-code/hooks/.claude/relai/`, hook `session-context` trwający 24,5 s.
- Poprzedni wpis (rotacja z 2026-10-28) ma podwójną stopkę „Do zrobienia… / Autor” — kosmetyka,
  bez zmiany.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Plan KONTEKST_STARTU: lżejszy start sesji (DO AKCEPTACJI)

Plan na podstawie [ANALIZA.md](plany/KONTEKST_STARTU/ANALIZA.md) i wywiadu z Łukaszem (prośba:
„zacommituj zmiany a potem pisz plan”). Format i model z `docs/USTAWIENIA.md` — HTML, Opus
(D-85) — więc bez pytania startowego.

**Zrobione:**

- [PLAN.html](plany/KONTEKST_STARTU/PLAN.html) z szablonu pluginu (`HTML_PLAN`, bez nadpisania
  lokalnego — wiersz „Szablon planu HTML”): dziesięć sekcji, warianty A–E (C wybrany: skrót
  startu jednym poleceniem, indeks zasad, bramka w dwóch krokach), 5 etapów, 8 ryzyk,
  10 przypadków brzegowych, 4 sprawy dla Łukasza, diagram przepływu, symulator kontekstu po
  pierwszej turze. Treść w `.claude/relai/work/KONTEKST_STARTU/plan-tresc.html`, złożona skryptem
  `wypelnij-plan.cjs` (podstawienia funkcją) i builderem `zbuduj.js`.
- [STATUS.md](plany/KONTEKST_STARTU/STATUS.md) — DO AKCEPTACJI, etapy OCZEKUJE, bez promptów
  (PROMPT_ETAP_1 powstaje przy akceptacji, D-34). Linia „Aktywny plan” w `CLAUDE.md` i kopii
  w `AGENTS.md`; STATE.

**Zweryfikowane — jak dokładnie:**

- Builder: 6 reguł `@font-face`, 222 KB, kod 0, żadnego niewypełnionego znacznika; zero adresów
  `http(s)` w pliku.
- W przeglądarce: zwijanie (`aria-expanded` false → true), symulator 178 → 117 tys., RelAI
  18 tys. przy wartościach startowych, a przy skrócie 40 KB 31 tys. i „ponad cel”; brak przewijania
  poziomego przy 375 px i 1280 px.
- Diagram: pierwsza wersja miała dwie dolne kartki nachodzące o 40 px — przesunięte; instrument
  (prostokąty `getBBox`, podpis w kartce) daje 0 nachodzeń i 0 podpisów poza kartką, a na
  podłożonym przesunięciu wykrywa nachodzenie 4–5 (kontrola pozytywna).
- `node --test core/process/tests/*.test.js` 321/321 (w tym sieć rytuału z kopią `AGENTS.md`).

**Świadomie odłożone:**

- Przy panelu przeglądarki o szerokości 278 px szablon ma 286 px (8 px) — zachowanie szablonu
  przy szerokości mniejszej niż telefon; bez zmiany.

**Do zrobienia przez człowieka:**

- Akceptacja planu KONTEKST_STARTU (z celem 25 tys. tokenów z sekcji 9) albo poprawki.
  *(rozstrzygnięte 2026-10-28 — „Akceptuję”, wpis niżej)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — Plan KONTEKST_STARTU zaakceptowany

Łukasz: „Akceptuję” — bez poprawek, więc bez Aneksu A; razem z planem przyjęty cel z sekcji 9:
RelAI najwyżej 25 tys. tokenów po pierwszej turze.

**Zrobione:**

- [STATUS.md](plany/KONTEKST_STARTU/STATUS.md): ZAAKCEPTOWANY 2026-10-28, E1 GOTOWY DO STARTU
  z linkiem do promptu, linia w dzienniku wdrożenia. Nagłówek PLAN.html przebudowany z nowym
  statusem; sekcje 1–10 od teraz nietykalne (zmiany tylko aneksami).
- [PROMPT_ETAP_1.md](plany/KONTEKST_STARTU/PROMPT_ETAP_1.md) wg `SPEC_PROMPT_ETAPU.md`: parser
  linii „Aktywny plan: brak”, propozycja rotacji tylko z zyskiem, nakładki
  `rodziny/nakladka-<family>.md` ze sprzątaniem starych kopii, instrument
  `core/tools/start-context.js` z kontrolą pozytywną na czterech zmierzonych sesjach, pomiar
  „przed”. Zasady aktywne 3, 4, 5, 6, 7, 8, 10, 11, 13 wklejone skryptem dosłownie z LEKCJE.
- Linia „Aktywny plan” w `CLAUDE.md` i `AGENTS.md`, STATE.

**Zweryfikowane — jak dokładnie:**

- `diff` PLAN.html przed i po przebudowie: zmieniły się wyłącznie dwie linie statusu w nagłówku.
- Skrypt wklejający zasady: 15 zasad w sekcji, 9 wklejonych, prompt 34 068 B; ogon zasady 13
  (lista L-…) obecny w prompcie.
- Linie „Aktywny plan” w `CLAUDE.md` i `AGENTS.md` identyczne (`diff` linii).

**Świadomie odłożone:** —

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — KONTEKST_STARTU E1: start bez fałszywych sygnałów i instrument pomiaru kontekstu

Etap wg [PROMPT_ETAP_1.md](plany/KONTEKST_STARTU/PROMPT_ETAP_1.md), sesja Opus 5.5. W trakcie
etapu Łukasz przyjął **Aneks A** (wpis w [STATUS.md](plany/KONTEKST_STARTU/STATUS.md)): linia
`[RelAI progi dokumentow]` nie proponuje rotacji ryzyk, gdy żadne nie jest zamknięte.

**Zrobione:**

- `core/process/session-signals.js`, `liniaAktywnegoPlanu`: wartość linii zaczynająca się od
  `brak` / `none` daje „brak planu”, także z linkiem do `STATUS.md` dalej w linii (wzorzec
  `WARTOSC_BRAK`, toleruje `**…:**`). Linia z linkiem nadal wygrywa z prozą rytuału (L-0047).
- `startCost` liczy część rotowalną warstwy startowej (`rotowalne`, `rotowalneBajty`): wiersze ryzyk
  `ZAMKNIĘTE` z tego samego planu co `rotate.js` i wiersze „Ustawień wycofanych”, obie tylko przy
  dokumencie ponad progiem, bo poniżej rotacja nic nie robi. `startCostReport`: „Zaproponuj
  rotacje dziennika…” tylko przy części rotowalnej > 0, z liczbą KB i składnikami; przy 0 pada
  zdanie „Rotacja nic tu nie zdejmie…”. Aneks A: pozycja sekcji ryzyk w linii progów dokumentów
  ma procedurę „zamykanie ryzyk”, gdy nic nie jest zamknięte. `SPEC_ARCHIWUM.md`: wejście 2 ma
  czwarty warunek.
- Nakładki: `git mv` na `core/prompt/rodziny/nakladka-claude.md` i `nakladka-openai.md` (treść
  bajt w bajt). Wzorzec ścieżki w `relai-prompt.md`, skillu Codeksa `relai-prompt`, agencie
  optymalizatora, `REGULY.md`, `SZABLONY.md` i w `core/MANIFEST.json`. `provisionPrompt` kasuje
  w projekcie stare `rodziny/claude.md` i `openai.md`, chyba że źródło nadal je niesie. Codex
  i Cursor kopiują przez ten sam `core.provisionTemplates`, więc parytet bez osobnego kodu.
- Nowe narzędzie repozytorium `core/tools/start-context.js` (`--sesja`, `--ostatnie`, `--json`,
  `--projekt`, `--transkrypty`): pierwsze wywołanie i koniec 1. tury z `message.usage`, jedno
  wywołanie na `message.id`, polecenie człowieka bez meta, wyników narzędzi i powiadomień;
  brak pól → „brak danych”. Wiersz `core/tools/**` w `release-map.json` już je obejmuje;
  `provisionTools` go nie kopiuje (lista `NARZEDZIA`).
- Testy: parser w `session-signals.test.js`, rotacja i Aneks A w `start-cost.test.js`,
  dwa testy nakładek w `model-overlays.test.js`, cztery testy instrumentu w nowym
  `start-context.test.js`.
- Dokumenty: P-061 w `PULAPKI.md` ze stanem po naprawie; `ARTEFAKTY.md` — `REGULY` 3,
  `SZABLONY` 4, obie nakładki 2, `relai-prompt.md` 13, agent optymalizatora 4, `SPEC_ARCHIWUM`
  4. Lekcje L-0293–L-0295.

**Pomiar „przed”** (`node core/tools/start-context.js`, tokeny, pierwsze wywołanie → koniec
1. tury):

| Sesja | Rodzaj | Pierwsze | Koniec 1. tury |
|---|---|---|---|
| `730b6571` | interaktywna, 3.6.0 | 81 946 | 173 910 |
| `03576d50` | interaktywna, 3.6.0 | 87 337 | 141 453 |
| `ee1beb6e` | interaktywna, 3.6.0 | 89 943 | 198 710 |
| `d166a966` | ta sesja, karta startu E1 | 87 499 | 126 312 |
| `30fe4ea7` | `claude -p`, zainstalowany 3.6.0, odczyt `rodziny/openai.md` | 53 036 | 59 076 |
| `07aae907` | `claude -p`, `--plugin-dir` repo, odczyt `rodziny/nakladka-openai.md` | 53 123 | 55 887 |

Sesja `03576d50` ma te same liczby co `a14fa0b2` z ANALIZY §3.1 (87 337 → 141 453), pod innym
identyfikatorem pliku.

**Zweryfikowane — jak dokładnie:**

- `node --test core/process/tests/*.test.js` → 329/329 (było 321; +8 nowych);
  `node --test core/panel/tests/*.test.js` → 225/225; `node core/tools/validate-adapters.js` →
  kod 0, „nakladki rodzin: 2 plikow, 18 regul, 18 ze zrodlem i data”.
- Obie wersje w jednym przebiegu: nowe testy skopiowane do worktree HEAD `7e9a8dd`
  (`core.autocrlf=false`) → `session-signals` 3 pass / 1 fail, `start-cost` 3 / 1,
  `model-overlays` 7 / 1. Padły dokładnie trzy nowe testy (parser, rotacja, sprzątanie nakładek;
  TAP). Na zmianie: 4 / 0, 4 / 0, 8 / 0.
- Parser: fixtura „Aktywny plan: brak. [PANEL_CODEX](…STATUS.md) …” → ani pozycja `status`
  budżetu, ani siatka D-34 nie wskazują STATUS-u PANEL_CODEX; ta sama linia bez „brak” →
  wskazują (`docs/plany/PANEL_CODEX/STATUS.md`, luka E1). Na tym repo: suma `startCost` bez skilla
  88 718 B, pozycje `CLAUDE, STATE, ryzyka, zasady, ustawienia, status` — `status` to
  KONTEKST_STARTU.
- Rotacja: przy części rotowalnej 0 raport bez frazy „Zaproponuj rotacj”, ze zdaniem „Rotacja nic
  tu nie zdejmie”; przy jednym ryzyku `ZAMKNIĘTE` — „Zaproponuj rotacje dziennika … ryzyka
  ZAMKNIETE”. Ten sam test, jeden przebieg. Na tym repo: `rotowalne` = 0 B (ryzyka 0, ustawienia 0
  — plik 6 097 B poniżej progu 6 KB).
- Nakładki: `git ls-files core/prompt/rodziny` → wyłącznie `nakladka-claude.md`,
  `nakladka-openai.md`; `git diff -M` → „similarity index 100%” dla obu. `grep` starych wzorców
  w `core adapters` → dwa komentarze historyczne (kod i test) i dwa `history.md`, poza tym tylko
  zbędna kopia `adapters/claude-code/hooks/.claude/relai/` (poza planem).
- Nakładka na żywo: sesja A (`30fe4ea7`, zainstalowany 3.6.0) — odczyt `rodziny/openai.md`
  i jeden załącznik `nested_memory` `…\rodziny\CLAUDE.md` (7 151 B): kontrola pozytywna.
  Sesja B (`07aae907`, `--plugin-dir` repo; w `init` `relai` z `C:\Users\Lukasz\Desktop\RelAI`,
  `relai@inline`, instalacja wyłączona `--settings`) — odczyt `rodziny/nakladka-openai.md`,
  zero `nested_memory`. Po sesji B w projekcie były tylko dwie nowe nakładki.
- Instrument: `730b6571` 81 946 → 173 910, `23b3dfc2` 87 039 → 128 139, `a9d65f84` 87 322 →
  129 512, `7be49f27` 87 327 → 122 268 — dokładnie liczby z promptu. Fixtura bez pól `usage` →
  „brak danych” w obu kolumnach, kontrola z pełnymi polami w tym samym teście.
- Dowód negatywny: `git diff --stat 7e9a8dd` nie pokazuje `adapters/claude-code/hooks/` ani
  `core/process/prompt-mode.js` (kontrola pozytywna tej samej komendy na `core/process/` →
  4 pliki); `git diff 7e9a8dd -- docs/LEKCJE.md` przed dopisaniem lekcji → 0 linii; sekcja „Zasady
  aktywne” nietknięta także po dopisaniu L-0293–L-0295.
- Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E1/`: przed — 6 pozycji, 60 006 B (trzy
  sondy, dwa wyjścia sesji `claude -p`, pusty folder po worktree „przed”); po — skasowany po „tak”
  Łukasza, 0 pozycji. Poza katalogiem: transkrypty `30fe4ea7` i `07aae907`
  w `~/.claude/projects/C--Users-Lukasz-Desktop-RelAI/` zostają jako dowód pomiaru; dwa pliki
  robocze `relai-plan.txt` i `relai-val.txt` w `%TEMP%` skasowane; worktree „przed” usunięty
  z listy (`git worktree prune`).

**Świadomie odłożone:**

- Do wydania zainstalowany 3.6.0 kopiuje stare `rodziny/claude.md` i `openai.md` z powrotem przy
  każdym starcie i wywołaniu skilla (L-0294); w tym projekcie leżą teraz obok nowych.
- Definicja „końca 1. tury” to wejście ostatniego wywołania **plus** jego wyjście — tak liczy
  ANALIZA (L-0295); prompt podawał samą sumę wejścia. Zapisane w nagłówku narzędzia.
- `clean-work.js raport` liczy nieśledzony `core/process/tests/start-context.test.js` jako
  artefakt w katalogu `core` (zniknie po commicie).
- `start-nets.md` opisuje frazę „Zaproponuj rotacje” jako sygnał włączonej rotacji — nadal
  prawda (warunek konieczny), więc bez zmiany.
- Destylat „Zasady aktywne” bez odświeżenia — zakaz z weryfikacji etapu; L-0293–L-0295 mieszczą
  się w zasadach 5, 13 i 4. Odświeżenie w E4 razem z indeksem.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — KONTEKST_STARTU E2: skrót startu jednym poleceniem

Etap wg [PROMPT_ETAP_2.md](plany/KONTEKST_STARTU/PROMPT_ETAP_2.md), sesja Opus 5.5, HEAD `b5b843b`.
W trakcie Łukasz przyjął **Aneks B** ([STATUS.md](plany/KONTEKST_STARTU/STATUS.md)): dwie kopie
rytuału spoza listy promptu — Krok 4 `/relai-stage` i `SPEC_KOMENDY.md` — weszły do zakresu.

**Zrobione:**

- `core/process/start-digest.js` (`node .claude/relai/tools/start-digest.js [katalog]`): z `STATE.md`
  „Gdzie jesteśmy”, „Nad czym pracujemy teraz”, „Co blokuje”, pierwszy punkt „Co dalej”; tabela
  ryzyk bez „Mitygacji” (separator bez ucieczki, wiersze tabel bez własnego nagłówka też);
  „Czeka na człowieka” tylko przy sprawie przeterminowanej (ta sama miara co hook); ostatni wpis;
  aktywne wiersze `USTAWIENIA.md`; `STATUS.md` planu z parsera E1; „Zasady aktywne” w pełnym
  brzmieniu; drogowskazy. Nagłówki z tolerancją `## 2.` i `**…**`, CRLF, „brak sekcji …” /
  „brak pliku …”, kod wyjścia 0. Do projektu przez `NARZEDZIA` razem z `session-signals.js`
  (ten sam `require('./session-signals.js')` w repo i w projekcie); `POLECENIE_SKROTU` w rdzeniu.
- Jedno polecenie rytuału w 11 kopiach: `CLAUDE.md`, `AGENTS.md`, hooki `session-context` trzech
  adapterów, `SKILL.md` `relai-core` (Codex z generatora), `relai-core.mdc`, `SPEC_CLAUDE_MD.md`,
  oraz z Aneksu B `relai-stage.md` (+ skill Codeksa) i `SPEC_KOMENDY.md`. Drogowskazy hooka do
  `debugging.md`, `first-deploy.md`, `done-check.md` zostały.
- Hook Claude Code po kompakcji (`source: compact`) przypomina polecenie i nie każe czytać od nowa;
  „kontynuujemy pracę” w `SKILL.md` i regule Cursora uruchamia skrót ponownie.
- Budżet startu: `startCost` liczy `CLAUDE.md` + części skrótu pod nazwami progów cząstkowych
  (`STATE`, `ryzyka`, `ustawienia`, `status` — tylko przy aktywnym planie, `zasady`) + `skrot`
  (ramka) + skill + pliki dopisane do rytuału. Część rotowalna: wiersze `ZAMKNIĘTE` w kształcie
  skrótu (bez „Mitygacji”); „Ustawienia wycofane” wypadły, bo skrót ich nie wypisuje.
  `SPEC_USTAWIENIA` (wiersz budżetu, katalog progów) i `SPEC_ARCHIWUM` (warunek 4 wejścia 2)
  mówią, co budżet liczy.
- Testy: nowe `start-digest.test.js` (8) i `ritual-copies.test.js` (3, hooki trzech adapterów
  uruchamiane na fixturze); `stage-card.test.js` przestawiony na nowe brzmienie Kroku 4.
- `ARTEFAKTY.md`: `SPEC_ARCHIWUM` 5, `SPEC_CLAUDE_MD` 9, `SPEC_KOMENDY` 13, `SPEC_USTAWIENIA` 17,
  `/relai-stage` 12, skill `relai-core` 27, reguła Cursora `relai-core` 7. Lekcje L-0296–L-0298.

**Porównanie akapitów „gdzie jesteśmy”** (ryzyko 2): dwie świeże sesje `claude -p "kontynuujemy
pracę"` na tych samych dokumentach (pliki `docs/` skopiowane do worktree, `cmp` zgodny). A —
stary rytuał (worktree `b5b843b`, plugin z worktree, sesja `21d9e44a`). B — skrót (repo, plugin
z repo, sesja `137a0d75`).

| Informacja | A (stary) | B (skrót) | Rozstrzygnięcie |
|---|---|---|---|
| RelAI 3.6.0 wydany, trzy narzędzia | jest | jest | — |
| Aktywny plan, cel 25 tys. tokenów | jest | jest (z „zamiast ~72 tys.”) | — |
| E1 zamknięty, E2 w toku z niezacommitowaną pracą | jest | jest (+ rozjazd STATE „gotowy” wobec STATUS „W TOKU”) | — |
| Które punkty Weryfikacji E2 zostały | jest — A weszło do głównego repo i czytało `PROMPT_ETAP_2.md` | brak | poza rytuałem (prompt czyta `/relai-stage`); skrót ma drogowskaz do folderu planu |
| PANEL_CODEX wstrzymany | brak | jest | — |
| Co blokuje | brak | „nic nie blokuje” planu | sekcja jest w skrócie; ocena modelu, nie luka |
| Gotowość wydania (35 plików) | jest | jest | — |
| Budżet startu 109,3 KB > 100 KB | jest | brak | zmiana zamierzona: budżet liczy skrót, 77,7 KB < 100 KB, raport milczy |
| Progi ryzyk i lekcji, artefakty, lista modeli | jest | jest | — |

Zero informacji zgubionej bez rozstrzygnięcia. Obie sesje pominęły „Zasady aktywne” — A nie
otworzyło `LEKCJE.md`, B nie doczytało tej części skrótu (L-0296).

**Pomiar „po E2”** (`node core/tools/start-context.js`, tokeny, pierwsze wywołanie → koniec
1. tury, `claude -p`, Opus 5.5, instalacja wyłączona `--settings`, w `init` `relai@inline`):

| Sesja | Rytuał | Pierwsze | Koniec 1. tury | Wywołań |
|---|---|---|---|---|
| `21d9e44a` | stary (worktree `b5b843b`) | 52 154 | 88 144 | 6 |
| `137a0d75` | skrót (repo po E2) | 52 492 | 75 848 | 5 |

Różnica: −12 296 tokenów na końcu tury (FAKT, jedna para, bez pomiaru szumu). Dla porządku:
przed E2 w E1 `claude -p` z `--plugin-dir` mierzyło 53 123 → 55 887, ale tamta sesja nie robiła
rytuału (pytanie o nakładkę), więc nie jest „przed” dla tej pary. Budżet startu tego repo:
109,3 KB (raport hooka 3.6.0) → 77,7 KB ze skillem (FAKT, `startCost`).

**Zweryfikowane — jak dokładnie:**

- `node --test core/process/tests/*.test.js` → 340/340 (było 329; +11);
  `node --test core/panel/tests/*.test.js` → 225/225; `node core/tools/validate-adapters.js` →
  kod 0 (dwa ostrzeżenia rozmiaru dotyczą `security-audit` i `relai-prompt.md`, sprzed etapu).
- Obie wersje: nowe testy w worktree `b5b843b` (`core.autocrlf=false`, TAP) → `start-digest`
  0/1 (moduł nie istnieje), `ritual-copies` 1/2 (przechodzi tylko kontrola pozytywna wzorców),
  `stage-card` 16/2; na zmianie 8/0, 3/0, 18/0.
- Skrót na tym repo: kod 0, nagłówki — STATE „Gdzie jesteśmy”, „Nad czym pracujemy teraz”, „Co
  blokuje”, „Co dalej (pierwszy punkt)”; DZIENNIK „Stan otwartych ryzyk (bez kolumny Mitygacja)”,
  „ostatni wpis”; USTAWIENIA „wiersze aktywne”; „Aktywny plan - …/KONTEKST_STARTU/STATUS.md”;
  LEKCJE „Zasady aktywne”; „Drogowskazy”. „Mitygacja” w wierszach tabeli skrótu 0 (w dzienniku 1
  — kontrola); wierszy ryzyk 20 = 20. „Czeka na człowieka” nieobecna (nic przeterminowanego).
  Fixtura starego projektu (CRLF, `## 2.`, `## **Co dalej**`) → pięć linii „brak …”, kod 0.
- „Czeka na człowieka”: ta sama fixtura z datą 2026-08-01 → sekcja jest, z 2026-10-20 → nie ma.
- `grep` dawnej listy (9 wzorców) w 11 kopiach: HEAD `b5b843b` 11/11 plików z trafieniem, po
  zmianie 0; polecenie skrótu w 11/11.
- Sesja B: `Bash node .claude/relai/tools/start-digest.js`, zero odczytu `docs/STATE.md`; wyjście
  55 KB poszło do pliku `tool-results`, model przeczytał z niego ok. 14 KB (L-0296).
- Dowód negatywny: `git diff --stat b5b843b` na `adapters/claude-code/hooks/prompt-mode*`,
  `core/process/prompt-mode.js`, `adapters/claude-code/commands/relai-prompt.md`, `docs/LEKCJE.md`
  → nic przed dopisaniem lekcji; sekcja „Zasady aktywne” identyczna z HEAD (`diff`), także po
  L-0296–L-0298. Kontrola pozytywna na `core/process/` → 2 pliki.
- Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E2/`: przed — 5 pozycji, 386 859 B (wyjścia
  sesji A i B, skrypt `do-lf.js`); po — skasowany po „tak” Łukasza, 0 pozycji. Poza katalogiem:
  worktree `%TEMP%/relai-E2-przed/RelAI` (114,3 MB) — usunięty (`git worktree remove`, `prune`);
  `%TEMP%/relai-digest.txt` i `relai-plan.txt` skasowane; znaczniki
  `relai-ustawienia-podane-test-rytual*` z testu hooka — test sprząta je sam; transkrypty
  `21d9e44a` (`~/.claude/projects/C--Users-Lukasz-AppData-Local-Temp-relai-E2-przed-RelAI/`)
  i `137a0d75` zostają jako dowód pomiaru.
- Końce linii: pięć plików z CRLF na dysku przy LF w indeksie znormalizowanych do LF (L-0297);
  po normalizacji diff realny: 18 plików, +187/−171 przed dokumentami.

**Świadomie odłożone:**

- Skrót na tym repo ma 55 KB i przekracza limit wyjścia polecenia. Model czyta go kawałkami
  i gubi „Zasady aktywne” (L-0296). Indeks zasad w E4 zdejmuje ok. 25 KB. Prompt E4 ma sprawdzić,
  czy skrót mieści się w limicie, i zmierzyć, ile wyjścia trafia do kontekstu.
- Pomiar „po” to jedna para sesji `-p` bez szumu i bez trybu interaktywnego; pełny pomiar na trzech
  sesjach i w projekcie użytkownika to E5.
- Codex i Cursor nie mają osobnej obsługi kompakcji (pole `source` niezmierzone w ich payloadzie).
- Szkice z sesji planowania w `.claude/relai/work/KONTEKST_STARTU/` (5 plików, ok. 73 KB) — nie
  należą do E2, zostają do zamknięcia planu.
- `docs/KOMENDY.md` bez zmian — fraza „kontynuujemy pracę” nadal „odtwarza kontekst z dokumentów”.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — KONTEKST_STARTU E3: bramka trybu ciągłego w dwóch krokach

Etap wg [PROMPT_ETAP_3.md](plany/KONTEKST_STARTU/PROMPT_ETAP_3.md), sesja Opus 5.5, HEAD `fe81391`.
Na starcie etapu bramka (stara) zadała tej sesji trzy pytania naraz na „Tak, zaczynamy” —
odpowiedź „nie”.

**Zrobione:**

- **Bramka w dwóch krokach** (`core/process/prompt-mode.js`, hook
  `adapters/claude-code/hooks/prompt-mode.js`): pierwsze okno pyta wyłącznie o zgodę (trzy opcje
  „i nic więcej”); po „nie” — wykonanie promptu bez kolejnych pytań i bez czytania procedury. Część
  „po (1) i (2)” to reguła trybu ciągłego: model nieznany → drugie, osobne pytanie o model
  i zasięg; nazwa z listy → delegacja do `relai-prompt-optimizer`; `model sesji` albo brak listy →
  sesja przerabia sama z plików doczytywanych. Żadne brzmienie nie odsyła do całej komendy.
- **Model „na tę sesję”** — pole `"model"` we własnym pliku zgody sesji
  (`.claude/relai/zgoda-promptu/<id>.json`, L-0189: jeden zapisujący, bez scalania), opisane
  w nagłówku modułu. Nowe `modelSesji`, `modelOptymalizatora` (nazwa z wiersza `· nie pytaj`,
  projekt przed globalnym); nazwa wpuszczana do reguły tylko w kształcie nazwy z listy.
- **Podział `relai-prompt.md`** (30 115 → 16 174 B): Kroki 1b i 6 → `core/prompt/PRZYGOTOWANIE.md`
  (wykonuje sesja, także przy delegacji), Kroki 2–5 i 7–11 → `core/prompt/PROCEDURA.md` (czyta
  agent; sesja tylko bez delegacji). W rdzeniu sekcja-drogowskaz; zdania o bramce, zasięgu
  `ta sesja`, zakazach i „Dawniej” poprawione na dwa kroki. Kopia w `.claude/relai/prompt/` tą
  samą drogą co reguły (`provisionPrompt`). Agent czyta najpierw `PROCEDURA.md`. Skill Codeksa
  `relai-prompt` odtworzony generatorem.
- **Testy:** nowe `prompt-gate.test.js` (7) — stany mierzone na hooku: brak zgody, „nie”, „tak”
  bez modelu, „tak” z modelem w sesji (też `model sesji` i nazwa spoza kształtu), globalne
  „nie pytaj” z wierszem i bez, wiersz projektu, brak listy, filtr pomijania. W
  `prompt-mode.test.js` trzy testy starego kontraktu (2.7.0: jedno okno, odesłanie do komendy)
  przepisane na nowy, plus test odczytu modelu.
- Dokumenty: `ARTEFAKTY.md` — `PRZYGOTOWANIE.md` 1, `PROCEDURA.md` 1, `/relai-prompt` 14, agent 5,
  `SPEC_USTAWIENIA` 18 (akapit o dwóch krokach przy `Zgoda na optymalizator`); `KOMENDY.md` —
  punkt „Od 2.7.0 pytanie jest jedno” zastąpiony opisem dwóch kroków. Lekcje L-0299–L-0301.

**Pomiar na żywo** (2026-10-28, Łukasz klikał, `claude --plugin-dir` + instalacja wyłączona
`--settings`; „po” = repo, „przed” = worktree `fe81391`; projekty `%TEMP%/relai-e3-pomiar/s1…s7`,
ten sam prompt „przeczytaj notatki.md i streść go w dwóch zdaniach, dodając jedno ryzyko”).
Liczone skryptem z katalogu roboczego tak jak `start-context.js`, ale z lokalnymi komendami poza
licznikiem poleceń (L-0299). **Model:** s1–s5 i s7 na Sonnet 5.5 (w sesji padło `/model`, L-0300),
s6 na Opus 5.5 — więc porównanie tylko w obrębie Sonneta.

| Sesja | Kod | Stan i odpowiedzi | Koniec 1. tury | Wobec s1 | Dowód z transkryptu |
|---|---|---|---|---|---|
| s1 `c822eb7b` | po | tryb wyłączony (baza) | 48 444 | — | brak `AskUserQuestion` |
| s2 `c04ad143` | po | brak zgody → „nie” | 49 741 | **+1 297** | 1 okno, 1 pytanie; plik `{"decyzja":"nie"}`; prompt wykonany |
| s4 `70751df5` | przed | brak zgody → „nie” | 67 957 | **+19 513** | odczyt `relai-prompt.md` i listy **przed** pytaniem; 1 okno, 3 pytania |
| s3 `ce7e063e` | po | „tak” → `model sesji`, `ten prompt` | 71 256 | +22 812 | 2 osobne okna (1 i 2 pytania); odczyt `PRZYGOTOWANIE`, `PROCEDURA`, nakładki, `SZABLONY`; propozycja z markerami |
| s5 `c9fee6d1` | przed | „tak” + `model sesji`, `ten prompt` | 51 892 | +3 448 | **przebieg niezgodny z procedurą** (L-0301): bez odczytu `relai-prompt.md`, propozycja bez markerów — nie jest „przed” |
| s7 `b419abca` | po | wiersz `Sonnet 5.5 · nie pytaj` → „tak” | 55 785 | +7 341 | 1 okno; delegacja `relai-prompt-optimizer`, model `sonnet` |
| s6 `e9da6b41` | po | „tak” → Sonnet 5.5, `ta sesja`; drugi prompt | 55 505 (Opus) | — | 2 osobne okna; plik `"model":"Sonnet 5.5"`; drugi prompt: 0 pytań, delegacja |

Koszt odpowiedzi „nie”: **+1 297** tokenów (po) wobec **+19 513** (przed) — FAKT, jedna para,
bez pomiaru szumu. „Tak + model sesji”: **+22 812** (po, Sonnet) obok **+26,7 tys.** z ANALIZY
(przed, Opus, inna sesja) — FAKT dla każdej liczby, porównanie SZACUNEK (inny model). Droga
domyślna po „tak” — delegacja — kosztuje sesję +7 341 (s7).

**Zweryfikowane — jak dokładnie:**

- `node --test core/process/tests/*.test.js` → 348/348 (było 340; +7 bramki, +1 odczytu
  modelu); `core/panel/tests` → 225/225; `adapters/codex/tests` → 24/24;
  `validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit`, sprzed etapu) —
  ostrzeżenie `relai-prompt.md` 30 115 B zniknęło; `generate-skills.js` → „spojne”.
- Obie wersje: `prompt-gate.test.js` w worktree `fe81391` (`core.autocrlf=false`) → 2 pass /
  5 fail (przechodzą „nie” i filtr — działały przed etapem); na zmianie 7/0. Przyczyny porażek
  sprawdzone: brak delegacji, brak `PROCEDURA.md`, model w pierwszym oknie. Dwa testy zielone na
  HEAD wywrócone mutacjami pisanymi dla nich: M1 („nie” nie wycisza) → test „nie” pada, M2 (filtr
  nic nie pomija) → test filtra pada, M3 (model w pierwszym oknie) → 2 testy padają; bez mutacji
  0 fail.
- Podział: skrypt porównania — 11 sekcji przeniesionych, 0 rozjazdów (każda dosłownie w nowym
  pliku, żadna w rdzeniu); nagłówki 18 przed = 7 + 2 + 9 zaraz po podziale; bajty bloku 15 899 =
  5 462 + 10 437. Po dopisaniu nagłówków plików i drogowskazu: rdzeń 8, `PRZYGOTOWANIE` 3,
  `PROCEDURA` 10.
- Dowód negatywny: `git diff --stat fe81391` na `core/process/start-digest.js`, 13 kopiach
  rytuału (`CLAUDE.md`, `AGENTS.md`, hooki `session-context` trzech adapterów, `SKILL.md`
  `relai-core` ×2, `relai-core.mdc`, `SPEC_CLAUDE_MD`, `relai-stage.md` + skill Codeksa,
  `SPEC_KOMENDY`) i `docs/LEKCJE.md` przed dopisaniem lekcji → nic; kontrola pozytywna na
  `core/process` → 2 pliki. Lekcje dopisane po L-0298, poza sekcją „Zasady aktywne”.
- Końce linii: `core/process/prompt-mode.js` po edycji `w/crlf` przy `i/lf` — 438 CRLF → LF
  (L-0297); po normalizacji diff realny.
- Pliki zgody w projektach pomiarowych (`przygotuj-pomiar.js --stan`): s2 i s4 `nie`, s3, s5, s7
  `tak` bez modelu, s6 `tak` + `"model":"Sonnet 5.5"`.
- Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E3/` (`clean-work.js raport`: chroniony
  „etap trwa”): przed — 9 pozycji, 119 135 970 B, 1 579 plików (worktree „przed” `fe81391`,
  skrypty `podziel.js`, `mutacje.js`, `przygotuj-pomiar.js`, `analiza-pomiaru.js`, `do-lf.js`,
  `wstaw-zasady.js`, kopia `relai-prompt.przed.md`, wyniki TAP i analizy); po „tak” Łukasza —
  worktree `git worktree remove` + `prune`, katalog skasowany, 0 pozycji. Poza katalogiem:
  `%TEMP%/relai-e3-pomiar` (7 projektów, ok. 7 MB) skasowany poza pustym folderem `s7` (0 B,
  zablokowany przez otwarty terminal); `%TEMP%/relai-plan-e3.txt`, `relai-val.txt`,
  `relai-e3-core.tap`, `relai-digest-e3.txt` skasowane; transkrypty s1–s7
  (`~/.claude/projects/C--Users-Lukasz-AppData-Local-Temp-relai-e3-pomiar-s*`) zostają jako
  dowód pomiaru; kopia `~/.claude/settings.json.bak-2026-10-28-e3` zostaje.

**Świadomie odłożone:**

- **Filtr potwierdzeń** nie przepuszcza „Tak, zaczynamy” (lista zamknięta całych promptów);
  poszerzenie to decyzja Łukasza (zasada 7) — odłożone jego decyzją z 2026-10-28.
- `core/tools/start-context.js` liczy lokalne komendy jako polecenie (L-0299) — poprawka
  instrumentu przed pomiarem E5.
- s6 w pierwszej turze oddał prompt agentowi bez odczytu `PRZYGOTOWANIE.md` (bez linii „Model
  docelowy”), w drugiej przeczytał — dyscyplina modelu; do obserwacji w E5.
- „Tak + model sesji” zszedł tylko o ok. 4 tys. — sesja i tak czyta `PROCEDURA`, `SZABLONY`
  i nakładkę; zysk planu stoi na „nie” i na delegacji.
- Folder bez struktury RelAI: pełna procedura tylko przez agenta (własny rdzeń reguł); Codex poza
  projektem jej nie ma. Krok 9 (pytanie o język z zapisem) w `PROCEDURA.md` nie pasuje do agenta
  bez narzędzi zapisu — rozjazd sprzed etapu, przeniesiony bez zmian.
- Pomiar na jednej parze sesji, bez szumu; pełny pomiar trzech sesji — E5.
- Lekcje L-0299–L-0301 bez odświeżenia destylatu „Zasady aktywne”: rytuał „Na koniec” skilla
  `relai-planning` każe go odświeżyć, prompt E3 zakazuje (to zakres E4, punkt 7 Weryfikacji) —
  rozjazd rozstrzygnięty na rzecz promptu etapu; E4 obejmie te lekcje indeksem.

**Do zrobienia przez człowieka:**

- **Zamrożenie bramek zgody jako decyzji** (sprawa z „Czeka na człowieka” z 2026-09-15) —
  proponowane brzmienie: *„Każde zachowanie proaktywne RelAI pyta najpierw wyłącznie o zgodę:
  tryb ciągły raz na sesję (ta sesja / nie pytaj więcej / nie), propozycja struktury poza
  projektem raz na maszynę. Po »nie« nie pada żadne kolejne pytanie i nic nie jest czytane;
  pytania dodatkowe (np. model i zasięg) padają wyłącznie po »tak« i tylko wtedy, gdy odpowiedź
  nie jest zapisana. Zgoda sesyjna — plik na sesję, trwała — wiersz w ustawieniach globalnych.”*
  Decyzja Łukasza: zamrozić (wpis do `DECYZJE.md`), poprawić brzmienie albo odrzucić.
- Domyślny model nowych sesji Claude Code zmieniony w trakcie pomiaru na Sonnet
  (`~/.claude/settings.json`, `"model": "sonnet"`) — przywrócić, jeśli niezamierzone.
  *(rozstrzygnięte 2026-10-28 — Łukasz: przywrócić Opus; `"model": "opus"`, kopia pliku
  `settings.json.bak-2026-10-28-e3`)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-28 — KONTEKST_STARTU E4: „Zasady aktywne” jako indeks z wyzwalaczami

Etap wg [PROMPT_ETAP_4.md](plany/KONTEKST_STARTU/PROMPT_ETAP_4.md), sesja Opus 5.5, HEAD `b3a1132`,
z Aneksami C i D (decyzje Łukasza w trakcie etapu, [STATUS](plany/KONTEKST_STARTU/STATUS.md)).
Bramka trybu ciągłego (kopia 3.6.0 z marketplace, stary kształt) zadała na „Tak, zaczynamy” trzy
pytania naraz — odpowiedź „nie w tej sesji”.

**Zrobione:**

- **Aneks A do D-15** w `docs/DECYZJE.md` — po „tak” Łukasza na brzmienie, przed pierwszą zmianą
  kodu i rejestru.
- **Indeks w `docs/LEKCJE.md`:** sekcja „Zasady aktywne” ma `### Indeks` (15 linii
  `- **N · tytuł** — wyzwalacz`, 3 443 B; zasada 14 w pełnym brzmieniu, bo obowiązuje w każdym
  zadaniu) i `### Pełne brzmienie` (15 zasad). Linie indeksu zaczynają się od `- `, bo
  `count-rules.js` liczy `^\d+\.` w całej sekcji — dalej 15 / 15.
- **`core/process/start-digest.js`:** z „Zasad aktywnych” wypisuje sam indeks ze zdaniem
  wykonawczym („zanim pierwszy raz zmienisz plik, porównaj zadanie z wyzwalaczami; trafienie =
  Read pełnego brzmienia”); projekt bez indeksu albo z pustym — cała sekcja. Indeks stoi zaraz
  po STATE (Aneks C), a przy wyjściu ponad 28 tys. znaków ostatni wpis dziennika skraca się do
  początku z linią `[wpis skrocony do N z M znakow; calosc: …]`. Drogowskaz do pełnego brzmienia.
- **Warstwa stała (Aneks D):** zdanie o porównaniu z wyzwalaczami w rytuale startu `CLAUDE.md`
  i `AGENTS.md`.
- **Specyfikacje i skille:** `SPEC_LEKCJE` (struktura z indeksem, czytanie, przykład Parkly,
  „Dawniej”), `SPEC_USTAWIENIA` (człon `zasady` liczy indeks; skrócony wpis w pozycji `ryzyka`),
  `SPEC_ARCHIWUM` (nietykalne indeks i pełne brzmienie), skill `relai-core` (Claude Code, Codex
  z generatora) i reguła Cursora — zdania o tym, co czyta start i jak dopisać zasadę.
  `session-signals.js` — tylko komentarz przy progu `zasady` (wartość 30 KB bez zmian, E5).
  `ARTEFAKTY.md`: `SPEC_LEKCJE` 3, `SPEC_ARCHIWUM` 6, `SPEC_USTAWIENIA` 19, skill `relai-core` 28,
  reguła Cursora 8. `KOMENDY.md` bez zmian — człowiek nie widzi innej komendy ani frazy.
- **Testy** `start-digest.test.js` (+5): indeks zamiast pełnej treści z kontrolą pozytywną na
  projekcie bez indeksu; warianty nagłówka (pogrubiony, numerowany, angielski, CRLF) i pusty
  indeks; pozycja budżetu `zasady` liczy indeks; skrócenie długiego wpisu z kontrolą na krótkim;
  indeks przed ryzykami i wpisem. Test kolejności pozycji budżetu poprawiony na nową kolejność
  (skutek Aneksu C).
- **Lekcje** L-0302 (powtórka L-0298: gołe `cd`) i L-0303 (ewaluacja bez asercji dostarczenia);
  destylat w nowym kształcie — L-0296–L-0303 w pełnym brzmieniu zasad 4, 5, 11 i 13.

**Zweryfikowane — jak dokładnie:**

- `node --test core/process/tests/*.test.js` → 353/353 (było 348); `core/panel/tests` → 225/225;
  `adapters/codex/tests` → 24/24; `validate-adapters.js` → kod 0; `generate-skills.js` →
  „spojne”; `ritual-copies.test.js` → 3/3.
- Obie wersje: nowe testy skrótu w worktree `b3a1132` (`core.autocrlf=false`) → 7 pass / 6 fail
  (pięć nowych i kolejność budżetu); na zmianie 13/0. RED przed implementacją widziany też w tej
  sesji (8/3, potem 11/2, potem 12/1).
- Indeks: 3 443 B (`Buffer.byteLength` wyciętej podsekcji). Pełne brzmienie porównane ze stanem
  sprzed etapu — identyczne (29 951 B) przed dopisaniem lekcji do destylatu; reszta pliku poza
  sekcją identyczna; nagłówki 33 → 37 (+2 podsekcje, +2 lekcje). Po odświeżeniu destylatu sekcja
  34 423 B.
- Skrót startu na tym repo: **60 489 B / 58 094 znaki → 29 056 B / 27 946 znaków** (FAKT,
  2026-10-28, po odświeżeniu destylatu i z nowym wpisem jeszcze niedopisanym).
- **Ewaluacja wyzwalania** — własny skrypt w katalogu roboczym (powód: `eval-triggers.js` mierzy
  skille w fixturach, a tu trzeba realnego `LEKCJE.md` repo i miary odczytu pliku spoza skilla),
  świeże sesje `claude -p --plugin-dir` repo, instalacja wyłączona `--settings`, Edit/Write
  zabronione, Bash tylko dla skrótu, zgoda trybu ciągłego „nie” podłożona per `--session-id`.
  Wszystkie 18 sesji: model `claude-opus-5-5`, kod 0, edycje odrzucone (`git status` bez zmian).
  Miara: `Read`/`Grep` na `docs/LEKCJE.md` obejmujące wiersz zasady.

  | Przebieg | Warunki | Z wyzwalaczem | Bez | Uwagi |
  |---|---|---|---|---|
  | 1 | skrót 34 116 B, pluginy użytkownika | 0/3 | 0/3 | skrót we wszystkich sesjach jako podgląd 2 190 znaków — indeksu nikt nie widział (L-0303) → Aneks C |
  | 2 | skrót 29 002 B, `--setting-sources project,local`, `--strict-mcp-config`, 21 narzędzi w `init` | 1/3 (T3) | 0/3 | dostarczenie w całości (28 248 znaków wyniku); T1 pytał o niezgodność polecenia z kodem, T2 oparł się na regule backslasha z `CLAUDE.md`; N1, N2 bez skrótu → Aneks D |
  | 3 | jak 2 + zdanie w warstwie stałej; negatywy „kontynuujemy pracę”, „sprawdź status”, autor wpisu | **3/3** | **0/3** | T1 `Grep ^15\. -A 30`, T2 `Read` l. 51–250 (zasada 5 od l. 125), T3 `Grep „Próg jest liczbą” -A 14`; wszystkie sześć z indeksem w całości (28 323 znaki) |

  Scenariusze: T1 kolor paska `relai-progress` (zasada 15), T2 regex nagłówka archiwum
  w `rotate.js` (zasada 5), T3 próg `zasady` 30 → 6 KB (zasada 6). Pluginy w `init` przebiegów 2–3:
  `relai` z repo, mody z `.claude/settings.local.json` projektu, dwa wbudowane.
- Dowód negatywny: `git diff --stat` na `core/process/prompt-mode.js`, `core/prompt/`
  i hooku `prompt-mode.js` → nic; kopie rytuału (`CLAUDE.md`, `AGENTS.md`, skille, reguła
  Cursora) zmienione wyłącznie w zdaniach o „Zasadach aktywnych”, `CLAUDE.md` i `AGENTS.md`
  identyczne w sekcji rytuału.
- Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E4/` (`clean-work.js raport`: „etap
  zamknięty”): przed — 1 pozycja, 116,3 MB (worktree „przed” `b3a1132`, skrypt
  `eval-indeks.js`, transkrypty trzech przebiegów, kopie `LEKCJE`/zasad „przed”, wyjścia skrótu);
  po „tak” Łukasza — `git worktree remove` + `prune`, katalog skasowany, 0 pozycji. Poza
  katalogiem: transkrypty 18 sesji ewaluacji w `~/.claude/projects/C--Users-Lukasz-Desktop-RelAI/`
  zostają jako dowód; pliki zgody per sesja skasowane przez skrypt po każdej sesji.

**Świadomie odłożone:**

- Wartość progu `zasady` (30 KB) i budżetu startu — E5, decyzja Łukasza.
- `SPEC_CLAUDE_MD.md` (szablon rytuału dla innych projektów) bez zdania z Aneksu D — w innych
  projektach zdanie niesie nagłówek indeksu w skrócie; czy dopisać je też do szablonu, do pomiaru
  w E5.
- Ewaluacja na jednym przebiegu po poprawce, bez szumu; Sonnet nie mierzony.
- Kopia narzędzi w `.claude/relai/tools/` nadpisywana przez plugin 3.6.0 przy starcie (L-0294) —
  hook startu liczy budżet starym skrótem (zasady 32,7 KB) do wydania.
- Wpis dziennika ponad 28 tys. znaków skrótu traci koniec — model ma drogowskaz; czy krótsze
  wpisy, do obserwacji.
- `SPEC_PROMPT_ETAPU.md` każe przepisać „Zasady aktywne” do promptu w całości; `PROMPT_ETAP_5.md`
  niesie indeks w całości i pełne brzmienie tylko zasad 2, 6, 10 (pozostałe z wyzwalaczem —
  doczytywane), bo pełna sekcja ma 34 KB. Specyfikacja do przepisania na indeks — poza zakresem
  planu (wątek do decyzji: odnoga albo aneks).

**Do zrobienia przez człowieka:**

- **Graduacja L-0298/L-0302 do `CLAUDE.md`** (powtórzenie): „W poleceniu Bash nigdy gołe `cd` —
  ścieżka w argumencie albo podpowłoka `( cd … && … )`.” Decyzja Łukasza: dopisać czy nie.

Autor: RelAI (Opus 5.5) + Lukasz
