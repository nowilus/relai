# ODNOGA — opis repozytorium na GitHubie

Plan: [ROZWOJ_PO_WYDANIU](../../archiwum/plany/ROZWOJ_PO_WYDANIU/STATUS.md) · Etap-źródło: E1 — Odnoga planu · Utworzona: 2026-08-12 ·
Status: **OTWARTA — wątek samodzielny od 2026-09-24** (przeniesiona z odnóg planu przy zamknięciu PIERWSI_UZYTKOWNICY) · Wykonawca: Opus

> **Zakres odświeżony w E2 planu [PIERWSI_UZYTKOWNICY](../../archiwum/plany/PIERWSI_UZYTKOWNICY/STATUS.md)
> dnia 2026-09-13.** Poprzednie brzmienie opisywało RelAI 1.5.x — jeden adapter i pusty opis jako
> zaległość ośmioetapowego planu. Produkt ma dziś 2.1.4, trzy adaptery i materiał demo, więc zakres
> i kryteria zostały przepisane. Brzmienie sprzed odświeżenia zachowane niżej w sekcji
> [„Poprzednie brzmienie"](#poprzednie-brzmienie--stan-z-2026-08-12) oraz w historii gita.
> **Odnoga pozostaje OTWARTA** — jej domknięcie wymaga zmiany po stronie GitHuba, czyli dyspozycji.

## Cel

Człowiek, który trafia na `github.com/nowilus/relai` z listy repozytoriów, z wyszukiwarki GitHuba
albo z linku w cudzym poście, ma **przed wejściem do README** wiedzieć, czym RelAI jest i dla kogo.
Dziś nie wie nic: pole About jest puste.

**Odczyt 2026-09-13** (FAKT, `gh repo view nowilus/relai --json description,homepageUrl,repositoryTopics`):

```json
{"description":"","homepageUrl":"","repositoryTopics":null}
```

Stan identyczny jak przy założeniu odnogi 2026-08-12 — trzynaście miesięcy produktu dalej, cztery
wydania publiczne później. To nie jest „jeszcze nie zdążyliśmy": to trwały stan, który każdego dnia
kosztuje jednego czytelnika.

## Skąd się wzięła

Aneks A do planu ROZWOJ_PO_WYDANIU (2026-08-12) rozstrzygnął, że repo jest już publiczne, i zostawił
pusty opis jako zadanie etapu E8 — czyli na koniec ośmioetapowego planu. Repo było publiczne
**wtedy**, więc każdy dzień bez opisu był dniem, w którym trafiający tam człowiek nie wiedział, na co
patrzy. Wątek nie mieścił się w zakresie E1 i nie zmieniał planu.

**Dlaczego wraca w E2 planu PIERWSI_UZYTKOWNICY:** ten etap przygotowuje teksty, które kierują ludzi
prosto na to repozytorium. Zaproszenie prowadzące do repo bez opisu jest zaproszeniem do ślepego
zaułka. Plan wskazał tę odnogę jako **zależność E2** i zakazał tworzenia drugiej na ten sam temat
(sekcja 5 planu).

## Zakres

1. **Opis repozytorium** — jedno zdanie po angielsku, ustawiane przez `gh repo edit --description`.
   Dziś `""`.

   Kandydat z manifestu (`.claude-plugin/plugin.json`, odczyt 2026-09-13):
   *„Your project remembers everything — documentation-first process framework for Claude Code"*.

   **Do rozstrzygnięcia w odnodze, nie tutaj:** to zdanie jest starsze od produktu — mówi „for
   Claude Code", a RelAI 2.1.4 ma trzy adaptery (Claude Code, Cursor, natywny plugin Codeksa).
   Albo opis repozytorium idzie za produktem i rozjeżdża się z manifestem, albo najpierw zmienia się
   `description` w manifeście, a opis repozytorium go kopiuje. Druga droga oznacza podbicie wersji
   pluginu, więc jest decyzją, nie poprawką przy okazji.

2. **Tematy repozytorium** (`repositoryTopics`, dziś `null`) — ustawiane przez
   `gh repo edit --add-topic`.

   Zestaw z `keywords` manifestu (odczyt 2026-09-13): `documentation`, `process`, `project-memory`,
   `planning`, `workflow`, `onboarding`.

   **Do rozstrzygnięcia w odnodze:** lista nie zawiera ani jednej nazwy narzędzia, więc człowiek
   szukający na GitHubie po `claude-code`, `cursor` czy `codex` tego repozytorium nie znajdzie.
   Dołożenie ich znaczy albo rozjazd z manifestem, albo zmianę `keywords` — ta sama decyzja co
   w punkcie 1, ten sam koszt.

## Poza zakresem

- Sekcja README, banner, ikony — wizytówka repo jest gotowa od 2026-08-10, a od 2026-09-12 niesie
  osadzony materiał demo.
- `homepageUrl` — wymaga decyzji, czy projekt ma stronę; nie ma jej dziś. Wariant „strona i szeroka
  promocja" został jawnie **odrzucony** w sekcji 4 planu PIERWSI_UZYTKOWNICY.
- Treść manifestu (`description`, `keywords`) — jej zmiana to podbicie wersji pluginu i pełna
  sekwencja wydania (P-005). Odnoga może ją **zarekomendować**, nie wykonać po cichu.
- Cokolwiek z zamkniętego zakresu E8: wydanie, sekcje README per narzędzie, dystrybucja.

## Weryfikacja

- [ ] `gh repo view nowilus/relai --json description` zwraca niepuste zdanie, a jego treść jest
      **rozstrzygnięta wobec manifestu**: albo identyczna z `description` z
      `.claude-plugin/plugin.json`, albo różna świadomie i z zapisanym powodem w sekcji „Wynik".
- [ ] `gh repo view nowilus/relai --json repositoryTopics` zwraca niepustą listę, rozstrzygniętą
      wobec `keywords` manifestu tą samą regułą co opis.
- [ ] **Kryterium stoi na stronie, nie w pliku lokalnym** (L-0075): opis i tematy widoczne na
      `github.com/nowilus/relai` przy odczycie z konta innego niż właściciel albo w trybie
      wylogowanym — zrzut albo datowany odczyt w sekcji „Wynik".
- [ ] Żaden plik w repozytorium nie został zmieniony, jeśli rozstrzygnięcie nie objęło manifestu
      (dowód negatywny: `git status --short` pusty poza dokumentami zamknięcia odnogi). Jeśli objęło
      — odnoga kończy się **rekomendacją**, a zmiana manifestu idzie przez sekwencję wydania.

## Poprzednie brzmienie — stan z 2026-08-12

Zachowane w całości, bo karta odnogi nie jest nadpisywana po cichu (reguła profilu „prompty").

> **Cel:** `gh repo view nowilus/relai --json description` zwraca jedno zdanie mówiące, czym RelAI
> jest i dla kogo — dziś zwraca `""` (FAKT, sprawdzone 2026-08-12), więc na liście repozytoriów
> i w wynikach wyszukiwania GitHuba projekt nie mówi o sobie nic.
>
> **Zakres:** (1) Opis repozytorium — jedno zdanie po angielsku, spójne z `description`
> w `.claude-plugin/plugin.json` („Your project remembers everything — documentation-first process
> framework for Claude Code"). Ustawiane przez `gh repo edit`. (2) Tematy repozytorium
> (`repositoryTopics`, dziś `null`) — zestaw z listy `keywords` `.claude-plugin/plugin.json`,
> bez wymyślania nowych.
>
> **Weryfikacja:** opis niepusty i identyczny z manifestem; tematy zgodne z `keywords` co do
> zestawu, nie kolejności; żaden plik w repozytorium niezmieniony.

**Co się zmieniło i dlaczego:** stare kryterium „identyczne z manifestem" było wykonalne mechanicznie
i **fałszywe merytorycznie** — kopiowało do wizytówki repozytorium zdanie opisujące produkt
jednonarzędziowy sprzed trzech serii wydań. Nowe kryterium wymaga rozstrzygnięcia rozjazdu, zanim
cokolwiek trafi na stronę. Doszło też kryterium odczytu na żywej stronie (L-0075: grafikę i opis
ocenia się tam, gdzie je widać).

## Wynik

—
