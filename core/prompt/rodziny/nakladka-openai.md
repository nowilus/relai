# Nakładka rodziny `openai`

overlay-date: 2026-09-24

Uzupełnienie [REGULY.md](../REGULY.md) i [SZABLONY.md](../SZABLONY.md) dla modelu docelowego,
którego pozycja na liście narzędzia (`.claude/relai/MODELE-<narzędzie>.md`) ma `family: openai`.
Rdzeń obowiązuje dalej w całości; nakładka mówi, **jak** to samo powiedzieć temu modelowi.

**Jak czytasz zakres reguły.** `rodzina` — reguła obowiązuje przy każdym modelu z `family: openai`.
Ta nakładka nie ma dziś reguł z nazwą modelu: lista Codeksa nie była odświeżona przed jej
napisaniem, więc nazwy zalecane przez dostawcę i nazwy z listy się rozjeżdżają. Gdy źródło wiąże
regułę z jednym modelem, reguła mówi to wprost i stoi jako reguła rodziny do czasu pomiaru na
pozostałych.

**Każda reguła ma źródło i datę odczytu.** Reguła bez nich nie wchodzi do tego pliku. Linia
`overlay-date` to data ostatniego odczytu źródeł — hook startu mówi, gdy jest starsza niż 30 dni.
Strona `developers.openai.com/api/docs/guides/prompt-guidance` przekierowuje na stronę najnowszego
modelu (sprawdzone 2026-09-24), więc obie pozycje rejestru planu mają tu jeden adres.

---

## Reguły rodziny

### O1 — Cel, ograniczenia i kontrakt wyjścia zamiast kroków

Zakres: rodzina.
Prompt podaje jasny cel, twarde ograniczenia i jawny kształt wyniku, a **nie rozpisuje kroków
pośrednich**. Sekcje rusztowania zostają (zadanie, zakres, ograniczenia, `Gotowe, gdy`), ale
dopisków typu „najpierw zrób A, potem B" nie dokładasz, gdy oryginał ich nie ma. Źródło wiąże to
z modelami rozumującymi GPT-5.
Źródło: https://developers.openai.com/api/docs/guides/reasoning · odczyt 2026-09-24

### O2 — „Gotowe, gdy" razem z tym, jak to sprawdzić

Zakres: rodzina.
Sekcja `Gotowe, gdy` przy pracy agentowej mówi nie tylko, co ma być prawdą, ale też **jak model ma
to sprawdzić** (komenda, test, stan pliku). Warunek bez sposobu sprawdzenia dopisujesz z markerem
dopowiedzenia.
Źródło: https://developers.openai.com/api/docs/guides/reasoning · odczyt 2026-09-24

### O3 — Polecenie użytkownika przed skillem

Zakres: rodzina.
Prompt dla agenta, który ma dostęp do skilli albo pliku `AGENTS.md`, zawiera zdanie, że jawne
polecenie użytkownika ma pierwszeństwo przed procedurą skilla. Źródło mówi o najnowszym modelu
rodziny, że mocniej reaguje na treść skilli i plików instrukcji.
Źródło: https://developers.openai.com/api/docs/guides/latest-model · odczyt 2026-09-24

### O4 — Zachęta do działania zamiast pytań w trakcie

Zakres: rodzina.
W granicach działania dopisujesz: wykonaj pracę, na którą kontekst już pozwala, i doprowadź zadanie
do końca; nie zatrzymuj się na potwierdzeniu, że to możliwe, ani na propozycji planu. Pytania
i prośbę o zgodę zadajesz dopiero z gotowym wynikiem do przejrzenia. Bramki „zatrzymaj się
i zapytaj" z rdzenia zostają **wyłącznie** dla czynności nieodwracalnych, zależności i wyjścia poza
zakres. Źródło opisuje to przy najnowszym modelu rodziny (skłonność do pytań tam, gdzie starsze
modele działały); przy pozostałych modelach reguła jest hipotezą do pomiaru.
Źródło: https://developers.openai.com/api/docs/guides/latest-model · odczyt 2026-09-24

### O5 — Raport na końcu, z wynikiem do przejrzenia

Zakres: rodzina.
Zamiast „po każdym kroku meldujesz" prosisz o raport na końcu: co zrobiono, co sprawdzono i czym,
co zostało. Meldunki w trakcie zostają tylko przy zmianie kierunku albo znalezisku, które zmienia
zadanie. Reguła wynika z O4 — ta sama strona każe przynosić pytania razem z gotowym wynikiem.
Źródło: https://developers.openai.com/api/docs/guides/latest-model · odczyt 2026-09-24

### O6 — Akapity zamiast list tam, gdzie nic nie jest równoległe

Zakres: rodzina.
Gdy wynikiem jest tekst dla człowieka, format w propozycji mówi: zwięzłe akapity, każdy z jedną
myślą; listy tylko przy treści naprawdę równoległej, sekwencyjnej albo do porównania. Źródło wiąże
to z najnowszym modelem rodziny, który domyślnie pisze długo i z dużą ilością formatowania.
Źródło: https://developers.openai.com/api/docs/guides/latest-model · odczyt 2026-09-24

### O7 — Testy znaczące, nie lustrzane

Zakres: rodzina.
Przy zmianie w kodzie prompt prosi o testy właściwe dla zmiany i o wymagane kontrole; testów dla
zmian odwracalnych i drobnych, które tylko powtarzają implementację, nie zamawia. Po zielonych
kontrolach testowanie poszerza się tylko wtedy, gdy uzasadnia to nowa zmiana albo porażka.
Źródło: https://developers.openai.com/api/docs/guides/latest-model · odczyt 2026-09-24
