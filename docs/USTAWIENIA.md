# USTAWIENIA — projekt: budowa RelAI

Wersja RelAI: 0.5.0 · zainicjowano: 2026-08-07

Rejestr wyborów użytkownika dla tego projektu. Każdy wpis: data, czego dotyczył, decyzja.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język projektu | Polski (dokumentacja PL, kod EN, commity conventional EN) |
| 2026-08-07 | Format planów | Interaktywny HTML dla planów głównych + prompty etapowe w Markdown |
| 2026-08-07 | Sposób wykonania planów | Zawsze prompty etapowe, świeże sesje; architekt: Fable |
| 2026-08-07 | Model wykonawczy etapów budowy | **Opus** — decyzja przy akceptacji planu (D-85), maksymalna jakość |
| 2026-08-07 | Git | Repo lokalne + zdalne: `github.com/nowilus/relai` (prywatne, założone 2026-08-07) |
| 2026-08-07 | Docs w repo | Wszystko commitowane (bez sekretów i plików runtime) |
| 2026-08-07 | Profil projektu | Narzędzie/plugin (odpowiednik profilu „prompty/artefakty" — kod TS/JS + specyfikacje) |
| 2026-08-07 | Gust designowy (konkurs E6) | **Kierunki odrzucone na stałe** (runda 1): Terminal, Panel operacyjny, Rysunek techniczny, Plakat — nie wracają jako warianty ani inspiracje (D-61b). **Kierunek zachowany:** Redakcja (propozycja 1) jako baza do przebudowy. **Czego oczekuje:** zaokrąglenia, lekki glassmorphism, typografia ozdobna (odręczna/kursywa/monospace o charakterze), animowane i zaokrąglone przepływy, dekoracyjne SVG w tle, „luźniejsza" kolorystyka odsunięta od palety AGRO_HOME, inny mechanizm zwijania sekcji, ogólnie więcej wigoru (D-61a) |
| 2026-08-08 | **Kierunek designu (wynik konkursu E6)** | **Blend „Warsztat"** — baza: „Tablica warsztatowa" (kartki na pinezkach, taśma, Kalam jako krój prowadzący, lekki obrót sekcji). Z „Zeszytu" przeniesione: **pasek górny** (pigułka na szkle, stan pisany odręcznie), **karteczki na marginesie** (sekcje 1, 2, 9), **paleta terakotowa** (glina #c4643c, musztarda #d9a134, szałwia #5f8a68) zamiast błękitu w przyciskach, wykresach i akcentach. Tło #f2e9d8 — pośrednie między korkiem Tablicy a kremem Zeszytu. **Ruch ograniczony:** zero animacji na najechanie poza zmianą tła przycisku, **animowana kropka na diagramie przepływu usunięta**. Plik: `docs/zasoby/design-konkurs/runda-3/blend.html` |
| 2026-08-07 | Fonty w plikach HTML | **Osadzone w base64** (zero CDN) — wygląd identyczny na każdej maszynie i przy wysyłce klientowi, kosztem wagi pliku |
| 2026-08-07 | Baza kolorystyczna propozycji E6 | Mieszanka: część jasnych, część ciemnych — żeby wybór był świadomy, a nie między wariantami jednej jasności |
| 2026-08-07 | Poziom animacji | **Wyraźny, ale służebny** — animowany przepływ, płynne rozwijanie, reakcje na najechanie, przeliczanie liczników; bez animacji dekoracyjnych w pętli |
| 2026-08-07 | Instalacja pluginu w trakcie budowy | **Zainstalowany na stałe** (scope `user`, wersja 0.3.1) — potwierdzone przez Łukasza po pomiarze R2. Po każdej zmianie skilla obowiązuje sekwencja: push → `claude plugin marketplace update relai` → reinstalacja; bez niej mierzysz starą wersję ([LEKCJE.md](LEKCJE.md) L-0004) |

## Ustawienia wycofane

| Data | Czego dotyczy | Decyzja | Zastąpione |
|---|---|---|---|
| 2026-08-07 | Instalacja pluginu w trakcie budowy | Odinstalowany do końca budowy; instalacja docelowa po ostatnim etapie | zastąpione decyzją z 2026-08-07 (plugin zainstalowany na stałe), powód: dwa etapy przeszły bez pomiaru ryzyka R2, a pomiar wymaga zainstalowanego pluginu |
