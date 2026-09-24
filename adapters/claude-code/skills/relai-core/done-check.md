# relai-core — zanim powiesz „gotowe" (zadanie z kodem)

Plik doczytywany skilla `relai-core`. Otwierasz go na **początku** zadania, które **zmieni kod**
(plik źródłowy, test, konfigurację budowania), a jego kroki wykonujesz **po ostatniej zmianie**,
zanim napiszesz człowiekowi, że jest zrobione.
Dotyczy pracy solo; w załodze (`/relai-crew`) testy i przegląd mają własne kroki 7 i 8.
Zadanie bez zmiany kodu (sam dokument, sama odpowiedź) procedury nie uruchamia.

Cel: człowiek dostaje „gotowe" razem z **wynikiem testów** i **listą ryzyk z własnego diffu**, a nie
samo zapewnienie. RelAI nie ma własnego runnera (D-80) — uruchamiasz komendę projektu.

## Krok 1 — testy projektu

Komendę bierzesz w tej kolejności — pierwsze trafienie wygrywa:

| Skąd | Komenda |
|---|---|
| komenda testów zapisana w `docs/USTAWIENIA.md` albo `CLAUDE.md` projektu | ta komenda, dosłownie |
| `package.json` ze skryptem `test` innym niż domyślne `echo "Error: no test specified"` | `npm test` (`pnpm test` przy `pnpm-lock.yaml`, `yarn test` przy `yarn.lock`) |
| `pyproject.toml`, `pytest.ini`, `setup.cfg` z `[tool:pytest]` albo katalog `tests/` z plikami `test_*.py` | `pytest` |
| `go.mod` | `go test ./...` |
| `Cargo.toml` | `cargo test` |
| `pom.xml` / `build.gradle(.kts)` | `mvn test` / `./gradlew test` |
| `*.sln` albo `*.csproj` | `dotnet test` |
| `Gemfile` z katalogiem `spec/` | `bundle exec rspec` |
| `composer.json` ze skryptem `test` | `composer test` |

Uruchamiasz ją **po ostatniej zmianie** i zapisujesz wynik dosłownie: liczba testów, przeszło /
padło, kod wyjścia.

- **Nic z tabeli nie pasuje** → mówisz wprost: „Projekt nie ma testów — zmianę sprawdziłem tylko
  przez <komenda i wynik>" (uruchomienie, zapytanie, build). Nie piszesz „przetestowane".
- **Test pada** → zadanie **nie jest gotowe**. Pada przez Twoją zmianę → poprawiasz i uruchamiasz
  ponownie. Przyczyna niejasna → procedura `debugging.md`. Padał już przed Twoją zmianą → mówisz to
  z dowodem (ten sam test na `git stash` albo na czystym drzewie), nie z domysłu.
- Poprawka przyszła z `debugging.md` → jej krok 4 (ta sama komenda + pełny zestaw) **jest** tym
  krokiem; nie uruchamiasz testów drugi raz, przechodzisz do kroku 2.

## Krok 2 — przegląd własnego diffu

`git status --short` i `git diff` (nowe pliki przeczytaj w całości). Czytasz zmianę tak, jakby
napisał ją ktoś inny, i sprawdzasz po kolei:

1. **Zakres** — czy każdy zmieniony plik należy do zadania; plik spoza zadania wraca do stanu
   sprzed zmiany albo idzie do człowieka jako pytanie.
2. **Sekrety** — klucz, token, hasło, adres z danymi logowania w pliku śledzonym (D-42).
3. **Resztki** — wydruki diagnostyczne, zakomentowany kod, `TODO` dopisane w tej zmianie.
4. **Testy** — test usunięty, osłabiona asercja, przypadek pominięty (`skip`, `only`).
5. **Wejście i błędy** — nowe wejście od użytkownika bez walidacji, błąd połknięty bez komunikatu.
6. **Zależności** — nowa paczka → audyt komendą ekosystemu (`npm audit --omit=dev`, `pip-audit`…).

Znalezione usterki poprawiasz przed zgłoszeniem (i wracasz do kroku 1); to, czego nie poprawiasz,
bo wychodzi poza zadanie, idzie na listę ryzyk.

## Krok 3 — zgłoszenie

Dopiero teraz piszesz, że zrobione — krótko, w tej kolejności:

```
Testy: `npm test` → 14/14, kod 0
Zmiana: 3 pliki (src/cart.js, src/price.js, test/cart.test.js) — wszystkie w zakresie
Ryzyka: rabat nie ma górnej granicy dla kodów spoza listy (poza zadaniem — propozycja)
```

Linia „Zmiana" wymienia pliki z wyniku `git status --short`, nie z pamięci. Linia „Ryzyka" nie
znika, gdy ich nie ma — brzmi wtedy „Ryzyka: brak po przeglądzie git diff", i pada wyłącznie po
uruchomieniu `git diff` w kroku 2.

Ten krok w skrócie stoi też w zdaniu hooka startu sesji (Claude Code) — tam działa także wtedy,
gdy skill się nie wyzwolił.
