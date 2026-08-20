# templates — specyfikacje dokumentów

Pliki w tym folderze **nie są szablonami do skopiowania**. To specyfikacje-instrukcje dla LLM
(D-60): opisują rolę dokumentu, odbiorcę, strukturę sekcji, politykę aktualizacji i pokazują
przykład. Dokument w projekcie użytkownika powstaje przez **generację w języku projektu**, a nie
przez skopiowanie pliku.

Dzięki temu projekt prowadzony po angielsku (albo w dowolnym innym języku) działa bez tłumaczenia
zasobów pluginu.

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_CLAUDE_MD.md](SPEC_CLAUDE_MD.md) | `CLAUDE.md` | router procesowy, maks. 10 KB, zakaz treści odtwarzalnej z repo, sekcja niemutowalna |
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
| [SPEC_ODNOGA.md](SPEC_ODNOGA.md) | `docs/plany/<TEMAT>/odnogi/<NAZWA>/ODNOGA.md` + `PROMPT_ODNOGA.md` | boczny wątek z etapu; para plików, jedna linia w `STATUS.md`, plan zamrożony nietknięty; bez planu — `docs/fixy/<NAZWA>/` |

MINIPLAN (D-31) nie ma własnej specyfikacji — jest wpisem w dzienniku i opisuje go
[SPEC_DZIENNIK.md](SPEC_DZIENNIK.md), sekcja „Wpis typu MINIPLAN".

Jedna specyfikacja opisuje dokument, który powstaje **przy pierwszym zdarzeniu, nigdy na zapas**
(D-11, L-0029) i jest czytany **na żądanie**, więc nie wchodzi do warstwy startowej sesji:

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_PULAPKI.md](SPEC_PULAPKI.md) | `docs/PULAPKI.md` | warunkowy — powstaje przy pierwszej pułapce razem z jedną linią odsyłacza w `CLAUDE.md`; append, najnowsze u góry; poza budżetem startu sesji |

Jedna specyfikacja opisuje dokument jednorazowy, który powstaje wyłącznie przy adopcji zastanego
projektu komendą `/relai-adopt` (D-70, D-71):

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_RAPORT_ADOPCJI.md](SPEC_RAPORT_ADOPCJI.md) | `docs/RAPORT_ADOPCJI.md` | pisany raz przy adopcji; nośnik procedury pełnego cofnięcia — jedyny artefakt, który przeżywa sesję adopcji |

Jedna specyfikacja opisuje pliki, które powstają **same**, w rytuale zamknięcia sesji, gdy żywe
dokumenty przekroczą próg z `USTAWIENIA.md` (od 1.2.0):

| Specyfikacja | Generuje | Polityka |
|---|---|---|
| [SPEC_ARCHIWUM.md](SPEC_ARCHIWUM.md) | `docs/archiwum/dziennik/DZIENNIK_<od>_<do>.md` + `docs/archiwum/lekcje/LEKCJE_<od>_<do>.md` | rotacja dwufazowa: kopia bajt w bajt i weryfikacja sum kontrolnych, dopiero potem przycięcie żywego pliku; poniżej progu cisza |

Pięć kolejnych specyfikacji opisuje **profile projektów** (D-50…D-53) i dokumenty warunkowe, które
profil dokłada. Żaden z nich nie powstaje przy inicjalizacji — wszystkie przy zdarzeniu (D-10):

| Specyfikacja | Generuje | Zdarzenie wyzwalające |
|---|---|---|
| [SPEC_PROFILE.md](SPEC_PROFILE.md) | sekcję „Reguły profilu" w `CLAUDE.md` + `docs/ARTEFAKTY.md` | źródło prawdy o czterech profilach; rejestr artefaktów — pierwszy artefakt (profil `prompty`) |
| [SPEC_ARCHITEKTURA.md](SPEC_ARCHITEKTURA.md) | `docs/ARCHITEKTURA.md` | pierwszy plik źródłowy (profil `app`) |
| [SPEC_DESIGN.md](SPEC_DESIGN.md) | `docs/DESIGN.md` | pierwszy plik interfejsu (profil `app`) |
| [SPEC_SRODOWISKA.md](SPEC_SRODOWISKA.md) | `docs/srodowiska/<NAZWA>.md` | pierwsze wdrożenie środowiska (profil `app`) |
| [SPEC_SNAPSHOT.md](SPEC_SNAPSHOT.md) | `docs/snapshoty/<data>/` | **przed** zmianą konfiguracji produkcyjnej (profile `agent-voice`, `flow`) |

## Wyjątek od reguły „specyfikacja, nie szablon": `HTML_PLAN/`

Podkatalog [`HTML_PLAN/`](HTML_PLAN/) jest **jedynym miejscem w tym folderze z realnymi plikami
do skopiowania**, a nie z instrukcją. Powód: plan HTML to jeden samowystarczalny plik z osadzonymi
fontami i skryptem — opis słowny nie odtworzy ani ~145 KB base64, ani dokładnego CSS komponentów.
Reguła D-60 zostaje nienaruszona tam, gdzie ma sens: **treść** planu nadal powstaje przez generację
w języku projektu, kopiowany jest wyłącznie nośnik.

| Plik | Rola |
|---|---|
| `HTML_PLAN/szablon.html` | szkielet: design tokens w `:root`, komponenty w CSS, pasek, szyld, dziesięć pustych sekcji, skrypt |
| `HTML_PLAN/komponenty.html` | repertuar do wyboru: karteczka, listy celów, tabela, karta wariantu, diagram, wykres, symulator wraz z jego skryptem — bierzesz tylko to, czego dany plan potrzebuje |
| `HTML_PLAN/zbuduj.js` | osadza fonty, usuwa znacznik nieużytego symulatora i zgłasza pozostałe niewypełnione znaczniki (Node, zero zależności) |
| `HTML_PLAN/fonty/*.woff2` | Kalam 400/700 i Hanken Grotesk, podzbiory latin + latin-ext (SIL OFL) |

Hook `session-context` kopiuje **całe drzewo** `templates/` do `.claude/relai/templates/`
w projekcie — razem z podkatalogiem i fontami. Rozszerzenia objęte kopiowaniem: `.md`, `.html`,
`.js`, `.css`, `.woff2`.

Projekt może mieć **własną wersję szablonu** (D-62): kopię `HTML_PLAN/` w `docs/zasoby/HTML_PLAN/`,
która ma pierwszeństwo przed wersją z pluginu. Mieszka w repozytorium, a nie w cache'u
`.claude/relai/`, bo hook nadpisuje ten cache przy każdym starcie sesji, a `.gitignore` z `*`
trzymałby własny styl poza repo. Mechanizm opisuje skill `relai-planning`.

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
