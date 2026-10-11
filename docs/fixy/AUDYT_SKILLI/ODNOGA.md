# ODNOGA — skille RelAI według praktyk Agent Skills: lżejsze, mierzone, bez historii w instrukcjach

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-11 · Status: **OTWARTA** ·
Wykonawca: **Opus 5.5** (D-85; dopuszczony wzorzec „Opus jako subagent sesji Fable 5.1” jak
w Z13–Z14 odnogi AUDYT_MODOW — wybór przy starcie każdej paczki)

## Cel

Skille i komendy RelAI (adapter Claude Code jako źródło, Codex przez generator) spełniają praktyki
Agent Skills Anthropic tam, gdzie te praktyki dotyczą pluginu: `SKILL.md` poniżej 5k tokenów
z sekcjami warunkowymi w plikach doczytywanych, opisy bez znaków `<…>` i z zapasem pod limitem 1024,
instrukcje bez historii wersji w toku, operacja niszcząca (rotacja) jako skrypt z fazą planu
i sprawdzenia, trwały zestaw ewaluacji wyzwalania z przypadkami negatywnymi, komendy z efektem
ubocznym tylko na jawne wywołanie — a walidator pilnuje tego przed każdym wydaniem. Po czym poznać:
sekcja „Weryfikacja” i tabela luk w [RAPORT.html](RAPORT.html) ze wszystkimi wierszami BRAK/CZĘŚCIOWO
rozstrzygniętymi (zrobione albo świadomie odrzucone z powodem).

## Skąd się wzięła

2026-10-11 Łukasz poprosił o audyt RelAI wobec dwóch dokumentów Anthropic: „Agent Skills — overview”
i „Skill authoring best practices” (platform.claude.com). Czterech audytorów (Opus 5.5, cztery
soczewki: struktura i metadane, treść, ewaluacja i iteracja, przenośność i dystrybucja) dało 60 wierszy
luk; po deduplikacji w [RAPORT.html](RAPORT.html): 14 ZGODNE, 21 CZĘŚCIOWO, 11 BRAK, 7 „RelAI wyprzedza
dokument” (FAKT — liczby z raportu). Najcięższe ustalenia: `relai-core/SKILL.md` 494 linie / 29,8 KB
wymuszany hookiem w każdej sesji (ok. 8–10k tokenów, SZACUNEK), `<TOPIC>` w opisie `relai-planning`
przy 27 znakach zapasu do limitu, historia wersji w toku instrukcji SPEC-ów, rozjazd rytuału „Na koniec”
między skillem a `SPEC_PROMPT_ETAPU.md` §9, brak ewaluacji wyzwalania w repo, komendy D-70 bez
`disable-model-invocation`, `$ARGUMENTS` w 12 skillach Codeksa.

## Zakres

Siedem paczek S1–S7, w tej kolejności (najpierw strażnik, potem treść, potem narzędzia i ewaluacje).
Każda paczka podbija wersję dotkniętych artefaktów w `docs/ARTEFAKTY.md` i przechodzi przez
generator Codeksa (`adapters/codex/generate-skills.js`), którego parytet pilnuje walidator.

1. **S1 · Strażnik metadanych w walidatorze** — `core/tools/validate-adapters.js` (+ test
   w `core/process/tests/`): `name` `[a-z0-9-]{1,64}`, `description` ≤ 1024 znaków bez `<…>` i bez
   „I/You/MUST BE USED”, treść `SKILL.md` ≤ 500 linii (ostrzeżenie od 480) i ≤ 20 KB (ostrzeżenie),
   spójność `description`/wersji między `plugin.json` każdego pluginu a obydwoma marketplace’ami,
   zgodność listy kroków rytuału „Na koniec” między `relai-planning/SKILL.md` a `SPEC_PROMPT_ETAPU.md` §9.
