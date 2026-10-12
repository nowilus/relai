# Sygnał odchylenia i odnogi planu

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy w trakcie etapu albo odnogi wypływa
wątek spoza zakresu, gdy człowiek prosi o odnogę („odnoga", „boczny wątek", „odłóż to na potem",
„branch this off") albo gdy zamykasz odnogę.

Zawartość: sygnał odchylenia · odnogi planu.

## Sygnał odchylenia — wątek spoza zakresu etapu

W trakcie etapu regularnie wypływa coś, czego w zakresie nie ma: usterka obok, brakujący log,
pomysł, który akurat teraz wydaje się oczywisty. Zrobienie tego od razu rozdyma etap, miesza dwie
rzeczy w jednym wpisie i psuje pomiar tego, co etap miał dowieźć (retrospektywa 2026-08-12: pięć
wpisów poprawkowych w jednym etapie, sześć aneksów do jednego etapu innego projektu).

**Warunek wyzwolenia:** pracujesz nad etapem planu (albo nad odnogą) i pojawia się rzecz, która
(a) nie mieści się w sekcji „Zakres etapu" promptu, i (b) nie jest jednolinijkowym drobiazgiem,
który wykonasz szybciej, niż o nim napiszesz.

**Co robisz:** zatrzymujesz się i zadajesz **jedno ustrukturyzowane pytanie** (AskUserQuestion),
z trzema opcjami — w tej kolejności:

| Opcja | Kiedy jest właściwa | Co się dzieje |
|---|---|---|
| **Odnoga** (Rekomendowane, gdy wątek ma własny zakres i weryfikację) | osobna robota, 2–5 punktów, da się wykonać w jednej świeżej sesji | `/relai-branch`: karta odnogi + `PROMPT_ODNOGA.md`, linia w sekcji „Odnogi" `STATUS.md` |
| **Aneks do planu** | wątek zmienia **sam plan** — zakres etapu, cel, wybrany wariant | datowany aneks w `PLAN.md` / `PLAN.html`, po zatwierdzeniu treści |
| **Świadomie odłożone** | rzecz warta zapamiętania, ale nie warta osobnego wątku | punkt „Świadomie odłożone" we wpisie dziennika zamykającym etap |

- **Pytasz raz na wątek**, nie raz na myśl. Trzy wątki w jednym etapie to trzy pytania rozłożone
  w czasie — ale nigdy dwa wywołania AskUserQuestion pod rząd.
- **Rekomendację podajesz z powodem w jednym zdaniu**. Odpowiedź swobodna jest nadrzędna.
- Po odpowiedzi **wracasz do zakresu etapu**. Odnogi utworzonej nie wykonujesz teraz.
- Regułę „zatrzymaj się i zapytaj" niesie `CLAUDE.md` projektu (wzorzec L-0030 — warstwa zawsze
  w kontekście); ten plik dokłada procedurę i rozstrzygnięcia.

## Odnogi planu (`/relai-branch`)

Odnoga to **boczny wątek z etapu, który dostaje własne miejsce zamiast rozdymać etap albo zginąć**.
Pełną strukturę obu plików opisuje `.claude/relai/templates/SPEC_ODNOGA.md`; procedurę wykonuje
komenda `/relai-branch`. Zasady, które muszą być znane także bez tej komendy (L-0011):

1. **Gdzie mieszka.** Jest plan → `docs/plany/TEMAT/odnogi/NAZWA/`. Nie ma żadnego planu
   niezamkniętego → `docs/fixy/NAZWA/`, wątek samodzielny. `NAZWA` w CAPS_SNAKE, konwencja
   tematu planu (D-12).
2. **Zawsze para plików.** `ODNOGA.md` — karta odnogi w formacie miniplanu: cel, skąd się wzięła,
   zakres, poza zakresem, weryfikacja, wynik. `PROMPT_ODNOGA.md` — samowystarczalny prompt świeżej
   sesji, generowany tak jak prompty etapowe: **z realnego stanu repo** i z „Zasad aktywnych"
   przepisanych w całości.
3. **Ślad w planie to jedna linia.** Sekcja „Odnogi" w `STATUS.md`, zaraz po tabeli etapów:
   nazwa, jedno zdanie, etap-źródło, link do karty odnogi, status `OTWARTA` / `ZAMKNIĘTA <data>` /
   `PRZENIESIONA <data> → docs/fixy/NAZWA/`. Tabela etapów i dziennik wdrożenia zostają nietknięte.
4. **Plan zamrożony zostaje zamrożony.** Odnoga nie jest aneksem: nie dotyka `PLAN.md` /
   `PLAN.html` (D-33) i nie zmienia zakresu żadnego etapu. Wątek, który zmienia sam plan, to aneks.
5. **Jedna głębokość.** Odnoga od odnogi jest zakazana — wątek z odnogi, który sam potrzebuje
   odnogi, jest sygnałem pełnego planu. Mówisz to wprost i proponujesz plan; żaden plik nie powstaje.
6. **Odnogę wykonuje świeża sesja** z gotowego promptu, na modelu z karty odnogi. Zamknięcie:
   status w karcie → wpis w dzienniku → linia w `STATUS.md`. Odnogi **nie generują** promptu
   następnej odnogi — łańcucha lazy-generacji tu nie ma.
