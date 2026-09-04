# USTAWIENIA — projekt: budowa RelAI

Wersja RelAI: 1.9.0 · zainicjowano: 2026-08-07

Rejestr wyborów użytkownika dla tego projektu. Każdy wpis: data, czego dotyczył, decyzja.

| Data | Czego dotyczy | Decyzja |
|---|---|---|
| 2026-08-07 | Język projektu | Polski (dokumentacja PL, kod EN, commity conventional EN) |
| 2026-08-07 | Format planów | Interaktywny HTML dla planów głównych + prompty etapowe w Markdown |
| 2026-08-07 | Sposób wykonania planów | Zawsze prompty etapowe, świeże sesje; architekt: Fable |
| 2026-08-07 | Model wykonawczy etapów budowy | **Opus** (D-85) |
| 2026-08-07 | Git | Repo lokalne + zdalne: `github.com/nowilus/relai` |
| 2026-08-07 | Docs w repo | Wszystko commitowane, bez sekretów i plików runtime |
| 2026-08-21 | Profil projektu | prompty — produktem są specyfikacje, prompty i szablony; kod (hooki, walidator, guardraile) jest ich nośnikiem |
| 2026-08-07 | Gust designowy (konkurs E6) | Cztery kierunki z rundy 1 odrzucone **na stałe**, „Redakcja" zachowana jako baza — oczekiwania i lista zakazów: D-61a i D-61b |
| 2026-08-08 | **Kierunek designu (wynik konkursu E6)** | Blend „Warsztat" — wzorzec w `docs/zasoby/design-konkurs/runda-3/blend.html`; skład palety i ograniczenia ruchu opisuje wpis dziennika 2026-08-08 (E6) |
| 2026-08-07 | Fonty w plikach HTML | Osadzone w base64, zero CDN |
| 2026-08-07 | Baza kolorystyczna propozycji E6 | Mieszanka jasnych i ciemnych, żeby wybór był świadomy |
| 2026-08-07 | Poziom animacji | Wyraźny, ale służebny — bez animacji dekoracyjnych w pętli |
| 2026-08-07 | Instalacja pluginu w trakcie budowy | Zainstalowany na stałe (scope `user`); po każdej zmianie obowiązuje sekwencja wydania — [PULAPKI.md](PULAPKI.md) P-005 |
| 2026-08-12 | Rotacja dokumentów | włączona · dziennik 150 KB · lekcje 40 wpisów albo 50 KB · STATE 300 linii — progi skalibrowane w E2 na zmierzonych dziennikach JiraManagera i PolyFlow |
| 2026-08-12 | Język warstw adapterów | Warstwa czytana przez model — angielski; warstwa czytana przez człowieka — polski; dokumenty projektów w języku projektu (Aneks A planu ROZWOJ_PO_WYDANIU) |
| 2026-08-20 | Budżet startu sesji | włączony · start 80 KB · CLAUDE 10 KB · STATE 12 KB · ryzyka 12 KB · zasady 30 KB · ustawienia 6 KB · status 10 KB |
| 2026-09-01 | Przegląd spraw człowieka | włączony · 30 dni |
| 2026-09-03 | Artefakty robocze | włączone · 100 MB |
| 2026-09-04 | Lista modeli | włączona · 7 dni |

## Ustawienia wycofane

| Data | Czego dotyczy | Decyzja | Zastąpione |
|---|---|---|---|
| 2026-08-07 | Instalacja pluginu w trakcie budowy | Odinstalowany do końca budowy; instalacja docelowa po ostatnim etapie | zastąpione decyzją z 2026-08-07 (plugin zainstalowany na stałe), powód: dwa etapy przeszły bez pomiaru ryzyka R2, a pomiar wymaga zainstalowanego pluginu |
| 2026-08-07 | Profil projektu | Narzędzie/plugin (odpowiednik profilu „prompty/artefakty" — kod TS/JS + specyfikacje) | zastąpione 2026-08-21 wartością `prompty` przy `/relai-update` do 1.6.1, powód: wartość opisowa nie przechodzi kotwicy maszynowej, więc reguły profilu były w tym projekcie wyciszone od początku |