2. **S2 · Odchudzenie obu `SKILL.md`** — `adapters/claude-code/skills/relai-core/SKILL.md`
   i `relai-planning/SKILL.md`: akapity zakresu i historii (`:19–46`) i numer wersji usunięte; sekcje
   warunkowe do nowych plików doczytywanych (core: siatki bezpieczeństwa, przegląd spraw
   przeterminowanych, warstwa ustawień globalnych, rejestry po adopcji; planning: prompty etapowe,
   sygnał odchylenia i odnogi, rytuał „Na koniec”); jeden blok „Zasady każdej siatki” zamiast czterech
   powtórzeń; tabela „plik → kiedy” w planning jak w core; opisy skrócone do ≤ 800 znaków, `<TOPIC>` →
   `TOPIC`, ogólne frazy planning („od czego zacząć”, „jak to ugryźć”) zawężone do projektu RelAI;
   cel: ≤ 5k tokenów na skill (pomiar przelicznikiem z `.claude/relai/pomiary/`).
3. **S3 · Instrukcje bez historii, z jednym źródłem** — `core/templates/SPEC_ARCHIWUM.md`,
   `SPEC_DZIENNIK.md`, `SPEC_STATE.md`, `SPEC_PROMPT_ETAPU.md`, `relai-core/document-rotation.md`,
   `session-close.md`, `adapters/claude-code/commands/relai-prompt.md`: zdania „do 1.5.2… / zmieniła
   adres w 1.6.0” poza tok instrukcji (sekcja „Dawniej” na końcu albo `history.md`), warunki opisane
   stanem pliku zamiast wersją, spis „Zawartość” w plikach > 100 linii, komenda sumy kontrolnej
   w `document-rotation.md`, rozjazd rytuału „Na koniec” naprawiony (SPEC §9 odsyła do listy skilla),
   checklista do skopiowania na początku zamknięcia sesji / „Na koniec” / zamknięcia planu, słowo
   „karta” rozróżnione (karta startu / karta panelu / karta odnogi).
4. **S4 · Skrypty zamiast ręcznych operacji** — `core/tools/rotate.js` (tryby `plan` / `sprawdz` /
   `wykonaj`: zakres, suma SHA-256, archiwum, przepięcie linków, liczba martwych kotwic; kopiowany do
   `.claude/relai/tools/` przez hook `session-context` jak `clean-work.js`), `core/tools/count-rules.js`
   (liczenie „Zasad aktywnych”) — `session-close.md` i `document-rotation.md` mówią „uruchom”, nie
   „policz”; jedno zdanie w core o braku `node`.
5. **S5 · Ewaluacje wyzwalania** — `core/evals/triggers.json` (na skill: ≥ 3 frazy pozytywne,
   ≥ 3 negatywne z `expect: none`, w tym „zaplanuj spotkanie” i „status” w obcym folderze),
   `core/tools/eval-triggers.js` (`claude -p` z limitem tur wg L-0113, opcja `--baseline` bez pluginu,
   log odczytów plików skilla), wynik do `docs/archiwum/pomiary/`; procedura „skill się nie wyzwolił /
   wyzwala się za często” w `docs/PULAPKI.md` (L-0030, L-0085, L-0113, L-0114, P-002, P-005 w kolejne
   kroki); `/relai-models` po zapisie nowej listy proponuje przebieg zestawu.
6. **S6 · Dystrybucja i kontrola wywołania** — `adapters/claude-code/commands/relai-adopt.md`,
   `relai-clean.md`, `relai-update.md`, `relai-backup.md`, `relai-crew.md`: `disable-model-invocation: true`
   (Codex: `agents/openai.yaml` z wyłączonym wywołaniem domyślnym); `adapters/codex/generate-skills.js`
   zamienia `$ARGUMENTS` na zdanie o argumencie z wiadomości; opisy 14 komend w formule „co + Use
   when…” (EN, frazy PL); `README.md` i `docs/INSTALACJA.md`: akapit „nie działa w claude.ai ani API”;
   `.claude-plugin/plugin.json` `description` i `keywords` (`codex`, `cursor`, `agent-skills`).
