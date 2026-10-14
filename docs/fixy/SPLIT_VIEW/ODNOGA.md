# ODNOGA — paski i panel RelAI w każdym panelu podziału okna, bez linii w stopce

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-14 · Status: **OTWARTA** ·
Wykonawca: Opus 5.5 w świeżej sesji (start po zamknięciu KOMUNIKAT_ZWROTU — zamknięta 2026-10-14)

## Cel

W podziale okna aplikacji (dwie i trzy sesje obok siebie, także pionowo) każda sesja rysuje swoje
trzy paski RelAI i panel `/relai-panel` — zmierzone na żywo z wersją aplikacji i Claude Code — a
linia w stopce z odnogi PASKI_W_STOPCE, która te paski zastępowała, znika z kodu, dokumentów i
z otwartych sesji.

## Skąd się wzięła

2026-10-14 Łukasz zgłosił, że Anthropic zamknął zgłoszenie anthropics/claude-code#99265 (paski
`AbovePrompt` rysowane tylko w lewym panelu podziału; zamknięte 2026-10-14 11:09 bez komentarza)
i że paski widać w każdej otwartej sesji. W notatkach aplikacji do 2.37337.1 (2026-10-13, Claude
Code 2.1.295) tej poprawki nie ma, więc fakt wymaga pomiaru. Obejściem była linia `$.ui.status`
w stopce (P-040, odnoga PASKI_W_STOPCE) — po poprawce dubluje paski. Przegląd zmian CLI
2.1.296–2.1.299 wydzielił resztę usprawnień (typografia `Text`, rozbicie `register.tsx`) do
przyszłego planu.

## Zakres

1. **Pomiar na żywo z Łukaszem** (bramka wszystkiego niżej): dwie sesje obok siebie i dwie pionowo,
   trzy sesje obok siebie; w każdym panelu trzy paski (`relai-panel`, `relai-progress`,
   `relai-cache-keeper`), `Pane` panelu RelAI (`$.ui.open`) i linia `$.ui.status`; wersja aplikacji
   i Claude Code zapisane; zrzuty do `docs/zasoby/PANEL_RELAI/zrzuty/`.
2. **Wycofanie linii w stopce** (tylko gdy pomiar potwierdzi wszystkie panele):
   `cache-keeper/hooks/register.tsx` (`pushFooter` ~386–397 i wywołania ~408, ~1059, ~1192) —
   jednorazowe `$.ui.status(undefined)` przy starcie sesji, bo stara linia przeżywa przeładowanie
   (P-040 pkt 6); `panel/hooks/register.tsx` ~125–134 (zapis `.claude/relai/stopka/<sesja>.txt`);
   `core/panel/footer.mjs` z kopiami (`panel/hooks/core/`, `progress/hooks/core/`,
   `cache-keeper/hooks/relai/`) przez `sync-panel-core.js`, pilnowane testem parytetu;
   `cache-keeper/hooks/footer.test.ts`.
3. **Dokumenty:** `docs/PULAPKI.md` P-040 → `ROZWIĄZANA <data>` z wersją aplikacji (pkt 3 o
   `SessionMode`/`PromptHint` zostaje, jeśli pomiar go potwierdzi); `STYL_PASKOW_CLAUDE.md` §12
   oznaczony jako wycofany (historia zostaje, D-18); `README.md` (~96) i `docs/KOMENDY.md` bez
   wzmianki o skrócie w stopce; karta `docs/fixy/PASKI_W_STOPCE/ODNOGA.md` — dopisek w „Wynik”.
4. **Praca etapami w podziale okna:** krótki opis w dokumentacji użytkownika (`README.md` albo
   `docs/KOMENDY.md`), że start etapu w nowej sesji można otworzyć obok bieżącej i obie mają
   własne paski oraz panel.
5. **Wersje i wydanie:** podbicie `relai-cache-keeper`, `relai-panel`, `relai-progress` (zmienione
   pliki) w `plugin.json` i `.claude-plugin/marketplace.json`; wydanie wyłącznie po zgodzie Łukasza.

## Poza zakresem

- Typografia modów (`Text size/weight/mono/tabular`, `weight` zamiast `bold`), rozbicie
  `cache-keeper/hooks/register.tsx`, porządki P-023 pkt 10–11 i pinów „measured on” w manifestach —
  przyszły plan, gdy aplikacja dostanie Claude Code ≥ 2.1.299 (decyzja Łukasza 2026-10-14).
- Wąskie okno: baterie pierwszego wiersza łamią się na trzy linie (`rings.ts`).
- Pomiar kosztów sesji (`.claude/relai/pomiary/`) — działa w każdym panelu i zostaje.
- Pliki `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` — nie dotykasz, nie
  commitujesz.

## Weryfikacja

- [ ] Pomiar na żywo: każdy układ z punktu 1 zakresu ma zapisany wynik (paski / `Pane` /
      `$.ui.status` per panel), wersję aplikacji i Claude Code; zrzuty w repo. Panel bez pasków →
      odnoga zatrzymuje punkt 2 i pyta Łukasza.
- [ ] Po wycofaniu: `grep -rn "pushFooter\|footerPath\|footerPlan\|stopka/" panel progress
      cache-keeper core` → 0 trafień w kodzie (kontrola pozytywna na HEAD przed zmianą); stara linia
      znika z otwartej sesji po przeładowaniu — zrzut.
- [ ] `claude plugin validate .` i `claude plugin test .` w `panel/`, `progress/`, `cache-keeper/`
      zielone binarką aplikacji (P-024 pkt 4); testy rdzenia `node --test
      core/{guardrails,panel,process}/tests/*.test.js` zielone, w tym parytet kopii rdzenia.
- [ ] P-040, STYL §12, README, KOMENDY i karta PASKI_W_STOPCE opisują nowy stan; `grep -r` po
      starych numerach wersji trzech pluginów rozstrzygnięty.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/SPLIT_VIEW/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika, artefakty spoza niego wypisane z nazwy.

## Wynik

—
