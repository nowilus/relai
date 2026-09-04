# ODNOGA — adapter Cursora zmierzony na wydaniu 1.9.1

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-09-04 ·
Status: **ZAMKNIĘTA 2026-09-04** · Wykonawca: model klasy najsilniejszej w Cursorze — **Grok 4.6**
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

- [x] Instalacja: `.cursor/relai-install.json` niesie wersję **1.9.1**, a `.cursor/commands/` ma
      **dwanaście** plików, w tym `relai-models.md` i `relai-clean.md` — policzone komendą.
- [x] Start sesji — para wariantów na protokole Cursora (`workspace_roots`, podwójny BOM, bez
      `cwd`): lista z `2026-08-05` → linia `[RelAI lista modeli]` **253 znaki**; lista z
      `2026-09-04` → **0 znaków**. Zdanie o `MODELE-cursor.md` w obu. Ta sesja GUI RelAI **nie**
      dostała wstrzyknięcia: w workspace nie było adaptera w momencie startu.
- [x] Zapis z syntetycznym kluczem: opakowanie powłoki → `permission: deny`; świeża sesja
      `cursor-agent -p` na projekcie kontrolnym → `WRITE_DENIED_FILE_MISSING`; kontrola pozytywna
      bez sekretu → plik powstał. Zapis `Write` w tej sesji GUI, po dołożeniu `hooks.json`
      w trakcie, **nie został odbity** (dokumentacja Cursora: hooki ładują się po restarcie).
- [x] Trzy komendy w tej sesji GUI: `/relai-help` — ściąga 1.9.1, wersje zgodne;
      `/relai-models` — stop na Kroku 1 (brak zdania hooka, nie zgaduje narzędzia);
      `/relai-clean` — raport w grupach.
- [x] Deinstalacja: cudzy wpis `afterFileEdit` / `pomiar-cudzy` **został**, katalogi RelAI
      i manifest zniknęły — sprawdzone treścią `hooks.json`.
- [x] Zdanie ze `STATE.md` o hooku `beforeReadFile`: **nieaktualne**. Instalator 1.9.1 stawia
      `sessionStart` i `preToolUse`; `beforeReadFile` w `~/.cursor/hooks.json` należy do harnessu
      użytkownika, nie do RelAI.
- [x] Katalog roboczy `.claude/relai/work/_fixy/CURSOR_1_9_1/` przejrzany raportem
      i skasowany po „tak" razem z `%TEMP%\relai-cursor-1-9-1` i pozostałością
      `REKOMENDACJA_MODELU`: **0,6 MB → 0,0 MB**, raport ponowny — zero kandydatów.

## Wynik

Zmierzono w aplikacji Cursora (Grok 4.6) i na projekcie kontrolnym
`%TEMP%\relai-cursor-1-9-1` 2026-09-04.

**Działa na 1.9.1.** Instalator kładzie manifest `1.9.1`, trzy reguły, dwanaście komend
(w tym `relai-models.md` i `relai-clean.md`), dwa skille, 32 pliki specyfikacji, wpisy
`sessionStart` i `preToolUse`; cudzy wpis w `hooks.json` przeżywa instalację i deinstalację.
Hook startu na protokole Cursora mówi o `MODELE-cursor.md` z datą listy; para wariantów
różniąca się wyłącznie `list-date` daje 253 znaki linii wieku wobec zera. Opakowanie
`secret-scanner.cmd` zwraca `deny` i nie cytuje wartości; świeża sesja `cursor-agent`
na projekcie z hookami od startu nie utworzyła pliku z kluczem, a ten sam zapis bez sekretu
utworzył `ok.md`.

**Nie działa / nie było widać w tej sesji GUI.** Repozytorium RelAI otwarte w Cursorze **nie ma**
zainstalowanego adaptera, więc ta sesja nie dostała `additional_context` RelAI. Dołożenie
`.cursor/hooks.json` w trakcie sesji nie zatrzymało zapisu z kluczem — plik powstał i został
natychmiast skasowany; wartość nie została w repozytorium. `/relai-models` zgodnie z własną
procedurą zakończyła się na Kroku 1, bo zdania hooka nie było w kontekście.

**Nie ruszano kodu.** `adapters/cursor/README.md` nadal mówi o „dziesięciu komendach" przy
dwunastu plikach — zostaje jako znalezisko, nie poprawka.

Wpis: [2026-09-04 — Wątek CURSOR_1_9_1 zmierzony](../../DZIENNIK.md#2026-09-04--wątek-cursor_1_9_1-adapter-cursora-zmierzony-na-wydaniu-191)
