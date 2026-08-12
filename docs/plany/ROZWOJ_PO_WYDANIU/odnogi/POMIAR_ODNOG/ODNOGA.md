# ODNOGA — pomiar odnóg świeżą sesją (niedomknięty punkt weryfikacji E1)

Plan: [ROZWOJ_PO_WYDANIU](../../STATUS.md) · Etap-źródło: E1 — Odnoga planu · Utworzona: 2026-08-12 ·
Status: **OTWARTA** · Wykonawca: Opus

## Cel

Trzy scenariusze `/relai:relai-branch` i wykonanie `PROMPT_ODNOGA` są zmierzone **świeżymi sesjami**
`claude -p` na zainstalowanej wersji 1.1.0 — czyli tak, jak wymaga L-0004 — a wynik każdego
z czterech pomiarów jest zapisany w dzienniku.

## Skąd się wzięła

Etap E1 dowiózł całą funkcjonalność, ale punkt 8 sekcji Weryfikacja („`PROMPT_ODNOGA.md`
z dogfoodingu jest samowystarczalny: świeża sesja `claude -p` wykonuje odnogę bez pytań") **nie
został zmierzony**, a punkty 4, 6 i 7 zmierzono słabszą metodą: procedurą wykonaną z pliku
`commands/relai-branch.md` w sesji etapu, zamiast wywołaniem zarejestrowanej komendy w świeżej
sesji. Powód jest zewnętrzny wobec kodu: `claude -p` uwierzytelnia się z
`~/.claude/.credentials.json`, gdzie siedział token konta z wyczerpanym limitem — przełączenie
konta w aplikacji tego pliku nie zmienia (L-0032). Wątek nie mieści się w zakresie E1 i nie zmienia
planu; jest dokładnie tym, po co odnogi powstały.

## Zakres

1. **Scenariusz A — projekt z aktywnym planem.** Świeża sesja w projekcie testowym z planem
   i etapem `W TOKU`: `/relai:relai-branch OPIS_KART …`. Sprawdzasz, że powstała para plików
   w `odnogi/<NAZWA>/`, w `STATUS.md` przybyła jedna linia w sekcji „Odnogi", a sumy kontrolne
   sekcji `PLAN.html` są identyczne przed i po (dowód zamrożenia, L-0007).
2. **Scenariusz B — projekt bez planu.** Ta sama komenda tworzy `docs/fixy/<NAZWA>/` z kompletem;
   w żadnym `STATUS.md` nie przybywa linia (dowód: w projekcie nie ma pliku `STATUS.md`).
3. **Scenariusz C — wywołanie z kontekstu odnogi.** Sesja startująca z `PROMPT_ODNOGA.md` wywołuje
   komendę: oczekiwana odmowa z propozycją pełnego planu i **zero utworzonych plików** (dowód
   negatywny: drzewo plików przed = po).
4. **Scenariusz D — samowystarczalność promptu.** Świeża sesja wykonuje
   `docs/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/PROMPT_ODNOGA.md` i domyka odnogę OPIS_REPO bez
   pytań o rzeczy już rozstrzygnięte. Ta odnoga jest jednocześnie testem akceptacyjnym.

## Poza zakresem

- Zmiany w treści komendy, specyfikacji i skilla — chyba że pomiar wykaże defekt; wtedy poprawka
  wchodzi tutaj razem z ponownym pomiarem.
- Cokolwiek z zakresu E2 (rotacja dokumentów) i dalszych etapów.
- Przelogowanie CLI — to krok człowieka, opisany niżej.

## Weryfikacja

- [ ] Cztery scenariusze wykonane **świeżymi sesjami** `claude -p` (stdin, `--permission-mode
      acceptEdits`, `--allowedTools "Bash"` — L-0024, L-0028), każdy z zapisanym wynikiem.
- [ ] Scenariusz A: sumy kontrolne sekcji `PLAN.html` przed i po są identyczne.
- [ ] Scenariusz C: drzewo plików przed = po, co do sumy każdego pliku.
- [ ] Scenariusz D: odnoga OPIS_REPO zamknięta rytuałem, `gh repo view` zwraca niepusty opis.
- [ ] Wpis w `docs/DZIENNIK.md` z wynikami czterech pomiarów; defekt znaleziony → poprawka
      i pomiar ponowny, nie sama adnotacja.

## Do zrobienia przez człowieka, zanim ta odnoga ruszy

`claude /login` w terminalu — CLI musi być zalogowane na konto z dostępnym limitem. Bez tego
pomiar padnie na tym samym błędzie („You've hit your session limit").

## Wynik

—
