# ODNOGA — panel „RelAI Agents” w stylu Helper Desku: postać roli na agenta, karty na żywo, wejście z paska

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-23 · Status: **ZAMKNIĘTA 2026-10-23** ·
Wykonawca: Opus 5.5 (architektura i wykonanie w bieżącej sesji; wolno też w świeżej, wg promptu)

> Nazwa `AGENTS_KRABY` jest historyczna: 2026-10-23, w trakcie P2, Łukasz zamienił kraby na
> postacie ról (sekcja „Skąd się wzięła”). Folderu nie przemianowujemy (D-18: nic nie znika po cichu).

## Cel

`/relai-agents` otwiera panel **„RelAI Agents”**, który zachowuje się prawie jak Helper Desk (Ben AI),
ale ma własne postacie. Każdy subagent dostaje **rolę** z puli dziewięciu ról firmowych,
rozpoznaną z typu i opisu jego zadania. Rola ma swoje zwierzę, dobrane po stereotypie, i swój strój.
Jeden element stroju jest w kolorze agenta, a imię pochodzi z puli roli. Karta agenta pokazuje
animowaną postać, pasek pracy z falą, linię „co robi teraz”, ostatnie kroki i rozwijaną listę
wszystkich kroków narzędzi. Nad kartami stoją kafle (koszt agentów, kontekst, czas), a karty są
w grupach Działają / Zakończeni / Przerwani. Kod i rysunki są napisane od zera pod rdzeń RelAI.
Panel dobrze wygląda w jasnym i ciemnym motywie aplikacji. Chip agentów w pasku postępu jest
przyciskiem otwierającym panel. Całość zmierzona na żywo w obu motywach i wydana jako
`relai-progress` 0.6.0.

## Skąd się wzięła

2026-10-23 Łukasz wskazał plugin Helper Desk (`C:\Users\Lukasz\Desktop\benai-mods\plugins\helper-desk`,
v0.4.0, Ben AI) jako wzór panelu agentów. Rozpoznanie: Helper Desk **nie ma pliku licencji**
(w `benai-mods` licencję ma tylko `replay-theater`, Apache 2.0), więc wg `SPEC_PRZYJECIE_KODU.md`
kodu nie przyjmujemy. Pierwszy wywiad (2026-10-23) rozstrzygnął:
- własna reinterpretacja z atrybucją „inspirowane”;
- panel i kroki narzędzi, bez fioletowego paska i bez narzędzia `plan`;
- sekcja postępu znika z panelu;
- przycisk agentów widoczny zawsze, gdy sesja ma agentów;
- kafle z naszych pomiarów;
- odnoga zamiast planu, wydanie 0.6.0.

**Zmiana kierunku w trakcie P2 (2026-10-23).** Własny pikselowy krab był gotowy z testami, ale
Łukasz odrzucił kraba („bardziej z OpenClaw kojarzy się niż z Claude”). Kopia 1:1 z Helper Desku
odpada z powodu licencji. Wybrał wariant z czterech pokazanych: **każda rola innym zwierzęciem**,
dobranym po stereotypie, ze strojem roli, z dopracowanymi detalami. Do tego pula dziewięciu ról
(osiem bazowych i Worker jako domyślny) oraz imiona z puli. Z Helper Desku bierzemy układ
i zachowanie panelu, zmieniamy tam, gdzie trzeba. Kod kraba usunięty przed commitem.

## Role i postacie

| Rola | Zwierzę | Strój (element w kolorze agenta pogrubiony) |
|---|---|---|
| Code Reviewer | sowa | okrągłe okulary, **muszka** |
| Audytor bezpieczeństwa | pies stróż | czapka ochrony z odznaką, **obroża** |
| Developer | bóbr | **czapka z daszkiem**, laptop |
| Manager | pingwin | frak, kołnierzyk, **krawat** |
| Architekt | słoń | kask budowlany, **rulon planów** |
| Analityk | lis | kapelusz odkrywcy z **opaską** |
| Tester | szop | gogle ochronne na **pasku**, maska szopa |
| Redaktor dokumentacji | kot | beret, **szalik** |
| Worker (domyślny) | chomik | **apaszka** |

Rola z typu subagenta, potem ze słów jego zadania; reguły węższe przed szerszymi; nic nie pasuje —
Worker. Imię: pierwsze wolne z puli roli (pięć imion na rolę), po wyczerpaniu z numerem.

## Zakres

