# ODNOGA — rekomendacja modelu z realnej listy modeli narzędzia

Plan: [ROZWOJ_PO_WYDANIU](../../STATUS.md) · Etap-źródło: E6 — Pilotaż Cursora w firmie · Utworzona:
2026-08-17 · Status: **PRZENIESIONA 2026-09-03 → [docs/plany/REKOMENDACJA_MODELU/](../../../REKOMENDACJA_MODELU/STATUS.md)** ·
Wykonawca: Opus

## Cel

Pytanie o model wykonawczy etapów oraz kontrola modelu w prompcie etapowym operują **nazwami modeli
dostępnych w narzędziu, w którym trwa sesja** — w Cursorze padają nazwy w rodzaju Composer, Auto,
Grok, GPT, Gemini i modeli Anthropic, w Codeksie warianty GPT, w Claude Code modele Anthropic —
zamiast dzisiejszych bezprzydomkowych klas „model najsilniejszy / wyważony / najtańszy", które poza
Claude Code nie wskazują niczego konkretnego.

## Skąd się wzięła

W pilotażu E6 (2026-08-17) karta `/relai-stage` w Cursorze poprawnie zatrzymała sesję i zażądała
„najsilniejszego modelu", ale nie potrafiła powiedzieć, który to jest w tym narzędziu — użytkownik
musiał sam przetłumaczyć klasę na nazwę i wybrał Grok 4.6. Ta sama luka czeka etap E7: adapter
Codeksa powstanie z antropikocentrycznym brzmieniem, jeśli wątek zostanie nierozstrzygnięty.

## Zakres

1. **Klasy modeli zostają w rdzeniu, nazwy w adapterach.** `core/templates/SPEC_CLAUDE_MD.md`
   (linie 51 i 208) opisuje wyłącznie trzy klasy i odsyła po nazwy do listy adaptera; nazwy modeli
   nie wchodzą do rdzenia.
2. **Lista modeli per narzędzie** — nowy plik w każdym adapterze (`adapters/claude-code/MODELE.md`,
   `adapters/cursor/MODELE.md`), z przypisaniem nazw do trzech klas i datą aktualizacji; wpięty do
   `core/MANIFEST.json` tak, jak inne pozycje adaptera, i sprawdzany przez
   `core/tools/validate-adapters.js`.
3. **Pytanie o model wykonawczy pokazuje konkrety** —
   `adapters/claude-code/skills/relai-planning/SKILL.md:139` oraz odpowiadająca reguła
   `adapters/cursor/rules/relai-planning.mdc`: opcje wymieniają nazwy z listy narzędzia, nie same
   klasy.
4. **Kontrola modelu rozpoznaje nazwę, nie tylko klasę** —
   `core/templates/SPEC_PROMPT_ETAPU.md` i `adapters/claude-code/commands/relai-stage.md:72`:
   sesja porównuje model bieżący z listą klasy, a przy modelu spoza listy mówi o tym wprost zamiast
   milczeć.
5. **Zapis w `STATUS.md` planu mówi, w jakim narzędziu ustalono model** —
   `core/templates/SPEC_STATUS.md:26`, żeby plan otwarty w drugim narzędziu nie udawał, że nazwa
   modelu znaczy tam to samo.

## Poza zakresem

- Adapter Codeksa i jakikolwiek jego plik — to etap E7 (L-0002).
- Decyzja D-85 (Opus jako model wykonawczy etapów **tego** projektu) — zostaje bez zmian.
- Automatyczne wykrywanie listy modeli w czasie sesji; lista jest plikiem utrzymywanym ręcznie,
  z datą.
- Ceny, limity i jakiekolwiek porównania wydajności modeli.
- Zmiana pytania o model w komendach innych niż planowanie i etap.

## Weryfikacja

- [ ] `adapters/claude-code/MODELE.md` i `adapters/cursor/MODELE.md` istnieją, każdy ma trzy klasy,
      nazwy modeli i datę aktualizacji.
- [ ] `grep -rn "najsilniejszy" core/templates/` nie zwraca miejsca, w którym klasa występuje bez
      odesłania do listy adaptera.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0 i wykrywa brak pliku listy
      w adapterze (dowód negatywny: usunięcie pliku w kopii daje kod niezerowy).
- [ ] Świeża sesja w Cursorze na prośbę o plan pokazuje w pytaniu o model **nazwy modeli Cursora**
      (zapisany wynik pytania, nie kod).
- [ ] Świeża sesja w Claude Code na tę samą prośbę pokazuje nazwy modeli Anthropic — zachowanie
      drugiego adaptera nie zmienione mimochodem (L-0040).
- [ ] `PLAN.html` i tabela etapów `STATUS.md` planu ROZWOJ_PO_WYDANIU nietknięte (dowód negatywny
      z `git diff`).

## Wynik

**Przeniesiona 2026-09-03 do pełnego planu** [REKOMENDACJA_MODELU](../../../REKOMENDACJA_MODELU/STATUS.md).
Wywiad tego dnia rozszerzył zakres o rzecz, której karta nie przewidywała: lista modeli ma się
**odświeżać** — komendą na żądanie, ze źródłem w dokumentacji dostawcy albo w odpowiedzi człowieka,
plus ciche przypomnienie po progu. To wywróciło pozycję „Poza zakresem: lista jest plikiem
utrzymywanym ręcznie" i przeniosło wątek ponad próg odnogi (8+ plików, kilka decyzji, więcej niż
jedna sesja).

Dwa założenia karty okazały się nieprawdziwe przy sprawdzeniu repozytorium 2026-09-03 i zostały
poprawione w planie: reguła Cursora **nie ma** własnego pytania o model (adapter kopiuje skill
z adaptera Claude Code, więc pytanie jest jedno na oba narzędzia), a walidator **nie ma** gałęzi
sprawdzającej obecność pliku zadeklarowanego w `MANIFEST.adapters` — to osobna poprawka w E4 planu.
Numery linii z sekcji „Zakres" pochodzą z 1.5.x i w planie zostały przeliczone na stan 1.8.1.

`PROMPT_ODNOGA.md` zostaje w repozytorium jako ślad (D-18); nie jest już do wykonania — wykonaniu
podlegają prompty etapowe planu.
