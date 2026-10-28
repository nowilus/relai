# Nakładka rodziny `claude`

overlay-date: 2026-09-24

Uzupełnienie [REGULY.md](../REGULY.md) i [SZABLONY.md](../SZABLONY.md) dla modelu docelowego,
którego pozycja na liście narzędzia (`.claude/relai/MODELE-<narzędzie>.md`) ma `family: claude`.
Rdzeń obowiązuje dalej w całości; nakładka mówi, **jak** to samo powiedzieć temu modelowi.

**Jak czytasz zakres reguły.** `rodzina` — reguła obowiązuje przy każdym modelu z `family: claude`.
`nazwa z listy: X` — reguła obowiązuje **wyłącznie** wtedy, gdy model docelowy ma na liście nazwę X
(pole przed pierwszym `|`); alias tego nie rozstrzyga, bo ten sam alias u innego dostawcy wskazuje
inny model. Dwie reguły o tym samym temacie → wygrywa ta z nazwą.

**Każda reguła ma źródło i datę odczytu.** Reguła bez nich nie wchodzi do tego pliku. Linia
`overlay-date` to data ostatniego odczytu źródeł — hook startu mówi, gdy jest starsza niż 30 dni.

---

## Reguły rodziny

### C1 — Sekcje w tagach XML

Zakres: rodzina.
Rusztowanie z `SZABLONY.md` przepisujesz tak, że każda sekcja stoi we własnym tagu: kontekst
w `<context>`, zadanie w `<task>`, zakres w `<scope>`, ograniczenia w `<constraints>`, warunek
odbioru w `<done_when>`, granice działania w `<boundaries>`. Treść sekcji zostaje ta sama; zmienia
się tylko opakowanie.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices · odczyt 2026-09-24

### C2 — Materiał przed zadaniem

Zakres: rodzina.
Długi materiał wejściowy (wklejony tekst, dokument, wynik narzędzia) stoi **na początku** promptu,
przed zadaniem i ograniczeniami; samo polecenie zamyka prompt. Kilka dokumentów — każdy w
`<document>` z `<source>` i `<document_content>`. Dostawca podaje do 30% lepszą jakość w swoich
testach, najwięcej przy wielu dokumentach naraz.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices · odczyt 2026-09-24

### C3 — Zwykły ton zamiast wersalików nacisku

Zakres: rodzina.
Nie wzmacniasz polecenia wersalikami ani słowami „KRYTYCZNE", „MUSISZ", „NIGDY" — piszesz je zwykłym
zdaniem („Użyj X, gdy…"). Nowsze modele traktują nacisk dosłownie i stosują polecenie tam, gdzie
nie było potrzebne. Źródło wiąże to wprost z modelami 4.5 i 4.6; dla rodziny 5.x strona tego nie
powtarza, więc reguła stoi na tej samej zasadzie ogólnej.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices · odczyt 2026-09-24

### C4 — Zakres i długość wprost przy wąskim zadaniu

Zakres: rodzina.
Przy zadaniu wąskim dopisujesz zdanie o zakresie („zrób to, o co proszę, w zamierzonym zakresie;
bez dodatkowych funkcji i poprawek poza nim") i długość dokumentu wprost, gdy wynikiem jest tekst.
Model bierze zakres dosłownie — „każda sekcja, nie tylko pierwsza" trzeba napisać.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 · odczyt 2026-09-24
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 · odczyt 2026-09-24

### C5 — Frontend: konkretne wzorce do unikania

Zakres: rodzina.
Prompt o wyglądzie interfejsu nie mówi „unikaj generycznego wyglądu AI" — takie zdanie zamienia
jeden domyślny styl na inny. Wymieniasz konkretne wzorce do pominięcia (np. kremowe tło, numerowane
etykiety sekcji „01/02/03", przyciski w kształcie pigułki) albo podajesz specyfikację wyglądu.
Wzorce bierzesz z oryginału albo z dokumentów projektu; nie dopisujesz własnych bez markera.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 · odczyt 2026-09-24
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 · odczyt 2026-09-24

### C6 — Raport w pracy agentowej (domyślnie dla rodziny)

Zakres: rodzina.
Zamiast „po każdym kroku meldujesz" prosisz o krótkie podsumowanie wykonanej pracy po zakończeniu
zadania z użyciem narzędzi. Reguły z nazwą (C7–C10) zastępują tę regułę przy swoich modelach.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices · odczyt 2026-09-24

## Reguły z nazwą modelu

### C7 — Opus 5.5: zdanie zamiaru i podsumowanie

Zakres: nazwa z listy: Opus 5.5.
Raport w pracy agentowej to jedno zdanie zamiaru przed pierwszym krokiem i krótkie podsumowanie na
końcu — tak dostawca opisuje przewidywalne meldunki tego modelu przy pracy z człowiekiem.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 · odczyt 2026-09-24

### C8 — Opus 5.5: bez zdań „pomyśl dokładnie"

Zakres: nazwa z listy: Opus 5.5.
Nie dopisujesz „pomyśl dokładnie", „przemyśl to krok po kroku" — model sam decyduje, ile myśleć.
Takie zdanie w oryginale usuwasz i mówisz o tym w zdaniu podsumowującym.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5 · odczyt 2026-09-24

### C9 — Opus 5: bez „sprawdź ponownie" i z jednym zdaniem zamiaru

Zakres: nazwa z listy: Opus 5.
Nie dopisujesz „sprawdź ponownie", „zweryfikuj przed odpowiedzią" — model sprawdza swoją pracę
sam, a takie polecenie powoduje nadmiarową weryfikację; zdanie z oryginału usuwasz. Raport: jedno
zdanie zamiaru przed pierwszym krokiem, w trakcie tylko przy ważnym znalezisku albo zmianie
kierunku, na końcu wynik na początku.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5 · odczyt 2026-09-24

### C10 — Sonnet 5: bez wymuszanych meldunków

Zakres: nazwa z listy: Sonnet 5.
Nie dopisujesz meldunków w trakcie pracy („po każdych trzech krokach podsumuj postęp") — dostawca
zaleca usunąć takie rusztowanie. Zostaje raport na końcu. Zadanie, zamiar i ograniczenia stoją w
promptcie od razu, bo model czyta je dosłownie.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5 · odczyt 2026-09-24

### C11 — Fable 5.1: meldunki zamawiane wprost

Zakres: nazwa z listy: Fable 5.1.
Model pisze mniej meldunków niż poprzednik, więc prosisz o nie wprost: jedna linia zamiaru przed
startem, krótkie meldunki w trakcie, podsumowanie, które da się przeczytać bez reszty. Zdanie
tłumiące meldunki („zachowaj wszystkie ustalenia na koniec") usuwasz.
Źródło: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1 · odczyt 2026-09-24
