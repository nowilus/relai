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
| T1 | Scena 3D strony tnie się na słabszym laptopie albo zintegrowanej grafice (plan STRONA_RELAI, ryzyko 1) | **Średni** (2026-10-18 po E6; wcześniej wysoki) | **OTWARTE** | E1: render na żądanie, DPR ≤ 1,5, obniżenie jakości przy medianie > 26 ms. E2 (scena CC0, AO, głębia ostrości): przy CPU ×4 mediana 11,1 ms, p95 16,7 ms, 913 wywołań rysowania na klatkę po scaleniu miasta (przed: 2206, p95 22,3 ms); obniżanie jakości zaczyna od głębi ostrości. E3 (poświata ekranu RectAreaLight, nowe książki): przy CPU ×4 przewijanie mediana 11,9 ms, p95 22,2 ms — p95 wzrosło o 5,5 ms, zapas do 26 ms już tylko 3,8 ms; przybliżanie p95 13,1 ms; najwięcej 907 wywołań rysowania na klatkę. Zmierzone tylko na RTX 4070 Ti. E4 (bez path tracingu, przygaszona lampa, lakier blatu): CPU ×4 mediana 11,3 ms, p95 17,5 ms, najwięcej 910 wywołań rysowania. Otwarte: słaba grafika w E7. E5 (Film, bez WebGL): przy CPU ×4 mediana 5,6 ms, p95 5,6 ms, najdłuższa klatka 28,7 ms, więc Filmu ryzyko nie dotyczy. Aneks D: Biurko też idzie do publikacji, dlatego poziom zostaje wysoki do pomiaru na słabej grafice w E6. E7 (Film z animacjami WAAPI i przytrzymaniem): CPU ×4 mediana 11,1 ms, p95 16,7 ms na desktopie i w emulacji telefonu — Filmu nadal nie dotyczy; poziom bez zmiany przez Biurko. E6: SwiftShader (grafika programowa) 1366 × 768 mediana 1 700 → 1 183 → 817 ms po krokach obniżania, 390 × 844 1 033 → 867 → 433 → 283 ms; wyłącznik `biurko/grafika.js` daje takiej przeglądarce plakat (werdykt Łukasza 3A), brak WebGL2 i ograniczony ruch też. RTX przy CPU ×4: p95 przewijania 20,6–25,2 ms desktop, 15,4–16,3 ms telefon. Otwarte: zintegrowana karta niezmierzona (bramka „pomiar na słabszym laptopie”); drugi bezpiecznik (plakat po wyczerpaniu kroków jakości, opcja 3B) świadomie niewdrożony. |
| T2 | Biurko wygląda jak tani render albo glina z AI (plan STRONA_RELAI, ryzyko 2) | **Średni** (2026-10-18 po E6; wcześniej wysoki) | **OTWARTE** | E2: modele i tekstury CC0, deski orzechowe ze słojami, miasto za oknem, kubek i tablica od nowa; kalibracja w czterech rundach, zamknięcie za zgodą Łukasza, ale „nadal jesteśmy całkiem daleko” od obrazów 01–08 — przyczyna: brak światła odbitego w rasteryzacji (L-0220). Aneks B: E3 laptop i detale, E4 path tracing na przystankach. E4 (2026-10-16): światło odbite nie dało uzysku — przyczyną dystansu jest detal przedmiotów, tekstur i kompozycja, nie światło (L-0226); test detalu (blat `wood_table_worn`, druk na dokumentach, ciemniej) dał umiarkowany zysk. Aneks C: następny jest Film, Biurko po bramce. E5: Film rysowany kodem, hero przyjęte w trzeciej rundzie („Tak, przyjmuję”). Bramka z Aneksem D: najpierw dopieszczenie Filmu (E7), potem pełna droga Biurka (E6), publikacja obu z ankietą. Dla Biurka ryzyko zostaje wysokie. E7: Film dopieszczony i przyjęty akt po akcie („Tak, przyjmuję”), dotyczy już tylko Biurka (E6). E6: każdy przystanek, szczyt, mapa, szuflady, telefon, zasłona i plakat przyjęte przez Łukasza na kadrach przed i po; kontrola odczuć zgodna z krzywą briefu (4A). Otwarte do ankiety po publikacji (E8): czy odwiedzający odbierają Biurko jako dopracowane. |
| T3 | Modele CC0 z różnych źródeł nie zgrywają się stylem i skalą; strona za ciężka (plan STRONA_RELAI, Aneks A pkt 6) | **Niski** (2026-10-16 po E2; wcześniej średni) | **OTWARTE** | E2: wspólne HDRI, skala w metrach, barwy modeli przyciemnione do sceny — Łukasz nie zgłaszał niespójności stylu; ciężar 9,0 MB z kompresją (FAKT), zestaw hero 4,5 MB, pułap podniesiony do 10 MB decyzją Łukasza (Aneks B). E4: 9,49 MiB (+0,38 MiB — blat `wood_table_worn` ma więcej szczegółu); path tracera nie ma. E5: Film 0,31 MiB po kompresji (33 pliki, FAKT), ten sam instrument; ciężar dotyczy tylko Biurka. E7: Film 0,317 MiB (35 plików, FAKT). E6: Biurko 9,522 MiB, 118 plików (start etapu 9,493 MiB, ten sam instrument); plakaty 0,17 MiB pobierane tylko bez sceny; ograniczony ruch i słaba grafika nie pobierają sceny wcale. |
| T6 | Ekran HTML na laptopie rozjeżdża się ze sceną 3D przy przybliżeniu (plan STRONA_RELAI, Aneks B pkt 5) | **Niski** (2026-10-16 po E3; wcześniej średni) | **ZAMKNIĘTE 2026-10-18** | Zrzuty w trzech rozdzielczościach, test trafienia kliknięciem (`elementFromPoint`) w każdym położeniu przybliżenia; w E3. E3: HTML położony dokładnie na siatce (bez przesunięcia w głąb), różnica narożników ≤ 0,04 px przy 1366 i 1920, PL i EN, na przystanku i w przybliżeniu; `elementFromPoint` 5/5; poza przybliżenia testowana dla 16:9, 16:10 i 4:3. Otwarte: telefon i wąskie okno. E7 dopieścił telefon tylko w Filmie (osobna kompozycja ≤ 600 px, `scrollWidth` = 390 w każdym akcie); telefon Biurka przeszedł do E6 (Aneks D pkt 2). E6: telefon Biurka ma pozy pionowe i kartę „Wyślij sobie link” zamiast ekranu z konfiguratorem; `scrollWidth` = 390 na każdym przystanku i przy każdej otwartej szufladzie, PL i EN; usterka oddalenia przed `tryb-3d` naprawiona (L-0241). Zamknięte. |

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

