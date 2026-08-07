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

MINIPLAN (D-31) nie ma własnej specyfikacji — jest wpisem w dzienniku i opisuje go
[SPEC_DZIENNIK.md](SPEC_DZIENNIK.md), sekcja „Wpis typu MINIPLAN".

Specyfikacje `ARCHITEKTURA`, `DESIGN` oraz szablon HTML planów dochodzą w kolejnych wersjach
pluginu.

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
