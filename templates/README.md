# templates — specyfikacje dokumentów

Pliki w tym folderze **nie są szablonami do skopiowania**. To specyfikacje-instrukcje dla LLM
(D-60): opisują rolę dokumentu, odbiorcę, strukturę sekcji, politykę aktualizacji i pokazują
przykład. Dokument w projekcie użytkownika powstaje przez **generację w języku projektu**, a nie
przez skopiowanie pliku.

Dzięki temu projekt prowadzony po angielsku (albo w dowolnym innym języku) działa bez tłumaczenia
zasobów pluginu.

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_CLAUDE_MD.md](SPEC_CLAUDE_MD.md) | `CLAUDE.md` | router procesowy, maks. 60 linii, sekcja niemutowalna |
| [SPEC_README.md](SPEC_README.md) | `README.md` | wizytówka + mapa dokumentacji |
| [SPEC_STATE.md](SPEC_STATE.md) | `docs/STATE.md` | dwuwarstwowy, **nadpisywany** |
| [SPEC_DZIENNIK.md](SPEC_DZIENNIK.md) | `docs/DZIENNIK.md` | append na końcu + stała sekcja ryzyk |
| [SPEC_LEKCJE.md](SPEC_LEKCJE.md) | `docs/LEKCJE.md` | append bez pytania; destylat „Zasady aktywne"; graduacja i kompresja |
| [SPEC_DECYZJE.md](SPEC_DECYZJE.md) | `docs/DECYZJE.md` | append; zamrożone — „nie proponuj ponownie" |
| [SPEC_USTAWIENIA.md](SPEC_USTAWIENIA.md) | `docs/USTAWIENIA.md` | append; nosi marker `Wersja RelAI:`; warstwa globalna |
| [SPEC_KOMENDY.md](SPEC_KOMENDY.md) | `docs/KOMENDY.md` | regenerowany ze stanu faktycznego pluginu |

Osiem dokumentów powyżej (`CLAUDE.md`, `README.md` + sześć plików w `docs/`) to komplet generowany
przy inicjalizacji projektu od wersji 0.2.0.

Trzy kolejne specyfikacje opisują dokumenty, które **nie** powstają przy inicjalizacji — pojawiają
się dopiero z pierwszym planem (D-11: podfolderów nie tworzy się na zapas):

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_PLAN.md](SPEC_PLAN.md) | `docs/plany/<TEMAT>/PLAN.md` | zamrożony po akceptacji; zmiany wyłącznie datowanymi aneksami |
| [SPEC_STATUS.md](SPEC_STATUS.md) | `docs/plany/<TEMAT>/STATUS.md` | jedyne miejsce z postępem etapów; dziennik wdrożenia append na końcu |
| [SPEC_PROMPT_ETAPU.md](SPEC_PROMPT_ETAPU.md) | `docs/plany/<TEMAT>/PROMPT_ETAP_N.md` | generacja lazy (N=1 przy akceptacji, N+1 w rytuale „Na koniec"); prompt etapu zrealizowanego nie jest edytowany |
| [SPEC_PLAN_HTML.md](SPEC_PLAN_HTML.md) | `docs/plany/<TEMAT>/PLAN.html` | gdy preferencja formatu mówi „HTML"; treść wg `SPEC_PLAN.md`, składanie wg `HTML_PLAN/` |

MINIPLAN (D-31) nie ma własnej specyfikacji — jest wpisem w dzienniku i opisuje go
[SPEC_DZIENNIK.md](SPEC_DZIENNIK.md), sekcja „Wpis typu MINIPLAN".

## Wyjątek od reguły „specyfikacja, nie szablon": `HTML_PLAN/`

Podkatalog [`HTML_PLAN/`](HTML_PLAN/) jest **jedynym miejscem w tym folderze z realnymi plikami
do skopiowania**, a nie z instrukcją. Powód: plan HTML to jeden samowystarczalny plik z osadzonymi
fontami i skryptem — opis słowny nie odtworzy ani ~145 KB base64, ani dokładnego CSS komponentów.
Reguła D-60 zostaje nienaruszona tam, gdzie ma sens: **treść** planu nadal powstaje przez generację
w języku projektu, kopiowany jest wyłącznie nośnik.

| Plik | Rola |
|---|---|
| `HTML_PLAN/szablon.html` | szkielet: design tokens w `:root`, komponenty w CSS, pasek, szyld, dziesięć pustych sekcji, skrypt |
| `HTML_PLAN/komponenty.html` | gotowe fragmenty: karteczka, listy celów, tabela, karta wariantu, diagram, wykres, symulator |
| `HTML_PLAN/zbuduj.js` | osadza fonty w gotowym pliku i zgłasza niewypełnione znaczniki (Node, zero zależności) |
| `HTML_PLAN/fonty/*.woff2` | Kalam 400/700 i Hanken Grotesk, podzbiory latin + latin-ext (SIL OFL) |

Hook `session-context` kopiuje **całe drzewo** `templates/` do `.claude/relai/templates/`
w projekcie — razem z podkatalogiem i fontami. Rozszerzenia objęte kopiowaniem: `.md`, `.html`,
`.js`, `.css`, `.woff2`.

Specyfikacje `ARCHITEKTURA` i `DESIGN` dochodzą w kolejnych wersjach pluginu.

Trzy rejestry mają rozłączne role i nie wolno ich mieszać (D-15): `LEKCJE` — korekty zachowania
agenta; `DECYZJE` — rozstrzygnięcia w projekcie, których się nie otwiera ponownie; `USTAWIENIA` —
odpowiedzi na pytania o preferencje.

## Zasady wspólne dla wszystkich generacji

- **Język projektu** decyduje o treści **i o nazwach plików** (D-12: CAPS_SNAKE, bez dat i wersji
  w nazwie).
- Data zawsze z kontekstu sesji, nigdy z pamięci modelu.
- Zero sekretów w plikach śledzonych — nazwy zmiennych tak, wartości nigdy (D-42).
- Dokument, który przestał być aktualny, dostaje adnotację i trafia do `docs/archiwum/`; nigdy nie
  jest cicho kasowany (D-18).
