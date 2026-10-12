# Przegląd spraw przeterminowanych

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy hook `session-context` wypisał blok
`[RelAI przeglad spraw]` z listą spraw z sekcji „Czeka na człowieka" starszych niż `N` dni.

`N` i wyłącznik stoją w wierszu `Przegląd spraw człowieka` w `docs/USTAWIENIA.md` (domyślnie
`włączony · 30 dni`, `SPEC_USTAWIENIA.md`). **Wyłącznik jest osobny od rotacji:** `Rotacja
dokumentów: wyłączona` nie wycisza tego przeglądu, a wyłączony przegląd nie wycisza rotacji.

**Wykrycie niesie hook**, nie skill — działa przy każdym modelu i bez wyzwalania czegokolwiek
(L-0030, R2). Blok wymienia treść sprawy, wiek w dniach i licznik odroczeń; **lista hooka jest
rozstrzygająca**. Cisza hooka znaczy „nic przeterminowanego" albo „przegląd wyłączony".

## Kiedy pytasz

Gdy spełnione są **wszystkie trzy** warunki:

1. hook wypisał blok `[RelAI przeglad spraw]` z listą spraw,
2. blok **nie** kończy się linią „Sesja nieinteraktywna",
3. sesja jest interaktywna.

## Jak pytasz

Przed akapitem „gdzie jesteśmy", narzędziem `AskUserQuestion`, **partiami po cztery sprawy**, aż
do wyczerpania listy — cztery sprawy na jedno wywołanie. Każda sprawa ma **trzy realne wybory**:

| Wybór | Co robisz w tej samej turze |
|---|---|
| **Zamknąć** | pozycja **znika** z sekcji „Czeka na człowieka", a we wpisie źródłowym dostaje `*(rozstrzygnięte RRRR-MM-DD — <treść decyzji>)*`; decyzja idzie do wpisu dziennika tej sesji |
| **Odroczyć o kolejne `N` dni** | pozycja **zostaje**, a jej adnotacja odroczenia dostaje dzisiejszą datę i licznik podniesiony o jeden (`SPEC_DZIENNIK.md`) |
| **Rozstrzygnąć teraz** | wykonujesz to, co człowiek rozstrzygnął, i dopiero potem zamykasz pozycję jak wyżej |

**Trzecie i każde kolejne odroczenie** — w treści pytania podajesz wprost liczbę dni od pierwszego
wystąpienia i liczbę wcześniejszych odroczeń. Odroczenia nie odmawiasz: decyzja należy do
człowieka, zmienia się komunikat, nie prawo do odpowiedzi.

Pytanie nie zamienia się w rozstrzygnięcie za człowieka — sprawy nie zamykasz „bo widać, że
nieaktualna" (L-0025). Odmowa odpowiedzi zamyka temat na tę sesję. Sesja nieinteraktywna: nie
pytasz o nic, raport hooka jest całością.
