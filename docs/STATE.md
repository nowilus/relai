# STATE — RelAI

Stan na: 2026-08-12

## Gdzie jesteśmy

RelAI jest gotowy i wydany w wersji **1.1.0**. Plan budowy — dziesięć etapów — został zamknięty, a
pilotaż na dwóch realnych projektach przeszedł wszystkie cztery scenariusze akceptacyjne: nowy
projekt prowadzony od zera, przekazanie projektu innej osobie, kopia zapasowa z odtworzeniem oraz
przeniesienie żywego, istniejącego projektu na strukturę RelAI. Narzędzie jest zainstalowane na
maszynie autora i używane w codziennej pracy. Teraz zaczyna się faza, w której dostają je inne
osoby i zgłaszają, co im przeszkadza.

## Co działa

- Nowy projekt dostaje komplet dokumentów po trzech pytaniach i zgodzie — bez uczenia się
  jakiejkolwiek składni.
- Istniejący projekt można przenieść na tę strukturę bez ryzyka: najpierw kopia zapasowa, potem
  zmiany, a na końcu raport z opisaną drogą pełnego powrotu do stanu sprzed.
- Ustalenia, decyzje i korekty użytkownika zapisują się w trakcie pracy, a nie „na koniec".
- Nowa sesja zaczyna od przeczytania stanu i mówi, gdzie jesteśmy.
- Plany powstają jako osobny dokument z wariantami i ryzykami; dla odbiorcy nietechnicznego —
  jako jeden plik HTML do otwarcia dwuklikiem, działający bez internetu.
- Dziesięć skrótów operacyjnych: etap planu, odnoga planu, kopia zapasowa, przegląd, lista zmian,
  pakiet przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja.
- Boczny wątek z etapu ma gdzie zamieszkać: RelAI zatrzymuje się i pyta (odnoga / aneks / świadomie
  odłożone), a odnoga dostaje kartę i gotowy prompt świeżej sesji — bez ruszania zamrożonego planu.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- Plan **ROZWOJ_PO_WYDANIU** (8 etapów) — **ZAAKCEPTOWANY 2026-08-12** (Aneks A). **E1 zamknięty
  2026-08-12 wydaniem 1.1.0** (odnogi planu), E2 gotowy do startu: automatyczna rotacja dokumentów,
  potem poprawki z retrospektywy i port na Cursora i Codexa w architekturze „wspólny rdzeń +
  adaptery". Poprzedziła plan zmierzona retrospektywa (JiraManager, PolyFlow) i inwentarz
  przenośności.
- Dwie **odnogi OTWARTE**: `OPIS_REPO` (opis repozytorium na GitHubie) i `POMIAR_ODNOG` (pomiar
  odnóg świeżą sesją — niedomknięty punkt weryfikacji E1). Każda ma gotowy prompt; nie blokują
  planu.

## Co dalej

- Świeża sesja Opus i `/relai-stage` — etap E2 (rotacja dokumentów); potem E3 (poprawki
  z retrospektywy) przed portem — decyzja użytkownika z wywiadu 2026-08-12.
- Dwie odnogi do wykonania w świeżych sesjach, w dowolnej kolejności wobec etapów.
- Zebranie pierwszego feedbacku od osób spoza projektu i zamiana go na poprawki — pilotaż
  Cursora w firmie jest etapem E6 planu.

## Co blokuje

- **Pomiar zachowań w świeżej sesji** — CLI `claude -p` uwierzytelnia się z własnego pliku
  poświadczeń, a konto tam zapisane ma wyczerpany limit (L-0032). Odblokowuje to `claude /login`
  po stronie człowieka; do tego czasu odnoga `POMIAR_ODNOG` stoi.
- Repozytorium jest **publiczne** (zweryfikowane 2026-08-12), ale ma pusty opis — odnoga
  `OPIS_REPO`.

---

## Szczegóły techniczne

### Wersja i instalacja

Plugin: `relai@relai` 1.1.0, zainstalowany globalnie (scope `user`); `installed_plugins.json`:
`gitCommitSha e6b41dc`. Źródło: własny marketplace w tym samym repozytorium. Aktualizacja wchodzi
w życie po restarcie aplikacji.

### Zawartość pluginu

Dwa skille (`relai-core`, `relai-planning`) • dziesięć komend • dziewięć hooków Node.js bez
zależności npm • dwadzieścia specyfikacji dokumentów + szablon planu HTML z osadzonymi fontami.

### Wymagania

Claude Code • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (publiczne od 2026-08-12) • Plan budowy:
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI`

### Liczby

Etapy planu budowy: 10/10 zamknięte • Etapy planu ROZWOJ_PO_WYDANIU: 1/8 zamknięte • Scenariusze
akceptacyjne: 4/4 zdane • Otwarte odnogi: 2 • Otwarte ryzyka: 4 (zależność jakości od modelu,
rozrost dokumentów, dwa ryzyka portu na Cursora/Codexa) • Zamknięte ryzyka: 6
