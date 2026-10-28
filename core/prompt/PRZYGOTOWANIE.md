# PRZYGOTOWANIE — wywołanie optymalizatora promptów

Kroki 1b i 6 komendy `/relai-prompt`, wydzielone z niej w KONTEKST_STARTU E3 bez zmiany treści.
Wykonuje je **sesja**, zawsze — także wtedy, gdy przepisanie oddaje agentowi
`relai-prompt-optimizer`: agent nie wie, na jakim modelu działa sesja, i nie otwiera rejestrów
projektu. Pozostałe kroki procedury: `PROCEDURA.md` w tym samym katalogu.

## Krok 1b — model docelowy i nakładka rodziny

Model optymalizatora (Krok 1) **przepisuje** prompt; **model docelowy** go **wykona**. To dwa różne
pytania: reguły dostawców bywają sprzeczne (jeden model meldunki trzeba zamawiać, drugiemu je
usuwać), więc prompt ma mówić językiem modelu docelowego. Rozstrzygasz go **tutaj, w sesji** —
agent nie wie, na czym ona działa — i przekazujesz agentowi razem z tekstem.

Model docelowy bierzesz z **pierwszego pasującego** źródła, **bez pytania**:

| # | Źródło | Zasięg |
|---|---|---|
| 1 | flaga `--dla <wartość>` na początku argumentu (obok `--model`, w dowolnej kolejności) — nazwa, alias albo `id` z listy | wyłącznie to wywołanie; niczego nie zapisujesz |
| 2 | zdanie dotyczy wykonania etapu planu („wykonaj E5", „/relai-stage E5") → model wykonawczy z linii metrycznej `STATUS.md` tego planu | to wywołanie |
| 3 | model, na którym działa ta sesja | domyślnie |

**Pozycję na liście** szukasz we wszystkich listach projektu `.claude/relai/MODELE-*.md` — model
docelowy może pracować w innym narzędziu niż ta sesja. Dopasowanie po nazwie (pole przed pierwszym
`|`), aliasie albo `id` służy **wyłącznie** znalezieniu pozycji; alias pasujący do pozycji w dwóch
listach rozstrzyga lista tego narzędzia (nazwa ze zdania hooka startu). **Rodzinę bierzesz z pola
`family` znalezionej pozycji**, nigdy z nazwy — ten sam alias u innego dostawcy wskazuje inny model.

**Nakładka** to `rodziny/nakladka-<family>.md`, szukana w tej kolejności: `.claude/relai/prompt/rodziny/`,
potem `core/prompt/rodziny/` (sesja w repozytorium RelAI).

| Co zastajesz | Co robisz |
|---|---|
| pozycja z `family`, nakładka istnieje | przekazujesz agentowi linię `Model docelowy: <nazwa z listy> · family: <rodzina> · nakładka: <ścieżka>`; pracując sam, otwierasz nakładkę sam |
| pozycja bez `family`, `family: -` albo rodzina bez nakładki | linia `Model docelowy: <nazwa> · sam rdzeń`; nic nie mówisz — to zachowanie zaplanowane |
| **model spoza list** (nazwa z flagi, z planu albo model sesji nieobecny na żadnej liście) | `sam rdzeń` i **jedno zdanie** w podsumowaniu z odesłaniem do `/relai-models`. Rodziny **nie odgadujesz** z nazwy |
| **list nie ma** | ta część milczy; `sam rdzeń`, bez zdania |

Wynik tego kroku widać w wyjściu: agent kończy propozycję linią `target:` (Krok 11), więc człowiek
wie, dla jakiego modelu prompt jest skrojony.

## Krok 6 — blok kontekstu projektu

Zadanie oparte na wcześniejszych rozstrzygnięciach dostaje **blok kontekstu**: kilka pozycji pamięci
projektu przeniesionych do promptu **z numeru albo nazwy**. Bez niego model docelowy czyta skróty
projektu jak obcy — zmierzone w tym projekcie: `E5` przeczytane jako licencja pakietu biurowego
zamiast etapu planu.

Blok powstaje, gdy **oba** warunki są spełnione: projekt ma marker `Wersja RelAI:`
w `docs/USTAWIENIA.md` **i** zadanie realnie opiera się na wcześniejszych ustaleniach. Którykolwiek
warunek niespełniony → sekcja **nie powstaje**; pusty nagłówek jest gorszy niż jego brak, a przy
projekcie bez struktury RelAI mówisz o tym najwyżej pół zdaniem w podsumowaniu (b10).

**Trzy źródła — i ani jedno więcej:**

| Źródło | Co stamtąd bierzesz | Jak nazywasz pozycję |
|---|---|---|
| `docs/DECYZJE.md` | decyzja zamrożona, której zadanie dotyka | `D-85` |
| `docs/LEKCJE.md`, sekcja „Zasady aktywne" | zasada obowiązująca w tym zadaniu | `zasada 4` |
| `docs/STATE.md` | stan: co działa, co jest w toku, co już próbowano i nie zadziałało | nazwa pozycji, dosłownie |

Dziennika, planów ani archiwum **nie otwierasz** — historia jest tam po to, żeby jej nie nosić
w każdym prompcie.

**Jak wybierasz.** Pozycja wchodzi wtedy, gdy **jej usunięcie zmieniłoby treść promptu**: dotyka
tego samego pliku, obszaru albo mechanizmu co zadanie, rozstrzyga sposób wykonania albo mówi, że
czegoś już próbowano i nie zadziałało. Pokrewieństwo tematyczne nie wystarcza. Dwa zadania o różnych
tematach dostają **różne** zestawy pozycji — identyczny blok pod każdym promptem znaczy, że nie
wybierasz, tylko przepisujesz pamięć projektu.

**Jak wypisujesz.** Każda pozycja to identyfikator plus **jedno zdanie własnymi słowami o tym, co
z niej wynika dla tego zadania**. Wiersz **zaczyna się od identyfikatora**, po nim myślnik i zdanie
(`- D-85 — …`, `- zasada 6 — …`, `- Reguła głębokości rotacji — …`). Etykiety źródła, z którego
pozycję wziąłeś (`[STATE]`, `[DECYZJE]`), **nie przepisujesz** — człowiek szuka numeru, nie
szuflady. Przepisane brzmienie rejestru nie jest wyborem, tylko cytatem.
„Dołączono kontekst projektu" nie jest blokiem kontekstu — człowiek ma widzieć, co doleciało, żeby
móc to odrzucić.

**Limit: 1 300 znaków i najwyżej sześć pozycji.** Liczba skalibrowana na realnym materiale tego
projektu (123 pozycje pamięci, mediana 164 znaki, trzeci kwartyl 216 — sześć pozycji po trzecim
kwartylu to 1 296 znaków). Przekroczenie → **przycinasz po pozycjach najmniej związanych
z zadaniem**, od końca listy, nigdy w środku pozycji: rozstrzygnięcie ucięte w połowie zdania niesie
numer bez treści. Przycięcie odnotowujesz w zdaniu podsumowującym.

Miejsce bloku: **pierwsza jedna trzecia propozycji**, przed treścią zadania — rusztowania mają na to
sekcję `Kontekst projektu (przeniesiony)`.