- **Powiadomienie w tle bez bramki zgody** — po wydaniu sprawdzić w sesji interaktywnej, że
  zakończone zadanie w tle nie dostaje pytania o zgodę (Aneks H) · 2026-09-24 · [wpis 2026-09-24 — E6](archiwum/dziennik/DZIENNIK_2026-09-14_2026-10-09.md#2026-09-24--e6-planu-prowadzenie_end_to_end-krańce-drogi-bez-wydania)

- **Jedno okno pytań na starcie w sesji interaktywnej** — po wydaniu przy zamknięciu planu
  PROWADZENIE_END_TO_END sprawdzić, że bramka trybu ciągłego pyta o zgodę i model w jednym oknie
  (Aneks F) · 2026-09-24 ·
  [wpis 2026-09-24 — E5](archiwum/dziennik/DZIENNIK_2026-09-14_2026-10-09.md#2026-09-24--e5-planu-prowadzenie_end_to_end-pierwsze-30-minut-bez-wydania)

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

### 2026-10-14 — SPLIT_VIEW: paski w każdym panelu podziału, linia w stopce wycofana; `relai-panel` 0.17.0 / `relai-cache-keeper` 0.9.0

**Zrobione:**

- Pomiar na żywo z Łukaszem (aplikacja 2.37337.1.0, Claude Code 2.1.295): dwa panele obok siebie,
  dwa jeden nad drugim, trzy obok siebie, sesja RelAI w prawym panelu z `/relai-panel`. Paski
  w każdym panelu, `Pane` w prawym. Wersje aplikacji i CLI te same co przy błędzie — poprawka po
  stronie strony zakładki Code (claude.ai) po zamknięciu anthropics/claude-code#99265.
- Linia w stopce wycofana: `cache-keeper/hooks/register.tsx` bez `pushFooter`, zamiast niej
  jednorazowe `$.ui.status(undefined)` (stara linia przeżywa przeładowanie, P-040 pkt 6);
  `panel/hooks/register.tsx` bez `publishFooter` (4 wywołania); `core/panel/footer.mjs` i trzy kopie
  usunięte, test parytetu zgodny (16 plików rdzenia). Testy: `footer.test.ts` sprawdza jedno
  czyszczenie i brak nowej linii; testy panelu — brak zapisu do `stopka/`.
- Dokumenty: P-040 → ROZWIĄZANA, STYL v3.8 (§12 wycofany, historia zostaje), README (każda sesja
  w podziale ma własne paski i panel; etap w nowej sesji obok bieżącej), dopisek w karcie
  PASKI_W_STOPCE, `ARTEFAKTY.md`, L-0193. KOMENDY nie wspominały linii — bez zmian.
- Wydanie `relai-panel-v0.17.0` (commit `b4e96a7`): `relai-panel` 0.17.0, `relai-progress` 0.4.2,
  `relai-cache-keeper` 0.9.0 (notatka obejmuje też niewydane osobno 0.8.0).

**Zweryfikowane — jak dokładnie:**

- Kontrola pozytywna na HEAD przed zmianą: `pushFooter|footerPath|footerPlan|stopka/` w kodzie
  `panel progress cache-keeper core` — trafienia w 10 plikach; po zmianie 0 (trzy trafienia w testach
  panelu usunięte razem z filtrami).
- `claude plugin validate .` i `claude plugin test .` binarką aplikacji 2.1.295: cache-keeper
  179/179 (4 testy linii → 2 testy wycofania), panel 178/178, progress 31/31; rdzeń `node --test`
  386/386; adaptery 15/15; `validate-adapters.js` kod 0; `sync-panel-core.js --check` zgodne.
- Po `plugin update`: `register.tsx` w `~/.claude/plugins/cache/relai/relai-cache-keeper/0.9.0`
  i `relai-panel/0.17.0` — suma po CRLF → LF równa repo, 0 trafień `pushFooter|publishFooter`.
- Po restarcie aplikacji: stopka obu paneli pusta (zrzut `SPLIT_VIEW_5_stopka-pusta-po-0.9.0.webp`).
- Katalog roboczy: raport — `_fixy/SPLIT_VIEW` chroniony (odnoga otwarta), 1 plik 4 KB; po „tak”
  `clean-work.js kasuj` razem z `.claude/relai/stopka/` (17 plików, 25 KB) — przed 29 KB, po 0.
  Poza projektem: `%TEMP%\relai-split-kasuj.json` (lista do kasowania).

**Świadomie odłożone:**

- Panel RelAI w wąskim panelu podziału: tekst i przyciski „Otwórz” wychodzą poza kafle, kafle bez
  odstępów, ramki nachodzą na siebie (zrzut Łukasza 2026-10-14). Odnoga z wnętrza SPLIT_VIEW
  zakazana (L-0193) — decyzja o formie po zamknięciu.
- Typografia modów (`Text size/weight/mono/tabular`), rozbicie `register.tsx`, porządki P-023 —
  plan, gdy aplikacja dostanie Claude Code ≥ 2.1.299. Stan 2026-10-14: aplikacja 2.37337.1.0
  „najnowsza” w sprawdzaniu aktualizacji, nadal z 2.1.295; `claude update` aktualizuje tylko CLI
  w terminalu (2.1.299), nie kopię aplikacji.
- P-040 pkt 3 (`SessionMode`, `PromptHint`) niezmierzony ponownie.
- `docs/LEKCJE.md` 50,2 KB — ponad budżet 50 KB po L-0193; rotacja lekcji należna.

**Do zrobienia przez człowieka:** brak — pluginy zaktualizowane i aplikacja zrestartowana.

- Ryzyka: tabela „Stan otwartych ryzyk” przejrzana — odnoga nie otworzyła ryzyka projektu.
- Uwaga z sesji: część odpowiedzi poszła po angielsku mimo rozmowy po polsku — błąd sesji, nie
  aktualizacji; poprawione w trakcie.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-14 — Plan WYGLAD_PANELU utworzony (do akceptacji)

**Zrobione:**

- Wywiad w dwóch rundach: pasek postępu jako lista kroków (zwinięta + „Rozwiń”, okno wokół
  bieżącego punktu, spinner + odhaczenie, chip agentów skrócony), potem kierunek kolorów — paski
  w kluczach motywu narzędzia, panel RelAI w dzisiejszej szacie ciemnej plus pełna szata jasna
  dostrajana do wybranego motywu, jeden plan na całość.
- Makieta kalibracyjna `docs/plany/WYGLAD_PANELU/MAKIETA_PASEK_POSTEPU.html` (wariant 1, trzy
  szerokości × zwinięty/rozwinięty); kierunek przyjęty przez Łukasza.
- `PLAN.html` (4 etapy: sonda nośnika i paski w kolorach narzędzia → pasek postępu jako lista →
  panel w szacie jasnej → odbiór i wydanie; 6–9 sesji, SZACUNEK) i `STATUS.md`; wiersz w tabeli
  „Stan prac” w `CLAUDE.md`, akapit w `STATE.md`.

**Zweryfikowane — jak dokładnie:**

- Makieta: 6 kart, 0 elementów poza kartą; kontrola pozytywna (podłożony chip o 90 znakach) — 2
  trafienia w tym samym przebiegu; po poprawce progu nagłówka (640 px) nazwa punktu w toku ma 342 px
  przy 560 px zamiast 109 px.
- `PLAN.html`: builder bez niewypełnionych znaczników (kod 0, 211 KB); 12/12 bloków zwijalnych
  przełącza się; brak przewijania w poziomie przy 1200 i 420 px; tabele w swoich ramkach (po
  zdjęciu klasy `id` z pierwszej kolumny sekcji 9); napisy diagramu w swoich kartkach.
- Fakty planu z repo: 50 wartości szesnastkowych w `core/panel/theme.mjs`, 1 poza nim; 23 klucze
  motywu w typach 2.1.295; testy 178 / 31 / 179 + rdzeń 386.

**Świadomie odłożone:**

- Odnoga PANEL_WASKI miała wejść do planu jako E3 — w trakcie pisania planu okazało się, że jest
  już wykonywana w osobnej sesji (`panel/hooks/narrow.test.ts`); decyzja Łukasza: odnoga kończy,
  plan ma 4 etapy, szata jasna (E3) startuje po jej zamknięciu.
- Linia „Aktywny plan” w `CLAUDE.md` wskazuje dalej PANEL_CODEX — wybór przy akceptacji (sekcja 9
  planu).

**Do zrobienia przez człowieka:** akceptacja planu WYGLAD_PANELU i wybór planu w linii „Aktywny
plan”. *(rozstrzygnięte 2026-10-15 — plan zaakceptowany 2026-10-14, linia „Aktywny plan” na WYGLAD_PANELU do jego zamknięcia)*

- Ryzyka: tabela „Stan otwartych ryzyk” przejrzana — ryzyka planu mieszkają w jego sekcji 7.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-14 — Plan WYGLAD_PANELU zaakceptowany z Aneksem A

**Zrobione:**

- Akceptacja Łukasza z warunkiem: „będzie potrzeba przeprowadzenia tej sondy i przygotowania mi
  kilku wariantów tych wyglądów do mojej oceny i poprawy, jeśli będą uwagi” → Aneks A w sekcji 10
  planu: sonda E1 obowiązkowa i pokazana przed wariantami, po trzy warianty w prawdziwym nośniku
  w E1–E3 (motyw jasny i ciemny), rundy poprawek do zapisanej akceptacji; koszt do +1 sesji na etap
  (suma 6–12 sesji, SZACUNEK).
- `STATUS.md`: ZAAKCEPTOWANY 2026-10-14 (Aneks A), E1 GOTOWY DO STARTU z `PROMPT_ETAP_1.md`.
- Linia „Aktywny plan” w `CLAUDE.md` → WYGLAD_PANELU (prowadzony w Claude Code); PANEL_CODEX
  zostaje w tabeli i idzie dalej w Codeksie.

**Zweryfikowane — jak dokładnie:**

- `PLAN.html` przebudowany z Aneksem A: builder kod 0, 212 KB, bez niewypełnionych znaczników.
- `PROMPT_ETAP_1.md`: „Zasady aktywne” wklejone skryptem z `docs/LEKCJE.md` bajt w bajt — 15
  zasad numerowanych, tyle co w rejestrze; 0 pozostałych znaczników `{{`.

**Świadomie odłożone:** —

**Do zrobienia przez człowieka:** start E1 w świeżej sesji (`/relai-stage`) na Opus 5.5. *(rozstrzygnięte 2026-10-15 — E1 zrealizowany 2026-10-14)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-14 — PANEL_WASKI: panel bez rozjazdów w wąskim panelu podziału okna; `relai-panel` 0.18.0 w repo

**Zrobione:**

- Pomiar progów instrumentem `panel/hooks/narrow.test.ts` (pięć zakładek, zwinięte i rozwinięte,
  11 szerokości) i cztery serie zrzutów Łukasza na żywo z kopią niewydaną `relai-panel-dev`
  (odczyt `bodyColumns` na górze panelu): wąski środek trzech paneli = **31 kolumn**, dwa inne
  podziały 75 i 94. Tabela progów — szerokość „przed” to najszersza, przy której objaw występował
  w kodzie sprzed poprawki (instrument po kalibracji albo zrzut):

  | Zakładka | Szerokość | Objaw | Miejsce w kodzie | Poprawka |
  |---|---|---|---|---|
  | Komendy | ≤ 80 (31 na żywo) | „Otwórz” ucięte do „Otwó”, potem wypchnięte za kafel | `pane-commands.tsx` wiersz `row-<cmd>` bez zawijania; `Button` bez `flexShrink` | `fixed` w `pane-parts.tsx`; `textAndAct` |
  | Komendy | każda | „Ta sesja: … aktywny plan: PANEL” ucięte | `pane-now.tsx` `now-focus` (`truncate`) | zawijanie |
  | Komendy | każda (desktop) | wiersze komend ramka w ramkę | `pane-commands.tsx` `card()` — ramka na wierszu | grupa jednym kaflem, komórka odstępu między wierszami |
  | Komendy | 75 | przycisk raz obok, raz pod tekstem | `main-<cmd>` z `flexWrap` w każdym wierszu | jeden układ na panel: `STACK_BELOW = 48` |
  | Komendy | 31–34 | „przekazania /relai-handover” jednym słowem poza wierszem i podświetleniem | kawałek `Text` zaczynający się spacją | trzy kawałki w zawijanym wierszu z `columnGap` |
  | Mapa | ≤ 64 | „Aktywny plan … $8” ucięte | `pane-parts.tsx` `folded` — podsumowanie `truncate` | zawijanie |
  | Mapa | ≤ 34 | „Szczegóły” za ramką obok „bez pomiaru” | `pane-map.tsx` `st-row` | `textAndAct`, koszt i przycisk zawijane |
  | Mapa | 31 | „Teraz: E1 · Sonda nośnika …” ucięte w rysunku | `segBar` — linie `idle` w `hoverSegments` | podpis tekstem nad paskiem (decyzja Łukasza) |
  | Mapa | każda | rozwinięte szczegóły etapu przyklejone do wiersza | `st-<tag>` bez `gap` | `gap` 1 |
  | Koszty | ≤ 80 | „Cennik … odczyt 202” ucięte | `folded` — podsumowanie `truncate` | zawijanie |
  | Koszty | ≤ 42 | wiersz progu limitu poza kartą | `cost-limit-<w>-act` z `flexShrink={0}` | `flexShrink` 1, przyciski zawijane |
  | Koszty | 31 | „Rozwiń” Cennika na ramce („(platform.claude.com),”) | `folded` — długie słowo podsumowania obok przycisku | w wąskim: nagłówek i „Rozwiń” u góry, podsumowanie pod nimi |
  | Koszty, Mapa | 31–38 | „Rozwiń” za kartą obok nagłówka Kalam | `folded` — `Svg` wprost w wierszu | nagłówek w kurczliwym `Box` |
  | Koszty | 31–34 | linie przycisków progu stykają się | `cost-limit-<w>-act` bez `rowGap` | `rowGap` 1 na desktopie |
  | Pomoc | 31 | „Formularz” na ramce, opisy ucięte do „bac…” | `pane-help.tsx` `commandRow`, `clip(…, width * 2)` | `textAndAct`, pełny opis |
  | Dokumenty | każda | podpis kafla „KB · data” ucięty | `pane-docs.tsx` kafel (`truncate`) | zawijanie; nazwy plików zostają `truncate-middle` |

- Decyzje Łukasza: grupa komend jednym kaflem (zamiast odstępów między ramkami wierszy); po
  zrzucie przy 94 kolumnach komórka odstępu także między wierszami grupy — **limit 900 px zakładki
  Komendy z HUMANIZACJA E4 przestaje obowiązywać, test pilnuje 1061 px**; podpis paska etapów
  tekstem nad paskiem (wykonany nad, nie pod nim, jak mówiło pytanie — pod paskiem stoi krótka
  podpowiedź, w której miejscu po najechaniu pojawia się karta etapu; zrzut 27 i 28 zaakceptowane).
- Wersja: `relai-panel` 0.17.0 → 0.18.0 (`panel/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`); bez wydania. Dokumenty: karta odnogi, `STATE.md`, `CLAUDE.md`,
  P-043, L-0194; 30 zrzutów `docs/zasoby/PANEL_RELAI/zrzuty/PANEL_WASKI_1…30`.

**Zweryfikowane — jak dokładnie:**

- `claude plugin validate .` i `claude plugin test .` w `panel/` binarką aplikacji 2.1.295
  (P-024 pkt 4): zielone, 185/185 (było 178; +7 w `narrow.test.ts`). Ten sam wynik w `git worktree`
  HEAD-a `75dce52` z naniesionymi wyłącznie plikami odnogi — bez równoległych zmian sesji
  WYGLAD_PANELU E1 w tym samym katalogu.
- Kontrola pozytywna, ten sam `narrow.test.ts` na kodzie sprzed poprawek: na HEAD — spadają
  Komendy, Koszty, Mapa i test jednego układu; na kodzie ze zrzutów 17–23 — wiersz „Pakiet
  przekazania” (31 i 34 kolumny) i wiersz Cennika; na kodzie ze zrzutów 24–27 — pięć wierszy
  sekcji zwiniętych z nagłówkiem Kalam; przed `rowGap` — wyłącznie przyciski progu przy 31 i 34.
  Model sam ma kontrolę na podłożonych drzewach (ucięty tekst, wiersz ze zrzutu 8, sklejone
  kawałki ze zrzutu 20, ramki bez odstępu) i przypadki, które nie mogą trafić.
- Instrument przeszedł przez trzy modele, każdy obalony zrzutem: Yoga (zrzut 8: przycisk nie
  ucięty, tylko wypchnięty), CSS bez sklejania spacji (zrzut 20), `Svg` zawsze skalowane
  (zrzuty 25–26). Kalibracja znaku 6,8 px na komórkę 8,2 px: zrzut 12, „kontynuujemy pracę”
  mieści się przy 31 kolumnach.
- Budżet wagi drzewa kosztów (200 000 znaków) zachowany: zawijanie legendy tylko w wąskim panelu
  (`isStacked`), bo w szerokim przekraczało budżet o 202 znaki.
- Rdzeń `node --test core/panel/tests/*.test.js` 186/186, `sync-panel-core.js --check` zgodne
  (16 plików) — rdzeń przez odnogę nietknięty.
- Na żywo (Łukasz): zrzuty 21–24 i 28–30 bez uwag — Komendy, Pomoc, Mapa i Koszty przy 31
  kolumnach, Komendy i Pomoc przy 75 i 94.
- `grep -r 0.17.0` po podbiciu: deklaracje stanu poprawione (`STATE.md`, `CLAUDE.md`, oba
  manifesty); trafienia w dzienniku, kartach odnóg, P-040 i STYL §12 — historyczne;
  `docs/plany/WYGLAD_PANELU/PROMPT_ETAP_1.md` mówi o 0.17.0 jako stanie z chwili wygenerowania —
  prompt innego planu, nie ruszany.
- Katalog roboczy: `clean-work.js raport` — `_fixy/PANEL_WASKI` chroniony (odnoga otwarta), przed
  33 pliki, 1,5 MB (logi przebiegów testów, `make-dev.mjs`, `undo-dev.mjs`, `agg.mjs`, kopie
  kontrolne); po „tak” Łukasza skasowany — po 0. Poza projektem skasowana kopia
  `~/.claude/dev-mods/beb94a87-5d62-40a6-8d46-4b6b44e02ec0/relai-panel-dev` (2,0 MB).

**Świadomie odłożone:**

- Wydanie `relai-panel` 0.18.0 (tag `relai-panel-v0.18.0`, push) — decyzja Łukasza 2026-10-14:
  nie wydajemy teraz, wydanie po zamknięciu planu WYGLAD_PANELU, razem z jego zmianami panelu.
- Terminal (`isGui === false`) poza zakresem: testy terminalowe zielone, układ terminala nie
  mierzony na wąskim panelu.
- Poniżej 31 kolumn (najwęższy zmierzony podział) układ niesprawdzony na żywo.
- `docs/LEKCJE.md` ponad budżet 50 KB (L-0194 dopisana) — rotacja lekcji nadal należna.

**Do zrobienia przez człowieka:** po zamknięciu WYGLAD_PANELU — wydanie `relai-panel` (0.18.0 albo
wyższy numer z tamtego planu), `plugin update` i restart aplikacji, potem rzut oka na panel
w wąskim podziale z wersji zainstalowanej. *(rozstrzygnięte 2026-10-15 — wydania `relai-panel` 0.19.0 (E4) i 0.20.0 (E5), wąski panel w macierzy E4 i na żywo w E5)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-14 — WYGLAD_PANELU E1: paski w kolorach narzędzia, jasne i ciemne (w repo, bez wydania)

**Zrobione:**

- **Sonda nośnika** `relai-motyw-sonda` 0.1.0–0.2.1 (mod w `dev-mods` tej sesji): klucze motywu
  (`text`, `inactive`, `success`, `warning`, `error`, `promptBorder`, `claude`) desktop przemalowuje
  z wyglądem aplikacji w `AbovePrompt` i w `Pane`; `$.config.list()` / `config.set` o wyglądzie
  aplikacji nie mówią nic (Łukasz: „kliknalem kilka razy te przyciski, zmienia sie tylko napis
  theme = ... ale nic poza tym”); `Svg` (interaktywny i obraz) widzi
  `@media (prefers-color-scheme: light)` (zrzut sonda_6); SMIL i CSS animują się, przycisk
  przerysowuje pasek. Wynik w **P-042**, pokazany przed wariantami → **Aneks B** (paski na kluczach,
  znaczniki `Svg` w dwóch paletach CSS, ograniczenie dla E3) — „Tak, Aneks B (Rekomendowane)”.
- **Warstwa nazw** w `core/panel/theme.mjs`: `KEY`, `INK` (ciemna i jasna), `inkCss()`, `inkOf()`,
  `SEGMENT_INK`, `RULE`, `BAR_LOOK`, `CHIP_KEY`; kopie przez `sync-panel-core.js`.
- **Rundy wyglądu** (mod `relai-paski-warianty` 0.1.0–0.5.0, wszystkie trzy paski naraz, zrzuty
  `WYGLAD_PANELU_E1_r1_*`, `_r2_*`):
  - runda 1 (tło / ramka / linia): „może troszeczkę mniej zaokrągleń, może jakieś troszeczkę inne te
    bordery, żeby to jakoś tak bardziej elegancko wyglądało […] propozycje dla ramki przynajmniej
    dwie i tak samo dla linii […] żeby tutaj te odstępy były troszkę większe w tej linii”;
  - runda 2 (osiem wariantów 1, 1b, 2a–2c, 3a–3c): „Dobra, wygrałeś. 3B to jest po prostu coś
    pięknego. Natomiast trzeba tu troszeczkę zmienić stylowanie w zależności od motywu i dla jasnego
    […] podkręcić trochę kontrast tych linii”;
  - runda 3 (jasny A / B): „3B jasny A jest w sensie ok […] żeby może tutaj troszeczkę ten kolor
    jakby zmienić, żeby on się różnił między wersją jasną i ciemną […] w to idziemy na pewno”;
  - runda 4 (kolor linii L1–L3): „L2” — linia ciemna `#636260`, jasna `#9a988f`.
- **Wdrożenie** wariantu 3b: `bar-card.tsx` (×3, bajt w bajt) bez tła i ramki, etykieta w kluczu
  `inactive`; `band.tsx`, `progress/hooks/register.tsx` + `segments.ts` (segmenty 36 px, odstępy
  4/8/9/15), `cache-keeper/hooks/register.tsx` + `rings.ts`: kolory z kluczy, znaczniki `Svg`
  klasami `f-*`/`s-*`/`c-*` z dwiema paletami, czipy jako pogrubiony tekst w kluczu; między
  paskami bez odstępu, linia gasnąca 22 px (`barRule`).
- **Poprawki po wdrożeniu**, słowami Łukasza:
  - „niepotrzebna jest ta przestrzen nadmiarowa nad paskiem plan i przyciemniona lini, jest to za
    wysokie” → linia pod kartą zamiast nad nią;
  - „tak jak usunales te przyciemniona linie z gornego paska planu to tez mozesz usunac te na samym
    dole w cache bo jest zbedna analogicznie jak byla ta gorna” → linia tylko wtedy, gdy niżej stoi
    inny pasek RelAI (klucz `relai-…`, `isBar`), nie nad własnym wierszem aplikacji (L-0195).
- **Runda przycisków** (mod `relai-przyciski-sonda` 0.1.0–0.3.0, zrzuty `_przyciski_r1_*`, `_r2_*`):
  - r1 (B1–B8): „chyba żaden z tych przycisków jakoś mnie nie przekonuje […] może ten B2 […]
    naprawdę nie jesteśmy w stanie ich jakoś lepiej zaprojektować” — pomiar: natywny `Button`
    ignoruje kolor i podkreślenie dzieci `Text` (dopisek do P-042);
  - r2 (C1–C8, `plain` w kluczowanym `Box` z `hover`): „jak ja robię hoovera, to i tak widać, że
    jest to taki oddzielny mały przycisk […] idźmy w to C5 i tyle”;
  - po C5: „Niech to będzie sekundary przycisk, ale niech to będzie jednak przycisk” → `secondary`;
    „żeby primary i secondary miały dokładnie tą samą wysokość” → skrót w każdym przycisku wiersza;
    „nie nadal jest za niski” → pomiar zrzutu: oba 25 px, różni je kontrast (L-0196) → wybór
    „Oba jako primary”; po przeładowaniu: **„jest ok” — akceptacja wyglądu**.
- Brief `STYL_PASKOW_CLAUDE.md` **4.0** (§13: sonda, tabela wyglądu, palety `INK`, przyciski, linia),
  `ARTEFAKTY.md`; P-042 w `PULAPKI.md`; L-0195, L-0196.
- **Rotacja lekcji** (SPEC_ARCHIWUM, dwie fazy): L-0165 … L-0176 (12 pozycji, 12 833 B) →
  `docs/archiwum/lekcje/LEKCJE_L-0165_L-0176.md`, suma `21c6a15c57782d0f` zgodna po odczycie
  z dysku; `docs/LEKCJE.md` 53 164 → 40 532 B przed odświeżeniem zasad (40 827 B po nim). Cel 60 %
  progu (30 KB) nieosiągalny: 20 najnowszych lekcji i „Zasady aktywne” są nietykalne — zabrano
  wszystko, co wolno. Zasady aktywne: 15 / 15 (`count-rules.js`).

**Zweryfikowane — jak dokładnie:**

- `claude plugin validate` i `claude plugin test` binarką aplikacji 2.1.295: panel 188/188,
  progress 34/34, cache-keeper 181/181 (było 178 / 31 / 179 + 7 testów PANEL_WASKI w panelu);
  rdzeń `node --test core/{guardrails,panel,process}/tests/*.test.js` 386/386,
  `sync-panel-core.js --check` zgodne, `mods-parity.test.js` w rdzeniu zielony.
- `grep` kolorów szesnastkowych w kodzie pasków: 0 trafień poza znacznikami `Svg`; kontrola
  pozytywna na HEAD `75dce52` (`git worktree`): `band.tsx` 10, `progress/hooks/register.tsx` 6,
  `cache-keeper/hooks/register.tsx` 6.
- Nowe testy „pasek w kolorach narzędzia” w trzech pluginach, obie wersje w jednym przebiegu
  (worktree HEAD z dopisanymi testami): test kolorów spada na HEAD we wszystkich trzech i przechodzi
  po zmianie; test szerokości 40/70/140 przechodzi na obu (stary kod też się mieścił) — rozliczony
  jako strażnik regresji decyzją Łukasza (brzmienie pkt 6 promptu tego nie przewidziało).
- Linia między paskami: test z obiema fiksturami — pod spodem pasek RelAI (linia na desktopie,
  brak w terminalu) i sam węzeł aplikacji (brak linii) w panelu i postępie; pasek cache bez linii.
- Na żywo (kod podłożony do zainstalowanych 0.17.0 / 0.4.2 / 0.9.0, `/reload-plugins`): zrzuty
  `_wdrozenie_1` ciemny pełne okno, `_2` wąski panel podziału (etykieta nad treścią, baterie
  w dwóch wierszach), `_3` jasny pełne okno; przełączenie wyglądu w trakcie sesji — „tak
  przeladowaly sie same”.
- Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E1/` po commicie `8018ca1`, za zgodą
  Łukasza („Skasuj wszystko po commicie”): przed 53 MB, 877 plików (`du -sh`, `find -type f`),
  po — katalogu nie ma. Poza nim: worktree HEAD `E1/head` usunięty (`git worktree remove`,
  `git worktree list` bez niego); mody `relai-motyw-sonda`, `relai-paski-warianty`,
  `relai-przyciski-sonda` skasowane z `dev-mods` sesji; zainstalowane `relai-panel` 0.17.0,
  `relai-progress` 0.4.2, `relai-cache-keeper` 0.9.0 zostają z podłożonym kodem E1 do wydania.
  Pliki `sklej.mjs`, `tresc.mjs`, `zasady.mjs` w `.claude/relai/work/WYGLAD_PANELU/` nie są z E1 —
  nietknięte.
- Ryzyka: tabela przejrzana — etap nie otworzył ryzyka projektu; ryzyka 1–2 planu (klucze motywu
  i odczyt motywu na desktopie) rozstrzygnięte sondą i Aneksem B. C1 (API modów) bez zmian: wygląd
  stoi teraz także na `prefers-color-scheme` w `Svg` i na kluczu `props.key` węzła `next(e)`.

**Świadomie odłożone:**

- Wydanie — w E4 (decyzja Łukasza); zainstalowane kopie `relai-panel` 0.17.0, `relai-progress`
  0.4.2, `relai-cache-keeper` 0.9.0 niosą do tego czasu podłożony kod E1 (oryginały = stan wydania).
- `STATUS_COLOR` w panelu agentów i reszta szaty panelu — E3.
- Błędy `tsc` (TS7016/TS7006 w importach `.mjs` i testach) istniały przed etapem; porównanie
  z HEAD niewykonalne wprost (worktree bez nieśledzonych typów `.claude-plugin/types`).
- Terminal: paski bez linii i z dzisiejszymi kluczami, nie mierzone na żywo.
- `CLAUDE.md` 11,1 KB przy budżecie 10 KB — do przeglądu przy zamknięciu planu.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — Przegląd spraw czekających ponad 30 dni (start E2 WYGLAD_PANELU)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa).

**Zrobione:**

- Przegląd pięciu spraw z bloku hooka (31 dni) dwiema partiami, decyzje Łukasza. Wpisy źródłowe
  leżą w archiwum z sumą kontrolną (`DZIENNIK_2026-09-06_2026-09-14.md`), więc adnotacje
  rozstrzygnięcia stoją tutaj, a pozycje zniknęły z sekcji „Czeka na człowieka”:
  - **Który model zostaje domyślny, jeśli pomiar E2 wyjdzie nierozstrzygający** —
    *(rozstrzygnięte 2026-10-15 — zamknięte jako nieaktualne: plan OPTYMALIZATOR_PROMPTOW
    zrealizowany 2026-09-15)*.
  - **Kolizja z zainstalowanym `ecc:prompt-optimizer`** — *(rozstrzygnięte 2026-10-15 — zamknięte:
    kolizja przyjęta, bez zmian w konfiguracji użytkownika)*.
  - **Czy tryb ciągły optymalizatora ma licznik kosztu** — *(rozstrzygnięte 2026-10-15 — tak,
    licznik ma powstać; praca świadomie odłożona niżej, poza zakresem planu WYGLAD_PANELU)*.
  - **Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan** — *(rozstrzygnięte 2026-10-15 —
    tak, osobny plan; pozycja w „Co dalej” w `STATE.md`)*.
  - **Kiedy wraca plan PIERWSI_UZYTKOWNICY** — *(rozstrzygnięte 2026-10-15: Łukasz — „zamykamy ten
    plan na taki stan w jakim jest aktualnie. Nie zbieramy oficjalnie feedbacku od userow”)*.
- Ta sama decyzja zamyka dwie powiązane pozycje planu PIERWSI_UZYTKOWNICY spoza bloku hooka
  (odroczone 2026-10-14, licznik 1): **Dyspozycja publikacji i kontaktów** i **Wskazanie
  uczestników pilotażu** — *(rozstrzygnięte 2026-10-15 — pilotażu i oficjalnego zbierania opinii
  nie będzie)*.

**Zweryfikowane:** sekcja „Czeka na człowieka” bez siedmiu pozycji (`grep` po
`ecc:prompt-optimizer` i `Wskazanie uczestników` w sekcji — 0 trafień).

**Świadomie odłożone:**

- Licznik kosztu trybu ciągłego optymalizatora — do osobnej odnogi albo planu, gdy przyjdzie kolej.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E2: pasek postępu jako lista kroków (w repo, bez wydania)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa). Etap uruchomiony `/relai-stage` po karcie startu („Tak, zaczynamy E2.”).

**Zrobione:**

- Pasek `relai-progress` jako lista kroków (`progress/hooks/steps.tsx` nowy, `segments.ts` i `register.tsx` przepisane, kontrakt `progress/types/index.d.ts`): zwinięty — cienka linia segmentów 10 px i jedna linia ze znacznikiem, punktem w toku uciętym wielokropkiem, `następny: …` od 110 kolumn, chipem `● N agentów` bez kosztu i przyciskiem „Rozwiń”; rozwinięty — sumy, „Zwiń” i okno najwyżej 6 wierszy (`windowRows`): `N zrobionych` jako przycisk `plain`, wiersz właśnie odhaczony, punkt w toku, trzy następne, `+N czekają`; stan wiersza zaraz za nazwą. Stan rozwinięcia w `$.state` (`isListOpen`, `isListDoneShown`), odhaczenie jako `fresh` (błysk 1,4 s tłem `diffAddedDimmed`, znacznik wypełnia się SMIL). Drugi rząd `ticked-row`, `TICKED_MS`, `ticked` i linia w `Svg` (`calmLine`, `segmentArt`) usunięte. Ta sama lista dla etapu, odnogi i załogi.
- Rundy wyglądu w prawdziwym nośniku (mod `relai-lista-warianty` 0.1.0–0.3.0 w `dev-mods` sesji), słowa Łukasza:
  - runda 1 (układy 1 pod segmentami / 2 cała szerokość / 3 sama linia): „klikanie tych podsegmentami, cała szerokość, sama linia, za bardzo nie zmieniają mi tych styli, muszę klikać dane, żeby coś się w ogóle zmieniało […] ten trzeci punkt, sama linia odpada […] układ jest w porządku i chciałbym po prostu różne alternatywne widoki” — przyczyna zmierzona: układy 1 i 2 zwinięte identyczne, a długa nazwa z danych etapu rozpychała kolumnę (P-043 pkt 6);
  - runda 2 (A kółka / B numery / C kropki / D jeden pasek): „raczej będziemy iść w ten, a kółka, on chyba jednak cały czas jest najlepszy […] na tym jasnym […] coś w nim mi nie pasuje […] na ciemnym wygląda okej”;
  - runda 3 (jasny J1 obecny / J2 wyraźny / J3 miękki, zwijanie przycisk/tekst, stan na prawo/przy nazwie): „wybieram […] J3 miękki. W tekst, niech to będzie zwijanie tekst. To chyba dałbym przy nazwie po prostu” — zmiana wobec E1: zwijanie zrobionych to przycisk `plain`, nie `primary`;
  - runda 4 (wdrożenie na żywo): „czy to nie powinno być tak sekwencyjnie, po kolei? […] cały czas się to kręci, mimo że teraz tak naprawdę nie wykonujemy żadnej pracy” — wybór „Zrobione najpierw” (zastępuje zasadę briefu „każdy segment swój punkt”) i kręcenie tylko przy `isWorking`;
  - akceptacja po `/reload-plugins`: „Akceptuje”.
- `core/panel/theme.mjs`: `STEP_LIGHT_CSS` (jasny „J3 miękki” wyłącznie w `Svg` paska postępu) i `stepCss()`; kopie przez `sync-panel-core.js` w trzech pluginach (także `cache-keeper/hooks/relai/theme.mjs` — decyzja Łukasza: „Zostaw w theme.mjs”, kod paska cache bez zmian).
- Przegląd kodu (agent `code-reviewer`): poprawione — bieżący punkt uwzględnia status `running` załogi i sumy liczą wszystkie trwające (`sumWords`), błysk tylko dla punktu nadal odhaczonego, „2 czekają”, stała `MIN_SEGMENT_CELLS`.
- Brief `STYL_PASKOW_CLAUDE.md` 4.1 (§3 przepisany), `ARTEFAKTY.md` wiersz 4.1, `PULAPKI.md` P-043 pkt 6, lekcje L-0197 … L-0199 i „Zasady aktywne” 5 i 15.
- Zrzuty: `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E2_r2_{A,B,C,D}_ciemny_zwiniety.png`, `…_r2_A_jasny_rozwiniety.png`, `…_wdrozenie_1 … 7_*.png` (jasny i ciemny, pełne okno i wąski panel, zwinięty i rozwinięty).

**Zweryfikowane — jak dokładnie:**

- Testy binarką aplikacji 2.1.295: `relai-progress` 41/41 (było 34; 8 starych testów świadomie przepisanych na nowe zachowanie), `relai-panel` 188/188, `relai-cache-keeper` 181/181; rdzeń `node --test core/{guardrails,panel,process}/tests/*.test.js` 386/386; `sync-panel-core.js --check` zgodne; `claude plugin validate .` w `progress/` zielone; `tsc` bez błędów w `register.tsx`, `steps.tsx`, `segments.ts` (błędy TS7016/TS7006 i typów testów sprzed etapu).
- Grep po `ticked-row` i `TICKED_MS` w `progress/hooks/*.ts(x)` poza testami: 0 trafień; na HEAD (`git show HEAD:progress/hooks/register.tsx`): 6.
- Testy nowego zachowania obiema wersjami (worktree HEAD-a, L-0151): przebieg 1 — HEAD + nowe testy: plik nie ładuje się; przebieg 2 — stary widok HEAD-a + nowa czysta logika okna (`make-run2.mjs`): 6 testów zachowania (zwinięty, błysk, Rozwiń, przypadki brzegowe, błąd załogi, chip w linii) spada, 5 testów okna i 2 testy kolorów/szerokości z E1 przechodzą; w nowym kodzie wszystkie przechodzą (zapis obu przebiegów w jednym wywołaniu).
- Na żywo (kod podłożony do zainstalowanego `relai-progress` 0.4.2, `/reload-plugins`): zwinięty i rozwinięty w jasnym i ciemnym, pełne okno i wąski panel podziału (zrzuty `wdrozenie_*`); okno 5–6 wierszy; odhaczenie trzech punktów Weryfikacji edycją `PROMPT_ETAP_2.md` przy Łukaszu — licznik 0/7 → 3/7, błysk widziany („Tak, oba działają”); lista rozwinięta została po odpowiedzi modelu (zrzut `wdrozenie_2`); kręcenie tylko podczas pracy modelu potwierdzone.
- `git diff --stat` (bez PANEL_CODEX i makiet): `cache-keeper/hooks/relai/theme.mjs` +14 (kopia rdzenia), `core/panel/theme.mjs` +14, `panel/hooks/core/theme.mjs` +14, `progress/hooks/core/theme.mjs` +14, `progress/hooks/{progress.test.ts,register.tsx,segments.ts}`, `progress/types/index.d.ts`, nowy `progress/hooks/steps.tsx`, dokumenty; `panel/hooks/band.tsx`, `panel/hooks/pane-*.tsx`, żadna kopia `bar-card.tsx`, `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` nietknięte przez etap.
- Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E2/` przed sprzątaniem: 60 MB, 930 plików (`du -sh`, `find -type f`; worktree HEAD-a, mod próby przeniesiony z `dev-mods`, kopia zainstalowanego pluginu sprzed zmian, notatki rund, skrypty) — skasowany po commicie `5b7ef82` za zgodą Łukasza („Tak, commituj E2 bez PANEL_CODEX i makiet, potem posprzątaj katalog roboczy.”): po — katalogu nie ma. Poza nim: worktree HEAD-a `E2/head` usunięty (`git worktree remove`, `git worktree list` bez niego); mod `relai-lista-warianty` przeniesiony wcześniej z `dev-mods` sesji do katalogu roboczego i skasowany z nim (`dev-mods` sesji pusty); zainstalowany `relai-progress` 0.4.2 zostaje z podłożonym kodem E2 do wydania w E4. Pliki `sklej.mjs`, `tresc.mjs`, `zasady.mjs` w `.claude/relai/work/WYGLAD_PANELU/` nie są z E2 — nietknięte.
- Ryzyka: tabela przejrzana — etap nie otworzył ryzyka projektu; ryzyka 3 i 4 planu (animacja i przycisk w pasku, miejsce rozwiniętej listy) zamknięte: SMIL i przycisk działają, okno ≤ 6 wierszy i domyślnie zwinięte.

**Świadomie odłożone:**

- Wydanie — w E4 (decyzja Łukasza); zainstalowany `relai-progress` 0.4.2 niesie do tego czasu podłożony kod E2 (oryginał = stan wydania pod tagiem).
- Z przeglądu kodu: rozwinięte zrobione pokazują trzy ostatnie, więc punkt odhaczony nie po kolei i starszy od nich nie błyska w liście (błyska linia i segment); każdy znacznik `Svg` niesie pełny `stepCss()` (koszt, nie błąd); `SEGMENT_INK` w rdzeniu nieużywany po E2 — usunięcie przy najbliższej zmianie rdzenia (dotyka kopii w trzech pluginach).
- Mod `relai-lista-warianty` (wygląd B, C, D, strojenia J1–J2) — tylko w historii tego wpisu i zrzutach; kasowany z katalogiem roboczym.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU Aneks C: pełna karta startu `/relai-stage` (przed E3)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa).

**Zrobione:**

- Zgłoszenie Łukasza przy starcie E3: „przestałeś wykonywać […] rytuału wstępu, nie robisz mi
  całego podsumowania […] nie piszesz o tym czego dotyczy, rekomendowany model, jakie etapy, co
  jest zrealizowane, nie wypisujesz mi weryfikacji”. Diagnoza na pierwszych kartach startu
  ze wszystkich transkryptów sesji z `/relai-stage` od 2026-09-15 (skrypt w `%TEMP%`): spis karty
  w `relai-stage.md` bez zmian od 1.9.0 (AUDYT_SKILLI zmienił tylko nazewnictwo), Claude Code ten
  sam (2.1.295); karta z 08:42 (sesja `69bf7e9c`) miała akapit „gdzie jesteśmy”, karta z tej sesji
  nie — rytuał startu mieszka w skillu `relai-core`, który nie wyzwala się, gdy komenda jest
  pierwszym promptem (Zasada aktywna 8), a globalny hook `caveman` (od 2026-05) ściska kartę, bo
  spis jej nie chroni. Spis nigdy nie wymagał listy punktów weryfikacji ani tabeli etapów.
- Aneks C przyjęty słowami Łukasza: „Tak, ale przed E3” — `PLAN.html` sekcja 10, `STATUS.md`.
- Krok 4 `adapters/claude-code/commands/relai-stage.md`: karta pełnym tekstem niezależnie od stylu
  skracania; akapit „gdzie jesteśmy” z rytuałem wykonanym przez komendę, gdy w sesji nie padł;
  tabela etapów ze statusami; model z zalecanym `/effort`; wszystkie punkty weryfikacji listą.
  Kopia Codeksa przez `node adapters/codex/generate-skills.js`.
- Test `core/process/tests/stage-card.test.js` (5 kontroli × 2 kopie).

**Zweryfikowane:**

- Test na HEAD (`git worktree` w `%TEMP%`, ten sam plik testu) i po zmianie w jednym przebiegu:
  HEAD 0/10, po zmianie 10/10; sekcja Kroku 4 znaleziona w obu (kontrola instrumentu).
- `generate-skills.js --verify` przed generacją: rozjazd 1 pliku (`relai-stage`), po generacji spójne.
- Rdzeń `node --test core/{guardrails,panel,process}/tests/*.test.js`: 396/396 (386 + 10 nowych);
  `adapters/codex/tests`: 15/15; `node core/tools/validate-adapters.js`: kod 0.
- Zainstalowany `relai` 3.1.0: oryginał komendy (zgodny z tagiem `v3.1.0` po CRLF → LF) odłożony
  do `.claude/relai/work/WYGLAD_PANELU/ANEKS_C/`, nowa komenda podłożona (`cmp` zgodny). Pomiar na
  żywo — karta startu E3 w świeżej sesji — przed nami.

**Świadomie odłożone:**

- Karta startu w regule Cursora (`adapters/cursor/rules/relai-planning.mdc`, sekcja 3, punkt 1)
  ma tę samą krótką formę — poza brzmieniem Aneksu C; do wydania w E4 albo osobnej odnogi.
- Wydanie (`relai` minor) — w E4 razem z trzema pluginami panelu.

**Do zrobienia przez człowieka:**

- Start E3 w świeżej sesji (`/relai-stage`) — to pomiar na żywo nowej karty. *(rozstrzygnięte 2026-10-15 — karta sprawdzona na żywo przy starcie E3 i E4)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU Aneks D: stały układ karty startu `/relai-stage` (przed E3)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa).

**Zrobione:**

- Pomiar na żywo Aneksu C: karta startu E3 (sesja `e11a13ae`, pierwszy prompt sesji) miała
  wszystkie pola z aneksu — akapit „gdzie jesteśmy”, tabelę etapów, `/effort high`, siedem punktów
  weryfikacji listą, pełny tekst mimo stylu `caveman`. Łukasz pokazał kartę HUMANIZACJA E4
  z 2026-10-14: „RelAI ZAWSZE dla komendy rela-stage przygotowywał mi taką strukturę”. Porównanie
  (na prośbę „Sprawdź, co się zmieniło”): Krok 4 wymieniał pola, nigdy układu — dawne karty miały
  nagłówek „Karta startu” z listą pól, „Czego dotyczy” w podpunktach (ponad „2–4 zdania” spisu),
  najtwardszy punkt z tym, co gdy nie przejdzie, uwagi z sytuacji przed kartą; karta E3 miała
  etykiety jako osobne akapity i zakres prozą.
- Aneks D przyjęty słowami Łukasza: „Tak, zapisz układ z przykładu w Kroku 4 komendy jako Aneks D
  przed E3, pola z Aneksu C zostają.” — `PLAN.html` sekcja 10, `STATUS.md` (nagłówek „Aneksy A–D”
  i linia dziennika wdrożenia).
- Krok 4 `adapters/claude-code/commands/relai-stage.md`: blok „Układ karty” (uwagi z sytuacji →
  „gdzie jesteśmy” → nagłówek „Karta startu” z listą pól → tabela etapów → „Zaczynamy?”); „Czego
  dotyczy” w podpunktach z konkretną zmianą i tym, czego etap nie rusza; najtwardszy punkt
  weryfikacji ze zdaniem, co gdy nie przejdzie. Kopia Codeksa przez `generate-skills.js`.
- `core/process/tests/stage-card.test.js`: cztery nowe kontrole × 2 kopie, w tym dowód negatywny
  (brzmienie „2–4 zdania” znika).
- `ARTEFAKTY.md`: `/relai-stage` wersja 11.

**Zweryfikowane — jak dokładnie:**

- Test na HEAD (`git worktree` w `%TEMP%/relai-aneksd-head`, ten sam plik testu) i po zmianie
  w jednym przebiegu: HEAD 10/18 (8 nowych spada), po zmianie 18/18. Pierwszy przebieg po zmianie
  dał 16/18 — regex szukał „nagłówek” małą literą, komenda ma zdanie od wielkiej; poprawiony
  instrument, nie komenda. Worktree usunięty (`git worktree list` bez niego).
- `generate-skills.js --verify`: przed generacją rozjazd 1 pliku (`relai-stage`), po — spójne.
- Rdzeń `node --test core/{guardrails,panel,process}/tests/*.test.js`: 404/404 (396 + 8);
  `adapters/codex/tests`: 15/15; `node core/tools/validate-adapters.js`: kod 0.
- Zainstalowany `relai` 3.1.0: nowa komenda podłożona (`cmp` zgodny); oryginał z tagu `v3.1.0`
  nadal w `.claude/relai/work/WYGLAD_PANELU/ANEKS_C/relai-stage.zainstalowana-3.1.0.md`.

**Świadomie odłożone:**

- Reguła Cursora (`adapters/cursor/rules/relai-planning.mdc`) — jak przy Aneksie C, do E4 albo
  odnogi.
- Wydanie (`relai` minor) — w E4.

**Do zrobienia przez człowieka:**

- Start E3 w świeżej sesji (`/relai-stage`) — pomiar na żywo układu karty z Aneksu D. *(rozstrzygnięte 2026-10-15 — karta sprawdzona na żywo przy starcie E3 i E4)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E3 (w toku): sposób wyboru szaty panelu — sonda i Aneks E

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa). Wpis przed pierwszą zmianą kodu panelu.

**Zrobione:**

- Pytanie startowe z Aneksu B (przełącznik w Pomocy / klucze motywu w tłach / inny pomysł).
  Odpowiedź Łukasza: „Ale czy na pewno nie da się tego automatycznie zrobić? No bo te paski nad
  inputem normalnie się automatycznie odczytują. Możesz to ewentualnie zweryfikować i sprawdzić?
  Może zróbmy jakąś sondę, żeby sprawdzić, czy to się automatycznie nie przeładowuje tak samo jak
  te paski above prompt?”
- Sonda `relai-szata-sonda` 0.1.0–0.3.0 (mod w `dev-mods` sesji `677431a8`), wynik w **P-044**:
  funkcje CSS w `Box`/`Text` desktop odrzuca; karta jako „kanapka” (tekst w toku, tło `Svg`
  z dwiema paletami, ten sam tekst w warstwie absolutnej) przełącza się z wyglądem aplikacji
  sama, rośnie z tekstem, przycisk nad tłem działa — Łukasz: „Przycisk dziala”.
- Wybór Łukasza po sondzie: „Automatycznie, tła w Svg (Rekomendowane)” → **Aneks E** w
  `PLAN.html` sekcja 10 (doprecyzowanie wariantu A: powierzchnie w `Svg`, tekst w kluczach
  motywu, bez przełącznika), `STATUS.md` (Aneksy A–E, linia dziennika wdrożenia).
- Potknięcie: sonda 0.1.0 pokazana na żywo bez `claude plugin test` z montażem — zasada aktywna 13
  złamana drugi raz; panel pusty, bo walidator odrzucił całe drzewo. Od 0.1.1 każda wersja przez
  test przed pokazem.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E3 (w toku): wariant 3 na wszystkich zakładkach, przegląd UX, kartka zawsze wypełniona (Aneks F)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa).

**Zrobione:**

- Łukasz o Komendach w wariancie 3: „wygląda, że już jest lepiej, jest to spójne”; prośba o
  dokument designu i o pozostałe zakładki: „Czyli nadal mają te takie dziwne jakieś bordery”.
  Powstał `docs/zasoby/PANEL_RELAI/DESIGN.md` (rejestr artefaktów, wersja 1, potem 1.1) i Aneks F.
- Po zrzutach Kosztów, Dokumentów, Mapy i Pomocy: „brakuje w ogóle jakichś paddingów w środku w tej
  karcie […] wszystko się zlewa”, „dziwne kwadratowe tło” przy paskach limitu, ściąga „się zlewa”;
  prośba o kompleksowy przegląd UX i o samodzielną weryfikację wyglądu.
- **Zrzuty bez człowieka:** skrypt w katalogu roboczym (UI Automation naciska przyciski panelu,
  PrintWindow fotografuje okno, także zasłonięte). Przegląd: skill `impeccable` (krytyka) +
  niezależna recenzja subagenta (Nielsen, problemy P0–P3, szkice układów).
- Wywiad (cztery pytania) — odpowiedzi Łukasza: kartka „Responsywne, zawsze wypełnione, nie może
  być nawet jednego piksela między borderem a wypełnieniem”; zakres „Baza dla wszystkich
  (Rekomendowane)”; ściąga „Zwinięta domyślnie”; jasna szata „Tak, przełączaj sam (Rekomendowane)”
  (przełącznika w oknie nie znalazłem — przełączył Łukasz).
- Sonda `relai-szata-sonda` 0.7.0–0.9.3: ramka rysowana w `Svg` razem z wypełnieniem, bez ramki
  `Box` — zero szczeliny (lupa ×10); rysunek ≤ 4096 px, w kolumnie; **próg desktopu to elementy,
  nie znaki** (1 260 rysuje, 1 344 nie; `Svg` waży więcej) — P-023 pkt 7, `DRAW_LIMIT` 1 200
  i bezpiecznik „sama ramka” zamiast zniknięcia; diff dokumentu po 60 wierszy (najgorszy stan
  Dokumentów ważył 1 729 i znikałby także bez wypełnienia).
- Baza: margines kartki, linijki limitu bez tła, ściąga zwinięta, opisy fraz bez surowego
  Markdownu, błąd frazy dopiero po wpisaniu, `primary` tylko dla zakładki i akcji głównej
  (wybrana wartość `● 98 %`), kolor błędu tylko dla błędów, nagłówki zwijanych wierszy w jednej
  kolumnie, barwy paska „Teraz” w jasnej szacie.
- Zrzuty końcowe: pięć zakładek w ciemnej i jasnej szacie (pełny i węższy panel) w katalogu roboczym.

**Zweryfikowane:** `claude plugin test .` w `panel/` 195/195, `plugin validate` zielony; rdzeń
`core/panel` 191, całość 409; `progress/` 41, `cache-keeper/` 181; `sync-panel-core.js --check`
zgodne.

**Potknięcia:** tekst z backslashem trzy razy przez literał innego języka mimo zasady aktywnej —
lekcja L-0203.

**Otwarte w E3:** punkty weryfikacji 2–7 promptu (dziennik wariantów, siedem zakładek na żywo,
`git diff --stat`, sprzątanie katalogu roboczego), rytuał „Na koniec”.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E3 ZREALIZOWANY: panel w szacie jasnej i ciemnej, sam za wyglądem aplikacji (w repo, bez wydania)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa). Ciąg dalszy dwóch wpisów „E3 (w toku)” wyżej.

**Zrobione:**

- Rundy wariantów w nośniku (mod `relai-szata-warianty` 0.1.0–0.5.0, zrzuty
  `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E3_r1…r3_*`), słowami Łukasza:
  - runda 1 (0.1.0): „coś tutaj rozjechałeś, nałożyłeś na siebie jakieś dwie rzeczy […] nie
    symuluj tego, to ja będę to przełączał ręcznie, ale popraw proszę te ekrany” — `Svg` bez opisu
    desktop pomija (P-042), ukryta kopia była widoczna;
  - runda 1 bis (0.2.0, trzy warianty w obu szatach): wybór „3 · jedna kartka (Rekomendowane)”,
    ramka „subtle”; „jest problem przy pomniejszeniu zakladki” — tło skalowało się do szerokości;
  - runda 2 (0.3.0, wąski panel): przykryty w całości, ale pusta kartka pod treścią — ramka na
    złym pudełku (P-044);
  - runda 3 (0.4.0): „jest jakiś problem z rozjeżdżającym się przyciskiem otwórz” — kolumna słów
    bez bazy zerowej (P-043);
  - akceptacja (0.5.0): „jest ok juz nie bede pokazywal ale jest ok” — wariant 3, ramka subtle,
    wąski i pełny panel, oba wyglądy.
- Wdrożenie w panelu: pierwsza próba odrzucona („co ty najlepszego odwaliłeś […] teraz to wygląda
  jak jakaś kupa”) — przeniosłem barwy wariantu bez jego kształtu (L-0200); potem Komendy w kształcie
  wariantu 3 (runda 5: „te przyciski sie nie wyrownuja” — jedna prawa krawędź), Aneks F i przegląd UX
  (wpis wyżej).
- Rozwinięte sekcje: „Jeszcze te rozwiniete plany maja te dziwne podswietlenia caly czas” — pas
  planu w Mapie malował własne tło (`bg`); teraz tło kartki (`THEME.card`); test „żaden rozwinięty
  rysunek nie kładzie własnego tła” z kontrolą pozytywną na starym kodzie (`#3f3026`). Sprawdzone na
  żywo z każdą sekcją rozwiniętą w Mapie, Kosztach i ściądze (zrzuty r7).
- Zrzuty końcowe w `docs/zasoby/PANEL_RELAI/zrzuty/`: r6 (pięć zakładek × ciemna i jasna, lupa
  krawędzi kartki), r7 (rozwinięte), r8 (wąski panel 530 px, pięć zakładek). Skrypty zrzutów bez
  człowieka w `docs/zasoby/PANEL_RELAI/narzedzia/` (UI Automation + PrintWindow, README).

**Zweryfikowane — jak dokładnie:**

- Na żywo, zrzutem okna bez udziału człowieka: pięć zakładek w ciemnej i jasnej szacie (przełącza
  się z wyglądem aplikacji, bez restartu), rozwinięte sekcje, wąski panel 530 px — bez przepełnień,
  przyciski w jednej kolumnie, ścieżki skracane wielokropkiem. Panel ma dziś pięć zakładek, nie
  siedem jak w prompcie.
- `claude plugin validate .` zielony, `claude plugin test .` w `panel/` 197/197 binarką aplikacji
  2.1.295; `progress/` 41/41, `cache-keeper/` 181/181; rdzeń 409/409 (pary kontrastu obu szat
  ≥ 4,5 : 1 w `core/panel/tests/theme.test.js`, z kontrolą pozytywną); `sync-panel-core.js --check`
  zgodne. Na HEAD `b03fdfb` (worktree) 10 testów panelu i plik testów szaty rdzenia spadają.
- `git diff --stat` (bez plików nieśledzonych): 31 plików, +1090 / −146 — `core/panel/` i trzy kopie
  `theme.mjs`, `panel/hooks/` (widoki, testy, `limit-ruler.ts`, `register.tsx`), dokumenty.
  `band.tsx`, `bar-card.tsx`, reszta `progress/hooks/` i `cache-keeper/hooks/` nietknięte.
  `docs/plany/PANEL_CODEX/` (2 pliki) i `docs/zasoby/PANEL_RELAI/makiety/` zmieniła sesja Codeksa —
  poza commitem etapu.
- Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E3/`: przed 67 MB, 1 068 plików (notatki,
  skrypty, zrzuty robocze, kopia `relai-panel-0.17.0-przed/`, worktree `head/`); po: 0 —
  skasowany po „Kasuj po kopii zrzutów (Rekomendowane)”, worktree zdjęty `git worktree remove`.
  Poza nim: mody `relai-szata-sonda` (0.9.3) i `relai-szata-warianty` w `~/.claude/dev-mods/677431a8…`
  — skasowane; zainstalowany `relai-panel` 0.17.0 w `~/.claude/plugins/cache/` niesie kod z repo
  i zostaje tak do E4 (decyzja „Zostaw nowy kod do E4”); w `%TEMP%` nic z tego etapu.
  `.claude/relai/work/WYGLAD_PANELU/` trzyma jeszcze `ANEKS_C/` i trzy skrypty z Aneksów C–D.

**Świadomie odłożone:**

- Wydanie `relai-panel` / `relai-progress` / `relai-cache-keeper` — E4.
- Przełącznik szaty w Pomocy — niepotrzebny po Aneksie E (szata idzie za aplikacją).
- Zakładka Dokumenty w stanie najcięższym (diff długiego dokumentu) rysuje się dzięki stronie diffu
  60 wierszy i bezpiecznikowi `DRAW_LIMIT`; próg desktopu może się przesunąć z wersją aplikacji
  (ryzyko C1).

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU po E3: foldery i hover w jasnym wyglądzie (poprawka po zamknięciu etapu)

Wykonawca: Opus 5.5 (Claude Code, aplikacja desktopowa). Uwagi Łukasza po commicie E3 `8b98b88`.

**Zrobione:**

- Foldery drzewa Dokumentów — Łukasz: „na jasnym one się powinny inaczej renderować […] Wygląda to
  jak taki ciemny prostokąt”. Przyczyna: wypełnienie zamkniętego folderu `#d9a134` to ten sam kolor
  co `THEME.mark`, który jasna szata przyciemnia dla tekstu (`#9a6a12`), a linia zakładki `#8d6922`
  zlewała się z nim. Folder ma teraz własną jasną paletę w rysunku (`FOLDER` w
  `core/panel/theme.mjs`: zamknięty `#e3b04a` z linią `#b5832a`, otwarty przód `#efc976`); ciemna
  szata bez zmian. Łukasz: „foldery już wyglądają dobrze”.
- Hover — Łukasz: „zobacz co się dzieje teraz z hooverem. No tak nie może być”. Zmierzone: pod
  kursorem `#302c26` (surowe `cardOn`). Sonda `relai-hover-sonda` 0.1.0–0.2.0: klucz `promptBorder`
  pod kursorem rysuje się jasno także w kanapce nad `Svg`. Drzewo zapisane z działającego panelu:
  silnik trzyma `hover` i `press` na węźle, nie w `props` (P-045) — `retone` i `rekey` patrzyły
  w `props`. Poprawka w `panel/hooks/skin.ts`; Łukasz: „jest ok”.

**Zweryfikowane — jak dokładnie:**

- Testy nowe spadają na kodzie sprzed poprawki i przechodzą po niej: `theme.test.js` „folder icons”
  (z kontrolą pozytywną na starej palecie), `skin.test.ts` „hover where the engine keeps it”.
  Panel 198/198, rdzeń 410/410, progress 41, cache-keeper 181, `validate` i `sync --check` zielone.
- Na żywo w jasnym wyglądzie: hover wiersza dokumentu i folderu `#ceccc8` (przed `#302c26`).

**Świadomie odłożone:** sprawdzenie hovera w ciemnym wyglądzie i na pozostałych zakładkach — macierz E4.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E4: odbiór macierzy i zgoda na wydanie (przed zmianą numerów)

Zapis zgody przed pierwszą zmianą numeru wersji (punkt Weryfikacji E4). Pełny wpis etapu niżej.

- Odbiór całości macierzy — Łukasz: „Tak, przyjmuję całość” (6 komórek: jasny i ciemny × pełne
  okno, połowa podziału, wąski panel; panel agentów w obu wyglądach; 6 poprawek sprawdzonych na
  żywo).
- Zgoda na wydanie — Łukasz: „Tak, 3.2.0 / 0.19.0 / 0.5.0 / 0.10.0 (Rekomendowane)”: `relai`
  3.2.0, `relai-panel` 0.19.0, `relai-progress` 0.5.0, `relai-cache-keeper` 0.10.0, commit, tagi
  `v3.2.0` i `relai-panel-v0.19.0`, push na `origin`.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E4 ZREALIZOWANY: odbiór na żywo i wydanie 3.2.0 / panel 0.19.0; Aneks G (E5)

**Zrobione:**

- Macierz na żywo: jasny i ciemny × pełne okno, połowa podziału, wąski panel (~530–590 px) × trzy
  paski i pięć zakładek, zrzuty `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E4_*` (ostatnia
  komórka, jasne pełne okno, i zestaw `_po_poprawkach_*`). Panel agentów `/relai-agents` w obu
  wyglądach: w jasnym lista punktów stała na ciemnej karcie z jasnym tekstem — poprawione
  (`retone` w `progress/hooks/skin.ts`), zrzuty `_jasny_agenci`, `_ciemny_agenci`.
- Poprawki z macierzy, każda z testem spadającym przed nią: pusty panel po rozwinięciu wszystkiego
  na Mapie (zastępczy widok „Zwiń wszystko”, drugi budżet w znakach `isDrawable`), pasek etapów
  bez własnego tła, margines grup w Dokumentach, pasek planu bez łamania nazwy i „W TOKU”, wspólna
  kolumna przycisków progu limitu (równe paski), panel agentów w kluczach motywu; komunikat
  „za dużo rozwiniętych sekcji” w kolorze uwagi. `SEGMENT_INK` usunięty z rdzenia i trzech kopii.
- Brief `STYL_PASKOW_CLAUDE.md` 5.0 (sekcja 0 „Co obowiązuje”, §5–§7 oznaczone jako historia,
  §14.6), `DESIGN.md` 1.2, P-023 pkt 7 uzupełniony; dwa wiersze w `ARTEFAKTY.md`.
- Wydanie po zgodzie: commit `cc2d340`, tagi `v3.2.0` i `relai-panel-v0.19.0` wypchnięte;
  instalacja z marketplace: `relai` 3.2.0, `relai-panel` 0.19.0, `relai-progress` 0.5.0,
  `relai-cache-keeper` 0.10.0.
- Narzędzie: `okno.ps1` ucinał okno (brak świadomości DPI) — w etapie działała kopia robocza
  z `SetProcessDPIAware` (L-0206); poprawka narzędzia w `narzedzia/` — do E5.
- Po wydaniu Łukasz: sekcja „Teraz” „nie pasuje stylistycznie, jest tam nawalone opisu, nie da się
  najeżdżać na te paski, wszystko się ze sobą zlewa”; baterie „w jakiegoś takiego sensownego
  grida”; kontekst z oknem modelu wyeksponowany, bo natywny pasek aplikacji przestał go pokazywać.
  Decyzja: „dorzućmy do tego planu” — **Aneks G**, etap E5, `relai` zostaje 3.2.0, panel dostaje
  nowe numery; warianty dla kontekstu i siatki w E5, świeża sesja.

**Zweryfikowane — jak dokładnie:**

- `plugin validate` i `plugin test` binarką aplikacji 2.1.295: panel 205/205, progress 42/42,
  cache-keeper 181/181; rdzeń `node --test` 410/410; `sync-panel-core.js --check` zgodne;
  `validate-adapters.js` spójne (kod 0).
- Testy poprawek spadają na kodzie sprzed nich w jednym przebiegu (`git worktree` HEAD w `%TEMP%`
  z nowymi plikami testów): panel 5 fail (4 testy + plik Mapy nie wczytany bez `isDrawable`),
  progress 2 fail; po poprawkach 0 fail. Pusty panel odtworzony testem: 2109 jednostek przy progu
  1 200; na żywo zapis diagnostyczny: waga 1 045, 64 `Svg`, 250 tys. znaków źródła, 338 tys.
  drzewa — po drugim budżecie Łukasz: „kliknalem zwin i dziala”.
- Każda poprawka obejrzana na żywo po `/reload-plugins` (Dokumenty, Mapa, Koszty — „otwiera sie”,
  pasek planu testem w wąskiej kolumnie).
- `git grep SEGMENT_INK` poza `docs/` — pusto; `git grep` starych numerów w plikach `*.json` —
  pusto; `git show --stat cc2d340` nie dotyka `docs/plany/PANEL_CODEX/` ani `makiety/`;
  `git ls-remote --tags origin` pokazuje oba tagi.
- Po instalacji: `installed_plugins.json` wskazuje katalogi 3.2.0 / 0.19.0 / 0.5.0 / 0.10.0, pliki
  hooków równe repo (`diff -rq --strip-trailing-cr`), znaczniki `.in_use` w nowych katalogach
  z 16:09–16:10 (po przeładowaniu); zrzut trzech pasków z zainstalowanej wersji
  `_zainstalowane_okno.png`. Log aplikacji nie wypisuje wersji pluginów.
- Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/` (E4, ANEKS_C i trzy skrypty z Aneksów C–D)
  skasowany po „Tak, skasuj wszystko”: przed 3,9 MB, po 0 MB. Poza nim: kopie podłożone do
  `~/.claude/plugins/cache/relai/relai-panel/0.17.0`, `relai-progress/0.4.2`,
  `relai-cache-keeper/0.9.0` zostają w cache aplikacji jako stare wersje (nieużywane po aktualizacji);
  `%TEMP%/relai-e4-przed` usunięty `git worktree remove`.

**Świadomie odłożone:** rotacja ryzyk zamkniętych (sekcja 12,3 KB > 12 KB) i lekcji (51 KB > 50 KB)
— przy najbliższym starcie sesji; poprawka `narzedzia/okno.ps1` (DPI) — w E5; zamknięcie planu
przeniesione z E4 na E5 (Aneks G).

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E5: odbiór na żywo i zgoda na wydanie (przed zmianą numerów)

Zapis zgody przed pierwszą zmianą numeru wersji (punkt Weryfikacji E5). Pełny wpis etapu niżej.

- Odbiór „Teraz” i paska cache — Łukasz: „ok teraz jest dobrze, mozemy chyba zamykać plan”; po
  Aneksie H (próg auto-compactu, kreska przy 637k): „ok działa”.
- Zgoda na wydanie — Łukasz: „Tak, wydaj (Rekomendowane)”: `relai-panel` 0.20.0,
  `relai-cache-keeper` 0.11.0, `relai-progress` 0.5.0 i `relai` 3.2.0 bez zmian, tag
  `relai-panel-v0.20.0`, push na `origin`.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — WYGLAD_PANELU E5 ZREALIZOWANY: „Teraz”, baterie w siatce, kontekst z progiem auto-compactu; wydanie panelu 0.20.0 / 0.11.0

**Zrobione:**

- `narzedzia/okno.ps1` z `SetProcessDPIAware`: zrzut w rozmiarze fizycznym (3458 × 1398 zamiast
  2766 × 1118, pole promptu w kadrze).
- Wybory Łukasza na żywo z trzech wariantów każdej rzeczy. Runda 1: „na pewno podoba mi się ten K1
  z tym paskiem […] Czyli wybieramy S2 i dla S2 tak naprawdę zamieniamy ten kontekst na to co jest
  w K1”; „Teraz”: „chyba bym został ogólnie przy tym wyglądzie paska T1 […] mi bardziej chodziło
  o całe przerobienie całej tej otoczki […] start etapu zupełnie jest w jakimś dziwnym miejscu […]
  Pamiętaj też, że mamy odpowiedni design MD”. Rundy 2–4 wiersza kontekstu: „na całą szerokość
  […] od pierwszej baterii do końcowej baterii”, „wystaje mi / 1M - 32% poza”, „ten kontekst
  powinien być pomiędzy tym paskiem, a tym fizyczną liczbą tokenów”, akceptacja „ok wyglada fajnie”.
  Runda 5: „dajmy po prostu ten natywny z caloscia i tyle, nie komplikujemy”, „Moze to samo zrobmy
  z bateriami?”, akceptacja „ok teraz jest dobrze, mozemy chyba zamykać plan”.
- `relai-panel`: `now-art.ts` (znaczniki ≥ 3 : 1 do kartki w obu wyglądach, stan po kształcie,
  `<title>` z całym punktem), `pane-now.tsx` (cztery wiersze w odstępie, punkt w jednej linii obok
  „Start etapu…” w kolumnie przycisków, `nowWords`).
- `relai-cache-keeper`: siatka `columnsOf`/`grid`, wiersz kontekstu `contextRow` w gramatyce
  baterii (okno z sesji), natywne dymki `<title>` zamiast kapsuł, wiersze 24 px.
- Aneks H (Łukasz: „zmienialo kolor z zielonego na zolty a potem czerwony jak sie zbliza kontekst
  do tego limitu”, „oznaczony prog auto compactu tak jak […] limit 90% w zakladce koszty”; wybór
  „Kreska + kolor, wiersz 24 px”, „Aneks H do E5”): kreska progu i barwa liczona do progu. Pierwszy
  pomiar pokazał 967k — „mam w systemie ustawione na 65%, wiec przy 650k powinno mi to sie
  compactowac”; rozbicie silnika pomija nadpisanie (P-046), `compactThreshold()` liczy jak
  kompaktowanie → 637k; po poprawce „ok działa”.
- `DESIGN.md` 1.3, brief `STYL_PASKOW_CLAUDE.md` 5.1 (§14.7), wiersze w `ARTEFAKTY.md`; zrzuty
  `zrzuty/WYGLAD_PANELU_E5_*` (warianty, ciemny w połowie podziału, kreska progu, dymek kontekstu,
  jasne okno, dymek „Teraz” od Łukasza, okno z zainstalowanej wersji).
- Wydanie: commit `dbd1264`, tag `relai-panel-v0.20.0`, push; `plugin update` do 0.20.0 / 0.11.0.

**Zweryfikowane — jak dokładnie:**

- Kontrast: test `now.test.ts` — każdy znacznik i obrys ≥ 3 : 1 do kartki w obu wyglądach; kolory
  3.2.0 (jasne 2,38 i 2,53 : 1) spadają w teście podłożonym.
- Słowa pod paskiem „Teraz” na danych E5: E4 461 znaków (dwa punkty, zawijane), E5 189 (jeden punkt,
  jedna linia, całość w dymku).
- Testy przed i po w jednym przebiegu (`git worktree` HEAD z nowymi testami): panel 203 pass /
  3 fail, cache-keeper 167 / 22 fail; testy Aneksu H czerwone przed implementacją (6 fail, potem
  2 fail na nadpisaniu); po zmianach 0 fail.
- `plugin validate` i `plugin test` binarką 2.1.295: panel 211/211, progress 42/42, cache-keeper
  198/198; rdzeń `node --test` 410/410; `sync-panel-core.js --check` zgodne; `validate-adapters.js`
  bez uwag. Jeden przebieg panelu dał 1 fail przy równoległym obciążeniu (test wąskiego panelu
  5 s); powtórka 211/211.
- Na żywo po `/reload-plugins`: siatka i wiersz kontekstu w ciemnym (połowa podziału) i jasnym;
  natywne dymki baterii i „Teraz” (zrzut Łukasza); kreska przy 637k.
- `git show --stat dbd1264` nie dotyka `docs/plany/PANEL_CODEX/` ani `makiety/`; `git ls-remote`
  pokazuje tag; `installed_plugins.json` wskazuje katalogi 0.20.0 i 0.11.0, pliki hooków równe
  repo (`diff -rq --strip-trailing-cr`), `.in_use` z 20:14; zrzut `_zainstalowane_okno.png`.
- Katalog roboczy `.claude/relai/work/WYGLAD_PANELU/E5/` skasowany po „Tak, skasuj”: przed 8,4 MB
  (126 plików), po 0. Poza nim: kopie podłożone do `~/.claude/plugins/cache/relai/relai-panel/0.19.0`
  i `relai-cache-keeper/0.10.0` zostają jako nieużywane stare wersje; worktree
  `%TEMP%/relai-e5-przed` usunięty `git worktree remove`.

**Świadomie odłożone:** zrzut pełnego okna bez podziału w obu wyglądach po poprawkach (siatka
sprawdzona testem na 200/130/100/70 kolumnach i na żywo w połowie i wąskim panelu); rotacja
lekcji (ok. 54 KB > 50 KB) i ryzyk — na starcie następnej sesji.

**Do zrobienia przez człowieka:** —

Lekcje: L-0209 (element chwilowy a geometria spoczynku), L-0210 (dopisanie do dokumentu
w powłoce — powtórzenie L-0198). Pułapki: P-046 (próg auto-compactu z rozbicia), P-047 (zrzut
z najechaniem). Ryzyko C1 uzupełnione o wzór progu z binarki.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-15 — Plan WYGLAD_PANELU ZREALIZOWANY: dowiezione vs plan

**Zrobione — dowiezione vs plan:**

| Plan zakładał | Powstało | Przepadło / zmieniło się |
|---|---|---|
| E1: paski w kolorach narzędzia, sonda nośnika | klucze motywu, `Svg` w dwóch paletach (P-042), wariant 3b | wariant awaryjny B niepotrzebny |
| E2: pasek postępu jako lista kroków | lista z cienkimi segmentami, „Rozwiń”, jasny „J3 miękki” | — |
| E3: panel w szacie jasnej | panel sam za wyglądem aplikacji (Aneks E), jedna kartka, `DESIGN.md` (Aneks F) | przełącznik szaty w Pomocy odrzucony |
| E4: odbiór i wydanie | macierz 2 × 3 na żywo, sześć poprawek, 3.2.0 / 0.19.0 / 0.5.0 / 0.10.0 | zamknięcie przeniesione na E5 (Aneks G) |
| E5 (Aneks G): „Teraz”, siatka baterii, kontekst | T1, S2 + K1, natywne dymki; Aneks H: próg auto-compactu; 0.20.0 / 0.11.0 | własne kapsuły dymków odrzucone po regresji |
| Aneksy C–D: karta startu `/relai-stage` | pełna karta i stały układ, wydane w 3.2.0 | — |

Bramki manualne: dwie w `STATUS.md` rozstrzygnięte 2026-10-15; trzy pozycje „Do zrobienia przez
człowieka” z dziennika planu rozstrzygnięte („Wszystkie rozstrzygnięte”). Odnóg w planie brak.
Folder planu przeniesiony do `docs/archiwum/plany/WYGLAD_PANELU/`; linia „Aktywny plan” w
`CLAUDE.md` wskazuje jedyny niezamknięty plan PANEL_CODEX.

**Zweryfikowane — jak dokładnie:** `ls docs/archiwum/plany/WYGLAD_PANELU/` — PLAN, STATUS, makieta
i pięć promptów; `ls docs/plany/` — tylko PANEL_CODEX; linki do planu w `STATE.md`, `CLAUDE.md`
i `DESIGN.md` prowadzą do archiwum.

**Świadomie odłożone:** —

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — Wiadomość do zespołu o 3.2.0 / panelu 0.20.0 i oficjalne wydania na GitHubie

**Zrobione:**

- **Wiadomość na Teams** o nowościach od 3.0.0 (ostatniej wersji wysłanej zespołowi): 3.1.0
  `/relai-humanize`, 3.2.0 karta startu, panel 0.15–0.20. Szkic po `/relai-humanize` (usunięte:
  pogrubienie dla ozdoby ×10, myślnik zamiast spójnika ×10; strażnik faktów bez różnic), potem
  na prośbę Łukasza w pierwszej osobie liczby pojedynczej („nie pisz w liczbie mnogiej nic bo ja
  RelAI przygotowuje jako pojedynczy developer”). Łukasz: „ok wersja wysłana”.
- **Zrzuty na danych testowych** zamiast zrzutów z prawdziwych sesji (Łukasz: „zeby mialy
  mockowane dane a nie moje realne screeny”): makieta HTML, w której rysunki generuje kod pluginów
  (`rings.ts`, `now-art.ts`, `segments.ts`, `theme.mjs`, nagłówki i ikony), a natywne elementy
  aplikacji mają kolory pobrane z prawdziwych zrzutów; PNG z Chrome bez okna. Projekt testowy
  „sklep internetowy”, plan `PLATNOSCI_ONLINE`. Pliki i generator w katalogu roboczym
  `.claude/relai/work/_wiadomosci/2026-10-16_teams/`.
- **Wydania na GitHubie** (Łukasz: „oznacz jako wydana oficjalnie”): `v3.2.0`,
  `relai-panel-v0.19.0` i `relai-panel-v0.20.0` (Latest) — tagi istniały od 2026-10-15 bez notatek
  wydań.

**Zweryfikowane — jak dokładnie:** `gh release list` — trzy nowe wydania, `relai-panel-v0.20.0`
jako Latest; makiety porównane na oko z prawdziwymi zrzutami w obu wyglądach przy skali 125 %.

**Świadomie odłożone:** podmiana `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E5_jasny_dymek_teraz.png`
— w commicie `a73cbb3` to przez pomyłkę kopia zrzutu paska kontekstu (dymek wklejony w trakcie
tury nie zapisał się na dysku); rotacja dziennika, lekcji i ryzyk.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — Plan STRONA_RELAI: wywiad, szkice czterech struktur, plan do akceptacji

**Zrobione:**

- **Przegląd spraw przeterminowanych** (start sesji, 31 dni): „Zamrożenie dwóch bramek zgody”
  odroczone o 30 dni; „Odpowiedź testerowi — czy po odmowie pytanie o RelAI wróciło” zamknięta
  decyzją Łukasza: odpowiedzi nie będzie, pozycja zdjęta z „Czeka na człowieka”. Wpis źródłowy
  2026-09-15 leży w archiwum z sumą kontrolną, więc rozstrzygnięcie stoi tutaj.
- **Wywiad o stronie-wizytówce** (skill `nateherk-design:scroll-craft` 0.3.1 przeczytany w całości):
  strona PL i EN po języku przeglądarki; hosting GitHub Pages teraz, Vercel przy płatnym
  produkcie; odbiorcy: programiści solo i osoby nietechniczne prowadzące projekt z AI; konfigurator
  z komendą, linkiem do terminala i linkiem do aplikacji; szczyt „bałagan układa się w porządek”;
  krzywa: cisza, jeden szczyt, spokojny koniec; grafika z kodu i prawdziwego UI, bez generowanych
  zdjęć; szczegóły funkcji po kliknięciu obiektów w animowanych szufladach; telefon po wyborze
  wersji; etapy w świeżych sesjach Opus z do trzech subagentów Sonnet.
- **Szkice czterech struktur** (Łukasz: „chciałbym zobaczyć wszystkie te propozycje na jakieś bardzo
  oczywiście wstępnej makiecie”): żywa powierzchnia, rozdziały redakcyjne, jeden świat (biurko),
  film — szare bloki z prawdziwym przewijaniem i wspólnym konfiguratorem, w
  `.claude/relai/work/STRONA_RELAI/szkice/` (poza repo). Wybór Łukasza: dwa dopracowane
  prototypy, „Biurko” w three.js i „Film”, potem decyzja.
- **Plan [STRONA_RELAI](plany/STRONA_RELAI/STATUS.md)**: `PLAN.html` z szablonu „Warsztat”, pięć
  etapów, 9–13 sesji (SZACUNEK), `STATUS.md` z trzema bramkami manualnymi; linia „Aktywny plan” w
  `CLAUDE.md` wskazuje STRONA_RELAI (decyzja Łukasza), PANEL_CODEX zostaje w Codeksie.

**Zweryfikowane — jak dokładnie:** szkice przewinięte w Chromium (panel przeglądarki, 1366 × 820)
na kilku pozycjach każdego toru — błąd zakresu kroków („1” bez „-”) znaleziony na zrzucie
i poprawiony; plan po builderze bez niewypełnionych znaczników, zero odwołań `http(s)` w
`src`/`href`, bez przewijania w poziomie przy 1280 i 354 px, sekcja zwija się po kliknięciu.
Fakty do planu: `gh release list` i API Pages (404) na żywo; deep linki i komendy instalacji z
dokumentacji Claude Code (code.claude.com, odczyt 2026-10-16); limity Pages i Vercel Hobby ze
stron dostawców tego samego dnia.

**Świadomie odłożone:** rotacja dziennika, sekcji ryzyk i lekcji (wszystkie ponad progiem);
`/relai-models` (lista ma 8 dni); `CLAUDE.md` 11,2 KB i `STATE.md` 16,3 KB ponad budżetem startu.

**Do zrobienia przez człowieka:**

- Akceptacja planu STRONA_RELAI albo poprawki przed akceptacją. *(rozstrzygnięte 2026-10-16 —
  plan zaakceptowany bez poprawek)*

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — Plan STRONA_RELAI zaakceptowany; prompt E1

**Zrobione:**

- Łukasz: „Akceptuję plan STRONA_RELAI. Zamroź go, wygeneruj PROMPT_ETAP_1.md i powiedz, jak
  ruszyć E1.” Plan zamrożony bez aneksów; `STATUS.md`: ZAAKCEPTOWANY 2026-10-16, E1 GOTOWY DO
  STARTU, bramka akceptacji rozstrzygnięta; nagłówek `PLAN.html`, `CLAUDE.md` i `STATE.md` z nowym
  statusem.
- [`PROMPT_ETAP_1.md`](plany/STRONA_RELAI/PROMPT_ETAP_1.md): fundament `site/`, BRIEF.md
  scroll-craft, hero „Biurka” na gotowo, droga zgrubnie, 17 punktów weryfikacji, kalibracja hero
  z Łukaszem przed zamknięciem etapu, pytanie przed pobraniem three.js.
- Lekcja L-0211.

**Zweryfikowane — jak dokładnie:** prompt ma sześć sekcji `##`, każdą raz, i zero
niewypełnionych znaczników; zasady aktywne w prompcie porównane z `docs/LEKCJE.md` bajt w bajt
(16 832 znaki, 15 zasad, `FAKT`). Pierwsza wstawka zdublowała trzy sekcje przez `` $` `` w tekście
zastępczym (L-0211); plik odtworzony z nienaruszonego początku i końca, wstawka powtórzona funkcją.

**Świadomie odłożone:** wpięcie L-0211 do „Zasad aktywnych” (zasada 5) przy najbliższej
destylacji; prompt E1 niesie destylat sprzed tej lekcji.

**Do zrobienia przez człowieka:** —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI E1: fundament strony i hero „Biurka” w three.js

**Zrobione:**

- **Rotacja na początku rytuału** (decyzja Łukasza przy starcie etapu): dziennik 156,0 → 88,5 KB,
  13 wpisów 2026-10-13…14 w [DZIENNIK_2026-10-13_2026-10-14](archiwum/dziennik/DZIENNIK_2026-10-13_2026-10-14.md)
  (suma `3e1aeaec82894461`, `rotate.js`); lekcje L-0177…L-0191 (15) w
  [LEKCJE_L-0177_L-0191](archiwum/lekcje/LEKCJE_L-0177_L-0191.md) (suma `5e28a9223a147861`,
  skrypt dwufazowy wg `SPEC_ARCHIWUM.md`, bo `rotate.js` nie obsługuje lekcji), plik 54,5 → 37,9 KB
  przed nowymi wpisami. Rotacja ryzyk **zablokowana**: 18 wierszy, 0 zamkniętych.
- **Scroll-craft:** `.scrollcraft.json` → workspace `docs/zasoby/STRONA/` z pustym
  `FINGERPRINTS.md`; [BRIEF.md](zasoby/STRONA/builds/biurko/BRIEF.md) z ośmioma tematami
  (cytaty Łukasza dosłownie), krzywą odczuć, szczytem, „It's the site where…”, ciszą przed szczytem,
  gramatyką Continuous world (worldflight na scenie three.js zamiast klipów — decyzja autorska)
  i kontraktem warstw hero.
- **`site/`:** `narzedzia/fakty.mjs` → `dane/fakty.json` (15 komend z opisem EN i PL z `NAMES`,
  wersje czterech pluginów, 3 adaptery); `js/konfigurator.js` (96 kombinacji, prompt bez „/”,
  ≤ 5000 znaków, Codex z trzecim krokiem `install.js`, uwagi jako klucze), `js/wersja.js` (wpieczone
  + API po prefiksie tagu, limit czasu, `sessionStorage`, `textContent`), `js/jezyk.js`;
  `narzedzia/zbuduj.mjs` (mini-Mustache z ucieczką) + `szablon.html` → `index.html`, `pl/index.html`;
  treść `tresc/pl.json` i `en.json` (EN do przeglądu native speakera); `vendor/three/` 0.186.1
  z npm (sha512 zgodna z rejestrem; w repo `three.core.js`, `three.module.js`, `CSS3DRenderer.js`,
  `RoomEnvironment.js`, `LICENSE`, `VERSION`; 0.186 nie ma już `.min.js`); fonty i logo z licencją;
  `README.md`. Punkty 3–5 zakresu zrobiły trzy subagenty Sonnet 5.5, kod przejrzany przed przyjęciem.
- **Scena** (`site/biurko/`): blat z drewna, ściana, okno, korkowa tablica z kartką-logo na pinezce,
  lampa (jedyne ciepłe źródło, miękkie cienie), karteczki z pytaniami Kalamem, cztery dokumenty,
  teczka planu, laptop, pudełko z fiszkami, kubek, ołówek — wszystko proceduralnie, tekstury
  z canvas. Render tylko w ruchu, DPR ≤ 1,5, obniżenie jakości przy medianie > 26 ms. Tor kamery
  z postojem na siedmiu przystankach, cisza przed szczytem, szczyt najdłuższy (2,2 wobec 1,0;
  test `kamera.test.mjs`); stała warstwa tekstu (przesuw ≤ 1,6 vh), mapa z `aria-current`, klikalna
  i z klawiatury; konfigurator jako prawdziwy HTML na ekranie laptopa (CSS3D); bez WebGL — ta sama
  treść w zwykłym przepływie.
- **Korekty po zrzutach:** lampa i okno na prawą stronę (nagłówek tracił kontrast na oświetlonym
  blacie), dziury w karteczkach (wygięcie arkusza schodziło pod blat), pudełko pod nagłówkiem EN,
  nagłówek EN w trzech liniach (kolumna hero w `vw`), formularz wychodzący poza ekran laptopa.
- **Kalibracja smaku:** Łukasz: „Akceptuję hero w tej postaci.” Trzy kadry wzorcowe w
  `docs/zasoby/STRONA/builds/biurko/kalibracja/` (PL 1366, EN 1366, PL 1920; JPEG, 464 KB).
- Lekcje L-0212…L-0215, destylat odświeżony (dopięta też L-0211, odłożona przy akceptacji planu).

**Zweryfikowane — jak dokładnie:**

- Testy: `node --test "site/**/*.test.mjs"` → 91 pass, 0 fail (konfigurator: 96 kombinacji × 2 języki
  z licznikiem, „nic nie wybrano”, round-trip `encodeURIComponent`). Komenda z promptu
  `node --test site/` w Node 24.13.1 kończy się „Cannot find module” dla każdej treści — rozjazd
  instrumentu, L-0212.
- Fakty: `fakty.json` 15 komend = 15 plików `adapters/claude-code/commands/*.md`; wersje równe
  `marketplace.json` (sprawdzone osobnym skryptem); dwa przebiegi — sha256 identyczne.
- Generator: para `hreflang` (+ `x-default`), 0 znaczników `{{`/`}}`, drugi przebieg „bez zmian”
  i sumy sha256 identyczne (pliki nieśledzone, więc suma zamiast `git diff`).
- Sieć i konsola (DevTools, pełne przewinięcie, PL i EN): żądania tylko `localhost` i
  `api.github.com/repos/nowilus/relai/releases` (304); 0 komunikatów konsoli; grep `src`/`href`/`url()`
  z `https?://` w `site/` — jedynie `href` do repo na GitHubie, kontrola pozytywna trafia.
- Hero: zrzuty otwarcia, środka i wyjścia przy 1366 × 768 i 1920 × 1080 (FAKT, współrzędne ekranowe
  okno / głowa lampy / kubek): 1366 — (1273,62)→(1355,−210), (1003,246)→(982,71), (1253,739)→(1232,790);
  1920 — (1790,87)→(1905,−294), (1410,346)→(1380,100), (1762,1039)→(1732,1111). Przesunięcia różne;
  względem dalekiego planu najwięcej rusza się bliski (BRIEF poprawiony: pochylenie kamery przesuwa
  w pikselach najbardziej plan daleki).
- Kontrast na złożonym kadrze (tło z `opacity: 0` na tekście, najjaśniejszy piksel pod linią),
  cztery warianty PL/EN × 1366/1920: nagłówek najgorzej 6,34 : 1, zdanie 4,94 : 1, przycisk
  5,36 : 1; kontrola pozytywna (kartka-logo) ~1,1 : 1. Pierwszy przebieg dał 1,00 : 1 przez
  instrument (L-0213), drugi 3,63 : 1 dla zdania — zwężone do 28 rem i mocniejszy scrim w rogu.
  Nagłówek w dwóch liniach w obu językach i rozmiarach, zdanie 20 słów, wezwanie w kadrze.
- Przystanki: przewinięcie co 40 px — mapa przechodzi 0…6, tekst każdego dochodzi do pełnej
  widoczności; klik w mapę (2–6) i Tab ×8 + Enter na „Komendy” → `#komendy`, fokus `t-5`.
- Konfigurator w scenie: `elementFromPoint` na ekranie laptopa trafia etykietę formularza, klik
  zmienia komendy i uwagi, linki ukryte dla Cursora; „Kopiuj” → schowek systemu (`Get-Clipboard`)
  ma trzy komendy; polecenie nie zaczyna się od „/”. Schemat `claude-cli` zarejestrowany
  (`claude.exe --handle-uri`); otwarcie na żywo nie sprawdzone — decyzja Łukasza: bramka przed E5.
- Bez WebGL (`getContext` podmienione na `null`): brak płótna, 7 sekcji z opacity 1, konfigurator
  i „Kopiuj” widoczne, 0 komunikatów konsoli.
- Wydajność hero (`FAKT`, 1366 × 768, DPR 1, Chrome z ANGLE na RTX 4070 Ti): przewijanie 4 s —
  mediana klatki 5,60 ms, p95 5,60 ms (limit odświeżania 180 Hz); CPU ×4 — mediana 5,60 ms, p95
  11,10 ms, scena gotowa 4,0 s od wejścia. JS: 2148 KB surowo, 433 KB po `gzip -9` (lokalny serwer
  bez kompresji).
- Bezpieczeństwo: `grep innerHTML|outerHTML|insertAdjacentHTML|document.write` w `site/js` i
  `site/biurko` — 0 trafień (kontrola pozytywna trafia); formularz bez `action`/`method`.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E1/`: przed 37 plików / 31 255 344 B, po — usunięty
  po „tak” Łukasza (trzy kadry zachowane w `docs/`). Poza katalogiem: `%TEMP%\relai-three-0.186.1`
  (paczka npm) — skasowana po skopiowaniu plików; podgląd przez serwer `serve.mjs` scroll-craft w tle
  (port 4520), `.claude/launch.json` dostał wpis `strona` (lokalny, poza commitem).

**Świadomie odłożone:**

- Szczyt „bałagan → porządek”, szuflady po kliknięciu, makiety pasków z kodu pluginów, dopracowanie
  przystanków 2–7, rozmycie pierwszego planu — E2.
- Telefon, pełne reduced motion, plakat bez WebGL z finalnego ujęcia, budżet na słabej grafice —
  E4. Ścieżka `~/narzedzia/relai` w PowerShellu (Cursor/Codex) niezmierzona — strona mówi o
  `C:/Narzedzia/relai` uwagą; pomiar w E5.
- Rotacja ryzyk zablokowana (0 zamkniętych, 13 KB przy progu 12): propozycja — przenieść historię
  wiersza C1 (~3 KB) do archiwum mitygacji przy najbliższym przeglądzie ryzyk.
- `node -e` z `\n` przy edycji `obiekty.js` (L-0215) i chwilowe `git add -N` (cofnięte, L-0212) —
  bez skutków w plikach, zapisane jako lekcje.

**Do zrobienia przez człowieka:**

- Próba linku „Otwórz w terminalu” (`claude-cli://open?q=…`) na żywo w Chrome — przed E5.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI: Aneks A — realistyczne biurko z modeli CC0, sześć etapów

**Zrobione:**

- Commit E1 `a097b35` (64 pliki; poza nim `.claude/`, zmiany PANEL_CODEX i makiety panelu).
- Łukasz po E1: biurko z kodu „widać, że jest narysowane”, „brakuje tamtych detali”, „wszystko
  jest takie, no widać, że wygenerowane jednak przez AI stylistycznie”; chce realizmu („żeby było
  wiadomo, że to jest biurko, to jest szuflada, to jest komputer”) w kolorystyce RelAI.
- Wywiad, dwie rundy. Warstw zdjęć 2.5D nie chce: „chciałbym tą swobodną kamerę”; obrazy z GPT
  image tylko poglądowo — wygeneruje je sam z moich promptów. Wybory: modele CC0 (Poly Haven,
  ambientCG), budżet ok. 8 MB, hero od nowa, same obrazy bez klipów, nowy etap przed szczytem.
- [Aneks A](plany/STRONA_RELAI/PLAN.html) dopisany (sekcja 10): technika z modeli i materiałów CC0
  z `GLTFLoader`, GPT image wyłącznie jako wzorzec, budżet, etapy 5 → 6 (nowy E2 „Realistyczny
  świat i hero od nowa”, dawne E2–E5 → E3–E6), bramka obrazów wzorcowych, ryzyka.
  Akceptacja: „Akceptuję Aneks A w tej postaci.”
- [PROMPTY_GPT_IMAGE.md](zasoby/STRONA/builds/biurko/referencje/PROMPTY_GPT_IMAGE.md) — osiem
  promptów EN z instrukcją dla ChatGPT; wpis w `ARTEFAKTY.md` (wersja 1).
- `STATUS.md` (6 etapów, bramki z nowymi numerami), `PROMPT_ETAP_2.md` wygenerowany od nowa dla
  nowego E2 (stary prompt szczytu i szuflad — w `a097b35`, materiał dla promptu E3), `STATE.md`,
  `CLAUDE.md`, ryzyka T1–T3.

**Zweryfikowane — jak dokładnie:**

- Codex CLI 0.155.1: `codex features list` → `image_generation stable true` (FAKT); generowanie
  zostaje po stronie Łukasza w ChatGPT, z jego wyboru.
- Przed commitem E1: indeks bez `.claude/`, PANEL_CODEX i makiet (`grep` po liście plików → pusto),
  zero wzorców kluczy (`grep -c` → 0); testy `node --test "site/**/*.test.mjs"` → 91 pass.
- `PROMPT_ETAP_2.md` (pierwsza wersja): zasady aktywne wstawione funkcją, suma bloku równa źródłu
  (`bd026c03abbd4815`); komenda grep z Weryfikacji poprawiona po realnym przebiegu (bez `-r` nie
  przeszukiwała katalogów, trafiała test-strażnik).

**Świadomie odłożone:**

- Sekcje 7–9 planu mówią „po E3 / przed E5” w starej numeracji — aneks każe je czytać jako
  „po E4 / przed E6”, sekcji zamrożonych nie poprawiam.
- Rotacja ryzyk dalej zablokowana (0 zamkniętych, sekcja ponad progiem 12 KB); propozycja z wpisu E1
  (historia C1 do archiwum) bez zmian.

**Do zrobienia przez człowieka:**

- Obrazy wzorcowe `01-hero.png` … `08-wieczor.png` z GPT image do
  `docs/zasoby/STRONA/builds/biurko/referencje/` — przed E2.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI: obrazy wzorcowe 01–08 dostarczone, bramka przed E2 zamknięta

**Zrobione:**

- Łukasz wygenerował w ChatGPT obrazy z [PROMPTY_GPT_IMAGE.md](zasoby/STRONA/builds/biurko/referencje/PROMPTY_GPT_IMAGE.md)
  i dodał `07b-materialy-neutralne.png` (poprawka „neutral white daylight, flat even lighting…”).
- Ocena 01 (przed zapisem): wygląda jak zdjęcie — zużyty orzech z rysami, kurz w świetle lampy,
  rozmyte miasto w oknie, wysunięta szuflada; układ jak hero E1 (lampa i okno po prawej). Krzesło
  ze swetrem w lewym dolnym rogu to ciemny pierwszy plan pod nagłówek (kontrakt warstw).
  Odstępstwa: jeden stos kartek zamiast czterech dokumentów (pokazuje je 03), rośliny spoza
  promptu (w 3D najdroższe — raczej jedna), dodatkowe zdjęcia na tablicy. Przyjęte bez poprawek.
- Ocena 07: faktury i połysk dobre (słoje z sękiem, zagięcie papieru, granulki korka z dziurką,
  miedź lampy ze szlifem, szkliwo kubka z pęcherzykami, odcisk na aluminium), ale ciepłe boczne
  światło podbarwia barwy — stąd `07b` jako źródło barw.
- Spójność serii (przegląd 03, 05, 06, 07b): to samo biurko, kubek w terakocie, lampa z mosiężną
  stopą, roślina, drewniane pudełko z przekładkami terakota / musztarda / szałwia.
- `STATUS.md`: bramka zamknięta; `PROMPT_ETAP_2.md` (niewykonany) — komenda bramki `0[1-8]-*.jpg`
  zamiast `*.png` i wskazanie `07b` jako źródła barw.
- Decyzja Łukasza przy commicie: do repo kopie JPEG q90, oryginały PNG zostają lokalnie
  (`.gitignore`: `docs/zasoby/STRONA/builds/biurko/referencje/*.png`). Konwersja przez .NET
  `System.Drawing` w PowerShellu (`ffmpeg` nie ma na `PATH`), skrypt `%TEMP%/relai-png-do-jpeg.ps1`
  skasowany po przebiegu.

**Zweryfikowane — jak dokładnie:**

- Nagłówki plików: 9 × PNG 1536 × 1024, razem ~20 MB; `ls 0[1-8]-*.png | wc -l` → 8, a stara
  komenda z promptu (`*.png | wc -l`) dałaby 9 — bramka nie przeszłaby mimo kompletu, stąd poprawka.
- JPEG: 9 plików 1536 × 1024 (nagłówek SOF), razem 2,4 MB (FAKT, 20,1 → 2,4 MB); kadr `01-hero.jpg`
  obejrzany — bez widocznych artefaktów. `git check-ignore`: PNG ignorowany, JPEG śledzony.

**Do zrobienia przez człowieka:** brak.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI E2: realistyczny świat z zasobów CC0, kalibracja w czterech rundach, Aneks B

**Zrobione:**

- **Model:** etap ruszył na Sonnet 5.5 mimo wymaganego Opus 5.5 — zgoda Łukasza na karcie startu
  („Tak, zaczynamy E2 na bieżącym modelu mimo rozjazdu.”). W trzeciej rundzie kalibracji Łukasz:
  „zagapiłem się i widzę, że działamy na Sonnet 5.5 i może stąd wyszły takie problemy. Przepinam się
  na Opus 5.5” — od tej chwili sesja na Opus 5.5 (L-0220).
- **Analiza wzorców:** [ANALIZA.md](zasoby/STRONA/builds/biurko/referencje/ANALIZA.md) — co z każdego
  z obrazów 01–08, barwy z `07b` mierzone próbką pikseli, proporcje w metrach, tabela „obiekt →
  zasób CC0 albo kod”, odrzucone kandydaty.
- **Zasoby CC0 w `site/zasoby/`** (62 pliki, wykaz z sumami w `ZRODLA.json`, licencje w
  `LICENCJE.md`): modele Poly Haven `desk_lamp_arm_01`, `potted_plant_02`, `stationery_supplies`,
  `office_notepads`, `standing_picture_frame_02`, `hanging_picture_frame_02`, `alarm_clock_01`;
  tekstury `wood_cabinet_worn_long` (blat, kolor z obniżonym nasyceniem pod orzech z `07b`),
  `painted_plaster_wall`, Cork001 (2K), Paper006, Paper002, Metal011; HDRI `comfy_cafe` zmniejszony do
  512 × 256. Dodatki three.js 0.186.1 z tej samej paczki: `GLTFLoader`, `HDRLoader`,
  `BufferGeometryUtils`, `SkeletonUtils`, efekty obrazu (`EffectComposer`, `GTAOPass`, `BokehPass`,
  `OutputPass` z importami); lista w `vendor/three/VERSION`.
- **Scena** (`site/biurko/`, nowe moduły `zasoby.js`, `materialy.js`, `geometria.js`,
  `przedmioty.js`, `wyposazenie.js`, `miasto.js`): ładowanie dwuetapowe (hero, potem reszta po
  pierwszej klatce), środowisko z HDRI, lampa jako jedyne mocne ciepłe źródło, AgX, cienie kontaktowe
  (GTAO) i płytka głębia ostrości; biurko z deskami ze słojami i wysuniętą szufladą, ściana z otworem
  okiennym, za oknem miasto z brył (atlas fasad, jedno wywołanie rysowania, latarnie w dole),
  tablica korkowa w profilowanej ramie z orzecha z pinezkami, nitką i notatkami, laptop z
  instancjonowaną klawiaturą i napisami QWERTY, kubek z kamionki (gruba krawędź, szkliwo z
  plamkami, glina na stopce, filcowa podkładka), książki, kable z gniazdkiem, ramki, budzik, roślina.
  Proceduralne niebo z E1 i `RoomEnvironment` usunięte.
- **Kalibracja smaku — cztery rundy** (strona porównań wzorzec | propozycja w panelu przeglądarki):
  1. Łukasz: „ta Twoja propozycja to się jakoś wielce nie różni od tego co było na początku… nadal
     te ściany, tablice, biurko, laptop, okno, lampka, notatki itd są zbyt płaskie i za mało
     doszczegółowione” → AO, głębia ostrości, tekstury 2K, modele ramek i zegara, książki, kable;
     budżet: „Nie musimy się jakoś wielce ograniczać budżetowo, bo ma to być dopracowane”.
  2. „Prawie, ale mam uwagi” (wszystkie cztery obszary) → mocniejsza kałuża światła lampy, ciemniejsze
     drewno i ściana.
  3. „popraw proszę słoje na drewnie na blacie… widok zza okna musi być prawdziwy… tablica korkowa
     musi być przerobiona, bo jej obramowanie jest teraz nijakie i tandetne… Popisz się” → nowy skan
     desek, otwór w ścianie, rama z orzecha, napisy klawiatury.
  4. (już Opus) „ten kubek jest zbyt mało dopracowany… tło za oknem jest zbyt futurystyczne… nadal
     jesteśmy jednak całkiem daleko” → ocena kadru po kategoriach: brakuje światła odbitego, połysku
     lakieru, obiektywu; kubek i zwykłe miasto z brył 3D poprawione od razu. Kierunek: „Path tracing
     na przystankach (Rekomendowane)” i „Zamknąć E2 + nowy etap aneksem (Rekomendowane)”;
     zamknięcie: „Tak, zamknij E2 (Rekomendowane)”.
- **Uwagi po zamknięciu kalibracji:** ekran laptopa ma być „jednym bytem” z przybliżeniem po
  kliknięciu, książki „bardzo, bardzo słabo odoszczegółowione”; wykryty błąd z E1: konfigurator
  w trybie 3D leży w `.scena` z `aria-hidden="true"`. Decyzja Łukasza: „Osobny etap w Aneksie B”.
- **[Aneks B](plany/STRONA_RELAI/PLAN.html)** (akceptacja: „Tak, dopisz Aneks B (Rekomendowane)”):
  E3 „Laptop jako prawdziwy ekran i detale”, E4 „Fotorealizm na przystankach” (path tracing MIT na
  postoju), dawne E3–E6 → E5–E8, pułap 10 MB, ryzyka T4–T6.
- `site/README.md`: skąd zasoby, jak dodać nowy, jak zmierzyć budżet i płynność.
- Lekcje L-0216…L-0220, destylat odświeżony (zasada 4 „Na żywo”, zasada o wyglądzie — „Scena 3D”).

**Zweryfikowane — jak dokładnie:**

- Bramka: 8 plików `0[1-8]-*.jpg` przed pierwszą zmianą w `site/`.
- Testy: `node --test "site/**/*.test.mjs"` → 98 pass, 0 fail (91 z E1 + 7 testów rejestru źródeł);
  kontrola pozytywna na kopii `site/zasoby/` z dopisanym `tekstury/obcy.jpg`: `sprawdzZasoby` →
  „plik bez wpisu w ZRODLA.json”, na oryginale `[]`.
- Karty zgody przed każdym pobraniem (trzy rundy): „Tak, cała lista (Rekomendowane)”, „Tak, Paper006
  i Paper002 (Rekomendowane)”, „Tak, wszystko (Rekomendowane)” (drewno, panorama). Panorama
  `shanghai_bund` i drewno `wood_table_large` pobrane, ale nieużyte (miasto „zbyt futurystyczne”,
  drewno odrzucone w porównaniu) — nie weszły do `site/`.
- Sieć (DevTools, wejście i pełne przewinięcie, PL i EN): 109 / 107 żądań, wszystkie `localhost`,
  0 odpowiedzi ≥ 400; `api.github.com` w tym przebiegu nie wystąpiło (wersja z pamięci sesji).
  Grep `src`/`href`/`url()` z `https?://` w `site/` — tylko `href` do repo GitHuba (kontrola
  pozytywna trafia); adresy stron zasobów wyłącznie w `ZRODLA.json` i `LICENCJE.md`.
- Budżet (FAKT, lista żądań z przeglądarki, rozmiary plików z dysku): zestaw hero 63 pliki,
  6,48 MB surowo / 4,54 MB z `gzip -9` dla tekstu; etap drugi 47 plików, 4,51 / 4,46 MB; całość
  10,99 / 9,00 MB. DevTools: 11 543 902 B przesłane bez kompresji serwera podglądu = 10,99 MB plików
  + ok. 30 KB nagłówków. Przekroczenie 8 MB → pytanie; Łukasz: „Tak, pułap ok. 10 MB
  (Rekomendowane)”. JS: 2447 KB surowo, 514 KB gzip (E1: 433 KB).
- Wydajność (FAKT, 1366 × 768, DPR 1, RTX 4070 Ti, równe przewijanie całej strony 9 s): zwykły
  przebieg mediana 5,60 ms, p95 5,60 ms (sufit odświeżania 180 Hz); CPU ×4 mediana 11,10 ms,
  p95 16,70 ms (E1: 5,60 / 11,10). Wywołania rysowania na klatkę 913, trójkąty 563 577 (wszystkie
  przejścia; opakowanie `drawElements`/`drawArrays`). Pierwsza klatka ≈ 1,1 s lokalnie (start
  ładowania etapu drugiego po dwóch klatkach).
- Hero: 12 zrzutów (otwarcie, środek, wyjście × PL/EN × 1366/1920) w katalogu roboczym. Plany
  (1366, PL; okno / źródło lampy / kubek) przy scrollu 0 → 768: (1398,168)→(1827,−788),
  (1041,229)→(1079,−595), (1250,680)→(1213,466) — przesunięcia 1048, 825 i 217 px, różne.
- Kontrast na złożonym kadrze (tło z `opacity: 0` na rodzicu tekstu, 95. percentyl luminancji pod
  prostokątem tekstu): 1366 PL/EN — nagłówek 10,53 : 1, zdanie 6,49 : 1; 1920 PL/EN — 12,15 : 1
  i 8,82 : 1; kontrola pozytywna (kartka-logo na korku) 1,59 : 1.
- Przystanki: klik w mapę 0…6 → hash i `aria-current` zgodne; przewijanie co 1/20 strony przechodzi
  0…6; Enter na fokusie mapy (`#biurko`, `#plan`) i Tab z „Komendy” + Enter → `#instalacja`.
  Konfigurator na nowym laptopie: `elementFromPoint` w środku ekranu → formularz; klik „Codex”
  (prawdziwe kliknięcie DevTools, z czasowo zdjętym `aria-hidden`, żeby dostać identyfikator) zmienia
  komendy na cztery linie Codeksa; „Kopiuj” → `Get-Clipboard` zwraca te same cztery linie.
- Bez WebGL (`getContext` → `null` w `initScript`): pierwsza asercja `tryb` pusty, bez płótna,
  konfigurator w przepływie, 0 komunikatów konsoli. 404 (`desk_lamp_arm_01.bin` podmieniony
  w `fetch`): tryb przepływu, konfigurator widoczny; w konsoli wpis sieciowy przeglądarki
  „Failed to load resource: 404” i `warn` z kodu („RelAI: the desk scene is off…”) — `console.error`
  z kodu: 0.
- Konsola przy wejściu i pełnym przewinięciu PL i EN: 0 komunikatów.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` w `site/js`
  i `site/biurko` bez testów → kod 1; z testami trafia `wersja.test.mjs`; zasoby ze ścieżek
  względnych (`new URL("../zasoby/", import.meta.url)`); formularz bez `action`/`method`.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E2/`: przed 320 plików / 201,9 MB, po — usunięty
  po „tak” Łukasza; razem z nim `site/_tmp-kalibracja/` (11 plików, 1,6 MB, strona porównań).
  Zestawienia kalibracji zostały w `docs/zasoby/STRONA/builds/biurko/kalibracja/`. Poza katalogiem:
  `%TEMP%\relai-three-0.186.1` (paczka npm three.js, 5,4 MB) — zostaje dla E3–E4; serwer podglądu
  `serve.mjs` na porcie 4520 w tle.

**Świadomie odłożone:**

- Fotorealizm (światło odbite, połysk lakieru, poświata obiektywu) — E4 (Aneks B).
- Ekran laptopa jako jeden byt z przybliżeniem, dostępność konfiguratora w trybie 3D, książki od
  nowa — E3 (Aneks B).
- Krzesło ze swetrem z `01-hero` i encyklopedia (`book_encyclopedia_set_01`, pobrana, nieużyta) —
  pominięte; pierwszy plan pod nagłówkiem zostaje ciemnym blatem.
- Wąski panel (440 px): karta „Zacznij tutaj” przykrywa laptopa — telefon i wąskie okna to E7.
- Ostrzeżenie ANGLE X4122 w konsoli zniknęło po wejściu kompozytora; nie wróciło w pomiarach.
- Rotacja ryzyk dalej zablokowana (0 zamkniętych; sekcja ponad progiem 12 KB, teraz z T4–T6) —
  propozycja z wpisu E1 (historia C1 do archiwum mitygacji) bez zmian.

**Do zrobienia przez człowieka:** brak nowych pozycji (bramki „Próba linku `claude-cli://`”, „Wybór
wersji”, „GitHub Pages” — bez zmian, z numeracją Aneksu B w `STATUS.md`).

Autor: RelAI (Sonnet 5.5, od czwartej rundy kalibracji Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI E3: laptop jako prawdziwy ekran, przybliżenie, dostępność, książki od nowa

**Zrobione:**

- **Ekran jako aplikacja** (`site/css/strona.css`, `site/narzedzia/szablon.html`, `site/tresc/*.json`):
  konfigurator wypełnia matrycę 16:10 jako okno — pasek z kropkami w barwach RelAI, tytułem
  „RelAI · instalacja” / „RelAI · install” i przyciskiem „Wróć do biurka”, dwie kolumny (wybór |
  komendy, uwagi, akcje) i pasek stanu z wersjami; refleks szkła i spadek jasności ku krawędziom
  w `::after`. W przepływie bez WebGL formularz wygląda jak po E1 (pasek okna ukryty).
- **Matryca jak w prawdziwym laptopie** (`site/biurko/przedmioty.js`) — po dwóch uwagach Łukasza
  w trakcie: „widzisz te zaokrąglenia ramek”, „sam laptop też ma swoją ramkę… na dole tuż nad
  widokiem klawiatury”, „tyle samo czarnego paska na górze jak i na dole”. Czarne szkło leży na
  powierzchni klapy (było 2,8 mm przed nią), ma rogi za obrysem klapy, matową uszczelkę 1 mm i równą
  ramkę 8 mm z czterech stron; pod nim pas aluminium nad zawiasem. Matryca i HTML mają ten sam
  promień rogów (4 mm u góry, 2 mm u dołu; `PROMIEN_EKRANU`).
- **Poświata ekranu** (`site/biurko/scena.js`): `RectAreaLight` w barwie `#bccbe8`, natężenie 1,1 —
  dodatek `RectAreaLightUniformsLib` + `RectAreaLightTexturesLib` z tej samej paczki three.js 0.186.1,
  wpis w `vendor/three/VERSION`.
- **Przybliżenie** (`site/biurko/przyblizenie.js` — czysta logika: stany, przejścia, poza kamery na
  wprost ekranu, rzut punktu, mieszanie póz): klik albo Enter na ekranie, a także fokus kontrolki
  w środku przybliżają kamerę, aż ekran zajmie 90 % ciaśniejszego boku kadru; Esc, przewinięcie
  wstecz, przycisk „Wróć do biurka” i opuszczenie przystanku oddalają. W przybliżeniu mapa, nagłówek
  i karta przystanku schodzą z kadru. `prefers-reduced-motion` → skok w jednej klatce.
- **Dostępność w trybie 3D** (`site/biurko/scena.js`, `warstwa.js`, `swiat.js`): warstwa CSS3D stoi
  w sekcji „Instalacja” w miejscu formularza, poza `.scena[aria-hidden]`; ekran jest grupą
  z etykietą i `tabindex="0"`. Sekcja nie przesuwa się przy wygaszaniu (przesunięcie zsuwałoby ekran
  z laptopa).
- **Usterka z E1 naprawiona przy okazji punktu 6 Weryfikacji:** błąd etapu drugiego zasobów albo utrata
  kontekstu WebGL chowały konfigurator razem ze sceną; teraz formularz wraca na swoje miejsce
  w treści bez stylów 3D, a nasłuchy warstwy są zdejmowane.
- **Książki od nowa** (`site/biurko/wyposazenie.js`): cztery twarde oprawy z płótna (krem, greige,
  szałwia, glina) jako wyciągnięty przekrój „C” z wypukłym grzbietem, okładki wystające 3 mm nad blok
  stron, wypaczenie wierzchu, przetarcia rogów i krawędzi w barwie wierzchołków, splot płótna jako
  mapa i wypukłość, zakładki indeksu przy krawędzi stron, złocone tytuły na grzbietach (DZIENNIK,
  DECYZJE, LEKCJE, PLAN i znak RelAI) wygięte po krzywiźnie; stos obrócony grzbietami do kamer
  „Panel” i „Instalacja”. Bez nowego zasobu CC0.
- **Testy** `site/biurko/przyblizenie.test.mjs` (64 przypadki) — napisał subagent Sonnet 5.5,
  przejrzane i sprawdzone przed przyjęciem.
- `site/README.md`: jak działa ekran i przybliżenie, jak sprawdzić wpasowanie; budżet w MiB.
- Lekcje L-0221…L-0224, destylat odświeżony (zasady 4, 6, 15).

**Zweryfikowane — jak dokładnie:**

- Testy: `node --test "site/**/*.test.mjs"` → 162 pass, 0 fail (98 z E2 + 64). Kontrola pozytywna na
  kopii modułu w `%TEMP%`: `cel` przesunięty o 0,3 m → 32 testy kadru padają; subagent: mnożnik
  wypełnienia 1,4 → 16 testów pada.
- Wpasowanie (DevTools, skrypt `pomiar.js`): różnica narożników `[data-ekran]` i rzutu siatki
  ≤ 0,04 px przy 1366 i 1920, PL i EN, na przystanku i w przybliżeniu (8 położeń); przed usunięciem
  przesunięcia `translateZ(0.0004)` było do 1,11 px. 0 z 96 kombinacji formularza z przepełnieniem
  w każdym położeniu; formularz poszerzony o 40 px → „ekran 1176x710” (kontrola pozytywna).
- Przybliżenie: klik (prawdziwy, panel przeglądarki) i Tab + Enter (DevTools) → ekran 81 % szerokości
  i 90 % wysokości kadru; Esc i przewinięcie o 60 px wstecz → udział 0,392 / 0,435 jak w pozie
  przystanku; zmiana rozmiaru okna przy przybliżeniu zostawia stan (po poprawce L-0224); przy
  `prefers-reduced-motion` sześć kolejnych klatek: przybliżenie 1,1,1…, oddalenie 0,0,0….
  Zrzuty przystanku, przejścia (z ≈ 0,2 przy 1366, 0,35 przy 1920) i przybliżenia w katalogu roboczym.
- Interakcja w przybliżeniu: `elementFromPoint` w środkach pięciu kontrolek → formularz (5/5);
  prawdziwe kliknięcie „Codex” zmienia komendy; „Kopiuj” → `Get-Clipboard` zwraca cztery linie Codeksa.
- Dostępność: migawka DevTools bez zdejmowania `aria-hidden` pokazuje grupę ekranu, formularz, radia,
  pola wyboru i „Kopiuj”; z mapy „Instalacja” fokus na nagłówku, Tab → ekran; `.scena` nadal
  `aria-hidden="true"`; w przybliżeniu mapa i nagłówek znikają z drzewa dostępności, pojawia się
  „Wróć do biurka”.
- Bez WebGL: pierwsza asercja — brak `tryb-3d`, komunikat o braku sceny; formularz 760 × 548 w sekcji,
  bez paska okna i `tabindex`; 0 komunikatów konsoli. 404 na `alarm_clock_01_1k.gltf` (etap drugi)
  i `desk_lamp_arm_01_1k.gltf` (etap pierwszy) przez podmianę `fetch`: tryb przepływu, formularz na
  swoim miejscu przed stopką, styl pusty; jedyny komunikat to `warn` z kodu, `console.error` 0.
- Poświata (jasność regionu klawiatury z PNG, kontrola na regionie bez zmian 74,19 w obu): z
  natężeniem 2,2 luminancja 60,28 wobec 40,84 bez światła (+48 %), kanał niebieski 61,78 / 36,88;
  natężenie obniżone do 1,1.
- Budżet (lista żądań przeglądarki, pliki z dysku, tekst `gzip -9`): 113 plików, 9,55 MB = 9,11 MiB;
  ten sam instrument na drzewie HEAD (worktree) → 9,44 MB = 9,00 MiB, czyli liczba E2 była w MiB
  (L-0223); E3 dokłada 0,11 MB (`RectAreaLightTexturesLib` 107 KB gzip).
- Płynność (1366 × 768, DPR 1, RTX 4070 Ti, okno na wierzchu, CPU ×4): równe przewijanie 14 s —
  mediana 11,9 ms, p95 22,2 ms; przybliżanie i oddalanie p95 13,1 ms. Wywołania rysowania na klatkę:
  mediana 676, najwięcej 907 (E2: 913).
- Konsola i sieć przy wejściu, pełnym przewinięciu i przybliżeniu: PL 112 żądań, EN 110, wyłącznie
  `localhost:4520`, 0 odpowiedzi ≥ 400, 0 komunikatów; `api.github.com` w tych przebiegach nie wystąpiło.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` w `site/js`
  i `site/biurko` bez testów → kod 1, z testami trafia `wersja.test.mjs`; formularz bez
  `action`/`method`; adresy bezwzględne w szablonie tylko do repo GitHuba.
- **Kalibracja smaku:** strona porównań (przystanek | E2, przybliżenie | `05-laptop`, książki |
  `08-wieczor`, `01-hero`) w przeglądarce Łukasza; werdykt: „Akceptuję ekran, przybliżenie
  i książki w tej postaci. Zamykaj E3.”
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E3/`: przed 45 plików / 46 MB, po — usunięty po
  „Tak, skasuj (Rekomendowane)” Łukasza (krok 1a). Poza katalogiem: `%TEMP%\relai-three-0.186.1` (paczka three.js, dopakowane
  dwa pliki `lights/`) — zostaje dla E4; `%TEMP%\relai-e3-kontrola` i worktree `%TEMP%\relai-e3-head`
  — usunięte zaraz po pomiarze; serwer podglądu `serve.mjs` na porcie 4520 (z poprzedniej sesji)
  w tle; przeglądarka DevTools MCP z poprzedniej sesji (PID 51612, osierocona) zamknięta, żeby MCP
  mógł wystartować.

**Świadomie odłożone:**

- Zapas p95 przewijania przy CPU ×4 spadł z 9,3 do 3,8 ms (poświata liczona w każdym materiale) —
  do pomiaru razem z path tracingiem w E4; wyłącznik dla słabego GPU może wyłączać też poświatę.
- Jasna kropka w kadrze (raz przy górnej ramce w przybliżeniu, raz na ciemnej ścianie przy książkach;
  widoczna już w kadrze E2) — nie zdiagnozowana; do rozbioru kadru w E4.
- Napisy na grzbietach przy przystanku „Instalacja” rozmywa głębia ostrości (ostrość na ekranie) —
  zamierzone.
- Hook bramki zgody optymalizatora odpalił pytanie na powiadomieniu subagenta (zdarzenie bez
  polecenia człowieka) — ta sama klasa co L-0189; pytanie zadane dopiero przy następnej wiadomości
  Łukasza. Do odnogi poprawek hooków, jeśli Łukasz zechce.
- Rotacja ryzyk dalej zablokowana (sekcja 15,5 KB przy progu 12 KB, 0 zamkniętych).

**Do zrobienia przez człowieka:** brak nowych pozycji (bramki „Próba linku `claude-cli://`”, „Wybór
wersji”, „GitHub Pages” — bez zmian w `STATUS.md`).

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI E4: path tracing zbudowany, zmierzony i odrzucony; test detalu; Aneks C

**Zrobione:**

- **Karta zgody na zależność** pokazana przed pobraniem: `three-gpu-pathtracer` 0.0.27
  i `three-mesh-bvh` 0.9.16 (MIT, peer three ≥ 0.185 / ≥ 0.159), rozmiary z rejestru npm; odpowiedź
  Łukasza: „Tak, pobierz (Rekomendowane)”. Integrity obu paczek zgodne z rejestrem; do `site/vendor/`
  trafiło wyłącznie domknięcie importów (127 modułów, 512 321 B, 157 467 B po `gzip -9`).
- **Path tracing na postoju** (`site/biurko/fotorealizm.js`, `postoj.js` + 39 testów subagenta
  Sonnet 5.5, integracja w `scena.js`): niższa warstwa biblioteki bez przestarzałego
  `WebGLPathTracer`, mieszanie rastra i obrazu z path tracera w liniowym HDR przed jednym
  tone mappingiem, ekspozycja dopasowana bisekcją do średniej luminancji rastra po AgX, odszumianie
  w skali ściśniętej c/(1+c), punkty (miasto, kurz) nad obrazem z bufora głębi, wyłącznik (dotyk,
  wąskie okno, reduced motion, renderer programowy lub zintegrowany, wolna klatka), wymuszenie
  `localStorage.relai-fotorealizm`. Dwa błędy generatora obejście po stronie strony: instancje
  i siatki wielomateriałowe rozbijane na czas budowy (L-0225).
- **Ocena Łukasza:** „to wygląda po prostu źle i słabo i ja nie widzę tutaj żadnego jakiegoś wielkiego
  uzysku… głównie chodzi tutaj o jakość tych tekstur, o doszczegółowienie, doprecyzowanie” (L-0226);
  do tego ekran ładowania ma zasłaniać stany pośrednie. Kierunek: „Test detalu na hero
  (Rekomendowane)”.
- **Path tracing usunięty** razem z zależnością, modułami i testami; poświata obiektywu
  (`UnrealBloomPass`) wypróbowana i usunięta po uwadze Łukasza („światło… świeci po oczach”).
- **Test detalu, który zostaje** (Łukasz: „Tak, przyjmuję”): blat `wood_table_worn` z Poly Haven
  (karta zgody po miniaturach obok wzorca; „Tak, pobierz (Rekomendowane)”; `ZRODLA.json`,
  `LICENCJE.md`), dokumenty z drukiem w Hanken Grotesk, dopiskami ołówkiem w Kalam, podkreśleniami,
  zażółconym brzegiem i śladem kubka (`tekstury.js`), cienki lakier blatu (`LAKIER`, clearcoat 0,3 /
  0,12, `materialy.js`), lampa 17 → 9, światło odbite 0,45 → 0,2, ściana 0,6 → 0,22, hemisfera
  0,13 → 0,05, otoczenie 0,24 → 0,13, łagodniejsza głębia ostrości (`scena.js`), stopka „Instalacji”
  na szkle jak mapa (`strona.css`).
- **Aneks C** w `PLAN.html` po sprostowaniu opisu Filmu (L-0228): E4 = „Test fotorealizmu
  i stonowanie światła”, E5 = Film z planu (grafika z kodu, ekran ładowania, bramka wyboru), E6 =
  Biurko pełna droga tylko przy wyborze Biurka, E7 z ekranem ładowania wybranej wersji. Łukasz:
  „Tak, dopisz (Rekomendowane)”, „Film z planu (Rekomendowane)”.
- Lekcje L-0225…L-0228, destylat odświeżony (zasady 4, 14, 15).

**Zweryfikowane — jak dokładnie:**

- Path tracing (RTX 4070 Ti, 1366 × 768, DPR 1, okno na wierzchu): hero do 256 próbek w ok. 7,5 s,
  kafle 3 × 1, wzmocnienie ekspozycji 1,19–1,28; próbka przy DPR 1,5 (2049 × 1152) 57 ms, przy
  1366 × 768 29 ms; BVH SAH 704 ms budowy i 58 ms na próbkę wobec CENTER 185 / 85 ms; budowa sceny
  path tracera 0,9–1,0 s na głównym wątku. Pomiar w tle zawyżał próbkę do 150 ms (L-0222).
- Zimna pamięć shaderów (sól w definicjach, L-0227): `compileAsync` 10,0–10,4 s bez przerw głównego
  wątku, pierwsze `update()` blokuje 8,0–9,7 s; bez mgły, głębi, MIS i ruletki 1,9 + 1,7 s, z samym
  MIS 8,7 + 7,9 s; worker z tym samym GLSL: linkowanie na głównym wątku 373 ms, rysowanie dalej 8,0 s.
  Ciepła pamięć po przeładowaniu: 51 ms.
- Błędy generatora: pudełko wypieczonej geometrii klawiatury −0,05…1,21 m wobec 0,29 × 0 × 0,18 m
  w scenie (jedyna z 175 siatek ponad 5 mm); referencyjny `WebGLPathTracer` na tej samej scenie dawał
  tę samą płytę i te same tekstury — błąd sceny, nie okablowania.
- Po usunięciu: `node --test "site/**/*.test.mjs"` → 162 pass, 0 fail (testy postoju — 39, kontrola
  pozytywna z odwróconym warunkiem dotyku 10/39 — odeszły z modułem).
- Ekran HTML: różnica narożników `[data-ekran]` i rzutu siatki 0,013 px na przystanku, 0,045 / 0,046 px
  w przybliżeniu przy 1366 / 1920; `elementFromPoint` 5/5 w obu.
- Budżet (`budzet.mjs`: lista żądań przeglądarki, pliki z dysku, tekst `gzip -9`, MiB): 113 plików,
  9,49 MiB; ten sam instrument na HEAD przez `git show` → 9,11 MiB (= FAKT E3), różnica +0,38 MiB
  (blat 1 065 846 B wobec 663 669 B).
- Płynność (CPU ×4, 180 klatek/s przed pomiarem): równe przewijanie 12 s — mediana 11,3 ms, p95 17,5 ms,
  najwięcej 910 wywołań rysowania na klatkę (E3: 907).
- Konsola i sieć przy wejściu, pełnym przewinięciu, przybliżeniu i Esc: PL i EN — 0 komunikatów,
  0 odpowiedzi ≠ 200, wyłącznie `localhost:4520`.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` w `site/js`
  i `site/biurko` bez testów → kod 1, z testami trafia `site/js/wersja.test.mjs`; formularz bez
  `action`/`method`; 0 odwołań do CDN.
- **Kalibracja smaku:** strona porównań w panelu przeglądarki (E3 | test | `01-hero`, potem
  `01-hero` i 7 przystanków po przygaszeniu) z rozbiorem na światło, materiał, obiektyw i kompozycję;
  werdykt: „Tak, przyjmuję”.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E4/`: przed 65 445 490 B w 323 plikach, po 0
  (skasowany po „Tak, skasuj”). Poza katalogiem: `%TEMP%\relai-three-0.186.1` (z E1, użyty do
  próby `UnrealBloomPass`, zostaje), serwer podglądu na 4520 z poprzedniej sesji (działa), serwer
  porównań na 4530 zatrzymany; wpis pamięci `realizm-to-detal-nie-swiatlo` poza repo.

**Świadomie odłożone:**

- Punkty weryfikacji E4 o path tracingu (3, 4, 5) — nie dotyczą (Aneks C).
- Jasna kropka z E3: na zrzutach przystanków drobne jasne punkty na ciemnym tle — hipoteza: kurz
  (`kurz()`, 90 punktów, rozmiar 4,5 mm) w stożku lampy; niepotwierdzona, do E6 (Biurko), jeśli
  bramka je wybierze.
- Rekwizyty i kompozycja hero jak we wzorcu (kamera z góry, modele zamiast brył z kodu) — E6 przy
  wyborze Biurka.
- Bramka zgody optymalizatora odpaliła pytanie na krótkim potwierdzeniu „Tak, zaczynamy E4”, które
  procedura `/relai-prompt` przepuszcza bez zmian — ta sama klasa co L-0189; do odnogi poprawek
  hooków, jeśli Łukasz zechce.
- Rotacja ryzyk (sekcja ponad progiem) i lekcji (51,7 KB przy progu 50 KB) — T4 i T5 zamknięte w tym
  etapie, rotacja do osobnej sesji.

**Do zrobienia przez człowieka:** — (bramki „Wybór wersji” po E5, „Próba linku `claude-cli://`”,
„GitHub Pages” — bez zmian w treści, terminy wg Aneksu C w `STATUS.md`).

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-16 — STRONA_RELAI E5: prototyp Film z ekranem ładowania; bramka i Aneks D

**Zrobione:**

- **Brief Filmu** (`docs/zasoby/STRONA/builds/film/BRIEF.md`). Gramatyka Filmic one-shot z uzasadnieniem.
  Droga przez 7 punktów historii w 6 aktach, krzywa odczuć, szczyt i ruch-podpis „pismo odręczne
  staje się drukiem”. Do tego tabela partytury, kontrakt warstw hero, ekran ładowania i bramka
  odcisków: 5/6 wymiarów różnych od Biurka.
- **Silnik scroll-craft 0.3.1** skopiowany bajt w bajt do `site/vendor/scrollcraft/`, razem z `LICENSE`
  (MIT) z lokalnego klonu repo przy commicie `75d81f7`, bez sieci, i z `VERSION` z sumami. Karta zgody
  na licencję, odpowiedź Łukasza: „Z klonu, bez sieci (Rekomendowane)”.
- **Strony Filmu EN i PL** (`site/film/`, `site/pl/film/`) z jednego szablonu
  `site/narzedzia/szablon-film.html`. Generator `zbuduj.mjs` buduje teraz cztery strony i składa
  fiszki komend: PL z `fakty.json`, EN z `tresc.film.fiszki`; przy rozjeździe liczby albo braku
  wpisu rzuca błąd. Treść aktów jest w `site/tresc/{pl,en}.json` pod kluczem `film`.
- **Sześć aktów**, grafika wyłącznie z kodu (`site/css/film.css`, `site/film/akty.js`):
  - wejście z warstwami paralaksy, czyli okno czatu, logo i notatka;
  - szczyt „amnezja → pamięć”: zdania przenikają się, następuje cisza, karteczki lecą łukiem
    do dokumentów i zamieniają się w wydrukowane wpisy;
  - arkusz planu odsłaniany w dół;
  - okno w przechyle 3D, które prostuje się do pasków (po wyprostowaniu `transform:none`, P-035);
  - pozioma taśma 15 fiszek z ikonami z `docs/zasoby/branding/ikony/`;
  - instalacja z reflektorem i konfiguratorem.
- **Makiety pasków** z kodu `core/panel` (`site/narzedzia/makiety.mjs` → `site/dane/makiety.json`).
  Pierwszą wersję zbudowałem z pamięci. Łukasz w trakcie: „co do paska claude code mod cache postep
  i plan to zrob sobie screeny z najnowszego Ui zebys nie wymyslal”. Makieta przebudowana według
  zrzutu okna aplikacji (L-0231): kolejność plan, postęp, cache, segmenty postępu, baterie w siatce,
  wiersz kontekstu z progiem, barwy powierzchni #212121, #151515 i #20201f zmierzone na zrzucie.
  Zrzut leży w `kalibracja/paski-aplikacja-2026-10-16.jpeg`.
- **Ekran ładowania** (`site/film/zaslona.js`, `start.js`): logo z kreską w trzech krokach (fonty,
  silnik, choreografia), limit 4 s. Przy błędzie silnika zasłona schodzi, a treść zostaje widoczna.
- **Kalibracja hero Filmu w trzech rundach**:
  - runda 1: „Jaśniejsze okno”;
  - runda 2: Łukasz najpierw o pytaniu: „musisz mi dokładnie pokazać, co zostało zrobione, co ja
    mam ocenić” (L-0229). Po stronie „co oceniasz” z obrysem padły dwie uwagi: logo nachodzące
    na terminal („czy to jest dobre rozwiązanie”) i okno ucięte po prawej („Czy nie lepiej byłoby
    go po prostu pokazać w całości?”);
  - runda 3, po przesunięciu logo i pokazaniu okna w całości: „Tak, przyjmuję”.
  Reszta aktów powstała po werdykcie.
- **Testy:** `site/film/zaslona.test.mjs`, `site/film/akty.test.mjs`,
  `site/narzedzia/makiety.test.mjs` i rozszerzony `zbuduj.test.mjs`. Napisał je subagent Sonnet 5.5
  (zadanie deterministyczne).
- **Bramka „Biurko czy Film”**, Aneks D w `PLAN.html` i lekcje L-0229…L-0232. Rotacja w tym
  rytuale: lekcje L-0192…L-0210 do `docs/archiwum/lekcje/LEKCJE_L-0192_L-0210.md` (suma
  `d8f50b2b7da9dd9b`, 57 136 → 40 179 B), zamknięte ryzyka T4 i T5 do
  `docs/archiwum/ryzyka/RYZYKA_2026-10-16.md` (suma `56335ea6405b401f`).

**Zweryfikowane — jak dokładnie:**

- `node --test "site/**/*.test.mjs"` → 229 pass, 0 fail (162 po E4 + 67 nowych). Kontrola pozytywna:
  `fakty.json` z jedną komendą mniej daje 12 fail; po przywróceniu suma pliku `83d5d15d…`
  i ponownie 229/229.
- Silnik: `sha256sum` `scrollcraft.js` `91a8e57c…` i `scrollcraft.css` `519e254c…` równe kopii
  w pluginie nateherk-design 0.3.1 i wpisowi w `VERSION`; `LICENSE` to tekst MIT (`0333ae13…`).
- Biurko nietknięte: sumy 109 plików zapisane na starcie przy HEAD `72dc0f6`, porównane po
  `zbuduj.mjs` → 0 różnic. Kontrola: kopia `strona.css` z dopisaną spacją → 1 FAILED.
- Bez WebGL i zdjęć: grep z promptu na `site/film/`, `film.css` i `szablon-film.html` → kod 1.
  Ten sam grep na `site/biurko/` trafia.
- Treść bez JS (`curl`): nagłówek, zdania szczytu, komenda instalacji i konfigurator są w HTML.
  Zrzuty każdego aktu PL 1366 × 768 obejrzane.
- Ekran ładowania: zimne wejście PL w izolowanym kontekście z pustą pamięcią, Fast 4G, CPU ×4,
  próbki co 100 ms. Do 1010 ms zasłona nieprzezroczysta i na wierzchu w 4/4 punktach, zdjęta
  ok. 1,1 s, zniknęła do 1,5 s. Silnik z podłożonym błędem: pierwsza asercja to tryb (`html`
  ma tylko klasę `film`), zasłona schodzi, nagłówki mają nieprzezroczystość 1, w konsoli tylko
  podłożony błąd i ostrzeżenie strony.
- Szczyt: `scrollBy(0, 1000)` z p = 0 kończy się na p = 0,343, a z p = 0,44 na p = 0,783, oba
  wewnątrz aktu. Model ruchu kółka to przesuw 1000 px, bo DevTools nie daje zdarzenia `wheel`.
- Budżet tym samym instrumentem co Biurko: Film 33 pliki, 0,45 MiB surowo, **0,31 MiB** po
  kompresji. Biurko 9,49 MiB (E4).
- Płynność przy CPU ×4 (179 rAF/s przed pomiarem), 14 s równego przewijania całej drogi, 2474 klatki:
  mediana 5,6 ms, **p95 5,6 ms**, najdłuższa 28,7 ms.
- Konsola i sieć przy wejściu, pełnym przewinięciu i konfiguratorze: Film PL, Film EN, Biurko PL
  i Biurko EN → 0 komunikatów, 0 nieudanych żądań, hosty tylko `localhost:4520` i `api.github.com`.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` bez testów → kod 1,
  z testami trafia `site/js/wersja.test.mjs`. Formularz bez `action`/`method`. `data-sc-src` w Filmie
  → kod 1, w kopii silnika 4 trafienia.
- **Bramka:** strona porównań w panelu przeglądarki z czterema parami kadrów (hero, szczyt, panel,
  instalacja; Biurko z lewej, Film z prawej) i tabelą liczb. Zimne wejście Biurka w tych samych
  warunkach (Fast 4G, CPU ×4): tekst od 183 ms, scena 3D od 11 797 ms, ostatni zasób 17 092 ms.
  Opcje pytania cytowały definicje wariantów z sekcji 4 (L-0228). Odpowiedź Łukasza: „Ogólnie to
  bym chciał na pewno pójść na razie w dopracowanie filmu […] docelowo chciałbym jednak wydać dwie
  wersje strony, wrzucić to do oceny przez ludzi, zebrać jakąś ankietę i później zdecydować […]
  przejdźmy przez dopracowanie filmu, a później […] możemy jeszcze trochę dopieścić bardziej to
  biurko, no i byśmy wydali wtedy dwie równoległe strony po prostu.” Odpowiedź przeczyła sekcji 9
  („drugi prototyp idzie do archiwum”), więc przed zapisem padło pytanie o kształt aneksu. Łukasz:
  „E7 Film, E6 Biurko, E8 obie (Rekomendowane)” oraz „Rozstrzygniemy przed E8 (Rekomendowane)”.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E5/`: przed ok. 26 MB w 55 plikach (`du`), po 0,
  skasowany po „Tak, skasuj oba (Rekomendowane)”. Poza katalogiem:
  - kopia narzędzi RelAI, którą hook założył o 23:07 w `docs/plany/STRONA_RELAI/.claude/`
    (0,9 MB, 51 plików, w `.gitignore`), skasowana razem z katalogiem;
  - serwer porównań na 4530 zatrzymany;
  - strony DevTools zamknięte przy restarcie przeglądarki;
  - serwer podglądu na 4520 z poprzedniej sesji działa dalej;
  - przypadkowy plik `kalibracja$3` usunięty w trakcie (L-0230).

**Świadomie odłożone:**

- Telefon, ograniczony ruch w pełni, fingerprint w rejestrze scroll-craft i harness zrzutów
  `shoot.mjs` przechodzą do E7 (dopieszczenie Filmu).
- Drobne jasne punkty na scenie Biurka (z E4) przechodzą do E6.

**Do zrobienia przez człowieka:**

- Adresy obu wersji strony i narzędzie ankiety (Aneks D pkt 3), termin przed E8.

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-17 — STRONA_RELAI E7: Film dopieszczony — jedna animacja na sekcję, telefon, ograniczony ruch, bez skryptów

**Zrobione:**

- **Lista uwag przed kodem** (12 pozycji, kadry z obrysem; strona w oknie przed pierwszą poprawką).
  Wybór Łukasza: „U1 tło paska,U2 pusty papier,U3 drugi przycisk”; „U4 wyższy lot,U5 lądowanie
  wcześniej,U6 osiem wpisów”; „U7 pieczątka na końcu,U8 „PŁATNOŚCI”,U9 okno z rozmową,U10 większe
  paski”; przy U12: „nie podoba mi sie w ogole ten efekt podswietlenia tam […] nie takie tandetne
  podswietlenie”, plus „U11 fiszka w środku”.
- **Runda 1 na żywo.** Uwagi Łukasza: pasek „wjeżdża […] po jakichś tam 200 czy 300 czy 400
  pikselach”; w amnezji „dwa teksty na siebie najeżdżają”, a „każdy scroll [ma być] widoczną od razu
  […] animacją”; w panelu terminal długo sam na pustej stronie; komendy bez fiszki na pierwszym
  planie; przed instalacją pusta strona i skok. Poprawki: pasek od 12 px (`site/film/pasek.js`),
  wspólny papier pod paskiem, drugi przycisk znika przy instalacji. Werdykt rundy 1b:
  „Tak, przyjmuję”.
- **Zmiana zasady ruchu po akcie 3.** Łukasz: „nie podoba mi się ten motyw tego, że tak bardzo dużo
  pojedynczych elementów się gdzieś tam rozwija i wskakuje […] fajnie, gdyby to była taka jednorazowa
  animacja po prostu na sekcję”. Taśma komend zostaje: „działa idealnie”. Rozstrzygnięcia:
  „Dwie sekcje (Rekomendowane)”, „Najdłuższa animacja (Rekomendowane)” jako kryterium szczytu,
  „Też panel”. Przebudowa w `site/film/akty.js`:
  - maszyna stanów `nastepnyStan`: start przy wejściu góry sekcji w 35 % kadru, reset dopiero po
    całkowitym zejściu z ekranu (margines 12 px);
  - przejścia CSS tylko na `.gra`, więc reset jest natychmiastowy;
  - lot 2b przez WAAPI z ośmioma wpisami;
  - przytrzymanie przewijania w dół (`zamontujPrzytrzymanie`): jedno dosunięcie do góry sekcji,
    blokada kółka, klawiszy i dotyku do końca animacji, ponowne dosunięcie po rozpędzie; w górę nie
    trzyma nigdy;
  - czasy sekcji: szczyt 3,5 s, reszta 1,6–2,05 s.

  Reflektor usunięty; akt 6 kładzie konfigurator na stole i drukuje komendy.
- **Poprawki po werdykcie** „Ogólnie przyjmuje wszystko ale z lekkimi poprawkami”: powtórka animacji
  po powrocie z samej góry, blokada do końca animacji, fiszka bardziej wyeksponowana. Dalej
  „scroll pozwlaa mi zejsc za nisko i ucina mi sie napis” (dosunięcie po rozpędzie) i „na sekcji
  Plan […] za szybko odpuszcza i sie cos laguje” (jedno dosunięcie, kierunek z przewijania). Taśma:
  pół kadru odstępu z obu stron, żeby pierwsze dwie fiszki też przeszły przez środek. Werdykt
  aktów 2–6: „Tak, przyjmuję”. Kadry w `docs/zasoby/STRONA/builds/film/kalibracja/`
  (`akt-*-pl-1366.jpeg`, `hero-pl-390.jpeg`, `akt-instalacja-pl-390.jpeg`).
- **Telefon (≤ 600 px).** Osobna kompozycja w `site/css/film.css`: tekst na całą szerokość,
  przedmioty pod nim, karteczki przeliczone z tych samych współrzędnych, dokumenty 2 × 2, plan
  i panel w jednej kolumnie, `main { overflow-x: clip }`. Hero przyjęte. Ostatni ekran przeszedł dwie
  rundy. Najpierw „musisz poprawic ostatni ekran i go jakos sensowniej skondensowac”; potem pływająca
  karta z marginesami. Na koniec Łukasz zauważył, że z telefonu nie da się zainstalować, i wybrał
  „Wyślij na komputer (Rekomendowane)”: karta z jednym zdaniem, „Wyślij sobie link” (Web Share,
  bez niego schowek) i „Kopiuj komendy” (`site/film/telefon.js`, nowe klucze
  `film.instalacja.telefon` PL i EN). Werdykt: „Tak, przyjmuję”.
- **Ograniczony ruch i bez skryptów.** Stany oczekiwania tylko pod `html.ruch`, więc bez niego każda
  sekcja stoi w stanie końcowym. Taśma w tym trybie i bez silnika (`html:not(.sc-ready)`) to siatka
  15 fiszek bez przypięcia (L-0235). Przyciski wymagające skryptu są ukryte także na desktopie.
- **Dostępność.** Okno panelu przed animacją bez przezroczystości. Drobny tekst w nowym tokenie
  `--txt-3-tekst` #716657: 4,66:1 na papierze, 5,52:1 na kartce. Blok `:root` z paletą filmu bez
  zmian (L-0236).
- **Testy:** `site/film/akty.test.mjs` (przepisany pod sekcje jednorazowe), `pasek.test.mjs`,
  `telefon.test.mjs`, `bezjs.test.mjs` (treść bez JS dla PL i EN, kontrola pozytywna, stany pod
  `html.ruch`, siatka taśmy). Brief Filmu z sekcją „Zmiany z E7”, `site/README.md` z sekcją
  o telefonie, ograniczonym ruchu, wersji bez skryptów, przebiegach i dostępności.

**Zweryfikowane — jak dokładnie:**

- `node --test site/**/*.test.mjs site/*/*.test.mjs` → 259/259 (E5: 229). Kontrola pozytywna:
  strona bez jednej fiszki daje `["command cards"]`, a bez komendy instalacji `["install command"]`.
  W trakcie test bloku ROOT złapał zmianę `--txt-3`, więc przywróciłem paletę i dodałem osobny token.
- Silnik: `sha256sum scrollcraft.js scrollcraft.css LICENSE` równe wpisom w `VERSION` (91a8e57c…,
  519e254c…, 0333ae13…).
- Biurko: 109 sum zapisanych na starcie przy `e0c9f21`, porównanie po pełnej budowie: 0 różnic.
  Kontrola: `strona.css` z dopisaną spacją → 1 FAILED, po przywróceniu 0 i czysty `git status`.
  `zbuduj.mjs`: `site/index.html` i `site/pl/index.html` „bez zmian”.
- Telefon 390 × 844, PL i EN: `scrollWidth` = 390 w każdym akcie. Hero z nagłówkiem, zdaniem
  i przyciskiem w kadrze. Ekran instalacji w jednym kadrze (sekcja 844 px).
- Ograniczony ruch, desktop i telefon: pierwsza asercja `matchMedia(...reduce).matches` = true,
  `ruch` nieobecny. Kadry każdego aktu w stanie końcowym, taśma jako siatka 5 × 3 (telefon:
  2 kolumny), sekcja komend 1163 px zamiast 3072. Zero elementów z tekstem niewidocznych.
- Bez JS: `curl` PL i EN → `h1` 1, fiszki 15, komenda instalacji, formularz, 8 wpisów szczytu.
  Render bez skryptów (blob z `<base>`) na desktopie: zasłony brak, 15/15 fiszek w kadrze
  poziomo, 8 wpisów, komendy i formularz widoczne, martwych przycisków 0. Na telefonie zamiast
  konfiguratora wydrukowane komendy w karcie (decyzja Łukasza).
- Przebiegi zrzutów: karta zgody na `playwright-core` 1.64.1 (npm, Apache-2.0, ok. 13 MB), odpowiedź
  Łukasza: „Bez instalacji (Rekomendowane)”. Cztery przebiegi (desktop, telefon, ograniczony ruch,
  bez JS) zrobione przez protokół DevTools z zainstalowanego Chrome w trybie headless, bez paczek;
  po 6 kadrów na akt, 42 na przebieg. Arkusze w `docs/zasoby/STRONA/lab/film/*-sheet.jpeg`. Pustych
  kadrów brak, martwego przewijania brak, `scrollWidth` nigdzie ponad szerokość okna.
- Kontrola odczuć (krzywa z briefu → kadr):

  | Akt | Odczucie z briefu | Odczucie z kadru |
  |---|---|---|
  | 1 Wejście | ciekawość | okno czatu, karteczka-logo i nagłówek; pasek od pierwszych pikseli — ciekawość |
  | 2a Amnezja | rozpoznanie | zdania w stosie, karteczki spadają na stół jedna po drugiej — rozpoznanie |
  | 2b Pamięć | ulga (szczyt) | 8 karteczek leci łukiem do czterech dokumentów, wpisy drukują się — ulga, najdłuższa animacja |
  | 3 Plan | zaufanie | arkusz kładzie się na stole, etapy kolejno, pieczątka na końcu — zaufanie |
  | 4 Panel | kontrola | okno z rozmową prostuje się, paski wchodzą po kolei — kontrola |
  | 5 Komendy | ciekawość („co jeszcze”) | taśma w bok, fiszka na środku uniesiona i większa — ciekawość |
  | 6 Instalacja | gotowość | konfigurator kładzie się i drukuje komendy; na telefonie karta „Wyślij sobie link” — gotowość |

  Rozjazdy z briefu (cisza 2a→2b zniknęła z przypięciem, reflektor usunięty) mają werdykty Łukasza.
- Lighthouse dostępność: `/pl/film/` desktop 100 i telefon 100, `/film/` desktop 100 i telefon 100.
  EN wymaga `localStorage['relai-jezyk']='en'`, bo przeglądarka po polsku przekierowuje. Przed
  poprawką było 96: stopka 3,01:1, okno panelu 3,21:1 i dymek 4,15:1. Fokus: kolejność naturalna,
  0 dodatnich `tabindex`, 0 elementów fokusowalnych pod `aria-hidden`, obrys `:focus-visible`
  z silnika.
- Budżet (instrument z `site/README.md`): Film 0,317 MiB po kompresji, 35 plików (E5: 0,31 MiB /
  33; doszły `pasek.js` i `telefon.js`). Płynność przy CPU ×4, krok 14 px na klatkę: desktop
  mediana 11,1 ms i p95 16,7 ms (493 klatki), telefon mediana 11,1 ms i p95 16,7 ms (542 klatki).
  Wzrost p95 względem E5 (5,6 ms) wynika z animacji WAAPI i przytrzymania; zapas do 26 ms wynosi
  9,3 ms.
- Zasłona na telefonie, zimne wejście (ślad wydajności z `ignoreCache`, Fast 4G, CPU ×4, klatki
  co 100 ms): do ok. 0,8 s kreska i napis bez logo, bo SVG się ładuje; do 1,41 s pełna zasłona
  z logo; zejście od ok. 1,5 s; od 1,9 s czyste hero. Stanów pośrednich strony pod zasłoną brak.
  E5 dawało ok. 1,1 s.
- Konsola: PL i EN, desktop i telefon, wejście, pełne przewinięcie, konfigurator albo karta
  telefonu → 0 komunikatów, 0 odpowiedzi ≥ 400, żądania tylko do `localhost:4520`.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` bez testów → kod 1,
  z testami trafia `site/js/wersja.test.mjs`. W szablonie Filmu brak adresów CDN, a `<form>` nie ma
  `action` ani `method`. Grep `data-sc-src` → kod 1.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E7/`: raport `clean-work.js` pokazał 15,7 MB
  i 276 plików. Po „Tak, skasuj E7 (Rekomendowane)” zostało 0. Artefakty spoza katalogu: serwer
  podglądu w tle (port 4530) zatrzymany; strona DevTools 6 zamknięta, a strony 3 nie było już
  na liście przy pomiarach (karta 4 należała do Łukasza i nie była ruszana); profil headless Chrome `%TEMP%/relai-e7-przebiegi` skasowany przez
  harness, sprawdzone; `playwright-core` nie instalowany.

**Świadomie odłożone:**

- SEO `hreflang` (Lighthouse SEO 91): względne adresy `{{baza}}` w `<link rel="alternate">`.
  Wspólne z Biurkiem, więc do E8 przy adresach publikacji.
- Logo zasłony pojawia się dopiero po załadowaniu SVG (ok. 0,8 s na Fast 4G). Do rozważenia
  wstawienie SVG w HTML w E8.
- Biurko na telefonie (T6) i jego ograniczony ruch są w zakresie E6 (Aneks D pkt 2).

**Do zrobienia przez człowieka:**

- —

Autor: RelAI (Opus 5.5) + Lukasz

### 2026-10-18 — STRONA_RELAI E6: Biurko od pierwszego do ostatniego ekranu — szczyt, szuflady, telefon, zasłona, plakat

Etap szedł w trzech sesjach (2026-10-17, 2026-10-18 noc, 2026-10-18 przedpołudnie bez Łukasza:
„dokoncz etap na tyle ile mozesz i nie zadawa jmi zbednych pytan”). Commity robocze `3adcd18`
i `cd4effa`.

**Zrobione:**

- **Lista uwag przed kodem** (15 uwag + 2 pomiary, `lista-uwag.html` w oknie przed pierwszą
  poprawką). Wybory Łukasza z AskUserQuestion: pytanie 1 „Jedna animacja (Rekomendowane)”,
  pytanie 2 „Plakat i treść (Rekomendowane)” (finalne ujęcie z PLAN 8 = ujęcie hero), pytanie 3
  „Scena z pozami pionowymi (Rekomendowane)”, uwaga 1 „Znikają do szczytu (Rekomendowane)”.
- **Szczyt** (`site/biurko/szczyt.js` + test) w siedmiu rundach. R1–R5 z blokadą przewijania
  (przyciąganie, przeloty krokowe, kolejka ruchu); R6 Łukasz: „chciałbym, żeby zdjął te blokady
  animacji […] rezygnujemy z tego zupełnie”. Wynik: zwykłe przewijanie, droga ×0,45
  (`SKALA_DROGI`), kamera `LERP` 0,05, Amnezja i szczyt jedną sceną, szczyt 3 s czasowo bez
  blokady, reset po zejściu. R7: „Tak, przyjmuję”.
- **Przystanki Plan, Panel, Komendy i hero.** Otwarta teczka z etapami (`scena.etapy` jako obiekty
  ze stanem, jedno źródło z kartką i szufladą), Panel r3 (`poz [0.41, 1.02, 0.54]`, ostre paski),
  Komendy z rogiem teczki. Werdykty: Plan „Tak, przyjmuję”, hero z otwartą teczką „Tak, przyjmuję”,
  Panel „Tak, przyjmuję kadr Panelu”, Komendy „Zostawić jako pierwszy plan (Rekomendowane)”.
- **Mapa** (pkt 6): Łukasz chciał ją „wkomponowaną, wklejoną w tło całej strony, a nie jako taka
  sekcja/panel floating”. Trzy kierunki na żywej scenie; wybór „Wdrażaj kierunek C: oś w nagłówku”.
  Oś wypełnia się za kamerą (`ulamekMapy`), szuflady stoją na osi. Werdykt: „Tak, przyjmuję mapę C”.
- **Szuflady** (pkt 4, `site/biurko/szuflady.js` + test): cztery `<dialog>` z treścią w HTML
  (dokumenty z wpisami `film.pamiec`, teczka ze `scena.etapy`, laptop z zakładkami pasków
  i podpisem „dane przykładowe”, pudełko z 15 fiszkami). Otwiera je klik w obiekt (raycaster,
  rączka kursora, uniesienie do kamery) i link na osi mapy. Zamykają Esc, tło i „Zamknij”, fokus
  wraca. Bez JS i bez sceny to zwykłe sekcje. Werdykt: „Tak, przyjmuję szuflady”.
- **Generator** (pkt 5): Biurko dostaje `makiety` i `fiszki` z tej samej funkcji co Film
  (`makietyIFiszki` w `site/narzedzia/zbuduj.mjs`).
- **Telefon** (pkt 7a): `POZY_PIONOWE` (obiektyw 65°), karty na dole, karta „Wyślij sobie link”
  z `film/telefon.js` zaimportowana bez zmian (duplikatu modułu nie ma). Usterka oddalenia
  (L-0241, P-048) naprawiona. Werdykt: „Tak, przyjmuję telefon”.
- **Zasłona** (pkt 7d): na prośbę Łukasza („lekkie, ale z efektem wow […] interaktywny”) trzy
  prototypy; wybór „Wdrażaj loader B: karteczki”. `site/biurko/zaslona.js` + test: zasłona od
  pierwszej klatki (wiersz w `<head>`, własny limit 30 s), karteczki z Amnezji przypinane postępem
  plików (pierwsza od razu), przeciąganie i rzut, na końcu zbieranie w stos. Zasłona schodzi po
  obu etapach zasobów (werdykt 1A).
- **Ograniczony ruch, plakat, słaba grafika** (pkt 7b, 7c, 7e). Ograniczony ruch, brak WebGL2,
  grafika programowa (`site/biurko/grafika.js` + test, nazwa renderera) i brak JS dają tryb
  przepływu z plakatem: kadr hero z samej sceny (`site/grafika/plakat/`, 91,5 + 82,0 KiB),
  wstawiany z `<template data-plakat>` albo `<noscript>`, z `alt` PL i EN (klucz `plakat`). Trwałe
  narzędzie `site/narzedzia/plakat.mjs`. Werdykty 2A (plakat) i 3A (wyłącznik).
- **Usterka znaleziona przebiegiem:** szuflada „Pudełko” w przepływie ucinała ostatni rząd fiszek
  (L-0237); poprawka w `site/css/strona.css`.
- **Recenzja kodu** (subagent code-reviewer): `koniecSceny` jednokrotny (utrata kontekstu
  w trakcie etapu drugiego), reset `onProgress` przy błędzie, `plakat.mjs` sprząta Chrome przy
  błędzie połączenia. Poprawione.
- **Testy** (pkt 8): `bezjs.test.mjs`, `grafika.test.mjs`, `kamera.test.mjs` (`POZY.biurko` jak
  w `2d749de`, szczyt najdłuższy z kontrolą pozytywną, pozy pionowe), `szczyt`, `szuflady`,
  `zaslona`. `site/README.md`: sekcja Biurka, plakat (jak odtworzyć), pomiar na słabej grafice,
  liczby po E6.

**Zweryfikowane — jak dokładnie:**

- `node --test "site/**/*.test.mjs"` → 299/299 (E7: 259). Kontrola pozytywna w testach: strona bez
  jednej fiszki → `cards: 14 of 15`, pusta teczka → `drawer teczka: empty`, bez `<noscript>` →
  `poster`; tor bez klucza szczytu → `no peak`, plan równy szczytowi → `["plan"]`.
- Silnik: `sha256sum` trzech plików równe `VERSION`. Film: 18/18 sum ze startu (`2d749de`) po pełnej
  budowie dwukrotnie; `film.css` z dopisaną spacją → 1 FAILED, po przywróceniu 0 i pusty
  `git diff`; `zbuduj.mjs` „bez zmian” dla obu stron Filmu.
- Moduły wspólne tylko addytywnie (`git diff 2d749de --stat`): `zbuduj.mjs` 9 wierszy (Biurko
  dostaje `makiety` i `fiszki`, funkcja przemianowana z `filmExtras` na `makietyIFiszki`),
  `tresc/pl.json` i `en.json` po 45 wierszy (nowe klucze `scena.etapy`, `scena.przyklad`,
  `zaslona`, `plakat`, `szuflady`; jedyna usunięta linia to przecinek). `site/js/` i `fakty.json`
  bez zmian. Obiekt `film` w obu językach identyczny ze startem; kontrola: zmiana jednego znaku →
  „różne”.
- Budowa: `fakty.mjs`, `makiety.mjs`, `zbuduj.mjs` dwukrotnie → „bez zmian”, 0 `{{`/`}}`,
  15 fiszek w obu językach.
- Szczyt (wariant A): stan końcowy po resecie (powrót do hero → faza `balagan`) i ponownym wejściu
  różni się o 0 na 21 wartościach. „Porządek”: przezroczystość 0 w fazie `gra` (3 próbki), 1 po
  ułożeniu; karta nieprzezroczysta, kontrast treści 6,79 : 1, nagłówka 13,6 : 1.
- Hero (dowód negatywny): kadr po etapie wobec wzorca przyjętego w E6 — średnia różnica 3,45
  (pas pod nagłówkiem), szum dwóch kadrów 0, kontrola z kamerą w ruchu 26,4. Różnica skupiona
  w pasie mapy C i na ekranie laptopa (Panel r3), obie zmiany przyjęte. `POZY.biurko` równe
  `2d749de` (test).
- Szuflady: 46/46 na żywo — każda z czterech klikiem w obiekt na swoim przystanku i z mapy
  klawiaturą, Esc i tło zamykają, fokus wraca, `scrollY` bez zmian, 15 fiszek. Mapa: 7 przystanków,
  `aria-current="step"`.
- Telefon 390 × 844: hero mieści nagłówek, zdanie i przycisk (dół przycisku 830 px);
  `scrollWidth` = 390 na każdym przystanku (PL i EN) i przy każdej otwartej szufladzie.
- Ograniczony ruch i bez WebGL (pierwsza asercja: brak `tryb-3d`): plakat z `alt`, 0 żądań sceny
  i zasobów, 0 komunikatów; w 3D 0 żądań plakatu (kontrola: bez sceny 1). Grafika programowa:
  SwiftShader → plakat i ostrzeżenie w konsoli; ta sama przeglądarka z ukrytą nazwą renderera →
  scena startuje.
- Przebiegi zrzutów bez paczek (protokół DevTools, `playwright-core` nieużyty, karty zgody nie
  było): desktop 46 kadrów, telefon PL 46 i EN 46, ruch 1366 66 i 390 66, bez WebGL 66, bez JS 66
  (kopia HTML bez `<script>`, L-0238). Pustych kadrów 0, przewijania w poziomie 0, przepełnień
  sekcji 0 po poprawce (przed: 24 w „Pudełku”). Arkusze: `docs/zasoby/STRONA/lab/biurko/*-sheet.jpeg`.
- Kontrola odczuć (krzywa z briefu → kadr), werdykt Łukasza 4A:

  | Przystanek | Odczucie z briefu | Odczucie z kadru |
  |---|---|---|
  | 1 Biurko | Spokój | półmrok pod jedną lampą, nic się nie rusza |
  | 2 Amnezja | Rozpoznanie | karteczki rozsypane, „Każda sesja zaczyna od zera” |
  | cisza | (cisza) | kamera nad bałaganem, bez tekstu |
  | 3 Porządek | Ulga | cztery dokumenty w rzędzie, tekst po ułożeniu |
  | 4 Plan | Zaufanie | teczka otwarta z etapami (brief: zamknięta) — werdykt „Tak, przyjmuję” |
  | 5 Panel | Kontrola | paski czytelne na ekranie laptopa |
  | 6 Komendy | Ciekawość | wyciągnięta fiszka „Etap planu” |
  | 7 Instalacja | Gotowość | konfigurator, komenda i przycisk |

- Zasłona, zimne wejście (390 × 844, Fast 4G, CPU ×4, bez pamięci podręcznej, klatki co ok.
  100 ms): zasłona i pierwsza karteczka 1,2 s; zdjęta 22,7 s i 24,1 s (dwa przebiegi); kadr hero
  po zdjęciu wobec kadru 1,5 s później: 0 % zmienionych pikseli. Przed zmianą: 18,1 s i 3,7 %.
  FAKT z Aneksu D (scena 3D po 11,8 s) mierzył pierwszą klatkę, nie oba etapy.
- Budżet (instrument z README): 9,522 MiB, 118 plików; start etapu 9,493 MiB; E4 9,49 MiB.
- Płynność, CPU ×4: desktop p95 przewijania 25,2 i 20,6 ms (mediana 12,8 i 12,5), szczyt 14,0
  i 16,3, otwarta szuflada 17,9 i 17,1; telefon 15,4 i 16,3, szczyt 10,0 i 10,7, szuflada 15,0
  i 15,9. Odrzucony przebieg 33,4 ms z drugim Chrome w tle (L-0239). SwiftShader: liczby w T1.
- Lighthouse dostępność 100 dla `/` i `/pl/`, desktop i telefon (SEO 91 przez `hreflang`).
  Fokus: 0 dodatnich `tabindex`, 0 fokusowalnych pod `aria-hidden`, cztery dialogi z etykietą.
- Konsola: przebiegi PL i EN, desktop i telefon — tylko ostrzeżenie kompilatora shaderów ANGLE
  X4122 z three.js w Chrome bez okna (warning). Konfigurator, przybliżenie ekranu i powrót
  w Chrome DevTools: 0 komunikatów, 45 żądań 200, tylko `localhost`.
- Bezpieczeństwo: grep `innerHTML|outerHTML|insertAdjacentHTML|document.write` bez testów → kod 1,
  z testami trafia `site/js/wersja.test.mjs`; formularz konfiguratora bez `action` i `method`;
  plakaty w `site/grafika/plakat/`, `zasoby.test.mjs` zielony.
- Kalibracja: kadry przyjęte w `docs/zasoby/STRONA/builds/biurko/kalibracja/` (`e6-hero`,
  `e6-szczyt`, `e6-szczyt-pas`, `e6-plan`, `e6-panel`, `e6-komendy`, `e6-szuflady`, `e6-plakat`
  1366 i 390, `e6-zaslona-pl-390`, `hero-pl-390`); werdykty zbiorcze Łukasza 2026-10-18: „1A 2A 3A
  4A — przyjmuję wszystkie rekomendacje”.
- Katalog roboczy `.claude/relai/work/STRONA_RELAI/E6/`: przed 92 MB (`du`), 1 183 pliki; po
  „Tak, skasuj katalog roboczy E6” `clean-work.js kasuj` → „Przed: 88.4 MB, po: 0.0 MB”, katalogu
  nie ma (lista do kasowania w `%TEMP%/relai-e6-kasuj.json`, usunięta). Artefakty spoza katalogu: serwery podglądu na portach 4520
  i 4540 (w tle, działają), profile `%TEMP%/relai-e6-chrome-*` (raport `clean-work.js`: grupa
  TEMP `relai-*` 6 618,1 MB w 296 poz., w tym te profile; do `/relai-clean`), strony Chrome
  DevTools MCP 2 i 4 otwarte; worktree HEAD-a nie powstał (pomiar startu na drzewie równym HEAD).

**Świadomie odłożone:**

- SEO `hreflang` ze względnymi `{{baza}}` (z E7) — do E8 przy adresach publikacji.
- Logo zasłony Filmu ładowane dopiero po SVG (z E7) — do E8.
- Drugi bezpiecznik słabej grafiki (plakat, gdy po wszystkich krokach jakości klatka > 26 ms;
  opcja 3B) — niewdrożony, wraca po pomiarze na prawdziwym słabszym laptopie.
- Wspólny moduł Filmu i Biurka (zasłony, telefon) — po wyborze kierunku z ankiety; dziś Biurko
  importuje `film/telefon.js` bez zmian, duplikatu nie ma.
- Ostrzeżenie ANGLE X4122 z shadera three.js — warning sterownika w Chrome bez okna, nie
  wpływa na obraz.

**Do zrobienia przez człowieka:**

- Pomiar Biurka na prawdziwym słabszym laptopie albo zintegrowanej karcie (T1). Wykonalne na
  maszynie z Intel UHD/Iris albo starszym Radeonem, Chrome z DevTools, procedura z README.

Autor: RelAI (Opus 5.5) + Lukasz
