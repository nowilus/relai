# ODNOGA — pomiar zachowań świeżą sesją (niedomknięte punkty weryfikacji E1, E2 i E3)

Plan: [ROZWOJ_PO_WYDANIU](../../STATUS.md) · Etap-źródło: E1 — Odnoga planu (zakres rozszerzony
2026-08-12 o punkty 5 i 7 weryfikacji E2, a następnie o punkty 3, 4 i 6 weryfikacji E3) ·
Utworzona: 2026-08-12 · Status: **ANULOWANA 2026-09-01** · Wykonawca: Opus

## Cel

Trzy scenariusze `/relai:relai-branch`, wykonanie `PROMPT_ODNOGA`, dwa scenariusze rotacji
dokumentów i trzy scenariusze poprawek z E3 są zmierzone **świeżymi sesjami** `claude -p` na
zainstalowanej wersji (co najmniej 1.2.0 po wydaniu E2; scenariusze G–I wymagają 1.3.0) — czyli
tak, jak wymaga L-0004 — a wynik każdego z dziewięciu pomiarów jest zapisany w dzienniku.

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
5. **Scenariusz E — cisza poniżej progu** (punkt 5 weryfikacji E2, dopisany 2026-08-12). Świeża
   sesja zamyka („kończymy na dziś") projekt testowy z dziennikiem **poniżej** progu. Oczekiwane:
   ani jedno słowo o rotacji w odpowiedzi i brak katalogu `docs/archiwum/dziennik/` — dowód
   negatywny na drzewie plików przed = po (z pominięciem plików, które rytuał zamknięcia zmienia
   z innych powodów: `STATE.md`, `DZIENNIK.md`).
6. **Scenariusz F — wyłącznik** (punkt 7 weryfikacji E2, dopisany 2026-08-12). Świeża sesja zamyka
   projekt testowy z dziennikiem **ponad** progiem i wierszem `Rotacja dokumentów | wyłączona`
   w `USTAWIENIA.md`. Oczekiwane: rytuał przebiega bez rotacji i bez komunikatu o niej; dziennik
   zachowuje sumę kontrolną sekcji „Wpisy" sprzed sesji.

7. **Scenariusz G — jeden sygnał rozjazdu stanu** (punkt 4 weryfikacji E3, dopisany 2026-08-12).
   Świeża sesja startuje w projekcie testowym z etapem `W TOKU` w `STATUS.md` i linią
   `Aktywny plan: brak` w `CLAUDE.md`. Oczekiwane: **dokładnie jedno** zdanie o rozjeździe przed
   akapitem „gdzie jesteśmy" — nie dwa (hook + rytuał startu) — i pytanie, który zapis jest
   prawdziwy, zamiast prostowania dokumentów. Projekt spójny → w odpowiedzi ani słowa o rozjeździe
   (dowód negatywny). Sam hook zmierzony w E3 (15/15); tutaj mierzysz, czy sesja go nie dubluje.
8. **Scenariusz H — decyzja po adopcji** (punkt 3 weryfikacji E3, dopisany 2026-08-12). Projekt
   testowy po `/relai:relai-adopt`, z zastaną tabelą decyzji w sekcji „Zasady projektu
   (odziedziczone)". Świeża sesja rozstrzyga nowy temat. Oczekiwane: wpis `D-NN` w `DECYZJE.md`,
   a suma kontrolna sekcji odziedziczonej **identyczna** przed i po (dowód negatywny, L-0007).
9. **Scenariusz I — bramka manualna blokuje zamknięcie planu** (punkt 6 weryfikacji E3, dopisany
   2026-08-12). Plan testowy z ostatnim etapem do zamknięcia i dwiema nierozstrzygniętymi
   pozycjami „Do zrobienia przez człowieka" w dzienniku. Oczekiwane: sekwencja zamknięcia wypisuje
   obie i pyta o każdą, a `STATUS.md` **nie** dostaje statusu `ZREALIZOWANY` przed odpowiedzią.
   Po dopisaniu adnotacji „*(rozstrzygnięte …)*" ten sam plan zamyka się bez pytania o bramki.

Projekty testowe do scenariuszy E i F: generator `fixtury.js` opisany we wpisie dziennika z E2
(2026-08-12) — projekty `B_ponizej_progu` i `D_wylacznik`. Do scenariuszy G–I: instrumenty
`rozjazd.js` i `podpis.js` z E3 budują projekty o właściwej strukturze (opis we wpisie dziennika
z 2026-08-12 o E3). Foldery żyją poza repozytorium.

## Poza zakresem

- Zmiany w treści komendy, specyfikacji i skilla — chyba że pomiar wykaże defekt; wtedy poprawka
  wchodzi tutaj razem z ponownym pomiarem.
- Mechanika rotacji zmierzona już w E2 (bajt w bajt, dwufazowość, wpis z otwartą pozycją, sumy
  sekcji nietykalnych) — tutaj mierzysz **zachowanie sesji**, nie procedurę.
- Cokolwiek z zakresu dalszych etapów planu.
- Przelogowanie CLI — to krok człowieka, opisany niżej.

## Weryfikacja

- [ ] Dziewięć scenariuszy wykonanych **świeżymi sesjami** `claude -p` (stdin, `--permission-mode
      acceptEdits`, `--allowedTools "Bash"` — L-0024, L-0028), każdy z zapisanym wynikiem.
- [ ] Scenariusze E i F wykonane na wersji **co najmniej 1.2.0** potwierdzonej w `installed_plugins.json`
      (L-0020) — na 1.1.0 rotacji nie ma, więc cisza nic nie dowodzi. Scenariusze G–I wymagają
      **co najmniej 1.3.0** z tego samego powodu.
- [ ] Scenariusz G: dokładnie jedno zdanie o rozjeździe w odpowiedzi (policzone w treści), projekt
      spójny → zero wzmianek.
- [ ] Scenariusz H: suma kontrolna sekcji „Zasady projektu (odziedziczone)" identyczna przed i po.
- [ ] Scenariusz I: `STATUS.md` bez statusu `ZREALIZOWANY` do czasu odpowiedzi o bramkach.
- [ ] Scenariusz A: sumy kontrolne sekcji `PLAN.html` przed i po są identyczne.
- [ ] Scenariusz C: drzewo plików przed = po, co do sumy każdego pliku.
- [ ] Scenariusz D: odnoga OPIS_REPO zamknięta rytuałem, `gh repo view` zwraca niepusty opis.
- [ ] Wpis w `docs/DZIENNIK.md` z wynikami czterech pomiarów; defekt znaleziony → poprawka
      i pomiar ponowny, nie sama adnotacja.

## Do zrobienia przez człowieka, zanim ta odnoga ruszy

`claude /login` w terminalu — CLI musi być zalogowane na konto z dostępnym limitem. Bez tego
pomiar padnie na tym samym błędzie („You've hit your session limit").

## Wynik

**ANULOWANA 2026-09-01 decyzją człowieka — bez wykonania.** Warunkiem startu było `claude /login`
na konto z dostępnym limitem (L-0032); konto zapisane w pliku poświadczeń CLI ma limit wyczerpany,
a decyzja brzmi: odpuszczamy i login, i odnogę.

**Co zostaje niezmierzone:** dziewięć scenariuszy zachowań w świeżej sesji — cztery odnogowe
(punkt 8 weryfikacji E1), dwa rotacyjne (punkty 5 i 7 weryfikacji E2) i trzy z poprawek E3
(punkty 3, 4 i 6). Ich brak nie unieważnia niczego, co już zmierzono w aplikacji; oznacza tylko,
że **zakres ryzyka R2 pozostaje niezmierzony w części dołożonej po 1.1.0** — dziesiąta komenda,
sygnał odchylenia, rozjazd stanu i kontrola podpisu.

**Odwrócenie jest tanie:** karta i zakres zostają w repozytorium, więc gdy pojawi się konto
z limitem, odnoga wraca jednym zdaniem — nic nie trzeba odtwarzać.

**Domknięcie 2026-09-03 (decyzja człowieka).** `PROMPT_ODNOGA.md` **usunięty** — gotowy prompt
w folderze odnogi anulowanej wygląda dla świeżej sesji jak zadanie do wykonania, a nie jak ślad po
decyzji; historia gita trzyma go w całości (D-18: przeniesienie albo zapis, nigdy ciche kasowanie).
Karta i zakres zostają, więc odwrócenie nadal jest tanie: prompt odtwarza się z tej karty tak samo,
jak powstał pierwotnie. Razem z tym **ryzyko R2 zostało zamknięte** — nie dlatego, że scenariusze
zmierzono, tylko dlatego, że nie zostaną zmierzone nigdy i przestaje to być zaległością.
