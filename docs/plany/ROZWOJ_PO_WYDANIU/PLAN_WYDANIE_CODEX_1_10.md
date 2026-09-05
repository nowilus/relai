# Plan wykonawczy — wydanie RelAI 1.10.0 z pluginem Codex

Status: **ZAAKCEPTOWANY 2026-09-05; W TOKU**
Data: 2026-09-05
Zakres: domknięcie dostępnych bramek E7, przygotowanie dokumentacji i pełne wydanie GitHub wersji 1.10.0.

## Decyzja wejściowa

Użytkownik wybrał:

- domknięcie E7 przed wydaniem;
- pełne wydanie po przygotowaniu kodu, dokumentacji i README;
- brak dostępności Cursor/Claude nie blokuje wydania — brakujące próby pozostają jawnie `NOT TESTED`.

Przyjmuję, że wydawana wersja to **1.10.0**. Wersja 2.0.0 pozostaje granicą E8 zgodnie z Aneksem B
planu `ROZWOJ_PO_WYDANIU`.

## Warianty

| Wariant | Status | Plusy | Minusy |
|---|---|---|---|
| Domknąć dostępne E7, wydać 1.10.0 z jawnymi `NOT TESTED` | **Wybrany** | zgodny z decyzją użytkownika; daje instalowalny plugin Codex bez udawania pełnej macierzy | część gwarancji Cursor/Claude pozostaje niezmierzona |
| Wydać eksperymentalnie teraz | Odrzucony | najszybszy publiczny feedback | narusza bramkę jakości E7 i utrwala niepełną dokumentację |
| Przenieść wszystko do wydania 2.0.0 | Odrzucony | jeden duży moment dystrybucyjny | miesza zakres E7 z E8 i zmienia decyzję z Aneksu B |

## Etapy wdrożenia

1. **Audyt i zamknięcie zakresu E7** — 30–60 min. Uporządkować macierz PASS/FAIL/NOT TESTED,
   powtórzyć dostępne próby Codexa i zweryfikować, że brakujące narzędzia są faktycznie niedostępne.
   Wynik: komplet dowodów E7 bez ukrytych `FAIL`.
2. **Stabilizacja produktu** — 60–120 min. Dokończyć testy wrapperów, instalatora, marketplace,
   routera D-86 i wersji; uruchomić walidator, testy Node oraz diff-check. Wynik: lokalne drzewo
   gotowe do przeglądu.
3. **Dokumentacja wydania** — 60–90 min. Zaktualizować README główne, README adapterów, PRZENOSNOSC,
   ARTEFAKTY, STATE, DZIENNIK, macierz E7 i instrukcję instalacji; wszystkie ograniczenia muszą
   mieć etykietę dowodu i nie mogą obiecywać `NOT TESTED` jako działającego.
4. **Bramka lokalnego wydania** — 30–60 min. Sprawdzić wersje, manifesty, repo-marketplace, świeżą
   instalację z lokalnego źródła, cleanup i czysty zakres zmian. Wynik: raport release candidate.
5. **Commit, tag i GitHub** — 30–60 min. Po końcowym potwierdzeniu użytkownika utworzyć commit
   conventional, tag wersji 1.10.0, push oraz GitHub release z instrukcją Codex. Po publikacji
   sprawdzić instalację z adresu GitHub i treść README.

## Ryzyka i mitygacje

| Poziom | Ryzyko | Mitygacja |
|---|---|---|
| Wysokie | Push/tag/release zmieniają zewnętrzny stan GitHub | najpierw pełny diff, testy i lokalny raport; push dopiero po bramce i potwierdzeniu SHA/tagu |
| Wysokie | Marketplace lub manifest zmieniły kontrakt Codexa | walidator lokalny + `codex plugin marketplace add` + `codex plugin add` z lokalnego źródła |
| Średnie | Rozjazd wersji 1.10.0 między adapterami, README i komendą update | jeden grep po deklaracjach stanu, `validate-adapters.js`, kontrola cache po instalacji |
| Średnie | Hooki są nieufne albo platforma nie ma Node.js | jawny stan zaufania, wrappery fail-closed, osobne `NOT TESTED` dla niezmierzonych platform |
| Niskie | Cudze, niezacommitowane zmiany w obecnym drzewie | nie nadpisywać; przed commitem rozdzielić zmiany użytkownika od zakresu E7/E8 |

## Przypadki brzegowe

- Zastane zmiany spoza pakietu E7 pozostają nietknięte i nie trafiają do commita wydania.
- Istniejący tag `1.10.0` lub rozbieżny remote zatrzymuje publikację; nie nadpisuję tagu.
- Brak autoryzacji GitHub zatrzymuje tylko etap push/release, nie lokalne przygotowanie pakietu.
- Brak Cursor/Claude oznaczam `NOT TESTED`; nie zamieniam tego na `PASS` ani nie tworzę fikcyjnego
  dowodu.
- Instalacja pluginu z repo-root marketplace musi wskazywać root repozytorium, nie ręczną kopię `core/`.
- `AGENTS.md`/`CLAUDE.md` należące do użytkownika są zachowywane bajt w bajt i odtwarzane przy rollbacku.

## Rzeczy wymagające decyzji człowieka

- Akceptacja tego planu wykonawczego.
- Potwierdzenie, że publikujemy **1.10.0**, a nie 2.0.0.
- Końcowa zgoda na commit, tag, push i utworzenie GitHub release po przejściu bramki lokalnej.

Bez akceptacji tego dokumentu nie rozpoczynam kolejnej implementacji ani operacji na GitHubie.
