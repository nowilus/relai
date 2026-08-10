# STATE — RelAI

Stan na: 2026-08-10

## Gdzie jesteśmy

RelAI jest gotowy i wydany w wersji 1.0.0. Plan budowy — dziesięć etapów — został zamknięty, a
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
- Dziewięć skrótów operacyjnych: etap planu, kopia zapasowa, przegląd, lista zmian, pakiet
  przekazania, wycieczka po projekcie, ściąga, adopcja, aktualizacja.
- Klucz API nie wejdzie do repozytorium, a reguły projektu nie zmienią się bez potwierdzenia.
- W folderze, który nie jest projektem RelAI, plugin jest całkowicie niewidoczny.

## Nad czym pracujemy teraz

- Wizytówka projektu na GitHubie — README i identyfikacja wizualna, żeby dało się plugin komuś
  pokazać i żeby ta osoba zrozumiała w minutę, po co jej to.

## Co dalej

- Zebranie pierwszego feedbacku od osób spoza projektu i zamiana go na poprawki.
- Rotacja rozrastających się dokumentów — mechanizm, którego jeszcze nie ma, a pierwszy realny
  przypadek już jest znany.

## Co blokuje

- Repozytorium jest prywatne i nie ma opisu na GitHubie — dopóki tak zostanie, nikt spoza
  właściciela nie zainstaluje pluginu. Decyzja o upublicznieniu należy do człowieka (Łukasz).

---

## Szczegóły techniczne

### Wersja i instalacja

Plugin: `relai@relai` 1.0.0, zainstalowany globalnie (scope `user`). Źródło: własny marketplace
w tym samym repozytorium. Aktualizacja wchodzi w życie po restarcie aplikacji.

### Zawartość pluginu

Dwa skille (`relai-core`, `relai-planning`) • dziewięć komend • dziewięć hooków Node.js bez
zależności npm • osiemnaście specyfikacji dokumentów + szablon planu HTML z osadzonymi fontami.

### Wymagania

Claude Code • Node.js 14+ w `PATH` • git (opcjonalnie).

### Linki

Repo: github.com/nowilus/relai (prywatne) • Plan budowy:
[docs/archiwum/plany/BUDOWA_RELAI/](archiwum/plany/BUDOWA_RELAI/PLAN.html) • Backupy:
`C:\Users\Lukasz\Backupy\RelAI`

### Liczby

Etapy planu budowy: 10/10 zamknięte • Scenariusze akceptacyjne: 4/4 zdane • Otwarte ryzyka: 2
(zależność jakości od modelu, rozrost dokumentów) • Zamknięte ryzyka: 6