1. **Przegląd wzorca** wg `.claude/relai/templates/SPEC_PRZYJECIE_KODU.md`. Wynikiem jest wpis
   w dzienniku z siedmioma punktami. Punkt 7 (licencja) jawnie: brak licencji, więc nic nie
   kopiujemy, bierzemy samą ideę. Atrybucja „inspired by Helper Desk (Ben AI)” trafia do opisu
   `progress/.claude-plugin/plugin.json` i do komentarza nagłówka modułu.
2. **Rdzeń** — czysta logika, ESM, testy `node --test`. **Zrobione w P2:** `core/panel/mascots.mjs`
   zawiera:
   - dziewięć postaci na siatce 20 × 16 z animacją CSS (stoi, przysiada, mruga) i
     `prefers-reduced-motion`;
   - obrys zależny od wyglądu aplikacji;
   - osiem barw agenta i `pickHue`;
   - `roleOf` i `nameFor`;
   - pasek karty z falą i bąbelkami;
   - glif terminala.

   Testy są w `core/panel/tests/mascots.test.js`, kopie w pluginach przez
   `node core/tools/sync-panel-core.js`. **Do zrobienia w P3:** `core/panel/agents.mjs` dostaje
   pola `role`, `name` i `hue` oraz licznik i ostatnie kroki narzędzi (`{ kind, label, dim, live }`)
   z limitem. Funkcja opisu wywołania narzędzia działa po polsku. Lista zapisana w `$.state` przed
   zmianą nadal się czyta.
3. **Panel** — `progress/hooks/register.tsx` i nowy moduł rysujący, np. `progress/hooks/pane-agents.tsx`:
   - tytuł `RelAI Agents`; sekcja postępu etapu usunięta z panelu;
   - nagłówek z liczbą agentów, kafle, grupy z rozwijaniem;
   - karta z postacią: na desktopie `Svg`, w terminalu glif w barwie agenta; imię i rola;
   - linia na żywo ze spinnerem, 3 ostatnie kroki, pasek, przycisk „Wszystkie kroki”;
   - nowy hook `tool.call` z `agentId`, który dopisuje krok;
   - koszt jak dziś, z pomiarów `relai-panel` (brak pomiaru opisany słowami, nigdy 0);
   - całość przez `retone` (`progress/hooks/skin.ts`); wąski panel bez rozjazdów (P-043).
4. **Wejście z paska** — `progress/hooks/steps.tsx` i `register.tsx` (`AbovePrompt`): chip
   „● N agentów” staje się przyciskiem otwierającym panel (`togglePane`). Gdy sesja ma agentów,
   a pasek nie ma etapu ani załogi, pasek pokazuje sam wiersz z tym przyciskiem.
5. **Weryfikacja na żywo i wydanie:**
   - zrzuty panelu i paska w jasnym i ciemnym motywie, w szerokim i wąskim panelu, z ≥ 3 agentami
     w różnych rolach;
   - `relai-progress` 0.6.0: manifest, `.claude-plugin/marketplace.json`, `docs/ARTEFAKTY.md`
     jeśli dotyczy;
   - tag i publikacja wg procedury wydań panelu.

## Poza zakresem

- Fioletowy pasek zadań Helper Desku, narzędzie `plan`, sekcja w prompcie systemowym i
  podpowiedzi dla modelu (decyzja RelAI: pasek z plików, nic nie dopisujemy do promptu).
- Przełącznik `/mods`, plik `switches.json`, przycisk „Ukryj” i log `~/.claude/mods-logs`.
- Auto-otwieranie panelu przy pierwszym agencie (odrzucone w wywiadzie).
- Ręczny wybór roli lub imienia przez człowieka (rola wynika z zadania).
- Plugin `relai-panel` poza kopią rdzenia (`panel/hooks/core/`) — jego zakładki bez zmian.
- `relai-cache-keeper`, plany PANEL_CODEX i BEZPIECZENSTWO.

## Weryfikacja

- [x] Wpis przeglądu wzorca w dzienniku z siedmioma punktami i linią `Werdykt przeglądu:`.
      `grep` po charakterystycznych identyfikatorach Helper Desku (`petSvg`, `cardBarSvg`
      w kształcie wzorca, `HUES`, `twinkleCss`, `crab(`) w `progress/` i `core/` daje 0 trafień
      kodu wzorca, z kontrolą pozytywną na pliku wzorca. 2026-10-23 przy zamknięciu: 0 / 32.
- [x] `node --test core/panel/tests/*.test.js` zielone, w tym parytet kopii rdzenia i testy
      `mascots.mjs`: siatki, role, imiona, barwy, klatki, kontrast obrysu w obu wyglądach, waga
      rysunku. Wynik 2026-10-23: 203/203.
