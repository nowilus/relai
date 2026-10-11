# relai-core — zapis pracy przed wyczerpaniem limitu („zapisz pracę”)

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy prompt zaczyna się od frazy **„zapisz
pracę”** / **„save my work”** — wysłanej przez kartę limitu na pasku `relai-cache-keeper`
(„Zapisz pracę teraz”) albo wpisanej ręcznie (Cursor, Codex, Claude Code bez karty).

Cel: limit planu (5 h albo tygodniowy) kończy się w trakcie pracy, a następna sesja ma zacząć od
listy „co dalej”, nie od zgadywania. Zapis sam zużywa tury, więc kolejność kroków jest ustawiona
tak, żeby **urwany zapis zostawił najcenniejsze najpierw**: najpierw commit kodu, który działa,
potem dokumenty, potem plik wznowienia, na końcu znacznik. Kroków nie przestawiasz i nie łączysz.

## Zgoda na commit

- Prompt zawiera linię **`Zgoda na commit lokalny: tak (karta limitu „Zapisz pracę teraz”).`**
  → człowiek zgodził się na commit lokalny, klikając kartę (decyzja planu LIMIT_CHECKPOINT,
  sekcja 9). Commitujesz **bez pytania** w czacie. Zgoda obejmuje commity tej procedury
  (kroki 3 i 4), **bez pusha** i bez niczego innego.
- Prompt tej linii nie ma (fraza wpisana ręcznie) → przed krokiem 3 pytasz o commit raz, jak
  zawsze (D-35): wiadomość commita i lista plików, „commitować?”. Odpowiedź „nie” → kroki 3 i 4
  bez commitów; plik wznowienia mówi wtedy, że zmiany czekają niezacommitowane.

## Kroki — w tej kolejności

1. **Testy i przegląd diffu** — kroki 1 i 2 pliku `done-check.md`: komenda testów projektu
   uruchomiona teraz (wynik dosłownie), `git status --short` i `git diff`. Projekt bez testów →
   jedno zdanie, że ich nie ma, i czym sprawdziłeś zmianę.
2. **Kod do stanu „testy przechodzą”** — testy zielone → dalej. Test pada przez rozgrzebany
   fragment, którego **nie domkniesz w 1–2 turach** → fragment **wycofujesz**, ale nigdy bez kopii:
   `git diff -- <pliki> > .claude/relai/wznowienie/<slug>.patch`, dopiero potem
   `git checkout -- <pliki>` (plik nowy, nieśledzony: kopia do tego samego katalogu, potem
   usunięcie). Testy uruchamiasz ponownie i zapisujesz wynik. Kod, który nie przechodzi testów,
   **nigdy nie idzie do commita jako działający**.
3. **Commit kodu** — wyłącznie pliki, które przechodzą testy; wiadomość conventional po angielsku
   (`wip(<zakres>): <co działa> before plan limit`). Bez pusha. Projekt bez Gita → pomijasz ten
   krok i krok 4b, mówiąc to jednym zdaniem.
4. **Dokumenty** — tylko synchronizacja, bez rotacji i bez sprzątania:
   a. `docs/STATE.md` — sekcja „Nad czym pracujemy teraz” w stanie z tej chwili;
   b. wpis w `docs/DZIENNIK.md` na końcu „Wpisy”, wg `SPEC_DZIENNIK.md`, z tytułem kończącym się
      „— zapis przed limitem”; w „Świadomie odłożone” to, czego nie domknąłeś;
   c. `STATUS.md` aktywnego planu, gdy etap jest `W TOKU`: linia w dzienniku wdrożenia
      `- <data> — E<N> przerwany zapisem przed limitem; wznowienie: <ścieżka pliku wznowienia>`.
      Statusu etapu **nie zmieniasz** — zostaje `W TOKU`.
   Potem commit samych dokumentów (`docs: save work before plan limit`) — pod tą samą zgodą.
   Projekt bez struktury RelAI nie ma tych dokumentów → krok pomijasz jednym zdaniem.
5. **Plik wznowienia** — `.claude/relai/wznowienie/<slug>.md` wg specyfikacji
   `.claude/relai/templates/SPEC_WZNOWIENIE.md` (otwierasz ją i czytasz, nie piszesz z pamięci).
   Ścieżka z linii „Plik wznowienia:” w prompcie — dosłownie; bez niej liczysz slug regułą ze
   specyfikacji. Hash `HEAD` bierzesz z `git rev-parse --short HEAD` **po** commitach z kroków
   3–4. Plik nadpisujesz w całości; nie commitujesz go.
6. **Znacznik** — ostatnia linia odpowiedzi, sama w wierszu, dokładnie: `ZAPIS GOTOWY`.
   Piszesz ją **wyłącznie** wtedy, gdy kroki 1–5 przeszły (z pominięciami, które są wyżej
   dozwolone i zostały nazwane). Krok, który się nie udał, opisujesz jednym zdaniem — **bez
   znacznika**: pasek pokaże wtedy „zapis niepełny”, a nie „zapis gotowy”.

Nad znacznikiem — trzy linie raportu, treść z wyników poleceń, nie z pamięci:

```
Testy: <komenda> -> <wynik>
Commit: <hash i tytuł z git log -1 --oneline, albo: brak — powód>
Wznowienie: <ścieżka pliku> — pierwszy krok: <krok 1 z listy „Co dalej”>
ZAPIS GOTOWY
```

## Czego ta procedura nie robi

- Nie pyta o nic poza commitem bez zgody z karty — rzeczy nierozstrzygnięte zapisuje jako otwarte
  w dzienniku i w „Co dalej”.
- Nie robi rotacji dokumentów, sprzątania artefaktów, pusha ani wydania.
- Nie kasuje pliku wznowienia ani łatki — to robi wznowienie za zgodą człowieka.
- Nie zaczyna nowej pracy po znaczniku.
