# Aneks D — wyjątek routera dla subagentów `relai-research`

Plan: MODY_OSZCZEDZANIA • Data: 2026-11-13 • Status: **ZAAKCEPTOWANY 2026-11-13** (Łukasz, w trakcie E8)
• Dotyczy: E8 (granica plików AC5 z Aneksu C)

## 1. Co się stało

Specyfikacja (sekcja 6, wiersz „Deep”) wymaga, żeby subagenci trybu deep w `relai-research`
przechodzili przez `relai-model-router` bez jawnego modelu. Router w
`model-router/hooks/judge.ts` (`skipOf`) pomija każdy spawn z `origin.plugin` innym niż `engine`
(„spawned by the mod …: its own choice”). Silnik nadaje spawnowi modu
`origin.plugin = relai-research`, więc deep nigdy nie trafi do sędziego. Sol potwierdził to
reproduktorem na bajtowo identycznej kopii predykatu: 1/2 (routing czerwony, kontrola zielona;
[DOWOD_ROUTING_E8.txt](DOWOD_ROUTING_E8.txt)).

## 2. Decyzja

Wariant A: **wąski wyjątek**. Granica plików E8 rozszerza się o `model-router/hooks/judge.ts`
i testy routera (`model-router/hooks/*.test.ts`):

- `skipOf` przepuszcza spawn z `origin.plugin === 'relai-research'`, który **nie** ma jawnego
  modelu; spawn `relai-research` z jawnym modelem dalej jest pomijany („its own choice”);
- wszystkie pozostałe mody dalej są pomijane;
- regresja najpierw czerwona, potem zielona; mutacja wyjątku (usunięcie go albo poszerzenie na
  dowolny mod) ma czerwienić test;
- `relai-model-router` jest niewydany (0.1.0), więc wersja zostaje bez zmian. Wydanie robi E10.

## 3. Warianty odrzucone

| Wariant | Powód odrzucenia |
|---|---|
| Świadomie odłożone do E9 (deep na modelu czatu) | deep droższy do E9, specyfikacja niespełniona w etapie, który ją realizuje |
| Odnoga z osobną sesją | jedna funkcja i jej test; osobna sesja to większy koszt niż zmiana |

## 4. Ryzyka

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| AD1: wyjątek poszerzy się na inne mody | średni | test kontrolny „inne mody pomijane” + mutacja poszerzenia |
| AD2: na żywo silnik nada inny `origin` niż w atrapie | średni | sonda w E10 (Aneks C), razem z pomiarem `relai-research` |