7. **S7 · Bezpieczeństwo cudzego kodu** — `core/templates/SPEC_PRZYJECIE_KODU.md` (lista kontrolna
   z overview: sieć, dostęp do plików, zgodność z celem, licencja), kontrola walidatora: wywołania
   `http`/`https`/`fetch` wyłącznie w modułach z listy dozwolonych; przegląd forka `savvy-progress`
   według listy, wynik w dzienniku.

## Poza zakresem

- Jeden katalog `skills/` w standardzie Agent Skills dla trzech narzędzi (likwidacja kopii Codeksa
  i generatora) — zmienia zamrożoną decyzję D-89 i kształt trzech adapterów; kandydat na osobny plan,
  pytanie w „Czeka na człowieka”.
- Ewaluacje zachowania (`expected_behavior`) dla wszystkich 14 komend — po S5 i decyzji o koszcie.
- Zmiana nazwy `relai-core` na opisową — łamie wywołania i hooki; odrzucone na teraz.
- `/relai-feedback` (lokalny kanał „skill nie zadziałał”) i metryka nieotwieranych plików — po S5.
- Treść procesu poza skillami (CLAUDE.md, `.mdc` Cursora, `AGENTS.md`) — poza dokumentami Anthropic
  o skillach.

## Weryfikacja

- [ ] S1: `node core/tools/validate-adapters.js` wypisuje nowe kontrole i kończy exit 0 na bieżącym
      repo; kontrola pozytywna na podłożonym defekcie: opis z `<X>`, 1030 znaków, 501 linii, rozjazd
      „Na koniec” — każdy osobno daje exit 1 z nazwą pliku.
- [ ] S2: `wc -l` i rozmiar obu `SKILL.md` ≤ 300 linii / ≤ 15 KB (SZACUNEK ≈ 4–5k tokenów), opisy
      ≤ 800 znaków bez `<`; budżet startu sesji z hooka spada o co najmniej 10 KB wobec 122,8 KB
      z 2026-10-11; pliki doczytywane wymienione w tabeli SKILL.md z wyzwalaczem; `history.md`
      zaktualizowany; parytet Codeksa (`validate-adapters`) exit 0.
- [ ] S3: `grep -n "do 1\.[0-9]\.[0-9]\|zmieniła adres\|Do 1\.5" core/templates adapters/claude-code/skills`
      zwraca wyłącznie linie w sekcjach „Dawniej” / `history.md`; każdy plik > 100 linii zaczyna się
      listą „Zawartość”; `SPEC_PROMPT_ETAPU.md` §9 i skill dają tę samą liczbę kroków (test z S1).
- [ ] S4: `rotate.js plan` na kopii dzisiejszego `docs/DZIENNIK.md` wypisuje zakres i trzy wagi;
      `sprawdz` porównuje sumy; `wykonaj` odtwarza dzisiejszą rotację ryzyk C3/C9 bajt w bajt
      (suma `3d1c7384436e320c`); przebieg z podłożoną niezgodną sumą zatrzymuje się przed fazą 2.
- [ ] S5: zestaw ≥ 6 pozycji na skill; przebieg na Opus 5.5 i Sonnet 5.5 (D-90) z wynikiem
      zapisanym w `docs/archiwum/pomiary/` i linkiem w `ARTEFAKTY.md`; co najmniej jedna fraza
      negatywna, która na starym opisie wyzwalała skill, po S2 go nie wyzwala (kontrola pozytywna
      zmiany).
- [ ] S6: `grep -L "disable-model-invocation: true"` na pięciu komendach — pusto; `grep -r '\$ARGUMENTS'
      adapters/codex/skills` — pusto; `claude plugin validate .` exit 0; README i INSTALACJA mają akapit
      o granicach.
- [ ] S7: walidator zgłasza wywołanie sieciowe w module spoza listy (test na podłożonym pliku);
      przegląd `progress/` według listy zapisany w dzienniku z werdyktem.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/AUDYT_SKILLI/` przejrzany raportem i skasowany po
      „tak”; liczby przed i po we wpisie dziennika, artefakty spoza niego z nazwy.

## Wynik

—