- [x] Testy `agents.mjs`: kroki, rola, imię, barwa, lista sprzed zmiany — 2026-10-23: rdzeń
      209/209; `claude plugin test` w `progress/` 43/43, w tym hook `tool.call` z kontrolą
      pozytywną (pętla główna nic nie zapisuje, agent — jeden krok).
- [x] `claude plugin validate .` i `claude plugin test .` w `progress/` zielone (48/48, 2026-10-23). Test panelu
      montuje kartę z postacią (`Svg` z `alt`), grupy, rozwinięte kroki i chip-przycisk z kliknięciem.
- [ ] (ciemny zmierzony i przyjęty, jasny odłożony — dziennik 2026-10-23) Na żywo, w ciemnym i jasnym motywie: panel „RelAI Agents” z ≥ 3 agentami w różnych rolach.
      Postacie ruszają się tylko u działających, obrys jest czytelny w obu motywach, pasek się
      porusza, a zakończony agent przechodzi do grupy „Zakończeni”. Zrzuty w
      `docs/zasoby/PANEL_RELAI/zrzuty/`.
- [x] Na żywo: klik w chip agentów w pasku otwiera panel; sesja bez etapu z agentem pokazuje sam
      przycisk; wąski panel podziału bez uciętych przycisków i nachodzących ramek.
- [x] (2026-10-23: tag `relai-progress-v0.6.0`, wydanie na GitHubie, instalacja z marketplace → `0.6.0/`, kod zgodny z repo) `relai-progress` 0.6.0 wydany; wersja potwierdzona plikiem instalacji (zasada aktywna 10).
- [x] `git diff` nie dotyka plików spoza zakresu.
- [x] (2026-10-23: 20,1 MB → 0, skasowany po „tak”) Katalog roboczy `.claude/relai/work/_fixy/AGENTS_KRABY/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”. Liczby przed i po
      trafiają do wpisu dziennika, artefakty spoza katalogu z nazwy.

## Wynik

Zamknięta 2026-10-23 decyzją Łukasza („jest w porządku, możemy to zamykać”) po kilku rundach
kalibracji na żywo w ciemnym motywie. `relai-progress` 0.6.0 wydany tego samego dnia (tag
`relai-progress-v0.6.0`).

**Karta agenta — jak doszliśmy do obecnej.** Karta P4 (tekst modu, postać obok) była nieczytelna.
Łukasz wybrał z czterech kierunków Pixel Art, potem z czterech krojów pikselowy z małymi literami.
Na żywo pikselowa karta była najpierw dwa razy za duża, po zmniejszeniu nieczytelna, a tekst
w rysunku `Svg` nie zawijał się do szerokości panelu, której mod nie zna (pas pustego miejsca,
ucięte nazwy). Przebudowa wg skilla UI UX Pro Max:
- słowa karty to tekst modu: zawija się w wąskim panelu i rośnie z powiększeniem aplikacji;
- imię rysowane Hanken Grotesk (SIL OFL) z konturów liter (`core/panel/hanken.mjs`, generator
  `core/tools/build-hanken-name.py`), stały rozmiar 16 px, wielokropek gdy brak miejsca;
- nagłówek: postać, imię, pod nim rola i stan w zawijanym wierszu; w prawym górnym rogu chevron
  `▾`/`▴` (natywny `Button` z `plain`) rozwijający kontekst i wszystkie kroki — tylko gdy agent
  ma kroki;
- zadanie, u pracującego „▶ co robi teraz”, siatka Model · Kroki · Koszt · Czas na pełną
  szerokość, zawijana pole po polu;
- pasek z falą tylko u pracującego, na całą szerokość karty;
- ramka rysowana pod kartą (cienka linia `subtle`, cień w barwie agenta) albo ramka `Box` —
  przełącznik kalibracyjny „Ramka: rysunek · zmień” został w panelu;
- dwie karty w rzędzie od 110 kolumn; najwyżej 16 kart rysowanych, ramka-rysunek do 8.

**Odrzucone w kalibracji:** krab (OpenClaw), czcionka pikselowa w karcie (nieczytelna w skali
panelu, tekst w `Svg` nie zawija się), przycisk „Szczegóły” (za duży), procent kontekstu w linii
liczb (niezrozumiały — kontekst opisany słowami po rozwinięciu).

**Niezmierzone na żywo:** jasny motyw aplikacji (rysunki niosą obie palety w CSS, testy pilnują
kluczy motywu i braku surowych kolorów; zrzut w jasnym nie powstał) i nowa wersja paska nad
promptem po kliknięciu chipa (zmierzone w ciemnym przy P5). Zrzuty kalibracji zostały w katalogu
roboczym, nie w `docs/zasoby/PANEL_RELAI/zrzuty/`.
