# ODNOGA — skille RelAI według praktyk Agent Skills: lżejsze, mierzone, bez historii w instrukcjach

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-11 · Status: **ZAMKNIĘTA 2026-10-12** ·
Wykonawca: **Opus 5.5 w świeżej sesji** (D-85; wzorzec „subagent sesji Fable 5.1” odwołany
2026-10-11). Zmiana 2026-10-12 (Łukasz): S1 startuje z jawną listą wyjątków dla naruszeń, które
naprawia dopiero S2; odnoga kończy się commitem bez wydania — wszystko wchodzi do RelAI 3.0.0.

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
   Naruszenia zastane, które naprawia S2 (2026-10-12: `relai-core/SKILL.md` 510 linii, `<` w opisie
   `relai-planning`), stoją na jawnej liście wyjątków w walidatorze — każda pozycja z plikiem,
   kontrolą i zmierzoną wartością; walidator wypisuje je jako ostrzeżenie, a S2 listę opróżnia.
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

- [x] S1: `node core/tools/validate-adapters.js` wypisuje nowe kontrole i kończy exit 0 na bieżącym
      repo, z listą wyjątków dokładnie dwóch naruszeń zastanych (wypisanych jako ostrzeżenie);
      kontrola pozytywna na podłożonym defekcie: opis z `<X>`, 1030 znaków, 501 linii, rozjazd
      „Na koniec” — każdy osobno daje exit 1 z nazwą pliku (w pliku spoza listy wyjątków).
- [x] S2: `wc -l` i rozmiar obu `SKILL.md` ≤ 300 linii / ≤ 15 KB (SZACUNEK ≈ 4–5k tokenów), opisy
      ≤ 800 znaków bez `<`; budżet startu sesji z hooka spada o co najmniej 10 KB wobec 122,8 KB
      z 2026-10-11; pliki doczytywane wymienione w tabeli SKILL.md z wyzwalaczem; `history.md`
      zaktualizowany; parytet Codeksa (`validate-adapters`) exit 0; lista wyjątków z S1 pusta (kod
      listy usunięty albo pusty, walidator nie wypisuje już ostrzeżeń o tych dwóch plikach).
- [x] S3: `grep -n "do 1\.[0-9]\.[0-9]\|zmieniła adres\|Do 1\.5" core/templates adapters/claude-code/skills`
      zwraca wyłącznie linie w sekcjach „Dawniej” / `history.md`; każdy plik > 100 linii zaczyna się
      listą „Zawartość”; `SPEC_PROMPT_ETAPU.md` §9 i skill dają tę samą liczbę kroków (test z S1).
- [x] S4: `rotate.js plan` na kopii dzisiejszego `docs/DZIENNIK.md` wypisuje zakres i trzy wagi;
      `sprawdz` porównuje sumy; `wykonaj` odtwarza dzisiejszą rotację ryzyk C3/C9 bajt w bajt
      (suma `3d1c7384436e320c`); przebieg z podłożoną niezgodną sumą zatrzymuje się przed fazą 2.
- [ ] S5: zestaw ≥ 6 pozycji na skill; przebieg na Opus 5.5 i Sonnet 5.5 (D-90) z wynikiem
      zapisanym w `docs/archiwum/pomiary/` i linkiem w `ARTEFAKTY.md`; co najmniej jedna fraza
      negatywna, która na starym opisie wyzwalała skill, po S2 go nie wyzwala (kontrola pozytywna
      zmiany).
      **Nieodhaczone świadomie:** wszystko poza ostatnim zdaniem spełnione (14 pozycji, 7 na skill,
      36/36 `ok` na obu modelach, link w `ARTEFAKTY.md`); kontrola zmiany dała 1 wyzwolenie na
      6 sesji starego opisu („jak to ugryźć”, Sonnet 5.5) wobec 0 na 6 nowego — kierunek zgodny,
      różnica w granicach szumu, więc zmiana opisu nie jest tym dowiedziona. Przyjęte tak, jak jest
      (Łukasz 2026-10-12) — bez powtórzeń przed 3.0.0.
- [x] S6: `grep -L "disable-model-invocation: true"` na pięciu komendach — pusto; `grep -r '\$ARGUMENTS'
      adapters/codex/skills` — pusto; `claude plugin validate .` exit 0; README i INSTALACJA mają akapit
      o granicach.
- [x] S7: walidator zgłasza wywołanie sieciowe w module spoza listy (test na podłożonym pliku);
      przegląd `progress/` według listy zapisany w dzienniku z werdyktem.
- [x] Katalog roboczy `.claude/relai/work/_fixy/AUDYT_SKILLI/` przejrzany raportem i skasowany po
      „tak”; liczby przed i po we wpisie dziennika, artefakty spoza niego z nazwy.

## Wynik

Zamknięta 2026-10-12 w jednej sesji Opus 5.5 (`/effort high`), paczki w kolejności S1 → S2 → S3 →
S6 → S4 → S5 → S7, **bez wydania** — wszystko wchodzi do RelAI 3.0.0. Sześć z siedmiu paczek
spełnia kryterium Weryfikacji w całości; S5 bez ostatniego zdania (kontrola zmiany w granicach
szumu, powód przy punkcie). Przebieg i liczby: wpis dziennika „AUDYT_SKILLI zamknięta” z tego dnia;
ewaluacje: [EVAL_TRIGGERS_2026-10-12](../../archiwum/pomiary/EVAL_TRIGGERS_2026-10-12.md).

