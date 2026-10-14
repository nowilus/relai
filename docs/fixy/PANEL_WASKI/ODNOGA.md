# ODNOGA — panel RelAI bez rozjazdów w wąskim panelu podziału okna

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-14 · Status: **OTWARTA** ·
Wykonawca: Opus 5.5 w świeżej sesji

## Cel

Panel `/relai-panel` (plugin `panel/`, `relai-panel` 0.17.0) wygląda poprawnie w wąskim panelu
podziału okna aplikacji desktopowej: tekst zawija się w kaflach, przyciski „Otwórz” / „Rozwiń”
mieszczą się w kaflu, między kaflami jest odstęp, a ramki nie nachodzą na siebie. Wynik jest
zmierzony na żywo z Łukaszem w kilku szerokościach.

## Skąd się wzięła

2026-10-14 odnoga SPLIT_VIEW potwierdziła, że po poprawce Anthropic każdy panel podziału okna
rysuje paski i panel RelAI (`relai-panel` 0.17.0, commit `d6cf943`). Dopiero wtedy panel otworzył
się w wąskim panelu i na zrzutach Łukasza (trzy panele, wąski środkowy) wyszły rozjazdy: w zakładce
Komendy tekst karty „Ta sesja” wychodzi poza kafel („aktywny plan: PANEL” ucięte), przycisk
„Otwórz” w kaflach „Polecane teraz” jest ucięty do „Otwó”, w zakładce Mapa ucięty jest wiersz
„Aktywny plan … $8”, w Kosztach wiersz „Cennik … odczyt 202”, kafle stoją bez odstępów i ich ramki
się zlewają. Z wnętrza SPLIT_VIEW nie wolno było założyć odnogi (jedna głębokość, L-0193), więc
wątek założyła nowa sesja.

## Zakres

1. **Pomiar progów** — szerokości (w kolumnach `bodyColumns`; panel liczy
   `width = Math.max(30, e.props.bodyColumns)`, `panel/hooks/register.tsx` ~825), przy których każda
   zakładka (Teraz, Komendy, Mapa, Dokumenty, Koszty, Pomoc) zaczyna ucinać tekst, wypychać przycisk
   albo sklejać ramki. Wynik: tabela zakładka × szerokość × objaw, z miejscem w kodzie.
2. **Poprawka układu** w miejscach, które pomiar wskaże: `panel/hooks/pane-parts.tsx` (wspólne
   części: `section`, `folded`, `frame`, `factRow`), `panel/hooks/pane-commands.tsx` (kafle
   „Polecane teraz”, przycisk „Otwórz” ~193), `panel/hooks/pane-map.tsx` („Ta sesja”, wiersz
   „Aktywny plan”, przyciski „Rozwiń” ~210), `panel/hooks/pane-costs.tsx` (wiersz „Cennik” ~266),
   `panel/hooks/pane-now.tsx` (`wrap="truncate"` w linii „Ta sesja” ~42), `pane-docs.tsx`,
   `pane-help.tsx`; stałe układu w `core/panel/theme.mjs` (z kopiami przez `sync-panel-core.js`,
   pilnowane testem parytetu), jeśli odstęp ma być wspólną stałą. Środki: zawijanie zamiast
   `truncate` tam, gdzie treść jest potrzebna w całości, `flexShrink={0}` na przyciskach
   i liczbach (L-0152), `flexWrap` w wierszu kafla, `gap` między kaflami.
3. **Testy szerokości** w `claude plugin test` (`panel/hooks/*.test.ts`): każda zakładka
   renderowana w szerokościach z pomiaru (co najmniej najwęższa realna, próg i szeroka), z asercją,
   że przyciski mają pełną etykietę, a tekst kafla nie jest ucięty; kontrola pozytywna na kodzie
   sprzed poprawki (test musi na nim spaść). Binarka aplikacji
   `%APPDATA%\Claude\claude-code\2.1.295\d2e29494ec83\claude.exe` (P-024 pkt 4).
4. **Kalibracja na żywo z Łukaszem**: panel otwarty w wąskim panelu podziału (trzy sesje obok
   siebie) i w co najmniej dwóch innych szerokościach; zrzuty do
   `docs/zasoby/PANEL_RELAI/zrzuty/PANEL_WASKI_*`. Turę przed zrzutem kończysz zwykłym tekstem (P-041).
5. **Wersja i wydanie**: podbicie `relai-panel` w `panel/.claude-plugin/plugin.json`
   i `.claude-plugin/marketplace.json`; wydanie wyłącznie po zgodzie Łukasza.

## Poza zakresem

- Typografia modów (`Text size/weight/mono/tabular`, `weight` zamiast `bold`) i rozbicie
  `register.tsx` — przyszły plan, gdy aplikacja dostanie Claude Code ≥ 2.1.299 (decyzja Łukasza
  2026-10-14).
- Paski nad promptem (`band.tsx`, pasy `relai-progress` i `relai-cache-keeper`) oraz baterie
  pierwszego wiersza łamiące się w wąskim oknie (`rings.ts`) — osobny wątek, nie panel.
- Treść zakładek: nowe sekcje, inne słowa, inne dane — odnoga zmienia tylko układ.
- Widok terminalowy panelu (`isGui === false`) — poza tym, żeby testy terminalowe nadal przechodziły.
- Pliki `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` — nie dotykasz, nie
  commitujesz.

## Weryfikacja

- [ ] Tabela progów (zakładka × szerokość × objaw × miejsce w kodzie) zapisana we wpisie dziennika;
      każdy objaw z zrzutów 2026-10-14 ma w niej wiersz.
- [ ] `claude plugin validate .` i `claude plugin test .` w `panel/` zielone binarką aplikacji
      (P-024 pkt 4); nowe testy szerokości spadają na kodzie sprzed poprawki (kontrola pozytywna
      w tym samym przebiegu, `git worktree` HEAD-a, L-0151) i przechodzą po niej.
- [ ] Testy rdzenia `node --test core/panel/tests/*.test.js` zielone, w tym parytet kopii rdzenia
      (jeśli `theme.mjs` się zmienił).
- [ ] Na żywo, w wąskim panelu przy trzech sesjach obok siebie i w dwóch innych szerokościach:
      w każdej zakładce tekst kafla mieści się w kaflu albo zawija, „Otwórz” i „Rozwiń” mają pełną
      etykietę, między kaflami jest odstęp, ramki się nie stykają — zrzuty w repo, akceptacja
      Łukasza zapisana w dzienniku.
- [ ] `git diff` nie dotyka plików spoza zakresu; po podbiciu wersji `grep -r` po `0.17.0`
      rozstrzygnięty (historyczne vs deklaracja stanu).
- [ ] Katalog roboczy `.claude/relai/work/_fixy/PANEL_WASKI/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika, artefakty spoza niego wypisane z nazwy.

## Wynik

—
