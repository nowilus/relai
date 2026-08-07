# USTAWIENIA — projekt: budowa RelAI

Wersja RelAI: 0.3.1 · zainicjowano: 2026-08-07

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
| 2026-08-07 | Instalacja pluginu w trakcie budowy | **Zainstalowany na stałe** (scope `user`, wersja 0.3.1) — potwierdzone przez Łukasza po pomiarze R2. Po każdej zmianie skilla obowiązuje sekwencja: push → `claude plugin marketplace update relai` → reinstalacja; bez niej mierzysz starą wersję ([LEKCJE.md](LEKCJE.md) L-0004) |

## Ustawienia wycofane

| Data | Czego dotyczy | Decyzja | Zastąpione |
|---|---|---|---|
| 2026-08-07 | Instalacja pluginu w trakcie budowy | Odinstalowany do końca budowy; instalacja docelowa po ostatnim etapie | zastąpione decyzją z 2026-08-07 (plugin zainstalowany na stałe), powód: dwa etapy przeszły bez pomiaru ryzyka R2, a pomiar wymaga zainstalowanego pluginu |