Najważniejsze liczby (FAKT): `relai-core/SKILL.md` 510 → 247 linii, 31 146 → 15 109 B, opis
1 018 → 773 znaków; `relai-planning/SKILL.md` 457 → 224 linii, 28 320 → 13 218 B, opis 997 → 797;
warstwa startu sesji 112 047 → 96 010 B (tym samym instrumentem), 122,8 KB z 2026-10-11 → 93,8 KB;
testy rdzenia 299 → 331; ewaluacje 36/36 `ok` na Opus 5.5 i Sonnet 5.5.

Wiersze BRAK / CZĘŚCIOWO z [RAPORT.html](RAPORT.html) — rozstrzygnięcie każdego:

| # | Luka | Rozstrzygnięcie |
|---|---|---|
| 2 | opis ≤ 1024 bez tagów | zrobione (S1 kontrola, S2 `TOPIC`, opisy 773 / 797) |
| 4 | opis bez ogólników | zrobione (S2: „od czego zacząć”, „jak to ugryźć” poza opisem planning); pomiar S5: fałszywe wyzwolenie rzadkie także na starym opisie |
| 5 | treść nie powtarza opisu | zrobione (S2: akapity zakresu i historii do `history.md`) |
| 6 | strażnik 500 linii | zrobione (S1: błąd > 500, ostrzeżenie od 480) |
| 7 | Level 2 < ~5k tokenów | zrobione (S2: 15,1 / 13,2 KB; tokeny SZACUNEK — przelicznika w repo nie ma) |
| 8 | SKILL.md jako spis | zrobione (S2: tabela „plik → kiedy” w planning) |
| 9 | odwołania jeden poziom | częściowo: rotacja idzie skryptem z komendą sumy w `document-rotation.md` (S4), więc procedura nie schodzi do SPEC-ów; nazw sekcji SPEC w tabeli SKILL.md nie dodano — przy skrypcie zbędne |
| 10 | spis w plikach > 100 linii | zrobione (S3: linia „Zawartość” w 28 plikach) |
| 11 | bez treści zależnej od czasu | zrobione (S2 numer wersji poza treść, S3 sekcje „Dawniej”) |
| 13 | skrypty zamiast generowania | zrobione (S4: `rotate.js`, `count-rules.js`) |
| 15 | lista do skopiowania | zrobione (S3/S4: zamknięcie sesji, „Na koniec”, zamknięcie planu) |
| 18 | nazwa opisowa | odrzucone (karta: zmiana nazwy łamie wywołania i hooki) |
| 19 | zwięzłość | zrobione (S2: uzasadnienia pomiarowe poza skill) |
| 20 | historia poza tokiem | zrobione (S3: grep karty trafia wyłącznie w „Dawniej” / `history.md`) |
| 21 | terminologia „karta” | zrobione (S3: karta startu / panelu / odnogi) |
| 22 | jedno źródło „Na koniec” | zrobione (S1 kontrola zgodności trzech list, S3 SPEC §9 odsyła do skilla) |
| 23 | bez powtórzeń | zrobione (S2: jeden blok „Zasady każdej siatki”) |
| 24 | plan-validate-execute | zrobione (S4: `plan` / `sprawdz` / `wykonaj`, STOP przed fazą 2) |
| 27 | zakazy z alternatywą | częściowo: w core 13 zakazów → 8 „Granic” (S2); 13 „Nie…” w `relai-crew.md` zostaje — to granice bezpieczeństwa orkiestracji (zgoda, role, zapis), nie dublety |
| 28 | tylko kontekst nieznany modelowi | częściowo odrzucone: odwołań D-/L- 27 → 15 (core) i 34 → 20 (planning); reszta zostaje jako pochodzenie reguły („Czego nie ruszać”) |
| 29 | brak `node` | zrobione (S4: jedno zdanie w core i `session-close.md`) |
| 31 | ewaluacje ≥ 3 na skill | zrobione (S5: 7 na skill, w repo) |
| 33 | fałszywe wyzwolenie | zrobione (S5: 7 negatywów, 2 jako kontrola starego opisu) |
| 34 | ewaluacje zachowania | poza zakresem (karta) — kandydat po 3.0.0 |
| 36 | obserwacja nawigacji | zrobione (S5: log odczytów plików skilla i licznik rytuału) |
| 37 | opis chroniony walidatorem | zrobione (S1) |
| 39 | procedura „nie wyzwolił się” | zrobione (S5: P-034 w `PULAPKI.md`) |
| 42 | opinie użytkowników | poza zakresem (karta: `/relai-feedback`) |
| 44 | przegląd cudzego kodu | zrobione (S7: `SPEC_PRZYJECIE_KODU.md`, kontrola sieci w walidatorze, przegląd `progress/` — PRZYJĘTY) |
| 47 | opis „co + kiedy” komend | zrobione (S6: 14 opisów) |
| 48 | `disable-model-invocation` | zrobione (S6: 5 komend + `agents/openai.yaml` w Codeksie) |
| 49 | `$ARGUMENTS` w Codeksie | zrobione (S6: generator, 0 trafień) |
| 50 | jeden format skilli | poza zakresem — zmienia D-89; pytanie w „Czeka na człowieka” |
| 52 | granice dystrybucji | zrobione (S6 akapit i `keywords`, S1 spójność opisów) |

Świadomie odłożone: generator Codeksa nie składa `description: >` (żadna komenda tego zapisu nie
używa); `relai-prompt.md` 30,1 KB — ostrzeżenie walidatora (> 20 KB), bez zmiany w tej odnodze.
