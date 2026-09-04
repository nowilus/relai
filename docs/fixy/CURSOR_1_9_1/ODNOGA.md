# ODNOGA — adapter Cursora zmierzony na wydaniu 1.9.1

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-09-04 ·
Status: **OTWARTA** · Wykonawca: model klasy najsilniejszej w Cursorze — **Grok 4.6**
(lista modeli z dnia `2026-09-04`)

## Cel

Adapter Cursora ma **przebieg w swoim własnym narzędziu na wersji 1.9.1**: reguły zawsze-w-kontekście,
hook startu sesji ze zdaniem o liście modeli i o jej wieku, blokada sekretu przez opakowanie powłoki
oraz trzy komendy, których w Cursorze nie uruchomiono nigdy (`/relai-clean`, `/relai-models`
i jedna dowolna z pozostałych). Po wątku wiadomo, **co w Cursorze działa, a co nie** — zdaniami
opartymi na przebiegu, nie na czytaniu kodu.

## Skąd się wzięła

Pilotaż adaptera Cursora odbył się na wersji **1.6.x** (E6 planu ROZWOJ_PO_WYDANIU, 2026-08-17).
Od tego czasu weszły trzy wydania — 1.7.0 (rotacja, przegląd spraw, progi), 1.8.0 (sprzątanie
artefaktów, jedenasta komenda), 1.9.0/1.9.1 (listy modeli, dwunasta komenda, poprawka `_fixy`) —
i **żadne z nich nie było w Cursorze uruchomione ani razu**. Reguły `.mdc` tego adaptera niosą
opisy mechanizmów z 1.7.0 i 1.8.0, których nikt tam nie widział w działaniu. To dziś największa
dziura w pokryciu: połowa produktu ma trzy wydania bez przebiegu we własnym narzędziu.

## Zakres

1. **Instalacja do projektu kontrolnego** — `node adapters/cursor/install.js <projekt>` na świeżym
   projekcie RelAI. Sprawdzasz, co realnie powstało: `.cursor/rules/*.mdc` (trzy pliki),
   `.cursor/commands/` (**dwanaście** plików), `.cursor/skills/`, `.claude/relai/templates/`,
   wpisy w `.cursor/hooks.json` i manifest `.cursor/relai-install.json` z numerem wersji.
2. **Start sesji w aplikacji Cursora** — hook `sessionStart` z `adapters/cursor/hooks/session-context.js`:
   czy pada zdanie o tym, **która lista modeli obowiązuje** (`MODELE-cursor.md`, 1.9.0), czy przy
   liście starszej niż próg pada **drugie zdanie o jej wieku** (1.9.x), i czy przy liście świeżej
   nie pada ani jedno słowo.
3. **Blokada sekretu w żywej sesji Cursora** — próba zapisu pliku z syntetycznym kluczem
   (`AKIA` + 16 znaków) przez opakowanie powłoki `secret-scanner.cmd`, z **kontrolą pozytywną**:
   ten sam zapis bez sekretu ma przejść. Dowodem jest **nieobecność pliku na dysku**, nie sam
   komunikat.
4. **Trzy komendy nieuruchomione w Cursorze** — `/relai-clean` (1.8.0), `/relai-models` (1.9.0)
   i jedna z pozostałych do wyboru. Każda uruchomiona **frazą, którą wpisuje użytkownik**, nie
   przez czytanie pliku komendy.
5. **Deinstalacja** — `node adapters/cursor/install.js <projekt> --uninstall`: czy usuwa dokładnie
   to, co położyła, i czy cudzy wpis w `.cursor/hooks.json` przeżywa obie operacje.

## Poza zakresem

- **Zmiany w kodzie adaptera.** Wątek jest pomiarem. Znaleziony defekt idzie do wpisu dziennika
  i do „Czeka na człowieka", a poprawka jest osobną decyzją — chyba że jest jednolinijkowa
  i blokuje dalszy pomiar; wtedy pytasz przed jej zrobieniem.
- **Adapter Codeksa i plan ROZWOJ_PO_WYDANIU** — plan jest zamrożony i pozostaje zamrożony.
- **Cokolwiek w adapterze Claude Code** — ten jest zmierzony i wydany.
- **Rotacja i sprzątanie w tym repozytorium** — wykonane 2026-09-04, nie wracasz do nich.

## Weryfikacja

- [ ] Instalacja: `.cursor/relai-install.json` niesie wersję **1.9.1**, a `.cursor/commands/` ma
      **dwanaście** plików, w tym `relai-models.md` i `relai-clean.md` — policzone komendą.
- [ ] Start sesji w **aplikacji Cursora** (nie z powłoki) wypisuje zdanie o liście modeli
      `MODELE-cursor.md` z jej datą; przy liście postarzonej ponad próg pada druga linia
      `[RelAI lista modeli]`, przy świeżej — **zero znaków**. Obie wersje w jednym przebiegu.
- [ ] Zapis pliku z syntetycznym kluczem **odbity**, a pliku **nie ma na dysku**; ten sam zapis bez
      sekretu w tym samym przebiegu **przechodzi**.
- [ ] Trzy komendy uruchomione frazą użytkownika: każda kończy się swoim właściwym efektem
      (`/relai-clean` — raport w grupach; `/relai-models` — pytanie o zgodę na ruch sieciowy przed
      pierwszym połączeniem; trzecia — efekt opisany w `docs/KOMENDY.md`).
- [ ] Deinstalacja usuwa wyłącznie pliki RelAI: cudzy wpis w `.cursor/hooks.json` postawiony przed
      pomiarem **jest na miejscu** po `--uninstall`, a katalogi RelAI zniknęły.
- [ ] Rozstrzygnięte zdanie ze `STATE.md` o hooku `beforeReadFile`: instalator Cursora stawia dziś
      **dwa** wpisy (`sessionStart`, `preToolUse`), więc albo zdanie jest nieaktualne i idzie do
      poprawki, albo brakuje hooka — i wtedy to jest osobna sprawa dla człowieka.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/CURSOR_1_9_1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z liczbami przed i po
      we wpisie dziennika; artefakty spoza tego katalogu (projekt kontrolny w `%TEMP%`) wypisane
      z nazwy.

## Wynik

—
